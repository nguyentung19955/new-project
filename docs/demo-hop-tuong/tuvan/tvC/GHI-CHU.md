# Tư vấn C — hệ thiết kế §A + màn B1 B3 B4 B5 B6 B13–B18 (TU-VAN-TOAN-BO.txt)

Ảnh: `truoc/` (trước khi sửa, commit aeed752) và `sau/` — 320×700, 360×780, 390×844, 430×932, DPR 3.
Kiểm: `node tools/thap-kt-tvc.js` (chữ < 13 px logic ≈ 12 px ở màn 390, lỗi trang) — trước 115 loại, sau 0.
`node tools/thap-kt-tran.js` — 0 lỗi.

## Đã làm
- `thap/css/tvc.css`: token màu §A2 (các token cũ --m-* / --c-* trỏ về đây), cỡ chữ §A5, khoảng cách §A4, 4 họ tấm A/B/C/D (biến --vl-*), chuyển động 180–240 ms.
- HOME: dải chế độ chỉ còn biểu tượng + tên + ▼; PLAY trội hơn DECK/COLLECTION; bộ bài thiếu → ảnh nút tắt + "Choose N more turrets".
- GAME MODE: 4 thẻ cao, mỗi chế độ 1 câu phân biệt (CO-OP/PVP = máy, ONLINE = phòng bạn bè qua mã).
- SETTINGS: hàng nhãn · thanh · % · ON/OFF, bỏ khung lồng.
- FILTER: chip lưới đều, nút "SHOW N TURRETS". PRESETS: LOAD/IN USE bên phải, 5 ụ, 1 dòng.
- Trang ụ: cùng khuôn mọi độ hiếm; nhịp dài có nhãn riêng ("Hole interval 9.5s", "Charge time", "Volleys"…); ô số họ C (yên).
- Trang chỉ huy: huy hiệu lớn hơn, 3 ô Mana cost / Cooldown / Duration, vai trò 1 dòng, "Skill preview".
- Sảnh CO-OP: chạm mã = chép; hàng người chơi họ B, sẵn sàng = họ A sáng.
- Trùm đầu trận: ô nhỏ họ C, tên dài xuống dòng (không thu < 13 px), "Auto-start in Ns".
- Kết quả: 3 ô số (trùm · kỷ lục · tim); THUA: "Fell at", "WHAT BROKE THROUGH / WHAT HAPPENED", "FIX FOR NEXT RUN", nền đỏ tiết chế.

## Còn chờ ảnh §E (chưa về tới lúc xong: E01 E02 E03 E04 E05 E06 E14 E15 E16 E32 E33 E34 E35 E36 E37 E38 E39 E40 E41 E46 E47 E48)
1. `python3 tools/thap-cat-tvc.py` → `thap/assets/tv_*.png` (khoá magenta, tách khối, ≤ 3×).
2. Đổi biến trong `thap/css/tvc.css` :root: `--vl-b-hang` → tv_tam_yen (E01) / `--vl-a-sang` → tv_tam_bat (E02), `--vl-a` → tv_nut1 (E03), `--vl-b` → tv_nut2 (E04), `--vl-d` → tv_bang (E05) …
3. E32: `HM.ICHE = { solo: 'tv_ic_solo', coop: 'tv_ic_coop', pvp: 'tv_ic_pvp', online: 'tv_ic_online' }` (js/home.js).
