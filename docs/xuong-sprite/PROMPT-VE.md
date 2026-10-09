# Prompt vẽ cho Xưởng Sprite: quái, em bé, vũ khí, trang phục, đồ và tài nguyên, người làng

**Cách dùng (3 bước):**

1. **Chép MỘT dòng trong khung xám** của hình cần vẽ, dán vào công cụ vẽ AI (ChatGPT, Gemini...). Dòng đã đủ mọi thứ, không phải thêm sửa gì.
2. **Muốn hình khớp game hơn:** gửi kèm ảnh tham chiếu ghi bên dưới dòng đó (hình đang có trong game, phóng to) và nói thêm câu tiếng Anh ghi ở đó.
3. **Đưa hình vào Xưởng Sprite** (spiritblade.web.app/xuong-sprite.html), chọn đúng thẻ và **chọn khung** ghi bên dưới, rồi tải tệp `.sprite.json` về gửi Claude.

Mỗi dòng đã ghi sẵn những gì đo được từ hình trong game (xem [DAC-DIEM-HINH-GAME.md](DAC-DIEM-HINH-GAME.md)): góc nhìn và hướng quay giống game, tỉ lệ rộng cao, cỡ thật (bao nhiêu điểm ảnh), màu chính kèm mã màu, số màu tối đa, viền tối dày một điểm ảnh, dáng tách tay chân đuôi cánh hợp với khung của Xưởng, nền trắng trơn, một hình duy nhất. Quái vẫn **hung dữ** (tinh anh và trùm đáng sợ hơn), em bé vẫn dễ thương, và nét phá cách dân gian Việt (câu `Twist:`) vẫn giữ nguyên.

Nếu hình ra chưa ưng, nhắn lại cho công cụ vẽ: `again, simpler bigger shapes, same angle, keep the arms and legs separated from the body`. Muốn dữ hơn: `make it scarier and more aggressive`.

---

## Em bé (khung: Người)

### Thợ Rèn
Áo trùm đỏ có tai, búa đeo hông. Nét lạ: mặt nạ giấy Trung thu to lệch trên mũ, bím tóc là sợi xích có chuông đồng to, găng da quá khổ.

