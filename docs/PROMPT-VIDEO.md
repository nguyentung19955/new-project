# Prompt video từ ảnh (90 nhân vật · 309 video)

Sinh bằng `node tools/build-prompt-video.js` — đừng sửa tay. Mỗi khối là một video ~5 giây, khung đầu = ảnh nhân vật.

- 1. Tướng Thường: 20 nhân vật
- 2. Tướng Tím: 20 nhân vật
- 3. Tướng Vàng: 20 nhân vật
- 4. Quái: 21 nhân vật
- 5. Boss: 9 nhân vật

```
============================================================
HƯỚNG DẪN — TẠO VIDEO TỪ ẢNH (Kling · Hailuo · Runway · Veo…)
============================================================
ẢNH ĐẦU VÀO (khung đầu của video), mỗi nhân vật 1 ảnh, dùng chung cho mọi video của nhân vật đó:
  - Ảnh tĩnh gen theo docs/PROMPT-DUNG-XUONG.txt (toàn thân, quay PHẢI, tay + vũ khí tách khỏi thân), hoặc
  - Ảnh có sẵn assets/packs/<mã>/idle.png (quái / boss: walk1.png) — phóng to cao ≥ 720 px và thêm lề nền hồng tím #FF00FF
    khoảng 25% mỗi bên (nhất là phía trên và phía trước) để có chỗ vung vũ khí.
  - Nền hồng tím #FF00FF phẳng, không bóng, không chữ. Khung vuông 1:1 (hoặc dọc 9:16 nếu trang chỉ có tỉ lệ đó).

CÁCH LÀM TRÊN KLING (klingai.com → AI Videos → Image to Video; trang khác tương tự):
  1. Tải ảnh nhân vật lên làm ảnh đầu (Start frame). Có ô End frame (khung cuối) thì tải CHÍNH ảnh đó vào luôn → video kết thúc đúng dáng đứng, lặp mượt.
  2. Chép phần giữa hai đường gạch của MỘT video dán vào ô Prompt. Có ô Negative prompt riêng thì chuyển dòng "NEGATIVE: …" sang ô đó.
  3. Thời lượng 5 giây, chế độ Standard là đủ. Bấm Generate.
  4. Xem lại (sai 1 dòng → tạo lại, thường 2–3 lần có bản tốt):
     [ ] Camera đứng yên, nhân vật không trôi, không phóng to / thu nhỏ
     [ ] Đúng 1 nhân vật, cùng mặt, cùng áo, cùng vũ khí suốt video; vũ khí không biến mất / không nhân đôi
     [ ] Toàn thân luôn trong khung, không bị cắt chân / đầu / vũ khí
     [ ] Nền vẫn hồng tím phẳng, không hiện mặt đất / cảnh / bóng
     [ ] Động tác rõ: có lấy đà → ra đòn → thu về; cuối video về gần dáng đầu
  5. Tải mp4, đặt tên đúng dòng "Tên file" (ví dụ lactuong-danh.mp4) vào một thư mục; gửi cho Claude để cắt khung đưa vào game.

KHUNG GAME LẤY TỪ MỖI VIDEO (tool cắt tự chọn):
  Tướng (lưới hero12):  -tho → idle 3 khung · -danh → attack 4 khung · -chieu → cast 3 khung · -trung → hurt 1 khung · chân dung lấy từ ảnh đầu
  Quái  (lưới enemy6):  -di → walk 4 khung · -danh → attack 2 khung
  Boss  (lưới boss9):   -di → walk 4 khung · -danh → attack 3 khung · -gian → rage 2 khung

Thứ tự làm gợi ý: vài tướng hay dùng trước để thử (Lạc Tướng, Xạ Thủ, Thầy Mo), xem kết quả trong game rồi mới làm tiếp.
```

## 1. Tướng Thường (20)

### Lạc Tướng · Thường · METAL

- Ảnh đầu vào: `lactuong.png`

#### Đứng thở (idle) — `lactuong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Tướng (holding: Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `lactuong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Tướng (holding: Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade with a firm grip, the character raises it high behind the head (wind-up), then chops it down and forward in ONE strong arc with a single short swoosh, the head of the weapon stays attached to its handle, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `lactuong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Tướng (holding: Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a wide golden arc of the axe with Lac-bird shapes — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `lactuong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Tướng (holding: Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Lực Sĩ Núi · Thường · EARTH

- Ảnh đầu vào: `lucsi.png`

#### Đứng thở (idle) — `lucsi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lực Sĩ Núi (holding: boulder) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `lucsi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lực Sĩ Núi (holding: boulder) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (boulder) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `lucsi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lực Sĩ Núi (holding: boulder) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: boulder smash with dust — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `lucsi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lực Sĩ Núi (holding: boulder) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Xạ Thủ Văn Lang · Thường · METAL

- Ảnh đầu vào: `xathu.png`

#### Đứng thở (idle) — `xathu-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Xạ Thủ Văn Lang (holding: giant wooden longbow) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `xathu-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Xạ Thủ Văn Lang (holding: giant wooden longbow) — 2D chibi game character animation for a mobile game sprite.
ATTACK: with the giant wooden longbow, the character nocks an arrow, draws the string back to the cheek (the arrow always visible on the string), releases — the arrow flies off to the right and out of frame — then lowers the bow back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `xathu-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Xạ Thủ Văn Lang (holding: giant wooden longbow) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: three silver arrows with white streaks — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `xathu-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Xạ Thủ Văn Lang (holding: giant wooden longbow) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thợ Săn Rừng · Thường · WOOD

- Ảnh đầu vào: `thosan.png`

#### Đứng thở (idle) — `thosan-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Rừng (holding: two curved hunting knives held backhand) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thosan-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Rừng (holding: two curved hunting knives held backhand) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the two curved hunting knives held backhand, the character pulls it back behind the shoulder (wind-up), then slashes it forward in ONE fast arc with a single short white swoosh, the arm fully extended at the end, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thosan-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Rừng (holding: two curved hunting knives held backhand) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: green poison smoke slash — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thosan-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Rừng (holding: two curved hunting knives held backhand) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thầy Mo Lửa · Thường · FIRE

