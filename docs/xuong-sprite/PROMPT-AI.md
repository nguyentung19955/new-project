# Bộ prompt nhờ AI vẽ hình cho Xưởng Sprite

Mỗi dòng trong khung là **một ảnh**: chép nguyên dòng dán vào AI vẽ ảnh (ChatGPT, Gemini, Midjourney, Leonardo, Bing Image Creator…). Viết bằng tiếng Anh vì các AI vẽ ảnh hiểu tiếng Anh tốt nhất.

## Làm sao cho hình thật chi tiết mà vẫn đẹp trong game

- Hình trong game rất nhỏ: quái thường cao khoảng 30 điểm ảnh, trùm khoảng 100 đến 120. Chi tiết li ti sẽ mất khi thu nhỏ. **"Chi tiết" ở đây là hình khối rõ, mảng màu to, viền đậm, mắt to**, không phải nhiều nét nhỏ.
- Muốn giữ nhiều chi tiết hơn: ở bước 2 kéo **Chiều cao trong game** lên cao hơn quái gốc một chút (ví dụ 40 thay vì 32) và tăng **Số màu** lên 16 đến 24.
- Ảnh AI phải: **nền trắng trơn, không bóng đổ, một con duy nhất, quay sang phải, nhìn ngang, thấy đủ toàn thân, tay chân đuôi tách khỏi thân**. Prompt dưới đây đã có sẵn các ý này.
- AI hay tự thêm nền, bóng hoặc chữ. Nếu vậy, bấm vẽ lại, hoặc nói thêm "plain white background only, remove shadow".
- Muốn cả bộ cùng một nét vẽ: tạo ảnh đầu tiên, rồi nói với AI "same art style as the previous image" cho các ảnh sau (ChatGPT, Gemini làm được), hoặc dùng cùng một "seed" (Midjourney, Leonardo).
- Vẽ ảnh vuông (1024×1024) là đủ. Không cần ảnh quá to.

## Câu thêm vào để AI không bị lệch

**1. Câu mở đầu (dán một lần, trước ảnh đầu tiên, khi dùng ChatGPT hoặc Gemini):**
```
I will ask you for a set of sprites for ONE pixel game. Keep exactly the same art style for every image in this chat: same line thickness, same color palette, same chibi proportions, same side view facing right, same plain pure white background. Never add background, scenery, ground, shadow, text, watermark or frame. One subject per image, whole body fully visible with empty white margin around it, not cropped. Reply with the image only.
```

**2. Đuôi dán thêm vào cuối mỗi dòng prompt (từ ảnh thứ hai trở đi):**
```
, same art style, same line thickness and same color palette as the previous images in this set
```

**3. Giữ đúng chất Việt Nam (AI hay vẽ thành Trung Quốc, Nhật Bản hoặc anime):**
```
, Vietnamese folklore and Dong Son bronze drum style, not Chinese, not Japanese, not anime
```

**4. Giữ đúng hình dáng cho công cụ cắt (khi AI hay vẽ chéo, vẽ cắt mất chân, vẽ nhiều con):**
```
, exactly one subject, strict side view facing right, flat 2D, no perspective, no 3D, whole body visible, not cropped
```

**5. Ô "Negative prompt" (Leonardo, Stable Diffusion) hoặc `--no` (Midjourney):**
```
background, scenery, ground, floor, shadow, drop shadow, text, letters, watermark, signature, frame, border, multiple characters, cropped, cut off, perspective, 3D render, realistic, photo, blurry, gradient background, glow, noise, texture
```

**Mẹo khi AI vẫn lệch:**
- Ghi số thứ tự trong bộ: "image 3 of 10 in the same set".
- Lệch nhiều thì mở cuộc trò chuyện mới, dán lại câu mở đầu.
- Midjourney: thêm `--sref` (đường dẫn ảnh đầu tiên) và cùng `--seed`. Leonardo: tải ảnh đầu tiên lên làm "Style Reference".
- Dùng ảnh đẹp nhất làm mẫu: tải nó lên và viết "use this image as the style reference for all next images".


---

## 1. Em bé (bộ 4, đi cùng nhau)

Bốn em bé tinh linh cùng một kiểu dáng, khác màu và món đồ. Vẽ em bé **tay không** (vũ khí do game vẽ).

