# Báo cáo Luồng D – Bố trí quái, báo đòn, đường đi / lưu, chống kẹt dây (P0 theo tư vấn chơi thử)

Làm theo `docs/tu-van-choi-thu-vung-1-chatgpt.txt` (mục 3 + phần P0).

## 1. Bố trí quái mới (mục 3 tư vấn)
Sửa trong `cong-cu-man/dung-phong.py` rồi chạy lại để ra `phong/*.json` (không sửa tay JSON nữa, để lần sau dựng lại không mất).

| Phòng | Quái bây giờ | Ghi chú |
|---|---|---|
| P01 | 1 Khuyết Cẩu (cột 33, đi tuần 29–37) | sau vùng học, cách cửa đông ≥ 9 ô |
| P02 | 1 Khuyết Cẩu sàn chính (cột 32) + 1 Hồn Vải trên gờ trái cao (cột 16, bay cao 2 ô) | Hồn Vải ở nhánh phụ, xa ngã ba, không thấy người đứng ở sàn chính |
| P03 | 1 Kèn Câm sau **bệ đúc mới** (khối 2×2 ô cột 45–46) + 1 Khuyết Cẩu tầng dưới phía tây sảnh | đạn kèn nổ ở bệ → đứng ở dây chuông (cột 42) là chỗ nấp; 2 quái cách nhau ~21 ô nên không bắn cùng lúc |
| P04 | 1 Màn Tang treo dưới **gờ trần mới** giữa hành lang (cột 39–41) + 1 Hồn Vải đoạn sau (phía tây, cột 8–16) | trần chỗ treo cách sàn đúng 3 ô → chỉ vồ khi người đi qua bên dưới |
| P05 | không quái | |
| P06 | 1 Khuyết Cẩu dưới hố + 1 Hồn Vải phía trên | hố không bị khoá (dây cột 31 + bậc đông luôn mở) |
| P09 | 1 Kèn Câm ở bờ xa bên kia giếng (tầng vào, cột 24–29) + 1 Màn Tang dưới **nanh đá trần mới** ở đường trên (T5, cột 28–30) | cách nhau 12 hàng → kích hoạt so le, không cùng lúc; bỏ Kèn Câm sát cửa ra P11 |
| P11 | chỉ Vọng Tàn | |
| P12 | chỉ trùm (tự sinh) | |

- **Không quái nào đi tuần trong vòng 7 ô quanh ô cửa** (công cụ kiểm tra tự báo lỗi nếu vi phạm).
- Sửa luôn lỗi lệch giữa `dung-phong.py` và JSON: đỉnh dây P02 cột 51 (luồng trước đã bịt bằng tay trong JSON).
- Ảnh phòng nướng của luồng C cho P03/P04/P09 đã nướng lại (`tools/vung-1/ve-phong.py P03 P04 P09`) để bệ đúc và gờ trần hiện đúng chỗ va chạm.
- Kèn Câm không đặt trên bệ cao vì đạn bay ngang ở độ cao ~2 ô so với chân: đứng cao hơn sàn người chơi thì bắn qua đầu, không trúng ai. Vì vậy "bệ" ở P03 là chỗ nấp trước mặt kèn, ở P09 là bờ bên kia giếng.

## 2. Engine `game/thu-mat-na/dong-co-mn.js` (sửa nhỏ)
- **Quái không ra đòn khi chưa hiện trên camera.** Tuỳ chọn mới `DongCoMN.khungNhin = {x, y, w, h}`. Có khung thì quái chỉ chuyển sang đánh/bắn khi thân đã lộ vào khung ít nhất 12 px. Không có khung (`null`, ví dụ phòng demo) thì bỏ qua kiểm tra, chạy như cũ.
- Vùng 1 cập nhật khung mỗi bước, trong `the-gioi.js` và `bao-don.js`, theo camera `V1.CAM` 960×540.
- **Đạn không xuyên tường:** đạn nổ khi tâm **hoặc mép trước** chạm ô đặc (`#`, `N`). Trước đây chỉ xét tâm.
- Phòng demo (`game/phong-demo`) và trang thử mặt nạ (`game/thu-mat-na`) vẫn chạy, không lỗi JS.

## 3. Báo đòn – file mới `game/vung-1/bao-don.js`
Thêm 1 thẻ `<script>` sau `ve.js` trong `index.html`. File này vẽ chồng lên khung hình, không sửa `ve.js`. Chỉ dùng màu ấm, không có cyan.
- **Vọng Tàn:** từ lúc giơ chuông tới khi đập, mặt đất hiện **dải gạch đứt đỏ gạch** nhấp nháy, lan 2 phía tới tầm sóng và dừng ở mép vực/tường đúng như sóng. Đo được: **≥ 0,9 s** trước khi sóng ra.
- **Màn Tang:** luôn có 2 dây vải treo hai bên thân. Khi sắp vồ, dây **rung** và **bụi, vụn đá rơi** từ trần. Đo được: **≥ 0,62 s** từ lúc báo tới khung vồ.
- **Khuyết Cẩu / Kèn Câm / Hồn Vải:** nòng tụ năng lượng (luồng C đã vẽ trong `ve.js`) cộng dấu "!" cũ. Thời gian từ lúc báo tới lúc bắn đo được: Khuyết Cẩu **≥ 0,90 s**, Kèn Câm **≥ 0,77 s**, Hồn Vải **≥ 0,65 s**. Tất cả đều ≥ 0,4 s.
- Ảnh tự xem: `cong-cu-man/xem/bao-don-tan.png`, `-tang.png`, `-ken.png`, `-cau.png`, `-vai.png`. Chụp lại bằng `node game/vung-1/cong-cu-man/chup-bao-don.js`.

