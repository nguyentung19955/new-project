Bạn là game designer kiêm lập trình viên game 2D HTML5 Canvas. Hãy đọc mã nguồn hiện tại của “Tiếng Vọng Cuối Cùng”, rồi lập kế hoạch mở rộng gameplay để tôi duyệt. CHƯA sửa code trong bước này.

ĐỊNH HƯỚNG ĐÃ CHỐT
- Đây là metroidvania hành động: chiến đấu, khám phá, kiếm đồ, nâng cấp bản thân và vũ khí là chính.
- Không chuyển game thành giải đố hoặc đi cảnh cảm xúc là trọng tâm.
- Không khí huyền bí, cổ xưa, ngầu, có sức mạnh; mỹ thuật “Cổ tích chuông tàn”.
- Lam bình tĩnh và nguy hiểm, không yếu ớt hoặc hoạt náo.
- Màn logic 960×540, chơi chủ yếu bằng nút cảm ứng trên iPhone ngang.
- Chỉ một người phát triển, hình gen bằng ChatGPT, xử lý và hoạt ảnh bằng code/cutout.
- Tỷ lệ định hướng: khoảng 55% chiến đấu, 30% khám phá, 15% nâng cấp và câu đố ngắn. Đây là mục tiêu để thử, không phải công thức cứng.

BỐI CẢNH
Lam là người giữ chuông trong Làng Chuông, nằm bên trong thân rỗng của Cây Chuông Vĩnh Hằng. Tiếng chuông đang tắt dần. Lam đi xuống Rễ Mục, Hồ Ngầm Phản Chiếu và Vực Lặng.

GAMEPLAY HIỆN CÓ — PHẢI ĐỌC CODE ĐỂ XÁC NHẬN
- Chạy, nhảy, dash miễn sát thương, bám/trượt tường, nhảy tường, pogo.
- Combo dao 3 nhát, chém hất, chém trên không, khựng khi trúng.
- Tiếng Vọng: ghi tối đa 3 giây, bóng phát lại rồi đứng yên.
- Cộng hưởng: Lam và bóng đánh cùng mục tiêu trong cửa sổ 12 tick mô phỏng hiện tại, gây sát thương lớn/phá vỏ.
- Quái chuông gỗ; boss Chuông Gác Làng có đập, quét và pha kéo xích bằng bóng.
- Tường mục gãy sau thời gian bám.
- Demo Làng Chuông và đoạn thử Rễ Mục.

MỤC TIÊU
Tạo vòng chơi:
khám phá → gặp đối thủ mới → học cách đối phó → kiếm vật liệu/đồ → chọn nâng cấp → hạ tinh anh/boss → mở đường mới.

Đánh thường phải vui ngay cả khi chưa gọi bóng. Không biến mọi quái thành bài toán chờ Cộng hưởng. Đồ phải thay cách chơi, không chỉ cộng phần trăm.

HÃY ĐÁNH GIÁ CÁC HỆ THỐNG SAU

1. THẾ THỦ / PHÁ GIÁP
- Địch có thanh hoặc trạng thái thế thủ riêng với máu khi cần.
- Đòn thường, đòn nặng và Cộng hưởng có vai trò khác nhau.
- Vỡ thế thủ tạo khoảng choáng đủ rõ để tận dụng.
- Không áp dụng đủ mọi thanh trạng thái cho mọi quái nhỏ.
- Phân biệt vỏ cứng, đỡ hướng trước và thế thủ; tránh ba hệ thống trùng nhau.
- Cộng hưởng ưu tiên tạo cơ hội tấn công, không chỉ hiện số sát thương lớn.
- Đề xuất phản hồi ở kích thước chơi và khả năng đọc khi có bóng.

2. NÉ SÁT ĐÒN
- Giữ dash hiện tại làm công cụ né chính.
- Thử thưởng một ít năng lượng Vọng khi dash qua một đòn nguy hiểm đúng thời điểm.
- Không thêm nút parry.
- Chống farm thưởng nhiều lần từ cùng một đòn.
- Định nghĩa rõ điều kiện bằng logic đòn đánh, không chỉ khoảng cách tới quái.
- Đánh giá liệu tính năng này có thực sự cần trước khi thêm.

