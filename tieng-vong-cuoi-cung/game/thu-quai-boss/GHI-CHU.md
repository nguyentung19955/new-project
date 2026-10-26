# Bản thử quái + boss vẽ từ mảnh – ghi chú

Mở: `thu-quai-boss.html` (qua raw.githack:
`https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-quai-boss/thu-quai-boss.html`).
Gốc là bản sao `game/demo.html` (Lam giữ nguyên clip chạy hiện có, nền tạm, màn chơi cũ). **`game/demo.html` không bị sửa.**

**Chưa thử trên iPhone thật.** Mọi số đo dưới đây là Chromium headless trên máy chủ Linux (không GPU thật).

## 1. Xem gì
| Video (`video/`, 60 hình/s, mỗi hình = đúng 1 bước logic) | Nội dung |
|---|---|
| `1-lam-danh-3-quai.mp4` | Lam (bot tự đánh) hạ 3 quái: 2 quái đi tuần (né đòn đấm rồi chém), quái gác vỏ cứng hạ bằng Cộng hưởng (Tiếng Vọng + chém cùng lúc) |
| `2-tran-boss-du-2-pha.mp4` | Trận boss đủ: ngủ → gầm → pha 1 (đập, quét, Lam né) → chuyển pha → treo trần, rung trần, mảnh rơi → bóng Vọng kéo xích → rơi, choáng → bay lên lại → … → chết |
| `3a-…-hitbox.mp4`, `3b-…-hitbox.mp4` | như trên, bật overlay hitbox |
| `4-can-canh-kiem-don-2-huong.mp4` | cận cảnh: quái đấm và boss quét, **quay trái và quay phải**, Lam **sát** / **ở rìa tầm (lấn 2 px)** / **ngoài tầm 2 px**; boss đập 2 hướng |

Bot và chế độ bất tử (`?batTu=1`: Lam vẫn trúng đòn, bị đẩy, nhưng không chết) chỉ để quay; gameplay không đổi.

Tham số địa chỉ: `?vao=quai` (vào thẳng Sân chuông), `?vao=boss` (phòng boss), `?vao=boss2` (boss vào pha 2 ngay sau tiếng gầm),
`?hitbox=1` (overlay – hoặc phím **H**, hoặc nút **▣** góc trên phải trên điện thoại), `?bot=quai|boss` (xem bot đánh), `?kiem=1` (chuỗi kiểm đòn).

Overlay: xanh = thân (hitbox gameplay), lục đứt = vùng ăn đòn của Lam, **đỏ đặc = đòn đang gây sát thương ở bước này**,
cam đứt = đòn sắp bật (lấy đà / boss đang bay – khi tiếp đất cả thân là vùng sát thương), tím đứt = hộp bao nắm tay **theo hình vẽ**.
Dòng chữ trên mỗi con: `trạng thái game t → clip thời điểm (khung)`.

## 2. Nạp và bộ nhớ
| | Số liệu |
|---|---|
| Ảnh tải | **14 PNG mảnh** (quái 8, boss 6) = 960 KB + 1 JSON rig 77 KB. Không tải sprite sheet nào của quái/boss (sheet 2x boss không dùng) |
| Ảnh cache tạo lúc nạp | 42 (mỗi mảnh 1 bản trắng – nháy trúng đòn, 1 bản vàng – lóe lấy đà / vỏ cứng, 1 bản tối – tối dần lúc chết) |
| Giải mã PNG (rộng×cao×4) | **3,89 MB** (boss 3,56 MB – lớn nhất `than` 572×657 = 1,50 MB; quái 0,33 MB) |
| Cache | 11,67 MB → **tổng ≈ 14,8 MB** bộ nhớ ảnh |
| So với sheet | sheet 2x đủ clip: boss ≈ 380 MB, quái ≈ 61 MB giải mã |
| Thời gian (localhost, headless) | JSON 13,5 ms · tải + `decode()` 14 ảnh 65,7 ms · tạo cache + vẽ thử 44,7 ms · **tổng 124 ms** |

Tất cả nạp + decode + tạo cache + vẽ thử 1 lần **ở màn nạp**, trước nút Bắt đầu (số đo hiện ngay trên màn Bắt đầu).
Qua mạng (githack/iPhone) thời gian tải sẽ do mạng quyết định (~1 MB); chưa đo.

