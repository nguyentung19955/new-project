# Đưa Linh Khí ra thế giới: lối chơi, bối cảnh, hình ảnh (tư vấn 02/11/2026)

Người viết đóng vai chuyên gia thiết kế game di động indie và trưởng nhóm mỹ thuật pixel. Tài liệu này trả lời câu hỏi của chủ game:
"nếu đưa game ra thế giới thì nên sửa lối chơi thế nào, tôi không muốn bám vào câu chuyện Việt Nam nữa, hình ảnh cần thay đổi ra sao".

**Đã đọc trước khi viết:** bản thiết kế (`docs/thiet-ke-game.md`, bản 4), khung cốt truyện (`docs/cot-truyen/CHUNG.md`), mã game (`game/js`: dữ liệu vùng/quái/trùm, combo, Luyện, hình thái, ép đồ, làng, nhiệm vụ, lưu mây, bộ dịch tiếng Anh), hai bản nhận xét của ChatGPT ngày 16/10 và 17/10, cùng các báo cáo gần đây trong `docs/review/ke-hoach-cai-thien/`.
Những điều hai bản nhận xét kia đã nói thì ở đây không nhắc lại: hướng dẫn 10 phút đầu, gộp tiền tệ, cỡ nút, cảm giác chém nặng, sàn rừng rối, hai dải đen hai bên màn.
Tài liệu này chỉ bàn chuyện **đưa game ra thế giới**.

**Ảnh hiện trạng** chụp tự động bằng trình duyệt không màn hình, khổ 844×390 (iPhone xoay ngang), từ bản `dist/linh-khi.html?cloud=0`. Không ai chơi tay để chụp. Các ảnh nằm cùng thư mục:

| Ảnh | Nội dung |
|---|---|
| `hien-trang-01-man-dau.png` | Màn đầu |
| `hien-trang-02-lang.png` | Làng |
| `hien-trang-03-rung.png` … `06-song.png` | Một phòng đánh ở mỗi vùng: Rừng, Biển, Lâu đài, Sông |
| `hien-trang-07-trum-moc-tinh.png`, `08-trum-thuong-luong.png` | Hai trận trùm |
| `hien-trang-09-bang-luyen.png` | Bảng Luyện |
| `hien-trang-10-lang-tieng-anh.png`, `11-luyen-tieng-anh.png` | Làng và bảng Luyện khi bật tiếng Anh |
| `bang-mau-de-xuat.png` | Bảng màu đề xuất cho hướng khuyên dùng |

---

## 1. Tóm tắt 10 dòng

1. **Chủ đề:** chọn hướng A, **"Spirit Wilds"**. Đây là một thế giới thần thoại tự nghĩ ra, xoay quanh các linh thần thiên nhiên, giống tinh thần của Ghibli hay Spiritfarer. Không gắn với nước nào.
2. **Tên game:** giữ **Spiritblade**, vì đã có sẵn tên miền `spiritblade.web.app` và chữ "SPIRITBLADE" trên màn đầu. Thêm phụ đề **"The Hollow Bell"** để dễ tìm và tránh trùng vài game nhỏ cùng tên trên itch.io.
3. **Vì sao hợp:** bốn trùm hiện có (cây, cá, cáo, rắn sông) là những linh vật mà nơi nào trên thế giới cũng hiểu. Chỉ cần đổi tên và cốt truyện, phần hình gần như giữ nguyên.
4. **Trống đồng** đổi thành **Chuông Tim (Heartbell)**. Cái chuông vỡ, các mảnh văng khắp nơi, nên mạch "mỗi vùng lấy về một mảnh" của truyện cũ vẫn dùng được nguyên.
5. **Thay đổi lối chơi số 1:** người chơi phải thấy ngay điều làm game khác biệt trong **5 phút đầu**. Ở ngay ải 1-1, vũ khí đổi hệ, rồi trùm nhỏ cho thấy rõ "nó đã học chiêu của bạn".
6. **Thay đổi lối chơi số 2:** sau mỗi phòng đánh, người chơi được **chọn 1 trong 3 thẻ sức mạnh** cho lượt chơi đó. Đây là mở rộng của "Phúc lành" đang có. Người chơi loại game này trên toàn cầu (Archero, Soul Knight) coi đây là điều mặc định.
7. **Thay đổi lối chơi số 3:** gọn lại cho người chơi bình thường. Chỉ **mang 2 vũ khí** chọn trước khi vào ải, thay cho việc xoay vòng cả 4. Ẩn bảng "Ép đồ" vì Luyện đã thay nó. Chỉ giữ **một con số sức mạnh**.
8. **Lượng hình phải vẽ lại:** khoảng **20% công vẽ**, tức chừng **95–115 tấm trên 718 tấm** hiện có, cộng thêm màn đầu và 7 tranh truyện. Các phần cần vẽ lại:
   - Làng
   - Dân làng
   - Đầu và màu áo của nhân vật chính
   - Thuồng Luồng (cần vẽ thật dù có đổi chủ đề hay không)
   - Các họa tiết trống đồng
9. **Nhân vật chính:** **không vẽ lại toàn bộ.** Giữ khung xương và các động tác 8 hướng, chỉ vẽ lại đầu và đổi màu áo. Cu Tí trở thành **Tiko**, cậu học việc lò rèn, áo xanh lam, khăn quàng màu hổ phách. Như vậy nhân vật nổi hẳn trên nền tối, khác với bộ đồ ninja đen đang bị chìm.
10. **Ngôn ngữ:** mặc định tiếng Anh, giữ tiếng Việt. Đợt sau thêm ba thứ tiếng dùng chữ La-tinh là Tây Ban Nha, Bồ Đào Nha (Brazil) và Indonesia, vì không phải đổi phông chữ. Bộ dịch đã chạy khoảng 80%, việc chính là **đổi tên riêng** và **đồng bộ lại từ điển**.

---

## 2. Lối chơi cho người chơi toàn cầu (từ chơi thoáng đến chơi khá nghiêm túc, trên điện thoại)

### 2.1 Chuẩn để so sánh

| Game | Học được gì cho Linh Khí |
|---|---|
| **Archero** (Habby) | Chọn 1 trong 3 kỹ năng sau mỗi lần lên cấp trong ải, nên mỗi lượt chơi một khác. Một trận ngắn khoảng 3–6 phút. Nút bấm rất ít. |
| **Soul Knight** và **Otherworld Legends** (ChillyRoom) | Cùng thể loại pixel nhìn từ trên xuống, màn ngang, điện thoại. Chuỗi phòng nhỏ, có trùm, chọn bùa trong lượt chơi. Mỗi nhân vật có một chiêu riêng thật rõ. |
| **Hades** (bản Switch và PC) | Trùm có nhiều pha, mỗi lần thua vẫn mở thêm truyện. Phần thưởng chọn trước khi vào phòng. |
| **Vampire Survivors** | Màn hình đông vẫn đọc được: hình quái đơn giản, số và hiệu ứng có thứ tự rõ. Mất 5 giây đã hiểu cách chơi. |
| **Dead Cells** (bản điện thoại) | Bằng chứng rằng người chơi điện thoại chấp nhận game đánh khó, miễn là điều khiển nhạy và đòn trùm báo trước rõ. |

