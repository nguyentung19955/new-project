# Báo cáo: chữ có nằm giữa khung hình không (can-chu-khung, 16/10)

Câu hỏi của chủ game: *"check toàn bộ các khung chữ có đang nằm giữa khung của các hình ảnh không"*.

## Tóm tắt (đọc phần này là đủ)

- **Chưa đúng hẳn.** Soát 37 màn × tiếng Việt / tiếng Anh × 3 cỡ màn (điện thoại ngang 844×390, 667×375 và 1280×720): trước khi sửa có
  **63 chữ lệch tâm dọc** (VI) / 61 (EN), 1 chữ lệch ngang, 16 chữ tràn khung, 28 chỗ chữ chồng chữ.
- **Lỗi chính là một lỗi chung**: hàm đặt chữ của game đẩy chữ xuống thấp hơn tâm khung nửa chiều cao chữ hoa. Nút thấp không thấy (bị kẹp
  lại), nhưng **mọi nút cao 26–32** (Cài đặt, Tạm dừng, Bỏ qua truyện, Lên đò, Ải tiếp theo, nút Thợ Rèn...) có chữ **thấp hơn tâm ~2–3,5 điểm**.
  Đã sửa tận gốc.
- **Sau khi sửa**: lệch tâm ngang **0**, lệch tâm dọc **0**, chữ chồng chữ tiếng Anh **0** (tiếng Việt còn 2 ô cây chưởng sát nhau ≤ 1,5 điểm),
  tràn khung chỉ còn tiêu đề bản đồ ải (cố ý đặt trên viền). Như nhau ở cả 3 cỡ màn.
- Còn lại là chỗ **sát viền** (< 0,25 điểm) ở các nút / ô quá thấp (13–18 điểm) với chữ có dấu chồng, và chữ cố ý cắt "…" / cuộn. Xem mục *Chưa sửa / cố ý*.
- **Cờ quay lui `?canchucu=1`**: về đúng cách cũ (đã kiểm: bản mới mở với cờ này ra đúng số lỗi của bản trước phiên, cả 3 cỡ màn, VI và EN).
- Không đổi luật, số liệu, hình khung. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Số đo trước → sau

Đếm theo chữ (mỗi lần vẽ một cụm chữ). Trước = `?canchucu=1`, sau = bản mới. ~950 chữ trong ~440 khung mỗi lượt.

| Cỡ màn | Ngôn ngữ | Chữ lỗi | Lệch ngang | Lệch dọc | Tràn | Chạm viền | Chữ đè chữ | Cắt "…" / cuộn |
|---|---|---|---|---|---|---|---|---|
| 844×390 | VI | 166 → **51** | 1 → **0** | 63 → **0** | 16 → **2** | 50 → 37 | 28 → 8 | 8 → 8 |
| 844×390 | EN | 121 → **25** | 1 → **0** | 61 → **0** | 14 → **2** | 13 → 15 | 24 → **0** | 9 → 9 |
| 667×375 | VI | 171 → **51** | 1 → **0** | 63 → **0** | 16 → **2** | 55 → 37 | 28 → 8 | 8 → 8 |
| 667×375 | EN | 130 → **25** | 1 → **0** | 61 → **0** | 14 → **2** | 22 → 15 | 24 → **0** | 9 → 9 |
| 1280×720 | VI | 171 → **51** | 1 → **0** | 63 → **0** | 16 → **2** | 55 → 37 | 28 → 8 | 8 → 8 |
| 1280×720 | EN | 130 → **25** | 1 → **0** | 61 → **0** | 14 → **2** | 22 → 15 | 24 → **0** | 9 → 9 |

Chữ đè biểu tượng: 0 trước và sau (số tự soát cụm biểu tượng + chữ trên nút: đạt sau khi sửa nút Hành trang ở Tạm dừng).
Bảng từng khung (màn, khung, chữ, lệch trước → sau, lỗi, đạt / chưa): **`bang-soat.md`** (884 khung-lượt ở 844×390, VI + EN: đạt 814, trong đó 149 vừa sửa; còn 70 — đều thuộc mục dưới).

