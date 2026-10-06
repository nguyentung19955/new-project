# Prompt gen hình (Gemini) cho Núi Cao Nước Dâng

Mỗi khối dưới đây là **một prompt tự đủ**: dán nguyên khối vào Gemini, gen **một lần** ra **một ảnh** chứa đủ các dáng của nhân vật đó.

- **Tướng:** ảnh 1020×680, 6 ô: đứng, lấy đà, ra đòn, tung chiêu, chính diện, chân dung.
- **Quái:** ảnh 768×256, 3 ô: bước A, bước B, tấn công.
- **Boss:** ảnh 768×768, 4 ô: đứng, tấn công, chiêu, nổi giận.

**Ảnh nhẹ:** prompt yêu cầu khung nhỏ, màu phẳng, ít màu (khoảng 20–30 màu), không chuyển màu, không nhiễu hạt, nên PNG thường chỉ còn vài trăm KB. Tải về đúng kích thước Gemini cho, không phóng to; nếu Gemini vẫn trả ảnh to hơn thì cũng không sao, công cụ cắt sẽ tự thu nhỏ và nén lại (ảnh trong game mỗi dáng chỉ khoảng 30–80 KB). Gửi mỗi tướng một ảnh, hoặc gom vài ảnh vào một zip. Không cần tự tách nền hay cắt ô: nền hồng tím `#FF00FF` để mình tự cắt và nạp vào game.

**Mẹo khi gen:**
- Nếu Gemini vẽ thiếu ô hoặc dính chữ, gõ thêm: *“Regenerate following the SHEET LAYOUT exactly: N cells, one pose per cell, no text.”*
- Gen xong một tướng, muốn tướng sau cùng nét vẽ thì đính kèm ảnh Lạc Tướng (hoặc ảnh vừa gen) và thêm câu: *“Use the attached image as the style reference.”*

# Tướng

## Lạc Tướng (Thường · `lactuong`)