```
A small child blacksmith in a red hooded cloak with two pointed ear tips, round pale face, small hammer on the belt. Twist: a big paper Mid-Autumn festival mask pushed sideways on the hood, a braid made of a chain ending in a big bronze bell, oversized leather gloves. 3/4 view turned to the RIGHT (the body faces right, the face looks a little toward the viewer), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, empty hands with no weapon (the game adds the weapon). Chibi proportions like the game sprite: the head with its hood is about half of the total height, a small body and short legs, the whole figure is about 1.6 times taller than wide. It will be shown in the game at only 31 pixels tall (19 x 31 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, off-white #f6f0e2, dark red #8c1c1f, light red #f47a62; the face is a round pale mask-like face (#f6f0e2) with simple calm closed eyes. Cute chibi child hero inspired by Vietnamese folklore. Pixel-art game sprite: one clean dark plum outline (#1b1118) all around the shape, about 1/31 of the height thick (exactly one game pixel), flat solid colors, at most 15 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 19 × 31 điểm ảnh · Ảnh tham chiếu: [tham-chieu/em-be-smith.png](tham-chieu/em-be-smith.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Thợ Săn
Áo trùm xanh lá, ống tên sau lưng. Nét lạ: mặt nạ Trung thu, ống tên bằng ống tre mọc lá non, chim sẻ đậu trên mũ.

```
A small child hunter in a forest-green hooded cloak with two pointed ear tips, round face, quiver on the back. Twist: a big paper Mid-Autumn mask on the side of the hood, the quiver is a bamboo tube with fresh leaves sprouting, a sparrow perched on the hood. 3/4 view turned to the RIGHT (the body faces right, the face looks a little toward the viewer), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, empty hands with no weapon (the game adds the weapon). Chibi proportions like the game sprite: the head with its hood is about half of the total height, a small body and short legs, the whole figure is about 1.5 times taller than wide. It will be shown in the game at only 33 pixels tall (22 x 33 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #479544, dark green #255a2c, off-white #f6f0e2, green #8fd070; the face is a round pale mask-like face (#f6f0e2) with simple calm closed eyes. Cute chibi child hero inspired by Vietnamese folklore. Pixel-art game sprite: one clean dark plum outline (#1b1118) all around the shape, about 1/33 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 22 × 33 điểm ảnh · Ảnh tham chiếu: [tham-chieu/em-be-hunter.png](tham-chieu/em-be-hunter.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Thầy Lang
Áo trùm xanh lam, túi thuốc. Nét lạ: mặt nạ Trung thu, nồi đất sắc thuốc đeo lưng bốc khói xanh, vòng cổ củ gừng.

```
A small child healer in a blue hooded cloak with two pointed ear tips, round kind face, herb pouch at the waist. Twist: a big paper Mid-Autumn mask on the side of the hood, a clay medicine pot strapped to the back puffing green smoke, a necklace of ginger roots. 3/4 view turned to the RIGHT (the body faces right, the face looks a little toward the viewer), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, empty hands with no weapon (the game adds the weapon). Chibi proportions like the game sprite: the head with its hood is about half of the total height, a small body and short legs, the whole figure is about 1.3 times taller than wide. It will be shown in the game at only 32 pixels tall (24 x 32 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark blue #27407f, blue #4468c0, off-white #f6f0e2, light blue #86a8f0; the face is a round pale mask-like face (#f6f0e2) with simple calm closed eyes. Cute chibi child hero inspired by Vietnamese folklore. Pixel-art game sprite: one clean dark plum outline (#1b1118) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 24 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/em-be-healer.png](tham-chieu/em-be-healer.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Đô Vật
Áo trùm cam, người to chắc, đai vải. Nét lạ: mặt nạ Trung thu, khăn đỏ đô vật làng, hình trống đồng sáng trên bụng.

```
A small stocky child wrestler in an orange hooded cloak with two pointed ear tips, determined face, thick cloth belt, wide stance. Twist: a big paper Mid-Autumn mask on the side of the hood, a red village-wrestling headband, a glowing bronze-drum sun mark on the belly. 3/4 view turned to the RIGHT (the body faces right, the face looks a little toward the viewer), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, empty hands with no weapon (the game adds the weapon). Chibi proportions like the game sprite: the head with its hood is about half of the total height, a small body and short legs, the whole figure is about 1.4 times taller than wide. It will be shown in the game at only 29 pixels tall (20 x 29 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #9a4a16, orange #dd7c2a, off-white #f6f0e2, dark red #8c1c1f; the face is a round pale mask-like face (#f6f0e2) with simple calm closed eyes. Cute chibi child hero inspired by Vietnamese folklore. Pixel-art game sprite: one clean dark plum outline (#1b1118) all around the shape, about 1/29 of the height thick (exactly one game pixel), flat solid colors, at most 15 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 20 × 29 điểm ảnh · Ảnh tham chiếu: [tham-chieu/em-be-wrestler.png](tham-chieu/em-be-wrestler.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

---

## Rừng già (hệ Độc: xanh lá, tím)

### Heo Rừng Con · khung: Bốn chân
Lợn rừng nhỏ lông nâu. Nét lạ: lưng là mái tranh có ống khói, đuôi xoắn lò xo.

```
A small wild boar piglet, brown fur, short tusks, stubby legs. Twist: its back is a little thatched roof with a smoking chimney, its tail is a curly spring. Side view facing RIGHT, body horizontal, head at the right end, tail sticking out from the upper left of the body, four legs going straight down under the body (front pair under the head end, back pair under the tail end, a clear white gap between the front and back legs), all four feet on the same bottom line, legs about one third of the height, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.6 times wider than tall. It will be shown in the game at only 32 pixels tall (52 x 32 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #80542c, dark brown #4e3018, tan #c89460, dark green #22692c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 52 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/heoCon.png](tham-chieu/heoCon.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Bầy Ong Vò Vẽ · khung: Cá/chim bay
Ba con ong vàng đen bay sát nhau. Nét lạ: đội nón lá tí hon, ngòi là kim khâu.

```
Three angry yellow-and-black hornets flying close together as one swarm. Twist: each wears a conical leaf hat, their stingers are sewing needles with red thread. Side view facing RIGHT, three bodies close together in a loose triangle, each head pointing right, each pair of wings raised up above its back with a white gap, stingers pointing left, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 39 pixels tall (43 x 39 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-green #7aa8a4, white #d8f4ec, orange #c45a1a, golden #a8901a. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/39 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cá, chim bay** · Cỡ trong game: 43 × 39 điểm ảnh · Ảnh tham chiếu: [tham-chieu/ongVo.png](tham-chieu/ongVo.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Bọ Hung Mai Cứng · khung: Cua/bọ
Bọ hung chậm chạp. Nét lạ: mai là cái mõ gỗ, sừng là cán cuốc.

```
A stout rhinoceros beetle with six short legs. Twist: its shell is a big wooden temple bell (mo), its horn is an old hoe handle. Side view facing RIGHT, low wide body, the big horn raised up at the front right, the rounded shell rising at the back left, six short legs splayed down to the lower left and lower right with white gaps, all feet on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.6 times wider than tall. It will be shown in the game at only 34 pixels tall (54 x 34 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #3a9a5c, golden #b08a3a, brown #6a4a1e, dark teal #1a5a40. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/34 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cua, bọ (nhiều chân)** · Cỡ trong game: 54 × 34 điểm ảnh · Ảnh tham chiếu: [tham-chieu/boHung.png](tham-chieu/boHung.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Hoa Phun Bào Tử · khung: Cây/đứng yên
Hoa ăn thịt miệng tím. Nét lạ: mọc trong chum sành vỡ, cánh hoa có mắt.

```
A carnivorous flower with a wide toothy purple mouth and leaf arms, puffing spores. Twist: it grows out of a cracked clay jar, each petal has one eye. Side view facing RIGHT, rooted in place: a bunch of big leaves at the bottom as the base, a thick stem rising in the middle, the huge open toothy mouth-head at the top pointing to the right, two leaf arms sticking out left and right with white gaps, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.4 times wider than tall. It will be shown in the game at only 37 pixels tall (53 x 37 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): yellow-green #78b818, dark green #22692c, dark green #123a1c, dark indigo #58208c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/37 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cây, đứng yên** · Cỡ trong game: 53 × 37 điểm ảnh · Ảnh tham chiếu: [tham-chieu/hoaBaoTu.png](tham-chieu/hoaBaoTu.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Chồn Bóng · khung: Bốn chân
Chồn bóng đen tím. Nét lạ: chỉ đôi mắt và đôi guốc gỗ là thật.

```
A sleek weasel made of living black-violet shadow, long body, long tail, sneaky crouch. Twist: only its glowing eyes and a pair of wooden clogs on its front paws are solid. Side view facing RIGHT, long low body stretched horizontally, head at the right end, long tail streaming out to the left, four short legs reaching down with white gaps between the front and back legs, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 2.2 times wider than tall. It will be shown in the game at only 28 pixels tall (63 x 28 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark indigo #40305e, purple #9a48d4, indigo #9a88c8, light grey-purple #b8a8d8. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/28 of the height thick (exactly one game pixel), flat solid colors, at most 18 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 63 × 28 điểm ảnh · Ảnh tham chiếu: [tham-chieu/chonBong.png](tham-chieu/chonBong.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Nấm Phồng · khung: Khối mềm
Nấm nhỏ bụng phồng sắp nổ. Nét lạ: mũ nấm là nón quai thao, bụng như bánh trôi.

```
A small round mushroom creature with a swollen body and tiny feet, nervous face, about to burst. Twist: its cap is a flat quai thao festival hat with purple spots, its belly looks like a sticky rice ball. Front view facing the viewer (turned only slightly to the right), round soft body sitting on the bottom, the top part (cap, head or flame) on top, two short stubby arms, fins or tentacles sticking out low to the left and to the right with a white gap from the body, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 29 pixels tall (32 x 29 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): purple #9a48d4, tan #b0a488, dark indigo #58208c, dark yellow-green #3c5a0c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/29 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 32 × 29 điểm ảnh · Ảnh tham chiếu: [tham-chieu/namPhong.png](tham-chieu/namPhong.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Sóc Ném Quả Nổ · khung: Bốn chân
Sóc cam đuôi xù. Nét lạ: ôm quả bưởi cắm ngòi pháo, đuôi cài hoa đào.

```
An orange squirrel with a huge fluffy tail and a mischievous grin. Twist: it holds a pomelo with a red firecracker fuse stuck in it, peach blossoms in its tail. 3/4 view turned to the RIGHT, crouching on its hind legs, head at the upper right, the huge fluffy tail curling up behind at the left with a white gap from the back, front paws holding the bomb in front at the right, feet on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.3 times wider than tall. It will be shown in the game at only 38 pixels tall (49 x 38 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #d0682a, brown #8a3a14, tan #f0d8a8, indigo #7a38b0. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/38 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 49 × 38 điểm ảnh · Ảnh tham chiếu: [tham-chieu/socNo.png](tham-chieu/socNo.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Nhím Gai Độc · khung: Bốn chân
Nhím nâu gai dựng. Nét lạ: gai là que hương cháy khói tím.

```
A hedgehog with a dark brown body and small snout, quills raised. Twist: its quills are burning incense sticks with purple smoke. Side view facing RIGHT, body horizontal, head at the right end, tail sticking out from the upper left of the body, four legs going straight down under the body (front pair under the head end, back pair under the tail end, a clear white gap between the front and back legs), all four feet on the same bottom line, legs about one third of the height, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.5 times wider than tall. It will be shown in the game at only 29 pixels tall (44 x 29 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): near-black #1c1210, brown #6a4c38, dark brown #3e2a20, purple #9a48d4. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/29 of the height thick (exactly one game pixel), flat solid colors, at most 19 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 44 × 29 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nhimDoc.png](tham-chieu/nhimDoc.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Heo Rừng Nanh Dài (tinh anh) · khung: Bốn chân
Lợn rừng to, sẹo, mắt đỏ. Nét lạ: nanh là hai lưỡi liềm, lưng mọc bụi tre.

```
A big elite wild boar, dark bristly fur, scarred face, red eyes, heavy body. Twist: its tusks are two curved iron sickles, a small bamboo grove grows on its back. Side view facing RIGHT, body horizontal, head at the right end, tail sticking out from the upper left of the body, four legs going straight down under the body (front pair under the head end, back pair under the tail end, a clear white gap between the front and back legs), all four feet on the same bottom line, legs about one third of the height, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 2 times wider than tall. It will be shown in the game at only 46 pixels tall (90 x 46 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark brown #644022, off-white #fff8e0, tan #b0a488. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Elite version: bigger, scarred, more armor and spikes than normal monsters. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/46 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 90 × 46 điểm ảnh · Ảnh tham chiếu: [tham-chieu/heoNanh.png](tham-chieu/heoNanh.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Nấm Phồng Chúa (tinh anh) · khung: Khối mềm
Nấm vua to, mặt cau có. Nét lạ: mũ cánh chuồn quan lại, cầm quạt giấy.

```
A large king mushroom creature with a thick stem body and angry face, spores floating. Twist: it wears a mandarin official hat with wing flaps and holds a paper fan. Front view facing the viewer (turned only slightly to the right), round soft body sitting on the bottom, the top part (cap, head or flame) on top, two short stubby arms, fins or tentacles sticking out low to the left and to the right with a white gap from the body, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.8 times wider than tall. It will be shown in the game at only 45 pixels tall (83 x 45 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): indigo #a048e0, tan #b0a488, indigo #5c1c98, light grey-red #f4ffb0. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Elite version: bigger, scarred, more armor and spikes than normal monsters. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/45 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 83 × 45 điểm ảnh · Ảnh tham chiếu: [tham-chieu/namPhongChua.png](tham-chieu/namPhongChua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Nấm Chúa (trùm nhỏ) · khung: Khối mềm
Nấm cổ thụ khổng lồ. Nét lạ: mũ là mái đình cong, chân là chân ghế gỗ.

```
A giant ancient mushroom lord with a purple and green cap and glowing spots, menacing face. Twist: its cap is a curved village communal-house roof, its legs are carved wooden stool legs. Front view facing the viewer (turned only slightly to the right), a huge wide cap on top, a thick stem body with the angry face below it, two short root-legs splayed out to the lower left and lower right with white gaps, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.5 times wider than tall. It will be shown in the game at only 63 pixels tall (97 x 63 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): purple #9a48d4, dark brown #5c3a1e, dark indigo #58208c, brown #9a8a78. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it). Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/63 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 97 × 63 điểm ảnh · Ảnh tham chiếu: [tham-chieu/namChua.png](tham-chieu/namChua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Mộc Tinh (trùm vùng) · khung: Cây/đứng yên
Thần cây khổng lồ mặt giận. Nét lạ: cành treo chuông gió và lồng đèn, giữa ngực là trống đồng.

```
A giant tree spirit with an angry face on its trunk, glowing green eyes, branch arms, root legs, yellow paper talismans. Twist: wind chimes and lanterns hang from its branches, a bronze drum is set in its chest like a heart. Front view facing the viewer (turned only slightly to the right), rooted in place: wide roots or base at the bottom, an upright trunk or stem in the middle, two branch arms reaching out to the left and right and a little up with white gaps between them, the big head or crown on top, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 131 pixels tall (140 x 131 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #46a83c, dark brown #5c3a1e, dark green #22692c, dark green #123a1c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it). Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/131 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cây, đứng yên** · Cỡ trong game: 140 × 131 điểm ảnh · Ảnh tham chiếu: [tham-chieu/mocTinh.png](tham-chieu/mocTinh.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

---

## Hang biển (hệ Băng: xanh biển, trắng)

### Cua Lính · khung: Cua/bọ
Cua xanh hai càng to. Nét lạ: đội gáo dừa, càng kẹp thìa canh.

```
A blue soldier crab with two big raised claws and eye stalks. Twist: half a coconut shell as a helmet, one claw holds a soup ladle. Front view facing the viewer (turned only slightly to the right), wide low body in the middle, the two big claws or horns raised up and out toward the upper left and upper right with white gaps from the body, short legs splayed outward to the lower left and lower right, all feet on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.3 times wider than tall. It will be shown in the game at only 36 pixels tall (47 x 36 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #ee5c3a, blue #3883d4, blue #1b4c92, red #b32a2c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/36 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cua, bọ (nhiều chân)** · Cỡ trong game: 47 × 36 điểm ảnh · Ảnh tham chiếu: [tham-chieu/cua.png](tham-chieu/cua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Bầy Cá Con · khung: Cá/chim bay
Ba con cá nhỏ bơi sát nhau. Nét lạ: là diều giấy hình cá có dây.

```
Three little blue and orange fish swimming together as one group. Twist: they are fish-shaped paper kites with strings trailing. Side view facing RIGHT, three fish close together in a loose triangle, all heads pointing right, tails to the left, top fins raised up with a white gap, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 34 pixels tall (36 x 34 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #b32a2c, dark teal #0e746e, blue #1b4c92, dark red #6a1220. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/34 of the height thick (exactly one game pixel), flat solid colors, at most 19 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cá, chim bay** · Cỡ trong game: 36 × 34 điểm ảnh · Ảnh tham chiếu: [tham-chieu/caCon.png](tham-chieu/caCon.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Ốc Mượn Hồn · khung: Cua/bọ
Ốc mượn hồn càng đỏ. Nét lạ: ở trong ấm sành sứt quai.

```
A hermit crab with red claws. Twist: it lives inside a chipped clay teapot with a broken handle instead of a shell. Side view facing RIGHT, the round shell at the back left, the crab head and one big claw raised at the front right with a white gap, short legs splayed down to the lower left and lower right, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.3 times wider than tall. It will be shown in the game at only 41 pixels tall (52 x 41 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light blue #9bb4e8, blue #5265ae, light grey-blue #a9d8ee, dark blue #2c3a7c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/41 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cua, bọ (nhiều chân)** · Cỡ trong game: 52 × 41 điểm ảnh · Ảnh tham chiếu: [tham-chieu/oc.png](tham-chieu/oc.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Hải Quỳ · khung: Cây/đứng yên
Hải quỳ trên đá. Nét lạ: xúc tu như sợi mì, ngọc trai giữa miệng.

```
A sea anemone creature on a rock, round mouth in the middle. Twist: its tentacles look like long noodles, a glowing pearl sits in its mouth. Front view facing the viewer (turned only slightly to the right), sitting on a small rock base at the bottom, a fat column body with the angry face in the middle, a crown of thick tentacles on top, two tentacles reaching out left and right with white gaps, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 43 pixels tall (44 x 43 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #6a1220, dark teal #0e746e, red #b32a2c, red #ee5c3a. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/43 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cây, đứng yên** · Cỡ trong game: 44 × 43 điểm ảnh · Ảnh tham chiếu: [tham-chieu/haiQuy.png](tham-chieu/haiQuy.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cá Chuồn · khung: Cá/chim bay
Cá chuồn bạc. Nét lạ: vây cánh là hai cái quạt nan.

```
A silver-blue flying fish leaping. Twist: its wing fins are two open bamboo hand fans. Side view facing RIGHT, flying, body horizontal in the middle, head at the right, tail at the left at the same height, wings or fins raised up above the back with a clear white gap from the body, nothing touching the ground, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.5 times wider than tall. It will be shown in the game at only 35 pixels tall (53 x 35 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey-blue #a9d8ee, blue #1b4c92, blue #3883d4, blue #4f86b0. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/35 of the height thick (exactly one game pixel), flat solid colors, at most 17 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cá, chim bay** · Cỡ trong game: 53 × 35 điểm ảnh · Ảnh tham chiếu: [tham-chieu/caChuon.png](tham-chieu/caChuon.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cá Nóc · khung: Khối mềm
Cá nóc phồng tròn. Nét lạ: gai là đinh guốc, ngậm cái còi.

```
A round inflated pufferfish with a worried face and tiny fins. Twist: its spikes are wooden-clog nails, it holds a whistle in its mouth. Front view facing the viewer (turned only slightly to the right), a round puffed-up ball body with the angry face in the middle, short spikes all around, two small fins sticking out low to the left and right with a white gap, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.2 times wider than tall. It will be shown in the game at only 28 pixels tall (33 x 28 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): white #e6f4f2, dark teal #063b3c, teal #1fb49c, white #ffffff. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/28 of the height thick (exactly one game pixel), flat solid colors, at most 17 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 33 × 28 điểm ảnh · Ảnh tham chiếu: [tham-chieu/caNoc.png](tham-chieu/caNoc.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Sứa Bom · khung: Khối mềm
Sứa trong suốt. Nét lạ: chuông sứa là chuông đồng, xúc tu buộc pháo dây.

```
A translucent blue jellyfish with dangling tentacles. Twist: its bell is a bronze temple bell, strings of firecrackers tied to its tentacles. Front view facing the viewer (turned only slightly to the right), a big round bell on top with the angry face, tentacles hanging straight down below, the two outer tentacles curling out to the lower left and lower right with a white gap, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 37 pixels tall (39 x 37 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): sky blue #50bde6, dark blue #0f437a, blue #2273b2, sky blue #3fa8d8. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/37 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 39 × 37 điểm ảnh · Ảnh tham chiếu: [tham-chieu/sua.png](tham-chieu/sua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Nhím Biển · khung: Khối mềm
Cầu gai tím. Nét lạ: gai là đũa tre, hai bàn chân người thò ra.

```
A dark purple sea urchin with two small eyes. Twist: its spines are bamboo chopsticks, two tiny human feet stick out below. Front view facing the viewer (turned only slightly to the right), a round spiky ball body with the angry face in the middle, spines sticking out all around, two tiny feet at the bottom, two spines sticking out low to the left and right, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.2 times wider than tall. It will be shown in the game at only 24 pixels tall (29 x 24 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): indigo #4836a0, light grey-blue #bfe9ff, white #ffffff. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/24 of the height thick (exactly one game pixel), flat solid colors, at most 18 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 29 × 24 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nhim.png](tham-chieu/nhim.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cua Tướng (tinh anh) · khung: Cua/bọ
Cua tướng càng răng cưa. Nét lạ: mai là giáp tướng xưa, cờ lệnh cắm lưng.

```
A big general crab with huge serrated claws and battle scars. Twist: its shell is ancient Vietnamese general's armor, a command flag on its back. Front view facing the viewer (turned only slightly to the right), wide low body in the middle, the two big claws or horns raised up and out toward the upper left and upper right with white gaps from the body, short legs splayed outward to the lower left and lower right, all feet on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.3 times wider than tall. It will be shown in the game at only 63 pixels tall (84 x 63 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #ee5c3a, blue #3883d4, blue #1b4c92, red #b32a2c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Elite version: bigger, scarred, more armor and spikes than normal monsters. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/63 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cua, bọ (nhiều chân)** · Cỡ trong game: 84 × 63 điểm ảnh · Ảnh tham chiếu: [tham-chieu/cuaTuong.png](tham-chieu/cuaTuong.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cá Nóc Chúa (tinh anh) · khung: Khối mềm
Cá nóc vua giận dữ. Nét lạ: là quả cầu tuyết gai băng, vương miện san hô.

```
A large furious king pufferfish. Twist: its body is a frosted snowball with icicle spikes, wearing a red coral crown. Front view facing the viewer (turned only slightly to the right), a big round puffed-up ball body with the angry face, tall ice spikes rising on top like a crown, two fins sticking out low to the left and right with a white gap, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 63 pixels tall (66 x 63 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): white #ffffff, white #dff6ff, white #e6f4f2, teal #1aa894. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Elite version: bigger, scarred, more armor and spikes than normal monsters. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/63 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 66 × 63 điểm ảnh · Ảnh tham chiếu: [tham-chieu/caNocChua.png](tham-chieu/caNocChua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cua Đá (trùm nhỏ) · khung: Cua/bọ
Cua đá khổng lồ chậm chạp. Nét lạ: mai là hòn non bộ có cây và chùa tí hon.

```
A giant heavy rock crab with massive claws. Twist: its shell is a miniature rock garden with tiny trees, a tiny pagoda and a little waterfall. 3/4 view turned to the RIGHT, wide low body in the middle, the two big claws or horns raised up and out toward the upper left and upper right with white gaps from the body, short legs splayed outward to the lower left and lower right, all feet on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.6 times wider than tall. It will be shown in the game at only 71 pixels tall (117 x 71 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): blue #7187a8, dark blue #46567a, dark blue #222a40, light grey-blue #a9bcd8. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it). Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/71 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cua, bọ (nhiều chân)** · Cỡ trong game: 117 × 71 điểm ảnh · Ảnh tham chiếu: [tham-chieu/cuaDa.png](tham-chieu/cuaDa.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Ngư Tinh (trùm vùng) · khung: Rắn
Thủy quái rắn cá khổng lồ. Nét lạ: vảy là mảnh gốm men lam vỡ, râu là xích neo.

```
A giant sea serpent fish spirit, long body, dragon-like fins, big fanged jaws, glowing eyes. Twist: its scales are broken blue-and-white ceramic shards, its whiskers are rusty anchor chains. Side view facing RIGHT, long body lying low in a gentle S-curve across the whole width, head raised at the right end, tail tapering to the left end, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.4 times wider than tall. It will be shown in the game at only 105 pixels tall (152 x 105 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): teal #149c8c, blue #1f559a, blue #1f5f9c, sky blue #2f8fc8. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it). Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/105 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Rắn (trườn)** · Cỡ trong game: 152 × 105 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nguTinh.png](tham-chieu/nguTinh.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

---

## Lâu đài cổ (hệ Lửa: đỏ cam, xám đá)

### Lính Ma Giáp Gỉ · khung: Người
Bộ giáp gỉ không người. Nét lạ: trong mũ là ngọn nến, cầm chổi thay gươm.

```
An empty rusty suit of ancient armor walking by itself, slightly hunched. Twist: inside the helmet is only a burning candle flame, it holds a straw broom instead of a sword. Side view facing RIGHT, standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.6 times wider than tall. It will be shown in the game at only 31 pixels tall (50 x 31 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #5c1a22, brown #a85a26, brown #6e3418, red #9a3428. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/31 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 50 × 31 điểm ảnh · Ảnh tham chiếu: [tham-chieu/linhMa.png](tham-chieu/linhMa.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Bầy Dơi Than · khung: Cá/chim bay
Ba con dơi đen. Nét lạ: cánh là vàng mã cháy dở.

```
Three black bats flying together. Twist: their wings are half-burnt joss paper with glowing ember edges. 3/4 view turned to the RIGHT, three bats close together in a loose triangle, faces toward the right, every pair of wings spread up and out with white gaps between them, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.2 times wider than tall. It will be shown in the game at only 38 pixels tall (45 x 38 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey #48424e, red #f0506e, red #a8324a, off-white #fff8e0. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/38 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Cá, chim bay** · Cỡ trong game: 45 × 38 điểm ảnh · Ảnh tham chiếu: [tham-chieu/doiThan.png](tham-chieu/doiThan.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Tượng Đá Cầm Khiên · khung: Người
Lính tượng đá nứt. Nét lạ: đầu là con nghê đá, khiên là cái nong tre.

```
A cracked grey stone guardian soldier with moss in the cracks. Twist: its head is a stone nghe guardian lion-dog, its shield is a huge round woven bamboo tray. 3/4 view turned to the RIGHT, standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.6 times wider than tall. It will be shown in the game at only 32 pixels tall (51 x 32 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey #8a8288, dark grey #57505a, dark grey-purple #2c2830, light grey #cbc3c0. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 19 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 51 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tuongDa.png](tham-chieu/tuongDa.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Đèn Lồng Ma · khung: Khối mềm
Đèn lồng ma bay. Nét lạ: là đèn ông sao rách, thè lưỡi dài.

```
A floating haunted lantern with a spooky face and ghostly fire inside. Twist: it is a torn five-pointed star festival lantern with a long tongue sticking out. Front view facing the viewer (turned only slightly to the right), the lantern body floating, face in the middle, the top cap on top, the long tongue and two paper tassels hanging out low to the left and right with a white gap, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.4 times wider than tall. It will be shown in the game at only 32 pixels tall (44 x 32 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #f0582a, orange #ff8a1e, yellow #ffd23c, red #b0261a. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 44 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/denLong.png](tham-chieu/denLong.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Mèo Đen Hai Đuôi · khung: Bốn chân
Mèo đen mắt vàng. Nét lạ: hai đuôi là que diêm cháy, cổ đeo chuông đồng.

```
A black cat yokai with glowing yellow eyes, arched back. Twist: its two tails are giant burning matchsticks, a bronze bell collar. Side view facing RIGHT, body horizontal, head at the right end, tail sticking out from the upper left of the body, four legs going straight down under the body (front pair under the head end, back pair under the tail end, a clear white gap between the front and back legs), all four feet on the same bottom line, legs about one third of the height, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.8 times wider than tall. It will be shown in the game at only 33 pixels tall (58 x 33 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey-purple #26222c, red #a8324a, dark grey #48424e, orange #f0582a. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/33 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 58 × 33 điểm ảnh · Ảnh tham chiếu: [tham-chieu/meoDen.png](tham-chieu/meoDen.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Hũ Lửa Sống · khung: Khối mềm
Hũ sành có mặt phụt lửa. Nét lạ: là bình vôi, hai tay là ống điếu.

```
A living clay jar with a face, fire bursting from its top, stubby legs. Twist: it is an old betel lime pot, its two arms are wooden smoking pipes. Front view facing the viewer (turned only slightly to the right), a fat round jar body with the angry face, fire bursting out of the top, two pipe arms sticking out low to the left and right with a white gap, two stubby feet at the bottom, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 31 pixels tall (30 x 31 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #5c2418, orange #96402a, yellow #ffd23c, orange #f0582a. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/31 of the height thick (exactly one game pixel), flat solid colors, at most 18 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 30 × 31 điểm ảnh · Ảnh tham chiếu: [tham-chieu/huLua.png](tham-chieu/huLua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Tiểu Yêu Ném Pháo · khung: Người
Yêu tinh đỏ có sừng. Nét lạ: mặc yếm đỏ, đầu là vỏ trứng nứt.

```
A small red imp with little horns and a grin, holding a lit firecracker bomb. Twist: it wears a red traditional bodice (yem), its head is a cracked eggshell with horns poking out. 3/4 view turned to the RIGHT, standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.4 times wider than tall. It will be shown in the game at only 32 pixels tall (44 x 32 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #b0261a, orange #f0582a, light orange #ffb070, off-white #fff8e0. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 44 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tieuYeu.png](tham-chieu/tieuYeu.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Nhím Than Hồng · khung: Khối mềm
Nhím than bốc khói. Nét lạ: lưng là viên than tổ ong đỏ rực.

```
A hedgehog made of black coal, smoke rising. Twist: its back is a glowing red honeycomb coal briquette with round holes. Front view facing the viewer (turned only slightly to the right), a round spiky coal-ball body with the angry face in the middle, glowing spines all around, two tiny feet at the bottom, two spines sticking out low to the left and right, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about as wide as tall. It will be shown in the game at only 28 pixels tall (31 x 28 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey #48424e, red #f0506e, light orange #ffb070. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/28 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 31 × 28 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nhimThan.png](tham-chieu/nhimThan.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Tướng Ma (tinh anh) · khung: Người
Tướng ma giáp tối cầm đại đao. Nét lạ: mặt là mặt nạ tuồng đỏ trắng, áo choàng là cờ rách.

```
A ghost general in dark ancient armor holding a big guandao glaive. Twist: its face is a painted red-and-white tuong opera mask, its cape is a torn battle flag. 3/4 view turned to the RIGHT, standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.5 times wider than tall. It will be shown in the game at only 43 pixels tall (64 x 43 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a85a26, brown #6e3418, orange #ff8a1e, light grey #e8e0c4. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Elite version: bigger, scarred, more armor and spikes than normal monsters. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/43 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 64 × 43 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tuongMa.png](tham-chieu/tuongMa.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Hũ Lửa Chúa (tinh anh) · khung: Khối mềm
Hũ đồng lớn phun lửa. Nét lạ: là lư hương ba chân, khói thành mặt quỷ.

```
A large living bronze urn roaring fire, angry face. Twist: it is a three-legged bronze incense burner, its smoke forms a demon face. Front view facing the viewer (turned only slightly to the right), a fat round urn body with the angry face, flames and a crown on top, two handle-arms sticking out to the left and right with a white gap, three short legs at the bottom, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.4 times wider than tall. It will be shown in the game at only 42 pixels tall (59 x 42 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #8a1c16, red #d2401e, orange #ff8a1e, yellow #ffd23c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Elite version: bigger, scarred, more armor and spikes than normal monsters. Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/42 of the height thick (exactly one game pixel), flat solid colors, at most 19 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Khối mềm (slime, lửa, ma)** · Cỡ trong game: 59 × 42 điểm ảnh · Ảnh tham chiếu: [tham-chieu/huChua.png](tham-chieu/huChua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Hổ Lửa (trùm nhỏ) · khung: Bốn chân
Hổ lửa gầm. Nét lạ: vằn là chữ Nôm sáng, vòng cổ tiền xu.

```
A fierce fire tiger with flaming mane and tail, roaring. Twist: its stripes are glowing ancient Nom characters, a collar of old coins on a red string. Side view facing RIGHT, body horizontal, head at the right end, tail sticking out from the upper left of the body, four legs going straight down under the body (front pair under the head end, back pair under the tail end, a clear white gap between the front and back legs), all four feet on the same bottom line, legs about one third of the height, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.7 times wider than tall. It will be shown in the game at only 64 pixels tall (109 x 64 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #52302a, orange #c43c10, orange #ff8a1e, yellow #ffd23c. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it). Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/64 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 109 × 64 điểm ảnh · Ảnh tham chiếu: [tham-chieu/hoLua.png](tham-chieu/hoLua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Hồ Tinh (trùm vùng) · khung: Bốn chân
Cáo chín đuôi rình mồi. Nét lạ: chín đuôi là dải lụa treo đèn lồng, mặt nạ hồ ly gỗ che nửa mặt.

```
A nine-tailed fox spirit in a crouching stalking pose, white-gold fur, blue-violet foxfire around, cunning eyes. Twist: its nine tails are silk ribbons each ending in a small lantern, a wooden fox mask covers half its face. Side view facing RIGHT, crouching low, stalking, head at the right end, the nine tails fanning up and out to the upper left behind it with white gaps between them, four legs down with white gaps, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is about 1.5 times wider than tall. It will be shown in the game at only 119 pixels tall (177 x 119 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): off-white #f2e6cf, tan #c9ad98, red #e8442a, off-white #fffdf2. Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it). Pixel-art game sprite: one clean navy-black outline (#14182e) all around the shape, about 1/119 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top left, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Bốn chân** · Cỡ trong game: 177 × 119 điểm ảnh · Ảnh tham chiếu: [tham-chieu/hoTinh.png](tham-chieu/hoTinh.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

---

# Phần 2: vũ khí, trang phục, đồ và tài nguyên, người làng

Cách dùng y như phần trên: **chép đúng MỘT dòng trong khung xám** gửi cho công cụ vẽ AI. Vẽ xong, trong Xưởng Sprite mở nhóm ghi sau dấu `·` (ví dụ **Vũ khí › Kiếm, dòng 1**), chọn đúng thẻ, đưa hình vào.

- **Kiếm, giáo, búa** được vẽ nằm ngang, chuôi bên trái, mũi bên phải (đúng cách Xưởng tự đặt điểm cầm). **Cung** dựng đứng, dây bên trái, bụng cung bên phải.
- Trong Xưởng: vũ khí chỉ cần **chạm vào chỗ chuôi** để đặt điểm cầm tay (game tự xoay tám hướng, tự thêm ánh hệ và vệt chém); trang phục **kéo đặt lên em bé mẫu**; đồ và tài nguyên chỉ cần đưa hình.
- Muốn vũ khí riêng từng hệ (Lửa, Độc, Băng): dùng cùng dòng, thêm `glowing orange fire version` / `glowing green poison version` / `icy pale blue version` rồi chọn hệ ở bước 3.

---

## Vũ khí · Kiếm

### Kiếm Rèn · Vũ khí › Kiếm, dòng 1
Thanh kiếm sắt rèn mộc mạc. Nét lạ: chuôi quấn dây gàu sòng, chắn tay là cái móng ngựa.

```
A plain hand-forged iron sword with a simple crossguard. Twist: the grip is wrapped in thick rope from a village water-bucket, and the crossguard is a bent horseshoe. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.3 times wider than tall, shown in the game at only 44 pixels long and 19 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey #b4c0d4, grey-blue #5f6b84, white #f4f8ff, yellow #e2b64e. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/19 of the height thick (exactly one game pixel), flat solid colors, at most 11 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 44 × 19 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-0.png](tham-chieu/vk-sword-0.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Đao Lưỡi Liềm · Vũ khí › Kiếm, dòng 2
Đao lưỡi cong như liềm gặt. Nét lạ: sống đao mọc bông lúa chín, chuôi buộc khăn rằn.

```
A curved sabre with a sickle-like blade. Twist: ripe golden rice ears grow along the back of the blade, and a checkered southern scarf (khan ran) is tied on the handle. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.6 times wider than tall, shown in the game at only 44 pixels long and 28 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey #b4c0d4, grey-blue #5f6b84, white #f4f8ff, white #ffffff. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/28 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 44 × 28 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-1.png](tham-chieu/vk-sword-1.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Kiếm Lá Lúa · Vũ khí › Kiếm, dòng 3
Kiếm xanh hình lá lúa. Nét lạ: mũi kiếm treo giọt sương to, chuôi là bó mạ buộc lạt.

```
A slim green sword shaped like a rice leaf with a gold vein. Twist: a big dew drop hangs at the tip, and the handle is a bundle of rice seedlings tied with a bamboo strip. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.2 times wider than tall, shown in the game at only 45 pixels long and 20 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey-green #b9d8a6, dark green #5f8a5a, light yellow #e0c060, off-white #f2fbe2. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/20 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 45 × 20 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-2.png](tham-chieu/vk-sword-2.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Gươm Rồng · Vũ khí › Kiếm, dòng 4
Gươm báu có chắn tay đầu rồng. Nét lạ: con rùa vàng nhỏ ngậm lưỡi gươm (Hồ Gươm).

```
A precious Vietnamese dragon sword, dragon-head guard, scaled blade. Twist: a tiny golden turtle sits on the guard, biting the base of the blade like the legend of the Returned Sword Lake. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.9 times wider than tall, shown in the game at only 46 pixels long and 24 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey #b4c0d4, yellow #e2b64e, brown #9c7426, grey-blue #5f6b84. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/24 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 46 × 24 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-3.png](tham-chieu/vk-sword-3.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mã Tấu · Vũ khí › Kiếm, dòng 5
Đao bản to, mũi vát. Nét lạ: lưỡi in con gà trống tranh Đông Hồ, chuôi có tua đỏ.

```
A broad machete sabre with a clipped tip. Twist: a Dong Ho folk-painting rooster is printed on the blade, and a red tassel hangs from the pommel. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.7 times wider than tall, shown in the game at only 46 pixels long and 17 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #7a8496, dark grey-blue #3d4354, white #ffffff, light grey #c2cad8. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/17 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 46 × 17 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-4.png](tham-chieu/vk-sword-4.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Dao Rựa · Vũ khí › Kiếm, dòng 6
Dao rựa đi rừng, mũi quặp. Nét lạ: chuôi là khúc mía, mũi cắm một quả cau.

```
A farmer's billhook knife with a hooked tip. Twist: the handle is a segment of sugarcane, and an areca nut is stuck on the hooked tip. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.7 times wider than tall, shown in the game at only 48 pixels long and 18 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #7a8496, light grey #c2cad8, dark grey-blue #3d4354, grey-blue #5f6b84. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/18 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 48 × 18 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-5.png](tham-chieu/vk-sword-5.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Kiếm Tre · Vũ khí › Kiếm, dòng 7
Kiếm làm từ một đoạn tre. Nét lạ: mỗi đốt là ống cơm lam bốc khói.

```
A sword made of one green bamboo stalk with visible nodes. Twist: each bamboo segment is a tube of steaming lam rice with a little puff of steam. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2 times wider than tall, shown in the game at only 45 pixels long and 22 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark yellow-green #6f7a2a, golden #b3b84a, light yellow #e6e28a, dark green #2f6a2c. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/22 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 45 × 22 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-6.png](tham-chieu/vk-sword-6.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Đoản Kiếm Đông Sơn · Vũ khí › Kiếm, dòng 8
Dao găm đồng khắc hoa văn trống. Nét lạ: chuôi là tượng người thổi khèn nhỏ.

```
A short bronze Dong Son dagger with drum-pattern engravings. Twist: the handle is a tiny bronze figure of a person playing a khen pipe, like real Dong Son daggers. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.2 times wider than tall, shown in the game at only 48 pixels long and 22 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #c4853a, brown #754418, tan #f6d07c, white #ffffff. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/22 of the height thick (exactly one game pixel), flat solid colors, at most 7 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 48 × 22 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-7.png](tham-chieu/vk-sword-7.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Đao Cá Chép · Vũ khí › Kiếm, dòng 9
Đao bản rộng hình cá chép. Nét lạ: cá chép đang hoá rồng: đuôi cá thành chuôi, có râu rồng.

```
A broad sabre shaped like a carp, scaled blade. Twist: the carp is turning into a dragon, with long dragon whiskers near the guard and the fish tail forming the handle. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.2 times wider than tall, shown in the game at only 47 pixels long and 21 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey #b4c0d4, grey-blue #5f6b84, white #f4f8ff, brown #9a4a16. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/21 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 47 × 21 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-8.png](tham-chieu/vk-sword-8.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Kiếm Sóng Nước · Vũ khí › Kiếm, dòng 10
Lưỡi lượn sóng xanh trắng. Nét lạ: thuyền giấy trôi trên sống kiếm.

```
A sword with a wavy blade like water waves, blue and white. Twist: a little folded paper boat rides on the back of the blade. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.6 times wider than tall, shown in the game at only 46 pixels long and 18 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey-blue #a9c6e0, blue #4f6f94, white #f0f8ff, yellow #e2b64e. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/18 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 46 × 18 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-sword-9.png](tham-chieu/vk-sword-9.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Vũ khí · Cung

### Cung Rồng Rắn · Vũ khí › Cung, dòng 1
Cung là con rắn cuộn. Nét lạ: rắn quàng khăn đỏ múa rồng, đầu đuôi là hai đầu cung.

```
A bow formed by a coiled snake, head and tail are the two bow tips. Twist: the snake wears a red festival dragon-dance scarf around its neck. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.7 times taller than wide, shown in the game at only 38 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #479544, dark green #255a2c, yellow #e2b64e, green #8fd070. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/38 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 22 × 38 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-0.png](tham-chieu/vk-bow-0.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Nỏ Thần · Vũ khí › Cung, dòng 2
Nỏ thần An Dương Vương. Nét lạ: lẫy nỏ là móng rùa vàng, báng cắm lông ngỗng.

```
The legendary magic crossbow of An Duong Vuong. Twist: the trigger is a golden turtle claw, and white goose feathers are tucked on the stock (from the tale of My Chau). Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.2 times taller than wide, shown in the game at only 37 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8783e, brown #8a5a34, light grey #e8e2d0, brown #754418. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/37 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 31 × 37 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-1.png](tham-chieu/vk-bow-1.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Sừng Trâu · Vũ khí › Cung, dòng 3
Hai sừng trâu ghép lại. Nét lạ: giữa cung treo mõ gỗ đeo cổ trâu.

```
A bow made of two curved buffalo horns joined in the middle. Twist: a wooden buffalo neck-bell (mo trau) hangs from the grip. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.8 times taller than wide, shown in the game at only 37 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey #5a4c58, dark grey-purple #2c2530, light grey #e8e2d0, brown #7a6458. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/37 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 21 × 37 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-2.png](tham-chieu/vk-bow-2.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Tre · Vũ khí › Cung, dòng 4
Cung tre đơn sơ. Nét lạ: hai đầu cung mọc lá tre non, dây là sợi lạt.

```
A simple bamboo bow. Twist: young bamboo leaves sprout from both tips, and the string is a twisted bamboo strip. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.8 times taller than wide, shown in the game at only 40 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8842e, light yellow #e6e28a, dark yellow-green #6f7a2a, golden #b3b84a. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/40 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 22 × 40 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-3.png](tham-chieu/vk-bow-3.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Ná Thun · Vũ khí › Cung, dòng 5
Ná cao su chữ Y. Nét lạ: chạc là cành ổi, túi ná ngậm viên bi ve.

```
A Y-shaped slingshot with a rubber band. Twist: the fork is a guava tree branch with one leaf, and the pouch holds a colorful glass marble. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.7 times taller than wide, shown in the game at only 32 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8783e, brown #6e4a26, red #d2362e, tan #d6a868. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 19 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-4.png](tham-chieu/vk-bow-4.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Cánh Cò · Vũ khí › Cung, dòng 6
Cung như đôi cánh cò dang. Nét lạ: giữa cung là đầu cò ngậm con cá (ca dao con cò).

```
A bow shaped like the spread white wings of a stork. Twist: the stork's head in the middle of the bow holds a little fish in its beak. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.5 times taller than wide, shown in the game at only 37 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): white #eeeaf2, light grey #b9b4c4, white #ffffff, light grey #e8e2d0. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/37 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 25 × 37 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-5.png](tham-chieu/vk-bow-5.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Trăng Khuyết · Vũ khí › Cung, dòng 7
Cung hình trăng lưỡi liềm. Nét lạ: chú Cuội ngồi gốc cây đa tí hon giữa cung.

```
A bow shaped like a crescent moon, silver and pale yellow. Twist: a tiny Cuoi boy sits under a tiny banyan tree in the middle of the bow. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 2.2 times taller than wide, shown in the game at only 44 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): tan #f2df8a, golden #b89a3e, light grey #e8e2d0, off-white #fffbe0. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/44 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 20 × 44 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-6.png](tham-chieu/vk-bow-6.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Đàn Bầu · Vũ khí › Cung, dòng 8
Cung như cây đàn bầu. Nét lạ: giữa cung có quả bầu khô làm hộp đàn.

```
A bow shaped like the Vietnamese dan bau monochord. Twist: a dried gourd sound box sits on the grip, and the string looks like an instrument string with a flexible rod. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.9 times taller than wide, shown in the game at only 39 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8783e, brown #a8642a, light grey #e8e2d0, brown #6e4a26. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/39 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 21 × 39 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-7.png](tham-chieu/vk-bow-7.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Xương Cá · Vũ khí › Cung, dòng 9
Cung làm từ xương sống cá. Nét lạ: đầu cá ở một đầu cung còn ngậm lưỡi câu.

```
A bow made of a fish skeleton spine and ribs. Twist: the fish skull at the top tip still bites a fishing hook with a bit of line. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 2 times taller than wide, shown in the game at only 40 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey #e6dcc4, brown #a89c84, white #ffffff, light grey #e8e2d0. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/40 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 20 × 40 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-8.png](tham-chieu/vk-bow-8.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cung Đèn Ông Sao · Vũ khí › Cung, dòng 10
Cung đỏ vàng ngày Tết Trung thu. Nét lạ: giữa cung là đèn ông sao sáng, hai đầu treo tua giấy màu.

```
A red and yellow bow. Twist: a glowing five-pointed star lantern (den ong sao) sits in the middle, and colorful paper tassels hang from both tips. Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). Proportions like the game: about 1.6 times taller than wide, shown in the game at only 40 pixels tall, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): yellow #e2b64e, golden #b3b84a, light grey #e8e2d0, tan #ffe9a0. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/40 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 25 × 40 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-bow-9.png](tham-chieu/vk-bow-9.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Vũ khí · Giáo

### Giáo Tre Vót · Vũ khí › Giáo, dòng 1
Ngọn tre vót nhọn. Nét lạ: cán là cây tre còn nguyên búi rễ (tre Thánh Gióng).

```
A sharpened bamboo spear. Twist: the butt end still has its tangled roots, like the bamboo Saint Giong pulled from the ground, glowing a little. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 3.2 times wider than tall, shown in the game at only 58 pixels long and 18 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark yellow-green #6f7a2a, light yellow #e6e28a, golden #b3b84a, white #ffffff. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/18 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 58 × 18 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-0.png](tham-chieu/vk-spear-0.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Đinh Ba · Vũ khí › Giáo, dòng 2
Chĩa ba mũi. Nét lạ: ba mũi là xiên nướng cá, một con cá khô mắc giữa.

```
A three-pronged trident. Twist: the prongs are fish-grilling skewers, and a dried fish is stuck on the middle prong. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.5 times wider than tall, shown in the game at only 58 pixels long and 23 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #5f6b84, white #f4f8ff, brown #754418, light grey #b4c0d4. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/23 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 58 × 23 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-1.png](tham-chieu/vk-spear-1.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Câu Liêm · Vũ khí › Giáo, dòng 3
Giáo móc câu dài. Nét lạ: móc treo cái giỏ cua nhỏ.

```
A long hooked sickle spear (cau liem). Twist: a small woven crab basket hangs from the hook. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.6 times wider than tall, shown in the game at only 57 pixels long and 22 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #5f6b84, light grey #b4c0d4, white #f4f8ff, orange #b78350. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/22 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 57 × 22 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-2.png](tham-chieu/vk-spear-2.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mác · Vũ khí › Giáo, dòng 4
Lưỡi mác bản to cong. Nét lạ: lưỡi khắc hoa sen, cán quấn dải vải ngũ sắc.

```
A Vietnamese mac halberd with a broad curved blade. Twist: a lotus flower is engraved on the blade, and five-colored festival cloth ribbons are wound on the shaft. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 3.9 times wider than tall, shown in the game at only 59 pixels long and 15 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #5f6b84, light grey #b4c0d4, white #f4f8ff, orange #b78350. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/15 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 59 × 15 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-3.png](tham-chieu/vk-spear-3.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Lao Phóng · Vũ khí › Giáo, dòng 5
Lao ngắn để phóng. Nét lạ: đuôi lao là ba lông đuôi gà trống.

```
A short throwing javelin. Twist: its fletching is three bright rooster tail feathers, red, green and gold. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.9 times wider than tall, shown in the game at only 58 pixels long and 20 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, orange #e09c4a, dark red #8c1c1f, grey-blue #5f6b84. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/20 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 58 × 20 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-4.png](tham-chieu/vk-spear-4.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Giáo Đồng Đông Sơn · Vũ khí › Giáo, dòng 6
Giáo đồng khắc hoa văn trống. Nét lạ: dưới mũi đúc chim Lạc dang cánh.

```
A bronze Dong Son spear with drum-pattern engravings. Twist: a Lac bird with spread wings is cast just below the spearhead. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 3.9 times wider than tall, shown in the game at only 58 pixels long and 15 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #754418, white #ffffff, orange #c4853a, tan #f6d07c. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/15 of the height thick (exactly one game pixel), flat solid colors, at most 11 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 58 × 15 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-5.png](tham-chieu/vk-spear-5.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Xà Mâu · Vũ khí › Giáo, dòng 7
Giáo lưỡi uốn như rắn. Nét lạ: mũi là lưỡi rắn chẻ đôi thè ra từ miệng rắn gốm.

```
A snake spear with a wavy serpent blade. Twist: the blade comes out of a glazed ceramic snake mouth and ends in a forked tongue. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 3.9 times wider than tall, shown in the game at only 62 pixels long and 16 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey-blue #3d4354, grey-blue #7a8496, light grey #c2cad8, brown #9c7426. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/16 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 62 × 16 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-6.png](tham-chieu/vk-spear-6.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mái Chèo · Vũ khí › Giáo, dòng 8
Mái chèo dùng làm giáo. Nét lạ: mặt chèo vẽ đôi mắt thuyền như thuyền chài.

```
A wooden boat oar used as a spear, paddle at the tip. Twist: the paddle is painted with the big eyes that Vietnamese fishermen paint on boat bows. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 4.4 times wider than tall, shown in the game at only 57 pixels long and 13 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8783e, brown #6e4a26, tan #d6a868, dark brown #5a3822. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 57 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-7.png](tham-chieu/vk-spear-7.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cờ Lau · Vũ khí › Giáo, dòng 9
Cây lau làm cờ. Nét lạ: chú trâu gỗ nhỏ ngồi trên cán (Đinh Bộ Lĩnh chăn trâu).

```
A reed flag spear with a fluffy white reed plume at the tip. Twist: a tiny wooden water buffalo sits on the shaft, from the tale of the buffalo boy Dinh Bo Linh. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.9 times wider than tall, shown in the game at only 60 pixels long and 21 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): tan #b8a890, off-white #efe6d2, white #ffffff, dark yellow-green #6f7a2a. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/21 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 60 × 21 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-8.png](tham-chieu/vk-spear-8.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bút Lông · Vũ khí › Giáo, dòng 10
Bút lông to như ngọn giáo. Nét lạ: cán treo nghiên mực nhỏ, ngòi nhỏ giọt mực.

```
A giant calligraphy brush used as a spear, ink tip pointing forward. Twist: a small ink stone dangles from the shaft on a red string, and a fat ink drop hangs from the tip. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 5.6 times wider than tall, shown in the game at only 62 pixels long and 11 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark yellow-green #6f7a2a, white #ffffff, light grey #b9b4c4, golden #b3b84a. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/11 of the height thick (exactly one game pixel), flat solid colors, at most 15 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 62 × 11 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-spear-9.png](tham-chieu/vk-spear-9.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Vũ khí · Búa

### Búa Lò Rèn · Vũ khí › Búa, dòng 1
Búa rèn đầu sắt cán gỗ. Nét lạ: đầu búa đỏ rực như vừa rút từ lò, cán buộc ống bễ nhỏ.

```
A blacksmith forge hammer, iron head, wooden handle. Twist: the head glows red-hot as if just pulled from the forge, and a tiny leather bellows is tied to the handle. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.6 times wider than tall, shown in the game at only 41 pixels long and 25 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #7a8496, dark grey-blue #3d4354, white #f4f8ff, light grey #b4c0d4. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/25 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 41 × 25 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-0.png](tham-chieu/vk-hammer-0.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Chày Giã Gạo · Vũ khí › Búa, dòng 2
Chày gỗ giã gạo. Nét lạ: đầu chày dính hạt cốm xanh, buộc lá sen gói cốm.

```
A wooden rice-pounding pestle. Twist: green young-rice flakes (com) stick to the heavy end, and a lotus leaf parcel of com is tied to it. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2.6 times wider than tall, shown in the game at only 44 pixels long and 17 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8783e, brown #6e4a26, tan #d6a868, white #eeeaf2. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/17 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 44 × 17 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-1.png](tham-chieu/vk-hammer-1.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Chùy Gai · Vũ khí › Búa, dòng 3
Chùy đầu tròn có gai. Nét lạ: đầu chùy là quả mít gai tù.

```
A spiked mace. Twist: the spiked head is a whole jackfruit with its bumpy spiky skin and a stem on top. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.7 times wider than tall, shown in the game at only 45 pixels long and 27 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #7a8496, dark grey-blue #3d4354, white #ffffff, light grey #c2cad8. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/27 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 45 × 27 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-2.png](tham-chieu/vk-hammer-2.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Rìu Đá · Vũ khí › Búa, dòng 4
Rìu lưỡi đá buộc dây. Nét lạ: chim én đậu trên cán rìu.

```
A stone-age axe with a rough stone head tied with rope. Twist: a little swallow bird perches on the handle. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.7 times wider than tall, shown in the game at only 43 pixels long and 26 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey #8e9099, brown #a8842e, light yellow #e0c060, light grey #c9cbd2. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/26 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 43 × 26 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-3.png](tham-chieu/vk-hammer-3.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Vồ Gỗ · Vũ khí › Búa, dòng 5
Vồ gỗ đầu to. Nét lạ: đầu vồ là cối xay lúa bằng tre.

```
A big wooden mallet. Twist: the mallet head is a woven bamboo rice-husking mill (coi xay) with its little crank. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.4 times wider than tall, shown in the game at only 41 pixels long and 29 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8783e, grey-blue #7a8496, brown #6e4a26, tan #d6a868. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/29 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 41 × 29 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-4.png](tham-chieu/vk-hammer-4.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Chiêng Đồng · Vũ khí › Búa, dòng 6
Chiêng đồng gắn cán. Nét lạ: chiêng có núm to, cán buộc khăn thổ cẩm.

```
A bronze gong on a handle used as a hammer. Twist: the gong has a big raised knob in the middle, and a Central Highlands brocade scarf is tied to the handle. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.8 times wider than tall, shown in the game at only 46 pixels long and 25 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #c4853a, brown #754418, tan #f6d07c, white #ffffff. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/25 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 46 × 25 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-5.png](tham-chieu/vk-hammer-5.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Trống Đồng · Vũ khí › Búa, dòng 7
Trống đồng nhỏ gắn cán. Nét lạ: rìa trống có con cóc đồng ngồi.

```
A small Dong Son bronze drum on a handle used as a hammer, star pattern on the drum face. Twist: little bronze toads sit on the rim, like on real Dong Son drums. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.7 times wider than tall, shown in the game at only 43 pixels long and 26 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #c4853a, brown #754418, tan #f6d07c, white #ffffff. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/26 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 43 × 26 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-6.png](tham-chieu/vk-hammer-6.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Rìu Xéo Đông Sơn · Vũ khí › Búa, dòng 8
Rìu đồng lưỡi xéo hình chiếc hài. Nét lạ: lưỡi khắc thuyền rồng có người chèo.

```
A Dong Son asymmetric bronze boot-shaped axe. Twist: a dragon boat with tiny rowers is engraved on the blade. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.8 times wider than tall, shown in the game at only 42 pixels long and 23 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #c4853a, brown #754418, tan #f6d07c, white #ffffff. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/23 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 42 × 23 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-7.png](tham-chieu/vk-hammer-7.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Búa Đầu Trâu · Vũ khí › Búa, dòng 9
Búa đầu trâu hai sừng. Nét lạ: đầu trâu đeo vòng hoa hội chọi trâu.

```
A hammer with a water buffalo head and two horns. Twist: the buffalo wears a red flower garland like at the Do Son buffalo festival. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 1.3 times wider than tall, shown in the game at only 44 pixels long and 35 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #7a6458, dark grey #5a4c58, dark brown #4a3a34, light grey-red #c9a59a. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/35 of the height thick (exactly one game pixel), flat solid colors, at most 20 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 44 × 35 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-8.png](tham-chieu/vk-hammer-8.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Chùy Hồ Lô · Vũ khí › Búa, dòng 10
Chùy hình quả bầu hồ lô. Nét lạ: nút bầu là lõi ngô, dây quấn lá trầu.

```
A club shaped like a calabash gourd. Twist: the gourd is corked with a corn cob, and a vine of betel leaves winds around it. Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). Proportions like the game: about 2 times wider than tall, shown in the game at only 45 pixels long and 22 pixels thick, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #a8642a, orange #e09c4a, dark red #8c1c1f, red #d2362e. One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/22 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm · Cỡ trong game: 45 × 22 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vk-hammer-9.png](tham-chieu/vk-hammer-9.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Trang phục · Mũ

### Mũ trùm sừng nhỏ · Trang phục › Mũ
Mũ trùm có hai sừng nhỏ. Nét lạ: hai sừng là hai củ ấu.

```
A child's hood with two small horns. Twist: the horns are two dark water caltrop nuts (cu au). Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.2 times taller than wide. It will be shown in the game at only 20 pixels tall (17 x 20 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, dark red #8c1c1f, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/20 of the height thick (exactly one game pixel), flat solid colors, at most 7 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 20 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-trum_sung.png](tham-chieu/tp-hats-trum_sung.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ trùm chóp nhọn · Trang phục › Mũ
Mũ trùm có chóp nhọn. Nét lạ: chóp là phễu tre úp ngược, treo lục lạc.

```
A child's hood with a tall pointed tip. Twist: the tip is an upside-down bamboo funnel with a little jingle bell. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.3 times taller than wide. It will be shown in the game at only 22 pixels tall (17 x 22 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, dark red #8c1c1f, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/22 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 22 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-trum_nhon.png](tham-chieu/tp-hats-trum_nhon.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ trùm mầm lá · Trang phục › Mũ
Mũ trùm có mầm cây. Nét lạ: mầm là khóm mạ non trong nắm đất.

```
A child's hood with a sprout on top. Twist: the sprout is a clump of rice seedlings in a lump of mud. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.2 times taller than wide. It will be shown in the game at only 21 pixels tall (17 x 21 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, dark red #8c1c1f, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/21 of the height thick (exactly one game pixel), flat solid colors, at most 7 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 21 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-trum_la.png](tham-chieu/tp-hats-trum_la.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ trùm quấn khăn đỏ · Trang phục › Mũ
Mũ trùm có khăn đỏ. Nét lạ: khăn thắt kiểu khăn mỏ quạ.

```
A child's hood wrapped with a red scarf. Twist: the scarf is tied in the pointed crow-beak style (khan mo qua) of northern village women. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about as wide as tall. It will be shown in the game at only 18 pixels tall (20 x 18 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, dark red #8c1c1f, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/18 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 20 × 18 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-trum_khan.png](tham-chieu/tp-hats-trum_khan.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Nón lá · Trang phục › Mũ
Nón lá chóp nhọn. Nét lạ: quai lụa tím, mặt nón vẽ con cò bay.

```
A Vietnamese conical leaf hat (non la). Twist: a purple silk chin strap, and a white flying stork painted on the hat. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about as wide as tall. It will be shown in the game at only 22 pixels tall (25 x 22 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): yellow #d8b45c, brown #8f6c2a, tan #f8e6a4. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/22 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 25 × 22 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-non_la.png](tham-chieu/tp-hats-non_la.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Khăn xếp · Trang phục › Mũ
Khăn xếp truyền thống. Nét lạ: cài cành hoa đào Tết.

```
A traditional Vietnamese khan xep turban in indigo. Twist: a small pink peach blossom branch for Tet is tucked into it. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 2 times wider than tall. It will be shown in the game at only 9 pixels tall (18 x 9 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark blue #2e2d55, blue #5c5a92, yellow #e2b64e. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/9 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 18 × 9 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-khan_xep.png](tham-chieu/tp-hats-khan_xep.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ rơm · Trang phục › Mũ
Mũ rơm vành rộng. Nét lạ: chim sẻ làm tổ trên chóp.

```
A wide straw hat with a red band. Twist: a sparrow has built a nest on top, with the bird sitting in it. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 2.9 times wider than tall. It will be shown in the game at only 9 pixels tall (26 x 9 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): tan #f8e6a4, brown #8f6c2a, yellow #d8b45c. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/9 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 26 × 9 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-mu_rom.png](tham-chieu/tp-hats-mu_rom.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ sừng · Trang phục › Mũ
Mũ gỗ hai sừng cong. Nét lạ: sừng buộc cờ đuôi nheo nhỏ.

```
A wooden helmet with two curved horns. Twist: a tiny swallow-tail festival flag is tied to each horn. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.8 times wider than tall. It will be shown in the game at only 14 pixels tall (25 x 14 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): yellow #e2b64e, brown #8a5a34, orange #b78350. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/14 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 25 × 14 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-mu_sung.png](tham-chieu/tp-hats-mu_sung.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Vòng lá · Trang phục › Mũ
Vòng lá đội đầu. Nét lạ: kết bằng lá trầu có quả cau.

```
A leafy wreath crown. Twist: it is woven from betel leaves with a green areca nut on the front. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 2.4 times wider than tall. It will be shown in the game at only 7 pixels tall (17 x 7 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #479544, green #8fd070, dark green #255a2c. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-vong_la.png](tham-chieu/tp-hats-vong_la.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ da cá · Trang phục › Mũ
Mũ da cá có vây. Nét lạ: mũ là đầu cá trê có râu rủ hai bên.

```
A fish-skin cap. Twist: the cap is the head of a catfish with long whiskers hanging down both sides. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.2 times wider than tall. It will be shown in the game at only 16 pixels tall (19 x 16 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark sky blue #2a5a70, sky blue #4a7f9a, sky blue #8fc0d4. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/16 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 19 × 16 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-mu_da_ca.png](tham-chieu/tp-hats-mu_da_ca.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Khăn đá lửa · Trang phục › Mũ
Khăn đỏ đính đá lửa. Nét lạ: viên đá đỏ như than hồng, tóe tia lửa.

```
A red headband with a fire stone in front. Twist: the stone glows like a hot coal in a clay stove and pops tiny sparks. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 2.4 times wider than tall. It will be shown in the game at only 9 pixels tall (22 x 9 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark orange #7a2a12, orange #b0502a, orange #f08a4a. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/9 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 22 × 9 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-khan_lua.png](tham-chieu/tp-hats-khan_lua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ vây cá · Trang phục › Mũ
Mũ xanh có vây cao. Nét lạ: vây là cánh buồm thuyền nan.

```
A blue cap with a tall fin crest. Twist: the fin is the patched brown sail of a little bamboo boat. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.3 times wider than tall. It will be shown in the game at only 17 pixels tall (22 x 17 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light sky blue #8fd0ea, sky blue #3f8fb5, light sky blue #7fc4f2. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/17 of the height thick (exactly one game pixel), flat solid colors, at most 7 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 22 × 17 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-mu_vay_ca.png](tham-chieu/tp-hats-mu_vay_ca.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mũ tai cáo · Trang phục › Mũ
Mũ trùm cam có tai cáo. Nét lạ: tai đeo khuyên bạc kiểu người H'Mông.

```
An orange hood with tall fox ears. Twist: each ear wears a big silver Hmong-style hoop earring. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head. Proportions like the game: about 1.2 times taller than wide. It will be shown in the game at only 21 pixels tall (17 x 21 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): off-white #f0ece2, light grey #b8b0a8, white #ffffff. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/21 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 21 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hats-mu_tai_cao.png](tham-chieu/tp-hats-mu_tai_cao.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Trang phục · Áo

### Áo trùm · Trang phục › Áo
Áo trùm vải dài. Nét lạ: vạt áo vá chằng vá đụp bằng vải hoa.

```
A child's long hooded cloak body. Twist: it is covered with colorful patches of flowered cloth sewn on by grandma. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 13 pixels tall (13 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, dark red #8c1c1f, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 13 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_trum.png](tham-chieu/tp-robes-ao_trum.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo tơi lá · Trang phục › Áo
Áo tơi bằng lá cọ. Nét lạ: có ốc sên bò trên lá.

```
A short leaf raincoat (ao toi) made of palm leaves. Twist: a little snail is crawling on the leaves. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 14 pixels tall (15 x 14 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): yellow #d8b45c, brown #8f6c2a, tan #f8e6a4. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/14 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 15 × 14 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_toi.png](tham-chieu/tp-robes-ao_toi.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo the · Trang phục › Áo
Áo the dài đen. Nét lạ: hàng cúc là đồng xu lỗ vuông.

```
A traditional Vietnamese ao the tunic, short. Twist: the buttons are old square-holed coins. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 13 pixels tall (12 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark blue #2e2d55, blue #5c5a92, off-white #f6f0e2. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 12 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_the.png](tham-chieu/tp-robes-ao_the.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Giáp tre · Trang phục › Áo
Giáp đan tre. Nét lạ: nan tre đan như nong nia.

```
A bamboo plate armor vest. Twist: the bamboo is woven like a round rice-winnowing tray pattern. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about 1.2 times wider than tall. It will be shown in the game at only 13 pixels tall (15 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark golden #6c6a2c, golden #b4ae58, light yellow #e6e298. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 15 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-giap_tre.png](tham-chieu/tp-robes-giap_tre.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo da · Trang phục › Áo
Áo da thú. Nét lạ: may từ da trống cũ, giắt dùi trống bên hông.

```
A leather vest. Twist: it is made from an old drum skin with drum lacing, and a drumstick is tucked at the side. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about 1.2 times taller than wide. It will be shown in the game at only 13 pixels tall (11 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #8a5a34, dark brown #5a3822, off-white #f0ece2. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 11 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_da.png](tham-chieu/tp-robes-ao_da.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo lá · Trang phục › Áo
Áo kết bằng lá. Nét lạ: lá dong buộc lạt xanh như gói bánh chưng.

```
A vest made of big leaves. Twist: the leaves are dong leaves tied with green bamboo strips like a chung cake wrapping. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 14 pixels tall (15 x 14 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #479544, dark green #255a2c, green #8fd070. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/14 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 15 × 14 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_la.png](tham-chieu/tp-robes-ao_la.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Khố đô vật · Trang phục › Áo
Khố của đô vật làng. Nét lạ: thắt lưng khăn điều đeo lục lạc.

```
A village wrestler's loincloth and sash. Twist: the sash is a red ceremonial cloth with little jingle bells. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about 1.4 times wider than tall. It will be shown in the game at only 8 pixels tall (11 x 8 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #8c1c1f, red #d2362e, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/8 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 11 × 8 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-kho_vat.png](tham-chieu/tp-robes-kho_vat.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo vải thô · Trang phục › Áo
Áo vải nâu thô. Nét lạ: túi áo thò ra củ khoai lang.

```
A coarse brown cloth shirt. Twist: a sweet potato pokes out of the front pocket. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 12 pixels tall (12 x 12 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #7a6a4a, brown #a89872, cream #d8ccaa. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/12 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 12 × 12 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_vai.png](tham-chieu/tp-robes-ao_vai.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo da biển · Trang phục › Áo
Áo da cá biển. Nét lạ: cúc là vỏ sò, vạt vướng rong biển.

```
A sea-skin vest in teal. Twist: the buttons are seashells and strands of seaweed hang from the hem. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about 1.2 times taller than wide. It will be shown in the game at only 13 pixels tall (11 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): sky blue #4a7f9a, light sky blue #7fc4f2, dark sky blue #2a5a70. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 11 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_da_bien.png](tham-chieu/tp-robes-ao_da_bien.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo giáp đá · Trang phục › Áo
Giáp đá nứt có dung nham. Nét lạ: phiến đá là ngói vảy cá mái đình.

```
A grey stone armor vest with cracks of glowing lava. Twist: the stone plates are fish-scale roof tiles from a village communal house. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about 1.2 times wider than tall. It will be shown in the game at only 13 pixels tall (15 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark brown #5a4e4a, grey #8a7a74, light grey #bdb0a8. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 15 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-giap_da.png](tham-chieu/tp-robes-giap_da.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo vỏ cây · Trang phục › Áo
Giáp vỏ cây phủ rêu. Nét lạ: vỏ cây mọc nấm linh chi.

```
A tree bark armor vest with moss. Twist: a shiny red lingzhi mushroom grows on the chest. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 16 pixels tall (15 x 16 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark brown #4a3018, brown #7a5632, green #479544. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/16 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 15 × 16 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_vo_cay.png](tham-chieu/tp-robes-ao_vo_cay.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo vảy · Trang phục › Áo
Giáp vảy cá xanh. Nét lạ: vảy là đồng xu đồng xếp lớp.

```
A blue fish-scale armor vest. Twist: the scales are overlapping bronze coins. Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 12 pixels tall (12 x 12 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): sky blue #3f8fb5, light sky blue #8fd0ea, dark sky blue #1f5f85. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/12 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 12 × 12 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_vay.png](tham-chieu/tp-robes-ao_vay.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo lông trắng · Trang phục › Áo
Áo lông trắng ngắn. Nét lạ: lông là bông lau ven sông.

```
A short fluffy white fur coat. Twist: the fluff is made of white riverside reed flowers (bong lau). Clothing item shown alone, not worn, nobody inside it, 3/4 view turned to the RIGHT (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body. Proportions like the game: about as wide as tall. It will be shown in the game at only 14 pixels tall (15 x 14 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): off-white #f0ece2, light grey #b8b0a8, white #ffffff. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/14 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 15 × 14 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-robes-ao_long.png](tham-chieu/tp-robes-ao_long.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Trang phục · Đồ đeo lưng

### Bầu hồ lô · Trang phục › Đồ đeo lưng
Bầu hồ lô đeo dây. Nét lạ: nút là bắp ngô, treo gáo dừa.

```
A calabash gourd bottle on a strap. Twist: corked with a corn cob, with a coconut-shell ladle hanging from it. Back item shown alone, nobody wearing it, 3/4 view turned to the RIGHT, standing upright as it would hang on a small child's back. Proportions like the game: about 1.4 times taller than wide. It will be shown in the game at only 28 pixels tall (20 x 28 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #e09c4a, brown #a8642a, tan #f9d08c. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/28 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 20 × 28 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-backs-ho_lo.png](tham-chieu/tp-backs-ho_lo.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Ống tên · Trang phục › Đồ đeo lưng
Ống tên tre. Nét lạ: đuôi tên là lông gà.

```
A bamboo arrow quiver with arrows. Twist: the arrow fletchings are fluffy chicken feathers. Back item shown alone, nobody wearing it, 3/4 view turned to the RIGHT, standing upright as it would hang on a small child's back. Proportions like the game: about as wide as tall. It will be shown in the game at only 18 pixels tall (18 x 18 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #8a5a34, dark brown #5a3822, orange #b78350. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/18 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 18 × 18 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-backs-ong_ten.png](tham-chieu/tp-backs-ong_ten.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Áo choàng · Trang phục › Đồ đeo lưng
Áo choàng ngắn bay. Nét lạ: là lá cờ hội làng ngũ sắc.

```
A short flowing cape. Twist: it is a five-colored village festival flag with a fringe. Back item shown alone, nobody wearing it, 3/4 view turned to the RIGHT, standing upright as it would hang on a small child's back. Proportions like the game: about 1.2 times taller than wide. It will be shown in the game at only 15 pixels tall (13 x 15 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, dark red #8c1c1f, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/15 of the height thick (exactly one game pixel), flat solid colors, at most 7 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 13 × 15 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-backs-ao_choang.png](tham-chieu/tp-backs-ao_choang.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Gùi tre · Trang phục › Đồ đeo lưng
Gùi đan tre. Nét lạ: trong gùi có bó rau rừng và gà con thò đầu.

```
A woven bamboo back basket (gui). Twist: wild greens stick out of it and a baby chick peeks over the rim. Back item shown alone, nobody wearing it, 3/4 view turned to the RIGHT, standing upright as it would hang on a small child's back. Proportions like the game: about 1.3 times taller than wide. It will be shown in the game at only 16 pixels tall (12 x 16 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): golden #b4ae58, dark golden #6c6a2c, light yellow #e6e298. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/16 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 12 × 16 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-backs-gui_tre.png](tham-chieu/tp-backs-gui_tre.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Khăn choàng sương · Trang phục › Đồ đeo lưng
Khăn choàng xanh sương. Nét lạ: khăn đọng giọt sương như chuỗi ngọc.

```
A pale blue misty shawl. Twist: dew drops hang along its edge like a string of pearls. Back item shown alone, nobody wearing it, 3/4 view turned to the RIGHT, standing upright as it would hang on a small child's back. Proportions like the game: about as wide as tall. It will be shown in the game at only 16 pixels tall (18 x 16 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): white #eafcff, blue #2f62ad, sky blue #4a7f9a. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/16 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 18 × 16 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-backs-khan_bang.png](tham-chieu/tp-backs-khan_bang.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Trống đồng nhỏ · Trang phục › Đồ đeo lưng
Trống đồng đeo lưng. Nét lạ: mặt trống có con cóc ngồi (cóc kiện trời).

```
A tiny Dong Son bronze drum carried on the back. Twist: a toad sits proudly on the drum face, from the tale of the toad who sued the Sky. Back item shown alone, nobody wearing it, 3/4 view turned to the RIGHT, standing upright as it would hang on a small child's back. Proportions like the game: about 1.6 times taller than wide. It will be shown in the game at only 25 pixels tall (16 x 25 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #754418, orange #c4853a, tan #ffe9a0. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/25 of the height thick (exactly one game pixel), flat solid colors, at most 10 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 16 × 25 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-backs-trong_nho.png](tham-chieu/tp-backs-trong_nho.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Trang phục · Bùa và vật cầm tay

### Búa rèn tí hon · Trang phục › Bùa và vật cầm tay
Búa rèn nhỏ cầm tay. Nét lạ: cán là cây đũa cả.

```
A small blacksmith hammer to hold in one hand. Twist: the handle is a big flat rice-paddle chopstick (dua ca). Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 1.6 times taller than wide. It will be shown in the game at only 11 pixels tall (7 x 11 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): grey-blue #5f6b84, dark brown #5a3822, white #f4f8ff. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/11 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 7 × 11 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_con.png](tham-chieu/tp-hands-bua_con.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Găng đồng · Trang phục › Bùa và vật cầm tay
Găng tay bằng đồng. Nét lạ: hoa văn trống đồng, đầu ngón là chuông nhỏ.

```
A bronze gauntlet glove with drum patterns. Twist: each fingertip ends in a tiny bronze bell. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.8 times wider than tall. It will be shown in the game at only 5 pixels tall (14 x 5 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #754418, tan #f6d07c, orange #c4853a. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/6 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 14 × 5 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-gang_dong.png](tham-chieu/tp-hands-gang_dong.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa nanh rắn · Trang phục › Bùa và vật cầm tay
Bùa nanh rắn tua đỏ. Nét lạ: nanh ngậm viên ngọc xanh.

```
A snake fang charm on a string with a red tassel. Twist: the fang holds a small green jade bead. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light red #f47a62, off-white #fffaf0, brown #a89c84. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_nanh.png](tham-chieu/tp-hands-bua_nanh.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa vỏ ốc · Trang phục › Bùa và vật cầm tay
Bùa vỏ ốc tua đỏ. Nét lạ: vỏ ốc là tù và thổi được.

```
A round sea shell charm with a red tassel. Twist: the shell is a little conch horn (tu va) with a mouthpiece. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light red #f47a62, dark brown #5a3822, blue #2f62ad. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_oc.png](tham-chieu/tp-hands-bua_oc.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa đá lửa · Trang phục › Bùa và vật cầm tay
Bùa đá lửa vuông. Nét lạ: đá lửa đặt trong đèn dầu nhỏ.

```
A square fire stone charm with a red tassel. Twist: the stone sits inside a tiny glass oil lamp like grandma's. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #a32418, light red #f47a62, yellow #ffc64c. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_lua.png](tham-chieu/tp-hands-bua_lua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa hút máu · Trang phục › Bùa và vật cầm tay
Bùa đỏ sẫm. Nét lạ: hình con đỉa cuộn ngậm hạt đỏ.

```
A dark red charm. Twist: it is a curled leech holding a red bead in its mouth. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light red #f47a62, dark red #8c1c1f, red #d2362e. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_hut.png](tham-chieu/tp-hands-bua_hut.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa tàn lửa · Trang phục › Bùa và vật cầm tay
Bùa có tàn lửa. Nét lạ: nén hương cháy dở cắm trong bát hương nhỏ.

```
An ember charm. Twist: a half-burnt incense stick stands in a tiny incense bowl, smoke curling up. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light red #f47a62, dark brown #5a3822, dark orange #7a2a12. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_tan.png](tham-chieu/tp-hands-bua_tan.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa sương · Trang phục › Bùa và vật cầm tay
Bùa xanh lạnh. Nét lạ: giọt sương đọng trên lá sen nhỏ.

```
A cool blue charm. Twist: a big dew drop rests on a tiny lotus leaf. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark blue #27407f, light red #f47a62, light blue #86a8f0. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_suong.png](tham-chieu/tp-hands-bua_suong.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa tham · Trang phục › Bùa và vật cầm tay
Bùa vàng. Nét lạ: cóc ngậm đồng xu.

```
A golden luck charm. Twist: a little toad holding an old coin in its mouth. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light red #f47a62, dark brown #5a3822, brown #9c7426. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 9 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_tham.png](tham-chieu/tp-hands-bua_tham.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bùa linh · Trang phục › Bùa và vật cầm tay
Bùa giấy linh thiêng. Nét lạ: lá bùa vàng buộc túi gạo muối.

```
A sacred paper talisman charm, yellow paper with red marks, no letters. Twist: a tiny cloth pouch of rice and salt is tied to it. Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top. Proportions like the game: about 2.6 times taller than wide. It will be shown in the game at only 13 pixels tall (5 x 13 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): indigo #a56fd0, dark indigo #3d1d55, light red #f47a62. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/13 of the height thick (exactly one game pixel), flat solid colors, at most 8 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 5 × 13 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-hands-bua_linh.png](tham-chieu/tp-hands-bua_linh.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Trang phục · Dấu mặt nạ

Dấu vẽ lên mặt em bé, rất nhỏ: một hình đơn giản, đậm.

### Dấu lửa · Trang phục › Dấu mặt nạ
Vệt sơn lửa trên mặt. Nét lạ: ngọn lửa hình đèn lồng giấy.

```
A small face-paint mark of a flame. Twist: the flame is shaped like a little paper lantern. A small face-paint mark shown alone and flat, front view, no face and no person around it. Proportions like the game: about as wide as tall. It will be shown in the game at only 4 pixels tall (4 x 4 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e, tan #ffe9a0. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/6 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 4 × 4 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-masks-lua.png](tham-chieu/tp-masks-lua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Dấu lá · Trang phục › Dấu mặt nạ
Vệt sơn lá trên mặt. Nét lạ: là chiếc lá đa của chú Cuội.

```
A small face-paint mark of a green leaf. Twist: it is a banyan leaf like the one from the Cuoi legend. A small face-paint mark shown alone and flat, front view, no face and no person around it. Proportions like the game: about 1.4 times wider than tall. It will be shown in the game at only 8 pixels tall (11 x 8 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): green #479544. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/8 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 11 × 8 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-masks-la.png](tham-chieu/tp-masks-la.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Dấu nước · Trang phục › Dấu mặt nạ
Vệt sơn xoáy nước. Nét lạ: sóng nước như hoa văn trống đồng.

```
A small face-paint mark of a water swirl. Twist: the swirl is drawn like the wave pattern on a Dong Son drum. A small face-paint mark shown alone and flat, front view, no face and no person around it. Proportions like the game: about as wide as tall. It will be shown in the game at only 4 pixels tall (4 x 4 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): blue #4468c0, light blue #86a8f0. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/6 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 4 × 4 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-masks-xoay.png](tham-chieu/tp-masks-xoay.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Dấu đô vật · Trang phục › Dấu mặt nạ
Vạch sơn đô vật. Nét lạ: vạch kẻ như hoá trang tuồng.

```
Small bold face-paint stripes of a wrestler. Twist: painted like Vietnamese tuong opera makeup, red and black. A small face-paint mark shown alone and flat, front view, no face and no person around it. Proportions like the game: about 2 times wider than tall. It will be shown in the game at only 5 pixels tall (10 x 5 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): red #d2362e. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/6 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 10 × 5 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-masks-du.png](tham-chieu/tp-masks-du.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mặt nạ hổ · Trang phục › Dấu mặt nạ
Mặt nạ hổ che mặt. Nét lạ: hổ tranh Đông Hồ mắt tròn to.

```
A small tiger face mask. Twist: in the Dong Ho folk painting style, with big round goofy eyes and curly stripes. A small face-paint mark shown alone and flat, front view, no face and no person around it. Proportions like the game: about 1.2 times wider than tall. It will be shown in the game at only 9 pixels tall (11 x 9 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #dd7c2a. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/9 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 11 × 9 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-masks-ho.png](tham-chieu/tp-masks-ho.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Trang phục · Cánh

Vẽ MỘT bên cánh, gốc cánh ở góc dưới bên phải; game tự vẽ cánh xa và cho cánh vỗ.

### Cánh chuồn chuồn · Trang phục › Cánh
Cánh mỏng xanh nhạt. Nét lạ: gân cánh là nan quạt giấy.

```
A single dragonfly wing, transparent pale blue. Twist: the veins are the bamboo ribs of a paper hand fan. ONE single wing only, the wing root at the bottom right corner, the wing spreading up and to the left. Proportions like the game: about as wide as tall. It will be shown in the game at only 17 pixels tall (17 x 17 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light grey-blue #a8dcf0, blue #5a8fb8, white #f0fcff. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/17 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 17 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-wings-chuon.png](tham-chieu/tp-wings-chuon.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cánh lá · Trang phục › Cánh
Cánh bằng lá xanh. Nét lạ: lá bàng đỏ mùa thu xếp lớp.

```
A single wing made of leaves. Twist: the leaves are red autumn Indian almond (bang) leaves layered like feathers. ONE single wing only, the wing root at the bottom right corner, the wing spreading up and to the left. Proportions like the game: about as wide as tall. It will be shown in the game at only 17 pixels tall (17 x 17 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark green #255a2c, green #479544, green #8fd070. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/17 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 17 × 17 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-wings-la.png](tham-chieu/tp-wings-la.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cánh lửa · Trang phục › Cánh
Cánh bằng lửa. Nét lạ: lửa tóe sao như que pháo bông.

```
A single wing made of flames, orange and yellow. Twist: the feather tips sparkle like handheld sparkler fireworks. ONE single wing only, the wing root at the bottom right corner, the wing spreading up and to the left. Proportions like the game: about as wide as tall. It will be shown in the game at only 19 pixels tall (18 x 19 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): orange #f2622a, red #a32418, yellow #ffc64c. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/19 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 18 × 19 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-wings-lua.png](tham-chieu/tp-wings-lua.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Cánh băng · Trang phục › Cánh
Cánh bằng mảnh băng. Nét lạ: mảnh băng là những que kem cây.

```
A single wing made of ice shards, pale blue and white. Twist: the shards are shaped like ice pops on little wooden sticks. ONE single wing only, the wing root at the bottom right corner, the wing spreading up and to the left. Proportions like the game: about as wide as tall. It will be shown in the game at only 18 pixels tall (18 x 18 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): light sky blue #7fc4f2, blue #2f62ad, white #ffffff. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: one clean dark plum outline (#1b1118) all around the shape, about 1/18 of the height thick (exactly one game pixel), flat solid colors, at most 6 colors, simple 3-tone cel shading (dark, base, light) with light from the top right, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: kéo đặt lên em bé mẫu · Cỡ trong game: 18 × 18 điểm ảnh · Ảnh tham chiếu: [tham-chieu/tp-wings-bang.png](tham-chieu/tp-wings-bang.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Đồ và tài nguyên

Một hình dùng cho mọi chỗ: dải tài nguyên ở góc trên màn hình, Hành trang, giá bán, đồ rơi trên sàn.

### Vàng (xu) · Đồ và tài nguyên
Đồng xu vàng. Nét lạ: đồng tiền lỗ vuông xâu dây đỏ lì xì.

```
A gold coin. Twist: an old square-holed coin threaded on a red lucky-money string. Tiny game icon in flat front view: it is shown in the game at only 7 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): yellow #ffd23f, yellow #e0a020, cream #fff6c0. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#7a4a10) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-gold.png](tham-chieu/vp-gold.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Bình máu · Đồ và tài nguyên
Bình thuốc đỏ. Nét lạ: bình là quả bầu nậm, nút lá chuối.

```
A red health potion. Twist: the bottle is a little gourd flask corked with a rolled banana leaf. Tiny game icon in flat front view: it is shown in the game at only 8 x 9 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): red #c4202c, light grey #e8e0d0, red #ff5a5a. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#14182e) all around the shape, about 1/9 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 8 × 9 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-potion.png](tham-chieu/vp-potion.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Linh khí Lửa · Đồ và tài nguyên
Viên ngọc lửa cam. Nét lạ: bên trong cuộn con phượng nhỏ.

```
A glowing orange fire spirit orb. Twist: a tiny phoenix is curled up inside it. Tiny game icon in flat front view: it is shown in the game at only 10 x 10 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): orange #ff7a2a, yellow #ffd23f, white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#a8320a) all around the shape, about 1/10 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 10 × 10 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-linhkhi-fire.png](tham-chieu/vp-linhkhi-fire.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Linh khí Độc · Đồ và tài nguyên
Viên ngọc độc xanh. Nét lạ: bên trong cuộn con rắn lục nhỏ.

```
A glowing green poison spirit orb. Twist: a tiny green snake is curled up inside it. Tiny game icon in flat front view: it is shown in the game at only 10 x 10 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): green #6fcf3a, light yellow-green #c2f58a, white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#2f6b1a) all around the shape, about 1/10 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 10 × 10 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-linhkhi-poison.png](tham-chieu/vp-linhkhi-poison.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Linh khí Băng · Đồ và tài nguyên
Viên ngọc băng xanh nhạt. Nét lạ: bên trong có bông tuyết hình hoa mai.

```
A glowing pale blue ice spirit orb. Twist: a snowflake shaped like a five-petal apricot blossom (hoa mai) inside. Tiny game icon in flat front view: it is shown in the game at only 10 x 10 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): light sky blue #7fd4ff, white #e9f9ff, white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#2b6ea3) all around the shape, about 1/10 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 10 × 10 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-linhkhi-ice.png](tham-chieu/vp-linhkhi-ice.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Quặng · Đồ và tài nguyên
Cục quặng bạc. Nét lạ: có cuốc chim nhỏ cắm vào.

```
A chunk of silver iron ore. Twist: a tiny pickaxe is stuck in it. Tiny game icon in flat front view: it is shown in the game at only 7 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): light grey #c9ccd2, grey #8a8f98, white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#2a2e36) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-ore.png](tham-chieu/vp-ore.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Đá tôi · Đồ và tài nguyên
Viên đá tím để tôi vũ khí. Nét lạ: đá mài vuông buộc lạt như bánh chưng.

```
A purple tempering stone. Twist: square and tied with green bamboo strips like a chung cake. Tiny game icon in flat front view: it is shown in the game at only 7 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): light purple #d48af5, purple #8a4ab0, white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#34143f) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-stone.png](tham-chieu/vp-stone.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Gỗ linh (Rừng già) · Đồ và tài nguyên
Khúc gỗ có mầm. Nét lạ: vân gỗ thành mặt cười.

```
A log of magic spirit wood with a green sprout. Twist: the wood grain on the cut end forms a smiling face. Tiny game icon in flat front view: it is shown in the game at only 7 x 6 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about 1.2 times wider than tall. Main colors as in the game (the twist detail may add its own colors): brown #a06a3a, yellow-green #9bd14a, tan #f0d090. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#2e1c10) all around the shape, about 1/6 of the height thick (exactly one game pixel), flat solid colors, at most 5 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 6 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-mat0.png](tham-chieu/vp-mat0.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Vảy cá (Hang biển) · Đồ và tài nguyên
Vảy cá xanh óng. Nét lạ: vảy khảm xà cừ óng ánh cầu vồng.

```
A shiny blue fish scale. Twist: inlaid with rainbow mother-of-pearl like Vietnamese xa cu lacquer art. Tiny game icon in flat front view: it is shown in the game at only 7 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): light sky blue #7fd4ff, blue #3f8be0, white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#143a6a) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-mat1.png](tham-chieu/vp-mat1.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Đá lửa (Lâu đài cổ) · Đồ và tài nguyên
Viên đá đỏ phát sáng. Nét lạ: đặt trên kiềng ba chân nhỏ.

```
A glowing red fire stone. Twist: it sits on a tiny three-legged iron cooking stand (kieng). Tiny game icon in flat front view: it is shown in the game at only 7 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): orange #ff7a2a, tan #ffe07a, orange #ffb040. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#4a1408) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-mat2.png](tham-chieu/vp-mat2.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mảnh Mộc Tinh · Đồ và tài nguyên
Mảnh trùm vùng Rừng già. Nét lạ: mảnh có vòng tuổi cây và chuông gió.

```
A green crystal shard from a tree spirit boss. Twist: tree rings inside it and a tiny wind chime hanging off it. Tiny game icon in flat front view: it is shown in the game at only 6 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about 1.2 times taller than wide. Main colors as in the game (the twist detail may add its own colors): yellow-green #8ac84a, light grey-green #eaffc0, dark green #4a8a2a. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#1e3a12) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 6 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-shard0.png](tham-chieu/vp-shard0.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mảnh Ngư Tinh · Đồ và tài nguyên
Mảnh trùm vùng Hang biển. Nét lạ: là mảnh gốm men lam vỡ có vảy.

```
A blue crystal shard from a sea serpent boss. Twist: it is a broken piece of blue-and-white ceramic with scale patterns. Tiny game icon in flat front view: it is shown in the game at only 6 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about 1.2 times taller than wide. Main colors as in the game (the twist detail may add its own colors): blue #5ab0f0, white #e0f4ff, blue #2a6ab0. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#12284a) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 6 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-shard1.png](tham-chieu/vp-shard1.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Mảnh Hồ Tinh · Đồ và tài nguyên
Mảnh trùm vùng Lâu đài cổ. Nét lạ: bốc lửa hồ ly tím, buộc tua lụa.

```
An orange crystal shard from a nine-tailed fox boss. Twist: violet foxfire flickers on it and a silk ribbon is tied around it. Tiny game icon in flat front view: it is shown in the game at only 6 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about 1.2 times taller than wide. Main colors as in the game (the twist detail may add its own colors): orange #ff8a4a, cream #fff0d0, orange #c04a1a. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#4a1a08) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 6 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-shard2.png](tham-chieu/vp-shard2.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

### Kinh nghiệm · Đồ và tài nguyên
Ngôi sao xanh. Nét lạ: sao như đèn ông sao tí hon.

```
A small glowing blue star. Twist: shaped like a tiny five-pointed star lantern with a stick. Tiny game icon in flat front view: it is shown in the game at only 7 x 7 pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. Proportions like the game: about as wide as tall. Main colors as in the game (the twist detail may add its own colors): white #ffffff. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: one clean dark outline (#8fd0ff) all around the shape, about 1/7 of the height thick (exactly one game pixel), flat solid colors, at most 4 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Không cần khung: chỉ đưa hình vào · Cỡ trong game: 7 × 7 điểm ảnh · Ảnh tham chiếu: [tham-chieu/vp-xp.png](tham-chieu/vp-xp.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this item in the same angle and proportions, keep colors`

---

## Người làng

Dùng khung **Người** như quái hai chân, có hai động tác: **Đứng thở** và **Nói chuyện, vẫy tay** (khi em bé tới gần và trong khung nói chuyện). Người làng trong game có **khuôn mặt mặt nạ tinh linh trắng**, prompt đã giữ ý đó.

### Chú Lái Đò · Người làng (khung: Người)
Người chèo đò, nón lá, áo nâu, cầm sào. Nét lạ: chim cốc đậu trên vai, sào treo đèn bão.

```
A friendly ferryman in a brown peasant shirt and a conical leaf hat, holding a long bamboo pole. Twist: a black cormorant bird perches on his shoulder, and a little hurricane lamp hangs from the pole. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.4 times taller than wide. It will be shown in the game at only 40 pixels tall (29 x 40 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): brown #8a5632, off-white #f4eee0, tan #b8a45a, light grey #d9cfbb; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/40 of the height thick (exactly one game pixel), flat solid colors, at most 15 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 29 × 40 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-lai.png](tham-chieu/nl-lai.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Ông Thợ Rèn · Người làng (khung: Người)
Ông già râu bạc, tạp dề da, cầm búa. Nét lạ: chòm râu cháy xém đỏ như than, đeo kính làm bằng hai đồng xu.

```
An old village blacksmith with a white beard, leather apron, red headscarf, holding a hammer. Twist: the tip of his beard glows like a hot coal, and his goggles are two old coins with holes. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.4 times taller than wide. It will be shown in the game at only 40 pixels tall (28 x 40 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark red #3a2a26, orange #9a4a30, dark orange #7a3622, off-white #f4eee0; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/40 of the height thick (exactly one game pixel), flat solid colors, at most 19 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 28 × 40 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-ren.png](tham-chieu/nl-ren.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Bà Hàng Xén · Người làng (khung: Người)
Bà bán hàng, khăn mỏ quạ, gánh hàng. Nét lạ: trong thúng có con mèo ngủ giữa đồ lặt vặt.

```
A cheerful old market woman in a brown blouse and a black crow-beak headscarf, carrying a shoulder pole with two baskets of small goods. Twist: a cat is asleep in one basket among combs, threads and candies. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.5 times taller than wide. It will be shown in the game at only 29 pixels tall (19 x 29 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey-purple #2e2838, off-white #f4eee0, brown #8a5a38, green #6fb060; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/29 of the height thick (exactly one game pixel), flat solid colors, at most 14 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 19 × 29 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-xen.png](tham-chieu/nl-xen.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cô Thợ May · Người làng (khung: Người)
Cô gái áo dài hồng, thước dây. Nét lạ: búi tóc cắm kim và cuộn chỉ, thước dây quàng như khăn.

```
A young village tailor in a pink ao dai, a tape measure in hand. Twist: needles and a spool of thread are stuck in her hair bun, and the tape measure is worn like a scarf. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.4 times taller than wide. It will be shown in the game at only 33 pixels tall (24 x 33 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark grey-purple #2e2838, off-white #f4eee0, red #d86a7a, red #b04a5e; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/33 of the height thick (exactly one game pixel), flat solid colors, at most 13 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 24 × 33 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-may.png](tham-chieu/nl-may.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Cụ Đồ · Người làng (khung: Người)
Cụ già áo the xanh, râu dài, bút lông. Nét lạ: râu dài buộc nơ đỏ, sau lưng cuộn câu đối đỏ (không chữ).

```
An old village scholar in a dark blue ao the robe and black khan xep turban, long white beard, holding a calligraphy brush. Twist: his very long beard is tied with a red ribbon, and a rolled red couplet scroll (no letters) sticks out behind his back. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.3 times taller than wide. It will be shown in the game at only 28 pixels tall (21 x 28 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): dark blue #363e6c, off-white #f4eee0, dark blue #4a548c, off-white #fbf7ee; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/28 of the height thick (exactly one game pixel), flat solid colors, at most 12 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 21 × 28 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-do.png](tham-chieu/nl-do.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Ông Từ · Người làng (khung: Người)
Ông giữ đình, áo vàng nâu, cầm chổi. Nét lạ: chổi là bó rơm cả bông lúa, mèo đình ngủ trên mũ.

```
An old temple keeper in a mustard-yellow robe and red-brown turban, holding a broom. Twist: the broom is a bundle of rice straw still with grain heads, and a temple cat naps on top of his turban. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.2 times taller than wide. It will be shown in the game at only 32 pixels tall (26 x 32 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): yellow #d0a440, off-white #f4eee0, dark red #7a3a2a, brown #a87e2a; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/32 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 26 × 32 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-tu.png](tham-chieu/nl-tu.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`

### Anh Mõ · Người làng (khung: Người)
Anh rao làng, áo xanh, gõ mõ. Nét lạ: cầm loa cuộn bằng nón lá để rao.

```
A young village crier in a teal shirt and blue cap, holding a wooden slit drum (mo) and a stick. Twist: he shouts through a megaphone made from a rolled-up conical leaf hat. Front view facing the viewer (turned only slightly to the right), standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso (hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both feet flat on the same bottom line, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is about 1.2 times taller than wide. It will be shown in the game at only 31 pixels tall (25 x 31 pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): off-white #f4eee0, teal #3f9a8c, dark blue #3a4a8a, dark teal #2c7468; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: one clean dark purple outline (#1a1420) all around the shape, about 1/31 of the height thick (exactly one game pixel), flat solid colors, at most 16 colors, simple 3-tone cel shading (dark, base, light) with light from the top, no gradients, no glow, no blur, no anti-aliasing. Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), nothing else: no ground, no shadow, no scenery, no text, no frame.
```

- Khung trong Xưởng: **Người (2 chân)** · Cỡ trong game: 25 × 31 điểm ảnh · Ảnh tham chiếu: [tham-chieu/nl-mo.png](tham-chieu/nl-mo.png)
- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `redraw this character in the same pose and proportions, keep colors`
