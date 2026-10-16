# Búa nện mới của Cu Tí (16/10) — đã đưa vào game

Ảnh gốc: `docs/anh-goc/cu-ti-hang-moi-16-10/17-bua-nen-8k-v2.png` (8 khung, chủ game gen theo khung người đặc `docs/khung-que-8-huong/nguoi-dac/bua-e.png`).

Đã chờ đủ 2 báo cáo `kiem-moi-16-10/bao-cao.md` và `ve-tay-8-dot-1/bao-cao.md` rồi mới sửa game, làm cùng cách (cỡ đầu = hàng đứng mới, căn bàn chân trước, nén 256 màu, chỉ giữ thay đổi của `zed-moi`).

## Tóm tắt

- **Hàng búa nện mới đã thay hàng cũ** (bộ Ninja). Bộ Rừng / Biển / Lâu đài chưa có ảnh mới → giữ hàng cũ. Nện đất (giữ búa rồi thả), tụ lực búa, Địa chấn: giữ hàng cũ.
- **Cờ `?buamoi=0`**: về búa nện cũ (đứng / lộn / trúng đòn / kiếm mới vẫn giữ). `?hangcu=1` vẫn về toàn bộ hàng cũ.
- **Cân bằng không đổi**: hàng cũ cũng 8 khung, 0,8 giây → giữ nguyên mốc khung (`MOC_BUA_BT`), **khung chạm = khung 3 đúng lúc chạm cũ (u = 0,35)** — kiểm bằng hàm chọn khung của game: u 0,35 → khung 3 ở cả hàng mới lẫn `?buamoi=0`. Không sửa dòng nào trong moves.js / combat.js; vùng trúng, sát thương, thời lượng giữ nguyên. Chỉ đổi HÌNH.
- **Búa cầm HAI TAY**: tay trái ở dưới (phía đuôi cán), tay phải ở trên (phía đầu búa), nắm tay ôm cán (ảnh nắm tay có sẵn) vẽ ở cả hai chỗ.

## Đã làm (cùng cách kiếm mới 16/10)

1. **Cắt khung**: tách theo cột nền #00FF00 thì máy gộp nhầm (khung 2–3 thành một hình; khung 3|4 và 5|6 chỉ cách nhau 1 cột điểm ảnh) → **cắt tay** bằng `cat-diem-anh.py --cat-tay` theo đúng cột trống giữa các hình (`docs/anh-goc/zed/moi16/17-bua-nen-8k-cat-tay.json`) → ĐẠT, 8 khung, không mất mảnh nào → `moi16/17-bua-nen-8k-gif/`.
2. **Cỡ**: đầu bằng đúng đầu hàng đứng mới (25,2 điểm ảnh ô 96, như kiếm mới). Cao người: thế thủ khung 1/7/8 = 60, khung chạm = 58, khuỵu khung 4–5 = 45–46 (đứng = 64; ảnh vẽ thế thủ hơi chùng gối). ×1,2 của Cu Tí áp lúc vẽ như mọi hàng.
3. **Căn bàn chân trước** đặt đúng chỗ bàn chân trước lúc đứng (`CHAN_TRUOC` trong `dung-zed-game.py`, như kiếm mới).
4. **Neo hai tay** (`docs/anh-goc/zed/gan-vk/neo-bua-16-10.py` → `neo.json` mục `17-bua-nen-8k`): ảnh vẽ hai nắm tay chồng lên nhau thành một cụm (thường chỉ thấy một nắm) → đo **tâm cụm nắm tay** từng khung; **góc cán lấy theo `ve-bua.py` (blade)**; hai tay đặt trên trục cán, cách nhau 3 điểm ảnh game, đối xứng quanh tâm cụm. Búa vẽ trước thân mọi khung.

   | Khung | Góc cán (0° = ra trước, dương = chúc xuống) | Tâm cụm nắm tay (ảnh cắt) |
   |---|---|---|
   | 1 lấy đà, búa sau vai | −150° | 30, 85 |
   | 2 giơ cao quá đầu | −105° | 82, 30 |
   | **3 ★ nện (chạm)** | **15°** | 238, 243 |
   | 4 khuỵu, búa chạm đất | 68° | 214, 247 |
   | 5 giữ | 64° | 206, 265 |
   | 6 nhấc búa | 15° | 207, 266 |
   | 7 hồi | −35° | 176, 241 |
   | 8 thủ | −75° | 168, 240 (điểm giữa hai nắm thấy rõ) |

