# Báo cáo tester 2: hình ảnh, màu sắc, giao diện, hoạt ảnh, cốt truyện, âm thanh (Linh Khí)

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
