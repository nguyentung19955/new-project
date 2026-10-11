# Đợt 11 — Gộp các prompt hình nhỏ thành ít tấm ảnh hơn (yêu cầu chủ dự án 15:04 ngày 11/10)

Chủ dự án hỏi: "Check lại prompt các hình nhỏ có thể gộp vào chung với nhau được không". Hiện người dùng phải gen **~50 tấm ảnh lẻ** cho hiệu ứng (B1 14 dải, B2 8 + 3 bản hệ, B3 15 + 3 bản hệ) và vài lô nhỏ khác, mỗi tấm một prompt, mỗi tấm một lần kéo vào công cụ. Mục tiêu: **giảm số tấm phải gen xuống còn khoảng 10–12** mà công cụ vẫn tách đúng, không đổi định dạng `.sprite.json`, không đổi code game.

Đọc `CHUNG.md`; `docs/review/hieu-ung-b1/PROMPT.md`, `hieu-ung-b2/PROMPT.md`, `hieu-ung-b3/PROMPT.md` (bảng mã tệp, cỡ khung trong game, số khung, nền vẽ, bản theo hệ); `tools/tach-hieu-ung/index.html` (cách sinh prompt từ bảng `HU`, cắt dải một hàng, nhận nền tự động theo ô, đoạn BẢNG MÀU); `tools/tach-phong/index.html` và `tools/tach-giao-dien/index.html` (đã có kiểu "lô" nhiều ô: cắt lưới N cột × M hàng rồi gán từng ô vào mã tệp — tham khảo cách làm, **không sửa 2 tệp này**, phiên C3 đang sửa `tach-giao-dien`); `docs/review/cong-cu-nen-o/bao-cao.md` (nhận nền lệch màu theo ô, dùng lại). Dự kiến 2 giờ. Tệp được sửa: `tools/tach-hieu-ung/index.html`, `docs/review/hieu-ung-b1/PROMPT.md`, `hieu-ung-b2/PROMPT.md`, `hieu-ung-b3/PROMPT.md`, `docs/review/phong-a2/PROMPT.md` + `tools/tach-phong/index.html` **chỉ phần định nghĩa lô** (thêm 1 lô gộp, không đổi cách cắt), `docs/review/lang-d2/PROMPT.md` + `tools/tach-lang/index.html` chỉ phần định nghĩa lô, `docs/review/ke-hoach-cai-thien/dot-11/`. Phiên song song đang sửa `game/js/*` (8b, Đợt 10) và `tools/tach-giao-dien` (C3): không đụng.

## 1. Phân tích gộp (ghi bảng trong báo cáo)
Nguyên tắc gộp một lô: **cùng số khung, cùng tỉ lệ ô (ngang:cao) trong vòng ±25 %, cùng màu nền vẽ** (hồng tím hoặc xanh dương — đã chọn theo màu hiệu ứng để không lẫn nền), tối đa **8 hàng** một tấm (tấm quá cao thì công cụ tạo ảnh vẽ sai dần về cuối). Mỗi **hàng = một hiệu ứng**, các cột = các khung theo thời gian. Hiệu ứng lệch tỉ lệ nhẹ thì ô dùng tỉ lệ lớn nhất của lô, hình căn giữa ô; công cụ cắt ô rồi cắt sát mép hình (bounding box) và co về cỡ khung của hiệu ứng đó như hiện nay.
Gợi ý (phiên tự kiểm lại bằng bảng cỡ/khung thật):
- B1 (14 dải, đều 4 khung, ô ≤ 28×12): 2 tấm theo nền — nền hồng tím 9 hàng → tách thành 2 tấm (5 + 4) hoặc 1 tấm 9 hàng nếu thấy ổn; nền xanh dương 5 hàng → 1 tấm. Kết quả 2–3 tấm thay 14.
- B2 (8 + 3 bản hệ): nhóm theo số khung: 4 khung (Trảm Nguyệt, Vệt cào, Buông cung); 5 khung (Ra chiêu, Ra chưởng + 3 bản hệ Lửa/Độc/Băng = 5 hàng, cùng hình khác màu — rất hợp một tấm); 6 khung (Lướt chém, Nện đất); 8 khung (Giáo quét) để riêng. Kết quả ~4 tấm thay 11.
- B3 (15 + 3 bản hệ): nhóm theo số khung và tỉ lệ: 5 khung (Em bé trúng đòn, Nổ nhỏ); 6 khung ô vuông (Băng vỡ, Vừa đóng băng, Lấp lánh, Hồi máu); 6 khung ô ngang (Sao choáng, Cổng); 6 khung ô dọc (Cột lửa, Cột nước); 8 khung ô ngang to (Nổ khói, Sốc nhiệt, Vòng phép); Trùm nổ cuối (192×160) và Tiến hoá + 3 bản hệ (96×180, 8 khung, 4 hàng) để riêng vì rất to. Kết quả ~7 tấm thay 18.
- A2: 3 lô cửa 3 vùng (6 ô mỗi lô, cùng cỡ) → 1 lô 3 hàng × 6 cột = 18 ô, mỗi hàng một vùng; lô ổ khoá + đầu lâu giữ. 2 tấm thay 4.
- D2: lô Khung cửi (3 khung) + Lửa lò (3 khung) → 1 tấm 2 hàng × 3 cột. 1 tấm thay 2.
- C1, C2, A1, D1, bản đồ: đã là một tấm mỗi lô, giữ. A3 (3 lô 16 ô) giữ vì gộp sẽ 48 ô.
Ghi rõ lô nào **không gộp được** và lý do.

