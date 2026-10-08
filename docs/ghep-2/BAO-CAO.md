# Báo cáo đợt ghép 2

Nhánh: `claude/ghep-2`, lấy `claude/ghep-1` làm gốc rồi ghép `claude/phong-vuong` vào.

Kết quả chính: hai nhánh đã thành một game chạy được. Em bé tinh linh cầm vũ khí sống, đánh bằng lối đánh mới, trong phòng vuông có bốn cửa và bản đồ ải ngẫu nhiên. Đã làm đủ tám mục A đến H. Mọi bài kiểm tra của cả hai nhánh đều qua, kể cả bài đo sát thương trong phòng nhỏ (trước lệch 21%, nay 10%, ngưỡng là 15%). Không phải bỏ tính năng nào của bên nào.

## Ảnh nên xem (cùng thư mục này)

| Ảnh | Nội dung |
| --- | --- |
| `phong-vuong-hero-moi.png` | **Nên xem đầu tiên.** Thợ Rèn cầm kiếm Lửa bậc Tím đang chém quái trong phòng vuông; nút mới ở lề phải; bản đồ nhỏ một màu |
| `mot-ai-tu-dau-den-cuoi.gif` | Ảnh động 16 giây: đánh ở phòng đầu, cửa mở, sang phòng kề, mở bản đồ to, vào phòng trùm |
| `ban-do-mot-mau.png` | Bản đồ nhỏ và bản đồ to của ba kiểu A, B, C |
| `bon-vu-khi-trong-phong.png` | Kiếm, cung, giáo, búa ra đòn riêng trong phòng vuông |
| `ba-vung.png` | Ba vùng, ba hero khác nhau |
| `phong-trum.png` | Mộc Tinh, Ngư Tinh, Hồ Tinh ở màn hình dài; Ngư Tinh ở màn 16:9 với bộ nút thu nhỏ |

Chụp lại bất cứ lúc nào: `cd game && python3 tests/ghep2_shots.py`. Máy chụp không tải được phông Be Vietnam Pro nên chữ trong ảnh là phông thay thế.

## 1. Cách giải từng xung đột

Git chỉ báo xung đột ở hai file. Các file còn lại ghép tự động; tôi đã đọc lại `stage.js`, `combat.js`, `bot.js` sau khi ghép để chắc là hai phía không giẫm lên nhau.

| File | Cách giải |
| --- | --- |
| `game/README.md` (4 chỗ) | Giữ cả hai: câu mở đầu nói cả em bé tinh linh lẫn bản đồ 8 phòng vuông; dòng phím J lấy cách tả lối đánh mới và bỏ chữ "chọn cửa" (phòng chọn cửa không còn); bảng file và danh sách bài kiểm tra gộp đủ của hai bên |
| `game/tests/ui_input.py` (1 chỗ) | Giữ cả hai dòng: dòng kiểm tra "thả nút Đánh thì đòn tung ra" của ghep-1 và dòng đặt lại chỗ đứng của phong-vuong |
| `game/dist/*` | Không giải tay, chạy lại `build.py` |
| `stage.js`, `combat.js`, `data.js`, `index.html`, `tests/bot.js` | Git ghép sạch. Phần đòn đánh, bậc màu, nút bấm là của ghep-1; phần biên phòng, cửa, sinh quái, bản đồ, bố cục hai lề là của phong-vuong |

Một lỗi do ghép mà git không thấy: một mục của `moves.py` đo tầm tên bằng một con quái đặt ngoài phòng. Đã sửa ở mục C.

Ngoài ra nhiều bài kiểm tra ghi cứng đường dẫn `/home/claude/new-project/game`. Tôi đổi thành tự tìm thư mục game, để chạy được ở bất cứ đâu.

## 2. Đã làm gì ở A đến H

