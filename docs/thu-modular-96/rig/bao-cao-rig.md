# Báo cáo: thử rig gắn giáp lên khớp (16/10)

> Mới: đã thử **giáp gen thật** (4 mảnh). Xem mục **"Giáp gen thật"** ngay dưới phần "Nói ngắn gọn" của bộ máy vẽ.

> Mới nhất (16/10 chiều): **sửa lệch vai, hở khớp về 0, thêm 8 động tác**. Xem 3 mục **"Sửa lệch vai"**, **"Hở khớp về 0"**, **"Nhiều động tác"** ngay dưới đây.

> Mới nhất (16/10, sau R1): **áp dụng đề xuất ChatGPT + che theo độ sâu** (sửa lỗi "giáp lắp đè, cổ không che được giáp"). Xem mục ngay dưới.

## Áp dụng đề xuất ChatGPT + che theo độ sâu

### Nói ngắn gọn

- **Vấn đề 1 (giáp lắp đè) đã sửa.** Trang có thêm công tắc **"Che theo độ sâu: Tắt / Tách trước-sau / Che bằng lớp người"**. **Mặc định là "Che bằng lớp người"** vì đẹp nhất:
  - Cổ, cằm, tóc và tay trước giờ **nằm trên** giáp ngực và giáp vai, không bị giáp đè nữa.
  - Giáp bên SAU (tay sau, chân sau) ở 8 động tác dùng sheet cả người giờ **nhìn thấy được** (trước đây bị sheet che mất hẳn), nhưng vẫn bị thân che đúng chỗ.
  - Số điểm ảnh "đè sai" (giáp vẽ lên phần người lẽ ra ở trước nó) **về 0 ở cả 9 động tác, cả 2 bộ**. Lúc Tắt, riêng bộ Gen có 86–439 điểm ảnh đè sai mỗi động tác, hầu hết là giáp ngực đè lên cổ.
- **Vấn đề 2 (hở khớp):** hở vẫn **= 0 ở mọi khung**: 9 động tác × 2 bộ × 2 chế độ xoay × 3 cách che × 2 kiểu giáp vai × 2 kiểu kéo giãn (216 tổ hợp). Script dựng trang **dừng lỗi thật (mã 1)** nếu còn 1 điểm ảnh hở; đã thử cố ý tắt luật chụp khớp và script dừng đúng.
  - Thêm **chồng mép 1,5 điểm ảnh** ở 2 đầu mỗi mảnh xương (ý a của ChatGPT), nên chỗ khớp **kín hơn ngay cả trước khi có chụp khớp**. Ví dụ hàng chạy: hở trước khi chụp 90 → 27 (Máy vẽ), 121 → 46 (Gen).
- **Không làm theo ChatGPT ở 2 điểm** (lý do ở dưới): (1) **không bỏ chế độ 8 hướng**, vẫn giữ 2 chế độ để so; (2) **không bỏ kẹp chiều dài** làm mặc định, vì bỏ kẹp làm giáp bị kéo dài trung bình 49%, có khung tới 2,7 lần.

### Đã áp dụng gì từ đề xuất ChatGPT

| Ý | Làm gì | Kết quả |
|---|---|---|
| (a) Chồng mép `overlapStart/overlapEnd` | **Đã áp**, 1,5 điểm ảnh mỗi đầu, cho mọi mảnh xương của 2 bộ (trừ giáp vai kiểu "trộn": neo tại vai, không kéo). | Hở trước khi có chụp khớp giảm ở mọi động tác (bảng dưới). |
| (a) Bỏ kẹp chiều dài | **Không làm mặc định.** Thêm công tắc **"Kéo giãn: Kẹp + chồng mép / Không kẹp (ChatGPT)"** để chủ game tự so. | Xem bảng "Đo kéo giãn". |
| (b) Vẽ 2 lượt `backImage/frontImage` ở lớp sâu/nông | **Đã áp**, dùng đúng tên trường của ChatGPT (`backImage`, `frontImage`, `backAfter`, `frontAfter`) trong `rig.json` → `depth`. Thêm kiểm lỗi: thiếu ảnh tách, sai cỡ, lớp không tồn tại → báo khung đỏ và vẽ nguyên mảnh. | Là cách "Tách trước-sau". |
| (c) Bỏ chế độ 8 hướng | **Không làm** (theo yêu cầu): giữ 2 cột "Xoay liên tục" và "Làm tròn 8 hướng". | |
| (d) Họ chưa tách ảnh trước/sau | **Đã làm thật:** tự tạo ảnh tách cho mọi mảnh xương của **cả 2 bộ** (máy vẽ: 10 ảnh, gen: 32 ảnh gồm cả bản ×2). | |

Ghi chú: một phiên khác đã lưu nguyên bản ChatGPT ở `../rig-chatgpt/`. Tôi không dùng thư mục đó, chỉ áp ý của patch vào bản R1 trong `rig/`.

### Đo kéo giãn (vì sao giữ kẹp)

"Kéo giãn" = độ dài ảnh giáp sau khi đặt ÷ độ dài gốc của ảnh. 1,00 = đúng cỡ vẽ. Mỗi ô ghi Máy vẽ · Gen.

| Động tác | Nếu bỏ kẹp: giãn lớn nhất | Lượt mảnh-khung vượt ×1,3 nếu bỏ kẹp | Hụt khớp cuối > 1,5đ: R1 → kẹp + chồng mép |
|---|---|---|---|
| Chạy | +118% · +104% | 32/48 · 30/60 | 2 → 2 · 1 → 1 |
| Chạy cầm thương | +164% · +170% | 44/47 · 41/59 | 4 → 4 · 4 → 4 |
| Chết | +169% · +144% | 22/22 · 25/26 | 12 → 12 · 10 → 10 |
| Đi | +77% · +81% | 22/32 · 20/40 | 0 → 0 · 0 → 0 |
| Đứng | +47% · +51% | 16/32 · 16/40 | 0 → 0 · 0 → 0 |
| Chém kiếm 1 | +71% · +75% | 14/15 · 16/20 | 0 → 0 · 0 → 1 |
| Lăn | +97% · +101% | 12/14 · 12/17 | 1 → 1 · 1 → 1 |
| Phi tiêu | +114% · +119% | 20/22 · 18/28 | 1 → 1 · 3 → 3 |
| Trúng đòn | +109% · +89% | 15/16 · 16/20 | 0 → 0 · 0 → 0 |

- **Giãn trung bình** trên mọi mảnh-khung: bản R1 **+2%**, kẹp + chồng mép **+26%**, bỏ kẹp (ChatGPT) **+49%**.
- **Nếu bỏ kẹp, 391/558 lượt mảnh-khung bị kéo quá ×1,3.** Lý do: mảnh chỉ dài 6–11 điểm ảnh, cộng thêm 3 điểm ảnh chồng mép là đã dài hơn 30–50%. Ở hàng chết, giáp cẳng tay bị kéo gần **gấp 2,7 lần**: mỗi điểm ảnh thành 2–3 điểm ảnh, đường viền và chấm đồng bị kéo thành vệt. → **méo quá, nên giữ kẹp.**
- **Cách đã chọn ("Kẹp + chồng mép", mặc định):** vẫn kẹp trong ×0,75–×1,3 như R1. Nếu không đủ độ giãn thì **bớt chồng mép ở đầu trước**, ưu tiên chạm khớp cuối. Nhờ vậy số khung bám khớp **không bao giờ kém hơn R1** (bảng trên: cột hụt khớp cuối giữ nguyên). Đổi lại, giáp dài hơn R1 trung bình 24%.
- Bỏ kẹp có lợi: bám khớp liên tục đủ mọi khung, ví dụ Chết 3 → 8/8, Chạy cầm thương 10 → 12/12. Nhưng chính các khung đó là khung bị kéo dài nhất. Hai động tác này nên soát lại khớp (xương dài bất thường), không nên kéo giáp theo.

### Tách trước/sau làm thế nào (`tach_truoc_sau.py`)

Script tự cắt mỗi ảnh mảnh giáp thành 2 ảnh **cùng cỡ, cùng điểm neo**: ảnh "sau" và ảnh "trước". Phần không thuộc ảnh nào thì trong suốt. Cắt theo quy tắc, **không vẽ tay**. Trục x của ảnh là chiều xương, đầu xương ở bên trái.

