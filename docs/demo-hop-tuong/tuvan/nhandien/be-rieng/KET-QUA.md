# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo
Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **46.5 px CSS** = 140 px điểm ảnh. Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.
Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.
- Số ụ: 93 · IoU hình bóng trung bình mọi cặp: **0.67** (1.0 = cùng hình bóng)
- Cặp điểm ≥ 0.8: **865** · ≥ 0.70: 3359

## 30 cặp dễ nhầm nhất

| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |
|---|---|---|---|---|---|
| 1 | Pháo Ngôi Sao (`ngoisao`) | Hộp Tiến Hoá (`tienhoa`) | 0.93 | 0.90 | 0.96 |
| 2 | Kho Lưu Hợp Nhất (`luutru`) | Thánh Địa (`thanhdia`) | 0.93 | 0.90 | 0.96 |
| 3 | Pháo Ngôi Sao (`ngoisao`) | Máy Cầu Vồng (`cauvong`) | 0.92 | 0.85 | 0.97 |
| 4 | Bộ Trộn (`tron`) | Máy Nhân Bản (`nhanban`) | 0.92 | 0.89 | 0.94 |
| 5 | Máy Sao Chép (`saochep`) | Hợp Xướng Lượng Tử (`hopca`) | 0.92 | 0.92 | 0.92 |
| 6 | Hộp Pandora (`pandora`) | Thánh Địa (`thanhdia`) | 0.92 | 0.89 | 0.94 |
| 7 | Cửu Vĩ (`cuuvi`) | Cổng Gương (`guongcong`) | 0.91 | 0.86 | 0.95 |
| 8 | Bộ Trộn (`tron`) | Máy Sao Chép (`saochep`) | 0.91 | 0.91 | 0.91 |
| 9 | Railgun (`railgun`) | Máy Cầu Vồng (`cauvong`) | 0.91 | 0.84 | 0.96 |
| 10 | Máy Sinh Đôi (`sinhdoi`) | Súng Hạ Sao (`hasao`) | 0.91 | 0.88 | 0.93 |
| 11 | Hộp Tiến Hoá (`tienhoa`) | Máy Cầu Vồng (`cauvong`) | 0.91 | 0.85 | 0.95 |
| 12 | Railgun (`railgun`) | Hộp Tiến Hoá (`tienhoa`) | 0.91 | 0.86 | 0.94 |
| 13 | Lửa Thập Tự (`lualien`) | Hợp Xướng Lượng Tử (`hopca`) | 0.91 | 0.89 | 0.92 |
| 14 | Vua Ghép (`vughep`) | Hộp Tiến Hoá (`tienhoa`) | 0.90 | 0.87 | 0.93 |
| 15 | Cửu Vĩ (`cuuvi`) | Nữ Thần Phán Xử (`nemesis`) | 0.90 | 0.84 | 0.95 |
| 16 | Nữ Thần Phán Xử (`nemesis`) | Rối Máy (`marionette`) | 0.90 | 0.83 | 0.96 |
| 17 | Railgun (`railgun`) | Pháo Ngôi Sao (`ngoisao`) | 0.90 | 0.84 | 0.94 |
| 18 | Lưới Cộng Hưởng (`luoicheo`) | Lõi Khởi Sinh (`khoisinh`) | 0.90 | 0.92 | 0.88 |
| 19 | Nữ Thần Phán Xử (`nemesis`) | Nhật Thực (`nhatthuc`) | 0.90 | 0.81 | 0.97 |
| 20 | Bộ Trộn (`tron`) | Hợp Xướng Lượng Tử (`hopca`) | 0.90 | 0.90 | 0.89 |
| 21 | Hộp Pandora (`pandora`) | Kho Lưu Hợp Nhất (`luutru`) | 0.90 | 0.85 | 0.94 |
| 22 | Nữ Thần Phán Xử (`nemesis`) | Lò Rèn Phế Liệu (`loren`) | 0.90 | 0.84 | 0.94 |
| 23 | Máy Phát Lạnh (`lanhgia`) | Hợp Xướng Lượng Tử (`hopca`) | 0.89 | 0.89 | 0.89 |
| 24 | Vua Ghép (`vughep`) | Máy Sinh Đôi (`sinhdoi`) | 0.89 | 0.87 | 0.91 |
| 25 | Vua Ghép (`vughep`) | Vệ Tinh (`orbital`) | 0.89 | 0.85 | 0.92 |
| 26 | Độc Tôn (`docton`) | Đèn Săn Thưởng (`santhuong`) | 0.89 | 0.81 | 0.96 |
| 27 | Kiếm Băng (`kiembang`) | Bệ Dịch Chuyển (`dichchuyen`) | 0.89 | 0.88 | 0.90 |
| 28 | Máy Nhân Bản (`nhanban`) | Máy Sao Chép (`saochep`) | 0.89 | 0.89 | 0.90 |
| 29 | Vua Ghép (`vughep`) | Súng Hạ Sao (`hasao`) | 0.89 | 0.88 | 0.90 |
| 30 | Kẻ Nguyền (`nguyenrua`) | Thánh Địa (`thanhdia`) | 0.89 | 0.87 | 0.90 |

## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)

| Ụ | Bậc | Giống nhất với | Điểm |
|---|---|---|---|
| Pháo Ngôi Sao (`ngoisao`) | vang | Hộp Tiến Hoá | 0.93 |
| Hộp Tiến Hoá (`tienhoa`) | vang | Pháo Ngôi Sao | 0.93 |
| Kho Lưu Hợp Nhất (`luutru`) | vang | Thánh Địa | 0.93 |
| Thánh Địa (`thanhdia`) | vang | Kho Lưu Hợp Nhất | 0.93 |
| Máy Cầu Vồng (`cauvong`) | vang | Pháo Ngôi Sao | 0.92 |
| Bộ Trộn (`tron`) | xanh | Máy Nhân Bản | 0.92 |
| Máy Nhân Bản (`nhanban`) | tim | Bộ Trộn | 0.92 |
| Máy Sao Chép (`saochep`) | vang | Hợp Xướng Lượng Tử | 0.92 |
| Hợp Xướng Lượng Tử (`hopca`) | vang | Máy Sao Chép | 0.92 |
| Hộp Pandora (`pandora`) | vang | Thánh Địa | 0.92 |
| Cửu Vĩ (`cuuvi`) | vang | Cổng Gương | 0.91 |
| Cổng Gương (`guongcong`) | vang | Cửu Vĩ | 0.91 |
| Railgun (`railgun`) | vang | Máy Cầu Vồng | 0.91 |
| Máy Sinh Đôi (`sinhdoi`) | vang | Súng Hạ Sao | 0.91 |
| Súng Hạ Sao (`hasao`) | vang | Máy Sinh Đôi | 0.91 |
| Lửa Thập Tự (`lualien`) | vang | Hợp Xướng Lượng Tử | 0.91 |
| Vua Ghép (`vughep`) | vang | Hộp Tiến Hoá | 0.90 |
| Nữ Thần Phán Xử (`nemesis`) | vang | Cửu Vĩ | 0.90 |
| Rối Máy (`marionette`) | vang | Nữ Thần Phán Xử | 0.90 |
| Lưới Cộng Hưởng (`luoicheo`) | vang | Lõi Khởi Sinh | 0.90 |
| Lõi Khởi Sinh (`khoisinh`) | do | Lưới Cộng Hưởng | 0.90 |
| Nhật Thực (`nhatthuc`) | vang | Nữ Thần Phán Xử | 0.90 |
| Lò Rèn Phế Liệu (`loren`) | vang | Nữ Thần Phán Xử | 0.90 |
| Máy Phát Lạnh (`lanhgia`) | xanh | Hợp Xướng Lượng Tử | 0.89 |
| Vệ Tinh (`orbital`) | vang | Vua Ghép | 0.89 |

## Ảnh để xem

- `BANG-MAU.png` — 93 ụ màu, cỡ thật
- `BANG-XAM.png` — 93 ụ xám (bỏ màu)
- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)
- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau
