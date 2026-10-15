# Công cụ đo độ mượt (chạy offline, không mở game)

Chạy trong thư mục này (cần Python 3 + Pillow + numpy, Node):

1. `cd ../../../../../game/js && node <đường dẫn tới>/dur.js heoCon heoNanh ... > <đây>/dur.json` — lấy thời lượng cử động của monster_art.js (đã có sẵn dur.json, so.json).
2. `python3 phan_tich.py` → so_lieu.json (cỡ khung, lệch chân, giật vòng lặp, khung trắng, khung/giây của quái, trùm, Cu Tí, 166 hiệu ứng).
3. `python3 noi.py` → noi.json (độ "bật" khi đổi động tác).
4. `python3 tong_hop.py ..` → xem-muot.png, noi-dong-tac.png, khung-trang-trum.png.
5. `python3 gifs.py ..` → các gif-*.gif (mô phỏng nhịp bằng dữ liệu dong_tac + nhịp code; bên trái HIỆN TẠI, bên phải ĐỀ XUẤT).
