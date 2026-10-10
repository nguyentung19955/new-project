LINH KHÍ (SPIRITBLADE) — BẢN GÓP Ý THIẾT KẾ, HÌNH ẢNH, VẬN HÀNH VÀ GAMEPLAY
Dành cho Claude đọc/audit dự án và đề xuất cải tiến

============================================================
0. PHẠM VI VÀ CÁCH DÙNG TÀI LIỆU
============================================================

Mục tiêu không phải viết lại game hoặc thêm nhiều tính năng mới. Mục tiêu là tìm những điểm đang làm LINH KHÍ kém đẹp, khó điều khiển, khó hiểu, dễ nhàm hoặc khó chạy ổn định trên điện thoại; sau đó ưu tiên các chỉnh sửa tạo hiệu quả lớn với ít công sức.

Bối cảnh theo tài liệu thiết kế:
- Game action RPG pixel art góc nhìn từ trên xuống chéo, HTML5, ưu tiên điện thoại nằm ngang.
- Vòng lặp: làng -> ải gồm 8 phòng -> trùm -> phần thưởng -> nâng cấp -> ải khó hơn.
- Có 3 vùng, 15 ải, 4 nhân vật, 4 nhóm vũ khí (kiếm/cung/giáo/búa), 3 hệ (Lửa/Độc/Băng), trang phục, bùa, cây kỹ năng, linh khí, kinh tế và bảng xếp hạng.
- Đồ họa được vẽ bằng code, lớp thế giới 480x270 và lớp UI theo độ phân giải màn hình.
- Chơi qua https://spiritblade.web.app

LƯU Ý VỀ ĐỘ CHẮC CHẮN:
Bản góp ý này dựa trên tài liệu mô tả, không phải kết luận rằng mọi lỗi dưới đây chắc chắn đã xảy ra trong bản đang chạy. Việc truy cập web không cung cấp đủ nội dung canvas để đánh giá từng pixel; chưa có 3 ảnh chụp 960x540 đính kèm để đánh dấu vị trí lỗi cụ thể. Claude cần kiểm tra mã nguồn và game thực tế, đánh dấu mỗi mục là: (A) đã xác nhận, (B) có nguy cơ/cần test, hoặc (C) không áp dụng. Không sửa những gì chưa kiểm chứng nếu sửa có thể làm hỏng gameplay hiện hữu.

NGUYÊN TẮC LÀM VIỆC:
1. Audit trước, sửa sau. Tìm đúng hệ thống và luồng đang dùng trong code; không suy diễn từ tên file.
2. Bảo toàn lối chơi cốt lõi và phong cách pixel art/dân gian Việt; không chuyển sang hình 3D hoặc thay thể loại.
3. Ưu tiên thay đổi nhỏ, có thể kiểm thử, dễ hoàn tác. Không tái cấu trúc lớn chỉ để làm đẹp code.
4. Không thêm hệ thống mới trước khi kiểm tra hệ thống hiện có có thực sự tạo ra quyết định thú vị không.
5. Với mỗi thay đổi, ghi rõ: vấn đề, nguyên nhân xác nhận, cách sửa, rủi ro hồi quy, cách kiểm thử.
6. Trước khi kết luận cần thêm tính năng, hãy thử xem tinh chỉnh bố cục, thông số, phản hồi hình ảnh hoặc hướng dẫn có giải quyết vấn đề không.

============================================================
1. TÓM TẮT ĐÁNH GIÁ
============================================================

Điểm mạnh nên giữ:
- Ý tưởng “Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn.” có thể trở thành bản sắc riêng.
- Bối cảnh làng Việt và các chất liệu dân gian có tiềm năng tạo khác biệt so với các game pixel fantasy chung chung.
- Bốn loại vũ khí có hướng chơi cơ bản khác nhau; ba hệ có khả năng kết hợp tạo hiệu ứng.
- Thiết kế đã nghĩ tới hit-stop, telegraph, né, hoạt ảnh trúng đòn, hiệu ứng theo hệ và chạy trên điện thoại.

Rủi ro lớn nhất:
1. Có thể đang đầu tư nhiều vào số lượng hệ thống/hiệu ứng hơn độ rõ và độ đã tay của một trận chiến.
2. HUD có nguy cơ quá dày trên điện thoại, khiến người chơi phải vừa đọc UI vừa tránh đòn.
3. Vòng lặp 8 phòng dọn sạch quái rồi về làng có thể lặp lại nhanh nếu các phòng chỉ khác bố cục và danh sách quái.
4. Tiến triển có nhiều lớp tăng sức mạnh chồng lên nhau, có nguy cơ biến game thành việc cày chỉ số thay vì tạo build khác nhau.
5. “Trùm học theo người chơi” có nguy cơ tạo cảm giác bị phạt vì chơi tốt nếu cơ chế thích nghi không rõ và công bằng.
6. Các thông số đánh đang có khả năng chưa được định nghĩa cùng một cách: thời lượng combo, hồi đòn, sát thương, phạm vi, khống chế và độ an toàn sau đòn cần được đo bằng gameplay thực tế.
7. Đồ họa vẽ bằng code dễ trông như hình học đơn giản nếu thiếu quy tắc nhất quán về silhouette, pixel cluster, độ sáng, bóng và chi tiết chất liệu.

Kết luận ưu tiên: trước tiên nâng chất lượng một lát cắt chiến đấu nhỏ; tiếp theo làm rõ hình ảnh/HUD trên điện thoại; sau đó chỉnh vòng lặp phòng, phần thưởng và tiến triển. Chưa cần thêm quái, vũ khí hoặc cây kỹ năng mới.

============================================================
2. HÌNH ẢNH VÀ NGÔN NGỮ PIXEL ART
============================================================

2.1. Silhouette nhân vật và quái có thể chưa đủ nhận diện
Vấn đề/nguy cơ:
- Nhân vật cao khoảng 33 px và được ghép từ nhiều lớp. Quái được dựng từ hình cơ bản. Nếu các nhân vật khác nhau chủ yếu bằng màu hoặc phụ kiện nhỏ, khi thu nhỏ trên điện thoại chúng sẽ lẫn nhau.
- Viền nhân vật #1b1118 và viền quái #14182e khá gần nhau; nếu nền cũng tối, hình thể có thể dính vào nền.

