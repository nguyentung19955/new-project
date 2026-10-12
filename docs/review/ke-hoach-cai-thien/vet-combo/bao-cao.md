# Phiên vet-combo (12/10): combo một vũ khí không hiện đủ vệt chém

Chủ dự án (chơi trên iPhone) báo: *"Khi combo 1 vũ khí cứ thấy không hiện hết slash vậy"*.

## Tóm tắt

- **Nguyên nhân thật:** kiếm của **thân bộ** (Cu Tèo mặc bộ Hang Biển, Cu Lì mặc bộ Lâu Đài, Cu Tí mặc bộ Rừng Già lúc chạy).
  Cung vệt kiếm (`js/fx.js` `cungVk`) bỏ mọi mẫu mà kiếm đang vẽ **sau thân** (`q.front === false`, do phiên Chém kiếm mượt
  8cac41b thêm). Thân bộ có mũ / đồ to nên đĩa mặt đo được to, gần như cả đường vung bị coi là "sau thân": **nhát 1 (Chém ngang)
  và nhát 3 (Nhát kết) còn 0 mẫu**, nhát 2 còn 7 mẫu ở một góc (16°). Không đo được cung thì vệt rơi về chỗ cố định cũ —
  nhỏ, đè lên người, không theo kiếm. Điểm ảnh vệt thấy được ở các nhát đó chỉ còn **~55 %** so với thân gốc.
- **Đã sửa (cờ `G.VET_TRON`, tắt bằng `?vettron=0` → y hệt trước, đã so từng nhát):** vệt là hiệu ứng, vẽ theo đường vung nhìn
  từ ngoài, **không cắt theo lớp thân**. Chỉ giữ luật né mặt theo **hướng lưỡi** (kiếm chĩa ra sau lưng thì cung vệt không vòng
  qua đầu — y như thân gốc vẫn dùng); còn dưới 3 mẫu thì lấy cả đường vung, không bao giờ rơi về chỗ cố định khi đo được kiếm.
- **Kết quả:** mọi nhát combo kiếm của 8 thân × đứng / chạy đều có vệt **3 450 – 4 400 điểm ảnh** (trước: thấp nhất 1 962),
  nhát yếu nhất thân bộ từ ~1 970 lên ~3 450 (+75 %). Thân gốc, giáo, búa, cung: y hệt.
- Giữ nguyên: kiếm không che mặt (`G.KIEM_SAU`), đường vung mượt (`G.KIEM_MUOT`), độ đậm vệt (`G.VET_DAM`), cỡ vệt (`G.VET_CO`).
  Không đổi gameplay (chỉ đổi chỗ đặt ảnh vệt; đòn, thời điểm chạm, sát thương không chạm tới). Không đụng đăng nhập / lưu mây.

## Cách đo

Bản **hai tệp** như web (`LK_HAI_TEP=1 python3 game/build.py --hai-tep`, phục vụ `game/dist` bằng `full-audit/A-nhan-vat/kiem/srv2.py`,
mở `linh-khi-nhe.html?cloud=0`), Chromium 844×390 dpr 3 (iPhone ngang), Playwright Python.

1. `kiem/do.py` + `kiem/do_vet.js` — bot bấm Đánh liên tục (chạm mỗi 5 nhịp, 150 nhịp) cho **4 em bé × (thân gốc + 1 thân bộ) × 4 vũ khí ×
   (đứng yên / vừa chạy)**, 2 bia hai bên. Mỗi nhát (`M.hit`): ghi tên đòn, các hình vệt sinh ra (`G.fx.state().E`, theo `ty` / ảnh).
   Mỗi khung: vẽ thật, rồi vẽ lại **có giấu hình vệt** (vệt ảnh `hu-chem/dam/quet/nen-dat/ban-cung`, trăng khuyết / đâm code, dải vệt code);
   hiệu hai ảnh quanh em bé = **điểm ảnh vệt thấy được** (đơn vị điểm ảnh thế giới), cộng từ nhát đó tới nhát kế. Chớp trúng đòn trên bia,
   vòng sóng, hạt không tính.
2. `kiem/cung.py` + `kiem/cung.js` — từng nhát kiếm: đường vung thật của mũi kiếm trong cửa sổ vệt (41 mẫu như `cungVk`), mẫu bị bỏ vì
   chĩa ra sau (`G.KIEM_KHOP`), vì vẽ sau thân (`G.KIEM_MUOT`), độ dài cung còn lại.
3. `kiem/tran.py` + `kiem/do_tran.js` — trận thật ải 1-2 có quái, vòng lặp `requestAnimationFrame` thật, người chơi giả chạm Đánh,
   đi tới quái: đếm nhát không sinh vệt, số lần vẽ có vệt, điểm ảnh vệt mỗi lần vẽ.
