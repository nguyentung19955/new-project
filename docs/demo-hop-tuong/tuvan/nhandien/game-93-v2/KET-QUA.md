# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo
Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **46.5 px CSS** = 140 px điểm ảnh. Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.
Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.
- Số ụ: 93 · IoU hình bóng trung bình mọi cặp: **0.72** (1.0 = cùng hình bóng)
- Cặp điểm ≥ 0.8: **186** · ≥ 0.70: 1299

## 30 cặp dễ nhầm nhất

| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |
|---|---|---|---|---|---|
| 1 | Bão Tuyết (`baotuyet`) | Máy Tẩy Lỗi (`taylo`) | 0.92 | 0.90 | 0.93 |
| 2 | Pháo Ngôi Sao (`ngoisao`) | Kẻ Nguyền (`nguyenrua`) | 0.90 | 0.90 | 0.90 |
| 3 | Máy Tẩy Lỗi (`taylo`) | Máy Khiên (`khien`) | 0.89 | 0.88 | 0.89 |
| 4 | Băng (`bang`) | Máy Khiên (`khien`) | 0.88 | 0.87 | 0.89 |
| 5 | Bộ Trộn (`tron`) | Thánh Địa (`thanhdia`) | 0.88 | 0.87 | 0.90 |
| 6 | Bộ Trộn (`tron`) | Máy Khiên (`khien`) | 0.88 | 0.90 | 0.86 |
| 7 | Máy Khiên (`khien`) | Thánh Địa (`thanhdia`) | 0.88 | 0.84 | 0.91 |
| 8 | Bộ Trộn (`tron`) | Bão Tuyết (`baotuyet`) | 0.88 | 0.91 | 0.85 |
| 9 | Bộ Trộn (`tron`) | Máy Tẩy Lỗi (`taylo`) | 0.88 | 0.89 | 0.87 |
| 10 | Pháo Thanh Tẩy (`aten`) | Thánh Địa (`thanhdia`) | 0.88 | 0.85 | 0.90 |
| 11 | Hợp Xướng Lượng Tử (`hopca`) | Kho Lưu Hợp Nhất (`luutru`) | 0.87 | 0.83 | 0.91 |
| 12 | Bão Tuyết (`baotuyet`) | Máy Khiên (`khien`) | 0.87 | 0.90 | 0.85 |
| 13 | Chuỗi Liên Kết (`lienket`) | Máy Khiên (`khien`) | 0.87 | 0.89 | 0.85 |
| 14 | Máy Tẩy Lỗi (`taylo`) | Xưởng Anh Hùng (`xuonganh`) | 0.87 | 0.89 | 0.85 |
| 15 | Đèn Săn Thưởng (`santhuong`) | Lửa Thập Tự (`lualien`) | 0.87 | 0.90 | 0.85 |
| 16 | Bão Tuyết (`baotuyet`) | Thánh Địa (`thanhdia`) | 0.87 | 0.85 | 0.88 |
| 17 | Máy Tẩy Lỗi (`taylo`) | Đèn Săn Thưởng (`santhuong`) | 0.87 | 0.90 | 0.84 |
| 18 | Pháo Năng Lượng (`nangluong`) | Máy Khiên (`khien`) | 0.86 | 0.87 | 0.86 |
| 19 | Máy Tẩy Lỗi (`taylo`) | Thánh Địa (`thanhdia`) | 0.86 | 0.82 | 0.90 |
| 20 | Máy Khiên (`khien`) | Súng Bão (`bao`) | 0.86 | 0.85 | 0.88 |
| 21 | Máy Khiên (`khien`) | Đèn Săn Thưởng (`santhuong`) | 0.86 | 0.85 | 0.87 |
| 22 | Bộ Trộn (`tron`) | Đèn Săn Thưởng (`santhuong`) | 0.86 | 0.86 | 0.86 |
| 23 | Pháo May Rủi (`xucxac`) | Thánh Địa (`thanhdia`) | 0.86 | 0.80 | 0.91 |
| 24 | Bão Tuyết (`baotuyet`) | Súng Bão (`bao`) | 0.86 | 0.88 | 0.84 |
| 25 | Đèn Săn Thưởng (`santhuong`) | Thánh Địa (`thanhdia`) | 0.86 | 0.81 | 0.90 |
| 26 | Bão Tuyết (`baotuyet`) | Chuỗi Liên Kết (`lienket`) | 0.86 | 0.90 | 0.83 |
| 27 | Súng Bão (`bao`) | Sói Máy (`soi`) | 0.86 | 0.86 | 0.85 |
| 28 | Máy Khiên (`khien`) | Tháp Ánh Sáng (`anhsang`) | 0.85 | 0.82 | 0.88 |
| 29 | Chuỗi Liên Kết (`lienket`) | Đèn Săn Thưởng (`santhuong`) | 0.85 | 0.85 | 0.85 |
| 30 | Súng Bão (`bao`) | Tháp Ánh Sáng (`anhsang`) | 0.85 | 0.82 | 0.88 |

## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)

| Ụ | Bậc | Giống nhất với | Điểm |
|---|---|---|---|
| Bão Tuyết (`baotuyet`) | tim | Máy Tẩy Lỗi | 0.92 |
| Máy Tẩy Lỗi (`taylo`) | tim | Bão Tuyết | 0.92 |
| Pháo Ngôi Sao (`ngoisao`) | vang | Kẻ Nguyền | 0.90 |
| Kẻ Nguyền (`nguyenrua`) | vang | Pháo Ngôi Sao | 0.90 |
| Máy Khiên (`khien`) | tim | Máy Tẩy Lỗi | 0.89 |
| Băng (`bang`) | trang | Máy Khiên | 0.88 |
| Bộ Trộn (`tron`) | xanh | Thánh Địa | 0.88 |
| Thánh Địa (`thanhdia`) | vang | Bộ Trộn | 0.88 |
| Pháo Thanh Tẩy (`aten`) | vang | Thánh Địa | 0.88 |
| Hợp Xướng Lượng Tử (`hopca`) | vang | Kho Lưu Hợp Nhất | 0.87 |
| Kho Lưu Hợp Nhất (`luutru`) | vang | Hợp Xướng Lượng Tử | 0.87 |
| Chuỗi Liên Kết (`lienket`) | tim | Máy Khiên | 0.87 |
| Xưởng Anh Hùng (`xuonganh`) | vang | Máy Tẩy Lỗi | 0.87 |
| Đèn Săn Thưởng (`santhuong`) | tim | Lửa Thập Tự | 0.87 |
| Lửa Thập Tự (`lualien`) | vang | Đèn Săn Thưởng | 0.87 |
| Pháo Năng Lượng (`nangluong`) | xanh | Máy Khiên | 0.86 |
| Súng Bão (`bao`) | tim | Máy Khiên | 0.86 |
| Pháo May Rủi (`xucxac`) | trang | Thánh Địa | 0.86 |
| Sói Máy (`soi`) | vang | Súng Bão | 0.86 |
| Tháp Ánh Sáng (`anhsang`) | tim | Máy Khiên | 0.85 |
| Máy Dựng Tường (`wallgen`) | vang | Hợp Xướng Lượng Tử | 0.85 |
| Độc (`doc`) | trang | Thánh Địa | 0.85 |
| Hộp Bí Ẩn (`hopbi`) | tim | Máy Sao Chép | 0.85 |
| Máy Sao Chép (`saochep`) | vang | Hộp Bí Ẩn | 0.85 |
| Lưới Cộng Hưởng (`luoicheo`) | vang | Hộp Bí Ẩn | 0.84 |

## Ảnh để xem

- `BANG-MAU.png` — 93 ụ màu, cỡ thật
- `BANG-XAM.png` — 93 ụ xám (bỏ màu)
- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)
- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau
