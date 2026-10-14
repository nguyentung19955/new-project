# Chiêu trùm vùng / trùm nhỏ / tinh anh: bỏ các kiểu lặp lại (14/10 19:50 — chủ dự án: "Nếu trùm vùng mà cũng vậy thì lên thiết kế luôn")

Rà `js/boss.js` (SK.ngu/moc/ho c1–c5, MINI_SK) và `js/mobs.js thinkElite`: tên chiêu khác nhau nhưng 3 kiểu bị lặp:
- **Toả tròn đạn / vòng có khe** (7 chỗ): Ngư Tinh c5 Xoáy nước, Mộc Tinh c5 Rừng gai, Hồ Tinh c4 Vòng lửa ma + c5 Bão hồ hoả, Nấm Chúa Bão bào tử, Cá Nóc Chúa Gai xoáy, Hũ Chúa Vòng cầu lửa.
- **Mưa rơi quanh em bé** (4 chỗ): Ngư Tinh c4 Mưa băng nhọn, Mộc Tinh c3 Mưa quả độc, Cua Đá Mưa tinh thể, Nấm Phồng Chúa Mưa bào tử.
- **Lao thẳng** (3 chỗ): Ngư Tinh c1 Đớp, Hồ Tinh c2 Vồ mồi, Heo Nanh Húc zíc zắc.

Mỗi kiểu chỉ GIỮ một chủ (chiêu đặc trưng nhất), các chỗ khác đổi chiêu mới:

| Con | Chiêu cũ | Chiêu mới |
|---|---|---|
| Hồ Tinh c5 | Bão hồ hoả | GIỮ (chủ kiểu toả tròn đạn) |
| Mộc Tinh c5 | Rừng gai | GIỮ (chủ kiểu vòng có khe) |
| Mộc Tinh c3 | Mưa quả độc | GIỮ (chủ kiểu mưa rơi) |
| Heo Nanh | Húc zíc zắc | GIỮ (chủ kiểu lao thẳng) |
| Ngư Tinh c1 | Đớp (lao thẳng) | **Bổ rìu san hô**: giơ rìu, bổ xuống trước mặt → vết nứt chạy thẳng 1 đường + mảnh san hô văng 2 bên vuông góc |
| Ngư Tinh c4 | Mưa băng nhọn | **Cột nước đuổi**: 6 cột nước phun lên nối tiếp theo đúng vết chân em bé (mỗi cột trễ 0,25 s), phải chạy liên tục |
| Ngư Tinh c5 | Xoáy nước (bung vòng) | **Xoáy hút**: xoáy kéo em bé về tâm 2 s (chạy ngược để thoát), hết xoáy nổ nhỏ ngay tâm |
| Hồ Tinh c2 | Vồ mồi (lao thẳng 2 lần) | **Vồ nhảy**: nhảy vòng cung lên cao, bóng tròn báo chỗ đáp dưới em bé, đáp xuống bung lửa vòng nhỏ; pha 2+ nhảy 2 lần |
| Hồ Tinh c4 | Vòng lửa ma | **Hồ ly phân thân**: 4 bóng cáo hiện ở 4 góc phòng, lần lượt lao chéo qua tâm (đường báo trước), một bóng là thật — đánh trúng bóng thật thì ngắt chiêu |
| Nấm Chúa chieu2 | Bão bào tử | **Nấm mẹ đẻ con**: mọc 3 nấm con quanh mình, sau 2,5 s nấm con chưa bị chém vỡ thì nổ khí độc |
| Cua Đá chieu2 | Mưa tinh thể | **Tường tinh thể**: dựng 2 bức tường tinh thể chia phòng (chắn đường, chắn đạn), 3 s sau vỡ bắn mảnh theo hướng vuông góc tường |
| Nấm Phồng Chúa | Mưa bào tử | **Nhảy dập**: nhảy 3 lần về phía em bé, mỗi lần đáp tạo vòng khí độc nhỏ (bóng báo chỗ đáp) |
| Cá Nóc Chúa | Gai xoáy | **Phồng lăn**: phồng tròn, lăn nảy dội tường 3 lần khắp phòng (đường báo trước từng đoạn) |
| Hũ Chúa | Vòng cầu lửa | **Đổ dầu châm lửa**: rót vệt dầu hình chữ thập quanh em bé, 1 s sau châm lửa cháy dọc vệt 2 s |

Luật: giữ sát thương mỗi lần trúng và thời gian chiêu xấp xỉ chiêu cũ (lệch ≤ 10%), báo trước rõ trên sàn (`bao_truoc.js`), né được; chiêu đặc biệt (kéo, chắn) không gây chết oan (kéo nhẹ, không kéo xuyên vùng đỏ đang nổ). Mọi chiêu mới phải ĐỐI XỨNG / căn tâm đúng (xem `trum-chet-pha3/bao-cao.md` — phiên đó vừa sửa lệch tâm, dùng lại cách căn của nó). Giữ tên chiêu ở `b.skillName`/`MINI_SK` và bản tiếng Anh. Dùng lại ảnh `hu-*` đã có; thiếu ảnh thì vẽ tạm tối giản + ghi prompt vào `PROMPT-ANH.md` (pixel art, nền #00FF00, dải 6–8 khung xếp ngang CÁCH XA NHAU, không bóng/chữ/logo; mỗi prompt một khối code + ảnh mẫu cần gửi). KHÔNG thêm ảnh vào build (ảnh máy chủ sát trần 26 MB). Cờ `?chieucu=1` dùng lại chiêu cũ.
Ảnh soát tĩnh (Pillow, KHÔNG chạy game): `xem-chieu-moi.png` — mỗi chiêu mới một ô sơ đồ vùng đánh/đường đi vẽ từ đúng số trong code.
**TUYỆT ĐỐI KHÔNG TEST** — chỉ ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Phiên `ky-nang-quai-vung` có thể đang sửa mobs.js: rebase giữ thay đổi của cả hai; game/dist lấy bản trên nhánh rồi build lại. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
