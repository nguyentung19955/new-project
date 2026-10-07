# Prompt Gemini v94 — gen nhẹ, nhanh, đúng

Gồm: **11 tướng mới** (+ Lang Liêu còn thiếu), **động tác (action) của tướng mới**, **icon kỹ năng**, **icon Thần Khí**, **icon Ấn Phù**, **3 quái còn thiếu**. Boss: đã đủ 9, không cần gen.

## Cách dùng (nhanh nhất)
1. Mở **một cuộc trò chuyện Gemini mới**, dán **KHỐI LUẬT** (mục A) một lần, đính kèm `docs/mau-lac-tuong.png` (nét vẽ) và `docs/mau-quai.png` (nền hồng tím). Gemini trả lời "OK" là xong.
2. Sau đó **mỗi lần chỉ dán một khối ngắn** (mục B → G). Không cần dán lại luật — prompt ngắn nên gen nhanh và ít sai.
3. Khoảng 10–12 ảnh thì Gemini hay "quên" luật → mở cuộc trò chuyện mới, dán lại KHỐI LUẬT.
4. Ảnh sai (thiếu ô, nền không phải hồng tím, có chữ) → gõ: `Regenerate following the RULES exactly.`
5. Tải về, **đặt tên file đúng mã trong ngoặc** (ví dụ `thoren.png`, `thoren-attack.png`, `icon-thoren.png`), gửi lại cho mình để cắt và nạp.

Ảnh nhỏ (ô 256 px, icon 128 px, khoảng 20–30 màu phẳng) nên file nhẹ, Gemini vẽ nhanh, mình cắt nền sạch.

---

## A. KHỐI LUẬT (dán một lần đầu mỗi cuộc trò chuyện)

```
RULES for every image I ask for in this chat (game art for a mobile tower-defense game based on Vietnamese folk legends):
STYLE: match the attached style reference only (line weight, eyes, shading), never copy its character. Cute chibi, head about 1/3 of body height, big round dark-brown eyes with two white highlights, small smile. Thick clean dark-brown outline #2A1608, flat cel shading (one shadow tone, one highlight), warm saturated colors, Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac bird). Clean vector look, crisp edges.
LIGHT FILE: small image, flat fills, about 20-30 colors, no gradients, no texture, no noise, no glow halos except the small effect asked, no scattered sparkles.
GRID: invisible grid of equal square cells exactly as I specify, ONE subject/pose per cell, same character same size in every cell, at least 8% empty margin inside each cell, nothing crosses into another cell, feet on the same baseline 8% above the cell bottom, characters face RIGHT in 3/4 view unless I say FRONT or PORTRAIT.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere (cells and gaps). No floor, no shadow, no grid lines, no borders, no text, no numbers, no labels, no watermark. Never use magenta or pink-purple on the subject.
Reply only "OK" now; for each next message generate exactly one image following these rules.
```

---

## B. TƯỚNG — bảng 6 ô (ảnh 768×512, lưới 3×2, ô 256)
Thứ tự ô: **[1] đứng cầm vũ khí · [2] lấy đà · [3] ra đòn (1 vệt chém nhạt) · [4] tung chiêu (hiệu ứng nhỏ màu hành quanh tay) · [5] chính diện · [6] chân dung vai trở lên (chiếm 80% ô).**

Mẫu chung (mỗi tướng dưới đây đã điền sẵn, chỉ việc dán):

### Thợ Rèn Đông Sơn (`thoren`) · Thường · Hỏa · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thợ Rèn Đông Sơn: stocky young bronze-smith, bare muscular arms, leather apron over red-brown loincloth, orange headband, soot on cheeks. Weapon: heavy bronze forging hammer glowing orange at the head. Element FIRE, glow #FF7A3A. Cast effect: sparks and small flames from the hammer. Rarity: common (simple costume).
```

### Ngư Phủ Sông Đà (`nguphu`) · Thường · Thủy · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Ngư Phủ Sông Đà: lean river fisherman, conical palm-leaf hat (nón lá), rolled-up indigo trousers, rope belt with a small fish basket. Weapon: three-prong bamboo fishing spear, a folded fishing net on the shoulder. Element WATER, glow #5AB4D6. Cast effect: net thrown open with water drops. Rarity: common.
```

