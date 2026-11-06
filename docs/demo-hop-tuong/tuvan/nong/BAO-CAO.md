# Vì sao chơi game làm nóng iPhone — đo, sửa, đo lại

Ảnh người dùng: `docs/demo-hop-tuong/thap-art/tuvan/nong_may_tran.png` (SOLO wave 13, ~12 ụ đa số Mana Core "19/50", hàng nhện tím + 2 bọ tinh anh).

## Cách đo

- Công cụ: `tools/thap-kt-nong.js` (Playwright Chromium + CDP, mô tả máy **iPhone 13**: 390×844, DPR 3, cảm ứng).
  WebKit không cài được trong máy kiểm (tải bị chặn) → chỉ đo Chromium. Safari trên iPhone vẽ canvas 2D phần lớn bằng CPU
  nên các nguyên nhân dưới đây giống nhau; con số tuyệt đối trên iPhone sẽ nhỏ hơn (máy kiểm chậm hơn iPhone nhiều).
- Trận chuẩn: bắt đầu wave 13, bàn 12 ụ (9 Mana Core sao 1–3 + Liên thanh, Pháo, Băng), chạy **3 phút** (tới wave 20),
  SOLO và CO-OP (2 bàn). Thêm: màn HOME đứng yên 10 s, trận **tạm dừng** 8 s.
- Đo: thời gian CPU mỗi khung (CDP `TaskDuration`), JS, GC, vết 6 s (trace), số lệnh vẽ mỗi khung, cỡ canvas, số vòng
  `requestAnimationFrame`, mạng trong trận, hoạt ảnh CSS đang chạy. Kết quả thô: `do_truoc.json`, `do_sau.json`, `do_sau_dpr3.json`.

## Nguyên nhân chính (nói dễ hiểu)

| # | Nguyên nhân | Số đo (trước) |
|---|---|---|
| 1 | **Mỗi khung hình vẽ lại cả tấm nền sàn** (996×1992 điểm ảnh, phóng 2×→3× có lọc mịn) dù nền không đổi | ≈ **45 %** thời gian vẽ (bỏ thử: 40 → 22 ms/khung) |
| 2 | Canvas trận luôn ở **độ nét 3×** (≈ 2 triệu điểm ảnh) kể cả khi máy đã gồng | 3× → 2×: 40 → 11 ms/khung |
| 3 | **Ở HOME / màn menu vẫn vẽ canvas trận 60 lần/giây** (tô kín màn bằng 1 màu, không ai thấy) | HOME: **995 ms CPU mỗi giây** (gần 1 lõi chạy hết sức) |
| 4 | **Tạm dừng vẫn vẽ lại 60 lần/giây** dù hình đứng yên | 997 ms CPU mỗi giây |
| 5 | **3 vòng `requestAnimationFrame` song song** (trận + số mana HUD + nút chat; online thêm vòng canh mạng — chạy mãi cả sau trận) | 3 vòng/khung |
| 6 | Tấm đếm "19/50" trên mỗi Mana Core: mỗi khung **đo chữ + viền chữ + tô chữ** lại cho từng ụ | 9 fillText + 9 strokeText + 18 measureText mỗi khung (CO-OP: 20/20/37) |
| 7 | Bộ tải ảnh nền (ảnh menu) vẫn có thể chạy/giải mã trong lúc đánh | (máy kiểm: đã tải xong trước trận; trên điện thoại mạng chậm thì trùng trận) |

Không phải nguyên nhân (đã kiểm): `shadowBlur` = 0 lần/khung; hạt hiệu ứng đã có trần (320) và dùng lại đối tượng;
GC chỉ ~0,1 ms/khung; không có hoạt ảnh CSS chạy dưới trận; DOM HUD chỉ đổi ~0,4 lần/khung; mạng trong trận chỉ 10 ảnh
hiệu ứng tải lần đầu (vòng nạp, băng vỡ). 44 lần vẽ cộng sáng (`lighter`)/khung là ảnh PNG có sẵn — giữ nguyên để không mất hiệu ứng.

## Đã sửa

1. **Nền tĩnh tách ra 1 lớp riêng** (`#cv-nen`, dựng 1 lần). Canvas trận trong suốt: mỗi khung chỉ xoá + vẽ vật động. (render.js)
2. **Độ nét thích ứng**: vẫn bắt đầu **3× (nét như cũ)**; nếu máy gồng (khung > 21,7 ms suốt 4 s, hoặc JS > 11 ms) → tự xuống 2×.
   Trước đây chỉ xét thời gian JS nên Safari (vẽ ngoài JS) không bao giờ xuống dù máy nóng. Khoá 30 Hz đều của
   "Nguồn điện thấp" không bị tính là gồng (không mờ oan). Đang kéo/ghép: không đổi giữa chừng. (render.js `doKhung`)
3. **1 vòng `requestAnimationFrame` duy nhất** (ui.js): mana HUD, nút chat, canh online chạy chung qua `UI.moiKhung`.
   **Trần 60 khung/giây** (màn 120 Hz bỏ khung thừa). **Tạm dừng: vẽ 10 lần/giây. HOME/menu: không vẽ canvas.** Tab ẩn: trình duyệt tự dừng.
4. **Cài đặt POWER SAVE (tiết kiệm pin)** (Settings, mặc định TẮT): 30 khung/giây, canvas ≤ 2×, nửa số hạt hiệu ứng.
   **Tự gợi ý 1 lần** khi trận nặng kéo dài ~20 s (tấm nhỏ "Phone getting warm?" + TURN ON / NO, tự ẩn sau 10 s). (js/tietkiem.js, css/tietkiem.css)
5. **Tấm đếm "19/50" dựng sẵn thành ảnh**, chỉ dựng lại khi số đổi; đặt đúng lưới điểm ảnh nên chữ nét y như cũ. (demkn.js)
6. **Bộ tải ảnh nền nghỉ khi đang đánh** (tải tiếp khi tạm dừng / về menu). (taitai.js `dangDanh`)
7. Bộ đếm HUD 4 lần/giây nghỉ khi ngoài trận / tab ẩn. (hudb.js)
- Áp dụng mọi chế độ: SOLO, CO-OP (2 bàn), PVP, ONLINE, Test range (cùng vòng lặp + REN).
- Giữ độ nét: lọc ảnh vẫn `high`; ảnh/khung không đổi; so sánh ảnh chụp trước/sau cùng 3×: `soSanh_solo.jpg`, `soSanh_coop.jpg`, phóng to: `soSanh_*_phongto.png`; gợi ý tiết kiệm pin: `tietkiem_goiy.jpg`.
- Không làm: hồ chứa đối tượng cho đạn/hạt (đã có sẵn, GC không đáng kể); thay `shadowBlur` (không dùng).

## Trước / sau (cùng trận chuẩn, 3 phút, iPhone 13 giả lập)

CPU mỗi khung (ms) — càng thấp càng mát:

| | Trước | Sau (mặc định: 3×, tự xuống 2× khi gồng) | Sau, ép giữ 3× suốt trận |
|---|---|---|---|
| SOLO | 42,3 / 40,6 (2 lần đo) | **16,4 (−61 %)** | 25,6 (−38 %) |
| CO-OP 2 bàn | 53,8 / 55,5 | **19,1 (−65 %)** | 39,1 (−28 %) |
| Khung hình/giây máy kiểm (SOLO) | 24 | **56** | 39 |
| HOME đứng yên (ms CPU mỗi giây) | 995 | 165–370 | — |
| Trận tạm dừng (ms CPU mỗi giây) | 997 | 158 | 285 |
| Vòng rAF mỗi khung | 3 | **1** | 1 |
| fillText / measureText mỗi khung (SOLO) | 9 / 18 | 0,1 / 0,1 | 0,1 / 0,1 |

Ghi chú: máy kiểm chậm hơn iPhone nên "trước" chỉ được 24 khung/giây (đã chạy kín 1 lõi). Trên iPhone khung hình luôn
khoá 60, nên **ít việc hơn mỗi khung = máy mát hơn**. Đo dao động ±10–20 % giữa các lần chạy.
Kéo-ghép (tools/thap-kt-muotghep.js, CPU chậm 4×): p95 khung 23,7 → 23,4 ms, khung > 33 ms: 16 → 10 — vẫn mượt.

## Kiểm hồi quy

- `tools/thap-kt-nong.js` chạy trong `tools/thap-kt-hoiquy.js` (bước "nong", trận SOLO 45 s): **TRƯỢT nếu CPU/khung > mốc × 1,35**
  (mốc `tools/thap-kt-nong-moc.json` = 19,3 ms → ngưỡng 26,1 ms; bản cũ đo 40–42 ms sẽ trượt). Ghi lại mốc: `MOC=1`.
