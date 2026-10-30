# Attack 1 FX spec (ChatGPT Animation Director, 2026-10-30)

## When Lam needs a separate FX layer
- Required: horizontal/combo slash (energy crescent), upward/downward slash (arc in that direction), heavy/charged attack (big blade + charge phase), shield/parry (energy shield), chain/whip (energy chain).
- Not needed: dash, run, jump (flames and cloak only). Optional: dodge (small afterimage), hit/death/idle.

## Attack 1: horizontal energy crescent
- Separate FX sprite with its own transparent area, anchored to the wrist (do not squeeze it into the 128x128 body canvas).
- Position: chest height; the force starts at the front sleeve tip. Inner edge 0-3 px from the sleeve tip, with a visible energy joint.
- Sweep: front-top to front-bottom, following the front-to-back cut.
- Peak size: 36-44 px wide, 48-56 px tall. Curved crescent, both tips pointed, belly 9-12 px thick. The leading tip is brighter, the trailing tip is a thin tail; never a closed ring, never a shield shape.
- Colours (Lam palette only), core to edge: 119,224,248 -> 16,226,253 -> 7,181,251 -> 5,149,247 -> 3,116,228 -> 4,89,197. No black outline, no blur, no semi-transparency.

## Timing (5 FX frames over 8 body frames)
| Body | FX |
|---|---|
| F1-F2 | none (anticipation) |
| F3 | FX1: short 10-14 px blade forms at the wrist |
| F4 | FX2 PEAK: full crescent |
| F5 | FX3: two thin curved streaks |
| F6 | FX4: broken cyan streak, no bright core |
| F7 | FX5: 2-4 small pixel bits fading on the cut line |
| F8 | none (back to idle) |

Try PixelLab for the FX first; if unstable, pixel-draw the FX only. Never regenerate the body because of the FX.
