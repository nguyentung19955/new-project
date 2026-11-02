# 001 – Kiếm Khách – chu kỳ CHẠY nhiều khung hơn (P0, phiên CẢM GIÁC CHƠI)
- **Trạng thái:** ĐÃ CÓ ẢNH – ĐÃ KIỂM – **CHỜ NGƯỜI DÙNG DUYỆT**. Phiên chính đang vẽ cùng người dùng `art/kiem-khach/chay-moi/` (đến 17:40 là bản 8.2: 8 khung, chân/màu bản 7 + tóc bay) (xem `001-chay-PHIEN-CHINH.md`), nên KHÔNG cần vẽ thêm. Khi người dùng đồng ý → ghi `DUYỆT` vào đây, phiên lắp làm theo mục "Lắp" bên dưới.
- **Vì sao cần:** clip chạy cũ chỉ 8 hình × 80 ms = 12,5 hình/giây, chân trượt nhiều so với quãng đường (1 vòng 8 hình = 161 px màn, mà chân trụ chỉ lùi ~6 px/hình). Mã đã đổi sang chọn hình theo QUÃNG ĐƯỜNG (`quang_chu_ky` = 120 px/vòng → 8 hình ≈ 16,7 hình/giây khi chạy hết tốc). Bản mới vẽ rõ từng tư thế chân (chạm đất, hạ người, lướt qua, bay) → chuyển động liền hơn, ít trượt hơn.

## Kết quả kiểm ảnh chay-moi (phiên cảm giác – lần kiểm cuối 17:40, bản 8.2, 8 khung)
- Thân giữa x=124–125 mọi khung (không nhảy ngang), giữ đúng thiết kế Kiếm Khách, gần như không còn điểm hồng (0–1/khung).
- **⚠ CHÂN LƠ LỬNG:** đáy chân thấp nhất mỗi khung ở y=159–166, trong khi neo đất của game là 172 (bản cũ và bản 4 đều 171). Lắp nguyên như vậy thì nhân vật chạy **cách mặt đất 6–13 điểm ảnh (≈ 8–17 px trên màn)**. Khi lắp phải dời mỗi khung xuống cho khung chạm đất có đáy = 171 (khung bay giữ độ nhún tương đối), hoặc xin phiên chính căn lại.
- ~1.350–1.430 màu (bản cũ 20 màu) → nên ép về bảng màu gốc khi lắp (như `tools/muot-2/lap-clip.py → chuan_mau`).
- Phiên chính gợi ý 110 ms/khung. Game nay đổi khung theo QUÃNG ĐƯỜNG: muốn ≈110 ms/khung khi chạy hết tốc (4,2 px/bước) thì đặt `quang_chu_ky` ≈ 220 (8 khung × 27,7 px); hiện để 120 (≈ 60 ms/khung, chân ít trượt hơn). Nên cho người dùng xem thử cả hai.
- Lớp sức mạnh (vết nứt mặt nạ…) có điểm neo đo cho khung cũ → khi lắp đo lại neo `troi` bằng `tools/suc-manh/do-neo.py`.

## Xem thử trên iPhone (chưa bật mặc định)
Mở `https://tieng-vong-cuoi-cun.web.app/game/lang-chuong/?chay=moi` một lần (máy nhớ lựa chọn; Vùng 1/2 cũng dùng). Bản xem thử đọc thẳng `art/kiem-khach/chay-moi/` (tự đếm số khung, nên luôn là bản mới nhất phiên chính vẽ; chưa ép màu). `?chay=cu` = quay lại bản cũ.

## Lắp (khi trạng thái ghi DUYỆT)
1. Căn đáy chân về 171 + ép màu `chay-moi/fNN.png` (như trên) rồi chép vào `art/kiem-khach/chay/` (giữ bản cũ ở `chay-cu/`).
2. `game/thu-mat-na/nhan-vat.json → clip.troi`: `so_hinh` = số khung mới, giữ `quang_chu_ky: 120`, xoá `ban_thu`.
3. Đo lại neo lớp sức mạnh cho `troi`; chạy `node tools/cam-giac/kiem-thu.js`, `tools/suc-manh/kiem-thu-lop.js`.

## Nếu người dùng muốn vẽ lại thay vì dùng bản này (dự phòng)
- **Ảnh tham chiếu:** ghép ngang 8 khung `art/kiem-khach/chay/f00–f07` cắt cửa sổ (x0=80, y0=90, rộng 90, cao 90), phóng ×3 nearest, nền #FF00FF.
- **Prompt (tiếng Anh, ngắn):**
  ```
  Same character, same pixel size and palette as this run strip. Draw a smoother RUN CYCLE of 12 frames (side view, facing right), feet on one ground line, body centre fixed, crisp pixel art, flat #FF00FF background, no text, nothing cut off.
  ```
- **Lưu:** `art/kiem-khach/chay-moi/fNN.png` (256×256 RGBA, chân [128,172]) + `nguon-chatgpt.png`, rồi ghi `XONG`.
