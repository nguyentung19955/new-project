# Thiết kế "Luyện vũ khí" 1–15 + gọn tiền tệ + bỏ tụt bậc (16/10)

Theo quyết định 5, 6, 7 trong [QUYET-DINH-TU-VAN-16-10.md](../QUYET-DINH-TU-VAN-16-10.md). Phiên này **chỉ thiết kế và tính số**, chưa sửa code game.

- Mô hình số: [mo_hinh.js](mo_hinh.js). Chạy bằng lệnh `node docs/review/ke-hoach-cai-thien/luyen-vu-khi/mo_hinh.js`. Kết quả đầy đủ nằm ở [ket-qua-mo-hinh.txt](ket-qua-mo-hinh.txt).
- Mô hình dùng lại đúng bảng số trong `game/js/data.js` và mô hình chiến dịch của `tools/can-bang/tinh.js`. Thu nhập giữ y nguyên, chỉ đổi ví tiền và cách tiêu.
- Số hiện tại đo bằng bot (`tests/cay.py --node --ngay=8 --viec`, 4 lượt): đi hết 15 ải mất trung bình **38 lần chơi, khoảng 174 phút**. Lúc qua 3-5 bot vẫn còn dư 242 quặng, 672 linh khí và 67/62/30 nguyên liệu vùng, tức là tiền đang bị dồn lại không có chỗ tiêu.

---

## Tóm tắt 1 phút

- **Một đường duy nhất: Luyện vũ khí cấp 1 → 15**, thay cho 4 thứ hiện nay (cấp hệ, mài +0..+15, lò rèn 4 cấp, ép đồ 7 bậc).
  - Lần nào luyện cũng thành công. Không tụt cấp. Không còn bùa.
  - Mỗi món vũ khí luyện riêng, như bây giờ.
- **Mốc:**
  - Cấp 3 là Mầm (chọn hệ).
  - Cấp 6 là Thành hình.
  - Cấp 9 là Tinh luyện (mở hiệu ứng riêng của từng loại vũ khí).
  - Cấp 12 là Thức tỉnh.
  - Cấp 15 là Viên mãn.
  - Bốn hình thái Trắng / Mầm / Thành hình / Thức tỉnh và tên của phiên Vũ khí C giữ nguyên, chỉ gắn vào cấp 1 / 3 / 6 / 12.
- **Chỉ còn 3 loại tiền: vàng, linh khí, nguyên liệu rèn.**
  - Quặng, đá nâng bậc và đá mài gộp thành nguyên liệu rèn.
  - Gỗ linh, Vảy cá, Đá lửa và mảnh trùm không còn là ví tiền riêng. Chúng trở thành "thành phần" mà một số cấp đòi thêm.
- **Thời gian cày:** mô hình cho **30 lượt, so với 31 lượt bây giờ**, để đi hết 3 vùng. Sức mạnh lúc tới từng ải gần như trùng với hiện tại (lệch dưới 3%). Nhờ vậy không phải cân lại quái hay trùm.
- **Trần sức mạnh:** cấp 15 bằng ×5,7.
  - Trần hiện nay là ×6,2, hoặc khoảng ×7,4 nếu tính cả 4 dòng hiệu ứng ép đồ.
  - Như vậy trần hạ nhẹ, nhưng đường sức mạnh lúc chơi truyện giữ nguyên.
  - ChatGPT nói "×2,8" là chưa tính phần mài.
- **Bản lưu cũ:** đổi sang cấp Luyện gần nhất. Không ai tụt quá 7%; phần lớn bằng hoặc mạnh hơn một chút. Lò rèn được hoàn đủ, chỗ tiêu dư cũng được hoàn.
- Có **3 câu hỏi A/B** cho chủ game ở mục 6.

---

## 1. Bảng Luyện vũ khí 1–15

**Cách đọc bảng:**

- **M** là sức mạnh của món vũ khí so với lúc mới có (cấp 1 = ×1).
- Giá trong bảng là giá **để lên cấp đó từ cấp trước**, tính cho **một món**.
- **NLR** là nguyên liệu rèn.
- **Thành phần** là nguyên liệu vùng hoặc mảnh trùm cần thêm.
- **Khung ô** là màu khung ô đồ, dùng lại 7 ảnh `gd-o-ep-0..6` của phiên Vũ khí A.

