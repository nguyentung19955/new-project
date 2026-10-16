# TIẾNG VỌNG CUỐI CÙNG — Game Design Document

Oct 16, 2026 · @TÙNG

## 1. Tổng quan

**Pitch một câu:** Một metroidvania pixel art theo chiều dọc, nơi bạn có thể *ghi lại 3 giây chuyển động của chính mình thành một "tiếng vọng"* — bóng ma lặp lại đúng từng cú nhảy, từng nhát chém — và dùng nó để giải đố, đánh boss, phá kỷ lục.

| Mục | Nội dung |
| --- | --- |
| Thể loại | Metroidvania + hành động platformer, endgame roguelite |
| Góc nhìn | 2D side-view, pixel art 480×270, nhân vật 32×32 px |
| Nền tảng | PC (Steam) trước, Switch / mobile sau |
| Thời lượng | Cốt truyện 22–28 giờ · 100% khoảng 55 giờ · endgame không giới hạn |
| Đối tượng | 16–35 tuổi, fan Hollow Knight, Celeste, Dead Cells, Ori |
| Cảm hứng cảm giác | Di chuyển chặt như Celeste, chiến đấu nặng tay như Dead Cells, khám phá như Hollow Knight |

**Ba điểm khiến game khác mọi game cùng thể loại:**

1. **Tiếng Vọng là cơ chế cho mọi thứ.** Cùng một nút dùng cho giải đố, combo, di chuyển và mạng xã hội. Người chơi giỏi sẽ "nhảy đôi" với chính bóng mình — đó là thứ họ sẽ quay clip khoe.
2. **Thế giới dọc.** Toàn bộ bản đồ là một cái cây khổng lồ: leo lên là trời, đào xuống là vực. Leo trèo, trượt tường, đi thang không phải phụ kiện mà là ngôn ngữ chính của game.
3. **Cái chết để lại dấu vết.** Mỗi lần chết, bạn và người chơi khác thấy được tiếng vọng 5 giây cuối của nhau — vừa là cảnh báo, vừa là gợi ý, vừa là trò cười cộng đồng.

## 2. Bối cảnh & cốt truyện

**Thế giới — Cây Chuông Vĩnh Hằng.** Một cái cây cao hàng nghìn trượng, thân cây rỗng chứa cả một nền văn minh. Trên mỗi tầng treo những quả chuông cổ; tiếng chuông giữ cho mọi sinh vật nhớ được mình là ai. Từ đáy vực, một thứ gọi là **Sự Lặng** đang bò lên: nơi nó đi qua, âm thanh tắt, ký ức tan, và sinh vật biến thành những cái vỏ rỗng hung dữ.

**Tông màu:** u buồn nhưng ấm, như truyện cổ tích bị lãng quên. Mỗi tầng có bảng màu riêng; càng xuống sâu màu càng tắt dần thành xám.

### Nhân vật chính

**Lam** — cô bé học việc giữ chuông, câm từ lúc tỉnh dậy, mang cây gậy chuông bằng đồng. Cô không nói được, chỉ "vọng lại" được. Khăn quàng đỏ dài là điểm nhận diện và là chuyển động phụ (secondary motion) đẹp nhất trên màn hình.

### Dàn nhân vật phụ

| Nhân vật | Vai trò | Điểm nhớ |
| --- | --- | --- |
| Bà Ngân | Người giữ chuông già ở làng trung tâm, chủ cửa hàng nâng cấp | Luôn hát dở một bài ru, hát trọn khi bạn tìm đủ lời |
| Tích Tắc | Con cú máy chở bản đồ | Bán bản đồ từng vùng, đùa nhạt, phản bội ở hồi 2 rồi chuộc lỗi |
| Thợ Rèn Hòn | Người đá câm như Lam, rèn chuông vũ khí | Giao tiếp bằng gõ búa — người chơi dần hiểu nhịp |
| Kha | Đối thủ, cũng có năng lực vọng | Đua với bạn ở 4 điểm trong game, mỗi lần nhanh hơn |
| Người Gác Lặng | Phản diện, chưa lộ mặt đến hồi 3 | Xuất hiện như một vệt xám trong nền ở mọi vùng |

### Ba hồi

