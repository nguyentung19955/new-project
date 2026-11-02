# Thống kê animation + hiệu ứng đòn – đo tự động 02/11

Đo trên từng khung ảnh gốc. Cột: số khung · tổng thời gian · nhảy tâm (x/y, % cỡ ô, lớn nhất giữa 2 khung liền) · trượt chân (% ô, clip đứng đất) · đổi chiều cao (%) · IoU nhỏ nhất (độ chồng hình 2 khung liền, thấp = "giật hình") · khung gần trùng (khựng) · nhịp ms lệch nhất.

Ghi chú: VFX nhiều pha (tụ → bay → nổ) có IoU thấp là bình thường; VFX dựng từ mặt đất chạm mép dưới là bình thường; quái lao tới khi đánh thì "trượt chân" là cố ý.


## Kiếm Khách

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 4 | 880 | 0.1/0.3 | 0.2 | 1 | 0.91 | 0 | ×1.0 | ổn |
| troi | 8 | 640 | 0.3/1.3 | 8.7 | 18 | 0.61 | 0 | ×1.0 | đáy lệch 3.5% |
| nhay | 4 | 280 | 1.0/1.7 | – | 11 | 0.53 | 1 | ×1.0 | 1 cặp khung gần trùng (khựng) |
| nhaydoi | 4 | 240 | 1.0/1.7 | – | 11 | 0.53 | 1 | ×1.0 | 1 cặp khung gần trùng (khựng) |
| roi | 1 | 120 | 0.0/0.0 | – | 0 | 1 | 0 | ×1 | ổn |
| tiepdat | 3 | 150 | 0.8/3.9 | 0.1 | 19 | 0.48 | 1 | ×1.0 | 1 cặp khung gần trùng (khựng) |
| luot | 6 | 240 | 1.4/1.1 | 6.0 | 30 | 0.39 | 2 | ×1.0 | 2 cặp khung gần trùng (khựng) |
| bamtuong | 3 | 360 | 0.6/0.7 | – | 1 | 0.75 | 0 | ×1.0 | ổn |
| dapdat | 14 | 835 | 2.8/9.9 | 7.2 | 48 | 0.23 | 0 | ×1.2 | giật hình (IoU 0.23); tâm nhảy dọc 9.9%; chân trượt 7.2% |
| luon | 1 | 140 | 0.0/0.0 | – | 0 | 1 | 0 | ×1 | ổn |
| trungdon | 6 | 330 | 1.3/1.3 | 4.6 | 7 | 0.43 | 2 | ×1.0 | 2 cặp khung gần trùng (khựng) |
| hoimau | 4 | 720 | 0.1/0.3 | 0.2 | 1 | 0.91 | 0 | ×1.0 | ổn |
| chet | 7 | 910 | 4.4/5.0 | 9.3 | 46 | 0.32 | 2 | ×1.0 | giật hình (IoU 0.32); 2 cặp khung gần trùng (khựng) |
| leoday | 8 | 800 | 0.4/1.4 | – | 22 | 0.63 | 0 | ×1.0 | ổn |
| treoday | 2 | 800 | 0.1/0.2 | – | 0 | 0.87 | 0 | ×1.0 | ổn |
| chemday | 6 | 420 | 2.2/0.9 | – | 0 | 0.7 | 0 | ×1.29 | ổn |
| chemtuong | 6 | 400 | 3.2/1.0 | – | 3 | 0.73 | 0 | ×1.17 | ổn |
| don1 | 8 | 465 | 2.9/0.5 | 2.1 | 1 | 0.49 | 2 | ×1.4 | 2 cặp khung gần trùng (khựng) |
| don2 | 8 | 470 | 2.3/3.5 | 3.4 | 21 | 0.41 | 2 | ×1.4 | 2 cặp khung gần trùng (khựng) |
| don3 | 8 | 500 | 3.0/2.2 | 2.6 | 10 | 0.49 | 2 | ×1.5 | 2 cặp khung gần trùng (khựng) |
| don4 | 9 | 560 | 4.8/6.0 | 10.1 | 31 | 0.31 | 3 | ×1.56 | giật hình (IoU 0.31); chân trượt 10.1%; 3 cặp khung gần trùng (khựng) |
| cheolen | 8 | 470 | 2.3/3.5 | – | 21 | 0.41 | 2 | ×1.4 | 2 cặp khung gần trùng (khựng) |
| cheoxuong | 8 | 500 | 3.0/2.2 | – | 10 | 0.49 | 2 | ×1.5 | 2 cặp khung gần trùng (khựng) |
| chemkhong | 7 | 400 | 1.9/2.6 | – | 14 | 0.37 | 1 | ×1.17 | 1 cặp khung gần trùng (khựng) |