| Cấp | M | Vàng | Linh khí | NLR | Thành phần | Mở gì / hình thái | Khung ô |
|---|---|---|---|---|---|---|---|
| 1 | ×1,00 | – | – | – | – | **Trắng** (tập sự) | Trắng |
| 2 | ×1,15 | 100 | 10 | 5 | – | | Trắng |
| **3** | ×1,35 | 150 | 80 | 10 | 4 Gỗ linh | **Mầm**: chọn Lửa/Độc/Băng, 20% mỗi đòn gây hiệu ứng hệ, vệt chém màu hệ. Đổi dáng | Xanh lam |
| 4 | ×1,55 | 250 | 40 | 15 | 3 Gỗ linh | | Xanh lam |
| 5 | ×1,75 | 350 | 50 | 20 | 3 Gỗ linh | *(trần trước Mộc Tinh)* | Xanh lam |
| **6** | ×2,05 | 500 | 160 | 28 | 6 Gỗ linh + **1 mảnh Mộc Tinh** | **Thành hình**: đặc trưng hệ thứ nhất (vệt cháy / vũng độc / gai băng), tỉ lệ hệ 50%. Đổi dáng | Xanh lục |
| 7 | ×2,35 | 600 | 60 | 32 | 4 Vảy cá | | Xanh lục |
| 8 | ×2,65 | 700 | 70 | 38 | 4 Vảy cá | | Xanh lục |
| **9** | ×3,00 | 850 | 100 | 45 | 8 Vảy cá | **Tinh luyện**: mở hiệu ứng riêng của loại (kiếm +10% tốc đánh, thương +12% tầm, búa +30% choáng, phi tiêu +20% sát thương lên con thứ hai và xuyên thêm 1 quái). *(Trần trước Ngư Tinh)* | Tím |
| 10 | ×3,35 | 950 | 80 | 50 | 4 Vảy cá + **1 mảnh Ngư Tinh** | | Tím |
| 11 | ×3,70 | 1.000 | 90 | 55 | 5 Đá lửa | *(trần trước Hồ Tinh)* | Tím |
| **12** | ×4,50 | 1.350 | 290 | 65 | 10 Đá lửa + **1 mảnh Hồ Tinh** | **Thức tỉnh**: đặc trưng hệ thứ hai (nổ lan / lây độc / băng vỡ), tỉ lệ hệ 100%. Đổi dáng | Vàng |
| 13 | ×4,90 | 1.300 | 100 | 70 | 6 Đá lửa | *(trần trước Thuồng Luồng)* | Vàng |
| 14 | ×5,30 | 1.450 | 120 | 75 | 6 Gỗ linh + **1 mảnh Thuồng Luồng** | | Đỏ |
| **15** | ×5,70 | 1.850 | 200 | 90 | 10 Vảy cá + **2 mảnh Thuồng Luồng** | **Viên mãn**: chọn 1 trong 3 dòng cố định (chí mạng +8% / sát thương lên trùm, tinh anh +16% / hồi chiêu đặc biệt −12%), đổi dòng miễn phí ở lò. Có hào quang ngắn mỗi lần tung chiêu đặc biệt (chỉ lúc tung chiêu, không chạy liên tục) | Rực lửa |
| **Cộng 1→15** | | **11.400** | **1.450** | **598** | 37 Gỗ linh, 34 Vảy cá, 21 Đá lửa, 1+1+1+3 mảnh | | |

**Luật:**

- **Không có tỉ lệ thất bại, không tụt cấp.** Đủ đồ là bấm "Luyện" và lên cấp ngay. Bỏ hẳn bùa giữ bậc, điểm may mắn và việc đổi dòng ngẫu nhiên.
- **Giới hạn theo truyện**, tính bằng số trùm vùng đã hạ:

  | Đã hạ | Cấp Luyện tối đa |
  |---|---|
  | chưa hạ trùm vùng nào | 5 |
  | Mộc Tinh | 9 |
  | Ngư Tinh | 11 |
  | Hồ Tinh | 13 |
  | Thuồng Luồng | 15 |

  Cấp đầu tiên vượt mỗi mốc (cấp 6, 10, 12, 14) cần mảnh của trùm đó. Vì vậy giới hạn tự hiện ra ở dạng "cần 1 mảnh Mộc Tinh", không cần thêm luật khác. Dòng khoá trên giao diện ghi rõ "Cần hạ Mộc Tinh".
- **Mảnh trùm có thưởng bảo đảm:** hạ trùm vùng **lần đầu** được **5 mảnh** (hiện nay là 3). Đánh lại vẫn được 3 mảnh như cũ.
  - 5 mảnh lần đầu đủ cho bộ đồ cấp 2 (3 mảnh) và 2 món vũ khí qua mốc (mỗi món 1 mảnh).
  - Không bao giờ bị kẹt vì thiếu một món hiếm mà không rõ cách kiếm.
- **Vùng 4 không có nguyên liệu riêng** (quyết định Q2 = A của Bước 3). Cấp 14 và 15 vì vậy dùng lại Gỗ linh và Vảy cá.
- **Đổi hệ** vẫn tốn linh khí như bây giờ: 20 ở Mầm, 60 ở Thành hình, 120 ở Thức tỉnh.
- **Sau mỗi lần luyện, nói rõ thay đổi** (quyết định 4), ví dụ "Kiếm răng sói Lv 8 → 9: đòn +2 sát thương, mở +10% tốc đánh".
- **Vì sao chia mốc như vậy:** truyện có 4 vùng mà chỉ có 4 hình thái. Mô hình cho thấy người chơi đang lên Thành hình quanh đầu vùng 2 (ải 2-2) và lên Thức tỉnh quanh trùm vùng 3. Cấp 6 và cấp 12 rơi đúng hai chỗ đó.
  - Cấp 9 và 15 không đổi dáng mà mở hiệu ứng, kèm đổi màu khung ô. Chủ game không phải vẽ thêm hình mới.
  - Cấp 13–15 là mục tiêu của vùng 4, độ khó 2 và chơi sau truyện.
- **"Mảnh tiến độ 25%/50%"** (đề xuất mục 4 của phiên Vũ khí C) khớp tự nhiên với các cấp giữa hai mốc. Ví dụ ở cấp 4–5, vũ khí Mầm hiện thêm đường gân.
  - Khi nào có 12 ảnh "gân" thì gắn vào. Chưa có ảnh thì chỉ hiện thanh tiến độ.

---

## 2. Đường sức mạnh tổng

### 2.1. Trần hiện nay, tính ra số

| | Hệ số |
|---|---|
| Cấp hệ Thức tỉnh | ×1,60 |
| Mài +15 (+8% mỗi cấp) | ×2,20 |
| Ép Rực lửa (tính cả phần phụ của loại) | ×1,75 |
| **Nhân lại** | **×6,16** |
| Cộng 4 dòng hiệu ứng ở hệ số Rực lửa | khoảng ×1,2, tức **khoảng ×7,4** |
| Lò rèn | không cộng sức mạnh, chỉ mở trần mài |

- ChatGPT tính ra ×2,8 vì chỉ nhân 1,6 với 1,75, bỏ quên phần mài ×2,2.
- Trên thực tế, người chơi cuối vùng 3 thường có Thức tỉnh +15 bậc Vàng = **×4,93**. Ai lên được Đỏ thì là ×5,46. Rực lửa cần trung bình 339 đá nâng bậc và gần 11.000 vàng, bot chưa lần nào đạt tới.

### 2.2. Đề xuất: giữ đường, chỉ cắt đuôi (phương án A, khuyên dùng)

Máu quái, đòn trùm và "Sức mạnh khuyên dùng" của 15 ải đều đã được đo bằng bot ở đúng mức sức mạnh hiện nay. Vì thế bảng Luyện được chọn sao cho **lúc tới mỗi ải, người chơi mạnh y như bây giờ**:

| Lúc tới ải | Hiện tại: kiếm (M) | Luyện mới | Sức mạnh cũ / mới | Lượt cày thêm cũ / mới |
|---|---|---|---|---|
| 1-3 | Mầm +2 Xanh lam (×1,44) | Cấp 3 (×1,35) | 127 / 126 | 0 / 0 |
| 1-5 | Mầm +5 Xanh lam (×1,74) | Cấp 5 (×1,75) | 164 / 163 | 1 / 1 |
| 2-3 | Thành hình +6 Tím (×2,56) | Cấp 7 (×2,35) | 235 / 234 | 1 / 2 |
| 2-5 | Thành hình +8 Tím (×2,83) | Cấp 9 (×3,00) | 277 / 281 | 1 / 1 |
| 3-3 | Thành hình +9 Tím (×2,97) | Cấp 9 (×3,00) | 374 / 379 | 3 / 3 |
| 3-5 | Thành hình +10 Vàng (×3,40) | Cấp 11 (×3,70) | 472 / 470 | 6 / 5 |
| **Cả 15 ải** | | | | **31 / 30 lượt** |

Bảng đủ 15 dòng nằm ở mục B của [ket-qua-mo-hinh.txt](ket-qua-mo-hinh.txt). Sức mạnh mới khi tới từng ải lệch không quá 3% so với cũ.

- **Trần mới ×5,7** nằm giữa bậc Đỏ (×5,46) và Rực lửa (×6,16). Không còn 4 dòng ngẫu nhiên, nên trần thật giảm khoảng 20–25% so với trần lý thuyết hiện nay.
- **Phần bị cắt chỉ nằm ở cuối game**, chỗ người chơi phải dồn hàng trăm đá để quay may rủi.
- **Cảm giác lên cấp không đến từ hệ số nhân to hơn.** Nó đến từ hình thái mới (cấp 3, 6, 12), hiệu ứng mới (cấp 9, 15) và màu khung mới.

**Phương án B (giảm trần còn ×2,8 như ChatGPT lo):**

- Phải chia mọi M cho khoảng 2. Lúc đó máu quái từ vùng 2 trở đi phải giảm 40–50%, và phải đo lại toàn bộ Sức mạnh khuyên dùng bằng bot.
- Người chơi chỉ thấy số nhỏ hơn, độ khó thì như cũ. Phải làm lại cân bằng một lần nữa mà không được thêm gì. **Không khuyên.**

### 2.3. Máu +6% mỗi cấp (ChatGPT đề xuất cả 40 cấp chỉ cộng 35–45%)

Hiện nay Zed cấp 40 có ×3,34 máu gốc (+234%). Muốn còn +43% thì mỗi cấp chỉ được +1,1%. Đổi như vậy kéo theo các con số sau:

| Vùng (cấp lúc đánh trùm) | Máu Zed: 6% / 1,1% | Đòn trùm gốc | % máu mỗi đòn: nay / nếu đổi | Phải nhân đòn quái và trùm | Phải nhân Sức mạnh khuyên dùng |
|---|---|---|---|---|---|
| Rừng già (cấp 6) | 143 / 116 | 39 | 27% / 34% | ×0,81 | ×0,90 |
| Hang biển (cấp 15) | 202 / 127 | 88 | 43% / 69% | ×0,63 | ×0,79 |
| Lâu đài cổ (cấp 26) | 275 / 140 | 195 | 71% / **139%** (một đòn là chết) | ×0,51 | ×0,71 |
| Sông sâu (cấp 35–40) | 334–367 / 151–157 | 216 | 65% / **143%** | ×0,45 | ×0,67 |

**Nói thẳng:** nếu đổi máu, phải sửa cùng lúc 4 chỗ:

1. Sát thương quái theo vùng (`DMG_RANGE`, cột sát thương của `G.STAGE_K`). Đòn riêng của trùm cũng tính từ số này nên đi theo.
2. Mọi đòn có số sát thương cố định trong `js/chieu_trum.js` và kỹ năng quái vùng, nếu có số tuyệt đối.
3. `G.STAGE_REC`, `G.DIFF2_REC`, độ khó 2.
4. Chạy lại bot `--kd` để đo Sức mạnh khuyên dùng.

