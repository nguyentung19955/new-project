# GIẬT KHI RA SKILL — báo cáo đo + sửa (06/11)

Người dùng (iPhone): "Check lại khi ra skill có nhanh quá dẫn đến giật cục không".

## Cách đo
- `tools/thap-do-giat.js` — Playwright **Chromium** hồ sơ iPhone 13 (390×844, DPR 3, cảm ứng), ép DPR 3. Máy đo **không có WebKit** (chỉ có Chromium cài sẵn, quy định không cài thêm Playwright) → không đo được Safari thật.
- Máy đo vẽ canvas bằng CPU (không có GPU): khoảng khung bị raster chiếm (bàn đầy 7★ chỉ 15–20 khung/giây cả khi không có skill). Vì vậy số chính là **JS của khung game** (`REN._viec`), đã trừ các lệnh canvas > 2 ms (đó là máy đo raster bản ghi lệnh — trên iPhone GPU làm). CDP trace xác nhận: task dài 150–180 ms ở máy đo là `Commit → DoUpdateLayers` (raster), không phải code game.
- Mỗi khoảnh khắc = khung kích hoạt + 40 khung sau. Ghi theo khung: ảnh chép/giải mã lần đầu, thu nhỏ ảnh (coDai/co/mip/khung SIG), ảnh tải lười giữa trận, mọi hàm âm thanh, hiệu ứng sân mới, khoảnh khắc đặc biệt, hạt, DOM đổi, GC, số lệnh vẽ + diện tích phủ.
- Nhóm: 8 ụ đỏ chủ động (lần 1 = lần đầu dùng, lần 2), ụ vàng (Hydra 7★, Nine-Tail, Star Cannon, Werewolf, Wall, Marionette), ghép (Orbital, Pandora, Twin Maker, Cannon), 12 trùm (ra + tung chiêu), 3 chỉ huy, nhiều skill cùng 1 khung (wave 30 bàn đầy 7★; CO-OP wave 40 2 bàn).

## Kỹ năng nào giật, vì sao (trước khi sửa)
| Thủ phạm | Khoảnh khắc | JS khung xấu | Lý do (dễ hiểu) |
|---|---|---:|---|
| Freezer tung chiêu | chieu:freezer | 34,6 ms | lần đầu phải thu nhỏ 3 dải hình chiêu (vòng sương 21 ms + sóng sương 10 ms) + dải đi ngang của trùm, dồn 1 khung |
| Trùm ra / tung chiêu (mọi trùm) | trum:hive 25,6 · chieu:janus 30,6 · chieu:hive 28,9 · chieu:leech 25,5 · chieu:jammer 25,1 | 13–31 ms | lần đầu trùm xuất hiện / quay mặt về bàn: thu nhỏ dải 8 khung trùm (5–17 ms), dải hướng nghiêng, dải ĐÁNH 16 khung (Hive 17–20 ms), drone, bản xám đế khi hoá đá (Janus) |
| Nhiều skill cùng 1 khung | CO-OP 47,2 · wave 30 30,8 | 30–47 ms | (1) **trần dải nổ / chữ nổi nằm nhầm trong chú thích** (`fx.js` `MAX_CHU`, `MAX_ANIM` = không giới hạn) → hàng trăm dải nổ + số; (2) mỗi số sát thương mới dựng 1 canvas + vẽ chữ viền (máy đo 50–150 ms khi hàng chục số mới); (3) 6–12 khoảnh khắc đặc biệt bắt đầu cùng khung |
| Ảnh tải lười | Marionette, Orbital, Dahlia, Eve, Black Hole | 9–15 ms | hào quang buff `fxb_*`, `fx_dien`, `fx_laser_trung` chỉ tải khi cần → giữa trận tải + giải mã đồng bộ ở lần vẽ đầu (iPhone nặng hơn Chromium) + thu nhỏ |
| Leviathan lần đầu | leviathan#1 | 14 (có lần 29) ms | chép ảnh dải khoảnh khắc đặc biệt `sig_m07_jaw` sang canvas 8,6 ms ngay khung ra chiêu |
| Patch Titan (quá nhanh) | dải `fx_trum_patcher` | — | 16 khung chạy trong 0,26 s (16 ms/khung) → nhìn như **nháy** |

| Âm thanh lúc nhiều skill cùng lúc | mọi skill 1 khung | ~6 ms | mỗi tiếng tổng hợp WebAudio chỉ 0,2–1,2 ms (đã có giới hạn giọng `LIM` cho tiếng giống nhau), nhưng 15 tiếng khác nhau dồn 1 khung ≈ 6 ms |

Không phải thủ phạm: DOM băng trùm (style ≤ 0,7 ms, layout ≤ 0,8 ms/khung — đo bằng CDP trace), GC (scavenge 1–1,5 ms).

## Đã sửa (không đổi luật chơi / sát thương / thời điểm)
1. **`js/nongskill.js` (mới)** — ngân sách dựng ảnh mỗi khung: đã tốn > 4 ms thu nhỏ trong khung → vẽ tạm từ ảnh gốc/cỡ đã có, việc dựng xếp vào hàng nóng. Hàng nóng chạy theo thời gian (≤ 3 ms/khung) thay vì 1 việc/khung.
2. Dải khung (coDai) giữa trận dựng **từng khung một** (~1 ms/việc), trong lúc chờ vẽ từ dải gốc; chớp trắng chờ dải xong.
3. **Làm nóng trùm trước 1 wave**: dải đi/ngang/sau/trái, dải đánh 16 khung, chớp trắng, dải 4 khung tung chiêu, lõi Twin Core, drone Hive, hình chiêu Freezer (vòng/sóng/khối băng), bản xám đế (Janus), dải chiêu `fx_trum_*`.
4. Ảnh tình huống (`fxb_*`, `fx_dien`, `fx_laser_trung`, `hu_*`, `pandora_dia`…) tải + giải mã nền 3 s sau khi trận chạy (1 luồng, nhường khi cuộn); ảnh tải lười chỉ dùng khi `decode()` xong; chép ảnh sang canvas tính vào ngân sách.
5. Khoảnh khắc đặc biệt > 3 cái cùng khung → cái thứ 4+ lùi 60 ms mỗi cái (≤ 0,3 s) — chỉ là hình.
6. `fx.js`: bật lại trần `MAX_CHU 48` / `MAX_ANIM 90` (đầy thì bỏ dải nổ NHỎ cũ nhất, giữ nổ lớn của chiêu).
7. `render.js`: số sát thương ghép từ ảnh từng chữ số dựng sẵn (viền/ruột, vẽ 2 lượt như strokeText+fillText) — hết dựng canvas + vẽ chữ cho mỗi con số.
8. Ảnh tô màu theo ụ (`FXU.mau`) tính vào ngân sách; chữ số sát thương 0–9 dựng sẵn đầu trận; ảnh giải mã xong giữa trận được chép sang canvas ngay trong hàng nóng (không đợi lúc ra chiêu).
9. Âm thanh: mỗi khung chỉ dựng tiếng tới 2,5 ms, phần dư phát khung sau (trễ vài chục ms, quá 0,25 s thì bỏ); tiếng giống nhau vẫn theo giới hạn `LIM`.
10. **"Quá nhanh"**: dải chiêu trùm 16 khung (`fx_trum_*`) tối thiểu 0,6 s (~27 khung/giây). Đổi: **Patch Titan** (0,26 → 0,6 s); Jammer/Prism/Leech (0,45 → 0,6 s). Các dải nổ 6 khung (`no_phao` 43 ms/khung, `bang_vo` 30 ms/khung) và khoảnh khắc đặc biệt (≤ 1,2 s) đọc kịp — giữ nguyên.

