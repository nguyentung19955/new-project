# Script và số đo của Đợt 4

Các tệp ở đây là bản ghi lại cách kiểm, không phải mã của game.

| Tệp | Là gì |
|---|---|
| `khoi-bang-mau.js` | Khối mã "BẢNG MÀU LINH KHÍ" đã chèn giống hệt vào 7 trang `tools/tach-*/index.html`. |
| `va.py` | Script đã dùng một lần để chèn khối đó và các móc nối vào 7 trang. Không chạy lại được trên trang đã chèn. |
| `ve_bang_mau.py` | Vẽ `docs/vfx/bang-mau-loi.png` từ `bang-mau.json`. |
| `ve_mau.py` | Vẽ 2 vật thể thử (rương, bàn thờ) bằng màu trong bảng và dựng tấm ảnh giả ảnh ChatGPT (`../anh/tam-thu-dau-vao.png`). |
| `ve_tam_kiem.py` | Dựng tấm ảnh thử cho 6 trang còn lại. |
| `kiem-prompt.js` | Mở 7 trang, gom lỗi console, so prompt của mọi lô với bản trước đợt 4. Kết quả: `so-do-prompt.json`, `prompt-vi-du.md`. |
| `kiem-phong.js` | Chạy tấm thử qua Tách Phòng ở bản cũ, "Tự do", "Theo bảng". Kết quả: `so-do-tach-phong.json`. |
| `kiem-6.js` | Làm như trên cho 6 trang còn lại. Kết quả: `so-do-6-trang.json`. |
| `ve_so_sanh.py` | Dựng `../anh/so-sanh.png` và đo mức giữ chi tiết (`giu-chi-tiet.json`). |
| `chup.js` | Chụp ô chọn "Giảm màu" và phần kết quả kiểm trên màn hình cỡ điện thoại. |

Cách chạy lúc kiểm: bản mới phục vụ ở cổng 8801 (`python3 -m http.server 8801` tại gốc repo), bản trước đợt 4 (commit `d4bf1c2f`, là bản mới nhất của nhánh ngay trước khi gộp phần Đợt 4) ở cổng 8802 từ một bản sao tạm của repo. Chromium và Playwright có sẵn trên máy chạy.
