# TURRET MERGE — quy tắc làm việc

Nhánh `claude/demo-hop-tuong` chỉ chứa game **TURRET MERGE** (merge tower-defense kiểu DCDW): game ở `thap/`, tài liệu/ảnh gốc/tư vấn ở `docs/demo-hop-tuong/`, công cụ ở `tools/thap-*`.

## Đọc trước khi làm
- Bàn giao + luật game người dùng đã chốt: `docs/demo-hop-tuong/ban-giao/BAN-GIAO.md`.
- Luật code/hình bắt buộc: `thap/QUY-TAC-HINH.md`.
- Đụng tới tương tác giữa các ụ (ghép, biến hình, nâng/hạ sao, đá/băng, online): đọc `docs/demo-hop-tuong/tuvan/conghuong/NGUYEN-TAC.md`.

## Chung
- Trả lời người dùng bằng **tiếng Việt**, ngắn, dễ hiểu; prompt gửi phiên khác / ChatGPT viết tiếng Anh.
- **Không in/commit khoá API** (PixelLab, Firebase apiKey, service account).
- Online phải **tất định**: gameplay không phụ thuộc hiệu ứng/FPS (30/60 FPS ra cùng kết quả).
- Sau mỗi thay đổi: thêm mục `## claude/<nhánh> — …` vào cuối `GAMEPLAY.md`, commit, push.

## Git
- Làm trên nhánh `claude/demo-hop-tuong`. Nhánh live `claude/mobile-tower-defense-game-k5oxzo` còn chứa game khác — chỉ xuất bản thư mục `thap/` lên đó, không đụng phần còn lại.
- Đẩy không cần worktree (kiểu plumbing): `git fetch origin <nhánh>` → `GIT_INDEX_FILE=/tmp/idx git read-tree FETCH_HEAD` → `git update-index`/`git rm --cached` → `git write-tree` → `git commit-tree <tree> -p FETCH_HEAD` → `git push origin <commit>:refs/heads/<nhánh>`.

## Xuất bản (nhánh live)
- Lấy `thap/` của nhánh làm việc (`git checkout FETCH_HEAD -- thap`), chạy `python3 tools/thap-ver.py <bản thap/ xuất bản>` (băm cache; chỉ trên bản xuất bản), commit `thap: xuất bản — …`, push. Workflow `.github/workflows/thap-firebase-hosting.yml` tự đăng lên https://turret-merge.web.app (cấu hình `firebase-thap.json`).
- Live: https://nguyentung19955.github.io/new-project/thap/ · https://turret-merge.web.app

## Hình ảnh
- Hình chỉ từ **ChatGPT** (PNG, nền magenta), không vẽ bằng code — chi tiết ở `thap/QUY-TAC-HINH.md`. Vẽ qua Claude in Chrome theo `docs/demo-hop-tuong/ban-giao/BAN-GIAO.md` mục 4; xong là đóng tab.
- **Tạo nhiều ảnh / hỏi ChatGPT nhiều việc: mở NHIỀU tab ChatGPT song song** (mỗi tab 1 ảnh hoặc 1 câu hỏi) để không phải chờ nhau; tự lấy ảnh về repo (tab GitHub upload, ≤3 file/commit) — không bắt người dùng tải; làm xong lượt nào thì **đóng hết tab** của lượt đó (người dùng chốt 09/11).
- ChatGPT hết lượt gen → đổi sang **tài khoản đã lưu sẵn** (menu tài khoản góc dưới trái); không gõ mật khẩu, không thêm tài khoản mới; hết cả thì dừng và báo.

## Kiểm tra (tiết kiệm token)
- Chạy server tĩnh ở gốc repo: `python3 -m http.server 8765`; test Node cần `NODE_PATH=/opt/npm-tools/node_modules` (Playwright cài sẵn).
- **Thay đổi nhỏ**: `node --check` file JS đã sửa + tối đa 1 test `tools/thap-kt-*` liên quan trực tiếp.
- **Đổi giao diện**: thêm 1 ảnh chụp 390×844, xem 1 lần.
- **Thay đổi lớn**: chỉ chạy các bộ test liên quan; hồi quy đầy đủ (`node tools/thap-kt-hoiquy.js`) chỉ khi người dùng yêu cầu hoặc trước khi xuất bản theo `thap/QUY-TAC-HINH.md`.
- Không dán log dài: lọc qua `tail` / `grep ✗`. Không làm GIF / ảnh ghép trừ khi người dùng yêu cầu.
- Báo cáo giữa các phiên ≤ 8 dòng.
