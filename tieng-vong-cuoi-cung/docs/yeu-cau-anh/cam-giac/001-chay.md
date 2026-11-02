# 001 – Kiếm Khách – chu kỳ CHẠY nhiều khung hơn (P0, phiên CẢM GIÁC CHƠI)
- **Trạng thái:** ĐÃ CÓ ẢNH – ĐÃ KIỂM – **CHỜ NGƯỜI DÙNG DUYỆT**. Phiên chính đã vẽ trước 10 khung `art/kiem-khach/chay-moi/f00–f09.png` (xem `001-chay-PHIEN-CHINH.md`), nên KHÔNG cần vẽ thêm. Khi người dùng đồng ý → ghi `DUYỆT` vào đây, phiên lắp làm theo mục "Lắp" bên dưới.
- **Vì sao cần:** clip chạy cũ chỉ 8 hình × 80 ms = 12,5 hình/giây, chân trượt nhiều so với quãng đường (1 vòng 8 hình = 161 px màn, mà chân trụ chỉ lùi ~6 px/hình). Mã đã đổi sang chọn hình theo QUÃNG ĐƯỜNG (`quang_chu_ky` = 120 px/vòng → 8 hình ≈ 16,7 hình/giây khi chạy hết tốc). Với 10 hình mới: 20 hình/giây, chân trượt ít hơn.

## Kết quả kiểm ảnh chay-moi (phiên cảm giác, 02/11)
- 10 khung, ô 256×256, đáy chân y=171 (khớp bản cũ, neo [128,172]), thân giữa x≈124–125 (lệch ≤ 1 điểm ảnh giữa các khung – không nhảy ngang). Khung bay (f04, f08) đáy 166 – đúng ý ChatGPT (nhún), giữ nguyên.
- Thiết kế giữ đúng Kiếm Khách (mặt nạ, tóc đuôi ngựa, 2 kiếm băng, áo tối vạch xanh) – so ảnh ghép với 8 khung cũ.
- **Cần làm khi lắp:** ảnh ChatGPT có ~1.700–1.950 màu (bản cũ 20 màu) và 10–34 điểm viền hồng magenta ở chân mỗi khung. Phải ép về bảng màu 20 màu của `chay/` + `dung/` và bỏ điểm hồng (giống `tools/muot-2/lap-clip.py → chuan_mau`, không vẽ thêm, không nội suy). Bản đã ép sẵn để xem thử: `art/kiem-khach/chay-moi-thu/` (không còn điểm hồng, tối đa 20 màu).
- Lớp sức mạnh (vết nứt mặt nạ…) chỉ có điểm neo cho 8 khung cũ → với khung 8–9 lớp tự ẩn. Khi lắp: đo lại neo `troi` bằng `tools/suc-manh/do-neo.py` cho 10 khung.

## Xem thử trên iPhone (chưa bật mặc định)
Mở `https://tieng-vong-cuoi-cun.web.app/game/lang-chuong/?chay=moi` một lần (máy nhớ lựa chọn; vào Vùng 1/2 cũng dùng bản mới). `?chay=cu` = quay lại bản cũ.

## Lắp (khi trạng thái ghi DUYỆT)
1. Chép `art/kiem-khach/chay-moi-thu/f00–f09.png` vào `art/kiem-khach/chay/` (giữ bản cũ ở `chay-cu/` để quay lại được).
2. `game/thu-mat-na/nhan-vat.json → clip.troi`: `so_hinh: 10`, giữ `quang_chu_ky: 120`, xoá `ban_thu`.
3. Đo lại neo lớp sức mạnh cho `troi`; chạy `node tools/cam-giac/kiem-thu.js`, `tools/suc-manh/kiem-thu-lop.js`.

## Nếu người dùng muốn vẽ lại thay vì dùng bản này (dự phòng)
- **Ảnh tham chiếu:** ghép ngang 8 khung `art/kiem-khach/chay/f00–f07` cắt cửa sổ (x0=80, y0=90, rộng 90, cao 90), phóng ×3 nearest, nền #FF00FF.
- **Prompt (tiếng Anh, ngắn):**
  ```
  Same character, same pixel size and palette as this run strip. Draw a smoother RUN CYCLE of 12 frames (side view, facing right), feet on one ground line, body centre fixed, crisp pixel art, flat #FF00FF background, no text, nothing cut off.
  ```
- **Lưu:** `art/kiem-khach/chay-moi/fNN.png` (256×256 RGBA, chân [128,172]) + `nguon-chatgpt.png`, rồi ghi `XONG`.
