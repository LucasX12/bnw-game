# AGENTS.md: rules for Codex on `bnw-game`

This repo is *Everybody's Happy Now*, a browser visual novel based on Aldous Huxley's *Brave New World*, built as a school project and hosted on GitHub Pages. The full spec is **BRIEF.md**. Read it before every task. When BRIEF.md and your own instincts disagree, BRIEF.md wins. When BRIEF.md is silent, choose the simplest option that keeps the game data-driven, and note the choice in `CHANGELOG.md`.

## Hard rules

1. **Do not write story text.** Lucas writes every line of dialogue, narration, whisper, poem and ending text himself. When a scene needs words, insert a placeholder in the exact form `[[TODO Lucas: what this line should do]]`. The only exception is the fixed UI copy listed in BRIEF.md section 9.4. Do not "improve", reword or extend anything Lucas has written in `/script`.
2. **Plain web stack only.** HTML, CSS and JavaScript ES modules. No build step, no bundler, no npm packages, no frameworks, no TypeScript, no JavaScript from CDNs. Google Fonts `<link>` tags are the only external requests allowed.
3. **Relative paths everywhere.** The site is served from `https://<user>.github.io/bnw-game/`, so a leading `/` breaks it. Keep a `.nojekyll` file at the repo root.
4. **Content stays out of code.** Story lives in `/script/*.txt`, data in `/data/*.json`, media in `/assets/` listed in `assets/manifest.json`. Engine code never hard-codes a line of story, a character's stats or an asset path.
5. **The asset contract is fixed.** Never rename, move or invent asset ids or filenames defined in BRIEF.md section 10. If a file is missing, the engine must show its placeholder and keep running.
6. **Laptop browsers only.** Target current Chrome, Edge, Safari and Firefox on a laptop. Phones get the gate screen in BRIEF.md section 9.3, not a responsive layout.
7. **Respect the content limits.** Slow-burn psychological dread only. No gore, no self-harm, no sexual content. Anything touching on death happens offscreen. Every flash and shake must be switched off by the "Reduce flashing and shaking" setting.
8. **No em dashes** in any text you write: UI copy, comments, docs or commit messages. Use a colon, comma or full stop.

## How to work

- **The engine already exists.** Milestones M1 to M4 were built and tested on 2026-11-08; read `CHANGELOG.md` before starting and continue from where it leaves off. Don't rebuild working systems.
- Build in the milestone order in BRIEF.md section 11. Finish and test one milestone before starting the next.
- **Cut order if time runs short:** Controller Mode (BRIEF 8.13) is cut first. Everything else is required.
- Keep modules small and single-purpose, as laid out in BRIEF.md section 4. Prefer clear code over clever code: Lucas has to read and maintain it.
- Every new script command needs a parser test and an entry in the command table in BRIEF.md section 5.

## Before you call a task done

1. Serve locally: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000/`.
2. Open `http://localhost:8000/tests.html` and confirm every test passes.
3. Play through the story in `script/` from start to an ending with `?debug=1`. No errors in the console (404s for art and audio not yet delivered are expected) and none in the debug panel.
4. Confirm the game still runs with `assets/` emptied except `manifest.json`: placeholders everywhere, no crashes.
5. Add a dated line to `CHANGELOG.md` saying what changed and which acceptance criteria from BRIEF.md section 11 now pass.

## Commits and pull requests

- One pull request per milestone, titled `M<n>: <milestone name>`.
- The description lists each acceptance criterion from BRIEF.md section 11 with pass or fail.
