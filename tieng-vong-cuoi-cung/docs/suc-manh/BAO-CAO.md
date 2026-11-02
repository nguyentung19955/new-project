# Báo cáo – Sức mạnh hiện lên người Kiếm Khách (02/11)

## Tóm tắt dễ hiểu
- Đã làm xong **bộ khung** để sau này đồ/sức mạnh hiện lên người nhân vật: mặt nạ nứt sáng dần, ấn trên giáp, dải vải sau lưng, chuông đeo hông… Mỗi thứ là một "lớp" ảnh vẽ chồng đúng từng khung animation.
- **Chưa có ảnh nào** nên mọi lớp đang **tắt**: nhân vật trong phòng demo và Vùng 1 **y hệt trước** (đã so từng điểm ảnh – giống 100%, và không tải thêm file nào).
- **Chưa hỏi được ChatGPT**: lần chạy này chạy trên mây theo lịch, không có Chrome. Câu hỏi đã soạn sẵn; phiên gen ảnh cặp (có Chrome) sẽ hỏi trước (yêu cầu 001) rồi mới vẽ. Thiết kế hiện là **bản nháp**.

## Đã làm
| Việc | Ở đâu |
|---|---|
| Hệ thống lớp trang bị (lớp phủ từng khung + kiểu gắn điểm neo; trước/sau thân; lật, loé trắng, mờ khớp thân) | `game/thu-mat-na/lop-trang-bi.js` |
| Dữ liệu 6 lớp + 4 cấp sức mạnh (nháp), mọi lớp `co_anh: false` | `game/thu-mat-na/trang-bi.json` |
| Gắn vào phòng demo + Vùng 1 (mỗi nơi vài dòng, có `if`) | `game/phong-demo/index.html`, `game/vung-1/{index.html,nap.js,ve.js}` |
| Cầu nối hệ thống đồ (phiên "do"): cấp theo `MocHeThong.ht.capSucManh()`, Âm Phù đang cắm → lớp (mặc định tắt) | trong `lop-trang-bi.js` |
| Kiểm thử Playwright 21 mục | `tools/suc-manh/kiem-thu-lop.js` |
| Công cụ kiểm ảnh lớp cho phiên gen ảnh | `tools/suc-manh/kiem-anh-lop.py` |
| Thiết kế nháp + nghiên cứu + câu hỏi ChatGPT | `docs/suc-manh/thiet-ke.md`, `cau-hoi-chatgpt.md` |
| Yêu cầu ảnh 001–005 + HET | `docs/yeu-cau-anh/sucmanh/` |

## Kiểm thử
- `tools/suc-manh/kiem-thu-lop.js`: **TẤT CẢ ĐẠT** – mặc định giống hệt từng điểm ảnh (6/6 lần chụp), 0 lỗi JS, 0 yêu cầu ảnh lớp; với lớp thử (chỉ trong kiểm thử, không ghi ảnh vào repo) lớp vẽ đúng khung/neo/lật/cỡ ở dung, troi, nhay, don1, don2, don4; clip thiếu ảnh → lớp ẩn; gỡ lớp, cấp theo tiến độ, chỉ số cộng dồn, kiểu neo, lưu, cầu nối hệ thống đồ đều đúng.
- Phép thử Vùng 1 cũ: kiem-thu-f 66/66, kiem-thu-g hỏng 0, kiem-thu-h hỏng 0, kiem-tra-vung1 đi hết P01→P12, không thiếu hình.

## Còn chờ
1. Phiên gen ảnh hỏi ChatGPT (001) → `docs/suc-manh/tu-van-chatgpt.txt`; sửa thiet-ke.md/trang-bi.json theo đó.
2. Ảnh lớp 002–005. Khi XONG: ghi `"co_anh": true` cho lớp đó → chạy kiểm thử → thử `phong-demo/index.html?trangbi=mat-na-nut-1`.
3. Thống nhất với phiên "do": cấp sức mạnh lấy từ đâu (`tu_dong_cap`), Âm Phù nào hiện lớp nào (`theo_am_phu`); chỉ số để phiên "do" lo.
