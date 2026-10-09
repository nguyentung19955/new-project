# Cân bằng "phải cày mới qua"

Mục tiêu của chủ dự án: người chơi phải cày lên cấp, lên đồ mới qua được các ải quan trọng, nhưng cày phải có thưởng và không vô vị.

## Tóm tắt

- Trước đợt này bot chơi một mạch 15 ải không thua lần nào, mỗi ải đúng 1 lần, hết 15 ải trong khoảng **1 giờ**.
- Sau đợt này (bot chơi như người bình thường, nhìn "Sức mạnh khuyên dùng"):
  - Vùng 1 nhẹ: ải 1 đến 4 mỗi ải khoảng 1 đến 2 lần chơi.
  - Ải 3, ải 4 của vùng 2 và 3: khoảng 3 đến 4 lần.
  - Ải trùm vùng 1, 2, 3 cần lần lượt khoảng **7,5 / 8,5 / 9** lần chơi. Số này tăng dần qua ba vùng.
  - Đi hết 15 ải lần đầu trung bình **3 giờ 38 phút** (nhanh nhất 3 giờ, lâu nhất 4 giờ 5 phút).
- Mỗi ải có **Sức mạnh khuyên dùng**, em bé có chỉ số **Sức mạnh**, so màu xanh (đủ), vàng (sát nút), đỏ (thiếu).
- Quái bắn xa không còn là nguồn mất máu lớn nhất. Cung thấp hơn kiếm khoảng 22% trên cả quái mới. Phòng thường chỉ có tối đa 4 quái cùng lúc.
- Luật lõi giữ nguyên: vũ khí tiến hóa theo cách dùng (mốc 30/120/300), trùm thích nghi, trùm vùng rơi vũ khí Vàng.

## Đo bằng bot như thế nào

Bài mới `game/tests/cay.py`. Bot chơi từ một bản lưu mới tinh:

- Ở làng, bot làm như người chơi chăm chỉ: học kỹ năng, nâng lò, nâng bậc, mài, rèn và mặc đồ tốt nhất, mang vũ khí tốt nhất.
- Bot nhìn Sức mạnh khuyên dùng của ải kế tiếp:
  - Chưa đủ (chưa xanh) thì chơi lại ải mới nhất đã qua để cày.
  - Đủ rồi thì vào ải mới.
  - Thua thì về làng nâng cấp, chơi lại ải cũ một lượt rồi mới thử lại.
- **Số lần chơi** của một ải tính mọi lượt, kể cả chơi lại ải cũ và lượt thua, từ lúc qua ải trước cho tới lúc qua ải đó.
- Bot được chỉnh hơi vụng như người mới: phản xạ chậm hơn và bỏ sót nhiều đạn hơn bot mặc định.
- Bảng dưới là 16 lượt chiến dịch, mỗi lượt chơi từ đầu tới hết 15 ải. Chạy lại bằng: `python3 game/tests/cay.py 16`.

### Số lần chơi từng ải (sau khi cân bằng, 16 lượt)

| Ải | Số lần chơi (trung bình) | Trung vị | Ít nhất - nhiều nhất | Lần vào ải mới | Lần thua | Phút | Cấp hero khi qua | Sức mạnh khi qua / khuyên dùng | Mục tiêu |
|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 1.0 | 1 | 1-1 | 1.0 | 0.0 | 3 | 1 | 99 / 100 | 1-2 |
| 1-2 | 1.7 | 2 | 1-3 | 1.1 | 0.1 | 5 | 2 | 116 / 110 | 1-2 |
| 1-3 | 2.1 | 2 | 1-5 | 1.2 | 0.2 | 7 | 4 | 132 / 125 | 1-2 |
| 1-4 | 2.2 | 2 | 1-5 | 1.1 | 0.1 | 8 | 5 | 149 / 140 | 1-2 |
| **1-5 Mộc Tinh** | **7.5** | 7.5 | 4-11 | 2.0 | 1.1 | 30 | 10 | 198 / 190 | 5-9 (vùng 1 nhẹ hơn) |
| 2-1 | 1.4 | 1 | 1-6 | 1.1 | 0.1 | 4 | 10 | 237 / 200 | 1-2 |
| 2-2 | 1.7 | 1 | 1-6 | 1.1 | 0.1 | 6 | 12 | 254 / 225 | 1-2 |
| **2-3** | **3.2** | 3 | 1-7 | 1.4 | 0.4 | 11 | 14 | 274 / 265 | 3-5 |
| **2-4** | **3.9** | 3 | 1-8 | 1.6 | 0.7 | 16 | 16 | 290 / 280 | 3-5 |
| **2-5 Ngư Tinh** | **8.5** | 7.5 | 3-20 | 2.4 | 1.4 | 34 | 20 | 318 / 310 | 6-10 |
| 3-1 | 1.7 | 1 | 1-4 | 1.2 | 0.2 | 8 | 20 | 356 / 335 | 1-2 |
| 3-2 | 1.4 | 1 | 1-3 | 1.1 | 0.2 | 6 | 21 | 370 / 355 | 1-2 |
| **3-3** | **3.6** | 3 | 1-10 | 1.9 | 0.8 | 17 | 23 | 394 / 385 | 3-5 |
| **3-4** | **4.0** | 3.5 | 1-8 | 1.5 | 0.5 | 19 | 25 | 409 / 400 | 3-5 |
| **3-5 Hồ Tinh** | **9.2** | 9 | 4-17 | 2.1 | 1.1 | 46 | 29 | 436 / 430 | 6-10 |

