# Bước 2 — Báo cáo Phiên C: Thành tựu + Danh hiệu

Làm 15/10/2026 theo `KE-HOACH.md` mục 1.0, 1.3, mục 2, mục 4 "Phiên C" và đoạn "Tránh đụng nhau"; dùng nền của Phiên 0 (`bao-cao-phien-0.md`);
`QUYET-DINH.md` (theo lựa chọn đề xuất: danh hiệu không lên Bảng vàng, chưa làm trang phục); `LUAT-CAN-BANG.md`.
Nhánh `khoi-tao-du-an`. Không đụng master, không PR, không đổi đăng nhập Google / lưu mây / `?cloud=0`. Không chơi thử bằng trình duyệt.

## 1. Đã làm gì

| Tệp | Thay đổi |
|---|---|
| `game/js/thanh_tuu.js` (mới) | Luật + giao diện: bộ đếm trọn đời, kiểm đạt, bù bản lưu cũ, nhận thưởng 1 lần, danh hiệu, thẻ "Thành tựu" ở Ông Từ, danh hiệu trên đầu Cu Tí ở làng, chữ tiếng Anh. |
| `game/js/data.js` | **Khối riêng ở cuối tệp** (có chú thích "BƯỚC 2 — PHIÊN C"): `G.THANH_TUU` = 30 thành tựu (`DS`), 20 danh hiệu (`DH`), màu 3 cấp (`CAP`). |
| `game/js/hanh_trang.js` | 1 dòng trong thẻ Nhân vật: gọi `G.thanhTuu.hanhTrang(...)` vẽ dải danh hiệu dưới hình Cu Tí. |
| `game/index.html` | Thêm `<script src="js/thanh_tuu.js">` sau `do_roi.js`, trước `firebase-config.js` / `cloud.js`. |
| `game/tests/thanh_tuu.test.js` (mới) | Bài Node 35 điều kiện (mục 4). |
| `game/tests/su_kien.test.js` | Mục 8 (khung thẻ của Phiên 0) tạm thay thẻ đã điền bằng hàm rỗng rồi trả lại — để bài của Phiên 0 vẫn đúng khi Phiên A / B / C đã gán thẻ thật. |
| `docs/ke-hoach/buoc-2/xem_thanh_tuu.py`, `xem-thanh-tuu.png` | Ảnh soát tĩnh VI + EN. |
| `game/dist/*`, `tools/xuong-sprite/*` | Sinh lại bằng `python3 game/build.py`. |

Không sửa phần Sổ (`PANELS.so`, Phiên A) và Việc hôm nay (`PANELS.viecNgay`, Phiên B). Chữ danh hiệu trên đầu Cu Tí làm bằng cách **bọc
`G.villageScene.drawWorld` từ ngoài** (không sửa `village_scene.js`).

### Người chơi thấy gì
- **Ông Từ → thẻ "Thành tựu"** (mở sau khi qua ải Rừng già 1): trên cùng là danh hiệu đang đeo + nút "Đổi danh hiệu"; dòng "Đã đạt 8/30 · Chờ nhận: 5";
  lưới 30 huy hiệu tròn (10 × 3): chưa đạt xám + ổ khoá, đạt rồi sáng + vòng lấp lánh + chấm đỏ, đã nhận sáng hẳn. Chạm một huy hiệu → ô chi tiết:
  tên, cấp (Đồng / Bạc / Vàng), cách đạt, thanh tiến độ (ví dụ 412/1000), thưởng, nút **Nhận** (bấm có hiệu ứng toả vàng).
