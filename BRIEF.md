# Everybody's Happy Now: architecture brief

**Project:** a browser visual novel for an English class unit on Aldous Huxley's *Brave New World*.
**Author:** Lucas Xia. **Builder:** Codex, working in the GitHub repo `bnw-game`.
**Hosting:** GitHub Pages, static files only.
**Deadline:** under one week from the start of the build. Scope is the full plan; Controller Mode is cut first if time runs short.

Page numbers below refer to the Harper Perennial edition Lucas is using. They are there so in-game details stay tied to the book; Codex does not need the book.

---

## 1. What this game is

The game looks like a cheerful school-club visual novel, then reveals that it has been conditioning the player the way the World State conditions its citizens.

The player joins a student Writing Circle in the Department of Writing at the College of Emotional Engineering, where Helmholtz Watson lectures (p. 67). In Act 1 they write slogans, make friends and are offered soma. In Act 2 the club members who do not fit are quietly erased from the game itself, including its save menu. In Act 3, Mustapha Mond drops the visual-novel frame, reads the player's own behaviour back to them (soma presses, skipped lines, page refreshes, the hour they are playing) and offers to reset them.

**Why it is a game and not an essay.** A novel can only show Lenina being conditioned. This game conditions the player, then shows them the evidence. Every system below exists to collect that evidence or to tempt the player into producing it. When a design choice is unclear, choose the option that makes the player's own behaviour matter more.

**Who grades it.** Dr. Nurenberg will play it once, probably on a school laptop, probably in one sitting. The game must load fast, never crash, never soft-lock, and reach an ending in 20 to 30 minutes.

---

## 2. Fixed decisions

| Area | Decision |
| --- | --- |
| Title | *Everybody's Happy Now* (p. 74) |
| Genre | Visual novel with a slogan-writing minigame, meta horror, slow-burn dread |
| Length | 20 to 30 minutes per playthrough; 8,000 to 12,000 words of script across all routes |
| Stack | Plain HTML, CSS, JavaScript ES modules. No build, no dependencies |
| Stage | Fixed 1280 x 720 logical stage, scaled to fit the window with letterboxing |
| Platforms | Laptop browsers (Chrome, Edge, Safari, Firefox). Phones see a gate screen |
| Script | Screenplay-style text files written by Lucas (section 5) |
| Saves | Autosave at every scene start plus 3 manual slots, in `localStorage` |
| Meta tricks in v1 | Refresh detection, skip-mash warning, Records deletion, tab title + clock |
| Art | Flat 1930s Art Deco, generated in ChatGPT, delivered as one zip (section 10) |
| Sprites | Waist-up, transparent PNG, 5 expressions for each club member, 3 for Mond |
| Audio | ElevenLabs: music, sound effects, and voices for The Voice and Mond only |
| Relationships | Satirised. The World State pushes casual pairing as a social duty; the game treats it as hollow. Nothing explicit |
| Content warning | Plain, on first launch (section 9.4) |
| Cut first | Controller Mode |

---

## 3. Story logic the engine must support

Lucas writes all the words. This section describes only the structure the engine needs: acts, scenes, states and endings.

### 3.1 Structure

| Act | In-game days | Scenes (ids are suggestions; Lucas may rename) | Engine features used |
| --- | --- | --- | --- |
| Content warning, name entry | | `boot_warning`, `boot_name` | Warning screen, name input, caste form |
| Act 1: Everybody's Happy Now | 1 to 3 | `a1_waking`, `a1_join`, `a1_slogan1`, `a1_soma_intro`, `a1_slogan2`, `a1_community_sing`, `a1_glitch_mother` | Dialogue, choices, slogan builder, soma button appears on day 2, first shock word on day 3, first small glitches |
| Night interlude 1 | night 3 | `n1_lenina` | Interlude mode as Lenina: pleasant |
| Act 2: Correction | 4 to 5 | `a2_john_arrives`, `a2_slogan3`, `a2_poem`, `a2_helmholtz_gone`, `a2_bernard_panics`, `a2_soma_turns`, `a2_john_soma` | Desaturation, Records deletion, soma auto-press, music detune, soma removed for one scene |
| Night interludes 2 and 3 | nights 4 and 5 | `n2_helmholtz`, `n3_bernard` | Interlude mode as Helmholtz (restless), then Bernard (anxious) |
| Hidden ending check | end of day 5 | | Condition check (3.2) |
| Act 3: The Controller | 6 | `a3_empty_room`, `a3_mond`, `a3_offer` | Office background, then terminal mode, stats readout, voiced Mond, final choice |
| Endings | | `end_stability`, `end_island`, `end_unhappy`, `end_citizen` | Ending screens, global unlocks |
| Controller Mode (cut first) | post-game | `cm_file` | Dossier screen |

**Key beats the engine must make possible:**

- **Day 2:** soma is offered for the first time and the soma button appears.
- **Day 3:** a word the player never picked ("mother") appears inside their submitted slogan. Lenina is visibly uncomfortable at the word, as in the book (p. 118).
- **Act 2, Helmholtz's poem:** Helmholtz reads a real poem about solitude (pp. 181 to 182). Lucas writes the poem.
- **Act 2, Helmholtz is gone:** `delete helmholtz` runs. His sprite is gone, his Records entry reads *Transferred*, and earlier saves become unloadable.
- **Act 2, Bernard:** if Bernard has the highest affinity, he is deleted next. If not, he survives by turning on John. He is first threatened with Iceland (p. 98).
- **Act 2, John:** John throws out the club's soma (p. 213). The soma button disappears for that one scene.
- **Act 3, Mond:** Mond reads the player's stats aloud, makes his case for stability over truth (pp. 220 to 228), then offers a reset.
- **John's exit:** he leaves for the lighthouse (p. 243), offscreen. Nothing beyond that is shown or described.

### 3.2 Endings and conditions

