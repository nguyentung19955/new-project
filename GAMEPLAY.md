# Núi Cao Nước Dâng · Tóm tắt gameplay (phiên bản 14 · chủ đề Sơn Tinh Thủy Tinh)

> Tài liệu bàn giao thiết kế đầy đủ: `docs/HANDOFF.md`. Ghi chú những gì đã làm trong code: mục 14 ở cuối.

Game thủ thành trên điện thoại, chơi **màn hình ngang**, lấy cảm hứng từ Dota 1 và truyền thuyết **Sơn Tinh Thủy Tinh**. Người chơi vào vai Sơn Tinh, triệu hồi các tướng Văn Lang đứng dọc đường đi để chặn đạo quân thủy quái của Thủy Tinh tràn vào **thành Phong Châu**. Người chơi dùng vàng để nâng cấp tướng, mở kỹ năng và tiến hoá, và mặc đồ sẽ làm thay đổi hình dạng tướng.

> **Thay đổi so với phiên bản 12:** giữ nguyên toàn bộ cơ chế và số liệu, đổi tên tướng / quái / boss / vật phẩm theo chủ đề, Cây Sự Sống thành **Núi Tản Viên**, thêm cơ chế mới **Nước Dâng** (mục 9).
>
> **Thay đổi ở phiên bản 14:** bỏ hẳn mọi tiến triển dựa trên số quái đã hạ. Người chơi **dùng vàng** để nâng cấp tướng (mục 2), mở khóa kỹ năng W/E/R (mục 3) và tiến hoá (mục 4). Thêm mục 12: các phần thiết kế còn phải làm.

---

## 1. Vòng chơi chính

1. **Triệu hồi tướng:** chạm vào bãi cỏ sát đường rồi chọn tướng ở bảng **Triệu hồi** góc dưới phải. Cũng có thể chọn tướng trước rồi chạm vào ô trống.
   - Bản đồ có khoảng **43 ô đặt tướng** xếp dày nhiều hàng, chia theo **3 bậc độ cao** (xem mục 9).
   - Giữ và kéo một tướng để đổi chỗ.
2. **Chạy / Dừng:** dùng một nút ▶ / ■ trên cùng bên phải.
   - Các đợt quái tự nối tiếp nhau, giữa hai đợt nghỉ 10 giây.
   - **Gọi sớm** dùng được bất cứ lúc nào, kể cả giữa đợt, và cho thêm vàng.
   - Nút **x1 / x2** đổi tốc độ game.
3. **Quái** theo dòng sông đi vào thành. Mỗi con lọt vào thành Phong Châu làm mất mạng (khởi đầu 20 mạng, boss lấy 5 mạng). Hết mạng là thua: nước nhấn chìm Phong Châu.
4. **Thắng:** trụ qua đủ **30 đợt** và đánh bại Thủy Tinh. Sau đó có thể chơi tiếp chế độ **vô tận** ("Năm nào cũng dâng nước"), cứ 10 đợt lại có boss.
5. **Mở bảng không dừng game:** khi mở các màn hình (Cây kỹ năng, Lò đúc đồng, …), quái vẫn tiếp tục chạy.

Vàng khởi đầu là 220. Vàng kiếm được từ hạ quái, gọi sớm, Núi Tản Viên và bán tướng (hoàn lại 60%). Vàng dùng để triệu hồi tướng, **nâng cấp tướng**, mua và ghép đồ.

---

## 2. Tướng Văn Lang

Có 6 tướng chia theo 3 thuộc tính, mỗi thuộc tính 2 tướng. Sát thương **vật lý** bị giáp giảm; sát thương **phép** bị kháng phép giảm.

| Tướng | Thay cho | Hệ | Giá | Kiểu đánh | Sát thương |
|---|---|---|---|---|---|
| Lạc Tướng | Hiệp Sĩ | Sức mạnh | 70 | Cận chiến, rìu đồng chém lan | Vật lý |
| Lực Sĩ Núi | Đồ Tể | Sức mạnh | 80 | Cận chiến, trâu bò | Vật lý |
| Xạ Thủ Văn Lang | Cung Thủ | Nhanh nhẹn | 55 | Đánh xa bằng nỏ, bắn được quái bay | Vật lý |
| Thợ Săn Rừng | Sát Thủ | Nhanh nhẹn | 75 | Cận chiến, dao găm, chí mạng | Vật lý |
| Thầy Mo Lửa | Pháp Sư Lửa | Trí tuệ | 85 | Phép nổ lan, đốt cháy | Phép |
| Thần Sương Núi | Pháp Sư Băng | Trí tuệ | 80 | Phép làm chậm, đóng băng | Phép |

