# Báo cáo RUN – Lam từ sheet ChatGPT (P2) → pixel 64×64, 8 khung · 12 FPS · loop

Nguồn: `art/nhan-vat/lam-chatgpt/run-sheet-v1.png` (2172×724 RGBA, 8 nhân vật cao 288–324 px, nền trong suốt thật, viền mềm). Script lặp lại được: `tools/chatgpt-sheet-to-64.py` (chạy lại cho đúng từng pixel: `python3 tools/chatgpt-sheet-to-64.py --sheet art/nhan-vat/lam-chatgpt/run-sheet-v1.png --so-khung 8 --ra art/nhan-vat/lam-chatgpt/run --sheet-game game/anim/lam-chatgpt`). Số liệu đầy đủ: `kiem-tra.json`.

Ảnh để xem: **`so-sanh-goc-x4.png`** (hàng trên: khung ChatGPT thu nearest + khoá 12 màu chưa dọn · hàng dưới: sau dọn), `run-x4.png` / `run-x8.png`, `run.gif` (×4, 12 FPS, lặp vô hạn), `chong-silhouette.png`, `trong-game-x1.png` / `trong-game-x4.png` (nền Làng Chuông, 8 khung dọc lối đi, chân tại y=241), `lat-check.png`, `anim2d-check.png`. Sheet game: `game/anim/lam-chatgpt.png` + `lam-chatgpt.anim.json`.

**Không đụng:** `lam-proto.*`, `game/demo.html`, `game/lib/*`, `art/sprite/*`, các file sẵn có trong `tools/*`, `game/xem-thu/anim2d.html`, nhánh `khoi-tao-du-an`.

## Bước 1 – Tách 8 khung

Sheet có alpha thật (nền alpha 0, nhân vật alpha ≈ 252, viền mềm alpha 1–127 quanh nhân vật và nhiều hạt nhiễu alpha < 32 rải khắp nền). Mặt nạ đặc = alpha ≥ 128; nhiễu và viền mềm bị bỏ. **Không tách được theo cột trống**: lưỡi kiếm khung k vươn sang cùng dải cột với vạt áo khung k+1 (không chạm nhau nhưng trùng cột), nên tách bằng **thành phần liên thông** → đúng 8 mảnh lớn, sắp theo mép trái. Nhánh flood fill từ mép (cho sheet nền đen đặc) có trong script nhưng sheet này không cần.

| Khung | bbox nguồn (x0,y0,x1,y1) | cao | rộng | tâm 2 mắt (nguồn) |
|---|---|---|---|---|
| F0 | 8, 262, 304, 572 | 311 | 297 | 189.6, 356.9 |
| F1 | 296, 262, 584, 571 | 310 | 289 | 477.6, 358.0 |
| F2 | 586, 258, 839, 547 | 290 | 254 | 738.5, 355.5 |
| F3 | 814, 261, 1119, 571 | 311 | 306 | 1008.0, 355.6 |
| F4 | 1094, 260, 1386, 583 | 324 | 293 | 1282.7, 356.0 |
| F5 | 1352, 261, 1656, 579 | 319 | 305 | 1553.1, 356.4 |
| F6 | 1651, 261, 1913, 548 | 288 | 263 | 1812.7, 355.6 |
| F7 | 1890, 265, 2171, 576 | 312 | 282 | 2074.8, 358.9 |

Nhận xét ngay từ nguồn: đầu của ChatGPT **đứng yên tuyệt đối** (hàng mắt dao động 355–359 px, tức < 1 px ở cỡ 64); chỉ chân thay đổi: F2/F6 chân co lên (đáy 547/548 = khung bay), F4/F5 chân duỗi **thấp hơn** F0 11/7 px (= 1,6 / 1 px ở cỡ 64).

## Bước 2 – Thu nhỏ, khoá 12 màu

Một tỉ lệ chung cho cả 8 khung: `s = 46 / trung vị chiều cao (311) = 0,14791` → cao ra 42,6–47,9 px (F4 cao 48 vì chân duỗi, F2/F6 43 vì chân co). Khoá màu: màu bảng gần nhất theo RGB, không dither; alpha chỉ 0/255 (đã kiểm từng file: `[0, 255]`).

