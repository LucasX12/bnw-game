# ASSETS.md: art and audio prompt pack

Everything the game needs that isn't code or script: 23 character sprites and 10 backgrounds from ChatGPT, plus music, sound effects and two voices from ElevenLabs. Filenames here match BRIEF.md section 10 exactly. Don't rename anything, or the game will show placeholders.

---

## Part A: images in ChatGPT

### How to run the image chat

1. Open a **new** ChatGPT chat used only for this. Paste **Block 0** first and wait for it to confirm.
2. Do the characters one at a time. For each one, generate the **neutral** sprite first and regenerate it until you like it. Then make the other expressions as **edits of that approved image**, never as fresh generations. That is what keeps the face consistent.
3. Then do the backgrounds. The `drained` and `reset` versions are edits of their bright originals.
4. Finally, paste **Block Z** to get everything packaged as one zip.
5. Run the checklist at the end of Part A, then hand the zip over to be added to the repo.

If an image comes back with a fake checkerboard or a white background instead of real transparency, say: "The background isn't actually transparent. Regenerate it on a flat pure green (#00FF00) background instead." The green can be removed afterwards.

### Block 0: style bible (paste first)

```
You are the only illustrator for a browser visual novel called "Everybody's Happy Now", based on Aldous Huxley's Brave New World. Hold these rules for every image in this chat:

STYLE
- Flat 1930s Art Deco poster illustration. Clean geometric shapes, crisp edges, minimal shading (at most one flat shadow tone), no gradients, no texture, no photorealism.
- Original designs only. Do not imitate any existing game, anime, film or living artist.
- Palette: cream #F4EDDC, paper #FBF7EE, mint #CFE6D8, deep mint #8CC7AE, gold #C9A24A, coral #E07A5F, ink #2B2A33, mulberry #7A3558, Alpha grey #7E8189 and #A3A6AD. Each character adds their own clothing colour.
- Absolutely no text, letters, numbers, logos, signatures or watermarks anywhere in any image.
- Nothing sexual, no gore, no weapons.

CHARACTER SPRITES
- Portrait canvas 1024 x 1536, real transparent background (PNG with alpha).
- Waist-up, facing the viewer, centred, arms relaxed. Top of the head about 8% below the top edge. The body is cut off at the bottom edge.
- Identical framing, scale and line weight for every character, so they line up when shown side by side.
- Once I approve a character, every later image of them must be an edit of the approved image: same face, hair, clothes, proportions and colours. Change only what I ask.

BACKGROUNDS
- Landscape canvas 1536 x 1024. No people. Keep important detail inside the middle 85% of the height, because the top and bottom will be cropped.
- Leave open floor space in the lower middle, where characters will stand.

Reply "Ready" and wait for my first request.
```

### Characters

Do each character in this order: neutral, then happy, worried, upset, special. For each expression after neutral, paste the edit line shown.

#### Lenina: `characters/lenina/`

```
Character: Lenina. A cheerful young woman in her early twenties. Auburn hair in neat permanent waves, cut to a chin-length bob with a rounded fringe. Rosy cheeks, bright friendly eyes, soft rounded features. A fitted bottle-green dress with a cream collar. Hands loosely together at the waist. She is warm, sweet and completely at ease.
Expression: neutral, a pleasant closed-mouth smile.
```

| File | Edit prompt after approving neutral |
| --- | --- |
| `neutral.png` | (the approved image) |
| `happy.png` | "Edit the approved Lenina. Change only the face: a big open smile, eyes crinkled with delight. Everything else identical." |
| `worried.png` | "Edit the approved Lenina. Change only the face: eyebrows raised, a small uncertain smile, eyes glancing to the side." |
| `upset.png` | "Edit the approved Lenina. Change the face to a frown with wide eyes, and raise one hand to her collar. Everything else identical." |
| `special.png` | "Edit the happy Lenina. Make the smile slightly too wide and too fixed, and the eyes wide open and perfectly still. Nothing else changes. It should feel subtly wrong, not monstrous." |

