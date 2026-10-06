# Prompt gen hình còn thiếu — Núi Cao Nước Dâng

Đã đối chiếu ảnh trong game (`assets/packs/`) với `docs/PROMPT_GEMINI.md`. Còn thiếu **10 quái, 9 boss** (đủ 20 tướng) — mỗi khối dưới đây dán một lần vào Gemini, gen ra một ảnh.

**Đã có (không cần gen):** antiem, caolo, cdt, giong, mau, adv, auco, casau, chimbao, doi, echme, giaolong, kimquy, lachau, lactuong, llq, lucsi, nongnoc, phuthuy, ran, rua, thachsanh, thachtinh, thansan, thansuong, thaymo, thosan, tom, xathu.

**Lưu ý khi gen:**
- Đính kèm ảnh `docs/mau-lac-tuong.png` mỗi lần để Gemini giữ cùng nét vẽ (prompt đã dặn chỉ học nét, không chép trang phục).
- Nền phải là **một màu hồng tím đậm `#FF00FF`** ở mọi ô (không phải ô caro, không hồng nhạt). Chữ nhãn "[1] IDLE…" hay vạch ngăn ô thì không sao, mình tự xoá.
- Tướng 6 ô (đứng · lấy đà · ra đòn · tung chiêu · chính diện · chân dung), quái 3 ô (bước A · bước B · tấn công), boss 4 ô (đứng · tấn công · chiêu · nổi giận).
- **Boss: mỗi boss một ảnh riêng, đúng 4 ô vuông bằng nhau 2×2** (đứng · tấn công · chiêu · nổi giận), không gộp nhiều boss vào một tấm, không vẽ thêm nhân vật khác vào ô.
- Khi gửi lại, ghi kèm tên nhân vật (hoặc đặt tên file theo mã trong ngoặc, ví dụ `caolo.png`) để mình nạp đúng chỗ.



# Quái còn thiếu (10)

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

## Cung Thủ Giặc (`cungan`)

```
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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


# Boss còn thiếu (9)

## Thuồng Luồng (`thuongluong`)

```
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
If an image is attached, use it ONLY as the drawing-style reference (line weight, eye style, shading); do NOT copy the character.
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
