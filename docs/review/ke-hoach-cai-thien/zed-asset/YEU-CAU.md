LINH KHÍ — ZED CANONICAL SPRITE & ASSET GENERATION PIPELINE

1. Mục tiêu

Tôi đã chốt sprite sheet Zed mới nhất: nhân vật chibi pixel art, tóc đen buộc cao bằng dây đỏ, khăn đỏ, trang phục tối màu, quần rộng và giày nâu. Sprite sheet có nền xanh chroma key #00FF00, gồm 8 cột × 3 hàng:

* Hàng 1: Idle — đứng thở.
* Hàng 2: Walk — đi bộ.
* Hàng 3: Run — chạy nhanh.

Hãy kiểm tra các asset và code hiện có của dự án LINH KHÍ trước khi sửa đổi.

Nhiệm vụ của bạn là thiết kế một pipeline để tạo prompt sinh ảnh cho những sprite sheet mới, giữ đúng nhận diện Zed và hỗ trợ tích hợp trực tiếp vào game.

Không được tự ý thay đổi tạo hình Zed đã chốt. Không được viết lại game engine. Không được thay đổi gameplay, hitbox, save data hoặc logic chiến đấu ngoài phạm vi cần thiết cho hệ thống asset.

2. Quy tắc khóa nhân vật gốc

Sprite Zed đã duyệt là canonical reference, có quyền ưu tiên cao nhất.

Mọi prompt sinh ảnh phải yêu cầu:

* Giữ nguyên nhận diện khuôn mặt, kiểu tóc, dây buộc tóc đỏ, sừng nếu có trong sprite gốc, màu tóc, tỷ lệ đầu/thân và bảng màu.
* Giữ nguyên phong cách chibi pixel art, mật độ pixel, độ tương phản và cách tô bóng.
* Giữ hướng nhìn, kích thước nhân vật và vị trí chân tương thích với sprite gốc.
* Không tự thiết kế lại nhân vật, không đổi giới tính, độ tuổi biểu kiến, khuôn mặt hoặc tỷ lệ cơ thể.
* Không tự thêm chữ, nhãn, số frame, watermark, hiệu ứng phát sáng, quầng sáng, nền cảnh hoặc bóng đổ trang trí.
* Không tạo nhiều phiên bản nhân vật khác nhau trong cùng sheet.
* Không để nhân vật, tóc, vũ khí, cánh hoặc phụ kiện vượt ra ngoài ô frame.

Nền mặc định cho các ảnh sinh mới là màu xanh lá thuần #00FF00, đồng nhất trên toàn bộ ảnh. Không dùng gradient, texture, ánh sáng nền hoặc đường lưới hiển thị trong ảnh cuối.

Nếu cần đường lưới để kiểm tra, hãy tạo bằng công cụ preview bên ngoài ảnh asset, không yêu cầu AI vẽ đường lưới vào sprite sheet.

Phải sử dụng ảnh sprite Zed canonical làm ảnh tham chiếu khi công cụ sinh ảnh hỗ trợ reference image. Không chỉ dựa vào mô tả bằng văn bản.

3. Quy cách sprite sheet

Trước tiên hãy đọc code và asset hiện có để xác định chính xác quy cách game đang sử dụng.

Thông số runtime hiện có cần được bảo toàn:

* Engine: JavaScript Canvas 2D thuần.
* Logical resolution: 480×270.
* Hiển thị: 960×540, scale ×2.
* Tắt image smoothing để giữ pixel art sắc nét.
* Sprite frame trong game: 48×48 logical pixels.
* Ảnh nguồn tham chiếu hiện tại: frame 96×96 pixels.
* Số cột cơ bản: 8.
* Sprite chân neo mặc định: (24,45) trong frame 48×48.
* Hệ asset hiện có sử dụng .sprite.json và dữ liệu ảnh; WebP có thể được dùng làm ảnh riêng nếu tương thích với pipeline hiện tại.

Không được mặc định mọi sprite sheet mới đều có 3 hàng. Combo vũ khí cần số frame phù hợp với chuyển động. Hãy xác định kích thước sheet, frame count và timing cho từng animation trước khi sinh ảnh.

Nếu ảnh AI không bảo đảm chính xác kích thước hoặc lưới frame, hãy xây dựng bước kiểm tra và xử lý ảnh sau khi sinh. Không tự tuyên bố ảnh đã đạt chuẩn chỉ vì nhìn giống.

4. Nhóm A — Animation chiến đấu

Hãy tạo prompt riêng cho từng nhóm sau. Mỗi prompt phải đủ chi tiết để sử dụng trực tiếp với công cụ sinh ảnh.

A1. Kiếm — Sword Combo

Tạo animation combo chém kiếm liên tiếp của Zed, giữ nguyên tạo hình canonical.

Cần thể hiện đầy đủ các giai đoạn phù hợp:

1. Chuẩn bị tư thế.
2. Rút kiếm hoặc đưa kiếm vào vị trí tấn công.
3. Chém nhát thứ nhất.
4. Chuyển trọng tâm.
5. Chém nhát thứ hai theo hướng khác.
6. Chém nhát kết thúc mạnh hơn.
7. Thu kiếm về.
8. Trở về tư thế chiến đấu.

Điều chỉnh số frame nếu cần để chuyển động không giật. Không ép tất cả các giai đoạn vào 8 frame nếu điều đó làm hỏng động tác.

Yêu cầu chuyển động có trọng tâm, vai, khuỷu tay, cổ tay và chân hợp lý. Đường kiếm phải rõ ràng; không xuyên qua cơ thể; tay phải thực sự cầm chuôi kiếm. Không vẽ kiếm dính vào không khí.

A2. Thương — Spear Combo

Tạo animation combo thương với các động tác:

* Chuẩn bị giữ thương.
* Đưa mũi thương về phía trước.
* Đâm thẳng.
* Thu thương.
* Xoay hoặc quét thương.
* Đâm kết thúc.
* Thu về tư thế chiến đấu.

Thương phải có chiều dài, hướng và điểm cầm nhất quán giữa các frame. Không để cán thương biến dạng, đổi chiều dài hoặc xuyên qua tay và thân người.

A3. Cung — Bow Shooting

Tạo animation bắn cung gồm:

* Đưa cung lên.
* Đặt tay cầm cung.
* Kéo dây cung.
* Giữ trạng thái ngắm.
* Thả dây.
* Theo đà sau khi bắn.
* Hạ cung và hồi phục.

Phải thể hiện riêng vai trò của hai tay: tay giữ cung và tay kéo dây. Không vẽ tay kéo dây như đang cầm một vật không nhìn thấy; không làm biến dạng cánh cung hoặc dây cung.

Mũi tên cần được quản lý theo cơ chế projectile hiện có của game. Không bắt buộc vẽ mũi tên bay qua toàn bộ các frame nhân vật nếu runtime đang quản lý projectile riêng.

A4. Búa — Hammer Combo

Tạo animation combo búa nặng với các giai đoạn:

* Chuẩn bị và nâng búa.
* Lấy đà.
* Vung búa.
* Đập xuống hoặc đánh ngang.
* Hồi lực sau va chạm.
* Thu búa.
* Trở lại tư thế chiến đấu.

Thể hiện trọng lượng vũ khí qua tư thế thân, vai, chân và độ trễ chuyển động. Không biến búa thành kiếm, không để đầu búa thay đổi hình dạng hoặc kích thước giữa các frame.

5. Nhóm B — Trang bị có thể thay đổi

Trang bị phải là hệ thống module. Không tạo một sprite sheet hoàn toàn mới cho mỗi tổ hợp nếu có thể tách layer và tái sử dụng an toàn.

Thiết kế prompt cho các nhóm:

1. Giáp ngực, áo giáp và trang phục thay thế.
2. Giáp vai, giáp tay và găng tay.
3. Giày và giáp chân.
4. Mũ, khăn đội đầu, sừng và phụ kiện đầu.
5. Khăn, đai lưng, túi và phụ kiện thân.
6. Ba lô hoặc đồ đeo sau lưng.
7. Cánh trang trí hoặc cánh chiến đấu.

