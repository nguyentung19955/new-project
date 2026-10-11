# Báo cáo làn E1 — Cánh theo cấp bằng ảnh AI

Ngày 11/10/2026. Nhánh `khoi-tao-du-an`. Làm theo `lan-e1-canh-theo-cap.md`, `CHUNG.md`, mục II và IV của `QUYET-DINH-Q1-Q6.md`.

**Tóm tắt một câu:** game đã biết dùng ảnh riêng cho cánh cấp 1 và cấp 3, trang Tách Đồ đã có lô "Cánh theo cấp" để tách 8 ảnh đó; đã kiểm bằng ảnh mẫu máy tự dựng. **Chưa có ảnh ChatGPT thật**, nên trong game hôm nay chưa có gì đổi: việc còn lại là anh lấy prompt, nhờ ChatGPT vẽ một tấm, tách và gửi tệp .zip.

Phần "3 đồ lưng vẽ lại" của E1 đã xong từ trước (6 đồ lưng đã nhập lúc 11:25), phiên này không làm lại.

## 1. Danh sách tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/sprite_custom.js` | Chỉ phần cánh của `dinhNghia` (kèm 4 hàm nhỏ đặt ngay trên nó) và `noiTrangPhuc`. Game tìm ảnh `tp-wings-<loại>-1` cho cánh cấp 1, `tp-wings-<loại>-3` cho cánh cấp 3. Thêm cờ tắt `G.spriteCustom.CANH_THEO_CAP`. |
| `tools/tach-do/index.html` | Thêm lô **"Trang phục · Cánh theo cấp (8 món: cấp 1 và cấp 3)"** ở CUỐI danh sách, prompt riêng, nút lấy ảnh tham chiếu 4 cánh cấp 2, tự đặt gốc cánh trùng chỗ cấp 2, xem thử em bé mang cánh đúng cấp. Các lô cũ không đổi. |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Tệp do `python3 game/build.py` tạo lại. |
| `docs/review/trang-bi-e1/` | Báo cáo này, `PROMPT.md`, ảnh kiểm, ảnh tham chiếu, bài kiểm và số đo (`kiem/`). |

Không đổi: `game/build.py` (mã mới đã lọt qua danh sách cho phép sẵn có), cấu trúc bản lưu, định dạng `.sprite.json`, quy chuẩn điểm neo, mọi ảnh trong `game/art/custom` (không thêm, không sửa tệp nào), các tệp của phiên C5 và D2b.

## 2. Tóm tắt thay đổi và lý do

**Hiện trạng trước khi sửa.** Cánh có 4 loại (chuồn chuồn, lá, lửa, băng), mỗi loại 3 cấp. Khi vẽ bằng code, cấp 1 nhỏ và ít lá cánh (1 đến 2 lá, dài 11 đến 12 điểm ảnh), cấp 2 vừa (2 đến 3 lá, dài 15 đến 16), cấp 3 to nhất (3 đến 5 lá, dài 24 đến 26) và có thêm vài chấm sáng nhấp nháy. Nhưng từ khi có ảnh AI, **cả ba cấp dùng chung một ảnh cấp 2** (17×16 đến 18×18 điểm ảnh), nên nâng cấp cánh không thấy khác gì ngoài nhịp vỗ.

**Sau khi sửa.**
- Cánh cấp 1 tìm ảnh `tp-wings-<loại>-1`, cấp 3 tìm `tp-wings-<loại>-3` (loại: `chuon`, `la`, `lua`, `bang`). Cấp 2 vẫn dùng ảnh `tp-wings-<loại>` đang có.
- Cấp nào chưa có ảnh riêng thì dùng ảnh cấp 2 như hiện nay. Ảnh cấp 2 cũng không có thì vẽ code như cũ. Thiếu tệp không gây lỗi.
- Ảnh theo cấp đặt đúng chỗ như ảnh cấp 2: điểm "gốc cánh" của ảnh trùng điểm gốc cánh trên lưng em bé (lấy từ tệp `ghep-*` như cấp 2). Nếu sau này tệp ghép có ghi chỉnh riêng cho ảnh cánh cấp 2 thì ảnh cấp 1, cấp 3 cũng theo chỉnh đó.
- Cánh vẫn khoác rời khi em bé mặc thân theo bộ (không đụng phần đó).

