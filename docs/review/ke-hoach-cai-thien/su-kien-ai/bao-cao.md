# Rương, lời nguyền, thương nhân và sự kiện ngẫu nhiên trong ải

Ngày 15/10/2026, nhánh `khoi-tao-du-an`. Phiên này chỉ đọc code và đo bằng bot Node (không mở trình duyệt). Không sửa `game/`.

**Cách đo.** Bot `cong-cu/do-su-kien.js` nạp đúng bảng số (`game/js/data.js`) và bộ sinh bản đồ thật (`game/js/mapgen.js`). Sau đó nó đi lại các luật thưởng của `game/js/stage.js` 100 lượt mỗi vùng, rải đều 5 ải. Có hai kiểu người chơi:

- **người đi hết phòng**;
- **người vội**, chỉ đi đường chính tới trùm.

Linh khí từ việc kết liễu quái dính hệ lấy theo mô hình `tools/can-bang/tinh.js` (khoảng 16 mỗi lượt). Số trong báo cáo là kỳ vọng, đủ để so sánh, không phải đo tay người chơi. Cách chạy ghi ở `cong-cu/CACH-CHAY.md`, số thô ở `cong-cu/ra/so-lieu.json`.

Tệp trong thư mục này:

| Tệp | Xem gì |
|---|---|
| `bao-cao.md` | Báo cáo này |
| `mau/bang-mau.png` | 17 ảnh mẫu hiện có (NPC làng, đồ vật phòng, đồ làng) ghép một tấm, để gửi kèm khi gen ảnh mới |
| `mau/<mã>.png` | Từng ảnh mẫu (phóng ×2, nền trong suốt) |
| `cong-cu/do-su-kien.js` | Bot đo độ đa dạng thưởng trong ải |
| `cong-cu/lay-anh-mau.py` | Lấy ảnh mẫu từ `game/art/custom/*.sprite.json` |

---

## 1. Tóm tắt cho chủ game

- **Mỗi ải đều cùng một "bộ khung":** 8 phòng gồm Bắt đầu, 2 phòng Đánh quái, 1 Tinh anh, 1 **Rương báu**, 1 Suối hồi, 1 Trùm, và **1 phòng phụ**. Phòng phụ là Thương nhân, Thử thách hoặc Lời nguyền, mỗi loại 1/3.
- **Rương báu lần nào cũng y hệt:** ba lựa chọn cố định là linh khí, quặng và bùa hệ. Chỉ màu lá bùa thay đổi. Người tính toán sẽ luôn chọn **quặng**, vì quặng đáng giá gần **gấp đôi** linh khí.
- **Lời nguyền:** chỉ có 3 loại. Mỗi lần chỉ hiện 1 loại, thưởng luôn là "linh khí ×2". Bot đo được trung bình **+28 đến +32 linh khí**, tức khoảng +50% linh khí cả ải. Riêng "Không dùng bình máu" gần như **miễn phí**, vì dùng bình máu đã mất sao thứ hai rồi. Nên lời nguyền gần như lúc nào cũng nhận.
- **Thương nhân:** món hàng cố định, chỉ màu bùa đổi. Không giảm giá, không có món bất ngờ.
- **Thứ "bất ngờ" mỗi lượt:**
  - Người đi hết phòng gặp khoảng **3,7** thứ, nhưng chỉ **1** là lựa chọn thật (phòng phụ). Phần còn lại là chữ "rơi vàng/linh khí" hiện lên.
  - Người vội chỉ gặp **1,9** thứ, và bỏ qua rương tới 86–91% số lượt.
- **Đánh giá chung: độ đa dạng 3,5/10.** Chơi 5–6 ải là đã thấy hết. Bản đồ thì đa dạng (3 kiểu bố cục) nhưng **những gì xảy ra trong phòng** thì không.
- **Đề xuất chính:**
  1. **22 sự kiện dân gian** (Ông Bụt, bà cụ bán chè, ma trơi, thằng Cuội đánh đố, giếng ước, cây khế, chợ âm, nhà hoang hũ vàng…). Mỗi ải chắc chắn gặp 1 sự kiện, xuất hiện ngay trong phòng quái vừa dọn. Thêm 1 loại phòng phụ thứ tư là "Sự kiện lớn".
  2. Rương rút **3 món từ 10 món**, có rương đồng hiếm.
  3. Lời nguyền **hiện 2 chọn 1**, tăng lên 8 loại, thưởng khác nhau.
  4. Thương nhân bán **bình máu + 3 món ngẫu nhiên trong 10**, thỉnh thoảng giảm giá.
- **Ảnh cần gen:** 13 NPC và 15 đồ vật hoặc hiệu ứng, prompt ở mục 6.
- **Làm code:** chia 3 phiên. A (khung sự kiện) và B (rương / nguyền / thương nhân) chạy song song, C (sự kiện có cơ chế trong trận) làm sau A.

---

## 2. Hiện trạng (đọc code)

### 2.1 Bố cục ải

`mapgen.js` luôn dựng đúng 8 phòng: `start, fight, fight, elite, chest, fountain, boss` cộng 1 phòng lấy từ `SIDE = ['merchant','challenge','curse']` (`pick` đều 1/3). `M.check` bắt lỗi nếu khác bộ này. Ải hướng dẫn 1-1 đổi Thử thách / Lời nguyền thành Thương nhân. Ải ngày (`ai_ngay.js`) chỉ có 1 phòng đánh, không có gì khác.

Bot đo 100 lượt mỗi vùng: phòng phụ ra đúng khoảng 1/3 mỗi loại. Nhưng **34% số lần, lượt sau gặp lại đúng loại phòng phụ của lượt trước**. Có lúc **8–17 lượt liền** không gặp một loại nào đó (vd. Lâu đài cổ: 17 lượt liền không gặp Thử thách).

### 2.2 Rương báu (`stage.js` `chestOptions`, `panelChest`)

| Lựa chọn | Vùng 1 / 2 / 3 | Quy ra vàng (`U.VAL`: 1 linh khí = 4, 1 quặng = 12) |
|---|---|---|
| Túi linh khí | 9 / 12 / 16 | 36 / 48 / 64 |
| Quặng | 5 / 8 / 11 | **60 / 96 / 132** |
| Bùa hệ (Lửa/Độc/Băng ngẫu nhiên) | phủ hệ 60 giây | tạm thời, mất khi hết 60 giây |