1. **Hồi 1 — Tiếng chuông cuối (6–8 giờ).** Chuông ở làng nứt. Lam phải leo lên đỉnh và lặn xuống đáy để thu lại 3 Âm Gốc. Học di chuyển, gặp Kha, mở bản đồ.
2. **Hồi 2 — Những bản sao (9–11 giờ).** Lam phát hiện những tiếng vọng mang hình cô ở các vùng mà cô chưa từng đến. Tích Tắc phản bội và giao một Âm Gốc cho Người Gác Lặng. Thế giới bị đảo: các vùng cũ đổi trạng thái (ngập nước, đóng băng, lật ngược).
3. **Hồi 3 — Người đầu tiên (6–8 giờ).** Xuống Vực Lặng, Lam gặp Người Gác Lặng — chính là Lam thật, người giữ chuông đã chết từ trăm năm trước.

### Cú twist

Lam người chơi điều khiển **là một tiếng vọng** — bản ghi của cô gái thật, được Bà Ngân dựng lại bằng chiếc chuông cuối cùng. Đó là lý do cô câm: tiếng vọng chỉ lặp lại, không tự nói được. Sự Lặng không phải ác quỷ, mà là nỗi đau của Lam thật, người muốn thế giới ngừng nhớ để không còn ai phải mất mát.

Người chơi tinh ý sẽ thấy manh mối từ giờ đầu: Lam không có bóng dưới ánh đèn, và mọi tiếng vọng cô tạo ra luôn trễ hơn cô đúng 1 khung hình.

### Ba kết thúc

| Kết thúc | Điều kiện | Kết quả |
| --- | --- | --- |
| Rung Chuông | Hạ boss cuối | Âm thanh trở lại, Lam tan biến như một tiếng vọng tắt dần |
| Im Lặng | Chọn buông chuông trong trận cuối | Thế giới ngủ yên, Lam ở lại bên Lam thật |
| Bài Ru Trọn Vẹn (kết thật) | Đủ 48 Mảnh Ký Ức + lời ru của Bà Ngân | Lam trở thành chiếc chuông mới, cất lên tiếng nói đầu tiên — câu thoại duy nhất của cô trong cả game |

## 3. Cơ chế lõi: Tiếng Vọng

Giữ nút **Vọng** để ghi tối đa 3 giây chuyển động; thả ra, một bóng xanh mờ lặp lại y hệt từ điểm bắt đầu. Bóng có hitbox, đè được công tắc, nhận đòn thay bạn, và gây 40% sát thương đòn gốc.

**Quy tắc thiết kế:** dễ hiểu trong 10 giây, mất 50 giờ để thành thạo.

| Cách dùng | Ví dụ trong game | Kỹ năng người chơi cần |
| --- | --- | --- |
| Giải đố | Bóng đứng giữ công tắc trong khi bạn chạy qua cửa | Lên kế hoạch |
| Combo | Chém 3 nhát, ghi lại, bóng chém tiếp 3 nhát = combo 6 hit | Canh nhịp |
| Di chuyển | Bóng nhảy lên, bạn dùng nó làm điểm bật (đạp lên đầu bóng) | Phản xạ |
| Phòng thủ | Bóng đứng chắn đạn trong khi bạn hồi máu | Đọc boss |
| Mạng xã hội | Tiếng vọng lúc chết hiện ở thế giới của người chơi khác | Cộng đồng |

**Thanh Âm Lượng:** ghi vọng tốn Âm Lượng (thanh xanh dưới máu). Đánh trúng địch hồi Âm Lượng — buộc người chơi phải tấn công để có tài nguyên, không núp.

**Tiến triển của cơ chế** (mở dần theo cốt truyện, mỗi lần mở là một "khoảnh khắc wow"):

1. Vọng cơ bản — 1 bóng, 3 giây
2. Đổi Chỗ — dịch chuyển tức thì đến vị trí bóng
3. Cộng Hưởng — bóng nổ khi chạm địch
4. Vọng Kép — 2 bóng cùng lúc
5. Vọng Ngược — bóng chạy lùi thời gian, kéo địch theo
6. Hợp Xướng (cuối game) — 4 bóng, mỗi bóng dùng một vũ khí khác nhau

**Hiệu ứng nhịp:** bóng luôn trễ bạn 1 khung hình (manh mối twist). Khi bạn và bóng đánh trúng cùng một mục tiêu trong cùng 1 khung, kích hoạt **"Hòa Âm"**: hit stop dài, màn hình rung nhẹ, sát thương ×2 và một nốt nhạc vang lên. Đây là cảm giác người chơi sẽ săn hàng trăm giờ.

