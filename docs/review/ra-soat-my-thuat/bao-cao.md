# LINH KHÍ — Rà soát mỹ thuật và UX sau playtest

Ngày: 11/10/2026 · Bản chụp: `lk-2026.10.09` · Nguồn: 33 ảnh trong `docs/review/trai-nghiem/anh/` và báo cáo `docs/review/trai-nghiem/bao-cao.md`. Chỉ đánh giá, không sửa game.

**Tài liệu tham chiếu.** "ART ASSET PACK v1.0" **không có trong repo**, nên không dùng được làm chuẩn gốc. Thay vào đó đối chiếu với: (a) PNG gốc trong `game/art/custom/*.sprite.json` (lấy mẫu màu bằng script, xem mục 6), (b) `docs/vfx/BANG-MAU.md` (bảng màu sàn/UI/hệ đang dùng trong code), (c) `docs/LINH_KHI_AI_ART_HANDOFF/ART_STYLE_GUIDE.md` (lưu ý: tài liệu này ghi "game không dùng file ảnh", đã lỗi thời so với bản hiện tại). Chữ "chưa xác minh" = chỉ nhìn thấy trong ảnh, chưa tra được trong mã.

| Mục | Điểm /10 |
|---|---|
| 1. Dễ đọc trận đánh | **5** |
| 2. Thống nhất phong cách | **5** |
| 3. Giao diện và chữ | **6** |
| 4. Màn chào và làng | **7** |

---

## 1. Dễ đọc trận đánh — 5/10

Điểm tốt giữ lại: vùng báo trước (vòng đỏ gạch chéo ở `12-ai2-vung-do-va-meo-chuong.jpg`, quạt cam ở `10-trum-nam-chua.jpg`, vòng chấm quái sắp mọc ở `06-…` và `32-…`) đều rõ và nhất quán; viền 1 px `#14182e` chung cho mọi sprite AI giúp quái tách nền ở cả ba vùng.

**1.1. Khi mang hệ Độc, em bé chìm trong một màu xanh — lỗi nặng nhất.**
- Ảnh: `13-ai4-phong-dong-kho-doc.jpg`, giữa sân (quanh toạ độ 450–650 ngang, 180–380 dọc).
- Hiện tượng: vệt chém lục, mây độc lục, vũng lục, số sát thương lục (24 / 9 / 11), biểu tượng trạng thái lục, nút Đánh viền lục, sàn rừng lục xám. Em bé (áo đỏ, cao ~35 điểm ảnh ảnh chụp) chỉ còn một chấm đỏ nhỏ ở (640, 290), bị vòng lục đè lên. Thêm bằng chứng từ mã: ba sắc Độc khác nhau đang cùng xuất hiện — hiệu ứng nổ `hu-no-doc` vàng chanh `#c8f90b`/`#95e300`, vũng/vệt trong `fx.js` lục `#6fcf3a`, vũ khí `vk-sword-*-poison` ô-liu `#739235`/`#496f3d` (số đo mục 6).
- Tác động: không biết em bé ở đâu để né; không phân biệt được hiệu ứng mình với hiệu ứng quái.
- Sửa: (a) hiệu ứng **của người chơi** giữ lõi trắng `#fbfed0`, chỉ nhuốm hệ ở mép; (b) hiệu ứng **của quái** dùng nấc đậm `#277600` + viền đỏ dày như vùng báo trước; (c) thêm vành sáng 1 px `#efe2d1` quanh em bé khi có ≥ 2 hiệu ứng che thân (chi tiết ở mục 5, ưu tiên 1).

**1.2. Vũng độc của mình và của trùm gần như cùng một màu.**
- Ảnh: `15-trum-moc-tinh.jpg`, nửa phải sân (720–940 ngang, 300–380 dọc).
- Hiện tượng: hai vũng lục `#478b29` (ước lượng từ ảnh) cạnh nhau, một vũng viền tím nhạt (của mình, theo mã `B2` tím trong `sprite_custom.js`), một vũng viền đỏ (của trùm); độ dày viền ~2 điểm ảnh, lẫn nhau khi chồng lên rễ cây màu nâu xanh. Em bé đứng giữa hai vũng ở (820, 320).
- Tác động: người chơi mất máu "rỉ rả" vì độc (báo cáo chơi thử ghi 40–70 lần/ải) mà không biết vũng nào đứng được.
- Sửa: vũng của mình **không viền, độ trong ≤ 0,35**; vũng của quái giữ viền đỏ dày 2–3 px + hoạ tiết gạch chéo thưa (dùng lại bộ vẽ vùng báo trước, không cần hình mới).

