# Lam chibi — bộ "kiếm âm thanh" (30/10, ChatGPT duyệt PASS)

Thay cho bộ đòn cũ (chọc nĩa như đũa phép). Nĩa = chuôi/chắn tay; khi chém, lưỡi sáng (lõi cyan, viền amber) bung ra giữa hai chạc.
Khi nghỉ: nĩa cầm chéo -55° bên hông, không có lưỡi. Hướng South-East = quay phải, quay trái lật gương.

| Clip | File | Khung | Frame | FPS | Ghi chú |
|---|---|---|---|---|---|
| dung | kiem/dung/dung-0..3.png | 64×64 | 4 | 8 | lặp |
| chay | kiem/chay/chay-0..5.png | 64×64 | 6 | 10 | lặp |
| chem1 (↘) | kiem/chem1/chem1-0..4.png | 96×96 (thân ở 16,16) | 5 | 12 | impact F3 (index 2) |
| chem2 (↗) | kiem/chem2/chem2-0..4.png | 96×96 | 5 | 12 | impact F3 (index 2) |
| chem3 (bổ) | kiem/chem3/chem3-0..6.png | 96×96 | 7 | 10 | impact F5 (index 4), hitstop 50ms + rung camera 1–2px |
| bi-danh | kiem/bi-danh/bi-danh-0..2.png | 64×64 | 3 | 12 | chớp trắng + đẩy lùi bằng code |
| chet | kiem/chet/chet-0..5.png | 80×72 (thân ở 8,0) | 6 | 10 | giữ frame cuối |

Vệt chém (smear) đã vẽ SẴN trong sprite đòn chém → engine KHÔNG vẽ thêm cung chém riêng (có thể giữ chuông sáng chém 3 + hitstop/rung).
Neo: thân trong khung 96 nằm ở (16,16), trong khung 80×72 ở (8,0) — chân cùng mặt đất với khung 64.
Script: kiem/lam-kiem.py (dùng lam_pixel_lib.py).
