# Linh Khí: báo cáo kiểm thử tổng hợp (bản lk-2026.10.11-2212, đêm 11/10/2026)

Ba tester chạy song song trên Chromium giả lập iPhone ngang (844×390), bot chơi thật 15 ải, hơn 100 ảnh chụp, đo FPS và bộ nhớ có giả lập CPU chậm. Không sửa code. Chi tiết từng phần ở 3 phụ lục cuối tệp.

## Điểm tổng hợp (1–10)
| Mảng | Điểm | | Mảng | Điểm |
|---|---|---|---|---|
| Lối chơi | 6,5 | | Hình ảnh | 6,5 |
| Hệ thống | 5,5 | | Màu sắc | 6 |
| Cân bằng | 5 | | Giao diện | 6 |
| Điều khiển | 7 | | Hoạt ảnh | 5,5 |
| Động lực chơi tiếp | 4,5 | | Cốt truyện | 4 |
| Tốc độ tải | 4 | | Âm thanh | 2,5 |
| Độ mượt | 4 | | Ổn định | 8 |
| Bộ nhớ | 3 | | Lưu/tải | 7 |

## Điểm mạnh
- Chạy chắc: 0 lỗi trang trong ~25 phút đo, bấm loạn 16 tổ hợp em bé × vũ khí không lỗi, bản lưu hỏng không treo game.
- Người mới vào trận đầu sau ~30 giây; ải 1 dạy từng thứ một theo phòng.
- Làng, bản đồ, quái và trùm pha 1 (ảnh AI) đẹp và cùng phong cách; lời thoại người làng dễ thương.

## 10 việc nên sửa trước (gộp từ 3 tester, xếp theo ảnh hưởng tới người chơi)
1. **Trùm và phòng đông bị giật nặng** (Nghiêm trọng): Hồ Tinh 10 khung/giây trên máy mạnh, 2 khung/giây trên máy tầm trung. Nguyên nhân đã tìm ra: quái đã có ảnh AI mà game vẫn dựng thân bằng code rồi bỏ đi. Bỏ phần thừa thì Hồ Tinh lên 58 khung/giây (đã đo thử).
2. **Bộ nhớ hình tăng mãi** (Nghiêm trọng): sau 10 phút lên ~1 GB; iPhone có thể tự tải lại trang giữa ải và mất lượt ải. Cần trần bộ nhớ chung, xoá hình quái khi rời ải, lưu lượt ải đang chơi.
3. **Đánh đông quái không thấy em bé** (Nghiêm trọng): hiệu ứng và số sát thương phủ kín. Làm nhạt hiệu ứng của người chơi, vẽ dưới nhân vật, viền sáng cho em bé, gộp số sát thương.
4. **Tải chậm và giật lúc đang tải ảnh** (Cao): 18,6 MB, 4G mất 30 giây mới đủ ảnh, 8 khung/giây trong lúc tải. Đổi ảnh sang WebP tệp rời, tải ảnh trùm theo vùng, không xoá bộ nhớ đệm mỗi 0,4 giây.
5. **Vũ khí quá to, lệch tay** (Cao): kiếm ~1,5 lần người, búa gấp đôi, giáo che người. Đặt trần cỡ theo thân, gắn chuôi vào tay.
6. **Cân bằng chưởng** (Cao): Độc mạnh gấp 3,4 lần Lửa, 10 lần Băng.
7. **Tường nguyên liệu và độ khó răng cưa** (Cao): bot kẹt ải 3-5 thua 12 lần dù dư 5.480 vàng (thiếu 3 vảy cá); trùm nhỏ Hổ Lửa nhiều máu hơn Hồ Tinh; ải đầu mỗi vùng đánh đau hơn ải cuối vùng.
8. **Linh khí tiến hoá xong ngay ải 1-5** (Cao): 85% dấu ấn về sau bỏ phí; cả quãng tiến hoá chỉ +12% sát thương.
9. **Lệch chủ đề và hình còn dở** (Cao): Cái Bống là bộ xương lửa xanh, Cụ Đồ mặc com-lê, Lâu đài có thánh giá và kính màu kiểu châu Âu; pha 2–3 trùm còn nhuộm màu lỗi; áo vải không hiện trên người.
10. **Không có cốt truyện và nhạc** (Cao): không mở đầu, trùm không thoại, chỉ 15 tiếng bíp, chưa có nhạc nền.

Việc nhỏ dễ sửa: nút nhỏ hơn 44 pt (Xong, thẻ mục, Bản đồ), chữ tràn ("Bình máu", "132/300"), chữ "hero" lẫn tiếng Anh, "Sức mạnh khuyên dùng" báo sai, em bé mới mở ra ở cấp 1, bản lưu hỏng một phần bị xoá trắng, vòng lặp vẫn chạy hết công suất khi tạm dừng (tốn pin).

---

# Phụ lục A: Lối chơi, hệ thống, cân bằng

Tester 1 · 11/10/2026 · ~50 phút · Chromium giả lập 844×390 cảm ứng, `?cloud=0`.
Thư mục kết quả: `scratchpad/tester-1/` (số liệu thô ở `out/`, ảnh ở `out/onboarding/`, script tự viết `chuong_dps.py`, `chuong_real.py`, `atk_dps.py`, `np.py`).
Ký hiệu: **[ĐO]** là số đo hoặc ảnh có thật; **[CODE]** là đọc code, chưa đo trong trận.

## Tóm tắt
1. Phần cốt lõi chạy chắc: fuzz 16 tổ hợp em bé × vũ khí **0 lỗi**. Người mới vào tới trận đánh đầu tiên sau **~30 giây**. Bot đi hết 15 ải trong **155 phút / 41 lượt**. Ảnh và cảm giác đánh tốt.
2. Lỗi lớn nhất nằm ở **cân bằng hệ thống**: Độc chưởng mạnh gấp **3,4 lần** Hỏa và **10 lần** Băng mỗi phát. Vũ khí **tiến hoá xong ngay ở ải 1-5**, nên 10 ải sau linh khí không còn tác dụng gì.
3. Độ khó tăng **theo răng cưa**: ải đầu mỗi vùng đánh đau hơn ải cuối vùng. Trùm nhỏ ở ải 3-3 có **nhiều máu hơn** trùm cuối Hồ Tinh. Bot chơi theo lối "cày ải trước" thì **kẹt cứng ở 3-5** (thua 12 lần liền) vì thiếu 3 vảy cá của vùng 2, trong khi còn dư 5.480 vàng.
4. Sức mạnh, cấp, trang phục, mài, bậc, linh khí, chưởng, cây kỹ năng đều cộng số, chồng lên nhau. Chỉ số "Sức mạnh khuyên dùng" có chỗ báo sai: ải 3-5 khuyên 620, nhưng bản lưu 544 vẫn thắng 3/3.
5. Động lực chơi tiếp yếu: không có cốt truyện ngoài một dòng "Cứu được X!". Em bé mới mở ra ở **cấp 1**. Cuối game chỉ còn độ khó 2 và bảng vàng.

**Điểm:** Lối chơi **6,5** · Hệ thống **5,5** · Cân bằng **5** · Điều khiển **7** · Động lực chơi tiếp **4,5**

---

## Đã sửa so với audit 10/10 (đã kiểm lại)
- V29: sau ải 1 chỉ còn **1 chấm đỏ** (Kỹ năng) thay vì 6/7 [ĐO, `out/onboarding/28-lang-sau-ai1-10s.png`].
- V1: màn chào có nút "Chơi ngay" ngay từ đầu [ĐO, `out/luu.txt`]. Bài cũ báo "CÓ VẤN ĐỀ: nút Chơi tạm" là do bài kiểm tra tìm theo tên nút cũ, không phải lỗi game.
- V7: Né có bộ nhớ 0,15 giây (`combat.js:611`). V12: cung, giáo, búa vào thế ngay khi chạm nút (`moves.js:550`) [CODE].
- V5 (phần sát thương): đòn gốc trùm nhỏ vùng 3 đã hạ (`data.js:228`). Phần **máu** chưa sửa, xem mục 4.
- V2: bản trên máy mới hơn nhưng ít tiến độ hơn thì vẫn hỏi lại, không ghi đè mây [ĐO, `out/luu.txt`].

---

## Danh sách vấn đề

### 1. Độc chưởng áp đảo, Băng chưởng gần như vô dụng — **Cao**
- **Ở đâu:** `js/chuong.js`, các cây `doc` / `hoa` / `bang` (dòng 41–78).
- **Hiện tượng [ĐO]:** Thợ Rèn cấp 30, học đầy cây theo `CH.PLAN`, mỗi 3,7 giây một phát. Đây đúng là nhịp hồi mana thật: chém liên tục được **8,2 mana/giây**, mỗi phát tốn 30. Kết quả (`chuong_real.py`):

  | Cây | Sát thương mỗi phát, cụm 5 quái | Sát thương mỗi phát, 1 quái |
  |---|---|---|
  | Độc | **1.934** | **268** |
  | Hỏa | 561 | 138 |
  | Băng | 184 | 58 |

  Một phát Độc vào cụm bằng **~3,9 giây chém kiếm** (kiếm vào cụm 5 bia sát người: 500 st/giây). Như vậy Độc gần như **nhân đôi** DPS đánh đám. Băng chỉ thêm ~10%.
- **Lưu ý:** bia trong bài đứng yên nên mây độc đánh trọn thời gian. Quái thật biết đi, khoảng cách sẽ hẹp lại nhưng không đảo thứ tự: với 1 quái, Độc vẫn gấp 4,6 lần Băng.
- **Đề xuất:** Độc: `cloudDmg` 0,12 → **0,06**, nút `hut` mạnh +25%/bậc → **+12%/bậc**. Băng: `hit` 1,2 → **1,8**, `pierce` 2 → 3. Mục tiêu sau khi chỉnh: ba cây lệch nhau không quá ±25% mỗi phát vào 1 quái. Băng được bù bằng khống chế.

### 2. Vũ khí tiến hoá xong từ ải 1-5; linh khí về sau thành vô nghĩa — **Cao**
- **Ở đâu:** `G.MARKS` (30/120/300), `G.STAGE_MULT = [1, 1.04, 1.08, 1.12]` (`data.js:56`).
- **Hiện tượng [ĐO, `out/campaign.txt`]:** Kiếm của bot có **319 dấu ấn Độc khi qua ải 1-5**, tức đã Thức tỉnh ở ải 5/15. Cuối chiến dịch có **1.973**, nghĩa là **85% dấu ấn kiếm được bị bỏ phí**. Cả quãng tiến hoá chỉ cho **+12% sát thương**. Bỏ lớp tiến hoá thì Sức mạnh chỉ giảm **5%**, trong khi bỏ trang phục giảm **44%** (`out/tientrien.txt`). Câu "Vũ khí lớn lên theo bạn" thực tế dừng lại sau khoảng 20 phút chơi.
- **Đề xuất:** đổi mốc thành **60 / 400 / 1.200** (Thức tỉnh rơi vào khoảng vùng 3). `STAGE_MULT` → **[1, 1.08, 1.18, 1.30]**. Dấu ấn vượt mốc cuối thì đổi ra thứ dùng được, ví dụ 100 dấu ấn = 1 nguyên liệu vùng.

