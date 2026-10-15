# Công cụ đo độ mượt (chạy offline, không mở game)

Chạy trong thư mục này (cần Python 3 + Pillow + numpy, Node):

1. `cd ../../../../../game/js && node <đường dẫn tới>/dur.js heoCon heoNanh ... > <đây>/dur.json` — lấy thời lượng cử động của monster_art.js (đã có sẵn dur.json, so.json).
2. `python3 phan_tich.py` → so_lieu.json (cỡ khung, lệch chân, giật vòng lặp, khung trắng, khung/giây của quái, trùm, Cu Tí, 166 hiệu ứng).
3. `python3 noi.py` → noi.json (độ "bật" khi đổi động tác).
4. `python3 tong_hop.py ..` → xem-muot.png, noi-dong-tac.png, khung-trang-trum.png.
5. `python3 gifs.py ..` → các gif-*.gif (mô phỏng nhịp bằng dữ liệu dong_tac + nhịp code; bên trái HIỆN TẠI, bên phải ĐỀ XUẤT).

Phiên 1 "Quái động mượt" (chạy CODE GAME THẬT trong Node qua `game/tests/node_trang.js`, canvas giả, không trình duyệt):

6. `python3 xem_phien_1.py ..` → ../xem-phien-1.gif + ../xem-phien-1.json. Mỗi cảnh chạy hai lần cùng hạt ngẫu nhiên: trái = 7 cờ phiên 1 tắt (như trước), phải = mặc định. `phien1_ghi.js` ghi hàng / cột ảnh mà `G.art.enemy` thật sự vẽ mỗi lượt tính. Thêm `IN=1` để in chuỗi khung từng lượt.
7. `python3 quet_phien_1.py > quet-phien-1.txt` → bảng 30 quái (cột đánh đã hiện, đổi khung lúc báo đòn, số lần lật đi↔đứng), cũ / mới.