- Ảnh đầu vào: `thaymo.png`

#### Đứng thở (idle) — `thaymo-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Mo Lửa (holding: gnarled staff with a burning gourd on top) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thaymo-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Mo Lửa (holding: gnarled staff with a burning gourd on top) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the gnarled staff with a burning gourd on top (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thaymo-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Mo Lửa (holding: gnarled staff with a burning gourd on top) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: exploding fireballs — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thaymo-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Mo Lửa (holding: gnarled staff with a burning gourd on top) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thần Sương Núi · Thường · WATER

- Ảnh đầu vào: `thansuong.png`

#### Đứng thở (idle) — `thansuong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Sương Núi (holding: small ice crystal held in cupped hands) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thansuong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Sương Núi (holding: small ice crystal held in cupped hands) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (small ice crystal held in cupped hands) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thansuong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Sương Núi (holding: small ice crystal held in cupped hands) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: frost mist and snowflakes — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thansuong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Sương Núi (holding: small ice crystal held in cupped hands) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Dũng Sĩ Giáo Đồng · Thường · METAL

- Ảnh đầu vào: `giaodong.png`

#### Đứng thở (idle) — `giaodong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Giáo Đồng (holding: very long bronze-tipped spear) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `giaodong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Giáo Đồng (holding: very long bronze-tipped spear) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the very long bronze-tipped spear, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `giaodong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Giáo Đồng (holding: very long bronze-tipped spear) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a spinning spear trailing silver sparks — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `giaodong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Giáo Đồng (holding: very long bronze-tipped spear) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thầy Chuông Đồng · Thường · METAL

- Ảnh đầu vào: `chuongdong.png`

#### Đứng thở (idle) — `chuongdong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Chuông Đồng (holding: bell staff) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `chuongdong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Chuông Đồng (holding: bell staff) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the bell staff (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `chuongdong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Chuông Đồng (holding: bell staff) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: golden sound rings spreading from the bell — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `chuongdong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Chuông Đồng (holding: bell staff) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Dũng Sĩ Tre Làng · Thường · WOOD

- Ảnh đầu vào: `tre.png`

#### Đứng thở (idle) — `tre-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Tre Làng (holding: bamboo pole) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `tre-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Tre Làng (holding: bamboo pole) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the bamboo pole, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `tre-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Tre Làng (holding: bamboo pole) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: swirling bamboo leaves — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `tre-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Dũng Sĩ Tre Làng (holding: bamboo pole) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thợ Săn Ống Thổi · Thường · WOOD

- Ảnh đầu vào: `ongthoi.png`

#### Đứng thở (idle) — `ongthoi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Ống Thổi (holding: long bamboo blowgun) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `ongthoi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Ống Thổi (holding: long bamboo blowgun) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the long bamboo blowgun level, aims to the right, shoots — a small projectile flies off to the right and out of frame, the weapon kicks back a little — then lowers it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `ongthoi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Ống Thổi (holding: long bamboo blowgun) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: green poison darts in a fan — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `ongthoi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Săn Ống Thổi (holding: long bamboo blowgun) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Người Đắp Đê · Thường · EARTH

- Ảnh đầu vào: `dapde.png`

#### Đứng thở (idle) — `dapde-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Người Đắp Đê (holding: flat shovel) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `dapde-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Người Đắp Đê (holding: flat shovel) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the flat shovel, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `dapde-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Người Đắp Đê (holding: flat shovel) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: an earth wall rising — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `dapde-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Người Đắp Đê (holding: flat shovel) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Trẻ Chăn Trâu · Thường · EARTH

- Ảnh đầu vào: `chantrau.png`

#### Đứng thở (idle) — `chantrau-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trẻ Chăn Trâu (holding: slingshot) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `chantrau-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trẻ Chăn Trâu (holding: slingshot) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the slingshot level, aims to the right, shoots — a small projectile flies off to the right and out of frame, the weapon kicks back a little — then lowers it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `chantrau-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trẻ Chăn Trâu (holding: slingshot) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: stunning clay pellets — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `chantrau-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trẻ Chăn Trâu (holding: slingshot) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Chàng Chèo Đò · Thường · WATER

- Ảnh đầu vào: `chodo.png`

#### Đứng thở (idle) — `chodo-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Chèo Đò (holding: big oar) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `chodo-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Chèo Đò (holding: big oar) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the big oar, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `chodo-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Chèo Đò (holding: big oar) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a wide sweep of river water — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `chodo-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Chèo Đò (holding: big oar) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Cô Hái Sen · Thường · WATER

- Ảnh đầu vào: `haisen.png`

#### Đứng thở (idle) — `haisen-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Hái Sen (holding: lotus leaf umbrella and a pink lotus bud) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `haisen-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Hái Sen (holding: lotus leaf umbrella and a pink lotus bud) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the lotus leaf umbrella and a pink lotus bud (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `haisen-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Hái Sen (holding: lotus leaf umbrella and a pink lotus bud) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: healing lotus petals and water drops — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `haisen-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Hái Sen (holding: lotus leaf umbrella and a pink lotus bud) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Chàng Đốt Nương · Thường · FIRE

- Ảnh đầu vào: `dotnuong.png`

#### Đứng thở (idle) — `dotnuong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Đốt Nương (holding: torch pole and machete) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `dotnuong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Đốt Nương (holding: torch pole and machete) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the torch pole and machete, the character pulls it back behind the shoulder (wind-up), then slashes it forward in ONE fast arc with a single short white swoosh, the arm fully extended at the end, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `dotnuong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Đốt Nương (holding: torch pole and machete) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a trail of fire on the ground — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `dotnuong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chàng Đốt Nương (holding: torch pole and machete) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Cô Thả Đèn Trời · Thường · FIRE

- Ảnh đầu vào: `denroi.png`

#### Đứng thở (idle) — `denroi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Thả Đèn Trời (holding: sky lantern) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `denroi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Thả Đèn Trời (holding: sky lantern) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the sky lantern (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `denroi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Thả Đèn Trời (holding: sky lantern) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: small lanterns raining fire — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `denroi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cô Thả Đèn Trời (holding: sky lantern) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thợ Rèn Đông Sơn · Thường · FIRE

- Ảnh đầu vào: `thoren.png`

#### Đứng thở (idle) — `thoren-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Rèn Đông Sơn (holding: giant hammer) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thoren-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Rèn Đông Sơn (holding: giant hammer) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the giant hammer with a firm grip, the character raises it high behind the head (wind-up), then chops it down and forward in ONE strong arc with a single short swoosh, the head of the weapon stays attached to its handle, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thoren-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Rèn Đông Sơn (holding: giant hammer) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: sparks and molten splash — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thoren-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Rèn Đông Sơn (holding: giant hammer) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Ngư Phủ Sông Đà · Thường · WATER

- Ảnh đầu vào: `nguphu.png`

#### Đứng thở (idle) — `nguphu-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ngư Phủ Sông Đà (holding: three-pronged fish spear) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `nguphu-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ngư Phủ Sông Đà (holding: three-pronged fish spear) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the three-pronged fish spear, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `nguphu-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ngư Phủ Sông Đà (holding: three-pronged fish spear) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a thrown net that tangles — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `nguphu-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ngư Phủ Sông Đà (holding: three-pronged fish spear) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thợ Gốm Phù Lãng · Thường · EARTH

- Ảnh đầu vào: `thogom.png`

#### Đứng thở (idle) — `thogom-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Gốm Phù Lãng (holding: clay pots) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thogom-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Gốm Phù Lãng (holding: clay pots) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (clay pots) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thogom-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Gốm Phù Lãng (holding: clay pots) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: shattering pot shards — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thogom-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thợ Gốm Phù Lãng (holding: clay pots) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thầy Lang Lá Thuốc · Thường · WOOD

- Ảnh đầu vào: `thaylang.png`

#### Đứng thở (idle) — `thaylang-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Lang Lá Thuốc (holding: crooked walking stick) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thaylang-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Lang Lá Thuốc (holding: crooked walking stick) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the crooked walking stick (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thaylang-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Lang Lá Thuốc (holding: crooked walking stick) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: green healing leaves and herb steam — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thaylang-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thầy Lang Lá Thuốc (holding: crooked walking stick) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

## 2. Tướng Tím (20)

### Thạch Sanh · Tím · WOOD

- Ảnh đầu vào: `thachsanh.png`

#### Đứng thở (idle) — `thachsanh-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thạch Sanh (holding: giant axe) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thachsanh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thạch Sanh (holding: giant axe) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the giant axe with a firm grip, the character raises it high behind the head (wind-up), then chops it down and forward in ONE strong arc with a single short swoosh, the head of the weapon stays attached to its handle, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thachsanh-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thạch Sanh (holding: giant axe) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: golden axe slash with lute notes — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thachsanh-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thạch Sanh (holding: giant axe) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Cao Lỗ · Tím · METAL

- Ảnh đầu vào: `caolo.png`

#### Đứng thở (idle) — `caolo-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cao Lỗ (holding: big repeating crossbow) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `caolo-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cao Lỗ (holding: big repeating crossbow) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the big repeating crossbow level, aims to the right, shoots — a small projectile flies off to the right and out of frame, the weapon kicks back a little — then lowers it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `caolo-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cao Lỗ (holding: big repeating crossbow) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a burst of piercing bronze bolts — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `caolo-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Cao Lỗ (holding: big repeating crossbow) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Mai An Tiêm · Tím · WOOD

- Ảnh đầu vào: `antiem.png`

#### Đứng thở (idle) — `antiem-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mai An Tiêm (holding: watermelons to throw) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `antiem-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mai An Tiêm (holding: watermelons to throw) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (watermelons to throw) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `antiem-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mai An Tiêm (holding: watermelons to throw) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: exploding watermelon with gold seeds — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `antiem-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mai An Tiêm (holding: watermelons to throw) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Chử Đồng Tử · Tím · WATER

- Ảnh đầu vào: `cdt.png`

#### Đứng thở (idle) — `cdt-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chử Đồng Tử (holding: sacred staff and glowing hat) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `cdt-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chử Đồng Tử (holding: sacred staff and glowing hat) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the sacred staff and glowing hat (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `cdt-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chử Đồng Tử (holding: sacred staff and glowing hat) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: teal reviving light under the hat — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `cdt-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chử Đồng Tử (holding: sacred staff and glowing hat) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Tiên Dung · Tím · FIRE

- Ảnh đầu vào: `tiendung.png`

#### Đứng thở (idle) — `tiendung-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Tiên Dung (holding: big round fan) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `tiendung-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Tiên Dung (holding: big round fan) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the big round fan (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `tiendung-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Tiên Dung (holding: big round fan) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a gust of fire wind from the fan — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `tiendung-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Tiên Dung (holding: big round fan) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Lang Liêu · Tím · EARTH

- Ảnh đầu vào: `langlieu.png`

#### Đứng thở (idle) — `langlieu-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lang Liêu (holding: tray of banh chung) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `langlieu-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lang Liêu (holding: tray of banh chung) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the tray of banh chung (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `langlieu-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lang Liêu (holding: tray of banh chung) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: square and round cakes giving buffs — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `langlieu-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lang Liêu (holding: tray of banh chung) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Nghê Đồng · Tím · METAL

- Ảnh đầu vào: `nghedong.png`

#### Đứng thở (idle) — `nghedong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nghê Đồng (holding: none, paws and bite) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `nghedong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nghê Đồng (holding: none, paws and bite) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (none, paws and bite) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `nghedong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nghê Đồng (holding: none, paws and bite) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: bronze shockwave rings from a roar — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `nghedong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nghê Đồng (holding: none, paws and bite) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Mỵ Châu · Tím · METAL

- Ảnh đầu vào: `mychau.png`

#### Đứng thở (idle) — `mychau-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mỵ Châu (holding: none, she scatters white feathers) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `mychau-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mỵ Châu (holding: none, she scatters white feathers) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (none, she scatters white feathers) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `mychau-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mỵ Châu (holding: none, she scatters white feathers) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: white feathers turning into small birds — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `mychau-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mỵ Châu (holding: none, she scatters white feathers) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Sọ Dừa · Tím · WOOD

