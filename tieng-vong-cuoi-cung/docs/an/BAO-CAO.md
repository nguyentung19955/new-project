# Báo cáo phiên "Vật phẩm ẩn + Nhiệm vụ ẩn" (an) – 02/11/2026

## Điều quan trọng nhất
Lần này phiên chạy trên mây theo lịch, **không có Claude in Chrome → không hỏi được ChatGPT** (phiên gen ảnh cặp cũng không có Chrome).
Theo luật "tư vấn ChatGPT 100%" và "chưa có ảnh thì chưa bật", mình chỉ dựng **khung kỹ thuật**, gắn vào **bí mật đã có sẵn** trong Vùng 1, và để **TẮT mặc định** – Vùng 1 chơi y hệt cũ.

## Đã làm
- **game/an/**: theo dõi bí mật + nhiệm vụ ẩn + thành tựu cho mọi vùng (dữ liệu JSON), lưu riêng (`tvcc-an`), phần thưởng chưa trao được thì **giữ chờ** (không mất), bản lưu cũ được **tính bù**.
- **Chơi thử**: mở `game/vung-1/index.html?an=1`:
  - 5 bí mật Vùng 1 được đếm: tường nứt P02, hốc H1 P03, tường giả P06, giếng P04, hốc treo P02 → báo "Đã tìm thấy bí mật (x/5)".
  - 4 nhiệm vụ ẩn: **Những Cái Tên Bị Quên** (4 Thẻ Tên – trước giờ nhặt không để làm gì), **Lặng Như Tro** (hạ trùm không trúng đòn), **Về Cửa Rễ** (quay lại P01 sau trùm), **Kẻ Nghe Tiếng Rễ** (tìm hết bí mật). Thưởng Mảnh Âm, Mảnh Ký Ức (lưu chung), thành tựu.
  - Nút **"Nhật Ký · Bí mật x/5"** trong bảng Chuông Lưu → bảng Nhật Ký Tiếng Vọng (chỉ hiện dòng đã lộ).
- **Tự tắt khi chưa có ChatGPT/ảnh**: bí mật "Chuông câm dưới tro", nhiệm vụ "Ba Tiếng Ngân", đoạn truyện bí mật, Âm Phù hiếm. Âm Điểm chỉ trao khi Hệ thống đồ bật (không thì giữ chờ).
- **Móc Vùng 1**: chỉ thêm 2 dòng `<script>` cuối game/vung-1/index.html. Không sửa phòng, engine, thư mục phiên khác.
- **Câu hỏi ChatGPT soạn sẵn**: docs/an/cau-hoi-chatgpt.md. Bản nháp thiết kế: docs/an/thiet-ke.md. Đề xuất cho vùng mới: docs/an/de-xuat-cho-vung-2.md.
- **Yêu cầu cho phiên gen ảnh cặp** (docs/yeu-cau-anh/an/): 001 nhờ hỏi ChatGPT (lưu docs/an/tu-van-chatgpt.txt), 002 hiệu ứng phát hiện bí mật, 003 khung nhật ký, 004 biểu tượng thành tựu, 005 Mảnh Ký Ức.

## Kiểm thử
- `node tools/an/kiem-thu-logic.js` – 35/35 đạt.
- `node tools/an/kiem-thu-vung1.js` (Playwright, chơi thật: chém vỡ tường, đi vào tường giả, nhặt đồ, trùm, tải lại) – 0 hỏng; mặc định tắt không đổi gì; không lỗi JS. Đã tự xem ảnh chụp bảng nhật ký + thông báo.
- Phép thử cũ Vùng 1 vẫn đạt: kiem-thu-f 66/66, g hỏng 0, h hỏng 0, kiem-tra-vung1 đi đủ P01→P12; Hệ thống đồ + Cốt truyện vẫn đạt.

## Việc lần sau (cần Chrome)
1. Hỏi ChatGPT bằng cau-hoi-chatgpt.md → lưu tu-van-chatgpt.txt → sửa du-lieu.json + thiet-ke.md theo tư vấn (thêm/bỏ bí mật, chữ khắc 4 Thẻ Tên, đoạn truyện).
2. Nhận ảnh 002–005 → hiệu ứng phát hiện, khung nhật ký, biểu tượng, Mảnh Ký Ức; bật "Chuông câm dưới tro".
3. Khi ChatGPT duyệt → đổi `bat_mac_dinh` thành true.
Chưa ghi HET.md vì sau tư vấn ChatGPT có thể còn yêu cầu ảnh mới.