```
Cute chibi spirit child hero, Vietnamese folklore fantasy, big round head, white mask-like face with two dot eyes, red hooded robe with two tiny horns on the hood, small body, both arms slightly away from the body, two short legs apart, empty hands, full body, side view facing right, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute chibi spirit child hero, Vietnamese folklore fantasy, big round head, white mask-like face with two dot eyes, green hood with a pointed tip, small quiver on the back, small body, both arms slightly away from the body, two short legs apart, empty hands, full body, side view facing right, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute chibi spirit child hero, Vietnamese folklore fantasy, big round head, white mask-like face with two dot eyes, blue hood with a little leaf sprout on top, small gourd bottle on the back, small body, both arms slightly away from the body, two short legs apart, empty hands, full body, side view facing right, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute chibi spirit child hero, Vietnamese folklore fantasy, big round head, white mask-like face with two dot eyes, orange hood wrapped with a red headband, bronze gloves, sturdy wrestler body, both arms slightly away from the body, two short legs apart, empty hands, full body, side view facing right, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
```

---

## 2. Quái vùng Rừng già (bộ, hệ Độc)

```
Cute chibi fantasy monster, small wild boar piglet with angry eyes and a mossy mane, four short legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, legs and tail clearly separated from the body, plain pure white background, no shadow, no text
Cute chibi fantasy monster, a swarm of three angry yellow and black hornets with big eyes, wings spread, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute chibi fantasy monster, armored dung beetle with a hard green shell like a shield, six short legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, legs clearly separated from the body, plain pure white background, no shadow, no text
Cute chibi fantasy monster, carnivorous purple flower with a toothy mouth that spits spores, leafy stem and roots, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute chibi fantasy monster, sneaky shadow weasel, long dark purple body, glowing pink eyes, smoky tail, four short legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, legs and tail clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, puffy poison mushroom with a purple spotted cap, angry face under the cap, two tiny root feet, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute chibi fantasy monster, orange squirrel holding a round bomb fruit, bushy tail, standing on hind legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, arms legs and tail clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, poison porcupine with purple spikes tipped with green venom drops, four short legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, legs clearly separated, plain pure white background, no shadow, no text
Chibi fantasy elite monster, big angry wild boar with long white tusks, bristly mane, scars, four strong legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, legs and tail clearly separated, plain pure white background, no shadow, no text
Chibi fantasy elite monster, giant mushroom king with a wide purple spotted cap and a tiny crown, angry face, root feet, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Chibi fantasy mini boss, ancient mushroom lord, huge glowing cap, mossy body, thick root legs, menacing eyes, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Chibi fantasy region boss, Moc Tinh the ancient tree spirit, huge gnarled tree with a face in the trunk, leafy crown, branch arms, root legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, branches clearly separated, plain pure white background, no shadow, no text
```

---

## 3. Quái vùng Hang biển (bộ, hệ Băng)

```
Cute chibi fantasy monster, blue soldier crab with two big red claws and angry eyes, six legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, claws and legs clearly separated from the body, plain pure white background, no shadow, no text
Cute chibi fantasy monster, a small school of three toothy little fish in blue, teal and red, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute chibi fantasy monster, hermit crab living in a spiky blue spiral shell, one big red claw, three little legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, claw and legs clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, red sea anemone with wavy teal tentacles and an angry face, sitting on a rock, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, tentacles clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, flying fish with big wing-like fins spread wide, blue body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, fins and tail clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, angry teal pufferfish with short spikes, small fins, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute chibi fantasy monster, blue jellyfish holding a round bomb with a lit fuse under its bell, two bunches of tentacles, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, tentacles clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, dark purple sea urchin with long spikes and two angry eyes, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Chibi fantasy elite monster, general crab with heavy armored blue shell, huge red claws, battle scars, six legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, claws and legs clearly separated, plain pure white background, no shadow, no text
Chibi fantasy elite monster, giant king pufferfish with a crown of spikes, angry teal face, small fins, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Chibi fantasy mini boss, huge stone crab with rocky shell covered in barnacles and moss, massive claws, six legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, claws and legs clearly separated, plain pure white background, no shadow, no text
Chibi fantasy region boss, Ngu Tinh the sea serpent spirit, long blue scaly dragon fish body with fins and whiskers, rising from the water, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
```

---

## 4. Quái vùng Lâu đài cổ (bộ, hệ Lửa)

