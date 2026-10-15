# Báo cáo đợt 2: nắm tay ôm cán từ ảnh + chạy hai tay (16/10/2026)

Tiếp theo mục 7 của `bao-cao.md`. Chủ game đã gen 2 ảnh:
- `docs/anh-goc/zed/moi/20-nam-tay-om-can.png`: nắm tay phải ôm cán, 4 góc, có lỗ tròn chỗ cán đi qua.
- `docs/anh-goc/zed/moi/03-chay-2tay.png`: hàng chạy 12 khung, hai nắm tay trước ngực.

Lần này **chỉ đổi hình**. Luật, số liệu, vùng trúng, sát thương và nhịp đòn đều giữ nguyên. Neo, góc và lớp nắm tay của các hàng cũ giữ nguyên từng số (tôi đã so `dong_tac` với bản trước). Các bộ Rừng, Biển, Lâu đài không đổi một byte nào.

## 1. Nắm tay cắt từ ảnh, thay lớp ngón tự vẽ

**Cách cắt** (`gan-vk/nam_chuoi.py` → `tach_nam_tay`, `nam_tay_96`):
- Tách 4 nắm tay khỏi nền xanh. Mỗi nắm tay tôi tìm 3 phần:
  - **lỗ**: vùng nền kín nằm trong hình;
  - **băng cổ tay**: khối xám đen;
  - **trục cổ tay → nắm**: trung bình của trục dài hình và hướng từ băng tới lỗ.
- Chỉ lấy **bàn tay**. Bỏ băng cổ tay và cẳng tay, vì thân Zed đã có cánh tay riêng và mỗi bộ trang phục có cổ tay khác nhau.
- Mỗi góc cắt thành 2 lớp ở ô 96:
  - **lớp SAU**: cả nắm tay, lỗ tô nâu tối. Game vẽ lớp này **trước** vũ khí, nên lòng bàn tay nằm sau cán.
  - **lớp TRƯỚC**: phần **ngón và ngón cái**, tính từ mép lỗ phía cổ tay ra tới đầu ngón, bỏ phần lỗ. Game vẽ lớp này **sau** vũ khí, nên ngón phủ lên cán. Qua lỗ vẫn thấy cán.
- Cách thu nhỏ:
  1. Thu phần trong bằng BOX trên ảnh đã nhân alpha, nên màu không lệch.
  2. Lấy ngưỡng alpha 0,45, nên mép sắc.
  3. Thêm viền 1 điểm ảnh (nâu đen như viền ảnh gốc), theo kiểu pixel art.

**Góc ảnh không khớp nhãn trong prompt.** Tôi đo trên ảnh theo quy ước game (0 = sang phải, dương = chúc xuống):

| Thứ tự hình | Nhãn prompt | Góc đo thật |
|---|---|---|
| 1 | 0° | **+0,9°** |
| 2 | −30° | **+26,1°** (cổ tay chúc xuống, không phải hất lên) |
| 3 | −60° | **+39,3°** |
| 4 | +30° | **−17,6°** (hất lên) |

AI vẽ theo chiều lượng giác (dương = ngược kim đồng hồ) và xoay ít hơn yêu cầu. Máy dùng **góc đo**, không dùng nhãn.

**Trong game** (`game/js/zed_moi.js`: `namTayCua`, `veNamTay`, `coHt`):
- Mỗi khung chọn **góc ảnh gần góc vũ khí nhất**. Phần lệch còn lại được xoay thêm, để trục cổ tay → nắm của ảnh luôn trùng hướng cán.
- **Tâm lỗ** đặt lên trục cán, có tính phần lệch theo bề dày cán như lớp ngón cũ (`ngon[...][4]`).
- **Tay thứ hai** (thương, búa) được vẽ thêm khi còn nằm trên cán (lệch ≤ 1,5 điểm ảnh game, cùng luật cũ).
- Khi đang dùng nắm tay từ ảnh, game **không vẽ hàng nắm tay cắt từ thân** (`hang_tay`) đè lên cán nữa. Hàng này đã được lớp sau và lớp trước thay. Ngoại lệ: tay thứ hai lệch khỏi cán (lúc nhắm lệch nhiều) thì vẫn vẽ hàng cũ, để nắm tay đó không bị cán đè lên.
- Thứ tự lớp: TAY SAU (cả thân) → **lòng bàn tay** → VŨ KHÍ → **ngón + ngón cái**.
- Vẫn giữ lớp ngón tự vẽ làm **dự phòng**: dùng khi tệp `zed-vk` chưa có `nam_tay`, khi bật cờ `?ngonanh=0`, hoặc khi đang ở biến thể cũ (`?namchuoi=0`, `?thuong2tay=0`, `?phitieuto=0`). Vũ khí vẽ sau người (`sau = 1`) thì như cũ, không vẽ lớp nào.

