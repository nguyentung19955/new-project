# Rig giáp theo độ sâu (back / front) — báo cáo

Làm theo yêu cầu chủ game 16/10 11:15. Thư mục mới `docs/thu-modular-96/rig-do-sau/`, khởi đầu từ bản copy `rig-chatgpt/` (commit đầu tiên giữ nguyên bản copy để so). **Không sửa** `rig/`, `rig-chatgpt/`, code game, ảnh nguồn (`../data.json`, `../sheets/`, `../anh-gen/` chỉ đọc). Chỉ dùng Cu Tí mới, hàng chạy 12 khung.

**Mở thử:** `kiem-tra-rig.html` (1 tệp tự chứa, mở thẳng bằng trình duyệt) hoặc giải nén `rig-do-sau.zip`.

## Ảnh thật độ phân giải cao (16/10, theo yêu cầu 11:16)

Mở `kiem-tra-rig.html` (1,4 MB, đủ 12 khung ở mọi cỡ, không phải cắt bớt). Mặc định trang hiện **cạnh nhau 96 ↔ 384**, cùng kích thước trên màn hình. Nút **Cỡ: 48 / 96 / 192 / 384** để xem từng cỡ (2 cột: xoay liên tục / 8 hướng). Bảng **"Kiểm mọi cỡ"** tự chạy ở nền vài giây sau khi mở.

### Nói thẳng

- **Ảnh lớn đẹp hơn rõ.** Ở 384, mặt, tóc, đai đỏ, dép đều nét như ảnh gốc; giáp có viền tối, viền đồng, chữ V, hình khối rõ. Ở 96 (game hiện 48), giáp chỉ còn vài mảng màu.
- **Giáp gen giữ chi tiết từ cỡ nào** (đo trên ảnh giáp đã thu, xem `soat/co-lon/luoi-12-khung-*.png`):

| Cỡ nhân vật | Giáp cẳng tay / vai / ống chân / ngực (điểm ảnh) | Viền tối | Viền đồng | Chữ V | Đinh tán |
|---|---|---|---|---|---|
| 48 (game) | 4×2 … 7×7 | không | không | không | không |
| 96 | 8×4, 8×8, 9×6, 13×13 | lấm tấm | thành mảng cam | không | không |
| 192 | 16×9, 16×16, 18×12, 26×26 | có | có nhưng đứt đoạn | lờ mờ | không |
| **384** | **31×17, 32×32, 37×26, 51×51** | **có, liền** | **có, liền** | **thấy rõ** | **vài đinh (1 điểm ảnh)** |
| (thử 768) | 63×34 … | có | có | rõ | rõ (2–3 điểm ảnh) |

  → **Từ 384 giáp gen mới "ra giáp"**. Đinh tán chỉ thật sự rõ ở khoảng 768 (ảnh gốc 4 mảnh rộng 360–500 điểm ảnh, một đinh ~11–20 điểm ảnh gốc ≈ 1 điểm ảnh ở 384). Ở 384 script phải "giữ tay" đinh: cẳng tay 3, ống chân 2 đinh; vai và ngực không giữ được đinh nào.
- **Khớp sạch ở mọi cỡ** theo cách đo của R4 (bán kính nhân theo cỡ):

| Cỡ · bộ | Khe r2 liên tục trước → sau | Khe r2 8 hướng | Khe r3 sau (quy về ô 96) LT / 8H | Thứ tự lượt đúng | Bám 2 đầu | Giãn > 15% |
|---|---|---|---|---|---|---|
| 96 · Máy vẽ | 116 → **0** | 117 → **0** | 79 / 90 | 12/12 | 12/12 | 0 (kẹp 47 lượt) |
| 96 · Gen | 128 → **0** | 140 → **0** | 75 / 75 | 12/12 | 11/12 | 0 (kẹp 46) |
| 192 · Gen | 570 → **0** | 586 → **0** | 108 / 112 | 12/12 | 11/12 | 0 (kẹp 45) |
| 384 · Gen | 2317 → **0** | 2309 → **0** | 95 / 101 | 12/12 | 11/12 | 0 (kẹp 46) |

  Khe r3 còn lại gần như toàn ở **gối** (384: gối trước 1278, gối sau 1333, khuỷu trước 443, vai trước 67 điểm ảnh, cộng 12 khung × 2 chế độ). Đây chủ yếu là ống quần to hơn chụp gối, không phải giáp bị hở. Chỗ bám hụt: khung 2 (192/384) hoặc khung 3 (96), chế độ 8 hướng, giáp ống chân trước lệch ~2 điểm ảnh ô 96 ở cổ chân. Chế độ liên tục không bị. Bảng đủ: `soat/co-lon/bang-khe-co-lon.md`.
- **Chỗ chưa đẹp ở ảnh lớn (nhìn `soat/co-lon/can-canh-x3-384.png`):**
  - Chụp khớp ở 384 thành **quả cầu đồng to, trơn** (20×20 điểm ảnh), nhìn như bóng gắn vào khớp, lạc kiểu với giáp gen có viền, đinh. Muốn đẹp nên **gen riêng 3 chụp khớp** cùng bộ với 4 mảnh.
  - Giáp vai/ngực ở 384 vẫn hơi "nhoè màu" vì chỉ có 8 màu và mỗi điểm ảnh = 11–15 điểm ảnh gốc.
  - Áo/tay ở 384 rõ nét thì càng lộ việc giáp **dán lên, không ôm theo nếp áo**. Ở 48 không ai thấy, ở 384 thấy.

### Ưu / nhược nếu game dùng nhân vật cỡ lớn

| | Cỡ 96 (nguồn hiện tại, game hiện 48) | Cỡ 192 | Cỡ 384 |
|---|---|---|---|
| Lớp thân 1 động tác chạy (12 khung, 12 lớp, PNG) | 62 KB | 205 KB (×3,3) | 645 KB (×10) |
| RAM khi giải nén 12 lớp của 1 động tác | 5 MB | 21 MB | 85 MB |
| Tấm sprite cả nhân vật hiện có (1152×8256, 86 hàng, 272 KB) phóng tương ứng | 9,5 triệu điểm ảnh, 38 MB RAM | 2304×16512 = 38 triệu điểm ảnh, ~150 MB RAM, ~0,9–1 MB PNG (ước) | 4608×33024 = 152 triệu điểm ảnh, ~610 MB RAM, ~3 MB PNG (ước) |
| Điện thoại | ổn | **vượt giới hạn 1 ảnh canvas của Safari iPhone (~16,7 triệu điểm ảnh)** → phải chia nhiều tấm | vượt xa, phải chia ≥ 10 tấm, RAM quá nặng cho máy yếu |
| Vẽ mỗi khung | ~40 lần vẽ ảnh nhỏ | như 96 | như 96 nhưng tô 16 lần điểm ảnh |

- **Có phải gen lại các động tác không?** Ảnh nguồn hàng chạy chỉ cao ~290 điểm ảnh; ở 384 nhân vật đã dùng ~90% độ phân giải nguồn. Nghĩa là **384 là trần** với ảnh hiện có. Lớn hơn nữa (để đinh tán rõ) thì **phải gen lại mọi động tác** ở cỡ lớn hơn. 192/384 thì **không cần gen lại thân**, chỉ cần dựng lại từ ảnh nguồn sẵn có như bản này (mọi động tác có ảnh nguồn trong `docs/anh-goc/zed/moi/`). Mỗi động tác vẫn phải chạy tách lớp + đánh khớp lại.
- **Nhận xét của tôi:**
  - Game giữ 48 trên màn hình thì giáp gen **không đáng tiền**: ở 48 chỉ còn mảng màu, khác bản máy vẽ không nhiều.
  - Nếu muốn giáp thấy được thật, cần nhân vật hiện **≥ 192 điểm ảnh trên màn hình** (tức ô 384, thu ½).
  - 384 thì ổn về chất lượng, nhưng dung lượng/RAM tăng ×16 và phải chia tấm sprite.
  - Hướng thực tế hơn: **giữ ô 96–192 cho game**, dùng ảnh 384 cho màn hình xem nhân vật / cửa hàng giáp (1 khung đứng, nhẹ).

### Làm thế nào (`tao-co-lon.py`, `tao-rig.py` tự gọi)

