# Trang thử Âm Đao cấp 1–4 (trên P0-A) – 27/10/2026 theo phản hồi 6, sửa 28/10/2026 theo phản hồi 7

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-6-BO-BAN-3-VA-AM-DAO.md`, `KE-HOACH-VU-KHI.md` mục 2d, 3, 4b, 5, 7a, 8, 10,
`KE-HOACH-GAMEPLAY-V2.md` mục 3, 5, 6. **Trang con riêng** `am-dao.html`; bản P0-A gốc `index.html` **giữ nguyên** để so.
**Không sửa** `game/demo.html`, `build-demo.py`, `game/thu-bo-vo-moc/`, ảnh nguồn, rig. Không publish. Chưa ghép vào game chính.

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/am-dao.html | **Người chơi thử trên iPhone** (log + hộp đòn TẮT). Vào cấp 1. Đổi cấp: ⚙ → nút **"Âm Đao cấp N – bấm để đổi"** (1→2→3→4→1) |
| …/am-dao.html?cap=3 | Vào thẳng cấp 3 (cấp 1–4) |
| …/am-dao.html?debug=input&hitbox=1 | Log (lần bấm, giữ Chém, kỹ năng, vết, trúng) + lớp hộp đòn (đỏ = đang gây sát thương; cam đứt = vết Dư Âm đang chờ vang) |
| …/am-dao.html?cg=36 | **Chỉ là biến thể thử** (KHVK 4b): Chuông Gỗ máu 36. **Mặc định và số chính thức: 40** (PH7 chốt) – không đưa 36 vào game chính |
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/index.html | Bản **P0-A gốc** (dao placeholder) – nhịp MỚI. Thêm `?p0=0` = nhịp CŨ, **cùng dao** (dùng để so độ nhạy – mục PH7-9) |

Điều khiển: chạm **Chém** = đánh thường (luôn ra ngay). **Giữ Chém ≥ 20 tick (⅓ giây)** ở cấp 3–4 = **Dư Âm**. Phòng A hình nộm → B hai Chuông Gỗ → C quái gác (giống P0-A).

## Sửa theo phản hồi 7 (28/10/2026)

Làm theo `docs/gameplay/PHAN-HOI-7-AM-DAO-BO-P0B.md` mục 1, 2 và phần "Âm Đao" trong đoạn "Gửi Claude". Chỉ sửa `game/thu-p0a/` (`am-dao.html`, `cong-cu/`, `am-dao/`, `video-am-dao/`, ghi chú này). `index.html` (P0-A gốc), `demo.html`, `build-demo.py`, `thu-bo-vo-moc/`, `thu-phong-b/`, `docs/gameplay/` **không đổi**. P0-B chưa làm ở lượt này.

| # | Yêu cầu | Đã làm |
|---|---|---|
| 1 | Chuông Gỗ giữ 40 máu | Mặc định 40. `?cg=36` ghi rõ **chỉ là biến thể thử** (đầu `khoi-am-dao.js`, link ở trên, dòng log "ÂM ĐAO cấp N … Chuông Gỗ 40 máu (mặc định)" / "36 máu (BIẾN THỂ THỬ ?cg=36)") |
| 2 | Lưỡi dài, đọc rõ hai nhánh ở 112 px, giữ tầm 90 | Lưỡi chắn → mũi **150 → 170 px rig (15,7 → 17,8 px logic)**; bản lưỡi ×1,3 (≈ 7 px); khe giữa hai nhánh mở **≈ 1 → 2,5 px logic** và tô viền tối trong khe; thép lưỡi sáng hơn (×0,72 khoảng cách tới trắng, chắn tay giữ nguyên). **Hộp nhát 1 vẫn `[4,−97,86,48]` (mép 90), mọi hộp khác không đổi.** Âm nhận nhát 1 còn **5,5–8 px** (trước 7,6–10,2). Ảnh so: `video-am-dao/7-luoi-112px-cu-moi.png` |
| 3 | Hộp chém vang quét thấp theo hình nhát 3 – duyệt tạm | Giữ `[−13,−66,103,66]`; code, log (`CHÉM VANG (quét thấp)`) và bảng thông số ghi rõ **"cú quét thấp – duyệt tạm tới khi có clip riêng"** |
| 4 | Hồi chiêu bắt đầu khi hộp/vết xuất hiện | Lúc tung: hồi **chưa chạy**. Tick hộp chém vang bật (= tick đặt vết): `hộp chém vang BẬT → hồi chiêu BẮT ĐẦU 150 tick`. Lướt / bị đánh trước đó: `KHÔNG MẤT hồi chiêu … dùng lại được ngay` (đếm `hoanHoi`). Lướt sau khi hộp bật: hồi giữ nguyên |
| 5 | Vết chỉ phía trước Lam | Vết = phần hộp chém vang **từ tâm Lam về phía trước** (`[0,−66,90,66]`, bỏ 13 px sau lưng); log `= phần TRƯỚC Lam … (bỏ 13 px sau tâm Lam)`. Đòn chém vang **giữ cả hộp** |
| 6 | Giữ nút khi pause / ⚙ / mất focus / chuyển tab | Mọi lúc đó **huỷ lần giữ** (cả khi đã nạp / thế tụ / đang chờ tung): không tích, không tự tung khi quay lại, không mất hồi; phải nhả rồi chạm lại mới đếm lần giữ mới (`choNha`). Bắt: bước chạy khi `S.paused` (⚙, màn dừng), `blur`, `visibilitychange` (ẩn), `pagehide`, và **hai bước logic cách nhau > 250 ms thật** (Safari ngưng rAF khi ẩn tab). Log mỗi lần giữ ghi **tách**: `N tick mô phỏng (a bước logic + b bước khựng) · M ms thật` (ms thật = `performance.now()`; trong công cụ quay ghi "–" vì công cụ tự bước, không có đồng hồ thật) |
| 7 | Kiểm toàn vùng hộp + âm nhận pogo | Thêm lớp **"quét âm"**: dải sáng nối đường lưỡi + âm nhận giữa các tick (từ tick đà vung tới tick hiện tại), **cắt trong hộp**. Âm nhận cũng cắt trong hộp. Đo vùng phủ cả 7 đòn (bảng dưới) + đo âm nhận **pogo `ATK[4]`: 54,6–59,8 px, mép trên cạnh hộp 10/10 tick**. **Chưa đạt "khớp hình" toàn bộ hộp** – xem bảng và câu hỏi |
| 8 | Cấp 4: tách trang trí với vùng sát thương | VFX vết vẽ **cắt đúng hộp vết** + viền hộp sáng lúc vang. Cấp 4 khác cấp 3 ở: số [16,20], hitstop 3, rung màn hình 2,4 (cấp 3: 1,4), tiếng trầm + `thud`, lớp nổ **sáng hơn cùng cỡ**, viền vàng dày hơn. Bỏ phóng to nổ ×1,35 / ×1,2. Đo: **0 px sáng ngoài hộp** ở cả cấp 3 và cấp 4 |
| 9 | Hướng dẫn so độ nhạy | Sửa mục 4b: so **`index.html?p0=0` với `index.html` (cùng dao)** trước; sau đó mới so `index.html` với `am-dao.html` (cùng nhịp, khác hình vũ khí) |
| 10 | Trận tự do | Video sạch `7-tu-do-cap-1-2-3-4.mp4` + số ở bảng dưới |

### PH7 – KIỂM BẰNG CODE (Chromium headless, mỗi hình video = 1 bước logic)

**Giữ nút / hồi chiêu / vết** (`video-am-dao/6-debug-sua-ph7.mp4` + `-log.txt`):

| Ca | Kết quả (log) |
|---|---|
| Giữ 15 → mở ⚙ 60 bước (ngón vẫn đè) → đóng ⚙ → đè thêm 45 → nhả | `HUY:tam-dung … đã giữ 15 tick mô phỏng (12 bước logic + 3 bước khựng) · chưa nạp`; sau đó **không** nạp, **không** Dư Âm (`tung` 0) |
| Giữ 35 (thế tụ) → mất focus → đè thêm 40 → nhả | `HUY:mat-focus … đang ở THẾ TỤ`; không tung |
| Giữ 21 → nhả (xếp hàng) → chuyển tab ngay tick sau | `HUY:chuyen-tab … đang CHỜ TUNG`; không tung |
| Tung → lướt 2 tick sau (trước hộp, su 6) → giữ lại 30 | `chém vang bị huỷ (lướt) TRƯỚC khi hộp bật → KHÔNG có vết, KHÔNG MẤT hồi chiêu (hồi hiện tại 0)`; lần giữ sau **ra Dư Âm #2** ngay |
| Tung → hộp bật (`hồi chiêu BẮT ĐẦU 150`) → lướt 9 tick sau → giữ lại 30 | Hồi giữ: `nha-som … đủ ngưỡng nhưng KHÔNG nạp được; Dư Âm đang hồi 105` |
| Hình nộm sau lưng 6 px, Dư Âm | Chém vang (cả hộp) **trúng 15**; vết (chỉ phía trước) `trúng 0 mục tiêu` |
| Hình nộm sau lưng 25 px, nhát 1 → 2 | Nhát 2 (hộp từ −36) **trúng 12** – và **không có VFX ở chỗ đó** (bảng vùng phủ: mép sau nhát 2 = 0 %) |
| Chạm → hộp | Vẫn **7 tick ở cả 4 cấp**, chạm 1 tick lẫn giữ 30 tick (20 lần mỗi kiểu, `do-so.json`) |
| Ca cũ (video 1–5 quay lại với lưỡi mới) | 10 lần dùng → 10 vết; bóng không sinh vết; vết vào vỏ = 0 máu; âm nhận lệch hộp 0 tick; lỗi trang 0 ở mọi cảnh |

**Vùng hộp có VFX** (`8-vung-hop-phu-vfx.png/.json`). Mỗi tick hộp bật vẽ lại riêng phần nhìn thấy của đòn (vệt chém P0-A, thân lưỡi, quét âm, âm nhận), cộng dồn; pixel có độ đục ≥ 0,2 = có VFX. "Mép" = % vị trí (cửa sổ 8 px, dọc theo dải 8 px sát mép) có VFX – tức một mục tiêu chỉ chạm mép đó có thấy nét chém không.

| Đòn | Hộp | Phủ cả hộp | Mép trên | Mép dưới | Mép trước | Mép sau | Sáng NGOÀI hộp |
|---|---|---|---|---|---|---|---|
| nhát 1 | `[4,−97,86,48]` | 47 % | 40 % | 100 % | 82 % | 27 % | 437 px (vệt chém P0-A lố trước) |
| nhát 2 | `[−36,−100,116,48]` | 27 % | 25 % | 50 % | 100 % | **0 %** | 860 px |
| nhát 3 | `[−13,−59,99,59]` | 50 % | 48 % | 70 % | 46 % | **0 %** | 58 px |
| nảy (pogo) | `[−26,−24,64,82]` | 27 % | 33 % | 47 % | 100 % | **0 %** | 0 |
| hất | `[−9,−140,97,60]` | 64 % | 96 % | 61 % | **0 %** | 21 % | 615 px |
| trên không | `[−3,−107,95,48]` | 40 % | 64 % | 77 % | 91 % | **0 %** | 266 px |
| chém vang (quét thấp) | `[−13,−66,103,66]` | 53 % | 71 % | 63 % | 33 % | **0 %** | 132 px |
| vết cấp 3 / cấp 4 | `[0,−66,90,66]` | 100 % / 100 % | 100 % | 100 % | 100 % | – | **0 / 0 px** |

Kết luận trung thực: **chưa khớp toàn bộ hộp**. Âm nhận (một tia) chạm đúng mép ở 7/7 đòn, vết khớp 100 %, nhưng đánh thường còn những dải hộp gây sát thương mà không có nét chém: **phía sau lưng** (nhát 2: 36 px, nhát 3 / chém vang: 13 px, nảy: 26 px), **mép trước của chém hất**, phần lớn **bề ngang hộp nảy**. Ngược lại vệt chém của P0-A ở nhát 1/2/hất **lố ra ngoài hộp** (trông xa hơn tầm thật). Không sửa hộp ở lượt này vì sẽ đổi tầm đánh cùng lúc với đổi lưỡi (PH7 mục 2) và đổi luật P0-A – xem câu hỏi PH7 bên dưới.

**Trận tự do** (`7-tu-do-cap-1-2-3-4.mp4`, log `-log-cap1..4.txt`, `ket-qua.json → tudo`). Trạng thái đầu giống nhau ở 4 cấp (quái ở chỗ gốc, Lam đầu Sân hai chuông, hồi 0) – đặt **một lần** trước trận; **trong trận không dời quái, không đặt lại hồi chiêu, không can thiệp**. Bot chung mọi cấp: đi tới quái gần nhất, trong tầm thì chạm Chém mỗi 14 tick; nếu Dư Âm có và hết hồi thì giữ Chém 24 tick, nhả, 30 tick sau mới giữ lại được; không né. Đối thủ: 2 Chuông Gỗ (40 máu) + quái gác (vỏ), đi liền một mạch.

| | Cấp 1 | Cấp 2 | Cấp 3 | Cấp 4 |
|---|---|---|---|---|
| Chuông Gỗ #1 chết (tick) | 149 | 149 | **144** | **144** |
| Chuông Gỗ #2 chết | **372** | **372** | 403 | 403 |
| Quái gác chết = xong trận | **761** | **761** | 820 | 804 |
| Lam bị đánh trúng | 2 | 2 | 2 | 2 |
| Bot bắt đầu giữ Dư Âm / tung được / vết trúng | – | – | 6 / 3 / 3 | 6 / 3 / 3 |

Đọc số (một kịch bản bot, chưa phải cảm nhận): trong trận tự do **cấp 3–4 chỉ nhanh hơn ở Chuông Gỗ đầu (5 tick) rồi CHẬM hơn cấp 1** (cả trận +59 / +43 tick). Lý do đọc từ log: 6 lần bot giữ chỉ ra 3 Dư Âm (2 lần bị Chuông Gỗ đập trúng khi đang giữ → `huy:bi-danh`), hồi 150 tick nên mỗi con chỉ ăn ≈ 1 lần, thời gian giữ 24 tick ăn vào nhịp chém thường, và vết thứ 3 vào quái gác còn vỏ = 0 máu. Cấp 4 nhanh hơn cấp 3 ở quái gác (16 tick) nhờ vết mạnh hơn. **Cấp 2 = cấp 1** về số tick (12 × 4 = 10 × 4 nhát với 40 máu). Con số 161 / 105 / 71 ở mục 4c là kịch bản **dựng cảnh** (dời quái, đặt lại hồi) – chỉ chứng minh chức năng, không phải mức mạnh lên trong trận thật. Bot không né và không chọn thời điểm như người – người chơi giỏi có thể khác; cần thử thật.

### PH7 – CẦN THỬ IPHONE (chưa làm – không đánh dấu đạt)

| Câu | Cần gì |
|---|---|
| Độ nhạy (PH7-9) | Bước 1: `index.html?p0=0` vs `index.html` (**cùng dao**), 3 người, đổi thứ tự. Bước 2: `index.html` vs `am-dao.html` cấp 1 (cùng nhịp, khác vũ khí) – chỉ hỏi về hình vũ khí / âm nhận, không kết luận nhịp từ bước này |
| Hai nhánh âm thoa | Ở cỡ màn iPhone ngang, người thử không được gợi ý có nhận ra lưỡi **hai nhánh** không; âm nhận nhát 1 (5,5–8 px) còn thấy không |
| Giữ nút trên Safari | Giữ Chém rồi: vuốt về màn chính / chuyển tab / mở ⚙ / khoá máy → quay lại: không được tự tung. Mở `?debug=input` đọc `HUY:…` và **ms thật**. Đo một lần chạm thường dài bao nhiêu **ms thật** (log `nha-som … M ms thật`) – công cụ quay không đo được |
| Đếm xuyên hitstop | Khi đang chém trúng, giữ 20 tick (≈ 333 ms thật) có thấy "đúng lúc" không, hay cần đếm thuần ms |
| Vùng hộp | Người thử có thấy "bị/được trúng mà không thấy nét chém" ở sau lưng (nhát 2, nảy) hay mép trước chém hất không |
| Cấp 4 | Có thấy vết cấp 4 mạnh hơn cấp 3 mà **không** thấy nó đánh xa hơn không |

### PH7 – câu hỏi cần chủ dự án quyết

1. **Dải hộp không có nét chém** (bảng vùng phủ): (a) thu hộp đòn của Âm Đao cho khớp hình – ví dụ nhát 2 mép sau −36 → ≈ −10, hất mép trước 88 → ≈ 80, nảy rộng 64 → ≈ 30 (đổi tầm đánh, nên làm **sau** buổi thử iPhone lưỡi mới); hay (b) giữ hộp và thêm VFX sóng âm phủ các dải đó; hay (c) giữ như hiện tại cho buổi thử đầu?
2. **Vệt chém P0-A lố ngoài hộp** (nhát 1: 437 px, nhát 2: 860, hất: 615): cắt vệt theo hộp trên trang Âm Đao (giống vết), hay giữ vệt gốc?
3. **Dư Âm trong trận tự do** chưa làm trận nhanh hơn (bảng trên). Giữ số hiện tại tới khi có kết quả iPhone, hay xem lại hồi 150 / thời gian giữ 20?

## 0. Bước 0 – kiểm trước khi làm (kết quả)

Chạy trong Chromium headless, đọc trạng thái từng bước. **Không có gì hỏng → không phải sửa P0-A / Bọ.**

| Kiểm | Cách | Kết quả |
|---|---|---|
| Quái thường không tự hồi vỏ | P0-A: đặt quái gác Thế 10, chém 1 nhát → vỡ; chờ 900 tick không đánh | Thế giữ **0**, trạng thái `matVo` (mất vỏ) suốt; nhát sau **−10 máu** (30 → 20) |
| Bọ không tự hồi mai | Trang Bọ: chém mai 1 lần (mai 4 → 3), rồi để yên 700 tick | Mai vẫn **3** (`maiHoi: false`) |
| Bọ mai vỡ vẫn đánh được sau khi dậy | Trang Bọ, bot đánh mai: vỡ ở bước 367, choáng, **dậy bước 546 – mai vẫn 0** → `bao` 596 → `huc` 626; lần 2 đặt Lam đứng trước | Húc **trúng Lam** (Lam mất máu bước 629). Không sửa gì ở `thu-bo-vo-moc/` |
| Startup 7 tick còn tư thế lấy đà, hình khớp hộp | Bảng từng tick nhát 1 (P0-A) | tick 1–2 `chuanbi`, 3–5 `giuong`, 6 `vung`, **7 `trung` + hộp bật + vệt khung 0** cùng tick; hộp 7–14. Trang Âm Đao giữ **đúng bảng này** (đo lại: `video-am-dao/5-bang-tick-am-nhan.json`) |
| Buffer, mã đòn replay, Cộng hưởng | Chạy lại các ca của P0-A **trên trang Âm Đao cấp 1** (video `4-debug…`) | Hộp bóng 8 tick → trúng **1** lần; cùng tick Thế 10 → **+10**; Lam trước 5 tick → bóng **2 + 10 = 12**; đã mất vỏ → **22**. Mọi lần bấm có kết cục (thiếu **0** ở mọi cảnh); chạm → hộp **7 tick** |

## 1. Đã làm gì

- **Trang `am-dao.html`** sinh bằng `cong-cu/tao-am-dao.py` từ `index.html` (P0-A) + khối `cong-cu/khoi-am-dao.js`. Dao placeholder được thay bằng Âm Đao **qua bảng `VK` / `CAP_VK` / `DON`** sẵn có (`VK.amDao`, `CAP_VK.amDao`, `PL_CS` = `pl.cs`). Luôn dùng nhịp P0-A mới (su 7/7/9, hàng chờ 1 nhát).
- **Ảnh** (`cong-cu/tao-asset-am-dao.py` → `am-dao/`):
  - `am-dao-cap1.png`: kiếm âm thoa **cắt từ `vu-khi-mau.png`**, nền trắng tách sạch (lấp từ mép, khe giữa hai nhánh trong suốt, khử viền trắng).
  - Lam rig-v4 **dựng lại sheet hành động + sheet chạy** bằng đúng code của `art/modular/lam-moi/` (tư thế, bảng tick y nguyên), **chỉ thay mảnh tay trước**: lưỡi âm thoa thay dao, kẻ viền tối cho hợp nét rig. Ghi riêng vào `am-dao/`, **không ghi đè** sheet gốc (đã kiểm `git status`: `art/` không đổi).
  - `vet-du-am-2x.png`: 5 khung VFX Dư Âm từ `vet-du-am.png`, **giữ nền đen, vẽ cộng sáng** (`lighter`).
- **Âm nhận** (cấp 1): vẽ bằng code nối từ mũi lưỡi theo hướng lưỡi **tới đúng mép hộp đòn** (tia từ mũi cắt cạnh hộp), vạch đồng + chấm sáng ở mép, 2 cung sóng. **Chỉ vẽ ở các tick hộp bật**, vẽ **sau** vệt chém (không bị vệt che). Chí mạng: vàng, dày hơn. Bóng: âm nhận teal mờ theo đúng hộp bóng.
- **Giữ Chém → Dư Âm** (cấp 3+, phương án THỬ – KHVK 7a): đủ 3 trường hợp nhả + xoá + tự tung, log từng lần (mục 3).
- **Chém vang** = đòn `ATK[7]`, **cú quét thấp** (chưa có clip mới: dùng tư thế nhát 3 – KHVK mục 10). **Vết**: đặt **một vết theo mỗi lần dùng**, ngay lúc hộp chém vang bật (trúng hay hụt), chỉ phần phía trước Lam (PH7), vang sau 24 tick. Cấp 4: vết mạnh hơn (số, tiếng trầm hơn, rung hơn, sáng hơn – PH7: **không** to hơn hộp).
- **Công thức** dùng chung của P0-A (gom theo tick, chặn theo Thế đầu tick, Cộng hưởng theo mục tiêu…). Vết là `D` riêng `src 'k'`, cờ `co = {ch:false, duChan:true, hieuUng:false, kichDau:false}`.
- **Chí mạng 5 % ×1,5** gieo **một lần lúc tạo đòn** bằng bộ sinh có hạt giống (mulberry32, đặt lại khi vào phòng) – cùng chuỗi vung ở mọi cấp cho cùng chuỗi chí mạng (so công bằng). Chỉ nhân máu.
- **Chỉ số chốt lúc tạo đòn gốc**: `D.goc` chép từ `pl.cs`; vết chép số lúc **tung kỹ năng**; bóng giữ số đã ghi. Đổi cấp giữa chừng không sửa đòn / vết / bóng đã có (video 4, ca cuối).
- **HUD**: dưới máu có "Âm Đao · cấp N" + vòng hồi Dư Âm (cấp 3+). Hình nộm thêm dòng **"tổng 10 giây"**. Trên đầu Lam: vòng nạp khi giữ; khi đã nạp: ánh dọc lưỡi (không nối dài – không phải hộp đòn). Nút Chém trên màn có viền: đang giữ / đã nạp / chờ tung.
- **Nút debug đổi cấp** trong ⚙ (thay nút "Nhịp đánh" ở trang này). Không có menu nâng cấp, save, vật liệu, Vọng Chiến, tinh anh, quái mới, cấp 5–8, 3 vũ khí kia.

## 2. Thông số (sửa ở đầu `cong-cu/khoi-am-dao.js`, chạy lại `tao-am-dao.py`)

| Số | Giá trị | Ghi chú |
|---|---|---|
| Đánh thường | bộ `ATK[1..6]`, su 7/7/9 (P0-A); [máu, Thế] nhát 1, 2, hất, trên không, nảy [10,10], nhát 3 [10,30] | Không đổi nhịp theo cấp |
| Hộp nhát 1 | mép trước **95 → 90** (`[4,−97,86,48]`) | Theo KHVK 2d. Hộp đòn 2–6 giữ như cũ |
| Lưỡi âm thoa | chắn → mũi **170 px rig ≈ 17,8 px logic** (PH7; trước 15,7; dao cũ 23), bản ×1,3, khe hai nhánh 2,5 px | Tầm / hộp 90 **giữ**; âm nhận lấp phần còn lại tới mép hộp |
| Âm nhận (đo, PH7) | nhát 1: **5,5–8 px**; nhát 2: 11–12,7; nhát 3: 8,1–9,3; hất: 22–23,5 (lên); trên không: 10,3–15,7; **nảy (pogo): 54,6–59,8 (xuống)**; chém vang: 8,1–11,6 | Điểm cuối tia nằm trên cạnh hộp ở 100 % tick đo của **7/7 đòn**. Đây chỉ là MỘT tia – vùng còn lại của hộp xem mục PH7-7 (`do-so.json → am_nhan`) |
| Cấp 2 | máu đánh thường ×1,2 (10 → **12**) | Thế không đổi |
| Dư Âm (cấp 3) | giữ **20 tick**; chém vang su 6 / ac 8 / re 14, hitstop 5, **[15,20]**, hộp `[−13,−66,103,66]` (mép trước 90); hồi **150 tick tính từ tick hộp bật** (PH7); tụ tối đa 60 tick rồi tự tung | Hộp = **cú quét thấp** theo hình nhát 3, **duyệt tạm** (PH7) tới khi có clip chém vang riêng |
| Vết | vang sau **24 tick**, hộp = **phần phía trước tâm Lam** của hộp chém vang (`[0,−66,90,66]`, PH7), bật **4 tick**, mỗi mục tiêu trúng 1 lần; cấp 3 **[10,10]** hitstop 2; cấp 4 **[16,20]** hitstop 3 | Không chí mạng, không Cộng hưởng, không sinh vết, tối đa 2 vết trên màn. VFX cắt đúng hộp (cấp 4 sáng/rung/tiếng mạnh hơn, **không to hơn**) |
| Chí mạng | 5 %, ×1,5 máu, gieo lúc tạo đòn | Đo 400 nhát: **24 chí mạng (6 %)**, chạy lại cùng hạt → **cùng chuỗi** |

## 3. Luật đã làm (log `?debug=input`)

| Lúc nhả nút | Kết quả | Log |
|---|---|---|
| Trước ngưỡng 20 tick | Chỉ là nhát thường (nhát 1 đã ra ngay lúc chạm) | `giu #n: nha-som (giữ N tick …)` – kèm lý do "cấp 1/2 chưa có Dư Âm" / "Dư Âm đang hồi" |
| Sau ngưỡng, đòn thường **chưa xong** | Kỹ năng vào **hàng chờ 1 chỗ** (thay nhát combo đang chờ nếu có), tung ở tick đầu tiên đòn hết `re`; hạn = hết đòn + 6 | `DA NAP` → `xep-hang (… tung sau tối đa N tick)` → `TUNG (xep-hang …, chờ N tick)` |
| Sau ngưỡng, đòn đã xong (thế tụ) | Tung **ngay tick nhả** | `vào thế tụ` → `TUNG (nhả trong thế tụ → tung ngay)` |
| Giữ quá 60 tick ở thế tụ | Tự tung (không kẹt) | `TUNG (tu-tung …)` |
| Lướt / bị đánh / đổi phòng / rơi khỏi đất / chạm Chém mới khi đang chờ | **Xoá**, **không mất hồi chiêu** (chưa tung) | `xoa:luot` / `xoa:bi-danh` / `xoa:bi-thay (chạm mới)` … |

