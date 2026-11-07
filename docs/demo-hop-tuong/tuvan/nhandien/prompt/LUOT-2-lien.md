# Lượt 2 — Gatling (Liên Thanh) (`lien`)

Họ hình dáng · chuyển động: **Ballistic · A02 SPIN_FIRE** · hình bóng mục tiêu: **dài và hẹp**

> Rotor 6 nòng **đã vẽ**: `thap-art/raw_anim_lien_nong.png` (CAN-VE anim, chưa gắn vào game). Lượt này chỉ gen bệ + thân; ô 4 để trống.

## 1. Đính kèm vào ChatGPT (2 ảnh, để giữ phong cách)
- `thap/assets/lien_nong.png` (đầu ụ hiện tại)
- `thap/assets/lien_de.png` (bệ riêng hiện tại)
- `raw_anim_lien_nong.png` (rotor đã có, để khớp tỉ lệ)

## 2. Dán prompt

```
Same art style, palette, outline weight and lighting as the attached turret images. Mobile tower defense unit,
STRICT TOP-DOWN view (camera straight down, no side faces, no 3/4 perspective), must stay readable at 46 px.
Make a 2x2 grid of equal square cells on a solid flat magenta #FF00FF background. Each part centered in its cell,
complete, not touching the cell edges, SAME SCALE in every cell, same light direction (top-left).
Cell 1 (top-left): the assembled unit. Cell 2 (top-right): BASE only (static mount).
Cell 3 (bottom-left): HEAD only (main moving module, pointing straight UP in the image).
Cell 4 (bottom-right): PART_B only (secondary moving part).
No text, no letters, no grid lines, no glow spilling onto the magenta, no drop shadow on the background, no human limbs, no characters.

UNIT: gatling gun. BASE: HEXAGONAL plate with an orange ammo-belt drum on one side.
HEAD: housing with a 6-barrel cluster seen from above as a long narrow rectangle pointing up.
PART_B: leave cell 4 EMPTY magenta (the spinning rotor already exists).
Overall silhouette long and narrow.
```

## 3. Kiểm trước khi gửi lại
- Đúng 4 ô, nền magenta đặc, không chữ, không lưới, 4 phần **cùng tỉ lệ**.
- Đầu ụ (ô 3) nhìn thẳng từ trên xuống, chĩa lên trên, không thấy mặt bên.
- Thu ảnh xuống khoảng 46 px và nheo mắt: vẫn ra hình **dài và hẹp**? Nếu chưa thì bảo ChatGPT "make the silhouette more distinct, exaggerate the dài và hẹp shape".
- Lưu thành `raw_mod_lien.png`.

Nếu ChatGPT vẽ lệch tỉ lệ giữa các ô: gửi lại "Redo: all 4 cells must use exactly the same scale as cell 1; parts must line up when stacked."
