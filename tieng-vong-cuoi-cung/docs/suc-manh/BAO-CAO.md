# Báo cáo – Sức mạnh hiện lên người Kiếm Khách (cập nhật 02/11, lượt 3)

## Lượt 3 (02/11 chiều)
- **Đã đo điểm neo** mặt nạ / ngực / hông / lưng cho TỪNG KHUNG của 11 clip (Idle, Run, Jump, Fall, Land, Dash, Hurt, don1–don4) → `game/thu-mat-na/neo-kiem-khach.json`, công cụ đo `tools/suc-manh/do-neo.py` (tự dò vệt mắt xanh trên mặt nạ, đã xem ảnh kiểm từng khung, sửa tay 1 khung; khung don4 mặt nạ bị tay/kiếm che (f02–f04) ghi null → lớp mặt nạ tự ẩn ở đó).
- Hệ thống lớp đọc được tệp neo: chuông hông lấy điểm `hong`, dải vải lấy điểm `lung` – phiên gen ảnh không phải đo nữa; lớp mặt nạ tự ẩn ở khung mặt nạ bị che. Tệp chỉ tải khi có lớp đã bật (mặc định không tải gì).
- **Yêu cầu ảnh 002 viết lại cho phiên chính vẽ:** P0 "First Resonance" = vết nứt mặt nạ cho **Idle 4 + Run 8 = 12 ảnh** 256×256 nền trong suốt, kèm toạ độ mặt nạ từng khung, cỡ vết nứt, màu, đường dẫn lưu. 004/005 ghi rõ điểm neo đã đo sẵn.
- Chữ trong game đều tiếng Anh (tên tầng/lớp trong trang-bi.json đã là tiếng Anh).
- Kiểm thử `tools/suc-manh/kiem-thu-lop.js`: **33/33 ĐẠT** (thêm: mặc định không tải tệp neo; ẩn khi bị che; điểm hông đặt đúng; tệp neo đủ 10 clip × 4 điểm). Phép thử Vùng 1 kiem-thu-f vẫn đạt. Mọi lớp vẫn TẮT – nhân vật y hệt.

---
(Lượt 2 bên dưới)

## Tóm tắt dễ hiểu
- Lượt này đã có **tư vấn ChatGPT** (phiên chính hỏi hộ) → thiết kế đã **chốt theo ChatGPT**: 4 tầng ngoại hình
  **The Veiled One → First Resonance → Bellbound Soul → The Last Reverberation**. Thứ tự dấu hiệu: mặt nạ nứt sáng → ấn chuông ở ngực → dải vải bạc sau lưng. Thêm 1 phụ kiện riêng: **chuông Echo Charm đeo hông**.
- Mở tầng theo **cờ cốt truyện** (ChatGPT dặn): Level 1 tự mở khi đã hạ trùm Vùng 1 (cờ có sẵn). Level 2/3 chờ 2 cờ mới để phiên cốt truyện ghi sau.
- **Vẫn chưa có ảnh nào** → mọi lớp **tắt**, nhân vật trong phòng demo và Vùng 1 **y hệt trước** (so từng điểm ảnh: giống 100%, không tải thêm file).
- Lượt này không có Chrome nên không tự gen ảnh/hỏi thêm ChatGPT được; yêu cầu ảnh đã viết lại theo đúng tư vấn để phiên gen ảnh cặp làm.

## Đã làm lượt này
| Việc | Ở đâu |
|---|---|
| Thiết kế chốt theo ChatGPT (tầng, cỡ đọc được, bảng màu, số khung, thứ tự vẽ, vệt kiếm 3 tier, chỉ số) | `docs/suc-manh/thiet-ke.md` |
| Dữ liệu: tên/điều kiện 4 tầng theo cờ, lớp `an-chuong-nguc` (thay an-giap), dải vải + chuông chuyển sang kiểu neo nhiều tư thế, bảng màu | `game/thu-mat-na/trang-bi.json` |
| Tính năng mới trong hệ thống lớp (theo ChatGPT): mở cấp theo cờ cốt truyện (`theo_co_truyen`), "thở" sáng khi đứng (`tho`), giảm sáng khi trúng đòn (`alpha_clip`), ẩn phụ kiện khi lướt (`an_clip`), chọn tư thế ảnh theo clip (`hinh_theo_clip`) – chỉ đổi độ trong/vị trí/chọn ảnh, không vẽ gì bằng code | `game/thu-mat-na/lop-trang-bi.js` |
| Kiểm thử thêm 7 mục cho các tính năng trên | `tools/suc-manh/kiem-thu-lop.js` |
| Yêu cầu ảnh viết lại: 001 XONG; 002 mặt nạ nứt (P0: 4 khung đứng trước, kèm prompt ChatGPT); 003 ấn chuông ngực; 004 dải vải 4 tư thế; 005 chuông 3 tư thế; HET | `docs/yeu-cau-anh/sucmanh/` |

## Kiểm thử
- `tools/suc-manh/kiem-thu-lop.js`: **28/28 ĐẠT** (mặc định giống hệt từng điểm ảnh 6/6, 0 lỗi JS, 0 tải ảnh lớp; lớp thử khớp khung/neo/lật; cờ cốt truyện → cấp; thở sáng; giảm sáng; ẩn khi lướt; tư thế theo clip).
- Phép thử Vùng 1: kiem-thu-f 66/66, kiem-thu-h hỏng 0, kiem-tra-vung1 đi P01→P12 không thiếu hình (chỉ báo 1 phông chữ/mạng ngoài không tải được trên máy mây – không liên quan).
- Không sửa engine chung (dong-co-mn.js, sprite-mn.js, ve-chieu-quai.js).

## Còn chờ / gửi các phiên khác
1. **Phiên gen ảnh sucmanh:** vẽ theo thứ tự 002 (mat-na-nut-1, 4 khung đứng trước) → 003 → 005 → 004. Ảnh XONG thì ghi `"co_anh": true` và chạy kiểm thử.
2. **Phiên cốt truyện (cottruyen):** khi làm tới Echoing Library / nghi thức ký ức ở Mirror Lake, ghi cờ `tien_hoa:bellbound` và `tien_hoa:last-reverberation` bằng `LuuChung.datCo(...)` – nhân vật sẽ tự lên Level 2/3.
3. **Phiên hệ thống đồ (do):** ChatGPT khuyên KHÔNG lấy tầng ngoại hình theo số nút kỹ năng → `tu_dong_cap` để tắt. Khi chốt mẫu Âm Phù "Echo Charm", ghi vào `theo_am_phu` để chuông hông hiện. Chỉ số gắn mốc lớn là việc của phiên "do".