- Tổng thời gian đi hết 15 ải lần đầu: trung bình **218 phút (3,6 giờ)**, trung vị 219 phút, nhanh nhất 181, lâu nhất 245. Mục tiêu là 2,5 đến 4 giờ.
- Trung bình 53 lần chơi, khoảng 4 phút mỗi lần.
- Vùng 1 các ải trùm nhỏ để nhẹ (1 đến 2 lần), theo mục tiêu "vùng 1 nhẹ". Ải 3 và 4 có trùm nhỏ cần 3 đến 5 lần chỉ áp dụng cho vùng 2 và 3.

### So với trước

| | Trước đợt này | Sau đợt này |
|---|---|---|
| Số lần chơi mỗi ải | 1 ở mọi ải (bot không thua lần nào) | 1-2 ở ải thường, 3-4 ở ải 3 và 4 (vùng 2, 3), 7,5 / 8,5 / 9 ở ba trùm vùng |
| Thời gian đi hết 15 ải | khoảng 61 phút | khoảng 218 phút |
| Cấp hero khi tới Hồ Tinh | 22 | 29 |
| Nguồn mất máu lớn nhất | quái bắn xa 20-28%, quái gai 18-26% | trùm 30%, vùng chiêu trùm 16%, quái gai 18%, quái bắn xa 14% |

Số "trước" đo trên bản trước đợt này: bot chơi lần lượt, cứ thua thì cày một lượt, 3 lượt chiến dịch.

### Người chơi liều (không nhìn lời khuyên)

`python3 game/tests/cay.py 8 lieu`: bot cứ vào ải mới, thua thì cày một lượt rồi thử lại. Kết quả 8 lượt:

- Đi hết 15 ải: trung bình 206 phút.
- Trùm vùng cần 4,8 / 5,8 / 7 lần chơi, nhưng thua nhiều hơn: khoảng 2 đến 3 lần mỗi trùm.
- Bot liều thường tới vùng 3 với sức mạnh thấp hơn khuyên dùng. Vì vậy ải 3-3 và 3-4 tốn 5 đến 6,5 lần.
- Tức là nhìn lời khuyên và cày đúng lúc thì đỡ thua hơn.

## Đã chỉnh gì

### Sức mạnh và Sức mạnh khuyên dùng (mới)

- **Sức mạnh của em bé** (`G.power`, `js/combat.js`):
  - Công thức: căn bậc hai của (đòn mạnh nhất x máu hữu hiệu), nhân 3.
  - Đòn mạnh nhất: vũ khí tốt nhất đang mang (bậc, mài, mốc tiến hóa, cấp hero, điểm Công, chí mạng), quy về thang của kiếm để loại vũ khí nào cũng so được.
  - Máu hữu hiệu: máu tối đa (cấp, áo, điểm Thủ) chia phần sát thương còn nhận (giáp, nội tại), cộng chút kháng hệ của mũ.
  - Em bé mới có sức mạnh 99. Nếu sau này trang phục có chỉ số, công thức nhận thêm hệ số `powerMult`.
