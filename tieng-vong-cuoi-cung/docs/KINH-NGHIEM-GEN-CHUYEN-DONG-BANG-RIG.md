# Kinh nghiệm: gen chuyển động nhân vật bằng ảnh rig tham chiếu (người dùng lưu 29/10/2026)

Bạn nên mô tả chuyển động theo góc nhìn, bên gần/xa máy quay và từng khung hình. Chỉ nói “nhân vật đi bộ, tay chân vung tự nhiên” thì vẫn có nhiều cách hiểu.

Khung vừa tạo là tư thế T nhìn chính diện. Để làm sprite sheet đi bộ ngang, hãy tạo thêm chuỗi khung rig nhìn ngang trước, rồi dùng chuỗi đó làm ảnh tham chiếu khi tạo nhân vật.

Điểm quan trọng nhất là quy ước rõ:
Nội dung	Cách ghi để tránh nhầm
Hướng nhân vật	Nhìn ngang, mặt hướng sang phải màn hình
Bên gần máy quay	Bên trái cơ thể nhân vật
Bên xa máy quay	Bên phải cơ thể nhân vật
Trước / sau	Trước = bên phải ảnh; sau = bên trái ảnh
Tay và chân	Gọi “tay gần”, “tay xa”, “chân gần”, “chân xa” xuyên suốt
Che khuất	Tay/chân xa nằm sau thân; tay/chân gần nằm trước thân


“Trái cơ thể” và “trái màn hình” là hai thứ khác nhau, nên luôn ghi quy ước này trong prompt.

Bạn có thể dùng prompt tạo khung chuyển động như sau:
Tạo ảnh tham chiếu gồm 8 khung rig nhân vật người, thể hiện một chu kỳ đi bộ hoàn chỉnh.

Góc nhìn và quy ước: Nhìn ngang cố định, nhân vật hướng sang phải màn hình. Bên trái cơ thể là bên gần máy quay; bên phải cơ thể là bên xa. “Phía trước” là bên phải ảnh, “phía sau” là bên trái ảnh. Dùng màu cam cho tay/chân gần, màu xanh dương cho tay/chân xa, màu xanh ngọc cho đầu và thân.

Cấu trúc rig: Thể hiện rõ đầu, cổ, vai, khuỷu tay, cổ tay, ngực, chậu, hông, đầu gối, cổ chân và bàn chân. Giữ nguyên độ dài các xương qua mọi khung. Vai nối với ngực, hông nối với chậu. Tay xoay từ vai, cẳng tay gập tại khuỷu; chân xoay từ hông, cẳng chân gập tại gối.

Chuyển động chung: Đi bộ thư giãn tại chỗ. Thân hơi nghiêng về trước khoảng 5 độ, đầu ổn định và nhìn thẳng. Tay vung ngược pha với chân cùng bên: khi chân gần tiến trước thì tay gần vung sau. Vai và chậu xoay nhẹ ngược chiều nhau; không xoay ngực thành góc nhìn chính diện. Khuỷu tay hơi gập, cổ tay thả lỏng.

Từng khung:
1. Tiếp đất: Chân gần duỗi về trước, gót chạm đất, mũi chân hơi nâng. Chân xa ở sau, gót nhấc và mũi còn chạm đất. Tay gần vung sau, tay xa vung trước.
2. Hạ trọng tâm: Bàn chân gần đặt xuống, gối gần hơi gập để nhận trọng lượng. Chân xa bắt đầu nhấc khỏi mặt đất. Chậu hạ nhẹ; hai tay bắt đầu trở về giữa.
3. Đi ngang chân trụ: Chân gần đỡ cơ thể, nằm dưới chậu. Chân xa gập gối và đưa qua cạnh chân trụ về phía trước; bàn chân xa không xuyên qua chân gần. Hai tay gần đi qua vị trí thả xuống.
4. Nâng trọng tâm: Gót chân gần nâng để đẩy người, mũi chân còn chạm đất. Đùi xa đưa trước, gối bắt đầu duỗi chuẩn bị tiếp đất. Chậu nâng nhẹ. Tay gần vung trước, tay xa vung sau.
5. Tiếp đất đối bên: Chân xa đưa trước, gót chạm đất. Chân gần duỗi về sau, mũi còn chạm đất. Tay gần ở trước, tay xa ở sau.
6. Hạ trọng tâm đối bên: Chân xa nhận trọng lượng, gối hơi gập. Chân gần rời mặt đất và gập gối. Chậu hạ nhẹ.
7. Đi ngang chân trụ đối bên: Chân xa đỡ cơ thể dưới chậu. Chân gần gập gối, đưa qua về trước. Hai tay đi qua vị trí thả xuống.
8. Nâng trọng tâm đối bên: Chân xa đẩy bằng mũi chân. Chân gần đưa trước và bắt đầu duỗi gối để nối tiếp về khung 1.
Bố cục: 8 ô bằng nhau, một hàng, thứ tự từ trái sang phải. Cùng tỷ lệ, góc nhìn và đường mặt đất. Giữ tâm nhân vật quanh cùng vị trí trong mỗi ô, chỉ cho phép độ nhấp nhô theo bước đi. Không lặp khung 1 ở cuối. Các chi xa bị thân và chi gần che đúng thứ tự. Không thêm chi, không đổi màu gần/xa.

Sau khi bạn thấy chuyển động rig đúng, dùng chính ảnh rig đó đính kèm với prompt tạo sprite:
Dùng ảnh chuỗi rig đính kèm làm tham chiếu tư thế cho sprite sheet nhân vật [mô tả nhân vật, quần áo, phong cách].

Mỗi ô nhân vật phải khớp với ô rig tương ứng: giữ vị trí và góc của vai, khuỷu tay, cổ tay, chậu, đầu gối, cổ chân; giữ độ nghiêng thân, vị trí đầu và điểm tiếp xúc bàn chân với mặt đất. Không tự thay đổi động tác.

Giữ nguyên quy ước: nhân vật hướng phải; tay/chân gần là bên trái cơ thể; tay/chân xa là bên phải cơ thể. Vẽ các chi xa phía sau thân, các chi gần phía trước thân. Khi chi bị che khuất, không kéo lệch nó ra ngoài chỉ để làm nó nhìn thấy.

Giữ thiết kế, tỷ lệ cơ thể, trang phục, màu sắc và ánh sáng nhất quán giữa mọi ô. Thay các xương rig bằng cơ thể nhân vật, không để lộ đường rig hay chấm khớp.

Xuất 8 khung trong một hàng, ô bằng nhau, nền trong suốt, toàn thân không bị cắt, cùng tỷ lệ và đường mặt đất, có khoảng trống quanh nhân vật.

Ảnh sinh có thể vẫn lệch khớp hoặc khoảng cách giữa các ô. Nếu bạn cần chuyển động khớp chính xác để dùng trong game, cách chắc hơn là dựng và xuất chuỗi rig bằng code hoặc phần mềm animation, rồi dùng ảnh đó để tạo hình nhân vật và kiểm tra lại từng frame.