- Ảnh đầu vào: `sodua.png`

#### Đứng thở (idle) — `sodua-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sọ Dừa (holding: none, throws green coconuts) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `sodua-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sọ Dừa (holding: none, throws green coconuts) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (none, throws green coconuts) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `sodua-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sọ Dừa (holding: none, throws green coconuts) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: coconut shell opening with light — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `sodua-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sọ Dừa (holding: none, throws green coconuts) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Ông Đùng · Tím · EARTH

- Ảnh đầu vào: `ongdung.png`

#### Đứng thở (idle) — `ongdung-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Đùng (holding: carrying pole) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `ongdung-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Đùng (holding: carrying pole) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the carrying pole, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `ongdung-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Đùng (holding: carrying pole) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: thrown earth piling into a hill — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `ongdung-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Đùng (holding: carrying pole) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thổ Công · Tím · EARTH

- Ảnh đầu vào: `thocong.png`

#### Đứng thở (idle) — `thocong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thổ Công (holding: bamboo staff with a gourd) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thocong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thổ Công (holding: bamboo staff with a gourd) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the bamboo staff with a gourd (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thocong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thổ Công (holding: bamboo staff with a gourd) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a protective earth light around the house — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thocong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thổ Công (holding: bamboo staff with a gourd) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Lý Ngư Tướng Quân · Tím · WATER

- Ảnh đầu vào: `lyngu.png`

#### Đứng thở (idle) — `lyngu-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lý Ngư Tướng Quân (holding: fin-shaped glaive) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `lyngu-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lý Ngư Tướng Quân (holding: fin-shaped glaive) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the fin-shaped glaive, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `lyngu-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lý Ngư Tướng Quân (holding: fin-shaped glaive) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: carp leaping through a waterfall arc — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `lyngu-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lý Ngư Tướng Quân (holding: fin-shaped glaive) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Trương Chi · Tím · WATER

- Ảnh đầu vào: `truongchi.png`

#### Đứng thở (idle) — `truongchi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trương Chi (holding: long bamboo flute) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `truongchi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trương Chi (holding: long bamboo flute) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the long bamboo flute (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `truongchi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trương Chi (holding: long bamboo flute) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: silver music notes and moon ripples — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `truongchi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Trương Chi (holding: long bamboo flute) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Vua Lửa Pơtao Apui · Tím · FIRE

- Ảnh đầu vào: `potaoapui.png`

#### Đứng thở (idle) — `potaoapui-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Vua Lửa Pơtao Apui (holding: flaming sword) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `potaoapui-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Vua Lửa Pơtao Apui (holding: flaming sword) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the flaming sword, the character pulls it back behind the shoulder (wind-up), then slashes it forward in ONE fast arc with a single short white swoosh, the arm fully extended at the end, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `potaoapui-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Vua Lửa Pơtao Apui (holding: flaming sword) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a flaming sword thrust — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `potaoapui-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Vua Lửa Pơtao Apui (holding: flaming sword) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Bà Hỏa · Tím · FIRE

- Ảnh đầu vào: `baahoa.png`

#### Đứng thở (idle) — `baahoa-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Bà Hỏa (holding: a fireball floating in her palm) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `baahoa-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Bà Hỏa (holding: a fireball floating in her palm) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (a fireball floating in her palm) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `baahoa-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Bà Hỏa (holding: a fireball floating in her palm) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: wildfire spreading — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `baahoa-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Bà Hỏa (holding: a fireball floating in her palm) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thần Trống Đồng · Tím · METAL

- Ảnh đầu vào: `trongdong.png`

#### Đứng thở (idle) — `trongdong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trống Đồng (holding: two wooden drum mallets) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `trongdong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trống Đồng (holding: two wooden drum mallets) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the two wooden drum mallets (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `trongdong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trống Đồng (holding: two wooden drum mallets) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: golden drum-beat rings and sun-star — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `trongdong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trống Đồng (holding: two wooden drum mallets) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thần Cá Ông · Tím · WATER

- Ảnh đầu vào: `caong.png`

#### Đứng thở (idle) — `caong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Cá Ông (holding: none, body slam) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `caong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Cá Ông (holding: none, body slam) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (none, body slam) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `caong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Cá Ông (holding: none, body slam) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a water bubble shield — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `caong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Cá Ông (holding: none, body slam) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Ông Táo · Tím · FIRE

- Ảnh đầu vào: `ongtao.png`

#### Đứng thở (idle) — `ongtao-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Táo (holding: long iron fire tongs holding a glowing coal) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `ongtao-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Táo (holding: long iron fire tongs holding a glowing coal) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the long iron fire tongs holding a glowing coal (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `ongtao-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Táo (holding: long iron fire tongs holding a glowing coal) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: kitchen fire burst — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `ongtao-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Ông Táo (holding: long iron fire tongs holding a glowing coal) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Lạc Hầu · Tím · EARTH

- Ảnh đầu vào: `lachau.png`

#### Đứng thở (idle) — `lachau-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Hầu (holding: banner pole) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `lachau-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Hầu (holding: banner pole) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the banner pole, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `lachau-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Hầu (holding: banner pole) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a golden formation circle — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `lachau-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Hầu (holding: banner pole) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thần Săn Ba Vì · Tím · WOOD

- Ảnh đầu vào: `thansan.png`

#### Đứng thở (idle) — `thansan-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Săn Ba Vì (holding: long bamboo hunting spear with a leaf blade) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thansan-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Săn Ba Vì (holding: long bamboo hunting spear with a leaf blade) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the long bamboo hunting spear with a leaf blade, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thansan-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Săn Ba Vì (holding: long bamboo hunting spear with a leaf blade) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: green spear throw with spirit deer — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thansan-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Săn Ba Vì (holding: long bamboo hunting spear with a leaf blade) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

## 3. Tướng Vàng (20)

### Thánh Gióng · Vàng · FIRE

- Ảnh đầu vào: `giong.png`