- **Sức mạnh khuyên dùng** từng ải (`G.STAGE_REC`, `js/data.js`): 100, 110, 125, 140, **190**, 200, 225, **265**, **280**, **310**, 335, 355, **385**, **400**, **430**.
  - Đây là mức mà bot thắng phần lớn lượt chơi.
  - Độ khó thứ hai cần cao hơn, theo vùng.
- **Hiện ở đâu** (ảnh trong thư mục này):
  - Dưới thẻ ải chưa qua trên tranh bản đồ của Chú Lái Đò (⚔ và con số, tô màu).
  - Trong thẻ thông tin ải: "Sức mạnh khuyên dùng 270 · bé 241".
  - Trên dải trên cùng ở làng: "Thợ Rèn · cấp 12 · sức mạnh 241".
  - Ở bảng hero của Ông Từ: "Sức mạnh 241".
  - Ở góc trái khi đang trong ải: "Sức mạnh 241 / khuyên 270".
  - Màu: xanh khi đủ, vàng khi sát nút (từ 90%), đỏ khi thiếu.
- Thẻ ải bỏ dòng "gợi ý cấp hero" cũ, thay bằng sức mạnh. Cụ Đồ có thêm một mẹo về sức mạnh khuyên dùng.

### Quái mạnh theo từng ải

- `G.STAGE_K` nhân thêm máu và sát thương cho quái thường và trùm của từng ải.
- Các hệ số được dò bằng bot: ở đúng Sức mạnh khuyên dùng, bot thắng khoảng 3/4 số lượt.
- Bảng máu và sát thương quái thường (chưa nhân hệ số vai):

| Ải | Máu (trước → sau) | Sát thương (trước → sau) |
|---|---|---|
| 1-1 | 60 → 67 | 8 → 10 |
| 1-3 | 88 → 107 | 10 → 16 |
| 1-5 | 115 → 145 | 12 → 21 |
| 2-1 | 130 → 164 | 12 → 31 |
| 2-3 | 180 → 266 | 14,5 → 36 |
| 2-5 | 230 → 260 | 17 → 36 |
| 3-1 | 250 → 395 | 18 → 67 |
| 3-3 | 310 → 480 | 21 → 74 |
| 3-4 | 340 → 524 | 22,5 → 79 |
| 3-5 | 370 → 429 | 24 → 55 |

- Vùng 3 nhận thêm máu (x1,1) và bớt sát thương (chia 1,1) so với lần dò đầu, để bớt cảnh hai ba đòn là gục.
- Ở ải trùm vùng, quái thường nhẹ hơn ải 4 một chút vì sức nặng dồn vào trùm.
- Độ khó thứ hai (`G.DIFF2`) trước nhân x2,2 máu, x1,5 sát thương cho mọi vùng. Nay theo vùng: vùng 1 x1,6 / x1,5, vùng 2 x1,3 / x1,3, vùng 3 x1,1 / x1,15. Lý do: quái thường đã mạnh hơn, mà người chơi đã cày đầy (cấp 30, Vàng +10) vẫn cần với tới được. Bot thử: đã cày đầy thì thắng Hồ Tinh khó 2 khoảng nửa số lượt.

### Lên cấp và cày

- Lên cấp chậm hơn: cần `50 + 50 x cấp` kinh nghiệm (trước `40 + 25 x cấp`). Cấp 30 tới vào khoảng trùm Hồ Tinh.
- Mỗi cấp mạnh hơn rõ: sát thương +1,5% (trước 1%), máu +3,5% (trước 3%). Cày lên cấp thấy ngay sức mạnh tăng.
- **Thưởng khi cày** (`G.grindMult`):
  - Chơi lại ải cũ vẫn đủ kinh nghiệm, vàng, quặng, nguyên liệu vùng.
  - Bé mạnh hơn 130% khuyên dùng của ải thì kinh nghiệm và vàng giảm dần, thấp nhất còn 40%, và bảng kết quả có ghi.
  - Quặng và nguyên liệu vẫn đủ, vì cần cho mài từ +5, nâng bậc Lam, Tím và rèn đồ.
- **Lý do quay lại ải cũ:**
  - Nguyên liệu vùng: mài +5 trở lên cần vảy cá, lên Tím cần vảy cá, rèn đồ cần nguyên liệu từng vùng.
  - Mảnh trùm: lên Vàng cần 4 mảnh, một lần hạ trùm cho 3, nên phải đánh lại trùm vùng.
  - Chơi lại một ải đã qua có **bảng rơi đồ tốt hơn một bậc vùng** (vùng 3 có hàng riêng: 30% ra Tím).
  - Sao thứ ba lần đầu cho đá tôi.
