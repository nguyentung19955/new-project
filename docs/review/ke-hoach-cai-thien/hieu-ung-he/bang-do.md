# Phần A — bảng đo đầy đủ (hiện trạng trước khi sửa, 17/10)

Đo bằng `cong-cu/do.py` (bot không màn hình, bản một tệp `?cloud=0`, Cu Tí cấp 20, quái Heo Rừng Con đứng yên máu rất dày). Cỡ, tầm tính bằng **điểm game** (màn 480×270). "Lớp cùng lúc" = số hình hiệu ứng của Cu Tí đang hiện cùng một khung (tối đa trong cả đòn). "Hạt" = hạt nhỏ (phần lớn bị chặn vẽ code, chỉ chùm ≥ 3 hạt thành ảnh hu-hat-no / hu-khoi-tron). Tên ảnh bỏ tiền tố `hu-`; `giot-he-*` = lớp giọt hệ (`hu-giot-he-<hệ>`) vẽ đè dọc vệt; `ring` = vòng sóng (ảnh hu-vong-song nhuộm màu); `he:drawCloud` = mây độc; `pillar` = cột lửa vẽ code (bị chặn, gần như không thấy).

## 1. Hệ × bậc × đòn → ảnh hiệu ứng, thời gian hiện, số lớp, hạt, cỡ

### Kiếm nặng 3 nhát

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 67x53; trung×6 320ms 32x32; hat-no×4 450ms 21x21; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 77x47; trung-nang×3 360ms 40x40 | 9 / 2 | 21 | 20004 |
| Lửa | Mầm | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 72x56; trung×6 320ms 32x32; hat-no×4 450ms 21x21; giot-he-fire(lưỡi lửa theo vệt)×3 260–340ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40 | 10 / 3 | 66 | 27616 |
| Lửa | Thành hình | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 75x59; trung×6 320ms 32x32; hat-no×4 450ms 21x21; giot-he-fire(lưỡi lửa theo vệt)×3 260–340ms; chem-kiem-nang-3 420ms 38x34; khoi-tron×2 620ms 21x22; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; no-lua 670ms 67x56 | 11 / 5 | 102 | 53294 |
| Lửa | Thức tỉnh | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 75x58; trung×6 320ms 32x32; hat-no×4 450ms 21x21; giot-he-fire(lưỡi lửa theo vệt)×3 260–340ms; khoi-tron 620ms 21x22; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; no-lua 670ms 67x56 | 12 / 5 | 115 | 53200 |
| Độc | Mầm | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 72x56; trung×6 320ms 32x32; hat-no×3 450ms 21x21; giot-he-poison(giọt độc theo vệt)×3 340–420ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40 | 11 / 3 | 38 | 45585 |
| Độc | Thành hình | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 75x59; trung×6 320ms 32x32; hat-no×3 450ms 21x21; giot-he-poison(giọt độc theo vệt)×3 340–420ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3283ms | 10 / 5 | 47 | 65967 |
| Độc | Thức tỉnh | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 75x58; trung×6 320ms 32x32; hat-no×3 450ms 21x21; giot-he-poison(giọt độc theo vệt)×3 340–420ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3283ms | 11 / 6 | 51 | 66427 |
| Băng | Mầm | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 72x56; trung×6 320ms 32x32; giot-he-ice(răng băng theo vệt)×3 240–300ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; hat-no 450ms 26x26 | 8 / 3 | 45 | 32751 |
| Băng | Thành hình | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 75x59; trung×6 320ms 32x32; hat-no×3 450ms 21x21/26x26; giot-he-ice(răng băng theo vệt)×3 240–300ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; gai-bang(hàng gai) 950ms; ring 260ms | 10 / 4 | 72 | 57845 |
| Băng | Thức tỉnh | chem-kiem-nang-1 250ms 41x15; chem-kiem-nang-2 320ms 75x58; trung×6 320ms 32x32; hat-no×5 450ms 21x21/26x26; giot-he-ice(răng băng theo vệt)×3 240–300ms; chem-kiem-nang-3 420ms 38x34; chem-kiem-nang-4 340ms 82x50; trung-nang×3 360ms 40x40; gai-bang(hàng gai) 1050ms; ring 260ms | 11 / 7 | 79 | 62009 |

### Kiếm: né rồi lướt chém

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | lon 440ms 40x20; chem-luot 320ms 58x25; trung×3 320ms 32x32; hat-no 450ms 21x21 | 6 / 3 | 23 | 8568 |
| Lửa | Mầm | lon 440ms 40x20; chem-luot-fire 320ms 58x25; giot-he-fire(lưỡi lửa theo vệt) 260ms; trung×3 320ms 32x32 | 6 / 4 | 35 | 5850 |
| Lửa | Thành hình | lon 440ms 40x20; khoi-tron 620ms 21x22; chem-luot-fire 320ms 58x25; hat-no×2 450ms 21x21; giot-he-fire(lưỡi lửa theo vệt) 260ms; trung×3 320ms 32x32 | 9 / 3 | 43 | 5892 |
| Lửa | Thức tỉnh | lon 440ms 40x20; khoi-tron 620ms 21x22; chem-luot-fire 320ms 58x25; hat-no×3 450ms 21x21; giot-he-fire(lưỡi lửa theo vệt) 260ms; trung×3 320ms 32x32 | 10 / 6 | 56 | 9135 |
| Độc | Mầm | lon 440ms 40x20; chem-luot-poison 320ms 58x25; giot-he-poison(giọt độc theo vệt) 340ms; trung×3 320ms 32x32 | 6 / 5 | 30 | 13716 |
| Độc | Thành hình | lon 440ms 40x20; khoi-tron 620ms 21x22; chem-luot-poison 320ms 58x25; hat-no×2 450ms 21x21; giot-he-poison(giọt độc theo vệt) 340ms; trung×3 320ms 32x32 | 9 / 3 | 32 | 10448 |
| Độc | Thức tỉnh | lon 440ms 40x20; khoi-tron 620ms 21x22; chem-luot-poison 320ms 58x25; hat-no×3 450ms 21x21; giot-he-poison(giọt độc theo vệt) 340ms; trung×3 320ms 32x32 | 10 / 4 | 36 | 15264 |
| Băng | Mầm | lon 440ms 40x20; chem-luot-ice 320ms 58x25; giot-he-ice(răng băng theo vệt) 240ms; trung×3 320ms 32x32; hat-no 450ms 21x21 | 7 / 4 | 29 | 10852 |
| Băng | Thành hình | lon 440ms 40x20; khoi-tron 620ms 21x22; chem-luot-ice 320ms 58x25; hat-no×2 450ms 21x21; giot-he-ice(răng băng theo vệt) 240ms; trung×3 320ms 32x32 | 9 / 6 | 36 | 8657 |
| Băng | Thức tỉnh | lon 440ms 40x20; khoi-tron×2 620ms 21x22; chem-luot-ice 320ms 58x25; hat-no×3 450ms 21x21/26x26; giot-he-ice(răng băng theo vệt) 240ms; trung×3 320ms 32x32 | 10 / 5 | 42 | 13428 |

