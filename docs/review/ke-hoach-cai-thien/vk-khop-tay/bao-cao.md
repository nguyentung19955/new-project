# Báo cáo: tay Cu Tí (Zed) nắm vũ khí thật (15/10/2026)

Làm theo nhận xét của chủ game lúc 23:10 ngày 15/10: "cầm kiếm tay nào thì nắm đấm phải nắm vào chuôi, giờ chỉ đặt lên thôi; thương thì tay phải cầm chuôi, tay trái cầm thân; hiển thị ngón tay; phi tiêu cũng thế, và làm phi tiêu to hơn một chút".

Phần này **chỉ đổi hình**. Luật, số liệu, vùng trúng, sát thương, nhịp đòn đều giữ nguyên. Dữ liệu cũ vẫn nằm nguyên trong tệp, nên mỗi cờ tắt là trở về đúng hình cũ.

## 1. Vì sao trước đây trông như "đặt lên"
- Lớp tay vẽ đè lên cán chỉ gồm **các điểm màu da** quanh điểm cầm. Viền đen và vạch ngón của nắm tay bị bỏ mất, nên cán cắt ngang nắm tay như dán lên.
- Nắm tay trong ảnh gốc, sau khi co về ô 96, chỉ còn khoảng **5 điểm ảnh**, trong khi chuôi kiếm dày khoảng **4 điểm ảnh**. Vì vậy chuôi gần như che kín nắm tay, không còn thấy ngón nào ôm quanh cán.
- Điểm cầm trên kiếm là trung vị các điểm đỏ của chuôi. Kiếm cấp 3 và 4 có tua đỏ rủ xuống, kéo điểm này lệch khỏi giữa chuôi tới khoảng 1,5 điểm ảnh game.

## 2. Đã làm
Thứ tự lớp mới, áp cho mọi hàng có vũ khí: **TAY SAU (cả thân) → VŨ KHÍ → lớp nắm tay → NGÓN TAY TRƯỚC**. Các hàng gồm kiếm (đứng, đi, chạy, nhát 1–3, Trảm Nguyệt), búa (đứng, đi, chạy, nện, tụ lực, nện đất, Địa Chấn), thương và phi tiêu cầm tay. Áp cho cả 4 bộ trang phục.

1. **Tâm nắm đấm** (`tam_nam`): điểm cầm được dời dần về khối da nhỏ ở đầu tay, bán kính thu từ 28 xuống 14, để không bị cẳng tay kéo lệch. Chuôi vũ khí đặt đúng tâm này, nên cán đi **xuyên qua giữa nắm tay**: đốc ló một bên, lưỡi hoặc cán ló bên kia.
2. **Điểm cầm trên vũ khí** dời về **giữa bề dày cán**, không còn lệch theo tua.
3. **Lớp nắm tay** (`mat_na_nam`): lấy cả khối nắm đấm, lấp lỗ để giữ vạch ngón tối, rồi nới thêm 4 điểm ảnh nguồn để lấy **viền đen**. Lớp chỉ giới hạn trong bán kính 24 quanh tâm, nên không lấy cẳng tay. Điểm ảnh lấy đúng từ thân đã co, nên không lệch màu và mép sắc.
4. **Lớp ngón riêng**. Tách ngón từ ảnh gốc không đủ rõ ở cỡ 5 điểm ảnh (xem mục 6), nên tôi tự vẽ một nắm ngón pixel cho mỗi loại vũ khí × cấp. Nắm ngón cao bằng bề dày cán + 4, có gờ đốt ngón sáng, 2 kẽ ngón, đầu ngón cuộn tối và viền nâu. Nó được lưu ở `zed-vk.sprite.json` → `ngon`, xếp thành một hàng dưới cùng tấm, nên các ô vũ khí cũ không dời chỗ. Game vẽ lớp này **xoay cùng vũ khí**, đặt ở tâm nắm tay, nên ở mọi góc (kể cả khi nhắm 8 hướng) ngón luôn quấn quanh cán.
   - Có tay thứ hai trên cán thì vẽ thêm một nắm ngón ở chỗ tay đó, nhưng chỉ khi tay còn nằm trên cán (lệch ≤ 1,5 điểm ảnh game). Nhắm lệch nhiều thì bỏ.
   - Vũ khí vẽ sau người (neo `sau = 1`, ví dụ kiếm giơ sau đầu) thì không vẽ lớp ngón, để không đè lên đầu hay mặt.
