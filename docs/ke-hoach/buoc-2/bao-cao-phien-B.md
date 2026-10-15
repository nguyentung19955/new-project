# Bước 2 — Báo cáo Phiên B: Việc hôm nay (việc làng hằng ngày của Anh Mõ)

Làm 15/10/2026 theo `KE-HOACH.md` mục 1.0, 1.2, 2, mục 4 "Phiên B", đoạn "Tránh đụng nhau"; `bao-cao-phien-0.md` (API sự kiện / ngày / bản lưu);
`QUYET-DINH.md` (Q1–Q10 theo đề xuất); `LUAT-CAN-BANG.md`. Nhánh `khoi-tao-du-an`. Không đụng master, không PR, không đổi đăng nhập Google /
lưu mây / `?cloud=0`. Không sửa phần Ông Từ (Phiên A, C đang làm).

## 1. Đã làm gì

| Tệp | Thay đổi |
|---|---|
| `game/js/viec_ngay.js` (mới) | Toàn bộ hệ "Việc hôm nay": chọn 3 việc, đếm tiến độ (nghe sự kiện của `su_kien.js`), nhận thưởng, đổi việc, rương ngày, dải tuần + rương tuần, tự cộng thưởng quên nhận, thẻ ở Anh Mõ, dòng báo trong ải, dòng ở bảng kết quả, bảng xem trong Tạm dừng. |
| `game/js/data.js` | Khối riêng **cuối tệp** (có chú thích) `G.VIEC_NGAY`: 22 mẫu việc, bảng thưởng 3 mức, rương ngày / tuần, số ngày cần cho rương tuần; cờ `G.VIEC_NGAY_BAT`. |
| `game/js/stage.js` | Bảng Tạm dừng: hàng "✉ Góp ý" chia đôi với nút **"Việc hôm nay"** (chỉ hiện khi hệ đang mở). 3 dòng. |
| `game/index.html` | Thêm `<script src="js/viec_ngay.js">` sau `luc_chien.js` (sau `village.js`, trước `cloud.js`). |
| `game/tests/viec_ngay.test.js` (mới) | Bài Node 36 điều kiện (mục 4). |
| `game/tests/viec_ngay_shots.py` (mới) | Ảnh soát tĩnh `xem-viec.png` + soát chữ bị cắt ở cả 22 mẫu (VI + EN). |
| `game/tests/su_kien.test.js` | Mục 8 (kiểm khung thẻ của Phiên 0) tạm thay hàm thật bằng hàm rỗng rồi trả lại — để bài Phiên 0 vẫn qua khi Phiên A / B / C đã điền thẻ. |
| `docs/ke-hoach/buoc-2/xem-viec.png` | Ảnh soát tĩnh (mục 5). |
| `game/dist/*`, `tools/xuong-sprite/*` | Sinh lại bằng `python3 game/build.py`. |

Không sửa `village.js`, `village_scene.js` (Phiên 0 đã nối sẵn hàng thẻ Anh Mõ và chấm đỏ qua `PANELS.viecNgay.cham`).

### Người chơi thấy gì
- **Anh Mõ**, thẻ đầu **"Việc hôm nay"** (Cài đặt thành thẻ thứ hai). Dòng đầu: thứ · ngày | "Đổi việc: còn 1 lần" | "Ngày mới sau hh:mm:ss".
- **3 thẻ việc** (Dễ / Vừa / Khó): biểu tượng, câu việc, thanh tiến độ (12/30), mức + thưởng, nút **Nhận** khi xong (sau đó "Đã nhận"),
  nút **Đổi** khi chưa xong (bấm 2 lần cho chắc, vì mất phần đã làm).
- **Rương ngày** (mở khi xong 3/3) và **dải tuần** T2 → CN: ngày xong 3/3 được đóng dấu trống đồng; đủ 5 ngày → nút **Mở rương tuần**.
- Anh Mõ có **chấm đỏ** khi có việc xong chưa nhận / rương chờ mở / có phần "quên nhận" vừa tự cộng.
- Quên nhận: sang ngày mới, việc đã xong + rương ngày tự cộng; sang tuần mới, rương tuần đủ ngày mà chưa mở cũng tự cộng. Mở bảng Anh Mõ thì
  Anh Mõ nói "Hôm qua bé quên nhận: +420 vàng, 10 quặng, 3 đá, 12 linh khí" (một lần).
