# ASSETS_v2.md: the expanded art pack (about 100 images)

Three batches, each one block to paste into ChatGPT. Every image here has a planned place in the script. Filenames matter: the game finds images by name.

**Before you start**
- **Batch A** (expressions and new characters): paste it into the **same chat that made the anime set**, so ChatGPT can edit the sprites it already drew. If that chat is gone, start a new one and attach `lenina/neutral.png`, `bernard/neutral.png`, `helmholtz/neutral.png`, `john/neutral.png` and `mond/neutral.png` from your anime zip with the block.
- **Batch B** (backgrounds and interface art): any chat.
- **Batch C** (event illustrations): new chat, and attach the same five `neutral.png` files so the characters look right.
- If ChatGPT stops partway, say "continue". If a face drifts, say: `Redo [filename] as an edit of that character's neutral.png. Keep the face, hair, eyes, clothes and scale identical.`

---

## Batch A: 40 new expressions and 7 new characters → `ehn_v2_characters.zip`

```
Same project and same style as the anime art set you made for "Everybody's Happy Now". Generate the images below one at a time without waiting for approval. If you must stop, tell me the next filename.

RULES
- Every new expression is an EDIT of that character's existing neutral.png: identical face, hair, eyes, outfit, colours, framing and scale. Change only the face and, where stated, the hands.
- 1024 x 1536, waist-up, facing the viewer, centred, top of head about 8% below the top edge, REAL transparent background (PNG with alpha).
- Every character is an adult. No text, letters, logos or watermarks. Nothing sexual, no gore.
- Original designs only; do not imitate any existing anime, game, studio or artist.

NEW EXPRESSIONS (in each character's folder)
characters/lenina/: laugh (head tilted, laughing with eyes shut), sad (glistening eyes, small frown), angry (puffed cheeks, sharp brows), surprised (round eyes, open mouth), thinking (finger to chin, eyes up), embarrassed (deep blush, eyes away), blank (empty glassy eyes, faint polite smile, as if reciting), dreamy (half-lidded hazy eyes, flushed, drifting smile), tearful_smile (smiling brightly while tears run down her face)
characters/bernard/: laugh (bitter one-sided laugh), sad (eyes down, shoulders slumped), angry (teeth clenched), surprised (eyes wide, mouth open), thinking (narrowed eyes, hand at chin), embarrassed (flushed, looking away), smug (chin up, superior smirk), panicked (wide terrified eyes, sweating), bitter (sour downturned mouth)
characters/helmholtz/: laugh (big warm laugh), sad (quiet, heavy eyes), angry (fierce glare), surprised (raised brows), thinking (eyes far away), embarrassed (sheepish grin, hand at back of neck), inspired (bright intense eyes, mid-speech, one hand raised), defiant (steady hard gaze, chin up), fading (identical pose, but the whole figure about 50% transparent and breaking up into pale paper flecks at the edges)
characters/john/: laugh (startled, genuine laugh), sad (grief, eyes wet), angry (furious, nostrils flared), surprised (stunned), thinking (lips moving silently), embarrassed (flushed, turning away), furious (shouting, veins in neck, fist raised), lost (hollow exhausted eyes), gentle (soft, rare smile)
characters/mond/: amused (eyes crinkled, about to laugh), thoughtful (fingertips together in front of his chest), stern (flat mouth, lowered brows), weary (tired, honest, older-looking)

NEW CHARACTERS (new folders, each a fresh design in the same style and scale)
characters/fanny/: Fanny, about 22, Lenina's best friend, also a Beta. Soft brown hair in a neat low bun, round glasses, freckles, a cautious, kind face. Mulberry 1930s dress with a cream collar. Files: neutral, happy, worried.
characters/henry/: Henry, about 27, an Alpha-Plus scientist Lenina has been seeing. Tall, blond, perfectly combed, pleasant and completely untroubled. Light grey suit, gold circle pin. Files: neutral, happy.
characters/extras/bokanovsky.png: five identical young adult men side by side, the same face, same height, same expression, the same green work uniforms. Unsettling in its sameness. Same framing rules, but the group fills the width.
characters/extras/crowd.png: a mass of adult students in grey and mulberry uniforms, drawn as soft silhouettes with matching smiles, filling the frame from the waist up.

PACKAGING
Zip everything as ehn_v2_characters.zip, keeping the folders above (characters/<name>/<file>.png). 1024 x 1536 PNG with real transparency. List anything missing.
```

