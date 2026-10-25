# REVIEW-V3 — Lam cutout, 25/10/2026

Đây là review và gói bàn giao để sửa tiếp, KHÔNG phải bản v4 đã sửa.
Thư mục cutout-v3/ giữ nguyên từng file trong ZIP v3 người dùng gửi.

## Ràng buộc
Giữ thiết kế và tỷ lệ ảnh 02/master-s.png. Lam cao 112 px logic, scale 112/470.
Không gen lại toàn bộ sheet, không kéo dài xương để bù lỗi ráp, không thêm mesh trước khi cần.
P0: trước chu kỳ chạy nghiêm túc. P1: trước tích hợp game. P2: hoàn thiện.

## Điều đã kiểm chứng
- Render từ JSON+PNG tái tạo IoU 0,9107, khớp họ màu 0,7833 như CHANGELOG.
- Sai số chiều dài tính từ P/D so với xuong tối đa khoảng 0,0044 px, do làm tròn.
- Cha/con gắn trùng điểm ở các lean -8/0/+8, sai số số học ~1e-13 px.
- 52 ảnh chi từ 0–120 độ mỗi 10 độ cho vien_ho=0. Không đồng nghĩa mọi lỗi silhouette/khe đều đã hết.
- Tính lại lean: trôi cổ chân theo y tới 3,57 px THẾ GIỚI, ~0,85 px LOGIC.
- Đo bỏ riêng hai lớp khỏi ảnh: lúc nghỉ vat-truoc và capelet-truoc không đổi ảnh; lean +8 vẫn không đổi. Khi đầu delta -10 độ, capelet-truoc làm thay đổi 14 pixel với ngưỡng sai khác >8.
- Thử toán học hông gần [81,45], giữ boot target và hướng boot, xương 47/38: thigh local 68,419; knee local 32,636; boot local -11,056 độ. IoU đạt 0,9150, khớp họ màu 0,7835 (so hiện tại 0,9107/0,7833). Đây là thử trong bộ nhớ, chưa sửa file và chưa duyệt chạy.

## P0 — việc phải sửa
### 1. Dáng nghỉ gối gần
Gối 87,304 độ hiện dùng để khớp vị trí boot nhưng quá co cho dáng nghỉ.
Khuyến nghị thử ATTACH_V3['dui-gan'] = [81,45] trong khung.py, giải lại IK khi xuất.
65→45 là NÂNG pivot trong hệ y xuống. Giữ xương, boot target và hướng boot; không copy góc làm tròn rồi bỏ kiểm chứng.
Giữ hông xa: đưa cả hai hông lên45 sẽ khiến chân xa cần với ~100,15 px >85 px tổng xương.
Đây là điểm gắn 2D phục vụ phối cảnh hình vẽ, không buộc hai hông cùng cao độ.

### 2. Hai mảnh áo đang giấu
AN_KHI_NGHI dịch vat-truoc/capelet-truoc vào vùng khuất là biện pháp che, không phải trạng thái asset rõ.
Giữ PNG nguồn, tắt hai mảnh trong rig nhìn hiện tại bằng visible=false. Rig.layers phải bỏ mảnh tắt.
Bỏ thủ thuật dịch để giấu; giữ thông tin offset cũ trong changelog nếu cần.
Không để tắt cha làm mất con ngoài ý muốn: định nghĩa rõ visible chỉ ảnh hưởng vẽ hay cả subtree.
Nếu cần dùng mảnh ở pose khác, bật bằng key/attachment có chủ đích và duyệt chuyển tiếp.

### 3. Khuỷu duỗi còn bậc
khuon3.child_cap đang lấy tiết diện P+6u và kéo ngược; parent_cap mở rộng nắp nhưng không tự làm trơn tiết diện/màu.
Thử đoạn chuyển tiếp 8–12 px thế giới giữa vùng khuỷu và cẳng tay, giữ nguyên P/D/chiều dài.
Đồng bộ vật liệu vùng nắp và vùng tiếp giáp, tránh miếng xanh bóng như miếng vá.
Không tăng bán kính nắp liên tục để che bậc. Nếu cần, dùng mảnh cẳng tay duỗi riêng; duyệt chuyển ảnh không bật.
Kiểm cả gần/xa và cổ tay ở các góc thực tế chạy/chém; đầu xa cẳng tay chưa được chứng minh kín ở góc lớn.

