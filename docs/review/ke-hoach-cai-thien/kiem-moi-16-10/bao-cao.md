# Kiếm 1 + kiếm 3 mới của Cu Tí (16/10) — đã đưa vào game

Ảnh gốc: `docs/anh-goc/cu-ti-hang-moi-16-10/08-kiem-1-5k-v2.png` (5 khung) và `10-kiem-3-6k-v2.png` (6 khung), chủ game gen theo khung người đặc `docs/khung-que-8-huong/nguoi-dac/kiem-1-e.png`, `kiem-3-e.png`.

## Tóm tắt

- **Kiếm 1 mới và kiếm 3 mới đã thay hàng cũ** (bộ Ninja). Kiếm 2 giữ hàng cũ. Bộ Rừng / Biển / Lâu đài chưa có ảnh mới → giữ hàng cũ.
- **Cờ `?kiemmoi=0`**: về kiếm 1 / kiếm 3 cũ (đứng, lộn, trúng đòn mới vẫn giữ). `?hangcu=1` vẫn về toàn bộ hàng cũ như trước.
- **Cân bằng không đổi**: thời lượng đòn (kiếm 1 0,3 giây, kiếm 3 0,46 giây), lúc chạm (u = 0,45), vùng trúng, sát thương — không sửa dòng nào trong moves.js / combat.js. Chỉ đổi HÌNH.
- Kiếm gắn vào tay phải theo neo mới từng khung, dùng cho **cả 4 cấp kiếm** (Trắng, Mầm, Thành hình, Thức tỉnh) — xem `luoi-kiem-1.png`, `luoi-kiem-3.png`. (Đòn kiếm 1/2/3 chỉ chạy khi cầm kiếm; thương / búa / phi tiêu có hàng đòn riêng, không dùng hai hàng này.)

## Đã làm

