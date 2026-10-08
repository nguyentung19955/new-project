# Linh Khí (tên tạm): bản thiết kế chi tiết

Bản 4, ngày 08/10/2026. Game phiêu lưu pixel nhìn ngang có chiều sâu, không nhảy, màn hình ngang, chơi trên điện thoại.

Bản này chốt các điểm còn mở của bản phác thảo đầu và đi vào chi tiết từng hệ thống. Mọi con số là giá trị khởi điểm để thử, sẽ phải chỉnh lại khi chơi thật.

1.  Các quyết định đã chốt
2.  Vòng lặp một ải
3.  Hệ nguyên tố
4.  Hệ thống vũ khí
5.  Hero
6.  Phát triển sức mạnh hero
7.  Trang bị
8.  Thiết kế boss
9.  Quái thường
10. Ải và bản đồ
11. Ải hướng dẫn
12. Màn hình và điều khiển
13. Làng
14. Nhiệm vụ, thành tựu và sổ yêu quái
15. Âm thanh
16. Bảng cân bằng
17. Danh sách hình cần vẽ
18. Lộ trình làm game
19. Rủi ro

## 1. Các quyết định đã chốt

| Hạng mục | Quyết định | Lý do |
|---|---|---|
| Góc nhìn | Nhìn ngang có chiều sâu: nhân vật vẽ nhìn ngang, chạy được trái phải và lên xuống trên một dải mặt đất. Không có nhảy. | Boss vẫn cao to, nhân vật chỉ vẽ một hướng rồi lật hình, quái vây được từ nhiều phía |
| Cấu trúc ải | Mỗi ải 7 đến 8 phòng, mỗi phòng vừa một màn hình: phòng đánh quái, phòng rương báu, phòng suối hồi và phòng trùm. Từ ải 3 của mỗi vùng có thêm phòng chọn cửa. | Nhịp chơi có lúc căng lúc nghỉ, giữa ải luôn có phần thưởng |
| Năng lượng | Hero có máu và mana. Mana dùng cho đòn đặc biệt và kỹ năng riêng. | Người chơi phải tính lúc nào tung chiêu |
| Nền tảng | Điện thoại, màn hình ngang, cầm hai tay | Ngón trái di chuyển, ngón phải chiến đấu |
| Kiểu chơi | Chia ải theo bản đồ, ải cũ chơi lại được | Chơi lại ải cũ là cách nuôi vũ khí theo nhánh khác |
| Bối cảnh | Truyền thuyết Việt Nam, yêu tinh trong Lĩnh Nam chích quái | Ít game khai thác, có sẵn dàn boss đặc sắc |
| Luật cốt lõi 1 | Vũ khí tiến hóa theo cách bạn dùng | Điểm khác biệt chính của game |
| Luật cốt lõi 2 | Boss thích nghi để khắc chế thói quen của bạn | Ép người chơi đổi vũ khí và lối chơi |

**Cốt truyện một câu:** làng rèn bị yêu tinh phá, những người sống sót dùng các món vũ khí có linh hồn (linh khí) để đi diệt từng yêu tinh và dựng lại làng.

## 2. Vòng lặp một ải

Một ải dài 5 đến 7 phút và gồm 7 đến 8 phòng. Mỗi phòng vừa một màn hình. Xong việc trong phòng thì cửa bên phải mở để sang phòng kế.

**1** Đánh quái → **2** Đánh quái → **3** Rương báu → **4** Đánh quái → **5** Chọn cửa → **6** Đánh quái, có tinh anh → **7** Suối hồi → **8** Trùm

Bố cục của một ải 8 phòng. Ải 7 phòng không có phòng chọn cửa.

| Loại phòng | Số lượng | Trong phòng có gì |
|---|---|---|
| Đánh quái | 4 | 2 đến 3 đợt quái, mỗi đợt 3 đến 5 con. Hạ hết thì cửa mở. Phòng đánh quái cuối cùng có thêm 1 quái tinh anh. |
| Rương báu | 1 | Không có quái. Rương mở ra 3 món và bạn chọn 1: một vũ khí, một túi quặng, hoặc một bùa tạm phủ hệ lên vũ khí. |
| Suối hồi | 1 | Không có quái. Chọn một trong hai: suối máu hồi 50% máu, hoặc suối linh hồi đầy mana. Đây cũng là chỗ chuẩn bị trước trùm: bóng trùm hiện trên vách cho biết nó đang học gì từ bạn, và bạn được đổi một vũ khí đang mang lấy một vũ khí trong rương đồ. |
| Chọn cửa | 0 hoặc 1 | Chỉ có ở ải 8 phòng. Hai cửa hiện ra với biểu tượng báo trước loại phòng phía sau, bạn chọn một. Bốn loại phòng có thể gặp nằm ở bảng dưới. |
| Trùm | 1 | Trùm nhỏ ở ải 1 đến 4 của mỗi vùng, boss vùng ở ải 5. Trùm ra sân với lớp thích nghi lấy từ cách bạn chơi trong ải. |

### Bốn loại phòng sau cửa chọn

| Phòng | Nội dung | Hợp khi |
|---|---|---|
| Đánh quái thêm | Một phòng quái thường, cho thêm kinh nghiệm, vàng và dấu ấn | Bạn đang nuôi vũ khí và còn khỏe |
| Thương nhân | Không có quái. Đổi vàng lấy 1 bình máu, bùa tạm hoặc quặng. | Bạn sắp hết máu hoặc cần đổi hệ trước trùm |
| Thử thách | Một phòng quái có điều kiện: hạ hết trong 30 giây, hoặc dính không quá 2 đòn. Đạt thì nhận rương tốt hơn rương báu một bậc. Trượt thì vẫn qua phòng nhưng không có rương. | Bạn tự tin vào tay chơi |
| Lời nguyền | Không có quái. Một bàn thờ mời bạn nhận một lời nguyền đến hết ải, đổi lại mọi dấu ấn nhận được từ đó tăng gấp đôi. Bạn được từ chối và đi tiếp. | Bạn muốn vũ khí tiến hóa nhanh và chấp nhận rủi ro |

Ba lời nguyền ban đầu: máu tối đa giảm 20%, không dùng được bình máu, hoặc quái nhanh hơn 15%.

- **Trước ải:** chọn hero, mang 2 vũ khí, bộ đồ đang mặc và 2 bình máu. Mỗi bình hồi 30% máu.
- **Trong ải:** kết liễu quái đang dính hiệu ứng thì vũ khí nhận dấu ấn của hệ đó.
- **Sau ải:** nhận kinh nghiệm, vàng, nguyên liệu, có thể rớt vũ khí hoặc mảnh boss. Về làng mài vũ khí, rèn đồ, cộng điểm kỹ năng.