- **Thuộc tính:**
  - Sức mạnh tăng máu và hồi máu.
  - Nhanh nhẹn tăng tốc đánh.
  - Trí tuệ tăng sức mạnh kỹ năng, giảm hồi chiêu, tăng năng lượng.
  - Thuộc tính chính của tướng cộng thẳng vào sát thương.
- **Tướng có máu:** Phù Thủy Nước và boss đánh được tướng. Tướng gục sẽ hồi sinh sau vài giây.
- **Tướng cận chiến không đánh được quái bay.**
- **Nâng cấp bằng vàng:** chọn tướng rồi bấm **Nâng cấp** để trả vàng lên 1 cấp, tối đa cấp 25. Mỗi cấp cho **1 điểm kỹ năng**. Tướng **không** nhận kinh nghiệm từ quái nữa.
  - Giá đề xuất: **20 + 10 × cấp hiện tại** (cấp 1→2: 30 vàng, cấp 9→10: 110 vàng, cấp 24→25: 260 vàng). *Cần chơi thử để cân bằng với thu nhập vàng.*
  - Bán tướng hoàn 60% giá triệu hồi **cộng 60% số vàng đã nâng cấp** (đề xuất, để người chơi không sợ nâng cấp).
  - Phần thưởng boss "Hội làng mừng thắng" (+2 cấp toàn quân) giữ nguyên.

### Tướng huyền thoại *(mới · đề xuất, số liệu cần cân bằng)*

Ngoài 6 tướng cơ bản, có thêm 10 tướng lấy từ truyền thuyết Việt. Mỗi tướng có một **đặc trưng** riêng mà không tướng nào khác có. Triệu hồi trong trận bằng vàng: **Sử thi 180 vàng, Huyền thoại 260 vàng**; trên sân tối đa **2 tướng Huyền thoại** cùng lúc. Nâng cấp, mở kỹ năng, tiến hoá vẫn mua bằng vàng như tướng thường.

| Tướng | Hệ | Bậc | Đặc trưng | Q | W | E | R |
|---|---|---|---|---|---|---|---|
| **Thánh Gióng** | Sức mạnh | Huyền thoại | **Vươn Vai:** mỗi đợt trên sân to thêm, +5% máu và sát thương (tối đa 10 lần) | Gậy Tre Ngà: quật lan, choáng ngắn | Giáp Sắt: giảm sát thương nhận vào | Ngựa Sắt Phun Lửa: vệt lửa dọc đường | Bay Về Trời: lướt dọc sông, đánh mọi quái trên đường |
| **Lạc Long Quân** | Sức mạnh | Huyền thoại | **Con Rồng:** không bị sa lầy; đứng ô ngập +30% sát thương | Vuốt Rồng | Vảy Rồng: +giáp, +kháng phép | Gầm Biển: sóng đẩy lùi quái | Hóa Rồng: phun nước kèm sét theo đường thẳng |
| **Thần Kim Quy** | Sức mạnh | Huyền thoại | **Mai Thần:** tướng đứng kề nhận ít hơn 30% sát thương | Mai Vàng: khiên cho tướng gần | Móng Thần: tướng gần xuyên 20% giáp | Địa Chấn: choáng vùng | Kim Quy Hộ Thành: 5 giây quái lọt vào thành không trừ mạng |
| **Thạch Sanh** | Nhanh nhẹn | Huyền thoại | **Niêu Cơm Thần:** tướng đứng gần hồi năng lượng nhanh hơn | Rìu Đốn Củi | Cung Tên Vàng: x2 sát thương lên quái bay | Đàn Thần: quái đứng nghe nhạc, choáng 1,5 giây | Diệt Chằn Tinh: đòn cực mạnh, x3 lên boss |
| **Cao Lỗ** | Nhanh nhẹn | Sử thi | **Xuyên Giáp:** đòn đánh bỏ qua 50% giáp | Nỏ Liên Châu: 3 mũi cùng lúc | Lẫy Thần: +tốc bắn | Tên Móng Rùa: xuyên giáp toàn phần | Nỏ Thần: một phát xuyên cả hàng quái |
| **Mai An Tiêm** | Nhanh nhẹn | Sử thi | **Đảo Trù Phú:** +20 vàng mỗi đợt | Ném Dưa Hấu: làm chậm | Hạt Giống Vàng: thêm vàng khi hạ quái | Chim Thần: đàn chim mổ quái | Mưa Dưa: dưa rơi khắp bản đồ |
| **Âu Cơ** | Trí tuệ | Huyền thoại | **Mẹ Tiên:** hồi máu từ từ cho tướng xung quanh | Hoa Tiên: hồi máu | Lông Vũ Tiên: bắn lông vũ | Núi Mẹ: đá trồi lên làm chậm | Bọc Trăm Trứng: nở đàn Lạc Tử chặn đường |
| **Chử Đồng Tử** | Trí tuệ | Sử thi | **Gậy Thần:** hồi sinh ngay 1 tướng gục gần nhất (hồi chiêu dài) | Gậy Thần: hồi máu | Nón Thần: chặn đòn bắn từ xa | Sóng Sông Hồng: làm chậm | Thành Một Đêm: dựng thành chặn đường 6 giây |
| **Tiên Dung** | Trí tuệ | Sử thi | **Đôi Uyên Ương:** đứng cạnh Chử Đồng Tử thì cả hai +20% sát thương phép | Quạt Tiên: gió đẩy lùi | Ánh Ngọc: +sát thương phép cho tướng gần | Sen Hồng: hồi máu | Mưa Hoa Tiên: hoa rơi vừa gây sát thương vừa hồi máu |
| **Lang Liêu** | Trí tuệ | Sử thi | **Lễ Vật Đất Trời:** tướng gần +10% máu tối đa | Bánh Chưng: khiên cho tướng gần | Bánh Giầy: hồi máu | Ruộng Lúa: lúa mọc làm chậm | Lễ Tổ Tiên: toàn quân hồi đầy máu, bất tử 2 giây |

