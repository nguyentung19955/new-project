# Ghép lớp Zed v2 — cách chạy lại và chỉnh điểm neo

Dành cho người không cần biết code: chỉ cần chép lệnh, chạy, rồi mở ảnh ra xem.

## 1. Chạy lại toàn bộ (từ thư mục gốc của repo)

```bash
python3 docs/anh-goc/zed/ghep-thu.py
```

Lệnh này làm tuần tự:

1. Tách 4 tấm `v2/00-than-dung-di-chay.png`, `v2/05-lop-giap-do.png`, `v2/06-lop-non-la.png`, `v2/07-lop-ao-choang.png` thành khung.
   Tấm nào **không đúng 8 khung × 3 hàng** thì lệnh **dừng** (in `LỖI`, mã thoát 1). Máy không tự cắt hay gộp hình cho đủ.
2. Đo điểm neo trên **từng khung**: mặt, mắt, hai sừng, cổ, eo, vai, lưng, chân. Trên đồ: vành nón, lỗ sừng của nón, cổ giáp, đai giáp, khuy áo choàng.
3. Ghép: áo choàng (sau lưng) → mặt dưới nón và dây nón (sau đầu) → thân → giáp → nón (có lỗ cho sừng).
4. Kiểm tự động, rồi ghi ảnh kiểm và báo cáo.
5. Chỉ khi **mọi kiểm bắt buộc đều ĐẠT** thì mới ghi các lớp chính thức vào `docs/anh-goc/zed/lop-ghep/`.

Kết quả nằm ở `docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/anh/`:

| Tệp | Xem gì |
|---|---|
| `luoi-dau-than-non.png`, `luoi-dau-than-tat-ca.png` | Đầu phóng to ×3 của cả 24 khung: mắt, mặt, sừng, nón, dây |
| `luoi-than.png`, `luoi-than-giap.png`, `luoi-than-non.png`, `luoi-than-ao-choang.png`, `luoi-than-tat-ca.png` | 8 khung × 3 hàng: thân, thân + từng món, thân + tất cả |
| `lop-*.png` | Từng lớp riêng, nền trong suốt |
| `gif-than-tat-ca-1-dung.gif`, `-2-di.gif`, `-3-chay.gif` (và `gif-than-non-*`, `gif-than-*`) | Phát động tác (phóng ×2, không nhoè) |
| `debug-neo-1-dung.png`, `-2-di.png`, `-3-chay.png` | Điểm neo vẽ lên ảnh (chỉ có trong ảnh debug, không có trong lớp thật) |
| `truoc-sau.png` | Cách ghép cũ (trên) so với cách mới (dưới) |
| `so-sanh-doi-co.png` | Thu nhỏ giáp bằng NEAREST (đang dùng), BOX, LANCZOS (cũ) |
| `bao-cao-kiem.json` | Số khung, tỉ lệ, số đo kiểm từng khung, lỗi, cảnh báo |

Màu trong ảnh debug: khung xanh lơ = vùng mặt được bảo vệ; khung xanh lá = hai mắt; khung vàng = sừng; chấm đỏ = cổ; cam = eo; xanh = lưng; tím = vai; cam đậm = hai đầu vành nón; hồng = lỗ sừng vẽ sẵn trên nón.

Tuỳ chọn:

- `--chi-kiem`: chỉ kiểm và xuất ảnh, không ghi lớp chính thức.
- `--day-non an`: bản thử bỏ dây nón (không ghi lớp chính thức).
- `--lech-non 12`: nón được lệch ngang tối đa bao nhiêu điểm ảnh quanh giữa đầu để lỗ sừng của nón trùng sừng thật.

## 2. Chỉ cắt một tấm ảnh thành khung

```bash
python3 docs/anh-goc/zed/cat-diem-anh.py docs/anh-goc/zed/v2/06-lop-non-la.png --hang 3 --so 8 --ten dung,di,chay --ms 150,112,75 --ra /tmp/non
```

