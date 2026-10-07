# Thần Thoại Việt

> Tên cũ: *Núi Cao Nước Dâng* (đổi ở phiên bản 145 vì game giờ gồm nhiều truyền thuyết: Sơn Tinh – Thủy Tinh, Thạch Sanh, Thánh Gióng, Lạc Long Quân, An Dương Vương). Mã nội bộ (`nuicao.v1`, `vn.nuicao.game`, dự án Firebase) giữ nguyên để không mất tiến trình.

Game thủ thành **màn hình ngang** cho điện thoại, chủ đề **truyền thuyết Văn Lang – Âu Lạc** qua 5 chương: Sơn Tinh – Thủy Tinh (giữ thành Phong Châu trước quân Thủy Tinh), Thạch Sanh (giữ miếu, bản làng trước yêu tinh rừng), Thánh Gióng (giữ làng Phù Đổng trước giặc Ân), Lạc Long Quân (giữ miền sông biển trước yêu tinh biển), An Dương Vương (giữ thành Cổ Loa trước quân Triệu Đà), cùng chế độ Vô tận. Lối chơi lấy cảm hứng từ Dota 1: triệu hồi tướng dọc đường quái, ghép sao, hợp thể.

- Luật chơi và số liệu: [`GAMEPLAY.md`](GAMEPLAY.md). Mục 14 ghi những gì đã làm trong code.
- Tài liệu bàn giao thiết kế: [`docs/HANDOFF.md`](docs/HANDOFF.md).
- Trang **Đền Anh Hùng** (bản mẫu hoạt ảnh 16 tướng): `den-anh-hung.html`, mở từ màn Anh Hùng (16).
- Ảnh vẽ tay (AI): thả PNG vào `assets/` theo đúng tên trong [`docs/ASSETS.md`](docs/ASSETS.md); chưa có thì game dùng hình vector.

## Tính năng chính

- **16 tướng:** 6 tướng cơ bản và 10 tướng huyền thoại (Thánh Gióng, Lạc Long Quân, Thần Kim Quy, Thạch Sanh, Cao Lỗ, Mai An Tiêm, Âu Cơ, Chử Đồng Tử, Tiên Dung, Lang Liêu). Mỗi tướng có Q W E R, tướng huyền thoại có thêm đặc trưng riêng.
- **Nâng cấp bằng vàng:** lên cấp tướng, mở khóa W/E/R, tiến hoá ★ ★★ ★★★.
- ~~**Nước Dâng & Mọc Núi**~~ (bỏ từ phiên bản 36): ô đặt tướng không còn bị ngập, không còn sa lầy / Mọc Núi. Màn thắng / thua, lời nhắc đầu trận, màn phần thưởng hạ boss hiện theo chương (từ phiên bản 159).
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
