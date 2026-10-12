# Linh Khí: báo cáo kiểm thử hiệu năng, tải trang, bộ nhớ, ổn định, lưu/tải

Tester 3. Ngày 11/10/2026. Bản đo: commit `8bcb9499`, đóng gói hai tệp (`--hai-tep`) trong bản sao của repo. Repo gốc không bị sửa.

## Tóm tắt 5 dòng

1. **Tải chậm hơn nhiều so với Đợt 10.** Lượng tải về tăng từ 6,8 MB lên **18,6 MB** (trang chính 2,70 MB, tệp ảnh 15,87 MB, đã nén gzip). Trên 4G với CPU chậm ×4, màn chào hiện sau **7,5 giây** và tải đủ ảnh sau **30 giây**. Trên 3G chậm, hai mốc đó là **19 giây** và **109 giây**.
2. **Trong lúc tệp ảnh đang tải, game giật nặng.** Ở CPU ×4, trong 20 giây đầu ở làng, máy chỉ vẽ được khoảng **8 khung/giây** và có những lần đứng hình tới **3,9 giây**. Mở lại lần hai (đã có bộ đệm) chỉ nhanh hơn khoảng 2 giây, vì chỗ nghẽn là CPU xử lý ảnh chứ không phải mạng.
3. **Chơi thường thì mượt, phòng đông thì không.** Bot chơi thường ở CPU ×1 đạt **58 khung/giây**. Phòng 14 quái có spam chưởng chỉ còn **16–29 khung/giây**, phòng trùm Hồ Tinh **10–15 khung/giây**. Ở CPU ×4 (gần máy tầm trung) chỉ còn **2–6 khung/giây**. Nguyên nhân chính đã tìm được: quái đã có ảnh AI mà game vẫn dựng thân bằng code từng điểm ảnh rồi bỏ đi. Thử tắt phần này thì trùm Hồ Tinh tăng từ **14,8 lên 58,5 khung/giây** ở CPU ×1, và từ **2,4 lên 16,5** ở CPU ×4.
4. **Bộ nhớ đồ hoạ tăng mãi, không dừng.** Sau 10 phút chơi bằng bot, số canvas còn sống tăng đều từ 905 lên **5 299** (72 triệu điểm ảnh, khoảng 290 MB nếu trình duyệt cấp đủ vùng nhớ cho từng canvas). Bộ nhớ của tiến trình trang lên 930 MB, có lúc **1,2 GB**. Bộ nhớ JS thì ổn định ở 45–75 MB, không rò. Trên iPhone, mức này có nguy cơ cao làm Safari tự tải lại trang.
5. **Ổn định và lưu/tải tốt.** Không có lỗi trang (pageerror) nào trong suốt các lượt đo, kể cả 10 phút chơi liên tục. Chặn tệp ảnh thì game vẫn chạy. Bản lưu hỏng được chép ra khoá dự phòng. localStorage bị chặn cũng không treo. Ẩn trang thì game tự tạm dừng.

| Hạng mục | Điểm (1–10) |
|---|---|
| Tốc độ tải | **4** |
| Độ mượt | **4** (chơi thường 7, phòng đông/trùm hoặc máy yếu 2) |
| Bộ nhớ | **3** |
| Ổn định | **8** |
| Lưu/tải | **7** |

## Cách đo và giới hạn (đọc trước khi xem số)

