# Lam chibi — bộ kiếm âm thanh TOÀN THÂN (30/10, ChatGPT duyệt PASS) — thay bộ kiem/

Nguồn: PixelLab, nhân vật 9543423a-f854-4002-9a27-4c142452b0d9 = state "cầm kiếm âm thanh" của Lam (lưỡi kiếm LUÔN hiện).
Đòn chém: PixelLab V3 free-motion (cả người chuyển động) + sửa góc kiếm/vệt chém tại frame trúng đòn.
Đứng/chạy/bị đánh/chết: Skeleton v3 template từ state cầm kiếm. Hướng South-East = quay phải; quay trái lật gương.

| Clip | File (out/) | Khung | Frame | Thời gian từng frame (ms) | Trúng đòn | Engine |
|---|---|---|---|---|---|---|
| dung | dung/out/dung-0..3.png | 112×112 | 4 | 125 lặp | – | – |
| chay | chay/out/chay-0..5.png | 112×112 | 6 | ~90 lặp (theo quãng đường) | – | – |
| chem1 ↘ | chem1/out/chem1-0..4.png | 104×104 | 5 | 83,100,66,140,100 | index 3 | lao +10px (3px lấy đà F3, 7px vào F4), hitstop 25–30ms |
| chem2 ↗ | chem2/out/chem2-0..5.png | 104×104 | 6 | 55,75,85,115,70,85 | index 3 | lao +6px (F3→F4), hitstop 30ms, rung 1px |
| chem3 bổ | chem3/out/chem3-0..6.png | 104×104 | 7 | 80,90,110,90,160,100,100 | index 4 | lao +14px (4px lúc nhảy, 10px lúc bổ), hitstop 60ms, rung 2px |
| bi-danh | bi-danh/out/bi-danh-0..2.png | 112×112 | 3 | 83 | – | chớp trắng 50–70ms ở frame 2, đẩy lùi 3–5px |
| chet | chet/out/chet-0..6.png | 112×112 | 7 | 70,80,90,90,100,100, giữ frame cuối | – | – |

NEO: mọi khung đều căn GIỮA theo tâm canvas (PixelLab đệm đều 4 phía quanh state 96×96): khung 104 = khung 112 lệch (+4,+4).
Chân chạm đất (đáy ủng) ở khung 112 ≈ y 88–93; ở khung 104 ≈ y 81 (tương ứng y 85 trong khung 112).
Vệt chém + lưỡi kiếm đã có trong sprite → engine KHÔNG vẽ cung chém thêm. Hộp chém dài theo tầm lưỡi (~26 điểm sprite trước mặt).
Script: chem1/lam-chem1-v3.py, chem2/lam-chem2-v3.py, chem3/lam-chem3-v3.py, lam-hurt-death.py (dùng ../lam_pixel_lib.py). Ảnh gốc PixelLab: */goc/.