## 4. Bộ động tác của Lam

Lam có 27 động tác chính, chia 2 nhóm, cộng bộ chỉ số cảm giác điều khiển. Động tác có dấu ★ được mở dần qua khám phá — mỗi cái mở ra vùng bản đồ cũ không đi được trước đó.

### Di chuyển

| Động tác | Mô tả | Mở khi |
| --- | --- | --- |
| Đi / Chạy / Phi nước rút | Tăng tốc mượt 0 → tối đa trong 6 khung, phanh trượt có bụi | Có sẵn |
| Nhảy (cao theo độ giữ nút) | Nhấn nhanh = nhảy thấp, giữ = nhảy cao | Có sẵn |
| Cúi / Bò | Chui qua khe 16 px | Có sẵn |
| Trượt đất | Chạy + cúi = trượt dưới cửa, dưới đạn | Có sẵn |
| Đi thang | Lên, xuống, nhảy ngang khỏi thang, giữ xuống để tuột nhanh | Có sẵn |
| Bám mép & đu lên | Tự bám khi chạm mép, nhấn lên để đu (mantle) | Có sẵn |
| Trượt tường | Áp vào tường là trượt chậm, tóe tia lửa trên tường đá | Có sẵn |
| Bật tường | Nhảy khỏi tường, nối liên tục giữa hai vách | Có sẵn |
| ★ Leo tường | Bám và leo lên/xuống, tốn Sức Bám (thanh nhỏ quanh nhân vật) | Vùng 1 |
| ★ Lướt (dash) | 8 hướng, xuyên đạn trong 6 khung đầu | Vùng 2 |
| ★ Móc chuông | Phóng xích chuông vào vòng sắt, đu như Tarzan, kéo vật | Vùng 3 |
| ★ Nhảy đôi | Nhảy lần hai trên không bằng sóng âm | Vùng 4 |
| ★ Đu xà trần | Treo người di chuyển dưới dây leo, trần sắt | Vùng 4 |
| ★ Bơi & lặn | Bơi 8 hướng, lướt dưới nước | Vùng 5 |
| ★ Lượn | Dang khăn quàng lượn chậm, cưỡi luồng gió | Vùng 6 |
| ★ Đập đất | Lao thẳng xuống, phá sàn nứt, nảy lên cao | Vùng 7 |

### Chiến đấu

| Động tác | Mô tả |
| --- | --- |
| Combo 3 nhát | Nhát 3 đẩy lùi; mỗi vũ khí có nhịp combo khác |
| Combo trên không | 2 nhát + nhát đập xuống |
| Chém hất (launcher) | Lên + đánh, hất địch lên không rồi đuổi theo |
| Chém nảy (pogo) | Đánh xuống khi trên không: nảy lên khỏi địch / gai |
| Đòn tụ lực | Giữ 0,6 giây, phá giáp |
| Ngân (parry) | Nhấn đúng 8 khung trước khi trúng đòn: chuông vang, địch choáng, tự tạo 1 tiếng vọng miễn phí |
| Lăn né | Né trên đất, 10 khung bất tử |
| Kết liễu | Địch choáng → nhấn đánh để chơi animation kết liễu riêng cho từng loại địch |
| Ném chuông | Ném gậy chuông như boomerang, kéo về bằng xích |

### Chỉ số cảm giác điều khiển (bắt buộc đạt)

- Coyote time 6 khung: vẫn nhảy được sau khi rời mép
- Jump buffer 8 khung: nhấn nhảy hơi sớm trước khi chạm đất vẫn nhận
- Đỉnh nhảy trọng lực giảm 50% trong 4 khung: cảm giác "lơ lửng" dễ điều khiển
- Góc tường tự đẩy (corner correction) 4 px: không bị kẹt khi nhảy sát góc
- Mọi đòn tấn công hủy được sang lướt / lăn sau khung chạm (animation cancel)
- Độ trễ đầu vào tối đa 1 khung ở 60 FPS

## 5. Animation mượt