**Điểm mạnh riêng của Linh Khí** mà các game trên không có: **vũ khí lớn lên theo cách bạn chơi, còn yêu tinh học lại cách bạn chơi.** Câu này đã nằm trên màn đầu.
Muốn ra thế giới thì đây phải là thứ người chơi **cảm thấy được trong 5 phút**, chứ không phải đọc được.
Hiện giờ người chơi phải tới Luyện cấp 3 (cần vàng, về làng) mới chọn hệ cho vũ khí, và trùm thích nghi chỉ hiện bằng hai nhãn nhỏ "Kháng Độc / Yếu Lửa" (ảnh 08).

### 2.2 Giữ, bỏ, thêm gì cho từng hệ thống

| Hệ thống | Giữ | Bỏ hoặc ẩn | Thêm hoặc sửa |
|---|---|---|---|
| **Combo 4 vũ khí** (Kiếm, Thương, Búa, Phi tiêu) | Giữ cả 4 loại, mỗi loại có chiêu đặc biệt riêng. Đây là chiều sâu cho người chơi khá. | Bỏ nút đổi xoay vòng qua cả 4 trong trận. | Trước khi vào ải chọn 2 vũ khí. Trong trận chạm biểu tượng là đổi. Giữ kiểu ra đòn "nhấn liên tục" và "giữ để gồng" như cũ. |
| **Né** | Giữ cả cửa sổ bất tử lẫn nhát chém lướt sau khi né. | | Thêm thẻ sức mạnh ăn theo né (xem 2.4), để né thành một lối chơi. |
| **Hệ Lửa/Độc/Băng** và phản ứng | Giữ đủ 3 hệ và vòng khắc chế. Ba hệ là vừa sức người chơi bình thường. Trong mã hiện chỉ có 3 hệ, Sét mới là ý tưởng. | Đừng thêm hệ thứ 4 trước khi ra mắt. | Phải hiện **biểu tượng cùng với màu**, vì người mù màu không phân biệt được đỏ và xanh lá: Lửa là ngọn lửa, Độc là giọt nước, Băng là bông tuyết. Đổi tên phản ứng cho ngắn: Smoke Blast thành **Blast**, Thermal Shock thành **Shatter**. |
| **Luyện 15 cấp và hình thái** | Giữ. Luyện luôn thành công và không bao giờ tụt cấp, rất hợp người chơi toàn cầu. Hình thái Trắng, Mầm, Thành hình, Thức tỉnh là điểm nhấn nhìn thấy được. | | Bản đầu tiên của vũ khí đổi hệ diễn ra **ngay trong ải 1-1**, không đợi về làng (xem thay đổi số 1). |
| **Ép đồ và bậc màu** | Chỉ giữ 7 màu bậc để tô khung vũ khí. Đây là ngôn ngữ người chơi thế giới hiểu sẵn: Common, Rare, Epic… | **Ẩn bảng Ép đồ.** Hai đường nâng sức mạnh song song làm người chơi rối, và tỉ lệ thành công 30% gợi cảm giác "cờ bạc", dễ bị chấm điểm xấu ở nhiều nước. | Bậc màu đi thẳng theo cấp Luyện (mã đã làm thế khi bật Luyện). |
| **4 vùng × 5 ải** | Giữ. Có 20 ải, mỗi ải 8 phòng, ba kiểu sơ đồ A/B/C. | | Ải thường dài 4–6 phút là vừa với người chơi điện thoại. Nếu thử thấy dài, bớt số đợt quái trong mỗi phòng. |
| **Trùm 3 pha** | Giữ. Đây là chỗ game mạnh nhất. | | Khi trùm bắt đầu thích nghi, chiếu một cảnh ngắn 1 giây: trùm "nuốt" màu hệ của bạn, kèm biểu tượng to. Làm thay cho hai nhãn chữ. |
| **Làng nâng cấp** | Giữ làng làm sảnh đi lại được, có không khí. | Bớt việc phải đi tới từng người. Hiện có 7 người dân và 7 bảng. | Thêm một hàng 5 nút ở đáy màn: **Play · Upgrade · Heroes · Quests · Shop**. Người chơi toàn cầu quen bố cục này. Đi bộ tới gặp từng người vẫn có, nhưng không bắt buộc. |
| **Nhiệm vụ** (việc ngày, rương tuần, sổ yêu quái, thành tựu) | Giữ việc ngày và thành tựu. | Gộp rương tuần vào việc ngày. | Sổ yêu quái đổi tên thành **Bestiary** và để ở thẻ phụ. |
| **Lưu mây và bảng xếp hạng** | Giữ. Đăng nhập ẩn danh tự động là đúng. | | Nút "Đăng nhập Google" ở màn đầu dời vào Cài đặt. Màn đầu chỉ giữ một nút to **TAP TO PLAY**. Thêm bảng xếp hạng theo từng nước hoặc "bạn bè" sau, vì bảng toàn cầu hiếm khi có tên mình. |
| **Hai con số sức mạnh** | Giữ một số **Power**. | Ẩn "Lực chiến". | |

### 2.3 Vòng chơi 5 phút đầu và 30 phút đầu

**5 phút đầu.** Mục tiêu là người chơi thấy được lời hứa của game: vũ khí lớn lên, trùm học lại.

| Thời gian | Diễn biến | Người chơi cảm thấy |
|---|---|---|
| 0:00–0:15 | Màn đầu, bấm **Tap to Play**. Hai câu truyện chạy trên nền đang đánh nhau, không dừng lại để đọc. | Vào ngay, không phải đăng nhập |
| 0:15–1:15 | Phòng 1 và 2: đi, chém, né một đòn có báo trước | Điều khiển nhạy |
| 1:15–2:00 | Phòng 3 có chậu than. Đánh vỡ thì lửa bén vào kiếm, một tia sáng bay về kiếm, rồi **kiếm đổi màu thành Kiếm Lửa (Sprout)**. | "Vũ khí của mình vừa lớn lên!" |
| 2:00–2:20 | Chọn 1 trong 3 thẻ sức mạnh lần đầu | Lượt chơi này là của mình |
| 2:20–3:30 | Phòng 4: đánh bầy quái bằng lửa lan | Lửa mạnh thật |
| 3:30–4:45 | Trùm nhỏ Sporecap King **nuốt màu lửa, kháng Lửa**. Ở góc màn hiện cây cung Băng có sẵn để đổi. Đổi sang thì số sát thương to và màu xanh. | "Nó học mình, và mình bẻ lại được" |
| 4:45–5:00 | Thắng, nhận 1 sao, mở một nút **Upgrade** | Muốn chơi tiếp |

**30 phút đầu.**
- Chơi các ải 1-1 tới 1-4. Mỗi ải mở **một** thứ mới:
  - Ải 1-2: Luyện ở lò rèn.
  - Ải 1-3: thẻ hiếm.
  - Ải 1-4: thêm vũ khí thứ ba vào kho, nhưng vẫn chỉ mang 2.
- Khoảng phút 25–30 gặp trùm vùng Thornwarden (Mộc Tinh) với 3 pha. Thắng thì cứu người bạn đầu tiên (Bram) và **Chuông Tim sáng lại một mảnh**. Người chơi thấy làng đổi khác: thêm một ô cửa sổ sáng, thêm nhạc.
- Việc ngày và bảng xếp hạng chỉ mở **sau** trùm vùng đầu tiên.

