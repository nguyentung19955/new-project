# Bước 0 — khung chuẩn mỗi hướng (gen TRƯỚC mọi động tác)

Bài học cũ: gen "vẽ lại từ khung que" chỉ khớp dáng 45–65%; gen "sửa ảnh gốc, giữ dáng" khớp 92–94%. Vì vậy mỗi hướng chỉ gen **1 khung chuẩn** (đứng thủ, khung 1 của Đứng thở) bằng cách **sửa ảnh** khung chuẩn hướng bên cạnh (mỗi lần chỉ xoay 45°), rồi mọi khung khác của hướng đó = sửa ảnh khung trước theo khung que.

Chuỗi: **E (có sẵn) → SE → S** và **E → NE → N**. 3 hướng trái (SW/W/NW) không gen: game lật gương SE/E/NE.

## Phải (E)

Hướng PHẢI (E) đã có sẵn: lấy `mau/cu-ti-dung-e-k1.png` (khung 1 ảnh Đứng thở hiện có của Cu Tí, nhìn phải). Nếu muốn khớp khung que tuyệt đối thì sửa nhẹ theo `anh/01-dung/e/k1.png` bằng prompt dưới.

Gửi kèm: `mau/cu-ti-mau.png` + `mau/cu-ti-dung-e-k1.png` + `anh/01-dung/e/k1.png`

```
Edit the attached image of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals. Turn him so he is facing RIGHT: side profile, we see his right side, one red eye visible. Pose = ready stance, match the attached stick figure exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). His RIGHT side (orange arm, yellow leg) is NEAR the camera and drawn on top; his LEFT side (purple arm, blue leg) is FAR and drawn behind the body. Keep the exact same character, outfit, colors, pixel style, head size and body proportions as the reference. One single figure in a 96x96 cell, feet on the ground line at the bottom, flat background #00FF00, empty fists, no weapon, no shadow, no text.
```

## Chéo xuống phải (SE)

Sửa từ khung chuẩn E: xoay người 45° về phía camera.

Gửi kèm: `mau/cu-ti-mau.png` + khung chuẩn E đã gen + `anh/01-dung/se/k1.png`

```
Edit the attached image of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals. Turn him so he is facing DOWN-RIGHT: 3/4 front view, face and chest visible, body turned to the right. Pose = ready stance, match the attached stick figure exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). His RIGHT side (orange arm, yellow leg) is the NEAR side, closest to the camera; his LEFT side (purple arm, blue leg) is the FAR side, partly hidden behind the body. Keep the exact same character, outfit, colors, pixel style, head size and body proportions as the reference. One single figure in a 96x96 cell, feet on the ground line at the bottom, flat background #00FF00, empty fists, no weapon, no shadow, no text.
```

## Xuống (S)

Sửa từ khung chuẩn SE: xoay tiếp 45°, nhìn thẳng camera.

Gửi kèm: `mau/cu-ti-mau.png` + khung chuẩn SE đã gen + `anh/01-dung/s/k1.png`

```
Edit the attached image of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals. Turn him so he is facing DOWN toward the camera: front view, whole face visible, seen slightly from above. Pose = ready stance, match the attached stick figure exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Both shoulders are the same distance from the camera: an arm or leg that swings toward the camera is drawn in FRONT of the body, one that swings back is BEHIND it. Keep the exact same character, outfit, colors, pixel style, head size and body proportions as the reference. One single figure in a 96x96 cell, feet on the ground line at the bottom, flat background #00FF00, empty fists, no weapon, no shadow, no text.
```

## Chéo lên phải (NE)

Sửa từ khung chuẩn E: xoay người 45° quay lưng vào trong.

Gửi kèm: `mau/cu-ti-mau.png` + khung chuẩn E đã gen + `anh/01-dung/ne/k1.png`

```
Edit the attached image of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals. Turn him so he is facing UP-RIGHT: 3/4 back view, back of the head and back visible, only a sliver of the right cheek. Pose = ready stance, match the attached stick figure exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). His RIGHT side (orange arm, yellow leg) is NEAR the camera; his LEFT side (purple arm, blue leg) is FAR, behind the body. Keep the exact same character, outfit, colors, pixel style, head size and body proportions as the reference. One single figure in a 96x96 cell, feet on the ground line at the bottom, flat background #00FF00, empty fists, no weapon, no shadow, no text.
```

## Lên (N)

Sửa từ khung chuẩn NE: xoay tiếp 45°, quay lưng hẳn.

Gửi kèm: `mau/cu-ti-mau.png` + khung chuẩn NE đã gen + `anh/01-dung/n/k1.png`

```
Edit the attached image of Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, baggy black pants with black shin wraps, black sandals. Turn him so he is facing UP, away from the camera: back view, only the back of the head, hair and back are visible, no face. Pose = ready stance, match the attached stick figure exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). Both shoulders are the same distance from the camera: an arm that reaches forward goes AWAY from the camera and is hidden BEHIND the body/head; an arm swinging back comes toward the camera, in FRONT. Keep the exact same character, outfit, colors, pixel style, head size and body proportions as the reference. One single figure in a 96x96 cell, feet on the ground line at the bottom, flat background #00FF00, empty fists, no weapon, no shadow, no text.
```
