# LINH KHÍ — Xin ý kiến: nên sửa HÌNH ẢNH thế nào (nhân vật, quái, hiệu ứng)

Gửi ChatGPT. Chủ dự án thấy **nhân vật, quái và hiệu ứng hiện nhìn còn xấu**. Nhờ bạn xem ảnh chụp thật đính kèm và viết **bản hướng dẫn hình ảnh cụ thể** để Claude cài đặt. **Không cần viết code**: Claude sẽ sửa code, chụp ảnh và đối chiếu.

Kèm theo: `GUI-CHATGPT-GOP-Y.md` (tổng quan game, mục 9–13 nói cách vẽ), `BANG-MAU.md` (bảng màu đang dùng), thư mục `anh/` (ảnh chụp thật hôm nay, 10/10/2026).

---

## 1. Ràng buộc kỹ thuật (bắt buộc giữ)

- **Lớp thế giới 480×270 điểm ảnh**, phóng to kiểu pixel, không làm mịn. Mọi hình **vẽ bằng code**: tô ô vuông màu phẳng, toạ độ nguyên. Không có hoạ sĩ, không dùng ảnh ngoài. (Đã thử AI tạo ảnh rồi ghép trong Godot: ghép không khớp, đã bỏ.)
- **Em bé 22×33 điểm ảnh** (chibi, đầu/mũ ≈ 2/5 chiều cao), dựng theo lớp: đồ lưng → thân → áo → mũ → mặt nạ → vũ khí. Mặt tròn nhạt `#f6f0e2` kiểu mặt nạ. Viền `#1b1118`. Quay trái thì lật ngang.
- **Quái 20–45 điểm ảnh, trùm vùng tới ~120**, vẽ bằng hình tròn có bóng, chữ nhật, đường, đa giác trên lưới, rồi tự thêm viền `#14182e`. 36 quái và trùm (danh sách ở `GUI-CHATGPT-GOP-Y.md` mục 9).
- **Không đổi cỡ hình, vùng va chạm, thời gian ra đòn.** Được đổi: màu, hình khối bên trong khung, viền, đổ bóng, khung động tác, hiệu ứng.
- **Hiệu ứng**: kho 400 hạt dùng lại, phải mượt trên điện thoại tầm trung. Đỏ dành riêng cho **nguy hiểm, báo trước đòn của quái**.
- Chủ đề **dân gian Việt**, phong cách pixel.

## 2. Hôm nay đã làm gì (để bạn không đề xuất lại)

- **Đấu trường**: sàn nhiều lớp, bóng tường đổ xuống sàn, ánh sáng giữa phòng, một điểm nhấn mỗi phòng, tiền cảnh hai góc, sương và bụi trôi. Sàn **giảm độ đậm màu ×0,84–0,88** để nhân vật nổi lên. Kết quả: nền trầm và tối hơn.
- **Nhân vật**:
  - viền tối 1 điểm ảnh đều cho 36 quái, vành sáng mép trên;
  - quái lấy đà đúng nhịp, quái nặng giữ khung đòn;
  - bụi bước chân; quái chết vỡ mảnh 2 điểm ảnh;
  - độc/cháy theo nhịp không chớp trắng, chỉ khung đầu khựng hình chớp trắng;
  - vùng đang gây sát thương có viền đỏ cam liền nét.
- **Giao diện**: thanh máu, thanh trùm, khung gỗ viền đồng, màn đăng nhập mới.

Chủ dự án vẫn thấy **chưa đẹp**. Chủ dự án từng gửi ảnh một game pixel khác và muốn hướng đó: **màu tươi sáng, hiệu ứng đẹp, chuyển động mượt**.

## 3. Điểm yếu đã đo hoặc chụp được

