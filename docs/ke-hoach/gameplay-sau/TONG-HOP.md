# Tổng hợp kế hoạch gameplay sau vùng 4 (TONG-HOP.md)

Lập 15/10/2026. **Chỉ là tài liệu**, không sửa code game.
Gộp ba tệp lập song song: **VUNG.md** (vùng 5–8), **LOI-DANH.md** (cách ra đòn), **LUC-CHIEN.md** (phụ kiện, linh thú, lực chiến).
Soát với: `docs/cot-truyen/CHUNG.md`, `docs/ke-hoach/LUAT-CAN-BANG.md`, `docs/ke-hoach/buoc-3/KE-HOACH.md` (vùng 4), code hiện có (`game/js/data.js`…).

**Hai quyết định mới của chủ game được áp vào cả ba tệp:**
1. **Bộ trang phục mua bằng vàng** ở Cô Thợ May; hạ trùm vùng thì bộ đó mới **mở bán** (Rừng 1.500 · Biển 3.000 · Lâu đài 5.000; nâng cấp 1 còn 300 vàng; cờ lui `?bocu=1`) — xem `docs/review/ke-hoach-cai-thien/bo-do-mua/bao-cao.md`.
2. **Giữ kiểu ảnh pixel** (chưa chuyển nét mịn). Ba tệp đều ghi "chưa viết prompt vì chưa chốt phong cách" → nay **viết prompt được**, theo đúng mẫu prompt vùng 4 (KE-HOACH bước 3 mục 4: nền xanh `#00FF00` cho quái/hiệu ứng, nền hồng `#FF00FF` cho nền phòng). Chỗ nào trong VUNG.md nói "nét 1,5 (khong-pixel)" thì bỏ.

Khi ba tệp nói khác nhau, **tệp này là bản đúng**. Chỗ nào chưa nói tới ở đây thì theo tệp gốc.

---

## Tóm tắt một phút

- Sau vùng 4 có **4 vùng mới**: Núi Sét → Rừng đá vôi (tối) → Đỉnh mây (quái bay) → Đền trống đồng (Hắc Long, khi muốn kết). Mỗi vùng dạy **một điều mới**.
- Cu Tí học thêm **cách đánh thưởng cho tay giỏi** (Né Kịp, Thanh Choáng, Đòn Trống, Đòn Nối), **hệ Sét**, **2 vũ khí mới** (Gậy Tre, Quạt Mo). Không dùng vẫn qua ải.
- Lực chiến lâu dài có **4 hệ mới**: phụ kiện (gọi là **trang sức** để khỏi nhầm với bộ trang phục), linh thú, cảnh giới, ấn ký trống đồng. Mọi hệ chỉ mở **sau vùng 4**, có trần.
- Gỡ **20 chỗ vướng** giữa ba tệp; lớn nhất là: đường Sức mạnh khuyên dùng (VUNG +30%/vùng vượt trần của LUC-CHIEN) → **chốt +22%/vùng**; linh thú đầu tiên (Gà Lôi hay Nghê) → **Nghê Sấm**; sát thương thú (20% hay 26%) → **trần 20%**.
- Lộ trình chung: **21 đợt × ~3 phiên** (đợt 0–3 chuẩn bị, rồi mỗi vùng 4 đợt + đợt cuối), có cột ảnh chủ game cần gen ở từng đợt.
- **8 câu hỏi** cho chủ game ở cuối tệp.

---

## 1. Ý chính từng phần

### 1.1 Vùng 5–8 (VUNG.md)
1. Bốn vùng giữ đúng khuôn vùng 4: **3 luật riêng · 5 ải · 8 quái thường (8 vai cũ) · 2 tinh anh · trùm nhỏ · trùm vùng 3 pha · người cần cứu · mảnh trống · câu móc**.
2. **Vùng 5 Núi Sét** (Thần Sét hoá điên — cứu, không giết): sét báo trước, cột đồng thu sét, vũng mưa làm **Ướt**. Mảnh trống có **tượng cóc** → mưa về.
3. **Vùng 6 Rừng đá vôi** (Chằn Tinh, cứu Bác Tiều): **bóng tối + đèn soi**, đuốc thắp bằng Lửa, thạch nhũ rơi. Thua thì Chằn Tinh **hoá đá** (giải thích hòn đá hình người).
4. **Vùng 7 Đỉnh mây** (Đại Bàng Tinh, cứu Bé Diều): **gió từng đợt, quái bay** (đánh lúc sà), mây mỏng. Vùng sáng nhất game, nghỉ mắt sau vùng tối.
5. **Vùng 8 Đền trống đồng** (Hắc Long = Thuồng Luồng hoá rồng): **nhịp trống**, rễ đa giúp sức, mỗi ải **ôn lại** luật một vùng cũ; dùng lại 4 quái cũ bản "ánh đồng" để đỡ ảnh. Thắng → trống lành, cây đa nở hoa.
6. **Luật an toàn**: luật vùng ≤ 8% máu mỗi lần, báo trước ≥ 0,8 s, mọi vùng đỏ **luôn sáng** (kể cả trong tối), 1,5 s đầu phòng không đánh; mỗi luật một cờ tắt.
7. **Rủi ro số 1 là dung lượng**: mỗi vùng ~+3,2 MB (~110–140 ảnh). Cộng thẳng ~31 MB, vượt trần 20 MB → phải tính trần theo vùng (Câu hỏi 6).

