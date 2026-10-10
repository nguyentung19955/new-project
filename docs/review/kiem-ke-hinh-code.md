# Kiểm kê hình vẽ bằng code và kế hoạch chuyển sang ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` (bản `dbfe8024`) · phiên này CHỈ kiểm kê và lập kế hoạch, không sửa game, không sửa công cụ.

## 1. Tóm tắt cho chủ dự án

Đã đọc hết 44 tệp code của game (khoảng 32.000 dòng) để tìm mọi hình còn vẽ bằng code.

**Đã có ảnh AI rồi (không phải làm gì thêm):** 36 quái, 4 thân em bé, 160 vũ khí, 41 trang phục, 14 vật phẩm (kể cả các biểu tượng vàng, quặng, đá… trên dải tài nguyên), 18 hiệu ứng.

**Đang có phiên khác làm:** 7 người làng, 12 bộ trang phục em bé, bản đồ ải (12 biểu tượng phòng, ô phòng, lối nối, khung bản đồ), 18 biểu tượng nút điều khiển (đã có lô prompt, game chưa dùng).

**Còn vẽ bằng code, chưa có lô prompt nào** (khoảng 250 hình), xếp theo mức người chơi nhìn thấy nhiều:

| Thứ tự | Nhóm | Số hình cần vẽ | Thấy ở đâu | Độ khó |
|---|---|---|---|---|
| 1 | Phòng chơi: sàn, tường, cửa, đồ trang trí, rương, suối, bàn thờ… | khoảng 100 | mọi trận, chiếm gần hết màn hình | đồ vật dễ, cửa vừa, sàn và tường khó |
| 2 | Nút điều khiển và khung giao diện (vòng nút, ô vũ khí, cần điều khiển, biểu tượng hệ, biểu tượng trên đầu quái, ô đồ, khung thanh máu, logo…) | khoảng 70 | mọi trận và mọi bảng | biểu tượng dễ, khung vừa đến khó |
| 3 | Cảnh làng: đình, cây đa, lò rèn, cổng, sạp hàng, nhà may, giếng, con đò, nền làng, tranh bản đồ vùng | khoảng 22 | mỗi lần về làng, màn chào | vừa |
| 4 | Hiệu ứng còn lại: đạn quái, bom, chiêu Trảm Nguyệt, lướt chém, nổ khói, hồi máu, trùm nổ, vũng lửa/độc… | khoảng 44 dải | mọi trận | phần lớn dễ |
| 5 | Phần còn thiếu của nhân vật và quái: 3 trùm đổi hình theo pha, 3 đồ lưng, cánh theo 3 cấp | khoảng 17 | trận trùm, khi mặc đồ | vừa |

**Không nên chuyển sang ảnh** (mục 4): chữ và số, thanh máu/mana/linh khí, vùng đỏ báo trước đòn, hạt bụi/tàn lửa bay ngẫu nhiên, ánh sáng trong phòng, bóng dưới chân. Lý do chung: chúng đổi theo con số hoặc theo vị trí từng lúc, ảnh vẽ sẵn không theo được.

**Kế hoạch** (mục 6): 19 phiên, chia 5 làn chạy song song (Phòng chơi, Hiệu ứng, Giao diện, Làng, Nhân vật và quái). Mỗi phiên làm xong là bạn có ngay lô prompt mới trên trang công cụ để gửi ChatGPT.

Cần bạn quyết một việc trước khi làm làn Phòng chơi: sàn và tường phòng hiện mỗi phòng một kiểu khác nhau do máy tự sinh. Chuyển sang ảnh thì mỗi vùng chỉ còn 3 kiểu sàn lặp lại (đẹp hơn từng viên, nhưng ít biến hoá hơn). Nếu bạn muốn giữ sàn tự sinh thì bỏ phiên A4.

## 2. Cách đọc tài liệu này

- **Cỡ** ghi theo điểm ảnh game. Màn game là 480×270; màn thật nét gấp đôi (960×540, `G.NET = 2`), nên ảnh AI làm ở độ nét gấp đôi (`"net": 2`) như các lô trước.
- **Trạng thái:** ĐÃ CÓ (có tệp trong `game/art/custom`) · ĐANG LÀM (trang công cụ đã có lô, chưa có tệp) · CHƯA CÓ · GIỮ CODE (không nên chuyển) · MÃ CHẾT (code còn đó nhưng game không bao giờ vẽ).
- **Động:** tĩnh / số khung / "theo thời gian" (code tính liên tục).
- Số dòng theo bản `dbfe8024`, có thể lệch vài dòng khi tệp bị sửa.
- Phần "mất khi dùng ảnh AI" ở mục 3.1 là suy ra từ đọc code, chưa chạy game để nhìn tận mắt. Cỡ công trình làng là ước lượng từ toạ độ trong code.

### Ba kiểu tệp ảnh đang có (đủ dùng cho mọi nhóm còn lại, không cần kiểu mới)

| Kiểu tệp (`doi_tuong`) | Mã | Dùng cho | Game đọc ở |
|---|---|---|---|
| `giao-dien` | `gd-<tên>` | MỘT ảnh tĩnh, có `net`, có `vien` để cắt 9 mảnh (khung co giãn) | `SC.gdSan(mã)`, `SC.veGd(bút, g, x, y, rộng, cao)` trong `sprite_custom.js` |
| `hieu-ung` | `hu-<tên>` | dải khung ngang (1 đến 64 khung), có điểm neo, lặp, xoay, cộng sáng | `G.fxAnh.co(mã)`, `G.fxAnh.ve(...)`, `G.fx.anh(...)` |
| `quai`, `em-be`, `nguoi-lang`, `vu-khi`, `trang-phuc`, `vat-pham`, `ghep` | như cũ | nhân vật, đồ | `sprite_custom.js` |

Đề xuất chung: hình tĩnh (đồ vật, cửa, công trình, nền, biểu tượng, khung) dùng kiểu `giao-dien`; hình có cử động dùng kiểu `hieu-ung`. Như vậy không phải sửa `build.py` và `sprite_custom.js`, các làn làm song song không đụng nhau. Quy ước neo cho hình tĩnh trong cảnh: giữa đáy ảnh là chân vật.

## 3. Bảng kiểm kê đầy đủ

### 3.1 Nhân vật và quái

| Hình | Tệp · hàm | Cỡ | Biến thể | Động | Trạng thái | Ghi chú |
|---|---|---|---|---|---|---|
| 36 quái (24 thường, 6 tinh anh, 3 trùm nhỏ, 3 trùm vùng) | `monster_art.js` Q2/QR/QL/QT/HT (61–1102) | 29×24 đến 177×119 | 36 | 6 động tác (6/6/4/6/4/8 khung) | ĐÃ CÓ 36/36 | ảnh đang ở độ nét thường (không có `net`), kém nét hơn em bé |
| Dáng pha 2, pha 3 của 3 trùm vùng (Ngư Tinh giận/hoá băng, Mộc Tinh giận/hoá độc, Hồ Tinh mắt tím/hoá cuồng) | `monster_art.js` 248–312, 780–870, 983–1099 | 150×102 đến 294×186 | 6 | như trên | CHƯA CÓ | ảnh AI một dáng dùng cho cả 3 pha. Chỗ móc: `boss.js` `A.boss` (395–416) chọn mã theo pha |
| Dáng phồng (Nấm Phồng, Hũ Lửa) và xù gai (Nhím Gai Độc, Nhím Than) lúc sắp đánh | `monster_art.js` 424–450, 478–494, 641–703 | 64×56 đến 76×62 | 4 | — | CHƯA RÕ | tuỳ ảnh AI đã vẽ phồng/xù trong hàng "lấy đà", cần nhìn bằng mắt |
| Động tác riêng: xuất hiện, ra mắt trùm, chiêu 1–5, chuyển pha, choáng | `monster_art.js` CH.*, TRUM.* | — | — | — | CHƯA CÓ | ảnh AI mượn khung đứng/lấy đà/đánh/trúng đòn |
| 11 kiểu tan rã khi chết (vỡ mảnh, cháy, hồn bay…) | `monster_art.js` `tanRa` 1238–1255 | bằng thân | 11 | theo thời gian | GIỮ CODE (đang mất) | với ảnh AI thay bằng khung chết mờ dần + `hu-quai-chet` |
| Hiệu ứng rời quanh quái: vệt chém, vệt lao, nổ tại chỗ, gai toả, đập đất, khí độc, lửa sàn, tia lửa, hiệu ứng xuất hiện (8 kiểu) | `monster_art.js` DON.don 1314–1321, CH.spawn 1368–1378, 1597–1721 | theo tầm đòn 23–52 | khoảng 20 | theo thời gian | GIỮ CODE | bám tầm đòn và cỡ từng con |
| Chiêu riêng của trùm nhỏ và 3 trùm vùng (tường sóng, cột băng, xoáy nước, gai rễ, lá rơi, bùa bay, cầu lửa ma, cột lửa ma, kẹp chéo, nấm con mọc, vệt lửa…) | `monster_art.js` 1521–2051 | tới 260 ngang | khoảng 40 | theo thời gian | GIỮ CODE | bám hướng và tầm; xem thêm 3.9 |
| 4 em bé (thân) | `hero_tinhlinh.js` `drawKid` 675–739 | 16×29 trong ô 48×48 | 4 | 7 động tác | ĐÃ CÓ | code chỉ còn dự phòng |
| 12 thân theo bộ trang phục | — | như trên | 4 em bé × 3 bộ | 7 động tác | ĐANG LÀM | `em-be-<nv>-<rung|bien|lau>` |
| Bóng dưới chân em bé và quái | `hero_tinhlinh.js` 1430–1434; `monster_art.js` 1435; `art.js` `A.ellipse` | 14×3 đến rộng 62% thân | — | co theo độ cao | GIỮ CODE | hình học |
| Nắm tay 4×4 đè chuôi vũ khí, tua màu bậc, vầng sáng đủ bộ, hạt hệ trang phục, vòng khiên, dấu ngực 3×3, viền bậc | `hero_tinhlinh.js` 234, 1328–1407; `sprite_custom.js` 420–477 | 2 đến 28 | theo bậc/hệ | theo thời gian | GIỮ CODE | riêng biểu tượng khiên 7×5 đưa vào lô biểu tượng nhỏ (C2) |
| Em bé "người lớn" bản cũ | `hero_art.js` (cả tệp) | — | — | — | MÃ CHẾT | chỉ chạy khi bản mới lỗi |