---

## 3. Kỹ năng Q W E R

Mỗi tướng có 4 kỹ năng. Q mở sẵn; **W, E, R mở khóa bằng vàng** trong Cây kỹ năng (giá đề xuất, cần cân bằng):

| Kỹ năng | Giá mở khóa | Điều kiện |
|---|---|---|
| W | 60 vàng | không |
| E | 150 vàng | tướng cấp 3 |
| R | 300 vàng | tướng cấp 6 |

Sau khi mở, sức mạnh kỹ năng tăng theo **2 cách**:

1. **Điểm kỹ năng** (mỗi cấp tướng cho 1 điểm, mà cấp tướng mua bằng vàng): nâng trong **Cây kỹ năng**.
   - Q/W/E nâng tối đa cấp 4 (yêu cầu tướng cấp 3/5/7).
   - R nâng tối đa cấp 3 (yêu cầu tướng cấp 6/11/16).
   - Mỗi cấp kỹ năng thêm +25% sức mạnh.
2. **Trí tuệ** tăng sức mạnh kỹ năng.

Kỹ năng chủ động **tốn năng lượng** và được **tướng tự dùng** khi đủ năng lượng, kèm hiệu ứng hoạt hình.

| Tướng | Q (chủ động, mở ngay) | W (nội tại) | E (nội tại) | R (tối thượng) |
|---|---|---|---|---|
| Lạc Tướng | Khiên Đồng: choáng 1 giây | Rìu Lốc Xoáy: chém lan | Hùng Khí: +tốc đánh | Sấm Tản Viên: sét đánh quái máu cao nhất |
| Lực Sĩ Núi | Dây Mây: kéo quái đi xa nhất lùi lại | Gánh Núi: +sức mạnh | Bụi Đá: gây sát thương quanh mình | Vùi Đá: chôn sống một quái |
| Xạ Thủ Văn Lang | Tên Xuyên Thấu | Đa Tiễn: nhiều mũi tên, +tầm | Tên Tẩm Nhựa Độc | Mưa Tên: vùng rộng |
| Thợ Săn Rừng | Bước Lá Rừng: lướt tới chém chữ X | Dao Ẩn: +sát thương | Đòn Chí Mạng | Săn Mồi: x6 sát thương |
| Thầy Mo Lửa | Cột Lửa: đốt cháy | Đuốc Linh Hồn: +sát thương, nổ to hơn | Lửa Thiêu | Hỏa Sơn: đá lửa rơi từ trời |
| Thần Sương Núi | Vòng Sương: làm chậm 60% | Mũi Sương Giá: +sát thương | Hơi Lạnh Đỉnh Núi: làm chậm | Mù Sương Tản Viên: đóng băng 2 giây |

