# LINH KHÍ — Báo cáo cố vấn sản phẩm, gameplay và mỹ thuật
**Góc nhìn:** cố vấn sản phẩm cho một studio game có tiêu chuẩn vận hành cấp doanh nghiệp  
**Phạm vi:** rà soát gói `linh-khi-toan-bo.zip` — tài liệu thiết kế, kế hoạch cải thiện, báo cáo chơi thử, ảnh chụp và mã nguồn được đóng gói.  
**Ngày đánh giá:** 11/10/2026  
**Loại báo cáo:** tư vấn chiến lược và ưu tiên; không sửa mã nguồn, không thay quyết định đã chốt.

---

## 1. Kết luận dành cho chủ dự án

**Linh Khí có nền móng sản phẩm đáng phát triển, nhưng chưa nên coi là bản sẵn sàng phát hành rộng.** Điểm mạnh là bản sắc dân gian Việt, cấu trúc roguelite đã có nhiều hệ thống, bốn loại vũ khí có hành vi riêng, trùm có báo trước đòn và một làng tạo cảm giác thế giới sống. Điểm nghẽn hiện tại không phải thiếu tính năng; đó là **độ rõ khi chơi trên điện thoại, độ nhất quán giữa các hệ thống, và độ tin cậy của bằng chứng nghiệm thu**.

Báo cáo chơi thử trong gói chấm bản `lk-2026.10.09` ở mức **6,5/10**; đây là mốc tham khảo của bản ngày 10/10, không được hiểu là điểm của toàn bộ thay đổi ngày 11/10. Những cải thiện sau đó đã mở rộng sân đấu, thêm màn hình tải, cho phép chơi ngay và thay đổi nhiều thành phần đồ họa, nhưng chưa có bằng chứng chơi trên iPhone thật cho toàn bộ bản mới.

### Quyết định chiến lược

1. **Chưa mở rộng thêm hệ thống lớn.** Không ưu tiên thêm vũ khí, kỹ năng, vật tương tác hoặc cơ chế mới trước khi các vòng chơi hiện tại dễ đọc và đáng tin.
2. **Ưu tiên một “vertical slice” hoàn chỉnh:** vào game nhanh → hiểu mục tiêu → đánh một phòng → né đòn → nhận thưởng → nâng cấp → đánh trùm → hiểu vì sao thắng/thua.
3. **Giữ nguyên các quyết định đã duyệt:** canvas 480×270, pixel art, bảng màu lõi, sân phòng thường khoảng 300 px, phương án áo đổi thân theo bộ, tile rừng thử nghiệm có cờ tắt, trạng thái trên thân quái theo brief. Báo cáo này không đề xuất mở lại các quyết định đó.
4. **Chỉ gọi một hạng mục là “xong” khi có bằng chứng:** kiểm tra tự động phù hợp, ảnh trước/sau, số đo trên bản đóng gói và kiểm thử thiết bị thật ở những hạng mục phụ thuộc cảm ứng/màn hình.

---

## 2. Chấm điểm theo góc nhìn sản phẩm

Các điểm dưới đây là đánh giá tư vấn, không phải kết quả kiểm thử mới.

| Trục đánh giá | Điểm tham khảo | Nhận định |
|---|---:|---|
| Bản sắc và tiềm năng IP | 8/10 | Dân gian Việt, làng, trùm và tên gọi có chất riêng; có khả năng tạo nhận diện nếu hình ảnh được thống nhất |
| Độ đầy đủ hệ thống | 7/10 | Nhiều màn, đồ, nâng cấp, vũ khí, bản đồ và hoạt động làng; nguy cơ nhiều hệ thống hơn mức người chơi mới hiểu được |
| Cảm giác chiến đấu | 6,5/10 | Có nền tảng tốt về báo trước, phản hồi đòn và né; còn điểm yếu về nhịp nhập liệu, tính công bằng và độ rõ trong giao tranh |
| Độ đọc trên điện thoại | 5,5/10 | Là điểm nghẽn lớn: chữ nhỏ, hiệu ứng/chữ có thể chồng nhau, một số đối tượng khó phân biệt ở kích thước thực |
| Nhịp roguelite và tiến trình | 6/10 | Có vòng lặp đủ thành phần nhưng báo cáo cũ ghi nhận lặp phòng, phần lớn lượt là chơi lại và hướng dẫn sau thất bại chưa đủ chính xác |
| Mỹ thuật nhất quán | 6,5/10 | Asset riêng lẻ có tiềm năng, nhưng chênh lệch mật độ pixel/độ chi tiết giữa em bé, quái, vũ khí, nền và người làng làm game chưa giống một sản phẩm thống nhất |
| Độ tin cậy phát hành | 6/10* | Có quy trình build và kiểm tra một số luồng; thiếu bằng chứng thiết bị thật và tài liệu hiện có chưa hoàn toàn đồng bộ |

\*Điểm độ tin cậy là nhận định từ hồ sơ kiểm thử, không phải kiểm toán bảo mật hay xác nhận chất lượng bản live.

**Thông điệp:** không cần “thêm nhiều thứ” để nâng chất lượng. Cần làm cho thứ đã có hoạt động rõ, công bằng và liền mạch.

---

## 3. Năm rủi ro kinh doanh/sản phẩm lớn nhất

### R1 — Người chơi không hiểu điều gì vừa xảy ra trong trận
**Mức ưu tiên: P1 — xử lý trước khi đánh bóng mỹ thuật.**

Báo cáo cũ nêu chữ nhỏ, thông báo đè thanh máu/đầu trùm, số sát thương chồng nhau, màu đỏ vừa dùng cho nút hành động vừa dùng cho nguy hiểm, và một số quái tối chìm vào nền. Đây là vấn đề trực tiếp làm giảm khả năng học game và cảm giác công bằng.

**Tư vấn:**
- Thiết lập thứ bậc thị giác cố định: báo đòn sắp tới > nhân vật/quái > máu trùm và trạng thái quan trọng > sát thương > thông tin phụ.
- Không đặt chữ phụ lên vùng đánh nhau. Thông báo chiến đấu phải có vùng dành riêng và giới hạn số thông báo cùng lúc.
- Màu không được là tín hiệu duy nhất: dùng thêm hình dạng, nhịp chớp hoặc hoa văn để người mù màu vẫn đọc được.
- Nghiệm thu ở kích thước hiển thị thực trên điện thoại, không chỉ ở ảnh phóng to.

**Chỉ số nghiệm thu đề xuất:** trong một trận có 4 quái và 2 hiệu ứng trạng thái, người thử phải chỉ đúng quái đang bị độc/cháy/băng và vùng nguy hiểm trong vòng 1 giây ở ít nhất 9/10 tình huống thử. Đây là mục tiêu kiểm thử đề xuất, chưa phải kết quả hiện tại.

### R2 — Cảm giác chiến đấu chưa được chứng minh trên thiết bị mục tiêu
**Mức ưu tiên: P1.**

Báo cáo chơi thử có dấu hiệu búa dễ bị giữ lấy đà quá lâu, cung yếu khi quái áp sát, kỹ năng thường cạn mana sớm và một số thao tác có thể mất lượt bấm. Tuy nhiên, một phần số liệu dựa trên bot và giả lập; không nên biến các dấu hiệu này thành kết luận cân bằng cuối cùng.

**Tư vấn:**
- Trước khi chỉnh sát thương, tách vấn đề thành ba lớp: **đầu vào** (bấm/nhả/giữ), **phản hồi** (hoạt ảnh, âm thanh, hit-stop) và **cân bằng** (sát thương, mana, thời gian hồi).
- Đo từ lúc chạm đến lúc hành động bắt đầu; kiểm riêng kiếm, cung, giáo, búa, đặc biệt và né.
- Chơi thử bằng người thật với cùng một nhóm quái, cùng cấp trang bị; không kết luận từ một lượt duy nhất.
- Giữ nguyên luật gameplay ngoài phạm vi đã duyệt cho tới khi có dữ liệu đủ tốt để quyết định.

**Chỉ số nghiệm thu đề xuất:** 10 người thử mới, mỗi người chơi tối thiểu 2 lượt với hai loại vũ khí; ghi lại thao tác thất bại, lý do chết, mức hiểu báo đòn và vũ khí họ muốn dùng lại. Mẫu này nhỏ nhưng hữu ích hơn việc chỉ xem bot.