Cách kiểm tra/sửa:
- Tạo ảnh kiểm thử toàn bộ nhân vật/quái ở kích thước thực tế và ở mức thu nhỏ 50%. Nếu không thể nhận diện bằng bóng dáng, chỉnh silhouette trước khi thêm pixel chi tiết.
- Tạo dáng khác biệt: Thợ Rèn vuông/nặng; Thợ Săn mảnh và hướng về phía trước; Thầy Lang dễ nhận bằng dụng cụ/đồ nghề; Đô Vật thấp, rộng và chắc.
- Nhắm tới đường viền ngoài chủ yếu 1 pixel ở kích thước logic. Chỉ dùng viền dày hơn ở các chi tiết cần nhấn mạnh.
- Dùng bảng màu có giới hạn cho mỗi nhân vật; tránh mỗi lớp tự thêm quá nhiều màu gần giống nhau.
- Mỗi quái cần một dấu hiệu nhận diện chính dễ đọc từ xa: hình đầu, sừng, mặt nạ, vỏ, vũ khí hoặc chuyển động đặc trưng.

2.2. Độ tương phản nhân vật – nền chưa có quy tắc đo được
Vấn đề/nguy cơ:
- Rừng già, Hang biển và Lâu đài cổ đều dùng nền trầm. Khi thêm bóng, góc tối, viền tối và nhiều hiệu ứng, nhân vật/quái có thể chìm.
- Vùng báo đòn màu đỏ và hiệu ứng Lửa cam đỏ có thể lẫn nhau.

Cách kiểm tra/sửa:
- Với mỗi vùng, định nghĩa rõ ba tầng độ sáng: nền xa/tối; sàn và vật thể trung gian; nhân vật/quái/đòn đánh nổi bật.
- Test trên điện thoại ở độ sáng màn hình khoảng 30–40%, không chỉ trên màn hình máy tính sáng.
- Không tăng sáng toàn bộ cảnh. Tăng độ đọc của mặt nhân vật, vũ khí, chân quái và vùng tương tác.
- Nếu vùng báo nguy hiểm bị lẫn với lửa, thử màu báo nguy hiểm #FF657A hoặc #FF647C; giữ Lửa gameplay ở #FF7A2A và điểm sáng #FFD23F. Đây là đề xuất cần test với nền thực tế, không phải thay màu mù quáng.
- Đảm bảo trạng thái nguy hiểm phân biệt được cả bằng hình dáng/nhịp nhấp nháy, không chỉ dựa vào màu (hỗ trợ người khó phân biệt màu).

2.3. Sàn, tường và đồ trang trí có nguy cơ trông trống hoặc nhiễu
Vấn đề/nguy cơ:
- Tô màu phẳng và rải chi tiết ngẫu nhiên có thể khiến phòng giống bản đồ thử nghiệm; quá nhiều chi tiết cũng khiến nền tranh chấp sự chú ý với quái.

Cách kiểm tra/sửa:
- Mỗi vùng nên có bộ tile rõ ràng: sàn cơ bản, cạnh tường/góc, vết nứt/rêu/cát, vật trang trí và bóng chân.
- Dùng cụm pixel 8x8 hoặc 16x16 làm chi tiết phụ, nhưng đặt theo bố cục chứ không rải nhiễu đều khắp nền.
- Giữ khoảng trống quanh vị trí quái/nhân vật chiến đấu; tránh đặt hoa, cỏ sáng, đá nhỏ ngay dưới vùng báo đòn.
- Đảm bảo vật thể có bóng hoặc chân đế nhất quán để không có cảm giác “dán lên sàn”.
- Thêm ba biến thể sàn có kiểm soát cho mỗi vùng tốt hơn hàng trăm biến thể ngẫu nhiên không có chủ đích.

2.4. Pixel art có thể mất chất nếu mọi thứ dùng cùng một kiểu viền/khối màu
Cách kiểm tra/sửa:
- Chốt một style guide dùng chung: kích thước pixel logic, độ dày viền, hướng sáng trên-phải, số mức sáng cho vật liệu, bóng đổ, mức chi tiết ở sprite nhỏ.
- Vật liệu phải khác nhau bằng cụm pixel: gỗ có vân/đường thớ; đá có mặt phẳng và vết nứt; vải có nếp; kim loại có highlight sắc; sinh vật có cấu trúc hữu cơ. Không chỉ đổi màu trên cùng một hình tròn/đa giác.
- Mắt vũ khí sống nên là chi tiết nhận diện, không bị hiệu ứng hoặc số sát thương che mất.
- Không phóng to sprite bằng lọc mịn; kiểm tra mọi phép scale và tọa độ vẽ có được làm tròn về pixel logic phù hợp.

2.5. Hiệu ứng chiến đấu có nguy cơ quá dày
Vấn đề/nguy cơ:
- Cùng lúc có afterimage, vệt vũ khí, chớp trắng, hit-stop, rung, số sát thương, hạt, vòng phép, hiệu ứng hệ và đồ rơi. Nếu mọi thứ đều mạnh, đòn đánh thường cũng trông như chiêu cuối và người chơi khó thấy đạn/quái.

Cách kiểm tra/sửa:
- Tách hiệu ứng thành các mức: đánh thường < đòn nặng/chí mạng < chưởng < chưởng tích lực.
- Thử dải thông số ban đầu: vệt đòn thường 3–5 frame; vệt đòn kết thúc combo 5–8 frame; rung đánh thường 1–2 px; chưởng lớn tối đa khoảng 3–4 px trong 80–120 ms; hit flash mạnh 1–2 frame rồi giảm.
- Số hạt khởi điểm để thử: quái thường 6–12, tinh anh 12–24, trùm 20–40 hạt mỗi đợt. Tránh mỗi mục tiêu đều phát hàng chục hạt cùng lúc khi có nổ dây chuyền.
- Giữ giới hạn hạt 400 nhưng cần kiểm tra tình huống xấu nhất: nhiều quái độc/nổ/băng, loot rơi và chưởng cùng lúc. Có thể giảm hiệu ứng trang trí trước khi giảm phản hồi gameplay.
- Vùng báo đòn và đạn của quái phải luôn nổi bật hơn số sát thương/đồ rơi.
- Có tùy chọn giảm rung, giảm hạt và giảm chớp sáng; không tắt những tín hiệu thiết yếu báo người chơi đã trúng đòn.

2.6. Thiếu nhạc nền có thể làm giảm không khí
Vấn đề/nguy cơ:
- Hiệu ứng Web Audio tự tổng hợp giúp không cần tài nguyên âm thanh, nhưng nếu tất cả âm thanh cùng chất tổng hợp, game có thể nghe giống prototype.

Cách làm ít tốn công:
- Chưa cần sản xuất nhạc dài. Có thể thử một lớp ambience nhẹ cho làng và mỗi vùng, cùng một vòng nhạc chiến đấu đơn giản.
- Ưu tiên chất lượng/độ khác nhau của âm thanh chém, va vào khiên, trúng quái, nhặt đồ, nâng cấp và mở trùm.
- Âm thanh trúng đòn nên ăn khớp đúng frame va chạm; không phát âm thanh mạnh khi đòn đánh hụt.
- Có chỉnh âm lượng SFX/nhạc và lưu lựa chọn cài đặt.

