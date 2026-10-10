# PROMPT CHO CLAUDE — RÀ SOÁT VÀ CHỈNH SỬA MỸ THUẬT GAME LINH KHÍ

## 1. Vai trò và mục tiêu

Bạn là game artist/technical artist chuyên pixel art 2D. Hãy đọc toàn bộ tài liệu yêu cầu, bảng màu và ảnh tham chiếu trong bộ `linh-khi-xin-y-kien-hinh-anh.zip`, sau đó thực hiện các thay đổi mỹ thuật trong dự án LINH KHÍ theo hướng dẫn này.

Mục tiêu: cải thiện độ rõ hình, khả năng nhận diện, phân cấp thị giác và cảm giác chiến đấu, nhưng **không làm thay đổi gameplay**.

Đây là yêu cầu thực hiện công việc trên dự án, không phải chỉ viết một bản góp ý. Hãy kiểm tra code và asset hiện có, xác định cách triển khai phù hợp với kiến trúc dự án rồi mới sửa. Không tự ý tái cấu trúc các hệ thống không liên quan.

## 2. Nguồn sự thật và quy tắc ưu tiên

Trước khi sửa:
1. Đọc `XIN-Y-KIEN-HINH-ANH.md`, `GUI-CHATGPT-GOP-Y.md`, `BANG-MAU.md` và mọi tài liệu liên quan trong ZIP.
2. Xem toàn bộ ảnh trong thư mục `anh/`, đặc biệt ảnh em bé, quái rừng/biển/lâu đài, trùm, nền và các ảnh `hieu-ung-day-nhat*`.
3. Kiểm tra dự án thực tế: cấu trúc thư mục, cách vẽ sprite, bảng màu, animation, particle pool, va chạm và thời gian tấn công.
4. Nếu hướng dẫn này mâu thuẫn với logic gameplay đang có, giữ gameplay và hỏi/ghi rõ điểm xung đột; không tự quyết định đổi cơ chế.

Thứ tự ưu tiên:
- Ưu tiên 1: yêu cầu gốc và giới hạn kỹ thuật của dự án.
- Ưu tiên 2: không thay đổi gameplay, kích thước và timing đã được chốt.
- Ưu tiên 3: các đề xuất mỹ thuật trong prompt này.
- Mọi màu sắc, số hạt, kích thước hiệu ứng hoặc timing mới nêu ở dưới là **giá trị khởi điểm để thử nghiệm**, không được ghi đè cấu hình hiện có một cách mù quáng.

## 3. Những điều tuyệt đối không được thay đổi

- Không viết lại gameplay hoặc thiết kế lại hệ thống chiến đấu.
- Giữ thế giới ở độ phân giải 480×270.
- Giữ sprite nhân vật ở kích thước 22×33 px.
- Không tự ý đổi kích thước quái, hitbox/hurtbox, vùng va chạm, tầm đánh, sát thương, tốc độ, thời điểm trúng đòn, cooldown, thời lượng né, thời gian báo trước của đòn quái hoặc thời gian ra đòn.
- Không đổi luật spawn, AI, đường đi, cân bằng, loot hay progression.
- Không thay framework/engine, pipeline asset hoặc kiến trúc dự án chỉ để tiện sửa mỹ thuật.
- Không thêm thư viện, hệ thống hoặc asset bên ngoài nếu không cần thiết.
- Không làm mờ pixel art bằng blur, anti-aliasing hoặc gradient mịn.
- Không xóa asset cũ hàng loạt; giữ khả năng rollback.
- Không chỉ trả về kế hoạch hoặc pseudo-code. Hãy thực hiện những sửa đổi an toàn, có thể kiểm tra được trong phạm vi yêu cầu.

Nếu một cải tiến có nguy cơ tác động gameplay, hãy giữ nguyên logic và chỉ sửa phần trình bày hình ảnh. Nếu không thể xác định an toàn, ghi rõ và để nguyên phần đó.

## 4. Chẩn đoán mỹ thuật cần giải quyết

