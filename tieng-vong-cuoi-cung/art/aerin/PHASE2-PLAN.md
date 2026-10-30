# AERIN – Phase 2 plan (Art Director, ChatGPT)

The Art Director approved this plan. Main approach: **Skeleton v3 plus pixel-exact hybrid edits**. Do not use V3 free-motion as a primary source, because it breaks identity, the sword hand and the weapon shape.
**Gate:** the new 80×80 state, with the sword angled down-right, must PASS the grip check before any animation is generated.

| Animation | PixelLab mode | Frames | Timing | QA PASS |
|---|---|---|---|---|
| Idle | Skeleton v3 – Breathing Idle | 4 | 150 ms/f | Breathing moves 1 px, feet stay still, sword stays pointing down-right |
| Run | Skeleton v3 – Running | 6 | 85 ms/f | Legs clearly alternate, scarf moves, sword never passes through the legs |
| Slash1 (diagonal down) | Hybrid: Idle/Run body + pixel-edited arm and sword + smear | 5 | 70 ms/f | Cut from high-right to low-right, torso rotates, forward step; impact on F4; lunge +5 |
| Slash2 (rising) | Hybrid: Run crouch + upward pose + smear | 6 | 65 ms/f | Crouch −2 px, spring up, rising impact on F4; lunge +7 |
| Slash3 (heavy chop) | Hybrid: Jumping template + overhead sword + impact | 7 | 80 ms/f | Bell charge, sword overhead, small jump, chop down on F5, squash and dust; lunge +9, hitstop 50 ms |
| Hurt | Skeleton v3 – Taking Punch | Generate 6, keep 3 | 80 ms/f | Clear recoil, sword stays in the left hand, face does not change |
| Death | Skeleton v3 – Falling Back Death | Generate 7, edit 6 | 100 ms/f | Clear fall, sword drops, eyes go dark, last frame stays still |

## Rules
- **Sword hand:** the sword is always in the anatomical **left** hand, which is the far, screen-right hand in SE. It may pass behind the shoulder or helmet, but must never switch hands.
- **Smear colors:** cyan core, white highlight, a restrained amber edge.
- **Smear size:** Slash1 r 24–30, 3–5 px thick; Slash2 r 26–32, 3–5 px; Slash3 r 30–36, 5–7 px.
- **Blade edits:** keep the original PixelLab blade pixels. Rotate the blade pixel-exactly around the hilt, then clean up by hand.
- **Body edits:** move whole pixel blocks; redraw joints by hand.
- **Feet and canvas:** baseline y88; airborne frames may rise, landings return to y88. Final canvas 96×96.
- **Forbidden:** resampling, automatic quantization, and V3 redraws of the face or helmet.
- **Full-body silhouette:** at the impact frame, the torso, shoulders, hips and feet must all change shape compared with the wind-up frame.
- **Order:** state → Idle and Run → Slash1 (test in-engine) → Slash2 and Slash3 → Hurt and Death.
