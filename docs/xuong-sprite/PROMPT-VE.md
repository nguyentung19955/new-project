# Prompt vẽ quái và em bé cho Xưởng Sprite

Tệp này là các câu mô tả (prompt) để bạn dán vào công cụ vẽ bằng AI (ChatGPT, Gemini, Midjourney...), hoặc đưa cho người vẽ tay. Hình vẽ ra sẽ đưa vào **Xưởng Sprite** (spiritblade.web.app/xuong-sprite.html), sau đó tải tệp `.sprite.json` về và gửi Claude để đưa vào game.

## Cách dùng

1. Chép **một** prompt của con bạn muốn vẽ, rồi dán **thêm đoạn "Phong cách chung" vào cuối**.
2. Prompt viết bằng tiếng Anh vì các công cụ vẽ AI hiểu tiếng Anh tốt nhất. Dòng tiếng Việt bên trên mỗi prompt là để bạn biết con đó trông thế nào.
3. Vẽ xong, kiểm tra lại:
   - con vật **quay sang phải**, nhìn ngang;
   - nền **trắng trơn**;
   - chỉ có **một con**;
   - tay, chân, đuôi, cánh **tách khỏi thân** một chút.
4. Đưa vào Xưởng và chọn **khung cơ thể** đúng như cột "Khung" ghi bên dưới.

## Phong cách chung (dán vào cuối mọi prompt)

```
Style: cute chibi creature for a 2D pixel-art action game inspired by Vietnamese folklore, side view, facing RIGHT, full body, centered, single character only, plain flat WHITE background, no shadow on the ground, no text, no frame. Bold dark outline, flat cel colors, limited palette (8–12 colors), big head and big readable eyes, chunky simple shapes that still read at 32 pixels tall. Limbs, tail and wings slightly separated from the body. Clean, crisp, high contrast.
```

Muốn ra luôn hình pixel thì thêm: `pixel art, 64x64 sprite, no anti-aliasing`. Hình thường cũng được, Xưởng sẽ tự chuyển sang pixel.

---

## Em bé (nhân vật chính)

Bốn em bé cùng một dáng: trẻ con đội mũ trùm có hai tai nhọn, mặt tròn mắt to, cầm vũ khí. Chỉ khác màu áo và đồ mang theo. **Khung: Người.** Cao khoảng 28 điểm ảnh.

**Thợ Rèn**: áo trùm đỏ, búa nhỏ đeo hông.
```
A small child hero wearing a red hooded cloak with two pointed ear tips on the hood, round pale face, big dark eyes, small blacksmith hammer on the belt, sturdy little boots, arms slightly away from the body, empty hands ready to hold a weapon
```

**Thợ Săn**: áo trùm xanh lá, ống tên sau lưng.
```
A small child hero wearing a forest-green hooded cloak with two pointed ear tips, round face, big eyes, a quiver of arrows on the back, light leather boots, nimble pose, empty hands ready to hold a weapon
```

**Thầy Lang**: áo trùm xanh lam, túi thuốc, lá thuốc cài mũ.
```
A small child healer wearing a blue hooded cloak with two pointed ear tips, round face, big kind eyes, a small herb pouch at the waist and a green leaf tucked in the hood, calm pose, empty hands ready to hold a weapon
```

**Đô Vật**: áo trùm cam, người to chắc, đai vải.
```
A small but stocky child wrestler wearing an orange hooded cloak with two pointed ear tips, round face, determined big eyes, thick cloth belt, wide stance, strong little arms
```

---

## Rừng già (hệ Độc, màu xanh lá, tím)