## Phu Đèn Lạc

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1080 | 0.7/1.2 | 2.1 | 3 | 0.78 | 0 | ×1.0 | ổn |
| di | 9 | 900 | 1.3/2.0 | 2.4 | 3 | 0.71 | 0 | ×1.0 | ổn |
| danh | 9 | 730 | 0.9/2.0 | 5.2 | 8 | 0.67 | 0 | ×1.43 | ổn |
| trung | 9 | 405 | 1.6/0.9 | 2.5 | 5 | 0.71 | 0 | ×1.0 | ổn |
| chet | 9 | 900 | 1.1/6.7 | 8.8 | 51 | 0.53 | 0 | ×1.0 | tâm nhảy dọc 6.7% |
| fx_danh | 9 | 540 | 3.0/1.4 | – | 11 | 0.5 | 0 | ×1.0 | ổn |

## Bọ Vỏ Mộc

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1080 | 0.6/0.5 | 9.9 | 11 | 0.85 | 0 | ×1.0 | chân trượt 9.9% |
| di | 9 | 810 | 0.5/0.8 | 15.1 | 17 | 0.77 | 0 | ×1.0 | chân trượt 15.1% |
| danh | 9 | 790 | 0.8/0.4 | 15.8 | 13 | 0.82 | 0 | ×1.57 | chân trượt 15.8% |
| trung | 9 | 405 | 0.3/0.8 | 15.9 | 22 | 0.86 | 0 | ×1.0 | chân trượt 15.9% |
| chet | 9 | 900 | 0.8/0.4 | 15.8 | 13 | 0.82 | 0 | ×1.0 | ổn |
| fx_danh | 9 | 540 | 10.6/2.2 | – | 20 | 0.49 | 0 | ×1.0 | ổn |

## Dơi Rễ

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 900 | 1.1/0.9 | – | 9 | 0.73 | 0 | ×1.0 | ổn |
| di | 7 | 560 | 2.2/3.2 | – | 17 | 0.62 | 0 | ×1.0 | ổn |
| danh | 9 | 670 | 1.5/2.0 | – | 15 | 0.6 | 0 | ×1.5 | ổn |
| trung | 9 | 405 | 0.5/1.0 | – | 12 | 0.61 | 0 | ×1.0 | ổn |
| chet | 9 | 810 | 6.6/17.7 | – | 53 | 0.14 | 0 | ×1.0 | giật hình (IoU 0.14); tâm nhảy dọc 17.7% |
| fx_danh | 9 | 540 | 4.3/1.2 | – | 28 | 0.41 | 0 | ×1.0 | ổn |

## Nấm Thở

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1170 | 2.0/1.0 | 2.7 | 18 | 0.85 | 0 | ×1.0 | ổn |
| di | 9 | 1080 | 1.2/0.9 | 0.6 | 10 | 0.89 | 1 | ×1.0 | 1 cặp khung gần trùng (khựng) |
| danh | 9 | 840 | 1.7/1.5 | 1.8 | 4 | 0.86 | 0 | ×1.43 | ổn |
| trung | 9 | 405 | 1.2/1.2 | 1.7 | 19 | 0.82 | 0 | ×1.0 | ổn |
| chet | 9 | 900 | 2.5/8.1 | 14.3 | 43 | 0.54 | 0 | ×1.0 | tâm nhảy dọc 8.1% |
| fx_danh | 9 | 540 | 6.6/0.6 | – | 12 | 0.51 | 0 | ×1.0 | ổn |

