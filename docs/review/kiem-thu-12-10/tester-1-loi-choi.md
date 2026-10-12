# Báo cáo kiểm thử LỐI CHƠI / HỆ THỐNG / CÂN BẰNG — Linh Khí (bản lk-2026.10.11-2212)

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
