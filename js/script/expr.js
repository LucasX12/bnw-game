// A tiny, safe expression language for script conditions. Never uses eval.
//   values:    numbers, true, false, "strings", paths like stats.truth or affinity.lenina
//   operators: == != < <= > >= + - and or not ( )
//   helpers:   highest (the club member with the strictly highest affinity, else "")
//              highest_of helmholtz bernard (whichever of the two has more affinity)

export function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push({ k: 'num', v: parseFloat(src.slice(i, j)) });
      i = j; continue;
    }
    if (c === '"' || c === '“' || c === "'") {
      const close = c === '“' ? '”' : c;
      let j = i + 1;
      while (j < src.length && src[j] !== close && !(c === '"' && src[j] === '”')) j++;
      if (j >= src.length) throw new Error('Unclosed quote in expression');
      out.push({ k: 'str', v: src.slice(i + 1, j) });
      i = j + 1; continue;
    }
    const two = src.slice(i, i + 2);
    if (['==', '!=', '<=', '>='].includes(two)) { out.push({ k: 'op', v: two }); i += 2; continue; }
    if ('<>+-()'.includes(c)) { out.push({ k: 'op', v: c }); i++; continue; }
    if (c === '=') throw new Error('Use == to compare, not =');
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_.]/.test(src[j])) j++;
      const w = src.slice(i, j);
      if (w === 'and' || w === 'or' || w === 'not') out.push({ k: 'op', v: w });
      else if (w === 'true' || w === 'false') out.push({ k: 'bool', v: w === 'true' });
      else out.push({ k: 'id', v: w });
      i = j; continue;
    }
    throw new Error(`Unexpected character "${c}"`);
  }
  return out;
}

export function compile(src) {
  const toks = tokenize(String(src));
  if (!toks.length) throw new Error('Empty expression');
  let i = 0;
  const peek = () => toks[i];
  const next = () => toks[i++];
  const isOp = (v) => peek() && peek().k === 'op' && peek().v === v;

  const orExpr = () => { let l = andExpr(); while (isOp('or')) { next(); l = { t: 'or', l, r: andExpr() }; } return l; };
  const andExpr = () => { let l = notExpr(); while (isOp('and')) { next(); l = { t: 'and', l, r: notExpr() }; } return l; };
  const notExpr = () => { if (isOp('not')) { next(); return { t: 'not', e: notExpr() }; } return cmpExpr(); };
  const cmpExpr = () => {
    const l = addExpr();
    const p = peek();
    if (p && p.k === 'op' && ['==', '!=', '<', '<=', '>', '>='].includes(p.v)) { next(); return { t: 'cmp', op: p.v, l, r: addExpr() }; }
    return l;
  };
  const addExpr = () => { let l = unary(); while (isOp('+') || isOp('-')) { const op = next().v; l = { t: 'bin', op, l, r: unary() }; } return l; };
  const unary = () => { if (isOp('-')) { next(); return { t: 'neg', e: unary() }; } return primary(); };
  const primary = () => {
    const tk = next();
    if (!tk) throw new Error('Expression ends too early');
    if (tk.k === 'num' || tk.k === 'str' || tk.k === 'bool') return { t: 'lit', v: tk.v };
    if (tk.k === 'op' && tk.v === '(') {
      const e = orExpr();
      if (!isOp(')')) throw new Error('Missing )');
      next();
      return e;
    }
    if (tk.k === 'id') {
      if (tk.v === 'highest_of') {
        const a = next(); const b = next();
        if (!a || !b || a.k !== 'id' || b.k !== 'id') throw new Error('highest_of needs two character names');
        return { t: 'hof', a: a.v, b: b.v };
      }
      return { t: 'id', v: tk.v };
    }
    throw new Error(`Unexpected "${tk.v}"`);
  };

  const ast = orExpr();
  if (i < toks.length) throw new Error(`Unexpected "${toks[i].v}"`);
  return ast;
}

const num = (v) => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : parseFloat(v) || 0);

export function evaluate(ast, ctx) {
  switch (ast.t) {
    case 'lit': return ast.v;
    case 'id': return ctx.lookup(ast.v);
    case 'hof': return ctx.highestOf(ast.a, ast.b);
    case 'not': return !evaluate(ast.e, ctx);
    case 'neg': return -num(evaluate(ast.e, ctx));
    case 'and': return !!(evaluate(ast.l, ctx) && evaluate(ast.r, ctx));
    case 'or': return !!(evaluate(ast.l, ctx) || evaluate(ast.r, ctx));
    case 'bin': {
      const a = evaluate(ast.l, ctx); const b = evaluate(ast.r, ctx);
      if (ast.op === '+') return typeof a === 'string' || typeof b === 'string' ? `${a}${b}` : num(a) + num(b);
      return num(a) - num(b);
    }
    case 'cmp': {
      const a = evaluate(ast.l, ctx); const b = evaluate(ast.r, ctx);
      switch (ast.op) {
        // eslint-disable-next-line eqeqeq
        case '==': return a == b;
        // eslint-disable-next-line eqeqeq
        case '!=': return a != b;
        case '<': return num(a) < num(b);
        case '<=': return num(a) <= num(b);
        case '>': return num(a) > num(b);
        case '>=': return num(a) >= num(b);
      }
    }
  }
  throw new Error(`Bad expression node ${ast.t}`);
}

// Replaces {path} in text with its value, e.g. "Hello, {name}".
export function interpolate(text, ctx) {
  return String(text).replace(/\{([A-Za-z_][\w.]*)\}/g, (_, path) => {
    const v = ctx.lookup(path);
    return v == null ? '' : String(v);
  });
}
