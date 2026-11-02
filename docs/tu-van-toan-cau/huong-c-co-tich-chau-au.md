# Hướng C: Cổ tích châu Âu, bản chi tiết (02/11/2026)

Tài liệu này viết tiếp bản tư vấn `tu-van-02-11.md` sau khi **chủ game chọn hướng C: cổ tích châu Âu**.
Chủ game dặn bỏ ý tưởng chuông, vì chuông là mô-típ của một game khác của chủ game. Vì vậy trong tài liệu này **không có chuông, tiếng vọng, người giữ chuông hay thứ gì phát ra âm thanh làm "sợi dây" của truyện**.
Những gì ở bản cũ còn đúng (phân tích lối chơi, đa ngôn ngữ, chuẩn điểm ảnh, điểm văn hoá cần tránh) thì không viết lại, chỉ nói cái gì **đổi** khi đi theo hướng C.

**Đã đọc trước khi viết:**
- `docs/tu-van-toan-cau/tu-van-02-11.md` và các ảnh hiện trạng (làng, lâu đài, sông)
- `docs/cot-truyen/CHUNG.md`
- `game/js/truyen.js` (lời truyện, câu trùm, câu người làng)
- `game/js/data.js` (vùng, ba bạn, trang phục), `monster_art.js` (tên quái từng vùng), `village_scene.js` (7 người làng)
- Danh sách 718 tấm trong `game/art/custom/*.sprite.json`, 2 tranh màn đầu `art/bia`, 7 tranh truyện `art/truyen`

Không ai chơi thử game để viết tài liệu này.

---

## 1. Tóm tắt 10 dòng

1. **Ý tưởng trung tâm (khuyên dùng):** **Cuốn Sách Lớn bị xé trang.** Làng giữ một cuốn sách cổ tích "nhốt" mọi sinh vật trong truyện của nó. Con rắn sông Lindworm xé các trang. Quái thoát khỏi trang sách thì không còn theo truyện cũ, nên chúng **học theo người đánh chúng**.
2. **Tên game (khuyên dùng):** **Spiritblade: The Torn Storybook**. Giữ được tên miền `spiritblade.web.app` và chữ SPIRITBLADE đang có trên màn đầu.
3. **Nhân vật chính (khuyên dùng):** **Rowan**, học việc lò rèn, áo chẽn xanh lam, **mũ trùm ngắn màu nghệ**, đeo túi da đựng trang sách. Giữ khung và mọi động tác 8 hướng, chỉ vẽ lại đầu và đổi màu áo.
4. **Bốn vùng thành bốn chương:** Rừng Gai (Thornwood), Hang Chìm (Drowned Grotto), Lâu đài Than Hồng (Emberhold), Đầm Sương (Mirefen). Trận cuối: **Inkwyrm**, con Lindworm uống mực các trang hoá rồng.
5. **Trùm giữ được hình:** cây (Mộc Tinh), mực cầm rìu (Ngư Tinh), nấm, cua, cá trê. **Phải sửa:** cáo chín đuôi thành cáo phù thuỷ một đuôi, hổ lửa thành sư tử than. **Phải vẽ mới:** Thuồng Luồng thành Lindworm (đằng nào cũng phải vẽ).
6. **Lượng hình:** giữ nguyên khoảng **70% số tấm**. Vẽ tay mới hoặc sửa tay khoảng **135–155 tấm**, cộng khoảng **70 tấm giao diện tô lại màu bằng công cụ**. Tính theo công vẽ là khoảng **30%**.
7. **Ba thay đổi lối chơi** của bản cũ vẫn giữ, chỉ đổi "lớp áo" cho hợp cổ tích: trang sách bay ở ải 1-1 nhuộm hệ cho kiếm; thẻ sau mỗi phòng thành **Thẻ Truyện (Tale Cards)** hình trang sách; mang 2 vũ khí, ẩn Ép đồ, một số Power.
8. **Thêm một điểm nhỏ, rẻ, rất hợp chủ đề:** khi vũ khí lên Thức tỉnh, tên nó được **viết vào một trang trắng của Sách Lớn**. Người chơi có "trang truyện của riêng mình". Không đổi cảm giác đánh.
9. **Truyện vẫn MỞ như `CHUNG.md`:** không ai biết sách bị xé bao nhiêu trang, nên thêm chương lúc nào cũng được. "Mảnh mặt trời" cũ đổi thành **Trang Bìa**, Lindworm giữ tới trận cuối.
10. **Lộ trình 3 giai đoạn**, giai đoạn nào xong cũng đưa lên web được. Giai đoạn 1 chỉ đổi chữ, logo và màu áo. Chủ game cần chốt 4 câu ở mục 10 trước khi bắt đầu.

---

## 2. Ý tưởng trung tâm (thay cho trống đồng)

Yêu cầu của "sợi dây" này: vỡ hoặc mất được thành **nhiều mảnh không rõ số lượng** (để truyện mở), mỗi vùng lấy về một mảnh, ăn khớp với "vũ khí có hồn lớn lên theo người cầm", 3 hệ Lửa/Độc/Băng, và "quái học lại cách bạn đánh".

### Phương án 1: Cuốn Sách Lớn bị xé trang *(khuyên dùng)*

- Làng giữ **Sách Lớn (the Great Storybook)**: mọi sinh vật hung dữ của vùng đất đều được "viết" vào một truyện, và còn nằm trong truyện thì chúng phải làm đúng như truyện kể, như con sói chỉ ở trong rừng, con quỷ chỉ ở dưới gầm cầu. Con rắn sông xé các trang ra, các sinh vật **thoát khỏi truyện của mình**, nên chúng tự viết truyện mới bằng cách **bắt chước người đánh chúng**: đó chính là "quái học lại cách bạn đánh".
- Ba hệ là **ba loại mực cổ** của Sách Lớn: mực đỏ của truyện rồng (Lửa), mực xanh lục của truyện phù thuỷ (Độc), mực xanh băng của truyện mùa đông (Băng). Vũ khí do lò rèn làng đúc có hồn, thấm mực nào thì mang hệ đó, và khi Thức tỉnh thì **tên vũ khí được viết vào một trang trắng**.
- Mỗi vùng là một **chương**, trùm vùng ôm một trang bị xé, lấy về thì một hình vẽ trong sách sống lại ở làng (cái giếng có nước, cây táo ra quả, đèn ở cửa hàng sáng lên). Không ai biết bao nhiêu trang bị xé, nên thêm chương bao nhiêu cũng được.

**Vì sao khuyên dùng:** đây là phương án "cổ tích" rõ nhất, người chơi nhìn là hiểu ngay mà không phải đọc nhiều. Nó cũng cho ta lý do thật cho việc quái thích nghi, và cho vũ khí Thức tỉnh một phần thưởng nhìn thấy được. Chữ "Chương 1, Chương 2" trên bản đồ còn khớp đúng với tệp `chuong.js` đang có.

### Phương án 2: Vương miện đá vỡ