5. **Thương hai tay**:
   - **Tay phải ở đuôi cán**, ngay trên đốc. Điểm cầm (cam) đổi từ 0,20 xuống 0,11.
   - Cán ngắn lại đúng phần đuôi thừa (dai 1,3 → 1,169), để **mũi thương vẫn ở đúng chỗ cũ** tính từ tay phải. Vì vậy tầm nhìn thấy không đổi.
   - **Tay trái ở thân cán**. Góc cán được tính lại bằng đường nối **tâm hai nắm tay**, ở từng khung và từng bộ trang phục.
   - Khung nào trong `neo.json` thiếu tay trái thì máy tìm khối da gần đường cán (`tim_tay2`).
   - Các khung máy giữ một tay, cùng lý do:

| Khung | Giữ một tay vì |
|---|---|
| Xốc khung 1, 3, 4 | Tay trái trong ảnh không nằm trên cán: góc qua hai tay là −59° đến −86° |
| Nện đất khung 1, Địa Chấn khung 1, 3, 4 | Như trên |
| Chạy: khung 1, 3, 4, 5, 8, 9, 10, 11 (khung 2 vốn đã một tay từ trước) | Tay trái trong ảnh chạy đánh lên **sát cằm**. Cán qua hai tay sẽ cắt ngang mặt, hoặc lớp ngón đè lên mặt (giữ luật "vũ khí không che mặt") |

   - Ở các khung chạy đó, thương và búa cầm tay phải. Riêng khung 9 hạ góc từ −27° xuống −17° để cán không qua mặt.
   - Các khung chạy 6, 7, 12 vẫn cầm hai tay.
   - Hàng đòn (thương 1–3, quét, tụ lực) không bị máy dời hướng đòn. Chỉ có những khung góc qua hai tay lệch dưới 25° so với góc cũ mới được chỉnh, mỗi khung chỉ vài độ.
6. **Phi tiêu**:
   - **To ×1,3** cả lúc cầm và lúc bay, **chỉ hình**: đạn, vùng trúng, sát thương không đổi.
   - **Kẹp một cánh ở ngón** (cam 0,17). Thân phi tiêu ló ra dưới-trước nắm tay (góc 55°), không đè lên bụng hay đai. Lớp ngón vẽ ngang cánh đang kẹp.
7. **Chỉnh tay**: máy đo sai khung nào thì sửa tệp `docs/anh-goc/zed/gan-vk/neo-nam-chinh-tay.json` (chưa có thì tạo), rồi chạy lại mục 5. Tệp chỉnh tay luôn thắng máy đo.
   ```json
   {"hang": {"03-chay-v4#thuong": {"8": {"tay2": [160, 143], "goc": -18}},
             "12-thuong-2":       {"3": {"tay": [257, 123]}}}}
   ```
   - Toạ độ tính trên ảnh khung ninja đã cắt (`docs/anh-goc/zed/moi/<hàng>-gif/`). Khung đếm từ 1.
   - `"tay2": null` = bỏ tay trái. `"goc"` = đặt hẳn góc.

## 3. Cờ quay lui
| Cờ | Tác dụng |
|---|---|
| `?namchuoi=0` | Mọi hàng về cách ghép cũ: lớp tay chỉ có điểm da, không lớp ngón, thương và phi tiêu cũ, phi tiêu bay cỡ cũ |
| `?thuong2tay=0` | Chỉ hàng thương về như cũ (tay phải giữa cán sau, góc cũ) |
| `?phitieuto=0` | Phi tiêu cầm và bay về như cũ (cỡ cũ, cầm giữa nắm tay) |