### 1.2 Cách ra đòn mới (LOI-DANH.md)
1. **Né Kịp**: lộn đúng lúc đòn sắp trúng → chậm thời gian một nháy, +Mana, nhát sau thành **Đòn Đáp** mạnh (mỗi vũ khí một kiểu).
2. **Thanh Choáng** dưới máu tinh anh / trùm: đánh mạnh, Né Kịp, Đòn Đáp làm đầy → quái **choáng 2 s**. Cho Búa, Thương một vai rõ.
3. **Nhịp Trống → Đòn Trống** (tuyệt kỹ): thanh 4 vạch hình mặt trống, đầy thì **nút Chưởng đổi thành mặt trống** — không thêm nút. Trần ≤ 6% máu trùm vùng mỗi lần.
4. **Đòn Nối**: đổi vũ khí ngay sau nhát kết → vũ khí mới ra ngay một đòn, mang hệ mới (cách tự nhiên ra phản ứng hệ).
5. **Hệ Sét** (hệ thứ 4): **lan sang quái đứng gần**, tích 3 lần thì giật ngắt; 3 phản ứng mới; cây Chưởng Sét. **Không** vào vòng khắc cũ (khỏi cân lại vùng 1–3).
6. **Gậy Tre** (thế thủ, gạt đòn — món duy nhất đỡ được) và **Quạt Mo** (gió, đẩy, hất đạn ngược, đánh trúng quái bay). Dùng chung đường nâng cấp cũ.
7. Phía quái: **16 khuôn ra đòn dùng chung** (B1–B16), một màu một nghĩa (vàng = Né Kịp được, tím = không lộn xuyên, xanh lam = quái đỡ, trắng nháy = đòn giả). Mỗi vùng giới thiệu ≤ 3 khuôn mới.

### 1.3 Lực chiến lâu dài (LUC-CHIEN.md)
1. Hết vùng 4 Cu Tí đã **cấp 40 (trần)** → vùng 5–8 cần chỗ lớn lên mới. **Mọi hệ mới chỉ mở sau vùng 4**, vùng 1–4 không dễ đi.
2. **Trang sức** (tên trong tệp gốc là "phụ kiện"): 4 ô (Vòng cổ = máu, Vòng tay = sát thương, Ngọc bội = giảm sát thương, Bùa = kháng 1 hệ), 4 bậc theo vùng (Đồng → Bạc → Ngọc → Kim), luyện +0…+10 **luôn thành công**, 4 **bộ trang sức** (Sấm, Đèn Đá, Mây, Trống Đồng) — đủ 4 món thì có hào quang + vệt.
3. **Linh thú**: 4 con gắn truyện (Nghê Sấm, Đom Đóm Đá, Chim Lạc con, Rùa Vàng con), 1 con ra trận, **không chết** (chỉ mệt rồi dậy), cấp 1–20, tiến hoá Con → Lớn → Thần.
4. **Cảnh giới**: sau cấp 40, kinh nghiệm thừa thành **Tu vi**, 15 tầng chia 5 bậc theo cây đa (Rễ · Thân · Cành · Lá · Hoa); qua bậc đánh **Bóng Cu Tí**. Giữ `G.MAX_LEVEL = 40`.
5. **Ấn ký trống đồng**: mỗi mảnh trống đã lấy lại khắc 1 ấn (chọn 1 trong 2) — ít sức mạnh, nhiều cá tính. Thiên phú là phần tuỳ chọn để sau.
6. **Trần tổng ≈ ×2,1 Sức mạnh** so với cuối vùng 4 (trang sức ×1,30 · thú ×1,25 · cảnh giới ×1,18 · ấn ×1,06 · thiên phú ×1,02); không hệ nào một mình quá ×1,30.
7. Hiệu ứng trên người là **lớp tách rời** (hào quang chân, vệt lăn, màu vệt chém, hạt bay) — **không vẽ lên từng khung Cu Tí**, nên mặc trang phục nào cũng hợp. Kinh tế chỉ thêm 3 thứ: **Bột đồng, Hạt linh, Ngọc linh thú**.

