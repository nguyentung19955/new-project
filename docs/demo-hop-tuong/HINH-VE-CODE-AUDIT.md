# TURRET MERGE (`thap/`) — KIỂM KÊ "HÌNH VẼ BẰNG CODE" + PROMPT CHATGPT THAY THẾ

Ngày: 2026-11-05 · Nhánh `claude/demo-hop-tuong` · Phiên này **chỉ kiểm kê + viết prompt**, không sửa code `thap/`.
Yêu cầu người dùng: *"Có gì đang là hình vẽ tay không, nếu có thì thay bằng ChatGPT gen nhé"*.

Ảnh chụp (Playwright 430×860): `docs/demo-hop-tuong/tuvan/audit/`
- `A1-tran-danh-dau.png` (trận, đã đánh số) · `A2-…wave3` · `A3-cham-u` · `A4-menu` · `A5-hoso` · `A6-ketqua` — nhãn **đỏ = THAY**, **xanh = GIỮ code**
- Ảnh gốc: `01-menu` `02-menu-cuon` `03/04-unitpage` `05-tran-dau` `06-tran-trum` `07-coop` `08-pvp` `09-cham-u` `10-tran-trong` `11-ketqua` `12-tamdung`; phóng to 2×: `20-zoom-ban` `21/22-zoom-hud` `23-zoom-loi-cong` `24-cham-ho-tro` `25-menu-du-bo` `26-menu-chan` `27-trieu-hoi` `28-wave-1`

## 0. Tóm tắt

| | Số mục |
|---|---|
| Phần tử đang vẽ bằng code (canvas / CSS / ký tự) | **68** |
| → **THAY** bằng ảnh gen | **35** |
| → **GIỮ code** (hình học UI phải sắc nét / đổi liên tục) | **33** (7 mục `K+` có đề xuất khung/texture gen đặt phía sau) |
| Số tấm ChatGPT cần gen | **12** (9 tấm lưới: S1, S2, S3a–d, S4, S5, S6 + 3 ảnh đơn S7a–c) |

Đã là ảnh ChatGPT (không tính): đầu súng `*_nong`, bệ `de_chung`, khay `khay`, đường `duong_*`, cổng `cong`, lõi `loi`, quái/trùm, đạn `dan_*`, tia `tia_*`, `fx_*` strips, khói `khoi_*`, lớp phủ `phu_*`, `sup_*`, chân dung `pilot_*`, ma vương `af_*`, `ui_mana` `ui_nut_trieu` `ui_nangcap` `ui_thuong` `ui_canh_bao_trum`.

**Ảnh đã có trong `thap/assets/` nhưng CHƯA dùng:** `ui_bang_wave` (dải ruy-băng xanh), `ui_tim` (tim bóng), `ui_sao` (sao vàng), `tier_card_*`, `tier_ring_*`, `fx_buff`, `de_chung_1..6`, `v2_overlord_*`. Phong cách bóng-kẹo của `ui_tim/ui_sao/ui_bang_wave` lệch với HUD "phần cứng thép" hiện tại → vẫn gen bộ mới bên dưới.

**Phát hiện phụ (cho phiên code):** 1 lần tải `?mode=solo&wave=1` báo `ReferenceError: ND is not defined` → đường đi vẽ dự phòng màu xám phẳng (xem `10-tran-trong.png`). Có vẻ lỗi thứ tự nạp/đua; lần tải sau không lặp lại.

### TOP 10 nên thay trước (dễ thấy nhất)
1. **Nút SUMMON** (tấm vàng sọc nguy hiểm CSS) — H1
2. **85 huy hiệu biểu tượng ụ** (vector glyph.js, trên mọi ô/thẻ/bảng) — B1
3. **Huy hiệu sao lục giác** góc trên-phải mỗi ụ — B3
4. **Hộp mana LCD** — H2
5. **Phím 1× / ❚❚** (keycap CSS + ký tự) — H3
6. **Đèn tim + bảng WAVE** trên cùng — H4, H5
7. **Ký hiệu buff / trạng thái** (8 hình 12 px + đầu lâu/khiên/tuyết trên quái) — B5, B19
8. **Ngọc độ hiếm** trên bệ — B4
9. **Băng WAVE / cảnh báo TRÙM** — H12, H13
10. **Logo + nền menu** — M1, M2

## 1. Bảng kiểm kê

Cột "Tấm" = sheet prompt ở mục 2. `K+` = giữ code nhưng nên có khung/texture gen phía sau.

### HUD trận
| ID | Phần tử | Code hiện tại | Quyết định | Tấm |
|---|---|---|---|---|
| H1 | Nút Summon (tấm, sọc vàng-đen, đèn LED) | `css/hud.css` `.tr-cap` gradient + `repeating-linear-gradient` + `.tr-led` | **THAY** (2 trạng thái) | S1 |
| H2 | Hộp mana (màn LCD) | `#mana-hop` gradient + rivets CSS | **THAY** khung; số giữ chữ | S1 |
| H3 | Phím tốc độ / tạm dừng | `.nut-nho` CSS + ký tự `❚❚` | **THAY** keycap + icon pause; "1×" giữ chữ | S2 |
| H4 | Bảng "WAVE n" góc trái | `#tb-wave` CSS rivets | **THAY** khung | S1 |
| H5 | 3 đèn tim góc phải | `#tb-tim .den` radial-gradient | **THAY** đèn bật/tắt + hộp | S1, S2 |
| H6 | Dải ô "Boss in N" | `#tb-seg` DOM ô vuông | GIỮ (số ô động) `K+` khung | S1 |
| H7 | Thanh máu trùm | `#tb-trum-mau` repeating-gradient | GIỮ phần đầy `K+` khung | S1 |
| H8 | Nền khung dưới (HUD panel) | `#duoi` gradient + rivets | **THAY** | S7 |
| H9 | Viền thẻ bộ bài (màu khoá) | CSS border màu | GIỮ (màu đổi theo bộ) `K+` viền thép | S6 |
| H10 | LV1 / ×N / giá nâng cấp / chấm LED xanh | CSS + chữ | GIỮ | — |
| H11 | Thẻ REINFORCE + lớp hồi chiêu | CSS | GIỮ | — |
| H12 | Băng chữ bắt đầu wave | `#bang-wave` gradient | **THAY** nền băng | S5 |
| H13 | Băng cảnh báo trùm | `#canh-bao` gradient đỏ | **THAY** nền băng | S5 |
| H14 | Cut-in kỹ năng ma vương (vệt chéo, ánh quét) | CSS stripes/sheen | GIỮ (hoạt ảnh) `K+` | S5 |
| H15 | Bảng thông tin ụ / dải "TESLA · Attack · 1★" | DOM + CSS | GIỮ | — |

### Bàn chơi
| ID | Phần tử | Code hiện tại | Quyết định | Tấm |
|---|---|---|---|---|
| B1 | **85 huy hiệu biểu tượng ụ** (đĩa tròn + hình) | `js/glyph.js` vector 24×24, `nhandien.js veHuy` | **THAY hình** (silhouette trắng); đĩa/màu khoá giữ code | S3a–d |
| B2 | Vòng màu khoá quanh bệ | `nhandien.js veVong` arc | GIỮ (màu động, tròn tuyệt đối) | — |
| B3 | Huy hiệu sao lục giác + vương miện 7★ | `render.js huyHieu` | **THAY tấm**; số giữ chữ | S2 |
| B4 | Ngọc độ hiếm hình thoi trên bệ | `render.js than` path | **THAY** (5 ngọc) | S2 |
| B5 | Ký hiệu buff 12 px (8 loại) | `buff.js veKyHieu` | **THAY icon**; nền ô 12 px giữ | S2 |
| B6 | Nhãn kỹ năng viên thuốc ("DICE 283%", "SHIELD ×4") | `render.js veChu` roundRect | GIỮ (độ dài động) | — |
| B7 | Kéo-ghép: viền ô hợp lệ, cung nối, gạch chéo | `nhandien.js veKeo` | GIỮ | — |
| B8 | Chạm ụ hỗ trợ: viền đứt, ô tô màu, dây | `buff.js veHoTro` | GIỮ (đã dùng `sup_*`) | — |
| B9 | Vòng nạp / vòng tiến độ grow-up / hào quang thức tỉnh | arc | GIỮ (tiến độ) | — |
| B10 | Vòng quét lên cấp (xanh lá) | `render.js veU lvSang` arc | **THAY** | S4 |
| B11 | Vòng xích tím (bị Clamp) | arc nét đứt | **THAY** | S4 |
| B12 | Bảng tên bàn YOU / ALLY / RIVAL | `render.js veNhanBan` rect + LED | **THAY** khung | S1 |
| B14 | Mũi tên dòng chảy trên đường | `render.js veDongChay` stroke | **THAY** (decal) | S4 |
| B15 | Thanh tim 3 khúc trên lõi | `corehud.js veHud` | GIỮ phần đầy `K+` hộp | S1 |
| B16 | Vết nứt lõi khi mất tim | `corehud.js loiNut` vẽ đường | **THAY** (2 ảnh lõi hư) | S4 |
| B17 | Thanh máu quái | `quaianim.js` | GIỮ | — |
| B18 | Số sát thương / +mana / +1★ / −1♥ | chữ dựng sẵn | GIỮ | — |
| B19 | Trạng thái trên quái: tuyết, đầu lâu, khiên lục giác, chữ thập tẩy, tinh thể mana | `buff.js` proc (C) | **THAY** (dùng chung icon B5) | S2 |
| B20 | Dấu "$" lục giác (Bounty) | `skills4.js HU.truyNaVe` | **THAY** | S2 |
| B21 | Bệ / đường / khay **dự phòng** (khi ảnh lỗi) | `deCode`, fillRect | GIỮ (chỉ dự phòng) | — |

### Hiệu ứng (FX / kỹ năng)
| ID | Phần tử | Code hiện tại | Quyết định | Tấm |
|---|---|---|---|---|
| F1 | Vệt đuôi đạn (motion blur) | `render.js vet` gradient | GIỮ | — |
| F2 | Sét gấp khúc (lõi trắng) | `render.js set` + `tia_set` | GIỮ | — |
| F3 | Laser / tia (cuộn vân) | ảnh `tia_*` + code | GIỮ | — |
| F4 | Vòng sóng xung kích | `FX.vong` arc | GIỮ (bán kính động) | — |
| F5 | Hạt sáng / tia lửa / bụi | `cham1`, `bui1` dựng sẵn | GIỮ | — |
| F7 | Vòng phù văn triệu hồi (vòng + 8 vạch + 3 cung) | `hieuung.js vongPhu` | **THAY** | S4 |
| F8 | Vòng tròn ghép / biến hình / lên sao | arc trên `fx_*` | GIỮ | — |
| F9 | Leo thang theo bậc (vòng, hạt) | `tiervfx.js` | GIỮ | — |
| F10 | Hố đen (gradient + tay xoáy) | `skills.js HU.hoden` | **THAY** (đĩa xoáy, code xoay) | S4 |
| F11 | Chrono Lock: kính lục giác + mặt đồng hồ | `skills3.js HU.khoa` | **THAY**; kim + số giây giữ code | S4 |
| F12 | Ricochet: lưỡi cưa tròn | `skills3.js HU.dia` | **THAY** | S4 |
| F13 | Pandora: đĩa tối + 6 biểu tượng + kim | `skills3.js vePandora` | **THAY** (đĩa + icon S2) | S2, S4 |
| F14 | Cầu vồng trên đường (6 nét) | `skills2.js HU.cauvong` | **THAY** (dải lặp) | S5 |
| F15 | Eclipse: sóng trăng hình nón | `skills4.js HU.non` | **THAY** | S4 |
| F16 | Mirror Gate: 6 mảnh gương bay vòng | `skills4.js veThem` | **THAY** | S4 |
| F17 | Cryo Reactor: vòng gạch băng quay | `skills2.js veThem` | **THAY** | S4 |
| F18 | Dây rối Marionette, vòng Nemesis, nửa vành ngày/đêm, 9 lửa Nine-Tail, quả cầu sáng | arc/line/glow | GIỮ | — |
| F19 | Hạt tuyết Blizzard | chấm tròn | **THAY** (bông tuyết nhỏ) | S4 |
| F21 | REWIND: sọc VHS + chữ | code | GIỮ | — |
| F22 | Mìn / bom hẹn giờ (đang mượn ảnh `dan_phao`) | `HU.min`, `HU.bom` | **THAY** (mìn + bom) | S4, S2 |

### Menu, hồ sơ ụ, bảng
| ID | Phần tử | Code hiện tại | Quyết định | Tấm |
|---|---|---|---|---|
| M1 | Logo "TURRET MERGE" | CSS chữ gradient | **THAY** | S7 |
| M2 | Nền màn chọn bộ bài | radial-gradient | **THAY** | S7 |
| M3 | Đầu nhóm bậc (◆ COMMON, ■□ họ) | CSS + ký tự | GIỮ (có thể dùng ngọc B4) | — |
| M4 | Viền thẻ chọn + nút "+" | CSS | GIỮ | — |
| M5 | 5 ô bộ bài trống (viền nét đứt) | CSS dashed | **THAY** | S6 |
| M6 | Nút chế độ CO-OP / SOLO / PVP | CSS chữ | **THAY** (thêm 3 icon) | S6 |
| M7 | Thẻ ma vương (khung) | CSS | GIỮ | — |
| M8 | Nút Music/SFX/Sort/Random/Start | CSS gradient | GIỮ `K+` (skin nút) | S6 |
| U1 | Hồ sơ ụ: Back, ‹ ›, tab sao | CSS | GIỮ | — |
| U2 | Banner nhân vật + lưới nền | CSS | GIỮ `K+` | S7 (nền menu dùng chung) |
| U3 | Dải bậc họ, bảng chỉ số, góc khung xem trước | CSS | GIỮ | — |
| U4 | Nút "Add to deck" | CSS | GIỮ | — |
| P1 | Bảng Tạm dừng / Kết quả (thép + đinh tán) | CSS rivets | **THAY** (khung 9-slice) | S6 |

Đếm: THAY = H1 H2 H3 H4 H5 H8 H12 H13 · B1 B3 B4 B5 B10 B11 B12 B14 B16 B19 B20 · F7 F10 F11 F12 F13 F14 F15 F16 F17 F19 F22 · M1 M2 M5 M6 · P1 = **35**. GIỮ = H6 H7 H9 H10 H11 H14 H15 · B2 B6 B7 B8 B9 B15 B17 B18 B21 · F1 F2 F3 F4 F5 F8 F9 F18 F21 · M3 M4 M7 M8 · U1–U4 = **33**.