Điều nhận thấy khi quái dùng ảnh AI (chưa sửa, vì phiên này không sửa game): mất nhuộm màu khi dính độc/cháy (`SC.veQuai` không truyền `tint`), mất chớp báo sắp ra đòn, mất bóng phân thân pha 2 của Hồ Tinh, Hồ Tinh pha 3 bị vẽ nhỏ còn 72% (`boss.js` dòng 408), và máy vẽ code vẫn dựng thân mỗi khung rồi bỏ (tốn máy).

### 3.2 Vũ khí

| Hình | Tệp · hàm | Cỡ | Biến thể | Trạng thái | Ghi chú |
|---|---|---|---|---|---|
| 40 vũ khí gốc + 120 bản theo hệ | `weapon_art.js` 636–2193 | kiếm 44–48×17–28, cung 19–31×32–44, giáo 57–62×11–23, búa 41–46×17–35 | 4 loại × 10 dòng × (thường, Lửa, Độc, Băng) | ĐÃ CÓ 160/160 | |
| Giai đoạn Mầm (vết than, rêu, sương) và khác biệt giữa Thành hình với Thức tỉnh | `weapon_art.js` 277–489 | — | 120 × 3 | CHƯA CÓ (game tự thêm hạt và quầng sáng) | không ưu tiên: 120 đến 360 ảnh, khác biệt nhỏ |
| Trang trí theo bậc (đá nạm, hoạ tiết khắc, lấp lánh bậc Vàng) | `weapon_art.js` 226–368, 2255 | — | 4 bậc | GIỮ CODE (đang thay bằng viền màu bậc) | |
| Khuôn mặt vũ khí: chớp mắt, há miệng khi đánh, nhăn khi đau, ngủ zzz | `weapon_art.js` `Face` 495–626 | 7×7 | 40 mặt × 5 tâm trạng | CHƯA CÓ, khó | ảnh AI đứng yên nên mất biểu cảm; muốn giữ phải có ảnh theo tâm trạng (ít nhất 40 × 2) và điểm đặt mắt cho từng món |
| Dây cung, mũi tên trên dây, hạt hệ, quầng sáng, viền bậc | `sprite_custom.js` 680–791 | — | — | GIỮ CODE | tính theo độ kéo dây và thời gian |
| Biểu tượng vũ khí trong ô đồ | `sprite_custom.js` `SC.iconVuKhi` | 12–54 | — | ĐÃ CÓ | xoay lại chính ảnh vũ khí |

### 3.3 Trang phục

| Ô | Số món | Trạng thái | Còn thiếu |
|---|---|---|---|
| Mũ | 13 | ĐÃ CÓ 13/13 | cả 13 đang ở độ nét thường và chưa có điểm neo |
| Áo | 13 | ĐÃ CÓ 12/13 | Khố đô vật (không ai mặc được, bỏ qua) |
| Đồ lưng | 6 | ĐÃ CÓ 3/6 | **Áo choàng đỏ, Khăn choàng sương, Trống đồng nhỏ**: người chơi đang thấy bản code (`hero_tinhlinh.js` 449–487), cỡ 13×15, 18×16, 16×25; có vạt bay 4 nhịp |
| Bùa, đồ cầm tay | 10 | ĐÃ CÓ 9/10 | Găng đồng (chỉ là 3×3 điểm màu, giữ code) |
| Cánh | 4 loại × 3 cấp | ĐÃ CÓ 4 ảnh | **chưa có ảnh theo cấp**: 3 cấp trông giống hệt nhau (`hero_tinhlinh.js` 491–530); cần thêm 8 ảnh và đường tìm mã `tp-wings-<loại>-<cấp>` |
| Dấu mặt nạ | 5 | MÃ CHẾT | game đã bỏ ô mặt nạ |

### 3.4 Người làng (ĐANG LÀM)

| Hình | Tệp · hàm | Cỡ | Biến thể | Động | Trạng thái |
|---|---|---|---|---|---|
| 7 người toàn thân trong cảnh làng | `village_scene.js` `drawNpc` 53–144, `putNpc` 173–196 | người 15–19 × 27–33, cả đạo cụ tới 40×40 | 7 | 3 khung rảnh + chớp mắt + nhìn trái/phải | ĐANG LÀM (`nl-lai/ren/xen/may/do/tu/mo`, 0/7 tệp; đường nạp có sẵn) |
| Khuôn mặt trên dải 7 lối tắt | `VS.face` 200–204 | cắt 23×20 | 7 | tĩnh | ĐANG LÀM (tự cắt từ cùng tệp `nl-`) |
| Người đứng cạnh bảng nói chuyện (phóng 3 lần) và Chú Lái Đò trên tranh bản đồ (phóng 2 lần) | `VS.bigNpc` 206; `village.js` 93–99, 138 | 192×192 | 7 | 3 khung | ĐANG LÀM (cùng tệp) |
| Nhịp thở, khăn/râu lay gió | `village_scene.js` 153–172 | 1–2 điểm | — | theo thời gian | GIỮ CODE (sẽ mất khi có ảnh) |
| Dấu chấm than vàng "có việc mới" trên đầu | `bang` 198 | 9×13 | 1 | nhún | CHƯA CÓ → lô biểu tượng nhỏ (C2) |

### 3.5 Phòng chơi (thấy mọi trận) — CHƯA CÓ gì

Phòng thường 208×196 (cả tường 236×257), phòng trùm 300×198. Mỗi phòng vẽ một lần vào bộ nhớ đệm rồi dán. 3 vùng: Rừng già, Hang biển, Lâu đài cổ.

| Hình | Tệp · hàm | Cỡ | Biến thể | Động | Kiểu hình | Trạng thái · độ khó |
|---|---|---|---|---|---|---|
| Sàn phòng | `room_art.js` `floors` 781–876, `floor` 167, 406, 599 | 208×196 hoặc 300×198 | 3 vùng × 3 kiểu = 9 | tĩnh | Lâu đài: gạch lặp 16×16, 28×20; Hang và Rừng: máy tự sinh theo hạt giống, không có ô gạch | CHƯA CÓ · khó |
| Nền tối ngoài phòng | `paintVoid` 163, 402, 595 | 480×270 | 3 | tĩnh | lặp / rải đốm | CHƯA CÓ · dễ |
| Tường sau | `back` 217, 439, 639 | 236 (328) × 49 | 3 | tĩnh | Lâu đài gạch 16×8 lặp; Hang đá rải; Rừng hàng thân cây | CHƯA CÓ · vừa |
| Tường bên, tường trước | `sides` 253, 467, 685; `front` 262, 480, 698 | 14×257; 236×12 | 3 + 3 | tĩnh | dải lặp, chừa chỗ cửa | CHƯA CÓ · vừa |
| Cửa phòng | `door` 268–344, 495–546, 712–760 | trên 32–40 × 39–40; dưới 44–46 × 28; bên 14–18 × 46 | 3 vùng × 3 dạng × (mở, khoá) = 18 | tĩnh | hình rời cố định | CHƯA CÓ · vừa |
| Ổ khoá đỏ, đầu lâu cửa Trùm, xích vàng | `padlock` 45, `skull` 942, `chain` 946 | 12×15, 11×11 | 3 | tĩnh | cố định | CHƯA CÓ · dễ (gộp vào ảnh cửa khoá cũng được) |
| Đồ trang trí góc phòng | `DECOR` 906–925 | 6×15 đến 22×11 | 12 (thùng, hòm, xương sọ, chân nến; đống đá, tinh thể, vũng nước, vỏ sò; gốc cây, bụi quả, nấm đỏ, khúc gỗ) | tĩnh | cố định | CHƯA CÓ · dễ |
| Điểm nhấn góc trên | `accentPlan` 1060–1140 | 26–30 × 20–32 | 4 vật (gốc cổ thụ, mỏ neo, cửa sổ kính màu, tượng hiệp sĩ) + 2 cột sáng | tĩnh | vật cố định; cột sáng là ánh sáng | vật: CHƯA CÓ · dễ; cột sáng: GIỮ CODE |
| Đồ trên tường sau | `backDeco` 228, 447, 664; `torch` 145, `banner` 154 | 6×19 đến 18×18 | khoảng 11 (cột đá, đuốc, 2 cờ, cửa sổ; nhũ đá, tinh thể nhỏ/to; tán lá, dây leo, nấm sáng) | tĩnh (lửa đuốc 3 khung) | cố định, vị trí theo cửa | CHƯA CÓ · dễ đến vừa |
| Tiền cảnh 2 góc dưới (mờ đi khi có người đứng sau) | `fgBuild` 1150–1184 | 30–40 × 36 | 3 vùng × 2 góc | tĩnh | cố định | CHƯA CÓ · vừa |
| Lớp phủ mép dưới (măng đá, cỏ cao) | `fore` 485, 707 | dải mép sàn | 2 | tĩnh | rải theo hạt giống | CHƯA CÓ · vừa (đi cùng sàn) |
| Thảm và hoa văn giữa phòng (Lâu đài) | `carpet` 183–216 | tròn 60, vuông 68×48 | 3 | tĩnh | thảm tròn/vuông cố định; thảm dẫn cửa kéo dài | thảm tròn/vuông: CHƯA CÓ · dễ; thảm cửa: GIỮ CODE |
| Dấu trên sàn theo loại phòng | `mark` 886–903 | 40×33 đến 116×95 | 5 | tĩnh | vòng chấm mờ | CHƯA CÓ · dễ, ưu tiên thấp |
| Mũi tên chỉ lối ở cửa mở | `arrow` 52, `live` 1464 | 10×7 | 4 hướng × 3 màu | 2 khung | cố định | CHƯA CÓ · dễ, ưu tiên thấp |
| Lửa đuốc, nến | `live` 1457–1463 | 4×8, 2×3 | 2 | 3 khung | cố định | CHƯA CÓ · dễ (làm cùng đuốc) |
| Ánh sáng sàn, bóng tường, vệt sáng cửa, cột nắng | `lightPass` 1190, `backPass` 1249, `spill` 66, `shaft` 1045 | cả phòng | — | tĩnh | tính theo nguồn sáng | GIỮ CODE |
| 12 loại hạt môi trường (bụi, đom đóm, lá rơi, giọt nước, sương…) | `ambLive` 1328–1449 | 1–3 điểm | 12 | theo thời gian | — | GIỮ CODE |
| Nước dâng trận Ngư Tinh, vòng báo quái sắp hiện | `live` 1473–1497 | theo trận | — | theo thời gian | theo luật chơi | GIỮ CODE |
| Cảnh phòng kiểu cũ nhìn ngang (bộ giáp, tượng cáo, ngai Hồ Tinh, cầu dây…) | `env_art.js` 101–1216 | — | — | — | — | MÃ CHẾT (mọi phòng nay đều là phòng vuông) |

### 3.6 Đồ vật trong phòng — CHƯA CÓ gì

Vẽ thẳng mỗi khung, neo ở chân vật, có bóng tròn. Đây là nhóm dễ thay nhất.

| Hình | Tệp · hàm | Cỡ | Trạng thái của vật | Động (giữ bằng code) | Thấy |
|---|---|---|---|---|---|
| Rương báu | `env_art.js` `chest` 1230–1253 | 28×21, mở 26×26 | đóng, đã mở | lấp lánh | mỗi ải |
| Suối hồi | `fountain` 1254–1275 | 30×28 | (máu, mana) × (còn, đã dùng) = 4 | nước 2 khung | mỗi ải |
| Rương đồ / giá vũ khí | `stash` 1276–1288 | 26×28 | 1 | lấp lánh | mỗi ải |
| Bàn thờ lời nguyền | `altar` 1289–1308 | 26×22, lửa cao tới 33 | cháy, đã dùng | lửa 2 khung | thỉnh thoảng |
| Sạp thương nhân (có ông lái buôn) | `merchant` 1309–1327 | 36×35 | 1 | đèn 2 khung | thỉnh thoảng |
| Chậu than | `brazier` 1328–1341 | 18×13, lửa cao tới 28 | cháy, tắt | lửa 3 khung | phòng đánh quái |
| Nấm độc | `mushroom` 1342–1355 | 24×21, vỡ 13×5 | nguyên, vỡ | bào tử | phòng đánh quái |
| Tinh thể băng | `crystal` 1356–1373 | 23×26, vỡ 14×4 | nguyên, vỡ | lấp lánh | phòng đánh quái |
| Bệ thử thách | `room_art.js` `pedestal` 1539–1548 | 20×33 | còn, đã dùng | hạt cát 3 khung | thỉnh thoảng |
| Cổng dịch chuyển | `portal.js` `portal` 17–61 | 52×29 + cột sáng 29×34 | 1 | xoáy liên tục | mỗi ải thắng |
| Quầng mời gọi, tia lấp lánh, bóng | `env_art.js` 1221–1228 | 26–30 × 10–12 | — | theo thời gian | GIỮ CODE |
| Bẫy gai, cửa lựa chọn có huy hiệu | `trap` 1374, `door` 1383 | — | — | — | MÃ CHẾT |

Tổng: 18 ảnh tĩnh + 1 dải cổng dịch chuyển.

### 3.7 Cảnh làng — CHƯA CÓ gì (trừ người làng)

Làng rộng 720×270, vẽ một lần rồi nhớ, bị nhân màu chạng vạng. Thấy mỗi lần về làng và ở màn chào.

| Hình | Tệp · hàm | Cỡ (ước lượng) | Động | Trạng thái · độ khó |
|---|---|---|---|---|
| Nền làng: cỏ, hàng tre mép trên, sông, đường đất, sân đình lát gạch, ao sen, cầu bến đò, chiếu Cụ Đồ | `village_scene.js` `grass` 318, `hedge` 327, `river` 334, `path` 323, `aoSen` 282, `cau` 302, `chieu` 307 | 720×270 | tĩnh | CHƯA CÓ · vừa đến khó (ảnh phải khớp chỗ đi được, mép sông, ao) |
| Cổng làng | `cong` 288–294 | 62×56 | tĩnh | CHƯA CÓ · vừa |
| Đình làng | `dinh` 217–226 | 145×70 | tĩnh | CHƯA CÓ · vừa |
| Cây đa | `cayDa` 227–238 | 105×86 | tĩnh | CHƯA CÓ · vừa |
| Lò rèn | `loRen` 239–248 | 84×73 | lửa lò 3 khung, khói (vẽ riêng) | CHƯA CÓ · vừa |
| Sạp hàng xén | `hangXen` 250–258 | 73×56 | tĩnh | CHƯA CÓ · vừa |
| Nhà thợ may | `nhaMay` 259–264 | 76×58 | tĩnh | CHƯA CÓ · vừa |
| Cái đe, giếng + gàu, dây phơi, bảng tranh bản đồ, cây rơm, 2 chum, cột đèn, đèn lồng đỏ | `de` 249, `gieng` 277, `dayPhoi` 271, `bangTranh` 303, `cayRom` 304, `chum` 305, `lampPost` 216, `lantern` 215 | 5×10 đến 40×26 | tĩnh | CHƯA CÓ · dễ |
| Khung cửi | `khungCui` 265–270 | 28×22 | 3 khung | CHƯA CÓ · dễ |
| Con đò | `thuyen` 295–301 | 49×26 | nhấp nhô (code) | CHƯA CÓ · dễ |
| Đàn gà, con cóc | `ga` 306, `coc` 281 | 9×7, 8×6 | 2 dáng | CHƯA CÓ · dễ, lợi ít |
| Lửa lò rèn + khói | `drawWorld` 789–794 | 12×10 | 3 khung | CHƯA CÓ · dễ |
| Quầng sáng đèn, đèn chập chờn, vệt nước, vòng gợn, sậy lay, áo phơi lay, lá rụng, đom đóm | `glow` 308, `ambGround/ambLight/ambTop` 718–770, 824–830 | 1–60 | theo thời gian | GIỮ CODE |
| Bong bóng nói, dải 7 khuôn mặt (nền dải) | `VS.bubble` 840, `VS.drawStrip` 857 | theo chữ; 218×33 | tĩnh | GIỮ CODE (co theo chữ) |

### 3.8 Bản đồ, màn chào, bảng trong làng

| Hình | Tệp · hàm | Cỡ | Biến thể | Trạng thái · độ khó |
|---|---|---|---|---|
| Bản đồ ải: 12 biểu tượng phòng, ô phòng, ô đang đứng, lối nối, khung bản đồ to | `minimap.js` | 7×7, 36×28, 12×5, 380×242 | 16 mã `gd-*` | ĐANG LÀM (trang Tách Giao Diện, 3 lô, game đã sẵn sàng nhận) |
| Tranh bản đồ vùng (giấy cũ, sông, 3 vùng, 3 vùng "sắp có", la bàn, 3 hình trùm nhỏ) | `village_scene.js` `VS.mapArt` 944–988 | 480×270 | ngày, đêm (nhân màu) | CHƯA CÓ · dễ (giữ toạ độ các ải) |
| Đường nét đứt nối ải, chữ trên tranh | `VS.mapDash` 990; `village.js` 116 | — | — | GIỮ CODE |
| 15 thẻ ải mặt trống | `ui_theme.js` `T.stageCard` 381–406 | 38×30, ải trùm 42×34 | (thường, đang chọn, khoá) × (ải, ải trùm) = 6 | CHƯA CÓ · dễ |
| Logo chữ "LINH KHÍ" | `village.js` `titleLogo` 805–821 | khoảng 200×40 | 1 | CHƯA CÓ · dễ (hiện là chữ phông) |
| Mặt trống đồng màn chào | `ui_theme.js` `T.drum` 90 | 42×42 | 1 | CHƯA CÓ · dễ |
| Chữ G Google | `village.js` `googleMark` 896 | 8×8 | 1 | GIỮ CODE (nhãn hiệu, quá nhỏ) |
| Huy chương hạng 1, 2, 3 ở Bảng vàng | `bang_vang.js` `medal` 106–112 | 11×10 | 3 | CHƯA CÓ · dễ |
| Hộp Góp ý, Chọn bản lưu, Đổi tên | `cloud_ui.js` | — | — | GIỮ (là HTML để gõ chữ, không phải hình vẽ) |
| Chấm "đang mặc", chấm hệ, 5 ô điểm kỹ năng, vạch cấp cánh | `village.js` 490, 610; `tailor.js` 59–66, 181 | 3×3 đến 9×8 | — | GIỮ CODE (theo con số) |