### Kiếm: Trảm Nguyệt (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | ra-chieu 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; flash 100ms | 6 / 5 | 27 | 18150 |
| Lửa | Mầm | ra-chieu-fire 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; flash 100ms; hat-no 450ms 21x21 | 6 / 6 | 43 | 22988 |
| Lửa | Thành hình | ra-chieu-fire 320ms 41x41; khoi-tron×2 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; pillar×6 300ms; hat-no 450ms 21x21; flash 100ms | 8 / 10 | 63 | 30688 |
| Lửa | Thức tỉnh | ra-chieu-fire 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; pillar×6 300ms; flash 100ms; hat-no 450ms 21x21 | 8 / 10 | 67 | 34332 |
| Độc | Mầm | ra-chieu-poison 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; hat-no 450ms 21x21; flash 100ms | 6 / 5 | 34 | 36251 |
| Độc | Thành hình | ra-chieu-poison 320ms 41x41; khoi-tron×2 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; doc-toe×2 720ms 42x31; ring×2 340ms; flash 100ms; hat-no 450ms 21x21; he:drawCloud×2 3492ms | 11 / 10 | 37 | 102190 |
| Độc | Thức tỉnh | ra-chieu-poison 320ms 41x41; hat-no×3 450ms 21x21/26x26; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; doc-toe×2 720ms 42x31; ring×2 340ms; flash 100ms; he:drawCloud×2 3492ms | 12 / 11 | 40 | 105143 |
| Băng | Mầm | ra-chieu-ice 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; hat-no 450ms 21x21; flash 100ms | 7 / 4 | 33 | 28351 |
| Băng | Thành hình | ra-chieu-ice 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; he:draw 30000ms; gai-bang(hàng gai) 950ms; ring 260ms; flash 100ms; hat-no 450ms 21x21 | 6 / 6 | 38 | 114764 |
| Băng | Thức tỉnh | ra-chieu-ice 320ms 41x41; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; hat-no×3 450ms 21x21/26x26; he:draw 30000ms; gai-bang(hàng gai) 1050ms; ring 260ms; flash 100ms | 8 / 6 | 46 | 127302 |

### Thương: 3 đâm + quét vòng

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung×9 320ms 32x32; hat-no×4 450ms 21x21; dam-giao×3 300ms 95x34; trung-nang×3 360ms 40x40; quet-giao 420ms 98x34; ring 260ms | 9 / 2 | 17 | 54620 |
| Lửa | Mầm | trung×9 320ms 32x32; dam-giao×3 300ms 95x34; giot-he-fire(lưỡi lửa theo vệt)×4 260–340ms; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; quet-giao-fire 420ms 98x34; ring 260ms | 8 / 4 | 61 | 72570 |
| Lửa | Thành hình | trung×9 320ms 32x32; hat-no×9 450ms 21x21; dam-giao×3 300ms 95x34; giot-he-fire(lưỡi lửa theo vệt)×4 260–340ms; khoi-tron×2 620ms 21x22; trung-nang×3 360ms 40x40; quet-giao-fire 420ms 98x34; ring 260ms; no-lua 670ms 67x56 | 14 / 6 | 90 | 99740 |
| Lửa | Thức tỉnh | trung×9 320ms 32x32; hat-no×11 450ms 21x21; dam-giao×3 300ms 95x34; giot-he-fire(lưỡi lửa theo vệt)×4 260–340ms; trung-nang×3 360ms 40x40; quet-giao-fire 420ms 98x34; ring 260ms; no-lua 670ms 67x56; khoi-tron 620ms 21x22 | 15 / 7 | 96 | 107328 |
| Độc | Mầm | trung×9 320ms 32x32; hat-no×7 450ms 21x21; dam-giao×3 300ms 95x34; giot-he-poison(giọt độc theo vệt)×4 340–420ms; trung-nang×3 360ms 40x40; quet-giao-poison 420ms 98x34; ring 260ms | 13 / 3 | 46 | 104711 |
| Độc | Thành hình | trung×9 320ms 32x32; hat-no×5 450ms 21x21; dam-giao×3 300ms 95x34; giot-he-poison(giọt độc theo vệt)×4 340–420ms; trung-nang×3 360ms 40x40; quet-giao-poison 420ms 98x34; ring×2 260–340ms; doc-toe 720ms 42x31; he:drawCloud 3283ms | 12 / 6 | 57 | 128592 |
| Độc | Thức tỉnh | trung×9 320ms 32x32; hat-no×4 450ms 21x21; dam-giao×3 300ms 95x34; giot-he-poison(giọt độc theo vệt)×4 340–420ms; khoi-tron×2 620ms 21x22; trung-nang×3 360ms 40x40; quet-giao-poison 420ms 98x34; ring×2 260–340ms; doc-toe 720ms 42x31; he:drawCloud 3283ms | 13 / 6 | 63 | 135312 |
| Băng | Mầm | trung×9 320ms 32x32; hat-no×2 450ms 21x21/26x26; dam-giao×3 300ms 95x34; giot-he-ice(răng băng theo vệt)×4 240–300ms; khoi-tron 620ms 21x22; trung-nang×3 360ms 40x40; quet-giao-ice 420ms 98x34; ring 260ms | 10 / 3 | 44 | 81606 |
| Băng | Thành hình | trung×9 320ms 32x32; hat-no×11 450ms 21x21/26x26; dam-giao×3 300ms 95x34; giot-he-ice(răng băng theo vệt)×4 240–300ms; khoi-tron×2 620ms 21x22/26x27; trung-nang×3 360ms 40x40; quet-giao-ice 420ms 98x34; ring×2 260ms; dong-bang 420ms 55x55; gai-bang(hàng gai) 950ms | 15 / 5 | 78 | 106261 |
| Băng | Thức tỉnh | trung×9 320ms 32x32; hat-no×13 450ms 21x21/26x26; dam-giao×3 300ms 95x34; giot-he-ice(răng băng theo vệt)×4 240–300ms; trung-nang×3 360ms 40x40; quet-giao-ice 420ms 98x34; ring×2 260ms; dong-bang×3 420ms 55x55; khoi-tron×2 620ms 21x22; gai-bang(hàng gai) 1050ms | 19 / 5 | 108 | 115828 |

### Thương: giữ → xốc tới

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | xoc-toi 420ms 52x21; trung-nang×3 360ms 40x40 | 4 / 2 | 17 | 2239 |
| Lửa | Mầm | xoc-toi 420ms 52x21; giot-he-fire(lưỡi lửa theo vệt) 260ms; hat-no 450ms 21x21; trung-nang×3 360ms 40x40 | 6 / 2 | 35 | 5220 |
| Lửa | Thành hình | xoc-toi 420ms 52x21; giot-he-fire(lưỡi lửa theo vệt) 260ms; hat-no×3 450ms 21x21; pillar×2 300ms; trung-nang×3 360ms 40x40 | 10 / 5 | 62 | 6781 |
| Lửa | Thức tỉnh | xoc-toi 420ms 52x21; giot-he-fire(lưỡi lửa theo vệt) 260ms; hat-no×3 450ms 21x21; pillar×2 300ms; trung-nang×3 360ms 40x40 | 9 / 5 | 73 | 7810 |
| Độc | Mầm | xoc-toi 420ms 52x21; giot-he-poison(giọt độc theo vệt) 340ms; trung-nang×3 360ms 40x40; hat-no 450ms 21x21 | 6 / 3 | 28 | 9762 |
| Độc | Thành hình | xoc-toi 420ms 52x21; giot-he-poison(giọt độc theo vệt) 340ms; doc-toe×2 720ms 42x31; ring×2 340ms; he:drawCloud×2 3283ms; trung-nang×3 360ms 40x40; khoi-tron 620ms 21x22 | 12 / 9 | 37 | 55243 |
| Độc | Thức tỉnh | xoc-toi 420ms 52x21; giot-he-poison(giọt độc theo vệt) 340ms; doc-toe×2 720ms 42x31; ring×2 340ms; he:drawCloud×2 3283ms; trung-nang×3 360ms 40x40; hat-no×2 450ms 21x21 | 13 / 9 | 32 | 55212 |
| Băng | Mầm | xoc-toi 420ms 52x21; giot-he-ice(răng băng theo vệt) 240ms; trung-nang×3 360ms 40x40; hat-no 450ms 21x21 | 6 / 2 | 27 | 6356 |
| Băng | Thành hình | xoc-toi 420ms 52x21; giot-he-ice(răng băng theo vệt) 240ms; hat-no×2 450ms 26x26; gai-bang(hàng gai) 950ms; ring 260ms; trung-nang×3 360ms 40x40 | 9 / 4 | 53 | 33400 |
| Băng | Thức tỉnh | xoc-toi 420ms 52x21; giot-he-ice(răng băng theo vệt) 240ms; hat-no×3 450ms 21x21/26x26; gai-bang(hàng gai) 1050ms; ring 260ms; trung-nang×3 360ms 40x40; khoi-tron 620ms 21x22 | 10 / 5 | 60 | 37631 |

### Thương: Phi Thương (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | ra-chieu 320ms 34x34; he:draw 30000ms; trung-nang×3 360ms 40x40; hat-no×3 450ms 21x21; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 32x32; flash 100ms | 9 / 6 | 18 | 13841 |
| Lửa | Mầm | ra-chieu-fire 320ms 34x34; he:draw 30000ms; trung-nang×3 360ms 40x40; hat-no×3 450ms 21x21; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 32x32; flash 100ms | 9 / 6 | 33 | 16559 |
| Lửa | Thành hình | ra-chieu-fire 320ms 34x34; hat-no×5 450ms 21x21; he:draw 30000ms; trung-nang×3 360ms 40x40; pillar×2 300ms; va-cham 320ms 34x23; ring×2 180–240ms; khoi-tron 620ms 21x22; trung×2 320ms 32x32; flash 100ms | 13 / 12 | 70 | 29114 |
| Lửa | Thức tỉnh | ra-chieu-fire 320ms 34x34; he:draw 30000ms; trung-nang×3 360ms 40x40; hat-no×2 450ms 21x21; pillar×2 300ms; va-cham 320ms 34x23; ring×2 180–240ms; khoi-tron 620ms 21x22; trung×2 320ms 32x32; flash 100ms | 10 / 11 | 75 | 51422 |
| Độc | Mầm | ra-chieu-poison 320ms 34x34; he:draw 30000ms; trung-nang×3 360ms 40x40; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 32x32; hat-no 450ms 21x21; flash 100ms | 7 / 6 | 25 | 12656 |
| Độc | Thành hình | ra-chieu-poison 320ms 34x34; hat-no×6 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 40x40; doc-toe×2 720ms 42x31; ring×4 180–340ms; va-cham 320ms 34x23; he:drawCloud×2 3300ms; khoi-tron 620ms 21x22; trung×2 320ms 32x32; flash 100ms | 16 / 13 | 52 | 137174 |
| Độc | Thức tỉnh | ra-chieu-poison 320ms 34x34; hat-no×5 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 40x40; doc-toe×2 720ms 42x31; ring×4 180–340ms; va-cham 320ms 34x23; he:drawCloud×2 3300ms; trung×2 320ms 32x32; flash 100ms | 16 / 13 | 59 | 159820 |
| Băng | Mầm | ra-chieu-ice 320ms 34x34; hat-no×5 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 40x40; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 32x32; flash 100ms | 10 / 6 | 24 | 18404 |
| Băng | Thành hình | ra-chieu-ice 320ms 34x34; he:draw 30000ms; trung-nang×3 360ms 40x40; hat-no×4 450ms 21x21/26x26; gai-bang(hàng gai) 950ms; ring×3 180–260ms; va-cham 320ms 34x23; trung×2 320ms 32x32; flash 100ms; khoi-tron 620ms 21x22 | 12 / 10 | 48 | 109070 |
| Băng | Thức tỉnh | ra-chieu-ice 320ms 34x34; he:draw 30000ms; trung-nang×3 360ms 40x40; hat-no×3 450ms 21x21/26x26; gai-bang(hàng gai) 1050ms; ring×3 180–260ms; khoi-tron×2 620ms 21x22/26x27; va-cham 320ms 34x23; trung×2 320ms 32x32; flash 100ms | 14 / 9 | 55 | 145662 |

### Búa: nện thường

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×3 360ms 40x40; chem-bua 360ms 57x57; crack 1600ms; nen-dat 480ms 53x32 | 6 / 3 | 8 | 12020 |
| Lửa | Mầm | trung-nang×3 360ms 40x40; chem-bua 360ms 56x56; crack 1600ms; nen-dat-fire 480ms 53x32; giot-he-fire(lưỡi lửa theo vệt) 260ms | 7 / 4 | 24 | 13282 |
| Lửa | Thành hình | trung-nang×3 360ms 40x40; chem-bua 360ms 56x56; crack 1600ms; nen-dat-fire 480ms 53x32; giot-he-fire(lưỡi lửa theo vệt) 260ms | 7 / 4 | 49 | 11956 |
| Lửa | Thức tỉnh | trung-nang×3 360ms 40x40; chem-bua 360ms 60x60; crack 1600ms; nen-dat-fire 480ms 53x32; giot-he-fire(lưỡi lửa theo vệt) 260ms | 7 / 4 | 55 | 12375 |
| Độc | Mầm | trung-nang×3 360ms 40x40; chem-bua 360ms 56x56; crack 1600ms; nen-dat-poison 480ms 53x32; giot-he-poison(giọt độc theo vệt) 340ms | 7 / 4 | 16 | 20766 |
| Độc | Thành hình | trung-nang×3 360ms 40x40; chem-bua 360ms 56x56; crack 1600ms; nen-dat-poison 480ms 53x32; giot-he-poison(giọt độc theo vệt) 340ms | 7 / 4 | 22 | 22853 |
| Độc | Thức tỉnh | trung-nang×3 360ms 40x40; chem-bua 360ms 60x60; crack 1600ms; nen-dat-poison 480ms 53x32; giot-he-poison(giọt độc theo vệt) 340ms | 7 / 4 | 27 | 22309 |
| Băng | Mầm | trung-nang×3 360ms 40x40; chem-bua 360ms 56x56; crack 1600ms; nen-dat-ice 480ms 53x32; giot-he-ice(răng băng theo vệt) 240ms | 7 / 4 | 21 | 14447 |
| Băng | Thành hình | trung-nang×3 360ms 40x40; hat-no 450ms 26x26; chem-bua 360ms 56x56; crack 1600ms; nen-dat-ice 480ms 53x32; giot-he-ice(răng băng theo vệt) 240ms | 8 / 4 | 40 | 16389 |
| Băng | Thức tỉnh | trung-nang×3 360ms 40x40; chem-bua 360ms 60x60; crack 1600ms; nen-dat-ice 480ms 53x32; giot-he-ice(răng băng theo vệt) 240ms | 7 / 4 | 38 | 15843 |