| Ending | How it triggers | What the engine does |
| --- | --- | --- |
| **Perfect Citizen** (hidden) | At the end of day 5: `affinity.lenina >= 8` and `stats.truth == 0` and `stats.shockUsed == 0` | Skips Act 3 entirely. Cheerful credits. Records `end_citizen` |
| **Stability** | In Act 3, the player chooses "Accept the reset", or chooses "I claim the right to be unhappy" with `stats.somaAct3 > 0` (Mond says they don't mean it) | Ending screen, then sets `global.resetSeen = true`, which changes the title screen permanently (section 9.2) |
| **Island** | In Act 3, the player chooses "Send me to an island". Only enabled when `stats.truth >= 3`; otherwise shown disabled with the caption "Truth too low" | Ending screen. Epilogue with whichever of Helmholtz or Bernard has the higher affinity (`highest_of helmholtz bernard`) |
| **The Right to Be Unhappy** (true ending) | In Act 3, the player chooses "I claim the right to be unhappy" with `stats.somaAct3 == 0` | Final scene runs with no music, skip disabled, auto disabled, soma button hidden. Ends on the lighthouse background |

All endings set `global.endingsSeen[<id>] = true` and unlock Controller Mode if it is built.

The thresholds (8 and 3) live in `data/tuning.json`, not in code, so Lucas can adjust them after playtesting.

### 3.3 Script budget for Lucas

Guidance only. Codex creates placeholder scenes sized roughly to this.

| Part | Words |
| --- | --- |
| Act 1 | 3,000 to 4,000 |
| Night interludes (3) | 300 to 450 each |
| Act 2 | 3,000 to 4,000 |
| Act 3 | 1,200 to 1,800 |
| Endings (4) | 250 to 400 each |
| Slogan word decks | about 15 words per session, 5 sessions |

---

## 4. Architecture

### 4.1 Folder layout

```
bnw-game/
  index.html            entry point; loads js/main.js as a module
  tests.html            in-browser test runner (section 12)
  .nojekyll
  AGENTS.md  BRIEF.md  ASSETS.md  CHANGELOG.md  README.md
  css/
    base.css            reset, fonts, stage scaling, letterbox
    ui.css              dialogue box, menus, buttons, records, settings
    fx.css              keyframes: shake, drain, haze, pulse, fades
    acts.css            per-act theme classes (.act-1, .act-2, .act-3, .interlude)
  js/
    main.js             boot sequence (4.4)
    bus.js              tiny event bus
    store.js            game state, global state, persistence
    script/
      parser.js         text script -> scene graph, with line numbers
      runner.js         steps through the graph, executes commands
      expr.js           safe condition evaluator and {interpolation}
    stage/
      stage.js          scaling, layer management
      backgrounds.js    background layer, crossfades, drained variants
      sprites.js        character layer: show, hide, move, expression, drain
      fx.js             canvas effects: glitch, static, noise, scanlines
    ui/
      dialogue.js       textbox, typewriter, name tags, advance indicator
      choices.js        choice menu, including disabled options
      quickmenu.js      Auto, Skip, Log, Save, Records, Settings
      log.js            backlog of the last 200 lines
      menus.js          title, pause menu, save/load slots
      records.js        Citizen Records screen
      settings.js       settings screen
      soma.js           soma button and auto-dose countdown
      slogan.js         slogan builder screen
      terminal.js       Act 3 terminal mode
      interlude.js      night interlude mode
      endings.js        ending screens, credits
      controller.js     Controller Mode (cut first)
      gate.js           content warning, phone gate, audio unlock
    audio/
      audio.js          music, sfx and voice channels; detune; ducking
      whisper.js        speechSynthesis whispers for player-written slogans
    meta/
      refresh.js        refresh detection
      skipmash.js       skip-mash detection
      tabtitle.js       document.title tricks
      clock.js          local time helpers
    assets.js           manifest loader, preloading, placeholders
    debug.js            ?debug=1 panel and script error overlay
  script/
    index.json          ordered list of script files
    _demo.txt           Codex-written test script using every command, placeholder text only
    act1.txt  act2.txt  act3.txt  interludes.txt  endings.txt   (Lucas)
  data/
    characters.json     ids, display names, castes, tag colours, sprite scale
    decks.json          slogan builder word decks per session
    tuning.json         thresholds and timings
  assets/
    manifest.json       every asset id -> file path (section 10)
    characters/  backgrounds/  ui/  audio/music/  audio/sfx/  audio/voice/
```

### 4.2 Module rules

- Every module exports plain functions or one small class. No globals except `window.__ehnDebug` when `?debug=1`.
- Modules talk through `bus.js` events (4.5) or direct imports. No module reads another module's DOM.
- `store.js` is the only module that writes to `localStorage` or `sessionStorage`.
- `runner.js` is the only module that advances the story.
- UI modules render into containers under `#ui` and clean up after themselves.

### 4.3 Rendering layers and stage scaling

`index.html` contains one `#stage` element, 1280 x 720 logical pixels, centred in the window and scaled with `transform: scale(s)` where `s = min(innerWidth / 1280, innerHeight / 720)`. Recalculate on resize. Letterbox colour is `#0E0E0F`.

Layers inside `#stage`, back to front:

| Layer | Element | Contents |
| --- | --- | --- |
| 1 | `#bg` | Two stacked `<img>` for crossfades |
| 2 | `#sprites` | One `<img>` per visible character, absolutely positioned |
| 3 | `#fx` | One `<canvas>` 1280 x 720 for glitch, static, noise and scanlines; transparent when idle |
| 4 | `#ui` | Dialogue box, quick menu, soma button, menus, overlays |
| 5 | `#flash` | Full-stage `<div>` for colour flashes; respects the reduce-flashing setting |

Act theming is a class on `#stage` (`act-1`, `act-2`, `act-3`, `interlude`), plus a CSS custom property `--drain` (0 to 1) that drives `filter: saturate(calc(1 - var(--drain)))` on `#bg` and `#sprites` only. The soma button is never desaturated: it keeps its colour in every act, including Act 3, where it is the only coloured thing on screen.

### 4.4 Boot sequence

1. `main.js` checks the phone gate (9.3). If it fails, show the gate and stop.
2. Load `assets/manifest.json`, `data/*.json` and `script/index.json`, then fetch and parse every script file. On a parse error, show the debug overlay with file and line (even without `?debug`), and stop.
3. Load `global` state. Run refresh detection (8.8).
4. First launch only: show the content warning (9.4). Its button counts as the user gesture that unlocks audio.
5. Show the title screen (a variant if `global.resetSeen`).
6. New Game: name entry, then `runner.start('boot_name')` or the first scene in `index.json`. Continue: load the autosave.

Preload in the background: the next scene's backgrounds, sprites and music. Never block on audio.

### 4.5 Events on the bus

| Event | Payload | Fired by |
| --- | --- | --- |
| `line:shown` | `{speaker, text, sceneId, lineNo}` | runner |
| `line:skipped` | `{count}` | runner (skip mode) |
| `choice:made` | `{label, effects}` | choices |
| `scene:start` | `{sceneId, tags}` | runner |
| `soma:pressed` | `{auto: bool}` | soma |
| `slogan:submitted` | `{words, catchiness, tags, shockUsed}` | slogan |
| `record:deleted` | `{charId}` | runner |
| `act:changed` | `{act}` | runner |
| `ending:reached` | `{id}` | endings |
| `settings:changed` | `{key, value}` | settings |

---

## 5. Script format

Lucas writes the story in plain text files that read like a screenplay. The format has to be forgiving to type and strict to parse: every error names the file and line.

### 5.1 Files and order

`script/index.json` lists the files in reading order:

```json
{ "files": ["act1.txt", "interludes.txt", "act2.txt", "act3.txt", "endings.txt"], "start": "boot_name" }
```

Scene ids and labels are global across all files and must be unique.

### 5.2 Line types

The parser looks at the first non-space characters of each line.

| Line starts with | Type | Example |
| --- | --- | --- |
| `#` | Comment, ignored | `# Lenina recruits you` |
| `@scene` | New scene | `@scene a1_join act1 day1` |
| `label` | Jump target inside a scene | `label sit_lenina` |
| a known command word | Command (5.3) | `show lenina happy center` |
| `<speaker> [expression]:` then a quoted string | Dialogue | `lenina happy: "There you are!"` |
| a quoted string | Narration | `"The room smells of verbena."` |
| `choice` ... `end` | Choice block | see below |

**Speakers** are character ids from `data/characters.json`: `lenina`, `bernard`, `helmholtz`, `john`, `mond`, `you` (shows the player's entered name), `voice` (The Voice: whisper style, no name tag), plus any extra ids Lucas adds.

**Dialogue with an expression** changes the sprite before the line shows: `bernard worried: "You don't think they'd send me to Iceland?"`

**Trailing tags** in square brackets at the end of a dialogue or narration line:

| Tag | Meaning |
| --- | --- |
| `[vo mond_003]` | Play voice file id `mond_003` with this line |
| `[sad]` | Marks the line as sad: the soma auto-dose can fire on it (8.6) |
| `[noskip]` | Skip mode stops here |
| `[corrupt 0.3]` | Typewriter corrupts about 30% of characters for 600 ms, then resolves |

**Choice blocks:**

```
choice
  "Sit next to Lenina" -> sit_lenina [+lenina 1]
  "Sit next to Helmholtz" -> sit_helmholtz [+helmholtz 1]
  "Send me to an island" -> island [if stats.truth >= 3] [disabled "Truth too low"]
end
```

Each option: quoted text, `->`, a target label or scene id, then optional brackets. `[+id n]` adds affinity; `[set flag.x true]` sets a flag; `[if expr]` hides the option when false, unless `[disabled "caption"]` is present, in which case it shows greyed out with the caption.

**Interpolation** inside any quoted text: `{name}` for the player's name, `{stats.soma}` and the other stats, `{slogan.last}` for the most recent slogan, `{clock.time}` for the local time as "1:12 a.m.", `{clock.hourWords}` for "past one in the morning".

### 5.3 Command table

| Command | Arguments | Effect |
| --- | --- | --- |
| `@scene` | `<id> [tags...]` | Starts a scene. Tags: `act1` `act2` `act3` `interlude` `day<n>` `sad` `nosoma` `noskip` `island` (erased characters may appear: they are on the island). The runner autosaves at every scene start |
| `label` | `<name>` | Jump target |
| `jump` | `<label or scene>` | Go there |
| `if` | `<expr> -> <target>` | Conditional jump |
| `set` | `<path> <value or expr>` | `set flag.met_john true`, `set stats.truth stats.truth + 1` |
| `add` | `<path> <n>` | Shorthand for incrementing a number, e.g. `add affinity.bernard 2` |
| `bg` | `<id> [fade|cut|drain] [ms]` | Change background. `drain` crossfades to the drained variant if one exists |
| `show` | `<char> <expr> [left|center|right|far-left|far-right]` | Show or update a sprite. Default position: `center` |
| `hide` | `<char> [fade|cut]` | Remove a sprite |
| `move` | `<char> <position> [ms]` | Slide a sprite |
| `music` | `<id> [fade ms]` or `stop [fade ms]` | Change music |
| `detune` | `<0..1> [ms]` | Pitch drift and wobble on the music (8.9) |
| `sfx` | `<id>` | Play a sound effect |
| `act` | `<1|2|3>` | Sets the act class and default drain: act 1 = 0, act 2 = 0.35, act 3 = 1 |
| `drain` | `<0..1> [ms]` | Set `--drain` directly |
| `effect` | `shake [ms]`, `glitch <0..1> [ms]`, `flash <colour> [ms]`, `static [ms]`, `haze [ms]` | One-off visual effects (8.10) |
| `soma` | `hidden|on|auto|off|act3` | Soma button state (8.6) |
| `somaskip` | `<target>` | Where pressing soma sends the player from this point. Default: the next scene |
| `slogan` | `<deckId>` | Opens the slogan builder with that deck. Afterwards `slogan.last`, `slogan.catchiness`, `slogan.hasTruth`, `slogan.hasShock` are readable |
| `inject` | `<word>` | Inserts a word the player did not choose into their last submitted slogan, shown with a glitch (the day 3 "mother" beat) |
| `whisper` | `slogan` or `slogan <n>` | The Voice whispers one of the player's own slogans through speech synthesis (8.9) |
| `delete` | `<charId>` | Records deletion (8.7) |
| `review` | `<charId>` | Sets that character's record to *Under review* |
| `interlude` | `<charId>` / `endinterlude` | Enter or leave night interlude mode (8.12) |
| `terminal` | `on|off` | Act 3 terminal mode (8.11) |
| `stats` | `show|hide` | Shows the Act 3 "Your file" panel |
| `title` | `"text"` or `reset` | Override `document.title` |
| `wait` | `<seconds>` | Pause, no input |
| `skip` | `on|off` | Allow or forbid skip and auto |
| `ending` | `<id>` | Run the ending (8.11, 3.2) |
| `checkpoint` | none | Force an autosave mid-scene |
| `day` | `<n>` | Set the in-game day directly |

### 5.4 Expressions

A tiny safe evaluator in `expr.js`. Never use `eval` or `new Function`.

- Values: numbers, `true`, `false`, quoted strings, paths (`stats.truth`, `affinity.lenina`, `flag.met_john`, `global.resetSeen`, `records.bernard`, `tuning.islandTruth`, `clock.late`, `slogan.catchiness`, `slogan.count`, `slogan.1`).
- Operators: `== != < <= > >= + - and or not`, parentheses.
- Helpers: `highest == bernard` is true when Bernard's affinity is strictly the highest of the four club members; `highest_of helmholtz bernard` returns the id with the higher affinity (ties go to the first listed).
- Unknown paths evaluate to `0` or `false` and log a warning in debug mode.

### 5.5 Example (placeholder text, which is how Codex writes it)

```
@scene a1_join act1 day1
act 1
bg classroom_bright fade 600
music act1_loop fade 1200
show lenina happy center
lenina happy: "[[TODO Lucas: Lenina greets you as the new Beta-Plus]]"
you: "[[TODO Lucas: your reply]]"
choice
  "[[TODO Lucas: friendly option]]" -> join_friendly [+lenina 1]
  "[[TODO Lucas: guarded option]]" -> join_guarded [+bernard 1]
end
label join_friendly
lenina happy: "[[TODO Lucas: delighted response]]"
jump a1_slogan1
label join_guarded
show bernard neutral right
bernard worried: "[[TODO Lucas: Bernard notices you hesitate]]" [sad]
jump a1_slogan1
```

### 5.6 Parser requirements

- Output: a map of scene ids to arrays of nodes, each node carrying `{file, line}`.
- Collect all errors in one pass and report them together: unknown command, unknown character or expression (checked against `characters.json` and `manifest.json`), unknown jump target, duplicate label, unterminated choice block, bad expression, unclosed quote.
- Accept straight and curly quotes. Accept tabs or spaces for indentation. Ignore blank lines.
- Warn, don't fail, on missing assets: the placeholder will show.
- In debug mode, count `[[TODO` placeholders and show the total in the debug panel, so Lucas can see how much script is left.

---

## 6. Game state

### 6.1 Save state (one per slot)

```json
{
  "v": 1,
  "savedAt": "2026-11-12T19:04:00Z",
  "player": { "name": "Lucas", "caste": "Beta-Plus" },
  "pos": { "scene": "a2_poem", "node": 14 },
  "act": 2, "day": 4, "drain": 0.35,
  "stage": { "bg": "classroom_drained", "sprites": [{ "id": "helmholtz", "expr": "neutral", "pos": "center" }], "music": "act2_loop", "detune": 0.2 },
  "stats": { "soma": 6, "somaAct3": 0, "somaAuto": 2, "skips": 140, "refreshes": 1, "shockOffered": 4, "shockUsed": 1, "truth": 2, "slogans": 3, "catchinessTotal": 211 },
  "affinity": { "lenina": 5, "bernard": 3, "helmholtz": 4, "john": 1 },
  "flags": { "met_john": true },
  "slogans": [{ "day": 1, "words": ["ending", "is", "better", "than", "mending"], "catchiness": 92, "tags": ["comfort"], "injected": null }],
  "soma": "auto",
  "somaskip": null,
  "log": []
}
```

Restoring a save rebuilds the stage from `stage`, then resumes at `pos`. The log is not saved.

### 6.2 Global state (one per browser, survives every save and load)

```json
{
  "v": 1,
  "warningSeen": true,
  "records": { "lenina": "active", "bernard": "review", "helmholtz": "transferred", "john": "visiting", "you": "active" },
  "deletionDay": 4,
  "endingsSeen": { "end_stability": true },
  "resetSeen": true,
  "totalRefreshes": 3,
  "settings": { "textSpeed": 40, "music": 0.7, "sfx": 0.8, "voice": 0.9, "skipMode": "read", "reduceMotion": false },
  "readLines": { "a1_join:12": true }
}
```

Keys: `ehn.global`, `ehn.auto`, `ehn.slot1`, `ehn.slot2`, `ehn.slot3`. Session key for refresh detection: `ehn.session` in `sessionStorage`.

**Global records are the point.** Once Helmholtz is deleted, he stays deleted in this browser even if the player loads an older save. That is what makes "History is bunk" bite.

**Clearing browser data** brings everyone back. If the engine finds saves but no `ehn.global`, it sets `flag.mended = true` on load so Lucas can have Mond comment on it.

---

## 7. Data files

### 7.1 `data/characters.json`

```json
{
  "lenina":    { "name": "Lenina",    "caste": "Beta",        "tag": "#7A3558", "scale": 1.00, "expressions": ["neutral", "happy", "worried", "upset", "special"] },
  "bernard":   { "name": "Bernard",   "caste": "Alpha-Plus",  "tag": "#7E8189", "scale": 0.93, "expressions": ["neutral", "happy", "worried", "upset", "special"] },
  "helmholtz": { "name": "Helmholtz", "caste": "Alpha-Plus",  "tag": "#7E8189", "scale": 1.04, "expressions": ["neutral", "happy", "worried", "upset", "special"] },
  "john":      { "name": "John",      "caste": "Unclassified","tag": "#8A6A45", "scale": 1.00, "expressions": ["neutral", "happy", "worried", "upset", "special"] },
  "mond":      { "name": "Mond",      "caste": "Controller",  "tag": "#2B2A33", "scale": 1.00, "expressions": ["neutral", "smile", "cold"] },
  "you":       { "name": "{name}",    "caste": "Beta-Plus",   "tag": "#7A3558", "sprite": false },
  "voice":     { "name": "",          "caste": "",            "tag": null,      "sprite": false, "style": "whisper" }
}
```

`scale` makes Bernard visibly shorter: he is eight centimetres under Alpha height (p. 64). `special` means: Lenina's too-wide, too-still smile; Bernard's desperate eager grin; Helmholtz's erased frame; John reciting with eyes closed.

Name tag colours follow the caste colours in the book: Alphas wear grey, Gammas green, Deltas khaki (p. 27), Beta-Minuses mulberry (p. 63).

### 7.2 `data/decks.json`

```json
{
  "day1": {
    "prompt": "[[TODO Lucas: session prompt]]",
    "minWords": 3, "maxWords": 7,
    "tiles": [
      { "w": "ending",  "syl": 2, "rhyme": "ending", "tags": ["comfort"] },
      { "w": "mending", "syl": 2, "rhyme": "ending", "tags": ["comfort"] },
      { "w": "alone",   "syl": 2, "rhyme": "one",    "tags": ["truth"], "shock": true }
    ]
  }
}
```

Tags: `comfort` (Lenina), `status` (Bernard), `truth` (Helmholtz), `shakespeare` (John, Act 2 only). Lucas writes the decks; Codex ships a placeholder deck with about 15 tiles per session for five sessions: `day1`, `day2`, `day3`, `day4`, `day5`.

### 7.3 `data/tuning.json`

```json
{
  "citizenLenina": 8, "islandTruth": 3,
  "autoDoseSeconds": 2.0,
  "skipMash": { "advances": 8, "windowMs": 2000, "holdMs": 10000, "cooldownMs": 30000 },
  "catchiness": { "rhythmTarget": [6, 10], "rhythmMax": 40, "rhymePair": 30, "rhymeMax": 60, "repeat": 10, "comfort": 5, "truth": -15, "shock": -40 },
  "typewriterCps": 40,
  "lateNight": [0, 5]
}
```

---

## 8. Systems

### 8.1 Dialogue runner and text box

- Typewriter at `settings.textSpeed` characters per second. Click, Space or Enter completes the line instantly. A second press advances.
- Name tag: pill in the speaker's caste colour with the caste in small caps beside the name. `voice` lines have no box: centred italic text with a soft breathing animation, over a dimmed stage.
- Advance indicator: a small triangle in the speaker's colour, bottom right, gently bobbing.
- **Auto mode:** advances after the line finishes plus `0.8 s + 0.03 s per character`.
- **Skip mode:** in `read` mode, skips only lines in `global.readLines`. In `all` mode, skips everything. Stops at choices, slogan sessions, `[noskip]` lines and `skip off` sections. Every skipped line adds 1 to `stats.skips`.
- **Log:** last 200 lines, scrollable overlay, opened with L or the quick menu.
- Keyboard: Space or Enter advances; hold Ctrl to skip; A toggles auto; L opens the log; Esc opens the pause menu. **Soma has no hotkey.** The player has to reach for it.

### 8.2 Sprites and backgrounds

- Positions (centre x on the 1280 stage): `far-left 200`, `left 360`, `center 640`, `right 920`, `far-right 1080`. Sprites are bottom-anchored to the stage; height = 640 px x `scale`.
- `show` on a visible character swaps the expression with a 150 ms crossfade. A new character fades in over 300 ms with an 8 px rise.
- The speaking character sits at full brightness; others dim to `brightness(0.85)`.
- Background crossfade default 500 ms. `drain` crossfades to `<id>_drained` when the manifest has one.
- **Deletion drain (8.7):** over 1.6 s the sprite goes grey, then dissolves through canvas pixel noise.

### 8.3 Slogan builder

Opened by `slogan <deckId>`. Layout as in the mockup: header, a slot row of up to 7 slots, the Catchiness meter, the tile tray, a "Circle reacts" column with small portraits, and Clear and Submit buttons.

- Click a tile to place it in the next empty slot; click a placed tile to return it. Drag to reorder.
- Submit is enabled between `minWords` and `maxWords`.
- **Catchiness (0 to 100), recalculated live:**
  - Rhythm: total syllables inside `rhythmTarget` gives `rhythmMax`, scaled down linearly outside it.
  - Rhyme: each pair of placed words sharing a `rhyme` key adds `rhymePair`, up to `rhymeMax`.
  - Repetition: each word used twice adds `repeat`.
  - Each `comfort` word adds `comfort`; each `truth` word adds `truth` (a negative number).
  - Each shock word adds `shock` (a negative number). Clamp to 0..100.
- **Hidden effects on submit:** each tagged word adds 1 affinity to its owner (`comfort` to Lenina, `status` to Bernard, `truth` to Helmholtz, `shakespeare` to John). Each truth word adds 1 to `stats.truth`. Stored in `slogans[]`.
- The reaction column shows each present club member's portrait. Their reaction lines come from Lucas's script after the session, branching on `slogan.*`, not from the builder.
- In Act 2, John's tiles are all `shakespeare` tiles and always score 0 Catchiness for him.

### 8.4 Shock words

- Tiles with `"shock": true` are offered from day 2. Count each offered tile in `stats.shockOffered`.
- Placing one triggers, at once and without explanation: a 250 ms stage shake, a red vignette flash (`#C23B3B`, 180 ms), the `shock` sound effect, the tile turning red and jittering, and the meter dropping. Increment `stats.shockUsed` when the slogan is submitted with it.
- Nothing in the UI ever explains this. Most players should stop choosing those words by day 3, which is the neo-Pavlovian nursery from the book (p. 21) run on the player.
- With reduce motion on: no shake or flash, just the sound and the red tile.

### 8.5 Affinity

Four integers, starting at 0. Raised by choice brackets, `add`, and slogan tags. Never displayed. Used by `highest`, by endings, and in Act 2 to decide whether Bernard is deleted.

### 8.6 The soma button

The design centrepiece. A round button, 116 px across (84 px in Act 3), soma-red `#C4553A` with a gold `#C9A24A` ring, labelled SOMA over "½ gramme" ("half a gramme for a half-holiday", p. 55). It sits on the right side of the stage above the dialogue box.

| State | Behaviour |
| --- | --- |
| `hidden` | Not shown (day 1) |
| `on` | Visible with a slow, inviting pulse. Pressing it: `soma:pressed`, `stats.soma += 1`, play the `soma` sound, a 900 ms warm haze (`effect haze`), the music brightens for 10 s, then jump to the `somaskip` target, or the next scene if none is set |
| `auto` | As `on`, plus: when a line tagged `[sad]` (or any line in a scene tagged `sad`) finishes typing, a pill appears under the button reading "AUTO-DOSE IN 2" with a "No" button, counting down `autoDoseSeconds`. If not cancelled, the button presses itself (`stats.somaAuto += 1` as well as `stats.soma`). Each "No" click is counted in `flags.refusedDoses` |
| `off` | Removed with a brief gap where it was. For John's scene. Lines in this state can't be skipped |
| `act3` | Smaller, bottom right, the only coloured element on a greyscale screen, captioned "still here". Presses count in `stats.somaAct3` as well |

The button is never desaturated by `--drain`.

### 8.7 Citizen Records and deletion

- The Records screen (quick menu "RECORDS", or the title's "Citizen records") lists every club member and the player with a status dot and caste. Header "CITIZEN RECORDS" and motto "COMMUNITY · IDENTITY · STABILITY" (p. 7).
- `delete <id>`:
  1. Drain and dissolve the sprite if visible.
  2. Set `global.records[id] = "transferred"` and `global.deletionDay = day`.
  3. Play the `delete` sound and a 300 ms glitch.
  4. From now on, `show <id>` does nothing (and warns in debug), and any dialogue lines for that speaker are skipped silently.
  5. In the Records screen the entry is greyed and struck through, status *Transferred*.
- **Save locking:** every deletion adds 1 to `global.deletionCount`, and every save records the count when it was made. Any slot (or autosave) made before a deletion shows greyed out. Its Load button is disabled and captioned "History is bunk." (p. 34).
- `review <id>` sets status *Under review*, with an amber dot.

### 8.8 Meta tricks

**Refresh detection** (`meta/refresh.js`)
- At every scene start, write `ehn.session = {scene, sad: bool, t}` to `sessionStorage`.
- On boot, if `performance.getEntriesByType('navigation')[0].type === 'reload'` and `ehn.session` exists:
  - Add 1 to `global.totalRefreshes` and to the current save's `stats.refreshes`.
  - Show a 2.5 s interstitial over the cream background: "Ending is better than mending." (p. 49), centred in the display face.
  - Then resume from the autosave. If the interrupted scene was tagged `sad` and has a label named `<sceneId>_mended` (for example `a2_helmholtz_gone_mended`), resume at that label instead. Lucas can write a shorter, happier version of sad scenes there.
- Never trigger on the very first load, or on the title screen.

**Skip-mash warning** (`meta/skipmash.js`)
- Triggers when the player advances `advances` times within `windowMs`, or holds skip for `holdMs`, at most once per `cooldownMs`.
- Effect: a toast in the dialogue area reading "A gramme is better than a damn." (p. 55), and the soma button glows brighter for 4 s, if it is visible.

**Tab title and clock** (`meta/tabtitle.js`, `meta/clock.js`)
- Default title: "Everybody's Happy Now".
- When the tab is hidden: Act 1 and 2 set "COMMUNITY · IDENTITY · STABILITY". Act 3 sets the player's name.
- When the tab becomes visible again, wait 1 s, then restore. In Act 2, restore to "Everybody's happy now?" instead.
- `clock.late` is true between `lateNight[0]` and `lateNight[1]` local hours. `clock.time` and `clock.hourWords` are available for interpolation, so Mond can comment on the hour.

### 8.9 Audio

- Three channels: music (looping, crossfades), sfx (one-shots, polyphonic), voice (one at a time; ducks music to 40% while playing).
- Use Web Audio (`AudioContext` with `AudioBufferSourceNode`) so music can be **detuned**: `detune <x>` sets a slow random pitch drift of up to `x * 60` cents plus a low-pass filter dropping from 20 kHz to `20 kHz - x * 16 kHz`. Act 2 uses 0.2 to 0.6.
- Audio unlocks on the first user gesture (the content warning button). Before that, queue music silently.
- Missing audio files are silent placeholders. Never throw.
- **Whispers** (`audio/whisper.js`): `whisper slogan` reads one of the player's own slogans with `speechSynthesis`: rate 0.75, pitch 0.6, the softest available English voice, under a `breath` sfx bed, while the words appear as `voice` text. If speech synthesis is unavailable, show the text only. This is how the player's own words become their conditioning (p. 47).
- Mond and The Voice use pre-recorded ElevenLabs files via `[vo id]` tags. Dynamic text, such as stats, stays unvoiced and types out with the `type` sfx.

### 8.10 Visual effects

| Effect | Implementation |
| --- | --- |
| `shake` | CSS keyframes on `#stage`, 6 px amplitude |
| `glitch <i>` | On `#fx`, draw horizontal slices of the current background and sprite images, offset by up to `i * 40` px, plus RGB-split bars and a few solid colour blocks, at about 20 fps |
| `static` | Canvas noise at 30% opacity |
| `flash <colour>` | `#flash` fades in and out |
| `haze` | Warm radial blur pulse: CSS backdrop-filter on an overlay; plain opacity overlay on browsers without support |
| `drain` | Changes `--drain` over time |
| `corrupt` | Typewriter replaces random characters with block glyphs, then resolves |

With `reduceMotion` on: no `shake`, `flash` becomes a 30% tint with no strobe, `glitch` caps at `i = 0.2` and 8 fps.

### 8.11 Act 3 terminal mode and endings

- `terminal on`: hide the dialogue box, sprites and quick menu. Black stage (`#0E0E0F`), IBM Plex Mono, white text typed out line by line on the left, with a block cursor. A header line in small grey type reads "MOND, Mustapha · Resident Controller for Western Europe".
- `stats show`: a bordered "YOUR FILE" panel on the right with soma presses, lines skipped, page refreshes, shock words avoided ("5 of 6", computed as offered minus used, out of offered), Truth (Low below 3, otherwise High), and local time.
- The final choice renders as three square-cornered buttons along the bottom, as in the mockup.
- `ending <id>`: fade to the ending's background, run the rest of the script, then show an ending card (the ending name in the display face plus the line "Ending reached"), then credits, then the title screen.
- Credits are a simple scroll: the title, "A game by Lucas Xia", "Based on *Brave New World* by Aldous Huxley (1932)", tool credits, and "Made for Dr. Nurenberg's class". They live in `data/credits.json` so Lucas can edit them.

### 8.12 Night interludes

- `interlude <charId>`: deep blue stage (`#1B2340`), no soma button, no quick menu except Log. The named character's sprite is shown dimmed at the left. Text appears in their tag colour, without a box, as interior monologue. The Voice whispers between lines.
- Pleasant for Lenina, restless for Helmholtz, anxious for Bernard. That difference is the script's job; the engine only gives the mode a per-character accent colour.
- `endinterlude` returns to normal mode.

### 8.13 Controller Mode (cut first)

- Unlocked after any ending. A new title-screen entry, "Controller Mode".
- The screen is a 1930s dossier: the player's name, caste, every stat, every slogan they wrote, the endings reached. Mond's annotations come from script scene `cm_file`.
- Two buttons: "Recondition" (wipes all saves and global state after a confirm dialogue, then reloads) and "Close the file".
- If cut, remove the menu entry, leave the module stubbed, and note it in `CHANGELOG.md`.

---

## 9. Screens and UI

### 9.1 Style tokens

| Token | Value | Use |
| --- | --- | --- |
| `--cream` | `#F4EDDC` | Main background, Act 1 |
| `--paper` | `#FBF7EE` | Dialogue box, cards |
| `--mint` | `#CFE6D8` | Walls, tips |
| `--mint-line` | `#8CC7AE` | Deco rings |
| `--gold` | `#C9A24A` | Deco lines, borders, soma ring |
| `--coral` | `#E07A5F` | Accents |
| `--soma` | `#C4553A` | Soma button |
| `--ink` | `#2B2A33` | Text |
| `--ink-2` | `#4A4852` | Secondary text |
| `--mulberry` | `#7A3558` | Beta: player, Lenina, primary buttons |
| `--alpha` | `#7E8189` | Alpha name tags |
| `--shock` | `#C23B3B` | Shock words, warnings |
| `--night` | `#1B2340` | Interludes |
| `--void` | `#0E0E0F` | Act 3, letterbox |

**Fonts** (Google Fonts): Poiret One for display titles; Josefin Sans (400, 600, 700) for UI and dialogue; IBM Plex Mono (400, 600) for Act 3. Fallbacks: `sans-serif`, `monospace`.

**Shapes:** Acts 1 and 2 use rounded corners (pills, radius 10 to 20) and thin gold Deco rules. Act 3 uses square corners only. Dialogue box: 1080 x 168, 3 px border in the speaker's tag colour, radius 20, 100 px from each side and 64 px from the bottom. Body text 25 px with a line height of 1.45.

Text contrast must reach 4.5:1 everywhere. Buttons are real `<button>` elements with visible focus rings.

### 9.2 Screen list

| Screen | Notes |
| --- | --- |
| Content warning | First launch only (9.4) |
| Title | Deco sunburst over cream, the title in Poiret One, menu: New game, Continue, Citizen records, Settings (plus Controller Mode once unlocked). **After `resetSeen`:** only Lenina remains in the title art, the other portraits are gone, and a small line under the title reads "Everybody's happy now." |
| Name entry | A cheerful World State form: "Confirm your name and caste." Name field (1 to 16 characters, letters, spaces, hyphens). Caste radio buttons with Beta-Plus pre-selected and every other caste disabled |
| Dialogue | Section 8.1 |
| Quick menu | AUTO, SKIP, LOG, SAVE, RECORDS, SETTINGS, centred under the dialogue box |
| Pause (Esc) | Resume, Save, Load, Records, Settings, Title |
| Save / Load | Autosave plus 3 slots, each with the scene's background as a thumbnail, act and day, and real time. Locked slots per 8.7 |
| Records | Section 8.7 |
| Settings | Text speed, music, sfx and voice volume, skip mode (read only or all), "Reduce flashing and shaking". Also a "Conditioning" slider fixed at 100% and permanently disabled, with no explanation |
| Slogan builder | Section 8.3 |
| Interlude | Section 8.12 |
| Terminal | Section 8.11 |
| Ending card, credits | Section 8.11 |
| Debug panel | Section 12 |

### 9.3 Phone gate

If `matchMedia('(pointer: coarse)').matches` and the viewport is narrower than 900 px, show only: the title, and "Please play on a laptop or desktop browser." No game loads.

### 9.4 Fixed UI copy

This is the only text Codex may write into the game. Everything else is Lucas's.

| Where | Text |
| --- | --- |
| Content warning | "Content warning. This game contains psychological horror, including manipulation of the player, unsettling imagery, and references to drug use and death. It contains no gore." Button: "I understand" |
| Phone gate | "Please play on a laptop or desktop browser." |
| Title subtitle | "A visual novel after Aldous Huxley's *Brave New World*" |
| Name entry | "Confirm your name and caste." Button: "Confirm" |
| Soma button | "SOMA" over "½ gramme"; Act 3 caption "still here"; auto-dose pill "AUTO-DOSE IN {n}" with button "No" |
| Records | "CITIZEN RECORDS", "COMMUNITY · IDENTITY · STABILITY", statuses "Active", "Under review", "Transferred", "Visiting" |
| Locked save | "History is bunk." |
| Refresh interstitial | "Ending is better than mending." |
| Skip-mash toast | "A gramme is better than a damn." |
| Slogan builder | "CATCHINESS", "Clear", "Submit slogan", "THE CIRCLE REACTS", "YOUR WORDS" |
| Island option disabled | "Truth too low" |
| Terminal stats panel | "YOUR FILE" and the stat labels in 8.11 |
| Ending card | "Ending reached" |
| Menus and settings | Standard labels as listed in 9.2 |

### 9.5 Input and accessibility

- Every action is reachable by mouse and keyboard. Focus is trapped inside open overlays and returns on close.
- `aria-live="polite"` on the dialogue text, so screen readers announce lines as they finish typing.
- Respect `prefers-reduced-motion`: start with "Reduce flashing and shaking" on.

---

## 10. Asset contract

Art comes from ChatGPT as one zip. Audio comes from ElevenLabs. Both follow this contract exactly. Prompts are in ASSETS.md.

### 10.1 Folders and names

```
assets/
  manifest.json
  characters/
    lenina/     neutral.png happy.png worried.png upset.png special.png
    bernard/    neutral.png happy.png worried.png upset.png special.png
    helmholtz/  neutral.png happy.png worried.png upset.png special.png
    john/       neutral.png happy.png worried.png upset.png special.png
    mond/       neutral.png smile.png cold.png
  backgrounds/
    title.png  title_reset.png
    classroom_bright.png  classroom_drained.png
    hallway.png  roof.png
    dorm_night.png
    mond_office.png
    island_shore.png  lighthouse.png
  ui/
    deco_frame.png   (optional ornament for the dialogue box corners)
  audio/
    music/  title_theme.mp3  act1_loop.mp3  act2_loop.mp3  synthetic_dance.mp3  night_ambience.mp3  act3_roomtone.mp3  ending_stinger.mp3
    sfx/    advance.mp3  choice.mp3  chime.mp3  shock.mp3  soma.mp3  glitch.mp3  delete.mp3  type.mp3  breath.mp3  page.mp3
    voice/  voice_001.mp3 ...  mond_001.mp3 ...   (ids match [vo ...] tags in the script)
```

### 10.2 Specs

| Kind | Format | Size | Rules |
| --- | --- | --- | --- |
| Character sprite | PNG with transparency | 1024 x 1536 | Waist-up, facing the viewer, centred. Top of head about 8% from the top edge. Same scale for everyone; Bernard's height difference comes from `scale`, not the art |
| Background | PNG or JPG | 1536 x 1024 | Cropped by the engine to 16:9 (`object-fit: cover`, centred). Keep important detail inside the central 1536 x 864 band. No people, no text |
| Music | MP3, 44.1 kHz | | Loops must loop cleanly. Under 3 MB each |
| SFX | MP3 | | Under 2 s except `breath` (up to 8 s, loopable) |
| Voice | MP3 | | One file per line |

### 10.3 `manifest.json`

```json
{
  "characters": { "lenina": { "neutral": "characters/lenina/neutral.png" } },
  "backgrounds": { "classroom_bright": "backgrounds/classroom_bright.png", "classroom_bright_drained": "backgrounds/classroom_drained.png" },
  "music": { "act1_loop": "audio/music/act1_loop.mp3" },
  "sfx": { "shock": "audio/sfx/shock.mp3" },
  "voice": { "mond_001": "audio/voice/mond_001.mp3" }
}
```

Codex writes the full manifest with every entry listed in 10.1 from day one. The `<id>_drained` convention maps drained backgrounds.

### 10.4 Placeholders

Until the real files arrive, the engine must look intentional, not broken:

- **Characters:** an inline SVG silhouette (head ellipse, shoulders) in the character's tag colour with their name in small caps. Each expression gets a different mouth stroke.
- **Backgrounds:** a flat fill with a few Deco lines and the id in small text. Classroom: mint. Hallway: cream. Roof: pale sky. Dorm: night blue. Office: dark grey. Island: sand and sea bands. Lighthouse: grey sky with a white tower shape.
- **Audio:** silence.

The game must be fully playable on placeholders.

---

## 11. Milestones and acceptance criteria

Five working days for the build, then one day for Lucas to drop in script and assets. Each milestone is one pull request.

### M1: Engine skeleton (day 1)

- Stage scales and letterboxes correctly at 1280 x 720, 1440 x 900 and 1920 x 1080.
- Parser handles every line type and command in section 5 and reports errors with file and line.
- `_demo.txt` plays from start to an ending with dialogue, choices, labels, jumps, conditions, `set` and `add`.
- Text box, name tags, typewriter, advance, auto, skip, log.
- Asset manifest loader with placeholders for every asset.
- `?debug=1` panel: scene jump, stat editor, TODO counter.
- `tests.html` with parser and expression tests passing.

### M2: Core systems (day 2)

- Saves: autosave at scene start, 3 slots with thumbnails, load restores the stage exactly.
- Settings screen with every control in 9.2, persisted globally.
- Slogan builder working with placeholder decks, live Catchiness scoring matching 8.3, hidden affinity and truth effects, tests for scoring.
- Soma button with all five states, `somaskip`, auto-dose countdown and "No".
- Shock words with every feedback element, and their reduce-motion versions.

### M3: Meta, effects and acts (day 3)

- Records screen, `delete` and `review`, drain-and-dissolve, save locking with "History is bunk."
- Refresh detection with the interstitial and `mended` resume.
- Skip-mash toast. Tab title behaviour per act. Clock interpolation.
- All effects in 8.10, with reduce-motion variants.
- Act classes and drain. Interlude mode. Terminal mode with the stats panel.
- Hidden-ending check and all four endings per 3.2, ending card, credits, `resetSeen` title variant.

### M4: Audio and presentation (day 4)

- Web Audio music with crossfades and `detune`, sfx, voice with ducking, audio unlock on first gesture.
- Whispers through speech synthesis with text fallback.
- Content warning, name entry form, phone gate.
- Title screen and all menus styled per section 9 and the mockups.
- Swapping in a real asset zip requires no code changes.

### M5: Controller Mode, polish and deploy (day 5)

- Controller Mode per 8.13, or cut and noted.
- Full playthrough of `_demo.txt` reaching every ending, with no console errors.
- Performance check: the title screen loads in under 3 s on a school laptop. Images load per scene, not all at boot.
- GitHub Pages live from `main`, root folder. README explains how to run, write script, and swap assets.

### Day 6 (Lucas)

- Drop in `act1.txt` to `endings.txt` and `decks.json`; fix any parser errors shown.
- Unzip the art and audio into `assets/`; check the debug panel for missing files.
- Playtest all four endings; tune `tuning.json`.

---

## 12. Testing and debug tools

**`tests.html`:** a tiny no-dependency test runner (an `assert` function and a results list). Required suites:

- Parser: every line type, every command, every error type, curly quotes, tabs.
- Expressions: operators, precedence, helpers, unknown paths.
- Catchiness: at least 8 hand-checked slogans, including the rhyme pair "ending" and "mending" scoring at least 70.
- Save and load round trip; save locking by deletion day.
- Refresh detection logic (with `performance` and `sessionStorage` stubbed).

**`?debug=1` panel** (toggle with the backquote key):

- Jump to any scene or label.
- Edit any stat, affinity, flag or global value.
- Trigger any effect, soma state, `delete`, the refresh interstitial and the skip-mash toast.
- Remaining `[[TODO` count, missing-asset list, script warnings.
- "Wipe all storage" button.

---

## 13. Deployment

- Repo: `bnw-game`. GitHub Pages from the `main` branch, root folder.
- `.nojekyll` at the root. All paths relative.
- Test locally with `python3 -m http.server 8000`, since `fetch` of script files fails from `file://`.
- The link for Dr. Nurenberg: `https://<username>.github.io/bnw-game/`.

---

## 14. Appendix: where each mechanic comes from in the book

For Lucas's overview document, and so Codex understands why each feature exists.

| Page | Moment in the book | Where it lives in the game |
| --- | --- | --- |
| 7 | The motto "Community, Identity, Stability" | Records header, tab title |
| 16 | Happiness as liking what you have to do | Slogan builder tip |
| 21 | Babies conditioned with alarms and shocks to hate books and flowers | Shock words |
| 27, 63 | Caste colours | Name tags |
| 34 | "History is bunk" | Locked saves |
| 47 | Thousands of repetitions make one truth | Player slogans whispered back |
| 49 | "Ending is better than mending" | Refresh detection |
| 55 | "A gramme is better than a damn"; half a gramme for a half-holiday | Skip-mash toast; soma button |
| 64 | Bernard is shorter than Alpha standard | Bernard's sprite scale |
| 67, 69 to 70 | Helmholtz, "a little too able", wants words that pierce | Setting; Truth tiles; his route |
| 74 | "Everybody's happy now" | Title |
| 98 | Iceland as a threat | `review bernard` |
| 118 | "Mother" as a shameful word | Day 3 injected word |
| 166 | The synthetic dance song | Act 2 music (`synthetic_dance`, instrumental) |
| 181 to 182 | Helmholtz's poem about solitude | Act 2 poem scene |
| 213 | John throws the soma out of the window | `soma off` scene |
| 220 to 228 | Mond's case for stability over truth and art | Act 3 terminal |
| 227 | Exile to an island as a reward | Island ending |
| 240 | Claiming the right to be unhappy | True ending |
| 243 | The lighthouse | True ending background |
