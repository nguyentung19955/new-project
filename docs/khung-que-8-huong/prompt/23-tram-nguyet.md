# Prompt gen Cu Tí — Trảm nguyệt (chiêu kiếm) (23-tram-nguyet)

6 khung · 0.35 giây · khung chạm ★ = khung 2 · ghi chú: Hiệu ứng sinh ngay lúc bấm; ★ = khung chém ra (khung 2).

Mỗi hướng có 2 cách: **A. gen cả hàng** (1 lần ra đủ khung) hoặc **B. sửa từng khung** (chính xác hơn: gen khung 1, rồi mỗi khung sau = sửa ảnh khung trước). Ảnh khung que nằm trong `../anh/23-tram-nguyet/`.

## Xuống (S)

Gửi kèm: khung chuẩn S (bước 0, `prompt/00-khung-chuan.md`) (mẫu nhân vật đúng hướng) + `mau/cu-ti-mau.png` + `anh/23-tram-nguyet/s-sach.png` (khung que cả hàng, không số). Xem số khung/★ ở `anh/23-tram-nguyet/s.png`, xem chuyển động ở `gif/23-tram-nguyet/s.gif`.

**A. Gen cả hàng**

```
Pixel-art sprite sheet of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals.
Action: crescent moon sword slash (special). Top-down 3/4 game camera ~30° above, character facing DOWN toward the camera: front view, whole face visible, seen slightly from above.
6 frames in ONE row, evenly spaced, 96x96 cells, feet on the SAME ground line, same head size every frame. Flat background #00FF00, no shadow, no text.
Match the stick figure reference EXACTLY, frame by frame: orange = RIGHT arm, purple = LEFT arm, yellow = RIGHT leg, blue = LEFT leg (grey cap = hair, red dots = eyes). FRONT = in front of the body, BEHIND = hidden behind the body. Never swap hands or legs between frames.
Both shoulders are the same distance from the camera: an arm or leg that swings toward the camera is drawn in FRONT of the body, one that swings back is BEHIND it.
Red line = sword direction only: do NOT draw the weapon, draw an empty right fist gripping along the red line.
Frames:
1. sword drawn back low, crouch — orange arm BEHIND body, fist at chest; purple arm FRONT, fist low; yellow leg forward, both feet in the air; red guide → left.
2. ★HIT wide crescent slash forward — orange arm FRONT, fist low; purple arm FRONT, fist low; orange arm on top; yellow leg forward, both feet in the air; red guide → down.
3. follow-through: blade sweeps to the left, low — orange arm FRONT, fist low; purple arm FRONT, fist at waist; orange arm on top; yellow leg forward, both feet in the air; red guide → lower-right.
4. slow down — orange arm FRONT, fist low; purple arm FRONT, fist at waist; orange arm on top; yellow leg forward, both feet in the air; red guide → right.
5. recover — orange arm FRONT, fist at waist; purple arm FRONT, fist at waist; orange arm on top; yellow leg forward; red guide → upper-right.
6. guard — orange arm FRONT, fist at waist; purple arm FRONT, fist at waist; orange arm on top; yellow leg forward; red guide → up.
Same outfit, colors and proportions in every frame; smooth in-betweens, no jumps.
```

**B. Sửa khung trước** — gửi ảnh khung N−1 đã gen + `anh/23-tram-nguyet/s/kN.png`, thay N và dán dòng N ở danh sách trên:

```
Edit the attached image of Cu Ti (frame N-1, facing DOWN toward the camera) into frame N of "crescent moon sword slash (special)". Match the attached stick figure kN.png exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Change ONLY the pose: <paste line N from the list>. Keep the same character, outfit, colors, size, head size and head position, feet on the same ground line, background #00FF00, empty right fist, no weapon, no text.
```

## Chéo xuống phải (SE)

Gửi kèm: khung chuẩn SE (bước 0, `prompt/00-khung-chuan.md`) (mẫu nhân vật đúng hướng) + `mau/cu-ti-mau.png` + `anh/23-tram-nguyet/se-sach.png` (khung que cả hàng, không số). Xem số khung/★ ở `anh/23-tram-nguyet/se.png`, xem chuyển động ở `gif/23-tram-nguyet/se.gif`.

**A. Gen cả hàng**