Số quái đã hạ không còn ảnh hưởng tới kỹ năng.

---

## 4. Tiến hoá

Tiến hoá mua bằng vàng, lần lượt từng bậc (giá đề xuất, cần cân bằng):

| Bậc | Giá | Điều kiện | Thay đổi |
|---|---|---|---|
| ★ | 100 vàng | tướng cấp 5 | Tướng to hơn, có hào quang hoa văn trống đồng, +10% sát thương |
| ★★ | 250 vàng | tướng cấp 10 | +20% sát thương |
| ★★★ | 500 vàng | tướng cấp 15 | +30% sát thương |

Bán tướng cũng hoàn 60% số vàng đã chi cho kỹ năng và tiến hoá.

---

## 5. Trang bị · đổi hình dạng tướng

Mỗi tướng có **6 ô đồ**:

- **3 ô trang phục: vũ khí, mũ, giáp.** Mặc vào là **đổi ngoại hình** tướng: rìu đồng, nỏ, gậy thầy mo, mũ lông chim, mũ sừng, giáp đồng, …
  - Vũ khí chia theo loại tướng: rìu / dao găm cho tướng cận chiến, nỏ cho Xạ Thủ, gậy cho Thầy Mo và Thần Sương Núi.
  - Độ hiếm: Thường, Hiếm, Sử thi, Huyền thoại.
  - Mặc đủ **Bộ Lạc Long** (Long Rìu / Long Nỏ / Long Trượng, Mũ Lạc Long, Giáp Vảy Rồng) được +30% sát thương, tướng **mọc cánh rồng**: dòng dõi Lạc Long Quân.
- **3 ô phụ kiện:** mua ở Lò đúc đồng rồi **ghép** thành đồ mạnh có hào quang riêng.

**Lò đúc đồng** (thay Lò rèn) có 3 tab:

- **Công thức:** ghép đồ, ví dụ:
  - Vuốt Hổ + Găng Da → Song Rìu Cuồng Nộ.
  - Đai + Dép Cỏ + Khăn → Gậy Tam Giới.
  - Khăn Hiền Giả + Mắt Ngọc → Gậy Thời Không.
  - Ngọc Sinh Lực + Đai → Giáp Đồng Bất Diệt.
  - Vuốt Hổ + Dép Cỏ → Lưỡi Hái Chí Tử.
  - **Mới:** Mặt Trống + Dùi Trống → **Trống Đồng**: hào quang tăng tốc đánh cho các tướng xung quanh.
- **Cửa hàng:** phụ kiện cơ bản, giá 100–130 vàng.
- **Hũ báu** (thay Rương): 90 vàng, mở ra đồ ngẫu nhiên.

Quái cũng có tỉ lệ **rơi đồ**. Quái tinh anh và boss rơi đồ xịn hơn.

### Túi đồ, nâng cấp và đổi đồ ra vàng *(đề xuất, số liệu cần cân bằng)*

- **Túi đồ:** chứa đồ chưa mặc, sức chứa 40 ô. Mặc / tháo đồ bằng cách kéo giữa túi và 6 ô của tướng.
- **Cường hóa (+1 đến +5):** trả vàng để nâng 1 món, mỗi cấp **+10% chỉ số gốc** của món đó.
  - Giá lên cấp tiếp = (cấp hiện tại + 1) × hệ số độ hiếm: Thường 20, Hiếm 40, Sử thi 80, Huyền thoại 150. Ví dụ Hiếm +2 → +3 tốn 120 vàng.
- **Thăng phẩm (khi đồ đã full +5):** trả vàng để món đồ lên độ hiếm kế tiếp, cấp cường hóa quay về +0, chỉ số gốc theo độ hiếm mới.
  - Thường → Hiếm 120 vàng · Hiếm → Sử thi 300 vàng · Sử thi → Huyền thoại 600 vàng. Đồ Huyền thoại +5 là tối đa.
- **Khóa đồ:** món đã khóa không bị đổi ra vàng, kể cả khi đổi hàng loạt.
- **Đổi đồ ra vàng** (khi túi quá nhiều đồ):
  - Giá đổi: Thường 15, Hiếm 35, Sử thi 80, Huyền thoại 200 vàng, **cộng 60% số vàng đã cường hóa / thăng phẩm** món đó.
  - Đổi **từng món** trong thẻ chi tiết, hoặc **đổi hàng loạt** bằng **bộ lọc chất lượng**: tick các độ hiếm cần đổi (mặc định Thường + Hiếm), kèm tùy chọn "Bỏ qua đồ đã khóa" (luôn bật) và "Bỏ qua đồ đã nâng cấp".
  - Trước khi đổi luôn hiện bảng xác nhận: số món theo từng độ hiếm, tổng vàng nhận được, cảnh báo nếu có món đã nâng cấp. Không hoàn tác được.

---

## 6. Quân Thủy Tinh

| Quái | Thay cho | Đặc điểm |
|---|---|---|
| Tôm Binh | Yêu Tinh | Đi thành bầy đông, yếu trước sát thương lan |
| Cá Sấu | Sói Hoang | Chạy nhanh; máu dưới 50% thì hóa điên, chạy nhanh gấp rưỡi |
| Rùa Giáp | Golem Đá | Mai rất cứng: giáp và kháng phép rất cao, kháng choáng |
| Phù Thủy Nước | Pháp Sư Quỷ | Phun nước bắn tướng từ xa, hồi máu cho quái xung quanh |
| Chim Bão | Dơi Độc | **Bay**, chỉ tướng đánh xa và tướng phép bắn được |
| Ếch Mẹ | Bọ Phân Thân | Chết thì tách thành 3 Nòng Nọc chạy nhanh |

- Máu quái tăng khoảng **16% mỗi đợt**. Số quái mỗi đợt cũng tăng dần.
- **Quái tinh anh** xuất hiện từ đợt 6:
  - Máu x1.8, thưởng nhiều hơn.
  - Có thêm một đặc tính: Vỏ Cứng (+10 giáp), Nước Thánh (hồi 3% máu/giây), Sóng Cuốn (+40% tốc chạy) hoặc Màng Nước (khiên bằng 40% máu).
- **Bách khoa thủy quái** cho xem thẻ thông tin từng loại quái và lịch đủ 30 đợt.

### Lịch 30 đợt

| Loại đợt | Đợt |
|---|---|
| Rùa Giáp khổng lồ (tinh anh) | 5, 15, 25 |
| Đợt bay (nhiều Chim Bão) | 7, 13, 17, 24, 27 |
| **Boss** | 10, 20, 30 |
| **Nước Dâng** (mới) | sau đợt 10 và 20 |

---

## 7. Boss & sính lễ

| Đợt | Boss | Cơ chế |
|---|---|---|
| 10 | **Thuồng Luồng** | Quẫy đuôi làm choáng tướng, gọi Tôm Binh, hóa điên khi dưới 50% máu |
| 20 | **Hà Bá** | Gọi lính liên tục; bị hạ lần đầu sẽ lặn xuống nước rồi trồi lên với 60% máu |
| 30 | **Thủy Tinh** | Hô mưa gọi gió gây sát thương tướng đứng gần; mỗi lần mất 25% máu gọi 4 Giao Long Con (kháng phép cao) |

Hạ boss, Vua Hùng ban thưởng: **chọn 1 trong 3**:

1. **Sính lễ** (bảo vật Huyền thoại, mỗi boss một món):
   - Đợt 10: **Voi Chín Ngà**
   - Đợt 20: **Gà Chín Cựa**
   - Đợt 30: **Ngựa Chín Hồng Mao**
2. **Hũ Vua Hùng:** một món đồ Sử thi hoặc Huyền thoại.
3. Một trong hai lựa chọn sau, ngẫu nhiên:
   - **Kho lúa & đắp thành:** khoảng 200 vàng trở lên và +3 mạng.
   - **Hội làng mừng thắng:** mọi tướng +2 cấp.

---

## 8. Núi Tản Viên (thay Cây Sự Sống)

Núi cao thêm 1 bước sau mỗi đợt quái, có 5 giai đoạn: **Gò Đất, Đồi Nhỏ, Núi Non, Núi Cao, Núi Thần Tản Viên**. Đúng câu "nước dâng bao nhiêu, núi cao bấy nhiêu".

