LINH KHÍ — CHUYỂN ĐỔI TOÀN BỘ HỆ THỐNG SPRITE SANG MODULAR ASSET PIPELINE

Tôi muốn thay đổi định hướng hệ thống sprite và trang bị của LINH KHÍ theo hình tham chiếu tôi vừa gửi.

Đây là yêu cầu thay đổi định hướng thiết kế asset, không phải yêu cầu giữ nguyên hệ thống đồ mặc hoặc kiến trúc cũ. Hãy chủ động đánh giá, thiết kế lại và triển khai theo phương án tốt nhất. Nếu sprite hiện tại không phù hợp, hãy tạo prompt mới và gen lại asset cần thiết.

1. Định hướng bắt buộc

Xây dựng hệ thống nhân vật chibi pixel art có thể thay đổi ngoại hình bằng cách ghép các asset riêng.

Một nhân vật hoàn chỉnh được tạo từ các nhóm:

1. Cơ thể gốc Zed.
2. Layer trang phục: áo, quần, giáp thân.
3. Layer mũ và phụ kiện đầu.
4. Layer phụ kiện lưng.
5. Vũ khí riêng.
6. Điểm neo cơ thể và vũ khí.
7. Hệ thống ghép trang bị để tạo ngoại hình hoàn chỉnh.

Mỗi nhóm phải có quy cách sprite sheet, animation và metadata rõ ràng.

Không tạo một sprite sheet nguyên bộ cho từng tổ hợp trang bị. Mục tiêu là có thể kết hợp nhiều món đồ độc lập mà không phải vẽ lại toàn bộ nhân vật cho mỗi tổ hợp.

2. Cơ thể gốc Zed — Canonical Base

Dùng sprite Zed đã được tôi chốt làm chuẩn nhận diện.

Giữ nguyên:

* Khuôn mặt, kiểu tóc và các đặc điểm nhận diện.
* Tỷ lệ đầu/thân.
* Phong cách chibi pixel art.
* Bảng màu và silhouette cơ bản.
* Đặc điểm trang phục mặc định cần thiết để nhận ra Zed.

Nếu sprite gốc hiện tại không đủ chất lượng, sai tỷ lệ, sai hướng nhìn hoặc không phù hợp để ghép layer, hãy đề xuất và tạo lại sprite gốc.

Không được âm thầm thay thế mẫu đã duyệt. Hãy chỉ rõ nguyên nhân cần gen lại và giữ bản gốc để đối chiếu.

3. Quy cách animation cơ bản

Sprite sheet cơ thể gốc có 8 cột × 3 hàng:

* Hàng 1: Idle — đứng thở.
* Hàng 2: Walk — đi bộ.
* Hàng 3: Run — chạy nhanh.

Mỗi ô là một frame độc lập, không có chữ hoặc nhãn trong ảnh production.

Giữ nền xanh thuần #00FF00 cho ảnh trung gian khi sinh bằng AI. Sau đó tách nền và chuẩn hóa thành asset có transparency.

Không để lưới, đường phân cách, chữ, quầng sáng hoặc bóng nền lọt vào asset cuối.

Mọi nhân vật phải nằm trọn trong ô. Không để tóc, chân, vũ khí hoặc phụ kiện bị cắt ở ranh giới frame.

Hãy xác minh kích thước và vị trí anchor từ ảnh thực tế trước khi quyết định thông số production.

4. Layer trang phục — Clothing & Armor

Hãy thiết kế và tạo riêng các sprite sheet cho:

* Áo và trang phục thân.
* Quần.
* Giáp thân.
* Giáp vai.
* Giáp tay và găng tay.
* Giáp chân và giày.
* Đai lưng và phụ kiện hông.

Các layer phải tương thích với cùng chu kỳ animation Idle, Walk và Run của body.

Mỗi frame trang phục phải khớp chính xác với tư thế tương ứng của cơ thể. Không vẽ lại một bộ đồ đứng yên rồi dùng chung cho mọi tư thế.

