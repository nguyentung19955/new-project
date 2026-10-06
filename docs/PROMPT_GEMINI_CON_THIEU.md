# Prompt gen hình còn thiếu — Núi Cao Nước Dâng

Đã đối chiếu ảnh trong game (`assets/packs/`) với `docs/PROMPT_GEMINI.md`. Còn thiếu **Lang Liêu, 3 quái** (đủ 9 boss) (đủ 20 tướng) — mỗi khối dưới đây dán một lần vào Gemini, gen ra một ảnh.

**Đã có (không cần gen):** cungan, kybinh, voichien, camap, muc, cua, cao, antiem, caolo, cdt, giong, mau, adv, auco, casau, chimbao, doi, echme, giaolong, kimquy, lachau, lactuong, llq, lucsi, nongnoc, phuthuy, ran, rua, thachsanh, thachtinh, thansan, thansuong, thaymo, thosan, tom, xathu.

**Lưu ý khi gen:**
- **Ảnh mẫu đính kèm mỗi lần gen** (prompt đã dặn chỉ học nét vẽ, không chép nhân vật):
  - Quái: đính kèm `mau-quai.png` (Tôm Binh 3 ô — đúng bố cục, nền, cỡ cần có).
  - Boss: đính kèm `mau-lac-tuong.png` (nét vẽ) và `mau-quai.png` (nền hồng tím phẳng).
- Gen **từng nhân vật một** (mỗi lần dán một khối), không gộp nhiều nhân vật vào một ảnh.
- Nền phải là **một màu hồng tím đậm `#FF00FF`** ở mọi ô (không phải ô caro, không hồng nhạt). Chữ nhãn "[1] IDLE…" hay vạch ngăn ô thì không sao, mình tự xoá.
- Tướng 6 ô (đứng · lấy đà · ra đòn · tung chiêu · chính diện · chân dung), quái 3 ô (bước A · bước B · tấn công), boss 4 ô (đứng · tấn công · chiêu · nổi giận).
- **Boss: mỗi boss một ảnh riêng, đúng 4 ô vuông bằng nhau 2×2** (đứng · tấn công · chiêu · nổi giận), không gộp nhiều boss vào một tấm, không vẽ thêm nhân vật khác vào ô.
- Khi gửi lại, ghi kèm tên nhân vật (hoặc đặt tên file theo mã trong ngoặc, ví dụ `caolo.png`) để mình nạp đúng chỗ.



# Tướng còn thiếu (1)

## Lang Liêu (Sử thi · `langlieu`)

```
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading, proportions); do NOT copy its costume, colors or weapon.
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

# Quái còn thiếu (3)

## Yêu Tinh Rừng (`yeutinh`)

```
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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

## Đá Con (`dacon`)

```
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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