- **Đổi danh hiệu**: danh sách danh hiệu đã có (2 cột, lật trang khi nhiều) + "Không đeo". Danh hiệu chỉ để khoe, không thêm sức mạnh.
- Nhận một thành tựu có danh hiệu khi đang chưa đeo gì → **tự đeo** danh hiệu đó.
- **Hành trang → Nhân vật**: dải danh hiệu ở đáy khung hình Cu Tí; ở làng chạm vào thì sang thẳng Ông Từ, thẻ Thành tựu (chưa đeo thì mở luôn chỗ chọn).
- **Làng**: dải danh hiệu nhỏ trên đầu Cu Tí.
- **Chấm đỏ** trên Ông Từ (dải khuôn mặt) và trên thẻ "Thành tựu" khi có huy hiệu chờ nhận (dùng `PANELS.thanhTuu.cham` của Phiên 0).
  Người mới (≤ 1 ải) vẫn theo luật cũ: chỉ một người có chấm.

### Luật
- 30 thành tựu đúng bảng mục 1.3 (mã, tên, cách đạt, cấp, thưởng). Thưởng **một lần**, phải bấm Nhận; đạt rồi là giữ mãi (ví dụ ép tụt bậc sau đó vẫn giữ).
- Đếm (cộng trong bộ nhớ, ghi khi game tự lưu): `quai` (mọi quái hạ, bỏ quái phụ / ảo ảnh — theo sự kiện `haQuai`), `tinhAnh`,
  `khongBinh` (thắng ải thường không bình máu), `khacChe` (thắng ải có sao hệ khắc chế), `khongKip` (thắng ải trùm vùng khi trùm không có lớp kháng nào),
  `heTT` (bit Lửa / Độc / Băng của vũ khí Thức tỉnh đã từng có — "cùng lúc hoặc lần lượt"), `chuongDay` (đã từng học đầy một cây chưởng).
  Ải ngày, ải hướng dẫn, thua / bỏ ải không tính vào khongBinh / khacChe / khongKip.
- Đọc từ bản lưu: sao (`stars`, `stars2`), trùm vùng đã hạ (sao ải `r-4` hoặc bạn đã được cứu), cấp Cu Tí, cấp vũ khí (`G.wStage`), bậc ép (`G.epDo.bac`),
  mài, bộ đồ (`G.zedBoMo`), cây chưởng; **Sổ** (`so.q`: ★ = `h > 0` hoặc `k`, ★★ = `k`; chỉ tính mã trong bảng sổ `G.SO_YQ` nếu đã có) và
  **Việc hôm nay** (`nv.demRuong`) đọc an toàn — chưa có / sai kiểu thì coi như 0.
- Danh hiệu: 14 từ thành tựu + 6 từ Sổ yêu quái ("Thợ săn <vùng>" khi `so.vung[r]` có bit 1, "Bậc thầy <vùng>" khi có bit 2 — Phiên A chỉ cần đặt bit).
- **Bù bản lưu cũ**: thành tựu đọc được từ tiến độ cũ đạt ngay lần đầu kiểm (bé vẫn bấm Nhận); đặt `tt.bu = 1`. Thành tựu đếm số bắt đầu đếm từ bản này.

### Bản lưu
Chỉ dùng `G.save.tt` (Phiên 0 đã tạo / sửa): `dem` (bộ đếm), `xong`, `nhan`, `dh` (danh hiệu đang đeo), `bu`. Thường dưới 300 byte. Không thêm vào `G.newSave`,
không đụng luật Firestore, không đổi cách đăng nhập. Thưởng ghi vào `gold`, `linhKhi` (`G.vkMoi.themLk`), `daBac` / `buaBac` (`G.epDo.themDa` / `themBua`), `ore`.

## 2. Commit

Một commit trên `khoi-tao-du-an`: "Bước 2 Phiên C: thành tựu + danh hiệu …" (mã commit xem `git log`; báo cáo này nằm trong chính commit đó).

## 3. Cờ quay lui

`?thanhtuu=0` (hoặc `G.THANH_TUU_BAT = false` trước khi nạp): không nghe sự kiện (không đếm), thẻ Thành tựu ẩn (Ông Từ như Phiên 0),
không hiện danh hiệu ở Hành trang / làng, không nhận được gì. Dữ liệu `tt` trong bản lưu **giữ nguyên**. `?sukien=0` cũng tắt hệ này.