## Cách soát

Công cụ `cong-cu/do-can-chu.py` (Chromium không màn hình có sẵn, **không chơi thử**): mở bản một tệp `dist/linh-khi.html?cloud=0`, dừng vòng lặp
khung hình, dựng từng màn bằng bản lưu thử rồi vẽ đúng một khung hình và đo:

- **Khung** (khung xanh trong ảnh = lòng khung): mọi hàm khung của giao diện (nút, nút nhỏ, thẻ, bảng, hộp thoại + thẻ tên, dải thông báo, tấm nhỏ,
  ô con, thẻ kháng / yếu, thẻ Sắp có, hộp cảnh báo, khung tên trùm) **và mọi ảnh khung `gd-*` dán lên màn** (lần theo cả các lớp ảnh nhớ sẵn) —
  nên khung nơi gọi tự dán (Sổ yêu quái, thẻ việc, ô Ép đồ / Luyện, thanh máu...) cũng được soát. Lòng = vùng trong viền ảnh (bảng lòng đo
  sẵn từ ảnh, như game dùng); ảnh khung chưa có bảng lòng thì lấy trong viền 9 mảnh, hai bên đối xứng.
- **Chữ** (khung đỏ): hộp chữ thật của phông (kể cả dấu), đường cơ sở, cao chữ hoa; biểu tượng tài nguyên vẽ trong dòng tính chung với chữ.
- **Lỗi** (tô đỏ trong ảnh): lệch tâm ngang (chữ căn giữa, hoặc cả cụm biểu tượng + chữ) hoặc lệch tâm dọc (khung cao ≤ 40, khối chữ hoa
  "đỉnh H dòng đầu → chân dòng cuối", kèm biểu tượng xếp trên / dưới) **> 2 điểm game, khung hẹp thì > 6% bề rộng lòng (tối thiểu 1)**;
  tràn ra ngoài lòng > 0,25; chạm viền (cách mép lòng < 0,25); cắt "…" hoặc bị vùng cuộn che; hai chữ chồng nhau > 1 điểm; chữ đè biểu tượng.
- Màn đã soát (37): màn chào (mới / có bản lưu), truyện, làng (dải mặt, nút Hành trang), Chú Lái Đò, Lò rèn (Mài, Linh khí, Ép đồ, Nâng lò),
  Bà Hàng Xén (2 thẻ), Cô Thợ May, Cụ Đồ (kỹ năng, cây chưởng, hướng dẫn, bảng vàng), Ông Từ (Cu Tí, Sổ yêu quái, Thành tựu), Anh Mõ
  (Việc hôm nay, Cài đặt + nút Đăng nhập Google), bản đồ vùng, Ải ngày, Hành trang (làng / trong ải), xem vũ khí, HUD trận (2 vùng),
  thông báo trận, phúc lành, phòng trùm + thẻ kháng / yếu, cửa hàng trong ải, bản đồ ải, Tạm dừng, thắng (có dòng lên cấp), thua.

Phông: máy thử không tải được Google Fonts nên "Be Vietnam Pro" được thay bằng Inter (gần cỡ). Game đo bằng phông thật lúc chạy nên trên máy thật
vẫn tự căn lại.

## Đã sửa

Chung (`js/ui_theme.js`, mọi chỗ dùng `T.chuTrongKhung` / `T.datChu` — đã soát lại toàn bộ bằng công cụ):
1. **Công thức căn dọc**: khối chữ hoa đặt đúng tâm lòng khung (trước cộng thừa nửa cao chữ hoa → chữ thấp ~3 điểm ở nút cao).
2. **Khối nhiều dòng căn trái / phải dùng chung một lề** (lòng hẹp nhất của các dòng): lời thoại trong hộp thoại cuộn giấy không còn dòng thụt dòng lồi theo viền cong.
3. **Chữ sát viền trên / dưới** (đệm < 0,5): thử thu nhỏ tối đa 1 cỡ trước khi chịu sát (thẻ tên hộp thoại, dòng chỉ số Hành trang, thẻ kháng...).
4. **Phông về muộn**: khi phông Be Vietnam Pro tải xong sau lúc game đã vẽ (mạng chậm), bỏ các chỗ đặt chữ đã nhớ theo phông dự phòng — trước đây
   chữ có thể lệch / tràn suốt phiên chơi trên máy mạng chậm.

