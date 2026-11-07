# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo
Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **46.5 px CSS** = 140 px điểm ảnh. Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.
Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.
- Số ụ: 93 · IoU hình bóng trung bình mọi cặp: **0.71** (1.0 = cùng hình bóng)
- Cặp điểm ≥ 0.8: **213** · ≥ 0.70: 1213

## 30 cặp dễ nhầm nhất

| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |
|---|---|---|---|---|---|
| 1 | Pháo Đồng Bộ (`dongbo`) | Máy Sinh Đôi (`sinhdoi`) | 0.90 | 0.93 | 0.88 |
| 2 | Pháo Đồng Bộ (`dongbo`) | Vệ Tinh (`orbital`) | 0.90 | 0.92 | 0.89 |
| 3 | Máy Sinh Đôi (`sinhdoi`) | Vệ Tinh (`orbital`) | 0.90 | 0.92 | 0.89 |
| 4 | Bão Tuyết (`baotuyet`) | Máy Tẩy Lỗi (`taylo`) | 0.90 | 0.87 | 0.92 |
| 5 | Băng (`bang`) | Máy Khiên (`khien`) | 0.90 | 0.89 | 0.90 |
| 6 | Bộ Trộn (`tron`) | Đèn Săn Thưởng (`santhuong`) | 0.89 | 0.88 | 0.90 |
| 7 | Máy Khiên (`khien`) | Pháo Đồng Bộ (`dongbo`) | 0.89 | 0.87 | 0.91 |
| 8 | Bão Tuyết (`baotuyet`) | Vệ Tinh (`orbital`) | 0.89 | 0.91 | 0.87 |
| 9 | Máy Tẩy Lỗi (`taylo`) | Xưởng Anh Hùng (`xuonganh`) | 0.88 | 0.86 | 0.91 |
| 10 | Máy Khiên (`khien`) | Máy Sinh Đôi (`sinhdoi`) | 0.88 | 0.88 | 0.88 |
| 11 | Bộ Trộn (`tron`) | Thánh Địa (`thanhdia`) | 0.88 | 0.88 | 0.88 |
| 12 | Pháo Đồng Bộ (`dongbo`) | Súng Hạ Sao (`hasao`) | 0.88 | 0.90 | 0.85 |
| 13 | Máy Sinh Đôi (`sinhdoi`) | Đèn Săn Thưởng (`santhuong`) | 0.88 | 0.87 | 0.88 |
| 14 | Bão Tuyết (`baotuyet`) | Máy Sinh Đôi (`sinhdoi`) | 0.87 | 0.92 | 0.83 |
| 15 | Pháo Thanh Tẩy (`aten`) | Thánh Địa (`thanhdia`) | 0.87 | 0.84 | 0.90 |
| 16 | Máy Khiên (`khien`) | Thánh Địa (`thanhdia`) | 0.87 | 0.83 | 0.91 |
| 17 | Bộ Trộn (`tron`) | Bão Tuyết (`baotuyet`) | 0.87 | 0.90 | 0.84 |
| 18 | Bão Tuyết (`baotuyet`) | Máy Khiên (`khien`) | 0.87 | 0.89 | 0.84 |
| 19 | Bão Tuyết (`baotuyet`) | Súng Bão (`bao`) | 0.87 | 0.90 | 0.84 |
| 20 | Bão Tuyết (`baotuyet`) | Pháo Đồng Bộ (`dongbo`) | 0.87 | 0.93 | 0.81 |
| 21 | Pháo Đồng Bộ (`dongbo`) | Đèn Săn Thưởng (`santhuong`) | 0.87 | 0.85 | 0.88 |
| 22 | Bộ Trộn (`tron`) | Máy Khiên (`khien`) | 0.86 | 0.90 | 0.83 |
| 23 | Bão Tuyết (`baotuyet`) | Thánh Địa (`thanhdia`) | 0.86 | 0.84 | 0.88 |
| 24 | Chuỗi Liên Kết (`lienket`) | Máy Sinh Đôi (`sinhdoi`) | 0.86 | 0.89 | 0.84 |
| 25 | Máy Tẩy Lỗi (`taylo`) | Thánh Địa (`thanhdia`) | 0.86 | 0.82 | 0.89 |
| 26 | Máy Sinh Đôi (`sinhdoi`) | Thánh Địa (`thanhdia`) | 0.86 | 0.81 | 0.91 |
| 27 | Máy Sinh Đôi (`sinhdoi`) | Lửa Thập Tự (`lualien`) | 0.86 | 0.83 | 0.88 |
| 28 | Máy Tẩy Lỗi (`taylo`) | Máy Khiên (`khien`) | 0.86 | 0.82 | 0.89 |
| 29 | Hợp Xướng Lượng Tử (`hopca`) | Kho Lưu Hợp Nhất (`luutru`) | 0.86 | 0.82 | 0.89 |
| 30 | Bộ Trộn (`tron`) | Máy Tẩy Lỗi (`taylo`) | 0.86 | 0.87 | 0.84 |

## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)

| Ụ | Bậc | Giống nhất với | Điểm |
|---|---|---|---|
| Pháo Đồng Bộ (`dongbo`) | vang | Máy Sinh Đôi | 0.90 |
| Máy Sinh Đôi (`sinhdoi`) | vang | Pháo Đồng Bộ | 0.90 |
| Vệ Tinh (`orbital`) | vang | Pháo Đồng Bộ | 0.90 |
| Bão Tuyết (`baotuyet`) | tim | Máy Tẩy Lỗi | 0.90 |
| Máy Tẩy Lỗi (`taylo`) | tim | Bão Tuyết | 0.90 |
| Băng (`bang`) | trang | Máy Khiên | 0.90 |
| Máy Khiên (`khien`) | tim | Băng | 0.90 |
| Bộ Trộn (`tron`) | xanh | Đèn Săn Thưởng | 0.89 |
| Đèn Săn Thưởng (`santhuong`) | tim | Bộ Trộn | 0.89 |
| Xưởng Anh Hùng (`xuonganh`) | vang | Máy Tẩy Lỗi | 0.88 |
| Súng Hạ Sao (`hasao`) | vang | Pháo Đồng Bộ | 0.88 |
| Thánh Địa (`thanhdia`) | vang | Bộ Trộn | 0.88 |
| Pháo Thanh Tẩy (`aten`) | vang | Thánh Địa | 0.87 |
| Súng Bão (`bao`) | tim | Bão Tuyết | 0.87 |
| Chuỗi Liên Kết (`lienket`) | tim | Máy Sinh Đôi | 0.86 |
| Lửa Thập Tự (`lualien`) | vang | Máy Sinh Đôi | 0.86 |
| Hợp Xướng Lượng Tử (`hopca`) | vang | Kho Lưu Hợp Nhất | 0.86 |
| Kho Lưu Hợp Nhất (`luutru`) | vang | Hợp Xướng Lượng Tử | 0.86 |
| Độc (`doc`) | trang | Máy Sinh Đôi | 0.85 |
| Ăng-ten Chí Mạng (`chimang`) | xanh | Pháo Đồng Bộ | 0.85 |
| Máy Nhân Mana (`nhanmana`) | xanh | Băng | 0.85 |
| Pháo Ngôi Sao (`ngoisao`) | vang | Máy Sinh Đôi | 0.85 |
| Thấu Kính (`thaukinh`) | tim | Thánh Địa | 0.85 |
| Hộp Bí Ẩn (`hopbi`) | tim | Lưới Cộng Hưởng | 0.84 |
| Lưới Cộng Hưởng (`luoicheo`) | vang | Hộp Bí Ẩn | 0.84 |

## Ảnh để xem

- `BANG-MAU.png` — 93 ụ màu, cỡ thật
- `BANG-XAM.png` — 93 ụ xám (bỏ màu)
- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)
- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau
