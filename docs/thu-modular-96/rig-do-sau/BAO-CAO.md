# Rig giáp theo độ sâu (back / front) — báo cáo

Làm theo yêu cầu chủ game 16/10 11:15. Thư mục mới `docs/thu-modular-96/rig-do-sau/`, khởi đầu từ bản copy `rig-chatgpt/` (commit đầu tiên giữ nguyên bản copy để so). **Không sửa** `rig/`, `rig-chatgpt/`, code game, ảnh nguồn (`../data.json`, `../sheets/`, `../anh-gen/` chỉ đọc). Chỉ dùng Cu Tí mới, hàng chạy 12 khung.

**Mở thử:** `kiem-tra-rig.html` (1 tệp tự chứa, mở thẳng bằng trình duyệt) hoặc giải nén `rig-do-sau.zip`.

## Tóm tắt cho chủ game

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
- `rig-do-sau.zip`: thư mục này + `data.json` + các sheet thân dùng tới + ảnh gen nguồn. Chạy lại được bằng `python3 thu-modular-96/rig-do-sau/tao-rig.py --gen`. Đã thử: giải nén ra chỗ khác, xoá hết ảnh/nhãn/lượt, chạy lại thì ra trang **giống từng byte**.

Chạy lại toàn bộ:
```
python3 docs/thu-modular-96/rig-do-sau/tao-rig.py      # (--gen để cắt lại bộ Gen từ ảnh gen nguồn)
python3 docs/thu-modular-96/rig-do-sau/soat-rig.py
python3 docs/thu-modular-96/rig-do-sau/dong-goi.py
```