## 2. Prompt ChatGPT (theo thứ tự ưu tiên)

**Cách gửi mỗi tấm:** đính kèm ảnh tham chiếu `thap/assets/khay.png` + `thap/assets/canon_nong.png` + `thap/assets/de_chung.png` (S3 chỉ cần 1 ảnh glyph hiện tại để biết cỡ). Nền **magenta #FF00FF** đặc → cắt bằng khoá magenta như `tools/thap-cat-hinh.py` (`tach_nen(..., 'tim')`), cắt theo lưới rồi xén theo alpha. Ảnh xong đặt vào `thap/assets/` đúng tên.

Câu phong cách dùng chung (đã có trong từng prompt): *same style as the attached turret art: chunky cartoon mobile-game, bold dark outline, gunmetal metal, soft top-left light*.

---

### S1 — Tấm HUD (ưu tiên 1) · 1536×1024 · lưới 2 cột × 4 hàng (ô 768×256)

| Ô | File | Đích | Code dùng |
|---|---|---|---|
| r1c1 | `hud_trieu_san.png` | 360×144 | nền `.tr-cap` khi đủ mana (background-size 100% 100%), giữ icon + chữ + giá |
| r1c2 | `hud_trieu_tat.png` | 360×144 | `.thieu .tr-cap` |
| r2c1 | `hud_mana.png` | 216×124 | nền `#mana-hop`, số đè lên màn |
| r2c2 | `hud_wave.png` | 168×80 | nền `#tb-wave` |
| r3c1 | `hud_tim_khung.png` | 140×56 | nền `#tb-tim`, 3 đèn S2 đặt vào lỗ |
| r3c2 | `hud_trum_khung.png` | 300×36 | khung quanh `#tb-seg` / `#tb-trum-mau` |
| r4c1 | `hud_ten_ban.png` | 120×32 | thay `veNhanBan` (chữ + LED màu phe vẽ đè) |
| r4c2 | `loi_mau_khung.png` | 128×40 | hộp quanh thanh tim 3 khúc trên lõi (`CORE.veHud`) |

```
Game UI sheet, 2x4 grid, 8 empty hardware plates, front view, no text, no icons:
1 wide yellow metal button plate with black-yellow hazard stripe border and small round LED top-right, empty center
2 same button, grey dusty disabled version, LED off
3 dark LCD screen set in a riveted gunmetal frame, screen empty
4 small riveted steel label plate
5 steel bar with 3 empty round lamp sockets
6 long thin steel bar frame, empty slot inside
7 small steel nameplate with one empty LED socket on the left
8 small capsule housing with 3 empty slots, cyan trim
Same style as the attached turret art: chunky cartoon mobile-game, bold dark outline, gunmetal metal, soft top-left light.
Flat solid magenta #FF00FF background, wide gaps.
```

### S2 — Huy hiệu & icon (ưu tiên 2) · 1536×1024 · lưới 6×4 (ô 256)

| Hàng | Ô 1 → 6 (file `assets/<tên>.png`) | Đích / code |
|---|---|---|
| 1 | `ic_toc` `ic_dmg` `ic_crit` `ic_cham` `ic_chet` `ic_mana` | 64 px; `buff.js veKyHieu` → `drawImage` (B5, B19, F13) |
| 2 | `ic_khien` `ic_taylo` `ic_sao` `ic_bom` `ic_truyna` `ic_dung` | 64 px; khiên/tẩy như trên; `ic_sao` `ic_bom` cho Pandora; `ic_truyna` thay `HU.truyNaVe`; `ic_dung` thay ký tự ❚❚ |
| 3 | `sao_hex` `sao_hex7` `ngoc_trang` `ngoc_xanh` `ngoc_tim` `ngoc_vang` | sao 96 px — `huyHieu()` vẽ ảnh rồi viết số; ngọc 32 px — thay hình thoi trong `than()` |
| 4 | `ngoc_do` `den_tim_bat` `den_tim_tat` `phim` `phim_nhan` `led_xanh` | đèn 40 px trong `#tb-tim`; keycap 104×124 cho `.nut-nho`; LED 16 px |

```
Game icon sheet, 6x4 grid, 24 items, one per cell, centered, same size, no text:
Row 1: amber triple chevron >>>, orange-red sword, yellow 4-point sparkle star, ice-blue snowflake, violet angular skull, mint mana crystal
Row 2: blue hexagon shield, ivory cleanse cross sparkle, gold 5-point star, round black bomb with lit fuse, gold hexagon coin badge with $, ivory pause symbol (two bars)
Row 3: empty dark hexagon badge with pale gold rim, empty dark crimson hexagon badge with gold rim and tiny crown on top, small cut gems: white, blue, purple, gold
Row 4: red cut gem, glowing red round lamp ON, dark round lamp OFF, square gunmetal keycap, same keycap pressed down, tiny green LED dot
Bold simple shapes, thick dark outline, readable at 16 px.
Same style as the attached turret art: chunky cartoon mobile-game, gunmetal, soft top-left light.
Flat solid magenta #FF00FF background, wide gaps.
```

### S3a–S3d — 85 biểu tượng nhận diện ụ (ưu tiên 3)

Code dùng: `GLYPH.mask(id, N)` nạp `assets/glyph/<id>.png` (128×128, trắng trên trong suốt) thay cho vector; nếu ảnh chưa có thì rơi về vector cũ. Toàn bộ chuỗi tô màu khoá / đĩa / bóng trong `nhandien.js veHuy` **giữ nguyên** — vì vậy ảnh phải là **bóng trắng đơn sắc**, không viền, không đổ bóng. Đính kèm 1 ảnh chụp huy hiệu hiện tại (`tuvan/audit/20-zoom-ban.png`) để ChatGPT hiểu độ to/đậm.

### Sheet 3a — Glyph 1–24 (6×4, 1536×1024)

| Ô | File | Ụ | Hình |
|---|---|---|---|
| r1c1 | `assets/glyph/canon.png` | Cannon | thick round muzzle with center dot |
| r1c2 | `assets/glyph/xucxac.png` | Dice Gun | tilted die with 4 pips |
| r1c3 | `assets/glyph/lien.png` | Gatling | 3 barrels in a triangle inside a ring |
| r1c4 | `assets/glyph/phun.png` | Scatter | 5 short barrels fanned out |
| r1c5 | `assets/glyph/sungluc.png` | Revolver | 6-hole revolver cylinder, one slot missing |
| r1c6 | `assets/glyph/bang.png` | Frost | big 6-arm snowflake |
| r2c1 | `assets/glyph/doc.png` | Venom | 3-lobe venom drop with hole |
| r2c2 | `assets/glyph/mana.png` | Mana Core | hollow diamond with spark |
| r2c3 | `assets/glyph/tia.png` | Sniper | scope ring with long crosshair |
| r2c4 | `assets/glyph/set.png` | Tesla | thick zigzag lightning bolt |
| r2c5 | `assets/glyph/maychem.png` | Guillotine | guillotine frame with falling slanted blade |
| r2c6 | `assets/glyph/phagiap.png` | Breaker | cracked shield |
| r3c1 | `assets/glyph/bua.png` | Hammer | big T hammer |
| r3c2 | `assets/glyph/nam.png` | Iron Fist | clenched fist |
| r3c3 | `assets/glyph/bomhen.png` | Time Bomb | round bomb with fuse and clock hand cut-out |
| r3c4 | `assets/glyph/nhanmana.png` | Mana Doubler | two overlapping mana drops |
| r3c5 | `assets/glyph/kiembang.png` | Ice Blade | diagonal ice dagger |
| r3c6 | `assets/glyph/mimic.png` | Mimic | mask with triangle eyes and zigzag mouth |
| r4c1 | `assets/glyph/chimang.png` | Crit Antenna | 4 big spikes around a dot |
| r4c2 | `assets/glyph/dichchuyen.png` | Teleporter | two offset portals joined by an arrow |
| r4c3 | `assets/glyph/radar.png` | Radar | radar ring with sweep wedge |
| r4c4 | `assets/glyph/drone.png` | Drone Bay | square drone with 4 rotors |
| r4c5 | `assets/glyph/tron.png` | Blender | 3 curved blender blades |
| r4c6 | `assets/glyph/nangluong.png` | Energy Cannon | energy orb with 3 wave arcs |

```
Icon sheet, 6x4 grid, 24 game icons, one per cell, left to right:
1. Cannon: thick round muzzle with center dot
2. Dice Gun: tilted die with 4 pips
3. Gatling: 3 barrels in a triangle inside a ring
4. Scatter: 5 short barrels fanned out
5. Revolver: 6-hole revolver cylinder, one slot missing
6. Frost: big 6-arm snowflake
7. Venom: 3-lobe venom drop with hole
8. Mana Core: hollow diamond with spark
9. Sniper: scope ring with long crosshair
10. Tesla: thick zigzag lightning bolt
11. Guillotine: guillotine frame with falling slanted blade
12. Breaker: cracked shield
13. Hammer: big T hammer
14. Iron Fist: clenched fist
15. Time Bomb: round bomb with fuse and clock hand cut-out
16. Mana Doubler: two overlapping mana drops
17. Ice Blade: diagonal ice dagger
18. Mimic: mask with triangle eyes and zigzag mouth
19. Crit Antenna: 4 big spikes around a dot
20. Teleporter: two offset portals joined by an arrow
21. Radar: radar ring with sweep wedge
22. Drone Bay: square drone with 4 rotors
23. Blender: 3 curved blender blades
24. Energy Cannon: energy orb with 3 wave arcs
Each icon: flat solid WHITE silhouette only, no outline, no shading, no text, bold simple shape readable at 16 px, centered, same size.
Flat solid magenta #FF00FF background, wide gaps between cells.
```

### Sheet 3b — Glyph 25–48 (6×4, 1536×1024)

| Ô | File | Ụ | Hình |
|---|---|---|---|
| r1c1 | `assets/glyph/laser.png` | Laser | square aperture with thin beam through |
| r1c2 | `assets/glyph/lanhgia.png` | Chiller | 4-blade fan in a ring |
| r1c3 | `assets/glyph/mortar.png` | Mortar | short mortar tube, arc and ball |
| r1c4 | `assets/glyph/khuech.png` | Amplifier | speaker box with 2 sound arcs |
| r1c5 | `assets/glyph/vungdoc.png` | Toxic Pool | flat puddle with 3 bubbles |
| r1c6 | `assets/glyph/loa.png` | Cooldown Horn | hourglass |
| r2c1 | `assets/glyph/hutmana.png` | Mana Leech | fang hook with a drop |
| r2c2 | `assets/glyph/min.png` | Mine Layer | round sea mine with 8 spikes |
| r2c3 | `assets/glyph/cuongno.png` | Berserker | two stacked chevrons (rank) |
| r2c4 | `assets/glyph/baotuyet.png` | Blizzard | 3-arm swirl with snow dots |
| r2c5 | `assets/glyph/nhanban.png` | Cloner | two squares linked by a ray |
| r2c6 | `assets/glyph/lienket.png` | Chain Link | two interlocked chain links |
| r3c1 | `assets/glyph/kepha.png` | Clamp | two opposing clamp jaws |
| r3c2 | `assets/glyph/taylo.png` | Cleanser | diagonal broom |
| r3c3 | `assets/glyph/khien.png` | Shield Gen | hexagon outline with solid hex core |
| r3c4 | `assets/glyph/hopbi.png` | Mystery Box | box with question mark cut-out |
| r3c5 | `assets/glyph/nangsao.png` | Star Lift | 5-point star with up arrow |
| r3c6 | `assets/glyph/tuthan.png` | Reaper Pillar | scythe |
| r4c1 | `assets/glyph/xaotron.png` | Scrambler | 3 curved arrows in a broken circle |
| r4c2 | `assets/glyph/epxung.png` | Overclock | gear with lightning cut-out |
| r4c3 | `assets/glyph/no5.png` | Fifth Shot | big bullet with 4 small dots behind |
| r4c4 | `assets/glyph/bao.png` | Storm Gun | tornado funnel |
| r4c5 | `assets/glyph/anhsang.png` | Lighthouse | lighthouse with lamp and 2 rays |
| r4c6 | `assets/glyph/aten.png` | Purifier | sun with 8 sharp rays |

```
Icon sheet, 6x4 grid, 24 game icons, one per cell, left to right:
1. Laser: square aperture with thin beam through
2. Chiller: 4-blade fan in a ring
3. Mortar: short mortar tube, arc and ball
4. Amplifier: speaker box with 2 sound arcs
5. Toxic Pool: flat puddle with 3 bubbles
6. Cooldown Horn: hourglass
7. Mana Leech: fang hook with a drop
8. Mine Layer: round sea mine with 8 spikes
9. Berserker: two stacked chevrons (rank)
10. Blizzard: 3-arm swirl with snow dots
11. Cloner: two squares linked by a ray
12. Chain Link: two interlocked chain links
13. Clamp: two opposing clamp jaws
14. Cleanser: diagonal broom
15. Shield Gen: hexagon outline with solid hex core
16. Mystery Box: box with question mark cut-out
17. Star Lift: 5-point star with up arrow
18. Reaper Pillar: scythe
19. Scrambler: 3 curved arrows in a broken circle
20. Overclock: gear with lightning cut-out
21. Fifth Shot: big bullet with 4 small dots behind
22. Storm Gun: tornado funnel
23. Lighthouse: lighthouse with lamp and 2 rays
24. Purifier: sun with 8 sharp rays
Each icon: flat solid WHITE silhouette only, no outline, no shading, no text, bold simple shape readable at 16 px, centered, same size.
Flat solid magenta #FF00FF background, wide gaps between cells.
```

### Sheet 3c — Glyph 49–72 (6×4, 1536×1024)

