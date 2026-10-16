# Bảng khe ở khớp theo khung (tự sinh bởi soat-rig.py)

Số = điểm ảnh thân của chi còn lộ (lớp trên cùng sau khi vẽ đủ lớp) trong đĩa bán kính r quanh 6 khớp vai/khuỷu/gối × trước/sau, cộng lại.
**Trước** = không chụp khớp, không chồng mép. **Sau** = cấu hình đang chọn (chụp gon, chồng mép 2 điểm ảnh).

## Bộ Máy vẽ

| Khung | Liên tục r2 trước | sau | Liên tục r3 trước | sau | 8 hướng r2 trước | sau | 8 hướng r3 trước | sau |
|---|---|---|---|---|---|---|---|---|
| 1 | 12 | 0 | 35 | 8 | 11 | 0 | 35 | 9 |
| 2 | 11 | 0 | 34 | 5 | 10 | 0 | 35 | 7 |
| 3 | 10 | 0 | 33 | 11 | 9 | 0 | 28 | 11 |
| 4 | 7 | 0 | 24 | 5 | 8 | 0 | 25 | 6 |
| 5 | 9 | 0 | 33 | 5 | 6 | 0 | 27 | 3 |
| 6 | 14 | 0 | 37 | 11 | 13 | 0 | 36 | 13 |
| 7 | 10 | 0 | 34 | 8 | 12 | 0 | 34 | 7 |
| 8 | 10 | 0 | 36 | 7 | 12 | 0 | 37 | 10 |
| 9 | 11 | 0 | 29 | 3 | 10 | 0 | 31 | 7 |
| 10 | 5 | 0 | 29 | 5 | 5 | 0 | 28 | 4 |
| 11 | 7 | 0 | 27 | 4 | 8 | 0 | 29 | 4 |
| 12 | 10 | 0 | 32 | 7 | 13 | 0 | 37 | 9 |
| **Tổng** | **116** | **0** | **383** | **79** | **117** | **0** | **382** | **90** |

Khe r=3 còn lại (sau) theo khớp:

- k1 LT goiT=5, k1 LT goiS=3, k1 8H khuyuT=1, k1 8H goiT=5, k1 8H goiS=3, k2 LT goiT=4, k2 LT goiS=1, k2 8H khuyuT=2, k2 8H goiT=4, k2 8H goiS=1, k3 LT khuyuT=1, k3 LT goiT=6, k3 LT goiS=4, k3 8H goiT=6, k3 8H goiS=5, k4 LT goiT=1, k4 LT goiS=4, k4 8H goiT=1, k4 8H goiS=5, k5 LT goiT=4, k5 LT goiS=1, k5 8H goiT=3, k6 LT khuyuT=2, k6 LT goiT=4, k6 LT goiS=5, k6 8H khuyuT=1, k6 8H goiT=5, k6 8H goiS=7, k7 LT goiT=3, k7 LT goiS=5, k7 8H goiT=3, k7 8H goiS=4, k8 LT khuyuT=3, k8 LT goiT=4, k8 8H khuyuT=4, k8 8H goiT=4, k8 8H goiS=2, k9 LT khuyuT=1, k9 LT goiT=1, k9 LT goiS=1, k9 8H goiT=6, k9 8H goiS=1, k10 LT goiT=3, k10 LT khuyuS=1, k10 LT goiS=1, k10 8H khuyuT=1, k10 8H goiT=2, k10 8H goiS=1, k11 LT goiT=1, k11 LT goiS=3, k11 8H goiT=1, k11 8H goiS=3, k12 LT goiT=3, k12 LT goiS=4, k12 8H goiT=4, k12 8H goiS=5

So cấu hình (tổng 12 khung):

| Cấu hình | LT r2 | LT r3 | 8H r2 | 8H r3 | khung có khe r2 |
|---|---|---|---|---|---|
| truoc | 116 | 383 | 117 | 382 | 12/12 |
| chong | 85 | 243 | 81 | 248 | 12/12 |
| nho | 12 | 168 | 13 | 179 | 9/12 |
| gon | 0 | 79 | 0 | 90 | 0/12 |
| to | 0 | 0 | 0 | 0 | 0/12 |

