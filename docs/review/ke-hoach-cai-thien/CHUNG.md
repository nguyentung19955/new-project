# Luật chung cho mọi đợt của kế hoạch cải thiện (đọc trước brief của đợt)

Dự án: game "Linh Khí" (HTML5 canvas, pixel art, dân gian Việt), repo GitHub `nguyentung19955/new-project`, nhánh `khoi-tao-du-an`. Đẩy lên là tự đăng https://spiritblade.web.app (workflow `.github/workflows/linh-khi-hosting.yml`: `node --check game/js/*.js`, `game/tests/cloud_save_regression.test.js`, `python3 game/build.py`). Chưa có repo thì `git clone https://github.com/nguyentung19955/new-project && git checkout khoi-tao-du-an`. Chủ dự án người Việt, KHÔNG rành kỹ thuật, dùng iPhone: chữ trên trang, commit, báo cáo bằng tiếng Việt đơn giản.

## Căn cứ
- `QUYET-DINH-Q1-Q6.md`: quyết định đã phê duyệt. **Chỉ làm trong phạm vi được phép của đợt mình.** Mục II (8 quy định bảo vệ) và mục IV (báo cáo bắt buộc) áp cho mọi đợt.
- `KE-HOACH.md`: hiện trạng với số dòng code, bảng quyết định, checklist Phần 4.

## Luật cứng
1. Không đổi schema bản lưu, định dạng `.sprite.json`, quy chuẩn điểm neo, gameplay ngoài phạm vi. Không sửa/ghi đè ảnh trong `game/art/custom`.
2. Không làm hỏng: đăng nhập Google, lưu mây, chơi `?cloud=0`, đọc bản lưu cũ `linhkhi_save_v1`. Thiếu tài nguyên thì dự phòng như cũ, không crash.
3. Mỗi thay đổi phải **quay lui được**: ghi trong báo cáo lệnh `git revert <sha>` hoặc cờ tắt. Với tile bắt buộc có cờ tắt.
4. Phát hiện mâu thuẫn kiến trúc, rủi ro mất dữ liệu, hay cần vượt phạm vi → **dừng tại đó**, ghi bằng chứng vào báo cáo, đề xuất lựa chọn, không tự quyết.
5. Có phiên khác chạy song song (các làn vẽ ảnh A/B/C/D/E sửa `room_art.js`, `fx_anh.js`, `btn_art.js`, `village.js`…). Luôn `git pull --rebase origin khoi-tao-du-an` trước khi push; xung đột thì giữ cả hai; xung đột `game/dist/*` thì chạy lại `python3 game/build.py` rồi add. Thử lại tối đa 3 lần.
6. KHÔNG force push, KHÔNG đụng master, KHÔNG PR, KHÔNG đụng nhánh `claude/mobile-tower-defense-game-k5oxzo`. Commit kết thúc bằng:
   ```
   Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
   ```
7. Chủ dự án dặn **không chạy bộ test dài**; chỉ chạy đúng các kiểm ghi trong brief (node --check, build.py, cloud_save_regression khi đụng bản lưu, một lượt Playwright chụp ảnh). Chromium có sẵn, `NODE_PATH=$(npm root -g)`; trang nạp game cần `python3 -m http.server` trong `game/dist`. Dùng bản lưu THỬ tự tạo, không đụng dữ liệu thật.
8. Đẩy xong chờ workflow xanh (`gh run list --branch khoi-tao-du-an --limit 1`), đỏ thì sửa ngay.

## Báo cáo bắt buộc (mục IV quyết định) — `docs/review/ke-hoach-cai-thien/<dot>/bao-cao.md`
Danh sách tệp đổi · tóm tắt và lý do · kiểm thử đạt/chưa đạt theo tiêu chí nghiệm thu của đợt · ảnh trước/sau (`anh/`) · số đo nếu có · rủi ro còn lại · cách quay lui · quyết định mới cần duyệt. **Không ghi "hoàn thành" nếu chưa chạy kiểm tương ứng.** Đẩy báo cáo rồi DỪNG. Không hỏi lại chủ dự án giữa chừng; chỗ chưa rõ chọn cách ít rủi ro nhất và ghi vào báo cáo.
