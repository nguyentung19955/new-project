# PROMPT CLAUDE — SỬA HỆ THỐNG GHÉP TOÀN BỘ TRANG BỊ LINH KHÍ

## Bối cảnh bắt buộc

Đọc ZIP `linh-khi-ghep-nhan-vat.zip` trước khi sửa. Đây là game Linh Khí HTML5 canvas pixel art, bản chụp `lk-2026.10.10-2249`, nhánh `khoi-tao-du-an`. Không viết lại toàn bộ hệ thống và không tự ý thay asset đã được duyệt.

Các tệp quan trọng trong gói:
- `DOC-TRUOC.md`
- `tai-lieu/DAC-DIEM-HINH-GAME.md`
- `tai-lieu/do-bao-cao.md`
- `tai-lieu/do-khoac-net-bao-cao.md`
- `game-js/hero_tinhlinh.js`
- `game-js/sprite_custom.js`
- `game-js/outfit.js`
- `game-js/tailor.js`
- `cong-cu/tach-anh-hung.html`
- `cong-cu/tach-do.html`
- `mau-tep/*.sprite.json`

Trong ZIP, `game-js/` là bản trích xuất mã nguồn để phân tích; xác minh cấu trúc repo thật trước khi sửa và không mặc định các đường dẫn trong ZIP chính là đường dẫn làm việc hiện tại.

## Vấn đề cần giải quyết

Không chỉ vũ khí, mà toàn bộ trang bị đang khó khớp tự nhiên với từng nhân vật:
- Mũ không ôm đúng đầu/tóc/nón.
- Áo giáp không ôm thân, vai hoặc hông; kích thước thân giữa các nhân vật khác nhau.
- Đồ lưng, ống tên, bùa, đồ cầm tay, mặt nạ và cánh dễ lệch hoặc bị che sai.
- Một món đồ có thể trông ổn ở tư thế đứng nhưng lệch khi chạy, đánh, lăn hoặc ngã.
- Cấu hình thủ công chung không đủ cho mọi nhân vật, món đồ và animation.

## Chẩn đoán từ kiến trúc hiện tại cần kiểm tra và xác nhận

1. Trang phục AI trong `sprite_custom.js` được nối qua `dinhNghia(sp)`. Vị trí chính lấy từ `trang_phuc.lech`; mũ/mặt nạ được đặt tương đối với neo đầu `H`, còn áo/đồ lưng/đồ tay/cánh chủ yếu đặt tương đối với neo thân `B`. Đây là cách đặt theo offset tĩnh, không phải phép khớp hình dáng riêng cho từng nhân vật.
2. `hero_tinhlinh.js` có logic vẽ trang phục code và hàm `lopDo()` để dựng lớp đồ khoác lên thân AI. `lopDo()` tạo đồ từ tư thế đứng, rồi áp dụng dịch chuyển/độ xoay được ước lượng. Nó không tự làm cho hình áo giáp ôm sát đường viền thân của mỗi nhân vật.
3. `SC.khopEmBe()` trong `sprite_custom.js` ước lượng dịch chuyển đầu/thân từ mặt nạ pixel; với lăn/ngã, nó tìm góc xoay tổng thể. Đây không phải hệ điểm neo chi tiết ở vai, khuỷu tay, hông, đầu gối, bàn chân.
4. Công cụ `tach-do.html` hiện có thao tác chỉnh vị trí, lật, xoay và kích thước, nhưng cần xác minh việc lưu cấu hình có gắn riêng theo cặp nhân vật–trang bị hay chỉ lưu offset mặc định trong asset.
5. Không được kết luận rằng mọi món đồ phải được biến dạng tự động. Một số đồ có thể dùng offset; áo giáp ôm thân hoặc mũ có hình dáng đặc thù có thể cần biến thể sprite/layer được vẽ riêng.