1. **Cắt khung** bằng công cụ có sẵn `docs/anh-goc/zed/cat-diem-anh.py` (tách theo cột nền xanh #00FF00, khung không cách đều): cả 2 tấm **ĐẠT**, đúng 5 / 6 khung → `docs/anh-goc/zed/moi16/08-kiem-1-5k-v2-gif/`, `10-kiem-3-6k-v2-gif/`.
2. **Cỡ người**: dựng bằng `docs/anh-goc/zed/dung-zed-game.py` như hàng đứng mới (ô 96, ×1,2 của cu-ti-to-muot áp lúc vẽ như mọi hàng). Co sao cho **đầu bằng đúng đầu hàng đứng mới** (25,2 điểm ảnh ô 96). Cao người: kiếm 1 = 65, kiếm 3 = 64, đứng = 64.
3. **Căn theo bàn chân trước** (cả 2 hàng): bàn chân trước đặt đúng chỗ bàn chân trước lúc đứng → vào đòn, giữa đòn, ra đòn chân trước không trượt. Kiếm 3 khung 1, 5, 6 (đứng hẹp chân) thì chân sau đổi chỗ theo ảnh, chân trước đứng yên.
4. **Neo kiếm** (`docs/anh-goc/zed/gan-vk/neo-kiem-16-10.py` → `neo.json`): nắm tay phải đo từng khung; góc kiếm đo theo vạch đỏ của khung người đặc.

   | Khung | Kiếm 1: góc | Kiếm 3: góc |
   |---|---|---|
   | 1 | −125° (giơ ra sau đầu, vẽ sau thân) | 175° (chĩa ra sau) |
   | 2 | −80° (giơ cao) | 155° (thấp sau lưng, vẽ sau thân) |
   | 3 | **0° ★ chạm, tay vươn ngang** | −70° (giơ lên trước mặt) |
   | 4 | 60° (chém xuống) | **0° ★ đâm ngang** (vạch đỏ quá ngắn, đọc tay) |
   | 5 | −45° (thu thế) | 120° (theo đà xuống) |
   | 6 | — | 110° (giữ thế) |

   (0° = mũi chỉ ra trước, dương = chúc xuống.) Nắm chuôi / nắm tay ôm cán dùng chung đường cũ (nam_chuoi.py).
5. **Game** (`game/js/zed_moi.js`): hàng `kiem_1~16`, `kiem_3~16` dùng thay `kiem_1`, `kiem_3` (cùng cách hàng đứng mới). Kiếm 3 mới có đòn đâm ở **khung 4** nên dời mốc khung: `[0; 0,15; 0,3; 0,45; 0,65; 0,82]` → khung 4 hiện đúng lúc chạm cũ 0,45 (kiểm bằng hàm chọn khung của game: u 0,45 → khung 4; `?kiemmoi=0` → khung 3 như cũ). Kiếm 1: khung 3 chạm, mốc giữ nguyên.
6. **Chạy + chém kiếm 1**: điểm eo đo lại trên khung mới (`docs/anh-goc/zed/eo-kiem-16-10.py`, chèn vào `zed_eo_data.js`, số cũ không đổi) — ảnh `ghep-eo-kiem-1.png`. Kiếm 3 vẫn không ghép (hàng cúi, như cũ).
7. Tấm `zed-moi` nén 256 màu như lần trước (433 → 457 KB).

## Số đo (điểm ảnh ô 96 = ½ điểm ảnh game; đủ trong `so-do.json`)

Lệch lớn nhất giữa hai khung liền nhau; "vào/ra" tính cả đứng → khung 1 và khung cuối → đứng.

| | Chân trước trong đòn | Chân trước vào / ra | Chân sau (trong đòn / cả vào ra) | Bật tâm ngang | Bật tâm dọc | Bật đầu ngang | Khung chạm |
|---|---|---|---|---|---|---|---|
| Kiếm 1 cũ | 1 | +2 / −2 | 1,5 / 4 | 2,1 | 1,0 | 4 | 3 |
| **Kiếm 1 mới** | 1 | **0 / −1** | 2,5 / 9 | 3,5 | 0,9 | **2,5** | 3 |
| Kiếm 3 cũ | 8 | +0,5 / −2 | 12 / 12 | 6,2 | **15** | 14 | 3 |
| **Kiếm 3 mới** | **0,5** | +0,5 / −0,5 | 7,5 / 8,5 | 6,3 | **1,7** | **8,5** | 4 (cùng lúc 0,45) |

- Kiếm 3 mới mượt hơn rõ: hết nhún bật dọc 15 → 1,7, chân trước hết trượt (8 → 0,5).
- Kiếm 1 mới: chân trước đứng yên; chân sau lùi 4,5 điểm ảnh game lúc vào đòn vì thế chân kiếm 1 mới rộng hơn đứng (đúng ảnh, không phải trượt giữa đòn). Bật tâm ngang 3,5 là do tay vung (tâm hình gồm cả tay).

## Ảnh soát (thư mục này, dựng từ tấm game — không chạy game)

- `kiem-1-x1.gif`, `kiem-1-x3.gif`, `kiem-3-x1.gif`, `kiem-3-x3.gif`: trái = TRƯỚC, phải = SAU; đứng → đòn đúng thời lượng + mốc khung → đứng. GIF vẽ góc kiếm theo neo từng khung; trong game góc còn được nối mượt giữa khung.
- `luoi-kiem-1.png`, `luoi-kiem-3.png`: từng khung ×3, hàng 1 = trước, hàng 2–5 = sau với kiếm cấp 1–4; ★ = khung chạm; vạch vàng = bàn chân trước lúc đứng.
- `ghep-eo-kiem-1.png`: kiếm 1 mới ghép với chân chạy (chạy + chém).
- Dựng lại: `python3 docs/review/ke-hoach-cai-thien/kiem-moi-16-10/soat.py`.

## Kiểm

`node --check` (zed_moi.js, zed_eo_data.js) đạt; `python3 game/build.py` và `--hai-tep` đạt; nạp trang `dist/linh-khi.html?cloud=0` (không bấm phím, không chơi) với 3 chế độ thường / `?kiemmoi=0` / `?hangcu=1`: **0 lỗi JS**. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Chỗ ảnh còn lỗi / cần xem

- **Lưỡi kiếm xuyên xuống dưới mặt đất**: kiếm 1 khung 4 (60°) và kiếm 3 khung 5–6 (120° / 110°) — làm đúng vạch đỏ, nhưng kiếm dài hơn vạch đỏ của khung người đặc nên mũi lố xuống dưới vạch đất (xem lưới; mỗi khung chỉ hiện ~0,05–0,1 giây). Nếu thấy vướng mắt: em có thể giảm góc (vd kiếm 1 khung 4 còn 40° như hàng cũ) — chỉ đổi số trong `neo-kiem-16-10.py`, không cần gen lại.
- Không cần gen lại ảnh: tay phải đúng tay ở mọi khung, không đổi tay, khung chạm rõ.