## Chuông Kén Nứt (tinh anh)

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1170 | 0.9/2.1 | – | 9 | 0.73 | 0 | ×1.0 | ổn |
| di | 9 | 1080 | 3.0/1.6 | – | 12 | 0.61 | 0 | ×1.0 | nối vòng cuối→đầu kém (IoU 0.61) |
| danh | 9 | 950 | 11.5/1.5 | – | 9 | 0.27 | 1 | ×1.38 | giật hình (IoU 0.27); 1 cặp khung gần trùng (khựng) |
| trung | 9 | 405 | 1.0/1.1 | – | 10 | 0.77 | 0 | ×1.0 | ổn |
| chet | 9 | 990 | 2.4/14.3 | – | 63 | 0.27 | 0 | ×1.0 | giật hình (IoU 0.27); tâm nhảy dọc 14.3% |
| fx_danh | 9 | 540 | 7.7/1.3 | – | 25 | 0.25 | 0 | ×1.0 | giật hình (IoU 0.25) |

## Khuyết Cẩu

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 990 | 0.3/0.6 | 3.4 | 2 | 0.83 | 0 | ×1.0 | ổn |
| di | 9 | 630 | 0.5/2.1 | 5.6 | 6 | 0.67 | 0 | ×1.0 | ổn |
| danh | 9 | 710 | 1.7/1.5 | 15.4 | 6 | 0.69 | 0 | ×1.83 | chân trượt 15.4%; nhịp lệch ×1.83 |
| trung | 9 | 405 | 1.1/2.0 | 6.9 | 6 | 0.75 | 0 | ×1.0 | chân trượt 6.9% |
| chet | 9 | 900 | 1.5/5.0 | 9.8 | 25 | 0.56 | 0 | ×1.0 | ổn |

## Vọng Tàn (tinh anh)

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1260 | 0.4/1.1 | 4.0 | 4 | 0.82 | 0 | ×1.0 | ổn |
| di | 9 | 1080 | 1.7/1.4 | 22.4 | 24 | 0.72 | 0 | ×1.0 | chân trượt 22.4%; đáy lệch 18.8% |
| danh | 9 | 1000 | 3.4/7.9 | 16.7 | 30 | 0.59 | 0 | ×1.44 | tâm nhảy dọc 7.9%; chân trượt 16.7% |
| trung | 9 | 405 | 0.7/1.1 | 2.3 | 8 | 0.82 | 0 | ×1.0 | ổn |
| chet | 9 | 990 | 2.2/3.2 | 22.8 | 43 | 0.74 | 0 | ×1.0 | đáy lệch 18.8% |

## Hồn Vải

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 990 | 3.7/0.6 | – | 3 | 0.58 | 0 | ×1.0 | ổn |
| di | 9 | 900 | 1.1/0.9 | – | 7 | 0.61 | 0 | ×1.0 | ổn |
| danh | 9 | 880 | 1.2/3.1 | – | 13 | 0.62 | 1 | ×1.22 | 1 cặp khung gần trùng (khựng) |
| trung | 9 | 405 | 1.4/1.1 | – | 10 | 0.67 | 0 | ×1.0 | ổn |
| chet | 9 | 900 | 5.0/15.1 | – | 73 | 0.24 | 0 | ×1.0 | giật hình (IoU 0.24); tâm nhảy dọc 15.1% |

## Kèn Câm

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1170 | 0.4/0.5 | 0.3 | 4 | 0.73 | 0 | ×1.0 | ổn |
| di | 9 | 990 | 0.8/3.2 | 4.6 | 5 | 0.64 | 0 | ×1.0 | ổn |
| danh | 9 | 1010 | 2.2/2.7 | 1.4 | 4 | 0.53 | 0 | ×1.57 | ổn |
| trung | 9 | 405 | 0.4/1.2 | 3.2 | 10 | 0.73 | 0 | ×1.0 | ổn |
| chet | 9 | 900 | 2.8/6.2 | 9.0 | 54 | 0.46 | 0 | ×1.0 | tâm nhảy dọc 6.2%; đáy lệch 4.5% |

## Màn Tang

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| dung | 9 | 1170 | 0.2/0.3 | – | 1 | 0.84 | 0 | ×1.0 | ổn |
| di | 9 | 990 | 0.3/1.2 | – | 3 | 0.8 | 0 | ×1.0 | ổn |
| danh | 9 | 830 | 4.3/2.4 | – | 9 | 0.36 | 0 | ×1.38 | ổn |
| trung | 9 | 405 | 1.6/2.1 | – | 8 | 0.66 | 0 | ×1.0 | ổn |
| chet | 9 | 900 | 0.8/20.3 | – | 77 | 0.15 | 0 | ×1.0 | giật hình (IoU 0.15); tâm nhảy dọc 20.3% |