- Chỉ có **1 loại rương**, không có rương hiếm, không theo độ khó 2.
- Thứ ngẫu nhiên duy nhất là hệ của lá bùa. Ở ải hướng dẫn, bùa luôn là Lửa.
- Bot đếm được **21 "bộ trải nghiệm"** khác nhau (3 hệ bùa rương × 7 khả năng phòng phụ), và cả 21 bộ đều xuất hiện trong 100 lượt. Thực chất người chơi chỉ thấy **khoảng 5 kiểu khác nhau**: Thương nhân, Thử thách, và 3 lời nguyền.
- **Lựa chọn không có ý nghĩa:** quặng luôn hơn linh khí 1,7–2 lần. Bùa 60 giây thì dễ hết trước khi tới phòng quái kế tiếp, vì rương thường là phòng cụt.
- **Người chơi có thấy khác nhau giữa các lần không? Gần như không.**

### 2.3 Lời nguyền (`data.js` `G.CURSES`, `panelCurse`)

| Lời nguyền | Bất lợi | Đổi lại | Nhận xét |
|---|---|---|---|
| `frail` | Máu tối đa −20% đến hết ải | Linh khí ×2 đến hết ải | Nặng nhất, nhưng vẫn đáng |
| `dry` | Không dùng được bình máu | như trên | **Gần như luôn chọn:** dùng bình máu đã mất sao 2. Người chơi khá thì không mất gì |
| `haste` | Quái nhanh hơn 15% | như trên | Vừa phải |

- Mỗi lần chỉ hiện **1** lời nguyền (`G.pick`). Lựa chọn duy nhất là "Nhận" hoặc "Bỏ qua".
- Bot đo: lời nguyền nằm khoảng giữa đường đi (vị trí trung bình 0,45–0,5). Nhận thì được thêm **+28 đến +32 linh khí** mỗi lượt (thấp nhất +20, cao nhất +54). Cả lượt chỉ có khoảng 57–61 linh khí, nên đây là thưởng rất to so với bất lợi. **Không có lời nguyền nào "không bao giờ chọn"**, và "Bỏ qua" gần như không ai bấm.
- Thưởng lúc nào cũng là linh khí, không bao giờ là thứ khác.

### 2.4 Thương nhân (`panelMerchant`)

| Món | Giá | Ghi chú |
|---|---|---|
| Bình máu | 60 | tối đa 3 bình (vào ải có 2). Dùng thì mất sao 2 |
| Bùa hệ (hệ ngẫu nhiên) | 80 | **hơi vô dụng:** rương cho miễn phí, chỉ kéo dài 60 giây |
| 3 quặng | 100 | 33 vàng/quặng (Bà Hàng Xén bán 40). Hợp lý |
| Bùa giữ bậc | 600 | chỉ khi bật ép đồ. Đắt nhưng có ích về sau |
| 1 nguyên liệu vùng đã qua | 150 | dùng chung lượt đổi với Bà Hàng Xén. Ổn |

- Không ngẫu nhiên (trừ màu bùa), không giảm giá, mỗi món chỉ mua được 1 lần.
- Thương nhân chỉ xuất hiện ở 1/3 số ải, nên người chơi không trông vào đó để mua bình máu được.
- Người mới hết vàng thì phòng này **không có gì để làm** (đã có ảnh góp ý `docs/review/trai-nghiem/anh/07-thuong-nhan-khi-0-vang.jpg`).

### 2.5 Các phòng / thứ khác

- **Thử thách:** 2 đợt quái trong 30 giây. Thắng được 6 quặng + 80 vàng, thua không được gì.
  - *Lỗi nhỏ:* `G.rnd() < 0.5 ? G.DA_TOI_QUANG || 6 : 6` luôn ra 6, nên vế ngẫu nhiên là thừa.
- **Suối hồi:** chọn 1 trong 2, hồi 50% máu hoặc đầy mana. Người chơi hầu như chọn máu.
- **Vật mang hệ trong phòng quái:** 1–2 chậu than / nấm độc / tinh thể băng. Đây là thứ thay đổi duy nhất trong phòng đánh.
- **Rơi ngẫu nhiên (chỉ hiện chữ):**
  - tinh anh 35% (vàng + linh khí), thêm 12% (vàng);
  - qua ải 50% (vàng + linh khí), 15% (+6 quặng);
  - trùm nhỏ 35% (vàng);
  - quái thường 1,2% (vàng).
- Không có bẫy, không có NPC gặp giữa đường, không có sự kiện, không có bàn thờ nào khác.

### 2.6 Một lượt gặp bao nhiêu thứ "bất ngờ" (bot, 100 lượt mỗi vùng)

| | Rừng già | Hang biển | Lâu đài cổ |
|---|---|---|---|
| Quái mỗi lượt | 30 | 33 | 39 |
| "Bất ngờ" mỗi lượt, người đi hết phòng | 3,7 | 3,8 | 3,8 |
| "Bất ngờ" mỗi lượt, người vội | 1,9 | 1,9 | 2,0 |
| Người vội bỏ qua phòng phụ | 80% | 82% | 90% |
| Người vội bỏ qua rương | 89% | 86% | 91% |
| Lượt sau giống hệt lượt trước (cùng phòng phụ, cùng hệ bùa) | 6% | 5% | 7% |
| Lượt sau cùng loại phòng phụ với lượt trước | 34% | 35% | 33% |

"Bất ngờ" ở đây gồm: rương, phòng phụ, và mỗi lần rơi đồ ngẫu nhiên. Trong số đó, **chỉ phòng phụ là lựa chọn có ý nghĩa**.

---

## 3. Đánh giá độ đa dạng (thang 1–10, roguelite cho trẻ con)

| Mục | Điểm | Đủ bất ngờ? | Lựa chọn có ý nghĩa? | Phạt quá nặng? |
|---|---|---|---|---|
| Rương báu | **3** | Không, 3 món cố định | Không, quặng luôn hơn | Không phạt (tốt) |
| Lời nguyền | **4** | Ít, chỉ 3 loại, hiện 1 | Yếu, thưởng quá to nên luôn nhận | Nhẹ, hợp trẻ con (tốt) |
| Thương nhân | **4** | Không, hàng cố định | Có chút (bình máu hay quặng) | Hết vàng thì phòng vô nghĩa |
| Phòng phụ khác / sự kiện | **3** | Chỉ 3 loại phòng phụ, không sự kiện | Thử thách: có (chấp nhận rủi ro) | Thua thử thách mất trắng |
| Rơi đồ ngẫu nhiên | **4** | Có, nhưng chỉ là chữ bay | Không | Không |
| **Chung** | **3,5** | Hết mới sau khoảng 5–6 ải | | |

**Điểm tốt nên giữ:** phạt nhẹ, bỏ qua được, có số rõ ràng, bản đồ có 3 kiểu.

**Điểm thiếu:**