- **Môi trường:** Chromium headless shell (Playwright) trên máy chủ Linux 2 lõi Xeon 2,8 GHz, **không có GPU** (canvas vẽ bằng CPU). Giả lập iPhone ngang 844×390, dpr 3, `isMobile`, `hasTouch`. CPU chậm dùng CDP `Emulation.setCPUThrottlingRate` 4 và 6. Mạng: CDP `Network.emulateNetworkConditions`, gồm 4G (9 Mbps, trễ 170 ms) và 3G chậm (1,5 Mbps, trễ 300 ms).
- **Máy chủ thử** (`srv.py`) làm giống Firebase Hosting: nén gzip, có ETag/304, `index.html` để `no-cache`, tệp ảnh để `max-age=1 năm, immutable`. Service worker `sw.js` bật ở bài tải lần 2. Mọi lượt đều dùng `?cloud=0` và chặn Google Fonts.
- **Không đo được bản thật** https://spiritblade.web.app, vì proxy trả 403 cho máy chủ này. Mọi số đo đều lấy từ bản build cục bộ, cùng commit.
- **Máy có lúc bị chia CPU** với các phiên tester khác (load average lên 5,7 trên 2 lõi). Vì vậy số tuyệt đối dao động khoảng ±40 %. Ví dụ phòng đông Rừng ở CPU ×1 đo hai lần ra 15,9 và 28,8 khung/giây. Hãy so **tương đối** trong cùng một lượt (bảng A/B ở mục 3 chạy liền nhau).
- **Chromium máy chủ khác iPhone Safari thật:** iPhone có GPU, nên phần dán ảnh (drawImage) nhanh hơn nhiều. Ngược lại, phần JS dựng hình từng điểm ảnh, `getImageData` và giải mã PNG thì iPhone tầm trung chậm ngang khoảng CPU ×2–×4 ở đây. Giới hạn bộ nhớ canvas và cách Safari tự tải lại trang khi hết RAM **không giả lập được**: phần đó là suy đoán dựa trên số đo ở Chromium.
- Ký hiệu: **[ĐO]** là số đo trực tiếp. **[SUY]** là suy đoán hoặc rút ra từ đọc code.

## 1. Tải trang [ĐO]

Kích thước (byte, sau gzip -6 như Firebase):

| Tệp | Gốc | Truyền qua mạng | Đợt 10 (so sánh) |
|---|---|---|---|
| Trang chính `linh-khi-nhe.html` (319 hình bắt buộc) | 5 154 452 | **2 697 669** | 1 555 893 |
| Tệp ảnh tải sau `linh-khi-anh.14e288b936dd.json` (292 hình) | 21 245 299 | **15 873 406** | 5 229 402 |
| Tổng | 26,4 MB | **18,57 MB** | 6,79 MB |

Tệp ảnh: 40 quái/trùm chiếm 11,4 MB, 85 hiệu ứng 5,9 MB, 12 thân em bé 2,5 MB. Trùm và dáng pha là các tấm lớn nhất: hoTinh 1,7 MB, mocTinh-p3 1,2 MB, nguTinh-p3 1,2 MB.

Thời gian (mili giây tính từ lúc mở trang, CPU ×4 trừ dòng cuối):

| Mạng / lượt | Chữ "Đang tải…" | Màn chào | Vào làng (chạm) | Đủ ảnh tải sau | Long task sau khi vào làng |
|---|---|---|---|---|---|
| 4G, lần 1 (không đệm) | 297 | **7 511** | 10 084 | **30 027** | 15,3 s (khung tệ nhất 3,9 s) |
| 4G, lần 2 (có đệm + SW) | 190 | 5 682 | 8 608 | 28 673 | 13,2 s (khung tệ nhất 4,1 s) |
| 3G chậm, lần 1 | 518 | **19 056** | 22 047 | **109 266** | 53,5 s |
| 3G chậm, lần 2 | 197 | 12 078 | **26 767** (chạm bị trễ ~14 s) | 54 071 | 20,1 s (khung tệ nhất 10,4 s) |
| 4G, CPU ×1, lần 1 | 278 | 8 715* | 10 783 | 35 222 | 5,4 s |

\* Lượt này bị CPU của phiên khác chen vào, số lệch.

Nhận xét:

- Chữ "Đang tải…" hiện ngay (dưới 0,6 giây): đạt.
- **Lần 2 gần như không nhanh hơn.** Ở 4G, mốc đủ ảnh chỉ bớt 1,4 giây. Ở 3G nhanh gấp đôi nhưng vẫn mất 54 giây. Nghĩa là thời gian chủ yếu nằm ở CPU: đọc JSON từng dòng, `SC.add`, giải mã PNG, và cứ 400 ms lại xoá bộ nhớ đệm hình (`xoaNhoSau`) rồi dựng lại.
- Ở 3G lần 2, tệp ảnh về từ bộ đệm gần như cùng lúc, xử lý dồn dập làm luồng chính bận, nên **chạm vào màn chào phải 14 giây sau mới có tác dụng**.
- Trong 20–25 giây đang tải ảnh, người chơi đã ở làng nhưng game chỉ có 8 khung/giây ở CPU ×4 (247 khung trong 30 giây).

## 2. FPS và thời gian mỗi khung [ĐO]

Mỗi cảnh đo 12 giây. Số "ổn định" tính từ giây thứ 2 trở đi. Cột "2 giây đầu" là khung tệ nhất ngay khi vào cảnh (lúc hiệu ứng, ảnh xuất hiện lần đầu). Lượt đo `khung.json`:

| Cảnh | CPU ×1: FPS / p95 / tệ nhất (2 giây đầu) | CPU ×4 | CPU ×6 |
|---|---|---|---|
| Làng | 57,4 / 16,8 / 50 (167) ms | 16,8 / 100 / 283 (417) | 10,0 / 167 / 200 (600) |
| Phòng ít quái (3 con, Rừng) | 34,0 / 66,7 / 133 (**783**) | 5,9 / 267 / 333 (733) | 4,0 / 400 / 567 (1 200) |
| Phòng đông 14 quái + spam chưởng lửa (Rừng) | 15,9 / 150 / 367 (200) | 3,1 / 533 / **2 417** | 3,1 / 500 / 517 |
| Phòng đông + chưởng độc (Biển) | 18,6 / 100 / 283 | 3,1 / 550 / 650 | 2,7 / 550 / 683 |
| Phòng đông + chưởng băng (Lâu đài) | 19,1 / 100 / 367 | 4,3 / 533 / 633 | 3,5 / 467 / 467 |
| Trùm Mộc Tinh | 32,2 / 66,7 / 367 | 6,1 / 300 / 400 (683) | 3,9 / 433 / 533 |
| Trùm Ngư Tinh | 30,6 / 66,8 / 250 | 6,5 / 317 / 417 | 4,7 / 433 / 550 |
| Trùm Hồ Tinh | **10,4** / 217 / 800 | **2,2** / 1 067 / 1 500 | **1,6** / 950 / 1 350 |
| **Bot chơi thường 10 phút** (`bonho.json`) | **57–59** / 16,8 / 100–233 | – | – |

- Ở CPU ×4–×6, game chạy bù tối đa 5 bước logic mỗi khung (`engine.js frame`, `n < 5`). Khung dài 300 ms thì game **chạy chậm như quay chậm**, chưa kể giật.
- Các khung tệ trong 2 giây đầu (783 ms ở phòng ít quái, 1,2 giây ở CPU ×6) là lúc dựng lần đầu khung quái bằng code, tấm nhuộm màu và giải mã ảnh.

### Profiler CDP: hàm tốn nhất

- **Phòng đông, CPU ×4:** `G.drawWorld` 59 %. Trong đó `MA.draw` (quái) 35 %, `veKhung`/`ghepHinh` 26 %, riêng `inv` 13 % (tự thân). `drawImage` 17 % (tự thân). `BT.draw`/`maskOut` (báo trước) 13 %. Logic (`G.updateWorld`) chỉ 4 %.
- **Trùm Hồ Tinh, CPU ×4:** `veKhung` → `ghepHinh` **65 %** của toàn bộ thời gian, riêng `inv` 55 %. Hồ Tinh đã có ảnh AI, nhưng thân vẫn được dựng lại bằng code ở mỗi khung mới.

### Thử A/B: bỏ dựng thân bằng code khi quái đã có ảnh AI [ĐO]

Lượt B thay `MA.draw` bằng cách gọi thẳng `SC.veQuai`, nên mất bóng và hiệu ứng rời của quái. Lượt này chỉ để đo xem phần thân code tốn bao nhiêu, không phải bản sửa. A và B chạy liền nhau (`expA.json`, `expB.json`):

