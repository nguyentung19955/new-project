# NHIỆM VỤ: REFACTOR GAME LINH KHÍ THÀNH BẢN ZED — MỘT NHÂN VẬT, BỐN VŨ KHÍ

Bạn là một senior game developer chuyên về JavaScript, HTML5 Canvas và game RPG 2D pixel art. Hãy trực tiếp kiểm tra và chỉnh sửa dự án Linh Khí hiện tại trong thư mục làm việc. Không chỉ đưa ra hướng dẫn hoặc viết code minh họa: hãy thực hiện thay đổi trên các file thật của dự án.

## 1. ĐỌC VÀ HIỂU DỰ ÁN TRƯỚC KHI SỬA

- Đọc `DOC-TRUOC.md` trước tiên nếu file tồn tại.
- Kiểm tra toàn bộ cấu trúc dự án, các file JavaScript, HTML, CSS, hình ảnh, sprite sheet, dữ liệu và hệ thống lưu game.
- Tìm chính xác cách game khởi tạo, chọn nhân vật, di chuyển, chiến đấu, xử lý animation, trang bị, kỹ năng, boss, nhiệm vụ, giao diện và lưu dữ liệu.
- Đọc code thực tế trước khi sửa. Không mặc định tên file, dòng code hoặc cấu trúc dữ liệu giống mô tả trong tài liệu.
- Xác định các điểm phụ thuộc vào nhân vật cũ và ghi lại kế hoạch sửa ngắn gọn trước khi thực hiện.
- Không xóa hoặc viết lại toàn bộ game chỉ vì muốn đơn giản hóa. Ưu tiên thay đổi tối thiểu, giữ lại hệ thống đang hoạt động.

## 2. MỤC TIÊU CHÍNH

Chuyển game từ hệ thống có nhiều nhân vật chơi được sang hệ thống chỉ có một nhân vật chơi được:

**Tên nhân vật tạm thời: Zed.**

Dùng Cu Tí (`smith`) làm nền tảng ban đầu cho ngoại hình, chỉ số, dữ liệu và animation nếu phù hợp với code hiện có. Chưa cần tạo nhân vật mới bằng AI hoặc thay thế toàn bộ hình ảnh hiện có.

Zed có thể sử dụng bốn loại vũ khí:

1. Kiếm — Sword.
2. Giáo — Spear.
3. Cung — Bow.
4. Búa — Hammer.

Người chơi điều khiển cùng một nhân vật trong toàn bộ quá trình chơi. Vũ khí quyết định bộ kỹ năng, động tác tấn công, sát thương, tầm đánh và hiệu ứng phù hợp.

## 3. XỬ LÝ HỆ THỐNG NHÂN VẬT

- Loại bỏ chức năng lựa chọn hoặc chuyển đổi giữa các nhân vật có thể chơi.
- Không để Cu Tèo, Cái Bống và Cu Lì xuất hiện trong danh sách nhân vật chơi được.
- Có thể giữ các nhân vật đó làm NPC, nhân vật cốt truyện, nhân vật giải cứu hoặc đối tượng hội thoại nếu nội dung game đang sử dụng.
- Không xóa tài nguyên hình ảnh hoặc dữ liệu NPC chỉ vì chúng không còn chơi được.
- Chuyển các hệ thống chiến đấu, chỉ số, kỹ năng, túi đồ, trang bị, bảng xếp hạng và giao diện nhân vật sang sử dụng Zed nhất quán.
- Loại bỏ các nhánh code chỉ tồn tại để xử lý sự khác biệt giữa bốn nhân vật chơi được khi chúng không còn cần thiết.
- Không thay đổi các cơ chế gameplay không liên quan nếu không cần thiết.

## 4. THIẾT KẾ BỐN BỘ VŨ KHÍ

Tạo hệ thống vũ khí có cấu trúc dữ liệu rõ ràng, dễ mở rộng. Trước tiên hãy tận dụng các cơ chế chiến đấu và tài nguyên có sẵn.

### Kiếm
- Tấn công cận chiến nhanh.
- Có animation vung kiếm theo hướng nhân vật đang đối mặt.
- Có thể mở rộng combo nhiều nhát.
- Hiệu ứng chém và vùng gây sát thương phải khớp với hoạt ảnh.

### Giáo
- Tầm đánh dài hơn kiếm.
- Có animation đâm thẳng về phía trước.
- Vùng gây sát thương phải tương ứng với đầu giáo và tầm đâm.
- Không được chỉ đổi hình ảnh kiếm thành giáo mà giữ nguyên hoàn toàn cảm giác chiến đấu.

