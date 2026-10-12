# Phiên Độ đọc trận + Giao diện (12/10/2026)

Làm theo báo cáo tester 2 (`docs/review/kiem-thu-12-10/tester-2-hinh-anh-giao-dien.md`). Không đổi luật chơi, số liệu, lưu mây, đăng nhập Google, `?cloud=0`. Không đụng bảng Cài đặt (phiên Cốt truyện làm) và cách đồ mặc bám thân (phiên Trang phục làm).

## Ba cờ tắt

Mở game với đuôi địa chỉ dưới đây là về cách cũ (không cần sửa code). Có thể ghép nhiều cờ: `?cloud=0&doctran2=0&cham44=0&churo=0`.

| Cờ | Tắt bằng | Gồm những gì |
|---|---|---|
| `G.DOC_TRAN2` | `?doctran2=0` | Mục 1: hiệu ứng của em bé nhạt đi, viền sáng quanh em bé, mỗi quái tối đa 3 số, số độc/cháy nhỏ và mờ, mây độc thu hình |
| `G.CHAM44` | `?cham44=0` | Mục 2: vùng chạm tối thiểu 44 pt cho mọi nút |
| `G.CHU_RO` | `?churo=0` | Mục 2 (nút Dừng, nút Bản đồ phòng trùm) và mục 3–6: chữ, thuật ngữ, làng, màn thắng |