1. **Thân ở cỡ k (2 hoặc 4):**
   - Ảnh nguồn `docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png` co BOX (như game) về đúng k × cỡ ở ô 96 (tỉ lệ 0,2255), đặt tại k × vị trí trong `data.json.source.placement`.
   - **Lớp tách: tách lại trên ảnh lớn**, không phóng mặt nạ 96:
     - Chạy chính luật `../tach_lop.py` (khoảng cách tới xương, trên ảnh nguồn) ra 9 nhóm. Hạ về cỡ đích theo trọng alpha.
     - Chia nhỏ theo mặt nạ lớp 96 phóng lên: áo/đai, chân/ống quần.
     - Điểm ảnh lớn lấy lớp 96 tại ô của nó nếu cùng nhóm, khác nhóm thì lấy lớp 96 gần nhất đúng nhóm.
     - Kết quả: 95–96% điểm ảnh trùng lớp 96 phóng lên. Phần còn lại là đường biên mịn hơn (tay/thân, cổ/giáp).
     - Kiểm: ghép 12 lớp lại **đúng từng điểm ảnh** ảnh lớn (sai là dừng).
   - Khác 96: lớp lớn chỉ chứa phần nhìn thấy (không có da dựng thêm dưới áo). Với cách vẽ đủ lớp thì không lộ gì.
2. **Khớp:**
   - Lấy `data.json × k`, đối chiếu khớp đánh tay trên ảnh nguồn (`../khop-nguon.json`) đổi sang cỡ k.
   - **Phát hiện data.json lệch đều −0,5 điểm ảnh ô 96 (lên-trái)** so với tâm điểm ảnh nguồn: 1 điểm ảnh ở 192, 2 điểm ảnh ở 384. Sau khi bù trung vị, lệch còn lại TB 0,08 / tối đa 0,14 (192) và 0,15 / 0,29 (384) điểm ảnh, chỉ do làm tròn.
   - Đã sửa trong tệp chỉnh riêng **`co-lon/khop-co-lon.json`**, không sửa data.json. Cỡ 96 giữ nguyên data.json như R4 để số liệu R4 không đổi.
3. **Giáp Gen theo cỡ:**
   - Thu từ ảnh gốc `giap-gen/goc-*.png` về đúng độ dài xương trung bình × k. Bảng 8 màu lấy từ ảnh (`gen.json`), chọn màu theo ô.
   - Ở cỡ lớn hạ ngưỡng đồng 45% → 35% để viền đồng mảnh không bị thép lấn. Ép viền tối ở mép, giữ đinh tán (cỡ 384).
   - Nearest, mỗi điểm ảnh 1 màu bảng, alpha 0/255, không làm mượt.
   - **Chụp khớp vẽ lại** ở từng cỡ: đĩa tròn, viền tối 1 điểm ảnh (192) / 2 (384), vòm đổ bóng 3 tông. Không phóng chụp 5×5.
4. **Mask back/front làm trên ảnh giáp GỐC** (`nhan/goc/*.png`), rồi hạ cho từng cỡ, **kể cả cỡ 96 bộ Gen** (trạng thái `tu-goc` trong `nhan/nhan.json`).
   - Luật giữ như R4, chỉ làm ở độ phân giải gốc:
     - Xương: dải dưới cùng mỗi cột, dày đúng 1 điểm ảnh ô 96, là back.
     - Ngực: cổ áo sau là back.
   - Vì vậy số "trước" của Gen 96 đổi so với R4 (88 → 128). "Sau" vẫn 0. Khe r3 65 → 75. Nhãn vẫn là **luật đoán, cần người duyệt**.
5. **Trình vẽ:** mỗi cỡ có ngữ cảnh riêng (khớp, lớp thân, mảnh). Chồng mép, bán kính khe, ngưỡng bám, ngưỡng quy tắc "tay ra sau" đều nhân k. Mọi tính năng R4 giữ nguyên: lượt back/front/trong, đổi lớp theo khung (khung 1, 5, 8, 11, 12 ở mọi cỡ), kiểm khe đúng vùng, 8 hướng, 3 cỡ chụp, 5 kiểu báo lỗi.
6. **Trang:**
   - Canvas phóng số nguyên theo DPR, nearest, không nhoè. Cạnh nhau: 96 phóng ×8, 384 phóng ×2 điểm màn hình (điện thoại 390, DPR 3).
   - Trang 1,4 MB < 15 MB nên **nhúng đủ 12 khung cả 384**, không cần cắt.
   - Bộ Máy vẽ chỉ có cỡ 96/48.

### Ảnh soát (`soat/co-lon/`)