| Mảnh | Lượt SAU (vẽ dưới) | Lượt TRƯỚC (vẽ trên) |
|---|---|---|
| Giáp ngực (Gen) | **Cổ áo**: 3 cột gần cổ. Cộng **mép lưng**: 1 điểm ảnh ngoài cùng ở phía lưng. Vẽ dưới cổ, đầu, tay trước. | Mặt ngực: trên thân, dưới chân trước, tay trước, đầu. |
| Giáp vai | **Mép trong** sát cổ/thân: 2 cột phía khớp vai. Vai trước: dưới cổ, tay trước, đầu. Vai sau: dưới tay sau. | Vỏ ngoài: trên lớp tay. |
| Cẳng tay, ống chân | **Nửa phía thân**: dưới lớp chi của nó. | Nửa ngoài + hàng giữa: trên lớp chi. |
| Chụp khớp | Không tách, luôn nằm trên lớp chi. | |

- **Chọn theo khung (tự động):**
  - Cẳng tay/ống chân: "nửa phía thân" lấy theo phía nào của xương quay về trục cổ → giữa hông ở khung đó.
  - Giáp ngực: "phía lưng" lấy theo hướng mũi chân. Nếu 2 bàn chân quay khác hướng (dáng đứng nhìn chính diện), chỉ tách cổ áo, không tách mép lưng.
  - Muốn ép tay một khung thì ghi vào `depthOverrides` trong `rig.json`. Hiện chưa cần.
- **Lớp người.** Muốn "vẽ dưới cổ" thì phải biết điểm ảnh nào là cổ. Script gán mỗi điểm ảnh người vào 1 trong 7 lớp: chân sau, tay sau, thân, **cổ**, chân trước, tay trước, đầu (gồm tóc, cằm). Kết quả lưu ở `nhan/<động tác>.png`.
  - **Hàng chạy:** lấy từ lớp tách thật. Cổ = phần thân ngay dưới cằm.
  - **8 động tác sheet cả người:** gán theo **ống xương gần nhất** dựa vào khớp. Tay trước được ưu tiên; khớp bị che thì bỏ qua.
  - Soát bằng mắt: `soat/nhan-lop-nguoi.png` (người | màu lớp). Trong trang bật ô **"Tô màu lớp người"**.
  - Đúng ở dáng đứng/chạy/đi. **Kém ở dáng cuộn tròn** (Lăn khung 3–4) và **nằm** (Chết khung 6–8). Ở các khung đó phần lớn khớp bị che nên giáp đã ẩn, nên ảnh hưởng ít.

### Hai cách che: so sánh

- **Tách trước-sau:** vẽ ảnh "sau" ở lớp sâu, ảnh "trước" ở lớp nông.
- **Che bằng lớp người:** vẽ **nguyên mảnh**, rồi vẽ lại **đúng điểm ảnh** của các lớp người lẽ ra ở trước (cổ, đầu/cằm/tóc, tay trước; với mảnh bên sau thì cả thân) **chỉ trong vùng của mảnh đó**.

Số đo cả chu kỳ, xoay liên tục, giáp vai trộn, kẹp + chồng mép. Mỗi ô ghi Máy vẽ · Gen.

| Động tác | Đè sai: Tắt | Đè sai: Tách | Đè sai: Lớp người | Giáp còn thấy: Tách | Giáp còn thấy: Lớp người |
|---|---|---|---|---|---|
| Chạy | 0 · 86 | 0 · 21 | **0 · 0** | 79% · 84% | **99% · 97%** |
| Chạy cầm thương | 0 · 439 | 0 · 33 | **0 · 0** | 103% · 86% | 129% · 105% |
| Chết | 2 · 92 | 2 · 5 | **0 · 0** | 110% · 94% | 129% · 115% |
| Đi | 0 · 155 | 0 · 28 | **0 · 0** | 121% · 103% | 144% · 118% |
| Đứng | 0 · 178 | 0 · 48 | **0 · 0** | 135% · 113% | 175% · 133% |
| Chém kiếm 1 | 3 · 149 | 3 · 17 | **0 · 0** | 116% · 91% | 135% · 107% |
| Lăn | 0 · 122 | 0 · 8 | **0 · 0** | 123% · 98% | 148% · 118% |
| Phi tiêu | 0 · 180 | 0 · 29 | **0 · 0** | 141% · 106% | 161% · 121% |
| Trúng đòn | 0 · 126 | 0 · 12 | **0 · 0** | 132% · 106% | 167% · 127% |

- **Đè sai:** điểm ảnh người lẽ ra ở TRƯỚC mảnh giáp mà bị giáp vẽ đè. Chỉ tính điểm ảnh người đặc (không tính mép mờ). Lúc Tắt, gần như toàn bộ là **giáp ngực Gen đè lên cổ**, đúng như chủ game báo.
- **Giáp còn thấy:** so với lúc Tắt. Trên 100% vì ở sheet cả người, lúc Tắt giáp bên sau bị che hết, giờ thì hiện ra.
- **Hở:** = 0 ở cả 3 cách.

**Chọn "Che bằng lớp người" làm mặc định**, vì:

1. Đè sai = 0 ở mọi động tác. "Tách" vẫn còn 5–48 điểm ảnh: mặt ngực vẫn đè phần cổ nằm ngoài dải cổ áo.
2. Giữ nguyên hình giáp. "Tách" giấu nửa trong của cẳng tay/ống chân dưới tay/chân, nên giáp mỏng đi một nửa: ở hàng chạy chỉ còn 79–84% điểm ảnh giáp. Giáp máy vẽ dày 4 điểm ảnh, mất 2 hàng thì trông như vòng mỏng.
3. Nhìn ảnh soát ×6 (`soat/do-sau-*.png`): ở "Che bằng lớp người", cổ và cằm nổi lên trên cổ áo, giáp vai không che cổ, tay trước nằm trên giáp ngực. Ở "Tách", cẳng tay bị "lủng" nửa trong.
4. "Tách" vẫn có ích khi muốn giáp **ôm quanh** chi (ví dụ vòng tay nhìn thấy cả mặt sau). Tôi giữ nó để so, và giữ ảnh tách cho phiên sau.

### Xem ở đâu (phần mới)

| Tệp | Là gì |
|---|---|
| `kiem-tra-rig.html` | Có thêm: công tắc **Che theo độ sâu**, công tắc **Kéo giãn**, bảng **So 3 cách che** (bấm 1 dòng để chuyển), bảng **Kéo giãn**, ô **Tô màu lớp người**, mục báo lỗi mới "Thiếu ảnh tách giáp ngực gen". |
| `soat/do-sau-<động tác>.png` | **Nên xem trước.** 4 khung tiêu biểu mỗi động tác, phóng ×6 quanh cổ–vai–tay. 6 hàng = Máy vẽ/Gen × Tắt/Tách/Lớp người. |
| `soat/do-sau-tong.png` | Cả 9 động tác, toàn thân ×3, 3 cách cạnh nhau (bộ Gen). |
| `soat/do-sau.gif`, `soat/do-sau-chay.gif` | Chạy cạnh nhau 3 cách (mọi động tác; riêng hàng chạy có cả 2 bộ). |
| `soat/nhan-lop-nguoi.png` | Soát nhãn lớp người (người \| màu lớp) mọi động tác. |
| `soat/dien-thoai-390-sau-*.png` | Chụp trang trên điện thoại 390×844 (DPR 3): Tắt/Tách/Lớp người (Chạy Gen), Đứng Gen/Máy vẽ, bảng so, bảng kéo giãn, tô màu lớp, cả trang. Đã kiểm: **không tràn ngang**; canvas phóng số nguyên (K = 8 điểm ảnh máy / điểm ảnh nguồn ở DPR 3). |
| `soat/bao-loi-tach.png` | Khung đỏ khi cố ý xoá 1 ảnh tách. |
| `giap/tach/`, `giap-gen/tach/` | Ảnh tách trước/sau (`…-sau.png` / `…-truoc.png`, bản gen có `-x2`). |
| `nhan/<động tác>.png` | Nhãn lớp người (kênh đỏ = số lớp 1..7). |
| `soat/tu-kiem-dong-tac.json` | Số tự kiểm mọi tổ hợp, khoá `"<giáp vai>\|<che>\|<kéo giãn>"`, ví dụ `"tron\|lop\|kep"`. |

Chạy lại (theo thứ tự):

