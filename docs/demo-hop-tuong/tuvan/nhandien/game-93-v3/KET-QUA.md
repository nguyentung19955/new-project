# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo
Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **46.5 px CSS** = 140 px điểm ảnh. Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.
Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.
- Số ụ: 93 · IoU hình bóng trung bình mọi cặp: **0.72** (1.0 = cùng hình bóng)
- Cặp điểm ≥ 0.8: **155** · ≥ 0.70: 1251

## 30 cặp dễ nhầm nhất

| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |
|---|---|---|---|---|---|
| 1 | Bộ Trộn (`tron`) | Đèn Săn Thưởng (`santhuong`) | 0.90 | 0.88 | 0.92 |
| 2 | Bộ Trộn (`tron`) | Thánh Địa (`thanhdia`) | 0.89 | 0.88 | 0.89 |
| 3 | Pháo Năng Lượng (`nangluong`) | Pháo Ngôi Sao (`ngoisao`) | 0.89 | 0.87 | 0.90 |
| 4 | Bộ Trộn (`tron`) | Bão Tuyết (`baotuyet`) | 0.88 | 0.91 | 0.86 |
| 5 | Máy Khiên (`khien`) | Thánh Địa (`thanhdia`) | 0.88 | 0.84 | 0.91 |
| 6 | Bộ Trộn (`tron`) | Máy Khiên (`khien`) | 0.88 | 0.90 | 0.86 |
| 7 | Bão Tuyết (`baotuyet`) | Máy Khiên (`khien`) | 0.87 | 0.90 | 0.85 |
| 8 | Bão Tuyết (`baotuyet`) | Chuỗi Liên Kết (`lienket`) | 0.87 | 0.92 | 0.83 |
| 9 | Pháo Thanh Tẩy (`aten`) | Thánh Địa (`thanhdia`) | 0.87 | 0.83 | 0.90 |
| 10 | Máy Tẩy Lỗi (`taylo`) | Đèn Săn Thưởng (`santhuong`) | 0.87 | 0.89 | 0.85 |
| 11 | Hợp Xướng Lượng Tử (`hopca`) | Kho Lưu Hợp Nhất (`luutru`) | 0.87 | 0.81 | 0.91 |
| 12 | Máy Dựng Tường (`wallgen`) | Hợp Xướng Lượng Tử (`hopca`) | 0.87 | 0.86 | 0.88 |
| 13 | Bão Tuyết (`baotuyet`) | Thánh Địa (`thanhdia`) | 0.87 | 0.85 | 0.88 |
| 14 | Pháo May Rủi (`xucxac`) | Thánh Địa (`thanhdia`) | 0.86 | 0.83 | 0.89 |
| 15 | Súng Hạ Sao (`hasao`) | Pháo Ngôi Sao (`ngoisao`) | 0.86 | 0.91 | 0.83 |
| 16 | Băng (`bang`) | Máy Khiên (`khien`) | 0.86 | 0.87 | 0.85 |
| 17 | Hộp Bí Ẩn (`hopbi`) | Máy Sao Chép (`saochep`) | 0.86 | 0.87 | 0.85 |
| 18 | Máy Sao Chép (`saochep`) | Lõi Combo (`combo`) | 0.86 | 0.89 | 0.83 |
| 19 | Máy Tẩy Lỗi (`taylo`) | Máy Khiên (`khien`) | 0.86 | 0.85 | 0.86 |
| 20 | Bão Tuyết (`baotuyet`) | Súng Bão (`bao`) | 0.85 | 0.87 | 0.84 |
| 21 | Súng Lục (`sungluc`) | Pháo Ngôi Sao (`ngoisao`) | 0.85 | 0.81 | 0.89 |
| 22 | Máy Khiên (`khien`) | Đèn Săn Thưởng (`santhuong`) | 0.85 | 0.86 | 0.85 |
| 23 | Máy Xáo Trộn (`xaotron`) | Hợp Xướng Lượng Tử (`hopca`) | 0.85 | 0.82 | 0.88 |
| 24 | Pháo May Rủi (`xucxac`) | Máy Khiên (`khien`) | 0.85 | 0.79 | 0.90 |
| 25 | Đèn Săn Thưởng (`santhuong`) | Thánh Địa (`thanhdia`) | 0.85 | 0.83 | 0.86 |
| 26 | Pháo Năng Lượng (`nangluong`) | Máy Khiên (`khien`) | 0.85 | 0.87 | 0.83 |
| 27 | Pháo Năng Lượng (`nangluong`) | Thánh Địa (`thanhdia`) | 0.85 | 0.83 | 0.86 |
| 28 | Chuỗi Liên Kết (`lienket`) | Máy Khiên (`khien`) | 0.85 | 0.88 | 0.82 |
| 29 | Súng Bão (`bao`) | Sói Máy (`soi`) | 0.85 | 0.84 | 0.85 |
| 30 | Bộ Trộn (`tron`) | Pháo Thanh Tẩy (`aten`) | 0.85 | 0.82 | 0.87 |

## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)

| Ụ | Bậc | Giống nhất với | Điểm |
|---|---|---|---|
| Bộ Trộn (`tron`) | xanh | Đèn Săn Thưởng | 0.90 |
| Đèn Săn Thưởng (`santhuong`) | tim | Bộ Trộn | 0.90 |
| Pháo Năng Lượng (`nangluong`) | xanh | Pháo Ngôi Sao | 0.89 |
| Pháo Ngôi Sao (`ngoisao`) | vang | Pháo Năng Lượng | 0.89 |
| Thánh Địa (`thanhdia`) | vang | Bộ Trộn | 0.89 |
| Bão Tuyết (`baotuyet`) | tim | Bộ Trộn | 0.88 |
| Máy Khiên (`khien`) | tim | Thánh Địa | 0.88 |
| Chuỗi Liên Kết (`lienket`) | tim | Bão Tuyết | 0.87 |
| Pháo Thanh Tẩy (`aten`) | vang | Thánh Địa | 0.87 |
| Máy Tẩy Lỗi (`taylo`) | tim | Đèn Săn Thưởng | 0.87 |
| Hợp Xướng Lượng Tử (`hopca`) | vang | Kho Lưu Hợp Nhất | 0.87 |
| Kho Lưu Hợp Nhất (`luutru`) | vang | Hợp Xướng Lượng Tử | 0.87 |
| Máy Dựng Tường (`wallgen`) | vang | Hợp Xướng Lượng Tử | 0.87 |
| Pháo May Rủi (`xucxac`) | trang | Thánh Địa | 0.86 |
| Súng Hạ Sao (`hasao`) | vang | Pháo Ngôi Sao | 0.86 |
| Băng (`bang`) | trang | Máy Khiên | 0.86 |
| Hộp Bí Ẩn (`hopbi`) | tim | Máy Sao Chép | 0.86 |
| Máy Sao Chép (`saochep`) | vang | Hộp Bí Ẩn | 0.86 |
| Lõi Combo (`combo`) | tim | Máy Sao Chép | 0.86 |
| Súng Bão (`bao`) | tim | Bão Tuyết | 0.85 |
| Súng Lục (`sungluc`) | trang | Pháo Ngôi Sao | 0.85 |
| Máy Xáo Trộn (`xaotron`) | tim | Hợp Xướng Lượng Tử | 0.85 |
| Sói Máy (`soi`) | vang | Súng Bão | 0.85 |
| Lưới Cộng Hưởng (`luoicheo`) | vang | Hộp Bí Ẩn | 0.85 |
| Độc (`doc`) | trang | Thánh Địa | 0.84 |

## Ảnh để xem

- `BANG-MAU.png` — 93 ụ màu, cỡ thật
- `BANG-XAM.png` — 93 ụ xám (bỏ màu)
- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)
- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau
