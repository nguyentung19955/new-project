# Prompt gen lại cho kiếm vuông (17/10)

Ảnh "theo hệ" (`zed-vk-he`) và ảnh "gân" (`vk-kiem-gan.png`) đang vẽ theo kiếm cong cũ → đã **tạm tắt cho kiếm** (game nhuộm màu hệ lên ảnh kiếm vuông). Gen lại 2 tấm dưới đây là đủ (đã gộp).

**Gửi kèm mỗi prompt (cả 2):**
1. `docs/anh-goc/zed/moi/vk-kiem-vuong.png` — dáng kiếm vuông 4 cấp (trái → phải: Trắng, Mầm, Thành hình, Thức tỉnh).
2. `docs/anh-goc/zed/moi/00-anh-mau.png` — mẫu nét pixel.

## (a) Kiếm vuông theo hệ — Lửa / Độc / Băng (1 tấm, 3 hàng × 3 cột)

```text
Pixel art sword sheet, flat #00FF00 background, no text, no hands.
Redraw the attached square-tipped greatsword: 3 rows × 3 columns, all swords horizontal, hilt LEFT, square tip RIGHT, not touching.
Columns = reference frames 2, 3, 4 (Sprout, Formed, Awakened): keep EXACT shape, size, long red-wrapped two-hand grip, guard and square tip of that frame.
Rows = element: row 1 FIRE (orange #F26A28, light #FFD166, ember #C43B2B), row 2 POISON (green #72C943, light #C8F169, dark #315B35), row 3 ICE (cyan #62DDF5, light #D9FAFF, shade #276A9A).
Add the element only on the blade and guard (vein along the blade, small flames / vine / ice spikes at the square tip), 15–30% of the area; blade stays mostly steel.
1-px black outline, 3–4 shades per material, same style as the style reference.
```

## (b) Kiếm vuông "gân" giữa các cấp (1 tấm, 1 hàng × 3)

```text
Pixel art, flat #00FF00 background, no text, no hands.
Redraw frames 1, 2, 3 of the attached square-tipped sword sheet (White, Sprout, Formed) in one row, left to right, not touching.
Keep EXACT shape, size, grip, guard and square tip of each frame; change nothing else except: add ONE thin 2-px glowing pale gold (#FFE9A8) vein along one third of the blade spine.
1-px black outline, same style as the style reference.
```

## (c) Tuỳ chọn — để "tay sau gần chuôi" thật sự

Thân Cu Tí trong 10 khung kiếm nặng vẽ **hai nắm tay sát nhau** (cách nhau 1,5–2 điểm ảnh game), nên khi tay trước sát chắn tay thì tay sau chỉ ở giữa cán, phần cán gần chuôi thò ra sau. Muốn hai tay cách xa nhau trên cán dài thì phải gen lại các khung thân hai tay (khung 3–10), gửi kèm `docs/anh-goc/kiem-nang/kiem-nang-10k.png`:

```text
Same character, same 10-frame sheet, same poses, proportions, outline and colors, EMPTY HANDS, flat #00FF00 background.
Only change: in frames 3–10 (two-handed), the two fists are SPREAD apart along an imaginary long grip — about one fist-width of gap between them (front fist near the guard, back fist near the pommel), both on the same straight line as the sword direction of that frame.
```

Gen xong (a)/(b): cắt bằng `docs/anh-goc/zed/cat-diem-anh.py`, rồi cần một phiên nhỏ cho công cụ `dung_zed_vk_he.py` / `dung_zed_vk_gan.py` dựng ô kiếm **theo cỡ ô kiếm vuông** (mục `kiem_vuong` trong `zed-vk.sprite.json`) và bỏ chặn tạm trong `js/vien_vk.js`.
