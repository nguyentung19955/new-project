# Ghi chú – Làng Chuông (asset từ ảnh gen nguon-v2)

Viết cho người không rành kỹ thuật. Mở trước 3 ảnh duyệt MỚI trong `xem-thu/`:
`canh-ghep-960-v2.png` (đúng cỡ màn 960×540), `canh-ghep-2x-v2.png` (ảnh lớn 1920×1080), `canh-ghep-xam-v2.png` (bản xám để
kiểm tương phản). Bảng tất cả ô gạch có tên: `xem-thu/bang-o-gach-v2.png`. (Các ảnh không có `-v2` là bản cũ, để so sánh.)
Mọi số "logic" theo khung 960×540, ô 32, Lam cao 112; mọi ảnh xuất ở **2x** (vẽ trong game ở ½ cỡ ảnh).
**27/10: đã ghép vào `game/demo.html`** (xem `game/kiem-thu-lang-chuong/GHI-CHU.md`); chưa chạy trên máy thật.

Chạy lại tất cả: `python3 code/chay_het.py` (cần Pillow, numpy, scipy; ~45 giây). Ảnh nguồn đọc thẳng từ `../nguon-v2/`.

## 0. Bản v2 (27/10) – dùng 3 ảnh gen lại theo mục 5

| Ảnh gen | Đã làm | Ra file | Code |
|---|---|---|---|
| `gach-than-go.png` (8 ô thân gỗ không rêu) | cắt 8 ô, bỏ nền trắng, đưa về **5 màu phẳng** lấy từ chính ảnh; ô 1 làm **lặp liền** 2 chiều (ảnh gen chưa liền: mép trái ≠ phải, trên ≠ dưới); 7 ô kia giữ phần giữa, dải mép ~2,7 logic lấy y hệt ô 1 → **ghép bất kỳ ô nào cạnh nhau cũng liền**; co về 64×64 (32 logic) | `go-than`, `go-than-2` … `go-than-8` | `code/than_go.py` |
| | **dựng lại mọi ô gỗ có phần thân** trên thân mới: mặt trên rêu, tường, đáy, góc ngoài/trong, cột, gờ, dốc, khối; viền đen chỉ ở cạnh lộ; phần thân ngay dưới rêu sáng dần → tối như cũ nên khớp màu rêu | atlas gạch | `code/gach.py` |
| | thêm biến thể tường/trần gỗ (dùng thân biến thể): `go-canh-trai-2/3/4`, `go-canh-phai-2/3/4`, `go-day-giua-2/3/4`. **Bỏ** `go-than-diu` (ô "dịu" trộn mờ trông bẩn) | | |
| `rong-re.png` (mảng rễ lớn) | tách nền, khử viền trắng, thu vừa 256×256 (**128×128 logic = 4×4 ô**), làm tối 0,78 cho chìm vào thân gỗ, nét ngoài nâu sẫm mảnh; gốc rễ bị cắt phẳng ở mép trên → mờ dần như chui ra từ dưới đất | `gach/rong-re.png` (ghi trong `gach-atlas.json` → `trang_tri`) | `code/trang_tri.py` |
| `tien-canh.png` (rễ treo) | tách 3 cụm rễ, thu cho đầu rễ thấp nhất xuống **tối đa 36 % màn** (≈195 logic – đầu Lam đứng sàn ở ≈336), đặt thưa trên bề rộng 3840 (cụm giữa lật ngang), sát mép trên, không chạm 2 mép ảnh → **lặp ngang liền**; làm tối 0,70 + bớt màu (giữ chút viền xanh lam); đầu rễ mờ nhẹ | `nen/lang-tien-canh.png` (cùng cỡ cũ 3840×1080, cuộn 1,05) | `code/trang_tri.py` (gọi từ `nen.py`) |

Kiểm chỗ nối thân gỗ (64 cặp ô bất kỳ, ảnh 64 px): chênh màu ở chỗ nối chỉ bằng 0,54 (ngang) / 0,68 (dọc) lần chênh giữa 2 cột kề
bên trong ô → **không thấy nối**. Trong game (`game/demo.html`) thân gỗ chọn 1 trong 8 ô theo vị trí (cố định, chia đều);
mảng rễ đặt ở 12 chỗ cố định trên sàn gỗ (xem `game/kiem-thu-lang-chuong/GHI-CHU.md`).

