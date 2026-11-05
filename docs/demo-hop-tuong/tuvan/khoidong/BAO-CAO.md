# Khởi động chậm — "sao mới đầu vào 0% lâu vậy" (báo cáo đo + sửa)

Ngày 2026-11-05. Đo bằng `tools/thap-do-khoidong.js` (Playwright + CDP giả lập mạng, iPhone 390×844 DPR 3, bộ đệm trống
trừ khi ghi "ấm"), máy chủ `tools/thap-may-gzip.js` giống GitHub Pages (HTTP/2 + TLS, gzip html/css/js, max-age 600).
Trang live (github.io) bị chặn từ máy đo này (proxy 403) → đo bản **xuất bản** dựng lại tại chỗ:
TRƯỚC = nhánh `claude/mobile-tower-defense-game-k5oxzo` (bản đang live), SAU = nhánh làm việc + `tools/thap-ver.py`.

Mạng: **Fast 3G** = 1,44 Mbps / RTT 562 ms (≈ 180 KB/s) · **4G** = 9 Mbps / RTT 170 ms.

## 1. Vì sao đứng 0 % lâu

| Nguyên nhân | Chi tiết |
|---|---|
| **Màn tải chỉ có sau 29 css + 3 js đầu** | Màn tải do `taitai.js` dựng — mà trình duyệt chỉ chạy js sau khi tải xong **29 tệp css chặn vẽ** trong `<head>`. Fast 3G: màn đen 6,6 s. |
| **% chỉ tính khi xong CẢ 67 tệp js** | `TAI.napMenu()` gọi trong `UI.init()` — sau 67 js + phông + roster.json. Trước đó thanh luôn 0 %. |
| **Tải 491 tệp / 60,7 MB trước khi vào HOME** | Màn tải menu nạp MỌI thứ: 85 chân dung `pilot_*.png` (35,8 MB, tới 1,5 MB/tấm), 85 icon `nho/*` (4 MB), 3 chân dung chỉ huy `af_*` (3 MB), khay/hiệu ứng/HUD trận (17 MB)… |
| **% đếm theo SỐ tệp, mở 491 ảnh cùng lúc** | Trên HTTP/2 mọi ảnh chia nhau băng thông → tệp đầu tiên xong rất muộn: Fast 3G **105 s** mới lên 1 % (4G: 15,6 s). |
| Ảnh trùng | `the_khung_*` tải 2 lần (có/không `?v=`), `af_*`/HUD tải cả bởi js khác lúc khởi động. |
| Phụ | `ver.json` + `location.reload()` chạy NGAY đầu trang (có thể tải lại giữa màn tải); iframe "Test range" (cả 1 game thứ 2) nạp 1,5 s sau khi menu xong. Firebase SDK vốn đã chỉ tải khi mở ONLINE (không đổi). |

### 20 tệp lớn nhất (bản TRƯỚC, nạp trước HOME)

| tệp | KB |
|---|---|
| assets/khay.png | 1661 |
| assets/pilot_dichchuyen.png | 1490 |
| assets/pilot_nhieusong.png | 1466 |
| assets/pilot_chuato.png | 1453 |
| assets/pilot_doc.png | 1387 |
| assets/pilot_nhanban.png | 1360 |
| assets/pilot_chimang.png | 1292 |
| assets/pilot_overlord.png | 1285 |
| assets/pilot_docton.png | 1207 |
| assets/af_hero.png | 1046 |
| assets/af_dahlia.png | 1045 |
| assets/af_eve.png | 1032 |
| assets/pilot_cuuvi.png | 743 |
| assets/pilot_phun.png | 729 |
| assets/pilot_pandora.png | 684 |
| assets/cf_hut.png | 600 |
| assets/hero/home_af_hero.webp | 452 |
| assets/cf_vong_ren.png | 431 |
| assets/pilot_hutmana.png | 376 |
| assets/pilot_radar.png | 376 |

