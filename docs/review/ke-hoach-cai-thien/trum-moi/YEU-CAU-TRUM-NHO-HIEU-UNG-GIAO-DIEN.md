# Đưa 3 trùm nhỏ mới + 7 hiệu ứng + 4 khung giao diện vào game (14/10 08:05)

Đọc trước `bao-cao-ngu-tinh.md`, `bao-cao-moc-ho-hieu-ung-nen.md` và dùng lại `cong-cu/` (dung-ngu-tinh.py, dung-moc-ho.py, dung-hieu-ung-trum.py, neo.py).

## 1. Ba trùm nhỏ (thiết kế mới hoàn toàn) — pha 1 + pha 2 nổi giận dưới 50% máu (chủ dự án chọn "a")
Khung đã cắt sẵn ở `docs/anh-goc/trum-moi/<ma>/<ten>-cat/<ten>/khung-NN.png`:
- `nam-chua/` Nấm Chúa: pha 1 `1-dung 2-di 3-bao-don 4-danh 5-trung-don 6-chet`, pha 2 `p2-1-dung p2-2-bao-don p2-3-danh p2-4-trung-don`. LƯU Ý: `p2-2-bao-don` vẽ quay mặt sang TRÁI → lật ngang. Hàng đánh p2 vệt quét bị lẹm mép (chấp nhận).
- `cua-da/` Cua Đá: cùng cấu trúc. Cua vẽ chính diện hơi chếch — giữ nguyên, không lật.
- `ho-lua/` Hổ Lửa: cùng cấu trúc.
- Ảnh mẫu cả con: `nam-chua-p1/p2.png`, `cua-da-p1/p2.png`, `ho-lua.png`, `ho-lua-p2.png`.
Tìm trong code các trùm nhỏ này đang dùng mã sprite nào (grep `G.MOB_ART`, `monster_art.js` phần trùm nhỏ, tên namChua / cuaDa / hoLua hoặc tương tự) và thay ảnh: co từng hàng cho đầu/thân cùng cỡ, chân cùng đường đất, cỡ đứng ≈ con cũ, giữ `rong`/`cao`/hộp va chạm. Thêm pha 2: dùng cơ chế pha có sẵn (`PHA_MA` trong sprite_custom.js hiện chỉ cho nguTinh|mocTinh|hoTinh — mở rộng) và đổi sang ảnh pha 2 khi máu < 50% (nếu trùm nhỏ chưa có pha thì thêm cờ đổi ảnh đơn giản, KHÔNG đổi chiêu/số). Ghép khung chạm đúng mốc gây sát thương như các trùm lớn. Không đổi số cân bằng. Cờ tắt `?trumnho=0`.

## 2. Bảy hiệu ứng (thay phần vẽ code, giữ bản code dự phòng) — `docs/anh-goc/trum-moi/hieu-ung/<ma>-cat/`
| Mã | Khung | Thay chỗ |
|---|---|---|
| hu-dap-san | 6 | Cua Đá đập sàn (`monster_art` mini-boss `dapSan`) |
| hu-nam-moc | 6 | Nấm Chúa hàng nấm trồi (`hangNo`/`namNho`) |
| hu-phun-lua-quat | 6 | Hổ Lửa phun lửa quạt (chiêu 2), xoay theo hướng |
| hu-hat-linh-khi | 4 lặp | Hạt linh khí bay từ quái về thanh (`fx.js` ty:'orb'), ảnh trắng — nhuộm theo hệ |
| hu-nut-san | 3 | Vết nứt sàn sau va chạm vật lý (`fx.js crack`). Khung 2–3 ảnh AI bị pha xanh → chỉ dùng KHUNG 1 và mờ dần bằng alpha |
| hu-quai-hien | 6 | Quái xuất hiện (`CH.spawn`) |
| hu-quai-dap | 5 | Quái thường đập đất (`DON.dap`, Tượng Đá) |
Cờ tắt chung `?hutrum=0` như đợt trước (hoặc `?huthem=0` riêng).

## 3. Bốn khung giao diện (9-slice) — `docs/anh-goc/giao-dien/` (đã tách nền, PNG trong suốt; `*-goc.png` là ảnh gốc)
- `gd-khung-bang.png`: khung bảng (`T.panel`) — 4 góc trống đồng chim Lạc, viền hoa văn lặp, lòng nâu.
- `gd-nut-chu-4-mau.png`: 4 nút cùng cỡ trái→phải: thường (nâu gỗ), chính (đỏ son), nguy (đỏ sẫm), chọn (vàng) → `T.btn`/`T.sbtn`/`T.tab`.
- `gd-khung-thoai.png`: hộp thoại NPC (`T.dialog`), ô vuông trái đặt chân dung.
- `gd-thanh-tren.png`: thanh tài nguyên trên cùng (`T.topBar`), 4 ô.
Thu nhỏ về cỡ pixel game (nét ×2 như ảnh khác, giảm màu), cắt 9 mảnh (góc giữ nguyên, cạnh lặp/giãn, lòng giãn), vẽ thay khung code khi có ảnh; chữ và biểu tượng vẫn vẽ như cũ, đảm bảo chữ đọc rõ trên lòng khung (màu chữ tương phản). Không làm vỡ bố cục nút/chạm (hộp bấm không đổi). Cờ tắt `?khunganh=0`.

## Kiểm
**TUYỆT ĐỐI KHÔNG TEST** (không Playwright, không chạy game) — chỉ xử lý ảnh, ảnh soát TĨNH ghép bằng script, node --check, build.py (timeout dài). Ảnh soát trong thư mục này: `xem-trum-nho.png` (mọi hàng × 2 pha × 3 con, cùng tỉ lệ, kèm con cũ), `xem-hieu-ung-them.png`, `xem-giao-dien.png` (dựng thử 1 bảng + nút + hộp thoại + thanh trên bằng script).
Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Không chép apiKey trong game/js/firebase-config.js. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`. Xung đột game/dist khi rebase: lấy bản trên nhánh rồi build lại. Push bị từ chối thì pull --rebase rồi push lại.
Viết `bao-cao-trum-nho-hieu-ung-giao-dien.md` (tiếng Việt, ngắn, có mã commit, mục "Cần chủ dự án xem khi chơi").
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