Những thứ tính theo % máu thì không cần sửa: bình máu 30%, khiên nước 10%, hút máu 1%, nhựa rừng 1%/giây.

Kết quả chơi gần như y hệt, chỉ đổi con số trên màn hình. **Khuyên giữ +6%** ở bản này. Nếu muốn nhân vật bớt "phình" theo cấp, nên làm sau, gộp với lần cân lại vùng 4. Sát thương theo cấp (+1,5% mỗi cấp, +58% ở cấp 40) cũng nên giữ, cùng lý do. (Câu hỏi Q2.)

---

## 3. Kinh tế 3 tiền tệ

### 3.1. Đổi ví

| Hiện nay | Sau khi gộp |
|---|---|
| Vàng | **Vàng** (giữ) |
| Linh khí (túi chung) | **Linh khí** (giữ) |
| Quặng | **Nguyên liệu rèn** 1:1 |
| Đá nâng bậc | **Nguyên liệu rèn** 1:2 (1 đá = 2 NLR) |
| Bùa giữ bậc | bỏ. Bùa đang có đổi thành 6 NLR mỗi bùa |
| Đá tôi (đã bỏ từ đợt 4) | không đổi gì (bản lưu cũ đã quy ra quặng) |
| Gỗ linh / Vảy cá / Đá lửa | **thành phần** (vẫn đếm, nhưng chỉ là nguyên liệu trong công thức, không phải ví để tiêu chung) |
| Mảnh trùm (theo vùng) | **thành phần** (bộ đồ cấp 2/3, Luyện cấp 6/10/12/14/15) |

**Vì sao 1 đá = 2 NLR:** trong chiến dịch hiện nay, mỗi viên đá nâng bậc đẩy sức mạnh lên khoảng gấp đôi một cục quặng. Ép tới Vàng tốn 54 đá cho ×1,4. Mài tới +15 tốn 184 quặng cho ×2,2.

### 3.2. Thu nhập mỗi lượt

Số kỳ vọng, đã quy ra tiền mới. Ngoài ngoặc là khi chơi lại, trong ngoặc là lần đầu.

| Vùng | Ải thường: vàng / LK / NLR / nguyên liệu vùng | Trùm vùng: vàng / LK / NLR / nguyên liệu vùng / mảnh |
|---|---|---|
| Rừng già | 242 / 41 (56) / 10 (14) / 7 | 568 (738) / 69 (82) / 13 (21) / 9 / 3 (**5**) |
| Hang biển | 406 / 47 / 12 (16) / 7 | 731 (901) / 74 (87) / 17 (27) / 9 / 3 (**5**) |
| Lâu đài cổ | 578 / 54 / 16 (20) / 7 | 905 (1.075) / 82 (95) / 21 (33) / 9 / 3 (**5**) |
| Sông sâu | 750 / 62 / 18 (24) / 7 | 1.070 (1.240) / 88 (101) / 25 (39) / 9 / 3 (**5**) |

Nguồn khác (cùng lượng như hiện nay, chỉ đổi tên tiền):

- **Việc hôm nay:** quặng thành NLR. Rương ngày cho 1/1/2 đá, tức 2/2/4 NLR, cộng linh khí như cũ.
- **Rương tuần:** 1 bùa + 5/8/12 đá đổi thành 16/22/30 NLR.
- **Sổ yêu quái:** mỗi đá thành 2 NLR.
- **Thành tựu:** đá thành 2 NLR, quặng thành NLR, bùa thành 6 NLR. Vàng và linh khí giữ.
- **Rương báu:** túi linh khí, giữ nguyên.
- **Phần thưởng cuối ải** (15% ra 6 quặng): thành 6 NLR.
- **Thương nhân trong ải:** "3 quặng / 100 vàng" thành "3 NLR / 100 vàng". Bỏ món bùa giữ bậc 600 vàng.
- **Bà Hàng Xén:** thẻ "Quặng" thành thẻ "Nguyên liệu rèn", cùng giá 40 vàng mỗi cái, tối đa 15 cái một ngày. Thẻ "Nguyên liệu" (đổi vàng lấy Gỗ linh / Vảy cá / Đá lửa) giữ nguyên.

### 3.3. Ải theo ngày

| Hiện nay | Đề xuất |
|---|---|
| Ải Đá Bậc: T7, CN, T2, T4; 3/5/8 đá mỗi lượt (6/10/16 NLR) và bùa 10% ở mức Khó | **Gộp thành "Ải Rèn"**: T2, T3, T4, T6, T7, CN (6 ngày); **14/19/25 NLR** mỗi lượt |
| Ải Đá Mài: T3, T6, T7, CN; 14/18/22 quặng mỗi lượt | (gộp vào Ải Rèn ở dòng trên) |
| Ải Vàng: T5, T6, T7, CN; 520/800/1.100 | Giữ nguyên |

- NLR mỗi tuần từ ải ngày: cũ 240/336/456, mới **252/342/450**, gần như bằng nhau.
- Thứ 5 chỉ có Ải Vàng. Cuối tuần có cả hai ải.
- Quái, số đợt, 3 lượt mỗi ngày, mức mở theo trùm: giữ như cũ. Chỉ đổi tên, thưởng và ảnh nút. Nút dùng lại ảnh nút Ải Đá Mài.