### 1.4 Quyết định mới và hệ đang có (áp vào kế hoạch)
1. **Bộ trang phục là chỗ tiêu vàng mới** (~8.700 vàng ròng cho 3 bộ). Vàng còn lúc qua 3-5 đã giảm 2.427 → 1.889; bộ Lâu đài (5.000) được mua **trong lúc cày vùng 4**. → Giả định "cuối vùng 4 thừa vàng, đủ 4 bộ cấp 3" của LUC-CHIEN **phải đo lại** ở đợt 0.
2. Trang phục mặc **một bộ một lúc** → một bộ mới là **đổi kiểu**, không cộng dồn sức mạnh. Nếu thêm bộ cho vùng 4–8 (Câu hỏi 3) thì kỹ năng bộ mới **ngang bộ Lâu đài cấp 3**, không mạnh hơn.
3. **"Bộ" có hai nghĩa** → từ nay: **bộ trang phục** (Cô Thợ May, mua bằng vàng) và **bộ trang sức** (4 món trang sức cùng vùng, Ông Thợ Bạc). Không dùng chữ "bộ đồ" cho trang sức.
4. Thẻ **Mua** của Cô Thợ May vẽ Cu Tí mặc bộ → khi có hào quang trang sức thì ô xem trước vẽ thêm lớp hào quang (lớp tách rời, không cần ảnh mới).
5. **Pixel giữ nguyên** → ảnh mới (quái, thú, trang sức, hiệu ứng) dùng đúng khuôn prompt vùng 4; Claude viết prompt ở phiên cuối mỗi đợt, chủ game gen ở đợt sau.
6. Vùng 4 hiện đang **khung chạy bằng hình tạm**, số khuyên dùng `[540, 565, 595, 630, 690]` vẫn là số xuất phát → mọi số vùng 5–8 dưới đây đều tính từ đó và **chờ bot chốt vùng 4** rồi chỉnh theo.

---

## 2. Chỗ chồng chéo / mâu thuẫn và cách gỡ

### 2.1 Bảng gỡ (★ = cần chủ game xem, có câu hỏi ở mục 4)