- `dien-thoai-390-canh-nhau.png`, `-384.png`, `-192.png`, `-48.png`, `-to-luot-384.png`, `-ca-trang.png`: chụp Chromium 390×844 DPR 3.
- `luoi-12-khung-192.png`, `luoi-12-khung-384.png`: 12 khung, giáp Gen, che theo độ sâu bật, liên tục + 8 hướng, thường + tô lượt.
- `luoi-12-khung-96-vs-384.png`: 96 phóng ×4 và 384 ×1, cùng khổ.
- `can-canh-x3-384.png` (×3), `can-canh-x3-192.png` (×6): cổ, vai, khuỷu, gối, khung 1/4/8/10.
- `chay-384.gif`: liên tục | 8 hướng. `bang-khe-co-lon.md`, `tu-kiem-co-lon.json`.

Chạy lại: `tao-rig.py` → `soat-co-lon.py` (dừng mã 1 nếu lỗi JS, tràn ngang, thứ tự sai, giãn > 15%, mask lỗi hoặc còn khe r2 ở bất kỳ cỡ nào) → `soat-rig.py` → `dong-goi.py`. Đã thử: giải nén ZIP ra chỗ khác, xoá `co-lon/`, `nhan/`, `pass/` và trang, chạy lại thì ra trang **giống từng byte**.

---

## Tóm tắt cho chủ game (R4)

- Mỗi mảnh giáp giờ có **1 ảnh gốc + 1 ảnh nhãn** cùng cỡ: đỏ = phần bị thân che (back), xanh dương = phần đè lên thân (front), lục = dải đổi lớp riêng (tuỳ chọn). Script tự tách ra 3 ảnh lượt cùng cỡ, cùng điểm neo.
- Trình vẽ đặt cả 3 lượt bằng **cùng một phép xoay/giãn**, rồi chèn từng lượt vào đúng chỗ giữa các lớp thân. Mỗi lớp thân vẽ đúng 1 lần, không vẽ lại nhân vật đè lên giáp.
- Có **quy tắc đổi lớp theo khung**: khi tay trước vung ra sau vai, mép trong giáp tay chui xuống dưới thân. Quy tắc này bật ở **khung 1, 5, 8, 11, 12**.
- **Khe ở khớp (đĩa bán kính 2):** từ 116 → **0** (Máy vẽ, liên tục), 117 → **0** (Máy vẽ, 8 hướng), 88 → **0** (Gen, liên tục), 109 → **0** (Gen, 8 hướng). Đĩa bán kính 3 vẫn còn khe, chủ yếu ở **gối** (xem bảng).
- Chụp khớp mặc định giờ là **5×5 gọn** (bản ChatGPT dùng 7×7). Ở bán kính 2 cỡ này vẫn kín 0 khe.
- **Chưa đạt hết:** bộ Gen có 1 chỗ hở ở đầu mảnh: khung 3, chế độ 8 hướng, giáp ống chân trước hở ở cổ chân 1,78 điểm ảnh. Có 46–47 lượt mảnh-khung cần giãn quá ±15% nên bị kẹp lại; phần thiếu được bù bằng chồng mép. Nhãn mask đều **tự sinh, cần người duyệt**.

## 1. Kiểm tra cấu trúc cũ (bản rig-chatgpt) — giữ gì, sửa gì

| Chỗ trong bản ChatGPT | Đánh giá | Bản này |
|---|---|---|
| `tach-pass-giap.py` cắt đôi ảnh xương theo bề dày (nửa trên back, nửa dưới front) | Sai: nửa trên là **mặt giáp**, cắt vậy làm nửa mặt giáp chui xuống dưới tay/chân | Back chỉ là **viền dưới cùng mỗi cột** (mép trong). Phần còn lại là front |
| Cắt đôi chụp khớp trên/dưới | Sai: chụp đặt đè lên khớp | Cả chụp là front (khai báo `vungRong: back, trong`) |
| Giáp ngực: 30% đầu cổ là back (cổ áo sau) | Hợp lý một nửa | Giữ, nhưng chỉ lấy **nửa phía lưng** của đoạn đó |
| Nới ảnh 2 điểm ảnh và **ghi đè ảnh gốc** (neo +2, chạy lại không ổn định) | Sai yêu cầu "giữ ảnh gốc" | Ảnh gốc **không đổi**. Chồng mép do trình vẽ kéo dài điểm ảnh mép lúc vẽ (`overlapStart/overlapEnd`) |
| Tiêu chí "bám" bỏ qua đầu mảnh không có chụp | Nới lỏng | Kiểm **cả 2 đầu** mọi mảnh xương, kể cả cổ tay/cổ chân không có chụp |
| Đo khe: mọi điểm ảnh tay/chân quanh khớp, kể cả chỗ đã bị lớp khác che | Đo sai vùng | Chỉ đếm điểm ảnh **thân của chi đó còn thấy được** sau khi vẽ đủ lớp |
| Kẹp giãn 0,85–1,15, giữ 8 hướng, khớp từ data.json, `layerOrder` | Đúng | Giữ nguyên |