Bám 2 đầu lỗi: không
Đổi lớp theo khung: {"tayRaSau": [1, 5, 8, 11, 12]}

## Bộ Gen

| Khung | Liên tục r2 trước | sau | Liên tục r3 trước | sau | 8 hướng r2 trước | sau | 8 hướng r3 trước | sau |
|---|---|---|---|---|---|---|---|---|
| 1 | 8 | 0 | 29 | 7 | 12 | 0 | 35 | 7 |
| 2 | 7 | 0 | 32 | 3 | 11 | 0 | 34 | 4 |
| 3 | 8 | 0 | 28 | 9 | 8 | 0 | 27 | 11 |
| 4 | 7 | 0 | 22 | 3 | 6 | 0 | 22 | 4 |
| 5 | 4 | 0 | 24 | 4 | 5 | 0 | 25 | 4 |
| 6 | 8 | 0 | 28 | 10 | 10 | 0 | 31 | 7 |
| 7 | 7 | 0 | 26 | 7 | 14 | 0 | 34 | 8 |
| 8 | 7 | 0 | 34 | 6 | 9 | 0 | 35 | 7 |
| 9 | 10 | 0 | 27 | 1 | 9 | 0 | 25 | 3 |
| 10 | 7 | 0 | 25 | 2 | 6 | 0 | 25 | 3 |
| 11 | 6 | 0 | 23 | 5 | 7 | 0 | 25 | 4 |
| 12 | 9 | 0 | 31 | 8 | 12 | 0 | 34 | 7 |
| **Tổng** | **88** | **0** | **329** | **65** | **109** | **0** | **352** | **69** |

Khe r=3 còn lại (sau) theo khớp:

- k1 LT goiT=4, k1 LT goiS=3, k1 8H khuyuT=1, k1 8H goiT=3, k1 8H goiS=3, k2 LT goiT=3, k2 8H goiT=4, k3 LT goiT=5, k3 LT goiS=4, k3 8H khuyuT=1, k3 8H goiT=5, k3 8H goiS=5, k4 LT goiS=3, k4 8H goiT=1, k4 8H goiS=3, k5 LT goiT=3, k5 LT goiS=1, k5 8H goiT=3, k5 8H goiS=1, k6 LT khuyuT=1, k6 LT goiT=5, k6 LT goiS=4, k6 8H goiT=4, k6 8H goiS=3, k7 LT goiT=3, k7 LT goiS=4, k7 8H goiT=4, k7 8H goiS=4, k8 LT khuyuT=2, k8 LT goiT=3, k8 LT goiS=1, k8 8H khuyuT=3, k8 8H goiT=3, k8 8H goiS=1, k9 LT goiT=1, k9 8H goiT=2, k9 8H goiS=1, k10 LT goiT=2, k10 8H goiT=2, k10 8H goiS=1, k11 LT goiT=2, k11 LT goiS=3, k11 8H goiT=2, k11 8H goiS=2, k12 LT goiT=3, k12 LT goiS=5, k12 8H goiT=3, k12 8H goiS=4

So cấu hình (tổng 12 khung):

| Cấu hình | LT r2 | LT r3 | 8H r2 | 8H r3 | khung có khe r2 |
|---|---|---|---|---|---|
| truoc | 88 | 329 | 109 | 352 | 12/12 |
| chong | 42 | 149 | 53 | 169 | 12/12 |
| nho | 2 | 108 | 2 | 117 | 3/12 |
| gon | 0 | 65 | 0 | 69 | 0/12 |
| to | 0 | 0 | 0 | 0 | 0/12 |

Bám 2 đầu lỗi: k3 8H Giáp ống chân trước cuối lệch 1.78
Đổi lớp theo khung: {"tayRaSau": [1, 5, 8, 11, 12]}

