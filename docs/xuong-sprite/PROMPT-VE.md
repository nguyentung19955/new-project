# Prompt vẽ quái và em bé cho Xưởng Sprite

Tệp này là các câu mô tả (prompt) để bạn dán vào công cụ vẽ bằng AI (ChatGPT, Gemini, Midjourney...), hoặc đưa cho người vẽ tay. Hình vẽ ra sẽ đưa vào **Xưởng Sprite** (spiritblade.web.app/xuong-sprite.html), sau đó tải tệp `.sprite.json` về và gửi Claude để đưa vào game.

Mỗi con đều có **một nét phá cách**: một chi tiết lạ, không giống con vật thật, lấy từ đồ vật, phong tục và truyện dân gian Việt. Nhờ vậy nhìn qua là nhận ra, không lẫn với game khác. Nét phá cách đã viết sẵn trong prompt. Không thích nét nào thì xoá câu đó trong prompt (câu bắt đầu bằng `Twist:`).

## Cách dùng

1. Chép **một** prompt của con bạn muốn vẽ, rồi dán **thêm đoạn "Phong cách chung" vào cuối**.
2. Prompt viết bằng tiếng Anh vì các công cụ vẽ AI hiểu tiếng Anh tốt nhất. Phần tiếng Việt là để bạn biết con đó trông thế nào và nét lạ là gì.
3. Vẽ xong, kiểm tra lại:
   - con vật **quay sang phải**, nhìn ngang;
   - nền **trắng trơn**;
   - chỉ có **một con**;
   - tay, chân, đuôi, cánh **tách khỏi thân** một chút.
4. Đưa vào Xưởng và chọn **khung cơ thể** đúng như cột "Khung".

## Phong cách chung (dán vào cuối mọi prompt)

```
Style: cute but strange chibi creature for a 2D pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns, side view, facing RIGHT, full body, centered, single character only, plain flat WHITE background, no ground shadow, no text, no frame. Bold dark outline, flat cel colors, limited palette (8–12 colors), big head and big readable eyes, chunky simple shapes that still read at 32 pixels tall. Limbs, tail and wings slightly separated from the body. The twist detail must be big and clearly visible.
```

Muốn ra luôn hình pixel thì thêm: `pixel art, 64x64 sprite, no anti-aliasing`. Hình thường cũng được, Xưởng sẽ tự chuyển sang pixel.

---

## Em bé (nhân vật chính) · Khung: Người · cao khoảng 28 điểm ảnh

Bốn em bé cùng một dáng: trẻ con đội mũ trùm có hai tai nhọn, mặt tròn mắt to. Nét phá cách chung của cả bốn là **mặt nạ giấy Trung thu** đeo lệch trên mũ. Mỗi em bé thêm một nét riêng.

**Thợ Rèn**: áo trùm đỏ, búa đeo hông. *Phá cách:* bím tóc là **sợi dây xích nhỏ** buộc chuông đồng, hai tay đeo găng da quá khổ.
```
A small child hero in a red hooded cloak with two pointed ear tips, round pale face, big dark eyes, a small blacksmith hammer on the belt. Twist: a paper Mid-Autumn festival mask pushed sideways on the hood, a little braid made of a tiny iron chain ending in a bronze bell, oversized leather gloves. Empty hands ready to hold a weapon.
```

**Thợ Săn**: áo trùm xanh lá, ống tên sau lưng. *Phá cách:* ống tên làm bằng **ống tre có lá non mọc ra**, một con **chim sẻ nhỏ đậu trên mũ**.
```
A small child hunter in a forest-green hooded cloak with two pointed ear tips, round face, big eyes. Twist: a paper Mid-Autumn mask on the side of the hood, a bamboo-tube quiver with fresh leaves sprouting from it, a tiny sparrow perched on the hood. Nimble pose, empty hands ready to hold a weapon.
```

**Thầy Lang**: áo trùm xanh lam, túi thuốc. *Phá cách:* sau lưng đeo **cái nồi đất sắc thuốc** đang bốc khói xanh, cổ quàng **tràng hạt củ gừng**.
```
A small child healer in a blue hooded cloak with two pointed ear tips, round face, big kind eyes, herb pouch at the waist. Twist: a paper Mid-Autumn mask on the side of the hood, a small clay medicine pot strapped to the back puffing green smoke, a necklace made of ginger roots. Calm pose, empty hands ready to hold a weapon.
```