### 3.9 Nút điều khiển và HUD trong trận

| Hình | Tệp · hàm | Cỡ | Biến thể | Động | Trạng thái · độ khó |
|---|---|---|---|---|---|
| 14 biểu tượng giữa nút đang dùng: Đánh × 4 vũ khí, Đặc biệt × 4, Chưởng × 3 hệ, Né, Bình máu, Tạm dừng | `btn_art.js` `ICON` 194–375, `iconBuf` 388 | 44×44 (Đánh), 26×26, 14×14, 8×8 | 14 (+4 biểu tượng kỹ năng cũ không bao giờ hiện) | Né xoay 16 hướng | ĐANG LÀM một nửa: lô "Nút điều khiển · 18 biểu tượng" đã có (mã `gd-nut-*`), **game chưa dùng** |
| Thân nút: vòng kim loại + mặt nút | `btn_art.js` `buildBase` 480–527 | 76×81 (Đánh), 56×60, 42×46, 40×44 | vòng theo hệ (đồng, Lửa, Độc, Băng), vòng ngọc, vòng sắt, vuông gỗ × (thường, bấm, khoá) | lún khi bấm | CHƯA CÓ · vừa đến khó |
| Trang trí hệ quanh nút (lưỡi lửa, giọt độc, gai băng) | `decor` 442–476 | quanh vòng | 3 hệ × 3 mốc | lửa/độc 2 khung | CHƯA CÓ · vừa (vẽ liền vào ảnh thân nút theo hệ) |
| Ô vũ khí trên HUD | `buildSlot` 735–776 | 54×35 | 4 bậc × (đang cầm, không) | — | CHƯA CÓ · vừa |
| Cần điều khiển: đế và núm | `buildStickBase` 800, `buildKnob` 820 | 66×66, 30×33 | 1 + 2 | — | CHƯA CÓ · dễ |
| Màn hồi chiêu quét, vòng tích lực, chớp sẵn sàng, số giây, thẻ giá mana | `btn_art.js` 393–591 | — | — | theo con số | GIỮ CODE |
| Thanh máu, mana, kinh nghiệm, máu trùm (phần đầy, vạch, số) | `ui_theme.js` `T.bar` 311–350, `T.bossBar` 257 | 120×11, 108×8, 214×11… | 4 màu | theo máu | GIỮ CODE; riêng KHUNG rỗng có thể thành ảnh (C5) |
| Thanh máu mảnh trên đầu quái | `stage.js` `mobBars` 745–770 | 16×2, 26×2 | 2 | theo máu | GIỮ CODE |
| Biểu tượng 3 hệ (Lửa, Độc, Băng) | `linhkhi.js` `iconCv` 52–84 | 8×8 | 3 (+ bản mờ) | tĩnh | CHƯA CÓ · dễ; dùng ở HUD, kết quả, hành trang, hướng dẫn |
| Biểu tượng trên đầu quái: nhanh, giáp, nổ, hút máu, gai | `mobs.js` `icon` 655–670 | 9×9 | 5 (+ "vỡ giáp" đã dùng ảnh `hu-pha-giap`) | 2 cái nhấp nháy | CHƯA CÓ · dễ |
| Dấu "!" sắp ra đòn | `mobs.js` 722 | 2×8 | 1 | nhấp nháy | CHƯA CÓ · dễ |
| Dấu trạng thái trên đầu quái: cháy, độc, băng, trói | `art.js` `A.status` 1655 | khoảng 6×6 mỗi dấu | 4 | 3–4 khung | CHƯA CÓ · dễ (xếp hàng theo số tầng vẫn bằng code) |
| Vệt khiên cong trước quái giáp, vệt đất khi quái đi ngầm | `mobs.js` `shieldArc` 671, `drawUnder` 726 | 14×20, 10×2 | 2 | — | CHƯA CÓ · dễ, ưu tiên thấp |
| Tấm vạch linh khí, thẻ thích nghi của trùm, dòng báo giữa màn, chữ HUD | `linhkhi.js` 87–139; `stage.js` 784–942 | — | — | theo con số / chữ | GIỮ CODE |

### 3.10 Khung giao diện chung (bộ trống đồng)

| Hình | Tệp · hàm | Cỡ | Biến thể | Trạng thái · độ khó |
|---|---|---|---|---|
| 10 biểu tượng tài nguyên (vàng, quặng, đá, nguyên liệu, mảnh trùm, kinh nghiệm) | `ui_theme.js` `RES` 498–510 | 7×7 | 10 | ĐÃ CÓ (ảnh `vp-*`, `sprite_custom.js` bọc `T.resIcon`) |
| Nút tròn "Nói chuyện" / "Vào cổng" | `T.round` 174–195 | 64×64 | mờ, sáng, đang bấm | CHƯA CÓ · dễ |
| Túi vải (nút Hành trang) | `hanh_trang.js` `bagIcon` 485–497 | 13×13 | 1 | CHƯA CÓ · dễ |
| Ổ khoá nhỏ, dấu tích | `ban_do.js` 120–144 (tệp "bán đồ") | 7×9, 9×9 | khoá/mở, tích | CHƯA CÓ · dễ |
| Sao kết quả ★ ☆ | `stage.js` 1129–1131 | 12×12 | đầy, rỗng | CHƯA CÓ · dễ (hiện là ký tự chữ) |
| Hình món ở bảng Thương nhân và Rương báu (bình máu, quặng, bùa hệ) | `stage.js` 1008–1014, 1075–1082 | khoảng 24×24 | bình máu và quặng đã có ảnh `vp-`; bùa hệ × 3 chưa có | CHƯA CÓ · dễ (hiện chỉ có chữ) |
| Ô đồ 4 bậc | `T.slot` 355–368 | 21 đến 70 (hay dùng 28, 32) | 4 bậc × (thường, chọn) | CHƯA CÓ · vừa (9 mảnh) |
| Khung thẻ thưởng / món hàng | `T.card` 481–494 | 108×100, 100×80 | thường, đang giữ | CHƯA CÓ · vừa |
| Khung thanh máu trùm / tinh anh | `T.bossBar` 257–286 | 226×30, 196×26, 150–224×22 | 3 | CHƯA CÓ · vừa (chỉ khung) |
| Khung bảng (viền đồng, chim Lạc, thuyền, 4 cóc ngồi góc) | `T.panel` 199–224 | 180×182 đến 464×240 | lớn, nhỏ | CHƯA CÓ · khó (9 mảnh + hoa văn theo bề rộng chữ) |
| Nút to, nút nhỏ, thẻ chuyển mục | `T.btn` 120, `T.sbtn` 148 | tự do | 7 tông × 3 trạng thái | CHƯA CÓ · khó (9 mảnh × nhiều tông) |
| Khung thoại người làng, dải thông báo | `T.dialog` 458, `T.toast` 411 | theo chữ | — | CHƯA CÓ · vừa đến khó |
| Tấm nền HUD, ô con, màn tối, dải tài nguyên, thanh cuộn, chấm bậc, chấm đỏ báo mới | `T.plate` 238, `T.inset` 226, `T.dim` 234, `T.topBar` 446 | tự do | — | GIỮ CODE (chỉ là hình chữ nhật có viền) |
| Cây chưởng: viên ngọc hệ | `chuong_ui.js` `orb` 39–44 | 9×8 | 3 hệ × bật/tắt | CHƯA CÓ · dễ |
| 18 nút chưởng và 15 nút kỹ năng | `chuong_ui.js` 69–76; `hanh_trang.js` 380–411 | — | — | KHÔNG CÓ HÌNH: hiện chỉ là ô chữ. Muốn có biểu tượng là vẽ MỚI và phải đổi bố cục bảng (ngoài yêu cầu "thay hình code", ghi lại để bạn cân nhắc) |

### 3.11 Hiệu ứng

**ĐÃ CÓ 18 dải:** `hu-chem-kiem`, `hu-chem-bua`, `hu-dam-giao`, `hu-trung`, `hu-trung-nang`, `hu-chi-mang`, `hu-pha-giap`, `hu-quai-chet`, `hu-len-cap`, `hu-chuong-lua/doc/bang`, `hu-no-lua/doc/bang`, `hu-dan-ten`, `hu-dan-bao-tu`, `hu-dan-qua-no`.