Mảnh thu về **2 px ảnh / 1 px logic** (như sheet Lam 2x). iPhone ngang thường có bộ đệm ≈ 2,2 px/px logic nên gần 1:1;
nếu thấy mờ trên máy lớn có thể xuất 2,5x (bộ nhớ ×1,56 ≈ 23 MB) – chỉ đổi `PX_ANH_MOI_PX_LOGIC` trong `runtime/xuat-quai-boss.py`.

## 3. Thời gian vẽ mỗi khung
Đo bằng `performance.now()` quanh `render()` khi chạy thường (rAF), bộ đệm 1920×1080 (DPR 2), 12 s mỗi cảnh (`so-do/do-ve.json`):

| Cảnh | Cả khung: TB / p95 / max | Riêng quái + boss: TB / max |
|---|---|---|
| Sân chuông, 3 quái | 0,44 / 0,8 / 3,8 ms | 0,05 / 1,2 ms |
| Phòng boss | 0,44 / 0,8 / 3,1 ms | 0,10 / 1,2 ms |

Mỗi con 6–8 lần `drawImage` (+1 mỗi mảnh khi nháy / lóe / tối). Không `getImageData`, không lọc pixel lúc chơi.
Lưu ý: số này là thời gian JavaScript ra lệnh vẽ, không phải thời gian GPU tô; headless không có GPU thật → **phải đo lại trên iPhone**.

## 4. Trạng thái gameplay ↔ clip / khung
Ánh xạ nằm trong `runtime/quai-boss-runtime.js` (`QBR.capNhatQuai`, `QBR.capNhatBoss`), gọi mỗi bước logic sau khi game cập nhật.
Gameplay (demo.html) giữ nguyên: hitbox, thời lượng, sát thương. Animation chỉ đọc trạng thái + bộ đếm `t` + vị trí/vy.

**Quái** (60 bước/s; ms = t × 16,67):
| Trạng thái game | Bước | Clip | Thời điểm clip | Ghi chú |
|---|---|---|---|---|
| walk | ∞ | `di` | theo `q.at` | game dời 0,9 px/bước = 54 px/s = tốc độ chân chịu lực của clip |
| wind | 30 | `dam` | 0 → 483 ms | lấy đà + lóe vàng (game) |
| strike | 16 | `dam` | 500 → 750 ms | **hitbox game t 5–10 = clip 583–667 ms = khung 17,5–20** |
| rec | 26 | `dam` | 767 → 1183 ms | wind/strike/rec cùng khoá clip → liền mạch |
| hit | 16 | `trung` | 0 → 267 ms | quái CÓ choáng trong game (trúng đòn ngắt đấm) → đổi clip, hoà từ tư thế đang có |
| die | 210 | `chet` | 0 → 1000 ms rồi giữ | vỡ đôi ở khung 4 (bật/tắt mảnh đổi bậc); game làm mờ từ bước 150 |
| sleep / awake (quái gác) | – | `dung` | chậm ½ / thường | vỏ cứng: phủ vàng 18 % |

**Boss:**
| Trạng thái game | Clip / tư thế | Cách lấy thời điểm |
|---|---|---|
| sleep | `ngu` (tự đặt) | chìm sát đất, 2 nắm tay đặt trên đất, tối 18 % |
| intro (70) | `gam` (tự đặt) | ngả sau, giơ 2 tay trên mái, rung |
| walk | `dung` | theo `b.at` (lướt dùng chung clip đứng) |
| slamPrep (30) | `dap` 0–483 ms | **bỏ phần clip tự nâng thân 16–19 px**, thay bằng nhún lấy đà 4 px |
| slamAir | `dap` 500–950 ms | **theo trạng thái thật, không theo đồng hồ**: đi lên 500→700 ms theo `vy/vy0`; rơi 700→950 ms theo phần độ cao đã rơi (`1 − h/h_đỉnh`). Thân không nâng thêm (game đã nâng vị trí) |
| slamRec (45) | `dap` 950 → 1700 ms | bắt đầu ĐÚNG ở bước game báo tiếp đất (khung chạm 19 = nắm tay nện đất) |
| sweepPrep (30) / sweep (14) / sweepRec (36) | `quet` 0–483 / 500–717 / 733–1333 ms | **hitbox game t 2–10 = clip 533–667 ms = khung 10,7–13** |
| toP2 (80) | `rung` (30 bước) rồi `bay` | rung bần bật → vươn tay bay lên trần |
| hang | `treo` (tự đặt) | đung đưa, tay buông thõng, xích treo giữ gần thẳng |
| shakeCeil (24) | `rungTran` (tự đặt) | hai nắm tay thay nhau nện trần |
| pulled | `giat` (14 bước) rồi `roi` | bị xích giật chúi xuống → rơi, tay giơ cao |
| stun (180) | `choang` (tự đặt) | nén lúc chạm đất, ngồi bệt, lắc lư, tay nằm đất (bỏ phép xoay cả hình của demo cũ) |
| rise (50) | `bay` | |
| die (170) | `chet` 0 → 1600 ms giữ | nứt đôi ở 700 ms (≈ bước 40 game bắn mảnh) |
| trúng đòn (mọi trạng thái) | **không đổi clip** | game không cho boss choáng khi trúng → đòn đang đánh chạy tiếp; chỉ nháy trắng (`b.flash`) |

