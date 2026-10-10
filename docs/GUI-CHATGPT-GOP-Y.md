# LINH KHÍ (Spiritblade) — Tài liệu giới thiệu toàn bộ game để xin góp ý

Chơi thử: **https://spiritblade.web.app** (trình duyệt, tốt nhất trên điện thoại cầm ngang). Kèm theo 3 ảnh chụp 960×540: màn đăng nhập, làng, một phòng chiến đấu.

## Tôi muốn bạn góp ý gì
Hãy nhận xét như một **người chơi khó tính** và một **nhà thiết kế game indie có kinh nghiệm**. Không cần viết code. Trả lời theo các mục:
1. **Ấn tượng đầu tiên** (5 giây đầu, 5 phút đầu): hấp dẫn hay chưa, vì sao?
2. **Hình ảnh**: 5 điểm trông nghiệp dư nhất (chỉ rõ vị trí trên ảnh); màu nào nên đổi sang mã màu nào; độ tương phản nhân vật – nền.
3. **Chuyển động và cảm giác đánh** (game feel): còn thiếu gì so với Hades, Dead Cells, Enter the Gungeon, Moonlighter, Eastward?
4. **Giao diện trên điện thoại**: HUD, nút, bảng chọn — nên sắp xếp lại ra sao?
5. **Lối chơi và vòng lặp**: có đủ lý do để chơi tiếp không, chỗ nào nhàm, chỗ nào rối?
6. **Tiến triển và kinh tế**: cày cuốc có hợp lý không, có quá nhiều hệ thống chồng chéo không?
7. **Chủ đề dân gian Việt**: đã khai thác tốt chưa, nên đẩy mạnh nét gì để game có bản sắc?
8. **Ba việc nên làm trước nhất** để game đẹp và hay hơn rõ rệt.
Mỗi góp ý xin kèm lý do và cách làm cụ thể (số điểm ảnh, mã màu, số khung hình, thời gian tính bằng giây…).

---

## 1. Tổng quan
- **Thể loại**: hành động nhập vai (action RPG) góc nhìn từ trên xuống chéo, kiểu Zelda / Hades thu nhỏ, đánh theo ải.
- **Chủ đề**: dân gian Việt Nam. Người chơi là một **em bé tinh linh** cầm **vũ khí sống** (vũ khí có mắt, lớn lên theo người chơi). Câu giới thiệu: *"Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn."*
- **Nền tảng**: trình duyệt (HTML5), ưu tiên điện thoại cầm ngang; có thể "Thêm vào màn hình chính" như ứng dụng. Đăng nhập Google để lưu tiến trình lên mây.
- **Phong cách hình**: pixel art, tông trầm (xanh rêu, xanh đen, nâu đất), đèn lồng cam, mọi hình đều vẽ bằng code (không dùng ảnh).

## 2. Vòng lặp chơi
1. Ở **làng** (khu trung tâm): nói chuyện với người làng để rèn vũ khí, may đồ, học kỹ năng, xem bảng xếp hạng, chọn ải.
2. **Vào ải**: mỗi ải là một bản đồ **8 phòng vuông** sinh ngẫu nhiên (3 kiểu bố cục: đường chính ngoằn ngoèo, mê cung nhỏ có đường vòng, sảnh giữa + 3 cánh giữ 3 mảnh chìa). Có phòng Bắt đầu, các phòng quái (đóng cửa tới khi dọn sạch), **Suối hồi** (hồi máu/mana), phòng **Trùm**.
3. Hạ trùm → màn kết quả: vàng, nguyên liệu, kinh nghiệm, có thể rơi vũ khí/trang phục, vũ khí nhận "linh khí".
4. Về làng nâng cấp → thử ải khó hơn hoặc chơi lại để cày.
- **15 ải** chia 3 vùng; ải 5, 10, 15 là trùm vùng. Thua không mất đồ, chỉ về làng (bảng thua gợi ý nên cày gì).

## 3. Thế giới
| Vùng | Hệ | Trùm nhỏ | Trùm vùng | Nguyên liệu | Màu chủ đạo |
|---|---|---|---|---|---|
| Rừng già | Độc | Nấm Chúa | Mộc Tinh | Gỗ linh | lục rêu, nâu, tím độc |
| Hang biển | Băng | Cua Đá | Ngư Tinh | Vảy cá | lam, xám đá, trắng |
| Lâu đài cổ | Lửa | Hổ Lửa | Hồ Tinh (cáo chín đuôi) | Đá lửa | cam đỏ, xám đá, nâu |