- Nhả nút trước khi đòn thường kết thúc **không mất lệnh và không tung muộn**: xa nhất là hết đòn đang chạy (đo: chờ 3–4 tick), hạn +6 tick rồi bỏ có log.
- Giữ đếm **xuyên hitstop** (bước khựng khi trúng vẫn cộng), để "giữ 20" không dài ra khi đang chém trúng. **Không** đếm khi tạm dừng / ⚙ / mất focus / chuyển tab – các lúc đó huỷ lần giữ (PH7-6). Bấm dồn không bao giờ ra kỹ năng.
- Thế tụ: Lam đứng yên (nhảy được – rời đất thì huỷ; lướt huỷ).
- Lướt / bị đánh huỷ chém vang **trước** khi hộp bật → không có vết, **không mất hồi chiêu** (hồi chỉ bắt đầu khi hộp bật – PH7-4). Hộp đã bật rồi mới lướt → hồi giữ nguyên.
- Tạm dừng / mở ⚙ / mất focus / chuyển tab / hai bước cách nhau > 250 ms → `HUY:…` (cả khi đã nạp, đang thế tụ, đang chờ tung); quay lại vẫn đè nút cũng **không** tự tung, phải nhả rồi chạm lại (PH7-6).

## 4. Ba câu prototype

### 4a. KIỂM BẰNG CODE (Chromium headless, bàn phím giả lập, mỗi hình video = 1 bước logic)