Thiết kế các nhóm trang bị khác nhau, ví dụ:

* Bộ mặc định.
* Bộ Làng.
* Bộ Giáp Đỏ.
* Bộ Thầy Lang.
* Các bộ mới có thể bổ sung về sau.

Tên trên chỉ là nhóm nội dung minh họa. Hãy kiểm tra asset thực tế hiện có trước khi tái sử dụng hoặc tạo mới.

Những bộ phận không thay đổi phải tiếp tục sử dụng body hoặc layer tương ứng. Chỉ thay các layer thuộc món đồ được trang bị.

Nếu cách tách layer đơn thuần gây khe hở hoặc lỗi pixel, hãy điều chỉnh ranh giới layer hoặc tạo asset bổ trợ phù hợp.

5. Mũ và phụ kiện đầu

Tạo sheet riêng cho mũ, khăn đội đầu và các phụ kiện đầu.

Các phụ kiện phải:

* Có vị trí gắn đầu nhất quán.
* Khớp với 8 frame mỗi animation.
* Không che khuôn mặt ngoài ý muốn.
* Không làm tóc hoặc đầu bị biến dạng.
* Không trôi khỏi đầu khi chạy hoặc chiến đấu.

Với mũ che tóc, phải quy định rõ phần tóc nào được ẩn và phần nào vẫn xuất hiện.

Không vẽ mũ thành một nhân vật hoàn chỉnh. Chỉ tạo phần asset cần thiết để ghép vào Zed.

6. Phụ kiện lưng và cánh

Tạo asset riêng cho khăn bay, ba lô, đồ đeo lưng và cánh.

Phải xác định:

* Điểm neo lưng.
* Thứ tự vẽ trước/sau cơ thể.
* Animation hoặc frame tương ứng.
* Những phần cần xuất hiện phía trước và phía sau cơ thể.
* Cách xử lý khi phụ kiện chuyển động mạnh.

Không bắt buộc mọi phụ kiện lưng đều dùng chung một layer. Nếu cần, hãy tách thành layer phía sau và layer phía trước để tránh che sai cơ thể.

Cánh có thể có animation riêng nhưng phải đồng bộ với chuyển động nhân vật.

7. Vũ khí riêng và điểm cầm

Vũ khí không được vẽ cố định vào body sprite.

Tạo asset riêng cho:

* Kiếm.
* Thương.
* Cung và dây cung.
* Búa.

Cần có điểm neo tay cầm, pivot và góc xoay theo từng frame khi cần thiết.

Mỗi loại vũ khí phải có animation chiến đấu tương ứng:

* Kiếm: combo chém liên tiếp.
* Thương: combo đâm và quét.
* Cung: nâng cung, kéo dây, ngắm, thả dây và hồi phục.
* Búa: nâng, lấy đà, đập, hồi lực và thu về.

Không ép tất cả combo vào sprite sheet 8 × 3. Hãy xác định frame count phù hợp cho từng animation.

Tay phải thực sự cầm đúng vị trí. Không để vũ khí xuyên qua cơ thể, đổi kích thước bất thường hoặc trôi khỏi tay.

Cung cần hai điểm tương tác riêng: tay giữ cung và tay kéo dây.

8. Hệ thống ghép nhân vật

Thiết kế renderer có thể ghép:

Base Body + Clothing/Armor + Headgear + Back Accessories + Weapon

Hệ thống phải hỗ trợ:

* Chọn từng món trang bị độc lập.
* Thay đổi món đồ ngay khi đang preview.
* Đồng bộ frame giữa body và trang phục.
* Bật/tắt từng layer.
* Chuyển animation mà không làm trang bị lệch.
* Xử lý đúng layer trước/sau cơ thể.
* Mở rộng thêm trang bị mà không sửa renderer cho từng món.

Hãy chọn kiến trúc phù hợp nhất. Không bắt buộc sử dụng cách triển khai hiện tại nếu nó không đáp ứng được mục tiêu này.

9. Metadata và điểm neo