Nơi gọi tự đặt chữ (mỗi chỗ đều theo cờ `?canchucu=1`):
| Chỗ | Trước | Sau |
|---|---|---|
| Tạm dừng: nút "Hành trang (xem)" | túi sát mép trái, chữ lệch phải (cụm lệch 9,7) | túi + chữ là một cụm nằm giữa nút |
| Lò rèn › Ép đồ, Luyện vũ khí: 4 ô vũ khí | hai dòng (tên, bậc / cấp) dồn lên trên 3,4 | khối hai dòng giữa ô |
| Thẻ Linh khí (hình thái): 4 ô vũ khí | tên một dòng → khối thấp ~3 | dịch lên cho nằm giữa ô |
| Thẻ Linh khí: tên món + dòng phụ thẻ phải; tên hình thái kế | tên đè đinh góc; tên hình thái kế chồng mũi tên ▶ | trong lòng ô; tên nằm trên mũi tên |
| Cây chưởng: ô chưa mở | tên dồn lên trên 2,4; ô hẹp "cần 5" chồng lên tên | tên giữa ô; "cần N" cùng hàng nếu đủ rộng, không thì tên trên / "cần N" dưới; tên cây xuống 1 |
| Thẻ lò rèn (Mài / Linh khí / Ép đồ / Nâng lò) | EN "Upgrade forge" tràn 5 điểm qua mây góc | khi có chữ không vừa: chia bề rộng theo chữ (tổng hàng giữ nguyên) |
| Cài đặt: "Âm thanh, điều khiển ›" + dòng phụ | dòng trên tràn 5,5 qua mây góc | nút 96 → 116, hai nút bên 96 → 86 |
| Hành trang: nút "Nét đã học: Ông Từ" (EN) | "Learned: Shrine Keeper" tràn 5 | nút rộng hết cột hình (100 → 112), chỉ bản EN |
| Làng: nút túi "Hành trang" | chữ tràn 0,6 qua đinh góc dưới | chữ lên 1 |
| Sổ yêu quái: ô "Hoàn thành vùng" | tiêu đề đè viền / đinh góc (3,6) | 3 dòng đặt trong lòng ô |
| Phúc lành: số phím tắt 1 / 2 / 3 | đè viền vàng của thẻ | trong lòng thẻ, góc phải trên |
| Bảng kết quả: dải Linh khí (Luyện vũ khí) | hai dòng bị nâng lên cỡ 7,5 nên chồng nhau | giữ đúng cỡ 7 / 6,5 |
Vùng chạm chỉ đổi theo các nút đổi cỡ ở trên (không chồng nút khác). Thêm một dòng dịch EN "Hành trang (xem)".

## Chưa sửa / cố ý

