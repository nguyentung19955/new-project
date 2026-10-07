# Prompt Gemini đầy đủ — mỗi ảnh một prompt (47 ảnh)

Mỗi khối dán **riêng một lần** vào Gemini (đính kèm `docs/mau-lac-tuong.png` làm mẫu nét vẽ nếu được), tải ảnh về và đặt **đúng tên file** ghi trên khối. Gen theo thứ tự từ trên xuống: phần 0 (nền menu tên mới) và 1–4 là cần thiết, phần 5–7 là tùy chọn.

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

## 8. Nền bản đồ (trống đồng)

### 3. Nền bản đồ · song → `nen-song.png`
```
Create ONE image: a 1792x832 top-down game map background (bird's-eye view, slightly tilted) for a cute mobile tower-defense game, a calm riverside of the Da river: grass fields, a wide blue river along the top edge with sandy banks, scattered reeds.
IMPORTANT: draw NO road, NO path, NO trail, NO dashed lines anywhere. The middle of the image must stay EMPTY open ground with even texture (no buildings, no characters, no big objects) — the game draws its own winding road on top. Put details only near the four edges.
Subtle Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked softly into the ground texture or carved stones at the corners. Soft daylight, gentle colors, no text, no watermark, no frame, full bleed.
```

## 10. Quái gen lại (đủ dáng)

### 4. Quái · Quỷ Cưỡi Lợn → `kybinh.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Quỷ Cưỡi Lợn: small grey-green goblin with tusks and tiny horns riding a charging dark-brown ghost wild boar with curved white tusks, glowing red eyes and a bristly mane, goblin holds a short bronze spear, NO human, NO horse. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 5. Quái · Tôm Binh → `tom.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Tôm Binh: orange river-shrimp soldier walking on small legs, tiny bronze helmet, round bronze shield with a star, short spear. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 6. Quái · Cá Sấu → `casau.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Cá Sấu: chubby green crocodile walking on four short legs, bumpy back scales, toothy grin, bronze ring on the tail. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 7. Quái · Rùa Giáp → `rua.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Rùa Giáp: big slow tortoise walking on four legs, dark green shell with bronze spikes and a zigzag rim, stern eyebrows. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 8. Quái · Sứa Tinh → `phuthuy.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Sứa Tinh: translucent teal jellyfish spirit floating upright, round bell-shaped head with two big glowing cyan eyes and a small grumpy mouth, wavy tentacles tangled with green seaweed, holds a small coral branch with one tentacle, NO human. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 9. Quái · Chim Bão → `chimbao.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Chim Bão: blue-grey storm bird flying with wide wings, small lightning sparks on the wing tips, angry eyes. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] flying, wings up [2] flying, wings down [3] diving attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 10. Quái · Ếch Mẹ → `echme.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Ếch Mẹ: big fat green mother toad with a yellow belly, warts on the back, wide mouth, hopping. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 11. Quái · Nòng Nọc → `nongnoc.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Nòng Nọc: small round black tadpole with a wiggly tail and one big shiny eye, swimming. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 12. Quái · Giao Long Con → `giaolong.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Giao Long Con: young green water dragon slithering, small horns, whiskers, little fins, curled tail. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 13. Quái · Yêu Tinh Rừng → `yeutinh.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Yêu Tinh Rừng: small green forest goblin with pointy ears, leaf loincloth, wooden club. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 14. Quái · Rắn Độc → `ran.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Rắn Độc: green venomous snake slithering in S-curves, yellow belly stripes, forked red tongue, small fangs. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 15. Quái · Dơi Hang → `doi.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Dơi Hang: purple cave bat flying, big ears, tiny fangs, red eyes, leathery wings. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] flying, wings up [2] flying, wings down [3] diving attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 16. Quái · Thạch Tinh → `thachtinh.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Thạch Tinh: stocky grey stone golem of the cave, cracked rock body with moss, glowing yellow eyes, big stone fists. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 17. Quái · Đá Con → `dacon.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Đá Con: small round grey rock creature with big cute eyes, stubby arms and legs, running. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 18. Quái · Quỷ Giáo → `linhan.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Quỷ Giáo: small grey-green goblin soldier with pointy ears, two small horns, tusks and red eyes, dark red leather vest, small leather cap, round wooden shield, long bronze spear, NO human face. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 19. Quái · Sói Cung Thủ → `cungan.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Sói Cung Thủ: grey wolf demon standing on hind legs, wolf head with yellow eyes and sharp fangs, bushy tail, brown-green leather vest, quiver of arrows on the back, drawing a wooden bow, NO human. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 20. Quái · Mực Tinh → `muc.png`
```
Create ONE image: a 576x192 enemy sprite row for a cute mobile tower-defense game based on Vietnamese folk legends, three equal 192x192 cells in one row.
CREATURE: Mực Tinh: pink squid spirit floating upright, big angry eyes, eight curly tentacles, small ink drops. Cute-but-mischievous chibi monster facing RIGHT.
CELLS (same creature, same size): [1] walk step A [2] walk step B (opposite legs) [3] attack.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 11. Boss gen lại (đủ dáng)

### 21. Boss · Quỷ Vương Ân → `anvuong.png`
```
Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: Quỷ Vương Ân: demon king with dark blue skin, big curved water-buffalo horns, fangs and glowing yellow eyes, black armor with gold trim, riding a black demon steed with a flaming red mane and glowing eyes, big halberd, war drum on the saddle, NO human face. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 22. Boss · Hà Bá → `haba.png`
```
Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: Hà Bá: giant old catfish spirit standing upright on a fish tail, long drooping whisker-beard, wrinkled dark green-blue skin, fish-scale robe, coral and seashell crown, trident, NO human. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 23. Boss · Thủy Tinh → `thuytinh.png`
```
Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: Thủy Tinh: water demon king with a blue sea-dragon head (horns, whiskers, fangs), silver-blue scaly body, fin crest on the back, silver-blue armor and fish-scale cape, crown of waves, trident, NO human face. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 24. Boss · Hổ Vương Triệu Đà → `trieuda.png`
```
Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: Hổ Vương Triệu Đà: tiger-headed demon general, orange tiger head with black-red flame stripes, long fangs and glowing eyes, clawed paws, dark red and black armor, tiger tail, big curved sword, NO human face. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 25. Boss · Đại Bàng Tinh → `daibang.png`
```
Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: Đại Bàng Tinh: giant golden-brown eagle demon of the cave, spread wings, sharp talons, fierce red eyes, flying. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 26. Boss · Hồ Tinh Chín Đuôi → `hotinh.png`
```
Create ONE image: a 512x512 boss sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 2x2 grid of four equal 256x256 cells.
BOSS: Hồ Tinh Chín Đuôi: white nine-tailed fox demon standing on hind legs, nine fluffy tails fanned out, sly red eyes, purple fox-fire flames. Big, menacing but still cute chibi boss facing RIGHT.
CELLS (same character, same size, left to right, top to bottom): [1] walk step A [2] walk step B (opposite legs) [3] attack swing [4] rage: body glowing red-orange, roaring.
STYLE: cute chibi mobile-game character, head about 1/3 of the body, big round dark-brown eyes with two white highlights, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds). Light file: about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 12. Nút giao diện thêm (trống đồng)

### 27. Nút · ui-tran-4 → `ui-tran-4.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game UI icons, one per cell, left to right:
[1] golden star with a plus sign (merge stars)  [2] tunic with an upward arrow (equip gear)  [3] bronze padlock (locked)  [4] two circular arrows (reroll / refresh).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 28. Nút · ui-tran-5 → `ui-tran-5.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game UI icons, one per cell, left to right:
[1] glowing bronze oil lamp (hint / tip)  [2] infinity loop made of bronze rope (endless mode)  [3] two crossed bronze swords (battle)  [4] green check mark on a bronze disc (done).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 29. Nút · ui-huy-chuong → `ui-huy-chuong.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game UI icons, one per cell, left to right:
[1] gold medal with a red ribbon  [2] silver medal with a blue ribbon  [3] bronze medal with a green ribbon  [4] small golden crown (top rank).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## 13. Icon đồ vật

