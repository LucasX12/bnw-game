# Changelog

## 2026-11-08: Act 1 script draft (for Lucas's review)

- Drafted all of Act 1 (7 scenes) and Lenina's night interlude. 14 lines quote the novel verbatim, each with its page number in a `# p.NN` comment.
- Story split: Lucas writes Mond's speech, Helmholtz's poem and the four endings; the other scenes are drafted for his review.
- AGENTS.md, BRIEF.md and ASSETS.md updated to match that split.
- Script parses with no errors (71 TODO lines left). Tests 64 of 64; full playthrough to the Stability ending with no errors.

## 2026-11-08: art added (by Claude)

- Added all 34 images from ChatGPT (`ehn_art.zip`): 23 character sprites, 10 backgrounds, 1 UI ornament. All files matched the asset contract: right names, right sizes, real transparency.
- Converted everything to WebP at full resolution: 45.0 MB down to 2.8 MB, so the game loads fast on school laptops. `assets/manifest.json` now points at the `.webp` files.
- Helmholtz's `special` (erased) sprite came back as a solid cream silhouette. Reworked it to the spec: a translucent paper fill with a thin grey outline broken in places.
- The debug panel's Jump now clears sprites left over from the previous scene.
- Checked in headless Chrome: title, dialogue, Act 2 and Act 3 screens render with the real art and no errors.

## 2026-11-08: engine built (by Claude)

**Milestones M1 to M4 are complete. M5 is partly done: Controller Mode is cut (stubbed in `js/ui/controller.js`) and the site is not deployed yet.**

Built:
- Stage scaling and letterboxing, layered background, sprite, effects and UI layers.
- Script parser with every line type and command in BRIEF.md section 5, all errors reported at once with file and line.
- Safe expression language and `{interpolation}`.
- Text box, typewriter, name tags in caste colours, auto, skip (read only or all), Ctrl to skip, log, whispers, `[corrupt]`.
- Choices with hidden and disabled options; number keys pick options.
- Autosave at every scene start, 3 manual slots with thumbnails, Continue and Load from the title.
- Settings, including the fixed Conditioning slider and "Reduce flashing and shaking".
- Slogan builder with live Catchiness scoring, hidden affinity and Truth effects, shock words with shake, flash and sound.
- Soma button in all five states, `somaskip`, the auto-dose countdown with "No".
- Citizen Records, `delete` with drain and dissolve, `review`, save locking ("History is bunk.").
- Refresh detection with the interstitial and `<scene>_mended` resume, skip-mash toast, tab title tricks, clock.
- Glitch, static, shake, flash, haze, drain, per-act themes, night interludes, Act 3 terminal with the Your File panel.
- All four endings, ending card, credits, the reset title screen after Stability.
- Web Audio music with crossfades and detune, sfx, voice with ducking, speech synthesis whispers.
- Content warning, phone gate, file:// warning, script error screen, `?debug=1` panel.
- Placeholder art for every character expression and background.
- Full placeholder story skeleton: 25 scenes covering BRIEF.md section 3.1, 107 TODO lines for Lucas.

Tested in headless Chrome:
- `tests.html`: 64 of 64 pass.
- Automated playthroughs reach all four endings (Stability, Island, The Right to Be Unhappy, Perfect Citizen) plus the route where Bernard is erased, with no script or runtime errors. The only console messages are 404s for art and audio files that don't exist yet.
- Soma press jumps scenes and counts; deletion locks older saves; refresh mid-scene shows the interstitial and resumes.

Bug fixed during testing: after a mouse click on the soma button, Space would press it again. Mouse clicks now drop focus from game buttons.

Changes from BRIEF.md (BRIEF.md has been updated to match):
- Save locking uses a deletion counter instead of the in-game day, so a save made earlier on the same day as a deletion is also locked.
- The refresh-resume label is `<sceneId>_mended`, because labels must be unique across all files.
- New scene tag `island`: erased characters can appear in that scene (they are on the island).
- New command `day <n>`. New expression paths: `records.<id>`, `tuning.<key>`, `slogan.count`, `slogan.<n>`.
- Choices containing Shakespeare tiles score 0 Catchiness and show "unmeasurable".
- Title menu also has "Load".

Next:
- Lucas: replace the `[[TODO` lines and the word decks; drop in the art and audio.
- Deploy to GitHub Pages.
- Optional: Controller Mode (BRIEF 8.13).