### Cung
- Tấn công tầm xa.
- Tách mũi tên thành projectile riêng, có vận tốc, hướng bay và xử lý va chạm.
- Animation cần thể hiện các pha giương cung, kéo dây, ngắm, nhả tên và hồi chiêu nếu tài nguyên hiện tại hỗ trợ.
- Không để mũi tên xuất hiện sai vị trí hoặc gây sát thương ngay khi chưa bay tới mục tiêu.
- Thiết kế cấu trúc để sau này có thể thêm các loại tên hoặc kỹ năng cung.

### Búa
- Tấn công cận chiến chậm nhưng mạnh.
- Animation vung hoặc bổ búa có độ nặng rõ ràng.
- Thời điểm gây sát thương phải khớp với pha va chạm.
- Có thể có hiệu ứng chấn động hoặc sát thương diện rộng nếu phù hợp với cơ chế hiện tại.

Không được làm hỏng hệ thống điều khiển trên thiết bị di động. Nếu game đã có nút đổi vũ khí, hãy tận dụng và chỉnh lại cho bốn vũ khí. Nếu chưa có, hãy tạo cách đổi vũ khí phù hợp với giao diện hiện tại, không che khuất các nút điều khiển quan trọng.

## 5. ANIMATION VÀ KIẾN TRÚC SPRITE

Mục tiêu là dùng một nhân vật nhưng có nhiều bộ vũ khí, không phải tạo riêng một nhân vật hoàn chỉnh cho từng vũ khí.

Ưu tiên kiến trúc animation có thể tái sử dụng:

- Một bộ animation nền của Zed cho đứng yên, đi/chạy, nhảy, rơi, tiếp đất, lăn, trúng đòn và chết.
- Các animation tấn công riêng cho kiếm, giáo, cung và búa.
- Tách projectile và hiệu ứng chiến đấu khỏi sprite nhân vật khi hợp lý.
- Nếu sprite sheet hiện có cho phép, tách vũ khí hoặc trang bị thành layer riêng. Nếu việc tách layer khiến chất lượng pixel art giảm hoặc làm sai tư thế tay, hãy dùng sprite tấn công hoàn chỉnh cho loại vũ khí đó.
- Tất cả animation phải giữ cùng kích thước ô, pivot, baseline và hướng nhân vật để tránh giật hình.
- Dùng transparent PNG, giữ pixel sắc nét và tránh nội suy làm mờ.
- Không tự bịa tên file ảnh hoặc đường dẫn tài nguyên. Hãy kiểm tra tài nguyên thật trong dự án.
- Không thay sprite sheet hiện có bằng hình minh họa tĩnh giả dạng animation.
- Nếu thiếu hình ảnh cho một animation, tạo fallback hợp lý bằng code hoặc ghi rõ tài nguyên cần bổ sung; không được khiến game crash.
- Không tạo hàng loạt hình ảnh mới nếu chưa cần thiết để hoàn thành bản refactor đầu tiên.

Trước khi chỉnh animation, hãy xác định chính xác cơ chế cắt frame, kích thước frame, hướng sprite và tốc độ animation hiện tại.

## 6. PHẦN THƯỞNG BOSS VÀ KỸ NĂNG

Boss không còn mở khóa nhân vật mới.

Thay vào đó, khi đánh bại boss, người chơi có thể nhận được:
- Kỹ năng mới cho Zed.
- Nội tại mới.
- Nâng cấp cho một trong bốn loại vũ khí.
- Phần thưởng hoặc vật phẩm theo cơ chế sẵn có.

Hãy tái sử dụng dữ liệu boss, điều kiện mở khóa, tiến trình chương và hệ thống phần thưởng hiện có nếu có thể.

- Không làm mất các trận boss hoặc nội dung chương.
- Không để giao diện hiện thông báo “mở khóa nhân vật” khi đánh boss.
- Phần thưởng phải được lưu và áp dụng đúng vào gameplay.
- Tránh cấp trùng phần thưởng không chủ đích khi tải lại màn hình hoặc đánh boss nhiều lần.

## 7. SAVE GAME

Có thể xóa dữ liệu save cũ. Không cần duy trì tương thích ngược với cấu trúc save của bốn nhân vật cũ.

Tuy nhiên:
- Không tự ý xóa file source hoặc tài nguyên dự án.
- Tạo hoặc điều chỉnh cấu trúc save mới cho Zed và bốn loại vũ khí.
- Có cơ chế mặc định an toàn nếu save chưa tồn tại, dữ liệu không hợp lệ hoặc thiếu trường.
- Nếu save cũ gây lỗi, hãy xử lý bằng cách khởi tạo save mới hoặc cung cấp một cơ chế reset rõ ràng.
- Không xóa dữ liệu trên máy người dùng một cách âm thầm nếu không cần thiết.
- Đảm bảo trạng thái vũ khí, kỹ năng, nội tại, vật phẩm và tiến trình boss được lưu đúng.