#### Đứng thở (idle) — `giong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thánh Gióng (holding: burning uprooted bamboo) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `giong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thánh Gióng (holding: burning uprooted bamboo) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the burning uprooted bamboo, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `giong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thánh Gióng (holding: burning uprooted bamboo) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: burning bamboo sweep with fire — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `giong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thánh Gióng (holding: burning uprooted bamboo) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Lạc Long Quân · Vàng · WATER

- Ảnh đầu vào: `llq.png`

#### Đứng thở (idle) — `llq-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Long Quân (holding: long straight sword) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `llq-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Long Quân (holding: long straight sword) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the long straight sword, the character pulls it back behind the shoulder (wind-up), then slashes it forward in ONE fast arc with a single short white swoosh, the arm fully extended at the end, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `llq-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Long Quân (holding: long straight sword) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a water dragon spiraling — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `llq-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Lạc Long Quân (holding: long straight sword) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thần Kim Quy · Vàng · METAL

- Ảnh đầu vào: `kimquy.png`

#### Đứng thở (idle) — `kimquy-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Kim Quy (holding: one glowing golden claw raised) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `kimquy-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Kim Quy (holding: one glowing golden claw raised) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (one glowing golden claw raised) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `kimquy-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Kim Quy (holding: one glowing golden claw raised) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a golden hexagon shield dome — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `kimquy-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Kim Quy (holding: one glowing golden claw raised) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Âu Cơ · Vàng · EARTH

- Ảnh đầu vào: `auco.png`

#### Đứng thở (idle) — `auco-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Âu Cơ (holding: egg pouch and a crane-feather wand) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `auco-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Âu Cơ (holding: egg pouch and a crane-feather wand) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the egg pouch and a crane-feather wand (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `auco-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Âu Cơ (holding: egg pouch and a crane-feather wand) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: healing light with crane feathers — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `auco-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Âu Cơ (holding: egg pouch and a crane-feather wand) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Kỳ Lân Vàng · Vàng · METAL

- Ảnh đầu vào: `kylan.png`

#### Đứng thở (idle) — `kylan-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kỳ Lân Vàng (holding: horn and hooves) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `kylan-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kỳ Lân Vàng (holding: horn and hooves) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (horn and hooves) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `kylan-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kỳ Lân Vàng (holding: horn and hooves) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: golden auspicious clouds and gold fire — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `kylan-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kỳ Lân Vàng (holding: horn and hooves) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thiên Lôi · Vàng · METAL

- Ảnh đầu vào: `thienloi.png`

#### Đứng thở (idle) — `thienloi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thiên Lôi (holding: giant stone thunder axe on a short staff) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `thienloi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thiên Lôi (holding: giant stone thunder axe on a short staff) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the giant stone thunder axe on a short staff with a firm grip, the character raises it high behind the head (wind-up), then chops it down and forward in ONE strong arc with a single short swoosh, the head of the weapon stays attached to its handle, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `thienloi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thiên Lôi (holding: giant stone thunder axe on a short staff) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: blue-yellow lightning bolts — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `thienloi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thiên Lôi (holding: giant stone thunder axe on a short staff) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Chú Cuội · Vàng · WOOD

- Ảnh đầu vào: `cuoi.png`

#### Đứng thở (idle) — `cuoi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chú Cuội (holding: woodcutter axe on the shoulder) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `cuoi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chú Cuội (holding: woodcutter axe on the shoulder) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the woodcutter axe on the shoulder with a firm grip, the character raises it high behind the head (wind-up), then chops it down and forward in ONE strong arc with a single short swoosh, the head of the weapon stays attached to its handle, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `cuoi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chú Cuội (holding: woodcutter axe on the shoulder) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: banyan leaves spiraling with moonlight — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `cuoi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chú Cuội (holding: woodcutter axe on the shoulder) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Mẹ Lúa · Vàng · WOOD

- Ảnh đầu vào: `melua.png`

#### Đứng thở (idle) — `melua-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẹ Lúa (holding: rice sheaf) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `melua-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẹ Lúa (holding: rice sheaf) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the rice sheaf (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `melua-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẹ Lúa (holding: rice sheaf) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: golden rice grains swirling — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `melua-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẹ Lúa (holding: rice sheaf) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Sơn Tinh · Vàng · EARTH

- Ảnh đầu vào: `tanvien.png`

#### Đứng thở (idle) — `tanvien-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sơn Tinh (holding: magic book on the belt) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `tanvien-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sơn Tinh (holding: magic book on the belt) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the magic book on the belt (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `tanvien-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sơn Tinh (holding: magic book on the belt) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: mountains rising from the ground — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `tanvien-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Sơn Tinh (holding: magic book on the belt) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Mẫu Địa · Vàng · EARTH

- Ảnh đầu vào: `maudia.png`

#### Đứng thở (idle) — `maudia-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Địa (holding: clay jar of seeds) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `maudia-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Địa (holding: clay jar of seeds) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the clay jar of seeds (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `maudia-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Địa (holding: clay jar of seeds) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: sprouts and stone shields rising — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `maudia-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Địa (holding: clay jar of seeds) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Rồng Mẹ Hạ Long · Vàng · WATER

- Ảnh đầu vào: `halong.png`

#### Đứng thở (idle) — `halong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Rồng Mẹ Hạ Long (holding: pearl and tail) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `halong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Rồng Mẹ Hạ Long (holding: pearl and tail) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (pearl and tail) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `halong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Rồng Mẹ Hạ Long (holding: pearl and tail) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: emerald islands rising from waves — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `halong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Rồng Mẹ Hạ Long (holding: pearl and tail) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Long Nữ Động Đình · Vàng · WATER

- Ảnh đầu vào: `longnu.png`

#### Đứng thở (idle) — `longnu-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Long Nữ Động Đình (holding: big glowing dragon pearl held with both hands) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `longnu-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Long Nữ Động Đình (holding: big glowing dragon pearl held with both hands) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (big glowing dragon pearl held with both hands) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `longnu-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Long Nữ Động Đình (holding: big glowing dragon pearl held with both hands) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: pearl beams and bubbles — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `longnu-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Long Nữ Động Đình (holding: big glowing dragon pearl held with both hands) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Kinh Dương Vương · Vàng · FIRE