- **Vàng mỗi đợt** = giai đoạn × 15.
- Từ giai đoạn 2: **+1 mạng thành** mỗi 3 đợt.
- Từ giai đoạn 3: **mọc Linh Chi** trên núi. Hái mỗi cây được 40 vàng và hồi máu cho tướng.
- **Bồi đất** (thay Tưới cây): 80 vàng, mỗi đợt bồi được 1 lần, giúp núi cao nhanh hơn.

---

## 9. Cơ chế mới · Nước Dâng *(đề xuất, số liệu cần chơi thử để cân bằng)*

Đây là điểm làm game khác các game thủ thành khác, lấy thẳng từ truyền thuyết.

- **Độ cao ô đặt tướng:** 43 ô chia 3 bậc: **Thấp** (sát sông, ~15 ô), **Giữa** (~16 ô), **Cao** (sườn núi, ~12 ô). Ô thấp gần đường nên đánh được nhiều quái hơn.
- **Nước dâng:** sau đợt boss 10 và 20 (vô tận: sau mỗi boss), mực nước lên 1 bậc.
  - Sau đợt 10: ngập bậc Thấp. Sau đợt 20: ngập thêm bậc Giữa.
  - Tướng đứng ô ngập bị **sa lầy**: −50% tốc đánh, không hồi năng lượng. Không triệu hồi tướng mới vào ô ngập.
  - Trước khi nước dâng 1 đợt, các ô sắp ngập **nhấp nháy xanh** để người chơi kịp chuẩn bị.
- **Kỹ năng Sơn Tinh · Mọc Núi** (nút riêng, người chơi tự bấm):
  - Chạm vào 1 ô ngập để nâng thành ô khô vĩnh viễn.
  - Mở từ đầu, mỗi đợt nạp lại 1 lượt. Núi Tản Viên giai đoạn 4 trở lên: 2 lượt mỗi đợt.
- **Thủy Tinh (đợt 30):** mỗi lần gọi Giao Long Con cũng làm **ngập tạm** 3 ô ngẫu nhiên trong 8 giây.

Lựa chọn chiến thuật: đặt tướng ở ô thấp để mạnh lúc đầu rồi tốn lượt Mọc Núi để cứu, hay đặt ô cao an toàn nhưng đánh được ít quái hơn.

---

## 10. Giao diện · phong cách Đông Sơn

- **Màu chủ đạo:** đồng thau (vàng đồng, nâu đồng), xanh rêu núi rừng, xanh nước sông cho phe Thủy Tinh. Khung và nút có viền họa tiết **trống đồng** (vòng tròn đồng tâm, chim Lạc, răng cưa).
- **Màn chơi:**
  - Thanh trên: đợt, tiến độ, vàng, mạng, **mực nước**, các nút Bách khoa / Lò đúc đồng / Núi, nút Chạy và nút tốc độ.
  - Bên trái: bảng đợt sắp tới. Góc phải: bản đồ nhỏ.
  - Thanh dưới: ảnh tướng với thanh máu / năng lượng, nút **Nâng cấp** kèm giá vàng, 4 ô QWER kèm hồi chiêu, 6 ô đồ, nút **Mọc Núi**, bảng triệu hồi.
- **Cây kỹ năng:** 4 nhánh Q W E R, có bảng chi tiết bên cạnh.
- **Lò đúc đồng:** Công thức / Cửa hàng / Hũ báu.
- **Túi đồ:** 6 ô của tướng, lưới túi 40 ô có viền màu theo độ hiếm, thẻ chi tiết (cường hóa, thăng phẩm, khóa, đổi ra vàng), thanh đổi hàng loạt với bộ lọc chất lượng.
- **Tiến hoá & Núi Tản Viên.**
- **Bách khoa thủy quái.**
- Cầm điện thoại dọc sẽ hiện nhắc **xoay ngang**.

---

## 11. Hướng phát triển tiếp (đề xuất)

- Lưu tiến trình (`localStorage`), nhiều bản đồ / màn chơi theo dọc sông Đà.
- Màn mở đầu kể chuyện Vua Hùng kén rể (vài khung tranh tĩnh).
- Nâng cấp đồ, gacha tướng, thêm tướng (ví dụ: Thánh Gióng, Chử Đồng Tử) và boss mới.
- Thay hình vẽ bằng sprite, đóng gói app Android/iOS bằng Capacitor.