| Câu | Số đo | Ở đâu |
|---|---|---|
| 1. Đánh thường nhạy hơn? | Chạm → hộp **7 tick ở cả 4 cấp**, cả khi chạm 1 tick lẫn khi **giữ 30 tick** (20 lần mỗi kiểu) – tính năng giữ **không làm chậm** nhát đầu. Mọi lần bấm có đúng 1 kết cục (thiếu 0). P0-A cũ (su 11): 11 tick | `do-so.json` `cham_hop_cap1..4`, log video 2 |
| 2. Dư Âm dễ chủ động dùng? (phần đo được) | Đủ 3 trường hợp nhả + xoá + tự tung đều ra đúng log (video 2). Bot "bẫy" dùng được: chém **hụt**, lướt lùi, Chuông Gỗ đi vào vết → vết trúng (cấp 3: 10, cấp 4: 16) | video 1 (phần 4), video 2 |
| 3. Mở / nâng skill khác biệt? (phần đo được, cùng bot cùng phòng) | Bảng 4c | video 1, `ket-qua.json → sach` |
| Vết theo lần dùng | 10 lần dùng (4 trúng 1 con, **1 trúng 2 con**, 5 hụt) → **đúng 10 vết**; 10 nhát thường sau đó → **0 vết** | video 3 |
| Chống proc | Bóng phát lại chém vang: gây [3,10] (= [15,20]×0,25/0,5), **không sinh vết**. Vết vang **cùng tick** bóng chém: gom 2 lần trúng, **không Cộng hưởng**. Vết vào quái gác còn vỏ: **máu 0** (không thành 1), Thế −20 | video 4 |
| Hình khớp hộp | Debug chậm ¼: âm nhận chỉ hiện ở tick hộp bật, **lệch 0 tick**; điểm cuối tia âm nhận trên cạnh hộp ở 100 % tick. **PH7: đây chỉ là một tia, KHÔNG chứng minh cả hộp khớp hình** – xem bảng vùng phủ mục PH7 | video 5, `5-bang-tick-am-nhan.json`, `8-vung-hop-phu-vfx.json` |
| Lỗi trang | 0 ở mọi cảnh | `ket-qua.json` |

### 4b. CẦN THỬ IPHONE (chưa làm – KHÔNG đánh dấu đạt thay người chơi)

| Câu | Cần gì |
|---|---|
| 1. Nhạy hơn? | **PH7 – sửa cách so** (xem mục PH7-9): bước 1 so **`index.html?p0=0` (nhịp cũ) với `index.html` (nhịp mới) – CÙNG dao placeholder**; bước 2 mới so `index.html` với `am-dao.html` cấp 1 (cùng nhịp mới, chỉ khác hình vũ khí). 3 người, đổi thứ tự; ≥ 2 thấy nhịp mới nhạy hơn, không ai thấy ra đòn ngoài ý muốn. Độ trễ cảm ứng Safari chưa đo |
| 2. Dư Âm dễ dùng trên cảm ứng? | Bật `?debug=input` **sau** buổi thử để đọc dòng thống kê "giữ / nhả sớm / nạp / xếp hàng / tung ngay / xoá"; đạt khi ra nhầm < 3 % số lần giữ, muốn mà không ra < 10 %, người thử tự đặt bẫy được ≥ 1 lần sau 5 phút. **Chưa biết** một lần chạm thường trên iPhone dài bao nhiêu tick (giả định < 12) |
| 3. Khác biệt nhìn thấy / cảm thấy? | Người thử **không xem số** nói được cấp 3 khác cấp 1 ở đâu, cấp 4 khác cấp 3 ở đâu. Cấp 2 được phép khó nhận ra – ghi lại, không tính trượt |
| Âm nhận | Trên màn iPhone thật âm nhận nhát 1 nay **5,5–8 px** (lưỡi dài ra) có **còn đủ thấy** không; tầm 90 có "thấy trúng mới trúng" không |
| Kiếm âm thoa | Lưỡi 17,8 px – trên màn iPhone có đọc ra **hai nhánh** không; có bị "dao găm" không; nét vẽ tranh cạnh nét rig dày có lệch không |