| Cảnh | A CPU ×1 | B CPU ×1 | A CPU ×4 | B CPU ×4 |
|---|---|---|---|---|
| Phòng đông Rừng + lửa | 28,8 FPS, p95 66,7 | **37,7**, p95 33,4 | 3,7 | **7,0** |
| Trùm Mộc Tinh | 43,4, p95 50 | **56,8**, p95 33 | 6,0 | **13,1** |
| Trùm Hồ Tinh | 14,8, p95 150 | **58,5**, p95 16,8 | 2,4 | **16,5** |

## 3. Bộ nhớ [ĐO]: 10 phút bot chơi liên tục, CPU ×1

Số đo lấy sau khi ép dọn rác bằng `gc()`. "Canvas sống" đếm bằng FinalizationRegistry gắn vào `createElement('canvas')`.

| Thời điểm | Heap JS | Canvas sống | Điểm ảnh canvas sống | RSS tiến trình trang | Nút DOM (kể cả canvas rời) |
|---|---|---|---|---|---|
| 21 s | 61,7 MB | 905 | 10,4 Mpx | 454 MB | 1 566 |
| 3 phút | 48,2 MB | 3 199 | 44,2 Mpx | 726 MB | 3 860 |
| 5,5 phút | 67,5 MB | 3 964 | 56,6 Mpx | **1 204 MB** | 4 625 |
| 10 phút | 51,0 MB | **5 299** | **72,1 Mpx** | 933 MB | 5 960 |

- **Heap JS không rò:** dao động 45–75 MB, không có xu hướng tăng.
- **Canvas rò kiểu bộ nhớ đệm không có trần:** tăng đều khoảng 440 canvas mỗi phút và chưa thấy chững lại. 72 Mpx × 4 byte ≈ 290 MB vùng nhớ ảnh.
- Thêm vào đó là ảnh PNG đã giải mã: tính từ kích thước, cả 611 hình giải mã ra **187 MB** RGBA (riêng tệp tải sau 167 MB). Tấm lớn nhất 3 328×1 536 = 20 MB.
- Trùm Hồ Tinh chớp trắng lần đầu tạo một tấm nhuộm cỡ **cả tờ sprite** (5,1 Mpx = 20 MB) trong `sprite_custom.js nhuom()`. Đã đo bằng `sp.mau`.
- [SUY] iOS Safari giới hạn tổng bộ nhớ canvas (thường vài trăm MB) và tự tải lại tab khi hết RAM. Mức 0,9–1,2 GB như trên có thể làm iPhone 2–4 GB RAM văng hoặc tải lại trang sau 5–15 phút chơi, nhất là sau khi gặp cả 3 trùm. Khi canvas vượt trần, Safari còn có thể vẽ **trắng hoặc trống** canvas mới tạo.

## 4. Ổn định [ĐO]

| Kiểm | Kết quả |
|---|---|
| Lỗi trang (pageerror) suốt mọi lượt (khoảng 25 phút chạy game) | **0** |
| Lỗi console | Chỉ có: tải Google Fonts thất bại (do bị chặn khi đo), và 38 cảnh báo Chrome "getImageData nên đặt `willReadFrequently`" (xem vấn đề V7) |
| 10 phút chơi liên tục | Không treo; bot qua 3 ải, vào ải thứ 4 |
| Ẩn trang (`visibilitychange` hidden + đóng băng trang 4 s) | Game tự chuyển sang `paused` (`stage.js hide()`). Quay lại không có khung dồn (tệ nhất 33 ms), không lỗi. Chuyển tab trong headless không đổi `visibilityState` được, nên phần này đo bằng cách giả lập sự kiện |
| Xoay dọc ↔ ngang 12 lần (CDP đổi kích thước + hướng màn hình) | Không lỗi. Khung game tự xoay 90° và giữ hình ngang, tỉ lệ không đổi, canvas `#ui` không cấp phát lại. FPS sau đó 53 |
| Chặn tệp ảnh tải sau | Thử 3 lần, sau **16,2 giây** thì thôi (`tt: 'loi'`). Trùm Mộc Tinh vẽ bằng code, phòng trùm chạy 29 FPS, không lỗi |