- Ảnh đầu vào: `kinhduong.png`

#### Đứng thở (idle) — `kinhduong-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kinh Dương Vương (holding: broad bronze sword) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `kinhduong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kinh Dương Vương (holding: broad bronze sword) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the broad bronze sword, the character pulls it back behind the shoulder (wind-up), then slashes it forward in ONE fast arc with a single short white swoosh, the arm fully extended at the end, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `kinhduong-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kinh Dương Vương (holding: broad bronze sword) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a red sun shockwave — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `kinhduong-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Kinh Dương Vương (holding: broad bronze sword) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Viêm Đế Thần Nông · Vàng · FIRE

- Ảnh đầu vào: `viemde.png`

#### Đứng thở (idle) — `viemde-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Viêm Đế Thần Nông (holding: farming hoe whose blade burns with fire) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `viemde-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Viêm Đế Thần Nông (holding: farming hoe whose blade burns with fire) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the farming hoe whose blade burns with fire (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `viemde-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Viêm Đế Thần Nông (holding: farming hoe whose blade burns with fire) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: warm fire that ripens rice — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `viemde-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Viêm Đế Thần Nông (holding: farming hoe whose blade burns with fire) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Nữ Thần Mặt Trời · Vàng · FIRE

- Ảnh đầu vào: `matroi.png`

#### Đứng thở (idle) — `matroi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nữ Thần Mặt Trời (holding: sun scepter) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `matroi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nữ Thần Mặt Trời (holding: sun scepter) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the sun scepter (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `matroi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nữ Thần Mặt Trời (holding: sun scepter) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small fire-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: burning sunbeams — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `matroi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Nữ Thần Mặt Trời (holding: sun scepter) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Mẫu Thoải · Vàng · WATER

- Ảnh đầu vào: `mauthoai.png`

#### Đứng thở (idle) — `mauthoai-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thoải (holding: silver water ladle staff) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `mauthoai-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thoải (holding: silver water ladle staff) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the silver water ladle staff (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `mauthoai-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thoải (holding: silver water ladle staff) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small water-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: water whirl that holds enemies — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `mauthoai-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thoải (holding: silver water ladle staff) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Thần Trụ Trời · Vàng · EARTH

- Ảnh đầu vào: `trutroi.png`

#### Đứng thở (idle) — `trutroi-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trụ Trời (holding: sky pillar) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `trutroi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trụ Trời (holding: sky pillar) — 2D chibi game character animation for a mobile game sprite.
ATTACK: holding the sky pillar, the character draws it back (wind-up), then thrusts it straight forward to the right with a small lunge step, arm extended, then pulls it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `trutroi-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trụ Trời (holding: sky pillar) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small earth-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: the pillar slamming down — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `trutroi-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Thần Trụ Trời (holding: sky pillar) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Chúa Sơn Lâm · Vàng · WOOD

- Ảnh đầu vào: `ongho.png`

#### Đứng thở (idle) — `ongho-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chúa Sơn Lâm (holding: claws and fangs) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `ongho-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chúa Sơn Lâm (holding: claws and fangs) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character leans back (wind-up), then strikes forward to the right (claws and fangs) with one quick motion and a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `ongho-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chúa Sơn Lâm (holding: claws and fangs) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: tiger roar with green claw slashes — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `ongho-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Chúa Sơn Lâm (holding: claws and fangs) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### An Dương Vương · Vàng · METAL

- Ảnh đầu vào: `adv.png`

#### Đứng thở (idle) — `adv-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero An Dương Vương (holding: magic crossbow) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `adv-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero An Dương Vương (holding: magic crossbow) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the magic crossbow level, aims to the right, shoots — a small projectile flies off to the right and out of frame, the weapon kicks back a little — then lowers it back to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `adv-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero An Dương Vương (holding: magic crossbow) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small metal-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: a golden turtle-claw arrow splitting into many — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `adv-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero An Dương Vương (holding: magic crossbow) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Mẫu Thượng Ngàn · Vàng · WOOD

- Ảnh đầu vào: `mau.png`