### 2.4 Ba thay đổi lớn nhất, xếp theo thứ tự ưu tiên

**1. "Lời hứa trong 5 phút": vũ khí đổi hệ và trùm thích nghi ngay trong ải 1-1.** *(đổi cảm giác chơi, chủ game phải duyệt)*
- **Lý do:** người chơi toàn cầu bỏ game điện thoại rất nhanh nếu phút đầu chưa thấy gì lạ. Điểm khác biệt của Linh Khí hiện nằm sau một lần về làng và sau cấp Luyện 3.
- **Rủi ro:** lần đổi hệ trong ải 1-1 phải ăn khớp với Luyện (cấp 3 mới chọn hệ). Cách gỡ: ải 1-1 cho một hình thái "Sprout tạm" kéo dài hết ải; về làng thì Luyện cấp 3 chốt hệ vĩnh viễn, và người chơi được chọn lại.
- **Cỡ việc:** vừa, khoảng 1–2 phiên. Phần lớn là sắp lại kịch bản ải 1-1 (`stage.js`, mục TUT) và thêm cảnh trùm thích nghi. Không cần vẽ mới.

**2. Chọn thẻ sức mạnh sau mỗi phòng đánh.** *(đổi cảm giác chơi rất nhiều, chủ game phải duyệt)*
- Hiện tại "Phúc lành" chỉ cho chọn một lần sau phòng đánh thứ 2 hoặc 3. Đổi thành chọn sau mỗi phòng đánh.
- Bộ thẻ khoảng **30 thẻ** chia 4 nhóm: hệ (lửa lan rộng hơn…), phản ứng (Blast nổ to hơn…), né (né để lại vệt băng…) và vũ khí (nhát thứ 3 xuyên hàng…).
- Thẻ chỉ có hiệu lực trong lượt chơi đó. Luyện vẫn là sức mạnh lâu dài.
- **Lý do:** đây là thứ giữ chân người chơi ở Archero và Soul Knight. Mỗi lần chơi lại một ải đều khác nhau, nên 20 ải dùng được lâu hơn nhiều. Nó cũng giải đúng lời phê "dọn phòng, mở cửa" bị lặp mà bản nhận xét 17/10 đã nêu.
- **Rủi ro:** cân bằng khó hơn, vì thẻ cộng dồn có thể làm trùm quá dễ. Ngoài ra cần **30 biểu tượng thẻ**, nhưng dùng lại khung `gd-phuc-lanh-*` (14 tấm sẵn có) cộng biểu tượng hệ là đủ.
- **Cỡ việc:** lớn, khoảng 3–4 phiên:
  - Logic thẻ: 1 phiên.
  - 30 thẻ cùng cân bằng: 2 phiên.
  - Biểu tượng: 1 phiên vẽ, có thể chạy song song.

**3. Gọn lại cho người chơi bình thường: mang 2 vũ khí, ẩn Ép đồ, một con số Power, thanh 5 nút ở làng.** *(riêng phần mang 2 vũ khí là đổi cảm giác chơi, chủ game phải duyệt; các phần còn lại không đổi cảm giác)*
- **Lý do:**
  - Đổi xoay vòng qua 4 vũ khí khiến người chơi phải nhớ thứ tự giữa lúc đánh nhau.
  - Mang 2 thì quyết định nằm ở **trước** ải, và ăn khớp với trùm thích nghi: chọn 2 vũ khí khác hệ là "câu trả lời".
  - Bản thiết kế gốc (bản 4) cũng đã định mang 2.
- **Rủi ro:** người chơi đã quen 4 vũ khí sẽ thấy bị bớt. Cách gỡ: lần đầu gặp trùm vùng thì phòng Suối hồi cho đổi vũ khí, như bản thiết kế gốc.
- **Cỡ việc:** vừa, khoảng 2 phiên. Mã ở `combat.js` (đổi vũ khí) và `village.js` (thanh nút). Ẩn Ép đồ và Lực chiến chỉ là bật/tắt cờ có sẵn.

---

## 3. Chủ đề và cốt truyện: 3 hướng

Hệ thống sẵn có cần được giữ: "linh khí" (vũ khí có hồn), 3 hệ Lửa/Độc/Băng, 4 vùng (rừng, hang biển, lâu đài, sông), trùm cây/cá/cáo/rắn và làng thợ rèn.

### Hướng A: "Spirit Wilds", thế giới linh thần thiên nhiên tự nghĩ ra *(khuyên dùng)*

- **Tên game:**
  - **Spiritblade: The Hollow Bell** (khuyên dùng, đã có sẵn tên miền)
  - **Hollowbell**
  - **Bellbound**
- **Kiểm nhanh tên trùng** (tìm trên web ngày 02/11):
  - "Spirit Blade" chỉ có vài game nhỏ trên itch.io, không có game lớn nào. Nên đi kèm phụ đề.
  - "Hollowbell" và "Bellbound" không thấy game nào trùng.
- **Cốt truyện 3 câu:**
  - Ở thung lũng Emberdale, thợ rèn đúc nên những thanh "spiritblade", vũ khí có hồn lớn lên theo người cầm. Tiếng Chuông Tim trên tháp làng giữ cho các linh thần ngủ yên.
  - Con rắn sông Mirewyrm đập vỡ Chuông. Các mảnh văng khắp nơi, đánh thức những linh thần giữ rừng, hang biển và lâu đài, và chúng bắt đầu học cách chống lại con người.
  - Tiko, cậu học việc lò rèn, cầm một thanh kiếm mới đúc đi gom lại từng mảnh chuông và cứu các bạn bị bắt. Thanh kiếm sẽ trở thành thứ mà Tiko trở thành.
- **Nhân vật chính:** **Tiko**. Tên ngắn, dễ đọc ở mọi thứ tiếng, và vẫn còn vang chữ "Tí".
- **Đổi tên vùng, trùm và người:**

| Hiện tại | Đổi thành |
|---|---|
| Rừng già / Mộc Tinh / trùm nhỏ Nấm Chúa | **Elderwood** / **Thornwarden** / **Sporecap King** |
| Hang biển / Ngư Tinh / Cua Đá | **Tidecaves** / **Coralmaw** / **Crystal Crab** |
| Lâu đài cổ / Hồ Tinh / Hổ Lửa | **Ashen Keep** / **Vixara, the Ember Fox** / **Cinder Tiger** |
| Sông sâu / Thuồng Luồng / Cá Trê | **Mirewater** / **Mirewyrm** / **Mudwhisker** |
| Hắc Long (trận cuối) | **The Hollow Wyrm** (Mirewyrm hoá rồng, khoác các mảnh chuông) |
| Cu Tèo, Cái Bống, Cu Lì (ba bạn) | **Bram** (thợ săn), **Wren** (thầy thuốc), **Otto** (đô vật) |
| Chú Lái Đò và Bé Sen | **Hob the Ferryman** và con gái **Pip** |
| Ông Thợ Rèn / Bà Hàng Xén / Cô Thợ May | **Dorran** (Blacksmith) / **Mags** (Peddler) / **Ivy** (Tailor) |
| Cụ Đồ / Ông Từ / Anh Mõ | **Sage Orrin** (kỹ năng) / **Keeper Ilse** (Bestiary, thành tựu) / **Crier Tom** (việc ngày, cài đặt) |