Game chạy logic 60 FPS, sprite vẽ ở nhịp 12 FPS cho chuyển động thường và 24 FPS cho đòn đánh — đủ "pixel" mà vẫn mượt. Độ mượt đến từ 3 thứ: đủ khung chuyển tiếp, chuyển động phụ, và phản hồi va chạm.

### Số khung cho các animation chính

| Animation | Số khung | Ghi chú |
| --- | --- | --- |
| Đứng yên | 8 | Thở, khăn bay nhẹ; sau 10 giây có animation chờ riêng (ngồi xuống gõ chuông) |
| Chạy | 8 | Chu kỳ đủ 2 bước, có khung tiếp đất nặng |
| Bắt đầu chạy / phanh | 3 / 4 | Không bao giờ nhảy thẳng từ đứng sang chạy |
| Nhảy | 2 chuẩn bị + 3 bay lên + 2 đỉnh + 3 rơi + 3 tiếp đất | Co giãn (squash & stretch) ở chuẩn bị và tiếp đất |
| Trượt tường | 4 lặp | Bụi / tia lửa rơi theo vật liệu tường |
| Bật tường | 5 | Khung đầu xoay người, tóc và khăn đổi hướng trễ 2 khung |
| Leo tường | 6 lặp | Tay chân luân phiên, chậm dần khi Sức Bám gần hết, run tay ở 20% |
| Đi thang | 6 lặp | Khung riêng cho lên đầu thang và tuột nhanh |
| Bám mép + đu lên | 7 | Nhân vật trượt ngược 1 px trước khi kéo người — cảm giác có trọng lượng |
| Combo chém | 4–6 mỗi nhát | Có 1 khung smear (vệt mờ) ở mỗi nhát |
| Lướt | 4 | Để lại 3 bóng sau lưng |
| Ngân (parry) | 5 | Khung trắng toàn thân khi trúng |

### Nguyên tắc bắt buộc

- **Khăn quàng, tóc, dây xích** chạy vật lý riêng (verlet 6 điểm) — đây là thứ khiến pixel art trông "sống"
- **Hit stop**: đòn nhẹ 3 khung, đòn nặng 6 khung, Hòa Âm 10 khung
- **Rung màn hình** có hướng theo đòn, không rung ngẫu nhiên
- **Kết liễu**: mỗi loại địch có animation chết riêng, rơi ra đúng hình dạng các mảnh
- Animation chuyển tiếp ưu tiên cảm giác điều khiển: khi người chơi bấm, nhân vật phản hồi trong khung kế tiếp, animation chỉ được "đuổi theo" chứ không được chặn input
- Cảnh nền có 4–6 lớp parallax, lá rơi, côn trùng, đèn lồng đung đưa; ánh sáng 2D động cho hang tối

## 6. Skill, vũ khí & build

Build = 1 Chuông (vũ khí) + 2 Khúc Ngân (skill chủ động) + Âm Phù (bị động). Đổi được ở mọi điểm lưu, nên người chơi được khuyến khích thử nghiệm thay vì sợ "build hỏng".

### Chuông — 6 vũ khí, mỗi cái đổi cả lối chơi

| Chuông | Phong cách | Đặc điểm riêng |
| --- | --- | --- |
| Chuông Đồng | Cân bằng | Combo 3 nhát, nhát 3 tạo sóng âm ngắn |
| Chuông Gió | Nhanh, trên không | Combo 5 nhát, mỗi nhát trên không giữ bạn lơ lửng thêm |
| Chuông Đá | Nặng | Chậm, phá giáp, đòn tụ lực tạo động đất |
| Chuông Đôi | Song kiếm | Bóng vọng dùng chuông còn lại — nhân đôi tiếng vọng |
| Chuông Băng | Khống chế | Làm chậm địch, đóng băng mặt nước thành sàn |
| Chuông Vỡ (bí mật) | Rủi ro cao | Sát thương ×2, mất máu khi đánh hụt |

### Khúc Ngân — skill chủ động (chọn 2 trong 12)

Ví dụ tiêu biểu:

- **Vòng Âm**: tạo vòng chắn đạn 2 giây
- **Tiếng Sét**: gọi sét xuống vị trí bóng vọng
- **Gọi Bầy**: triệu 3 chim sẻ đồng tự cắn địch
- **Cột Âm**: dựng cột sóng âm làm bậc nhảy tạm thời (dùng cả trong platforming)
- **Lặng Thinh**: tàng hình 3 giây, đòn kế tiếp chí mạng
- **Thủy Triều**: đẩy toàn bộ địch trên màn về một phía

