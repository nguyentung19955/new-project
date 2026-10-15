# Con vẽ tay — đợt 2: đưa 4 ảnh mới vào game + XOÁ hình vẽ code còn lại

Chủ game hỏi: "Mấy hình vẽ tay xoá đi được chưa". Mục tiêu: trong trận KHÔNG còn hình khối vẽ bằng code (ô vuông, vệt, mảnh)
mà người chơi nhìn thấy được. Đọc trước `bao-cao.md` cùng thư mục (đợt 1, commit 1cb25b3e).

## 1. Đưa 4 ảnh mới vào game (ảnh gốc ở docs/anh-goc/hieu-ung-ky-nang/dot2/)
Cắt như phiên `hieu-ung-ky-nang` (xem docs/review/ke-hoach-cai-thien/hieu-ung-ky-nang/cong-cu/dung-hieu-ung.py), net 2, nền #00FF00 khử viền xanh.
| Ảnh gốc | Mã | Khung | Thay cho (xem bao-cao.md mục 4) |
|---|---|---|---|
| giot-doc-san.png | hu-giot-doc-san | 5 | giọt độc đọng vệt 3×1 (fx.js loại 5 độc, fx_he.js độc) |
| manh-da.png | hu-manh-da | 6 | mảnh đá / vụn nảy (fx.js loại 8) |
| vet-chay.png | hu-vet-chay | 4 | vệt cháy `scorch` |
| ray-bang.png | hu-ray-bang | 5 | mảnh băng / sương rơi (vùng băng nổ, shatter, quái đóng băng rụng hạt) |
Lưu ý: ray-bang có khói xanh lục nhạt mờ (AI tô) → khử sang trắng/xanh băng hoặc bỏ, không để ám xanh lục. manh-da khung 1 và 6 rất nhỏ — giữ đúng.
Cỡ trong game theo bảng mục 4 của bao-cao.md (giọt độc 16×8, mảnh đá 24×16, vết cháy 32×16, mảnh băng 16×16 điểm ảnh game).

## 2. Xoá hình vẽ code còn lại
- Mọi nhánh trong bao-cao.md đợt 1 đã có ảnh: bỏ hẳn đường vẽ code dự phòng hiện được khi ảnh đang tải (ảnh chưa tải thì không vẽ gì, thay vì vẽ ô vuông).
- 10 hiệu ứng chưa có ảnh (#4, #6–#14 mục 4): nếu là hạt / ô vuông / vệt vẽ code → TẮT (không vẽ), trừ khi tắt làm mất tín hiệu né đòn
  (vùng báo trước, chớp báo đòn trùm) — những cái đó giữ. Riêng quầng nổi giận, vòng hồi máu, tường sóng Ngư Tinh: nếu tắt thì mất thông tin
  → thay bằng ảnh có sẵn gần nghĩa nhất (hu-va-cham nhuộm, hu-vung-*, ...) hoặc giữ tạm, ghi rõ trong báo cáo.
- Mục "Có ảnh nhưng CHƯA nối" (bùa giả Mộc Tinh c4 → tắt; Quạt đuôi Hồ Tinh → hu-tram-nguyet-fire; Ngư Tinh c3 → hu-gai-bang;
  nổ cảm tử → hu-no-*): LÀM luôn, đo cỡ/tâm cho khớp vùng va chạm.
- Không đổi luật chơi: vùng va chạm, sát thương, thời gian giữ nguyên.
- Một cờ quay lui chung: `?vetaycu=1` bật lại toàn bộ vẽ code cũ.

## 3. Kiểm
KHÔNG TEST game — chỉ đọc code, node --check, build.py, ảnh soát tĩnh xem-dot2.png (4 ảnh mới cỡ game + trước/sau các chỗ đã xoá).
Dung lượng người chơi tải ghi trước/sau (trần 20 MB).

Ràng buộc: không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao-2.md cùng thư mục, push, tự dừng.