- Đúng 8 × 3: ghi `khung-NN.png` (nền trong suốt), GIF từng hàng, `debug.png`, `bao-cao.json`.
- Sai số khung, khung nằm sai ô, hình chạm mép: **LỖI**, chỉ ghi `debug.png` + `bao-cao.json`.
- `--che-do phuc-hoi`: bản xem thử khi tấm bị dính hoặc vỡ hình. Máy được đoán chỗ tách hoặc gộp, nhưng **mọi khung đoán** có tên `-SUY-DOAN`, thư mục `-PHUC-HOI`, mã thoát 2. Đây không phải asset chính thức.
- `--cat-tay cat.json`: tự khoanh khung khi máy tách không tin được, ví dụ `{"1": [[40,10,210,260], ... đủ 8 hộp]}` (hàng đếm từ 1, toạ độ điểm ảnh trên tấm).

## 3. Chỉnh điểm neo bằng tay

Neo máy đo được ghi ở `docs/anh-goc/zed/neo/zed-v2.neo.json` (đừng sửa tệp này, mỗi lần chạy nó bị ghi lại).
Muốn chỉnh thì sửa `docs/anh-goc/zed/neo/zed-v2.neo.chinh-tay.json`. **Tệp chỉnh tay luôn thắng** tệp máy đo. Chạy lại lệnh ở mục 1 là thấy kết quả.

Toạ độ tính bằng điểm ảnh của tấm nguồn. Gốc (0,0) là góc trên-trái **khung bao** của hình đó (xem `khung_bao` trong `zed-v2.neo.json`). x tăng sang phải, y tăng xuống dưới. Khung đếm từ 1.

```jsonc
{
 "loai": "linh-khi-neo-chinh-tay", "phien_ban": 1,
 "than": { "chay": { "3": { "co": [150, 126], "mat": [113, 73, 190, 119] } } },   // sửa neo thân khung chạy 3
 "lop": {
   "non_la":    { "dung": { "1": { "lech": [0, -2] } } },     // nón khung đứng 1: dời lên 2 điểm ảnh
   "giap":      { "chay": { "5": { "lech": [2, 0] } } },      // giáp khung chạy 5: dời phải 2
   "ao_choang": { "di":   { "4": { "dat": [10, 100] } } }     // áo choàng khung đi 4: đặt hẳn góc trên-trái tại (10,100)
 },
 "ti_le": { "giap": 0.6 }                                       // đổi tỉ lệ giáp (cả 3 hàng)
}
```

Tên neo thân: `dinh_dau`, `tam_mat`, `mat` (hộp mặt bảo vệ `[x0,y0,x1,y1]`), `mat_mat` (hộp mắt), `sung_trai`, `sung_phai`, `co`, `eo`, `nguc`, `vai_sau`, `vai_truoc`, `lung`, `tay_cam`, `chan`.
Đặt tay một neo thì neo đó được ghi `"chinh-tay"` và bị xoá khỏi danh sách `can_chinh_tay`.

Cách nhanh hơn: mở trang ghép `spiritblade.web.app/tach-ghep-lop.html`. Thân Zed v2 trên trang đã có sẵn neo máy đo, gồm khung mặt màu xanh lơ, chấm sừng, và dòng "Cần chỉnh tay". Chạm để đặt lại neo đầu/lưng thì neo đó được tính là đã xác nhận. Xong bấm Xuất THÂN.

## 4. Quy tắc đã chốt

- Không sửa ảnh gốc. Không vẽ lại hay xoá mặt, tóc, sừng của Zed. Nón chỉ bị **đục lỗ đúng hình sừng** để sừng thật hiện qua.
- Dây nón và mặt dưới nón luôn vẽ **sau** thân, nên không thể cắt ngang mặt.
- Tỉ lệ 1 thì không đổi cỡ. Tỉ lệ khác thì thu bằng NEAREST, alpha chỉ 0 hoặc 255, không bao giờ dùng LANCZOS.
- Máy kiểm được bằng số: mặt có bị che không, sừng có bị che không, giáp có trôi khỏi người không, áo choàng có lộ phía trước không, alpha có trung gian không. Còn trông có **đẹp, tự nhiên** hay không thì phải người xem (`kiem_bang_mat` trong báo cáo).
