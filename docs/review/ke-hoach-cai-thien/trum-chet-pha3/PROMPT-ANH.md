# Ảnh còn thiếu — trùm vùng gục ở pha 2, pha 3

Ba trùm vùng chỉ có hàng **gục (die)** trong tấm pha 1. Tấm dáng pha 2, pha 3 (`<trùm>-p2`, `<trùm>-p3`) chỉ có 4 hàng idle / tele / atk / hit,
nên trùm chết ở pha 2, 3 hiện tạm bằng hàng **trúng đòn của tấm pha đó** (quằn quại đều 10 khung/giây rồi mờ dần) — không vẽ thêm gì bằng code.
Khi có ảnh: tách bằng `tools/tach-quai` thành hàng `die` (8 khung, 1,2 giây, `"mo": 0.6`) trong đúng tệp `<trùm>-p2` / `<trùm>-p3`;
game tự dùng ngay (`js/sprite_custom.js` `SC.phaTrum` đã nhận hàng `die`), không phải sửa code. Ảnh nổ (`hu-no-nho`, `hu-trum-no`) đã đủ.

Gửi kèm mỗi prompt đúng một ảnh mẫu (dáng pha đó) ghi bên dưới khối prompt.

## 1. Mộc Tinh pha 2 gục

```
Pixel art sprite strip, 8 frames in ONE horizontal row, frames spaced FAR apart with wide empty gaps, pure flat #00FF00 background.
Same character as the attached reference (angry tree spirit boss, phase 2), same palette, same size, same pixel scale, facing right, full body, feet on one baseline.
Death animation: 1 staggers hit, 2 bark cracks glow, 3 knees buckle, 4 branches droop, 5 trunk splits, 6 collapses forward, 7 crumbles into bark chunks and leaves, 8 small pile of bark and leaves.
No shadow, no ground, no text, no logo, no frame border, no motion blur, no extra effects outside the body.
```
Ảnh mẫu gửi kèm: `docs/anh-goc/trum-moi/moc-tinh-p2.png`

## 2. Mộc Tinh pha 3 gục

```
Pixel art sprite strip, 8 frames in ONE horizontal row, frames spaced FAR apart with wide empty gaps, pure flat #00FF00 background.
Same character as the attached reference (poisoned purple-green tree spirit boss, phase 3), same palette, same size, same pixel scale, facing right, full body, feet on one baseline.
Death animation: 1 recoils, 2 toxic veins flicker, 3 roots tear, 4 trunk bends, 5 trunk cracks open, 6 falls down, 7 dissolves into withered wood and poison drops, 8 small withered stump pile.
No shadow, no ground, no text, no logo, no frame border, no motion blur, no extra effects outside the body.
```
Ảnh mẫu gửi kèm: `docs/anh-goc/trum-moi/moc-tinh-p3.png`

## 3. Ngư Tinh pha 2 gục

```
Pixel art sprite strip, 8 frames in ONE horizontal row, frames spaced FAR apart with wide empty gaps, pure flat #00FF00 background.
Same character as the attached reference (enraged sea fish spirit boss, phase 2), same palette, same size, same pixel scale, facing right, full body, bottom on one baseline.
Death animation: 1 jolts, 2 fins go limp, 3 tilts sideways, 4 body sags, 5 scales dim, 6 slumps down, 7 melts into water and bubbles, 8 small puddle with a few scales.
No shadow, no ground, no text, no logo, no frame border, no motion blur, no extra effects outside the body.
```
Ảnh mẫu gửi kèm: `docs/anh-goc/trum-moi/ngu-tinh-p2.png`

## 4. Ngư Tinh pha 3 gục

```
Pixel art sprite strip, 8 frames in ONE horizontal row, frames spaced FAR apart with wide empty gaps, pure flat #00FF00 background.
Same character as the attached reference (frenzied ice-blue sea fish spirit boss, phase 3), same palette, same size, same pixel scale, facing right, full body, bottom on one baseline.
Death animation: 1 jolts, 2 ice crust cracks, 3 tilts sideways, 4 body sags, 5 ice shell shatters, 6 slumps down, 7 breaks into ice shards and water, 8 small pile of ice shards.
No shadow, no ground, no text, no logo, no frame border, no motion blur, no extra effects outside the body.
```
Ảnh mẫu gửi kèm: `docs/anh-goc/trum-moi/ngu-tinh-p3.png`

## 5. Hồ Tinh pha 2 gục

```
Pixel art sprite strip, 8 frames in ONE horizontal row, frames spaced FAR apart with wide empty gaps, pure flat #00FF00 background.
Same character as the attached reference (nine-tailed fox spirit boss in purple, phase 2), same palette, same size, same pixel scale, facing right, full body, feet on one baseline.
Death animation: 1 flinches, 2 tails flare, 3 staggers back, 4 drops to one knee, 5 tails fold down, 6 falls on its side, 7 fades into purple foxfire wisps, 8 a few small fading wisps.
No shadow, no ground, no text, no logo, no frame border, no motion blur, no extra effects outside the body.
```
Ảnh mẫu gửi kèm: `docs/anh-goc/trum-moi/ho-tinh-p2.png`

## 6. Hồ Tinh pha 3 gục

```
Pixel art sprite strip, 8 frames in ONE horizontal row, frames spaced FAR apart with wide empty gaps, pure flat #00FF00 background.
Same character as the attached reference (berserk fire nine-tailed fox spirit boss, phase 3), same palette, same size, same pixel scale, facing right, full body, feet on one baseline, body centered in each frame.
Death animation: 1 flinches, 2 flames flicker, 3 staggers back, 4 drops to one knee, 5 flames shrink, 6 falls on its side, 7 burns out into embers and ash, 8 small pile of glowing embers.
No shadow, no ground, no text, no logo, no frame border, no motion blur, no extra effects outside the body.
```
Ảnh mẫu gửi kèm: `docs/anh-goc/trum-moi/ho-tinh-p3.png`