### Âm Phù — bị động (cắm vào Dây Ngân)

Bắt đầu với 3 ô Dây Ngân, tối đa 10. Mỗi Âm Phù tốn 1–4 ô. Có **52 Âm Phù**, trong đó 8 bộ có hiệu ứng set khi đủ.

**Bốn build mẫu người chơi sẽ tự tìm ra:**

1. **Dàn Hợp Xướng** — Chuông Đôi + Vọng Kép + Âm Phù tăng sát thương bóng: bóng đánh mạnh hơn bạn
2. **Chim Không Đáp** — Chuông Gió + Âm Phù hồi Lướt khi chém trúng: không bao giờ chạm đất
3. **Đá Tảng** — Chuông Đá + Âm Phù hồi máu khi Ngân: đứng một chỗ đỡ hết mọi thứ
4. **Kẻ Liều** — Chuông Vỡ + Âm Phù "1 máu = ×3 sát thương": dành cho speedrunner

Nguyên tắc cân bằng: không build nào mạnh nhất ở mọi nơi. Mỗi boss và mỗi tầng endgame đều có một "build khắc chế" khác nhau, buộc người chơi sưu tầm đủ đồ.

## 7. Item, kinh tế & chế tạo

Ba loại tiền, mỗi loại phục vụ một nhịp chơi khác nhau: ngắn hạn, trung hạn, dài hạn.

| Tiền tệ | Nguồn | Dùng để | Mất khi chết? |
| --- | --- | --- | --- |
| Âm Bạc | Địch, rương | Mua đồ, bản đồ, hồi phục | Rơi tại chỗ chết; nhặt lại tiếng vọng của mình để lấy 100% |
| Đồng Cổ | Boss, khu bí mật, endgame | Rèn và nâng cấp Chuông | Không |
| Mảnh Ký Ức | 48 mảnh giấu khắp bản đồ | Mở lore, mở kết thật, +1 ô Dây Ngân mỗi 6 mảnh | Không |

### Các loại item

| Loại | Số lượng | Ví dụ |
| --- | --- | --- |
| Chuông (vũ khí) | 6, mỗi cái nâng cấp 5 cấp | Chuông Gió +5 mở thêm nhát combo thứ 6 |
| Âm Phù | 52 | "Bước Lặng": trượt tường không tốn Sức Bám |
| Bình Sương (hồi máu) | 2 → 6 bình | Tìm Cánh Hoa Sương để thêm bình |
| Mảnh Tim / Mảnh Âm | 16 / 12 | 4 mảnh = +1 máu tối đa / +1 thanh Âm Lượng |
| Vật phẩm dùng một lần | 10 loại | Bom âm thanh, mồi nhử, đèn soi tường giả |
| Trang phục | 24 | Chỉ đổi ngoại hình, mở bằng thành tích — không bán bằng tiền thật |
| Vật phẩm cốt truyện | 15 | Lời ru của Bà Ngân, la bàn hỏng của Tích Tắc |

### Chế tạo

Thợ Rèn Hòn rèn Chuông và Âm Phù cấp cao từ Đồng Cổ + nguyên liệu vùng. Ở endgame, Âm Phù rơi ra có **thuộc tính ngẫu nhiên** (1–3 dòng phụ), độ hiếm Thường / Hiếm / Huyền Thoại / Vọng Cổ. Người chơi có thể "tôi luyện" lại một dòng phụ — đây là vòng lặp săn đồ dài hạn.

**Nguyên tắc vàng:** mọi item rơi ra phải khiến người chơi muốn thử ngay, không có đồ "rác" chỉ để bán.

## 8. Thế giới: 9 vùng đất & boss

Bản đồ xếp theo chiều dọc của Cây Chuông, làng trung tâm nằm giữa thân cây. Bảng dưới đi từ ngọn xuống đáy. Mỗi vùng có một **cơ chế địa hình riêng** để leo trèo không bao giờ lặp lại.