---

## 12. Thiết kế còn phải làm

- **Hệ thống đồ:** vẽ icon cho từng món (vũ khí, mũ, giáp, phụ kiện, đồ ghép, Bộ Lạc Long, 3 sính lễ), khung theo độ hiếm (Thường / Hiếm / Sử thi / Huyền thoại), thẻ chi tiết món đồ, và hình tướng thay đổi khi mặc đồ.
- **Kỹ năng:** vẽ icon riêng cho đủ 24 kỹ năng (6 tướng × Q W E R) và hiệu ứng khi tướng dùng kỹ năng.
- ~~Chuyển các màn còn lại sang phong cách mới~~ (đã xong).

---

## 13. Animation và công nghệ làm game

- **Không dùng Bootstrap cho game:** Bootstrap chỉ làm giao diện trang web. Đề xuất:
  - **Engine:** Phaser 3 (game HTML5 2D, đóng gói Android/iOS bằng Capacitor). Nếu muốn đồ họa mạnh hơn: Cocos Creator hoặc Godot.
  - **Hoạt ảnh nhân vật:** Spine hoặc DragonBones (hoạt ảnh xương: chia tướng thành đầu, thân, tay, vũ khí rồi cho chuyển động, mượt và nhẹ hơn vẽ từng khung). Hoặc sprite sheet nếu thuê họa sĩ vẽ khung hình.
  - **Hiệu ứng:** hệ hạt (particle) của Phaser cho lửa, băng, sét, nước; rung màn hình và chớp sáng cho chiêu R.
- **Mỗi tướng cần các hoạt ảnh:** đứng yên (lặp), đánh thường, ra chiêu Q, ra chiêu E (W là nội tại, chỉ cần hiệu ứng hào quang), chiêu tối thượng R (kèm rung màn hình, chớp sáng, tên chiêu hiện to), bị đánh, gục, xuất hiện khi triệu hồi, sa lầy khi ô ngập.
- **Bản mẫu:** trang "Đền Anh Hùng" chạy thử animation cho 10 tướng huyền thoại (dựng bằng SVG + GSAP + canvas hạt), làm chuẩn tham khảo cho họa sĩ và lập trình viên.

---

## 14. Ghi chú triển khai trong code (phiên bản 14)

Game hiện chạy được đầy đủ luật chơi v14 ở trên. Những điểm bản thiết kế để ngỏ đã được chốt như sau (đều là số liệu đề xuất, sửa trong `js/data.js`):

- **Sức mạnh kỹ năng theo cấp tướng.** Vì không còn tính theo số quái hạ, chỉ số kỹ năng tăng theo cấp tướng (mua bằng vàng): sức mạnh gốc = 15 + 10 × cấp, rồi nhân theo cấp kỹ năng (+25%/cấp) và Trí tuệ.
- **Năng lượng.** Hồi năng lượng = 1,5 + 0,08 × Trí tuệ mỗi giây. Chiêu R tốn khoảng 85–120 năng lượng. Khi chiêu R (hoặc E) đã hồi xong, tướng **để dành năng lượng** cho chiêu lớn thay vì xả hết vào Q.
- **10 tướng huyền thoại** đã có đủ đặc trưng và Q W E R (W là nội tại, Q/E/R chủ động). Chiêu chặn đường (Bọc Trăm Trứng, Thành Một Đêm) chặn quái đi bộ 6 giây; Kim Quy Hộ Thành chỉ tự dùng khi quái sắp lọt vào thành.
- **Sính lễ:**
  - Voi Chín Ngà: +25 Sức mạnh, +500 máu, +8 hồi máu, đòn đánh có 15% làm choáng 0,5 giây.
  - Gà Chín Cựa: +20 Nhanh nhẹn, +30% tốc đánh, +12% chí mạng.
  - Ngựa Chín Hồng Mao: +20 Trí tuệ, +15% giảm hồi chiêu, +25 sát thương, +25 tầm.
  - Thêm Ngọc Hồi Sinh (gục thì hồi sinh ngay, dùng 1 lần).