- **Trong ải**: xong một việc thì dòng báo vàng "Xong việc: Hạ 30 quái!" (không đè dòng báo khẩn). **Bảng kết quả** thêm 1 dòng
  "Việc hôm nay: 2/3" (cả ải ngày). **Tạm dừng** có nút "Việc hôm nay": bảng xem tiến độ 3 việc + rương ngày, nút "‹ Trở lại" (Esc cũng đóng), không nhận thưởng.
- Mở sau khi **qua ải Rừng già 2** (Q1 = a). Trước đó Anh Mõ y như cũ.

### Luật (đúng kế hoạch)
- Ngày theo giờ máy (`G.ngay`, trùng ải ngày, đổi lúc 0 giờ). **Ngày lùi giờ máy**: giữ nguyên việc + tiến độ, không ra việc mới (chỉ tiến khi ngày > `nv.cuoi`).
- Chọn việc theo hạt giống `ngày + nv.hat` (hạt riêng của bản lưu, đi theo lưu mây) → tải lại / đổi máy ra đúng 3 việc. Lọc mẫu hợp tiến độ
  (ví dụ chưa có vũ khí Thức tỉnh thì không ra "phản ứng hệ"; chưa mở ải ngày / hết lượt thì không ra "Thắng 1 lượt Ải ngày").
  Chọn ô Khó trước, rồi Vừa, rồi Dễ; khác nhóm; tránh mẫu của hôm qua nếu còn mẫu khác (chọn tham lam bị kẹt thì thử thêm tối đa 7 hạt giống phụ
  `ngày:hạt:lần`, lấy bộ đầu tiên ít trùng hôm qua nhất — sửa theo ghi chú của Phiên A khi gộp sổ); mức thiếu mẫu thì lấy mẫu mức thấp hơn, thưởng vẫn theo ô.
- Đếm từ lúc nhận việc; tính ải thường, ải ngày, độ khó 2; **không tính ải hướng dẫn**; thua ải vẫn giữ số đã làm.
- Mẫu "Hạ 8 con <quái có trang sổ>" và "Tìm ra điểm yếu của 1 quái mới" đọc `sv.so` của Phiên A: chưa có Sổ yêu quái (hoặc sổ chưa đủ 3 trang ★) thì hai mẫu này tự không ra.
  "Tìm ra điểm yếu" đếm số trang `k = 1` **tăng thêm** từ lúc nhận việc (không phụ thuộc thứ tự nghe sự kiện với Phiên A).
- "Hạ 12 quái bằng <vũ khí ít dùng nhất>": đếm số quái hạ theo loại vũ khí từ bản này (`nv.vk`), chọn loại ít nhất. "Kết liễu bằng đòn <hệ>": xoay theo ngày
  giữa các hệ bé đã có vũ khí Mầm trở lên; đòn chưởng không tính. "Về thăm <vùng>": vùng cũ (bỏ vùng mới nhất) ít sao nhất.
- Mức thưởng theo trùm vùng cao nhất đã hạ (mọi độ khó), tính lúc nhận.

### Bản lưu (`sv.nv`, đúng mục 2 kế hoạch, thêm vài trường nhỏ)
`{ v, hat, cuoi, ds:[{ m, x, can, d, nhan, o (ô 0/1/2), b? (mốc sổ) }], doi, ruong, hom, tuan:{ ma, ngay }, tuanNhan, demRuong, vk?:{ sword… }, gapTT?, quen? }`
— `vk` đếm quái theo vũ khí, `gapTT` đã gặp phòng thử thách, `quen` phần vừa tự cộng (xoá khi đã báo). Cỡ ~300 byte. Không thêm vào `G.newSave`.
`G.fixSave` của Phiên 0 giữ nguyên các trường này (kiểm ở mục 4.8). Phiên C đọc `sv.nv.demRuong` (số rương ngày đã nhận, cả rương tự cộng).

