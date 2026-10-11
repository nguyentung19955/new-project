# Đợt 10 — Đo dung lượng và tách ảnh tải sau có kiểm soát (Q5)

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q5 (+ II, IV; nguyên tắc: một tệp → trần 15 MB; muốn tới 20 MB phải tách ảnh tải sau và chứng minh bằng số đo; không giảm chất lượng ảnh máy móc; trước khi đổi build phải lưu số đo bản hiện tại), `dot-1/bao-cao.md` mục 2 (màn hình tải, số đo 37 s ở 1,5 Mbps, `so-do-tai.json`), `game/build.py` (gom mọi `game/art/custom/*.sprite.json` vào 1 tệp HTML; quy tắc chỉ một thẻ script), `game/js/sprite_custom.js` (cách nạp dữ liệu nhúng `customSpriteData`), `.github/workflows/linh-khi-hosting.yml` và `firebase.json` (cách đăng; tệp phụ có được đăng không). Dự kiến 2–3 giờ. Tệp được sửa: `game/build.py`, `game/index.html`, `game/js/sprite_custom.js` (chỉ phần nạp), `game/js/engine.js` (chỉ phần chờ/tải), `firebase.json`/workflow nếu cần đăng thêm tệp, `docs/review/ke-hoach-cai-thien/dot-10/`. KHÔNG đổi định dạng `.sprite.json`, KHÔNG đổi ảnh, KHÔNG đổi luật chơi. Bắt buộc giữ: `python3 game/build.py` vẫn ra `game/dist/linh-khi.html` chạy được **một mình** (không có tệp phụ thì vẫn chơi, chỉ thiếu ảnh AI → vẽ code), `?cloud=0`, đăng nhập, lưu mây.

## 1. Đo trước (ghi `dot-10/so-do-truoc.json` và bảng trong báo cáo)
- Cỡ `game/dist/linh-khi.html`; phần JS; phần dữ liệu ảnh nhúng (tổng base64 của mọi sprite.json, chia theo nhóm quái / em bé / vũ khí / trang phục / vật phẩm / hiệu ứng / gd-*); phần còn lại.
- Cỡ truyền thật sau gzip (như Firebase Hosting: `gzip -9` và nếu có brotli `-q 11`), riêng từng phần.
- Thời gian tới màn chào ở 1,5 Mbps (Playwright giả lập mạng, cách dot-1 đã đo) và ở 10 Mbps; thời gian tới lúc thao tác được.
- Ước lượng khi nhập đủ ảnh theo kế hoạch (số ảnh còn lại × cỡ trung bình nhóm): ghi con số, so với trần 15/20 MB.

## 2. Phương án tách ảnh tải sau (làm thật, có cờ)
- `build.py` thêm chế độ xuất **2 tệp**: `linh-khi.html` (JS + dữ liệu ảnh BẮT BUỘC cho màn chào/làng/ải 1: em bé 4 thân, vũ khí mặc định, hiệu ứng cơ bản, giao diện) và `linh-khi-anh.json` (phần ảnh còn lại: quái, vũ khí theo hệ, trang phục, trùm…). Danh sách "bắt buộc" lấy theo luật đơn giản, ghi rõ trong báo cáo; mặc định mọi thứ khác là tải sau.
- `sprite_custom.js`: nạp tệp phụ bằng `fetch` sau khi màn chào vẽ xong; nạp xong thì đăng ký thêm sprite và xoá cache (vỏ phòng, khung ghép) như các phiên trước đã làm khi ảnh nạp xong. Tải thất bại → giữ phần đã có, không crash, ghi `console.info`, thử lại 2 lần giãn 3 s/10 s.
- Chỉ báo nhỏ ở góc trong lúc tải phần sau (chấm/vạch nhỏ, không che chơi) — chữ có `G.t`.
- Cờ build `--mot-tep` (hoặc biến môi trường) để xuất như cũ; workflow dùng chế độ 2 tệp **chỉ khi** số đo mục 3 cho thấy tốt hơn; nếu không, giữ 1 tệp và ghi lý do.
- Cache: tệp phụ đặt tên có hash nội dung (`linh-khi-anh.<hash>.json`) và `firebase.json` cache dài cho tệp đó, tệp HTML cache ngắn như hiện nay.

## 3. Đo sau và quyết định
- Lặp lại mọi số đo mục 1 với bản 2 tệp. Tiêu chí (Q5): phản hồi tải < 1 s; thời gian tới thao tác được ở 1,5 Mbps giảm rõ (mục tiêu ≥ 40 %); không màn hình đen/trắng kéo dài; thiếu/lỗi tải tệp phụ → dự phòng an toàn.
- Bảng so sánh trước/sau; kết luận: dùng 2 tệp hay giữ 1 tệp; trần dung lượng thực tế còn lại cho ảnh tương lai.
- Thử trên bản đóng gói qua `python3 -m http.server`: màn chào → làng → ải 1 (bot) với tệp phụ có / không có / bị chặn (404).

## Nghiệm thu
- `node --check`, `python3 game/build.py` cả hai chế độ; `cloud_save_regression` qua; workflow xanh; bản đăng chạy được trên mạng (kiểm `curl -I` tệp phụ nếu dùng 2 tệp).
- Không tệp phụ → game chạy, ảnh AI thiếu phần tải sau nhưng không lỗi.
- Báo cáo `docs/review/ke-hoach-cai-thien/dot-10/bao-cao.md` theo mục IV + `so-do-truoc.json`, `so-do-sau.json`, ảnh màn chào có chỉ báo tải phần sau; cập nhật dòng Đợt 10 trong `TRANG-THAI.md`.