## 2. Thay đổi theo file / hàm

**`tao-rig.py`** (viết lại)
- Vẽ ảnh giáp gốc bộ Máy vẽ từ mã ký tự: 3 mảnh xương, mỗi chụp khớp có 3 cỡ — `nho` (cỡ gốc), `gon` 5×5, `to` 7×7.
- Gọi `tao-giap-gen.py` (giữ nguyên bản cũ) khi chưa có `giap-gen/gen.json` hoặc khi chạy với `--gen`. Vẽ 3 cỡ chụp khớp tô màu Gen.
- Gọi `tao-mask.py`, ghi `rig.json` (version 2), dựng `kiem-tra-rig.html`.
- Hàm `lop()`, `bone()`, `cap()` khai báo cho từng mảnh: `chi` (lớp thân của chi mang giáp) và `vung.back/front/trong` (mỗi vùng `{"before": lớp}` hoặc `{"after": lớp}`).

**`tao-mask.py`** (mới, thay `tach-pass-giap.py`)
- `sinh_nhan()`: sinh ảnh nhãn tự động theo luật.
- `doc_nhan()`: kiểm ảnh nhãn — cùng cỡ ảnh gốc, chỉ dùng 3 màu thuần, mọi điểm ảnh có hình phải có nhãn.
- `tach()`: tách ra `pass/<bộ>/<ảnh>-back|front|trong.png`, rồi tự ghép lại để so với ảnh gốc (phải trùng từng điểm ảnh).
- Sổ `nhan/nhan.json` ghi trạng thái từng nhãn. Nhãn đánh dấu `da-duyet` thì chạy lại sẽ **không bị ghi đè**. Đã thử: sửa tay 1 nhãn, đánh dấu `da-duyet`, chạy lại thì nhãn được giữ và các lượt được tách theo nhãn sửa tay.

**`rig.json`** (mới thêm)
- `pieces[].nhan`, `chi`, `vung`, `vungRong`.
- `chongKhop.mac = 2`: số điểm ảnh chồng qua khớp.
- `chupKhop.co = "gon"`: cỡ chụp khớp đang dùng.
- `quyTacLop`: quy tắc `tayRaSau` (cổ tay trước lùi ra sau đường dọc qua vai trước quá 1 điểm ảnh → vùng back của giáp cẳng tay + giáp bắp tay trước vẽ dưới lớp `body`).
- `huongMat: "phai"`: nhân vật nhìn sang phải.

**`kiem-tra-rig.tmpl.html`** (phần script viết lại)
- `loadArt()`: nạp ảnh gốc + 3 lượt, kiểm mask (cùng cỡ, khớp màu ảnh gốc, không thiếu, không chồng, back/front không rỗng nếu không khai báo).
- `place()`: một ma trận cho mọi lượt của mảnh. Neo đầu đặt đúng vào khớp, xoay theo xương, giãn kẹp 0,85–1,15. Chụp khớp đặt tâm ảnh vào khớp, không xoay.
- `extOf()`: kéo dài mép mỗi hàng theo **ảnh gốc**. Điểm kéo dài thuộc lượt đang giữ điểm mép, nên back/front không giẫm lên nhau và vẫn chung neo.
- `drawPass()`: vẽ 1 lượt (cả ô ×2).
- `ruleState()`, `lopOf()`: tính quy tắc đổi lớp từng khung.
- `buildPlan()`: kế hoạch vẽ. Với mỗi lớp theo `layerOrder`: lượt "before" → lớp thân → lượt "after".
- `renderFrame()`: vẽ theo kế hoạch đó.
- `selfCheck()`: chạy đủ 12 khung × 2 chế độ góc (liên tục, 8 hướng) × mọi cấu hình. Gồm `checkPlan()` (thứ tự), `gapsOf()` + `ownerMap()` (khe), bám 2 đầu, giãn, rung.
- Giao diện mới:
  - Ô **Xem lượt**: bình thường / tô màu / chỉ back / chỉ front.
  - Ô **Chụp khớp**: nhỏ / gọn / to.
  - Bảng **thứ tự vẽ** của khung đang xem.
  - Bảng **khe theo khung × chế độ** (trước → sau, r2/r3).
  - Bảng **so cỡ chụp**.
  - Nút debug "Đường thân".
  - Thêm 2 kiểu "thử báo lỗi": mask sai cỡ, lớp vẽ sai.

