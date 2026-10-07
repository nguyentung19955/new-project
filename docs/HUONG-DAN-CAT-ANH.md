# Hướng dẫn cắt ảnh AI vừa gen (Windows)

Ảnh gen theo `docs/PROMPT-CAN-GEN.txt` (tướng 4×3, boss 3×3, hiệu ứng…) cần cắt thành từng khung trước khi đưa vào game. Có hai cách, kết quả như nhau — chọn **một**.

> **Ảnh gốc quá to để gửi lên chat cũng không sao:** tool chạy hoàn toàn trên máy bạn (không tải ảnh lên đâu cả), xử lý được ảnh gốc vài nghìn px / nhiều MB (lần lượt từng ảnh, xong ảnh nào bỏ ảnh gốc khỏi bộ nhớ ngay). Kết quả đã thu về đúng cỡ game dùng (tướng cao 480 px, chân dung 240 px, hiệu ứng 192 px, icon 128 px) và nén PNG bảng màu, nên zip đầu ra nhỏ — thường vài MB tới vài chục MB cho cả bộ 79 ảnh. Tool in ra dung lượng zip; **quá ~20 MB thì tự chia** thành `da-cat-phan-1.zip`, `da-cat-phan-2.zip`… (mỗi phần ≤ 20 MB, mỗi tấm nằm trọn một phần) — gửi **đủ các phần**.

## Cách 1 — không cần cài gì (khuyên dùng)

1. Tải 1 file `tools/cat-anh.html` về máy (bấm vào file trên GitHub → nút **Download raw file**).
2. Bấm đúp file đó: nó mở trong **Chrome** hoặc **Edge**.
3. Mở thư mục `D:\ảnh game`, chọn hết ảnh (Ctrl+A) rồi **kéo thả** vào ô giữa trang (hoặc bấm **Chọn thư mục…**).
4. Xem từng ảnh: viền **xanh** = tốt · **vàng** = xem lại (tên đoán, lưới lệch đã tự dò) · **đỏ** = lỗi (thiếu khung, 2 khung giống hệt, tên không nhận ra). Ảnh tên lạ: gõ mã vào ô bên cạnh tên (ví dụ `thaymo`, `trieuda`, `trung-kim`). Mỗi ảnh có khung chạy thử animation.
5. Bấm nút **Tải da-cat.zip** (cạnh nút có ghi dung lượng). Nếu tổng quá 20 MB, trang hiện nhiều nút **Tải da-cat-phan-1.zip**, **…-phan-2.zip** — bấm lần lượt từng nút.

## Cách 2 — chạy bằng Python (cắt cả thư mục một lần)

1. Cài Python từ <https://www.python.org/downloads/> (nhớ tick **Add python.exe to PATH**).
2. Tải 2 file `tools/cat-anh.bat` và `tools/cat_anh.py` để **cùng một thư mục**.
3. Bấm đúp `cat-anh.bat`. Lần đầu nó tự cài thư viện (Pillow, numpy, scipy), rồi đọc `D:\ảnh game` và ghi ra:
   - `D:\ảnh game\da-cat\assets\…` — đúng cấu trúc thư mục `assets/` của game
   - `D:\ảnh game\da-cat\bao-cao.html` — mở để xem từng khung và ảnh lỗi
   - `D:\ảnh game\da-cat.zip` — file để gửi đi (quá 20 MB thì thành `da-cat-phan-1.zip`, `da-cat-phan-2.zip`…); cửa sổ đen in ra tên và dung lượng từng file
   Ảnh ở thư mục khác: kéo thư mục đó thả lên file `cat-anh.bat`. Muốn mỗi phần nhỏ hơn (ví dụ chat chỉ nhận 10 MB): `python cat_anh.py "D:\ảnh game" --toi-da 10`.

## Gửi kết quả để ghép vào game

- **Dễ nhất:** gửi file `da-cat.zip` (hoặc đủ các file `da-cat-phan-N.zip`) cho Claude và nói "ghép ảnh này vào game". Claude chạy `python3 tools/cat_anh.py --ghep da-cat-phan-1.zip da-cat-phan-2.zip …`, tăng phiên bản, test và đẩy lên.
- **Tự làm (có repo trên máy):** chạy `python tools/cat_anh.py --ghep "D:\ảnh game\da-cat.zip"` trong thư mục repo — lệnh chép ảnh vào `assets/`, tạo lại các tên cũ (`idle.png`, `walk1.png`… ghi trong `alias.json`, không để trong zip cho nhẹ) và ghi số khung vào `PACK_FRAMES` (`js/render.js`). Đừng chép tay thư mục `assets/` trong zip: sẽ thiếu tên cũ và số khung animation (thư mục `D:\ảnh game\da-cat\assets` của bản Python thì đủ tên cũ, chỉ thiếu số khung).

## Tool nhận ảnh thế nào

