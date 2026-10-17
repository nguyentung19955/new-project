# Báo cáo RUN – Lam từ sheet ChatGPT (P2) → pixel **cao 64, ô 80×80**, pivot [40,79], 8 khung · 12 FPS · loop

Quyết định: bản 46 px (thư mục `run/`) bị nhoè chi tiết → nâng Lam lên **cao 64 px = 4 ô gạch 16 px**, ô sprite 80×80, pivot [40,79], màn game vẫn 480×270 (Lam chiếm 64/270 ≈ 24 % chiều cao màn, trước là 17 %).

Nguồn: `art/nhan-vat/lam-chatgpt/run-sheet-v1.png` (2172×724, 8 nhân vật cao 288–324 px) – **cùng nguồn** bản 46. Script mới: `tools/chatgpt-sheet-to-px.py` (tổng quát hoá từ `chatgpt-sheet-to-64.py`, file cũ giữ nguyên). Chạy lại cho đúng từng pixel:

```
python3 tools/chatgpt-sheet-to-px.py --sheet art/nhan-vat/lam-chatgpt/run-sheet-v1.png --so-khung 8 \
  --ra art/nhan-vat/lam-chatgpt/run64 --cao 64 --o 80 --sheet-game game/anim/lam-chatgpt-80 --so-voi art/nhan-vat/lam-chatgpt/run
```

Số liệu đầy đủ: `kiem-tra.json`. Ảnh để xem: **`so-sanh-46-64-x4.png`** (hàng trên bản 46 cũ, hàng dưới bản 64 mới, cùng phóng ×4), `so-sanh-goc-x4.png` (nearest chưa dọn | sau dọn), `run-x4.png` / `run-x8.png`, `run.gif` (×4, 12 FPS), `chong-silhouette.png`, `trong-game-x1.png` / `trong-game-x4.png`, `lat-check.png`, `anim2d-check.png`. Sheet game: `game/anim/lam-chatgpt-80.png` (640×400) + `lam-chatgpt-80.anim.json`.

**Không đụng:** `lam-proto.*`, `lam-chatgpt.png` / `.anim.json` (bản 46), `game/demo.html`, `game/lib/*`, `game/xem-thu/anim2d.html`, `art/sprite/*`, `tools/chatgpt-sheet-to-64.py`, nhánh `khoi-tao-du-an`.

## Script `chatgpt-sheet-to-px.py` – khác gì bản 64

* Thêm `--cao` (mặc định 64) và `--o` (cỡ ô, mặc định 80); pivot = [o/2, o−1]. Mọi hàm đọc cỡ ô từ biến toàn cục nên các bước tách khung, thu đa số khối, khoá 12 màu, 3+2 quy tắc dọn, đặt lại mắt, căn pivot theo mắt, ổn định thời gian **giữ nguyên**.
* Hai hằng số phụ thuộc cỡ thân được **tỉ lệ theo --cao** (ở cỡ 46 cho đúng giá trị cũ): vùng đầu/thân để ổn định thời gian = hàng mắt + 13·cao/46 (46 → 13, 64 → 18); ngưỡng "khung bay" = 2,5·cao/46 px (46 → 2,5, 64 → 3,5). Các ngưỡng pixel-art (lỗ ≤ 2 px, đốm 1–2 px, đốm thời gian ≤ 3 px) giữ nguyên vì là quy tắc dọn theo pixel, không theo thân.
* Thêm `--so-voi` → `so-sanh-46-64-x4.png`; thêm `domLeCuoi` (đốm 1–2 px còn lại trên khung cuối) và `trongGame` (vị trí 8 khung) vào `kiem-tra.json`.
* Sheet game xuất 8 cột × 5 hàng × ô o (= 640×400 với o = 80), cùng bố cục `lam.anim.json`.
* `trong-game`: 8 khung rải đều từ mép trái tới sát Quái Chuông Gỗ (bước = chỗ trống / 7, tối đa 54).
* `anim2d-check`: trang `anim2d.html` luôn fetch `../anim/lam.anim.json` (ô 64) rồi dùng JSON đó cho mọi PNG nạp sau → script **chuyển hướng đúng 1 yêu cầu đó** sang `lam-chatgpt-80.anim.json` trong trình duyệt headless (`page.route`), file trang không đổi. Ô 80 × zoom 6 = 480 px vượt canvas 400 px cố định của trang → chụp ở ×3.
* **Kiểm hồi quy:** chạy `--cao 46 --o 64` ra 8 khung **trùng 0 pixel** với `run/run-0..7.png` cũ.