- Không có **câu chuyện nhỏ** trong ải.
- Không có **khoảnh khắc "ồ!"** (thứ hiếm thấy).
- Không có lựa chọn **đổi thứ này lấy thứ kia** khiến trẻ phải nghĩ.

---

## 4. Đề xuất: rương, lời nguyền, thương nhân

### 4.1 Rương báu: rút 3 món trong 10, thêm rương đồng hiếm

**Cân lại 2 món cũ.** Hai món nên ngang giá để lựa chọn có ý nghĩa:

| Món | Hiện tại (vùng 1 / 2 / 3) | Đề xuất | Quy ra vàng (đề xuất) |
|---|---|---|---|
| Linh khí | 9 / 12 / 16 | **12 / 16 / 22** | 48 / 64 / 88 |
| Quặng | 5 / 8 / 11 | **4 / 6 / 8** | 48 / 72 / 96 |

**Bảng 10 món.** Rương thường rút ngẫu nhiên 3 món theo trọng số (W), không trùng nhau:

| # | Món | Số (vùng 1 / 2 / 3) | W | Ghi chú |
|---|---|---|---|---|
| 1 | Túi linh khí | 12 / 16 / 22 | 10 | |
| 2 | Quặng | 4 / 6 / 8 | 10 | |
| 3 | Bùa hệ | phủ hệ **90 giây** (cũ 60) + 4 linh khí | 8 | bùa không còn "trắng tay" |
| 4 | Túi vàng | 50 / 70 / 100 | 8 | |
| 5 | Nguyên liệu vùng này | 3 / 3 / 4 | 6 | |
| 6 | Bình máu +1 | 1 (chỉ khi còn dưới 3 bình) | 6 | |
| 7 | Phúc "Sức trâu" | +10% sát thương đến hết ải | 5 | lựa chọn ngay trong lượt |
| 8 | Phúc "Chân sáo" | +12% tốc chạy và hồi lăn né nhanh 15% đến hết ải | 5 | |
| 9 | Đá nâng bậc | 1 (từ vùng 2) | 3 | hiếm |
| 10 | Mảnh trùm của vùng | 1 (chỉ khi đã hạ trùm vùng) | 1 | rất hiếm, "ồ!" |

**Rương đồng** (12% số rương; độ khó 2 là 20%):

- hình rương khác;
- cho chọn **2 trong 3** món, hoặc 3 món với số ×1,5.

Thưởng trung bình của rương tăng khoảng +15% so với hiện nay. Bot đo lại theo mục 7.4.

### 4.2 Lời nguyền: hiện 2 chọn 1, 8 loại, thưởng khác nhau

Mỗi lần hiện **2** lời nguyền khác nhau (vẫn có "Bỏ qua"). Thưởng không chỉ là linh khí ×2.

| # | Lời nguyền | Bất lợi (đến hết ải) | Thưởng | Ghi chú |
|---|---|---|---|---|
| 1 | Yếu ớt (giữ `frail`) | Máu tối đa −20% | Linh khí ×2 | |
| 2 | Khô bình (sửa `dry`) | Không dùng bình máu | **Linh khí ×1,5** + 40 vàng | chỉ hiện khi đang còn ít nhất 1 bình |
| 3 | Quái hăng (giữ `haste`) | Quái nhanh hơn 15% | Linh khí ×2 | |
| 4 | Đêm không trăng | Ngoài vòng sáng 140 điểm ảnh quanh Zed tối mờ | Linh khí ×2 + 40 vàng | cần lớp tối, xem phiên C |
| 5 | Bầy đông | Mỗi đợt quái +1 con | Linh khí ×1,5 (quái nhiều nên tự có thêm) + 6 quặng | |
| 6 | Chân nặng | Hồi lăn né chậm hơn 40% | Đá nâng bậc +1 ở trùm (vùng 1: +6 quặng) | |
| 7 | Trùm nổi giận sớm | Trùm vào pha 2 ngay từ đầu | Vàng của trùm ×1,5 + 1 rương thường sau trùm | |
| 8 | Túi thủng | Vàng nhặt trong ải −50% | Linh khí ×2,5 | cho người đang cày linh khí |

- Trọng số đều nhau. Độ khó 2 thì nguyền 4, 5, 7 ra nhiều gấp đôi.
- Ải hướng dẫn và 3 ải đầu của vùng 1 chỉ dùng nguyền 1, 2, 3.

### 4.3 Thương nhân: bình máu + 3 món ngẫu nhiên, có giảm giá

Luôn bán **Bình máu (60)**, cộng thêm 3 món rút từ bảng dưới. 25% số lần, 1 món được **giảm 30%** (ghi "Hôm nay rẻ!").

| Món | Giá | Ghi chú |
|---|---|---|
| Bùa hệ 90 giây | **40** (cũ 80) | |
| 5 quặng | 150 (cũ 3 quặng / 100) | |
| Bình mana (hồi đầy mana) | 40 | |
| Túi linh khí 10 | 70 | đổi vàng lấy linh khí, mỗi ải 1 lần |
| Bùa hộ thân: chặn trọn 1 đòn trong ải | 120 | |
| Bánh chưng: +15% máu tối đa đến hết ải | 90 | |
| Bản đồ lái buôn: hiện hết bản đồ + chỗ sự kiện | 30 | |
| Đá nâng bậc 1 (vùng 2 trở đi) | 250 | |
| Bùa giữ bậc (giữ như cũ) | 600 | 30% số lần có |
| 1 nguyên liệu vùng đã qua (giữ như cũ) | 150 | |

**Khi vàng dưới 60:** ông lái buôn **tặng 1 nắm xôi** (hồi 15% máu) cho bé, để phòng này không bao giờ là phòng chết.

### 4.4 Sửa nhỏ khác

- Thử thách: bỏ vế ngẫu nhiên thừa. Đề xuất thắng thì rút 1 món trong [6 quặng | 15 linh khí | 1 nguyên liệu vùng], cộng 80 vàng. Thua vẫn được 20 vàng an ủi.
- Suối hồi: giữ nguyên.

---

## 5. Đề xuất: 22 sự kiện ngẫu nhiên dân gian Việt

### 5.1 Hai kiểu sự kiện

- **Gặp giữa đường (nhỏ):** dọn xong một phòng Đánh quái hoặc Tinh anh, NPC hay đồ vật hiện ra giữa phòng (khói mờ + tiếng chuông nhỏ). Lại gần, bấm Đánh để mở bảng chọn. **Không đổi bản đồ.**
- **Sự kiện lớn:** thêm loại phòng phụ thứ tư `event`. Trọng số phòng phụ: Thương nhân 30, Thử thách 25, Lời nguyền 25, **Sự kiện lớn 20**. Phòng sự kiện lớn trên bản đồ nhỏ có biểu tượng dấu "?".