- **Phần tài sản cũ giữ được:** khoảng **85% số tấm, tức 80% công vẽ.**
  - Trùm, quái, hiệu ứng và phần lớn giao diện giữ nguyên.
  - Phải làm lại: làng, dân làng, đầu nhân vật chính, các họa tiết trống đồng, màn đầu và tranh truyện.

### Hướng B: "Lantern Realms", phương Đông giả tưởng chung, không gắn nước nào

- **Tên game:**
  - **Spiritblade: Lantern Road**
  - **Ashen Lantern**
- **Kiểm nhanh tên trùng:** "Lanternbound" đã có trên itch.io nên loại. "Inkblade" thì quá gần game "Inkbound" trên Steam nên cũng loại. Hai tên trên không thấy trùng game lớn nào.
- **Cốt truyện 3 câu:** Đèn trời giữ ranh giới giữa người và yêu đã tắt. Yêu tinh tràn xuống bốn miền. Một cậu bé thợ rèn mang thanh kiếm biết thở đi thắp lại đèn.
- **Đổi tên:**
  - Nhân vật chính: **Kai**.
  - Trùm: Elder Treant, Coral Dragon-fish, Nine-tail Fox, River Serpent.
  - Làng giữ gần như nguyên kiểu nhà mái tranh và đèn lồng.
- **Phần giữ được:** khoảng **92%**, vì làng gần như giữ được hết.
- **Điểm yếu:** thị trường đã đầy loại "phương Đông chung chung" (hàng trăm game wuxia và ninja). Nó cũng **vẫn là châu Á**, trái với ý chủ game muốn rời bối cảnh cũ. Ngoài ra dễ bị người chơi Nhật, Trung, Hàn chê là pha trộn lung tung.

### Hướng C: "Storybook Kingdom", truyện cổ tích châu Âu

- **Tên game:**
  - **Emberkin**
  - **Wildforged**
- **Kiểm nhanh tên trùng:** có game "Ember" (2016) nhưng không có "Emberkin". "Wildforged" không thấy trùng game nào.
- **Cốt truyện 3 câu:** Vương miện đá của vương quốc vỡ, những sinh vật trong truyện cổ tích thức dậy. Một cô hoặc cậu học việc lò rèn mang thanh kiếm biết hát đi tìm các mảnh vương miện. Trận cuối đánh con rồng ngủ dưới hồ.
- **Đổi tên:**
  - Nhân vật chính: **Rowan**.
  - Trùm: Old Ent, Kraken Knight, Fox Witch, Lindworm.
- **Phần giữ được:** khoảng **65%.**
  - Làng, dân làng và nhân vật chính phải vẽ lại.
  - Sàn sông bằng tre và lâu đài cột đỏ phải sửa nhiều.
  - Trùm cây và trùm cá vẫn dùng được.
- **Điểm yếu:** tốn công vẽ nhất. Cũng là chủ đề phổ biến nhất ở phương Tây, nên khó nổi bật.

### Khuyến nghị

**Chọn hướng A.** Ba lý do:
1. Nó **giữ được nhiều tài sản nhất** trong khi đúng ý chủ game là rời bối cảnh Việt Nam. Trùm cây, cá, cáo, rắn đều là linh vật chung của loài người, không thuộc riêng nước nào.
2. Nó **có bản sắc riêng.** "Vũ khí có hồn" cộng "chuông vỡ" cộng "linh thần học lại bạn" ghép thành một thế giới tự nghĩ ra, nên không đụng hàng như phương Đông chung chung hay cổ tích châu Âu.
3. **Cốt truyện mở vẫn giữ được.** Chuông vỡ thành nhiều mảnh không rõ số lượng, mỗi vùng là một tập, rắn sông là kẻ cầm đầu hay bỏ trốn. Toàn bộ cấu trúc của `CHUNG.md` và `truyen.js` dùng lại, chỉ thay chữ.

**Hướng dự phòng: B.** Dùng hướng B nếu chủ game thấy làm lại làng quá tốn, hoặc muốn giữ không khí đèn lồng và mái tranh. Có thể chuyển dần từ B sang A sau, vì tên trùm của hai hướng gần nhau.

---

## 4. Hình ảnh theo hướng A

### 4.1 Nhìn ảnh hiện trạng

- **Chất lượng pixel đã ở mức tốt cho game indie:** sàn bốn vùng (ảnh 03–06), Mộc Tinh và lò rèn đều khá. Không cần làm lại toàn bộ phong cách.
- **Ba chỗ "lộ" bối cảnh Việt Nam:**
  - Làng: nón lá, nhà tranh, cây đa, đò (ảnh 02).
  - Màn đầu: mái đình, hai bên đỏ và xanh (ảnh 01).
  - Họa tiết trống đồng trên giao diện và trong phúc lành.
- **Hai chỗ yếu về hình, không liên quan chủ đề:**
  - Nhân vật chính mặc **đen** đứng trên nền tối, quá nhỏ so với trùm (ảnh 08).
  - Thuồng Luồng là **rồng tím có cánh** mượn hình khác, không ra rắn sông.
- **Giao diện:** khung gỗ, ruy băng đỏ đậm và nhiều chữ nhỏ trông khá nặng. Người chơi toàn cầu quen giao diện gọn, ít màu hơn.

### 4.2 Bảng hạng mục

Hiện có **718 tấm** hình trong `game/art/custom`:

| Nhóm | Số tấm | Ghi chú |
|---|---|---|
| Giao diện (`gd-*`) | 398 | Gồm 56 huy hiệu thành tựu, 53 nền và sàn, 26 cửa, 22 nút, 22 hình làng, 14 khung, 14 phúc lành |
| Hiệu ứng (`hu-*`) | 216 | |
| Quái, tinh anh, trùm | khoảng 68 | Có tính cả các bản cũ |
| Vật phẩm (`vp-*`) | 14 | |
| Nhân vật chính và trang phục (`zed-*`) | 11 | |
| Dân làng (`nl-*`) | 8 | |
| Hình ba bạn (`em-be-*`) | 3 | |

Ngoài ra có 2 tranh màn đầu (`art/bia`) và 7 tranh truyện (`art/truyen`).

