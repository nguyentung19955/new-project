# Núi Cao Nước Dâng · Tóm tắt gameplay (phiên bản 15 · chủ đề Sơn Tinh Thủy Tinh)

> Tài liệu bàn giao thiết kế đầy đủ: `docs/HANDOFF.md`. Ghi chú những gì đã làm trong code: mục 15 ở cuối.

Game thủ thành trên điện thoại, chơi **màn hình ngang**, lấy cảm hứng từ Dota 1 và truyền thuyết **Sơn Tinh Thủy Tinh**. Người chơi vào vai Sơn Tinh, triệu hồi các tướng Văn Lang đứng dọc đường đi để chặn đạo quân thủy quái của Thủy Tinh tràn vào **thành Phong Châu**. Người chơi dùng vàng để nâng cấp tướng, mở kỹ năng và tiến hoá, và mặc đồ sẽ làm thay đổi hình dạng tướng.

> **Thay đổi so với phiên bản 12:** giữ nguyên toàn bộ cơ chế và số liệu, đổi tên tướng / quái / boss / vật phẩm theo chủ đề, Cây Sự Sống thành **Núi Tản Viên**, thêm cơ chế mới **Nước Dâng** (mục 9).
>
> **Thay đổi ở phiên bản 14:** bỏ hẳn mọi tiến triển dựa trên số quái đã hạ. Người chơi **dùng vàng** để nâng cấp tướng (mục 2), mở khóa kỹ năng W/E/R (mục 3) và tiến hoá (mục 4). Thêm mục 12: các phần thiết kế còn phải làm.
>
> **Thay đổi ở phiên bản 15:** bổ sung phần hình ảnh còn thiếu: hiệu ứng lên cấp (mục 2), ngoại hình ba bậc tiến hoá (mục 4), ngoại hình đồ theo độ hiếm và vũ khí của tướng huyền thoại (mục 5), animation lên cấp / tiến hoá / mặc đồ (mục 13). Mở rộng hệ thống đồ: chỉ số từng món, dòng phụ ngẫu nhiên, hiệu ứng ẩn, 5 bộ đồ, 14 công thức, **Tôi luyện** đồ đã max (mục 5). **Luyện thể** cho tướng cấp 25 (mục 2). Thêm **Ngũ hành** (Kim Mộc Thủy Hỏa Thổ) cho tướng, quái, boss và đồ, kèm **hiệu ứng ẩn** của từng tướng (mục 14). Số liệu cũ giữ nguyên.

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
- **Luyện thể (khi tướng đã cấp 25)** *(mới · đề xuất)*: nút Nâng cấp đổi thành **Luyện thể**. Mỗi lần trả vàng được **+3 thuộc tính chính và +1 mỗi thuộc tính phụ**, không giới hạn số lần, để vàng cuối trận và chế độ vô tận vẫn có chỗ tiêu.
  - Giá: **200 + 50 × số lần đã luyện** (lần 1: 200, lần 10: 650).
  - Hiển thị "Cấp 25 ✦N" trên thẻ tướng. Không cho thêm điểm kỹ năng.
  - Bán tướng hoàn 60% số vàng đã luyện thể, như các khoản khác.
- **Hành (Ngũ hành):** mỗi tướng thuộc một hành và có **một hiệu ứng ẩn**. Xem mục 14.
- **Hiệu ứng lên cấp** *(mới · đề xuất)*: lên cấp **không đổi ngoại hình** tướng. Ngoại hình chỉ đổi theo **đồ** (mục 5) và **tiến hoá** (mục 4), để người chơi nhìn là biết tướng mặc gì, tiến hoá mấy sao.
  - Khi bấm Nâng cấp: vòng hoa văn trống đồng màu vàng lóe dưới chân, tướng nảy lên 4px, chữ **"Cấp N"** vàng bay lên rồi mờ dần (0,6 giây). Không dừng đòn đánh.
  - Lên nhiều cấp liền (bấm nhanh, hoặc "Hội làng mừng thắng" +2 cấp): gộp thành một hiệu ứng, chữ hiện **"+2 cấp"**.
  - Khi đạt cấp đủ điều kiện mới (cấp 3/6 mở E/R, cấp 5/10/15 tiến hoá): biểu tượng tương ứng trên nút Cây kỹ năng / Tiến hoá nhấp nháy để nhắc.

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

**Ngoại hình theo bậc** *(mới · đề xuất)*. Mỗi bậc giữ nguyên hiệu ứng của bậc trước rồi thêm vào:

| Bậc | Kích thước | Hào quang dưới chân | Thêm |
|---|---|---|---|
| ★ | to hơn 10% | 1 vòng hoa văn trống đồng màu đồng, xoay chậm | — |
| ★★ | to hơn 15% | 2 vòng, vòng trong ánh **màu hệ tướng** (Sức mạnh đỏ, Nhanh nhẹn xanh lá, Trí tuệ tím) | Mắt phát sáng, viền vũ khí ánh màu hệ |
| ★★★ | to hơn 20% | 3 vòng + hạt sáng màu hệ bay lên | Sau lưng hiện **vầng ngôi sao 12 cánh** trống đồng; tên tướng trên thanh máu chuyển chữ vàng |

Hào quang tiến hoá nằm **dưới** hào quang phụ kiện (mục 5) để hai loại không che nhau. Sao (★) hiện trên thanh máu tướng.

Bán tướng cũng hoàn 60% số vàng đã chi cho kỹ năng và tiến hoá.

---

## 5. Trang bị · đổi hình dạng tướng

Mỗi tướng có **6 ô đồ**:

- **3 ô trang phục: vũ khí, mũ, giáp.** Mặc vào là **đổi ngoại hình** tướng: rìu đồng, nỏ, gậy thầy mo, mũ lông chim, mũ sừng, giáp đồng, …
  - Vũ khí chia theo loại tướng: rìu / dao găm cho tướng cận chiến, nỏ cho Xạ Thủ, gậy cho Thầy Mo và Thần Sương Núi.
  - Độ hiếm: Thường, Hiếm, Sử thi, Huyền thoại.
  - Mặc đủ **Bộ Lạc Long** (Long Rìu / Long Nỏ / Long Trượng, Mũ Lạc Long, Giáp Vảy Rồng) được +30% sát thương, tướng **mọc cánh rồng**: dòng dõi Lạc Long Quân.
- **3 ô phụ kiện:** mua ở Lò đúc đồng rồi **ghép** thành đồ mạnh có hào quang riêng.

### Ngoại hình đồ theo độ hiếm *(mới · đề xuất)*

Mỗi món trang phục có **4 phiên bản hình** theo độ hiếm. Đồ cùng độ hiếm dùng chung chất liệu và màu ánh, nên người chơi nhìn tướng là đoán được đồ mạnh hay yếu. Màu ánh trùng với màu khung độ hiếm của giao diện.