| Tên | Khung | Prompt |
|---|---|---|
| **Heo Rừng Con**: lợn rừng nhỏ lông nâu, bờm cỏ trên lưng | Bốn chân | `A small wild boar piglet, brown fur with a mossy grass mane along its back, short tusks, stubby legs, charging-ready stance` |
| **Bầy Ong Vò Vẽ**: một đám ong vàng đen bay sát nhau | Cá/chim bay | `A tight cluster of three angry yellow-and-black hornets flying together as one swarm, translucent wings, small stingers` |
| **Bọ Hung Mai Cứng**: bọ hung mai xanh bóng như cái khiên | Cua/bọ | `A stout rhinoceros beetle with a shiny green shell like a shield, one big horn, six short legs, armored and slow` |
| **Hoa Phun Bào Tử**: hoa ăn thịt miệng to, phun bào tử | Cây/đứng yên | `A carnivorous flower plant with a wide toothy purple mouth, green leaves and vines as arms, puffs of glowing spores, rooted in the ground` |
| **Chồn Bóng**: chồn đen tím, thân dài, lẩn trong bóng | Bốn chân | `A sleek shadow weasel, long low body, dark purple-black fur with faint violet glow, glowing eyes, long tail, sneaky crouch` |
| **Nấm Phồng**: nấm mũ tím đốm trắng, bụng phồng | Khối mềm | `A small round mushroom creature with a purple spotted cap, puffed-up swollen body, tiny feet, nervous face, about to burst` |
| **Sóc Ném Quả Nổ**: sóc cam ôm quả nổ có ngòi | Bốn chân | `An orange squirrel with a huge fluffy tail holding a round fused bomb-fruit in its paws, mischievous grin` |
| **Nhím Gai Độc**: nhím lưng gai tím độc | Bốn chân | `A hedgehog-porcupine with long purple poisonous quills on its back, dark brown body, small snout, quills raised` |
| **Heo Rừng Nanh Dài** (tinh anh) | Bốn chân | `A big elite wild boar, dark brown bristly fur, very long curved ivory tusks, scarred face, red eyes, heavy muscular body, mossy mane` |
| **Nấm Phồng Chúa** (tinh anh) | Khối mềm | `A large king mushroom creature with a wide purple spotted cap like a crown, glowing toxic spores floating around, thick stem body, small angry face` |
| **Nấm Chúa** (trùm nhỏ) | Khối mềm | `A giant ancient mushroom lord, layered purple and green cap with glowing spots, stubby root legs, wise but menacing face, toxic mist around` |
| **Mộc Tinh** (trùm vùng) | Cây/đứng yên | `A giant tree spirit, gnarled old trunk with an angry carved face, glowing green eyes, branch arms with leaves, thick roots as legs, hanging vines and yellow paper talismans, Vietnamese folklore` |

## Hang biển (hệ Băng, màu xanh biển, trắng)

| Tên | Khung | Prompt |
|---|---|---|
| **Cua Lính**: cua xanh lam, hai càng to | Cua/bọ | `A blue soldier crab with two big raised claws, small eye stalks, sideways stance, tiny helmet-like shell` |
| **Bầy Cá Con**: đàn cá nhỏ bơi sát nhau | Cá/chim bay | `A small school of three little blue and orange fish swimming together as one group` |
| **Ốc Mượn Hồn**: ốc mượn hồn đội vỏ xoắn có gai | Cua/bọ | `A hermit crab peeking out of a big spiral spiky seashell, red claws in front, the shell used like a shield` |
| **Hải Quỳ**: hải quỳ nhiều xúc tu trên đá | Cây/đứng yên | `A sea anemone creature on a rock, many waving pink and teal tentacles, a round mouth in the center, blowing bubbles` |
| **Cá Chuồn**: cá chuồn vây dài như cánh | Cá/chim bay | `A flying fish with long wing-like pectoral fins, sleek silver-blue body, leaping pose` |
| **Cá Nóc**: cá nóc tròn có gai | Khối mềm | `A round pufferfish fully inflated with short spikes, worried face, tiny fins` |
| **Sứa Bom**: sứa trong suốt mang quả bom nước | Khối mềm | `A translucent blue jellyfish with dangling tentacles carrying a glowing round water-bomb` |
| **Nhím Biển**: cầu gai tím tối, gai dài | Khối mềm | `A dark purple sea urchin creature, long sharp spines all around, two small eyes peeking out` |
| **Cua Tướng** (tinh anh) | Cua/bọ | `A big general crab in red-orange armor-like shell, huge serrated claws, battle scars, commanding stance` |
| **Cá Nóc Chúa** (tinh anh) | Khối mềm | `A large king pufferfish, icy blue with frost-white spikes, small crown-shaped fin, inflated and furious` |
| **Cua Đá** (trùm nhỏ) | Cua/bọ | `A giant rock crab whose shell is made of grey stone with crystals growing on it, massive claws, slow and heavy` |
| **Ngư Tinh** (trùm vùng) | Rắn | `A giant sea serpent fish spirit from Vietnamese folklore, long scaly body, fins like a dragon, icy blue and silver scales, big jaws with fangs, glowing eyes, water swirling around` |

