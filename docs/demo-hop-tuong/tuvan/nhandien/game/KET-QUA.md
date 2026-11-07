# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo
Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **46.5 px CSS** = 140 px điểm ảnh. Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.
Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.
- Số ụ: 93 · IoU hình bóng trung bình mọi cặp: **0.66** (1.0 = cùng hình bóng)
- Cặp điểm ≥ 0.8: **1430** · ≥ 0.70: 3168

## 30 cặp dễ nhầm nhất

| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |
|---|---|---|---|---|---|
| 1 | Máy Nhân Mana (`nhanmana`) | Thánh Địa (`thanhdia`) | 0.94 | 0.93 | 0.96 |
| 2 | Bộ Trộn (`tron`) | Máy Nhân Bản (`nhanban`) | 0.92 | 0.90 | 0.94 |
| 3 | Bão Tuyết (`baotuyet`) | Bộ Ép Xung (`epxung`) | 0.92 | 0.87 | 0.97 |
| 4 | Pháo Ngôi Sao (`ngoisao`) | Máy Cầu Vồng (`cauvong`) | 0.92 | 0.84 | 0.98 |
| 5 | Laser (`laser`) | Súng Bão (`bao`) | 0.92 | 0.85 | 0.98 |
| 6 | Máy Xáo Trộn (`xaotron`) | Bộ Ép Xung (`epxung`) | 0.92 | 0.86 | 0.96 |
| 7 | Nỏ Năm Nhịp (`no5`) | Súng Bão (`bao`) | 0.92 | 0.88 | 0.95 |
| 8 | Hộp Tiến Hoá (`tienhoa`) | Máy Cầu Vồng (`cauvong`) | 0.92 | 0.86 | 0.97 |
| 9 | Railgun (`railgun`) | Máy Cầu Vồng (`cauvong`) | 0.92 | 0.84 | 0.98 |
| 10 | Kho Lưu Hợp Nhất (`luutru`) | Thánh Địa (`thanhdia`) | 0.92 | 0.86 | 0.96 |
| 11 | Máy Sinh Đôi (`sinhdoi`) | Súng Hạ Sao (`hasao`) | 0.91 | 0.86 | 0.96 |
| 12 | Máy Sao Chép (`saochep`) | Hợp Xướng Lượng Tử (`hopca`) | 0.91 | 0.91 | 0.92 |
| 13 | Súng Cuồng Nộ (`cuongno`) | Chuỗi Liên Kết (`lienket`) | 0.91 | 0.86 | 0.95 |
| 14 | Cửu Vĩ (`cuuvi`) | Cổng Gương (`guongcong`) | 0.91 | 0.86 | 0.95 |
| 15 | Hộp Pandora (`pandora`) | Thánh Địa (`thanhdia`) | 0.91 | 0.88 | 0.94 |
| 16 | Máy Hút Mana (`hutmana`) | Chuỗi Liên Kết (`lienket`) | 0.91 | 0.87 | 0.94 |
| 17 | Máy Hút Mana (`hutmana`) | Súng Cuồng Nộ (`cuongno`) | 0.91 | 0.88 | 0.93 |
| 18 | Vua Ghép (`vughep`) | Súng Hạ Sao (`hasao`) | 0.91 | 0.87 | 0.94 |
| 19 | Bộ Trộn (`tron`) | Máy Sao Chép (`saochep`) | 0.91 | 0.90 | 0.91 |
| 20 | Pháo Ngôi Sao (`ngoisao`) | Hộp Tiến Hoá (`tienhoa`) | 0.91 | 0.83 | 0.97 |
| 21 | Hộp Bí Ẩn (`hopbi`) | Bộ Ép Xung (`epxung`) | 0.91 | 0.85 | 0.95 |
| 22 | Vua Ghép (`vughep`) | Máy Sinh Đôi (`sinhdoi`) | 0.91 | 0.85 | 0.95 |
| 23 | Hộp Tiến Hoá (`tienhoa`) | Nữ Thần Phán Xử (`nemesis`) | 0.91 | 0.85 | 0.95 |
| 24 | Hộp Tiến Hoá (`tienhoa`) | Nhật Thực (`nhatthuc`) | 0.90 | 0.82 | 0.97 |
| 25 | Lửa Thập Tự (`lualien`) | Hợp Xướng Lượng Tử (`hopca`) | 0.90 | 0.89 | 0.92 |
| 26 | Vua Ghép (`vughep`) | Cửu Vĩ (`cuuvi`) | 0.90 | 0.84 | 0.95 |
| 27 | Mimic (`mimic`) | Pháo Năng Lượng (`nangluong`) | 0.90 | 0.82 | 0.96 |
| 28 | Bão Tuyết (`baotuyet`) | Súng Bão (`bao`) | 0.90 | 0.84 | 0.95 |
| 29 | Chuỗi Liên Kết (`lienket`) | Hộp Bí Ẩn (`hopbi`) | 0.90 | 0.84 | 0.95 |
| 30 | Pháo Năng Lượng (`nangluong`) | Máy Tẩy Lỗi (`taylo`) | 0.90 | 0.83 | 0.95 |

## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)

| Ụ | Bậc | Giống nhất với | Điểm |
|---|---|---|---|
| Máy Nhân Mana (`nhanmana`) | xanh | Thánh Địa | 0.94 |
| Thánh Địa (`thanhdia`) | vang | Máy Nhân Mana | 0.94 |
| Bộ Trộn (`tron`) | xanh | Máy Nhân Bản | 0.92 |
| Máy Nhân Bản (`nhanban`) | tim | Bộ Trộn | 0.92 |
| Bão Tuyết (`baotuyet`) | tim | Bộ Ép Xung | 0.92 |
| Bộ Ép Xung (`epxung`) | tim | Bão Tuyết | 0.92 |
| Pháo Ngôi Sao (`ngoisao`) | vang | Máy Cầu Vồng | 0.92 |
| Máy Cầu Vồng (`cauvong`) | vang | Pháo Ngôi Sao | 0.92 |
| Laser (`laser`) | xanh | Súng Bão | 0.92 |
| Súng Bão (`bao`) | tim | Laser | 0.92 |
| Máy Xáo Trộn (`xaotron`) | tim | Bộ Ép Xung | 0.92 |
| Nỏ Năm Nhịp (`no5`) | tim | Súng Bão | 0.92 |
| Hộp Tiến Hoá (`tienhoa`) | vang | Máy Cầu Vồng | 0.92 |
| Railgun (`railgun`) | vang | Máy Cầu Vồng | 0.92 |
| Kho Lưu Hợp Nhất (`luutru`) | vang | Thánh Địa | 0.92 |
| Máy Sinh Đôi (`sinhdoi`) | vang | Súng Hạ Sao | 0.91 |
| Súng Hạ Sao (`hasao`) | vang | Máy Sinh Đôi | 0.91 |
| Máy Sao Chép (`saochep`) | vang | Hợp Xướng Lượng Tử | 0.91 |
| Hợp Xướng Lượng Tử (`hopca`) | vang | Máy Sao Chép | 0.91 |
| Súng Cuồng Nộ (`cuongno`) | tim | Chuỗi Liên Kết | 0.91 |
| Chuỗi Liên Kết (`lienket`) | tim | Súng Cuồng Nộ | 0.91 |
| Cửu Vĩ (`cuuvi`) | vang | Cổng Gương | 0.91 |
| Hộp Pandora (`pandora`) | vang | Thánh Địa | 0.91 |
| Cổng Gương (`guongcong`) | vang | Cửu Vĩ | 0.91 |
| Máy Hút Mana (`hutmana`) | xanh | Chuỗi Liên Kết | 0.91 |

## Ảnh để xem

- `BANG-MAU.png` — 93 ụ màu, cỡ thật
- `BANG-XAM.png` — 93 ụ xám (bỏ màu)
- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)
- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau
