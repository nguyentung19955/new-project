LINH KHÍ — NHẬN XÉT GAME
Đánh giá từ ảnh chụp, GIF, mã nguồn và tài liệu trong gói ngày 17/10/2026.

PHẠM VI
Đã xem README-DOC-TRUOC.md, 00-TONG-QUAN-GAME.md, 14 ảnh trong anh-choi/, GIF trong anh-dong/, và đối chiếu các điểm chính với ma-nguon/js/ và tài liệu thiết kế. Đây là đánh giá từ ảnh và mã nguồn, chưa phải một lượt chơi trực tiếp trên iPhone; tài liệu tổng quan cũng ghi nhận chưa có kiểm thử chơi bằng tay độc lập.

1. ẤN TƯỢNG ĐẦU TIÊN

5 giây đầu: Bìa có không khí — rừng, nước, ánh đỏ và xanh tạo cảm giác phiêu lưu. Nhưng game chưa nói nhanh điều gì làm nó riêng: Cu Tí là ai, đang tìm gì, và chất dân gian Việt sẽ hiện ra trong lối chơi ra sao. Nút bắt đầu nhỏ hơn nhiều so với tranh; “Đăng nhập Google” và “Bảng vàng” tranh sự chú ý trước khi người chơi biết mình sắp chơi gì.

5 phút đầu: Mở đầu bằng kiếm, né và một con quái xuất hiện riêng là lựa chọn tốt. Vấn đề là phần hướng dẫn có xu hướng biến thành một dải chữ dài ở đáy màn hình; ảnh 02-vung1-fight.png cho thấy chữ chiếm gần hết chiều ngang và nằm sát vùng điều khiển. Nhịp “đánh phòng → mở thêm hệ thống → về làng nâng cấp” dễ hiểu về cấu trúc, nhưng người mới có thể chưa hiểu vì sao cần đổi vũ khí, nâng gì trước, hoặc biểu tượng nào trong HUD là quan trọng.

Nhận xét gắt: Phần mở đầu có hình ảnh và nhiều hệ thống, nhưng lời hứa của game chưa nổi bật bằng số lượng nút và bảng.

2. NĂM ĐIỂM HÌNH ẢNH TRÔNG CHƯA CHUYÊN NGHIỆP NHẤT

1) Mặt sàn Rừng già quá rối và tối — 02-vung1-fight.png. Cả sàn lẫn rìa phòng đều phủ nhiều đốm lá nhỏ. Cu Tí tối màu bị chìm giữa nền xanh, nhất là khi đang đứng giữa phòng. Giảm tương phản chi tiết nền sàn khoảng 20–25%; giữ vật thể tương tác và quái sáng hơn nền ít nhất 30–40 mức RGB. Tạo vùng sàn ít chi tiết bán kính 24–30 px game quanh chân nhân vật, chuyển tiếp bằng mảng pixel lớn, không dùng blur.

2) Chất lượng và độ hoàn thiện của sprite vùng 4 không đồng đều — rõ nhất 11-vung4-fight.png và 13-vung4-boss.png. Vùng Sông sâu có nhiều quái tạm; tổng quan xác nhận chỉ 4/8 quái thường có ảnh riêng và Thuồng Luồng còn mượn hình Ngư Tinh. Con rồng tím trên sân sông chưa tạo cảm giác đây là Thuồng Luồng của Linh Khí. Hoàn thiện trước Thuồng Luồng, Cá Trê và hai tinh anh; nếu chưa kịp, tạm dùng silhouette thống nhất thay cho ảnh nhuộm màu. Chọn bảng 5–7 màu riêng cho vùng sông, ví dụ xanh bùn #365B55, xanh nước #4E8F91, vàng đèn #F2C66D, tím trầm #66508A, và áp dụng nhất quán.

3) Nền, Cu Tí và hiệu ứng chưa có cùng độ nét — dễ thấy ở 02-vung1-fight.png và GIF kiếm nặng. Nền có nhiều hạt nhỏ và chi tiết; nhân vật nhỏ, tối, một số khung trông mềm hơn. Khi thêm vệt chém và cảnh báo đỏ, các lớp tranh nhau thay vì có thứ tự rõ. Chốt chuẩn hiển thị ở 48×48 px game: viền ngoài 1 px, tối đa khoảng 16 màu mỗi sprite, không dùng chuyển sắc hạt. Kiểm tra từng nhân vật ở kích thước thật trên nền rừng, biển, sông; sửa sprite hoặc nền tại chỗ nếu chủ thể vẫn chìm.

4) Chữ và cảnh báo chồng lên vùng đánh — 13-vung4-boss.png. “LỘ ĐIỂM YẾU!” và dòng giải thích hệ nằm trước mặt trùm, gần như che khu vực nhân vật cần theo dõi. Đưa thông báo lên ngay dưới thanh máu trùm, tồn tại 0,8–1,0 giây rồi thu thành icon. Dòng hướng dẫn dài chuyển thành hộp nhỏ ở cạnh màn, tối đa 2 dòng / 42 px cao, tự ẩn sau 5 giây hoặc lần chạm tiếp theo.