============================================================
3. CHIẾN ĐẤU, CHUYỂN ĐỘNG VÀ GAME FEEL
============================================================

3.1. Cần đo “cảm giác đánh”, không chỉ đếm số hiệu ứng
Vấn đề/nguy cơ:
- Mô tả đã có lấy đà, vung, giữ khung trúng, thu đòn, hit-stop 45–115 ms và rung màn hình. Tuy nhiên, nếu đầu vào trễ, hoạt ảnh không khớp hitbox, hoặc mục tiêu không phản ứng khác nhau theo loại đòn, đánh vẫn thiếu lực.

Cách kiểm tra/sửa:
- Đo thời gian từ lúc nhận input đến lúc sprite bắt đầu phản hồi; test dải khoảng 70–120 ms cho đòn thường như một mốc thử, không bắt buộc cho mọi vũ khí.
- Kiểm tra thời điểm hitbox hoạt động trùng với hình ảnh lưỡi kiếm/đầu búa, không gây sát thương trước hoặc sau hình ảnh quá rõ.
- Thử các phản ứng mục tiêu khác nhau: quái nhỏ giật lùi; quái nặng chống đẩy lùi nhưng vẫn có flash/âm thanh; quái bị choáng có tín hiệu rõ; khiên phản hồi khác khi đánh vào mặt trước và mặt sau.
- Hit-stop không được làm mất input người chơi. Dùng input buffer hợp lý để nút Né/Đánh bấm trong lúc khựng vẫn có thể được xử lý sau đó.
- Đòn đánh hụt không nên phát cùng phản hồi như đòn trúng.

3.2. Thông số thời gian vũ khí có thể chưa thống nhất
Thông số hiện tại:
- Kiếm: 9 sát thương, hồi đòn 0,36 giây; chuỗi 3 nhát mô tả 0,30 + 0,30 + 0,46 giây.
- Cung: 11,4 sát thương, 0,5 giây.
- Giáo: 10,7 sát thương, 0,44 giây.
- Búa: 21,3 sát thương, 0,8 giây.

Điểm cần audit:
- “Hồi đòn” là thời gian từ lúc bấm tới lần tấn công tiếp theo, thời gian animation, hay cooldown sau mỗi hit? Combo kiếm có tổng 1,06 giây, nên cần làm rõ cách 0,36 giây hoạt động cùng chuỗi combo.
- Nếu lấy sát thương chia khoảng cách giữa hai đòn như một ước lượng rất thô, DPS cơ bản lần lượt xấp xỉ: kiếm 25, cung 22,8, giáo 24,3, búa 26,6 sát thương/giây. Con số này chưa tính độ chính xác, tầm đánh, số mục tiêu trúng, xuyên, choáng và thời gian né. Nó gợi ý phải đo DPS thực tế chứ không kết luận vũ khí đã cân bằng.
- Cần kiểm tra tầm đánh, hitbox, khả năng đánh nhiều mục tiêu, thời gian hồi và rủi ro đứng gần quái. Vũ khí có DPS tương tự vẫn có thể khác nhau nếu cơ chế khác biệt đủ rõ.

Đầu ra cần có:
- Bảng test DPS thực tế trên một mục tiêu đứng yên và một nhóm quái, trong cửa sổ 10–20 giây.
- Số đòn trung bình để hạ từng quái ở cấp tương đương.
- Thời gian nhân vật bị khóa trong mỗi combo và số cơ hội hủy đòn bằng né.
- Không chỉnh chỉ số dựa trên cảm giác riêng lẻ trước khi xác nhận định nghĩa cooldown.

3.3. Né cần công bằng, rõ ràng và có lợi ích chiến thuật
Thông số đề xuất để kiểm thử:
- Cửa sổ bất tử khởi điểm 180–240 ms tùy tổng thời lượng lăn.
- Sau né, nếu kiếm có “nhát lướt”, thử cửa sổ kích hoạt 250–400 ms; điều chỉnh sau khi test cảm giác.
- Kiểm tra người chơi có thể né ra khỏi đòn đã báo trước, hay vẫn bị trúng do vùng sát thương/hitbox tồn tại quá lâu.
- Tín hiệu bất tử nên nhất quán, ví dụ afterimage/nháy ngắn; không tạo cảm giác đã né thành công nhưng vẫn mất máu.
- Né không nên tự xoay nhân vật và lao ngược về phía quái chỉ vì hệ tự ngắm đổi mục tiêu.

3.4. Tự ngắm theo mục tiêu gần nhất có thể đánh sai ý định
Vấn đề/nguy cơ:
- Quái gần nhất không nhất thiết là mục tiêu người chơi định đánh. Khi né khỏi trùm mà có một quái nhỏ gần hơn phía sau, tự ngắm có thể làm nhân vật quay lại nguy hiểm.

Cách sửa cần thử:
- Ưu tiên hướng ngắm/di chuyển gần nhất và mục tiêu trong một góc hợp lý; đừng khóa cứng mục tiêu gần nhất mọi lúc.
- Nếu không có mục tiêu trong hướng ưu tiên, vẫn cho phép đánh theo hướng nhân vật đang quay mặt.
- Cung/giáo cần ưu tiên mục tiêu theo hướng bắn; không tự chọn mục tiêu ngoài hướng khiến đạn bay khó đoán.
- Kiểm thử bằng thao tác ngón cái trên điện thoại, không chỉ bàn phím.

3.5. Phối hợp nhiều nút và hủy hoạt ảnh cần đáng tin
- Kiểm tra hold-to-attack/charge: giữ nút, nhả nút, đổi vũ khí, né hoặc bị đánh trong lúc tích lực phải có trạng thái rõ ràng.
- Xác định hành động nào có thể hủy bằng Né, hành động nào không; không khóa nhân vật lâu một cách vô tình.
- Test bấm đồng thời di chuyển + đánh + né + kỹ năng, đặc biệt trên cảm ứng. Không được nhận một touch rồi vô tình bỏ các touch khác.
- Nếu đổi vũ khí giữa combo, xử lý nhất quán: cho phép và reset combo, hoặc cấm trong một cửa sổ ngắn có phản hồi. Tránh lỗi hoạt ảnh dùng vũ khí cũ nhưng sát thương của vũ khí mới.

