# Báo cáo: phác thảo các kiểu xếp phòng trên bản đồ một ải

Đã xong cả 5 ảnh. Đây chỉ là bản phác thảo để duyệt, không sửa gì trong `game/`.

## Danh sách ảnh

| Ảnh | Nội dung |
|---|---|
| `bo-cuc-A-duong-chinh-co-nhanh.png` | Kiểu A: lối chính ngoằn ngoèo 6 phòng (Bắt đầu, Đánh quái, Đánh quái, Tinh anh, Suối hồi, Trùm) và 2 phòng phụ bỏ qua được (Rương báu; Thương nhân, đổi được thành Thử thách hoặc Lời nguyền). |
| `bo-cuc-B-me-cung-nho.png` | Kiểu B: cụm 8 phòng trong ô 3 x 3, có 2 đường vòng, vào ở góc dưới trái, Trùm ở góc trên phải. |
| `bo-cuc-C-sanh-trung-tam.png` | Kiểu C: sảnh giữa (cũng là phòng Bắt đầu), ba cánh trái, phải, dưới; phía trên là cửa khóa dẫn qua Suối hồi tới Trùm. |
| `so-sanh-bo-cuc.png` | Ba kiểu đặt cạnh nhau, cùng tỉ lệ, kèm dòng khuyên chọn. |
| `quy-tac-cua-va-ban-do.png` | Sáu quy tắc về cửa và bản đồ nhỏ, dùng được cho cả ba kiểu. |

Mỗi ảnh bố cục có sơ đồ lớn, ba bản đồ nhỏ (lúc mới vào, giữa chừng, lúc cuối) và ba ý: cảm giác khi chơi, độ dài một ải, ảnh hưởng tới hai luật cốt lõi.

Mã dựng ảnh nằm trong `nguon/`. Vẽ lại bằng: `cd nguon && python3 bo_cuc.py && python3 so_sanh.py && python3 quy_tac.py`.

## Luật mở cửa Trùm đề xuất

- **Kiểu B:** Cửa Trùm nằm trong phòng Suối hồi và chỉ mở khi bạn đã dọn xong 3 phòng có quái (2 phòng Đánh quái và phòng Tinh anh).
- **Kiểu C:** Mỗi cánh có một phòng quái giữ một mảnh chìa; gom đủ 3 mảnh thì cửa phía trên sảnh mở, dẫn qua Suối hồi rồi tới Trùm.
- **Kiểu A:** không cần luật riêng, vì Suối hồi và Trùm nằm cuối lối chính.

## Khuyên chọn: Kiểu A

- **Phiên chơi ngắn trên điện thoại:** A giữ ải trong khoảng 4 đến 6 phút như hiện nay và gần như không phải đi ngược. B và C ước chừng 5 đến 7 phút vì phải quay lại phòng cũ, lại bắt người chơi nhìn bản đồ nhiều trên màn hình nhỏ.
- **Luật suối hồi trước trùm:** A và C luôn giữ được. B chỉ giữ được nhờ luật khóa cửa, và vẫn hở một chỗ: người chơi có thể ghé suối quá sớm rồi đánh tiếp, khi đó điều suối báo về Trùm đã cũ.
- **Trùm học đủ một ải:** ở A, Trùm luôn thấy các trận trên lối chính; phòng phụ chỉ cộng thêm. B và C cũng đủ nhưng phải dựa vào luật mở cửa.
- **Giá trị chơi lại:** B cao nhất, C vừa, A thấp nhất. A bù lại bằng cách mỗi lần chơi đổi loại phòng phụ và chỗ gắn phòng phụ.
- **Độ dễ khi sinh ngẫu nhiên:** A dễ nhất (bẻ lối chính trên lưới rồi treo phòng phụ, không bao giờ kẹt). C cũng dễ (đổi độ dài và phần thưởng từng cánh). B khó nhất vì phải kiểm tra đường vòng và tránh lối tắt bỏ qua phòng quái.
- **Gợi ý thêm:** dùng A làm kiểu chung, để dành C cho ải cuối mỗi vùng (ải có boss vùng) để ải đó có cảm giác đặc biệt hơn.

## Mấy điều tôi tự giả định, cần chủ dự án hoặc phiên điều phối xác nhận

- Các con số thời gian (4, 6, 5 đến 7 phút) là ước lượng của tôi từ số phòng và quãng đi lại, chưa đo trên game.
- Phòng `Bắt đầu` được coi là một loại phòng riêng. Để ải vẫn đủ 4 trận trước Trùm như hiện nay, tôi giả định phòng này có một đợt quái nhẹ. Nếu phòng Bắt đầu không có quái thì ở cả ba kiểu Trùm chỉ còn 3 trận để học.
- Bản thiết kế ghi một ải dài 5 đến 7 phút, còn đề bài ghi 4 đến 6 phút. Các ảnh dùng con số 4 đến 6 phút của đề bài.
- Vị trí bản đồ nhỏ (góc trên bên phải, dưới hai ô vũ khí, thay hàng chấm phòng) chọn theo chỗ các nút hiện có trong `game/js/stage.js`.
- Game đang nhìn ngang, cửa chỉ ở bên phải. Đi bốn hướng nghĩa là phải vẽ thêm cửa ở vách sau, mép trước và bên trái của phòng. Việc này nằm ngoài phần phác thảo nhưng đúng với cả ba kiểu.