| Ô | File | Ụ | Hình |
|---|---|---|---|
| r1c1 | `assets/glyph/dongbo.png` | Sync Cannon | orbit ring with 2 satellites and small star |
| r1c2 | `assets/glyph/railgun.png` | Railgun | two rails with a diamond slug |
| r1c3 | `assets/glyph/vughep.png` | Merge King | crown |
| r1c4 | `assets/glyph/sinhdoi.png` | Twin Maker | two twin round cores split by a gap |
| r1c5 | `assets/glyph/hasao.png` | Star Breaker | 5-point star cracked in half |
| r1c6 | `assets/glyph/saochep.png` | Copycat | solid block with offset outline copy |
| r2c1 | `assets/glyph/ngoisao.png` | Star Cannon | big 4-point star with hole |
| r2c2 | `assets/glyph/soi.png` | Mech Wolf | wolf head, pointed ears, slit eyes |
| r2c3 | `assets/glyph/tienhoa.png` | Evolver | DNA helix |
| r2c4 | `assets/glyph/cauvong.png` | Rainbow | 3 nested rainbow arcs |
| r2c5 | `assets/glyph/wallgen.png` | Wall Projector | brick wall |
| r2c6 | `assets/glyph/orbital.png` | Orbital | satellite with 2 solar wings |
| r3c1 | `assets/glyph/blackhole.png` | Black Hole | solid black disc with accretion ring |
| r3c2 | `assets/glyph/overlord.png` | Overlord | round head with 2 demon horns |
| r3c3 | `assets/glyph/lophanung.png` | Cryo Reactor | long hex crystal in a heat ring |
| r3c4 | `assets/glyph/haoquang.png` | Holy Halo | halo ring with 2 wings |
| r3c5 | `assets/glyph/nayda.png` | Ricochet | zigzag bounce line with arrow |
| r3c6 | `assets/glyph/combo.png` | Combo Core | 3 rising bars |
| r4c1 | `assets/glyph/khoathoigian.png` | Chrono Lock | padlock with clock hand cut-out |
| r4c2 | `assets/glyph/hydra.png` | Hydra | 3 snake necks from one base |
| r4c3 | `assets/glyph/cuuvi.png` | Nine-Tail | 3 big fox tails fanning up |
| r4c4 | `assets/glyph/pandora.png` | Pandora Vault | open chest with 3 rays |
| r4c5 | `assets/glyph/luoicheo.png` | Resonance Grid | 3x3 dot grid with X |
| r4c6 | `assets/glyph/ngaithoigian.png` | Chrono Throne | throne with clock face on top |

```
Icon sheet, 6x4 grid, 24 game icons, one per cell, left to right:
1. Sync Cannon: orbit ring with 2 satellites and small star
2. Railgun: two rails with a diamond slug
3. Merge King: crown
4. Twin Maker: two twin round cores split by a gap
5. Star Breaker: 5-point star cracked in half
6. Copycat: solid block with offset outline copy
7. Star Cannon: big 4-point star with hole
8. Mech Wolf: wolf head, pointed ears, slit eyes
9. Evolver: DNA helix
10. Rainbow: 3 nested rainbow arcs
11. Wall Projector: brick wall
12. Orbital: satellite with 2 solar wings
13. Black Hole: solid black disc with accretion ring
14. Overlord: round head with 2 demon horns
15. Cryo Reactor: long hex crystal in a heat ring
16. Holy Halo: halo ring with 2 wings
17. Ricochet: zigzag bounce line with arrow
18. Combo Core: 3 rising bars
19. Chrono Lock: padlock with clock hand cut-out
20. Hydra: 3 snake necks from one base
21. Nine-Tail: 3 big fox tails fanning up
22. Pandora Vault: open chest with 3 rays
23. Resonance Grid: 3x3 dot grid with X
24. Chrono Throne: throne with clock face on top
Each icon: flat solid WHITE silhouette only, no outline, no shading, no text, bold simple shape readable at 16 px, centered, same size.
Flat solid magenta #FF00FF background, wide gaps between cells.
```

### Sheet 3d — Glyph 73–85 (5×3, 1536×1024)

| Ô | File | Ụ | Hình |
|---|---|---|---|
| r1c1 | `assets/glyph/nemesis.png` | Nemesis | almond eye with pupil cut-out |
| r1c2 | `assets/glyph/docton.png` | Lone Ace | spade |
| r1c3 | `assets/glyph/thaukinh.png` | Focus Lens | magnifying glass |
| r1c4 | `assets/glyph/nhieusong.png` | Signal Jammer | antenna mast, waves, strike-through |
| r1c5 | `assets/glyph/santhuong.png` | Bounty Beacon | tied money bag |
| r2c1 | `assets/glyph/nhatthuc.png` | Eclipse | crescent with 3 rim dots |
| r2c2 | `assets/glyph/loren.png` | Scrap Forge | anvil |
| r2c3 | `assets/glyph/guongcong.png` | Mirror Gate | arched gate with 2 mirror marks |
| r2c4 | `assets/glyph/marionette.png` | Marionette | cross control bar, 3 strings, puppet head |
| r2c5 | `assets/glyph/chuato.png` | Hive Queen | 3 solid hex honeycomb cells |
| r3c1 | `assets/glyph/leviathan.png` | Leviathan | sea serpent humps over waves |
| r3c2 | `assets/glyph/khoisinh.png` | Genesis Core | round seed with 2 sprouts |
| r3c3 | `assets/glyph/ronglua.png` | Wyrm Engine | dragon flame with hollow core |

```
Icon sheet, 5x3 grid, 13 game icons, one per cell, left to right:
1. Nemesis: almond eye with pupil cut-out
2. Lone Ace: spade
3. Focus Lens: magnifying glass
4. Signal Jammer: antenna mast, waves, strike-through
5. Bounty Beacon: tied money bag
6. Eclipse: crescent with 3 rim dots
7. Scrap Forge: anvil
8. Mirror Gate: arched gate with 2 mirror marks
9. Marionette: cross control bar, 3 strings, puppet head
10. Hive Queen: 3 solid hex honeycomb cells
11. Leviathan: sea serpent humps over waves
12. Genesis Core: round seed with 2 sprouts
13. Wyrm Engine: dragon flame with hollow core
(leave the last 2 cells empty)
Each icon: flat solid WHITE silhouette only, no outline, no shading, no text, bold simple shape readable at 16 px, centered, same size.
Flat solid magenta #FF00FF background, wide gaps between cells.
```

### S4 — Đồ vật hiệu ứng (ưu tiên 4) · 1024×1024 · lưới 4×4 (ô 256) · nhìn từ trên xuống, hình tròn tròn tuyệt đối

| Ô | File | Đích | Code dùng |
|---|---|---|---|
| r1c1 | `fx_vong_trieu.png` | 256 | thay `VX.vongPhu` (code xoay + phóng) |
| r1c2 | `fx_vong_lv.png` | 128 | thay vòng quét lên cấp `lvSang` (xoay, mờ dần) |
| r1c3 | `vong_xich.png` | 128 | thay vòng nét đứt Clamp (xoay chậm) |
| r1c4 | `hu_hoden.png` | 256 | thay gradient + tay xoáy hố đen (xoay `-t*4.5`) |
| r2c1 | `hu_khoa.png` | 128 | kính lục giác Chrono Lock; vành tiến độ + kim + số giây vẽ đè bằng code |
| r2c2 | `hu_luoicua.png` | 64 | lưỡi cưa Ricochet (xoay) |
| r2c3 | `hu_manhguong.png` | 48 | 1 mảnh gương, code xếp 6 mảnh quanh ụ |
| r2c4 | `hu_trangkhuyet.png` | 256 | sóng trăng Eclipse: kéo giãn theo bán kính, xoay theo hướng |
| r3c1 | `hu_vongbang.png` | 192 | vòng gạch băng Cryo Reactor (xoay) |
| r3c2 | `hu_min.png` | 48 | mìn trên đường (thay `dan_phao`) |
| r3c3 | `pandora_dia.png` | 128 | đĩa quay Pandora; 6 icon S2 đặt vào hốc |
| r3c4 | `duong_mui.png` | 32 | mũi tên dòng chảy, dập dọc đường (thay stroke) |
| r4c1 | `hat_tuyet.png` | 24 | hạt tuyết Blizzard |
| r4c2 | `loi_hu1.png` | như `loi.png` | lõi còn 2 tim (thay vết nứt code) |
| r4c3 | `loi_hu2.png` | như `loi.png` | lõi còn 1 tim |
| r4c4 | *(trống)* | | |

```
Game VFX sprite sheet, 4x4 grid, top-down view, perfect circles, centered, no text:
1 thin gold rune summoning ring with 8 tick marks
2 green glowing level-up ring, bright sweep arc on one side
3 purple chain ring
4 black hole: solid black core, swirling magenta-violet accretion disc
5 translucent teal hexagon glass cell with thin clock ring inside
6 small circular saw blade, dark disc with lime-green teeth
7 one sharp silver mirror shard with cyan glint
8 blue-white crescent energy wave arc
9 ring of icy blue tiles around an empty center
10 small round landmine with red light
11 dark round wheel plate with gold rim and 6 empty sockets
12 small cyan glowing chevron arrow pointing right
13 tiny soft white snowflake
14 the attached core crystal, cracked, faint orange cracks
15 the attached core crystal, badly cracked, red glowing cracks, dimmer
16 empty
Same style as the attached turret art: chunky cartoon mobile-game, bold dark outline, soft top-left light.
Flat solid magenta #FF00FF background, wide gaps.
```
(Đính kèm thêm `thap/assets/loi.png` cho ô 14–15.)

### S5 — Băng & dải dài (ưu tiên 5) · 1536×1024 · 1 cột × 4 hàng (ô 1536×256)

| Hàng | File | Đích | Code dùng |
|---|---|---|---|
| 1 | `bang_wave_nen.png` | 860×140 | nền `#bang-wave .bw-dai` (chữ WAVE giữ) |
| 2 | `bang_trum_nen.png` | 860×140 | nền `#canh-bao` (icon trùm + chữ giữ) |
| 3 | `bang_cutin_nen.png` | 860×140 | texture xám cho `#cutin .ci-nen` (code tô màu ma vương) |
| 4 | `hu_cauvong.png` | 512×64, lặp ngang | thay 6 nét cầu vồng: lặp ảnh dọc đường (như `veDoanDuong`) |

```
Game banner sheet, 4 wide horizontal strips stacked, no text:
1 dark steel banner band with cyan glowing trim lines, ends fading out, empty center
2 red and black hazard warning band, ends fading out, empty center
3 grey diagonal speed-line band, ends fading out
4 seamless horizontal rainbow energy road strip, tileable left to right, top-down
Same style as the attached turret art: chunky cartoon mobile-game, bold dark outline, gunmetal metal.
Flat solid magenta #FF00FF background, gaps between strips.
```

### S6 — Menu & bảng (ưu tiên 6) · 1536×1024 · lưới 3×2 (ô 512)

| Ô | File | Đích | Code dùng |
|---|---|---|---|
| r1c1 | `khung_bang.png` | 9-slice, viền 40 px | `border-image` cho `.bang` (Tạm dừng / Kết quả) |
| r1c2 | `o_trong.png` | 150×190 | nền ô bộ bài trống `#chon-bo` (thay viền đứt) |
| r1c3 | `the_vien.png` | 136×190 | viền thép trung tính đặt trên thẻ bộ bài; màu khoá vẫn là viền CSS mảnh bên trong |
| r2c1 | `ic_coop.png` | 48 | icon nút CO-OP |
| r2c2 | `ic_solo.png` | 48 | icon nút SOLO |
| r2c3 | `ic_pvp.png` | 48 | icon nút PVP |

```
Game UI sheet, 3x2 grid, centered, no text:
1 dark riveted steel panel frame, empty inside, square
2 empty recessed card slot, dark metal, portrait
3 thin steel card bezel frame, portrait, hollow window (window filled magenta)
4 icon: two small turrets side by side (co-op)
5 icon: one turret (solo)
6 icon: two turrets facing each other with a red spark between (versus)
Same style as the attached turret art: chunky cartoon mobile-game, bold dark outline, gunmetal metal, soft top-left light.
Flat solid magenta #FF00FF background, wide gaps.
```

### S7 — Ảnh đơn (ưu tiên 7)

**S7a `logo.png`** · 1536×512 → hiển thị 360×120 thay `.logo b` (dòng phụ "Merge · defend · survive" giữ chữ)
```
Game logo "TURRET MERGE", bold chunky metal letters, gunmetal with amber edge highlights, small turret barrel in the T, slight bevel.
Same style as the attached turret art. Flat solid magenta #FF00FF background.
```

**S7b `nen_menu.png`** · 1024×1536 → `background: url(...) center/cover` cho `#chon` (và nền banner hồ sơ ụ U2)
```
Mobile game menu background, portrait, dark workshop floor seen from above, gunmetal plates, faint cyan circuit lines, darker edges, very low detail in the center so cards stay readable. No text, no characters.
Same style as the attached tray art.
```

**S7c `nen_hud_duoi.png`** · 1536×1024 → cắt dải 1536×680 → `#duoi` (430×190)
```
Wide game HUD bottom panel, top-down, dark riveted gunmetal console with a thin metal lip on the top edge, low detail, no buttons, no text.
Same style as the attached tray art. Fill the whole image.
```

## 3. Ghi chú cho phiên ráp ảnh
- Ảnh UI DOM (S1, S2 keycap, S5, S6, S7) gắn bằng CSS `background-image`, chữ/số vẫn là DOM → giữ đọc rõ, đổi ngôn ngữ được.
- Ảnh canvas: nạp qua `REN.img()` / `REN.co()` như mọi asset; giữ đường dự phòng code khi ảnh chưa tải.
- Icon 12–16 px (B1, B5): thu nhỏ nhiều bước (`REN.mip`) — nếu sau khi ráp vẫn nhoè hơn vector, giữ vector cho cỡ < 14 px và chỉ dùng ảnh trên thẻ/bảng thông tin.
- Mọi vòng tròn phải tròn tuyệt đối: sau khi cắt, kiểm tra bbox vuông (lệch ≤ 2 px) trước khi dùng.

## 4. Kết quả ráp ảnh (phiên ráp, 2026-11-05)

Cắt: `python3 tools/thap-cat-ui.py` (khoá magenta, tìm ô bằng khối liền, quầng sáng khử trộn màu nền, kiểm tra vòng tròn) → `thap/assets/*.png`, `thap/assets/glyph/<id>.png` (85), tờ tổng hợp `tuvan/audit/cut_contact.png`.
Ảnh chụp trước/sau 360/390/430: `tuvan/audit/thay-anh/`. Kiểm thử: `tools/thap-kt-hinh-ui.js`, `tools/thap-kt-hinh-fx.js`.