### 5.2 Danh sách sự kiện

Quy ước cho bảng dưới:

- **Vùng:** R = Rừng già, B = Hang biển, L = Lâu đài cổ.
- **W:** trọng số khi rút.
- **Thưởng ×vùng:** thưởng nhân 1 / 1,4 / 1,9 theo vùng, giống tỉ lệ của rương. Số trong bảng là của vùng 1.
- Mọi lựa chọn "từ chối" đều không mất gì.

| # | Sự kiện | Xảy ra thế nào | Lựa chọn → thưởng / phạt (vùng 1) | Vùng | Kiểu | W | Ảnh mới |
|---|---|---|---|---|---|---|---|
| 1 | **Ông Bụt hiện ra** | Ánh sáng, Bụt hỏi "Vì sao con khóc?" | Chọn 1 trong 3 phúc: hồi đầy máu · +1 bình máu · linh khí ×1,5 đến hết ải | R B L | nhỏ | 3 (hiếm) | NPC Bụt |
| 2 | **Bà cụ bán nước chè** | Bà ngồi bên gánh chè xanh | Trả 30 vàng: hồi 30% máu + 30 mana · Cho bà 1 bình máu: bà tặng bùa hộ thân (chặn 1 đòn) · Đi tiếp | R B L | nhỏ | 10 | NPC bà cụ + gánh chè |
| 3 | **Đám ma trơi dẫn đường** | 3 đốm lửa xanh lượn trước một cửa | Đi theo: phòng kế có thêm 1 đợt quái, dọn xong có **rương thường thêm** · Mặc kệ | R L | nhỏ | 6 | hiệu ứng ma trơi (lặp) |
| 4 | **Thằng Cuội đánh đố** | Cuội ngồi gốc đa con, ra 1 câu đố dân gian 3 đáp án | Đúng: 15 linh khí + 40 vàng · Sai: Cuội cười, vẫn cho 10 vàng và nói đáp án | R B L | nhỏ | 8 | NPC Cuội |
| 5 | **Giếng ước** | Giếng cổ có tiếng vọng | Ném 20 vàng: chắc chắn được 1 trong [1 bình máu · 40 vàng · 8 linh khí] · Ném 100 vàng: chắc chắn 1 trong [25 linh khí · 8 quặng · 1 đá bậc (vùng 2+)] · Đi | R B L | nhỏ | 7 | giếng rêu (có mẫu `gd-lang-gieng`) |
| 6 | **Cây khế ăn quả trả vàng** | Chim thần đậu cây khế | May túi 3 gang: chắc chắn 90 vàng · May túi to: 50% được 220 vàng, 50% chim chao rơi bị mất 15% máu và còn 30 vàng ("đừng tham!") | R | lớn | 6 | cây khế + chim thần |
| 7 | **Phiên chợ âm** | Nửa đêm, quầy hàng ma, đèn lồng xanh | Mua 1 trong 3 "bùa ma" trả bằng máu: +20% sát thương / +25% linh khí / hút máu 1% mỗi đòn đến hết ải, mỗi bùa mất 12% máu tối đa đến hết ải · Không mua | L (B ở độ khó 2) | lớn | 5 | NPC quỷ bán hàng + quầy |
| 8 | **Nhà hoang có hũ vàng** | 3 hũ sành trong góc nhà đổ | Mở 1 hũ: 2 hũ có 80 / 120 vàng; 1 hũ có ong vò vẽ (1 đợt quái nhỏ, đánh xong vẫn được 40 vàng). Mở xong được mở thêm hũ 2 hay dừng | R B L | lớn | 7 | 3 hũ (đóng / mở / vỡ) |
| 9 | **Bụi tre đằng ngà** | Bụi tre vàng óng phát lửa | Bẻ 1 cây: phủ Lửa 90 giây + đòn Đặc biệt kế tiếp miễn mana · Để yên: +8 linh khí | R | nhỏ | 5 | bụi tre ngà |
| 10 | **Bống bống bang bang** (chuỗi) | Giếng có cá bống | Cho cơm (10 vàng). Gặp lại bống ở 3 ải khác nhau (không cần liền nhau) → lần 3 bống tặng **đôi hài** (+12% tốc chạy đến hết ải đó) + 60 linh khí | R B | nhỏ | 4 | cá bống + chậu nước |
| 11 | **Cá chép vàng hóa rồng** | Cá chép mắc cạn trong vũng nước | Thả cá: +12 linh khí, cá vẫy đuôi phun nước hồi 10% máu · Mang bán: +70 vàng | B | nhỏ | 7 | cá chép vàng |
| 12 | **Sơn Tinh – Thủy Tinh** | Nước dâng kín sàn phòng kế tiếp | Đắp đê (40 vàng): bỏ qua · Lội nước: cả bé và quái chậm 15% trong phòng kế, dọn xong +1 đá nâng bậc (vùng 1: 6 quặng) | B | lớn | 5 | lớp nước sàn (lặp) |
| 13 | **Lông ngỗng Mỵ Châu** | Lông ngỗng trắng rơi trong 3 phòng của ải | Nhặt đủ 3 chiếc trước trùm: rương bí mật hiện ở Suối hồi (20 linh khí + 6 quặng) | L | nhỏ (thu thập) | 5 | lông ngỗng |
| 14 | **Rước đèn ông sao** | Một bé ma nhỏ hiền xin đi cùng | Dẫn bé qua phòng quái kế tiếp: đèn có 3 "máu", quái đánh trúng đèn thì mất 1. Còn đèn: 60 vàng + 1 bánh trung thu (hồi đầy máu) · Đèn tắt: vẫn được 20 vàng | R B L | lớn | 4 | bé ma nhỏ cầm đèn ông sao |
| 15 | **Ông lão ăn mày (tiên thử lòng)** | Ông lão xin ăn | Cho 1 bình máu hoặc 50 vàng: ông hóa tiên, trả gấp đôi (2 bình hoặc 100 vàng + 10 linh khí) · Từ chối: ông đi, không mất gì | R B L | nhỏ | 6 | NPC ăn mày + làn khói tiên |
| 16 | **Ông đồ cho chữ** | Ông đồ ngồi trải giấy đỏ | Xin 1 chữ: **Phúc** +1 bình máu · **Lộc** +80 vàng · **Thọ** +15% máu tối đa đến hết ải · **Tài** +10% sát thương đến hết ải | R B L | nhỏ | 8 | dùng mẫu `nl-do` + tờ chữ đỏ |
| 17 | **Cóc kiện trời** | Cóc nghiến răng bên trống đồng | Đánh trống giúp cóc: mưa ở phòng kế (Lửa −30% sát thương, Băng đóng băng nhanh hơn 30%) + 15 linh khí · Không đánh | R B | nhỏ | 5 | cóc + trống đồng, hiệu ứng mưa |
| 18 | **Bịt mắt đập niêu** | 3 niêu đất treo, bé bị bịt mắt (màn tối 6 giây) | Đập trúng niêu nào cũng có quà: 1 niêu to (20 linh khí), 2 niêu nhỏ (25 vàng). Không trúng thì tự mở niêu nhỏ | R B L | nhỏ | 6 | niêu đất (lành / vỡ) |
| 19 | **Trăm trứng Âu Cơ** | Tổ trứng tiên phát sáng | Ấp 1 trứng: nở **chim Lạc** bay theo bé đến hết ải, mổ quái 4 sát thương/giây (theo vùng) · Để yên: +10 linh khí | R B L | lớn | 2 (rất hiếm) | tổ trứng + chim Lạc |
| 20 | **Hổ trả ơn** | Hổ nằm rên, hóc xương | Gỡ xương (đứng gần 3 giây, không rủi ro): hổ theo đánh giúp 1 phòng (30 giây), hoặc để lại 2 nguyên liệu vùng (bé chọn) · Đi | R | lớn | 4 | NPC hổ |
| 21 | **Nồi bánh chưng Lang Liêu** | Bếp lửa, nồi bánh đang sôi | Canh nồi 20 giây trong lúc quái nhỏ kéo tới (giữ nồi không bị đánh vỡ): bánh chưng (+1 bình hồi 50%) + 40 vàng · Thua: 15 vàng | L | lớn | 5 | bếp + nồi bánh chưng |
| 22 | **Rùa vàng mượn gươm** | Rùa nổi lên ở vũng nước | Cho mượn vũ khí đang cầm (khóa món đó 1 phòng): trả lại kèm 20 linh khí · Không cho | B | nhỏ | 5 | rùa vàng |

