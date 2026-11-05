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

## 8. Test range (skilldemo.js) — bỏ hình vẽ code, cần thêm 1 ảnh (S12)

Đã thay bằng ảnh có sẵn: bàn tay vẽ code → ụ kéo thật của trận (`UI.keo`) + mũi tên `duong_mui`; vòng/mũi tên/nhãn viên thuốc → `fx_starup` / `fx_summon` / `fx_buff` / `fx_vong_lv` / `phu_ngam` / `phu_lua` / `sup_khien` / `ic_*` / `glyph/*`; dải chú thích → `bang_wave_nen`; ô mana/hồi chiêu → `ui_gia` + `ui_mana`; nút chỉ huy → `ui_nut_trieu` + chân dung `af_*` (mặt nạ tròn). Code chỉ còn vẽ chữ/số và mặt nạ làm mờ cột rìa.

**S12 — bàn tay chỉ (1 ảnh, 128×128 → `thap/assets/ui_tay.png`)**, rồi đặt `const SD_TAY = 'ui_tay'` trong `thap/js/skilldemo.js`:
```
Single game UI icon: a white cartoon hand with index finger pointing down-left (tap / drag gesture), thick dark outline, soft shading, same style as attached. Centered, no text. Flat solid magenta #FF00FF background.
```
(Đính kèm `thap/assets/ui_nut_trieu.png` làm mẫu phong cách.)