### 3.4. Chi theo cấp và số lượt cày

Giá cộng dồn cho **một món**:

| Mốc | Vàng | Linh khí | NLR |
|---|---|---|---|
| Đến Mầm (cấp 3) | 250 | 90 | 15 |
| Đến Thành hình (cấp 6) | 1.350 | 340 | 78 |
| Đến cấp 9 | 3.500 | 570 | 193 |
| Đến Thức tỉnh (cấp 12) | 6.800 | 1.030 | 363 |
| Đến cấp 15 | 11.400 | 1.450 | 598 |

So với hiện nay, một món đi từ Trắng tới Thức tỉnh +15 Vàng tốn:

- 1.200 linh khí;
- khoảng 7.900 vàng (cộng 2.300 vàng nâng lò, tính chung một lần);
- 184 quặng + 20 quặng lò;
- khoảng 54 đá.

Quy ra tiền mới, phần quặng và đá là khoảng 290 NLR. Món đó đổi sang được cấp 14, giá mới là 9.550 vàng, 1.250 linh khí và 508 NLR. **Giá mới cao hơn, vì có thêm cấp 13–15 để cày ở vùng 4.**

Tới cấp 11 (bằng Thành hình +12 Vàng), giá mới là 5.450 vàng, 740 LK và 298 NLR. Giá cũ là khoảng 5.760 vàng, 400 LK và 244 NLR, cộng thêm lò 2.300 vàng.

- Vàng rẻ hơn rõ, nhờ bỏ lò.
- Linh khí và NLR đắt hơn một chút. Linh khí trước đây chỉ dùng cho cấp hệ, nên dư (bot còn 672 khi qua 3-5). NLR thì dùng hết chỗ quặng đang dồn.
- Không còn mất đá vì ép hỏng.

Cộng lại, người chơi cày bớt được khoảng 1 lượt.

**Mô phỏng chiến dịch** (kiếm là món chính, phi tiêu là món phụ đi sau tối đa 2 cấp, có mua bộ, có việc ngày, sổ, thành tựu, ải ngày 8 lượt một ngày):

| | Hiện tại (tinh.js) | Luyện mới |
|---|---|---|
| Vùng 1: lượt cày thêm | 1 | 1 |
| Vùng 2 | 6 | 6 |
| Vùng 3 | 9 | 8 |
| **Tổng lượt đi hết 15 ải** | **31** | **30** |
| Kiếm lên Mầm / Thành hình / Thức tỉnh | lượt 2 / 11 / 31 (ngay trước 3-5) | lượt 2 / 11 / 32 (cấp 12 cần mảnh Hồ Tinh, nên lên ngay sau khi hạ Hồ Tinh, đầu vùng 4) |
| Thu cả chiến dịch | 18.636 vàng · 1.968 LK · 116 đá + quặng | 17.937 vàng · 1.905 LK · 685 NLR |
| Chi cho vũ khí (luật mới) | | 10.900 vàng · 1.480 LK · 596 NLR (NLR gần như tiêu hết, không còn dồn như quặng bây giờ) |

- Nếu phi tiêu bám sát kiếm (đi sau tối đa 1 cấp) thì vẫn 30 lượt.
- **Vùng 4** chỉ có mô hình cho luật mới, vì `tinh.js` chưa mô hình vùng 4. Lúc tới 4-1 kiếm đang ở cấp Luyện 11, lên 12 ở 4-3 và lên 13 ở 4-5. Đi hết vùng không phải cày thêm (20 ải tổng cộng 35 lượt). Lúc tới 4-5, Sức mạnh 622 so với khuyên dùng 690, tức khoảng 90%. Cấp 14–15 để dành cho sau Thuồng Luồng.
- Số khuyên dùng vùng 4 vẫn là "số xuất phát". Phiên đo bot vùng 4 sẽ chốt lại.

**Giới hạn của mô hình:**

- Đây là mô hình kỳ vọng, không tính kỹ năng tay người chơi.
- Thời gian thật (khoảng 174 phút theo bot) phải đo lại bằng `tests/cay.py --node` sau khi code xong (phiên 3).
- Mục tiêu khi đo bot: số lần chơi không vượt 38 lần (con số hiện nay), và không ải nào phải chơi quá 9 lần.

---

## 4. Chuyển bản lưu cũ

Làm **một lần** khi nạp bản lưu, có cờ `sv.luyenChuyen = 1`. Trước khi chuyển, chép nguyên bản lưu sang khoá `linhkhi_save_v1_truoc_luyen`, giống cách đã làm ở đợt hệ mới.

### 4.1. Cấp Luyện của mỗi vũ khí

1. Tính **M cũ** = hệ số cấp hệ × (1 + 0,08 × mài) × tổng bậc ép. Cộng thêm 2,5% cho mỗi dòng ép đang có (Tím 1 dòng … Rực lửa 4 dòng), vì các dòng này sẽ bị bỏ.
2. Lấy cấp Luyện có M **gần nhất** với số trên. Nếu cấp đó vẫn thấp hơn quá 7% thì lên thêm 1 cấp.
3. **Giữ hình thái đã có:** Mầm thì ít nhất cấp 3, Thành hình ít nhất cấp 6, Thức tỉnh ít nhất cấp 12. Nhưng không cho nhảy quá 2 cấp so với bước 2.
   - Nếu không giữ được (ví dụ Thức tỉnh +0, gần như không ai có), hình thái hạ xuống và **linh khí thừa được hoàn lại**.
