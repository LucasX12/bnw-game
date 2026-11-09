# Everybody's Happy Now

A browser visual novel after Aldous Huxley's *Brave New World*, by Lucas Xia.

## Run it on your computer

Browsers block the script files when you open `index.html` directly, so serve the folder:

```
cd bnw-game
python3 -m http.server 8000
```

Then open http://localhost:8000/. Add `?debug=1` to the address for the debug panel (press the backquote key to hide or show it).

Tests: http://localhost:8000/tests.html

## Write the story

The story lives in `script/`. Every line that looks like `[[TODO: ...]]` is an unfinished line that can be drafted or revised with AI assistance, then reviewed by Lucas. Keep the commands around them (`bg`, `show`, `slogan`, `soma`...) unless you want to change what happens. The format is in BRIEF.md section 5.

- `act1.txt`, `interludes.txt`, `act2.txt`, `act3.txt`, `endings.txt`: the scenes, already wired together.
- `data/decks.json`: the words for each slogan session.
- `data/tuning.json`: thresholds such as how much Truth the Island ending needs.
- `data/credits.json`: the credits.

If you make a typo, the game shows a list of errors with the file and line number instead of starting. Fix them and reload.

## Add the art and audio

Unzip the art into `assets/` so the paths match `assets/manifest.json` (for example `assets/characters/lenina/happy.png`). Audio goes in `assets/audio/music/`, `assets/audio/sfx/` and `assets/audio/voice/`. Anything missing shows a placeholder or plays silence, so the game always runs. The debug panel lists missing files.

## Put it online

1. Push this folder to a GitHub repo named `bnw-game`.
2. Settings › Pages › Deploy from a branch › `main`, `/ (root)`.
3. The link is `https://<your-username>.github.io/bnw-game/`.

## What's where

See BRIEF.md for the full spec and CHANGELOG.md for what's built.