**Làng**: cây đa, lò rèn, nhà tranh, dây phơi áo, sông và đò, đèn lồng; cảnh chạng vạng. Người làng: Thợ Rèn (lò rèn), Thợ May, Lái Đò, Cụ Đồ (gốc đa: kỹ năng, hướng dẫn, bảng vàng), anh Mõ (cài đặt, đăng nhập), người bán hàng.

## 4. Nhân vật chơi được (4 em bé)
| Em bé | Máu | Mana | Tốc độ | Vũ khí hợp | Nội tại | Mở khoá |
|---|---|---|---|---|---|---|
| Thợ Rèn | 100 | 100 | 1,0 | Kiếm, Búa | Vũ khí nhận linh khí nhanh hơn 20% | Có sẵn |
| Thợ Săn | 75 | 90 | 1,15 | Cung, Giáo | +25% sát thương lên mục tiêu bị khống chế | Hạ Mộc Tinh |
| Thầy Lang | 85 | 130 | 1,0 | Giáo, Cung | Hiệu ứng kéo dài hơn 30% | Hạ Ngư Tinh |
| Đô Vật | 140 | 80 | 0,9 | Búa, Giáo | Giảm 25% sát thương nhận, phản 50% cận chiến | Hạ Hồ Tinh |

## 5. Điều khiển (cảm ứng; có hỗ trợ bàn phím)
- Cần gạt ảo bên trái để đi (8 hướng).
- Bên phải: **Đánh** (nút to), **Né** (lăn, có khoảng bất tử ngắn), **Đặc biệt** (chiêu riêng của vũ khí, tốn mana), **Chưởng** (kỹ năng, tốn mana), **đổi vũ khí** (mang 2 vũ khí), **bình máu**.
- Đòn đánh tự ngắm quái gần nhất theo 8 hướng. Giữ nút Đánh để lấy đà (đòn giữ rồi thả).

## 6. Vũ khí
| Loại | Sát thương/nhát | Hồi đòn | Đặc điểm | Chiêu Đặc biệt |
|---|---|---|---|---|
| Kiếm | 9 | 0,36 giây | Nhanh, tầm ngắn; chuỗi 3 nhát (chém ngang 0,30 s, chém ngược 0,30 s, nhát kết 0,46 s); né xong đánh ngay ra "nhát lướt" | **Trảm Nguyệt**: phóng vệt trăng lưỡi liềm xuyên quái |
| Cung | 11,4 | 0,5 giây | Đánh xa, tên xuyên, giữ để kéo căng | **Mưa Tên** |
| Giáo | 10,7 | 0,44 giây | Tầm xa nhất cận chiến, loạt đâm | **Phi Thương**: ném giáo xuyên hàng, ghim con cuối, giáo tự bay về |
| Búa | 21,3 | 0,8 giây | Chậm, nặng, làm choáng | **Địa Chấn**: nện đất, vệt nứt hất tung quái |

- Mỗi loại có **10 dòng vũ khí** mang tên/hình dân gian (Kiếm Tre, Gươm Rồng, Mã Tấu, Đao Cá Chép…; Nỏ Thần, Cung Đàn Bầu…; Đinh Ba, Mái Chèo, Bút Lông…; Chày Giã Gạo, Chiêng Đồng, Trống Đồng…).
- **4 bậc**: Thường, Lam (+1 dòng phụ), Tím (+2), Vàng (+2 và một dòng mạnh riêng). Trùm vùng lần đầu chắc chắn rơi vũ khí Vàng.
- **Linh khí và tiến hoá**: kết liễu quái đang dính hiệu ứng hệ (hoặc hạ tinh anh/trùm) thì vũ khí nhận "dấu ấn" hệ đó. Mốc **30 / 120 / 300** dấu ấn: Trắng → Mầm → Thành hình → Thức tỉnh; mỗi mốc mạnh thêm và mở đặc trưng theo hệ:
  - Lửa: Vệt cháy (đòn mạnh để lại vệt lửa), Nổ lan (quái đang cháy chết thì nổ).
  - Độc: Vũng độc, Lây độc (quái trúng độc chết thì lây sang bên cạnh).
  - Băng: Gai băng (mọc gai trên đất, làm chậm), Băng vỡ (quái đóng băng bị đánh thì vỡ, mảnh văng trúng quanh).