**Cỡ nắm tay.** Tôi đã đo, nhưng **chưa dùng đúng cỡ tay thân Zed**. Lý do:
- Nắm đấm thân Zed ở tấm đứng (khối da trung vị 27,8 điểm ảnh nguồn, cộng viền) chỉ **khoảng 6 điểm ảnh ô 96**. Cán kiếm và cán thương dày khoảng 4.
- Tôi đã thử ở cỡ 6 (ảnh thử nằm trong phiên làm việc, không lưu vào repo): cán che gần hết lòng bàn tay, ngón chỉ còn 1–2 điểm ảnh, nhìn như nắm tay biến mất.
- Vì vậy tôi lấy cỡ **theo loại vũ khí, bằng chiều cao lớp ngón tự vẽ cấp 1 đang thay** (= bề dày cán + 4):

| Vũ khí | Cỡ nắm tay (ô 96) |
|---|---|
| Kiếm | 8 |
| Thương | 8 |
| Búa | 9 |
| Phi tiêu | 6 |

- Như vậy nắm tay to hơn nắm đấm thân khoảng 1,3–1,5 lần, nhưng **bằng đúng lớp ngón chủ game đang thấy**.
- Muốn đúng cỡ thân thì sửa `co_` trong `dung-zed-game.py` (mục "NẮM TAY ÔM CÁN TỪ ẢNH") thành 6 cho mọi loại, rồi chạy lại mục 5. Mọi tham số khác giữ nguyên.

**Hạn chế:**
- Ở cỡ 8 điểm ảnh, ảnh gốc 190 điểm ảnh chỉ còn hình dáng nắm tay, gờ đốt ngón, ngón cái và lỗ. Từng ngón riêng không còn tách được.
- Màu da lấy từ ảnh nắm tay. Bộ **Lâu đài** đeo găng da hở ngón, nên nắm tay vẽ đè lên cán là **da trần** chứ không phải găng. Hai bộ Rừng và Biển (cẳng tay trần) khớp màu.

## 2. Hàng chạy hai tay (thương, búa)

- **Cắt**: `cat-diem-anh.py moi/03-chay-2tay.png --hang 1 --so 12 --ten 03-chay-2tay --ms 75`. Kết quả **ĐẠT**: đủ 12 khung, không lỗi, không mảnh bị bỏ. Lưu ở `docs/anh-goc/zed/moi/03-chay-2tay-gif/`.
- **Điểm hai tay** ghi trong `gan-vk/cam-vk.py`, mục `03-chay-2tay`:
  - P = nắm tay phải ở trước bụng, T = nắm tay trái đưa ra trước ngực.
  - Tôi đo bằng khối da rồi soát bằng mắt trên ảnh phóng to. Khung 3 và 4 có nắm tay phải dính cẳng tay trái, nên ghi tay.
  - Chỉ ghi cho thương và búa (`CHI_LOAI`). Kiếm và phi tiêu giữ hàng chạy cũ.
- **Bán kính tâm nắm.** Nắm tay phải nằm sát cẳng tay trái. Với bán kính 28 như mọi hàng, tâm bị kéo sang cẳng tay, góc cán lệch tới +14°. Hàng này dùng bán kính 14 (`nam_chuoi.R0_HANG`, áp cho cả biến thể cũ lẫn mới), nên góc cán qua hai tay là **−4° đến −6°**: cán gần ngang, mũi chếch nhẹ lên.
- **Kết quả: cả 12 khung đều cầm hai tay.** Không khung nào bị máy hạ về một tay (hai nắm đều thấp, xa mặt). Trước đây chỉ 3/12 khung chạy cầm hai tay.
- **Dựng**: `dung-zed-game.py` có thêm hàng thân `chay2tay`, cùng 2 hàng cầm `chay2tay_thuong` và `chay2tay_bua`.
  - Hàng thân neo ngang theo tâm đầu như đứng, đi, chạy.
  - Hàng này chỉ có ở bộ ninja (`CHI_NINJA`). Các bộ khác không có ảnh, nên game giữ hàng chạy cũ.
- **Game**: `chon()` đổi `chay` → `chay2tay` khi cùng lúc có đủ các điều kiện sau. Khung và nhịp bước giữ nguyên (cả hai hàng đều 12 khung).
  - đang cầm thương hoặc búa;
  - bộ đang mặc có hàng này;
  - không bật `?chay2tay=0` hoặc `?camvk=0`.

**Đối chiếu với Zed hiện tại (hàng `03-chay-v4`):**

| Mục | So sánh |
|---|---|
| Tóc | Khớp: đen, bờm nhọn rối, mái che trán, mắt đỏ |
| Áo | Khớp: áo võ đen tay ngắn, cổ chéo, băng cổ tay đen |
| Thắt lưng | Đỏ, nhưng **dải đuôi dài và bay nhiều hơn** (hai dải tung ra sau rõ hơn) |
| Quần, dép | Khớp: quần đen bó ống, dép |
| Cỡ người | Ảnh nguồn cao ~303 so với ~288 điểm ảnh. Sau khi co theo đầu, đầu 26,1 so với 25,8 (ô 96), khớp. Người cao 65,7 so với 63,4 ô 96, tức **cao hơn khoảng 1 điểm ảnh game** |
| Dáng | Thân trên thẳng hơn, hai tay giữ yên trước ngực. Nhịp chân khác v4 một chút: đổi vũ khí giữa lúc chạy có thể thấy chân đổi pha một lần |
| Chạy mà đánh | Chân vẫn lấy từ hàng chạy cũ (G.ZED_EO, ghép eo). Đang chạy cầm thương / búa mà ra đòn thì chân đổi sang hàng cũ trong lúc đánh, rồi quay lại hàng hai tay |

## 3. Cờ quay lui

| Cờ | Tác dụng |
|---|---|
| `?ngonanh=0` | Về lớp ngón pixel tự vẽ (bản 15/10), vẽ lại hàng nắm tay thân đè lên cán (`G.NGON_ANH`) |
| `?chay2tay=0` | Chạy cầm thương / búa về hàng chạy cũ (`G.CHAY_2TAY`) |
| `?namchuoi=0`, `?thuong2tay=0`, `?phitieuto=0` | Như cũ. Khi các cờ này tắt biến thể mới thì nắm tay từ ảnh cũng tắt theo |

Hai cờ mới đặt trong `game/js/data.js`, ngay sau khối nắm chuôi.

## 4. Ảnh soát

Tất cả ảnh nằm trong thư mục này, dựng y như game bằng `ve_zed.py` (đã cập nhật theo game), không chơi thử trình duyệt.
- `xem2-kiem.png`, `xem2-thuong.png`, `xem2-bua.png`, `xem2-phitieu.png`:
  - Cấp 1, bộ ninja, phóng **×3**. Mỗi hàng động tác có 2 dòng: **trên = trước** (`?ngonanh=0&chay2tay=0`), **dưới = SAU**.
  - Riêng hàng `chay_thuong` và `chay_bua`: dòng SAU là `chay2tay_*`.
- `xem2-can-tay.png`: cận cảnh nắm tay **×8** ở 11 khung tiêu biểu (trái = trước, phải = sau). `xem2-can-tay-rung.png` là bản tương tự cho bộ Rừng (cẳng tay trần).
- `xem2-nam-tay.png`: ảnh gốc thu nhỏ, kèm các ô nắm tay đã cắt (4 góc × lớp sau / trước, cỡ 6 / 8 / 9) phóng ×12. Chấm vàng là tâm lỗ.
- `gif2-kiem.gif`, `gif2-thuong.gif`, `gif2-bua.gif`, `gif2-phitieu.gif`: **trước | sau** đặt cạnh nhau, theo thứ tự đứng → đi → chạy → các đòn (×3).
- Dựng lại: `python3 docs/review/ke-hoach-cai-thien/vk-khop-tay/xem2.py` (thêm `--bo zed-rung` cho bộ khác).