| Độ hiếm | Chất liệu | Màu ánh | Hiệu ứng |
|---|---|---|---|
| Thường | gỗ, tre, vải gai, da thô | nâu xám `#8A8478` | không |
| Hiếm | đồng thau sáng, lông chim | xanh lam `#4FA3D9` | viền sáng mảnh |
| Sử thi | đồng khắc hoa văn trống đồng, ngọc | tím `#A86CE0` | ánh tím nhẹ, nhịp thở chậm |
| Huyền thoại | đồng vàng ròng, hoa văn chim Lạc | cam vàng `#F0A030` | hào quang + hạt sáng bay lên |

| Ô | Thường | Hiếm | Sử thi | Huyền thoại |
|---|---|---|---|---|
| Rìu (cận chiến Sức mạnh) | rìu đá cán gỗ | rìu đồng | rìu đồng khắc trống | rìu sấm vàng, lưỡi có tia sét |
| Dao găm (cận chiến Nhanh nhẹn) | dao tre vót | dao găm đồng | dao găm đồng chuôi ngọc | song dao vàng, lưỡi lá rừng phát sáng |
| Nỏ (Xạ Thủ) | nỏ gỗ | nỏ đồng | nỏ khắc chim Lạc | nỏ vàng cánh chim Lạc |
| Gậy (Thầy Mo, Thần Sương Núi) | gậy gỗ cong | gậy đồng đầu tròn | gậy đầu trống đồng nhỏ | gậy vàng, đầu là ngọn lửa / tinh thể băng theo tướng |
| Mũ | khăn vải quấn đầu | mũ lông chim | mũ sừng đồng | mũ lông chim Lạc vàng cao |
| Giáp | áo vải gai | giáp da có tấm đồng | giáp đồng khắc hoa văn | giáp vàng khảm ngọc, vai hình đầu chim Lạc |

- **Cường hóa +1 đến +5 không đổi hình.** Đồ đạt +5 có thêm một tia lấp lánh chạy dọc món đồ mỗi 3 giây, báo hiệu đã sẵn sàng thăng phẩm.
- **Thăng phẩm** đổi sang hình của độ hiếm mới.
- **Bộ Lạc Long:** Long Rìu / Long Nỏ / Long Trượng, Mũ Lạc Long, Giáp Vảy Rồng có màu xanh ngọc và vàng, vảy rồng. Mặc đủ bộ thì **mọc cánh rồng** sau lưng (vỗ chậm khi đứng yên). Lạc Long Quân vốn là rồng nên mặc đủ bộ thì cánh to gấp rưỡi và có ánh sét.
- **Hào quang phụ kiện:** mỗi đồ ghép có một vòng sáng dưới chân, màu riêng theo món (ví dụ Trống Đồng: vòng vàng có sóng âm lan ra; Giáp Đồng Bất Diệt: vòng đồng đỏ). Tướng chỉ hiện hào quang của **1 món mạnh nhất** để màn hình đỡ rối.

### Vũ khí và trang phục của tướng huyền thoại *(mới · đề xuất)*

Tướng huyền thoại **giữ nguyên dáng vũ khí đặc trưng** để không mất nhận diện. Đồ mặc vào chỉ đổi **chất liệu, màu ánh và hiệu ứng** theo bảng độ hiếm ở trên, không thay hình dáng.

| Tướng | Dùng loại vũ khí | Vũ khí đặc trưng giữ dáng | Ghi chú mũ / giáp |
|---|---|---|---|
| Thánh Gióng | Rìu | gậy tre ngà | giáp sắt luôn hiện; mũ là mũ sắt |
| Lạc Long Quân | Rìu | vuốt rồng (găng) | mũ là vương miện sừng rồng |
| Thần Kim Quy | Rìu | móng vàng | không đội mũ: ô mũ hiện thành **vương miện nhỏ**; ô giáp đổi **mai** |
| Thạch Sanh | Dao găm | rìu đốn củi + cung vàng sau lưng | — |
| Cao Lỗ | Nỏ | nỏ liên châu lẫy móng rùa | — |
| Mai An Tiêm | Nỏ | ná / giỏ dưa hấu | mũ là nón lá |
| Âu Cơ | Gậy | cành hoa tiên | ô giáp đổi **cánh lông vũ** |
| Chử Đồng Tử | Gậy | gậy thần | ô mũ là **nón thần** |
| Tiên Dung | Gậy | quạt tiên | mũ là trâm cài / hoa |
| Lang Liêu | Gậy | gậy tre, khay bánh chưng | mũ là khăn xếp |

**Lò đúc đồng** (thay Lò rèn) có 3 tab:

- **Công thức:** ghép đồ. Có **14 công thức** (bảng ở mục "Công thức đúc" bên dưới), 6 công thức cũ giữ nguyên.
- **Cửa hàng:** phụ kiện cơ bản, giá 100–130 vàng. Thêm 4 phụ kiện mới: **Sừng Tê** (120), **Lông Chim Lạc** (110), **Vảy Cá** (110), **Hạt Lúa** (100).
- **Hũ báu** (thay Rương): 90 vàng, mở ra đồ ngẫu nhiên.

Quái cũng có tỉ lệ **rơi đồ**. Quái tinh anh và boss rơi đồ xịn hơn.

### Chỉ số đồ trang phục *(mới · đề xuất, cần cân bằng)*

| Ô | Chỉ số gốc | Thường | Hiếm | Sử thi | Huyền thoại |
|---|---|---|---|---|---|
| Vũ khí | + sát thương | 8 | 16 | 30 | 50 |
| Mũ | + thuộc tính chính | 3 | 6 | 10 | 16 |
| Giáp | + giáp / + máu | 2 / 60 | 4 / 120 | 7 / 220 | 11 / 360 |

Cường hóa mỗi cấp +10% chỉ số gốc (như cũ). Ngoài chỉ số gốc, một món có thể có thêm:

| Loại dòng | Thường | Hiếm | Sử thi | Huyền thoại | Ghi chú |
|---|---|---|---|---|---|
| **Hành** (mục 14) | có | có | có | có | Mỗi món mang 1 hành ngẫu nhiên khi rơi / mở hũ |
| **Dòng phụ ngẫu nhiên** | 0 | 1 | 1 | 2 | Chỉ đồ rơi và đồ trong Hũ báu; đồ mua ở cửa hàng không có |
| **Hiệu ứng ẩn** | 0 | 0 | 1 | 1 (+1 khi Tôi luyện ✦10) | Hiện "???" cho tới lần kích hoạt đầu tiên |

**Dòng phụ ngẫu nhiên** (mỗi dòng rút 1 trong danh sách): +8% tốc đánh · +15% sát thương lên boss · +20% sát thương lên quái bay · −8% hồi chiêu · +2 vàng mỗi quái hạ · +10% sát thương khi đứng ô ngập · +10% tầm đánh · +5% chí mạng.
- **Tẩy luyện** (rút lại dòng phụ) ở thẻ chi tiết món đồ: 50 vàng lần đầu, mỗi lần sau gấp đôi, tối đa 400 vàng một lần. Món đã khóa không tẩy luyện được.

### Hiệu ứng ẩn của đồ *(mới · đề xuất)*

Đồ Sử thi và Huyền thoại có **1 hiệu ứng ẩn**, rút theo **hành** của món đồ. Thẻ chi tiết hiện "**??? · Hiệu ứng ẩn**" kèm một câu gợi ý. Lần đầu điều kiện xảy ra trong trận, hiệu ứng hiện ra với chữ "**Đã khám phá!**", sau đó luôn hiển thị và được ghi vào Bách khoa (tab Bí truyền, mục 14).

| Hành | Hiệu ứng ẩn | Gợi ý hiện trên thẻ |
|---|---|---|
| Kim | Đánh quái dưới 30% máu: bỏ qua thêm 30% giáp | "Lưỡi đồng tìm chỗ hở" |
| Kim | Mỗi đòn thứ 5 liên tiếp vào cùng một quái: gây thêm 50% sát thương | "Gõ mãi đá cũng mòn" |
| Mộc | Hạ quái: hồi 3% máu tối đa | "Cây hút nhựa từ đất" |
| Mộc | Đứng yên 10 giây không đổi chỗ: +15% sát thương cho tới khi bị dời | "Rễ càng sâu, cây càng vững" |
| Thủy | Đứng ô ngập: không bị sa lầy và +10% sát thương | "Cá gặp nước" |
| Thủy | Khi tướng đứng kề gục: hồi 20% máu cho mọi tướng kề còn lại | "Nước chảy về chỗ trũng" |
| Hỏa | Đòn chí mạng làm cháy mục tiêu 2 giây | "Lửa bén rơm" |
| Hỏa | Khi máu dưới 50%: +20% tốc đánh | "Lửa thử vàng" |
| Thổ | Khi máu dưới 30%: giảm 30% sát thương nhận vào trong 4 giây (hồi 20 giây) | "Đất lành chim đậu" |
| Thổ | Đứng ô bậc Cao: +10% giáp cho tướng đứng kề | "Núi che chở" |

Đồ ghép (công thức) và đồ bộ có hiệu ứng ẩn **riêng, cố định**, ghi ở bảng của từng loại.

### Bộ đồ *(mới · đề xuất)*

Mỗi bộ gồm **3 món trang phục (vũ khí, mũ, giáp)**, cùng hành. Đồ bộ rơi từ **quái tinh anh và boss**, ra ở độ hiếm Sử thi và thăng phẩm lên Huyền thoại được. Vũ khí bộ đổi dáng theo loại tướng (rìu / dao / nỏ / gậy). Một tướng chỉ kích hoạt được 1 bộ vì chỉ có 3 ô trang phục.

| Bộ | Hành | Hợp với | 2 món | Đủ 3 món | Ngoại hình khi đủ bộ | Hiệu ứng ẩn khi đủ bộ |
|---|---|---|---|---|---|---|
| **Lạc Long** | Thủy | mọi tướng | +10% sát thương | +30% sát thương *(như cũ)* | Cánh rồng xanh ngọc | Đứng ô ngập: miễn sa lầy, đòn đánh có 10% phóng sét lan 3 quái |
| **Sơn Tinh** | Thổ | tướng chặn đường | +15% máu | +25% giáp, quái chạm vào bị chậm 20% | Khối núi đá nhỏ lơ lửng sau lưng | Mỗi đợt có 1 lần chặn hoàn toàn đòn đánh gây chết |
| **Chim Lạc** | Kim | tướng đánh xa | +10% tầm | +40% sát thương lên quái bay, tên bay theo đường cong | Cánh lông chim Lạc trắng vàng | Hạ Chim Bão: 20% gọi 1 chim Lạc mổ quái gần nhất |
| **Trống Đồng** | Kim | tướng phép, hỗ trợ | +10% sức mạnh kỹ năng | Hào quang +10% sát thương cho tướng trong tầm 2 ô | Mặt trống đồng xoay sau lưng | Khi tướng trong hào quang dùng R: hào quang tăng gấp đôi trong 5 giây |
| **Ngựa Sắt** | Hỏa | tướng cận chiến | +10% tốc đánh | Đòn đánh để lại vệt lửa trên đường 2 giây | Bờm lửa và giáp sắt đen ánh đỏ | Hạ 3 quái trong 2 giây: phun lửa thẳng hàng một lần |

**Đủ bộ cùng hành với tướng** ("Thiên mệnh"): hiệu ứng 3 món mạnh thêm 50%.

### Công thức đúc *(14 công thức · 6 cũ giữ nguyên, 8 mới)*

Đồ ghép không mang hành. Mỗi món có hào quang riêng (mục 5, hào quang phụ kiện) và một hiệu ứng ẩn cố định.

| Món | Công thức | Hiệu ứng | Khắc chế | Hiệu ứng ẩn |
|---|---|---|---|---|
| Song Rìu Cuồng Nộ | Vuốt Hổ + Găng Da | +30% tốc đánh | — | Hạ quái: +5% tốc đánh 3 giây, cộng dồn 5 lần |
| Gậy Tam Giới | Đai + Dép Cỏ + Khăn | +5 mọi thuộc tính | — | Có đủ 3 hệ tướng trên sân: +5 nữa |
| Gậy Thời Không | Khăn Hiền Giả + Mắt Ngọc | −20% hồi chiêu | — | 10% dùng chiêu không tốn năng lượng |
| Giáp Đồng Bất Diệt | Ngọc Sinh Lực + Đai | +300 máu, hồi sinh nhanh 30% | — | Gục lần đầu mỗi đợt: hồi sinh ngay với 30% máu |
| Lưỡi Hái Chí Tử | Vuốt Hổ + Dép Cỏ | +15% chí mạng, chí mạng x2,2 | — | Chí mạng lên quái tinh anh: x3 |
| Trống Đồng | Mặt Trống + Dùi Trống | Hào quang +tốc đánh cho tướng xung quanh *(như cũ)* | — | Đầu mỗi đợt: gõ trống, mọi tướng +20% tốc đánh 5 giây |
| **Mũi Sừng Phá Giáp** | Sừng Tê + Vuốt Hổ | Đòn đánh giảm 5 giáp mục tiêu (cộng dồn 3) | Rùa Giáp | Mai Rùa Giáp bị phá hết giáp: rùa bị choáng 1 giây |
| **Rìu Quét Sông** | Sừng Tê + Găng Da | Đòn đánh lan 35% sát thương | Tôm Binh | Hạ 5 Tôm Binh một lúc: +10 vàng |
| **Cung Mắt Chim** | Lông Chim Lạc + Mắt Ngọc | +50% sát thương lên quái bay, +1 tầm | Chim Bão | Đợt bay: +20% tốc bắn |
| **Bùa Chim Lạc** | Lông Chim Lạc + Khăn | Tướng cận chiến đánh được quái bay (tầm 1) | Chim Bão | Quái bay bị đánh rơi xuống đất 1 giây |
| **Áo Vảy Cá** | Vảy Cá + Ngọc Sinh Lực | Giảm 35% sát thương phép nhận vào | Phù Thủy Nước, mưa của Thủy Tinh | Đứng ô ngập: hồi 2% máu mỗi giây |
| **Ngọc Trấn Thủy** | Vảy Cá + Mắt Ngọc | Quái bị đánh không được hồi máu 3 giây | Phù Thủy Nước | Hạ Phù Thủy Nước: quái quanh nó mất 10% máu |
| **Lưới Đánh Cá** | Vảy Cá + Dép Cỏ | Đòn đánh làm chậm 20% trong 1 giây | Cá Sấu, Nòng Nọc | Cá Sấu hóa điên bị lưới giữ chân 1 giây |
| **Bồ Lúa Thần** | Hạt Lúa + Đai | +3 vàng mỗi quái hạ | — | Sau đợt 20: mỗi đợt 10% ra "bồ lúa vàng" +100 vàng |

### Tôi luyện (đồ đã max) *(mới · đề xuất)*

- Đồ **Huyền thoại +5** mở nút **Tôi luyện** thay cho Thăng phẩm. Mỗi lần: **+3% chỉ số gốc**, không giới hạn số lần.
- Giá: **300 + 100 × số lần đã tôi luyện** món đó (lần 1: 300, lần 10: 1.200).
- Hiển thị "+5 ✦N" trên ô đồ.
- **Mốc ✦5:** dòng phụ mạnh thêm 50%. **Mốc ✦10:** mở **hiệu ứng ẩn thứ hai** (rút theo hành của món). Từ ✦10, hào quang của món đậm hơn.
- Đổi đồ ra vàng hoàn 60% số vàng đã tôi luyện. Nên khóa đồ đã tôi luyện.

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

| Quái | Thay cho | Đặc điểm | Hành |
|---|---|---|---|
| Tôm Binh | Yêu Tinh | Đi thành bầy đông, yếu trước sát thương lan | Thủy |
| Cá Sấu | Sói Hoang | Chạy nhanh; máu dưới 50% thì hóa điên, chạy nhanh gấp rưỡi | Kim |
| Rùa Giáp | Golem Đá | Mai rất cứng: giáp và kháng phép rất cao, kháng choáng | Thổ |
| Phù Thủy Nước | Pháp Sư Quỷ | Phun nước bắn tướng từ xa, hồi máu cho quái xung quanh | Thủy |
| Chim Bão | Dơi Độc | **Bay**, chỉ tướng đánh xa và tướng phép bắn được | Mộc |
| Ếch Mẹ | Bọ Phân Thân | Chết thì tách thành 3 Nòng Nọc chạy nhanh | Thủy |

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

| Đợt | Boss | Cơ chế | Hành |
|---|---|---|---|
| 10 | **Thuồng Luồng** | Quẫy đuôi làm choáng tướng, gọi Tôm Binh, hóa điên khi dưới 50% máu | Thủy |
| 20 | **Hà Bá** | Gọi lính liên tục; bị hạ lần đầu sẽ lặn xuống nước rồi trồi lên với 60% máu | Thủy → **Kim** khi trồi lên (ẩn, mục 14) |
| 30 | **Thủy Tinh** | Hô mưa gọi gió gây sát thương tướng đứng gần; mỗi lần mất 25% máu gọi 4 Giao Long Con (kháng phép cao) | Thủy · mỗi Giao Long Con mang 1 hành ngẫu nhiên (màu vảy) |

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

- **Hệ thống đồ:** quy cách ngoại hình, chỉ số, bộ đồ, công thức đã có ở mục 5 (v15); hành và hiệu ứng ẩn ở mục 14. Còn phải: cân bằng số liệu bằng chơi thử, thiết kế màn hình tab Bí truyền, thêm nút Tôi luyện / Tẩy luyện vào thẻ chi tiết đồ, nút Luyện thể vào bảng tướng, và vẽ icon cho từng món (vũ khí, mũ, giáp, phụ kiện, đồ ghép, Bộ Lạc Long, 3 sính lễ), khung theo độ hiếm (Thường / Hiếm / Sử thi / Huyền thoại), thẻ chi tiết món đồ, và hình tướng thay đổi khi mặc đồ.
- **Kỹ năng:** vẽ icon riêng cho đủ 24 kỹ năng (6 tướng × Q W E R) và hiệu ứng khi tướng dùng kỹ năng.
- ~~Chuyển các màn còn lại sang phong cách mới~~ (đã xong).

---

## 13. Animation và công nghệ làm game

- **Không dùng Bootstrap cho game:** Bootstrap chỉ làm giao diện trang web. Đề xuất:
  - **Engine:** Phaser 3 (game HTML5 2D, đóng gói Android/iOS bằng Capacitor). Nếu muốn đồ họa mạnh hơn: Cocos Creator hoặc Godot.
  - **Hoạt ảnh nhân vật:** Spine hoặc DragonBones (hoạt ảnh xương: chia tướng thành đầu, thân, tay, vũ khí rồi cho chuyển động, mượt và nhẹ hơn vẽ từng khung). Hoặc sprite sheet nếu thuê họa sĩ vẽ khung hình.
  - **Hiệu ứng:** hệ hạt (particle) của Phaser cho lửa, băng, sét, nước; rung màn hình và chớp sáng cho chiêu R.
- **Mỗi tướng cần các hoạt ảnh:** đứng yên (lặp), đánh thường, ra chiêu Q, ra chiêu E (W là nội tại, chỉ cần hiệu ứng hào quang), chiêu tối thượng R (kèm rung màn hình, chớp sáng, tên chiêu hiện to), bị đánh, gục, xuất hiện khi triệu hồi, sa lầy khi ô ngập.
- **Hoạt ảnh tiến triển** *(mới · đề xuất)*, dùng chung cho mọi tướng (làm bằng hiệu ứng, không cần vẽ riêng từng tướng):

| Sự kiện | Mô tả | Thời lượng gợi ý |
|---|---|---|
| Lên cấp | Vòng trống đồng vàng lóe dưới chân, thân nảy 4px, chữ "Cấp N" bay lên | 0,6 giây |
| Mở kỹ năng W/E/R | Icon kỹ năng bay từ Cây kỹ năng xuống ô QWER, ô lóe vàng | 0,5 giây |
| Tiến hoá | Tướng nhấc lên 10px, cột sáng màu đồng, nổ hạt hoa văn, hạ xuống với kích thước mới, sao mới hiện trên thanh máu | 1,2 giây |
| Mặc / thay đồ trang phục | Lóe sáng màu độ hiếm tại vị trí món đồ (tay, đầu, thân), mảnh đồ mới hiện ra | 0,3 giây |
| Thăng phẩm đồ | Món đồ đang mặc nhấp sáng 2 lần rồi đổi sang hình độ hiếm mới | 0,6 giây |
| Mặc đủ Bộ Lạc Long | Cánh rồng bung ra từ sau lưng, rung màn hình nhẹ, chữ "Bộ Lạc Long" hiện giữa màn | 1,5 giây |

- **Cách dựng đồ trên khung xương:** mỗi tướng có sẵn 3 khe gắn (tay cầm vũ khí, đầu, thân). Mỗi món trang phục là một mảnh ảnh riêng gắn vào khe; đổi đồ = đổi mảnh ảnh, không cần làm lại animation. Họa sĩ vẽ đồ cho **4 dáng người chung** (cận chiến, xạ thủ, pháp sư, tướng thân to) rồi chỉnh vị trí khe theo từng tướng.
- **Bản mẫu:** trang "Đền Anh Hùng" chạy thử animation cho 10 tướng huyền thoại (dựng bằng SVG + GSAP + canvas hạt), làm chuẩn tham khảo cho họa sĩ và lập trình viên.

---

## 14. Ngũ hành và hiệu ứng ẩn *(mới · đề xuất, số liệu cần cân bằng)*

Mỗi **tướng, quái, boss và món trang phục** thuộc một trong 5 hành. Hành **không thay** hệ Sức mạnh / Nhanh nhẹn / Trí tuệ mà chồng lên: hệ quyết định chỉ số, hành quyết định **khắc chế và cách xếp đội hình**.

### Màu và biểu tượng

| Hành | Màu | Biểu tượng (trong khung tròn trống đồng) |
|---|---|---|
| Kim | trắng bạc `#D9DDE0` | lưỡi rìu đồng |
| Mộc | xanh lá `#5FB84A` | chồi lá |
| Thủy | xanh lam sẫm `#2F6FB0` | sóng nước |
| Hỏa | đỏ `#E0452C` | ngọn lửa |
| Thổ | vàng đất `#C99A3C` | ngọn núi |

Biểu tượng hành hiện nhỏ cạnh tên tướng, trên thanh máu quái, và ở góc trên trái ô đồ (độ hiếm vẫn dùng màu viền như cũ).

### Tương khắc (đánh quái)

**Kim khắc Mộc · Mộc khắc Thổ · Thổ khắc Thủy · Thủy khắc Hỏa · Hỏa khắc Kim.**

- Tướng đánh quái **thuộc hành mình khắc**: **+30% sát thương**, số sát thương hiện màu vàng.
- Tướng đánh quái **thuộc hành khắc mình**: **−20% sát thương**, số hiện màu xám.
- Hành của đòn đánh là hành của **tướng**, không phải của đồ.
- Quân Thủy Tinh phần lớn là Thủy, nên tướng Thổ (phe núi của Sơn Tinh) mạnh nhất về lâu dài. Nhưng Chim Bão (Mộc) khắc Thổ, Cá Sấu (Kim) và Giao Long Con (hành ngẫu nhiên) buộc người chơi giữ đội hình đủ hành.

### Tương sinh (xếp đội hình)

**Kim sinh Thủy · Thủy sinh Mộc · Mộc sinh Hỏa · Hỏa sinh Thổ · Thổ sinh Kim.**

- Tướng đứng **kề** một tướng thuộc hành **sinh ra mình**: **+10% sát thương**, tối đa 2 lần (+20%). Đường nối mờ màu hành hiện giữa hai tướng khi đang chọn tướng.
- **Ngũ hành tề tựu:** trên sân có đủ 5 hành → toàn quân **+10% sát thương**, có thông báo nhỏ khi đạt.

### Hành của đồ trang phục

| Quan hệ đồ và tướng | Hiệu quả |
|---|---|
| Cùng hành ("hợp mệnh") | +10% chỉ số gốc của món |
| Hành đồ sinh ra hành tướng | +5% chỉ số gốc |
| Hành đồ khắc hành tướng ("khắc mệnh") | −10% chỉ số gốc |
| Còn lại | không đổi |

Thẻ chi tiết món đồ hiện sẵn dòng "Hợp mệnh / Khắc mệnh với [tên tướng]" khi kéo đồ vào tướng.

### Hành và hiệu ứng ẩn của tướng

Mỗi tướng có **1 hiệu ứng ẩn**. Thẻ tướng hiện "??? · Hiệu ứng ẩn" kèm gợi ý; điều kiện xảy ra lần đầu thì hiện ra với chữ "**Đã khám phá!**" và được lưu vĩnh viễn.

| Tướng | Hành | Hiệu ứng ẩn | Gợi ý |
|---|---|---|---|
| Lạc Tướng | Kim | Đứng kề Lực Sĩ Núi: Khiên Đồng choáng thêm 0,5 giây | "Rìu cần người gánh núi" |
| Lực Sĩ Núi | Thổ | Đứng ô bậc Cao: Vùi Đá chôn 2 quái | "Đứng càng cao, núi càng nặng" |
| Xạ Thủ Văn Lang | Kim | Mỗi 10 quái bay bị hạ: +1% tầm, tối đa +10% trong trận | "Mắt quen trời" |
| Thợ Săn Rừng | Mộc | Săn Mồi hạ gục mục tiêu: hồi ngay 50% năng lượng | "Thú săn được nuôi thợ săn" |
| Thầy Mo Lửa | Hỏa | Lửa đốt quái hành Kim kéo dài gấp đôi | "Lửa thử vàng" |
| Thần Sương Núi | Thủy | Quái chết khi đang đóng băng: vỡ băng, làm chậm quái xung quanh 1,5 giây | "Băng vỡ, sương lan" |
| Thánh Gióng | Hỏa | Khi thành còn ≤ 5 mạng: Vươn Vai lập tức đạt tối đa | "Giặc đến nhà" |
| Lạc Long Quân | Thủy | Âu Cơ cùng trên sân: Bọc Trăm Trứng nở thêm 50% Lạc Tử. Nhưng nếu hai người đứng kề nhau, cả hai −10% sát thương | "Năm mươi lên núi, năm mươi xuống biển" |
| Thần Kim Quy | Kim | Thành còn 1 mạng: Kim Quy Hộ Thành tự kích hoạt một lần, kể cả đang hồi chiêu | "Rùa vàng giữ thành" |
| Thạch Sanh | Mộc | Đứng gần tướng vừa gục: tướng đó hồi sinh nhanh hơn 50% | "Niêu cơm ăn mãi không hết" |
| Cao Lỗ | Kim | Thần Kim Quy cùng trên sân: Nỏ Thần gây sát thương x2 | "Móng rùa thần" |
| Mai An Tiêm | Mộc | Sau đợt 20: mỗi đợt 10% rơi "dưa vàng" +100 vàng | "Đảo hoang thành vườn" |
| Âu Cơ | Thổ | Đứng ô bậc Cao: Hoa Tiên hồi máu cho thêm 1 tướng | "Mẹ ở trên núi" |
| Chử Đồng Tử | Thủy | Đứng ô ngập: không bị sa lầy | "Người đánh cá quen sông" |
| Tiên Dung | Hỏa | Mưa Hoa Tiên hồi máu gấp đôi cho Chử Đồng Tử | "Bãi Tự Nhiên" |
| Lang Liêu | Thổ | Đợt 30 (Thủy Tinh): Lễ Tổ Tiên giảm 50% hồi chiêu | "Đất trời chứng giám" |