**Đô Vật**: áo trùm cam, người to chắc, đai vải. *Phá cách:* đầu quấn **khăn đỏ đô vật làng**, bụng có **hình xăm trống đồng** phát sáng nhẹ.
```
A small but stocky child wrestler in an orange hooded cloak with two pointed ear tips, round face, determined big eyes, thick cloth belt, wide stance. Twist: a paper Mid-Autumn mask on the side of the hood, a red village-wrestling headband, a faintly glowing bronze-drum sun tattoo on the belly.
```

---

## Rừng già (hệ Độc: xanh lá, tím)

| Tên | Nét phá cách | Khung | Prompt |
|---|---|---|---|
| **Heo Rừng Con** | Lưng là **mái tranh nhỏ** có khói bếp bốc lên, đuôi xoắn như lò xo | Bốn chân | `A small wild boar piglet, brown fur, short tusks, stubby legs, charging stance. Twist: its back is a tiny thatched roof with a chimney puffing smoke, and its tail is a curly spring.` |
| **Bầy Ong Vò Vẽ** | Ba con ong đội **nón lá tí hon**, ngòi là **cây kim khâu** | Cá/chim bay | `A tight cluster of three angry yellow-and-black hornets flying together as one swarm. Twist: each hornet wears a tiny conical leaf hat, and their stingers are sewing needles with red thread.` |
| **Bọ Hung Mai Cứng** | Mai là **cái mõ gỗ** khắc hoa văn, sừng là **cán cuốc** | Cua/bọ | `A stout rhinoceros beetle, six short legs, armored and slow. Twist: its shell is a carved wooden temple bell (mo) with patterns, and its horn is an old hoe handle.` |
| **Hoa Phun Bào Tử** | Mọc trong **cái chum sành vỡ**, cánh hoa có **mắt người** | Cây/đứng yên | `A carnivorous flower with a wide toothy purple mouth, green leaf arms, puffs of glowing spores. Twist: it grows out of a cracked clay jar, and each petal has a small human eye.` |
| **Chồn Bóng** | Thân là **bóng đen**, chỉ có **đôi dép guốc** và đôi mắt là thật | Bốn chân | `A sleek shadow weasel made of living black-violet shadow, long low body, long tail, sneaky crouch. Twist: the only solid parts are its glowing eyes and a pair of tiny wooden clogs on its front paws.` |
| **Nấm Phồng** | Mũ nấm là **cái nón quai thao**, bụng phồng như **bánh trôi** | Khối mềm | `A small round mushroom creature with a puffed-up swollen body, tiny feet, nervous face, about to burst. Twist: its cap is a flat quai thao festival hat with purple spots, and its belly looks like a sticky rice ball.` |
| **Sóc Ném Quả Nổ** | Quả nổ là **quả bưởi** cắm ngòi pháo tết, đuôi xù cài **hoa đào** | Bốn chân | `An orange squirrel with a huge fluffy tail, mischievous grin. Twist: it holds a pomelo with a red Tet firecracker fuse stuck in it, and peach blossoms are tucked in its tail.` |
| **Nhím Gai Độc** | Gai là **que hương** đang cháy, khói tím | Bốn chân | `A hedgehog with a dark brown body and small snout, quills raised. Twist: its quills are burning incense sticks with purple poisonous smoke curling up.` |
| **Heo Rừng Nanh Dài** (tinh anh) | Nanh là **hai lưỡi liềm**, lưng mọc **cả bụi tre** | Bốn chân | `A big elite wild boar, dark bristly fur, scarred face, red eyes, heavy muscular body. Twist: its tusks are two curved iron sickles, and a small bamboo grove grows out of its back.` |
| **Nấm Phồng Chúa** (tinh anh) | Đội **mũ cánh chuồn quan lại** mốc meo, cầm **quạt giấy** | Khối mềm | `A large king mushroom creature, thick stem body, small angry face, toxic spores floating around. Twist: it wears a moldy mandarin official hat with wing flaps and holds a paper fan.` |
| **Nấm Chúa** (trùm nhỏ) | Mũ nấm là **mái đình cong**, rễ chân là **chân ghế gỗ** | Khối mềm | `A giant ancient mushroom lord, layered purple and green cap with glowing spots, wise but menacing face, toxic mist. Twist: its cap is shaped like a curved village communal-house roof, and its legs are carved wooden stool legs.` |
| **Mộc Tinh** (trùm vùng) | Thân cây treo **chuông gió và lồng đèn**, giữa ngực là **cái trống đồng** đập như tim | Cây/đứng yên | `A giant tree spirit, gnarled trunk with an angry carved face, glowing green eyes, branch arms, thick roots as legs, hanging vines and yellow paper talismans. Twist: wind chimes and paper lanterns hang from its branches, and a bronze drum is embedded in its chest, pulsing like a heart.` |