5) Hai bên màn hình bị bỏ trống trên khung 844×390 — thấy ở nhiều ảnh, kể cả màn đầu và giao diện trận. Nội dung chơi giữ tỷ lệ 16:9 nên trên màn ngang rộng xuất hiện hai dải đen đáng kể. Không kéo giãn hình pixel. Mở vùng hiển thị tới tỷ lệ thiết bị bằng cách cho thấy thêm sàn/cảnh hai bên; đặt nút và HUD trong vùng an toàn. Nếu camera phải giữ khung 16:9, dùng dải ngoài cho thông tin nhỏ thay vì để đen hoàn toàn.

3. HOẠT ẢNH VÀ CẢM GIÁC CHIẾN ĐẤU

Game đã có nền tảng tốt: đòn có mốc trúng rõ, kiếm có chuỗi 3 nhát, đòn nặng có khựng hình, né có cửa sổ bất tử, và đổi vũ khí có thể nối đòn trong 0,18 giây sau khi trúng. Mã cũng có các mức hit-stop; vấn đề không phải là “không có hit-stop”, mà là tín hiệu hình, âm và chuyển động cần khớp nhau hơn.

So với Hades hay Dead Cells, hiện còn thiếu nhất là độ rõ của ý định và hậu quả: người chơi nên thấy đòn đang lấy đà, nhận ra khoảnh khắc chạm, rồi thấy kẻ địch bị tác động đủ mạnh để đòn có trọng lượng. Hai game kia cũng làm đòn và né dễ đọc ngay cả khi màn hình đông.

Combo kiếm nặng — điểm cần sửa trước:
• Theo tổng quan, ba nhát vẫn dài 0,30 / 0,30 / 0,46 giây (khoảng 18 / 18 / 28 khung ở 60 fps). Hình đã đổi, nhưng vùng trúng và sát thương giữ nguyên. Hình ảnh đang hứa một đòn nặng hơn mức cơ chế thể hiện.
• Tài liệu tự chỉ ra khung 1–2 chưa ra dáng kéo kiếm lê sau lưng; khung 8 yếu; ở nhát đầu mũi kiếm có thể đổi từ sau lưng ra trước trong 1 khung hình. Người chơi cảm nhận thành “kiếm dịch chuyển”, dù khung chạm và sát thương đúng thời điểm.
• Nhát 3 chưa ghép được với chân chạy. Khi đang áp sát, Cu Tí đổi đột ngột sang thế đứng tấn. Làm cùng nhịp chân hoặc cho nhân vật chủ động ghìm lại trong 3–4 khung để chuyển thế có chủ ý.
• Giữ tổng thời lượng hiện tại, nhưng làm ba nhát có cao trào rõ hơn: nhát 1 kéo kiếm 4–6 khung; nhát 2 bổ có 2–3 khung giữ tư thế ngay trước va chạm; nhát 3 theo đà 5–7 khung rồi thu kiếm. Đừng để cả ba nhát trông như cùng một cú chém lặp lại.
• Khựng nặng hiện khoảng 70 ms (xấp xỉ 4 khung). Thử tăng riêng nhát kết lên 90–100 ms; thêm rung khung hình tối đa 2 px game trong 60–80 ms và một tiếng va chạm riêng. Cho phép tắt rung trong cài đặt.

GIF kiem-nang-combo-cham3.gif hữu ích để soi khung, nhưng cảm giác vẫn cần thử trên máy thật: tài liệu chưa xác minh được độ “có lực” trên iPhone. Cần kiểm tra bằng ngón cái, loa điện thoại và tốc độ khung hình thực tế, không chỉ xem GIF chậm.

4. MOBILE UI VÀ HUD: NÊN SẮP XẾP LẠI

• Giữ nút Đánh lớn: 84 px ở màn 844×390 là hợp lý. Giữ Né khoảng 64–68 px và Đặc biệt ít nhất 52–56 px; nút thuốc 39 px hiện nhỏ nhất dù là nút sinh tồn, nên tăng lên 46–48 px.
• Gom cụm điều khiển theo ngón cái: Đánh dưới-phải, Né ngay bên trái, Đặc biệt phía trên-trái; thuốc ở ngoài cụm nhưng không xa tới mức phải rời tư thế cầm máy. Tránh vùng chạm chồng nhau khiến Đánh được ưu tiên ngoài ý muốn.
• Thu gọn minimap và thẻ vũ khí góc trên phải. Ảnh trận cho thấy chúng chiếm khối lớn. Mặc định chỉ hiện icon bản đồ và vũ khí; chạm để mở bản đồ trong vài giây. Có thể giữ thanh máu trùm ở giữa khi gặp boss.
• Bỏ “Sức mạnh khuyên dùng” khỏi HUD trong trận. Thông tin đó hữu ích ở màn chọn ải; trong phòng đánh nó không giúp né hay ra đòn. Khi vào trận, ưu tiên máu, trạng thái hệ và cảnh báo đòn.
• Thay dải hướng dẫn toàn màn ở đáy bằng hộp ngắn, tối đa 2 dòng, không phủ lối nhìn giữa chân Cu Tí và quái. Với cảnh báo đòn, dùng màu và hình trước; chữ là phần giải thích tùy chọn.

