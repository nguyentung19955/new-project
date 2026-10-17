# Prompt gen lại 3 hàng kiếm của Cu Tí — bớt cứng (17/10)

Vì sao gen lại: hàng kiếm 16/10 chỉ có tay vung, chân và thân đứng im, thân luôn thẳng. Hàng mới phải có **cả người chuyển động**: lấy đà (nhún, lùi trọng tâm) → lao người tới → ★ chạm (tay vươn hết, hông vặn) → theo đà → thu về.

## Gửi kèm (theo thứ tự, trước khi dán prompt)

1. **Ảnh nhân vật** (giữ mặt, tóc, áo, đai): `docs/anh-goc/zed/moi/01-dung.png` — đúng ảnh tham chiếu đã dùng cho các hàng 16/10.
2. **Hình que của hàng đó** (thư mục `docs/khung-que-8-huong/nguoi-dac/`):
   - Kiếm 1 → `kiem-1-v3-e.png` (7 khung)
   - Kiếm 2 → `kiem-2-v3-e.png` (6 khung)
   - Kiếm 3 → `kiem-3-v3-e.png` (7 khung)

   Màu hình que: cam = tay phải, vàng = chân phải (chân trước), tím = tay trái, xanh dương = chân trái (chân sau), nét chấm đỏ = hướng kiếm (chỉ là hướng, kiếm sẽ gắn bằng code). Xem thử chuyển động: `kiem-<n>-v3-que.gif` (chậm ×3).

Khung ★ (khung chạm) — để sau ghép đúng lúc chạm cũ trong game (u = 0,45, không đổi thời lượng đòn):

| Hàng | Số khung | Khung ★ | Mốc thời gian đề xuất (u) |
|---|---|---|---|
| Kiếm 1 — chém xéo từ trên xuống | 7 | **khung 4** | 0 · 0,10 · 0,25 · **0,45** · 0,60 · 0,74 · 0,88 |
| Kiếm 2 — chém ngược từ dưới lên | 6 | **khung 3** | 0 · 0,22 · **0,45** · 0,62 · 0,78 · 0,90 |
| Kiếm 3 — đòn kết, mạnh nhất | 7 | **khung 4** | 0 · 0,12 · 0,30 · **0,45** · 0,60 · 0,75 · 0,88 |

Ảnh nộp về: `docs/anh-goc/cu-ti-hang-moi-16-10/` (vd `08-kiem-1-7k-v3.png`, `09-kiem-2-6k-v3.png`, `10-kiem-3-7k-v3.png`, `kiem-vet-chem-3x3.png`).

---

## Prompt 1 — Kiếm 1 (gửi trước: `01-dung.png` + `kiem-1-v3-e.png`)

```
Pixel art sprite sheet, ONE horizontal row of 7 frames (not a grid, not a GIF), same frame size, all feet on one ground line, plain #00FF00 background.
Same chibi boy as the character reference (spiky black hair, red eyes, black ninja gi, red belt, sandals). Side view facing RIGHT. Copy the body pose of each frame from the colored mannequin: orange = right arm, yellow = right leg (front), purple = left arm, blue = left leg (back). Hands EMPTY, right hand a loose fist (sword is added in game; the red dotted line only shows the sword direction, do not draw it).
Whole-body diagonal downward slash: 1 wind-up, knees bent, weight back, right fist pulled behind the head. 2 rise up tall, fist high above the head. 3 front foot steps forward, body lunges and leans forward. 4 HIT: right arm fully extended forward, hips twisted, deepest lean. 5 follow-through, fist low in front of the front knee. 6 hold, still low. 7 recover to guard stance.
Back foot never moves, no jumping, belt knot always in front. Head height goes down and up clearly.
```

## Prompt 2 — Kiếm 2 (gửi trước: `01-dung.png` + `kiem-2-v3-e.png`)

```
Pixel art sprite sheet, ONE horizontal row of 6 frames (not a grid, not a GIF), same frame size, all feet on one ground line, plain #00FF00 background.
Same chibi boy as the character reference (spiky black hair, red eyes, black ninja gi, red belt, sandals). Side view facing RIGHT. Copy the body pose of each frame from the colored mannequin: orange = right arm, yellow = right leg (front), purple = left arm, blue = left leg (back). Hands EMPTY, right hand a loose fist (sword is added in game; the red dotted line only shows the sword direction, do not draw it).
Whole-body rising upward slash: 1 wind-up, deep crouch, right fist low behind the back hip. 2 front foot steps forward, body low and leaning forward, fist sweeping low in front of the knee. 3 HIT: body rises, right arm swings up and forward in front of the face. 4 follow-through, standing tall, right arm straight up above the head. 5 hold. 6 recover to guard stance.
Back foot never moves, no jumping, belt knot always in front. Head height goes down and up clearly.
```

