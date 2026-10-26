# Ghi chú – Làng Chuông (asset từ ảnh gen nguon-v2)

Viết cho người không rành kỹ thuật. Mở trước 3 ảnh duyệt trong `xem-thu/`:
`canh-ghep-960.png` (đúng cỡ màn 960×540), `canh-ghep-2x.png` (ảnh lớn 1920×1080), `canh-ghep-xam.png` (bản xám để kiểm
tương phản). Bảng tất cả ô gạch có tên: `xem-thu/bang-o-gach.png`.
Mọi số "logic" theo khung 960×540, ô 32, Lam cao 112; mọi ảnh xuất ở **2x** (vẽ trong game ở ½ cỡ ảnh).
**Chưa ghép vào game, chưa chạy trên máy thật** – `game/demo.html` không bị sửa.

Chạy lại tất cả: `python3 code/chay_het.py` (cần Pillow, numpy, scipy; ~45 giây). Ảnh nguồn đọc thẳng từ `../nguon-v2/`.

## 1. Đã làm gì

| Phần | Kết quả | Code |
|---|---|---|
| Nền parallax | 5 lớp + 1 cặp tuỳ chọn, lặp ngang liền, đã làm tối + giảm bão hoà + bớt nét nhỏ | `code/nen.py` |
| Gạch | 78 ô (gỗ-rễ 39, đá xây 39), mỗi ô 64×64, atlas + JSON + ô lẻ | `code/gach.py` |
| Cổng | 3 trạng thái cùng khung: đóng / mở (bản lề trái) / chỉ trụ | `code/do_vat.py` |
| Đồ nhỏ | công tắc lên / ấn, bình máu, mảnh chuông – nền trong, khử viền trắng | `code/do_vat.py` |
| Cảnh ghép thử | nền 3 lớp + tiền cảnh + sàn/bậc/dốc/ván/cột + cổng + đồ nhỏ + Lam + quái chuông gỗ | `code/xem_thu.py` |

## 2. Danh sách file và cỡ

**Nền** (`nen/`, cao 1080 = 540 logic; thông số trong `nen/nen.json`)

| File | Cỡ ảnh | Rộng logic | Cuộn | Nội dung |
|---|---|---|---|---|
| `lang-xa.png` | 1619×1080 RGB | 809,5 | 0,08 | lòng thân cây: vách gỗ cong, hốc xanh lam, chuông xa, tia sáng qua khe |
| `lang-xa-hoc.png` + `lang-xa-vach.png` | 1619×1080 | 809,5 | 0,08 + 0,20 | **tuỳ chọn, thử nghiệm**: tách lớp xa thành hốc sâu (đục) + vách gỗ (trong suốt chỗ hốc) để có thêm 1 tầng cuộn. Dùng cặp này THAY cho `lang-xa.png` |
| `lang-giua.png` | 1559×1080 RGBA | 779,5 | 0,40 | nhà, cầu dây, giá chuông, đèn lồng |
| `lang-gan.png` | 1619×1080 RGBA | 809,5 | 0,65 | khung rễ lớn sau gameplay (tối) |
| `lang-tien-canh.png` | 3840×1080 RGBA | 1920 | 1,05 | rễ treo tối ở mép trên, chỉ 40 % trên của màn; vẽ SAU nhân vật |

Lớp rộng < 960 logic → khi vẽ cần 2–3 bản nối nhau (công thức trong `nen.json`). Kiểm chỗ nối mép phải→trái: chênh màu
bằng 0,9–1,1 lần chênh giữa 2 cột kề bên trong ảnh (không thấy nối); cặp tuỳ chọn 1,3–1,5 (hơi thấy nếu nhìn kỹ).

**Gạch** (`gach/gach-atlas.png` 1024×396 + `gach-atlas.json`, từng ô trong `gach/o/`). Mọi ô đúng 64×64 (32 logic), nằm gọn
trong ô (không thò ra) → vẽ thẳng theo lưới. Tên theo hàng của khuôn, tiền tố `go-` (gỗ-rễ) hoặc `da-` (đá xây):

| Nhóm | Ô |
|---|---|
| Mặt trên (rêu) | `tren-giua` (lặp ngang), `tren-giua-2/3/4`, `tren-trai`, `tren-phai`, `tren-trai-2`, `tren-phai-2` |
| Thân | `than` (lặp 2 chiều), `than-2`, `than-3`, `than-diu` (ít chi tiết) – 4 mép biến thể y hệt `than` |
| Tường / đáy | `canh-trai`, `canh-phai`, `day-giua`, `day-trai`, `day-phai` (góc ngoài dưới bo tròn) |
| Góc trong (lõm) | `goc-trong-tl/tr/bl/br` – ô đặc, chỉ có chấm viền ở góc |
| Cột rộng 1 ô | `cot-tren`, `cot-than`, `cot-day` |
| Gờ nổi cao 1 ô | `noi-trai`, `noi-giua`, `noi-phai` |
| Khối rời | `khoi` |
| Ván một chiều | `van-trai`, `van-giua` (không có viền dọc), `van-phai`, `van-trai-2`, `van-phai-2` – mặt ván = mép trên ô, dày ~11 logic |
| Dốc | `doc-thoai-len-1` + `doc-thoai-len-2` (2 ô, lên 1 ô), `doc-thoai-xuong-1` + `-2`, `doc-len`, `doc-xuong` (45°) |

