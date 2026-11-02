# Prompt ChatGPT — ảnh cho DEMO "Thủ Thành Ghép Tướng" (`demo/`)

Dán từng prompt dưới đây vào ChatGPT (tạo ảnh). Mỗi lần **một ảnh**. Luôn dán kèm đoạn **PHONG CÁCH CHUNG** ở đầu
(hoặc dán một lần đầu cuộc trò chuyện rồi nói "giữ đúng phong cách trên").

Tải ảnh về, **đổi tên đúng như cột "Lưu thành"**, thả vào thư mục ghi bên cạnh trong `demo/assets/`.
Demo tự dùng ảnh mới nếu có; chưa có thì dùng ảnh pixel tạm của game chính — không cần sửa code.
Tải lại trang (Ctrl+F5) là thấy.

> Ảnh phải **PNG nền trong suốt** (trừ ảnh nền sân). Nếu ChatGPT trả nền trắng/caro giả, nói thêm:
> "make the background truly transparent (alpha), no checkerboard, no white".

---

## PHONG CÁCH CHUNG (dán trước mọi prompt)

```
Style: high-quality 2D pixel art for a mobile merge tower-defense game based on Vietnamese mythology.
Crisp pixel edges, 1px dark outline, limited ancient palette (bronze, deep vermilion red, old turmeric gold,
indigo, moss green, earth brown, smoky black), 3-tone shading, strong light from top-left.
Semi-chibi but epic and dignified (head:body about 1:1.7), small intense eyes, serious/heroic faces,
NOT cute, NOT kawaii, no pink cheeks. Authentic Vietnamese motifs: Dong Son bronze drum patterns
(concentric circles, sawtooth, Lac birds), loincloths, cross-collar tunics, feathered headdresses,
bronze axes and spears, Ly–Tran dragons. No Japanese/Chinese/Korean/Western elements (no kimono, no knight armor).
Single character, full body, centered, feet touching the bottom edge, facing RIGHT, 3/4 view,
transparent background (PNG alpha), no text, no frame, no shadow on the ground, no extra objects.
```

---

## 1. Tướng (8 ảnh) — **256×256 px**, nền trong suốt, nhìn sang PHẢI, đứng thế sẵn sàng

Thả vào `demo/assets/tuong/`

| Lưu thành | Tướng | Hành / kiểu đánh |
|---|---|---|
| `giong.png` | Thánh Gióng | Hỏa · Đốt |
| `sontinh.png` | Sơn Tinh | Thổ · Choáng |
| `thuytinh.png` | Thủy Tinh | Thủy · Làm chậm |
| `llq.png` | Lạc Long Quân | Thủy · Lan |
| `auco.png` | Âu Cơ | Mộc · Cổ vũ |
| `cdt.png` | Chử Đồng Tử | Kim · Tài lộc |
| `mychau.png` | Mỵ Châu (nỏ thần) | Kim · Nỏ thần (nhiều tên) |
| `thachsanh.png` | Thạch Sanh | Thổ · Diệt boss |

**giong.png**
```
Thanh Giong, legendary Vietnamese boy-giant hero, iron armor glowing red-hot at the seams, yellow head scarf,
flowing dark red cape, holding a long iron staff (or a burning bamboo stalk), small flames licking around his feet
and shoulders. Main color: fiery orange-red (Fire element). 256x256 px, transparent background.
```

**sontinh.png**
```
Son Tinh, Mountain God of Tan Vien, broad-shouldered mature man with a stern face, green-brown robe with
mountain-ridge patterns, golden crown with peaks, holding a magic staff/book that raises rocks, a few floating
stone fragments around his hands. Main color: earth brown and moss green (Earth element). 256x256 px, transparent background.
```

**thuytinh.png**
```
Thuy Tinh, Water God, fierce sea-lord with dragon-scale armor in deep indigo and teal, horned dragon helmet,
long trident, swirling water waves wrapping his lower body, droplets in the air. Menacing but heroic.
Main color: deep blue (Water element). 256x256 px, transparent background.
```