4. So với bản trước hôm nay: worktree `4a7fdbe` (phiên Sửa vệt chém — bản "vệt hiện rõ lại"), và `?vettron=0` trên bản mới (= HEAD c9ab627,
   đã so: 0 nhát lệch quá 3 %).

Số đo đủ: `so/tung-nhat.json` (mọi nhát, px ở 4a7fdbe / trước / sau), `so/cung-vet-kiem.txt`.

## Số đo từng nhát (kiếm, 3 nhát đầu của combo, điểm ảnh vệt thấy được trước → **sau**)

| Thân · kiểu | Nhát 1 Chém ngang | Nhát 2 Chém ngược | Nhát 3 Nhát kết |
|---|---|---|---|
| Cu Tí gốc · đứng | 3441 → **3441** | 3526 → **3526** | 4286 → **4286** |
| Cu Tí gốc · chạy | 3505 → **3527** | 3535 → **3535** | 4297 → **4295** |
| Cu Tí bộ Rừng Già · đứng | 3561 → **3561** | 3593 → **3520** | 4376 → **4376** |
| Cu Tí bộ Rừng Già · chạy | **1982** → **3549** | **2285** → **3558** | 4203 → **4258** |
| Cu Tèo gốc · đứng | 3539 → **3539** | 3533 → **3533** | 4337 → **4337** |
| Cu Tèo gốc · chạy | 3561 → **3516** | 3509 → **3534** | 4365 → **4312** |
| Cu Tèo bộ Hang Biển · đứng | **1998** → **3452** | 3610 → **3463** | 4264 → **4395** |
| Cu Tèo bộ Hang Biển · chạy | **1972** → **3560** | **2269** → **3583** | 4187 → **4267** |
| Cu Lì gốc · đứng | 3527 → **3527** | 3542 → **3542** | 4315 → **4315** |
| Cu Lì gốc · chạy | 3515 → **3520** | 3530 → **3530** | 4278 → **4271** |
| Cu Lì bộ Lâu Đài · đứng | **2002** → **3461** | 3608 → **3518** | 4255 → **4349** |
| Cu Lì bộ Lâu Đài · chạy | **1962** → **3561** | **2253** → **3558** | 4189 → **4301** |
| Cái Bống gốc · đứng | 3521 → **3521** | 3583 → **3583** | 4295 → **4295** |
| Cái Bống gốc · chạy | 3517 → **3534** | 3536 → **3536** | 4251 → **4260** |
| Cái Bống bộ Hang Biển* · đứng / chạy | 3517 / 3514 → y hệt | 3574 / 3536 → y hệt | 4310 / 4254 → y hệt |

\* Cái Bống: thân bộ đang tạm tắt (404b935), mặc bộ vẫn dùng thân gốc.

Cung vệt kiếm (độ) — đường vung thật → vệt trước → **vệt sau** (`so/cung-vet-kiem.txt`):

| Thân | Nhát 1 | Nhát 2 | Nhát 3 |
|---|---|---|---|
| Cu Tèo gốc | 180 → 115 → **115** | 148 → 148 → **148** | 232 → 130 → **130** |
| Cu Tèo bộ Hang Biển | 180 → **0 (0 mẫu)** → **115** | 148 → **16** → **148** | 232 → **0 (0 mẫu)** → **145** |
| Cu Lì bộ Lâu Đài | 180 → **0** → **115** | 148 → **16** → **148** | 227 → **0** → **142** |
| Cu Tí bộ Rừng Già | 186 → 97 → 97 | 120 → **13** → **120** | 237 → 33 → 33 |

Trận thật (vòng lặp thật, quái thật, Cu Tèo bộ Hang Biển cầm kiếm, 24 nhát): 0 nhát không sinh vệt cả trước và sau, nhưng điểm ảnh vệt
mỗi lần vẽ ở nhát 1 **162 → 267**, nhát 2 238 → 280, nhát 3 250 → 273.

## Kiểm từng nghi phạm