### Búa: nện đất nấc 1

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat 480ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 14 | 32846 |
| Lửa | Mầm | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-fire 480ms 64x38; ring 280ms; giot-he-fire(lưỡi lửa theo vệt) 340ms; he:draw 333ms | 11 / 6 | 51 | 32278 |
| Lửa | Thành hình | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-fire 480ms 64x38; ring 280ms; giot-he-fire(lưỡi lửa theo vệt) 340ms; no-lua 670ms 67x56; he:draw 333ms | 12 / 7 | 100 | 47738 |
| Lửa | Thức tỉnh | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-fire 480ms 64x38; ring 280ms; giot-he-fire(lưỡi lửa theo vệt) 340ms; hat-no 450ms 21x21; no-lua 670ms 67x56; he:draw 333ms | 13 / 7 | 107 | 49600 |
| Độc | Mầm | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-poison 480ms 64x38; ring 280ms; giot-he-poison(giọt độc theo vệt) 420ms; he:draw 333ms | 11 / 6 | 28 | 40910 |
| Độc | Thành hình | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-poison 480ms 64x38; ring×2 280–340ms; giot-he-poison(giọt độc theo vệt) 420ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 14 / 9 | 43 | 56234 |
| Độc | Thức tỉnh | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-poison 480ms 64x38; ring×2 280–340ms; giot-he-poison(giọt độc theo vệt) 420ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 14 / 9 | 44 | 63110 |
| Băng | Mầm | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-ice 480ms 64x38; ring 280ms; giot-he-ice(răng băng theo vệt) 300ms; he:draw 333ms | 11 / 6 | 41 | 34560 |
| Băng | Thành hình | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-ice 480ms 64x38; ring×2 260–280ms; giot-he-ice(răng băng theo vệt) 300ms; gai-bang(hàng gai) 950ms; dong-bang×3 420ms 55x55; hat-no 450ms 26x26; he:draw 333ms | 17 / 8 | 94 | 60408 |
| Băng | Thức tỉnh | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-ice 480ms 64x38; ring×2 260–280ms; giot-he-ice(răng băng theo vệt) 300ms; gai-bang(hàng gai) 1050ms; dong-bang×3 420ms 55x55; khoi-tron 620ms 21x22; he:draw 333ms | 17 / 8 | 102 | 62704 |

### Búa: nện đất nấc 2

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat 480ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 14 | 33076 |
| Lửa | Mầm | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-fire 480ms 64x38; ring 280ms; giot-he-fire(lưỡi lửa theo vệt) 340ms; he:draw 333ms | 11 / 6 | 56 | 31595 |
| Lửa | Thành hình | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-fire 480ms 64x38; khoi-tron×3 620ms 21x22/26x27; ring 280ms; giot-he-fire(lưỡi lửa theo vệt) 340ms; hat-no×2 450ms 21x21; no-lua 670ms 67x56; he:draw 333ms | 16 / 9 | 107 | 46692 |
| Lửa | Thức tỉnh | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-fire 480ms 64x38; khoi-tron×2 620ms 21x22; ring 280ms; giot-he-fire(lưỡi lửa theo vệt) 340ms; hat-no 450ms 21x21; no-lua 670ms 67x56; he:draw 333ms | 14 / 9 | 112 | 49282 |
| Độc | Mầm | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-poison 480ms 64x38; ring 280ms; giot-he-poison(giọt độc theo vệt) 420ms; he:draw 333ms | 11 / 7 | 28 | 40075 |
| Độc | Thành hình | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-poison 480ms 64x38; ring×2 280–340ms; giot-he-poison(giọt độc theo vệt) 420ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 14 / 10 | 45 | 59910 |
| Độc | Thức tỉnh | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-poison 480ms 64x38; ring×2 280–340ms; giot-he-poison(giọt độc theo vệt) 420ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 14 / 9 | 47 | 64338 |
| Băng | Mầm | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-ice 480ms 64x38; ring 280ms; giot-he-ice(răng băng theo vệt) 300ms; hat-no 450ms 26x26; he:draw 333ms | 12 / 7 | 38 | 34522 |
| Băng | Thành hình | trung-nang×5 360ms 40x40; chem-bua 360ms 46x46; crack 1600ms; nen-dat-ice 480ms 64x38; ring×2 260–280ms; giot-he-ice(răng băng theo vệt) 300ms; hat-no×3 450ms 26x26; gai-bang(hàng gai) 950ms; dong-bang×3 420ms 55x55; khoi-tron 620ms 21x22; he:draw 333ms | 20 / 8 | 94 | 53724 |
| Băng | Thức tỉnh | trung-nang×5 360ms 40x40; hat-no×5 450ms 26x26; chem-bua 360ms 46x46; crack 1600ms; nen-dat-ice 480ms 64x38; ring×2 260–280ms; giot-he-ice(răng băng theo vệt) 300ms; gai-bang(hàng gai) 1050ms; khoi-tron×2 620ms 21x22/26x27; dong-bang×3 420ms 55x55; he:draw 333ms | 23 / 9 | 96 | 63328 |

### Búa: Địa Chấn (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×6 360ms 40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat 480ms 69x42; khoi-tron×2 620ms 26x27 | 13 / 7 | 24 | 70131 |
| Lửa | Mầm | trung-nang×6 360ms 40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-fire 480ms 69x42; khoi-tron×2 620ms 26x27; hat-no 450ms 21x21 | 13 / 6 | 63 | 61459 |
| Lửa | Thành hình | trung-nang×6 360ms 40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-fire 480ms 69x42; khoi-tron×3 620ms 21x22/26x27; pillar×6 300ms | 14 / 12 | 92 | 66370 |
| Lửa | Thức tỉnh | trung-nang×6 360ms 40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-fire 480ms 69x42; khoi-tron×2 620ms 21x22/26x27; pillar×6 300ms | 13 / 13 | 94 | 70861 |
| Độc | Mầm | trung-nang×6 360ms 40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-poison 480ms 69x42; khoi-tron×2 620ms 21x22/26x27 | 12 / 7 | 48 | 72135 |
| Độc | Thành hình | trung-nang×6 360ms 40x40; ring×4 200–340ms; he:draw 30000ms; crack 1600ms; nen-dat-poison 480ms 69x42; khoi-tron×2 620ms 21x22/26x27; doc-toe×2 720ms 42x31; he:drawCloud×2 3588ms | 17 / 14 | 56 | 137529 |
| Độc | Thức tỉnh | trung-nang×6 360ms 40x40; ring×4 200–340ms; he:draw 30000ms; crack 1600ms; nen-dat-poison 480ms 69x42; khoi-tron×3 620ms 21x22/26x27; doc-toe×2 720ms 42x31; he:drawCloud×2 3588ms | 17 / 13 | 55 | 139863 |
| Băng | Mầm | trung-nang×6 360ms 40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-ice 480ms 69x42; khoi-tron×2 620ms 26x27; hat-no 450ms 26x26 | 13 / 6 | 52 | 71215 |
| Băng | Thành hình | trung-nang×6 360ms 40x40; ring×3 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-ice 480ms 69x42; khoi-tron×3 620ms 21x22/26x27; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 950ms | 17 / 9 | 108 | 146318 |
| Băng | Thức tỉnh | trung-nang×6 360ms 40x40; ring×3 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-ice 480ms 69x42; khoi-tron×4 620ms 21x22/26x27; dong-bang×3 420ms 55x55; hat-no 450ms 26x26; gai-bang(hàng gai) 1050ms | 19 / 10 | 104 | 161534 |

### Phi tiêu: 3 phát

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | hat-no×3 450ms 21x21; trung-phi-tieu×4 320ms 26x26 | 4 / 3 | 8 | 0 |
| Lửa | Mầm | trung-phi-tieu×4 320ms 26x26; hat-no×2 450ms 21x21 | 3 / 3 | 17 | 1476 |
| Lửa | Thành hình | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 26x18; ring×4 220ms; khoi-tron 620ms 21x22; hat-no 450ms 21x21 | 8 / 5 | 66 | 781 |
| Lửa | Thức tỉnh | hat-no×3 450ms 21x21; trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 26x18; ring×4 220ms | 8 / 6 | 82 | 2940 |
| Độc | Mầm | trung-phi-tieu×4 320ms 26x26 | 2 / 3 | 21 | 21990 |
| Độc | Thành hình | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 22x15; ring×4 200ms; hat-no×2 450ms 21x21 | 8 / 7 | 46 | 24587 |
| Độc | Thức tỉnh | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 22x15; ring×4 200ms; hat-no×2 450ms 21x21; khoi-tron 620ms 26x27 | 9 / 7 | 51 | 22223 |
| Băng | Mầm | trung-phi-tieu×4 320ms 26x26; hat-no×2 450ms 21x21 | 4 / 2 | 17 | 6699 |
| Băng | Thành hình | trung-phi-tieu×6 320ms 26x26; flash×6 90ms; hat-no×5 450ms 21x21/26x26 | 8 / 5 | 41 | 10600 |
| Băng | Thức tỉnh | hat-no×5 450ms 21x21/26x26; trung-phi-tieu×6 320ms 26x26; flash×6 90ms | 7 / 5 | 44 | 10751 |

