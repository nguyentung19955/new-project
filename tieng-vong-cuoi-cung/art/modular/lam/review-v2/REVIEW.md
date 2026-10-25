# Review kỹ thuật Lam cutout v2 — 25/10/2026

Đây là gói bàn giao review, KHÔNG phải bản đã sửa code. Thư mục lam-cutout giữ nguyên các file trong ZIP gốc; không đóng gói cache Python.

## Phạm vi và ràng buộc
Giữ thiết kế và tỷ lệ Lam theo anh/02. Chiều cao chơi 112 px logic. Không gen lại toàn bộ sheet. Ưu tiên sửa rig, mask và đường viền bằng code.

## P0 — sửa trước khi animate tiếp
1. rap2.py/lam(): capelet, vạt, đai, bao dao, chuông đang đặt bằng at() ở tọa độ thế giới; không theo Mt khi lean. Chuyển sang offset cục bộ của cha, giữ nguyên vị trí thế giới ở tư thế nghỉ. Đầu có offset cổ và chuyển động phụ riêng. Không đổi tỷ lệ.
2. Ảnh 08: REST chưa khớp mẫu về tay/dao, độ mở chân và capelet. Chỉnh góc nghỉ và vị trí gắn trước khi thay chiều dài xương.
3. Piece.__init__ sinh ring quanh mọi chi; segment() không truyền no_line. from_src còn giữ ink gốc. README mô tả cơ chế viền tốt hơn code thực tế. cap1_visible hiện không được sử dụng. Tách mask hình, vật liệu và mask viền; không để viền đầu nối ẩn tạo đường đen kép. Không xóa viền làm hở silhouette khi gập.
4. chain() dùng góc tuyệt đối trong thế giới, không cộng góc cha. Ghi rõ hoặc chuyển nhất quán sang góc cục bộ; không đổi ngữ nghĩa âm thầm.
5. Đùi/cẳng chân bị lớp trước che. Đo trên full rig, các tư thế chân 0/50/105 độ như thu2.py: diện tích cẳng chân gần còn thấy khoảng 7,8% / 3,9% / gần 0%; đùi gần gần 0% cả ba. Đây là diện tích mảnh ảnh, không phải chiều dài xương. Kiểm tra chuyển slot chân gần khi nâng gối; không đưa cả chân lên trước áo trong mọi tư thế và không làm bật lớp.

## P1 — trước khi chốt
- Giữ xương tay trên 45,8; cẳng tay 44,9; đùi 47; cẳng chân 38. Pivot hiện chưa có căn cứ để dịch; sửa cha/lớp/REST trước.
- Thử đầu dưới cẳng chân w1 36→28, r1 18→14, L vẫn 38. Đây là phương án thử vùng nối ẩn, KHÔNG phải kết quả đã duyệt. Boot pivot cách mép mask gần nhất khoảng 16 px; nắp hiện bán kính 18. Giữ silhouette thấy được khi đứng chuẩn; nếu không giữ được, dùng mask nối theo tư thế thay vì thu toàn bộ ống.
- Gối: w0 cẳng 46, bán kính nắp gần 23; chưa cần tăng. Nắp lớn hơn giúp kín nhưng không tự giải quyết đường đen và khối nhô.
- JSON nên có parent, điểm gắn, góc nghỉ, slot vẽ; hiện phần ráp vẫn hardcode và không đọc JSON.
- Viền 8 thế giới ≈1,91 px logic và ≈4,14 pixel thiết bị nếu hệ số 2,17. Giữ silhouette ngoài làm mốc; thử nét trong 5–6 sau khi bỏ viền ẩn. Đổi T_LINE không tự xóa ink từ nguồn.
- thu2.py: dùng cùng một scale hai trục. Hiện ngang theo 112/470 nhưng dọc crop 480 ép về112, sai khác khoảng 2,1%. Cố định canvas/root/đất giữa các tư thế, không tự crop từng pose cho bài kiểm tra neo chân.
- Chóp: giữ pivot trước, kiểm tra -6/0/+6 độ và stress ±10. hood_pieces() dùng seam_main nằm trong al, nên giao với al|seam_main không tạo được vùng bù mới ngoài al. Dựng rõ vùng bù phủ kín ở chân chóp và xử lý viền gốc; không chỉ tăng độ dư hoặc giới hạn góc để che lỗi.
- Chọn mask cho asset cuối; AI chỉ tham khảo bóng. Nếu dùng AI, bỏ silhouette/alpha/viền của AI và dựng lại viền từ code; cắt alpha thôi chưa loại viền AI phình vào trong.

## P2 — hoàn thiện
- segment(): shade theo xx tạo dải dọc đều. Dùng polygon bóng ít chi tiết theo từng đoạn; giữ palette hiện tại, tránh đường bóng nhấn mạnh đường nối. Không cần ánh sáng động.
- FAR=0.82 và palette hiện tại có thể giữ, kiểm tra trên nền gameplay sáng/tối sau khi sửa viền.

## Giới hạn kiểm chứng
Ảnh 09 không có khe nền hồng lớn rõ ràng ở ba tư thế được thử; chưa chứng minh kín ở mọi góc. Ảnh 11 có bậc tại chân chóp ở +10 độ. Các số phình viền 4–9 và độ trùng 69–78% lấy từ README gốc, chưa đo lại. Gói code không có IK/game runtime nên review này không xác nhận bám đất hay hiệu năng Safari thực tế.