## Bước 1–2 – Tách 8 khung, thu nhỏ

Tách thành phần liên thông như trước (8 mảnh lớn, bbox nguồn y hệt bảng ở `run/BAO-CAO.md`). Tỉ lệ chung `s = 64 / 311 = 0,20579` → cao ra 59,3–66,7 px (F4 67 vì chân duỗi, F2/F6 59–60 vì chân co). Điểm chấm hai phương án sau dọn: **đa số khối 356** vs nearest 760 → chọn đa số khối (như bản 46: 308 vs 526). Khoá 12 màu gần nhất, alpha chỉ {0, 255} (kiểm từng file).

## Bước 3 – Dọn (3+2 quy tắc) và mắt

| Khung | lỗ lấp | đốm hoà | đốm đen bỏ | mấu bỏ | viền ngoài đổi | **mắt đặt lại** (46 cũ) |
|---|---|---|---|---|---|---|
| F0 | 3 | 2 | 53 | 3 | 3 | **0** (1) |
| F1 | 1 | 3 | 56 | 4 | 0 | 1 (2) |
| F2 | 0 | 2 | 55 | 1 | 6 | 2 (1) |
| F3 | 0 | 3 | 55 | 3 | 0 | **0** (1) |
| F4 | 1 | 2 | 61 | 4 | 6 | **0** (2) |
| F5 | 0 | 6 | 59 | 3 | 1 | **0** (0) |
| F6 | 0 | 2 | 50 | 1 | 1 | **0** (2) |
| F7 | 2 | 2 | 62 | 1 | 0 | **0** (0) |

**Mắt tự giữ ở 6/8 khung** (bản 46 chỉ 2/8); F1 cần 1 px, F2 cần 2 px. Mỗi mắt giờ là cụm 2–3 px #F3E6C8 (cột 47–51) thay vì 1 chấm. `SUA_TAY` vẫn rỗng.

## Bước 4–5 – Căn pivot [40,79], ổn định thời gian

Ngang: tâm 2 mắt → **cột 48** (hợp bbox 8 khung cân quanh cột 40). Dọc: khung chống đất đáy ủng = 79; F2/F6 bay (mắt→chân ngắn hơn trung vị ≥ 3,5 px) giữ hàng mắt chuẩn = 35, chân lơ lửng hàng 74/75. Không pixel nào rơi ngoài ô 80. Ổn định thời gian vùng hàng ≤ 53, số px đổi: 60 · 56 · 64 · 68 · 51 · 61 · 60 · 65.

| Khung | bbox ra (x0,y0 → x1,y1) | cao×rộng | **hàng đáy ủng** | chống đất | hàng mắt | nhún đầu | số px | số màu | đốm 1–2 px còn | lưỡi #CEF0D6 | vàng chuông+chắn |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F0 | 12,16 → 72,79 | 64×61 | **79** | có | 36 | +1 | 1836 | 11 | 37 | 34 | 49 |
| F1 | 12,16 → 70,79 | 64×59 | **79** | có | 36 | +1 | 1849 | 10 | 44 | 32 | 53 |
| F2 | 18,15 → 69,74 | 60×52 | 74 | bay | 35 | 0 | 1577 | 11 | 37 | 37 | 45 |
| F3 | 8,16 → 70,79 | 64×63 | **79** | có | 35 | 0 | 1937 | 10 | 35 | 34 | 58 |
| F4 | 10,13 → 69,79 | 67×60 | **79** | có | 33 | −2 | 1736 | 10 | 26 | 30 | 53 |
| F5 | 8,14 → 69,79 | 66×62 | **79** | có | 34 | −1 | 1891 | 10 | 30 | 27 | 51 |
| F6 | 16,17 → 69,75 | 59×54 | 75 | bay | 35 | 0 | 1631 | 10 | 40 | 37 | 49 |
| F7 | 10,16 → 68,79 | 64×59 | **79** | có | 34 | −1 | 1833 | 10 | 38 | 37 | 61 |