### Thợ Gốm Phù Lãng (`thogom`) · Thường · Thổ · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up (arm back to throw) [3] throw, a clay pot flying forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thợ Gốm Phù Lãng: cheerful potter girl, ochre-brown tunic, clay-stained apron, hair tied with a brown cloth. Weapon: round glazed brown clay pot held in one hand (thrown, bursts into dust). Element EARTH, glow #C99A3C. Cast effect: swirling clay dust and pottery shards. Rarity: common.
```

### Thầy Lang Lá Thuốc (`thaylang`) · Thường · Mộc · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a leaf bolt forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thầy Lang Lá Thuốc: old village herbalist, white beard, green tunic, woven herb bag across the chest. Weapon: wooden walking staff topped with a bundle of medicinal leaves glowing green. Element WOOD, glow #5FD06A. Cast effect: green healing leaves spiraling. Rarity: common.
```

### Thần Trống Đồng (`trongdong`) · Tím · Kim · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thần Trống Đồng: powerful bronze-drum spirit, golden bronze armor engraved with sun-star, feather crown of Lac birds, a small Dong Son bronze drum on his back. Weapon: big bronze drum mallet. Element METAL, glow #F2D27A. Cast effect: golden sound rings expanding from the mallet. Rarity: epic (richer costume, purple-gold trim).
```

### Thần Cá Ông (`caong`) · Tím · Thủy · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thần Cá Ông: big gentle whale-god guardian of fishermen, humanoid with whale-blue skin and white belly, fin-like shoulder plates, kind old face with a short white beard, small pearl necklace. Weapon: none, fights with heavy fin-fists. Element WATER, glow #9EDDF2. Cast effect: a water spout shooting from his back. Rarity: epic.
```

### Ông Táo (`ongtao`) · Tím · Hỏa · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Ông Táo (Kitchen God): jolly man in a black scholar hat and red-orange robe, golden carp motif on the belt. Weapon: pair of long iron fire tongs holding a glowing coal. Element FIRE, glow #FF8A3A. Cast effect: a small golden carp of fire jumping from the tongs. Rarity: epic.
```

### Nữ Thần Mặt Trời (`matroi`) · Vàng · Hỏa · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a fireball forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Nữ Thần Mặt Trời: radiant sun goddess, golden-orange áo dài-style robe with flame hem, sun-disk halo with 12 short rays behind her head, gold crown. Weapon: golden staff topped with a small sun orb. Element FIRE, glow #FFB04A. Cast effect: a three-legged golden crow of fire. Rarity: legendary (most ornate, gold trim).
```

### Mẫu Thoải (`mauthoai`) · Vàng · Thủy · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a water orb forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Mẫu Thoải (Holy Mother of Waters): serene goddess in a white and pale-blue robe, silver crown, white lotus at the chest, long black hair with pearl pins. Weapon: pearl-white staff with a blue water orb. Element WATER, glow #9EDDF2. Cast effect: a swirling water wave ring. Rarity: legendary.
```

### Thần Trụ Trời (`trutroi`) · Vàng · Thổ · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thần Trụ Trời (giant who built the sky pillar): huge stocky giant, stone-grey skin with ochre earth patterns, loincloth of woven rope, rocks on shoulders like armor. Weapon: a stone pillar club. Element EARTH, glow #C99A3C. Cast effect: rock pillars bursting from the ground. Rarity: legendary.
```

### Chúa Sơn Lâm (`ongho`) · Vàng · Mộc · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle [2] wind-up crouch [3] pounce strike with claw swoosh [4] cast skill (roar), small effect around mouth [5] front view [6] portrait head+shoulders.
Chúa Sơn Lâm (Ông Ba Mươi, the tiger lord): tiger-headed warrior with orange and black stripes, green leaf mantle, bronze arm rings. Weapon: big claws. Element WOOD, glow #5FD06A. Cast effect: green roar wave. Rarity: legendary.
```

### Lang Liêu (`langlieu`) · Tím · Thổ · đánh xa (còn thiếu từ trước)
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] toss forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Lang Liêu: gentle humble prince, ochre-yellow tunic with brown sash, small gold headband. Weapon: square green banh chung rice cake tied with bamboo string. Element EARTH, glow #D9A84E. Cast effect: golden rice grains swirling. Rarity: epic.
```

---

## C. ĐỘNG TÁC (action) 4 khung — chỉ gen khi đã có bảng 6 ô ở trên
Đính kèm ảnh bảng 6 ô của tướng đó. Ảnh **1024×256, 4 ô một hàng**. Tên file `<mã>-attack.png`, `<mã>-cast.png`.

```
ACTION STRIP 1024x256, 4 cells in one row, same character as the attached sheet: {ACTION}.
```
Thay `{ACTION}` bằng một dòng:

| Mã | Đánh (attack) | Chiêu (cast) |
|---|---|---|
| thoren | 1 ready · 2 hammer raised high · 3 hammer slams down, orange sparks · 4 recover | 1 raise hammer · 2 hammer glows · 3 forge explodes in flames around him · 4 lower |
| nguphu | 1 ready · 2 spear pulled back · 3 thrust forward · 4 recover | 1 hold net · 2 spin net · 3 net flies open with drops · 4 lower |
| thogom | 1 hold pot · 2 arm back · 3 pot thrown forward · 4 recover | 1 pot raised · 2 dust swirls · 3 big clay boulder rolls forward · 4 lower |
| thaylang | 1 ready · 2 staff back · 3 leaf bolt forward · 4 recover | 1 raise staff · 2 leaves gather · 3 green leaves burst outward · 4 lower |
| trongdong | 1 ready · 2 mallet back · 3 mallet strike with gold ring · 4 recover | 1 raise mallet · 2 drum glows · 3 golden shock rings · 4 lower |
| caong | 1 ready · 2 fin-fist back · 3 punch with water splash · 4 recover | 1 inhale · 2 back spout rises · 3 big water spout · 4 settle |
| ongtao | 1 ready · 2 tongs back · 3 tongs jab with coal sparks · 4 recover | 1 tongs raised · 2 coal glows · 3 fire carp leaps forward · 4 lower |
| matroi | 1 ready · 2 staff back · 3 fireball forward · 4 recover | 1 halo brightens · 2 hands raised · 3 fire crow flies out · 4 lower |
| mauthoai | 1 ready · 2 staff back · 3 water orb forward · 4 recover | 1 raise staff · 2 water ring forms · 3 wave ring bursts · 4 lower |
| trutroi | 1 ready · 2 pillar club raised · 3 ground slam · 4 recover | 1 raise arms · 2 ground cracks · 3 rock pillars burst up · 4 lower |
| ongho | 1 crouch · 2 leap · 3 claw slash · 4 land | 1 inhale · 2 mouth open · 3 roar wave · 4 settle |

---

## D. ICON KỸ NĂNG — 4 icon / tướng (ảnh 512×128, 4 ô một hàng, ô 128)
Tên file `icon-<mã>.png`. Thứ tự Q · W · E · R.

```
ICON ROW 512x128, 4 square cells, one bold simple skill icon per cell, centered, no character body, thick #2A1608 outline: {4 ICONS}.
```

| Mã | 4 icon (Q · W · E · R) |
|---|---|
| thoren | glowing red-hot hammer · forge fire · bronze chest armor · exploding furnace |
| nguphu | thrown fishing net · three-prong fish spear · splashing wave on a boat side · bamboo basket boat on a wave |
| thogom | clay pot bursting · fired clay brick · cracked glaze pattern shield · rolling clay boulder |
| thaylang | herb bundle with a green cross · poison leaf · fragrant forest leaves · glowing healing leaf circle |
| trongdong | drum mallet hitting a drum · sound wave rings · bronze drum sun face · lightning over a bronze drum |
| caong | water spout · shield over a small boat · whale skin with spikes · giant tidal wave |
| ongtao | fire tongs holding a coal · three hearth stones with fire · scroll to heaven · fire carp turning into a dragon |
| matroi | sun pillar beam · summer sun · three-legged fire crow · solar eclipse |
| mauthoai | silver wave · holy water lotus · ice pearl · underwater palace gate opening |
| trutroi | foot stomp crack · stone pillar · stone body · giant rock lifted by hands |
| ongho | tiger pounce claw · roar · tiger paw print with leaves · hunting horn with tiger |

---

## E. ICON THẦN KHÍ — 3 icon / tướng Vàng (ảnh 384×128, 3 ô một hàng)
Tên file `than-khi-<mã>.png`, thứ tự theo bảng.

```
ICON ROW 384x128, 3 square cells, one bold simple treasure icon per cell, centered, gold rim: {3 ICONS}.
```

| Mã | 3 thần khí |
|---|---|
| giong | iron armor · bamboo staff of golden bamboo · iron horse head breathing fire |
| llq | dragon scale · water-dragon sword · underwater palace |
| kimquy | golden turtle shell · golden turtle claw (crossbow trigger) · glowing lake with a sword |
| adv | repeating crossbow · spiral citadel walls · royal Au Lac robe |
| auco | egg sac with a hundred eggs · fairy wings · mother mountain |
| mau | sacred forest tree · thousand-year vines · forest fruits and flowers |
| matroi | sun disk · three-legged crow · sunset-cloud robe |
| mauthoai | sea pearl · holy wave · white lotus throne |
| trutroi | stone sky pillar · giant hands holding the sky · earth mound |
| ongho | tiger claw · tiger stripes with leaves · northwest mountain forest |

---

## F. ICON ẤN PHÙ — 3 tấm, mỗi tấm 12 icon (ảnh 512×384, lưới 4×3, ô 128)
Tên file `an-phu-nui.png`, `an-phu-gio.png`, `an-phu-sam.png`. Icon là một **viên ấn tròn bằng đá / đồng**, ký hiệu khắc nổi, viền màu nhánh.

```
RUNE SHEET 512x384, 4x3 square cells, one round carved stone-bronze rune seal per cell, rim color {COLOR}, symbol carved in the middle: {12 SYMBOLS, left to right, top to bottom}.
```

| Tấm | Màu viền | 12 ký hiệu |
|---|---|---|
| nui | #D9844A | crossed swords · heart · spring water · pickaxe · bronze shield · demon mask · cactus spikes · sledgehammer · skull · falling mountain · stone shield · volcano |
| gio | #6FCB8A | wind swirl · four-point star · target · burst · eagle · spiral · coin · blood drop · trap · tornado · lightning bolt · eye |
| sam | #7FA8F0 | radiant sun · hourglass · water drop · crystal ball · amulet eye · bottle · flame · crescent moon · wind chime · thunder cloud · skull spirit · bell |

---

## G. QUÁI CÒN THIẾU — 3 ô (ảnh 576×192, 3 ô một hàng, ô 192)
Thứ tự ô: **[1] bước A · [2] bước B · [3] tấn công.** Tên file theo mã.

```
ENEMY ROW 576x192, 3 cells: [1] walk step A [2] walk step B (opposite legs) [3] attack. Cute-mischievous chibi monster facing right: {CREATURE}.
```

| Mã | Quái |
|---|---|
| yeutinh | Yêu Tinh Rừng: small green forest goblin, pointy ears, yellow eyes, leaf loincloth, wooden club (attack: club swing) |
| dacon | Đá Con: tiny grey rock creature with small legs and orange eyes (attack: rolls forward) |
| linhan | Quỷ Giáo: grey-green goblin soldier with small horns and tusks, dark-red vest, leather cap, round wooden shield, long bronze spear (attack: spear thrust) |

**Boss:** đã đủ ảnh cho 9 boss — không cần gen. Muốn thêm động tác cho boss thì dùng mục C với `{ACTION}` = *1 stand · 2 raise · 3 attack slam · 4 roar*.

---

# BỔ SUNG v96 — 6 tướng hành Hỏa (đủ 4 mỗi bậc)
Dùng đúng KHỐI LUẬT ở mục A. Mỗi khối dưới đây là một ảnh.

## B+. Bảng tướng 6 ô

### Chàng Đốt Nương (`dotnuong`) · Thường · Hỏa · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Chàng Đốt Nương: young highland farmer, dark-red loincloth and sleeveless brown vest, red headband, bare feet, ember-smudged arms. Weapon: long curved slash-and-burn machete. Element FIRE, glow #FF7A3A. Cast effect: ring of field fire around him. Rarity: common.
```

### Cô Thả Đèn Trời (`denroi`) · Thường · Hỏa · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] releasing a glowing lantern forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Cô Thả Đèn Trời: cheerful village girl in an orange áo tứ thân and yellow sash, hair in a bun with a red ribbon. Weapon: a glowing paper sky lantern held up with both hands. Element FIRE, glow #FFB04A. Cast effect: several small sky lanterns rising. Rarity: common.
```

### Vua Lửa Pơtao Apui (`potaoapui`) · Tím · Hỏa · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Vua Lửa Pơtao Apui (Fire King of the Jarai highlands): strong chieftain in a red and black brocade loincloth with highland zigzag patterns, bronze arm rings, red feather headdress. Weapon: sacred long sword glowing with fire. Element FIRE, glow #FF6A3A. Cast effect: a ring of flame rising from the ground. Rarity: epic.
```

### Bà Hỏa (`baahoa`) · Tím · Hỏa · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a fireball forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Bà Hỏa (Lady of Fire, folk spirit): mysterious woman in a deep-red robe with black flame patterns, long black hair floating like smoke, small fire crown. Weapon: dark staff topped with a red flame orb. Element FIRE, glow #E0452C. Cast effect: black smoke with red embers. Rarity: epic.
```

### Kinh Dương Vương (`kinhduong`) · Vàng · Hỏa · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Kinh Dương Vương (King of Xích Quỷ, father of Lạc Long Quân): majestic king in red and gold royal armor, gold crown with a sun-star, red cape, short black beard. Weapon: broad red-gold sword. Element FIRE, glow #FF6A3A. Cast effect: a small fire dragon coiling around the sword. Rarity: legendary.
```

### Viêm Đế Thần Nông (`viemde`) · Vàng · Hỏa · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a fireball forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Viêm Đế Thần Nông (Flame Emperor, god of farming): wise old god with long white beard, leaf-and-straw cape over an orange robe, sun halo behind the head, small rice-ear crown. Weapon: wooden staff with a flame at the top and herbs tied to it. Element FIRE, glow #FFB04A. Cast effect: flaming rice ears and herbs swirling. Rarity: legendary.
```

## C+. Động tác 4 khung

| Mã | Đánh (attack) | Chiêu (cast) |
|---|---|---|
| dotnuong | 1 ready · 2 machete back · 3 wide slash with embers · 4 recover | 1 raise machete · 2 fire spreads on ground · 3 field fire ring · 4 lower |
| denroi | 1 hold lantern · 2 lift lantern · 3 lantern flies forward · 4 recover | 1 hands together · 2 lanterns appear · 3 lanterns rise and fall as fire · 4 lower |
| potaoapui | 1 ready · 2 sword raised · 3 fiery slash · 4 recover | 1 sword down · 2 ground glows · 3 flame ring erupts · 4 lower |
| baahoa | 1 ready · 2 staff back · 3 fireball forward · 4 recover | 1 raise staff · 2 smoke gathers · 3 smoke cloud with embers · 4 lower |
| kinhduong | 1 ready · 2 sword raised · 3 heavy slash with fire trail · 4 recover | 1 sword up · 2 dragon forms · 3 fire dragon breath · 4 lower |
| viemde | 1 ready · 2 staff back · 3 fireball forward · 4 recover | 1 raise staff · 2 halo brightens · 3 rain of flaming rice ears · 4 lower |

## D+. Icon kỹ năng (Q · W · E · R)

| Mã | 4 icon |
|---|---|
| dotnuong | machete with ember · fire line on a river · smoke over a field · burning forest |
| denroi | sky lantern falling · lantern wick flame · wishing lantern with a star · many flying lanterns |
| potaoapui | flaming sword · volcano oath stone · ring of fire · erupting volcano |
| baahoa | small flame · spreading fire · black smoke cloud · sea of fire |
| kinhduong | red-gold sword · rice and leaf crest · royal command banner · fire dragon |
| viemde | first flame on a torch · herb bundle · fire plough · falling fire sun |

## E+. Icon Thần Khí

| Mã | 3 thần khí |
|---|---|
| kinhduong | red demon-realm sword · golden throne · lake with a dragon princess silhouette |
| viemde | sacred farming fire · divine plough · hundred herbs bundle |

---

# BỔ SUNG v97 — 6 tướng hành Thủy (đủ 4 mỗi bậc)

## B+. Bảng tướng 6 ô

### Chàng Chèo Đò (`chodo`) · Thường · Thủy · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Chàng Chèo Đò: sturdy young ferryman, blue-grey shirt with rolled sleeves, black trousers, blue headband, tanned skin. Weapon: long wooden boat oar. Element WATER, glow #5AB4D6. Cast effect: a wave rolling from the oar. Rarity: common.
```

### Cô Hái Sen (`haisen`) · Thường · Thủy · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding a lotus [2] wind-up [3] tossing lotus seeds forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Cô Hái Sen: gentle girl in a pale pink áo bà ba and green trousers, conical hat on her back, pink lotus flower in her hair. Weapon: a big pink lotus with a seed pod. Element WATER, glow #FF9EC4 with blue water drops. Cast effect: lotus petals and rain drops. Rarity: common.
```

