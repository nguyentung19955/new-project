# Vũ khí đổi viền theo BẬC ÉP ĐỒ + ánh theo CẤP MÀI (15/10 17:20)

Hiện trạng (đã rà):
- Hình vũ khí trên tay (`game/js/zed_moi.js`, tấm `zed-vk.sprite.json` 4 loại × 4 cấp) đổi theo `G.wStage` (linh khí: Trắng / Mầm / Thành hình / Thức tỉnh) + nhuộm hệ. **Bậc ép đồ (7 bậc Trắng → Rực lửa, `G.EP_DO.mau`) KHÔNG hiện gì trên vũ khí cầm tay** — chỉ ở màu chữ tên và viền khung ô (`ep_do.js` `E.vien`, Rực lửa có lửa chạy quanh ô).
- **Cấp mài (+N)** chỉ hiện trong tên.
- Nghi lỗi: `G.wStage` (`js/combat.js`) còn kẹp theo bậc màu cũ `G.RARITY[G.wRar(w)].maxStage` dù 14/10 đã bỏ bậc màu cũ → vũ khí có thể không lên được hình cấp 2–3. Kiểm tra; nếu đúng là lỗi thì bỏ kẹp (giữ đọc save cũ), ghi rõ.

Chủ dự án đã duyệt (ảnh mẫu `mau-duyet.png` cùng thư mục — chỉ minh hoạ viền; hình vũ khí vẫn theo cấp linh khí như cũ):
1. **Vũ khí trên tay khi đánh**: viền màu bậc ép đồ quanh hình vũ khí (cả lúc đứng, chạy, chém, phi tiêu đang cầm):
   - Trắng: không viền. Xanh lam, Xanh lục: viền 1 điểm ảnh màu bậc.
   - Tím, Vàng: viền + hào quang mờ mềm màu bậc, nhấp nháy nhẹ.
   - Đỏ: viền + hào quang + vài đốm sáng bay quanh lưỡi.
   - Rực lửa: như Đỏ + đốm lửa vàng/cam chạy dọc vũ khí (cùng kiểu lửa của `E.vien` bậc tối đa).
   - Vẽ bằng cách dựng sẵn bản viền cho mỗi (loại, cấp, bậc) lúc nạp (canvas offscreen, giãn alpha 1 điểm ảnh, nhuộm màu) — không tính lại mỗi khung; đúng nét pixel (không mờ ảnh gốc); lật/xoay theo vũ khí như ảnh gốc. Vệt chém (`vet-chem`) có thể pha nhẹ màu bậc từ Tím trở lên.
2. **Ô vũ khí / túi đồ / bảng ép đồ / thợ rèn**: hình vũ khí trong ô cũng có viền + hào quang theo bậc như trên (ngoài khung ô đã có).
3. **Cấp mài**: ánh trắng lướt dọc vũ khí (cả trên tay và trong ô): +1..+2 không có; +3..+5 một vệt lướt mỗi ~2,5 s; +6..+8 mỗi ~1,6 s; +9 trở lên hai vệt, ~1 s (đọc cấp mài tối đa trong `data.js` để chia mốc hợp lý, ghi rõ).
4. Cờ `?vienvk=0` → tắt hết (như cũ). Hiệu năng: không thêm việc nặng mỗi khung (đo bằng công cụ hiệu năng có sẵn nếu có, báo cáo).
5. Ảnh soát tĩnh `xem-vien.png`: nhân vật cầm 4 loại vũ khí × 7 bậc (chụp bằng vẽ canvas trong Node/trang công cụ, không cần chơi), và ô vũ khí 7 bậc; `xem-vien.gif` ánh mài lướt.

**KHÔNG TEST game** — chỉ ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Nhiều phiên đang chạy song song — pull --rebase cẩn thận. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