4. Tối đa cấp 15.
5. Cấp đổi ra có thể cao hơn giới hạn truyện hiện tại của người chơi. Khi đó **giữ nguyên**, chỉ không luyện tiếp được cho tới khi hạ trùm kế.

Ví dụ (mục D của [ket-qua-mo-hinh.txt](ket-qua-mo-hinh.txt)):

| Vũ khí cũ | M cũ | → Cấp Luyện | Chênh | Hoàn |
|---|---|---|---|---|
| Trắng +3 Xanh lam | ×1,34 | 3 (×1,35) | +1% | 150 vàng, 3 NLR |
| Mầm +2 Xanh lam | ×1,44 | 3 (×1,35) | −6% | – |
| Mầm +5 Xanh lam | ×1,74 | 5 (×1,75) | +1% | – |
| Thành hình +3 Xanh lam | ×1,81 | 6 (×2,05) | +13% | 60 LK |
| Thành hình +6 Tím | ×2,56 | 8 (×2,65) | +4% | – |
| Thành hình +12 Vàng | ×3,70 | 11 (×3,70) | 0% | – |
| Thức tỉnh +15 Vàng | ×4,93 | 14 (×5,30) | +8% (bù 2 dòng mất) | – |
| Thức tỉnh +15 Đỏ | ×5,46 | 15 (×5,70) | +4% | – |
| Thức tỉnh +15 Rực lửa | ×6,16 | 15 (×5,70) | **−7%** (cộng mất 4 dòng) | **5.447 vàng, 257 NLR** |
| Trắng +15 Rực lửa (lạ) | ×3,85 | 12 (×4,50) | +17% | 10.047 vàng, 492 NLR |

**Kiểm cả chiến dịch:** lấy bản lưu ở từng ải của chiến dịch hiện tại rồi chuyển. Sức mạnh mới so với cũ nằm trong khoảng **−1% … +5%** ở cả 15 ải. Không ai yếu đi thấy rõ.

Chỉ người đã lên Rực lửa là bị hạ trần, và được hoàn tiền. Bot chưa từng đạt Rực lửa.

### 4.2. Hoàn phần thừa

- **Từng vũ khí:** hoàn = phần đã tiêu theo luật cũ trừ giá Luyện mới của cấp nhận được. Chỉ hoàn phần dương, tính riêng vàng, linh khí và NLR.
  - Phần đã tiêu tính như sau: cấp hệ và mài theo đúng giá; ép đồ theo **giá kỳ vọng**, vì có tỉ lệ hỏng mà bản lưu không ghi số lần ép.
  - Nguyên liệu vùng đã tiêu cho mài không hoàn. Chúng đã đổi thành sức mạnh, và cấp mới thường cần ít hơn.
- **Lò rèn bị bỏ:** hoàn đủ phần đã nâng.
  - Lò cấp 2: 200 vàng + 6 Gỗ linh.
  - Lò cấp 3: thêm 600 vàng + 6 Vảy cá.
  - Lò cấp 4: thêm 1.500 vàng + 20 NLR + 10 Đá lửa.
- **Ví cũ:** quặng thành NLR (1:1), đá thành 2 NLR, bùa thành 6 NLR. Điểm may mắn và dòng ép bỏ (đã tính vào bước 1).
- **Bảng báo một lần** khi vào làng, ví dụ: "Lò rèn đã gộp thành Luyện vũ khí. Kiếm răng sói → Luyện 8. Hoàn: 2.300 vàng, 41 nguyên liệu rèn…".
- **Thành tựu đã nhận** giữ nguyên trạng thái (giữ mã). Thành tựu chưa nhận thì đổi điều kiện theo mục 5.

### 4.3. Giữ đường lui

Trong thời gian thử:

- Bản lưu **giữ nguyên các trường cũ**: `w.sharpen`, `w.ep`, `sv.ore`, `sv.daBac`, `sv.buaBac`, `sv.forge`, `w.marks`.
- Luật mới chỉ ghi các trường mới: `w.luyen`, `w.dongVM` (dòng Viên mãn), `sv.nlr`.
- Tắt cờ `?luyen=0` là chơi lại đúng bản cũ. Những gì đã luyện thêm trong lúc thử sẽ không còn.
- Khi chủ game chốt, phiên dọn mới xoá trường cũ.

---

## 5. Ảnh hưởng tới giao diện và việc code

### 5.1. Giao diện