**1.3. Em bé Thợ Rèn áo đỏ đứng trên vùng đỏ — trùng tông.**
- Ảnh: `12-ai2-vung-do-va-meo-chuong.jpg`, góc dưới giữa sân (680–760 ngang, 440–520 dọc).
- Hiện tượng: áo em bé `#c43b37`/`#f66c52` (lấy mẫu từ `em-be-smith.sprite.json`) nằm sát vòng đỏ `#94321d` (ước lượng từ ảnh). Mặt nạ trắng là thứ duy nhất tách ra. Cùng hiện tượng ở `29-bua-giu-nut-danh.jpg` (em bé nằm trong vùng cam quanh heo rừng, 580–700 ngang, 360–430 dọc).
- Tác động: khi vùng đỏ đầy dần (đỏ bão hoà), bóng em bé mất ~70 % diện tích.
- Sửa: không đổi áo (asset đã duyệt). Đổi **lòng vùng báo trước** sang đỏ-cam ngả hồng `rgb(255,40,28)` → `rgb(255,90,60)` ở pha đầy, và tăng độ trong viền trắng ấm khi em bé đứng trong vùng. Chưa xác minh: cần chụp lại với Thợ Săn (áo lục) để chắc vấn đề chỉ ở Thợ Rèn.

---

## 2. Thống nhất phong cách — 5/10

Điểm tốt: mọi sprite AI (4 em bé, 13 quái/trùm đã lấy mẫu) đều dùng chung viền `#14182e` và lượng màu bị giới hạn (em bé 48 màu, quái/trùm 32, vũ khí 16) — đây là nền tốt, không cần thay.

**2.1. Hai lưới điểm ảnh trên cùng một sân: em bé vẽ ở nét 2, quái ở nét 1.**
- Ảnh: `30-bon-loai-vu-khi.jpg` ô `h-smith-hammer-1` (giữa ô, 1180–1320 ngang, 540–620 dọc), `06-ai1-tinh-anh-chu-bi-cat.jpg` giữa sân (600–780 ngang, 200–300 dọc).
- Hiện tượng (xác minh trong tệp): `em-be-*.sprite.json` khai `net: 2`, thân 16×29 điểm ảnh game; `heoNanh` khai `net` = 1, thân 90×52; `hoaBaoTu` 53×42; `socNo` 49×43. Trong ảnh, heo rừng rộng gấp ~3 lần em bé và có chấm điểm ảnh to gấp đôi; em bé trông như hình "độ phân giải cao" đặt cạnh quái "độ phân giải thấp". Vũ khí (`net: 2`, 44×18) cũng theo lưới em bé nên kiếm/rìu to bằng cả em bé (xem 2.3).
- Tác động: mắt thấy ngay hai lớp hình không cùng game; em bé nhỏ, mảnh, thua quái về trọng lượng hình.
- Sửa: không vẽ lại asset. Hai cách rẻ: (a) khi vẽ em bé lên canvas thế giới dùng `G.NET` nhất quán với quái (chỉ ở phần dựng khung, hitbox giữ nguyên); hoặc (b) giữ nét 2 nhưng thêm viền ngoài 1 điểm ảnh game (= 2 điểm ảnh thật) để độ dày viền bằng quái. Chọn (b) nếu không muốn động vào bộ ghép trang phục.