3.6. Telegraph của quái phải dự đoán được
- Quái xạ thủ ngắm 0,7 giây rồi bắn mỗi 3 giây: cần kiểm tra dấu hiệu ngắm, hướng mũi tên và frame gây sát thương có nhất quán.
- Vùng đỏ “đầy từ gốc ra, sáng lên, có mũi hướng, chớp rồi tan” không nên quá nhỏ hoặc bị che bởi bụi, số sát thương và nền.
- Khi nhiều quái báo đòn đồng thời, cho tín hiệu ưu tiên rõ; không dùng quá nhiều màu/hiệu ứng giống nhau.
- Đòn diện rộng cần cho đủ thời gian phản ứng với tốc độ nhân vật thực tế. Tránh chỉ xem thời gian báo đòn trên code mà không đo thời gian cần để chạy ra ngoài vùng.
- Kiểm tra hướng và hitbox trong cả 8 hướng, đặc biệt góc chéo.

3.7. “Trùm học theo bạn” phải thích nghi nhưng không gian lận
Rủi ro:
- Counter người chơi quá mạnh hoặc thay đổi không có dấu hiệu sẽ khiến người chơi cảm thấy trò chơi phạt cách chơi của họ.
- Nếu cơ chế chỉ tăng máu/sát thương, người chơi không cảm nhận đó là AI học theo.

Cách triển khai an toàn:
- Bắt đầu từ một số thống kê dễ hiểu: tỷ lệ sát thương cận chiến/đánh xa, hệ sử dụng nhiều nhất, tần suất né, thời gian đứng xa trùm.
- Chỉ chọn một số biến thể hành vi có telegraph rõ; không thay đổi đột ngột giữa đòn đánh.
- Không vô hiệu hóa hoàn toàn một build/hệ. Hãy tạo thêm thử thách và cơ hội phản công chứ không bắt buộc người chơi đổi lối chơi.
- Trước/ sau trận, cho lời gợi ý có ích và cụ thể từ Cụ Đồ để giải thích sự thích nghi.
- Kiểm thử cả người chơi dùng build đa dạng, không chỉ người chơi chuyên một hệ.

============================================================
4. GAMEPLAY, THIẾT KẾ PHÒNG VÀ LÝ DO CHƠI TIẾP
============================================================

4.1. Vòng lặp phòng có nguy cơ đơn điệu
Vòng hiện tại: vào phòng -> cửa đóng -> đánh đến hết quái -> mở cửa -> lặp lại.
Vấn đề: nếu tám phòng phần lớn cùng một mục tiêu, việc có ba bố cục ngẫu nhiên chưa đủ tạo ra trải nghiệm khác nhau.

Cách sửa ít tốn tài nguyên:
- Giữ đa số phòng chiến đấu nhưng thêm 1 phòng có quyết định hoặc mục tiêu khác mỗi lượt: sống sót trong 30 giây, phá tổ ong, kích hoạt trụ, bảo vệ vật thể, chọn đường an toàn/đường nguy hiểm, đánh tinh anh đổi thưởng.
- Dùng biến thể đội hình, địa hình và mục tiêu; không chỉ đổi vị trí spawn.
- Cho phòng có chức năng dễ hiểu và phần thưởng phù hợp. Đừng thêm cơ chế chỉ để tăng độ phức tạp.
- Phòng Suối hồi cần tạo quyết định: dùng ngay, bỏ qua để giữ tài nguyên, hay đổi hồi phục lấy phần thưởng khác (nếu phù hợp với thiết kế hiện tại).

4.2. Sinh phòng ngẫu nhiên cần có kiểm tra chất lượng
- Xác nhận mọi layout có đường đi liên thông, không có cửa bị kẹt, lối quá hẹp hoặc điểm spawn không thể tiếp cận.
- Quái không được spawn chồng lên người chơi, cửa, vật cản hoặc vùng báo đòn khiến không có đường né.
- Đặt giới hạn số quái/đạn/hiệu ứng cùng lúc cho điện thoại cấu hình thấp.
- Nếu có biến thể phòng “sảnh giữa + 3 cánh giữ 3 mảnh chìa”, cần kiểm tra thứ tự chìa/cánh và trạng thái cửa khi chết, thoát game hoặc tải lại.
- Tạo kiểm thử tự động hoặc log để phát hiện layout bất khả thi nếu kiến trúc hiện tại cho phép.

4.3. Phải tạo khác biệt thật giữa các lượt chơi
- Mỗi lượt nên có một lựa chọn build hoặc rủi ro đáng nhớ, không chỉ khác nhau ở lượng vàng/EXP.
- Các hệ nên tương tác dễ hiểu: ví dụ Độc kết hợp Lửa tạo phản ứng nhìn rõ; Băng tạo cơ hội cho đòn búa; hệ phản ứng không nên chỉ cộng thêm một vụ nổ giống nhau.
- Hiệu ứng phản ứng cần tên/icon ngắn lần đầu xảy ra và có mục lục tra cứu ở làng.
- Bảo đảm người chơi có thể hiểu tại sao phản ứng xảy ra. Không dựa hoàn toàn vào VFX ngẫu nhiên.

4.4. Quái cần khác vai trò, không chỉ khác skin
- 36 quái là số lượng tốt, nhưng số lượng không tự đảm bảo đa dạng. Mỗi loại cần một câu hỏi chiến thuật: né gì, xử lý trước ai, tấn công từ hướng nào, có thể tận dụng thế nào.
- Bầy ong/bầy cá cần có cảnh báo khi tấn công theo nhóm; xạ thủ phải buộc người chơi đổi vị trí; khiên phải tạo quyết định đổi hướng; quái cảm tử cần có cửa sổ xử lý; quái gai cần báo rõ phản đòn.
- Kết hợp đội hình có chủ đích. Tránh ghép nhiều quái tầm xa và bom khiến không còn khoảng né.
- Tinh anh có các thuộc tính Nhanh/Bọc giáp/Nổ/Hút máu nhưng cần biểu tượng hoặc dấu hiệu hình ảnh khác nhau; không chỉ đổi số chỉ số mà người chơi không thấy.
- Không tạo phòng khó bằng cách tăng số quái vô hạn; tăng chất lượng tổ hợp và nhịp đợt đánh.