5. **Game** (`game/js/zed_moi.js`): hàng `bua_nen~16` dùng thay `bua_nen` (cùng đường `hang16` của các hàng mới). Công cụ: `dung-zed-game.py` thêm hàng + cờ neo `co_dinh` (dùng đúng hai điểm tay + góc, không kéo về khối da); `nam_chuoi.py` bỏ qua tính lại góc cho khung `co_dinh`. Tấm `zed-moi` nén 256 màu như lần trước (489 → 490 KB); tấm các bộ khác và `zed-vk` không đổi.

## Số đo (điểm ảnh ô 96 = ½ điểm ảnh game; đủ trong `do-lech.json`)

| | Bật tâm ngang | Bật tâm dọc | Trượt chân sau (liền / cả đòn) | Trượt chân trước | Rộng thế chân lệch | Đường đất |
|---|---|---|---|---|---|---|
| Búa cũ | 9,9 | 13,9 | 6 / 6 | 3 / 3 | 25 % | 0 |
| **Búa mới** | **1,9** | 8,1 (khuỵu thật) | **1 / 1** | **1 / 1** | 5,7 % (ảnh gốc 3,7 %) | 0 |

- Vào / ra đòn: chân sau 31–32, chân trước 65–66 ở mọi khung, lúc đứng 32 / 65 → **chân không trượt khi vào và ra đòn** (búa cũ chân sau lùi tới 25).
- Rộng thế chân trên ảnh gốc: 240–249 điểm ảnh → lệch 3,7 % (≤ 4 %). Sau khi co về ô 96 thành 34–36 điểm ảnh, lệch 1–2 điểm ảnh do làm tròn.
- Bật tâm dọc 8 là do khuỵu sâu khung 4–5 (đúng động tác); búa cũ 13,9.

## Ảnh soát (thư mục này, dựng từ tấm game — KHÔNG chạy game)

- `bua-cu-x1.gif`, `bua-cu-x3.gif` (trước, `?buamoi=0`) và `bua-moi-x1.gif`, `bua-moi-x3.gif` (sau): đúng 0,8 giây theo mốc khung, góc búa nối giữa khung như game; chữ CHAM = khung chạm. ×1 = cỡ trong trận (ô 96 × 1,2).
- `luoi-khung-cu-moi.png`: từng khung có búa ×3, hàng trên cũ, hàng dưới mới, vạch = mặt đất.
- Dựng lại: `python3 docs/review/ke-hoach-cai-thien/bua-moi-16-10/soat-bua.py`.

## Kiểm

`node --check game/js/zed_moi.js` đạt; `python3 game/build.py` và `--hai-tep` đạt. Nạp trang `dist/linh-khi.html?cloud=0` (không bấm phím, không chơi) ở 3 chế độ thường / `?buamoi=0` / `?hangcu=1`: **0 lỗi JS**, hàng búa đúng chế độ (mới: 2 tay, góc khung chạm 15°; cũ: như trước). Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Chỗ ảnh còn lỗi / cần xem

- **Đầu búa xuống dưới vạch đất** ở khung 4–5 khoảng 12 điểm ảnh game (búa cũ ~9): làm đúng góc vạch đỏ (68° / 64°), nhưng búa trong game dài hơn vạch đỏ của khung người đặc. Trong góc nhìn chéo của game đọc như búa nằm trên nền phía trước. Nếu thấy vướng mắt: giảm góc trong `BLADE` của `neo-bua-16-10.py` (vd −40 thay −68) rồi chạy lại `dung-zed-game.py` — không cần gen lại.
- Ảnh gốc vẽ hai nắm tay dính thành một cụm nên vị trí từng tay là đặt theo trục cán, không đo riêng được (khung 8 thấy rõ hai nắm nằm ngang — hơi lệch với cán gần dựng đứng; nhìn ở cỡ thật không thấy).
- Không cần gen lại.