Lưu ý: `hu-len-cap` chỉ hiện ở màn kết quả; trong trận chưa có hiệu ứng lên cấp nào (gần nhất là "tiến hoá vũ khí"). `hu-chem-*` chỉ thay vệt đòn thường. `hu-dan-qua-no` chỉ dùng cho Sóc.

**CHƯA CÓ — nên làm** (mỗi dòng là một dải ảnh; cỡ và số khung là đề xuất):

| Hiệu ứng | Hình code hiện tại (tệp · dòng) | Dải đề xuất | Lặp/xoay | Chỗ móc | Khó |
|---|---|---|---|---|---|
| Đạn bọt nước | `fx_dan.js` `LOOK.bubble` 39 | `hu-dan-bot` 14×14 × 4 | lặp | `fx_dan.js` 240 (bảng kiểu đạn → mã) | dễ |
| Đạn gai băng | `LOOK.icespike` 50 | `hu-dan-gai-bang` 16×8 × 4 | lặp, xoay | như trên | dễ |
| Đạn hạt độc | `LOOK.toxseed` 68 | `hu-dan-hat-doc` 16×8 × 4 | lặp, xoay | như trên | dễ |
| Đạn cục lửa | `LOOK.ember` 86 | `hu-dan-lua` 16×10 × 4 | lặp, xoay, cộng sáng | như trên | dễ |
| Đạn lá bùa | `LOOK.bua` 97 | `hu-dan-bua` 14×14 × 4 | lặp | như trên | dễ |
| Đạn bi sắt pháo | `LOOK.cannon` 103 | `hu-dan-phao` 14×14 × 4 | lặp | như trên | dễ |
| Đạn cầu thường, gai thường (màu theo quái) | `LOOK.orb` 113, `LOOK.thorn` 122 | `hu-dan-cau` 12×12 × 4, `hu-dan-gai` 14×6 × 4 | lặp | như trên (một màu trung tính) | dễ |
| Quả nổ của quái khác | `LOOK.fruit` 76 | dùng lại `hu-dan-qua-no` | — | thêm điều kiện ở `fx_dan.js` 240 | dễ |
| Bom băng (Hải Quỳ, Sứa), bó pháo (Tiểu Yêu), bom to của tinh anh | `mobs.js` `drawBomb` 585–606 | `hu-bom-bang`, `hu-bom-phao`, `hu-bom-to` 16×18 (to 20×22) × 4 | lặp | `mobs.js` 594 (mở rộng điều kiện đang chỉ cho Sóc) | dễ |
| Tên mang hệ Lửa / Độc / Băng | `fx_he.js` 385–418 | `hu-dan-ten-fire/poison/ice` 28×12 × 4 | lặp, xoay | `fx_dan.js` 214 | dễ |
| Trảm Nguyệt (chiêu đặc biệt của kiếm) | `fx_he.js` `drawCres` 542–556 | `hu-tram-nguyet` 48×48 × 4 | lặp, xoay, cộng sáng | trong `drawCres` | dễ |
| Lướt chém | `fx_he.js` 164–170 | `hu-chem-luot` 64×28 × 6 | xoay | `fx_he.js` 166 | dễ đến vừa |
| Giáo quét vòng | `fx_he.js` 182–191 | `hu-quet-giao` 104×36 × 8 | — | `fx_he.js` 185 | vừa |
| Nện đất (búa) | `fx.js` `slam` 600–613 | `hu-nen-dat` 80×48 × 6 | — | đầu hàm `slam` | vừa |
| Vệt cào của quái | `fx.js` `enemySwing` 615 | `hu-quai-cao` 40×32 × 4 | — | `fx.js` 617 | dễ |
| Buông cung tích lực, lúc ra chiêu, lúc ra chưởng | `fx_he.js` 171–181, 630–649; `fx_chuong.js` 197 | `hu-ban-cung` 32×32 × 4, `hu-ra-chieu` 48×48 × 5, `hu-ra-chuong` 48×48 × 5 | xoay, cộng sáng | tại các dòng đó | dễ |
| Nổ khói, Sốc nhiệt (kết hợp hệ) | `fx.js` `combo` 1013–1031 | `hu-no-khoi`, `hu-soc-nhiet` 96×80 × 8 | cộng sáng | `fx.js` 1014, 1024 (theo mẫu `noAnh`) | dễ |
| Cột lửa, cột nước (đòn quái nổ, vệt lửa nhát kết) | `fx.js` `pillar` 1769 | `hu-cot-lua`, `hu-cot-nuoc` 32×64 × 6 | — | `case 'pillar'` trong `drawFx` | dễ |
| Vòng phép trên sàn | `fx_ky_nang.js` `drawRune` 50–90 | `hu-vong-phep` 96×82 × 8 | cộng sáng | trong `runeOf` | vừa |
| Em bé trúng đòn | `fx.js` `hurt` 1359 | `hu-be-trung` 40×40 × 5 | cộng sáng | `fx.js` 1362 | dễ |
| Uống thuốc / hồi máu | `fx.js` `potion` 1347 | `hu-hoi-mau` 40×48 × 6 | cộng sáng | `fx.js` 1348 | dễ |
| Sao choáng | `fx.js` 952–955; `monster_art.js` 1393 | `hu-choang` 20×10 × 6 | lặp | `fx.js` 952 | dễ |
| Băng vỡ, vừa đóng băng | `fx.js` `shatter` 875, `freeze` 1042 | `hu-bang-vo` 56×56 × 6, `hu-dong-bang` 48×48 × 6 | cộng sáng | đầu hai hàm | dễ |
| Nổ nhỏ trên thân trùm lúc chết | `fx.js` `stepDying` 1471–1482 | `hu-no-nho` 40×40 × 5 | cộng sáng | `fx.js` 1476 | dễ |
| Trùm nổ cuối | `fx.js` `bossEnd` 1485–1497 | `hu-trum-no` 192×160 × 10 | cộng sáng | `fx.js` 1488 | vừa |
| Tiến hoá vũ khí (cột sáng từ trời) | `fx.js` `evolve` 1403–1417 | `hu-tien-hoa` 96×180 × 10 | cộng sáng | `fx.js` 1406 | vừa |
| Lấp lánh mở rương / bàn thờ | `fx.js` `sparkle` 1500 | `hu-lap-lanh` 40×40 × 6 | cộng sáng | đầu hàm | dễ |
| Cổng dịch chuyển (vành + lòng xoáy) | `portal.js` 17–61 | `hu-cong` 56×40 × 6 | lặp, cộng sáng | `portal.js` `portal` (giữ đốm sáng và lúc mọc bằng code) | vừa |
| Vũng lửa, vũng độc của em bé | `fx_he.js` `zoneSprite` 327–382 | `hu-vung-lua`, `hu-vung-doc` 72×64 × 4 | lặp | `fx_he.js` 362 (đã là dán ảnh) | vừa |
| Mây độc lơ lửng | `fx_he.js` `drawCloud` 427–457 | `hu-may-doc` 72×36 × 4 | lặp | `fx_he.js` 453 | vừa |
| Vũng của quái và trùm (lửa, độc, băng, đỏ) | `fx.js` `pool` 1107–1208 | `hu-vung-quai-<hệ>` 96×82 × 4 (4 dải) | lặp | đầu hàm `pool`; viền nóng giữ code | vừa |
| Khối băng bọc quái bị đóng băng | `fx.js` 898–910 | — | — | — | GIỮ CODE (cỡ theo thân từng quái, co ảnh sẽ méo) |

**GIỮ CODE** (xem mục 4): 12 kiểu hạt, vòng sóng theo bán kính đòn, vệt vũ khí thật bám mũi vũ khí, vệt hệ bám hình đòn, số sát thương và chữ nổi, thanh tích lực, viền nóng của vũng địch, Địa Chấn, bóng mờ lăn né, hào quang độc quanh thân, rung/khựng/chớp màn hình, viền đỏ khi máu thấp.

**Chỗ trống đáng biết:** chiêu của trùm có ghi sẵn kiểu hiệu ứng (`fxKind`: phun nước, rễ đâm, quả độc, nổ vòng, nện, bom) ở `boss.js` và `mobs.js` nhưng không nơi nào đọc. Người chơi hiện chỉ thấy vùng đỏ và chớp ở lớp luật chơi; phần hình là do `monster_art.js` vẽ quanh thân trùm (mục 3.1).

### 3.12 Đồ rơi, vùng báo trước

| Hình | Tệp · hàm | Trạng thái |
|---|---|---|
| Hình món đồ rơi (xu, bình máu, viên linh khí, nguyên liệu, vũ khí, trang phục) | `do_roi.js` 30–87 | ĐÃ CÓ (dùng ảnh `vp-*`, `vk-*`, `tp-*`) |
| Bóng, ánh màu bậc, cột sáng bậc, tia xoay đồ Vàng, lấp lánh, hoạt ảnh bay khi nhặt, nhãn tên | `do_roi.js` 130–263 | GIỮ CODE (chuyển động theo thời gian) |
| Vùng đỏ báo trước đòn (tròn, quạt, đường thẳng, vành, chữ nhật, tường nước), sọc chéo, mũi chữ V, chớp khi đòn ra, khe an toàn | `bao_truoc.js` 26–241 | GIỮ CODE, tuyệt đối không chuyển |
| Tường nước Sóng thần đang chạy | `mobs.js` `drawWall` 558–584 | GIỮ CODE (xoay góc bất kỳ, có khe theo luật) |

