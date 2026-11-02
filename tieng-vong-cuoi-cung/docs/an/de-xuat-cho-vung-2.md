# Đề xuất bí mật / nhiệm vụ ẩn cho Vùng 2 (và mẫu cho mọi vùng mới) – phiên "an"

> Gửi phiên Vùng mới. Phiên "an" KHÔNG sửa thư mục game/vung-N. Vùng 2 chưa có kế hoạch ChatGPT (docs/vung-2/yeu-cau-ke-hoach-gui-chatgpt.md),
> và phiên "an" cũng chưa hỏi được ChatGPT → đây là danh sách CHỖ CẦN CHỪA khi dựng phòng; nội dung cụ thể chốt theo tư vấn ChatGPT.

## Khi dựng phòng Vùng N, xin chừa sẵn
1. **3 phòng/hốc bí mật**: tường nứt `N` hoặc tường giả `G` (định dạng DINH-DANG-PHONG.md của Vùng 1), mỗi chỗ có `dau_hieu` loại `bi_mat` gần đó và 1 vật phẩm có `id` cố định trong hốc.
2. **1 thử thách platforming khó** cuối có vật phẩm id `<Pxx>-ky-uc` (Mảnh Ký Ức – chờ ảnh docs/yeu-cau-anh/an/005).
3. **1 chỗ "lắng nghe"**: một đạo cụ chuông/mặt nạ đặc biệt có toạ độ (cột, hàng) ghi trong `ghi_chu` – dùng cho bí mật "đứng im 3 giây".
4. **1 lối quay lại cần kỹ năng mới** (vd bật tường, lướt trên không) dẫn vào ô cũ đã thấy từ trước → nhiệm vụ ẩn "quay lại phòng cũ".
5. **Bộ sưu tập rải rác** (như 4 Thẻ Tên Vùng 1): 3–5 vật cùng `loai`, mỗi cái 1 phòng khác nhau.
6. Phòng trùm khai báo được (để có "hạ trùm không trúng đòn").

## Cách nối (không cần sửa engine)
- Thêm mục vào game/an/du-lieu.json với `"vung":"vung-N"` (phiên "an" làm khi có id phòng/vật phẩm thật) và `"phong_trum":{"vung-N":"Pxx"}`.
- Trang vùng nạp `../an/an.js` + một móc nhỏ giống game/an/moc-vung-1.js (đổi `VUNG`), hoặc báo phiên "an" làm móc.
- Sự kiện cần: vào phòng, nhặt vật phẩm (id), tường vỡ (phòng:cột:hàng), đứng trong ô `G`, trúng đòn, hạ trùm.

## Ý tưởng nhiệm vụ ẩn chờ ChatGPT duyệt (đã hỏi ở câu 4)
đánh chuông theo thứ tự · quay lại phòng cũ khi có kỹ năng mới · nói chuyện nhiều lần với nhân vật phụ · mang vật A tới chỗ B · thắng trùm không trúng đòn · dùng Tiếng Vọng ở chỗ đặc biệt.
