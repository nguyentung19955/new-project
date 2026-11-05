# AGENTS.md — luật cho mọi phiên AI làm việc trên repo này

Game **Talesworn** (trước là Linh Khí) — JavaScript thuần + canvas 2D, Firebase Hosting/Auth/Firestore, chạy ở https://spiritblade.web.app.
Chủ game người Việt, không rành kỹ thuật: báo cáo bằng tiếng Việt dễ hiểu, nói rõ đã làm gì, kiểm thế nào, quay lui ra sao.

Nguồn: mục 6.3 bản tư vấn ổn định `docs/tu-van-toan-cau/chatgpt-05-11/on-dinh-chatgpt.txt`, điều chỉnh theo cách làm hiện tại
(phiên F1, `docs/review/ke-hoach-cai-thien/on-dinh-f1-phat-hanh/bao-cao.md`).

## 1. Nhánh và đẩy code

- Làm trên nhánh **`khoi-tao-du-an`**. **Không đụng `master`**, không tạo nhánh phát hành riêng, không tạo Pull Request trừ khi chủ game yêu cầu.
- **Không force push**, không viết lại lịch sử nhánh chung.
- Trước khi push: `git pull --rebase`. Nếu `game/dist` bị `game/build.py` sửa mà chưa commit thì `git checkout -- .` trước khi pull;
  đụng nhau ở `game/dist` thì dựng lại dist (`python3 game/build.py`) sau khi pull rồi commit.
- Mỗi push vào `khoi-tao-du-an` có đụng `game/**` là **tự lên web** (workflow `.github/workflows/linh-khi-hosting.yml`), nhưng phải qua
  **cổng kiểm** trước: cổng hỏng thì không đăng, bản đang chạy giữ nguyên, GitHub mở issue "Đăng web thất bại".
- Commit kết thúc bằng dòng `Co-Authored-By:` và `Claude-Session:` mà phiên được giao.

## 2. Phạm vi

- Chỉ sửa tệp trong phạm vi phiên được giao. Cần đụng tệp của phiên khác / module khác: **không sửa**, ghi đề xuất vào báo cáo.
- Sửa một hàm/biến dùng chung (`G.*`): cập nhật mọi chỗ gọi và bài kiểm liên quan trong cùng commit.
- Không đổi luật chơi, cân bằng, cảm giác chơi nếu không được giao.
- Không xoá ảnh / đổi mã ảnh (`ma` trong `game/art/custom/*.sprite.json`) khi chưa chạy `python3 tools/phat-hanh/kiem_anh.py`.

## 3. Bản lưu của người chơi (quan trọng nhất)

- **Không làm mất hay ghi đè bản lưu thật.** Không đổi cấu trúc bản lưu khi chưa có **migration** (hàm chuyển bản cũ → mới) + **bản lưu mẫu cũ (fixture)** + bài kiểm.
- Không làm hỏng đăng nhập Google, lưu mây, chế độ `?cloud=0`.
- **Không sửa Firestore Security Rules của production.**
- Bài kiểm tự động **không dùng tài khoản thật**: luôn `?cloud=0` hoặc Firebase giả (`game/tests/fake_firebase.js`).
- Bản thử staging (`spiritblade--staging-….web.app`) tự chạy `?cloud=0` (đoạn mã chèn lúc gói, `tools/phat-hanh/dong_goi_site.sh`) — đừng gỡ.

## 4. Cờ URL

- **Không thêm cờ URL mới chỉ để né sửa lỗi.** Cờ mới chỉ khi cần đường quay lui cho một thay đổi lớn; ghi rõ mặc định, mục đích, ngày thêm, kế hoạch xoá.
- Không xoá cờ quay lui cũ khi chưa được giao. `?cloud=0` là chế độ quan trọng, giữ và có bài kiểm riêng.
- Mỗi thay đổi phải có cách quay lui (cờ, biến môi trường trong workflow, hoặc revert một commit) và ghi trong báo cáo.

## 5. Kiểm trước khi push

- Chạy bài kiểm liên quan đến phần đã sửa và ghi kết quả vào báo cáo. Tối thiểu khi đụng `game/**`:

  ```bash
  bash tools/phat-hanh/cong_kiem.sh        # cổng kiểm y như GitHub chạy trước khi đăng (~1–2 phút khi đã có game/.dem-webp)
  ```

  Gồm: `node --check` mọi JS, bài lưu mây, kiểm ảnh, dựng dist, trần dung lượng (một tệp ≤ 30 MB, web tải đầu ≤ 20 MB), smoke test headless
  (màn đầu, vào ải 1-1 đi/đánh/né/đổi vũ khí, lưu → tải lại, `?cloud=0`, EN/VI).
- **Không sửa smoke test cho "xanh"** khi chưa kiểm hành vi thật; test hỏng vì game đổi đúng ý thì sửa test và giải thích trong báo cáo.
- Không chơi thử bằng tay thay cho kiểm tự động; được chạy headless / Playwright. Không nói "đã thử trên iPhone" nếu không thử trên iPhone thật.
- Trần: bản một tệp ≤ 30 MB, web tải đầu ≤ 20 MB.

## 6. Bí mật

- Không chép apiKey, khoá tài khoản dịch vụ, token vào repo, log hay báo cáo. Khoá Firebase chỉ nằm trong GitHub Secrets
  (`FIREBASE_SERVICE_ACCOUNT_SONTINHTHUYTINH`).

## 7. Phát hành (chỉ phiên được giao "phát hành" mới sửa)

- Chỉ workflow `linh-khi-hosting.yml` (tự động) và `release-production.yml` (chạy tay) được đăng bản thật.
- Cờ `TU_DONG_LEN_BAN_THAT` trong `linh-khi-hosting.yml`: `'1'` = mỗi push tự lên bản thật (hiện tại); `'0'` = chỉ lên staging, chủ game duyệt rồi
  chạy "Release production". Chỉ đổi khi chủ game đồng ý.
- Quay lui bản thật: Firebase Console → Hosting → site spiritblade → Release history → bản trước → Roll back (chi tiết trong báo cáo F1).

## 8. Báo cáo

- Mỗi phiên viết báo cáo ở `docs/review/ke-hoach-cai-thien/<tên-phiên>/bao-cao.md`: đã làm gì, kiểm gì (kết quả thật), cách quay lui,
  việc còn lại / đề xuất cho phiên khác, mã commit.