Quy tắc:

* Trang bị phải khớp chính xác tỷ lệ và tư thế Zed canonical.
* Giáp thay thế phải có phiên bản phù hợp với từng animation hoặc hệ thống overlay hiện có.
* Mũ và phụ kiện đầu phải thích ứng với hướng nhìn và chuyển động tóc.
* Giáp vai, găng tay và giày phải bám theo bộ phận tương ứng, không trôi khỏi cơ thể khi chạy hoặc tấn công.
* Cánh phải có vị trí gắn lưng cố định, đúng thứ tự lớp và animation riêng nếu cần.
* Phụ kiện không được che mặt ngoài ý muốn, trừ khi thiết kế được chỉ định rõ.
* Không tạo viền sáng, hào quang hoặc hiệu ứng tự phát.
* Không làm thay đổi silhouette cơ thể gốc nếu yêu cầu chỉ là thêm phụ kiện.
* Nếu giáp là trang phục thay thế toàn thân, phải chỉ rõ những bộ phận nào được thay thế và những phần nào vẫn giữ nguyên.

Mỗi món cần có mã định danh, tên, layer, pivot, điểm neo và danh sách animation tương thích.

6. Nhóm C — Chuẩn hóa prompt sinh ảnh

Hãy xây dựng một bộ prompt template có các trường:

* character_id
* canonical_reference
* asset_type
* animation_name
* frame_count
* columns
* rows
* frame_width
* frame_height
* facing_direction
* weapon_type
* equipment_id
* pose_sequence
* background_color
* pixel_art_style
* consistency_constraints
* negative_constraints
* output_validation

Mỗi prompt phải mô tả rõ:

1. Hành động của từng frame theo thứ tự.
2. Những bộ phận nào chuyển động và chuyển động như thế nào.
3. Những chi tiết nào tuyệt đối không được thay đổi.
4. Vũ khí được cầm bằng tay nào, ở vị trí nào.
5. Frame nào bắt đầu, đạt đỉnh và kết thúc đòn đánh.
6. Yêu cầu giữ nhân vật trọn trong ô.
7. Nền xanh chroma key thuần.
8. Không chữ, không lưới, không glow, không hiệu ứng nền.
9. Cách kiểm tra sheet sau khi sinh.

Hãy sinh ra prompt cụ thể hoàn chỉnh cho cả bốn nhóm combo vũ khí và các nhóm trang bị ở trên, không chỉ đưa ra template chung.

7. Quy tắc tích hợp runtime

Đọc code hiện tại trước khi thiết kế thay đổi.

Game sử dụng Canvas 2D thuần. Hãy ưu tiên tái sử dụng hệ thống render hiện có.

Cần xây dựng hoặc cập nhật metadata cho:

* Frame dimensions và frame count.
* Animation FPS hoặc frame duration.
* Frame anchor và foot anchor.
* Điểm neo tay trái, tay phải.
* Điểm cầm vũ khí.
* Góc xoay và pivot của vũ khí theo frame.
* Điểm neo giáp, mũ, phụ kiện và cánh.
* Thứ tự layer khi vẽ.
* Thông tin facing direction.
* Vùng bao và kiểm tra tràn frame.
* Trạng thái xác minh asset.

Tách rõ các loại asset:

* Body sprite.
* Outfit hoặc armor overlay.
* Head accessory.
* Back accessory và wings.
* Weapon sprite.
* Projectile sprite.
* Hit effect nếu game có hỗ trợ.

Không bake vũ khí, cánh hoặc phụ kiện vào body sprite nếu mục tiêu là cho phép thay đổi độc lập.

Không tự ý chuyển game sang Phaser, PixiJS hoặc engine khác.

Không dùng tọa độ neo giả định làm dữ liệu production. Điểm neo phải được đo, hiệu chỉnh và kiểm tra trên ảnh thực tế.

8. Xử lý nền xanh và chất lượng ảnh

Nền #00FF00 chỉ là nền trung gian để tách nền. Hãy thiết kế bước hậu xử lý để:

