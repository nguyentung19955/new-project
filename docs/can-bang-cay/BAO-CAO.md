# Cân bằng "phải cày mới qua"

Mục tiêu của chủ dự án: người chơi phải cày lên cấp, lên đồ mới qua được các ải quan trọng, nhưng cày phải có thưởng và không vô vị.

## Tóm tắt

Số đo là của bản cuối, đã gộp các phiên trang phục, làm mượt báo trước, đạn và linh khí.

- Trước đợt này bot chơi một mạch 15 ải không thua lần nào, mỗi ải đúng 1 lần, hết 15 ải trong khoảng **1 giờ**.
- Sau đợt này (bot chơi như người bình thường, nhìn "Sức mạnh khuyên dùng"):
  - Vùng 1 nhẹ: ải 1 đến 4 mỗi ải khoảng 1 đến 2,3 lần chơi.
  - Ải 3, ải 4 của vùng 2 và 3: khoảng 3,5 đến 5 lần.
  - Ải trùm vùng 1, 2, 3 cần trung bình **7,2 / 7,9 / 9,3** lần chơi, tăng dần qua ba vùng.
  - Đi hết 15 ải lần đầu trung bình **3 giờ 22 phút**, nhanh nhất 2 giờ 24 phút, lâu nhất 5 giờ 27 phút.
- Mỗi ải có **Sức mạnh khuyên dùng**, em bé có chỉ số **Sức mạnh** (tính cả trang phục), so màu xanh (đủ), vàng (sát nút), đỏ (thiếu).
- Quái bắn xa không còn là nguồn mất máu lớn nhất. Cung thấp hơn kiếm khoảng 22% trên cả quái mới. Phòng thường chỉ có tối đa 4 quái cùng lúc.
- Thêm **Quyết tâm**: thua thật ở một ải thì lần sau vào lại ải đó bé mạnh thêm 5%, tối đa 25%, để không ai kẹt mãi ở một trùm.
- Luật lõi giữ nguyên: vũ khí tiến hóa theo cách dùng (mốc 30/120/300), trùm thích nghi, trùm vùng rơi vũ khí Vàng.

## Đo bằng bot như thế nào

Bài mới `game/tests/cay.py`. Bot chơi từ một bản lưu mới tinh:

- Ở làng, bot làm như người chơi chăm chỉ: học kỹ năng, nâng lò, nâng bậc, mài, mang vũ khí tốt nhất.
- Trang phục, bot cũng lo như người chơi:
  - Mua món thường ở Bà Hàng Xén khi dư tiền.
  - May món ở Cô Thợ May khi đủ nguyên liệu.
  - Ở mỗi ô, mặc món làm sức mạnh cao nhất.
  - Nâng bậc món đang mặc và mở cấp cánh khi đủ tiền.
- Bot nhìn Sức mạnh khuyên dùng của ải kế tiếp:
  - Chưa đủ (chưa xanh) thì chơi lại ải mới nhất đã qua để cày, tối đa 8 lượt liền. Cày 3 lượt mà sức mạnh không tăng (đồ đã chạm trần) thì thử luôn, như người chơi thật.
  - Đủ rồi thì vào ải mới.
  - Thua thì về làng nâng cấp, chơi lại ải cũ một lượt rồi mới thử lại.
- **Số lần chơi** của một ải tính mọi lượt, kể cả chơi lại ải cũ và lượt thua, từ lúc qua ải trước cho tới lúc qua ải đó.
- Bot được chỉnh hơi vụng như người mới: phản xạ chậm hơn và bỏ sót nhiều đạn hơn bot mặc định.
- Bảng dưới là 16 lượt chiến dịch, mỗi lượt chơi từ đầu tới hết 15 ải. Chạy lại bằng: `python3 game/tests/cay.py 16`.

### Số lần chơi từng ải (sau khi cân bằng, 16 lượt)