3. BỘ ĐÒN GỌN CHO CẢM ỨNG
- Bấm Đánh để nối combo.
- Cân nhắc giữ Đánh rồi thả để tung đòn nặng.
- Không để việc chờ phân biệt bấm/giữ làm nhát đánh thường bị trễ.
- Nêu phương án nếu đòn nặng xung đột combo.
- Pogo và chém hướng khó là kỹ thuật tùy chọn, không bắt buộc trên đường chính.
- Đề xuất cửa sổ buffer và hủy động tác, nhưng phải kiểm tra với code hiện tại.
- Không cho phép hủy mọi động tác vô hạn làm mất rủi ro.

4. TIẾNG VỌNG TRONG CHIẾN ĐẤU
- Giữ bản ghi chủ động đang dùng cho câu đố.
- Đánh giá một prototype riêng: gọi bóng tái hiện đoạn hành động vừa xảy ra để phối hợp tấn công nhanh.
- Chưa thay replay hiện tại hoặc thêm chế độ tự động nếu chưa được duyệt.
- So sánh: giữ cơ chế hiện tại và cải thiện tốc độ dùng, với phương án ghi ngược quá khứ.
- Ưu tiên ít thao tác, dễ đoán, không thêm nút thứ năm.
- Không đổi ngữ cảnh âm thầm khiến cùng nút gọi hai loại bóng khó hiểu.
- Chốt cách dùng tài nguyên, hồi phục, giới hạn một bóng, xử lý chết/chuyển phòng.
- Nêu rõ thay đổi ảnh hưởng công tắc, boss kéo xích, bản ghi và tính xác định ra sao.
- Không để bóng gây sát thương hoặc proc vô hạn; xác định hiệu ứng nào được bóng kích hoạt.

5. ĐỊCH VÀ TÌNH HUỐNG CHIẾN ĐẤU
Đề xuất 4 vai trò, tái sử dụng asset khi hợp lý:
- Địch cận chiến dễ đọc để học nhịp.
- Địch giữ hướng trước, buộc đổi vị trí.
- Địch tầm xa buộc tiếp cận.
- Địch cơ động/bay buộc chú ý không gian.

Không làm cả bốn ngay. Chọn hai vai trò tạo khác biệt lớn nhất với quái hiện có.
Địch không chỉ khác lượng máu và sát thương.
Mỗi loại cần dấu báo đòn, điểm yếu và khoảng hồi rõ.
Thiết kế nhóm 2–3 địch có chủ đích; tránh đòn ngoài màn hình và khóa người chơi liên tục.

6. VŨ KHÍ
- Giữ Dao Giữ Chuông làm bộ chính.
- Đề xuất Búa Chuông Nứt làm vũ khí thứ hai: chậm, nặng, phá thế thủ.
- Đừng chỉ thay hình và thông số.
- Mỗi vũ khí cần có ưu/nhược, nhịp đánh, khả năng di chuyển khi đánh và tương tác với Vọng.
- Chưa làm sáu vũ khí.
- Phải tính chi phí animation cutout, VFX và kiểm thử.

7. ÂM PHÙ VÀ NÂNG CẤP
Demo chỉ thử 3 Âm Phù, tối đa 2 ô trang bị:
- Dư Chấn: Cộng hưởng tạo sóng nhỏ.
- Tàn Ảnh: né sát đòn hỗ trợ hồi năng lượng Vọng.
- Chuông Nặng: đổi một phần tốc độ lấy sức phá thế thủ.

Đây là ý tưởng, được quyền thay hoặc loại nếu trùng hệ thống.
Không để vật phẩm bắt buộc mới làm được cơ chế cơ bản.
Tách nâng cấp vĩnh viễn, lựa chọn trang bị và phần thưởng khám phá.
Tránh random rarity, hàng chục chỉ số, đồ rác, nâng cấp gây farm lặp lại.
Nêu luật cộng dồn, tương tác với bóng và chống vòng lặp hồi tài nguyên.