Viền đen ~2,7 px ở ảnh 2x (≈1,3 logic) và CHỈ ở cạnh lộ. Thân tối hơn mặt trên 20 % và nhạt màu hơn (mặt trên sáng dần → tối ở đáy ô).

**Đồ vật** (`do-vat/`, neo giữa đáy, thông số trong `do-vat/do-vat.json`)

| File | Cỡ ảnh | Cỡ logic | Ghi chú |
|---|---|---|---|
| `cong-dong.png`, `cong-mo.png`, `cong-chi-tru.png` | 308×256 | 154×128 | cùng khung; cột trái 0–30 logic, cột phải 124–154 logic |
| `cong-tac-len.png`, `cong-tac-an.png` | 72×54 | 36×27 | cùng khung, cùng đế; chỉ nắp chuông thụt xuống |
| `binh-mau.png` | 38×48 | 19×24 | |
| `manh-chuong.png` | 38×56 | 19×28 | |

Đồ nhỏ đã thêm 1 px (2x) viền đen ngoài sau khi thu nhỏ → nét ngoài ≈1,4 logic (bảng chuẩn: 1–1,5). Cổng nét ≈2 logic.

## 3. Ảnh gen khác khuôn ở đâu, đã xử lý thế nào

- **Gạch**: ảnh gen đi đúng vị trí khuôn (×1,2) nhưng **mọi dải đều có thảm rêu ở mặt trên**, kể cả hàng khuôn dành cho
  thân, tường, đáy, góc trong. Không có ô thân/tường/đáy nào dùng được. Nên:
  - **Thân** dựng bằng code, màu lấy từ phần thân ảnh gen: gỗ = 2 rễ lớn chạy ngang uốn lượn (mảng phẳng, 1 dải sáng
    trên, 1 vệt bóng + nét sẫm mảnh dưới); đá = 3 hàng khối xây, mạch vữa sẫm, 1 dải sáng + 1 tông bóng. Lần đầu thử ghép
    chồng các dải thân cắt từ ảnh gen nhưng ra hoa văn rối và "chữ A" ở đá → bỏ.
  - Hốc tối xanh lam dưới rễ trong ảnh gen (trông như lỗ thủng xuyên nền) đã đổi thành nâu gỗ sẫm.
  - **Mặt trên**: chỉ lấy THẢM RÊU của ảnh gen (từ mép trên tới đáy rêu từng cột), phủ lên thân code + vệt bóng dưới rêu.
    Vì thân là của code nên mép dưới mọi ô mặt trên khớp đúng ô thân.
  - **Tường, đáy, cột, góc ngoài dưới, góc trong, gờ nổi**: thân + viền vẽ bằng code đúng độ dày viền ảnh gen.
  - **Góc trên trái/phải, đỉnh cột, khối rời**: rêu + viền góc từ ô gen tương ứng, phần dưới là thân + viền code.
  - **Ván một chiều**: gen vẽ 2 đầu trái + 2 đầu phải, không có ô giữa → ô giữa ghép từ phần trong của 2 đầu, làm lặp
    liền, không có viền dọc. Đã xoá nét khung xám nhạt của khuôn còn sót dưới ván.
  - **Dốc**: không dùng dốc gen (mép không khớp). Dựng bằng code: trượt từng cột của ô mặt trên xuống theo mặt dốc,
    bên dưới là thân, vẽ lại viền vuông góc mặt dốc → mép dốc khớp ô mặt trên và ô thân.
  - Biến thể thân chỉ đổi phần GIỮA ô (mắt gỗ, rễ nhánh chéo, bỏ nét; đá: đổi sáng vài khối, chia đôi khối, gộp khối)
    → xen kẽ tự do không lộ nối.
- **Cổng**: cánh mở trong ảnh gen bị xoay RA PHÍA NGƯỜI XEM (đầu cánh to hơn, khác bản đóng) → không khớp. Dựng bằng code
  từ chính cánh đóng: cắt cánh giữa 2 cột, bóp ngang còn 30 %, đầu xa thấp 6 % (phối cảnh), tối dần, vẽ sau cột, bản lề
  ở cột trái. "Chỉ trụ" = bản đóng bỏ cánh; nửa bản lề/chốt sắt gắn trên cột được giữ (như dấu cánh bị tháo).
  Ảnh 1 cột riêng của gen không dùng (để 3 trạng thái giữ y hệt cột của bản đóng).
- **Đồ nhỏ**: gen mới không còn dấu báo cam ở công tắc → không phải tách hiệu ứng.

## 4. Còn chưa đẹp

1. **Thân gỗ** lặp nhịp 32 px vẫn thấy được thành "sóng" khi mảng đất rộng; biến thể chỉ đỡ một phần. Mắt gỗ / rễ nhánh
   dựng bằng code hơi phẳng so với rêu gen. Cần mảng trang trí rễ lớn 4×4 ô (128×128 logic) phủ lên – chưa có.
2. **Rêu mặt trên** hơi mỏng; ô `tren-trai` (và `noi-trai`) có dải rêu buông dọc mép trái bị dừng ngang ở ~⅓ ô.
3. **Ván một chiều** mỏng và mặt ván là rêu chứ không phải ván gỗ; đá chỉ thấy một dải đá mỏng.
4. **Góc trong** chỉ là chấm viền nhỏ, ở cỡ 960 gần như không thấy (đúng ý, nhưng góc lõm trông hơi "cụt").
5. **Dốc**: ở chân dốc thoải/45° phần rêu chạm đáy ô một đoạn ngắn; chưa thử dốc nối với tường.
6. **Nền giữa**: khi làm lặp, căn nhà mái xanh ở mép trái ảnh gen bị cắt bỏ; chu kỳ lặp chỉ ~780 logic nên nếu cuộn
   lâu sẽ nhận ra tháp chuông lặp lại.
7. **Cặp xa-hốc/xa-vách** là thử nghiệm: phần hốc bị vách che được lấp bằng màu hốc mờ – trông như bóng tối loang.
8. **Tiền cảnh** dựng từ góc lớp gần, tô gần đen + mờ 2 bên → đọc như bóng tối nhiều hơn là rễ. Nên gen riêng.
9. **Cổng mở**: cánh bóp ngang nên chưa có độ dày cạnh cánh; cột phải của ảnh gen cao hơn cột trái ~4 logic (giữ nguyên).
10. **Mảnh chuông**: hình chuông khắc bên trong hơi nhoè ở cỡ 28 logic.
11. Bản xám: nền / sàn / Lam / quái tách nhau rõ; sàn gỗ và thân cây lớp gần cùng độ sáng trung bình nên ranh giới
    giữa chúng dựa vào viền + rêu mặt trên.

## 5. Nên gen lại gì (prompt ngắn, đính kèm Lam + `canh-ghep-960.png` làm mẫu)

**a) Gạch thân KHÔNG rêu (quan trọng nhất)** – một ảnh, 4×2 ô vuông rời nhau trên nền trắng, mỗi ô 1 khối:
> 2D side-view platformer terrain, 8 separate square tiles on plain white, matching the reference hero (chunky flat
> colors, one cel-shadow tone). Living tree-root wood INTERIOR fill only: NO moss, NO grass, NO top edge, NO outline at
> all. Broad smooth roots, few large shapes, muted honey and chestnut brown, darker than the surface. Every tile must
> tile seamlessly with itself left-right and top-bottom. No holes, no dark cavities, no tiny grain, no labels.

(Bản đá: thay câu gỗ bằng "ancient grey masonry blocks with dark mortar, large blocks, one highlight and one shadow tone".)

**b) Mảng trang trí rễ 4×4 ô** (phủ lên thân, nền trong suốt):
> One large decorative tree-root overlay for 2D platformer terrain, 512×512, transparent background. 2–3 thick roots
> crossing diagonally, chunky flat colors matching the reference hero, muted brown, one cel-shadow tone, thin dark outline.
> No moss, no leaves, no background fill.

**c) Tiền cảnh Làng Chuông** (thay `lang-tien-canh.png`):
> Single FOREGROUND layer, 32:9, transparent background. Two or three thick dark hanging root clusters entering from the
> TOP edge only, far apart, nearly black brown with a faint teal rim light, chunky simple silhouettes matching the
> reference hero. Nothing in the lower 60 percent. No fog, no glow, no sky, no floor.

**d) (tuỳ chọn) Ván gỗ một chiều**: 1 đầu trái, 1 giữa lặp được, 1 đầu phải, CÙNG chiều cao, mặt ván gỗ phẳng có ít rêu,
nền trắng; giữa không có viền dọc.

## 6. Cấu trúc thư mục

```
lang-chuong/
  GHI-CHU.md            ← file này
  code/                 chung.py (hàm chung, lấy từ the-gioi/code), nen.py, gach.py, do_vat.py, xem_thu.py, chay_het.py
  nen/                  6 PNG + nen.json
  gach/                 gach-atlas.png + gach-atlas.json + o/*.png (78 ô)
  do-vat/               7 PNG + do-vat.json
  xem-thu/              canh-ghep-2x.png, canh-ghep-960.png, canh-ghep-xam.png, bang-o-gach.png
```