```
python3 docs/thu-modular-96/rig/tao-rig.py --soat-nhan   # tách ảnh + nhãn lớp + dựng trang + tự kiểm hở 216 tổ hợp (còn hở → mã 1)
python3 docs/thu-modular-96/rig/soat-do-sau.py           # ảnh soát ×6, GIF, chụp điện thoại
```

### Còn hạn chế

- Nhãn lớp người của sheet cả người là **đoán theo khớp**. Chỗ tay trước nằm sát thân có thể lẫn 1–2 điểm ảnh. Muốn chính xác như hàng chạy thì cần tách lớp các động tác đó.
- Ảnh soát cũ (`soat/luoi-dong-tac.png`, `soat/dien-thoai-390-dt-*.png`…) là ảnh của bản R1, **chưa chụp lại** theo mặc định mới. Ảnh mới nằm ở `soat/do-sau-*` và `soat/dien-thoai-390-sau-*`.
- Ở cỡ game 48×48, khác biệt giữa 3 cách chỉ còn 1–3 điểm ảnh quanh cổ. Rõ nhất ở ô 96 và khi phóng to.

## Sửa lệch vai (hàng chạy)

### Nói ngắn gọn

- **Nguyên nhân lệch có 2 phần:**
  1. **Khớp vai trước đánh sai ở cả 12 khung.** Vai được chấm ở mép thân hoặc ra ngoài hình người, không nằm ở đầu bắp tay. Nặng nhất là khung 2, 6, 7, 8, 12: lệch 7–13 điểm ảnh trên ảnh nguồn cao, tức khoảng 2 điểm ảnh ở ô 96. Khung 7 chấm hẳn ra nền.
  2. **Toàn bộ khớp trong `data.json` lệch lên-trái 0,5 điểm ảnh.** Công thức đổi toạ độ (`tach_lop.doi_diem`) trừ 0,5, trong khi trang vẽ lại coi "x,5 = tâm điểm ảnh". Lỗi này có ở mọi khớp, mọi khung. Phiên R2 cũng dùng cùng công thức.
- **Đã sửa trong tệp riêng** `khop-chinh/chay.json`, **không đụng `../data.json`**. Rig đọc `data.json` rồi đè lên bằng tệp này: cộng 0,5 cho mọi khớp, rồi thay 18 khớp đánh lại trên ảnh nguồn cao. Cụ thể là vai trước ở 12 khung, khuỷu trước ở khung 8 và 12, cổ tay + nắm tay trước ở khung 11 và 12 (cổ tay khung 12 trước đây chấm ra nền). Lý do từng khung ghi ngay trong tệp.
- **Thêm kiểu gắn giáp vai "Trộn thân+tay"** (mặc định). Chọn trong trang ở dòng **Giáp vai: Theo bắp tay / Trộn thân+tay** để so.
  - Giáp neo **tại khớp vai**, không kéo giãn theo bắp tay.
  - Góc giáp = góc thân (cổ → giữa hông) + **35%** độ lệch giữa bắp tay và thân. Con số 35% khai báo ở `armBlend` trong `rig.json`.
  - Vị trí neo **làm tròn về điểm ảnh nguyên**. Nếu góc đổi **dưới 8°** so với khung trước thì giữ nguyên góc cũ (`angleHold: 8`).

### Đo trước / sau (giáp vai trước, hàng chạy)

| | Trước (khớp cũ + theo bắp tay) | Sau (khớp chỉnh + trộn) |
|---|---|---|
| Lệch điểm neo so với khớp vai đúng, trung bình | **1,6 điểm ảnh** | **0,3 điểm ảnh** |
| Lệch lớn nhất | **2,6 điểm ảnh** (khung 2) | **0,5 điểm ảnh** (chỉ do làm tròn) |
| Khung "lấp lánh" (góc đổi 0–8°, điểm ảnh nhảy lung tung) | 3 | **0** |
| Khung "lật gắt" (góc đổi ≥ 30° giữa 2 khung) | 2 (khung 6 → 7: 77° → 113°) | **0** |
| Góc giáp qua 12 khung | 77°–145° (lắc 68°) | 106°–124° (lắc 18°) |

Lệch theo từng khung (điểm ảnh ô 96, trước → sau): 1: 1,2 → 0,5 · 2: 2,6 → 0,2 · 3: 1,0 → 0,4 · 4: 0,9 → 0,4 · 5: 1,2 → 0,4 · 6: 2,2 → 0,5 · 7: 2,2 → 0,1 · 8: 2,0 → 0,2 · 9: 1,0 → 0,1 · 10: 1,5 → 0,3 · 11: 1,3 → 0,5 · 12: 2,5 → 0,3.

- **Giáp vai sau:** lệch 0,7 → 0,3 điểm ảnh (chỉ là lỗi 0,5). Số khung lấp lánh 4 → 0. Mảnh này gần như bị thân che hết.
- **Ảnh soát:**
  - `soat/vai-truoc-sau.png`: 12 khung phóng ×6 quanh vai, 4 hàng = Máy vẽ/Gen × trước/sau. Chấm đỏ là khớp vai đúng.
  - `soat/vai-truoc-sau.gif`: chạy cạnh nhau trước | sau.
  - `khop-chinh/soat-chay.png`: que xương đã chỉnh chồng lên ảnh nguồn cao và ô 96.
- **Đánh đổi:** ở kiểu "trộn", giáp vai không còn chạm tới khuỷu (chỉ ôm vai). Chỗ khuỷu do chụp khuỷu và giáp cẳng tay che, nên hở vẫn bằng 0. Muốn giáp vai đi theo tay nhiều hơn thì tăng `armBlend` (1 = như cũ).

## Hở khớp về 0

### Nói ngắn gọn

- **Hở = 0 ở MỌI khung** của cả 9 động tác. Tính cho cả 2 bộ (Máy vẽ, Gen), cả 2 chế độ xoay (liên tục, 8 hướng), cả 2 kiểu giáp vai (trộn, theo bắp tay).
- Cách đo vẫn như bảng "Tự kiểm" cũ: đếm điểm ảnh tay/chân trong bán kính 2 điểm ảnh quanh vai, khuỷu, gối mà không có giáp che. Có thêm 2 điểm mới:
  - Đo **cả chế độ 8 hướng** (trước đây chỉ đo xoay liên tục).
  - Với động tác dùng sheet cả người, "điểm ảnh tay/chân" là mọi điểm ảnh của người trong vòng đó.
- **Script dựng trang tự dừng lỗi thật.** `tao-rig.py` mở trang bằng Chromium, đọc kết quả tự kiểm (`kiem_ho.py`). Nếu còn 1 điểm ảnh hở ở bất kỳ khung nào thì in ra động tác/bộ/khung/khớp/toạ độ và **thoát mã 1**.
- **Trang cũng báo:** hiện khung đỏ ghi rõ "[động tác · bộ] Hở khớp kneeFront ở khung 4: 2 điểm ảnh (liên tục 1, 8 hướng 1)".
  - Ô "Thử báo lỗi → Tắt luật chụp khớp" cho xem khung đỏ này: 178 dòng báo, xem `soat/bao-loi-ho.png`.

### Cách sửa đã chọn

1. **Luật chụp khớp chung** (không dùng `frameOverrides` nào):
   - Với mỗi chụp khớp, thử cỡ **nhỏ nhất trước**: ảnh gốc (vai 5×5, khuỷu/gối 4×4), rồi đến chụp tròn Ø5, Ø6, Ø7.
   - Chọn cỡ đầu tiên che kín ở **mọi khung** của động tác, cho phép dời chụp tối đa 1 điểm ảnh quanh vị trí làm tròn ("chụp khớp theo khung").
   - Chỉ khi không cỡ nào che kín cả động tác mới chọn cỡ theo từng khung. Thực tế **chưa phải dùng tới**.
   - Chụp to được vẽ bằng code đúng kiểu chụp cũ: viền tối, sáng góc trên-trái. Bộ Gen tô bằng chính màu chụp gen. Ảnh ở `chup/may/`, `chup/gen/`, khai báo ở `capVariants` trong `rig.json`.
   - Chụp không xoay nên không bao giờ méo.
2. **Kết quả:**
   - Đa số khớp vẫn dùng chụp gốc, chỉ dời 0–1 điểm ảnh tuỳ khung.
   - Cần chụp **Ø5** ở: gối trước/sau (bộ Máy vẽ: chạy, trúng đòn, lăn), gối sau (Máy vẽ: chạy cầm thương, đi), gối trước (Máy vẽ: phi tiêu, chết), khuỷu sau (chết, cả 2 bộ), khuỷu trước (Máy vẽ: lăn).
   - Bộ Gen chỉ cần Ø5 ở hàng chết. Lý do: giáp ống chân gen dày hơn nên đã che gần hết gối.