## 4. Cách kiểm (đã chạy)

```
node --check game/js/thanh_tuu.js; node --check game/js/hanh_trang.js; node --check game/js/data.js
python3 game/build.py                                   # dist/ không lỗi
node game/tests/thanh_tuu.test.js                       # PASS — 35 điều kiện
node game/tests/su_kien.test.js                         # PASS — 83 điều kiện (bài Phiên 0 vẫn qua)
node game/tests/cloud_save_regression.test.js           # 7 PASS
python3 docs/ke-hoach/buoc-2/xem_thanh_tuu.py           # ảnh soát tĩnh xem-thanh-tuu.png (VI + EN)
```
`thanh_tuu.test.js` (hai bản game trong Node: thường và `?thanhtuu=0`):
1. Bù bản lưu cũ: đã hạ Hồ Tinh, đủ 45 sao, cấp 31 → "Bước đầu", 3 thành tựu cứu bạn, 15 sao, 45 sao, cấp 20 đạt ngay, chưa tự nhận; thành tựu đếm số chưa đạt;
   kiểm không đổi phần cũ của bản lưu; 15 bản lưu cũ `cay_luu.json` kiểm không lỗi.
2. Đếm quái: bot thắng 0-1 → `tt.dem.quai` = đúng số quái hạ; tinh anh đếm riêng; không bình máu +1; `hetAi` giả: thua / ải ngày / hướng dẫn không tính, khongKip đúng.
3. Nhận 1 lần: đúng số vàng / đá / bùa / quặng / linh khí; nhận lần hai hoặc chưa đạt → không có gì.
4. Đổi danh hiệu: chỉ đeo được danh hiệu đã có; tự đeo khi chưa đeo gì, không tự đổi khi đang đeo; cất; danh hiệu từ `so.vung`.
5. `so` / `nv` chưa có hoặc hỏng → 0; có 12 trang ★ → "Chép sổ"; 7 rương ngày → "Chăm chỉ".
6. Giao diện (canvas giả): thẻ chỉ mở sau ải 1; chấm đỏ; chạm huy hiệu, bấm Nhận, Đổi danh hiệu / Không đeo; Hành trang, làng, bản tiếng Anh vẽ không lỗi,
   không sót chữ chưa dịch; chạm dải danh hiệu ở Hành trang → Ông Từ, thẻ Thành tựu.
7. `tt` qua `G.fixSave` + JSON nguyên vẹn.
8. `?thanhtuu=0`: không đếm, thẻ ẩn, không hiện / nhận; dữ liệu giữ.

Ảnh soát `xem-thanh-tuu.png`: 4 màn (thẻ Thành tựu, Đổi danh hiệu, Hành trang, làng) × VI / EN, khung 720×405. Không chữ nào bị cắt "…";
một chữ "thấp hơn khung" là nút "Nâng cấp bộ" có sẵn của Hành trang (`vk_moi.js`), không thuộc phiên này.

## 5. Cân bằng (theo `LUAT-CAN-BANG.md`)

Thưởng **một lần cho cả game** (không theo ngày, không theo lượt), chỉ khi bé bấm Nhận:

| | Vàng | Linh khí | Đá nâng bậc | Bùa giữ bậc | Quặng |
|---|---|---|---|---|---|
| Tổng 30 thành tựu | 1.800 | 130 | 19 | 6 | 10 |
| Trong đó phần thường đạt ở vùng 1 (Bước đầu, Cứu Cu Tèo, 100 quái, 15 sao, Mầm, Chép sổ…) | ~900 | 10 | 2 | 0 | 0 |
| Mỗi lượt / mỗi ngày | 0 (không có thưởng lặp lại) | 0 | 0 | 0 | 0 |