**A. Nút bấm trong bố cục hai lề.** Phòng thường: nút không chạm sàn ở mọi cỡ màn hình. Phòng trùm (sàn rộng hơn) ở màn 16:9: trước đây nút Né và Đặc biệt đè 18 điểm ảnh lên sàn; nay game dùng bộ nút thu nhỏ nép sát mép phải, không đè sàn (chỉ nằm trên tường phải). Cần điều khiển cũng lùi ra để không đè tường trái. Màn hình dài thì giữ nút cỡ thường ở lề.

**B. Em bé và vũ khí sống trong phòng vuông.** Bóng đổ của em bé nay là hình bầu dục tròn hơn, hợp góc nhìn từ trên. Thứ tự vẽ theo chiều sâu: ai đứng thấp hơn trên màn hình thì vẽ sau (đã có bài kiểm tra). Vũ khí to sát tường không bị che: tường bên và tường sau nằm ở lớp nền nên vũ khí vẽ đè lên; lớp phủ trước của phòng chỉ nằm trong dải 20 điểm ảnh sát tường dưới.

**C. Lối đánh trong phòng hẹp.**
- Đòn lao của kiếm và giáo dài theo bề ngang phòng: phòng thường 84 và 101 điểm ảnh, phòng trùm 92 và 112 như cũ. Chạm tường thì dừng ngay và điều khiển lại được liền. Lao vào cửa đang mở thì dừng ở ngưỡng cửa, không tự sang phòng, không kẹt.
- Cung: tên ngắm chéo được tới khoảng 35 độ (trước gần như chỉ bay ngang, nên trong phòng vuông quái tới từ trên dưới là trượt). Tầm tên thường 180, tên mạnh 250. Tên thường xuyên thêm 1 quái, con sau nhận 0,75 lần. Tên vẽ nghiêng theo hướng bay.
- Búa: sóng chấn động chạy xa nhất 0,45 bề ngang phòng và tan ở tường.
- Vùng tròn của đòn người chơi (nện đất, quét vòng, nổ, vũng hệ) nay dùng cùng độ dẹt 0,85 với hình vẽ trên sàn; trước là 0,67 nên hình và vùng trúng lệch nhau.
- Cân lại: vũng độc 0,8 xuống 0,68; gai băng 0,4 lên 0,55; băng vỡ 0,7 và 0,5 lên 0,9 và 0,7; nện đất 1,1 và 1,6 xuống 1,0 và 1,25; sóng nấc 2 từ 0,6 xuống 0,5.
- Sửa một lỗi cũ: đòn lao đi dài hơn con số đã định khoảng 8% vì khung hình cuối.

**D. Bản đồ một màu.** Mọi ô phòng dùng một màu nền và một màu viền. Mọi biểu tượng dùng một màu sáng. Chỉ còn ba khác biệt: ô đang đứng sáng hơn và có viền nổi; ô đã qua đậm, ô mới biết nhạt; cửa Trùm còn khóa có ổ khóa. Chú giải của bản đồ to theo đúng cách đó và có thêm bốn dòng giải thích ba khác biệt này. Số đếm ở góc bản đồ nhỏ cũng bỏ màu xanh, đỏ.

**E. Né tám hướng.** Lộn dọc trước đây chỉ đi bằng 0,6 lộn ngang nên hướng chéo bị lệch góc; nay bằng 0,75, đúng tỉ lệ lúc đi bộ. Đẩy cần nhẹ vẫn lộn đủ quãng. Mũi tên trên nút Né chỉ đúng góc sẽ lộn ở cả tám hướng. Lộn vào cửa mở thì sang phòng kề; lộn vào góc phòng thì dừng ở mép sàn.

**F. Vũ khí rơi theo bốn bậc.** Không phải sửa mã: phần này ghép sạch. Tôi viết bài kiểm tra chạy thật trong hệ phòng mới: rương ở phòng Rương báu, tinh anh ở phòng Tinh anh, trùm nhỏ, trùm vùng. Ải cuối mỗi vùng luôn là Kiểu C và trùm vùng lần đầu rơi Vàng ở cả ba vùng. Bảng kết quả vẽ hình và tên đúng màu bậc.