#### Bernard: `characters/bernard/`

```
Character: Bernard. A slender young man, noticeably slight and narrow-shouldered for his age. Dark, neatly combed short hair, pale skin, sharp anxious eyes. Slightly defensive posture, arms held close to his body. A light grey suit with a white shirt, a thin grey tie, and a small plain gold circle pin on the lapel. Use the same canvas scale as Lenina; his small build should show in his shoulders, not by shrinking the drawing.
Expression: neutral, guarded, lips pressed together.
```

| File | Edit prompt after approving neutral |
| --- | --- |
| `happy.png` | "Edit the approved Bernard. Change only the face: a smug, pleased half-smile." |
| `worried.png` | "Edit the approved Bernard. Change only the face: brows knitted, eyes darting to the side." |
| `upset.png` | "Edit the approved Bernard. Change only the face: a resentful scowl." |
| `special.png` | "Edit the approved Bernard. A wide, desperate, eager grin with pleading eyes, as if trying far too hard to be liked. Everything else identical." |

#### Helmholtz: `characters/helmholtz/`

```
Character: Helmholtz. A powerfully built young man, broad-shouldered and deep-chested, with dark curly hair and strongly marked, handsome features. Calm, thoughtful eyes. A lighter grey suit, white shirt and a coral tie. He looks confident and a little restless.
Expression: neutral, thoughtful.
```

| File | Edit prompt after approving neutral |
| --- | --- |
| `happy.png` | "Edit the approved Helmholtz. Change only the face: a warm, genuine smile." |
| `worried.png` | "Edit the approved Helmholtz. Change only the face: brows drawn together, eyes looking down." |
| `upset.png` | "Edit the approved Helmholtz. Change only the face: jaw set, frustrated." |
| `special.png` | "Edit the approved Helmholtz into an 'erased' version. Keep the exact silhouette and pose, but fade the face, hair and every interior detail to a blank paper-coloured fill. Only a thin grey outline remains, broken in a few places, as if he is being rubbed out. Keep the background transparent." |

#### John: `characters/john/`

```
Character: John. A young man with straw-coloured hair worn long in a single plait, pale blue eyes and light skin, lean and weathered from an outdoor life. Serious and earnest. He wears a plain cream handwoven shirt under a borrowed grey jacket that fits him badly, with a simple leather cord at his neck. Dignified and grounded, never a costume.
Expression: neutral, earnest.
```

| File | Edit prompt after approving neutral |
| --- | --- |
| `happy.png` | "Edit the approved John. Change only the face: a shy, surprised smile." |
| `worried.png` | "Edit the approved John. Change only the face: troubled, brows raised." |
| `upset.png` | "Edit the approved John. Change only the face: anguished anger." |
| `special.png` | "Edit the approved John. Eyes closed, lips slightly parted as if reciting poetry, one hand lifted a little in front of his chest. Everything else identical." |

#### Mond: `characters/mond/`

```
Character: Mond. A man of middle height in his fifties. Black hair greying at the temples, a hooked nose, full lips and very piercing dark eyes. An impeccable charcoal suit, cream shirt, dark tie and a small plain gold circle pin. Composed, intelligent, faintly amused. Restrict his colours to ink, charcoal, cream and gold.
Expression: neutral, calm and appraising.
```

| File | Edit prompt after approving neutral |
| --- | --- |
| `smile.png` | "Edit the approved Mond. Change only the face: an urbane, faintly amused smile." |
| `cold.png` | "Edit the approved Mond. Change only the face: expressionless, eyes hard, looking straight at the viewer." |

### Backgrounds: `backgrounds/`

Generate the bright ones fresh. Make each `drained` or `reset` version as an edit of its original.