**`soat-rig.py`** (viết lại)
- Chụp Chromium 390×844 DPR 3 (thường / tô lượt / debug / cả trang) và 1280×800.
- Thử 5 kiểu lỗi.
- Lưới 12 khung (thường và tô lượt), ảnh soi ×6, GIF.
- Xuất `tu-kiem.json`, `bang-khe.md`.
- Dừng mã 1 nếu có lỗi JS, tràn ngang, thứ tự sai, giãn quá, mask lỗi, hoặc còn khe r2.

**`dong-goi.py`** (mới): đóng gói `rig-do-sau.zip`.

Đã xoá khỏi thư mục mới: `tach-pass-giap.py`, `soat-giap-gen.py`, `bao-cao-rig.md` cũ của ChatGPT (bản gốc vẫn còn trong `rig-chatgpt/`).

## 3. Phần tự động hoá / phần cần chỉnh mask thủ công

**Tự động:**
- Vẽ/cắt ảnh gốc, sinh nhãn lần đầu, tách lượt, ghép kiểm.
- Đặt/xoay/giãn từng khung, chồng mép, đặt chụp khớp.
- Chọn lớp từng khung theo quy tắc.
- Mọi phép kiểm và ảnh soát.

**Cần người duyệt / chỉnh tay** (cả 44 ảnh nhãn đang là `tu-dong-can-duyet`):

1. **Giáp vai, cẳng tay, ống chân (cả 2 bộ):**
   - Luật tự động: lấy viền dưới cùng mỗi cột làm "mép trong" (back). Đây là đoán theo hướng vẽ ảnh: hàng dưới = phía lưng khi xương chĩa xuống.
   - Người vẽ nên tô lại đúng chỗ thật sự bị chi che (dây buộc, mép ôm ra sau).
2. **Giáp ngực Gen:** vùng cổ áo sau đang là hình chữ nhật (30% đầu cổ × nửa phía lưng). Nên tô theo đúng đường cổ áo.
3. **Quy tắc `tayRaSau`:**
   - Ngưỡng 1 điểm ảnh, đường dọc qua vai trước.
   - Đã thử đường cổ → giữa hông nhưng bỏ: khớp tay trước của Cu Tí gần như luôn nằm sau đường đó (khuỷu 12/12, cổ tay 11/12 khung), nên không tách được pha vung.
   - Cần người xem 5 khung đổi lớp (1, 5, 8, 11, 12) để duyệt.
4. **Cách sửa tay:**
   - Mở `nhan/<bộ>/<ảnh>.png` bằng trình vẽ pixel, tô đỏ / xanh dương / lục thuần.
   - Đổi `trangThai` thành `"da-duyet"` trong `nhan/nhan.json`.
   - Chạy `python3 docs/thu-modular-96/rig-do-sau/tao-rig.py`.

## 4. Bảng khe trước / sau

**Cách đo:**
- Vẽ đủ lớp, lấy lớp trên cùng ở từng điểm ảnh.
- Trong đĩa bán kính r quanh 6 khớp (vai, khuỷu, gối × trước/sau), đếm điểm ảnh mà lớp trên cùng là thân của chính chi đó.
- **Trước** = không chụp khớp, không chồng mép (chỉ đặt mảnh theo khớp).
- **Sau** = chụp gọn 5×5 + chồng mép 2 điểm ảnh.
- LT = xoay liên tục, 8H = làm tròn 8 hướng.

### Bộ Máy vẽ