Ghi chú: Tiên Dung (Hỏa) và Chử Đồng Tử (Thủy) vốn khắc nhau theo ngũ hành; đặc trưng **Đôi Uyên Ương** (mục 2) được tính là ngoại lệ, hai người đứng cạnh nhau vẫn được +20%.

### Hiệu ứng ẩn của quái và boss

- **Hà Bá** bị hạ lần đầu, lặn xuống rồi trồi lên đổi sang hành **Kim** (vảy hóa đồng). Người chơi phải đổi tướng chủ lực sang Hỏa. Bách khoa chỉ ghi điều này sau lần gặp đầu tiên.
- **Giao Long Con** mỗi con mang 1 hành ngẫu nhiên, nhìn màu vảy để biết.
- **Quái tinh anh** (Rùa Giáp khổng lồ) có 30% mang thêm một hành phụ: chịu khắc từ cả hai hành.

### Bách khoa · tab Bí truyền

- Thêm tab **Bí truyền** trong Bách khoa: liệt kê mọi hiệu ứng ẩn của tướng, đồ, quái. Mục chưa khám phá hiện "???" và câu gợi ý.
- Tiến độ khám phá lưu **vĩnh viễn giữa các trận** (lưu cùng tiến trình), có thanh "Đã khám phá 12 / 60".
- Khám phá đủ hiệu ứng ẩn của một tướng: mở **khung chân dung vàng** cho tướng đó (thưởng hình, không tăng sức mạnh).

### Ảnh hưởng tới hình ảnh

- 5 biểu tượng hành; viền tên và đường nối tương sinh theo màu hành.
- Đồ trang phục: **cùng dáng, đổi màu điểm nhấn theo hành** (5 bản màu nhuộm bằng code, không phải vẽ thêm hình).
- Đồ bộ: 5 bộ × 3 món, vũ khí bộ theo 4 dáng → cần vẽ mới khoảng **30 mảnh** cộng 5 hiệu ứng sau lưng khi đủ bộ.
- 4 icon phụ kiện mới và 8 icon đồ ghép mới.
- Số sát thương khắc chế hiện màu vàng, bị khắc hiện màu xám.

---

## 15. Ghi chú triển khai trong code

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

### Phiên bản 16 · màn chơi gọn

Màn đánh quái chỉ hiện thứ cần ngay lúc đó:
- **Thanh trên:** ≡ Menu, Đợt, vàng / mạng / mực nước, tốc độ, ▶/■. Lò đúc đồng, Túi đồ, Núi Tản Viên, Bách khoa và Tạm dừng nằm trong **≡** (có chấm xanh khi có Linh Chi để hái).
- **Dải đợt kế:** hiện đợt đặc biệt sắp tới; giữa hai đợt thì kèm **Gọi sớm**, chạm vào dải để gọi.
- **Hàng thẻ dưới đáy:** 6 thẻ tướng + ★ Huyền thoại để triệu hồi. Chạm vào tướng trên sân thì hàng thẻ đổi thành **thẻ tướng**: chân dung, Q W E R (chạm ô khóa để mở bằng vàng), **Lên cấp**, và **⋯** (Kỹ năng, Tiến hoá, Trang bị, Đổi chỗ, Bán).
- **Mọc Núi:** nút nổi góc dưới phải, chỉ hiện khi nước sắp dâng hoặc đã ngập.
- Bỏ bản đồ nhỏ và 6 ô đồ khỏi màn chơi (xem đồ trong Trang bị / Túi đồ). Phần dưới bản đồ được mở thêm 6 ô đặt tướng (tổng 50 ô).

### Phiên bản 17 · menu chính theo bản mẫu mobile

Menu chính có 4 nút như bản mẫu: **Xuất Quân** (đỏ son; mở bản đồ chiến dịch, hoặc quay lại trận đang dở), **Anh Hùng (16 Tướng)**, **Kho Báu & Sính Lễ**, **Cài Đặt**. Bách khoa thủy quái là liên kết nhỏ bên dưới. Thêm dòng "Sơn Tinh • Thủy Tinh (~500 TCN)", chân trang "Phong Châu Thành • Đông Sơn Fantasy", nút lún nhẹ khi bấm.

### Phiên bản 18 · hình ảnh theo bản giao v15

Làm theo mục 2, 4, 5 và 13 của bản giao v15 (không đổi luật chơi, số liệu):
- **Lên cấp:** vòng hoa văn trống đồng lóe dưới chân, tướng nảy 4px, chữ "Cấp N" bay lên (0,6 giây), đòn đánh không dừng. Bấm nhanh nhiều lần hoặc "Hội làng mừng thắng" gộp thành "+N cấp". Đủ cấp 3/6 (mở E/R) hoặc 5/10/15 (tiến hoá) thì nút **⋯** và mục Kỹ năng / Tiến hoá nhấp nháy tới khi mở xem.
- **Mở kỹ năng:** ô Q/W/E/R vừa mở lóe vàng 0,5 giây.
- **Tiến hoá (1,2 giây):** tướng nhấc 10px trong cột sáng màu đồng, nổ hạt hoa văn trống đồng, hạ xuống với kích thước mới (★ +10%, ★★ +15%, ★★★ +20%); sao mới hiện trên thanh máu lúc hạ xuống. Hào quang theo bậc (1–3 vòng, vòng trong màu hệ, hạt bay lên), ★★ mắt sáng và vũ khí ánh màu hệ, ★★★ vầng sao 12 cánh sau lưng và **tên tướng chữ vàng** trên thanh máu.
- **Đồ theo độ hiếm:** chất liệu và màu ánh theo bảng mục 5 (Thường nâu xám, Hiếm xanh lam, Sử thi tím thở chậm, Huyền thoại cam vàng + hạt sáng); đồ +5 có tia lấp lánh mỗi 3 giây; tướng huyền thoại giữ dáng vũ khí đặc trưng, chỉ đổi màu ánh (Kim Quy: vương miện nhỏ + mai; Âu Cơ: cánh lông vũ). Chỉ hiện hào quang của 1 phụ kiện mạnh nhất.
- **Mặc đồ:** lóe màu độ hiếm ở tay / đầu / thân 0,3 giây. **Thăng phẩm** đồ đang mặc: nhấp sáng 2 lần (0,6 giây) rồi đổi hình.
- **Đủ Bộ Lạc Long:** cánh rồng bung ra 1,5 giây, rung màn nhẹ, chữ "Bộ Lạc Long" giữa màn; Lạc Long Quân cánh to gấp rưỡi, có ánh sét.
- Các hiệu ứng trên vẫn chạy khi chưa bấm ▶ hoặc đang dừng, để thao tác lúc chuẩn bị vẫn thấy phản hồi.