## Prompt 3 — Kiếm 3 (gửi trước: `01-dung.png` + `kiem-3-v3-e.png`)

```
Pixel art sprite sheet, ONE horizontal row of 7 frames (not a grid, not a GIF), same frame size, all feet on one ground line, plain #00FF00 background.
Same chibi boy as the character reference (spiky black hair, red eyes, black ninja gi, red belt, sandals). Side view facing RIGHT. Copy the body pose of each frame from the colored mannequin: orange = right arm, yellow = right leg (front), purple = left arm, blue = left leg (back). Hands EMPTY, right hand a loose fist (sword is added in game; the red dotted line only shows the sword direction, do not draw it).
Powerful finishing strike: 1 deep wind-up, very low crouch, torso twisted back, right arm stretched far behind. 2 coil, right fist up over the back shoulder. 3 big lunge, front foot steps forward, body leans far forward. 4 HIT: longest lunge, right arm fully straight forward at shoulder height, left arm thrown back. 5 follow-through, fist drops low in front, body still low. 6 hold the finishing pose. 7 recover to guard stance.
Back foot never moves, no jumping, belt knot always in front. Head height goes down and up clearly.
```

## Prompt gộp (tuỳ chọn — 3 hàng trong 1 lượt; gửi trước: `01-dung.png` + 3 hình que kiem-1/2/3-v3-e.png theo đúng thứ tự)

Ít chắc ăn hơn gen riêng (`GEN-GOP.md` từng để kiếm 2 gen riêng; hàng nhân vật dễ bị lẫn số khung giữa các hàng). Nên gen riêng 3 prompt trên; chỉ dùng prompt gộp nếu muốn tiết kiệm lượt và nhớ **đếm lại số khung từng hàng (7 / 6 / 7)** trước khi nộp.

```
Pixel art sprite sheet, 3 horizontal rows, plain #00FF00 background, wide green gaps between rows and between frames. Not a GIF.
Same chibi boy as the character reference (spiky black hair, red eyes, black ninja gi, red belt, sandals), side view facing RIGHT, hands EMPTY (right hand a loose fist; sword added in game). Each row copies the body poses of one colored mannequin sheet, in order: orange = right arm, yellow = front leg, purple = left arm, blue = back leg; ignore the red dotted line.
Row 1 = mannequin sheet 1, exactly 7 frames: downward diagonal slash (wind-up, rise, lunge, HIT frame 4, follow-through, hold, recover).
Row 2 = mannequin sheet 2, exactly 6 frames: upward rising slash (crouch, low lunge, HIT frame 3, arm up, hold, recover).
Row 3 = mannequin sheet 3, exactly 7 frames: powerful lunge strike (deep crouch, coil, lunge, HIT frame 4, follow-through, hold, recover).
In every frame the back foot stays planted, no jumping, belt knot in front, body leans and bobs with the swing. Same character size in all rows.
```

## Prompt 4 — Tấm VỆT CHÉM (gửi trước: không bắt buộc; có thể gửi `kiem-1-v3-e.png` để AI hiểu hướng vung)

Dùng để game gắn vệt chém lúc ★ (là ẢNH, không vẽ bằng code). 3 hàng × 3 khung.

```
Pixel art effect sprite sheet, 3 rows x 3 frames, plain #00FF00 background, wide green gaps, no character, no sword. Not a GIF.
Sword slash smear / arc trail, white core fading to pale cyan edges, crisp pixel edges, no glow outside the arc, no green tint inside.
Row 1: diagonal arc from upper-left down to lower-right (downward slash), crescent opening to the left.
Row 2: arc from lower-left up to upper-right (rising slash).
Row 3: wide, thick horizontal arc sweeping forward to the right (powerful finishing strike), biggest of the three.
In each row: frame 1 full bright arc, frame 2 thinner and partly broken, frame 3 faint thin wisps almost gone.
```
