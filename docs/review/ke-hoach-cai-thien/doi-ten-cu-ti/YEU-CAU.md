# Đổi tên nhân vật chính Zed → "Cu Tí" (14/10 10:37, chủ dự án)

Đổi MỌI chữ người chơi nhìn thấy: "Zed" → "Cu Tí" (lời thoại `truyen.js`, lời NPC, bảng/nút/chú thích `village.js`, `village_scene.js`, `hanh_trang.js`, `data.js` (tên, mô tả kỹ năng/bộ), `stage.js`, thông báo, tiêu đề trang nếu có…). Sửa ngữ pháp cho tự nhiên tiếng Việt (ví dụ "Zed ơi" → "Cu Tí ơi", "của Zed" → "của Cu Tí"; tránh lặp "Cu Tí" quá dày, có thể dùng "cháu", "cậu" như lời thoại sẵn).
Bản tiếng Anh (`game/js/ngon_ngu_en.js` + `tools/ngon-ngu/tu-dien/*.json`): khoá tiếng Việt đổi theo câu mới; bản dịch dùng "Cu Ti".
KHÔNG đổi tên biến/khoá/tệp nội bộ (`zed_moi.js`, `G.zedMoi`, `zed-*.sprite.json`, `ZED_BO`, cờ `?zedbo=`…) và chú thích code — chỉ chữ hiển thị. Không đổi luật/số. Kiểm: grep lại chữ "Zed" trong chuỗi hiển thị, ghi danh sách còn lại (nếu cố ý giữ) vào báo cáo.
Phiên khác đang sửa `village_scene.js`/`sprite_custom.js` (NPC cử động, bản đồ): pull --rebase cẩn thận, xung đột thì giữ thay đổi của cả hai.
**TUYỆT ĐỐI KHÔNG TEST** — chỉ node --check, build.py. Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Xung đột game/dist: lấy bản trên nhánh rồi build lại. Viết `bao-cao.md` (vài câu cũ → mới tiêu biểu).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