- **Đợt 1 nên làm 15 sự kiện:** số 1, 2, 4, 5, 6, 8, 11, 15, 16, 18, 22 (chỉ cần bảng chọn) và 3, 7, 9, 17 (có cơ chế nhẹ).
- **Đợt 2 (làm sau):** số 10, 12, 13, 14, 19, 20, 21 (đồng hành, chuỗi, phòng biến đổi).
- **Phân bố theo vùng:** sự kiện chung + sự kiện riêng. Rừng có 15 sự kiện, Biển 16, Lâu đài 14, nên vùng nào cũng đủ để không lặp.

**Không dùng cờ bạc.** Giếng ước, nhà hoang, đập niêu, cây khế **luôn cho quà**, chỉ khác loại hoặc khác số. Riêng cây khế có một vế rủi ro nhẹ, và vế đó vẫn được 30 vàng.

### 5.3 Luật chọn sự kiện mỗi ải

1. **Số sự kiện mỗi lượt:**
   - Ải thường (1–4 của vùng): **đúng 1 "gặp giữa đường"**, xuất hiện khi dọn xong 1 phòng Đánh quái hoặc Tinh anh (chọn ngẫu nhiên, không phải phòng cuối trước Suối hồi). Cộng 20% khả năng phòng phụ là "Sự kiện lớn".
   - Ải trùm vùng (ải 5, Kiểu C): 1 sự kiện **nhỏ**, không có sự kiện thêm quái.
   - Trung bình **1,2 sự kiện / lượt** (độ khó 1).
2. **Độ khó 2:** thêm 60% khả năng có sự kiện "gặp giữa đường" thứ 2 (khác phòng). Sự kiện có rủi ro (3, 6, 7, 8, 12, 14, 21) ra nhiều gấp đôi. Thưởng ×1,25.
3. **Không lặp liền:** không rút sự kiện đã gặp trong **3 lượt gần nhất** (lưu `sv.suKien.gan`, tối đa 3 mã). Một lượt không có 2 sự kiện giống nhau.
4. **Ưu tiên cái mới:** sự kiện chưa từng gặp được trọng số ×2 (lưu `sv.suKien.da`). Gặp đủ thì ghi vào **"Sổ chuyện dân gian"** ở làng (Ông Từ, đợt sau).
5. **Không có:** ở ải hướng dẫn 1-1, ải ngày, và 2 lượt đầu tiên của người mới (để học luật trước).
6. **Ngân sách thưởng:** giá trị kỳ vọng mỗi sự kiện khoảng 25 linh khí quy đổi (~100 vàng) ở vùng 1. Tổng thưởng mỗi lượt tăng **không quá 12–15%**. Vàng của sự kiện nhân `G.grindMult` như vàng qua ải (cày ải dễ thì giảm).

---

## 6. Ảnh cần gen

**Quy cách chung:**

- Pixel art, nền trơn **#00FF00**, 1 hình mỗi ảnh (hoặc 1 hàng N khung với ảnh có động tác).
- Viền tối 1 nét `#140d0e`, ánh sáng từ trên bên trái, màu phẳng 3 sắc, không chữ, không bóng đổ xuống đất.
- Nhìn chính diện hơi chếch từ trên xuống, giống đồ vật phòng và NPC làng hiện có.
- Vẽ gấp đôi cỡ game (`net: 2`).
- NPC: tách bằng `tools/tach-lang` (2 hàng 6 khung: `idle`, `noi`, như `nl-*`). Đồ vật: tách bằng `tools/tach-phong`.

**Ảnh mẫu gửi kèm** (đã xuất sẵn ở `mau/`, tấm ghép `mau/bang-mau.png`):

| Ảnh mẫu | Dùng để giữ phong cách cho |
|---|---|
| `mau/nl-tu.png` | NPC ông lão (Bụt, ăn mày) |
| `mau/nl-xen.png` | NPC bà cụ (bán chè) |
| `mau/nl-lai.png` | Cuội |
| `mau/nl-mo.png` | NPC trẻ |
| `mau/nl-do.png` | Ông đồ |
| `mau/gd-vat-thuong-nhan.png` | quầy chợ âm |
| `mau/gd-vat-ban-tho.png` | quầy chợ âm, ma trơi |
| `mau/gd-vat-ruong.png`, `mau/gd-vat-ruong-mo.png` | hũ, rương đồng |
| `mau/gd-lang-gieng.png` | giếng ước |
| `mau/gd-lang-chum.png` | hũ, niêu |
| `mau/gd-lang-cay-da.png` | cây khế, gốc đa của Cuội |
| `mau/gd-lang-den-long.png` | đèn ông sao |
| `mau/gd-vat-be-thu-thach.png`, `mau/gd-vat-suoi-mau.png`, `mau/gd-vat-chau-than.png` | đồ vật phòng nói chung, bếp lửa |
| `mau/gd-bua-fire.png` | biểu tượng tròn (Phúc Lộc Thọ Tài) |

