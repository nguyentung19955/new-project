# Báo cáo phiên PixelLab HUD — 05/11/2026

Yêu cầu của chủ game (05/11 14:49): "Nhớ hud theo pixel lab nhé" — vẽ lại toàn bộ HUD trong trận bằng PixelLab cho hợp với vũ khí và quái nấm PixelLab mới.

## Kết quả: CHƯA LÀM ĐƯỢC — thiếu khoá PixelLab

- Máy chạy phiên này **không có khoá PixelLab** (tệp `/root/.plk` không tồn tại; khoá cũng không có trong repo — đúng luật, không được để khoá trong repo).
- Mỗi phiên chạy trên một máy mới, nên khoá của các phiên trước (vũ khí, quái nấm) **không còn**.
- Vì vậy phiên **dừng lại**: không vẽ ảnh, không gọi PixelLab, **không sửa mã game**, không đổi HUD đang chạy. Game trên web giữ nguyên.
- Chi phí PixelLab phiên này: **0 lượt** (không gọi API nào, không kiểm được `GET /balance` vì không có khoá).
  Số dư gần nhất ghi ở báo cáo quái nấm: còn khoảng 6.295,55 / 10.000 lượt.

### Chủ game cần làm

1. Vào tài khoản pixellab.ai → lấy **khoá API**.
2. Gửi khoá cho phiên mới dưới dạng **tệp .txt đính kèm** (không dán vào repo, không dán vào báo cáo).
   Phiên mới sẽ lưu vào `/root/.plk` (chỉ máy đó đọc được) rồi chạy lại việc này.
3. Nếu muốn việc chạy theo lịch tự động, phải đính kèm khoá ở mỗi lần chạy — máy chạy lịch không giữ khoá giữa các lần.

## Việc đã làm được (không tốn lượt PixelLab): kiểm kê HUD trong trận

Để phiên sau vào việc nhanh. Kích thước là điểm ảnh gốc của ảnh (`rong × cao` trong `game/art/custom/*.sprite.json`).

| Mảnh HUD | Mã ảnh | Kích thước | Mã vẽ ở |
|---|---|---|---|
| Khung thanh máu | `gd-khung-mau` | 33×11 | `stage.js`, `ui_theme.js` |
| Ruột thanh (máu/linh lực) | `gd-ruot-thanh` | 32×20 | `stage.js`, `ui_theme.js` |
| Khung thanh linh lực (mana) | `gd-khung-mana` | 32×8 | `ui_theme.js` |
| Khung thanh kinh nghiệm | `gd-khung-xp` | 28×7 | `ui_theme.js` |
| Thanh trên cùng + vạch chia | `gd-thanh-tren`, `gd-thanh-tren-vach` | 61×16, 7×16 | `ui_theme.js` |
| Máu quái thường | `gd-khung-mau-quai` | 82×4 | `stage.js`, `ui_theme.js` |
| Khung quái tinh anh | `gd-khung-tinh-anh` | 44×22 | `ui_theme.js` |
| Thanh máu trùm (lớn / nhỏ) + ruột | `gd-khung-trum`, `gd-khung-trum-nho`, `gd-ruot-thanh-trum` | 60×30, 52×26, 32×5 | `ui_theme.js` |
| Khung nhỏ (bảng phụ) | `gd-khung-nho` | 64×19 | `ui_theme.js` (+ hành trang, luyện) |
| Nút đánh theo vũ khí (kiếm/giáo/búa/cung) | `gd-nut-danh-*` | 24×24 | `btn_art.js` |
| Nút chiêu đặc biệt theo vũ khí | `gd-nut-dac-biet-*` | 24×24 | `btn_art.js` |
| Nút né | `gd-nut-ne` | 24×24 | `btn_art.js` |
| Nút nổ nguyên tố Lửa / Độc / Băng | `gd-nut-chuong-fire/poison/ice` | 24×24 | `btn_art.js` |
| Nút bình máu | `gd-nut-binh-mau` | 24×24 | `btn_art.js` |
| Nút tạm dừng | `gd-nut-tam-dung` | 24×24 | `btn_art.js` |
| Nút đổi vũ khí | `gd-nut-doi` | 40×40 | `slice.js` |
| Nền nút vuông (ô vũ khí) | `gd-nut-vuong` | 42×42 | `btn_art.js`, `slice.js` |
| Khung lông / bóng khung (trang trí) | `gd-long-khung`, `gd-bong-khung` | 16×16, 24×24 | `ui_theme.js` |
| Khung bản đồ nhỏ | `gd-khung-ban-do` | 380×242 | `minimap.js`, `ui_theme.js` |
| HUD ChatGPT bản 2 (`?hudmoi=1`, mặc định tắt) | `gd-hud2-thanh-mau`, `gd-hud2-thanh-linh-luc`, `gd-hud2-o-vk(-2)`, `gd-hud2-nut-tron(-2)`, `gd-hud2-bang-giay` | 80×14, 67×12, 19×19/20×19, 38×38, 129×28 | `stage.js` dòng ~1471–1534 |

Ghi chú cho phiên sau:
- Tên ảnh `gd-nut-chuong-*` có chữ "chuông". Luật mới: **không dùng hình chuông/tiếng vọng**. Khi vẽ bộ PixelLab, nút nổ nguyên tố phải là biểu tượng lửa / giọt độc / tinh thể băng, không phải hình chuông.
- Chưa kiểm phần biểu tượng sát thương / nhặt đồ và chỉ báo phòng/ải (vẽ bằng chữ hay ảnh) — phiên sau tra thêm trong `stage.js`, `fx*.js`, `do_roi.js`.
- Kế hoạch giữ nguyên như đề bài: vẽ bằng `edit-image-pixen` từ chính ảnh hiện tại (giữ đúng hình và lề 9 mảnh), 2–3 hạt giống mỗi mảnh, viền tối `#18202A`, nền trong suốt, không chữ; ảnh gốc lưu `docs/anh-goc/pixellab-hud/`; bật mặc định, cờ quay lui `?hudcu=1`; quyết `?hudmoi=1` giữ hay bỏ trong báo cáo.
- Không đụng tệp của phiên F4 (`vien_vk.js`, bộ nạp, tách tấm ảnh lớn, `cong_kiem.sh`).

## Kiểm tra

- Không sửa `game/**` nên không chạy cổng kiểm và không chụp ảnh so sánh (không có gì mới để so). Commit này chỉ thêm báo cáo, **không kích hoạt đăng web**.

## Quay lui

- Không có thay đổi game. Nếu cần bỏ báo cáo: revert commit này.

## Lần chạy lại theo lịch — 05/11/2026 (phiên session_017N7QXqfkK27mirk6Hvvt7g)

- Kiểm lại: máy chạy lần này **vẫn không có `/root/.plk`** (và không có khoá trong biến môi trường). Dừng đúng như đề bài.
- Không gọi PixelLab (chi phí **0 lượt**), không sửa `game/**`, HUD đang chạy giữ nguyên, không đăng web mới.
- Bảng kiểm kê HUD ở trên vẫn dùng được cho phiên sau.
- **Chủ game cần làm:** gửi khoá PixelLab kèm lần chạy tiếp (tệp .txt đính kèm). Lịch chạy tự động sẽ còn dừng ở bước này cho tới khi có khoá —
  nên tạm tắt lịch hoặc chạy lại bằng tay khi đã có khoá.