8. KHÁM PHÁ VÀ PHẦN THƯỞNG
- Một lối tắt mở từ phía trong.
- Một nhánh tinh anh thưởng đồ cố định.
- Một vách nứt được báo trước, dùng năng lực phù hợp để mở.
- Một thử thách chuông cổ tự nguyện, cho biết tính chất phần thưởng.
- Không khóa đường chính bằng pogo khó hoặc chuỗi nhiều nút đồng thời.
- Mỗi bí mật cần dấu hiệu hợp thế giới; không bắt người chơi chém mọi vách.
- Phân biệt cổng khóa bằng năng lực, chìa khóa và câu đố để tránh mở rộng rối.

9. BOSS VÀ TIẾN TRIỂN SỨC MẠNH
- Giữ boss hiện tại nếu sửa được.
- Pha 1 kiểm tra đánh–né; pha 2 kiểm tra phối hợp Vọng và kéo xích.
- Tránh kéo xích lặp lại quá nhiều lần hoặc phải ghi lại chuỗi dài sau mỗi lỗi.
- Điểm hồi sinh gần boss.
- Có cơ hội dùng nâng cấp mới sau boss trước khi demo kết thúc.
- Không dùng tăng máu đơn thuần để kéo dài trận.

PHẠM VI TRIỂN KHAI
Đề xuất một đợt P0 nhỏ có thể kiểm chứng:
- Một phòng thử chiến đấu.
- Quái hiện có + một vai trò địch mới.
- Một tinh anh.
- Một nâng cấp.
- Một cải thiện Tiếng Vọng được chọn.
- Không thêm vùng, online, NG+, cây skill lớn hoặc hệ thống loot phức tạp trong đợt này.

YÊU CẦU KỸ THUẬT
- Giữ gameplay theo fixed timestep hiện tại sau khi xác minh.
- Cửa sổ chiến đấu tính theo thời gian/tick mô phỏng, không phụ thuộc FPS render.
- Kiểm tra tương tác với hitstop, pause, tốc độ chơi, va chạm và replay.
- Không làm hitstop nhân lên khi Lam và bóng cùng trúng.
- Không để một hitbox đánh cùng mục tiêu nhiều lần ngoài ý muốn.
- Thông số tập trung trong cấu hình để dễ cân bằng.
- Giữ hitbox độc lập ảnh động và tỷ lệ hiển thị.
- Kiểm tra cảm ứng trên thiết bị thật trước khi khẳng định trải nghiệm hoặc hiệu năng đạt.
- Không tự thiết kế lại toàn bộ mỹ thuật hay viết lại engine.

ĐẦU RA TÔI CẦN DUYỆT
A. Những gì đã xác minh từ code, có file/hàm; những gì chỉ là giả định.
B. Ba vấn đề hiện tại ảnh hưởng cảm giác đánh lớn nhất.
C. Bảng đề xuất: giữ / sửa / thêm / hoãn; lợi ích, công sức, rủi ro.
D. Đợt P0 chọn tối đa 3 thay đổi gameplay, nói rõ vì sao chọn.
E. Sơ đồ một phòng thử và chuỗi trải nghiệm 5–10 phút.
F. Thông số ban đầu để thử, không gọi là đã cân bằng.
G. Danh sách asset có thể tái sử dụng và asset thực sự thiếu.
H. Tiêu chí kiểm thử: dễ hiểu, đánh có lực, lựa chọn có ý nghĩa, thao tác cảm ứng ổn, không phá replay.
I. Kế hoạch P1 sau khi P0 được duyệt.

Không chỉ liệt kê tính năng. Hãy phản biện những hệ thống trùng nhau và cắt bớt nếu cần. Mục tiêu là chiến đấu sâu hơn, có động lực săn đồ và khám phá, không phải nhiều nút hay nhiều menu hơn.

Chỉ gửi kế hoạch để tôi duyệt; chưa sửa code, chưa publish.