- **Đã thay:** H1 H2 H3 H4 H5 H8 H12 H13 (+ vân thép cut-in H14) · B1 B3 B4 B5 B10 B11 B12 B14 B16 B19 B20 · F7 (vòng triệu hồi) F10 F11 F12 F13 F14 F15 F16 F19 F22 · M1 M2 M5 M6 · P1. CSS mới: `thap/css/anhgen.css` (border-image 9 mảnh, chữ/số vẫn DOM).
- **Cắt nhưng KHÔNG dùng:** `hu_vongbang` (F17 — vùng lạnh Cryo rộng gần cả bàn, vòng gạch băng to che hết ụ → giữ vòng nét đứt), `hud_trum_khung`, `loi_mau_khung`, `the_vien` (mục `K+` tùy chọn, giữ bố cục cũ).
- `loi_hu1` (ảnh gen gần như chưa nứt) → dùng làm nền + vẫn vẽ 2 vết nứt cam mảnh bằng code; `loi_hu2` dùng nguyên ảnh.
- Vòng phù văn khi KỸ NĂNG GHÉP kích hoạt vẫn vẽ code (cần đúng màu họ); vòng khi TRIỆU HỒI dùng ảnh.
- Glyph: ảnh PNG từ 14 px thiết bị trở lên, nhỏ hơn giữ vector; tải lười, tải xong tự thay ảnh DOM đang hiện bản vector.
- Sửa lỗi đua `ND is not defined`: `UI.init` đợi cả `DOMContentLoaded` (mọi script sau ui.js đã chạy).

## 5. Pass 2 — rà lại toàn bộ (2026-11-05, sau khi ráp S1–S7)

Ảnh chụp (Playwright 430×860, 2×): `docs/demo-hop-tuong/tuvan/audit2/` — `01–03` menu/chọn bộ bài · `04–05` trang chi tiết ụ · `06` SOLO · `07` CO-OP (dải đồng đội mới) · `08` PVP (dải đối thủ) · `09` chạm ụ grow-up (bảng gọn) · `10` chạm ụ hỗ trợ · `11` tạm dừng · `12` kết quả · `13` trùm · `14` chạm thẻ đồng đội.

Cùng phiên đã làm: bỏ thanh 3 khúc trên lõi ở CO-OP (3 đèn HUD là đủ); dải bộ bài đồng đội/đối thủ (5 thẻ + chỉ huy, chạm = thông tin); bảng thông tin gọn (ẩn dải tên nổi, 1 dòng kỹ năng, 4 ô số, nguồn buff khi có, 1 dòng grow-up, 3 chip mốc sao, nút **Details ›**). S8/S9 (khung thẻ, icon Summon, khay đồng đội, tấm LV/giá, đèn xanh, ruy-băng GROW-UP) — xem mục 6.

### Tóm tắt pass 2

| | Số mục |
|---|---|
| Phần tử còn vẽ bằng code/CSS (không phải PNG) | **46** |
| → **THAY** | **24** (11 do S8/S9 · 11 cần tấm mới S10/S11 · 2 dùng ảnh đã có) |
| → **GIỮ code** | **22** (số/chữ động, thanh tiến độ, vòng tròn đổi bán kính, bảng chữ) |
| Tấm ChatGPT mới cần gen | **2** (S10, S11) |

### Bảng kiểm kê pass 2

| ID | Phần tử | Code hiện tại | Quyết định | Tấm |
|---|---|---|---|---|
| Q1 | Khung thẻ ụ ở hàng bộ bài (viền CSS màu bậc) | `hud.css #bo-the .the` box-shadow | **THAY** khung theo độ hiếm | S8 |
| Q2 | Khung thẻ ở màn chọn bộ bài | `game.css .c` border | **THAY** | S8 |
| Q3 | 5 ô bộ bài đã chọn (chân dung + viền màu khoá) | `.o-bo` CSS | **THAY** khung độ hiếm | S8 |
| Q4 | Thẻ chỉ huy (REINFORCE …) hàng dưới | `#the-mv` box-shadow | **THAY** | S8 |
| Q5 | Thẻ chỉ huy ở menu (3 thẻ) | `.mv` CSS | **THAY** | S8 |
| Q6 | Vòng trống trong nút Summon | `ui_nut_trieu` lọc tối | **THAY** icon | S9 |
| Q7 | Nhãn LV1 / ×N trên thẻ | `.lv` `.so` hộp CSS | **THAY** tấm | S9 |
| Q8 | Ô giá nâng cấp (100) đáy thẻ + giá chỉ huy | `.gia` `.mv-gia` CSS | **THAY** tấm | S9 |
| Q9 | Chấm xanh "đủ mana" | CSS chấm | **THAY** đèn | S9 |
| Q10 | Nhãn GROW-UP trên thẻ (trận + menu) | `.gu` CSS | **THAY** ruy-băng | S9 |
| Q11 | Khay dải đồng đội/đối thủ | `pass2.css #dp-dai` | **THAY** khay | S9 |
| Q12 | Khung bảng thông tin chạm ụ | `#tt` viền bo tròn CSS | **THAY** khung 9 mảnh (màu bậc vẽ đè 1 vạch mảnh) | S10 |
| Q13 | Nhãn kỹ năng trên bàn ("SHATTER ×5", "Rage!") | `render.js veChu` roundRect | **THAY** tấm viên thuốc 3 mảnh (chữ giữ) | S10 |
| Q14 | Nút lớn Random / Start / Resume / Play again / Quit / Change deck | CSS gradient | **THAY** 2 skin (thép tối · vàng) | S10 |
| Q15 | Nút "Add to deck" (xanh lá) | `unitpage.css .up-nut` | **THAY** skin xanh | S10 |
| Q16 | Nút nhỏ Music/SFX/Sort + Back + ‹ › (trang chi tiết) | CSS | **THAY** skin nút nhỏ | S10 |
| Q17 | Khung nút chế độ đang chọn (CO-OP/SOLO/PVP) | border CSS | **THAY** khung sáng | S10 |
| Q18 | Nút "+" thêm nhanh trên thẻ menu | `.up-q` CSS | **THAY** | S10 |
| Q19 | Biểu tượng THUA ở bảng kết quả (đang dùng vương miện cho cả thắng/thua) | `ui_thuong` | **THAY** | S10 |
| Q20 | Thanh 3 khúc trên lõi (SOLO/PVP) | `corehud.js veHud` fillRect | **THAY** khung + khúc đầy/rỗng (chớp/nứt giữ code) | S11 |
| Q21 | Dải ô "Boss in N" | `#tb-seg i` CSS | **THAY** 3 đèn (tắt/sáng/trùm) | S11 |
| Q22 | Nút phát/dừng xem trước (trang chi tiết) | CSS + ký tự | **THAY** icon | S11 |
| Q23 | Khung thanh máu trùm | gradient | **THAY** — dùng `hud_trum_khung.png` đã có | — |
| Q24 | Đầu nhóm bậc "◆ COMMON / ■ RARE" + ô thoi góc banner hồ sơ | ký tự ◆ CSS | **THAY** — dùng `ngoc_*.png` đã có | — |
| K1 | Phần đầy thanh máu trùm, thanh máu quái | CSS / canvas | GIỮ (động) | — |
| K2 | Số sát thương, +mana, +1★, −1♥ | chữ | GIỮ | — |
| K3 | Vòng màu khoá quanh bệ, đĩa huy hiệu | arc | GIỮ (màu động, tròn tuyệt đối) | — |
| K4 | Vòng nạp kỹ năng, vòng tiến độ grow-up, 3 cung | arc | GIỮ (tiến độ) | — |
| K5 | Vòng tầm bắn nét đứt / vùng Cryo | arc | GIỮ (bán kính động) | — |
| K6 | Kéo-ghép: viền ô hợp lệ, cung nối, gạch chéo | canvas | GIỮ | — |
| K7 | Chạm ụ hỗ trợ: viền đứt, ô tô màu | canvas + `sup_*` | GIỮ | — |
| K8 | Vòng phù văn kỹ năng GHÉP (màu họ) | canvas | GIỮ | — |
| K9 | Dây Marionette, vòng Nemesis, 9 lửa, cầu sáng, REWIND | canvas | GIỮ | — |
| K10 | Lớp hồi chiêu thẻ chỉ huy | CSS chiều cao % | GIỮ | — |
| K11 | Chữ "1×" trên phím tốc độ | chữ | GIỮ | — |
| K12 | Ray mảnh dưới hàng thẻ | CSS 6 px | GIỮ | — |
| K13 | 4 ô số + chip mốc sao + nút Details trong bảng gọn | CSS ô chữ | GIỮ (chữ phải sắc) | — |
| K14 | Thẻ nhỏ trong dải đồng đội (26 px) | CSS viền màu khoá | GIỮ (quá nhỏ cho khung ảnh; khay là ảnh) | — |
| K15 | Nhãn độ hiếm "MYTHIC" / "EPIC" | CSS chữ viền | GIỮ | — |
| K16 | Hộp "Rival / You" + đèn tim PVP | chữ + `den_tim_*` | GIỮ | — |
| K17 | Trang chi tiết: tab 1★–7★, chip Epic/Attack, thang họ, bảng chỉ số, số mục "01" | CSS chữ | GIỮ (bảng dữ liệu) | — |
| K18 | Góc khung xem trước, thẻ 3 dạng grow-up | CSS | GIỮ | — |
| K19 | Ô vuông màu họ "■□" khi xếp theo họ | ký tự | GIỮ | — |
| K20 | Lớp "SOON" thẻ khoá | CSS | GIỮ | — |
| K21 | Cut-in: vệt chéo, ánh quét | CSS hoạt ảnh trên `bang_cutin_nen` | GIỮ | — |
| K22 | Bệ / đường / khay dự phòng khi ảnh lỗi | canvas | GIỮ (chỉ dự phòng) | — |

### Prompt pass 2

**S10 — Nút & khung bảng** · 1536×1536 · lưới 3×3 (ô 512) → `thap-art/raw_s10.png`

| Ô | File | Đích | Dùng cho |
|---|---|---|---|
| 1 | `nut_lon_vang.png` | 9-slice | Start / Resume / Play again (Q14) |
| 2 | `nut_lon_thep.png` | 9-slice | Random / Quit / Change deck / Music / SFX (Q14) |
| 3 | `nut_lon_xanh.png` | 9-slice | Add to deck (Q15) |
| 4 | `nut_nho.png` | 9-slice | Music/SFX/Sort, Back, ‹ › (Q16) |
| 5 | `khung_chon.png` | 9-slice | nút chế độ đang chọn (Q17) |
| 6 | `khung_tt.png` | 9-slice | bảng thông tin chạm ụ (Q12) |
| 7 | `nhan_kn.png` | 3 mảnh | nhãn kỹ năng trên bàn (Q13) |
| 8 | `nut_cong.png` | 32 | nút "+" (Q18) |
| 9 | `ic_thua.png` | 96 | biểu tượng THUA (Q19) |

```
Game UI sheet, 3x3 grid, centered, no text:
1 wide rounded button, glossy amber-yellow with dark steel rim
2 wide rounded button, dark gunmetal with steel rim
3 wide rounded button, bright green with dark steel rim
4 small square steel keycap button
5 thin glowing cyan selection frame, empty inside
6 dark riveted steel info panel frame, empty inside
7 small dark pill label plate, steel rim
8 small round steel button with plus sign
9 broken cracked steel shield icon, defeat
Same style as attached: chunky cartoon mobile-game, bold dark outline, soft top-left light.
Flat solid magenta #FF00FF background, wide gaps.
```

**S11 — Thanh nhỏ & icon** · 1536×768 · lưới 4×2 (ô 384) → `thap-art/raw_s11.png`

| Ô | File | Đích | Dùng cho |
|---|---|---|---|
| 1 | `loi_thanh_khung.png` | 3 mảnh | khung thanh 3 khúc trên lõi (Q20) |
| 2 | `loi_khuc_day.png` | 34×8 ×2 | khúc đầy (Q20) |
| 3 | `loi_khuc_rong.png` | 34×8 ×2 | khúc mất (Q20) |
| 4 | `seg_tat.png` | 16 | ô "Boss in" chưa qua (Q21) |
| 5 | `seg_sang.png` | 16 | ô đã qua / hiện tại (Q21) |
| 6 | `seg_trum.png` | 16 | ô trùm (Q21) |
| 7 | `ic_phat.png` | 48 | nút phát xem trước (Q22) |
| 8 | `ic_lui.png` | 48 | mũi tên Back / ‹ › (Q16) |

```
Game UI sheet, 4x2 grid, centered, no text:
1 long thin empty steel bar frame with 3 slots
2 one glowing cyan-green energy bar segment
3 one empty dark cracked bar segment
4 tiny square LED cell, off, dark grey
5 tiny square LED cell, lit white-cyan
6 tiny square LED cell, red with small skull
7 white play triangle icon
8 white chevron arrow icon pointing left
Same style as attached: chunky cartoon mobile-game, bold dark outline.
Flat solid magenta #FF00FF background, wide gaps.
```
(Đính kèm `thap/assets/hud_wave.png` + một ảnh đầu súng làm mẫu phong cách cho cả S10, S11.)

## 6. Kết quả ráp S8/S9 (pass 2)

Cắt: `python3 tools/thap-cat-s89.py` (khoá magenta, khối liền 3×2, cửa sổ khung giữ trong suốt). Khung thẻ được **chuẩn hoá theo ô cửa sổ** (ảnh 128×148, cửa sổ x 15.6–84.4 %, y 18.9–83.8 %) → 1 bộ CSS cho 6 khung. Code: `thap/js/khung.js` + `thap/css/pass2.css`; mỗi ảnh chỉ bật khi tải được (lớp `html.co-…`), thiếu ảnh → giữ bản CSS cũ.

| Ảnh | Đích (2×) | Dùng ở | Mục |
|---|---|---|---|
| `the_khung_trang/xanh/tim/vang/do.png` | 128×148 | thẻ hàng bộ bài, thẻ màn chọn, 5 ô bộ bài đã chọn (khung trên chân dung, vạch màu khoá mảnh trong cửa sổ) | Q1 Q2 Q3 |
| `the_khung_mv.png` | 128×148 | thẻ chỉ huy hàng dưới | Q4 |
| `ui_trieu_ic.png` | 96 | vòng trống nút Summon (xám khi chưa đủ) | Q6 |
| `ui_lv.png` | 50×32, 3 mảnh | LV1 / ×N | Q7 |
| `ui_gia.png` | 84×40, 3 mảnh | giá nâng cấp + giá chỉ huy | Q8 |
| `ui_den_xanh.png` | 24 | đèn đủ mana | Q9 |
| `ui_grow.png` | 71×28, 3 mảnh | nhãn GROW-UP (trận + menu) | Q10 |
| `ui_khay_doi.png` | 460×151 | khay dải đồng đội/đối thủ, 6 thẻ đặt đúng 6 ô | Q11 |

Còn lại sau pass 2: Q5 (thẻ chỉ huy ở menu — thẻ ngang, khung dọc không hợp → để lại), Q12–Q22 chờ S10/S11, Q23–Q24 dùng ảnh đã có (phiên sau).

## 7. Pass 3 — màn tải + màn mất mạng (2026-11-05)