| # | Chỗ vướng | Các tệp nói gì | Gỡ thế nào |
|---|---|---|---|
| 1 ★ | **Đường Sức mạnh khuyên dùng** | VUNG: +30%/vùng, 8-5 = **2.050**. LUC-CHIEN: +22%/vùng, 8-5 ≈ 1.450, **trần tuyệt đối ~1.830**. VUNG vượt cả trần → người chơi không với tới. | Chốt **+22%/vùng** (bảng 2.2). Đúng ngân sách LUC-CHIEN, gần phương án B của VUNG Q15. Câu hỏi 1. |
| 2 | **Vũ khí Vàng vùng sau** | VUNG đề xuất `G.GOLD_MULT` thêm 1,8/1,9/2,0/2,1. LUC-CHIEN không tính phần này. | Tính vào phần "hệ cũ còn lại ×1,15" của LUC-CHIEN; tăng chậm hơn: **+0,05 mỗi vùng** (bot chốt). |
| 3 ★ | **Linh thú đầu tiên** | VUNG: Gà Lôi Sét, trứng quà Thần Sét sau 5-5. LUC-CHIEN: **Nghê Sấm**, giao ở 5-1. LOI-DANH: kiểu Xung hoặc Bay. | Lấy **Nghê Sấm** (LUC-CHIEN thiết kế đủ hơn) = kiểu **Xung**. Thời điểm: **sau 5-5**, Thần Sét tỉnh lại truyền sét cho con nghê đá ở miếu — vì 5-1 đã mở hệ Sét, dồn hai thứ mới một lúc là quá nhiều. Bỏ Gà Lôi. Câu hỏi 2. |
| 4 | **Lúc mở hệ Sét** | VUNG: sau trùm nhỏ 5-1 (Gấu Ngựa nhả "hòn sét"). LOI-DANH: Thần Sét được cứu trao "hạt sét" (tức sau 5-5). | Theo VUNG: **mở sau 5-1** để dùng Sét ngay trong vùng 5. Sau 5-5 Thần Sét chỉ trao Nghê Sấm. |
| 5 | **Sét trong khắc hệ** | VUNG: quái Sét kháng Sét; Sét mạnh lên quái Ướt **và quái vảy đồng / kim loại**. LOI-DANH: ×1,3 lên quái nước / Ướt, kháng ×0,75, ngoài vòng khắc. | Theo LOI-DANH. **Ướt** là một trạng thái duy nhất (vũng mưa, đứng trong nước) ×1,3. Bỏ luật chung "kim loại"; chỉ Tê Tê Vảy Đồng có nét riêng "trúng Sét mất giáp 3 s". |
| 6 | **Nhịp trống ở vùng 5** | VUNG: Thần Sét **không** dùng sóng theo nhịp (để dành Hắc Long). LOI-DANH: B3 "Theo nhịp" dành cho Hắc Long **và trùm vùng 5**, vùng 5 có "nhịp sấm". | Theo VUNG (đúng CHUNG.md): **B3 lần đầu ở vùng 8** (Trống Méo dạy, Hắc Long pha 3). Vùng 5 chỉ có vòng trống sấm một lần, có khe. |
| 7 | **Khuôn quái mới của vùng 5** | LOI-DANH gợi ý B6, B7, B15. VUNG không có chiêu "núp sau vật" ở vùng 5; "nấp sau tảng đá" lại là luật gió vùng 7. | Vùng 5: **B1 Đòn Vàng, B6 Sét theo vết** (Thần Sét pha 3 "Sét đuổi"), **B7 Tia nối** (Gấu Ngựa ôm cột phóng sét, tinh anh). **B15 dời sang vùng 7**, gộp với gió (Đại Bàng quạt cánh cả sân → nấp sau đá). Vùng 7 vẫn ≤ 3 khuôn vì B11 + B15 là một bài học. |
| 8 | **Nhịp chuẩn vùng 8** | VUNG: nhạc ~1,2 s/nhịp. LOI-DANH B3: nhịp 0,6–0,8 s. LUC-CHIEN: bộ Trống Đồng "mỗi 8 s một nhịp". | **Nhịp chuẩn 1,2 s**; "trống dồn" của B3 = **nửa nhịp 0,6 s**; bộ trang sức Trống Đồng ở vùng 8 đánh **mỗi 7 nhịp (8,4 s)** cho khớp nhạc. Không đặt nhịp thứ ba. |
| 9 | **Nút thú, hồi chiêu** | LOI-DANH: nút Thú = "Lệnh" hồi **6 s**. LUC-CHIEN: chiêu riêng mỗi con (Gầm sấm, Đèn lồng…) hồi **12 s**. | **Một nút Thú**: chạm = **chiêu riêng của con đó** (bảng LUC-CHIEN), hồi **12 s**. "Lệnh" của LOI-DANH chính là chiêu này. |
| 10 | **Gắn Bó và Thân thiết** | LOI-DANH: thanh **Gắn Bó** trong trận → Hợp Chiêu. LUC-CHIEN: điểm **Thân thiết** lâu dài, mốc 10/30/60 mở hợp lực. | Hai thứ khác nhau, giữ cả hai: **Thân thiết** (ngoài trận, lâu dài) mốc 10 **mở** Hợp Chiêu lần đầu; **Gắn Bó** (trong trận, ~45 s) đầy thì **dùng** Hợp Chiêu. Cả hai không cộng sức mạnh. |
| 11 | **Kiểu đánh của 4 con thú** | LOI-DANH có 3 kiểu (Xung / Bay / Giữ). LUC-CHIEN có 4 con, Đom Đóm Đá (soi sáng, hồi máu) không khớp kiểu nào. | Thêm kiểu thứ 4 **Soi** cho Đom Đóm (Hợp Chiêu "Đèn Trời": soi cả sân 4 s + đốm sáng bắn quái). Nghê = Xung, Chim Lạc = Bay, Rùa Vàng = Giữ. +4 khung ảnh Hợp Chiêu. |
| 12 | **Trần sát thương thú** | LOI-DANH: 12–15%, tối đa **20%** sát thương Cu Tí. LUC-CHIEN: 8% → 22% theo cấp, +2%/+4% theo dạng = **26%**; Chim Lạc off ×1,45. | Theo LOI-DANH: **cấp 1 = 6% → cấp 20 = 16%, Lớn +2%, Thần +2% → trần 20%** cho mọi con. Chim Lạc mạnh hơn **chỉ khi đánh quái bay**. Bảng 4.3 LUC-CHIEN: off tối đa mỗi con ≤ ×1,20, khác nhau ở phần ehp và tiện ích. |
| 13 | **Thú bị quái nhắm?** | LOI-DANH: quái **không** nhắm thú. LUC-CHIEN: Nghê "hút sự chú ý" quái thường 20%. | Chỉ **Nghê** (kiểu Xung) khiêu khích **quái thường**; trùm và tinh anh không bao giờ nhắm thú. Thú không chết nên không thiệt gì. |
| 14 | **Ai trao Gậy Tre, Quạt Mo, ba linh thú sau** | LOI-DANH: Gậy vùng 6, Quạt vùng 7 (người trao: VUNG quyết). LUC-CHIEN: người cứu vùng 6 tặng Đom Đóm. VUNG: Bác Tiều mở "đèn lồng to hơn"; vùng 6 có thể có "cung tên vàng"; vùng 7 có trứng đại bàng. | Bảng 2.3. Gậy Tre **nhặt ở cửa hang 6-1** (gậy của Bác Tiều rơi lại), dùng ngay trong vùng 6; Quạt Mo **rơi từ Yêu Gió ở 7-1**, dùng đánh quái bay trong vùng 7. Đom Đóm theo Cu Tí ra khỏi hang khi Chằn Tinh hoá đá. **Bỏ** cung tên vàng (trùng Phi tiêu), **bỏ** đèn lồng của Bác Tiều (trùng mục 15), trứng đại bàng chỉ để trang trí. |
| 15 | **Quá nhiều nguồn "sáng hơn" ở vùng 6** | Bác Tiều đèn lồng to hơn · hào quang ≤ +15% (VUNG) · bộ trang sức Đèn Đá +40% · Ấn Đom đóm +20% · chiêu Đom Đóm · tuỳ chọn "Hang sáng hơn" ×1,5. | **Trần chung quầng sáng ×1,5** (cộng mọi nguồn). Tuỳ chọn trợ năng "Hang sáng hơn" đặt thẳng ×1,5 (không cộng thêm). Bỏ đèn lồng Bác Tiều. Bộ Đèn Đá còn +25%, Ấn Đom đóm +15%. |
| 16 | **Thưởng đánh quái bay chồng nhau** | Bộ trang sức Mây +10% · Ấn Gió +8% · Chim Lạc +15%. VUNG: tối đa **2** quái bay cao; LOI-DANH B10: tối đa **3**. | **Tổng thưởng lên quái bay ≤ +20%**. Lấy luật chặt hơn: **≤ 2 quái bay cao** một lúc. Bot vùng 7 chỉ dùng Búa vẫn phải qua. |
| 17 | **Choáng chồng choáng** | LOI-DANH: Thanh Choáng có khoá, trùm 1 lần/pha. LUC-CHIEN: dòng phụ "kéo dài choáng +20%", Gầm sấm choáng 1,2 s. | Dòng "kéo dài choáng" và chiêu thú **chỉ áp quái thường / tinh anh**; lên trùm thì đổi thành **+điểm choáng**. Thanh Choáng trùm không bị kéo dài. |
| 18 | **Trạng thái Sét trên quái** | LUC-CHIEN Ấn Sấm "20% gây **tê**"; Bộ Sấm "phóng tia sét". LOI-DANH: "Tê" là trạng thái **của Cu Tí**; quái thì "Tích điện". | Ấn Sấm = "đòn Đặc biệt có 20% **+1 Tích điện**". Tia của bộ Sấm dùng **chung luật tia nhảy** hệ Sét (một luật lan duy nhất). |
| 19 | **Mảnh trống "đầu tiên" và lúc mở Nhịp Trống** | LOI-DANH: "Thuồng Luồng làm rơi mảnh trống **đầu tiên**". Thực ra đó là **mảnh thứ 4** (chim Lạc); 3 mảnh đã có từ vùng 1–3. LUC-CHIEN cũng mở màn Trống đồng làng sau vùng 4. | Sửa lời: **mảnh thứ 4**. Gộp thành **một cảnh mở khoá** sau 4-5: Ông Từ đặt 4 mảnh lên đình, Cu Tí áp tai nghe nhịp → mở **Nhịp Trống** và **màn Trống đồng làng (ấn ký)** cùng lúc. |
| 20 | **Chim Lạc con bay ra từ mảnh nào** | LUC-CHIEN: "từ hoa văn trống khi lấy mảnh vùng 7". Mảnh vùng 7 là thuyền + người mũ lông chim, không có chim Lạc. | Ghép mảnh 7 vào trống đồng làng, **sát mảnh chim Lạc (thứ 4)** → một con chim Lạc trên hoa văn "thức dậy" bay ra. Đúng cốt truyện, không đổi mảnh. |