### 4c. Cùng phòng, cùng đối thủ, cùng bot (video 1, số đo – không phải cảm nhận). **Kịch bản dựng cảnh: CÓ dời quái + đặt lại hồi chiêu** – chỉ kiểm chức năng; trận tự do xem mục PH7-10

| Cảnh | Cấp 1 | Cấp 2 | Cấp 3 | Cấp 4 |
|---|---|---|---|---|
| Hình nộm: combo + giữ Chém 30 + combo (tổng máu) | 70 | **84** | **109** | **115** |
| Chuông Gỗ [40]: tick tới khi chết | 161 | 161 (**không đổi**, vẫn 4 nhát) | **105** | **71** |
| Quái gác [30, vỏ 60]: tick tới khi chết | 201 | 201 (**không đổi**) | **171** | **155** |
| Bẫy (chém hụt, địch đi vào) | không có gì | không có gì | vết trúng **10** | vết trúng **16** |

(Đo lại 28/10 sau khi sửa PH7: số không đổi.) Kết luận trung thực (từ số đo của KỊCH BẢN DỰNG, chưa phải cảm nhận): **cấp 3** đổi hẳn cách đánh (có thêm hành động, Chuông Gỗ chết nhanh hơn ~⅓); **cấp 4** thấy ở số, tiếng, rung và độ sáng vết (Chuông Gỗ còn ~44 % thời gian so với cấp 1). **Cấp 2 với quái thường không đổi số nhát giết** (đúng như bảng 4b kế hoạch) – chỉ thấy số trúng 12 thay 10 và thanh máu tụt nhanh hơn. Biến thể `?cg=36` chỉ để thử; mặc định giữ 40 (PH7).