Biến tương ứng: `G.NAM_CHUOI`, `G.THUONG_2TAY`, `G.PHI_TIEU_TO` (đặt trong `js/data.js`).

## 4. Ảnh soát (trong thư mục này, dựng y như game bằng `ve_zed.py`, không chơi thử trình duyệt)
- `xem-kiem.png`, `xem-bua.png`, `xem-thuong.png`, `xem-phitieu.png`:
  - Mỗi tấm là một loại vũ khí (cấp 1) của bộ ninja, phóng **×3** (ô 96, tức ×6 điểm ảnh game).
  - Gồm các hàng: đứng, đi, chạy, từng khung của mọi hàng đòn và chiêu đặc biệt.
  - Mỗi hàng có 2 dòng: **trên = trước** (`?namchuoi=0`), **dưới = SAU**.
- `xem-kiem-rung.png`: như trên, bộ Rừng (áo không tay, cẳng tay trần), để thấy lớp nắm tay không lấy cẳng tay.
- `xem-phitieu-bay.png`: phi tiêu đang bay cấp 1–4, ném thường và ném chùm, trước / sau ×1,3.
- `gif-kiem.gif`, `gif-bua.gif`, `gif-thuong.gif`, `gif-phitieu.gif`: GIF ngắn dựng từ khung (bản SAU, ×3): đứng → đi → chạy → các đòn.
- Dựng lại ảnh soát: `python3 docs/review/ke-hoach-cai-thien/vk-khop-tay/xem.py` (thêm `--bo zed-rung | zed-bien | zed-lau` cho bộ khác).

## 5. Tệp và cách chạy lại
- `docs/anh-goc/zed/gan-vk/nam_chuoi.py` (mới): tâm nắm đấm, mặt nạ nắm tay, lớp ngón, tìm tay trái, kiểm cán qua mặt, đọc tệp chỉnh tay.
- `docs/anh-goc/zed/dung-zed-game.py`:
  - Mỗi hàng có vũ khí có thêm `dong_tac[k].nam = {neo, hang_tay, vk_tl?, vk_cam?}`. Neo mới có thêm phần tử thứ 5 là tâm tay thứ hai.
  - Thêm hàng nắm tay mới. Thêm `ngon` vào `zed-vk`.
  - Neo, nắm tay, `vk_tl`, `vk_cam` cũ **giữ nguyên từng số** (đã so với bản trước, cả 4 bộ).
- `game/js/zed_moi.js`: hàm `bienThe` (chọn biến thể theo cờ) và `veNgon` (lớp ngón). Ba chỗ vẽ nắm tay (ghép eo mới, ghép eo cũ, toàn thân), `doiTip` và cỡ phi tiêu bay dùng biến thể đang chọn.
- `game/js/data.js`: 3 cờ.
- `docs/review/ke-hoach-cai-thien/vk-khop-tay/nen-zed.py`: nén lại ảnh 5 tấm Zed theo đúng cách của `npc-ban-do-bao-truoc/cong-cu/nen-anh.py` (bảng 256 màu). Chỉ đụng 5 tấm Zed.
- Chạy lại toàn bộ, từ gốc repo:
  ```
  python3 docs/anh-goc/zed/dung-zed-game.py
  python3 docs/review/ke-hoach-cai-thien/vk-khop-tay/nen-zed.py --ghi
  python3 game/build.py && python3 game/build.py --hai-tep
  ```

## 6. Kiểm
- `node --check` `game/js/zed_moi.js`, `game/js/data.js`: đạt.
- Chạy thử hàm vẽ bằng node (canvas giả, không mở trình duyệt):
  - Đứng cầm kiếm, thương, phi tiêu: vẽ đúng lớp ngón; với thương, lớp thứ hai cách tay phải 10,7 điểm ảnh dọc cán.
  - Với `?namchuoi=0`: vẽ đúng như cũ (3 lần vẽ, neo và nắm tay cũ).
  - Không có lỗi trong `G.zedMoi.loi`.
