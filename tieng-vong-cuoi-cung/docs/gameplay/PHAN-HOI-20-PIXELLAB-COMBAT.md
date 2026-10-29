# Phản hồi 20 – gói "PixelLab → Claude" của ChatGPT + quyết định 30/10

Gói gốc: `docs/gameplay/PH20-goi-chatgpt-pixellab/` (CLAUDE_START_HERE.md, demo `fast_combat/` 43 dòng, `basic_platformer/`, prompt PixelLab, hướng dẫn xuất sheet).

## Audit demo `fast_combat/game.js` (Claude)
1. Bước thời gian thay đổi (dt kẹp 33 ms) → nhảy/lướt/chém khác nhau giữa 60/120 Hz.
2. Thời lượng đòn = số hình / FPS → gameplay dính độ dài animation (trái nguyên tắc chính tài liệu).
3. Lướt chỉ có hồi 0,65 s, không giới hạn trên không → bay mãi; chém trên không vô hạn; lướt giữa đòn không xoá combo đang đệm.
4. Không đệm phím nhảy, không coyote time.
5. Không xử lý blur → kẹt phím.
6. Không nút cảm ứng; canvas co giãn lẻ → điểm ảnh không đều trên iPhone.
7. hurt/death khai báo nhưng không dùng; không đẩy lùi; mỗi đòn trúng 1 mục tiêu; hộp chém y cố định.
Kết luận: KHÔNG xây trên demo. Lấy ý tưởng: cấu hình sprite bằng JSON (khung, số hình, fps, điểm chân), tách VFX, hitbox do code.

## Quyết định người dùng (30/10)
- Phát triển trên **engine hiện có** (P0-C / thu-lam-moi-2 + đường vẽ pixel của thu-lam-pixel).
- Phong cách: **Lam kiểu 4 chibi 64×64** (không đổi sang chi tiết kiểu Blasphemous 128×128).
- Combat: nhanh kiểu Dead Cells (đệm phím, huỷ đòn có kiểm soát, hitstop, đẩy lùi), hình pixel từ PixelLab.
- Sprite thật hiện có: chỉ "chạy 6 hình" PixelLab (`art/huong-moi/lam-pixel/pixellab/chay-*.png`, khung 96×96, nhân vật tạo từ chữ – mắt chưa hổ phách). Không giả định đã có sheet đầy đủ.