Hai phương án thu, chấm điểm sau khi dọn cùng 3 quy tắc (điểm = mảnh rời ×5 + lỗ ×2 + đốm 1–2 px + mắt mất ×10, thấp hơn thắng):

| | F0 | F1 | F2 | F3 | F4 | F5 | F6 | F7 | Tổng |
|---|---|---|---|---|---|---|---|---|---|
| **đa số khối** (đốm 1–2 px) | 25 | 26 | 28 | 26 | 22 | 29 | 27 | 23 | điểm **308** |
| nearest (đốm 1–2 px) | 64 | 55 | 55 | 50 | 55 | 76 | 59 | 60 | điểm 526 |

**Chọn đa số khối**: ít đốm lẻ bằng nửa nearest, đường viền trong (mép mũ, vạt áo) liền hơn; nearest giữ mắt nhỉnh hơn (mất 4 vs 9 mắt trước khi đặt lại) nhưng rải hạt khắp áo choàng. Mắt được đặt lại từ toạ độ nguồn nên điểm cộng đó của nearest không còn ý nghĩa. Bản nearest chưa dọn giữ ở hàng trên `so-sanh-goc-x4.png` để đối chiếu.

## Bước 3 – Dọn (3 quy tắc + 2 quy tắc phụ), không blur, không thêm màu