| Hạng mục | Giữ / sửa nhẹ / vẽ mới | Lý do | Ưu tiên | Số tấm (ước) |
|---|---|---|---|---|
| **Nhân vật chính** | **Sửa:** vẽ lại đầu, tô lại màu áo. Giữ thân và động tác. | 8 hướng × nhiều động tác là phần đắt nhất, không nên bỏ. Đổi màu bằng công cụ tự động, rồi vẽ lại đầu theo 8 hướng. | 1 | 4 tấm thân đổi màu, cộng 8 hướng đầu mới |
| Trang phục (4 bộ) | Sửa nhẹ: đổi tên và màu | "Ninja Bóng Đêm" đổi thành **Shadow Garb** và để làm trang phục phụ. Ba bộ vùng giữ. | 3 | 3 |
| **Dân làng và ba bạn** | **Vẽ mới** | Nón lá và áo bà ba lộ Việt Nam. Đây cũng là bộ mặt của làng. | 1 | 11 |
| Quái rừng (10) và quái biển (10) | Giữ | Heo, ong, bọ, nấm, cua, cá, sứa: thú chung toàn cầu | — | 0 |
| Quái lâu đài (10) | Giữ, sửa nhẹ 2 con | Đèn Lồng Ma kiểu lồng giấy đỏ đổi thành **lồng sắt có ma lửa**. Mèo Đen Hai Đuôi giữ. | 3 | 2 |
| Quái sông (10) | Vẽ mới 6 con | 4/8 con vẫn là hình tạm tô lại màu. "Ma Da" là ma riêng của Việt Nam, đổi thành **Bogwisp** (ma đầm lầy). | 2 | 6 |
| Trùm nhỏ (4) | Giữ | Nấm, cua, hổ, cá trê đều trung tính | — | 0 |
| Mộc Tinh, Ngư Tinh, Hồ Tinh (3 pha mỗi con) | Giữ, sửa đạn | Chiêu "Bùa bay" của Mộc Tinh đổi thành **lá gai bay**: sửa hiệu ứng `hu-dan-bua`, `hu-bua-*`. | 3 | khoảng 4 hiệu ứng |
| **Thuồng Luồng → Mirewyrm** | **Vẽ mới** 3 pha | Đằng nào cũng phải vẽ. Thiết kế: rắn sông không cánh, thân bùn xanh, có các mảnh chuông đồng cắm trên lưng. | 1 | 3 |
| Nền, sàn, tường rừng và biển | Giữ | Đã trung tính | — | 0 |
| Nền lâu đài | Sửa nhẹ | Bớt cột đỏ sơn mài và thảm đỏ kiểu cung đình, đổi thành đá xám ấm và cờ vải nâu (bảng màu Ashen Keep) | 2 | khoảng 8 |
| Nền sông | Sửa nhẹ | Sàn tre và cầu tre đổi thành **ván gỗ và cầu dây**. Giữ cọc và nước. | 2 | khoảng 10 |
| **Làng** (`gd-lang-*`, `gd-nen-lang`) | **Vẽ mới** | Nhà tranh, đình, cây đa, đò. Làng mới: lò rèn đá có ống khói, tháp chuông ở giữa, nhà gỗ khung, bến phà. | 1 | khoảng 22 |
| Họa tiết trống đồng | Vẽ mới | `gd-trong-dong`, `gd-phuc-lanh-trong`, `gd-huy-khung-dong`, `gd-danh-hieu-dong`, `hu-song-dong` đổi sang **Chuông Tim**: chuông đồng có vân lá | 1 | khoảng 6 |
| Khung, nút, thanh máu (`gd-khung`, `gd-nut`, `gd-the`, `gd-o`) | Sửa nhẹ: tô lại màu tự động | Bỏ ruy băng đỏ đậm. Khung đổi thành nền xám xanh đậm viền đồng. Giữ hình dạng. | 2 | khoảng 70, làm bằng công cụ tô lại màu |
| Biểu tượng, huy hiệu thành tựu (56), vật phẩm | Giữ | Trung tính | — | 0 |
| Thẻ sức mạnh (mới) | Vẽ mới | Phục vụ thay đổi số 2. Dùng khung có sẵn cộng biểu tượng. | 2 | khoảng 30 biểu tượng nhỏ 16×16 |
| Hiệu ứng (216) | Giữ | Hiệu ứng hệ, chém, nổ đều trung tính | — | 0 |
| **Màn đầu và logo** | **Vẽ mới** | Logo Latin "SPIRITBLADE" làm chữ chính, phụ đề "The Hollow Bell". Tranh mới: tháp chuông vỡ trên thung lũng, ba màu Lửa, Độc, Băng. | 1 | 1 logo, 1 tranh |
| Tranh truyện mở đầu | Vẽ mới | 7 tranh đang kể chuyện trống đồng và cây đa | 2 | 5–7 |

**Tổng cộng phải vẽ mới hoặc sửa tay** khoảng 95–115 tấm, cộng 70 tấm giao diện tô lại màu tự động, tức khoảng 20% công vẽ.
Thứ tự nên làm: **làng, đầu nhân vật chính, màn đầu, Mirewyrm, rồi họa tiết chuông.**

### 4.3 Thiết kế nhân vật chính mới: Tiko

