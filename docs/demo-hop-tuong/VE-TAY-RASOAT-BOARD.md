# RÀ SOÁT 100% HÌNH VẼ TAY — KHU BOARD (pass 4, 2026-11-05)

Khu: bàn chiến đấu + lớp phủ trên ụ — `thap/js/render.js, nhandien.js, buff.js, buffvfx.js, corehud.js, hudtop.js, hud2.js, keoghep.js, ghepfx.js, chihuy.js, doiphuong.js, glyph.js` + `thap/css/hud.css, hud2.css, hudtop.css`.
Luật: `thap/QUY-TAC-HINH.md` (1: cấm vẽ code giả vật thể · 3: code chỉ chữ/số, thanh = cắt/phóng PNG, vị trí/xoay/phóng/mờ PNG, vùng chạm/mặt nạ).
Ảnh người dùng: `thap-art/tuvan/vetay_board_rings.png` (vòng màu quanh ụ, vòng tầm nét đứt, vòng sáng trắng, chấm vai trò màu).

Công cụ kiểm: `node tools/thap-kt-vetay.js <file…>` — quét lệnh vẽ cấm (arc/rect/path/fill/stroke/gradient/setLineDash/shadowBlur/Path2D/putImageData/glyph text; CSS gradient/box-shadow/border/clip-path/drop-shadow), trượt khi dòng không có `// vetay-ok: text|png|mask|debug|hit|nen`.
Kết quả cuối: **OK — 0 dòng vẽ tay chưa giải trình trong 15 file của khu** (toàn repo: 524 → 320 dòng, phần còn lại thuộc khu khác).
Ảnh trước/sau 390×844 DPR3: `tuvan/vetay/board/truoc_*.jpg`, `sau_*.jpg`, ghép `so_sanh_truoc_sau.png`. Chạy lại: `tools/thap-kt-vetay-board.js`.

## Bảng kiểm kê

Trạng thái: **PNG** = thay bằng ảnh ChatGPT có sẵn · **BỎ** = xoá, không vẽ gì · **CHỜ** = đã bỏ, chờ ảnh mới (prompt ở `HINH-VE-CODE-AUDIT.md` mục 16) · **GIỮ** = được phép (lý do).

