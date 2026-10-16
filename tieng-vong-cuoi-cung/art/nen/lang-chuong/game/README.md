# Nền Làng Chuông – bản dùng trong game

| File | Kích thước | Alpha | Màu | Parallax gợi ý |
|---|---|---|---|---|
| `xa.png` | 480×270 | không (RGB) | ≤ 32 | 0,2 |
| `giua.png` | 640×360 | chỉ 0 / 255 | ≤ 32 | 0,5 |
| `gan.png` | 640×360 | chỉ 0 / 255 | ≤ 32 | 1,15 |

- Màn hình gốc 480×270. Lớp giữa/gần rộng hơn để có chỗ trượt: đặt căn giữa (lệch −80, −45) rồi dịch `x = −camera × tốc độ`. Camera nên giới hạn khoảng ±69 px để lớp gần không hở mép.
- Phóng nguyên lần, tắt làm mịn (nearest / pixelated).
- Lớp xa đã giảm sáng ~35%, giảm bão hòa ~30%, pha xanh than #1A212B; lớp giữa giảm sáng ~20%; lớp gần giữ nguyên độ tối (khung viền). Ánh đèn lồng được giữ sáng ấm.
- Mặt lối đi dưới (lớp giữa) ở y ≈ 286 trong ảnh 640×360, tức y ≈ 241 trên màn hình.
- Làm từ `../lop-1-xa.png`, `../lop-2-giua.png`, `../lop-3-gan.png` (ảnh AI 1672×941): thu nhỏ theo màu đa số trong mỗi khối, ngưỡng alpha 160, bỏ vụn < 3 điểm ảnh.
- Xem thử: `tieng-vong-cuoi-cung/game/xem-thu/nen.html`.
