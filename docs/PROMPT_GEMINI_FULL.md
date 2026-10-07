# Prompt Gemini đầy đủ — mỗi ảnh một prompt (116 ảnh)

Mỗi khối dán **riêng một lần** vào Gemini (đính kèm `docs/mau-lac-tuong.png` làm mẫu nét vẽ nếu được), tải ảnh về và đặt **đúng tên file** ghi trên khối. Gen theo thứ tự từ trên xuống: phần 0 (nền menu tên mới) và 1–4 là cần thiết, phần 5–7 là tùy chọn.

> **Phần 0B — vẽ lại tướng cho dễ phân biệt:** mỗi tướng có dáng, mảng hình và màu riêng (thẻ nhận diện `tools/hero-id.js`, so sánh nhóm dễ nhầm ở `docs/tuong-de-nham.png`). Mỗi tấm 12 khung chuyển động (4×3: thở ×3 + chân dung · đánh ×4 · chiêu ×3 + bị đánh); cắt bằng `python3 tools/cat-sheet.py <ảnh> <mã> hero12` — lệnh cắt tự tạo `assets/packs/<mã>/.v2` để ẩn prompt tướng đó và tự ghi số khung vào `js/render.js` (nhớ tăng phiên bản game). Quái gen lại cắt bằng `enemy6` (3×2), boss bằng `boss9` (3×3); lệnh cắt ghi ngay dưới tên mỗi khối.

> **Phần 0 — đổi tên game thành "Thần Thoại Việt" (v145):** ảnh nền menu mới thay `assets/ui/nen-menu.jpg` (ảnh cũ chủ đề Sơn Tinh – Thủy Tinh, đang dùng tạm). Logo chữ là tùy chọn: AI hay viết sai dấu tiếng Việt — kiểm tra kỹ từng dấu (ầ, ạ, ệ); sai thì bỏ, game tự hiện chữ HTML. Có ảnh đúng thì xoá nền magenta, lưu `assets/ui/logo-tua.png`. Các ảnh cảnh khác (nền thắng/thua, truyện) hiện không có chữ tên game nên không cần gen lại.


## 0. Ảnh nền menu — Thần Thoại Việt

### 1. Nền menu chính (key-art nhiều truyền thuyết, chừa nửa trái cho chữ tựa) → `nen-menu.jpg`
```
Create ONE image: a 1792x832 wide landscape key-art illustration (about 2.15:1, full bleed, no border) for the MAIN MENU background of a cute mobile tower-defense game based on Vietnamese folk legends of Van Lang and Au Lac.
STYLE: Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading. Characters are cute chibi (head about 1/3 of the body, big round dark-brown eyes with two white highlights), same look as the game heroes.
SKY: a huge engraved Dong Son bronze drum face fills the upper sky like a giant sun disc: a glowing 14-ray sun-star in the center, rings of flying Lac birds and zigzag bands around it, warm golden dawn light.
SCENE (one unified epic scene, many legends together):
- center: Son Tinh (mountain god, green-brown robe, raising a mountain range with his hands) facing Thuy Tinh (water god, blue robe, riding a big rising wave with a dragon shape) — mountains climb on one side, waves rise on the other;
- Thanh Giong as a young giant hero on a galloping iron horse breathing fire, swinging an uprooted bamboo cane;
- Lac Long Quan (dragon lord) and Au Co (fairy with bird wings) together, a small golden dragon coiling in the clouds and a white crane-bird above;
- the Co Loa spiral citadel with King An Duong Vuong holding the magic crossbow with the golden turtle claw, the golden turtle Kim Quy beside him;
- Thach Sanh with his axe and magic lute, a defeated python-spirit coil in the background;
- foreground: Red River rice fields, bamboo, a stilt house with a boat-shaped roof.
COMPOSITION (very important): keep the LEFT HALF (0-45% of the width) calm and open — soft sky, drum-face glow, distant hills only, no characters and no busy details there — because the game title text is placed on it. Put all main characters between 35% and 70% of the width. The RIGHT 30% of the width will be covered by a menu panel: only low-detail background there (waves, mountains, clouds). Keep the bottom 12% simple (ground, water). Readable at phone size, strong silhouettes, warm golden light against teal water.
NO text, NO letters, NO numbers, NO logo, NO watermark, NO frame.
```