## 5. Lưu/tải [ĐO]

| Kiểm | Kết quả |
|---|---|
| Bản lưu JSON cụt `{"v":1,"gold":55` | Không treo, vào được làng. Bản cũ được chép nguyên văn sang `linhkhi_save_v1_hong`. Bắt đầu lại từ bản trắng, có 2 dòng `console.error` giải thích |
| Tải lại giữa ải | Vàng, sao, cấp còn nguyên (đã lưu trước khi vào ải). **Lượt ải đang chơi bị mất**, về màn chào |
| `localStorage.setItem` ném QuotaExceeded | Chơi bình thường, không lỗi (không lưu được) |
| Truy cập `localStorage` ném SecurityError | Vào được làng, không treo |
| `?cloud=0` | Không gọi Firebase hay Google API nào. Yêu cầu ra ngoài duy nhất là `fonts.googleapis.com` |
| Kích thước bản lưu | 1,3 KB, rất xa trần 5 MB |

## 6. Pin / nhiệt

- [ĐO] Vòng `requestAnimationFrame` **không ngừng khi đang ở bảng tạm dừng**: vẫn khoảng 55 khung/giây, CPU tiến trình trang bận 95 %, ngang lúc đang đánh (95 %). Ở làng đứng yên cũng 93 %. Số % này bị phóng đại vì máy không có GPU và đang bị chia CPU, nhưng **tỉ lệ tạm dừng ≈ đang chơi** là đáng tin: tạm dừng không tiết kiệm gì.
- [SUY] Khi trang bị ẩn, trình duyệt tự dừng rAF, nên không tốn pin.
- [SUY] Trên điện thoại, chơi 15–20 phút có thể làm máy nóng và tụt xung nhịp. Lý do: mỗi khung đều vẽ lại toàn cảnh, chưa có giới hạn 30 FPS cho máy yếu, và dựng thân quái bằng code liên tục (mục 2).

## 7. Danh sách vấn đề

