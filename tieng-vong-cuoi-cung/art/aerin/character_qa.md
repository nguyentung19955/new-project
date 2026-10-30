# AERIN – Phase 1 Character QA (SE master)

**Status:** Identity LOCKED (Art Director, attempt 3). The SE Animation Master is v2 (`sua-se.py`) and is waiting for the Art Director's verdict.

Source: PixelLab "Create from Reference", character `9ea1ed77-594b-46d6-af61-e9939888c251`.
Reference: attempt 1 SOUTH view, mirrored horizontally (moves the sword to the anatomical left hand) with the hair repainted as three large spikes (`master/aerin_reference_south_64.png`, script `sua-master.py`).
The unchanged PixelLab PNGs are in `attempt3/`. The deliverable is `aerin_master_se.png` (96×96, transparent, ground line y = 88).

## History
| Attempt | Method | Result |
|---|---|---|
| 1 | PixelLab v3 text, 64 box | Art Director FAIL: 63 px tall, too many hair spikes, sword in the anatomical RIGHT hand, horizontal blade clipped at the canvas edge |
| 2 | PixelLab v3 text (Art Director prompt), 56 box | Sword in the right hand again, ponytail instead of spikes, scarf lost, SE barely turned |
| 3 | Mirrored + hair-edited South → Create from Reference | This report |

## Identity consistency
- Hair: dark navy with **3 large spikes**. PASS (a few small side tufts remain at the temples).
- Skin and eyes: light skin, two ice-blue eyes. PASS
- Scarf: white, one trailing tail. PASS. The tail points screen-right (toward the facing side), so it does not trail *behind* the body in SE. Minor fix.
- Armor: light blue with silver trim, small silver diamond emblem. PASS
- Boots: dark blue with silver soles. PASS
- Two distinct arms and two distinct legs. PASS

## Sword hand
- South view: the sword is on screen-right, which is the anatomical **left** hand. PASS
- SE view: the sword is in the far, screen-right hand, which is the anatomical **left** hand. PASS
- Blade: cyan, angled diagonally down across the front of the legs. The tip is **clipped by 1–2 px at the bottom of the 64 px PixelLab canvas**. FAIL until a small pixel fix: redraw a 2–3 px tip, or shorten the blade.

## Silhouette at native scale
Readable at 1×: spiky head, blue body, white scarf and cyan blade all separate clearly.

## Deviations from the Character Bible
1. **Height is about 62 px, not 52.** Head with hair is about 28 px (10 of those are the spikes), torso about 16 px, legs about 17 px. Torso and legs match the spec; the head plus spikes is oversized, which is typical of chibi.
2. **The SE turn is weak.** The body reads close to a front view with only a slight turn to the right.
3. **The blade tip is clipped** at the bottom of the source canvas.
4. **The palette is not locked.** There are 48 unique colors, with shades around the 6 locked hues (`aerin_palette.json`). Quantizing to the locked ramps is possible but was not done without approval.
5. The scarf direction is described under Identity consistency.

## Limitations
- PixelLab always generates a South view first and then rotates it to 8 directions; a single direction cannot be generated alone. Only SE is delivered here.
- PixelLab ignores handedness written in the prompt. The anatomical left hand was only achieved by mirroring the reference.
- PixelLab sizes the character to fill the canvas box. Hitting exactly 52 px needs either a 56 px box from this reference, or a manual downscale and cleanup.
- Landmarks in `aerin_landmarks_se.json` are hand-estimated on an 8× grid and accurate to about ±1 px.

## v2 edits (Art Director fix list, `sua-se.py`)
| Fix | Done |
|---|---|
| Height 62 px → 52–54 px | Nearest-neighbor ×0.855, giving a **52 px** body (spike tip to sole); feet on y = 88 |
| SE turn too frontal | The far half of the body is squashed ×0.82 horizontally, so the far eye, shoulder and arm move toward the center |
| Scarf tail points forward | The tail is moved behind the body, pointing screen-left |
| Blade tip clipped | The tip is redrawn 3 px longer; it ends 6 px below the baseline, in front of the near leg |
| 48 colors | Normalized to 28 colors with the 6 hue groups kept |
| Outline loss from scaling | Missing outline pixels on outer edges are patched in black |

The unchanged PixelLab originals stay in `attempt3/`. Landmarks are recomputed through the same transform (`lam-landmarks.py`).