- Kết hợp hai hệ trên một quái tạo phản ứng: **Nổ khói**, **Sốc nhiệt**…
- Rèn ở lò: mài (tăng chỉ số), nâng bậc, nâng cấp lò.

## 7. Chưởng (kỹ năng tốn mana)
- 3 cây, mỗi lúc dùng một (đổi miễn phí ở làng): **Hoả chưởng** (cầu lửa nổ lan), **Độc chưởng** (luồng độc để lại mây độc), **Băng chưởng** (mũi băng xuyên, làm chậm). Giữ nút để **tích lực** thành chưởng tối thượng.
- Mỗi cấp nhân vật +1 điểm chưởng. Mỗi em bé có nét chưởng riêng (Thợ Rèn đẩy lùi mạnh, Thợ Săn bay xa, Thầy Lang hồi máu khi trúng, Đô Vật tầm gần nhưng to).

## 8. Tiến triển khác
- **Cấp nhân vật** tối đa 40 (mỗi cấp +1,5% sát thương, +3,5% máu).
- **Cây kỹ năng** 3 nhánh × 5 nút, mở theo thứ tự: **Công** (sát thương, chí mạng…), **Thủ** (máu, né, giảm sát thương…), **Hệ** (mana, kéo dài hiệu ứng, phản ứng hệ mạnh hơn…).
- **Trang phục** 5 ô: Mũ, Áo, Đồ đeo lưng, Bùa/vật cầm tay, Cánh; 4 bậc như vũ khí; kháng hệ; bộ theo vùng (bộ Mộc, bộ Ngư, bộ Hồ). Kiếm bằng rơi, mua, may ở Thợ May.
- **Bùa** có hiệu ứng riêng (hút máu khi kết liễu, tham vàng đổi lấy máu…).
- **Sức mạnh** (một con số tổng hợp) dùng để xếp hạng; chỉ tăng nhờ cày (cấp, mài, bậc, tiến hoá, lò, kỹ năng, trang phục).
- **Bảng vàng** (xếp hạng trực tuyến): theo Sức mạnh.
- **Tài nguyên**: vàng, 3 loại nguyên liệu vùng, mảnh trùm, linh khí 3 hệ.

## 9. Quái
- **36 quái và trùm**, mỗi vùng: 8 quái thường, 2 tinh anh, 1 trùm nhỏ, 1 trùm vùng. Ví dụ:
  - Rừng già: Heo Rừng Con, Bầy Ong Vò Vẽ, Bọ Hung Mai Cứng, Hoa Phun Bào Tử, Chồn Bóng, Nấm Phồng, Sóc Ném Quả Nổ, Nhím Gai Độc; tinh anh Heo Rừng Nanh Dài, Nấm Phồng Chúa.
  - Hang biển: Cua Lính, Bầy Cá Con, Ốc Mượn Hồn, Hải Quỳ, Cá Chuồn, Cá Nóc, Sứa Bom, Nhím Biển; tinh anh Cua Tướng, Cá Nóc Chúa.
  - Lâu đài cổ: Lính Ma Giáp Gỉ, Bầy Dơi Than, Tượng Đá Cầm Khiên, Đèn Lồng Ma, Mèo Đen Hai Đuôi, Hũ Lửa Sống, Tiểu Yêu Ném Pháo, Nhím Than Hồng; tinh anh Tướng Ma, Hũ Lửa Chúa.
- **Kiểu hành vi**: xông thẳng, bầy nhỏ, cầm khiên (giảm sát thương phía trước), xạ thủ (ngắm 0,7 giây rồi bắn mỗi 3 giây), nhanh nhẹn, cảm tử, đặt bom, gai (phản đòn).
- **Tinh anh** có thêm thuộc tính ngẫu nhiên: Nhanh, Bọc giáp (−35% sát thương nhận), Nổ khi chết (vòng đỏ), Hút máu.
- Mỗi quái có một nét "phá cách" dân gian để dễ nhớ (mặt nạ tuồng, mái nhà tranh trên lưng heo, vỏ dừa làm mũ cho cua…).
- **Quái báo trước đòn**: vùng đỏ trong suốt hiện lên, đầy dần từ gốc ra; sắp ra đòn thì sáng lên và có mũi chỉ hướng; ra đòn thì chớp rồi tan.
- **Quái "học theo bạn"**: trùm ghi nhận cách người chơi đánh (hệ hay dùng, đánh xa/gần, hay né) để điều chỉnh.