| Ải | Số lần chơi (trung bình) | Trung vị | Ít nhất - nhiều nhất | Lần vào ải mới | Lần thua | Phút | Cấp hero khi qua | Sức mạnh khi qua / khuyên dùng | Mục tiêu |
|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 1.0 | 1 | 1-1 | 1.0 | 0.0 | 3 | 1 | 99 / 100 | 1-2 |
| 1-2 | 1.4 | 1 | 1-3 | 1.0 | 0.0 | 4 | 2 | 120 / 110 | 1-2 |
| 1-3 | 2.3 | 2 | 1-4 | 1.1 | 0.1 | 8 | 4 | 148 / 135 | 1-2 |
| 1-4 | 1.4 | 1 | 1-3 | 1.1 | 0.1 | 6 | 5 | 162 / 150 | 1-2 |
| **1-5 Mộc Tinh** | **7.2** | 7.5 | 2-11 | 1.6 | 0.6 | 29 | 10 | 226 / 215 | 5-9 (vùng 1 nhẹ hơn) |
| 2-1 | 2.2 | 1.5 | 1-6 | 1.4 | 0.5 | 8 | 10 | 270 / 240 | 1-2 |
| 2-2 | 1.6 | 1 | 1-3 | 1.1 | 0.1 | 5 | 12 | 289 / 270 | 1-2 |
| **2-3** | **4.9** | 5 | 2-9 | 1.6 | 0.6 | 17 | 14 | 330 / 315 | 3-5 |
| **2-4** | **3.5** | 3.5 | 1-8 | 1.4 | 0.3 | 12 | 16 | 358 / 340 | 3-5 |
| **2-5 Ngư Tinh** | **7.9** | 7.5 | 1-14 | 2.6 | 1.6 | 29 | 20 | 407 / 385 | 6-10 |
| 3-1 | 2.2 | 1 | 1-7 | 1.3 | 0.3 | 8 | 21 | 426 / 400 | 1-2 |
| 3-2 | 2.3 | 2 | 1-4 | 1.2 | 0.2 | 8 | 22 | 455 / 440 | 1-2 |
| **3-3** | **3.7** | 3 | 1-13 | 1.3 | 0.3 | 13 | 24 | 479 / 470 | 3-5 |
| **3-4** | **3.5** | 3.5 | 1-7 | 1.6 | 0.6 | 14 | 26 | 494 / 485 | 3-5 |
| **3-5 Hồ Tinh** | **9.3** | 8 | 2-24 | 3.6 | 2.6 | 38 | 28 | 517 / 500 | 6-10 |

- Tổng thời gian đi hết 15 ải lần đầu: trung bình **202 phút (3,4 giờ)**, trung vị 191 phút, nhanh nhất 144, lâu nhất 327. Mục tiêu là 2,5 đến 4 giờ. Hai lượt xui (312 và 327 phút) kẹt lâu ở Hồ Tinh: 20 đến 24 lần chơi.
- Trung bình 55 lần chơi, khoảng 3,7 phút mỗi lần.
- Ba trùm vùng tăng dần: **7,2 → 7,9 → 9,3** lần chơi. Trùm càng về sau càng hay thua: Mộc Tinh 0,6 lần, Ngư Tinh 1,6 lần, Hồ Tinh 2,6 lần.
- Vùng 1 các ải trùm nhỏ để nhẹ (1 đến 2,3 lần), theo mục tiêu "vùng 1 nhẹ". Ải 3 và 4 có trùm nhỏ cần 3 đến 5 lần chỉ áp dụng cho vùng 2 và 3.
- Ải 1-3, 2-1, 3-1, 3-2 hơi nhỉnh hơn mục tiêu 1 đến 2 (2,2 đến 2,3 lần) vì dao động giữa các lượt; trung vị vẫn 1 đến 2.

### So với trước

| | Trước đợt này | Sau đợt này |
|---|---|---|
| Số lần chơi mỗi ải | 1 ở mọi ải (bot không thua lần nào) | 1-2,3 ở ải thường, 3,5-5 ở ải 3 và 4 (vùng 2, 3), 7,2 / 7,9 / 9,3 ở ba trùm vùng |
| Thời gian đi hết 15 ải | khoảng 61 phút | khoảng 202 phút (trung vị 191) |
| Cấp hero khi tới Hồ Tinh | 22 | 28 |
| Nguồn mất máu lớn nhất | quái bắn xa 20-28%, quái gai 18-26% | trùm 36%, quái gai 17%, vùng chiêu trùm 15%, quái bắn xa 14% |

