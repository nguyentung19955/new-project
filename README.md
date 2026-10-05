# Núi Cao Nước Dâng

Game thủ thành **màn hình ngang** cho điện thoại, chủ đề **Sơn Tinh – Thủy Tinh**, lối chơi lấy cảm hứng từ Dota 1. Người chơi vào vai Sơn Tinh, triệu hồi tướng Văn Lang dọc sông Đà để chặn quân Thủy Tinh tràn vào thành Phong Châu.

- Luật chơi và số liệu: [`GAMEPLAY.md`](GAMEPLAY.md). Mục 14 ghi những gì đã làm trong code.
- Tài liệu bàn giao thiết kế: [`docs/HANDOFF.md`](docs/HANDOFF.md).
- Trang **Đền Anh Hùng** (bản mẫu hoạt ảnh 16 tướng): `den-anh-hung.html`, mở từ màn Anh Hùng (16).
- Ảnh vẽ tay (AI): thả PNG vào `assets/` theo đúng tên trong [`docs/ASSETS.md`](docs/ASSETS.md); chưa có thì game dùng hình vector.

## Tính năng chính

- **16 tướng:** 6 tướng cơ bản và 10 tướng huyền thoại (Thánh Gióng, Lạc Long Quân, Thần Kim Quy, Thạch Sanh, Cao Lỗ, Mai An Tiêm, Âu Cơ, Chử Đồng Tử, Tiên Dung, Lang Liêu). Mỗi tướng có Q W E R, tướng huyền thoại có thêm đặc trưng riêng.
- **Nâng cấp bằng vàng:** lên cấp tướng, mở khóa W/E/R, tiến hoá ★ ★★ ★★★.
- **Nước Dâng & Mọc Núi:** ô đặt tướng chia 3 bậc độ cao. Sau mỗi đợt boss nước dâng một bậc, tướng ở ô ngập bị sa lầy. Kỹ năng Mọc Núi cứu ô.
- **Đồ đổi hình dạng tướng** (vũ khí, mũ, giáp; Bộ Lạc Long mọc cánh rồng):
  - Lò đúc đồng: Công thức, Cửa hàng, Hũ báu.
  - Túi 40 ô: cường hóa +1…+5, thăng phẩm, khóa, đổi ra vàng theo chất lượng.
- **3 boss** (Thuồng Luồng, Hà Bá, Thủy Tinh), sính lễ Vua Hùng ban thưởng, Núi Tản Viên 5 giai đoạn.
- **Chiến dịch 8 ải** dọc sông Đà, 1–3 sao, tiến trình lưu trên trình duyệt. Có màn mở đầu kể chuyện Vua Hùng kén rể.

## Chạy thử

Không cần build, chỉ cần mở `index.html`. Để chơi trên điện thoại cùng mạng wifi:

```bash
npx serve .          # hoặc: python3 -m http.server 8000
```

**Khi cập nhật game:** tăng số `?v=` của các file CSS/JS trong `index.html` (và dòng "Phiên bản" trên menu) để Safari tải bản mới.

## Cấu trúc code

| File | Nội dung |
|---|---|
| `js/art.js` | Hình vector lấy từ file thiết kế: 64 icon kỹ năng, icon đồ, quái, boss, 16 tướng chia khớp, minh họa menu / truyện / bản đồ. Sinh tự động, không sửa tay. |
| `js/data.js` | **Toàn bộ dữ liệu:** tướng, kỹ năng, đồ, công thức, quái, boss, giá nâng cấp, các ải, Núi Tản Viên. Cân bằng game chủ yếu sửa file này. |
| `js/game.js` | Logic: dòng sông, ô 3 bậc, đợt quái, tướng tấn công, hào quang, chiêu thức (`SKILL_CASTS`), Nước Dâng, túi đồ, boss, sính lễ. |
| `js/render.js` | Vẽ bản đồ, ô đặt tướng, tướng (ghép phần vector + đồ mặc), quái và boss. |
| `js/ui.js` | Menu, mở đầu, chiến dịch, màn chơi, các màn hình trong trận, sính lễ, thắng / thua, cài đặt. |
| `js/main.js` | Co giãn theo màn hình, chạm và kéo tướng, vòng lặp vẽ, hiệu ứng chiêu thức. |

Giao diện dựng ở khung thiết kế 932 × 430 rồi phóng to theo màn hình. Bản đồ dùng tọa độ logic 1280 × 590 (= tọa độ thiết kế × 1280/932).

## Hướng phát triển tiếp

- Đóng gói Android / iOS bằng Capacitor (giữ nguyên code).
- Khi cần đồ họa và hoạt ảnh mạnh hơn: chuyển sang Phaser 3 + Spine / DragonBones như tài liệu bàn giao đề xuất. `data.js` và `art.js` dùng lại được.
- Bản đồ riêng cho từng ải, âm thanh, cân bằng số liệu qua chơi thử.
