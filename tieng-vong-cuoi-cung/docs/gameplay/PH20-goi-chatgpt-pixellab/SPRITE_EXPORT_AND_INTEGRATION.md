# Xuất Sprite Sheet PixelLab → HTML Canvas

1. Tạo master sprite strict side view, hướng phải, nền trong suốt. Đề xuất canvas 128×128 cho demo (nhân vật có thể nhỏ hơn canvas), cố định palette, thiết kế giáp và vũ khí.
2. Trong PixelLab Creator, tạo từng animation từ cùng reference. Preview, kiểm tra frame lỗi, căn chân và độ ổn định silhouette. Tùy giao diện có thể xuất sprite sheet hoặc từng frame; nếu xuất từng frame thì ghép thành một hàng PNG bằng pixel editor.
3. Quy ước file trong `fast_combat/assets/`:
   - idle.png: 6×128 = 768×128
   - run.png: 8×128 = 1024×128
   - jump.png: 3×128 = 384×128
   - fall.png: 2×128 = 256×128
   - attack1.png: 5×128 = 640×128
   - attack2.png: 6×128 = 768×128
   - attack3.png: 7×128 = 896×128
   - dash.png: 4×128 = 512×128
   - hurt.png: 3×128 = 384×128
   - death.png: 8×128 = 1024×128
4. Nếu PixelLab xuất kích thước/số frame khác, chỉnh `W`, `H`, `specs` trong `fast_combat/game.js` và layout sprite sheet cho khớp. Không tự ý resize ảnh pixel art bằng bilinear.
5. Với một hàng ngang: source rect `sx=frameIndex*frameWidth`, `sy=0`, `sw=frameWidth`, `sh=frameHeight`. Loop frame: `floor(elapsedSeconds*fps)%frameCount`. Non-loop: `min(frameCount-1,floor(elapsedSeconds*fps))`.
6. Canvas: `ctx.imageSmoothingEnabled=false`; giữ tọa độ render nguyên pixel nếu muốn sắc nét; flip hướng trái bằng translate/scale và khôi phục transform.
7. Checklist: alpha transparency, frame order, sprite không rung, cùng pivot/ground line, không biến dạng vũ khí, run loop liền mạch, hitbox khớp frame, không có màu viền lạ, tách VFX.

## Combat demo hiện tại
`fast_combat/game.js` chứa `specs` và `ATTACKS`:
- attack1: duration 5/18 s, active 0.055–0.17 s, reach 82, damage 13.
- attack2: duration 6/20 s, active 0.06–0.19 s, reach 88, damage 15.
- attack3: duration 7/18 s, active 0.10–0.25 s, reach 105, damage 25.
Đây là thông số mẫu, không phải chuẩn cố định. Cần kiểm thử cảm giác gameplay và tương quan với sprite thực.

## Quy tắc state machine
Idle ↔ Run theo input ngang; Jump → Fall theo vận tốc Y; Fall → Land khi chạm đất; Attack dùng ưu tiên và cửa sổ combo; Dash có cooldown; Hurt/Death có ưu tiên riêng. Không để attack hitbox bật suốt animation.

## Cách chạy
Giải nén ZIP, vào `fast_combat/`, mở `index.html`. Nếu browser chặn tải file ảnh cục bộ: chạy `python -m http.server 8000` trong thư mục đó rồi vào `http://localhost:8000`.