---

## Batch B: 25 backgrounds and 5 interface images → `ehn_v2_backgrounds.zip`

```
Same project and same style as the anime backgrounds you made for "Everybody's Happy Now": bright painted anime visual-novel backgrounds in a 1930s Art Deco retro-future, gold geometric trim, sunbursts, sleek towers and helicopters. Generate one at a time without waiting for approval.

RULES
- Backgrounds: 1536 x 1024, no people, open floor space in the lower middle, important detail inside the middle 85% of the height.
- No text, letters, numbers, logos or watermarks anywhere.
- Original designs only.

BACKGROUNDS (backgrounds/)
- classroom_evening: the same Art Deco club room at sunset, long orange light, lamps on.
- classroom_night: the same room at night, only the city lights outside, blue shadows.
- classroom_act3: the same room abandoned: chairs stacked, dust in cold white light, flowers dead, every surface grey.
- hallway_evening: the Art Deco corridor at dusk, warm lamps, long shadows.
- hallway_drained: the same corridor drained to near-grey, cold flat light, one door left open onto darkness.
- roof_night: the rooftop helicopter pad at night, city lights below, a few stars.
- roof_drained: the rooftop at noon, colour drained to grey, empty sky.
- dorm_morning: the small dorm room in soft morning light, bed made, the pillow speaker dark.
- dorm_night_drained: the dorm at night, colour drained, the pillow speaker glowing too brightly.
- courtyard: the college quad on a sunny day, a gold Art Deco fountain, clipped hedges, towers, helicopters overhead.
- courtyard_drained: the same quad drained to grey, the fountain dry.
- singery: an enormous Art Deco community hall with a gold dome, rows of seats facing a stage, warm stage light.
- singery_lit: the same hall in darkness lit by coloured stage lights and glowing ceiling patterns.
- soma_bar: a bright pastel cafeteria counter with rows of small glass jars of pale tablets and ice-cream glasses.
- hatchery: a long red-lit room with conveyor racks of glowing glass bottles stretching into the distance.
- helicopter_sky: the view from a helicopter window over the Art Deco city at golden hour.
- lift: the inside of an Art Deco lift, brass panels, a sunburst grille, a soft overhead light.
- library_locked: a dim archive of old books behind chained glass cases, dust in a beam of light.
- mond_office_dark: the Controller's study with only the green desk lamp on and rain against the tall window.
- island_night: the windswept island shore under a clear night sky full of stars.
- lighthouse_dusk: the old lighthouse on its hill at dusk, sky violet and gold.
- lighthouse_interior: the empty round stone room inside the lighthouse, one window, morning light on the floor.
- dream_lenina: a soft pastel dreamscape of pink clouds, floating gold sunbursts and drifting petals.
- dream_helmholtz: a dark storm of blank paper pages swirling through a grey sky.
- dream_bernard: an endless hall of tall mirrors that reflect only empty grey light.

INTERFACE (ui/), real transparent backgrounds unless stated
- soma_button: a round glossy coral-red button with a thick gold Art Deco ring, like a sweet or a pill seen from above, 512 x 512, no text.
- deco_divider: a thin horizontal gold Art Deco divider with a small diamond in the middle, 1024 x 64.
- title_flourish: a symmetrical gold Art Deco ornament with sunburst rays, wide and shallow, 1024 x 256.
- paper_texture: a seamless tileable cream paper texture with subtle fibres, 1024 x 1024, NOT transparent.
- dossier: a 1930s government file folder lying open on dark wood, blank pages, a gold seal with no symbol, 1536 x 1024, NOT transparent.

PACKAGING
Zip everything as ehn_v2_backgrounds.zip keeping the folders (backgrounds/, ui/). PNG. List anything missing.
```