## 10. Hình ảnh — cách vẽ
- **Hai lớp màn hình**:
  - Lớp thế giới: độ phân giải thật **480×270 điểm ảnh**, phóng to vừa màn hình kiểu pixel, không làm mịn. Sàn, tường, nhân vật, quái, hiệu ứng đều ở đây.
  - Lớp giao diện: nét cao theo màn hình (chữ, nút, thanh máu, số sát thương, vùng báo trước đòn).
- **Mọi hình vẽ bằng code**: tô từng ô vuông màu phẳng, toạ độ nguyên.
- **Em bé**: cao khoảng **33 điểm ảnh** (22×33), tỉ lệ chibi (đầu/mũ trùm ~2/5 chiều cao). Dựng theo lớp: đồ đeo lưng → thân → áo → mũ → mặt nạ → vũ khí. Mặt tròn nhạt `#f6f0e2` kiểu mặt nạ. Mỗi chất liệu là bộ ba sắc độ [tối, vừa, sáng]; mép trên sáng, mép dưới và trái tối; **nguồn sáng trên bên phải**; viền ngoài mực tím đen `#1b1118`. Quay mặt phải, quay trái thì lật ngang.
- **Quái**: vẽ vào lưới ô bằng hình tròn có bóng, chữ nhật, đường, đa giác, rồi tự thêm **viền xanh đen** `#14182e`. Cỡ 20–45 điểm ảnh; trùm vùng tới ~120 điểm ảnh.
- **Vũ khí sống**: vẽ riêng, có mắt; gắn vào tay theo điểm cầm, game tự xoay và vung theo từng đòn.
- **Sàn và phòng**: sàn theo vùng (đất, đá, gạch), viền tường/hàng rào, vật trang trí (đá, cỏ, nấm, nhũ đá, tinh thể, đuốc, cửa sổ kính màu), góc phòng tối dần.

## 11. Chuyển động
- Em bé có khung động tác riêng: đứng thở, chạy, đánh (theo từng vũ khí và từng nhát), lăn né, trúng đòn, chết, kéo cung, quét.
- Nhịp đòn: **lấy đà** (giữ khung chuẩn bị) → vung nhanh dần → **giữ khung trúng** (khoảng 43–53% thời gian đòn) → **thu đòn** chậm dần.
- **Nhún, co giãn** (tối đa ~13%): khi chạm đất sau né, dừng chạy, quay đầu, lấy đà, ra đòn, trúng đòn; quái bẹp theo hướng bị đánh, nghiêng, nảy.
- Quái có hoạt hình riêng: đứng, đi, lấy đà, đánh, trúng đòn, chết; trùm có nhiều pha.
- Bóng mờ (afterimage) khi lăn né. Người làng thở, mỗi người một nhịp; khăn, nơ, râu, vành mũ đung đưa.

