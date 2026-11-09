# Thác Mana (`thacmana`) — bộ prompt rig master-first (09/11)

Máy làm việc **không có công cụ sinh ảnh** (không có khoá PixelLab/OpenAI, repo chỉ có tool cắt ảnh) → phần sinh ảnh DỪNG ở đây, người dùng sinh bằng ChatGPT.
Cơ sở: `tuvan/anim-rig/CHATGPT-TRA-LOI.md` (Q2 pivot / vòng an toàn, Q3 khoá camera, Q4 master-first, Q9 Thác Mana) + `PROMPT.md` cùng thư mục.

## Quy ước BẮT BUỘC (khác tư vấn ở 1 điểm)
- **Đầu súng hướng sang PHẢI** (quy ước mọi `_nong` hiện có: canon, set… — code xoay theo góc 0 = phải). Tư vấn ghi "UP", KHÔNG dùng.
- Top-down 90° đúng như `thacmana_de` hiện tại (bệ tam giác nhìn thẳng từ trên). Nền **#FF00FF đặc**, không chữ, không bóng đổ, không lưới.
- Mỗi ô vuông, vật ở **giữa ô**, lề ≥ 12 %; phần quay (đầu, vòng phụ) có **trục quay = tâm ô**; điểm xa nhất cách tâm ≤ 0,47 cạnh ô (vòng an toàn khi xoay 360°).
- Đính kèm khi gen: `thap/assets/set_de.png` + `set_nong.png` (Tesla, cùng loại chain) và `canon_nong.png` làm mẫu phong cách; lượt 2 đính kèm thêm ảnh master đã duyệt.
- Màu: tím mana sâu + xanh lơ (cyan) năng lượng, giáp gunmetal sẫm, viền đỏ–vàng Mythic nhỏ. Dễ nhận ở 46 px: 1 lõi tím lớn + 2 càng cyan chữ V + mũi phóng sáng.

## Lượt 1 — MASTER (1 ảnh, ụ lắp đủ)
```
Create ONE MASTER sprite of the tower-defense turret "ARCANE CASCADE", a MYTHIC RED mana turret.
Same style as attached (glossy chunky mobile tower-defense art, thick clean dark outlines, cel shading, polished sci-fi metal).
STRICT ORTHOGRAPHIC TOP-DOWN VIEW: camera directly above, looking straight down at 90 degrees. No isometric, no three-quarter view, no visible vertical side panels. Circular parts are perfect circles.
Design: a dark crimson-gunmetal triangular-hexagonal platform with violet mana channels and three silver clamps; on top, a rotating head shaped as a compact V-shaped twin energy conductor whose two cyan prongs point to the RIGHT, a large glowing violet mana crystal at the head's center, a bright cyan muzzle tip at the right end; under the head a thin four-pronged cyan-violet rune ring. Small red-gold Mythic trim accents.
The head's rotation pivot is exactly at the center of the image; the muzzle lies on the horizontal center line, pointing RIGHT.
Turret centered, 12% empty margin on every side. Neutral pose, no firing, no lightning, no particles, no motion blur.
Flat pure #FF00FF background. No floor, no cast shadow, no text, no grid, no border.
```

## Lượt 2 — BỘ LỚP từ master (lưới 2×3, đính kèm master đã duyệt)
```
Using the ATTACHED MASTER as the exact design reference, create ONE 2x3 sprite-part sheet of the SAME turret "ARCANE CASCADE".
STRICT ORTHOGRAPHIC TOP-DOWN view, 90-degree camera, same lighting, same scale for all parts as in the master.
Six equal square cells, left-to-right, top row first:
1. BASE ONLY (platform without head and ring), complete surface where the head used to cover it.
2. HEAD ONLY, prongs and muzzle pointing RIGHT, rotation pivot at the exact center of the cell.
3. RING ONLY: the four-pronged cyan-violet rune ring, centered on its axle.
4. CORE ONLY: the round violet mana crystal with cyan inner highlights.
5. GLOW ONLY: a soft concentric violet-cyan energy halo matching the crystal.
6. OUTLINE RING: the base silhouette as a thin light-gray ring, same shape and size as cell 1.
Parts 1-6 must be exact components of the master: identical colors, geometry, symbols, proportions. No redesign, no new details.
Every part stays completely inside its cell with at least 12% empty margin; rotating parts never reach farther than 47% of the cell from the center.
Flat pure #FF00FF background. No grid lines, no text, no labels, no shadows.
```
Nếu ô nào khác thiết kế master → bỏ ô đó, gen lại riêng ô đó với câu "Only cell N, same as attached master", KHÔNG sửa bằng biến đổi.

## Lượt 3 — CHÂN DUNG CHỈ HUY (đính kèm `pilot_ronglua.png` + `pilot_cobac.png`)
```
Same style as attached (anime gacha commander portrait, bust, 3/4 view, rich cel shading, same framing and head size as attached).
Solid magenta #FF00FF background, no text, no frame.
A calm arcane battle-mage engineer in dark gunmetal sci-fi armor with glowing violet mana conduits, long silver-lavender hair,
holding a floating violet-blue mana orb that leaks bouncing purple-cyan lightning; cyan rune tattoos on the cheek and hand; Mythic red-gold trim on the shoulder plates.
Face clearly visible, centered in the upper half, shoulders reach the bottom edge.
```
Ảnh lớn `hero/hero_thacmana.jpg` (1170×1020 như hero khác): cùng prompt, thêm `Wide 1170x1020 composition, character on the right half, soft violet-cyan arcane background (no magenta)`.

## Lượt 4 (tuỳ chọn) — tia nảy
```
Same style as attached. Solid magenta #FF00FF background, no text. Horizontal tileable strip 1024x128:
a violet-blue arcane mana lightning bolt with a white-hot core and small cyan rune sparks, both ends soft so tiles overlap seamlessly.
```

## Sau khi có ảnh (session code làm)
1. Cắt khoá magenta theo `thap/QUY-TAC-HINH.md` mục 5 (viền alpha mềm, thu Lanczos nhân-trước-alpha, ≤ 3× cỡ hiển thị lớn nhất); gốc giữ ở `docs/demo-hop-tuong/thap-art/`.
2. Cỡ ra theo ụ cùng loại (đang dùng): `thacmana_de` 177², `_nong` 265², `_phu` 126², `_vien` 201², `nho/thacmana` 192², `glyph/thacmana` 128²; chân dung `pilot_thacmana.png` 427² + `pn/pilot_thacmana.png` 256².
3. Đo lại & ghi `artscale.js` (HEAD_K, DE_RIENG, PHU_K, UMOD_TIP = mũi nòng thật / bán kính — hiện 0,558 tạm), `meta.js ART_META.thacmana` (s, tip) theo quy trình `docs/demo-hop-tuong/tuvan/u-moi/cat-game.json`; `anim-meta.js` giữ `chain`.
4. Chân dung: thêm `thacmana` vào `PILOTS` (`text.js`), mốc mặt `chandung.js` PO_NEO/HERO_NEO + `khung.js` FACE_BOX, `tools/thap-cat-chandung.json` (xem `PROMPT.md`).
5. Lõi/glow (ô 4–5) dùng cho tầng mana 9.4 và chiêu Mana Flood 9.5 — để sau, ghi trong `thacmana.rig.json` khi làm.