Số "trước" đo trên bản trước đợt này: bot chơi lần lượt, cứ thua thì cày một lượt, 3 lượt chiến dịch.

### Người chơi liều (không nhìn lời khuyên)

`python3 game/tests/cay.py 8 lieu`: bot cứ vào ải mới, thua thì cày một lượt rồi thử lại. Kết quả 8 lượt:

- Đi hết 15 ải: trung bình 189 phút, 46 lần chơi, gần bằng người nghe lời khuyên. Nhưng bot liều thua nhiều hơn: 3,8 lần ở Ngư Tinh, 2,4 lần ở Hồ Tinh, 1 đến 2 lần ở mỗi ải 3, 4 của vùng 3.
- Bot liều không cày ở vùng 1 nên tới Ngư Tinh với sức mạnh khoảng 330 (khuyên dùng 385). Nó cần 8,5 lần chơi ở Ngư Tinh, trong đó gần 4 lần thua.
- Ngược lại, bot liều qua Mộc Tinh chỉ sau 2,8 lần chơi ở sức mạnh khoảng 190 (khuyên dùng 215). Ở vùng 1, con số khuyên dùng hơi an toàn hơn cần thiết.

## Đã chỉnh gì

### Sức mạnh và Sức mạnh khuyên dùng (mới)

- **Sức mạnh của em bé** (`G.power`, `js/combat.js`):
  - Công thức: căn bậc hai của (đòn mạnh nhất x máu hữu hiệu), nhân 3.
  - Đòn mạnh nhất: vũ khí tốt nhất đang mang (bậc, mài, mốc tiến hóa, cấp hero, điểm Công, chí mạng), quy về thang của kiếm để loại vũ khí nào cũng so được.
  - Máu hữu hiệu: máu tối đa (cấp, áo, điểm Thủ) chia phần sát thương còn nhận (giáp, nội tại), cộng chút kháng hệ của mũ.
  - Trang phục (phiên trang phục gộp vào cùng lúc) được tính: máu, giảm sát thương, kháng hệ có sẵn trong chỉ số em bé. Cộng thêm phần thưởng đủ bộ (sát thương hệ), mỗi tác dụng riêng của món Tím và Vàng (khiên, vệt, vũng, nổ: +4% máu hữu hiệu mỗi tác dụng, tối đa 5) và cánh (lộn xa hơn).
  - Em bé mới có sức mạnh 99.
- **Sức mạnh khuyên dùng** từng ải (`G.STAGE_REC`, `js/data.js`): 100, 110, 135, 150, **215**, 240, 270, **315**, **340**, **385**, 400, 440, **470**, **485**, **500**.
  - Đây là mức mà bot thắng phần lớn lượt chơi.
  - Độ khó thứ hai cần cao hơn, theo vùng.
- **Hiện ở đâu** (ảnh trong thư mục này):
  - Dưới thẻ ải chưa qua trên tranh bản đồ của Chú Lái Đò (⚔ và con số, tô màu).
  - Trong thẻ thông tin ải: "Sức mạnh khuyên dùng 315 · bé 253".
  - Trên dải trên cùng ở làng: "Thợ Rèn · cấp 12 · sức mạnh 253".
  - Ở bảng hero của Ông Từ: "Sức mạnh 253".
  - Ở góc trái khi đang trong ải: "Sức mạnh 253 / khuyên 315".
  - Màu: xanh khi đủ, vàng khi sát nút (từ 90%), đỏ khi thiếu.
- Thẻ ải bỏ dòng "gợi ý cấp hero" cũ, thay bằng sức mạnh. Cụ Đồ có thêm một mẹo về sức mạnh khuyên dùng.

### Quái mạnh theo từng ải