Lật: 8/8 khung lệch trái/phải/đáy 0 px, 0 pixel sai (công thức pivotLat = [fw−1−px, py]). Sai khác pixel khung kề (cả ô): 718 · 1196 · 1200 · 1653 · 1373 · 1529 · 1274 · **1154 (7→0)** – điểm nối nằm trong dải, không giật; anim2d.html "Phát 20 vòng": không khung nào nhảy sai thứ tự, điểm nối 7→0 liền mạch; "Kiểm lật": ĐẠT; 0 lỗi JS.

## Bảng so 46 vs 64 – chi tiết giữ được

| Chi tiết | bản 46 (ô 64) | bản 64 (ô 80) |
|---|---|---|
| Số pixel / khung | 822–990 | 1577–1937 (≈ ×1,9) |
| Số màu dùng | 11 (không có #83CC93) | 12 (#83CC93 chỉ **1 px** ở F2 – coi như vẫn không) |
| Mắt | 1 chấm/mắt, phải đặt lại 6/8 khung | cụm 2–3 px/mắt, tự giữ 6/8 khung |
| Chuông | khối vàng 25–36 px, hình giọt | 45–61 px, **rõ hình chuông** có vai, miệng loe, quả lắc tối ở giữa |
| Khoen treo chuông | 1–2 px sáng ở mép mũ | thành **dải dây 2–3 px** nối mép mũ → chuông (#9C6B30/#E1B85A), vẫn **chưa phải vòng tròn rỗng** (nguồn ChatGPT vẽ dây, không vẽ khoen) |
| Trâm/khoá ngực | 1 chấm sáng | **ô 3×3 #F3E6C8 có khía xanh** ở giữa ngực – đọc được |
| Lưỡi kiếm | 15–22 px, 2 hàng | 27–37 px, 3 hàng, có **chắn kiếm vàng rõ** và mũi nhọn |
| Mép mũ xanh nhạt | vài chấm #32804F | viền #32804F liền 1–2 px quanh mũ; **không có** #83CC93 (nguồn tô mép mũ cùng tông #32804F) |
| Vạch ủng sáng | không | **không** – ủng chỉ có mũi #32804F, không có vạch #83CC93 (lỗi nguồn, xem Thẳng thắn) |
| Đường rách gấu áo choàng | chấm rời | răng cưa 2–3 bậc liền |
| Đốm 1–2 px còn lại | 18–30/khung | 26–44/khung (nhiều hơn tuyệt đối nhưng trên gấp đôi số pixel, tỉ lệ ≈ bằng: 2,4 % vs 2,1 %) |
| Nhún đầu | 0/0/0/0/−2/−1/0/0 | +1/+1/0/0/−2/−1/0/−1 (biên độ 3 px trên thân 64, ≈ cùng tỉ lệ 2 px/46) |

## Trong game

`trong-game-x1.png` 480×270: 8 khung dọc lối đi Làng Chuông, chân y=241, tâm chân x = 35, 87, …, 399 (bước 52), Quái Chuông Gỗ ở x=457. **Khung rộng nhất 63 px > bước 52 → mép áo choàng / mũi kiếm khung k chờm sang khung k+1 vài px** (chỉ là ảnh kiểm, trong game mỗi lúc 1 khung). **Quái 32×32 giờ bé hơn Lam rõ rệt** (Lam 64 cao, quái 32) – để vậy theo quyết định, sẽ nâng quái sau nếu cần.

## Thẳng thắn

1. **Tay kiếm không vung** – lỗi nguồn ChatGPT: 8 khung cầm kiếm tay gần, cánh tay gần đứng yên trước ngực (lưỡi kiếm chỉ nhích 1–3 px giữa các khung), thân trên trông "trượt" khi chạy. Cỡ 64 làm điều này **dễ thấy hơn** chứ không bớt. Chưa sửa.
2. **Hai chân cùng tông tối** – lỗi nguồn: chân xa không sáng hơn chân gần, ủng không có vạch sáng, nên vẫn khó đọc chân nào trước (F1/F7 hai chân chụm). Cỡ 64 cho thấy rõ hình ủng hơn nhưng không tách được chân trước/sau vì màu nguồn không khác. #83CC93 hầu như không dùng (1 px).
3. **Khoen chuông chưa thành vòng**: ở 64 nó thành dải dây rõ, nhưng nguồn không vẽ vòng rỗng nên không có gì để giữ.
4. **Nhún ngược** F4/F5 (đầu lên khi chân duỗi) vẫn như bản 46 vì là chân nguồn dài hơn; thêm +1 ở F0/F1/F7 (sai số làm tròn khi thu 311 → 64).
5. **Đốm lẻ** 26–44/khung, nhiều hơn bản 46 về số tuyệt đối; phần lớn là hạt sáng/tối ở vạt áo choàng và mép mũ do nguồn ChatGPT có texture. Không tăng quy tắc dọn để tránh xoá chi tiết thật.
6. **Chiều cao không đều**: F4 67, F5 66 (chân duỗi vượt 64), F2/F6 59–60 (bay). Ô 80 còn dư 13 px trên đầu ở khung cao nhất – đủ cho jump sau này.
7. **Idle tạm** vẫn = 1 khung run-0 (ChatGPT chưa sinh khung đứng).

## anim2d.js / anim2d.html – có cần sửa để chạy ô 80? (chỉ liệt kê, CHƯA sửa)

**`game/lib/anim2d.js`: không hard-code 64.** `frameWidth/frameHeight/pivot` đọc từ JSON, `kiemLat` dùng `sheet.fw/fh`, `placeholder` tính theo `fw/fh`. Số 64 chỉ xuất hiện trong ví dụ JSON ở comment đầu file. Sheet 80 nạp và chạy đúng (đã kiểm bằng headless). → **Không cần sửa lib.**

**`game/xem-thu/anim2d.html`:** chạy được ô 80 về logic (kết quả ở `anim2d-check.png`), nhưng có 4 chỗ cố định theo ô 64, nếu muốn dùng trang này cho sheet 80 thì sửa:

1. `TV.Anim.nap('../anim/lam.anim.json')` cố định; PNG nạp qua ô URL / chọn tệp **dùng lại JSON đó** (ô 64, 5 animation). Cần thêm ô nhập/chọn file JSON hoặc nút chọn `lam-chatgpt-80.anim.json` (script hiện phải chuyển hướng yêu cầu trong headless để kiểm).
2. `var W = 400` – canvas phát rộng cố định 400 px: ô 80 × zoom 6 = 480 px bị cắt (×3 = 240 thì vừa). Nên tính `W = sheet.fw * z + lề` như `H` đã làm (`H = (sheet ? sheet.fh : 64) * z + 56` – dòng này có số 64 chỉ là mặc định khi chưa có sheet, vô hại).
3. Chữ cố định "Sheet PNG thật (512×320, 5 hàng × 8 cột)" và "dấu + là pivot [32,63]" – chỉ là nhãn, sai số liệu với ô 80 (640×400, [40,79]).
4. Vạch mặt đất và lưới vẽ theo `sheet.fw/fh` → đúng, không cần sửa.

**`game/demo.html`** (chưa tích hợp anim2d): khi tích hợp cần lấy pivot từ JSON (không gán 32/63) và để ý Lam 64 cao so với lối đi/quái 32 px.
