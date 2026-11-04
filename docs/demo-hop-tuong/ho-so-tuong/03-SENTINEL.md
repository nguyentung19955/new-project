# Hồ sơ tướng 03 — SENTINEL (bản 2, thiết kế cho Skeleton PixelLab)

- **Tên / Số / Bậc màu:** SENTINEL · 03 · TRẮNG
- **Vai trò & chiêu (GDD):** bắn ổn định, quái đi đầu, tầm toàn đường, 45 dmg, 0,9 đòn/s; mỗi 3★ thêm "đánh dấu" +10% dmg.
- **Ý tưởng:** lính gác cyberpunk chibi, tay chân tách rõ, dáng gọn.
- **Màu:** trắng ngà (giáp) · xám than (đồ lót, súng) · xanh lơ neon (kính, vạch súng).
- **Vũ khí (chốt 04/11):** súng lục ngắn xám than cầm MỘT TAY ở tay PHẢI; tay trái để không bên hông. (Trước là súng nòng dài — đổi vì PixelLab xoay 8 hướng ra súng lục, bộ này đồng bộ nhất.)
- **Chi tiết bắt buộc:**
  1. Mũ trùm trắng gọn ôm đầu, 1 dải kính ngang xanh lơ.
  2. Ăng-ten NGẮN sát mũ, bên trái mũ.
  3. Giáp ngực trắng có vạch V xanh lơ.
  4. Tấm giáp vai ngắn xám than (KHÔNG áo choàng dài).
  5. Súng ngắm xám than, 2 vạch xanh lơ, ống ngắm nhỏ trên đỉnh.
  6. Ủng trắng đế xám.
- **Quy tắc Skeleton:** tay chân tách rõ, không bị đồ che; không có phần bay lượn dài.
- **Động tác mẫu Skeleton:** Idle (đứng) · Fireball (đưa tay phải cầm súng ra trước = bắn).
- **Hiệu ứng (ChatGPT vẽ riêng, game đặt):** chớp lửa xanh lơ ở nòng, tia đạn mảnh, dấu tâm ngắm trên quái.
- **Mô tả ngắn dán vào MỌI prompt:**
  > SENTINEL: chibi cyberpunk sentry, snug white hood with one glowing cyan visor strip, short antenna on the left of the hood, white chest armor with cyan V stripe, short charcoal shoulder guards (no cape), white boots, clearly separated arms and legs. Holds a long-barrel charcoal sniper pistol in his RIGHT hand only (2 cyan stripes, small top scope); left hand empty at his side. High top-down view.

## Bộ chính thức (04/11)
- Tư thế: ĐỨNG NGẮM SẴN, bắn = giật súng bằng code trong game; không có hoạt ảnh giơ súng.
- File: `nguon-tuong/moi/sen_ngam_{s,se,e,ne,n,nw,w,sw}.png` (128px, chân ở y=114, giữa x=64).
- Tạo bằng `/generate-8-rotations-v3` từ MỘT hình S (seed 101), 2 lượt. Ăng-ten: que + đĩa chân bên trái mũ. NW: thân che tay phải.
- Bản cũ (vá từng hướng) dời vào `nguon-tuong/moi/cu_va/`.