**G. Suối ở Kiểu B.** Suối chỉ dùng được khi đã dọn đủ 3 phòng quái. Ghé sớm thì hai suối hiện mờ, không bấm được, có dòng "Dọn hết quái rồi quay lại" và "Đã dọn n/3 phòng quái". Luật này áp cho mọi kiểu bản đồ; ở Kiểu A và C thì lúc tới suối luôn đã đủ 3 phòng (có bài kiểm tra).

**H. Hoạt ảnh trùm.** Vòng gai của Ngư Tinh, vòng gai rễ của Mộc Tinh, vòng nứt đất của trùm nhỏ, vòng trong và các tia của Hồ Tinh, gai băng của người chơi: đều vẽ theo độ dẹt mới, khớp vùng cảnh báo.

## 3. Số đo sát thương, trước và sau

Sát thương mỗi giây khi bot chơi, hero cấp 10, vũ khí Lam mài +3, chưa có hệ. "Trước" là ngay sau khi ghép, chưa chỉnh gì.

| | Phòng thường, trước | Phòng thường, sau | Phòng trùm, trước | Phòng trùm, sau |
| --- | --- | --- | --- | --- |
| Kiếm | 64,7 | 61,9 | 53,6 | 50,2 |
| Cung | 47,4 | 57,8 | 42,8 | 53,4 |
| Giáo | 62,0 | 62,6 | 54,1 | 52,1 |
| Búa | 65,6 | 68,9 | 54,3 | 53,7 |
| Lệch nhiều nhất so với trung bình | **21%** | **10%** | **16%** | **4%** |
| Ba hệ lệch nhau | 10% | 10% | 9% | 9% |

Lưu ý khi đọc bảng:
- "Trước" đo 60 giây với 6 hạt giống, "sau" đo 90 giây với 16 hạt giống.
- Giữa chừng tôi sửa bot để nó giữ đà búa và giáo cho tới nơi (trước hay buông sớm). Sau khi sửa bot, búa vọt lên lệch 18%, nên mới phải giảm đòn nện đất. Cột "trước" là của bot cũ.
- Báo cáo ghép 1 ghi 17% cho phòng nhỏ. Số đó đo trong một phòng dài bị thu hẹp giả, không phải phòng thật.

Khi có hệ ở Thức tỉnh, phòng thường (sau): Lửa 89,2; Độc 95,8; Băng 79,7. Cung không còn mạnh nhất khi có hệ: cung Lửa 82,7 so với kiếm 85,9, giáo 92,4, búa 95,6.

## 4. Số đo cân bằng, trước và sau

Bot chơi 15 ải bằng bản lưu cố định (`balance.py`).

| | Nhánh phòng vuông gốc | Ngay sau khi ghép | Bản cuối |
| --- | --- | --- | --- |
| Tỉ lệ bot thắng | 88/90 | 87/90 | 147/150 (hai lượt: 90/90 và 57/60) |
| Thời gian trung bình một ải | 250 giây | 248 giây | 259 đến 263 giây |
| Trong đó đánh trùm | 79 giây | 75 giây | 77 đến 78 giây |
| Dấu ấn mỗi ải | 30,9 | 29,7 | 29,0 đến 30,2 |
| Máu mất mỗi ải | 90% | 88% | 91% |

Bản cuối dài hơn khoảng 5% mỗi ải. Tôi không chỉnh độ khó tổng thể vì đợt này không làm việc đó.

`campaign.py` (15 ải liền trên bản lưu mới), 3 lượt: không thua lần nào, tổng 49, 56 và 52 phút.

## 5. Kết quả từng bài kiểm tra (lần chạy cuối, trên đúng mã của commit này)

