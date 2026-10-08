# Danh sách hình pixel art — Thần Thoại Việt

Danh sách MỌI hình cần vẽ lại bằng pixel art (lưới ký tự → PNG), dùng để session điều phối chia việc cho nhiều session vẽ song song.
Nguồn mỗi hình: `tools/pixel/src/<nhóm>/<mã>.txt` → build ra `assets/pixel/<nhóm>/<mã>.png` (+ `.json`). Quy chuẩn chi tiết: `docs/pixel/QUY-CHUAN.md`, bảng màu chung: `tools/pixel/palette.txt`.
Sinh từ dữ liệu game (js/data.js, js/enemies2.js, js/roles.js, js/chapters.js, js/maps.js) + đặc trưng trong các prompt cũ; mọi số dòng lấy bằng `grep -n` ở commit v199.

## Tổng quan

**Tổng: 973 hình** trong 48 lô (+ lô 0) — đã có mẫu 10 (lô 0), **còn 963 hình**.

| nhóm thư mục | số hình | ghi chú |
|---|---|---|
| `tuong` | 60 | tướng người + linh thú là tướng (32×32) |
| `quai` | 34 | quái thường, lính con, biến thể, tinh anh lớn (32×32) |
| `boss` | 9 | boss 48×48 / 64×64 |
| `nen` | 54 | ô nền 16×16, trang trí, cổng/thành, đế tướng |
| `icon` | 163 | icon UI 16×16, icon nhỏ 12×12 (+3 ngũ hành lô 0) |
| `ky-nang` | 240 | icon kỹ năng 24×24 (60 tướng × 4) |
| `do` | 98 | đồ trang bị, bộ, phụ kiện, đồ ghép, sính lễ (24×24) |
| `an-phu` | 36 | ấn phù 24×24 |
| `than-khi` | 60 | thần khí 24×24 (20 tướng Vàng × 3) |
| `vfx` | 137 | **do nhánh claude/vfx-kenney vẽ** — không chia lô |
| `giao-dien` | 45 | khung, nút, thanh, thẻ, huy hiệu (cỡ ghi riêng) |
| `canh` | 37 | cảnh 320×180 |

### Đếm đối chiếu với key trong code

- **HEROES = 60** (js/data.js:140): Thường 20 · Tím 20 · Vàng 20. Linh thú (tướng là thú) 6: Nghê Đồng, Thần Cá Ông (Tím); Thần Kim Quy, Kỳ Lân Vàng, Rồng Mẹ Hạ Long, Chúa Sơn Lâm (Vàng). → 60 hình `tuong/` (lô 1–7).
- **ENEMIES = 41** (js/data.js:1859 có 11 key + js/enemies2.js:13, 83 thêm 30 key): quái thường 17 · lính con 4 (Nòng Nọc, Giao Long Con, Đá Con, Cáo Con) · biến thể 8 · tinh anh lớn 3 (Tướng Thủy Quân, Chằn Lửa, Hồ Ly Bóng Đêm) · **boss 9**. → 32 hình `quai/` + 2 bản màu Giao Long (`giaolong-hoa`, `giaolong-tho`) + 9 `boss/`.
- Roster theo chương (ROSTERS, js/enemies2.js:123; ROSTER_NAMES, js/data.js:2150): `thuy` Thủy quân Thủy Tinh · `rung` Yêu tinh rừng Chằn Tinh · `hang` Hang Đại Bàng · `an` Quỷ binh giặc Ân · `bien` Thủy quái Biển Đông · `trieu` Quỷ binh Triệu Đà.
- **ITEMS = 78** (js/data.js:1466): trang bị lẻ 17 · đồ bộ 25 · phụ kiện 14 · đồ ghép 18 · sính lễ 4. SETS 5 (Lạc Long, Sơn Tinh, Chim Lạc, Trống Đồng, Ngựa Sắt). → 98 hình `do/` (17 trang bị lẻ theo mã + 20 `do_<loại>_<độ hiếm>` + 25 đồ bộ + 4 sính lễ + 14 phụ kiện + 18 đồ ghép).
- **RUNES = 36** (js/data.js:2054, 3 nhánh × 12). **LEGACY** 20 tướng Vàng × 3 = 60 thần khí (js/data.js:2187). **ELEMENTS** 5, **ROLES** 7 (js/roles.js:7), **MAP_THEMES** 7 (song, dam, rung, hang, dong, bien, thanh), **MAPS** 14, **CHAPTERS** 5, **LEVELS** 17.

## Mục lục lô

| lô | nhóm | nội dung | số hình | ưu tiên |
|---|---|---|---|---|
| 0 | tuong, quai, nen, icon | ĐÃ CÓ MẪU (session nền tảng) | 10 | — |
| 1 | `tuong` | tướng Thường 1/2 | 10 | cao |
| 2 | `tuong` | tướng Thường 2/2 | 10 | cao |
| 3 | `tuong` | tướng Tím 1/2 | 9 | cao |
| 4 | `tuong` | tướng Tím 2/2 | 9 | cao |
| 5 | `tuong` | tướng Vàng 1/2 | 8 | cao |
| 6 | `tuong` | tướng Vàng 2/2 | 8 | cao |
| 7 | `tuong` | linh thú (tướng là THÚ — vẽ thú, không vẽ người mặc đồ thú) | 6 | cao |
| 8 | `quai` | quái thường — thủy quân (Sơn Tinh – Thủy Tinh) + biển Đông (Lạc Long Quân) | 13 | cao |
| 9 | `quai` | quái thường — rừng/hang Chằn Tinh (Thạch Sanh) + quỷ binh giặc Ân / Triệu Đà | 10 | cao |
| 10 | `quai` | quái biến thể + tinh anh lớn (tướng địch) | 11 | cao |
| 11 | `boss` | boss (9) | 9 | cao |
| 12 | `nen` | ô nền theo chủ đề bản đồ + đường quái đi + mép | 18 | cao |
| 13 | `nen` | vật trang trí bản đồ (DECO) + cột mốc cửa vào | 16 | vừa |
| 14 | `nen` | cổng / thành cuối đường + đế đặt tướng | 20 | cao |
| 15 | `icon` | ngũ hành (còn thiếu) + vai trò + chỉ số | 25 | cao |
| 16 | `icon` | trạng thái + nhãn quái + tinh anh | 18 | cao |
| 17 | `icon` | tiền tệ + biểu tượng khác + icon vẽ tay ui_* | 25 | cao |
| 18 | `icon` | nút trong trận (bộ ui-tran) | 20 | cao |
| 19 | `icon` | nút menu + huy chương + icon SVG còn vẽ bằng code | 23 | vừa |
| 20 | `icon` | nút & icon UI còn vẽ bằng code 1/2 (emoji / ký hiệu chữ / SVG) | 25 | cao |
| 21 | `icon` | nút & icon UI còn vẽ bằng code 2/2 (sao, khoá, độ hiếm, ô trang bị, chợ 6 thẻ, chương) | 24 | cao |
| 22 | `ky-nang` | icon kỹ năng 1/12 — Lạc Tướng, Lực Sĩ Núi, Xạ Thủ Văn Lang, Thợ Săn Rừng, Thầy Mo Lửa | 20 | vừa |
| 23 | `ky-nang` | icon kỹ năng 2/12 — Thần Sương Núi, Dũng Sĩ Giáo Đồng, Thầy Chuông Đồng, Dũng Sĩ Tre Làng, Thợ Săn Ống Thổi | 20 | vừa |
| 24 | `ky-nang` | icon kỹ năng 3/12 — Người Đắp Đê, Trẻ Chăn Trâu, Chàng Chèo Đò, Cô Hái Sen, Chàng Đốt Nương | 20 | vừa |
| 25 | `ky-nang` | icon kỹ năng 4/12 — Cô Thả Đèn Trời, Thợ Rèn Đông Sơn, Ngư Phủ Sông Đà, Thợ Gốm Phù Lãng, Thầy Lang Lá Thuốc | 20 | vừa |
| 26 | `ky-nang` | icon kỹ năng 5/12 — Thạch Sanh, Cao Lỗ, Mai An Tiêm, Chử Đồng Tử, Tiên Dung | 20 | vừa |
| 27 | `ky-nang` | icon kỹ năng 6/12 — Lang Liêu, Mỵ Châu, Sọ Dừa, Ông Đùng, Thổ Công | 20 | vừa |
| 28 | `ky-nang` | icon kỹ năng 7/12 — Lý Ngư Tướng Quân, Trương Chi, Vua Lửa Pơtao Apui, Bà Hỏa, Thần Trống Đồng | 20 | vừa |
| 29 | `ky-nang` | icon kỹ năng 8/12 — Ông Táo, Lạc Hầu, Thần Săn Ba Vì, Thánh Gióng, Lạc Long Quân | 20 | vừa |
| 30 | `ky-nang` | icon kỹ năng 9/12 — Âu Cơ, Thiên Lôi, Chú Cuội, Mẹ Lúa, Sơn Tinh | 20 | vừa |
| 31 | `ky-nang` | icon kỹ năng 10/12 — Mẫu Địa, Long Nữ Động Đình, Kinh Dương Vương, Viêm Đế Thần Nông, Nữ Thần Mặt Trời | 20 | vừa |
| 32 | `ky-nang` | icon kỹ năng 11/12 — Mẫu Thoải, Thần Trụ Trời, An Dương Vương, Mẫu Thượng Ngàn, Nghê Đồng | 20 | vừa |
| 33 | `ky-nang` | icon kỹ năng 12/12 — Thần Cá Ông, Thần Kim Quy, Kỳ Lân Vàng, Rồng Mẹ Hạ Long, Chúa Sơn Lâm | 20 | vừa |
| 34 | `do` | trang bị thường theo loại × độ hiếm (do_<loại>_<độ hiếm>) | 20 | vừa |
| 35 | `do` | đồ bộ Lạc Long + Sơn Tinh + Chim Lạc + Trống Đồng (5 món mỗi bộ) | 20 | vừa |
| 36 | `do` | đồ bộ Ngựa Sắt + sính lễ boss + phụ kiện thường (nguyên liệu ghép) | 23 | vừa |
| 37 | `do` | đồ ghép (recipe) | 18 | vừa |
| 38 | `do` | trang bị theo mã món (thay icon SVG ART.item vẽ bằng code) | 17 | vừa |
| 39 | `an-phu` | Ấn Núi + nửa Ấn Gió | 18 | vừa |
| 40 | `an-phu` | nửa Ấn Gió + Ấn Sấm | 18 | vừa |
| 41 | `than-khi` | thần khí 1/3 — Thánh Gióng, Lạc Long Quân, Thần Kim Quy, An Dương Vương, Âu Cơ, Mẫu Thượng Ngàn, Nữ Thần Mặt Trời | 21 | vừa |
| 42 | `than-khi` | thần khí 2/3 — Mẫu Thoải, Thần Trụ Trời, Chúa Sơn Lâm, Kinh Dương Vương, Viêm Đế Thần Nông, Rồng Mẹ Hạ Long, Long Nữ Động Đình | 21 | vừa |
| 43 | `than-khi` | thần khí 3/3 — Sơn Tinh, Mẫu Địa, Kỳ Lân Vàng, Thiên Lôi, Chú Cuội, Mẹ Lúa | 18 | vừa |
| 44 | `vfx` | vfx — DO NHÁNH claude/vfx-kenney VẼ (không chia lô cho session khác) | 137 | nhánh claude/vfx-kenney |
| 45 | `giao-dien` | khung bảng + nút | 23 | cao |
| 46 | `giao-dien` | thanh máu, thẻ, khung, huy hiệu, núi Tản Viên | 22 | cao |
| 47 | `canh` | menu + kết quả trận + truyện Sơn Tinh | 17 | vừa |
| 48 | `canh` | bản đồ chương + nền truyện + nền bản đồ chủ đề | 20 | thấp |

## Cách giao việc

> **Đọc trước mục 0 PHONG CÁCH trong `docs/pixel/QUY-CHUAN.md`** (bắt buộc): tỉ lệ đầu:thân 1:1,5–1:2, mắt nhỏ có thần, không má hồng, màu trầm cổ kính, bóng 3 tông, họa tiết Đông Sơn — không vẽ trẻ con. Mọi chữ "chibi" trong bảng dưới hiểu theo mục đó.

1. **Mỗi session vẽ nhận đúng 1 lô** (riêng lô `vfx` thuộc nhánh **claude/vfx-kenney**, không giao cho ai khác). Thứ tự gợi ý: ưu tiên cao trước (tướng → quái → boss → nền → icon), cùng ưu tiên thì theo số lô.
2. Session vẽ **chỉ thêm file trong `tools/pixel/src/<nhóm>/`** của lô mình (mỗi mã một file `<mã>.txt`, mã = đúng cột "mã" bỏ tiền tố nhóm). Không sửa `palette.txt`, `tools/build-pixel.js`, js/ hay file của lô khác; cần màu mới → báo điều phối.
3. Đọc trước `docs/pixel/QUY-CHUAN.md` (định dạng file nguồn, khung, neo chân, viền, bảng màu) và xem mẫu lô 0 (`tools/pixel/src/tuong/giong.txt`, `chodo.txt`, `tanvien.txt`, `quai/tom.txt`, `nen/*.txt`, `icon/hanh-*.txt`).
4. Dựng + kiểm: `node tools/build-pixel.js <nhóm>/<mã>` (hoặc `--check`), xem ảnh phóng to bằng `--xem <thư mục tạm>` và **mở ảnh ra nhìn** (Read) — đúng đặc trưng cột "đặc trưng" và giữ được "dấu hiệu 32px".
5. **Đặc trưng là bắt buộc**: giới tính, loài (linh thú/quái là THÚ, không vẽ người mặc đồ thú), vật cầm đúng, màu chủ đạo, phụ kiện nhận diện, hành. Mâu thuẫn giữa các nguồn đã chốt ngay tại từng dòng (dấu ⚠) theo thứ tự ưu tiên PROMPT-GEN-LAI > PROMPT-DUNG-XUONG > prompts-*.csv > cũ hơn.
6. **Phá cách**: đọc mục "Phá cách" trong `docs/pixel/QUY-CHUAN.md` và cột "Hướng phá cách" của dòng mình vẽ (tướng/quái chung được đổi hình thể; nhân vật có danh tính giữ nhận diện, chỉ phá cách tạo hình; luôn giữ vai trò/vật cầm, màu hành, giới tính/loài khi là bản sắc).
7. Báo cáo cho điều phối: lô, danh sách mã đã xong, ảnh xem trước đã nhìn, mã còn vướng.

### Quy ước

- **Cỡ**: tướng / quái / linh thú 32×32 (neo chân 16,31); boss 48×48 hoặc 64×64 (ghi từng con); ô nền 16×16 lát liền; icon 16×16, icon nhỏ 12×12; đồ / ấn phù / kỹ năng / thần khí 24×24; cảnh 320×180 (hoặc 160×90 phóng ×2).
- **Động tác** (số khung chọn theo docs/CHUAN-ANIMATION.md mục 4 và giới hạn của build-pixel): tướng `idle 3 · attack 4 · cast 3 · hurt 1 · die 3`; quái/boss `walk 4 · attack 3 · hurt 1 · die 3`; boss có `enrage` thêm `rage 2`; quái bay: `walk` = vỗ cánh. Ô nền 1 khung (nước 2–4). Icon / đồ 1 khung.
- **Chân dung UI 32×32**: build tự cắt từ khung đứng (`<mã>-chan-dung.png`); dòng có "**chân dung riêng**" nên vẽ thêm `anim portrait` (thân ngang / đồ to che mặt khi cắt).
- **Nguồn**: `PROMPT-*.txt`, `prompts-*.csv`, `PROMPT_GEMINI_*.md`, `ICON-NHO.md` nằm trong `docs/`; tướng/quái ghi dòng FIX (gen lại) hoặc dòng tóm tắt "giữ" của PROMPT-GEN-LAI, dòng BODY/CREATURE của PROMPT-DUNG-XUONG và dòng key trong js/. prompts-tuong.csv / prompts-quai.csv do cùng bộ sinh nên trùng nội dung PROMPT-DUNG-XUONG (chỉ ghi khi khác).
- Mô tả icon kỹ năng / thần khí lấy nguyên văn tiếng Anh từ prompt icon cũ (PROMPT-THAY-HINH-CODE, PROMPT_GEMINI_V94) khi có; không có thì ghi tên chiêu + mô tả chiêu trong game.

## Lô 0 — ĐÃ CÓ MẪU (session nền tảng)

| mã | tên | ghi chú | Hướng phá cách |
|---|---|---|---|
| `tuong/giong` | Thánh Gióng | cưỡi ngựa sắt — lô 5 | giữ nhận diện — phá cách tạo hình: giáp sắt cháy đỏ như vừa ra lò, lửa bốc từ vai, ngựa sắt có khe nứt lửa ở khớp; vẫn gậy sắt |
| `tuong/tanvien` | Sơn Tinh (mã game `tanvien`) | lô 6 | giữ nhận diện — phá cách tạo hình: hai vai nhô thành đỉnh núi đá nhỏ, mây trắng quấn ngang hông, đá vụn lơ lửng quanh; vẫn GIÁO vàng + vương miện 3 đỉnh |
| `tuong/chodo` | Chàng Chèo Đò — cầm MÁI CHÈO | lô 2 | hồn lái đò sông Âm: da xanh tái ma mị, nón lá, chân tan thành sương, vẫn cầm mái chèo |
| `quai/tom` | Tôm Binh | lô 8 | giữ: lính tôm dữ tợn, giáp vỏ |
| `nen/co` | cỏ | lô 12 | — |
| `nen/dat` | đường đất | lô 12 | — |
| `nen/nuoc` | nước (2–4 khung) | lô 12 | — |
| `icon/hanh-kim` | ngũ hành Kim | mẫu khung icon ngũ hành | — |
| `icon/hanh-moc` | ngũ hành Mộc |  | — |
| `icon/hanh-thuy` | ngũ hành Thủy | `hanh-hoa`, `hanh-tho` còn thiếu → lô 15 | — |

## Lô 1 — tuong: tướng Thường 1/2

10 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `tuong/lactuong` | Lạc Tướng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~30, chắc nịch ngực rộng · giáp ngực đồng #C9963A sọc răng cưa, khố xanh gỉ đồng #2F6B5E, khoá thắt lưng mặt trời · cầm: rìu xéo Đông Sơn (lưỡi cong lệch) · mũ lông chim Lạc trắng hình quạt cao bằng thân, 3 vạch xăm má · hành Kim | **giáp đồng rỗng** — hồn tướng Lạc: bộ giáp ngực đồng + khố không có người bên trong, trong mũ chỉ có 2 đốm mắt xanh gỉ đồng; vẫn mũ lông chim Lạc trắng + rìu xéo | quạt lông trắng dựng trên đầu · rìu xéo đồng · thân đồng + khố xanh | PROMPT-GEN-LAI.txt:72 · PROMPT-DUNG-XUONG.txt:47 · js/data.js:141 |
| `tuong/lucsi` | Lực Sĩ Núi | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam khổng lồ, vai rộng gấp 3 đầu, da nâu đỏ đất sét · khố vàng đất #C99A3C, vòng cổ tay đồng · cầm: tay không — vác/ném TẢNG ĐÁ xám to hơn đầu · thân to nhất nhóm Thường · hành Thổ — ⚠ game `look.weapon = cleaver` (dao phay), GEN-LAI giữ "tay không / tảng đá" → vẽ tảng đá | **người đất sét** — khổng lồ đất sét nâu đỏ nứt nẻ, cỏ dại mọc trên vai, vụn đất rơi khi bước; vẫn vác tảng đá xám | tảng đá xám trên vai · bờ vai cực rộng · khố vàng đất | PROMPT-GEN-LAI.txt:73 · PROMPT-DUNG-XUONG.txt:68 · js/data.js:160 |
| `tuong/xathu` | Xạ Thủ Văn Lang | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam thiếu niên ~17, gầy cao, tay chân dài · áo quấn không tay xám bạc #BFC6CC, xà cạp xanh thép #5E7A8C, dây cung + quấn tay đỏ · cầm: CUNG gỗ dài cao hơn người, tên lắp sẵn — không đao/kiếm · búi tóc cao cắm 1 lông chim dài, ống tên da bên hông · hành Kim — ⚠ GEN-LAI: cung (ảnh cũ cầm đao); game `look = crossbow`, title "Nỏ tre" → vẽ CUNG theo GEN-LAI | **người-chim Lạc** — đầu chim Lạc mỏ dài, cánh tay có lông xám bạc, thân người gầy cao; vẫn CUNG dài + ống tên | cung dài cao hơn người · lông chim dựng trên búi · xám bạc + điểm đỏ | PROMPT-GEN-LAI.txt:657 · PROMPT-DUNG-XUONG.txt:90 · js/data.js:179 |
| `tuong/thosan` | Thợ Săn Rừng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam gầy dẻo, luôn khom thấp · áo choàng mũ trùm vá lá xanh rêu #3E5A32 + nâu lá #6B4A2E, quấn da ống chân · cầm: CUNG + ống tên (GEN-LAI giữ: "cung hợp thợ săn → game đổi sang cung") · mũ trùm sâu có 2 tai báo che mặt, mắt cam phát sáng · hành Mộc — ⚠ DUNG-XUONG/CSV: hai dao săn cầm ngược; GEN-LAI giữ ảnh cung → vẽ cung | **ma cây** — thân gỗ mục phủ rêu, mặt là hốc cây có 2 mắt cam phát sáng, mũ trùm lá + tai báo; vẫn CUNG | mũ trùm tai báo + mắt cam · cung · xanh rêu | PROMPT-GEN-LAI.txt:74 · PROMPT-DUNG-XUONG.txt:111 · js/data.js:198 |
| `tuong/thaymo` | Thầy Mo Lửa | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~45, cao gầy, tay dài · áo tím mận #5B2C6F viền lửa cam #F47A20, chuỗi hạt, mặt vẽ trắng xương · cầm: gậy gỗ xương xẩu đầu HỒ LÔ lửa cháy · vòng lông đỏ-đen + xương tròn quanh đầu như bánh xe lửa · hành Hỏa | **bộ xương** — bộ xương đội vòng mũ lông chim đỏ-đen, áo tím mận rách tả tơi, lửa cam trong hốc mắt; vẫn gậy xương đầu hồ lô lửa | vòng lông tròn quanh đầu · hồ lô lửa trên gậy · tím mận + cam | PROMPT-GEN-LAI.txt:75 · PROMPT-DUNG-XUONG.txt:132 · js/data.js:217 |
| `tuong/thansuong` | Thần Sương Núi | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · lơ lửng | Linh hồn sương dáng trẻ con, mảnh, lơ lửng — KHÔNG có chân (thân tan thành mây) · khăn sương quấn thân, lam băng nhạt #BFEAF5 + trắng sương · cầm: hai tay khum giữ TINH THỂ BĂNG xanh đậm — không giáo, không vũ khí · tóc trắng rất dài bay NGƯỢC lên như khói, đuôi mây thay chân · hành Thủy — ⚠ GEN-LAI: tinh thể băng (ảnh cũ cầm giáo); game `look = staff` → vẽ tinh thể | **hồn sương** (giữ hướng sẵn có) — mặt là mặt nạ băng trắng không biểu cảm, thân sương mờ đục, tóc khói dựng ngược; vẫn ôm tinh thể băng | tóc trắng dựng ngược · đuôi mây không chân · tinh thể xanh đậm | PROMPT-GEN-LAI.txt:681 · PROMPT-DUNG-XUONG.txt:153 · js/data.js:236 |
| `tuong/giaodong` | Dũng Sĩ Giáo Đồng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~20, thấp chắc như khối, chân ngắn to · áo vảy xám thiếc #8A9399, xà cạp đồng xỉn #A8742E · cầm: GIÁO đồng rất dài (gấp 2 người) mũi bạc + KHIÊN đồng tròn ở tay sau (giơ ngang, không che thân) · khiên tròn to · hành Kim | **người tê tê** — đầu + giáp vảy tê tê (con trút) xám thiếc tự nhiên, đứng 2 chân, đuôi vảy ngắn; vẫn GIÁO dài + KHIÊN tròn | giáo dài dựng đứng · khiên tròn đồng · xám thiếc | PROMPT-GEN-LAI.txt:78 · PROMPT-DUNG-XUONG.txt:174 · js/data.js:448 |
| `tuong/chuongdong` | Thầy Chuông Đồng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam cụ ~75 lưng còng, đầu hói tròn to (2.5 đầu) · áo lễ vải trắng ngà #EDE7D9 viền răng cưa đồng #B07D3A, chân trần, tua đỏ · cầm: gậy treo CHUÔNG ĐỒNG chùa to hơn đầu, giơ cao · tua đỏ ở chuông · hành Kim — ⚠ GEN-LAI ghi ảnh cũ là "chiêng đồng" (giữ) — chuông hay chiêng đều được, giữ dáng treo trên gậy | **con rối nước** — ông lão rối gỗ sơn bóng (kiểu múa rối nước), khớp vai chốt gỗ, sơn tróc lộ vân gỗ, áo lễ trắng ngà; vẫn giơ gậy treo CHUÔNG đồng | chuông đồng to trên gậy · đầu hói to · áo trắng ngà | PROMPT-GEN-LAI.txt:79 · PROMPT-DUNG-XUONG.txt:195 · js/data.js:466 |
| `tuong/tre` | Dũng Sĩ Tre Làng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam bé ~11, gầy, bàn chân to, tóc rối dựng (KHÔNG khăn) · áo không tay kem #F1E6C8, quần đùi xanh tre #A8D04A, đai vàng, chân trần · cầm: TAY CẦM sào tre xanh có ngọn lá, dài gấp 2 người, chĩa chéo lên trước — không cắm đất, không kiếm · — · hành Mộc — ⚠ GEN-LAI: sào tre cầm tay (ảnh cũ kiếm cắm đất) | **hình nhân tre đan** — cậu bé đan bằng nan tre (thân như giỏ, tóc là nan tre tua ra), đốt tre làm khớp; vẫn cầm sào tre có ngọn lá | sào tre chéo có ngọn lá · tóc rối · xanh tre + kem | PROMPT-GEN-LAI.txt:923 · PROMPT-DUNG-XUONG.txt:216 · js/data.js:560 |
| `tuong/ongthoi` | Thợ Săn Ống Thổi | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam vùng cao ~40, thấp đậm, bụng tròn · khố dệt đen #262626 sọc răng cưa trắng, khăn lưng xanh mòng két #2F6E5A, ống tre đựng kim bên hông · cầm: ỐNG THỔI tre rất dài cầm NGANG kề môi · tóc dài buộc thấp · hành Mộc — ⚠ GEN-LAI giữ ảnh nỏ ("vẫn là vũ khí săn xa"); game `look = crossbow` — ưu tiên ống thổi theo DUNG-XUONG vì tên tướng | **người cóc** — cóc tía bụng tròn đứng 2 chân (cóc là cậu ông trời), khố đen sọc trắng; vẫn ỐNG THỔI ngang kề miệng | ống thổi ngang dài hơn thân · khố đen sọc trắng · xanh mòng két | PROMPT-GEN-LAI.txt:80 · PROMPT-DUNG-XUONG.txt:237 · js/data.js:577 |

## Lô 2 — tuong: tướng Thường 2/2

10 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `tuong/dapde` | Người Đắp Đê | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | NỮ nông dân ~40, chắc khoẻ, hông rộng · áo nâu bùn #7A5A3A, quần chàm xắn ống dính bùn, sọt đất bên hông — KHÔNG giáp vàng, KHÔNG mũ trụ · cầm: XẺNG / cuốc gỗ bản dẹt — không giáo, không chĩa · NÓN LÁ vàng rơm · hành Thổ — ⚠ GEN-LAI chỉ ghi "FARMER" (không nêu giới tính) — giữ NỮ theo DUNG-XUONG; game `look = axe` | **người bùn** — người phụ nữ đắp bằng bùn đê nâu (bùn nhễu giọt ở tay, rơm lẫn trong thân), vẫn đội NÓN LÁ, cầm XẺNG; nữ | nón lá chóp · xẻng dẹt · nâu bùn + chàm | PROMPT-GEN-LAI.txt:972 · PROMPT-DUNG-XUONG.txt:258 · js/data.js:652 |
| `tuong/chantrau` | Trẻ Chăn Trâu | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam bé ~7, mũm mĩm, nhỏ nhất đội · cởi trần, quần đùi nâu trâu #8A5A2B, khăn vàng tươi quàng cổ, sáo trúc giắt lưng · cầm: GẬY CHĂN TRÂU đầu trâu (GEN-LAI giữ, game cận chiến `look = club`) · đầu cạo 3 chỏm tóc (trái đào) · hành Thổ — ⚠ DUNG-XUONG/CSV: ná cao su; GEN-LAI giữ gậy đầu trâu → vẽ gậy (ná có thể giắt lưng) | **tượng tò he** — cậu bé tò he bột gạo nặn bóng (nâu trâu + khăn vàng), que tre cắm dưới chân như đế; vẫn GẬY đầu trâu, 3 chỏm tóc | 3 chỏm tóc · khăn vàng · gậy đầu trâu | PROMPT-GEN-LAI.txt:83 · PROMPT-DUNG-XUONG.txt:279 · js/data.js:669 |
| **ĐÃ CÓ MẪU — lô 0** `tuong/chodo` | Chàng Chèo Đò | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~25, vai rộng, tay to, đầu cạo búi nhỏ · áo không tay trắng, quần chàm #2B4C7E xắn, đai thừng vàng — KHÔNG giáp · cầm: MÁI CHÈO gỗ bản rộng dài hơn người — không đao/kiếm · búi tóc nhỏ đỉnh đầu · hành Thủy — ⚠ GEN-LAI: mái chèo, không cầm đao (ảnh cũ giáp + đao) | hồn lái đò sông Âm: da xanh tái ma mị, nón lá, chân tan thành sương, vẫn cầm mái chèo | mái chèo bản rộng · búi tóc · chàm + trắng | PROMPT-GEN-LAI.txt:1068 · PROMPT-DUNG-XUONG.txt:300 · js/data.js:761 |
| `tuong/haisen` | Cô Hái Sen | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ bé ~10, mặt tròn · áo bà ba xanh nước nhạt #9ED3E8, quần hồng sen #F4A3C0, hoa sen cài tai · cầm: LÁ SEN to cầm làm ô che đầu + nụ sen hồng — không vũ khí · 2 bím tóc ngắn · hành Thủy | **tinh sen** — cô bé hoá từ đài sen: tóc là cánh sen hồng xếp lớp, da xanh lá nhạt, chân như cuống sen; vẫn che LÁ SEN | lá sen tròn như ô · 2 bím · hồng + xanh nhạt | PROMPT-GEN-LAI.txt:85 · PROMPT-DUNG-XUONG.txt:321 · js/data.js:778 |
| `tuong/dotnuong` | Chàng Đốt Nương | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam vùng cao ~16, gầy cao · khố đỏ son gỉ #A0462A, áo gi-lê xám tro, tóc buộc lá xanh · cầm: DAO RỰA cong (tay trước) + ĐUỐC cán dài đang cháy (tay sau) — không giáo · vẽ phẳng 2D như các tướng khác (ảnh cũ bóng 3D) · hành Hỏa — ⚠ GEN-LAI: dao rựa + đuốc, không giáo | **ma trơi** — thân khói tro xám, đầu là ngọn lửa đỏ có 2 mắt, khố đỏ son; vẫn DAO RỰA + ĐUỐC | đuốc cháy giơ cao · dao rựa cong · đỏ son + xám tro | PROMPT-GEN-LAI.txt:1140 · PROMPT-DUNG-XUONG.txt:342 · js/data.js:872 |
| `tuong/denroi` | Cô Thả Đèn Trời | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ bé ~8, rất thấp · áo tứ thân cam quýt #F6913A, thắt lưng vàng, ruy băng đỏ · cầm: hai tay nâng ĐÈN TRỜI giấy vàng #FFD45A to bằng người, trên đầu · 2 búi tóc · hành Hỏa | **hình nhân giấy** — bé gái giấy điệp cam xếp nếp như đèn lồng, mặt vẽ mực, đường gấp giấy rõ; vẫn nâng ĐÈN TRỜI vàng; nữ | đèn trời vàng trên đầu · 2 búi · cam + vàng | PROMPT-GEN-LAI.txt:87 · PROMPT-DUNG-XUONG.txt:363 · js/data.js:889 |
| `tuong/thoren` | Thợ Rèn Đông Sơn | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~40, to bè, cẳng tay lớn, bụng to · tạp dề da nâu sẫm #5A3A22, tay trần, vòng sắt cổ tay · cầm: BÚA TẠ đầu nung đỏ rực — không giáo · đầu hói bóng + râu đen rậm · hành Hỏa — ⚠ GEN-LAI: búa rèn (ảnh cũ giáo); game `look = cleaver` | **người đá nứt lửa** — thân đá đen bazan nứt nẻ, lửa đỏ rực trong các khe nứt, tạp dề da cháy sém; vẫn BÚA TẠ đầu đỏ | búa tạ đầu đỏ · đầu hói râu đen · tạp dề nâu | PROMPT-GEN-LAI.txt:1212 · PROMPT-DUNG-XUONG.txt:384 · js/data.js:985 |
| `tuong/nguphu` | Ngư Phủ Sông Đà | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~45, gầy gân, gối hơi khuỵu — HAI CHÂN NGƯỜI (không đuôi cá) · áo xanh sông #3E8E8A, quần chàm phai #46597A xắn, giỏ tre bên hông · cầm: CHĨA BA xiên cá · LƯỚI vắt vai như áo choàng, phao cam · hành Thủy — ⚠ GEN-LAI: người, KHÔNG tiên cá (ảnh cũ sai loài) | **bộ xương ngư phủ** — bộ xương rêu xanh, vỏ hến bám vai, 2 chân xương (không đuôi cá), áo xanh sông rách; vẫn LƯỚI vắt vai + phao cam + CHĨA BA | lưới vắt vai + phao cam · chĩa ba · xanh sông | PROMPT-GEN-LAI.txt:220 · PROMPT-DUNG-XUONG.txt:405 · js/data.js:1002 |
| `tuong/thogom` | Thợ Gốm Phù Lãng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ ~18, dáng vừa · tạp dề kem cát #E8D2A6 trên áo nâu đất, khăn nâu thắt nút · cầm: BÌNH GỐM tròn men lam #3E6FA8 giơ trên đầu sắp ném · khăn đầu thắt nút · hành Thổ | **tượng gốm** — cô gái gốm đất nung nâu đỏ có vết rạn men lam, khăn đầu cũng bằng gốm; vẫn giơ BÌNH GỐM men lam; nữ | bình gốm men lam trên đầu · khăn nút · kem + nâu | PROMPT-GEN-LAI.txt:90 · PROMPT-DUNG-XUONG.txt:426 · js/data.js:1019 |
| `tuong/thaylang` | Thầy Lang Lá Thuốc | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam cụ ~70, còng, gầy xương · áo xanh xám lá #8BAA6E, quần xắn, túi thuốc, hoa thuốc tím · cầm: GẬY CHỐNG cong · GÙI tre sau lưng đầy lá thuốc nhô quá đầu · hành Mộc — ⚠ game `look = staff + orb xanh` — giữ gậy chống, không cầu phép | **người nấm** — lão nấm linh chi: mũ nấm nâu đỏ to thay đầu tóc, thân cuống nấm còng, râu là sợi nấm trắng; vẫn GẬY CHỐNG + GÙI lá thuốc | gùi lá nhô quá đầu · gậy chống · xanh xám lá | PROMPT-GEN-LAI.txt:91 · PROMPT-DUNG-XUONG.txt:448 · js/data.js:1037 |

## Lô 3 — tuong: tướng Tím 1/2

9 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `tuong/thachsanh` | Thạch Sanh | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~22, cao cơ bắp, thân chữ V · cởi trần, khố xanh rừng #2E7D3A thắt dây thừng, viền tím-bạc · cầm: RÌU tiều phu lưỡi rộng khổng lồ — không giáo · ĐÀN NGUYỆT thần tròn vàng đeo lưng · hành Mộc — ⚠ GEN-LAI: rìu đốn củi (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: tóc dài buộc dây rừng, vết móng chằn mờ trên ngực, rìu lưỡi đá đen ánh sét, dây đàn nguyệt phát sáng sau lưng | rìu lưỡi rộng · đàn tròn vàng sau lưng · xanh rừng | PROMPT-GEN-LAI.txt:705 · PROMPT-DUNG-XUONG.txt:473 · js/data.js:314 |
| `tuong/caolo` | Cao Lỗ | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~45, cẳng tay to, bụng hơi phệ · tạp dề da #7B5434 đầy dụng cụ trên áo xám sắt #5B6168, viền tím-bạc · cầm: NỎ MÁY rộng hơn người cầm ngang, bánh răng đồng + tay quay — không kiếm · — · hành Kim — ⚠ GEN-LAI: nỏ máy (ảnh cũ kiếm trong vỏ) | giữ nhận diện — phá cách tạo hình: cẳng tay xăm hoa văn bánh răng Đông Sơn, cỗ nỏ máy to đeo trên vai như giá đỡ, phoi đồng bay quanh | nỏ ngang to có bánh răng · tạp dề da · xám sắt | PROMPT-GEN-LAI.txt:729 · PROMPT-DUNG-XUONG.txt:494 · js/data.js:333 |
| `tuong/antiem` | Mai An Tiêm | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~30, rám nắng · ÁO TƠI rơm #D8C38A xù như áo choàng cỏ, áo nâu rách, vòng cổ vỏ sò, viền tím-bạc · cầm: 1 QUẢ DƯA HẤU sọc xanh #1F5E2A ruột đỏ #E04848 sắp ném — không giáo · — · hành Mộc — ⚠ GEN-LAI: dưa hấu (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: tóc rối như cỏ biển đọng muối, áo tơi rơm xơ xác, chim én đậu vai (tích chim ăn hạt), dưa hấu nứt ruột đỏ hơi sáng | dưa hấu sọc · áo tơi rơm xù · da rám | PROMPT-GEN-LAI.txt:753 · PROMPT-DUNG-XUONG.txt:515 · js/data.js:352 |
| `tuong/cdt` | Chử Đồng Tử | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~20, rất gầy lộ sườn, chân dài · chỉ đóng khố, khăn ngang lưng xanh ngọc thiêng #4FC1C6, da cát #E6D3A3, viền tím-bạc · cầm: GẬY THẦN gỗ trơn (không lưỡi) + NÓN LÁ thần phát sáng ở tay sau · — · hành Thủy — ⚠ GEN-LAI: gậy thần + nón (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: thân gầy cháy nắng dính cát sông, nón lá thần toả quầng ngọc như vầng trăng, gậy thần có búp sen nở ở đầu | nón lá sáng ngọc · gậy trơn cao · thân gầy chỉ đóng khố | PROMPT-GEN-LAI.txt:802 · PROMPT-DUNG-XUONG.txt:537 · js/data.js:390 |
| `tuong/tiendung` | Tiên Dung | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ công chúa ~17, mảnh · áo tứ thân đỏ thắm #C8243A, thắt lưng hồng đào #F7C59F, viền tím-bạc · cầm: QUẠT lụa tròn to — không kiếm · tóc 2 vòng khuyên to trên đỉnh · hành Hỏa — ⚠ GEN-LAI: quạt tiên (ảnh cũ kiếm) | giữ nhận diện — phá cách tạo hình: tóc búi cao cài hoa, vạt áo đỏ bay như lửa, quạt lụa mở toé tia lửa tiên; nữ | quạt tròn to · 2 vòng tóc · đỏ thắm | PROMPT-GEN-LAI.txt:826 · PROMPT-DUNG-XUONG.txt:558 · js/data.js:409 |
| `tuong/langlieu` | Lang Liêu | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam hoàng tử ~20, hiền, vai hẹp · áo vàng son #E3B448, thắt lưng nâu, viền tím-bạc · cầm: MÂM bánh chưng vuông gói lá xanh — không giáo · chồng bánh chưng (DUNG-XUONG) · hành Thổ — ⚠ GEN-LAI: mâm bánh chưng (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: tay lấm bột nếp, áo vàng son có miếng vá, bánh chưng toả hơi khói thơm thành hình mây, gấu áo dính bùn ruộng | bánh chưng vuông xanh trên mâm · áo vàng son | PROMPT-GEN-LAI.txt:850 · PROMPT-DUNG-XUONG.txt:579 · js/data.js:428 |
| `tuong/mychau` | Mỵ Châu | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ công chúa ~16, nhỏ nhắn · váy lụa tím nhạt #C9C3DD dưới ÁO LÔNG NGỖNG trắng #F7F7F2 dài kéo đất (không cánh), trâm ngọc, 1 ruy băng đỏ · cầm: tay trước mở rắc lông ngỗng — không kiếm, không vũ khí · tóc đen thẳng dài tới gối · hành Kim — ⚠ GEN-LAI: tay không rắc lông (ảnh cũ kiếm) | giữ nhận diện — phá cách tạo hình: gương mặt trầm buồn, lông ngỗng rơi thành vệt sau lưng lẫn hạt ngọc trai lăn (tích giếng Trọng Thủy); nữ | áo lông trắng hình tam giác · tóc đen dài · lông bay từ tay | PROMPT-GEN-LAI.txt:874 · PROMPT-DUNG-XUONG.txt:621 · js/data.js:502 |
| `tuong/sodua` | Sọ Dừa | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam bé gần như nằm trọn trong QUẢ DỪA tròn (dừa là thân, chỉ thò tay chân) · vỏ nâu dừa #7A5230, chỏm vỏ làm mũ, viền tím-bạc quanh miệng vỏ, sáo nhỏ buộc lưng · cầm: 1 quả DỪA XANH #6FAF3C sắp ném — không giáo · sáo trúc giắt lưng · hành Mộc — ⚠ GEN-LAI: dừa + sáo (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: vỏ dừa khắc mặt dữ, 2 mắt sáng trong lỗ mắt dừa, tay chân là dây xơ dừa bện; vẫn thân quả dừa | thân tròn quả dừa · chỏm vỏ làm mũ · dừa xanh trên tay | PROMPT-GEN-LAI.txt:947 · PROMPT-DUNG-XUONG.txt:643 · js/data.js:594 |
| `tuong/ongdung` | Ông Đùng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam khổng lồ dân gian, thân dài, tay chân to · khố rơm vàng #D8B35A, rêu xanh, da sạm, viền tím-bạc · cầm: ĐÒN GÁNH tre với 2 sọt đất to rộng hơn thân — không giáo · — · hành Thổ — ⚠ GEN-LAI: đòn gánh (ảnh cũ giáo); game `look = cleaver` | giữ nhận diện — phá cách tạo hình: người khổng lồ thân như gò đất có cỏ mọc trên vai, bàn chân để lại vết lõm thành ao; vẫn ĐÒN GÁNH 2 sọt đất | đòn gánh 2 sọt đất · thân to cao · khố rơm | PROMPT-GEN-LAI.txt:996 · PROMPT-DUNG-XUONG.txt:665 · js/data.js:686 |

## Lô 4 — tuong: tướng Tím 2/2

9 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `tuong/thocong` | Thổ Công | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam cụ ~80, thấp tròn (2.5 đầu), rộng gần bằng cao · áo vàng nâu #B88A3E, mũ tròn đen mềm (KHÔNG cánh chuồn), thắt lưng đỏ, viền tím-bạc · cầm: GẬY TRE ngắn treo HỒ LÔ — không đại đao · râu trắng dài tới bụng · hành Thổ — ⚠ GEN-LAI: gậy tre hồ lô (ảnh cũ đại đao) | giữ nhận diện — phá cách tạo hình: thân thấp tròn như ụ đất, chân lẫn vào đất, râu trắng dài như rễ cây; vẫn gậy tre treo hồ lô | râu trắng tới bụng · hồ lô trên gậy · dáng tròn vo | PROMPT-GEN-LAI.txt:1020 · PROMPT-DUNG-XUONG.txt:686 · js/data.js:705 |
| `tuong/lyngu` | Lý Ngư Tướng Quân | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam tướng trẻ ~25, chân bật (NGƯỜI — cá chép hoá tướng, không vẽ cá) · giáp vảy chép cam #F2862E + trắng, giáp vai hình vây, viền đỏ-vàng + tím-bạc · cầm: ĐAO CÁN DÀI lưỡi hình vây cá · mào mũ hình ĐUÔI CÁ CHÉP cong to · hành Thủy — ⚠ GEN-LAI giữ ảnh giáo ("đao cán dài — tướng võ, hợp"); game `look = staff` | **người cá chép** — đầu cá chép râu dài đội mũ trụ, thân người giáp vảy cam-trắng, mào đuôi chép giữ nguyên (đang hoá rồng); vẫn ĐAO cán dài lưỡi vây cá | mào đuôi cá chép · giáp vảy cam-trắng · đao vây cá | PROMPT-GEN-LAI.txt:86 · PROMPT-DUNG-XUONG.txt:707 · js/data.js:796 |
| `tuong/truongchi` | Trương Chi | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~22, gầy, hơi gù · áo chàm vá, nón lá đeo SAU LƯNG, tím xanh hoàng hôn #5B5F9E, điểm trăng bạc, viền tím-bạc — KHÔNG giáp · cầm: SÁO TRÚC dài — không giáo · đứng trong THUYỀN nan nhỏ hình trăng khuyết dưới chân · hành Thủy — ⚠ GEN-LAI: sáo trúc (ảnh cũ giáp + giáo) | giữ nhận diện — phá cách tạo hình: gương mặt xấu theo tích (nón che nửa mặt), thân hơi mờ như ảo ảnh tiếng sáo, nốt nhạc ánh trăng bay; vẫn SÁO + thuyền trăng khuyết | thuyền khuyết dưới chân · sáo ngang · nón sau lưng | PROMPT-GEN-LAI.txt:1092 · PROMPT-DUNG-XUONG.txt:728 · js/data.js:815 |
| `tuong/potaoapui` | Vua Lửa Pơtao Apui | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam tù trưởng Gia Rai ~40, vạm vỡ · khố thổ cẩm đen #1E1E1E + đỏ #B0182A hoa văn răng cưa, vòng tay đồng, viền tím-bạc · cầm: GƯƠM THẦN lửa to — không giáo · mũ SỪNG TRÂU cong to · hành Hỏa — ⚠ GEN-LAI: gươm thần (ảnh cũ giáo); game `look = axe` | giữ nhận diện — phá cách tạo hình: mặt nạ gỗ Tây Nguyên có sừng trâu cong, lửa cháy trên hai vai, hoa văn thổ cẩm phát sáng; vẫn GƯƠM lửa | sừng trâu cong · gươm lửa · đen-đỏ thổ cẩm | PROMPT-GEN-LAI.txt:1164 · PROMPT-DUNG-XUONG.txt:749 · js/data.js:907 |
| `tuong/baahoa` | Bà Hỏa | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · lơ lửng | Nữ bí ẩn ~40, lơ lửng nhẹ, mảnh · áo đỏ rượu vang #7A1426 hoa văn lửa đen, viền tím-bạc · cầm: QUẢ CẦU LỬA trong lòng bàn tay (GEN-LAI giữ: lửa/đuốc trong tay) · tóc khổng lồ bay ngược như lửa khói, rộng hơn thân · hành Hỏa | giữ nhận diện — phá cách tạo hình: thân dưới tan thành ngọn lửa (không chân), mặt tro trắng bình thản, tóc lửa bốc ngược; nữ, vẫn cầu lửa | tóc lửa bốc ngược · cầu lửa trên tay · đỏ rượu + đen | PROMPT-GEN-LAI.txt:88 · PROMPT-DUNG-XUONG.txt:770 · js/data.js:926 |
| `tuong/trongdong` | Thần Trống Đồng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam thần trống, thân tròn như thùng, chân ngắn · khăn quấn nâu đỏ #7A3B1E gắn phiến đồng, mũ lông chim Lạc nhỏ, vàng đồng #D4A23C, gỉ xanh, viền tím-bạc · cầm: HAI DÙI TRỐNG gỗ · TRỐNG ĐỒNG Đông Sơn to đeo sau lưng, mặt sao mặt trời quay ra · hành Kim — ⚠ GEN-LAI giữ ảnh "trống cầm tay"; game `look = cleaver` → vẽ trống + dùi | **trống đồng sống** — thân là chiếc trống đồng (tang trống làm bụng, mặt trống sao 12 cánh trên lưng), tay chân đồng gỉ xanh, mặt nhỏ trên tang trống; vẫn HAI DÙI | mặt trống có sao sau lưng · 2 dùi · vàng đồng | PROMPT-GEN-LAI.txt:92 · PROMPT-DUNG-XUONG.txt:791 · js/data.js:1055 |
| `tuong/ongtao` | Ông Táo | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~50, lùn mập, bụng tròn · áo đỏ cam #E0592A, KHÔNG mặc quần (chân trần — tích dân gian), viền tím-bạc · cầm: KẸP THAN sắt dài gắp than hồng — không đại đao · MŨ CÁNH CHUỒN đen 2 cánh ngang dài + cá chép vàng nhỏ bơi quanh · hành Hỏa — ⚠ GEN-LAI: kẹp than (ảnh cũ đại đao); game `look = daggers` | giữ nhận diện — phá cách tạo hình: mặt đỏ ửng hơi bếp, khói bếp cuộn quanh người, than hồng rơi từ kẹp; vẫn chân trần không quần, mũ cánh chuồn, cá chép | mũ cánh chuồn ngang · cá chép vàng · kẹp than đỏ | PROMPT-GEN-LAI.txt:1236 · PROMPT-DUNG-XUONG.txt:833 · js/data.js:1093 |
| `tuong/lachau` | Lạc Hầu | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam ~55, gầy, lưng thẳng, cố vấn bộ Lạc · áo vàng mù tạt #BF9B30 cổ nâu, viền tím-bạc · cầm: BÚA ĐÁ + KHIÊN ĐỒNG (GEN-LAI giữ; game "búa đá và khiên đồng") · mũ nhọn; (tuỳ chọn) cờ chim Lạc đỏ nhỏ cắm lưng · hành Thổ — ⚠ DUNG-XUONG/CSV: cán cờ chim Lạc; GEN-LAI + game: búa đá + khiên đồng → vẽ búa + khiên | **tượng đá ong** — lão cố vấn bằng đá ong vàng lỗ chỗ, mũ nhọn đá, vết rêu ở khớp; vẫn BÚA ĐÁ + KHIÊN ĐỒNG | mũ nhọn · búa đá + khiên đồng · vàng mù tạt | PROMPT-GEN-LAI.txt:93 · PROMPT-DUNG-XUONG.txt:854 · js/data.js:1192 |
| `tuong/thansan` | Thần Săn Ba Vì | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam thần săn ~30, cao gầy, chân dài · áo da xanh ô-liu #556B2F, áo choàng lông nâu #C7A27A, vòng cổ xương, sơn chiến đỏ son, viền tím-bạc · cầm: ĐAO RỪNG (GEN-LAI giữ; game `look = saber`, "vuốt hổ đao rừng") · mũ sọ hươu GẠC to phân nhánh · hành Mộc — ⚠ DUNG-XUONG/CSV: giáo tre lưỡi lá; GEN-LAI giữ đao → vẽ đao | **người-hươu** — mặt là sọ hươu trắng gạc phân nhánh, thân người gầy cao xanh ô-liu, chân móng guốc, áo choàng lông; vẫn ĐAO RỪNG | gạc hươu to · áo choàng lông · đao rừng | PROMPT-GEN-LAI.txt:94 · PROMPT-DUNG-XUONG.txt:875 · js/data.js:1211 |

## Lô 5 — tuong: tướng Vàng 1/2

8 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| **ĐÃ CÓ MẪU — lô 0** `tuong/giong` | Thánh Gióng | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** · cưỡi ngựa (người + ngựa 1 khối) | Nam — cậu bé khổng lồ CƯỠI NGỰA SẮT (ngựa + người một khối) · áo đỏ gỉ #B23A1E, phiến giáp sắt, mũ sắt, ngựa sắt đen #2B2B2B, viền vàng, quầng nhỏ · cầm: **GẬY SẮT** (quyết định điều phối; bụi tre nhổ gốc cháy = chiêu) · ngựa sắt đen BỜM LỬA · hành Hỏa — ⚠ GEN-LAI giữ ảnh giáo ("gậy sắt / tre hợp"); DUNG-XUONG: bụi tre cháy; game: gậy tre ngà → đã chốt GẬY SẮT (mẫu duyệt) | giữ nhận diện — phá cách tạo hình: giáp sắt cháy đỏ như vừa ra lò, lửa bốc từ vai, ngựa sắt có khe nứt lửa ở khớp; vẫn gậy sắt | khăn vàng · giáp sắt + áo choàng đỏ · gậy sắt (ngựa sắt ở chiêu/triệu hồi) | PROMPT-GEN-LAI.txt:76 · PROMPT-DUNG-XUONG.txt:900 · js/data.js:257 |
| `tuong/llq` | Lạc Long Quân | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam vua rồng ~40, cao lớn vai rộng · áo xanh biển sâu #1F5FA8 vảy rồng ngọc #3FB59E, viền vàng, quầng nhỏ · cầm: GIÁO (GEN-LAI giữ: "kiếm / giáo hợp"; game `look = spear`) · SỪNG RỒNG phân nhánh to, dải lụa đuôi rồng bay sau · hành Thủy — ⚠ DUNG-XUONG/CSV: kiếm dài thẳng; GEN-LAI + game: giáo → vẽ giáo | giữ nhận diện — phá cách tạo hình: tóc như bờm rồng bay, vảy rồng ngọc mọc lên cổ và má, mắt vàng con ngươi dọc, sóng cuộn quanh chân; vẫn GIÁO | sừng rồng nhánh · dải lụa đuôi rồng · xanh biển + ngọc | PROMPT-GEN-LAI.txt:77 · PROMPT-DUNG-XUONG.txt:921 · js/data.js:276 |
| `tuong/auco` | Âu Cơ | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | Nữ Mẹ Tiên ~25, cao thanh · áo kem #FFF6E0 viền vàng #E7C46C, khăn san hô hồng, quầng nhỏ · cầm: ĐŨA LÔNG HẠC (tay trước) + túi lụa BỌC TRĂM TRỨNG (tay sau) — không giáo · CÁNH HẠC trắng lớn xoè lên · hành Thổ — ⚠ GEN-LAI: đũa lông hạc + bọc trứng (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: tóc trắng như lông hạc, lông vũ mọc từ cẳng tay nối vào đôi cánh hạc, bọc trăm trứng phát sáng như đèn; nữ | cánh hạc trắng to · bọc trứng · kem + vàng | PROMPT-GEN-LAI.txt:778 · PROMPT-DUNG-XUONG.txt:963 · js/data.js:371 |
| `tuong/thienloi` | Thiên Lôi | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam thần sấm vạm vỡ, vai gấp đôi đầu · giáp chàm bão #4A5578 sọc sét vàng #FFE14A, giáp tay bạc #C8D0DA, viền vàng · cầm: LƯỠI TẦM SÉT: rìu đá sấm to trên cán ngắn — không kiếm · tóc trắng dựng như tia sét + đôi cánh lông nhỏ sau lưng · hành Kim — ⚠ GEN-LAI: búa/lưỡi tầm sét (ảnh cũ kiếm); game `look = staff + orb` | giữ nhận diện — phá cách tạo hình: da xanh chàm như mây giông, mắt trắng loé chớp, tia sét nhảy giữa hai tay; vẫn LƯỠI TẦM SÉT | tóc trắng dựng sét · rìu đá sấm · cánh nhỏ | PROMPT-GEN-LAI.txt:899 · PROMPT-DUNG-XUONG.txt:1005 · js/data.js:540 |
| `tuong/cuoi` | Chú Cuội | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | Nam ~35, tròn mập, vui vẻ · áo vàng trăng nhạt #F4E9A8, mặt dây trăng khuyết bạc, viền vàng, quầng ánh trăng · cầm: ĐÒN GÁNH tre vác vai (game: `look.weapon = pole`, chiêu "Đòn Gánh Quật" js/data.js:622) · CÂY ĐA thần vác sau lưng, tán tròn xanh #3C7F45 cao quá đầu · hành Mộc — ⚠ DUNG-XUONG: rìu; GEN-LAI giữ ảnh "đòn gánh + giỏ" → **chốt ĐÒN GÁNH** theo dữ liệu game (quyết định điều phối) | giữ nhận diện — phá cách tạo hình: thân phủ ánh trăng bạc, chân lơ lửng rời đất (đang bay lên cung trăng), rễ đa quấn quanh đòn gánh; vẫn ĐÒN GÁNH + cây đa sau lưng | tán đa tròn trên đầu · trăng khuyết · đòn gánh | PROMPT-GEN-LAI.txt:81 · PROMPT-DUNG-XUONG.txt:1026 · js/data.js:613 |
| `tuong/melua` | Mẹ Lúa | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ mẹ ~45, tròn phúc hậu, hông rộng · áo nhiều lớp xanh lúa non #7DBF4E + vàng lúa chín #E9C84A thêu bông lúa, viền vàng, quầng nhỏ · cầm: ôm BÓ LÚA vàng to như bế con (GEN-LAI giữ: liềm + gùi lúa cũng hợp; game `look = sickle`) · vương miện bông lúa · hành Mộc | giữ nhận diện — phá cách tạo hình: tóc là bông lúa chín rũ, da nâu đất ruộng, áo kết từ lá lúa non; nữ, vẫn ôm bó lúa | bó lúa vàng ôm ngực · vương miện bông lúa · xanh + vàng | PROMPT-GEN-LAI.txt:82 · PROMPT-DUNG-XUONG.txt:1047 · js/data.js:632 |
| **ĐÃ CÓ MẪU — lô 0** `tuong/tanvien` | Sơn Tinh | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam thần núi trẻ ~25, cao lớn (Sơn Tinh — mã tanvien) · giáp xanh ô-liu ngọc #6F8A3C hoa văn núi, áo choàng xanh, viền vàng #D9A93A, mây trắng · cầm: GIÁO vàng (GEN-LAI giữ; game `look = spear`) — DUNG-XUONG: núi nhỏ lơ lửng trên lòng bàn tay + sách phép đeo hông · VƯƠNG MIỆN 3 ĐỈNH NÚI · hành Thổ — ⚠ GEN-LAI + game: giáo; DUNG-XUONG: núi nhỏ + sách phép → vẽ giáo, núi nhỏ dùng ở khung cast | giữ nhận diện — phá cách tạo hình: hai vai nhô thành đỉnh núi đá nhỏ, mây trắng quấn ngang hông, đá vụn lơ lửng quanh; vẫn GIÁO vàng + vương miện 3 đỉnh | vương miện 3 đỉnh núi · giáo/núi nhỏ · xanh ô-liu + vàng | PROMPT-GEN-LAI.txt:84 · PROMPT-DUNG-XUONG.txt:1068 · js/data.js:723 |
| `tuong/maudia` | Mẫu Địa | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ Thánh Mẫu đất ~40, vai rộng — KHÔNG nam, không râu · áo đất nung #B5562F hoa văn rễ, vương miện vàng, viền vàng, mầm xanh · cầm: ôm CHUM HẠT GIỐNG đất nung — không kiếm · rễ cây lan từ gấu áo xuống đất, tóc tết rễ + hoa · hành Thổ — ⚠ GEN-LAI: nữ + chum hạt (ảnh cũ nam cầm kiếm) | giữ nhận diện — phá cách tạo hình: da đất rạn nứt có mầm xanh mọc ra từ vết nứt, gấu áo thành rễ; nữ, vẫn ôm chum hạt | gấu áo thành rễ · chum hạt · đất nung + mầm xanh | PROMPT-GEN-LAI.txt:1044 · PROMPT-DUNG-XUONG.txt:1089 · js/data.js:742 |

## Lô 6 — tuong: tướng Vàng 2/2

8 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `tuong/longnu` | Long Nữ Động Đình | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ công chúa rồng ~20, cao thanh, cổ dài — KHÔNG nam · lụa xanh ngọc biển #6FD3D8 hoa văn sóng, trắng ngọc trai, điểm hồng san hô, viền vàng · cầm: hai tay nâng NGỌC RỒNG to phát sáng — không kiếm · sừng rồng nhỏ, gấu váy thành VÂY CÁ xoè, tóc dài như nước · hành Thủy — ⚠ GEN-LAI: nữ + ngọc rồng (ảnh cũ nam cầm kiếm) | giữ nhận diện — phá cách tạo hình: tóc là dòng nước chảy không ngừng, vảy ngọc trai lấm tấm trên má và cẳng tay; nữ, vẫn nâng NGỌC RỒNG | ngọc to 2 tay · sừng nhỏ · gấu váy vây cá | PROMPT-GEN-LAI.txt:1116 · PROMPT-DUNG-XUONG.txt:1131 · js/data.js:853 |
| `tuong/kinhduong` | Kinh Dương Vương | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam vua ~50, vạm vỡ, ngực thùng, râu quăn rậm · giáp đỏ tươi #D8352A + vàng #E8B23A, áo choàng đỏ, viền vàng · cầm: KIẾM ĐỒNG bản rộng (GEN-LAI giữ ảnh "đại đao lưỡi lá — kiếm/đao hợp"; game `look = glaive`) · VƯƠNG MIỆN mặt trời tròn tia nhọn · hành Hỏa | giữ nhận diện — phá cách tạo hình: râu tóc bốc như lửa, vương miện mặt trời cháy rực, áo choàng đỏ viền tro; vẫn KIẾM đồng bản rộng | vương miện mặt trời · râu quăn · kiếm/đao bản rộng đỏ-vàng | PROMPT-GEN-LAI.txt:89 · PROMPT-DUNG-XUONG.txt:1152 · js/data.js:946 |
| `tuong/viemde` | Viêm Đế Thần Nông | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam thần già ~80, lùn chắc, hơi còng · áo cam cháy #D9622B dưới áo choàng lá + rơm, viền vàng, quầng mặt trời · cầm: CUỐC lưỡi cháy lửa — không giáo · 2 SỪNG BÒ nhỏ trên trán, râu trắng dài · hành Hỏa — ⚠ GEN-LAI: cuốc lửa (ảnh cũ giáo ngắn) | giữ nhận diện — phá cách tạo hình: da như vỏ cây cháy sém, sừng bò mọc mầm lúa, áo choàng lá rơm có lửa liếm mép; vẫn CUỐC lửa | sừng bò nhỏ · cuốc lửa · áo choàng lá rơm | PROMPT-GEN-LAI.txt:1188 · PROMPT-DUNG-XUONG.txt:1173 · js/data.js:964 |
| `tuong/matroi` | Nữ Thần Mặt Trời | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | Nữ nữ thần ~25, cao thanh · áo vàng cam #FFB12E gấu lửa, vương miện vàng, viền vàng · cầm: QUYỀN TRƯỢNG đầu đĩa mặt trời — không giáo · ĐĨA MẶT TRỜI 12 tia khổng lồ sau lưng · hành Hỏa — ⚠ GEN-LAI: trượng mặt trời (ảnh cũ giáo) | giữ nhận diện — phá cách tạo hình: tóc là tia nắng, mặt mang hoa văn mặt trời Đông Sơn, gấu áo tan thành lửa; nữ, vẫn QUYỀN TRƯỢNG + đĩa 12 tia | đĩa mặt trời 12 tia sau lưng · trượng mặt trời · vàng cam | PROMPT-GEN-LAI.txt:1260 · PROMPT-DUNG-XUONG.txt:1194 · js/data.js:1113 |
| `tuong/mauthoai` | Mẫu Thoải | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nữ Thánh Mẫu sông nước ~50 — KHÔNG nam · áo trắng + xanh hoàng gia #2F59B8, vương miện bạc có mạng che, viền vàng · cầm: GẬY GÁO NƯỚC bạc — không giáo · NGỒI xếp bằng trên ĐÀI SEN TRẮNG nổi trên sóng · hành Thủy — ⚠ GEN-LAI: nữ + gậy gáo (ảnh cũ nam cầm giáo) | giữ nhận diện — phá cách tạo hình: thân dưới hoà vào sóng, tóc là thác nước đổ xuống đài sen; nữ, vẫn GẬY GÁO bạc | đài sen trắng + sóng dưới · vương miện mạng · xanh hoàng gia | PROMPT-GEN-LAI.txt:1284 · PROMPT-DUNG-XUONG.txt:1215 · js/data.js:1133 |
| `tuong/trutroi` | Thần Trụ Trời | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam người khổng lồ đá, thân trên khổng lồ, chân như cột · khố dây thừng tết, đá trên vai, xám đá #8C8C84, dải đất son, viền vàng · cầm: CỘT ĐÁ CHỐNG TRỜI cầm như chày — không kiếm · mây xanh quanh đỉnh cột · hành Thổ — ⚠ GEN-LAI: cột trời (ảnh cũ kiếm) | giữ nhận diện — phá cách tạo hình: thân là cột đá vôi nứt, mây vướng trên vai, 2 mắt là 2 hốc hang sáng; vẫn CỘT ĐÁ chống trời | cột đá cao quá đầu · thân đá xám · mây xanh | PROMPT-GEN-LAI.txt:1308 · PROMPT-DUNG-XUONG.txt:1236 · js/data.js:1151 |
| `tuong/adv` | An Dương Vương | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 | Nam vua ~50, cao gầy, lưng thẳng · áo bào chàm đen #2C3550 + phiến giáp bạc #AEB8C2, viền vàng, quầng vàng nhỏ · cầm: NỎ THẦN Linh Quang bằng đồng, lẫy vuốt rùa vàng phát sáng, cầm ngang nhắm — không kiếm · VƯƠNG MIỆN tầng xoắn ốc như thành Cổ Loa · hành Kim — ⚠ GEN-LAI: nỏ thần (ảnh cũ kiếm) | giữ nhận diện — phá cách tạo hình: áo bào xếp vảy như mai rùa lục giác, vương miện xoắn ốc Cổ Loa, lẫy nỏ vuốt rùa vàng sáng rực; vẫn NỎ THẦN | vương miện xoắn cao · nỏ ngang · chàm đen + bạc | PROMPT-GEN-LAI.txt:1332 · PROMPT-DUNG-XUONG.txt:1278 · js/data.js:1230 |
| `tuong/mau` | Mẫu Thượng Ngàn | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | Nữ thần núi rừng, cao thanh, cổ dài — KHÔNG nam · áo dài lục bảo #1E9E6A thêu rừng, viền vàng · cầm: CÀNH HOA đang nở — không kiếm · QUẠT LÁ xanh + hoa xoè sau lưng như đuôi công, vương miện hoa hồng #F28CB1 · hành Mộc — ⚠ GEN-LAI: nữ + cành hoa (ảnh cũ nam cầm kiếm) | giữ nhận diện — phá cách tạo hình: tóc là tán lá rừng, da có vân gỗ nhẹ, chim nhỏ đậu vai, hoa nở theo bước chân; nữ, vẫn CÀNH HOA | quạt lá xoè sau lưng · vương miện hoa · lục bảo + hồng | PROMPT-GEN-LAI.txt:1356 · PROMPT-DUNG-XUONG.txt:1299 · js/data.js:1249 |

## Lô 7 — tuong: linh thú (tướng là THÚ — vẽ thú, không vẽ người mặc đồ thú)

6 hình · ưu tiên cao.

| mã | tên | cỡ | động tác | đặc trưng (giới tính/loài · trang phục/màu · vật cầm · phụ kiện · hành) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `tuong/nghedong` | Nghê Đồng **[linh thú]** | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | LINH THÚ — Nghê đồng canh đình (chó-sư tử), đi 4 chân, thấp rộng, đầu to — KHÔNG người · thân đồng cổ #8C5A2B loang gỉ xanh #5FA39A, chuông vàng trên vòng cổ đỏ, viền tím-bạc · cầm: không vũ khí — vồ, cắn · bờm xoắn hình ngọn lửa quanh đầu, đuôi xoắn cuộn lên lưng · hành Kim — ⚠ GEN-LAI: linh thú 4 chân (ảnh cũ người cầm song kiếm); docs/PROMPT_GEMINI_V94 cũ: "đứng thẳng" → bỏ | giữ nhận diện — phá cách tạo hình: tượng nghê đồng đình làng sống dậy: gỉ xanh loang, mắt ngọc đỏ, bờm xoắn như đao mái đình cong; vẫn 4 chân | bờm xoắn lửa · dáng 4 chân · chuông vàng cổ đỏ | PROMPT-GEN-LAI.txt:148 · PROMPT-DUNG-XUONG.txt:600 · js/data.js:483 |
| `tuong/caong` | Thần Cá Ông **[linh thú]** | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | LINH THÚ — Cá voi thần (Cá Ông): thân cá voi tròn mập dựng trên đuôi, vây làm tay, mặt ông lão hiền râu ngắn — KHÔNG người · xanh đá phiến #3D5A80, bụng kem trắng, vỏ hà vàng, viền tím-bạc · cầm: không vũ khí — húc thân · vòi phun nước nhỏ trên đầu, vây đuôi cong sau lưng · hành Thủy — ⚠ GEN-LAI: cá voi (ảnh cũ người cầm giáo) | giữ nhận diện — phá cách tạo hình: hồn Cá Ông bán trong suốt, thấy bộ xương cá voi trắng ngà bên trong (như xương thờ ở lăng Ông); vẫn dáng cá voi | dáng cá voi tròn · vòi nước trên đầu · xanh đá + bụng kem | PROMPT-GEN-LAI.txt:244 · PROMPT-DUNG-XUONG.txt:812 · js/data.js:1073 |
| `tuong/kimquy` | Thần Kim Quy **[linh thú]** | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | LINH THÚ — RÙA VÀNG thần, thân rùa thật 4 chân, đứng thấp — KHÔNG người, không đuôi rồng, không sừng · mai vòm vàng #E3B23C vảy lục giác, da xanh ngọc #5E9E7E, viền vàng mai, vương miện nhỏ · cầm: 1 VUỐT trước giơ lên phát sáng đỏ-vàng — không đinh ba, không vũ khí · đầu rùa già lông mày + chòm râu trắng · hành Kim — ⚠ GEN-LAI: rùa (ảnh cũ người đuôi rồng cầm đinh ba) | giữ nhận diện — phá cách tạo hình: mai như mặt trống đồng vàng có vòng hoa văn, rêu ngọc bám mép mai; vẫn rùa 4 chân, vuốt sáng | mai vàng vòm rộng hơn cao · râu trắng · vuốt sáng | PROMPT-GEN-LAI.txt:124 · PROMPT-DUNG-XUONG.txt:942 · js/data.js:295 |
| `tuong/kylan` | Kỳ Lân Vàng **[linh thú]** | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | LINH THÚ — Kỳ lân 4 chân dài như hươu, thân như ngựa, cổ dài — KHÔNG người · vảy lưng vàng óng #E8B84A, bụng ngà #FFF4DC, xoáy mây ngọc xanh ở chân, viền vàng · cầm: không vũ khí — sừng + móng · 1 SỪNG vàng, túm lông lửa vàng ở 4 chân, bờm trắng, đuôi xù · hành Kim — ⚠ GEN-LAI: linh thú (ảnh cũ người cầm giáo); PROMPT_GEMINI_V94 cũ "đứng thẳng" → bỏ | giữ nhận diện — phá cách tạo hình: vảy lưng như ngói ống men vàng mái đình, bờm + đuôi là mây cuộn; vẫn 4 chân, 1 sừng | 1 sừng vàng · dáng 4 chân hươu · vàng + bờm trắng | PROMPT-GEN-LAI.txt:172 · PROMPT-DUNG-XUONG.txt:984 · js/data.js:521 |
| `tuong/halong` | Rồng Mẹ Hạ Long **[linh thú]** | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | LINH THÚ — Rồng Mẹ: rồng Việt mình rắn dài uốn chữ S, chân nhỏ — KHÔNG người · xanh bọt biển #8FE3CF, trắng ngọc trai, sừng vàng, viền vàng vây, quầng nhỏ · cầm: NGỌC sáng trong 1 vuốt trước — không giáo · bờm, râu rồng, mào vây · hành Thủy — ⚠ GEN-LAI: rồng (ảnh cũ người đội mũ rồng cầm giáo) | giữ nhận diện — phá cách tạo hình: lưng mọc dãy núi đá vôi tí hon như vịnh Hạ Long, nước rỏ từ vây; vẫn thân rồng chữ S + ngọc | thân chữ S · ngọc sáng · mint + sừng vàng | PROMPT-GEN-LAI.txt:196 · PROMPT-DUNG-XUONG.txt:1110 · js/data.js:834 |
| `tuong/ongho` | Chúa Sơn Lâm **[linh thú]** | 32×32 | idle 3 · attack 4 · cast 3 · hurt 1 · die 3 · **chân dung riêng** | LINH THÚ — HỔ thật đi 4 chân, vai to, chân nặng — KHÔNG người, không quần áo · cam hổ #F08A24 vằn đen, ngực trắng, vòng cổ đồng, khăn choàng lá xanh ngọc, viền vàng · cầm: không vũ khí — vuốt + nanh · chữ 王 trên trán (GEN-LAI) · hành Mộc — ⚠ GEN-LAI: hổ (ảnh cũ người khăn vàng cầm kiếm); game `look = daggers` | giữ nhận diện — phá cách tạo hình: vằn đen vẽ như nét tranh Đông Hồ (Ông Ba Mươi), mắt lửa vàng; vẫn hổ 4 chân | vằn đen trên nền cam · dáng 4 chân · khăn lá xanh | PROMPT-GEN-LAI.txt:268 · PROMPT-DUNG-XUONG.txt:1257 · js/data.js:1171 |

## Lô 8 — quai: quái thường — thủy quân (Sơn Tinh – Thủy Tinh) + biển Đông (Lạc Long Quân)

13 hình · ưu tiên cao. Roster `thuy` (ải 1–8) và `bien` (ải 14, 17): Thủy quân Thủy Tinh · Thủy quái Biển Đông. `giaolong-hoa/-tho` là bản đổi bảng màu của `giaolong` (game chọn theo hệ).

| mã | tên | cỡ | động tác | đặc trưng (loài/dáng · màu · vật cầm · phụ kiện · hành · cơ chế) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| **ĐÃ CÓ MẪU — lô 0** `quai/tom` | Tôm Binh | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Tôm sông lính, đi bằng chân nhỏ · cam #F28A4A, mũ đồng nhỏ · cầm: GIÁO ngắn + KHIÊN đồng tròn có sao · râu tôm dài · hành Thủy | giữ: lính tôm dữ tợn, giáp vỏ | thân tôm cam cong · khiên tròn · giáo ngắn | PROMPT-GEN-LAI.txt:96 · PROMPT-DUNG-XUONG.txt:1404 · js/data.js:1860 |
| `quai/casau` | Cá Sấu | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Cá sấu THẬT, 4 chân ngắn — không rồng, không sừng/cánh · xanh lá #5E9A3A, vảy lưng sần (KHÔNG hồng) · cầm: không — mõm dẹt dài nhiều răng · vòng đồng ở đuôi · hành Kim · [hoá điên] — ⚠ GEN-LAI: cá sấu thật (ảnh cũ rồng hồng) | giữ loài — **cá sấu khúc gỗ**: lưng mọc rêu, bèo và cành mục như khúc gỗ trôi, vòng đồng đuôi | mõm dài răng · thân dẹt 4 chân · vòng đồng đuôi | PROMPT-GEN-LAI.txt:368 · PROMPT-DUNG-XUONG.txt:1420 · js/data.js:1862 |
| `quai/rua` | Rùa Giáp | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Rùa cạn THẬT, mai vòm, 4 chân như chân voi — không rồng · mai xanh đậm #6A7A4A có gai đồng + viền răng cưa · cầm: không · lông mày nghiêm, đầu rùa mỏ · hành Thổ — ⚠ GEN-LAI: rùa (ảnh cũ rồng đeo mai) | **rùa đá đội bia** — rùa đá xanh rêu như rùa đội bia ở Văn Miếu, mai là tấm bia đá nứt, chân cột | mai vòm gai đồng · 4 chân cột · đầu mỏ | PROMPT-GEN-LAI.txt:387 · PROMPT-DUNG-XUONG.txt:1436 · js/data.js:1865 |
| `quai/phuthuy` | Sứa Tinh | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Sứa tinh: đầu chuông tròn trong suốt, xúc tu thay chân — không rồng, không người · xanh mòng két trong #3A8A9A, 2 mắt xanh phát sáng, miệng cau, rong xanh quấn · cầm: 1 xúc tu cầm CÀNH SAN HÔ đỏ · rong biển quấn xúc tu · hành Thủy · [bắn xa, hồi máu] — ⚠ GEN-LAI: sứa + san hô (ảnh cũ rồng con); mã `phuthuy` (tên cũ Phù Thuỷ) | **ma da** — hồn đuối nước trong suốt như sứa, tóc rong dài rủ thay xúc tu, mắt xanh phát sáng; vẫn cầm cành san hô đỏ (bắn xa, hồi máu) | chuông sứa trong · xúc tu + rong · san hô đỏ | PROMPT-GEN-LAI.txt:406 · PROMPT-DUNG-XUONG.txt:1452 · js/data.js:1868 |
| `quai/chimbao` | Chim Bão | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 · **bay** (walk = vỗ cánh) | Chim THẬT, 2 cánh lông xoè rộng (bay) — không rồng · lông xám xanh #8A9AAA (KHÔNG hồng), mắt giận · cầm: không — mỏ nhọn, vuốt chim · tia sét nhỏ ở đầu cánh, đuôi quạt · hành Mộc — ⚠ GEN-LAI: chim (ảnh cũ rồng con có cánh) | **diều sáo yêu** — con diều sáo khung tre phất giấy xám xanh hoá yêu, mắt vẽ giận, dây diều đứt phất phơ, sét ở đầu cánh (bay) | sải cánh rộng · tia sét đầu cánh · mỏ nhọn | PROMPT-GEN-LAI.txt:425 · PROMPT-DUNG-XUONG.txt:1468 · js/data.js:1872 |
| `quai/echme` | Ếch Mẹ | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Cóc/ếch mẹ mập — KHÔNG đuôi, KHÔNG mũ · xanh #7AAA3A, bụng vàng, mụn lưng · cầm: không — miệng rộng · chân sau gập (nhảy) · hành Thủy · [chết tách con] — ⚠ GEN-LAI: ếch không đuôi không mũ | giữ loài — cóc mẹ lưng mọc bèo + sen con, bọc trứng nòng nọc bám lưng lấp ló | thân tròn bè · bụng vàng · miệng rộng | PROMPT-GEN-LAI.txt:444 · PROMPT-DUNG-XUONG.txt:1484 · js/data.js:1875 |
| `quai/nongnoc` | Nòng Nọc | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Nòng nọc: cục tròn nhỏ + đuôi ngoằn ngoèo, không tay chân · ĐEN bóng (GEN-LAI "NOT green"; data `#4A5A2A` rêu tối → đen ánh rêu) · cầm: không · 1 mắt to bóng · hành Thủy · [lính con] — ⚠ size 8 trong game → vẽ nhỏ ~12px giữa khung 32×32 | giữ loài — nòng nọc như giọt mực tàu đen bóng, đuôi là nét bút lông | cục tròn đen · 1 mắt to · đuôi lượn | PROMPT-GEN-LAI.txt:463 · PROMPT-DUNG-XUONG.txt:1500 · js/data.js:1878 |
| `quai/giaolong` | Giao Long Con | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Rồng nước con (giao long) trườn · xanh lá #3A8A5A · cầm: không · sừng nhỏ, râu, vây nhỏ, đuôi cuộn · hành Thủy · [lính con] — ⚠ Thuỷ Tinh gọi ra; game có 3 màu theo hệ (giao-long_thuy/hoa/tho, render.js:439) → thêm 2 mã đổi bảng màu bên dưới | **rồng sành** — giao long con bằng sành men sống dậy, vảy là mảnh sành, vệt men chảy; bản gốc men xanh lục | thân rồng trườn · sừng + râu · vây | PROMPT-GEN-LAI.txt:97 · PROMPT-DUNG-XUONG.txt:1516 · js/data.js:1880 |
| `quai/giaolong-hoa` | Giao Long Con (Hỏa) | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Giao Long Con bản hệ Hoả (đổi bảng màu từ giaolong) · đỏ cam lửa · cầm: không · như giaolong · hành Hỏa · [lính con] — ⚠ ảnh cũ assets/giao-long_hoa.png | **rồng sành** như `giaolong` — men đỏ son | dáng giaolong · đỏ lửa | PROMPT-GEN-LAI.txt:97 · PROMPT-DUNG-XUONG.txt:1516 · js/data.js:1880 |
| `quai/giaolong-tho` | Giao Long Con (Thổ) | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Giao Long Con bản hệ Thổ (đổi bảng màu từ giaolong) · nâu vàng đất · cầm: không · như giaolong · hành Thổ · [lính con] — ⚠ ảnh cũ assets/giao-long_tho.png | **rồng sành** như `giaolong` — men nâu đất | dáng giaolong · nâu đất | PROMPT-GEN-LAI.txt:97 · PROMPT-DUNG-XUONG.txt:1516 · js/data.js:1880 |
| `quai/camap` | Cá Mập Yêu | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Cá mập THẬT thân thoi, đứng trên vây đuôi khuyết — không rồng, không tay chân · xám #6A8A9A, bụng trắng · cầm: không — miệng cười nhe răng · vây lưng to, vòng đồng ở vây · hành Thủy · [hoá điên] — ⚠ GEN-LAI: cá mập (ảnh cũ rồng con) | giữ loài — **cá mập thuyền đắm**: mảnh ván thuyền vỡ cắm trên lưng, dây neo quấn thân, vây có vòng đồng | vây lưng tam giác · răng cười · đuôi khuyết | PROMPT-GEN-LAI.txt:292 · PROMPT-DUNG-XUONG.txt:1324 · js/enemies2.js:37 |
| `quai/muc` | Mực Tinh | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Mực / bạch tuộc tinh lơ lửng · hồng #D87A9A, mắt to giận · cầm: không — 8 xúc tu xoăn · giọt mực đen bay · hành Thủy · [bắn xa] — ⚠ GEN-LAI giữ ảnh bạch tuộc | giữ loài — **mực trong chum**: mực tinh chui trong chum sành vỡ, xúc tu thò ra từ miệng chum | đầu hồng · 8 xúc tu xoăn · giọt mực | PROMPT-GEN-LAI.txt:99 · PROMPT-DUNG-XUONG.txt:1644 · js/enemies2.js:39 |
| `quai/cua` | Cua Khổng Lồ | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Cua THẬT: mai tròn rộng, HAI càng to, 8 chân khớp, mắt cuống — không đuôi · đỏ #D8603A · cầm: không — 2 càng · mũ đồng nhỏ trên mai · hành Kim — ⚠ GEN-LAI: cua 2 càng (ảnh cũ rồng 1 càng) | **cua đồng gỉ** — mai cua là chiếc chiêng đồng gỉ có núm, càng như kìm rèn đồng | 2 càng to · mai rộng · mũ đồng nhỏ | PROMPT-GEN-LAI.txt:330 · PROMPT-DUNG-XUONG.txt:1356 · js/enemies2.js:41 |

## Lô 9 — quai: quái thường — rừng/hang Chằn Tinh (Thạch Sanh) + quỷ binh giặc Ân / Triệu Đà

10 hình · ưu tiên cao. Roster `rung`, `hang` (ải 9–11, 15), `an` (ải 12–13), `trieu` (ải 16–17). `cao` là lính con Hồ Tinh / Hồ Ly Bóng Đêm.

| mã | tên | cỡ | động tác | đặc trưng (loài/dáng · màu · vật cầm · phụ kiện · hành · cơ chế) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `quai/yeutinh` | Yêu Tinh Rừng | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Yêu tinh rừng nhỏ · da xanh lá #6E9E3E, khố lá · cầm: CHÙY GỖ (DUNG-XUONG/CSV) · tai nhọn · hành Mộc — ⚠ GEN-LAI giữ ảnh "tay không" — thêm chùy gỗ theo DUNG-XUONG | **ma cây con** — gốc cây con biết đi, tóc là lá non, mắt là hốc nhựa xanh; chùy là khúc gỗ | tai nhọn · khố lá · chùy gỗ | PROMPT-GEN-LAI.txt:98 · PROMPT-DUNG-XUONG.txt:1532 · js/enemies2.js:15 |
| `quai/ran` | Rắn Độc | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Rắn THẬT không tay chân, uốn chữ S — không rồng, không bờm/râu · xanh #7A9A2A, sọc bụng vàng · cầm: không — nanh nhỏ · lưỡi chẻ đỏ · hành Mộc · [hoá điên] — ⚠ GEN-LAI: rắn (ảnh cũ rồng con) | **rắn thần 3 đầu** — rắn 3 đầu cùng thân chữ S, sọc bụng vàng, lưỡi đỏ (hoá điên: 3 đầu cùng há) | chữ S · sọc vàng · lưỡi đỏ | PROMPT-GEN-LAI.txt:482 · PROMPT-DUNG-XUONG.txt:1548 · js/enemies2.js:17 |
| `quai/doi` | Dơi Hang | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 · **bay** (walk = vỗ cánh) | Dơi THẬT thân lông, 2 cánh da (bay) — không rồng, không vảy/đuôi dài · tím #5E4A70, mắt đỏ · cầm: không — nanh · tai nhọn to, mũi tẹt · hành Thủy — ⚠ GEN-LAI: dơi (ảnh cũ rồng cánh dơi) | **dơi xương** — khung cánh xương mỏng căng màng da rách, sọ dơi tai to, mắt đỏ (bay) | tai to · cánh da xoè · mắt đỏ | PROMPT-GEN-LAI.txt:501 · PROMPT-DUNG-XUONG.txt:1564 · js/enemies2.js:19 |
| `quai/thachtinh` | Thạch Tinh | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Golem đá: khối đá nứt, tay chân khối — không người, không sừng/tóc/áo · xám #8A8270, rêu xanh · cầm: nắm đấm đá tròn to · 2 mắt vàng phát sáng · hành Thổ · [chết tách con] — ⚠ GEN-LAI: golem đá (ảnh cũ người có sừng) | **tượng đá lăng** — tượng quan võ đá ở lăng mộ cổ sống dậy, mặt khắc thô, nứt rêu, mắt vàng | khối đá vuông · mắt vàng · rêu xanh | PROMPT-GEN-LAI.txt:520 · PROMPT-DUNG-XUONG.txt:1580 · js/enemies2.js:21 |
| `quai/dacon` | Đá Con | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Sỏi đá tròn nhỏ có tay chân cụt — không rồng, không đuôi · xám #9A9280 (KHÔNG xanh) · cầm: không · mắt to dễ thương · hành Thổ · [lính con] — ⚠ GEN-LAI: đá con (ảnh cũ rồng con) | giữ — hòn cuội có nét khắc mặt như tượng đá con, chân cụt | tròn xám · mắt to · chân cụt | PROMPT-GEN-LAI.txt:539 · PROMPT-DUNG-XUONG.txt:1596 · js/enemies2.js:24 |
| `quai/linhan` | Quỷ Giáo | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Yêu tinh lính (Quỷ Giáo) — không mặt người · da xám xanh, áo da đỏ sẫm (data `#8A3A2A`), mũ da nhỏ · cầm: GIÁO ĐỒNG dài (tay trước) + KHIÊN gỗ tròn (tay sau) · tai nhọn, 2 sừng nhỏ, nanh, mắt đỏ · hành Kim — ⚠ GEN-LAI: phải có giáo (ảnh cũ tay không); mã `linhan` (tên cũ Lính Ân) | **âm binh giấy** — hình nhân giấy vàng mã lính, mặt vẽ mực có sừng + nanh, áo giấy đỏ sẫm; vẫn GIÁO + KHIÊN | giáo đồng dài · khiên tròn · sừng nhỏ + da xám xanh | PROMPT-GEN-LAI.txt:1380 · PROMPT-DUNG-XUONG.txt:1612 · js/enemies2.js:26 |
| `quai/cungan` | Sói Cung Thủ | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | SÓI XÁM đứng 2 chân, đầu sói mõm dài — không người, không rồng · xám, áo da nâu-xanh (data `#5A6A3A`), mắt vàng · cầm: CUNG gỗ, tên lắp sẵn · ống tên sau lưng, đuôi xù · hành Mộc · [bắn xa] — ⚠ GEN-LAI: sói + cung (ảnh cũ rồng/người) | **sói lá khô** — sói xám đứng 2 chân, bờm và lông lưng là lá khô + cành gai, mắt vàng; vẫn CUNG (bắn xa) | đầu sói · cung · ống tên | PROMPT-GEN-LAI.txt:558 · PROMPT-DUNG-XUONG.txt:1628 · js/enemies2.js:28 |
| `quai/kybinh` | Quỷ Lợn Rừng | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Quỷ ĐẦU LỢN RỪNG chạy 2 chân (game desc + GEN-LAI giữ) · nâu sẫm #7A5232, mắt đỏ · cầm: GIÁO đồng ngắn · nanh cong trắng, bờm dựng · hành Hỏa · [hoá điên] — ⚠ DUNG-XUONG/CSV: "Quỷ Cưỡi Lợn" (yêu tinh cưỡi lợn rừng); game + GEN-LAI: quỷ đầu lợn 2 chân → vẽ đầu lợn | **lợn đất nung** — quỷ lợn rừng bằng đất nung nâu cháy, vết nứt nung, nanh trắng; vẫn GIÁO ngắn | đầu lợn nanh cong · bờm dựng · nâu sẫm | PROMPT-GEN-LAI.txt:95 · PROMPT-DUNG-XUONG.txt:1372 · js/enemies2.js:30 |
| `quai/voichien` | Voi Chiến | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Voi chiến THẬT 4 chân to — không người, không sừng · xám #8A847E, bành chiến đỏ + vàng trên lưng · cầm: không — vòi + ngà · 2 ngà bọc đồng, cờ nhỏ trên bành · hành Thổ · [đập choáng] — ⚠ GEN-LAI: voi (ảnh cũ người có sừng); size 24 → vẽ đầy khung | **voi gỗ đình** — voi chiến gỗ sơn son thếp vàng như voi gỗ rước kiệu ở đình, khớp chân chốt gỗ, sơn tróc; ngà bọc đồng, bành đỏ vàng | vòi + ngà đồng · bành đỏ vàng · 4 chân to | PROMPT-GEN-LAI.txt:349 · PROMPT-DUNG-XUONG.txt:1388 · js/enemies2.js:32 |
| `quai/cao` | Cáo Con | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Cáo THẬT đứng 2 chân sau — không rồng, không hồng · cam #E8843A · cầm: không — vuốt · đuôi xù đầu trắng, tai nhọn to, chuông đồng ở cổ · hành Hỏa · [lính con] — ⚠ GEN-LAI: cáo (ảnh cũ rồng con hồng); Hồ Tinh / Hồ Ly hoá ra | **cáo ma trơi** — cáo con đứng 2 chân, đuôi là ngọn lửa ma trơi, chuông đồng cổ | đuôi xù đầu trắng · tai nhọn · cam | PROMPT-GEN-LAI.txt:311 · PROMPT-DUNG-XUONG.txt:1340 · js/enemies2.js:43 |

## Lô 10 — quai: quái biến thể + tinh anh lớn (tướng địch)

11 hình · ưu tiên cao. Biến thể = cùng dáng quái gốc, đổi bảng màu + chi tiết hiệu ứng (`ENEMIES[x].fx`, tools/make-variants.py). Session vẽ nên dùng `use @<gốc>` / đổi màu thay vì vẽ lại từ đầu, nên làm SAU lô quái gốc. Tinh anh lớn (`general: true`, size 24–26) to hơn quái thường: vẽ đầy khung 32×32. Hiệu ứng tinh anh ngẫu nhiên (ELITE_MODS: Vỏ Cứng, Nước Thánh, Sóng Cuốn, Màng Nước) là hào quang phủ lên — ở lô `vfx`.

| mã | tên | cỡ | động tác | đặc trưng (loài/dáng · màu · vật cầm · phụ kiện · hành · cơ chế) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `quai/tomlua` | Tôm Lửa | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Tôm Binh tắm dung nham (dáng `tom`) · đỏ lửa #E2483A · cầm: giáo ngắn + khiên · lửa nhỏ quanh mình (burnAura) · hành Hỏa · [đốt quanh] — ⚠ gốc `tom` (make-variants.py:12) | theo `tom` — vỏ tôm nứt lộ dung nham, khói bốc từ khe giáp | dáng Tôm Binh · đỏ lửa · lửa trên lưng | js/enemies2.js:84 · tools/make-variants.py:12 |
| `quai/ranbang` | Rắn Băng | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Rắn hang băng (dáng `ran`) · xanh băng #9EDDF2 · cầm: không · vảy băng, hơi lạnh · hành Thủy · [hoá điên] — ⚠ gốc `ran` (make-variants.py:13) | theo `ran` (3 đầu) — vảy băng trong, hơi lạnh từ 3 miệng | chữ S · xanh băng · vảy tinh thể | js/enemies2.js:86 · tools/make-variants.py:13 |
| `quai/doima` | Dơi Ma | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 · **bay** (walk = vỗ cánh) | Hồn dơi ma (dáng `doi`), bay · tím nhạt #C8B8FF, bán trong suốt · cầm: không · viền sáng như sương · hành Thủy — ⚠ gốc `doi` (make-variants.py:14) | theo `doi` (dơi xương) — xương mờ tím nhạt như hồn, màng cánh như sương | dáng dơi · tím nhạt · mờ như ma | js/enemies2.js:88 · tools/make-variants.py:14 |
| `quai/thachvang` | Thạch Tinh Vàng | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Thạch Tinh lẫn quặng vàng (dáng `thachtinh`) · vàng quặng #E8C050 · cầm: nắm đấm đá · vân vàng lấp lánh · hành Kim · [chết tách con] — ⚠ gốc `thachtinh` (make-variants.py:15); size 20 | theo `thachtinh` (tượng đá lăng) — vân quặng vàng chạy trong vết nứt | khối đá · vàng óng · mắt sáng | js/enemies2.js:90 · tools/make-variants.py:15 |
| `quai/thietky` | Lợn Giáp Sắt | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Lợn giáp sắt (dáng `kybinh`) · xám thép #8A96A8, giáp sắt từ đầu tới móng · cầm: giáo ngắn · mũ/giáp sắt · hành Kim · [hoá điên] — ⚠ game desc "yêu tinh cưỡi lợn rừng ma" nhưng ảnh gốc là `kybinh` (đầu lợn 2 chân) → theo dáng kybinh | theo `kybinh` (lợn đất nung) — bọc giáp sắt xám thép vá chằng | đầu lợn · giáp sắt xám · nanh | js/enemies2.js:92 · tools/make-variants.py:16 |
| `quai/camapden` | Cá Mập Bóng Đêm | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Cá mập bóng đêm (dáng `camap`) · tím đen #6A4A9A, mắt sáng · cầm: không · vệt bóng tối · hành Thủy · [hoá điên] — ⚠ gốc `camap` (make-variants.py:17) | theo `camap` (ván thuyền đắm) — thân tím đen, ván mục phủ bóng tối | dáng cá mập · tím đen · mắt sáng | js/enemies2.js:94 · tools/make-variants.py:17 |
| `quai/mucdoc` | Mực Độc | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Mực tinh nhiễm độc (dáng `muc`) · xanh lá độc #5FD06A · cầm: không · giọt mực xanh, hơi độc · hành Mộc · [bắn xa, hồi máu] — ⚠ gốc `muc` (make-variants.py:18) | theo `muc` (mực trong chum) — chum rêu xanh độc, hơi độc rỉ từ vết nứt chum | dáng mực · xanh độc · giọt xanh | js/enemies2.js:96 · tools/make-variants.py:18 |
| `quai/cungtlua` | Sói Cung Lửa | 32×32 | walk 4 · attack 3 · hurt 1 · die 3 | Sói cung lông đỏ (dáng `cungan`) · đỏ #E2483A · cầm: cung, đầu tên tẩm dầu cháy · ống tên · hành Hỏa · [bắn xa] — ⚠ gốc `cungan` (make-variants.py:19) | theo `cungan` (sói lá khô) — lá khô đang cháy đỏ, đầu tên lửa | đầu sói · lông đỏ · tên lửa | js/enemies2.js:98 · tools/make-variants.py:19 |
| `quai/tuongthuy` | Tướng Thủy Quân | 32×32 (vẽ đầy khung) | walk 4 · attack 3 · hurt 1 · die 3 · rage 2 (có `packs/<mã>/rage.png` cũ) | Cá trê tinh phó tướng Hà Bá (dáng `haba` thu nhỏ) · xanh ngọc #3EB08A (hue −60 từ Hà Bá), áo vảy cá · cầm: ĐINH BA · râu trê dài, mũ vỏ sò · hành Thủy · [gọi lính] — ⚠ gốc `haba` (make-variants.py:20); tinh anh lớn, lọt thành mất 3 mạng | theo `haba` — cá trê tinh khoác áo tơi rong, đinh ba làm từ xương cá lớn | râu trê · đinh ba · xanh ngọc | js/enemies2.js:101 · tools/make-variants.py:20 |
| `quai/chanlua` | Chằn Lửa | 32×32 (vẽ đầy khung) | walk 4 · attack 3 · hurt 1 · die 3 · rage 2 (có `packs/<mã>/rage.png` cũ) | Anh em Chằn Tinh (dáng `chantinh`) · da đỏ than hồng #C8402A · cầm: CHÙY ĐÁ · lửa quanh mình (burnAura) · hành Hỏa · [đập choáng, đốt quanh] — ⚠ gốc `chantinh` (make-variants.py:21); size 26 | theo `chantinh` — gò đất rêu cháy thành than hồng, chùy gốc cây hoá đá nứt lửa | dáng chằn to · da đỏ · chùy đá | js/enemies2.js:103 · tools/make-variants.py:21 |
| `quai/hoden` | Hồ Ly Bóng Đêm | 32×32 (vẽ đầy khung) | walk 4 · attack 3 · hurt 1 · die 3 · rage 2 (có `packs/<mã>/rage.png` cũ) | Cáo đen hầu cận Hồ Tinh (dáng `hotinh`), nhiều đuôi · tím đen #6A4A9A, lửa cáo tím · cầm: không — vuốt · nhiều đuôi xoè như Hồ Tinh · hành Hỏa · [gọi con theo máu] — ⚠ gốc `hotinh` (make-variants.py:22) | theo `hotinh` — các đuôi là lửa ma tím, mặt nạ cáo đen | đầu cáo · nhiều đuôi · tím đen | js/enemies2.js:106 · tools/make-variants.py:22 |

## Lô 11 — boss: boss (9)

9 hình · ưu tiên cao. Cỡ: 64×64 cho boss cuối chương (Thủy Tinh, Đại Bàng, Quỷ Vương Ân, Hồ Tinh, Triệu Đà) và boss thân to (Thuồng Luồng, Chằn Tinh — size 30–32); 48×48 cho Hà Bá, Ngư Tinh (size 28–30, boss giữa/cuối ải ngắn). Hoá điên chỉ hiện khi `ENEMIES[x].enrage` (game.js:2800): Thuồng Luồng, Chằn Tinh, Đại Bàng Tinh, Hồ Tinh.

| mã | tên | cỡ | động tác | đặc trưng (loài/dáng · màu · vật cầm · phụ kiện · hành · cơ chế) | Hướng phá cách | dấu hiệu 32px | nguồn |
|---|---|---|---|---|---|---|---|
| `boss/thuongluong` | Thuồng Luồng · boss cuối ải 1 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · **rage 2** (hoá điên dưới 50% máu) | THUỒNG LUỒNG = rắn nước khổng lồ, thân vảy dài uốn S, đầu rắn dẹt có vây — KHÔNG tay chân, không người, không vũ khí · xanh lá sẫm #3A7A4A, vảy bụng đồng · cầm: không — quẫy đuôi · sừng nhỏ + râu (DUNG-XUONG; GEN-LAI không cấm) · hành Thủy · [hoá điên, gọi lính, đập choáng] — ⚠ GEN-LAI: rắn nước (ảnh cũ người sừng đuôi rồng cầm giáo rìu) | giữ nhận diện — phá cách tạo hình: thân quấn rong rêu và đoạn xích đồng đứt, vảy ánh rêu, nước tuôn từ hàm; vẫn rắn nước không tay chân | thân S khổng lồ · đầu dẹt có vây · bụng vảy đồng | PROMPT-GEN-LAI.txt:596 · PROMPT-DUNG-XUONG.txt:1728 · js/data.js:1884 |
| `boss/haba` | Hà Bá · boss cuối ải 2, 3 | **48×48** | walk 4 · attack 3 · hurt 1 · die 3 · rage: không bắt buộc (không có `enrage`; có rage.png cũ) | Cá trê tinh già đứng trên đuôi cá — không người · da xanh đen nhăn #2A6A7A, áo vảy cá · cầm: ĐINH BA · râu dài rủ như râu cằm, mũ/vương miện san hô + vỏ sò · hành Thủy · [gọi lính, hồi sinh 1 lần] — ⚠ GEN-LAI giữ ("đinh ba / giáo hợp"); hồi sinh 1 lần (lặn xuống) → khung die dùng lại khi lặn | giữ nhận diện — phá cách tạo hình: cá trê già khoác áo tơi rong rêu, vương miện san hô mục, đinh ba làm từ xương cá lớn | râu trê dài · đinh ba · mũ vỏ sò | PROMPT-GEN-LAI.txt:101 · PROMPT-DUNG-XUONG.txt:1696 · js/data.js:1891 |
| `boss/thuytinh` | Thủy Tinh · boss cuối ải 4, 5, 6, 7, 8 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · rage: không bắt buộc (không có `enrage`; có rage.png cũ) | Vua thuỷ quái đầu rồng biển (sừng, râu, nanh), thân vảy bạc-xanh — không mặt người · xanh lam #3A6AB0 + bạc, giáp bạc-xanh, áo choàng vảy cá · cầm: ĐINH BA · vương miện sóng, vây lưng · hành Thủy · [đốt quanh, gọi con theo máu] — ⚠ GEN-LAI giữ ("đinh ba / giáo hợp") | giữ nhận diện — phá cách tạo hình: thân dưới là cột sóng thay chân, áo choàng là nước chảy, vương miện sóng bọt trắng; vẫn ĐINH BA | đầu rồng có sừng · vương miện sóng · đinh ba | PROMPT-GEN-LAI.txt:103 · PROMPT-DUNG-XUONG.txt:1744 · js/data.js:1898 |
| `boss/chantinh` | Chằn Tinh · boss cuối ải 9, 10 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · **rage 2** (hoá điên dưới 40% máu) | Chằn tinh = quỷ khổng lồ (ogre) bụng phệ — không rồng, không cánh/đuôi · da xanh lá #6A8A42, khố · cầm: CHÙY ĐÁ to vung như rìu — không giáo · nanh, 1 sừng ngắn · hành Mộc · [hoá điên, gọi lính, đập choáng] — ⚠ GEN-LAI: ogre + chùy đá (ảnh cũ người-rồng cầm giáo) | giữ nhận diện — phá cách tạo hình: thân như gò đất rêu có cây con mọc trên lưng, chùy là gốc cây hoá đá; vẫn ogre bụng phệ | bụng phệ xanh · chùy đá · nanh + 1 sừng | PROMPT-GEN-LAI.txt:577 · PROMPT-DUNG-XUONG.txt:1680 · js/enemies2.js:45 |
| `boss/daibang` | Đại Bàng Tinh · boss cuối ải 11 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · **rage 2** (hoá điên dưới 50% máu) · **bay** (walk = vỗ cánh) | ĐẠI BÀNG khổng lồ (bay) — không người, không rồng · lông nâu vàng #6A4A2A, mắt đỏ dữ · cầm: không — vuốt to · mỏ quặp, cánh lông xoè lớn · hành Kim · [hoá điên, gọi lính] — ⚠ GEN-LAI: đại bàng (ảnh cũ người-rồng có cánh cầm giáo) | giữ nhận diện — phá cách tạo hình: lông cánh như lưỡi dao đồng xếp lớp, mắt đỏ, mây giông dưới cánh; vẫn đại bàng | sải cánh lớn · mỏ quặp · vuốt to | PROMPT-GEN-LAI.txt:615 · PROMPT-DUNG-XUONG.txt:1776 · js/enemies2.js:51 |
| `boss/anvuong` | Quỷ Vương Ân · boss cuối ải 12, 13 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · rage: không bắt buộc (không có `enrage`; có rage.png cũ) | Quỷ vương da xanh đen CƯỠI QUỶ MÃ — không mặt người · giáp đen viền vàng (data `#2A2A2A`), quỷ mã đen bờm lửa đỏ · cầm: KÍCH to · sừng trâu cong to, nanh, mắt vàng, trống trận trên yên · hành Kim · [gọi lính, đốt quanh] — ⚠ GEN-LAI giữ (kích) | giữ nhận diện — phá cách tạo hình: trong bộ giáp đen là khói đen (chỉ thấy mắt vàng + sừng trâu), quỷ mã là ngựa xương bờm lửa đỏ; vẫn KÍCH + trống trận | sừng trâu · quỷ mã bờm lửa · kích | PROMPT-GEN-LAI.txt:100 · PROMPT-DUNG-XUONG.txt:1664 · js/enemies2.js:57 |
| `boss/ngutinh` | Ngư Tinh · boss cuối ải 14 | **48×48** | walk 4 · attack 3 · hurt 1 · die 3 · rage: không bắt buộc (không có `enrage`; có rage.png cũ) | Cá quỷ biển Đông trồi lên từ sóng · xanh lam-lục #3A7A8A · cầm: ĐINH BA (GEN-LAI giữ ảnh "ngư tinh cầm đinh ba") · nhiều răng nhọn, gai vây, miệng to (nuốt thuyền) · hành Thủy · [chết tách con, gọi lính, hồi sinh 1 lần] — ⚠ DUNG-XUONG không nêu vật cầm; GEN-LAI giữ đinh ba | giữ nhận diện — phá cách tạo hình: thân to như xác thuyền mục, rong + hà bám hàm, răng như cọc tre; vẫn ĐINH BA | miệng to răng nhọn · gai vây · đinh ba | PROMPT-GEN-LAI.txt:102 · PROMPT-DUNG-XUONG.txt:1712 · js/enemies2.js:63 |
| `boss/hotinh` | Hồ Tinh Chín Đuôi · boss cuối ải 15 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · **rage 2** (hoá điên dưới 30% máu) | CÁO TRẮNG đứng 2 chân, đầu cáo mõm nhọn tai cao, đúng 9 ĐUÔI — không rồng, không sừng, không thêm tay · trắng #F2F6FA, mắt đỏ ranh mãnh, lửa cáo tím · cầm: không — 1 tay vuốt giơ lên · 9 đuôi xù xoè sau lưng · hành Hỏa · [hoá điên, đốt quanh, gọi con theo máu] — ⚠ GEN-LAI: hồ ly 9 đuôi (ảnh cũ rồng nhiều tay cầm giáo) | giữ nhận diện — phá cách tạo hình: 9 đuôi là 9 ngọn lửa ma tím đầu trắng, mặt như mặt nạ cáo sơn trắng; vẫn cáo trắng 2 chân | 9 đuôi trắng xoè · tai cáo cao · lửa tím | PROMPT-GEN-LAI.txt:634 · PROMPT-DUNG-XUONG.txt:1792 · js/enemies2.js:69 |
| `boss/trieuda` | Hổ Vương Triệu Đà · boss cuối ải 16, 17 | **64×64** | walk 4 · attack 3 · hurt 1 · die 3 · rage: không bắt buộc (không có `enrage`; có rage.png cũ) | Tướng quỷ ĐẦU HỔ — không mặt người · đầu hổ cam vằn lửa đen-đỏ, giáp đỏ-đen (data `#2A3A5A` xanh đen) · cầm: KÍCH to, đánh BỔ từ trên xuống (game: js/tu-cu-dong.js:38 `trieuda: 'kich'` → kiểu `chop`; js/rigs.js:60 `kind: 'chop'`, ảnh kích) · nanh dài, mắt sáng, tay vuốt, đuôi hổ · hành Kim · [gọi lính, gọi con theo máu, tráo vũ khí tướng] — ⚠ DUNG-XUONG: đao cong; GEN-LAI + game: kích → **chốt KÍCH** (quyết định điều phối) | giữ nhận diện — phá cách tạo hình: đầu hổ vằn lửa đen-đỏ, giáp xanh đen (data #2A3A5A) viền đỏ, khói lửa từ vai; vẫn KÍCH bổ từ trên xuống | đầu hổ vằn lửa · giáp đỏ đen · kích | PROMPT-GEN-LAI.txt:104 · PROMPT-DUNG-XUONG.txt:1760 · js/enemies2.js:75 |

## Lô 12 — nen: ô nền theo chủ đề bản đồ + đường quái đi + mép

18 hình · ưu tiên cao. Mỗi chủ đề bản đồ (MAP_THEMES, 7 chủ đề, 14 bản đồ) cần: 1 ô nền + 1 loại đường (PATH_KIND: song/dam → nuoc, rung → dat, hang → da, dong → de, bien → cat, thanh → gach) + dải phía trên. Ô 16×16 phải lát liền (tileable) cả 4 cạnh. Nền bản đồ ghép từ các ô này thay cho maps/nen-*.jpg.

| mã | tên | cỡ | khung | mô tả (màu theo code) | dấu hiệu khi lát | nguồn |
|---|---|---|---|---|---|---|
| **ĐÃ CÓ MẪU — lô 0** `nen/co` | cỏ sông (chủ đề song) | 16×16 | 1 | đất #3A5A28, cỏ #4E7434, chấm #2C4620 | lát liền không lộ mối | js/data.js:1958 |
| **ĐÃ CÓ MẪU — lô 0** `nen/dat` | đường đất (rừng) | 16×16 | 1 | đường đất nâu (PATH_LOOK.dat base #80623E, mép #4A3826) | vệt bánh xe/đá nhỏ | js/maps.js:137 |
| **ĐÃ CÓ MẪU — lô 0** `nen/nuoc` | nước sông (đường quái chủ đề song/dam) | 16×16 | 2–4 (gợn) | nước #2C6F8E, gợn sáng | gợn nước chạy | js/maps.js:136 |
| `nen/co-dam` | cỏ đầm lầy (dam) | 16×16 | 1 | đất #3E5530, cỏ #56703A, chấm #2E3E22 | cỏ lác thưa, vũng tối | js/data.js:1959 |
| `nen/co-rung` | nền rừng (rung) | 16×16 | 1 | đất #2E4A22, cỏ #3E6A2E, chấm #203818 | lá rụng, tối hơn cỏ sông | js/data.js:1960 |
| `nen/nen-hang` | nền hang đá (hang) | 16×16 | 1 | đá #4A4236, #5A5040, chấm #2E2820 | đá vụn, khe nứt | js/data.js:1961 |
| `nen/co-dong` | nền đồng lúa (dong) | 16×16 | 1 | đất #5E7A30, cỏ #7A9A3E, chấm #4A6224 | mạ non sáng, luống | js/data.js:1962 |
| `nen/cat-bien` | bãi cát biển (bien) | 16×16 | 1 | cát #D8C890, #E8DCA8, chấm #B8A870 | cát vàng nhạt, vỏ ốc li ti | js/data.js:1963 |
| `nen/co-thanh` | cỏ quanh thành (thanh) | 16×16 | 1 | đất #4A5A2E, cỏ #5E7038, chấm #36441E | cỏ đậm, sỏi | js/data.js:1964 |
| `nen/da` | đường đá (hang) | 16×16 | 1 | đá #5A5348, mép #2E2922, viền bó #4E473C | phiến đá ghép | js/maps.js:138 · tiles/duong-da.jpg |
| `nen/de` | đường bờ ruộng / đê (dong) | 16×16 | 1 | đất nện #A58656, mép cỏ #5E7A2E | đất nện + mép cỏ | js/maps.js:139 · tiles/duong-de.jpg |
| `nen/cat` | đường cát (bien) | 16×16 | 1 | cát #9C7C4C, mép #F2E6C0 | vệt sóng cát | js/maps.js:140 · tiles/duong-cat.jpg |
| `nen/gach` | đường gạch thành (thanh) | 16×16 | 1 | gạch #9C8668, mép #5A4A36, viền #6E5E48 | gạch đỏ nâu so le | js/maps.js:141 · tiles/duong-gach.jpg |
| `nen/nuoc-bien` | nước biển (bien — `sea: true`) | 16×16 | 2–4 | xanh biển #2C7AA0 + bọt #E8F6FF | bọt sóng trắng | js/data.js:1963 · js/maps.js:61 |
| `nen/bo-song` | bờ đất ven nước (mép đường nước) | 16×16 | 1 | bờ theo chủ đề: song #8A7650, dam #6E6040, bien #C8B47A, thanh #7E6A48 (đổi bảng màu) | mép đất + cỏ lác | js/data.js:1958 · js/maps.js:136 (rim) |
| `nen/dai-nui` | dải núi phía trên bản đồ (song/dam/rung/dong/thanh) | 32×32 | 1 (lát ngang) | núi nâu #6A5A42 + đỉnh #7A6748, viền #2A2116 | đỉnh núi lát ngang | js/maps.js:67 |
| `nen/dai-hang` | vách hang phía trên (hang) | 32×32 | 1 (lát ngang) | vách #2A241C + nhũ đá #3A3228 | nhũ đá rủ | js/maps.js:55 |
| `nen/dai-bien` | dải biển phía trên (bien) | 32×32 | 1–2 (lát ngang) | biển #2C7AA0, bọt #E8F6FF, sóng #BFE8F5 | đường bọt đứt | js/maps.js:61 |

## Lô 13 — nen: vật trang trí bản đồ (DECO) + cột mốc cửa vào

16 hình · ưu tiên vừa.

| mã | tên | cỡ | khung | mô tả (màu theo code) | dấu hiệu khi lát | nguồn |
|---|---|---|---|---|---|---|
| `nen/tree` | trang trí: tree | 32×32 | 1 | cây tán tròn xanh tối #1E3418/#2D4E22 | chủ đề: song, dam, rung, dong, thanh | js/maps.js:17 |
| `nen/bush` | trang trí: bush | 16×16 | 1 | bụi cây xanh #2D4E22 | chủ đề: rung | js/maps.js:18 |
| `nen/rock` | trang trí: rock | 16×16 | 1 | tảng đá xám #77705F | chủ đề: song, dam, rung, hang, bien, thanh | js/maps.js:19 |
| `nen/reed` | trang trí: reed | 16×16 | 1 | khóm lau sậy #6E8A3A | chủ đề: song, dam | js/maps.js:20 |
| `nen/lotus` | trang trí: lotus | 16×16 | 1 | lá sen + hoa sen hồng #F2A0C4 | chủ đề: dam | js/maps.js:21 |
| `nen/hut` | trang trí: hut | 32×32 | 1 | nhà sàn mái tranh #8A6A42 | chủ đề: song, thanh | js/maps.js:22 |
| `nen/rice` | trang trí: rice | 16×16 | 1 | ô ruộng lúa #6A8A2E | chủ đề: dong | js/maps.js:23 |
| `nen/buffalo` | trang trí: buffalo | 32×32 | 1 | con trâu xám #4A4038 | chủ đề: dong | js/maps.js:24 |
| `nen/palm` | trang trí: palm | 32×32 | 1 | cây dừa thân #7A5A30 | chủ đề: bien | js/maps.js:25 |
| `nen/shell` | trang trí: shell | 16×16 | 1 | vỏ sò #F2D8C8 | chủ đề: bien | js/maps.js:26 |
| `nen/boat` | trang trí: boat | 32×32 | 1 | thuyền nan buồm | chủ đề: bien | js/maps.js:27 |
| `nen/crystal` | trang trí: crystal | 16×16 | 1 | tinh thể xanh #7FD8F2 phát sáng | chủ đề: hang | js/maps.js:28 |
| `nen/bones` | trang trí: bones | 16×16 | 1 | xương trắng #D8D0B8 | chủ đề: hang | js/maps.js:29 |
| `nen/stalag` | trang trí: stalag | 16×16 | 1 | măng đá #5A5040 | chủ đề: hang | js/maps.js:30 |
| `nen/banner` | trang trí: banner | 32×32 | 1 | cột cờ đuôi nheo đỏ | chủ đề: thanh | js/maps.js:31 |
| `nen/cot-moc` | cột mốc đá cửa vào (2 bên đầu đường) | 16×16 | 1 | cột đá #7A7060 viền #2A1F12, vòng khắc trống đồng #C9963A, dải vải đỏ #C8401E | cột đá + vải đỏ | js/maps.js:307 (drawEntry) |

## Lô 14 — nen: cổng / thành cuối đường + đế đặt tướng

20 hình · ưu tiên cao. Đế tướng chọn theo thứ tự trong drawSpot: trạng thái (ngập/núi/chọn/sẵn sàng) → chủ đề (SPOT_THEME) → `thuong`. Cổng theo `MAP_THEMES[*].gate` (GATE_FILE, js/maps.js:326).

| mã | tên | cỡ | khung | mô tả (màu theo code) | dấu hiệu khi lát | nguồn |
|---|---|---|---|---|---|---|
| `nen/cong-phong-chau` | thành Phong Châu (castle — song, dam, bien) | 48×48 | 1 | thành gỗ-đá nâu #6E5636, mái, cờ | tường thành + cổng tối | js/maps.js:45 · tiles/cong-phong-chau.png |
| `nen/cong-ban-rung` | bản làng giữa rừng (hut — rung) | 48×48 | 1 | nhà sàn + hàng rào gỗ #5A4024 | mái tranh + rào | js/maps.js:37 · tiles/cong-ban-rung.png |
| `nen/cong-hang` | miệng hang tối (cave — hang) | 48×48 | 1 | vòm đá #3A3228, lòng đen #0A0806, răng đá | vòm đen có răng đá | js/maps.js:39 · tiles/cong-hang.png |
| `nen/cong-lang-tre` | cổng làng tre (village — dong) | 48×48 | 1 | cột tre #9A8A4A, mái cổng | 2 cột tre + mái | js/maps.js:41 · tiles/cong-lang-tre.png |
| `nen/cong-co-loa` | thành Cổ Loa xoắn ốc (citadel — thanh) | 48×48 | 1 | 3 vòng thành xoắn #7E6440 + tháp giữa | vòng thành xoắn | js/maps.js:43 · tiles/cong-co-loa.png |
| `nen/thanh-phong-chau` | thành Phong Châu lớn (chương Sơn Tinh, khi không có ảnh bản đồ) | 64×64 | 1 | thành lớn có cổng, cờ Văn Lang | tường + tháp + cờ | js/main.js:243 |
| `nen/de-tuong-thuong` | đế tướng: thuong | 32×32 | 1 | elip phẳng 3:2 nhìn 3/4 từ trên — đế thường (đá nâu xám, vân trống đồng mờ) | elip phẳng | PROMPT-THAY-HINH-CODE.txt:94 · js/render.js:578 |
| `nen/de-tuong-san-sang` | đế tướng: san-sang | 32×32 | 1 | elip phẳng 3:2 nhìn 3/4 từ trên — sẵn sàng đặt (vân đồng sáng kem) | viền sáng kem | PROMPT-THAY-HINH-CODE.txt:94 · js/render.js:578 |
| `nen/de-tuong-chon` | đế tướng: chon | 32×32 | 1 | elip phẳng 3:2 nhìn 3/4 từ trên — đang chọn (viền vàng + sao mặt trời) | viền vàng | PROMPT-THAY-HINH-CODE.txt:94 · js/render.js:578 |
| `nen/de-tuong-ngap` | đế tướng: ngap | 32×32 | 1 | elip phẳng 3:2 nhìn 3/4 từ trên — bị ngập (đá chìm nửa trong nước, bèo) | nửa chìm nước | PROMPT-THAY-HINH-CODE.txt:94 · js/render.js:578 |
| `nen/de-tuong-nui` | đế tướng: nui | 32×32 | 1 | elip phẳng 3:2 nhìn 3/4 từ trên — nâng thành núi (đá trên mô núi cỏ) | mô núi dưới đế | PROMPT-THAY-HINH-CODE.txt:94 · js/render.js:578 |
| `nen/de-tuong-co` | đế theo chủ đề: co | 32×32 | 1 | đất nện + vòng cỏ + 2 cây lau (song/dam/dong) | chất liệu theo chủ đề | PROMPT-THAY-HINH-CODE.txt:107 · js/render.js:570 |
| `nen/de-tuong-dat` | đế theo chủ đề: dat | 32×32 | 1 | thớt gốc cây có rễ + rêu (rung) | chất liệu theo chủ đề | PROMPT-THAY-HINH-CODE.txt:107 · js/render.js:570 |
| `nen/de-tuong-da` | đế theo chủ đề: da | 32×32 | 1 | phiến đá hang + 2 tinh thể xanh (hang) | chất liệu theo chủ đề | PROMPT-THAY-HINH-CODE.txt:107 · js/render.js:570 |
| `nen/de-tuong-cat` | đế theo chủ đề: cat | 32×32 | 1 | đá cát nhạt + vỏ sò (bien) | chất liệu theo chủ đề | PROMPT-THAY-HINH-CODE.txt:107 · js/render.js:570 |
| `nen/de-tuong-gach` | đế theo chủ đề: gach | 32×32 | 1 | gạch đỏ nâu + viền đồng (thanh) | chất liệu theo chủ đề | PROMPT-THAY-HINH-CODE.txt:107 · js/render.js:570 |
| `nen/o-ngap` | ô tầng ngập (dự phòng khi thiếu đế) | 16×16 | 1 | ô đất theo bậc núi Tản Viên | độ cao khác nhau | js/render.js:589 |
| `nen/o-thap` | ô tầng thấp (dự phòng khi thiếu đế) | 16×16 | 1 | ô đất theo bậc núi Tản Viên | độ cao khác nhau | js/render.js:589 |
| `nen/o-giua` | ô tầng giữa (dự phòng khi thiếu đế) | 16×16 | 1 | ô đất theo bậc núi Tản Viên | độ cao khác nhau | js/render.js:589 |
| `nen/o-cao` | ô tầng cao (núi) (dự phòng khi thiếu đế) | 16×16 | 1 | ô đất theo bậc núi Tản Viên | độ cao khác nhau | js/render.js:589 |

## Lô 15 — icon: ngũ hành (còn thiếu) + vai trò + chỉ số

25 hình · ưu tiên cao. Ngũ hành dùng cùng khung đĩa trống đồng với 3 mẫu lô 0 (`hanh-kim/moc/thuy`). Vai trò hiện trên thẻ tướng (roleIcon, js/roles.js:92).

| mã | tên | cỡ | khung | mô tả / vật vẽ | dấu hiệu nhỏ | nguồn |
|---|---|---|---|---|---|---|
| `icon/hanh-hoa` | hành Hỏa | 12×12 | 1 | đĩa trống đồng + ngọn lửa đỏ #E0452C (cùng khung với hanh-kim/moc/thuy lô 0) | ngọn lửa | js/ui.js:244 · js/data.js:1731 |
| `icon/hanh-tho` | hành Thổ | 12×12 | 1 | đĩa trống đồng + núi vàng đất #C99A3C | hình núi | js/ui.js:245 · js/data.js:1732 |
| `icon/vai-satthuong` | vai trò: Sát thương | 12×12 | 1 | Sát thương vật lý đều tay, đánh nhanh; màu #FF8A4C | kiếm chéo | js/roles.js:8 |
| `icon/vai-danhlan` | vai trò: Đánh lan | 12×12 | 1 | Chém lan / nổ vùng, dọn bầy quái đông; màu #FFC14A | tia nổ toả | js/roles.js:10 |
| `icon/vai-phapsu` | vai trò: Pháp sư | 12×12 | 1 | Sát thương phép, xuyên giáp vật lý, mạnh kỹ năng; màu #B892FF | sao 4 cánh | js/roles.js:12 |
| `icon/vai-dietboss` | vai trò: Diệt boss | 12×12 | 1 | Dồn sát thương lên một mục tiêu máu cao / boss; màu #FF5470 | tâm ngắm | js/roles.js:14 |
| `icon/vai-khongche` | vai trò: Khống chế | 12×12 | 1 | Choáng, trói, làm chậm, đẩy lùi quái; màu #5CC8FF | xích/còng | js/roles.js:16 |
| `icon/vai-hotro` | vai trò: Hỗ trợ | 12×12 | 1 | Hồi máu, khiên, tăng tốc / sát thương đồng đội; màu #6EDC8C | dấu cộng | js/roles.js:18 |
| `icon/vai-dodon` | vai trò: Đỡ đòn | 12×12 | 1 | Máu trâu, giảm sát thương nhận, che chắn; màu #D2AE72 | khiên | js/roles.js:20 |
| `icon/giap` | giáp | 12×12 | 1 | khiên đồng | khiên | docs/ICON-NHO.md:19 · js/ui.js:97 |
| `icon/khang-phep` | kháng phép | 12×12 | 1 | cầu tím trong vòng đồng | cầu tím | docs/ICON-NHO.md:20 · js/ui.js:98 |
| `icon/toc-chay` | tốc chạy | 12×12 | 1 | dép cỏ + vệt tốc độ | dép + vệt | docs/ICON-NHO.md:21 · js/ui.js:99 |
| `icon/toc-danh` | tốc đánh | 12×12 | 1 | tia sét vàng | sét vàng | docs/ICON-NHO.md:22 · js/ui.js:100 |
| `icon/sat-thuong` | sát thương | 12×12 | 1 | kiếm đồng ngắn | kiếm | docs/ICON-NHO.md:23 · js/ui.js:101 |
| `icon/mau` | máu | 12×12 | 1 | giọt máu đỏ | giọt đỏ | docs/ICON-NHO.md:24 · js/ui.js:102 |
| `icon/chi-mang` | chí mạng | 12×12 | 1 | tia nổ đỏ cam | nổ cam | docs/ICON-NHO.md:25 · js/ui.js:103 |
| `icon/tam-danh` | tầm đánh | 12×12 | 1 | bia tròn + mũi tên | bia | docs/ICON-NHO.md:26 · js/ui.js:104 |
| `icon/hoi-chieu` | hồi chiêu | 12×12 | 1 | đồng hồ cát | đồng hồ cát | docs/ICON-NHO.md:27 · js/ui.js:105 |
| `icon/nang-luong` | năng lượng | 12×12 | 1 | giọt nước xanh lam | giọt lam | docs/ICON-NHO.md:28 · js/ui.js:106 |
| `icon/suc-manh` | Sức mạnh | 12×12 | 1 | nắm đấm cam | nắm đấm | docs/ICON-NHO.md:29 · js/ui.js:107 |
| `icon/nhanh-nhen` | Nhanh nhẹn | 12×12 | 1 | lông chim Lạc xanh | lông chim | docs/ICON-NHO.md:30 · js/ui.js:108 |
| `icon/tri-tue` | Trí tuệ | 12×12 | 1 | sách tre mở | thẻ tre | docs/ICON-NHO.md:31 · js/ui.js:109 |
| `icon/giam-sat-thuong` | giảm sát thương | 12×12 | 1 | khiên + mũi tên xuống | khiên ↓ | docs/ICON-NHO.md:32 · js/ui.js:110 |
| `icon/xuyen-giap` | xuyên giáp | 12×12 | 1 | mũi giáo phá khiên | giáo + khiên vỡ | docs/ICON-NHO.md:33 · js/ui.js:111 |
| `icon/xuyen-phep` | xuyên phép | 12×12 | 1 | mũi giáo tím | giáo tím | docs/ICON-NHO.md:57 · js/ui.js:112 |

## Lô 16 — icon: trạng thái + nhãn quái + tinh anh

18 hình · ưu tiên cao.

| mã | tên | cỡ | khung | mô tả / vật vẽ | dấu hiệu nhỏ | nguồn |
|---|---|---|---|---|---|---|
| `icon/cham` | chậm | 12×12 | 1 | ốc sên nâu | ốc sên | docs/ICON-NHO.md:34 · js/ui.js:113 |
| `icon/choang` | choáng | 12×12 | 1 | vòng sao vàng | 3 sao | docs/ICON-NHO.md:35 · js/ui.js:114 |
| `icon/dot` | thiêu đốt | 12×12 | 1 | ngọn lửa cam đỏ | lửa | docs/ICON-NHO.md:36 · js/ui.js:115 |
| `icon/doc` | độc | 12×12 | 1 | giọt độc xanh + đầu lâu nhỏ | giọt xanh | docs/ICON-NHO.md:37 · js/ui.js:116 |
| `icon/dong-bang` | đóng băng | 12×12 | 1 | bông tuyết băng | bông tuyết | docs/ICON-NHO.md:38 · js/ui.js:117 |
| `icon/sa-lay` | sa lầy | 12×12 | 1 | vũng bùn | vũng nâu | docs/ICON-NHO.md:39 · js/ui.js:118 |
| `icon/khien` | khiên | 12×12 | 1 | bong bóng xanh | bong bóng | docs/ICON-NHO.md:40 · js/ui.js:119 |
| `icon/hoi-mau` | hồi máu | 12×12 | 1 | dấu cộng xanh | dấu + | docs/ICON-NHO.md:41 · js/ui.js:120 |
| `icon/noi-gian` | hoá điên | 12×12 | 1 | dấu gân giận đỏ | gân đỏ | docs/ICON-NHO.md:42 · js/ui.js:121 |
| `icon/bay` | bay | 12×12 | 1 | cánh trắng | cánh | docs/ICON-NHO.md:43 · js/ui.js:122 |
| `icon/boss` | boss / tướng địch | 12×12 | 1 | vương miện quỷ đỏ 2 sừng | vương miện sừng | docs/ICON-NHO.md:44 · js/ui.js:123 |
| `icon/cam-lang` | câm lặng | 12×12 | 1 | bóng thoại gạch chéo | bóng thoại ✕ | docs/ICON-NHO.md:45 · js/ui.js:124 |
| `icon/tinh-anh` | tinh anh | 12×12 | 1 | ngọc tím nhiều mặt | ngọc tím | docs/ICON-NHO.md:46 · js/ui.js:125 |
| `icon/lan` | đang lặn | 12×12 | 1 | 2 vạch sóng + bọt | sóng | docs/ICON-NHO.md:47 · js/ui.js:126 |
| `icon/tinh-anh-armored` | tinh anh: Vỏ Cứng | 12×12 | 1 | +10 giáp; màu #C8BFA8 | vỏ giáp | js/data.js:1914 |
| `icon/tinh-anh-regen` | tinh anh: Nước Thánh | 12×12 | 1 | Hồi 3% máu mỗi giây; màu #3EDC4E | giọt nước thánh | js/data.js:1915 |
| `icon/tinh-anh-swift` | tinh anh: Sóng Cuốn | 12×12 | 1 | Chạy nhanh hơn 40%; màu #9EDDF2 | sóng cuốn | js/data.js:1916 |
| `icon/tinh-anh-shield` | tinh anh: Màng Nước | 12×12 | 1 | Khiên chặn sát thương bằng 40% máu; màu #5AB4D6 | màng nước tròn | js/data.js:1917 |

## Lô 17 — icon: tiền tệ + biểu tượng khác + icon vẽ tay ui_*

25 hình · ưu tiên cao.

| mã | tên | cỡ | khung | mô tả / vật vẽ | dấu hiệu nhỏ | nguồn |
|---|---|---|---|---|---|---|
| `icon/vang` | vàng | 16×16 | 1 | đồng xu đồng lỗ vuông (ui-tai-nguyen-1 / ui_dong-xu) | xu lỗ vuông | docs/ICON-NHO.md:59 · js/ui.js:127 |
| `icon/mang` | mạng thành | 16×16 | 1 | tim đỏ viền đồng (ui-tai-nguyen-2; KHÔNG giống đồng xu — BAO-CAO-TEST L17) | tim đỏ | docs/ICON-NHO.md:60 · js/ui.js:128 |
| `icon/bac` | bạc Ngân khố | 16×16 | 1 | thỏi bạc hình thuyền (ui-tai-nguyen-3) | thỏi bạc | docs/ICON-NHO.md:61 · js/ui.js:129 |
| `icon/tu-vi` | Tu Vi | 16×16 | 1 | đĩa âm dương trong vòng đồng (ui-tai-nguyen-4) | âm dương | docs/ICON-NHO.md:62 · js/ui.js:130 |
| `icon/tui-vang` | túi vàng | 12×12 | 1 | túi vải + đồng vàng | túi | docs/ICON-NHO.md:48 · js/ui.js:131 |
| `icon/diem-ky-nang` | điểm kỹ năng | 12×12 | 1 | sao vàng trên đĩa đồng | sao | docs/ICON-NHO.md:49 · js/ui.js:132 |
| `icon/diem-an-phu` | điểm Ấn Phù | 12×12 | 1 | ấn đá có mặt trời | ấn đá | docs/ICON-NHO.md:50 · js/ui.js:133 |
| `icon/luc-chien` | lực chiến | 12×12 | 1 | hai kiếm đồng bắt chéo | kiếm chéo | docs/ICON-NHO.md:51 · js/ui.js:134 |
| `icon/cap-do` | cấp độ | 12×12 | 1 | hai mũi tên lên xanh | ⇈ | docs/ICON-NHO.md:52 · js/ui.js:135 |
| `icon/kho` | Khó | 12×12 | 1 | đầu lâu mắt đỏ | đầu lâu | docs/ICON-NHO.md:53 · js/ui.js:136 |
| `icon/nuoc-dang` | nước dâng | 12×12 | 1 | sóng + mũi tên lên (ui_muc-nuoc) | sóng ↑ | docs/ICON-NHO.md:54 · js/ui.js:137 |
| `icon/khac-che` | khắc chế hành | 12×12 | 1 | mũi tên trúng tia sáng | mũi tên + sáng | docs/ICON-NHO.md:55 · js/ui.js:138 |
| `icon/nang-cap` | nâng cấp | 12×12 | 1 | mũi tên lên xanh (ic-nang-cap) | ↑ xanh | docs/ICON-NHO.md:56 · js/ui.js:139 |
| `icon/hu-bau` | hũ bầu | 16×16 | 1 | hũ bầu (ui_hu-bau) | hũ bầu | docs/ICON-NHO.md:63 · js/ui.js:140 |
| `icon/ui-an` | ấn (Ấn Phù) | 16×16 | 1 | con dấu đá khắc mặt trời | con dấu đá | assets/ui_an.png · js/ui.js:37 |
| `icon/ui-khoa` | ổ khoá vẽ tay | 16×16 | 1 | ổ khoá đồng | ổ khoá đồng | assets/ui_khoa.png · js/ui.js:37 |
| `icon/ui-toi-luyen` | tôi luyện | 16×16 | 1 | đe + búa | đe búa | assets/ui_toi-luyen.png · js/ui.js:37 |
| `icon/ui-dong-vang` | vàng trận (thanh trên) | 16×16 | 1 | đồng vàng lỗ vuông khắc sao | đồng vàng lỗ | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-goi-som` | gọi đợt sớm | 16×16 | 1 | tù và đồng + 2 vệt tốc | tù và đồng | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-da-kham-pha` | đã khám phá (Bách khoa) | 16×16 | 1 | sách bọc đồng mở + lấp lánh | sách bọc đồng | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-luyen-the` | luyện thể | 16×16 | 1 | tạ đá + nắm đấm | tạ đá nắm | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-tay-luyen` | tẩy luyện | 16×16 | 1 | chậu đồng + mũi tên vòng | chậu đồng mũi | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-hu-dong` | Hũ đồng | 16×16 | 1 | hũ đồng có nắp, hoa văn trống | hũ đồng có | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-hu-vua-hung` | Hũ Vua Hùng | 16×16 | 1 | hũ vàng cao + sao mặt trời + nút vải đỏ | hũ vàng cao | PROMPT-THAY-HINH-CODE.txt:1580 |
| `icon/ui-kho-lua` | kho lúa (thẻ thưởng) | 16×16 | 1 | nhà sàn kho lúa mái tranh đầy lúa vàng | nhà sàn kho | PROMPT-THAY-HINH-CODE.txt:1580 |

## Lô 18 — icon: nút trong trận (bộ ui-tran)

20 hình · ưu tiên cao. Tên mã giữ đúng tên ảnh cũ `assets/ui/<mã>.png` để nối code dễ (UIE / EMO_ART / uiImg, js/ui.js:67–77, 459–471).

| mã | tên | cỡ | khung | mô tả / vật vẽ | dấu hiệu nhỏ | nguồn |
|---|---|---|---|---|---|---|
| `icon/ui-tran-1-1` | chạy / bắt đầu | 16×16 | 1 | tam giác play khắc trên đĩa trống (phong cách mặt trống đồng, viền #2A1608) | tam giác | tools/build-prompts.js:276 · js/ui.js:72 |
| `icon/ui-tran-1-2` | tạm dừng | 16×16 | 1 | 2 vạch pause trên đĩa trống (phong cách mặt trống đồng, viền #2A1608) | 2 vạch | tools/build-prompts.js:276 · js/ui.js:72 |
| `icon/ui-tran-1-3` | tua nhanh / chế độ | 16×16 | 1 | mũi tên kép trên đĩa trống (phong cách mặt trống đồng, viền #2A1608) | mũi tên | tools/build-prompts.js:276 · js/ui.js:72 |
| `icon/ui-tran-1-4` | xem chi tiết | 16×16 | 1 | con mắt mở trên đĩa trống (phong cách mặt trống đồng, viền #2A1608) | con mắt | tools/build-prompts.js:276 · js/ui.js:72 |
| `icon/ui-tran-2-1` | menu | 16×16 | 1 | 3 thanh đồng trên đĩa (phong cách mặt trống đồng, viền #2A1608) | 3 thanh | tools/build-prompts.js:277 · js/ui.js:72 |
| `icon/ui-tran-2-2` | nâng đồ tự động | 16×16 | 1 | mũi tên lên trên đe đồng (phong cách mặt trống đồng, viền #2A1608) | mũi tên | tools/build-prompts.js:277 · js/ui.js:72 |
| `icon/ui-tran-2-3` | mặc đồ cả đội | 16×16 | 1 | khiên đồng có mặt trời nhỏ (phong cách mặt trống đồng, viền #2A1608) | khiên đồng | tools/build-prompts.js:277 · js/ui.js:72 |
| `icon/ui-tran-2-4` | huỷ tướng / bán | 16×16 | 1 | hũ đất nứt (phong cách mặt trống đồng, viền #2A1608) | hũ đất | tools/build-prompts.js:277 · js/ui.js:72 |
| `icon/ui-tran-3-1` | gọi tướng / cảm ơn | 16×16 | 1 | trống đồng + dùi (phong cách mặt trống đồng, viền #2A1608) | trống đồng | tools/build-prompts.js:278 · js/ui.js:72 |
| `icon/ui-tran-3-2` | hợp thể | 16×16 | 1 | 2 bàn tay chụm trên ngôi sao sáng (phong cách mặt trống đồng, viền #2A1608) | 2 bàn | tools/build-prompts.js:278 · js/ui.js:72 |
| `icon/ui-tran-3-3` | nâng núi | 16×16 | 1 | núi xanh mọc từ nước (phong cách mặt trống đồng, viền #2A1608) | núi xanh | tools/build-prompts.js:278 · js/ui.js:72 |
| `icon/ui-tran-3-4` | quay lại | 16×16 | 1 | mũi tên trái bằng đồng (phong cách mặt trống đồng, viền #2A1608) | mũi tên | tools/build-prompts.js:278 · js/ui.js:72 |
| `icon/ui-tran-4-1` | ghép sao | 16×16 | 1 | sao vàng có dấu + (phong cách mặt trống đồng, viền #2A1608) | sao vàng | tools/build-prompts.js:388 · js/ui.js:72 |
| `icon/ui-tran-4-2` | mặc đồ | 16×16 | 1 | áo + mũi tên lên (phong cách mặt trống đồng, viền #2A1608) | áo + | tools/build-prompts.js:388 · js/ui.js:72 |
| `icon/ui-tran-4-3` | khoá | 16×16 | 1 | ổ khoá đồng (phong cách mặt trống đồng, viền #2A1608) | ổ khoá | tools/build-prompts.js:388 · js/ui.js:72 |
| `icon/ui-tran-4-4` | đổi hàng / làm mới | 16×16 | 1 | 2 mũi tên vòng (phong cách mặt trống đồng, viền #2A1608) | 2 mũi | tools/build-prompts.js:388 · js/ui.js:72 |
| `icon/ui-tran-5-1` | mẹo | 16×16 | 1 | đèn dầu đồng sáng (phong cách mặt trống đồng, viền #2A1608) | đèn dầu | tools/build-prompts.js:389 · js/ui.js:72 |
| `icon/ui-tran-5-2` | vô tận | 16×16 | 1 | vòng vô cực bằng dây đồng (phong cách mặt trống đồng, viền #2A1608) | vòng vô | tools/build-prompts.js:389 · js/ui.js:72 |
| `icon/ui-tran-5-3` | vào trận | 16×16 | 1 | 2 kiếm đồng bắt chéo (phong cách mặt trống đồng, viền #2A1608) | 2 kiếm | tools/build-prompts.js:389 · js/ui.js:72 |
| `icon/ui-tran-5-4` | xong | 16×16 | 1 | dấu tích xanh trên đĩa đồng (phong cách mặt trống đồng, viền #2A1608) | dấu tích | tools/build-prompts.js:389 · js/ui.js:72 |

## Lô 19 — icon: nút menu + huy chương + icon SVG còn vẽ bằng code

23 hình · ưu tiên vừa. ⚠ Thứ tự tấm `ui-menu-1` trong prompt (build-prompts.js:279: ô 3 = ấn đá, ô 4 = rương) ngược với code (ui.js:467: `btn-treasury` → ui-menu-1-3, `btn-runes` → ui-menu-1-4; main.js:1839 dùng 1-3 làm rương) — bảng này đặt tên theo NGHĨA trong code.

| mã | tên | cỡ | khung | mô tả / vật vẽ | dấu hiệu nhỏ | nguồn |
|---|---|---|---|---|---|---|
| `icon/ui-menu-1-1` | xuất trận / tiếp tục | 16×16 | 1 | giáo + rìu đồng bắt chéo | giáo | tools/build-prompts.js:279 · js/ui.js:467 |
| `icon/ui-menu-1-2` | tướng | 16×16 | 1 | 3 mũ chiến binh | 3 | tools/build-prompts.js:279 · js/ui.js:467 |
| `icon/ui-menu-1-3` | Ngân khố / rương thưởng | 16×16 | 1 | rương đồng | rương | tools/build-prompts.js:279 · js/ui.js:467 |
| `icon/ui-menu-1-4` | Ấn Phù | 16×16 | 1 | ấn đá tròn khắc | ấn | tools/build-prompts.js:279 · js/ui.js:467 |
| `icon/ui-menu-2-1` | cài đặt | 16×16 | 1 | bánh răng đồng | bánh | tools/build-prompts.js:280 · js/ui.js:467 |
| `icon/ui-menu-2-2` | Bách khoa / truyện | 16×16 | 1 | cuộn thẻ tre | cuộn | tools/build-prompts.js:280 · js/ui.js:467 |
| `icon/ui-menu-2-3` | xếp hạng | 16×16 | 1 | cúp trống đồng nhỏ | cúp | tools/build-prompts.js:280 · js/ui.js:467 |
| `icon/ui-menu-2-4` | túi đồ | 16×16 | 1 | túi vải dệt | túi | tools/build-prompts.js:280 · js/ui.js:467 |
| `icon/ui-huy-chuong-1` | huy chương vàng (hạng 1) | 16×16 | 1 | huy chương vàng dải đỏ | huy chương | tools/build-prompts.js:390 · js/ui.js:74 |
| `icon/ui-huy-chuong-2` | huy chương bạc (hạng 2) | 16×16 | 1 | huy chương bạc dải xanh | huy chương | tools/build-prompts.js:390 · js/ui.js:74 |
| `icon/ui-huy-chuong-3` | huy chương đồng (hạng 3) | 16×16 | 1 | huy chương đồng dải xanh lá | huy chương | tools/build-prompts.js:390 · js/ui.js:74 |
| `icon/ui-huy-chuong-4` | huy chương vương miện (top) | 16×16 | 1 | vương miện vàng nhỏ | vương miện | tools/build-prompts.js:390 · js/ui.js:74 |
| `icon/svg-close` | icon SVG: đóng | 12×12 | 1 | dấu ✕ | dấu ✕ | js/ui.js:20 |
| `icon/svg-check` | icon SVG: chọn / đúng | 12×12 | 1 | dấu tích | dấu tích | js/ui.js:22 |
| `icon/svg-up` | icon SVG: nâng (mũi tên lên) | 12×12 | 1 | mũi tên lên | mũi tên lên | js/ui.js:24 |
| `icon/svg-dup` | icon SVG: trùng / gộp | 12×12 | 1 | 2 mũi tên ^ chồng | 2 mũi tên ^ chồng | js/ui.js:25 |
| `icon/svg-swap` | icon SVG: đổi chỗ | 12×12 | 1 | 2 mũi tên ngược chiều | 2 mũi tên ngược chiều | js/ui.js:26 |
| `icon/svg-play` | icon SVG: chạy | 12×12 | 1 | tam giác | tam giác | js/ui.js:31 |
| `icon/svg-stop` | icon SVG: dừng | 12×12 | 1 | ô vuông | ô vuông | js/ui.js:30 |
| `icon/svg-bag` | icon SVG: túi | 12×12 | 1 | túi có quai | túi có quai | js/ui.js:28 |
| `icon/svg-star` | icon SVG: sao | 12×12 | 1 | sao 5 cánh | sao 5 cánh | js/ui.js:29 |
| `icon/tim-mang` | tim mạng trên thanh trên | 12×12 | 1 | trái tim đỏ #E25A3A | tim | index.html:32 |
| `icon/mat-an-hien` | ẩn / hiện giao diện | 12×12 | 1 | con mắt | mắt | index.html:35 |

## Lô 20 — icon: nút & icon UI còn vẽ bằng code 1/2 (emoji / ký hiệu chữ / SVG)

25 hình · ưu tiên cao. Quét bằng `grep -n` emoji + ký hiệu trong js/ui.js, js/main.js, js/game.js, js/render.js, css/style.css, index.html, js/chapters.js. Các ký hiệu đã có mã ở lô khác được ghi trong mục "Đối chiếu ký hiệu code → mã pixel". Chữ thường (tên, số) giữ nguyên; emoji trong toast/tooltip văn bản cũng thay bằng `<img>` icon pixel.

| mã | tên | cỡ | khung | thay cho (đang vẽ bằng code) | dấu hiệu nhỏ | chỗ vẽ (file:dòng · hàm/selector) |
|---|---|---|---|---|---|---|
| `icon/toc-do-x1` | tốc độ x1 | 16×16 | 1 | chữ "x1" trên nút | 1 mũi tên ▸ | index.html:37 `#btn-speed` · js/ui.js:518 (onclick đổi nhãn) |
| `icon/toc-do-x2` | tốc độ x2 | 16×16 | 1 | chữ "x2" | 2 mũi tên ▸▸ | index.html:37 · js/ui.js:518 |
| `icon/toc-do-x3` | tốc độ x3 | 16×16 | 1 | chữ "x3" | 3 mũi tên ▸▸▸ | index.html:37 · js/ui.js:518 |
| `icon/chat` | trò chuyện (chơi nhóm) | 16×16 | 1 | emoji 💬 | bóng thoại | index.html:39 `#btn-chat` · js/ui.js:1123 (`.ch-head`) · js/ui.js:309 FB_KINDS "Khác" |
| `icon/gop-y` | góp ý | 16×16 | 1 | emoji ✉ | phong thư | index.html:66 (`.dw-btn[data-k=feedback] .ic`) · index.html:101 `#btn-feedback` · js/ui.js:1272, 1457 |
| `icon/hop-thu` | góp ý nhận được (quản trị) | 16×16 | 1 | emoji 📥 | khay thư | js/ui.js:1544, 1547, 1628 (fbaBtn / bảng fba) |
| `icon/dau-hang` | dừng chơi / bỏ trận | 16×16 | 1 | emoji 🏳 | cờ trắng | index.html:67 `.dw-btn.quit .ic` |
| `icon/choi-moi` | chơi mới | 16×16 | 1 | SVG dấu + (index.html) | dấu + | index.html:97 `#btn-newgame` svg |
| `icon/choi-nhom` | cùng giữ thành (co-op) | 16×16 | 1 | emoji 🤝 | 2 tay bắt | js/ui.js:945 (`.md-ic`), 2960, 2986 |
| `icon/gy-loi` | góp ý: lỗi | 12×12 | 1 | emoji 🐞 | con bọ | js/ui.js:309 FB_KINDS |
| `icon/gy-can-bang` | góp ý: cân bằng | 12×12 | 1 | emoji ⚖ | cán cân | js/ui.js:309 FB_KINDS |
| `icon/but` | đặt tên / ghi chú | 12×12 | 1 | ký hiệu ✎ và emoji 📝 | bút lông | js/ui.js:642 (`.pl-hint`), 876 (`rank-nick`), 1619, 1620 |
| `icon/thu-tim` | cảm ơn (toast) | 12×12 | 1 | emoji 💌 | thư tim | js/ui.js:1536 (toast) |
| `icon/nhiem-vu-ngay` | nhiệm vụ ngày | 12×12 | 1 | ký hiệu ☀ | mặt trời | js/ui.js:818, 2954, 2955 |
| `icon/o-trong` | ô nhiệm vụ chưa xong | 12×12 | 1 | ký hiệu ◻ | ô vuông trống | js/ui.js:746 (`.qd`) |
| `icon/sai` | điều kiện chưa đạt | 12×12 | 1 | ký hiệu ✗ | dấu ✗ đỏ | js/ui.js:4005 (ck) |
| `icon/mui-ten-phai` | mũi tên → (nâng cấp / công thức / hợp thể) | 12×12 | 1 | ký hiệu ➜ | mũi tên đồng | js/ui.js:2719, 3680 (`.craft-arrow`), 3939 (`.es-ar`), 3972 (`.ev-op.ar`) · css/style.css:2071 |
| `icon/mui-ten-nhanh` | nhánh tầng 2 cây hợp thể | 12×12 | 1 | ký hiệu ↳ | mũi tên gập | css/style.css:1612 `.ev-row.sub::before` · js/ui.js:3971 |
| `icon/cham-tron` | chấm trạng thái (đã có / lọc) | 8×8 trong ô 12×12 | 1 | ký hiệu ● | chấm tròn | js/ui.js:1632, 2862, 3672, 3744 (`.lv` trong `.slot`) |
| `icon/thuoc-tinh-phu` | thuộc tính phụ của đồ (affix) | 12×12 | 1 | ký hiệu ◆ | thoi nhỏ | js/ui.js:3714, 3833 (`.aff`) |
| `icon/than-khi` | nút Thần Khí | 16×16 | 1 | ký hiệu ⚜ | vật báu vành vàng | js/ui.js:2780 (`lg-open`) |
| `icon/co-dot` | đợt (bảng kết quả) | 12×12 | 1 | ký hiệu ⚑ | cờ đuôi nheo | js/ui.js:2946 |
| `icon/quai-ha` | quái đã hạ (bảng kết quả) | 12×12 | 1 | ký hiệu ✕ (dùng như đầu lâu) | đầu quỷ gạch | js/ui.js:2948 |
| `icon/canh-bao` | cảnh báo | 12×12 | 1 | ký hiệu ⚠ | tam giác ! | js/ui.js:3902 (`.warnbox`) |
| `icon/hoi` | trợ giúp (?) | 16×16 | 1 | chữ "?" trên nút | dấu ? trên đĩa đồng | js/ui.js:1883 (`.hx-q`, data-act=hx-help) |

## Lô 21 — icon: nút & icon UI còn vẽ bằng code 2/2 (sao, khoá, độ hiếm, ô trang bị, chợ 6 thẻ, chương)

24 hình · ưu tiên cao. Từ nhánh claude/cho-6-the: 3 ký hiệu ~10px trên dải giá thẻ chợ (`cho-ghep`, `cho-hop-the`, `cho-khoa-tim`). Chân dung thẻ Chợ sẽ lấy qua hàm chung `marketPortrait(t)` trong js/ui.js (nhánh cho-6-the) — dùng chân dung pixel `assets/pixel/tuong/<mã>-chan-dung.png`.

| mã | tên | cỡ | khung | thay cho (đang vẽ bằng code) | dấu hiệu nhỏ | chỗ vẽ (file:dòng · hàm/selector) |
|---|---|---|---|---|---|---|
| `icon/linh-chi` | Linh Chi (thảo dược) | 16×16 | 1 | emoji 🌿 / 🍄 | nấm linh chi | js/ui.js:651, 4060, 4061 (`.nt-ico`) |
| `icon/sao-cap` | sao cấp tướng (★ ghép sao) | 8×8 trong ô 12×12 | 1 | ký hiệu ★ lặp (HTML) + drawStar vàng trên bản đồ | sao vàng | js/ui.js:1760, 2289, 2796 ('★'.repeat) · js/main.js:720 drawStar (#FFD66B) · js/render.js:37 |
| `icon/sao-than-tinh-nho` | sao thần tinh / luyện thể | 8×8 trong ô 12×12 | 1 | ký hiệu ✦ + drawStar cam (tướng hợp thể) | sao 4 cánh cam | js/ui.js:276, 2247, 2252, 2403 · js/main.js:720 (`h.from` #FF7A3A) |
| `icon/ghep-tu-dong` | ghép tự động | 16×16 | 1 | ký hiệu ⇄ (chữ b) | 2 mũi tên ngược | js/ui.js:2196 (`.dk-auto` data-act=auto-merge) |
| `icon/khoa-mo` | khoá chợ — mở | 16×16 | 1 | SVG MK_LOCK[0] | ổ khoá mở | js/ui.js:70 MK_LOCK |
| `icon/khoa-dong` | khoá chợ — đóng / khoá nhỏ | 12×12 | 1 | SVG MK_LOCK[1] + SVG_LOCK + ICON.lock | ổ khoá đóng | js/ui.js:70-71 MK_LOCK, 87 SVG_LOCK (`.svlk`), 22 ICON.lock |
| `icon/tia-ky-nang` | tia kỹ năng (điểm kỹ năng sẵn) | 12×12 | 1 | SVG_SK tia sét | tia sét | js/ui.js:88 SVG_SK (`.svsk`) |
| `icon/lo-duc` | Lò đúc đồng | 16×16 | 1 | ART.ui.forge (SVG) + emoji ⚒ | lò + búa | js/art.js:166 ART.ui.forge · js/ui.js:771 emoArt(⚒) |
| `icon/do-hiem-thuong` | chip độ hiếm Thường | 12×12 | 1 | màu chữ / viền CSS .c-common | ngọc xám đồng #C8C0B0 | css/style.css:348 (`.c-*`) · js/ui.js:153 rarCls · js/data.js:113 RARITY |
| `icon/do-hiem-hiem` | chip độ hiếm Hiếm | 12×12 | 1 | màu chữ / viền CSS .c-rare | ngọc xanh #7FC4F0 | css/style.css:348 (`.c-*`) · js/ui.js:153 rarCls · js/data.js:113 RARITY |
| `icon/do-hiem-su-thi` | chip độ hiếm Sử thi | 12×12 | 1 | màu chữ / viền CSS .c-epic | ngọc tím #C8A0F0 | css/style.css:348 (`.c-*`) · js/ui.js:153 rarCls · js/data.js:113 RARITY |
| `icon/do-hiem-huyen-thoai` | chip độ hiếm Huyền thoại | 12×12 | 1 | màu chữ / viền CSS .c-legendary | ngọc vàng #FFB84A | css/style.css:348 (`.c-*`) · js/ui.js:153 rarCls · js/data.js:113 RARITY |
| `icon/o-vu-khi` | ô trang bị trống: Vũ khí | 16×16 | 1 | ô trống chỉ có viền CSS / chữ | rìu mờ (bóng xám) | css/style.css:333 `.slot` · js/data.js:85 SLOT_NAMES |
| `icon/o-mu` | ô trang bị trống: Mũ | 16×16 | 1 | ô trống chỉ có viền CSS / chữ | mũ mờ (bóng xám) | css/style.css:333 `.slot` · js/data.js:85 SLOT_NAMES |
| `icon/o-giap` | ô trang bị trống: Giáp | 16×16 | 1 | ô trống chỉ có viền CSS / chữ | áo mờ (bóng xám) | css/style.css:333 `.slot` · js/data.js:85 SLOT_NAMES |
| `icon/o-phu-kien` | ô trang bị trống: Phụ kiện | 16×16 | 1 | ô trống chỉ có viền CSS / chữ | vòng ngọc mờ (bóng xám) | css/style.css:333 `.slot` · js/data.js:85 SLOT_NAMES |
| `icon/cho-ghep` | thẻ chợ: mua là ghép | 10×10 (vẽ trong ô 12×12) | 1 | ký hiệu ⇄ trên dải giá (nền xanh) | ⇄ trên nền xanh | nhánh claude/cho-6-the (dải giá thẻ chợ, js/ui.js) |
| `icon/cho-hop-the` | thẻ chợ: nguyên liệu hợp thể | 10×10 (trong ô 12×12) | 1 | ký hiệu ✦ trên dải giá (nền tím) | ✦ trên nền tím | nhánh claude/cho-6-the |
| `icon/cho-khoa-tim` | thẻ chợ: nguyên liệu Tím chưa mở | 10×10 (trong ô 12×12) | 1 | ổ khoá nền tím xám | khoá trên tím xám | nhánh claude/cho-6-the |
| `icon/ch-sontinh` | biểu tượng chương sontinh | 16×16 | 1 | emoji 💧 (CH_THEME.ic) | giọt nước | js/chapters.js:170 CH_THEME.ic |
| `icon/ch-thachsanh` | biểu tượng chương thachsanh | 16×16 | 1 | emoji 👹 (CH_THEME.ic) | mặt quỷ | js/chapters.js:173 CH_THEME.ic |
| `icon/ch-giong` | biểu tượng chương giong | 16×16 | 1 | emoji 🔥 (CH_THEME.ic) | lửa | js/chapters.js:176 CH_THEME.ic |
| `icon/ch-llq` | biểu tượng chương llq | 16×16 | 1 | emoji 🌊 (CH_THEME.ic) | sóng | js/chapters.js:179 CH_THEME.ic |
| `icon/ch-adv` | biểu tượng chương adv | 16×16 | 1 | emoji 🏹 (CH_THEME.ic) | cung tên | js/chapters.js:182 CH_THEME.ic |

## Lô 22 — ky-nang: icon kỹ năng 1/12 — Lạc Tướng, Lực Sĩ Núi, Xạ Thủ Văn Lang, Thợ Săn Rừng, Thầy Mo Lửa

20 hình · ưu tiên vừa. Mỗi tướng 4 icon Q·W·E·R (SKILL_KEYS). Icon: 1 vật/biểu tượng đậm giữa ô, viền #2A1608 (màu `vien` bảng màu), màu chủ theo hành của tướng (EL_HERO_COLOR, js/data.js:1759), không vẽ thân/mặt nhân vật. Game đọc `packs/<tướng>/sk-q…r.png` (SKILL_PACK, render.js:465).

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/lactuong_q` | Lạc Tướng · Q «Bổ Rìu Đồng» | 24×24 | chủ động | a bronze axe chopping down with an impact spark | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:721 · js/data.js:148 |
| `ky-nang/lactuong_w` | Lạc Tướng · W «Rìu Lốc Xoáy» | 24×24 | nội tại | a bronze axe spinning in a whirlwind | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:721 · js/data.js:150 |
| `ky-nang/lactuong_e` | Lạc Tướng · E «Hùng Khí» | 24×24 | nội tại | a roaring warrior aura: red-gold flame around a fist | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:721 · js/data.js:153 |
| `ky-nang/lactuong_r` | Lạc Tướng · R «Sấm Tản Viên» | 24×24 | chủ động | a lightning bolt striking from a storm cloud over a mountain | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:721 · js/data.js:156 |
| `ky-nang/lucsi_q` | Lực Sĩ Núi · Q «Ném Đá Tảng» | 24×24 | chủ động | a big boulder thrown with a motion arc | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:735 · js/data.js:167 |
| `ky-nang/lucsi_w` | Lực Sĩ Núi · W «Gánh Núi» | 24×24 | nội tại | a strong shoulder carrying a small mountain | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:735 · js/data.js:169 |
| `ky-nang/lucsi_e` | Lực Sĩ Núi · E «Bụi Đá» | 24×24 | nội tại | a cloud of rock dust | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:735 · js/data.js:172 |
| `ky-nang/lucsi_r` | Lực Sĩ Núi · R «Vùi Đá» | 24×24 | chủ động | a pile of rocks burying the ground | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:735 · js/data.js:175 |
| `ky-nang/xathu_q` | Xạ Thủ Văn Lang · Q «Tên Xuyên Thấu» | 24×24 | chủ động | an arrow piercing through two shields | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:749 · js/data.js:186 |
| `ky-nang/xathu_w` | Xạ Thủ Văn Lang · W «Đa Tiễn» | 24×24 | nội tại | three arrows flying in a fan | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:749 · js/data.js:188 |
| `ky-nang/xathu_e` | Xạ Thủ Văn Lang · E «Tên Tẩm Nhựa Độc» | 24×24 | nội tại | an arrow tip dripping dark poison resin | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:749 · js/data.js:191 |
| `ky-nang/xathu_r` | Xạ Thủ Văn Lang · R «Mưa Tên» | 24×24 | chủ động | a rain of arrows falling from the sky | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:749 · js/data.js:194 |
| `ky-nang/thosan_q` | Thợ Săn Rừng · Q «Bước Lá Rừng» | 24×24 | chủ động | a footstep made of green leaves with a dash trail | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:763 · js/data.js:205 |
| `ky-nang/thosan_w` | Thợ Săn Rừng · W «Tên Ẩn» | 24×24 | nội tại | a hidden spear among leaves | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:763 · js/data.js:207 |
| `ky-nang/thosan_e` | Thợ Săn Rừng · E «Đòn Chí Mạng» | 24×24 | nội tại | a red critical-hit burst on a target | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:763 · js/data.js:210 |
| `ky-nang/thosan_r` | Thợ Săn Rừng · R «Săn Mồi» | 24×24 | chủ động | a hunting dagger with a red target mark | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:763 · js/data.js:213 |
| `ky-nang/thaymo_q` | Thầy Mo Lửa · Q «Cột Lửa» | 24×24 | chủ động | a tall fire pillar | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:777 · js/data.js:224 |
| `ky-nang/thaymo_w` | Thầy Mo Lửa · W «Đuốc Linh Hồn» | 24×24 | nội tại | a spirit torch with a blue-orange flame | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:777 · js/data.js:226 |
| `ky-nang/thaymo_e` | Thầy Mo Lửa · E «Lửa Thiêu» | 24×24 | nội tại | burning flames on the ground | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:777 · js/data.js:229 |
| `ky-nang/thaymo_r` | Thầy Mo Lửa · R «Hỏa Sơn» | 24×24 | chủ động | a fiery volcano erupting meteors | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:777 · js/data.js:232 |

## Lô 23 — ky-nang: icon kỹ năng 2/12 — Thần Sương Núi, Dũng Sĩ Giáo Đồng, Thầy Chuông Đồng, Dũng Sĩ Tre Làng, Thợ Săn Ống Thổi

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/thansuong_q` | Thần Sương Núi · Q «Vòng Sương» | 24×24 | chủ động | a frosty white mist ring | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:791 · js/data.js:243 |
| `ky-nang/thansuong_w` | Thần Sương Núi · W «Mũi Sương Giá» | 24×24 | nội tại | a sharp ice shard | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:791 · js/data.js:245 |
| `ky-nang/thansuong_e` | Thần Sương Núi · E «Hơi Lạnh Đỉnh Núi» | 24×24 | nội tại | a cold wind swirl over a snowy mountain peak | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:791 · js/data.js:248 |
| `ky-nang/thansuong_r` | Thần Sương Núi · R «Mù Sương Tản Viên» | 24×24 | chủ động | a thick fog blizzard swirl | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:791 · js/data.js:251 |
| `ky-nang/giaodong_q` | Dũng Sĩ Giáo Đồng · Q «Đâm Xuyên» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Đâm mạnh: choáng mục tiêu, x2 sát thương +1 | Kim #D9DDE0 | js/data.js:455 |
| `ky-nang/giaodong_w` | Dũng Sĩ Giáo Đồng · W «Mũi Giáo Đồng» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +8.2% xuyên giáp | Kim #D9DDE0 | js/data.js:457 |
| `ky-nang/giaodong_e` | Dũng Sĩ Giáo Đồng · E «Thế Giáo» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +3.1% chí mạng · +10% sát thương lên boss | Kim #D9DDE0 | js/data.js:459 |
| `ky-nang/giaodong_r` | Dũng Sĩ Giáo Đồng · R «Giáo Xoáy» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Xoáy giáo một nhát: x3 sát thương +1 | Kim #D9DDE0 | js/data.js:462 |
| `ky-nang/chuongdong_q` | Thầy Chuông Đồng · Q «Chuông Trấn Yểm» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Rung chuông: quái quanh mình choáng 1 giây, câm lặng 3 giây | Kim #D9DDE0 | js/data.js:473 |
| `ky-nang/chuongdong_w` | Thầy Chuông Đồng · W «Tiếng Chuông Ngân» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +8.2% xuyên kháng phép | Kim #D9DDE0 | js/data.js:475 |
| `ky-nang/chuongdong_e` | Thầy Chuông Đồng · E «Bùa Đồng» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +6.2% sức mạnh kỹ năng | Kim #D9DDE0 | js/data.js:477 |
| `ky-nang/chuongdong_r` | Thầy Chuông Đồng · R «Hồi Chuông Thiêng» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Hồi chuông làm quái quanh mình đứng sững 1,5 giây (boss 0,6 giây) | Kim #D9DDE0 | js/data.js:479 |
| `ky-nang/tre_q` | Dũng Sĩ Tre Làng · Q «Gậy Tre Đập» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Đập gậy tre: choáng mục tiêu, x2 sát thương +1 | Mộc #5FB84A | js/data.js:567 |
| `ky-nang/tre_w` | Dũng Sĩ Tre Làng · W «Tre Ngà» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +8.2% tốc đánh | Mộc #5FB84A | js/data.js:569 |
| `ky-nang/tre_e` | Dũng Sĩ Tre Làng · E «Lũy Tre Xanh» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +5% máu, +1.1 hồi máu/giây | Mộc #5FB84A | js/data.js:571 |
| `ky-nang/tre_r` | Dũng Sĩ Tre Làng · R «Quét Tre» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Quét bụi tre quanh mình: đánh mọi quái trong tầm, x2 sát thương +1 | Mộc #5FB84A | js/data.js:573 |
| `ky-nang/ongthoi_q` | Thợ Săn Ống Thổi · Q «Kim Độc» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Thổi kim độc vào quái đi xa nhất: x2 sát thương +1, độc | Mộc #5FB84A | js/data.js:584 |
| `ky-nang/ongthoi_w` | Thợ Săn Ống Thổi · W «Nhựa Độc» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +0.3 sát thương · quái trúng không được hồi máu 3 giây | Mộc #5FB84A | js/data.js:586 |
| `ky-nang/ongthoi_e` | Thợ Săn Ống Thổi · E «Mắt Rừng» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +4.1% chí mạng | Mộc #5FB84A | js/data.js:588 |
| `ky-nang/ongthoi_r` | Thợ Săn Ống Thổi · R «Mưa Kim Độc» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Mưa kim độc xuống vùng quái đông: x2 sát thương +1 | Mộc #5FB84A | js/data.js:590 |

## Lô 24 — ky-nang: icon kỹ năng 3/12 — Người Đắp Đê, Trẻ Chăn Trâu, Chàng Chèo Đò, Cô Hái Sen, Chàng Đốt Nương

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/dapde_q` | Người Đắp Đê · Q «Nện Cuốc» | 24×24 | chủ động | hoe hitting the ground | Thổ #C99A3C | PROMPT_GEMINI_V94.md:407 · js/data.js:659 |
| `ky-nang/dapde_w` | Người Đắp Đê · W «Đê Vững» | 24×24 | nội tại | earthen dike | Thổ #C99A3C | PROMPT_GEMINI_V94.md:407 · js/data.js:661 |
| `ky-nang/dapde_e` | Người Đắp Đê · E «Đắp Đê Chắn Lũ» | 24×24 | chủ động | earth shield wall | Thổ #C99A3C | PROMPT_GEMINI_V94.md:407 · js/data.js:663 |
| `ky-nang/dapde_r` | Người Đắp Đê · R «Đất Rung Đê Vỡ» | 24×24 | chủ động | cracked broken dike | Thổ #C99A3C | PROMPT_GEMINI_V94.md:407 · js/data.js:665 |
| `ky-nang/chantrau_q` | Trẻ Chăn Trâu · Q «Sỏi Nảy» | 24×24 | chủ động | bouncing pebble | Thổ #C99A3C | PROMPT_GEMINI_V94.md:408 · js/data.js:676 |
| `ky-nang/chantrau_w` | Trẻ Chăn Trâu · W «Gậy Gõ Đầu» | 24×24 | nội tại | pebble hitting a head with stars | Thổ #C99A3C | PROMPT_GEMINI_V94.md:408 · js/data.js:678 |
| `ky-nang/chantrau_e` | Trẻ Chăn Trâu · E «Sáo Trúc Lưng Trâu» | 24×24 | nội tại | bamboo flute on a buffalo | Thổ #C99A3C | PROMPT_GEMINI_V94.md:408 · js/data.js:680 |
| `ky-nang/chantrau_r` | Trẻ Chăn Trâu · R «Cả Xóm Ra Đồng» | 24×24 | chủ động | many kids with slingshots | Thổ #C99A3C | PROMPT_GEMINI_V94.md:408 · js/data.js:682 |
| `ky-nang/chodo_q` | Chàng Chèo Đò · Q «Mái Chèo Đập» | 24×24 | chủ động | oar hitting | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:336 · js/data.js:768 |
| `ky-nang/chodo_w` | Chàng Chèo Đò · W «Quét Chèo» | 24×24 | nội tại | sweeping oar arc | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:336 · js/data.js:770 |
| `ky-nang/chodo_e` | Chàng Chèo Đò · E «Thân Sông Nước» | 24×24 | nội tại | sturdy body with water drops | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:336 · js/data.js:772 |
| `ky-nang/chodo_r` | Chàng Chèo Đò · R «Đò Ngang Vượt Sóng» | 24×24 | chủ động | ferry boat on a wave | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:336 · js/data.js:774 |
| `ky-nang/haisen_q` | Cô Hái Sen · Q «Sen Thơm» | 24×24 | chủ động | pink lotus | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:337 · js/data.js:785 |
| `ky-nang/haisen_w` | Cô Hái Sen · W «Hạt Sen» | 24×24 | nội tại | lotus seed pod | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:337 · js/data.js:787 |
| `ky-nang/haisen_e` | Cô Hái Sen · E «Hương Sen» | 24×24 | nội tại | lotus scent swirl | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:337 · js/data.js:790 |
| `ky-nang/haisen_r` | Cô Hái Sen · R «Mưa Đầm Sen» | 24×24 | chủ động | rain over a lotus pond | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:337 · js/data.js:792 |
| `ky-nang/dotnuong_q` | Chàng Đốt Nương · Q «Dao Phát Rẫy» | 24×24 | chủ động | machete with ember | Hỏa #E0452C | PROMPT_GEMINI_V94.md:265 · js/data.js:879 |
| `ky-nang/dotnuong_w` | Chàng Đốt Nương · W «Lửa Nương» | 24×24 | nội tại | fire line on a river | Hỏa #E0452C | PROMPT_GEMINI_V94.md:265 · js/data.js:881 |
| `ky-nang/dotnuong_e` | Chàng Đốt Nương · E «Khói Rẫy» | 24×24 | nội tại | smoke over a field | Hỏa #E0452C | PROMPT_GEMINI_V94.md:265 · js/data.js:883 |
| `ky-nang/dotnuong_r` | Chàng Đốt Nương · R «Cháy Rừng» | 24×24 | chủ động | burning forest | Hỏa #E0452C | PROMPT_GEMINI_V94.md:265 · js/data.js:885 |

## Lô 25 — ky-nang: icon kỹ năng 4/12 — Cô Thả Đèn Trời, Thợ Rèn Đông Sơn, Ngư Phủ Sông Đà, Thợ Gốm Phù Lãng, Thầy Lang Lá Thuốc

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/denroi_q` | Cô Thả Đèn Trời · Q «Đèn Trời Rơi» | 24×24 | chủ động | sky lantern falling | Hỏa #E0452C | PROMPT_GEMINI_V94.md:266 · js/data.js:896 |
| `ky-nang/denroi_w` | Cô Thả Đèn Trời · W «Bấc Đèn» | 24×24 | nội tại | lantern wick flame | Hỏa #E0452C | PROMPT_GEMINI_V94.md:266 · js/data.js:898 |
| `ky-nang/denroi_e` | Cô Thả Đèn Trời · E «Ước Nguyện» | 24×24 | nội tại | wishing lantern with a star | Hỏa #E0452C | PROMPT_GEMINI_V94.md:266 · js/data.js:901 |
| `ky-nang/denroi_r` | Cô Thả Đèn Trời · R «Ngàn Đèn Bay» | 24×24 | chủ động | many flying lanterns | Hỏa #E0452C | PROMPT_GEMINI_V94.md:266 · js/data.js:903 |
| `ky-nang/thoren_q` | Thợ Rèn Đông Sơn · Q «Búa Nung Đỏ» | 24×24 | chủ động | glowing red-hot hammer | Hỏa #E0452C | PROMPT_GEMINI_V94.md:141 · js/data.js:992 |
| `ky-nang/thoren_w` | Thợ Rèn Đông Sơn · W «Lò Lửa Đông Sơn» | 24×24 | nội tại | forge fire | Hỏa #E0452C | PROMPT_GEMINI_V94.md:141 · js/data.js:994 |
| `ky-nang/thoren_e` | Thợ Rèn Đông Sơn · E «Áo Đồng Mới Rèn» | 24×24 | nội tại | bronze chest armor | Hỏa #E0452C | PROMPT_GEMINI_V94.md:141 · js/data.js:996 |
| `ky-nang/thoren_r` | Thợ Rèn Đông Sơn · R «Nổ Lò Rèn» | 24×24 | chủ động | exploding furnace | Hỏa #E0452C | PROMPT_GEMINI_V94.md:141 · js/data.js:998 |
| `ky-nang/nguphu_q` | Ngư Phủ Sông Đà · Q «Quăng Chài» | 24×24 | chủ động | thrown fishing net | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:142 · js/data.js:1009 |
| `ky-nang/nguphu_w` | Ngư Phủ Sông Đà · W «Xiên Cá» | 24×24 | nội tại | three-prong fish spear | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:142 · js/data.js:1011 |
| `ky-nang/nguphu_e` | Ngư Phủ Sông Đà · E «Sóng Vỗ Mạn Thuyền» | 24×24 | nội tại | splashing wave on a boat side | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:142 · js/data.js:1013 |
| `ky-nang/nguphu_r` | Ngư Phủ Sông Đà · R «Thuyền Nan Lướt Sóng» | 24×24 | chủ động | bamboo basket boat on a wave | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:142 · js/data.js:1015 |
| `ky-nang/thogom_q` | Thợ Gốm Phù Lãng · Q «Bình Gốm Nổ» | 24×24 | chủ động | clay pot bursting | Thổ #C99A3C | PROMPT_GEMINI_V94.md:143 · js/data.js:1026 |
| `ky-nang/thogom_w` | Thợ Gốm Phù Lãng · W «Đất Nung» | 24×24 | nội tại | fired clay brick | Thổ #C99A3C | PROMPT_GEMINI_V94.md:143 · js/data.js:1028 |
| `ky-nang/thogom_e` | Thợ Gốm Phù Lãng · E «Men Rạn» | 24×24 | nội tại | cracked glaze pattern shield | Thổ #C99A3C | PROMPT_GEMINI_V94.md:143 · js/data.js:1031 |
| `ky-nang/thogom_r` | Thợ Gốm Phù Lãng · R «Lò Gốm Ngàn Năm» | 24×24 | chủ động | rolling clay boulder | Thổ #C99A3C | PROMPT_GEMINI_V94.md:143 · js/data.js:1033 |
| `ky-nang/thaylang_q` | Thầy Lang Lá Thuốc · Q «Thuốc Nam» | 24×24 | chủ động | herb bundle with a green cross | Mộc #5FB84A | PROMPT_GEMINI_V94.md:144 · js/data.js:1044 |
| `ky-nang/thaylang_w` | Thầy Lang Lá Thuốc · W «Lá Ngón» | 24×24 | nội tại | poison leaf | Mộc #5FB84A | PROMPT_GEMINI_V94.md:144 · js/data.js:1046 |
| `ky-nang/thaylang_e` | Thầy Lang Lá Thuốc · E «Hương Rừng» | 24×24 | nội tại | fragrant forest leaves | Mộc #5FB84A | PROMPT_GEMINI_V94.md:144 · js/data.js:1048 |
| `ky-nang/thaylang_r` | Thầy Lang Lá Thuốc · R «Cứu Mệnh» | 24×24 | chủ động | glowing healing leaf circle | Mộc #5FB84A | PROMPT_GEMINI_V94.md:144 · js/data.js:1050 |

## Lô 26 — ky-nang: icon kỹ năng 5/12 — Thạch Sanh, Cao Lỗ, Mai An Tiêm, Chử Đồng Tử, Tiên Dung

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/thachsanh_q` | Thạch Sanh · Q «Rìu Đốn Củi» | 24×24 | chủ động | a woodcutter axe chopping a log | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:847 · js/data.js:322 |
| `ky-nang/thachsanh_w` | Thạch Sanh · W «Cung Tên Vàng» | 24×24 | nội tại | a golden bow with a golden arrow | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:847 · js/data.js:324 |
| `ky-nang/thachsanh_e` | Thạch Sanh · E «Đàn Thần» | 24×24 | chủ động | a magic lute (dan) with music notes | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:847 · js/data.js:327 |
| `ky-nang/thachsanh_r` | Thạch Sanh · R «Diệt Chằn Tinh» | 24×24 | chủ động | a broken ogre horn with a slash mark | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:847 · js/data.js:329 |
| `ky-nang/caolo_q` | Cao Lỗ · Q «Nỏ Liên Châu» | 24×24 | chủ động | three crossbow bolts in a row | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:861 · js/data.js:341 |
| `ky-nang/caolo_w` | Cao Lỗ · W «Lẫy Thần» | 24×24 | nội tại | a bronze crossbow trigger mechanism | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:861 · js/data.js:343 |
| `ky-nang/caolo_e` | Cao Lỗ · E «Tên Móng Rùa» | 24×24 | chủ động | an arrow with a turtle-claw arrowhead | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:861 · js/data.js:346 |
| `ky-nang/caolo_r` | Cao Lỗ · R «Nỏ Thần» | 24×24 | chủ động | a giant glowing divine crossbow | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:861 · js/data.js:348 |
| `ky-nang/antiem_q` | Mai An Tiêm · Q «Ném Dưa Hấu» | 24×24 | chủ động | a watermelon slice flying | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:875 · js/data.js:360 |
| `ky-nang/antiem_w` | Mai An Tiêm · W «Hạt Giống Vàng» | 24×24 | nội tại | a golden seed sprouting | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:875 · js/data.js:362 |
| `ky-nang/antiem_e` | Mai An Tiêm · E «Chim Thần» | 24×24 | chủ động | a magic bird carrying a seed | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:875 · js/data.js:365 |
| `ky-nang/antiem_r` | Mai An Tiêm · R «Mưa Dưa» | 24×24 | chủ động | many watermelons raining down | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:875 · js/data.js:367 |
| `ky-nang/cdt_q` | Chử Đồng Tử · Q «Gậy Thần» | 24×24 | chủ động | a magic walking staff with a green heal glow | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:903 · js/data.js:398 |
| `ky-nang/cdt_w` | Chử Đồng Tử · W «Nón Thần» | 24×24 | nội tại | a conical magic hat (non la) with sparkles | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:903 · js/data.js:400 |
| `ky-nang/cdt_e` | Chử Đồng Tử · E «Sóng Sông Hồng» | 24×24 | chủ động | a red river wave | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:903 · js/data.js:403 |
| `ky-nang/cdt_r` | Chử Đồng Tử · R «Thành Một Đêm» | 24×24 | chủ động | a citadel appearing overnight under a crescent moon | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:903 · js/data.js:405 |
| `ky-nang/tiendung_q` | Tiên Dung · Q «Quạt Tiên» | 24×24 | chủ động | a round fairy fan with sparkles | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:917 · js/data.js:417 |
| `ky-nang/tiendung_w` | Tiên Dung · W «Ánh Ngọc» | 24×24 | nội tại | a shining jewel | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:917 · js/data.js:419 |
| `ky-nang/tiendung_e` | Tiên Dung · E «Sen Hồng» | 24×24 | chủ động | a pink lotus flower | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:917 · js/data.js:422 |
| `ky-nang/tiendung_r` | Tiên Dung · R «Mưa Hoa Tiên» | 24×24 | chủ động | many fairy flower petals raining | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:917 · js/data.js:424 |

## Lô 27 — ky-nang: icon kỹ năng 6/12 — Lang Liêu, Mỵ Châu, Sọ Dừa, Ông Đùng, Thổ Công

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/langlieu_q` | Lang Liêu · Q «Bánh Chưng» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Chia bánh cho tướng trong 170: hồi 12% máu, +20% sát thương trong 6 giây | Thổ #C99A3C | js/data.js:436 |
| `ky-nang/langlieu_w` | Lang Liêu · W «Bánh Giầy» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Tướng đứng gần +2.1 hồi máu/giây | Thổ #C99A3C | js/data.js:438 |
| `ky-nang/langlieu_e` | Lang Liêu · E «Ruộng Lúa» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Lúa mọc làm chậm 40% quái trong vùng 4 giây, 8 sát thương/giây | Thổ #C99A3C | js/data.js:441 |
| `ky-nang/langlieu_r` | Lang Liêu · R «Lễ Tổ Tiên» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Khi có tướng dưới 50% máu: toàn quân hồi đầy máu, bất tử 2 giây | Thổ #C99A3C | js/data.js:443 |
| `ky-nang/mychau_q` | Mỵ Châu · Q «Lông Ngỗng Bay» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Lông ngỗng hóa đàn chim lao xuống quái, x2 sát thương +1 | Kim #D9DDE0 | js/data.js:511 |
| `ky-nang/mychau_w` | Mỵ Châu · W «Áo Lông Trắng» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +5.2% sức mạnh kỹ năng, +3% chí mạng | Kim #D9DDE0 | js/data.js:513 |
| `ky-nang/mychau_e` | Mỵ Châu · E «Giếng Ngọc» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Nước giếng ngọc hồi dần 30% máu cho tướng yếu nhất | Kim #D9DDE0 | js/data.js:515 |
| `ky-nang/mychau_r` | Mỵ Châu · R «Nỏ Thần Lẫy Rùa» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Bắn mũi nỏ thần vào quái giáp dày nhất: x5 sát thương +2 | Kim #D9DDE0 | js/data.js:517 |
| `ky-nang/sodua_q` | Sọ Dừa · Q «Quả Dừa Nổ» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Ném quả dừa nổ vùng: x2 sát thương +1 | Mộc #5FB84A | js/data.js:603 |
| `ky-nang/sodua_w` | Sọ Dừa · W «Tiếng Sáo Chăn Dê» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +6.2% sức mạnh kỹ năng | Mộc #5FB84A | js/data.js:605 |
| `ky-nang/sodua_e` | Sọ Dừa · E «Hóa Chàng Trai» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Hồi 25% máu cho mọi tướng quanh mình | Mộc #5FB84A | js/data.js:607 |
| `ky-nang/sodua_r` | Sọ Dừa · R «Mưa Dừa» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Dừa rơi khắp trận, x2 sát thương +1 | Mộc #5FB84A | js/data.js:609 |
| `ky-nang/ongdung_q` | Ông Đùng · Q «Gánh Đá» | 24×24 | chủ động | carrying pole with stone baskets | Thổ #C99A3C | PROMPT_GEMINI_V94.md:409 · js/data.js:695 |
| `ky-nang/ongdung_w` | Ông Đùng · W «Thân Khổng Lồ» | 24×24 | nội tại | giant body | Thổ #C99A3C | PROMPT_GEMINI_V94.md:409 · js/data.js:697 |
| `ky-nang/ongdung_e` | Ông Đùng · E «Bước Chân Thành Ao» | 24×24 | chủ động | giant footprint pond | Thổ #C99A3C | PROMPT_GEMINI_V94.md:409 · js/data.js:699 |
| `ky-nang/ongdung_r` | Ông Đùng · R «Dựng Núi» | 24×24 | chủ động | rising mountain | Thổ #C99A3C | PROMPT_GEMINI_V94.md:409 · js/data.js:701 |
| `ky-nang/thocong_q` | Thổ Công · Q «Phù Hộ» | 24×24 | chủ động | blessing hand | Thổ #C99A3C | PROMPT_GEMINI_V94.md:410 · js/data.js:713 |
| `ky-nang/thocong_w` | Thổ Công · W «Hương Hỏa» | 24×24 | nội tại | incense pot | Thổ #C99A3C | PROMPT_GEMINI_V94.md:410 · js/data.js:715 |
| `ky-nang/thocong_e` | Thổ Công · E «Khiên Đất» | 24×24 | chủ động | earth dome shield | Thổ #C99A3C | PROMPT_GEMINI_V94.md:410 · js/data.js:717 |
| `ky-nang/thocong_r` | Thổ Công · R «Thổ Địa Hiển Linh» | 24×24 | chủ động | glowing earth god shrine | Thổ #C99A3C | PROMPT_GEMINI_V94.md:410 · js/data.js:719 |

## Lô 28 — ky-nang: icon kỹ năng 7/12 — Lý Ngư Tướng Quân, Trương Chi, Vua Lửa Pơtao Apui, Bà Hỏa, Thần Trống Đồng

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/lyngu_q` | Lý Ngư Tướng Quân · Q «Ngọn Giáo Vũ Môn» | 24×24 | chủ động | trident | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:338 · js/data.js:805 |
| `ky-nang/lyngu_w` | Lý Ngư Tướng Quân · W «Vảy Chép Vàng» | 24×24 | nội tại | golden carp scale | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:338 · js/data.js:807 |
| `ky-nang/lyngu_e` | Lý Ngư Tướng Quân · E «Quẫy Đuôi» | 24×24 | chủ động | carp tail splash | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:338 · js/data.js:809 |
| `ky-nang/lyngu_r` | Lý Ngư Tướng Quân · R «Hóa Rồng» | 24×24 | chủ động | carp turning into a dragon | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:338 · js/data.js:811 |
| `ky-nang/truongchi_q` | Trương Chi · Q «Khúc Sáo Mê Hồn» | 24×24 | chủ động | bamboo flute with notes | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:339 · js/data.js:824 |
| `ky-nang/truongchi_w` | Trương Chi · W «Lời Ca Sông Nước» | 24×24 | nội tại | singing mouth with notes | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:339 · js/data.js:826 |
| `ky-nang/truongchi_e` | Trương Chi · E «Sương Khói Mặt Sông» | 24×24 | chủ động | river mist | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:339 · js/data.js:828 |
| `ky-nang/truongchi_r` | Trương Chi · R «Khúc Ca Cuối» | 24×24 | chủ động | last song note over waves | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:339 · js/data.js:830 |
| `ky-nang/potaoapui_q` | Vua Lửa Pơtao Apui · Q «Gươm Lửa» | 24×24 | chủ động | flaming sword | Hỏa #E0452C | PROMPT_GEMINI_V94.md:267 · js/data.js:916 |
| `ky-nang/potaoapui_w` | Vua Lửa Pơtao Apui · W «Lời Thề Núi Lửa» | 24×24 | nội tại | volcano oath stone | Hỏa #E0452C | PROMPT_GEMINI_V94.md:267 · js/data.js:918 |
| `ky-nang/potaoapui_e` | Vua Lửa Pơtao Apui · E «Vòng Lửa» | 24×24 | chủ động | ring of fire | Hỏa #E0452C | PROMPT_GEMINI_V94.md:267 · js/data.js:920 |
| `ky-nang/potaoapui_r` | Vua Lửa Pơtao Apui · R «Núi Lửa Thức Giấc» | 24×24 | chủ động | erupting volcano | Hỏa #E0452C | PROMPT_GEMINI_V94.md:267 · js/data.js:922 |
| `ky-nang/baahoa_q` | Bà Hỏa · Q «Đốm Lửa» | 24×24 | chủ động | small flame | Hỏa #E0452C | PROMPT_GEMINI_V94.md:268 · js/data.js:935 |
| `ky-nang/baahoa_w` | Bà Hỏa · W «Lửa Lan» | 24×24 | nội tại | spreading fire | Hỏa #E0452C | PROMPT_GEMINI_V94.md:268 · js/data.js:937 |
| `ky-nang/baahoa_e` | Bà Hỏa · E «Khói Mù» | 24×24 | chủ động | black smoke cloud | Hỏa #E0452C | PROMPT_GEMINI_V94.md:268 · js/data.js:940 |
| `ky-nang/baahoa_r` | Bà Hỏa · R «Biển Lửa» | 24×24 | chủ động | sea of fire | Hỏa #E0452C | PROMPT_GEMINI_V94.md:268 · js/data.js:942 |
| `ky-nang/trongdong_q` | Thần Trống Đồng · Q «Gõ Trống Trận» | 24×24 | chủ động | drum mallet hitting a drum | Kim #D9DDE0 | PROMPT_GEMINI_V94.md:145 · js/data.js:1063 |
| `ky-nang/trongdong_w` | Thần Trống Đồng · W «Âm Vang» | 24×24 | nội tại | sound wave rings | Kim #D9DDE0 | PROMPT_GEMINI_V94.md:145 · js/data.js:1065 |
| `ky-nang/trongdong_e` | Thần Trống Đồng · E «Mặt Trời Trống Đồng» | 24×24 | nội tại | bronze drum sun face | Kim #D9DDE0 | PROMPT_GEMINI_V94.md:145 · js/data.js:1067 |
| `ky-nang/trongdong_r` | Thần Trống Đồng · R «Sấm Đồng» | 24×24 | chủ động | lightning over a bronze drum | Kim #D9DDE0 | PROMPT_GEMINI_V94.md:145 · js/data.js:1069 |

## Lô 29 — ky-nang: icon kỹ năng 8/12 — Ông Táo, Lạc Hầu, Thần Săn Ba Vì, Thánh Gióng, Lạc Long Quân

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/ongtao_q` | Ông Táo · Q «Kẹp Than Hồng» | 24×24 | chủ động | fire tongs holding a coal | Hỏa #E0452C | PROMPT_GEMINI_V94.md:147 · js/data.js:1102 |
| `ky-nang/ongtao_w` | Ông Táo · W «Ba Ông Đầu Rau» | 24×24 | nội tại | three hearth stones with fire | Hỏa #E0452C | PROMPT_GEMINI_V94.md:147 · js/data.js:1104 |
| `ky-nang/ongtao_e` | Ông Táo · E «Tấu Trình Thiên Đình» | 24×24 | chủ động | scroll to heaven | Hỏa #E0452C | PROMPT_GEMINI_V94.md:147 · js/data.js:1106 |
| `ky-nang/ongtao_r` | Ông Táo · R «Cá Chép Hóa Rồng» | 24×24 | chủ động | fire carp turning into a dragon | Hỏa #E0452C | PROMPT_GEMINI_V94.md:147 · js/data.js:1108 |
| `ky-nang/lachau_q` | Lạc Hầu · Q «Trống Hiệu Triệu» | 24×24 | chủ động | a bronze war drum with sound rings | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:931 · js/data.js:1200 |
| `ky-nang/lachau_w` | Lạc Hầu · W «Giáp Da Tê Gai» | 24×24 | nội tại | spiky rhino-hide armor | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:931 · js/data.js:1202 |
| `ky-nang/lachau_e` | Lạc Hầu · E «Đá Lăn Phong Châu» | 24×24 | chủ động | a big round boulder rolling with dust | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:931 · js/data.js:1205 |
| `ky-nang/lachau_r` | Lạc Hầu · R «Lời Thề Bộ Lạc» | 24×24 | chủ động | three raised fists with a sun-star behind (tribe oath) | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:931 · js/data.js:1207 |
| `ky-nang/thansan_q` | Thần Săn Ba Vì · Q «Phi Đao Tẩm Độc» | 24×24 | chủ động | a spear tip dripping green poison | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:945 · js/data.js:1219 |
| `ky-nang/thansan_w` | Thần Săn Ba Vì · W «Nanh Hổ» | 24×24 | nội tại | a sharp tiger fang | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:945 · js/data.js:1221 |
| `ky-nang/thansan_e` | Thần Săn Ba Vì · E «Gọi Hổ Ba Vì» | 24×24 | chủ động | a roaring tiger head | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:945 · js/data.js:1224 |
| `ky-nang/thansan_r` | Thần Săn Ba Vì · R «Cuộc Săn Lớn» | 24×24 | chủ động | a hunting horn with crossed spears | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:945 · js/data.js:1226 |
| `ky-nang/giong_q` | Thánh Gióng · Q «Gậy Tre Ngà» | 24×24 | chủ động | a bamboo stalk with ivory joints swung like a club | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:805 · js/data.js:265 |
| `ky-nang/giong_w` | Thánh Gióng · W «Giáp Sắt» | 24×24 | nội tại | an iron chest armor plate | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:805 · js/data.js:267 |
| `ky-nang/giong_e` | Thánh Gióng · E «Ngựa Sắt Phun Lửa» | 24×24 | chủ động | an iron horse head breathing a trail of fire | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:805 · js/data.js:270 |
| `ky-nang/giong_r` | Thánh Gióng · R «Bay Về Trời» | 24×24 | chủ động | a hero silhouette flying up into the sky on an iron horse with a light beam | Hỏa #E0452C | PROMPT-THAY-HINH-CODE.txt:805 · js/data.js:272 |
| `ky-nang/llq_q` | Lạc Long Quân · Q «Vuốt Rồng» | 24×24 | chủ động | a green dragon claw slash with three claw marks | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:819 · js/data.js:284 |
| `ky-nang/llq_w` | Lạc Long Quân · W «Vảy Rồng» | 24×24 | nội tại | shiny jade dragon scales | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:819 · js/data.js:286 |
| `ky-nang/llq_e` | Lạc Long Quân · E «Gầm Biển» | 24×24 | chủ động | a big roaring sea wave | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:819 · js/data.js:289 |
| `ky-nang/llq_r` | Lạc Long Quân · R «Hóa Rồng» | 24×24 | chủ động | a dragon head breathing a blue beam | Thủy #5AB4D6 | PROMPT-THAY-HINH-CODE.txt:819 · js/data.js:291 |

## Lô 30 — ky-nang: icon kỹ năng 9/12 — Âu Cơ, Thiên Lôi, Chú Cuội, Mẹ Lúa, Sơn Tinh

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/auco_q` | Âu Cơ · Q «Hoa Tiên» | 24×24 | chủ động | a pink fairy flower with a green healing sparkle | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:889 · js/data.js:379 |
| `ky-nang/auco_w` | Âu Cơ · W «Lông Vũ Tiên» | 24×24 | nội tại | one white fairy feather with a soft glow | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:889 · js/data.js:381 |
| `ky-nang/auco_e` | Âu Cơ · E «Núi Mẹ» | 24×24 | chủ động | a gentle green mountain with a mother-shape silhouette | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:889 · js/data.js:384 |
| `ky-nang/auco_r` | Âu Cơ · R «Bọc Trăm Trứng» | 24×24 | chủ động | a big golden egg sack with many small eggs inside | Thổ #C99A3C | PROMPT-THAY-HINH-CODE.txt:889 · js/data.js:386 |
| `ky-nang/thienloi_q` | Thiên Lôi · Q «Sấm Sét» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Sét nổ giữa bầy quái: x2.5 sát thương +1 | Kim #D9DDE0 | js/data.js:549 |
| `ky-nang/thienloi_w` | Thiên Lôi · W «Lưỡi Tầm Sét» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +0.5 sát thương phép · vùng nổ 40 | Kim #D9DDE0 | js/data.js:551 |
| `ky-nang/thienloi_e` | Thiên Lôi · E «Búa Thiên Lôi» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Giáng búa sấm lên quái nhiều máu nhất: x4 sát thương +2 | Kim #D9DDE0 | js/data.js:554 |
| `ky-nang/thienloi_r` | Thiên Lôi · R «Thiên Lôi Giáng Thế» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Sét trời giáng xuống: x5 sát thương +2 vùng lớn | Kim #D9DDE0 | js/data.js:556 |
| `ky-nang/cuoi_q` | Chú Cuội · Q «Đòn Gánh Quật» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Quật đòn gánh một nhát: x3 sát thương +1 | Mộc #5FB84A | js/data.js:622 |
| `ky-nang/cuoi_w` | Chú Cuội · W «Lá Đa Thần» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +10% máu, +1.6 hồi máu/giây | Mộc #5FB84A | js/data.js:624 |
| `ky-nang/cuoi_e` | Chú Cuội · E «Cây Đa Bay» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Cây đa thần mọc giữa trận: hồi máu tướng, làm chậm quái | Mộc #5FB84A | js/data.js:626 |
| `ky-nang/cuoi_r` | Chú Cuội · R «Cung Trăng Gọi Gió» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Gió trăng quật mọi quái dưới đất: x3 sát thương +2 | Mộc #5FB84A | js/data.js:628 |
| `ky-nang/melua_q` | Mẹ Lúa · Q «Đồng Lúa» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Lúa mọc làm chậm 40% quái trong vùng 4 giây, 8 sát thương/giây | Mộc #5FB84A | js/data.js:641 |
| `ky-nang/melua_w` | Mẹ Lúa · W «Cơm Mới» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Tướng trong 170 hồi 12% máu, +20% sát thương 6 giây | Mộc #5FB84A | js/data.js:643 |
| `ky-nang/melua_e` | Mẹ Lúa · E «Rơm Trói» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Rơm vàng trói 4 quái đi xa nhất, x2 sát thương +1 | Mộc #5FB84A | js/data.js:645 |
| `ky-nang/melua_r` | Mẹ Lúa · R «Mùa Vàng» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Mưa thóc vàng xuống vùng quái: x4 sát thương +2 | Mộc #5FB84A | js/data.js:647 |
| `ky-nang/tanvien_q` | Sơn Tinh · Q «Dời Non» | 24×24 | chủ động | moving hill | Thổ #C99A3C | PROMPT_GEMINI_V94.md:411 · js/data.js:732 |
| `ky-nang/tanvien_w` | Sơn Tinh · W «Núi Tản Viên» | 24×24 | nội tại | Tan Vien mountain | Thổ #C99A3C | PROMPT_GEMINI_V94.md:411 · js/data.js:734 |
| `ky-nang/tanvien_e` | Sơn Tinh · E «Đắp Núi Chặn Nước» | 24×24 | chủ động | rising mountain wall | Thổ #C99A3C | PROMPT_GEMINI_V94.md:411 · js/data.js:736 |
| `ky-nang/tanvien_r` | Sơn Tinh · R «Núi Cao Bấy Nhiêu» | 24×24 | chủ động | mountain peaks rising from water | Thổ #C99A3C | PROMPT_GEMINI_V94.md:411 · js/data.js:738 |

## Lô 31 — ky-nang: icon kỹ năng 10/12 — Mẫu Địa, Long Nữ Động Đình, Kinh Dương Vương, Viêm Đế Thần Nông, Nữ Thần Mặt Trời

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/maudia_q` | Mẫu Địa · Q «Đất Nứt» | 24×24 | chủ động | cracked earth | Thổ #C99A3C | PROMPT_GEMINI_V94.md:412 · js/data.js:750 |
| `ky-nang/maudia_w` | Mẫu Địa · W «Mạch Đất Hồi Sinh» | 24×24 | chủ động | underground spring | Thổ #C99A3C | PROMPT_GEMINI_V94.md:412 · js/data.js:752 |
| `ky-nang/maudia_e` | Mẫu Địa · E «Rễ Thiêng» | 24×24 | chủ động | sacred roots | Thổ #C99A3C | PROMPT_GEMINI_V94.md:412 · js/data.js:754 |
| `ky-nang/maudia_r` | Mẫu Địa · R «Núi Mẹ» | 24×24 | chủ động | mother mountain | Thổ #C99A3C | PROMPT_GEMINI_V94.md:412 · js/data.js:756 |
| `ky-nang/longnu_q` | Long Nữ Động Đình · Q «Long Châu» | 24×24 | chủ động | dragon pearl | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:341 · js/data.js:861 |
| `ky-nang/longnu_w` | Long Nữ Động Đình · W «Nước Động Đình» | 24×24 | chủ động | lake water drop | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:341 · js/data.js:863 |
| `ky-nang/longnu_e` | Long Nữ Động Đình · E «Băng Long» | 24×24 | chủ động | ice dragon | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:341 · js/data.js:865 |
| `ky-nang/longnu_r` | Long Nữ Động Đình · R «Long Cung Nổi Sóng» | 24×24 | chủ động | underwater palace waves | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:341 · js/data.js:867 |
| `ky-nang/kinhduong_q` | Kinh Dương Vương · Q «Đao Xích Quỷ» | 24×24 | chủ động | red-gold sword | Hỏa #E0452C | PROMPT_GEMINI_V94.md:269 · js/data.js:954 |
| `ky-nang/kinhduong_w` | Kinh Dương Vương · W «Dòng Dõi Thần Nông» | 24×24 | nội tại | rice and leaf crest | Hỏa #E0452C | PROMPT_GEMINI_V94.md:269 · js/data.js:956 |
| `ky-nang/kinhduong_e` | Kinh Dương Vương · E «Lệnh Vua» | 24×24 | chủ động | royal command banner | Hỏa #E0452C | PROMPT_GEMINI_V94.md:269 · js/data.js:958 |
| `ky-nang/kinhduong_r` | Kinh Dương Vương · R «Hỏa Long Giáng Thế» | 24×24 | chủ động | fire dragon | Hỏa #E0452C | PROMPT_GEMINI_V94.md:269 · js/data.js:960 |
| `ky-nang/viemde_q` | Viêm Đế Thần Nông · Q «Ngọn Lửa Đầu Tiên» | 24×24 | chủ động | first flame on a torch | Hỏa #E0452C | PROMPT_GEMINI_V94.md:270 · js/data.js:972 |
| `ky-nang/viemde_w` | Viêm Đế Thần Nông · W «Bách Thảo» | 24×24 | nội tại | herb bundle | Hỏa #E0452C | PROMPT_GEMINI_V94.md:270 · js/data.js:974 |
| `ky-nang/viemde_e` | Viêm Đế Thần Nông · E «Cày Lửa» | 24×24 | chủ động | fire plough | Hỏa #E0452C | PROMPT_GEMINI_V94.md:270 · js/data.js:977 |
| `ky-nang/viemde_r` | Viêm Đế Thần Nông · R «Viêm Đế Giáng Hỏa» | 24×24 | chủ động | falling fire sun | Hỏa #E0452C | PROMPT_GEMINI_V94.md:270 · js/data.js:979 |
| `ky-nang/matroi_q` | Nữ Thần Mặt Trời · Q «Cột Nắng» | 24×24 | chủ động | sun pillar beam | Hỏa #E0452C | PROMPT_GEMINI_V94.md:148 · js/data.js:1122 |
| `ky-nang/matroi_w` | Nữ Thần Mặt Trời · W «Nắng Hạ» | 24×24 | nội tại | summer sun | Hỏa #E0452C | PROMPT_GEMINI_V94.md:148 · js/data.js:1124 |
| `ky-nang/matroi_e` | Nữ Thần Mặt Trời · E «Quạ Lửa Ba Chân» | 24×24 | chủ động | three-legged fire crow | Hỏa #E0452C | PROMPT_GEMINI_V94.md:148 · js/data.js:1127 |
| `ky-nang/matroi_r` | Nữ Thần Mặt Trời · R «Nhật Thực» | 24×24 | chủ động | solar eclipse | Hỏa #E0452C | PROMPT_GEMINI_V94.md:148 · js/data.js:1129 |

## Lô 32 — ky-nang: icon kỹ năng 11/12 — Mẫu Thoải, Thần Trụ Trời, An Dương Vương, Mẫu Thượng Ngàn, Nghê Đồng

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/mauthoai_q` | Mẫu Thoải · Q «Sóng Bạc» | 24×24 | chủ động | silver wave | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:149 · js/data.js:1141 |
| `ky-nang/mauthoai_w` | Mẫu Thoải · W «Nước Thánh» | 24×24 | chủ động | holy water lotus | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:149 · js/data.js:1143 |
| `ky-nang/mauthoai_e` | Mẫu Thoải · E «Băng Ngọc» | 24×24 | chủ động | ice pearl | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:149 · js/data.js:1145 |
| `ky-nang/mauthoai_r` | Mẫu Thoải · R «Long Cung Mở Cửa» | 24×24 | chủ động | underwater palace gate opening | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:149 · js/data.js:1147 |
| `ky-nang/trutroi_q` | Thần Trụ Trời · Q «Dậm Đất» | 24×24 | chủ động | foot stomp crack | Thổ #C99A3C | PROMPT_GEMINI_V94.md:150 · js/data.js:1160 |
| `ky-nang/trutroi_w` | Thần Trụ Trời · W «Cột Đá» | 24×24 | chủ động | stone pillar | Thổ #C99A3C | PROMPT_GEMINI_V94.md:150 · js/data.js:1162 |
| `ky-nang/trutroi_e` | Thần Trụ Trời · E «Thân Đá Núi» | 24×24 | nội tại | stone body | Thổ #C99A3C | PROMPT_GEMINI_V94.md:150 · js/data.js:1164 |
| `ky-nang/trutroi_r` | Thần Trụ Trời · R «Đội Đá Vá Trời» | 24×24 | chủ động | giant rock lifted by hands | Thổ #C99A3C | PROMPT_GEMINI_V94.md:150 · js/data.js:1167 |
| `ky-nang/adv_q` | An Dương Vương · Q «Tên Đồng Nảy» | 24×24 | chủ động | a bronze arrow bouncing between two targets with motion arcs | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:959 · js/data.js:1238 |
| `ky-nang/adv_w` | An Dương Vương · W «Thành Ốc Cổ Loa» | 24×24 | nội tại | a small spiral Co Loa citadel wall seen from above | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:959 · js/data.js:1240 |
| `ky-nang/adv_e` | An Dương Vương · E «Lũy Nỏ Cổ Loa» | 24×24 | chủ động | a fan of five crossbow bolts flying up from a bronze rampart | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:959 · js/data.js:1243 |
| `ky-nang/adv_r` | An Dương Vương · R «Linh Quang Thần Nỏ» | 24×24 | chủ động | a glowing golden turtle-claw crossbow with radiant light | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:959 · js/data.js:1245 |
| `ky-nang/mau_q` | Mẫu Thượng Ngàn · Q «Dây Rừng Trói» | 24×24 | chủ động | green forest vines tying in a knot | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:973 · js/data.js:1257 |
| `ky-nang/mau_w` | Mẫu Thượng Ngàn · W «Rễ Ngàn Năm» | 24×24 | nội tại | thick old tree roots | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:973 · js/data.js:1259 |
| `ky-nang/mau_e` | Mẫu Thượng Ngàn · E «Cây Đa Thần» | 24×24 | chủ động | a sacred banyan tree | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:973 · js/data.js:1262 |
| `ky-nang/mau_r` | Mẫu Thượng Ngàn · R «Rừng Thiêng Nổi Giận» | 24×24 | chủ động | an angry forest: dark trees with glowing eyes and falling leaves | Mộc #5FB84A | PROMPT-THAY-HINH-CODE.txt:973 · js/data.js:1264 |
| `ky-nang/nghedong_q` | Nghê Đồng · Q «Nghê Vồ» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Lao vào 3 quái yếu nhất, x2 sát thương +1 | Kim #D9DDE0 | js/data.js:492 |
| `ky-nang/nghedong_w` | Nghê Đồng · W «Khiên Đồng» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Khiên 20% máu cho tướng quanh mình | Kim #D9DDE0 | js/data.js:494 |
| `ky-nang/nghedong_e` | Nghê Đồng · E «Móng Đồng» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Đánh lan 30% sát thương | Kim #D9DDE0 | js/data.js:496 |
| `ky-nang/nghedong_r` | Nghê Đồng · R «Gầm Rung Đình» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Tiếng gầm rung chuông đình: choáng quái quanh mình 1,5 giây, x3 sát thương +2 | Kim #D9DDE0 | js/data.js:498 |

## Lô 33 — ky-nang: icon kỹ năng 12/12 — Thần Cá Ông, Thần Kim Quy, Kỳ Lân Vàng, Rồng Mẹ Hạ Long, Chúa Sơn Lâm

20 hình · ưu tiên vừa.

| mã | kỹ năng | cỡ | loại | vật vẽ (theo prompt icon cũ / mô tả chiêu) | màu chủ | nguồn |
|---|---|---|---|---|---|---|
| `ky-nang/caong_q` | Thần Cá Ông · Q «Phun Vòi Nước» | 24×24 | chủ động | water spout | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:146 · js/data.js:1082 |
| `ky-nang/caong_w` | Thần Cá Ông · W «Hộ Thuyền» | 24×24 | chủ động | shield over a small boat | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:146 · js/data.js:1084 |
| `ky-nang/caong_e` | Thần Cá Ông · E «Da Cá Voi» | 24×24 | nội tại | whale skin with spikes | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:146 · js/data.js:1086 |
| `ky-nang/caong_r` | Thần Cá Ông · R «Triều Cường» | 24×24 | chủ động | giant tidal wave | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:146 · js/data.js:1089 |
| `ky-nang/kimquy_q` | Thần Kim Quy · Q «Mai Vàng» | 24×24 | chủ động | a golden turtle shell | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:833 · js/data.js:303 |
| `ky-nang/kimquy_w` | Thần Kim Quy · W «Móng Thần» | 24×24 | nội tại | a golden turtle claw | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:833 · js/data.js:305 |
| `ky-nang/kimquy_e` | Thần Kim Quy · E «Địa Chấn» | 24×24 | chủ động | cracked ground with a shockwave | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:833 · js/data.js:308 |
| `ky-nang/kimquy_r` | Thần Kim Quy · R «Kim Quy Hộ Thành» | 24×24 | chủ động | a golden turtle shell shield over a small citadel | Kim #D9DDE0 | PROMPT-THAY-HINH-CODE.txt:833 · js/data.js:310 |
| `ky-nang/kylan_q` | Kỳ Lân Vàng · Q «Sừng Kỳ Lân» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Húc sừng: x2.5 sát thương +1 | Kim #D9DDE0 | js/data.js:530 |
| `ky-nang/kylan_w` | Kỳ Lân Vàng · W «Vảy Vàng» | 24×24 | nội tại | (chưa có prompt icon) gợi từ tên chiêu + mô tả: +10.2% máu, −3% sát thương nhận | Kim #D9DDE0 | js/data.js:532 |
| `ky-nang/kylan_e` | Kỳ Lân Vàng · E «Điềm Lành Giáng» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Tướng xung quanh +25% tốc đánh 5 giây | Kim #D9DDE0 | js/data.js:534 |
| `ky-nang/kylan_r` | Kỳ Lân Vàng · R «Kỳ Lân Phun Lửa» | 24×24 | chủ động | (chưa có prompt icon) gợi từ tên chiêu + mô tả: Phun lửa vàng một dải: x5 sát thương +2 | Kim #D9DDE0 | js/data.js:536 |
| `ky-nang/halong_q` | Rồng Mẹ Hạ Long · Q «Sóng Vịnh» | 24×24 | chủ động | bay wave | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:340 · js/data.js:843 |
| `ky-nang/halong_w` | Rồng Mẹ Hạ Long · W «Vảy Ngọc» | 24×24 | nội tại | jade scale shield | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:340 · js/data.js:845 |
| `ky-nang/halong_e` | Rồng Mẹ Hạ Long · E «Phun Ngọc Thành Đảo» | 24×24 | chủ động | pearl becoming an island | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:340 · js/data.js:847 |
| `ky-nang/halong_r` | Rồng Mẹ Hạ Long · R «Đàn Rồng Giáng Hạ» | 24×24 | chủ động | dragon flock | Thủy #5AB4D6 | PROMPT_GEMINI_V94.md:340 · js/data.js:849 |
| `ky-nang/ongho_q` | Chúa Sơn Lâm · Q «Vồ Mồi» | 24×24 | chủ động | tiger pounce claw | Mộc #5FB84A | PROMPT_GEMINI_V94.md:151 · js/data.js:1180 |
| `ky-nang/ongho_w` | Chúa Sơn Lâm · W «Tiếng Gầm Rừng» | 24×24 | chủ động | roar | Mộc #5FB84A | PROMPT_GEMINI_V94.md:151 · js/data.js:1182 |
| `ky-nang/ongho_e` | Chúa Sơn Lâm · E «Bước Chân Rừng» | 24×24 | nội tại | tiger paw print with leaves | Mộc #5FB84A | PROMPT_GEMINI_V94.md:151 · js/data.js:1184 |
| `ky-nang/ongho_r` | Chúa Sơn Lâm · R «Đại Săn» | 24×24 | chủ động | hunting horn with tiger | Mộc #5FB84A | PROMPT_GEMINI_V94.md:151 · js/data.js:1187 |

## Lô 34 — do: trang bị thường theo loại × độ hiếm (do_<loại>_<độ hiếm>)

20 hình · ưu tiên vừa. Đồ không thuộc bộ dùng chung 1 ảnh theo loại × độ hiếm hiện tại của món (itemPngPath, js/render.js:454): 5 loại (riu/no/gay/mu/giap) × 4 độ hiếm. Màu viền độ hiếm: Thường xám-đồng, Hiếm xanh, Sử thi tím, Huyền thoại vàng nghệ.

| mã | tên | cỡ | độ hiếm | vật vẽ | dấu hiệu 24px | nguồn |
|---|---|---|---|---|---|---|
| `do/do_riu_thuong` | rìu đồng ngắn · Thường (common) | 24×24 | Thường (common) | rìu đồng ngắn: đồng xỉn + gỗ, không ngọc | dáng riu · xỉn | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: riu_dong (Thường), riu_chien (Hiếm), riu_lua (Sử thi) |
| `do/do_riu_hiem` | rìu đồng ngắn · Hiếm (rare) | 24×24 | Hiếm (rare) | rìu đồng ngắn: đồng bóng viền xanh, 1 ngọc xanh nhỏ | dáng riu · ngọc xanh | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: riu_dong (Thường), riu_chien (Hiếm), riu_lua (Sử thi) |
| `do/do_riu_su-thi` | rìu đồng ngắn · Sử thi (epic) | 24×24 | Sử thi (epic) | rìu đồng ngắn: viền bạc-tím, ngọc tím, ánh tím mờ | dáng riu · tím | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: riu_dong (Thường), riu_chien (Hiếm), riu_lua (Sử thi) |
| `do/do_riu_huyen-thoai` | rìu đồng ngắn · Huyền thoại (legendary) | 24×24 | Huyền thoại (legendary) | rìu đồng ngắn: vàng chạm sao mặt trời, ngọc đỏ, ánh vàng | dáng riu · vàng + ngọc đỏ | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: riu_dong (Thường), riu_chien (Hiếm), riu_lua (Sử thi) |
| `do/do_no_thuong` | nỏ tre · Thường (common) | 24×24 | Thường (common) | nỏ tre: đồng xỉn + gỗ, không ngọc | dáng no · xỉn | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: no_tre, no_lim, no_bao |
| `do/do_no_hiem` | nỏ tre · Hiếm (rare) | 24×24 | Hiếm (rare) | nỏ tre: đồng bóng viền xanh, 1 ngọc xanh nhỏ | dáng no · ngọc xanh | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: no_tre, no_lim, no_bao |
| `do/do_no_su-thi` | nỏ tre · Sử thi (epic) | 24×24 | Sử thi (epic) | nỏ tre: viền bạc-tím, ngọc tím, ánh tím mờ | dáng no · tím | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: no_tre, no_lim, no_bao |
| `do/do_no_huyen-thoai` | nỏ tre · Huyền thoại (legendary) | 24×24 | Huyền thoại (legendary) | nỏ tre: vàng chạm sao mặt trời, ngọc đỏ, ánh vàng | dáng no · vàng + ngọc đỏ | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: no_tre, no_lim, no_bao |
| `do/do_gay_thuong` | gậy thầy mo đầu chạm · Thường (common) | 24×24 | Thường (common) | gậy thầy mo đầu chạm: đồng xỉn + gỗ, không ngọc | dáng gay · xỉn | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: gay_mo, gay_ngoc, truong_hu_khong |
| `do/do_gay_hiem` | gậy thầy mo đầu chạm · Hiếm (rare) | 24×24 | Hiếm (rare) | gậy thầy mo đầu chạm: đồng bóng viền xanh, 1 ngọc xanh nhỏ | dáng gay · ngọc xanh | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: gay_mo, gay_ngoc, truong_hu_khong |
| `do/do_gay_su-thi` | gậy thầy mo đầu chạm · Sử thi (epic) | 24×24 | Sử thi (epic) | gậy thầy mo đầu chạm: viền bạc-tím, ngọc tím, ánh tím mờ | dáng gay · tím | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: gay_mo, gay_ngoc, truong_hu_khong |
| `do/do_gay_huyen-thoai` | gậy thầy mo đầu chạm · Huyền thoại (legendary) | 24×24 | Huyền thoại (legendary) | gậy thầy mo đầu chạm: vàng chạm sao mặt trời, ngọc đỏ, ánh vàng | dáng gay · vàng + ngọc đỏ | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: gay_mo, gay_ngoc, truong_hu_khong |
| `do/do_mu_thuong` | mũ lông chim chiến binh · Thường (common) | 24×24 | Thường (common) | mũ lông chim chiến binh: đồng xỉn + gỗ, không ngọc | dáng mu · xỉn | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: mu_long_chim, mu_dong, non_mo (Hiếm), mu_sung (Sử thi) |
| `do/do_mu_hiem` | mũ lông chim chiến binh · Hiếm (rare) | 24×24 | Hiếm (rare) | mũ lông chim chiến binh: đồng bóng viền xanh, 1 ngọc xanh nhỏ | dáng mu · ngọc xanh | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: mu_long_chim, mu_dong, non_mo (Hiếm), mu_sung (Sử thi) |
| `do/do_mu_su-thi` | mũ lông chim chiến binh · Sử thi (epic) | 24×24 | Sử thi (epic) | mũ lông chim chiến binh: viền bạc-tím, ngọc tím, ánh tím mờ | dáng mu · tím | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: mu_long_chim, mu_dong, non_mo (Hiếm), mu_sung (Sử thi) |
| `do/do_mu_huyen-thoai` | mũ lông chim chiến binh · Huyền thoại (legendary) | 24×24 | Huyền thoại (legendary) | mũ lông chim chiến binh: vàng chạm sao mặt trời, ngọc đỏ, ánh vàng | dáng mu · vàng + ngọc đỏ | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: mu_long_chim, mu_dong, non_mo (Hiếm), mu_sung (Sử thi) |
| `do/do_giap_thuong` | áo giáp không tay · Thường (common) | 24×24 | Thường (common) | áo giáp không tay: đồng xỉn + gỗ, không ngọc | dáng giap · xỉn | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: ao_vai, giap_dong, ao_choang_mo + giap_vua (Sử thi) |
| `do/do_giap_hiem` | áo giáp không tay · Hiếm (rare) | 24×24 | Hiếm (rare) | áo giáp không tay: đồng bóng viền xanh, 1 ngọc xanh nhỏ | dáng giap · ngọc xanh | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: ao_vai, giap_dong, ao_choang_mo + giap_vua (Sử thi) |
| `do/do_giap_su-thi` | áo giáp không tay · Sử thi (epic) | 24×24 | Sử thi (epic) | áo giáp không tay: viền bạc-tím, ngọc tím, ánh tím mờ | dáng giap · tím | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: ao_vai, giap_dong, ao_choang_mo + giap_vua (Sử thi) |
| `do/do_giap_huyen-thoai` | áo giáp không tay · Huyền thoại (legendary) | 24×24 | Huyền thoại (legendary) | áo giáp không tay: vàng chạm sao mặt trời, ngọc đỏ, ánh vàng | dáng giap · vàng + ngọc đỏ | tools/build-prompts.js:352 · js/render.js:452 · ITEMS: ao_vai, giap_dong, ao_choang_mo + giap_vua (Sử thi) |

## Lô 35 — do: đồ bộ Lạc Long + Sơn Tinh + Chim Lạc + Trống Đồng (5 món mỗi bộ)

20 hình · ưu tiên vừa. Đồ sau lưng khi đủ bộ (bo-<bộ>_sau-lung.png) là lớp phủ 32×32 sau tướng → ở lô `vfx` (`vfx/sau-lung-<bộ>`, nhánh vfx-kenney), vì nhóm `do` chỉ nhận 24×24.

| mã | tên | cỡ | độ hiếm | vật vẽ | dấu hiệu 24px | nguồn |
|---|---|---|---|---|---|---|
| `do/long_riu` | Long Rìu (Bộ Lạc Long) | 24×24 | Huyền thoại | Lạc Long: vảy rồng xanh ngọc, hoa văn sóng, điểm ngọc trai — rìu #2ecc71, ánh #00ff88 | chất liệu bộ · #2ecc71 | tools/build-prompts.js:355 · js/data.js:1474 |
| `do/long_no` | Long Nỏ (Bộ Lạc Long) | 24×24 | Huyền thoại | Lạc Long: vảy rồng xanh ngọc, hoa văn sóng, điểm ngọc trai — nỏ #2ecc71, ánh #00ff88 | chất liệu bộ · #2ecc71 | tools/build-prompts.js:355 · js/data.js:1483 |
| `do/long_truong` | Long Trượng (Bộ Lạc Long) | 24×24 | Huyền thoại | Lạc Long: vảy rồng xanh ngọc, hoa văn sóng, điểm ngọc trai — gậy #145a32, ánh #00ff88 | chất liệu bộ · #2ecc71 | tools/build-prompts.js:355 · js/data.js:1492 |
| `do/mu_lac_long` | Mũ Lạc Long (Bộ Lạc Long) | 24×24 | Huyền thoại | Lạc Long: vảy rồng xanh ngọc, hoa văn sóng, điểm ngọc trai — mũ #F2D27A | chất liệu bộ · #2ecc71 | tools/build-prompts.js:355 · js/data.js:1503 |
| `do/giap_vay_rong` | Giáp Vảy Rồng (Bộ Lạc Long) | 24×24 | Huyền thoại | Lạc Long: vảy rồng xanh ngọc, hoa văn sóng, điểm ngọc trai — giáp #1F7A78 | chất liệu bộ · #2ecc71 | tools/build-prompts.js:355 · js/data.js:1514 |
| `do/sontinh_riu` | Rìu Đá Tản Viên (Bộ Sơn Tinh) | 24×24 | Sử thi | Sơn Tinh: đá xám khắc + nâu đất, rêu xanh nhỏ, hình đỉnh núi — rìu #8C7A5A, ánh #C99A3C | chất liệu bộ · #C99A3C | tools/build-prompts.js:355 · js/data.js:1668 |
| `do/sontinh_no` | Nỏ Đá Núi (Bộ Sơn Tinh) | 24×24 | Sử thi | Sơn Tinh: đá xám khắc + nâu đất, rêu xanh nhỏ, hình đỉnh núi — nỏ #8C7A5A, ánh #C99A3C | chất liệu bộ · #C99A3C | tools/build-prompts.js:355 · js/data.js:1668 |
| `do/sontinh_gay` | Gậy Đá Núi (Bộ Sơn Tinh) | 24×24 | Sử thi | Sơn Tinh: đá xám khắc + nâu đất, rêu xanh nhỏ, hình đỉnh núi — gậy #8C7A5A, ánh #C99A3C | chất liệu bộ · #C99A3C | tools/build-prompts.js:355 · js/data.js:1668 |
| `do/sontinh_mu` | Mũ Đá Núi (Bộ Sơn Tinh) | 24×24 | Sử thi | Sơn Tinh: đá xám khắc + nâu đất, rêu xanh nhỏ, hình đỉnh núi — mũ #8C7A5A | chất liệu bộ · #C99A3C | tools/build-prompts.js:355 · js/data.js:1668 |
| `do/sontinh_giap` | Giáp Đá Núi (Bộ Sơn Tinh) | 24×24 | Sử thi | Sơn Tinh: đá xám khắc + nâu đất, rêu xanh nhỏ, hình đỉnh núi — giáp #8C7A5A | chất liệu bộ · #C99A3C | tools/build-prompts.js:355 · js/data.js:1668 |
| `do/chimlac_riu` | Rìu Chim Lạc (Bộ Chim Lạc) | 24×24 | Sử thi | Chim Lạc: lông trắng kem trên đồng, đầu chim Lạc, lông đuôi dài — rìu #F2E6C8, ánh #FFF1C4 | chất liệu bộ · #F2E6C8 | tools/build-prompts.js:355 · js/data.js:1670 |
| `do/chimlac_no` | Nỏ Chim Lạc (Bộ Chim Lạc) | 24×24 | Sử thi | Chim Lạc: lông trắng kem trên đồng, đầu chim Lạc, lông đuôi dài — nỏ #F2E6C8, ánh #FFF1C4 | chất liệu bộ · #F2E6C8 | tools/build-prompts.js:355 · js/data.js:1670 |
| `do/chimlac_gay` | Gậy Chim Lạc (Bộ Chim Lạc) | 24×24 | Sử thi | Chim Lạc: lông trắng kem trên đồng, đầu chim Lạc, lông đuôi dài — gậy #F2E6C8, ánh #FFF1C4 | chất liệu bộ · #F2E6C8 | tools/build-prompts.js:355 · js/data.js:1670 |
| `do/chimlac_mu` | Mũ Lông Lạc (Bộ Chim Lạc) | 24×24 | Sử thi | Chim Lạc: lông trắng kem trên đồng, đầu chim Lạc, lông đuôi dài — mũ #F2E6C8 | chất liệu bộ · #F2E6C8 | tools/build-prompts.js:355 · js/data.js:1670 |
| `do/chimlac_giap` | Áo Lông Lạc (Bộ Chim Lạc) | 24×24 | Sử thi | Chim Lạc: lông trắng kem trên đồng, đầu chim Lạc, lông đuôi dài — giáp #F2E6C8 | chất liệu bộ · #F2E6C8 | tools/build-prompts.js:355 · js/data.js:1670 |
| `do/drum_riu` | Rìu Mặt Trống (Bộ Trống Đồng) | 24×24 | Sử thi | Trống Đồng: vàng đồng bóng, vòng mặt trống sao, dải chấm tròn — rìu #C8943A, ánh #F2D27A | chất liệu bộ · #F2D27A | tools/build-prompts.js:355 · js/data.js:1672 |
| `do/drum_no` | Nỏ Mặt Trống (Bộ Trống Đồng) | 24×24 | Sử thi | Trống Đồng: vàng đồng bóng, vòng mặt trống sao, dải chấm tròn — nỏ #C8943A, ánh #F2D27A | chất liệu bộ · #F2D27A | tools/build-prompts.js:355 · js/data.js:1672 |
| `do/drum_gay` | Gậy Dùi Trống (Bộ Trống Đồng) | 24×24 | Sử thi | Trống Đồng: vàng đồng bóng, vòng mặt trống sao, dải chấm tròn — gậy #C8943A, ánh #F2D27A | chất liệu bộ · #F2D27A | tools/build-prompts.js:355 · js/data.js:1672 |
| `do/drum_mu` | Mũ Trống Đồng (Bộ Trống Đồng) | 24×24 | Sử thi | Trống Đồng: vàng đồng bóng, vòng mặt trống sao, dải chấm tròn — mũ #C8943A | chất liệu bộ · #F2D27A | tools/build-prompts.js:355 · js/data.js:1672 |
| `do/drum_giap` | Giáp Trống Đồng (Bộ Trống Đồng) | 24×24 | Sử thi | Trống Đồng: vàng đồng bóng, vòng mặt trống sao, dải chấm tròn — giáp #C8943A | chất liệu bộ · #F2D27A | tools/build-prompts.js:355 · js/data.js:1672 |

## Lô 36 — do: đồ bộ Ngựa Sắt + sính lễ boss + phụ kiện thường (nguyên liệu ghép)

23 hình · ưu tiên vừa.

| mã | tên | cỡ | độ hiếm | vật vẽ | dấu hiệu 24px | nguồn |
|---|---|---|---|---|---|---|
| `do/nguasat_riu` | Rìu Ngựa Sắt (Bộ Ngựa Sắt) | 24×24 | Sử thi | Ngựa Sắt (Gióng): sắt đen, bờm lửa đỏ cam, tàn lửa — rìu #3A3030, ánh #E0452C | chất liệu bộ · #E0452C | tools/build-prompts.js:355 · js/data.js:1674 |
| `do/nguasat_no` | Nỏ Ngựa Sắt (Bộ Ngựa Sắt) | 24×24 | Sử thi | Ngựa Sắt (Gióng): sắt đen, bờm lửa đỏ cam, tàn lửa — nỏ #3A3030, ánh #E0452C | chất liệu bộ · #E0452C | tools/build-prompts.js:355 · js/data.js:1674 |
| `do/nguasat_gay` | Gậy Ngựa Sắt (Bộ Ngựa Sắt) | 24×24 | Sử thi | Ngựa Sắt (Gióng): sắt đen, bờm lửa đỏ cam, tàn lửa — gậy #3A3030, ánh #E0452C | chất liệu bộ · #E0452C | tools/build-prompts.js:355 · js/data.js:1674 |
| `do/nguasat_mu` | Mũ Bờm Lửa (Bộ Ngựa Sắt) | 24×24 | Sử thi | Ngựa Sắt (Gióng): sắt đen, bờm lửa đỏ cam, tàn lửa — mũ #3A3030 | chất liệu bộ · #E0452C | tools/build-prompts.js:355 · js/data.js:1674 |
| `do/nguasat_giap` | Giáp Sắt Đen (Bộ Ngựa Sắt) | 24×24 | Sử thi | Ngựa Sắt (Gióng): sắt đen, bờm lửa đỏ cam, tàn lửa — giáp #3A3030 | chất liệu bộ · #E0452C | tools/build-prompts.js:355 · js/data.js:1674 |
| `do/voi_chin_nga` | Voi Chín Ngà (sính lễ boss · thuong) | 24×24 | Huyền thoại | voi con 9 ngà, khăn yên đỏ, ánh vàng | voi con 9 ngà | tools/build-prompts.js:369 · js/data.js:1562 |
| `do/ga_chin_cua` | Gà Chín Cựa (sính lễ boss · thuong) | 24×24 | Huyền thoại | gà trống 9 cựa, mào đỏ, ánh vàng | gà trống 9 cựa | tools/build-prompts.js:369 · js/data.js:1565 |
| `do/ngua_hong_mao` | Ngựa Chín Hồng Mao (sính lễ boss · hiem) | 24×24 | Huyền thoại | ngựa nhỏ bờm hồng đỏ 9 màu, ánh vàng | ngựa nhỏ bờm hồng đỏ 9 màu | tools/build-prompts.js:369 · js/data.js:1568 |
| `do/ngoc_hoi_sinh` | Ngọc Hồi Sinh (sính lễ boss · quy) | 24×24 | Huyền thoại | ngọc đỏ-vàng phát sáng, hình phượng bên trong, ánh vàng | ngọc đỏ-vàng phát sáng | tools/build-prompts.js:369 · js/data.js:1571 |
| `do/vuot_ho` | Vuốt Hổ | 24×24 | Thường | vuốt hổ xâu dây | vuốt hổ | tools/build-prompts.js:364 · js/data.js:1520 · assets/phu-kien_vuot-ho.png |
| `do/gang_da` | Găng Da | 24×24 | Thường | găng da nâu | găng da | tools/build-prompts.js:364 · js/data.js:1522 · assets/phu-kien_gang-da.png |
| `do/dai` | Đai | 24×24 | Thường | đai tết khoá đồng | đai tết | tools/build-prompts.js:364 · js/data.js:1524 · assets/phu-kien_dai.png |
| `do/dep_co` | Dép Cỏ | 24×24 | Thường | đôi dép cỏ | đôi dép | tools/build-prompts.js:364 · js/data.js:1526 · assets/phu-kien_dep-co.png |
| `do/khan` | Khăn | 24×24 | Thường | khăn vải đỏ buộc đầu | khăn vải | tools/build-prompts.js:365 · js/data.js:1528 · assets/phu-kien_khan.png |
| `do/khan_hien_gia` | Khăn Hiền Giả | 24×24 | Thường | khăn xếp chàm ghim đồng | khăn xếp | tools/build-prompts.js:365 · js/data.js:1530 · assets/phu-kien_khan-hien-gia.png |
| `do/mat_ngoc` | Mắt Ngọc | 24×24 | Thường | bùa ngọc hình mắt | bùa ngọc | tools/build-prompts.js:365 · js/data.js:1532 · assets/phu-kien_mat-ngoc.png |
| `do/ngoc_sinh_luc` | Ngọc Sinh Lực | 24×24 | Thường | ngọc xanh lá phát sáng | ngọc xanh | tools/build-prompts.js:365 · js/data.js:1534 · assets/phu-kien_ngoc-sinh-luc.png |
| `do/mat_trong` | Mặt Trống | 24×24 | Thường | mặt trống đồng phẳng có sao | mặt trống | tools/build-prompts.js:366 · js/data.js:1536 · assets/phu-kien_mat-trong.png |
| `do/dui_trong` | Dùi Trống | 24×24 | Thường | dùi trống gỗ quấn vải | dùi trống | tools/build-prompts.js:366 · js/data.js:1538 · assets/phu-kien_dui-trong.png |
| `do/sung_te` | Sừng Tê | 24×24 | Thường | sừng tê | sừng tê | tools/build-prompts.js:366 · js/data.js:1617 · assets/phu-kien_sung-te.png |
| `do/long_chim_lac` | Lông Chim Lạc | 24×24 | Thường | 1 lông chim Lạc dài | 1 lông | tools/build-prompts.js:366 · js/data.js:1619 · assets/phu-kien_long-chim-lac.png |
| `do/vay_ca` | Vảy Cá | 24×24 | Thường | vảy cá bạc xanh óng | vảy cá | tools/build-prompts.js:367 · js/data.js:1621 · assets/phu-kien_vay-ca.png |
| `do/hat_lua` | Hạt Lúa | 24×24 | Thường | nắm hạt lúa vàng | nắm hạt | tools/build-prompts.js:367 · js/data.js:1623 · assets/phu-kien_hat-lua.png |

## Lô 37 — do: đồ ghép (recipe)

18 hình · ưu tiên vừa. ⚠ `bo_lua` (Bồ Lúa Thần) không có mô tả ảnh trong tools/build-prompts.js (ACC_GHEP thiếu) — mô tả ở đây tự đặt theo tên.

| mã | tên | cỡ | độ hiếm | vật vẽ | dấu hiệu 24px | nguồn |
|---|---|---|---|---|---|---|
| `do/trong_dong` | Trống Đồng = Mặt Trống + Dùi Trống + Bùa Chim Lạc | 24×24 | Huyền thoại | trống đồng Đông Sơn có cóc trên mặt, ánh #F2D27A | trống đồng Đông | tools/build-prompts.js:374 · js/data.js:1541 |
| `do/song_riu` | Song Rìu Cuồng Nộ = Vuốt Hổ + Găng Da | 24×24 | Sử thi | 2 rìu chiến bắt chéo ánh đỏ, ánh #e74c3c | 2 rìu chiến | tools/build-prompts.js:374 · js/data.js:1545 |
| `do/gay_tam_gioi` | Gậy Tam Giới = Gậy Thời Không + Đai + Dép Cỏ | 24×24 | Huyền thoại | gậy 3 vòng trời-đất-nước, ánh #f1c40f | gậy 3 vòng | tools/build-prompts.js:374 · js/data.js:1548 |
| `do/gay_thoi_khong` | Gậy Thời Không = Khăn Hiền Giả + Mắt Ngọc | 24×24 | Sử thi | gậy đầu đồng hồ cát + sao, ánh #4a90e2 | gậy đầu đồng | tools/build-prompts.js:374 · js/data.js:1551 |
| `do/giap_bat_diet` | Giáp Đồng Bất Diệt = Ngọc Sinh Lực + Đai | 24×24 | Sử thi | giáp ngực đồng dày có huy hiệu khiên, ánh #2ecc71 | giáp ngực đồng | tools/build-prompts.js:375 · js/data.js:1554 |
| `do/luoi_hai` | Lưỡi Hái Chí Tử = Vuốt Hổ + Dép Cỏ | 24×24 | Sử thi | lưỡi hái tối ánh tím, ánh #c0392b | lưỡi hái tối | tools/build-prompts.js:375 · js/data.js:1557 |
| `do/mui_sung` | Mũi Sừng Phá Giáp = Sừng Tê + Vuốt Hổ | 24×24 | Sử thi | mũi sừng đâm vỡ khiên, ánh #C8BFA8 | mũi sừng đâm | tools/build-prompts.js:375 · js/data.js:1626 |
| `do/riu_quet` | Rìu Quét Sông = Sừng Tê + Găng Da | 24×24 | Sử thi | rìu bản rộng lưỡi sóng nước, ánh #5AB4D6 | rìu bản rộng | tools/build-prompts.js:375 · js/data.js:1629 |
| `do/cung_mat_chim` | Cung Mắt Chim = Lông Chim Lạc + Mắt Ngọc | 24×24 | Sử thi | cung có mắt chim trên tay cầm, ánh #F2E6C8 | cung có mắt | tools/build-prompts.js:376 · js/data.js:1632 |
| `do/bua_chim_lac` | Bùa Chim Lạc = Lông Chim Lạc + Khăn | 24×24 | Sử thi | bùa chim Lạc đồng dây đỏ, ánh #FFE08A | bùa chim Lạc | tools/build-prompts.js:376 · js/data.js:1635 |
| `do/ao_vay_ca` | Áo Vảy Cá = Vảy Cá + Ngọc Sinh Lực | 24×24 | Sử thi | áo phủ vảy cá bạc, ánh #5AB4D6 | áo phủ vảy | tools/build-prompts.js:376 · js/data.js:1638 |
| `do/ngoc_tran_thuy` | Ngọc Trấn Thủy = Vảy Cá + Mắt Ngọc | 24×24 | Sử thi | ngọc lam trấn thuỷ có sóng lặng bên trong, ánh #2F6FB0 | ngọc lam trấn | tools/build-prompts.js:376 · js/data.js:1641 |
| `do/luoi_ca` | Lưới Đánh Cá = Vảy Cá + Dép Cỏ | 24×24 | Sử thi | lưới cá gấp có phao, ánh #8C7A5A | lưới cá gấp | tools/build-prompts.js:377 · js/data.js:1644 |
| `do/ngoc_minh_chau` | Ngọc Minh Châu = Ngọc Trấn Thủy + Gậy Thời Không | 24×24 | Huyền thoại | ngọc trai trắng rực trên vỏ sò, ánh #9EDDF2 | ngọc trai trắng | tools/build-prompts.js:377 · js/data.js:1648 |
| `do/vuot_kim_quy` | Vuốt Kim Quy = Cung Mắt Chim + Mũi Sừng Phá Giáp | 24×24 | Huyền thoại | lẫy nỏ vuốt rùa vàng, ánh #F2D27A | lẫy nỏ vuốt | tools/build-prompts.js:377 · js/data.js:1651 |
| `do/rui_than` | Rìu Thần Thạch Sanh = Song Rìu Cuồng Nộ + Rìu Quét Sông | 24×24 | Huyền thoại | rìu thần vàng Thạch Sanh toả tia sáng, ánh #FF9A3A | rìu thần vàng | tools/build-prompts.js:377 · js/data.js:1654 |
| `do/ao_long_vu` | Áo Lông Vũ Âu Cơ = Áo Vảy Cá + Giáp Đồng Bất Diệt | 24×24 | Huyền thoại | áo lông vũ trắng Âu Cơ khoá vàng, ánh #F7EEF2 | áo lông vũ | tools/build-prompts.js:378 · js/data.js:1657 |
| `do/bo_lua` | Bồ Lúa Thần = Hạt Lúa + Đai | 24×24 | Sử thi | bồ lúa thần đầy lúa vàng, ánh #E8D070 | bồ lúa thần | js/data.js:1660 |

## Lô 38 — do: trang bị theo mã món (thay icon SVG ART.item vẽ bằng code)

17 hình · ưu tiên vừa. Hiện mỗi món có icon SVG riêng (ART.item, js/art.js:112; NEW_ITEM_ART ở js/ui.js; setItemIcon đổi màu bộ Lạc Long cho 4 bộ khác, js/ui.js:215). Bản pixel: icon theo MÃ MÓN ở lô này; ảnh `do_<loại>_<độ hiếm>` (lô trước) dùng khi món được nâng lên độ hiếm khác bậc gốc — điều phối chọn giữ cả hai hay chỉ một. Túi đồ, ô trang bị, rương thưởng, xu, bạc dùng icon ở lô icon (`ui-menu-2-4`, `o-*`, `ui-menu-1-3`, `vang`, `bac`).

| mã | tên | cỡ | độ hiếm | vật vẽ | dấu hiệu 24px | nguồn |
|---|---|---|---|---|---|---|
| `do/riu_dong` | Rìu Đồng | 24×24 | Thường | rìu màu #C89A4A | dáng axe · màu độ hiếm | js/art.js:113 ART.item · js/ui.js:223 itemIcon · js/data.js:1468 |
| `do/riu_chien` | Rìu Chiến | 24×24 | Hiếm | rìu màu #9E9A90 | dáng axe · màu độ hiếm | js/art.js:114 ART.item · js/ui.js:223 itemIcon · js/data.js:1470 |
| `do/riu_lua` | Rìu Lửa | 24×24 | Sử thi | rìu màu #e67e22, ánh #ff6b00 | dáng axe · màu độ hiếm | js/art.js:115 ART.item · js/ui.js:223 itemIcon · js/data.js:1472 |
| `do/no_tre` | Nỏ Tre | 24×24 | Thường | nỏ màu #C8A040 | dáng crossbow · màu độ hiếm | js/art.js:117 ART.item · js/ui.js:223 itemIcon · js/data.js:1477 |
| `do/no_lim` | Nỏ Gỗ Lim | 24×24 | Hiếm | nỏ màu #6A3A1A | dáng crossbow · màu độ hiếm | js/art.js:118 ART.item · js/ui.js:223 itemIcon · js/data.js:1479 |
| `do/no_bao` | Nỏ Bão | 24×24 | Sử thi | nỏ màu #3498db, ánh #74b9ff | dáng crossbow · màu độ hiếm | js/art.js:119 ART.item · js/ui.js:223 itemIcon · js/data.js:1481 |
| `do/gay_mo` | Gậy Thầy Mo | 24×24 | Thường | gậy màu #8d6e63, ngọc đầu gậy #9EDDF2 | dáng staff · màu độ hiếm | js/art.js:121 ART.item · js/ui.js:223 itemIcon · js/data.js:1486 |
| `do/gay_ngoc` | Gậy Ngọc | 24×24 | Hiếm | gậy màu #b0bec5, ngọc đầu gậy #00cec9, ánh #81ecec | dáng staff · màu độ hiếm | js/art.js:122 ART.item · js/ui.js:223 itemIcon · js/data.js:1488 |
| `do/truong_hu_khong` | Trượng Hư Không | 24×24 | Sử thi | gậy màu #2d3436, ngọc đầu gậy #a29bfe, ánh #6c5ce7 | dáng staff · màu độ hiếm | js/art.js:123 ART.item · js/ui.js:223 itemIcon · js/data.js:1490 |
| `do/mu_long_chim` | Mũ Lông Chim | 24×24 | Thường | mũ lông chim màu #B8402A | dáng feather · màu độ hiếm | js/art.js:125 ART.item · js/ui.js:223 itemIcon · js/data.js:1495 |
| `do/mu_dong` | Mũ Đồng | 24×24 | Hiếm | mũ đồng có chùm màu #B8853A, chùm #c0392b | dáng helm · màu độ hiếm | js/art.js:126 ART.item · js/ui.js:223 itemIcon · js/data.js:1497 |
| `do/mu_sung` | Mũ Sừng | 24×24 | Sử thi | mũ sừng màu #5A4632 | dáng horned · màu độ hiếm | js/art.js:127 ART.item · js/ui.js:223 itemIcon · js/data.js:1499 |
| `do/non_mo` | Nón Thầy Mo | 24×24 | Hiếm | nón thầy mo màu #6c3fa0 | dáng wizard · màu độ hiếm | js/art.js:128 ART.item · js/ui.js:223 itemIcon · js/data.js:1501 |
| `do/ao_vai` | Áo Vải | 24×24 | Thường | áo vải/da màu #a0522d | dáng leather · màu độ hiếm | js/art.js:130 ART.item · js/ui.js:223 itemIcon · js/data.js:1506 |
| `do/giap_dong` | Giáp Đồng | 24×24 | Hiếm | giáp tấm màu #B8853A | dáng plate · màu độ hiếm | js/art.js:131 ART.item · js/ui.js:223 itemIcon · js/data.js:1508 |
| `do/ao_choang_mo` | Áo Choàng Mo | 24×24 | Sử thi | áo choàng phép màu #6c3fa0, áo choàng #4a2a70 | dáng robe · màu độ hiếm | js/art.js:132 ART.item · js/ui.js:223 itemIcon · js/data.js:1510 |
| `do/giap_vua` | Giáp Vua | 24×24 | Sử thi | giáp tấm màu #F2D27A, áo choàng #B8301E | dáng plate · màu độ hiếm | js/art.js:133 ART.item · js/ui.js:223 itemIcon · js/data.js:1512 |

## Lô 39 — an-phu: Ấn Núi + nửa Ấn Gió

18 hình · ưu tiên vừa. Ấn phù = con dấu tròn đá + đồng, vành màu theo nhánh (RUNE_BRANCHES, js/data.js:2046), ký hiệu khắc ở giữa. Hàng 4 (`skill: true`) là ấn kỹ năng — làm nổi hơn (viền đôi / ánh).

| mã | tên ấn | cỡ | loại | ký hiệu khắc giữa con dấu | màu vành nhánh | nguồn |
|---|---|---|---|---|---|---|
| `an-phu/n_dmg` | Lực Núi (Ấn Núi, hàng 1) | 24×24 | ấn chỉ số | kiếm chéo — +1% sát thương | #D9844A | tools/build-prompts.js:148 · js/data.js:2056 · assets/runes/n_dmg.png |
| `an-phu/n_hp` | Gân Đá (Ấn Núi, hàng 1) | 24×24 | ấn chỉ số | trái tim — +1% máu tối đa | #D9844A | tools/build-prompts.js:148 · js/data.js:2057 · assets/runes/n_hp.png |
| `an-phu/n_regen` | Suối Nguồn (Ấn Núi, hàng 1) | 24×24 | ấn chỉ số | suối nước — +1.0 hồi máu / giây | #D9844A | tools/build-prompts.js:148 · js/data.js:2058 · assets/runes/n_regen.png |
| `an-phu/n_pen` | Phá Giáp (Ấn Núi, hàng 2) | 24×24 | ấn chỉ số | cuốc chim — +1% xuyên giáp | #D9844A | tools/build-prompts.js:148 · js/data.js:2059 · assets/runes/n_pen.png |
| `an-phu/n_dr` | Da Đồng (Ấn Núi, hàng 2) | 24×24 | ấn chỉ số | khiên đồng — −1% sát thương nhận | #D9844A | tools/build-prompts.js:148 · js/data.js:2060 · assets/runes/n_dr.png |
| `an-phu/n_boss` | Diệt Chúa (Ấn Núi, hàng 2) | 24×24 | ấn chỉ số | mặt nạ quỷ — +1% sát thương lên boss | #D9844A | tools/build-prompts.js:148 · js/data.js:2061 · assets/runes/n_boss.png |
| `an-phu/n_thorn` | Gai Đá (Ấn Núi, hàng 3) | 24×24 | ấn chỉ số | gai đá — phản 1% sát thương nhận | #D9844A | tools/build-prompts.js:148 · js/data.js:2062 · assets/runes/n_thorn.png |
| `an-phu/n_stun` | Búa Tạ (Ấn Núi, hàng 3) | 24×24 | ấn chỉ số | búa tạ — 1% choáng 0,5 giây mỗi đòn | #D9844A | tools/build-prompts.js:148 · js/data.js:2063 · assets/runes/n_stun.png |
| `an-phu/n_elite` | Săn Tướng (Ấn Núi, hàng 3) | 24×24 | ấn chỉ số | đầu lâu — +1% sát thương lên tinh anh, tướng địch | #D9844A | tools/build-prompts.js:148 · js/data.js:2064 · assets/runes/n_elite.png |
| `an-phu/n_exec` | Núi Đè (Ấn Núi, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | núi đổ — Đòn đánh hạ gục ngay quái thường còn dưới 1% máu | #D9844A | tools/build-prompts.js:148 · js/data.js:2065 · assets/runes/n_exec.png |
| `an-phu/n_shield` | Giáp Đá (Ấn Núi, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | khiên đá — Đầu mỗi đợt, mọi tướng nhận khiên 1% máu tối đa (8 giây) | #D9844A | tools/build-prompts.js:148 · js/data.js:2067 · assets/runes/n_shield.png |
| `an-phu/n_quake` | Đất Rung (Ấn Núi, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | núi lửa — Mỗi đòn thứ 1: chấn động quanh mục tiêu, 60% sát thương và làm chậm 30% | #D9844A | tools/build-prompts.js:148 · js/data.js:2069 · assets/runes/n_quake.png |
| `an-phu/g_haste` | Gió Lướt (Ấn Gió, hàng 1) | 24×24 | ấn chỉ số | xoáy gió — +1% tốc đánh | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2072 · assets/runes/g_haste.png |
| `an-phu/g_crit` | Mắt Sắc (Ấn Gió, hàng 1) | 24×24 | ấn chỉ số | sao 4 cánh — +1% tỉ lệ chí mạng | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2073 · assets/runes/g_crit.png |
| `an-phu/g_range` | Tầm Xa (Ấn Gió, hàng 1) | 24×24 | ấn chỉ số | bia ngắm — +1% tầm đánh | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2074 · assets/runes/g_range.png |
| `an-phu/g_critd` | Đòn Hiểm (Ấn Gió, hàng 2) | 24×24 | ấn chỉ số | tia nổ — +1% sát thương chí mạng | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2075 · assets/runes/g_critd.png |
| `an-phu/g_air` | Bắt Chim (Ấn Gió, hàng 2) | 24×24 | ấn chỉ số | chim ưng — +1% sát thương lên quái bay | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2076 · assets/runes/g_air.png |
| `an-phu/g_slow` | Gió Ngược (Ấn Gió, hàng 2) | 24×24 | ấn chỉ số | xoắn ốc — đòn đánh làm chậm 1% trong 1 giây | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2077 · assets/runes/g_slow.png |

## Lô 40 — an-phu: nửa Ấn Gió + Ấn Sấm

18 hình · ưu tiên vừa.

| mã | tên ấn | cỡ | loại | ký hiệu khắc giữa con dấu | màu vành nhánh | nguồn |
|---|---|---|---|---|---|---|
| `an-phu/g_gold` | Gió Lộc (Ấn Gió, hàng 3) | 24×24 | ấn chỉ số | đồng xu — +1.0 vàng mỗi quái hạ | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2078 · assets/runes/g_gold.png |
| `an-phu/g_leech` | Hút Sinh Lực (Ấn Gió, hàng 3) | 24×24 | ấn chỉ số | giọt máu — hồi máu bằng 1% sát thương gây ra | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2079 · assets/runes/g_leech.png |
| `an-phu/g_cc` | Thừa Thắng (Ấn Gió, hàng 3) | 24×24 | ấn chỉ số | bẫy — +1% sát thương lên quái đang chậm / choáng | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2080 · assets/runes/g_cc.png |
| `an-phu/g_storm` | Gió Lốc (Ấn Gió, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | lốc xoáy — Đòn chí mạng bắn thêm 1 lưỡi gió vào quái gần (60% sát thương) | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2081 · assets/runes/g_storm.png |
| `an-phu/g_frenzy` | Nhanh Như Gió (Ấn Gió, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | tia sét — Hạ quái: +1% tốc đánh 3 giây, cộng dồn 5 lần | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2083 · assets/runes/g_frenzy.png |
| `an-phu/g_eye` | Mắt Ưng (Ấn Gió, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | con mắt — Đòn đầu tiên trúng mỗi quái luôn chí mạng (+1% sát thương chí mạng) | #6FCB8A | tools/build-prompts.js:149 · js/data.js:2085 · assets/runes/g_eye.png |
| `an-phu/s_power` | Linh Lực (Ấn Sấm, hàng 1) | 24×24 | ấn chỉ số | mặt trời toả — +1% sức mạnh kỹ năng | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2088 · assets/runes/s_power.png |
| `an-phu/s_cdr` | Thời Khắc (Ấn Sấm, hàng 1) | 24×24 | ấn chỉ số | đồng hồ cát — −1% hồi chiêu | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2089 · assets/runes/s_cdr.png |
| `an-phu/s_mregen` | Mạch Linh (Ấn Sấm, hàng 1) | 24×24 | ấn chỉ số | giọt nước — +1% hồi năng lượng | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2090 · assets/runes/s_mregen.png |
| `an-phu/s_mpen` | Xuyên Phép (Ấn Sấm, hàng 2) | 24×24 | ấn chỉ số | cầu pha lê — +1% xuyên kháng phép | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2091 · assets/runes/s_mpen.png |
| `an-phu/s_mres` | Bùa Hộ Mệnh (Ấn Sấm, hàng 2) | 24×24 | ấn chỉ số | bùa mắt — −1% sát thương phép nhận | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2092 · assets/runes/s_mres.png |
| `an-phu/s_mmax` | Bình Linh (Ấn Sấm, hàng 2) | 24×24 | ấn chỉ số | bình linh — +1 năng lượng tối đa | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2093 · assets/runes/s_mmax.png |
| `an-phu/s_dot` | Lửa Độc (Ấn Sấm, hàng 3) | 24×24 | ấn chỉ số | ngọn lửa — +1% sát thương thiêu đốt / độc | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2094 · assets/runes/s_dot.png |
| `an-phu/s_kmana` | Hút Hồn (Ấn Sấm, hàng 3) | 24×24 | ấn chỉ số | trăng khuyết — hạ quái hồi 1 năng lượng | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2095 · assets/runes/s_kmana.png |
| `an-phu/s_free` | Phúc Thần (Ấn Sấm, hàng 3) | 24×24 | ấn chỉ số | chuông gió — 1% dùng chiêu không tốn năng lượng | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2096 · assets/runes/s_free.png |
| `an-phu/s_chain` | Sấm Truyền (Ấn Sấm, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | mây sấm — 1% mỗi đòn phóng sét lan 3 quái (50% sát thương phép) | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2097 · assets/runes/s_chain.png |
| `an-phu/s_soul` | Hồn Nổ (Ấn Sấm, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | hồn đầu lâu — Quái bị hạ nổ tung, gây 1% máu tối đa của nó lên quái xung quanh | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2099 · assets/runes/s_soul.png |
| `an-phu/s_echo` | Vang Vọng (Ấn Sấm, hàng 4) | 24×24 | ấn kỹ năng (to, viền đôi) | chuông — 1% dùng chiêu được hoàn lại 50% năng lượng | #7FA8F0 | tools/build-prompts.js:150 · js/data.js:2101 · assets/runes/s_echo.png |

## Lô 41 — than-khi: thần khí 1/3 — Thánh Gióng, Lạc Long Quân, Thần Kim Quy, An Dương Vương, Âu Cơ, Mẫu Thượng Ngàn, Nữ Thần Mặt Trời

21 hình · ưu tiên vừa. Thần khí: 20 tướng Vàng × 3 (LEGACY, js/data.js:2187), icon vật báu có vành vàng, màu theo hành tướng. Game đọc `packs/<tướng>/tk-1…3.png` theo thứ tự (RELIC_PACK, render.js:466).

| mã | thần khí | cỡ | tướng | vật vẽ | màu (hành tướng) | nguồn |
|---|---|---|---|---|---|---|
| `than-khi/giong_giap` | Giáp Sắt | 24×24 | Thánh Gióng (tk-1) | iron armor — Bộ giáp sắt vua Hùng rèn cho cậu bé làng Phù Đổng | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:164 · js/data.js:2189 |
| `than-khi/giong_gay` | Gậy Tre Đằng Ngà | 24×24 | Thánh Gióng (tk-2) | bamboo staff of golden bamboo — Roi sắt gãy, nhổ bụi tre làng quật giặc | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:164 · js/data.js:2191 |
| `than-khi/giong_ngua` | Ngựa Sắt | 24×24 | Thánh Gióng (tk-3) | iron horse head breathing fire — Ngựa sắt phun lửa, vó in thành ao hồ | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:164 · js/data.js:2193 |
| `than-khi/llq_vay` | Vảy Rồng | 24×24 | Lạc Long Quân (tk-1) | dragon scale — Vảy rồng Lạc Việt, sóng nào cũng không xuyên thủng | Thủy, vành vàng | PROMPT_GEMINI_V94.md:165 · js/data.js:2197 |
| `than-khi/llq_kiem` | Kiếm Thủy Long | 24×24 | Lạc Long Quân (tk-2) | water-dragon sword — Thanh kiếm chém Ngư Tinh nơi biển Đông | Thủy, vành vàng | PROMPT_GEMINI_V94.md:165 · js/data.js:2199 |
| `than-khi/llq_cung` | Thủy Cung | 24×24 | Lạc Long Quân (tk-3) | underwater palace — Long cung dưới biển, nơi rồng thiêng ngự | Thủy, vành vàng | PROMPT_GEMINI_V94.md:165 · js/data.js:2201 |
| `than-khi/kimquy_mai` | Mai Thần | 24×24 | Thần Kim Quy (tk-1) | golden turtle shell — Mai rùa vàng che chở thành Cổ Loa | Kim, vành vàng | PROMPT_GEMINI_V94.md:166 · js/data.js:2205 |
| `than-khi/kimquy_mong` | Móng Vàng | 24×24 | Thần Kim Quy (tk-2) | golden turtle claw (crossbow trigger) — Móng rùa thần trao làm lẫy nỏ | Kim, vành vàng | PROMPT_GEMINI_V94.md:166 · js/data.js:2207 |
| `than-khi/kimquy_ho` | Linh Khí Hồ Gươm | 24×24 | Thần Kim Quy (tk-3) | glowing lake with a sword — Linh khí hồ Tả Vọng, nơi rùa thần trở về | Kim, vành vàng | PROMPT_GEMINI_V94.md:166 · js/data.js:2209 |
| `than-khi/adv_no` | Nỏ Liên Châu | 24×24 | An Dương Vương (tk-1) | repeating crossbow — Nỏ bắn một phát mười mũi tên | Kim, vành vàng | PROMPT_GEMINI_V94.md:167 · js/data.js:2213 |
| `than-khi/adv_thanh` | Thành Ốc Cổ Loa | 24×24 | An Dương Vương (tk-2) | spiral citadel walls — Chín vòng thành xoắn ốc giữ nước Âu Lạc | Kim, vành vàng | PROMPT_GEMINI_V94.md:167 · js/data.js:2215 |
| `than-khi/adv_ao` | Long Bào Âu Lạc | 24×24 | An Dương Vương (tk-3) | royal Au Lac robe — Áo vua dựng nước, quân dân một lòng | Kim, vành vàng | PROMPT_GEMINI_V94.md:167 · js/data.js:2217 |
| `than-khi/auco_boc` | Bọc Trăm Trứng | 24×24 | Âu Cơ (tk-1) | egg sac with a hundred eggs — Bọc trứng nở trăm con, tổ tiên người Việt | Thổ, vành vàng | PROMPT_GEMINI_V94.md:168 · js/data.js:2221 |
| `than-khi/auco_canh` | Cánh Tiên | 24×24 | Âu Cơ (tk-2) | fairy wings — Đôi cánh tiên nữ dòng Thần Nông | Thổ, vành vàng | PROMPT_GEMINI_V94.md:168 · js/data.js:2223 |
| `than-khi/auco_nui` | Núi Mẹ | 24×24 | Âu Cơ (tk-3) | mother mountain — Năm mươi con theo mẹ lên núi | Thổ, vành vàng | PROMPT_GEMINI_V94.md:168 · js/data.js:2225 |
| `than-khi/mau_rung` | Rừng Thiêng | 24×24 | Mẫu Thượng Ngàn (tk-1) | sacred forest tree — Đại ngàn ba miền, nơi Mẫu cai quản | Mộc, vành vàng | PROMPT_GEMINI_V94.md:169 · js/data.js:2229 |
| `than-khi/mau_day` | Dây Leo Ngàn Năm | 24×24 | Mẫu Thượng Ngàn (tk-2) | thousand-year vines — Dây rừng quấn chặt chân giặc | Mộc, vành vàng | PROMPT_GEMINI_V94.md:169 · js/data.js:2231 |
| `than-khi/mau_hoa` | Hoa Trái Sơn Lâm | 24×24 | Mẫu Thượng Ngàn (tk-3) | forest fruits and flowers — Hoa trái nuôi muôn dân, độc dược trị giặc | Mộc, vành vàng | PROMPT_GEMINI_V94.md:169 · js/data.js:2233 |
| `than-khi/matroi_vang` | Vầng Dương | 24×24 | Nữ Thần Mặt Trời (tk-1) | sun disk — Mặt trời nữ thần dắt qua bầu trời mỗi ngày | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:170 · js/data.js:2239 |
| `than-khi/matroi_qua` | Quạ Lửa Ba Chân | 24×24 | Nữ Thần Mặt Trời (tk-2) | three-legged crow — Quạ vàng ba chân sống trong mặt trời | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:170 · js/data.js:2241 |
| `than-khi/matroi_xiem` | Xiêm Y Ráng Chiều | 24×24 | Nữ Thần Mặt Trời (tk-3) | sunset-cloud robe — Áo dệt từ ráng mây lúc hoàng hôn | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:170 · js/data.js:2243 |

## Lô 42 — than-khi: thần khí 2/3 — Mẫu Thoải, Thần Trụ Trời, Chúa Sơn Lâm, Kinh Dương Vương, Viêm Đế Thần Nông, Rồng Mẹ Hạ Long, Long Nữ Động Đình

21 hình · ưu tiên vừa.

| mã | thần khí | cỡ | tướng | vật vẽ | màu (hành tướng) | nguồn |
|---|---|---|---|---|---|---|
| `than-khi/mauthoai_ngoc` | Ngọc Thủy Cung | 24×24 | Mẫu Thoải (tk-1) | sea pearl — Viên ngọc trấn giữ long cung | Thủy, vành vàng | PROMPT_GEMINI_V94.md:171 · js/data.js:2247 |
| `than-khi/mauthoai_song` | Sóng Thánh | 24×24 | Mẫu Thoải (tk-2) | holy wave — Sóng dâng theo lệnh Thánh Mẫu | Thủy, vành vàng | PROMPT_GEMINI_V94.md:171 · js/data.js:2249 |
| `than-khi/mauthoai_sen` | Đài Sen Trắng | 24×24 | Mẫu Thoải (tk-3) | white lotus throne — Đài sen Thánh Mẫu ngự giữa sông | Thủy, vành vàng | PROMPT_GEMINI_V94.md:171 · js/data.js:2251 |
| `than-khi/trutroi_cot` | Cột Đá Chống Trời | 24×24 | Thần Trụ Trời (tk-1) | stone sky pillar — Cột đá đắp cao tách trời khỏi đất | Thổ, vành vàng | PROMPT_GEMINI_V94.md:172 · js/data.js:2255 |
| `than-khi/trutroi_tay` | Tay Đội Trời | 24×24 | Thần Trụ Trời (tk-2) | giant hands holding the sky — Đôi tay khổng lồ nâng cả bầu trời | Thổ, vành vàng | PROMPT_GEMINI_V94.md:172 · js/data.js:2257 |
| `than-khi/trutroi_dat` | Đất Mẹ | 24×24 | Thần Trụ Trời (tk-3) | earth mound — Đất đá vụn rơi xuống thành núi đồi | Thổ, vành vàng | PROMPT_GEMINI_V94.md:172 · js/data.js:2259 |
| `than-khi/ongho_vuot` | Vuốt Hổ | 24×24 | Chúa Sơn Lâm (tk-1) | tiger claw — Móng vuốt chúa sơn lâm | Mộc, vành vàng | PROMPT_GEMINI_V94.md:173 · js/data.js:2263 |
| `than-khi/ongho_van` | Vằn Rừng | 24×24 | Chúa Sơn Lâm (tk-2) | tiger stripes with leaves — Bộ lông vằn ẩn mình giữa lau sậy | Mộc, vành vàng | PROMPT_GEMINI_V94.md:173 · js/data.js:2265 |
| `than-khi/ongho_nui` | Núi Rừng Tây Bắc | 24×24 | Chúa Sơn Lâm (tk-3) | northwest mountain forest — Lãnh địa ngàn dặm của Ông Ba Mươi | Mộc, vành vàng | PROMPT_GEMINI_V94.md:173 · js/data.js:2267 |
| `than-khi/kinhduong_kiem` | Kiếm Xích Quỷ | 24×24 | Kinh Dương Vương (tk-1) | red demon-realm sword — Thanh kiếm đỏ rực của vua nước Xích Quỷ | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:276 · js/data.js:2273 |
| `than-khi/kinhduong_ngai` | Ngai Vàng Xích Quỷ | 24×24 | Kinh Dương Vương (tk-2) | golden throne — Ngai vua phương Nam, con cháu Thần Nông | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:276 · js/data.js:2275 |
| `than-khi/kinhduong_ho` | Hồ Động Đình | 24×24 | Kinh Dương Vương (tk-3) | lake with a dragon princess silhouette — Nơi vua gặp Long Nữ, mẹ của Lạc Long Quân | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:276 · js/data.js:2277 |
| `than-khi/viemde_lua` | Lửa Thần Nông | 24×24 | Viêm Đế Thần Nông (tk-1) | sacred farming fire — Ngọn lửa đầu tiên dạy dân nấu chín | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:277 · js/data.js:2281 |
| `than-khi/viemde_cay` | Cày Thần | 24×24 | Viêm Đế Thần Nông (tk-2) | divine plough — Lưỡi cày đầu tiên của người trồng lúa | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:277 · js/data.js:2283 |
| `than-khi/viemde_thao` | Bách Thảo | 24×24 | Viêm Đế Thần Nông (tk-3) | hundred herbs bundle — Trăm thứ cỏ thuốc Thần Nông đã nếm | Hỏa, vành vàng | PROMPT_GEMINI_V94.md:277 · js/data.js:2285 |
| `than-khi/halong_vay` | Vảy Ngọc Rồng | 24×24 | Rồng Mẹ Hạ Long (tk-1) | jade dragon scale — Vảy rồng mẹ lấp lánh như ngọc | Thủy, vành vàng | PROMPT_GEMINI_V94.md:347 · js/data.js:2291 |
| `than-khi/halong_dao` | Ngọc Thành Đảo | 24×24 | Rồng Mẹ Hạ Long (tk-2) | pearl island — Ngọc rồng phun ra hóa nghìn hòn đảo | Thủy, vành vàng | PROMPT_GEMINI_V94.md:347 · js/data.js:2293 |
| `than-khi/halong_vinh` | Vịnh Hạ Long | 24×24 | Rồng Mẹ Hạ Long (tk-3) | Ha Long bay with limestone islets — Nơi rồng mẹ hạ xuống giữ biển | Thủy, vành vàng | PROMPT_GEMINI_V94.md:347 · js/data.js:2295 |
| `than-khi/longnu_chau` | Long Châu | 24×24 | Long Nữ Động Đình (tk-1) | dragon pearl — Viên ngọc rồng của Long Nữ | Thủy, vành vàng | PROMPT_GEMINI_V94.md:348 · js/data.js:2299 |
| `than-khi/longnu_dong` | Hồ Động Đình | 24×24 | Long Nữ Động Đình (tk-2) | Dong Dinh lake — Hồ lớn nơi Long Nữ gặp Kinh Dương Vương | Thủy, vành vàng | PROMPT_GEMINI_V94.md:348 · js/data.js:2301 |
| `than-khi/longnu_mang` | Xiêm Ngọc Long Cung | 24×24 | Long Nữ Động Đình (tk-3) | pearl silk robe — Áo dệt từ ngọc trai dưới long cung | Thủy, vành vàng | PROMPT_GEMINI_V94.md:348 · js/data.js:2303 |

## Lô 43 — than-khi: thần khí 3/3 — Sơn Tinh, Mẫu Địa, Kỳ Lân Vàng, Thiên Lôi, Chú Cuội, Mẹ Lúa

18 hình · ưu tiên vừa.

| mã | thần khí | cỡ | tướng | vật vẽ | màu (hành tướng) | nguồn |
|---|---|---|---|---|---|---|
| `than-khi/tanvien_nui` | Núi Tản Viên | 24×24 | Sơn Tinh (tk-1) | Tan Vien mountain — Ngọn núi thiêng, nước dâng bao nhiêu núi cao bấy nhiêu | Thổ, vành vàng | PROMPT_GEMINI_V94.md:418 · js/data.js:2309 |
| `than-khi/tanvien_gay` | Gậy Thần Dời Non | 24×24 | Sơn Tinh (tk-2) | mountain-moving staff — Cây gậy phép dời đồi chuyển núi | Thổ, vành vàng | PROMPT_GEMINI_V94.md:418 · js/data.js:2311 |
| `than-khi/tanvien_le` | Sính Lễ Vua Hùng | 24×24 | Sơn Tinh (tk-3) | nine-tusk elephant wedding gift — Voi chín ngà, gà chín cựa, ngựa chín hồng mao | Thổ, vành vàng | PROMPT_GEMINI_V94.md:418 · js/data.js:2313 |
| `than-khi/maudia_dat` | Mạch Đất | 24×24 | Mẫu Địa (tk-1) | earth vein lava — Mạch đất nuôi muôn loài | Thổ, vành vàng | PROMPT_GEMINI_V94.md:419 · js/data.js:2317 |
| `than-khi/maudia_re` | Rễ Thiêng | 24×24 | Mẫu Địa (tk-2) | sacred roots — Rễ cây cổ thụ ăn sâu lòng đất | Thổ, vành vàng | PROMPT_GEMINI_V94.md:419 · js/data.js:2319 |
| `than-khi/maudia_ngoc` | Ngọc Địa Phủ | 24×24 | Mẫu Địa (tk-3) | underground jade — Viên ngọc giữ dưới lòng đất sâu | Thổ, vành vàng | PROMPT_GEMINI_V94.md:419 · js/data.js:2321 |
| `than-khi/kylan_sung` | Sừng Kỳ Lân | 24×24 | Kỳ Lân Vàng (tk-1) | Chiếc sừng xua tà, báo điềm lành | Kim, vành vàng | js/data.js:2327 |
| `than-khi/kylan_vay` | Vảy Vàng | 24×24 | Kỳ Lân Vàng (tk-2) | Vảy vàng sáng như mặt trời mọc | Kim, vành vàng | js/data.js:2329 |
| `than-khi/kylan_may` | Mây Lành | 24×24 | Kỳ Lân Vàng (tk-3) | Mây ngũ sắc theo bước kỳ lân | Kim, vành vàng | js/data.js:2331 |
| `than-khi/thienloi_bua` | Búa Tầm Sét | 24×24 | Thiên Lôi (tk-1) | Lưỡi búa đá trời giáng xuống kẻ ác | Kim, vành vàng | js/data.js:2335 |
| `than-khi/thienloi_may` | Mây Giông | 24×24 | Thiên Lôi (tk-2) | Mây đen kéo theo mỗi lần thần nổi giận | Kim, vành vàng | js/data.js:2337 |
| `than-khi/thienloi_giap` | Giáp Thiên Đình | 24×24 | Thiên Lôi (tk-3) | Giáp trời Ngọc Hoàng ban cho | Kim, vành vàng | js/data.js:2339 |
| `than-khi/cuoi_da` | Cây Đa Thần | 24×24 | Chú Cuội (tk-1) | Cây đa có lá cải tử hoàn sinh | Mộc, vành vàng | js/data.js:2343 |
| `than-khi/cuoi_riu` | Rìu Tiều Phu | 24×24 | Chú Cuội (tk-2) | Lưỡi rìu Cuội đốn củi trong rừng | Mộc, vành vàng | js/data.js:2345 |
| `than-khi/cuoi_trang` | Cung Trăng | 24×24 | Chú Cuội (tk-3) | Nơi Cuội ngồi gốc cây đa nhìn xuống | Mộc, vành vàng | js/data.js:2347 |
| `than-khi/melua_bong` | Bông Lúa Vàng | 24×24 | Mẹ Lúa (tk-1) | Bông lúa trĩu hạt mùa gặt | Mộc, vành vàng | js/data.js:2351 |
| `than-khi/melua_dong` | Cánh Đồng Mẹ | 24×24 | Mẹ Lúa (tk-2) | Đồng lúa bát ngát nuôi muôn nhà | Mộc, vành vàng | js/data.js:2353 |
| `than-khi/melua_com` | Nồi Cơm Mới | 24×24 | Mẹ Lúa (tk-3) | Nồi cơm gạo mới thơm cả xóm | Mộc, vành vàng | js/data.js:2355 |

## Lô 44 — vfx: vfx — DO NHÁNH claude/vfx-kenney VẼ (không chia lô cho session khác)

### Tiến độ (claude/vfx-kenney) — lô 1: 30 sprite `tools/pixel/src/vfx/` + hình vẽ bằng ô điểm ảnh trong `js/vfx.js`

Mã nguồn đặt theo nghĩa (một sprite dùng cho nhiều mã danh sách). Hình vòng / tia / đường vẽ bằng code theo lưới điểm ảnh
(`ring`, `seg`, `zig`, `dot` trong `js/vfx.js`), màu bảng chung, không khử răng cưa.

| mã danh sách | đã có bằng | ghi chú |
|---|---|---|
| `dan_fireball` `dan_frostbolt` `dan_arrow` `dan_bolt` `dan_orb` `dan_feather` `dan_petal` `dan_melon` `dan_rice` `dan_evil` | `dan-lua` `dan-bang` `mui-ten` `ne-no` `ngoc` `long-vu` `hoa-sen` `dua` `gao` `ta-khi` | `drawProjectile` (main.js) → `VFX.drawProj` |
| `trung-kim` `trung-moc` `trung-thuy` `trung-hoa` `trung-tho` | `kim-quang` · `la-tre` · `nuoc-ban` · `lua-chay` · `bui-dat` (+ `trung`) | `VFX.onEffect` impact theo hệ tướng bắn |
| `no-hoa`, `fire-burst`, `chet-boss` | `no` (+ `khoi`, vòng trống đồng code) | nổ lan hệ khác: khói + vòng màu hệ |
| `chet-quai`, `dust` | `khoi` | |
| `fire-pillar` `lightning` `set-troi` `slash-gold` `heal` `coins` `hit-spark` | `lua-chay` xếp cột · `set` + tia gấp khúc · `chem` · `hoi` · `xu` · `trung` | |
| `ice-ring` `freeze` `shield-gold` `rocks` `spawn-ring` `ring` `vortex` `meteor` `revive` `volley` `rain` `streak` `warn` | vẽ bằng ô điểm ảnh (`VFX.drawFx`) + `bang-tinh` `tuyet` `bui-dat` `no` | |
| `hat-04` `hat-05` `hat-07` `hat-09` `hat-10` `hat-11` `hat-13` `hat-14` `hat-16` `hat-glow` `hat-leaf` `hat-petal` | `set` `lua-chay` `trung` `bui-dat` `khoi` `chem` (chấm) `gio-xoay` `kim-quang` (ô chấm) `la-tre` `hoa-sen` | hạt (`VFX.emit/burst`) |
| đòn đánh tướng (costume.js `fxImage`, tên ảnh Kenney cũ) | `TEXMAP` trong js/vfx.js → sprite pixel | |
| **ngoài danh sách** — trạng thái trên QUÁI: bỏng · độc · choáng · đóng băng · làm chậm; lên cấp | `lua-chay` · `may-doc` + `bong-doc` · `chim-lac` + `gio-xoay` + vòng xoáy · vỏ băng code + `bang-tinh` · `suong-lanh` + `tuyet` · `len-cap` | `VFX.status` (render.js drawEnemy) |

### Lô 2 (claude/vfx-pixel-2) — thêm 21 sprite + móc pixel

| mã danh sách | đã có bằng | chỗ móc |
|---|---|---|
| `dan-kim` `dan-moc` `dan-thuy` `dan-tho` (`dan-hoa` = `dan-lua`) | sprite cùng tên | `VFX.drawProj`: đạn chung của tướng theo hệ |
| `vat-da-lan` `vat-den-troi` `vat-chai` `vat-binh-gom` `vat-dua-hau` | sprite `vat-*`, `dua` | `drawFx` lob / skyride (đá lăn) |
| `no-kim` `no-moc` `no-thuy` `no-tho` | sprite cùng tên (đổi màu từ `no`) | nổ lan theo hệ (`onEffect` impact splash) |
| `trieu-hoi-ho-ba-vi` `-chim-lac` `-chim-than` `-ngua-sat` `-giong-bay` `-cay-da-than` `-lac-tu` | `ho-ba-vi` `chim-lac` (×2) `chim-than` `ngua-sat` `giong-bay` `cay-da` `lac-tu` | `drawFx` tiger / bird / horse / skyride · `drawZones` tree · `drawBlocks` |
| `tinh-anh-armored` `-regen` `-swift` `-shield` | `khien-giap` `giot-nuoc` `song-cuon` + vòng pixel (shield: màng nước nét đứt) | render.js vòng tinh anh |
| `fx-fire` … `fx-water` (8) | ô điểm ảnh màu theo loại (ma / bóng tối: cụm ô lớn) | `drawEnemyFxBack` |
| `choang-sao` (tướng), `sa-lay` | chim Lạc + xoáy khí trên vòng xoáy · vũng bùn vòng pixel | `drawHeroStun` / main.js · `drawBogWater` |
| `mua` (Thủy Tinh hô mưa), hào quang trống trận / lửa ma | vòng + vạch mưa / chấm lửa pixel | render.js `burnAura` |
| `sweep` `mark` `afterimage` `hook` `mountain-rise` `music-notes` | vẽ bằng ô điểm ảnh | `drawFx` |
| vệt lửa / ruộng lúa / đá núi (zones) | `lua-chay` · bông lúa ô · `vat-da-lan` | `drawZones` |
| `tien-hoa-1..3` `than-tinh-1..3` `khoi-tim` `khoi-vang` `hao-quang-mat-troi` `phu-kien-aura` | vòng hoa văn trống đồng / vòng lửa thần / khói ô / vầng trống đồng 12 tia / ngọc bay quanh (thay ngôi sao) | `drawEvoAura` `drawAscAura` `drawSmokeAura` `drawPackFront` `drawAscStars` `drawSunHalo` `drawAccAura` |

**Còn lại / không làm:** `song-chay` (dòng nước trên đường sông — thuộc nền bản đồ, nhóm `nen`), `flood-rise` (giữ lớp phủ màu cả màn),
`hat-01/02/03/06/08/12/15` (đã quy về sprite / ô qua `TEXMAP`, không cần ảnh riêng), `sao-than-tinh`, chữ `text`/`banner`.
`sau-lung-*`, `trang-phuc-*`, `do-*`, `canh-rong`, `canh-long-vu` (đồ / bộ đồ hiện trên người): **điều phối quyết định không vẽ pixel**
— tướng pixel không hiện đồ trên người, tướng hình cũ giữ lớp đồ cũ.

| mã | tên | cỡ | khung | mô tả | dấu hiệu | nguồn |
|---|---|---|---|---|---|---|
| `vfx/dan-kim` | đạn hệ Kim | 16×16 | 2–3 (xoay/nhấp nháy) | mảnh lưỡi kim loại bạc viền đồng + đuôi tia vàng, bay sang PHẢI | mảnh lưỡi | PROMPT-THAY-HINH-CODE.txt:127 · js/main.js:396 · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan-moc` | đạn hệ Mộc | 16×16 | 2–3 (xoay/nhấp nháy) | phi tiêu lá xanh + dây leo, bay sang PHẢI | phi tiêu | PROMPT-THAY-HINH-CODE.txt:127 · js/main.js:396 · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan-thuy` | đạn hệ Thủy | 16×16 | 2–3 (xoay/nhấp nháy) | cầu nước xanh xoáy trắng + đuôi bắn nước, bay sang PHẢI | cầu nước | PROMPT-THAY-HINH-CODE.txt:127 · js/main.js:396 · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan-hoa` | đạn hệ Hỏa | 16×16 | 2–3 (xoay/nhấp nháy) | cầu lửa đỏ cam lõi vàng + đuôi lửa, bay sang PHẢI | cầu lửa | PROMPT-THAY-HINH-CODE.txt:127 · js/main.js:396 · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan-tho` | đạn hệ Thổ | 16×16 | 2–3 (xoay/nhấp nháy) | cục đất vàng nâu nứt + vệt bụi, bay sang PHẢI | cục đất | PROMPT-THAY-HINH-CODE.txt:127 · js/main.js:396 · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_fireball` | đạn riêng: fireball | 16×16 | 1–3 | cầu lửa nhỏ + đuôi lửa | cầu lửa | PROMPT-THAY-HINH-CODE.txt:372 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_frostbolt` | đạn riêng: frostbolt | 16×16 | 1–3 | mũi băng pha lê xanh nhạt + vệt sương | mũi băng | PROMPT-THAY-HINH-CODE.txt:372 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_arrow` | đạn riêng: arrow | 16×16 | 1–3 | mũi tên gỗ đầu đồng, lông trắng | mũi tên | PROMPT-THAY-HINH-CODE.txt:372 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_bolt` | đạn riêng: bolt | 16×16 | 1–3 | tên nỏ ngắn đầu đồng, ánh vàng | tên nỏ | PROMPT-THAY-HINH-CODE.txt:372 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_orb` | đạn riêng: orb | 16×16 | 1–3 | cầu nước xanh nhạt xoáy trắng | cầu nước | PROMPT-THAY-HINH-CODE.txt:372 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_feather` | đạn riêng: feather | 16×16 | 1–3 | lông ngỗng trắng-hồng sáng | lông ngỗng | PROMPT-THAY-HINH-CODE.txt:390 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_petal` | đạn riêng: petal | 16×16 | 1–3 | cánh sen hồng xoay | cánh sen | PROMPT-THAY-HINH-CODE.txt:390 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_melon` | đạn riêng: melon | 16×16 | 1–3 | dưa hấu nhỏ sọc (An Tiêm, Sọ Dừa) | dưa hấu | PROMPT-THAY-HINH-CODE.txt:390 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_rice` | đạn riêng: rice | 16×16 | 1–3 | bó hạt lúa vàng | bó hạt | PROMPT-THAY-HINH-CODE.txt:390 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/dan_evil` | đạn riêng: evil | 16×16 | 1–3 | cầu nước tà xanh đậm mặt cau có (đạn quái) | cầu nước | PROMPT-THAY-HINH-CODE.txt:390 · js/main.js:376 (PROJ_IMG) · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/vat-da-lan` | đá lăn Phong Châu (Lạc Hầu) | 16×16 | 2–4 (lăn/xoay) | đá lăn Phong Châu (Lạc Hầu) | đá lăn | PROMPT-THAY-HINH-CODE.txt:632 · assets/hieu-ung_da-lan.png · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/vat-den-troi` | đèn trời ném | 16×16 | 2–4 (lăn/xoay) | đèn trời ném | đèn trời | PROMPT-THAY-HINH-CODE.txt:645 · assets/hieu-ung_den-troi.png · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/vat-chai` | chai ném (Ngư Phủ) | 16×16 | 2–4 (lăn/xoay) | chai ném (Ngư Phủ) | chai ném | PROMPT-THAY-HINH-CODE.txt:658 · assets/hieu-ung_chai.png · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/vat-binh-gom` | bình gốm ném (Thợ Gốm) | 16×16 | 2–4 (lăn/xoay) | bình gốm ném (Thợ Gốm) | bình gốm | PROMPT-THAY-HINH-CODE.txt:671 · assets/hieu-ung_binh-gom.png · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/vat-dua-hau` | dưa hấu ném to (An Tiêm, Sọ Dừa) | 16×16 | 2–4 (lăn/xoay) | dưa hấu ném to (An Tiêm, Sọ Dừa) | dưa hấu | PROMPT-THAY-HINH-CODE.txt:684 · assets/hieu-ung_dua-hau.png · (phần: đạn bay (theo hệ + riêng) + vật ném) |
| `vfx/trung-kim` | trúng đòn hệ Kim | 16×16 | 3–4 | tia/mảnh Kim toé ra khi đạn chạm quái | toé nhỏ | PROMPT-THAY-HINH-CODE.txt:146 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/trung-moc` | trúng đòn hệ Mộc | 16×16 | 3–4 | tia/mảnh Mộc toé ra khi đạn chạm quái | toé nhỏ | PROMPT-THAY-HINH-CODE.txt:160 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/trung-thuy` | trúng đòn hệ Thủy | 16×16 | 3–4 | tia/mảnh Thủy toé ra khi đạn chạm quái | toé nhỏ | PROMPT-THAY-HINH-CODE.txt:174 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/trung-hoa` | trúng đòn hệ Hỏa | 16×16 | 3–4 | tia/mảnh Hỏa toé ra khi đạn chạm quái | toé nhỏ | PROMPT-THAY-HINH-CODE.txt:188 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/trung-tho` | trúng đòn hệ Thổ | 16×16 | 3–4 | tia/mảnh Thổ toé ra khi đạn chạm quái | toé nhỏ | PROMPT-THAY-HINH-CODE.txt:202 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/no-kim` | vụ nổ hệ Kim (đạn nổ lan) | 32×32 | 4–6 | vụ nổ tròn màu hệ Kim | quầng nổ | PROMPT-THAY-HINH-CODE.txt:1223 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/no-moc` | vụ nổ hệ Mộc (đạn nổ lan) | 32×32 | 4–6 | vụ nổ tròn màu hệ Mộc | quầng nổ | PROMPT-THAY-HINH-CODE.txt:1237 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/no-thuy` | vụ nổ hệ Thủy (đạn nổ lan) | 32×32 | 4–6 | vụ nổ tròn màu hệ Thủy | quầng nổ | PROMPT-THAY-HINH-CODE.txt:1251 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/no-hoa` | vụ nổ hệ Hỏa (đạn nổ lan) | 32×32 | 4–6 | vụ nổ tròn màu hệ Hỏa | quầng nổ | PROMPT-THAY-HINH-CODE.txt:1265 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/no-tho` | vụ nổ hệ Thổ (đạn nổ lan) | 32×32 | 4–6 | vụ nổ tròn màu hệ Thổ | quầng nổ | PROMPT-THAY-HINH-CODE.txt:1279 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/vong-chieu-kim` | vòng chiêu hệ Kim (dưới chân tướng) | 32×32 | 3–4 | vòng elip phẳng dưới chân, hoa văn trống đồng, màu hệ Kim | elip dưới chân | PROMPT-THAY-HINH-CODE.txt:408 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/vong-chieu-moc` | vòng chiêu hệ Mộc (dưới chân tướng) | 32×32 | 3–4 | vòng elip phẳng dưới chân, hoa văn trống đồng, màu hệ Mộc | elip dưới chân | PROMPT-THAY-HINH-CODE.txt:422 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/vong-chieu-thuy` | vòng chiêu hệ Thủy (dưới chân tướng) | 32×32 | 3–4 | vòng elip phẳng dưới chân, hoa văn trống đồng, màu hệ Thủy | elip dưới chân | PROMPT-THAY-HINH-CODE.txt:436 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/vong-chieu-hoa` | vòng chiêu hệ Hỏa (dưới chân tướng) | 32×32 | 3–4 | vòng elip phẳng dưới chân, hoa văn trống đồng, màu hệ Hỏa | elip dưới chân | PROMPT-THAY-HINH-CODE.txt:450 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/vong-chieu-tho` | vòng chiêu hệ Thổ (dưới chân tướng) | 32×32 | 3–4 | vòng elip phẳng dưới chân, hoa văn trống đồng, màu hệ Thổ | elip dưới chân | PROMPT-THAY-HINH-CODE.txt:464 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/chet-quai` | quái chết (khói tan) | 32×32 | 4–5 | cụm khói xám tan dần | khói tròn | PROMPT-THAY-HINH-CODE.txt:216 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/chet-boss` | boss chết (nổ lớn + cột sáng) | 48×48 | 5–6 | nổ lớn + cột sáng vàng | cột sáng | PROMPT-THAY-HINH-CODE.txt:1293 · (phần: trúng đòn / nổ theo hệ / vòng chiêu / chết) |
| `vfx/fire-pillar` | cột lửa (Thầy Mo) | 48×48 | 4–6 | cột lửa (Thầy Mo) | cột | PROMPT-THAY-HINH-CODE.txt:504 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/fire-burst` | nổ lửa | 32×32 | 4–6 | nổ lửa | nổ | PROMPT-THAY-HINH-CODE.txt:491 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/ice-ring` | vòng băng | 32×32 | 4–6 | vòng băng | vòng | PROMPT-THAY-HINH-CODE.txt:517 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/freeze` | mù sương / đóng băng | 32×32 | 4–6 | mù sương / đóng băng | mù | PROMPT-THAY-HINH-CODE.txt:530 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/water-wave` | sóng nước | 32×32 | 4–6 | sóng nước | sóng | PROMPT-THAY-HINH-CODE.txt:543 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/lightning` | sét | 32×32 | 4–6 | sét | sét | PROMPT-THAY-HINH-CODE.txt:556 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/slash-gold` | chém vàng (30 tướng cận chiến) | 32×32 | 4–6 | chém vàng (30 tướng cận chiến) | chém | PROMPT-THAY-HINH-CODE.txt:230 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/heal` | hồi máu | 32×32 | 4–6 | hồi máu | hồi | PROMPT-THAY-HINH-CODE.txt:569 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/shield-gold` | khiên vàng | 32×32 | 4–6 | khiên vàng | khiên | PROMPT-THAY-HINH-CODE.txt:1320 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/rocks` | đá rơi / nứt đất | 32×32 | 4–6 | đá rơi / nứt đất | đá | PROMPT-THAY-HINH-CODE.txt:1333 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/coins` | rơi đồ / vàng | 32×32 | 4–6 | rơi đồ / vàng | rơi | PROMPT-THAY-HINH-CODE.txt:1346 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/music-notes` | nốt nhạc (Trương Chi, Thạch Sanh) | 32×32 | 4–6 | nốt nhạc (Trương Chi, Thạch Sanh) | nốt | PROMPT-THAY-HINH-CODE.txt:1359 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/spawn-ring` | đặt tướng / triệu hồi | 32×32 | 4–6 | đặt tướng / triệu hồi | đặt | PROMPT-THAY-HINH-CODE.txt:243 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/dust` | bụi khi chết | 32×32 | 4–6 | bụi khi chết | bụi | PROMPT-THAY-HINH-CODE.txt:1307 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/hit-spark` | đòn choáng | 32×32 | 4–6 | đòn choáng | đòn | PROMPT-THAY-HINH-CODE.txt:478 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/flood-rise` | nước dâng cả màn | 48×48 | 4–6 | nước dâng cả màn | nước | PROMPT-THAY-HINH-CODE.txt:1372 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/mountain-rise` | mọc núi | 48×48 | 4–6 | mọc núi | mọc | PROMPT-THAY-HINH-CODE.txt:1385 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/ring` | vòng sóng toả (lên cấp, đánh lan) | 32×32 | 4–6 | vòng sóng toả (lên cấp, đánh lan) | vòng | PROMPT-THAY-HINH-CODE.txt:256 · js/render.js:479 (VFX_FILE) · (phần: dải hiệu ứng chiêu đã có chỗ nhận (vfx/*.png)) |
| `vfx/vortex` | xoáy | 32×32 | 3–6 | xoáy | xoáy | PROMPT-THAY-HINH-CODE.txt:1423 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/sweep` | quét gậy tre | 32×32 | 3–6 | quét gậy tre | quét | PROMPT-THAY-HINH-CODE.txt:594 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/meteor` | thiên thạch / Hoả Sơn | 32×32 | 3–6 | thiên thạch / Hoả Sơn | thiên | PROMPT-THAY-HINH-CODE.txt:1475 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/revive` | hồi sinh | 32×32 | 3–6 | hồi sinh | hồi | PROMPT-THAY-HINH-CODE.txt:1436 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/volley` | loạt tên bắn lên | 32×32 | 3–6 | loạt tên bắn lên | loạt | PROMPT-THAY-HINH-CODE.txt:1449 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/rain` | mưa tên | 32×32 | 3–6 | mưa tên | mưa | PROMPT-THAY-HINH-CODE.txt:619 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/streak` | tia bắn thẳng | 32×32 | 3–6 | tia bắn thẳng | tia | PROMPT-THAY-HINH-CODE.txt:582 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/mark` | dấu săn mục tiêu | 32×32 | 3–6 | dấu săn mục tiêu | dấu | PROMPT-THAY-HINH-CODE.txt:1462 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/warn` | vùng cảnh báo | 32×32 | 3–6 | vùng cảnh báo | vùng | PROMPT-THAY-HINH-CODE.txt:607 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/afterimage` | bóng lướt | 32×32 | 3–6 | bóng lướt | bóng | PROMPT-THAY-HINH-CODE.txt:1398 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/hook` | ném đá tảng / móc kéo | 32×32 | 3–6 | ném đá tảng / móc kéo | ném | PROMPT-THAY-HINH-CODE.txt:1410 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/tinh-anh-armored` | hào quang tinh anh: Vỏ Cứng | 32×32 | 2–4 | +10 giáp — quầng màu #C8BFA8 quanh quái | quầng dưới chân | js/data.js:1914 · js/render.js:2323 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/tinh-anh-regen` | hào quang tinh anh: Nước Thánh | 32×32 | 2–4 | Hồi 3% máu mỗi giây — quầng màu #3EDC4E quanh quái | quầng dưới chân | js/data.js:1915 · js/render.js:2323 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/tinh-anh-swift` | hào quang tinh anh: Sóng Cuốn | 32×32 | 2–4 | Chạy nhanh hơn 40% — quầng màu #9EDDF2 quanh quái | quầng dưới chân | js/data.js:1916 · js/render.js:2323 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/tinh-anh-shield` | hào quang tinh anh: Màng Nước | 32×32 | 2–4 | Khiên chặn sát thương bằng 40% máu — quầng màu #5AB4D6 quanh quái | quầng dưới chân | js/data.js:1917 · js/render.js:2323 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/mua` | mưa (Thủy Tinh hô mưa gọi gió) | 16×16 | 3–4 (lát) | giọt mưa xiên xanh trắng | vệt xiên | js/data.js:1898 (burnAura Thủy Tinh) · js/main.js:1105 · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/set-troi` | sét đánh từ trời | 32×32 | 3 | tia sét zigzag vàng trắng | zigzag | js/main.js:970 (lightning) · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/song-chay` | dòng nước chảy trên đường sông | 16×16 | 3–4 (lát) | vệt sáng gợn chạy dọc đường nước | gợn chạy | js/maps.js:354 (drawPathFx) · (phần: hiệu ứng chiêu còn vẽ bằng code + hào quang tinh anh + thời tiết) |
| `vfx/trieu-hoi-ho-ba-vi` | Hổ Ba Vì vồ (Thần Săn) | 32×32 | 2–4 | hổ vằn cam vồ tới | hổ vằn | PROMPT-THAY-HINH-CODE.txt:1533 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/trieu-hoi-chim-lac` | Chim Lạc (bay) | 32×32 | 2–4 | chim Lạc mỏ dài cánh dài trắng-đồng | chim Lạc | PROMPT-THAY-HINH-CODE.txt:1548 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/trieu-hoi-chim-than` | Chim Thần (An Tiêm) | 32×32 | 2–4 | chim đen ngậm hạt dưa | chim đen | PROMPT-THAY-HINH-CODE.txt:1563 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/trieu-hoi-cay-da-than` | Cây Đa Thần (Mẫu Thượng Ngàn / Cuội) | 48×48 | 2–4 | cây đa tán tròn rễ thòng | cây đa | PROMPT-THAY-HINH-CODE.txt:1488 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/trieu-hoi-lac-tu` | Lạc tử (bọc trăm trứng — Âu Cơ) | 32×32 | 2–4 | trăm trứng nở người con | trăm trứng | PROMPT-HIEU-UNG.txt:336 · js/main.js:550 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/trieu-hoi-ngua-sat` | Ngựa sắt phun lửa (Gióng, chiêu E/R) | 48×48 | 2–4 | ngựa sắt đen bờm lửa, phun lửa | ngựa sắt | PROMPT-THAY-HINH-CODE.txt:1503 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/trieu-hoi-giong-bay` | Gióng bay về trời (R) | 48×48 | 2–4 | Gióng cưỡi ngựa bay lên, vệt lửa | Gióng cưỡi | PROMPT-THAY-HINH-CODE.txt:1518 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-fire` | hiệu ứng quái biến thể: lửa (Tôm Lửa, Sói Cung Lửa, Chằn Lửa) | 32×32 | 3–4 | lớp phủ quanh quái: lửa (Tôm Lửa, Sói Cung Lửa, Chằn Lửa) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-frost` | hiệu ứng quái biến thể: băng (Rắn Băng) | 32×32 | 3–4 | lớp phủ quanh quái: băng (Rắn Băng) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-ghost` | hiệu ứng quái biến thể: khói ma (Dơi Ma) | 32×32 | 3–4 | lớp phủ quanh quái: khói ma (Dơi Ma) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-gold` | hiệu ứng quái biến thể: lấp lánh vàng (Thạch Tinh Vàng) | 32×32 | 3–4 | lớp phủ quanh quái: lấp lánh vàng (Thạch Tinh Vàng) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-steel` | hiệu ứng quái biến thể: ánh thép (Lợn Giáp Sắt) | 32×32 | 3–4 | lớp phủ quanh quái: ánh thép (Lợn Giáp Sắt) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-shadow` | hiệu ứng quái biến thể: bóng tối (Cá Mập Bóng Đêm, Hồ Ly) | 32×32 | 3–4 | lớp phủ quanh quái: bóng tối (Cá Mập Bóng Đêm, Hồ Ly) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-poison` | hiệu ứng quái biến thể: hơi độc (Mực Độc) | 32×32 | 3–4 | lớp phủ quanh quái: hơi độc (Mực Độc) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/fx-water` | hiệu ứng quái biến thể: nước (Tướng Thủy Quân) | 32×32 | 3–4 | lớp phủ quanh quái: nước (Tướng Thủy Quân) | phủ quanh thân | js/enemies2.js:84–106 (`fx`) · js/render.js:2323 (drawEnemyFxBack) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/choang-sao` | tướng bị choáng (sao quay trên đầu) | 16×16 | 3–4 | vòng 3 sao vàng quay | 3 sao | js/main.js:828 (drawHeroStun) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/sa-lay` | tướng sa lầy (nước bùn quanh chân) | 32×32 | 2–3 | vũng bùn nước gợn quanh chân | vũng nâu | js/render.js:1553 (drawBogWater) · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/sau-lung-laclong` | Bộ Lạc Long — đồ sau lưng (đủ bộ) | 32×32 | 1–2 | vật đeo sau lưng tướng khi đủ bộ (bo-lac-long_sau-lung.png): đôi cánh rồng | đọc được sau thân 32px | js/render.js:1674 (drawSetBackPng) · js/render.js:1689 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/sau-lung-sontinh` | Bộ Sơn Tinh — đồ sau lưng (đủ bộ) | 32×32 | 1–2 | vật đeo sau lưng tướng khi đủ bộ (bo-son-tinh_sau-lung.png): đỉnh núi đá | đọc được sau thân 32px | js/render.js:1674 (drawSetBackPng) · js/render.js:1689 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/sau-lung-chimlac` | Bộ Chim Lạc — đồ sau lưng (đủ bộ) | 32×32 | 1–2 | vật đeo sau lưng tướng khi đủ bộ (bo-chim-lac_sau-lung.png): đôi cánh lông chim Lạc | đọc được sau thân 32px | js/render.js:1674 (drawSetBackPng) · js/render.js:1689 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/sau-lung-drum` | Bộ Trống Đồng — đồ sau lưng (đủ bộ) | 32×32 | 1–2 | vật đeo sau lưng tướng khi đủ bộ (bo-trong-dong_sau-lung.png): trống đồng nhỏ | đọc được sau thân 32px | js/render.js:1674 (drawSetBackPng) · js/render.js:1689 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/sau-lung-nguasat` | Bộ Ngựa Sắt — đồ sau lưng (đủ bộ) | 32×32 | 1–2 | vật đeo sau lưng tướng khi đủ bộ (bo-ngua-sat_sau-lung.png): bờm lửa / khói sắt | đọc được sau thân 32px | js/render.js:1674 (drawSetBackPng) · js/render.js:1689 · (phần: triệu hồi / vật thể chiêu + hiệu ứng biến thể quái + trạng thái + đồ sau lưng (đủ bộ)) |
| `vfx/hat-01` | vòng tròn sáng | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: circle_02 circle_03) | vòng tròn sáng | PROMPT-HIEU-UNG.txt:32 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-02` | đốm sáng mềm | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: circle_05 light_03) | đốm sáng mềm | PROMPT-HIEU-UNG.txt:32 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-03` | phép xoáy | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: magic_01 magic_02) | phép xoáy | PROMPT-HIEU-UNG.txt:44 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-04` | phép tia | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: magic_03 magic_05) | phép tia | PROMPT-HIEU-UNG.txt:44 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-05` | lửa | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: fire_01 fire_02) | lửa | PROMPT-HIEU-UNG.txt:56 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-06` | ngọn lửa dài | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: flame_05 flame_06) | ngọn lửa dài | PROMPT-HIEU-UNG.txt:56 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-07` | loé sáng | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: muzzle_02 flare_01) | loé sáng | PROMPT-HIEU-UNG.txt:68 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-08` | vết cháy | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: scorch_01 scorch_02) | vết cháy | PROMPT-HIEU-UNG.txt:68 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-09` | đất văng | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: dirt_01) | đất văng | PROMPT-HIEU-UNG.txt:80 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-10` | khói | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: smoke_03 smoke_07 smoke_09) | khói | PROMPT-HIEU-UNG.txt:80 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-11` | vệt chém | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: slash_01 slash_03) | vệt chém | PROMPT-HIEU-UNG.txt:92 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-12` | vết cào / vệt bay | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: scratch_01 trace_05) | vết cào / vệt bay | PROMPT-HIEU-UNG.txt:92 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-13` | tia lửa | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: spark_01 spark_06) | tia lửa | PROMPT-HIEU-UNG.txt:104 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-14` | xoắn | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: twirl_01 twirl_02) | xoắn | PROMPT-HIEU-UNG.txt:104 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-15` | sao 4–6 cánh | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: star_04 star_06) | sao 4–6 cánh | PROMPT-HIEU-UNG.txt:116 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-16` | sao lấp lánh | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: star_08 star_09) | sao lấp lánh | PROMPT-HIEU-UNG.txt:116 · assets/fx/ · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-glow` | hạt glow (vfx.js) | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: glow) | hạt glow (vfx.js) | js/vfx.js:13 · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-leaf` | lá rơi (vfx.js) | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: leaf) | lá rơi (vfx.js) | js/vfx.js:13 · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/hat-petal` | cánh hoa (vfx.js) | 16×16 | 1–3 | hạt trắng/xám để game nhuộm màu (thay: petal) | cánh hoa (vfx.js) | js/vfx.js:13 · (phần: hạt (thay ảnh Kenney fx/*.png + hạt vẽ code trong vfx.js)) |
| `vfx/tien-hoa-1` | vòng hào quang tiến hoá ★1 | 32×32 | 3–4 | vòng hào quang tiến hoá ★1 | đọc được quanh/ sau tướng 32px | js/render.js:1343 · assets/tien-hoa_1.png · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/tien-hoa-2` | vòng hào quang tiến hoá ★2 | 32×32 | 3–4 | vòng hào quang tiến hoá ★2 | đọc được quanh/ sau tướng 32px | js/render.js:1343 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/tien-hoa-3` | vòng hào quang tiến hoá ★3 | 32×32 | 3–4 | vòng hào quang tiến hoá ★3 | đọc được quanh/ sau tướng 32px | js/render.js:1343 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/than-tinh-1` | Thần tinh TT1: vòng sáng sau đầu | 32×32 | 1–2 | Thần tinh TT1: vòng sáng sau đầu | đọc được quanh/ sau tướng 32px | js/costume.js:9 · js/costume.js:349 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/than-tinh-2` | Thần tinh TT2: 2 ngọc bay quanh | 32×32 | 3–4 | Thần tinh TT2: 2 ngọc bay quanh | đọc được quanh/ sau tướng 32px | js/costume.js:367 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/than-tinh-3` | Thần tinh TT3: vầng trống đồng 12 cánh | 32×32 | 1–2 | Thần tinh TT3: vầng trống đồng 12 cánh | đọc được quanh/ sau tướng 32px | js/costume.js:9 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/sao-than-tinh` | sao Thần tinh trên đầu tướng thần (ui_than-tinh) | 32×32 | 1–2 | sao Thần tinh trên đầu tướng thần (ui_than-tinh) | đọc được quanh/ sau tướng 32px | PROMPT-THAY-HINH-CODE.txt:1211 · js/main.js:714 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/khoi-tim` | khói hào quang tướng Tím | 32×32 | 3–4 | khói hào quang tướng Tím | đọc được quanh/ sau tướng 32px | js/render.js:1427 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/khoi-vang` | khói hào quang tướng Vàng | 32×32 | 3–4 | khói hào quang tướng Vàng | đọc được quanh/ sau tướng 32px | js/render.js:1426 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/hao-quang-mat-troi` | hào quang mặt trời sau lưng (★3 / thần tinh 3) | 32×32 | 3–4 | hào quang mặt trời sau lưng (★3 / thần tinh 3) | đọc được quanh/ sau tướng 32px | js/render.js:1514 (drawSunHalo) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/canh-rong` | cánh rồng (look.wings / bộ Lạc Long) | 32×32 | 1–2 | cánh rồng (look.wings / bộ Lạc Long) | đọc được quanh/ sau tướng 32px | js/render.js:1629 (drawWings) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/canh-long-vu` | cánh lông vũ (bộ Chim Lạc) | 32×32 | 1–2 | cánh lông vũ (bộ Chim Lạc) | đọc được quanh/ sau tướng 32px | js/render.js:1734 (drawFeatherWings) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/phu-kien-aura` | quầng phụ kiện huyền thoại (nhuộm theo look.aura) | 32×32 | 1–2 | quầng phụ kiện huyền thoại (nhuộm theo look.aura) | đọc được quanh/ sau tướng 32px | js/render.js:1375 (drawAccAura) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/trang-phuc-sao-2` | trang phục ★2: giáp vai đồng + đai + băng trán | 32×32 | 1–2 | trang phục ★2: giáp vai đồng + đai + băng trán | đọc được quanh/ sau tướng 32px | js/costume.js:7 · js/costume.js:287 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/trang-phuc-sao-3` | trang phục ★3: áo choàng Đông Sơn + vương miện lông Lạc + mặt trống ngực | 32×32 | 1–2 | trang phục ★3: áo choàng Đông Sơn + vương miện lông Lạc + mặt trống ngực | đọc được quanh/ sau tướng 32px | js/costume.js:8 · js/costume.js:262 · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-mu-long-chim` | lớp phủ đồ trên người: mũ lông chim (feather) | 32×32 | 1 (theo khung tướng) | mũ lông chim (feather), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-mu-dong` | lớp phủ đồ trên người: mũ đồng có chùm (helm) | 32×32 | 1 (theo khung tướng) | mũ đồng có chùm (helm), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-mu-sung` | lớp phủ đồ trên người: mũ sừng (horned) | 32×32 | 1 (theo khung tướng) | mũ sừng (horned), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-non-thay-mo` | lớp phủ đồ trên người: nón thầy mo (wizard) | 32×32 | 1 (theo khung tướng) | nón thầy mo (wizard), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-mu-mien` | lớp phủ đồ trên người: vương miện (crown) | 32×32 | 1 (theo khung tướng) | vương miện (crown), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-ao-da` | lớp phủ đồ trên người: áo da (leather) | 32×32 | 1 (theo khung tướng) | áo da (leather), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-giap-tam` | lớp phủ đồ trên người: giáp tấm (plate) | 32×32 | 1 (theo khung tướng) | giáp tấm (plate), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |
| `vfx/do-ao-choang` | lớp phủ đồ trên người: áo bào + áo choàng (robe/cape) | 32×32 | 1 (theo khung tướng) | áo bào + áo choàng (robe/cape), vẽ đúng chỗ đầu/thân theo neo chân tướng (16,31) | không che mặt | js/render.js:1755–2045 (drawGearArmor/Helmet/Weapon) · (phần: hào quang tiến hoá / thần tinh + lớp phủ trang phục & đồ trên người) |

## Lô 45 — giao-dien: khung bảng + nút

23 hình · ưu tiên cao.

| mã | tên | cỡ | trạng thái/khung | mô tả | ghi chú dựng | nguồn |
|---|---|---|---|---|---|---|
| `giao-dien/khung-bang` | khung bảng / popup giấy dó viền đồng | 48×48 (9 mảnh, góc 16) | 1 | giấy dó kem, viền đồng răng cưa, góc chạm mặt trời | cắt 9-slice | PROMPT-THAY-HINH-CODE.txt:296 · js/ui.js:43 |
| `giao-dien/nut-vang-thuong` | nút chữ nhật vàng — thuong | 48×16 (9-slice) | 1 | vàng đồng, viền răng cưa, đinh sao 2 đầu; thường — sáng, highlight trên | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:309 · css/style.css:1695 |
| `giao-dien/nut-vang-nhan` | nút chữ nhật vàng — nhan | 48×16 (9-slice) | 1 | vàng đồng, viền răng cưa, đinh sao 2 đầu; nhấn — tối, lún 1px | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:309 · css/style.css:1695 |
| `giao-dien/nut-vang-khoa` | nút chữ nhật vàng — khoa | 48×16 (9-slice) | 1 | vàng đồng, viền răng cưa, đinh sao 2 đầu; khoá — xám nâu xỉn | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:309 · css/style.css:1695 |
| `giao-dien/nut-dong-thuong` | nút chữ nhật đồng — thuong | 48×16 (9-slice) | 1 | đồng nâu sẫm viền gỉ xanh, dải chấm tròn; thường | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:309 · js/ui.js:44 |
| `giao-dien/nut-dong-nhan` | nút chữ nhật đồng — nhan | 48×16 (9-slice) | 1 | đồng nâu sẫm viền gỉ xanh, dải chấm tròn; nhấn | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:309 · js/ui.js:44 |
| `giao-dien/nut-dong-khoa` | nút chữ nhật đồng — khoa | 48×16 (9-slice) | 1 | đồng nâu sẫm viền gỉ xanh, dải chấm tròn; khoá | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:309 · js/ui.js:44 |
| `giao-dien/nut-tron-thuong` | nút tròn (quay lại / đóng) — thuong | 16×16 | 1 | đĩa đồng tròn; thường | ký hiệu vẽ đè | PROMPT-THAY-HINH-CODE.txt:697 · js/ui.js:44 |
| `giao-dien/nut-tron-nhan` | nút tròn (quay lại / đóng) — nhan | 16×16 | 1 | đĩa đồng tròn; nhấn | ký hiệu vẽ đè | PROMPT-THAY-HINH-CODE.txt:697 · js/ui.js:44 |
| `giao-dien/nut-tron-khoa` | nút tròn (quay lại / đóng) — khoa | 16×16 | 1 | đĩa đồng tròn; khoá | ký hiệu vẽ đè | PROMPT-THAY-HINH-CODE.txt:697 · js/ui.js:44 |
| `giao-dien/khung-nut-chinh` | nút chính menu (Xuất trận) | 64×16 (9-slice) | 1 | nút vàng lớn |  | css/style.css:1515 · assets/ui/khung-nut-chinh.png |
| `giao-dien/nut-bac` | nút bạc | 48×16 (9-slice) | 1 | nút bạc |  | assets/ui/nut-bac.png |
| `giao-dien/nut-vang` | nút vàng (menu cũ) | 48×16 (9-slice) | 1 | nút vàng |  | assets/ui/nut-vang.png |
| `giao-dien/ui-nen-nut-1` | nền nút 1 | 24×24 | 1 | đĩa trống tròn (nền nút tròn) (giữa trống) |  | tools/build-prompts.js:275 · assets/ui/ui-nen-nut-1.png |
| `giao-dien/ui-nen-nut-2` | nền nút 2 | 48×16 | 1 | tấm chữ nhật viền răng cưa (giữa trống) |  | tools/build-prompts.js:275 · assets/ui/ui-nen-nut-2.png |
| `giao-dien/ui-nen-nut-3` | nền nút 3 | 24×24 | 1 | góc khung vuông dải chấm tròn (giữa trống) |  | tools/build-prompts.js:275 · assets/ui/ui-nen-nut-3.png |
| `giao-dien/ui-nen-nut-4` | nền nút 4 | 24×24 | 1 | huy hiệu tròn nhỏ như đồng xu (giữa trống) |  | tools/build-prompts.js:275 · assets/ui/ui-nen-nut-4.png |
| `giao-dien/thanh-tien-do` | thanh tiến độ (border-image) | 64×8 | 1 | khung thanh đồng 2 đầu chạm | cắt 3 đoạn | css/style.css:1524 |
| `giao-dien/o-do-thuong` | ô đồ (slot) độ hiếm thuong | 20×20 (9-slice) | 1 | nền ô tối + viền đồng xám | thay viền CSS `.slot.rt` | css/style.css:333 `.slot` · js/ui.js:153 rarCls · js/ui.js:2832, 3664, 3702 |
| `giao-dien/o-do-hiem` | ô đồ (slot) độ hiếm hiem | 20×20 (9-slice) | 1 | nền ô tối + viền xanh | thay viền CSS `.slot.rh` | css/style.css:333 `.slot` · js/ui.js:153 rarCls · js/ui.js:2832, 3664, 3702 |
| `giao-dien/o-do-su-thi` | ô đồ (slot) độ hiếm su-thi | 20×20 (9-slice) | 1 | nền ô tối + viền tím | thay viền CSS `.slot.rs` | css/style.css:333 `.slot` · js/ui.js:153 rarCls · js/ui.js:2832, 3664, 3702 |
| `giao-dien/o-do-huyen-thoai` | ô đồ (slot) độ hiếm huyen-thoai | 20×20 (9-slice) | 1 | nền ô tối + viền vàng nghệ + góc sao | thay viền CSS `.slot.rl` | css/style.css:333 `.slot` · js/ui.js:153 rarCls · js/ui.js:2832, 3664, 3702 |
| `giao-dien/o-do-thieu` | ô đồ thiếu nguyên liệu (viền đứt) | 20×20 | 1 | viền nét đứt vàng | thay `.slot.miss` | css/style.css:405 · js/ui.js:3672 |

## Lô 46 — giao-dien: thanh máu, thẻ, khung, huy hiệu, núi Tản Viên

22 hình · ưu tiên cao.

| mã | tên | cỡ | trạng thái/khung | mô tả | ghi chú dựng | nguồn |
|---|---|---|---|---|---|---|
| `giao-dien/thanh-mau-boss` | khung thanh máu boss | 96×12 | 1 | sắt tối + đồng đỏ, đầu trái mặt nạ quỷ sừng, đầu phải gai; lòng trống | lòng trống để game tô | PROMPT-THAY-HINH-CODE.txt:112 · js/ui.js:45 |
| `giao-dien/thanh-mau-tuong` | khung thanh máu tướng | 32×4 | 1 | đồng bóng mảnh, đinh sao 2 đầu | lòng trống | js/main.js:708 |
| `giao-dien/thanh-mau-quai` | khung thanh máu quái | 24×4 | 1 | sắt tối mảnh, móng vuốt 2 đầu | lòng trống | PROMPT-THAY-HINH-CODE.txt:112 |
| `giao-dien/khung-thanh-day` | khung thanh đáy (chợ tướng trong trận) | 160×24 (9-slice) | 1 | thanh đồng dài viền răng cưa | 9-slice | PROMPT-THAY-HINH-CODE.txt:327 |
| `giao-dien/the-cho-thuong` | thẻ chợ tướng — thuong | 40×32 | 1 | khung thẻ ngang 5:4 bo góc, cửa sổ giữa trống (chân dung vẽ vào); đồng trơn (thường) | cửa sổ trống | PROMPT-THAY-HINH-CODE.txt:340 · js/ui.js:45 |
| `giao-dien/the-cho-ghep` | thẻ chợ tướng — ghep | 40×32 | 1 | khung thẻ ngang 5:4 bo góc, cửa sổ giữa trống (chân dung vẽ vào); vàng sáng lấp lánh (ghép được) | cửa sổ trống | PROMPT-THAY-HINH-CODE.txt:340 · js/ui.js:45 |
| `giao-dien/the-cho-thieu` | thẻ chợ tướng — thieu | 40×32 | 1 | khung thẻ ngang 5:4 bo góc, cửa sổ giữa trống (chân dung vẽ vào); xám nứt (thiếu vàng) | cửa sổ trống | PROMPT-THAY-HINH-CODE.txt:340 · js/ui.js:45 |
| `giao-dien/nut-doi-cho` | nút đổi chợ (reroll) | 16×16 | 1 | tấm đồng vuông bo góc, giữa tối |  | PROMPT-THAY-HINH-CODE.txt:340 |
| `giao-dien/khung-the` | khung thẻ tướng | 40×48 (9-slice) | 1 | khung thẻ tướng đồng |  | assets/ui/khung-the.png |
| `giao-dien/khung-the-thuong` | khung thẻ tướng Thường | 40×48 | 1 | viền đồng xám | màu theo độ hiếm | assets/ui_khung-thuong.png |
| `giao-dien/khung-the-tim` | khung thẻ tướng Tím | 40×48 | 1 | viền bạc-tím | chưa có ảnh cũ — thêm cho đủ 3 bậc | js/data.js:113 (RARITY) |
| `giao-dien/khung-the-vang` | khung thẻ tướng Vàng | 40×48 | 1 | viền vàng nghệ chạm sao | màu theo độ hiếm | assets/ui_khung-vang.png |
| `giao-dien/khung-nguoi-choi` | khung người chơi (menu) | 96×32 (9-slice) | 1 | khung tên/ảnh người chơi |  | css/style.css:1527 |
| `giao-dien/dai-thong-bao` | dải thông báo (tên chiêu lớn, boss tới) | 128×24 | 1 | dải lụa đỏ viền đồng 2 đầu đuôi nheo | giữa trống cho chữ | PROMPT-THAY-HINH-CODE.txt:1198 · js/main.js:1147 |
| `giao-dien/ai-mo` | huy hiệu ải trên bản đồ — mở | 24×24 | 1 | đĩa trống đồng viền sao, giữa trống (số ải vẽ đè) |  | PROMPT_GEMINI_FULL.md:1995 · css/style.css:1712 |
| `giao-dien/ai-chon` | huy hiệu ải trên bản đồ — đang chọn (sáng vàng) | 24×24 | 1 | đĩa trống đồng viền sao, giữa trống (số ải vẽ đè) |  | PROMPT_GEMINI_FULL.md:1995 · css/style.css:1712 |
| `giao-dien/ai-khoa` | huy hiệu ải trên bản đồ — khoá (đá xám nứt) | 24×24 | 1 | đĩa trống đồng viền sao, giữa trống (số ải vẽ đè) |  | PROMPT_GEMINI_FULL.md:1995 · css/style.css:1712 |
| `giao-dien/nui-tan-vien-1` | núi Tản Viên bậc 1 (Đắp núi) | 48×48 | 1 | núi xanh bậc 1 (to dần) | cùng nét 5 bậc | PROMPT-THAY-HINH-CODE.txt:1592 · js/render.js:473 · assets/ban-do_nui-1.png |
| `giao-dien/nui-tan-vien-2` | núi Tản Viên bậc 2 (Đắp núi) | 48×48 | 1 | núi xanh bậc 2 (to dần) | cùng nét 5 bậc | PROMPT-THAY-HINH-CODE.txt:1592 · js/render.js:473 · assets/ban-do_nui-2.png |
| `giao-dien/nui-tan-vien-3` | núi Tản Viên bậc 3 (Đắp núi) | 48×48 | 1 | núi xanh bậc 3 (to dần) | cùng nét 5 bậc | PROMPT-THAY-HINH-CODE.txt:1592 · js/render.js:473 · assets/ban-do_nui-3.png |
| `giao-dien/nui-tan-vien-4` | núi Tản Viên bậc 4 (Đắp núi) | 48×48 | 1 | núi xanh bậc 4 (to dần) | cùng nét 5 bậc | PROMPT-THAY-HINH-CODE.txt:1592 · js/render.js:473 · assets/ban-do_nui-4.png |
| `giao-dien/nui-tan-vien-5` | núi Tản Viên bậc 5 (Đắp núi) | 48×48 | 1 | núi xanh bậc 5 (to dần) | cùng nét 5 bậc | PROMPT-THAY-HINH-CODE.txt:1592 · js/render.js:473 · assets/ban-do_nui-5.png |

## Lô 47 — canh: menu + kết quả trận + truyện Sơn Tinh

17 hình · ưu tiên vừa.

| mã | tên | cỡ | khung | nội dung cảnh | ghi chú | nguồn |
|---|---|---|---|---|---|---|
| `canh/nen-menu` | nền menu chính (key-art) | 320×180 | 1 | nhiều truyền thuyết (Sơn Tinh – Thủy Tinh, Gióng, Lạc Long Quân…), chừa nửa trái cho chữ tựa |  | PROMPT_GEMINI_FULL.md:12 · js/ui.js:376 |
| `canh/nen-man-phu` | nền đồng tối cho màn phụ (Chuẩn bị / Kết quả / Thưởng) | 320×180 | 1 | đồng tối hoa văn trống chìm |  | PROMPT-THAY-HINH-CODE.txt:356 |
| `canh/nen-thang` | nền thắng chung | 320×180 | 1 | nắng, cờ, nước rút |  | js/render.js:471 (SCENE_FILE.win) |
| `canh/nen-thua` | nền thua chung | 320×180 | 1 | thành ngập, trời u |  | js/render.js:471 (SCENE_FILE.lose) |
| `canh/thang-sontinh` | Thắng · Sơn Tinh – Thủy Tinh | 320×180 | 1 | nước rút, Sơn Tinh trên núi | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1004 · js/chapters.js:169 |
| `canh/thua-sontinh` | Thua · Sơn Tinh – Thủy Tinh | 320×180 | 1 | Phong Châu thất thủ, nước ngập thành | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1017 · js/chapters.js:169 |
| `canh/thang-thachsanh` | Thắng · Thạch Sanh | 320×180 | 1 | Thạch Sanh: yêu quái tan, làng yên | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1030 · js/chapters.js:172 |
| `canh/thua-thachsanh` | Thua · Thạch Sanh | 320×180 | 1 | yêu quái tràn vào làng | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1043 · js/chapters.js:172 |
| `canh/thang-giong` | Thắng · Thánh Gióng | 320×180 | 1 | Thánh Gióng: giặc Ân tan, Gióng bay về trời | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1056 · js/chapters.js:175 |
| `canh/thua-giong` | Thua · Thánh Gióng | 320×180 | 1 | lửa giặc cháy làng Phù Đổng | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1069 · js/chapters.js:175 |
| `canh/thang-llq` | Thắng · Lạc Long Quân | 320×180 | 1 | Lạc Long Quân: biển lặng | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1082 · js/chapters.js:178 |
| `canh/thua-llq` | Thua · Lạc Long Quân | 320×180 | 1 | sóng dữ tràn bờ | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1095 · js/chapters.js:178 |
| `canh/thang-adv` | Thắng · An Dương Vương | 320×180 | 1 | An Dương Vương: nỏ thần giữ thành | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1108 · js/chapters.js:181 |
| `canh/thua-adv` | Thua · An Dương Vương | 320×180 | 1 | Cổ Loa thất thủ | không có chữ trong ảnh | PROMPT-THAY-HINH-CODE.txt:1121 · js/chapters.js:181 |
| `canh/truyen-sontinh-1` | truyện Sơn Tinh – Thủy Tinh 1 | 320×180 | 1 | Vua Hùng kén rể Mỵ Nương | chương cổ điển (classic) | js/render.js:470 (SCENE_FILE.story1) |
| `canh/truyen-sontinh-2` | truyện Sơn Tinh – Thủy Tinh 2 | 320×180 | 1 | Sơn Tinh mang sính lễ đến trước | chương cổ điển (classic) | js/render.js:470 (SCENE_FILE.story2) |
| `canh/truyen-sontinh-3` | truyện Sơn Tinh – Thủy Tinh 3 | 320×180 | 1 | Thủy Tinh dâng nước đánh Sơn Tinh | chương cổ điển (classic) | js/render.js:470 (SCENE_FILE.story3) |

## Lô 48 — canh: bản đồ chương + nền truyện + nền bản đồ chủ đề

20 hình · ưu tiên thấp. Nền bản đồ trong trận nên ghép từ ô `nen/` (lô nền). 7 mã `canh/ban-do-*` chỉ là dự phòng / ảnh thẻ chế độ (ui.js:940 dùng maps/nen-bien.jpg).

| mã | tên | cỡ | khung | nội dung cảnh | ghi chú | nguồn |
|---|---|---|---|---|---|---|
| `canh/chuong-sontinh` | bản đồ chọn ải · Sơn Tinh – Thủy Tinh | 320×180 | 1 | bản đồ chương (ải 1–8), chừa chỗ cho huy hiệu ải |  | PROMPT-THAY-HINH-CODE.txt:1134 · js/ui.js:1215 |
| `canh/chuong-thachsanh` | bản đồ chọn ải · Thạch Sanh | 320×180 | 1 | bản đồ chương (ải 9–11), chừa chỗ cho huy hiệu ải |  | PROMPT-THAY-HINH-CODE.txt:1146 · js/ui.js:1215 |
| `canh/chuong-giong` | bản đồ chọn ải · Thánh Gióng | 320×180 | 1 | bản đồ chương (ải 12–13), chừa chỗ cho huy hiệu ải |  | PROMPT-THAY-HINH-CODE.txt:1158 · js/ui.js:1215 |
| `canh/chuong-llq` | bản đồ chọn ải · Lạc Long Quân | 320×180 | 1 | bản đồ chương (ải 14–15), chừa chỗ cho huy hiệu ải |  | PROMPT-THAY-HINH-CODE.txt:1170 · js/ui.js:1215 |
| `canh/chuong-adv` | bản đồ chọn ải · An Dương Vương | 320×180 | 1 | bản đồ chương (ải 16–17), chừa chỗ cho huy hiệu ải |  | PROMPT-THAY-HINH-CODE.txt:1182 · js/ui.js:1215 |
| `canh/truyen-nen-rung` | nền tranh truyện: rung | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề rung; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-dem` | nền tranh truyện: dem | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề dem; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-hang` | nền tranh truyện: hang | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề hang; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-dong` | nền tranh truyện: dong | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề dong; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-nui` | nền tranh truyện: nui | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề nui; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-bien` | nền tranh truyện: bien | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề bien; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-dam` | nền tranh truyện: dam | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề dam; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/truyen-nen-thanh` | nền tranh truyện: thanh | 320×180 | 1 | phông nền truyện (trời–giữa–đất) chủ đề thanh; nhân vật pixel vẽ chồng lên | không nhân vật | js/chapters.js:116 (STORY_BG) |
| `canh/ban-do-song` | nền bản đồ chủ đề song (dự phòng) | 320×180 | 1 | nền bản đồ song: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-song.jpg |
| `canh/ban-do-dam` | nền bản đồ chủ đề dam (dự phòng) | 320×180 | 1 | nền bản đồ dam: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-dam.jpg |
| `canh/ban-do-rung` | nền bản đồ chủ đề rung (dự phòng) | 320×180 | 1 | nền bản đồ rung: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-rung.jpg |
| `canh/ban-do-hang` | nền bản đồ chủ đề hang (dự phòng) | 320×180 | 1 | nền bản đồ hang: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-hang.jpg |
| `canh/ban-do-dong` | nền bản đồ chủ đề dong (dự phòng) | 320×180 | 1 | nền bản đồ dong: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-dong.jpg |
| `canh/ban-do-bien` | nền bản đồ chủ đề bien (dự phòng) | 320×180 | 1 | nền bản đồ bien: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-bien.jpg |
| `canh/ban-do-thanh` | nền bản đồ chủ đề thanh (dự phòng) | 320×180 | 1 | nền bản đồ thanh: giữa trống, chi tiết ở mép (không vẽ đường) | chỉ cần nếu không ghép từ ô nền | js/render.js:524 · assets/maps/nen-thanh.jpg |

## Đối chiếu: hình đang vẽ bằng code → mã pixel

Quét bằng `grep -n` (emoji, ký hiệu ★✦✓↻♾🔒➜▲🗑▶… , `<svg`, CSS) trong js/ui.js, js/main.js, js/render.js, js/game.js, js/art.js, js/roles.js, js/chapters.js, css/style.css, index.html. Ký hiệu chỉ nằm trong chú thích code / văn bản hướng dẫn (→, ↓, ↔ trong toast/mẹo) giữ nguyên chữ. Mục nào chưa có mã ở các lô trên đã được thêm ở lô "nút & icon UI còn vẽ bằng code".

| đang vẽ bằng code | chỗ vẽ (file:dòng · hàm/selector) | mã pixel thay |
|---|---|---|
| ★ (UIE.star) | js/ui.js:72 UIE | `icon/ui-tran-4-1` |
| ★ lặp chỉ cấp sao (HTML), drawStar vàng/cam trên đầu tướng | js/ui.js:1760, 1867, 2289, 2796 ('★'.repeat) · js/main.js:720 · js/render.js:37 drawStar | `icon/sao-cap`, `icon/sao-than-tinh-nho` |
| ▲ (UIE.equip, mũi tên nâng `.upa`) | js/ui.js:72, 2867, 3704, 3808 | `icon/ui-tran-4-2`, `icon/nang-cap` |
| 🔒 (UIE.lock), MK_LOCK, SVG_LOCK, ICON.lock | js/ui.js:22, 70, 72, 87, 3219 | `icon/ui-tran-4-3`, `icon/khoa-mo`, `icon/khoa-dong` |
| ↻ (UIE.redo, EMO_ART) | js/ui.js:72, 76 | `icon/ui-tran-4-4` |
| 💡 (UIE.tip, FB_KINDS ý tưởng) | js/ui.js:73, 309 | `icon/ui-tran-5-1` |
| ♾ (UIE.endless, chỉ số vô tận) | js/ui.js:73, 642, 656, 873, 942, 1221 · css/style.css:1494 | `icon/ui-tran-5-2` |
| ⚔ (UIE.battle, EMO_ART) | js/ui.js:73, 76 | `icon/ui-tran-5-3` |
| ✓ (UIE.done, điều kiện, đã gửi) | js/ui.js:73, 1513, 1868, 1869, 2518, 2589, 2727, 4005 | `icon/ui-tran-5-4`, `icon/svg-check` |
| ✗ | js/ui.js:4005 | `icon/sai` |
| 🥇🥈🥉👑 (UIE.medal) | js/ui.js:74 | `icon/ui-huy-chuong-1…4` |
| 👑 ngăn kéo Anh Hùng | index.html:62 `.dw-btn[data-k=heroes] .ic` | `icon/ui-menu-1-2` |
| 🔥 Khó / EMO_ART | js/ui.js:76, 1234 | `icon/kho`, `icon/hanh-hoa` |
| 🌊 EMO_ART | js/ui.js:76 | `icon/hanh-thuy` |
| ⛰ EMO_ART, Bồi đắp núi | js/ui.js:76, 4062 | `icon/ui-tran-3-3` |
| ⚒ Lò đúc, ART.ui.forge | js/ui.js:77, 771 · js/art.js:166 | `icon/lo-duc` |
| 🎒 Túi đồ | index.html:50 (`.ab .i`), 61 · js/ui.js:77, 459 | `icon/ui-menu-2-4` |
| 🔯 Ấn Phù | index.html:63, 98 · js/ui.js:77, 2786 | `icon/ui-menu-1-4` |
| 📖 📜 Bách khoa / Công thức, CODEX_SVG | index.html:64, 101 · js/ui.js:77, 78, 3652 | `icon/ui-menu-2-2` |
| ⏸ Tạm dừng | index.html:65 · js/ui.js:77 | `icon/ui-tran-1-2` |
| 🎁 rương / sính lễ | js/ui.js:77, 4179 · js/main.js:1838 (rương rơi, hộp + sao) | `icon/ui-menu-1-3` |
| 🏆 Xếp hạng | index.html:101 `#btn-ranks` · js/ui.js:77 | `icon/ui-menu-2-3` |
| 👁 chi tiết | index.html:36 `#btn-detail` · js/ui.js:466 | `icon/ui-tran-1-4` |
| 🗑 huỷ tướng / xoá | js/ui.js:1622, 2349 · js/main.js:152 | `icon/ui-tran-2-4` |
| ⬆ Nâng đồ | index.html:51 | `icon/ui-tran-2-2` |
| 🛡 Mặc đồ | index.html:52 | `icon/ui-tran-2-3` |
| ✸ hợp thể | js/ui.js:2404 | `icon/ui-tran-3-2` |
| ⇄ ghép tự động | js/ui.js:2196 | `icon/ghep-tu-dong` |
| ✦ luyện thể / thần tinh / hiệu ứng ẩn | js/ui.js:276, 2247, 2252, 2403 | `icon/sao-than-tinh-nho` |
| ✕ đóng / bỏ lọc | js/ui.js:1123 (`.ch-x`), 1634, 1883 (`.hx-x`) · ICON.close | `icon/svg-close` |
| ✕ quái đã hạ | js/ui.js:2948 | `icon/quai-ha` |
| ? trợ giúp | js/ui.js:1883 `.hx-q` | `icon/hoi` |
| ▶ / SVG play-stop | js/ui.js:764, 1258 · index.html:38 `#btn-run` · ICON.play/stop | `icon/svg-play`, `icon/svg-stop` |
| ≡ menu (SVG 3 gạch) | index.html:40 `#btn-menu` · ART.ui.menu | `icon/ui-tran-2-1` |
| < quay lại (ICON.back) | js/ui.js:20 ICON.back | `icon/ui-tran-3-4` |
| x1 / x2 / x3 | index.html:37 `#btn-speed` · js/ui.js:518 | `icon/toc-do-x1/x2/x3` |
| 💬 trò chuyện / góp ý khác | index.html:39 · js/ui.js:309, 1123 | `icon/chat` |
| ✉ góp ý | index.html:66, 101 · js/ui.js:1272, 1457 | `icon/gop-y` |
| 📥 góp ý nhận | js/ui.js:1544, 1547, 1628 | `icon/hop-thu` |
| 🏳 dừng chơi | index.html:67 | `icon/dau-hang` |
| 🐞 ⚖ (FB_KINDS) | js/ui.js:309 | `icon/gy-loi`, `icon/gy-can-bang` |
| ✎ 📝 | js/ui.js:642, 876, 1619, 1620 | `icon/but` |
| 💌 | js/ui.js:1536 | `icon/thu-tim` |
| ☀ nhiệm vụ ngày | js/ui.js:818, 2954, 2955 | `icon/nhiem-vu-ngay` |
| ◻ | js/ui.js:746 | `icon/o-trong` |
| 🤝 | js/ui.js:945, 2960, 2986 | `icon/choi-nhom` |
| 🌿 🍄 Linh Chi | js/ui.js:651, 4060, 4061 | `icon/linh-chi` |
| ➜ ↳ | js/ui.js:2719, 3680, 3939, 3971, 3972 · css/style.css:1612, 2071 | `icon/mui-ten-phai`, `icon/mui-ten-nhanh` |
| ● ◆ | js/ui.js:1632, 2862, 3672, 3714, 3744, 3833 | `icon/cham-tron`, `icon/thuoc-tinh-phu` |
| ⚜ ⚑ ⚠ | js/ui.js:2780, 2946, 3902 | `icon/than-khi`, `icon/co-dot`, `icon/canh-bao` |
| 💧 👹 🔥 🌊 🏹 (CH_THEME.ic) | js/chapters.js:170–182 | `icon/ch-sontinh…ch-adv` |
| SVG index.html: tim mạng, mắt ẩn/hiện, nút menu chính (chéo kiếm, +, 2 người, túi, bánh răng) | index.html:32, 35, 80, 96–100 | `icon/tim-mang`, `icon/mat-an-hien`, `icon/ui-menu-1-1`, `icon/choi-moi`, `icon/ui-menu-1-2`, `icon/ui-menu-1-3`, `icon/ui-menu-2-1` |
| ICON {close back check lock up dup swap mount bag star stop play} | js/ui.js:19–31 | `icon/svg-*`, `icon/ui-tran-3-4`, `icon/ui-tran-4-3`, `icon/ui-tran-3-3` |
| ART.ui {coin heart drop mountain lock star upgrade swap sell forge book menu play stop} | js/art.js:156–171 | `vang`, `mang`, `nang-luong`, `ui-tran-3-3`, `khoa-dong`, `sao-cap`, `nang-cap`, `svg-swap`, `ui-tran-2-4`, `lo-duc`, `ui-menu-2-2`, `ui-tran-2-1`, `svg-play`, `svg-stop` |
| IC_SVG (44 icon nhỏ) | js/ui.js:96–142 ic() | `icon/<tên>` lô 15–17 |
| EL_PATH / elIcon / elDot (ngũ hành) | js/ui.js:240, 247, 4210 | `icon/hanh-*` |
| roleIcon / roleChip (vai trò) | js/roles.js:92, 99 | `icon/vai-*` |
| xu CSS `.coin`, bạc CSS `.bac`, coin()/bac() | css/style.css:80, 1409 · js/ui.js:64, 65 | `icon/vang`, `icon/bac` |
| xu rơi trên bản đồ (vẽ tròn) | js/main.js:1805 | `icon/vang` |
| độ hiếm: màu `.c-*`, viền ô `.slot.rt/rh/rs/rl`, `.slot.miss` | css/style.css:333, 348, 405 · js/ui.js:153 rarCls | `icon/do-hiem-*`, `giao-dien/o-do-*` |
| ô trang bị trống | css/style.css:333 `.slot` · js/data.js:85 SLOT_NAMES | `icon/o-vu-khi/o-mu/o-giap/o-phu-kien` |
| icon đồ SVG: ART.item, NEW_ITEM_ART, setItemIcon (đổi màu bộ) | js/art.js:112 · js/ui.js:200–231 itemIcon | `do/<mã món>` lô 34–38 |
| icon kỹ năng SVG (ART.skill) | js/art.js:13 · js/ui.js:168 skillIcon | `ky-nang/<tướng>_<q/w/e/r>` |
| icon ấn phù (emoji `ic` trong RUNES) | js/data.js:2054 RUNES[].ic | `an-phu/<id>` |
| icon thần khí (emoji `ic` trong LEGACY) | js/data.js:2187 LEGACY[].ic | `than-khi/<tướng>_<id>` |
| khung thẻ tướng theo bậc (`.dk-pt`, ui_khung-*) | js/ui.js:2247 | `giao-dien/khung-the-*` |
| thanh máu vẽ canvas | js/main.js:708 · js/render.js:2340 drawEnemyStatus | `giao-dien/thanh-mau-*` |
| chân dung quái / tướng vẽ lại bằng canvas | js/render.js:2396 drawEnemyIcon, 2413 drawHeroPortrait | chân dung tự cắt từ `tuong/`, `quai/`, `boss/` |
| ♪ ♫ nốt nhạc, drawStar choáng | js/render.js:2267, 2272 · js/main.js:751, 840, 1628 | `vfx/music-notes`, `vfx/choang-sao` |

## Mâu thuẫn giữa các nguồn

Thứ tự ưu tiên: **PROMPT-GEN-LAI > PROMPT-DUNG-XUONG > prompts-*.csv > cũ hơn** (PROMPT_GEMINI_V94/FULL, PROMPT-THAY-HINH-CODE). `HEROES[*].look.weapon` trong js/data.js chỉ là kiểu vũ khí của hình vector cũ, KHÔNG phải nguồn đặc trưng — khi khác prompt thì theo prompt (ghi ⚠ ở dòng).

**Tướng — vật cầm**

- `xathu`: GEN-LAI cung (ảnh cũ cầm đao) ↔ game `look = crossbow`, title "Nỏ tre" → vẽ **cung**.
- `thosan`: DUNG-XUONG/CSV hai dao săn ↔ GEN-LAI giữ cung (game bow) → **cung**.
- `lucsi`: game `cleaver` ↔ GEN-LAI/DUNG-XUONG tay không ném **tảng đá**.
- `thansuong`: game `staff + orb` ↔ GEN-LAI **tinh thể băng**, không vũ khí.
- `ongthoi`: DUNG-XUONG **ống thổi** ↔ GEN-LAI giữ ảnh nỏ, game crossbow → chọn ống thổi (đúng tên tướng).
- `chantrau`: DUNG-XUONG/CSV ná cao su ↔ GEN-LAI giữ **gậy đầu trâu** (game `club`).
- `dapde`: GEN-LAI chỉ ghi "farmer" ↔ DUNG-XUONG **nữ** → giữ nữ.
- `lachau`: DUNG-XUONG/CSV cán cờ chim Lạc ↔ GEN-LAI + title game **búa đá + khiên đồng**.
- `thansan`: DUNG-XUONG/CSV giáo tre ↔ GEN-LAI + game (saber) **đao rừng**.
- `llq`: DUNG-XUONG/CSV kiếm dài ↔ GEN-LAI + game **giáo**.
- `tanvien` (Sơn Tinh): DUNG-XUONG núi nhỏ lơ lửng + sách phép (CSV "magic book on the belt") ↔ GEN-LAI + game **giáo** → giáo, núi nhỏ ở khung cast.
- `giong`: DUNG-XUONG bụi tre nhổ gốc cháy ↔ GEN-LAI giữ giáo ("gậy sắt / tre") ↔ game "Gậy Tre Ngà" → ~~gậy tre~~ **GẬY SẮT** theo quyết định điều phối (mẫu đã duyệt); nhổ tre / lửa thể hiện ở chiêu.
- `cuoi`: DUNG-XUONG rìu ↔ GEN-LAI ảnh "đòn gánh + giỏ" (giữ) ↔ game `pole` + chiêu "Đòn Gánh Quật" → **đòn gánh** (quyết định điều phối, xem dưới).
- `kinhduong`: DUNG-XUONG kiếm đồng ↔ GEN-LAI ảnh đại đao ↔ game `glaive` — cả hai hợp.
- `trongdong`: DUNG-XUONG trống sau lưng + 2 dùi ↔ GEN-LAI ảnh "trống cầm tay" ↔ game `cleaver`.
- `lyngu`, `thienloi`, `melua`, `thaylang`, `thoren`, `ongdung`, `potaoapui`, `ongtao`, `ongho`: game `look.weapon` (staff / cleaver / sickle / axe / daggers) khác prompt → theo prompt.
- `nghedong`, `kylan`: PROMPT_GEMINI_V94 / tools/build-prompts.js (cũ) "standing upright" ↔ GEN-LAI **4 chân, không đứng 2 chân**.
- `chuongdong`: ảnh cũ là chiêng (GEN-LAI giữ) ↔ DUNG-XUONG chuông treo gậy.

**Quái / boss**

- `kybinh`: DUNG-XUONG/CSV "Quỷ Cưỡi Lợn" (yêu tinh cưỡi lợn) ↔ game desc + GEN-LAI giữ **quỷ đầu lợn rừng 2 chân**.
- `thietky`: desc game "yêu tinh cưỡi lợn rừng ma" ↔ ảnh gốc đổi màu từ `kybinh` (đầu lợn 2 chân).
- `nongnoc`: GEN-LAI "NOT green" ↔ màu data `#4A5A2A` (rêu tối) → đen ánh rêu.
- `yeutinh`: GEN-LAI giữ ảnh tay không ↔ DUNG-XUONG/CSV chùy gỗ.
- `thuongluong`: DUNG-XUONG rồng nước có sừng ↔ GEN-LAI **rắn nước khổng lồ**, không tay chân.
- `trieuda`: DUNG-XUONG đao cong ↔ GEN-LAI giữ ảnh kích ↔ game kích (bổ) → **kích** (quyết định điều phối, xem dưới); màu data `#2A3A5A` (xanh đen) ↔ desc "giáp đỏ đen".
- `ngutinh`: DUNG-XUONG không nêu vật cầm ↔ GEN-LAI giữ đinh ba.
- `hoden`: số đuôi không ghi ở đâu (dáng đổi màu từ Hồ Tinh 9 đuôi).
- Boss: `rage.png` cũ có ở 12 mã (9 boss + 3 tinh anh lớn) nhưng game chỉ chuyển sang dáng hoá điên khi có `enrage` (js/game.js:2800): boss Thuồng Luồng, Chằn Tinh, Đại Bàng, Hồ Tinh; quái thường Cá Sấu, Rắn Độc, Quỷ Lợn Rừng, Cá Mập Yêu và 3 biến thể (nhuộm đỏ bằng code).
- Giao Long Con có 3 màu theo hệ (render.js:439) nhưng `ENEMY_EL.giaolong = null`.

**Giao diện / đồ / icon**

- Thứ tự tấm `ui-menu-1` trong tools/build-prompts.js:279 (ô 3 = ấn đá, ô 4 = rương) ngược với code (js/ui.js:467 `btn-treasury` → ui-menu-1-3, `btn-runes` → ui-menu-1-4; main.js:1839 dùng 1-3 làm rương) — danh sách đặt theo nghĩa trong code.
- `ui_mang.png` (khiên đồng) trông như đồng xu (docs/BAO-CAO-TEST.md L17) → icon mạng là **tim đỏ**.
- `bo_lua` (Bồ Lúa Thần) không có mô tả ảnh trong ACC_GHEP (tools/build-prompts.js:373).
- `mu_dong` và `non_mo` cùng Hiếm, cùng dùng 1 ảnh `do_mu_hiem`; `ao_choang_mo` và `giap_vua` cùng Sử thi dùng `do_giap_su-thi` → nên có icon theo mã món (lô "trang bị theo mã món").
- Icon kỹ năng chưa có prompt icon (chỉ có tên + mô tả chiêu): `langlieu`, `giaodong`, `chuongdong`, `nghedong`, `mychau`, `kylan`, `thienloi`, `tre`, `ongthoi`, `sodua`, `cuoi`, `melua`.
- Thần khí chưa có mô tả icon cũ (dùng desc trong LEGACY): `kylan`, `thienloi`, `cuoi`, `melua`.
- Cỡ hiệu ứng: yêu cầu 16×16 / 32×32 nhưng tools/build-pixel.js cho `vfx`/`hieu-ung` cả 48×48 — vài mục to (cột lửa, nước dâng, mọc núi, chết boss, ngựa sắt) ghi 48×48; nhánh vfx-kenney quyết. Nhóm thư mục đổi `hieu-ung` → `vfx` (cần đổi GROUP_SIZES trong build-pixel.js).

**Quyết định của điều phối (người dùng)**

1. **KHÔNG vẽ đồ / trang phục trang bị lên người tướng 32px** — hình tướng chỉ có vũ khí bản thân (cột "vật cầm"); đồ trang bị chỉ hiện ở icon đồ (lô 34–38).
2. **Icon đồ giữ cả hai bộ**: Lô 34 vẽ theo loại × độ hiếm (`do_<loại>_<độ hiếm>`), Lô 38 vẽ theo mã món — không bỏ bộ nào.
3. **Vũ khí theo dữ liệu game hiện tại** khi các prompt còn lệch nhau:
   - `tuong/cuoi` (Chú Cuội): **ĐÒN GÁNH** — js/data.js:613 `look.weapon.type = 'pole'`, `attack: 'melee'`, chiêu Q "Đòn Gánh Quật" (js/data.js:622). Không vẽ rìu.
   - `boss/trieuda` (Hổ Vương Triệu Đà): **KÍCH**, kiểu đánh **bổ (chop)** cận chiến. js/enemies2.js:75 không có trường vũ khí (chỉ: boss cận chiến size 30, màu `#2A3A5A`, desc "đầu hổ vằn lửa, nanh dài, giáp đỏ đen", chiêu tráo vũ khí "Lẫy nỏ thần bị tráo!"); vũ khí lấy từ js/tu-cu-dong.js:38 `trieuda: 'kich'` (`CD_KIND.kich = 'chop'`) và js/rigs.js:60 `kind: 'chop'` (ảnh kích). Không vẽ đao cong.
   - Hai dòng tương ứng trong bảng lô 5 và lô 11 đã sửa khớp.
4. **Thánh Gióng cầm GẬY SẮT** (mẫu người dùng đã duyệt, `tuong/giong` Lô 0). Gióng nhổ tre đánh giặc là chiêu / thần thoại — thể hiện ở khung `cast` hoặc hiệu ứng, không thay vật cầm.

## Bổ sung

Mục để các session sau ghi **hình mới** phát sinh ngoài danh sách trên (mỗi dòng: nhánh · mã dự kiến `<nhóm>/<mã>` · cỡ · mô tả · chỗ vẽ trong code). **Quy tắc:** mọi hình mới đưa vào game (ảnh, SVG, canvas, emoji làm icon) phải có bản pixel trong `tools/pixel/src/` HOẶC được ghi vào mục này trước khi gộp; luôn **giữ đường vẽ dự phòng** (SVG/canvas cũ) khi chưa có ảnh pixel.

| nhánh | mã dự kiến | cỡ | mô tả | ghi chú |
|---|---|---|---|---|
| claude/duong-di-moi | `nen/cau-tre`, `nen/cau-da` | 16×16 / 32×32 | cầu tre / cầu đá chỗ đường cắt nhau | 9 dạng đường mới |
| claude/duong-di-moi | `nen/mieng-hang-ngam` | 32×32 | miệng hang ngầm (quái chui xuống / trồi lên) |  |
| claude/duong-di-moi | `nen/thanh-xoan-oc` | 48×48 | thành giữa xoắn ốc Cổ Loa |  |
| claude/duong-di-moi | `nen/thanh-chu-u` | 48×48 | thành bên trái bản đồ chữ U |  |
| claude/duong-di-moi | `nen/ruong-bac-thang` | 16×16 | ruộng bậc thang (ô nền + mép bậc) |  |
| claude/duong-di-moi | `nen/de` | 16×16 | đê (đã có ở lô 12 — kiểm tra khớp dạng đường mới) |  |
| claude/duong-di-moi | `giao-dien/banner-man-moi` | 128×24 | banner "Màn N · vùng đất mới" | chữ vẽ bằng HTML, chỉ vẽ dải nền |
| claude/vo-tan-su-kien | `giao-dien/banner-su-kien`, `icon/su-kien-*` | 128×24 / 16×16 | banner + icon sự kiện thử thách: Ngũ Hành Nghịch, Bùa Yểm Thủy Tinh, Quân Hùng Hậu… | liệt kê đủ khi nhánh gộp |
| claude/vfx-kenney | `vfx/*` | 16×16 / 32×32 | toàn bộ hiệu ứng (lô vfx) | nhánh đó tự vẽ, tự ghi mã mới vào đây |
| claude/cho-6-the | `icon/cho-ghep`, `icon/cho-hop-the`, `icon/cho-khoa-tim` | ~10px trong ô 12×12 | 3 ký hiệu dải giá thẻ chợ (đã đưa vào lô icon) | chân dung thẻ qua `marketPortrait(t)` (js/ui.js) |
| claude/xuat-goi-pixel | `do/*` 98 · `icon/*` 160 · `than-khi/*` 60 · `giao-dien/*` 45 · `nen/*` 51 · `canh/*` 37 | theo bảng | **đã sinh bằng tool** (spec `tools/pixel/spec/<nhóm>.json`, gói `tools/pixel/goi/<nhóm>.zip`, lệnh `docs/pixel/LENH-TOOL.md`) — phác thảo, vẽ tay đè sau được | cỡ khác bảng: `giao-dien/thanh-mau-quai` 24×8, `thanh-mau-tuong` 32×8 (build-pixel cấm cạnh < 8); icon 8×8 / 10×10 (`cham-tron`, `sao-cap`, `sao-than-tinh-nho`, `cho-*`) ra 16×16 · `canh/*` và cổng `nen/cong-*` chưa nối vào game (ảnh vẽ tay hiện tại đẹp hơn) |
| claude/pixel-mac-dinh | **còn hình cũ khi pixel mặc định** — có bản tool nhưng là phác thảo thô, CHƯA nối (cần vẽ tay lại trước khi nối) | — | `canh/nen-menu` (nền menu + đăng nhập, ui.js `ui/nen-menu.jpg`) · `canh/nen-man-phu` · `canh/chuong-*` (bản đồ chương, ui.js showCampaign) · `canh/thang-*`/`thua-*`/`nen-thang`/`nen-thua` (cảnh kết trận) · `canh/truyen-*` (cảnh truyện) · `canh/ban-do-<chủ đề>` (nền dự phòng `maps/nen-*.jpg`) · `nen/cong-*` (cổng thành, maps.js `GATE_FILE` — bản tool chỉ là khối nâu, mất mái) · `nen/de-tuong-*`, `nen/o-*` (ô đặt tướng ảnh) · `giao-dien/nui-tan-vien-1..5` · khung thanh máu canvas `giao-dien/thanh-mau-*` (render.js, main.js) · `quai/boss *-chan-dung` (icon quái dùng khung đi) | soát bằng ảnh chụp mặc định 1920×934/844×390/667×375 |
| claude/pixel-mac-dinh | **chưa có bản pixel** | — | thẻ chế độ (`maps/nen-bien.jpg`, `nen-thanh.jpg`) · cảnh SVG: xoay, trống đồng, hũ vua/hũ bầu, kho lúa, quà voi/gà/ngựa · ảnh bản đồ cũ `maps/map-0N.png`, `ban-do_phong-chau.png` · vân đường `tiles/duong-*.jpg` · huy chương `ui-huy-chuong-*`, `ui_khung-vang/thuong`, `ui-tran-*`, `ui-menu-*`, `ui-tai-nguyen-*` · trang trí bản đồ (cây, lau, đá… vẫn SVG `DECO`) · màn tải (#loading chỉ chữ) |  |