* Xác định vùng nền xanh.
* Loại bỏ nền bằng flood fill hoặc phương pháp phù hợp.
* Giữ nguyên các pixel xanh thuộc chi tiết nhân vật nếu có.
* Tránh viền xanh quanh tóc, vũ khí và trang bị.
* Không xóa các pixel sáng màu da hoặc màu giáp.
* Giữ cạnh pixel sắc nét, không làm mờ.
* Không nội suy làm nhòe pixel art.

Nếu ảnh nguồn bị lẫn nền vào viền nhân vật hoặc không thể phân tách an toàn, hãy đánh dấu lỗi để duyệt thủ công thay vì âm thầm làm hỏng sprite.

9. Validator và preview

Xây dựng validator hoặc mở rộng công cụ preview hiện có để kiểm tra:

* Đúng số hàng và cột.
* Đúng kích thước frame.
* Nhân vật và vũ khí nằm trọn trong từng frame.
* Không có chữ, nhãn hoặc đường lưới trong asset production.
* Không có nền hoặc quầng sáng ngoài yêu cầu.
* Kích thước, silhouette và bảng màu có nhất quán không.
* Chuyển động có tiến triển hợp lý giữa các frame không.
* Tay có cầm đúng vũ khí không.
* Vũ khí có xuyên cơ thể không.
* Giáp, phụ kiện và cánh có trôi khỏi vị trí khi chạy hoặc đánh không.
* Frame đầu/cuối có thể chuyển animation hợp lý không.

Cần có chế độ preview từng frame và phát animation liên tục. Nếu có thể, cho phép so sánh body gốc và body đã gắn trang bị ở cùng một frame.

Validator tự động không thể chứng minh mọi chuyển động đẹp hoặc đúng vật lý. Các lỗi hình thái và chuyển động khó phát hiện phải được ghi vào checklist kiểm tra thủ công.

10. Cách triển khai

Thực hiện theo thứ tự:

Bước 1: Kiểm tra source code, sprite canonical, công cụ preview, định dạng metadata và hệ thống render hiện tại.

Bước 2: Đề xuất cấu trúc asset và metadata tối thiểu cần thiết. Không sửa code ngay nếu chưa xác định được tương thích.

Bước 3: Tạo tài liệu ZED_ASSET_GENERATION_SPEC.md, bao gồm quy cách, quy tắc giữ nhân vật và validator.

Bước 4: Tạo các prompt hoàn chỉnh, mỗi prompt tương ứng một asset hoặc một nhóm asset có thể sinh độc lập.

Bước 5: Thử nghiệm một combo kiếm và một món trang bị trước. Đánh giá chất lượng ảnh, độ ổn định tạo hình và khả năng cắt frame.

Bước 6: Sau khi thử nghiệm đạt yêu cầu, mở rộng sang thương, cung, búa, giáp, phụ kiện và cánh.

Bước 7: Tích hợp vào game, kiểm tra trên Canvas 2D và bảo toàn các chức năng hiện có.

11. Điều kiện nghiệm thu

Chỉ đánh dấu hoàn thành khi:

* Zed vẫn nhận ra là cùng một nhân vật trong tất cả asset.
* Các combo có trình tự chuyển động rõ ràng.
* Vũ khí được cầm đúng và không xuyên qua cơ thể.
* Trang bị có thể thay đổi độc lập theo thiết kế.
* Các layer và điểm neo được kiểm tra trên animation thực tế.
* Asset được cắt frame đúng và chạy được trong runtime.
* Không có nền xanh, chữ hoặc đường lưới trong sprite production đã xử lý.
* Game hiện tại vẫn chạy và gameplay không bị phá vỡ.

Phân biệt rõ ba trạng thái: GENERATED, VALIDATED và INTEGRATED. Không được tuyên bố asset đã tích hợp hoặc đạt chất lượng chỉ vì prompt đã được tạo hoặc ảnh đã được sinh.

Bắt đầu bằng việc kiểm tra các file và code thực tế. Sau đó báo cáo cấu trúc đề xuất, các rủi ro và những prompt đầu tiên cần tạo. Không tự suy đoán nội dung asset chưa được cung cấp.