| File | Prompt |
| --- | --- |
| `title.png` | "Title screen backdrop. A cream background with a large mint semicircle rising from the bottom right, thin concentric deep-mint rings around it, and gold sunburst rays fanning up and to the left. Keep the left 45% calm and mostly empty for the title and menu." |
| `title_reset.png` | "Edit title.png. Same composition, but colder: shift the palette towards pale grey-mint, remove half the gold rays, and leave one ray broken partway." |
| `classroom_bright.png` | "The Writing Circle's classroom in a 1930s Art Deco college. Mint walls, two tall arched windows with gold frames showing a pale futuristic city skyline with distant helicopters, a gold band along the wall, a warm honey-wood floor, a long table with scattered paper. A dark blank plaque above the door. Bright morning light. Keep the middle of the room open." |
| `classroom_drained.png` | "Edit classroom_bright.png. Identical composition, but drain the colours to near-grey, make the light cold and flat, and pull one chair out from the table, empty." |
| `hallway.png` | "A long Art Deco corridor in the same college. Cream walls with gold chevron trim, rows of identical doors, a glossy floor reflecting the ceiling lights, a bright window at the far end." |
| `roof.png` | "The college rooftop at sunset. A round helicopter landing pad marked with concentric rings and no lettering, Deco railings, a pastel sky, slim city towers in the distance." |
| `dorm_night.png` | "A small, impersonal dormitory room at night. A neat narrow bed, a small speaker grille in the wall beside the pillow glowing faintly, deep blue moonlight through a round window. Everything tidy and identical." |
| `mond_office.png` | "A Controller's private study at night. Dark wood panelling, bookcases behind locked glass, a heavy safe set into the wall, a large desk with a green-shaded lamp as the only warm light, a tall window full of city lights. Quiet, dark and expensive." |
| `island_shore.png` | "A windswept northern island shore under a cold, bright sky. Dark rocks, a grey-green sea, low grass, a few simple stone huts in the distance. Austere but beautiful, colours slightly muted." |
| `lighthouse.png` | "An old disused lighthouse on a low hill at dawn, heather and gorse around it, a pale empty sky. Quiet and lonely, not menacing." |

Optional: `ui/deco_frame.png`: "A thin gold Art Deco corner ornament on a transparent background, 512 x 512, for decorating the corners of a dialogue box."

### Block Z: packaging (paste last)

```
Package every image I approved in this chat into one zip file named ehn_art.zip with exactly this structure and these filenames. Characters must be 1024 x 1536 PNG with real transparency. Backgrounds must be 1536 x 1024 PNG. Resize if needed, without cropping the characters. Then list any file that is missing.

characters/lenina/neutral.png happy.png worried.png upset.png special.png
characters/bernard/neutral.png happy.png worried.png upset.png special.png
characters/helmholtz/neutral.png happy.png worried.png upset.png special.png
characters/john/neutral.png happy.png worried.png upset.png special.png
characters/mond/neutral.png smile.png cold.png
backgrounds/title.png title_reset.png classroom_bright.png classroom_drained.png hallway.png roof.png dorm_night.png mond_office.png island_shore.png lighthouse.png
ui/deco_frame.png (only if made)
```

If ChatGPT says it can't put its own images into a zip, download each image, rename it to the filename above, and hand over the loose files. Claude can sort and zip them.

### Checklist before handing off

- [ ] 23 sprites: 5 each for Lenina, Bernard, Helmholtz and John, plus 3 for Mond.
- [ ] 10 backgrounds.
- [ ] Sprites have real transparency: on a dark background they show no white box and no checkerboard.
- [ ] All the neutral sprites, viewed side by side, have heads at the same height and the same scale.
- [ ] No text, letters or watermarks anywhere.

---

## Part B: audio in ElevenLabs

Export everything as MP3. Name the files exactly as below, then put them in `assets/audio/music/`, `assets/audio/sfx/` and `assets/audio/voice/`.

### Music: `audio/music/`

All instrumental, no vocals. Loops should end where they begin.