Pha 2 có treo trần / rung trần / kéo xuống / choáng / bay lên → đã thêm 7 tư thế tự đặt dựng từ 6 mảnh có sẵn (`QBR.TU`).
Clip `trung` của boss không dùng (game không có choáng khi trúng).

**Chuyển clip**: khi khoá clip đổi, chụp tư thế ĐANG HIỆN rồi hoà sang clip mới trong 2–18 bước (tuỳ chỗ, smoothstep) – không giật về dáng nghỉ.
**Nội suy**: giữa các khung tính sẵn của clip nội suy tuyến tính dịch/góc/co giãn/tối/đục; **cờ bật/tắt mảnh (`hien`) đổi bậc** theo khung trước
(thân nguyên → hai nửa chẻ đôi đúng khung 4 quái / 700 ms boss), kể cả khi đang hoà.
Giữa 2 bước logic, tư thế nội suy theo `al` như vị trí (mượt ở 90/120 Hz); khi khựng đòn (hitstop) / tạm dừng giữ đúng tư thế bước hiện tại.
**Nháy trắng**: kênh `trang` nướng trong clip bị bỏ khi xuất gói; game nháy bằng ảnh trắng cache (q.flash/b.flash, 8 bước: 0,8 rồi 0,45).

## 5. Kiểm khớp hitbox (số từ `so-do/*.json`)
Đo ở chính bước logic game kiểm sát thương, tư thế đúng của bước đó.

| Đòn | Kết quả |
|---|---|
| Quái đấm, 2 hướng | ở mọi bước t 5–10: nắm tay (hình) nằm **100 %** trong hộp đấm (ngang và dọc) |
| Quái đấm, Lam sát / rìa (lấn 2 px) / ngoài 2 px | trúng / trúng / **không trúng** – cả quay trái và quay phải |
| Boss quét, 2 hướng | ở mọi bước t 2–10 nắm tay chạm hộp quét; phần ngang của nắm tay nằm trong hộp: 26 % (t 2, tay vừa lao tới) → 59 → 86 → **100 % (t 5–7)** → 87 → 73 → 68 % (t 10, tay đã ra quá đầu hộp). Đáy nắm tay so với mặt đất: t 2 còn cao 10 px, t 3–10 trong ±0,25 px (miết sát đất) |
| Boss quét, Lam sát / rìa / ngoài | trúng (t 2) / trúng (t 8 – lúc hộp vươn xa nhất sau khi boss lướt 8×3,6 px) / **không trúng** – 2 hướng |
| Boss đập | bước tiếp đất = khung 19 (950 ms) ở mọi lần; đáy 2 nắm tay cách mặt đất ≤ 0,8 px (= khe game để boss ở trên mặt gạch) |
| Không cộng hai lần độ cao | gốc nút thân so với điểm neo khi bay giữ ổn định (nghỉ 15,2 px; chỉ đổi vài px do nhún/nghiêng), trong khi game nâng boss tới 94 px |

Lưu ý gameplay quan sát được (không sửa vì là logic game): phòng boss có trần → cú nhảy đập chạm trần ở độ cao ≈ 94 px và "dính" ~11 bước
(vy vẫn tăng dần); animation bám vy thật nên vẫn đúng nhịp.