| # | Mức | Ở đâu | Hiện tượng + số đo | Nguyên nhân | Đề xuất sửa |
|---|---|---|---|---|---|
| V1 | **Nghiêm trọng** | Mọi phòng có quái/trùm đã có ảnh AI | Hồ Tinh: 10–15 FPS ở CPU ×1, 2 FPS ở CPU ×4. Bỏ phần thừa thì 58,5 và 16,5 FPS. Phòng đông +30 %, Mộc Tinh +30 % ở CPU ×1, gấp đôi ở CPU ×4 | `sprite_custom.js noiQuai()`: `MA.draw` bọc vẫn gọi `draw0` (vẽ code) với bút giả `butGia` (một `Proxy` + `Map` mới mỗi lần vẽ) để lấy bóng và hiệu ứng. `monster_art.js MA.draw` vẫn gọi `veKhung` → `ghepHinh` → `inv` (biến đổi ngược từng điểm ảnh) để dựng một khung thân **không bao giờ hiện ra** | Thêm cờ `o.chiFx` hoặc `o.boThan` vào `MA.draw`: khi có ảnh AI thì tính `Pose` và hiệu ứng nhưng **bỏ qua `veKhung`** (dùng hộp kích thước từ `B`, không cần `fr.cv`). Dựng `butGia` một lần và dùng lại, không tạo `Proxy` mỗi khung |
| V2 | **Nghiêm trọng** | Bộ nhớ canvas, cả game | Canvas sống tăng 905 → 5 299 sau 10 phút (72 Mpx, ~290 MB). RSS 0,93–1,2 GB | Nhiều bộ nhớ đệm canvas không có trần hoặc trần quá cao: `KHUNG` (monster_art, 2 500 khung + `sil` theo màu), `sp.than` (sprite_custom `khungThan`: mỗi khung × màu × mức, không trần, đo được 481 tấm), `sp.mau`, `sp.xoay` (400), `art.js SPR` (1 400), `hero_tinhlinh` (1 400 + 1 400 + 900), `fx_dan` và `btn_art` (900) | Đặt một **ngân sách điểm ảnh chung** (ví dụ 24 Mpx) với LRU, thay cho trần theo số lượng từng cache. Khi đổi phòng hoặc ải thì xoá cache của quái và trùm không còn trong phòng. Sửa V1 thì `KHUNG` cũng hết phình |
| V3 | **Cao** | Lúc tải tệp ảnh sau (20–80 giây đầu) | 8 FPS ở CPU ×4. Long task tổng 13–53 giây, khung tệ 3,9–10,4 giây. Chạm màn chào trễ 14 giây (3G, lần 2) | `sprite_custom.js chayNapSau`: `theoDoi` chạy mỗi 400 ms, cứ có hình mới là gọi `xoaNhoSau` → `xoaNhoDo()` xoá và dựng lại đồ trên người em bé. 292 ảnh base64 bị `JSON.parse` và giải mã trên luồng chính. Lần 2 không nhanh hơn vì nghẽn ở CPU | (a) Gom: chỉ xoá cache khi hình mới **đang được dùng** (thân em bé, đồ đang mặc), không xoá theo nhịp 400 ms. (b) Giải mã bằng `createImageBitmap(blob)` hoặc `img.decode()` ngoài luồng chính, mỗi khung tối đa 1–2 hình. (c) Tách ảnh thành tệp PNG/WebP riêng thay vì base64 trong JSON (bớt 25 % dung lượng và bỏ được `JSON.parse` chuỗi lớn). (d) Chỉ tải phần của vùng sắp chơi |
| V4 | **Cao** | Dung lượng tải | 18,6 MB qua mạng (Đợt 10: 6,8 MB). Màn chào 7,5 giây (4G) và 19 giây (3G) ở CPU ×4. Đủ ảnh 30 và 109 giây | Ảnh AI tăng gấp 3. Tệp đầu 4,92 MB đã chạm mức "nên dưới 5 MB". Base64 trong HTML/JSON phình thêm 33 % và gzip gần như không nén được PNG | Chuyển ảnh sang **WebP lossless** (thường nhỏ hơn PNG 25–35 %), file rời có hash để trình duyệt tải song song và lưu đệm riêng. Đưa trùm và dáng pha p2/p3 (5,9 MB) ra tệp riêng, tải khi vào ải 4–5. Bỏ 4 thân em bé không dùng khỏi trang chính. Mục tiêu: trang chính dưới 1,5 MB nén |
| V5 | **Cao** | Trùm Hồ Tinh (và mọi quái lớn) lần đầu bị đánh | Tấm chớp trắng 5,1 Mpx (20 MB) tạo ngay lúc trúng đòn đầu tiên. Khung đầu 283–1 350 ms | `sprite_custom.js nhuom(sp, col)` nhuộm **cả tờ sprite** cho mỗi màu (trắng, lửa, băng, độc) | Nhuộm **theo khung** (cỡ `fw×fh`, có cache LRU) thay cho cả tờ. Hoặc chớp trắng bằng `filter: brightness()`, hoặc vẽ thân rồi phủ `source-atop` trên một canvas tạm cỡ khung |
| V6 | **Vừa** | Bảng tạm dừng, làng đứng yên | rAF vẫn 55 FPS, CPU ≈ lúc đánh | `engine.js frame()` luôn vẽ lại cả cảnh | Khi `S.mode` là `paused` / `map` / `bag` / `result`: vẽ 1 lần rồi chỉ vẽ lại khi có chạm. Hoặc hạ xuống 10 FPS. Thêm tuỳ chọn "Tiết kiệm pin: 30 FPS" |
| V7 | **Vừa** | `getImageData` khi nhuộm, dò dáng quái, mặt nạ em bé | 38 cảnh báo `willReadFrequently` trong 10 phút. Trên máy có GPU, mỗi lần đọc là một lần chép GPU→CPU (khựng) | `sprite_custom.js khungThan`, `SC.dangQuai`, 656 (`getContext('2d')` không có cờ). `matNa` đã có cờ | Thêm `{ willReadFrequently: true }` cho mọi canvas tạm dùng để đọc điểm ảnh. Tốt hơn nữa: tính sẵn mặt nạ và dáng **lúc build** (`build.py`), ghi vào JSON |
| V8 | **Vừa** | Phòng đông hoặc máy yếu | Ở CPU ×4–×6, mỗi khung 150–600 ms và game chạy chậm như quay chậm | `engine.js frame`: tối đa 5 bước/khung, `acc` tối đa 0,1 s | Sau khi sửa V1–V3: thêm chế độ chất lượng tự động (FPS dưới 40 trong 3 giây thì giảm hạt `fx`, tắt vành sáng `G.VFX.vien`, giảm `parts`), ghi nhớ vào bản lưu |
| V9 | **Vừa** | Tải lại / Safari đẩy tab ra khỏi bộ nhớ giữa ải | Mất cả lượt ải đang chơi, quay về màn chào (tiến trình trước ải còn) | Không lưu trạng thái lượt chơi | Lưu gọn `{ r, i, phòng đã dọn, máu, mana }` khi qua cửa phòng. Khi mở lại thì hỏi "Chơi tiếp ải?". Quan trọng vì V2 làm Safari dễ tải lại trang |
| V10 | **Thấp** | `sw.js` | Mỗi lần mở trang, SW `cache.put` lại toàn bộ 26 MB (trang + tệp ảnh), dù tệp ảnh không đổi | Network-first và không kiểm có sẵn chưa | Với `linh-khi-anh.*.json` (tên có hash, không đổi): dùng cache-first, có rồi thì không `put` lại |
| V11 | **Thấp** | `<head>` có `<link>` Google Fonts chặn vẽ | Mạng chặn Google (một số trường học, công ty, Trung Quốc) thì phải chờ hết thời gian chờ mới vẽ. [SUY] | `index.html` dòng 15 | Thêm `media="print" onload="this.media='all'"` hoặc tự host phông chữ |

