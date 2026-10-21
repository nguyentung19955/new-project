PROMPT — LẬP KẾ HOẠCH NÂNG CẤP CHUÔNG HUNTER (CHỈ LẬP KẾ HOẠCH, CHỜ DUYỆT)

Bạn là Lead Game Developer chuyên HTML5 Canvas, JavaScript, Metroidvania 2D và tối ưu game trên iPhone Safari.

Tôi gửi kèm chuong-hunter-code.zip, mã nguồn game Chuông Hunter – Tiếng Vọng Cuối Cùng.

1. NHIỆM VỤ

Đọc mã nguồn thực tế và lập một kế hoạch nâng cấp toàn diện, ưu tiên tính ổn định, cảm giác điều khiển, animation mượt và hiệu năng iPhone.

QUY TẮC BẮT BUỘC:

* CHỈ phân tích và lập kế hoạch.
* KHÔNG sửa code, ảnh, JSON hoặc cấu trúc thư mục.
* KHÔNG tự động triển khai bất kỳ hạng mục nào.
* KHÔNG viết lại toàn bộ game.
* KHÔNG đề xuất chuyển sang Unity, Godot hoặc framework mới nếu không có lý do kỹ thuật thực sự cần thiết.
* Mọi thay đổi phải được tôi phê duyệt trước.
* Phân biệt rõ lỗi xác nhận từ code, rủi ro tiềm ẩn và đề xuất cải tiến.
* Không tự suy đoán nội dung file chưa đọc.
* Trình bày bằng tiếng Việt dễ hiểu, hạn chế thuật ngữ hoặc giải thích ngắn khi sử dụng.

2. ĐỌC MÃ NGUỒN THEO THỨ TỰ