### Phi tiêu: giữ → ném chùm

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26 | 3 / 3 | 15 | 6299 |
| Lửa | Mầm | phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no 450ms 21x21 | 4 / 5 | 28 | 8053 |
| Lửa | Thành hình | phi-tieu-chum 420ms 39x39; hat-no×4 450ms 21x21; trung-phi-tieu×2 320ms 26x26; va-cham×2 320ms 26x18; ring×2 220ms | 11 / 9 | 62 | 8102 |
| Lửa | Thức tỉnh | hat-no×3 450ms 21x21; phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26; va-cham×2 320ms 26x18; ring×2 220ms | 9 / 9 | 68 | 7296 |
| Độc | Mầm | phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no×2 450ms 21x21 | 5 / 3 | 23 | 17819 |
| Độc | Thành hình | phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no 450ms 21x21; va-cham×2 320ms 22x15; ring×2 200ms; khoi-tron 620ms 26x27 | 9 / 6 | 35 | 24080 |
| Độc | Thức tỉnh | phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no 450ms 21x21; va-cham×2 320ms 22x15; ring×2 200ms | 8 / 6 | 36 | 20838 |
| Băng | Mầm | phi-tieu-chum 420ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no 450ms 21x21 | 4 / 3 | 22 | 8830 |
| Băng | Thành hình | phi-tieu-chum 420ms 39x39; trung-phi-tieu×3 320ms 26x26; hat-no×5 450ms 21x21/26x26; flash×3 90ms | 11 / 4 | 37 | 8780 |
| Băng | Thức tỉnh | phi-tieu-chum 420ms 39x39; trung-phi-tieu×3 320ms 26x26; hat-no×4 450ms 21x21/26x26; flash×3 90ms | 10 / 5 | 44 | 8630 |

### Phi tiêu: mưa (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | hat-no 450ms 21x21 | 1 / 0 | 6 | 0 |
| Lửa | Mầm | hat-no 450ms 21x21 | 1 / 1 | 37 | 0 |
| Lửa | Thành hình | khoi-tron×2 620ms 21x22; no-lua 670ms 67x56; hat-no 450ms 21x21 | 3 / 2 | 64 | 27372 |
| Lửa | Thức tỉnh | no-lua 670ms 67x56 | 1 / 3 | 79 | 27372 |
| Độc | Mầm | hat-no 450ms 21x21 | 1 / 1 | 27 | 0 |
| Độc | Thành hình | hat-no 450ms 21x21; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3108ms; khoi-tron 620ms 21x22 | 3 / 4 | 48 | 36132 |
| Độc | Thức tỉnh | hat-no×2 450ms 21x21; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3108ms | 3 / 4 | 51 | 34684 |
| Băng | Mầm | hat-no×2 450ms 21x21/26x26 | 2 / 0 | 20 | 0 |
| Băng | Thành hình | hat-no×5 450ms 21x21/26x26; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 950ms; ring 260ms; khoi-tron 620ms 21x22 | 10 / 4 | 80 | 37862 |
| Băng | Thức tỉnh | hat-no×3 450ms 26x26; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 1050ms; ring×4 260–280ms; bang-vo×3 420ms 58x58; khoi-tron 620ms 26x27 | 14 / 7 | 138 | 45034 |

### Chưởng (cây theo hệ)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| Lửa | chưa học | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25; khoi-tron 620ms 21x22 | 5 / 6 | 49 | 31337 |
| Lửa | chưa học | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; khoi-tron 620ms 21x22; vong-phep 620ms 37x25 | 5 / 7 | 50 | 30136 |
| Lửa | đủ cây | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 46 | 30842 |
| Độc | chưa học | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 46 | 31576 |
| Độc | chưa học | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 4 | 49 | 30437 |
| Độc | đủ cây | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 47 | 30136 |
| Băng | chưa học | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 47 | 30187 |
| Băng | chưa học | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 50 | 30188 |
| Băng | đủ cây | ra-chuong-fire 320ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 6 | 48 | 30848 |

## Lên bậc thì hình đổi gì (trúng 3 quái)