### 30. Đồ thường · riu (4 độ hiếm) → `do-riu.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a short bronze battle axe (Rìu Đồng), COMMON: plain dull bronze and wood, no gems  [2] a short bronze battle axe (Rìu Đồng), RARE: polished bronze with blue trim and one small blue gem  [3] a short bronze battle axe (Rìu Đồng), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a short bronze battle axe (Rìu Đồng), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 31. Đồ thường · no (4 độ hiếm) → `do-no.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a bamboo crossbow (Nỏ Tre), COMMON: plain dull bronze and wood, no gems  [2] a bamboo crossbow (Nỏ Tre), RARE: polished bronze with blue trim and one small blue gem  [3] a bamboo crossbow (Nỏ Tre), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a bamboo crossbow (Nỏ Tre), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 32. Đồ thường · gay (4 độ hiếm) → `do-gay.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a shaman staff with a carved head (Gậy Thầy Mo), COMMON: plain dull bronze and wood, no gems  [2] a shaman staff with a carved head (Gậy Thầy Mo), RARE: polished bronze with blue trim and one small blue gem  [3] a shaman staff with a carved head (Gậy Thầy Mo), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a shaman staff with a carved head (Gậy Thầy Mo), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 33. Đồ thường · mu (4 độ hiếm) → `do-mu.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a feathered warrior headdress hat (Mũ Lông Chim), COMMON: plain dull bronze and wood, no gems  [2] a feathered warrior headdress hat (Mũ Lông Chim), RARE: polished bronze with blue trim and one small blue gem  [3] a feathered warrior headdress hat (Mũ Lông Chim), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a feathered warrior headdress hat (Mũ Lông Chim), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 34. Đồ thường · giap (4 độ hiếm) → `do-giap.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] a sleeveless warrior tunic / chest armor (Áo Giáp), COMMON: plain dull bronze and wood, no gems  [2] a sleeveless warrior tunic / chest armor (Áo Giáp), RARE: polished bronze with blue trim and one small blue gem  [3] a sleeveless warrior tunic / chest armor (Áo Giáp), EPIC: silver and purple trim, purple gem, faint purple glow  [4] a sleeveless warrior tunic / chest armor (Áo Giáp), LEGENDARY: ornate gold with a sun-star engraving, red gem, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 35. Đồ bộ · lac-long (5 món) → `bo-lac-long.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [2] crossbow of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [3] staff of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [4] helmet of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents  [5] chest armor of the Lạc Long Quân dragon set: jade-green dragon scales, sea-wave patterns, pearl accents.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 36. Đồ bộ · son-tinh (5 món) → `bo-son-tinh.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [2] crossbow of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [3] staff of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [4] helmet of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes  [5] chest armor of the Sơn Tinh mountain set: grey carved stone and earth-brown, small green moss, mountain-peak shapes.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 37. Đồ bộ · chim-lac (5 món) → `bo-chim-lac.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [2] crossbow of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [3] staff of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [4] helmet of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers  [5] chest armor of the Lac bird set: cream-white feathers on bronze, Lac bird head shapes, long tail feathers.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 38. Đồ bộ · trong-dong (5 món) → `bo-trong-dong.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [2] crossbow of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [3] staff of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [4] helmet of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands  [5] chest armor of the bronze drum set: shiny gold-bronze with drum-face sun-star rings and circle-dot bands.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 39. Đồ bộ · ngua-sat (5 món) → `bo-ngua-sat.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] axe of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [2] crossbow of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [3] staff of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [4] helmet of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks  [5] chest armor of the Thánh Gióng iron horse set: black iron with glowing red-orange fire manes and ember sparks.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 40. Phụ kiện 1 → `phu-kien-1.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] tiger claw on a cord  [2] brown leather glove  [3] woven belt with a bronze buckle  [4] pair of straw sandals.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 41. Phụ kiện 2 → `phu-kien-2.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] red cloth headband scarf  [2] indigo sage turban with a small bronze pin  [3] jade eye-shaped amulet  [4] glowing green life jade  [5] flat bronze drum face with sun-star.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 42. Phụ kiện 3 → `phu-kien-3.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] wooden drum mallet with a cloth grip  [2] rhino horn  [3] single long Lac bird feather  [4] shiny silver-blue fish scale  [5] handful of golden rice grains.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 43. Sính lễ của boss → `sinh-le.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] small cute elephant with nine tusks and a red saddle cloth, legendary treasure, small golden glow  [2] proud rooster with nine spurs and a red comb, legendary treasure, small golden glow  [3] small horse with a flowing nine-colored red mane, legendary treasure, small golden glow  [4] glowing red-gold revival pearl with a phoenix shape inside, legendary treasure, small golden glow.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 44. Đồ ghép 1 → `do-ghep-1.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] Dong Son bronze drum, full drum with frogs on top, rare magical crafted item, slightly glowing  [2] two crossed red-glowing battle axes, rare magical crafted item, slightly glowing  [3] staff with three rings of sky, earth and water, rare magical crafted item, slightly glowing  [4] staff topped with a spinning hourglass and stars, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 45. Đồ ghép 2 → `do-ghep-2.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] heavy bronze chest armor with a shield emblem, rare magical crafted item, slightly glowing  [2] dark scythe with a curved blade and purple glow, rare magical crafted item, slightly glowing  [3] sharp horn spearhead cracking a shield, rare magical crafted item, slightly glowing  [4] wide axe with a water-wave blade, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 46. Đồ ghép 3 → `do-ghep-3.png`
```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] bow with a bird eye on the grip, rare magical crafted item, slightly glowing  [2] bronze Lac bird talisman on a red string, rare magical crafted item, slightly glowing  [3] shirt covered in silver fish scales, rare magical crafted item, slightly glowing  [4] blue water-sealing jade with a calm wave inside, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### 47. Đồ ghép 4 → `do-ghep-4.png`
```
Create ONE image: a 640x128 row of 5 equal 128x128 square game item icons, one per cell, left to right:
[1] folded fishing net with floats, rare magical crafted item, slightly glowing  [2] radiant white sea pearl on a shell, rare magical crafted item, slightly glowing  [3] golden turtle claw crossbow trigger, rare magical crafted item, slightly glowing  [4] heavenly golden axe of Thạch Sanh with light rays, rare magical crafted item, slightly glowing  [5] white feather cloak of Âu Cơ with a golden clasp, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```