## Trước / sau (JS khung xấu nhất quanh mỗi khoảnh khắc, ms — máy đo; iPhone 13 ước ~½)
Bảng đo đầy đủ chạy với bước 1–8 (trước khi rebase lên bản chống nóng + tải 1 lần). Sau rebase thêm bước 8–9; kiểm `thap-kt-giat.js` trên bản cuối: Black Hole lần đầu 14,5–15 ms, Leviathan 12,7–13,9 ms, Freezer chiêu 5 ms, mọi skill cùng 1 khung (bàn 7★) 24,7–26,9 ms (trước 30,8–47 ms).

Tệ nhất: **47,2 → 33,2 ms**; khoảnh khắc > 16 ms: **21 → 9**; > 24 ms: **9 → 3** (còn lại đều là "mọi ụ 7★ trên 2 bàn kích hoạt cùng 1 khung" và Black Hole lần đầu ở bàn 7★ dày đặc — dao động theo raster của máy đo). Thu nhỏ ảnh trong khung xấu: tới 21 ms → ≤ 4 ms. Không lỗi trang.

| nhóm | khoảnh khắc | TRƯỚC | SAU | thu nhỏ ảnh TRƯỚC | SAU |
|---|---|---:|---:|---:|---:|
|  do1  |  blackhole#1  |  19  |  24.1  |  4.8  |  4  |
|  do1  |  overlord#1  |  11.2  |  9.2  |  0  |  0  |
|  do1  |  leviathan#1  |  14.4  |  13.7  |  1.3  |  1.2  |
|  do1  |  ronglua#1  |  8.8  |  9.8  |  0  |  0  |
|  do1  |  blackhole#2  |  6  |  7  |  0  |  0  |
|  do1  |  overlord#2  |  9.7  |  9.2  |  0  |  0  |
|  do1  |  leviathan#2  |  8.9  |  5.8  |  0  |  0  |
|  do1  |  ronglua#2  |  7.6  |  9.2  |  0  |  0  |
|  do2  |  chuato#1  |  16.9  |  17.5  |  1.6  |  0  |
|  do2  |  ngaithoigian#1  |  19  |  16.4  |  1.1  |  0  |
|  do2  |  khoisinh#1  |  9  |  7.6  |  0  |  0  |
|  do2  |  lophanung#1  |  7.6  |  9.6  |  0  |  0  |
|  do2  |  chuato#2  |  10.8  |  7  |  0  |  0  |
|  do2  |  ngaithoigian#2  |  8.2  |  11.4  |  0  |  0  |
|  do2  |  khoisinh#2  |  10.2  |  7.7  |  0  |  0  |
|  do2  |  lophanung#2  |  11.8  |  10.5  |  0  |  0  |
|  vang1  |  hydra#1  |  10.6  |  11.6  |  2.6  |  0  |
|  vang1  |  cuuvi#1  |  9.6  |  8.8  |  0  |  0  |
|  vang1  |  ngoisao#1  |  7.5  |  7.7  |  0  |  0  |
|  vang1  |  soi#1  |  7  |  5.9  |  0  |  0  |
|  vang1  |  wallgen#1  |  7.5  |  8  |  0  |  0  |
|  vang1  |  hydra#2  |  9.9  |  8.5  |  0  |  0  |
|  vang1  |  cuuvi#2  |  15.3  |  8.4  |  0  |  0  |
|  vang1  |  ngoisao#2  |  8.5  |  7.5  |  0  |  0  |
|  vang1  |  soi#2  |  9  |  13.6  |  0  |  0  |
|  vang1  |  wallgen#2  |  8  |  7.6  |  0  |  0  |
|  vang2  |  marionette#1  |  9.1  |  11  |  3.8  |  2.9  |
|  vang2  |  marionette#2  |  6.2  |  8.6  |  0  |  0  |
|  vang2  |  ghep:orbital3#1  |  10.3  |  20.4  |  0  |  3.6  |
|  vang2  |  ghep:pandora3#1  |  15.3  |  12.3  |  5.3  |  0  |
|  vang2  |  ghep:sinhdoi3#1  |  9.1  |  7.1  |  0  |  0  |
|  vang2  |  ghep:canon2#1  |  8.9  |  9.2  |  0  |  0  |
|  vang2  |  ghep:canon5#1  |  5.6  |  7.6  |  0  |  0  |
|  vang2  |  ghep:orbital3#2  |  5.6  |  6.3  |  0  |  0  |
|  vang2  |  ghep:pandora3#2  |  7.7  |  10  |  0  |  0  |
|  vang2  |  ghep:sinhdoi3#2  |  6.2  |  4.5  |  0  |  0  |
|  vang2  |  ghep:canon2#2  |  3.9  |  4.2  |  0  |  0  |
|  vang2  |  ghep:canon5#2  |  3.1  |  8.1  |  0  |  0  |
|  trum  |  trum:freezer  |  23.7  |  15.8  |  10  |  3.8  |
|  trum  |  chieu:freezer  |  34.6  |  8.4  |  21.3  |  0  |
|  trum  |  trum:mad_crown  |  14.5  |  6.4  |  9.5  |  0  |
|  trum  |  chieu:mad_crown  |  22.1  |  13.5  |  13.1  |  0  |
|  trum  |  trum:janus  |  16.5  |  4.6  |  11.8  |  0  |
|  trum  |  chieu:janus  |  30.6  |  14.4  |  11.4  |  3.2  |
|  trum  |  trum:joker_king  |  9.5  |  3.6  |  4.2  |  0  |
|  trum  |  chieu:joker_king  |  21.5  |  20.3  |  0  |  3.6  |
|  trum  |  trum:octopus  |  15.1  |  3.5  |  11.2  |  0  |
|  trum  |  chieu:octopus  |  16.8  |  4.9  |  11.2  |  1.4  |
|  trum  |  trum:nightmare  |  8.9  |  4.3  |  4.3  |  0  |
|  trum  |  chieu:nightmare  |  12.3  |  5.6  |  5.6  |  0  |
|  trum  |  trum:hive  |  25.6  |  4.7  |  18.6  |  0  |
|  trum  |  chieu:hive  |  28.9  |  7.7  |  19.6  |  0  |
|  trum  |  trum:jammer  |  13.3  |  4.5  |  7.5  |  0  |
|  trum  |  chieu:jammer  |  25.1  |  5.3  |  11.8  |  0  |
|  trum  |  trum:prism  |  16.1  |  5.6  |  11.3  |  0  |
|  trum  |  chieu:prism  |  5.9  |  7.3  |  0  |  0  |
|  trum  |  trum:twin_core  |  13.8  |  3.5  |  8.6  |  0  |
|  trum  |  chieu:twin_core  |  4.9  |  2.7  |  0  |  0  |
|  trum  |  trum:patcher  |  11.7  |  4.4  |  7.8  |  0  |
|  trum  |  chieu:patcher  |  16.6  |  5.4  |  7.9  |  0  |
|  trum  |  trum:leech  |  12.4  |  3.7  |  7.8  |  0  |
|  trum  |  chieu:leech  |  25.5  |  5.6  |  6.6  |  0  |
|  chihuy  |  mv:hero  |  7.3  |  9.8  |  0  |  0  |
|  chihuy  |  mv:dahlia  |  11.8  |  7.5  |  5.9  |  0  |
|  chihuy  |  mv:eve  |  10.9  |  8  |  4.7  |  0  |
|  dong  |  cungluc#1  |  30.8  |  28.1  |  5  |  0  |
|  dong  |  cungluc#2  |  17.2  |  16.1  |  0  |  0  |
|  dong  |  cungluc#3  |  11.6  |  8.7  |  0  |  0  |
|  coop  |  cungluc#1  |  47.2  |  33.2  |  6.4  |  2.2  |
|  coop  |  cungluc#2  |  38.7  |  20.1  |  0  |  0  |
|  coop  |  cungluc#3  |  22.6  |  15.2  |  0  |  0  |