## 2. Công cụ `tach-hieu-ung`: thêm kiểu "Lô nhiều hiệu ứng"
- Ô chọn hiệu ứng thêm nhóm "**Lô gộp**" ở đầu danh sách: mỗi lô ghi tên, số hàng, số cột, màu nền, danh sách mã tệp theo hàng. Chọn lô → prompt sinh tự động từ các đoạn mô tả `mo/dat/huong/thoi` đang có của từng hiệu ứng (không viết lại nội dung, chỉ ghép), theo mẫu bố cục đã dùng ở các lô khác: "lưới ĐỀU đúng N cột × M hàng = … ô (KHÔNG thêm cột/hàng), kẻ lưới mảnh màu tối, mỗi HÀNG là một hiệu ứng, các ô trong hàng là các khung theo thời gian từ trái sang phải; hàng 1: …; hàng 2: …". Đoạn BẢNG MÀU chèn một lần cho cả lô (các nhóm màu liên quan).
- Đưa ảnh vào: nhận lưới (dùng lại hàm nhận vạch kẻ dày và nhận nền theo ô hiện có), cắt M hàng × N cột, hàng i → hiệu ứng i, mỗi ô cắt sát mép hình rồi xử lý **đúng như đường cũ** (co về cỡ khung, nền trong suốt, kiểm ĐẠT/chưa đạt từng hiệu ứng). Hiện bản xem thử từng hàng chạy động như cũ; nút **"Tải tất cả (.zip)"** gói đủ các `.sprite.json` của lô, tên tệp giữ nguyên mã cũ (`hu-dan-bot.sprite.json`…) để Claude nhập như trước.
- Hàng nào ảnh vẽ hỏng → vẫn tải được các hàng khác; người dùng có thể gen lại riêng hiệu ứng đó bằng prompt lẻ cũ (giữ nguyên các mục lẻ).
- Kiểm nhanh: tạo ảnh lưới giả (Playwright/Pillow vẽ 4 hàng × 4 cột hình đơn giản trên nền hồng tím có vạch kẻ) → đưa vào lô → 4 sprite.json ra đúng mã, đúng cỡ khung, đúng số khung; so với cắt dải lẻ cùng hình = giống nhau. Chụp ảnh trang công cụ có lô gộp (`dot-11/anh/`).

## 3. Cập nhật PROMPT.md
- Mỗi `hieu-ung-b1/b2/b3/PROMPT.md`: thêm mục đầu "**Cách nhanh: N tấm thay M**" với bảng lô (tên lô, hàng nào là gì, prompt gộp chép nguyên văn từ công cụ), hướng dẫn 4 bước (gen → mở tach-hieu-ung → chọn lô → Tải tất cả → gửi zip). Phần prompt lẻ cũ dời xuống dưới thành "Dự phòng: gen lẻ từng dải".
- `phong-a2/PROMPT.md`, `lang-d2/PROMPT.md`: tương tự với lô gộp mới (định nghĩa lô thêm vào `tach-phong`/`tach-lang` theo đúng cấu trúc lô hiện có của tệp đó).
- Cập nhật `TRANG-THAI.md`: dòng Đợt 11 + sửa cột Prompt của B1/B2/B3/A2/D2 ghi số tấm mới.

## Nghiệm thu
- Tổng số tấm phải gen cho B1+B2+B3+A2+D2 ghi rõ: trước (≈ 55) → sau (mục tiêu ≤ 20). 
- `python3 game/build.py` không đổi (công cụ không nằm trong bản game); workflow xanh; trang https://spiritblade.web.app/tach-hieu-ung.html mở được, lô gộp hiện ở đầu danh sách, prompt sinh ra đủ các hàng.
- Đường cắt dải lẻ cũ không đổi (thử 1 dải cũ → kết quả giống trước).
- Báo cáo `docs/review/ke-hoach-cai-thien/dot-11/bao-cao.md` theo mục IV + bảng gộp + ảnh. Xong thì DỪNG.
