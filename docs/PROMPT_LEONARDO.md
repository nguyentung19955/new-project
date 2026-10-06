# Thử gen khung hình chuyển động trên Leonardo.ai

Thử trước với **Lạc Tướng** (tướng, 3 động tác) và **Tôm Binh** (quái, 2 động tác). Ổn thì làm tiếp các nhân vật khác theo cùng mẫu.

## Cài đặt chung trên Leonardo (làm mỗi lần gen)
- **Kích thước:** chọn tỉ lệ ngang 4:1 nếu có. Không có thì chọn 16:9 hoặc kích thước tuỳ chỉnh gần 1024×256.
- **Ảnh tham chiếu:** tải ảnh nhân vật lên ở mục ảnh tham chiếu (Image Guidance / Character Reference, tuỳ phiên bản), chọn mức ảnh hưởng cao.
  - Lạc Tướng: dùng `docs/mau-lac-tuong.png`.
  - Tôm Binh: dùng ảnh Tôm Binh trong `docs/mau-quai.png` (cắt riêng 1 con).
- **Số ảnh mỗi lần:** 4, rồi chọn ảnh đúng luật nhất.
- **Negative prompt** (dán vào ô loại trừ, dùng cho mọi lần gen):
```
text, letters, numbers, labels, watermark, signature, grid lines, borders, frame, panel outlines, shadow on ground, floor, gradient background, checkerboard background, transparent background pattern, white background, extra characters, duplicate character in one cell, cropped weapon, character crossing into next cell, different costume, different colors, realistic, 3d render, photo, blurry, noise, texture
```

## Luật (đã có trong từng prompt)
1. Một ảnh = 1 nhân vật × 1 động tác × **4 ô vuông nằm ngang một hàng**.
2. Cùng nhân vật, cùng cỡ, cùng màu ở cả 4 ô; nhân vật cao ~70% ô, chân chung một đường đáy; lề ≥10%; không lấn sang ô bên.
3. Mô tả rõ từng khung.
4. Nền hồng tím phẳng `#FF00FF`, không chữ, không vạch kẻ, không bóng.
5. Kiểm tra: đủ 4 ô, cùng cỡ, nền đều màu → đặt tên file theo mẫu bên dưới rồi gửi.

---

## 1. Lạc Tướng — đứng thở → `lactuong-idle.png`
```
4-frame sprite strip, one row of exactly 4 equal square cells, same chibi character in every cell: Lac Tuong, young Lac Viet warrior general, bronze breastplate with sun-star patterns, dark green loincloth with golden Lac bird, green headband with bronze plate and tall brown-white feather crown, holding a double-headed bronze battle axe in the front hand. Facing right, 3/4 side view. IDLE BREATHING: frame 1 neutral stance; frame 2 chest slightly up, shoulders raised a little; frame 3 neutral stance; frame 4 body slightly lowered. Same size, same proportions, same costume and colors in all 4 cells, character about 70% of cell height, feet on the same baseline near the bottom, at least 10% empty margin around, nothing crosses into another cell. Cute chibi style, thick dark brown outline, flat cel shading, limited palette. Background: perfectly flat solid magenta #FF00FF everywhere, no text, no grid lines, no shadows.
```

## 2. Lạc Tướng — đánh → `lactuong-attack.png`
```
4-frame sprite strip, one row of exactly 4 equal square cells, same chibi character in every cell: Lac Tuong, young Lac Viet warrior general, bronze breastplate with sun-star patterns, dark green loincloth with golden Lac bird, green headband with bronze plate and tall brown-white feather crown, double-headed bronze battle axe. Facing right, 3/4 side view. AXE ATTACK: frame 1 ready stance, axe held in front; frame 2 wind-up, axe raised high behind the head, body leaning back; frame 3 strike, axe swung down to the front, body lunging forward, one short curved golden slash trail; frame 4 recover, axe lowered in front. Same size, same proportions, same costume and colors in all 4 cells, character about 70% of cell height, feet on the same baseline, at least 10% empty margin, axe never leaves its cell. Cute chibi style, thick dark brown outline, flat cel shading, limited palette. Background: perfectly flat solid magenta #FF00FF everywhere, no text, no grid lines, no shadows.
```

## 3. Lạc Tướng — tung chiêu → `lactuong-cast.png`
```
4-frame sprite strip, one row of exactly 4 equal square cells, same chibi character in every cell: Lac Tuong, young Lac Viet warrior general, bronze breastplate with sun-star patterns, dark green loincloth with golden Lac bird, green headband with bronze plate and tall brown-white feather crown, double-headed bronze battle axe. Facing right, 3/4 side view. SKILL CAST: frame 1 gathering power, axe raised with both hands, small golden sparks; frame 2 golden glow growing around the axe head; frame 3 releasing, axe thrust forward, bright orange-gold shockwave in front (effect stays inside the cell); frame 4 lowering the axe, a few fading sparks. Same size, same proportions, same costume and colors in all 4 cells, character about 70% of cell height, feet on the same baseline, at least 10% empty margin, nothing crosses into another cell. Cute chibi style, thick dark brown outline, flat cel shading, limited palette. Background: perfectly flat solid magenta #FF00FF everywhere, no text, no grid lines, no shadows.
```

## 4. Tôm Binh — đi → `tom-walk.png`
```
4-frame sprite strip, one row of exactly 4 equal square cells, same chibi monster in every cell: shrimp soldier of the Water God, small orange shrimp walking upright on little legs, bronze crested helmet, small bronze shield with a star, curled tail. Facing right, side view. WALK CYCLE: frame 1 left leg stepping forward; frame 2 legs together, body at its highest point; frame 3 right leg stepping forward; frame 4 legs together. Same size, same proportions and colors in all 4 cells, monster about 70% of cell height, feet on the same baseline near the bottom, at least 10% empty margin, nothing crosses into another cell. Cute chibi style, thick dark brown outline, flat cel shading, limited palette. Background: perfectly flat solid magenta #FF00FF everywhere, no text, no grid lines, no shadows.
```

## 5. Tôm Binh — đánh → `tom-attack.png`
```
4-frame sprite strip, one row of exactly 4 equal square cells, same chibi monster in every cell: shrimp soldier of the Water God, small orange shrimp walking upright on little legs, bronze crested helmet, small bronze shield with a star, holding a short trident. Facing right, side view. ATTACK: frame 1 ready, trident held low; frame 2 pulling the trident back, body leaning back; frame 3 thrusting the trident forward, one short white motion trail; frame 4 pulling back to ready. Same size, same proportions and colors in all 4 cells, monster about 70% of cell height, feet on the same baseline, at least 10% empty margin, trident never leaves its cell. Cute chibi style, thick dark brown outline, flat cel shading, limited palette. Background: perfectly flat solid magenta #FF00FF everywhere, no text, no grid lines, no shadows.
```

---

## Nếu ảnh ra sai
- **Không đủ 4 ô / ra lưới 2×2:** đổi tỉ lệ ảnh sang ngang hơn (4:1 hoặc 3:1), gen lại.
- **Nhân vật mỗi ô một kiểu:** tăng mức ảnh hưởng của ảnh tham chiếu, gen lại.
- **Nền không phải hồng tím đậm / có ô caro:** gen lại, giữ nguyên negative prompt.
- **Có chữ hoặc vạch kẻ:** không sao, mình tự xoá được. Chỉ cần nền đều một màu.