#### Đứng thở (idle) — `mau-tho.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thượng Ngàn (holding: flowering branch) — 2D chibi game character animation for a mobile game sprite.
IDLE: standing in the same pose, breathing calmly — chest and shoulders rise slightly and fall, hair / feathers / cloth sway a little, the weapon stays still in the hand; a subtle seamless loop, almost no movement of the feet.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh thường — `mau-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thượng Ngàn (holding: flowering branch) — 2D chibi game character animation for a mobile game sprite.
ATTACK: the character raises the flowering branch (wind-up), a small glow gathers at its tip, then swings / points it forward to the right releasing ONE small magic orb that flies off to the right and out of frame, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Tung chiêu — `mau-chieu.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thượng Ngàn (holding: flowering branch) — 2D chibi game character animation for a mobile game sprite.
SKILL: the character gathers power (a small wood-element glow around the hand / weapon), raises the weapon high, then releases the signature skill effect: flowers and leaves blooming in a ring — the effect stays small and near the character, inside the frame — then the effect fades and the character returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Trúng đòn — `mau-trung.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the hero Mẫu Thượng Ngàn (holding: flowering branch) — 2D chibi game character animation for a mobile game sprite.
HURT: the character gets hit from the right — flinches backward, eyes squeezed shut, one arm raised to guard (no blood), staggers half a step back, then recovers to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

## 4. Quái (21)

### Quái · Cá Mập Yêu

- Ảnh đầu vào: `camap.png`

#### Đi (4 bước, lặp) — `camap-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cá Mập Yêu — 2D chibi game character animation for a mobile game sprite.
WALK: floating / gliding in place facing right (NOT moving across the frame), gentle bobbing up and down, robes and limbs swaying — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `camap-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cá Mập Yêu — 2D chibi game character animation for a mobile game sprite.
ATTACK: draws back, then lashes forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Cáo Con

- Ảnh đầu vào: `cao.png`

#### Đi (4 bước, lặp) — `cao-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cáo Con — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `cao-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cáo Con — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Cua Khổng Lồ

- Ảnh đầu vào: `cua.png`

#### Đi (4 bước, lặp) — `cua-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cua Khổng Lồ — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place on all legs (treadmill walk, NOT moving across the frame), facing right, a clear 4-step gait, head bobbing slightly — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `cua-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cua Khổng Lồ — 2D chibi game character animation for a mobile game sprite.
ATTACK: crouches back (wind-up), then pounces / bites forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Quỷ Cưỡi Lợn

- Ảnh đầu vào: `kybinh.png`

#### Đi (4 bước, lặp) — `kybinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Quỷ Cưỡi Lợn — 2D chibi game character animation for a mobile game sprite.
WALK: the mount walks in place (treadmill walk, NOT moving across the frame), facing right, the rider bobbing with each step — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `kybinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Quỷ Cưỡi Lợn — 2D chibi game character animation for a mobile game sprite.
ATTACK: the rider raises the weapon and thrusts / swings it forward to the right in ONE fast motion while the mount rears slightly, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Voi Chiến

- Ảnh đầu vào: `voichien.png`

#### Đi (4 bước, lặp) — `voichien-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Voi Chiến — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place on all legs (treadmill walk, NOT moving across the frame), facing right, a clear 4-step gait, head bobbing slightly — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `voichien-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Voi Chiến — 2D chibi game character animation for a mobile game sprite.
ATTACK: crouches back (wind-up), then pounces / bites forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Tôm Binh

- Ảnh đầu vào: `tom.png`

#### Đi (4 bước, lặp) — `tom-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Tôm Binh — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `tom-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Tôm Binh — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Cá Sấu

- Ảnh đầu vào: `casau.png`

#### Đi (4 bước, lặp) — `casau-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cá Sấu — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place on all legs (treadmill walk, NOT moving across the frame), facing right, a clear 4-step gait, head bobbing slightly — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `casau-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Cá Sấu — 2D chibi game character animation for a mobile game sprite.
ATTACK: crouches back (wind-up), then pounces / bites forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Rùa Giáp

- Ảnh đầu vào: `rua.png`

#### Đi (4 bước, lặp) — `rua-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Rùa Giáp — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place on all legs (treadmill walk, NOT moving across the frame), facing right, a clear 4-step gait, head bobbing slightly — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `rua-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Rùa Giáp — 2D chibi game character animation for a mobile game sprite.
ATTACK: crouches back (wind-up), then pounces / bites forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Sứa Tinh

- Ảnh đầu vào: `phuthuy.png`

#### Đi (4 bước, lặp) — `phuthuy-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Sứa Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: floating / gliding in place facing right (NOT moving across the frame), gentle bobbing up and down, robes and limbs swaying — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `phuthuy-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Sứa Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: draws back, then lashes forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Chim Bão

- Ảnh đầu vào: `chimbao.png`

#### Đi (4 bước, lặp) — `chimbao-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Chim Bão — 2D chibi game character animation for a mobile game sprite.
WALK: hovering in place facing right (NOT moving across the frame), wings flapping fully up and down in a steady rhythm, body at the same height — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `chimbao-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Chim Bão — 2D chibi game character animation for a mobile game sprite.
ATTACK: pulls back in the air, then dives forward to the right with talons / beak in ONE fast swoop, then returns to the starting hover.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Ếch Mẹ

- Ảnh đầu vào: `echme.png`

#### Đi (4 bước, lặp) — `echme-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Ếch Mẹ — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place on all legs (treadmill walk, NOT moving across the frame), facing right, a clear 4-step gait, head bobbing slightly — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `echme-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Ếch Mẹ — 2D chibi game character animation for a mobile game sprite.
ATTACK: crouches back (wind-up), then pounces / bites forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Nòng Nọc

- Ảnh đầu vào: `nongnoc.png`

#### Đi (4 bước, lặp) — `nongnoc-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Nòng Nọc — 2D chibi game character animation for a mobile game sprite.
WALK: slithering in place facing right (NOT moving across the frame), the body rippling in a smooth S-wave from head to tail — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `nongnoc-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Nòng Nọc — 2D chibi game character animation for a mobile game sprite.
ATTACK: coils back, then strikes forward to the right with the head in ONE fast snap, mouth open, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Giao Long Con

- Ảnh đầu vào: `giaolong.png`

#### Đi (4 bước, lặp) — `giaolong-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Giao Long Con — 2D chibi game character animation for a mobile game sprite.
WALK: slithering in place facing right (NOT moving across the frame), the body rippling in a smooth S-wave from head to tail — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `giaolong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Giao Long Con — 2D chibi game character animation for a mobile game sprite.
ATTACK: coils back, then strikes forward to the right with the head in ONE fast snap, mouth open, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Yêu Tinh Rừng

- Ảnh đầu vào: `yeutinh.png`

#### Đi (4 bước, lặp) — `yeutinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Yêu Tinh Rừng — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `yeutinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Yêu Tinh Rừng — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Rắn Độc

- Ảnh đầu vào: `ran.png`

#### Đi (4 bước, lặp) — `ran-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Rắn Độc — 2D chibi game character animation for a mobile game sprite.
WALK: slithering in place facing right (NOT moving across the frame), the body rippling in a smooth S-wave from head to tail — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `ran-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Rắn Độc — 2D chibi game character animation for a mobile game sprite.
ATTACK: coils back, then strikes forward to the right with the head in ONE fast snap, mouth open, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Dơi Hang

- Ảnh đầu vào: `doi.png`

#### Đi (4 bước, lặp) — `doi-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Dơi Hang — 2D chibi game character animation for a mobile game sprite.
WALK: hovering in place facing right (NOT moving across the frame), wings flapping fully up and down in a steady rhythm, body at the same height — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `doi-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Dơi Hang — 2D chibi game character animation for a mobile game sprite.
ATTACK: pulls back in the air, then dives forward to the right with talons / beak in ONE fast swoop, then returns to the starting hover.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Thạch Tinh

- Ảnh đầu vào: `thachtinh.png`

#### Đi (4 bước, lặp) — `thachtinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Thạch Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `thachtinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Thạch Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Đá Con

- Ảnh đầu vào: `dacon.png`

#### Đi (4 bước, lặp) — `dacon-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Đá Con — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `dacon-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Đá Con — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Quỷ Giáo

- Ảnh đầu vào: `linhan.png`

#### Đi (4 bước, lặp) — `linhan-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Quỷ Giáo — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `linhan-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Quỷ Giáo — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Sói Cung Thủ

- Ảnh đầu vào: `cungan.png`

#### Đi (4 bước, lặp) — `cungan-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Sói Cung Thủ — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `cungan-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Sói Cung Thủ — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Quái · Mực Tinh

- Ảnh đầu vào: `muc.png`

#### Đi (4 bước, lặp) — `muc-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Mực Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: floating / gliding in place facing right (NOT moving across the frame), gentle bobbing up and down, robes and limbs swaying — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `muc-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the monster Mực Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: draws back, then lashes forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

## 5. Boss (9)

### Boss · Quỷ Vương Ân

- Ảnh đầu vào: `anvuong.png`

#### Đi (4 bước, lặp) — `anvuong-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Quỷ Vương Ân — 2D chibi game character animation for a mobile game sprite.
WALK: the mount walks in place (treadmill walk, NOT moving across the frame), facing right, the rider bobbing with each step — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `anvuong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Quỷ Vương Ân — 2D chibi game character animation for a mobile game sprite.
ATTACK: the rider raises the weapon and thrusts / swings it forward to the right in ONE fast motion while the mount rears slightly, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `anvuong-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Quỷ Vương Ân — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Chằn Tinh