3. **Không cần** kéo đầu mảnh giáp chồng qua khớp, cũng không cần chụp ở cổ tay/cổ chân. Bàn tay, bàn chân lộ ra là đúng hình, không tính là hở.
4. **Khớp bị che** (`hidden`): mảnh giáp gắn vào khớp đó **ẩn ở khung đó** và không tính hở.

| Động tác | Hở trước → sau (Máy vẽ) | Hở trước → sau (Gen) |
|---|---|---|
| Chạy | 90 → **0** | 121 → **0** |
| Chạy cầm thương | 246 → **0** | 270 → **0** |
| Đi | 178 → **0** | 193 → **0** |
| Đứng | 189 → **0** | 190 → **0** |
| Chém kiếm 1 | 104 → **0** | 86 → **0** |
| Lăn | 80 → **0** | 72 → **0** |
| Trúng đòn | 95 → **0** | 80 → **0** |
| Phi tiêu | 138 → **0** | 135 → **0** |
| Chết | 195 → **0** | 176 → **0** |

- "Trước" = chỉ có mảnh xương, không có chụp. Số cộng cả chu kỳ và cả 2 chế độ xoay, đo với giáp vai kiểu trộn. Chi tiết từng khung (cả kiểu theo bắp tay) có trong `soat/tu-kiem-dong-tac.json`.
- Số "trước" của hàng chạy (90) lớn hơn số cũ (48), vì giờ cộng cả 8 hướng và giáp vai trộn không còn che khuỷu.

## Nhiều động tác

### Nói ngắn gọn

- **Trang có hàng nút "Động tác"** gồm 9 động tác: Chạy, Chạy cầm thương, Chết, Đi, Đứng, Chém kiếm 1, Lăn, Phi tiêu, Trúng đòn. Có thêm bảng **"Tóm tắt theo động tác"** (bấm 1 dòng để mở động tác đó).
- **Tôi làm 3 động tác: Đứng (`dung`), Đi (`di`), Chém kiếm 1 (`kiem_1`).** Phiên R2 làm 5 động tác còn lại; trang tự nạp hết.
- **Trang tự nhận** mọi thư mục `dong-tac/<tên>/` có đủ `sheet.png` và `khop.json`: `tao-rig.py` quét thư mục mỗi lần chạy. Lần dựng cuối đã gồm cả 5 động tác R2 đã đẩy lên.
- **Hàng chạy vẫn dùng lớp tách** như cũ. Các động tác mới dùng **sheet cả người**, đây là **cách tạm**: mảnh giáp bên SAU vẽ trước sheet (bị người che), bên TRƯỚC vẽ sau sheet (đè lên người, kể cả chỗ lẽ ra bị che). Trang có ghi chú vàng nói rõ điều này khi chọn các động tác đó.

### Cách làm 3 động tác của tôi

- **Sheet:** cắt **nguyên hàng thân** từ tấm game `zed-moi.sprite.json` (hàng 0, 1, 7), nên y như game vẽ thân.
  - Script dựng lại hàng từ ảnh nguồn bằng đúng phép co/dời của `dung-zed-game.py` và kiểm: kênh alpha **trùng 100%** với tấm game.
  - Kiếm và ngón tay đè lên cán là lớp riêng của game, **không có** trong sheet.
- **Khớp:** chấm tay trên ảnh nguồn cao (`docs/anh-goc/zed/moi/01-dung-gif`, `02-di-gif`, `08-kiem-1-tp-gif`), ghi ở `dong-tac/<tên>/khop-nguon.json`, rồi đổi sang ô 96. Sai số ước chừng ≤ 1 điểm ảnh ô 96.
  - **Đứng:** chấm khung 1, khung 2–8 dò theo bằng so khớp mảng ảnh (đứng thở, dời ≤ 3 điểm ảnh nguồn).
  - **Đi:** chấm khung 1–4. Khung 5–8 là ảnh lặp lại khung 1–4 nhưng đổi chân, nên lấy lại khớp, dời theo độ lệch hình và đổi tên chân trước/sau.
  - **Chém kiếm 1:** chấm cả 5 khung. Tay nắm trước bụng có bắp tay và khuỷu bị thân che cả 5 khung (ghi `hidden`); khung 4 không thấy cả nắm tay.
- **Quy ước trước/sau:** giống hàng chạy và README-R2. Tay TRƯỚC = tay lộ bắp tay trần (bên trái hình khi đứng); chân TRƯỚC = chân bên trái hình (Đi: chân bước tới ở khung 1).
- **Ảnh soát:** `dong-tac/<tên>/soat.png` (que xương chồng lên ảnh nguồn cao và ô 96 ×4), `soat/luoi-dong-tac.png` (mọi động tác × 2 bộ × 2 chế độ xoay), `soat/dien-thoai-390-dt-<tên>.png` (chụp trang điện thoại).
- **Định dạng chung với R2:** `hidden` dùng số khung **đếm từ 1**.
  - R2 đổi toạ độ bằng công thức trừ 0,5 (giống `data.json`), nên `tao-rig.py` tự cộng 0,5 cho các tệp đó.
  - Tệp của tôi ghi `"coordinateConvention": "canh"` nên không bị cộng.

### Tự kiểm theo động tác (giáp vai trộn)

"Bám" = mọi mảnh sát cả 2 khớp, xoay liên tục / tính cả 8 hướng. Ô ghi "Máy vẽ · Gen". Số khung rung/méo đếm theo bảng tự kiểm cũ.

| Động tác | Khung | Bám liên tục | Bám cả 8 hướng | Rung | Méo | Hở |
|---|---|---|---|---|---|---|
| Chạy (lớp tách) | 12 | 12 · 12 | 10 · 4 | 9 · 12 | 8 · 12 | 0 |
| Chạy cầm thương | 12 | 10 · 10 | 6 · 6 | 3 · 6 | 5 · 8 | 0 |
| Đi | 8 | 8 · 8 | 8 · 2 | 4 · 4 | 2 · 6 | 0 |
| Đứng | 8 | 8 · 8 | 6 · 0 | 0 · 0 | 2 · 8 | 0 |
| Chém kiếm 1 | 5 | 5 · 5 | 3 · 3 | 3 · 3 | 0 · 0 | 0 |
| Lăn | 6 | 6 · 6 | 5 · 4 | 2 · 2 | 2 · 2 | 0 |
| Trúng đòn | 4 | 4 · 4 | 2 · 2 | 1 · 1 | 1 · 0 | 0 |
| Phi tiêu | 6 | 6 · 6 | 1 · 2 | 4 · 4 | 3 · 6 | 0 |
| Chết | 8 | **3 · 3** | 1 · 2 | 4 · 4 | 8 · 5 | 0 |

### Động tác nào giáp bám tốt / kém, vì sao

- **Tốt: Chạy, Đi, Đứng, Chém kiếm 1, Trúng đòn, Lăn** (xoay liên tục bám đủ mọi khung).
  - Tay chân ở các động tác này duỗi rõ, độ dài xương ổn định, nên mảnh giáp chỉ cần kéo/ép trong khoảng 0,75–1,3 lần.
  - Đứng gần như không rung (0 khung) vì dáng gần như không đổi.
  - **Lăn bám đủ là nhờ ẩn:** ở khung 3–4 (cuộn tròn) R2 ghi gần hết khớp là bị che, nên giáp tay/chân **ẩn hẳn** ở 2 khung đó. Giáp không sai, nhưng cũng không có giáp.
- **Khá: Chạy cầm thương, Phi tiêu.**
  - Chạy cầm thương: ở khung 2 và 8, xương ống chân trước dài gấp **2,2 lần** trung bình (giáp chỉ kéo tới 1,3), nên giáp hụt cổ chân khoảng 6 điểm ảnh. Dài bất thường như vậy có thể do cổ chân chấm xa, nên soát lại 2 khung này.
  - Phi tiêu: xoay liên tục bám đủ 6/6. Nhưng ở 8 hướng, giáp ống chân sau lệch đuôi ở 5/6 khung (làm tròn góc về bội số 45°), khung 4 thêm ống chân trước hụt (xương dài ×1,7).