| Bài | Kết quả |
| --- | --- |
| `rules.py` | 82/82 |
| `moves.py` | 92/92 (thêm 3 mục cho tên; sửa 8 mục theo luật tên và số mới) |
| `ghep.py` | 109/109 (sửa 1 đoạn dựng cảnh vì tên thường nay xuyên 1 quái) |
| `ghep2.py` (mới, mục A đến H) | 195/195 |
| `mapgen.py` | 1000 hạt giống mỗi kiểu, 0 lỗi |
| `doors.py` | 57/57 luật; bot thắng 9/9 ải thử |
| `fuzz.py` | 16 lượt, 0 lỗi |
| `fx_check.py` | 0 lỗi |
| `ui_input.py all` | phone 114/114, p169 114/114, desk 105/105, port 114/114 |
| `ui_robust.py` | 17/17, 1/1, 16/16 |
| `ui_build.py` | `dist/linh-khi.html` và `dist/artifact.html`: nạp 6/6, chơi bằng điều khiển thật 114/114 mỗi file |
| `env_rooms.py` | 108 phòng, 0 lỗi |
| `anim_smoke.py` | không lỗi |
| `smoke.py` | không lỗi |
| `dps.py 90 16 nho` | đạt: bốn vũ khí lệch 10%, ba hệ lệch 10% |
| `dps.py 90 16 trum` | đạt: bốn vũ khí lệch 4%, ba hệ lệch 9% |
| `perf.py --so` (so với bản ngay sau khi ghép) | đạt: trung bình 1,82 ms mỗi khung, bằng 100% bản cũ; trường hợp chậm nhất bằng 111% |
| `balance.py` | 57/60 và 90/90 (mục 4) |
| `campaign.py` x3 | 0 lần thua |
| `python3 game/build.py` | ghi hai file trong `dist/`, 1003 KB, 19 file JS |

`ghep2.py` gồm 195 mục: A 73 (ba cỡ màn hình), B 17, C 36, D 15, E 9, F 27, G 11, H 7. Chạy riêng một phần: `python3 tests/ghep2.py C` (các phần: `A`, `BE`, `C`, `D`, `FGH`).

Hai chỗ tôi đổi trong bài kiểm tra cũ, cần biết:
- `doors.py`: 9 lượt bot nay chạy có hạt giống, nên chạy lại ra đúng kết quả cũ. Trước đây chạy ngẫu nhiên, thỉnh thoảng một lượt ải 3-4 thua làm cả bài hỏng. Tỉ lệ thắng thật xem ở `balance.py`.
- `dps.py`: nay đo trong phòng thật (`nho` là phòng thường, `trum` là phòng trùm). Chế độ phòng dài bỏ đi vì game không còn phòng dài.

## 6. Chỗ đã sửa ở file dùng chung (cho các phiên sau)

| File | Sửa gì |
| --- | --- |
| `game/js/combat.js` | Đòn lao: dài theo `G.MOVES.dash`, dừng ở tường, khung cuối đi đúng phần còn lại. Né: dùng `G.DODGE`, hướng lộn luôn dài bằng 1. Vùng tròn của đòn người chơi dùng `G.ZK`. Mưa tên luôn rơi trong sàn. Tên xuyên thì yếu đi theo `pierceMult`. `G.heroArgs` thêm `roundShadow` |
| `game/js/moves.js` | `G.MOVES.dash`, `G.MOVES.bow.aim`, tầm và độ xuyên của tên, `waveFrac` của búa, các số cân bằng ở mục 2C. Mọi con số vẫn nằm ở đầu file |
| `game/js/stage.js` | `BTN_BIG`, `stickPos` (nút phòng trùm 16:9); mũi tên nút Né; luật suối (`fountainLocked`) |
| `game/js/minimap.js` | Viết lại phần màu: bảng `G.minimap.PAL` thay `COL`; thêm `G.minimap.cells` cho bài kiểm tra |
| `game/js/data.js` | Thêm `G.DODGE` |
| `game/js/art.js`, `fx.js`, `fx_he.js` | 9 chỗ đổi độ dẹt 0,6 sang `G.ZK`; mũi tên vẽ nghiêng |
| `game/js/hero_tinhlinh.js` | Bóng tròn khi có `roundShadow` (3 dòng) |
| `game/js/room_art.js` | Vật có `dim` thì vẽ mờ (suối còn khóa) |
| `game/tests/bot.js` | Bot bắn chéo theo góc ngắm mới; giữ đà búa và giáo tới nơi; bỏ qua suối còn khóa |