## 1. Đã làm gì

| Phần | Kết quả | Code |
|---|---|---|
| Nền parallax | 5 lớp + 1 cặp tuỳ chọn, lặp ngang liền, đã làm tối + giảm bão hoà + bớt nét nhỏ | `code/nen.py` |
| Gạch | 91 ô (gỗ-rễ 52, đá xây 39), mỗi ô 64×64, atlas + JSON + ô lẻ (v2: thân gỗ từ ảnh gen) | `code/gach.py`, `code/than_go.py` |
| Trang trí | mảng rễ 4×4 ô; tiền cảnh rễ treo (v2) | `code/trang_tri.py` |
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
| `lang-tien-canh.png` | 3840×1080 RGBA | 1920 | 1,05 | **v2**: 3 cụm rễ treo tối (ảnh gen riêng), chỉ 36 % trên của màn; vẽ SAU nhân vật |

Lớp rộng < 960 logic → khi vẽ cần 2–3 bản nối nhau (công thức trong `nen.json`). Kiểm chỗ nối mép phải→trái: chênh màu
bằng 0,9–1,1 lần chênh giữa 2 cột kề bên trong ảnh (không thấy nối); cặp tuỳ chọn 1,3–1,5 (hơi thấy nếu nhìn kỹ).

**Gạch** (`gach/gach-atlas.png` 1024×460 + `gach-atlas.json`, từng ô trong `gach/o/`). Mọi ô đúng 64×64 (32 logic), nằm gọn
trong ô (không thò ra) → vẽ thẳng theo lưới. Tên theo hàng của khuôn, tiền tố `go-` (gỗ-rễ) hoặc `da-` (đá xây):

| Nhóm | Ô |
|---|---|
| Mặt trên (rêu) | `tren-giua` (lặp ngang), `tren-giua-2/3/4`, `tren-trai`, `tren-phai`, `tren-trai-2`, `tren-phai-2` |
| Thân | gỗ: `than` (lặp 2 chiều), `than-2` … `than-8` (ảnh gen); đá: `than`, `than-2`, `than-3`, `than-diu` – 4 mép biến thể y hệt `than` |
| Tường / đáy | `canh-trai`, `canh-phai`, `day-giua`, `day-trai`, `day-phai` (góc ngoài dưới bo tròn); gỗ thêm `canh-trai-2/3/4`, `canh-phai-2/3/4`, `day-giua-2/3/4` |
| Góc trong (lõm) | `goc-trong-tl/tr/bl/br` – ô đặc, chỉ có chấm viền ở góc |
| Cột rộng 1 ô | `cot-tren`, `cot-than`, `cot-day` |
| Gờ nổi cao 1 ô | `noi-trai`, `noi-giua`, `noi-phai` |
| Khối rời | `khoi` |
| Ván một chiều | `van-trai`, `van-giua` (không có viền dọc), `van-phai`, `van-trai-2`, `van-phai-2` – mặt ván = mép trên ô, dày ~11 logic |
| Dốc | `doc-thoai-len-1` + `doc-thoai-len-2` (2 ô, lên 1 ô), `doc-thoai-xuong-1` + `-2`, `doc-len`, `doc-xuong` (45°) |

Viền đen ~2,7 px ở ảnh 2x (≈1,3 logic) và CHỈ ở cạnh lộ. Thân tối hơn mặt trên 20 % và nhạt màu hơn (mặt trên sáng dần → tối ở đáy ô).

**Mảng rễ** `gach/rong-re.png` 256×256 RGBA (128×128 logic), neo góc trên-trái, có thể lật ngang; chỉ đặt trên thân gỗ đặc.

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