Bạn quen dùng một lối đánh → Vũ khí tiến hóa theo lối đánh đó → Boss quan sát và khắc chế → Bạn đổi vũ khí và cách chơi

↺ sang ải sau, vòng lặp bắt đầu lại

## 3. Hệ nguyên tố

Bản phát hành có ba hệ: Lửa, Độc và Băng. Mỗi hệ giải một loại tình huống khác nhau, nên không có hệ nào mạnh nhất.

### Chi tiết từng hệ

| Hệ | Hiệu ứng | Cách hoạt động | Mạnh khi | Yếu khi |
|---|---|---|---|---|
| Lửa | Cháy | Kéo dài 3 giây, mỗi giây gây 20% sát thương vũ khí. Không cộng dồn, đánh tiếp thì làm mới thời gian. Quái đang cháy chết sẽ làm cháy quái đứng sát nó. | Quái đi theo bầy | Một mục tiêu máu trâu |
| Độc | Trúng độc | Cộng dồn tối đa 5 tầng, kéo dài 5 giây. Mỗi tầng gây 6% sát thương vũ khí mỗi giây và giảm 4% giáp. | Boss, quái có giáp | Quái yếu chết trước khi độc kịp ngấm |
| Băng | Chậm, đóng băng | Mỗi tầng làm chậm 15%, tối đa 4 tầng. Tầng thứ 5 đóng băng 1,5 giây, sau đó mục tiêu miễn đóng băng 5 giây. Boss không bị đóng băng mà khựng 0,5 giây. | Quái nhanh, quái đánh xa | Cần hạ quái thật nhanh |

### Kết hợp hai hệ

Mỗi mục tiêu mang tối đa 2 hiệu ứng. Khi hai hiệu ứng khác hệ gặp nhau trên cùng mục tiêu, chúng phản ứng với nhau.

| Kết hợp | Tên | Kết quả |
|---|---|---|
| Lửa + Độc | Nổ khói | Nổ vùng, gây 150% sát thương vũ khí lên mọi quái xung quanh. Tiêu hết các tầng độc. |
| Lửa + Băng | Sốc nhiệt | Gây 250% sát thương vũ khí lên một mục tiêu. Xóa cả hai hiệu ứng. |
| Độc + Băng | Độc ngấm | Độc kéo dài gấp đôi trong lúc mục tiêu còn bị chậm. |

Một vũ khí chỉ theo một hệ, nên người chơi tạo kết hợp bằng cách đổi qua lại giữa 2 vũ khí đang mang, dùng kỹ năng của hero, hoặc lợi dụng môi trường.

### Vòng khắc chế

Khi một con trùm kháng một hệ, nó luôn yếu với một hệ khác theo vòng cố định dưới đây. Người chơi chỉ cần nhớ ba dòng.

| Trùm kháng | Thì yếu với | Hình ảnh giải thích |
|---|---|---|
| Lửa | Băng | Lớp vỏ đã cháy thành than thì giòn, gặp lạnh là nứt |
| Băng | Độc | Lớp giáp dày chống rét có khe hở, độc ngấm qua được |
| Độc | Lửa | Lớp nhựa, nấm chống độc rất dễ bắt lửa |

### Nguồn hiệu ứng khi vũ khí còn trắng

- **Môi trường:** đuốc và chậu than (Lửa), đầm lầy và nấm (Độc), vũng nước lạnh và nhũ băng (Băng). Dụ quái vào hoặc đánh vỡ để kích hoạt.
- **Bùa tạm:** nhận từ phòng rương báu, phủ một hệ lên vũ khí trong 60 giây.
- **Kỹ năng hero:** mỗi hero có một cách gây hiệu ứng riêng (xem phần 5).
- **Quái mang hệ:** đòn của chúng cũng gây hiệu ứng lên quái khác nếu bạn dụ khéo.

Người chơi cũng dính ba hiệu ứng này từ quái và bẫy. Mũ là món giảm thời gian dính hiệu ứng.

## 4. Hệ thống vũ khí

Lò rèn chỉ tăng con số sát thương. Hệ, hình dáng và chiêu thức của vũ khí chỉ đến từ cách bạn chơi.

### Loại vũ khí

Bản phát hành có 4 loại đầu. Nỏ và quạt thêm sau.

| Loại | Tầm | Tốc độ | Cách đánh | Đòn đặc biệt | Hợp hệ |
|---|---|---|---|---|---|
| Kiếm | Cận chiến | Vừa | Chuỗi 3 nhát, nhát cuối mạnh hơn | Chém lướt xuyên qua quái | Cả ba |
| Cung | Xa | Vừa | Chạm để bắn nhanh, giữ để bắn mạnh | Mưa tên xuống một vùng | Băng |
| Giáo | Trung bình | Vừa | Đâm thẳng, xuyên cả hàng quái | Lao tới đâm xuyên | Lửa |
| Búa | Cận chiến | Chậm | Nện vùng, làm quái khựng lại | Nện đất tạo sóng chấn | Băng, Lửa |
| Nỏ | Xa | Rất nhanh | Bắn liên tục, sát thương thấp, cộng tầng hiệu ứng nhanh | Xả một loạt tên | Độc |
| Quạt | Ngắn, hình nón | Nhanh | Quạt gió đẩy lùi, thổi hiệu ứng lan sang quái phía sau | Lốc xoáy hút quái | Lửa, Độc |

### Chỉ số và bậc

Mỗi vũ khí có 4 chỉ số: sát thương, tốc độ đánh, tầm và lực khựng. Bậc của vũ khí quyết định chỉ số gốc và nó tiến hóa được tới đâu.

| Bậc | Nguồn | Tiến hóa tối đa | Điểm riêng |
|---|---|---|---|
| Sắt | Rớt ở mọi ải | Thành hình | Không có |
| Bạc | Trùm nhỏ, ải từ vùng 2 | Thức tỉnh | Chỉ số gốc cao hơn 20% |
| Linh | Boss vùng, hoặc rèn từ mảnh boss | Thức tỉnh | Chỉ số gốc cao hơn 40%, thêm 1 dòng thuộc tính ngẫu nhiên |

### Dấu ấn và ba mốc tiến hóa

