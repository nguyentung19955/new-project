# Prompt PixelLab Creator — dùng cùng master sprite làm reference

## Nguyên tắc
Giữ strict side view, hướng phải, cùng nhân vật/mũ/giáp/kiếm, fixed camera, nhất quán tỷ lệ và màu. Xuất transparent PNG. Tạo từng animation riêng; với attack/dash nên chỉnh key pose nếu AI làm méo.

## Idle (6 frame, playback 8 FPS)
Subtle breathing idle, slight shoulder movement, gentle cloth sway, feet remain planted, seamless loop, fixed side view.

## Run (8 frame, playback 14 FPS)
Detailed dark fantasy pixel art warrior, fast sprinting cycle to the right, strict side view, forward leaning torso, dynamic alternating leg strides, subtle cape movement, consistent armor silhouette, fixed camera, seamless loop.

## Attack 1 (5 frame, playback 18 FPS)
Detailed dark fantasy pixel art warrior performing one quick horizontal sword slash to the right, short anticipation, explosive forward swing, clear recovery pose, consistent armor and sword, strict side view, fixed camera.

## Attack 2 (6 frame, playback 20 FPS)
Same pixel art warrior performing a fast reverse sword slash from right to left as the second combo strike, strong torso rotation, short recovery, consistent costume and proportions, strict side view, fixed camera.

## Attack 3 (7 frame, playback 18 FPS)
Same dark fantasy pixel art warrior performing a powerful finishing sword slash with a short forward lunge, dramatic follow through, strong readable silhouette, consistent armor and weapon, strict side view, fixed camera.

## Dash (4 frame, playback 20 FPS)
Detailed dark fantasy pixel art warrior performing a very fast forward dash to the right, low streamlined body pose, trailing cloth movement, stable armor design, strict side view, no camera movement.

## Jump/Fall/Hurt/Death
Tạo từng clip riêng từ cùng master sprite. Jump nên tách rising/falling/landing khi cần, không gộp mọi chuyển động nhảy vào một clip dài. Hurt ngắn, Death không loop.

## Lưu ý về attack
Anticipation → Strike → Recovery. Thời gian các giai đoạn không nhất thiết đều nhau. Tách slash effect, máu, bụi, ánh sáng khỏi sprite nhân vật. Hitbox phải do code điều khiển, không lấy từ hình ảnh AI.