Theo nhóm (trước HOME): pilot_* 85 tệp 35,8 MB · ảnh khác 222 tệp 17,4 MB · nho/* 85 tệp 4,0 MB · af_* 3 tệp 3,1 MB · js 67 tệp 0,44 MB (gzip) · css 29 tệp 0,08 MB.

## 2. Đã sửa

1. **Màn tải hiện ngay từ HTML**: `index.html` có sẵn `<div id="tai">` + CSS nội tuyến nhỏ + `preload` ảnh màn tải
   (khung thanh 9 KB, dải đầy 5 KB, nền, logo). Mọi css/js của game nằm trong `<template id="tm-nap">`, được đoạn
   script cuối trang nạp: css song song (không chặn vẽ) → js song song, chạy đúng thứ tự; giữ nghĩa "DOMContentLoaded =
   mọi script đã chạy" (readyState báo `loading` tới khi script cuối chạy rồi phát lại sự kiện).
   **Thêm css/js mới: đặt VÀO TRONG `<template id="tm-nap">`.**
2. **Thanh % theo byte, chạy từ yêu cầu đầu tiên** (`TDO` trong index.html): đợt css/js = 0→20 %, đợt ảnh HOME = 20→100 %;
   số byte từng tệp lấy từ `data-b` / `ANH_B` (thap-ver.py ghi lúc xuất bản) + ước lượng phần đang tải theo băng thông đo được.
3. **HOME trước, phần còn lại sau**: `TAI.dsHome()` lấy đúng ảnh màn HOME đang hiện (CSS + `::before/::after` + `<img>`).
   Phần còn lại của menu (bộ bài, 85 chân dung, bộ sưu tập, HUD trận…) tải **nền** 4 luồng sau khi HOME hiện.
   Bấm nút menu khi đợt nền chưa xong → màn tải (phần còn lại) rồi tự mở (không bao giờ lộ ảnh thiếu). PLAY đủ bộ → vào
   thẳng màn tải trận, trận tự đợi ảnh HUD + chân dung của bộ bài. Ảnh của phần đang ẩn (lưới 85 thẻ, bộ mẫu, ô bộ bài,
   ảnh tĩnh màn bộ bài/HUD trận trong index.html) để ở `data-tm-src` tới khi tải xong (`srcTai()`, `TAI.ganSrc()`).
   Ảnh canvas gọi sớm (`REN.taiAnh`), `KHUNG.tai`, `HUD2.tai` hoãn tới sau HOME (`TAI.hoan`, `TAI.sauHome`).
   Iframe Test range chỉ nạp sau khi đợt nền xong.
4. **Ảnh nén khi xuất bản** (`tools/thap-ver.py`): PNG ≥ 30 KB → thêm bản `.webp` q90 (alpha không mất mát, **cùng số
   điểm ảnh** → giữ luật ≥ 3× của QUY-TAC-HINH; không đụng PNG gốc/ảnh đã cắt lại của phiên độ nét) nếu nhỏ hơn ≤ 60 %:
   664 ảnh, vd `pilot_dichchuyen` 1490 → 213 KB, `khay` 1659 → 200 KB, `af_hero` 1044 → 196 KB. Mọi chỗ dựng URL ảnh
   theo tên đi qua `anhUrl()` (REN, màn tải, `portraitOf`, `iconOf`, khung thẻ, chỉ huy…); CSS/HTML/chuỗi `'assets/x.png'`
   được đổi lúc xuất bản. Máy không đọc được webp → tự về `.png`. So sánh độ nét: `png-vs-webp-q90.png` (phóng 2×).
5. **Kiểm bản mới (ver.json) không còn chạy đầu trang**: `TAI.ktVer()` chạy 1,5 s sau khi HOME hiện, chỉ nạp lại khi
   đang đứng ở HOME (không cắt ngang trận/bảng đang mở).
6. Ảnh nạp 2 lần (khung thẻ, avatar, ic_solo, ui_trieu_ic…) → cùng 1 URL; tải trùng URL dùng chung 1 lời hứa.

Không làm (đề xuất sau): rút gọn (minify) 67 tệp js lúc xuất bản (≈ 440 KB gzip → ~280 KB), gộp js thành 1–2 tệp.

## 3. Kết quả (ms từ lúc mở trang)

| | màn tải hiện | % đầu tiên > 0 | 50 % | HOME bấm được | byte trước HOME |
|---|---|---|---|---|---|
| TRƯỚC · Fast 3G lạnh | 6 563 | **105 172** | 312 997 | **360 227** (6 phút) | 60,7 MB / 491 tệp |
| SAU · Fast 3G lạnh | 721 | **1 360** | 13 677 | **19 436** | 2,09 MB / 143 tệp |
| TRƯỚC · 4G lạnh | 1 278 | 15 597 | 52 996 | 59 912 | 60,7 MB |
| SAU · 4G lạnh | 333 | 563 | 2 068 | **3 135** | 2,19 MB |
| TRƯỚC · 4G ấm | 275 | 911 | 5 585 | 11 366 | 9,7 MB (bộ đệm không giữ hết 60 MB) |
| SAU · 4G ấm | 276 | 276 | 589 | **625** | 0,02 MB |

Mục tiêu: % đầu < 1,5 s trên Fast 3G → **ĐẠT (1,36 s)**. HOME < 6 s trên Fast 3G → **CHƯA ĐẠT (19,4 s)**: phần cần cho HOME
còn ≈ 2,1 MB (js 0,44 MB, ảnh chỉ huy HOME 0,45 MB, nền HOME 0,2 MB, nền màn tải 0,2 MB, khung/nút…) — ở 180 KB/s riêng
băng thông đã ≈ 12 s. 4G lạnh 3,1 s, 4G ấm 0,6 s (< 1,5 s → ĐẠT).

Ảnh dòng thời gian (Fast 3G): `truoc-dongthoigian.png` (110 s vẫn 0 %), `sau-dongthoigian.png` (1 s đã có thanh, 21 s HOME).

## 4. Kiểm

- `tools/thap-kt-khoidong.js` (4G lạnh): bấm DECK ngay khi HOME hiện → hiện màn tải, mở bộ bài đủ ảnh (0 ảnh hỏng);
  bấm PLAY ngay ở HOME → trận chạy, `REN.thieu` = 0, `TAI.thieu` = 0, 0 lỗi 4xx/trang → XANH.
- `tools/thap-kt-hoiquy.js` 4 cỡ: 2 lỗi "chữ tràn" ở cut-in chỉ huy lúc đang trượt ra (chụp giữa hoạt ảnh) — chạy lại
  `CHI=solo` 360+390 → XANH (bản gốc cũng XANH) → lỗi chập chờn theo thời điểm chụp, không do khởi động.