5. VÒNG LẶP VÀ TIẾN TRÌNH

Dễ gây nhàm: 20 ải có 3 kiểu sơ đồ, nhưng lõi vẫn là dọn phòng, mở cửa, dọn tiếp rồi gặp trùm. Các vai quái đa dạng giúp trận khác nhau, song cần thêm lựa chọn buộc người chơi đổi chiến thuật: phòng nào đáng ghé, đổi lại được gì, hoặc mục tiêu phụ nào ảnh hưởng thật tới trận boss.

Dễ gây rối: làng có nhiều nhân vật và hệ thống mở theo mốc. Cụ Đồ, Ông Từ, Anh Mõ, Thợ Rèn, Hàng Xén và Thợ May cùng chia điểm đến. Sau lượt chơi, cần chỉ rõ một việc quan trọng nhất nên làm.

Có dấu hiệu dư thừa:
• Luyện 1–15 là hệ chính, nhưng luật cũ về mài, ép đồ và lò rèn vẫn còn; tổng quan còn cảnh báo lời thoại/gợi ý có thể nhắc hệ cũ. Rà từng nhãn và hướng dẫn để người chơi không tưởng phải nâng hai hệ song song.
• Việc hôm nay, rương tuần, Ải ngày, Ải Rèn, Ải Vàng, Sổ yêu quái và Thành tựu tạo nhiều checklist. Chọn một việc hôm nay làm mục tiêu chính; phần còn lại để trong sổ.
• Quái chết xong thì thưởng đã tự cộng, nhưng đồ rơi chỉ để nhìn và đi ngang qua là nhặt. Nếu không có quyết định nhặt/bỏ hay rủi ro khi tiến tới, hiệu ứng rơi dễ gây hiểu nhầm về loot.
• Bảng “Sức mạnh khuyên dùng” và sao thứ ba cần đánh bằng hệ khắc chế dễ biến tiến trình thành tối ưu số. Giải thích hệ khắc chế bằng biểu tượng/màu và cho người chơi thấy tác dụng ngay lần thử đầu.

6. BẢN SẮC DÂN GIAN VIỆT: NÊN ĐẨY MẠNH

Trống đồng đã xuất hiện trong cốt truyện, giao diện và phúc lành. Hãy để nó thành một phần của hành động, không chỉ là họa tiết: mỗi mảnh trống đồng khôi phục một nhịp trống hoặc hoa văn mới; đánh đúng nhịp có thể mở nhịp phản công, làm lộ điểm yếu boss, hoặc đổi trạng thái sân đấu.

Làm cho mỗi vùng kể chuyện bằng cơ chế và hình ảnh riêng. Thuồng Luồng nên làm nước dâng theo pha; người chơi dùng cọc/sàn nổi để chọn vùng an toàn. Mộc Tinh có thể biến địa hình bằng rễ cây thay vì chỉ gọi thêm đòn đỏ. Dùng nhạc, tiếng mõ, trống, sáo và lời thoại ngắn có chủ đích để gắn mỗi vùng với chất riêng. Tài liệu nói nhạc đã có âm hưởng Bắc/Oán, nên có cơ sở để phát triển tiếp.

Cu Tí cần một dấu hiệu nhận ra ngay cả khi sprite nhỏ. Có thể dùng chi tiết gắn với cậu bé và hành trình như khăn, túi vải hoặc bùa trống đồng; giữ silhouette riêng thay vì dựa chủ yếu vào bộ ninja đen đỏ.

7. BA VIỆC NÊN LÀM TIẾP

1. Sửa combo kiếm nặng theo thứ tự lỗi nhìn thấy: khung đầu và khung 8, cú chuyển kiếm ở nhát 1, rồi khung chạy của nhát 3. Giữ hit-stop thường khoảng 45–55 ms, thử 90–100 ms cho nhát kết. Đây là điểm chiến đấu được gọi tên cụ thể trong tài liệu và một khung lỗi làm hỏng cảm giác cả combo.
2. Làm một lượt kiểm thử trên iPhone ngang với người chơi mới: ghi lại 5 phút đầu, nút bấm nhầm, chữ che trận và lúc người chơi không biết nên làm gì tiếp. Tập trung sửa hộp hướng dẫn, minimap, thuốc và vị trí HUD; bộ nút Đánh 84 px hiện đã là nền hợp lý.
3. Hoàn thiện hình vùng Sông sâu và khóa chuẩn hình ảnh: ưu tiên Thuồng Luồng, Cá Trê và tinh anh; đồng thời kiểm tra tương phản nhân vật với nền ở kích thước 480×270. Trước khi thêm vùng mới, thống nhất kích thước, viền, bảng màu và silhouette để ảnh tạm không phá cảm giác hoàn thiện.

Một điểm mạnh đáng giữ: game đã có nhiều chất liệu dân gian và từng hệ thống đều có số liệu cụ thể. Việc tiếp theo không cần thêm nhiều hệ thống; cần làm người chơi nhìn rõ, hiểu nhanh và cảm nhận được những gì game đã có.
