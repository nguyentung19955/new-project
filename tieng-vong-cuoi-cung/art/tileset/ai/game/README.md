# Tileset AI – bản dùng trong game

- `tiles.png` (256×240, alpha chỉ 0/255): 235 ô 16×16, cùng tên và thứ tự với `game/lib/tiles.js`.
- `tiles.json`: vị trí từng ô (`o`) và nhóm (`nhom`).
- `game/lib/tiles-ai.js` nhúng sẵn `tiles.png` (data URI); đổi thẻ script từ `tiles.js` sang `tiles-ai.js` là dùng được. Ảnh giải mã không đồng bộ → chờ `TV.tiles.sanSang` (Promise) trước vòng lặp.
- Xem thử: `game/xem-thu/tiles-ai.html`.

## Cách làm (từ `../dat-reu.png`, `../da-tuong-leo.png`, `../vat-the.png`)
1. Bỏ nền hồng (kể cả viền hồng lẫn mép), lượng tử 64 màu, thu mỗi ô về 16×16 bằng màu đa số trong khối (~13–14 điểm ảnh/pixel); vật thể nhỏ (cửa, công tắc, gai) dùng màu trung bình khối rồi lấy màu gần nhất để giữ hình chuông.
2. Đất: phần đặc ghép từ nửa dưới các ô giữa (4 biến thể, không rêu, không viền); dải cỏ + rêu lấy từ mép trên ô AI, giọt rêu đo lại trên ảnh gốc, không cho giọt rêu chạm mép ô để ghép ngang khớp; rêu rủ ở góc ngoài vẽ tay bằng màu AI.
3. Đá: lưới 3×3 AI cắt bỏ khung, ghép 9 vùng theo hướng lộ ra; mép giáp ô cùng loại không viền nên đá cuội nối liền. Tường leo: ván gỗ AI + đinh đồng chỉ ở mép lộ.
4. Viền #0C0F14 chỉ vẽ ở mép lộ ra ngoài; góc ngoài bo tròn; góc trong là ô phủ thêm.
5. Mỗi nhóm (đất / đá + tường / vật thể) giảm còn ≤ 32 màu. Đất sáng thêm 12 %, tường 8 % để nổi trên nền parallax.
6. Mã dựng lại: `cong-cu/` (Python + Pillow, numpy; chạy `export.py` rồi `gen_js.py`, sửa đường dẫn thư mục làm việc trong `core.py`).
