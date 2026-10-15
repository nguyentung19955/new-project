# Kiểm tra cân bằng toàn game (15/10 17:15) — 3 phiên song song A / B / C

Chủ dự án: "Check lại xem độ cân bằng đã ổn chưa — test độ khó, chỉ số đồ, cân bằng theo cấp độ, vũ khí, quần áo." **Lần này ĐƯỢC TEST** (bot cân bằng; Node `--node` là chính, Playwright chỉ khi cần đo điều Node không chạy được: Chromium `/opt/pw-browsers`, KHÔNG `playwright install`, `?cloud=0`).

Đọc trước: `../buoc-1-lam-chac/bao-cao.md` (mục 5 bot Node, bảng Sức mạnh khuyên dùng), `../noi-gian-manh/bao-cao.md` (mục 6), `../he-thong-moi/bao-cao-5.md`, `bao-cao-6.md` (ép đồ, ải ngày), `../luc-chien/`. Công cụ: `game/tests/balance.py`, `campaign.py`, `cay.py`, `dps.py`, `bot.js`, `bot_nang.js`, `cd_lib.py`, `node_trang.js`, `do_trum.py` (thư mục noi-gian-manh).

**Phiên này CHỈ ĐO và ĐỀ XUẤT — KHÔNG sửa số cân bằng trong game** (phiên `cua-tuong-kho` đang sửa Cua Đá; chủ dự án sẽ chọn đề xuất rồi một phiên sau sửa gộp). Được sửa / thêm công cụ đo trong `game/tests/` và thư mục này.

Mỗi phiên viết `bao-cao-<A|B|C>.md` trong thư mục này:
- Đầu báo cáo: **tóm tắt 5–10 dòng bằng lời dễ hiểu** — chỗ ổn, chỗ lệch (xếp theo mức nặng), mỗi chỗ một đề xuất cụ thể (số cũ → số mới, tệp/khoá nào), mức tự tin.
- Bảng số đo đầy đủ bên dưới, lệnh chạy để chạy lại.
- Ảnh/biểu đồ tĩnh `xem-<A|B|C>.png` (đường cong, cột so sánh).

KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Pull --rebase cẩn thận (3 phiên + `cua-tuong-kho` + `quai-moi-lau` chạy cùng lúc). Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
