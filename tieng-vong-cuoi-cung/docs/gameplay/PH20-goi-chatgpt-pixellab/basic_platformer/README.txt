Pixel platformer demo (HTML Canvas + JavaScript)
Open index.html in a modern browser. If your browser blocks local image files, run a local web server, e.g. python -m http.server 8000, then open http://localhost:8000/.

Export horizontal PNG sprite sheets from PixelLab into assets/:
 idle.png: 6 frames; run.png: 8 frames; jump.png: 4 frames; fall.png: 2 frames; attack.png: 8 frames.
 Every frame must be 128x128, with identical ground alignment. For other sizes/counts, edit game.js.

Keys: A/D or arrows move; W/Up/Space jump; J attack.
No sprites are included; a placeholder character is drawn until you add them.