Thứ tự mỗi khung: lấp lỗ trong ≤ 2 px → hoà đốm 1–2 px màu tối/trung lọt trong một màu khác (màu sáng #83CC93 #E1B85A #F3E6C8 #CEF0D6 được bảo vệ: mắt, chuông, chắn kiếm, lưỡi kiếm, vạch ủng) → đốm đen lẻ trong lòng (≥ 3 lân cận màu khác → màu lân cận đa số, 2 lượt, như `mau-ve-tay.py`) → mấu 1 px ở silhouette → viền ngoài 1 px #0C0F14 liền. **Mắt**: 2 cụm vàng nhỏ ở vùng mặt nguồn được đo toạ độ và đặt lại nếu thu nhỏ làm mất (đặt lại 1/2/1/1/2/0/2/0 pixel ở F0…F7; kết quả mọi khung đều có 2 điểm sáng cột 37 và 39, F2/F3 mắt trái cao 2 px). **Sửa tay**: danh sách `SUA_TAY` trong script để **rỗng** – chưa phải sửa pixel nào bằng tay.

| Khung | lỗ lấp | đốm hoà | đốm đen bỏ | mấu bỏ | viền ngoài đổi |
|---|---|---|---|---|---|
| F0 | 0 | 0 | 43 | 4 | 15 |
| F1 | 2 | 1 | 49 | 3 | 11 |
| F2 | 0 | 0 | 48 | 1 | 5 |
| F3 | 0 | 0 | 54 | 2 | 12 |
| F4 | 0 | 1 | 65 | 2 | 4 |
| F5 | 0 | 1 | 59 | 6 | 17 |
| F6 | 0 | 1 | 46 | 4 | 17 |
| F7 | 0 | 1 | 54 | 8 | 15 |

"Đốm đen bỏ" nhiều (43–65) vì nét đen bên trong của ChatGPT (mép mũ, đường rách áo) thu về 64 thành nhiều chấm đen rời; quy tắc chỉ bỏ chấm có ≥ 3 lân cận màu khác, nét đen liền 1 px vẫn giữ.

## Bước 4 – Căn pivot [32,63]

Ngang: tâm 2 mắt mọi khung → **cột 38** (chọn sao cho hợp bbox 8 khung cân quanh cột 32; không căn giữa từng khung theo bbox). Dọc: khung chống đất → hàng đáy ủng = 63; khung bay (F2, F6: khoảng mắt→chân ngắn hơn trung vị ≥ 3 px) → giữ hàng mắt = 32 như khung chống đất, chân lơ lửng ở hàng 60 (không dịch cả sprite lên). Không pixel nào rơi ngoài ô 64.

| Khung | bbox ra | cao×rộng | **hàng đáy ủng** | chống đất | hàng mắt | nhún đầu | số px | số màu |
|---|---|---|---|---|---|---|---|---|
| F0 | 12,18 → 54,63 | 46×43 | **63** | có | 32 | 0 | 942 | 11 |
| F1 | 12,18 → 53,63 | 46×42 | **63** | có | 32 | 0 | 947 | 10 |
| F2 | 16,18 → 52,60 | 43×37 | 60 | bay | 32 | 0 | 822 | 10 |
| F3 | 10,18 → 53,63 | 46×44 | **63** | có | 32 | 0 | 990 | 10 |
| F4 | 11,16 → 53,63 | 48×43 | **63** | có | 30 | −2 | 904 | 10 |
| F5 | 9,17 → 53,63 | 47×45 | **63** | có | 31 | −1 | 968 | 10 |
| F6 | 15,18 → 53,60 | 43×39 | 60 | bay | 32 | 0 | 838 | 10 |
| F7 | 11,18 → 51,63 | 46×41 | **63** | có | 32 | 0 | 929 | 10 |

Nhún đầu −2/−1 px ở F4/F5 là do ChatGPT vẽ chân hai khung này dài hơn (xem bước 1): để ủng chạm hàng 63 thì đầu phải lên 2/1 px. Trong giới hạn 1–2 px cho phép, nhưng chiều nhún ngược vật lý (đầu lên khi chân duỗi chạm đất) – ghi ở mục Thẳng thắn. **Kiếm**: ChatGPT vẽ kiếm ở **tay gần** (tay phía người xem, trước ngực), mũi kiếm chỉ về trước; giữ nguyên, không đổi tay.

Lật: `lat-check.png` + `kiem-tra.json → lat`: cả 8 khung lệch trái/phải/đáy 0 px, 0 pixel không khớp theo công thức pivotLat = [fw−1−px, py] của anim2d.js.

## Bước 5 – Ổn định thời gian

Vùng đầu/thân = hàng ≤ 45 (hàng mắt + 13), so trong hệ đã khử nhún; pixel ≤ 3 px chỉ có ở 1 khung mà 2 khung kề giống nhau → lấy giá trị khung kề; chân/tay/áo dưới hàng 45 không đụng. Số px đổi: F0 32 · F1 28 · F2 44 · F3 32 · F4 31 · F5 32 · F6 22 · F7 43 (chủ yếu hạt ở vạt áo choàng và mép mũ).

Sai khác pixel khung kề (cả ô / vùng đầu-thân / vùng chân), sau ổn định:

| Cặp | 0→1 | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 6→7 | **7→0 (khép vòng)** |
|---|---|---|---|---|---|---|---|---|
| cả ô | 352 | 440 | 554 | 853 | 739 | 643 | 461 | 402 |
| đầu/thân (hàng < 46) | 141 | 158 | 227 | 485 | 425 | 338 | 174 | 196 |
| chân (hàng ≥ 46) | 211 | 282 | 327 | 368 | 314 | 305 | 287 | 206 |

7→0 (402) nằm trong dải các cặp khác (352–853) → không có cú giật ở điểm nối; anim2d.html "Phát 20 vòng": *Không có lần nào khung nhảy sai thứ tự · điểm nối 7→0: liền mạch*. Đầu/thân 3→4 và 4→5 lớn (485/425) do F4 nhún −2 px và áo choàng tung mạnh nhất ở F4, không phải đầu đổi hình.

## Kết quả chung

* 8 file `run-0..7.png` 64×64 RGBA, alpha chỉ {0, 255}, **11 màu** đều trong bảng (`mauNgoaiBang = []`); #83CC93 không xuất hiện (xem Thẳng thắn). Lưỡi kiếm #CEF0D6 15–22 px/khung, chuông + chắn kiếm vàng 25–36 px/khung, 2 mắt ở mọi khung.
* `game/anim/lam-chatgpt.png` 512×320: hàng 1 = run 8 khung; **hàng 0 idle TẠM = 1 khung chép từ run-0** (ChatGPT chưa sinh khung đứng) – `lam-chatgpt.anim.json` ghi `idle.frames = 1`, cùng cấu trúc `lam-proto.anim.json` (chưa có jump).
* `anim2d-check.png`: nạp sheet vào `game/xem-thu/anim2d.html` qua URL (trang dùng bố cục `lam.anim.json` của nó nên ô idle 1–5 trống là đúng), chọn run, Phát 20 vòng ĐẠT, Kiểm lật ĐẠT, không lỗi JS.

## Thẳng thắn

1. **Kiếm tay gần, tay không vung**: 8 khung ChatGPT đều cầm kiếm tay gần, cánh tay cầm kiếm gần như đứng yên trước ngực (lưỡi kiếm 8 khung đều nằm cột 35–52, hàng 35–44, chỉ nhích 1–3 px), nên khi chạy phần thân trên trông "trượt", không đung đưa tay. Khác mẫu proto 3D (kiếm tay gần nhưng tay có vung). Giữ nguyên theo quyết định, chưa chỉnh.
2. **Chân không trùng khung nhưng khó đọc**: không có 2 khung chân giống nhau (cặp gần nhất F2–F6, hai khung bay, khác 137 px; các cặp khác ≥ 206 px). Nhưng ChatGPT tô **hai chân cùng tông tối** (#1A212B/#212835), chân xa không sáng hơn chân gần, ủng không có vạch sáng riêng (vạch xanh trên ủng nguồn thu về trùng màu áo #32804F, màu #83CC93 vì thế không dùng tới) → ở cỡ 64 khó thấy chân nào trước, chân nào sau, nhất là F1 và F7 (hai chân chụm). Đây là điểm yếu lớn nhất so với proto 3D vòng 2 (đã tách chân xa sáng hơn một bậc).
3. **Khép vòng**: về số liệu thì liền (bảng trên). Về tư thế: thứ tự ChatGPT là F0 bước dài → F1 chụm → F2 bay → F3 bước → F4 bước dài nhất → F5 → F6 bay → F7 chụm; hai pha bay cách nhau 4 khung là đúng, nhưng F0/F4 không rõ là chân nào ở trước (cùng dáng), nên có thể 8 khung thực chất là **một nửa chu kỳ lặp 2 lần** chứ không phải trái–phải luân phiên. Không xác nhận được vì hai chân cùng màu (mục 2).
4. **Nhún ngược**: F4/F5 đầu lên 2/1 px khi chân duỗi chạm đất, do ChatGPT vẽ chân dài hơn ở 2 khung này chứ không phải thân nhún. Mắt thường ở ×1 khó thấy, ở ×4 thấy đầu nhấp nhẹ.
5. **Mất chi tiết**: viền xanh nhạt mép mũ và đường rách áo thành vài chấm; khoen treo chuông còn là 1–2 px sáng ở mép mũ (không rõ hình vòng); trâm/khoá ngực còn 1 chấm sáng; hai mắt phải đặt lại từ toạ độ nguồn ở 6/8 khung vì thu đa số làm mất. Chuông, chắn kiếm vàng, lưỡi kiếm, quả lắc chuông còn đủ.
6. **Kiếm không đều giữa các khung**: F7 lưỡi dày hơn (22 px #CEF0D6 so với 15–18 px), F5 lưỡi ngắn hơn (chỉ cột 42–50, bị tay/áo che) – ChatGPT vẽ kiếm hơi khác nhau từng khung; chưa sửa.

### Đề xuất prompt gen lại (nếu muốn sửa gốc; mỗi dòng 1 prompt)

* `Same character and style, 8-frame run cycle facing right, sword held in the FAR hand behind the body, near arm swings naturally, transparent background, 8 equal cells with clear gaps`
* `Same run cycle, far leg and far boot one shade lighter than the near leg, bright green stripe on both boots, frames 0-3 near leg forward, frames 4-7 far leg forward`
* `Keep hood, eyes and bell at the exact same pixel position in all 8 frames; only legs, arms and cloak move; feet of contact frames touch one common ground line`
* `Same character, 1 standing idle frame and 4 jump frames, same size and ground line, transparent background`