- Theo **tên file** ghi sau "lưu tên:" trong `PROMPT-CAN-GEN.txt`. Tên lệch vẫn đoán được: `Thaymo (1).PNG`, `thaymo.png.png`, `thaymo_v2.png`, `Thầy Mo Lửa.png`, `dan_he.png`. Ảnh quái `enemy6`, icon kỹ năng `icon-<mã>.png`, Thần Khí `than-khi-<mã>.png` cũ cũng nhận.
- Ảnh AI trả về sai cỡ / lệch lề: tool dò lưới theo vùng có hình (bỏ nền hồng tím) rồi mới cắt, và báo "sai lưới → đã dò lưới".
- Cách cắt giống hệt `tools/cat-sheet.py` · `cat-fx.py` · `cat-icons.py` (xoá nền #FF00FF và viền hồng, mọi dáng chung đường chân, thu về cao 480 px / chân dung 240 px, PNG 256 màu). Kiểm chứng: `node tests/cat-anh/cat-anh.test.js`.
- Thêm tướng / quái / hiệu ứng mới vào game → chạy `node tools/build-cat-anh.js` để cập nhật danh sách tên trong hai file tool.

## Ảnh trong `D:\ảnh game` (ảnh chụp thư mục 07/10) — đã xem từng ảnh

Ảnh **chỉ có một vật / một dáng thì không chia lưới**: tool chỉ xoá nền rồi cắt sát. Tấm nhiều icon (một hàng, lưới 2×2, 3×2) được tách từng vật theo vùng có hình, không cần biết lưới. Tên mã băm (`0cebb789…~tplv-…-ai-watermark`) nhận theo 10 ký tự đầu; bản `-watermark-v2` là ảnh trùng, lấy một. Ghi chú đầy đủ: `tools/cat-anh-them.json`.

| Ảnh | Là gì | Ra file |
|---|---|---|
| `daibang_pose01..04`, `haba_…`, `hotinh_…`, `thuytinh_…`, `trieuda_pose01..04` | 4 dáng boss, mỗi ảnh một dáng (01 đi · 02 đi · 03 đánh · 04 nổi giận) | `packs/<mã>/walk1 · walk2 · attack · rage.png` (chung đường chân, bỏ chữ Pippit) |
| `0cebb78997…` | Đồ ghép 3 (2×2) | `do-ghep_cung-mat-chim · bua-chim-lac · ao-vay-ca · ngoc-tran-thuy` |
| `a8e4c60527…` | Đồ ghép 2 (2×2) | `do-ghep_giap-dong-bat-diet · luoi-hai-chi-tu · mui-sung-pha-giap · riu-quet-song` |
| `dd6a584e29…` | Đồ ghép 1 (chữ nhỏ dưới icon tự bỏ) | `do-ghep_trong-dong · song-riu-cuong-no · gay-tam-gioi · gay-thoi-khong` |
| `e4a5ee3b81…` · `227bcc1df2…` · `8de72839c9…` | Icon chỉ số 1 · 2 · 3 | `ui/ic-giap…`, `ui/ic-mau…`, `ui/ic-suc-manh…` (64 px) |
| `1752e1cb34…` · `9d1879c378…` · `7b5e50b411…` (2×2) | Icon trạng thái 1 · 2 · 3 | `ui/ic-cham…`, `ui/ic-sa-lay…`, `ui/ic-boss…` |
| `8cb488889a…` · `c3c4a1f249…` | Icon tiền tệ · khác | `ui/ic-tui-vang…`, `ui/ic-kho…` |
| `b21143d0d9…` | Icon ngũ hành (AI vẽ thứ tự Mộc Hỏa Thổ Kim Thủy) | `ui/ic-hanh-moc · hoa · tho · kim · thuy.png` |
| `895024fdac…` · `f185e43ba1…` | Đế đặt tướng 5 trạng thái · theo chủ đề | `tiles/de-tuong-….png` |
| `1aa24dfe2f…` | Cổng thành (6 công trình, cần 5 — ô 4 bỏ, **xem lại**) | `tiles/cong-….png` |
| `f7577582d3…` | Huy hiệu ải mở / chọn / khoá | `ui/ai-mo · ai-chon · ai-khoa.png` |
| `75f39d6a3b…` · `827e7b7475…` · `c3244b848f…` · `03d58d7cc9…` · `ce75d53ffa…` · `023feeefd6…` | Kết cấu đường nước · đất · đá · bờ ruộng · cát · gạch | `tiles/duong-….jpg` (vuông 512) |
| `3b41972ae4…`, `9adfb4d954…` (Hà Bá lẻ), `127e45df08…` (ảnh đen) | Trùng / không dùng | bỏ qua |
| `clean_button_*`, `clean_tower_*`, `thap-phong-thu_v2/_v3`, `hieu-ung-chien-dau_v2`, `dan-tan-cong_v2`, `ui-trang-thai-nut_v2/_v3` và các tấm `3fc810885d` `8c8c8789a5` `8e58465bb8` `09f34132ac` `31a7b41eb1` `517a6cf10e` `932f9e5416` `1589d52fc1` `3099f5076c` `6973ee4fba` `adf118847c` `c1ce972fa3` `e5e26c252d` `ec8ea89215` `f2ddbbe18d` `fb0899a136` `fbfb56ed7f` | Game **chưa có chỗ dùng** (tháp, nút, huy chương khác mẫu…) | chỉ xoá nền, tách từng vật vào `assets/chua-dung/<tên>/` — nói Claude biết muốn dùng vào đâu |