## 8. CÁC FILE VÀ HỆ THỐNG CẦN KIỂM TRA KỸ

Tìm tất cả nơi tham chiếu tới:
- Danh sách nhân vật và khóa nhân vật.
- Chỉ số, nội tại và dữ liệu anh hùng.
- `save.hero`, `save.heroes` hoặc cấu trúc tương đương.
- Màn hình chọn nhân vật.
- Cây kỹ năng.
- Logic chiến đấu và tính sát thương.
- Mở khóa nhân vật sau khi đánh boss.
- Hội thoại, NPC và sự kiện giải cứu.
- Túi đồ, trang bị, lực chiến và bảng xếp hạng.
- Animation, sprite sheet, vũ khí và projectile.
- Giao diện cảm ứng và các nút điều khiển.
- Mọi nơi sử dụng khóa `smith`, `hunter`, `healer`, `wrestler` hoặc tên nhân vật cũ.

Chỉ sửa các phần liên quan. Những nhân vật cũ còn được dùng trong cốt truyện không được xóa nhầm.

## 9. QUY TRÌNH THỰC HIỆN

Thực hiện lần lượt:

**Bước A — Khảo sát**
- Đọc tài liệu và code.
- Xác định entry point, cấu trúc module và cách chạy game.
- Liệt kê các phụ thuộc quan trọng và kế hoạch sửa.

**Bước B — Refactor**
- Tạo Zed từ dữ liệu nền Cu Tí.
- Chuyển các hệ thống gameplay sang một nhân vật chơi được.
- Tạo hoặc điều chỉnh hệ thống bốn vũ khí.
- Chuyển phần thưởng boss sang mở khóa kỹ năng/nội tại.
- Cập nhật giao diện và save.
- Giữ lại NPC, cốt truyện và tài nguyên không liên quan.

**Bước C — Kiểm thử**
- Chạy các lệnh kiểm tra hoặc test có sẵn.
- Nếu dự án có thể chạy bằng trình duyệt, hãy kiểm tra khởi động và các luồng gameplay chính.
- Kiểm tra lỗi cú pháp, import, tham chiếu biến, asset path và save.
- Kiểm tra đổi vũ khí và xác nhận vũ khí được chọn thực sự ảnh hưởng đến animation, tầm đánh và kiểu tấn công.
- Kiểm tra đánh boss và nhận phần thưởng.
- Kiểm tra giao diện không còn cho chọn nhân vật cũ.
- Kiểm tra điều khiển trên màn hình nhỏ hoặc chế độ ngang di động nếu dự án hỗ trợ.
- Không được tuyên bố đã test thành công nếu chưa thực sự chạy kiểm thử.

**Bước D — Báo cáo**
Sau khi hoàn thành, báo cáo:
1. Những file đã sửa.
2. Những chức năng đã thay đổi.
3. Những chức năng đã kiểm thử và kết quả.
4. Những vấn đề còn tồn tại.
5. Những sprite hoặc animation còn thiếu và cần bổ sung.
6. Cách chạy bản game đã chỉnh sửa.

## 10. NGUYÊN TẮC BẮT BUỘC

- Sửa trực tiếp dự án hiện có, không chỉ tạo một bản demo độc lập.
- Không xóa các hệ thống lớn để né lỗi.
- Không viết lại toàn bộ game nếu refactor có thể giải quyết.
- Không để tham chiếu tới nhân vật cũ gây lỗi runtime.
- Không tạo dữ liệu hoặc asset path giả.
- Không thay đổi cốt truyện, bản đồ, boss và tiến trình chương ngoài phạm vi cần thiết.
- Ưu tiên code dễ bảo trì, tên biến nhất quán và tránh lặp logic.
- Nếu phát hiện một yêu cầu không thể thực hiện với tài nguyên hiện tại, hãy triển khai phần có thể làm an toàn và ghi rõ giới hạn.
- Không dừng lại sau khi chỉ đưa ra kế hoạch. Sau khi khảo sát, hãy tiến hành sửa code, chạy kiểm thử và báo cáo kết quả.

**KẾT QUẢ MONG MUỐN:** Một bản Linh Khí có một nhân vật chơi được tên Zed, dùng kiếm, giáo, cung và búa; hệ thống boss mở khóa kỹ năng/nội tại thay vì nhân vật; các hệ thống cốt truyện và NPC vẫn hoạt động; animation có kiến trúc dễ mở rộng; game chạy được với cấu trúc code hiện có.