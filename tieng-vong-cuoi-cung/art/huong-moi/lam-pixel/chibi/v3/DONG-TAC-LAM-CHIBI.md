# Lam chibi — bộ động tác South-East (đã khoá, ChatGPT duyệt PASS)

Hướng gameplay: South-East; quay trái = lật gương (mirror). Nền trong suốt.
Khung 64×64 (gốc canvas PixelLab 96×96 cắt từ (16,16)). Riêng Chết: 80×72, lệch (-8,0) so với khung 64 — chân cùng mặt đất.

| Động tác | Thư mục / file | Frame | FPS | Lặp | Ghi chú |
|---|---|---|---|---|---|
| Đứng thở | idle-se/idle-se-0..3.png | 4 | 8 | có | Skeleton v3 Breathing Idle |
| Chạy | run-se/run-se-0..5.png | 6 | 10–12 | có | Skeleton v3 Running 6, đã sửa áo choàng + fork |
| Chém 1 (ngang) | chem1-se/hybrid/chem1-0..4.png | 5 | 12 | không | impact F3; cung âm thanh vẽ bằng code F3 (amber+cyan) → F4 (cyan mờ) |
| Chém 2 (vung chéo lên) | chem2-se/chem2-0..4.png | 5 | 12 | không | impact F3; cung chéo từ thấp lên cao, cách mũ ≥2px |
| Chém 3 (chuông cộng hưởng) | chem3-se/chem3-0..6.png | 7 | 12 | không | F3–F4 chuông tích lực, impact F5 + hitstop 50ms, sóng âm kép F5, dư âm F6 |
| Bị đánh | hurt-se/hurt-0..2.png | 3 | 12 | không | ~250ms; chớp trắng 40–60ms + đẩy lùi bằng code |
| Chết | death-se/death-0..5.png | 6 | 10 | không | giữ frame cuối; fork rơi nằm cố định trên đất |

File *-xem-vfx.png / .gif chỉ để xem thử (VFX nằm trong ảnh); VFX thật vẽ bằng code, sprite sạch không có VFX.
Script tái tạo: lam_pixel_lib.py, chem1-se/hybrid/lam-chem1.py, lam-chem23.py, hurt-se/lam-hurt.py, death-se/lam-death.py.
Nhân vật PixelLab: 0f7281b2-9a4f-4580-ab5d-19a2e05b75ed (64×64, side view).