**2.2. Ba bảng màu hệ khác nhau cho cùng một hệ (vũ khí – hiệu ứng – giao diện).**
- Ảnh: `30-bon-loai-vu-khi.jpg` ô `h-smith-sword-1` (nút Đánh, góc dưới phải ô) so với `12-ai2-vung-do-va-meo-chuong.jpg` (nút Đánh viền lục `#6fcf3a` + vũng lục) và `15-trum-moc-tinh.jpg` (ô vũ khí "Thành hình" chữ lục, vệt chém lục).
- Hiện tượng (lấy mẫu PNG): Lửa — vũ khí `#c9270c #df5a20 #f4a121`, hiệu ứng nổ `#fe7d04 #ffc90e #feec86`, mã UI `#ff7a2a #ffd23f`. Độc — vũ khí `#496f3d #739235 #bab538` (ô-liu xỉn), hiệu ứng `#5aca02 #c8f90b`, mã UI `#6fcf3a #c2f58a`. Băng — vũ khí `#217bc3 #32b0e9` (lam), hiệu ứng `#20edf8 #5ff7f9` (lục lam), mã UI `#7fd4ff`.
- Tác động: vũ khí Độc trông xỉn, không "thuộc" hệ với vệt chém của chính nó; Băng trên vũ khí là lam, trên nổ là lục lam — người chơi không nối được "đây là cùng một hệ".
- Sửa: không đổi PNG vũ khí (đã duyệt). Chuẩn hoá ở **lớp code** (fx.js, data.js, btn_art.js) về 4 nấc mỗi hệ ở mục 6, chọn nấc "chính" gần màu vũ khí nhất (Băng chính `#32b0e9` thay `#7fd4ff`; Độc đậm `#277600`). Thay đổi là hằng số màu, dễ hoàn tác.

**2.3. Vũ khí cầm tay to hơn thân em bé và che em bé.**
- Ảnh: `03-lang-moi-vao.jpg` bến đò (870–930 ngang, 270–390 dọc): thanh kiếm lam cao ~1,3 lần em bé; `09-suoi-hoi.jpg` (450–530 ngang, 270–330 dọc): kiếm che nửa mặt; `01-man-chao.jpg` góc dưới trái: kiếm lửa cao gấp 2 em bé.
- Hiện tượng: vũ khí 44×18 (net 2) ≈ 1,5 lần chiều cao thân 29. Ở `30-bon-loai-vu-khi.jpg` ô `h-hunter-spear-1` giáo dài gần bằng 2 em bé.
- Tác động: bóng dáng em bé (thứ người chơi phải theo dõi) bị vật phụ lấn; ở làng tất cả NPC cầm đồ nhỏ, riêng em bé cầm đồ khổng lồ nên lệch tông.
- Sửa: hệ số vẽ vũ khí khi **đứng yên / ở làng** ≤ 0,7 chiều cao em bé; khi đánh giữ cỡ hiện tại để không đổi cảm giác đòn và hitbox (chỉ đổi phần vẽ, không đổi `vk.mui/cam`). Riêng màn chào có thể giữ kiếm to vì là tranh bìa.

Ghi nhận thêm, không tính vào 3 nhận xét: nhân vật làng ở bảng thoại (`22-…`, `24-…`, `25-…`, `33-…`, góc dưới trái) vẽ ô điểm ảnh ~12 điểm màn hình, to gấp 3–4 lần hình trong sân — chấp nhận được vì là "chân dung" trong khung, nhưng nên thống nhất một cỡ cho cả 7 người (Bà Hàng Xén và Cụ Đồ hiện cùng cỡ, ổn). Sàn, tường, cây vẽ bằng code (`room_art.js`) bám đúng dải 5 nấc trong `BANG-MAU.md`; đo trên `05-…` sàn giữa phòng ≈ `#454837` khớp nấc `#4a4936`. Phần này đạt.

---

## 3. Giao diện và chữ — 6/10

Bảng kết quả, bảng thua, lò rèn, thợ may, cây chưởng đều rõ, đủ khoảng cách, khung trống đồng nhất quán. Lỗi tập trung ở lớp chữ **trong ải**.