**llq.png**
```
Lac Long Quan, Dragon Lord ancestor of the Vietnamese, regal bearded man in dark blue royal robe with
golden Ly-dynasty dragon embroidery, golden crown, a small serpentine water-dragon coiling around him,
crackling blue-white lightning in one hand. Main color: blue and gold (Water element). 256x256 px, transparent background.
```

**auco.png**
```
Au Co, fairy mother of the Vietnamese, graceful dignified woman in white and leaf-green dress with Dong Son
patterns, large white crane/Lac-bird feather wings, feathered headdress, holding a glowing green feather fan
that spreads healing leaves. Main color: leaf green and white (Wood element). 256x256 px, transparent background.
```

**cdt.png**
```
Chu Dong Tu, humble fisherman-turned-saint, bare-chested young man with a loincloth, holding the magic staff
and the magic conical hat (non la), golden coins and gold sparkles falling from the hat.
Main color: gold and white-silver (Metal element). 256x256 px, transparent background.
```

**mychau.png**
```
My Chau, princess of Au Lac, young woman with long black hair, purple-violet silk dress, goose-feather cloak
(white feathers), aiming the golden magic crossbow of An Duong Vuong (crossbow trigger shaped like a golden
turtle claw), several glowing golden arrows. Main color: gold and violet (Metal element). 256x256 px, transparent background.
```

**thachsanh.png**
```
Thach Sanh, woodcutter hero, muscular young man in a simple brown loincloth, carrying a large bronze axe,
a bow on his back and a magic lute (dan than) hanging at his side, determined face.
Main color: earth brown and bronze (Earth element). 256x256 px, transparent background.
```

---

## 2. Quái (3 ảnh) + Boss (3 ảnh) — nền trong suốt, nhìn sang PHẢI (đang bước đi)

Thả vào `demo/assets/quai/`

| Lưu thành | Quái | Cỡ |
|---|---|---|
| `thuong.png` | Lính Tôm (quái thường) | 192×192 |
| `nhanh.png` | Cáo Lửa (quái nhanh) | 192×192 |
| `trau.png` | Rùa Đá (quái trâu, máu dày) | 192×192 |
| `boss-chantinh.png` | Boss Chằn Tinh (đợt 10, 40…) — hoá đá tướng | 384×384 |
| `boss-haba.png` | Boss Hà Bá (đợt 20, 50…) — cuốn tướng đổi chỗ | 384×384 |
| `boss-hotinh.png` | Boss Hồ Tinh (đợt 30, 60…) — hồi máu | 384×384 |

**thuong.png**
```
Shrimp soldier monster of the Water God's army, orange armored shrimp walking upright on legs, holding a small
spear and round bronze shield, angry eyes. Walking pose to the right. 192x192 px, transparent background.
```

**nhanh.png**
```
Fire fox spirit monster, lean orange fox running fast to the right, tail made of blue-green ghost fire,
sharp teeth, wild eyes. Dynamic running pose. 192x192 px, transparent background.
```

**trau.png**
```
Stone turtle monster, huge tortoise with a cracked mossy stone shell carved with an ancient stele, slow heavy
walk to the right, glowing angry eyes. Looks very tanky. 192x192 px, transparent background.
```

**boss-chantinh.png**
```
Chan Tinh, giant python-ogre demon from the Thach Sanh legend: huge green-skinned ogre with snake features,
horns, tusks, holding a stone-spiked club, grey petrifying mist swirling from its hand. Very intimidating boss,
walking to the right. 384x384 px, transparent background.
```

**boss-haba.png**
```
Ha Ba, river lord demon: massive blue-scaled sea-serpent man with coral horns, seashell crown, green seaweed
robe, trident, whirlpools of water spinning around him. Boss, walking to the right. 384x384 px, transparent background.
```

**boss-hotinh.png**
```
Ho Tinh, nine-tailed fox demon: tall white fox spirit with purple-violet flame tails (many tails fanned out),
red markings on its face, holding a glowing green healing orb. Elegant but evil boss, walking to the right.
384x384 px, transparent background.
```