---

## Batch C: 19 event illustrations → `ehn_v2_cg.zip`

```
Event illustrations (CGs) for the anime visual novel "Everybody's Happy Now", set in Aldous Huxley's Brave New World. I've attached the reference sprites for Lenina, Bernard, Helmholtz, John and Mond: draw each character EXACTLY as in the references (face, hair, eyes, outfit, colours). Generate one at a time without waiting for approval.

RULES
- 1536 x 1024 landscape, full painted scene, polished cinematic anime illustration with soft lighting and bloom, 1930s Art Deco retro-future world.
- The player is never shown; scenes marked POV are seen through the player's eyes.
- Every character is an adult. Nothing sexual, no gore, no weapons. No text, letters, numbers, logos or watermarks; any writing in a scene is unreadable scribbles.

CGs (cg/)
- cg_welcome: POV. Lenina in the sunny doorway of the club room, smiling, holding out her hand to the viewer.
- cg_circle: Lenina, Bernard and Helmholtz around the long table covered in word cards, Helmholtz standing at a chalkboard, warm morning light.
- cg_circle_drained: edit of cg_circle. Same composition, colour drained to grey, Helmholtz's place empty, his chair pushed in.
- cg_soma_offer: POV close-up. Lenina's hand offering a small pale tablet, her bright smile slightly out of focus behind it.
- cg_community_sing: the gold-domed hall full of students singing in unison with identical joyful faces; Lenina, Bernard and Helmholtz in the front row.
- cg_smudged_board: a chalkboard of neat chalk scribbles with one patch violently smudged and rubbed out, chalk dust in the air.
- cg_lenina_sleep: Lenina asleep in her dorm bed under the blanket, peaceful, the small speaker by her pillow glowing softly.
- cg_helmholtz_poem: Helmholtz standing and reading from a single sheet, lit from one side; the class around him in shadow, mouths open in laughter.
- cg_empty_chair: a single empty chair in the grey club room with a coral tie draped over its back, dust in a beam of light.
- cg_bernard_letter: Bernard alone in a grey corridor clutching a sealed envelope, terrified, sweat on his brow.
- cg_lenina_cry: Lenina in the drained club room, smiling brightly while tears run down her face.
- cg_john_window: John at an open window flinging small boxes of tablets out, tablets scattering through the air like snow, shocked students behind him.
- cg_mond_desk: POV. Mond seated behind his desk, fingertips together, the green lamp the only warm light, looking straight at the viewer.
- cg_mond_safe: Mond's open wall safe revealing a shelf of old leather-bound books.
- cg_end_stability: the club room far too bright, everyone else gone, Lenina smiling at the viewer among fresh flowers.
- cg_end_island_helmholtz: Helmholtz on a windy island shore writing on loose pages held down by stones, the sea behind him, happy.
- cg_end_island_bernard: Bernard alone on the island shore in a long coat looking out at the grey sea, a small uncertain smile.
- cg_end_unhappy: POV from behind and below: an empty path climbing a heather hill towards the old lighthouse at dawn.
- cg_end_citizen: extreme close-up of Lenina's perfect smile, eyes glassy and empty, pastel bloom.

PACKAGING
Zip everything as ehn_v2_cg.zip in a cg/ folder. 1536 x 1024 PNG. List anything missing.
```

---

## Totals

| Batch | Images | Zip |
| --- | --- | --- |
| A: expressions and new characters | 47 | `ehn_v2_characters.zip` |
| B: backgrounds and interface | 30 | `ehn_v2_backgrounds.zip` |
| C: event illustrations | 19 | `ehn_v2_cg.zip` |
| **Total** | **96** | |