## 5. Video (`video-am-dao/`, 60 hình/s, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-cap-1-2-3-4.mp4` | **VIDEO SẠCH** (không log, không hộp đòn), 4 ô cấp 1 | 2 / 3 | 4 chạy cùng lúc, cùng bot: hình nộm → Chuông Gỗ → quái gác → **bẫy Dư Âm** (chém hụt, lướt lùi, Chuông Gỗ đi vào vết). Log từng ô: `-log-cap1..4.txt` |
| `2-debug-giu-nha.mp4` | Giữ / nhả ở nhiều thời điểm: chạm 1 tick, giữ 15, 21, 22 (xếp hàng), 40 (tụ → tung ngay), 100 (tự tung), lướt huỷ, đang hồi, chạm mới thắng, bị đánh huỷ, cấp 1/2 không có, cấp 4 |
| `3-debug-vet-du-am.mp4` | 10 lần dùng → 10 vết (1 lần trúng 2 con), rồi 10 nhát thường → 0 vết |
| `4-debug-chong-proc-cong-huong.mp4` | Bóng phát lại chém vang không sinh vết; vết vang cùng tick bóng → không Cộng hưởng; vết vào vỏ = 0 máu; 4 ca Cộng hưởng của P0-A chạy lại ở Âm Đao cấp 1; đổi cấp khi bóng còn (bóng 2, Lam 12, thêm 12 = 26) |
| `5-debug-cham-am-nhan-hop-don.mp4` | Debug chậm ¼: combo 1-2-3 + Dư Âm + vết vang; dòng dưới ghi tick · hộp · mép âm nhận · vết |
| `6-debug-sua-ph7.mp4` (+ `-log.txt`) | PH7: mở ⚙ khi đang giữ, mất focus khi thế tụ, chuyển tab khi chờ tung; lướt trước / sau hộp chém vang (hồi chiêu); hình nộm sau lưng 6 px (chém vang trúng, vết không) và 25 px (nhát 2 trúng) |
| `7-tu-do-cap-1-2-3-4.mp4` (+ log 4 cấp) | **VIDEO SẠCH** PH7-10: trận tự do 2 Chuông Gỗ + quái gác, không dời quái, không đặt lại hồi chiêu |
| `7-luoi-112px-cu-moi.png` | Lưỡi cũ / mới ở cỡ game (Lam ≈ 112 px) + phóng ×8 |
| `8-vung-hop-phu-vfx.png` / `.json` | PH7-7/8: bản đồ phần hộp có VFX của 7 đòn + vết cấp 3/4 |
| `do-so.json`, `ket-qua.json`, `5-bang-tick-am-nhan.json` | Số đo ở mục 4 |