| # | Nghi phạm | Kết luận (số đo) |
|---|---|---|
| 1 | Cung vệt bỏ đoạn kiếm vẽ sau thân (`G.KIEM_KHOP`, 8cac41b, `G.KIEM_SAU`) | **Đúng — nguyên nhân.** Luật `front === false` (8cac41b) xoá trắng cung ở thân bộ (bảng trên). Luật hướng `G.KIEM_KHOP` chỉ bỏ 7/17 và 4/14 mẫu, như nhau ở mọi thân → giữ làm luật né mặt. `G.KIEM_SAU` (c9ab627) không đổi số mẫu: đo lại với `?kiemsau=0` ra đúng cùng số mẫu, cùng cung ở cả thân gốc và thân bộ. |
| 2 | Ảnh vệt AI chỉ sinh nhát đầu / bị xoá khi nhát sau bắt đầu / MAXE / sống ngắn hơn nhịp combo | **Không.** Mọi nhát sinh đúng 1 vệt (`hu-chem-kiem` 0,18 s; giáo `hu-dam-giao`, quét `hu-quet-giao`; búa `hu-chem-bua` + `hu-nen-dat`); vệt hết trước nhát kế (nhịp 0,30 / 0,30 / 0,46 s > 0,18 s + khựng hình) nên không đè / xoá nhau; `S.E` tối đa 6 trong trận thật (trần 72). |
| 3 | `o.vd`, vẽ sau viền bé, Độ đọc trận | **Không.** Vệt đòn được vẽ sau viền (`veVdSau`) ở mọi nhát; giấu vệt thì ảnh đổi ở mọi nhát có vệt. |
| 4 | Nối đòn / bộ đệm bấm / chạy mà chém bỏ FX | **Không.** Chạm mỗi 5 nhịp, mỗi 9 nhịp, giữ nút: mọi nhát đều qua `M.hit` → `swingFx`. Chạy mà chém chỉ hỏng ở thân bộ — cùng nguyên nhân #1 (lớp `front` lúc chạy tính theo góc lưỡi so với đĩa mặt to). |

So với 4a7fdbe (trước các phiên kiếm hôm nay): thân gốc như nhau (±3 %); 4a7fdbe chưa có hàng đòn thân bộ nên thân bộ dùng hàng chung
và có vệt đủ (3 550 / 3 560 / 4 360) — lỗi xuất hiện khi hàng đòn riêng của thân bộ được nhập (6f71aa9, 3a36ff2, 36dcd37) chồng lên luật
`front === false` của 8cac41b.

Giáo, búa, cung: điểm ảnh vệt mỗi nhát y hệt trước / sau và như 4a7fdbe (giáo đâm ~7 600, đâm 3 ~10 000, quét ~5 600; búa ~8 000;
cung mỗi phát ~850–1 100 kể cả tên bay) — cung không có `cungVk`.

## Đã sửa

`game/js/fx.js` — `cungVk` (cờ mới `G.VET_TRON`, mặc định bật; `?vettron=0` hoặc `G.VET_TRON = false` → y hệt trước):

- Không còn bỏ mẫu vì kiếm vẽ sau thân (`front === false`) — vệt là hiệu ứng, không theo lớp thân.
- Giữ luật hướng `G.KIEM_KHOP` (kiếm chĩa ra sau lưng không vào cung vệt) để vệt không vòng qua đầu / mặt — đây là phần "chỉ né vùng mặt".
- Còn dưới 3 mẫu sau luật né mặt thì dùng cả đường vung trong cửa sổ.
- Mảng mẫu dùng lại (không tạo đối tượng mới mỗi nhát).

Gói lại game (`game/dist/*`).

## Kiểm

- `?vettron=0` trên bản mới = HEAD c9ab627: 0 / 312 nhát lệch quá 3 % điểm ảnh.
- `node --check` mọi `game/js/*.js`, `cloud_save_regression.test.js` qua, `python3 game/build.py` chạy được, bản hai tệp 0 pageerror
  (do.py 64 ca × 2, tran.py, cung.py).

## GIF trước / sau (Cu Tèo bộ Hang Biển, combo liên tục)

- Kiếm đứng: `anh/hunter-bien-sword-dung-truoc-sau.gif` — nhát 1: trước vệt nhỏ đè lên người, sau vệt theo đường kiếm như thân gốc.
- Kiếm chạy: `anh/hunter-bien-sword-chay-truoc-sau.gif`
- Giáo: `anh/hunter-bien-spear-dung-truoc-sau.gif` (không đổi)
- Búa: `anh/hunter-bien-hammer-dung-truoc-sau.gif` (không đổi)
- Cung: `anh/hunter-bien-bow-dung-truoc-sau.gif` (không đổi)

## Còn lại (không sửa phiên này)

- Ảnh vệt kiếm `hu-chem-kiem` là một hình trăng khuyết cố định, sinh ở lúc chạm (45 % đòn): nửa đầu cú vung (lấy đà → giữa) chưa có vệt,
  và cả 3 nhát dùng cùng một hình (chỉ xoay theo cung). Nếu chủ dự án vẫn thấy "không hết", hướng tiếp: sinh vệt từ đầu cửa sổ vung
  hoặc vẽ thêm ảnh vệt riêng cho Chém ngược / Nhát kết.