- **Kém: Chết** (bám 3/8 khung).
  - Cẳng tay trước dài gấp 1,7–2,2 lần trung bình ở 6/8 khung (tay duỗi thẳng khi ngã, rồi nằm úp), ống chân hụt ở 5 khung. Giáp chỉ kéo tới 1,3 nên hụt khớp cuối 2–5 điểm ảnh.
  - Ở khung 6–8, R2 ghi che 13 khớp, nên phần lớn giáp ẩn.
  - **Không nên** dùng giáp xoay theo khớp cho hàng chết.
- **Vấn đề chung của sheet cả người (cách tạm):**
  - **Giáp bên SAU gần như không thấy**, vì người vẽ đè lên. Ví dụ ở Đứng, tay phải và chân phải (bên sau) lộ hẳn ra mà không có giáp.
  - **Giáp bên TRƯỚC luôn nằm trên cùng**, kể cả ở khung mà tay/chân đó lẽ ra khuất sau thân hoặc sau tay chân kia.
  - Muốn đúng thì phải **tách lớp** các động tác này như hàng chạy, hoặc dùng mặt nạ trước/sau theo khung. Phiên khác đã lưu một đề xuất ở `de-xuat-chatgpt/chatgpt-sua.patch` (tách ảnh trước/sau), tôi **chưa áp dụng**.
- **Chế độ 8 hướng vẫn kém với bộ Gen** ở mọi động tác: Đứng 0/8, Đi 2/8, Chạy 4/12. Đúng như nhận xét cũ: không nên dùng 8 hướng với bộ Gen.

### Xem ở đâu (phần mới)

| Tệp | Là gì |
|---|---|
| `kiem-tra-rig.html` | Trang kiểm tra. Có thêm nút **Động tác**, nút **Giáp vai**, bảng **Tóm tắt theo động tác**, bảng **Sửa lệch vai**. |
| `khop-chinh/chay.json` | Tệp chỉnh khớp hàng chạy (đè lên `data.json`), có lý do từng khung. |
| `dong-tac/{dung,di,kiem_1}/` | `sheet.png`, `khop.json`, `khop-nguon.json` (khớp chấm tay trên ảnh nguồn), `soat.png`. |
| `chup/may`, `chup/gen` | Chụp khớp cỡ Ø5/6/7 cho luật chụp. |
| `soat/vai-truoc-sau.png/.gif` | Vai trước/sau. |
| `soat/luoi-dong-tac.png` | Lưới mọi động tác. |
| `soat/dien-thoai-390-dt-*.png` | Chụp trang điện thoại 390×844 (DPR 3) từng động tác, bản debug, cả trang. |
| `soat/bao-loi-ho.png` | Khung đỏ khi cố ý tắt luật chụp. |
| `soat/tu-kiem-dong-tac.json` | Số tự kiểm của mọi động tác × bộ × kiểu giáp vai. |

Chạy lại (theo thứ tự):

```
python3 docs/thu-modular-96/rig/do-khop.py         # tệp chỉnh hàng chạy + dung/di/kiem_1 (sheet, khop.json, soat.png)
python3 docs/thu-modular-96/rig/tao-rig.py         # dựng trang + tự kiểm hở trên Chromium (còn hở → mã 1)
python3 docs/thu-modular-96/rig/soat-dong-tac.py   # ảnh soát + chụp điện thoại
```

**Gửi phiên khác:** `data.json` (và `tach_lop.doi_diem`) lệch 0,5 điểm ảnh so với quy ước "x,5 = tâm điểm ảnh" ghi trong chính tệp đó. Tôi không sửa `data.json`, chỉ bù trong rig. Phiên nào sửa `data.json` thì nhớ bỏ `offsetFix` trong `khop-chinh/chay.json`.

Mọi thứ nằm trong `docs/thu-modular-96/rig/`. **Không sửa code game, không sửa ảnh nguồn, không sửa tệp nào ngoài thư mục `rig/`** (chỉ đọc `../data.json` và `../sheets/`).

## Nói ngắn gọn

- **Toàn bộ chu kỳ chạy 12 khung chỉ dùng 6 ảnh giáp nhỏ** (3 mảnh + 3 chụp khớp). Không có sheet giáp 12 khung nào.
  - Mỗi ảnh dùng cho **cả 12 khung và cả bên trước lẫn bên sau**. Bên sau chỉ được làm tối đi lúc chạy, vẫn là cùng ảnh đó.
  - Mỗi khung, code đọc khớp trong `data.json`, tính vị trí, góc và chiều dài, rồi xoay/đặt ảnh giáp vào đó.
- **Giáp bám theo khớp 11/12 khung ở chế độ xoay liên tục.** Khung còn lại là khung 7: giáp cẳng tay trước hụt khoảng 2 điểm ảnh so với cổ tay, vì xương ở khung đó dài gấp 1,6 lần bình thường (xem bảng dưới). Mảnh giáp nào cũng đi theo khớp của nó ở mọi khung, không mảnh nào bị bỏ lại hay trôi đi.
- **Ở chế độ làm tròn 8 hướng**, giáp bám tốt 9/12 khung. Khung 4, 7 và 11 bị lệch đuôi.
- **Chụp khớp che được hở**: điểm ảnh tay/chân lộ quanh vai, khuỷu, gối giảm từ **48 xuống 12** trên cả chu kỳ. Phần còn hở chủ yếu ở gối sau, mỗi khung 1–2 điểm ảnh.
- **Kết luận:** cách này chạy được và tiết kiệm ảnh. Nhưng ở cỡ 96 (và nhất là 48), mảnh giáp chỉ dài 4–9 điểm ảnh. Xoay pixel art nhỏ như vậy làm **rơi điểm ảnh và nhấp nháy** (chi tiết ở mục "Giới hạn").

## Giáp gen thật (16/10, bộ "Gen")

Chủ game gen ảnh `anh-gen/giap-roi-4-manh.png` (4 mảnh: vai, cẳng tay, ống chân, ngực nhỏ). Đã cắt, thu nhỏ và gắn thử như **một bộ giáp thứ hai**. Bộ máy vẽ cũ vẫn giữ nguyên (kết quả của nó không đổi so với trước).

### Nói ngắn gọn

- **Cả chu kỳ 12 khung dùng 7 ảnh nhỏ**: 4 mảnh gen + 3 chụp khớp (vai, khuỷu, gối). Mỗi ảnh dùng cho cả 12 khung và cả bên trước lẫn bên sau. Ảnh gen không có chụp khớp, nên 3 chụp khớp lấy hình của bộ máy vẽ và tô lại bằng màu của ảnh gen.
- **Xoay liên tục: giáp bám khớp đủ 12/12 khung.** Chỉ khung 11 có giáp ống chân trước hụt cổ chân 2,1 điểm ảnh (xương ở khung đó dài gấp 1,6 lần).
- **Làm tròn 8 hướng: chỉ 4/12 khung bám đủ, và giáp ngực nhảy 45° ở 8/12 khung.** Thân nghiêng khoảng 106–120°, nằm ngay giữa hai nấc 90° và 135°, nên giáp ngực lật qua lật lại. **Với bộ gen, không nên dùng 8 hướng.**
- **Chụp khớp che hở**: điểm ảnh lộ quanh khớp giảm từ 45 xuống 8 (bộ máy vẽ: 48 xuống 12).
- **Nhận xét thẳng:** ở ô 96, mỗi mảnh chỉ còn **25–121 điểm ảnh** (ảnh gốc mỗi mảnh khoảng 80–100 nghìn điểm ảnh). Ở **cỡ game 48×48** chỉ còn **4×4, 4×2, 4×3 và 6×6 điểm ảnh**. Gần như **mất hết chi tiết gen**: đinh tán, chữ V trên cẳng tay, hình thoi trên ngực đều biến mất. Chỉ còn lại "một mảng thép xám có chấm đồng và viền đen". Ở ô 96, cẳng tay và ống chân khó phân biệt với bộ máy vẽ. Giáp ngực là món duy nhất còn nhìn ra là giáp.

### Xem ở đâu