## 4. Những hình KHÔNG nên chuyển sang ảnh, và lý do

| Nhóm | Ví dụ | Lý do |
|---|---|---|
| Chữ và số | mọi chữ tiếng Việt, số sát thương, số giây hồi chiêu, giá mana, "x3" bình máu, số tầng độc | nội dung đổi liên tục; chữ phông nét hơn ảnh và dịch được |
| Thanh theo con số | máu, mana, kinh nghiệm, máu trùm, linh khí, dấu ấn, tích lực, thanh cuộn, chấm bậc | độ dài tính theo giá trị từng lúc. Chỉ phần KHUNG rỗng mới thành ảnh được |
| Vùng báo trước đòn | vùng đỏ của quái và trùm, vòng báo quái sắp hiện, khe an toàn | hình vẽ chính là vùng trúng đòn thật; góc, cỡ, tiến độ đổi từng đòn. Vẽ lệch là người chơi bị oan |
| Hạt bay ngẫu nhiên | bụi, tàn lửa, giọt độc, lấp lánh, lá rơi, đom đóm, bào tử | hàng trăm hạt 1–3 điểm, vị trí ngẫu nhiên; ảnh không đẹp hơn mà nặng hơn |
| Hình bám theo hình học của đòn | vệt vũ khí thật, vệt lửa/độc/băng dọc đường chém, vòng sóng theo bán kính, Địa Chấn, tường nước, hàng gai băng | dài ngắn, cong thẳng theo tầm đánh và hướng từng lúc |
| Ánh sáng và bóng | ánh sáng sàn phòng, bóng tường, cột nắng, vệt sáng cửa, quầng đèn làng, bóng dưới chân | tính theo vị trí nguồn sáng và độ cao nhân vật; vẫn chạy đè lên ảnh nền được |
| Hình suy ra từ ảnh khác | viền màu bậc, chớp trắng khi trúng đòn, nhuộm băng/độc, quầng sáng vũ khí thức tỉnh, bóng mờ lăn né | game tự tạo từ chính ảnh AI, không cần vẽ thêm |
| Hình theo độ kéo, độ nạp | dây cung và mũi tên trên dây, màn hồi chiêu quét, vòng tích lực | đổi theo tay người chơi |
| Khung chỉ là chữ nhật có viền | ô con, tấm nền HUD, màn tối, dải tài nguyên | cỡ tự do, quá đơn giản, ảnh không thêm gì |
| Khác | chữ G Google (nhãn hiệu), hộp Góp ý (HTML để gõ chữ), khối băng bọc quái (co theo từng thân sẽ méo) | |

## 5. Mã chết (code còn nhưng game không vẽ) — đừng tốn công làm ảnh

- `art.js`: khoảng 2.900 trên 3.337 dòng (em bé que, quái và trùm bản đầu, nền và đồ vật bản đầu, vệt chém, đạn). Còn sống: `A.ellipse` (bóng), `A.status` (dấu trạng thái), `A.weaponIcon` (chuyển tiếp), `A.zone` (dự phòng).
- `hero_art.js`: cả tệp (chỉ chạy khi bản em bé mới lỗi). Vũ khí "hình tạm" trong `hero_tinhlinh.js` 742–884. 5 dấu mặt nạ. Hào quang Gồng.
- `env_art.js` 101–1216: toàn bộ cảnh phòng kiểu cũ; prop `trap` và `door`. `portal.js` hàm `loot`.
- `fx.js`: api `nung`, `trapPlace`, `bottle`, `gong`, `slam` (bản api), sóng tràn `wave`, vùng `team:'fx'`, ảo ảnh tan, khung đỏ đạn quái bản gốc, vũng hồi máu.
- `combat.js`: `z.wave`, `W.parts`, `W.slashes`, `W.texts`, chấm trạng thái em bé, đạn `fruit` lối cũ, bẫy.
- `mobs.js`: `scan`, đường ngắm chấm đỏ; `drawLine/Cone/Donut` chỉ còn dự phòng.
- `monster_art.js`: vùng báo trước riêng (game tắt), đạn giả kiểu bắn/ném, `cotNuoc`, `song`, `nuocDai`, `HT_phanThan`.
- `btn_art.js`: nút Kỹ năng cũ và 4 biểu tượng `h_*` (nút Chưởng luôn thay chỗ), hình vũ khí/ngọc hệ bên trong ô vũ khí. `ui_theme.js`: `T.swordIcon`, `T.round` 5 loại không dùng, `BM.star`, `T.stars`.
- `village_scene.js`: dải tài nguyên và nút dự phòng, `G.VillageDemo`. `village.js`: bảng thợ may dự phòng.

Hệ quả: trong lô "Nút điều khiển · 18 biểu tượng" đang có, 4 biểu tượng Kỹ năng (Nung, Đặt bẫy, Bình thuốc, Gồng) vẽ ra cũng không hiện trong game. Chỉ 14 biểu tượng còn lại là cần.

## 6. Kế hoạch

### 6.1 Thứ tự ưu tiên (thấy nhiều nhất trước, có tính độ dễ)

1. Đồ vật trong phòng (rương, suối, bàn thờ, chậu than…): thấy mọi ải, dễ, mở đường cho trang công cụ phòng chơi.
2. Biểu tượng giữa nút điều khiển: thấy suốt mọi trận, lô prompt đã có, chỉ còn móc game.
3. Biểu tượng nhỏ (3 hệ, trên đầu quái, trạng thái, túi, ổ khoá, sao…): thấy khắp nơi, dễ.
4. Đạn quái, bom, tên hệ: thấy mọi trận, dễ.
5. Công trình làng: thấy mỗi lần về làng và màn chào.
6. Cửa phòng: thấy mọi phòng.
7. Chiêu và đòn cận chiến còn lại (Trảm Nguyệt, lướt chém, giáo quét…).
8. Đồ trang trí phòng, hình cố định lớn của giao diện (logo, thẻ ải, nút Nói chuyện).
9. Nổ, trạng thái, trùm chết, cổng dịch chuyển.
10. Thân nút, ô vũ khí, cần điều khiển.
11. Nền làng, tranh bản đồ vùng.
12. Sàn và tường phòng (thấy nhiều nhất nhưng khó nhất, cần bạn quyết ở mục 1).
13. Trùm đổi hình theo pha; đồ lưng và cánh còn thiếu.
14. Khung 9 mảnh (ô đồ, khung thanh máu, khung bảng, nút to).
15. Vũng trên sàn.

### 6.2 Luật chung cho mọi phiên

- Mỗi chỗ móc phải hỏi "có ảnh chưa" (`SC.gdSan(mã)` hoặc `G.fxAnh.co(mã)`); chưa có thì vẽ code y như cũ. Không có tệp nào thì game không đổi một điểm ảnh.
- Ảnh nạp chậm hơn code vài phần giây: chỗ nào vẽ sẵn vào bộ nhớ đệm (phòng, làng, nút, khung) phải xoá bộ nhớ đệm khi ảnh nạp xong.
- Chỉ sửa tệp ghi trong phiên của mình. Không sửa `sprite_custom.js` và `build.py` trừ làn E; nếu buộc phải thêm trường mới vào tệp ảnh thì nhớ thêm vào danh sách khoá trong `build.py`, không thì bị lọc mất khi gói.
- Trang công cụ mới: chép khung từ `tools/tach-giao-dien/index.html` (đã có lô nhiều mã, cắt 9 mảnh, xem thử), thêm mục vào thanh menu của cả 6 trang hiện có. Mục mới trong danh sách luôn thêm vào CUỐI.
- Prompt theo đúng kiểu các lô cũ: tiếng Việt, một đoạn liền; lưới đều, kẻ lưới mảnh, hình chiếm khoảng 70% ô; nền một màu hồng tím `#FF00FF` (xanh lá `#00FF00` khi hình có hồng/tím, xanh dương `#0000FF` cho hiệu ứng sáng); viền tối một nét; đổ bóng 3 sắc; ghi cỡ trong game và "nét lạ" của từng hình; không chữ, không số; hiệu ứng không dùng đỏ tươi (đỏ dành cho báo nguy hiểm). Độ nét gấp đôi, tải ra 2 bản.
- Mỗi phiên để lại: lô prompt trên trang công cụ, `docs/review/<tên>/PROMPT.md` (chép nguyên prompt), báo cáo ngắn tiếng Việt, ảnh kiểm bằng hình mẫu máy tự dựng.
- Kiểm trước khi đẩy: `node --check game/js/*.js`, `node game/tests/cloud_save_regression.test.js`, `python3 game/build.py`. Không chạy `tests/cay.py`.
- `game/dist/*.html` do `build.py` tạo ra nên hai phiên song song chắc chắn đụng nhau ở đó: khi `git pull --rebase` báo đụng trong `game/dist`, chạy lại `python3 game/build.py` rồi lấy kết quả mới, không gộp tay.
- Dung lượng: bản gói hiện 10,3 MB, trong đó ảnh 7,7 MB (quái 5,4 MB). Chưa tài liệu nào chốt mức trần; cần chủ dự án hoặc người điều phối chốt trước khi thêm ảnh lớn (nền làng, nền phòng, quái nét gấp đôi). Mỗi phiên ghi dung lượng thêm vào báo cáo.

### 6.3 Năm làn chạy song song