- `python3 game/build.py` và `--hai-tep`: chạy xong không lỗi.
- **Dung lượng**:

| Mục | Trước | Sau |
|---|---|---|
| `zed-moi` | 344 KB | 369 KB |
| `zed-rung` | 357 KB | 378 KB |
| `zed-bien` | 355 KB | 381 KB |
| `zed-lau` | 370 KB | 392 KB |
| `zed-vk` | 71,2 KB | 71,7 KB |
| Bản một tệp | 27,39 MB | 27,48 MB (đo trước khi gộp các phiên khác) |

  Thêm khoảng +25 KB mỗi bộ, vì giữ cả hàng nắm tay cũ để quay lui được. Sau khi gộp các phiên khác: người chơi tải 16,22 MB / trần 20 MB; bản một tệp 28,19 MB / 30 MB.
- Không đụng master, không force push, không tạo PR, không chép apiKey, không sửa đăng nhập Google / lưu mây / `?cloud=0`.

## 7. Còn hạn chế, và ảnh nên gen nếu muốn đẹp hơn nữa
Ảnh hiện có **chưa đủ** cho hai chỗ sau, nên tôi đã dùng cách thay thế:

**(a) Ngón tay rời.** Nắm tay gốc chỉ 5 điểm ảnh ô 96, nên tôi phải dùng lớp ngón pixel tự vẽ. Lớp này rõ và luôn ôm cán, nhưng là khối đều, chưa có ngón cái hay dáng tay riêng từng tư thế. Muốn ngón đúng nét vẽ của ảnh gốc thì gen một tấm nắm tay ôm cán rời, cắt làm lớp ngón trước và sau.

> **Prompt 1 — nắm tay ôm cán (lớp ngón):** Pixel art, chibi boy Zed's right fist only, side view facing right, gripping an invisible horizontal pole (a clear round tunnel through the fist where the pole would be), same skin and black wrist wrap as the reference. 1 row, 4 frames spaced far apart: fist gripping at angle 0°, −30°, −60°, +30°. Big, clear knuckles and finger lines, thumb wrapped over. Background solid #00FF00, no text, no shadow.
> Gửi kèm: `docs/anh-goc/zed/moi/01-dung.png`, `docs/anh-goc/zed/moi/08-kiem-1-tp.png`.

**(b) Chạy cầm thương / búa hai tay.** Ảnh chạy hiện tại đánh tay trái lên sát cằm, nên 9/12 khung chạy (cả khung 2 vốn có từ trước) chỉ cầm được một tay (tay phải ở đuôi cán). Muốn cả 12 khung đều hai tay thì gen một hàng chạy mới, hai nắm tay đưa trước bụng trên một đường chéo (như đang ôm cán), không vũ khí.

> **Prompt 2 — chạy hai tay ôm cán:** Pixel art chibi boy Zed running to the right, same outfit and size as the reference run sheet. Both fists held low in front of the belly, right fist near the hip and left fist forward, both on one diagonal line as if holding an invisible spear shaft; hands never go above the chest, face always visible. 1 row, 12 frames spaced far apart, same run cycle timing as the reference. Background solid #00FF00, no weapon, no text, no shadow.
> Gửi kèm: `docs/anh-goc/zed/moi/03-chay-v4.png`, `docs/anh-goc/zed/moi/02-di.png`.

Nếu gen (b): cắt bằng `cat-diem-anh.py` thành một hàng mới (ví dụ `03-chay-2tay`), ghi điểm hai tay trong `cam-vk.py`, rồi chạy lại mục 5.

Ngoài phạm vi lần này: hàng **ném phi tiêu** (phitieu, ngắm, chùm) vẫn là ném tay không như thiết kế cũ. Viên phi tiêu chỉ hiện khi đã bay.