### Phiên bản 19 · hệ thống đồ, Ngũ hành, Luyện thể (bản giao v15 bổ sung)

Làm theo GAMEPLAY v15 (mục 2, 5, 14). Số liệu cũ giữ nguyên; số mới đều là đề xuất, sửa trong `js/data.js`.

- **Ngũ hành:** 16 tướng, quái và boss mang hành như bảng mục 14. Khắc +30% (số sát thương hiện vàng), bị khắc −20% (số xám); đứng kề (cách một ô) tướng thuộc hành sinh ra mình +10%, tối đa +20%, có đường nối nét đứt màu hành khi chọn tướng; đủ 5 hành trên sân toàn quân +10% (có thông báo). Chấm màu hành cạnh huy hiệu cấp tướng và bên trái thanh máu quái; biểu tượng hành trên thẻ tướng, Cây kỹ năng, Anh Hùng, Bách khoa.
- **Hiệu ứng ẩn (48):** 16 của tướng, 10 của đồ theo hành, 14 của đồ ghép, 5 của bộ đồ, 3 của quái/boss (Hà Bá trồi lên hóa Kim, Giao Long Con hành ngẫu nhiên, Rùa khổng lồ 30% có hành phụ). Hiện "???" kèm gợi ý; lần đầu xảy ra trong trận thì hiện "Đã khám phá!" và lưu vĩnh viễn (cùng tiến trình). Bách khoa có tab **Bí truyền** với thanh tiến độ; khám phá hiệu ứng ẩn của tướng mở **khung chân dung vàng**.
- **Đồ trang phục:** mỗi món mang 1 hành (đồ bộ: hành của bộ). Cùng hành với tướng +10% chỉ số gốc, hành đồ sinh hành tướng +5%, khắc mệnh −10% (thẻ chi tiết ghi rõ). Đồ rơi / Hũ báu có **dòng phụ** (Hiếm 1, Sử thi 1, Huyền thoại 2), **Tẩy luyện** 50 → 100 → 200 → 400 vàng. Đồ Sử thi trở lên có **hiệu ứng ẩn** theo hành. Đồ Huyền thoại +5 có nút **Tôi luyện** (300 + 100 × lần, +3% chỉ số gốc; ✦5 dòng phụ +50%; ✦10 mở hiệu ứng ẩn thứ hai). Đồ trang phục giữ nguyên chỉ số cũ thay vì bảng "chỉ số gốc" đề xuất, để không lệch cân bằng đã thử.
- **Bộ đồ (5):** Lạc Long, Sơn Tinh, Chim Lạc, Trống Đồng, Ngựa Sắt; hiệu ứng 2 món / 3 món; đủ bộ cùng hành tướng là **Thiên mệnh** (hiệu ứng 3 món +50%). Đồ bộ chỉ rơi từ quái tinh anh, boss (25%) và Hũ Vua Hùng (30%). Đủ bộ có hiệu ứng sau lưng: cánh rồng, khối núi đá, cánh lông chim Lạc, mặt trống xoay, bờm lửa. "+25% giáp" của Bộ Sơn Tinh làm thành −15% sát thương nhận (tướng không có chỉ số giáp).
- **Lò đúc:** 14 công thức (8 mới), 4 phụ kiện mới (Sừng Tê, Lông Chim Lạc, Vảy Cá, Hạt Lúa), ghi rõ món khắc chế quái nào.
- **Luyện thể:** tướng cấp 25 đổi nút Nâng cấp thành Luyện thể (200 + 50 × lần, +3 thuộc tính chính, +1 thuộc tính phụ), hiện ✦N.
- **Ảnh:** đọc tên file theo `tools/asset-manifest.json` (xem `docs/ASSETS.md`); tướng dùng ảnh theo **bậc trang phục** = độ hiếm trung bình của vũ khí, mũ, giáp.

### Phiên bản 20 · Thăng thần, animation, mặc đồ dễ hơn

- **Thăng thần:** tướng huyền thoại không còn triệu hồi thẳng bằng vàng. Tướng cơ bản đạt ★★★ mở **⋯ → Thăng thần** để hóa thân (Sử thi 300 vàng, Huyền thoại 450 vàng), giữ cấp, cấp Q W E R, ★★★ và đồ đang mặc; tối đa 2 Huyền thoại trên sân. Cây thăng thần (theo loại vũ khí để đồ vẫn mặc được):
  - Lạc Tướng → Lạc Long Quân / Thánh Gióng
  - Lực Sĩ Núi → Thần Kim Quy
  - Thợ Săn Rừng → Thạch Sanh
  - Xạ Thủ Văn Lang → Cao Lỗ / Mai An Tiêm
  - Thầy Mo Lửa → Tiên Dung / Lang Liêu
  - Thần Sương Núi → Âu Cơ / Chử Đồng Tử

  Nút ★ ở hàng thẻ mở bảng Cây thăng thần (chỉ xem). Gợi ý tướng của các ải đổi sang tướng cơ bản.
- **Animation đánh:** 3 pha lấy đà → ra đòn → thu về, có nghiêng người và co giãn; vệt chém hình lưỡi liềm (màu theo độ hiếm vũ khí), chớp sáng đầu nỏ, quả cầu sáng tụ ở đầu gậy. Sát thương rơi đúng lúc ra đòn (trễ ~0,13 giây). Quái trúng đòn giật lùi và nén lại, bơi có nhịp co giãn; tướng bị đánh ngả người.
- **Hiệu ứng đồ trên người mặc:** phụ kiện có hiệu ứng có quả cầu màu bay quanh người; trạng thái hiện rõ (lửa Song Rìu theo số tầng, sóng Trống Đồng đầu đợt, da đá, rễ cây, bong bóng, người bốc lửa khi máu thấp, bụi đá Bộ Sơn Tinh). Mỗi lần đồ kích hoạt có vòng chớp sáng màu của món; trên quái có dấu nứt giáp, lưới, băng, ấn cấm hồi máu, đồng vàng khi hạ quái có thưởng vàng.
- **Mặc đồ dễ hơn:** chỉ số **Lực chiến** để so đồ; mũi tên ▲ xanh trên món trong túi làm tướng mạnh hơn và trên nút ⋯; nút **Tự mặc đồ tốt nhất** (trong túi đồ và menu ⋯); thẻ món đồ hiện Lực chiến trước → sau; chạm lần hai vào món đang chọn để đeo; đồ vừa rơi tốt hơn cho tướng nào thì hiện nút **▲ Đeo cho …** góc dưới phải.
- **Ảnh Fooocus:** `tools/xoa-nen.py` xoá nền xám cho ảnh đơn; game dùng thêm `bo-*_sau-lung`, `tien-hoa_1..3`, `ban-do_o-*`, `ban-do_phong-chau`, `trieu-hoi_*`.