| Tầng | Vùng | Cơ chế địa hình | Boss | Kỹ năng boss kiểm tra |
| --- | --- | --- | --- | --- |
| Ngọn | Đỉnh Sấm | Sét đánh theo nhịp chuông, phải nhảy giữa các nhịp | Thần Điểu Sấm | Lượn + Vọng Ngược |
| Tán | Tán Gió | Luồng gió đổi chiều, lá khổng lồ làm sàn | Bà Mẹ Ve Sầu | Nhảy đôi, đọc nhịp âm |
| Cành | Tổ Sắt | Thang dây, ròng rọc, móc chuông giữa các tổ chim máy | Tích Tắc (hồi 2) | Móc chuông, đánh trên không |
| Thân trên | Thư Viện Vang | Sách bay làm bậc, chữ viết thành tường | Người Thủ Thư Không Đầu | Giải đố bằng tiếng vọng |
| **Giữa** | **Làng Chuông (hub)** | An toàn, cửa hàng, thợ rèn, bảng nhiệm vụ | — | — |
| Thân dưới | Xưởng Đồng Bỏ Hoang | Băng chuyền, pít-tông, sàn sập | Cỗ Máy Đúc Chuông | Lướt, canh thời gian |
| Rễ | Rễ Mục | Tường mục leo được nhưng gãy sau 2 giây | Mẹ Nấm Mốc | Leo tường, quản lý Sức Bám |
| Rễ sâu | Hồ Ngầm Phản Chiếu | Nước phản chiếu tạo bản sao ngược của bạn | Kha (trận cuối) | Mọi kỹ năng — gương của bạn |
| Đáy | Vực Lặng | Không có âm thanh; tiếng vọng là nguồn sáng duy nhất | Người Gác Lặng | Hợp Xướng |

**Nhịp khám phá:** mỗi vùng có ít nhất 6 lối tắt mở ngược về hub, 3 phòng bí mật (tường giả), 1 thử thách platforming khó lấy Mảnh Ký Ức, và 1 nhân vật phụ có nhiệm vụ riêng.

**Thiết kế boss:** mỗi boss 2–3 pha, mọi đòn đều có tín hiệu báo trước rõ ràng bằng âm thanh và hình (telegraph 20–30 khung). Thua là do người chơi, không phải do may rủi. Mỗi boss có phiên bản **"Vọng Cổ"** khó hơn ở endgame, rơi trang phục riêng.

Ngoài 8 boss chính có thêm **14 mini-boss** và **5 boss bí mật**.

## 9. Vòng lặp giữ chân 3–4 tháng

Người chơi ở lại vì luôn có một mục tiêu trong 10 phút tới, một mục tiêu trong tuần này, và một mục tiêu trong tháng này — không phải vì bị ép. Không có năng lượng, không có pay-to-win, không phạt khi nghỉ chơi.

### Ba vòng lặp lồng nhau

| Vòng | Độ dài | Người chơi làm gì | Phần thưởng cảm xúc |
| --- | --- | --- | --- |
| Khoảnh khắc | 30 giây – 2 phút | Vượt một phòng, đánh một đợt địch | Hòa Âm, combo đẹp, lối tắt mới |
| Buổi chơi | 30–90 phút | Khám phá một khu, hạ boss, mở kỹ năng | Vùng cũ mở ra lối mới |
| Mùa | 2–4 tuần | Leo bảng Vực Lặng, săn bộ Âm Phù, hoàn thành 100% | Trang phục hiếm, danh hiệu, thứ hạng |

### Endgame: Vực Lặng

Một chế độ roguelite mở sau khi xong cốt truyện. Mỗi lần xuống là một chuỗi phòng ngẫu nhiên ghép từ 600+ phòng thiết kế tay, 30 tầng, cứ 5 tầng một boss. Mỗi tầng có một **"Biến Âm"** ngẫu nhiên (ví dụ: trọng lực đảo, tường đều là băng, tiếng vọng gây sát thương cho bạn).

- **Vực Ngày**: hạt giống (seed) chung cho cả thế giới mỗi ngày, một lượt duy nhất, bảng xếp hạng toàn cầu
- **Vực Tuần**: seed cố định cả tuần, chơi lại không giới hạn để tối ưu
- **Vực Vô Tận**: không đáy, đồ ngon nhất rơi ở tầng 40+

### Các trụ giữ chân khác