- Ảnh đầu vào: `chantinh.png`

#### Đi (4 bước, lặp) — `chantinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Chằn Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `chantinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Chằn Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `chantinh-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Chằn Tinh — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Hà Bá

- Ảnh đầu vào: `haba.png`

#### Đi (4 bước, lặp) — `haba-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hà Bá — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `haba-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hà Bá — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `haba-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hà Bá — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Ngư Tinh

- Ảnh đầu vào: `ngutinh.png`

#### Đi (4 bước, lặp) — `ngutinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Ngư Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: floating / gliding in place facing right (NOT moving across the frame), gentle bobbing up and down, robes and limbs swaying — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `ngutinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Ngư Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: draws back, then lashes forward to the right in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `ngutinh-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Ngư Tinh — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Thuồng Luồng

- Ảnh đầu vào: `thuongluong.png`

#### Đi (4 bước, lặp) — `thuongluong-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Thuồng Luồng — 2D chibi game character animation for a mobile game sprite.
WALK: slithering in place facing right (NOT moving across the frame), the body rippling in a smooth S-wave from head to tail — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `thuongluong-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Thuồng Luồng — 2D chibi game character animation for a mobile game sprite.
ATTACK: coils back, then strikes forward to the right with the head in ONE fast snap, mouth open, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `thuongluong-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Thuồng Luồng — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Thủy Tinh

- Ảnh đầu vào: `thuytinh.png`

#### Đi (4 bước, lặp) — `thuytinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Thủy Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `thuytinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Thủy Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `thuytinh-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Thủy Tinh — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Hổ Vương Triệu Đà

- Ảnh đầu vào: `trieuda.png`

#### Đi (4 bước, lặp) — `trieuda-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hổ Vương Triệu Đà — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `trieuda-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hổ Vương Triệu Đà — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `trieuda-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hổ Vương Triệu Đà — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Đại Bàng Tinh

- Ảnh đầu vào: `daibang.png`

#### Đi (4 bước, lặp) — `daibang-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Đại Bàng Tinh — 2D chibi game character animation for a mobile game sprite.
WALK: hovering in place facing right (NOT moving across the frame), wings flapping fully up and down in a steady rhythm, body at the same height — a smooth loop.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `daibang-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Đại Bàng Tinh — 2D chibi game character animation for a mobile game sprite.
ATTACK: pulls back in the air, then dives forward to the right with talons / beak in ONE fast swoop, then returns to the starting hover.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `daibang-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Đại Bàng Tinh — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

### Boss · Hồ Tinh Chín Đuôi

- Ảnh đầu vào: `hotinh.png`

#### Đi (4 bước, lặp) — `hotinh-di.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hồ Tinh Chín Đuôi — 2D chibi game character animation for a mobile game sprite.
WALK: walking in place (treadmill walk, NOT moving across the frame), facing right, 4 clear steps: front leg forward, legs together body highest, back leg forward, legs together — a smooth loop, arms swinging slightly.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Đánh — `hotinh-danh.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hồ Tinh Chín Đuôi — 2D chibi game character animation for a mobile game sprite.
ATTACK: rears back (wind-up), then lunges forward to the right striking with its weapon / fists in ONE fast motion with a small hit spark, then returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```

#### Nổi giận — `hotinh-gian.mp4`

```
Image-to-video. Use the attached image as the FIRST frame (and, if the tool allows, also as the LAST frame). Animate the boss monster Hồ Tinh Chín Đuôi — 2D chibi game character animation for a mobile game sprite.
RAGE: the boss roars with its head thrown back, arms / wings / body spread wide, its body glowing red-orange more and more strongly, a few small embers around it, then the glow settles and it returns to the starting pose.
CAMERA: completely fixed camera, no pan, no zoom, no rotation, no cut; the character stays in the same place and the same size, feet planted on the same spot (except a small step where described), the whole body always inside the frame.
CONSISTENCY: the SAME character as the input image in every frame — same face, hair, outfit, colors, proportions and the SAME weapon (same size and shape, always held in the same hand, never disappearing, never duplicated). Keep the flat 2D chibi cartoon look with thick dark-brown outlines and flat cel shading, like the input image.
BACKGROUND: keep the flat solid magenta #FF00FF background of the input image unchanged in every frame — no ground, no floor, no shadow, no scenery, no light change.
TIMING: about 5 seconds; start from the exact pose of the input image and END back in that same pose (so the clip loops).
NEGATIVE: camera movement, zoom, pan, cut, scene change, background change, ground, floor, shadow, extra characters, clone, extra arms, extra legs, extra weapon, weapon disappearing, morphing face, changing outfit, realistic, 3D render, photo, text, subtitles, watermark, logo, motion blur smear covering the body.
```
