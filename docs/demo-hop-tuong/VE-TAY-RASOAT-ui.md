# RÀ SOÁT VẼ TAY — vùng UI (pass 4, 2026-11-05)

Phạm vi: mọi màn DOM/CSS — `thap/css/{game,anhgen,pass2,unitpage,online,statthuc,huongdan,vaotran,taitai,tien}.css`, `ui.js, tuongmoi-ui.js, unitpage.js, khung.js, vaotran.js, ketqua.js, huongdan.js, tien-ui.js, taitai*.js, meta.js, phattrien.js, js/online/*.js, index.html`.
Không đụng: trạng thái thẻ ĐANG CHỌN `.c.chon` (session khác thay ảnh), cắt chân dung hero trang ụ (session khác).

**Cách làm.** `tools/thap-kt-vetay-ui.js` mở 27 màn (tải, menu, chọn bộ, trang ụ ×6, trang chỉ huy ×2, tài khoản, online, sảnh, vào trận ×2, trận, bảng thông tin, băng wave, cảnh báo trùm, cut-in, tạm dừng, kết quả, mất mạng, hướng dẫn ×2) ở 390×844 DPR3, quét MỌI phần tử đang hiện + ::before/::after: gradient, box-shadow, viền màu, outline, bo góc có nền màu, clip-path, quầng (drop-shadow màu), khối màu nhỏ không chữ/ảnh, ký tự giả icon; truy ngược luật CSS gây ra. Trước: 1 585 lượt bắt (97 loại phần tử khác nhau); sau: 58 lượt, chỉ còn mặt nạ/cắt ảnh hợp lệ + phần của session khác.
Thay đổi: nguồn trong các tệp vùng UI đã bỏ gradient/box-shadow/viền màu/bo góc tô màu; ảnh thay thế gom ở `thap/css/vetay-ui.css` (nạp cuối, đè cả luật cũ của hud.css/hud2.css chạm vào màn UI).

**Tổng: 63 hình vẽ code tìm thấy → 41 thay bằng PNG ChatGPT (36 ảnh có sẵn + 5 ảnh mới từ `raw_p4_ui_1.png`), 22 gỡ bỏ, 0 mục chờ ảnh.** Prompt + cắt: `HINH-VE-CODE-AUDIT.md` mục "Pass 4 — ui", `tools/thap-cat-p4-ui.py`.

Ảnh trước/sau từng màn: `docs/demo-hop-tuong/tuvan/vetay/ui/truoc/*.jpg`, `.../sau/*.jpg`; ảnh cắt từng mục (trái = trước, phải = sau): `.../crop/<id>.jpg`.