Trong một làn, các phiên làm lần lượt (cùng sửa một trang công cụ). Các làn khác nhau chạy cùng lúc được vì sửa tệp khác nhau. Chỗ giao nhau duy nhất: `mobs.js` (làn B sửa `drawBomb`, làn C sửa `icon`: khác hàm, git tự gộp).

| Làn | Trang công cụ | Tệp game được sửa | Các phiên |
|---|---|---|---|
| A · Phòng chơi | `tools/tach-phong` (MỚI) | `room_art.js`, `env_art.js` | A1 → A2 → A3 → A4 |
| B · Hiệu ứng | `tools/tach-hieu-ung` (có sẵn) | `fx.js`, `fx_he.js`, `fx_dan.js`, `fx_chuong.js`, `fx_ky_nang.js`, `portal.js`, `mobs.js` (`drawBomb`) | B1 → B2 → B3 → B4 |
| C · Giao diện | `tools/tach-giao-dien` (có sẵn) | `btn_art.js`, `ui_theme.js`, `linhkhi.js`, `hanh_trang.js`, `ban_do.js`, `bang_vang.js`, `chuong_ui.js`, `stage.js` (bảng), `art.js` (`A.status`), `mobs.js` (`icon`), `village.js` (logo) | C1 → C2 → C3 → C4 → C5 |
| D · Làng | `tools/tach-lang` (MỚI) | `village_scene.js` | D1 → D2 → D3 |
| E · Nhân vật và quái | `tools/tach-do`, `tools/tach-quai` (có sẵn) | `sprite_custom.js`, `boss.js`, `build.py` | E1 → E2 → E3 |

Làn C nên chờ phiên "giao-dien" đang chạy báo xong rồi mới bắt đầu, vì cùng sửa `tools/tach-giao-dien`.

### 6.4 Mô tả từng phiên (mỗi phiên khoảng 1,5 đến 2 giờ)

**Làn A · Phòng chơi**

| Phiên | Việc | Lô (lưới · cỡ đích · mã) | Kiểu tệp | Chỗ móc | Khó |
|---|---|---|---|---|---|
| A1 | Dựng trang `tools/tach-phong` + lô đồ vật trong phòng + móc game | "Đồ vật trong phòng": lưới 6×3 = 18 ô, mỗi ô tới 40×40. `gd-vat-ruong`, `-ruong-mo`, `-suoi-mau`, `-suoi-mau-het`, `-suoi-mana`, `-suoi-mana-het`, `-ruong-do`, `-ban-tho`, `-ban-tho-het`, `-thuong-nhan`, `-chau-than`, `-chau-than-tat`, `-nam-doc`, `-nam-doc-vo`, `-tinh-the`, `-tinh-the-vo`, `-be-thu-thach`, `-be-thu-thach-het` | `giao-dien` (ảnh tĩnh, neo giữa đáy) | đầu từng hàm `PROPS.*` (`env_art.js` 1230–1373), `PROPS.pedestal` (`room_art.js` 1539). Giữ bóng, quầng mời gọi, lấp lánh bằng code | dễ |
| A2 | Cửa phòng 3 vùng | 3 lô "Cửa · Rừng già / Hang biển / Lâu đài": mỗi lô lưới 3×2 = (trên, dưới, bên) × (mở, khoá), ô 48×48. `gd-cua-<rung|bien|lau>-<tren|duoi|ben>[-khoa]`. Thêm lô nhỏ 1×2: `gd-cua-o-khoa` 12×15, `gd-cua-dau-lau` 11×11 | `giao-dien` | `T.door` (`room_art.js` 268–760), `padlock`, `skull`. Cửa bên chỉ vẽ một bên, game lật. Cửa dưới có phần thuộc lớp phủ trước | vừa |
| A3 | Đồ trang trí phòng 3 vùng | 3 lô "Trang trí · <vùng>": lưới 4×4, ô 40×40. Mỗi vùng: 4 đồ góc, 1–2 vật điểm nhấn, 3–5 đồ tường sau, 2 cụm tiền cảnh, thảm tròn/vuông (Lâu đài). `gd-tt-<vùng>-<tên>`. Lửa đuốc: dải `hu-lua-duoc` 8×12 × 3 | `giao-dien` + 1 `hieu-ung` | `DECOR` (906), hàm trả về của `accentPlan` (1060), `torch`/`banner`/`crystal` trong `backDeco`, `fgBuild` (1150, giữ khung cắt để mờ dần) | vừa |
| A4 | Sàn và tường (cần chủ dự án đồng ý trước) | 3 lô "Nền phòng · <vùng>": lưới 3×3. 3 mảng sàn lặp 64×64, tường sau 64×49 (lặp ngang), tường bên 14×64 (lặp dọc), tường trước 64×12, nền ngoài 64×64. `gd-nen-<vùng>-san<0|1|2>`, `-tuong-sau`, `-tuong-ben`, `-tuong-truoc`, `-ngoai` | `giao-dien` (lát lặp) | `T.floors[k]`, `T.back`, `T.sides`, `T.front`, `T.paintVoid`; giữ `lightPass` chạy đè lên. Prompt phải dặn "mép trái khớp mép phải, mép trên khớp mép dưới"; công cụ cần nút xem thử lát lặp để lộ đường nối | khó |

**Làn B · Hiệu ứng** (thêm mục vào mảng `HU` của trang Tách Hiệu Ứng, mỗi mục một dải; bảng chi tiết ở mục 3.11)

| Phiên | Việc | Số dải | Chỗ móc | Khó |
|---|---|---|---|---|
| B1 | Đạn quái, bom, tên mang hệ | 8 đạn + 3 bom + 3 tên = 14 | `fx_dan.js` 214 và 240 (bảng kiểu đạn → mã), `mobs.js` 594 | dễ |
| B2 | Đòn cận chiến và chiêu: Trảm Nguyệt, lướt chém, giáo quét, nện đất, vệt cào quái, buông cung, ra chiêu, ra chưởng | 8 | `fx_he.js` 166, 175, 185, 542, 630; `fx.js` 600, 617; `fx_chuong.js` 200. Nện đất tích lực dùng lại `hu-chem-bua` | dễ đến vừa (kiểm tra xoay 8 hướng) |
| B3 | Nổ, trạng thái, trùm, cổng: nổ khói, sốc nhiệt, cột lửa, cột nước, vòng phép, em bé trúng đòn, hồi máu, sao choáng, băng vỡ, đóng băng, nổ nhỏ, trùm nổ cuối, tiến hoá, lấp lánh, cổng dịch chuyển | 15 | `fx.js` 875, 952, 1014, 1024, 1042, 1348, 1362, 1406, 1476, 1488, 1500, 1769; `fx_ky_nang.js` `runeOf`; `portal.js` | dễ đến vừa |
| B4 | Vũng trên sàn: vũng lửa, vũng độc, mây độc, 4 vũng của quái | 7 | `fx_he.js` 362, 453; `fx.js` `pool`; `fx_chuong.js` 96–143 dùng chung. Ảnh co theo bán kính luật; viền nóng và vòng nhịp giữ code | vừa |

**Làn C · Giao diện** (kiểu tệp `giao-dien`, mã `gd-*`)

| Phiên | Việc | Lô (lưới · cỡ đích · mã) | Chỗ móc | Khó |
|---|---|---|---|---|
| C1 | Đưa 14 biểu tượng nút vào game (lô đã có, không cần lô mới) | lô "Nút điều khiển" hiện có: `gd-nut-danh-<vũ khí>`, `gd-nut-dac-biet-<vũ khí>`, `gd-nut-chuong-<hệ>`, `gd-nut-ne`, `gd-nut-binh-mau`, `gd-nut-tam-dung` (24×24) | `btn_art.js` `iconBuf` (388): có ảnh thì dùng ảnh làm biểu tượng, giữ vòng nút, màu hệ, hồi chiêu, số. Nút Né: game xoay ảnh theo 16 hướng. Bật "xem thử" cho lô này trên trang công cụ. Thử kỹ trên điện thoại | vừa |
| C2 | Biểu tượng nhỏ | lô "Biểu tượng nhỏ": lưới 6×5, ô 16×16 (hình thật 7–13). `gd-he-fire/poison/ice`; `gd-tt-chay/doc/bang/troi`; `gd-quai-nhanh/giap/no/hut/gai`, `gd-quai-sap-danh`; `gd-tui`, `gd-khoa`, `gd-khoa-mo`, `gd-tich`; `gd-sao`, `gd-sao-rong`; `gd-huy-chuong-1/2/3`; `gd-khien`; `gd-cham-than`; `gd-bua-fire/poison/ice`; `gd-ngoc-fire/poison/ice` (cây chưởng) | `linhkhi.js` `iconCv` (65), `art.js` `A.status` (1655), `mobs.js` `icon` (655) và dòng 722, `hanh_trang.js` `bagIcon` (488), `ban_do.js` `lockIcon`/`tick` (122, 138), `stage.js` 1129 (sao) và 1008, 1075 (hình món), `bang_vang.js` `medal` (106), `hero_tinhlinh.js` `shield`, `village_scene.js` `bang` (198), `chuong_ui.js` `orb` (39) | dễ (nhiều chỗ móc nhỏ) |
| C3 | Hình cố định lớn | lô "Hình lớn": lưới 4×3. `gd-nut-noi-chuyen`, `-noi-chuyen-sang`, `-noi-chuyen-bam` 64×64; `gd-the-ai`, `-the-ai-chon`, `-the-ai-khoa` 38×30; `gd-the-trum`, `-the-trum-chon`, `-the-trum-khoa` 42×34; `gd-trong-dong` 42×42; `gd-logo` 200×40 (ảnh riêng một tấm, có chữ LINH KHÍ) | `T.round` (174), `T.stageCard` (381), `T.drum` (90), `village.js` `titleLogo` (805). Logo có chữ nên prompt phải ghi đúng chính tả và dấu | dễ |
| C4 | Thân nút, ô vũ khí, cần điều khiển | lô "Thân nút": lưới 4×3. Vòng nút to theo hệ `gd-vong-thuong/fire/poison/ice` 76×76; `gd-vong-ngoc`, `gd-vong-sat` 56×56; `gd-nut-vuong` 42×42; `gd-can-de` 66×66; `gd-can-num` 30×30. Lô "Ô vũ khí": 2×2, `gd-o-vk-<bậc 0..3>` 54×35 (ô đang cầm: game làm sáng) | `btn_art.js` `buildBase` (480), `buildSlot` (735), `buildStickBase` (800), `buildKnob` (820). Trạng thái bấm/khoá: game tự làm tối/sáng từ một ảnh. Phải khớp lưới nguyên của `blit` | vừa đến khó |
| C5 | Khung co giãn 9 mảnh | lô "Khung": `gd-o-do-<bậc 0..3>` và `-chon` 32×32 (8); `gd-khung-mau`, `gd-khung-mana`, `gd-khung-xp` (khung rỗng); `gd-khung-trum`, `-trum-nho`, `-tinh-anh`; `gd-the-thuong`. Đợt sau nếu ưng: `gd-khung-bang`, `gd-nut-to-<tông>`, `gd-khung-thoai`, `gd-dai-bao` | `T.slot` (355), `T.bar` phần viền (311), `T.bossBar` (268), `T.card` (481); về sau `T.panel` (199), `T.btn` (120), `T.dialog` (458). Dùng `SC.veGd` với `vien` | vừa; khung bảng và nút to: khó |

