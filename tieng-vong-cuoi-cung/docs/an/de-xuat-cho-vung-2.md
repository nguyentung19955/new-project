# Đề xuất bí mật / nhiệm vụ ẩn cho Vùng 2 – Bronze Foundry (phiên "an", theo ChatGPT 02/11)

> Gửi phiên Vùng mới. Phiên "an" KHÔNG sửa thư mục game/vung-2. Số lượng + ý tưởng theo docs/an/tu-van-chatgpt.txt; vị trí cụ thể do phiên Vùng 2 chốt khi dựng phòng (theo kế hoạch ChatGPT của họ).

## Số lượng (ChatGPT)
7 bí mật có thưởng · 4 nhiệm vụ ẩn · 5 Mảnh Ký Ức · ≥ 6 lối tắt (đếm riêng). Độ khó ~ dễ 40% / vừa 40% / khó 20%.

## Khi dựng phòng Vùng 2, xin chừa sẵn
1. **3 phòng sau tường giả** (`G`) – có dấu hiệu nhìn thấy (vật liệu khác màu, bụi bay xuyên tường), luôn có đường thoát. Tường nứt (`N`) là loại khác, có thể thêm nhưng không thay 3 phòng này.
2. **1 thử thách platforming** gần chuông lưu (thử lại nhanh) – cuối có vật phẩm id `<Pxx>-ky-uc` (Mảnh Ký Ức).
3. **1 NPC** có nhiệm vụ riêng (phối hợp phiên Cốt truyện), không chắn đường chính.
4. **"A Bell Without a Tongue"** (ChatGPT, nhiệm vụ hành động lạ của Foundry): 1 quả chuông đặc biệt chỉ ngân khi đánh bằng Echo thay vì kiếm → thưởng Echo Charm trang trí. Cần dấu hiệu môi trường (chuông không có lưỡi).
5. **Bộ sưu tập rải rác** 3–5 vật cùng `loai` (như 4 Thẻ Tên Vùng 1), mỗi cái 1 phòng – phiên "an" sẽ viết chữ khắc theo ChatGPT.
6. **Quay lại phòng cũ khi có kỹ năng mới**: 1 ô đã nhìn thấy nhưng chưa tới được ở Vùng 1 hoặc Vùng 2.
7. Phòng trùm khai báo được (no-hit → thành tựu, không thưởng Mảnh Ký Ức).
8. Bí mật cần âm thanh → luôn có dấu hiệu hình (1/2/3 vạch – ảnh chung art/an/dau-hieu/, yêu cầu 016).

## Mức thưởng (ChatGPT)
Echo Shards | Ancient Bronze (chọn một): dễ 40–80 | 20–40 · vừa 100–180 | 50–100 · khó 180–300 | 100–160. Charm hiếm thưởng 1 lần.

## Cách nối (không cần sửa engine)
- Phiên "an" thêm mục vào game/an/du-lieu.json với `"vung":"vung-2"` khi có id phòng/vật phẩm thật, và `"phong_trum":{"vung-2":"Pxx"}`.
- Trang vùng nạp `../an/an.js` + một móc nhỏ giống game/an/moc-vung-1.js (đổi `VUNG`) – hoặc báo phiên "an" làm móc.
- Sự kiện cần: vào phòng, nhặt vật phẩm (id), tường vỡ (phòng:cột:hàng), đứng trong ô `G`, trúng đòn, hạ trùm, đứng im (giây).