**Trang Tách Đồ.** Lô mới lưới 4 cột × 2 hàng: hàng trên cấp 1, hàng dưới cấp 3. Cỡ từng ô đo từ cánh code cùng cấp:

| Loại | Cấp 1 | Cấp 2 (đang có) | Cấp 3 |
|---|---|---|---|
| Chuồn chuồn | 13×12 | 17×16 | 23×26 |
| Lá | 13×11 | 17×16 | 24×26 |
| Lửa | 13×13 | 18×17 | 23×28 |
| Băng | 14×12 | 18×18 | 25×24 |

Prompt dặn gửi kèm ảnh 4 cánh cấp 2; trang có nút dựng ảnh đó từ tệp đang có trong game (nền hồng tím, có lưới, 4 cánh cùng một tỉ lệ phóng). Nguyên văn prompt ở `PROMPT.md`.

## 3. Kiểm thử

Chỉ chạy đúng các kiểm brief ghi. Bài kiểm: `kiem/kiem-canh-cap.js`, số đo: `kiem/ket-qua.json`.

| Tiêu chí | Kết quả |
|---|---|
| `node --check game/js/*.js` | ĐẠT |
| `python3 game/build.py` | ĐẠT (bản một tệp 10,12 MB, trần 15 MB) |
| `node game/tests/cloud_save_regression.test.js` | ĐẠT (mọi dòng PASS) |
| Không có tệp ảnh mới: bản mới so với bản trước khi sửa | ĐẠT: **0 ô khác** trên 144 ô (4 em bé × 4 loại cánh × 3 cấp × đứng, chạy, đánh) |
| Ảnh mẫu máy dựng qua trang Tách Đồ | ĐẠT: thẻ **ĐẠT**, tìm được 8/8 món, lưới 4×2 |
| Nạp tạm 8 tệp vào game | ĐẠT: cấp 1 và cấp 3 đổi hình ở cả 48 ô mỗi cấp, cấp 2 không đổi ô nào |
| Gốc cánh lệch so với cấp 2 (yêu cầu không quá 1 điểm ảnh) | ĐẠT: lệch lớn nhất **0,5 điểm ảnh** trên 960 phép đo (4 em bé, 4 loại, 5 động tác, 6 khung, 2 cấp) |
| Cờ tắt `CANH_THEO_CAP = false` khi đang có 8 tệp | ĐẠT: hình về y như chưa có tệp (0 ô khác) |
| Gỡ 8 tệp | ĐẠT: hình về y như cũ (0 ô khác) |
| Chỉ có ảnh cấp 1 và 3, không có ảnh cấp 2 | ĐẠT: cấp 1 và 3 vẽ ảnh, cấp 2 vẽ code; gỡ hết thì về code |
| Lỗi trang khi chạy | Không có |
| Workflow sau khi đẩy | ĐẠT: xanh (xem mục 9) |
| **Ảnh ChatGPT thật** | **CHƯA KIỂM** (chưa có ảnh) |

## 4. Ảnh

- `anh-kiem.png`: Cu Tí mang cánh cấp 1 / 2 / 3 của cả 4 loại, 3 hàng đứng, chạy, đánh. Cấp 1 và cấp 3 trong ảnh là **ảnh mẫu máy dựng** (chép cánh cấp 2 rồi đổi cỡ, đổi màu), chỉ để thử đường đi, không phải hình cuối.
- `anh-tham-chieu-canh-cap-2.png`: ảnh gửi kèm ChatGPT.
- `anh/mau-may-dung-4x2.png`: tấm mẫu đã đưa vào trang Tách Đồ.
- `anh/trang-tach-do-lo-canh-theo-cap.png`: trang Tách Đồ sau khi tách (thẻ ĐẠT, xem thử cánh lửa cấp 3).