Không sửa: `weapon_art.js`, `btn_art.js`, `boss.js`, `mapgen.js`, `engine.js`, `env_art.js`, `hero_art.js`, `village.js`, `main.js`, `build.py`, `index.html` (ngoài phần git tự ghép).

## 7. Những điều tôi tự quyết, cần chủ dự án biết

1. Tên thường của cung xuyên thêm 1 quái. Đây là cách sửa tận gốc việc cung yếu trong phòng nhỏ; tăng thẳng sát thương thì cung sẽ quá mạnh khi đánh trùm.
2. Đòn nện đất của búa giảm khá nhiều (1,6 xuống 1,25), vì trong phòng vuông quái luôn đứng dồn.
3. Đường lao trong phòng thường chỉ ngắn đi chút ít (kiếm 92 xuống 84, giáo 112 xuống 101). Tôi đã thử ngắn hơn (76 và 95): bot lao không thoát khỏi đám quái và thua nhiều hơn hẳn ở vùng 3 (16/24 so với 22/24 lượt thắng).
4. Lộn dọc đi xa hơn trước (32 lên 39 điểm ảnh), để tám hướng đúng góc.
5. Luật suối áp cho cả ba kiểu bản đồ, không riêng Kiểu B.

## 8. Chỗ còn yếu

1. **Búa vẫn mạnh nhất và cung yếu nhất trong phòng thường** (búa hơn trung bình 10%, cung kém 8%). Trong ngưỡng 15% nhưng chưa đều như ở phòng trùm (4%).
2. **Băng vẫn yếu nhất về sát thương** (kém trung bình 10%). Băng bù lại bằng làm chậm và đóng băng, nên tôi không đẩy thêm.
3. **Ải dài hơn khoảng 5%** so với trước khi chỉnh (mục 4).
4. **Mọi số đo là của bot.** Chưa có người thật chơi thử, chưa thử trên điện thoại thật.
5. **Vũ khí dài chĩa qua tường bên ra lề** khi đứng sát tường (giáo dài gần 60 điểm ảnh). Nó không bị che, nhưng trông như đâm xuyên tường.
6. **Mộc Tinh che mất em bé** khi em bé đứng sát thân cây (xem `phong-trum.png`). Trùm chưa vẽ lại cho góc nhìn từ trên; việc đó thuộc phiên khác.
7. **Màn 16:9, phòng trùm:** nút nhỏ hơn (bán kính 17 thay vì 18, nút Đánh 26 thay vì 28) và nằm trên phần tường phải. Không đè sàn, nhưng sát nhau hơn.
8. **Dòng mẹo vũ khí hai dòng** (hiện khi vào ải) có lúc đè lên nhãn "Rương đồ" ở phòng Suối hồi và mép trên của phòng. Có từ đợt ghép 1.
9. **Ô mới biết trên bản đồ nhỏ khá tối.** Phân biệt được với ô đã qua, nhưng trên màn hình nhỏ ngoài nắng có thể khó thấy. Muốn sáng hơn thì tăng số 0,28 ở `faint` trong `G.minimap.PAL`.
10. **Ở Kiểu B, dòng "Trùm đã học" vẫn hiện khi ghé suối sớm.** Chỉ việc hồi máu, hồi mana là bị khóa.
11. **Mũi tên bay chéo** vẽ bằng cách xô lệch từng mảnh, không xoay thật. Ở góc dốc nhất nhìn hơi bậc thang.
12. **Búa Băng nhận ít dấu ấn nhất** (khoảng một nửa các vũ khí khác), như nhánh gốc đã báo. Chưa sửa.
13. `mot-ai-tu-dau-den-cuoi.gif` nặng 5,2 MB.
14. Các chỗ yếu còn lại của hai nhánh gốc vẫn nguyên: lưới lò rèn chỉ hiện 12 món, giáo quét vòng méo vài khung hình, biểu tượng vũ khí nhỏ mất nét, trùm vẫn vẽ nghiêng.