| Chỗ | Đổi gì |
|---|---|
| **Ông Thợ Rèn** | Ba thẻ Linh khí / Mài / Ép đồ và nút nâng lò gộp thành **một thẻ "Luyện"**. Bảng giữ khung của phiên Vũ khí C: cột trái 4 ô vũ khí; thẻ phải gồm hình hiện tại ▶ hình kế, một thanh tiến độ, dòng "nâng xong đánh khác ra sao", và nút "Luyện lên N · giá". "Hình kế" nay là **mốc kế** (3/6/9/12/15). Thanh tiến độ đếm số cấp tới mốc đó. Mốc 9/15 không đổi dáng thì hiện hình hiện tại kèm khung màu kế và tên hiệu ứng. Dòng khoá: "Cần 1 mảnh Mộc Tinh — hạ Mộc Tinh ở Rừng già 5". |
| **Ô đồ khung màu (Vũ khí A)** | Giữ ảnh `gd-o-ep-0..6`, đổi cách chọn màu: theo cấp Luyện (bảng mục 1). **Số ở góc ô là cấp Luyện 1–15**, thay cho số bậc 1–6. Số 2 chữ số phải soát chỗ ở ô cỡ 20 và ô trong trận 54×35, có thể cần chữ nhỏ hơn. Bỏ `w.sharpen` khỏi tên (`G.wName` thôi ghi "+N"). |
| **Tên hình thái và ăn mừng (Vũ khí C)** | Bảng tên 4×4 giữ nguyên. Hình thái tính từ cấp Luyện: 1–2 Trắng, 3–5 Mầm, 6–11 Thành hình, 12–15 Thức tỉnh. **Ăn mừng 1,45 s** chạy ở cấp 3, 6, 12 (đổi dáng). **Ăn mừng ngắn khoảng 0,9 s** (không có pha "ráp hình", chỉ loé khung màu mới và tên hiệu ứng) chạy ở cấp 9 và 15. Cấp thường chỉ hiện dải "+1 · đòn +X" khoảng 0,5 s. Dòng ở màn kết quả: "Kiếm lá đồng Lv 4 → Kiếm răng sói (Lv 6): còn 2 cấp · thiếu 120 vàng". |
| **Hành trang › Vũ khí** | Cùng bảng Luyện, rút gọn. Bỏ dòng mài và bậc. |
| **Thanh tài nguyên ở làng** (`village_scene.js`) | Còn 3 ô: vàng, linh khí, NLR (biểu tượng dùng lại ảnh quặng, đổi chữ). Nguyên liệu vùng và mảnh chỉ hiện trong bảng Luyện, bảng bộ đồ và thẻ Nguyên liệu. |
| **Bà Hàng Xén, Thương nhân trong ải** | Thẻ Quặng đổi thành thẻ "Nguyên liệu rèn". Bỏ món bùa. |
| **Ải theo ngày** | Hai nút còn lại là "Ải Rèn" và "Ải Vàng". Chữ thưởng đổi theo. |
| **Sổ** (sổ yêu quái, gợi ý `G.HINTS`) | Thưởng sổ ghi NLR thay đá. Sửa gợi ý số 7 (bảy bậc ép đồ) và số 9 ("mài và ép đồ") thành câu về Luyện. |
| **Thành tựu liên quan** | `mam`: giữ, đổi điều kiện thành Luyện ≥ 3. `thucTinh1`: Luyện ≥ 12. `epTim` ("Ép đồ lên Tím"): đổi thành **"Tinh luyện: Luyện 1 vũ khí lên cấp 9"**. `epDo` ("Rực lửa", danh hiệu Thợ rèn lửa): đổi thành **"Viên mãn: Luyện 1 vũ khí lên cấp 15"**, giữ danh hiệu. `mai10` ("Mài sắc"): đổi thành **"Đủ bộ: Luyện cả 4 vũ khí lên cấp 6"** (khuyến khích dùng 4 món, hợp với đòn nối của phiên Vũ khí B). Thưởng đá đổi thành 2 NLR, bùa thành 6 NLR. Ảnh huy hiệu giữ (ô 9 đe, 10 lửa, 11 đá mài). |
| **Gợi ý nâng cấp và bảng thua** (`upgrade.js`) | Bỏ các mục mài, lò, ép. Thêm mục "Luyện X lên N". Ước tính "Sức mạnh +" theo bảng M. |
| **Lực chiến / Sức mạnh** | `G.wBase` dùng M của cấp Luyện thay cho 3 hệ số cũ. Gộp với quyết định 4 (một con số). |
| **Ảnh** | Không cần ảnh mới để chạy. Ảnh nên có (không bắt buộc): 12 ảnh "gân" (bao-cao-C mục 4), 1 biểu tượng NLR riêng nếu muốn khác quặng. Ảnh `gd-da-nang-bac`, `gd-bua-giu-bac`, `hu-ep-that-bai`, `hu-tut-bac` không còn dùng (để lại tới phiên dọn). |
| **Tiếng Anh** | Luyện = "Temper", NLR = "Forge materials", Ải Rèn = "Forge Trial", Viên mãn = "Perfected", Tinh luyện = "Refined". |

### 5.2. Việc code: chia 3 phiên, cờ tắt `?luyen=0`

Cờ là `G.LUYEN_BAT`. Đặt false thì toàn bộ luật, ví và giao diện cũ chạy y như hôm nay.

**Ngoại lệ:** "bỏ tụt bậc" là việc nhỏ, làm luôn ở phiên 1 cho **cả luật cũ** (`G.EP_DO.tutTu = 99`, ẩn bùa), có cờ riêng `?tutbac=1` để bật lại.

**Phiên 1: luật, ví, chuyển bản lưu** (ít giao diện)

