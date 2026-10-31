# Nâng cấp kỹ năng – nhân vật Mặt Nạ Trắng

Mỗi đòn có **3 cấp**. Mới có đòn chỉ ở cấp 1: hiệu ứng nhỏ, màu xanh đậm, tầm ngắn. Muốn lên cấp phải **đi tới giai đoạn mới** (hạ boss vùng) rồi mang Đồng Cổ về Thợ Rèn Hòn ở Làng Chuông. Đạt cấp 3 mới có đủ tầm và hiệu ứng như ảnh gốc.

| Cấp | Tên | Hiệu ứng hình | Tầm | Sát thương |
| --- | --- | --- | --- | --- |
| 1 | Sơ Âm | 50% kích thước, màu xanh ngọc, không lõi trắng | 50% | ×1.0 |
| 2 | Vang Âm | 75% kích thước, xanh lơ sáng | 75% | ×1.3 |
| 3 | Cộng Hưởng | 100%, lõi trắng viền tím, thêm hiệu ứng phụ | 100% | ×1.7 |

## Điều kiện mở từng đòn

| Đòn | Cấp 1 | Cấp 2 (cần) | Cấp 3 (cần) | Hiệu ứng phụ ở cấp 3 |
| --- | --- | --- | --- | --- |
| Đòn 1 – Tiếng Gầm Sóng Âm | Có sẵn | Hạ Mẹ Nấm Mốc (Rễ Mục) + 3 Đồng Cổ | Hạ Người Thủ Thư Không Đầu (Thư Viện Vang) + 8 Đồng Cổ | Đẩy lùi địch và làm choáng 0,5 giây |
| Đòn 2 – Lưỡi Liềm | Có sẵn | Hạ Cỗ Máy Đúc Chuông (Xưởng Đồng) + 3 Đồng Cổ | Hạ Tích Tắc (Tổ Sắt) + 8 Đồng Cổ | Vòng cung chém cả phía sau lưng |
| Đòn 3 – Sóng Trồi Từ Đất | Có sẵn | Hạ Bà Mẹ Ve Sầu (Tán Gió) + 3 Đồng Cổ | Hạ Thần Điểu Sấm (Đỉnh Sấm) + 8 Đồng Cổ | Hất tung địch lên trời, cột sóng phá được sàn mỏng |
| Đánh trên không – Quét Xuống | Mở khi tới Tổ Sắt | Hạ Tích Tắc (Tổ Sắt) + 3 Đồng Cổ | Hạ Kha (Hồ Ngầm Phản Chiếu) + 8 Đồng Cổ | Chạm đất tạo sóng lan hai bên |

## Quy tắc

- Không bỏ qua cấp: phải có cấp 2 mới lên cấp 3.
- Cấp hiện tại hiện bằng số vạch sáng trên khe mặt nạ (1/2/3 vạch) khi đánh.
- Hình hiệu ứng từng cấp nằm ở `art/mat-na/fx-cap/<đòn>/cap1|cap2|cap3/` (xNN = chỉ hiệu ứng, cNN = ghép với nhân vật).
- Cấp 1 và 2 được tạo tự động từ hình cấp 3: thu nhỏ quanh điểm phát (tay, mặt đất); mỗi cấp một bảng màu riêng (xanh ngọc / xanh lơ / trắng tím).