### Phiên bản 21 · tướng thần mạnh hơn, kỹ năng học lại bằng vàng, xuyên giáp / xuyên kháng

- **Thăng thần mạnh hơn:** tướng thần kế thừa thuộc tính và chỉ số gốc (lấy bên cao hơn) cùng **nội tại** của tướng gốc, cộng **Thần lực**: Sử thi ×1,3, Huyền thoại ×1,5 sát thương và máu (sức mạnh kỹ năng + một nửa mức đó). Ngay sau khi hóa thân Lực chiến tăng khoảng 1,4–1,7 lần; bảng Thăng thần hiện Lực chiến trước → sau.
- **Kỹ năng sau Thăng thần học lại bằng vàng:** bộ kỹ năng mới bắt đầu từ Q cấp 1; mở khóa W 150 · E 300 · R 500 vàng; nâng cấp Q/W/E 120 × cấp hiện tại, R 300 × cấp hiện tại.
- **Điểm kỹ năng thừa:** khi không còn kỹ năng nào nâng được bằng điểm (hoặc tướng đã thăng thần), nút **Nâng chỉ số**: 1 điểm → +2 thuộc tính chính.
- **Giáp / kháng phép quái tăng theo đợt:** mỗi 10 đợt +1 giáp và +3% kháng phép (quái vốn có kháng phép, tối đa 80%). Bách khoa ghi mức giảm sát thương; thanh boss hiện giáp và kháng phép.
- **Xuyên giáp / xuyên kháng phép:** vũ khí Hiếm trở lên (rìu, nỏ: xuyên giáp; gậy: xuyên kháng phép), Mũ Sừng, Nón Thầy Mo, Sừng Tê, Khăn Hiền Giả, Gậy Thời Không, Mũi Sừng Phá Giáp, Ngọc Trấn Thủy, vũ khí đồ bộ; 2 dòng phụ mới (+10% xuyên giáp, +10% xuyên kháng phép). Chiêu tối thượng R xuyên thêm 30% giáp và kháng phép. Cây kỹ năng và túi đồ hiện xuyên giáp / xuyên kháng của tướng.
- **Bản đồ ải AI:** sửa prompt `nen_ai-1..4` (sông chảy trái → phải, thành ở mép phải, núi dọc mép trên, 1/3 dưới để trống); game dùng ảnh làm nền rồi vẽ lại dòng sông lên trên để đường quái đi luôn đúng. Ải 1, 5 → ảnh 1; ải 2, 6 → ảnh 2; ải 3, 4, 7 → ảnh 3; ải 8 → ảnh 4.

### Phiên bản 23 · Thần tinh và sao mạnh hơn

- **Sao tiến hoá mạnh hơn** (cộng dồn sẵn theo bậc): ★ +15% sát thương +10% máu · ★★ +30% sát thương +20% máu +10% tốc đánh · ★★★ +50% sát thương +35% máu +20% tốc đánh +10% kỹ năng.
- **Thần tinh (sau Thăng thần):** tướng thần giữ chỉ số ★★★ của tướng gốc, rồi tiến hoá lại 3 bậc Thần tinh (sao cam đỏ, vòng lửa thần, mỗi bậc to thêm 4%): 300 / 600 / 1000 vàng, cần cấp 16 / 20 / 24. ★ +20% sát thương +15% máu +10% kỹ năng · ★★ +45% / +30% máu / +10% tốc đánh / +20% kỹ năng · ★★★ +80% / +50% máu / +20% tốc đánh / +35% kỹ năng.

### Phiên bản 24 · Cửa hàng, ghép đồ, hũ báu

- **Cửa hàng có hàng thật:** 6 món đồ trang phục / phụ kiện ngẫu nhiên, nhập hàng mới sau mỗi đợt; độ hiếm tốt dần theo đợt (đợt 12 đã có Sử thi, sau đợt 8 bắt đầu có Huyền thoại). Giá Thường 70 · Hiếm 170 · Sử thi 400 · Huyền thoại 900 (phụ kiện theo giá gốc). Đồ mua có hành và dòng phụ như đồ rơi. Mỗi ô ghi món đó làm tướng nào mạnh thêm bao nhiêu lực chiến; nút **Mua & đeo**. **Làm mới hàng** 20 vàng, mỗi lần sau trong cùng đợt +10. Nguyên liệu ghép vẫn bán đủ ở mục "Nguyên liệu".
- **Ghép nhanh:** nút **Mua thiếu & ghép** mua luôn nguyên liệu còn thiếu rồi đúc; công thức hiện tướng hợp nhất.
- **Đồ ghép khác gì đồ nâng cấp:** đeo ở 3 ô phụ kiện (không tranh chỗ vũ khí / mũ / giáp), có hiệu ứng riêng, hiệu ứng ẩn và hào quang; vẫn cường hóa +5 và thăng phẩm như đồ trang phục. Hai loại cộng dồn, không thay thế nhau.
- **3 loại hũ:** Hũ báu 90 (mọi độ hiếm) · Hũ đồng 240 (Hiếm trở lên) · Hũ Vua Hùng 600 (Sử thi trở lên, 35% ra đồ bộ). Mở 5 hũ chưa ra Sử thi thì hũ kế chắc chắn Sử thi trở lên.

### Phiên bản 26 · thần Huyền thoại (vàng) mạnh hơn hẳn Sử thi (tím)

- Thần lực: Sử thi ×1,15, **Huyền thoại ×2** sát thương và máu; Thần tinh của tướng Huyền thoại mạnh thêm 30% mỗi bậc. Giá Thăng thần Huyền thoại 550 vàng (Sử thi 300).
- Kế thừa hợp lý hơn: tốc đánh giữ theo tướng thần; số tia bắn lấy bên nhiều hơn chứ không cộng dồn. Lẫy Thần của Cao Lỗ giảm còn +15% + 0,2 × sức mạnh kỹ năng.
- Lực chiến ngay khi lên thần (so với tướng gốc ★★★, cấp 18): Huyền thoại ×2,0–2,35 (Âu Cơ ×3,4), Sử thi ×1,15–1,9.
