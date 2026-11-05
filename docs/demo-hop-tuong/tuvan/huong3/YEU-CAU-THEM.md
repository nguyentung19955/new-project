# Extra requirement from the user (23:07): read this before wiring the facing logic

User: "nên để hoạt ảnh đi theo hướng của lane, còn khi nào dùng skill thì mới quay về hướng của bàn"

Meaning: the walk animation must always follow the LANE direction. That is:
- side view when the lane runs horizontally (mirrored or right/left strip);
- back view when it runs up;
- front view when it runs down.

The enemy turns to face the BOARD (the player's turrets) ONLY while it is using a skill / ability / attack:
- play the fx / attack strip facing the board;
- then return to the lane-direction walk.

This applies to all enemies: normal, elite, miniboss and boss, in every mode.
- Boss intro: a brief face-the-screen moment is OK.
- No other "facing the screen" while walking.