| # | hình người chơi thấy | tệp:dòng (trước) | thay bằng | trạng thái | ảnh cắt |
|---|---|---|---|---|---|
| 01 | Nút tạm dừng ghi chữ ❚❚ | `index.html:65` | bỏ ký tự; ảnh h2_phim_dung_* (hud2) / ic_dung | PNG | [01](tuvan/vetay/ui/crop/01.jpg) |
| 02 | Khay bộ bài 5 ô: tấm tối bo góc + bóng trong | `game.css:155, hud.css:124` | bỏ tấm — 5 hốc o_trong.png đủ | gỡ | [02](tuvan/vetay/ui/crop/02.jpg) |
| 03 | Đáy màn chọn: gradient + bóng + vạch trên | `anhgen.css:69, hud.css, game.css:176` | nền tối trơn | gỡ | [03](tuvan/vetay/ui/crop/03.jpg) |
| 04 | 3 thẻ chỉ huy: viền đỏ bo góc / viền chọn | `game.css:178,183` | khung_tt.png (9 mảnh) + khung_chon.png khi chọn | PNG | [04](tuvan/vetay/ui/crop/04.jpg) |
| 05 | Ô chân dung chỉ huy: radial-gradient + viền màu | `game.css:219-220` | nền tối trơn, không viền | gỡ | [05](tuvan/vetay/ui/crop/05.jpg) |
| 06 | Huy hiệu kỹ năng chỉ huy (.ki / cut-in .ci-ki): đĩa tối + vòng màu | `game.css:223,250` | h2_vong_xam.png | PNG | [06](tuvan/vetay/ui/crop/06.jpg) |
| 07 | 4 nút chế độ ONLINE/CO-OP/SOLO/PVP: gradient + bóng | `hud.css:130-132, hud2.css:156` | khung_tt.png; đang chọn giữ khung_chon.png | PNG | [07](tuvan/vetay/ui/crop/07.jpg) |
| 08 | Dải tiêu đề nhóm (COMMON…): tấm bo góc | `game.css:161, hud.css:126` | nền tối trơn chữ nhật (dính đầu khi cuộn) | gỡ bo | [08](tuvan/vetay/ui/crop/08.jpg) |
| 09 | Hình thoi màu trước tên nhóm | `game.css:162` | ngoc_<bậc>.png / h2_ngoc.png (ui.js) | PNG | [09](tuvan/vetay/ui/crop/09.jpg) |
| 10 | Ô vuông ■□ bậc của họ (sắp xếp theo họ) | `ui.js:92` | ngoc_<bậc>.png (mờ = chưa có) | PNG | — |
| 11 | Nền bo góc sau khung thẻ | `game.css:64, pass2.css:62` | trong suốt (khung the_khung_* đủ) | gỡ | [11](tuvan/vetay/ui/crop/11.jpg) |
| 12 | Vạch trên tên thẻ | `game.css:171` | gỡ | gỡ | [12](tuvan/vetay/ui/crop/12.jpg) |
| 13 | Nút + thêm nhanh: vòng viền + chữ + | `unitpage.css:184-185` | nut_cong.png (nguồn + hud2) | PNG | — |
| 14 | Thông báo nổi đỏ (deck full, …): viên đỏ bo góc | `ui.js:151` | h2_tam_do.png (9 mảnh) | PNG | — |
| 15 | Ký tự ★ trong mọi chữ DOM (1★, 3★ unlock, 4★…) | `unitpage.js, ui.js, phattrien.js…` | ảnh sao_chu.png (raw_p4_ui_1) chèn trong chữ (ui.js, tự động) | PNG (ảnh mới) | — |
| 16 | Nền trang hồ sơ: gradient | `unitpage.css:6` | nền tối trơn | gỡ | [16](tuvan/vetay/ui/crop/16.jpg) |
| 17 | Vạch ngăn đầu/cuối/khối tên | `unitpage.css:12,46,~180` | gỡ | gỡ | [17](tuvan/vetay/ui/crop/17.jpg) |
| 18 | Lưới kẻ ô "bản vẽ" nền hero (repeating-gradient) | `unitpage.css:28` | nền tối trơn | gỡ | [18](tuvan/vetay/ui/crop/18.jpg) |
| 19 | Sọc màu bậc + gradient phủ trên chân dung hero | `unitpage.css:31-33` | gỡ (giữ cắt chéo của session chân dung) | gỡ | [19](tuvan/vetay/ui/crop/19.jpg) |
| 20 | Hai vạch chữ thập sau bệ | `unitpage.css:38-39` | gỡ | gỡ | [20](tuvan/vetay/ui/crop/20.jpg) |
| 21 | Vòng tròn nét đứt + vòng màu quanh bệ (tầm bắn giả) | `unitpage.css:35-36` | tier_ring_<bậc>.png; trang chỉ huy h2_mv_huy.png | PNG | [21](tuvan/vetay/ui/crop/21.jpg) |
| 22 | Viên kim cương xoay + quầng góc hero | `unitpage.css:47` | ngoc_<bậc>.png | PNG | [22](tuvan/vetay/ui/crop/22.jpg) |
| 23 | Chip Common/Attack/Active skill…: viên bo góc viền | `unitpage.css:51-55` | h2_chip.png (chữ màu bậc) | PNG | [23](tuvan/vetay/ui/crop/23.jpg) |
| 24 | Thang họ: vạch màu nhỏ / vạch đứt | `unitpage.css:59-61` | ngoc_<bậc>.png (to = bậc hiện tại) | PNG | [24](tuvan/vetay/ui/crop/24.jpg) |
| 25 | Dải thông số 4 cột: khung viền + vạch cột | `unitpage.css:66-68` | khung_tt.png | PNG | [25](tuvan/vetay/ui/crop/25.jpg) |
| 26 | Số mục 01/02…: viên màu | `unitpage.css:75` | ui_lv.png | PNG | [26](tuvan/vetay/ui/crop/26.jpg) |
| 27 | Gạch ngang gradient sau tiêu đề mục | `unitpage.css:76` | h2_thanh.png | PNG | [27](tuvan/vetay/ui/crop/27.jpg) |
| 28 | Chip "Blast radius 34 px": viên + vạch trái màu | `unitpage.css:83` | h2_tam_mong.png | PNG | [28](tuvan/vetay/ui/crop/28.jpg) |
| 29 | Khung monitor THỬ BẮN: viền + bóng | `unitpage.css:86` | khung_bang.png | PNG | [29](tuvan/vetay/ui/crop/29.jpg) |
| 30 | 4 góc ngoặc màu của monitor | `unitpage.css:90-92` | h2_glint.png ×4 (lật) | PNG | [30](tuvan/vetay/ui/crop/30.jpg) |
| 31 | Sọc quét + tối mép (scanline) trên monitor | `unitpage.css:89` | gỡ | gỡ | [31](tuvan/vetay/ui/crop/31.jpg) |
| 32 | Chấm đỏ REC | `unitpage.css:95` | den_tim_bat.png | PNG | [32](tuvan/vetay/ui/crop/32.jpg) |
| 33 | Nút dừng/chạy vẽ bằng 2 vạch / tam giác | `unitpage.css:98-102` | h2_phim_dung_cho.png / ic_phat.png (hud2); nguồn bỏ màu | PNG | — |
| 34 | Nút chọn 1★/4★/7★ và Stage: viên viền, chọn = tô màu | `unitpage.css:106-108` | nut_lon_thep.png; chọn = nut_lon_vang.png | PNG | [34](tuvan/vetay/ui/crop/34.jpg) |
| 35 | Bảng sao: khung viền, vạch dòng, vạch trái mốc | `unitpage.css:111-120` | khung_tt.png; dòng mốc = hang_sang.png (raw_p4_ui_1) | PNG (ảnh mới) | [35](tuvan/vetay/ui/crop/35.jpg) |
| 36 | 3 thẻ dạng grow-up: khung viền + quầng màu đầu súng | `unitpage.css:124-129` | khung_tt.png; bỏ quầng (ảnh s1/s2/s3 đã khác) | PNG | [36](tuvan/vetay/ui/crop/36.jpg) |
| 37 | Lưới dấu chân buff: ô vuông tô màu + vòng trong | `unitpage.css:141-145` | o_trong.png (icon PNG trong ô giữ nguyên) | PNG | [37](tuvan/vetay/ui/crop/37.jpg) |
| 38 | Bảng định nghĩa: vạch kẻ dòng | `unitpage.css:148-149` | gỡ | gỡ | [38](tuvan/vetay/ui/crop/38.jpg) |
| 39 | Thang họ: dòng có vạch màu trái + nút viền / ô tô màu | `unitpage.css:154-159` | h2_chip_tat.png; ụ hiện tại h2_chip.png | PNG | [39](tuvan/vetay/ui/crop/39.jpg) |
| 40 | Thẻ cặp đôi: viền + vạch màu trên | `unitpage.css:164` | khung_tt.png | PNG | [40](tuvan/vetay/ui/crop/40.jpg) |
| 41 | 5 ô bộ bài cuối trang: viền / viền đứt / vòng | `unitpage.css:175-178` | o_trong.png; ụ đang xem khung_chon.png | PNG | [41](tuvan/vetay/ui/crop/41.jpg) |
| 42 | Mũi tên Back vẽ bằng 2 cạnh viền | `unitpage.css:14` | ic_lui.png (hud2); nguồn bỏ màu | PNG | — |
| 43 | Bảng thông tin ụ: bóng đổ | `game.css:113, hud2.css:162` | gỡ (khung_tt.png giữ) | gỡ | [43](tuvan/vetay/ui/crop/43.jpg) |
| 44 | Ô ảnh ụ trong bảng: viền màu | `game.css:114` | o_trong.png | PNG | [44](tuvan/vetay/ui/crop/44.jpg) |
| 45 | Nhãn độ hiếm COMMON: viền màu | `game.css:119` | ui_lv.png | PNG | [45](tuvan/vetay/ui/crop/45.jpg) |
| 46 | 4 ô số Damage/Rate/Crit/DPS: viền + bóng | `statthuc.css:4,9` | h2_lcd.png | PNG | [46](tuvan/vetay/ui/crop/46.jpg) |
| 47 | Chip mốc 3★/5★/7★: viền | `pass2.css:17-19` | ui_lv.png | PNG | [47](tuvan/vetay/ui/crop/47.jpg) |
| 48 | Nút Details: viền | `pass2.css:22` | h2_chip.png | PNG | [48](tuvan/vetay/ui/crop/48.jpg) |
| 49 | Dải tên nổi khi chạm ụ (#nd-dai): viên viền + bóng | `game.css:282` | h2_tam.png | PNG | — |
| 50 | Bảng giới thiệu 5 ụ cũ (#nd-gt .gt-*) | `game.css:296,299` | khung_bang.png / khung_tt.png | PNG | — |
| 51 | Băng cut-in chỉ huy: gradient + 2 viền màu + quầng | `game.css:234-236` | bang_cutin_nen.png (9 mảnh) | PNG | [51](tuvan/vetay/ui/crop/51.jpg) |
| 52 | Vệt sáng quét qua băng cut-in (gradient) | `game.css:239-240` | ci_quet.png (raw_p4_ui_1), chỉ dời/mờ | PNG (ảnh mới) | — |
| 53 | Sọc chéo trên băng cut-in | `game.css:237, anhgen.css:46` | gỡ (ảnh băng đã có vân) | gỡ | — |
| 54 | Bảng tạm dừng/kết quả/online: bóng đổ | `anhgen.css:49, hud.css:139` | gỡ (khung_bang.png giữ) | gỡ | [54](tuvan/vetay/ui/crop/54.jpg) |
| 55 | Console dưới trận: bóng đổ | `anhgen.css:72` | gỡ (nen_hud_duoi.png giữ) | gỡ | [55](tuvan/vetay/ui/crop/55.jpg) |
| 56 | Quầng vàng icon kết quả | `game.css:198` | gỡ | gỡ | — |
| 57 | Quầng xanh icon khiên lõi | `tien.css:28` | gỡ | gỡ | — |
| 58 | Quầng xanh khung thẻ đủ mana (trận) | `pass2.css:60` | gỡ (giá xanh của hud2 báo đủ) | gỡ | — |
| 59 | Ký hiệu buff CRIT DMG: vòng tròn vẽ canvas (arc+stroke) | `tuongmoi-ui.js:25` | ic_cdmg.png (raw_p4_ui_1) | PNG (ảnh mới) | — |
| 60 | Icon RAGE (chỉ huy Dahlia): ngọn lửa SVG vẽ code | `data.js:59,83` | fx_cuongno_hieu.png | PNG | — |
| 61 | Chữ nổi "−1♥" (CO-OP online mất tim) | `online/dongbo.js:181` | chữ "−1 LIFE" | gỡ ký tự | — |
| 62 | Mũi tên › giữa 3 dạng grow-up | `unitpage.js:418` | mui_tiep.png (raw_p4_ui_1) | PNG (ảnh mới) | — |
| 63 | Nền dự phòng (khi ảnh chưa tải) trong game.css: gradient nút SUMMON/mana/WAVE/thanh trùm/băng wave/trùm/nút .nut/.bang/logo, viền màu thẻ, outline màu khoá, quầng GROW, quầng nút | `game.css:16-191` | gỡ gradient/bóng/viền màu → nền trơn hoặc không gì (ảnh PNG đè lên khi tải) | gỡ | — |

## Thấy trên màn UI nhưng thuộc session khác (không sửa)

- `#dp-dai .dp-the` (dải bộ bài đồng đội/đối thủ) — ô bo góc nền tối: `hud2.css`/`doiphuong.js` (vùng HUD).
- `.c.chon` dấu ✓ xanh + quầng xanh khung thẻ đang chọn: session thẻ-đang-chọn đang thay bằng ảnh ChatGPT.
- `.up-po` clip-path chéo chân dung hero: session cắt mặt chân dung.
- `hudtop.css` clip-path ray thanh trên = cắt ảnh h2_rail (hợp lệ, rule 3). Nhãn "1×" dưới nút tốc độ (hud2.css) = chữ số (hợp lệ).
- Ký tự ★/→ trong chữ CANVAS (render.js, fx…) thuộc vùng bàn/HUD.
- data.js: chỉ đổi 1 chữ `icon: 'lua'` → `fx_cuongno_hieu` (icon RAGE hiện ở thẻ chỉ huy menu/cut-in/kết quả); hằng `MV_LUA` (SVG) giờ không dùng — để session dữ liệu xoá.

## Báo cáo grep — dòng còn chứa lệnh vẽ / hình CSS trong tệp vùng UI (+ lý do giữ)

Tạo bằng `python3 tools/thap-kt-vetay-grep-ui.py`. Không còn gradient / box-shadow / quầng màu / ký tự giả icon nào trong tệp vùng UI (trừ `.c.chon` của session khác). Các dòng còn lại đều là: viền 0 hoặc trong suốt (giữ bố cục, không hiện), ảnh 9 mảnh border-image, mặt nạ tròn/cắt, bóng đen dưới PNG, tắt (none), chuỗi dữ liệu có ★ (DOM tự đổi sang ảnh).

| tệp:dòng | đoạn | lý do giữ |
|---|---|---|
| css/game.css:10 | `button { font-family: inherit; color: inherit; border: 0; background: none; cursor: pointer; padding: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:18 | `width: 96px; height: 36px; background: #12151bdd; border: 1.5px solid transparent;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:26 | `max-width: 100%; height: 8px; background: #000a; border: 1px solid transparent; overflow: hidden; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:29 | `#tb-tim img { width: 22px; height: 22px; filter: drop-shadow(0 2px 2px #000); transition: transform .2s, opaci` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:31 | `t: 1.15; padding: 3px 7px; background: #12151bdd; border: 1.5px solid transparent; white-space: nowrap; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:39 | `background: #09090bf8; border-top: 2px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:40 | `width: 108px; height: 62px; background: #171124; border: 2px solid transparent;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:46 | `background: #5a1aa8; border: 2px solid transparent;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:48 | `{ width: 38px; height: 38px; flex: none; filter: drop-shadow(0 2px 3px #0008); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:60 | `; width: 52px; height: 62px; background: #24262b; border: 2px solid transparent; font-weight: 900; font-size:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:64 | `column; align-items: center; background: #1c2026; border: 1.5px solid transparent; overflow: hidden; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:67 | `-index: 2; right: 2px; width: 22px; height: 22px; border-radius: 50%; background: none; border: 0; filter: dro` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:69 | `th: 50px; height: 50px; margin-top: 16px; filter: drop-shadow(0 3px 3px #000a); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:74 | `y-content: center; gap: 2px; background: #0e1014; border-top: 1px solid transparent; font-size: 11px; font-wei` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:80 | `; width: 72px; height: 94px; background: #23161a; border: 1.5px solid transparent;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:87 | `y-content: center; gap: 2px; background: #140b0d; border-top: 1px solid transparent; font-size: 12px; font-wei` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:97 | `background: #0b2a3600; border-top: 1.5px solid transparent; border-bottom: 1.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:112 | `gap: 10px; padding: 10px; background: #15171cf4; border: 1.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:113 | `er; justify-content: center; background: #1f232a; border: 1.5px solid transparent; overflow: hidden; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:118 | `ne-height: 16px; padding: 0 6px; color: var(--m); border: 1px solid transparent; background: #000; text-align:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:126 | `#tt .tt-so .d-thang span { padding: 1px 4px; border: 1px solid transparent; color: var(--m); background: #0006` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:146 | `ackground-clip: text; color: transparent; filter: drop-shadow(0 3px 0 #000); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:151 | `-height: 1; padding: 0 10px; background: #2c2f36; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:154 | `o-bo { position: relative; flex: 1; height: 58px; border: 1px dashed transparent; display: flex; align-items:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:156 | `hon-bo .o-bo i { position: absolute; inset: -1px; border: 1.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:163 | `ight: 56px; margin-top: 12px; flex: none; filter: drop-shadow(0 3px 3px #000b); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:167 | `e-height: 1.08; color: #fff; background: #0e1014; border-top: 1px solid transparent; overflow: hidden; overflo` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:171 | `oi { padding: 8px 10px 12px; background: #0f1013; border-top: 2px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:173 | `gap: 5px; padding: 6px 5px; background: #1f1a1c; border: 1.5px solid transparent; text-align: left; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:180 | `center; text-align: center; background: #22252b; border: 1.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:185 | `ign: center; line-height: 1; background: #2c2f36; border: 2px solid transparent; font-weight: 900; font-size:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:190 | `: 320px; padding: 20px 16px; background: #18191c; border: 2px solid transparent; text-align: center; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:215 | `background: #120c0e; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:218 | `om: 1px; width: 18px; height: 18px; padding: 1px; border-radius: 50%; background: none; border: 0; filter: dro` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:231 | `border-top: 2px solid transparent; border-bottom: 2px solid transparent; transform-origin: 50% 50%; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:234 | `-webkit-mask-image: linear-gradient(90deg, #000 70%, transparent); mask-image: linear-gradient(90deg, #000 7` | mặt nạ mờ mép chân dung cut-in (mặt nạ cắt, không vẽ hình) |
| css/game.css:235 | `ject-position: 50% 10%; margin-top: -4px; filter: drop-shadow(0 0 8px #000); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/game.css:242 | `m: 22px; width: 30px; height: 30px; padding: 2px; border-radius: 50%; background: none; border: 0; }` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/game.css:267 | `#chon-bo .o-bo.nd-k i { border: 2.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:272 | `background: #0c0f14f0; border: 2px solid transparent; pointer-events: none; white-space: nowrap; transform:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:285 | `x; padding: 12px 8px 10px; background: #12151bf2; border: 1.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:288 | `enter; padding: 6px 2px 5px; background: #1a1e25; border: 2.5px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/game.css:290 | `h: 46px; height: 46px; margin: 1px 0 2px; filter: drop-shadow(0 2px 2px #000a); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/anhgen.css:7 | `#nut-trieu .tr-cap { background: none; box-shadow: none; }` | tắt (none) |
| css/anhgen.css:10 | `filter: drop-shadow(0 1px 0 #000); transition: filter .06s ease-out; }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/anhgen.css:12 | `#nut-trieu.thieu .tr-cap { background: none; box-shadow: none; }` | tắt (none) |
| css/anhgen.css:13 | `source: url(../assets/hud_trieu_tat.png); filter: drop-shadow(0 1px 0 #000); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/anhgen.css:14 | `nut-trieu:active .tr-cap, #nut-trieu.an .tr-cap { box-shadow: none; }` | tắt (none) |
| css/anhgen.css:15 | `::before, #nut-trieu.an .tr-cap::before { filter: drop-shadow(0 1px 0 #000); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/anhgen.css:20 | `#mana-hop { background: none; box-shadow: none; border-style: solid; border-width: 0;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/anhgen.css:26 | `#tb-wave { background: none; box-shadow: none; border-image: url(../assets/hud_wave.png) 30 fill / 15px stretc` | ảnh ChatGPT 9 mảnh (border-image) |
| css/anhgen.css:30 | `/hud_tim_khung.png) center / 100% 100% no-repeat; box-shadow: none; padding: 5px 8px 5px; }` | tắt (none) |
| css/anhgen.css:31 | `ts/den_tim_bat.png) center / 100% 100% no-repeat; border-radius: 50%; }` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/anhgen.css:32 | `background-image: url(../assets/den_tim_tat.png); box-shadow: none; }` | tắt (none) |
| css/anhgen.css:42 | `#bang-wave .bw-dai { background: none; box-shadow: none; border: 0; border-image: url(../assets/bang_wave_nen.` | ảnh ChatGPT 9 mảnh (border-image) |
| css/anhgen.css:43 | `#canh-bao { background: none; box-shadow: none; border: 0; border-image: url(../assets/bang_trum_nen.png) 40 1` | ảnh ChatGPT 9 mảnh (border-image) |
| css/anhgen.css:49 | `.bang { background: none; border-radius: 0; border-style: solid; border-width: 0;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/anhgen.css:55 | `sparent; text-shadow: none; font-size: 0; filter: drop-shadow(0 3px 0 #000a); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/anhgen.css:58 | `#chon-bo .o-bo { border: 0; border-image: url(../assets/o_trong.png) 28 fill / 12px stretch; }` | ảnh ChatGPT 9 mảnh (border-image) |
| css/anhgen.css:62 | `; background: center / contain no-repeat; filter: drop-shadow(0 1px 0 #000); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/anhgen.css:72 | `#duoi { background: none; border: 0; border-image: url(../assets/nen_hud_duoi.png) 34 84 64 84 fill / 17px 42p` | ảnh ChatGPT 9 mảnh (border-image) |
| css/pass2.css:17 | `background: #0b0d11; border: 1px solid transparent; font-size: 9px; font-weight: 800; color: #7d8590; white-` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:22 | `color: #e9eef4; background: #262a31; border: 1px solid transparent; text-decoration: none; white-space: nowr` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:29 | `ts/ui_khay_doi.png) center / 100% 100% no-repeat; box-shadow: none; padding: 3px 7px 3px 6px; }` | tắt (none) |
| css/pass2.css:32 | `relative; width: 26px; height: 28px; padding: 0; border: 0; overflow: hidden; background: #1a1d22; cursor: po` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:37 | `#dp-dai .dp-the { box-shadow: none; } #dp-dai .dp-the::after { display: none; }` | tắt (none) |
| css/pass2.css:44 | `.co-khung .co-kh > i:not(.kh) { border: 0 !important; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:46 | `margin: 0 !important; border-radius: 0 !important; object-fit: cover; object-position: 50% 14%; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:49 | `the.co-kh { --khh: 74px; background: transparent; box-shadow: none; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:59 | `.co-khung #bo-the .the.co-kh.du { box-shadow: none; }` | tắt (none) |
| css/pass2.css:65 | `.co-khung .c.chon.co-kh { box-shadow: none; }` | trạng thái thẻ ĐANG CHỌN (.c.chon) — session khác đang thay |
| css/pass2.css:70 | `.co-khung #chon-bo .o-bo.co-kh { --khh: 58px; border: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:77 | `-mv.co-kh { --khh: 76px; background: transparent; box-shadow: none; padding-top: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:79 | `.co-khung #the-mv.co-kh .mv-ic .mv-anh { border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:85 | `img.ic-trieu { width: 46px; height: 46px; filter: drop-shadow(0 2px 0 #0008); margin: -6px -4px -6px -6px; }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/pass2.css:86 | `ic-trieu { filter: grayscale(.85) brightness(.65) drop-shadow(0 2px 0 #0008); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/pass2.css:87 | `#bo-the .the .so:not(:empty) { background: none; border: 0 solid transparent; border-image: url(../assets/ui_` | ảnh ChatGPT 9 mảnh (border-image) |
| css/pass2.css:90 | `.gia, .co-gia #the-mv .mv-gia { background: none; box-shadow: none; border: 0 solid transparent; border-image:` | ảnh ChatGPT 9 mảnh (border-image) |
| css/pass2.css:91 | `e-mv.du .mv-gia::after { width: 8px; height: 8px; border-radius: 0; box-shadow: none; background: url(../asset` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/pass2.css:92 | `row .the .gu, .co-grow .c .gu { background: none; border: 0 solid transparent; border-image: url(../assets/ui_` | ảnh ChatGPT 9 mảnh (border-image) |
| css/pass2.css:93 | `r: #fff; text-shadow: 0 1px 0 #000, 0 0 2px #000; box-shadow: none; }` | tắt (none) |
| css/pass2.css:96 | `ts/ui_khay_doi.png) center / 100% 100% no-repeat; box-shadow: none; }` | tắt (none) |
| css/unitpage.css:12 | `; align-items: center; gap: 8px; padding: 0 10px; border-bottom: 0; background: #202328; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:13 | `6px; padding: 0 12px 0 8px; background: #2c3037; border: 1px solid transparent; font-size: 14px; font-weight:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:14 | `.up-lui i { width: 9px; height: 9px; border-left: 2.5px solid transparent; border-bottom: 2.5px solid transpar` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:17 | `{ width: 40px; height: 36px; background: #2c3037; border: 1px solid transparent; font-size: 22px; font-weight:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:27 | `margin: 0 -14px; display: flex; overflow: hidden; border-bottom: 0;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:29 | `o { position: relative; width: 208px; flex: none; clip-path: polygon(0 0, 100% 0, 84% 100%, 0 100%); backgroun` | cắt chéo chân dung hero (mặt nạ; phần cắt hero thuộc session chân dung) |
| css/unitpage.css:37 | `; height: 112px; margin: -56px 0 0 -56px; filter: drop-shadow(0 6px 6px #000a); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/unitpage.css:39 | `ation: up-quet 5.2s ease-in-out infinite; filter: drop-shadow(0 4px 4px #0009); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/unitpage.css:45 | `.up-bien { padding: 12px 0 10px; border-bottom: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:48 | `ize: 12px; font-weight: 700; background: #2c3037; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:57 | `ate-columns: 1fr 1fr 1fr 1fr; margin: 10px 0 2px; border: 1px solid transparent; background: var(--tam); }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:58 | `.up-spec div { padding: 7px 7px 8px; border-left: 1px solid transparent; min-width: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:59 | `.up-spec div:first-child { border-left: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:73 | `so1 span { padding: 4px 8px; background: #2a2e35; border-left: 2px solid transparent; font-size: 12.5px; font-` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:76 | `ion: relative; padding: 6px; background: #101114; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:78 | `(-196px * var(--k)); width: 430px; height: 860px; border: 0; transform: scale(var(--k)); transform-origin: 0 0` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:80 | `{ position: absolute; width: 14px; height: 14px; border: 2px solid transparent; z-index: 2; pointer-events: n` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:81 | `.up-tv .tl { left: 2px; top: 2px; border-right: 0; border-bottom: 0; } .up-tv .tr { right: 2px; top: 2px; bord` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:82 | `.up-tv .bl { left: 2px; bottom: 2px; border-right: 0; border-top: 0; } .up-tv .br { right: 2px; bottom: 2px; b` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:88 | `tom: 12px; z-index: 3; width: 40px; height: 40px; border-radius: 50%; background: none; border: 1px solid tran` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/unitpage.css:92 | `top: 12px; width: 0; height: 0; background: none; border-left: 13px solid transparent; border-top: 8px solid t` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:96 | `-chon button { height: 36px; background: #2a2e35; border: 1px solid transparent; font-family: var(--f-display)` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:101 | `.up-bang { border: 1px solid transparent; overflow: hidden; background: var(--tam); }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:102 | `; text-align: left; padding: 7px 8px; gap: 0 6px; border-top: 1px solid transparent; font-size: 13px; line-hei` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:103 | `.up-hang.dau { border-top: 0; background: #2c3037; font-size: 11px; color: var(--mo); padding: 5px 8px; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:116 | `dth: 0; padding: 8px 4px; background: var(--tam); border: 1px solid transparent; text-align: center; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:121 | `p-gd1 .anh .dau.loc.s2 { filter: brightness(1.15) drop-shadow(0 0 4px var(--g)); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/unitpage.css:122 | `up-gd1 .anh .dau.loc.s3 { filter: brightness(1.3) drop-shadow(0 0 8px var(--g)); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/unitpage.css:131 | `fr); gap: 3px; padding: 5px; background: #2c2f35; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:138 | `; display: grid; grid-template-columns: 96px 1fr; border-top: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:139 | `.up-dl dt, .up-dl dd { margin: 0; padding: 7px 0; border-bottom: 1px solid transparent; font-size: 13px; line-` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:149 | `30px; padding: 0 8px 0 3px; background: #31353c; border: 1px solid transparent; font-size: 12.5px; font-weigh` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:155 | `: left; overflow: hidden; background: var(--tam); border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:162 | `ign-items: center; gap: 10px; padding: 10px 12px; border-top: 1px solid transparent; background: #202328; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:166 | `{ width: 24px; height: 24px; background: #2c3037; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:169 | `ize: 17px; font-weight: 800; background: #23a845; border: 2px solid transparent; color: #fff; text-shadow: 0 1` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:171 | `037; border-color: transparent; color: var(--mo); box-shadow: none; text-shadow: none; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/unitpage.css:175 | `right: 3px; top: 3px; width: 22px; height: 22px; border-radius: 50%; background: url(../assets/nut_cong.png)` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/unitpage.css:191 | `px; top: 10px; width: 40px; height: 40px; filter: drop-shadow(0 2px 3px #000a); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/online.css:10 | `padding: 0 6px 0 2px; border: 0 solid transparent; border-width: 8px; border-image: url(../assets/khung_tt.p` | ảnh ChatGPT 9 mảnh (border-image) |
| css/online.css:12 | `#tk-chip img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex: none; }` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/online.css:31 | `a, #tk-ten { flex: 1; min-width: 0; height: 48px; border: 0 solid transparent; border-width: 8px 12px; border-` | ảnh ChatGPT 9 mảnh (border-image) |
| css/online.css:33 | `-webkit-appearance: none; appearance: none; outline: none; }` | tắt (none) |
| css/online.css:39 | `.tk-av { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex: none; }` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/online.css:43 | `ion: column; align-items: center; padding: 2px 0; border: 0 solid transparent; border-width: 6px 10px; border-` | ảnh ChatGPT 9 mảnh (border-image) |
| css/online.css:47 | `.tk-a { aspect-ratio: 1; padding: 0; border: 0; background: none; opacity: .55; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/online.css:48 | `.tk-a img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/online.css:53 | `x 0 2px 10px; margin: 4px auto 8px; width: 210px; border: 0 solid transparent; border-width: 10px 14px; border` | ảnh ChatGPT 9 mảnh (border-image) |
| css/online.css:55 | `.sanh-p { border: 0 solid transparent; border-width: 12px; border-image: url(../assets/khung_tt.png) 42 fill /` | ảnh ChatGPT 9 mảnh (border-image) |
| css/online.css:61 | `.sp-av { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }` | mặt nạ tròn (ảnh PNG tròn / vùng chạm) — nền none hoặc ảnh |
| css/online.css:66 | `-san { color: #b8ffc8; text-shadow: 0 1px 0 #000; border: 0 solid transparent; border-width: 0 9px; border-ima` | ảnh ChatGPT 9 mảnh (border-image) |
| css/statthuc.css:4 | `th: 0; padding: 3px 5px 2px; background: #0b0d11; border: 1px solid transparent; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/huongdan.css:8 | `border: 0 solid transparent; border-width: 14px; border-image: url(../assets/khung_tt.png) 42 fill / 14px st` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:19 | `mation: hd-nhun .8s ease-in-out infinite; filter: drop-shadow(0 2px 2px #000c); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/huongdan.css:26 | `border: 0 solid transparent; border-width: 0 14px; border-image: url(../assets/h2_tag.png) 0 14 fill / 0 14p` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:35 | `border: 0 solid transparent; border-width: 0 12px; border-image: url(../assets/h2_chip_tat.png) 0 30 fill /` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:37 | `amily: inherit; color: #e8f6ff; background: none; outline: none; padding: 0 4px;` | tắt (none) |
| css/huongdan.css:38 | `border: 0 solid transparent; border-width: 8px 12px; border-image: url(../assets/h2_lcd.png) 36 60 fill / 8p` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:51 | `border: 0 solid transparent; border-width: 12px; border-image: url(../assets/khung_tt.png) 42 fill / 12px st` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:52 | `{ content: ''; position: absolute; inset: -12px; border: 0 solid transparent; border-width: 12px; border-imag` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:66 | `border: 0 solid transparent; border-width: 14px; border-image: url(../assets/khung_tt.png) 42 fill / 14px st` | ảnh ChatGPT 9 mảnh (border-image) |
| css/huongdan.css:78 | `border: 0 solid transparent; border-width: 10px 14px; border-image: url(../assets/h2_lcd.png) 36 60 fill / 1` | ảnh ChatGPT 9 mảnh (border-image) |
| css/vaotran.css:13 | `ex; align-items: center; justify-content: center; border: 0 solid transparent;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vaotran.css:24 | `lex; flex-direction: column; align-items: center; border: 0 solid transparent;` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vaotran.css:28 | `t; animation: vt-8 .9s steps(8) infinite; filter: drop-shadow(0 3px 2px #000c); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/taitai.css:7 | `ets/logo.png) center / contain no-repeat; filter: drop-shadow(0 3px 0 #000a); }` | bóng đen dưới ảnh PNG (không phải quầng/hình) |
| css/taitai.css:10 | `; left: 14px; right: 14px; top: 9px; bottom: 9px; clip-path: inset(0 calc(100% - var(--p, 0%)) 0 0); transitio` | mức đầy thanh tải = cắt ảnh tai_day.png (rule 3) |
| css/taitai.css:29 | `t { margin-top: 16px; width: 224px; height: 62px; border: 0; background: center / 100% 100% no-repeat; cursor:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/tien.css:32 | `border: 14px solid transparent; border-image: url(../assets/khung_tt.png) 42 fill / 14px stretch; font-size:` | ảnh ChatGPT 9 mảnh (border-image) |
| css/vetay-ui.css:11 | `#chon-bo { background: none; box-shadow: none; border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:12 | `.chon-cuoi { background: #141518f2; box-shadow: none; border-top: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:13 | `.nhom { border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:17 | `.co-khung .c.co-kh { background: transparent; border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:18 | `.c .ten { border-top: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:20 | `.mv { position: relative; background: none; border-radius: 0; border: 0 solid transparent; border-width: 0; bo` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:23 | `r { content: ''; position: absolute; inset: -3px; border: 0 solid transparent; border-width: 12px; border-imag` | ảnh ChatGPT 9 mảnh (border-image) |
| css/vetay-ui.css:24 | `.mv-anh { background: #120c0e; border: 0; border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:25 | `.mv-anh .ki, #cutin .ci-ki { border: 0; border-radius: 0; background: url(../assets/h2_vong_xam.png) center /` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:27 | `.che, .co-s10 .che.chon { background: none; box-shadow: none; border-radius: 0; border: 0 solid transparent; b` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:34 | `.up-dau, .up-cuoi, .up-bien, .up-hero { border: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:37 | `h: 176px; height: 176px; margin: -88px 0 0 -88px; border: 0; border-radius: 0; pointer-events: none; opacity:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:39 | `height: 18px; transform: none; background: none; box-shadow: none; }` | tắt (none) |
| css/vetay-ui.css:41 | `.up-chip { background: none; border-radius: 0; border: 0 solid transparent; border-style: solid; border-width:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:49 | `g, .up-gd1, .up-the, .up-luoi { background: none; border: 0 solid transparent; border-style: solid; border-wid` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:52 | `.up-spec div { border-left: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:54 | `.up-hang { border-top: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:56 | `.up-hang.moc { box-shadow: none; background: none; border: 0 solid transparent; border-style: solid; border-wi` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:59 | `.up-the img { border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:61 | `.up-muc h3 i { background: none; border-radius: 0; border: 0 solid transparent; border-style: solid; border-wi` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:64 | `.up-so1 span { background: none; border: 0 solid transparent; border-style: solid; border-width: 0; border-rad` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:67 | `.up-tv { background: none; border: 0 solid transparent; border-style: solid; border-width: 0; border-radius: 0` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:69 | `.up-tv-khung { border-radius: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:70 | `.up-tv .g { width: 16px; height: 14px; border: 0 !important; background: url(../assets/h2_glint.png) center /` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:73 | `-tv-chu .rec::before { width: 10px; height: 10px; border-radius: 0; background: url(../assets/den_tim_bat.png)` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:74 | `.up-phat { box-shadow: none; }` | tắt (none) |
| css/vetay-ui.css:76 | `.up-sao-chon button { background: none; border-radius: 0; border: 0 solid transparent; border-style: solid; bo` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:81 | `.up-luoi i, .up-luoi i.u, .up-luoi i.b { border-radius: 0; box-shadow: none; background: url(../assets/o_trong` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:83 | `.up-dl, .up-dl dt, .up-dl dd { border: 0; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:85 | `.up-thang .nac, .up-thang .nac.gap { border-radius: 0; box-shadow: none; }` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:86 | `-thang button, .up-thang .cur { background: none; border-radius: 0; border: 0 solid transparent; border-style:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:91 | `.up-bo img, .up-bo i { border: 0; border-radius: 0; box-shadow: none; background: url(../assets/o_trong.png) c` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:92 | `.up-bo img.cur { border: 0 solid transparent; border-style: solid; border-width: 0; border-image: url(../asset` | ảnh ChatGPT 9 mảnh (border-image) |
| css/vetay-ui.css:95 | `#tt, .co-s10 #tt { box-shadow: none; }` | tắt (none) |
| css/vetay-ui.css:96 | `#tt .tt-the { border: 0; border-radius: 0; background: url(../assets/o_trong.png) center / 100% 100% no-repeat` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:97 | `#tt .tt-bac { border: 0 solid transparent; border-style: solid; border-width: 0; border-radius: 0; background:` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:99 | `#tt .st-hang > div { background: none; border: 0 solid transparent; border-style: solid; border-width: 0; bord` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:101 | `pan, #tt .tt-so .d-thang span { background: none; border: 0 solid transparent; border-style: solid; border-wid` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:104 | `#tt .tt-ct { background: none; border: 0 solid transparent; border-style: solid; border-width: 0; border-radiu` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:106 | `#nd-dai { background: none; box-shadow: none; border-radius: 0; border: 0 solid transparent; border-style: sol` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:108 | `#nd-gt .gt-bang { background: none; box-shadow: none; border-radius: 0; border: 0 solid transparent; border-st` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:110 | `#nd-gt .gt-o { background: none; border-radius: 0; border: 0 solid transparent; border-style: solid; border-wi` | ảnh ChatGPT 9 mảnh (border-image) |
| css/vetay-ui.css:113 | `#cutin .ci-nen { background: none; box-shadow: none; border: 0 solid transparent; border-style: solid; border-` | viền 0 / trong suốt (giữ bố cục, không hiện) hoặc gỡ viền |
| css/vetay-ui.css:123 | `.bang, .co-s10 .bang { box-shadow: none; }` | tắt (none) |
| css/vetay-ui.css:124 | `#duoi { box-shadow: none; }` | tắt (none) |
| js/ui.js:151 | `form:translateX(-50%);z-index:20;padding:8px 22px;border:0 solid transparent;border-image:url(assets/h2_tam_do` | nhãn nổi dùng ảnh h2_tam_do (PNG 9 mảnh) |
| js/ui.js:341 | `so = T.sao + '★ · LV' + (G.ban[T.ban].lv[id] \|\| 1);` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:373 | `au + '">' + TEXT.ui.family + ': ' + h.ten + '</b> ★ ' + TEXT.ui.tierOf(h.bac);` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:381 | `+ (T && T.sao >= m.n ? 'co' : '') + '">' + m.n + '★ ' + esc(m.ten) + '</span> ' + esc(m.mo)).join(' · ');` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:512 | `const ph = t.nodeValue.split('★'); if (ph.length < 2) return;` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:514 | `im.className = 'sao-chu'; im.src = SAO; im.alt = '★'; f.appendChild(im); } if (x) f.appendChild(document.creat` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:518 | `if (n.nodeType === 3) { if (n.nodeValue.indexOf('★') >= 0) doi(n); return; }` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:519 | `1 \|\| BO.has(n.nodeName) \|\| n.textContent.indexOf('★') < 0) return;` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ui.js:521 | `.nextNode()) if (w.currentNode.nodeValue.indexOf('★') >= 0) ds.push(w.currentNode);` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:28 | `own, left, right unless stated); stronger at 3/5/7★. Copies of the same Support don’t stack, and each buff typ` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:89 | `ar merge into a random turret from your deck at +1★. Max 7★.']);` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:138 | `ush('Nightmare snipes your highest-star turret: −1★.');` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:139 | `so.length) so.push('Octopus Eyes burns turrets: −1★ unless cleansed.');` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:148 | `au: 'Instant', dl: [['Effect', 'Summons two free 1★ turrets from your deck into empty cells'], ['Board full',` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:313 | `_nut_trieu.png" alt=""><img class="dau fb" style="border-radius:50%" src="assets/' + d.anh + '.png" alt=""></d` | mặt nạ tròn cho chân dung PNG |
| js/unitpage.js:349 | `this.o('Damage 1★', s1.dmg != null ? s1.dmg : '—') + this.o('Fire rate', s1.toc ? upSC(s1.toc) : '—') +` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:363 | `iv class="up-bang"><div class="up-hang dau"><span>★</span><span>Damage</span><span>Rate</span><span>Effect</sp` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:365 | `(moc[x.s] ? '<em><b>' + x.s + '★ unlock · ' + upEsc(upSC(moc[x.s].ten)) + '.</b> ' + upEsc(upSC(moc[` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:392 | `-up="sao" data-s="' + s + '" class="moc">' + s + '★</button>').join('') + '</div>' +` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:426 | `mau + '"><figure>' + luoi(dc.a) + '<figcaption>1–4★</figcaption></figure>' +` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:427 | `(dc.b ? '<figure>' + luoi(dc.b) + '<figcaption>5★ and up</figcaption></figure>' : '') + '</div>' +` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:428 | `dc.k].ten) + '</b> for ' + tam + (dc.b ? '. From 5★ it also reaches the diagonals' : '') + '.' +` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:429 | `(v1 ? ' ' + upEsc(v1) + ' at 1★, ' + upEsc(v7) + ' at 7★.' : '') + '</p>';` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/unitpage.js:502 | `lector('.up-tv-sao'); if (t) t.textContent = s + '★';` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/ketqua.js:15 | `rtsWith('trum:')) return 'Bosses: merge to higher ★ before wave ' + LUAT.songTrum + ' and save mana for your c` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/huongdan.js:18 | `a turret onto its twin', phu: 'Same turret + same ★ = merge: a RANDOM turret from your deck with +1★.', noi: '` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/tien-ui.js:8 | `H MANA', hoi: 'COOLDOWN', day: 'BOARD FULL · ALL 7★', dung: 'PAUSED', ketthuc: '' },` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/tien-ui.js:61 | `nang.length && !r.sinh.length) this.bay('FULL → +1★ ×' + r.nang.length, 'tn-bay tn-vang');` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/tien-ui.js:62 | `r.nang.length) this.bay(r.sinh.length + ' NEW · +1★ ×' + r.nang.length, 'tn-bay tn-vang');` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/tien-ui.js:111 | `const them = d.so ? ' · board full → +1★ to weakest' : d.hieuLuc ? ' · lasts ' + d.hieuLuc + 's (own board` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/meta.js:3 | `: "Ivory", "kyNang": "On merge: summons an extra 1★ turret", "ten_vi": "Máy Nhân Bản", "kyNang_vi": "Khi GHÉP:` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:50 | `hfiend cooldown', nhanban: 'merge summons a free 1★', anhsang: 'summons 1★ turrets over time',` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:52 | `up its lowest-star neighbours', vughep: 'drag: +1★ and keeps the type', hasao: 'merge surge for neighbours; p` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:55 | `hopbi: 'opens into a random 1–7★ turret', tienhoa: 'evolves into a random turret +1★',` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:94 | `5: ['STAR PIP', 'Each wave a star pip (3 pips = +1★)'], 7: ['STAR SURGE', '2 pips = +1★ (max 2★ per match)'] }` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:97 | `d: +fire rate'], 7: ['LOOSE SYNC', 'Aura ×2.35; ±1★ counts as matched'] },` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:104 | `10s sooner'], 5: ['LUCKY BOX', 'Result at least 3★'], 7: ['JACKPOT', 'Result at least 5★'] },` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:105 | `0% faster'], 5: ['BREAKTHROUGH', '25% chance of +2★'], 7: ['ASCEND', 'Picks your highest-tier card'] },` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:118 | `ht:   { 3: ['TUNED AURA', 'Aura ×1.45 of its 1★ value'], 5: ['FIELD PERK', 'Aura ×1.9 + a small extra perk']` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:164 | `: 'Timer 0–60% / 60–90% / 90–100%, then evolves +1★',` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |
| js/phattrien.js:168 | `', ten: ['PUP', 'HUNTER', 'ALPHA'], dk: 'Hunter: 3★ or 20 kills · Alpha: 5★ or 50 kills (30% are born as Alpha` | ký tự trong CHỮ/chuỗi dữ liệu → DOM đổi ★ thành ảnh ui_sao.png (ui.js); canvas không dùng chuỗi này |

237 dòng; 0 dòng cần xem tay / còn vi phạm