| Đòn | Hệ | Mầm → Thành hình | Thành hình → Thức tỉnh | Nhận xét |
|---|---|---|---|---|
| Kiếm nặng 3 nhát | Lửa | thêm khoi-tron, no-lua; lớp +1, hạt +36, điểm ảnh vệt +93% | lớp +1, hạt +13, điểm ảnh vệt -0% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (12 lớp, 115 hạt) |
| Kiếm nặng 3 nhát | Độc | thêm he:drawCloud, doc-toe, ring; lớp -1, hạt +9, điểm ảnh vệt +45% | lớp +1, hạt +4, điểm ảnh vệt +1% | Thành hình→Thức tỉnh: không đổi gì |
| Kiếm nặng 3 nhát | Băng | thêm gai-bang(hàng gai), ring; lớp +2, hạt +27, điểm ảnh vệt +77% | lớp +1, hạt +7, điểm ảnh vệt +7% | Thành hình→Thức tỉnh: không đổi gì |
| Kiếm: né rồi lướt chém | Lửa | thêm hat-no, khoi-tron; lớp +3, hạt +8, điểm ảnh vệt +1% | lớp +1, hạt +13, điểm ảnh vệt +55% | — |
| Kiếm: né rồi lướt chém | Độc | thêm hat-no, khoi-tron; lớp +3, hạt +2, điểm ảnh vệt -24% | lớp +1, hạt +4, điểm ảnh vệt +46% | — |
| Kiếm: né rồi lướt chém | Băng | thêm khoi-tron; lớp +2, hạt +7, điểm ảnh vệt -20% | lớp +1, hạt +6, điểm ảnh vệt +55% | — |
| Kiếm: Trảm Nguyệt (Đặc biệt) | Lửa | thêm pillar; lớp +2, hạt +20, điểm ảnh vệt +33% | lớp +0, hạt +4, điểm ảnh vệt +12% | Thành hình→Thức tỉnh: đổi quá ít |
| Kiếm: Trảm Nguyệt (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe, ring; lớp +5, hạt +3, điểm ảnh vệt +182% | lớp +1, hạt +3, điểm ảnh vệt +3% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (12 lớp, 40 hạt) |
| Kiếm: Trảm Nguyệt (Đặc biệt) | Băng | thêm gai-bang(hàng gai), ring; lớp -1, hạt +5, điểm ảnh vệt +305% | lớp +2, hạt +8, điểm ảnh vệt +11% | Thành hình→Thức tỉnh: đổi quá ít |
| Thương: 3 đâm + quét vòng | Lửa | thêm hat-no, no-lua; lớp +6, hạt +29, điểm ảnh vệt +37% | lớp +1, hạt +6, điểm ảnh vệt +8% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (15 lớp, 96 hạt) |
| Thương: 3 đâm + quét vòng | Độc | thêm he:drawCloud, doc-toe; lớp -1, hạt +11, điểm ảnh vệt +23% | thêm khoi-tron; lớp +1, hạt +6, điểm ảnh vệt +5% | Thức tỉnh quá rối (13 lớp, 63 hạt) |
| Thương: 3 đâm + quét vòng | Băng | thêm gai-bang(hàng gai), dong-bang; lớp +5, hạt +34, điểm ảnh vệt +30% | lớp +4, hạt +30, điểm ảnh vệt +9% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (19 lớp, 108 hạt) |
| Thương: giữ → xốc tới | Lửa | thêm pillar; lớp +4, hạt +27, điểm ảnh vệt +30% | lớp -1, hạt +11, điểm ảnh vệt +15% | Thành hình→Thức tỉnh: đổi quá ít |
| Thương: giữ → xốc tới | Độc | thêm he:drawCloud, doc-toe, khoi-tron, ring; bớt hat-no; lớp +6, hạt +9, điểm ảnh vệt +466% | thêm hat-no; bớt khoi-tron; lớp +1, hạt -5, điểm ảnh vệt -0% | Thức tỉnh quá rối (13 lớp, 32 hạt) |
| Thương: giữ → xốc tới | Băng | thêm gai-bang(hàng gai), ring; lớp +3, hạt +26, điểm ảnh vệt +425% | thêm khoi-tron; lớp +1, hạt +7, điểm ảnh vệt +13% | — |
| Thương: Phi Thương (Đặc biệt) | Lửa | thêm khoi-tron, pillar; lớp +4, hạt +37, điểm ảnh vệt +76% | lớp -3, hạt +5, điểm ảnh vệt +77% | — |
| Thương: Phi Thương (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe, khoi-tron; lớp +9, hạt +27, điểm ảnh vệt +984% | bớt khoi-tron; lớp +0, hạt +7, điểm ảnh vệt +17% | Thành hình→Thức tỉnh: đổi quá ít; Thức tỉnh quá rối (16 lớp, 59 hạt) |
| Thương: Phi Thương (Đặc biệt) | Băng | thêm gai-bang(hàng gai), khoi-tron; lớp +2, hạt +24, điểm ảnh vệt +493% | lớp +2, hạt +7, điểm ảnh vệt +34% | Thức tỉnh quá rối (14 lớp, 55 hạt) |
| Búa: nện thường | Lửa | lớp +0, hạt +25, điểm ảnh vệt -10% | lớp +0, hạt +6, điểm ảnh vệt +4% | Mầm→Thành hình: không đổi gì; Thành hình→Thức tỉnh: không đổi gì |
| Búa: nện thường | Độc | lớp +0, hạt +6, điểm ảnh vệt +10% | lớp +0, hạt +5, điểm ảnh vệt -2% | Mầm→Thành hình: đổi quá ít; Thành hình→Thức tỉnh: không đổi gì |
| Búa: nện thường | Băng | thêm hat-no; lớp +1, hạt +19, điểm ảnh vệt +13% | bớt hat-no; lớp -1, hạt -2, điểm ảnh vệt -3% | Thành hình→Thức tỉnh: đổi quá ít |
| Búa: nện đất nấc 1 | Lửa | thêm no-lua; lớp +1, hạt +49, điểm ảnh vệt +48% | thêm hat-no; lớp +1, hạt +7, điểm ảnh vệt +4% | Thức tỉnh quá rối (13 lớp, 107 hạt) |
| Búa: nện đất nấc 1 | Độc | thêm he:drawCloud, doc-toe; lớp +3, hạt +15, điểm ảnh vệt +37% | lớp +0, hạt +1, điểm ảnh vệt +12% | Thành hình→Thức tỉnh: đổi quá ít; Thức tỉnh quá rối (14 lớp, 44 hạt) |
| Búa: nện đất nấc 1 | Băng | thêm gai-bang(hàng gai), dong-bang, hat-no; lớp +6, hạt +53, điểm ảnh vệt +75% | thêm khoi-tron; bớt hat-no; lớp +0, hạt +8, điểm ảnh vệt +4% | Thức tỉnh quá rối (17 lớp, 102 hạt) |
| Búa: nện đất nấc 2 | Lửa | thêm hat-no, khoi-tron, no-lua; lớp +5, hạt +51, điểm ảnh vệt +48% | lớp -2, hạt +5, điểm ảnh vệt +6% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (14 lớp, 112 hạt) |
| Búa: nện đất nấc 2 | Độc | thêm he:drawCloud, doc-toe; lớp +3, hạt +17, điểm ảnh vệt +49% | lớp +0, hạt +2, điểm ảnh vệt +7% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (14 lớp, 47 hạt) |
| Búa: nện đất nấc 2 | Băng | thêm gai-bang(hàng gai), dong-bang, khoi-tron; lớp +8, hạt +56, điểm ảnh vệt +56% | lớp +3, hạt +2, điểm ảnh vệt +18% | Thành hình→Thức tỉnh: đổi quá ít; Thức tỉnh quá rối (23 lớp, 96 hạt) |
| Búa: Địa Chấn (Đặc biệt) | Lửa | thêm pillar; bớt hat-no; lớp +1, hạt +29, điểm ảnh vệt +8% | lớp -1, hạt +2, điểm ảnh vệt +7% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (13 lớp, 94 hạt) |
| Búa: Địa Chấn (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe; lớp +5, hạt +8, điểm ảnh vệt +91% | lớp +0, hạt -1, điểm ảnh vệt +2% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (17 lớp, 55 hạt) |
| Búa: Địa Chấn (Đặc biệt) | Băng | thêm gai-bang(hàng gai), dong-bang; bớt hat-no; lớp +4, hạt +56, điểm ảnh vệt +105% | thêm hat-no; lớp +2, hạt -4, điểm ảnh vệt +10% | Thức tỉnh quá rối (19 lớp, 104 hạt) |
| Phi tiêu: 3 phát | Lửa | thêm khoi-tron, va-cham, ring; lớp +5, hạt +49, điểm ảnh vệt -47% | bớt khoi-tron; lớp +0, hạt +16, điểm ảnh vệt +276% | — |
| Phi tiêu: 3 phát | Độc | thêm hat-no, va-cham, ring; lớp +6, hạt +25, điểm ảnh vệt +12% | thêm khoi-tron; lớp +1, hạt +5, điểm ảnh vệt -10% | — |
| Phi tiêu: 3 phát | Băng | thêm flash; lớp +4, hạt +24, điểm ảnh vệt +58% | lớp -1, hạt +3, điểm ảnh vệt +1% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: giữ → ném chùm | Lửa | thêm va-cham, ring; lớp +7, hạt +34, điểm ảnh vệt +1% | lớp -2, hạt +6, điểm ảnh vệt -10% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: giữ → ném chùm | Độc | thêm khoi-tron, va-cham, ring; lớp +4, hạt +12, điểm ảnh vệt +35% | bớt khoi-tron; lớp -1, hạt +1, điểm ảnh vệt -13% | Thành hình→Thức tỉnh: đổi quá ít |
| Phi tiêu: giữ → ném chùm | Băng | thêm flash; lớp +7, hạt +15, điểm ảnh vệt -1% | lớp -1, hạt +7, điểm ảnh vệt -2% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: mưa (Đặc biệt) | Lửa | thêm khoi-tron, no-lua; lớp +2, hạt +27, điểm ảnh vệt +0% | bớt hat-no, khoi-tron; lớp -2, hạt +15, điểm ảnh vệt +0% | Thành hình→Thức tỉnh: đổi quá ít |
| Phi tiêu: mưa (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe, khoi-tron, ring; lớp +2, hạt +21, điểm ảnh vệt +0% | bớt khoi-tron; lớp +0, hạt +3, điểm ảnh vệt -4% | Thành hình→Thức tỉnh: đổi quá ít |
| Phi tiêu: mưa (Đặc biệt) | Băng | thêm gai-bang(hàng gai), dong-bang, khoi-tron, ring; lớp +8, hạt +60, điểm ảnh vệt +0% | thêm bang-vo; lớp +4, hạt +58, điểm ảnh vệt +19% | Thức tỉnh quá rối (14 lớp, 138 hạt) |

## 2. Đo tầm: hình vệt so với vùng trúng thật

> (trong dải cao của thân quái, hiện ≥ 2 khung) theo hướng đánh. Lệch = tầm hình − tầm trúng: > 0 là hình kéo xa hơn chỗ trúng (quái đứng ở
> khoảng lệch này trông như bị chém mà không mất máu); < 0 là đòn trúng xa hơn hình."""
> import sys, json
> d = json.load(open(sys.argv[1])); RA_MD, RA_JS = sys.argv[2], sys.argv[3]

| Đòn | Nhát | Hệ · bậc | Tầm trúng thật (mép thân quái) | Tầm hình vệt | Lệch (hình − trúng) | Phía sau lưng: hình / trúng | Cao hình vệt (trên chân) |
|---|---|---|---|---|---|---|---|
| Kiếm nặng | nhát 1 (lê → hất lên) | Trắng · Trắng | 30 | 62 | **+32** | -48 / không | 65 |
| Kiếm nặng | nhát 2 (bổ xuống) | Trắng · Trắng | 30 | 52 | **+22** | None / không | 34 |
| Kiếm nặng | nhát 3 (chém ngang) | Trắng · Trắng | 36 | 48 | **+12** | -33 / không | 45 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Lửa · Mầm | 30 | 66 | **+36** | -54 / không | 70 |
| Kiếm nặng | nhát 2 (bổ xuống) | Lửa · Mầm | 30 | 57 | **+27** | None / không | 34 |
| Kiếm nặng | nhát 3 (chém ngang) | Lửa · Mầm | 36 | 53 | **+17** | -37 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Lửa · Thức tỉnh | 30 | 68 | **+38** | -56 / không | 74 |
| Kiếm nặng | nhát 2 (bổ xuống) | Lửa · Thức tỉnh | 30 | 61 | **+31** | None / không | 34 |
| Kiếm nặng | nhát 3 (chém ngang) | Lửa · Thức tỉnh | 48 | 57 | **+9** | -42 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Độc · Mầm | 30 | 66 | **+36** | -54 / không | 70 |
| Kiếm nặng | nhát 2 (bổ xuống) | Độc · Mầm | 30 | 62 | **+32** | None / không | 34 |
| Kiếm nặng | nhát 3 (chém ngang) | Độc · Mầm | 36 | 63 | **+27** | -37 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Độc · Thức tỉnh | 30 | 68 | **+38** | -56 / không | 74 |
| Kiếm nặng | nhát 2 (bổ xuống) | Độc · Thức tỉnh | 30 | 61 | **+31** | -1 / không | 34 |
| Kiếm nặng | nhát 3 (chém ngang) | Độc · Thức tỉnh | 36 | 62 | **+26** | -42 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Băng · Mầm | 30 | 66 | **+36** | -54 / không | 70 |
| Kiếm nặng | nhát 2 (bổ xuống) | Băng · Mầm | 30 | 57 | **+27** | None / không | 43 |
| Kiếm nặng | nhát 3 (chém ngang) | Băng · Mầm | 36 | 53 | **+17** | -37 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Băng · Thức tỉnh | 30 | 68 | **+38** | -56 / không | 74 |
| Kiếm nặng | nhát 2 (bổ xuống) | Băng · Thức tỉnh | 30 | 61 | **+31** | None / không | 44 |
| Kiếm nặng | nhát 3 (chém ngang) | Băng · Thức tỉnh | 72 | 99 | **+27** | -42 / không | 46 |
| Kiếm lướt chém | — | Trắng · Trắng | 60 | 147 | **+87** | -8 / không | 24 |
| Kiếm lướt chém | — | Lửa · Mầm | 60 | 132 | **+72** | -8 / không | 25 |
| Kiếm lướt chém | — | Lửa · Thức tỉnh | 60 | 144 | **+84** | -8 / không | 25 |
| Kiếm lướt chém | — | Độc · Mầm | 60 | 127 | **+67** | -8 / không | 25 |
| Kiếm lướt chém | — | Độc · Thức tỉnh | 60 | 132 | **+72** | -8 / không | 30 |
| Kiếm lướt chém | — | Băng · Mầm | 60 | 129 | **+69** | -8 / không | 31 |
| Kiếm lướt chém | — | Băng · Thức tỉnh | 60 | 138 | **+78** | -8 / không | 42 |
| Thương | đâm 1 | Trắng · Trắng | 54 | 85 | **+31** | None / không | 40 |
| Thương | đâm 2 | Trắng · Trắng | 54 | 75 | **+21** | -1 / không | 70 |
| Thương | đâm 3 | Trắng · Trắng | 60 | 85 | **+25** | -4 / không | 62 |
| Thương | quét vòng | Trắng · Trắng | 42 | 75 | **+33** | -48 / không | 52 |
| Thương | đâm 1 | Lửa · Mầm | 54 | 85 | **+31** | None / không | 40 |
| Thương | đâm 2 | Lửa · Mầm | 54 | 75 | **+21** | -1 / không | 70 |
| Thương | đâm 3 | Lửa · Mầm | 60 | 85 | **+25** | -4 / không | 62 |
| Thương | quét vòng | Lửa · Mầm | 42 | 75 | **+33** | -48 / không | 53 |
| Thương | đâm 1 | Lửa · Thức tỉnh | 54 | 85 | **+31** | None / không | 40 |
| Thương | đâm 2 | Lửa · Thức tỉnh | 54 | 75 | **+21** | -1 / không | 70 |
| Thương | đâm 3 | Lửa · Thức tỉnh | 60 | 85 | **+25** | -4 / không | 62 |
| Thương | quét vòng | Lửa · Thức tỉnh | 42 | 78 | **+36** | -55 / -16 | 64 |
| Thương | đâm 1 | Độc · Mầm | 54 | 95 | **+41** | None / không | 40 |
| Thương | đâm 2 | Độc · Mầm | 54 | 95 | **+41** | -1 / không | 70 |
| Thương | đâm 3 | Độc · Mầm | 60 | 107 | **+47** | -4 / không | 62 |
| Thương | quét vòng | Độc · Mầm | 42 | 107 | **+65** | -48 / không | 53 |
| Thương | đâm 1 | Độc · Thức tỉnh | 54 | 88 | **+34** | None / không | 40 |
| Thương | đâm 2 | Độc · Thức tỉnh | 54 | 95 | **+41** | -1 / không | 70 |
| Thương | đâm 3 | Độc · Thức tỉnh | 60 | 103 | **+43** | -4 / không | 62 |
| Thương | quét vòng | Độc · Thức tỉnh | 42 | 103 | **+61** | -55 / không | 64 |
| Thương | đâm 1 | Băng · Mầm | 54 | 85 | **+31** | None / không | 40 |
| Thương | đâm 2 | Băng · Mầm | 54 | 75 | **+21** | -1 / không | 70 |
| Thương | đâm 3 | Băng · Mầm | 60 | 85 | **+25** | -4 / không | 62 |
| Thương | quét vòng | Băng · Mầm | 42 | 75 | **+33** | -48 / không | 53 |
| Thương | đâm 1 | Băng · Thức tỉnh | 54 | 85 | **+31** | None / không | 40 |
| Thương | đâm 2 | Băng · Thức tỉnh | 54 | 75 | **+21** | -1 / không | 70 |
| Thương | đâm 3 | Băng · Thức tỉnh | 60 | 85 | **+25** | -4 / không | 62 |
| Thương | quét vòng | Băng · Thức tỉnh | 48 | 78 | **+30** | -55 / -28 | 64 |
| Thương xốc tới | — | Trắng · Trắng | 60 | 45 | -15 | -4 / -4 | 22 |
| Thương xốc tới | — | Lửa · Mầm | 60 | 50 | -10 | -4 / -4 | 29 |
| Thương xốc tới | — | Lửa · Thức tỉnh | 60 | 52 | -8 | -4 / -4 | 29 |
| Thương xốc tới | — | Độc · Mầm | 60 | 72 | **+12** | -4 / -4 | 29 |
| Thương xốc tới | — | Độc · Thức tỉnh | 60 | 73 | **+13** | -5 / -4 | 30 |
| Thương xốc tới | — | Băng · Mầm | 60 | 57 | -3 | -4 / -4 | 32 |
| Thương xốc tới | — | Băng · Thức tỉnh | 60 | 87 | **+27** | -4 / -4 | 38 |
| Búa nện | — | Trắng · Trắng | 30 | 47 | **+17** | None / không | 55 |
| Búa nện | — | Lửa · Mầm | 30 | 44 | **+14** | None / không | 54 |
| Búa nện | — | Lửa · Thức tỉnh | 30 | 49 | **+19** | None / không | 56 |
| Búa nện | — | Độc · Mầm | 30 | 51 | **+21** | None / không | 54 |
| Búa nện | — | Độc · Thức tỉnh | 30 | 64 | **+34** | None / không | 56 |
| Búa nện | — | Băng · Mầm | 30 | 46 | **+16** | None / không | 54 |
| Búa nện | — | Băng · Thức tỉnh | 30 | 51 | **+21** | -2 / không | 56 |
| Búa nện đất nấc 1 | — | Trắng · Trắng | 108 | 88 | -20 | -8 / -4 | 44 |
| Búa nện đất nấc 1 | — | Lửa · Mầm | 108 | 88 | -20 | -8 / -4 | 44 |
| Búa nện đất nấc 1 | — | Lửa · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 45 |
| Búa nện đất nấc 1 | — | Độc · Mầm | 108 | 88 | -20 | -24 / -4 | 44 |
| Búa nện đất nấc 1 | — | Độc · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 45 |
| Búa nện đất nấc 1 | — | Băng · Mầm | 108 | 98 | -10 | -8 / -4 | 44 |
| Búa nện đất nấc 1 | — | Băng · Thức tỉnh | 108 | 116 | **+8** | -8 / -4 | 61 |
| Búa nện đất nấc 2 | — | Trắng · Trắng | 108 | 88 | -20 | -8 / -4 | 44 |
| Búa nện đất nấc 2 | — | Lửa · Mầm | 108 | 88 | -20 | -8 / -4 | 44 |
| Búa nện đất nấc 2 | — | Lửa · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 45 |
| Búa nện đất nấc 2 | — | Độc · Mầm | 108 | 88 | -20 | -8 / -4 | 44 |
| Búa nện đất nấc 2 | — | Độc · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 45 |
| Búa nện đất nấc 2 | — | Băng · Mầm | 108 | 98 | -10 | -8 / -4 | 48 |
| Búa nện đất nấc 2 | — | Băng · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 57 |

## 3. Tình huống riêng: phản ứng hệ, đóng băng / vỡ, nổ lan, lây độc, trùm

| Tình huống | Hệ đòn | Bậc | Hình hiệu ứng (tên ảnh ×lần, ms) | Lớp cùng lúc tối đa | Phản ứng ghi được | Số hiện trên quái |
|---|---|---|---|---|---|---|
| Nổ khói (Lửa + Độc) | Lửa | Thức tỉnh | chem-kiem-nang-1 250; hat-no×2 450; chem-kiem-nang-2 320; trung×2 320; no-khoi 720; scorch 1800; he:drawFlames×3 260/340; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360; no-lua 670 | 7 | smoke | 2·nhịp, 35, 13, 1·nhịp, 26, 2·nhịp, 2·nhịp |
| Nổ khói (Lửa + Độc) | Độc | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; hat-no×3 450; no-khoi×2 720; scorch×2 1800; he:drawDrips×3 340/420; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360; doc-toe 720; ring 340; he:drawCloud 3283 | 11 | smoke, smoke | 1·nhịp, 31, 13, 2·nhịp, 58, 2·nhịp, 2·nhịp |
| Sốc nhiệt (Lửa + Băng) | Lửa | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; soc-nhiet 620; he:drawFlames×3 260/340; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360; hat-no×2 450; no-lua 670 | 7 | shock | 43, 13, 1·nhịp, 26, 2·nhịp, 2·nhịp |
| Sốc nhiệt (Lửa + Băng) | Băng | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; soc-nhiet 620; he:drawIce×3 240/300; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360; hat-no×2 450; he:drawSpikes 1050; ring 260; khoi-tron 620 | 9 | shock | 1·nhịp, 43, 13, 29 |
| Đóng băng (5 tầng Băng) rồi vỡ | Băng | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; dong-bang 420; he:drawIce×3 240/300; hat-no 450; chem-kiem-nang-3 420; bang-vo×2 420; ring×2 260/280; chem-kiem-nang-4 340; trung-nang 360; he:drawSpikes 1050 | 8 | freeze | 12, 22, 29 |
| Đóng băng (5 tầng Băng) rồi vỡ | Băng | Mầm | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawIce×3 240/300; chem-kiem-nang-3 420; dong-bang 420; chem-kiem-nang-4 340; trung-nang 360 | 5 | freeze | 12, 13, 22 |
| Nổ lan khi quái cháy chết | Lửa | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; hat-no×2 450; he:drawFlames×3 260/340; chem-kiem-nang-3 420; chem-kiem-nang-4 340; quai-chet 620; orb 1400; scorch 2200; no-lua×2 670; trung-nang 360 | 9 | — | 1·nhịp, 12, 13, 1·nhịp, 22 |
| Lây độc khi quái trúng độc chết | Độc | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung 320; he:drawDrips×3 340/420; chem-kiem-nang-3 420; quai-chet 620; orb 1400; trung-nang 360; chem-kiem-nang-4 340; doc-toe 720; ring 340; he:drawCloud 3283 | 8 | — | 2·nhịp, 14, 15 |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Lửa | Mầm | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawFlames×3 260/340; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360 | 4 | — | 12, 13, 1·nhịp, 22, 1·nhịp, 1·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Lửa | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawFlames×3 260/340; khoi-tron 620; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360; no-lua 670 | 5 | — | 12, 13, 1·nhịp, 26, 2·nhịp, 2·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Độc | Mầm | khoi-tron 620; chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawDrips×3 340/420; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360 | 6 | — | 12, 14, 1·nhịp, 23, 1·nhịp, 1·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Độc | Thức tỉnh | khoi-tron×2 620; chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawDrips×3 340/420; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360; doc-toe 720; ring 340; he:drawCloud 3283 | 6 | — | 12, 14, 1·nhịp, 24, 3·nhịp, 3·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Băng | Mầm | khoi-tron 620; chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawIce×3 240/300; chem-kiem-nang-3 420; chem-kiem-nang-4 340; trung-nang 360 | 5 | — | 12, 13, 22 |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Băng | Thức tỉnh | chem-kiem-nang-1 250; chem-kiem-nang-2 320; trung×2 320; he:drawIce×3 240/300; chem-kiem-nang-3 420; hat-no 450; chem-kiem-nang-4 340; trung-nang 360; he:drawSpikes 1050; ring 260 | 6 | — | 12, 13, 29 |