1. README.md
2. docs/gdd.md
3. docs/demo-chibi.md
4. docs/fix-animation.md
5. docs/do-phan-giai-960.md
6. game/demo.html
7. game/anim/*.json
8. game/tools/chibi-sheets.py
9. game/tools/do-animation.py
10. tools/chibi-*.py
11. game/build-demo.py

Đặc biệt kiểm tra các hàm:

* updatePlayer, startAtk, atkBox
* lamChibi, animK, veBuoc
* startRec, recordFrame, updateEcho, resonance
* updateQuai, các hàm boss*
* moveX, moveY, collide
* resize, step, vòng lặp requestAnimationFrame

Với mỗi vấn đề, ghi rõ file, hàm và dòng code nếu xác định được.

3. THAY ĐỔI QUAN TRỌNG NHẤT — THU NHỎ LAM

Lam hiện có chiều cao hiển thị khoảng 160 px logic. Tôi muốn nhân vật nhỏ hơn để thấy nhiều không gian màn chơi, tạo cảm giác khám phá Metroidvania tốt hơn.

Hãy phân tích và so sánh ba phương án:

Phương án	Chiều cao Lam
A	128 px — 80%
B	112 px — 70%
C	96 px — 60%

Ưu tiên xem xét phương án B (112 px), nhưng không tự chốt.

Phân tích tác động tới:

* Độ rõ của Lam trên iPhone khi xoay ngang.
* Tỷ lệ Lam so với quái thường và boss.
* Kích thước dao và vùng gây sát thương.
* Collision box vật lý của Lam.
* Tốc độ chạy, gia tốc, lực nhảy, độ cao nhảy và lướt.
* Kích thước gạch 32 px, nền tảng, cửa và chướng ngại vật.
* Camera, vùng nhìn, khoảng cách từ Lam tới mép màn hình.
* Animation và điểm neo giữa đế ủng.
* Tọa độ và metadata sprite sheet.
* Tiếng Vọng, vị trí bóng và Cộng hưởng.
* Hiệu năng và độ sắc nét trên Safari.

Làm rõ nên thu nhỏ nhân vật bằng hệ số render, thay đổi kích thước vật lý, thay đổi kích thước ảnh nguồn hay kết hợp các cách đó.

Không thay đổi độ phân giải logic 960×540 hoặc kích thước gạch 32 px nếu chưa chứng minh được sự cần thiết.

Đề xuất phương án thử nghiệm ít rủi ro nhất, có thể quay về kích thước cũ ngay khi cần.

4. KẾ HOẠCH SỬA ANIMATION

Kiểm tra hệ thống sprite sheet, metadata [x,y,w,h,ox,oy], thời lượng khung, dx/dy, điểm neo và nội suy khi vẽ.

Lập kế hoạch xử lý:

* Lam nhấp nhô, rung hoặc trượt vị trí giữa các khung.
* Chiều dài tay, chân không đồng nhất với ảnh master.
* Đầu, vai, hông và đế ủng lệch nhau.
* Sai tay cầm dao hoặc nhầm tay trước/sau.
* Chuyển động chạy, nhảy, lướt, đâm và chém thiếu nhịp.
* Sprite bị méo hoặc mờ khi thu nhỏ.
* Vùng sát thương không khớp với hình dao.
* Animation không khép kín khi lặp.

Đề xuất tiêu chuẩn nghiệm thu bằng số đo, không chỉ nhận xét bằng mắt.

Làm rõ lỗi nào có thể sửa bằng JavaScript/metadata, lỗi nào bắt buộc phải chỉnh ảnh nguồn.

5. KẾ HOẠCH CHIẾN ĐẤU VÀ TIẾNG VỌNG

Kiểm tra hệ thống combo, hitbox, hit-stop, phản ứng trúng đòn và Cộng hưởng.

Đặc biệt phân tích:

* Đòn 1: hộp sát thương dài hơn hình dao khoảng 13 px.
* Đòn 2: hình dao dài hơn hộp sát thương khoảng 25 px.
* Hitbox nên thay đổi theo từng khung hay từng pha animation.
* Khả năng đánh trúng nhiều lần ngoài ý muốn.
* Combo buffer và thời điểm cho phép nối đòn.
* Tiếng Vọng ghi tối đa 3 giây.
* Bóng phải phát lại chính xác hành động đã ghi.
* Cộng hưởng xảy ra khi Lam và bóng đánh cùng mục tiêu trong cửa sổ 12 bước logic.
* Các tình huống FPS thấp, hit-stop, quái chết, bóng giữ công tắc.

Không làm thay đổi luật gameplay cốt lõi nếu chưa được duyệt.

6. KẾ HOẠCH TÁCH MODULE

Đánh giá việc tách game/demo.html thành các module nhỏ trước khi làm thêm màn chơi.

Đề xuất cấu trúc cụ thể cho:

* Player
* Input và cảm ứng
* Physics và collision
* Animation
* Combat
* Echo và Resonance
* Enemy và Boss
* Camera và Render
* Level và Puzzle
* Save và Checkpoint
* Asset loading
* Debug và công cụ kiểm thử

Giữ nguyên khả năng đóng gói thành một file HTML bằng quy trình build phù hợp.

Nêu rõ thứ tự tách module để tránh làm hỏng demo hiện tại.

7. KẾ HOẠCH TỐI ƯU IPHONE

Phân tích:

* Canvas và devicePixelRatio.
* Tốc độ logic 60 bước/giây.
* Tốc độ vẽ trên màn hình 60 Hz và 120 Hz.
* Dung lượng và bộ nhớ sprite sheet.
* Parallax, hiệu ứng hạt, rung màn.
* Nhiệt độ máy và mức tiêu thụ pin.
* Cảm giác bấm nút cảm ứng.
* Safe area, Safari landscape, thay đổi kích thước màn hình.
* Coyote time, jump buffer, dash buffer, combo buffer.

Đề xuất ba mức chất lượng: Tiết kiệm pin, Cân bằng và Chất lượng cao.

Không đưa ra kết luận về FPS thực tế nếu chưa có số liệu đo trên thiết bị.

8. KẾ HOẠCH SẢN XUẤT HÌNH ẢNH

Thiết kế quy trình tạo sprite bằng ChatGPT và script Python:

1. Khóa ảnh master Lam.
2. Khóa tỷ lệ các bộ phận cơ thể.
3. Dựng pose guide cho từng khung.
4. Sinh ảnh theo nhóm khung nhỏ.
5. Kiểm tra tay, chân, dao, chuông và áo choàng.
6. Tách nền, cắt khung, chuẩn hóa điểm neo.
7. Xuất sprite sheet và JSON.
8. Xem trước GIF.
9. Kiểm thử trực tiếp trong game.
10. Chỉ đưa vào bản chính khi đạt tiêu chuẩn.

Đề xuất số khung và thời lượng phù hợp cho từng animation.

Không mặc định tăng số khung là sẽ mượt hơn.

9. ĐẦU RA BẮT BUỘC

PHẦN A — ĐÁNH GIÁ HIỆN TRẠNG

Nêu những điểm tốt, những lỗi xác nhận được và những rủi ro cần kiểm tra thêm.

PHẦN B — SO SÁNH KÍCH THƯỚC LAM

So sánh 128 px, 112 px và 96 px.

Đề xuất một phương án ưu tiên, giải thích lý do và những thông số cần kiểm thử.

PHẦN C — BẢNG KẾ HOẠCH CÔNG VIỆC

Với mỗi công việc, cung cấp:

ID	Vấn đề	Cách sửa	File/hàm	Ưu tiên	Rủi ro	Cách kiểm tra

Ưu tiên: Cao / Vừa / Thấp.

PHẦN D — LỘ TRÌNH TRIỂN KHAI

Chia thành các giai đoạn nhỏ, có thể duyệt độc lập.

Mỗi giai đoạn phải có:

* Mục tiêu.
* Những file dự kiến thay đổi.
* Những việc tuyệt đối không thay đổi.
* Thứ tự thực hiện.
* Kết quả mong đợi.
* Tiêu chí nghiệm thu.
* Cách quay lại bản cũ nếu xảy ra lỗi.
* Những phần phụ thuộc giai đoạn trước.

PHẦN E — DANH SÁCH KIỂM THỬ

Bao gồm:

* Chạy và dừng.
* Nhảy và tiếp đất.
* Lướt.
* Combo.
* Đánh trúng quái.
* Tiếng Vọng.
* Cộng hưởng.
* Công tắc và cổng.
* Boss.
* Camera.
* Hiệu năng iPhone.
* Chuyển đổi bàn phím và cảm ứng.
* Các tình huống FPS thấp.

PHẦN F — NHỮNG QUYẾT ĐỊNH CẦN TÔI DUYỆT

Tạo bảng riêng gồm:

Mã duyệt	Quyết định	Phương án	Khuyến nghị	Tác động

Tôi phải có thể trả lời đơn giản như: Duyệt A1, A2; chỉnh A3; chưa duyệt A4.

10. QUY TẮC KẾT THÚC

Kết thúc bằng:

“ĐÃ HOÀN THÀNH KẾ HOẠCH — ĐANG CHỜ CHỦ DỰ ÁN PHÊ DUYỆT.”

Tuyệt đối không bắt đầu sửa code, chạy script ghi đè, thay đổi sprite sheet hay triển khai bất kỳ hạng mục nào trước khi tôi duyệt.