Hãy kiểm tra mã thật và báo rõ điểm nào trong các nhận định trên đúng, sai hoặc chưa đủ bằng chứng trước khi triển khai.

## Thiết kế mục tiêu

Xây dựng hệ thống ghép trang bị theo 3 lớp dữ liệu:

### A. Hồ sơ hình thể nhân vật (`character_profile`)
Mỗi nhân vật có các điểm neo phù hợp:
- đầu: tâm đầu, đỉnh đầu, gáy;
- thân: cổ, vai trái/phải, ngực, eo, hông;
- tay: vai, khuỷu, cổ tay/bàn tay;
- chân: hông, đầu gối, mắt cá/bàn chân;
- điểm cầm vũ khí;
- điểm gắn đồ lưng/cánh.
Không bắt buộc mọi nhân vật phải có tất cả điểm neo ngay từ đầu. Có thể cho phép đặt điểm bằng thao tác click trên sprite và lưu theo mã nhân vật.

### B. Hồ sơ trang bị (`equipment_profile`)
Mỗi món có:
- loại/vị trí gắn: mũ, áo, đồ lưng, đồ tay/bùa, mặt nạ, cánh, vũ khí;
- điểm neo tương ứng trên chính ảnh trang bị;
- kích thước chuẩn và tỷ lệ cho phép;
- pivot, góc xoay, lật ngang;
- vùng che phủ/mask nếu cần;
- thứ tự lớp: sau thân, thân, trước thân, trước tay hoặc sau tay khi phù hợp;
- quy tắc theo animation;
- tùy chọn dùng biến thể riêng cho nhân vật cụ thể.

### C. Cấu hình ghép theo cặp (`fit_profile`)
Cho phép lưu điều chỉnh riêng theo `character_id + equipment_id`, không ghi đè metadata gốc của món đồ:
- offset X/Y;
- scale X/Y nếu thật sự cần;
- góc xoay;
- layer order;
- mask/occlusion;
- biến thể sprite;
- override theo animation/frame khi có lý do rõ ràng.
Có giá trị mặc định để món mới vẫn xem thử được, nhưng phải đánh dấu là “chưa hiệu chỉnh” thay vì giả vờ đã khớp chuẩn.

## Quy tắc xử lý theo loại trang bị

- **Mũ:** khớp theo đỉnh đầu/gáy và vùng tóc; hỗ trợ lớp nằm sau đầu hoặc vẽ đè trước mặt. Không chỉ căn giữa bounding box.
- **Mặt nạ:** khớp theo vị trí mắt/mặt, có thể cần điểm neo riêng cho mắt hoặc tâm mặt. Không đặt chỉ theo tâm đầu nếu sẽ lệch mắt.
- **Áo/giáp:** ưu tiên neo cổ, vai, eo/hông; có thể dùng biến thể theo nhân vật. Không kéo giãn vô hạn để ép áo vào thân.
- **Găng/tay áo:** phải theo vị trí tay/cẳng tay trong tư thế; cần xử lý trước/sau thân. Nếu asset chỉ là biểu tượng tĩnh không thể dùng như găng tay thực, hãy báo cần asset mới.
- **Đồ lưng/ống tên:** neo vào vai/lưng, có hướng và lớp trước/sau riêng; tránh đặt theo tâm thân đơn thuần.
- **Bùa/đồ cầm tay:** phân biệt đồ đeo ở thắt lưng và đồ cầm trên tay. Đồ cầm phải theo điểm bàn tay từng tư thế.
- **Cánh:** có neo gốc ở vai/lưng, hỗ trợ cánh xa tối hơn, thứ tự lớp và chuyển động vỗ riêng; không dùng offset thân đơn giản nếu tạo cảm giác cánh mọc sai vị trí.
- **Vũ khí:** tiếp tục dùng điểm cầm/mũi và pivot, nhưng cấu hình điểm cầm phải có thể khác theo nhân vật và loại vũ khí.

## Animation và thân AI