### 2. Logo chữ "Thần Thoại Việt" (tùy chọn — AI hay viết sai dấu; sai thì bỏ, game dùng chữ HTML) → `logo-tua.png`
```
Create ONE image: a 1024x384 game title logo that reads exactly "Thần Thoại Việt" (Vietnamese, with correct diacritics: Thần = T-h-ầ-n, Thoại = T-h-o-ạ-i, Việt = V-i-ệ-t), one or two lines, big and centered.
LETTERS: thick bold carved bronze letters like engraved Dong Son bronze, warm gold #F2D27A to bronze #B8852A with dark green patina #2F6B5E edges, thick dark-brown outline #2A1608, small zigzag and circle-dot bands engraved inside the strokes, slight 3D bevel.
DECOR: behind the letters a thin half bronze-drum ring with a small sun-star and two flying Lac birds; a small mountain on the left end and a small wave curl on the right end. Keep the decoration small; the words must be the most readable thing.
Cute mobile-game look, flat cel shading, no gradients except the metal sheen, no glow outside the letters.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No other text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 0B. Tướng vẽ lại cho dễ phân biệt

### 3. Xạ Thủ Văn Lang · Thường · METAL · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `xathu.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> xathu hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Xạ Thủ Văn Lang so it is easy to tell apart from the other heroes.
BODY: lanky teenage boy about 17, very thin and tall, long arms and legs, small head about 1/5 of the height.
SIGNATURE SHAPE: an oversized longbow TALLER than himself held upright, plus a high topknot with ONE long single feather sticking up.
COLORS: main pale silver-grey #BFC6CC, second steel blue #5E7A8C, accent red bowstring and arm wraps (element METAL). common hero: simple clothes, few details, but keep the silhouette above.
FACE: narrow focused eyes with one eye squinting, thin face, sharp nose, tiny mole under the eye.
OUTFIT: sleeveless silver-grey wrap tunic, steel-blue leg wraps, leather quiver on the hip. WEAPON / ITEM: giant wooden longbow.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] side stance, bow vertical beside him, one arrow held loosely between fingers, calm and patient [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: three silver arrows with white streaks (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 4. Dũng Sĩ Tre Làng · Thường · WOOD · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `tre.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> tre hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Dũng Sĩ Tre Làng so it is easy to tell apart from the other heroes.
BODY: small skinny boy about 11, thin limbs, big feet, head about 1/3 of the height.
SIGNATURE SHAPE: a long green bamboo pole with leaves on top, TWO times his height, held diagonally; messy spiky hair with NO headband.
COLORS: main fresh bamboo yellow-green #A8D04A, second cream #F1E6C8, accent yellow belt (element WOOD). common hero: simple clothes, few details, but keep the silhouette above.
FACE: missing front tooth in a big grin, freckles, spiky eyebrows.
OUTFIT: sleeveless cream shirt, yellow-green shorts, bare feet. WEAPON / ITEM: bamboo pole.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] hopping on one leg, spinning the bamboo, restless [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: swirling bamboo leaves (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 5. Thợ Săn Ống Thổi · Thường · WOOD · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `ongthoi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> ongthoi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thợ Săn Ống Thổi so it is easy to tell apart from the other heroes.
BODY: short stout highland man about 40, thick calves, round belly, head about 1/4 of the height.
SIGNATURE SHAPE: an extremely long blowgun tube held HORIZONTALLY to his lips, longer than his body, and long hair tied in a low ponytail.
COLORS: main dark teal-green #2F6E5A, second black #262626, accent white zigzag weave (element WOOD). common hero: simple clothes, few details, but keep the silhouette above.
FACE: puffed cheeks, dotted face tattoos on the forehead, small eyes, flat nose.
OUTFIT: Central Highlands woven black loincloth with white zigzag, teal sash, bamboo dart tube on the hip. WEAPON / ITEM: long bamboo blowgun.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" or "hooded hunter with a spear" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] leaning forward with the blowgun already at his lips, one eye aiming [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: green poison darts in a fan (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 6. Chàng Chèo Đò · Thường · WATER · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `chodo.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> chodo hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Chàng Chèo Đò so it is easy to tell apart from the other heroes.
BODY: big broad-shouldered young ferryman about 25, thick arms, short neck, head about 1/5 of the height.
SIGNATURE SHAPE: an oversized boat oar with a WIDE flat blade, longer than his body, leaned on diagonally; shaved head with a small topknot.
COLORS: main navy indigo #2B4C7E, second white, accent yellow rope (element WATER). common hero: simple clothes, few details, but keep the silhouette above.
FACE: shaved head, thick neck, friendly grin, broken nose.
OUTFIT: sleeveless white shirt, navy trousers rolled up, yellow rope belt. WEAPON / ITEM: big oar.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] leaning on the oar like a lazy giant, one hand on hip [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a wide sweep of river water (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 7. Chàng Đốt Nương · Thường · FIRE · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `dotnuong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> dotnuong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Chàng Đốt Nương so it is easy to tell apart from the other heroes.
BODY: thin teenage highland farmer about 16, lanky, head about 1/4 of the height.
SIGNATURE SHAPE: a BURNING torch on a long pole raised high and a curved machete; hair tied up with green leaves.
COLORS: main rusty red-ochre #A0462A, second ash grey, accent ember orange (element FIRE). common hero: simple clothes, few details, but keep the silhouette above.
FACE: soot smudges on the nose, big eager eyes, gap teeth.
OUTFIT: red-ochre loincloth, ash-grey sleeveless vest. WEAPON / ITEM: torch pole and machete.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] torch raised, machete low, ready to run [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a trail of fire on the ground (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 8. Thợ Rèn Đông Sơn · Thường · FIRE · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `thoren.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thoren hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thợ Rèn Đông Sơn so it is easy to tell apart from the other heroes.
BODY: bulky blacksmith about 40, huge forearms, big belly, short legs, head about 1/5 of the height.
SIGNATURE SHAPE: a giant sledgehammer with a red-hot glowing head on the shoulder; shiny bald head with a bushy black beard.
COLORS: main dark leather brown #5A3A22, second soot grey, accent red-hot orange (element FIRE). common hero: simple clothes, few details, but keep the silhouette above.
FACE: bald head, bushy black beard, soot on the cheeks, squinting from the heat.
OUTFIT: thick leather apron, bare muscular arms, iron wristbands. WEAPON / ITEM: giant hammer.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] hammer on the shoulder, chest out [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: sparks and molten splash (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 9. Trẻ Chăn Trâu · Thường · EARTH · nhóm dễ nhầm: Thanh niên khăn đầu + vũ khí cán dài → `chantrau.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> chantrau hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Trẻ Chăn Trâu so it is easy to tell apart from the other heroes.
BODY: tiny chubby little boy about 7, the smallest hero, short legs, head about 1/2 of the height.
SIGNATURE SHAPE: a shaved head with three small tufts of hair (trai dao kid hairstyle) and a wooden slingshot.
COLORS: main buffalo brown #8A5A2B, second sunburned skin, accent bright yellow scarf (element EARTH). common hero: simple clothes, few details, but keep the silhouette above.
FACE: cheeky grin, tongue out, mischievous eyes.
OUTFIT: bare chest, brown shorts, yellow scarf around the neck, bamboo flute in the belt. WEAPON / ITEM: slingshot.
MUST NOT look like the generic "young man with a headband holding a long pole weapon" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] pulling the slingshot halfway, tongue out [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: stunning clay pellets (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 10. Ngư Phủ Sông Đà · Thường · WATER · nhóm dễ nhầm: Nón lá / dân làng áo nâu → `nguphu.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> nguphu hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Ngư Phủ Sông Đà so it is easy to tell apart from the other heroes.
BODY: wiry middle-aged fisherman about 45, thin and sinewy, slightly bent knees, head about 1/4 of the height.
SIGNATURE SHAPE: a fishing net draped over one shoulder like a cape with orange floats, and a three-pronged fish spear.
COLORS: main river teal #3E8E8A, second faded indigo #46597A, accent orange net floats (element WATER). common hero: simple clothes, few details, but keep the silhouette above.
FACE: weathered skin, sunken cheeks, small goatee, knotted blue turban (khan van).
OUTFIT: teal shirt, indigo rolled trousers, bamboo fish trap at the waist. WEAPON / ITEM: three-pronged fish spear.
MUST NOT look like the generic "villager in a conical hat and brown clothes" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] spear ready, net swinging from the shoulder [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a thrown net that tangles (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 11. Người Đắp Đê · Thường · EARTH · nhóm dễ nhầm: Nón lá / dân làng áo nâu → `dapde.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> dapde hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Người Đắp Đê so it is easy to tell apart from the other heroes.
BODY: stocky strong village woman about 40, wide hips, thick arms, head about 1/4 of the height.
SIGNATURE SHAPE: a big CONICAL HAT (non la) on her head and a wide flat shovel on her shoulder.
COLORS: main mud brown #7A5A3A, second indigo, accent straw yellow hat (element EARTH). common hero: simple clothes, few details, but keep the silhouette above.
FACE: determined frown, strong cheekbones, mud splash on the cheek.
OUTFIT: mud-brown shirt, indigo trousers rolled up, mud on the legs, a basket of earth on the hip. WEAPON / ITEM: flat shovel.
MUST NOT look like the generic "villager in a conical hat and brown clothes" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] shovel on the shoulder, fist on the hip [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: an earth wall rising (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 12. Mai An Tiêm · Tím · WOOD · nhóm dễ nhầm: Nón lá / dân làng áo nâu → `antiem.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> antiem hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Mai An Tiêm so it is easy to tell apart from the other heroes.
BODY: sunburned castaway man about 30, average build, head about 1/4 of the height.
SIGNATURE SHAPE: a shaggy straw raincoat (ao toi) like a hay cape and a HUGE striped watermelon held on his shoulder.
COLORS: main straw beige #D8C38A, second dark watermelon green #1F5E2A, accent red melon flesh #E04848 (element WOOD). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: stubble beard, wind-swept rope-tied hair bun, cheerful squint.
OUTFIT: straw cape over a torn brown shirt, sea-shell necklace, purple-silver trim. WEAPON / ITEM: watermelons to throw.
MUST NOT look like the generic "villager in a conical hat and brown clothes" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] hoisting the watermelon on one shoulder, other hand waving [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: exploding watermelon with gold seeds (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 13. Trương Chi · Tím · WATER · nhóm dễ nhầm: Nón lá / dân làng áo nâu → `truongchi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> truongchi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Trương Chi so it is easy to tell apart from the other heroes.
BODY: thin young man about 22, slightly slouched, head about 1/4 of the height.
SIGNATURE SHAPE: standing inside a small curved sampan boat (crescent shape under his feet) playing a long bamboo flute.
COLORS: main dusk purple-blue #5B5F9E, second dark indigo, accent silver moon (element WATER). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: homely face: crooked nose, slightly buck teeth, eyes closed peacefully while playing.
OUTFIT: simple patched indigo shirt, conical hat hanging on his BACK (not on the head), purple-silver trim. WEAPON / ITEM: long bamboo flute.
MUST NOT look like the generic "villager in a conical hat and brown clothes" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] eyes closed playing the flute, swaying [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: silver music notes and moon ripples (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 14. Chử Đồng Tử · Tím · WATER · nhóm dễ nhầm: Nón lá / dân làng áo nâu → `cdt.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> cdt hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Chử Đồng Tử so it is easy to tell apart from the other heroes.
BODY: very skinny poor young man about 20, ribs showing, long thin legs, head about 1/4 of the height.
SIGNATURE SHAPE: only a loincloth, holding a glowing magic conical hat up in one hand like a shield and a tall sacred staff in the other.
COLORS: main sand beige #E6D3A3, second sacred teal glow #4FC1C6, accent gold (element WATER). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: humble shy smile, messy hair, thin face, big honest eyes.
OUTFIT: plain loincloth, a sacred teal sash, purple-silver trim. WEAPON / ITEM: sacred staff and glowing hat.
MUST NOT look like the generic "villager in a conical hat and brown clothes" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] raising the glowing hat, shy but brave [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: teal reviving light under the hat (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 15. Thầy Chuông Đồng · Thường · METAL · nhóm dễ nhầm: Cụ già râu trắng chống gậy → `chuongdong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> chuongdong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thầy Chuông Đồng so it is easy to tell apart from the other heroes.
BODY: tiny frail old man about 75, hunched back, very thin arms, BIG bald round head about 1/3 of the height.
SIGNATURE SHAPE: a staff with a bronze temple bell BIGGER than his head hanging from the top, held high over him.
COLORS: main off-white linen #EDE7D9, second warm bronze #B07D3A, accent red tassel (element METAL). common hero: simple clothes, few details, but keep the silhouette above.
FACE: shiny bald head, NO beard, very long white eyebrows drooping down past the cheeks, eyes closed, humming mouth.
OUTFIT: loose off-white ritual robe with bronze zigzag hem, bare feet. WEAPON / ITEM: bell staff.
MUST NOT look like the generic "old man with a white beard holding a staff" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] hunched, lifting the bell staff overhead and ringing it, eyes closed in trance [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: golden sound rings spreading from the bell (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 16. Thầy Lang Lá Thuốc · Thường · WOOD · nhóm dễ nhầm: Cụ già râu trắng chống gậy → `thaylang.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thaylang hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thầy Lang Lá Thuốc so it is easy to tell apart from the other heroes.
BODY: very thin hunched old man about 70, bony limbs, head about 1/4 of the height.
SIGNATURE SHAPE: a tall woven gui basket on his back overflowing with herbs and leaves, sticking up above his head.
COLORS: main sage green #8BAA6E, second earthy tan #B89A6A, accent purple herb flowers (element WOOD). common hero: simple clothes, few details, but keep the silhouette above.
FACE: long thin drooping mustache only (no full beard), deep wrinkles, gentle squint.
OUTFIT: sage-green tunic, rolled trousers, herb pouch. WEAPON / ITEM: crooked walking stick.
MUST NOT look like the generic "old man with a white beard holding a staff" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] leaning on the stick, sniffing a leaf, curious [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: green healing leaves and herb steam (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 17. Thần Sương Núi · Thường · WATER · nhóm dễ nhầm: Cụ già râu trắng chống gậy → `thansuong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thansuong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thần Sương Núi so it is easy to tell apart from the other heroes.
BODY: small child-like mist spirit, slender, floating, NO legs: the body fades into a small cloud.
SIGNATURE SHAPE: very long white hair floating UPWARD like smoke and a cloud tail instead of legs.
COLORS: main icy pale cyan #BFEAF5, second frost white, accent deep blue ice crystal (element WATER). common hero: simple clothes, few details, but keep the silhouette above.
FACE: sleepy calm eyes, pale cheeks with frost freckles.
OUTFIT: misty scarf wrapping the body. WEAPON / ITEM: small ice crystal held in cupped hands.
MUST NOT look like the generic "old man with a white beard holding a staff" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] floating, cupping a snowflake, drifting [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: frost mist and snowflakes (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 18. Thổ Công · Tím · EARTH · nhóm dễ nhầm: Cụ già râu trắng chống gậy → `thocong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thocong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thổ Công so it is easy to tell apart from the other heroes.
BODY: very short round old man about 80, almost as wide as tall, round belly, head about 1/3 of the height.
SIGNATURE SHAPE: a white beard so long it reaches the belly and a calabash gourd hanging from a tall bamboo staff.
COLORS: main warm yellow-brown #B88A3E, second white beard, accent red sash (element EARTH). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: long white beard, round laughing face, small round eyes.
OUTFIT: yellow-brown robe, soft round black cap (no wings), red sash, purple-silver trim. WEAPON / ITEM: bamboo staff with a gourd.
MUST NOT look like the generic "old man with a white beard holding a staff" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] chuckling, holding the belly [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a protective earth light around the house (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 19. Thần Kim Quy · Vàng · METAL · nhóm dễ nhầm: Cụ già râu trắng chống gậy → `kimquy.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> kimquy hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thần Kim Quy so it is easy to tell apart from the other heroes.
BODY: giant golden turtle standing upright on short hind legs, very wide round body, no neck, short and squat.
SIGNATURE SHAPE: a huge domed golden shell with hexagon plates covering the whole back, wider than tall.
COLORS: main turtle gold #E3B23C, second jade green skin #5E9E7E, accent glowing red-gold claw (element METAL). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: old wise turtle face, long white eyebrows and a small white beard tuft, calm half-closed eyes.
OUTFIT: gold trim on the shell rim, small crown on the head, soft golden halo. WEAPON / ITEM: one glowing golden claw raised.
MUST NOT look like the generic "old man with a white beard holding a staff" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] sitting firm like a rock, one claw raised in blessing [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a golden hexagon shield dome (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 20. Viêm Đế Thần Nông · Vàng · FIRE · nhóm dễ nhầm: Cụ già râu trắng chống gậy → `viemde.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> viemde hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Viêm Đế Thần Nông so it is easy to tell apart from the other heroes.
BODY: short stocky old god about 80, slightly hunched, head about 1/4 of the height.
SIGNATURE SHAPE: two small OX HORNS on the forehead, a leaf-and-straw cape and a long white beard.
COLORS: main burnt orange #D9622B, second leaf green, accent sun gold (element FIRE). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: long white beard, kind wrinkled eyes, chewing an herb leaf.
OUTFIT: burnt orange robe under a leaf-and-straw cape, gold trim, sun halo. WEAPON / ITEM: farming hoe whose blade burns with fire.
MUST NOT look like the generic "old man with a white beard holding a staff" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] leaning on the hoe, smiling, inspecting a grain stalk [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: warm fire that ripens rice (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 21. Mỵ Châu · Tím · METAL · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `mychau.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> mychau hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Mỵ Châu so it is easy to tell apart from the other heroes.
BODY: petite slim teenage princess about 16, narrow shoulders, head about 1/4 of the height.
SIGNATURE SHAPE: a long WHITE goose-feather cloak that drapes down behind her and trails on the ground like a wide triangle (no wings), straight black hair down to the knees.
COLORS: main snow white #F7F7F2, second pale lilac #C9C3DD, accent one small red ribbon (element METAL). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: soft sad eyes with long lashes, tiny mouth, little beauty mark on the chin.
OUTFIT: lilac silk dress under the feather cloak, pearl hairpins, purple-silver trim. WEAPON / ITEM: none, she scatters white feathers.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] one hand holding the edge of the cloak, the other hand dropping feathers, gentle head tilt [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: white feathers turning into small birds (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 22. Bà Hỏa · Tím · FIRE · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `baahoa.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> baahoa hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Bà Hỏa so it is easy to tell apart from the other heroes.
BODY: mysterious woman about 40, floating slightly, slim, head about 1/5 of the height.
SIGNATURE SHAPE: enormous hair floating upward like flames and smoke, wider than her body.
COLORS: main deep wine red #7A1426, second black, accent orange flame tips (element FIRE). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: sharp narrow eyes, dark red lips, a sly cold smile.
OUTFIT: wine-red robe with black flame patterns, purple-silver trim. WEAPON / ITEM: a fireball floating in her palm.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] floating, palm up holding fire, head tilted [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: wildfire spreading (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 23. Mẹ Lúa · Vàng · WOOD · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `melua.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> melua hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Mẹ Lúa so it is easy to tell apart from the other heroes.
BODY: plump motherly woman about 45, round soft body, wide hips, head about 1/4 of the height.
SIGNATURE SHAPE: a BIG sheaf of golden rice cradled in her arms like a baby and a crown of rice ears.
COLORS: main ripe rice gold #E9C84A, second young rice green #7DBF4E, accent brown earth (element WOOD). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: warm smile, round rosy cheeks, smile lines around the eyes, hair in a low bun.
OUTFIT: green and gold layered robe with rice-ear embroidery, gold trim, small halo. WEAPON / ITEM: rice sheaf.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] cradling and rocking the rice sheaf, motherly [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: golden rice grains swirling (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 24. Mẫu Thượng Ngàn · Vàng · WOOD · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `mau.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> mau hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Mẫu Thượng Ngàn so it is easy to tell apart from the other heroes.
BODY: tall elegant goddess, long neck, slender, head about 1/6 of the height.
SIGNATURE SHAPE: a big FAN of giant green leaves and flowers spreading behind her like a peacock tail, and a flower crown.
COLORS: main emerald green #1E9E6A, second flower pink #F28CB1, accent gold (element WOOD). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: serene calm eyes, small knowing smile, long straight black hair.
OUTFIT: flowing emerald ao dai-style robe with forest embroidery, gold trim, small halo. WEAPON / ITEM: flowering branch.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" or "silver-armored beast standing upright or a hero with a tiger" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] graceful, flowering branch held up, other hand open [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: flowers and leaves blooming in a ring (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 25. Long Nữ Động Đình · Vàng · WATER · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `longnu.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> longnu hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Long Nữ Động Đình so it is easy to tell apart from the other heroes.
BODY: tall slender dragon princess about 20, long neck, head about 1/6 of the height.
SIGNATURE SHAPE: a long skirt that ends in a FISH-FIN hem fanning out on the ground and small dragon horns, very long hair flowing like water.
COLORS: main aquamarine #6FD3D8, second pearl white, accent coral pink (element WATER). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: almond eyes with teal eyeshadow, small fangs smile, pearl earrings.
OUTFIT: aquamarine silk with wave patterns, gold trim, small halo. WEAPON / ITEM: big glowing dragon pearl held with both hands.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] holding the pearl at the chest, hair floating [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: pearl beams and bubbles (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 26. Mẫu Thoải · Vàng · WATER · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `mauthoai.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> mauthoai hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Mẫu Thoải so it is easy to tell apart from the other heroes.
BODY: mature motherly goddess about 50, SEATED cross-legged on a big white lotus floating on a wave.
SIGNATURE SHAPE: a big white lotus throne with a curling wave under it and a tall crown with a long veil.
COLORS: main royal blue #2F59B8, second white, accent silver (element WATER). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: serene heavy-lidded eyes, plump cheeks, wise calm smile.
OUTFIT: white and royal-blue robe, silver crown with a veil, gold trim, small halo. WEAPON / ITEM: silver water ladle staff.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] seated on the lotus, one hand raised in blessing [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: water whirl that holds enemies (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 27. Nữ Thần Mặt Trời · Vàng · FIRE · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `matroi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> matroi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Nữ Thần Mặt Trời so it is easy to tell apart from the other heroes.
BODY: tall radiant goddess about 25, slender, head about 1/6 of the height.
SIGNATURE SHAPE: a HUGE sun disk with 12 pointed rays behind her, bigger than her body.
COLORS: main sun yellow-orange #FFB12E, second white, accent red (element FIRE). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: golden eyes, bright confident smile.
OUTFIT: golden-orange robe with flame hem, gold crown, gold trim. WEAPON / ITEM: sun scepter.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] both arms raised to the sky [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: burning sunbeams (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 28. Âu Cơ · Vàng · EARTH · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `auco.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> auco hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Âu Cơ so it is easy to tell apart from the other heroes.
BODY: tall graceful fairy mother about 25, slender, head about 1/6 of the height.
SIGNATURE SHAPE: BIG white crane wings spread UPWARD and OUTWARD (real wings) and a silk pouch of 100 eggs.
COLORS: main cream #FFF6E0, second soft gold #E7C46C, accent coral pink (element EARTH). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: kind motherly eyes, gentle smile, long black hair.
OUTFIT: cream robe with gold trim, coral sash, small halo. WEAPON / ITEM: egg pouch and a crane-feather wand.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] wings open, hand on the egg pouch, protective [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: healing light with crane feathers (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 29. Mẫu Địa · Vàng · EARTH · nhóm dễ nhầm: Nữ thần / công chúa áo dài + gậy + hào quang → `maudia.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> maudia hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Mẫu Địa so it is easy to tell apart from the other heroes.
BODY: tall stately earth mother about 40, strong wide shoulders, head about 1/5 of the height.
SIGNATURE SHAPE: roots spreading out from the hem of her robe into the ground like a wide tree base, hair braided with roots and flowers.
COLORS: main terracotta #B5562F, second deep brown, accent spring green sprouts (element EARTH). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: strong motherly face, deep brown eyes, warm smile.
OUTFIT: terracotta robe with root patterns, gold crown, gold trim, small halo. WEAPON / ITEM: clay jar of seeds.
MUST NOT look like the generic "slender lady in a long robe with a staff and halo" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] arms open, roots spreading [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: sprouts and stone shields rising (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 30. Lạc Tướng · Thường · METAL · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `lactuong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> lactuong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Lạc Tướng so it is easy to tell apart from the other heroes.
BODY: adult man about 30, stocky and broad-chested, short legs, head about 1/4 of the height.
SIGNATURE SHAPE: a HUGE fan-shaped headdress of tall white Lac-bird feathers, as tall as his torso, standing straight up.
COLORS: main polished bronze gold #C9963A, second dark patina teal #2F6B5E, accent white feathers (element METAL). common hero: simple clothes, few details, but keep the silhouette above.
FACE: thick straight eyebrows, square jaw, three short tattoo lines on each cheek, confident smirk.
OUTFIT: bronze chest plate with zigzag bands, teal loincloth with a bronze-drum sun-star buckle. WEAPON / ITEM: Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] axe resting on the shoulder, chin up, proud wide stance [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a wide golden arc of the axe with Lac-bird shapes (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 31. Dũng Sĩ Giáo Đồng · Thường · METAL · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `giaodong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> giaodong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Dũng Sĩ Giáo Đồng so it is easy to tell apart from the other heroes.
BODY: young soldier about 20, short and compact like a block, short thick legs, head about 1/4 of the height.
SIGNATURE SHAPE: a big ROUND bronze shield covering half his body in front plus a very long spear TWICE his height pointing up.
COLORS: main pewter grey #8A9399, second tarnished bronze #A8742E, accent bright silver spear tip (element METAL). common hero: simple clothes, few details, but keep the silhouette above.
FACE: mostly hidden by a round helmet with cheek guards and a nose bar, only fierce determined eyes visible.
OUTFIT: pewter scale vest, bronze greaves. WEAPON / ITEM: very long bronze-tipped spear.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] low defensive crouch behind the shield, spear upright like a wall guard [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a spinning spear trailing silver sparks (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 32. Thần Trống Đồng · Tím · METAL · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `trongdong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> trongdong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thần Trống Đồng so it is easy to tell apart from the other heroes.
BODY: stout barrel-chested drum spirit, round body, short legs, head about 1/4 of the height.
SIGNATURE SHAPE: a HUGE Dong Son bronze drum carried on his back, wider than his body, with the sun-star face showing.
COLORS: main polished gold-bronze #D4A23C, second deep red-brown #7A3B1E, accent green patina (element METAL). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: big round cheeks, wide open shouting mouth, short square beard, bushy brows.
OUTFIT: red-brown wrap with bronze plates, small crown of Lac-bird feathers, purple-silver trim. WEAPON / ITEM: two wooden drum mallets.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] wide stance, one mallet raised high, shouting a war call [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: golden drum-beat rings and sun-star (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 33. Lý Ngư Tướng Quân · Tím · WATER · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `lyngu.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> lyngu hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Lý Ngư Tướng Quân so it is easy to tell apart from the other heroes.
BODY: athletic young general about 25, springy legs, head about 1/4 of the height.
SIGNATURE SHAPE: a tall helmet crest shaped like a big curved CARP TAIL and a fin-shaped glaive.
COLORS: main koi orange #F2862E, second white #FFFFFF, accent red-gold scale trim (element WATER). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: eager bright eyes, two long thin carp whiskers growing on the upper lip, confident grin.
OUTFIT: orange-white carp-scale armor, fin-shaped shoulder guards, purple-silver trim. WEAPON / ITEM: fin-shaped glaive.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] mid-leap stance with one knee raised, glaive behind [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: carp leaping through a waterfall arc (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 34. Vua Lửa Pơtao Apui · Tím · FIRE · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `potaoapui.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> potaoapui hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Vua Lửa Pơtao Apui so it is easy to tell apart from the other heroes.
BODY: huge muscular highland chieftain about 40, very wide shoulders and chest, small head about 1/6 of the height.
SIGNATURE SHAPE: a big headdress of curved BUFFALO HORNS and a large flaming sacred sword planted in front.
COLORS: main black brocade #1E1E1E, second crimson red #B0182A, accent bronze-gold (element FIRE). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: long black hair, strong jaw, stern brows, red dots painted on the cheeks.
OUTFIT: Jarai black-and-red brocade loincloth with zigzag patterns, bronze arm rings, purple-silver trim. WEAPON / ITEM: flaming sword.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] arms crossed over the sword pommel, unshakable [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a flaming sword thrust (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 35. Thiên Lôi · Vàng · METAL · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `thienloi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thienloi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thiên Lôi so it is easy to tell apart from the other heroes.
BODY: huge burly thunder god, very wide shoulders twice his head width, thick arms, small head about 1/6 of the height.
SIGNATURE SHAPE: wild spiky white hair standing straight up like lightning plus a pair of small feathered wings on the back and a giant stone axe.
COLORS: main storm indigo #4A5578, second steel silver #C8D0DA, accent electric yellow #FFE14A (element METAL). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: thick angry eyebrows, square jaw, gritted teeth in a fierce grin, yellow glowing eyes.
OUTFIT: indigo armor with yellow lightning zigzags, silver bracers, gold trim, small crackling halo. WEAPON / ITEM: giant stone thunder axe on a short staff.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] axe raised overhead with both hands, legs wide, storming [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: blue-yellow lightning bolts (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 36. An Dương Vương · Vàng · METAL · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `adv.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> adv hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero An Dương Vương so it is easy to tell apart from the other heroes.
BODY: tall slim king about 50, long legs, straight back, head about 1/5 of the height.
SIGNATURE SHAPE: a TALL spiral tiered crown shaped like the Co Loa spiral citadel and the magic crossbow with a glowing golden turtle-claw trigger.
COLORS: main black-indigo #2C3550, second silver armor #AEB8C2, accent turtle-claw gold glow (element METAL). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: long thin mustache drooping down and a pointed goatee, sharp eyes, high cheekbones.
OUTFIT: black-indigo royal robe with silver armor plates, gold trim, small golden halo. WEAPON / ITEM: magic crossbow.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] crossbow held at the hip, other hand on the belt, regal and calm [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a golden turtle-claw arrow splitting into many (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 37. Lạc Long Quân · Vàng · WATER · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `llq.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> llq hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Lạc Long Quân so it is easy to tell apart from the other heroes.
BODY: tall powerful dragon lord about 40, broad shoulders, long legs, head about 1/6 of the height.
SIGNATURE SHAPE: a pair of big branching DRAGON HORNS growing from his head and a long dragon-tail sash flowing behind.
COLORS: main deep sea blue #1F5FA8, second jade #3FB59E, accent gold (element WATER). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: long flowing black hair and a long black beard, noble calm eyes, faint scales on the cheeks.
OUTFIT: deep blue robe with jade dragon scales, gold trim, small halo. WEAPON / ITEM: long straight sword.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] sword pointing down, cape and sash flowing, dignified [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a water dragon spiraling (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 38. Kinh Dương Vương · Vàng · FIRE · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `kinhduong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> kinhduong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Kinh Dương Vương so it is easy to tell apart from the other heroes.
BODY: heavy barrel-chested king about 50, wide body, thick legs, head about 1/5 of the height.
SIGNATURE SHAPE: a ROUND sun-star crown with pointed rays and a huge broad bronze sword; full curly beard.
COLORS: main scarlet #D8352A, second gold #E8B23A, accent black (element FIRE). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: full curly red-brown beard, bushy brows, laughing loud mouth.
OUTFIT: scarlet and gold royal armor, red cape, gold trim, small halo. WEAPON / ITEM: broad bronze sword.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] both hands on the sword pommel, belly out, laughing [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a red sun shockwave (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 39. Sơn Tinh · Vàng · EARTH · nhóm dễ nhầm: Vua / tướng đội mũ vàng, mặc giáp → `tanvien.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> tanvien hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Sơn Tinh so it is easy to tell apart from the other heroes.
BODY: tall heroic young god about 25, broad shoulders, long legs, head about 1/6 of the height.
SIGNATURE SHAPE: a crown with THREE mountain peaks and a small floating mountain hovering above his raised palm.
COLORS: main jade-olive #6F8A3C, second gold #D9A93A, accent white clouds (element EARTH). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: young heroic face, clean-shaven, strong brows, calm smile.
OUTFIT: jade-olive armor with mountain patterns, green cape, gold trim, small halo. WEAPON / ITEM: magic book on the belt.
MUST NOT look like the generic "armored king or general with a gold crown or helmet" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] one hand raising a small floating mountain [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: mountains rising from the ground (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 40. Cô Hái Sen · Thường · WATER · nhóm dễ nhầm: Cô gái thôn quê → `haisen.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> haisen hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Cô Hái Sen so it is easy to tell apart from the other heroes.
BODY: small girl about 10, short, round face, head about 1/3 of the height.
SIGNATURE SHAPE: a GIANT round lotus leaf held over her head like an umbrella and two short pigtails.
COLORS: main lotus pink #F4A3C0, second pale water blue #9ED3E8, accent green leaf (element WATER). common hero: simple clothes, few details, but keep the silhouette above.
FACE: big curious eyes, gap-tooth smile, rosy cheeks.
OUTFIT: pale blue ao ba ba, pink trousers, lotus flower tucked behind the ear. WEAPON / ITEM: lotus leaf umbrella and a pink lotus bud.
MUST NOT look like the generic "young village girl in a simple dress" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] twirling the lotus leaf, swaying happily [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: healing lotus petals and water drops (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 41. Cô Thả Đèn Trời · Thường · FIRE · nhóm dễ nhầm: Cô gái thôn quê → `denroi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> denroi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Cô Thả Đèn Trời so it is easy to tell apart from the other heroes.
BODY: little girl about 8, very short, head about 1/3 of the height.
SIGNATURE SHAPE: a big glowing paper sky lantern held up ABOVE her head with both arms, as big as her body; two hair buns.
COLORS: main lantern yellow #FFD45A, second tangerine #F6913A, accent red ribbon (element FIRE). common hero: simple clothes, few details, but keep the silhouette above.
FACE: wide amazed eyes looking up, small open mouth, round cheeks.
OUTFIT: tangerine ao tu than, yellow sash. WEAPON / ITEM: sky lantern.
MUST NOT look like the generic "young village girl in a simple dress" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] on tiptoes lifting the lantern up [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: small lanterns raining fire (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 42. Thợ Gốm Phù Lãng · Thường · EARTH · nhóm dễ nhầm: Cô gái thôn quê → `thogom.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thogom hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thợ Gốm Phù Lãng so it is easy to tell apart from the other heroes.
BODY: young potter girl about 18, average build, head about 1/4 of the height.
SIGNATURE SHAPE: a big round blue-glazed clay pot held over her head ready to throw, headscarf knot.
COLORS: main sand cream #E8D2A6, second clay brown, accent blue glaze #3E6FA8 (element EARTH). common hero: simple clothes, few details, but keep the silhouette above.
FACE: clay smudge on the nose, cheerful grin, tongue at the corner of the mouth.
OUTFIT: cream apron over a clay-brown tunic, brown headscarf knot. WEAPON / ITEM: clay pots.
MUST NOT look like the generic "young village girl in a simple dress" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] pot lifted overhead, one leg bent back [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: shattering pot shards (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 43. Tiên Dung · Tím · FIRE · nhóm dễ nhầm: Cô gái thôn quê → `tiendung.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> tiendung hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Tiên Dung so it is easy to tell apart from the other heroes.
BODY: teen princess about 17, slim, head about 1/4 of the height.
SIGNATURE SHAPE: a big open round hand fan and hair in two big ring-shaped loops on top of the head.
COLORS: main crimson #C8243A, second peach #F7C59F, accent gold (element FIRE). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: playful sly eyes, small pouty smile, rosy cheeks.
OUTFIT: crimson ao tu than with peach sash, purple-silver trim. WEAPON / ITEM: big round fan.
MUST NOT look like the generic "young village girl in a simple dress" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] fanning playfully, hip tilted, teasing [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a gust of fire wind from the fan (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 44. Nghê Đồng · Tím · METAL · nhóm dễ nhầm: Thú giáp bạc / tướng đi kèm hổ → `nghedong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> nghedong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Nghê Đồng so it is easy to tell apart from the other heroes.
BODY: Vietnamese nghe temple guardian beast on ALL FOURS, low and wide like a big muscular dog, short legs, large head.
SIGNATURE SHAPE: a mane of big curly flame-shaped spirals around the head and a bushy curly tail curling up over the back.
COLORS: main dark antique bronze #8C5A2B, second verdigris green #5FA39A, accent gold bell (element METAL). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: wide toothy grin, bulging round eyes, curly eyebrows, flat lion nose.
OUTFIT: gold bell on a red collar, verdigris patches on the bronze body. WEAPON / ITEM: none, paws and bite.
MUST NOT look like the generic "silver-armored beast standing upright or a hero with a tiger" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] crouched on four legs ready to pounce, tail up, playful [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: bronze shockwave rings from a roar (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 45. Thần Săn Ba Vì · Tím · WOOD · nhóm dễ nhầm: Thú giáp bạc / tướng đi kèm hổ → `thansan.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thansan hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thần Săn Ba Vì so it is easy to tell apart from the other heroes.
BODY: tall wiry hunter god about 30, long legs, narrow waist, head about 1/5 of the height.
SIGNATURE SHAPE: a deer-skull headdress with BIG branching antlers and a fur cape.
COLORS: main deep olive #556B2F, second fur tan #C7A27A, accent red-ochre war paint (element WOOD). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: red-ochre war paint stripes across the eyes, sharp cheekbones, focused stare.
OUTFIT: olive leather tunic, fur cape, bone necklace, purple-silver trim. WEAPON / ITEM: long bamboo hunting spear with a leaf blade.
MUST NOT look like the generic "silver-armored beast standing upright or a hero with a tiger" or "hooded hunter with a spear" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] spear held low, scanning ahead, one foot forward [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: green spear throw with spirit deer (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 46. Kỳ Lân Vàng · Vàng · METAL · nhóm dễ nhầm: Thú giáp bạc / tướng đi kèm hổ → `kylan.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> kylan hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Kỳ Lân Vàng so it is easy to tell apart from the other heroes.
BODY: qilin on FOUR long slender deer-like legs, tall horse-like body, long neck.
SIGNATURE SHAPE: a single long golden horn and golden flame-shaped tufts on all four legs, flowing white mane.
COLORS: main shining gold #E8B84A, second ivory white #FFF4DC, accent jade green cloud curls (element METAL). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: noble dragon-like face with long whiskers, gentle wise eyes.
OUTFIT: gold scales on the back, ivory belly, cloud patterns on the legs, gold trim and a small halo of light behind the horn. WEAPON / ITEM: horn and hooves.
MUST NOT look like the generic "silver-armored beast standing upright or a hero with a tiger" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] prancing, one front hoof raised, head held high [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: golden auspicious clouds and gold fire (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 47. Chúa Sơn Lâm · Vàng · WOOD · nhóm dễ nhầm: Thú giáp bạc / tướng đi kèm hổ → `ongho.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> ongho hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Chúa Sơn Lâm so it is easy to tell apart from the other heroes.
BODY: HUGE tiger on ALL FOURS, massive shoulders, heavy paws, long body.
SIGNATURE SHAPE: a full real tiger shape with bold black stripes and a leafy green mantle on the shoulders.
COLORS: main tiger orange #F08A24, second black stripes, accent jade leaf green mantle (element WOOD). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: majestic tiger face, white cheek fur, a small sun-star mark on the forehead, golden eyes.
OUTFIT: bronze collar, green leaf mantle, gold trim, small halo. WEAPON / ITEM: claws and fangs.
MUST NOT look like the generic "silver-armored beast standing upright or a hero with a tiger" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] prowling forward, head low, tail swaying [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: tiger roar with green claw slashes (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 48. Thợ Săn Rừng · Thường · WOOD · nhóm dễ nhầm: Thợ săn trùm mũ cầm giáo → `thosan.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thosan hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thợ Săn Rừng so it is easy to tell apart from the other heroes.
BODY: lean wiry adult hunter, long arms, always low and bent, head about 1/4 of the height.
SIGNATURE SHAPE: a deep oversized hood with two pointed leopard ears covering the face in shadow, and two curved hunting knives.
COLORS: main dark moss green #3E5A32, second leaf brown #6B4A2E, accent orange glowing eyes (element WOOD). common hero: simple clothes, few details, but keep the silhouette above.
FACE: face hidden in hood shadow, only two glowing orange eyes and a mouth scarf.
OUTFIT: leaf-patched hooded cloak, leather wraps on the shins. WEAPON / ITEM: two curved hunting knives held backhand.
MUST NOT look like the generic "hooded hunter with a spear" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] low stalking crouch, knives ready, sneaky [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: green poison smoke slash (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 49. Cao Lỗ · Tím · METAL · nhóm dễ nhầm: Áo nâu-vàng đứng thẳng cầm vật nhỏ → `caolo.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> caolo hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Cao Lỗ so it is easy to tell apart from the other heroes.
BODY: middle-aged inventor about 45, average height, thick forearms, slight belly, head about 1/4 of the height.
SIGNATURE SHAPE: a WIDE mechanical crossbow held horizontally, wider than his whole body, with visible bronze gears and a crank.
COLORS: main dark iron grey #5B6168, second leather brown #7B5434, accent bronze gears (element METAL). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: trimmed square beard and mustache, furrowed focused brows, bronze magnifying lens strapped over one eye.
OUTFIT: leather apron full of tools over an iron-grey tunic, purple-silver trim. WEAPON / ITEM: big repeating crossbow.
MUST NOT look like the generic "man in a plain brown-yellow tunic standing straight holding a small object" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] kneeling on one knee aiming the crossbow, one eye closed [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a burst of piercing bronze bolts (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 50. Lang Liêu · Tím · EARTH · nhóm dễ nhầm: Áo nâu-vàng đứng thẳng cầm vật nhỏ → `langlieu.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> langlieu hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Lang Liêu so it is easy to tell apart from the other heroes.
BODY: slim gentle young prince about 20, narrow shoulders, head about 1/4 of the height.
SIGNATURE SHAPE: a tall STACK of square green banh chung cakes carried on a tray.
COLORS: main ochre yellow #E3B448, second banana-leaf green, accent brown sash (element EARTH). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: humble shy eyes, small polite smile, neat hair under a simple gold headband.
OUTFIT: ochre tunic, brown sash, purple-silver trim. WEAPON / ITEM: tray of banh chung.
MUST NOT look like the generic "man in a plain brown-yellow tunic standing straight holding a small object" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] bowing slightly while offering the tray [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: square and round cakes giving buffs (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 51. Ông Đùng · Tím · EARTH · nhóm dễ nhầm: Áo nâu-vàng đứng thẳng cầm vật nhỏ → `ongdung.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> ongdung hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Ông Đùng so it is easy to tell apart from the other heroes.
BODY: giant folk man, very tall long torso, huge hands and feet, small head about 1/7 of the height.
SIGNATURE SHAPE: a long carrying pole across his shoulders with two BIG baskets of earth, wider than his body.
COLORS: main straw yellow #D8B35A, second dark tanned skin, accent green moss (element EARTH). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: goofy friendly giant face, big nose, wide smile.
OUTFIT: straw loincloth, purple-silver trim. WEAPON / ITEM: carrying pole.
MUST NOT look like the generic "man in a plain brown-yellow tunic standing straight holding a small object" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] pole balanced on the shoulders, walking happily [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: thrown earth piling into a hill (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 52. Lạc Hầu · Tím · EARTH · nhóm dễ nhầm: Áo nâu-vàng đứng thẳng cầm vật nhỏ → `lachau.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> lachau hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Lạc Hầu so it is easy to tell apart from the other heroes.
BODY: lean dignified advisor about 55, straight back, head about 1/5 of the height.
SIGNATURE SHAPE: a tall banner pole with a Lac-bird flag flying above him and a pointed hat.
COLORS: main mustard #BF9B30, second dark brown, accent red banner (element EARTH). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: long thin goatee, wise sharp eyes, raised eyebrow.
OUTFIT: mustard robe with brown collar, purple-silver trim. WEAPON / ITEM: banner pole.
MUST NOT look like the generic "man in a plain brown-yellow tunic standing straight holding a small object" shared by other heroes — keep only what is listed here.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] banner planted, hand raised commanding [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a golden formation circle (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 53. Thầy Mo Lửa · Thường · FIRE → `thaymo.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thaymo hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thầy Mo Lửa so it is easy to tell apart from the other heroes.
BODY: tall gaunt shaman about 45, very thin, long arms, head about 1/5 of the height.
SIGNATURE SHAPE: a big ROUND headdress ring of red-and-black feathers and bones around the head like a fire wheel.
COLORS: main dark plum purple #5B2C6F, second flame orange #F47A20, accent bone white face paint (element FIRE). common hero: simple clothes, few details, but keep the silhouette above.
FACE: white painted stripes on the face, hollow cheeks, wide crazy eyes, long chin.
OUTFIT: plum robe with orange flame hem, bead necklaces. WEAPON / ITEM: gnarled staff with a burning gourd on top.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] arms spread wide in a ritual dance, one knee up [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: exploding fireballs (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 54. Lực Sĩ Núi · Thường · EARTH → `lucsi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> lucsi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Lực Sĩ Núi so it is easy to tell apart from the other heroes.
BODY: huge bodybuilder giant, massive shoulders 3x head width, tiny head about 1/7 of the height, short legs.
SIGNATURE SHAPE: a big grey BOULDER held on one shoulder, bigger than his head.
COLORS: main earth ochre #C99A3C, second clay red-brown skin, accent grey boulder (element EARTH). common hero: simple clothes, few details, but keep the silhouette above.
FACE: tiny head, wide square jaw, short beard, unibrow, proud grin.
OUTFIT: ochre loincloth, bronze wrist cuffs. WEAPON / ITEM: boulder.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] boulder on the shoulder, flexing the other arm [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: boulder smash with dust (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 55. Thạch Sanh · Tím · WOOD → `thachsanh.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thachsanh hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thạch Sanh so it is easy to tell apart from the other heroes.
BODY: tall muscular young woodcutter about 22, V-shaped torso, long legs, head about 1/5 of the height.
SIGNATURE SHAPE: a HUGE woodcutter axe with a wide blade planted head-down in front of him and a round magic moon-lute slung on his back.
COLORS: main forest green #2E7D3A, second tan skin, accent gold lute (element WOOD). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: honest kind face, wide jaw, messy shaggy hair, small scar on the eyebrow.
OUTFIT: bare chest, forest-green loincloth with rope belt, purple-silver trim on the lute strap. WEAPON / ITEM: giant axe.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] both hands resting on the axe handle, relaxed and strong [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: golden axe slash with lute notes (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 56. Sọ Dừa · Tím · WOOD → `sodua.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> sodua hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Sọ Dừa so it is easy to tell apart from the other heroes.
BODY: tiny boy almost completely inside a ROUND coconut, the coconut is his whole body, only small arms and legs stick out.
SIGNATURE SHAPE: a perfectly round coconut-ball body with the top of the shell worn as a hat.
COLORS: main coconut brown #7A5230, second young-coconut green #6FAF3C, accent cream coconut flesh (element WOOD). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: kind bright eyes peeking out from the shell, chubby cheeks, small smile.
OUTFIT: purple-silver trim ring around the shell opening, small flute tied on. WEAPON / ITEM: none, throws green coconuts.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] rolling slightly sideways, playing the small flute [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — attack (shooting / casting forward): [5] prepare: weight back, drawing / aiming [6] swing: body twisting forward, about to release [7] hit: full extension, the projectile leaving the hand / weapon [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: coconut shell opening with light (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 57. Thần Cá Ông · Tím · WATER → `caong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> caong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thần Cá Ông so it is easy to tell apart from the other heroes.
BODY: big round whale god, the body is a huge rounded whale shape TWICE as wide as tall, tiny fin arms, very short legs.
SIGNATURE SHAPE: a round whale silhouette with a big tail fin curling up behind and a small water spout on top of the head.
COLORS: main slate blue #3D5A80, second cream white belly, accent barnacle gold (element WATER). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: kind old whale face with a beard of white barnacles, small gentle eyes.
OUTFIT: gold barnacle ornaments, purple-silver trim. WEAPON / ITEM: none, body slam.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] floating upright, fin arms open protectively [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a water bubble shield (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 58. Ông Táo · Tím · FIRE → `ongtao.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> ongtao hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Ông Táo so it is easy to tell apart from the other heroes.
BODY: plump short man about 50, round belly, short legs, head about 1/4 of the height.
SIGNATURE SHAPE: a black official hat with two long horizontal side wings (mu canh chuon) and a small golden carp swimming around him.
COLORS: main orange-red #E0592A, second black, accent gold carp (element FIRE). epic hero: richer costume with a purple-silver trim and a small aura, but keep the silhouette above.
FACE: jolly round face, thin mustache, rosy nose.
OUTFIT: orange-red robe (no trousers, bare legs — the folk joke), purple-silver trim. WEAPON / ITEM: long iron fire tongs holding a glowing coal.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] tongs held up, belly out, jolly [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: kitchen fire burst (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 59. Chú Cuội · Vàng · WOOD → `cuoi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> cuoi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Chú Cuội so it is easy to tell apart from the other heroes.
BODY: plump cheerful man about 35, round belly, short legs, head about 1/4 of the height.
SIGNATURE SHAPE: a magic banyan tree carried on his back, the leafy round canopy rising ABOVE his head, bigger than him.
COLORS: main banyan green #3C7F45, second moonlight pale yellow #F4E9A8, accent silver crescent moon (element WOOD). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: big goofy grin, round nose, raised eyebrows of a joker, small chin beard.
OUTFIT: pale yellow tunic, gold trim, crescent-moon pendant, small halo of moonlight. WEAPON / ITEM: woodcutter axe on the shoulder.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] grinning with the axe on the shoulder, winking [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: banyan leaves spiraling with moonlight (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 60. Rồng Mẹ Hạ Long · Vàng · WATER → `halong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> halong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Rồng Mẹ Hạ Long so it is easy to tell apart from the other heroes.
BODY: long serpentine Vietnamese dragon coiled in an S-shape, no humanoid body, small legs.
SIGNATURE SHAPE: an S-coiled long dragon body with a flowing fin crest and a big pearl in one claw.
COLORS: main sea-foam mint #8FE3CF, second pearl white, accent gold horns (element WATER). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: gentle motherly dragon face, long whiskers, kind eyes.
OUTFIT: gold trim on the fins, small halo. WEAPON / ITEM: pearl and tail.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] coiled, head raised, holding the pearl [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: emerald islands rising from waves (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 61. Thánh Gióng · Vàng · FIRE → `giong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> giong hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thánh Gióng so it is easy to tell apart from the other heroes.
BODY: a young giant boy riding a big iron horse (mounted silhouette, horse and rider together).
SIGNATURE SHAPE: a black iron horse with a BURNING fire mane and the boy swinging an uprooted bamboo with roots.
COLORS: main iron black #2B2B2B, second rust red #B23A1E, accent flame orange (element FIRE). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: chubby child face with a determined frown, short spiky hair.
OUTFIT: rust-red tunic, iron armor plates, iron helmet, gold trim, small halo. WEAPON / ITEM: burning uprooted bamboo.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] horse rearing slightly, boy holding the bamboo high [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: burning bamboo sweep with fire (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 62. Thần Trụ Trời · Vàng · EARTH → `trutroi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> trutroi hero12`
```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right). REDESIGN of the hero Thần Trụ Trời so it is easy to tell apart from the other heroes.
BODY: colossal stone giant, enormous upper body, tiny head about 1/8 of the height, thick pillar legs.
SIGNATURE SHAPE: a tall stone pillar held upright on one shoulder, reaching above the top of his head, clouds around it.
COLORS: main stone grey #8C8C84, second ochre bands, accent sky blue clouds (element EARTH). legendary hero: most ornate, gold trim, small crown or halo, but keep the silhouette above.
FACE: stone face with cracks, heavy brow ridge, calm mighty eyes.
OUTFIT: woven rope loincloth, rocks on the shoulders, gold trim, small halo. WEAPON / ITEM: sky pillar.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet (or floating base) stand on the same invisible baseline near the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] holding the pillar upright, legs planted [2] same pose, breathing in: chest and shoulders slightly up, weapon/hair/cloth slightly lifted [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered, showing the unique face.
ROW 2 — melee attack: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: the pillar slamming down (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames of the same row; nothing touches or crosses a cell border.
STYLE: cute stylized mobile-game character in the same art family as the other heroes: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes. Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
DISTINCT SILHOUETTE (most important): the character must be recognizable from its black shadow alone, at 40 px: follow BODY for age, build and head-to-body ratio (do NOT give every hero the same 1/3 head and the same height), and make SIGNATURE SHAPE big and bold. Main color must clearly be the first COLORS entry.
FACE: do not reuse the generic chibi face (same round head, same big round eyes) — draw the unique features in FACE (eyebrows, beard, scars, wrinkles, age lines, eye shape).
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 8. Nền bản đồ (trống đồng)

### 63. Nền bản đồ · song → `nen-song.png`
```
Create ONE image: a 1792x832 top-down game map background (bird's-eye view, slightly tilted) for a cute mobile tower-defense game, a calm riverside of the Da river: grass fields, a wide blue river along the top edge with sandy banks, scattered reeds.
IMPORTANT: draw NO road, NO path, NO trail, NO dashed lines anywhere. The middle of the image must stay EMPTY open ground with even texture (no buildings, no characters, no big objects) — the game draws its own winding road on top. Put details only near the four edges.
Subtle Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked softly into the ground texture or carved stones at the corners. Soft daylight, gentle colors, no text, no watermark, no frame, full bleed.
```

## 10. Quái gen lại (đủ dáng)

### 64. Quái · Quỷ Cưỡi Lợn → `kybinh.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> kybinh enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Quỷ Cưỡi Lợn: small grey-green goblin with tusks and tiny horns riding a charging dark-brown ghost wild boar with curved white tusks, glowing red eyes and a bristly mane, goblin holds a short bronze spear, NO human, NO horse. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 65. Quái · Tôm Binh → `tom.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> tom enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Tôm Binh: orange river-shrimp soldier walking on small legs, tiny bronze helmet, round bronze shield with a star, short spear. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 66. Quái · Cá Sấu → `casau.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> casau enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Cá Sấu: chubby green crocodile walking on four short legs, bumpy back scales, toothy grin, bronze ring on the tail. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 67. Quái · Rùa Giáp → `rua.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> rua enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Rùa Giáp: big slow tortoise walking on four legs, dark green shell with bronze spikes and a zigzag rim, stern eyebrows. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 68. Quái · Sứa Tinh → `phuthuy.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> phuthuy enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Sứa Tinh: translucent teal jellyfish spirit floating upright, round bell-shaped head with two big glowing cyan eyes and a small grumpy mouth, wavy tentacles tangled with green seaweed, holds a small coral branch with one tentacle, NO human. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 69. Quái · Chim Bão → `chimbao.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> chimbao enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Chim Bão: blue-grey storm bird flying with wide wings, small lightning sparks on the wing tips, angry eyes. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, flying at the same height in every cell.
CELLS: [1] flying, wings fully up [2] wings half down [3] wings fully down [4] wings half up (a smooth 4-frame flap loop) [5] attack wind-up: pulling back, eyes narrowed [6] diving attack: lunging forward.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 70. Quái · Ếch Mẹ → `echme.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> echme enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Ếch Mẹ: big fat green mother toad with a yellow belly, warts on the back, wide mouth, hopping. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 71. Quái · Nòng Nọc → `nongnoc.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> nongnoc enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Nòng Nọc: small round black tadpole with a wiggly tail and one big shiny eye, swimming. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 72. Quái · Giao Long Con → `giaolong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> giaolong enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Giao Long Con: young green water dragon slithering, small horns, whiskers, little fins, curled tail. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 73. Quái · Yêu Tinh Rừng → `yeutinh.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> yeutinh enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Yêu Tinh Rừng: small green forest goblin with pointy ears, leaf loincloth, wooden club. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 74. Quái · Rắn Độc → `ran.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> ran enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Rắn Độc: green venomous snake slithering in S-curves, yellow belly stripes, forked red tongue, small fangs. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 75. Quái · Dơi Hang → `doi.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> doi enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Dơi Hang: purple cave bat flying, big ears, tiny fangs, red eyes, leathery wings. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, flying at the same height in every cell.
CELLS: [1] flying, wings fully up [2] wings half down [3] wings fully down [4] wings half up (a smooth 4-frame flap loop) [5] attack wind-up: pulling back, eyes narrowed [6] diving attack: lunging forward.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 76. Quái · Thạch Tinh → `thachtinh.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thachtinh enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Thạch Tinh: stocky grey stone golem of the cave, cracked rock body with moss, glowing yellow eyes, big stone fists. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 77. Quái · Đá Con → `dacon.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> dacon enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Đá Con: small round grey rock creature with big cute eyes, stubby arms and legs, running. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 78. Quái · Quỷ Giáo → `linhan.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> linhan enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Quỷ Giáo: small grey-green goblin soldier with pointy ears, two small horns, tusks and red eyes, dark red leather vest, small leather cap, round wooden shield, long bronze spear, NO human face. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 79. Quái · Sói Cung Thủ → `cungan.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> cungan enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Sói Cung Thủ: grey wolf demon standing on hind legs, wolf head with yellow eyes and sharp fangs, bushy tail, brown-green leather vest, quiver of arrows on the back, drawing a wooden bow, NO human. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 80. Quái · Mực Tinh → `muc.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> muc enemy6`
```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Mực Tinh: pink squid spirit floating upright, big angry eyes, eight curly tentacles, small ink drops. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the bite / claw / weapon.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 11. Boss gen lại (đủ dáng)

### 81. Boss · Quỷ Vương Ân → `anvuong.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> anvuong boss9`
```
Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: Quỷ Vương Ân: demon king with dark blue skin, big curved water-buffalo horns, fangs and glowing yellow eyes, black armor with gold trim, riding a black demon steed with a flaming red mane and glowing eyes, big halberd, war drum on the saddle, NO human face. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 82. Boss · Hà Bá → `haba.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> haba boss9`
```
Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: Hà Bá: giant old catfish spirit standing upright on a fish tail, long drooping whisker-beard, wrinkled dark green-blue skin, fish-scale robe, coral and seashell crown, trident, NO human. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 83. Boss · Thủy Tinh → `thuytinh.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> thuytinh boss9`
```
Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: Thủy Tinh: water demon king with a blue sea-dragon head (horns, whiskers, fangs), silver-blue scaly body, fin crest on the back, silver-blue armor and fish-scale cape, crown of waves, trident, NO human face. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 84. Boss · Hổ Vương Triệu Đà → `trieuda.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> trieuda boss9`
```
Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: Hổ Vương Triệu Đà: tiger-headed demon general, orange tiger head with black-red flame stripes, long fangs and glowing eyes, clawed paws, dark red and black armor, tiger tail, big curved sword, NO human face. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 85. Boss · Đại Bàng Tinh → `daibang.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> daibang boss9`
```
Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: Đại Bàng Tinh: giant golden-brown eagle demon of the cave, spread wings, sharp talons, fierce red eyes, flying. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 86. Boss · Hồ Tinh Chín Đuôi → `hotinh.png`
Cắt: `python3 tools/cat-sheet.py <ảnh> hotinh boss9`
```
Create ONE image: a 768x768 boss animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x3 grid of nine equal 256x256 cells, read left to right, top to bottom.
BOSS: Hồ Tinh Chín Đuôi: white nine-tailed fox demon standing on hind legs, nine fluffy tails fanned out, sly red eyes, purple fox-fire flames. Big, menacing but still cute chibi boss facing RIGHT, the body fills about 85% of the cell height, feet on the same invisible baseline near the bottom of every cell.
CELLS: [1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher (a smooth 4-frame walk loop) [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back.
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells. Small changes between neighbouring frames; nothing touches or crosses a cell border.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 12. Nút giao diện thêm (trống đồng)

### 87. Nút · ui-tran-4 → `ui-tran-4.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game UI icons, one per cell, left to right:
[1] golden star with a plus sign (merge stars)  [2] tunic with an upward arrow (equip gear)  [3] bronze padlock (locked)  [4] two circular arrows (reroll / refresh).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 88. Nút · ui-tran-5 → `ui-tran-5.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game UI icons, one per cell, left to right:
[1] glowing bronze oil lamp (hint / tip)  [2] infinity loop made of bronze rope (endless mode)  [3] two crossed bronze swords (battle)  [4] green check mark on a bronze disc (done).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 89. Nút · ui-huy-chuong → `ui-huy-chuong.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game UI icons, one per cell, left to right:
[1] gold medal with a red ribbon  [2] silver medal with a blue ribbon  [3] bronze medal with a green ribbon  [4] small golden crown (top rank).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 13. Icon đồ vật

### 90. Đồ thường · riu (4 độ hiếm) → `do-riu.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a short bronze battle axe (Rìu Đồng), COMMON: plain dull bronze and wood, no gems  [2] a short bronze battle axe (Rìu Đồng), RARE: polished bronze with blue trim and one small blue gem  [3] a short bronze battle axe (Rìu Đồng), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a short bronze battle axe (Rìu Đồng), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 91. Đồ thường · no (4 độ hiếm) → `do-no.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a bamboo crossbow (Nỏ Tre), COMMON: plain dull bronze and wood, no gems  [2] a bamboo crossbow (Nỏ Tre), RARE: polished bronze with blue trim and one small blue gem  [3] a bamboo crossbow (Nỏ Tre), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a bamboo crossbow (Nỏ Tre), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 92. Đồ thường · gay (4 độ hiếm) → `do-gay.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a shaman staff with a carved head (Gậy Thầy Mo), COMMON: plain dull bronze and wood, no gems  [2] a shaman staff with a carved head (Gậy Thầy Mo), RARE: polished bronze with blue trim and one small blue gem  [3] a shaman staff with a carved head (Gậy Thầy Mo), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a shaman staff with a carved head (Gậy Thầy Mo), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 93. Đồ thường · mu (4 độ hiếm) → `do-mu.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a feathered warrior headdress hat (Mũ Lông Chim), COMMON: plain dull bronze and wood, no gems  [2] a feathered warrior headdress hat (Mũ Lông Chim), RARE: polished bronze with blue trim and one small blue gem  [3] a feathered warrior headdress hat (Mũ Lông Chim), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a feathered warrior headdress hat (Mũ Lông Chim), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 94. Đồ thường · giap (4 độ hiếm) → `do-giap.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a sleeveless warrior tunic / chest armor (Áo Giáp), COMMON: plain dull bronze and wood, no gems  [2] a sleeveless warrior tunic / chest armor (Áo Giáp), RARE: polished bronze with blue trim and one small blue gem  [3] a sleeveless warrior tunic / chest armor (Áo Giáp), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a sleeveless warrior tunic / chest armor (Áo Giáp), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 95. Đồ bộ · lac-long (5 món) → `bo-lac-long.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [2] crossbow of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [3] staff of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [4] helmet of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [5] chest armor of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 96. Đồ bộ · son-tinh (5 món) → `bo-son-tinh.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [2] crossbow of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [3] staff of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [4] helmet of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [5] chest armor of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 97. Đồ bộ · chim-lac (5 món) → `bo-chim-lac.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [2] crossbow of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [3] staff of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [4] helmet of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [5] chest armor of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 98. Đồ bộ · trong-dong (5 món) → `bo-trong-dong.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [2] crossbow of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [3] staff of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [4] helmet of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [5] chest armor of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 99. Đồ bộ · ngua-sat (5 món) → `bo-ngua-sat.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [2] crossbow of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [3] staff of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [4] helmet of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [5] chest armor of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 100. Phụ kiện 1 → `phu-kien-1.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] tiger claw on a cord  [2] brown leather glove  [3] woven belt with a bronze buckle  [4] pair of straw sandals.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 101. Phụ kiện 2 → `phu-kien-2.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] red cloth headband scarf  [2] indigo sage turban with a small bronze pin  [3] jade eye-shaped amulet  [4] glowing green life jade  [5] flat bronze drum face with sun-star.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 102. Phụ kiện 3 → `phu-kien-3.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] wooden drum mallet with a cloth grip  [2] rhino horn  [3] single long Lac bird feather  [4] shiny silver-blue fish scale  [5] handful of golden rice grains.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 103. Sính lễ của boss → `sinh-le.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] small cute elephant with nine tusks and a red saddle cloth, legendary treasure, small golden glow  [2] proud rooster with nine spurs and a red comb, legendary treasure, small golden glow  [3] small horse with a flowing nine-colored red mane, legendary treasure, small golden glow  [4] glowing red-gold revival pearl with a phoenix shape inside, legendary treasure, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 104. Đồ ghép 1 → `do-ghep-1.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] Dong Son bronze drum, full drum with frogs on top, rare magical crafted item, slightly glowing  [2] two crossed red-glowing battle axes, rare magical crafted item, slightly glowing  [3] staff with three rings of sky, earth and water, rare magical crafted item, slightly glowing  [4] staff topped with a spinning hourglass and stars, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 105. Đồ ghép 2 → `do-ghep-2.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] heavy bronze chest armor with a shield emblem, rare magical crafted item, slightly glowing  [2] dark scythe with a curved blade and purple glow, rare magical crafted item, slightly glowing  [3] sharp horn spearhead cracking a shield, rare magical crafted item, slightly glowing  [4] wide axe with a water-wave blade, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 106. Đồ ghép 3 → `do-ghep-3.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] bow with a bird eye on the grip, rare magical crafted item, slightly glowing  [2] bronze Lac bird talisman on a red string, rare magical crafted item, slightly glowing  [3] shirt covered in silver fish scales, rare magical crafted item, slightly glowing  [4] blue water-sealing jade with a calm wave inside, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 107. Đồ ghép 4 → `do-ghep-4.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] folded fishing net with floats, rare magical crafted item, slightly glowing  [2] radiant white sea pearl on a shell, rare magical crafted item, slightly glowing  [3] golden turtle claw crossbow trigger, rare magical crafted item, slightly glowing  [4] heavenly golden axe of Thạch Sanh with light rays, rare magical crafted item, slightly glowing  [5] white feather cloak of Âu Cơ with a golden clasp, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 14. Icon nhỏ (chỉ số, trạng thái, tiền tệ)

### 108. Icon nhỏ · ic-chi-so-1 → `ic-chi-so-1.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-chi-so-1`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] armor: a sturdy bronze kite shield  [2] magic resistance: a glowing purple orb inside a bronze ring  [3] move speed: one green-brown straw sandal with three speed lines  [4] attack speed: a yellow lightning bolt  [5] damage: a short bronze sword pointing up-right.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 109. Icon nhỏ · ic-chi-so-2 → `ic-chi-so-2.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-chi-so-2`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] health: a big red blood drop  [2] critical hit: an orange-red spiky burst star  [3] attack range: a red and cream round target with an arrow in the center  [4] cooldown: a bronze hourglass with blue sand  [5] energy / mana: a big blue water drop with a white sparkle.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 110. Icon nhỏ · ic-chi-so-3 → `ic-chi-so-3.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-chi-so-3`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] strength: a clenched orange fist  [2] agility: a green Lac bird feather  [3] intelligence: an open blue bamboo scroll book  [4] damage reduction: a teal shield with a white downward arrow  [5] armor penetration: a bronze spear tip cracking through a small shield.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 111. Icon nhỏ · ic-trang-thai-1 → `ic-trang-thai-1.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-trang-thai-1`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] slowed: a small brown snail  [2] stunned: three yellow stars circling in a ring  [3] burning: an orange-red flame  [4] poisoned: a green poison drop with a tiny skull  [5] frozen: a light-blue ice crystal snowflake.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 112. Icon nhỏ · ic-trang-thai-2 → `ic-trang-thai-2.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-trang-thai-2`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] stuck in mud: brown mud puddle with two bubbles  [2] shield: a glowing cyan bubble dome  [3] healing: a green plus cross with a glow  [4] enraged: a red angry vein mark (four curved strokes)  [5] flying: one white feathered wing.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 113. Icon nhỏ · ic-trang-thai-3 → `ic-trang-thai-3.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-trang-thai-3`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] boss: a red demon crown with two small horns  [2] silenced: a cream speech bubble crossed by a red slash  [3] elite: a purple faceted gem  [4] diving underwater: two blue wave lines with bubbles.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 114. Icon nhỏ · ic-tien-te → `ic-tien-te.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-tien-te`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] gold reward: a small cloth pouch with a gold coin on it  [2] skill point: a yellow star on a dark-green bronze disc  [3] rune point: a small grey carved stone seal with a golden sun mark  [4] combat power: two crossed bronze swords  [5] level up: two green upward chevrons.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 115. Icon nhỏ · ic-khac → `ic-khac.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-khac`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] hard mode: a cream skull with red glowing eyes  [2] flood rising: blue water waves with an upward arrow  [3] element counter: an orange arrow hitting a small yellow spark  [4] upgrade: a fat green upward arrow  [5] magic penetration: a purple glowing spear tip piercing a ring.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 116. Icon nhỏ · ic-ngu-hanh → `ic-ngu-hanh.png`
Cắt: `python3 tools/cat-items.py <ảnh> ic-ngu-hanh`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] Metal element: a silver-white bronze axe blade on a round grey disc  [2] Wood element: a green sprouting leaf on a round green disc  [3] Water element: two blue waves on a round blue disc  [4] Fire element: an orange flame on a round red disc  [5] Earth element: a brown mountain peak on a round ochre disc.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```