**3.1. Chữ đè và chữ cắt — lỗi chắc chắn, thấy trong ảnh.**
- `06-ai1-tinh-anh-chu-bi-cat.jpg`, góc trên phải (740–920 ngang, 40–55 dọc): "↑ Chạm để đổi vũ khí" bị ô vũ khí che chữ "khí". Đây là ải dạy chơi.
- `11-ket-qua-ai1.jpg` và `18-ket-qua-ai5-chu-bi-cat.jpg`, mép trên (330–940 ngang, 20–45 dọc): dòng "Thắng rồi! Nhặt đồ rơi…" đè lên thanh máu và ô vũ khí; ở `18` câu "Món cũ … (đổi sang món mới thì linh khí không theo" bị cắt, thiếu dấu ngoặc đóng (cột trái, 300–620 ngang, 185–245 dọc).
- `10-trum-nam-chua.jpg`, giữa trên (580–690 ngang, 60–85 dọc): nhãn "Chống áp sát" và số đếm "10" đè lên thanh máu trùm và lên đầu Nấm Chúa.
- `13-ai4-phong-dong-kho-doc.jpg`, (540–600 ngang, 110–160 dọc): ba số sát thương 24 / 9 / 11 xếp chồng, chữ lục trên lá lục.
- Tác động: chữ trong ải nằm đúng chỗ mắt cần nhìn thanh máu/ô vũ khí; lỗi dễ thấy làm bản thử trông chưa xong.
- Sửa: dành **một hàng cố định dưới thanh trên cùng** (y ≈ 50–60 ảnh chụp) cho mọi thông báo trong ải; hướng dẫn đổi vũ khí đặt dưới ô vũ khí; số sát thương đè nhau thì cộng dồn hoặc lệch ngang ±6 px; bảng kết quả cho cột trái xuống dòng tự do.

**3.2. Đỏ vừa là "bấm đi" vừa là "nguy hiểm".**
- `11-ket-qua-ai1.jpg` góc dưới phải "Ải tiếp theo" đỏ; `18-…` "Sang vùng mới" đỏ; `21-tho-may-may-do.jpg` nút "May" đỏ; `25-cay-chuong.jpg` nút "Học" đỏ; `04-ban-do-chon-ai.jpg` "Lên đò" đỏ; đồng thời `33-cai-dat-dang-nhap-may.jpg` "Xoá tiến trình, chơi lại từ đầu" cũng đỏ cùng khung; trong ải `12-…` vùng nguy hiểm và ổ khoá cửa cũng đỏ.
- Tác động: mất mã màu cảnh báo; người chơi phải đọc chữ thay vì nhìn màu.
- Sửa: nút chính → đồng vàng `#d9a441`/`#f6dc92` (đã có trong `ui_theme.js`), đỏ `#8a2f22` chỉ cho xoá/bỏ ải. Chỉ đổi hằng số theme, không đổi bố cục.

**3.3. Nhãn và nút nhỏ trên điện thoại — cần kiểm thử thêm, chưa phải lỗi chắc chắn.**
- `05-ai1-huong-dan-phong-dau.jpg` cột trái (125–370 ngang, 205–270 dọc): ba dòng hướng dẫn cỡ ~9 pt, nằm ngoài sân; `03-lang-moi-vao.jpg` dải 7 khuôn mặt lối tắt (400–860 ngang, 40–100 dọc) cùng một mặt nạ, chỉ khác màu khăn — khó phân biệt ở 30 điểm; `06-…` nút Tạm dừng (260–300 ngang, 65–100 dọc) sát nút Bình máu.
- Hai nút kỹ năng khi xám (`06-…`, `13-…` góc dưới phải 1000–1180 ngang, 300–460 dọc) chỉ còn hai đĩa tối, biểu tượng mất; phải nhìn chữ "Chưởng/Tràm Nguyệt".
- Sửa đề xuất (sau khi thử trên máy thật): hướng dẫn phòng đầu hiện ở hàng thông báo trên sân 3 giây rồi mới rút về cột trái; nút xám giữ biểu tượng ở độ trong 0,4 thay vì xoá; dải khuôn mặt thêm vật đặc trưng (búa, kim, cuốn sách) đã có sẵn trong sprite NPC.

---

## 4. Màn chào và làng — 7/10

