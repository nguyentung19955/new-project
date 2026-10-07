# Báo cáo test toàn bộ — Thần Thoại Việt (phiên bản 179 → ghi ở 180; sửa ở 183)

Người test: vai trò QA game mobile (tower-defense, UI/UX, hiệu năng) · Ngày: 07/10/2026 · Nhánh: `claude/tester-toan-bo`

## Cách test

- Chạy `index.html` bằng Playwright (Chromium, file://, chặn `firebase-config.js` như các test trong `tests/`), ở 5 kích thước: **1920×934, 1280×720, 844×390, 667×375, dọc 390×844**.
- Chơi bằng chuột như người thật: Menu → Xuất Quân → Chọn chế độ → Vô Tận → Bản đồ → Chuẩn bị (Lò đúc đồng, Chọn đội) → Vào trận → mua thẻ chợ (chạm + kéo thả), ghép sao bằng kéo, chọn tướng, Lên cấp, kéo tướng vào 🗑 Hủy, ↻ đổi chợ, Hợp thể (các tab Tím/Vàng, lọc), ▶/⏸, x1/x2/x3, 👁, menu ≡ (Túi đồ, Anh Hùng, Ấn Phù, Bách khoa, Tạm dừng & cài đặt, Góp ý), Mặc đồ / Nâng đồ / Túi đồ. Tua bằng hàm game tới **đợt 10, 20, 30, 50**, hạ boss Thuồng Luồng → chọn Sính lễ → Nghỉ chân → chơi tiếp, để thua → màn kết quả. Tải lại trang → Xuất Quân → tiếp tục trận. Xoay màn giữa trận. Đăng nhập / đăng xuất / đổi tên (giả lập tài khoản).
- Menu chính: Anh Hùng (chọn nhiều tướng, cuộn), Ấn Phù (khắc ấn), Kho Báu, Cài đặt, Bách khoa (3 tab), Xếp hạng, Góp ý (gửi rỗng).
- Chụp ~250 ảnh, **xem từng ảnh** (phóng to vùng nghi lỗi), ghép chuỗi khung hình liên tiếp của thanh chợ (24 khung), boss (6 khung), tướng/quái (8 khung mỗi con), đo vị trí khung "Đợt" 50–60 lần/đợt, đo FPS bằng requestAnimationFrame, gom lỗi console.
- Không sửa code game. Ảnh minh hoạ (chỉ ảnh có lỗi) ở `docs/bao-cao-test/` (webp, tổng ≈ 0,5 MB).

## Tổng hợp

| Mức độ | Số lỗi |
|---|---|
| Nghiêm trọng | 0 |
| Cao | 5 |
| Trung bình | 7 |
| Thấp | 5 |
| **Tổng** | **17** |

Không có lỗi JavaScript (pageerror) nào trong toàn bộ các lượt chơi. Game không treo, không mất tiến trình.

## Bảng lỗi

| Mã | Mức độ | Màn hình | Kích thước | Bước tái hiện | Mong đợi | Thực tế | Ảnh | Trạng thái (v183) |
|---|---|---|---|---|---|---|---|---|
| L01 | **Cao** · *đang có nhánh sửa (sua-the-cho)* | Thanh chợ tướng (đáy màn chơi) | Mọi kích thước | Vào trận bất kỳ, nhìn 4 thẻ tướng | Chân dung gọn trong thẻ, icon hành nằm gọn ở góc | Mảng hình hành ngũ hành (lá Mộc, lửa Hỏa, sóng Thủy, kiếm Kim, núi Thổ) bị cắt nửa, **lòi ra mép trái** chân dung ở cả 4 thẻ, mọi khung hình (đã ghép 24 khung liên tiếp: lỗi luôn có, không nhấp nháy) | `bao-cao-test/L01-the-cho-icon-cat-1920.webp`, `L01-the-cho-icon-cat-667.webp` | ✅ Đã sửa (v181, nhánh sua-the-cho) — tái hiện lại trên v182: icon hành nằm gọn góc thẻ ở 1920/844/667 |
| L02 | **Cao** | "Tướng khắc chế" ở màn Bản đồ, màn Chuẩn bị xuất quân và khung "Đợt N · bộ quái mới" trong trận | Mọi kích thước (rõ nhất 667×375, 844×390) | Mở Xuất Quân → Vô Tận → xem cột phải; hoặc tua tới đợt 30/50 trong trận | Icon hành nhỏ ở góc ảnh, chữ lý do ("khắc Thủy", "bắn quái bay"…) đọc được | Icon hành (`.ch-av i`) to **33 px trên ảnh 103 px** (≈1/3), đè lên **mặt tướng** và **che hết dòng chữ lý do** bên dưới; ở 667×375 chữ chỉ còn lòi vài ký tự | `L02-khac-che-icon-che-mat.webp` | ✅ Đã sửa (v183) — bản v180 đã thu icon về ~15 px nhưng ở 844×390/667×375 icon vẫn đè dòng lý do ~8 px; nay icon 15 px nằm đúng góc dưới phải ảnh, không lấn chữ (cả bản đồ, chuẩn bị, khung bộ quái mới) · `sau-L02-*.webp` |
| L03 | **Cao** | Bản đồ chọn ải (Vô Tận) | Mọi kích thước | Xuất Quân → Vô Tận, nhìn các điểm 1–7 trên bản đồ | Mỗi ải có huy hiệu tròn (ảnh `assets/ui/ai-mo.png`, `ai-chon.png` đã có trong repo), ải đang chọn nổi bật | Huy hiệu **không hiện**, chỉ còn con số trơ "1, 2, 3…" nằm trên sông, ải đang chọn không có đánh dấu. Nguyên nhân: `loadUiSkins()` (js/ui.js) gán `--sk-ai-mo: url("assets/ui/ai-mo.png")` (đường dẫn tương đối) rồi `css/style.css` dùng `var(--sk-ai-mo)` → trình duyệt tìm `css/assets/ui/ai-mo.png` (404, thấy trong log mạng). CSS lại đặt `border-color: transparent` nên vòng tròn cũ cũng mất. **Mọi ảnh khung/nút UI_SKIN khác (khung-bang, nut-vang, the-cho, thanh-mau-boss…) sẽ hỏng y hệt khi được thêm ảnh** | `L03-ban-do-mat-nut-ai.webp` | ✅ Đã sửa (v180, nhánh gan-anh-moi: `loadUiSkins` dùng URL tuyệt đối) — tái hiện lại: huy hiệu ải hiện, không còn request `css/assets/…` |
| L04 | **Cao** | Màn kết quả (thua) | 844×390, 667×375, 1920×934 (mọi kích thước) | Chơi tới khi hết mạng | Xem hết bảng kết quả (Tu Vi từng tướng, …) bằng cách cuộn | Nội dung cao **563 px trên màn 390 px** (844×390), 445/375 (667×375), 1282/934 (1920×934). `#result` để `overflow: hidden`, **không có vùng nào cuộn được** (đã thử lăn chuột và vuốt). Dòng "Tu Vi" và các dòng sau bị cắt hẳn, người chơi không bao giờ thấy | `L04-ket-qua-khong-cuon-844.webp`, `L04-ket-qua-khong-cuon-1920.webp` | ✅ Đã sửa (v183) — cột phải màn kết quả tự cuộn (chuột/vuốt), cuộn hết thấy trọn dòng cuối · `sau-L04-ket-qua-cuon-844.webp` |
| L05 | **Cao** | Thông báo nổi (toast) ở góc phải trên | Mọi kích thước | (a) Chọn bản đồ → Vào vô tận: toast "Vô tận · Bến Sông Đà: giữ thành…" nằm đè lên "Tướng khắc chế" ở màn Chuẩn bị, Lò đúc đồng, Chọn đội. (b) Ấn Phù → khắc 1 ấn → thoát → Kho Báu: toast "Thánh Gióng · Gân Đá cấp 1" vẫn hiện trong Kho Báu. (c) Hủy tướng rồi mở Hợp thể: toast "Đã hủy Lạc Tướng" đè lên thẻ công thức. (d) Nghỉ chân, Túi đồ: toast đè ô tướng / bảng Chi tiết | Toast hiện ngắn, không che nút/nội dung, tắt khi chuyển màn | Toast **sống sót qua chuyển màn** và đè lên nội dung quan trọng của màn mới (danh sách khắc chế, thẻ Hợp thể, ô Thổ ở Nghỉ chân, bảng chi tiết món đồ). Trong trận toast "Quái mới…" che luôn **thành (đích của quái)** | `L05-toast-che-khac-che-1280.webp`, `L05-toast-sot-sang-kho-bau-844.webp`, `L05-toast-che-the-hop-the-844.webp` | ✅ Đã sửa (v183) — đổi màn/lớp phủ thì xoá thông báo cũ; trong lớp phủ thông báo hiện ở đáy giữa; trong trận tự né thành, hội thoại boss, khung bộ quái mới, bảng boss; mục tiêu bản đồ báo lúc vào trận (không đè màn Chuẩn bị) · `sau-L05-*.webp` |
| L06 | Trung bình | Bảng thông tin boss/quái khi chạm vào quái | 844×390, 667×375 | Đợt 10, chạm vào Thuồng Luồng | Bảng không che chính con boss | Bảng nằm góc trên trái, **đúng chỗ quái xuất hiện / đi vào** nên che luôn boss đang chọn. Khi boss dính hiệu ứng (vd "Câm lặng") bảng cao thêm một dòng → **giật chiều cao** liên tục theo hiệu ứng (thấy rõ trong 6 khung liên tiếp) | `L06-bang-boss-che-boss-844.webp` | ✅ Đã sửa (v183) — dòng hiệu ứng chừa sẵn (cao cố định); boss lọt dưới bảng thì bảng dời xuống góc dưới trái (trên thanh chợ) · `sau-L06-bang-boss-844.webp` |
| L07 | Trung bình | Boss xuất hiện | 844×390 | Tua tới đợt 10 | Banner "Boss xuất hiện / THUỒNG LUỒNG" đọc trọn | Khung hội thoại boss đè lên dòng nhỏ "Boss xuất hiện" của banner; cùng lúc có thêm toast "Quái mới" → 3 lớp chữ chồng nhau ở nửa trên màn, che tướng hàng trên | `L07-hoi-thoai-che-banner-boss.webp` | ✅ Đã sửa (v183) — hội thoại boss và thông báo "Quái mới" đợi banner tắt rồi mới hiện, thông báo xếp né hội thoại · `sau-L07-boss-844.webp` |
| L08 | Trung bình · *đang có nhánh sửa (an-giao-dien)* | Chọn tướng trên sân | Rõ nhất dọc 390×844, cũng có ở 667×375 | Chạm 1 tướng đứng gần tướng khác | Nút Hủy không che tướng nào | Bong bóng "🗑 Hủy" nổi trên đầu tướng đang chọn, **đè lên đầu/thân tướng bên cạnh**; ở 667×375 bong bóng sát mép trái màn | `L08-bong-bong-huy-che-tuong-doc.webp` | ✅ Đã sửa (v180/v181, nhánh an-giao-dien: bỏ bong bóng Hủy, hủy bằng kéo vào thùng) — tái hiện lại: chạm tướng không còn bong bóng Hủy |
| L09 | Thấp | Menu chính | Mọi kích thước | Mở game | Chữ nằm trong nút có lề | Nút "Ấn Phù": chữ chạm sát viền phải (scrollWidth 85 > clientWidth 84, mất padding phải) | `L09-nut-an-phu-cham-mep.webp` | ✅ Đã sửa (v183) — nút hàng đôi bớt lề trong, nút Ấn Phù rộng 44% · `sau-L09-nut-an-phu.webp` |
| L10 | Thấp | Menu chính, màn đăng nhập | Mọi kích thước (rõ ở 1920×934) | Mở game, nhìn góc phải dưới | Ảnh nền sạch | `assets/ui/nen-menu.jpg` còn **một ô vuông mờ viền xám** (vết watermark/khung sót) ở góc phải dưới, nằm ngay trên sóng biển | `L10-nen-menu-con-vet-watermark.webp` | ✅ Đã sửa (v183) — vá vùng ô vuông trong `assets/ui/nen-menu.jpg` (inpaint + làm mượt theo nền nước) · `sau-L10-nen-menu.webp` |
| L11 | Trung bình | Màn đăng nhập (khi Firebase bật, người chơi là khách ẩn danh) | Mọi kích thước | Bật Firebase, chưa đăng nhập Google/email, mở game hoặc bấm "Đăng nhập" ở Cùng Giữ Thành | Có nút đóng / "Chơi ngoại tuyến" | Form chỉ có Google / email / quên mật khẩu, **không có nút đóng hay chơi khách** (`login-x` chỉ hiện khi đã đăng nhập) → người không muốn tạo tài khoản bị kẹt | `L11-dang-nhap-khong-co-nut-dong.webp` | ✅ Đã sửa (v183) — thêm nút "Chơi với tư cách khách" (khi bị chặn ở màn đăng nhập) và nút ✕ (khi mở từ menu); lúc "Đang kiểm tra đăng nhập…" có "Chơi ngoại tuyến" · `sau-L11-dang-nhap-844.webp` · ⚠ *cần người dùng xác nhận*: v73 chủ ý bắt buộc đăng nhập — muốn giữ bắt buộc thì bỏ nút khách |
| L12 | Thấp | Xếp hạng (không có mạng) | Mọi kích thước | Menu → Xếp hạng khi ngoại tuyến | Màn trống có hình minh hoạ + nút "Thử lại" | Toàn màn đen, một dòng chữ 11 px "Bảng xếp hạng cần kết nối mạng.", không nút thử lại | `L12-xep-hang-trong-tron.webp` | ✅ Đã sửa (v183) — hình minh hoạ, nút ↻ Thử lại (khi Firebase bật mà mất mạng), danh sách kỷ lục của chính mình lưu trên máy · `sau-L12-xep-hang-844.webp` |
| L13 | Trung bình · *đang có nhánh sửa (dot-co-dinh)* | Khung "Đợt N · Vô tận" + thanh tiến độ trên cùng | Mọi kích thước | Chơi qua các đợt 0 → 1 → 10 → 20 | Khung đứng yên | Khung và **thanh tiến độ trượt ngang theo độ rộng chữ**: 844×390 x = 175…181 px, rộng 108…120 px; 1920×934 x = 492…495 px. Ảnh xếp chồng có vạch đỏ cố định cho thấy thanh tiến độ lệch rõ giữa "Đợt 0" và "Đợt 10" | `L13-khung-dot-nhay-vi-tri.webp` | ✅ Đã sửa (v180/v182, nhánh dot-co-dinh: khối Đợt rộng/cao cố định) — tái hiện lại bằng `tests/dot-co-dinh`: lệch 0 px |
| L14 | Trung bình | Toàn game (tải trang) | Mọi kích thước | Mở game, mở DevTools → Network/Console | Không có lỗi tải | **43 yêu cầu ảnh 404 mỗi lần tải** (thăm dò ảnh tuỳ chọn: `ui/khung-bang.png`, `nut-vang-*`, `nut-dong-*`, `nut-tron-*`, `the-cho-*`, `thanh-mau-boss`, `khung-thanh-day`, `nut-doi-cho`, 15 icon `ic-*.png`, `logo-tua.png`, `tiles/de-tuong-*.png`, `scenes/nen-man-phu.png`, `scenes/chuong-sontinh.png`, `thang-/thua-sontinh.png`, `victory-bg.png`, `defeat-bg.png`, `nen_thang.png`, `nen_thua.png`, và 2 đường sai `css/assets/ui/ai-*.png` của L03). Console đỏ lòm che mất lỗi thật khi debug; trên hosting/APK tốn ~43 request thừa lúc khởi động. Bộ test hiện tại lọc bỏ các lỗi này nên không ai thấy | — | ✅ Đã sửa (v183) — `js/asset-list.js` (sinh bởi `tools/build-asset-list.js`) liệt kê ảnh có thật; game không thăm dò ảnh thiếu nữa: **0 request 404** (trước: 40 lúc vào trận, 61 khi đi qua các màn) |
| L15 | Trung bình | Màn chơi lúc đông quái | 1920×934, 1280×720 | Tua tới đợt 20–50, x3 | ≥ 50 FPS | Đo trong Chromium headless (không GPU): 844×390 52–60 FPS; **1280×720 rơi còn 22 FPS ở đợt 20**; **1920×934 chỉ 25–35 FPS**, khung chậm nhất 50 ms. Số liệu headless thường thấp hơn máy thật, nhưng chênh lệch theo độ phân giải cho thấy canvas vẽ theo kích thước thật, chưa giới hạn DPR/độ phân giải nội bộ → **cần đo lại trên điện thoại tầm trung và máy tính bảng** | — | ✅ Đã tối ưu (v183) — xem mục "Hiệu năng" bên dưới; vẫn cần đo trên điện thoại thật |
| L16 | Thấp | Thanh trên màn chơi | Mọi kích thước | Vào trận | Chữ có lề trên | Chữ "Đợt N" có `top` = −1 px (1920: −2 px): dấu mũ của "Ợ" sát mép trên màn, trên máy có tai thỏ/bo góc dễ bị cắt | (thấy trong `L13`) | ✅ Đã sửa (v183) — khối Đợt cao đúng phần trong thanh trên (38 px), chữ cách mép trên ~1 px, dấu "Ợ" không sát mép · `sau-L16-dot-844.webp` |
| L17 | Thấp | Màn kết quả | Mọi kích thước | Thua 1 trận | Icon "Mạng còn" giống thanh trên (trái tim đỏ) | Dùng icon tròn nâu kiểu đồng xu → dễ nhầm với vàng | (thấy trong `L04`) | ✅ Đã sửa (v183) — icon "mạng" dùng trái tim đỏ (`ui/ui-tai-nguyen-2.png`) như thanh trên, ở màn kết quả, Đắp thành, Sính lễ · `sau-L17-mang-con.webp` |

### Đã kiểm tra — đạt (đã nhìn ảnh, không phải chỉ đo số)

- Mua thẻ: chạm thẻ → tướng xuất hiện, vàng trừ đúng giá, giá tăng; kéo thẻ thả vào ô cụ thể đúng ô.
- Ghép sao bằng kéo: ★+★ → ★★, có hiệu ứng tia + vòng sáng, số sao trên đầu tướng cập nhật; "Ghép tự động" chạy.
- Lên cấp: trừ vàng đúng (5 lần), số cấp cập nhật trên ảnh chân dung.
- Hủy tướng (kéo vào 🗑): hiện vùng "Hủy tướng · hoàn 54", hoàn đúng 54 vàng, toast xác nhận.
- ↻ Đổi chợ: trừ 10, lần sau 20; đầu đợt mới làm mới miễn phí. 24 khung liên tiếp của thanh chợ: không thẻ nào mất ảnh/nháy trắng.
- Mạng 20/20 giữ đúng; thua khi hết mạng; kỷ lục mới được ghi.
- Boss Thuồng Luồng đợt 10: banner, hội thoại, thanh máu, hạ boss → Sính lễ 3 lựa chọn → Nghỉ chân (Đổi 0/2, Đội 6/6) → chơi tiếp đợt 11, "Mọi tướng +2 cấp" có hiệu lực.
- Lưu / tải lại: đợt, vàng, mạng, toàn bộ tướng (loại, sao, cấp, ô) khớp 100% sau khi tải lại trang.
- Xoay dọc ↔ ngang giữa trận: không vỡ bố cục, game tiếp tục.
- Đổi tên rỗng báo "Tên không được để trống"; Góp ý gửi rỗng báo "Viết thêm chút nữa (ít nhất 10 ký tự)"; Đăng xuất có bước xác nhận.
- Cùng Giữ Thành khoá "Sắp ra mắt" đúng; nút chat ẩn khi chơi đơn.
- Không có lỗi JavaScript ở bất kỳ màn nào.

### Chưa test được

- Cùng Giữ Thành / chat thật (đang khoá), đăng nhập Google thật (cần Firebase), cảm ứng thật và FPS trên điện thoại thật, âm thanh (game hiện **không có âm thanh** — không tìm thấy Audio trong code).

## Đề xuất cải thiện trải nghiệm

1. **Gom tất cả lớp chữ nổi vào một "vùng thông báo" có thứ tự ưu tiên**: toast, hội thoại boss, banner boss, gợi ý bộ quái mới đang tự chọn chỗ và chồng nhau. Nên: banner boss chiếm giữa trên; hội thoại boss chuyển xuống dưới banner hoặc gộp vào banner; toast xếp hàng ở cột phải nhưng **né vùng thành** và **xoá hết khi chuyển màn/overlay**.
2. **Thêm kiểm tra "nhìn ảnh" vào bộ test**: so khớp ảnh chụp (snapshot) cho thanh chợ, thanh trên, màn kết quả, màn chuẩn bị ở 3 kích thước; và test "mọi overlay phải cuộn được nếu nội dung cao hơn màn" (đo `scrollHeight` của phần tử con cuối so với `innerHeight`). Bỏ việc lọc đại trà `ERR_FILE_NOT_FOUND` — chỉ cho phép danh sách ảnh tuỳ chọn có tên.
3. **Thăm dò ảnh tuỳ chọn bằng một file danh mục** (vd `assets/manifest.json` sinh khi build) thay vì gửi request mò rồi chờ 404 — nhanh hơn lúc mở game và console sạch.
4. **Bản đồ chọn ải**: khi ảnh huy hiệu chưa tải được thì giữ vòng tròn CSS cũ (đừng `border-color: transparent` vô điều kiện); thêm hiệu ứng nhấp nháy cho ải đang chọn.
5. **Màn kết quả**: cho cột phải cuộn, hoặc dồn "Tu Vi" thành chip ngắn; nút "Chơi lại" giữ ở trên như hiện tại là tốt.
6. **Tướng khắc chế**: icon hành ≤ 1/5 đường kính ảnh, đặt ở góc dưới phải; dòng lý do nằm dưới ảnh, không bị che.
7. **Bảng boss**: đặt cố định chiều cao (chừa sẵn dòng hiệu ứng) để khỏi giật; chuyển sang góc dưới trái (trên thanh chợ) hoặc tự lật sang phải khi boss ở nửa trái.
8. **Màn dọc**: hiện tại game xoay cả giao diện 90° khi cầm dọc — chữ nằm nghiêng, khó đọc. Nên dùng sẵn màn `#rotate` ("Xoay ngang điện thoại để chơi") cho điện thoại, chỉ xoay giao diện khi không khoá được hướng.
9. **Đăng nhập**: luôn có "Chơi với tư cách khách" và nút đóng; người mới không nên bị bắt tạo tài khoản trước khi chơi thử.
10. **Kho Báu**: 78 ô bóng đen không tên — thêm tên/gợi ý "Rơi từ boss đợt X" khi chạm, và hiện số đã có theo nhóm.
11. **Xếp hạng ngoại tuyến**: hình minh hoạ + nút "Thử lại", hiện kỷ lục của chính mình trên máy.
12. **Hiệu năng**: giới hạn độ phân giải nội bộ canvas (vd tối đa 1280 px ngang × DPR ≤ 2) và tự hạ chất lượng hiệu ứng khi FPS < 40 trong 3 giây (Cài đặt "Đồ hoạ: Tự động" đã có — nên kiểm chứng nó thực sự kích hoạt ở 1280×720).
13. **Âm thanh**: game chưa có âm thanh nào; tối thiểu tiếng mua thẻ, ghép sao, boss xuất hiện, thua/thắng — rất ảnh hưởng cảm giác "đã tay" của thể loại này.
14. **Khung "Đợt N"**: cố định độ rộng (font số đều `font-variant-numeric: tabular-nums` + `min-width`) để thanh tiến độ không trôi.