### 3. Tường nguyên liệu ở ải cuối; vàng thừa không có chỗ tiêu — **Cao**
- **Ở đâu:** `G.sharpenFull` (`data.js`): mài +9 lên +10 vẫn đòi **5 vảy cá (vùng 2)**. Lò lên cấp 3 cũng đòi vảy cá.
- **Hiện tượng [ĐO, `out/campaign.txt`]:** bot "chơi lại ải trước khi thua" thua **ải 3-5 (Hồ Tinh) 12 lần liền**. Trong lúc đó cấp tăng 19 → 26 mà máu trùm còn lại vẫn 78, 28, 21, 67, 49, 56, 33, 52, 46, 44, 24%, **không có xu hướng giảm**. Nghĩa là cày cấp không giúp gì. Kiếm kẹt ở +9 từ lần 1 tới lần 12. Còn dư **5.480 vàng, 78 quặng, 31 đá lửa nhưng chỉ 2 vảy cá**. Cũng xem `out/cay.txt`: bot đi theo gợi ý ("chơi lại Hang biển 2") thì qua 3-5 sau 5 lượt. Vậy người chơi chỉ thoát được nếu đọc đúng gợi ý và **quay về vùng 2**.
- **Đề xuất:** (a) Mài +9 lên +10 chuyển sang đá lửa (đổi `n < 10` thành `n < 9` trong `sharpenFull`). (b) Thương nhân trong ải và người bán ở làng đổi **150 vàng → 1 nguyên liệu vùng đã qua**, mỗi ngày tối đa 10. Đây vừa là chỗ tiêu vàng vừa là lối thoát khỏi tường. (c) Bảng thua ghi rõ "thiếu 3 vảy cá → Hang biển".

### 4. Độ khó răng cưa: ải đầu vùng khó hơn ải cuối vùng; trùm nhỏ trâu hơn trùm cuối — **Cao**
- **Ở đâu:** `G.STAGE_K` (`data.js:224–231`).
- **Hiện tượng [ĐO, `out/tientrien.txt`, bản lưu thật lúc vừa đủ khuyên dùng]:**
  - Đòn quái thường: 1-5 **20,7** → 2-1 **32,9** (+59%) → 2-2 26,6 (lại giảm). 2-5 **44,5** → 3-1 **68,8** (+55%) → 3-5 61,1.
  - Số đòn bé chịu được: 5,7 → **4,5** ở 3-1. Bot thua 3-1 ngay lần đầu ở phòng 4 (`campaign.txt`).
  - Hệ số sát thương quái 3-1..3-4 là 4,54 / 4,28 / 4,43 / **4,74**, cao hơn 3-5 (3,11).
  - [ĐO, `out/trum.txt`] Máu trùm nhỏ **Hổ Lửa (ải 3-3) là 10.375**, nhiều hơn **Hồ Tinh (trùm cuối) 8.620**. Cua Đá 4.731 so với Ngư Tinh 7.419.
- **Đề xuất:** sát thương quái 2-1: 2,95 → **2,45**. 3-1..3-4: → **3,4 / 3,5 / 3,6 / 3,7**. Hệ số máu trùm nhỏ: thêm cột riêng `G.MINI_HP_K`, vùng 3 = **0,75** (Hổ Lửa ~7.800 < Hồ Tinh). Tiêu chí: đòn quái thường tăng đều ≤ 15% mỗi ải.

### 5. Hỏng bản lưu vẫn xoá trắng toàn bộ (V3 chưa sửa) — **Cao**
- **Ở đâu:** `engine.js` `G.fixSave` (`catch → return base`).
- **Hiện tượng [ĐO, `out/luu_hong.txt`]:** "giả lỗi trong outfit.fix → xoá trắng cả bản lưu: **True**". 624 lần làm hỏng ngẫu nhiên thì 0 lần mất. Nhưng chỉ cần một bản cập nhật có lỗi trong phần sửa trang phục là người chơi mất sạch tiến trình.
- **Đề xuất:** bọc `try/catch` riêng cho từng phần (`outfit.fix`, `chuong.fix`, `linhkhi`…). Phần nào lỗi thì giữ dữ liệu cũ của phần đó, không trả về bản trắng.

### 6. "Sức mạnh khuyên dùng" và con số Sức mạnh báo sai — **Vừa**
- **Hiện tượng [ĐO]:**
  - Ải 3-5 khuyên **620**. Bản lưu **544** thắng kiếm 3/3, giáo (525) 3/3, búa 3/3 (`out/balance_vk.txt`), nên chữ đỏ đang dọa sai.
  - Ải 1-1 (hướng dẫn): người mới có **98/100**, chữ vàng "chưa đủ" ngay trận đầu (`out/onboarding/07-ai1-phong-dau.png`).
  - Cùng một bản lưu: Đô Vật **697** so với Thợ Rèn **552** (+26%), mà cả hai đều thắng 4/4 với số máu mất tương đương (`tientrien.txt`). Sức mạnh đếm giảm sát thương của Đô Vật quá cao.
- **Đề xuất:** `STAGE_REC[14]` 620 → **560**, `STAGE_REC[0]` 100 → **95**. Trong `G.power`, phần giảm sát thương của Đô Vật nhân **0,5**.

### 7. Cung yếu khi làm vũ khí chính; ô vũ khí thứ hai gần như bỏ không — **Vừa**
- **Hiện tượng [ĐO]:** `balance.py vukhi` cho cung thắng **8/12** (Ngư Tinh **0/3**). Kiếm và giáo 12/12, búa 11/12. Trong chiến dịch, cung mang theo cả game chỉ có **36 dấu ấn**. Phạt "chống đánh xa" (sát thương 30% khi bắn từ xa hơn 120 px) vẫn còn và không báo cho người chơi (V13).
- **Đề xuất:** phạt đánh xa 30% → **60%**, hiện chữ "Trùm chắn tên xa — lại gần hơn". Cho vũ khí thứ hai nhận **50% dấu ấn** của vũ khí đang cầm.

### 8. "Trùm học theo bạn" phạt đúng lối chơi mà linh khí khuyến khích — **Vừa**
- **Hiện tượng [ĐO]:** **~25/30 lượt** trong `campaign.txt` trùm có "Kháng Độc, yếu Lửa". Chơi lại thì mức kháng là **50%** (`stage.js:114`). Linh khí thưởng cho việc dồn một hệ, còn trùm lại phạt việc đó. Kết quả là cả game gặp một kiểu phản đòn duy nhất, không phải "học" gì mới.
- **Ải 1 [ĐO, ảnh 24]:** vừa gặp trùm đầu tiên đã có nhãn "Chống áp sát". Khung gợi ý thì lại nói "Trùm kháng hệ bạn dùng nhiều nhất" (V39 còn).
- **Đề xuất:** kháng 0,5 → **0,3**. Đánh bằng hệ khắc chế thì +50% (hiện chỉ có sao). Ải 1-1 tắt lớp thích nghi.

### 9. Ải hướng dẫn dạy Lửa nhưng vũ khí thành Độc — **Vừa**
- **Hiện tượng [ĐO, `out/onboarding/26-ket-qua.png`]:** phòng 1 dạy "đánh vỡ chậu than → dấu ấn Lửa". Hết ải, kiếm nhận **+5 Lửa, +38 Độc** và đi theo nhánh Độc. Người mới hiểu sai bài vừa học, và nhánh này bị trùm kháng suốt game (mục 8).
- **Đề xuất:** ở ải 1-1, hệ số dấu ấn Độc từ quái và đồ vật Rừng **×0,2**, chậu than ×2. Hoặc cho người chơi chọn hệ khi kiếm đạt 30 dấu ấn.

### 10. Em bé mới mở ra ở cấp 1 — **Vừa**
- **Hiện tượng [ĐO]:** cuối chiến dịch: Thợ Rèn cấp 27, Thợ Săn và Thầy Lang **cấp 1**. Cấp chiếm **34%** Sức mạnh, nên em bé mới không vào nổi vùng đang chơi. Phần thưởng "Cứu được X!" vì vậy gần như không dùng được. [CODE] `stage.js:487` chỉ bật `unlocked`.
- **Đề xuất:** em bé mới bắt đầu ở **cấp của em bé chính trừ 3**, hoặc mọi em bé nhận **50% kinh nghiệm** chung.

### 11. Trùm nhỏ dùng chung một kịch bản; Hồ Tinh vồ báo trước quá ngắn — **Vừa**
- **Hiện tượng [ĐO, `out/trum.txt`]:** 12 chiêu đầu của **Nấm Chúa, Cua Đá, Hổ Lửa gần như giống hệt**: "chieu2 chieu1 chieu1 chieu2 atk chieu1 chieu1 atk…". Hồ Tinh c2 vẫn chỉ báo **0,44 giây** (V8 chưa sửa). Trùm vùng có cửa sổ an toàn trung bình 1,5–2,6 giây, mệt 7–20% thời gian: hợp lý.
- **Đề xuất:** mỗi trùm nhỏ có một chiêu riêng và thứ tự ngẫu nhiên có trọng số. Hồ Tinh c2 báo trước **≥ 0,6 giây**.

### 12. Búa: gần nửa nhát vung bị huỷ — **Vừa**
- **Hiện tượng [ĐO, `out/vukhi.txt`]:** búa bị huỷ **43–44%** nhát (kiếm 9–14%). DPS vào cụm nay đã bằng kiếm (68,8 so với 68,8), nhưng cảm giác "bấm mà không ra đòn" vẫn còn.
- **Đề xuất:** từ khoảng 60% thời lượng lấy đà trở đi thì Né **không huỷ** nhát búa (giáp nhẹ). Hoặc đưa lúc chạm từ 0,36 về **0,30 giây**.

### 13. Nhiều lớp tăng sức mạnh chồng nhau, phần lớn chỉ cộng số — **Vừa**
- **Hiện tượng [ĐO, `tientrien.txt` "lop" ở 3-5]:** bỏ từng lớp thì Sức mạnh giảm: trang phục **44%**, cấp 34%, mài 26%, bậc 20%, cây kỹ năng 10%, tiến hoá 5%. Có tới **hai cây điểm** (kỹ năng và chưởng), **ba loại nguyên liệu vùng**, quặng, đá tôi, mảnh trùm.
- [CODE] Nút "Nổ khói và Sốc nhiệt mạnh hơn 30%" gần như vô dụng vì phản ứng hệ hiếm khi xảy ra (V48). Nút "Đòn đầu sau khi đổi vũ khí chắc chắn gây hiệu ứng" cũng gần như vô dụng vì ô vũ khí thứ hai ít khi được dùng.
- **Đề xuất:** thay 2 nút trên bằng nút đổi cách chơi, ví dụ "Né xuyên quái để lại vệt hệ" hoặc "Đòn kết chuỗi gây hệ chắc chắn". Gộp quặng và đá tôi làm một.