1. **Thân gỗ (v2)**: hết "sóng" lặp 32 px, nhưng ảnh gen vẽ rễ to cho 1 ô LỚN, co về 32 logic thì rễ còn ~5–6 logic → nhìn
   như **lưới rễ nhỏ dày**, hơi rối so với rêu và nhân vật. Khi xen 8 ô vẫn thấy mờ mờ lưới ô (vì cùng dải mép). Hàng ngay dưới
   rêu luôn là ô 1 (sáng dần) nên có một dải ô giống nhau chạy dọc mặt sàn. Mảng rễ 4×4 trên sàn chỉ lộ nửa trên (sàn dày 3
   hàng, phần dưới ra ngoài màn).
2. **Rêu mặt trên** hơi mỏng; ô `tren-trai` (và `noi-trai`) có dải rêu buông dọc mép trái bị dừng ngang ở ~⅓ ô.
3. **Ván một chiều** mỏng và mặt ván là rêu chứ không phải ván gỗ; đá chỉ thấy một dải đá mỏng.
4. **Góc trong** chỉ là chấm viền nhỏ, ở cỡ 960 gần như không thấy (đúng ý, nhưng góc lõm trông hơi "cụt").
5. **Dốc**: ở chân dốc thoải/45° phần rêu chạm đáy ô một đoạn ngắn; chưa thử dốc nối với tường.
6. **Nền giữa**: khi làm lặp, căn nhà mái xanh ở mép trái ảnh gen bị cắt bỏ; chu kỳ lặp chỉ ~780 logic nên nếu cuộn
   lâu sẽ nhận ra tháp chuông lặp lại.
7. **Cặp xa-hốc/xa-vách** là thử nghiệm: phần hốc bị vách che được lấp bằng màu hốc mờ – trông như bóng tối loang.
8. **Tiền cảnh (v2)**: đã là rễ thật từ ảnh gen; nhưng rễ tối gần màu với rễ treo của lớp nền xa/gần nên đôi chỗ khó nhận ra
   là lớp gần nhất (chỉ phân biệt nhờ cuộn nhanh hơn). Chỉ có 3 cụm cho 1920 logic → nhịp lặp dễ nhớ nếu cuộn lâu.
9. **Cổng mở**: cánh bóp ngang nên chưa có độ dày cạnh cánh; cột phải của ảnh gen cao hơn cột trái ~4 logic (giữ nguyên).
10. **Mảnh chuông**: hình chuông khắc bên trong hơi nhoè ở cỡ 28 logic.
11. Bản xám: nền / sàn / Lam / quái tách nhau rõ; sàn gỗ và thân cây lớp gần cùng độ sáng trung bình nên ranh giới
    giữa chúng dựa vào viền + rêu mặt trên.

## 5. Nên gen lại gì (prompt ngắn, đính kèm Lam + `xem-thu/canh-ghep-960-v2.png` làm mẫu)

**Mới sau v2** (a, b, c cũ bên dưới đã dùng xong – giữ để tham khảo):

**a2) Thân gỗ to nét hơn** – để rễ trong 1 ô 32 logic không bị nhỏ li ti:
> 8 separate square tiles on plain white, 2D platformer terrain interior, matching the reference. Each tile shows ONLY
> 2 broad tree roots (each root about one third of the tile wide), chunky flat colors, 3 tones only, muted honey and chestnut
> brown, no moss, no outline, no tiny grain. Every tile tiles seamlessly left-right and top-bottom with ALL other tiles.

**b2) Thêm 2 mảng rễ khác hình** (cùng prompt b, thêm "different shape: one horizontal root band 6×2 tiles; one small
2×2 knot") để sàn dài không lặp 1 hình.

**c2) Tiền cảnh thêm 2–3 cụm khác**: như prompt c, thêm "5 clusters of different widths, some thin single roots, warmer
dark brown than the background roots, slightly larger".

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
  code/                 chung.py (hàm chung, lấy từ the-gioi/code), nen.py, gach.py, than_go.py, trang_tri.py, do_vat.py,
                        xem_thu.py, chay_het.py
  nen/                  6 PNG + nen.json
  gach/                 gach-atlas.png + gach-atlas.json + o/*.png (91 ô) + rong-re.png
  do-vat/               7 PNG + do-vat.json
  xem-thu/              canh-ghep-{2x,960,xam}-v2.png, bang-o-gach-v2.png (mới) + bản cũ không -v2
```
