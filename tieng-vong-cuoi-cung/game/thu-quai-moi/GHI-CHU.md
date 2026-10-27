# Trang thử 3 quái mới (vẽ từ mảnh + JSON)

**Mở trên iPhone (xoay ngang):**
https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-quai-moi/thu-quai-moi.html

> ⚠️ **CHƯA thử trên iPhone thật.** Mọi số dưới đây đo bằng Chromium headless (Playwright, GPU phần mềm). "Giả lập
> iPhone" chỉ giả cỡ màn, dpr 3, tên trình duyệt, cộng CPU chậm 4×. Đó không phải Safari, cũng không phải GPU Apple.

Đây là trang **riêng**, không sửa `game/demo.html`, `build-demo.py`, `demo-doi-chieu-v3.html` hay `thu-re-muc/`.
Art và ghi chú về từng con nằm ở `art/re-muc/quai-boss/GHI-CHU.md`.

## Trang làm gì
- Màn chờ có thanh nạp. Trang dùng `QBR.napThem('../runtime/quai-boss/','quai-moi-rig.json')` để nạp JSON và 23 PNG
  mảnh, giải mã, tạo sẵn ảnh trắng / tối / vàng cho mỗi ảnh, rồi vẽ thử một lần. **Xong hết mới vào trận**, nên lúc
  đánh không phải nạp gì thêm.
- Canvas logic 960×540, letterbox, bộ đệm = cỡ CSS × dpr, đất ở y = 448, 60 bước/s, giống demo. Bên trái có khối giữ
  chỗ **Lam 112** để so cỡ.
- Mỗi con chạy một máy trạng thái giả, theo **số gameplay đề xuất**:
  - **Nấm Mốc**: đứng → đi trái → đi phải → đấm → đứng → trúng → chết;
  - **Dơi Chuông**: bay → lao xuống → hồi → bay → trúng → rơi (trọng lực) → chạm đất vỡ;
  - **Mẹ Nấm Mốc**: đứng → quét → đập (2 sóng) → phun (3 đạn bào tử) → trúng → chết.
  Trạng thái được đổi ra clip bằng chính hàm runtime `QBR.capNhatNam / capNhatDoi / capNhatMeNam`. Dòng chữ trên đầu
  mỗi con cho biết nó đang ở trạng thái nào, ứng với clip nào, ms bao nhiêu, khung thứ mấy.
- Các nút:
  - **Nấm Mốc / Dơi Chuông / Mẹ Nấm Mốc / Cả ba**: chọn con;
  - **Hitbox**: bật/tắt khung xanh (thân) và khung đỏ (đòn lúc đang gây sát thương);
  - **Chậm ×4**: xem chậm;
  - **Đo lại** / **Ẩn số** / **Chép số**: chép toàn bộ số đo dạng JSON để gửi lại.
- Nháy trắng khi trúng đòn là **trang tự làm** (`QBR.ve(..., {trang})`, dùng ảnh trắng cache sẵn), clip không có nháy.

## Số đo (`so-do.json`, chạy `cong-cu/quay-va-do.py`)
Nạp là toàn bộ thời gian từ lúc bắt đầu tải tới lúc vào trận. Bộ nhớ giải mã giống nhau ở mọi lần đo: **23 PNG mảnh
(0,82 MB file) → 2,72 MB giải mã + 8,16 MB ảnh cache = 10,9 MB**. Gói này chung cho cả ba con.

| | Nạp | Vẽ quái / khung TB · p95 · tệ nhất | Khoảng cách khung TB | Giật / số khung | Giật lúc đổi động tác |
|---|---|---|---|---|---|
| Máy bàn – Nấm | 155 ms | 0,22 · 0,3 · 72,7* ms | 16,8 ms | 3 / 1090 | **0 / 19** |
| Máy bàn – Dơi | 180 ms | 0,09 · 0,2 · 1,6 ms | 16,7 ms | 0 / 868 | **0 / 17** |
| Máy bàn – Mẹ Nấm | 137 ms | 0,12 · 0,2 · 2,2 ms | 16,7 ms | 0 / 1248 | **0 / 31** |
| Máy bàn – cả ba | 128 ms | 0,22 · 0,4 · 2,7 ms | 16,7 ms | 1 / 1247 | **0 / 78** |
| Giả lập iPhone – Nấm | 419 ms | 0,26 · 1,2 · 5,1 ms | 24,7 ms | 315 / 740 | 12 / 19 |
| Giả lập iPhone – Dơi | 598 ms | 0,25 · 1,1 · 3,8 ms | 30,2 ms | 51 / 479 | 4 / 17 |
| Giả lập iPhone – Mẹ Nấm | 647 ms | 0,37 · 1,9 · 8,1 ms | 54,1 ms | 49 / 384 | 6 / 31 |
| Giả lập iPhone – cả ba | 478 ms | 0,58 · 2,4 · 10,2 ms | 57,5 ms | 57 / 360 | 13 / 73 |

\* Một khung lẻ ở đầu lần đo (trình duyệt headless dọn dẹp), không trùng lúc đổi động tác.

Đọc bảng:
- **Máy bàn** giữ 60 hình/s. Lệnh vẽ ba con mất dưới 0,5 ms mỗi khung, và **không lần đổi động tác nào bị giật**.
- **Giả lập iPhone**: máy giả chậm vì GPU phần mềm bị bóp CPU 4×. Trang `thu-boss` từng đo cho thấy ngay cả khi không
  vẽ gì thì máy giả này cũng chỉ được khoảng 28 hình/s. Lệnh vẽ vẫn nhỏ (TB < 0,6 ms). Phần chậm nằm ở bước tô điểm ảnh
  của GPU giả, nên số này chỉ để so tương đối, **không phải số của iPhone**. Cần anh mở link trên iPhone thật rồi bấm
  **Chép số** gửi lại.

## Video 60 hình/s (hitbox bật)
Mỗi khung video đúng bằng 1 bước logic.
| File | Nội dung |
|---|---|
| `video/nam-60fps.mp4` | Nấm Mốc: đứng, đi hai chiều, đấm (hộp đấm đỏ ở bước 5–10), trúng (nháy), chết (mũ rơi, bào tử) |
| `video/doi-60fps.mp4` | Dơi Chuông: bay, lao xuống (hitbox đỏ khi lao), hồi, trúng, rơi, vỡ |
| `video/menam-60fps.mp4` | Mẹ Nấm Mốc: đứng, quét (hộp đỏ), đập + 2 sóng, phun + đạn bào tử, trúng, chết |
| `video/ca-ba-60fps.mp4` | cả ba cùng lúc, 30 s |

Sóng xung kích và đạn bào tử trong trang thử chỉ là hình vẽ tạm bằng code, chưa phải art.

Ảnh chụp lúc đo: `chup-may-ban-<con>.png`, `chup-gia-lap-iphone13-cpu4x-<con>.png`.
Chạy lại:
```
python3 game/thu-quai-moi/cong-cu/quay-va-do.py video do
```
Cần Playwright, Chromium và ffmpeg.