## 4. Đường đi, lưu, chống kẹt dây
### Công cụ kiểm tra `cong-cu-man/kiem-tra.py` (luồng B) – thêm 3 mục
- Quái sát cửa (< 7 ô) → lỗi.
- Màn Tang: trần → sàn phải đúng 3 ô (để vồ được người đi dưới).
- **Mọi chỗ tới được (kể cả P11, P12) phải đi về được P05.** Tính cả tường nứt chém vỡ được từ hai phía, nhưng vẫn không dùng bật tường hay lướt.
- Kết quả: **0 lỗi, 0 cảnh báo.** 9 phòng nối đủ, cửa khớp 2 chiều, không hố một chiều.
- Lưu ý: rơi xuống đáy P06 rồi muốn quay lên P05 mà không bật tường thì phải leo dây cột 31 lên P02 và chém tường nứt cột 13. Đi tiếp P09 thì không cần.

### Playwright `cong-cu-man/kiem-tra-d.js` (kết quả ghi ở `cong-cu-man/xem/ket-qua-d.json`)
**Chống kẹt dây leo:** 5 tình huống × 20 lần. Mỗi lần thử bấm ngẫu nhiên (leo, bấm ngang/chéo, nhảy, lướt) rồi thử thoát. Tiêu chí: thoát trong ≤ 60 khung (1 s) và không lần nào lọt vào đá.

| Tình huống | Chỗ thử | Kẹt | Thoát chậm nhất |
|---|---|---|---|
| Góc | P01 dây cột 41 xuyên lỗ trần 1 ô | 0/20 | 3 khung |
| Sát trần | P02 dây cột 51, P04 dây cột 21 (leo kịch trần rồi bấm ↑ / chéo / nhảy) | 0/20 | 15 khung (0,25 s) |
| Sát cửa | P03 cột 57 (cửa đáy), P04 cột 57 (cửa trên) | 0/20 | 3 khung |
| Khi lướt | lướt khi đang bám (P02); lướt ngang vào dây rồi bấm ↑ (P03) | 0/20 | 3 khung |
| Đổi phòng khi đang bám | P02 ⇄ P06 (dây cột 9 ↔ 31), P04 ⇄ P03 (dây cột 57) | 0/20 | 8 khung |

**Quái**
- 128 phát bắn trong các lần thử, **0 phát nào bắn từ ngoài khung camera**. Khi cố tình đặt khung camera ra chỗ khác, quái không ra đòn lần nào.
- 0 viên đạn nằm trong đá.
- P03: đứng ở dây cột 42 trong 10 s → 0 lần trúng, đạn nổ ở cột 47, tức là ở mép bệ đúc.

**Lưu / tiến độ**
- Nhặt đồ và hạ quái ở P01, sang P02 rồi quay lại: đồ vẫn mất (đã nhặt), quái vẫn nằm.
- Tường nứt đã vỡ vẫn vỡ khi vào lại phòng.
- Nghỉ ở Chuông Lưu P05 rồi tải lại trang và chọn "Tiếp tục": về P05, giữ Chuông Vỡ, Mảnh Âm, đồ đã nhặt và tường vỡ.
- Chết ở P11 khi chưa nghỉ chuông P11 → tỉnh lại ở P05, cửa không bị khoá.
- Hạ Vọng Tàn, nghỉ chuông P11, rồi chết ở P12 → tỉnh lại ở P11 cạnh chuông (cột 51), cửa mở, Vọng Tàn không sống lại.
- Đi qua cửa ngược: P11 → P09 → P06 → P05 OK.
- Không lỗi JS.

## Chạy lại
```
cd tieng-vong-cuoi-cung/game/vung-1/cong-cu-man && python3 dung-phong.py && python3 kiem-tra.py
python3 tieng-vong-cuoi-cung/tools/vung-1/ve-phong.py      # nướng lại ảnh phòng (luồng C) nếu đổi lưới
cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &
node game/vung-1/cong-cu-man/kiem-tra-d.js                  # ~5 phút
node game/vung-1/cong-cu-man/chup-bao-don.js
```

## Còn lại / gợi ý
- Chưa có âm thanh, nên chưa có "âm báo" cho đạn kèn như tư vấn ghi. Hiện chỉ báo bằng hình: tụ năng lượng + dấu "!".
- Chết ở P12 mà chưa nghỉ chuông P11 thì về P05 (xa). Có thể tự thắp chuông P11 khi hạ Vọng Tàn – chờ người dùng quyết.
- Quái bay (Hồn Vải) vẫn chỉ "phát hiện" theo khoảng cách, chưa xét tường chắn tầm nhìn. Nhờ kiểm tra camera nên nó không bắn từ ngoài màn hình nữa.
