# 003 – Ấn chuông cổ trên ngực (Level 2) – P2
- **Trạng thái:** XONG (02/11, phiên chính vẽ bằng ChatGPT – 1 tấm nguồn art/kiem-khach-lop/mat-na-nut-1/nguon-chatgpt.png; thu nhỏ về cỡ thật, đặt theo neo-kiem-khach.json, kiem-anh-lop + kiem-thu-lop ĐẠT; co_anh=true)
- **Dùng vào đâu:** Level 2 Bellbound Soul – lớp `an-chuong-nguc` (khe "an", vẽ TRÊN thân). (Đổi tên từ an-giap theo ChatGPT.)
- **Mô tả (ChatGPT):** ấn hình chuông cổ ở ngực, **≥ 6×8 px**, viền đồng xỉn (#9C6B30), lõi ngà lạnh (#E9E4D9), tương phản cao; không dùng rune li ti 1–2 px. Thứ tự clip: dung → chay → nhay → các đòn.
- **Lưu:** `art/kiem-khach-lop/an-chuong-nguc/<clip>/fNN.png` (+ `nguon-chatgpt.png`). Neo [128,172], hướng phải.
- **Quy cách chung (lớp kiểu khung):** mỗi khung 1 PNG RGBA **256×256**, chân nhân vật ở **[128,172]**, quay **PHẢI**, CHỈ chứa phần THÊM (nền trong suốt, không chép lại thân), khớp đúng khung gốc `art/kiem-khach/<clip>/fNN.png` (gửi khung gốc làm tham chiếu). Không sửa pixel nào của thân/mặt nạ/tóc/kiếm gốc, không che mắt. Đúng số khung clip gốc, tên `fNN.png`. Khung cùng tư thế/góc mặt nạ dùng chung ảnh được nếu căn đúng (ChatGPT).
- **Bảng màu lớp mới (ChatGPT):** Ivory #E9E4D9 · Cold Silver #B7C6D2 · Ice Cyan #85D9E8 · Deep Cyan #447E98 · Ancient Bronze #9C6B30 · Bell Gold #D0A45B. Nét pixel sắc, không khử răng cưa.
- **Clip (ChatGPT, 57 vị trí):** dung 4 · chay 8 · nhay 4 · don1 8 · don2 8 · don4 9 · roi 1 · tiepdat 3 · luot 6 · trungdon 6. Clip thiếu → lớp tự ẩn ở clip đó (được phép).
- **Kiểm trước khi ghi XONG:** `python3 tools/suc-manh/kiem-anh-lop.py <id> <thư mục xem ngoài repo>` phải TẤT CẢ ĐẠT; nhìn ảnh ghép: không nhấp nháy, không trượt khỏi chỗ gắn, lật trái đúng.
- **Khi XONG:** ghi kích thước/khung đã có vào file này; bật lớp bằng `"co_anh": true` trong game/thu-mat-na/trang-bi.json rồi chạy `node tools/suc-manh/kiem-thu-lop.js <thư mục xem>` (phiên LÀM, hoặc phiên gen nếu phiên LÀM đã dừng).