## 2. Commit

- `ebcd0c4b` — Phiên B: `viec_ngay.js`, khối `G.VIEC_NGAY` cuối `data.js`, nút Tạm dừng, bài Node, ảnh soát, dist.
- `071acdd0` — báo cáo này.
- Commit sửa sau khi gộp Phiên A + C: chọn việc thử thêm hạt giống phụ để không lặp việc hôm qua khi có sổ (bài `viec_ngay.test.js` PASS 36 lại);
  sau gộp: `su_kien.test.js` 83, `so_yeu_quai.test.js` 41, `thanh_tuu.test.js` 35, `cloud_save_regression` đều PASS.

## 3. Cờ quay lui

`?viecngay=0` (`G.VIEC_NGAY_BAT = false`): thẻ "Việc hôm nay" ẩn (giữ hàm rỗng của Phiên 0, Anh Mõ chỉ còn Cài đặt), không đếm, không thưởng,
không nút Tạm dừng, không dòng ở bảng kết quả. Dữ liệu `nv` trong bản lưu giữ nguyên, bật lại là chơi tiếp. `?sukien=0` cũng tắt cả hệ.

## 4. Cách kiểm (đã chạy, không chơi thử bằng trình duyệt)

```
node --check game/js/viec_ngay.js game/js/data.js game/js/stage.js
python3 game/build.py                            # ra dist/ không lỗi
node game/tests/viec_ngay.test.js                # PASS — 36 điều kiện (~1 phút)
node game/tests/su_kien.test.js                  # PASS — 83 điều kiện (bài Phiên 0 vẫn qua)
node game/tests/cloud_save_regression.test.js    # PASS
python3 game/tests/viec_ngay_shots.py            # ảnh soát xem-viec.png + soát chữ bị cắt (0 chỗ, VI + EN)
```
`viec_ngay.test.js` chạy hai bản game qua `tests/node_trang.js` (bản thường và `?viecngay=0`), **ngày giả** bằng cách thay `Date` trong trang
(lưu ý: `tests/bot_nang.js` thay `G.aiNgay.homNay` bằng ngày giả của bot, bài này đặt lại):
1. Chưa qua Rừng già 2: không mở, không ra việc; qua rồi: thẻ hiện trước Cài đặt, Anh Mõ mở thẻ này trước.
2. Cùng hạt giống + cùng ngày → cùng 3 việc (Dễ / Vừa / Khó, khác nhóm); tải lại bản lưu qua `G.fixSave` vẫn vậy; 12 hạt khác → 8–10 bộ khác;
   13 ngày liền không ngày nào lặp việc của hôm qua.
3. Ngày lùi (20/10 → 18/10): giữ việc + tiến độ; về 20/10 không ra việc mới; 21/10 mới có.
4. Đủ 22 mẫu đếm đúng điều kiện; ải hướng dẫn không tính; "tìm điểm yếu" chỉ đếm trang mới; **bot thắng ải 0-2 thật**: đếm đúng số quái hạ, qua ải 1/2,
   bảng kết quả có đúng 1 dòng "Việc hôm nay: 0/3".
5. Nhận đúng thưởng mức 1 (60 + 90 + 120 vàng, 2 + 3 + 4 quặng), nhận một lần; rương ngày 2 đá + 8 linh khí; đóng dấu đúng ô; 4 ngày chưa có, ngày thứ 5
   (bỏ một ngày) có rương tuần 1 bùa + 5 đá; mức 1 / 2 / 3 theo trùm vùng (cả độ khó 2).
6. Quên nhận: hôm sau tự cộng 2 việc (mức 2) + rương ngày; mở bảng thì Anh Mõ báo một lần rồi xoá; sang tuần mới tự cộng rương tuần; không quên thì không báo.
7. Đổi việc: ra mẫu khác, khác nhóm, tiến độ về 0; mỗi ngày 1 lần.
8. Vẽ thẻ VI + EN không lỗi; chữ việc có bản tiếng Anh; chấm đỏ Anh Mõ; Tạm dừng có nút, bảng xem vẽ được, Esc đóng về Tạm dừng; `nv` qua `G.fixSave` y nguyên.
9. `?viecngay=0`: thẻ ẩn, không ra việc, không đếm, không nút, không dòng kết quả.