**Gỡ thêm (nhỏ, không cần hỏi):**
- **Ấn Lông vũ** (LUC-CHIEN "rơi từ cao không mất máu — nếu VUNG có"): VUNG có mây mỏng tan làm mất 5% máu → ấn thành "**mây tan không mất máu**".
- **Thưởng mới vùng 5+** (Bột đồng, Hạt linh, Ngọc linh thú): bảng thu nhập LUC-CHIEN 6.2 chưa trừ gì. Theo LUAT-CAN-BANG mục 3 và VUNG 6.3: **bớt vàng ở cùng ải bằng giá trị tương đương**, rương thêm lựa chọn **thay**, không cộng.
- **Lối đánh mới ở vùng 1–4**: LUC-CHIEN muốn vùng 1–4 không đổi; LOI-DANH đợt 1 lại dùng Né Kịp ngay ở vùng 1–4. Không trái luật vì là phần thưởng cho tay (bot `tay:0` không đổi), nhưng để chủ game chọn — Câu hỏi 5.
- **Dung lượng**: VUNG Q1 và LUC-CHIEN Q7 hỏi cùng một chuyện → gộp thành Câu hỏi 6, **một bảng dung lượng chung** cho cả ba phần.
- **Sóng âm ở vùng 5**: Khỉ Già Trống Ngực "vỗ ngực lăn qua vòng đúng lúc" giữ nguyên (một vòng, không theo nhạc) — không phạm mục 6.
- **Né Kịp và dòng "bất tử khi lăn +0,10 s"**: không cộng vào cửa sổ Né Kịp (cửa sổ tính theo lúc bấm, trần +0,05 s chỉ từ dòng riêng). Đòn tím (B2) vẫn không lộn xuyên được dù có dòng này.
- **Ông Thợ Bạc** (trang sức) và **Cô Thợ May** (trang phục) là hai người riêng, không gộp — mỗi người một việc, trẻ con dễ nhớ.

### 2.2 Bảng Sức mạnh khuyên dùng thống nhất (số xuất phát, bot chốt)

Từ 4-5 = 690, mỗi vùng ×~1,22 tới ải trùm; ải đầu vùng mới ≈ ải trùm trước ×1,05. Vùng 8 tăng chậm (là bài ôn).

| Vùng | Ải 1 | Ải 2 | Ải 3 | Ải 4 | Ải 5 (trùm) |
|---|---|---|---|---|---|
| 5 Núi Sét | 725 | 755 | 785 | 815 | 850 |
| 6 Rừng đá vôi | 890 | 925 | 960 | 1.000 | 1.040 |
| 7 Đỉnh mây | 1.090 | 1.130 | 1.175 | 1.220 | 1.270 |
| 8 Đền trống đồng | 1.330 | 1.360 | 1.390 | 1.420 | 1.450 |