- `G.STAGE_K` nhân thêm máu và sát thương cho quái thường và trùm của từng ải.
- Các hệ số được dò bằng bot: ở đúng Sức mạnh khuyên dùng, bot thắng khoảng 3/4 số lượt.
- Bảng máu và sát thương quái thường (chưa nhân hệ số vai):

| Ải | Máu (trước → sau) | Sát thương (trước → sau) |
|---|---|---|
| 1-1 | 60 → 67 | 8 → 10 |
| 1-3 | 88 → 108 | 10 → 17 |
| 1-5 | 115 → 150 | 12 → 23 |
| 2-1 | 130 → 172 | 12 → 35 |
| 2-3 | 180 → 266 | 14,5 → 36 |
| 2-5 | 230 → 290 | 17 → 50 |
| 3-1 | 250 → 425 | 18 → 82 |
| 3-3 | 310 → 518 | 21 → 93 |
| 3-4 | 340 → 561 | 22,5 → 98 |
| 3-5 | 370 → 466 | 24 → 69 |

- Sau khi gộp trang phục, em bé mạnh lên nhanh hơn trước (đồ rơi, đủ bộ, cánh), nên sức mạnh khuyên dùng và độ khó quái được dò lại theo bot có mặc trang phục.
- Vùng 3 nhận thêm máu (x1,1) và bớt sát thương (chia 1,1) so với lần dò đầu, để bớt cảnh hai ba đòn là gục.
- Ở ải trùm vùng, quái thường nhẹ hơn ải 4 một chút vì sức nặng dồn vào trùm.
- Độ khó thứ hai (`G.DIFF2`) trước nhân x2,2 máu, x1,5 sát thương cho mọi vùng. Nay theo vùng: vùng 1 x1,6 / x1,5, vùng 2 x1,3 / x1,3, vùng 3 x1,1 / x1,15. Lý do: quái thường đã mạnh hơn, mà người chơi đã cày đầy (cấp 30, Vàng +10) vẫn cần với tới được. Bot thử trước khi gộp trang phục: đã cày đầy thì thắng Hồ Tinh khó 2 khoảng nửa số lượt. Có trang phục thì dễ hơn thế.

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
  - Thua thật ở một ải (bỏ ải thì không tính) thì lần sau vào lại chính ải đó bé mạnh thêm 5% máu và sát thương, cộng dồn tối đa 25%. Qua ải thì hết.
  - Hiện ở thẻ ải ("quyết tâm +10%"), trên thanh trong ải và trên bảng thua.
  - Lý do: cuối vùng 3 sức mạnh gần chạm trần (cấp 30, mài +10), nên trước khi có Quyết tâm thỉnh thoảng bot kẹt ở Hồ Tinh tới 40 đến 70 lượt vì xui. Đo trước khi gộp trang phục: có Quyết tâm thì lâu nhất còn 17 đến 18 lượt, số lần chơi trung bình gần như không đổi. Sau khi gộp trang phục, tăng lên 5% mỗi lần và bot thử luôn khi cày không còn mạnh lên: lượt lâu nhất ở Hồ Tinh còn 24 lần.
  - Bản lưu cũ chưa có mục này vẫn đọc được (`G.fixSave` thêm `grit: {}`, chặn số sửa tay ở mức 5).

### Các điểm yếu đã ghi ở đợt trước

- **Quái bắn xa:**
  - Bắn mỗi 3 giây (trước 2,2), ngắm 0,7 giây (trước 0,55), đạn bay 118 (trước 140), sát thương x0,85 (trước x0,9).
  - Gọi bầy nhỏ thưa hơn: lần đầu sau 7 đến 10 giây, sau đó mỗi 12 đến 16 giây.
  - Kết quả: phần máu mất do quái bắn xa còn khoảng 14% (trước 20-28%), không còn là nguồn lớn nhất.
