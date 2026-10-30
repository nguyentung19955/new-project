# Lam attack plan from reference rows 2, 3, 5 (ChatGPT Animation Director, 2026-10-30)

Owner decisions: Row 2 replaces the old Attack 1 (old one kept as a comparison only). Row 5 includes the whirlwind.
General: Lam holds no physical weapon. Energy grows from the sleeve tip into a blade, then fades into streaks. Body and FX are separate layers. Palette: 16,226,253 / 7,181,251 / 5,149,247 / 3,116,228 / 4,89,197, highlight 119,224,248. No black outline, no blur. With FX off, wind-up / strike / follow-through must still read.

## Row 2: Song Nguyệt Trảm (combo hit 1-2), 8 frames, 510 ms
PixelLab: great sword slash, East, Sidescroller, Fixed head Always.
| F | Pose | FX | ms |
|---|---|---|---|
| 1 | sleeves raised behind the shoulder, wide stance | - | 65 |
| 2 | lower the body, sweep at hip height back to front | low crescent 38x24 -> | 55 |
| 3 | arm fully extended right, torso turns | thin low streak 30x12 | 60 |
| 4 | pull the arms up over the shoulder, chest open | - | 75 |
| 5 | high horizontal sweep back to front | high crescent 46x28 -> | 45 |
| 6 | arms high in front (never over the mask), body follows | two high streaks 36x12 | 65 |
| 7 | arms back behind the shoulder, ready to step low | - | 65 |
| 8 | low lunge right, front leg extended | short push streak 18x8 behind the hand | 80 |
Skeleton: F2-F3 shoulders 4-6 px forward; F5-F6 arms 12-18 px above chest; F8 hips 8-10 px forward. F2 and F5 are separate impacts (can be split into two combo phases).

## Row 3: Thiên Trụy (heavy finisher), 7 frames, 555 ms
| F | Pose | FX | ms |
|---|---|---|---|
| 1 | wide stance, sleeves pulled high behind the head | charge 10x16 | 100 |
| 2 | hold wind-up, shoulders counter-rotated | energy blade 16x30 | 90 |
| 3 | chop from top down, body drives forward | vertical crescent 54x76 down-right | 45 |
| 4 | arms down near the ground, front knee bent | ground impact streak 42x12 | 65 |
| 5 | low slide right, cloak trailing | ground streak 30x6 | 70 |
| 6 | pull legs in, stand up, arms low | fading bits | 85 |
| 7 | back to combat stance | - | 100 |
Skeleton: arm path back-top to front-bottom; shoulders +6-8 px, hips +8-10 px. If F4-F5 look like standing with bent legs, try a running-slide template for those two frames instead of forcing it; do not turn Fixed head off for the whole animation.

## Row 5: Toàn Phong Trảm (launcher + special), 8 frames, 650 ms
F1-F5 from great sword slash (arm path low to high); F6-F8 from standing 1h magic attack or cast spell (charging pose), the whirlwind is FX around Lam (Lam does not spin 360).
| F | Pose | FX | ms |
|---|---|---|---|
| 1 | sleeves pulled low behind the hip | - | 80 |
| 2 | sweep along the ground back to front | low crescent 46x18 -> | 55 |
| 3 | pull from low to high, body extends | uppercut crescent 42x72 up-right | 45 |
| 4 | arms high, front leg pushes | thin vertical streak 28x54 | 65 |
| 5 | arms near the head, gathering energy | small ring 24x12 | 80 |
| 6 | energy starts spinning around the body | two spiral rings 64x46 | 75 |
| 7 | hold centre pose, cloak pulled by the vortex | tornado peak 80x96 | 90 |
| 8 | lower arms, vortex breaks | two broken arcs 54x32 | 160 |

Order: Row 2 first, owner checks the GIF, then Row 3, then Row 5.