### 14. Nhịp cày — **Thấp**
- **[ĐO, `cay.txt`]:** 15 ải lần đầu mất **155 phút / 41 lượt**, trong đó **63% là chơi lại**. Mỗi ải ~4,8 phút. Điểm kẹt: **2-5 Ngư Tinh cần 10 lượt (35 phút)**, 1-5 cần 5 lượt, 3-5 cần 5 lượt.
- **Đề xuất:** đưa 2-5 về 6–7 lượt bằng cách giảm sát thương gốc Ngư Tinh (49% máu bé mỗi đòn) xuống **~35%**.

### 15. Tự ngắm mọi hướng kéo đòn lướt về phía quái — **Thấp** (chủ dự án chủ ý chọn)
- **[CODE]** `moves.js:214` `inCone`: khi `G.AIM_CONE == null` thì luôn ngắm quái gần nhất. Nhát lướt và Xốc tới vì vậy lao theo quái, kể cả khi người chơi đang kéo cần để chạy ra xa.
- **Đề xuất:** giữ tự ngắm cho đòn đứng tại chỗ. Riêng đòn **có di chuyển** thì đi theo hướng cần nếu cần đang kéo hơn 50%.

### 16. Động lực và cốt truyện — **Thấp** (thiết kế)
- **[CODE]** Không có đoạn truyện nào, chỉ có dòng "Cứu được {X}! Em bé mới đã mở." Sau 15 ải chỉ còn độ khó 2 và bảng vàng.
- **Đề xuất:** 3 đoạn thoại ngắn (Cụ Đồ) trước mỗi trùm vùng, 4–6 câu, gắn với truyền thuyết của trùm. Thêm một mục tiêu dài hạn nhìn thấy được, ví dụ khôi phục cây đa hoặc làng lớn dần theo số sao.

### 17. Lặt vặt — **Thấp**
- Dải tài nguyên ở lần chơi đầu hiện **9 số 0** (ảnh 04).
- Mở bản dist đôi khi có 1 lỗi tải 404: trình duyệt xin tệp `sw.js` từ `/game/dist/`. Lần thử lại không tái hiện được.
- Thua trùm sau 5 phút thì không nhận nguyên liệu nào, chỉ được 2 vàng mỗi quái hạ (`stage.js:494`). Đề xuất: được **30% nguyên liệu** nếu đã tới phòng trùm.

---

## Cảm nhận người mới [ĐO, `out/onboarding/`]
- Màn chào → làng **2,8 giây**, → bản đồ chọn ải 16 giây, → phòng đánh đầu tiên **~30 giây**. Nhanh, tốt.
- Làng có một dải chỉ đường rõ ("Tới bến đò… gặp Chú Lái Đò"). Mỗi phòng ải 1 dạy một thứ: chậu than → mana/Đặc biệt → đổi vũ khí → thương nhân → rương → suối → trùm.
- Hai chỗ gây rối: Sức mạnh 98/100 bị tô màu cảnh báo ngay ải hướng dẫn, và bài Lửa ra kết quả Độc (mục 6, 9).

## Đã chạy
`campaign.py` (dừng ở 3-5), `cay.py 1`, `au_onboarding.py`, `au_vu_khi.py 30 3`, `au_trum.py 60`, `au_tien_trien.py embe lop cap`, `balance.py 3 - 4,9,13,14 vukhi`, `au_luu.py`, `au_luu_hong.py`, `fuzz.py 4` (0 lỗi), cộng 3 script đo chưởng tự viết. Không bài nào quá 10 phút. Không sửa tệp nào trong repo.

## Top 5 việc nên sửa trước
1. **Cân lại 3 cây chưởng** (mục 1): Độc mây 0,12 → 0,06; Băng hit 1,2 → 1,8.
2. **Gỡ tường vảy cá và mở chỗ tiêu vàng** (mục 3): mài +10 dùng đá lửa; đổi vàng lấy nguyên liệu vùng cũ.
3. **Làm phẳng đường cong khó** (mục 4): hạ sát thương quái ải 2-1 và 3-1..3-4; máu Hổ Lửa phải thấp hơn Hồ Tinh.
4. **Kéo dài tiến hoá linh khí** (mục 2): mốc 60/400/1.200, thưởng +30%, dấu ấn thừa đổi ra thứ dùng được.
5. **Giữ an toàn bản lưu** (mục 5): `fixSave` lỗi phần nào thì giữ phần đó, không xoá trắng.

# Phụ lục B: Hình ảnh, giao diện, cốt truyện, âm thanh

Bản thử: game/dist/linh-khi.html?cloud=0, phiên bản lk-2026.10.11-2212. Máy giả lập: iPhone ngang 844×390 (tỉ lệ ảnh 3), máy lớn 932×430, máy tính bảng 1180×820.
Ảnh chụp ở: `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/` (dưới đây viết tắt `anh/`). Ảnh có chữ `L-` ở đầu là máy lớn, `T-` là máy tính bảng.
Tôi không sửa tệp nào trong repo. Script chụp nằm ở `tester-2/s1.py` … `s4.py`.

Ký hiệu: **[THẤY]** là đã thấy tận mắt trên ảnh chụp. **[ĐOÁN]** là suy ra từ code hoặc chưa kiểm hết.

---

## 1. Tóm tắt (5 dòng)

1. Làng, bản đồ vùng, ba trùm pha 1 và quái thường (ảnh AI) đẹp và cùng một phong cách pixel mịn. Bộ khung giao diện "trống đồng" xanh viền vàng dùng đồng đều ở mọi bảng.
2. Chỗ hỏng nặng nhất là **tỉ lệ**: vũ khí to gần bằng hoặc to hơn em bé (búa gấp đôi người, giáo che kín Cu Tèo), em bé quá nhỏ so với quái và trùm, và trong trận đông quái thì em bé biến mất dưới hiệu ứng và số sát thương.
3. **Hình code lẫn với ảnh AI** còn rõ: nón lá vẽ code, áo vải không hiện trên người, pha 2 và pha 3 của trùm chỉ là ảnh pha 1 đổi màu nên có vụn điểm ảnh. Lâu đài cổ mang kiểu châu Âu (cửa kính màu, cờ có thánh giá), lạc khỏi chủ đề dân gian Việt.
4. **Giao diện** đọc được trên điện thoại. Nhưng nhiều nút nhỏ hơn 44 pt (Xong, thẻ mục, Bản đồ, Bán hết…), chữ phụ chỉ khoảng 8–10 pt, vài chỗ chữ tràn hoặc bị cắt, và có quá nhiều thuật ngữ (linh khí, dấu ấn, Mầm, Thành hình, Thức tỉnh, chưởng, điểm chưởng, dòng phụ, dòng mạnh…).
5. **Không có cốt truyện**: lời thoại làng ngắn, có giọng quê dễ thương, nhưng không có mở đầu, không giải thích vì sao đi đánh trùm, trùm không nói câu nào. **Âm thanh** chỉ có 15 tiếng "bíp" tạo bằng code, không có nhạc nền, không có tiếng nhạc cụ dân tộc, không có thanh chỉnh âm lượng.

| Mảng | Điểm (1–10) | Lý do ngắn |
|---|---|---|
| Hình ảnh | **6,5** | Ảnh AI đẹp, nhưng tỉ lệ vũ khí và em bé sai, còn hình code, pha trùm đổi màu bị lỗi |
| Màu sắc | **6** | Bảng màu làng và vùng tốt. Em bé nâu chìm vào quái nâu và sàn xanh; trùm nước pha 2 nhuộm đỏ; đỏ báo đòn chồng nhiều lớp |
| Giao diện | **6** | Đồng bộ và rõ, nhưng nút nhỏ, nhiều chữ, nhiều thuật ngữ, dấu đỏ thông báo ở khắp nơi |
| Hoạt ảnh | **5,5** | Đi lại và đánh mượt; vũ khí lơ lửng ngoài tay; trận đông thì hỗn loạn; pha 3 của Hồ Tinh không khác pha 1 |
| Cốt truyện / lời thoại | **4** | Không có cốt truyện; thoại người làng hay nhưng ít; xưng hô lẫn "bạn" và "con"; còn chữ "hero" |
| Âm thanh | **2,5** | 15 tiếng bíp tổng hợp, không nhạc, không tiếng môi trường, chỉ có nút bật/tắt |

---

## 2. Danh sách vấn đề

### NGHIÊM TRỌNG