Nguồn gốc của mọi ảnh mẫu là `game/art/custom/<mã>.sprite.json`.

### 6.1 NPC (13). Cao 30–42 điểm game như `nl-*`, 2 hàng × 6 khung (idle, nói)

| # | Mã tệp | Sự kiện | Cỡ game | Mẫu kèm | Prompt |
|---|---|---|---|---|---|
| 1 | `sk-but` | 1 | 26×42 | nl-tu | `Pixel art NPC sprite sheet, 2 rows x 6 frames (row 1 idle breathing, row 2 talking with raised hand), flat #00FF00 background, Vietnamese folk fairy "Ông Bụt": kind old man, long white beard, white-gold robe, wooden staff, soft golden halo, front 3/4 view, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 2 | `sk-ba-che` | 2 | 28×32 | nl-xen | `Pixel art NPC sprite sheet, 2 rows x 6 frames (idle, talking), flat #00FF00 background, old Vietnamese tea seller woman sitting on a low stool beside a shoulder-pole with a clay teapot and small cups, brown áo tứ thân, black headscarf, warm smile, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 3 | `sk-cuoi` | 4 | 26×38 | nl-lai | `Pixel art NPC sprite sheet, 2 rows x 6 frames (idle swinging legs, talking and laughing), flat #00FF00 background, cheeky Vietnamese boy "Thằng Cuội" sitting on a small banyan root, short brown shorts, tuft of hair, holding a banyan leaf, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 4 | `sk-chim-than` | 6 | 34×30 | nl-mo | `Pixel art sprite, 2 rows x 6 frames (perched idle, wings flap talking), flat #00FF00 background, giant mythical golden-brown phoenix-eagle bird from Vietnamese tale "Ăn khế trả vàng", red crest, kind eyes, dark outline #140d0e, no shadow, no text.` |
| 5 | `sk-quy-cho` | 7 | 26×38 | nl-tu | `Pixel art NPC sprite sheet, 2 rows x 6 frames (idle floating, talking), flat #00FF00 background, cute-spooky Vietnamese ghost market vendor: pale blue-grey face, long dark áo dài, conical hat with torn edge, holding a pale green paper lantern, faint teal glow, not scary for kids, dark outline #140d0e, no shadow, no text.` |
| 6 | `sk-an-may` | 15 | 24×36 | nl-tu | `Pixel art NPC sprite sheet, 2 rows x 6 frames (idle leaning on stick, talking), flat #00FF00 background, ragged old Vietnamese beggar with patched brown clothes, straw hat on back, wooden bowl, kind eyes with a hidden faint sparkle, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 7 | `sk-ca-chep` | 11 | 24×16 | gd-vat-suoi-mau | `Pixel art sprite, 1 row of 6 frames, flat #00FF00 background, golden carp flapping in a small shallow puddle on stone floor, orange-gold scales, red fins, water splashes, top-down 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 8 | `sk-coc` | 17 | 28×22 | gd-lang-chum | `Pixel art sprite, 2 rows x 6 frames (idle, croaking), flat #00FF00 background, angry little green-brown Vietnamese toad sitting next to a small bronze Đông Sơn drum, grinding teeth, cute, dark outline #140d0e, no shadow, no text.` |
| 9 | `sk-ho` | 20 | 40×26 | nl-mo | `Pixel art sprite, 2 rows x 6 frames (lying hurt, standing grateful), flat #00FF00 background, orange striped tiger from Vietnamese folk tale, chunky friendly style for kids, side 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 10 | `sk-rua-vang` | 22 | 30×20 | gd-vat-suoi-mau | `Pixel art sprite, 1 row of 6 frames, flat #00FF00 background, golden turtle (Kim Quy) rising from a small round pond, old wise face, shell with bronze patterns, top-down 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 11 | `sk-be-ma-den` | 14 | 18×26 | nl-mo | `Pixel art sprite, 2 rows x 6 frames (floating walk, cheering), flat #00FF00 background, tiny friendly pale-blue child ghost holding a red-yellow five-point star lantern (đèn ông sao) on a stick, round cute face, dark outline #140d0e, no shadow, no text.` |
| 12 | `sk-ca-bong` | 10 | 20×14 | gd-lang-gieng | `Pixel art sprite, 1 row of 6 frames, flat #00FF00 background, small goby fish (cá bống) peeking out of a wooden water basin, brown-grey, big friendly eyes, dark outline #140d0e, no shadow, no text.` |
| 13 | `sk-chim-lac` | 19 | 16×14 | gd-lang-den-long | `Pixel art sprite, 1 row of 6 looping frames, flat #00FF00 background, small Đông Sơn "chim Lạc" bird companion flying, long beak, bronze-gold and white feathers with drum pattern, side view facing right, dark outline #140d0e, no shadow, no text.` |

### 6.2 Đồ vật và hiệu ứng (15). Cỡ 14–40 điểm game như `gd-vat-*`