**4.1. Năm giây đầu: đạt, nhận diện Việt rõ.**
- `01-man-chao.jpg`: trống đồng trên logo (giữa trên), chữ "LINH KHÍ" vàng `#f6e7af` (ước lượng) viền tối, đèn lồng đỏ trên cây đa, mái ngói, bến nước và thuyền nan bên phải, chòi tranh cuối sân. Bố cục đọc được trong 1 giây.
- Chỗ lệch: em bé góc dưới trái (220–360 ngang, 300–560 dọc) cầm kiếm lửa cao gấp đôi thân và là vật sáng nhất màn, hút mắt khỏi logo; dòng "Mở từ tệp trên máy: chỉ lưu trên máy" là chữ kỹ thuật không nên hiện với người chơi.
- Sửa: hạ độ sáng ngọn lửa kiếm xuống nấc "chính" `#fe7d04`, bỏ nấc lõi trắng ở màn chào; ẩn dòng kỹ thuật khi không ở chế độ phát triển.

**4.2. Làng: có hồn nhưng ánh sáng dàn đều, thiếu điểm nhấn.**
- `03-lang-moi-vao.jpg`: đèn lồng (6 chiếc) + lò rèn + đom đóm phát quầng sáng gần như cùng cường độ, rải đều từ trái sang phải; nền cỏ `#3a3d2a`-ish (ước lượng) tối, nhà `#907144` mái / `#664a30` vách. Không có "trục nhìn" dẫn tới bến đò — nơi người mới phải tới (dòng chữ đáy phải chỉ bằng lời).
- `19-lang-sau-ai5-cham-than-khap-noi.jpg`: 6 chấm than vàng + 6 chấm đỏ trên dải mặt → chấm than mất nghĩa (đã nêu trong báo cáo chơi thử, xác nhận trong ảnh).
- Sửa bằng chi tiết chọn lọc, không thêm vật: tăng quầng đèn ở **bến đò** (đèn trên cọc, 1000–1040 ngang) lên 1 nấc và giảm 1 nấc ở các đèn còn lại; chấm than chỉ cho tối đa 2 người, ưu tiên theo "+sức mạnh" lớn nhất.

**4.3. Dân làng và lưới điểm ảnh.**
- `03-…`: 7 NPC vẽ cùng một lưới với sân (tốt), bóng dáng khác nhau nhờ mũ/đồ cầm. Nhưng ở bảng thoại (`22`, `24`, `25`, `33`) chân dung phóng 3–4 lần, mỗi ô điểm ảnh ~12 điểm màn hình, trong khi khung bảng và chữ Be Vietnam Pro mịn — ba mật độ trên một màn.
- Sửa: giữ chân dung to (đúng chất "tranh dân gian") nhưng thêm viền tối 1 điểm ảnh game quanh chân dung và khung gỗ cùng lưới, để mắt hiểu đây là "tranh treo" chứ không phải lỗi phóng.

---

## 5. Ba điều quan trọng nhất cần sửa (xếp theo tác động)

### Ưu tiên 1 — Tách hiệu ứng của mình / của quái và giữ em bé nổi khi mang hệ
- **Vấn đề, bằng chứng:** `13-ai4-phong-dong-kho-doc.jpg` (em bé chìm trong lục), `15-trum-moc-tinh.jpg` (hai vũng cùng màu), `12-ai2-vung-do-va-meo-chuong.jpg` (áo đỏ trên vùng đỏ). Nguồn mất máu lớn nhất trong playtest là độc và gai — đều là thứ khó nhìn.
- **Giải pháp:** (1) Hiệu ứng người chơi: lõi trắng/kem (`#fbfed0`, `#feec86`, `#eefffc`), hệ chỉ ở mép; vũng của mình không viền, độ trong ≤ 0,35. (2) Hiệu ứng quái: nấc đậm của hệ + viền đỏ 2–3 px + gạch chéo (dùng lại `bao_truoc.js`). (3) Vành sáng 1 px `#efe2d1` quanh em bé, bật khi có hiệu ứng che hoặc luôn bật trong phòng có hệ. (4) Số sát thương của mình giữ màu trắng/vàng, chỉ số của quái mới đổi màu hệ.
- **Tác động:** cao. **Công sức:** thấp (hằng số màu trong `fx.js`, `fx_he.js`, thêm 1 vòng vẽ viền; không đụng sprite).
- **Phạm vi, rủi ro:** chỉ lớp vẽ; không đổi hitbox, thời gian, thông số. Rủi ro tương thích: máy yếu thêm một lượt vẽ viền em bé (nhỏ, có thể tắt theo "Độ nét: Thường").
- **Nghiệm thu bằng ảnh:** chụp lại Rừng già 4 với kiếm Độc, ≥ 3 quái và 1 vũng: em bé nhận ra trong 0,5 s khi thu ảnh về 50 %; vũng của quái có viền đỏ, vũng của mình không viền; chuyển ảnh sang xám vẫn tách được em bé khỏi nền.