- **Hũ Vua Hùng** ra đồ Sử thi trở lên; phần thưởng thứ 3 ngẫu nhiên giữa Kho lúa · Đắp thành và Hội làng mừng thắng.
- **Chiến dịch 8 ải** (tên đề xuất), máu quái tăng dần theo ải:

  | Ải | Tên | Số đợt | Boss | Máu quái | Ghi chú |
  |---|---|---|---|---|---|
  | 1 | Bến Sông Đà | 10 | Thuồng Luồng | ×0,75 | Làm quen |
  | 2 | Thác Bờ | 20 | Thuồng Luồng, Hà Bá | ×0,85 | |
  | 3 | Rừng Lim | 30 | Thuồng Luồng, Hà Bá, Hà Bá | ×1 | |
  | 4 | Bãi Phù Sa | 30 | 3 boss | ×1,08 | |
  | 5 | Chân Núi Tản | 30 | 3 boss | ×1,16 | |
  | 6 | Đầm Lầy | 30 | 3 boss | ×1,24 | Ô bậc Thấp ngập từ đầu |
  | 7 | Cửa Sông Hồng | 30 | Hà Bá, Thủy Tinh, Thủy Tinh | ×1,32 | |
  | 8 | Thành Phong Châu | 30 | 3 boss | ×1,4 | Trận cuối |

  Sao: ★ thắng · ★★ còn ≥ 15 mạng · ★★★ không mất mạng. Tiến trình (sao, ải đã mở) lưu trên trình duyệt.
- **Bot cân bằng** (tự đặt 12 tướng cơ bản, chia vàng đều, không dùng đồ hay tướng huyền thoại): thắng ải 3, sát nút ở ải 5, thua ở ải 8 khoảng đợt 22–25. Người chơi có đồ, tướng huyền thoại và Mọc Núi sẽ đi xa hơn.
- **Màn Cài đặt** (chưa có trong thiết kế): hiện số sát thương, rung màn hình, bỏ qua cốt truyện, xoá tiến trình. Nút ≡ trong trận mở bảng Tạm dừng: Tiếp tục, Chơi lại, Bản đồ, Menu chính.
- **Tab Huyền thoại** (chưa có trong thiết kế): bảng 10 tướng hiện cạnh bảng Triệu hồi. Chạm một lần xem đặc trưng, chạm lần nữa để triệu hồi.
- **Công nghệ:** vẫn là HTML5 Canvas + JavaScript thuần (chưa chuyển Phaser/Spine). Hình vector lấy thẳng từ file thiết kế (`js/art.js`). Tướng được ghép từ các phần (đầu, thân, tay, vũ khí, sau lưng) và có hoạt ảnh theo bản mẫu Đền Anh Hùng: thở, vung đòn, giật lùi khi bắn, giơ tay khi dùng phép, phóng to khi tung R, xuất hiện, sa lầy, gục, hồi sinh. Đồ mặc vẫn vẽ chồng lên để đổi hình dạng.

### Phiên bản 15 · theo bản thiết kế mobile và tài liệu prompt ảnh

Giữ màn hình **ngang**. Lấy từ bản thiết kế mobile những phần hợp:
- **Menu chính:** khung người chơi Sơn Tinh (cấp theo tổng quái đã hạ, số sao), tài nguyên tích lũy (🪙 tổng vàng đã kiếm, 🌿 Linh Chi đã hái), nút chính **Xuất Quân** màu đỏ son.
- **Anh Hùng (16):** xem cả 16 tướng, chỉ số, đặc trưng và 4 kỹ năng; có nút sang Đền Anh Hùng xem hoạt ảnh.
- **Kho Báu:** bộ sưu tập mọi món đồ đã từng có (món chưa có hiện màu tối).
- **Thanh mực nước** trên thanh trên: chạy dần tới lần dâng nước kế tiếp.
- **Hộp thoại có ảnh nhân vật:** Sơn Tinh lúc bắt đầu trận, boss khi xuất hiện, Thủy Tinh khi dâng nước.

**Ảnh vẽ tay (AI):** game tự nạp PNG trong `assets/` nếu đặt đúng tên file theo tài liệu prompt (H01–H16, E01–E08, B01–B03, `map-01`…, `tile-low`…, icon đồ, 64 icon kỹ năng, VFX). Danh sách đầy đủ và quy ước (chân ở giữa đáy ảnh, đường sông của bản đồ…) ở `docs/ASSETS.md`. Chưa có ảnh nào thì dùng hình vector như cũ.