| # | Mã tệp | Sự kiện | Cỡ game | Mẫu kèm | Prompt |
|---|---|---|---|---|---|
| 1 | `sk-ma-troi` | 3 | 12×14 ×3 | gd-vat-ban-tho | `Pixel art, 1 row of 6 looping frames, flat #00FF00 background, a single will-o'-the-wisp: small teal-green ghost flame (#5af0c8, white core) flickering and bobbing, soft, no outline on glow, no shadow, no text.` |
| 2 | `sk-gieng-uoc` | 5 | 30×26 | gd-lang-gieng | `Pixel art object, flat #00FF00 background, old mossy Vietnamese stone wishing well with red ribbon tied on wooden frame, a few coins glinting in dark blue water, front 3/4 view, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 3 | `sk-cay-khe` | 6 | 40×48 | gd-lang-cay-da | `Pixel art object, flat #00FF00 background, small star-fruit tree (cây khế) full of yellow-green star fruits, twisted trunk, front 3/4 view, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 4 | `sk-quay-cho-am` | 7 | 40×34 | gd-vat-thuong-nhan | `Pixel art object, flat #00FF00 background, spooky-cute ghost market stall: dark wooden table with three glowing talismans (red, purple, green), pale green paper lanterns hanging, torn dark cloth roof, front 3/4 view, dark outline #140d0e, no shadow, no text, same style as reference.` |
| 5 | `sk-hu` / `sk-hu-mo` / `sk-hu-vo` | 8 | 14×16 | gd-lang-chum | `Pixel art, 1 row of 3 cells, flat #00FF00 background: (1) closed brown glazed clay jar with cloth lid tied, (2) same jar open with gold coins shining inside, (3) same jar cracked open with a few wasps flying out, front 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 6 | `sk-tre-nga` | 9 | 24×34 | gd-lang-cay-da | `Pixel art object, flat #00FF00 background, clump of golden ivory bamboo (tre đằng ngà) with faint orange fire glow at tips, front 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 7 | `sk-to-chu` | 16 | 22×12 | nl-do | `Pixel art object, flat #00FF00 background, red calligraphy paper sheet on a low wooden tray with ink stone and brush, golden blob instead of letters (no readable text), front 3/4 view, dark outline #140d0e, no shadow.` |
| 8 | `sk-chu-phuc-loc-tho-tai` | 16 | 16×16 ×4 | gd-bua-fire | `Pixel art, 1 row of 4 icons, flat #00FF00 background, four red round seals with simple gold symbols: a bat, a coin, a peach, a scroll (stand for Phúc Lộc Thọ Tài), no letters, dark outline #140d0e.` (chữ Hán/Việt vẽ bằng code nếu muốn) |
| 9 | `sk-nieu` / `sk-nieu-vo` | 18 | 14×14 | gd-lang-chum | `Pixel art, 1 row of 2 cells, flat #00FF00 background: (1) small earthen clay pot (niêu) hanging from a short rope, (2) same pot smashed with confetti and coins popping out, front view, dark outline #140d0e, no shadow, no text.` |
| 10 | `sk-to-trung` | 19 | 22×14 | gd-vat-ruong | `Pixel art object, flat #00FF00 background, a nest of straw holding several pearly glowing eggs with faint bronze drum patterns, front 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 11 | `sk-bep-banh-chung` | 21 | 26×28 | gd-vat-chau-than | `Pixel art, 1 row of 4 looping frames, flat #00FF00 background, three-stone wood fire with a big black pot of square bánh chưng wrapped in green leaves, steam rising, front 3/4 view, dark outline #140d0e, no shadow, no text.` |
| 12 | `sk-long-ngong` | 13 | 10×8 | gd-lang-den-long | `Pixel art object, flat #00FF00 background, a single white goose feather lying on the floor with a faint shimmer, dark outline #140d0e, no shadow, no text.` |
| 13 | `sk-nuoc-dang` | 12 | 64×32 lát | — | `Pixel art seamless tile, 1 row of 4 looping frames, flat #00FF00 background, top-down shallow muddy flood water layer (semi-dark teal-brown, ripples, small foam), tileable edges, no outline, no text.` |
| 14 | `sk-mua` | 17 | 32×48 | — | `Pixel art, 1 row of 4 looping frames, flat #00FF00 background, light rain streaks (pale blue-white diagonal lines) with tiny splash dots at bottom, tileable, no outline, no text.` |
| 15 | `sk-ruong-dong` / `-mo` | rương đồng 4.1 | 28×21 | gd-vat-ruong | `Pixel art, 1 row of 2 cells, flat #00FF00 background, same chest shape as reference but made of bronze with Đông Sơn drum sun pattern on lid, (1) closed, (2) open with green-blue glow inside, front 3/4 view, dark outline #140d0e, no shadow, no text.` |

Thêm 1 **biểu tượng phòng** `gd-phong-event` (dấu hỏi vàng trên nền tròn) cho bản đồ nhỏ, dùng cùng quy cách với `gd-phong-*` hiện có.

**Nên gen theo 2 lô lưới** (giống `docs/review/phong-a1/PROMPT.md`): lô NPC 13 hình, lô đồ vật 15 hình. Dung lượng ước tính dưới 0,3 MB.

---

## 7. Chia việc code (để phiên sau làm)

### 7.1 Phiên A: khung sự kiện + 11 sự kiện chỉ có bảng chọn (song song với B)

- Tệp mới `game/js/su_kien.js`, bảng số `G.SU_KIEN` trong `data.js` (mã, vùng, W, rủi ro, số thưởng).
- Có cờ tắt `?sukien=0`.
- Luật rút theo mục 5.3. Lưu `sv.suKien = { gan: [], da: {}, bong: 0 }` (`engine.js` chuẩn hoá, `luu_luot.js` lưu dở lượt).
- `stage.js`:
  - `clearRoom`: thêm prop `{ type: 'suKien', act: 'suKien' }`;
  - `interact`: thêm nhánh cho sự kiện;
  - `S.mode = 'suKien'` và bảng vẽ chung `panelSuKien()` (2–4 nút, giống `panelCurse`).
- `mapgen.js`: `SIDE` có trọng số + loại `event`; sửa `M.check`, `minimap.js` biểu tượng.
- Sự kiện làm ở phiên này: 1, 2, 4, 5, 6, 8, 11, 15, 16, 18, 22. Có ngân hàng **40 câu đố** cho số 4, kèm bản tiếng Anh trong `ngon_ngu_en.js`.
- **Hệ "phúc" tạm thời đến hết ải** (`S.phuc`: sát thương, tốc, máu tối đa, linh khí, bùa hộ thân). Dùng chung cho rương, nguyền, thương nhân, sự kiện.
- Chưa có ảnh thì vẽ hình đơn giản bằng code (như đồ vật cũ), có ảnh thì dùng `gdAnh('sk-...')`.

### 7.2 Phiên B: rương / lời nguyền / thương nhân (song song với A)

- `chestOptions` rút 3 món trong 10, có rương đồng. `panelCurse` hiện 2 chọn 1 cùng 8 lời nguyền. `panelMerchant` bán bình máu + 3 món ngẫu nhiên, có giảm giá và quà khi hết vàng. Sửa thưởng thử thách.
- Số nằm hết trong `data.js`: `G.RUONG`, `G.CURSES` mở rộng, `G.THUONG_NHAN`.
- Cờ quay lui `?ruongcu=1`.
- **Đụng chung với A:** `stage.js`. Quy ước: B chỉ sửa 3 hàm `chestOptions` / `panelChest`, `panelCurse`, `panelMerchant`. A chỉ thêm nhánh mới. Hệ `S.phuc` do A làm; B chờ A, hoặc tạm dùng `S.marksMult` / `P` trực tiếp rồi chuyển sau.

### 7.3 Phiên C: sự kiện có cơ chế trong trận + nối ảnh (sau A)