| File | Prompt |
| --- | --- |
| `title_theme.mp3` | "Gentle 1930s dance-band waltz on celesta, muted trumpet and soft strings. Sweet and nostalgic with a faint unsettling undertone. Instrumental, about 90 seconds, seamless loop." |
| `act1_loop.mp3` | "Cheerful synthetic swing: bright vibraphone, plucked strings, brushed drums, a 1930s dance band reimagined as slick synthetic music. Sugary and upbeat. Instrumental, seamless loop, about 90 seconds." |
| `act2_loop.mp3` | "The same sweet melody played thinly on a music box over a hollow synth pad. Some notes are held a beat too long. Slightly empty and wrong, still pretty. Instrumental, seamless loop." |
| `synthetic_dance.mp3` | "Slow, sultry synthetic dance-hall tune: crooning saxophone lead, soft drum machine, hypnotic and repetitive. Instrumental only, seamless loop." |
| `night_ambience.mp3` | "Very quiet night room tone with a faint low murmur like a distant whisper, no words. Seamless loop, about 60 seconds." |
| `act3_roomtone.mp3` | "Near silence: a quiet office room tone, a very faint clock tick, a low ventilation hum. Seamless loop." |
| `ending_stinger.mp3` | "A short celesta and strings phrase, about 6 seconds, ending on a chord that doesn't quite resolve. Bittersweet." |

The Act 2 song in the book (p. 166) has lyrics, but keep `synthetic_dance` instrumental. The engine adds the wrongness on top by detuning it.

### Sound effects: `audio/sfx/`

| File | Prompt |
| --- | --- |
| `advance.mp3` | "Very short soft paper tick, UI click." |
| `choice.mp3` | "Gentle two-note chime, UI selection." |
| `chime.mp3` | "Bright, pleasant bell chime, a small reward." |
| `shock.mp3` | "Short harsh electric buzz with a sharp jolt, unpleasant, 0.4 seconds." |
| `soma.mp3` | "A soft fizzing tablet dissolving, then a warm, relaxing whoosh." |
| `glitch.mp3` | "Digital glitch burst, stuttering static, 0.5 seconds." |
| `delete.mp3` | "Paper being rubbed out with an eraser under a faint descending tone, eerie, 1 second." |
| `type.mp3` | "A single soft typewriter key, quiet." |
| `breath.mp3` | "Slow, soft human breathing, close to the microphone, calm, seamless 6-second loop." |
| `page.mp3` | "Light page turn." |

### Voices: `audio/voice/`

Only two voices are recorded: The Voice (the sleep-teaching whisper) and Mond. Everyone else stays text.

**Voice design prompts**

- **The Voice:** "A soft, warm, androgynous voice, very close to the microphone, whispering gently and slowly like a lullaby. Calm and kind, with a faint synthetic sheen." Use high stability and low style exaggeration so it stays even.
- **Mond:** "A refined British man in his fifties. Measured, articulate and unhurried. Warm on the surface with cold certainty underneath. Quietly amused, as if explaining something obvious to a promising student."

**Workflow**

1. In the script, Lucas tags each voiced line with an id: `mond: "..." [vo mond_001]`.
2. Keep a list, `voice_lines.csv` (columns `id,text`), so every file can be matched to its line.
3. Generate one MP3 per line and name it by id: `voice_001.mp3`, `mond_001.mp3`, and so on.
4. **Never voice anything dynamic.** The player's name, their stats and their own slogans change every playthrough. Mond's recorded lines say "you", not the player's name. The engine types the dynamic lines out silently and reads the player's slogans aloud with the browser's built-in speech.

---

## For the AI audit

ChatGPT (made by OpenAI) and ElevenLabs are two separate tools, each needing its own full entry: background and context, what you gained, what you lost, what was interesting, and how you kept doing your own thinking. Keep the approved prompts and a few rejected images as evidence of where you pushed back.