**N1. Trận đông quái: không nhìn thấy em bé, số sát thương chồng lên nhau** [THẤY]
- Ở đâu: phòng thường Lâu đài cổ (vũ khí hệ Lửa), cả Rừng già (hệ Độc).
- Hiện tượng: em bé bị vùi trong đống lửa, khói, tia sáng; các số 3, 6, 60, 29, 87, 38 đè lên nhau; thanh máu quái chồng lên số. Ở Rừng, đám mây độc xanh to gấp 3–4 lần em bé, che cả quái. Ảnh `anh/20-tran-lau-dai-dong-quai.png`, `anh/21-tran-lau-dai-khung2.png`, `anh/20-tran-rung-dong-quai.png`.
- Đề xuất:
  - Hiệu ứng đòn của chính người chơi (lửa nổ, mây độc, tia sáng) giảm độ đặc xuống còn khoảng 55–65% và vẽ **dưới** lớp nhân vật. Chỉ giữ tia sáng trắng lúc chém trúng ở trên.
  - Luôn vẽ viền sáng 1 điểm ảnh quanh em bé (màu #fff4c0, độ đặc 0,8), giống viền xanh em bé đang có ở Hang biển.
  - Số sát thương: gộp các số của cùng một quái trong khoảng 0,25 giây thành một số. Mỗi số mới đẩy số cũ lên 6 điểm ảnh. Mỗi quái hiện tối đa 3 số.
  - Mây độc giới hạn bán kính khoảng 24 điểm ảnh của thế giới (bằng chiều cao 1 con quái thường).

**N2. Vũ khí quá to, không nằm trong tay** [THẤY]
- Ở đâu: em bé cầm 4 loại vũ khí, ở làng, màn chào và trong trận.
- Hiện tượng:
  - Kiếm dài gấp khoảng 1,5 lần chiều cao Cu Tí, dựng đứng lơ lửng bên cạnh, cách tay vài điểm ảnh.
  - Búa của Cái Bống to gấp đôi người, cán không chạm tay, đầu búa che thanh tích lực.
  - Giáo của Cu Tèo nằm ngang, đầu giáo bốc lửa che kín người, không thấy em bé đâu.
  - Cung dựng dọc qua mặt Cu Lì, dây cung trắng cắt ngang mặt.
  - Ở làng, kiếm và cung bay sau lưng còn to hơn em bé. Trên màn chào, thanh kiếm lửa cao hơn em bé.
  - Ảnh: `anh/41-vk-4-loai-chuoi-khung.png`, `anh/42-vk-phong-to-tay-cam.png`, `anh/30-trum-rung-pha1.png`, `anh/04-lang.png`, `anh/01-man-chao-lan-dau.png`.
- Đề xuất:
  - Đặt trần chiều dài vũ khí trong trận, theo chiều cao thân em bé (khoảng 24 điểm ảnh của thế giới): kiếm ≤ 0,9 lần thân, giáo ≤ 1,2 lần thân (lúc cầm ngang thì đầu giáo phải ra khỏi người), búa ≤ 0,8 lần thân và đầu búa ≤ 0,45 lần thân, cung ≤ 0,8 lần thân.
  - Khi đứng yên, gắn chuôi vào điểm tay của thân AI (Đợt 5 đã có neo tay; vẫn thấy lệch ở thân mặc định).
  - Vũ khí bay theo ở làng thu nhỏ còn 60%.
  - Hệ Lửa: chỉ cho lưỡi phát sáng, không biến cả cây vũ khí thành ngọn lửa.

**N3. Không có cốt truyện** [THẤY trên màn hình, ĐOÁN thêm qua code]
- Ở đâu: toàn game. Màn chào chỉ có khẩu hiệu "Vũ khí lớn lên theo bạn. Yêu tinh học theo bạn."
- Hiện tượng: không có đoạn mở đầu. Không ai nói vì sao làng cần em bé đi đánh Mộc Tinh, Ngư Tinh, Hồ Tinh. Trùm chỉ hiện băng chữ "Mộc Tinh xuất hiện" và "… nổi giận!". Tôi tìm trong stage.js, boss.js, village*.js không thấy câu thoại nào của trùm.
- Đề xuất (nội dung tối thiểu):
  - (a) Đoạn mở đầu 3 khung tranh: ba yêu tinh chiếm rừng, biển, lâu đài; linh khí trong vũ khí làng đang cạn; Cụ Đồ gọi các em bé.
  - (b) Mỗi trùm có 1 câu khi ra mắt và 1 câu khi gục.
  - (c) Sau khi hạ mỗi trùm, một người làng nói một câu mới (ví dụ: Chú Lái Đò "Nước êm rồi, cháu đi Hang biển được").
  - (d) Bé bị khoá (Cu Lì) có một câu giải thích vì sao đang ở chỗ Hồ Tinh.

### CAO

**C1. Pha 2 và pha 3 của trùm trông như lỗi hình** [THẤY]
- Ở đâu: Mộc Tinh pha 3, Ngư Tinh pha 2, Hồ Tinh pha 2 và 3.
- Hiện tượng:
  - Mộc Tinh pha 3 bị nhuộm tím, mép rỗ điểm ảnh như ảnh hỏng.
  - Ngư Tinh pha 2 nhuộm đỏ, có các chấm thủng li ti, mép đen vụn. Trùm hệ Băng mà màu đỏ thì người chơi dễ hiểu nhầm là hệ Lửa hoặc là vùng nguy hiểm.
  - Hồ Tinh pha 2 bị tẩy trắng nhạt; pha 3 giống hệt pha 1.
  - Ảnh: `anh/30-trum-rung-pha3.png`, `anh/30-trum-bien-pha2.png`, `anh/32-trum-pha2-va-ra-mat-ghep.png`, `anh/30-trum-lau-dai-pha3.png`.
- Đề xuất: trong khi chờ ảnh AI của lô E2, đừng nhuộm cả thân. Giữ ảnh pha 1 và chỉ thêm (a) một vầng hào quang theo màu hệ của trùm (Mộc #8ac84a, Ngư #5ab0f0, Hồ #ff8a4a) và (b) mắt đỏ phát sáng. Không đổi sang màu đỏ cho trùm Băng.

**C2. Hình code lẫn với ảnh AI** [THẤY]
- Ở đâu: Thợ May, Hành trang, làng, Cụ Đồ.
- Hiện tượng:
  - Nón lá là hình tam giác phẳng vẽ code, nét gắt, có chấm trắng ở mép vành. Quai đỏ thành vệt sẫm dọc má trông như vết sẹo.
  - Mặc "Áo vải thô" nhưng thân vẫn để trần, không thấy áo.
  - Trên người có các dấu "+" trắng lơ lửng (có lẽ là lấp lánh của bùa), trông như điểm ảnh rác.
  - Ảnh: `anh/11-tho-may.png`, `anh/L-11-tho-may.png`, `anh/07-bang-hanh-trang.png`.
- Về chuyện "mũ to quá": nón lá giờ rộng khoảng 1,4 lần đầu, ngồi hơi cao, không trùm xuống đầu. Kích cỡ chấp nhận được nhưng vẫn lệch phong cách. Đề xuất hạ nón 2 điểm ảnh để vành che tới chân tóc, bỏ chấm trắng, quai vẽ 1 điểm ảnh màu #b0402a ở dưới cằm chứ không vẽ dọc má.
- Áo chưa có ảnh thì ít nhất tô một mảng áo màu #8a6a44 lên thân.
- Các mũ của bộ Mộc, Ngư, Hồ trong trận khớp đầu tốt (`anh/43-mu-ao-trong-tran-phong-to.png`).

**C3. Nhân vật lệch chủ đề** [THẤY]
- Ở đâu: Cái Bống, Cụ Đồ, Lâu đài cổ.
- Hiện tượng:
  - Cái Bống (bé trị thương, tên con gái dân gian) lại là **bộ xương trắng có ngọn lửa xanh** trên đầu, ở Ông Từ, sân đình và trong trận.
  - Cụ Đồ mặc com-lê đen, thắt nơ đỏ như người phương Tây.
  - Phòng Lâu đài cổ có cửa sổ kính màu kiểu nhà thờ và **cờ xanh có hình thánh giá**.
  - Ảnh: `anh/14-ong-tu-chon-em-be.png`, `anh/12-cu-do-ky-nang.png`, `anh/20-tran-lau-dai-dong-quai.png`, `anh/05-lang-di-lai-toan-canh.png`.
- Đề xuất:
  - Cái Bống: bé gái tóc trái đào, áo yếm nâu, có giỏ lá thuốc. Cảm giác "linh hồn" thì để vầng sáng xanh mờ quanh người.
  - Cụ Đồ: áo the đen, khăn xếp, râu bạc, cầm bút lông.
  - Lâu đài cổ: đổi cờ thánh giá thành cờ đuôi nheo có chữ Hán hoặc hình hổ; cửa kính màu đổi thành cửa sổ chấn song gỗ. Nếu muốn giữ kiểu "lâu đài" thì đổi tên vùng thành "Thành cổ" và vẽ theo thành Cổ Loa hoặc cung điện cổ.

**C4. Em bé quá nhỏ và chìm vào màu nền, màu quái** [THẤY]
- Ở đâu: phòng thường và phòng trùm.
- Hiện tượng: em bé cao khoảng 1/3 con lợn rừng, khoảng 1/6 trùm. Khi mặc bộ Mộc (nâu) đứng cạnh lợn nâu trên sàn xanh rêu thì gần như mất hút. Ảnh `anh/53-chet.png`, `anh/20-tran-rung-dong-quai.png`.
- Đề xuất: phóng em bé trong trận lên khoảng 1,25 lần, hoặc thu quái thường còn khoảng 0,85 lần. Luôn có vòng sáng dưới chân em bé (màu #ffe08a, độ đặc 0,35, rộng 14×5 điểm ảnh) cho dễ tìm, như kiểu Hades và Archero.

**C5. Nút bấm nhỏ hơn 44 pt** [THẤY trên ảnh, đo theo tỉ lệ 1,444 CSS px cho mỗi điểm ảnh game trên iPhone 844×390]
- Nút "✕ Xong" và "✕ Về làng" cao 17–18 điểm ảnh game, khoảng 25 pt.
- Thẻ mục (Mài, Nâng bậc…; Cây kỹ năng…) khoảng 29 pt.
- Nút "Bản đồ" trong phòng trùm khoảng 17 pt.
- "Bán hết Thường", "Bán hết Lam", "Chọn nhiều" khoảng 13–15 pt.
- Ổ khoá cạnh mỗi món khoảng 12 pt.
- Nút Dừng khoảng 32 pt; ô Bình máu khoảng 36 pt.
- Ảnh: `anh/10-hang-xen.png`, `anh/30-trum-rung-pha1.png`, `anh/09-lo-ren-mai.png`.
- Đề xuất: mọi nút có thể bấm cao tối thiểu 30 điểm ảnh game (khoảng 44 pt), hoặc vùng chạm có thêm lề vô hình để đủ 44×44 pt. Nút "Bản đồ" thì bỏ và cho chạm thẳng vào bản đồ nhỏ, như ở phòng thường.

**C6. Thuật ngữ quá nhiều và chồng nghĩa** [THẤY]
- Ở đâu: Xem vũ khí, ô vũ khí, màn kết quả, Cụ Đồ.
- Hiện tượng:
  - Ô vũ khí ghi "Thường / Trắng": hai chữ gần nghĩa nhau nhưng một chữ là bậc, một chữ là cấp hệ.
  - Chuỗi "Trắng → Mầm → Thành hình → Thức tỉnh", cộng thêm "linh khí", "dấu ấn", "đặc trưng", "luật hệ", "dòng phụ", "dòng mạnh", "nấc", "điểm kỹ năng" và "điểm chưởng".
  - Màn thắng ghi "Kiếm Rèn – không nhận dấu ấn" ngay trên dòng "Chưa có dấu ấn. Kết liễu quái…", nên người chơi tưởng vũ khí không nhận được dấu ấn.
  - Phần hướng dẫn dài 12 trang toàn chữ.
  - Ảnh: `anh/16-xem-vu-khi.png`, `anh/50-ket-qua-thang.png`, `anh/12b-cu-do-chuong.png`, `anh/12c-cu-do-huong-dan.png`.
- Đề xuất:
  - Ô vũ khí chỉ hiện biểu tượng hệ và màu khung theo bậc; bỏ chữ "Thường" và "Trắng".
  - Gộp "linh khí" và "dấu ấn" thành một từ: "linh khí".
  - Đổi "không nhận dấu ấn" thành "trận này chưa nhận linh khí".
  - Hướng dẫn: mỗi trang có 1 hình minh hoạ và tối đa 2 câu.

### VỪA

**V1. Chữ tràn, chữ bị cắt** [THẤY]
- Số linh khí "132/300" và "131/300" tràn ra ngoài khung thanh hệ (`anh/20-tran-bien-dong-quai.png`).
- "Bình máu" bị nút Dừng đè mất chữ "u" (mọi ảnh trận).
- Cây chưởng ghi "Xuyên b…", "Đóng bă…" (`anh/12b-cu-do-chuong.png`).
- "Ngôn ngữ / Tiếng Việt" hai dòng chật trong nút, dòng dưới chạm viền (`anh/15-cai-dat.png`).
- Dòng "Chưa mang hệ. Hạ tinh anh, trùm hoặc nhặt viên linh khí" chạm viền dưới ô (`anh/16-xem-vu-khi.png`).
- Bảng chọn ải: "vũ khí quý" rớt xuống dòng thứ hai sát viền (`anh/08b-lai-do-chon-ai-trum.png`).
- Nón lá của Cu Tí nhô ra khỏi thẻ ở Ông Từ (`anh/14-ong-tu-chon-em-be.png`).
- Đề xuất:
  - Thanh hệ: đưa số ra ngoài, bên phải thanh, hoặc chỉ hiện số của hệ chính.
  - "Bình máu": bỏ chữ, chỉ để hình và số ×2.
  - Tên kỹ năng tối đa 8 ký tự ("Xuyên băng" → "Xuyên", "Đóng băng" → "Đóng").
  - Nút Ngôn ngữ viết một dòng "VI / EN".

**V2. Chữ phụ quá nhỏ trên điện thoại** [THẤY]
- Ở đâu: số mana "♦30" và "♦20" dưới nút, nhãn "không nhận dấu ấn", "Thường/Lam" trong ô vũ khí, chữ "trống" trong ô đồ.
- Hiện tượng: cỡ chữ 6,5–7 điểm ảnh game (khoảng 9–10 pt). Số mana trắng trên nút màu kem lúc nút sáng gần như không đọc được (`anh/20-tran-bien-dong-quai.png`).
- Đề xuất: chữ tối thiểu 8 điểm ảnh game (khoảng 11,5 pt) và có viền tối 1 điểm ảnh. Số mana đặt trong viên nhỏ nền #1a2a3a.

**V3. Báo đòn đỏ chồng nhiều lớp cùng một màu** [THẤY]
- Ở đâu: Ngư Tinh pha 3, Hồ Tinh pha 2.
- Hiện tượng: vòng tròn đồng tâm, hình chữ nhật và các vòng nhỏ cùng một màu đỏ sọc, chồng lên nhau; không biết đòn nào nổ trước (`anh/30-trum-bien-pha3.png`).
- Đề xuất: vùng sắp nổ (dưới 0,4 giây) đậm #ff3a2a với viền trắng nhấp nháy; vùng còn lâu nhạt #ff3a2a ở độ đặc 0,25 và không có sọc.

**V4. Rác thông tin ở làng** [THẤY]
- 6 trên 7 khuôn mặt có chấm đỏ thông báo, 5 người làng có dấu "!" vàng cùng lúc.
- Dòng mẹo "Kéo bên trái để đi…" vẫn hiện ở cấp 14, che phần dưới làng.
- Nút "Nói chuyện" nửa trong suốt đè lên sông và thuyền.
- Ảnh: `anh/04-lang.png`, `anh/T-04-lang.png`.
- Đề xuất: chỉ bật chấm đỏ hoặc "!" khi có việc **làm được ngay** (đủ tiền hoặc đủ điểm); tối đa 2 dấu cùng lúc. Dòng mẹo tắt sau 2 lần vào làng.

**V5. Chữ để lộ chuyện làm game** [THẤY]
- Lò rèn, thẻ "Rèn đồ" là thẻ chết, ghi "Mũ áo ông rèn trước đây đã được chuyển sang kho trang phục, không mất món nào." Đây là lời giải thích cho người chơi bản cũ (`anh/09d-lo-ren-ren-do.png`).
- Đề xuất: bỏ hẳn thẻ "Rèn đồ" và để Ông Thợ Rèn nói "Đồ vải vóc thì sang Cô Thợ May nhé cháu" khi chạm vào khuôn mặt cô.

**V6. Xưng hô và chữ tiếng Anh lẫn vào** [THẤY]
- "Sân đình: chọn hero" (village.js dòng 564). Các chỗ khác đều gọi là "em bé".
- Người làng gọi "con", "cháu", nhưng màn thua ghi "**Bạn** đã gục…", màn chào ghi "theo **bạn**".
- Tiêu đề "Gốc đa: Cu Tí" khó hiểu (gốc đa của ai?).
- Ảnh: `anh/14-ong-tu-chon-em-be.png`, `anh/51-ket-qua-thua.png`.
- Đề xuất: "Sân đình: chọn em bé"; "Bé đã gục ở phòng…"; "Gốc đa: Cụ Đồ dạy chiêu".

**V7. Số thập phân ghi lẫn hai kiểu** [THẤY]
- Cùng một bảng có "Sát thương mỗi đòn 19.9" (dấu chấm) và "hệ số bậc x1,3" (dấu phẩy) (`anh/16-xem-vu-khi.png`).
- Đề xuất: tiếng Việt thống nhất dùng dấu phẩy ("19,9").

**V8. Thanh máu hiện số âm** [THẤY trong ca thử ép chết, ĐOÁN có thể gặp khi chơi thật]
- "-8 / 152" và thanh máu màu trắng vàng (`anh/53-chet.png`). Tôi gọi thẳng hàm gây sát thương nên có thể ca thường không gặp.
- Đề xuất: chữ hiện `Math.max(0, hp)`.

**V9. Màn thắng nghèo hình ảnh** [THẤY]
- Màn thắng chỉ có chữ và biểu tượng; nửa phải để trống; các dòng "+220", "+140" không có tên tài nguyên; "Trong ải: 3 [biểu tượng]" khó hiểu (`anh/50-ket-qua-thang.png`).
- Đề xuất:
  - Thêm hình em bé giơ vũ khí (dùng thân AI), ba ngôi sao lớn hiện lần lượt.
  - Mỗi dòng thưởng ghi tên: "+220 kinh nghiệm", "+140 vàng".
  - Thẻ đồ rơi to hơn, có khung màu theo bậc.

**V10. Đi xuyên qua người và vật ở làng** [THẤY]
- Em bé đi xuyên qua Cụ Đồ và quầy Hàng xén, rồi khuất hẳn dưới cái dù (`anh/05-lang-di-lai-chuoi-khung.png`, `anh/05-lang-di-lai-toan-canh.png`).
- Đề xuất: khi em bé đứng sau vật che, vẽ hình bóng em bé mờ ở độ đặc 0,5; người làng có vòng va chạm nhỏ.

**V11. Máy tính bảng: viền đen lớn** [THẤY]
- Trên 1180×820, khung 16:9 để lại hai dải đen trên và dưới, mỗi dải khoảng 11% màn hình (`anh/T-04-lang.png`, `anh/T-00-man-tai-300ms.png`).
- Đề xuất: kéo dài nền làng và nền phòng ra hai dải đó; thanh tài nguyên dính lên mép trên.

### THẤP

- **T1.** Áo vải và bùa trong kho có biểu tượng khó nhận ra: áo trông như cục đá nâu, bùa là chấm xanh 2 điểm ảnh (`anh/11-tho-may.png`) [THẤY].
- **T2.** Hai bảng mục (Hàng xén, Thợ May) có nút thẻ dính sát nhau, chữ "Mua trang phục" chạm viền (`anh/10-hang-xen.png`) [THẤY].
- **T3.** Bản đồ vùng: chữ "Rừng già" xanh nhạt trên nền cây xanh, độ tương phản thấp; nên thêm viền tối 1 điểm ảnh (`anh/08-lai-do-ban-do.png`) [THẤY].
- **T4.** Ở bản đồ ải, dấu "⚔315" chồng lên các ngôi sao của ải 3 (`anh/08b-lai-do-chon-ai-trum.png`) [THẤY].
- **T5.** Anh Mõ cầm cái loa hình phễu chứ không cầm mõ gỗ (`anh/15-cai-dat.png`) [THẤY].
- **T6.** Phòng trùm Hồ Tinh (hệ Lửa) có tinh thể băng; phòng Ngư Tinh có chậu than. Nếu đây là vật "khắc chế" cố ý thì nên có mẹo nói rõ; nếu không thì trông lạc vùng (`anh/32-trum-pha2-va-ra-mat-ghep.png`) [THẤY].
- **T7.** Băng chữ "Mộc Tinh xuất hiện" mờ dần đè lên đầu trùm, để lại bóng chữ (`anh/30-trum-rung-pha1.png`) [THẤY].
- **T8.** Màn tải: tôi không chụp được vì máy chủ trên máy tải quá nhanh, kể cả khi giả mạng chậm (trình duyệt dùng lại tệp đã lưu). Ảnh 300 ms đã là màn chào [ĐOÁN: cần thử trên web thật ở mạng 3G].

---

## 3. Âm thanh (đọc code `game/js/engine.js` dòng 191–236)

**Có:**
- 15 tiếng tạo bằng sóng đơn giản, không dùng tệp âm thanh: hit, swing, hurt, mark, evolve, warn, gong, pick, die, fire, poison, ice, boom, ui, win.
- Giới hạn tối đa 8 tiếng cùng lúc, mỗi loại tối đa 2 tiếng, có trần tổng âm lượng.
- Một nút "Âm thanh: bật/tắt".

**Thiếu:**
- Không có nhạc nền nào: không có nhạc làng, nhạc từng vùng, nhạc trùm.
- Không có tiếng môi trường (gió tre, nước, lửa lò rèn).
- Không có tiếng riêng cho từng loại vũ khí; búa và kiếm cùng một tiếng "swing".
- Không có tiếng riêng cho từng trùm khi gầm, ra chiêu hoặc gục; chỉ có "gong" lúc ra mắt và đổi pha.
- Không có tiếng thua; tiếng thắng chỉ là một nốt dài 0,5 giây.
- Không có tiếng bước chân, tiếng mở rương hay tiếng mua bán khác "ui".
- Không có thanh chỉnh âm lượng, không tách nhạc với tiếng hiệu ứng, không có rung máy.

**Đề xuất:** đây là chỗ dễ làm game "có hồn Việt" nhất.
- Nhạc làng: sáo trúc và đàn bầu, khoảng 60–90 giây, lặp liền.
- Mỗi vùng một vòng nhạc: Rừng dùng trống và tiếng côn trùng; Biển dùng đàn tranh và sóng; Lâu đài dùng trống chầu và chiêng.
- Trùm: trống dồn, đổi nhịp khi sang pha.
- Tiếng hiệu ứng: thay "gong" bằng tiếng chiêng thật; thêm tiếng mõ cho nút giao diện.
- Cài đặt có 2 thanh: Nhạc và Tiếng.
- Giữ trần cỡ tệp: nhạc dạng ogg/mp3 khoảng 64 kbps, mỗi bài khoảng 0,5–0,8 MB.

---

## 4. Cốt truyện và lời thoại (đọc `village_scene.js` NPCS, `village.js` HELP, `stage.js`, `boss.js`)

- **Có:** 7 người làng, mỗi người có câu chào và câu tạm biệt riêng, giọng quê ấm áp. Ví dụ: "Lên đò đi cháu, nước đang êm.", "Cốc cốc cốc! Làng nước nghe đây!", "Khẽ thôi, các bé đang chơi trong sân.", "Bảng vàng treo ở đình, phải có mạng mới xem được, con ạ." Đây là điểm mạnh và nên làm thêm.
- **Không có:** đoạn mở đầu, mục tiêu cốt truyện, câu thoại của trùm, đoạn kết vùng. Tên trùm (Mộc Tinh, Ngư Tinh, Hồ Tinh) gợi đến "Thạch Sanh" và "Hồ ly tinh" nhưng game không kể gì.
- **Câu khó hiểu:** "Thường / Trắng" trên ô vũ khí; "Kiếm Rèn không nhận dấu ấn"; "Mảnh của vùng sau cho Vàng mạnh hơn"; "Gốc đa: Cu Tí"; "Sức mạnh 136 / khuyên dùng 315" (chữ "khuyên" đứng một mình ở bảng bên trái trận).
- **Lỗi chính tả:** tôi không thấy lỗi gõ sai trên các màn đã chụp. Các lỗi chủ yếu là không thống nhất: "hero" và "em bé"; "bạn" và "con"; "19.9" và "x1,3".

---

## 5. Mười ảnh tiêu biểu nên gửi chủ dự án

1. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/21-tran-lau-dai-khung2.png`: em bé biến mất trong hiệu ứng, số chồng nhau.
2. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/42-vk-phong-to-tay-cam.png`: búa, giáo, cung, kiếm quá to và lệch tay.
3. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/41-vk-4-loai-chuoi-khung.png`: chuỗi khung 4 vũ khí.
4. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/30-trum-bien-pha2.png`: Ngư Tinh pha 2 nhuộm đỏ, vụn điểm ảnh.
5. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/30-trum-rung-pha3.png`: Mộc Tinh pha 3 nhuộm tím, rỗ mép.
6. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/11-tho-may.png`: nón lá vẽ code, áo không hiện, dấu "+" trắng.
7. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/14-ong-tu-chon-em-be.png`: Cái Bống là bộ xương, tiêu đề còn chữ "hero".
8. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/20-tran-bien-dong-quai.png`: số "132/300" tràn khung, chữ mana nhỏ, "Bình máu" bị che.
9. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/16-xem-vu-khi.png`: thuật ngữ dày đặc, "19.9" lẫn "x1,3".
10. `/tmp/claude-0/-home-claude-new-project/52818104-cc44-5676-9a9e-80d37d57856b/scratchpad/tester-2/anh/04-lang.png`: làng đẹp nhưng nhiều dấu thông báo, mẹo che phía dưới, vũ khí bay sau lưng to hơn em bé.

(Thêm nếu cần: `anh/09d-lo-ren-ren-do.png` thẻ chết; `anh/50-ket-qua-thang.png` màn thắng nghèo hình ảnh; `anh/12-cu-do-ky-nang.png` Cụ Đồ mặc com-lê; `anh/32-trum-pha2-va-ra-mat-ghep.png` bốn ảnh trùm.)

---

## 6. Năm việc nên sửa trước

1. **Độ đọc trận đấu (N1 + C4):** hiệu ứng của người chơi nhạt đi và vẽ dưới nhân vật; viền sáng và vòng chân cho em bé; gộp số sát thương; phóng em bé lên khoảng 1,25 lần.
2. **Tỉ lệ vũ khí (N2):** đặt trần kích thước theo thân em bé, gắn chuôi vào tay, vũ khí bay ở làng thu còn 60%, hệ Lửa không đốt cả cây vũ khí.
3. **Pha trùm (C1):** bỏ cách nhuộm cả thân, dùng hào quang theo màu hệ cho tới khi có ảnh AI của lô E2; không để trùm Băng có màu đỏ.
4. **Đúng chủ đề (C3 + C2):** vẽ lại Cái Bống, Cụ Đồ; bỏ thánh giá và cửa kính màu ở Lâu đài; đưa nón lá và áo vải vào lô ảnh AI.
5. **Cốt truyện và âm thanh tối thiểu (N3 + phần 3):** đoạn mở đầu 3 khung tranh, mỗi trùm 2 câu thoại; một bài nhạc làng bằng sáo trúc và một bài nhạc trận; thêm thanh âm lượng. Song song, sửa các nút nhỏ hơn 44 pt (C5) vì dễ sửa mà ảnh hưởng mọi người chơi.

# Phụ lục C: Hiệu năng, bộ nhớ, ổn định

Tester 3. Ngày 11/10/2026. Bản đo: commit `8bcb9499`, đóng gói hai tệp (`--hai-tep`) trong bản sao của repo. Repo gốc không bị sửa.

## Tóm tắt 5 dòng

1. **Tải chậm hơn nhiều so với Đợt 10.** Lượng tải về tăng từ 6,8 MB lên **18,6 MB** (trang chính 2,70 MB, tệp ảnh 15,87 MB, đã nén gzip). Trên 4G với CPU chậm ×4, màn chào hiện sau **7,5 giây** và tải đủ ảnh sau **30 giây**. Trên 3G chậm, hai mốc đó là **19 giây** và **109 giây**.
2. **Trong lúc tệp ảnh đang tải, game giật nặng.** Ở CPU ×4, trong 20 giây đầu ở làng, máy chỉ vẽ được khoảng **8 khung/giây** và có những lần đứng hình tới **3,9 giây**. Mở lại lần hai (đã có bộ đệm) chỉ nhanh hơn khoảng 2 giây, vì chỗ nghẽn là CPU xử lý ảnh chứ không phải mạng.
3. **Chơi thường thì mượt, phòng đông thì không.** Bot chơi thường ở CPU ×1 đạt **58 khung/giây**. Phòng 14 quái có spam chưởng chỉ còn **16–29 khung/giây**, phòng trùm Hồ Tinh **10–15 khung/giây**. Ở CPU ×4 (gần máy tầm trung) chỉ còn **2–6 khung/giây**. Nguyên nhân chính đã tìm được: quái đã có ảnh AI mà game vẫn dựng thân bằng code từng điểm ảnh rồi bỏ đi. Thử tắt phần này thì trùm Hồ Tinh tăng từ **14,8 lên 58,5 khung/giây** ở CPU ×1, và từ **2,4 lên 16,5** ở CPU ×4.
4. **Bộ nhớ đồ hoạ tăng mãi, không dừng.** Sau 10 phút chơi bằng bot, số canvas còn sống tăng đều từ 905 lên **5 299** (72 triệu điểm ảnh, khoảng 290 MB nếu trình duyệt cấp đủ vùng nhớ cho từng canvas). Bộ nhớ của tiến trình trang lên 930 MB, có lúc **1,2 GB**. Bộ nhớ JS thì ổn định ở 45–75 MB, không rò. Trên iPhone, mức này có nguy cơ cao làm Safari tự tải lại trang.
5. **Ổn định và lưu/tải tốt.** Không có lỗi trang (pageerror) nào trong suốt các lượt đo, kể cả 10 phút chơi liên tục. Chặn tệp ảnh thì game vẫn chạy. Bản lưu hỏng được chép ra khoá dự phòng. localStorage bị chặn cũng không treo. Ẩn trang thì game tự tạm dừng.

| Hạng mục | Điểm (1–10) |
|---|---|
| Tốc độ tải | **4** |
| Độ mượt | **4** (chơi thường 7, phòng đông/trùm hoặc máy yếu 2) |
| Bộ nhớ | **3** |
| Ổn định | **8** |
| Lưu/tải | **7** |

## Cách đo và giới hạn (đọc trước khi xem số)

- **Môi trường:** Chromium headless shell (Playwright) trên máy chủ Linux 2 lõi Xeon 2,8 GHz, **không có GPU** (canvas vẽ bằng CPU). Giả lập iPhone ngang 844×390, dpr 3, `isMobile`, `hasTouch`. CPU chậm dùng CDP `Emulation.setCPUThrottlingRate` 4 và 6. Mạng: CDP `Network.emulateNetworkConditions`, gồm 4G (9 Mbps, trễ 170 ms) và 3G chậm (1,5 Mbps, trễ 300 ms).
- **Máy chủ thử** (`srv.py`) làm giống Firebase Hosting: nén gzip, có ETag/304, `index.html` để `no-cache`, tệp ảnh để `max-age=1 năm, immutable`. Service worker `sw.js` bật ở bài tải lần 2. Mọi lượt đều dùng `?cloud=0` và chặn Google Fonts.
- **Không đo được bản thật** https://spiritblade.web.app, vì proxy trả 403 cho máy chủ này. Mọi số đo đều lấy từ bản build cục bộ, cùng commit.
- **Máy có lúc bị chia CPU** với các phiên tester khác (load average lên 5,7 trên 2 lõi). Vì vậy số tuyệt đối dao động khoảng ±40 %. Ví dụ phòng đông Rừng ở CPU ×1 đo hai lần ra 15,9 và 28,8 khung/giây. Hãy so **tương đối** trong cùng một lượt (bảng A/B ở mục 3 chạy liền nhau).
- **Chromium máy chủ khác iPhone Safari thật:** iPhone có GPU, nên phần dán ảnh (drawImage) nhanh hơn nhiều. Ngược lại, phần JS dựng hình từng điểm ảnh, `getImageData` và giải mã PNG thì iPhone tầm trung chậm ngang khoảng CPU ×2–×4 ở đây. Giới hạn bộ nhớ canvas và cách Safari tự tải lại trang khi hết RAM **không giả lập được**: phần đó là suy đoán dựa trên số đo ở Chromium.
- Ký hiệu: **[ĐO]** là số đo trực tiếp. **[SUY]** là suy đoán hoặc rút ra từ đọc code.

## 1. Tải trang [ĐO]

Kích thước (byte, sau gzip -6 như Firebase):

| Tệp | Gốc | Truyền qua mạng | Đợt 10 (so sánh) |
|---|---|---|---|
| Trang chính `linh-khi-nhe.html` (319 hình bắt buộc) | 5 154 452 | **2 697 669** | 1 555 893 |
| Tệp ảnh tải sau `linh-khi-anh.14e288b936dd.json` (292 hình) | 21 245 299 | **15 873 406** | 5 229 402 |
| Tổng | 26,4 MB | **18,57 MB** | 6,79 MB |

Tệp ảnh: 40 quái/trùm chiếm 11,4 MB, 85 hiệu ứng 5,9 MB, 12 thân em bé 2,5 MB. Trùm và dáng pha là các tấm lớn nhất: hoTinh 1,7 MB, mocTinh-p3 1,2 MB, nguTinh-p3 1,2 MB.

Thời gian (mili giây tính từ lúc mở trang, CPU ×4 trừ dòng cuối):

| Mạng / lượt | Chữ "Đang tải…" | Màn chào | Vào làng (chạm) | Đủ ảnh tải sau | Long task sau khi vào làng |
|---|---|---|---|---|---|
| 4G, lần 1 (không đệm) | 297 | **7 511** | 10 084 | **30 027** | 15,3 s (khung tệ nhất 3,9 s) |
| 4G, lần 2 (có đệm + SW) | 190 | 5 682 | 8 608 | 28 673 | 13,2 s (khung tệ nhất 4,1 s) |
| 3G chậm, lần 1 | 518 | **19 056** | 22 047 | **109 266** | 53,5 s |
| 3G chậm, lần 2 | 197 | 12 078 | **26 767** (chạm bị trễ ~14 s) | 54 071 | 20,1 s (khung tệ nhất 10,4 s) |
| 4G, CPU ×1, lần 1 | 278 | 8 715* | 10 783 | 35 222 | 5,4 s |

\* Lượt này bị CPU của phiên khác chen vào, số lệch.

Nhận xét:

- Chữ "Đang tải…" hiện ngay (dưới 0,6 giây): đạt.
- **Lần 2 gần như không nhanh hơn.** Ở 4G, mốc đủ ảnh chỉ bớt 1,4 giây. Ở 3G nhanh gấp đôi nhưng vẫn mất 54 giây. Nghĩa là thời gian chủ yếu nằm ở CPU: đọc JSON từng dòng, `SC.add`, giải mã PNG, và cứ 400 ms lại xoá bộ nhớ đệm hình (`xoaNhoSau`) rồi dựng lại.
- Ở 3G lần 2, tệp ảnh về từ bộ đệm gần như cùng lúc, xử lý dồn dập làm luồng chính bận, nên **chạm vào màn chào phải 14 giây sau mới có tác dụng**.
- Trong 20–25 giây đang tải ảnh, người chơi đã ở làng nhưng game chỉ có 8 khung/giây ở CPU ×4 (247 khung trong 30 giây).

## 2. FPS và thời gian mỗi khung [ĐO]

Mỗi cảnh đo 12 giây. Số "ổn định" tính từ giây thứ 2 trở đi. Cột "2 giây đầu" là khung tệ nhất ngay khi vào cảnh (lúc hiệu ứng, ảnh xuất hiện lần đầu). Lượt đo `khung.json`:

| Cảnh | CPU ×1: FPS / p95 / tệ nhất (2 giây đầu) | CPU ×4 | CPU ×6 |
|---|---|---|---|
| Làng | 57,4 / 16,8 / 50 (167) ms | 16,8 / 100 / 283 (417) | 10,0 / 167 / 200 (600) |
| Phòng ít quái (3 con, Rừng) | 34,0 / 66,7 / 133 (**783**) | 5,9 / 267 / 333 (733) | 4,0 / 400 / 567 (1 200) |
| Phòng đông 14 quái + spam chưởng lửa (Rừng) | 15,9 / 150 / 367 (200) | 3,1 / 533 / **2 417** | 3,1 / 500 / 517 |
| Phòng đông + chưởng độc (Biển) | 18,6 / 100 / 283 | 3,1 / 550 / 650 | 2,7 / 550 / 683 |
| Phòng đông + chưởng băng (Lâu đài) | 19,1 / 100 / 367 | 4,3 / 533 / 633 | 3,5 / 467 / 467 |
| Trùm Mộc Tinh | 32,2 / 66,7 / 367 | 6,1 / 300 / 400 (683) | 3,9 / 433 / 533 |
| Trùm Ngư Tinh | 30,6 / 66,8 / 250 | 6,5 / 317 / 417 | 4,7 / 433 / 550 |
| Trùm Hồ Tinh | **10,4** / 217 / 800 | **2,2** / 1 067 / 1 500 | **1,6** / 950 / 1 350 |
| **Bot chơi thường 10 phút** (`bonho.json`) | **57–59** / 16,8 / 100–233 | – | – |

- Ở CPU ×4–×6, game chạy bù tối đa 5 bước logic mỗi khung (`engine.js frame`, `n < 5`). Khung dài 300 ms thì game **chạy chậm như quay chậm**, chưa kể giật.
- Các khung tệ trong 2 giây đầu (783 ms ở phòng ít quái, 1,2 giây ở CPU ×6) là lúc dựng lần đầu khung quái bằng code, tấm nhuộm màu và giải mã ảnh.

### Profiler CDP: hàm tốn nhất

- **Phòng đông, CPU ×4:** `G.drawWorld` 59 %. Trong đó `MA.draw` (quái) 35 %, `veKhung`/`ghepHinh` 26 %, riêng `inv` 13 % (tự thân). `drawImage` 17 % (tự thân). `BT.draw`/`maskOut` (báo trước) 13 %. Logic (`G.updateWorld`) chỉ 4 %.
- **Trùm Hồ Tinh, CPU ×4:** `veKhung` → `ghepHinh` **65 %** của toàn bộ thời gian, riêng `inv` 55 %. Hồ Tinh đã có ảnh AI, nhưng thân vẫn được dựng lại bằng code ở mỗi khung mới.

### Thử A/B: bỏ dựng thân bằng code khi quái đã có ảnh AI [ĐO]

Lượt B thay `MA.draw` bằng cách gọi thẳng `SC.veQuai`, nên mất bóng và hiệu ứng rời của quái. Lượt này chỉ để đo xem phần thân code tốn bao nhiêu, không phải bản sửa. A và B chạy liền nhau (`expA.json`, `expB.json`):

| Cảnh | A CPU ×1 | B CPU ×1 | A CPU ×4 | B CPU ×4 |
|---|---|---|---|---|
| Phòng đông Rừng + lửa | 28,8 FPS, p95 66,7 | **37,7**, p95 33,4 | 3,7 | **7,0** |
| Trùm Mộc Tinh | 43,4, p95 50 | **56,8**, p95 33 | 6,0 | **13,1** |
| Trùm Hồ Tinh | 14,8, p95 150 | **58,5**, p95 16,8 | 2,4 | **16,5** |

## 3. Bộ nhớ [ĐO]: 10 phút bot chơi liên tục, CPU ×1

Số đo lấy sau khi ép dọn rác bằng `gc()`. "Canvas sống" đếm bằng FinalizationRegistry gắn vào `createElement('canvas')`.

| Thời điểm | Heap JS | Canvas sống | Điểm ảnh canvas sống | RSS tiến trình trang | Nút DOM (kể cả canvas rời) |
|---|---|---|---|---|---|
| 21 s | 61,7 MB | 905 | 10,4 Mpx | 454 MB | 1 566 |
| 3 phút | 48,2 MB | 3 199 | 44,2 Mpx | 726 MB | 3 860 |
| 5,5 phút | 67,5 MB | 3 964 | 56,6 Mpx | **1 204 MB** | 4 625 |
| 10 phút | 51,0 MB | **5 299** | **72,1 Mpx** | 933 MB | 5 960 |

- **Heap JS không rò:** dao động 45–75 MB, không có xu hướng tăng.
- **Canvas rò kiểu bộ nhớ đệm không có trần:** tăng đều khoảng 440 canvas mỗi phút và chưa thấy chững lại. 72 Mpx × 4 byte ≈ 290 MB vùng nhớ ảnh.
- Thêm vào đó là ảnh PNG đã giải mã: tính từ kích thước, cả 611 hình giải mã ra **187 MB** RGBA (riêng tệp tải sau 167 MB). Tấm lớn nhất 3 328×1 536 = 20 MB.
- Trùm Hồ Tinh chớp trắng lần đầu tạo một tấm nhuộm cỡ **cả tờ sprite** (5,1 Mpx = 20 MB) trong `sprite_custom.js nhuom()`. Đã đo bằng `sp.mau`.
- [SUY] iOS Safari giới hạn tổng bộ nhớ canvas (thường vài trăm MB) và tự tải lại tab khi hết RAM. Mức 0,9–1,2 GB như trên có thể làm iPhone 2–4 GB RAM văng hoặc tải lại trang sau 5–15 phút chơi, nhất là sau khi gặp cả 3 trùm. Khi canvas vượt trần, Safari còn có thể vẽ **trắng hoặc trống** canvas mới tạo.

## 4. Ổn định [ĐO]

| Kiểm | Kết quả |
|---|---|
| Lỗi trang (pageerror) suốt mọi lượt (khoảng 25 phút chạy game) | **0** |
| Lỗi console | Chỉ có: tải Google Fonts thất bại (do bị chặn khi đo), và 38 cảnh báo Chrome "getImageData nên đặt `willReadFrequently`" (xem vấn đề V7) |
| 10 phút chơi liên tục | Không treo; bot qua 3 ải, vào ải thứ 4 |
| Ẩn trang (`visibilitychange` hidden + đóng băng trang 4 s) | Game tự chuyển sang `paused` (`stage.js hide()`). Quay lại không có khung dồn (tệ nhất 33 ms), không lỗi. Chuyển tab trong headless không đổi `visibilityState` được, nên phần này đo bằng cách giả lập sự kiện |
| Xoay dọc ↔ ngang 12 lần (CDP đổi kích thước + hướng màn hình) | Không lỗi. Khung game tự xoay 90° và giữ hình ngang, tỉ lệ không đổi, canvas `#ui` không cấp phát lại. FPS sau đó 53 |
| Chặn tệp ảnh tải sau | Thử 3 lần, sau **16,2 giây** thì thôi (`tt: 'loi'`). Trùm Mộc Tinh vẽ bằng code, phòng trùm chạy 29 FPS, không lỗi |

## 5. Lưu/tải [ĐO]

| Kiểm | Kết quả |
|---|---|
| Bản lưu JSON cụt `{"v":1,"gold":55` | Không treo, vào được làng. Bản cũ được chép nguyên văn sang `linhkhi_save_v1_hong`. Bắt đầu lại từ bản trắng, có 2 dòng `console.error` giải thích |
| Tải lại giữa ải | Vàng, sao, cấp còn nguyên (đã lưu trước khi vào ải). **Lượt ải đang chơi bị mất**, về màn chào |
| `localStorage.setItem` ném QuotaExceeded | Chơi bình thường, không lỗi (không lưu được) |
| Truy cập `localStorage` ném SecurityError | Vào được làng, không treo |
| `?cloud=0` | Không gọi Firebase hay Google API nào. Yêu cầu ra ngoài duy nhất là `fonts.googleapis.com` |
| Kích thước bản lưu | 1,3 KB, rất xa trần 5 MB |

## 6. Pin / nhiệt

- [ĐO] Vòng `requestAnimationFrame` **không ngừng khi đang ở bảng tạm dừng**: vẫn khoảng 55 khung/giây, CPU tiến trình trang bận 95 %, ngang lúc đang đánh (95 %). Ở làng đứng yên cũng 93 %. Số % này bị phóng đại vì máy không có GPU và đang bị chia CPU, nhưng **tỉ lệ tạm dừng ≈ đang chơi** là đáng tin: tạm dừng không tiết kiệm gì.
- [SUY] Khi trang bị ẩn, trình duyệt tự dừng rAF, nên không tốn pin.
- [SUY] Trên điện thoại, chơi 15–20 phút có thể làm máy nóng và tụt xung nhịp. Lý do: mỗi khung đều vẽ lại toàn cảnh, chưa có giới hạn 30 FPS cho máy yếu, và dựng thân quái bằng code liên tục (mục 2).

## 7. Danh sách vấn đề

| # | Mức | Ở đâu | Hiện tượng + số đo | Nguyên nhân | Đề xuất sửa |
|---|---|---|---|---|---|
| V1 | **Nghiêm trọng** | Mọi phòng có quái/trùm đã có ảnh AI | Hồ Tinh: 10–15 FPS ở CPU ×1, 2 FPS ở CPU ×4. Bỏ phần thừa thì 58,5 và 16,5 FPS. Phòng đông +30 %, Mộc Tinh +30 % ở CPU ×1, gấp đôi ở CPU ×4 | `sprite_custom.js noiQuai()`: `MA.draw` bọc vẫn gọi `draw0` (vẽ code) với bút giả `butGia` (một `Proxy` + `Map` mới mỗi lần vẽ) để lấy bóng và hiệu ứng. `monster_art.js MA.draw` vẫn gọi `veKhung` → `ghepHinh` → `inv` (biến đổi ngược từng điểm ảnh) để dựng một khung thân **không bao giờ hiện ra** | Thêm cờ `o.chiFx` hoặc `o.boThan` vào `MA.draw`: khi có ảnh AI thì tính `Pose` và hiệu ứng nhưng **bỏ qua `veKhung`** (dùng hộp kích thước từ `B`, không cần `fr.cv`). Dựng `butGia` một lần và dùng lại, không tạo `Proxy` mỗi khung |
| V2 | **Nghiêm trọng** | Bộ nhớ canvas, cả game | Canvas sống tăng 905 → 5 299 sau 10 phút (72 Mpx, ~290 MB). RSS 0,93–1,2 GB | Nhiều bộ nhớ đệm canvas không có trần hoặc trần quá cao: `KHUNG` (monster_art, 2 500 khung + `sil` theo màu), `sp.than` (sprite_custom `khungThan`: mỗi khung × màu × mức, không trần, đo được 481 tấm), `sp.mau`, `sp.xoay` (400), `art.js SPR` (1 400), `hero_tinhlinh` (1 400 + 1 400 + 900), `fx_dan` và `btn_art` (900) | Đặt một **ngân sách điểm ảnh chung** (ví dụ 24 Mpx) với LRU, thay cho trần theo số lượng từng cache. Khi đổi phòng hoặc ải thì xoá cache của quái và trùm không còn trong phòng. Sửa V1 thì `KHUNG` cũng hết phình |
| V3 | **Cao** | Lúc tải tệp ảnh sau (20–80 giây đầu) | 8 FPS ở CPU ×4. Long task tổng 13–53 giây, khung tệ 3,9–10,4 giây. Chạm màn chào trễ 14 giây (3G, lần 2) | `sprite_custom.js chayNapSau`: `theoDoi` chạy mỗi 400 ms, cứ có hình mới là gọi `xoaNhoSau` → `xoaNhoDo()` xoá và dựng lại đồ trên người em bé. 292 ảnh base64 bị `JSON.parse` và giải mã trên luồng chính. Lần 2 không nhanh hơn vì nghẽn ở CPU | (a) Gom: chỉ xoá cache khi hình mới **đang được dùng** (thân em bé, đồ đang mặc), không xoá theo nhịp 400 ms. (b) Giải mã bằng `createImageBitmap(blob)` hoặc `img.decode()` ngoài luồng chính, mỗi khung tối đa 1–2 hình. (c) Tách ảnh thành tệp PNG/WebP riêng thay vì base64 trong JSON (bớt 25 % dung lượng và bỏ được `JSON.parse` chuỗi lớn). (d) Chỉ tải phần của vùng sắp chơi |
| V4 | **Cao** | Dung lượng tải | 18,6 MB qua mạng (Đợt 10: 6,8 MB). Màn chào 7,5 giây (4G) và 19 giây (3G) ở CPU ×4. Đủ ảnh 30 và 109 giây | Ảnh AI tăng gấp 3. Tệp đầu 4,92 MB đã chạm mức "nên dưới 5 MB". Base64 trong HTML/JSON phình thêm 33 % và gzip gần như không nén được PNG | Chuyển ảnh sang **WebP lossless** (thường nhỏ hơn PNG 25–35 %), file rời có hash để trình duyệt tải song song và lưu đệm riêng. Đưa trùm và dáng pha p2/p3 (5,9 MB) ra tệp riêng, tải khi vào ải 4–5. Bỏ 4 thân em bé không dùng khỏi trang chính. Mục tiêu: trang chính dưới 1,5 MB nén |
| V5 | **Cao** | Trùm Hồ Tinh (và mọi quái lớn) lần đầu bị đánh | Tấm chớp trắng 5,1 Mpx (20 MB) tạo ngay lúc trúng đòn đầu tiên. Khung đầu 283–1 350 ms | `sprite_custom.js nhuom(sp, col)` nhuộm **cả tờ sprite** cho mỗi màu (trắng, lửa, băng, độc) | Nhuộm **theo khung** (cỡ `fw×fh`, có cache LRU) thay cho cả tờ. Hoặc chớp trắng bằng `filter: brightness()`, hoặc vẽ thân rồi phủ `source-atop` trên một canvas tạm cỡ khung |
| V6 | **Vừa** | Bảng tạm dừng, làng đứng yên | rAF vẫn 55 FPS, CPU ≈ lúc đánh | `engine.js frame()` luôn vẽ lại cả cảnh | Khi `S.mode` là `paused` / `map` / `bag` / `result`: vẽ 1 lần rồi chỉ vẽ lại khi có chạm. Hoặc hạ xuống 10 FPS. Thêm tuỳ chọn "Tiết kiệm pin: 30 FPS" |
| V7 | **Vừa** | `getImageData` khi nhuộm, dò dáng quái, mặt nạ em bé | 38 cảnh báo `willReadFrequently` trong 10 phút. Trên máy có GPU, mỗi lần đọc là một lần chép GPU→CPU (khựng) | `sprite_custom.js khungThan`, `SC.dangQuai`, 656 (`getContext('2d')` không có cờ). `matNa` đã có cờ | Thêm `{ willReadFrequently: true }` cho mọi canvas tạm dùng để đọc điểm ảnh. Tốt hơn nữa: tính sẵn mặt nạ và dáng **lúc build** (`build.py`), ghi vào JSON |
| V8 | **Vừa** | Phòng đông hoặc máy yếu | Ở CPU ×4–×6, mỗi khung 150–600 ms và game chạy chậm như quay chậm | `engine.js frame`: tối đa 5 bước/khung, `acc` tối đa 0,1 s | Sau khi sửa V1–V3: thêm chế độ chất lượng tự động (FPS dưới 40 trong 3 giây thì giảm hạt `fx`, tắt vành sáng `G.VFX.vien`, giảm `parts`), ghi nhớ vào bản lưu |
| V9 | **Vừa** | Tải lại / Safari đẩy tab ra khỏi bộ nhớ giữa ải | Mất cả lượt ải đang chơi, quay về màn chào (tiến trình trước ải còn) | Không lưu trạng thái lượt chơi | Lưu gọn `{ r, i, phòng đã dọn, máu, mana }` khi qua cửa phòng. Khi mở lại thì hỏi "Chơi tiếp ải?". Quan trọng vì V2 làm Safari dễ tải lại trang |
| V10 | **Thấp** | `sw.js` | Mỗi lần mở trang, SW `cache.put` lại toàn bộ 26 MB (trang + tệp ảnh), dù tệp ảnh không đổi | Network-first và không kiểm có sẵn chưa | Với `linh-khi-anh.*.json` (tên có hash, không đổi): dùng cache-first, có rồi thì không `put` lại |
| V11 | **Thấp** | `<head>` có `<link>` Google Fonts chặn vẽ | Mạng chặn Google (một số trường học, công ty, Trung Quốc) thì phải chờ hết thời gian chờ mới vẽ. [SUY] | `index.html` dòng 15 | Thêm `media="print" onload="this.media='all'"` hoặc tự host phông chữ |

## 8. Top 5 việc nên sửa trước

1. **V1:** Bỏ dựng thân bằng code (`veKhung`/`ghepHinh`) khi quái đã có ảnh AI, và dùng lại `butGia`. Đã đo: FPS trùm tăng gấp 1,3–4 lần. Sửa ít dòng mà lợi lớn nhất.
2. **V2 + V5:** Đặt ngân sách bộ nhớ canvas chung có LRU. Nhuộm theo khung thay cho cả tờ sprite. Xoá cache quái/trùm khi rời ải. Mục tiêu: canvas sống ổn định dưới khoảng 20 Mpx sau 10 phút.
3. **V3:** Xử lý tệp ảnh tải sau mà không làm đứng game: bỏ nhịp xoá cache 400 ms, giải mã ngoài luồng chính, mỗi khung giới hạn vài hình.
4. **V4:** Giảm dung lượng: WebP lossless, ảnh thành tệp rời, tách ảnh trùm và dáng pha theo vùng. Đưa trang chính về dưới 1,5 MB nén.
5. **V6 + V9:** Ngừng vẽ liên tục khi tạm dừng hoặc ở bảng (đỡ pin, đỡ nóng máy), và lưu lượt ải đang chơi để Safari tải lại trang không làm mất ải.

## Tệp đo (trong `scratchpad/tester-3/`)

- `srv.py`: máy chủ giống Firebase. `tai.py` / `tai.json`: tải trang.
- `khung.py` / `khung.json`: FPS theo cảnh × CPU. `prof_*.cpuprofile`: profile CDP (mở được bằng Chrome DevTools). `prof.py`: tóm tắt profile.
- `exp.py` / `expA.json` / `expB.json`: thử A/B cho V1.
- `bonho.py` / `bonho.json`: chơi 10 phút, lấy mẫu bộ nhớ.
- `onDinh.py` / `onDinh.json`: ẩn trang, xoay màn hình, chặn tệp ảnh, lưu/tải. `xoay2.py`: thử xoay thêm.
- `repo/`: bản sao để build hai tệp. `site/`: thư mục phục vụ.