- **Quyết tâm** (mới, `G.GRIT`):
  - Thua thật ở một ải (bỏ ải thì không tính) thì lần sau vào lại chính ải đó bé mạnh thêm 4% máu và sát thương, cộng dồn tối đa 20%. Qua ải thì hết.
  - Hiện ở thẻ ải ("quyết tâm +8%"), trên thanh trong ải và trên bảng thua.
  - Lý do: cuối vùng 3 sức mạnh gần chạm trần (cấp 30, mài +10), nên trước khi có Quyết tâm thỉnh thoảng bot kẹt ở Hồ Tinh tới 40 đến 70 lượt vì xui. Có Quyết tâm thì lâu nhất còn khoảng 17 đến 18 lượt, còn số lần chơi trung bình gần như không đổi.
  - Bản lưu cũ chưa có mục này vẫn đọc được (`G.fixSave` thêm `grit: {}`, chặn số sửa tay ở mức 5).

### Các điểm yếu đã ghi ở đợt trước

- **Quái bắn xa:**
  - Bắn mỗi 3 giây (trước 2,2), ngắm 0,7 giây (trước 0,55), đạn bay 118 (trước 140), sát thương x0,85 (trước x0,9).
  - Gọi bầy nhỏ thưa hơn: lần đầu sau 7 đến 10 giây, sau đó mỗi 12 đến 16 giây.
  - Kết quả: phần máu mất do quái bắn xa còn 13-16% (trước 20-28%), không còn là nguồn lớn nhất.
- **Cung so với kiếm:**
  - Cung 11 → 10,2 mỗi phát. Giáo 11 → 10,7, vì giáo đang cao nhất và cần giữ "vũ khí yếu nhất từ 70% mạnh nhất".
  - Nguyên tắc vẫn đúng: càng chậm hoặc càng áp sát thì mỗi đòn càng mạnh. Búa 22 > Giáo 10,7 x chuỗi > Kiếm 10 > Cung 10,2 khi bắn thường.
  - Đo bằng `tests/dps.py`, cung thấp hơn kiếm **22%** cả trên bia tập lẫn trên quái mới thật (mục tiêu 15-25%).
  - Bài đo trên quái mới trước đây ra 11% vì quái chết nhanh hơn tốc độ mọc, nên vũ khí nào cũng như nhau. Nay cụm quái mới trong bài đo có máu x2,5, giống quái các ải sau khi cân bằng.
- **Phòng chật:**
  - Phòng thường chỉ có tối đa 4 quái cùng lúc (`G.ROOM_WAVES.maxAlive`), tinh anh tính là hai. Đủ số thì quái kế tiếp chờ, vòng đỏ vẫn hiện, có chỗ mới mọc, thành từng tốp nối nhau.
  - Phòng trùm không giới hạn. Không đổi hình quái nào.

### Bài kiểm tra

- **Mới:**
  - `tests/cay.py`: 11 luật (sức mạnh 100 lúc đầu, tăng theo cấp, mài, bậc, áo; khuyên dùng tăng dần; thưởng khi cày; Quyết tâm thua thật thì tăng, bỏ ải thì không, thắng thì hết; bản lưu cũ đọc được), cộng chiến dịch đếm số lần chơi so với mục tiêu.
  - `tests/cay_shots.py`: chụp ảnh.
- **Sửa ngưỡng cho đúng mục tiêu mới** (không bỏ mục nào):
  - `balance.py`: dùng bản lưu thật của bot lúc vừa đủ khuyên dùng (`tests/cay_luu.json`, bộ số dựng tay cũ vẫn chạy bằng chữ `codinh`). Ngưỡng thắng 85% → 60% vì thiết kế là khoảng 75% ở đúng khuyên dùng; kết quả 48-51 trên 60 lượt.
  - `campaign.py`: thua thì cày ải trước một lượt rồi thử lại, tối đa 12 lần.
  - `doors.py`: bản lưu đủ sức mạnh của ải, vì bài này thử luật cửa chứ không đo độ khó.
  - `dps.py quaimoi`: cụm quái máu x2,5.