## Lâu đài cổ (hệ Lửa, màu đỏ cam, xám đá)

| Tên | Khung | Prompt |
|---|---|---|
| **Lính Ma Giáp Gỉ**: bộ giáp gỉ trống rỗng, mắt lửa | Người | `An empty rusty suit of ancient armor animated by a ghost, glowing orange eyes inside the helmet, holding a chipped sword, slightly hunched` |
| **Bầy Dơi Than**: đàn dơi đen viền than hồng | Cá/chim bay | `A small swarm of three black bats with glowing ember-red edges on their wings, flying together` |
| **Tượng Đá Cầm Khiên**: tượng lính đá cầm khiên lớn | Người | `A stone guardian statue soldier holding a big round stone shield in front, cracked grey stone body, moss in the cracks, glowing runes` |
| **Đèn Lồng Ma**: đèn lồng giấy có mặt, lửa ma bên trong | Khối mềm | `A floating haunted paper lantern with a spooky face, ghostly blue-orange fire inside, tattered tassels` |
| **Mèo Đen Hai Đuôi**: mèo đen hai đuôi, mắt vàng | Bốn chân | `A black cat yokai with two tails, glowing yellow eyes, arched back, small flames at the tail tips` |
| **Hũ Lửa Sống**: hũ sành có mặt, lửa phụt từ miệng | Khối mềm | `A living clay jar with a face, fire bursting out of its open top, small stubby legs, cracked surface glowing inside` |
| **Tiểu Yêu Ném Pháo**: yêu tinh nhỏ ôm pháo nổ | Người | `A small red imp goblin with little horns, mischievous grin, holding a lit firecracker bomb, ragged cloth` |
| **Nhím Than Hồng**: nhím gai than hồng rực | Bốn chân | `A hedgehog made of black coal with glowing red-hot ember spikes on its back, smoke rising` |
| **Tướng Ma** (tinh anh) | Người | `A ghost general in dark ancient armor with a tattered red cape, holding a big guandao glaive, glowing eyes under a horned helmet` |
| **Hũ Lửa Chúa** (tinh anh) | Khối mềm | `A large ornate living clay urn with dragon patterns, roaring fire from its top, angry face, glowing cracks` |
| **Hổ Lửa** (trùm nhỏ) | Bốn chân | `A fierce fire tiger, orange fur with black stripes that glow like embers, flaming mane and tail, roaring pose` |
| **Hồ Tinh** (trùm vùng) | Bốn chân | `A nine-tailed fox spirit from Vietnamese folklore in a crouching stalking pose, sleek white-gold fur, nine tails fanned out like a fan, ghostly blue-violet foxfire flames floating around, cunning glowing eyes` |

---

## Mẹo

- Muốn cả bộ trông đồng đều thì vẽ mỗi lần một vùng, giữ nguyên đoạn "Phong cách chung".
- AI hay vẽ thêm bóng đổ hoặc nền có hoa văn. Nếu bị vậy, gõ thêm: `pure white background, nothing else`.
- Nếu AI vẽ quay sang trái, trong Xưởng có nút lật hình. Hoặc gõ thêm: `facing right, side profile`.
- Trùm vùng nên vẽ to, rõ chi tiết. Quái thường nên vẽ đơn giản, mảng màu lớn.