1. `js/data.js`: thêm `G.LUYEN` (bảng mục 1), `G.LUYEN_TRAN`, `G.AI_NGAY.ai.ren`, `G.QUY_DOI = { da: 2, bua: 6 }`, thưởng mảnh lần đầu 5. Bỏ tụt bậc như ghi ở trên.
2. `js/luyen.js` (mới, nạp sau `vk_moi.js`, `ep_do.js`, `hinh_thai.js`):
   - `G.luyen.M(w)`, `gia(L)`, `tran(sv)`, `duoc(sv, w)`, `nang(sv, w)`, `hinhThai(L)`;
   - đặt `w.marks` theo hình thái để mọi mã đang đọc `G.wStage` và đặc trưng hệ chạy y như cũ;
   - bọc `G.wBase` để không cộng mài và ép khi cờ bật; `G.epDo.satThuong` trả 1; phần phụ loại và dòng Viên mãn đi qua đúng các móc của `ep_do.js` (`E.dong`, `E.xuyen`, `E.danh`).
3. Ví: `G.themNlr(sv, n)`. Đổi mọi chỗ cộng quặng, đá và bùa: `stage.js` (thưởng ải, thương nhân), `ai_ngay.js`, `viec_ngay.js`, `so_yeu_quai.js`, `thanh_tuu.js`, `upgrade.js` (bán quặng).
4. Chuyển bản lưu: bọc `G.fixSave` theo mục 4, kèm khoá sao lưu và bảng báo một lần.
5. Kiểm:
   - `tools/can-bang/tinh.js` thêm chế độ `--luyen`, lấy logic từ `mo_hinh.js` sang;
   - `tests/bot_nang.js` dạy bot luyện;
   - `tests/smoke.py`;
   - bài kiểm chuyển bản lưu (16 trường hợp ở mục 4, cộng bản lưu rỗng và bản hỏng);
   - đăng nhập Google, lưu mây, `?cloud=0`: lưu và nạp trường mới.

**Phiên 2: giao diện**

1. Ông Thợ Rèn: thẻ "Luyện" (`village.js`, `vk_moi_lang.js`, `hinh_thai.js`). Ẩn thẻ Mài, Ép đồ, nút lò khi cờ bật.
2. Khung ô theo cấp Luyện, số 1–15 (`ep_do.js` `E.o`/`E.soBac`, `vk_moi.js` `VM.icon`). Soát cỡ 20, 32, 54×35.
3. Ăn mừng 3 kiểu (dài, ngắn, dải +1). Dòng màn kết quả. Hành trang.
4. Thanh tài nguyên ở làng, Bà Hàng Xén, Thương nhân, ải ngày (Ải Rèn), `G.HINTS`, chữ thành tựu, `upgrade.js` gợi ý, tiếng Anh.
5. Ảnh soát (chụp tĩnh như `chup_soat_c.py`): lò rèn ở cấp 2/5/6/9/12/15, ô đồ, kết quả, tiếng Anh, `?luyen=0`.

**Phiên 3: đo bot và chốt số, rồi dọn**

1. `tests/cay.py --node --ngay=8 --viec` 8 lượt, so với bảng hiện nay (38 lần chơi, khoảng 174 phút). `--kd=4` ở 2-3, 3-3, 3-5, 4-5. Chỉnh giá trong `G.LUYEN` nếu lệch quá 10%.
2. Đo vùng 4 (cấp 13–15) và độ khó 2.
3. Sau khi chủ game duyệt, phiên dọn mới xoá: luật mài, lò, ép (`ep_do.js` phần ép, đổi dòng, bùa), ví quặng, đá, bùa, ảnh không dùng. Giữ phần chuyển bản lưu.

**Thứ tự:** phiên 1 phải xong và qua bot trước. Phiên 2 cần `G.luyen` của phiên 1. Phiên Vũ khí B (đòn nối) không đụng tới hệ này nên làm song song được. Phiên Vũ khí C đã xong, chỉ cần nối lại.

---

## 6. Câu hỏi cho chủ game (chọn A hoặc B)

**Q1. Trần sức mạnh vũ khí**

- **A (khuyên):** giữ đường sức mạnh lúc chơi truyện như bây giờ, cấp 15 = ×5,7. Không phải cân lại quái hay trùm.
- **B:** nén theo ChatGPT, cấp 15 khoảng ×2,8. Phải giảm máu quái và trùm vùng 2–4 khoảng 40–50% rồi đo lại khuyên dùng bằng bot. Độ khó như cũ, chỉ có số nhỏ hơn.

**Q2. Máu +6% mỗi cấp**

- **A (khuyên):** giữ +6%.
- **B:** hạ còn +1,1% (+43% ở cấp 40). Đồng thời giảm đòn quái và trùm ×0,81 / 0,63 / 0,51 / 0,45 theo vùng 1–4, nhân khuyên dùng ×0,90 / 0,79 / 0,71 / 0,67, và đo lại bằng bot. Làm chung với lần cân vùng 4.

**Q3. Luyện riêng từng món hay chung**

- **A (khuyên):** mỗi vũ khí một cấp Luyện riêng, như bây giờ. Người chơi tự chọn món chính. Thành tựu "Luyện cả 4 món lên cấp 6" khuyến khích dùng đủ 4 món.
- **B:** một cấp Luyện chung cho cả 4 món. Giá mỗi cấp khoảng ×1,7 so với bảng trên. Đổi vũ khí không bao giờ thiệt. Phải tính lại mô hình và bỏ luật "mỗi món một hệ" hoặc giữ hệ riêng từng món.


## Quyết định chủ game (16/10 19:5x)
- Q1: A — trần ×5,7, giữ đường sức mạnh như nay.
- Q2: A — giữ máu +6%/cấp.
- Q3: A — luyện riêng từng món.
→ Làm code theo mục 5.2 (phiên 1 → 2 → 3).
