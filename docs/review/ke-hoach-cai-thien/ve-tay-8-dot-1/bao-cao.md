# Vẽ tay 8 đợt 1 + chạy mới của Cu Tí (16/10)

Đã chờ đủ 2 báo cáo `kiem-moi-16-10/bao-cao.md` (14:32) và `con-ve-tay-9/bao-cao.md` (14:53) rồi mới sửa game. **Không chơi thử**: chỉ dựng cảnh bằng lệnh / phím giả rồi chụp ảnh, GIF.

## Tóm tắt

| Việc | Kết quả | Cờ về bản cũ |
|---|---|---|
| 1. Chạy mới | Hàng chạy 12 khung mới thay hàng cũ (bộ Ninja). Cỡ = hàng đứng mới, ×1,2 như mọi hàng. Trượt chân khi chạy **20 % → 15 %**, chạy + chém **33 % → 26 %**. | `?chaymoi=0` (hoặc `?hangcu=1`) |
| 2. HUD | 5 ảnh vào game: ruột thanh máu / mana / tiến độ, thanh máu quái nhỏ, viên Linh khí, sọc + vòng của vùng báo nguy hiểm. | `?vecode=1` |

Không đổi luật, số liệu, thời lượng, vùng trúng. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Việc 1 — Chạy mới

- **Cắt**: `docs/anh-goc/zed/moi16/cat-chay-12k.py`. Khung sát nhau nên công cụ cũ gộp nhầm khung 8 + 9. Mỗi khung vốn là một khối liền, cách nhau ít nhất 1 cột #00FF00, nên chỉ cần tách theo cột nền. Kết quả **ĐẠT, đủ 12 khung, không phải chia đều**.
- **Khung 2**: mảng trắng trên bắp tay sau vai được tô lại bằng màu da lấy từ khung 1 và 3 (383 điểm ảnh, `sua-chay-k2.py`). Ảnh gốc giữ ở `goc-khung-02.png`.
- **Khung 7–12 gần chép khung 1–6**: dùng y như vậy, không sửa.
- **Cỡ**: co theo cỡ đầu như hàng chạy cũ. Người cao 62 điểm ảnh ô 96 (chạy cũ 62, đứng mới 64, vì dáng chạy chùng gối). Đầu bằng hàng đứng.
- **Neo vũ khí** (`gan-vk/neo-chay-16-10.py` → `neo.json`, 4 vũ khí × 12 khung): nắm tay phải là tay quấn băng ở sau hông.
  - Kiếm −14 … −17°, phi tiêu −19 … −22° (cùng luật với hàng đứng).
  - Thương / búa: cán đi qua hai nắm tay.
  - **Khung 8**: tay phải vung ra trước bụng, nên vũ khí nhảy ra trước trong 1 khung. Hàng cũ ở khung 2 cũng bị vậy.
- **Chạy hai tay (thương / búa)**: **giữ hàng cũ `chay2tay`**. Ở hàng mới, hai nắm tay đánh xa nhau (một ở hông sau, một ở trước ngực) và tay phải đổi chỗ ở khung 8, nên cán bị xoay và nhảy, trông không giống cầm hai tay. Nếu muốn xem hàng mới cầm thương: `?chay2tay=0`.
- **Nhịp chân theo quãng đường** (của phiên cu-ti-to-muot): đo lại sải chân. Bàn chân trụ lùi trung bình 4,0 điểm ảnh ô 96 mỗi khung, hàng cũ 3,94 (`cong-cu/do-sai.py`). Thử nhịp trên chính các khung, trượt ít nhất khi sải nằm trong khoảng 32–36, nên chọn **SAI.chay16 = 34** (hàng cũ vẫn 36,8).
- **Chạy + chém**: đo lại điểm eo trên khung chạy mới (`docs/anh-goc/zed/eo-chay-16-10.py`, ảnh `ghep-eo-chay.png`).

**Trượt chân** (`cong-cu/do-truot.py`, trôi ròng của bàn chân trụ so với quãng đã chạy, quay headless 80 nhịp):

| | Trước (`?chaymoi=0`) | Sau |
|---|---|---|
| Chạy (kiếm / phi tiêu) | 20,4 % | **15,0 %** |
| Chạy + chém | 33,3 % | **25,7 %** |
| Chạy lùi + chém | 32,1 % | 46,5 % (ít lần chạm, chỉ 3 / 6 lần đo) |
| Chạy cầm thương / búa (hàng hai tay cũ) | 76,5 % | 76,5 % (không đổi) |

GIF (trái TRƯỚC, phải SAU): `chay-truoc-sau-x1.gif`, `chay-truoc-sau-x3.gif`, `chay-chem-truoc-sau-x1.gif`.

## Việc 2 — 5 ảnh HUD

Cắt bằng `cong-cu/dung-hud.py --ghi`, cách tách nền giống công cụ vẽ tay 6. Thu nhỏ bằng nearest neighbor: mỗi điểm đích lấy đúng 1 điểm gốc ở giữa ô, nên cạnh pixel vẫn sắc. Mép trộn nền xanh được đưa về màu sạch gần nhất của chính ảnh.