Mỗi asset cần metadata tương ứng với cấu trúc thực tế, bao gồm:

* Asset ID.
* Loại asset và slot.
* Frame width, frame height.
* Rows, columns và frame count.
* Animation name và frame duration.
* Facing direction.
* Anchor hoặc pivot cần thiết.
* Layer order.
* Compatibility.
* Trạng thái kiểm tra.

Phải hỗ trợ các trạng thái:

* GENERATED: ảnh đã được tạo.
* VALIDATED: ảnh và frame đã được kiểm tra.
* INTEGRATED: đã ghép vào hệ thống và kiểm tra trong runtime.

Không dùng tọa độ neo giả định làm dữ liệu production.

10. Pipeline tạo và kiểm tra asset

Hãy xây dựng quy trình thống nhất:

1. Dùng Zed canonical làm reference.
2. Tạo prompt cụ thể cho từng nhóm asset.
3. Gen sprite sheet.
4. Kiểm tra tạo hình và chuyển động.
5. Cắt frame.
6. Tách nền xanh.
7. Kiểm tra viền pixel và kích thước.
8. Hiệu chỉnh anchor.
9. Ghép thử với body.
10. Chạy preview animation.
11. Chỉ tích hợp sau khi đạt yêu cầu.

Nếu ảnh AI không giữ đúng số frame, tạo sai hình hoặc không thể tách nền sạch, hãy đánh dấu lỗi và gen lại khi cần. Không coi ảnh lỗi là asset đạt chuẩn.

Hãy mở rộng công cụ preview hiện có nếu phù hợp hoặc xây dựng công cụ mới nếu đó là lựa chọn tốt hơn.

11. Triển khai theo vertical slice

Không cần gen hàng trăm asset ngay lập tức.

Trước tiên hãy hoàn thành một vertical slice gồm:

* Một body Zed chuẩn.
* Một bộ trang phục mặc định.
* Một bộ giáp thay thế.
* Một loại mũ.
* Một phụ kiện lưng hoặc cánh.
* Một thanh kiếm riêng.
* Animation Idle, Walk, Run.
* Một combo kiếm.
* Công cụ preview cho phép bật/tắt và thay đổi các layer.

Khi vertical slice đạt chất lượng, mở rộng sang các bộ đồ và vũ khí khác.

Nếu asset hiện tại không đạt chuẩn, hãy gen lại phần cần thiết thay vì cố giữ một thiết kế kỹ thuật không phù hợp.

12. Kết quả cần bàn giao

Hãy:

1. Đánh giá các asset hiện tại và xác định phần nào có thể giữ lại.
2. Đề xuất kiến trúc asset mới.
3. Tạo tài liệu LINH_KHI_MODULAR_SPRITE_SPEC.md.
4. Tạo các prompt sinh ảnh cụ thể.
5. Triển khai hệ thống ghép layer và preview.
6. Tạo vertical slice.
7. Kiểm tra và báo cáo kết quả thực tế.

Không chỉ trả về một bản kế hoạch. Hãy triển khai trên source code thực tế khi có đầy đủ file và công cụ.

Báo cáo rõ asset nào được tái sử dụng, asset nào phải gen lại, file nào đã sửa, kết quả test và những phần còn thiếu.

Tiêu chí cuối cùng: Tôi phải có thể thay áo/giáp, mũ, phụ kiện lưng, cánh và vũ khí của cùng một nhân vật Zed, trong khi các animation khớp nhau và tạo hình vẫn nhất quán.

---
**Ghi chú điều phối (12/10 20:10):** chủ dự án đã chốt 4 vũ khí = kiếm, thương, búa, PHI TIÊU (bỏ cung) — mục 7 "Cung và dây cung" thay bằng phi tiêu (tay phải ném, tay trái giữ thăng bằng; phi tiêu bay là sprite đạn riêng). Canonical = docs/anh-goc/zed/zed-canonical.png (Zed ninja). Không test game theo lời dặn chủ dự án.