- **Cung so với kiếm:**
  - Cung 11 → 10,5 mỗi phát. Giáo 11 → 10,7 và búa 22 → 21,3, vì sau khi gộp các phiên khác hai vũ khí này cao nhất, cần giữ "vũ khí yếu nhất từ 70% mạnh nhất".
  - Nguyên tắc vẫn đúng: càng chậm hoặc càng áp sát thì mỗi đòn càng mạnh. Mỗi đòn: búa > giáo > kiếm > cung.
  - Đo bằng `tests/dps.py`, cung thấp hơn kiếm **20%** trên bia tập và **24%** trên quái mới thật (mục tiêu 15-25%).
  - Bài đo trên quái mới trước đây ra 11% vì quái chết nhanh hơn tốc độ mọc, nên vũ khí nào cũng như nhau. Nay cụm quái mới trong bài đo có máu x2,5, giống quái các ải sau khi cân bằng.
  - `dps.py` mặc định đo 8 hạt giống thay cho 4: với 4 hạt, kết quả nhảy 5 đến 7 điểm phần trăm mỗi lần đổi số.
- **Phòng chật:**
  - Phòng thường chỉ có tối đa 4 quái cùng lúc (`G.ROOM_WAVES.maxAlive`), tinh anh tính là hai. Đủ số thì quái kế tiếp chờ, vòng đỏ vẫn hiện, có chỗ mới mọc, thành từng tốp nối nhau.
  - Phòng trùm không giới hạn. Không đổi hình quái nào.

### Bài kiểm tra

- **Mới:**
  - `tests/cay.py` (mặc định 12 lượt chiến dịch, cho lệch 20-25% quanh mục tiêu vì trùm và đồ rơi hên xui): 11 luật (sức mạnh 100 lúc đầu, tăng theo cấp, mài, bậc, áo; khuyên dùng tăng dần; thưởng khi cày; Quyết tâm thua thật thì tăng, bỏ ải thì không, thắng thì hết; bản lưu cũ đọc được), cộng chiến dịch đếm số lần chơi so với mục tiêu.
  - `tests/cay_shots.py`: chụp ảnh.
- **Sửa ngưỡng cho đúng mục tiêu mới** (không bỏ mục nào):
  - `balance.py`: dùng bản lưu thật của bot lúc vừa đủ khuyên dùng (`tests/cay_luu.json`, bộ số dựng tay cũ vẫn chạy bằng chữ `codinh`). Ngưỡng thắng 85% → 60% vì thiết kế là khoảng 75% ở đúng khuyên dùng; kết quả 35/45 (78%). Chế độ `trangphuc` của phiên trang phục vẫn giữ.
  - `campaign.py`: thua thì cày ải trước một lượt rồi thử lại, tối đa 12 lần.
  - `doors.py`: bản lưu đủ sức mạnh của ải và Quyết tâm tối đa, vì bài này thử luật cửa chứ không đo độ khó.
  - `dps.py quaimoi`: cụm quái máu x2,5.

## Kiểm tra đã chạy

Chạy trên bản đã gộp các phiên trang phục, làm mượt báo trước, đạn và linh khí.

- Mọi bài trong `game/tests/` đều qua:
  - `rules` 82/82, `moves` 92/92, `doors`, `mapgen`, `fuzz` (0 lỗi), `cong` 66/66, `cung` 16/16.
  - `env_rooms`, `fx_check`, `ghep` 109/109, `ghep2` 196/196, `quai` 105/105.
  - `trang_phuc` 66/66, `linhkhi` 36/36, `bao_truoc` 21/21.
  - `perf` (2,6 ms mỗi khung), `anim_smoke`, `smoke`, `dps`, `ui_robust`, `ui_build`.
  - `ui_input all` (162 hoặc 153 mục mỗi cỡ màn hình), `probe`, `campaign`, `balance`, `cay`.
- `fuzz` một lần bắt được quái bị quái khác đẩy lọt ra ngoài sàn theo chiều dọc. Đã sửa: lúc các quái đẩy nhau thì giữ trong sàn (`js/combat.js`).
- Các bài chụp ảnh của đợt trước chỉ chạy thử (không lỗi), ảnh cũ để nguyên.
- Đóng gói `python3 game/build.py`. Mở `dist/linh-khi.html`, vào làng, vào ải, mở bảng hero: không có lỗi console. Chỉ có một dòng báo không tải được phông chữ Google, vì máy kiểm tra không có mạng ngoài.

