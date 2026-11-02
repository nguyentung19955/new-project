# 001 – Khung hộp thoại
- **Trạng thái:** XONG (02/11, phiên chính vẽ bằng ChatGPT)
- **Dùng vào:** hộp thoại dùng chung (game/cot-truyen/hop-thoai.js) – mọi lời nhân vật phụ ở làng và các vùng. Chưa có ảnh này thì hộp thoại tắt.
- **Mô tả:** khung hộp thoại kiểu chuông đồng/rễ cây cổ, hợp phong cách Vùng 1 (xem art/vung-1/, art/giao-dien/). Lòng khung tối đặc (#0C0F14 hơi trong cũng được) để in chữ sáng #F3E6C8 lên; viền đồng #9C6B30/#E1B85A, có thể có rễ nhỏ quấn góc. Phần trái chừa ô vuông cho chân dung (≈ chiều cao lòng khung). Không chữ, không hoạ tiết rối ở lòng khung.
- **Số khung:** 1 (tĩnh).
- **Cỡ:** tỉ lệ ≈ 6:1, xuất PNG trong suốt rộng 1728 px (game vẽ rộng 90% màn 960 → ~864 px logic, @2x).
- **Hướng gốc / neo:** không lật; neo = đáy-giữa.
- **Lưu:** art/cot-truyen/hop-thoai/khung.png (+ khung-nguon-chatgpt.png). Ghi lại trong file này lề trong (px) của ô chân dung và vùng chữ.

## Kết quả
- art/cot-truyen/hop-thoai/khung.png (1728×406, nền trong suốt) + khung-nguon-chatgpt.png.
- Bố cục (tỉ lệ theo ảnh, [x, y, rộng, cao]): ô chân dung [0.037, 0.155, 0.152, 0.645]; vùng chữ [0.228, 0.12, 0.74, 0.74]. Đã ghi sẵn trong hop-thoai.js (O_KHUNG); đoạn thoại có thể ghi đè bằng "o_khung".