| Chỗ | Còn | Vì sao |
|---|---|---|
| Bản đồ ải: tiêu đề "Bản đồ ải · Rừng già 3" và "Chạm để chơi tiếp" | nằm trên viền chạm khắc của khung bản đồ | cố ý (khung không có chỗ trong lòng cho tiêu đề cỡ 11). Muốn đẹp hơn: gen thêm **tấm biển tiêu đề**: *"pixel art wooden title plaque, 9-slice friendly, flat dark-brown center for text, thin gold rim, small carved corner knots, transparent background, 64×16 px base, no text"* rồi đặt chữ vào đó |
| Cây chưởng, 6 ô hẹp 44×18 hàng 2 ("cần 5") | tên + "cần 5" xếp hai tầng, sát nhau / sát đáy ≤ 1,5 điểm (Ăn mòn, Xuyên băng) | ô 18 điểm không đủ cho hai dòng chữ có dấu trên và dưới. Sạch hẳn cần ô cao 22 (đổi bố cục cây) — chưa làm vì đổi bố cục |
| Nút nhỏ cao 13–18: "✕ Về làng", "Ải ngày", "Hang biển", "Nét đã học", "NLR", thẻ "Cài đặt", nút hệ Độc / Băng (13, mới của phiên Luyện vũ khí) | chữ sát mép lòng 0–0,25 | đã ở cỡ chữ nhỏ nhất (6,5); chữ có dấu chồng (Ộ, Ả, ằ) cao gần bằng lòng nút. Đề xuất phiên Luyện vũ khí cho nút hệ cao 15–16 |
| Thẻ việc (Việc hôm nay) dòng thưởng; EN "Normal · 75, 2 forge mater…" | sát đáy; EN cắt "…" | dòng thưởng dài ở EN; ảnh `gd-the-viec` chưa có bảng lòng đo sẵn nên số đo lòng là ước lượng (nhìn ảnh vẫn trong thẻ) |
| Thẻ kháng / yếu "Yếu Băng", dòng chỉ số 12 điểm "Tốc chạy" | sát 0–0,1 | khung 12–13 điểm, cỡ chữ đã nhỏ nhất |
| Màn chào "Chạm để bắt đầu" | đo ra sát | dải này phóng to / thu nhỏ nhịp nhàng khi chụp (số đo theo khung chưa phóng); nhìn ảnh vẫn giữa dải |
| Chữ cắt "…" / cuộn: gợi ý bộ đồ ("Mua Thợ Săn Rừng ở Cô…"), "Cấp 6 mở: …" (thẻ Luyện), nội dung cuộn của Hành trang | cắt | cố ý: dòng gợi ý dài cắt "…" (bấm xem đủ), vùng cuộn che phần chưa cuộn tới |
| Hộp thoại đăng nhập / lưu mây / góp ý | không soát | là khung HTML (không vẽ trên canvas), căn bằng CSS; không đụng theo quy tắc |
| Chữ dưới nút tròn HUD (Né, Đặc biệt...), dòng ăn mừng nâng cấp, chữ ở màn chào ngoài khung | không soát | không nằm trong khung |
| Ảnh hiệu ứng `hu-*` | không soát | là ảnh hiệu ứng trận, không chứa chữ |

Không có chỗ nào cần gen lại ảnh khung vì viền lệch: các khung ảnh đều đối xứng đủ để chữ nằm giữa sau khi căn theo lòng đo sẵn.

## Ảnh soát

`anh/<màn>.jpg` — 37 ảnh, mỗi ảnh 4 ô: **VI trước | VI sau** (hàng trên), **EN trước | EN sau** (hàng dưới), màn 844×390.
Khung xanh = lòng khung, khung đỏ = hộp chữ, **tô đỏ = chữ lỗi**; tiêu đề mỗi ô ghi số chữ lỗi. Đáng xem nhất: `cai-dat.jpg`, `tam-dung.jpg`,
`lo-ren-ep.jpg`, `lo-ren-linh-khi.jpg`, `cu-do-chuong.jpg`, `thang.jpg`, `truyen.jpg`, `lai-do.jpg`.

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt. `python3 game/build.py` và `--hai-tep`: đạt.
- `tests/chuong_ui.py`, `tests/au_ui.py`, `tests/cloud_save_regression.test.js`: đạt.
- `tests/ui_robust.py` (2 mục hỏng), `so_yeu_quai.test.js`, `thanh_tuu.test.js`, `viec_ngay.test.js`, `su_kien.test.js`: hỏng **y như bản trước phiên**
  (đã chạy lại trên bản gốc để so) — do mở dần thẻ (mo_dan) / bản lưu hỏng, không liên quan đặt chữ.
- Công cụ: `cong-cu/do-can-chu.py <thư mục>` (đo, `CANH=`, `CO=`, `MODE=`, `LANG_DO=`, `TEP=`), `do-can-chu.py <thư mục> --anh <đích>` (ảnh lưới),
  `cong-cu/bang-soat.py <thư mục> bang-soat.md` (bảng từng khung).
