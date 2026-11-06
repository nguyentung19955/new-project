# Một màn tải duy nhất (07/11/2026)

Người dùng (iPhone): "đã vào game rồi, bấm màn khác lại vẫn load game".

**Vì sao:** màn tải đầu chỉ tải ảnh của HOME, phần còn lại (bộ bài, bộ sưu tập, HUD trận, quái, hiệu ứng…) tải ngầm.
Bấm DECK / COLLECTION / PLAY khi phần ngầm chưa xong → hiện lại màn LOADING / LOADING BATTLE.

**Giờ:**
- Màn tải đầu tải + giải mã HẾT: menu, bộ bài, bộ sưu tập, 85 chân dung, HUD trận, quái, hiệu ứng, bộ bài đã lưu, chân dung mọi chỉ huy;
  ảnh trùm tải về máy trong màn tải, giải mã ngầm sau. Ảnh của các ụ khác tải thô (không giữ bộ nhớ) vào bộ đệm.
- Sau màn tải đầu: không màn nào hiện màn tải (SOLO, CO-OP, PVP, ONLINE, trang ụ). Vào trận: ảnh thiếu (ụ khác / bàn máy) giải mã
  từ máy ≤ 1,2 s, bàn vẫn hiện, không che màn.
- Service Worker `thap/sw.js`: tệp `?v=băm` lấy từ máy; index.html mạng trước; bản mới → chỉ tệp đổi tải lại, bản cũ bị xoá.
  Lần mở sau (cùng bản, đã tải đủ): chỉ đợi ảnh HOME, phần còn lại giải mã ngầm từ máy.

**Đo** (Playwright Chromium, iPhone 13 390×844 DPR 3, máy chủ giới hạn băng thông chung, HTTP/1.1 — GitHub Pages là HTTP/2 nên còn nhanh hơn):

| | lần đầu | lần 2 |
|---|---|---|
| 4G (9 Mbps, 170 ms) | 29,7 s (21,9 MB) | 0,87 s |
| Fast 3G (1,44 Mbps, 562 ms) | 142,7 s | 1,3 s |
| bản cũ, 4G (chỉ HOME) | 6,3 s (3,4 MB) — rồi mỗi màn lại tải | 0,75 s* |

\* bản cũ: lần 2 chỉ nhanh trong 10 phút (bộ đệm HTTP của GitHub Pages), sau đó hỏi lại mạng từng tệp.

Đi HOME → bộ bài → bộ sưu tập → trang ụ → trận SOLO/CO-OP/PVP → kết quả → bộ bài khác → sảnh online: **0 lần hiện màn tải**
(`do_iphone13.json`, `do_chromium.json`: `taiSauBoot: []`). Cập nhật bản: tải lại 7 tệp / 0,36 MB, bản cũ trong bộ đệm bị xoá.
WebKit không cài được trong máy kiểm (tải trình duyệt bị chặn) → dùng Chromium giả iPhone 13.