## 5. Ảnh soát tĩnh — `docs/ke-hoach/buoc-2/xem-viec.png`

2 × 2 ô (khung game 480×270 phóng 2 lần): trên là tiếng Việt, dưới là tiếng Anh; trái là thẻ "Việc hôm nay" ở Anh Mõ (1 việc xong chờ Nhận, 1 việc làm dở,
1 việc chưa làm, dải tuần đã đóng dấu T2 + T4, hôm nay viền vàng), phải là bảng xem trong Tạm dừng. Mọi chữ đặt bằng `T.chuTrongKhung` trong lòng khung;
`viec_ngay_shots.py` đặt lần lượt cả 22 mẫu (tham số dài nhất) vào thẻ và đếm `T.chuDo.cat` = **0** ở cả VI và EN (câu "Nâng cấp ở làng" đã rút ngắn cho vừa).

## 6. Cân bằng (theo `LUAT-CAN-BANG.md`)

**Thêm mỗi ngày (bé làm đủ 3/3 và nhận hết)** — đúng bảng kế hoạch mục 1.2 (Q4 = a), không đổi sức mạnh, không đổi luật đánh:

| | Mức 1 (chưa hạ Mộc Tinh) | Mức 2 | Mức 3 |
|---|---|---|---|
| 3 việc | 270 vàng + 9 quặng | 540 vàng + 13 quặng | 900 vàng + 18 quặng |
| Rương ngày | 2 đá + 8 linh khí | 3 đá + 12 linh khí | 4 đá + 16 linh khí |
| Rương tuần (5/7 ngày, chia 7) | ≈ 0,14 bùa + 0,7 đá / ngày | ≈ 0,14 bùa + 1,1 đá / ngày | ≈ 0,14 bùa + 1,7 đá / ngày |

Mỗi lượt ải (8 lượt / ngày như mô hình bot): mức 1 ≈ +34 vàng, +1,1 quặng, +0,3 đá, +1 linh khí mỗi lượt.

**Đo bằng bot Node** (`tests/cay.py 12 --node --ngay=8`, 12 lượt chiến dịch, 8 lượt ải = 1 ngày giả; bot không bấm Nhận nên thưởng đến qua đường
**tự cộng hôm sau** = giống bé nhận hết; "không" = cùng lệnh với `--pre=G.VIEC_NGAY_BAT=false`). Mỗi bên chạy 2 lần, lấy trung bình:

| | Không có Việc hôm nay | Có Việc hôm nay | Lệch |
|---|---|---|---|
| Số lần chơi qua 15 ải | 38 (37 / 39) | 37,5 (38 / 37) | −1,3 % (luật: không giảm quá 10 %) |
| Thời gian qua 15 ải | 183,5 phút | 182 phút | −1 % |
| Sức mạnh lúc qua 3-5 | 584 | 584 | 0 |
| Vàng còn lúc qua 3-5 | 1741 | 1753 | ≈ 0 (nhiễu giữa 2 lần chạy ±300) |
| Quặng còn lúc qua 3-5 | 147 | 208 | **+60** |
| Linh khí còn lúc qua 3-5 | 412 | 498 | **+85** |
| Ải ngày (thắng / lượt) | 100 % | 100 % | 0 |

Số lần chơi từng ải lệch trong khoảng nhiễu (bảng đủ ở đầu ra `cay.py`; ải lệch nhiều nhất 2-3: 4,7 → 4,0 và 2-5: 4,1 → 5,4 ở lần 1, ngược chiều nhau).
Kết luận: game **không dễ đi** (số lượt, sức mạnh, thời gian như cũ) vì cả chiến dịch chỉ ~4 ngày giả; nhưng **kinh tế sau 3-5 dư thêm quặng và linh khí**
(bot không tiêu hết vì còn bị chặn bởi vàng / lò rèn). Theo kế hoạch, chỉnh số là việc của **Phiên E** (`tools/can-bang/tinh.js` mục 7, `cay.py --viec`);
gợi ý cho Phiên E nếu cần bù: giảm quặng của việc còn một nửa (mức 1: 1 / 2 / 2) hoặc bỏ linh khí ở rương ngày mức 1, **không đụng `STAGE_K`**.
Phiên này giữ đúng số chủ game đã duyệt (Q4 = a) và có cờ quay lui `?viecngay=0`.