## Ảnh (trong thư mục này)

| Tệp | Nội dung |
|---|---|
| `the-ai-suc-manh-khuyen-dung.png` | Tranh bản đồ, chọn ải 2-3: thẻ ải ghi "Sức mạnh khuyên dùng 315 · bé 253" màu đỏ (thiếu) |
| `the-ai-du-suc-manh.png` | Chọn ải 2-2: màu vàng (sát nút); dưới thẻ ải 3 trên tranh ghi ⚔315 màu đỏ |
| `the-ai-trum-vung-thieu-suc-manh-quyet-tam.png` | Chọn trùm Ngư Tinh sau hai lần thua: thiếu nhiều, có "quyết tâm +10%" |
| `bang-hero-suc-manh.png` | Bảng hero của Ông Từ có "Sức mạnh 253" |
| `lang-dai-tren-suc-manh.png` | Dải trên cùng ở làng: "Thợ Rèn · cấp 12 · sức mạnh 253" |
| `trong-ai-thanh-tren-suc-manh.png` | Trong ải: "Sức mạnh 253 / khuyên 315" ở góc trái |

Chụp lại: `python3 game/tests/cay_shots.py`.

## Điểm còn yếu

- **Bot không phải người.**
  - Bot né đạn và chiêu trùm đều tay. Người mới có thể cần cày thêm vài lượt ở trùm vùng so với bảng trên. Người giỏi né có thể qua sớm hơn khuyên dùng.
  - Con số khuyên dùng là "đủ thì phần lớn qua", không phải bảo đảm.
- **Trùm vùng hên xui, nhất là Hồ Tinh.**
  - Số lần chơi ở trùm vùng dao động lớn giữa các lượt (Ngư Tinh 1 đến 14 lần, Hồ Tinh 2 đến 24).
  - Đồ rơi (vũ khí Vàng, trang phục) cũng hên xui, nên sức mạnh cao nhất lúc tới Hồ Tinh mỗi lượt một khác (khoảng 485 đến 580). Có lượt sức mạnh 575 vẫn thua Hồ Tinh 5 lần (trùm thích nghi khắc lối đánh của bé).
  - Quyết tâm đã cắt bớt, nhưng vẫn có lượt kẹt lâu.
  - Nếu muốn chắc hơn: tăng Quyết tâm lên 6% mỗi lần, hoặc giảm máu Hồ Tinh.
- **Gần trần sức mạnh ở cuối vùng 3.** Trước khi hạ Hồ Tinh, cấp 30 và mài +10 đã chạm trần, chỉ còn trang phục và vũ khí Vàng để mạnh thêm. Nếu sau này thêm vùng mới, nên thêm nấc mài hoặc đồ mới.
- **Vùng 3 đánh đau:**
  - Quái thường gây khoảng 72 đến 98 mỗi đòn (chưa nhân hệ số vai), em bé có khoảng 300 đến 350 máu.
  - Quái cảm tử nổ trúng mất gần nửa thanh máu. Bot ít bị nổ trúng, người mới có thể thấy gắt.
  - Khiên và tác dụng của trang phục bù lại một phần.
- **Quái gai** vẫn là nguồn mất máu thứ hai (khoảng 17%). Đợt này chưa chỉnh vì yêu cầu chỉ nêu quái bắn xa.
- **Công thức sức mạnh** là ước lượng:
  - Tác dụng trang phục được cộng theo hệ số đoán, không đo từng món.
  - Chưa tính bùa cũ, dòng mạnh của bậc Vàng, đặc trưng hệ, nội tại riêng của hero (trừ giảm sát thương của Đô Vật).
  - Hai bé cùng con số có thể mạnh hơi khác nhau. Ở vùng 1, khuyên dùng của Mộc Tinh hơi an toàn hơn cần thiết.
- **Độ khó thứ hai** chỉ thử nhanh ở ba trùm vùng với bản lưu đã cày đầy (trước khi gộp trang phục), chưa đo kỹ như độ khó thường.