| Tệp | Là gì |
|---|---|
| `kiem-tra-rig.html` | Trang kiểm tra. Có nút **Bộ giáp: Máy vẽ / Gen** ở đầu trang, và ô **"Phóng to nhân vật ×2 (192)"**. |
| `soat/giap-gen-truoc-sau.png` | 4 mảnh gen: gốc cắt → thu nhỏ ô 96 → bản ô 192 → còn lại ở cỡ game 48. **Nên xem ảnh này trước.** |
| `soat/luoi-may-vs-gen.png` | Lưới 12 khung phóng ×4. Các hàng: máy vẽ / gen × liên tục / 8 hướng, thêm gen cỡ game 48 và gen ô 192. |
| `soat/chay-may-vs-gen.gif` | Chạy cạnh nhau: Máy vẽ, Gen, Gen 8 hướng, Gen ô 192. |
| `soat/dien-thoai-390-gen*.png` | Chụp trang trên điện thoại 390×844 (DPR 3): bộ Gen, Gen + ×2, Gen + debug, cả trang. |
| `soat/tu-kiem-gen.json` | Số liệu tự kiểm 12 khung của cả 2 bộ. |
| `giap-gen/goc-*.png` | 4 mảnh cắt nguyên cỡ (nền trong suốt, đã xoay về chiều xương). |
| `giap-gen/*.png`, `giap-gen/*-x2.png` | Bản thu nhỏ cho ô 96 (dùng trong rig) và bản ×2 (chỉ để so sánh). |
| `giap-gen/gen.json` | Cỡ, điểm neo, bảng màu, số điểm ảnh của từng bước. |

### Cắt và đặt chiều xương (`tao-giap-gen.py`)

- **Tách nền**: điểm ảnh có màu xanh lá trội hơn đỏ và lam hơn 28 đơn vị thì coi là nền. Viền xanh nhạt lẫn quanh mép (hơi xanh và nằm sát nền) cũng bỏ đi, tổng cộng 1.779 điểm ảnh. Điểm còn hơi ngả xanh thì kéo màu xanh xuống cho hết ám xanh.
- **Tìm 4 mảnh** bằng các cột trống giữa chúng. Mỗi mảnh cắt sát hình.
- **Chiều xương**: theo quy ước, đầu xương nằm bên trái.
  - Cẳng tay và ống chân: script đo độ dày hai đầu. Đầu loe to hơn (khuỷu/gối) đã nằm bên trái nên giữ nguyên.
  - Giáp vai: vòm vai ở bên trái, giữ nguyên.
  - Giáp ngực: xoay 90° ngược chiều kim đồng hồ để mép cổ sang trái, thắt lưng sang phải.

| Mảnh | Gốc cắt | Ô 96 | Ô 192 (so sánh) | Gắn theo | Độ dài xương TB | anchorStart → anchorEnd | thicknessScale |
|---|---|---|---|---|---|---|---|
| Giáp vai | 359×360 | 8×8 | 16×16 | vai → khuỷu | 5,6đ | (1,2; 4) → (6,8; 4) | 1 |
| Giáp cẳng tay | 458×248 | 8×4 | 16×8 | khuỷu → cổ tay | 6,0đ | (0,96; 2) → (7,04; 2) | 1 |
| Giáp ống chân | 503×347 | 9×6 | 18×12 | gối → cổ chân | 7,0đ | (1,08; 3) → (7,92; 3) | 1 |
| Giáp ngực nhỏ | 382×383 | 13×13 | 26×26 | cổ → 60% đoạn tới giữa hông | 10,8đ | (1,04; 6,5) → (11,96; 6,5) | 1 |

- Cỡ ô 96 được chọn để khoảng cách giữa 2 điểm neo bằng **độ dài xương trung bình** trong `data.json`. Hai đầu thò ra thêm 12–15% để che khớp.
- **Giáp ngực** gắn theo đoạn **cổ → giữa hông** (`neck` → `hipCenter`), nhưng chỉ phủ 60% đầu đoạn (`boneFrac: 0.6`, khoảng tới thắt lưng). Nó xoay theo góc thân và được vẽ **trên thân, dưới chân trước và tay trước** (chèn ở chỗ lớp `chestArmor`).

### Cách thu nhỏ mà vẫn giữ nét

Không dùng thu nhỏ thường (sẽ nhoè thành một mảng xám). Thay vào đó làm 4 bước:

1. **Giảm màu**: gom màu của cả 4 mảnh về **bảng 8 màu lấy từ chính ảnh**: viền đen `#050403`, 2 tông tối `#231714` `#352f31`, 2 tông thép `#4b5666` `#748293`, 3 tông đồng `#944a1d` `#dd8940` `#e0c7a6`.
2. **Thu nhỏ có chọn lọc**: mỗi điểm ảnh nhỏ ứng với một ô trong ảnh gốc.
   - Ô phủ dưới 40% hình thì để trống.
   - Ô có từ 50% viền đen trở lên thì tô **viền đen**.
   - Ô có từ 45% đồng trở lên (không tính viền) thì tô **đồng**, để đai đồng mỏng không bị thép lấn mất. Ô còn lại tô thép.
   - Màu cụ thể = trung bình màu trong ô, rồi chọn màu gần nhất trong nhóm đó.
3. **Giữ viền**: điểm ảnh ở mép hình mà ô gốc có từ 12% viền đen thì tô viền đen. Ở ô 96 có 14–22 điểm như vậy mỗi mảnh.
4. **Dọn điểm ảnh lẻ**: bỏ điểm đứng một mình, và đổi màu điểm bên trong khác màu hết 8 điểm xung quanh (1–6 điểm mỗi mảnh).

Kết quả: mỗi mảnh ô 96 dùng 5–8 màu. Bản ×2 làm lại từ ảnh gốc (không phóng to từ bản ô 96).

### Kết quả từng khung (bộ Gen)

"đ" = điểm ảnh ở ô 96. Số đo do trang tự đo, giống `soat/tu-kiem-gen.json`.

| Khung | Bám khớp (liên tục / 8 hướng) | Rung | Méo | Hở khớp còn lại |
|---|---|---|---|---|
| 1 | ✓ / ống chân trước lệch đuôi | ống chân sau xoay gắt 90° | 8 hướng: cẳng tay mất 6–7/25đ | gối sau 1đ |
| 2 | ✓ / ống chân trước, cẳng tay trước lệch đuôi | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 7/25đ | – |
| 3 | ✓ / ống chân trước lệch đuôi | – | 8 hướng: ống chân sau mất 7/34đ | – |
| 4 | ✓ / ✓ | **8 hướng: ngực nhảy 45°** | 8 hướng: cẳng tay sau mất 6/25đ | gối trước 1đ |
| 5 | ✓ / ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: ống chân sau hụt 2,0đ | – |
| 6 | ✓ / ✓ | 8 hướng: vai sau nhảy 45°; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 6/25đ | – |
| 7 | ✓ / ống chân trước lệch đuôi | **8 hướng: ngực + vai sau nhảy 45°**; ống chân trước xoay gắt 90° | 8 hướng: ống chân sau mất 8/34đ | gối sau 1đ |
| 8 | ✓ / ống chân sau lệch đuôi | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau lố 1,8đ | gối sau 1đ |
| 9 | ✓ / ống chân sau lệch đuôi | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 6/25đ | gối sau 2đ |
| 10 | ✓ / ống chân sau lệch đuôi | **8 hướng: ngực nhảy 45°** | 8 hướng: cẳng tay sau mất 6/25đ | gối sau 1đ |
| 11 | ✓ / ✓ | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | **ống chân trước hụt 2,1đ** (cả 2 chế độ) | – |
| 12 | ✓ / ngực lệch đuôi | **8 hướng: ngực nhảy 45°** | 8 hướng: ống chân trước mất 8/34đ | gối trước 1đ |

- **Xoay liên tục** không mảnh nào mất quá 16% điểm ảnh. Nhưng do mảnh nhỏ nên hình mảnh vẫn đổi chút ít mỗi khung (lấp lánh), giống bộ máy vẽ.
- **"Xoay gắt"** là do chính dáng chạy trong `data.json` (cẳng tay trước lật 90° giữa 2 khung), không phải lỗi gắn. Giống hệt bộ máy vẽ.
- Nhìn lưới: ở xoay liên tục không thấy mảnh nào rời khớp hay trôi. Giáp vai gen (8×8) to hơn bản máy vẽ nên che gọn vai trước. Viền đen ở đuôi giáp vai thành 1–2 điểm đen lởm chởm.

### Chế độ "Phóng to nhân vật ×2 (192)" — chỉ để so sánh