| # | Phần tử người chơi thấy | file:dòng (trước) | Thay bằng | Trạng thái |
|---|---|---|---|---|
| 1 | **Vòng màu khoá bộ bài quanh bệ ụ** (xanh/đỏ/lục/ngọc/tím — ảnh người dùng) | nhandien.js:64-67 `veVong` arc+stroke, gọi từ render.js:934 | không vẽ; bệ `de_chung.png` đứng một mình | BỎ (CHỜ raw_p4_board_2 nếu muốn lại màu khoá) |
| 2 | **Vòng tầm nét đứt** quanh Cryo Reactor (ảnh người dùng) | skills2.js:854-855 setLineDash+arc | không vẽ | BỎ |
| 3 | Quầng tầm lạnh to (mép tròn lộ như vòng tầm) | skills2.js:851 `cham1` phóng cỡ cả bàn | không vẽ | BỎ |
| 4 | **Vòng sáng trắng nạp năng lượng** quanh bệ (overlord, wallgen, blackhole, mana, ụ có `napMau`) | render.js:821 arc stroke theo % nạp | `fx_vong_mong.png` tô màu, độ sáng theo % nạp | PNG (CHỜ raw_p4_board_3: vòng nạp chia đoạn) |
| 5 | Vòng sóng lan (aura tick, FX.vong1, gSuong…) | hieuung.js:49 `VX.vong` arc · render.js:1090 | `fx_vong_mong.png` tô màu, phóng | PNG |
| 6 | **Chấm vai trò màu góc trên-trái ô** (đĩa màu + hình vector) | nhandien.js:36-47 `veHuy` arc×4 + mặt nạ glyph vector | `h2_vai_tc / h2_vai_ht / h2_vai_db (/kc/phu).png` | PNG |
| 7 | Thư viện 81 biểu tượng vector nhận diện ụ | glyph.js:1-233 (arc/path/Path2D/setLineDash) | xoá; DOM dùng `h2_vai_*.png` (`ND.url`) | BỎ (code chết đã xoá) |
| 8 | Viền màu khoá trên thẻ bộ bài / ô bộ chọn (`.nd-k` outline/border) | nhandien.js:108,158 thêm lớp → game.css:275,278 | không thêm lớp | BỎ |
| 9 | Dải tên ụ khi chạm (`#nd-dai` viên thuốc viền màu + bóng) | game.css:282-283 | hud.css: `border-image h2_tam_xanh.png` | PNG |
| 10 | Bảng giới thiệu 5 ụ (`#nd-gt .gt-o` viền màu bo góc) | game.css:299 | hud.css: `border-image khung_chon.png` | PNG |
| 11 | Chạm thẻ → khoanh ụ cùng loại (ô tô màu + viền bo góc nhấp nháy) | nhandien.js:84-112 roundRect fill/stroke | `sup_ring.png` nhịp | PNG |
| 12 | Bóng tròn dưới ụ (đứng yên + lúc nảy) | render.js:800, 932 arc fill | `fx_cham_trang.png` tô đen | PNG |
| 13 | Bệ ụ dự phòng (gunmetal gradient + đinh) | render.js:948-962 `deCode` | xoá (đang tải → vòng xoay PNG) | BỎ |
| 14 | Ngọc độ hiếm hình thoi code (?debug) | render.js:941-944 | xoá | BỎ |
| 15 | Huy hiệu sao: bóng lục giác + lục giác code dự phòng + vương miện code | render.js:976, 988-992 | `sao_hex / sao_hex7.png`; số = chữ canvas | PNG (số: GIỮ text) |
| 16 | Vòng lên cấp dự phòng (2 cung xanh) | render.js:832-835 | `fx_vong_lv.png` (đã có) | BỎ |
| 17 | Vòng xích Kẹp Phá dự phòng (nét đứt tím) | render.js:882-883 | `vong_xich.png` (đã có) | BỎ |
| 18 | Chấm sáng mềm dùng khắp nơi (`cham1`, radial gradient) | render.js:253-255 | `fx_cham_trang.png` tô màu (`REN.toMau`) | PNG |
| 19 | Hạt bụi (`bui1`, radial gradient) | render.js:263-265 | `fx_bui.png` | PNG |
| 20 | Vệt đạn (`vet`, gradient + path + blur) | render.js:273-279 | `fx_vet_trang.png` tô màu | PNG |
| 21 | Quầng cổng / quầng lõi (`glow`, radial gradient) | render.js:348-350, corehud.js:84-86 | `fx_cham_trang.png` tô màu | PNG |
| 22 | Lõi sét trắng kẻ code đè lên dải sét | render.js:417-418 | bỏ (dải `tia_set` PNG giữ) | BỎ |
| 23 | Sàn trận gradient + quầng tối viền | render.js:439-444 | 1 màu nền đặc #1d1f23 (`vetay-ok: nen`) | CHỜ raw_p4_board_1 |
| 24 | Bóng đổ code dưới khay + dưới lớp đường (shadowBlur) | render.js:448, 483 | bỏ (khay PNG có viền tối) | BỎ |
| 25 | Khay xám / đường xám dự phòng (fillRect) | render.js:450, 493, 583 | bỏ | BỎ |
| 26 | Chớp màn (fillRect toàn màn) | render.js:613 | `fx_cham_trang.png` phóng to | PNG |
| 27 | Đèn phe chấm tròn trên tấm tên bàn + tấm thép code dự phòng | render.js:686-693 | ổ LED trong `hud_ten_ban.png`; thiếu ảnh → chỉ chữ | BỎ |
| 28 | Bóng tròn dưới quái | render.js:709 | `fx_cham_trang.png` tô đen | PNG |
| 29 | Quầng trùm báo chiêu (radial gradient) | render.js:719-721 | `fx_cham_trang.png` tô màu | PNG |
| 30 | Thanh máu quái + trùm (fillRect) | render.js:747-755 | `h2_thanh.png`: nền tô đen + phần đầy CẮT theo % máu | PNG |
| 31 | Đường ngắm trùm → ụ (nét đứt) | render.js:758-759 | `sup_link.png` cuộn + `h2_vong_do.png` trên ụ bị nhắm | PNG |
| 32 | Bóng đạn cong | render.js:1032 | `fx_cham_trang.png` tô đen | PNG |
| 33 | Viên thuốc nhãn kỹ năng dự phòng (roundRect) | render.js:1167 | `nhan_kn.png`; thiếu ảnh → chỉ chữ viền | BỎ |
| 34 | Ký hiệu buff vector 8 loại + tấm nền than bo góc | buff.js:24-62 `veKyHieu`/`kyHieu` | `ic_toc/dmg/crit/cham/chet/mana/khien/taylo.png` | PNG (code vector xoá) |
| 35 | Tấm "+N" buff (roundRect) | buff.js:83 | chỉ chữ viền tối | BỎ (GIỮ text) |
| 36 | Chạm ụ hỗ trợ: ô đích tô + viền, ô sai nét đứt, ô nguồn nét đứt, dây nối kẻ 2 lớp | buff.js:100-130 | đích `khung_chon` 9 mảnh · ô sai `h2_vong_xam` · nguồn `sup_ring` · dây `sup_link` tô màu | PNG |
| 37 | Proc khiên chặn (lục giác kẻ) | buff.js:183-185 | `ic_khien.png` bung ra | PNG |
| 38 | Vết nứt lõi + lớp tối (path/stroke/fillRect) | corehud.js:44-59 | `loi_hu1 / loi_hu2.png` | BỎ |
| 39 | HUD cũ (hud.css): đinh tán radial, mặt thép gradient, sọc nguy hiểm, đèn tim radial, ~37 box-shadow, chấm LED đủ mana, ray thẻ | hud.css:15-139 | màu đặc làm nền chờ; hình thật = ảnh ChatGPT ở hud2.css/hudtop.css (`co-hud2`/`co-s10`) | BỎ |
| 40 | drop-shadow trên icon PNG (wave, chip trùm, tim, vai trò) + bóng hộp `#tt` | hudtop.css:14,23,38,69,72 · hud2.css:160,162 | bỏ | BỎ |
| 41 | Thẻ dải đối phương: viền màu khoá inset + ::after | pass2.css:32-36 (qua doiphuong.js) | hud.css ghi đè: không bóng/viền | BỎ |