8-5 = 1.450 ≈ 80% trần tuyệt đối ~1.830 → người chơi thường đánh được Hắc Long khi chưa tối đa. Thay bảng 6.1 của VUNG.md.
Vì Nghê Sấm đến sau 5-5 (mục 3), khuyên dùng vùng 5 **không tính** linh thú; thú tính từ vùng 6.

### 2.3 Ai trao gì, ở đâu (bản thống nhất)

| Lúc | Thứ mới | Ai / ở đâu |
|---|---|---|
| Sau 4-5 (Thuồng Luồng) | Nhịp Trống + Đòn Trống, màn Trống đồng làng (4 ấn đầu), trang sức (mở bảng, chưa rơi), cảnh giới (khi cấp 40) | Ông Từ đặt 4 mảnh lên đình; Cu Tí áp tai nghe nhịp |
| Sau 4-5 | (nếu chọn Câu hỏi 3) Bộ trang phục Sông mở bán | Cô Thợ May |
| Sau 5-1 | **Hệ Sét** | Gấu Ngựa nhả "hòn sét" |
| Vùng 5 | Trang sức bậc **Đồng** rơi | tinh anh, trùm |
| Sau 5-5 | **Nghê Sấm** (Xung) | Thần Sét tỉnh lại, truyền sét cho con nghê đá ở miếu |
| Cuối vùng 5 | Bé Diều ra mắt ở đê làng | (truyện) |
| 6-1 | **Gậy Tre** | nhặt ở cửa hang (gậy của Bác Tiều) |
| Sau 6-5 | **Đom Đóm Đá** (Soi) | bầy đom đóm theo Cu Tí ra khỏi hang khi Chằn Tinh hoá đá; Bác Tiều về làng, tặng luôn cây gậy |
| Sau 7-1 | **Quạt Mo** | Yêu Gió Túi Da làm rơi |
| Sau 7-5 | **Chim Lạc con** (Bay) | ghép mảnh 7 vào trống làng |
| Giữa vùng 8 | **Rùa Vàng con** (Giữ) | trốn khỏi Hắc Long, theo Cu Tí |
| Sau 8-5 | Ấn Mặt trời, trang sức Kim tiếp tục rơi | cảnh kết |

---

## 3. Lộ trình chung theo đợt (sau vùng 4)

**Luật đi đường** (BUOC-2-3-4 + LUAT-CAN-BANG): mỗi đợt ~3 phiên song song → bot đo trước/sau → chủ game thử → đợt sau. Làm xong – chơi thử – chốt **một vùng** rồi mới sang vùng sau.
Mỗi thứ mới có cờ quay lui (`?loidanh=…`, `?phukien=0`, `?linhthu=0`, `?canhgioi=0`, `?anky=0`, `?vung5=0`…).
**Ảnh**: Claude viết prompt pixel ở phiên cuối đợt trước; chủ game gen trong đợt ghi ở cột "Ảnh"; trong lúc chờ, code dùng hình tạm. Nhóm ảnh đặt tên như VUNG.md (A mẫu · C động tác · D nền · E hiệu ứng · F giao diện/truyện).

### Giai đoạn I — Chuẩn bị (chưa mở vùng mới; bắt đầu khi vùng 4 đã chốt)

| Đợt | Phiên A | Phiên B | Phiên C | Ảnh chủ game gen |
|---|---|---|---|---|
| **0 · Khung** | Sửa mọi chỗ "cứng N vùng" → đọc `G.REGIONS`; khung bot `cay.py` 40 ải | Bản lưu mới (`pk/lt/cg/ak`, Bột đồng, Hạt linh, Ngọc linh thú) + `cloud.js` + chuẩn hoá bản lưu cũ | Tách Sức mạnh theo nguồn (`quyDoi`), sửa NaN `tinh.js`; **đo lại kinh tế sau khi bộ trang phục phải mua** (vàng & bộ lúc vào vùng 5) | Không. Claude viết prompt đợt 1–3. |
| **1 · Nền tay** | Né Kịp + Đòn Đáp 4 vũ khí | Thanh Choáng + B1 Đòn Vàng (1 chiêu mỗi trùm cũ, thử) | Bot `tay:0/1/2`, `tinh.js` mục Lối đánh, đo | Hiệu ứng Né Kịp (4), Đòn Đáp (6 × 4), thanh choáng + sao (6) |
| **2 · Hệ Sét** | Tích điện, Giật, Tê, Ướt, 3 phản ứng | Vũ khí Sét 2 đặc tính + cây Chưởng Sét | B6 + B7 + kiểm màu báo trước (`au_bao_truoc.py`), đo | Hiệu ứng Sét (~18), Chưởng Sét (14), biểu tượng hệ; **vùng 5 nhóm A (14 ảnh mẫu)** để duyệt tạo hình |
| **3 · Mảnh trống mở** | Nhịp Trống + Đòn Trống Kiếm, Búa | Đòn Trống Thương, Phi tiêu + trần trùm; Đòn Nối + đếm đòn | Màn Trống đồng làng + 8 ấn đầu (4 mảnh cũ) + cảnh mở khoá | Mặt trống (7), Đòn Trống Cu Tí (20) + hiệu ứng (24), màn trống đồng (trống + mảnh + ấn ~24) |