Dải khung 2 khoảnh khắc nặng (trái → phải ~0,3 s/ảnh): `khung_truoc_cungluc.jpg` / `khung_sau_cungluc.jpg` (bàn 7★ mọi skill cùng lúc), `khung_truoc_freezer.jpg` / `khung_sau_freezer.jpg` (Freezer tung chiêu). Hình giống nhau (số sát thương, hiệu ứng) — chỉ khác thời gian dựng.

Số đầy đủ: `do_truoc.txt`, `do_sau.txt`, `kq_sau.json`, `bang_truoc_sau.md`.

## Kiểm hồi quy
`tools/thap-kt-giat.js` (trong `thap-kt-hoiquy.js`, luồng `solo`/`giat`): Black Hole/Overlord/Leviathan/Fire Dragon lần đầu, Freezer/Hive/Janus/Patcher ra + tung chiêu, ghép Orbital, Dahlia, mọi skill cùng 1 khung — TRƯỢT nếu JS khung > 30 ms (máy đo; ≈ 15 ms iPhone; riêng "mọi ụ 7★ kích hoạt cùng 1 khung" > 40 ms ≈ 18–20 ms iPhone; vượt thì chạy lại nhóm 1 lần, giật thật lặp lại cả 2 lần), thu nhỏ ảnh > 12 ms/khung (ngân sách 4 ms + 1 việc không chia được), hoặc lỗi trang.