## 8. Top 5 việc nên sửa trước

1. **V1:** Bỏ dựng thân bằng code (`veKhung`/`ghepHinh`) khi quái đã có ảnh AI, và dùng lại `butGia`. Đã đo: FPS trùm tăng gấp 1,3–4 lần. Sửa ít dòng mà lợi lớn nhất.
2. **V2 + V5:** Đặt ngân sách bộ nhớ canvas chung có LRU. Nhuộm theo khung thay cho cả tờ sprite. Xoá cache quái/trùm khi rời ải. Mục tiêu: canvas sống ổn định dưới khoảng 20 Mpx sau 10 phút.
3. **V3:** Xử lý tệp ảnh tải sau mà không làm đứng game: bỏ nhịp xoá cache 400 ms, giải mã ngoài luồng chính, mỗi khung giới hạn vài hình.
4. **V4:** Giảm dung lượng: WebP lossless, ảnh thành tệp rời, tách ảnh trùm và dáng pha theo vùng. Đưa trang chính về dưới 1,5 MB nén.
5. **V6 + V9:** Ngừng vẽ liên tục khi tạm dừng hoặc ở bảng (đỡ pin, đỡ nóng máy), và lưu lượt ải đang chơi để Safari tải lại trang không làm mất ải.

## Tệp đo (trong `scratchpad/tester-3/`)

- `srv.py`: máy chủ giống Firebase. `tai.py` / `tai.json`: tải trang.
- `khung.py` / `khung.json`: FPS theo cảnh × CPU. `prof_*.cpuprofile`: profile CDP (mở được bằng Chrome DevTools). `prof.py`: tóm tắt profile.
- `exp.py` / `expA.json` / `expB.json`: thử A/B cho V1.
- `bonho.py` / `bonho.json`: chơi 10 phút, lấy mẫu bộ nhớ.
- `onDinh.py` / `onDinh.json`: ẩn trang, xoay màn hình, chặn tệp ảnh, lưu/tải. `xoay2.py`: thử xoay thêm.
- `repo/`: bản sao để build hai tệp. `site/`: thư mục phục vụ.