### 4. Lean và bám đất
thu3.lean_pose chỉ bù -lean ở đùi: giữ hướng nhưng hông vẫn dịch, chưa phải foot lock.
Bổ sung IK hai đoạn có hướng gập cố định, không tự đảo nhánh, không stretch/compress xương mặc định.
Khóa mục tiêu điểm đế trong thế giới ở pha chịu lực; từ hướng boot và offset đế suy ra target cổ chân.
Giải IK sau root/lean, trước render/đánh giá slot. Pha bay không khóa chân xuống đất.
Chân xa gần duỗi hết ở dáng nghỉ: phải xử lý target ngoài tầm bằng điều chỉnh root/hông hoặc giảm lean, báo độ lệch; không âm thầm kéo xương.
Đo cả cổ chân và điểm đế, không chỉ P boot. Mục tiêu đề xuất sai số đế <=0,25 px logic trong pha khóa nếu target khả thi.

## P1 — metadata và chuyển lớp
Phần dựng hình cha/gắn/P/D/huong_anh/goc_nghi tương đối/scale đã nhất quán với rap3.Rig.matrices.
Bổ sung schema_version dạng máy đọc, world_to_logic dạng số, visible, draw tie-break rõ ràng, quy tắc flip toàn rig, IK chain/target/bend/mix, điểm tiếp xúc boot và giới hạn góc sử dụng.
Cẳng chân và boot cùng slot115 cần thứ tự phụ bảo đảm boot đè cẳng chân, không dựa ngầm vào thứ tự object.
Quy tắc phu hiện là bù góc tĩnh theo delta thân, KHÔNG phải mô phỏng trễ/quán tính; ghi rõ và giữ thứ tự xử lý.
Luật đổi slot30 độ mới so bật/tắt vài ảnh tĩnh. Kiểm chuyển động qua ngưỡng hai chiều ở nhiều góc gối/lean.
Chỉ thêm hysteresis nếu cần: thử vào<28, ra>32, có trạng thái reset rõ; không coi đây là số đã duyệt.
Chạy validator: cha tồn tại/không chu trình, góc/tọa độ hữu hạn, PNG đúng kích thước, P/D hợp lệ, bone khớp và sort ổn định.

## P2 — chóp, nét và bóng
- hood_pieces: giữ cơ chế quạt và pivot, xử lý nét nhỏ tại hốc bằng mask cục bộ, cắt ngắn/bo đầu inner_px; không xóa viền thật. Kiểm -10/-6/0/+6/+10.
- Số 0 điểm khác ở chóp0 so với mũ đã xử lý from_src, không phải ảnh mẫu nguyên bản. t_chop không truyền joints nên net_trong_khop=0 không đánh giá được nét tại hốc.
- Nét trong6 đáng thử hơn5, nhưng bản game đầu nên giữ viền ngoài8 trong asset, sửa nét nguồn/khớp riêng.
- silhouette_pass dùng distance transform trên alpha ảnh ráp: không phải chỉ thêm một draw call. Không đưa xử lý pixel đó vào mỗi frame Canvas/iPhone khi chưa benchmark. Nếu cần, dùng bake/cache ngoài runtime.
- Bóng chân sau khi khớp và chuyển động ổn, không ưu tiên thêm màu.

## Giới hạn chỉ số và bằng chứng
vien_ho đếm pixel màu sát nền thiếu ink; khe_nen chỉ tìm lỗ nền kín. Khe có viền nối ra nền ngoài có thể không bị bắt. net_trong_khop gồm cả nếp gấp hợp lệ, không phải tỷ lệ lỗi thẩm mỹ.
Bảng08 là diện tích nhìn thấy trong các pose được thử, không phải chiều dài xương hay bảo đảm chạy rõ. V3 tăng độ lộ từ nhiều thay đổi (lớp, hình, pose), chưa chứng minh riêng luật slot tạo ra toàn bộ cải thiện.
Bộ chưa có kiểm chứng Safari/iPhone thật, chưa benchmark. Không hứa FPS từ ảnh Pillow.

## Có thể làm chạy chưa?
Đủ nền để dựng chạy NHÁP nhằm kiểm rig. Sau bốn P0, làm4 tư thế chính rồi nội suy vòng thử; chưa cần đợi hoàn thiện chóp/nét silhouette/bóng. Chưa chốt animation game trước khi xem liên tục ở112px và kiểm foot lock/slot.