Đã làm (`thap/js/taitai.js`, `thap/css/taitai.css`, `thap/js/taitai-anh.js`):
- Màn tải có tiến độ thật (đã tải / tổng, %) lúc mở game, lúc vào trận và trong khung Test range; chỉ dùng ảnh ChatGPT có sẵn:
  `nen_menu.jpg`, `logo.png`, khung thanh `hud_trum_khung.png` (9 mảnh), dải đầy `tai_day.png` (cắt dải giữa `tia_laser.png`, đổi sắc sang vàng; bản lưu ở `thap-art/tai_day.png`), vòng xoay `fx_vong_lv.png`.
- Màn mất mạng: `khung_bang` + icon tạm `vong_xich` + nút `hud_trieu_san` (bản thu nhỏ nhúng sẵn để hiện được cả khi không tải được tệp nào).
- Hình vẽ code dự phòng trong `render.js` (bệ `deCode`, ngọc hình thoi, lục giác sao, khay xám, chấm quái/đạn, mũi tên đường) chỉ còn khi có `?debug`.
- Còn lại (file của phiên khác, chưa đụng): `growfx.js` tự vẽ `g_sao_choi`, `g_kim_gio` bằng code; `buff.js` icon vector khi chưa tải.

Prompt ChatGPT cần gen (nền magenta #FF00FF đặc, không chữ, same style as attached):
- **P3-1 icon mất tín hiệu** (đính kèm `vong_xich.png` + `ui_canh_bao_trum.png`): "Game UI icon, broken wireless signal: three curved signal arcs above a small antenna, cracked with a red X, chunky metal sci-fi style, thick dark outline, same style as attached, centered, solid #FF00FF background, no text. 512x512."
- **P3-2 dải đầy thanh tải** (đính kèm `hud_trum_khung.png`): "Horizontal glowing energy fill strip for a loading bar, golden-amber with bright core and subtle segment ticks, seamless left-to-right, same style as attached, solid #FF00FF background, no text. 1024x128."
- **P3-3 khung xem trước trùm** (màn mở đầu trận `thap/js/vaotran.js`; tạm dùng `khung_bang` 9 mảnh; đính kèm `khung_bang.png` + `bang_trum_nen.png`): "Game UI portrait frame for a boss preview card, tall rectangle 3:4, heavy dark gunmetal with red hazard stripes and a small red warning lamp at top, empty dark inner window, chunky sci-fi style, thick dark outline, same style as attached, solid #FF00FF background, no text. 768x1024." → cắt khoá magenta, lưu `thap/assets/khung_trum_xem.png` (bản gốc `thap-art/`), thay `border-image` của `#nd-gt .vt-tt` trong `thap/css/vaotran.css`.

## 8. Test range (skilldemo.js) — bỏ hình vẽ code, cần thêm 1 ảnh (S12)

Đã thay bằng ảnh có sẵn: bàn tay vẽ code → ụ kéo thật của trận (`UI.keo`) + mũi tên `duong_mui`; vòng/mũi tên/nhãn viên thuốc → `fx_starup` / `fx_summon` / `fx_buff` / `fx_vong_lv` / `phu_ngam` / `phu_lua` / `sup_khien` / `ic_*` / `glyph/*`; dải chú thích → `bang_wave_nen`; ô mana/hồi chiêu → `ui_gia` + `ui_mana`; nút chỉ huy → `ui_nut_trieu` + chân dung `af_*` (mặt nạ tròn). Code chỉ còn vẽ chữ/số và mặt nạ làm mờ cột rìa.

**S12 — bàn tay chỉ (1 ảnh, 128×128 → `thap/assets/ui_tay.png`)**, rồi đặt `const SD_TAY = 'ui_tay'` trong `thap/js/skilldemo.js`:
```
Single game UI icon: a white cartoon hand with index finger pointing down-left (tap / drag gesture), thick dark outline, soft shading, same style as attached. Centered, no text. Flat solid magenta #FF00FF background.
```
(Đính kèm `thap/assets/ui_nut_trieu.png` làm mẫu phong cách.)

## 9. HUD v2 — làm theo TU-VAN-HUD.txt (backlog 15 mục) + S10/S11 (2026-11-05)

Cắt: `python3 tools/thap-cat-hud2.py` (khoá magenta + khối liền theo hộp toạ độ, xén alpha, thu về cỡ dùng ×2; hình tròn kéo lại cho vuông rồi `tron()` — mọi vòng tròn lệch ≤1 px). Tờ tổng hợp: `docs/demo-hop-tuong/tuvan/hudv2/cut_contact.png`.
Code: `thap/js/hud2.js` + `thap/css/hud2.css` (nạp sau cùng, chỉ bọc hàm có sẵn; bật bằng `html.co-hud2` / `html.co-s10` khi ảnh tải xong → thiếu ảnh giữ HUD cũ), `render.js` (nhãn kỹ năng dùng `nhan_kn`).
Ảnh chụp trước/sau 360×780 · 390×844 · 430×860 (JPG): `docs/demo-hop-tuong/tuvan/hudv2/truoc/`, `.../sau/` (`tools/thap-kt-hud2.js`). Không lỗi trang; fps 54–60.

| Mục | Ảnh | Đã làm |
|---|---|---|
| 01 Summon | `h2_trieu_cho/san/an/tat` | nút nhấn tròn ở giữa ray (98×88, nhô lên trên ray), chữ SUMMON + giá + ngọc NẰM TRÊN nắp; chờ / 1 nhịp sáng viền khi vừa đủ (false→true, 420 ms, không lặp) / nhấn (giữ ≥110 ms, chữ lún theo nắp) / tắt (thiếu mana hoặc bàn đầy); chạm khi thiếu → lắc 100 ms + giá đỏ |
| 02 khung chung | — | **BỎ QUA** theo quyết định điều phối: giữ 5 khung độ hiếm + khung chỉ huy |
| 03 dữ liệu thẻ | `h2_tag`, `h2_ic_chong`, `h2_chip`, `h2_chip_tat` | LV (trái) + số trên bàn có icon chồng (phải) trong ô cửa sổ khung; ô giá có hốc ngọc; thiếu mana = ô giá xám (hình khác, không chỉ màu); MAX |
| 04 thanh trên | `h2_rail`, `loi_khuc_day`, `h2_ic_tim`, `seg_sang`, `seg_trum` | 1 ray 3 khoang: WAVE n · BOSS IN n (hổ phách ≤3 wave, đỏ khi trùm) · icon sự sống + 3 đèn (sáng = còn, sọ đỏ = mất; PVP 2 hàng Rival/You); rãnh dưới = tiến độ tới trùm (cắt ảnh theo %), khi trùm chạy = máu trùm |
| 05 mana | `h2_lcd`, `h2_ngoc` | màn LCD, số trắng ngà; **1 ngọc mana duy nhất** dùng ở mana, Summon, giá thẻ, giá chỉ huy |
| 06 chỉ huy | `h2_mv_huy`, `h2_vong_*` (đã cắt) | giữ khung chỉ huy (quyết định điều phối); chỉ đổi ô giá + ngọc. Huy chương/vòng nạp cắt sẵn, chưa dùng |
| 07 sao trên bàn | `h2_sao`, `h2_sao_sang` | khiên thép + SỐ to (chữ canvas); 7★ dùng bản viền sáng |
| 08 đồng đội | `h2_khay_doi`, `h2_den_doi` | giá mảnh 5 hốc vuông + hốc tròn chỉ huy, đèn trạng thái; đặt ngay dưới ray (không chồng); chạm vẫn mở bảng thông tin |
| 09 vai trò | `h2_vai_tc/ht/db` (+ `phu`, `kc` chưa dùng) | icon vai trò ở góc dưới-phải ô cửa sổ thẻ (thay icon ụ nhỏ), mờ hơn LV/giá. Game chỉ có 3 vai (Attack/Support/Special) |
| 10 phím | `h2_phim_toc_*`, `h2_phim_dung_*` | 2 phím cùng bộ 56×52; tốc độ >1× = phím sáng + nhãn 1×/2×/3× trên tấm mỏng dưới phím |
| 11 lõi | `h2_loi_0/1/2`, `h2_loi_chop` | lõi nguyên / mẻ / nguy theo số tim (bỏ vết nứt vẽ code), chớp đỏ = ảnh viền đỏ |
| 12 phản hồi | `h2_glint`, `h2_burst` | góc sáng xanh 1 lần khi thẻ vừa đủ mana (false→true), tia vàng + LV nảy 150 ms khi nâng cấp; bỏ quầng xanh quanh khung |
| 13 VFX | `h2_vfx_cong` (6 khung), `h2_vfx_ghep` (2 khung) | cổng triệu hồi tại đúng ô (340 ms), chớp ghép tại ô đích lúc lộ kết quả (240 ms); tối đa 6 cùng lúc, không chạy khi ẩn tab, reduced-motion |
| 14 tấm chữ | `h2_tam_mong` (+ `h2_tam`, `h2_tam_xanh`, `h2_tam_do` đã cắt) | nhãn tốc độ; các tấm còn lại chưa cần (băng wave/trùm, nhãn bàn đã là ảnh) |
| 15 viền | `h2_thanh` (+ `h2_dam`, `h2_bulong` đã cắt) | ray thép dưới hàng thẻ thay vạch CSS |
| S10 | `nut_lon_vang/thep/xanh`, `nut_nho`, `khung_chon`, `khung_tt`, `nhan_kn`, `nut_cong`, `ic_thua` | Q12 bảng thông tin · Q13 nhãn kỹ năng trên bàn · Q14 Start/Resume/Play again/Random/Quit/Change deck · Q15 Add to deck · Q16 Music/SFX/Sort/Back · Q17 chế độ đang chọn · Q18 nút + · Q19 khiên vỡ THUA |
| S11 | `loi_thanh_khung`, `loi_khuc_day/rong`, `seg_*`, `ic_phat`, `ic_lui` | Q20 thanh 3 khúc trên lõi · Q21 ô "Boss in" → rãnh ray + đèn tim · Q22 nút phát xem trước · ‹ › / Back |

Còn vẽ bằng code (giữ) và lý do: chữ/số (LV, giá, mana, wave, tên trùm — đổi ngôn ngữ, sắc nét); nút dừng xem trước khi đang phát dùng phím vuông (không có bản tròn); dấu ✓ thẻ đã chọn ở menu (chưa có ảnh "đã chọn"); nhịp nhấp nháy thanh lõi khi còn 1 tim (độ mờ ảnh); viền/ô của 4 ô số trong bảng thông tin (K13, bảng dữ liệu); quầng sáng lõi (gradient có sẵn của render.js); hình dự phòng khi ảnh chưa tải (chỉ `?debug`). Bỏ qua: #02 (quyết định điều phối), hàng 1 tấm 13 (viền nén nút hình chữ nhật — không khớp nút tròn), lớp phủ "không khả dụng" tấm 12 (ô giá xám đã đủ).
Lỗi có sẵn (không thuộc phiên này): PVP đôi khi xin `assets/ic_cdmg.png` (404).

## 10. Pass 3 — kéo ghép (P0-02) + kết quả ghép (P0-03) (2026-11-05)

Code: `thap/js/keoghep.js` (mới), `ui.js ganCham` (kéo/chạm–chạm/huỷ), `nhandien.js veKeo/veKeoTren` (giao cho KG), `render.js veO/veKeo` (mờ ô sai 0.4, đầu ụ nằm trên ngón tay).
Bỏ hình vẽ code cũ: viền bạc hà + chấm tâm, cung nối nét đứt, vòng gạch chéo, bóng tròn dưới ụ đang kéo.
Dùng tạm ảnh có sẵn: ô hợp lệ = `khung_chon` (S10, 9 mảnh) · ô rê hợp lệ / ụ đã chọn = `sup_ring` · ô rê sai = `h2_vong_do` · tấm kết quả + mẹo = `nhan_kn` + `h2_sao` (số sao to) · chớp = `h2_vfx_ghep` (hud2_13).
Kiểm thử: `tools/thap-kt-keoghep.js` · ảnh `docs/demo-hop-tuong/tuvan/keoghep/`.

Prompt ChatGPT cần gen (nền magenta #FF00FF đặc, không chữ, same style as attached — đính kèm `khung_chon.png` + `sup_ring.png`):
- **P3-3 bốn vòng đích kéo ghép** → `kg_vong_hople/chon/sai/xong.png` (cắt 128): "Game UI sheet, 4x1 grid, 4 perfectly circular target rings for a merge drag: 1 valid (subdued steel with soft cyan glow), 2 selected (bright cyan, thicker, 4 small notches), 3 invalid (dark steel with dull orange-red edge), 4 merged (bright white-gold flash ring). Transparent empty centers, same style as attached, solid #FF00FF background, no text. 1024x256."
- **P3-4 tấm kết quả ghép** → `kg_tam_ketqua.png` (3 mảnh ngang, cao 48): "Small beveled dark-steel merge result plaque, wide horizontal pill, clear empty center for text, small round socket on the left for a star badge, simple lightning-bolt corners in cyan, same style as attached, centered, solid #FF00FF background, no text. 1024x256."
## 11. Pass 3 — tiền tệ + chỉ huy (P0-06 / P0-09, 2026-11-05)

Đã làm (`thap/js/chihuy.js` luật, `thap/js/tien-ui.js` + `thap/css/tien.css` HUD, `TIEN`/`CHI`/`LUAT_MV` trong `data.js`, test `node tools/test-chihuy.js`):
- Chỉ có 1 tiền: MANA trong trận. Ngọc `h2_ngoc` chung cho hộp mana, Triệu hồi, Chỉ huy. Số xanh "100" dưới thẻ = **POWER-UP theo loại trong trận** (LV1→5, +18% sát thương, trả bằng mana) → icon riêng `ui_nangcap` (mũi tên xanh) + gợi ý 1 lần (khung `khung_tt`).
- Tạm dùng ảnh có sẵn: thanh RAGE = `h2_tam_mong` + `loi_khuc_day` (đổi sắc cam); khiên lõi = `ic_khien`; chớp ô Reinforce = cổng triệu hồi HUD2 có sẵn; hồi chiêu = số giây (chữ).

Prompt ChatGPT cần gen (nền magenta #FF00FF đặc, không chữ, same style as attached):
- **P3-3 3 glyph** (đính kèm `h2_ngoc.png` + `ui_nangcap.png`): "3 small game UI glyphs in a row, same style as attached: purple mana crystal, green upgrade-arrow hex token, orange cooldown clock. Crisp, thick dark outline, readable at 14px. Solid #FF00FF background, no text."
- **P3-4 3 overlay trạng thái** (đính kèm `h2_tam_mong.png` + `loi.png`): "3 separate thin industrial status overlays, same style as attached: orange rage edge glow strip (seamless, for a board frame), cyan shield ring around a round core, gold spawn flash burst for one square tile. Solid #FF00FF background, no text."
- **P3-5 dải đầy cam** (đính kèm `loi_khuc_day.png`): "Same pill fill strip as attached but molten orange, bright core, solid #FF00FF background, no text. 256x32." (thay `hue-rotate` của thanh RAGE)

## 12. Pass 3 — hướng dẫn lần đầu, bộ khởi đầu, màn kết quả (P0-01 · P1-01 · P1-02 · P0-07, 2026-11-05)

Đã làm (`thap/js/huongdan.js`, `thap/js/bobai.js`, `thap/js/ketqua.js`, `thap/css/huongdan.css`) — chỉ dùng ảnh có sẵn trong lúc chờ:
- Bảng chỉ dẫn hướng dẫn: `khung_tt` (9 mảnh) · mũi tên chỉ đích: `h2_canh_bao` xoay 180° · nút GOT IT / SKIP: `nut_nho` · thanh gọn khi chơi tự do: `h2_tag`.
- Bộ khởi đầu: thẻ `khung_tt`, đang dùng `khung_chon`; chip vai trò `h2_chip` / `h2_chip_tat`; ô tìm `h2_lcd`.
- Màn kết quả: bảng `khung_bang`, 3 ô số `h2_lcd`, nút `nut_lon_thep/vang`.

Prompt ChatGPT cần gen (nền #FF00FF đặc, không chữ, same style as attached — đính kèm `khung_tt.png` + `h2_lcd.png`):
- **P3-HD1 tấm chỉ dẫn** (4 ô 1×4, 1536×1024): "4 small industrial tutorial callout plates, gunmetal with cyan pointer corner (top, bottom, left, right), empty center, separate pieces, same style as attached, solid #FF00FF background, no text."
- **P3-HD2 mũi tên chỉ** (512×512): "Chunky glowing cyan-gold pointer arrow pointing down, metal sci-fi, thick dark outline, same style as attached, solid #FF00FF background, no text."
- **P3-HD3 bảng tổng kết trận** (1536×1024): "Wide matte-gunmetal battle summary plaque with 3 empty inset metric wells and one highlight rail, same style as attached, solid #FF00FF background, no text."
- **P3-HD4 huy hiệu bộ khởi đầu** (lưới 3×2, 1536×1024): "6 small sci-fi strategy emblem icons: crosshair, explosion, snowflake, mana crystal, chain links, shield; unified metal style, same style as attached, solid #FF00FF background, no text."
- **P3-HD5 chip vai trò** (lưới 3×1, 1536×512): "3 engraved metal role-glyph chips: sword (attack), plus-cross (support), star-gear (special), same style as attached, solid #FF00FF background, no text."

## 13. Pass 3 — thanh trên dễ đọc (P0-05) + huy hiệu sao/LV/độ hiếm/vai trò (P0-04) (2026-11-05)

Code: `thap/js/hudtop.js` + `thap/css/hudtop.css` (nạp sau cùng), `hud2.js` (khiên sao to 1.35d, số 0.86d, ô vẽ 1.7d), `render.js` (`REN.anNgoc`: bỏ ngọc độ hiếm trên bệ). Kiểm: `tools/thap-kt-hudtop.js` · ảnh `docs/demo-hop-tuong/tuvan/hudtop/` (360/390/430 × SOLO/CO-OP/PVP: băng wave 0,25 s · sau 0,75 s · trùm đập · còn 1 tim).
- Thanh trên: `WAVE N` (chevron `h2_canh_bao`) | `BOSS IN N` (chân dung trùm, vaotran.js) | `♥ N/3` (`ht_tim` = `ui_tim` thu nhỏ 40 px). Ray `h2_rail` giãn 330 px bằng 2 nửa ảnh gốc, chỉ giãn dải phẳng 6 px cạnh tấm thông gió (không méo bu-lông). Cảnh báo trùm: chỉ khoang Boss đập 2,6 s. Băng WAVE / băng trùm: 0,7 s rồi trượt lên ray. CO-OP: tấm treo `h2_tam_xanh` "SHARED"; PVP: khoang = YOU, tấm treo `h2_tam_do` = RIVAL ♥ N/3.
- Thẻ trong trận: vai trò trên-trái · LV trên-phải (chỉ trên thẻ) · nhận diện dưới-trái · số ụ trên bàn dưới-phải. Thẻ menu: icon vai trò trên-trái. Ụ trên bàn: chỉ sao số to (trên-phải, cố định, lùi vào ô) + nhận diện (trên-trái); độ hiếm = khung thẻ.

Prompt ChatGPT cần gen (nền #FF00FF đặc, không chữ, same style as attached — đính kèm `h2_rail.png` + `h2_sao.png`):
- **P3-HT1 ray HUD rộng** (1536×256 → cắt 1320×184): "Single compact brushed-gunmetal HUD rail, 3 empty label wells (middle well twice as wide), thin progress groove under the middle, caution-yellow edge accents, same style as attached, solid #FF00FF background, no text."
- **P3-HT2 tấm treo tim** (1024×256 → cắt 2 tấm 140×34): "2 small hanging gunmetal sub-plates hooked under a rail, one with a cyan LED (ally), one with a red LED (rival), empty center, same style as attached, solid #FF00FF background, no text."
- **P3-HT3 3 icon thanh trên** (1536×512, lưới 3×1 → cắt 40 px): "3 tiny bold HUD icons, thick dark outline, readable at 14px: wave (stacked yellow chevrons), boss (red horned skull), life (glossy red heart), same style as attached, solid #FF00FF background, no text."
- **P3-HT4 7 tấm số sao** (1536×256, 1 hàng 7 ô → cắt 64 px): "7 uniform tiny industrial numbered-badge blank backplates, dark steel shield with one subtle gold-metal outline, 7th slightly brighter gold, empty centers for live numerals, same style as attached, solid #FF00FF background, no text."

## 14. Chân dung phi công bị cắt mất mắt / đỉnh đầu NGAY TRONG ẢNH GỐC (2026-11-05, session mặt-chân-dung)

Code cắt quanh mặt cho mọi chỗ hiện chân dung: `FACE_BOX` + `MAT.fit()` trong `thap/js/khung.js` (soát: `docs/demo-hop-tuong/tuvan/mat/hero_all.png`, `card_all.png`).
8 ảnh gốc ChatGPT (`thap-art/redo/pilot_<id>_v2.png`, lưới `raw_fp2.png`, `raw_fp9.png`…) bị cắt ngay ở mắt/trán → code KHÔNG thể hiện đủ mặt, phải gen lại:
**overlord, doc, docton, chuato, nhieusong, dichchuyen, chimang, nhanban** (trong FACE_BOX đánh dấu phần tử thứ 4 = 1; gen xong thì bỏ cờ và chạy lại `tools/thap-pilot-fit.py`).

Prompt (đính kèm ảnh v2 cũ của đúng nhân vật + `pilot_canon.png` làm mẫu bố cục; lưới 4×2, 1774×887, mỗi ô 1 nhân vật):
- **P-MAT1** "Same 8 characters and outfits as the attached portraits, redrawn as bust portraits with the WHOLE head inside the frame: full hair/hat and forehead visible, eyes at about 35% from the top, 12% empty space above the hair, shoulders and signature weapon below. Same anime gacha style, same colors, dark plain background, 4x2 grid, no text."

## 15. Pass 3 — online: tài khoản + CO-OP online (2026-11-05)

Code: `thap/js/online/*.js` + `thap/css/online.css` (chi tiết: `docs/demo-hop-tuong/ONLINE-FIREBASE.md`). Trong lúc chờ chỉ dùng ảnh có sẵn:
bảng `khung_bang` (lớp `.bang`) · nút `nut_lon_*` (lớp `.nut`) · chip tài khoản + thẻ người chơi `khung_tt` · ô mã phòng / ô nhập / ô số hồ sơ `h2_lcd` ·
khung ụ trong sảnh `the_khung_<bậc>` · ảnh đại diện `pilot_*` (mặt nạ tròn) · chỉ huy `af_*` · đèn online `led_xanh` / mất `den_tim_tat` ·
nhãn READY `h2_tam_xanh` · ô ping `h2_tag` · nút ONLINE: `ic_coop` + `led_xanh` · màn mất kết nối: `vong_xich` (chờ P3-1 icon mất tín hiệu ở mục 7).

Prompt ChatGPT cần gen (nền magenta #FF00FF đặc, không chữ, "same style as attached" — đính kèm `ic_coop.png` + `khung_tt.png`):
- **P3-ON1 icon chế độ ONLINE** (512×512 → cắt 96 px, `thap/assets/ic_online.png`, thay `.che.onl-che::before`): "Game UI mode icon: two small pilot helmets side by side linked by a glowing cyan signal arc above them, chunky metal sci-fi style, thick dark outline, same style as attached, centered, solid #FF00FF background, no text."
- **P3-ON2 tấm thẻ người chơi trong sảnh** (1536×512, 2 tấm → cắt 9 mảnh, `thap/assets/sanh_the.png` + `sanh_the_san.png`, thay `border-image` của `.sanh-p` / `.sanh-p.san`): "2 wide horizontal gunmetal player nameplates for a multiplayer lobby, left round avatar socket, empty middle, a row of 6 small empty card slots along the bottom; second plate identical but with a green READY glow along the edges, same style as attached, solid #FF00FF background, no text."
- **P3-ON3 ô mã phòng** (1024×256 → `thap/assets/ma_phong.png`, thay `.sanh-ma`): "Wide glowing green LCD code display plate with 4 separated empty digit windows, heavy dark steel bezel with 4 bolts, same style as attached, solid #FF00FF background, no text."
- **P3-ON4 bộ 4 icon nhỏ online** (1536×384, lưới 4×1 → cắt 48 px: `ic_ping_tot`, `ic_ping_xau`, `ic_chia_se`, `ic_google_khung`): "4 small bold HUD icons, thick dark outline, readable at 16px: green signal bars (good connection), red signal bars with a crack (bad connection), share arrow coming out of a box, an empty round white badge socket (for a sign-in logo), same style as attached, solid #FF00FF background, no text."
- **P3-ON5 chip tài khoản** (768×256 → cắt 9 mảnh, `thap/assets/tk_chip.png`, thay `#tk-chip`): "Small horizontal gunmetal pill-shaped account badge, round avatar socket on the left with a thin cyan ring, empty right part for a name, same style as attached, solid #FF00FF background, no text."
Ghi chú: nút "SIGN IN WITH GOOGLE" hiện chỉ là chữ trên `nut_lon_thep` — không tự vẽ logo Google; muốn có logo thì dùng đúng ảnh logo chính thức của Google (theo hướng dẫn thương hiệu) đặt trong `ic_google_khung`.

## 16. Pass 4 — board (rà soát 100% vẽ tay trên bàn chiến đấu, 2026-11-05)

Bảng kiểm kê đầy đủ: `docs/demo-hop-tuong/VE-TAY-RASOAT-BOARD.md`. Mọi phần tử vẽ code trong khu đã bỏ hoặc thay PNG có sẵn; 3 chỗ chờ ảnh mới (đang để màu đặc / PNG tạm).
Gen xong lưu `docs/demo-hop-tuong/thap-art/raw_p4_board_N.png`, cắt khoá magenta (quy tắc 5).

- **raw_p4_board_1 — sàn trận** (1 ô, 1024×2048, lát được theo chiều dọc) → `thap/assets/san_tran.png`, thay màu nền đặc #1d1f23 trong `REN.lamNen0`:
  "Seamless dark gunmetal factory floor texture, subtle steel plates and faint grime, very low contrast, darker toward the edges, same style as the attached game screenshot, no text."
- **raw_p4_board_2 — 5 đĩa màu khoá bộ bài** (lưới 5×1, 1280×256) → `thap/assets/nd_dia_<0..4>.png` (96 px), đặt sau `h2_vai_*` ở góc trên-trái ô để trả lại màu khoá:
  "5 small round metal badge sockets with a glowing colored rim: blue, red, lime, teal, purple; empty dark center, chunky outline, same style as the attached game screenshot, flat #FF00FF background, no text."
- **raw_p4_board_3 — vòng nạp năng lượng chia đoạn** (lưới 4×2, 8 khung 0→100 %, 1024×512) → `thap/assets/vong_nap_<0..7>.png` (thay `fx_vong_mong` tô màu ở `REN.veU`):
  "8 frames of a thin white segmented energy ring filling clockwise from 1/8 to full, soft glow, same style as the attached game screenshot, flat #FF00FF background, no text."

- **raw_p4_board_4 — thẻ chỉ huy trong trận** (lưới 3×2, 1536×1024, ô 512; đính kèm ảnh `docs/demo-hop-tuong/tuvan/chihuy/san_390_eve.png`) → cắt vào `thap/assets/cht_*.png`, đổi biến/ảnh ở đầu `thap/css/chihuy-the.css` + `CHT.VONG_TAC` (`thap/js/chihuy-the.js`). Đang dùng tạm: khung_chon (quầng), h2_vong_do+h2_ngoc (huy hiệu), h2_vong_xam/tim/do + fx_vong_mong (vòng quét):
  "Same style as the attached game screenshot, flat #FF00FF background, no text. 1) soft cyan-white READY glow halo hugging a tall card frame (aspect 0.83), empty transparent inside; 2) small round LOCK badge: steel ring with a purple mana crystal and a tiny padlock; 3) empty dark steel ring gauge track (perfect circle, thick); 4) same ring fully filled with bright violet energy; 5) same ring filled with red-orange rage fire energy; 6) same ring filled with golden holy light."

## Pass 4 — ui (rà soát vẽ tay 100 %, vùng UI: menu, trang ụ/chỉ huy, bảng thông tin, cut-in, kết quả, online, tải; 2026-11-05)

Bảng kiểm kê: `docs/demo-hop-tuong/VE-TAY-RASOAT-ui.md`. Mọi chỗ khác đã thay bằng ảnh có sẵn; trong lúc chờ, phần dưới đang **không vẽ gì / dùng ảnh gần nhất**.
Gen 1 tấm, lưu `docs/demo-hop-tuong/thap-art/raw_p4_ui_1.png` (session UI tự cắt + nối khi tấm xuất hiện):

**raw_p4_ui_1.png** — lưới 3×2, 1536×1024, nền magenta #FF00FF đặc, mỗi ô 1 vật, không chữ, "same style as the attached game screenshot" (đính kèm `docs/demo-hop-tuong/tuvan/vetay/ui/sau/04-unitpage.jpg`):
1. `ic_cdmg` — "Crit-damage buff icon: bold blue 4-point star inside a thin steel ring, thick dark outline, readable at 16 px." (đang dùng `ic_crit`)
2. `sao_chu` — "Tiny flat gold star for inline text, thick dark outline, no glow, no sparkle." (đang dùng `ui_sao`, quầng hồng hơi to khi nhỏ)
3. `ci_quet` — "Diagonal white-cyan light streak / glint sweep, soft edges, for a steel banner." (vệt quét cut-in — đã gỡ, đang không có)
4. `hang_sang` — "Thin horizontal steel row highlight strip with faint cyan inner glow edges, very dark centre." (dòng mốc sao trong bảng — đang là nền tô màu trơn)
5. `mui_tiep` — "Small steel chevron arrow pointing right, amber edge light." (mũi tên giữa 3 dạng grow-up — đang là ký tự ›)
6. ô 6 để trống (magenta).

## 17. Pass 4 — fx (rà soát 100% vẽ tay vùng hiệu ứng / kỹ năng / quái-trùm, 2026-11-05)

Bảng đầy đủ: `docs/demo-hop-tuong/VE-TAY-RASOAT-fx.md` (93 thứ vẽ code → 70 PNG có sẵn, 5 PNG tạm, 18 bỏ). Mọi vẽ FX nay qua bộ **PX** (fxu.js): chỉ đặt/xoay/phóng/mờ/tô màu PNG.
Cần 1 tờ ảnh mới để thay 5 chỗ đang dùng PNG tạm + 1 chỗ đã bỏ (VHS). Gen xong lưu `docs/demo-hop-tuong/thap-art/raw_p4_fx_1.png` → session fx cắt (khoá magenta) + nối.

### raw_p4_fx_1 · 1024×1024 · lưới 4×4 (ô 256) · nền magenta #FF00FF đặc · same style as the attached game screenshot · no text
Prompt chung (dán đầu): *"Game VFX sprite sheet, 4x4 grid of 256px cells, flat solid magenta #FF00FF background, each item centered with padding, top-down view, perfect circles stay perfectly round, same painted mobile-game style as the attached game screenshot, no text, no letters."*

| ô | id | prompt (1–2 dòng) | thay cho |
|---|---|---|---|
| 1 | rong_bay | Top-down mechanical fire dragon flying with wings spread, head pointing right, red-gold armor plates, glowing orange eyes. | thân rồng DRAGON DIVE (đang dùng fx_ronglua_no) |
| 2 | rong_bay_xanh | Same top-down mechanical dragon, blue-white flame variant, wings spread, head right. | rồng dạng 2/3 (đang tô màu) |
| 3 | luoi_bang | Round frost floor decal: hexagon ice lattice inside a perfect circle, pale cyan lines, transparent center gaps. | sàn lưới băng Cryo dạng 3 (đang hu_vongbang) |
| 4 | vhs | Horizontal strip of red/cyan VHS rewind scanlines and glitch bars, semi-transparent, tileable left-right. | lớp phủ tua ngược REWIND (đã bỏ) |
| 5 | grow_cung_trong | Thin dark metal ring segment, 1/3 of a circle arc, empty groove, perfectly circular curvature. | nền cung đo grow-up |
| 6 | grow_cung_day | Same 1/3 circle arc segment, filled with bright white glowing energy (tintable), soft glow. | cung đo grow-up (đang fx_vong_mong cắt) |
| 7 | grow_moc | Tiny bright white notch/tick marker gem for a ring gauge, diamond shape. | vạch mốc đổi dạng |
| 8 | thanh_quai | Tiny horizontal enemy HP bar frame, dark metal, empty inside, very thin (aspect 8:1). | khung thanh máu quái |
| 9 | thanh_quai_day | Matching thin bar fill, flat bright white with subtle highlight (tintable), aspect 8:1. | mức máu quái (đang tai_day) |
| 10 | thanh_trum | Small boss HP bar frame with tiny skull cap on the left, dark red metal, aspect 6:1. | thanh máu trùm trên đầu |
| 11 | tam_ngam_trang | White glowing targeting reticle: circle with 4 short ticks and small center dot (tintable). | vòng ngắm chung (đang fx_tia_hieu tô màu) |
| 12 | day_trang | Thin straight white glowing energy thread with soft glow, horizontal, tileable (tintable). | dây/tia mảnh chung (đang fx_laser_tia) |
| 13 | dau_an_luc_giac | Emerald hexagon rune mark, glowing, top-down, small. | dấu ấn Hydra (đang vòng + sao) |
| 14 | canh_sen | Single golden steel lotus petal, pointed, glowing edge, pointing right. | 8 cánh sen Genesis (đang fx_tia_sao) |
| 15 | vay_vang | Single small golden fin/spike pointing outward, glowing. | vây VỰC SÂU Leviathan (đang fx_tia_sao) |
| 16 | bong_mem | Soft black oval drop shadow, blurred edges, top-down. | bóng quái / drone / rồng (đang fx_cham_trang tô đen) |

## 18. Pass 3 — grow-up stages (ảnh dạng 1/2/3 của 15 ụ grow-up, 2026-11-05)
Kiểm + cắt lại: `tools/thap-kt-cat-hinh.py` (cờ mép phẳng / mảnh lạ / s1==s2), `tools/thap-cat-du.py` (so lại vị trí trong tấm raw → lấy ĐỦ thành phần liên thông của hình,
bỏ mảnh hình bên cạnh, tách 2 hình dính nhau, giữ tâm/tỉ lệ cũ), ảnh kiểm `docs/demo-hop-tuong/tuvan/growcut/` (audit_before.png, audit_after.png, cat-du.json).
**Không có ảnh dạng 2 riêng** cho 5 ụ dưới đây (tấm raw chỉ có đầu gốc + đầu thức tỉnh) → `_s1 == _s2` (giữ tạm). Gen mỗi ụ 1 hàng 3 dạng như `raw_grow_stages.png`
(đính kèm `raw_grow_stages.png` + đầu hiện tại `thap/assets/<id>_nong.png`), cắt bằng `tools/thap-cat-du.py` rồi đưa id về `STAGE_K` (artscale.js):
- **P3-GS1 hydra**: "Same style as attached sheet: one row of 3 grow-up stages of the attached Hydra turret head (strict top-down, round body centered, barrels pointing RIGHT): 1 base gold body with 4 serpent-neck barrels, 2 bigger with 5 heads and emerald glowing eyes and gold crest plates, 3 awakened single large dragon-cannon head with gold crest and emerald glow; generous spacing so nothing touches, flat pure #FF00FF background, no text."
- **P3-GS2 cuuvi**: "Same style as attached sheet: one row of 3 grow-up stages of the attached Nine-Tail fox turret head (strict top-down, round body centered, muzzle pointing RIGHT): 1 gold fox head with 6 orange metal tails, 2 eight flame tails brighter and longer, 3 awakened nine white-gold blue-fire tails forming a full ring; generous spacing so tails never touch the next cell, flat pure #FF00FF background, no text."
- **P3-GS3 ngaithoigian**: "Same style as attached sheet: one row of 3 grow-up stages of the attached Chrono Throne turret head (strict top-down, round body centered, hour-hand barrel pointing RIGHT): 1 black-gold clock face with ruby hour dots, 2 adds small gold wings and a crown, 3 awakened gold throne with four hourglass wings and glowing ruby core; generous spacing so wings never touch the next cell, flat pure #FF00FF background, no text."
- **P3-GS4 ronglua**: "Same style as attached sheet: one row of 3 grow-up stages of the attached Wyrm Engine dragon turret head (strict top-down, round body centered, mouth pointing RIGHT): 1 red-gold dragon head on a gear ring, 2 bigger horns and glowing throat, 3 awakened with two mechanical bat wings wrapped around the body and white-hot eyes and throat; generous spacing, flat pure #FF00FF background, no text."
- **P3-GS5 luoicheo**: "Same style as attached sheet: one row of 3 grow-up stages of the attached Resonance Grid support turret head (strict top-down, no barrel, square gold frame rotated 45° with 4 diagonal prongs, crystal core, teal #2fd6c0): 1 base, 2 prongs longer with teal light and a second inner ring, 3 awakened prongs blazing with arc halos at the 4 tips; generous spacing, flat pure #FF00FF background, no text."
Ghi chú: 10 ụ còn lại có ảnh dạng 1/2/3 riêng nhưng vẽ theo ĐẦU CŨ (không khớp đầu v2 đang dùng) nên vẫn tạm cất ở `STAGE_K_CHO` — trong trận cả 3 dạng
đang dùng đầu v2 + quầng màu (growfx.js mục 7). Muốn thấy rõ đổi dạng trên bàn: gen thêm 1 hàng 3 dạng cho mỗi ụ theo đúng mẫu trên (đính kèm đầu v2 `<id>_nong.png` làm dạng 1).

**Đã nối raw_p4_ui_1.png** (`tools/thap-cat-p4-ui.py`, khoá magenta + khoá vùng kín trong vòng): `ic_cdmg` (96 px, ký hiệu buff CRIT DMG), `sao_chu` (64 px, ★ trong chữ DOM), `ci_quet` (vệt quét băng cut-in), `hang_sang` (9 mảnh, dòng mốc sao), `mui_tiep` (48 px, mũi tên grow-up). Vùng UI hết mục chờ ảnh.

## Pass 7 — detail/lobby/boss (HUD mượt C: trang ụ, trang chỉ huy, sảnh online, màn trùm mở trận, kết quả; 2026-11-05)

Theo `thap-art/TU-VAN-HUD-MUOT.txt` §5 (U01–U06, L01–L05, X01–X06). Trong lúc chờ, các màn đã dựng lại bằng ảnh có sẵn
(nen_menu.jpg, khung_tt, khung_bang, h2_tam, h2_lcd, nut_lon_vang/thep, ic_lui, mui_tiep, ic_phat, trum_<id>_8, af_*, pilot_*).
Gen xong lưu vào `docs/demo-hop-tuong/thap-art/raw_p7_<id>.png` → session HUD-C cắt (khoá magenta, 3× cỡ hiển thị) + nối.
Nếu tấm A12 (bộ icon chung) của session HUD-A đã có thì c2 có thể bỏ — HUD-C dùng chung.

**Tiền tố chung (dán đầu mọi prompt):** *"Match the attached TURRET MERGE screenshot: premium chunky sci-fi industrial metal, graphite gunmetal, restrained antique brass, sparse cyan energy, crisp mobile game UI illustration. Isolated sprites on FLAT SOLID #FF00FF magenta background, no text, no letters, no numbers, generous padding, no drop shadow outside sprite bounds."*
Đính kèm: `docs/demo-hop-tuong/tuvan/hudmuot/c/sau/u_common_390.png` (hoặc ảnh trước `.../c/truoc/u_common_390.png`).

| tấm | lưới | ô → id | prompt |
|---|---|---|---|
| **raw_p7_c1.png** | 1536×1024, 3×2 | 1 `p7_stat` | Small recessed graphite stat cell plate, tiny round metallic icon socket on the left, wide empty number area, one thin beveled edge, landscape 3:1. |
| | | 2 `p7_skill` | Wide simple gunmetal skill description plate with one small cyan accent tab on the top-left edge, calm empty center, no dividers, landscape 4:1, 9-slice friendly. |
| | | 3 `p7_test` | Thin dark interactive row plate with a small round target emblem socket on the left and a right chevron socket, landscape 6:1. |
| | | 4 `p7_code` | Large horizontal communications console plate, broad blank dark code screen, two small square button sockets on the right, restrained cyan indicator light, landscape 2.4:1. |
| | | 5 `p7_row` | Wide low-profile teammate row plate with a circular avatar recess on the left and a tiny status-light socket on the right, empty center, landscape 4:1. |
| | | 6 `p7_ghost` | Neutral dark metal pilot silhouette emblem inside a round recess (head and shoulders), faint cyan signal dots above, square. |
| **raw_p7_c2.png** | 1024×512, 4×2 | close · copy · share · chevron_right · target · check · info · crown | Consistent chunky metallic UI icons, 24px reading size, steel with brass rim, one per cell: close X, copy (two sheets), share (arrow out of box), right chevron, crosshair target, check mark, info "i" disc, small host crown. |
| **raw_p7_c3.png** | 1536×1024, 3×2 | mad_crown · freezer · janus · joker_king · nightmare · octopus | Large boss bust portraits for an intro screen, SAME characters as the attached sprite strips `thap/assets/trum_<id>_8.png` (attach all six), 3/4 front view, head and shoulders filling the cell, strong readable face, isolated. |
| **raw_p7_c4.png** | 1536×1024, 3×1 (cao) | 1 `p7_boss_big` · 2 `p7_boss_small` · 3 `p7_wave_badge` | 1: tall heavy graphite-and-bronze boss portrait frame, big open window, one small badge socket at the top. 2: small landscape boss preview plate with square art opening on the left and a short empty text strip. 3: small red-bronze wave badge plate, empty. |
| **raw_p7_bg_detail.png** | 1024×1536 OPAQUE (không magenta) | nền trang ụ/chỉ huy | Portrait dark workshop interior, gentle top lighting, uncluttered negative space in the upper half for hero art, calm low-contrast lower half for controls, no interface, no words. |
| **raw_p7_bg_lobby.png** | 1024×1536 OPAQUE | nền sảnh online | Portrait quiet futuristic radio room with two vacant pilot stations, dark graphite and warm brass, calm low-contrast centre, no text. |

Tuỳ chọn (P2, nhiều ảnh): chân dung phi công cỡ lớn (bust 768 px, không khung) cho hero trang ụ — hiện `pilot_<id>.png` chỉ 256 px nên hero chỉ phóng ~1.1×.
## Pass 7 — home/deck (HUD mượt A: tách HOME + màn XÂY BỘ BÀI theo TU-VAN-HUD-MUOT.txt §3A/§3B/§5, 2026-11-05)

Session HUD-A dùng tạm ảnh có sẵn (nen_menu, logo, af_* chỉ huy, nut_lon_vang/thep, h2_tam*, h2_lcd, o_trong, khung_chon, the_khung_*, chon_* hiệu ứng thẻ đã chọn) và **chữ thay icon** (BACK / FILTER / PRESETS / SETTINGS) cho tới khi tấm dưới về. Gen xong lưu `docs/demo-hop-tuong/thap-art/raw_p7_<id>.png` → session ráp cắt khoá magenta (QUY-TAC §5, 3× cỡ CSS lớn nhất) và thay biến ở đầu `thap/css/hudmuot-a.css` (mỗi biến `--p7-*` ghi tên ảnh đang dùng tạm).

**Tiền tố chung (dán đầu MỌI prompt, đính kèm `docs/demo-hop-tuong/tuvan/hudmuot/a/sau-home-390.png` + `sau-deck-3-390.png`):**
*"Match the attached TURRET MERGE screenshots: premium chunky sci-fi industrial metal, graphite gunmetal, restrained antique brass, sparse cyan energy, crisp game UI illustration, polished readable silhouettes. Isolated sprites on FLAT SOLID #FF00FF magenta background, no text, no letters, no numbers, no UI mockup, nothing touches the cell edges, generous padding."*

| raw | cỡ / lưới | nội dung (prompt ngắn, theo thứ tự ô) | thay cho (tạm) |
|---|---|---|---|
| raw_p7_h01 | 1024×1536, 1 ảnh, **NỀN ĐỤC (không magenta)** | H01 "Portrait full-frame dark industrial turret hangar, dramatic upper architecture with hanging cranes and a big round blast door, calm low-contrast lower half almost empty floor, cool graphite + faint brass light, no interface, no words." | nen_menu.jpg |
| raw_p7_d00 | 1024×1536, 1 ảnh, **NỀN ĐỤC** | Deck backdrop "Portrait muted engineering workshop wall, very low contrast graphite panels, soft top light, almost no detail in the middle and bottom, no interface, no words." | nen_menu.jpg (tối) |
| raw_p7_h02 | 1024×1536, 1 hình, magenta | H02 "Large charismatic young turret pilot in brass-trim navy coat standing beside an oversized silver-brass round top-down-style cannon turret, dynamic 3/4 view, waist-up pilot on the left, turret on the right, clean silhouette, composition weighted centre-right, bottom edge may fade, isolated." | af_<chỉ huy> phóng to |
| raw_p7_a1 | 1024×1536, 1 cột × 6 hàng (ô 1024×256) | 1 A02 "Wide heavy brass mechanical action button, broad empty center" NORMAL · 2 same PRESSED (darker, sunk 2 px) · 3 same DISABLED (desaturated grey brass) · 4 A03 "Quiet dark graphite mechanical button, thin steel rim" NORMAL · 5 A03 PRESSED · 6 A01 "Wide shallow gunmetal panel, one thin beveled edge, minimal rivets, calm empty center, 9-slice-friendly." | nut_lon_vang / nut_lon_thep / khung_tt |
| raw_p7_a2 | 1536×1024, lưới 3×2 (ô 512) | 1 A04 "Square brass card outline with restrained cyan edge energy and four locked corner brackets, hollow empty center" · 2 A06 "Portrait card plate, simple dark metal, subtle round rarity socket at the bottom, broad artwork window, no inset mini frames" · 3 A07 "Compact square metal deck slot, EMPTY, dark recessed interior with a faint plus-shaped groove" · 4 A07 same slot OCCUPIED rim (hollow center) · 5 A07 same slot ARMED-FOR-REPLACE (amber pulsing rim, hollow center) · 6 A07 same slot SELECTED (cyan rim, hollow center) | khung_chon / the_khung_* / o_trong |
| raw_p7_a3 | 1024×1536, 1 cột × 6 hàng (ô 1024×256) | 1 A09 "Thin wide graphite header plate with two small brass anchor corners and clean empty center" · 2 A10 "Long recessed gunmetal search field, simple border, empty interior" · 3 H03 "Wide recessed mode-selection capsule with one small mechanical dropdown socket on the right, subdued graphite and brass" · 4 D01 "Wide low-profile plate with a square portrait opening on the left and empty label area on the right, single brass edge" · 5 D03 "Wide slim industrial preset row with small round icon socket on the left, minimal frame, empty text area" · 6 A11 "Small dark horizontal currency counter capsule, purple crystal socket on the left, empty number area" | h2_tam_mong / h2_lcd / h2_tam_xanh / khung_tt / h2_tam |
| raw_p7_a4 | 1024×1024, lưới 4×4 (ô 256) | A12 "Consistent chunky metallic UI icons, steel with thin dark outline, one per cell": back arrow · close X · magnifier search · filter funnel · settings gear · copy (two sheets) · share (three linked dots) · info (i in circle) · pause · fast-forward speed · check mark · presets (fanned stack of 3 cards) · chevron right · chevron down · music note · speaker | chữ BACK / FILTER / PRESETS / SETTINGS |
| raw_p7_a5 | 1536×1024, lưới 3×2 (ô 512) | 1 A10 "Compact square recessed filter button, empty interior" · 2 H04 "Compact industrial navigation tab, quiet graphite metal" IDLE · 3 same tab ACTIVE (brass lip + faint cyan underglow) · 4 "Small round check seal, brass ring with cyan check, for a selected card corner" · 5 "Small round steel close/remove badge socket" · 6 "Short bottom-sheet grab handle bar, dark steel" | nut_nho / h2_chip / chon_huy |
| raw_p7_a6 | 1024×1024, lưới 2×2 (ô 512) | game-mode emblems (round badge, same metal frame): SOLO "one turret alone" · CO-OP "two turrets linked by a cyan cable" · PVP "two cannons facing each other, red sparks" · ONLINE "radio dish antenna with cyan waves" | chữ |
| raw_p7_a7 | 1536×1024, lưới 6×2 (ô 256) | hàng 1 A05 "Small cyan-gold mechanical bracket snap and restrained sparks around a square card", 6 frames · hàng 2 D04 "Small contained gold-and-cyan rim sweep travelling along a long horizontal 5-slot bar frame", 6 frames | chon_bung (raw_sel_card) |
| raw_p7_a8 | 1024×1536, 1 ảnh, **NỀN ĐỤC** | A08 "Full-frame uniform near-black graphite texture with faint vignette, clean and undecorated" (runtime chỉ đặt độ mờ) | màu nền tối của .man.phu |
| raw_p7_d02 | 1024×1536, 1 cột × 5 hàng | D02 "Thin pre-rendered card accent strip with tiny gem in the middle, equal size": common steel-silver · rare blue · epic violet · legendary gold · mythic crimson | ngoc_<bac> |
- **raw_p4_board_4 — viền sáng "nâng cấp được" cho thẻ trong trận** (lưới 2×1, 1024×640: bản sáng + bản dịu) → `thap/assets/the_nang_sang.png` (9 mảnh, thay `khung_chon` ở `#bo-the .the.du::after`):
  "Glowing mint-green rounded rectangular card outline frame, soft outer glow, thin, empty transparent center, portrait card proportions 3:4, same style as the attached game screenshot, flat #FF00FF background, no text."

## Pass 5 — enemy facing (quái/trùm quay mặt theo hướng đi, 2026-11-05)

Người dùng: "boss đang chỉ đi 1 hướng mặt ra màn hình à, dcdw có làm thế không". DCDW: quái quay mặt theo đường đi.
Hướng đường thực tế: SOLO = TRÁI (cạnh trên) → XUỐNG → PHẢI; CO-OP = XUỐNG (nhánh trên) / LÊN (nhánh dưới) → PHẢI; PVP = XUỐNG → PHẢI.
→ cần 3 góc nhìn: TRƯỚC (đi xuống — đã có `*_8.png`), NGANG đi sang PHẢI (sang trái = lật ngang bằng code), SAU đi LÊN (quay lưng).

Dán kèm dải gốc tương ứng (`thap/assets/<id>_8.png`). Bố cục chung (thêm vào cuối mỗi prompt):
*"Layout: one row of 8 walk frames, same creature, same style/palette as the attached sprite strip, flat magenta #FF00FF background, no text."*

Lưu raw vào `docs/demo-hop-tuong/thap-art/raw_p5_<id>_side.png` / `raw_p5_<id>_back.png` → chạy `python3 tools/thap-huong-quai.py` (cắt khoá magenta, đăng ký thân theo dải trước, ghi `thap/assets/<loai>_<id>_side_8.png` / `_back_8.png`, bật trong `quaianim.js` HUONG8).

| id | raw NGANG (đi phải) | raw SAU (đi lên) |
|---|---|---|
| bo | `raw_p5_bo_side.png` — Side view of the purple armored beetle crawler walking to the RIGHT, legs stepping, head on the right. | `raw_p5_bo_back.png` — Back view of the same purple beetle crawler walking AWAY (up), shell and rear legs visible, no face. |
| bay | `raw_p5_bay_side.png` — Side view of the orange striped wasp flying to the RIGHT, wings flapping, stinger on the left. | `raw_p5_bay_back.png` — Back view of the same orange wasp flying AWAY (up), wings spread, stinger toward viewer. |
| bay_bang | `raw_p5_bay_bang_side.png` — Side view of the ice crystal moth flying to the RIGHT, crystal wings flapping, head on the right. | `raw_p5_bay_bang_back.png` — Back view of the same ice crystal moth flying AWAY (up), crystal wings spread, no face. |
| khong_lo | `raw_p5_khong_lo_side.png` — Side view of the giant dark-purple armored spider beast walking to the RIGHT, heavy legs stepping. | `raw_p5_khong_lo_back.png` — Back view of the same giant armored beast walking AWAY (up), gold-trimmed back plates, no face. |
| tach | `raw_p5_tach_side.png` — Side view of the red-orange bubbly slime blob hopping to the RIGHT, eyes on the right side. | `raw_p5_tach_back.png` — Back view of the same red bubbly slime hopping AWAY (up), bubbles on its back, no eyes. |
| que_tach | `raw_p5_que_tach_side.png` — Side view of the purple armored splitter beetle with gold spine walking to the RIGHT, claws in front. | `raw_p5_que_tach_back.png` — Back view of the same purple splitter beetle walking AWAY (up), gold spine bar visible, no face. |
| freezer | `raw_p5_freezer_side.png` — Side view of the ice crystal golem boss walking to the RIGHT, heavy steps, crystal spikes on back. | `raw_p5_freezer_back.png` — Back view of the same ice crystal golem boss walking AWAY (up), big crystal spikes on its back. |
| janus | `raw_p5_janus_side.png` — Side view of the floating two-faced stone/gold cube boss drifting to the RIGHT, orbiting shards, gold face on the right. | `raw_p5_janus_back.png` — Back view of the same two-faced cube boss drifting AWAY (up), plain cracked back face, orbiting shards. |
| joker_king | `raw_p5_joker_king_side.png` — Side view of the grinning yellow crowned slime king boss oozing to the RIGHT, crown tilted forward. | `raw_p5_joker_king_back.png` — Back view of the same yellow crowned slime king oozing AWAY (up), back of crown and white ruff, no face. |
| mad_crown | `raw_p5_mad_crown_side.png` — Side view of the jester robot boss with crown and arm cannons walking to the RIGHT, cannons pointing right. | `raw_p5_mad_crown_back.png` — Back view of the same jester robot boss walking AWAY (up), jester hat bells and back armor, no face. |
| nightmare | `raw_p5_nightmare_side.png` — Side view of the hooded shadow reaper boss with red glowing eye and rifle gliding to the RIGHT, cloak trailing left. | `raw_p5_nightmare_back.png` — Back view of the same hooded shadow reaper gliding AWAY (up), tattered cloak and hood back, red wisps. |
| octopus | `raw_p5_octopus_side.png` — Side view of the crimson many-eyed octopus boss with flaming crown crawling to the RIGHT, tentacles stepping. | `raw_p5_octopus_back.png` — Back view of the same crimson flaming octopus boss crawling AWAY (up), mantle back and tentacles, no big eye. |

Trong lúc chưa có ảnh: dùng dải TRƯỚC + nghiêng nhẹ theo hướng đi (≤ 8°), lật/hoà 120 ms khi rẽ (`quaianim.js`), không vẽ code.

## Pass 6 — new bosses (2026-11-05, session trùm mới · thiết kế: `TRUM-MOI.md`)

6 trùm mới, mỗi trùm 5 tấm. Chung cho mọi prompt: **solid magenta #FF00FF background, no text, no shadows on background, same style as the attached game screenshot (cyber/mechanical cartoon, thick dark outline, top-down 3/4 view), same character in every frame, same size and same ground line in every cell.** Trùm cũ (6) đã có hướng side/back ở Pass 5 (session hướng nhìn).

Tên file nộp: `raw_p6_<id>_front.png` · `_side.png` · `_back.png` · `_fx.png` · `_portrait.png`
→ code cắt thành `trum_<id>_8.png` (đi trước), `trum_<id>_side_8.png`, `trum_<id>_back_8.png`, `fx_trum_<id>.png` (dải 16), `trum_<id>_portrait.png` — khoá magenta + đăng ký khung theo thân (`thap-art/dangky_khung.py`) để thân không nhảy khi đổi hướng.

Mẫu (thay `<LOOK>`):
- (a) FRONT: `2048×256, one row of 8 cells (256 each). Boss <LOOK>, walking TOWARD the camera, 8-frame walk cycle, idle sway, facing down. Solid magenta #FF00FF background, no text, same style as the attached game screenshot.`
- (b) SIDE: `2048×256, one row of 8 cells. Same boss <LOOK>, walking to the RIGHT, side view, 8-frame walk cycle, same scale and ground line as the front sheet. Solid magenta #FF00FF, no text, same style.`
- (c) BACK: `2048×256, one row of 8 cells. Same boss <LOOK>, walking AWAY from camera (back view, facing up), 8-frame walk cycle, same scale. Solid magenta #FF00FF, no text, same style.`
- (d) FX: `1024×1024, 4×4 grid (256 cells), 16-frame ability effect: <FX>, read left-to-right, top-to-bottom, centered in each cell. Solid magenta #FF00FF, no text, same style.`
- (e) PORTRAIT: `1024×1024, dramatic boss intro portrait of <LOOK>, bust, glowing eyes, centered, for a boss warning banner. Solid magenta #FF00FF background, no text, same style.`

| id | `<LOOK>` | `<FX>` |
|---|---|---|
| hive | a hexagonal mechanical hive mothership on 4 short spider legs, amber lights, belly hatch | belly hatch opening and 4 small amber drones flying out |
| jammer | a radio-antenna robot on 2 chicken legs, tilted radar dish, coils with violet static | violet static wave rings + electric chain locking a target |
| prism | a crystal-and-steel guardian with a triangular prism body and 3 floating prism shields | prism shield forming, glowing, then shattering into shards |
| twin_core | a twin-half reactor core joined by a red lightning bridge, on 4 robot legs | core cracking and splitting in two with red lightning |
| patcher | a bulky repair robot, green liquid tank on its back, wrench arm and nano-spray nozzle | green nano-repair mist burst with floating plus-shaped sparks |
| leech | a long mechanical leech/beetle robot with a tube proboscis and a glass belly holding glowing stars | golden star being sucked out along a tube, then a speed-dash streak |