Các vấn đề chính cần kiểm tra và xử lý:
- Bốn em bé khó phân biệt khi nhìn nhanh; chỉ đổi màu áo là chưa đủ.
- Quái thường và tinh anh có nhiều chi tiết cùng độ sáng, khiến silhouette không rõ.
- Nền lâu đài quá đỏ/tối; thân quái dễ hòa vào nền và lửa mất vai trò điểm nhấn.
- Hiệu ứng đánh chồng chéo trong cảnh đông quái; vệt đánh, chưởng, hạt, số sát thương và vùng báo trước tranh sự chú ý.
- Đòn thường, đòn nặng, chí mạng và đánh vào khiên chưa có ngôn ngữ thị giác khác biệt đủ rõ.
- Ba trùm cần silhouette, mặt/điểm nhận diện và các bộ phận đặc trưng dễ đọc hơn.
- Kiếm, cung, giáo và búa phải tạo cảm giác thị giác khác nhau ngay cả khi tắt số sát thương.
- Nền cần có màu sắc tươi và phân lớp rõ hơn, nhưng không được sáng đồng loạt đến mức lấn nhân vật.

Nguyên tắc tổng quát: **hình khối trước, chi tiết sau; silhouette trước màu; phân cấp trước độ sáng; giảm nhiễu trước khi thêm hiệu ứng.**

## 5. Quy tắc pixel art chung

- Ở kích thước gốc, ưu tiên silhouette dễ đọc trong khoảng 0,5 giây.
- Viền chính thường 1 px ở kích thước gốc; tránh viền sáng dày quanh toàn bộ hình.
- Dùng 3 nấc sáng cho từng chất liệu: tối, trung gian, sáng. Tỷ lệ tham khảo: tối 55–65%, trung gian 25–35%, sáng 5–15%; điều chỉnh theo asset.
- Hướng sáng thống nhất từ phía trên/phải; cạnh dưới/trái tối hơn.
- Mỗi nhân vật/quái có một điểm nhận diện chính và tối đa một vài điểm phụ.
- Tránh noise từng pixel không có chức năng. Mỗi pixel cần giúp diễn tả hình khối, chất liệu hoặc chuyển động.
- Giữ các cạnh pixel rõ, không dùng blur/anti-aliasing.
- Nền có thể phong phú nhưng vùng quanh nhân vật và điểm nguy hiểm phải ít nhiễu hơn.
- Màu trong prompt là bảng đề xuất. Kiểm tra với `BANG-MAU.md` trước khi áp dụng; không thay palette dự án nếu tài liệu gốc quy định khác.

## 6. Bốn em bé — silhouette phải khác nhau

Giữ kích thước 22×33 px. Không thay gameplay hoặc hitbox. Thử silhouette ở dạng một màu đen trước khi thêm chi tiết.

### 6.1 Thợ Rèn
- Dáng thấp, chắc, trọng tâm thấp; đầu/mũ tròn và vai rộng.
- Túi dụng cụ hoặc búa nhỏ lệch ở lưng, không che silhouette chính.
- Bảng màu gợi ý: đỏ `#8c1c1f`, `#d2362e`, `#f47a62`; kim loại `#e2b64e`.
- Animation có cảm giác nặng, bước ngắn; không thay đổi thời gian animation/tấn công hiện hữu.

### 6.2 Thợ Săn
- Dáng cao và hẹp hơn; mũ trùm/chóp vải khác hẳn mũ Thợ Rèn.
- Cung hoặc ống tên tạo đường chéo nhận diện rõ.
- Bảng màu gợi ý: `#315b3c`, `#4f8951`, `#a7cf78`; dây cung `#d9c9a1`.
- Chuyển động linh hoạt, nghiêng người khi chạy/kéo cung nhưng không thay tốc độ hoặc thời gian bắn.

### 6.3 Thầy Lang
- Đầu/khăn tròn, thân áo mềm; túi thuốc hoặc bó lá ở lưng.
- Bảng màu gợi ý: `#286b70`, `#43a39a`, `#9ce5c7`; túi `#8a5a39`.
- Có thể cho túi thuốc đung đưa nhẹ nếu pipeline cho phép mà không đổi timing.

### 6.4 Đô Vật
- Thân bè ngang, vai rộng, chân tách rộng, trọng tâm thấp.
- Khăn buộc đầu và đai lưng là dấu hiệu chính; tránh dùng mũ trùm giống các nhân vật khác.
- Bảng màu gợi ý: `#7d382b`, `#b85b40`, `#ed9a61`; đai `#d9a441`.
- Tư thế nặng, chắc; không đổi tốc độ, tầm đánh hay hitbox.

### Kiểm tra nhân vật
- Chụp bốn nhân vật ở kích thước 22×33 px, nền trung tính và dạng silhouette đen.
- Kiểm tra ở zoom 100% và 200%; không đánh giá chỉ từ ảnh phóng to quá mức.
- Giữ các animation/state hiện có. Nếu chỉnh sprite sheet, bảo toàn frame count, anchor/origin và thứ tự frame mà gameplay phụ thuộc.
- Không kéo dài đòn đánh chỉ để tạo cảm giác nặng hơn.

## 7. Quái thường và tinh anh

Quy tắc chung:
- Quái thường: 2–4 màu chính và một màu nhấn.
- Tinh anh giữ nhận diện loài, chỉ thêm 1–2 dấu hiệu cấp bậc lớn (giáp, sừng, lõi, vòng chân hoặc mắt).
- Viền ngoài 1 px nếu phù hợp phong cách; bóng chân tối, không quá đặc.
- Mắt/điểm nhận diện phải còn đọc được khi ảnh thu nhỏ 50%.
- Tránh rải nhiều chấm sáng li ti trên toàn thân.
- Không thay kích thước sprite/hitbox hoặc hành vi quái.

Các mẫu định hướng:
- **Heo Rừng Con:** thân nâu, mõm tách rõ, nanh sáng; tinh anh có nanh dài và mảng giáp vai.
- **Sứa Bom:** chuông xanh lam, lõi sáng nhỏ, xúc tu tối hơn thân; báo nổ nhấn lõi chứ không chớp trắng cả thân.
- **Lính Ma Giáp Gỉ:** thép xám, gỉ nâu đỏ, mắt hoặc khe mũ là điểm sáng; tinh anh thêm một dấu hiệu giáp lớn.
- **Nấm Phồng:** mũ nấm là khối chính, thân đơn giản; bào tử sáng chỉ tập trung ở các cụm có chủ đích.

Màu gợi ý cần đối chiếu palette dự án:
- Heo rừng: `#59402b`, `#916344`, `#c99a63`, bụng `#34251f`, nanh `#f5e6c5`.
- Sứa: `#315d8a`, `#4b8fc1`, `#9de8ef`, lõi `#e9f9ff`.
- Giáp gỉ: `#373d4b`, `#697386`, `#aab3bc`, gỉ `#99513c`.
- Nấm: `#724332`, `#b76b48`, `#f0c89c`, bào tử `#c4ef85`.

Đây là mẫu chuẩn hóa quy tắc, không phải yêu cầu thay toàn bộ quái bằng bốn mẫu này. Hãy dùng chúng để định hình quy tắc chung rồi áp dụng phù hợp cho các loài hiện có.

## 8. Ba trùm vùng

### 8.1 Mộc Tinh — Rừng già
- Tán cây gom thành 3–5 khối lớn; tránh hàng loạt chi tiết nhỏ có cùng độ sáng.
- Mặt/hốc mắt phải là một khối riêng, dễ đọc khi thu nhỏ.
- Rễ có 2–3 nhánh chính; không làm mọi rễ đều nhọn và sáng.
- Palette gợi ý: gỗ `#513725`, `#82583a`, `#b18a57`; lá `#287444`, `#49a34f`, `#a3d86c`; mắt `#e4f0a0`.

### 8.2 Ngư Tinh — Hang biển
- Silhouette dài ngang, đầu và thân có trọng lượng rõ; vây/đuôi tách thành mảng riêng.
- Giảm các đường vảy nhỏ, dùng vài dải lớn theo thân.
- Palette gợi ý: `#183c56`, `#2d6b88`, `#63b9cc`; lõi băng `#d8f6ff`.
- Đòn băng/lõi sáng không được khiến toàn bộ thân biến thành một mảng trắng.

### 8.3 Hồ Tinh — Lâu đài cổ
- Chín đuôi phải có hướng tách biệt; mỗi đuôi có khối tối, thân màu và đầu sáng.
- Chỉ 2–3 đuôi liên quan đòn hiện tại được sáng mạnh; không làm cả chín đuôi sáng tối đa cùng lúc.
- Mặt cáo và mắt là điểm nhận diện chính.
- Palette gợi ý: `#542b36`, `#9d4650`, `#e57a54`, lõi `#ffd23f`, điểm nóng `#fff3b0`.

Không thay đổi timing, vùng báo trước hoặc thời điểm gây sát thương của boss. Chỉ chỉnh phần hình ảnh trong các pha đã tồn tại.

## 9. Hiệu ứng chiến đấu — ưu tiên cao nhất

### 9.1 Phân cấp rõ ràng
- Đòn thường: 3–5 tia nhỏ, chớp ngắn, không rung màn hình mặc định.
- Đòn nặng: 5–8 tia, vệt dày hơn, có thể có khựng hình ngắn nếu dự án đã hỗ trợ và không làm đổi gameplay.
- Chí mạng: vòng sáng/tia vàng và phản hồi chữ rõ hơn, nhưng không phủ trắng toàn màn hình.
- Đánh vào khiên: tia nằm tại mặt khiên, hướng ngang theo mặt tiếp xúc; không dùng hiệu ứng máu/trúng thân.
- Chưởng tích lực có thể nhiều lớp hơn chưởng thường, nhưng không được che nhân vật hoặc vùng nguy hiểm.

### 9.2 Màu và thời lượng gợi ý
Các mốc dưới đây là tuổi thọ hình ảnh, không phải thời gian gây sát thương:
- Vệt kiếm thường: trắng thép `#e4e0d4`, lõi trắng; rộng 2–3 px, 3–5 hạt, 0,08–0,12 giây.
- Vệt kết chuỗi: thêm vàng `#ffd23f`; rộng 3–4 px, 5–7 hạt, 0,12–0,16 giây.
- Tên: lõi trắng xanh `#f4f8ff`, đuôi `#8fc6ff`; giữ đường bay hiện tại.
- Giáo: lõi thép `#d4dce8`; nhấn đường thẳng, 3–5 hạt khi va chạm.
- Búa: vàng đồng `#c89a3a`, lõi `#fff3b0`; vòng nứt khoảng 16–30 px, 8–12 hạt.
- Trúng thường: `#fff3df`, 3–5 tia, 0,06–0,09 giây.
- Trúng nặng: `#ffd23f`, 5–8 tia, 0,08–0,12 giây.
- Chí mạng: trắng/vàng, 7–10 tia, vòng 8–14 px, 0,10–0,16 giây.
- Phá giáp: xám thép `#aab3bc`, 4–7 mảnh góc cạnh, 0,12–0,20 giây.
- Lửa: `#fff3b0`, `#ffd23f`, `#ff7a2a`; 4–8 hạt cho đòn thường.
- Độc: `#e6ffc0`, `#6fcf3a`, `#2f6b1a`; 3–6 hạt, tối đa 2 lớp mây.
- Băng: `#ffffff`, `#9de8ff`, `#2b6ea3`; 4–7 mảnh tinh thể.
- Chưởng thường: 8–14 hạt, một vòng phép.
- Chưởng tích lực: 16–24 hạt, tối đa hai vòng phép.

Đừng áp dụng con số một cách cứng nhắc nếu engine dùng đơn vị khác; chuyển đổi phù hợp và ghi lại cách quy đổi.

### 9.3 Vùng báo trước đòn quái
- Dùng đỏ làm màu nguy hiểm: lòng `#ff2818`, alpha tham khảo 0,28–0,35; viền `#ff9680`.
- Ở gần thời điểm nổ, tăng độ rõ viền, không nhấp nháy liên tục.
- Hiệu ứng chớp khi trúng đòn tối đa khoảng 0,06–0,10 giây.
- Khi nhiều vùng nguy hiểm cùng xuất hiện, vùng sắp nổ nhất phải dễ thấy nhất; vùng còn xa giữ alpha thấp.
- Không thay đổi thời điểm nổ, thời lượng báo trước, phạm vi hay sát thương.

### 9.4 Giới hạn hạt và xử lý cảnh đông
- Tái sử dụng particle pool hiện có (tài liệu gốc nhắc đến kho 400 hạt); không tạo cấp phát mới liên tục nếu có thể tránh.
- Mục tiêu thử nghiệm: khoảng 90–120 hạt hoạt động trong cảnh chiến đấu thông thường. Đây là mục tiêu mỹ thuật/hiệu năng cần đo, không phải lý do để bỏ tín hiệu gameplay.
- Nếu vượt ngưỡng, giảm hạt trang trí, độc/cháy và vệt cũ trước; giữ nguyên đạn, vùng báo trước và phản hồi trúng đòn.
- Không tạo vòng nổ cho từng hạt nhỏ.
- Vệt đánh cũ phải tự tắt nhanh.
- Một sự kiện trúng đòn chỉ hiện một số sát thương, trừ khi cơ chế thật sự gây nhiều lần sát thương.
- Gộp rung màn hình; giữ giới hạn hiện có (tài liệu gốc nêu tối đa ±4 px nếu đúng với implementation hiện tại). Không cộng dồn rung vô hạn.

## 10. Nền và ba vùng

Không làm sáng toàn bộ nền. Tăng sắc độ và phân lớp trung gian; giảm nhiễu quanh nhân vật và khu vực nguy hiểm.

Bảng màu tham khảo, cần đối chiếu `BANG-MAU.md`:
- **Rừng già:** sàn `#343e2a`, `#414a31`, `#50563a`; vùng tối `#1b3021`, `#2d422b`, `#4b3928`; điểm sáng `#b8dc70`, `#e4f0a0`.
- **Hang biển:** sàn `#252f3b`, `#354453`, `#465767`; vùng tối `#101d2b`, `#1d3040`, `#2c4659`; điểm sáng `#6fbedb`, `#b6edfa`.
- **Lâu đài cổ:** sàn `#45403d`, `#514744`, `#60524b`; tường tối `#2b2528`, `#403234`, `#594342`; đuốc `#e5a75e`, `#ffc878`.

Quy tắc:
- Rừng: cỏ/nấm sáng ở rìa, tránh đặt điểm sáng ngay sau đầu nhân vật.
- Biển: tinh thể tập trung gần tường, giữa sàn ít chi tiết nước hơn.
- Lâu đài: tường đỏ rượu trầm, sàn xám ấm; màu nóng dành cho đuốc, mắt quái, vũ khí và đòn đánh.
- Giảm tối góc nếu vignette hiện tại quá nặng; không tạo khung đen dày.
- Biến thể màu nền chỉ nhẹ, tránh noise pixel vô nghĩa.
- Không xóa trang trí có ý nghĩa gameplay.

## 11. Bốn nhóm vũ khí

Không cần tạo 40 hệ hiệu ứng độc lập. Dùng chung hạ tầng hiện có và khác nhau ở hình học vệt, màu, điểm va chạm và nhịp thị giác.

- **Kiếm:** cung chém cong, ngắn và nhanh; trắng thép, nhát kết có điểm vàng.
- **Cung:** đường bay thẳng, đầu tên rõ, đuôi nhỏ; khi kéo có thể tăng sáng theo trạng thái hiện có.
- **Giáo:** vệt đâm thẳng, dài, đầu nhọn; ít hạt ngang.
- **Búa:** vệt ngắn nhưng dày, điểm va chạm nặng, bụi/vòng nứt tập trung ở mặt đất.

Ví dụ nhận diện đặc biệt:
- Kiếm Tre: vệt cong vàng nhạt, vài lá nhỏ.
- Gươm Rồng: gợi hình đầu rồng trong 1–2 frame, không thêm rồng lớn mỗi lần đánh.
- Nỏ Thần: tên có đầu sáng và đuôi thẳng.
- Cung Đàn Bầu: vòng âm nhỏ khi kéo căng.
- Đinh Ba: ba đường nhọn ngắn tại điểm đâm.
- Mái Chèo: vệt bản rộng, ít tia nhọn.
- Chày Giã Gạo: điểm va chạm vuông và bụi đất nhỏ.
- Trống Đồng: vòng sóng tròn; hoa văn chỉ xuất hiện ở cấp đặc biệt.

Các vũ khí khác kế thừa nhóm phù hợp và thêm tối đa một dấu hiệu dễ nhận diện. Không che đường đánh, nhân vật hoặc vùng báo trước.

## 12. Thứ tự triển khai

Làm theo từng bước nhỏ, kiểm tra và chụp ảnh trước/sau mỗi bước:

1. **Hiệu ứng cảnh đông:** giảm chồng chéo, rút ngắn vệt, phân cấp báo trước; không đổi gameplay.
2. **Lâu đài cổ:** điều chỉnh palette nền và thân quái để giảm đỏ/tối.
3. **Bốn em bé:** sửa silhouette và các điểm nhận diện, giữ 22×33 px.
4. **Quái mẫu:** chuẩn hóa Heo Rừng Con, Nấm Phồng, Sứa Bom, Lính Ma Giáp Gỉ rồi áp dụng quy tắc cho các loài tương ứng.
5. **Phản hồi trúng đòn:** tách thường/nặng/chí mạng/khiên.
6. **Ba trùm:** mặt, khối chính, hướng đuôi/vây/rễ và điểm sáng.
7. **Vũ khí:** phân biệt kiếm/cung/giáo/búa.
8. **Nền còn lại:** tinh chỉnh sau khi foreground đã rõ.

Không sửa tất cả cùng lúc. Mỗi bước phải có ảnh hoặc cách kiểm chứng cụ thể. Nếu dự án đang được người khác sửa song song, chỉ chỉnh file thuộc phạm vi mỹ thuật và kiểm tra `git status`/diff trước khi thay đổi. Không ghi đè thay đổi chưa commit của người khác; không reset, checkout đè hoặc xóa file của họ.

## 13. Kiểm tra nghiệm thu

Trước khi báo hoàn tất, xác nhận:
- [ ] Bốn em bé phân biệt được ở kích thước 22×33 px và bằng silhouette.
- [ ] Ảnh ở 50% vẫn nhận ra loại quái và điểm nhận diện.
- [ ] Nhân vật nổi khỏi nền Lâu đài cổ.
- [ ] Cảnh 12 quái với búa/chưởng/vùng báo trước vẫn đọc được em bé.
- [ ] Vùng báo trước không bị nhầm với lửa, vòng phép hoặc đồ rơi.
- [ ] Đòn thường, nặng, chí mạng và đánh khiên có phản hồi khác nhau.
- [ ] Ba trùm dễ nhận diện khi tắt hiệu ứng.
- [ ] Kiếm/cung/giáo/búa khác nhau khi tắt số sát thương.
- [ ] Ảnh trước/sau cùng độ phân giải, mức zoom và tình huống.
- [ ] Build/chạy thử thành công theo cách dự án hiện có.
- [ ] FPS và thời gian dựng khung hình không suy giảm đáng kể trên cấu hình mục tiêu.
- [ ] Không có thay đổi gameplay ngoài ý muốn; không có file của người khác bị ghi đè.

## 14. Báo cáo cuối cùng

Khi hoàn tất, trả lời bằng tiếng Việt và nêu:
1. Các file đã sửa và lý do.
2. Thay đổi hình ảnh trước/sau, theo từng nhóm.
3. Những yêu cầu đã hoàn tất và những yêu cầu chưa làm.
4. Kết quả build/test, hiệu năng nếu đo được; không tuyên bố đã test nếu chưa chạy.
5. Mọi xung đột hoặc điểm chưa chắc chắn.
6. Những thông số được giữ nguyên để bảo đảm gameplay.
7. Ảnh chụp hoặc cách tái hiện từng thay đổi nếu môi trường hỗ trợ.

Không chỉ tóm tắt prompt. Hãy bắt đầu bằng việc kiểm kê tài liệu/asset và cấu trúc dự án, sau đó triển khai tuần tự theo mục 12.