Số chỉnh được nằm ở `G.theme.DOC` (`game/js/ui_theme.js`): `fxBe` (độ đậm hiệu ứng của bé, đang 0,62), `vienBe`/`vienA` (viền sáng #fff4c0, đậm 0,8), `vienToi`/`vienToiA` (viền tối mảnh bên ngoài), `bongBe` (bóng mờ thân bé vẽ đè, 0,32), `soMoiChu` (3), `soDotCo`/`soDotA` (cỡ 6, đậm 0,7), `mayDocR` (24), `lopPhu` (false).

## Từng mục

### 1. Em bé mất trong trận đông (Nghiêm trọng): ĐÃ LÀM
- Mỗi hạt và hình hiệu ứng giờ biết nó là của em bé hay của quái (`game/js/fx.js`: hàm `api` gắn chủ theo tên đòn; đạn, vùng, trạng thái trên thân gắn theo phe; `fx_dan.js` đặt lại về phe quái).
- Hiệu ứng của **em bé** (lửa nổ, mây độc, tia sáng, hạt, vũng/vùng của bé trên sàn) vẽ với độ đậm 62% và vẽ **trước** hiệu ứng của quái trong cùng lớp. Hiệu ứng của **quái** và vùng báo đòn đỏ giữ nguyên độ đậm (vùng báo đòn vẫn vẽ sau cùng).
- Em bé luôn đọc được: sau mọi hiệu ứng vẽ thêm **viền sáng ấm #fff4c0 dày 1 điểm ảnh** + một viền tối rất mảnh bên ngoài (để viền sáng vẫn nổi trên nền lửa sáng) + bóng mờ thân bé (32%). Đã thử chỉ viền sáng: trên nền lửa cam thì viền sáng chìm, nên chọn viền đôi.
- Số sát thương: vẫn gộp trong 0,25 giây (đã có từ Đợt 8); thêm luật **mỗi mục tiêu tối đa 3 số** (đủ thì bỏ số cũ nhất, số độc/cháy bỏ trước); số độc/cháy cỡ 6 và đậm 70%.
- Mây độc của bé: chỉ thu **hình** (bán kính 24, cả bề cao), vũng và vùng gây sát thương giữ nguyên `z.r`.
- Hiệu năng: lúc đầu thử vẽ hiệu ứng của bé qua một lớp phụ rồi dán nhạt một lần (đều màu hơn) nhưng chậm hơn khoảng 15–20% trên máy giả lập yếu (CPU chậm 4 lần). Nay mặc định làm nhạt từng hình (chậm thêm khoảng 0–5%, nằm trong sai số đo); lớp phụ vẫn còn, bật bằng `G.theme.DOC.lopPhu = true`.
- Ảnh: `anh/01…03-*-truoc-sau.png` (trên: trước, dưới: sau), `anh/04-em-be-phong-to-truoc-trai-sau-phai.png` (phóng to quanh em bé: cột trái là trước, cột phải là sau; hàng 1 Rừng/độc, 2 Biển/băng, 3 Lâu đài/lửa, 4 Lâu đài khi bấm chiêu liên tục, 5 phòng trùm). Lưu ý: hai lần chụp là hai trận khác nhau (quái ra ngẫu nhiên), nên chỉ so được độ dễ thấy em bé, không so được từng khung hình.

### 2. Nút nhỏ hơn 44 pt: ĐÃ LÀM
- `G.CHAM44` (`ui_theme.js`, hàm `clicked`): mọi nút vẽ qua bộ giao diện (`T.btn`, `T.sbtn`, thẻ mục, `ui.btn`) có vùng chạm nhỏ hơn 31 đơn vị (≈ 44 pt trên iPhone cầm ngang) được nới **vô hình** cho đủ 31×31; hình nút giữ nguyên. Vì vậy "✕ Xong", thẻ mục (Mài, Nâng bậc…, Cây kỹ năng…), "Bán hết Thường/Lam", "Chọn nhiều" đều đủ 44 pt.
- **Không chồng nhau:** chạm trúng hình thật của nút nào thì chỉ nút đó nhận (trước đây lề pad của "✕ Xong" lấn sang thẻ "Nâng lò": chạm vào mép trên thẻ lại thành bấm Xong; nay đã đúng). Chạm vào phần nới thì nút có hình gần ngón tay nhất nhận. Đã thử bằng chạm thật: chạm 2 đơn vị dưới thẻ Mài thì vào Mài; chạm mép trên thẻ Nâng lò thì vào Nâng lò, không thành Xong.
- Nút Bản đồ ở phòng trùm: hình to hơn (58×19), vùng chạm cao 31.
- Nút Dừng: vùng chạm vốn đã 38×33; dời phải 8 đơn vị để vùng chạm không chồng ô Bình máu và không che chữ.

### 3. Chữ tràn / nhỏ: ĐÃ LÀM PHẦN LỚN
- "132/300": số linh khí tự thu cỡ (7 → tối thiểu 6) cho vừa ô và canh giữa ô (`linhkhi.js`).
- "Bình máu" không còn bị nút Dừng che (nút dời phải).
- Tên chiêu ở Cây chưởng ("Xuyên băng", "Đóng băng"): thu cỡ, ép chữ hẹp lại tối đa 18%, chỉ cắt "…" khi vẫn không vừa (`chuong_ui.js`). Ảnh `anh/12-cu-do-ten-chieu.png`.
- Số mana "♦30" trên nút Chiêu/Chưởng: thẻ giá (chữ sáng trên nền xanh đậm) vẽ lại trên cùng, nên lúc nút loé màu kem vẫn đọc được (`btn_art.js`).
- "Ngôn ngữ / Tiếng Việt" chật: **KHÔNG LÀM**, vì nút nằm trong bảng Cài đặt của Anh Mõ (phiên Cốt truyện đang sửa bảng này).
- Chữ phụ ≥ 11 pt: sàn chữ của game đã là 7,5 đơn vị (≈ 10,8 pt). Đã nâng những chữ mới sửa (dòng "trận này chưa nhận linh khí" 6,5 → 7,5; tên nút Bản đồ phòng trùm 7 → 8). Chưa rà toàn bộ chữ "tiny" 6,5 còn lại (cần làm từng chỗ vì nhiều ô rất chật).

### 4. Thuật ngữ: ĐÃ LÀM
- "Sân đình: chọn hero" → "Sân đình: chọn em bé".
- Ô vũ khí "Thường / Trắng": dòng dưới khi chưa có hệ ghi **"Chưa hệ"** thay cho "Trắng" (dòng trên vẫn là bậc: Thường, Lam, Tím, Vàng; khi đã có hệ thì dòng dưới là Mầm, Thành hình, Thức tỉnh màu hệ như cũ). Ô quá hẹp để ghi thêm chữ "bậc".
- Màn thắng/thua: "không nhận dấu ấn" → **"trận này chưa nhận linh khí"**, và "Chưa có dấu ấn…" → "Chưa có linh khí…" (khối Linh khí của vũ khí).
- Màn thua: "Bạn đã gục ở phòng …" → **"Cháu ngã ở phòng … rồi"**.
- Dấu phẩy thập phân: "Sát thương mỗi đòn 12.4" → "12,4" ở Xem vũ khí (dòng "hệ số bậc x1,15" vốn đã dùng phẩy).
- Thanh máu không hiện số âm (`Math.max(0, …)`) và thanh không vẽ phần âm. Ảnh `anh/06-mau-khong-am.png` (trên: "-8 / 152", dưới: "0 / 152").
- Thẻ "Rèn đồ" ở lò rèn (chỉ còn lời giải thích cho bản cũ): **ẩn**, bốn thẻ còn lại giãn đều. Ảnh `anh/11-lo-ren-an-ren-do.png`.

### 5. Làng: ĐÃ LÀM
- Dấu đỏ / "!": Anh Mõ (Cài đặt) không còn chấm "có cái mới"; Bà Hàng Xén chỉ báo khi trong rương có vũ khí mới nhặt mà mang vào thì Sức mạnh tăng. Cụ Đồ, Thợ Rèn, Thợ May, Lái Đò, Ông Từ vốn đã báo theo việc làm được (có điểm, đủ nguyên liệu, có ải mới, có bé mới). Ảnh `anh/09-lang-dau-bao.png`.
- Dòng mẹo "Kéo bên trái để đi…" tắt hẳn khi đã qua ải Rừng già 1-5.
- Không đi xuyên người làng: người làng chiếm chỗ bán kính 9 (trước 7), các bé ngồi ở sân 8 (trước 6), thêm án thư của Cụ Đồ. Chỗ đứng nói chuyện vẫn tới được (bài au_onboarding đi bộ tới từng người vẫn qua). Không chặn quầy Hàng Xén thêm (đã có từ trước; tester thấy em bé khuất dưới cái dù, đó là chuyện vẽ che chứ không phải đi xuyên).

### 6. Màn thắng: ĐÃ LÀM
- Dòng thưởng có biểu tượng + tên: "+128 [hình] Kinh nghiệm", "+88 [hình] Vàng", "+5 [hình] Quặng", "+6 [hình] Gỗ linh", "Trong ải: 3 [hình] Quặng" (chữ tên màu nhạt hơn số). Ảnh `anh/08-man-thang.png`.

### 7. Tiếng Anh: ĐÃ LÀM
Thêm vào `game/js/ngon_ngu_en.js`: "Sân đình: chọn em bé", "trận này chưa nhận linh khí", "Cháu ngã ở phòng {0} rồi", "Chưa hệ", "Chưa có linh khí. Kết liễu quái…". Tên tài nguyên ở dòng thưởng dùng từ điển sẵn có (XP, Gold, Ore…).

### 8. Kiểm tra
- 12 cặp ảnh trước/sau (iPhone ngang 844×390, tỉ lệ 3) trong `anh/`, mỗi ảnh: trên là trước, dưới là sau (riêng ảnh 04: trái trước, phải sau). Ảnh "trước" chụp bằng chính bản mới với cả ba cờ tắt, nên cũng là bằng chứng cờ tắt về đúng cách cũ.
- Script chụp: `game/tests/doc_tran_shots.py` (chạy: `python3 game/tests/doc_tran_shots.py <thư mục> <tiền tố> [đuôi địa chỉ]`), 18 cảnh: 3 trận đông ở 3 vùng (độc, băng, lửa), trận bấm chiêu liên tục, phòng trùm, máu âm, thua, thắng, làng (cũ và người mới), Ông Từ, Xem vũ khí, Hàng xén, Lò rèn, Cụ Đồ, Cài đặt, Hành trang. **0 pageerror**, `G.fx.errs` = 0.
- `game/tests/au_ui.py`: chạy được, "lỗi JS: không có". `game/tests/au_onboarding.py`: chạy hết từ màn chào tới ải 2, "lỗi trang: []".
- `node game/tests/cloud_save_regression.test.js`: 7 PASS, 0 FAIL. `node --check` mọi tệp js: sạch.
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep`: cả hai chạy được.

## Còn lại / gợi ý phiên sau
- "Ngôn ngữ" chật trong bảng Cài đặt (để phiên Cốt truyện/Cài đặt làm).
- Rà các chữ cỡ 6,5 còn lại (số trên ô vũ khí, chữ trong ô đồ chật).
- Tỉ lệ vũ khí/em bé (N2), phóng em bé 1,25 lần (C4) và vòng sáng dưới chân: chưa làm (ngoài phạm vi phiên này).
- Trận đông khi bé dùng đòn xoay vòng (búa/kiếm quét): tia sáng trắng giữa đòn vẫn rất sáng; nếu cần có thể giảm thêm `fxBe` cho riêng loại "flash".