## 6. Cái chưa đẹp / cần biết
- **Chưa thử iPhone/Safari thật** (thời gian nạp qua mạng, thời gian vẽ GPU, độ nét ở 2 px/px logic).
- Hộp tím (nắm tay theo hình) tính từ bao lồi phần đặc của mảnh – sát hình, nhưng vẫn là hộp chữ nhật.
- Tư thế pha 2 (treo, rung trần, giật, rơi, choáng, bay) là **đặt tay bằng số**, chưa qua chỉnh mốc kỹ như các clip gốc; tay "nện trần" đổi bậc mỗi 8 bước (hoà 4 bước) – hơi cơ khí.
- Khi treo, phần trên boss khuất ngoài mép màn (như demo cũ: chân ở y 250) nên xích trần không thấy; xích kéo vẫn là ô vuông pixel cũ của demo.
- Chuyển `rung` → `bay` → `treo` hoà 14 bước, nhìn ổn; `giat` → `roi` hơi đột ngột (5 bước).
- Nháy trắng phủ từng mảnh nên chỗ hai mảnh chồng nhau sáng như nhau (không có viền) – chấp nhận được.
- Bot: quái gác chỉ đứng ngủ (`sleep/awake` của game không đánh) – đúng như demo.
- Trong video 3 quái và video boss, bot né được hết nên Lam không bị trúng đòn lần nào; các cú trúng Lam xem ở video cận cảnh.
- Video boss: bot giữ khoảng cách ở pha 1 để boss ra đủ đòn (3 cú đập, 2 cú quét – 1 quay trái, 1 quay phải) rồi mới dồn đánh. Hai bản (thường / hitbox) dài lệch nhau vài chục khung vì mảnh rơi pha 2 ngẫu nhiên.

## 7. Cách ghép vào `game/demo.html`
Mọi thay đổi so với demo nằm trong `cong-cu/tao-tu-demo.py` (danh sách cặp "cũ → mới", mỗi cặp ghi có ghép hay không).
Phần cần ghép (8 chỗ):
1. Thêm `<script src="runtime/quai-boss-runtime.js"></script>` trước khối `<script>` chính (đường dẫn từ `game/`).
2. `SRC`: bỏ `qb`, thêm `qbr: 'runtime/quai-boss/'`.
3. `updateQuai`: thay 7 dòng chọn khung sheet cuối hàm bằng `QBR.capNhatQuai(q,S.frame);`.
4. `bossAnim()`: thay bằng `const BOSS_G={FLOOR}; function bossAnim(){ QBR.capNhatBoss(boss,S.frame,BOSS_G); }`.
5. Thay `drawQuai` / `chain` / `drawBoss` bằng nội dung `cong-cu/khoi-ve-quai-boss.js` (có `ANIM_AL`, `DO` đo vẽ, neo đúng mặt đất, không co giãn thêm).
6. `boot()`: thay `napSheet('qb')` bằng `QBR.nap(SRC.qbr, tiến_độ)`; bỏ 3 dòng tô màu sheet quái cũ (QHB giữ số gameplay −90,−81,66,37).
7. Đầu `render()`: `ANIM_AL=(S.paused||S.hitstop>0)?1:al;`.
8. Debug: chữ trạng thái quái dùng `q.H.info`.

Không ghép: khối THỬ (`cong-cu/khoi-thu.js`: bot, kiểm đòn, API quay, overlay hitbox, bất tử). Overlay hitbox có thể ghép riêng nếu muốn (độc lập).
Bản build tự chứa (`build-demo.py`) hiện cấm `<script src=`: khi ghép cần cho build nhúng `runtime/quai-boss-runtime.js` và 14 PNG
(data URI) + JSON vào `TV.NHUNG` – `QBR.nap` khi đó nên nhận URL data thay cho `base+nd.anh` (chưa làm).
`anim/quai-boss.json/.png` (sheet chibi cũ) không cần nữa sau khi ghép.

## 8. Tệp
| Tệp | |
|---|---|
| `thu-quai-boss.html` | bản thử (SINH RA từ `game/demo.html` bằng `cong-cu/tao-tu-demo.py` – sửa các khối trong `cong-cu/` rồi chạy lại) |
| `../runtime/quai-boss-runtime.js` | module nạp / tư thế / vẽ / ánh xạ trạng thái (window.QBR) |
| `../runtime/quai-boss/` | gói asset: `quai-boss-rig.json` + `quai/*.png` + `boss/*.png` |
| `../runtime/xuat-quai-boss.py` | sinh gói asset từ `art/the-gioi-moi/quai-boss/` (pillow, numpy, scipy) |
| `cong-cu/quay-video.py` | quay 5 video + đo (Playwright Chromium + ffmpeg) → `video/`, `so-do/` |
| `so-do/*.json` | số đo: nạp, vẽ, khớp hitbox từng bước, kết quả kiểm đòn, các lần Lam trúng đòn |