- **Game vẫn là 96/48.** Chế độ này vẽ cùng rig ở ô 192. Thân người chỉ được phóng ×2 nên không thêm chi tiết. Riêng mảnh giáp gen dùng bản thu nhỏ ×2 (gấp 4 lần số điểm ảnh: vai 164, cẳng tay 98, ống chân 126, ngực 486 điểm ảnh).
- Ở ô 192 thì **bắt đầu thấy lại** đai đồng trên cẳng tay, mép loe ở gối, và trên giáp ngực có viền đồng cổ áo + mảng thép sáng. Đinh tán và hình thoi vẫn mất.
- Nghĩa là: muốn giáp gen giữ được chất "gen" thì nhân vật cần cỡ khoảng **192 trở lên**, hoặc mảnh giáp phải to (như giáp ngực).

### Đề xuất

1. **Nếu giữ cỡ game 48×48**: đừng gen ảnh to rồi thu nhỏ. Hãy **vẽ (hoặc gen) mảnh ở đúng cỡ nhỏ** (khoảng 8×4 đến 13×13 ở ô 96) với ít chi tiết: 1 viền đen, 1 đai đồng, 2 tông thép. Hoặc giữ bộ máy vẽ tối giản: ở 48×48 nó cho kết quả gần như bằng bộ gen mà rõ hình hơn.
2. **Chỉ dùng rig cho món to, ít xoay**: giáp ngực, khiên, áo choàng, mũ. Giáp ngực gen là mảnh duy nhất giữ được dáng sau khi thu nhỏ. Còn tay/chân (vai, cẳng tay, ống chân) thì gần như thành chấm màu, không đáng công gen.
3. **Giáp ngực nên đặt theo neo `chestArmor` với góc cố định** (hoặc chỉ dùng xoay liên tục), không dùng 8 hướng: góc thân nằm ngay giữa hai nấc nên bị nhảy 45° ở 8/12 khung.
4. Nếu muốn giữ chi tiết gen thật thì phải tăng cỡ nhân vật (192). Đây là quyết định lớn, ảnh hưởng toàn bộ game, cần chủ game chọn.

## Xem ở đâu

| Tệp | Là gì |
|---|---|
| `kiem-tra-rig.html` | Trang kiểm tra, 1 tệp tự chứa, mở được trên điện thoại. |
| `soat/luoi-12-khung.png` | Lưới 12 khung, phóng ×4. Có 4 hàng: xoay liên tục (96), 8 hướng (96), xoay liên tục cỡ game (48), 8 hướng cỡ game. |
| `soat/chay-rig.gif` | Nhân vật chạy: xoay liên tục (trái) và 8 hướng (phải). |
| `soat/dien-thoai-390*.png`, `soat/may-tinh-1280.png` | Ảnh chụp trang trên điện thoại 390×844 (DPR 3) và máy tính 1280×800. |
| `soat/bao-loi-*.png` | Ảnh chụp trang khi cố ý làm lỗi: thiếu khớp, thiếu ảnh, điểm neo sai. |
| `soat/tu-kiem.json` | Số liệu tự kiểm của trang, đủ 12 khung × 2 chế độ. |

### Trang kiểm tra có gì

1. **Hai nhân vật cạnh nhau**: trái là "Xoay liên tục", phải là "Làm tròn 8 hướng".
   - Hình trên là khung nguồn 96×96, hình dưới là cỡ game 48×48.
   - Cả hai được phóng bằng số nguyên theo độ nét màn hình, không làm mượt, nên không bị nhòe.
   - Mặc định trang cắt sát nhân vật cho to. Bấm **"Cả khung 96"** để xem đủ khung.
2. **Nút điều khiển**: Chạy/Dừng, tua ◀ ▶ từng khung, và **Chậm ×¼** để soi rung.
3. **Bật/tắt riêng từng mảnh**: 12 nút, gồm giáp vai, giáp cẳng tay, giáp ống chân, chụp vai, chụp khuỷu, chụp gối, mỗi thứ có bên trước và bên sau.
4. **Debug**:
   - **Xương**: xanh lơ là bên trước, hồng là bên sau.
   - **Khớp**: chấm tròn.
   - **Điểm neo**: neo đầu màu vàng, neo cuối màu cam (lấy từ ảnh giáp và tính ra vị trí trên nhân vật).
   - **Đường nối**: nét đứt đỏ từ điểm neo tới khớp. Nét càng dài thì giáp càng lệch.
5. **Báo lỗi**: có khung đỏ ở đầu trang khi thiếu khớp (ghi rõ khớp nào, khung nào), thiếu ảnh giáp, điểm neo sai (nằm ngoài ảnh, hai neo trùng nhau, `thicknessScale` ≤ 0), hoặc lớp chèn không có trong `layerOrder`.
   - Mảnh bị lỗi sẽ không vẽ. Mảnh còn lại vẫn chạy bình thường.
   - Ô **"Thử báo lỗi"** cho cố ý gây 3 loại lỗi để xem khung đỏ. Đã thử cả 3: khung đỏ hiện đúng.
6. Bảng **"Khung đang xem"** (góc, độ giãn, số điểm ảnh bị rơi) và bảng **"Tự kiểm 12 khung"**. Bấm một dòng trong bảng để nhảy tới khung đó.

## Cách gắn

Ảnh giáp và điểm neo nằm trong `giap/*.png`, khai báo trong `rig.json`. Mỗi mảnh được vẽ **nằm ngang theo chiều xương**: đầu xương ở bên trái.

| Ảnh | Cỡ | Gắn theo | anchorStart → anchorEnd | Dùng cho |
|---|---|---|---|---|
| `giap-vai.png` | 9×6 | vai → khuỷu | (1.5,3) → (7.5,3) | vai trước, vai sau |
| `giap-cang-tay.png` | 7×4 | khuỷu → cổ tay | (1,2) → (6.5,2) | cẳng tay trước, sau |
| `giap-ong-chan.png` | 9×5 | gối → cổ chân | (1,2.5) → (8,2.5) | ống chân trước, sau |
| `chup-vai.png` | 5×5 | tâm đặt tại vai | (2.5,2.5) | 2 bên |
| `chup-khuyu.png` | 4×4 | tâm đặt tại khuỷu | (2,2) | 2 bên |
| `chup-goi.png` | 4×4 | tâm đặt tại gối | (2,2) | 2 bên |

**Hàm gắn** (`place()` trong trang) làm 4 bước cho mỗi khung:

1. Lấy 2 khớp A, B từ `data.json.frames[khung].joints` (tên khớp đúng như trong data, ví dụ `shoulderFront`/`elbowFront`).
2. Tính góc = atan2(B − A). Ở chế độ 8 hướng, góc được làm tròn về bội số 45°.
3. Tính độ giãn = |AB| / |anchorEnd − anchorStart|, giới hạn trong khoảng 0,75–1,3 (`stretch` trong metadata). Bề dày nhân với `thicknessScale`.
4. Ghép thành một ma trận: dời tới A, xoay, co giãn, rồi đưa `anchorStart` về gốc. Sau đó vẽ ảnh bằng `drawImage`, tắt làm mượt.

**Chụp khớp** không xoay. Tâm của nó được đặt vào khớp, làm tròn về điểm ảnh nguyên, nên không bao giờ bị méo.

**Thứ tự chồng** đọc từ `DATA.layerOrder`. Mỗi mảnh khai báo `insertAfter` (vẽ ngay sau lớp nào). Có thể ghi đè theo khung bằng `frameOverrides` (hiện chưa cần dùng).

- **Bên sau** (vẽ dưới thân):
  - giáp vai sau, cẳng tay sau, chụp vai sau, chụp khuỷu sau: vẽ sau `rearArm`;
  - giáp ống chân sau, chụp gối sau: vẽ sau `rearPants`.
- **Bên trước** (vẽ trên tay/chân trước):
  - giáp ống chân trước, chụp gối trước: vẽ sau `frontPants`;
  - cẳng tay trước, rồi vai trước, rồi chụp khuỷu, rồi chụp vai: vẽ sau `frontArm`.
- Đầu và tóc vẫn vẽ trên cùng.

Thân người là các lớp gốc trong `sheets/` cùng bộ đồ "goc". **Các sheet giáp 12 khung của bản cũ** (`chestArmor`, `backShoulderArmor`, `frontShoulderArmor*`, `forearmArmor`) **không được vẽ** (`skipLayerKinds: ["giap"]`). Vì thế thử nghiệm này không có giáp ngực.