### Ưu tiên 2 — Dọn lớp chữ trong ải và trả màu đỏ về cho cảnh báo
- **Vấn đề, bằng chứng:** `06-…` chữ bị cắt ngay ải dạy; `11-…`/`18-…` "Thắng rồi!" đè thanh máu, câu bị cụt; `10-…` nhãn trùm đè thanh máu trùm; `17-bang-thua-ghi-sai-vung-do-cua-trum.jpg` ghi "Vùng đỏ của trùm" ở phòng không có trùm; nút chính đỏ ở `04`, `11`, `18`, `21`, `25` trùng với "Xoá tiến trình" ở `33`.
- **Giải pháp:** một hàng thông báo cố định dưới thanh trên; hướng dẫn đổi vũ khí đặt dưới ô vũ khí; nhãn "trùm đã học" đặt dưới thanh trùm, không chồng số đếm; bảng kết quả bỏ cắt dòng ở cột trái; nhãn nguyên nhân mất máu theo phòng ("Vùng nổ / bom" khi không có trùm); nút chính đổi sang đồng vàng, chỉ xoá/bỏ ải giữ đỏ.
- **Tác động:** cao (ấn tượng "chưa xong" và mã màu cảnh báo). **Công sức:** thấp.
- **Phạm vi, rủi ro:** `ui_theme.js`, lớp HUD, chuỗi văn bản; không đụng gameplay. Rủi ro: chữ tiếng Anh (`ngon_ngu_en.js`) dài hơn — kiểm tra lại cùng ảnh.
- **Nghiệm thu bằng ảnh:** chụp 5 ảnh (phòng tinh anh ải 1, thắng trùm ải 1, trùm nhỏ ra mắt, bảng thua ở phòng Bắt đầu, bảng cài đặt): không có chữ bị cắt/đè; trong mỗi ảnh chỉ còn đúng một thành phần màu đỏ mang nghĩa nguy hiểm/huỷ.

### Ưu tiên 3 — Cân lại cỡ vẽ vũ khí cầm tay và độ dày viền em bé
- **Vấn đề, bằng chứng:** `03-…`, `09-…`, `30-…` (ô `h-hunter-spear-1`, `h-smith-hammer-1`): vũ khí cao 1,3–2 lần em bé, che mặt; `06-…`: em bé nét 2 đặt cạnh heo rừng nét 1 trông như hai game. Số liệu trong tệp: em bé 16×29 (`net: 2`), vũ khí 44×18 (`net: 2`), heoNanh 90×52 (`net` 1).
- **Giải pháp:** hệ số vẽ vũ khí khi đứng yên/di chuyển/ở làng ≤ 0,7 chiều cao em bé (giữ nguyên khi vung); viền ngoài em bé dày 1 điểm ảnh **game** (2 điểm ảnh thật) để bằng viền quái. Không vẽ lại PNG.
- **Tác động:** vừa (bóng dáng em bé, tính thống nhất). **Công sức:** thấp–vừa (một hệ số trong `weapon_art.js`/`sprite_custom.js` + một lượt viền khi dựng khung ghép).
- **Phạm vi, rủi ro:** chỉ phần vẽ; `vk.mui/cam`, hitbox, thời gian đánh giữ nguyên. Rủi ro: bộ ghép trang phục (12 thân, lớp mũ/lưng/cánh) phải vẽ viền sau khi ghép xong, nếu không viền hở ở mép mũ — kiểm tra trên `20-tho-may-mac-do.jpg`.
- **Nghiệm thu bằng ảnh:** chụp em bé đứng yên ở làng và trong sân cạnh heo rừng: vũ khí không cao quá vai em bé; thu ảnh về 50 %, độ dày viền em bé và heo rừng bằng nhau; màn thợ may xoay 3 tư thế không hở viền.