**Làn D · Làng** (kiểu tệp `giao-dien`, mã `gd-lang-*`)

| Phiên | Việc | Lô (lưới · cỡ đích · mã) | Chỗ móc | Khó |
|---|---|---|---|---|
| D1 | Dựng trang `tools/tach-lang` + công trình lớn + móc game | lô "Công trình": lưới 3×2, ô 160×100. `gd-lang-cong` 62×56, `-dinh` 145×70, `-cay-da` 105×86, `-lo-ren` 84×73, `-hang-xen` 73×56, `-nha-may` 76×58 | `sprite()` / `add()` trong `build()` (`village_scene.js` 350–397): có ảnh thì dùng ảnh theo chân vật. Giữ vùng va chạm `RECTS`, vị trí đèn `LREC`, quầng sáng. Ảnh vẽ màu ban ngày, game nhân màu chạng vạng như cũ. Xoá `BUILT` khi ảnh nạp xong | vừa |
| D2 | Đạo cụ nhỏ và con vật | lô "Đạo cụ": lưới 5×3, ô 48×40. `gd-lang-de`, `-gieng`, `-day-phoi`, `-bang-tranh`, `-cay-rom`, `-chum`, `-cot-den`, `-den-long`, `-do` (con đò), `-ga`, `-ga-mo`, `-coc`. Dải: `hu-lang-khung-cui` 28×22 × 3, `hu-lang-lua-lo` 12×10 × 3 | như D1; khung cửi 785, đò 786 (giữ nhấp nhô), gà 796, cóc 798, lửa lò 789 | dễ |
| D3 | Nền làng và tranh bản đồ vùng | `gd-lang-nen` 720×270 (một tấm; prompt gửi kèm ảnh chụp nền code để giữ đúng chỗ đường, sông, ao, sân đình); `gd-ban-do-vung` 480×270 (gửi kèm ảnh tranh code để giữ đúng vị trí 15 ải) | thay `Bt.ground` trong `build()` (365–378); `VS.mapArt` (944). Công cụ có lớp phủ vùng đi được để soi lệch. Hai ảnh lớn: ghi dung lượng vào báo cáo | vừa đến khó |

**Làn E · Nhân vật và quái**

| Phiên | Việc | Lô | Chỗ móc | Khó |
|---|---|---|---|---|
| E1 | 3 đồ lưng còn vẽ code + cánh theo 3 cấp | Tách Đồ: lô "Đồ lưng · vẽ lại" 3×1 (`tp-backs-ao_choang`, `-khan_bang`, `-trong_nho`); lô "Cánh theo cấp" 4×2 (`tp-wings-<chuon|la|lua|bang>-<1|3>`, cấp 2 dùng ảnh đang có) | `sprite_custom.js` `dinhNghia` phần cánh (892) và `noiTrangPhuc` (1181) tìm mã theo cấp. Nhân tiện tách lại 13 mũ ở độ nét gấp đôi nếu còn ảnh gốc | vừa |
| E2 | Trùm đổi hình theo pha + sửa chỗ mất khi quái dùng ảnh AI | Tách Quái: thêm 6 mục vào cuối (`mocTinh-p2`, `-p3`, `nguTinh-p2`, `-p3`, `hoTinh-p2`, `-p3`), lưới 8×6 như quái; prompt gửi kèm tấm pha 1 | `boss.js` `A.boss` (395–416) chọn mã theo pha, bỏ thu 72% khi có ảnh pha 3; `sprite_custom.js` `SC.veQuai` truyền `tint`; `build.py` cho phép mã mới. 6 tấm trùm rất nặng (mỗi tấm 0,5–0,8 MB) | vừa |
| E3 (tuỳ chọn, cần chốt dung lượng trước) | Tách lại 36 quái ở độ nét gấp đôi | không có lô mới; dùng lại ảnh ChatGPT gốc nếu còn giữ | chỉ thay tệp | dễ về code, nhưng ảnh quái có thể nặng gấp 3–4 lần (thêm khoảng 11–16 MB, ước lượng chưa đo) |

Tổng: 19 phiên. Chạy đủ 5 làn cùng lúc thì khoảng 5 lượt là xong phần code; phần vẽ ảnh tuỳ tốc độ bạn gửi ChatGPT.

### 6.5 Việc không đưa vào kế hoạch (ghi lại để cân nhắc sau)

- Vũ khí theo giai đoạn Mầm (120 ảnh) và khuôn mặt biểu cảm của vũ khí: nhiều ảnh, khác biệt nhỏ hoặc khó ghép.
- 18 biểu tượng chưởng, 15 biểu tượng kỹ năng, bóng mờ 5 ô trang phục trống: hiện không có hình code nào để thay, là hình mới và phải đổi bố cục bảng.
- Động tác riêng cho quái (xuất hiện, từng chiêu, choáng): cần thêm hàng vào tấm quái và sửa cách chọn khung.
- Dọn mã chết ở mục 5 (khoảng 5.000 dòng): không cần ảnh, nên làm một phiên riêng sau khi các làn xong, vì hình code của 36 quái vẫn đang được dùng để lấy cỡ bóng, chiều cao thanh máu và vị trí miệng, đuôi cho hiệu ứng.

## 7. Phụ lục: số liệu đếm

| Tệp | Số hình/nhóm tìm thấy | Ghi chú |
|---|---|---|
| `art.js` | 44 | 35 hình thật, phần lớn mã chết |
| `room_art.js`, `env_art.js`, `portal.js`, `minimap.js`, `ban_do.js`, `mapgen.js` | 53 | `mapgen.js` không vẽ gì; `ban_do.js` là "bán đồ" |
| `stage.js`, `do_roi.js`, `bao_truoc.js`, `boss.js`, `mobs.js`, `combat.js`, `engine.js`, `linhkhi.js`, `moves.js`, `data.js`, `main.js` | 64 | `boss.js`, `moves.js`, `data.js`, `main.js` không tự vẽ hình |
| `village_scene.js`, `village.js`, `tailor.js`, `bang_vang.js`, `cloud_ui.js`, `upgrade.js`, `cloud.js` | 62 | `upgrade.js`, `cloud.js` không vẽ gì |
| `ui_theme.js`, `btn_art.js`, `hanh_trang.js`, `chuong_ui.js`, `chuong.js` | 62 | `chuong.js` không vẽ gì |
| `fx.js`, `fx_he.js`, `fx_dan.js`, `fx_chuong.js`, `fx_ky_nang.js`, `fx_anh.js`, `vfx_cfg.js` | 184 | 18 đã có ảnh, 166 chưa (25 nên làm ngay, khoảng 35 tuỳ, còn lại giữ code hoặc mã chết) |
| `monster_art.js`, `sprite_custom.js` | 62 | 36 quái đủ ảnh |
| `hero_art.js`, `hero_tinhlinh.js`, `weapon_art.js`, `outfit.js` | 40 | `outfit.js` chỉ có số liệu |

Ảnh AI đang có trong `game/art/custom`: 273 tệp, 7,7 MB (quái 36, em bé 4, vũ khí 160, trang phục 41, vật phẩm 14, hiệu ứng 18). Chưa có tệp `nl-*`, `gd-*`, `ghep-*`, `em-be-<nv>-<bộ>` nào.
