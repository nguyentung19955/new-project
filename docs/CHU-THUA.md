# Rà chữ thừa trong giao diện (phiên bản 168)

Nguyên tắc: **XOÁ** chữ chỉ giải thích kỹ thuật hoặc lặp lại · **RÚT GỌN** hướng dẫn cần thiết (chỉ hiện cho người mới) · **GIỮ** thông tin để ra quyết định (giá, chỉ số, cảnh báo lỗi, xác nhận xoá…).

Ảnh trước / sau: `docs/chu-thua-truoc-sau.png` (trái: trước · phải: sau).

| Chỗ | Chữ cũ | Quyết định |
|---|---|---|
| Cài đặt — dòng cuối (`js/ui.js` renderSettings) | "Thần Thoại Việt · Phiên bản N · Tiến trình lưu trên máy và đám mây / trên trình duyệt của bạn" | Rút gọn → "Thần Thoại Việt · Phiên bản N" |
| Cài đặt — hàng tài khoản (`cloudRow`) | Tiêu đề "Lưu đám mây" + " · Đăng nhập Google để chơi tiếp trên máy khác" | Đổi tiêu đề "Tài khoản", xoá câu phụ (nút "Đăng nhập Google" vẫn còn) |
| `js/cloud.js` label() | "Chưa bật (chỉ lưu trên máy này)", "Khách (chỉ máy này)", " · đồng bộ lúc HH:MM" | Rút gọn → "Chưa đăng nhập", "Khách", bỏ giờ đồng bộ |
| Bảng nhỏ khung người chơi (menu) | "… · lưu trên đám mây", "Chơi ngoại tuyến · tiến trình lưu trên máy này" | Rút gọn → chỉ email / "Chơi ngoại tuyến" |
| Xác nhận Đăng xuất | "Đăng xuất? Tiến trình trên máy vẫn giữ." | Giữ — xác nhận |
| Toast khi nạp bản lưu | "Đã tải tiến trình từ đám mây" | Xoá (kỹ thuật, hiện mỗi lần mở game) |
| Màn đăng nhập | "<email> · tiến trình lưu trên đám mây" | Xoá phần sau email |
| Màn đăng nhập | "Đăng nhập để chơi — tiến trình lưu trên đám mây, chơi tiếp trên máy khác" | Rút gọn → "Đăng nhập để chơi" |
| Màn đăng nhập (khách) | "Đăng nhập để giữ tiến trình đang chơi và vào bảng xếp hạng" | Giữ — lý do để đăng nhập |
| Bảng xếp hạng ngoại tuyến | "Bảng xếp hạng cần kết nối mạng (lưu đám mây)." | Rút gọn → bỏ "(lưu đám mây)" |
| Cài đặt — Dùng ảnh AI | "Tắt: toàn bộ hình do game tự vẽ. Bật: dùng ảnh tạo bằng AI trong thư mục assets/ (tải lại trang)" | Rút gọn → "Tải lại trang để áp dụng" |
| Cài đặt — Tướng vẽ nét | "Tắt: dùng ảnh vẽ tay, … Bật: hình vẽ nét, mũ / giáp / vũ khí hiện riêng từng món" | Rút gọn → "Hiện riêng mũ / giáp / vũ khí" |
| Cài đặt — Cỡ chữ & nút | "Phóng to thanh trên, thanh tướng, nút và thông báo trong trận. Tự động: …" | Rút gọn → "Tự động: điện thoại to thêm 20%" |
| Cài đặt — Đồ hoạ | "Tự động: game tự giảm độ nét và hiệu ứng khi máy bị giật" | Rút gọn → "Tự động giảm hiệu ứng khi máy giật" (giữ "đang giảm N bậc") |
| Cài đặt — Góp ý | "Báo lỗi, gửi ý tưởng hay góp ý cân bằng cho đội làm game" | Xoá (lặp với nút ✉ Góp ý) |
| Cài đặt — Xoá tiến trình | "Xoá sao và các ải đã mở trên máy này" + "Bấm lần nữa để xoá" | Giữ — cảnh báo / xác nhận xoá |
| Cài đặt — 3 công tắc đầu (số sát thương, rung, cốt truyện) | mô tả 1 dòng ngắn | Giữ |
| Tạm dừng khi chơi nhóm | "Chơi nhóm: trận vẫn chạy khi mở bảng này" | Giữ — cảnh báo |
| Ngăn kéo menu trong trận (`index.html`) | "mua tướng tím, vàng", "khắc ấn cho tướng Vàng", "quái, boss, lịch đợt", "chơi lại, bản đồ, menu", "báo lỗi, gửi ý tưởng", "bỏ trận này, về menu" | Xoá (CSS đã ẩn sẵn, chữ chết) — giữ số đếm Túi đồ |
| Khung hướng dẫn trong trận (coach) | "Chạm 1 thẻ tướng ↓ để triệu hồi…", "Mua thêm tướng…", "Bấm ▶ (góc trên phải) để … tràn tới" | Rút gọn phạm vi: chỉ hiện cho người mới (chưa qua ải 1); trước đây hiện đầu mọi ải |
| Toast "Mẹo:" (kéo thẻ, kéo đổi vị trí, Nâng cấp, Chuẩn bị xuất quân) | hiện lại mỗi trận | Chỉ hiện cho người mới (chưa qua ải 1) |
| Toast gợi ý ghép khi có 2 tướng giống nhau | — | Giữ — thông tin để ra quyết định |
| Bảng kỹ năng (giữ chân dung / nút kỹ năng) | "Thả tay để đóng" | Xoá |
| Cây phát triển (Anh Hùng / Túi đồ) | "chạm chân dung để xem tướng" | Xoá |
| Chọn đội triệu hồi | "Chạm để chọn / bỏ · khắc chế quái ải này · hợp thể ra tướng Tím / Vàng bạn có" | Rút gọn → chỉ giữ chú thích 2 nhãn "khắc chế" / "hợp thể" |
| Chuẩn bị xuất quân — Lò đúc | "Mua và đúc đồ bằng Ngân khố. Đồ Huyền thoại hiếm và đắt" | Rút gọn → "Mua và đúc đồ bằng Ngân khố" |
| Chuẩn bị xuất quân — tướng sở hữu (trống) | "Chưa có tướng Tím / Vàng nào. Mua ở Anh Hùng (menu chính) bằng Ngân khố để hợp thể được trong trận." | Rút gọn → "Chưa có tướng Tím / Vàng nào." (tiêu đề cột đã nói "hợp thể được trong trận") |
| Chuẩn bị xuất quân — đội triệu hồi | "Chợ tướng chỉ ra trong 6 tướng này — dễ ghép sao… Sau mỗi đợt boss được đổi 2 tướng." | Xoá (màn nghỉ sau boss tự giải thích việc đổi tướng) |
| Chuẩn bị xuất quân — giá các món | "+150 vàng đầu trận", "Mở ngay 2 món Hiếm…" | Giữ — thông tin mua |
| Túi đồ — chi tiết (chưa chọn) | "Chạm một món trong túi hoặc trên tướng để xem chỉ số, cường hóa (+1 đến +5…), thăng phẩm…, khóa hoặc đổi ra vàng." | Rút gọn → "Chạm một món để xem chi tiết." (bảng giá cường hóa ngay dưới vẫn giữ) |
| Túi đồ — chú thích trang phục / hành | "Đồ trang phục làm tướng đổi hình dạng và mang 1 hành…" | Giữ — luật ảnh hưởng chỉ số |
| Túi đồ — dưới ô trang bị | "… · chạm đồ trong túi rồi bấm Đeo" / "Chạm đồ trong túi rồi bấm Đeo" | Xoá; giữ hiệu ứng bộ / hành của tướng |
| Kho báu & Sính lễ | "Đồ có được trong trận (rơi từ quái, Hũ báu, Lò đúc, sính lễ) được ghi vào Kho Báu. Đồ chưa có hiện màu tối." | Xoá |
| Chợ — Hũ báu | "Mở để nhận một món ngẫu nhiên", "≈ Đồ còn rơi từ quái; quái tinh anh và boss rơi đồ xịn hơn." | Xoá |
| Chợ — Hũ báu | "Mở thêm N hũ nữa: chắc chắn ra đồ Sử thi trở lên." | Giữ — thông tin quyết định |
| Kết quả trận | "Ngân khố nhận (mua đồ / tướng trước trận)" | Rút gọn → "Ngân khố nhận" |
| Góp ý — đầu bảng | "Báo lỗi, ý tưởng, cân bằng — đội làm game đọc từng góp ý" | Xoá |
| Góp ý — chân bảng | "Tự gửi kèm: phiên bản, màn đang mở… Không gửi email tài khoản." | Giữ — minh bạch dữ liệu gửi đi |
| Ấn Phù khi chưa có tướng Vàng (toast) | "Ấn Phù chỉ dành cho tướng Vàng. Mua tướng Vàng ở Anh Hùng…" | Giữ — báo lỗi kèm cách làm |
| Ấn Phù — Tu Vi | "… — hạ quái bằng tướng này để lên bậc" | Giữ — cách lên bậc |
| Chọn chế độ (mô tả 3 thẻ) | mô tả từng chế độ | Giữ ở đợt này (session khác đang bỏ Phó bản, tránh xung đột) |
| Màn nghỉ sau boss (đổi tướng) | giải thích đổi tối đa N tướng | Giữ — luật của màn |
| Bách khoa — hiệu ứng ẩn, giáp quái | chú thích luật | Giữ — tra cứu |