### R3 — Vòng lặp có nhiều nội dung nhưng thiếu khác biệt đủ mạnh giữa các lượt
**Mức ưu tiên: P1 sau khi độ đọc trận ổn định.**

Báo cáo cũ ghi nhận khoảng 70% lượt chơi là chơi lại, phần lớn phòng tập trung vào đánh hết quái và địa hình chưa tạo nhiều quyết định chiến thuật. Đây là dữ liệu của bản được chơi ngày 10/10, cần đo lại sau các thay đổi mới.

**Tư vấn:**
- Không vội thêm hàng loạt loại phòng. Trước tiên xác định mỗi phòng đang tạo ra quyết định nào: chiến đấu, chọn rủi ro, hồi phục, đổi trang bị, đổi đường đi hay đổi chiến thuật.
- Mỗi vùng nên có một “ngữ pháp chiến đấu” riêng: địa hình, nhịp tấn công, kiểu kẻ địch và phần thưởng phải hỗ trợ cùng một chủ đề.
- Phần thưởng phải khiến người chơi cân nhắc, không chỉ tăng chỉ số. Một món mạnh rơi sớm không nên làm vô hiệu hóa toàn bộ thử thách.
- Sau khi dữ liệu cơ bản ổn định, mới thử nghiệm một biến thể phòng hoặc một lựa chọn rủi ro/phần thưởng, thay vì triển khai nhiều hệ thống cùng lúc.

**Chỉ số cần theo dõi:** thời gian một lượt, tỷ lệ qua từng ải, tỷ lệ chết theo nguyên nhân, tỷ lệ chọn từng vũ khí/hệ, số lượt chơi lại trước khi qua trùm và phần trăm phòng mà người chơi đánh giá là “khác biệt”.

### R4 — Mỹ thuật tốt ở từng asset nhưng chưa thành một ngôn ngữ hình ảnh duy nhất
**Mức ưu tiên: P1, làm theo cụm có tác động cao.**

Hồ sơ ghi nhận chênh lệch giữa em bé ít chi tiết và quái nhiều chi tiết; cỡ pixel khác nhau giữa nhân vật, người làng, nền và chữ; vũ khí có lúc quá lớn; màu nền rừng có thể làm quái độc hoặc Chồn Bóng chìm. Việc đã có bảng màu lõi là một nền tảng tốt nhưng chưa tự động giải quyết được các vấn đề này.

**Tư vấn:**
- Giữ asset đã duyệt; không vẽ lại tràn lan. Ưu tiên điều chỉnh lớp nền, hiệu ứng, cách ghép, độ tương phản và thứ bậc trước.
- Dùng một chuẩn kiểm duyệt asset: silhouette ở kích thước game, số màu, độ dày viền, vùng sáng tối, hướng sáng, tỷ lệ chi tiết và khả năng đọc trên nền thực.
- Đánh giá asset trong game và trên nền cuối cùng, không duyệt chỉ bằng sprite sheet nền trong suốt.
- Đối với tile rừng, chỉ bật mặc định khi đã kiểm tra lát lặp, lật ngang, góc tường, 5 phòng liên tiếp và hiệu năng; nếu không đạt thì giữ cờ tắt như quyết định hiện tại.

### R5 — Tài liệu và bằng chứng nghiệm thu không hoàn toàn đồng bộ
**Mức ưu tiên: P0 về quản trị phát hành.**

Gói có tài liệu tổng hợp ngày 10/10, trong khi gói giới thiệu bản `lk-2026.10.11-1001` và có báo cáo các đợt ngày 11/10. Một số kết luận trong tổng hợp cũ đã bị tài liệu/code mới thay đổi. Ví dụ, báo cáo tổng hợp cũ còn mô tả luồng “Chơi tạm” là lỗi đang mở, trong khi `village.js` của gói mới ghi rõ đã chuyển sang “Chơi ngay” bằng tài khoản khách. Đồng thời, brief đợt tile rừng và brief trạng thái trên thân có trong gói nhưng không thấy báo cáo nghiệm thu tương ứng ở thư mục báo cáo đợt 6/7; mã nguồn được đóng gói cũng chưa thể hiện các cờ `G.TILE_RUNG` và `G.TRANG_THAI_TREN_THAN` theo đúng tên trong brief.

**Tư vấn:**
- Tạo một trang trạng thái duy nhất: `Đã triển khai`, `Đã kiểm`, `Chưa kiểm`, `Đang thử`, `Đã quyết định nhưng chưa làm`.
- Mỗi mục ghi phiên bản/commit, người thực hiện, đường dẫn báo cáo, tiêu chí nghiệm thu và cách quay lui.
- Không lấy brief làm bằng chứng đã triển khai; không lấy build thành công làm bằng chứng gameplay đã đạt.
- Chọn một mốc đóng gói duy nhất cho đánh giá phát hành; các ảnh chụp ngày 09/10 phải được ghi rõ là ảnh của bản trước khi mở rộng sân.

---

## 4. Đánh giá riêng các thay đổi mới ngày 11/10

### 4.1. “Chơi ngay” và màn hình tải
**Hướng đi đúng.** Cho người chơi thử trước khi bắt đăng nhập giảm ma sát vào game. Màn hình tải cũng xử lý cảm giác trang trắng khi gói lớn đang tải.

**Cần kiểm thêm:** Google thật trên Safari/iPhone, mở từ Zalo/Messenger, trường hợp Firebase chậm hoặc mất mạng, khách chơi rồi liên kết tài khoản đã có tiến trình, và tình huống hai bản lưu khác nhau. Kiểm giả lập không thay thế được kiểm trên tài khoản/thiết bị thật.

### 4.2. Sân đấu 300 px
**Giữ quyết định hiện tại.** Báo cáo đợt 2 cho biết sân rộng 300 px tương đương 62,5% chiều rộng canvas nhưng chỉ khoảng 51,3% bề ngang màn hình 844 px. Điều này không tự động có nghĩa là cần mở rộng thêm: hai bên còn chứa nút, máu và bản đồ, trong khi mở rộng tiếp có thể làm chúng chồng lên sân.

**Cần kiểm thêm:** mức dễ đọc của quái, kích thước nhân vật trên thiết bị thật, vùng chạm, chữ ở mép dưới và bố cục ở tỷ lệ màn hình khác nhau.

### 4.3. Thân trang phục theo bộ và ghép vũ khí
**Hướng “áo đổi thân, món khác ghép theo điểm neo” hợp lý**, vì tránh phải ghép áo rời theo từng khung. Nhưng báo cáo đợt 3 cho biết chưa có thân bộ AI thật trong gói kiểm đó và kiếm chưa khớp ở một số khung lấy đà/đánh/trúng đòn. Vì vậy, không nên tuyên bố hệ trang phục hoàn chỉnh chỉ dựa trên thân mô phỏng.

**Cần kiểm thêm:** 4 em bé × 3 bộ, các hàng chuyển động, lăn/ngã, áo cùng bộ và khác bộ, vũ khí đủ 4 loại, và trạng thái thiếu asset. Phải kiểm với ảnh cuối cùng sẽ phát hành.

### 4.4. Tile sàn rừng và trạng thái trên thân quái
**Xem là hạng mục thử nghiệm, chưa mặc định là đã nghiệm thu.** Trong gói hiện có brief chi tiết và quy trình dự kiến, nhưng không thấy báo cáo nghiệm thu đợt 6/7. Mã nguồn đóng gói chưa thể hiện cờ `G.TILE_RUNG` hoặc `G.TRANG_THAI_TREN_THAN` đúng theo brief. Cần đối chiếu commit thực tế trước khi giao tiếp như tính năng đã hoàn thành.

**Tiêu chí quyết định bật:** không có khe mép; không thấy hoa văn lặp rõ qua 5 phòng; không mất viền quái; trạng thái vẫn phân biệt khi có hai hiệu ứng; FPS không giảm; tắt cờ trả lại đúng hành vi cũ. Nếu chưa đủ bằng chứng, giữ cờ tắt.

### 4.5. Mục tiêu dung lượng
Quyết định trong tài liệu nêu trần khoảng 20 MB nếu có tải ảnh sau, hoặc 15 MB nếu vẫn gói một tệp. Hồ sơ cũ ghi gói khoảng 10,4 MB và ước tính có thể tăng thêm, nhưng chưa đủ số đo cuối cùng để xác nhận bản mới đạt trần.

**Khuyến nghị:** đo cả kích thước tệp nguồn, kích thước truyền sau gzip, thời gian tải ở mạng 1,5 Mbps và thời điểm người chơi có thể thao tác. Không tối ưu bằng cách giảm chất lượng asset một cách đại trà; chỉ tách tải sau khi chứng minh cải thiện thời gian vào game.

---

## 5. Kế hoạch ưu tiên theo tác động/rủi ro

### P0 — Trước khi công bố rộng
1. **Đóng băng một bản ứng viên phát hành** và ghi commit/phiên bản rõ ràng.
2. **Đồng bộ hồ sơ trạng thái:** cập nhật `TONG-HOP.md` để không mâu thuẫn với báo cáo ngày 11/10 và mã nguồn hiện có.
3. **Rà soát an toàn tiến trình:** bản local/cloud khác nhau, tài khoản khách liên kết Google, đăng nhập trên máy mới, `cloud=0`, dữ liệu cũ, lỗi ghi và khôi phục.
4. **Kiểm luồng vào game trên iPhone thật:** Safari, mở từ ứng dụng nhắn tin, mạng chậm và mất mạng.
5. **Xác nhận khả năng quay lui** cho từng thử nghiệm đồ họa có cờ tắt.

### P1 — Tác động trực tiếp đến trải nghiệm
6. **Độ đọc chiến đấu:** chữ, thanh máu, số sát thương, vùng báo đòn và hiệu ứng trạng thái không che nhau.
7. **Điều khiển:** đo chạm/nhả/giữ cho 4 vũ khí và né; sửa lỗi nhập liệu đã xác nhận trước khi cân bằng sát thương.
8. **Công bằng của trùm:** tái kiểm tra sát thương một đòn, thời lượng báo trước và cửa sổ choáng theo pha.
9. **Mỹ thuật trong ngữ cảnh:** kiểm silhouette, tương phản nền, kích thước vũ khí và hiệu ứng ở độ phân giải chơi thật.
10. **Tile và trạng thái thân quái:** nghiệm thu độc lập, không gộp chung với đợt khác nếu chưa đạt.

### P2 — Sau khi P0/P1 ổn định
11. Cải thiện khác biệt giữa phòng và vùng.
12. Tinh chỉnh kinh tế, sức mạnh khuyên dùng và giá trị vũ khí theo dữ liệu chơi.
13. Hoàn thiện âm thanh/rung phản hồi nếu phù hợp nền tảng và có kiểm soát trong cài đặt.
14. Mở rộng asset môi trường sang vùng khác sau khi tile Rừng được chứng minh đạt.

**Nguyên tắc vận hành:** chỉ nên có tối đa 2–3 luồng thay đổi song song nếu cùng đụng vào các tệp gameplay hoặc giao diện. Các luồng tạo asset có thể chạy song song, nhưng phải có quy chuẩn, người duyệt và mốc tích hợp riêng.

---

## 6. Bộ chỉ số cần có trước khi quyết định phát hành

| Chỉ số | Cách đo tối thiểu | Vì sao quan trọng |
|---|---|---|
| Tỷ lệ vào được trận đầu | Người mở link → bắt đầu điều khiển; tách theo Safari/Chrome và nguồn mở link | Đo ma sát đầu phễu |
| Thời gian tới thao tác đầu tiên | Mạng 1,5 Mbps và mạng thường; tính từ lúc mở link | Đo tác động gói tải |
| Tỷ lệ hoàn thành ải 1 | Người mới, không dùng bản lưu mở khóa | Đo hướng dẫn và độ khó ban đầu |
| Nguyên nhân thất bại | Báo đòn, độc/gai, áp sát, thao tác, thiếu sát thương, lỗi khác | Tránh cân bằng dựa trên cảm giác |
| Tỷ lệ sử dụng vũ khí/hệ | Theo lượt và theo tỷ lệ thắng | Phát hiện lựa chọn vượt trội hoặc bị bỏ |
| Độ đọc hiệu ứng | Bài thử nhận diện trạng thái và vùng báo đòn | Đảm bảo mỹ thuật hỗ trợ gameplay |
| FPS và độ ổn định | Thiết bị mục tiêu, phòng 6 quái, hiệu ứng dày, đo tối thiểu 10 giây | Phát hiện chi phí đồ họa |
| Kích thước tải thực | Tệp nguồn, gzip, tải ban đầu và tải sau | Đảm bảo mục tiêu dung lượng |
| Tỷ lệ lỗi lưu/khôi phục | Kiểm tự động và các ca tài khoản thật được kiểm soát | Bảo vệ tiến trình người chơi |

Không cần xây hệ thống phân tích phức tạp ngay lập tức. Giai đoạn đầu có thể dùng checklist chơi thử, bản lưu thử và bảng tổng hợp thủ công; điều quan trọng là định nghĩa số đo nhất quán.

---

## 7. Cổng nghiệm thu đề xuất

Không chuyển sang phát hành rộng chỉ vì build thành công. Dùng ba cổng:

### Cổng A — Kỹ thuật và dữ liệu
- Build thành công, không lỗi cú pháp.
- Bản lưu cũ vẫn đọc được; các tình huống local/cloud không tự ý làm mất tiến trình.
- Có phương án quay lui cho thay đổi có rủi ro.
- Không có lỗi chặn người chơi vào game đã biết.

### Cổng B — Trải nghiệm trên điện thoại
- Người mới có thể vào trận và hiểu hành động tiếp theo mà không cần đọc hướng dẫn dài.
- Vùng báo đòn, trạng thái quái, thanh máu và số sát thương đọc được ở kích thước thật.
- Nút bấm không chồng lấn và thao tác giữ/nhả được kiểm trên thiết bị thật.
- Tile, vũ khí ghép và trang phục được kiểm trong trận, không chỉ trên trang công cụ.

### Cổng C — Chất lượng vòng lặp
- Trùm không có đòn gây chết bất ngờ trái với tín hiệu báo trước.
- Thua trận cho lời khuyên đúng với nguyên nhân thất bại.
- Không có một món rơi sớm làm mất ý nghĩa của nhiều nâng cấp tiếp theo.
- Người thử có thể nói được vì sao họ thắng/thua và muốn thử lại với lựa chọn nào.

Các ngưỡng số cụ thể nên được chốt sau khi có đường cơ sở trên thiết bị thật; không nên tự đặt KPI kinh doanh như retention/D1 khi chưa có lượng người chơi và dữ liệu đủ tin cậy.

---

## 8. Những việc chưa nên làm

- Không thêm nhiều hệ thống mới chỉ để game trông “lớn hơn”.
- Không cân bằng gameplay từ một lượt bot hoặc một ảnh chụp.
- Không tuyên bố tile seamless chỉ vì prompt có chữ “tileable”; phải ghép và kiểm mép.
- Không tuyên bố trạng thái trên thân đã xong nếu chưa kiểm đồng thời trên nền rừng và khi có nhiều trạng thái.
- Không thay thế hàng loạt asset đã duyệt chỉ vì muốn đồng nhất; ưu tiên các thay đổi rẻ, đảo ngược được và có tác động lớn.
- Không coi tài liệu brief, ảnh concept hay build thành công là bằng chứng nghiệm thu cuối cùng.
- Không phát hành rộng trước khi kiểm đăng nhập/lưu mây và thao tác trên thiết bị thật.

---

## 9. Kết luận cuối

**Linh Khí nên được phát triển theo hướng “ít lỗi hơn, dễ đọc hơn, có bản sắc hơn” thay vì “nhiều tính năng hơn”.** Tài sản quý nhất hiện tại là nền tảng gameplay đã khá đầy đủ cùng chất liệu dân gian Việt Nam. Nếu ưu tiên đúng, game có thể nâng chất lượng đáng kể mà không phải viết lại engine hoặc phá các quyết định mỹ thuật đã duyệt.

Thứ tự khuyến nghị: **(1) đóng gói và đồng bộ bằng chứng → (2) bảo vệ tiến trình và kiểm thiết bị thật → (3) sửa độ đọc/đầu vào chiến đấu → (4) nghiệm thu tile và trạng thái thân quái → (5) cân bằng vòng lặp bằng người chơi thật → (6) mở rộng nội dung.**

Bản đánh giá này dựa trên ZIP được cung cấp, trong đó có tài liệu và mã nguồn đóng gói. Các vấn đề được ghi là “cần kiểm” không được xem là lỗi đã tái hiện trên bản live; cần đối chiếu commit triển khai và kiểm thử thực tế trước khi ra quyết định phát hành.