| # | Vấn đề | Ảnh |
|---|---|---|
| H1 | **Bốn em bé cùng một bóng dáng**, chủ yếu khác màu áo; thu nhỏ 50% khó phân biệt | `anh/em-be-va-quai-rung-x3.png`, `-bien-x3`, `-lau-dai-x3`, `*-50.png` |
| H2 | **Lâu đài cổ cùng tông đỏ–cam–đen**: độ sáng quái so với sàn chỉ chênh 38–59, thấp nhất ba vùng | `anh/em-be-va-quai-lau-dai-x3.png`, `hinh-lau-dai-xam.png` |
| H3 | **Cảnh đông quá rối**: 12 quái + búa Lửa + Địa Chấn + chưởng thì em bé gần như mất hút; số sát thương, hạt lửa, vùng đỏ trộn vào nhau | `anh/hieu-ung-day-nhat.png`, `hieu-ung-day-nhat-bao-truoc.png` |
| H4 | **Phản hồi trúng đòn chưa phân cấp**: tinh anh bị đẩy như quái nhỏ; đánh vào mặt khiên trông như trúng thường; chí mạng chỉ to hơn | `anh/hieu-ung-phong-thuong.png` |
| H5 | **Nhiều vùng báo (5–6) cùng một màu**, không biết cái nào nổ trước; vùng trùm pha màu hệ dễ lẫn vệt cháy | `anh/hieu-ung-day-nhat-bao-truoc.png` |
| H6 | **40 dòng vũ khí dân gian chỉ khác hình và tên**, lúc đánh trông giống nhau | — |
| H7 | **Nền tối và trầm** sau đợt đấu trường, ngược với mong muốn màu tươi | `anh/dau-truong-*.png` |
| H8 | Quái và trùm: chủ dự án thấy **xấu** (chưa nói chi tiết) — nhờ bạn chỉ ra chỗ xấu cụ thể | `anh/quai-*.png`, `anh/trum-*.png` |

## 4. Nhờ bạn trả lời theo đúng khung này

**A. Nhận xét thẳng**: nhìn từng ảnh, cái gì xấu và **vì sao** (màu, khối, viền, tỉ lệ, chuyển động, độ rối). Ghi tên ảnh khi nói.

**B. Hướng phong cách chung** (≤ 10 quy tắc), ví dụ: bảng màu tổng, độ tươi, độ tương phản nhân vật/nền, viền, đổ bóng, số sắc độ mỗi chất liệu, nguồn sáng.

**C. Từng nhóm**, mỗi đề xuất đều có **số cụ thể** (mã màu hex, số điểm ảnh, số khung, thời gian):
1. **Em bé (4 em)**: bóng dáng riêng cho từng em trong khung 22×33 (mũ, tóc, vai, đồ lưng, tư thế đứng). Bảng màu từng em. Các khung đứng, chạy, đánh, né.
2. **Quái thường và tinh anh**: quy tắc chung (viền, khối, mắt, điểm sáng) và 3–5 quái mẫu sửa cụ thể, mỗi vùng ít nhất 1. Tinh anh khác quái thường thế nào.
3. **Trùm**: Mộc Tinh, Ngư Tinh, Hồ Tinh — cần sửa gì để "ra dáng trùm".
4. **Hiệu ứng**: vệt chém, trúng thường / nặng / chí mạng / phá giáp / kết liễu, hạt theo hệ Lửa, Độc, Băng, chưởng, số sát thương. Mỗi loại: màu, cỡ, số hạt, thời gian. Có giới hạn tổng để cảnh đông không rối (H3).
5. **Nền và phòng**: làm tươi lại thế nào mà nhân vật vẫn nổi (H2, H7). Mã màu sàn/tường từng vùng.
6. **Vũ khí**: làm 4 loại và các dòng dân gian khác nhau khi vung (H6).

**D. Thứ tự ưu tiên**: 5–8 việc, xếp theo "đẹp lên nhiều nhất / ít công nhất".

**E. Hình mẫu** (nếu được): vẽ mẫu dạng lưới ký tự hoặc ảnh PNG đúng cỡ thật (22×33 cho em bé, ~32 cho quái) để Claude chép theo. Không bắt buộc.

**Không cần**: code, đổi lối chơi, đổi cỡ hình hay vùng va chạm, thêm hệ thống mới.