- Vương quốc có **Vương Miện Đá (the Stone Crown)**: ai đội nó thì mọi quái vật phải nghe lệnh. Vua cuối cùng chết, vương miện vỡ thành nhiều viên ngọc, quái nào nhặt được ngọc thì tự xưng vua một vùng.
- Mỗi viên ngọc mang một hệ (hồng ngọc Lửa, lục ngọc Độc, lam ngọc Băng), vũ khí khảm ngọc mới lớn lên. Quái đội ngọc thì "học" được sức mạnh của người đã chạm vào ngọc trước nó, nên chúng học cách bạn đánh.
- Mỗi vùng lấy về một viên ngọc, gắn lại lên vương miện ở làng.

**Điểm yếu:** "vương miện, vua, ngai" là chủ đề rất nhiều game phương Tây đã dùng. Ngọc bị nhiều game dùng làm tiền, dễ lẫn với nguyên liệu. Mối nối với "vũ khí có hồn" yếu hơn phương án 1.

### Phương án 3: Lò rèn cổ tắt lửa

- Giữa làng có **Lò Rèn Cổ (the Elder Forge)** cháy ba ngọn lửa màu: đỏ, lục, lam. Mọi vũ khí có hồn đều được rèn ở đây. Con rắn sông dập lò, ba ngọn lửa tách thành nhiều đốm than bay khắp vùng.
- Quái nuốt đốm than thì lớn lên và có thể "rèn lại" thân mình theo đòn đánh vào nó, nên chúng học cách bạn đánh. Mỗi vùng lấy về một đốm than, lò cháy to thêm.
- Rất khớp với làng thợ rèn và hệ Luyện.

**Điểm yếu:** ít mùi cổ tích. Đây là truyện "thợ rèn" chung chung, đặt ở bối cảnh nào cũng được, nên không tận dụng được chủ đề chủ game vừa chọn. Một đốm than cũng khó vẽ thành mảnh nhận ra được trên giao diện.

### Kết luận

**Chọn phương án 1: Sách Lớn bị xé trang.** Lò rèn vẫn là nơi đúc vũ khí, chỉ không làm "sợi dây" của truyện. Cuốn sách cũng thay được toàn bộ họa tiết trống đồng trên giao diện bằng thứ rất dễ vẽ: khung trang giấy, góc sách bọc đồng, dấu mực.

---

## 3. Tên game

Kiểm nhanh trên web ngày 02/11/2026 (nguồn ở cuối tài liệu):

| Tên | Kết quả kiểm | Ý kiến |
|---|---|---|
| **Spiritblade: The Torn Storybook** | "Spirit Blade" chỉ có vài game nhỏ trên itch.io. "Torn Storybook" không thấy game nào; chỉ có game nhỏ "Torn Pages" trên itch.io | **Khuyên dùng.** Giữ tên miền và chữ trên màn đầu, phụ đề nói rõ đây là truyện cổ tích |
| **Talesworn** | Không thấy game nào trùng | Tên một từ, đẹp, dễ nhớ. Nhưng phải mua tên miền mới, và tên miền `spiritblade.web.app` thành ra lạc |
| **Fablesworn** | Không thấy game nào trùng. Đã có game "SWORN" (Team17) và trò nhập vai giấy "Ironsworn", hơi gần | Dùng được, kém hơn Talesworn |
| **Spiritblade: Once Upon a Blade** | Không thấy game nào trùng | Vui tai nhưng lặp chữ "blade" hai lần |
| ~~Torn Tales~~ | **Đã có** game "Torn Tales" trên Steam và Switch | Loại |
| ~~Unwritten…~~ | Đã có loạt game cổ tích nổi tiếng "The Book of Unwritten Tales" | Loại mọi tên có chữ "Unwritten" |
| ~~Taleblade~~ | Không có game, nhưng là tên một món đồ trong sách nhập vai giấy của Kobold Press | Nên tránh |

**Khuyên dùng: Spiritblade: The Torn Storybook.** Khi cần tên ngắn (biểu tượng ứng dụng, mạng xã hội) thì chỉ dùng "Spiritblade". Nếu sau này muốn tên riêng hẳn thì **Talesworn** là dự phòng tốt nhất.

---

## 4. Cốt truyện khung

Giữ nguyên cấu trúc mở của `CHUNG.md`: mỗi vùng là một tập (nay gọi là **chương**), có nơi chốn, trùm, người cần cứu, **một trang sách** và một câu móc sang chương sau. Kẻ cầm đầu thua thì trốn, chỉ kết thúc hẳn khi chủ game muốn. Mã `truyen.js` vẫn là danh sách theo vùng, chỉ thay chữ và ảnh.

Giọng kể: như người bà kể chuyện bên lò sưởi, câu ngắn, có "ngày xửa ngày xưa", có chút đáng sợ kiểu Grimm, nhưng kết mỗi chương ấm áp kiểu Andersen. Mọi nhân vật đều tự nghĩ ra, không dùng nhân vật có sẵn của Disney hay của sách nào.

### Đối chiếu với các chốt cũ của chủ game

| Chốt cũ (`CHUNG.md`) | Theo hướng C |
|---|---|
| Trống đồng trấn yêu, bị Thuồng Luồng đập vỡ | Sách Lớn nhốt quái trong truyện, bị Lindworm xé trang |
| Cây đa bị hút linh khí qua rễ | Bỏ cây đa. Lindworm **uống mực** của các trang để lớn lên. Sách mất mực thì chữ mờ dần, làng mất màu |
| Mảnh mặt trời (mảnh lớn nhất) Thuồng Luồng giữ tới vùng 8 | **Trang Bìa (the Cover)** có tên cuốn sách. Lindworm giữ tới chương cuối, đội trên trán Inkwyrm |
| Hắc Long là Thuồng Luồng hoá rồng | **Inkwyrm** là Lindworm hoá rồng (pha 1 vẫn là rắn) |
| Bé Sen ra mắt sớm ở bến đò, vùng 4 bị bắt | **Lettie**, con gái người lái đò Hob, ra mắt sớm, chương 4 bị bắt |

### Mở đầu (5 khung, như hiện tại)

1. "Ngày xửa ngày xưa, ở làng Hollin bên sông, có một cuốn Sách Lớn. Mọi quái vật của vùng đất đều bị viết vào truyện trong sách, và chúng phải ở yên trong truyện của mình."
2. "Một đêm sương, có thứ gì trườn lên từ sông và xé các trang sách. Ra khỏi truyện, quái vật thức dậy: lão cây gai ở Rừng Gai, gã mực ở Hang Chìm, mụ cáo ở Lâu đài Than Hồng."
3. "Dưới đáy sông có một cái bóng dài, miệng đen vì mực. Nó uống mực của từng trang, và chữ trong sách mờ dần."
4. "Jory, Liesel và Otto, ba bạn thân của Rowan, đi tìm các trang bị xé và bị quái bắt mất."
5. Bác thợ rèn: "Rowan, cầm lấy thanh kiếm này. Nó có hồn, và nó sẽ lớn lên theo cháu. Đi cứu bạn, mang các trang về. Bác Hob chờ ở bến đò."