1. Cậu bé 12–13 tuổi học việc lò rèn. Tóc nâu đỏ bù xù có một lọn dựng, **khăn quàng màu hổ phách** (#E8A33D) bay theo khi chạy. Đây là dấu hiệu nhận ra ngay khi hình còn nhỏ.
2. Áo chẽn **xanh lam** (#3E6FA8), tạp dề da nâu ngắn (#7A4A2C), găng da một tay. Màu lạnh và ấm đối nhau nên nổi trên cả bốn loại nền.
3. Không đeo mặt nạ, mặt lộ rõ, mắt to 2 điểm ảnh. Người chơi toàn cầu thích nhân vật chính có mặt.
4. Trên lưng có **một cái chuông nhỏ** (mảnh Chuông Tim đầu tiên) leng keng, liên kết với cốt truyện.
5. Giữ nguyên khung 48 điểm ảnh, chiều cao nhân vật và mọi động tác 8 hướng hiện có. Chỉ đổi đầu, tóc, áo bằng cách thay màu cộng vẽ lại phần đầu.

**Cách làm với quy trình hiện có:** hình nhân vật chính đang được dựng từ các tấm gốc lớn trong `docs/anh-goc/zed/moi/`, mỗi động tác một tấm, bằng script `dung-zed-game.py`. Ba bộ trang phục vùng cũng đã đi qua đúng đường này (thư mục `trang-phuc/`, cờ `?zedbo=`).
Vì vậy Tiko nên làm thành **một "bộ trang phục" mới cộng một lớp đầu mới**, chạy qua chính quy trình đó. Không vẽ lại từng khung trong game.
Cách này cho xem thử bằng `?zedbo=tiko` trước khi đặt làm mặc định, và giữ được bộ ninja cũ làm trang phục phụ.

### 4.4 Phông chữ

- **Chữ thường:** giữ **Be Vietnam Pro** (đang dùng). Phông này rõ, đủ dấu tiếng Việt và đủ cho tiếng Anh, Tây Ban Nha, Bồ Đào Nha, Indonesia.
- **Tiêu đề, số sát thương, nhãn nút:** dùng **Pixelify Sans** (Google Fonts, giấy phép tự do OFL) để có chất pixel. Phải kiểm tra phông này có đủ chữ có dấu tiếng Việt trước khi dùng cho bản tiếng Việt; nếu thiếu thì bản tiếng Việt dùng Be Vietnam Pro Bold.
- **Số nhỏ (6–8 điểm ảnh):** dùng **Silkscreen** (Google Fonts) hoặc **m5x7** của Daniel Linssen (miễn phí).
- **Tránh** "Press Start 2P": chữ quá rộng, chiếm chỗ trên màn ngang hẹp.
- Logo vẽ tay bằng điểm ảnh, không dùng phông có sẵn.

### 4.5 Bảng màu chung và chuẩn điểm ảnh

Xem ảnh `bang-mau-de-xuat.png`.

| Nhóm | Mã màu |
|---|---|
| Nền chung | #14121C #2A2838 #4A4658 #7B7489 #B8B0C4 #F2EDE4 |
| Tiko | #1B1A2B (viền) #3E6FA8 #7A4A2C #E8A33D #F4C9A0 #6B3B2A |
| Elderwood | #1F3A2B #2F5A3A #4F8A4A #9CC25A #E3D27A |
| Tidecaves | #13304A #1F5A78 #3F97A8 #9FE0E0 #E6F4F1 |
| Ashen Keep | #2B1C24 #5A2E33 #8C4A3A #C98A5A #F2C88A |
| Mirewater | #1C2F2C #365B55 #4E8F91 #66508A #F2C66D (lấy từ gợi ý 17/10) |
| Hệ, giữ màu cũ trong `G.EL` | Lửa #A8320A #FF7A2A #FFD23F · Độc #2F6B1A #6FCF3A #C2F58A · Băng #2B6EA3 #7FD4FF #E9F9FF |
| Bậc màu, giữ màu cũ | #D9DDE4 #69C96B #5798FF #B27BFF #FFD166 #F05B55 #FF7C3E |
| Giao diện mới | nền #232638 #2B2F45 · viền đồng #C9A45C · chữ sáng #F2DDA0 · nút chính #E0763A · nguy hiểm #E04646 · đồng ý #5FBF77 |

**Chuẩn điểm ảnh** (để mọi người vẽ, hay mọi lần gen ảnh, đều ra cùng một "giọng"):
- **Cỡ:** 1 điểm ảnh của hình bằng 1 điểm ảnh của game (khung game 480×270).
- **Chiều cao theo loại:**

| Loại | Cao (điểm ảnh) |
|---|---|
| Nhân vật chính | 34–38, trong khung 48 |
| Quái thường | 20–40 |
| Tinh anh | 40–56 |
| Trùm nhỏ | 56–80 |
| Trùm vùng | 110–160 |

- **Số màu tối đa mỗi hình:**

| Loại | Số màu |
|---|---|
| Nhân vật chính | 20 |
| Quái | 16 |
| Trùm | 24 |
| Tấm nền | 12 |
| Biểu tượng | 8 |

- **Viền:**
  - Nhân vật chính và quái: viền ngoài 1 điểm ảnh, dùng **màu tối của chính chỗ đó** chứ không dùng đen tuyền.
  - Riêng nhân vật chính: viền #1B1A2B ở cạnh dưới và cạnh tối, để luôn nổi trên nền.
  - Nền: **không viền**.
- **Ánh sáng:** luôn từ trên bên trái. Không dùng chuyển sắc mịn, không làm mờ, không khử răng cưa.
- **Độ tương phản:** nền tối và nhạt màu hơn (độ sáng khoảng 25–60%), nhân vật và quái sáng và đậm màu hơn. Nền không dùng màu hệ thuần (cam lửa, xanh độc, xanh băng) để màu hệ luôn "thuộc về" đòn đánh.

### 4.6 Năm câu lệnh mẫu để gen ảnh

Câu lệnh viết bằng tiếng Anh, nền magenta để tách nền dễ. Sau khi gen vẫn phải giảm về đúng số màu và cỡ ở mục 4.5.

1. **Nhân vật chính:**
   `Crisp pixel art game sprite, 48x48, top-down 3/4 view, 12-year-old blacksmith apprentice boy "Tiko", messy auburn hair with one cowlick, long amber scarf, blue tunic, short brown leather apron, one leather glove, small bronze bell on his back, holding a short sword, idle pose facing down-right, 1px dark outline, limited 20-color palette, solid magenta #FF00FF background, no blur, no anti-aliasing, no text.`
2. **Một con quái (Bogwisp, vùng sông):**
   `Crisp pixel art enemy sprite, 40x40, top-down 3/4 view, "Bogwisp": a hunched swamp spirit made of dripping river weed and mud with two glowing yellow eyes and a small lantern-like light in its chest, murky teal and moss green with one warm yellow accent, 1px dark selective outline, 16 colors max, solid magenta #FF00FF background, no blur, no text.`
3. **Một con trùm (Mirewyrm, pha 1):**
   `Crisp pixel art boss sprite, 160x120, top-down 3/4 view, "Mirewyrm": a huge wingless river serpent rising from muddy water, long coiled body of dark green-teal mud scales, broken bronze bell fragments embedded along its spine like plates, glowing amber eyes, menacing but readable silhouette, 24 colors max, 1px dark outline, solid magenta #FF00FF background, no blur, no text.`
4. **Khung HUD:**
   `Crisp pixel art mobile game UI kit, landscape, health bar frame and mana bar frame and a square weapon slot frame, dark slate blue panels (#2B2F45) with thin warm brass borders (#C9A45C), small leaf-engraved bronze bell motif on corners, clean and minimal, 9-slice friendly, each element separated, solid magenta #FF00FF background, no blur, no text, no numbers.`
5. **Nền một vùng (Elderwood):**
   `Crisp pixel art top-down tileset for a forest arena, 480x270 room, mossy dirt floor with LOW detail and low contrast in the center, roots and ferns and old stone markers only along the edges, muted greens (#1F3A2B #2F5A3A #4F8A4A) with a few warm yellow light patches, no outlines on tiles, no characters, solid magenta #FF00FF outside the room, no blur, no text.`

---

## 5. Ngôn ngữ và thị trường

### 5.1 Quy tắc

- **Tiếng Anh là mặc định** khi máy người chơi không dùng tiếng Việt. Mã hiện **chưa** tự nhận ngôn ngữ của máy, chỉ dòng chữ lúc tải trang là có. Đây là việc nhỏ, nên làm sớm.
- **Đặt tên vật phẩm, chiêu, trùm:**
  1. Tên tiếng Anh dài tối đa **14 ký tự** cho nút và nhãn, **20 ký tự** cho tên trùm. Chữ Tây Ban Nha và Bồ Đào Nha thường dài hơn tiếng Anh khoảng 25–30%, nên chừa chỗ.
  2. Tên trùm theo dạng **"tên riêng + danh hiệu"**: *Vixara, the Ember Fox*. Tên riêng ghép từ hai gốc tiếng Anh dễ đọc: Thorn + warden, Coral + maw.
  3. Tên chiêu theo dạng **động từ + hình ảnh**, tối đa 2 từ: Moon Slash, Root Spike, Tide Crash.
  4. Vũ khí Thức tỉnh tự đặt tên (đã có trong thiết kế), theo mẫu *"[Từ theo hệ] [Loại vũ khí]"*, ví dụ "Emberfang Sword, Bane of Thornwarden".
  5. **Không** dùng tên phiên âm tiếng Việt cho tên riêng ở bản tiếng Anh. Bản dịch hiện đang để "Moc Tinh", "Ngu Tinh", "Cu Tèo", "Cái Bống", người nước ngoài khó đọc.

### 5.2 Bảng đối chiếu Việt ↔ Anh, 45 thuật ngữ cốt lõi

Cột "Hiện tại" là chữ đang có trong `ngon_ngu_en.js`. Dấu "—" nghĩa là chưa có.

| Tiếng Việt | Hiện tại | Đề xuất |
|---|---|---|
| Kiếm / Thương / Búa / Phi tiêu | Sword / Spear / Hammer / Shuriken | Sword / Spear / Hammer / **Star Darts** (tránh từ tiếng Nhật, hợp với nhân vật không còn là ninja) |
| Trảm Nguyệt / Phi Thương / Địa Chấn / Mưa Phi Tiêu | Moon Slash / — / — / — | Moon Slash / Skyspear / Quake / Star Rain |
| Lửa / Độc / Băng | Fire / Poison / Ice | Fire / Poison / **Frost** |
| Nổ khói / Sốc nhiệt | Smoke Blast / Thermal Shock | **Blast** / **Shatter** |
| Trắng / Mầm / Thành hình / Thức tỉnh / Viên mãn | Plain / Sprout / Formed / Awakened / — | **Raw / Kindled / Forged / Awakened / Ascended** (cùng một mạch "rèn", hợp với game thợ rèn hơn) |
| Luyện / Tinh luyện | Temper / — | Temper / Refine (mốc cấp 9) |
| Ép đồ | — | (ẩn) Reforge |
| Mài | Sharpen | (ẩn, đã thay bằng Luyện) |
| Trắng / Xanh lục / Xanh lam / Tím / Vàng / Đỏ / Rực lửa (bậc) | Purple, Gold… | **Common / Uncommon / Rare / Epic / Legendary / Mythic / Primal** |
| Linh khí (tiền) | Spirit | **Essence** (tránh trùng chữ "Spirit" trong tên game) |
| Chưởng | Palm | **Spirit Burst** ("Palm" người nước ngoài không hiểu) |
| Phúc lành | — | Blessing (thẻ chọn trong ải: **Boon**) |
| Suối hồi | Healing Spring | Spring |
| Nguyên liệu rèn / nguyên liệu vùng / mảnh trùm | — / Region materials / Boss Shard | Ore / Relics / Boss Shard |
| Rừng già / Hang biển / Lâu đài cổ / Sông sâu | Old Forest / Sea Cave / Ancient Castle / Deep River | Elderwood / Tidecaves / Ashen Keep / Mirewater |
| Mộc Tinh / Ngư Tinh / Hồ Tinh / Thuồng Luồng | Moc Tinh / Ngu Tinh / Ho Tinh / — | Thornwarden / Coralmaw / Vixara, the Ember Fox / Mirewyrm |
| Nấm Chúa / Cua Đá / Hổ Lửa / Cá Trê | Mushroom King / Rock Crab / Fire Tiger / — | Sporecap King / Crystal Crab / Cinder Tiger / Mudwhisker |
| Hắc Long | — | The Hollow Wyrm |
| Trống đồng | — | the Heartbell |
| Cu Tí | Cu Tí | **Tiko** |
| Cu Tèo / Cái Bống / Cu Lì / Bé Sen | Cu Tèo / Cái Bống / Cu Lì / Little Sen | Bram / Wren / Otto / Pip |
| Chú Lái Đò / Ông Thợ Rèn / Bà Hàng Xén / Cô Thợ May | Ferryman / Blacksmith / Peddler / Tailor | Hob the Ferryman / Dorran the Smith / Mags / Ivy the Tailor |
| Cụ Đồ / Ông Từ / Anh Mõ | Scholar / Shrine Keeper / Town Crier | Sage Orrin / Keeper Ilse / Crier Tom |
| Đánh / Né / Đặc biệt / Bình máu | Attack / Dodge / — / — | Attack / Dodge / Special / Potion |
| Sức mạnh / Lực chiến | Power / — | Power / (ẩn) |
| Sổ yêu quái / Thành tựu / Việc hôm nay / Bảng vàng | — / — / — / Leaderboard | Bestiary / Achievements / Daily Tasks / Leaderboard |
| Hành trang | Inventory | Inventory |
| Độ khó 2 / Ải Rèn / Ải Vàng | — | Veteran / Forge Trial / Gold Trial |
| Rương báu / Thương nhân / Thử thách / Lời nguyền | Treasure / Merchant / Challenge / Curse | giữ nguyên |
| Vào ải / Bản đồ | Stages | Play / Map |

### 5.3 Những điểm văn hoá cần tránh

- **Biểu tượng tôn giáo thật:** chữ vạn, thánh giá, cổng torii, tượng Phật, chữ Hán trên bùa. Họa tiết mặt trời có cánh xoáy rất dễ bị nhìn nhầm thành chữ vạn, nên kiểm tra kỹ khi vẽ chuông mới.
- **Bùa giấy chữ Hán** (chiêu "Bùa bay"): người Trung Quốc thấy là đạo phù thật, người phương Tây thấy là "đồ Trung Quốc". Đổi sang lá gai.
- **Ninja và đồ Nhật:** bộ đồ ninja đen cộng phi tiêu bị xem là đồ mượn. Để làm trang phục phụ thì được, không làm hình ảnh chính.
- **Cảm giác cờ bạc:** ép đồ có tỉ lệ thất bại, rương ngẫu nhiên có thể trả tiền. Nhiều nước (Bỉ, Hà Lan) và nhiều cửa hàng ứng dụng siết chặt chuyện này. Luyện "luôn thành công" là hướng đúng.
- **Máu đỏ và xác:** nếu sau này vào Trung Quốc thì cần tuỳ chọn máu màu khác. Hiện game ít máu, ổn.
- **Bản đồ, cờ, biên giới:** không vẽ bản đồ thật.
- **Đồ uống có cồn:** chum rượu ở làng vẽ thành chum nước hoặc thùng nước.

### 5.4 Ngôn ngữ bản đầu

- **Đợt 1:** tiếng Anh và tiếng Việt. Tiếng Việt vẫn giữ cho người chơi trong nước, chỉ đổi tên riêng theo bối cảnh mới.
- **Đợt 2:** Tây Ban Nha, Bồ Đào Nha (Brazil), Indonesia. Ba thứ tiếng này dùng chữ La-tinh, Be Vietnam Pro đủ dấu, và là ba thị trường lớn chơi game trên trình duyệt và điện thoại giá rẻ. Không cần phông mới.
- **Đợt 3, khi game đã có người chơi:** Nhật, Hàn, Trung. Phải thêm phông chữ châu Á, khá nặng (vài MB), nên tách thành tệp tải riêng.

### 5.5 Mã hiện có đã sẵn sàng đến đâu cho đa ngôn ngữ

Đánh giá chung: **sẵn sàng khoảng 75–80%.**

**Đã có:**
- `ngon_ngu.js` với `G.LANG` (vi hoặc en). Khi ở tiếng Anh, mọi chữ vẽ lên màn hình tự được tra từ điển.
- `G.t()` cho câu có số chèn vào, `G.tv()` dịch nếu có, `G.kd()` cho chữ không dịch như tên người chơi.
- Nút **EN/VI** ở màn đầu và trong cài đặt.
- `ngon_ngu_en.js` có khoảng **1.875** câu.
- Ảnh 10 và 11 cho thấy làng và bảng Luyện bằng tiếng Anh hiện đủ, không vỡ khung.

**Còn thiếu:**
1. **Chưa tự nhận ngôn ngữ máy** và chưa có `?lang=en`. Việc nhỏ.
2. **Từ điển đang lệch:** `ngon_ngu_en.js` đã bị sửa tay, không còn khớp với `tools/ngon-ngu/tu-dien/*.json`. Phải gộp lại trước khi thêm thứ tiếng thứ ba.
3. **Khoá từ điển là chính câu tiếng Việt.** Đổi một chữ tiếng Việt là mất bản dịch. Thêm thứ tiếng thứ ba thì nên chuyển sang khoá dạng mã (`boss.moc.name`), làm dần theo từng tệp.
4. **Tên riêng đang bị khoá không dịch** (bảng `TEN_RIENG`). Khi đổi bối cảnh thì tên riêng phải trở thành chữ dịch được, vì tiếng Việt gọi là Cu Tí còn tiếng Anh gọi là Tiko. Hoặc gọn hơn: **đổi luôn tên gốc** sang tên mới ở cả hai thứ tiếng.
5. Còn khoảng 3.300 chuỗi tiếng Việt nằm rải trong mã. Khoảng 1.800 chuỗi khớp từ điển, phần lớn chỗ còn lại do từ điển nhỏ trong từng tệp lo. Dùng `G.ngonNgu.thieu` (danh sách chữ chưa dịch đã vẽ ra) để chạy một vòng tự động qua mọi màn, rồi bổ sung.

---

## 6. Lộ trình 3 giai đoạn (mỗi giai đoạn đều đưa lên web được)

**Giai đoạn 1: "Ra thế giới bằng chữ"** (khoảng 3–4 phiên, rủi ro thấp)
- **Lối chơi:** ẩn Ép đồ và Lực chiến (bật/tắt cờ). Màn đầu chỉ còn một nút Tap to Play, đăng nhập Google dời vào Cài đặt.
- **Hình:** logo mới "SPIRITBLADE — The Hollow Bell" đặt lên tranh màn đầu cũ. Nhân vật chính đổi màu áo (xanh lam và khăn hổ phách) bằng công cụ, chưa đổi đầu.
- **Chữ:**
  - Tự nhận ngôn ngữ máy, thêm `?lang=`.
  - Gộp lại từ điển.
  - Đổi toàn bộ tên riêng và thuật ngữ theo bảng 5.2.
  - Viết lại 7 câu truyện mở đầu theo cốt truyện Chuông Tim. Tranh cũ tạm giữ, dùng chữ để kể.
- **Chia phiên song song:**
  - Phiên chữ: từ điển và tên.
  - Phiên hình: logo và đổi màu.
  - Phiên mã: cờ và màn đầu.
  - Ba phiên không đụng tệp của nhau.

**Giai đoạn 2: "Lời hứa 5 phút và bộ mặt mới"** (khoảng 6–8 phiên)
- **Lối chơi:** thay đổi số 1 (ải 1-1 mới) và thay đổi số 3 (mang 2 vũ khí, thanh 5 nút ở làng).
- **Hình:**
  - Làng mới (khoảng 22 tấm) và 11 người dân.
  - Đầu Tiko 8 hướng.
  - Chuông Tim thay trống đồng (khoảng 6 tấm).
  - Tranh màn đầu mới.
  - Khung giao diện tô lại màu.
- **Chữ:** giọng thoại mới cho dân làng, ngắn, có tính cách. Bản tiếng Việt chạy song song.
- **Chia phiên:**
  - Hai phiên vẽ: một phiên làng và người, một phiên Tiko và giao diện.
  - Một phiên mã ải 1-1.
  - Một phiên mã làng và thanh nút.

**Giai đoạn 3: "Mỗi lượt một khác"** (khoảng 6–8 phiên)
- **Lối chơi:** thay đổi số 2 (30 thẻ sau mỗi phòng), cùng cảnh trùm "nuốt màu" khi thích nghi.
- **Hình:**
  - Mirewyrm 3 pha.
  - 6 quái sông.
  - Sửa nền lâu đài và nền sông.
  - 30 biểu tượng thẻ.
  - 5–7 tranh truyện mới.
- **Chữ:** thêm Tây Ban Nha, Bồ Đào Nha và Indonesia. Nên thuê người bản xứ soát lại, hoặc ít nhất nhờ người chơi bản xứ đọc thử.
- **Chia phiên:**
  - Phiên thẻ: logic.
  - Phiên cân bằng: chỉ chạy sau khi phiên thẻ xong.
  - Phiên vẽ trùm.
  - Phiên vẽ biểu tượng.
  - Phiên dịch.

**Chủ game cần quyết trước khi bắt đầu:**
- **Trước giai đoạn 1:** chọn hướng chủ đề, tên game, tên nhân vật chính. Đổi tên sau khi đã dịch sẽ phải làm lại.
- **Trước giai đoạn 2:** duyệt thay đổi số 1 và số 3. Đây là các phần đổi cảm giác chơi, nhất là việc chỉ mang 2 vũ khí.
- **Trước giai đoạn 3:** duyệt thay đổi số 2, vì nó đổi cảm giác chơi nhiều nhất.

---

## 7. Câu hỏi cần chủ game trả lời (chọn A, B hoặc C)

1. **Bối cảnh:**
   - A. Spirit Wilds: thế giới linh thần tự nghĩ ra, Chuông Tim (khuyên dùng)
   - B. Phương Đông giả tưởng chung: giữ làng mái tranh, ít vẽ lại nhất
   - C. Cổ tích châu Âu: vẽ lại nhiều nhất
2. **Tên game:**
   - A. Spiritblade: The Hollow Bell (khuyên dùng)
   - B. Hollowbell
   - C. Tên khác chủ game tự đặt
3. **Nhân vật chính:**
   - A. Tiko: đổi đầu và màu áo, giữ động tác (khuyên dùng)
   - B. Giữ Cu Tí ninja đen, chỉ đổi tên
   - C. Vẽ lại hoàn toàn một nhân vật mới (rất tốn, vì cả 8 hướng)
4. **Thẻ sức mạnh sau mỗi phòng (thay đổi số 2):**
   - A. Làm, sau mỗi phòng đánh (khuyên dùng)
   - B. Làm nhẹ, chỉ 2 lần mỗi ải
   - C. Không làm, giữ Phúc lành như cũ
5. **Vũ khí mang vào ải:**
   - A. Mang 2, chọn trước ải (khuyên dùng)
   - B. Giữ xoay vòng 4 như hiện tại
   - C. Mang 3
6. **Tiếng Việt sau khi đổi bối cảnh:**
   - A. Giữ tiếng Việt, đổi tên riêng theo bối cảnh mới (Tiko, Thornwarden…) (khuyên dùng)
   - B. Giữ tiếng Việt với tên cũ (Cu Tí, Mộc Tinh) cho người chơi trong nước
   - C. Bỏ tiếng Việt, chỉ làm tiếng Anh

---

*Nguồn kiểm nhanh tên game (tìm web ngày 02/11/2026):*
- [Spirit Blade II (itch.io)](https://hounddoge.itch.io/spirit-blade-ii-the-dichotomy-of-eternal-victory)
- [spirit blade (cinevva)](https://app.cinevva.com/arcade/spirit-blade)
- [Lanternbound (itch.io)](https://csaf.itch.io/lanternbound)
- [Inkbound (Family Gaming Database)](https://www.familygamingdatabase.com/accessibility/Inkbound)
- [Ember (Wikipedia)](https://en.wikipedia.org/wiki/Ember_(video_game))
- [Mythforge (itch.io)](https://coldteagames.itch.io/mythforge) (tên này đã có, nên không đề xuất)