## Hang biển (hệ Băng: xanh biển, trắng)

| Tên | Nét phá cách | Khung | Prompt |
|---|---|---|---|
| **Cua Lính** | Đội **gáo dừa** làm mũ, càng kẹp **cái thìa canh** | Cua/bọ | `A blue soldier crab with two big raised claws, small eye stalks, sideways stance. Twist: it wears half a coconut shell as a helmet, and one claw holds a soup ladle like a weapon.` |
| **Bầy Cá Con** | Ba con cá là **diều giấy hình cá** có dây | Cá/chim bay | `A small school of three little blue and orange fish swimming together. Twist: they look like fish-shaped paper kites with strings trailing behind them.` |
| **Ốc Mượn Hồn** | Vỏ ốc là **cái ấm sành** sứt quai | Cua/bọ | `A hermit crab with red claws in front, the shell used like a shield. Twist: instead of a seashell it lives in a chipped old clay teapot with a broken handle.` |
| **Hải Quỳ** | Xúc tu là **sợi mì**, giữa miệng có **viên ngọc trai** sáng | Cây/đứng yên | `A sea anemone creature on a rock, a round mouth in the center, blowing bubbles. Twist: its waving tentacles look like long noodles, and a glowing pearl sits inside its mouth.` |
| **Cá Chuồn** | Vây cánh là **hai cái quạt nan** | Cá/chim bay | `A flying fish, sleek silver-blue body, leaping pose. Twist: its wing fins are two open bamboo hand fans.` |
| **Cá Nóc** | Gai là **đinh guốc**, miệng ngậm **cái còi** | Khối mềm | `A round pufferfish fully inflated, worried face, tiny fins. Twist: its spikes are little wooden-clog nails, and it holds a small whistle in its mouth.` |
| **Sứa Bom** | Chuông sứa là **cái chuông đồng**, xúc tu buộc **pháo dây** | Khối mềm | `A translucent blue jellyfish with dangling tentacles. Twist: its bell is a small bronze temple bell, and strings of firecrackers are tied to its tentacles.` |
| **Nhím Biển** | Gai là **đũa tre**, có **hai bàn chân người** thò ra | Khối mềm | `A dark purple sea urchin creature with two small eyes peeking out. Twist: its spines are bamboo chopsticks, and two tiny human feet stick out from the bottom.` |
| **Cua Tướng** (tinh anh) | Mai là **áo giáp tướng thời xưa**, cờ lệnh cắm trên lưng | Cua/bọ | `A big general crab, huge serrated claws, battle scars, commanding stance. Twist: its shell is ancient Vietnamese general's armor with a command flag planted on its back.` |
| **Cá Nóc Chúa** (tinh anh) | Phồng lên thành **quả cầu tuyết**, đội **vương miện san hô** | Khối mềm | `A large king pufferfish, icy blue, inflated and furious. Twist: its body is a frosted snowball with icicle spikes, and it wears a crown of red coral.` |
| **Cua Đá** (trùm nhỏ) | Mai là **cả một hòn non bộ** có cây và chùa tí hon | Cua/bọ | `A giant rock crab with massive claws, slow and heavy. Twist: its shell is a whole miniature rock garden (hon non bo) with tiny trees, a tiny pagoda and a little waterfall.` |
| **Ngư Tinh** (trùm vùng) | Vảy là **mảnh gốm men lam** vỡ, râu là **dây neo thuyền** | Rắn | `A giant sea serpent fish spirit from Vietnamese folklore, long body, dragon-like fins, big fanged jaws, glowing eyes, water swirling around. Twist: its scales are broken blue-and-white ceramic shards, and its whiskers are rusty boat anchor chains.` |

## Lâu đài cổ (hệ Lửa: đỏ cam, xám đá)