Không có hình vẽ tay: `buffvfx.js, hudtop.js, hud2.js, keoghep.js, ghepfx.js, chihuy.js, doiphuong.js` (chỉ đặt/phóng/mờ PNG).

**Tổng: 41 nhóm phần tử (≈180 dòng lệnh vẽ) — 22 thay bằng PNG có sẵn · 19 bỏ hẳn · 3 chờ ảnh mới (sàn trận, đĩa màu khoá, vòng nạp chia đoạn — đã có tạm PNG/màu đặc).**

## Dòng vẽ còn lại trong khu (đã giải trình — `vetay-ok`)

| file:dòng | loại | lý do |
|---|---|---|
| render.js `banTrang`, `co(...,'den')`, `toBien`, `banXam`, `diu`, `dauBong` | png | bản trắng/xám/đen/dịu màu của chính ảnh PNG (source-in / chỉnh điểm ảnh) |
| render.js `toMau` | png | tô màu ảnh trắng fx_* ChatGPT (source-atop) |
| render.js `diaCong` | mask | cắt tròn lõi cổng PNG để xoay |
| render.js `lamNen0`, `ve0` (#1d1f23) | nen | 1 màu nền đặc toàn màn (như CSS background-color) — chờ raw_p4_board_1 |
| render.js `veDongChay`, `veQuai`, `veDan` | debug | chỉ khi `?debug` và thiếu ảnh |
| corehud.js `loiDo` | png | bản đỏ của ảnh lõi |
| render.js `huyHieu`, buff `+N`, nhãn kỹ năng | text | strokeText/fillText con số / chữ |

Ngoài khu (để các session kia xử lý; checker liệt kê đủ): `skills*.js veThem`, `growfx.js`, `hieuung.js` (vongPhu, duoiDau…), `fx.js`, `support.js`, `quaianim.js`, `unitpage.js`, `skilldemo.js`, `game.css`, `pass2.css`… — chạy `node tools/thap-kt-vetay.js` để xem.

## Hiệu năng / lỗi
Playwright headless (rasterize phần mềm), cùng máy, trước → sau: DPR1 SOLO 58 → 60 fps, CO-OP 43 → 48, PVP 40 → 41; DPR3 SOLO 33 → 33. Không lỗi trang ở cả 3 chế độ. (Headless không có GPU nên 2 bàn thấp hơn máy thật; không có tụt so với trước.)