4.5. Nhịp độ và độ khó
- Đo thời gian trung bình hoàn thành mỗi phòng, thời gian đứng không làm gì, thời gian chờ cửa, thời gian đi qua các hành lang.
- Nếu phòng thường kéo dài nhưng ít quyết định, giảm số đợt hoặc tăng mục tiêu rõ ràng.
- Trùm vùng cần có nhịp: giới thiệu đòn -> người chơi học -> biến thể/phối hợp đòn -> cửa sổ phản công; tránh chỉ tăng HP.
- Thua quay về làng và không mất đồ giúp trải nghiệm dễ chịu, nhưng cần đảm bảo thất bại vẫn dạy được điều gì: gợi ý dựa trên nguyên nhân thật (bị trúng nhiều đòn diện rộng, thiếu sát thương, kháng hệ thấp), không đưa khuyến nghị chung chung “hãy cày thêm”.
- Phần thưởng sau trận cần tạo một quyết định: chọn một trong vài phần thưởng, chọn hướng phát triển, hoặc thay đổi trang bị; không chỉ nhận danh sách vật phẩm rồi đóng bảng.

============================================================
5. TIẾN TRIỂN, CÂN BẰNG VÀ KINH TẾ
============================================================

5.1. Có quá nhiều lớp tăng sức mạnh chồng lên nhau
Cấp nhân vật + cây kỹ năng + mài + bậc đồ + nâng lò + linh khí + trang phục + bùa đều có thể làm nhân vật mạnh hơn.
Rủi ro: khó cân bằng độ khó; người chơi không biết nâng gì; nếu thiếu một nguyên liệu ở một hệ thống, có thể cảm thấy bị chặn; cuối cùng chỉ số thắng cách chơi.

Cách làm:
- Gán vai trò khác nhau cho hệ thống: cấp = tăng trưởng nền; skill tree = lựa chọn phong cách; vũ khí = cách tấn công; linh khí = hướng hệ/tiến hóa; trang phục/bùa = hiệu ứng build; lò rèn = đầu tư lâu dài.
- Nếu hai hệ thống cùng chỉ tăng sát thương/máu mà không tạo lựa chọn, cân nhắc gộp hoặc giảm độ phức tạp.
- Chỉ hiện nâng cấp mới khi người chơi có đủ bối cảnh; tránh tung toàn bộ các menu vào 5 phút đầu.
- Hiển thị chi phí, chỉ số trước/sau và hiệu ứng dòng phụ trước khi xác nhận nâng cấp.

5.2. Công thức cấp nhân vật cần xác định rõ
Mỗi cấp +1,5% sát thương và +3,5% máu đến cấp 40. Nếu cộng dồn nhân theo tỷ lệ trong 39 lần tăng, hệ số xấp xỉ 1,79 lần sát thương và 3,86 lần máu. Nếu cộng tuyến tính theo chỉ số gốc, kết quả sẽ khác.

Cần audit:
- Xác định công thức thực tế là cộng dồn hay cộng tuyến tính.
- Đo sức mạnh tại cấp 1, 10, 20, 30, 40.
- Test số đòn để hạ quái, số lần bị đánh có thể chịu, thời gian hoàn thành phòng và trùm.
- Đảm bảo cơ chế né/hệ/phản ứng còn quan trọng ở cấp cao; không để máu tăng quá nhanh khiến trùm trở thành cuộc chiến kéo dài.

5.3. Cây kỹ năng 3 nhánh x 5 nút và 1 điểm mỗi cấp có thể làm mất giá trị lựa chọn
Nếu có 15 nút nhưng mỗi cấp nhận 1 điểm từ các cấp đầu, người chơi có thể mở hết cây quá sớm ở khoảng cấp 15–16; từ đó các điểm sau không còn hữu ích, trừ khi nút có nhiều cấp hoặc có điều kiện khác.

Cần xác minh:
- Mỗi nút chỉ mua một lần hay có nhiều rank?
- Có điều kiện mở, giới hạn điểm, reset hoặc lựa chọn đánh đổi không?
- Cây có tạo ra build khác nhau hay người chơi cuối cùng đều lấy tất cả?

Hướng đề xuất:
- Biến cây thành lựa chọn có đánh đổi hoặc node có nhiều cấp, nhưng không làm phức tạp thêm nếu hệ hiện tại đủ dùng.
- Nếu muốn người chơi dần hoàn thiện mọi nhánh, hãy tạo nhiều rank và lộ trình dài hợp lý; đừng phát điểm khiến dư điểm lâu dài.
- Hiện rõ tác động gameplay thay vì chỉ +x%.

5.4. Linh khí 30/120/300 dấu ấn có nguy cơ grind quá dài
Cần xác định:
- Dấu ấn được tính theo vũ khí, theo loại vũ khí, theo nhân vật hay theo tài khoản?
- Kết liễu quái đang bị hiệu ứng có xảy ra đủ thường xuyên trong lối chơi tự nhiên không?
- Người chơi có bị khuyến khích cố tình kéo dài combat để “farm dấu ấn” thay vì đánh hiệu quả không?
- Thời gian trung bình để đạt mỗi mốc là bao lâu?

Gợi ý:
- Cho phản hồi nhỏ, dễ thấy trong quá trình tiến hóa, không đợi đến 30/120/300 mới có cảm giác tiến triển.
- Mỗi mốc lớn nên thay đổi gameplay hoặc hình dáng/hoạt ảnh vũ khí, không chỉ cộng sát thương.
- Cho biết tiến trình hiện tại và khoảng cách đến mốc tiếp theo ngay ở màn kết quả/ô vũ khí.
- Tránh bắt người chơi dùng một hệ nhất định trong quá lâu nếu muốn thử vũ khí khác; có thể có phần thưởng nhỏ cho trải nghiệm đa dạng.

5.5. Bốn nhân vật cần cân bằng theo hiệu quả thực tế
Thông số nền có chênh lệch lớn: Đô Vật 140 máu và giảm 25% sát thương; Thợ Săn 75 máu nhưng nhanh hơn và gây thêm sát thương lên mục tiêu bị khống chế. Lợi ích thực tế phụ thuộc vào AI, tần suất khống chế và khả năng tránh đòn.

Cần đo:
- Thời gian sống sót trong cùng một phòng và cùng cấp.
- DPS thực tế, thời gian dọn phòng, lượng mana dùng được.
- Tỷ lệ thành công với người chơi mới và người chơi thành thạo.
- Nội tại có kích hoạt đủ thường xuyên không? Nếu điều kiện quá hiếm, nhân vật sẽ yếu; nếu quá dễ, nhân vật có thể vượt trội.

Không cân bằng chỉ bằng cách làm mọi nhân vật có chỉ số gần nhau. Mục tiêu là mỗi nhân vật có ưu/nhược điểm mà người chơi cảm nhận được.