| Tên | Nét phá cách | Khung | Prompt |
|---|---|---|---|
| **Lính Ma Giáp Gỉ** | Trong mũ giáp không có đầu mà là **một ngọn nến**, cầm **cây chổi** thay gươm | Người | `An empty rusty suit of ancient armor animated by a ghost, slightly hunched. Twist: inside the helmet there is no head, only a burning candle flame, and it holds a straw broom instead of a sword.` |
| **Bầy Dơi Than** | Cánh dơi là **tờ vàng mã** cháy dở | Cá/chim bay | `A small swarm of three black bats flying together. Twist: their wings are half-burnt joss paper with glowing ember edges.` |
| **Tượng Đá Cầm Khiên** | Khiên là **cái nong tre**, đầu là **con nghê đá** | Người | `A stone guardian statue soldier, cracked grey stone body, moss in the cracks, glowing runes. Twist: its head is a stone nghe (Vietnamese guardian lion-dog), and its shield is a huge round woven bamboo tray.` |
| **Đèn Lồng Ma** | Là **đèn ông sao** xé rách, có **lưỡi dài** thè ra | Khối mềm | `A floating haunted lantern with a spooky face and ghostly blue-orange fire inside. Twist: it is a torn five-pointed star festival lantern (den ong sao) with a long tongue sticking out.` |
| **Mèo Đen Hai Đuôi** | Hai đuôi là **hai que diêm** đang cháy, cổ đeo **chuông đồng** | Bốn chân | `A black cat yokai with glowing yellow eyes, arched back. Twist: its two tails are giant burning matchsticks, and it wears a bronze bell collar.` |
| **Hũ Lửa Sống** | Hũ là **bình vôi** cụ già, có **hai tay bằng ống điếu** | Khối mềm | `A living clay jar with a face, fire bursting out of its top, stubby legs, glowing cracks. Twist: it is an old betel lime pot (binh voi), and its two arms are wooden smoking pipes.` |
| **Tiểu Yêu Ném Pháo** | Mặc **yếm đỏ**, đầu là **quả trứng vịt lộn** nứt vỏ | Người | `A small red imp goblin with little horns and a mischievous grin, holding a lit firecracker bomb. Twist: it wears a red traditional bodice (yem) and its head is a cracked eggshell with the horns poking out.` |
| **Nhím Than Hồng** | Lưng là **cái bếp than tổ ong** đang đỏ | Bốn chân | `A hedgehog made of black coal, smoke rising. Twist: its back is a glowing red honeycomb coal briquette with round holes.` |
| **Tướng Ma** (tinh anh) | Mặt là **mặt nạ tuồng** sơn đỏ trắng, áo choàng là **lá cờ rách** | Người | `A ghost general in dark ancient armor holding a big guandao glaive, glowing eyes. Twist: its face is a painted red-and-white tuong opera mask, and its cape is a torn battle flag.` |
| **Hũ Lửa Chúa** (tinh anh) | Là **lư hương đồng** ba chân, khói thành **hình mặt quỷ** | Khối mềm | `A large living bronze urn with dragon patterns, roaring fire from its top, angry face. Twist: it is a three-legged bronze incense burner, and its smoke forms a demon face above it.` |
| **Hổ Lửa** (trùm nhỏ) | Vằn hổ là **chữ Nôm** phát sáng, đeo **vòng cổ tiền xu** | Bốn chân | `A fierce fire tiger, orange fur, flaming mane and tail, roaring pose. Twist: its stripes are glowing ancient Vietnamese Nom characters, and it wears a collar of old coins on a red string.` |
| **Hồ Tinh** (trùm vùng) | Chín đuôi là **chín dải lụa** đầu đuôi treo **đèn lồng**, đeo **mặt nạ hồ ly bằng gỗ** lệch nửa mặt | Bốn chân | `A nine-tailed fox spirit from Vietnamese folklore in a crouching stalking pose, sleek white-gold fur, blue-violet foxfire floating around, cunning glowing eyes. Twist: its nine tails are flowing silk ribbons each ending in a small lantern, and a carved wooden fox mask covers half its face.` |

---

## Mẹo

- Muốn cả bộ trông đồng đều thì vẽ mỗi lần một vùng, giữ nguyên đoạn "Phong cách chung".
- **Nét phá cách phải to, rõ.** Hình trong game rất nhỏ, chi tiết bé sẽ mất. Nếu AI vẽ nét lạ quá nhỏ, gõ thêm: `make the twist detail big and obvious`.
- Muốn phá cách hơn nữa, đổi câu `Twist:` bằng ý của bạn. Công thức dễ: **lấy một đồ vật quen thuộc trong làng** (nón, chum, quạt, đèn, chổi, bếp...) **thay vào một bộ phận** của con vật.
- AI hay vẽ thêm bóng đổ hoặc nền có hoa văn. Nếu bị vậy, gõ thêm: `pure white background, nothing else`.
- Nếu AI vẽ quay sang trái, trong Xưởng có nút lật hình. Hoặc gõ thêm: `facing right, side profile`.
