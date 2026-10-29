FAST PIXEL COMBAT — HTML + JAVASCRIPT
Open index.html in a modern browser (or serve with python -m http.server 8000).
A/D or arrows: move; Space/W: jump; J: attack (press again during each attack to queue the next combo hit); K/Shift: dash; R: reset dummy enemy.

Export from PixelLab as transparent PNG sprite sheets with frames arranged left to right. Each frame must be 128x128 px. Put the following files in assets/:
idle.png 6 frames, run.png 8, jump.png 3, fall.png 2,
attack1.png 5, attack2.png 6, attack3.png 7, dash.png 4,
hurt.png 3, death.png 8.
These are target frame counts, not PixelLab guaranteed output. If your actual exports differ, change the specs object in game.js. Missing sprites display a placeholder. Hitboxes are defined in JavaScript and are not taken from AI output. All timing values are starter tuning values.