Lưu ý khi đo: bot không đổi vũ khí, không bấm "Đổi việc", nên việc "Đổi vũ khí giữa trận" của bot không bao giờ xong → bé thật có thể xong nhiều hơn bot.

## 7. Chỗ còn vẽ code tạm (chờ Phiên D gắn ảnh)

Ảnh gốc đã có ở `docs/anh-goc/buoc-2/`. Code đã gọi sẵn `G.spriteCustom.gdSan(mã)` — có tệp `game/art/custom/<mã>.sprite.json` là tự dùng ảnh, không có thì vẽ code:

| Ảnh gốc | Mã Phiên D nên cắt ra | Đang vẽ tạm |
|---|---|---|
| B7 `gd-the-viec` | `gd-the-viec` (đang làm), `gd-the-viec-xong` (xong) — kéo giãn ngang 304×34 | ô con `T.inset` (xong chưa nhận: viền sáng) |
| B8 `gd-icon-viec` | `gd-icon-viec-0` … `gd-icon-viec-11` theo thứ tự tấm 4×3 (kiếm chéo, sọ tinh anh, cờ cổng, ba sao, bình gạch chéo, ba hệ, nổ, lộn né, chưởng, rương, đe, cổng ải ngày); mẫu nào dùng ô nào ghi ở cột `icon` của `G.VIEC_NGAY.mau` | tròn đồng + chấm màu theo loại |
| B9 `gd-ruong-ngay` | `gd-ruong-ngay` (đóng), `gd-ruong-ngay-mo` (mở) — 32×28 | hộp đỏ đai vàng |
| B10 `gd-o-tuan` | `gd-o-tuan` (trống), `gd-o-tuan-dau` (đã đóng dấu) — 18×18 | ô gỗ + dấu đỏ mặt trời |
| B6 `gd-bang-viec` | (nền bảng việc — chưa dùng; bảng hiện dùng khung chung của Anh Mõ) | — |
| B14 `gd-the-ong-tu` ô thứ 4 | biểu tượng thẻ "Việc hôm nay" (nếu Phiên D gắn biểu tượng cho hàng thẻ) | thẻ chỉ có chữ |
| B15 `hu-nhan-thuong` | hiệu ứng bấm Nhận | chưa có hiệu ứng, chỉ tiếng + lời Anh Mõ "+120 vàng, 3 quặng" |

Bảng xem trong Tạm dừng dùng `ui.panel` / `ui.btn` (đã đổi sang chủ đề trống đồng qua `T.install`), không cần ảnh riêng.

## 8. Lưu ý cho phiên sau

- Phiên A: `so_yeu_quai.js` chỉ cần ghi `sv.so.q[mã].h / .k`; hai mẫu việc dùng sổ tự bật khi có `G.SO_YQ` (hoặc `G.soYeuQuai`) và đủ trang. Tên quái trong
  việc "Hạ 8 con …" lấy từ `G.SO_YQ` (mảng có `ma`/`id` + `ten`, hoặc đối tượng theo mã) nếu có, không thì `G.monsterArt.list`.
- Phiên C: đọc `sv.nv.demRuong` cho thành tựu "Chăm chỉ" / "Siêng năng".
- Bot (`tests/bot_nang.js`) đổi ngày giả qua `G.aiNgay.homNay` → Việc hôm nay cũng theo ngày của bot (Phiên E đo được ngay, thưởng tự cộng hôm sau).
- `G.viecNgay`: `capNhat(sv)`, `taoViec`, `nhan(i)`, `moRuong()`, `moTuan()`, `doi(i)`, `choNhan()`, `mucThuong(sv)`, `chu(viec)`, `coNut()`, `xemTrongAi()`.
