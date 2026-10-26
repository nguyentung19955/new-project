# Yêu cầu chủ dự án sau rig-v2 (26/10/2026, 21:57) – nguyên văn

Tôi duyệt rig-v2 làm nền, không gen lại và không đổi cấu trúc.

Chốt:
1. Bật tối 10% cho tay sau và boot xa.
2. Giữ đường vung tay sau phía sau lưng. Không tiếp tục tối ưu để tay luôn lộ hoàn toàn.
3. Giữ chiều cao dáng nghỉ 112px; chấp nhận thân nhỏ hơn 3%. Dùng một scale cố định cho mọi tư thế.
4. Giảm riêng nhún thân về tổng cao–thấp khoảng 3px logic. Trong chu_ky.py, thử THAN_DY từ [-16,30,-4,-30] thành [-8,15,-2,-15]. Giữ các chuyển động phụ trước, rồi kiểm tra đầu có còn nảy quá mạnh không.
5. Giữ chu kỳ 0,64s làm bản chuẩn tại 130,72px logic/s. Đọc code di chuyển game để xác định vận tốc thực và quy đổi cùng đơn vị trước khi đồng bộ tốc độ phát. Nếu chưa có code game, ghi rõ chưa xác nhận khớp.
6. Giữ rig/JSON làm nguồn chỉnh sửa, xuất sprite sheet RGBA cho clip chạy đã duyệt.

Bổ sung số đo tổng trượt tuyệt đối: sum(abs(v_cham-v_dat)*dt), không chỉ tổng có dấu.

Không ép hai boot luôn tách nhau; cho phép chồng thoáng qua.
Kiểm lại sau khi bật tối 10% ở đúng 112px.
Sửa bậc chân chóp nếu còn thấy khi chạy bình thường; không làm lại cả mũ.

Xuất sprite sheet 32 khung, thời lượng 20ms/khung tại tốc độ chuẩn. Cùng canvas, cùng điểm neo đất, không crop riêng từng khung. Không kèm nền, chữ hay đường đất vào sprite.
Xuất độ phân giải 2x, Lam cao 224 pixel nguồn ở dáng nghỉ, game hiển thị 112px; canvas đủ chứa dao và mọi tư thế.

Kèm JSON frame, thời lượng, điểm neo và tốc độ chuẩn. Hitbox/va chạm lấy từ gameplay, không lấy theo bóng hình đang nhún. Giữ pha chạy liên tục khi thay tốc độ.

Gửi GIF 112px sau chỉnh, sprite sheet, metadata và ZIP nguồn.
Chưa khẳng định hiệu năng iPhone khi chưa chạy thử thật.