## Kiểm tra đã chạy

- Mọi bài trong `game/tests/` đều qua:
  - `rules` 82/82, `moves` 92/92, `doors`, `mapgen`, `fuzz` (0 lỗi), `cong` 66/66, `cung` 16/16.
  - `env_rooms`, `fx_check`, `ghep` 109/109, `ghep2` 196/196, `quai` 105/105.
  - `perf` (1,8 ms mỗi khung), `anim_smoke`, `smoke`, `dps`, `ui_robust`, `ui_build`.
  - `ui_input all` (4 cỡ màn hình), `probe`, `campaign`, `balance`, `cay`.
- Các bài chụp ảnh của đợt trước chỉ chạy thử (không lỗi), ảnh cũ để nguyên.
- Đóng gói `python3 game/build.py`. Mở `dist/linh-khi.html`, vào làng, vào ải, mở bảng hero: không có lỗi console. Chỉ có một dòng báo không tải được phông chữ Google, vì máy kiểm tra không có mạng ngoài.

## Ảnh (trong thư mục này)

| Tệp | Nội dung |
|---|---|
| `the-ai-suc-manh-khuyen-dung.png` | Tranh bản đồ, chọn ải 2-3: thẻ ải ghi "Sức mạnh khuyên dùng 270 · bé 241" màu đỏ (thiếu) |
| `the-ai-du-suc-manh.png` | Chọn ải 2-2: màu xanh (đủ); dưới thẻ ải 3 trên tranh ghi ⚔270 màu đỏ |
| `the-ai-trum-vung-thieu-suc-manh-quyet-tam.png` | Chọn trùm Ngư Tinh sau hai lần thua: thiếu nhiều, có "quyết tâm +8%" |
| `bang-hero-suc-manh.png` | Bảng hero của Ông Từ có "Sức mạnh 241" |
| `lang-dai-tren-suc-manh.png` | Dải trên cùng ở làng: "Thợ Rèn · cấp 12 · sức mạnh 241" |
| `trong-ai-thanh-tren-suc-manh.png` | Trong ải: "Sức mạnh 241 / khuyên 270" ở góc trái |

Chụp lại: `python3 game/tests/cay_shots.py`.

## Điểm còn yếu

- **Bot không phải người.**
  - Bot né đạn và chiêu trùm đều tay. Người mới có thể cần cày thêm vài lượt ở trùm vùng so với bảng trên. Ngược lại, người giỏi né có thể qua sớm hơn khuyên dùng.
  - Con số khuyên dùng là "đủ thì phần lớn qua", không phải bảo đảm.
- **Trùm vùng hên xui.** Số lần chơi ở trùm vùng dao động lớn giữa các lượt (Ngư Tinh 3 đến 20 lần). Quyết tâm đã cắt phần đuôi dài nhất, nhưng vẫn có lượt kẹt lâu.
- **Gần trần sức mạnh ở cuối vùng 3.**
  - Trước khi hạ Hồ Tinh, sức mạnh cao nhất khoảng 440 đến 455 (cấp 30, Vàng +10, áo vảy). Khuyên dùng của Hồ Tinh là 430, nên cày thêm ở cuối vùng 3 tăng sức mạnh chậm.
  - Nếu sau này thêm vùng mới, nên thêm nấc mài hoặc đồ mới.
- **Vùng 3 đánh đau:** quái thường gây khoảng 55 đến 79 mỗi đòn (chưa nhân hệ số vai), em bé có khoảng 300 máu. Quái cảm tử nổ trúng mất gần nửa thanh máu. Bot ít bị nổ trúng, người mới có thể thấy gắt.
- **Quái gai** vẫn là nguồn mất máu thứ hai (khoảng 17%). Đợt này chưa chỉnh vì yêu cầu chỉ nêu quái bắn xa.
- **Công thức sức mạnh** chỉ tính vũ khí mạnh nhất, cấp, áo, mũ, kỹ năng. Nó chưa tính bùa, dòng mạnh của bậc Vàng, đặc trưng hệ, nội tại riêng của hero (trừ giảm sát thương của Đô Vật). Hai bé cùng con số có thể mạnh hơi khác nhau.
- **Độ khó thứ hai** chỉ thử nhanh ở ba trùm vùng với bản lưu đã cày đầy, chưa đo kỹ như độ khó thường.