*Đã có bộ ảnh trong game. Chỉ gen lại nếu muốn thêm ô tung chiêu hoặc đổi nét cho đồng bộ với các tướng sau.*

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Lạc Tướng - Young Lac Viet warrior general. Bronze breastplate and shoulder guards engraved with sun-star and meander patterns, dark-green cloth loincloth panel with a golden Lac bird, green arm wraps, barefoot. Green headband with a bronze triangle plate and a tall crown of brown-white feathers.
MAIN WEAPON: double-headed bronze battle axe on a wooden haft.
ELEMENT: METAL (white-gold, glow color #F2E6B0). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): an orange-gold slash shockwave.
RARITY FEEL: Thường (simple clothes, modest details).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Lực Sĩ Núi (Thường · `lucsi`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Lực Sĩ Núi - Huge muscular mountain strongman, very broad shoulders, bare tanned chest, brown short beard, simple brown loincloth with rope belt, stone bracers, barefoot.
MAIN WEAPON: a big grey boulder lifted over his head (idle: boulder resting on one shoulder; wind-up: boulder held high with both hands; strike: hurling the boulder forward).
ELEMENT: EARTH (ochre yellow-brown, glow color #D9A84E). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): cracking earth and flying rock chips.
RARITY FEEL: Thường (simple clothes, modest details).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Xạ Thủ Văn Lang (Thường · `xathu`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Xạ Thủ Văn Lang - Slim young archer of Van Lang, light-green tunic with bronze belt, white feathers on a green headband, quiver of arrows on the back, leather arm guard.
MAIN WEAPON: a curved wooden longbow (wind-up: bow fully drawn with an arrow; strike: arrow just released flying forward with a small trail).
ELEMENT: METAL (white-gold, glow color #F2E6B0). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): three glowing golden arrows.
RARITY FEEL: Thường (simple clothes, modest details).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thợ Săn Rừng (Thường · `thosan`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thợ Săn Rừng - Forest hunter, dark-green hooded cloak, brown leather vest, fur boots, a small wolf-tooth necklace, alert eyes.
MAIN WEAPON: a long wooden hunting spear with a stone tip.
ELEMENT: WOOD (leaf green, glow color #6FD06A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): green poison mist around the spear tip.
RARITY FEEL: Thường (simple clothes, modest details).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thầy Mo Lửa (Thường · `thaymo`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thầy Mo Lửa - Village fire shaman, long purple-and-indigo robe with orange zigzag hem, red-orange feather headdress, white face paint lines on the cheeks, bead necklace.
MAIN WEAPON: a gnarled wooden staff topped with a burning flame.
ELEMENT: FIRE (orange-red, glow color #FF7A3A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a swirling fireball between the hands.
RARITY FEEL: Thường (simple clothes, modest details).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thần Sương Núi (Thường · `thansuong`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thần Sương Núi - Mountain frost spirit, flowing white and pale-blue robe, long silver-white hair, small ice crystal crown, calm expression.
MAIN WEAPON: a long ice spear/staff with a pale-blue crystal tip.
ELEMENT: WATER (sky blue, glow color #5AB4D6). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): snowflakes and a ring of frost.
RARITY FEEL: Thường (simple clothes, modest details).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thạch Sanh (Sử thi · `thachsanh`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thạch Sanh - Kind young woodcutter hero, bare chest, simple brown cloth loincloth, rope belt, messy black hair tied back, strong arms.
MAIN WEAPON: a heavy woodcutter axe; a small golden bow is slung on his back.
ELEMENT: WOOD (leaf green, glow color #6FD06A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a green-gold magic arrow of light.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Lạc Hầu (Sử thi · `lachau`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Lạc Hầu - Noble Lac court lord, ochre and dark-red robe with bronze plates, gold forehead band with four tall white feathers, small bronze drum hanging at the hip, dignified.
MAIN WEAPON: a short bronze ceremonial mace (strike: mace hits the small drum, sending sound rings).
ELEMENT: EARTH (ochre yellow-brown, glow color #D9A84E). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): golden sound-wave rings from the drum.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thần Săn Ba Vì (Sử thi · `thansan`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thần Săn Ba Vì - Hunter god of Ba Vi mountain, tall deer antlers on the head, tiger-skin cloak over a green tunic, dark tan skin with stripe face paint. A friendly orange tiger cub stands at his feet in every full-body cell.
MAIN WEAPON: a long hunting spear with a jade tip.
ELEMENT: WOOD (leaf green, glow color #6FD06A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a spectral tiger head roaring.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Cao Lỗ (Sử thi · `caolo`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Cao Lỗ - Master crossbow engineer, brown leather apron over a dark tunic, bronze goggles pushed up on the forehead, tool belt, short beard.
MAIN WEAPON: a large wooden-and-bronze crossbow (wind-up: cranking/aiming; strike: bolt fired with a small trail).
ELEMENT: METAL (white-gold, glow color #F2E6B0). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a volley of glowing bronze bolts.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Mai An Tiêm (Sử thi · `antiem`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Mai An Tiêm - Cheerful island farmer, straw conical hat (nón lá), light-brown farmer clothes rolled at the sleeves, red scarf around the neck.
MAIN WEAPON: a big round green-striped watermelon held in both arms (strike: throwing a watermelon); a small sickle at the belt.
ELEMENT: WOOD (leaf green, glow color #6FD06A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): watermelon seeds and coins sparkling.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Tiên Dung (Sử thi · `tiendung`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Tiên Dung - Graceful princess, long red ao tu than dress with gold trim, black hair in a high bun with a gold hairpin and red flower, pink silk ribbon floating behind the shoulders.
MAIN WEAPON: a golden folding fan (strike: fan swept open sending a gust).
ELEMENT: FIRE (orange-red, glow color #FF7A3A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a gust of pink-orange petals.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Lang Liêu (Sử thi · `langlieu`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Lang Liêu - Gentle humble prince, simple ochre-yellow tunic with brown sash, small gold headband, kind smile.
MAIN WEAPON: a square green banh chung rice cake wrapped in leaves and tied with bamboo string (strike: tossing the cake which bursts into light).
ELEMENT: EARTH (ochre yellow-brown, glow color #D9A84E). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): golden rice grains swirling.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Chử Đồng Tử (Sử thi · `cdt`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Chử Đồng Tử - Poor young fisherman turned immortal, plain blue-grey tunic patched at the knees, barefoot, wet hair, honest face.
MAIN WEAPON: a magic wooden staff with a blue glowing tip; a conical hat (nón) hangs on his back.
ELEMENT: WATER (sky blue, glow color #5AB4D6). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): water swirling up from the staff.
RARITY FEEL: Sử thi (richer costume, more gold trim).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thánh Gióng (Huyền thoại · `giong`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thánh Gióng - Legendary giant-boy hero, iron armor and iron helmet, red cape, RIDING a black IRON HORSE with rivets, a mane and tail made of flames and fiery eyes. Keep the horse in every full-body cell (cells 1-5) and keep the whole horse inside the cell; the rider sits on the saddle.
MAIN WEAPON: a long green bamboo pole (uprooted, with roots at one end) used as a staff.
ELEMENT: FIRE (orange-red, glow color #FF7A3A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): the iron horse breathing a burst of fire.
RARITY FEEL: Huyền thoại (majestic, most ornate costume, subtle golden aura lines).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Lạc Long Quân (Huyền thoại · `llq`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Lạc Long Quân - Dragon lord of the sea, teal-blue dragon-scale armor, golden dragon-head crown with small horns, long flowing dark hair, sea-green cape with wave pattern.
MAIN WEAPON: a straight bronze sword with a dragon guard.
ELEMENT: WATER (sky blue, glow color #5AB4D6). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a small blue water dragon spiraling.
RARITY FEEL: Huyền thoại (majestic, most ornate costume, subtle golden aura lines).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Thần Kim Quy (Huyền thoại · `kimquy`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Thần Kim Quy - Golden turtle deity in human form: wise old sage with a long white beard, teal robe, a large shiny golden turtle shell worn on the back like a backpack shield.
MAIN WEAPON: a glowing white-blue pearl held in the front hand, and a short gnarled staff in the other.
ELEMENT: METAL (white-gold, glow color #F2E6B0). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a golden hexagon shield of light.
RARITY FEEL: Huyền thoại (majestic, most ornate costume, subtle golden aura lines).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## An Dương Vương (Huyền thoại · `adv`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: An Dương Vương - King of Au Lac, deep-red royal robe with gold dragon trim, gold crown with points and a red gem, confident expression.
MAIN WEAPON: the legendary magic crossbow, golden with a turtle-claw trigger (strike: bolt of white-gold light fired).
ELEMENT: METAL (white-gold, glow color #F2E6B0). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): a fan of three piercing light bolts.
RARITY FEEL: Huyền thoại (majestic, most ornate costume, subtle golden aura lines).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Âu Cơ (Huyền thoại · `auco`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Âu Cơ - Mother fairy of the Vietnamese, long white dress with soft pink trim, long straight black hair with a crown of pink flowers, large white feathered wings on the back.
MAIN WEAPON: a long green lotus stem topped with a pink lotus flower.
ELEMENT: EARTH (ochre yellow-brown, glow color #D9A84E). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): rising earth pillars with pink petals.
RARITY FEEL: Huyền thoại (majestic, most ornate costume, subtle golden aura lines).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

## Mẫu Thượng Ngàn (Huyền thoại · `mau`)

```
Create a character sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CHARACTER: Mẫu Thượng Ngàn - Mother Goddess of the forests, forest-green ao tu than dress with gold trim, black hair in a bun under a RED khan van headwrap crowned with a ring of green leaves, white and pink wild flowers. A friendly orange tiger lies at her feet in every full-body cell. NO wings.
MAIN WEAPON: a leafy tree branch with small red fruits.
ELEMENT: WOOD (leaf green, glow color #6FD06A). Use this element color for the cast glow and for small accent details.
CAST SKILL EFFECT (cell 4): vines and leaves swirling.
RARITY FEEL: Huyền thoại (majestic, most ornate costume, subtle golden aura lines).
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 1020x680 px, an invisible 3x2 grid of six equal 340x340 cells. Exactly ONE pose per cell, the same character in every cell, same size and same proportions in cells 1-5. Leave at least 16 px of empty margin inside every cell; nothing may cross into another cell. Feet of cells 1-5 sit on the same baseline about 20 px above the bottom of the cell.
Row 1: [1] IDLE - side view facing RIGHT (3/4 toward the viewer), standing relaxed, holding the main weapon ready in the front hand (weapon fully visible, not cut off). [2] WIND-UP - same side view facing right, body pulled back, weapon raised behind the head ready to strike. [3] STRIKE - same side view facing right, lunging forward, weapon swung through to the front, with ONE short curved motion-trail swoosh in a pale tint of the main color.
Row 2: [4] CAST SKILL - side view facing right, both arms raised, a compact magic glow of the element color around the hands (glow stays small, inside the cell). [5] FRONT - full body facing the viewer, standing, holding the weapon. [6] PORTRAIT - head and shoulders only, facing the viewer slightly turned right, big and centered, filling about 80% of the cell.
BACKGROUND: perfectly flat pure magenta #FF00FF in every cell and between cells. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Do not use magenta or pink-purple anywhere on the character (use other shades instead) so the background can be cut out cleanly.
```

# Quái

## Tôm Binh (`tom`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Tôm Binh - Shrimp soldier of the Water God: small orange shrimp walking upright on little legs, bronze helmet, tiny shield.
ATTACK (cell 3): pokes forward with a small trident.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Cá Sấu (`casau`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Cá Sấu - Green crocodile running low on four legs, armored back plates, yellow eyes.
ATTACK (cell 3): snapping its jaws wide open.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Rùa Giáp (`rua`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Rùa Giáp - Big slow armored turtle with a thick dark-green spiked shell and bronze plates bolted on.
ATTACK (cell 3): headbutts forward, shell glints.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Phù Thủy Nước (`phuthuy`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Phù Thủy Nước - Water witch: small hunched figure in a teal hooded robe made of seaweed, glowing cyan eyes, coral staff.
ATTACK (cell 3): casts a water orb from the coral staff.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Chim Bão (flying) (`chimbao`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Chim Bão (flying) - Storm bird: grey-blue bird with lightning-shaped tail feathers, wide wings.
ATTACK (cell 3): dives with crackling lightning.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Ếch Mẹ (`echme`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Ếch Mẹ - Big fat mother frog, green with yellow belly, warts, a few tadpoles clinging to her back.
ATTACK (cell 3): long sticky tongue lash.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Nòng Nọc (`nongnoc`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Nòng Nọc - Tiny dark tadpole swimming upright on its tail, big eyes.
ATTACK (cell 3): quick dash bite.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Giao Long Con (`giaolong`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Giao Long Con - Small young water dragon, serpentine green body, little horns and fins.
ATTACK (cell 3): spits a water jet.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Yêu Tinh Rừng (`yeutinh`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Yêu Tinh Rừng - Small green forest goblin with pointy ears, yellow eyes, leaf loincloth, wooden club.
ATTACK (cell 3): swings the club.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Rắn Độc (`ran`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Rắn Độc - Venomous green snake slithering, darker stripes, red forked tongue.
ATTACK (cell 3): lunging bite with venom drops.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Dơi Hang (flying) (`doi`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Dơi Hang (flying) - Purple cave bat, big leathery wings, red eyes, small fangs.
ATTACK (cell 3): screeching dive.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Thạch Tinh (`thachtinh`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Thạch Tinh - Rock golem made of grey cracked stone blocks, glowing orange eyes, moss patches, short stubby legs.
ATTACK (cell 3): ground slam with both fists.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Đá Con (`dacon`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Đá Con - Tiny grey rock creature, one stone chunk with small legs and orange eyes.
ATTACK (cell 3): rolls forward.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Lính Giáo (`linhan`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Lính Giáo - Enemy foot soldier, dark-red tunic, bronze helmet, round wooden shield, long spear.
ATTACK (cell 3): spear thrust.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Cung Thủ Giặc (`cungan`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Cung Thủ Giặc - Enemy archer, olive-green tunic, leather cap, bow and quiver.
ATTACK (cell 3): shoots an arrow.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Kỵ Binh (`kybinh`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Kỵ Binh - Enemy cavalry: soldier with helmet and spear riding a brown war horse with red saddle cloth.
ATTACK (cell 3): charging spear thrust while the horse gallops.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Voi Chiến (`voichien`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Voi Chiến - Grey war elephant wearing a red-and-gold saddle tower (howdah) with a tiny soldier inside, bronze tusk caps.
ATTACK (cell 3): stomps the ground raising dust.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Cá Mập Yêu (`camap`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Cá Mập Yêu - Demon shark, blue-grey, angry eyes, rows of sharp teeth, swimming on the surface.
ATTACK (cell 3): big bite lunge.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Mực Tinh (`muc`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Mực Tinh - Pink-purple squid demon floating upright, big eyes, curling tentacles (use pink-red, not magenta).
ATTACK (cell 3): sprays black ink.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Cua Khổng Lồ (`cua`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Cua Khổng Lồ - Giant red-orange crab with a very thick shell and huge claws.
ATTACK (cell 3): claw pinch.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

## Cáo Con (`cao`)

```
Create an enemy sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
CREATURE: Cáo Con - Small orange fox spirit with a white-tipped tail.
ATTACK (cell 3): pounce bite.
Cute-but-mischievous chibi monster: big head, round expressive eyes, not scary-realistic.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL landscape image 768x256 px, an invisible row of three equal 256x256 cells. Exactly ONE pose per cell, the same creature, same size in every cell. Leave at least 12 px of empty margin inside every cell. Feet (or belly for crawling creatures) on the same baseline about 16 px above the bottom; flying creatures float in the middle of the cell.
[1] MOVE A - side view facing RIGHT, walking/swimming/flying, first step. [2] MOVE B - same view, the alternate step (legs/wings/tail in the opposite position) so A and B loop as a 2-frame walk cycle. [3] ATTACK - same view facing right, attacking (bite, swing, shoot or slam as described), one short motion-trail swoosh allowed.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the creature.
```

# Boss

## Thuồng Luồng (`thuongluong`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Thuồng Luồng - Huge green water serpent-dragon rising from water, scales, fins, long whiskers.
ATTACK (cell 2): tail slam that stuns.
SKILL (cell 3): summons a wave carrying shrimp soldiers.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Hà Bá (`haba`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Hà Bá - River lord: big fat blue-skinned old man with a long beard made of seaweed, crown of shells, robe of water, holding a trident.
ATTACK (cell 2): trident thrust.
SKILL (cell 3): dives into a whirlpool and rises again.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Thủy Tinh (`thuytinh`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Thủy Tinh - The Water God: tall warrior in blue-and-silver wave armor, flowing blue hair, crown shaped like breaking waves, holding a storm trident.
ATTACK (cell 2): trident strike with lightning.
SKILL (cell 3): summons a rain storm and rising flood water.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Chằn Tinh (`chantinh`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Chằn Tinh - Giant green ogre with horns, tusks, brown loincloth, carrying a huge stone hammer.
ATTACK (cell 2): smashes the stone hammer down.
SKILL (cell 3): roars, sending a shock ring that silences heroes.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Đại Bàng Tinh (flying) (`daibang`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Đại Bàng Tinh (flying) - Giant brown eagle demon with golden beak, sharp talons, huge wings.
ATTACK (cell 2): swoops down grabbing with talons.
SKILL (cell 3): flaps wings creating a whirlwind of feathers and bats.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Tướng Giặc Ân (`anvuong`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Tướng Giặc Ân - Enemy general in black armor riding a black war horse, war drum on the saddle, plumed helmet.
ATTACK (cell 2): charging horse dash.
SKILL (cell 3): beats the war drum sending golden sound rings.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Ngư Tinh (`ngutinh`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Ngư Tinh - Gigantic demon fish, blue-teal scales, huge mouth full of teeth, spiky fins, leaping out of the waves.
ATTACK (cell 2): swallowing bite.
SKILL (cell 3): dives and resurfaces with a big splash.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Hồ Tinh Chín Đuôi (`hotinh`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Hồ Tinh Chín Đuôi - White nine-tailed fox spirit, nine fluffy tails fanned out, glowing violet eyes, small ghost flames floating around (violet-blue, not magenta).
ATTACK (cell 2): claw slash with ghost fire.
SKILL (cell 3): splits into illusion copies with ghost fire.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```

## Triệu Đà (`trieuda`)

```
Create a BOSS sprite sheet for a mobile tower-defense game based on Vietnamese folk legends.
BOSS: Triệu Đà - Enemy king of Nam Viet, dark-blue armor with gold trim, long black beard, imperial hat, holding a long halberd.
ATTACK (cell 2): halberd sweep.
SKILL (cell 3): raises a war banner, soldiers rush in.
Chibi proportions but big, heavy and intimidating; still clean and readable at small size.
STYLE (match exactly): cute chibi mobile-game character, head about 1/3 of total height, big round dark-brown eyes with two white highlights, small smile, pink blush cheeks. Thick clean dark-brown outline (#2A1608) around every shape, flat cel shading with one soft shadow tone and one highlight, warm saturated colors. Costume details inspired by ancient Vietnamese Dong Son bronze drums: meander/zigzag bands, sun-star motif, Lac bird motif, bronze and woven-cloth textures. Clean vector-like illustration, crisp edges, no painterly texture, no blur.
LIGHT FILE: keep the image small and simple so the PNG file stays light (under about 500 KB): flat solid color fills with a limited palette of about 20-30 colors, at most one flat shadow tone per color, no gradients, no airbrush or soft shading, no noise, grain, paper texture or tiny repeated detail, no glow halos or bloom (except the small effect asked for), no sparkles scattered in the background. Bold simple shapes that read clearly at small size.
SHEET LAYOUT: one SMALL square image 768x768 px, an invisible 2x2 grid of four equal 384x384 cells. Exactly ONE pose per cell, the same boss, same size in every cell, the boss filling most of the cell but keeping at least 16 px empty margin; nothing may cross into another cell. Feet on the same baseline about 18 px above the bottom (flying bosses float centered).
[1] IDLE - side view facing RIGHT, menacing stance. [2] ATTACK - side view facing right, main attack as described, one short motion-trail swoosh allowed. [3] SKILL - side view facing right, using the special skill described, compact effect that stays inside the cell. [4] ENRAGED - same as idle but furious: red glowing eyes, steam/anger marks, body slightly darker and tinted red.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No gradient, no floor, no cast shadow, no grid lines, no borders, no text, no labels, no watermark. Do not use magenta on the boss.
```
