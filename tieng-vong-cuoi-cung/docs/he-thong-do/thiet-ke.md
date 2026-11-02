# Thiết kế Hệ thống đồ / animation mở khoá – BẢN NHÁP (chưa có tư vấn ChatGPT)

> ⚠ Lần chạy 02/11 không có Chrome nên **chưa hỏi được ChatGPT**. Đây là bản nháp dựa trên GDD (mục 6, 7, 9) để dựng khung code; mọi con số và danh sách mở khoá **sẽ sửa theo tư vấn ChatGPT** (câu hỏi soạn sẵn: cau-hoi-chatgpt.md). Vì vậy hệ thống để **TẮT mặc định** trong Vùng 1.

## Vòng lặp (theo GDD mục 9)
| Tầng | Người chơi làm | Nhận |
|---|---|---|
| Ngắn (30 s–2 ph) | Hạ quái, vượt phòng | Mảnh Âm (có sẵn) + **Âm Điểm** |
| Trung (30–90 ph) | Hạ tinh anh/trùm, tìm bí mật | Lên cấp → **Nốt Ngân** → mở nút cây **Dây Ngân**; tinh anh/trùm rơi **Âm Phù** |
| Dài (tuần) | Săn Âm Phù độ hiếm cao, tôi luyện dòng phụ | Âm Phù Huyền Thoại / Vọng Cổ, hình ảnh mở khoá |

## Đã dựng (game/he-thong/)
- Âm Điểm: quái thường 4 · tinh anh 40 · trùm 150 · bí mật 25; 12 mốc cấp, mỗi cấp +1 Nốt.
- Cây Dây Ngân 3 nhánh (Lưỡi / Vọng / Thân), 8 nút. Nút dùng hình đã có chạy được ngay: Rèn Vang Âm, Rèn Cộng Hưởng (dùng 3 cấp kiếm sẵn trong nhan-vat.json), +15% Mảnh Âm, +20% Âm Điểm, +8 khung bất tử.
- Nút cần hình mới (ghi "Chờ hình", không bấm được tới khi có ảnh): **Nhát Thứ Năm** (don5), **Vệt Ngân Sáng**, **Dáng Kiếm Khách Thức Tỉnh**.
- Âm Phù: 5 mẫu, 4 độ hiếm (Thường 1 dòng phụ / Hiếm 2 / Huyền Thoại 3 / Vọng Cổ 3, chỉ sau trùm), 5 loại dòng phụ, Dây Ngân 3 ô. Chỉ tinh anh/trùm/rương rơi. **Chưa bật rơi** vì chưa có biểu tượng + khung độ hiếm do ChatGPT vẽ.
- Lưu riêng (localStorage `tvcc-he-thong`), không đổi bản lưu Vùng 1.

## Chưa làm (chờ tư vấn + ảnh)
Túi đồ có biểu tượng, tôi luyện ở Thợ Rèn, ô Dây Ngân theo Mảnh Ký Ức, hiệu ứng "hồi máu nhanh" và "vệt kiếm" (cần cách vẽ), giao diện khung do ChatGPT vẽ thay khung chữ.

## Phối hợp phiên "sucmanh"
Phiên này lo kiếm/quản lý/mở khoá; phiên sucmanh hiển thị lên người. API: `MocHeThong.ht.trangBiDangDung()` (Âm Phù đang cắm: mẫu + độ hiếm), `capSucManh()` (0–3 theo số nút đã mở – tạm), `chiSo()`.