### Lý Ngư Tướng Quân (`lyngu`) · Tím · Thủy · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] spear thrust with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Lý Ngư Tướng Quân (Carp General who leapt the Dragon Gate): young warrior with golden-orange carp-scale armor, fin-shaped shoulder guards, carp-tail cape, small gold crown. Weapon: golden trident spear. Element WATER, glow #FFB04A with blue water. Cast effect: a jumping golden carp of water. Rarity: epic.
```

### Trương Chi (`truongchi`) · Tím · Thủy · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle playing a flute [2] wind-up [3] sending a music note orb forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Trương Chi: humble fisherman singer, simple indigo shirt, conical hat, kind sad smile. Weapon: bamboo flute. Element WATER, glow #9EDDF2. Cast effect: floating blue music notes and river mist. Rarity: epic.
```

### Rồng Mẹ Hạ Long (`halong`) · Vàng · Thủy · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle [2] wind-up [3] claw strike with one short pale swoosh [4] cast skill, small effect around mouth [5] front view [6] portrait head+shoulders.
Rồng Mẹ Hạ Long (Mother Dragon of Ha Long Bay): cute chibi Vietnamese dragon standing upright, jade-teal scales with pearl-white belly, golden horns and whiskers, small pearl crown. Element WATER, glow #7FE8E0. Cast effect: spitting jade pearls that turn into tiny islands. Rarity: legendary.
```

### Long Nữ Động Đình (`longnu`) · Vàng · Thủy · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a water orb forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Long Nữ Động Đình (Dragon Princess, mother of Lạc Long Quân): graceful princess in a teal and white silk robe with wave patterns, small dragon horns, pearl crown, long black hair. Weapon: staff topped with a glowing dragon pearl. Element WATER, glow #5AD6C8. Cast effect: a small water dragon circling the pearl. Rarity: legendary.
```

## C+. Động tác 4 khung

| Mã | Đánh (attack) | Chiêu (cast) |
|---|---|---|
| chodo | 1 ready · 2 oar back · 3 wide oar sweep with splash · 4 recover | 1 raise oar · 2 water swirls · 3 wave rolls forward · 4 lower |
| haisen | 1 hold lotus · 2 lift · 3 seeds fly forward · 4 recover | 1 lotus up · 2 petals gather · 3 lotus rain · 4 lower |
| lyngu | 1 ready · 2 trident back · 3 thrust with water trail · 4 recover | 1 crouch · 2 leap · 3 golden carp turns into water dragon · 4 land |
| truongchi | 1 flute ready · 2 inhale · 3 note orb flies · 4 lower | 1 play flute · 2 notes swirl · 3 mist and notes burst · 4 lower |
| halong | 1 ready · 2 claw raised · 3 claw swipe with sea spray · 4 recover | 1 inhale · 2 pearls glow in mouth · 3 pearls spat out · 4 settle |
| longnu | 1 ready · 2 staff back · 3 water orb forward · 4 recover | 1 raise staff · 2 water dragon forms · 3 dragon wave bursts · 4 lower |

## D+. Icon kỹ năng (Q · W · E · R)

| Mã | 4 icon |
|---|---|
| chodo | oar hitting · sweeping oar arc · sturdy body with water drops · ferry boat on a wave |
| haisen | pink lotus · lotus seed pod · lotus scent swirl · rain over a lotus pond |
| lyngu | trident · golden carp scale · carp tail splash · carp turning into a dragon |
| truongchi | bamboo flute with notes · singing mouth with notes · river mist · last song note over waves |
| halong | bay wave · jade scale shield · pearl becoming an island · dragon flock |
| longnu | dragon pearl · lake water drop · ice dragon · underwater palace waves |

## E+. Icon Thần Khí

| Mã | 3 thần khí |
|---|---|
| halong | jade dragon scale · pearl island · Ha Long bay with limestone islets |
| longnu | dragon pearl · Dong Dinh lake · pearl silk robe |

---

# BỔ SUNG v100 — 6 tướng hành Thổ (đủ 4 mỗi bậc)

## B+. Bảng tướng 6 ô

