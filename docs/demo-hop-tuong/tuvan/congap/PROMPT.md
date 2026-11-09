# Hatchery Gate / Cổng Ấp Nở (`congap`, VÀNG, Đặc biệt, họ SUMMON) — ảnh cần sinh (ChatGPT)

Hiện dùng **ảnh TẠM** (đổi màu ảnh Lõi Khởi Sinh `khoisinh`: xoay sắc độ +45° bằng PIL → khung vàng, mầm xanh; viền/glyph chép nguyên):
`thap/assets/congap_de.png`, `congap_nong.png`, `congap_phu.png`, `congap_vien.png`, `nho/congap.png`, `glyph/congap.png`.
Số cỡ trong `artscale.js` (HEAD_K / DE_RIENG / PHU_K / UMOD_TIP) + `meta.js ART_META` đang chép của `khoisinh` — có ảnh thật thì cắt theo quy trình ụ mới
(`docs/demo-hop-tuong/tuvan/u-moi/cat-game.json`, `tools/thap-cat-3x.py`, 3× cỡ hiển thị lớn nhất) và ghi lại số cỡ.
**Chưa có**: chân dung chỉ huy `pilot_congap.png` (+ `pn/`), ảnh lớn `hero/hero_congap.jpg` — code tự dùng icon `nho/congap` thay thế.
Có chân dung → thêm `congap` vào `PILOTS` (`thap/js/text.js`), mốc mặt vào `chandung.js` + `khung.js` FACE_BOX.
Số lượt + giây tới lần gọi là CHỮ SỐ ở tấm đếm đáy ô (DEMKN: icon `h2_ic_chong` + `trung_1`) — không cần vẽ số vào ảnh.

Quy trình **master-first** (docs/demo-hop-tuong/tuvan/anim-rig/CHATGPT-TRA-LOI.md §4.1–4.2): sinh 1 ảnh master trước, chốt hình, rồi mới xin tấm tách lớp từ chính master đó.

## 1. Master (đính kèm ảnh ụ Vàng có sẵn làm mẫu phong cách: vd. `sinhdoi_nong` + `khoisinh_nong`)
```
Create ONE master image of the turret "Hatchery Gate".
Same style as attached. STRICT orthographic TOP-DOWN view, 90-degree camera.
Glossy chunky mobile tower-defense art, thick dark outlines, cel shading.
A round summoning-portal hatchery: a gold-and-white metal ring platform (Legendary gold trim)
holding a swirling golden-teal portal disc in the middle, with a glowing egg-shaped capsule
half-emerged from the portal and three small curved claws gripping the rim. Perfect circles.
Centered, fills ~80% of the canvas. Pure solid #FF00FF background.
No floor, no cast shadow, no text, no grid.
```

## 2. Tách lớp từ master (đính kèm master vừa chốt)
```
Create ONE 2x3 sprite-part sheet for the turret "Hatchery Gate".
Same style as attached. STRICT orthographic TOP-DOWN view, 90-degree camera.
Six equal square cells, read left-to-right, top row first:
1. Fully assembled master turret.
2. BASE ONLY: the gold ring platform, without the portal disc and capsule.
3. HEAD ONLY: the portal disc with the egg capsule and the three claws, capsule tip pointing straight UP.
4. SECONDARY PART only: a thin gold rune ring that sits under the head.
5. INNER ENERGY CORE only: the swirling golden-teal portal glow.
6. EMISSIVE LIGHT DETAIL only: the capsule's glowing seams.
The parts in cells 2-6 must be exact components of the master design in cell 1.
Identical colors, geometry, symbols, and proportions. All rotating parts have their pivot
at the center of their own cell. Each part stays inside its cell with at least 12% margin.
Flat pure #FF00FF background. No grid lines, no text, no labels, no shadows.
```
Ghép vào game: ô 2 → `congap_de`, ô 3 → `congap_nong`, ô 4 → `congap_phu`, viền xám của ô 2 → `congap_vien`; ô 1 thu nhỏ → `nho/congap`; glyph trắng 1 màu (hình quả trứng trong vòng cổng) → `glyph/congap`.

## 3. Chân dung chỉ huy (đính kèm 2 chân dung chỉ huy Vàng có sẵn, vd. `pilot_sinhdoi`, `pilot_tudo`)
```
Same style as attached (anime gacha commander portrait, bust, 3/4 view, rich cel shading).
Solid magenta #FF00FF background, no text.
A cheerful young summoner-engineer in white-and-gold sci-fi coat, holding a glowing egg-shaped capsule
over a small golden portal ring in one palm; teal light spilling from the portal; Legendary gold trim.
```
