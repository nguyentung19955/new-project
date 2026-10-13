# Yêu cầu: hiệu ứng TỤ LỰC bằng ảnh (thay phần vẽ code khi giữ nút đánh)

Ảnh: `docs/anh-goc/zed/hieu-ung/G-tu-luc.png` — 1 hàng 6 khung, nền xanh #00FF00, màu trắng-xám (game tự nhuộm theo hệ). Vòng dẹt sát đất, khí xoáy hút vào tâm, sáng chói ở khung 4, bốc tia lên khung 5–6, lặp vòng.

## Cần làm
1. Cắt theo đường viền hình (như `docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py`: xoá nền, khử viền xanh, đổi điểm ám xanh sang xám), xuất `game/art/custom/hu-tu-luc.sprite.json` (định dạng linh-khi-sprite, net 2, lặp, tâm khung = tâm vòng dưới chân). Cỡ vòng ≈ đường kính 44 điểm ảnh game ở cỡ 1.
2. Khi người chơi GIỮ nút đánh để lấy đà (thương, búa, kiếm nếu có; phi tiêu đã có ảnh ném chùm thì vẫn dùng vòng này dưới chân lúc giữ): vẽ `hu-tu-luc` dưới chân Zed (lớp mặt đất, sau người), nhuộm theo hệ vũ khí (không hệ: trắng; lửa cam; độc xanh chanh; băng xanh nhạt — dùng bảng màu hệ sẵn có), to dần theo nấc lấy đà (nấc 1 → 2 → đầy), đầy nấc thì thêm ánh vàng như code cũ.
3. Thay phần vẽ code tương ứng (`fx_he.js` api `mvCharge`: vòng sáng + gạch + lấp lánh ở tay; và các gạch tím/xanh bay quanh vòng tầm quét khi giữ thương) — có ảnh thì không vẽ lớp code đó nữa. Vòng báo TẦM quét/xốc (nếu là vòng chỉ tầm đánh) giữ lại nhưng mảnh, mờ.
4. Cờ `?tuluc=0` để tắt (về như cũ). Không đổi luật lấy đà, sát thương, thời gian.
5. Làm SAU phiên "Hiệu ứng Thức tỉnh bớt chồng chéo" (cùng sửa fx_he.js): git pull trước, đọc code mới. KHÔNG sửa `game/js/zed_moi.js`.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ script cắt ảnh, `node --check`, `python3 game/build.py`.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Không chép apiKey trong `game/js/firebase-config.js`; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` cùng thư mục (tiếng Việt, mã commit, cách tắt) + `xem-tu-luc.png` (6 khung × 4 màu hệ, phóng to, nền tối), push, tự dừng.