## 12. Hiệu ứng chiến đấu
- **Vệt vũ khí** bám đúng đường đi của mũi vũ khí: đầu sáng – thân màu hệ – đuôi tối thưa điểm ảnh; nhát kết dài và đậm hơn; chí mạng đổi vàng.
- **Trúng đòn** 3 mức (thường / nặng / chí mạng): chớp trắng, nghiêng 1,5–5 độ, nảy 2–3 điểm ảnh, tia lửa và mảnh văng theo hướng đánh, vòng sáng khi đòn nặng hoặc chí mạng.
- **Khựng hình** 45–115 phần nghìn giây tuỳ đòn (nút bấm trong lúc khựng vẫn được nhận).
- **Rung màn hình** có giới hạn (tối đa ±4 / ±3 điểm ảnh), nhiều quái trúng cùng lúc thì giảm dần, có thể tắt.
- **Số sát thương**: bật to rồi bay lên chậm dần, viền tối; chí mạng to hơn.
- **Hạt**: tối đa 400 hạt dùng lại; bảng màu theo vòng đời từng hệ.
- **Độc**: sương lục/tím bay quanh thân, hạt nổi lên rồi tan, mỗi nhịp sát thương "nhói"; vũng độc loang chuyển động.
- **Tên/đạn**: lõi sáng, thân, đuôi chấm; trúng thì tia văng theo hướng bay.
- **Vòng phép** khi nổ chưởng: hiện ra → sáng nhất → tan; vòng và ký tự xoay ngược nhau. Chưởng tích lực có vòng lớn dần dưới chân.
- **4 mức cường độ**: đòn thường < chí mạng < chưởng < chưởng tích lực (rung, khựng, chớp, mật độ hạt tăng dần).
- **Quái chết**: chớp – co lại – tan thành hạt.
- **Đồ rơi**: nảy lên, nhấp nhô; đồ có bậc có cột sáng màu bậc; lại gần tự hút về; linh khí bay vào ô vũ khí.
- **Môi trường động**: Rừng già (đom đóm, lá rơi, cỏ lay, nấm phát sáng), Hang biển (nước gợn, giọt nước, sương sát sàn), Lâu đài cổ (đuốc chập chờn, cửa sổ kính màu), Làng (sậy và áo phơi lay, đèn lồng, sông gợn, lò rèn hắt sáng).

## 13. Màu sắc
- **Hệ**: Lửa `#ff7a2a` (sáng `#ffd23f`, tối `#a8320a`); Độc `#6fcf3a` (`#c2f58a`, `#2f6b1a`); Băng `#7fd4ff` (`#e9f9ff`, `#2b6ea3`).
- **Bậc đồ**: Thường `#d6d2c8`, Lam `#6fb2ff`, Tím `#c88cff`, Vàng `#ffd24a`.
- **Nền vùng (trời/đất)**: Rừng già `#16261c → #2c5234`, đất `#3d5a2a`; Hang biển `#0d1826 → #1c3f5c`, đất `#48586a`; Lâu đài cổ `#2a1410 → #70301c`, đất `#6b4a38`.
- **Viền**: em bé `#1b1118`, quái `#14182e`.
- **Vùng nguy hiểm của quái**: đỏ trong suốt, viền sáng mảnh.
- **Giao diện**: gỗ nâu, viền đồng/vàng, nền xanh đen; nút tròn hoạ tiết **trống đồng Đông Sơn**; chữ "Be Vietnam Pro".

## 14. Giao diện
- **Màn đăng nhập**: chữ LINH KHÍ lớn trên nền làng, trống đồng phía sau, câu giới thiệu, nút "Đăng nhập Google", "Bảng vàng", hình em bé lửa lớn bên trái.
- **Làng**: dải tài nguyên trên cùng, hàng biểu tượng người làng (Vào ải, Lò rèn, Vũ khí, Mũ áo, Kỹ năng, Hero, Cài đặt), nút Hành trang, cần gạt, nút Nói chuyện, dải hướng dẫn dưới cùng.
- **Trong ải**: thanh máu/mana góc trên trái (tụt dần khi mất máu), nút bình máu, tên vùng và sức mạnh, dải hướng dẫn trên cùng, 2 thẻ vũ khí và 3 vạch linh khí góc trên phải, bản đồ nhỏ, cần gạt trái, cụm nút phải (Đánh to, Né, Đặc biệt, Chưởng có số mana).
- **Bảng**: Hành trang (túi đồ, nhân vật, trang bị), Lò rèn, Kỹ năng, Cụ Đồ (hướng dẫn), Bảng vàng.

## 15. Âm thanh
- Hiệu ứng âm thanh tổng hợp bằng code (Web Audio): chém, trúng, nổ, nhặt đồ, giao diện. Chưa có nhạc nền.

## 16. Ràng buộc
- Giữ pixel art và chủ đề dân gian Việt; phải chạy mượt trên điện thoại tầm trung trong trình duyệt.
- Không có hoạ sĩ; mọi hình hiện do code vẽ. Có thể dùng AI tạo ảnh nếu thật cần.
- Muốn giữ nguyên lối chơi cốt lõi; sẵn sàng đổi hình ảnh, giao diện, nhịp độ, cân bằng nếu góp ý hợp lý.

Cảm ơn bạn! Xin trả lời theo 8 mục ở đầu, ưu tiên những gì làm game **đẹp hơn và hay hơn nhiều nhất với ít công sức nhất**.