### Bốn chương

| Chương | Nơi | Trùm vùng | Người được cứu | Trang lấy về và điều đổi ở làng | Câu móc sang chương sau |
|---|---|---|---|---|---|
| 1 | **Rừng Gai** (Thornwood): rừng già, bụi gai, nấm độc | **Grimbark**, lão cây gai | Jory (thợ săn) | Trang "Cây táo vàng": cây táo ở quảng trường ra quả | "Gã mực dưới Hang Chìm cũng ôm một trang. Liesel đang ở đó." |
| 2 | **Hang Chìm** (Drowned Grotto): hang biển, xác tàu | **Sir Inkmaw**, hiệp sĩ mực | Liesel (thầy thuốc thảo dược) | Trang "Giếng nước ước": giếng làng có nước lại | "Bên kia sông, lâu đài đỏ rực lửa. Otto ở trong đó." |
| 3 | **Lâu đài Than Hồng** (Emberhold): lâu đài đá bỏ hoang, lò sưởi cháy mãi | **Vulpina**, phù thuỷ cáo | Otto (con trai thợ xay bột, đô vật) | Trang "Cối xay": cối xay gió của làng quay lại | "Ba trang đã về, nhưng sách vẫn mờ. Đêm xuống, mặt sông gợn sóng." |
| 4 | **Đầm Sương** (Mirefen): sông đầm, cầu ván, cọc gỗ, sương | **Lindworm**, rắn sông | Lettie (con gái người lái đò) | Lindworm nhả một trang ("Đàn ngỗng trời"), ngoạm **Trang Bìa** trốn về núi | "Trên núi Bão, sấm nổ suốt từ đêm qua..." |

### Các chương sau (khung, chưa chốt, thay cho vùng 5–8 của `CHUNG.md`)

`CHUNG.md` dự định Chằn Tinh và Đại Bàng (truyện Thạch Sanh) cho vùng 6–7. Theo hướng C thì đổi như sau:

| Chương | Nơi | Trùm | Ý chính |
|---|---|---|---|
| 5 | Núi Bão (Stormpeak) | Người Khổng Lồ Sấm hoá điên vì mực của Trang Bìa | Mở hệ Sét, thú đồng hành đầu tiên |
| 6 | Hang đá dưới núi | Quỷ Gầm Cầu (Bridge Troll) | Đánh trong bóng tối, cầm đèn soi |
| 7 | Đỉnh mây | Sư Tử Đầu Chim (Griffin) | Quái bay, cứu bạn bị cắp lên tổ |
| Cuối (khi chủ game muốn kết) | Thư viện chìm dưới đáy sông | **Inkwyrm** | 3 pha; thắng thì Sách Lớn lành lại |

### Trận cuối: Inkwyrm (thay Hắc Long)

- **Hình:** rồng thân dài **không cánh** (lindworm trong truyện dân gian Bắc Âu vốn không cánh), thân bằng **mực đen loang**, nhìn xuyên thấy xương rắn bên trong. Các trang sách dán thay vảy, chữ trên trang cháy sáng. **Trang Bìa** ốp trên trán như mắt thứ ba. Phần này khớp gần như nguyên với mô tả Hắc Long cũ ("thân nước đen như mực").
- **Pha 1:** rắn nước, như Lindworm vùng 4.
- **Pha 2:** hoá rồng, các trang ghép quanh thân, dùng lại chiêu của các trùm trước (gai của Grimbark, mực của Inkmaw, lửa cáo của Vulpina).
- **Pha 3 "Trang cuối":** sàn đấu biến thành một trang giấy lớn. Rồng **viết những dòng mực** chạy ngang sàn; dòng mực khô thành tường gai, và từ chữ mọc ra bóng của các trùm cũ. Người chơi né theo **đường chữ đang được viết**, có vạch báo trước.
- **Bỏ hẳn** ý "đánh trống, sóng âm vòng, né theo nhịp nhạc" của Hắc Long cũ. Ý đó dựa vào âm thanh làm luật chơi, quá gần mô-típ game kia của chủ game.
- **Kết:** các trang rơi xuống, tự xếp vào Sách Lớn. Trang cuối cùng còn trắng, và người chơi thấy tên vũ khí Thức tỉnh của mình hiện lên trên đó.

---

## 5. Đổi tên đầy đủ

Quy tắc đặt tên vẫn theo mục 5.1 bản cũ: tên tiếng Anh tối đa 14 ký tự cho nút và nhãn, tối đa 20 ký tự cho tên trùm; trùm theo dạng "tên riêng + danh hiệu". Cột "Tiếng Việt mới" dùng cho bản tiếng Việt (nếu chủ game chọn đổi tên ở cả hai thứ tiếng).

### 5.1 Nhân vật chính (thay Cu Tí / Zed)

| Phương án | Tên | Ghi chú |
|---|---|---|
| **A (khuyên dùng)** | **Rowan** | Tên cây thanh lương trà, trong truyện châu Âu là cây trừ tà. Dùng được cho cả trai lẫn gái, đọc dễ ở mọi thứ tiếng |
| B | **Kit** | Rất ngắn, vui, kiểu cậu bé học việc trong truyện. Dễ trùng với chữ "kit" (bộ đồ) khi tìm trên mạng |
| C | **Tamsin** | Cô bé học việc. Hợp nếu chủ game muốn nhân vật chính là con gái. Dài hơn, ít "gọn" trên giao diện |