### Giai đoạn II — Vùng 5 Núi Sét

| Đợt | Phiên A | Phiên B | Phiên C | Ảnh chủ game gen |
|---|---|---|---|---|
| **4** | Khung vùng 5 bằng hình tạm (25 ải, `?vung5=0`) | Luật vùng: sét báo trước, cột đồng, vũng mưa | Truyện vùng 5, Bé Diều ở đê, nhạc | Vùng 5 nhóm C động tác (85), D nền (8), Bé Diều |
| **5** | 8 quái thường | 2 tinh anh + Gấu Ngựa (mở Sét sau 5-1) | Thần Sét pha 1 + sân | Vùng 5 E hiệu ứng (14), F cảnh truyện (b8, b9) |
| **6 · Trang sức** | Dữ liệu ô / bậc / dòng / bộ trang sức + rơi + phân giải | Ông Thợ Bạc: luyện, đổi dòng, đúc, Lò bạc | Bảng Trang sức trong Hành trang | Biểu tượng trang sức (32) + khung bậc (4), Ông Thợ Bạc (3) |
| **7** | Thần Sét pha 2–3 + tỉnh lại | Nghê Sấm: đi theo, tự đánh, mệt/dậy, nút Thú | Nghê: cấp, Hạt linh, tiến hoá, đổi ở làng | **Nghê Sấm** 3 dạng × 6 động tác + chân dung + chiêu Gầm sấm |
| **8** | Thanh Gắn Bó + Hợp Chiêu Xung + mốc Thân thiết | Cân bằng bot vùng 5 (25 ải, trước/sau) | Đóng gói, soát dung lượng → **chủ game chơi thử vùng 5** | Hợp Chiêu Xung (4); **vùng 6 nhóm A (14)** |

### Giai đoạn III — Vùng 6 Rừng đá vôi

| Đợt | Phiên A | Phiên B | Phiên C | Ảnh chủ game gen |
|---|---|---|---|---|
| **9** | Khung vùng 6 | Lớp tối + đèn (đo khung hình máy yếu), đuốc, thạch nhũ, trần sáng ×1,5, tuỳ chọn "Hang sáng hơn" | Truyện, Bác Tiều, cảnh Đại Bàng cắp Bé Diều | Vùng 6 nhóm C (86), D (9) |
| **10** | 8 quái (B9, B12, B14 lưới) | 2 tinh anh + Rết Đá | **Gậy Tre** (đánh, Thế Thủ, gạt, Đặc biệt) | Vùng 6 E (12), F; **Gậy Tre** (4 bậc + 14 tư thế) |
| **11** | Chằn Tinh pha 1–3 (bóng giả, hoá đá) | Đom Đóm Đá + kiểu Soi | **Cảnh giới**: Tu vi, tầng, trần theo vùng | **Đom Đóm Đá** 3 dạng × 6 + chân dung; huy hiệu bậc (5) |
| **12** | Hiệu ứng nhân vật: hào quang chân, vệt lăn, màu vệt chém, cài đặt Đủ/Gọn/Tắt | Thử thách Bóng Cu Tí + nền gốc đa | Cân bằng bot vùng 6 + đóng gói → **chơi thử vùng 6** | Hào quang (32), vệt lăn (24), hạt cảnh giới (8), nền gốc đa (1); **vùng 7 nhóm A (14)** |

### Giai đoạn IV — Vùng 7 Đỉnh mây

| Đợt | Phiên A | Phiên B | Phiên C | Ảnh chủ game gen |
|---|---|---|---|---|
| **13** | Khung vùng 7 | Gió + luật quái bay (B10, B11+B15) + mây mỏng | Truyện, Bé Diều trong tổ | Vùng 7 nhóm C (86), D (8) |
| **14** | 8 quái (B13, B4, B5) | 2 tinh anh + Yêu Gió | **Quạt Mo** (đánh, hất đạn, gió cuốn, Đặc biệt) | Vùng 7 E (10), F; **Quạt Mo** (4 bậc + 12 tư thế + 20 hiệu ứng) |
| **15** | Đại Bàng pha 1–3 | Chim Lạc con + kiểu Bay | Đòn Trống + Đòn Đáp cho Gậy, Quạt; `balance.py vukhi` 6 món | **Chim Lạc con** 3 dạng × 6 + chân dung; Hợp Chiêu Bay, Soi (8) |
| **16** | Cân bằng bot vùng 7 (+ bot chỉ dùng Búa) | Ấn ký mảnh 5–7 + (tuỳ Câu hỏi 7) Thiên phú | Đóng gói → **chơi thử vùng 7** | Ấn mới (6); **vùng 8 nhóm A (11)** |

### Giai đoạn V — Vùng 8 Đền trống đồng (khi chủ game muốn kết)