---

## 3. Nền sân, ô đặt tướng, Thành, hang quái

Thả vào `demo/assets/nen/`

| Lưu thành | Nội dung | Cỡ | Nền |
|---|---|---|---|
| `san.png` | Nền toàn màn (cỏ, đất) — KHÔNG vẽ đường, KHÔNG vẽ ô | **1688×780** (ngang) | đặc (không trong suốt) |
| `o-dat.png` | Một ô đặt tướng (phiến đá vuông) | 128×128 | đặc hoặc trong suốt |
| `thanh.png` | Cổng Thành cần bảo vệ (góc phải dưới) | 148×180 | trong suốt |
| `hang-quai.png` | Hang quái tràn ra (góc trái dưới) | 128×128 | trong suốt |

> Đường đất quái đi và bệ đá của sân 3×5 do code vẽ chồng lên nền (để khớp toạ độ), nên ảnh nền chỉ cần
> mặt đất trống, phần giữa nên **tối và ít chi tiết** cho tướng nổi bật.

**san.png**
```
Top-down pixel art game background, wide landscape 1688x780, dark ancient Vietnamese countryside at dusk:
dark green grass field with tiny pixel flowers, a few rice paddy edges, banana trees and bamboo clumps only
near the far left and far right edges, small stones. The center area is plain dark grass with low detail.
NO road, NO path, NO grid, NO buildings, NO characters, no text. Muted dark palette.
```

**o-dat.png**
```
Single square stone floor tile for placing heroes, 128x128 pixel art, top-down, dark weathered stone slab
with a thin carved Dong Son bronze-drum border pattern (sawtooth + small circles), subtle cracks,
slightly darker center. Seamless square, no text.
```

**thanh.png**
```
Pixel art ancient Vietnamese citadel gate (Co Loa style), front view, brick and rammed-earth wall with a
wooden two-tier roof with curved eaves, red-lacquered wooden gate, a red flag with a golden Lac bird on top.
148x180 px, transparent background, no text.
```

**hang-quai.png**
```
Pixel art dark monster cave entrance in a rocky cliff, front view, black inside with two small red glowing eyes,
moss and roots on the rocks. 128x128 px, transparent background, no text.
```

---

## 4. Nút (3 ảnh) — khung trống, KHÔNG có chữ (chữ do game ghi)

Thả vào `demo/assets/nut/`

| Lưu thành | Nút | Cỡ |
|---|---|---|
| `trieu-hoi.png` | Nút lớn "Triệu hồi" (góc phải dưới) | 392×152 |
| `the-bac.png` | Thẻ nâng bậc của từng tướng (5 cái hàng dưới) | 200×144 |
| `nho.png` | Nút nhỏ (x1/x2, tạm dừng) | 96×72 |

**trieu-hoi.png**
```
Pixel art game UI button, wide rectangle 392x152, ornate bronze frame with Dong Son drum sawtooth border,
inside glowing golden-orange lacquer with subtle sun-ray pattern from the bronze drum center, slight bevel,
corners decorated with small Lac birds. Completely EMPTY in the middle (no text, no icons). Transparent outside the button.
```

**the-bac.png**
```
Pixel art game UI card frame 200x144, dark red-brown lacquered wood with a thin bronze border and small corner
rivets, darker inner panel. Empty, no text, no icons. Transparent outside the card.
```

**nho.png**
```
Pixel art small square-ish game UI button 96x72, dark wood with bronze border, slight bevel, empty center,
no text, no icons. Transparent outside the button.
```

---

### Kiểm tra sau khi thả ảnh
- Mở `demo/index.html` (bấm đúp được, hoặc bản web `/demo/`). Màn chọn bộ hiện chân dung mới → ảnh tướng đã nhận.
- Ảnh tướng/quái mới chỉ cần **1 tư thế** (game tự nhún nhẹ khi đi). Ảnh dải khung pixel cũ vẫn là ảnh dự phòng.
- Tên file phải viết thường, không dấu, đúng như bảng.
