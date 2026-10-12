# Yêu cầu rà soát toàn bộ (chủ dự án, 12/10 12:43) — nguyên văn

Mình muốn bạn thực hiện một đợt kiểm tra tổng thể (full audit) toàn bộ game Linh Khí để tìm và xử lý tất cả lỗi tương tự đang tồn tại, không chỉ sửa những lỗi mình đã báo.

Ảnh chụp màn hình mình gửi là ví dụ thực tế về các vấn đề cần rà soát. Hãy kiểm tra trực tiếp toàn bộ code, sprite, asset, animation và giao diện hiện có trong dự án.

1. Kiểm tra toàn bộ nhân vật và trang bị

* Mũ, tóc, khuôn mặt, mắt, tay, chân, vũ khí và các phụ kiện có bị lệch, xuyên nhau, che khuất hoặc sai tỷ lệ không.
* Trang bị có nằm đúng vị trí trên cơ thể và di chuyển đồng bộ với nhân vật không.
* Khi chạy, nhảy, né, đánh thường, chém, tung kỹ năng, trúng đòn và chết, các bộ phận có bị biến dạng, mất chi tiết hoặc nhảy vị trí không.
* Tay trước và tay sau có phân biệt rõ; vũ khí có cầm đúng chuôi và không xuyên qua cơ thể không.
* Kiểm tra tất cả nhân vật, quái, boss, NPC và các loại trang bị có thể sử dụng.
* Nếu nhiều nhân vật dùng chung hệ thống ghép trang bị, hãy kiểm tra toàn bộ hệ thống thay vì chỉ sửa một trường hợp.

2. Kiểm tra toàn bộ animation và sprite sheet

* Đối chiếu kích thước frame, tọa độ cắt ảnh, thứ tự frame, anchor/pivot, hướng quay và thứ tự render.
* Tìm các frame có hình thể sai, nhân vật bị cắt cụt, hiệu ứng che mặt, chi bị dính hoặc chuyển động giật bất thường.
* Kiểm tra các animation chuyển trạng thái để tránh nhân vật nhảy vị trí, nhấp nháy hoặc hiển thị sai sprite.
* Giữ nguyên phong cách pixel art, kích thước, hitbox và nhận diện nhân vật nếu không có lý do kỹ thuật cần thay đổi.

3. Kiểm tra toàn bộ hiệu ứng chiến đấu

* Bom, bẫy, vùng sát thương, vòng cảnh báo, dấu hiệu ngắm mục tiêu và hiệu ứng kỹ năng.
* Tìm các hiệu ứng không phù hợp phong cách pixel art, chẳng hạn vòng tròn vẽ tay, nét gạch chéo thô, hình minh họa lệch phong cách hoặc hiệu ứng che khuất nhân vật.
* Kiểm tra hiệu ứng có nằm đúng vị trí trên mặt đất, đúng mục tiêu và đúng thời điểm không.
* Các vùng cảnh báo phải khớp với vùng sát thương thực tế.
* Phân biệt rõ hiệu ứng hình ảnh với logic gameplay. Chỉ sửa cách thể hiện khi không cần thay đổi cơ chế.
* Kiểm tra hiệu ứng nổ, lửa, băng, độc, đòn chém, va chạm và các trạng thái bất lợi để đảm bảo chúng đồng nhất về phong cách.

4. Kiểm tra toàn bộ giao diện trên điện thoại

* HUD, thanh máu, thanh năng lượng, biểu tượng kỹ năng, nút điều khiển, túi đồ, bản đồ và cửa sổ thông báo.
* Tìm các thành phần bị lệch, chồng lấn, quá nhỏ, bị cắt hoặc khó thao tác trên màn hình điện thoại.
* Kiểm tra nhiều tỷ lệ màn hình và hướng hiển thị được game hỗ trợ.
* Đảm bảo giao diện không che khuất nhân vật, kẻ địch hoặc những dấu hiệu chiến đấu quan trọng.

5. Kiểm tra bản đồ và tương tác

* Kiểm tra vật thể, cây cối, nhà cửa, rương, NPC, vật phẩm và các điểm tương tác có hiển thị đúng lớp trước/sau không.
* Phát hiện vật thể xuyên nhau, nằm sai mặt đất, sai tỷ lệ hoặc lệch phong cách đồ họa.
* Kiểm tra va chạm, đường đi, vùng tương tác và các vật thể trang trí có ảnh hưởng sai đến gameplay không.

6. Quy trình bắt buộc

1. Rà soát toàn bộ dự án và lập danh sách lỗi theo mức độ nghiêm trọng.
2. Phân loại lỗi theo nhóm: sprite/asset, animation, render/layer, giao diện, hiệu ứng và gameplay.
3. Xác định nguyên nhân gốc của từng nhóm lỗi; tìm những thành phần dùng chung có thể gây lỗi hàng loạt.
4. Sửa trực tiếp các lỗi đã xác định rõ, ưu tiên sửa hệ thống dùng chung để tránh lỗi tái diễn.
5. Không tự ý vẽ lại toàn bộ asset hoặc thay đổi thiết kế game nếu chưa cần thiết.
6. Chạy game và kiểm thử lại các khu vực, trạng thái và animation bị ảnh hưởng. Nếu có công cụ chụp ảnh hoặc kiểm thử tự động, hãy tận dụng để kiểm tra nhiều trường hợp.
7. Chạy các bài kiểm tra hiện có để đảm bảo không gây lỗi hồi quy.

7. Nguyên tắc bảo toàn dự án

* Không thay đổi cơ chế chiến đấu, sát thương, tốc độ, hitbox, cân bằng game hoặc tiến trình người chơi nếu không được yêu cầu.
* Không sửa những phần đang hoạt động tốt chỉ để thay đổi giao diện.
* Không xóa asset hoặc code cũ hàng loạt khi chưa xác định được quan hệ phụ thuộc.
* Không báo đã sửa hoặc kiểm thử thành công nếu thực tế chưa thực hiện.
* Nếu có lỗi cần asset mới, thiếu tài nguyên hoặc không thể xác minh bằng code, hãy ghi rõ thay vì tự suy đoán.

8. Báo cáo kết quả

Sau khi rà soát, hãy cung cấp:

* Danh sách lỗi đã tìm thấy và vị trí file liên quan.
* Nguyên nhân gốc của từng lỗi.
* Những lỗi đã sửa và cách sửa.
* Những lỗi chưa thể xử lý, kèm lý do.
* Kết quả kiểm thử trước và sau khi sửa.
* Danh sách các khu vực chưa được kiểm tra đầy đủ.

Mục tiêu cuối cùng: làm cho toàn bộ game Linh Khí nhất quán về hình ảnh, animation và trải nghiệm sử dụng; loại bỏ các lỗi hiển thị tương tự trên toàn dự án, không chỉ xử lý những lỗi được phát hiện trong ảnh chụp màn hình.
Ghi chú điều phối: chủ dự án nhắc 'ảnh chụp màn hình' nhưng lần này chỉ gửi văn bản; dùng ảnh trong docs/review/kiem-thu-12-10/anh/ và các lỗi đã báo hôm nay (kiếm che mặt, tay sau dính thân, vệt chém mờ, chạy cà nhắc, mũ to hơn người, vòng quanh vũng độc, trùm chỉ thấy 1 pha) làm ví dụ.
