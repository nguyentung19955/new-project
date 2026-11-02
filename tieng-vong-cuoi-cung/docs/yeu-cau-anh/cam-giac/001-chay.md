# 001 – Kiếm Khách – chu kỳ CHẠY nhiều khung hơn (P0, phiên CẢM GIÁC CHƠI)
- **Trạng thái:** ĐÃ CÓ ẢNH – ĐÃ KIỂM – **CHỜ NGƯỜI DÙNG DUYỆT**. Phiên chính đã vẽ `art/kiem-khach/chay-moi/` (bản 3: 8 khung, động tác rõ hơn, chân ngắn lại) (xem `001-chay-PHIEN-CHINH.md`), nên KHÔNG cần vẽ thêm. Khi người dùng đồng ý → ghi `DUYỆT` vào đây, phiên lắp làm theo mục "Lắp" bên dưới.
- **Vì sao cần:** clip chạy cũ chỉ 8 hình × 80 ms = 12,5 hình/giây, chân trượt nhiều so với quãng đường (1 vòng 8 hình = 161 px màn, mà chân trụ chỉ lùi ~6 px/hình). Mã đã đổi sang chọn hình theo QUÃNG ĐƯỜNG (`quang_chu_ky` = 120 px/vòng → 8 hình ≈ 16,7 hình/giây khi chạy hết tốc). Bản mới vẽ rõ từng tư thế chân (chạm đất, hạ người, lướt qua, bay) → chuyển động liền hơn, ít trượt hơn.

## Kết quả kiểm ảnh chay-moi (phiên cảm giác, 02/11 – bản 3, 8 khung)
- Ô 256×256, đáy chân y=170–171 (khớp neo [128,172] của bản cũ), thân giữa x≈123–125 (lệch ≤ 2 điểm ảnh giữa các khung – không nhảy ngang). Khung bay (f03, f07) đáy 163–165 = nhún có chủ ý, giữ nguyên.
- Thiết kế giữ đúng Kiếm Khách (mặt nạ, tóc đuôi ngựa, 2 kiếm băng, áo tối vạch xanh).
- **Cần làm khi lắp:** ảnh ChatGPT có ~1.500–1.700 màu (bản cũ 20 màu) và 0–19 điểm viền hồng magenta mỗi khung → ép về bảng 20 màu của `chay/` + `dung/`, bỏ điểm hồng (như `tools/muot-2/lap-clip.py → chuan_mau`; không vẽ thêm, không nội suy). Đã thử ép bản 1: sạch, không mất chi tiết.
- Lớp sức mạnh (vết nứt mặt nạ…) có điểm neo đo cho khung cũ → khi lắp đo lại neo `troi` bằng `tools/suc-manh/do-neo.py`.

## Xem thử trên iPhone (chưa bật mặc định)
Mở `https://tieng-vong-cuoi-cun.web.app/game/lang-chuong/?chay=moi` một lần (máy nhớ lựa chọn; Vùng 1/2 cũng dùng). Bản xem thử đọc thẳng `art/kiem-khach/chay-moi/` (tự đếm số khung, nên luôn là bản mới nhất phiên chính vẽ; chưa ép màu). `?chay=cu` = quay lại bản cũ.

## Lắp (khi trạng thái ghi DUYỆT)
1. Ép màu `chay-moi/fNN.png` (như trên) rồi chép vào `art/kiem-khach/chay/` (giữ bản cũ ở `chay-cu/`).
2. `game/thu-mat-na/nhan-vat.json → clip.troi`: `so_hinh` = số khung mới, giữ `quang_chu_ky: 120`, xoá `ban_thu`.
3. Đo lại neo lớp sức mạnh cho `troi`; chạy `node tools/cam-giac/kiem-thu.js`, `tools/suc-manh/kiem-thu-lop.js`.

## Nếu người dùng muốn vẽ lại thay vì dùng bản này (dự phòng)
- **Ảnh tham chiếu:** ghép ngang 8 khung `art/kiem-khach/chay/f00–f07` cắt cửa sổ (x0=80, y0=90, rộng 90, cao 90), phóng ×3 nearest, nền #FF00FF.
- **Prompt (tiếng Anh, ngắn):**
  ```
  Same character, same pixel size and palette as this run strip. Draw a smoother RUN CYCLE of 12 frames (side view, facing right), feet on one ground line, body centre fixed, crisp pixel art, flat #FF00FF background, no text, nothing cut off.
  ```
- **Lưu:** `art/kiem-khach/chay-moi/fNN.png` (256×256 RGBA, chân [128,172]) + `nguon-chatgpt.png`, rồi ghi `XONG`.