Kết liễu một con quái đang dính hiệu ứng thì vũ khí nhận dấu ấn của hệ đó: quái thường 1, quái tinh anh 5, trùm nhỏ 10, boss vùng 20. Một ải cho khoảng 30 dấu ấn nếu bạn đánh đúng cách.

| Mốc | Dấu ấn | Khoảng | Vũ khí được gì | Hình ảnh |
|---|---|---|---|---|
| Mầm | 30 | 1 ải | Khóa nhánh theo hệ. Đòn đánh có 20% cơ hội gây hiệu ứng của hệ. | Đổi màu lưỡi, thêm hạt hiệu ứng |
| Thành hình | 120 | 4 ải | Cơ hội gây hiệu ứng lên 50%. Đòn đặc biệt đổi theo hệ. | Vẽ hình mới |
| Thức tỉnh | 300 | 10 ải | Mọi đòn đều gây hiệu ứng. Mở tính chất riêng của nhánh. | Vẽ hình mới, có hiệu ứng động |

Tính chất riêng khi Thức tỉnh, lấy kiếm làm ví dụ:

| Nhánh | Hình dáng | Tính chất riêng |
|---|---|---|
| Lửa | Lưỡi đỏ rực, có tàn lửa bay | Lửa lan ngay khi đánh trúng, không cần chờ quái chết |
| Độc | Lưỡi xanh, mọc gai, nhỏ giọt | Quái chết để lại vũng độc trong 3 giây |
| Băng | Lưỡi trong như pha lê, phủ sương | Nhát thứ ba của chuỗi cộng thêm 2 tầng Băng |

### Các luật còn lại

- **Khóa nhánh.** Hệ nào đủ 30 dấu ấn trước thì vũ khí theo nhánh đó. Dấu ấn của hệ khác vẫn được ghi lại để dùng cho nhánh lai về sau.
- **Tôi lại.** Muốn đổi nhánh thì tôi lại ở lò rèn bằng đá tôi. Vũ khí giữ một nửa số dấu ấn và chuyển sang hệ mới.
- **Mài.** Lò rèn mài vũ khí từ +1 đến +10, mỗi cấp tăng 8% sát thương gốc. Mài tốn quặng và vàng, từ +6 cần thêm nguyên liệu vùng.
- **Mang 2 vũ khí.** Trong trận đổi qua lại bằng một nút, hồi 3 giây. Ở phòng suối hồi được đổi một trong hai lấy vũ khí khác trong rương.
- **Đòn đặc biệt** của vũ khí tốn 25 mana.
- **Thanh dấu ấn** hiện ngay cạnh biểu tượng vũ khí, và mỗi lần nhận dấu ấn có một tia sáng bay từ quái về vũ khí. Người chơi phải thấy rõ vì sao vũ khí đổi.

### Tên riêng của vũ khí

Khi Thức tỉnh, vũ khí tự nhận một cái tên ghép từ ba phần: loại vũ khí, một từ theo hệ và một danh hiệu theo chiến tích của nó. Ví dụ: "Kiếm Than Hồng, kẻ hạ Mộc Tinh".

| Phần của tên | Lấy từ đâu | Ví dụ |
|---|---|---|
| Từ theo hệ | Chọn ngẫu nhiên trong nhóm từ của hệ | Lửa: Than Hồng, Xích Diệm, Tàn Tro. Độc: Rêu Xanh, Nọc Rừng, Gai Độc. Băng: Sương Giá, Hàn Ngọc, Tuyết Trắng. |
| Danh hiệu | Chiến tích nổi bật nhất của vũ khí tính đến lúc Thức tỉnh | "kẻ hạ Mộc Tinh" (boss nó hạ nhiều nhất), "nghìn mạng" (hạ đủ 1.000 quái), "bất bại" (qua 5 ải liền không gục) |

Tên hiện lên khi bạn bước vào phòng trùm và được ghi vào sổ vũ khí. Việc này gần như không tốn công vẽ nhưng làm người chơi gắn bó với vũ khí của mình.

### Truyền linh

Truyền linh giải quyết chuyện vũ khí cũ thành đồ bỏ khi bạn nhặt được vũ khí bậc cao hơn.

- Làm ở lò rèn cấp 3, tốn 2 đá tôi.
- Bạn hy sinh một vũ khí đã Thức tỉnh. Tính chất riêng của nó thành một linh ấn gắn vào vũ khí khác.
- Linh ấn chỉ mạnh bằng một nửa bản gốc. Ví dụ, linh ấn Độc để lại vũng độc 1,5 giây thay vì 3 giây.
- Mỗi vũ khí nhận tối đa 1 linh ấn, và giữ luôn danh hiệu của vũ khí đã hy sinh.

Một cây cung Băng mang linh ấn Độc tự tạo được kết hợp Độc ngấm mà không cần đổi vũ khí. Đây là bước đệm trước khi có nhánh lai ở giai đoạn sau.

## 5. Hero

Có 4 hero, là những người sống sót của làng rèn. Hero nào cũng dùng được mọi vũ khí, nhưng mỗi người có vũ khí sở trường, một nội tại và một kỹ năng riêng.

| Hero | Máu | Mana | Tốc độ | Sở trường | Nội tại | Kỹ năng riêng | Độ khó |
|---|---|---|---|---|---|---|---|
| **Thợ Rèn** | 100 | 100 | 100% | Kiếm, búa | Vũ khí nhận dấu ấn nhanh hơn 20% | Nung: phủ Lửa lên vũ khí trong 6 giây | Dễ |
| **Thợ Săn** | 75 | 90 | 115% | Cung, nỏ | Đánh trúng điểm yếu gây thêm 25% sát thương | Đặt bẫy: bẫy kẹp giữ chân quái và gây hiệu ứng theo hệ vũ khí | Vừa |
| **Thầy Lang** | 85 | 130 | 100% | Quạt, giáo | Hiệu ứng bạn gây ra kéo dài hơn 30% | Ném bình thuốc: tạo vũng Độc, đứng trong vũng thì bạn hồi máu | Vừa |
| **Đô Vật** | 140 | 80 | 90% | Búa, giáo | Đỡ đòn đúng lúc thì phản lại 50% sát thương | Gồng: 3 giây giảm 60% sát thương nhận vào, đẩy lùi quái xung quanh | Khó |

### Mana

Mana là năng lượng để tung chiêu: đòn đặc biệt của vũ khí tốn 25 mana, kỹ năng riêng của hero tốn 40 mana. Mana không tự hồi theo thời gian. Mỗi đòn đánh thường trúng đích hồi 2 mana, kết liễu một con quái hồi 5 mana, và suối linh hồi đầy.

- **Sở trường** cho +10% sát thương với loại vũ khí đó.
- **Mở khóa:** Thợ Rèn có sẵn. Thợ Săn được cứu sau boss vùng 1, Thầy Lang sau boss vùng 2, Đô Vật sau boss vùng 3.
- **Vũ khí và nguyên liệu dùng chung** cho mọi hero. Cấp và điểm kỹ năng tính riêng từng người.
- **Hình vẽ:** mỗi hero cao khoảng 32 điểm ảnh, ghép từ các lớp rời (thân, mũ, áo, vũ khí) để đồ nào mặc vào cũng hiện lên.

Boss thích nghi theo cách chơi, nên mỗi hero gặp một phiên bản boss khác nhau. Thợ Săn hay bị boss chống đánh xa, Đô Vật hay bị boss chống áp sát. Đây là lý do để chơi lại bằng hero khác.

## 6. Phát triển sức mạnh hero

Sức mạnh đến từ năm nguồn. Mục tiêu chia tỉ trọng là để người chơi khéo thắng được người chỉ cày cấp.

| Nguồn | Tỉ trọng | Tăng bằng cách nào | Cần gì |
|---|---|---|---|
| Vũ khí | 40% | Tiến hóa qua dấu ấn, mài ở lò rèn | Chơi đúng cách, quặng, vàng |
| Mũ và áo | 25% | Rèn từ mảnh boss, nâng cấp +1 đến +5 | Mảnh boss, nguyên liệu vùng, vàng |
| Cấp hero | 15% | Lên cấp, tối đa cấp 30. Mỗi cấp +2% máu và +1% sát thương. | Kinh nghiệm |
| Cây kỹ năng | 10% | Cứ 3 cấp nhận 1 điểm, tổng 10 điểm | Điểm kỹ năng |
| Bùa | 10% | Sưu tầm, không nâng cấp | Hạ quái tinh anh |

### Mốc mở khóa theo cấp

| Cấp | Mở khóa |
|---|---|
| 2 | Ô vũ khí thứ hai |
| 5 | Ô bùa |
| 10 | Kỹ năng riêng lên bậc 2: mạnh hơn và tốn ít mana hơn |
| 20 | Kỹ năng riêng lên bậc 3: thêm một tác dụng mới |

### Cây kỹ năng

Mỗi hero có 3 nhánh, mỗi nhánh 5 nút, tổng 15 nút. Người chơi chỉ có 10 điểm nên phải chọn. Đặt lại điểm tốn vàng.

| Nhánh | Hướng | Ví dụ nút |
|---|---|---|
| Công | Gây sát thương | Tăng sát thương nhát cuối của chuỗi, đòn đặc biệt tốn ít mana hơn, tăng sát thương lên quái đang dính hiệu ứng |
| Thủ | Sống sót | Lăn né xa hơn, hồi máu khi qua phòng, giảm thời gian dính hiệu ứng |
| Hệ | Hiệu ứng và kết hợp | Nổ khói rộng hơn, tăng mana tối đa, đòn đầu sau khi đổi vũ khí chắc chắn gây hiệu ứng |

### Nguyên liệu

| Nguyên liệu | Lấy ở đâu | Dùng để |
|---|---|---|
| Kinh nghiệm | Hạ quái, qua ải | Lên cấp hero |
| Vàng | Quái, rương, thưởng qua ải | Mài, rèn, đặt lại kỹ năng, nâng làng |
| Quặng | Phòng rương báu trong ải | Mài vũ khí |
| Nguyên liệu vùng | Quái của vùng đó: gỗ linh (rừng), vảy (hang biển), đá lửa (núi đá) | Mài từ +6, nâng cấp mũ áo, nâng làng |
| Mảnh boss | Boss vùng, mỗi lần hạ chắc chắn rớt 1 | Rèn mũ áo của boss, rèn vũ khí bậc Linh |
| Đá tôi | Hiếm: qua ải đạt 3 sao lần đầu, trùm nhỏ | Tôi lại vũ khí để đổi nhánh |

## 7. Trang bị

Hero có 4 ô: vũ khí, mũ, áo và bùa. Mũ chống hiệu ứng, áo cho máu và giáp, bùa cho một tính chất đặc biệt.

### Bộ đồ từ boss

| Bộ | Mũ | Áo | Mặc đủ 2 món |
|---|---|---|---|
| Mộc Tinh | Mũ sừng gỗ: giảm 40% thời gian trúng độc | Áo vỏ cây: máu cao, giáp cao, hơi nặng | Đứng yên 2 giây thì bắt đầu hồi máu |
| Ngư Tinh | Mũ vây cá: giảm 40% thời gian bị chậm | Áo vảy: giáp cao, lăn né nhanh hơn | Lăn né để lại vệt nước làm chậm quái |
| Hồ Tinh | Mũ tai cáo: giảm 40% thời gian bị cháy | Áo lông trắng: nhẹ, tăng tốc độ chạy | Né đúng lúc tạo một ảo ảnh thu hút quái |

Ngoài ra có đồ thường rèn từ nguyên liệu vùng, chỉ số thấp hơn và không có hiệu ứng bộ. Mũ áo không tự tiến hóa, để vũ khí giữ vai chính.

### Ví dụ bùa

- **Bùa hút máu:** kết liễu quái thì hồi 2% máu.
- **Bùa tàn lửa:** quái đang cháy nhận thêm 15% sát thương.
- **Bùa sương:** lăn né xuyên qua quái cộng cho nó 1 tầng Băng.
- **Bùa tham:** nhận thêm 25% vàng, nhưng máu tối đa giảm 10%.
- **Bùa linh:** kết liễu quái đang dính hiệu ứng hồi thêm 5 mana.

## 8. Thiết kế boss

### Nguyên tắc tạo hình

- **Kích thước.** Màn hình game rộng 480 × 270 điểm ảnh. Hero cao 32, boss cao từ 96 đến 128, tức chiếm khoảng 35% đến 47% chiều cao màn hình.
- **Bóng dáng.** Tô đen toàn bộ boss vẫn phải nhận ra nó là con gì. Mỗi boss có một bộ phận đặc trưng thật to: tán cây, cái miệng, chùm đuôi.
- **Ba lớp hình.** Thân cố định, điểm yếu phát sáng, và lớp thích nghi phủ bên ngoài. Lớp thích nghi vẽ rời theo màu hệ, nên không phải vẽ lại cả boss cho từng phiên bản.
- **Điểm yếu nhìn thấy được.** Đánh trúng điểm yếu gây thêm 50% sát thương. Điểm yếu chỉ lộ ra sau một số chiêu nhất định.
- **Báo trước mọi đòn.** Trước mỗi chiêu, boss có tư thế lấy đà từ 0,5 đến 1 giây và vùng nguy hiểm hiện màu đỏ trên mặt đất.
- **Ba giai đoạn theo máu.** Trên 60%, từ 60% xuống 30%, và dưới 30%. Mỗi giai đoạn boss đổi hình và thêm chiêu.
- **Sân đấu** phẳng, rộng khoảng 1,5 màn hình. Game không có nhảy, nên mọi đòn của boss đều né được bằng cách bước ra khỏi vùng đỏ hoặc lăn né.

### Luật thích nghi

| Game đo trong ải | Điều kiện | Boss phản ứng |
|---|---|---|
| Sát thương theo hệ | Một hệ chiếm trên 50% tổng sát thương | Kháng 50% hệ đó, nhận thêm 30% sát thương từ hệ khắc chế |
| Khoảng cách đánh | Trên 60% sát thương từ đánh xa | Thêm chiêu chống đánh xa |
| Khoảng cách đánh | Trên 60% sát thương từ cận chiến | Thêm chiêu chống áp sát |
| Cách phòng thủ | Lăn né trên 15 lần trong ải | Thêm đòn đánh hai nhịp để bắt bài lăn né |

- Boss vùng mang tối đa 2 lớp thích nghi, trùm nhỏ mang 1 lớp.
- Không hệ nào vượt 50% thì boss không kháng hệ nào. Đây là phần thưởng cho người chơi đa dạng.
- Phòng suối hồi luôn báo trước lớp thích nghi bằng hình bóng boss và màu hệ.

### Boss mang sẹo

Ở độ khó thứ hai, boss quay lại với một vết sẹo đúng màu hệ của đòn đã kết liễu nó lần gần nhất, và kháng sẵn 50% hệ đó. Vết sẹo là lớp thích nghi thứ ba, có từ đầu trận và không phụ thuộc cách bạn chơi trong ải. Nếu đòn kết liễu đến từ vũ khí trắng, boss không có sẹo hệ mà tăng 20% máu.

Người chơi vì thế phải nghĩ trước một bước: hạ boss bằng hệ nào thì lần sau hệ đó yếu đi.

### Boss vùng 1: Mộc Tinh (Rừng già)

Cây cổ thụ cao 128 điểm ảnh, đứng cố định ở bên phải sân. Thân cây có khuôn mặt người, hai cành lớn là tay, rễ trồi khỏi đất là chân. Đây là boss đầu tiên nên nó không di chuyển, để người chơi tập đọc chiêu.

| Mục | Chi tiết |
|---|---|
| Điểm yếu | Lõi nhựa phát sáng trong hốc miệng, mở ra sau chiêu quật cành |
| Chiêu | Quật cành quét nửa trên hoặc nửa dưới sân (bước sang nửa còn lại để né). Rễ đâm lên từ dưới chân (đất nứt báo trước). Thả quả độc rơi xuống thành vũng độc (bóng tròn báo chỗ rơi). Gọi cây con. |
| Giai đoạn 2 | Rụng hết lá, đánh nhanh hơn, rễ đâm 3 lần liên tiếp |
| Giai đoạn 3 | Nhổ rễ, lê từng bước về phía bạn và thu hẹp sân |
| Thích nghi theo hệ | Bị đốt nhiều: vỏ hóa than đen. Bị độc nhiều: mọc nấm kín thân. Bị băng nhiều: phủ rêu dày. |
| Chống đánh xa | Mọc tán lá che lõi, phải chặt rễ thì lá mới rụng |
| Chống áp sát | Mọc vòng gai quanh gốc, đứng sát quá 3 giây là bị đâm |

### Boss vùng 2: Ngư Tinh (Hang biển)

Cá khổng lồ thân dài, lưng đầy gai, miệng rộng bằng nửa thân. Sân đấu là một bãi đá giữa hang, nước bao quanh ba phía. Nó bơi vòng quanh bãi đá, phần lớn thời gian chỉ thấy lưng và vây, phần nhô lên cao khoảng 96 điểm ảnh.

| Mục | Chi tiết |
|---|---|
| Điểm yếu | Mang cá, lộ ra khi nó há miệng đớp trượt và mắc cạn trên đá |
| Chiêu | Lao ngang qua bãi đá theo một hàng để đớp (vây lưng rẽ nước báo trước, bước khỏi hàng đó để né). Phun cột nước xuống các vòng tròn báo trước. Quẫy đuôi tạo sóng quét cả sân, chừa một khe hở để lách qua. Lặn rồi trồi lên. |
| Giai đoạn 2 | Nước dâng, bãi đá hẹp lại từ ba phía |
| Giai đoạn 3 | Bãi đá chỉ còn một nửa, nó lao liên tiếp 3 lần |
| Thích nghi theo hệ | Bị đốt nhiều: phủ lớp nhớt ướt. Bị băng nhiều: vảy dày lên màu xám. Bị độc nhiều: nhả bọt trắng bao quanh thân. |
| Chống đánh xa | Lặn mất rồi trồi lên ngay dưới chân bạn |
| Chống áp sát | Dựng gai lưng mỗi khi mắc cạn, đánh vào lưng là bị thương |

### Boss vùng 3: Hồ Tinh (Núi đá)

Cáo trắng chín đuôi, cao khoảng 96 điểm ảnh nhưng chùm đuôi xòe rộng gấp đôi thân. Đây là boss nhanh nhất, lướt qua lại khắp sân. Nó là bài kiểm tra cuối: sao chép chính lối chơi của bạn.

| Mục | Chi tiết |
|---|---|
| Điểm yếu | Chín cái đuôi. Chặt đứt một đuôi thì nó mất một chiêu. |
| Chiêu | Vồ theo một đường thẳng. Tạo 3 ảo ảnh, chỉ con thật có bóng đổ dưới đất. Thả lửa hồ ly bay đuổi theo bạn. |
| Đuôi sao chép | Mỗi đuôi sáng lên theo màu hệ bạn dùng nhiều và tung lại đòn đặc biệt của vũ khí bạn đang cầm |
| Giai đoạn 2 | Ảo ảnh cũng biết tấn công |
| Giai đoạn 3 | Hiện nguyên hình to gấp rưỡi, các đuôi còn lại đánh cùng lúc |
| Thích nghi theo hệ | Bộ lông đổi màu theo hệ nó kháng: đỏ sẫm, xanh rêu hoặc trắng xanh |

### Boss cho các vùng sau

Truyện dân gian còn nhiều nhân vật hợp làm boss: Thuồng Luồng cho vùng sông sâu, Chằn Tinh cho đền hoang, Đại Bàng cho vùng đỉnh núi đánh trên không.

## 9. Quái thường

Quái chia theo vai trò. Mỗi vai trò có một hệ giải quyết gọn nhất, và đó là cách game dạy người chơi về hệ trước khi gặp boss.

| Vai trò | Hành vi | Hệ khắc chế | Ví dụ ở Rừng già |
|---|---|---|---|
| Lính xông | Chạy thẳng tới đánh gần | Hệ nào cũng được | Yêu gỗ con |
| Bầy nhỏ | Đi 5 đến 8 con, máu rất thấp | Lửa | Đàn bọ lá |
| Khiên | Giáp dày, chắn cho quái phía sau | Độc | Rùa đá rêu |
| Xạ thủ | Đứng xa bắn, hay lùi lại | Băng | Khỉ ném quả |
| Nhanh nhẹn | Lướt vòng ra sau lưng để đánh lén | Băng | Cáo rừng |
| Tinh anh | To hơn, mang một hệ, gây hiệu ứng lên bạn | Theo vòng khắc chế | Nấm chúa phun độc |

Mỗi vùng cần khoảng 8 loại quái: 6 loại theo vai trò trên và 2 trùm nhỏ. Trùm nhỏ là quái tinh anh phóng to, có 2 đến 3 chiêu và 1 lớp thích nghi.

### Quái tinh anh cũng học

Quái tinh anh ở phòng đánh quái cuối cùng mang một lớp thích nghi nhẹ: nó kháng 25% hệ bạn dùng nhiều nhất tính đến lúc đó và có viền sáng theo màu hệ ấy. Đây là lời cảnh báo sớm, để người chơi biết trùm sắp khắc chế mình kiểu gì trước khi tới phòng suối hồi.

## 10. Ải và bản đồ

Bản phát hành có 3 vùng, mỗi vùng 5 ải, tổng 15 ải.

| Vùng | Hệ chủ đạo | Môi trường dùng được | Boss | Hero được cứu |
|---|---|---|---|---|
| Rừng già | Độc | Đầm lầy, nấm nổ, bụi gai | Mộc Tinh | Thợ Săn |
| Hang biển | Băng | Vũng nước lạnh, nhũ băng rơi, nước dâng | Ngư Tinh | Thầy Lang |
| Núi đá | Lửa | Chậu than, khe phun lửa, đá lăn | Hồ Tinh | Đô Vật |

- **Trong một vùng:** ải 1 đến ải 4 kết thúc bằng trùm nhỏ, ải 5 là boss vùng.
- **Số phòng:** ải 1 và 2 của mỗi vùng có 7 phòng, ải 3 đến 5 có 8 phòng vì thêm phòng chọn cửa (xem phần 2).
- **Chấm sao:** 1 sao khi qua ải, 2 sao khi không dùng bình máu, 3 sao khi hạ trùm bằng hệ khắc chế nó. Sao thứ ba dạy người chơi đúng luật cốt lõi.
- **Vật cản trong phòng:** tảng đá, gốc cây, chậu than. Chúng chắn đường đạn và là nguồn hiệu ứng.
- **Độ khó thứ hai** mở sau khi hạ Hồ Tinh: quái mang hệ nhiều hơn, boss mang thêm lớp thứ ba là vết sẹo (xem phần thiết kế boss).

## 11. Ải hướng dẫn

Ải 1 của Rừng già là ải hướng dẫn, dài 7 phòng. Mỗi phòng dạy đúng một việc bằng tình huống, không dùng bảng chữ dài.

| Phòng | Loại | Diễn biến | Người chơi học được |
|---|---|---|---|
| 1 | Đánh quái | 3 con yêu gỗ con đi chậm | Di chuyển, đánh, lăn né |
| 2 | Đánh quái | Một chậu than giữa phòng và một đàn bọ lá. Đánh vỡ chậu thì cả đàn bốc cháy. Khi con đầu tiên chết, một tia sáng bay về kiếm và game dừng 1 giây chỉ vào thanh dấu ấn. | Gây hiệu ứng rồi kết liễu thì vũ khí nhận dấu ấn |
| 3 | Rương báu | Rương có sẵn một bùa Lửa tạm trong ba món | Chọn phần thưởng, phủ hệ lên vũ khí |
| 4 | Đánh quái | Hai đợt quái. Thanh mana đầy và nút Đặc biệt nhấp nháy. | Mana và đòn đặc biệt |
| 5 | Đánh quái | Có một quái tinh anh viền đỏ, lửa gây ít sát thương lên nó hơn hẳn các con khác. Kiếm đủ 30 dấu ấn và đổi màu ngay trong phòng. | Vũ khí tiến hóa, kẻ địch bắt đầu quen đòn |
| 6 | Suối hồi | Bóng trùm trên vách cháy màu đỏ. Rương đồ có sẵn một cây cung đã phủ Băng. | Trùm đã học lửa của bạn, hãy đổi vũ khí |
| 7 | Trùm | Trùm nhỏ kháng Lửa. Bắn cung Băng thì con số sát thương to và đổi màu. | Vòng khắc chế, sao thứ ba |

- Ải hướng dẫn cho gấp đôi dấu ấn, để kiếm chắc chắn đạt mốc Mầm ở phòng 5.
- Trước phòng trùm, máu hero không xuống dưới 1, nên người chơi mới không thể thua giữa chừng.
- Hero, cây kỹ năng, mài và làng được giới thiệu dần ở các ải sau, mỗi ải một thứ.

## 12. Màn hình và điều khiển

Hai ngón cái che hai góc dưới, nên mọi thông tin quan trọng nằm ở mép trên.

- Mép trên bên trái: máu, mana và hiệu ứng đang dính.
- Mép trên ở giữa: máu trùm và biểu tượng lớp thích nghi.
- Mép trên bên phải: 2 vũ khí kèm thanh dấu ấn, chạm để đổi.
- Giữa màn hình: phông nền ở trên, dải mặt đất ở dưới. Hero chạy tám hướng, quái vào từ hai bên.
- Góc dưới bên trái: cần di chuyển.
- Góc dưới bên phải: các nút Đánh, Né, Đặc biệt, Kỹ năng.

Bố cục màn hình ngang khi đang chiến đấu

| Nút | Tác dụng |
|---|---|
| Cần di chuyển | Chạy tám hướng trên dải mặt đất |
| Đánh | Chạm liên tục để ra chuỗi đòn. Với cung thì giữ để bắn mạnh. Đỡ đòn bằng cách giữ nút Đánh khi đứng yên. |
| Né | Lăn né, bất tử trong 0,3 giây, hồi 1 giây |
| Đặc biệt | Đòn đặc biệt của vũ khí, tốn 25 mana |
| Kỹ năng | Kỹ năng riêng của hero, tốn 40 mana |
| Biểu tượng vũ khí | Chạm để đổi sang vũ khí thứ hai, hồi 3 giây |

Dải mặt đất cao khoảng 120 điểm ảnh, gần bằng 4 lần chiều cao hero. Đòn đánh trúng khi hero và quái lệch hàng không quá 12 điểm ảnh. Game tự hút đòn vào quái gần nhất theo hướng hero đang quay mặt, và mọi nhân vật có bóng đổ dưới chân để dễ ước lượng hàng.

## 13. Làng

Làng là nơi tiêu nguyên liệu và là thước đo tiến trình: cứu thêm người thì làng thêm nhà.

| Công trình | Chức năng | Nâng cấp |
|---|---|---|
| Lò rèn | Mài vũ khí, rèn mũ áo, tôi lại vũ khí | Cấp 1 mài tới +3, cấp 2 tới +6, cấp 3 tới +10 |
| Rương đồ | Chứa vũ khí và trang bị | Thêm ô chứa |
| Nhà hero | Đổi hero, cộng điểm kỹ năng | Mở khi cứu được hero |
| Sổ vũ khí | Ghi mọi dạng tiến hóa đã mở, thưởng khi mở dạng mới | Không có |
| Bản đồ | Chọn vùng và ải, xem số sao | Không có |

### Dân làng được cứu

Mỗi người được cứu mở thêm một chức năng, nên bản đồ làng cho thấy bạn đã đi được tới đâu.

| Người | Cứu ở đâu | Mở chức năng |
|---|---|---|
| Bà hàng xén | Ải 3 Rừng già | Cửa hàng ở làng. Bà cũng là thương nhân bạn gặp trong ải. |
| Thợ Săn | Hạ Mộc Tinh | Hero mới và bảng nhiệm vụ hằng ngày |
| Thầy bói | Ải 3 Hang biển | Trước khi vào ải, xem trước hai cửa của phòng chọn cửa và ba món trong rương báu |
| Thầy Lang | Hạ Ngư Tinh | Hero mới và tiệm thuốc: mang được bình máu thứ ba |
| Ông đồ | Ải 3 Núi đá | Đổi tên vũ khí đã Thức tỉnh, chép sổ yêu quái |
| Đô Vật | Hạ Hồ Tinh | Hero mới và sân tập: thử vũ khí với hình nộm |

## 14. Nhiệm vụ, thành tựu và sổ yêu quái

Ba hệ thống này cho người chơi lý do quay lại mỗi ngày, và đều hướng họ thử lối chơi khác.

| Hệ thống | Cách hoạt động | Ví dụ |
|---|---|---|
| Nhiệm vụ hằng ngày | Mỗi ngày 3 nhiệm vụ, thưởng vàng và quặng. Làm đủ 3 nhiệm vụ trong 5 ngày của một tuần thì nhận 1 đá tôi. | Hạ trùm bằng hệ khắc chế. Tạo 10 lần Nổ khói. Qua một ải bằng hero ít dùng nhất. |
| Thành tựu | Mục tiêu dài hạn, thưởng một lần, kèm danh hiệu hoặc trang phục | Thức tỉnh vũ khí đầu tiên. Thức tỉnh đủ ba nhánh của một loại vũ khí. Hạ boss mà nó không kịp kháng hệ nào. |
| Sổ yêu quái | Ghi từng loại quái và boss đã gặp. Điểm yếu chỉ hiện sau khi bạn tự tìm ra, tức là hạ nó bằng hệ khắc chế lần đầu. Điền kín một vùng thì nhận thưởng. | Trang Mộc Tinh ghi ba lớp thích nghi bạn từng gặp và vết sẹo hiện tại của nó |

## 15. Âm thanh

Âm thanh có hai việc: tạo không khí Việt Nam và báo cho người chơi biết chuyện gì vừa xảy ra mà không cần nhìn.

| Nơi | Nhạc nền |
|---|---|
| Làng | Đàn tranh chậm, thư thả |
| Rừng già | Sáo trúc và đàn t'rưng |
| Hang biển | Đàn bầu, có tiếng vang và tiếng nước nhỏ giọt |
| Núi đá | Trống và đàn nguyệt, nhịp nhanh |
| Phòng trùm | Trống hội dồn dập, thêm một lớp nhạc cụ mỗi khi boss sang giai đoạn mới |

- **Tiếng theo hệ:** Lửa bùng và lách tách, Độc sủi và xèo, Băng leng keng và rắc vỡ. Nghe là biết hiệu ứng nào vừa dính.
- **Tiếng dấu ấn:** một tiếng chuông nhỏ mỗi lần nhận dấu ấn, cao dần khi gần tới mốc tiến hóa.
- **Tiếng thích nghi:** một tiếng cồng khi lớp thích nghi của trùm hiện ra.
- **Tiếng báo đòn:** mỗi chiêu của boss có một âm báo riêng trước khi ra đòn.

## 16. Bảng cân bằng

Mọi con số máu của quái được suy ra từ một câu hỏi: người chơi ở vùng đó mất bao lâu để hạ nó. Thời gian mục tiêu là 3 giây cho quái thường, 15 giây cho quái tinh anh, 45 giây cho trùm nhỏ và 2 phút cho boss vùng.

| Vùng | Cấp hero | Sát thương mỗi giây của người chơi | Máu quái thường | Máu tinh anh | Máu trùm nhỏ | Máu boss vùng | Sát thương một đòn của quái |
|---|---|---|---|---|---|---|---|
| Rừng già | 1 đến 8 | 20 đến 40 | 60 đến 120 | 300 đến 600 | 900 đến 1.800 | 4.800 | 8 đến 12 |
| Hang biển | 9 đến 18 | 45 đến 90 | 135 đến 270 | 675 đến 1.350 | 2.000 đến 4.000 | 10.800 | 14 đến 20 |
| Núi đá | 19 đến 30 | 100 đến 200 | 300 đến 600 | 1.500 đến 3.000 | 4.500 đến 9.000 | 24.000 | 24 đến 34 |

- Sát thương mỗi giây của người chơi đã tính cả hiệu ứng. Mốc khởi đầu là kiếm sắt gây 10 sát thương mỗi nhát, 2 nhát mỗi giây.
- Hai con số trong mỗi ô là ải đầu và ải cuối của vùng.
- Đây là bảng xuất phát để người lập trình có số nhập vào. Chơi thử xong mới biết số nào cần chỉnh.

## 17. Danh sách hình cần vẽ

Bản phát hành cần khoảng 860 khung hoạt ảnh, bản thử cần khoảng 230. Đây là ước lượng để tính công vẽ hoặc chi phí thuê họa sĩ.

| Nhóm | Cách tính | Bản phát hành | Bản thử |
|---|---|---|---|
| Hero | Mỗi hero 36 khung: đứng 4, chạy 6, đánh 8, lăn né 5, trúng đòn 2, gục 5, dùng kỹ năng 6 | 4 hero, 144 khung | 36 |
| Quái thường | Mỗi loại 14 khung: đi 4, đánh 4, trúng đòn 2, chết 4. Mỗi vùng 6 loại. | 18 loại, 252 khung | 84 |
| Trùm nhỏ | Mỗi con 24 khung, mỗi vùng 2 con | 6 con, 144 khung | 0 |
| Boss vùng | Mỗi boss khoảng 60 khung cho ba giai đoạn, cộng 3 lớp phủ theo hệ | 3 boss, 180 khung | 60 |
| Hiệu ứng | Khoảng 24 hiệu ứng, mỗi cái 6 khung: hiệu ứng ba hệ trên mục tiêu và trên sàn, ba kết hợp, đòn đặc biệt theo hệ | 144 khung | 54 |
| **Tổng hoạt ảnh** | | **864 khung** | **234** |

| Hình tĩnh | Cách tính | Bản phát hành |
|---|---|---|
| Vũ khí | Mỗi loại 7 hình: 1 hình gốc và 2 hình cho mỗi nhánh. Vũ khí là một hình rời, xoay theo động tác của hero. | 28 hình |
| Mũ | Mỗi mũ một hình, đặt theo vị trí đầu của hero | 6 hình |
| Áo | Đổi bảng màu của thân hero và thêm một chi tiết nhỏ, không vẽ lại từng khung | 6 bảng màu |
| Cảnh nền | Mỗi vùng một bộ nền sàn, một phông nền hai lớp và khoảng 5 vật cản. Thêm cảnh làng. | 4 bộ |
| Giao diện | Nút bấm, thanh máu và mana, biểu tượng vũ khí, hệ, nguyên liệu, loại phòng | Khoảng 80 biểu tượng |

Bốn hero dùng chung một khung xương và cùng chiều cao, nhờ đó mũ và áo chỉ vẽ một lần cho cả bốn.

## 18. Lộ trình làm game

| Giai đoạn | Nội dung | Câu hỏi cần trả lời |
|---|---|---|
| 1\. Bản thử | Thợ Rèn, kiếm và cung, 3 hệ chưa có kết hợp, 2 mốc tiến hóa, 3 ải Rừng già loại 7 phòng (ải 1 là ải hướng dẫn), Mộc Tinh với 3 lớp thích nghi theo hệ | Người chơi có hiểu vì sao vũ khí đổi không? Boss thích nghi vui hay khó chịu? |
| 2\. Bản phát hành | Đủ nội dung trong tài liệu này: 4 hero, 4 loại vũ khí, 3 vùng 15 ải, 3 boss, kết hợp hệ, cây kỹ năng, làng | Người chơi có quay lại sau một tuần không? |
| 3\. Làm sâu | Nỏ và quạt. Nhánh lai từ hai hệ (Lửa + Độc thành khói). Hệ thứ tư là Sét. Vùng 4 và 5. Thú đồng hành mang hệ. | Nội dung mới có giữ được cân bằng không? |
| 4\. Lâu dài | Ải vô tận, thử thách hằng ngày, chia sẻ vũ khí bằng mã, chơi chung 2 người, sự kiện theo lễ hội Việt Nam | Cộng đồng có tự tạo nội dung cho nhau không? |

Kiếm tiền bằng trang phục và hiệu ứng trang trí, không bán sức mạnh, vì cả game dựa trên việc vũ khí là thành quả của cách chơi.

## 19. Rủi ro

- **Bị phạt vì chơi giỏi.** Người chơi có thể thấy boss thích nghi là bất công. Cách giảm: kháng chỉ 50%, luôn báo trước ở phòng suối hồi, luôn có điểm yếu theo vòng khắc chế, và thưởng sao thứ ba khi đánh đúng điểm yếu.
- **Khối lượng vẽ vũ khí.** Mốc Mầm chỉ đổi màu, hai mốc sau mới vẽ hình mới. Như vậy mỗi loại vũ khí cần 7 hình (1 hình gốc và 2 hình cho mỗi nhánh), tức 28 hình cho 4 loại vũ khí lúc phát hành.
- **Khối lượng vẽ boss.** Mỗi boss cần thân, 3 giai đoạn và 3 lớp phủ theo hệ. Đây là phần tốn công nhất, nên bản thử chỉ làm một boss đứng yên.
- **Đánh trượt vì lệch hàng.** Ở góc nhìn có chiều sâu, người chơi dễ đứng lệch hàng với quái. Cách giảm: tự hút đòn, bóng đổ dưới chân và vùng trúng đòn rộng rãi.
- **Ải dài hơn.** Với 7 đến 8 phòng, một ải mất 5 đến 7 phút. Nếu người chơi thử thấy dài, giảm số đợt quái mỗi phòng chứ không giảm số phòng.
- **Quá nhiều hệ thống.** Bản thiết kế này đã có truyền linh, lời nguyền, sẹo boss, nhiệm vụ và sổ yêu quái. Làm hết ngay từ đầu rất dễ dở dang. Bản thử vẫn chỉ gồm phần cốt lõi, các hệ thống còn lại thêm dần ở bản phát hành.
- **Cân bằng ba hệ.** Nếu một hệ luôn mạnh nhất thì luật tiến hóa mất ý nghĩa. Cần theo dõi tỉ lệ người chơi chọn từng nhánh ngay từ bản thử.