| Đợt | Phiên A | Phiên B | Phiên C | Ảnh chủ game gen |
|---|---|---|---|---|
| **17** | Khung vùng 8 + 4 quái "ánh đồng" (code) | Nhịp trống 1,2 s + bẫy nhịp + rễ đa + ghép luật ôn 4 ải | Truyện, cảnh rễ đa, Hồn Cây Đa | Vùng 8 nhóm C (66), D (11) |
| **18** | 4 quái mới + 2 tinh anh | Trống Méo (B3 lần đầu) | Hắc Long pha 1 (dùng lại Thuồng Luồng) + Rùa Vàng con | Vùng 8 E (9); **Rùa Vàng con** 3 dạng × 6 + chân dung; Hợp Chiêu Giữ (4) |
| **19** | Hắc Long pha 2 (B16, 6 mảnh mượn chiêu) | Hắc Long pha 3 (nhịp, tượng cóc) + điểm lưu giữa pha | Cảnh kết + Ấn Mặt trời + trang sức Kim sau truyện | Vùng 8 F cảnh kết (b12–b15) |
| **20** | Cân bằng bot toàn 40 ải + kinh tế vùng 5–8 | Soát dung lượng toàn game | **Chơi thử trọn game** | — |

**Nếu chọn thêm bộ trang phục (Câu hỏi 3 = A):** mỗi bộ ~10 ảnh, ~0,3 MB, làm ở **phiên đóng gói của vùng trước** (Sông: đợt 0; Núi: đợt 8; Đá vôi: đợt 12; Mây: đợt 16), mở bán khi hạ trùm vùng đó, cùng luật thẻ Mua.

**Tổng ảnh ước tính:** vùng 5–8 ~490 tấm · lối đánh ~270 · lực chiến ~240 tấm/dải (linh thú ~430 khung) → **khoảng 1.000 tấm/dải**, rải trên 20 đợt (~50 tấm mỗi đợt).

---

## 4. Câu hỏi cần chủ game quyết (★ = đề xuất)

1. **Mỗi vùng mới khó hơn bao nhiêu?** (Sức mạnh khuyên dùng)
   A. ★ +22% mỗi vùng (8-5 ≈ 1.450, vừa trần các hệ mới) · B. +30% (VUNG cũ, 8-5 ≈ 2.050, phải thêm nguồn sức mạnh) · C. +15% (nhẹ, vùng sau dễ thở).
2. **Linh thú đầu tiên**
   A. ★ Nghê Sấm, quà Thần Sét **sau 5-5** · B. Nghê Sấm đi theo **từ 5-2** (có thú sớm hơn, vùng 5 dồn nhiều thứ mới) · C. Gà Lôi Sét nở từ trứng sau 5-5.
3. **Thêm bộ trang phục cho vùng 4–7?** (mua bằng vàng, mở bán sau trùm, kỹ năng ngang bộ Lâu đài — đổi kiểu, không mạnh hơn)
   A. ★ Mỗi vùng một bộ (Sông, Núi, Đá vôi, Mây), giá 4.000 → 7.000; bớt ~15% giá luyện trang sức để bù vàng · B. Chỉ bộ Sông + bộ Trống Đồng (sau Hắc Long) · C. Không thêm, 4 bộ là đủ.
4. **Vũ khí mới**
   A. ★ Cả Gậy Tre (vùng 6) và Quạt Mo (vùng 7) · B. Chỉ Gậy Tre · C. Không thêm vũ khí.
5. **Cách đánh mới có áp lên vùng 1–4 không?**
   A. ★ Né Kịp + Đòn Đáp có ở mọi vùng; Thanh Choáng, Đòn Trống chỉ sau vùng 4 · B. Mọi thứ chỉ từ vùng 5 · C. Mọi thứ có ngay cả ở vùng 1–4 (đo lại cân bằng vùng cũ).
6. **Trần dung lượng khi có 8 vùng**
   A. ★ "Lần mở đầu + vùng đang chơi + thú đang ra trận ≤ 20 MB" (mỗi vùng ≤ ~3,5 MB) · B. Giữ trần tổng 20 MB (phải cắt ảnh mạnh) · C. Nâng trần tổng lên 32 MB.
7. **Làm bao nhiêu hệ lực chiến mới?**
   A. ★ Trang sức + linh thú + cảnh giới + ấn ký; thiên phú để sau, tuỳ phản hồi · B. Bỏ cảnh giới (gọn hơn, dồn vào trang sức) · C. Làm đủ 5 hệ.
8. **Các trùm thua thì sao?**
   A. ★ Không ai chết: Thần Sét tỉnh lại, Chằn Tinh hoá đá, Đại Bàng thu nhỏ bay đi, Hắc Long còn con thuồng luồng bé bơi ra biển + câu móc "ngoài khơi có tiếng đáp lại" · B. Như A nhưng kết hẳn, không câu móc · C. Hắc Long tan biến hẳn.

**Các câu hỏi còn lại trong ba tệp gốc** (VUNG Q2–Q15, LOI-DANH E2, LUC-CHIEN mục 11): nếu chủ game không nói gì thì **làm theo đề xuất in đậm** trong tệp gốc, trừ những câu đã gỡ ở mục 2 (VUNG Q1, Q2, Q4, Q5, Q11, Q13, Q15; LOI-DANH Q4, Q6, Q8, Q9; LUC-CHIEN Q1, Q6, Q7) — các câu đó theo tệp này.
