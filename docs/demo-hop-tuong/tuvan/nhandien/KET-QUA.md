# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo
Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **46.5 px CSS** = 140 px điểm ảnh. Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.
Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.
- Số ụ: 93 · IoU hình bóng trung bình mọi cặp: **0.68** (1.0 = cùng hình bóng)
- Cặp điểm ≥ 0.8: **1553** · ≥ 0.70: 3601

## 30 cặp dễ nhầm nhất

| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |
|---|---|---|---|---|---|
| 1 | Máy Nhân Mana (`nhanmana`) | Thánh Địa (`thanhdia`) | 0.94 | 0.92 | 0.96 |
| 2 | Pháo Ngôi Sao (`ngoisao`) | Máy Cầu Vồng (`cauvong`) | 0.94 | 0.88 | 0.98 |
| 3 | Bộ Khuếch Đại (`khuech`) | Hộp Tiến Hoá (`tienhoa`) | 0.93 | 0.93 | 0.93 |
| 4 | Máy Sinh Đôi (`sinhdoi`) | Súng Hạ Sao (`hasao`) | 0.93 | 0.89 | 0.96 |
| 5 | Bộ Trộn (`tron`) | Máy Nhân Bản (`nhanban`) | 0.93 | 0.91 | 0.94 |
| 6 | Laser (`laser`) | Súng Bão (`bao`) | 0.92 | 0.86 | 0.98 |
| 7 | Bão Tuyết (`baotuyet`) | Bộ Ép Xung (`epxung`) | 0.92 | 0.87 | 0.97 |
| 8 | Máy Xáo Trộn (`xaotron`) | Bộ Ép Xung (`epxung`) | 0.92 | 0.87 | 0.96 |
| 9 | Bệ Nâng Sao (`nangsao`) | Súng Bão (`bao`) | 0.92 | 0.85 | 0.97 |
| 10 | Kho Lưu Hợp Nhất (`luutru`) | Thánh Địa (`thanhdia`) | 0.92 | 0.86 | 0.96 |
| 11 | Vua Ghép (`vughep`) | Máy Sinh Đôi (`sinhdoi`) | 0.91 | 0.87 | 0.95 |
| 12 | Máy Sao Chép (`saochep`) | Hợp Xướng Lượng Tử (`hopca`) | 0.91 | 0.91 | 0.92 |
| 13 | Hộp Pandora (`pandora`) | Thánh Địa (`thanhdia`) | 0.91 | 0.88 | 0.94 |
| 14 | Nỏ Năm Nhịp (`no5`) | Súng Bão (`bao`) | 0.91 | 0.86 | 0.95 |
| 15 | Băng (`bang`) | Kiếm Băng (`kiembang`) | 0.91 | 0.88 | 0.94 |
| 16 | Bộ Trộn (`tron`) | Máy Sao Chép (`saochep`) | 0.91 | 0.91 | 0.91 |
| 17 | Súng Lục (`sungluc`) | Độc (`doc`) | 0.91 | 0.85 | 0.95 |
| 18 | Mimic (`mimic`) | Pháo Năng Lượng (`nangluong`) | 0.91 | 0.86 | 0.95 |
| 19 | Nữ Thần Phán Xử (`nemesis`) | Rối Máy (`marionette`) | 0.91 | 0.85 | 0.96 |
| 20 | Railgun (`railgun`) | Máy Cầu Vồng (`cauvong`) | 0.91 | 0.82 | 0.98 |
| 21 | Cửu Vĩ (`cuuvi`) | Cổng Gương (`guongcong`) | 0.91 | 0.85 | 0.95 |
| 22 | Ăng-ten Chí Mạng (`chimang`) | Lưới Cộng Hưởng (`luoicheo`) | 0.91 | 0.90 | 0.91 |
| 23 | Máy Hút Mana (`hutmana`) | Chuỗi Liên Kết (`lienket`) | 0.90 | 0.86 | 0.94 |
| 24 | Mimic (`mimic`) | Laser (`laser`) | 0.90 | 0.82 | 0.97 |
| 25 | Bão Tuyết (`baotuyet`) | Súng Bão (`bao`) | 0.90 | 0.84 | 0.95 |
| 26 | Máy Xáo Trộn (`xaotron`) | Độc Tôn (`docton`) | 0.90 | 0.87 | 0.93 |
| 27 | Máy Sinh Đôi (`sinhdoi`) | Lò Rèn Phế Liệu (`loren`) | 0.90 | 0.83 | 0.96 |
| 28 | Cửu Vĩ (`cuuvi`) | Nữ Thần Phán Xử (`nemesis`) | 0.90 | 0.84 | 0.95 |
| 29 | Súng Lục (`sungluc`) | Băng (`bang`) | 0.90 | 0.85 | 0.94 |
| 30 | Độc (`doc`) | Máy Nhân Mana (`nhanmana`) | 0.90 | 0.86 | 0.93 |

## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)

| Ụ | Bậc | Giống nhất với | Điểm |
|---|---|---|---|
| Máy Nhân Mana (`nhanmana`) | xanh | Thánh Địa | 0.94 |
| Thánh Địa (`thanhdia`) | vang | Máy Nhân Mana | 0.94 |
| Pháo Ngôi Sao (`ngoisao`) | vang | Máy Cầu Vồng | 0.94 |
| Máy Cầu Vồng (`cauvong`) | vang | Pháo Ngôi Sao | 0.94 |
| Bộ Khuếch Đại (`khuech`) | xanh | Hộp Tiến Hoá | 0.93 |
| Hộp Tiến Hoá (`tienhoa`) | vang | Bộ Khuếch Đại | 0.93 |
| Máy Sinh Đôi (`sinhdoi`) | vang | Súng Hạ Sao | 0.93 |
| Súng Hạ Sao (`hasao`) | vang | Máy Sinh Đôi | 0.93 |
| Bộ Trộn (`tron`) | xanh | Máy Nhân Bản | 0.93 |
| Máy Nhân Bản (`nhanban`) | tim | Bộ Trộn | 0.93 |
| Laser (`laser`) | xanh | Súng Bão | 0.92 |
| Bão Tuyết (`baotuyet`) | tim | Bộ Ép Xung | 0.92 |
| Bộ Ép Xung (`epxung`) | tim | Bão Tuyết | 0.92 |
| Súng Bão (`bao`) | tim | Laser | 0.92 |
| Máy Xáo Trộn (`xaotron`) | tim | Bộ Ép Xung | 0.92 |
| Bệ Nâng Sao (`nangsao`) | tim | Súng Bão | 0.92 |
| Kho Lưu Hợp Nhất (`luutru`) | vang | Thánh Địa | 0.92 |
| Vua Ghép (`vughep`) | vang | Máy Sinh Đôi | 0.91 |
| Máy Sao Chép (`saochep`) | vang | Hợp Xướng Lượng Tử | 0.91 |
| Hợp Xướng Lượng Tử (`hopca`) | vang | Máy Sao Chép | 0.91 |
| Hộp Pandora (`pandora`) | vang | Thánh Địa | 0.91 |
| Nỏ Năm Nhịp (`no5`) | tim | Súng Bão | 0.91 |
| Băng (`bang`) | trang | Kiếm Băng | 0.91 |
| Kiếm Băng (`kiembang`) | xanh | Băng | 0.91 |
| Súng Lục (`sungluc`) | trang | Độc | 0.91 |

## Ảnh để xem

- `BANG-MAU.png` — 93 ụ màu, cỡ thật
- `BANG-XAM.png` — 93 ụ xám (bỏ màu)
- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)
- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau
