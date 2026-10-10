# Linh Khí (Spiritblade) — toàn bộ về hình ảnh, nhân vật, hành động, hiệu ứng, màu sắc. Xin góp ý

Chào bạn. Tôi đang làm game **Linh Khí** (tên miền: spiritblade.web.app), một game hành động nhập vai pixel art chạy trên trình duyệt, chơi chủ yếu trên điện thoại cầm ngang. Dưới đây là mô tả đầy đủ cách game đang được vẽ và cử động. Kèm theo là 3 ảnh chụp: màn đăng nhập, làng, một phòng chiến đấu (960×540).

**Tôi muốn bạn góp ý thẳng thắn:**
1. Nhìn ảnh, điều gì làm game trông "chưa chuyên nghiệp" nhất? Xếp theo mức ảnh hưởng.
2. Với cách vẽ hiện tại (vẽ bằng code, độ phân giải 480×270), nên ưu tiên sửa gì để đẹp lên nhanh nhất?
3. Bảng màu, ánh sáng, độ tương phản giữa nhân vật và nền: chỗ nào sai?
4. Chuyển động và hiệu ứng chiến đấu: thiếu gì so với các game indie pixel art hay (Hades, Dead Cells, Enter the Gungeon, Moonlighter, Eastward…)?
5. Giao diện (HUD, nút, bảng): nên bố trí lại thế nào cho điện thoại?
6. Có nên đổi cách làm hình (ví dụ dùng sprite vẽ tay, tăng độ phân giải, đổi phong cách) không, và đổi thì mất gì được gì?
Hãy góp ý cụ thể (số điểm ảnh, mã màu, số khung hình, thời gian tính bằng giây…) để có thể làm theo ngay.

---

## 1. Game là gì
- Thể loại: hành động nhập vai góc nhìn từ trên xuống chéo (kiểu Zelda/Hades), chia ải, mỗi ải là bản đồ 8 phòng vuông sinh ngẫu nhiên (phòng Bắt đầu, phòng quái, Suối hồi, phòng Trùm), cửa bốn phía.
- Chủ đề: dân gian Việt Nam. Người chơi là một "em bé tinh linh" cầm vũ khí sống, đi qua các vùng: **Rừng già** (hệ Độc), **Hang biển** (hệ Băng), **Lâu đài cổ** (hệ Lửa). Mỗi vùng có quái thường, tinh anh, trùm nhỏ, trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh).
- 4 em bé: Thợ Rèn, Thợ Săn, Thầy Lang, Đô Vật. 4 loại vũ khí: Kiếm, Cung, Giáo, Búa; vũ khí có bậc màu Thường/Lam/Tím/Vàng và "tiến hoá" khi hấp thụ linh khí theo hệ.
- Có làng (hub) với người làng: Thợ Rèn, Thợ May, Lái Đò, Cụ Đồ, anh Mõ…; túi đồ, trang phục (mũ, áo, đồ đeo lưng), bảng vàng xếp hạng, đăng nhập Google để lưu mây.
- 36 quái và trùm, ví dụ: Heo Rừng Con, Bầy Ong Vò Vẽ, Nấm Phồng, Hoa Phun Bào Tử, Cua Lính, Ốc Mượn Hồn, Sứa Bom, Lính Ma Giáp Gỉ, Đèn Lồng Ma, Mèo Đen Hai Đuôi, Tướng Ma, Hổ Lửa, Hồ Tinh (cáo chín đuôi)… Mỗi con có một nét "phá cách" dân gian (mặt nạ Trung thu, nón lá, đèn ông sao…).

## 2. Kỹ thuật hiển thị
- HTML5 Canvas 2D, không dùng engine, không dùng ảnh: **mọi hình đều vẽ bằng code** (lệnh tô từng ô vuông `fillRect` toạ độ nguyên, màu phẳng).
- Hai lớp canvas:
  - **Lớp thế giới**: độ phân giải thật **480×270 điểm ảnh**, phóng to vừa màn hình kiểu pixel (không làm mịn). Sàn, tường, nhân vật, quái, hiệu ứng chiến đấu vẽ ở đây.
  - **Lớp giao diện**: nét cao theo màn hình (chữ, nút, số sát thương, vùng báo trước đòn quái vẽ mịn ở đây).
- Vòng lặp cố định 60 bước/giây, khoá màn hình ngang (cầm dọc thì cả khung xoay 90 độ).
- Cỡ trên màn hình thế giới: em bé cao khoảng **33 điểm ảnh** (22×33), quái thường 20–45 điểm ảnh, trùm vùng tới ~120 điểm ảnh.

## 3. Cách vẽ nhân vật (em bé)
- Em bé dựng theo **lớp**: lưng (đồ đeo lưng) → thân trần → áo → mũ → mặt nạ → vũ khí sống. Đổi trang phục là đổi lớp.
- Gốc toạ độ là điểm giữa hai bàn chân, quay mặt sang phải (quay trái thì lật ngang), **nguồn sáng từ trên bên phải**.
- Mỗi chất liệu là bộ ba sắc độ **[tối, vừa, sáng]**: mép trên tự sáng, mép dưới và mép trái tự tối. Viền ngoài màu mực tím đen `#1b1118`.
- Tỉ lệ chibi: đầu/mũ trùm chiếm ~2/5 chiều cao, áo choàng ngắn tới 2/3, hai chân ngắn.
- Mặt là khối tròn nhạt `#f6f0e2` kiểu mặt nạ, mắt đơn giản.
- Động tác có khung vẽ sẵn bằng code: đứng thở, chạy, đánh (theo từng loại vũ khí và từng nhát của chuỗi), lăn né, trúng đòn, chết, kéo cung, quét…
- Vũ khí "sống" có mắt, vẽ riêng (weapon_art), gắn vào tay theo điểm cầm, game tự xoay và vung theo đòn.

## 4. Cách vẽ quái và trùm
- Mỗi quái vẽ bằng "bút vẽ pixel" vào một lưới ô: hình tròn có bóng (bộ ba tối–vừa–sáng), chữ nhật, đường, đa giác; xong **tự thêm viền tối** `#14182e` quanh hình.
- Mỗi quái có hoạt hình riêng bằng code: đứng (idle), đi, lấy đà (báo trước), đánh, trúng đòn, chết; trùm có thêm các pha.
- Màu chính theo vùng: Rừng già nâu/lục/tím độc; Hang biển lam/trắng; Lâu đài cổ cam đỏ/xám đá.
- Quái có thể nghiêng, bẹp, nảy khi trúng đòn (nhún co giãn tối đa ~13%).

## 5. Cách nhân vật hành động (chiến đấu)
- Điều khiển cảm ứng: cần gạt trái để đi; bên phải có nút Đánh (to), Né (lăn), Đặc biệt (chiêu riêng của vũ khí), Chưởng (kỹ năng tốn mana), đổi vũ khí, bình máu. Tự ngắm quái gần nhất theo **8 hướng**.
- **Kiếm**: chuỗi 3 nhát (chém ngang 0,30 giây, chém ngược 0,30 giây, nhát kết 0,46 giây); né xong đánh ngay ra "nhát lướt"; chiêu Đặc biệt **Trảm Nguyệt** phóng vệt trăng lưỡi liềm xuyên quái.
- **Cung**: bấm bắn, giữ để kéo căng; Đặc biệt **Mưa Tên**.
- **Giáo**: loạt đâm, tầm xa nhất; Đặc biệt **Phi Thương** (ném giáo xuyên hàng, ghim con cuối, giáo tự bay về).
- **Búa**: lấy đà, nặng (0,8 giây/nhát), làm choáng; Đặc biệt **Địa Chấn** (nện đất, vệt nứt chạy theo hướng nhắm).
- **Chưởng**: 3 cây — Hoả chưởng (cầu lửa nổ lan), Độc chưởng (luồng độc để lại mây độc), Băng chưởng (mũi băng xuyên, làm chậm); giữ để tích lực.
- Nhịp đòn em bé: lấy đà (giữ khung chuẩn bị lâu hơn) → vung nhanh dần → giữ khung trúng (0,43–0,53 thời gian đòn) → thu đòn chậm dần.
- Hệ: Lửa gây cháy, Độc gây tầng độc, Băng làm chậm/đóng băng; kết hợp hệ ra Nổ khói, Sốc nhiệt…
- Quái báo trước đòn bằng **vùng đỏ trong suốt** hiện mượt, đầy dần từ gốc ra, 15% cuối sáng lên và có mũi chữ V chỉ hướng, chớp khi ra đòn rồi tan ~0,2 giây.

## 6. Hiệu ứng (đã có)
- **Vệt vũ khí** bám đường đi thật của mũi vũ khí (nhớ 12 điểm), đầu sáng – thân màu hệ – đuôi tối thưa điểm ảnh; nhát kết dài/đậm hơn, chí mạng đổi vàng.
- **Trúng đòn**: chớp trắng quái (0,55 / 0,7 / 0,85 theo mức thường / nặng / chí mạng), nghiêng 1,5–5 độ, nảy 2–3 điểm ảnh, tia lửa và mảnh văng theo hướng đánh, vòng sáng khi đòn nặng/chí mạng.
- **Khựng hình (hit-stop)** 45–115 phần nghìn giây tuỳ đòn; nút bấm trong lúc khựng vẫn được nhận.
- **Rung màn hình** kiểu "trauma" có trần (±4/±3 điểm ảnh), nhiều quái trúng cùng lúc thì giảm dần; tắt được.
- **Số sát thương**: bật to 0,07 giây rồi bay lên chậm dần, viền tối, chí mạng to hơn.
- **Hạt**: kho 400 hạt dùng lại, bảng màu theo vòng đời từng hệ (lửa: `#fff3b0 → #ffd23f → #ffa53a → #ff7a2a → #d8481a → #a8320a`; độc: `#e6ffc0 → #6fcf3a → #2f6b1a`; băng: `#ffffff → #7fd4ff → #2b6ea3`), khói, bụi, hơi nước.
- **Độc**: sương lục/tím bay vòng quanh thân, hạt nổi lên rồi tan, mỗi nhịp sát thương độc "nhói"; vũng độc loang chuyển động.
- **Tên/đạn**: lõi sáng, thân, đuôi chấm thưa; trúng thì tia văng theo hướng bay.
- **Vòng phép** khi nổ chưởng: hiện (nở lố 8%) → sáng nhất → tan; vòng chấm và ký tự xoay ngược nhau.
- **Bậc cường độ**: đòn thường < chí mạng < chưởng < chưởng tích lực (rung, khựng, chớp, mật độ hạt tăng dần).
- **Quái chết**: chớp – co lại – tan thành hạt điểm ảnh. Bóng mờ (afterimage) khi lăn né.
- **Môi trường**: Rừng già có đom đóm, lá rơi, cỏ lay, nấm phát sáng; Hang biển nước gợn, giọt nước rơi, sương sát sàn; Lâu đài cổ đuốc chập chờn, cửa sổ kính màu; Làng có sậy và áo phơi lay, đèn lồng, sông gợn, người làng thở mỗi người một nhịp.
- **Giao diện**: thanh máu tụt dần (phần vừa mất chớp trắng rồi vàng nhạt rồi rút; hồi máu hiện xanh), nút nảy khi bấm, linh khí bay vào ô vũ khí, thông báo nảy rồi mờ.

## 7. Màu sắc hiện tại
- Hệ: Lửa `#ff7a2a` (sáng `#ffd23f`, tối `#a8320a`), Độc `#6fcf3a` (`#c2f58a`, `#2f6b1a`), Băng `#7fd4ff` (`#e9f9ff`, `#2b6ea3`).
- Bậc vũ khí: Thường `#d6d2c8`, Lam `#6fb2ff`, Tím `#c88cff`, Vàng `#ffd24a`.
- Viền: em bé `#1b1118` (mực tím đen), quái `#14182e` (xanh đen).
- Vùng nguy hiểm của quái: đỏ trong suốt, viền sáng mảnh.
- Giao diện: gỗ nâu, viền đồng/vàng, nền xanh đen; nút tròn kiểu trống đồng.
- Làng: cảnh chạng vạng/đêm, xanh đen, đèn lồng cam.
- Phòng chiến đấu: sàn nâu đất, viền hàng rào gỗ, góc tối (vignette).

## 8. Những điểm yếu tôi tự thấy (nhìn ảnh)
- Phòng chiến đấu: sàn là một mảng nâu phẳng rắc nhiều chấm sáng ngẫu nhiên gây rối; hàng rào lặp đều, không bóng đổ; góc phòng tối nặng; em bé và quái nhỏ, cùng tông với nền nên khó nhận trên điện thoại; chưa tách tiền cảnh/hậu cảnh.
- Màn đăng nhập: chữ "LINH KHÍ" đè lên trống đồng, dòng phụ đè lên nhà; hình em bé lửa khổng lồ vỡ điểm ảnh đè lên nút; các nút và dòng chữ cùng độ nổi.
- HUD: thanh máu nhỏ; nhiều khung chữ nhật rời mỗi cái một kiểu viền; dải hướng dẫn đè khu chơi.
- Toàn game tối, độ bão hoà thấp; tôi thấy các game pixel khác "tươi" hơn nhiều.
- Độ phân giải 480×270 làm nhân vật rất nhỏ (33 điểm ảnh) nên khó vẽ chi tiết.

## 9. Những gì đang làm tiếp (để bạn biết, tránh góp ý trùng)
- Sàn nhiều lớp, bỏ chấm rối, bóng đổ tường/rào/cây, ánh sáng và sương nhẹ theo vùng, tiền cảnh mép dưới, nền dịu để nhân vật nổi; lập bảng màu chung.
- Viền tối + vành sáng cho sprite để dễ nhìn trên điện thoại; rà lại cử động quái; bụi bước chân; phân biệt vùng "sắp nguy hiểm" và "đang gây sát thương".
- Làm lại HUD (thanh máu to, thanh trùm nổi bật, khung kỹ năng thống nhất), màn đăng nhập, vùng an toàn tai thỏ.

## 10. Ràng buộc
- Giữ phong cách pixel art, giữ chủ đề dân gian Việt, giữ cơ chế chơi, vùng đánh, thời gian ra đòn.
- Phải chạy mượt trên điện thoại tầm trung trong trình duyệt.
- Người làm game không biết vẽ tay; hình hiện nay do AI viết code vẽ. Có thể dùng Gemini để tạo ảnh nếu thật cần, nhưng ghép ảnh AI vào game đã từng thất bại (các mảnh rời ráp lại trông không khớp).

Cảm ơn bạn. Hãy trả lời theo thứ tự 6 câu hỏi ở đầu, mỗi góp ý kèm lý do và cách làm cụ thể.