- Không ép một offset duy nhất lên mọi frame.
- Trước tiên dùng các điểm neo/khớp theo frame nếu sprite sheet có animation dựng sẵn.
- Với animation AI, có thể dùng điểm neo theo từng động tác hoặc từng frame. Nếu chưa có dữ liệu, dùng phép ước lượng hiện tại làm fallback, nhưng hiển thị trạng thái “ước lượng” và cho phép hiệu chỉnh.
- Với áo giáp ôm thân, ưu tiên sprite/layer riêng theo frame hoặc biến thể phù hợp; chỉ dùng phép dịch/chuyển/xoay cho đồ có thể giữ hình dáng khi biến đổi.
- Không thay đổi logic gameplay, hitbox, sát thương, thời gian animation, kích thước thế giới, cấu trúc lưu tiến trình hoặc quy tắc điều khiển.

## Yêu cầu cải tiến giao diện công cụ

Trong Xưởng Sprite hoặc công cụ ghép trang bị:
1. Chọn nhân vật, animation/frame, món đồ và vị trí gắn.
2. Hiển thị nhân vật gốc, layer trang bị và kết quả ghép; có chế độ nền caro để xem alpha và chế độ phóng to pixel.
3. Cho phép kéo/đặt điểm neo trực tiếp trên ảnh, không chỉ bấm mũi tên dịch chuyển.
4. Có nút bật/tắt từng layer, hiển thị anchor/pivot, lưới pixel và đường viền/mask.
5. Có thao tác “lưu cấu hình cho cặp này”, “sao chép cấu hình sang nhân vật khác” và “khôi phục mặc định”.
6. Có chế độ so sánh trước/sau và xem animation liên tục.
7. Hiển thị cảnh báo nếu món đồ chưa được hiệu chỉnh cho nhân vật đang chọn.
8. Không yêu cầu người dùng sửa JSON thủ công cho thao tác hiệu chỉnh thường ngày.

## Kiểm định và tiêu chí nghiệm thu

Tạo bộ ca thử đại diện, không chỉ một frame:
- một nhân vật thân code và một nhân vật thân AI;
- ít nhất mũ + áo/giáp + đồ lưng/ống tên + bùa + cánh + vũ khí;
- đứng, chạy, đánh, lăn/ngã nếu animation có tồn tại;
- thử mặc nhiều món đồng thời để phát hiện xung đột layer.

Kiểm tra:
- đồ không bay khỏi cơ thể hoặc rung/nhảy vô cớ giữa frame;
- không xuyên qua đầu/thân ở vùng cần che;
- mũ/mặt nạ khớp vị trí;
- áo/giáp không bị kéo méo bất hợp lý;
- đồ lưng và cánh không nằm sai phía;
- tay nắm đúng vũ khí;
- kích thước canvas, anchor chân và hitbox không bị thay đổi ngoài chủ đích;
- asset cũ không có cấu hình mới vẫn chạy như trước;
- cấu hình đã lưu tải lại chính xác.

## Cách làm việc

1. Trước khi sửa, đọc toàn bộ các file liên quan trong ZIP và tìm mã nguồn thật trong repo hiện tại.
2. Viết báo cáo ngắn: nguyên nhân gốc, các file cần sửa, rủi ro tương thích và phương án tối thiểu.
3. Triển khai từng bước trên kiến trúc hiện có; không viết lại toàn bộ pipeline.
4. Không thay hàng loạt asset. Chỉ dùng asset thử và một bộ trang bị mẫu để chứng minh cách ghép hoạt động trước.
5. Giữ tương thích định dạng `.sprite.json` hiện có; mọi trường mới phải tùy chọn và có giá trị mặc định an toàn.
6. Không ghi đè sprite/asset đã duyệt nếu chưa có bản xem trước và xác nhận.
7. Báo rõ phần nào đã sửa thật, phần nào chỉ là đề xuất, phần nào cần vẽ lại asset.
