# Sửa lỗi mất bậc ép sau "Xoá hết"

Nguồn: docs/review/ke-hoach-cai-thien/kiem-can-bang/bao-cao-B.md mục 7 và đề xuất 1, 1b.
Lỗi: bấm "Xoá hết" (G.resetSave) rồi chơi lại → lần mở game kế, G.fixSave chạy VM.canLai (vì save.canLai thiếu) → dựng lại 4 vũ khí
KHÔNG giữ w.ep → mất bậc ép + dòng hiệu ứng (đá, vàng đã tiêu mất trắng). Bản lưu đó đẩy lên mây cũng mất.

Làm:
1. `js/vk_moi.js` VM.canLai: giữ `ep` của vũ khí cũ (nếu là object) khi dựng lại; để ep_do.js chuẩn hoá như cũ.
2. `G.resetSave` (và chỗ tạo bản mới tương tự) đặt `canLai = G.SAVE_CAN_LAI` trước persist, để VM.canLai không chạy lại vô cớ.
   Đọc ghi chú trong js/engine.js về việc cố ý không thêm canLai vào G.newSave — giữ ý đó, chỉ sửa đường resetSave.
3. Công cụ bot: game/tests/cay.py, balance.py, docs/review/ke-hoach-cai-thien/noi-gian-manh/do_trum.py — đặt canLai trước G.fixSave khi nạp cay_luu.json
   (hoặc thêm canLai vào cay_luu.json). Ghi trong báo cáo Sức mạnh bản lưu 3-5 trước/sau (bao-cao-B: 455 → 514).
4. KHÔNG đổi số cân bằng nào. Không đổi định dạng bản lưu ngoài cờ canLai; bản lưu cũ trên mây vẫn nạp được.

Kiểm: tái hiện bằng Node đúng chuỗi trong bao-cao-B mục 7 (resetSave → ep → persist → loadSave) trước và sau sửa; node --check; build.py.
Được chạy bot Node để tái hiện lỗi (không mở trình duyệt).
Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại). Xong viết bao-cao.md cùng thư mục, push, tự dừng.