- Gồm: ma trơi (3), chợ âm (7), tre ngà (9), cóc mưa (17), rồi đợt 2: 10, 12, 13, 14, 19, 20, 21.
- Lời nguyền "Đêm không trăng" (lớp tối quanh Zed), "Bầy đông", "Trùm nổi giận sớm".
- Đồng hành (chim Lạc, hổ): dùng lại khung "bóng phân thân" của bộ Ninja (`bo_skill.js`) cho mục tiêu và đường đi.
- Nối ảnh `sk-*` khi chủ game gen xong.

### 7.4 Ảnh hưởng kinh tế và cách bot đo lại

- **Ước tính:**
  - Sự kiện +1,2 mỗi lượt × ~100 vàng quy đổi, tức +120 mỗi lượt.
  - Rương +15%.
  - Lời nguyền: tổng giữ gần như cũ ("Khô bình" giảm, thêm nguyền có thưởng khác loại).
  - Cộng lại: **+10–14% giá trị mỗi lượt**, kéo số lượt cày tới Thức tỉnh giảm khoảng 2–3 lượt trên 30. Nếu chủ game muốn giữ nhịp cày cũ thì hạ `ROI_MOI.vk` 10%.
- **Đo lại:**
  1. Mở rộng `cong-cu/do-su-kien.js`: đọc `G.SU_KIEN` / `G.RUONG`, in "bất ngờ mỗi lượt" (mục tiêu ≥ 5 người đi hết, ≥ 3 người vội), "lựa chọn thật mỗi lượt" (mục tiêu ≥ 3), "lượt sau giống lượt trước" (mục tiêu ≤ 2%).
  2. Thêm mục "sự kiện" vào `tools/can-bang/tinh.js` (giá trị kỳ vọng mỗi lượt). So mốc Mầm / Thành hình / Thức tỉnh với bản cũ, lệch không quá 10%.
  3. Bot chơi thật `game/tests/cay.py` với `G.botCfg.suKien = 'an-toan' | 'tham'`: tỉ lệ thắng trùm không tụt quá 5 điểm % do nguyền / sự kiện rủi ro.

---

## 8. Câu hỏi cần chủ game quyết

| # | Câu hỏi | Đề xuất |
|---|---|---|
| 1 | Mỗi ải bao nhiêu sự kiện? | **1 chắc chắn** + 20% phòng phụ là "Sự kiện lớn" (độ khó 2: thêm 60% một cái nữa) |
| 2 | Có sự kiện rủi ro (mất máu, thêm quái) không? | **Có**, nhưng luôn có lựa chọn an toàn, thua vẫn có quà an ủi |
| 3 | Có trò may rủi tốn vàng (đặt cược) không? | **Không**. Giếng, hũ, niêu luôn cho quà, chỉ khác loại |
| 4 | Câu đố của Cuội: ai soạn? | Claude soạn 40 câu đố dân gian dễ cho trẻ (kèm tiếng Anh), chủ game duyệt |
| 5 | Rương: tăng linh khí hay giảm quặng để hai món ngang nhau? | **Cả hai nhẹ:** linh khí 12/16/22, quặng 4/6/8 |
| 6 | "Khô bình" gần như miễn phí: hạ thưởng hay bỏ? | Hạ còn ×1,5 + 40 vàng, chỉ hiện khi còn bình |
| 7 | Thương nhân có luôn bán bình máu không? | **Có** + 3 món ngẫu nhiên. Hết vàng thì tặng nắm xôi |
| 8 | Có làm "Sổ chuyện dân gian" ở làng (sưu tập sự kiện đã gặp) không? | Có, nhưng để đợt sau (sau phiên C) |
| 9 | Tổng thưởng tăng ~12%: chấp nhận hay hạ chỗ khác? | Chấp nhận (game đang thiếu cảm giác "trúng quà"). Bot đo lại, lệch quá 10% thì hạ `ROI_MOI.vk` |
| 10 | Gen ảnh theo lô hay từng ảnh? | 2 lô lưới (13 NPC, 15 đồ vật) như phiên Phòng A1 |

---

## 9. Phần kỹ thuật

### 9.1 Chỗ code đã đọc

| Chỗ code | Nội dung |
|---|---|
| `game/js/mapgen.js` | `SIDE`, `genA/B/C`, `M.check` (bộ 8 phòng cố định), `M.walk` |
| `game/js/stage.js` | `startStage` (ải hướng dẫn đổi phòng phụ), `buildRoom` (prop từng loại phòng; `S.shop.el`, `S.curseOffer = G.pick(G.CURSES)`), `clearRoom` (thưởng thử thách), `chestOptions`, `interact`, `settle` (thưởng qua ải), `panelChest/Merchant/Curse` |
| `game/js/data.js` | `G.ROI_MOI`, `G.DROP`, `G.CURSES`, `G.LINHKHI`, `G.ROOM_WAVES`, `G.DA_TOI_QUANG`, `G.EP_DO.bua`, `G.DOI_NL` |
| `game/js/combat.js` | linh khí khi quái gục: `n * P.markMult * W.marksMult` (lời nguyền nhân cả tinh anh, trùm) |
| `game/js/vk_moi.js` | `thuongVk / thuongTrum / thuongAo / thuongAoTrum` |
| `game/js/upgrade.js` | `U.VAL` (quy đổi giá trị) |
| `game/js/luu_luot.js` | lưu dở lượt có `curse` |

### 9.2 Giả định của bot

- Thứ tự phòng lấy theo `M.walk(map, false)` (người đi hết) và `M.walk(map, true)` (người vội).
- Số quái tính bằng bản chép của `buildWaves`.
- Linh khí kết liễu quái dính hệ là 16,4 mỗi lượt, chia đều theo quái (`tinh.js` mục 5). Thực tế phụ thuộc tay người chơi.
- Người tính toán chọn quặng ở rương.
- Rơi ngẫu nhiên theo đúng tỉ lệ trong code.
- 100 lượt mỗi vùng, rải đều ải 1–5, hạt ngẫu nhiên cố định 20261015 (chạy lại ra cùng số).

### 9.3 Số thô

Ở `cong-cu/ra/so-lieu.json`:

- `phongPhu`: đếm loại phòng phụ;
- `nguyen.lkThemTB`: linh khí thêm trung bình nhờ lời nguyền;
- `batNgoMoiLuot`: thứ bất ngờ mỗi lượt;
- `giongHetLuotTruoc`: lượt sau giống hệt lượt trước;
- `chuoiDaiNhatKhongGap`: chuỗi lượt dài nhất không gặp một loại phòng phụ.

### 9.4 Lỗi nhỏ thấy khi đọc (chưa sửa)

`stage.js` `clearRoom`: `G.rnd() < 0.5 ? G.DA_TOI_QUANG || 6 : 6` luôn ra 6.