| Ảnh | Cỡ (net 2) | Chỗ thay trong game |
|---|---|---|
| `gd-ruot-thanh` | 5 dải 64×8 | `ui_theme.js` `T.bar`: ruột thanh máu (đỏ), mana (lam), tiến độ (vàng), phần đang hồi (xanh lá), chớp khi trúng đòn (trắng). Thanh trùm và thanh tự chọn màu vẫn vẽ code. |
| `gd-mau-quai-nho` | 3 dải 32×4 | `stage.js` `mobBars`: đỏ quái thường, cam tinh anh, vàng nhạt phần vừa mất. Cũng dùng cho phần vừa mất của thanh lớn. |
| `gd-icon-linh-khi` | 16×20 | `vk_moi.js` `gem`: HUD, Lò rèn, kết quả |
| `hu-bao-vung-soc` | 4 khung 32×32 lặp | `bao_truoc.js` kiểu điểm ảnh: sọc chéo thay chấm lưới thưa |
| `hu-bao-vung-vong` | 6 khung 64×40 | `bao_truoc.js` kiểu điểm ảnh: vùng tròn có vòng đầy dần theo tiến độ báo trước |

- **Sọc (`hu-bao-vung-soc`)**: ảnh gen mỗi khung không vuông (543×724). Lấy đúng 1 chu kỳ sọc (217 điểm ảnh gốc) thu về 16×16, rồi ghép 2×2, nên lặp không lộ đường nối. Khung 1–2 vàng nâu đã nhuộm về đỏ của khung 3, vẫn tối hơn một chút để giữ nhịp sáng dần.
- **Vùng báo**: kiểu mặc định của game là ảnh hoạt ảnh `gd-bt-*` (đã có từ trước), nên **mặc định trông y như cũ**. Sọc và vòng mới chỉ hiện ở kiểu điểm ảnh: lúc ảnh `gd-bt-*` chưa tải xong, hình chưa có ảnh, hoặc `?baoanh=0`. Vùng va chạm và thời gian không đổi; chỉ đổi màu điểm ảnh bên trong vùng.

Ảnh soát (trên TRƯỚC, dưới SAU): `truoc-sau-hud.png`, `truoc-sau-hud-phong.png` (phóng thanh máu + Linh khí), `truoc-sau-quai-nho.png`, `truoc-sau-bt-tron.png`, `truoc-sau-bt-trum.png` (Hổ Lửa), `truoc-sau-bt-trum-lau.png` (Hồ Tinh). Ảnh vùng báo có 4 ô: hàng trên là mặc định, hàng dưới là `?baoanh=0`.

## Kiểm tra

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. Người chơi tải **16,50 / 20 MB** (trước 16,41). Bản một tệp 28,85 / 30 MB. Tấm `zed-moi` 457 → 489 KB (nén 256 màu như các lần trước). 5 ảnh HUD tổng cộng ~18 KB.
- `tests/smoke.py`: `errors: []`.
- Quay / chụp với mặc định, `?chaymoi=0`, `?chay2tay=0`, `?hangcu=1&vecode=1`, `?baoanh=0`: 0 lỗi JS.

## Ảnh còn lỗi, nên gen lại

1. **`gd-icon-linh-khi`**: ảnh gen dẹt hơn đích (khoảng 19×34 khối so với 16×20). Thu thẳng về 16×20 nên viên đá hơi bè, nét viền mất vài khối. Prompt cũ thêm câu: *"exactly 16x20 pixel grid, 1 px dark outline, chunky pixels"*.
2. **`hu-bao-vung-soc`**: khung không vuông, sọc không lặp liền (đã cắt theo chu kỳ để chữa). Gen lại cho chuẩn: *"…exactly 32x32 px per frame, seamless tile: stripes continue across all 4 edges, same red hue (#ff3a22, #ff7a5a) in every frame, only brightness pulses"*.
3. **Hàng chạy, khung 8**: tay phải vung ra trước bụng (các khung khác ở sau hông), nên vũ khí nhảy 1 khung. Nếu gen lại thì giữ khung 8 giống khung 2 (tay phải ở sau hông).
4. `gd-ruot-thanh`, `gd-mau-quai-nho`, `hu-bao-vung-vong`: dùng được, không cần gen lại.

## Công cụ

- `docs/anh-goc/zed/moi16/cat-chay-12k.py`, `sua-chay-k2.py`
- `docs/anh-goc/zed/gan-vk/neo-chay-16-10.py`
- `docs/anh-goc/zed/eo-chay-16-10.py`
- Thêm dòng `chay~16` vào `docs/anh-goc/zed/dung-zed-game.py`, rồi nén `zed-moi` bằng `npc-ban-do-bao-truoc/cong-cu/nen-anh.py`. Chỉ giữ thay đổi của `zed-moi`; tấm các bộ khác không đổi.
- Trong `cong-cu/`:
  - `dung-hud.py`: cắt 5 ảnh HUD
  - `soat.py`, `ghep-anh.py`: ảnh soát
  - `quay.py` (chép từ cu-ti-to-muot, thêm chạy cầm thương / búa / phi tiêu), `ghep-gif.py`: GIF
  - `do-sai.py`, `do-truot.py`: số đo