- Chạy riêng: `NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nong.js` (`CHE=solo,coop,pvp`, `GIAY=180`, `DPR_THUC=1` ép 3×).

## Nếu vẫn nóng

Bật **Settings → POWER SAVE: ON** (30 khung/giây, 2×). Phần còn lại khó giảm thêm mà không mất hình: hiệu ứng cộng sáng
của đạn sao/vòng nạp (44 lần/khung SOLO, 87 CO-OP) và nhạc tổng hợp WebAudio (chạy trên luồng âm thanh, máy kiểm không đo được).

## Thêm (06/11): "chơi 1 lúc bằng 4G là máy nóng" — đo MẠNG trong trận

Sóng di động (4G) tốn pin và toả nhiệt mỗi lần phải bật lên gửi/nhận; sau mỗi gói tin nó còn thức thêm vài giây.
Nên trong trận SOLO, game phải gần như **không dùng mạng**.

Cách đo: `tools/thap-kt-mang.js` — máy chủ tĩnh giống GitHub Pages (max-age 600 + ETag), bản xuất bản thật
(đã chạy `thap-ver.py`: ảnh .webp, ?v=băm), iPhone 13 giả lập, CDP Network + đếm byte ở máy chủ. Pha: mở game 20 s · HOME đứng yên 60 s ·
20 s đầu trận SOLO · trận SOLO tự chơi 120 s (wave 11 → 13) · tải lại trang.

| Pha | Yêu cầu thật qua mạng | Dữ liệu |
|---|---|---|
| Mở game lần đầu (20 s) | 703 tệp | **24 MB** (tải hết ảnh menu + nạp nền) |
| HOME đứng yên 60 s | 0 | 0 |
| Vào trận SOLO (20 s đầu) | 52 tệp | 3,6 MB (ảnh trận; 3 tấm trùm `trum_*_8.png` còn là PNG ~850 KB mỗi tấm) |
| **Trong trận SOLO, 120 s** | **0 / phút** | **0 KB / phút** |
| Mở lại trang (bộ đệm còn) | 8 tệp | 1,6 MB |

Đã kiểm, không có: hỏi ver.json lặp lại (chỉ 1 lần lúc mở), tải lại ảnh có ?v= mỗi lần, fetch/XHR lặp, nhạc tải từ mạng
(nhạc tự tổng hợp WebAudio, không có tệp âm thanh), thống kê/analytics. Bộ tải nền đã nghỉ khi đang đánh (sửa ở trên).
Ở lần chạy đầu có vài ảnh hiệu ứng tải lúc đang đánh (`vong_nap_3..7.png`, ~90 KB, 1 lần) — phiên "tải 1 lần" (service worker,
nạp hết lúc mở) sẽ xử lý.

**Nguyên nhân mạng còn lại: kết nối Firebase (online) mở SUỐT phiên**, kể cả khi chơi SOLO một mình: 1,5 s sau khi vào menu
game tải SDK Firebase, đăng nhập khách và mở WebSocket tới máy chủ (nghe `.info/connected`, giờ máy chủ). Kết nối này gửi gói
giữ kết nối định kỳ (~45 s/lần) và nối lại mỗi khi mạng chập chờn → sóng 4G bị đánh thức liên tục suốt trận.
(Máy kiểm không vào được máy chủ Firebase thật nên không đo được byte; kiểm bằng Firebase giả trong trang.)

**Sửa** (`js/online/net.js`): đang đánh trận KHÔNG online (SOLO, CO-OP/PVP với máy, Test range) hoặc app bị ẩn mà không ở phòng
online → `goOffline()` (đóng WebSocket); về menu / mở lại app → `goOnline()`. Ghi thành tích cuối trận lúc đang ngắt được
Firebase xếp hàng, nối lại thì tự gửi. Phòng / trận ONLINE không bị ảnh hưởng.
Kiểm: `tools/thap-kt-mang.js` (trong hồi quy, bước "mang") — TRƯỢT nếu trận SOLO > 1 yêu cầu/phút hoặc > 8 KB/phút, có WebSocket/tên miền
ngoài trong SOLO, hoặc Firebase không ngắt khi đánh / không nối lại ở menu. Số liệu: `mang_ban_xuat.json`.

Gợi ý thêm cho người chơi 4G: lần mở đầu tải ~24 MB — mở game bằng Wi-Fi 1 lần rồi chơi 4G sẽ đỡ hơn nhiều.