5.6. Độ hiếm và loot
- Nếu trùm vùng lần đầu luôn rơi vũ khí Vàng, hãy đảm bảo đây là khoảnh khắc đặc biệt; đồ Vàng không nên trở thành phần thưởng quá thường xuyên ở giai đoạn sau nếu làm giảm động lực nhận đồ.
- Đồ Vàng có dòng mạnh riêng cần được so sánh bằng hiệu ứng, không chỉ điểm Sức mạnh.
- Khi rơi đồ, cho biết ngay món mới có tốt hơn món đang dùng không, nhưng tránh đánh giá chỉ bằng một con số nếu hai món phục vụ build khác nhau.
- Tránh tràn túi/loot lặp khiến người chơi dành nhiều thời gian quản lý đồ hơn chiến đấu.

5.7. Sức mạnh và bảng vàng
- Nếu bảng vàng chỉ xếp theo chỉ số cày được, nó đo mức đầu tư thời gian nhiều hơn kỹ năng.
- Có thể giữ bảng Sức mạnh, nhưng cân nhắc thêm thành tích theo thời gian hoàn thành/độ khó/số lần bị đánh hoặc thử thách vũ khí.
- Nếu lưu dữ liệu/xếp hạng trên cloud, kiểm tra dữ liệu người dùng có thể tự chỉnh ở client hay không. Điểm xếp hạng quan trọng nên được xác thực server-side nếu kiến trúc backend hỗ trợ; không tin hoàn toàn vào số gửi từ client.

============================================================
6. GIAO DIỆN ĐIỆN THOẠI VÀ KHẢ NĂNG SỬ DỤNG
============================================================

6.1. HUD có nguy cơ chiếm quá nhiều diện tích
Thông tin hiện có gồm thanh máu/mana, bình máu, tên vùng/sức mạnh, hướng dẫn, hai thẻ vũ khí, ba vạch linh khí, bản đồ nhỏ, cần gạt và 4–5 nút bên phải.

Cách sửa:
- Giữ luôn hiện những thứ cần trong chiến đấu: máu, mana nếu cần ra quyết định, cần gạt và nút đánh/né/kỹ năng.
- Thu gọn thông tin phụ thành icon hoặc hiện theo ngữ cảnh: hai thẻ vũ khí, linh khí, bản đồ, sức mạnh, hướng dẫn.
- Loại bỏ dải hướng dẫn cố định sau khi người chơi đã học xong; dùng hint ngắn tự ẩn.
- Tránh để số sát thương, loot và thông báo che vùng báo đòn.

Kích thước CSS pixel để bắt đầu test trên thiết bị thật, không phải yêu cầu cứng:
- Nút Đánh: khoảng 64–76 CSS px.
- Nút Né: khoảng 52–62 CSS px.
- Nút kỹ năng: khoảng 44–54 CSS px.
- Cần gạt: vùng tương tác khoảng 112–144 CSS px đường kính.
- Khoảng cách tâm các nút chính khoảng 52–60 CSS px trở lên nếu bố cục cho phép.
- Mép an toàn khoảng 16–24 CSS px cộng safe-area của thiết bị.
- Chữ phụ không nên nhỏ hơn khoảng 12–14 CSS px trên màn hình thực tế.

6.2. Cảm ứng đa điểm, xoay màn hình và resize
Kiểm tra trên điện thoại thật:
- Di chuyển + đánh cùng lúc.
- Di chuyển + né + đánh cùng lúc.
- Giữ đánh/tích lực rồi nhả.
- Chạm kỹ năng trong khi cần gạt còn giữ.
- Ngón tay rời khỏi nút/ra khỏi canvas trong lúc giữ thì trạng thái có được nhả đúng không.
- Không để một touch/pointer chặn các touch khác; kiểm tra pointer capture, touch-action và cách xử lý pointer ID nếu có.
- Khi xoay màn hình, đổi kích thước viewport, hiện/ẩn thanh trình duyệt hoặc vào fullscreen, UI và canvas không lệch tỉ lệ hoặc bị crop.
- Tính safe-area trên iPhone và vùng gần cạnh màn hình.

6.3. Pixel canvas 480x270 và scale
- 480x270 lên đúng 960x540 là scale 2x, nhưng điện thoại thực tế có nhiều kích thước và device pixel ratio khác nhau.
- Kiểm tra hình có bị mờ hoặc méo pixel khi scale lẻ; giữ image smoothing tắt cho world canvas nếu phù hợp với renderer.
- Tọa độ sprite/camera cần nhất quán với pixel logic; tránh rung camera tạo vị trí nửa pixel làm hình nhòe.
- Lớp UI có thể độ phân giải cao nhưng cần giữ nguyên độ rõ và thứ bậc với world layer.
- Kiểm tra camera, HUD, chữ và vùng bấm ở các tỷ lệ màn hình khác nhau, không chỉ 16:9.

6.4. Bảng hành trang/rèn luyện nên giảm số bước
- Khi so sánh trang bị, hiển thị hiện tại và mới cạnh nhau, các dòng phụ thay đổi, cấp/bậc và chi phí.
- Dùng một nút hành động chính cho màn hiện tại: Trang bị/Nâng cấp/Mài/Mua; không làm nhiều nút vàng cùng nổi bật.
- Gộp thông tin liên quan; không bắt người chơi đóng mở nhiều bảng chỉ để biết tài nguyên còn bao nhiêu.
- Không chỉ dùng màu đỏ/xanh để biểu thị tăng giảm; thêm dấu +/- hoặc icon vì người chơi có thể không phân biệt màu.
- Với menu dài, có phân trang/lọc theo loại và trạng thái; không nhất thiết phải thêm hiệu ứng chuyển cảnh cầu kỳ.

============================================================
7. VẬN HÀNH WEB, ĐĂNG NHẬP, LƯU DỮ LIỆU VÀ HIỆU NĂNG
============================================================

7.1. Đăng nhập Google có thể tạo rào cản trước khi người chơi thấy gameplay
Cần kiểm tra:
- Có bắt buộc đăng nhập trước khi chơi không?
- Nếu đăng nhập lỗi hoặc mất mạng, người chơi có vào được phần thử nghiệm không?
- Có trạng thái loading, lỗi, thử lại và giải thích dữ liệu sẽ lưu ở đâu không?

Đề xuất nếu phù hợp kiến trúc:
- Cho chơi thử/guest tới ít nhất một trận đầu; mời đăng nhập để đồng bộ cloud sau khi người chơi có lý do muốn lưu tiến trình.
- Không làm mất tiến trình khách khi người chơi đăng nhập Google; có cơ chế hợp nhất hoặc thông báo rõ.
- Nếu vẫn bắt buộc đăng nhập, hãy làm rõ lý do và lỗi đăng nhập có đường thử lại.