### Người Đắp Đê (`dapde`) · Thường · Thổ · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Người Đắp Đê: sturdy villager building river dikes, brown shirt, rolled trousers, conical hat, mud on legs, a woven basket of earth on the back. Weapon: wide iron hoe. Element EARTH, glow #C99A3C. Cast effect: a small earth wall rising. Rarity: common.
```

### Trẻ Chăn Trâu (`chantrau`) · Thường · Thổ · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding a slingshot [2] pulling the slingshot back [3] pebble flying forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Trẻ Chăn Trâu: cheeky buffalo-herding kid, brown shorts, bare chest, ochre headband, bamboo flute tucked in the belt. Weapon: wooden slingshot with river pebbles. Element EARTH, glow #E8C27A. Cast effect: many pebbles bouncing. Rarity: common.
```

### Ông Đùng (`ongdung`) · Tím · Thổ · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around feet [5] front view [6] portrait head+shoulders.
Ông Đùng (folk giant who carried earth to build mountains): huge friendly giant, brown skin, straw loincloth, big carrying pole with two baskets of earth, bushy eyebrows. Weapon: the carrying pole. Element EARTH, glow #C99A3C. Cast effect: giant footprint cracking the ground. Rarity: epic.
```

### Thổ Công (`thocong`) · Tím · Thổ · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting a golden orb forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Thổ Công (household earth god): kind round-bellied old man with long white beard, yellow-brown robe, black scholar hat, smiling. Weapon: wooden staff with a golden earth orb. Element EARTH, glow #F2D27A. Cast effect: golden earth shield dome. Rarity: epic.
```

### Sơn Tinh (`tanvien`) · Vàng · Thổ · cận chiến
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] strike with one short pale swoosh [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Sơn Tinh (Mountain God of Tản Viên): heroic young god in green and gold bronze armor with mountain patterns, green cape, gold crown with three peaks, confident smile. Weapon: magic staff that moves mountains. Element EARTH, glow #7FC24A with gold. Cast effect: a small mountain rising from the ground. Rarity: legendary.
```

### Mẫu Địa (`maudia`) · Vàng · Thổ · đánh xa
```
HERO SHEET 768x512, 3x2 cells: [1] idle holding weapon [2] wind-up [3] casting an earth orb forward [4] cast skill, small effect around hands [5] front view [6] portrait head+shoulders.
Mẫu Địa (Holy Mother of Earth): serene goddess in an ochre-gold and brown robe with root patterns, gold crown, small flowers and roots in her hair. Weapon: staff of twisted roots with a glowing amber orb. Element EARTH, glow #E8C27A. Cast effect: roots and rocks rising. Rarity: legendary.
```

## C+. Động tác 4 khung

| Mã | Đánh (attack) | Chiêu (cast) |
|---|---|---|
| dapde | 1 ready · 2 hoe raised · 3 hoe slams ground · 4 recover | 1 hoe up · 2 earth gathers · 3 earth wall rises · 4 lower |
| chantrau | 1 aim · 2 pull back · 3 pebble flies · 4 recover | 1 load many pebbles · 2 pull · 3 bouncing pebbles · 4 lower |
| ongdung | 1 ready · 2 pole raised · 3 pole slam · 4 recover | 1 lift foot · 2 stomp · 3 ground cracks into a pond · 4 settle |
| thocong | 1 ready · 2 staff back · 3 orb forward · 4 recover | 1 raise staff · 2 golden glow · 3 earth dome · 4 lower |
| tanvien | 1 ready · 2 staff raised · 3 staff strike with rocks · 4 recover | 1 raise staff · 2 ground shakes · 3 mountain rises · 4 lower |
| maudia | 1 ready · 2 staff back · 3 amber orb forward · 4 recover | 1 raise staff · 2 roots gather · 3 roots and rocks burst up · 4 lower |

## D+. Icon kỹ năng (Q · W · E · R)

| Mã | 4 icon |
|---|---|
| dapde | hoe hitting the ground · earthen dike · earth shield wall · cracked broken dike |
| chantrau | bouncing pebble · pebble hitting a head with stars · bamboo flute on a buffalo · many kids with slingshots |
| ongdung | carrying pole with stone baskets · giant body · giant footprint pond · rising mountain |
| thocong | blessing hand · incense pot · earth dome shield · glowing earth god shrine |
| tanvien | moving hill · Tan Vien mountain · rising mountain wall · mountain peaks rising from water |
| maudia | cracked earth · underground spring · sacred roots · mother mountain |

## E+. Icon Thần Khí

| Mã | 3 thần khí |
|---|---|
| tanvien | Tan Vien mountain · mountain-moving staff · nine-tusk elephant wedding gift |
| maudia | earth vein lava · sacred roots · underground jade |