**Nguồn ảnh giáp**: vẽ pixel tối giản bằng mã trong `tao-rig.py`, màu đồng/thép gần với giáp gen. Không dùng ảnh trong `anh-gen/`, vì cả 3 ảnh đó là giáp ngực + vai liền khối, không có mảnh tay/chân để cắt.

## Kết quả từng khung

Các số dưới đây do trang tự đo trong Chromium, giống hệt `soat/tu-kiem.json`. "đ" = điểm ảnh, đo ở khung nguồn 96.

| Khung | Bám khớp | Rung / giật | Méo | Hở khớp còn lại (sau khi có chụp) |
|---|---|---|---|---|
| 1 | ✓ | ống chân sau xoay gắt 90° | – | gối sau 1đ |
| 2 | ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 6/26đ | – |
| 3 | ✓ | – | vai sau lố 1,6đ; 8 hướng: cẳng tay sau, ống chân sau mất 8/26, 14/38đ | – |
| 4 | 8 hướng: ống chân sau lệch đuôi | – | 8 hướng: cẳng tay sau mất 8/26đ | gối sau 1đ, gối trước 1đ |
| 5 | ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 8/26đ | – |
| 6 | ✓ | **8 hướng: vai sau nhảy 45° (xương chỉ xoay 15°)**; cẳng tay trước xoay gắt 90°, vai trước 45° | – | gối trước 1đ |
| 7 | **cẳng tay trước hụt cổ tay** (cả 2 chế độ) | **8 hướng: vai sau nhảy 45° (xương chỉ 7°)**; ống chân trước xoay gắt 90° | cẳng tay trước hụt 1,9đ (xương dài ×1,64); 8 hướng: ống chân sau mất 11/38đ | gối sau 1đ |
| 8 | ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 8/26đ | gối sau 1đ |
| 9 | ✓ | cẳng tay trước xoay gắt 90° | vai sau lố 1,7đ (xương ngắn ×0,47); 8 hướng: ống chân trước mất 8/38đ | gối sau 2đ |
| 10 | ✓ | – | 8 hướng: cẳng tay sau mất 8/26đ | gối sau 1đ |
| 11 | 8 hướng: ống chân trước lệch đuôi | cẳng tay trước xoay gắt 90° | ống chân trước hụt 1,9đ (xương dài ×1,57) | gối sau 1đ |
| 12 | ✓ | – | 8 hướng: ống chân trước mất 9/38đ | gối sau 1đ, gối trước 1đ |

### Đọc bảng thế nào

- **"Xoay gắt"** nghĩa là chính xương trong `data.json` xoay 45–90° chỉ trong 1 khung (cẳng tay trước lật từ chúc xuống sang ngang). Đây là dáng chạy, không phải lỗi gắn. Nhưng mảnh giáp cứng nên nhìn thấy nó "lật" rõ, nhất là khi bấm Chậm ×¼.
- **"Nhảy 45°"** chỉ có ở chế độ 8 hướng. Xương xoay rất ít nhưng góc vượt ngưỡng làm tròn, nên giáp nhảy hẳn một nấc. Đây là kiểu rung riêng của cách làm tròn (khung 6, 7, giáp vai sau).
- **"Mất x/y điểm ảnh"**: khi xoay hoặc co lại bằng nearest-neighbor, một số điểm ảnh của ảnh giáp bị rơi mất. Ở xoay liên tục không mảnh nào mất quá 20%. Ở 8 hướng, giáp cẳng tay sau mất 23–31% vì vừa bị ép ngắn ×0,75 vừa xoay.
- **"Hụt/lố"**: xương trong data dài/ngắn thất thường do góc nhìn nghiêng (cẳng tay trước dài 4,5–9đ, vai sau chỉ 2,8–4,8đ). Giáp chỉ được kéo trong khoảng 0,75–1,3 lần, vì kéo nhiều hơn thì pixel art bị méo nặng. Nên ở khung 7 và 11 giáp không chạm tới khớp cuối, còn ở khung 3 và 9 giáp vai sau thò quá khuỷu. Riêng giáp vai sau gần như bị thân che hết.
- **Hở khớp**: đếm điểm ảnh tay/chân trong bán kính 2đ quanh khớp mà không có giáp che. Trước khi có chụp: 48đ. Sau khi có chụp: 12đ.

## Giới hạn của cách xoay pixel art

1. **Chỉ góc 0°/90°/180°/270° là giữ nguyên nét.** Ở góc khác (kể cả 45° của chế độ 8 hướng), nearest-neighbor làm rơi hoặc nhân đôi điểm ảnh. Viền bị răng cưa và đổi hình theo từng khung.
2. **Xoay liên tục** làm mảnh giáp đổi hình dạng mỗi khung dù góc chỉ đổi vài độ, trông như "lấp lánh". **8 hướng** thì hình ổn định hơn trong cùng một nấc, nhưng nhảy 45° khi qua ngưỡng và lệch khỏi xương tới khoảng 22°.
3. **Mảnh càng nhỏ càng tệ.** Ở cỡ game 48×48, mảnh giáp chỉ còn 2–4 điểm ảnh, gần như thành một chấm màu. Chi tiết đai/viền mất hết (xem 2 hàng dưới của `luoi-12-khung.png`).
4. **Co giãn theo chiều dài xương** cũng làm méo pixel. Không co giãn thì giáp lại hụt/lố khớp khi xương bị phối cảnh ngắn lại.
5. **Không có xoay 3D**: giáp luôn là mặt nghiêng, không đổi khi tay vung ra trước/sau thân. Ánh sáng vẽ sẵn trên ảnh xoay theo xương, nên có khung chỗ sáng nằm ở dưới.
6. **Chất lượng phụ thuộc khớp đánh bằng mắt** (sai ±1–2đ). Khớp lệch thì giáp lệch theo.

**Hướng đề xuất** (chưa làm, cần chủ game chọn):

- (a) Mỗi mảnh vẽ sẵn **4–8 ảnh theo góc** (vẽ tay, không xoay bằng code), code chỉ chọn ảnh gần nhất và đặt vào khớp. Khi đó số ảnh giáp sẽ là 6 × 8 = 48 ảnh nhỏ, vẫn ít hơn sheet 12 khung cho từng món.
- (b) Chỉ dùng rig cho đồ ít xoay (vai, ngực, mũ), còn tay/chân dùng sheet theo khung.

## Cách chạy lại

```
python3 docs/thu-modular-96/rig/tao-giap-gen.py  # cắt + thu nhỏ 4 mảnh giáp gen -> giap-gen/
python3 docs/thu-modular-96/rig/tao-rig.py       # vẽ 6 ảnh giáp máy vẽ, ghi rig.json (cả bộ Gen), dựng kiem-tra-rig.html
python3 docs/thu-modular-96/rig/soat-rig.py      # soát bộ máy vẽ: chụp màn hình, lưới, GIF, tu-kiem.json
python3 docs/thu-modular-96/rig/soat-giap-gen.py # soát máy vẽ vs gen: lưới, GIF, ảnh trước/sau, tu-kiem-gen.json
```

- Cần Python 3 + `pillow`. Riêng `soat-rig.py` cần thêm `playwright` + Chromium.
- `soat-rig.py` thoát mã 1 nếu trang báo lỗi với dữ liệu thật, nếu thử lỗi mà trang không báo, hoặc nếu trang điện thoại bị tràn ngang.
- Nếu phiên khác đổi tên hoặc thêm lớp trong `data.json`, chỉ cần chạy lại `tao-rig.py`. Thứ tự lớp luôn đọc từ `DATA.layerOrder`. Nếu `insertAfter` trỏ vào lớp không còn tồn tại, trang sẽ báo lỗi đỏ.

## Prompt gen ảnh (nếu muốn giáp đẹp hơn bản vẽ tối giản)

> Pixel art, one image, flat #00FF00 background, no text, no shadow. Three separate small armor pieces in a row, each lying horizontally along its bone direction (joint end on the left): 1) a bronze shoulder pauldron about 9×6 px, 2) a steel forearm bracer with two bronze bands about 7×4 px, 3) a steel shin greave with a bronze knee band about 9×5 px. Crisp hard pixels, 1-pixel dark outline, 3-tone shading, same bronze/steel palette as the reference.

Gửi kèm `mau-gen/giap-mau-x12.png` (3 mảnh hiện tại phóng ×12, trên nền xanh). Ảnh gen về cần thu nhỏ đúng cỡ đó, rồi thay vào `giap/*.png`, giữ nguyên `rig.json`, sau đó chạy lại 2 lệnh trên.