## 5. Tệp và cách chạy lại

- `docs/anh-goc/zed/gan-vk/nam_chuoi.py`: thêm `tach_nam_tay`, `nam_tay_96`, `R0_HANG`.
- `docs/anh-goc/zed/gan-vk/cam-vk.py`: thêm mục `03-chay-2tay` và `CHI_LOAI`. `neo.json` chỉ thêm 2 mục `03-chay-2tay#thuong`, `03-chay-2tay#bua`; các mục cũ không đổi.
- `docs/anh-goc/zed/dung-zed-game.py`:
  - thêm hàng `chay2tay`, `CHI_NINJA`;
  - thêm `nam_tay` vào `zed-vk`: `{goc, co: {loại: cỡ}, sau: {cỡ: [[x, y, rộng, cao, cx, cy] × 4]}, truoc: {...}}`, xếp một hàng mới dưới hàng ngón, nên các ô cũ không dời.
- `game/js/zed_moi.js`, `game/js/data.js`: như mục 1–3.
- Chạy lại, từ gốc repo:
  ```
  cd docs/anh-goc/zed/gan-vk && python3 cam-vk.py && cd -
  python3 docs/anh-goc/zed/dung-zed-game.py
  python3 docs/review/ke-hoach-cai-thien/vk-khop-tay/nen-zed.py --ghi
  git checkout game/art/custom/zed-rung.sprite.json game/art/custom/zed-bien.sprite.json game/art/custom/zed-lau.sprite.json
  python3 game/build.py && python3 game/build.py --hai-tep
  ```
  Dòng `git checkout` dùng để bỏ phần nén lại 3 bộ kia. Dữ liệu 3 bộ không đổi, nhưng phép nén k-means cho ra byte khác mỗi lần chạy.

## 6. Kiểm

- `node --check` cho `game/js/zed_moi.js` và `game/js/data.js`: đạt.
- Chạy thử hàm vẽ bằng node (canvas giả, nạp `zed-moi` và `zed-vk` thật, không mở trình duyệt):
  - Chạy cầm thương / búa chọn đúng `chay2tay`, vẽ lòng bàn tay → cán → ngón ở **hai** tay.
  - Kiếm / phi tiêu giữ `chay`, dùng nắm tay từ ảnh (cỡ 8 / 6).
  - Với `?ngonanh=0&chay2tay=0`: về hàng `chay`, vẽ lại hàng nắm tay thân và lớp ngón tự vẽ như bản 15/10.
  - `G.zedMoi.loi` rỗng.
- `python3 game/build.py` và `--hai-tep`: chạy xong không lỗi. Khi rebase gặp xung đột ở `game/dist/*`, tôi giữ bản của phiên kia rồi dựng lại.
- **Dung lượng:**

| Mục | Trước | Sau |
|---|---|---|
| `zed-moi` | 358 KB | 382 KB (+1 hàng thân, +2 hàng cầm, +2 hàng nắm tay) |
| `zed-vk` | 70,0 KB | 71,5 KB |
| Người chơi tải | 16,24 MB | 16,27 MB / trần 20 MB |
| Bản một tệp | 28,19 MB | 28,31 MB / trần 30 MB |

  Số "sau" ở hai dòng cuối đo sau khi gộp các phiên khác.
- Không đụng master, không force push, không tạo PR, không chép apiKey, không sửa đăng nhập Google / lưu mây / `?cloud=0`.

## 7. Còn có thể làm (nếu chủ game muốn)

- Chọn cỡ nắm tay: giữ 8 / 9 như hiện tại (rõ ngón), hay 6 (đúng cỡ nắm đấm thân, nhưng cán che gần hết). Đổi chỉ một dòng `co_`.
- Bộ Lâu đài: nếu muốn nắm tay đeo găng, cần gen thêm tấm nắm tay găng da (cùng prompt 1, đổi "skin" thành "brown leather fingerless glove").
- Chạy hai tay cho bộ Rừng, Biển, Lâu đài: gen hàng `03-chay-2tay` cho từng bộ (cùng prompt 2, gửi kèm tấm chạy của bộ đó). Sau đó bỏ tên hàng khỏi `CHI_NINJA` và cắt ảnh vào `trang-phuc/bo-*/03-chay-2tay-cat/`.