7.2. Lưu cloud và lỗi mạng
Kiểm tra thực tế:
- Trạng thái lưu thành công/thất bại có phản hồi cho người chơi không?
- Khi offline hoặc mạng yếu, game có tiếp tục chạy được không?
- Có tránh ghi đè dữ liệu mới bằng bản save cũ khi nhiều yêu cầu hoàn tất lệch thứ tự không?
- Khi đóng/refresh tab giữa lúc nâng cấp hoặc nhận thưởng, có mất/nhân đôi vật phẩm không?
- Có xử lý lỗi hết phiên đăng nhập, token hết hạn, timeout và nút thử lại không?
- Có lưu cài đặt âm thanh/điều khiển/giảm hiệu ứng không?

7.3. Hiệu năng điện thoại tầm trung
Rủi ro:
- 400 hạt là giới hạn tốt nhưng không đảm bảo FPS nếu còn nhiều draw calls, vòng lặp va chạm O(n²), tạo object liên tục hoặc tính đường AI nhiều lần mỗi frame.

Cần đo:
- FPS/frame time ở phòng nhiều quái và hiệu ứng; mục tiêu 60 FPS khi có thể, không để spike kéo dài. Nếu thiết bị yếu chỉ đạt 30 FPS, chiến đấu vẫn phải điều khiển ổn định.
- Bộ nhớ và garbage collection trong 5–10 phút chơi liên tục.
- Số quái, số đạn, số hạt và số va chạm tối đa trong tình huống căng nhất.
- Kiểm tra object pooling cho hạt/đạn nếu hiện tại tạo-hủy liên tục.
- Hạn chế hiệu ứng nền khi có nhiều hiệu ứng chiến đấu; hiệu ứng trang trí có thể giảm theo hiệu năng.
- Không chạy mô phỏng game phụ thuộc hoàn toàn vào FPS; dùng delta time có giới hạn và xử lý tab bị treo/được mở lại.

7.4. PWA, âm thanh và trình duyệt
- Xác nhận “Thêm vào màn hình chính” hoạt động đúng và không tạo trạng thái save/session khác với trình duyệt.
- Xử lý browser autoplay: âm thanh chỉ bật sau tương tác người dùng nếu cần.
- Khi tab chuyển nền, có pause hoặc xử lý hợp lý, không để người chơi nhận sát thương khi không nhìn thấy game.
- Kiểm tra Safari iOS và Chrome Android, đặc biệt âm thanh Web Audio, pointer/touch, fullscreen, safe area và xoay màn hình.
- Cho người chơi biết bản game đang tải/lưu khi có thao tác lâu; không để nút không phản hồi mà không có chỉ báo.

7.5. Analytics tối thiểu nếu có thể
Chỉ ghi dữ liệu không nhạy cảm cần cho cải thiện game: tỷ lệ hoàn thành tutorial/trận đầu, thời gian phòng, số lần chết, nút thường dùng, lỗi save, lỗi layout và FPS tổng hợp. Không cần thu thập thông tin cá nhân ngoài những gì cần cho đăng nhập/lưu tiến trình, và phải minh bạch nếu có telemetry.

============================================================
8. BẢN SẮC DÂN GIAN VIỆT NAM
============================================================

Điểm mạnh làng, cây đa, đò, dây phơi, lò rèn, đèn lồng, Cụ Đồ, anh Mõ, trống đồng, Nỏ Thần, Bút Lông, Chày Giã Gạo, Trống Đồng và Hồ Tinh. Rủi ro là các yếu tố chỉ nằm ở tên gọi/đồ trang trí nhưng không đi vào cách chơi.

Gợi ý:
- Dùng họa tiết trống đồng/chim Lạc nhất quán cho các vòng tiến hóa, biểu tượng kỹ năng và nghi thức trùm; không dán hoa văn lên mọi nút.
- Tăng hoạt động nhỏ ở làng: thợ rèn gõ búa, người chèo đò thao tác mái chèo, Cụ Đồ viết, áo phơi/sậy lay theo gió, đèn lồng dao động.
- Mỗi vật phẩm mang tên dân gian nên có một cơ chế hoặc hình dáng riêng; ví dụ Chày Giã Gạo tạo sóng trên đất còn Trống Đồng tạo cộng hưởng/nhịp lan truyền, thay vì chỉ đổi tên và màu.
- Cho NPC phản ứng với tiến trình người chơi và hành vi trùm; câu thoại sau trận cần gợi ý cụ thể chứ không chỉ kể lore.
- Với Hồ Tinh, có thể tận dụng ảo ảnh/phân thân hoặc đuôi tạo vùng nguy hiểm, nhưng phải có tín hiệu nhận biết và cơ hội phản công.
- Tránh trộn các họa tiết/đồ vật thuộc những bối cảnh khác nhau nếu không có logic thế giới; chọn một ngôn ngữ nghệ thuật xuyên suốt.

============================================================
9. BA ƯU TIÊN SỬA CÓ HIỆU QUẢ CAO NHẤT
============================================================

ƯU TIÊN 1 — LÀM MỘT LÁT CẮT CHIẾN ĐẤU THẬT TỐT
Phạm vi: một nhân vật, kiếm, ba loại quái, một phòng, một đòn báo trước và một phần thưởng.
Việc làm:
- Đo độ trễ input, đồng bộ animation/hitbox, phản ứng trúng đòn, né và input buffer.
- Phân biệt trúng/hụt, đòn thường/đòn nặng/chí mạng.
- Sửa hành vi auto-aim nếu làm nhân vật quay sai hướng.
- Đồng bộ SFX với va chạm thật.
Tiêu chí đạt:
- Người mới sau 1–2 phút phân biệt được đánh, né và đòn nguy hiểm.
- Không xảy ra trường hợp hình ảnh đã né thành công nhưng vẫn bị trúng do sai cửa sổ/hitbox.
- Đánh trúng và đánh hụt có phản hồi khác nhau rõ ràng.

ƯU TIÊN 2 — CHUẨN HÓA HÌNH ẢNH VÀ ĐỘ ĐỌC
Phạm vi: một sprite nhân vật, một quái, một phòng ở mỗi vùng, nút HUD và telegraph.
Việc làm:
- Chốt silhouette, bảng màu, đường viền, nguồn sáng, bóng đổ và độ sáng nền.
- Giữ nhân vật/quái/đạn/vùng báo đòn nổi hơn trang trí.
- Giảm VFX cạnh tranh sự chú ý; thêm tùy chọn giảm rung/hạt/chớp.
- Test trên điện thoại ở độ sáng thấp và nhiều tỷ lệ màn hình.
Tiêu chí đạt:
- Có thể nhận diện nhân vật/quái và hướng nguy hiểm mà không phải đọc chữ.
- Vùng báo đòn nổi rõ hơn số sát thương/loot.
- Pixel không bị mờ khi resize hoặc camera di chuyển.