## VFX quái

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| ken | 6 | 360 | 14.0/7.8 | – | 29 | 0.04 | 0 | ×1.0 | VFX nhảy khung (IoU 0.04); khung 3 chạm mép (bị cắt) |
| cau | 6 | 360 | 7.4/1.3 | – | 29 | 0.12 | 0 | ×1.0 | VFX nhảy khung (IoU 0.12) |
| vai | 6 | 360 | 10.5/3.3 | – | 61 | 0.06 | 0 | ×1.0 | VFX nhảy khung (IoU 0.06) |
| tan | 6 | 360 | 9.4/3.5 | – | 78 | 0.28 | 0 | ×1.0 | khung 3 chạm mép (bị cắt) |
| tang | 6 | 360 | 12.0/8.0 | – | 95 | 0.0 | 0 | ×1.0 | VFX nhảy khung (IoU 0.0) |
| ken_tron | 6 | 360 | 19.3/12.1 | – | 50 | 0.04 | 0 | ×1.0 | VFX nhảy khung (IoU 0.04) |
| cau_tim | 6 | 360 | 7.4/1.3 | – | 29 | 0.12 | 0 | ×1.0 | VFX nhảy khung (IoU 0.12) |
| vai_nhat | 6 | 360 | 10.5/3.3 | – | 61 | 0.06 | 0 | ×1.0 | VFX nhảy khung (IoU 0.06) |
| ken_tu | 6 | 360 | 13.4/1.6 | – | 27 | 0.15 | 0 | ×1.0 | ổn |
| bui_tuong | 6 | 360 | 4.6/5.2 | – | 28 | 0.38 | 0 | ×1.0 | ổn |

## VFX trúng đòn

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| ngang | 6 | 300 | 7.2/2.2 | – | 82 | 0.01 | 0 | ×1.0 | VFX nhảy khung (IoU 0.01) |
| cung | 6 | 300 | 4.0/9.6 | – | 58 | 0.03 | 0 | ×1.0 | VFX nhảy khung (IoU 0.03) |
| cheo | 6 | 300 | 4.7/3.0 | – | 59 | 0.02 | 0 | ×1.0 | VFX nhảy khung (IoU 0.02) |
| no | 6 | 300 | 2.6/12.7 | – | 52 | 0.03 | 0 | ×1.0 | VFX nhảy khung (IoU 0.03) |

## VFX tinh anh/trùm

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| nut_dat | 4 | 320 | 0.7/2.8 | – | 60 | 0.51 | 0 | ×1.0 | khung 3 chạm mép (bị cắt) |
| song_dat | 4 | 320 | 14.6/2.5 | – | 23 | 0.26 | 0 | ×1.0 | khung 0 chạm mép (bị cắt) |
| re_troi | 4 | 320 | 2.3/4.7 | – | 67 | 0.5 | 0 | ×1.0 | khung 0 chạm mép (bị cắt) |

## VFX trùm

| Clip | Khung | ms | Nhảy tâm x/y % | Trượt chân % | Đổi cao % | IoU min | Khựng | Nhịp lệch | Cờ |
|---|---|---|---|---|---|---|---|---|---|
| bao_quet | 4 | 320 | 0.7/3.7 | – | 52 | 0.72 | 0 | ×1.0 | khung 0 chạm mép (bị cắt) |
| vet_quet | 4 | 320 | 7.4/6.2 | – | 51 | 0.52 | 0 | ×1.0 | khung 0 chạm mép (bị cắt) |
| dich_mat_na | 3 | 240 | 1.4/2.0 | – | 15 | 0.79 | 0 | ×1.0 | ổn |
| cot_song | 4 | 320 | 1.6/11.0 | – | 47 | 0.42 | 0 | ×1.0 | ổn |
| day_vai | 2 | 160 | 4.6/3.7 | – | 0 | 0.69 | 0 | ×1.0 | ổn |