Quay lại: `python3 -B game/thu-p0a/cong-cu/quay-am-dao.py [sach giu vet proc cham do ph7 vung tudo]` (video 1–5 đã quay lại 28/10 với lưỡi mới); ảnh lưỡi: `cong-cu/so-luoi-112.py`. Dựng lại: `tao-asset-am-dao.py` (≈ 80 s) → `tao-am-dao.py`. Chỉ là quay + ghi số, không phải bộ kiểm thử tự động.

## 6. Câu hỏi PH6 – ĐÃ CHỐT ở phản hồi 7 (giữ để tra; quyết định ở mục PH7)

1. **Cấp 2** không đổi số nhát giết Chuông Gỗ / quái gác (12 × 3 = 36 < 40). Giữ như kế hoạch ("cấp nền"), hay bật biến thể **Chuông Gỗ 36** (`?cg=36`: cấp 2 giết trong 1 combo) cho buổi thử?
2. **Lưỡi âm thoa ngắn hơn dao cũ** (15,7 so với 23 px) để phần âm nhận lấp tới mép hộp 90. Nhát 1 âm nhận chỉ 8–10 px. Chấp nhận, hay kéo dài lưỡi và **dời mép hộp ra ~95–100** (tầm lớn hơn 90)?
3. **Hộp chém vang** đổi thành `[−13,−66,103,66]` (thấp, theo hình nhát 3) thay `[0,−100,96,56]` của kế hoạch – vì chưa có clip chém vang riêng. Đồng ý tạm thời tới khi có clip?
4. **Lướt huỷ chém vang trước khi hộp bật**: không có vết nhưng **vẫn mất hồi chiêu** (đã tung). Giữ, hay hoàn hồi chiêu khi huỷ trước hộp?
5. Vết đặt **đúng hộp chém vang**, nên một phần vết nằm chỗ Lam đứng (hộp bắt đầu sau lưng 13 px). Giữ, hay chỉ lấy phần trước mặt?

## 7. Chưa làm / cần biết

- Chưa thử trên iPhone (mục 4b). Mọi số là Chromium headless.
- Chưa có clip tụ / chém vang riêng (dùng khung nhát 1 giữ yên + tư thế nhát 3, đúng KHVK mục 10). Âm thanh là tiếng tổng hợp có sẵn (`bell`), chưa có âm "vang" riêng; video không có tiếng.
- Đòn nảy (`ATK[4]`) **đã đo** âm nhận (PH7): 54,6–59,8 px chĩa xuống, mép trên cạnh dưới hộp 10/10 tick. Kỹ năng chỉ dùng trên đất (KHVK 2a).
- Công cụ quay có dời vị trí quái để dựng cảnh (dời Chuông Gỗ cho cảnh bẫy và cảnh đánh; quái gác cạnh hình nộm cho ca "trúng 2 con"; đặt lại hồi chiêu giữa các lần thử) – ghi trong log mỗi cảnh, không phải luật game.