ƯU TIÊN 3 — RÚT GỌN HUD VÀ SỬA 5 PHÚT ĐẦU
Việc làm:
- Giữ lại thông tin bắt buộc khi chiến đấu, ẩn/thu gọn thông tin phụ.
- Tối ưu nút cảm ứng, safe area, multi-touch và xoay màn hình.
- Dẫn người mới qua một trận ngắn, một lần nâng cấp có ý nghĩa, rồi mới mở rộng các hệ thống khác.
- Cho phản hồi tiến hóa vũ khí sớm và dễ thấy.
Tiêu chí đạt:
- Người mới có thể đánh, né, dùng kỹ năng và nhận thưởng mà không cần người khác giải thích.
- Không có thao tác đa chạm phổ biến bị bỏ qua.
- Sau trận đầu, người chơi hiểu nâng cấp nào vừa thay đổi trải nghiệm và vì sao nên thử thêm một ải.

============================================================
10. KẾ HOẠCH KIỂM THỬ ĐỀ XUẤT
============================================================

Test người chơi:
- Cho 5 người chưa biết game chơi trên điện thoại nằm ngang; không hướng dẫn miệng.
- Ghi lại: thời gian bắt đầu đánh; số lần bấm nhầm; có hiểu telegraph không; có dùng né không; có hiểu thưởng/nâng cấp không; có muốn chơi trận hai sau 10 phút không.
- Quan sát hành vi thay vì chỉ hỏi “có hay không”.

Test kỹ thuật:
- Một vòng 10 phút trên Android tầm trung và Safari iOS.
- Một phòng nhiều quái/đạn/hạt để ép tải.
- Giữ và thả nút tấn công, multi-touch, đổi vũ khí lúc đánh, nhận sát thương trong lúc charge.
- Xoay màn hình, đổi kích thước viewport, tắt/bật tiếng, chuyển tab rồi quay lại.
- Mất mạng trong lúc lưu, tải lại game, đăng nhập lại, đóng tab sau khi nhận thưởng.
- Test mọi loại layout phòng để tìm lối đi kẹt, spawn sai và cửa không mở.

Chỉ số cần theo dõi:
- FPS/frame time và memory sau 10 phút.
- Thời gian trung bình mỗi phòng và trận đầu.
- Số lần người chơi bị trúng đòn mà không hiểu nguyên nhân.
- Tỷ lệ hoàn thành trận đầu và tỷ lệ tự vào trận hai.
- DPS, thời gian hạ quái và độ sống sót theo vũ khí/nhân vật.
- Thời gian để đạt mốc linh khí, lượng nguyên liệu cần cho các nâng cấp quan trọng.

============================================================
11. YÊU CẦU CỤ THỂ GỬI CLAUDE
============================================================

Hãy làm việc như một game designer indie có kinh nghiệm đồng thời là người review code. Đừng bắt đầu bằng cách viết lại game hoặc thêm nhiều tính năng. Hãy làm theo thứ tự:

BƯỚC A — AUDIT
1. Đọc cấu trúc dự án và xác định các module điều khiển, combat, animation, hitbox, AI, procedural rooms, HUD, save/auth, audio và renderer.
2. Chạy/kiểm tra bản hiện tại nếu môi trường cho phép. Nếu không chạy được, nói rõ giới hạn và audit code tĩnh.
3. Với từng mục trong tài liệu này, ghi trạng thái: đã xác nhận / cần test / không áp dụng; thêm bằng chứng cụ thể (tên module, hàm, thông số hoặc tình huống tái hiện).
4. Không tuyên bố lỗi đồ họa cụ thể chỉ dựa vào mô tả nếu chưa thấy hình thực tế.

BƯỚC B — XẾP HẠNG VẤN ĐỀ
Tạo bảng gồm: Vấn đề | Bằng chứng | Ảnh hưởng người chơi | Mức ưu tiên P0/P1/P2 | Độ khó S/M/L | Cách sửa tối thiểu | Rủi ro hồi quy | Cách kiểm thử.
- P0: game không chơi được, save mất dữ liệu, combat/input sai nghiêm trọng, lỗi khiến người chơi bị kẹt.
- P1: lỗi ảnh hưởng lớn đến cảm giác đánh, khả năng đọc trận, điều khiển cảm ứng, vòng lặp hoặc cân bằng.
- P2: polish hình ảnh/âm thanh, nội dung phụ và tối ưu ít ảnh hưởng.
Ưu tiên theo hiệu quả/chi phí chứ không theo độ thú vị khi code.

BƯỚC C — ĐỀ XUẤT VÀ TRIỂN KHAI TỪNG BƯỚC
1. Chọn tối đa 3 hạng mục hiệu quả cao nhất để sửa trước; giải thích vì sao.
2. Trình bày thay đổi dự kiến trước khi thực hiện thay đổi lớn; không hỏi lại những thông tin đã có trong tài liệu.
3. Giữ tương thích với save hiện có và các điều khiển hiện tại; không xóa tính năng hoặc đổi cơ chế lõi mà không chỉ ra lý do.
4. Sửa nhỏ theo từng nhóm, chạy build/test sau mỗi nhóm nếu có môi trường.
5. Báo rõ file nào đã sửa, thay đổi gì, test nào đã chạy/pass/fail, phần nào chưa thể xác minh.
6. Không thêm dependency mới nếu không cần thiết.

BƯỚC D — ĐẦU RA
Hãy trả về:
1. Bảng audit P0/P1/P2 có bằng chứng.
2. Danh sách 3 việc ưu tiên và vì sao.
3. Kế hoạch thay đổi tối thiểu theo từng module.
4. Checklist test thủ công trên mobile.
5. Nếu có sửa code: diff/tóm tắt chính xác và kết quả test; không tuyên bố đã test nếu chưa chạy.

RÀNG BUỘC BẮT BUỘC:
- Giữ pixel art, góc nhìn hiện tại và chủ đề dân gian Việt Nam.
- Giữ gameplay cốt lõi và hỗ trợ điện thoại tầm trung trên trình duyệt.
- Ưu tiên cải thiện độ rõ, độ phản hồi, hiệu năng và onboarding trước nội dung mới.
- Không dùng “thêm nhiều hiệu ứng” như giải pháp mặc định cho cảm giác đánh.
- Không cân bằng bằng cách chỉ tăng HP/sát thương của quái.
- Không dùng màu sắc làm tín hiệu duy nhất cho nguy hiểm/trạng thái.
- Nếu thiếu ảnh hoặc không chạy được game, phải ghi rõ điều đó và không giả vờ đã quan sát.

KẾT THÚC TÀI LIỆU