| Khung | LT r2 trước | LT r2 sau | LT r3 trước | LT r3 sau | 8H r2 trước | 8H r2 sau | 8H r3 trước | 8H r3 sau |
|---|---|---|---|---|---|---|---|---|
| 1 | 12 | 0 | 35 | 8 | 11 | 0 | 35 | 9 |
| 2 | 11 | 0 | 34 | 5 | 10 | 0 | 35 | 7 |
| 3 | 10 | 0 | 33 | 11 | 9 | 0 | 28 | 11 |
| 4 | 7 | 0 | 24 | 5 | 8 | 0 | 25 | 6 |
| 5 | 9 | 0 | 33 | 5 | 6 | 0 | 27 | 3 |
| 6 | 14 | 0 | 37 | 11 | 13 | 0 | 36 | 13 |
| 7 | 10 | 0 | 34 | 8 | 12 | 0 | 34 | 7 |
| 8 | 10 | 0 | 36 | 7 | 12 | 0 | 37 | 10 |
| 9 | 11 | 0 | 29 | 3 | 10 | 0 | 31 | 7 |
| 10 | 5 | 0 | 29 | 5 | 5 | 0 | 28 | 4 |
| 11 | 7 | 0 | 27 | 4 | 8 | 0 | 29 | 4 |
| 12 | 10 | 0 | 32 | 7 | 13 | 0 | 37 | 9 |
| **Tổng** | **116** | **0** | **383** | **79** | **117** | **0** | **382** | **90** |

### Bộ Gen

| Khung | LT r2 trước | LT r2 sau | LT r3 trước | LT r3 sau | 8H r2 trước | 8H r2 sau | 8H r3 trước | 8H r3 sau |
|---|---|---|---|---|---|---|---|---|
| 1 | 8 | 0 | 29 | 7 | 12 | 0 | 35 | 7 |
| 2 | 7 | 0 | 32 | 3 | 11 | 0 | 34 | 4 |
| 3 | 8 | 0 | 28 | 9 | 8 | 0 | 27 | 11 |
| 4 | 7 | 0 | 22 | 3 | 6 | 0 | 22 | 4 |
| 5 | 4 | 0 | 24 | 4 | 5 | 0 | 25 | 4 |
| 6 | 8 | 0 | 28 | 10 | 10 | 0 | 31 | 7 |
| 7 | 7 | 0 | 26 | 7 | 14 | 0 | 34 | 8 |
| 8 | 7 | 0 | 34 | 6 | 9 | 0 | 35 | 7 |
| 9 | 10 | 0 | 27 | 1 | 9 | 0 | 25 | 3 |
| 10 | 7 | 0 | 25 | 2 | 6 | 0 | 25 | 3 |
| 11 | 6 | 0 | 23 | 5 | 7 | 0 | 25 | 4 |
| 12 | 9 | 0 | 31 | 8 | 12 | 0 | 34 | 7 |
| **Tổng** | **88** | **0** | **329** | **65** | **109** | **0** | **352** | **69** |

Khe r3 còn lại theo từng khung và khớp: xem `soat/bang-khe.md`. Gần như tất cả ở **gối trước/sau**, vài điểm ở khuỷu trước. Chân rộng hơn chụp 5×5, nên mép ống quần quanh gối vẫn lộ trong bán kính 3. Đó có thể là phần thân đúng ra phải lộ, không hẳn là "hở giáp".

### So cỡ chụp khớp (tổng 12 khung; chồng mép 2 điểm ảnh, trừ dòng "Trước")

| Cấu hình | Máy vẽ LT r2 | Máy vẽ LT r3 | Máy vẽ 8H r2 | Máy vẽ 8H r3 | Gen LT r2 | Gen LT r3 | Gen 8H r2 | Gen 8H r3 |
|---|---|---|---|---|---|---|---|---|
| Trước (không chụp, không chồng) | 116 | 383 | 117 | 382 | 88 | 329 | 109 | 352 |
| Chỉ chồng mép, không chụp | 85 | 243 | 81 | 248 | 42 | 149 | 53 | 169 |
| Chụp nhỏ (vai 5×5, khuỷu/gối 4×4) | 12 | 168 | 13 | 179 | 2 | 108 | 2 | 117 |
| **Chụp gọn 5×5 (đang dùng)** | **0** | **79** | **0** | **90** | **0** | **65** | **0** | **69** |
| Chụp to 7×7 (cỡ ChatGPT) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Chồng mép 1 / 2 / 3 điểm ảnh, với chụp gọn, cho r2 đều bằng 0. Khác nhau ở tiêu chí bám 2 đầu:
- Chồng 1: Máy vẽ 9/12 khung, Gen 8/12.
- Chồng 2: Máy vẽ 12/12, Gen 11/12.
- Chồng 3: 12/12 cả hai bộ, nhưng mảnh trông dài lố.

Chọn **2**. Muốn thử số khác thì mở trang với `?ov=1` hoặc `?ov=3`.

## 5. Kết quả các phép kiểm khác

Chạy `soat-rig.py`: hai bộ đều qua, không lỗi JS, không lỗi tải ảnh, không tràn ngang ở 390 px.