**Thiết kế (Rowan):**
1. Học việc lò rèn 12–13 tuổi. **Mũ trùm ngắn liền áo choàng vai màu nghệ** (#E0A23A), viền mũ sẫm (#A86A22). Đây là dấu hiệu nhận ra ngay khi hình còn nhỏ, và mang đúng "chất cổ tích".
2. Áo chẽn **xanh lam** (#3E6FA8), quần nâu sẫm, ủng da, tạp dề da ngắn (#7A4A2C) và một găng da. Màu lạnh và ấm đối nhau nên nổi trên cả bốn nền.
3. Mặt lộ rõ, tóc nâu hạt dẻ (#5A3426) lòi ra dưới mũ trùm, mắt to 2 điểm ảnh. Không mặt nạ.
4. **Túi da đeo chéo** có một mép trang giấy thò ra (trang trắng của Sách Lớn). Liên kết với cốt truyện, không có gì phát ra tiếng.
5. Giữ nguyên khung 48 điểm ảnh, chiều cao và **mọi động tác 8 hướng hiện có**. Chỉ vẽ lại đầu (8 hướng), mũ trùm, và đổi màu áo bằng công cụ. Làm thành **một "bộ trang phục" mới qua quy trình `dung-zed-game.py`** như ba bộ vùng đã làm, xem thử bằng `?zedbo=rowan` trước khi đặt làm mặc định. Bộ ninja đen cũ giữ làm trang phục phụ ("Shadow Garb").

**Lưu ý về mũ trùm:** mũ trùm làm đầu mỗi hướng thay đổi rõ hơn khăn quàng của bản cũ, nhưng lại **đỡ phải vẽ tóc bay** trong các động tác. Chỉ có tà áo choàng vai nên lắc nhẹ, mà cái đó có thể để đứng yên ở bản đầu.

### 5.2 Bốn vùng

| Hiện tại | Tiếng Anh | Tiếng Việt mới | Đổi gì trên hình |
|---|---|---|---|
| Rừng già | **Thornwood** | Rừng Gai | Giữ sàn. Thêm vài bụi gai có quả mọng ở mép phòng nếu có thời gian |
| Hang biển | **Drowned Grotto** | Hang Chìm | Giữ. Có thể thêm mảnh xác tàu, rương |
| Lâu đài cổ | **Emberhold** | Lâu đài Than Hồng | Sửa: bỏ cột đỏ sơn mài và thảm đỏ kiểu cung đình, đổi thành đá xám ấm, cờ vải nâu, lò sưởi đá, đèn sắt |
| Sông sâu | **Mirefen** | Đầm Sương | Sửa: hàng rào tre và cầu tre thành cọc gỗ và cầu ván dây thừng. Giữ nước và sàn ván |

### 5.3 Trùm vùng, trùm nhỏ, trận cuối

| Hiện tại | Tên mới (Anh / Việt) | Giữ hình được không | Việc phải làm |
|---|---|---|---|
| **Mộc Tinh** (cây mọc nấm độc, 3 pha) | **Grimbark, the Briar King** / Lão Cây Gai | **Giữ.** Cây già thành tinh là hình rất "rừng Grimm" | Đổi chiêu "Bùa bay" (bùa giấy chữ Hán) thành **lá gai bay**: sửa khoảng 4 tấm hiệu ứng `hu-dan-bua`, `hu-bua-*` |
| **Nấm Chúa** (trùm nhỏ rừng) | **Toadstool King** / Vua Nấm | Giữ | Không |
| **Ngư Tinh** (mực tám xúc tu cầm rìu san hô, 3 pha) | **Sir Inkmaw, the Kraken Knight** / Hiệp Sĩ Mực | **Giữ.** Mực khổng lồ là quái biển châu Âu (kraken), rìu san hô hợp "hiệp sĩ" | Tuỳ chọn: thêm một vệt mực đen khi đổi pha (dùng hiệu ứng sẵn có, tô đen) |
| **Cua Đá** (trùm nhỏ biển) | **Crystal Crab** / Cua Pha Lê | Giữ | Không |
| **Hồ Tinh** (cáo chín đuôi đeo mặt nạ, 3 pha) | **Vulpina, the Fox Witch** / Phù Thuỷ Cáo | **Sửa vừa.** Cáo chín đuôi là của châu Á; cáo trong truyện châu Âu là cáo ranh mãnh một đuôi | Gộp chín đuôi thành **một đuôi to cháy lửa**, đổi mặt nạ thành **mũ phù thuỷ rộng vành**. Sửa 3 pha, khoảng 4 tấm (`hoTinh`, `-p2`, `-p3`) |
| **Hổ Lửa** (trùm nhỏ lâu đài) | **Cinder Lion** / Sư Tử Than | **Sửa nhẹ.** Hổ không phải thú châu Âu; sư tử thì có trên mọi huy hiệu lâu đài | Bỏ vằn, thêm bờm lửa. 2 tấm (`hoLua`, `hoLua-p2`) |
| **Thuồng Luồng** (đang mượn hình rồng tím có cánh) | **Lindworm, the River Serpent** / Rắn Sông Lindworm | **Vẽ mới 3 pha.** Đằng nào cũng phải vẽ | Rắn sông không cánh, hai chân trước ngắn (đúng kiểu lindworm), thân bùn xanh rêu, miệng và móng đen vì mực, vài trang sách dính trên lưng |
| **Cá Trê** (trùm nhỏ sông) | **Old Mudwhisker** / Lão Cá Trê | Giữ (cá trê sống cả ở sông châu Âu) | Không |
| **Hắc Long** (trận cuối, chưa làm) | **The Inkwyrm** / Rồng Mực | Chưa có hình | Vẽ khi làm chương cuối, xem mục 4 |

### 5.4 Quái thường (chỉ những con phải đổi)

Quái rừng (heo, ong, bọ, hoa bào tử, chồn, nấm, sóc, nhím) và quái biển (cua, cá, ốc, hải quỳ, sứa, nhím biển) **giữ nguyên hình**, chỉ dịch tên.

| Hiện tại | Tên mới | Việc phải làm |
|---|---|---|
| Đèn Lồng Ma (lồng giấy đỏ, nan tre) | **Lantern Wisp**, ma đèn sắt | Sửa nhẹ: thân đèn thành lồng sắt có ma lửa |
| Mèo Đen Hai Đuôi | **Witch's Cat**, mèo phù thuỷ | Sửa nhẹ: bớt một đuôi (mèo hai đuôi là ma của Nhật) |
| Tiểu Yêu Ném Pháo | **Goblin Bomber** | Giữ |
| Lính Ma Giáp Gỉ / Tướng Ma | **Rusted Knight / Phantom Captain** | Giữ |
| Ma Da Tóc Rong (đang mượn hình) | **Bog Nixie**, tinh nước đầm | Vẽ mới (ma da là ma riêng của Việt Nam) |
| Cóc Tía Phun Bọt, Ếch Phình Hơi | **Toad Spitter, Puffer Frog** | Vẽ mới nếu còn là hình mượn. Cóc và ếch rất "cổ tích" |
| Ba Ba Mai Đồng | **Snapper Turtle**, rùa cắn | Vẽ mới nếu còn là hình mượn; bỏ mai đồng có hoa văn |
| Rái Cá Cầm Sào, Bầy Đỉa Trâu, Rắn Nước Sọc, Trai Sông Gai | Otter Poler, Leech Swarm, Water Snake, Spiny Mussel | Giữ con nào đã có hình thật; vẽ mới con nào còn mượn hình |

### 5.5 Ba bạn đồng hành

| Hiện tại | Tên mới | Vai | Thiết kế 1 dòng |
|---|---|---|---|
| Cu Tèo (thợ săn, cung và thương) | **Jory** | Thợ săn | Cậu bé tóc vàng rơm, mũ nỉ có lông chim, áo xanh rêu, cung ngắn |
| Cái Bống (thầy thuốc) | **Liesel** | Thầy thuốc thảo dược | Cô bé tết hai bím, khăn trùm đầu trắng, giỏ mây đựng lá thuốc |
| Cu Lì (đô vật) | **Big Otto** | Con trai thợ xay bột, đô vật | Cậu bé to con, áo dính bột mì, tay áo xắn, má đỏ |

### 5.6 Người làng (7 người hiện có + bé Sen)

Làng mới tên **Hollin**. Đình làng đổi thành **Nhà Kể Chuyện (the Storyhouse)**, nơi đặt Sách Lớn trên giá đá. Cây đa đổi thành **cây sồi già ở quảng trường**.

| Hiện tại (việc) | Tên mới | Việc giữ nguyên | Thiết kế 1 dòng |
|---|---|---|---|
| Chú Lái Đò (vào ải) | **Hob the Ferryman** | Vào ải, bản đồ | Râu xám, mũ len, áo khoác vải dầu, sào dài |
| Bé Sen (con gái chú lái đò) | **Lettie** | Ngồi ở bến, chương 4 bị bắt | Bé tóc đỏ, váy xanh, ôm con búp bê vải |
| Ông Thợ Rèn (lò rèn, Luyện) | **Master Dorran** | Lò rèn | To béo, râu quai nón, tạp dề da cháy sém |
| Bà Hàng Xén (vũ khí) | **Granny Marrow** | Bán vũ khí | Bà cụ lưng còng, khăn len, xe đẩy chất đồ lỉnh kỉnh |
| Cô Thợ May (mũ áo) | **Odile the Seamstress** | Trang phục | Cô gái cao, kéo to đeo bên hông, cuộn vải trên vai |
| Cụ Đồ (kỹ năng) | **Master Quill** | Dạy chiêu | Ông thầy dạy chữ, kính tròn, bút lông ngỗng cài tai |
| Ông Từ (chỉ số, sổ yêu quái, thành tựu) | **Old Ambrose, Keeper of the Storybook** | Giữ Sách Lớn. Sổ yêu quái thành **"các trang quái vật đã ghi"** | Ông già áo choàng nâu, đeo kính lúp, tay luôn cầm cây đèn dầu |
| Anh Mõ (cài đặt, việc ngày) | **Crier Tom** | Cài đặt, việc ngày | Chàng trai mũ ba góc, cầm cuộn giấy thông báo và **lá cờ nhỏ** (không cầm chuông, không cầm mõ) |

**Lưu ý:** người rao tin ở châu Âu ngày xưa thường cầm chuông, nên **cố ý không vẽ chuông** cho Crier Tom. Thay vào đó cầm cuộn giấy và cờ nhỏ.

---

## 6. Hình ảnh

### 6.1 Bảng hạng mục

Hiện có 718 tấm trong `game/art/custom`: giao diện 398, hiệu ứng 216, quái và trùm khoảng 68, vật phẩm 14, nhân vật chính và trang phục 11, người làng 8, ba bạn 3. Thêm 2 tranh màn đầu và 7 tranh truyện.

| Hạng mục | Giữ / sửa nhẹ / vẽ mới | Lý do | Ưu tiên | Số ảnh (ước) |
|---|---|---|---|---|
| **Nhân vật chính Rowan** | **Sửa**: đầu và mũ trùm 8 hướng, đổi màu thân | Động tác 8 hướng là phần đắt nhất, giữ lại | 1 | 8 đầu + 4 tấm thân đổi màu |
| Trang phục (3 bộ vùng + ninja) | Sửa nhẹ: đổi tên, đổi màu, ghép đầu mới | Thợ Săn Rừng, Chiến Binh Biển, Hiệp Sĩ Lâu Đài vốn đã hợp châu Âu | 3 | 3 |
| **Người làng và ba bạn** | **Vẽ mới** | Nón lá, áo bà ba, khăn mỏ quạ lộ Việt Nam | 1 | 12 (8 + 3 + bé Lettie đã tính trong 8) |
| **Làng Hollin** (`gd-lang-*`, nền làng) | **Vẽ mới** | Nhà tranh, đình, cây đa, đò, nón | 1 | khoảng 24 |
| **Họa tiết trống đồng** (`gd-trong-dong`, `gd-phuc-lanh-trong`, `gd-huy-khung-dong`, `gd-danh-hieu-dong`, `gd-o-diem-trong`, `hu-song-dong`…) | **Vẽ mới** thành họa tiết sách: góc sách bọc đồng, khung trang giấy, dấu mực | Trống đồng là biểu tượng Việt Nam | 1 | khoảng 8 |
| **Màn đầu và logo** | **Vẽ mới** | Mái đình và cây đa | 1 | 1 logo + 2 tranh |
| **Lindworm** 3 pha | **Vẽ mới** | Đang mượn hình rồng có cánh | 1 | 3 |
| Vulpina (Hồ Tinh) 3 pha | Sửa vừa | Chín đuôi và mặt nạ là châu Á | 2 | 4 |
| Sư Tử Than (Hổ Lửa) | Sửa nhẹ | Hổ thành sư tử | 2 | 2 |
| Grimbark, Inkmaw, các trùm nhỏ còn lại | Giữ | Đã trung tính | — | 0 |
| Chiêu "Bùa bay" của Mộc Tinh | Sửa | Bùa giấy chữ Hán thành lá gai | 2 | khoảng 4 hiệu ứng |
| Quái rừng, quái biển (20 con) | Giữ | Thú chung | — | 0 |
| Quái lâu đài | Sửa nhẹ 2 con | Đèn lồng giấy, mèo hai đuôi | 3 | 2 |
| Quái sông | Vẽ mới khoảng 6 con | Ma da, các hình mượn | 2 | 6 |
| Nền lâu đài | Sửa nhẹ | Cột đỏ và thảm đỏ thành đá xám, cờ vải | 2 | khoảng 10 |
| Nền sông | Sửa nhẹ | Hàng rào và cầu tre thành cọc gỗ, cầu ván | 2 | khoảng 10 |
| Nền rừng, nền biển | Giữ | Đã trung tính | — | 0 |
| Khung, nút, thanh máu (`gd-khung`, `gd-nut`, `gd-the`, `gd-o`) | Sửa nhẹ: tô lại màu bằng công cụ | Bỏ ruy băng đỏ đậm | 2 | khoảng 70 (tự động) |
| Huy hiệu thành tựu, biểu tượng, vật phẩm | Giữ | Trung tính | — | 0 |
| Hiệu ứng (216) | Giữ | Trung tính | — | 0 |
| **Thẻ Truyện** (mới, thay đổi lối chơi số 2) | Vẽ mới | Khung trang giấy + biểu tượng nhỏ | 2 | 1 khung + khoảng 30 biểu tượng 16×16 |
| Tranh truyện mở đầu và kết chương | Vẽ mới | Đang kể trống đồng, cây đa | 2 | 7 |

**Tổng:**
- Vẽ mới hoặc sửa tay: khoảng **135–155 tấm** (trong đó khoảng 30 là biểu tượng thẻ rất nhỏ).
- Tô lại màu bằng công cụ: khoảng **70 tấm**.
- Giữ nguyên: khoảng **70% số tấm**.
- Tính theo công vẽ (tấm to như làng, trùm, tranh nặng hơn tấm nhỏ): khoảng **30% công vẽ phải làm lại**.

Bản cũ ước hướng C chỉ giữ được 65%. Con số ở đây cao hơn vì đã tính kỹ: nhân vật chính **không vẽ lại toàn bộ**, chỉ đổi đầu, và trùm cây, trùm mực giữ được nguyên.

**Thứ tự nên làm:** logo và màn đầu, đầu Rowan, làng và người làng, họa tiết sách, Lindworm, rồi Vulpina và nền lâu đài, nền sông.

### 6.2 Bảng màu

Giữ nguyên màu hệ và màu bậc đang có trong mã (bảng ở mục 4.5 bản cũ). Đổi các màu sau:

| Nhóm | Mã màu |
|---|---|
| Nền chung, "giấy và mực" | mực #1E1A24 · #2E2938 · #4D4558 · #7E7488 · giấy cũ #D9C9A3 · giấy sáng #F2E6C9 |
| Rowan | viền #1B1A2B · áo #3E6FA8 · mũ trùm #E0A23A · viền mũ #A86A22 · da thuộc #7A4A2C · da #F4C9A0 · tóc #5A3426 |
| Rừng Gai | #1E2E22 #34503A #5E7D45 #A3B55E #D9C77A · quả gai #8E3B4A |
| Hang Chìm | #12283A #1E4C63 #3C8496 #93D3CF #E4F2EC |
| Lâu đài Than Hồng | đá #2A1D22 #4B3A3A #6E5A52 #9C8270 · cờ vải #7A3F32 · ánh lửa #E8B070 |
| Đầm Sương | #1B2A26 #33524A #5A8378 #8E7FA8 #E9C978 |
| Làng Hollin | mái ngói đỏ nâu #8A4A3A · tường trát #E3D3B0 · khung gỗ #5A3A28 · cỏ #5C8A44 #8DB45A |
| Giao diện | nền #22202E #2E2B3E · viền đồng #C8A15A · giấy hộp thoại #EBDDBF · chữ mực #2A2230 · chữ sáng #F2DDA0 · nút chính #D2693A · nguy hiểm #E04646 · đồng ý #5FBF77 |

Hộp thoại và Thẻ Truyện dùng **nền giấy sáng, chữ mực tối**. Các thanh máu, nút trong trận vẫn **nền tối**, để không lấn hiệu ứng.

### 6.3 Phông chữ Latin

- **Chữ thường:** giữ **Be Vietnam Pro**. Đủ dấu tiếng Việt và các thứ tiếng La-tinh.
- **Logo và tiêu đề chương ("Chapter I: Thornwood"):** **Jacquard 12** (Google Fonts, giấy phép tự do OFL). Đây là chữ kiểu sách cổ châu Âu vẽ bằng điểm ảnh, rất hợp hướng C. **Chỉ dùng cho tiêu đề tiếng Anh**, vì phông này có thể thiếu dấu tiếng Việt. Bản tiếng Việt dùng Be Vietnam Pro Bold cho tiêu đề. Phải thử trước khi dùng.
- **Số sát thương, nhãn nút:** **Pixelify Sans** (Google Fonts, OFL).
- **Số rất nhỏ:** **Silkscreen** (Google Fonts) hoặc **m5x7** (miễn phí).
- Logo SPIRITBLADE vẫn **vẽ tay bằng điểm ảnh**, lấy Jacquard 12 làm mẫu nét.

### 6.4 Sáu câu lệnh gen ảnh mẫu

Gen xong vẫn phải giảm về đúng số màu và cỡ theo chuẩn ở mục 4.5 bản cũ.

1. **Nhân vật chính:**
   `Crisp pixel art sprite, 48x48, top-down 3/4 view, 12-year-old blacksmith apprentice "Rowan", short saffron hooded capelet, blue tunic, brown leather apron, satchel with a paper page sticking out, short sword, idle facing down-right, 1px dark outline, 20 colors max, solid magenta #FF00FF background, no blur, no text.`
2. **Một con quái (Bog Nixie):**
   `Crisp pixel art enemy sprite, 40x40, top-down 3/4 view, "Bog Nixie": small marsh water spirit with long dripping weed hair, pale green skin, glowing yellow eyes, webbed hands, murky teal palette with one warm accent, 1px dark outline, 16 colors max, solid magenta #FF00FF background, no blur, no text.`
3. **Một con trùm (Lindworm, pha 1):**
   `Crisp pixel art boss sprite, 160x120, top-down 3/4 view, "Lindworm": huge wingless river serpent with two short clawed front legs, moss-green mud scales, black ink-stained jaws and claws, torn paper pages stuck along its back, amber eyes, clear silhouette, 24 colors max, 1px dark outline, solid magenta #FF00FF background, no blur, no text.`
4. **Làng:**
   `Crisp pixel art top-down village scene, 480x270, cozy fairy-tale European village by a river, half-timbered cottages with red-brown tile roofs, stone forge with chimney, small storyhouse with a big book on a stone lectern, old oak in the square, wooden ferry dock, no people, soft warm light, no blur, no text.`
5. **Khung HUD:**
   `Crisp pixel art mobile game UI kit, landscape, health bar frame, mana bar frame, square weapon slot, dark ink-purple panels (#2E2B3E) with thin brass borders (#C8A15A), brass book-corner caps on corners, one parchment card frame, 9-slice friendly, separated elements, solid magenta #FF00FF background, no blur, no text, no numbers.`
6. **Màn đầu và logo:**
   `Crisp pixel art title screen, 480x270, a giant open storybook with torn-out pages flying into a dark sky over a river valley, three page glows in red, green and icy blue, a small hooded child with a sword on a hill, leave the top third empty for a logo, no blur, no text.`
   Logo làm riêng: `Crisp pixel art game logo, word shape only as blank blackletter-style letter blocks, brass and parchment colors, solid magenta #FF00FF background, no blur.` Chữ SPIRITBLADE thì **vẽ tay**, không để máy gen chữ.

---

## 7. Lối chơi

Ba thay đổi lớn của bản cũ (mục 2.4) **giữ nguyên lý do và cỡ việc**. Hướng C chỉ đổi phần "lớp áo" (hình, tên, cảnh). Bảng dưới ghi rõ cái nào làm đổi cảm giác chơi.

| # | Thay đổi | Điều chỉnh theo hướng C | Đổi cảm giác chơi? |
|---|---|---|---|
| 1 | **Ải 1-1 cho thấy ngay "vũ khí lớn lên" và "trùm học lại"** | Thay chậu than bằng **một trang sách bay trong gió**. Rowan chém trúng trang, mực đỏ thấm vào kiếm, kiếm đổi màu thành Kiếm Lửa (hình thái "Kindled" tạm tới hết ải). Trùm nhỏ Toadstool King **"đọc"** đòn của bạn: mực đỏ loang khắp thân nó, hiện biểu tượng ngọn lửa to, và nó kháng Lửa. Ở góc phòng có cây phi tiêu Băng để đổi. Về làng, Luyện cấp 3 mới chốt hệ vĩnh viễn, như bản cũ | **Có.** Chủ game phải duyệt |
| 2 | **Chọn 1 trong 3 thẻ sau mỗi phòng đánh** | Gọi là **Thẻ Truyện (Tale Cards)**, vẽ như một trang sách nhỏ có tranh minh hoạ. Mỗi thẻ có một tên kiểu truyện ("The Fox's Trick: né để lại bóng giả", "The Frost Queen's Kiss: đòn thứ ba đóng băng"). Vẫn 30 thẻ, 4 nhóm: hệ, phản ứng, né, vũ khí. Thẻ chỉ có hiệu lực trong lượt chơi đó. Tên thẻ đặt theo truyện tự nghĩ ra, không dùng nhân vật có thật của truyện nào | **Có, nhiều nhất.** Chủ game phải duyệt |
| 3 | **Gọn lại: mang 2 vũ khí, ẩn Ép đồ, một số Power, thanh 5 nút ở làng** | Thanh 5 nút giữ: **Play · Upgrade · Heroes · Quests · Shop**. Ở hướng C, nút Quests mở **Sách Lớn**: việc ngày, thành tựu và trang quái vật nằm chung trong cuốn sách, lật trang mà xem | Chỉ phần **mang 2 vũ khí** là đổi cảm giác. Phần còn lại không |

**Thêm một điểm nhỏ (không đổi cảm giác chơi):** khi vũ khí lên Thức tỉnh, chiếu một cảnh 2 giây: Sách Lớn mở ra một trang trắng và tên vũ khí tự viết lên đó ("Emberfang, Bane of Grimbark"). Tên tự đặt đã có trong thiết kế; chỉ thêm cảnh và một trang "Sách của tôi" để xem lại. Cỡ việc nhỏ, khoảng nửa phiên.

**Lưu ý về tên phản ứng:** "Blast" và "Shatter" của bản cũ giữ nguyên, hợp cả hướng C.

---

## 8. Bảng đối chiếu Việt ↔ Anh (thay bảng 5.2 bản cũ)

| # | Tiếng Việt hiện tại | Tiếng Anh (hướng C) | Tiếng Việt mới (nếu đổi) |
|---|---|---|---|
| 1 | Linh Khí (tên game) | Spiritblade: The Torn Storybook | Linh Khí: Cuốn Sách Bị Xé |
| 2 | Trống đồng | the Great Storybook | Sách Lớn |
| 3 | Mảnh trống | Torn Page | Trang sách |
| 4 | Mảnh mặt trời | the Cover | Trang Bìa |
| 5 | Vùng | Chapter | Chương |
| 6 | Cu Tí / Zed | Rowan | Rowan |
| 7 | Cu Tèo / Cái Bống / Cu Lì | Jory / Liesel / Big Otto | giữ tên Anh |
| 8 | Bé Sen | Lettie | Lettie |
| 9 | Chú Lái Đò | Hob the Ferryman | Bác Lái Đò Hob |
| 10 | Ông Thợ Rèn | Master Dorran | Bác Thợ Rèn Dorran |
| 11 | Bà Hàng Xén | Granny Marrow | Bà Marrow |
| 12 | Cô Thợ May | Odile the Seamstress | Cô Thợ May Odile |
| 13 | Cụ Đồ | Master Quill | Thầy Quill |
| 14 | Ông Từ | Old Ambrose | Ông Giữ Sách Ambrose |
| 15 | Anh Mõ | Crier Tom | Anh Rao Tin Tom |
| 16 | Làng / đình / cây đa | Hollin / the Storyhouse / the Old Oak | Làng Hollin / Nhà Kể Chuyện / Cây Sồi Già |
| 17 | Rừng già | Thornwood | Rừng Gai |
| 18 | Hang biển | Drowned Grotto | Hang Chìm |
| 19 | Lâu đài cổ | Emberhold | Lâu đài Than Hồng |
| 20 | Sông sâu | Mirefen | Đầm Sương |
| 21 | Mộc Tinh | Grimbark, the Briar King | Lão Cây Gai |
| 22 | Ngư Tinh | Sir Inkmaw, the Kraken Knight | Hiệp Sĩ Mực |
| 23 | Hồ Tinh | Vulpina, the Fox Witch | Phù Thuỷ Cáo |
| 24 | Thuồng Luồng | Lindworm, the River Serpent | Rắn Sông Lindworm |
| 25 | Hắc Long | the Inkwyrm | Rồng Mực |
| 26 | Nấm Chúa / Cua Đá / Hổ Lửa / Cá Trê | Toadstool King / Crystal Crab / Cinder Lion / Old Mudwhisker | Vua Nấm / Cua Pha Lê / Sư Tử Than / Lão Cá Trê |
| 27 | Yêu tinh, yêu quái | Tale-beast (quái thường: monster) | Quái trong truyện |
| 28 | Linh khí (vũ khí có hồn) | Spiritblade | Linh khí |
| 29 | Linh khí (tiền) | Ink | Mực |
| 30 | Lửa / Độc / Băng | Fire / Poison / Frost | giữ |
| 31 | Nổ khói / Sốc nhiệt | Blast / Shatter | Nổ / Vỡ băng |
| 32 | Trắng / Mầm / Thành hình / Thức tỉnh / Viên mãn | Raw / Kindled / Forged / Awakened / Ascended | giữ |
| 33 | Luyện / Tinh luyện | Temper / Refine | giữ |
| 34 | Ép đồ | (ẩn) Reforge | (ẩn) |
| 35 | Bậc màu (Trắng … Rực lửa) | Common / Uncommon / Rare / Epic / Legendary / Mythic / Primal | giữ |
| 36 | Kiếm / Thương / Búa / Phi tiêu | Sword / Spear / Hammer / Star Darts | giữ |
| 37 | Trảm Nguyệt / Phi Thương / Địa Chấn / Mưa Phi Tiêu | Moon Slash / Skyspear / Quake / Star Rain | giữ |
| 38 | Chưởng | Spirit Burst | giữ |
| 39 | Phúc lành (chọn trong ải) | Tale Card | Thẻ Truyện |
| 40 | Suối hồi | Wishing Spring | Suối Ước |
| 41 | Nguyên liệu rèn / nguyên liệu vùng / mảnh trùm | Ore / Relics / Boss Shard | giữ |
| 42 | Sổ yêu quái | Bestiary Pages | Trang Quái Vật |
| 43 | Thành tựu / Việc hôm nay / Bảng vàng | Achievements / Daily Tasks / Leaderboard | giữ |
| 44 | Trang phục Ninja Bóng Đêm / Thợ Săn Rừng / Chiến Binh Biển / Hiệp Sĩ Lâu Đài | Shadow Garb / Huntsman / Tidewarden / Castle Knight | giữ tên Anh |
| 45 | Vào ải / Bản đồ / Độ khó 2 | Play / Map / Veteran | giữ |
| 46 | Ải Rèn / Ải Vàng | Forge Trial / Gold Trial | giữ |

**Vì sao đổi tiền "Linh khí" thành "Ink" (Mực):** bản cũ đề xuất "Essence". Ở hướng C, mực là thứ Lindworm uống và thứ làm vũ khí lớn lên, nên gọi tiền là Mực thì cả truyện lẫn hệ thống nói cùng một chữ. Nếu chủ game thấy "Mực" nghe lạ trong tiếng Việt thì giữ "Linh khí" cho bản tiếng Việt.

---

## 9. Lộ trình 3 giai đoạn

Mỗi giai đoạn xong đều đưa lên web được. Các phiên song song **không sửa chung một tệp**.

### Giai đoạn 1: "Đổi áo bằng chữ" (khoảng 3–4 phiên, rủi ro thấp)

| Phiên | Làm gì | Tệp chạm tới | Cỡ việc |
|---|---|---|---|
| Phiên chữ | Đổi toàn bộ tên theo bảng mục 8; viết lại lời truyện mở đầu, 4 chương, câu trùm, câu người làng theo mục 4; gộp lại từ điển | `truyen.js`, `ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/*`, chữ trong `data.js`, `village_scene.js`, `monster_art.js` (chỉ chữ) | 2 phiên |
| Phiên hình | Logo SPIRITBLADE mới + phụ đề đặt lên tranh màn đầu cũ; tô lại màu áo nhân vật chính bằng công cụ (chưa đổi đầu) | `art/bia`, `art/custom/zed-*`, công cụ tô màu | 1 phiên |
| Phiên mã | Tự nhận ngôn ngữ máy, thêm `?lang=`; ẩn Ép đồ và Lực chiến; màn đầu chỉ còn Tap to Play | `ngon_ngu.js`, `ep_do.js`, `luc_chien.js`, `main.js` | 1 phiên |

### Giai đoạn 2: "Lời hứa 5 phút và bộ mặt cổ tích" (khoảng 7–9 phiên)

| Phiên | Làm gì | Cỡ việc |
|---|---|---|
| Phiên vẽ làng | Làng Hollin (khoảng 24 tấm), 8 người làng, 3 bạn | 2–3 phiên |
| Phiên vẽ Rowan và giao diện | Đầu và mũ trùm 8 hướng qua `dung-zed-game.py`; họa tiết sách thay trống đồng (khoảng 8 tấm); tô lại màu khoảng 70 tấm khung | 2 phiên |
| Phiên mã ải 1-1 | Thay đổi số 1: trang sách bay, kiếm đổi hệ, trùm nhỏ "đọc" đòn | 1–2 phiên |
| Phiên mã làng | Thay đổi số 3: mang 2 vũ khí, thanh 5 nút, Sách Lớn gom việc ngày và thành tựu | 2 phiên |

Phiên vẽ và phiên mã không đụng nhau: phiên vẽ chỉ thả ảnh vào `art/custom` với **tên tệp cũ** (game tự dùng), phiên mã không sửa ảnh.

### Giai đoạn 3: "Mỗi lượt một khác" (khoảng 7–9 phiên)

| Phiên | Làm gì | Cỡ việc |
|---|---|---|
| Phiên thẻ | Logic Thẻ Truyện sau mỗi phòng | 1 phiên |
| Phiên cân bằng | 30 thẻ và cân bằng; **chỉ chạy sau khi phiên thẻ xong** | 2 phiên |
| Phiên vẽ trùm | Lindworm 3 pha, Vulpina, Sư Tử Than, 6 quái sông, 2 quái lâu đài | 2 phiên |
| Phiên vẽ nền và tranh | Sửa nền lâu đài và nền sông; 7 tranh truyện; khung và 30 biểu tượng thẻ | 2 phiên |
| Phiên dịch | Tây Ban Nha, Bồ Đào Nha (Brazil), Indonesia | 1–2 phiên |
| (Tuỳ chọn) | Cảnh "tên vũ khí viết vào Sách Lớn" khi Thức tỉnh | nửa phiên |

**Chủ game cần chốt trước:** trước giai đoạn 1, chốt câu 1–3 ở mục 10 (đổi tên sau khi đã dịch sẽ phải làm lại). Trước giai đoạn 2 và 3, chốt câu 4.

---

## 10. Câu hỏi chốt cho chủ game

1. **Ý tưởng trung tâm (thay trống đồng):**
   - A. Sách Lớn bị xé trang (**khuyên dùng**)
   - B. Vương miện đá vỡ thành ngọc
   - C. Lò rèn cổ tắt lửa, ba ngọn lửa tách thành đốm than

2. **Tên game:**
   - A. Spiritblade: The Torn Storybook, giữ tên miền hiện có (**khuyên dùng**)
   - B. Talesworn, tên mới hẳn, phải mua tên miền mới
   - C. Tên khác chủ game tự đặt

3. **Nhân vật chính:**
   - A. Rowan: mũ trùm nghệ, áo lam, chỉ vẽ lại đầu, giữ động tác 8 hướng (**khuyên dùng**)
   - B. Tamsin: bé gái, cùng cách làm (vẽ lại đầu, giữ động tác)
   - C. Giữ người ninja đen hiện tại, chỉ đổi tên

4. **Ba thay đổi lối chơi được duyệt tới đâu:**
   - A. Duyệt cả ba: ải 1-1 mới, Thẻ Truyện sau mỗi phòng, mang 2 vũ khí (**khuyên dùng**)
   - B. Duyệt số 1 và số 3; Thẻ Truyện làm nhẹ, chỉ 2 lần mỗi ải
   - C. Chỉ duyệt số 1 (ải 1-1 mới); giữ xoay vòng 4 vũ khí và Phúc lành như cũ

---

*Nguồn kiểm nhanh tên game (tìm web ngày 02/11/2026):*
- [Torn Tales (MobyGames)](https://www.mobygames.com/game/93240/torn-tales/) và [Torn Tales: Rebound Edition (Nintendo Life)](https://www.nintendolife.com/games/switch-eshop/torn_tales_rebound_edition): tên đã có, loại
- [Torn Pages (itch.io)](https://whatahooda.itch.io/torn-pages): game nhỏ, chỉ gần chữ "Torn"
- [The Book of Unwritten Tales (Nuuvem)](https://www.nuuvem.com/ca-en/item/the-book-of-unwritten-tales): loạt game cổ tích, tránh chữ "Unwritten"
- [Relic: Taleblade (Kobold Press)](https://koboldpress.com/relic-taleblade/): món đồ trong sách nhập vai giấy
- [SWORN (Team17)](https://www.team17.com/games/sworn/) và [Ironsworn](https://www.ironswornrpg.com/products-ironsworn): gần với "Fablesworn"
- [Spirit Blade II (itch.io)](https://hounddoge.itch.io/spirit-blade-ii-the-dichotomy-of-eternal-victory): game nhỏ trùng "Spirit Blade", lý do nên có phụ đề
- Tìm "Talesworn", "Fablesworn", "Torn Storybook", "Once Upon a Blade": không thấy game nào trùng