```
Pixel-art sprite sheet of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals.
Action: crescent moon sword slash (special). Top-down 3/4 game camera ~30° above, character facing DOWN-RIGHT: 3/4 front view, face and chest visible, body turned to the right.
6 frames in ONE row, evenly spaced, 96x96 cells, feet on the SAME ground line, same head size every frame. Flat background #00FF00, no shadow, no text.
Match the stick figure reference EXACTLY, frame by frame: orange = RIGHT arm, purple = LEFT arm, yellow = RIGHT leg, blue = LEFT leg (grey cap = hair, red dots = eyes). FRONT = in front of the body, BEHIND = hidden behind the body. Never swap hands or legs between frames.
His RIGHT side (orange arm, yellow leg) is the NEAR side, closest to the camera; his LEFT side (purple arm, blue leg) is the FAR side, partly hidden behind the body.
Red line = sword direction only: do NOT draw the weapon, draw an empty right fist gripping along the red line.
Frames:
1. sword drawn back low, crouch — orange arm FRONT, fist at waist; purple arm FRONT, fist at waist; purple arm on top; yellow leg forward, both feet in the air; red guide points at/away from camera (short).
2. ★HIT wide crescent slash forward — orange arm FRONT, fist low; purple arm BEHIND body, fist at waist; yellow leg forward, both feet in the air; red guide → lower-right.
3. follow-through: blade sweeps to the left, low — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at waist; yellow leg forward, both feet in the air; red guide → right.
4. slow down — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at waist; yellow leg forward, both feet in the air; red guide → right.
5. recover — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → upper-right.
6. guard — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → upper-right.
Same outfit, colors and proportions in every frame; smooth in-betweens, no jumps.
```

**B. Sửa khung trước** — gửi ảnh khung N−1 đã gen + `anh/23-tram-nguyet/se/kN.png`, thay N và dán dòng N ở danh sách trên:

```
Edit the attached image of Cu Ti (frame N-1, facing DOWN-RIGHT) into frame N of "crescent moon sword slash (special)". Match the attached stick figure kN.png exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Change ONLY the pose: <paste line N from the list>. Keep the same character, outfit, colors, size, head size and head position, feet on the same ground line, background #00FF00, empty right fist, no weapon, no text.
```

## Phải (E)

Gửi kèm: `mau/cu-ti-dung-e-k1.png` (mẫu nhân vật đúng hướng) + `mau/cu-ti-mau.png` + `anh/23-tram-nguyet/e-sach.png` (khung que cả hàng, không số). Xem số khung/★ ở `anh/23-tram-nguyet/e.png`, xem chuyển động ở `gif/23-tram-nguyet/e.gif`.

**A. Gen cả hàng**

```
Pixel-art sprite sheet of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals.
Action: crescent moon sword slash (special). Top-down 3/4 game camera ~30° above, character facing RIGHT: side profile, we see his right side, one red eye visible.
6 frames in ONE row, evenly spaced, 96x96 cells, feet on the SAME ground line, same head size every frame. Flat background #00FF00, no shadow, no text.
Match the stick figure reference EXACTLY, frame by frame: orange = RIGHT arm, purple = LEFT arm, yellow = RIGHT leg, blue = LEFT leg (grey cap = hair, red dots = eyes). FRONT = in front of the body, BEHIND = hidden behind the body. Never swap hands or legs between frames.
His RIGHT side (orange arm, yellow leg) is NEAR the camera and drawn on top; his LEFT side (purple arm, blue leg) is FAR and drawn behind the body.
Red line = sword direction only: do NOT draw the weapon, draw an empty right fist gripping along the red line.
Frames:
1. sword drawn back low, crouch — orange arm FRONT, fist low; purple arm FRONT, fist at waist; orange arm on top; yellow leg forward, both feet in the air; red guide → right.
2. ★HIT wide crescent slash forward — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → right.
3. follow-through: blade sweeps to the left, low — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → right (behind body).
4. slow down — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → upper-right (behind body).
5. recover — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → upper-right (behind body).
6. guard — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → upper-right.
Same outfit, colors and proportions in every frame; smooth in-betweens, no jumps.
```

**B. Sửa khung trước** — gửi ảnh khung N−1 đã gen + `anh/23-tram-nguyet/e/kN.png`, thay N và dán dòng N ở danh sách trên:

```
Edit the attached image of Cu Ti (frame N-1, facing RIGHT) into frame N of "crescent moon sword slash (special)". Match the attached stick figure kN.png exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Change ONLY the pose: <paste line N from the list>. Keep the same character, outfit, colors, size, head size and head position, feet on the same ground line, background #00FF00, empty right fist, no weapon, no text.
```

## Chéo lên phải (NE)

Gửi kèm: khung chuẩn NE (bước 0, `prompt/00-khung-chuan.md`) (mẫu nhân vật đúng hướng) + `mau/cu-ti-mau.png` + `anh/23-tram-nguyet/ne-sach.png` (khung que cả hàng, không số). Xem số khung/★ ở `anh/23-tram-nguyet/ne.png`, xem chuyển động ở `gif/23-tram-nguyet/ne.gif`.

**A. Gen cả hàng**

```
Pixel-art sprite sheet of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals.
Action: crescent moon sword slash (special). Top-down 3/4 game camera ~30° above, character facing UP-RIGHT: 3/4 back view, back of the head and back visible, only a sliver of the right cheek.
6 frames in ONE row, evenly spaced, 96x96 cells, feet on the SAME ground line, same head size every frame. Flat background #00FF00, no shadow, no text.
Match the stick figure reference EXACTLY, frame by frame: orange = RIGHT arm, purple = LEFT arm, yellow = RIGHT leg, blue = LEFT leg (grey cap = hair, red dots = eyes). FRONT = in front of the body, BEHIND = hidden behind the body. Never swap hands or legs between frames.
His RIGHT side (orange arm, yellow leg) is NEAR the camera; his LEFT side (purple arm, blue leg) is FAR, behind the body.
Red line = sword direction only: do NOT draw the weapon, draw an empty right fist gripping along the red line.
Frames:
1. sword drawn back low, crouch — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → upper-right.
2. ★HIT wide crescent slash forward — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → upper-right (behind body).
3. follow-through: blade sweeps to the left, low — orange arm BEHIND body, fist at chest; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide points at/away from camera (short) (behind body).
4. slow down — orange arm BEHIND body, fist at chest; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → up (behind body).
5. recover — orange arm FRONT, fist at chest; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → up (behind body).
6. guard — orange arm FRONT, fist at chest; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → up (behind body).
Same outfit, colors and proportions in every frame; smooth in-betweens, no jumps.
```

**B. Sửa khung trước** — gửi ảnh khung N−1 đã gen + `anh/23-tram-nguyet/ne/kN.png`, thay N và dán dòng N ở danh sách trên:

```
Edit the attached image of Cu Ti (frame N-1, facing UP-RIGHT) into frame N of "crescent moon sword slash (special)". Match the attached stick figure kN.png exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Change ONLY the pose: <paste line N from the list>. Keep the same character, outfit, colors, size, head size and head position, feet on the same ground line, background #00FF00, empty right fist, no weapon, no text.
```

## Lên (N)

Gửi kèm: khung chuẩn N (bước 0, `prompt/00-khung-chuan.md`) (mẫu nhân vật đúng hướng) + `mau/cu-ti-mau.png` + `anh/23-tram-nguyet/n-sach.png` (khung que cả hàng, không số). Xem số khung/★ ở `anh/23-tram-nguyet/n.png`, xem chuyển động ở `gif/23-tram-nguyet/n.gif`.

**A. Gen cả hàng**

```
Pixel-art sprite sheet of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals.
Action: crescent moon sword slash (special). Top-down 3/4 game camera ~30° above, character facing UP, away from the camera: back view, only the back of the head, hair and back are visible, no face.
6 frames in ONE row, evenly spaced, 96x96 cells, feet on the SAME ground line, same head size every frame. Flat background #00FF00, no shadow, no text.
Match the stick figure reference EXACTLY, frame by frame: orange = RIGHT arm, purple = LEFT arm, yellow = RIGHT leg, blue = LEFT leg (grey cap = hair, red dots = eyes). FRONT = in front of the body, BEHIND = hidden behind the body. Never swap hands or legs between frames.
Both shoulders are the same distance from the camera: an arm that reaches forward goes AWAY from the camera and is hidden BEHIND the body/head; an arm swinging back comes toward the camera, in FRONT.
Red line = sword direction only: do NOT draw the weapon, draw an empty right fist gripping along the red line.
Frames:
1. sword drawn back low, crouch — orange arm FRONT, fist at waist; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → upper-right (behind body).
2. ★HIT wide crescent slash forward — orange arm BEHIND body, fist at chest; purple arm BEHIND body, fist at chest; yellow leg forward, both feet in the air; red guide → up (behind body).
3. follow-through: blade sweeps to the left, low — orange arm BEHIND body, fist at chest; purple arm FRONT, fist at waist; yellow leg forward, both feet in the air; red guide → left (behind body).
4. slow down — orange arm BEHIND body, fist at chest; purple arm FRONT, fist at waist; yellow leg forward, both feet in the air; red guide → upper-left (behind body).
5. recover — orange arm BEHIND body, fist at chest; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → upper-left (behind body).
6. guard — orange arm BEHIND body, fist at head; purple arm BEHIND body, fist at chest; yellow leg forward; red guide → up (behind body).
Same outfit, colors and proportions in every frame; smooth in-betweens, no jumps.
```

**B. Sửa khung trước** — gửi ảnh khung N−1 đã gen + `anh/23-tram-nguyet/n/kN.png`, thay N và dán dòng N ở danh sách trên:

```
Edit the attached image of Cu Ti (frame N-1, facing UP, away from the camera) into frame N of "crescent moon sword slash (special)". Match the attached stick figure kN.png exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Change ONLY the pose: <paste line N from the list>. Keep the same character, outfit, colors, size, head size and head position, feet on the same ground line, background #00FF00, empty right fist, no weapon, no text.
```