---

## 6. Bảng màu lõi

Cách lấy mẫu: script Pillow đọc PNG base64 trong `game/art/custom/<ma>.sprite.json` (trường `tam`/`anh`), bỏ điểm có alpha < 200, đếm màu đục nhiều nhất. Đã lấy: `em-be-smith/hunter/healer/wrestler`, `nguTinh`, `mocTinh`, `hoTinh`, `boHung`, `heoNanh`, `socNo`, `chonBong`, `hoaBaoTu`, `namChua`, `denLong`, `vk-sword-0/2-fire/-poison/-ice`, `hu-no-lua/doc/bang`, `hu-chuong-*`. Tệp máy đọc được: `bang-mau.json` cùng thư mục.

Ký hiệu nguồn: **[A]** lấy mẫu trực tiếp từ PNG asset (ghi tên asset) · **[M]** hằng số trong mã vẽ sàn/UI (`room_art.js`, `ui_theme.js`, `data.js`) — không phải PNG nhưng là màu đang chạy · **[S]** ước lượng từ ảnh chụp · **[N]** màu mới đề xuất để chuẩn hoá. Không có màu nào được khẳng định là gốc nếu chưa lấy mẫu.

### 32 màu nền tảng

| # | Nhóm | HEX | Tên | Vai trò | Nguồn |
|---|---|---|---|---|---|
| 1 | Da | `#f9b788` | Da sáng | mép sáng tay/chân em bé | [A] em-be-smith |
| 2 | Da | `#eeac6d` | Da vừa | da em bé, dân làng | [A] em-be-hunter |
| 3 | Da | `#a86a49` | Da tối | bóng da, cổ | [A] em-be-smith |
| 4 | Da | `#efe2d1` | Mặt nạ | mặt nạ em bé — điểm sáng nhất, vành sáng viền em bé | [A] em-be-smith |
| 5 | Tóc | `#220f18` | Tóc / khăn tối | khăn trùm, tóc, lòng mũ | [A] em-be-smith |
| 6 | Tóc | `#3b3234` | Tóc vừa | mảng tóc, lông thú tối | [A] em-be-smith (màu nhiều nhất) |
| 7 | Gỗ | `#32180d` | Gỗ tối | thân Mộc Tinh, gốc cây, khe gỗ | [A] mocTinh |
| 8 | Gỗ | `#58371e` | Gỗ vừa | thân cây, rương, cột nhà | [A] mocTinh |
| 9 | Gỗ | `#79451d` | Gỗ sáng | mặt gỗ được chiếu | [A] mocTinh |
| 10 | Gỗ | `#c98c34` | Gỗ nắng / rơm | mái tranh, mép gỗ sáng | [A] mocTinh |
| 11 | Đá | `#29313b` | Đá tối | khe đá Hang biển | [M] room_art.js `C.ground` |
| 12 | Đá | `#333c47` | Đá vừa | sàn đá | [M] room_art.js |
| 13 | Đá | `#4a5560` | Đá sáng | gờ đá, lối mòn | [M] room_art.js |
| 14 | Kim loại | `#5c5b73` | Thép tối | lưỡi kiếm phần tối | [A] vk-sword-0 |
| 15 | Kim loại | `#cecdda` | Thép sáng | lưỡi kiếm, rìu | [A] vk-sword-0 |
| 16 | Kim loại | `#f4bf4d` | Vàng kim | đèn lồng, trang sức, viền đồng | [A] denLong |
| 17 | Vải | `#c43b37` | Đỏ Thợ Rèn | áo Thợ Rèn (giữ nguyên) | [A] em-be-smith |
| 18 | Vải | `#f66c52` | Đỏ sáng | nếp áo được chiếu | [A] em-be-smith |
| 19 | Vải | `#506f2a` | Lục Thợ Săn | áo Thợ Săn | [A] em-be-hunter |
| 20 | Vải | `#95a53a` | Lục sáng | nếp áo Thợ Săn | [A] em-be-hunter |
| 21 | Vải | `#7763ac` | Tím Đô Vật | áo Đô Vật, bùa | [A] em-be-wrestler |
| 22 | Cỏ cây | `#3d402e` | Đất sàn rừng | nấc giữa dải sàn Rừng già | [M] room_art.js `F.floor` |
| 23 | Cỏ cây | `#2f5f34` | Lá vừa | tán cây, rào lá | [M] room_art.js `F.leafL` |
| 24 | Cỏ cây | `#557521` | Lá sáng | tán Mộc Tinh, bụi cỏ | [A] mocTinh |
| 25 | Cỏ cây | `#d0cf64` | Lá điểm sáng | ngọn lá nắng, đom đóm | [A] mocTinh |
| 26 | Nước | `#2a40a5` | Nước sâu | thân Ngư Tinh, vũng sâu | [A] nguTinh |
| 27 | Nước | `#3d69cd` | Nước vừa | sông, bến đò | [A] nguTinh |
| 28 | Nước | `#cedaea` | Ánh nước | gợn sóng, bọt | [A] nguTinh |
| 29 | Lửa | `#a03409` | Than hồng | lõi than, bóng lửa | [A] hoTinh |
| 30 | Lửa | `#eb7e14` | Lửa môi trường | chậu than, đuốc, lò rèn | [A] hoTinh |
| 31 | Bóng | `#14182e` | Mực viền | viền ngoài mọi sprite (đã dùng ở 100 % asset lấy mẫu) | [A] tất cả |
| 32 | Bóng | `#120d11` | Khoảng tối ngoài phòng | dải hai bên sân, nóc tường | [S] 05-ai1-huong-dan-phong-dau.jpg (60,300) |

