# Báo cáo tích hợp bộ Zed mới (13/10/2026)

Commit chính: **`ae950fcd`** trên nhánh `khoi-tao-du-an` (đã push, tự deploy). Theo đúng luật: **KHÔNG chạy test, không Playwright, không chạy game**; chỉ chạy script Python dựng ảnh, `tools/ngon-ngu` không chạy lại toàn bộ (chỉ thêm dòng dịch), và `python3 game/build.py` để đóng gói lại `game/dist` như các commit trước. Chưa ai xem trong game: **chủ dự án cần mở game xem thử**.

## Đã làm
1. **Sprite sheet Zed mới** — script `docs/anh-goc/zed/dung-zed-game.py` (chạy lại được: `python3 docs/anh-goc/zed/dung-zed-game.py`):
   - `game/art/custom/zed-moi.sprite.json`: 27 hàng thân (mỗi động tác 1 hàng, đúng thư mục trong YEU-CAU) + 15 hàng "nắm tay". Khung 96×96 nguồn (`net` 2, khung 48×48 game, `goc` [24,45]), chân trùng (48,90). **Một tỉ lệ co chung** s = 62/485 (Zed đứng cao 485 điểm ảnh nguồn → 62 điểm ảnh ô 96 = 31 điểm ảnh game). Riêng `06-chet-b2` phóng thêm ×1,639 cho bằng chiều cao tấm đứng.
   - `game/art/custom/zed-vk.sprite.json`: 4 loại (kiếm `vk-kiem-moi`, thương, búa, phi tiêu) × 4 cấp (= `G.STAGE_NAMES` Trắng/Mầm/Thành hình/Thức tỉnh).
   - Ảnh xem trước (dựng như game ghép, cấp 1 và cấp 4): `xem-truoc-than.png` cạnh báo cáo này.
2. **Gắn vũ khí theo neo** đúng cách của `ghep-thu-vk.py` (điểm cầm `chinh_nam`, chuôi `chuoi`/`cam`, độ dài `dai` × chiều cao lớn nhất của động tác, cờ `sau`, `tay2`, khung `null`). Neo đã quy đổi sang hệ **`"he_neo": "nguon-96"`** (toạ độ ô 96×96 của tấm, chân tại 48,90; game chia 2 rồi trừ goc [24,45]). Trong game: người → vũ khí xoay quanh điểm cầm (trước/sau người theo `sau`) → nắm tay đè lên; quay trái lật cả người + vũ khí. Hình vũ khí theo cấp `G.wStage`; vũ khí đang mang hệ thì nhuộm nhẹ màu hệ.
3. **Thay hình Zed cũ**: `game/js/zed_moi.js` bọc `G.art.hero` cho Zed (khoá `smith`). Cờ: **`?zedmoi=0`** về hình Zed cũ + tên Cung; `?zed=0` vẫn như bản trước. Ảnh chưa tải xong thì vẽ hình cũ cho tới khi có.
4. **Bảng mốc khung theo `u`** (`MOC` trong `zed_moi.js`), khung ★ = khung 3 hiện đúng lúc `u = hitAt`: kiếm 1/2 [0 .22 **.45** .65 .82], kiếm 3 [0 .2 **.45** .6 .75 .88], thương 1–3 + quét [0 .22 **.45** .55 .7 .85], búa nện [0 .15 **.35** .5 .62 .74 .85 .93] (**sửa L1**), nện đất (vào từ .36) [0 .2 **.45** .6 .75 .88], phi tiêu [0 .22 **.45** .6 .75 .88], ném chùm (vào từ .45) [0 **.45** .6 .72 .84 .94], đấm [0 .22 **.45** .65 .82]. Chưởng chia đúng **castT 0,3** (**sửa L3**). Không đổi thời lượng, hitAt, combo trong `moves.js`/`combat.js`.
5. **Kiếm** 3 hàng 08/09/10 theo `comboI`; **thương** 11/12/13 + 14 quét (`mv.kind === 'quet'`); **giữ đà** 15/18/21 lặp khi giữ; **thả** 16 xốc tới (theo tiến độ lao), 19 nện đất, 22 ném chùm.
6. **Đi bộ**: `combat.js` ghi thêm `P.diTL` (tốc độ đi / tốc độ chạy đầy, chỉ để vẽ). < 0,6 → hàng 02-di, còn lại hàng 03-chay. Tốc độ di chuyển không đổi.
7. **Cung → Phi tiêu**: nhịp giữ y cung. Tên: loại "Phi tiêu", đặc biệt "Mưa Phi Tiêu", đòn "Ném"/"Ném chùm", lời nhắc mới, 10 dòng cung đổi tên "Phi Tiêu …" (có bản tiếng Anh). Phi tiêu ném tay không; viên bay là ảnh `vk-phi-tieu` cấp hiện tại, xoay khi bay.
8. **Đặc biệt** 23–26 theo loại vũ khí thật (specT 0,35); Phi Thương khung 3–6 không có thương trong tay. **Đấm** (giáo đang bay) dùng 27.
9. **Chạy mà đánh**: thân giữ hàng chạy, vũ khí vung theo neo của khung đòn tương ứng (không vẽ nắm tay vì thân khác hàng).
10. Vệt chém (`G.tinhLinh.tip`, js/fx.js) dời điểm cầm/hướng/độ dài theo neo mới. 160 ảnh `vk-*` cũ: không xoá, chỉ không dùng cho Zed.
11. `build.py`: nhận loại tệp `"doi_tuong": "zed"` (mã `zed-…`), xếp vào ảnh cần ngay ở làng. `sprite_custom.js`: nạp tệp zed vào `SC.zed`.

## Cần chủ dự án xem / còn thiếu
- **Cỡ người không đều giữa các động tác** do ảnh gốc vẽ khác cỡ mà yêu cầu bắt CÙNG một tỉ lệ co: trúng đòn, thương giữ, phi tiêu ngắm, chết… trông to hơn; chạy, lộn nhỏ hơn (xem `xem-truoc-than.png`). Nếu muốn đều, đổi sang co theo từng hàng trong script.
- **Tràn ô 96×96 (cắt mép 1–2 điểm ảnh)**: chết khung 5, thương xốc khung 1–2.
- **Đứng/đi/chạy/lộn/trúng đòn KHÔNG cầm vũ khí** vì `neo.json` không có neo cho các hàng này (theo luật không bịa neo). Cần đo thêm neo nếu muốn Zed cầm vũ khí lúc đi.
- Khi bộ mới bật, Zed không còn đồ khoác rời (mũ/áo/cánh), hào quang trang phục, khiên — hướng mới là mỗi bộ trang phục = một bộ animation riêng. Hào quang Gồng vẫn giữ.
- Ảnh thân Zed cũ (`em-be-smith`, `-don`) vẫn tải để `?zedmoi=0` dùng được.

## Tệp đổi
`docs/anh-goc/zed/dung-zed-game.py` (mới), `game/art/custom/zed-moi.sprite.json`, `zed-vk.sprite.json` (mới), `game/js/zed_moi.js` (mới), `game/index.html`, `game/js/{data,moves,combat,weapon_art,sprite_custom,ngon_ngu_en}.js`, `tools/ngon-ngu/tu-dien/zed.json`, `game/build.py`, `game/dist/*`, `tools/xuong-sprite/*` (đóng gói lại), `xem-truoc-than.png`.
