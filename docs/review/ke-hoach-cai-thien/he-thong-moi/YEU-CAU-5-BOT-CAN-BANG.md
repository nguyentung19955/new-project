# Yêu cầu đợt 5: chạy bot đo cân bằng (chủ dự án chọn, 13/10 15:27 — ĐƯỢC TEST trong phạm vi việc này)

Đợt 4 (`bao-cao-4.md`) chỉ tính bằng mô hình. Nay chạy bot chơi thật để đo lại.

## Cần làm
1. Cập nhật bot `game/tests/campaign.py`, `game/tests/cay.py` (và `dps.py` nếu cần) cho hệ thống mới: 4 vũ khí cố định, nâng bằng linh khí (`G.VK_MOI`, chọn hệ khi lên Mầm — bot chọn hệ hợp vùng), nâng bộ (linh khí + vàng + mảnh trùm), không rơi đồ, không quần áo cũ, skill bộ (`G.SKILL_BO`). Bot nâng cấp như người chơi bình thường (`G.upg.auto` nếu còn hợp, sửa cho hợp luật mới).
2. Chạy bằng Playwright (Chromium có sẵn ở `/opt/pw-browsers`, KHÔNG chạy `playwright install`): chiến dịch 15 ải trên bản lưu mới, đo mỗi ải: số lượt cày, thua/thắng, cấp, Sức mạnh, máu còn, thời gian ải, linh khí/vàng mỗi lượt, mốc lên Mầm/Thành hình/Thức tỉnh, mốc nâng bộ.
3. So với mục tiêu ở `YEU-CAU-4-RESET-CAN-BANG.md` mục B (Mầm sau ~2–3 ải đầu, Thành hình quanh trùm vùng 1, Thức tỉnh vùng 2–3, bộ cấp 3 phải cày lại vùng; trùm đánh ~50% máu một đòn; không ải nào phải cày quá ~8 lượt) và số mô hình của đợt 4. Chỗ lệch rõ thì chỉnh số trong bảng hằng số (`game/js/data.js` mục lục cân bằng, `G.SKILL_BO`, `G.STAGE_REC`…), chạy lại bot xác nhận. Đo lại `G.STAGE_REC` (khuyên dùng) theo kết quả bot.
4. Đo thêm DPS 4 vũ khí trên quái thật (`dps.py`) ở Trắng và Thức tỉnh.

## Luật
- Được chạy Playwright/game cho việc đo này. KHÔNG sửa hình, hiệu ứng, `zed_moi.js` (trừ khi lỗi chặn bot).
- Không chép apiKey trong `game/js/firebase-config.js`; bot chạy với `?cloud=0`, không đụng đăng nhập Google/lưu mây.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại `python3 game/build.py`).
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao-5.md` (tiếng Việt dễ hiểu: bảng từng ải, số đã chỉnh cũ → mới và lý do, mã commit), push, tự dừng.