Danh hiệu không cộng sức mạnh. Luật đánh không đổi (không gọi `G.rnd`, không đổi sát thương / rơi đồ).
Đo nhanh bot Node (15 lượt mỗi ải, có / không `?thanhtuu=0`; bot không bấm Nhận nên đây chỉ kiểm "không đổi luật đánh"):

| Ải | Thắng (bật) | Thắng (`?thanhtuu=0`) | Quái TB | Vàng TB |
|---|---|---|---|---|
| 0-4 (cấp 14) | 14/15 | 15/15 | 41 / 40 | 695 / 728 |
| 1-2 (cấp 22) | 3/15 | 3/15 | 21 / 25 | 111 / 122 |
| 1-4 (cấp 26) | 0/15 | 0/15 | 26 / 29 | 60 / 71 |

Chênh lệch là nhiễu ngẫu nhiên (game dùng ngẫu nhiên thật). Phần **bù** cho 1.800 vàng / 19 đá / 6 bùa (luật 3: không cộng thẳng) và đo bot có
bấm Nhận (`tests/cay.py --node --ngay=8 --viec`) là việc của **Phiên E** như kế hoạch mục 5; muốn giảm thì chỉ sửa số trong `G.THANH_TUU.DS[].th` (data.js).
Gợi ý cho Phiên E: thưởng nặng nhất nằm ở cuối game (6 bùa ở thành tựu Vàng), vùng 1 chỉ ~900 vàng một lần.

## 6. Chỗ còn vẽ code tạm (chờ ảnh — Phiên D)

Code đã gọi `G.spriteCustom.gdSan(mã)`; có ảnh với đúng mã là tự dùng, không có thì vẽ code:

| Ảnh kế hoạch | Mã code đang tìm | Đang vẽ tạm |
|---|---|---|
| B11 gd-huy-khung | `gd-huy-khung-dong`, `-bac`, `-vang`, `-khoa` (32×32) | vòng tròn màu đồng / bạc / vàng có răng cưa mặt trống, xám khi khoá |
| B12 gd-huy-hinh | `gd-huy-hinh-0` … `gd-huy-hinh-15` (đúng thứ tự tấm 4×4 của prompt B12; số hình mỗi thành tựu ở trường `hinh`) | hình 9×9 điểm vẽ tay |
| B13 gd-danh-hieu | `gd-danh-hieu-dong`, `-bac`, `-vang` (băng 9 mảnh) | băng màu có hai đuôi gấp; chữ đặt bằng `T.chuTrongKhung` |
| B15 / B17 hu-nhan-thuong / hu-huy-hieu | (chưa nối) | vòng sáng + mảnh vàng / tím toả ra 0,7 giây |
| ổ khoá | (trong B11) | ổ khoá nhỏ vẽ code |

Phiên D cắt ảnh thì đặt đúng các mã trên (hoặc đổi tên trong `thanh_tuu.js`, hàm `veHuy`, `veHinh`, `veDai`).
Nếu ảnh băng danh hiệu có lòng hẹp, nên đo lòng (`do-long-khung.py`) và truyền `khung` cho `T.chuTrongKhung` thay cho `vien`.

## 7. Lưu ý cho phiên sau

- Phiên A: đặt bit `so.vung[r]` (1 = ★★ đủ vùng, 2 = ★★★ đủ vùng) là danh hiệu "Thợ săn / Bậc thầy" tự có; bảng sổ tên `G.SO_YQ` (mảng mã, mảng `{ma}` hoặc `{ds:[…]}`
  hay đối tượng khoá theo mã đều đọc được). Phiên B: tăng `nv.demRuong` khi nhận rương ngày là "Chăm chỉ / Siêng năng" tự tính.
- Kiểm đạt chạy khi mở thẻ, khi hết ải, khi nâng cấp ở làng, khi dải khuôn mặt tính chấm đỏ — rẻ (30 điều kiện), không ghi `localStorage`.
- Bảng kết quả cuối ải không thêm dòng (để chỗ cho Phiên B "Việc hôm nay: 2/3").