```
Cute chibi fantasy monster, ghost soldier in rusty old armor with a glowing face, holding nothing, two arms and two legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, arms and legs clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, a swarm of three charcoal black bats with glowing yellow eyes, wings spread, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute chibi fantasy monster, small stone statue warrior holding a big round shield, cracked grey stone, two short legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, arms and legs clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, haunted red paper lantern ghost with angry eyes and a flickering flame inside, small handle on top, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute chibi fantasy monster, black cat with two tails and glowing eyes, four legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, legs and both tails clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, living clay jar full of fire with a yellow paper talisman on its forehead, two handle arms and two tiny legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute chibi fantasy monster, little horned imp holding a firecracker, mischievous grin, two arms and two legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, arms and legs clearly separated, plain pure white background, no shadow, no text
Cute chibi fantasy monster, ember hedgehog with glowing red cracks on its grey back and fiery spikes, four short legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, legs clearly separated, plain pure white background, no shadow, no text
Chibi fantasy elite monster, ghost general in tall ornate ancient Vietnamese armor, red cape, glowing eyes, two arms and two legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, arms and legs clearly separated, plain pure white background, no shadow, no text
Chibi fantasy elite monster, big king fire jar with a crown of flames and several talismans, handle arms, stubby legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors, plain pure white background, no shadow, no text
Chibi fantasy mini boss, fire tiger with burning orange stripes and flaming tail, four strong legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, legs and tail clearly separated, plain pure white background, no shadow, no text
Chibi fantasy region boss, Ho Tinh the nine-tailed fox spirit, white and red fur, many fiery tails fanned out, four legs, full body, side view facing right, Vietnamese folklore pixel game, bold dark outline, flat colors with simple cel shading, legs and tails clearly separated, plain pure white background, no shadow, no text
```

---

## 5. Vũ khí (vũ khí sống: có mắt, có tính nết)

Vẽ **kiếm, giáo, búa dựng đứng, mũi chĩa lên trời, chuôi ở dưới**. Vẽ **cung dựng đứng, bụng cung quay sang phải**. Trong công cụ bạn sẽ chấm điểm cầm và mũi.

### Kiếm (bộ 10)
```
Cute living sword item for a fantasy pixel game, a plain forged iron sword with a small round eye on the blade, standing vertically with the tip pointing up and the handle at the bottom, single item centered, bold dark outline, flat colors with simple cel shading, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a curved sickle-like blade with one eye, standing vertically with the tip pointing up and the handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living sword item for a fantasy pixel game, a sword shaped like a rice leaf, green and gold, with one eye, standing vertically with the tip pointing up and the handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living sword item for a fantasy pixel game, Vietnamese dragon sword with a dragon head guard and scaled blade, one eye, standing vertically with the tip pointing up, handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a broad machete blade with one eye, standing vertically with the tip pointing up and the handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a farmer's billhook knife with a hooked tip and wooden handle, one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living sword item for a fantasy pixel game, a bamboo sword with green bamboo segments and one eye, standing vertically with the tip pointing up and the handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a short bronze Dong Son dagger with drum pattern engravings, one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a broad sabre shaped like a carp fish with scales and a fish tail handle, one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living sword item for a fantasy pixel game, a sword with a wavy blade like water waves, blue and white, one eye, standing vertically with the tip pointing up and the handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Cung (bộ 10)
```
Cute living bow item for a fantasy pixel game, a bow shaped like a coiled dragon snake with one eye, standing vertically, string on the left side, belly of the bow facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living crossbow item for a fantasy pixel game, the legendary magic crossbow of An Duong Vuong with a golden claw, one eye, standing vertically, front facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a bow made of two curved buffalo horns joined in the middle, one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a simple bamboo bow with one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living slingshot item for a fantasy pixel game, a wooden Y-shaped slingshot with a rubber band and one eye, standing vertically, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a bow shaped like the spread white wings of a stork, one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a bow shaped like a crescent moon, silver and pale yellow, one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a bow shaped like the Vietnamese monochord dan bau instrument, one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a bow made from a fish skeleton spine and ribs, one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living bow item for a fantasy pixel game, a bow decorated with a five-pointed Vietnamese star lantern, red and yellow, one eye, standing vertically, string on the left, belly facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Giáo (bộ 10)
```
Cute living spear item for a fantasy pixel game, a sharpened bamboo spear with one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a trident with three prongs and one eye, standing vertically with the prongs pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a long hooked sickle spear (cau liem) with one eye, standing vertically with the blade pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living spear item for a fantasy pixel game, a Vietnamese mac halberd with a broad curved blade and one eye, standing vertically with the blade pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living spear item for a fantasy pixel game, a short throwing javelin with feathers and one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living spear item for a fantasy pixel game, a bronze Dong Son spear with drum pattern engravings and one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living spear item for a fantasy pixel game, a snake spear with a wavy serpent blade and one eye, standing vertically with the tip pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a wooden boat oar used as a spear, one eye on the paddle, standing vertically with the paddle pointing up, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a reed flag spear with a fluffy reed plume on top and one eye, standing vertically, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a giant calligraphy brush used as a spear, dark ink tip pointing up, one eye, standing vertically, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Búa (bộ 10)
```
Cute living hammer item for a fantasy pixel game, a blacksmith forge hammer with an iron head and wooden handle, one eye, standing vertically with the head on top and handle at the bottom, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a wooden rice pounding pestle with one eye, standing vertically with the heavy end on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a spiked mace with one eye, standing vertically with the spiked head on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a stone age axe with a rough stone head tied with rope, one eye, standing vertically with the head on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a big wooden mallet with one eye, standing vertically with the head on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a bronze gong on a handle used as a hammer, one eye on the gong, standing vertically with the gong on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a small Dong Son bronze drum on a handle used as a hammer, star pattern on the drum face, one eye, standing vertically with the drum on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a Dong Son asymmetric bronze boot-shaped axe with one eye, standing vertically with the axe head on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living hammer item for a fantasy pixel game, a hammer with a buffalo head and two horns, one eye, standing vertically with the head on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Cute living weapon item for a fantasy pixel game, a club shaped like a calabash gourd with one eye, standing vertically with the gourd on top, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

---

## 6. Trang phục (đồ mặc cho em bé)

Vẽ **riêng món đồ, không vẽ em bé**, nhìn ngang, quay sang phải. Trong công cụ bạn kéo món đồ đặt lên đầu, lên người em bé.

### Mũ
```
Small chibi hat item for a fantasy pixel game, hood with two tiny horns, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, Vietnamese conical straw hat non la, side view, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, traditional Vietnamese khan xep turban in indigo, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, simple straw hat with a red band, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, wooden helmet with two curved horns, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, leafy wreath crown, side view, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, fish skin cap with a small fin on top, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, red headband with a glowing fire stone, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, blue cap with a tall fish fin crest, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi hat item for a fantasy pixel game, orange hood with tall fox ears, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Áo (bộ áo cho người nhỏ, không có tay áo cũng được)
```
Small chibi clothing item for a fantasy pixel game, a short leaf raincoat ao toi made of palm leaves, front body piece only, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi clothing item for a fantasy pixel game, a traditional Vietnamese ao the tunic, short, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi armor item for a fantasy pixel game, bamboo plate armor vest, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi armor item for a fantasy pixel game, tree bark armor vest with moss, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi armor item for a fantasy pixel game, blue fish scale armor vest, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi clothing item for a fantasy pixel game, fluffy white fur coat, short, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi armor item for a fantasy pixel game, grey stone armor vest with cracks of lava, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Đồ đeo lưng
```
Small chibi backpack item for a fantasy pixel game, a calabash gourd bottle on a strap, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi backpack item for a fantasy pixel game, bamboo arrow quiver with feathered arrows, side view, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi backpack item for a fantasy pixel game, woven bamboo basket gui tre, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi back item for a fantasy pixel game, short flowing cape, side view facing right, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Small chibi backpack item for a fantasy pixel game, a tiny Dong Son bronze drum carried on the back, side view, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Bùa đeo hông và vật cầm tay
```
Tiny charm amulet item for a fantasy pixel game, snake fang charm on a string with a red tassel, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Tiny charm amulet item for a fantasy pixel game, round sea shell charm with a red tassel, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Tiny charm amulet item for a fantasy pixel game, square glowing fire stone charm with a red tassel, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Tiny held item for a fantasy pixel game, a small blacksmith hammer, side view, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

### Cánh (vẽ MỘT bên cánh, gốc cánh ở góc dưới bên phải, cánh xoè lên về bên trái)
```
Single fantasy wing item for a fantasy pixel game, dragonfly wing, transparent pale blue with veins, wing root at the bottom right, wing spreading up and to the left, bold dark outline, flat colors, plain pure white background, no shadow, no text
Single fantasy wing item for a fantasy pixel game, wing made of green leaves, wing root at the bottom right, spreading up and to the left, bold dark outline, flat colors, plain pure white background, no shadow, no text
Single fantasy wing item for a fantasy pixel game, wing made of flames, orange and yellow, wing root at the bottom right, spreading up and to the left, bold dark outline, flat colors, plain pure white background, no shadow, no text
Single fantasy wing item for a fantasy pixel game, wing made of ice shards, pale blue and white, wing root at the bottom right, spreading up and to the left, bold dark outline, flat colors, plain pure white background, no shadow, no text
```

---

## 7. Vật phẩm rơi ra (bộ)

Hình rất nhỏ trong game (khoảng 14 đến 18 điểm ảnh): vẽ hình khối thật đơn giản.

```
Game item icon, a small pile of ancient Vietnamese gold coins with square holes, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a small red health potion bottle with a cork, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a glowing orange fire spirit orb, simple round shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a glowing green poison spirit orb, simple round shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a glowing pale blue ice spirit orb, simple round shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a chunk of silver iron ore, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a purple tempering crystal stone, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a log of magic spirit wood with a green sprout, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a shiny blue fish scale, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a glowing red fire stone, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a green crystal shard from a tree boss, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, a blue crystal shard from a sea serpent boss, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
Game item icon, an orange crystal shard from a fox spirit boss, simple chunky shape, single item centered, bold dark outline, flat colors, plain pure white background, no shadow, no text
```
