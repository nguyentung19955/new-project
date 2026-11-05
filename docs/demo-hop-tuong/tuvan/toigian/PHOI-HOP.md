# Phối hợp — 2 phiên "thẻ tối giản kiểu DCDW" (đọc trước khi sửa)

The coordinator accidentally started TWO sessions from trigger trig_01KTd72bwt9m4kdfcgXeTuDt. Each got a different extra message. Split the work like this:

- Session whose extra message is about the BATTLE TRAY (dcdw_khay_toigian.png):
  - Owns the shared minimal UNIT TILE component (css/js, rim art cutting from raw_p10_khung_toigian.png).
  - Owns the battle tray in SOLO / CO-OP / PVP / ONLINE / Test.
  - Commit the tile component FIRST, in a separate commit whose message contains "o-toigian".
- Session whose extra message is about the DECK SCREEN (dcdw_man_deck.png):
  - Owns the deck builder layout: presets row, compact commander banner, 5 slots, sort/filter row, candidates grid, collection, presets screen.
  - Before using the tile, git pull until the "o-toigian" commit exists (or 40 min), then reuse that tile. Don't make a second tile component.
- Both sessions:
  - Run git pull --rebase before every push, and never revert the other's work.
  - Results / lobby / inspect: the tray session does these after the tray is done.

## Phiên thứ 3 — "roster icons" (dcdw_the_toigian.png), bắt đầu 14:40 UTC
- A third session got the base prompt (roster grid ref, no extra message). To avoid a 3rd tile component it will NOT write its own tile.
- It waits for tư vấn A + deck rows + the "o-toigian" commit, then only: roster/collection grid 5 cols (4 at ≤360) + 6 px gap if the deck session hasn't done it, cutting raw_p10_khung_toigian.png when it lands (if the tray session hasn't), the cross-mode screenshot check (320/360/390/430) and the thap/ publish.
- If you already did one of those, say so in a commit message (word "toigian-xong: <part>") and it will skip it.

## Tư vấn A (chân dung §D + bộ bài B2/B19) — trạng thái 14:57 UTC
- XONG: hệ chân dung dùng chung `thap/js/chandung.js` — mốc đỉnh tóc / mắt / tâm mặt cho 85 phi công + 3 chỉ huy (PO_NEO). Áp cho MỌI `<img>` pilot_/af_ có `object-fit: cover`
  (MAT.fit). Ô mới chỉ cần đặt biến CSS trên ảnh: `--po-mat` (mắt, phần chiều cao ô), `--po-toc` (đỉnh tóc tối thiểu), `--po-ho` (được để trống trên tóc khi ảnh gốc tóc sát mép),
  `--po-zoom`/`--po-zmin`, `--po-x`. Kiểm: `node tools/thap-kt-chandung.js` → docs/demo-hop-tuong/tuvan/tvA/portrait_qa.png (báo mắt/tóc ra ngoài cửa sổ, chip đè mặt).
- Lưới/ô bộ bài trong `thap/css/tvA.css` (mục §B2/§B19: 3 cột 125, ô 72×81 khung E07/E08) nạp TRƯỚC khung-p9.css/chonthe.css — phiên thẻ tối giản cứ ghi đè hình học lưới/ô (5 cột…),
  chỉ giữ biến --po-* trên ảnh chân dung để mặt không bị cắt.
- KHÔNG nối E09 (quầng chọn lặp 4 khung — người dùng vừa chê "giật") và E12 (khung thẻ kho — phiên tile tối giản sở hữu viền thẻ, raw_p10_khung_toigian).
- 16:10 phiên thứ 3: sửa "ô phóng quá" (tile_zoom_qua.png) — chỉ thêm 1 luật CUỐI css/otoigian.css (biến --po-* cho ô kho + ô bộ bài). Khay trận giữ nguyên. Tiếp theo: kiểm 4 cỡ màn + xuất bản.

## Khung mặt ô nhỏ (tile_zoom_qua.png — "zoom quá đà") — 17:10 UTC
- `thap/js/chandung.js` (datDau): mọi chân dung ≤ 140 px CSS dùng MỘT luật theo mốc PO_NEO [tóc, mắt, tâm x, CẰM]: cả đầu ≈ 52 % vùng thấy (≤ 60 %), mắt ~40 %, tóc ≥ 4 %, cằm + cổ trong ô, ≤ 1.0 px nguồn/px máy ở DPR 3.
  Vùng thấy = cửa sổ trừ phần viền o_vien_* đè (`--po-mep: .081` trên ô .ot). Các biến `--po-mat/--po-toc/--po-zoom/--po-ho` theo từng chỗ chứa KHÔNG còn tác dụng ở ô nhỏ — đừng thêm nữa; mặt lệch thì sửa mốc PO_NEO.
- Kiểm: `node tools/thap-kt-chandung.js` (SIZES=360x780x3,390x844x3,430x932x3) + `KT_VACH` (hồi quy) báo LỖI khi đầu > 60 %, cắt tóc/cằm, phóng mờ. Ảnh: docs/demo-hop-tuong/tuvan/khungmat/.