| Tiêu chí | Máy vẽ | Gen |
|---|---|---|
| Thứ tự lượt vẽ đúng (mỗi lớp thân 1 lần, mỗi lượt 1 lần, back dưới chi, front trên chi) | 12/12 khung × 2 chế độ | 12/12 × 2 |
| Mask (cùng cỡ, ghép lại đúng ảnh gốc, không chồng, không rỗng ngoài khai báo) | 0 lỗi | 0 lỗi |
| Bám **cả 2 đầu** (≤ 1,5 điểm ảnh) | 12/12 | **11/12** |
| Giãn ngoài 0,85–1,15 | 0 | 0 |
| Lượt mảnh-khung bị kẹp giãn (xương dài/ngắn hơn ảnh quá 15%) | 47 | 46 |
| Rung ở 8 hướng (nhảy 45° dù xương xoay ít) | 8 khung | 11 khung |

Chỗ Gen chưa bám được: **khung 3, chế độ 8 hướng, giáp ống chân trước, đầu cuối (cổ chân), lệch 1,78 điểm ảnh**. Nguyên nhân: làm tròn góc về 45° làm đầu mảnh lệch ngang. Chế độ liên tục không bị.

Trang tự báo lỗi đúng với cả 5 kiểu lỗi giả lập: thiếu khớp, thiếu ảnh lượt, neo sai, mask sai cỡ, lớp vẽ sai.

## 6. Giới hạn — chưa chứng minh được

- **"0 khe"** chỉ đúng cho phép đo đĩa bán kính 2 quanh 6 khớp vai/khuỷu/gối. Bán kính 3 còn khe (bảng trên). Khớp cổ tay, cổ chân, cổ chỉ được soát bằng mắt (ảnh ×6) và kiểm bám, không đo khe.
- Phép đo khe không phân biệt "thân lộ vì hở giáp" với "thân lộ vì giáp vốn hẹp hơn chi". Ở gối, phần lớn số r3 có lẽ là loại sau. Cần người xem ảnh soi ×6.
- Nhãn back/front là luật đoán, chưa có người làm asset duyệt. Phép kiểm chỉ chứng minh nhãn **hợp lệ** (đúng cỡ, đủ, không chồng), không chứng minh nhãn **đúng nghĩa**.
- Quy tắc đổi lớp chỉ có 1 cái (tay trước). Chân và tay sau dùng lớp cố định.
- Kẹp giãn ±15% làm 46–47 lượt mảnh ngắn/dài hơn xương. Phần thiếu được chồng mép và chụp khớp che, nhưng ảnh không theo đúng độ dài xương.
- Chưa thêm ô chọn động tác (`rig/dong-tac/*/` đã có), vì ưu tiên làm đúng hàng chạy. Ô ×2 (192) vẫn chạy, nhưng không đưa vào phép đo.

## 7. Tệp ra

- `kiem-tra-rig.html`: trang thử tự chứa (~197 KB).
- `rig.json`.
- `nhan/` (ảnh nhãn + `nhan.json`).
- `pass/` (lượt back/front/trong).
- `giap/`, `giap-gen/` (ảnh gốc).
- `soat/`:
  - `dien-thoai-390*.png`, `may-tinh-1280.png`, `bao-loi-*.png`
  - `luoi-12-khung.png`, `luoi-luot.png`
  - `soi-x6-lien-tuc.png`, `soi-x6-8-huong.png` (khung 1, 4, 8, 10)
  - `chay-rig.gif`, `tu-kiem.json`, `bang-khe.md`
- `rig-do-sau.zip` (cập nhật 16/10 chiều, ~20 MB): thư mục này + `data.json`, `khop-nguon.json`, `tach_lop.py`, các sheet thân dùng tới, ảnh gen nguồn, 12 ảnh nguồn hàng chạy; giữ cấu trúc `docs/`. Chạy lại được bằng `python3 docs/thu-modular-96/rig-do-sau/tao-rig.py --gen`. Đã thử: giải nén ra chỗ khác, xoá hết ảnh/nhãn/lượt, chạy lại thì ra trang **giống từng byte**.

Chạy lại toàn bộ:
```
python3 docs/thu-modular-96/rig-do-sau/tao-rig.py      # (--gen để cắt lại bộ Gen từ ảnh gen nguồn)
python3 docs/thu-modular-96/rig-do-sau/soat-rig.py
python3 docs/thu-modular-96/rig-do-sau/dong-goi.py
```