### 12 màu hệ

| Hệ | Nấc | HEX | Vai trò | Nguồn |
|---|---|---|---|---|
| Lửa | nhạt | `#ffc90e` | mép vệt chém, chữ hệ, thanh Lửa | [A] hu-no-lua |
| Lửa | chính | `#fe7d04` | thân hiệu ứng, nút Đánh khi mang Lửa (mã đang dùng `#ff7a2a`, lệch không đáng kể) | [A] hu-no-lua |
| Lửa | đậm | `#c9270c` | hiệu ứng của **quái**, bóng lửa, vệt cháy trên sàn | [A] vk-sword-0-fire |
| Lửa | lõi sáng | `#feec86` | lõi hiệu ứng **người chơi**, số chí mạng | [A] hu-no-lua |
| Độc | nhạt | `#c8f90b` | mép mây độc, chữ hệ | [A] hu-no-doc |
| Độc | chính | `#5aca02` | thân hiệu ứng, nút Đánh khi mang Độc (mã đang dùng `#6fcf3a`) | [A] hu-no-doc |
| Độc | đậm | `#277600` | vũng/mây độc của **quái** + viền đỏ; thay cho ô-liu `#496f3d` của vũ khí ở lớp hiệu ứng | [A] hu-no-doc |
| Độc | lõi sáng | `#fbfed0` | lõi hiệu ứng **người chơi** (giữ em bé nổi) | [A] hu-no-doc |
| Băng | nhạt | `#9cfefa` | mép vệt băng, chữ hệ | [A] hu-no-bang |
| Băng | chính | `#32b0e9` | thân hiệu ứng, nút Đánh khi mang Băng — **đề xuất thay** `#7fd4ff` trong mã để khớp vũ khí | [A] vk-sword-0-ice |
| Băng | đậm | `#217bc3` | hiệu ứng của **quái**, gai băng | [A] vk-sword-0-ice |
| Băng | lõi sáng | `#eefffc` | lõi hiệu ứng **người chơi** | [A] hu-no-bang |

Ghi chú: cả 12 màu hệ đều lấy được từ PNG, nên **không có màu [N]** trong bảng hệ; đề xuất duy nhất là đổi hằng số trong `data.js`/`fx.js`/`btn_art.js` về các mã trên (3 hệ × 4 nấc), không chạm PNG. Bảng nền tảng có 4 màu [M] (đá, sàn, lá) và 1 màu [S]; nếu cần PNG gốc cho đá, lấy mẫu `cuaDa`/`cuaTuong` ở đợt sau. Không thay toàn bộ palette; chỉ thống nhất ở lớp hiệu ứng/UI nơi hiện có 3 bảng cho cùng một hệ.