## Còn lại / gợi ý
- Sau khi gộp bản Cửa hàng (06/11 tối) khung "mọi ụ 7★ trên bàn kích hoạt cùng 1 khung" đo lại 31–39 ms máy đo (≈ 16–20 ms iPhone 13): không còn việc dựng ảnh lần đầu, chỉ là vẽ ~1 300 hiệu ứng thật của 15 chiêu cùng lúc (tia, sét, vệt lửa, nổ) — dưới 33 ms trên iPhone nhưng sát; muốn dư nữa phải giảm số hiệu ứng vẽ (đụng hình chiêu — chưa làm).
- Bàn đầy 7★ CO-OP: ~2 400 lệnh vẽ, 35–49 MP phủ/khung (≈ 12–16 lớp màn hình) — tải GPU liên tục, không phải giật do skill; thuộc phần chống nóng (session nhiệt).
- Chưa đo trên Safari thật (máy đo không có WebKit).

## Bổ sung 06/11 (lần chạy thứ 2 của việc này) — băng chữ DOM
Đo lại theo **từng lời gọi hàm** (`tools/thap-do-giat-goi.js`: bọc FX/SND/VX/SIG/PX/FXU/REN/UI, ghi hàm > 2 ms mỗi khung; Chromium iPhone 13 DPR 3)
trên bản đã có `nongskill.js`: phần ảnh đã ổn, còn **băng chữ DOM**:
- **Cut-in chỉ huy Hero: 25,5 ms trong 1 khung** (`UI.cutIn` — `fitText` thu cỡ chữ từng bước 0,5 px, mỗi bước dựng lại bố cục ~40 lần);
  Dahlia/Eve 3–5 ms (tên ngắn hơn). Báo trùm 3–13 ms (băng UI + băng hudtop đo 2 lần).
- Sửa (`nongskill.js` mục 4, chỉ trong cut-in / báo trùm / băng WAVE): tìm nhị phân (~6 lần đo, cùng kết quả) + nhớ theo chữ/khung/cỡ màn;
  đo trước lúc vào trận khi băng còn ẩn (cut-in chỉ huy của người chơi + tên mọi trùm, mỗi khung 1 việc).
- Sau: cut-in Hero **25,5 → < 2 ms** (không còn trong danh sách hàm > 2 ms; khung xấu nhất lúc dùng Hero do việc khác 21 ms → không còn
  khung > 33 ms), Dahlia 3,4 ms, Eve 2,3 ms; 5 đỏ + ghép + trùm Freezer cùng lúc **37 → 21,6 ms** việc/khung.
- Ghi chú máy đo: CO-OP 2 bàn 30 ụ 7★ cùng kích đôi khi có 1 khung 70–110 ms nằm trong **một lệnh drawImage** (Chromium không GPU
  raster muộn canvas bộ đệm mới dựng ở lần vẽ đầu) — đặc thù Chromium phần mềm, Safari/iPhone vẽ ngay khi dựng; không đổi gì thêm.