- **Tiếng vọng cộng đồng**: thấy bóng chết của người khác; "chuông bạc" cho tiếng vọng hữu ích — người được tặng nhiều sẽ có huy hiệu
- **Đua bóng**: tải bóng chạy của top 10 thế giới về để đua cùng trong mọi màn thử thách
- **Chế độ Speedrun** có đồng hồ tích hợp, chia đoạn, hiển thị chênh lệch theo thời gian thực
- **NG+ "Đảo Ngược"**: bản đồ lật dọc, địch mới, boss có pha mới, mở sau kết thúc đầu tiên
- **Mã build**: chia sẻ build bằng một chuỗi 12 ký tự

### Lịch nội dung 16 tuần sau phát hành

| Tuần | Nhịp người chơi | Nội dung thêm vào |
| --- | --- | --- |
| 1–4 | Chơi cốt truyện, khám phá | Vực Ngày bật từ ngày 1; sự kiện cộng đồng "tìm tường giả" |
| 5–8 | Săn 100%, NG+, thử build | Mùa 1 Vực Lặng: 3 Âm Phù mới, bảng xếp hạng mùa |
| 9–12 | Endgame, speedrun | Cập nhật miễn phí: vùng mới "Gác Chuông Đổ" + 1 boss, 2 Chuông mới |
| 13–16 | Cạnh tranh, sáng tạo | Mùa 2: Biến Âm mới, giải đấu speedrun cộng đồng, công cụ tạo phòng thử thách |

## 10. Kế hoạch sản xuất

Mục tiêu: bản chơi thử dọc (vertical slice) sau 4 tháng, phát hành sau khoảng 24 tháng với đội 8–10 người. Nếu đội nhỏ hơn, cắt Vực Lặng xuống 15 tầng và giảm còn 6 vùng — cơ chế Tiếng Vọng thì giữ nguyên.

### Kỹ thuật

- **Engine:** Godot 4 (miễn phí, mạnh cho 2D pixel perfect) hoặc Unity
- **Độ phân giải gốc:** 480×270, phóng nguyên lần lên 1080p / 4K
- **Công cụ vẽ:** Aseprite cho sprite, LDtk hoặc Tiled cho bản đồ
- **Ghi tiếng vọng:** lưu trạng thái input + vị trí mỗi khung (≈180 khung / 3 giây), phát lại tất định (deterministic)
- **Tiếng vọng online:** chỉ gửi dữ liệu input nén (vài KB), không gửi video

### Đội ngũ

| Vai trò | Số người |
| --- | --- |
| Game designer / level designer | 2 |
| Lập trình viên | 2 |
| Họa sĩ pixel (nhân vật + animation) | 2 |
| Họa sĩ môi trường | 1 |
| Âm nhạc & âm thanh (cực quan trọng — game về âm thanh) | 1 |
| Producer / QA | 1 |

### Các mốc

| Mốc | Tháng | Tiêu chí qua mốc |
| --- | --- | --- |
| Prototype di chuyển | 1–2 | Chạy, nhảy, trượt tường, leo, thang "sướng tay" trong phòng xám; người chơi thử chơi 20 phút không chán |
| Vertical slice | 3–4 | Làng Chuông + Rễ Mục + 1 boss hoàn chỉnh art, nhạc, Tiếng Vọng cơ bản |
| Alpha | 5–14 | Đủ 8 vùng chơi được, art tạm |
| Beta | 15–20 | Đủ art, cốt truyện, Vực Lặng |
| Demo Steam Next Fest | 18 | Gom wishlist, mục tiêu 50.000 |
| Phát hành | 24 | Bản 1.0 + lịch cập nhật 16 tuần |

### Chỉ số thành công

| Chỉ số | Mục tiêu |
| --- | --- |
| Giữ chân ngày 1 | 45% |
| Giữ chân ngày 7 | 22% |
| Giữ chân ngày 30 | 10% |
| Thời gian chơi trung bình | 30+ giờ |
| Tỷ lệ người chơi vào endgame | 25% |
| Đánh giá Steam | Rất tích cực (≥ 90%) |

### Rủi ro lớn nhất

- **Tiếng Vọng quá khó hiểu** → tutorial dạy bằng câu đố, không bằng chữ; thử với 20 người chưa từng chơi metroidvania
- **Animation tốn thời gian hơn dự tính** → làm trước 10 động tác lõi thật đẹp, các động tác phụ dùng chung khung
- **Endgame lặp lại nhàm** → Biến Âm và mùa giải phải sẵn sàng từ trước phát hành, không làm sau