Ảnh "trước": vì chưa có tệp mới nên trong game trước và sau giống hệt nhau (0 điểm ảnh khác); cột "cấp 2" trong `anh-kiem.png` chính là hình cả ba cấp đang hiện trong game hôm nay.

## 5. Số đo dung lượng

4 ảnh cấp 2 đang có: 1,9 đến 2,3 KB mỗi tệp. Ảnh mẫu: cấp 1 nặng 1,3 đến 1,6 KB, cấp 3 nặng 3,2 đến 3,4 KB. Ước 8 tệp mới thêm **19 đến 25 KB** vào bản gói 10,12 MB (dưới 0,3%). Trang phục rời nằm trong tệp đầu của bản 2 tệp nên có ngay từ màn chào.

## 6. Rủi ro còn lại

1. **Chưa thử ảnh ChatGPT thật.** ChatGPT có thể vẽ cấp 3 có lá cánh rủ xuống thấp hơn gốc; khi đó công cụ có thể đoán sai chấm "Gốc cánh". Cách xử lý: chạm món đó ở bước 3, chạm lại đúng chỗ gốc cánh. Prompt đã dặn tránh việc này.
2. **Cánh cấp 1 rất nhỏ** (khoảng 13×12 điểm ảnh), chi tiết "nét lạ" gần như không đọc được ở cỡ này. Đây là cỡ của cánh code cấp 1, tôi giữ theo để không đổi cảm giác nâng cấp.
3. **Chấm sáng nhấp nháy của cấp 3** chỉ có ở cánh vẽ code; từ khi dùng ảnh AI đã không còn (trước phiên này cũng vậy). Prompt yêu cầu vẽ chấm sáng dính liền vào ảnh cấp 3 để bù. Muốn có nhấp nháy thật thì cần duyệt (mục 8).
4. Trong trang công cụ, nếu gỡ một tệp cánh giữa chừng khi đang nạp nhiều tệp cùng loại thì cấp còn lại có thể tạm vẽ code cho tới khi nạp lại. Trong game không xảy ra vì tệp không bị gỡ khi đang chơi.

## 7. Cách quay lui

- **Không cần sửa code:** chưa đưa tệp `tp-wings-*-1`, `tp-wings-*-3` vào `game/art/custom` thì game y như cũ. Đã đưa vào mà không ưng: xoá các tệp đó rồi chạy `python3 game/build.py`.
- **Cờ tắt:** `G.spriteCustom.CANH_THEO_CAP = false` (mọi cấp lại dùng ảnh cấp 2).
- **Gỡ code:** `git revert be9062c c8513a6` rồi `python3 game/build.py`. (`c8513a6`: game; `be9062c`: trang Tách Đồ.)

## 8. Quyết định mới cần duyệt

1. **Cỡ cánh theo cấp** như bảng ở mục 2 (cấp 1 khoảng 13×12, cấp 3 khoảng 24×26, theo cánh code). Nếu anh muốn cấp 1 to hơn cho dễ nhìn thì đổi số trong lô, không phải sửa game.
2. **Chấm sáng nhấp nháy cho cánh cấp 3 dùng ảnh AI:** hiện không có. Có muốn game vẽ thêm vài chấm sáng nhấp nháy đè lên ảnh cấp 3 như cánh code không? Việc này nằm ngoài phạm vi phiên nên tôi chưa làm.
3. **Phát hiện ngoài phạm vi, chưa sửa:** trong trang Tách Đồ, nút "Lấy ảnh bản thường của lô" của các lô vũ khí theo hệ tìm ảnh ở `index.html`; từ Đợt 10 trang chủ trên web là trang nhẹ không chứa ảnh, nên trên web nút này nhiều khả năng báo "chưa có bản thường". Sửa rất nhỏ (thêm `linh-khi.html` vào danh sách nguồn, như lô cánh mới đã làm). Tôi chưa kiểm trên web thật và chưa sửa vì không thuộc brief.

## 9. Trạng thái đẩy

Hai commit code đã đẩy lên `khoi-tao-du-an` (`c8513a6`, `be9062c`), workflow chạy số 201 xanh. Báo cáo này đẩy ở commit sau.
