# Phần B — bảng đo SAU khi sửa (mặc định, mọi cờ bật)

Cùng công cụ, cùng cảnh như [bang-do.md](bang-do.md). Hình bị bỏ (lớp giọt hệ, vòng tím, chùm hạt thừa) không còn trong bảng; thời gian hiện của vệt chính đã gồm ×1,6.


### Kiếm nặng 3 nhát

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 37x29; trung×6 320ms 19x19/32x32; hat-no×3 450ms 21x21; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 76x46; trung-nang×3 360ms 24x24/40x40 | 9 / 2 | 21 | 22371 |
| Lửa | Mầm | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 38x30; trung×6 320ms 19x19/32x32; chem-kiem-nang-3 672ms 17x15; hat-no×2 450ms 21x21; chem-kiem-nang-4 544ms 81x49; trung-nang×3 360ms 24x24/40x40 | 8 / 2 | 66 | 24309 |
| Lửa | Thành hình | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 37x29; trung×6 320ms 19x19/32x32; hat-no×3 450ms 21x21; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 82x50; trung-nang×3 360ms 24x24/40x40; no-lua 670ms 67x56 | 9 / 3 | 102 | 53216 |
| Lửa | Thức tỉnh | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 36x28; trung×6 320ms 19x19/32x32; hat-no×3 450ms 21x21; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 80x48; trung-nang×3 360ms 24x24/40x40; no-lua 670ms 67x56 | 9 / 3 | 115 | 54106 |
| Độc | Mầm | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 38x30; trung×6 320ms 19x19/32x32; hat-no×3 450ms 21x21; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 81x49; trung-nang×3 360ms 24x24/40x40 | 9 / 2 | 25 | 33601 |
| Độc | Thành hình | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 37x29; trung×6 320ms 19x19/32x32; hat-no×2 450ms 21x21; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 82x50; trung-nang×3 360ms 24x24/40x40; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3283ms | 9 / 5 | 31 | 55980 |
| Độc | Thức tỉnh | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 36x28; trung×6 320ms 19x19/32x32; hat-no 450ms 21x21; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 80x48; trung-nang×3 360ms 24x24/40x40; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3283ms | 8 / 5 | 34 | 58866 |
| Băng | Mầm | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 38x30; trung×6 320ms 19x19/32x32; chem-kiem-nang-3 672ms 17x15; hat-no×2 450ms 26x26; chem-kiem-nang-4 544ms 81x49; trung-nang×3 360ms 24x24/40x40 | 8 / 2 | 39 | 27239 |
| Băng | Thành hình | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 37x29; trung×6 320ms 19x19/32x32; hat-no×3 450ms 21x21/26x26; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 82x50; trung-nang×3 360ms 24x24/40x40; gai-bang(hàng gai) 950ms; ring 260ms | 9 / 4 | 62 | 51861 |
| Băng | Thức tỉnh | chem-kiem-nang-1 400ms 41x15; chem-kiem-nang-2 512ms 36x28; trung×6 320ms 19x19/32x32; hat-no×3 450ms 21x21/26x26; chem-kiem-nang-3 672ms 17x15; chem-kiem-nang-4 544ms 80x48; trung-nang×3 360ms 24x24/40x40; gai-bang(hàng gai) 1050ms; ring 260ms | 9 / 4 | 67 | 57742 |

### Kiếm: né rồi lướt chém

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | lon 440ms 40x20; chem-luot 512ms 58x25; trung×3 320ms 32x32; hat-no 450ms 21x21 | 6 / 2 | 23 | 6720 |
| Lửa | Mầm | lon 440ms 40x20; chem-luot-fire 512ms 58x25; trung×3 320ms 32x32 | 5 / 2 | 34 | 6058 |
| Lửa | Thành hình | lon 440ms 40x20; chem-luot-fire 512ms 58x25; trung×3 320ms 32x32 | 5 / 2 | 46 | 7182 |
| Lửa | Thức tỉnh | lon 440ms 40x20; chem-luot-fire 512ms 58x25; hat-no×2 450ms 21x21; trung×3 320ms 32x32 | 7 / 2 | 58 | 6942 |
| Độc | Mầm | lon 440ms 40x20; chem-luot-poison 512ms 58x25; trung×3 320ms 32x32; hat-no 450ms 21x21 | 6 / 3 | 25 | 7561 |
| Độc | Thành hình | lon 440ms 40x20; chem-luot-poison 512ms 58x25; hat-no×2 450ms 21x21; trung×3 320ms 32x32 | 7 / 2 | 26 | 9595 |
| Độc | Thức tỉnh | lon 440ms 40x20; chem-luot-poison 512ms 58x25; trung×3 320ms 32x32 | 5 / 2 | 26 | 11251 |
| Băng | Mầm | lon 440ms 40x20; chem-luot-ice 512ms 58x25; trung×3 320ms 32x32 | 5 / 3 | 29 | 6878 |
| Băng | Thành hình | lon 440ms 40x20; chem-luot-ice 512ms 58x25; hat-no 450ms 21x21; trung×3 320ms 32x32 | 6 / 2 | 33 | 5830 |
| Băng | Thức tỉnh | lon 440ms 40x20; chem-luot-ice 512ms 58x25; trung×3 320ms 32x32 | 5 / 4 | 43 | 8576 |

### Kiếm: Trảm Nguyệt (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | ra-chieu 512ms 41x41; trung-nang×3 360ms 24x24/40x40; he:draw 30000ms; flash 100ms | 5 / 6 | 27 | 16408 |
| Lửa | Mầm | ra-chieu-fire 512ms 41x41; trung-nang×3 360ms 24x24/40x40; he:draw 30000ms; flash 100ms | 5 / 5 | 43 | 22774 |
| Lửa | Thành hình | ra-chieu-fire 512ms 41x41; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21; he:draw 30000ms; pillar×6 300ms; flash 100ms | 6 / 10 | 62 | 31594 |
| Lửa | Thức tỉnh | ra-chieu-fire 512ms 41x41; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21; he:draw 30000ms; pillar×6 300ms; flash 100ms | 6 / 10 | 70 | 35911 |
| Độc | Mầm | ra-chieu-poison 512ms 41x41; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21; he:draw 30000ms; flash 100ms | 6 / 6 | 30 | 29237 |
| Độc | Thành hình | ra-chieu-poison 512ms 41x41; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21; he:draw 30000ms; doc-toe×2 720ms 42x31; ring×2 340ms; flash 100ms; he:drawCloud×2 3492ms | 10 / 11 | 30 | 96582 |
| Độc | Thức tỉnh | ra-chieu-poison 512ms 41x41; hat-no 450ms 21x21; trung-nang×3 360ms 24x24/40x40; he:draw 30000ms; doc-toe×2 720ms 42x31; ring×2 340ms; flash 100ms; he:drawCloud×2 3492ms | 10 / 11 | 33 | 101636 |
| Băng | Mầm | ra-chieu-ice 512ms 41x41; trung-nang×3 360ms 24x24/40x40; he:draw 30000ms; flash 100ms | 5 / 5 | 33 | 25788 |
| Băng | Thành hình | ra-chieu-ice 512ms 41x41; trung-nang×3 360ms 24x24/40x40; he:draw 30000ms; gai-bang(hàng gai) 950ms; ring 260ms; flash 100ms | 5 / 8 | 37 | 108647 |
| Băng | Thức tỉnh | ra-chieu-ice 512ms 41x41; trung-nang×3 360ms 24x24/40x40; he:draw 30000ms; gai-bang(hàng gai) 1050ms; ring 260ms; flash 100ms | 5 / 9 | 45 | 121738 |

### Thương: 3 đâm + quét vòng

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung×9 320ms 19x19/32x32; dam-giao×3 480ms 68x24/70x25; hat-no 450ms 21x21; trung-nang×3 360ms 24x24/40x40; quet-giao 672ms 98x34; ring 260ms | 7 / 3 | 17 | 56882 |
| Lửa | Mầm | trung×9 320ms 19x19/32x32; hat-no×4 450ms 21x21; dam-giao×3 480ms 68x24/70x25; trung-nang×3 360ms 24x24/40x40; quet-giao-fire 672ms 98x34; ring 260ms | 9 / 3 | 53 | 56392 |
| Lửa | Thành hình | trung×9 320ms 19x19/32x32; hat-no×4 450ms 21x21; dam-giao×3 480ms 66x23/68x24; trung-nang×3 360ms 24x24/40x40; quet-giao-fire 672ms 98x34; ring 260ms; no-lua 670ms 67x56 | 9 / 4 | 87 | 82607 |
| Lửa | Thức tỉnh | trung×9 320ms 19x19/32x32; dam-giao×3 480ms 64x23/66x23; hat-no×4 450ms 21x21; trung-nang×3 360ms 24x24/40x40; quet-giao-fire 672ms 98x34; ring 260ms; no-lua 670ms 67x56 | 9 / 5 | 102 | 91083 |
| Độc | Mầm | trung×9 320ms 19x19/32x32; dam-giao×3 480ms 68x24/70x25; hat-no×3 450ms 21x21; trung-nang×3 360ms 24x24/40x40; quet-giao-poison 672ms 98x34; ring 260ms | 8 / 3 | 23 | 68484 |
| Độc | Thành hình | trung×9 320ms 19x19/32x32; dam-giao×3 480ms 66x23/68x24; trung-nang×3 360ms 24x24/40x40; quet-giao-poison 672ms 98x34; ring×2 260–340ms; doc-toe 720ms 42x31; he:drawCloud 3283ms | 8 / 6 | 35 | 90970 |
| Độc | Thức tỉnh | trung×9 320ms 19x19/32x32; dam-giao×3 480ms 64x23/66x23; hat-no×2 450ms 21x21; trung-nang×3 360ms 24x24/40x40; quet-giao-poison 672ms 98x34; ring×2 260–340ms; doc-toe 720ms 42x31; he:drawCloud 3283ms | 9 / 6 | 35 | 92175 |
| Băng | Mầm | trung×9 320ms 19x19/32x32; dam-giao×3 480ms 68x24/70x25; trung-nang×3 360ms 24x24/40x40; quet-giao-ice 672ms 98x34; ring 260ms | 7 / 3 | 33 | 60508 |
| Băng | Thành hình | trung×9 320ms 19x19/32x32; hat-no×4 450ms 26x26; dam-giao×3 480ms 66x23/68x24; trung-nang×3 360ms 24x24/40x40; quet-giao-ice 672ms 98x34; ring×2 260ms; dong-bang 420ms 55x55; gai-bang(hàng gai) 950ms | 10 / 5 | 70 | 78894 |
| Băng | Thức tỉnh | trung×9 320ms 19x19/32x32; hat-no×3 450ms 21x21/26x26; dam-giao×3 480ms 64x23/66x23; trung-nang×3 360ms 24x24/40x40; quet-giao-ice 672ms 98x34; ring×2 260ms; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 1050ms | 12 / 5 | 94 | 91026 |

### Thương: giữ → xốc tới

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | xoc-toi 420ms 52x21; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21 | 5 / 1 | 18 | 2239 |
| Lửa | Mầm | xoc-toi 420ms 52x21; trung-nang×3 360ms 24x24/40x40 | 4 / 1 | 37 | 2201 |
| Lửa | Thành hình | xoc-toi 420ms 52x21; pillar×2 300ms; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21 | 7 / 3 | 70 | 4111 |
| Lửa | Thức tỉnh | xoc-toi 420ms 52x21; pillar×2 300ms; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21 | 7 / 3 | 79 | 5586 |
| Độc | Mầm | xoc-toi 420ms 52x21; trung-nang×3 360ms 24x24/40x40; hat-no×2 450ms 21x21 | 6 / 2 | 21 | 8106 |
| Độc | Thành hình | xoc-toi 420ms 52x21; doc-toe×2 720ms 42x31; ring×2 340ms; he:drawCloud×2 3283ms; trung-nang×3 360ms 24x24/40x40 | 10 / 7 | 24 | 52351 |
| Độc | Thức tỉnh | xoc-toi 420ms 52x21; doc-toe×2 720ms 42x31; ring×2 340ms; he:drawCloud×2 3283ms; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21 | 11 / 7 | 26 | 51780 |
| Băng | Mầm | xoc-toi 420ms 52x21; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21 | 5 / 2 | 25 | 3623 |
| Băng | Thành hình | xoc-toi 420ms 52x21; hat-no×2 450ms 21x21/26x26; gai-bang(hàng gai) 950ms; ring 260ms; trung-nang×3 360ms 24x24/40x40 | 8 / 3 | 49 | 28527 |
| Băng | Thức tỉnh | xoc-toi 420ms 52x21; hat-no×2 450ms 26x26; gai-bang(hàng gai) 1050ms; ring 260ms; trung-nang×3 360ms 24x24/40x40 | 8 / 3 | 56 | 29510 |

### Thương: Phi Thương (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | ra-chieu 512ms 34x34; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; hat-no×2 450ms 21x21; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 19x19/32x32; flash 100ms | 8 / 6 | 19 | 14938 |
| Lửa | Mầm | ra-chieu-fire 512ms 34x34; hat-no×4 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 19x19/32x32; flash 100ms | 10 / 6 | 33 | 18640 |
| Lửa | Thành hình | ra-chieu-fire 512ms 34x34; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21; pillar×2 300ms; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 19x19/32x32; flash 100ms | 10 / 12 | 68 | 32086 |
| Lửa | Thức tỉnh | ra-chieu-fire 512ms 34x34; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; hat-no×2 450ms 21x21; pillar×2 300ms; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 19x19/32x32; flash 100ms | 11 / 12 | 71 | 48367 |
| Độc | Mầm | ra-chieu-poison 512ms 34x34; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; hat-no 450ms 21x21; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 19x19/32x32; flash 100ms | 8 / 6 | 21 | 14564 |
| Độc | Thành hình | ra-chieu-poison 512ms 34x34; hat-no×5 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; doc-toe×2 720ms 42x31; ring×4 180–340ms; va-cham 320ms 34x23; he:drawCloud×2 3300ms; trung×2 320ms 19x19/32x32; flash 100ms | 16 / 13 | 38 | 139905 |
| Độc | Thức tỉnh | ra-chieu-poison 512ms 34x34; hat-no×3 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; doc-toe×2 720ms 42x31; ring×4 180–340ms; va-cham 320ms 34x23; he:drawCloud×2 3300ms; trung×2 320ms 19x19/32x32; flash 100ms | 15 / 12 | 40 | 151206 |
| Băng | Mầm | ra-chieu-ice 512ms 34x34; hat-no×2 450ms 21x21/26x26; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; va-cham 320ms 34x23; ring×2 180–240ms; trung×2 320ms 19x19/32x32; flash 100ms | 8 / 5 | 24 | 19466 |
| Băng | Thành hình | ra-chieu-ice 512ms 34x34; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; hat-no×2 450ms 21x21/26x26; gai-bang(hàng gai) 950ms; ring×3 180–260ms; va-cham 320ms 34x23; trung×2 320ms 19x19/32x32; flash 100ms | 10 / 9 | 48 | 106871 |
| Băng | Thức tỉnh | ra-chieu-ice 512ms 34x34; he:draw 30000ms; trung-nang×3 360ms 24x24/40x40; hat-no×3 450ms 21x21/26x26; gai-bang(hàng gai) 1050ms; ring×3 180–260ms; va-cham 320ms 34x23; trung×2 320ms 19x19/32x32; flash 100ms | 11 / 9 | 50 | 139548 |

### Búa: nện thường

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×3 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat 768ms 53x32 | 6 / 3 | 7 | 13424 |
| Lửa | Mầm | trung-nang×3 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-fire 768ms 53x32 | 6 / 3 | 24 | 11517 |
| Lửa | Thành hình | trung-nang×3 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-fire 768ms 53x32 | 6 / 3 | 50 | 13844 |
| Lửa | Thức tỉnh | trung-nang×3 360ms 24x24; chem-bua 576ms 37x37; crack 1600ms; nen-dat-fire 768ms 53x32 | 6 / 3 | 60 | 12334 |
| Độc | Mầm | trung-nang×3 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-poison 768ms 53x32 | 6 / 3 | 8 | 18224 |
| Độc | Thành hình | trung-nang×3 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-poison 768ms 53x32 | 6 / 3 | 13 | 18419 |
| Độc | Thức tỉnh | trung-nang×3 360ms 24x24; chem-bua 576ms 37x37; crack 1600ms; nen-dat-poison 768ms 53x32 | 6 / 3 | 14 | 19753 |
| Băng | Mầm | trung-nang×3 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-ice 768ms 53x32 | 6 / 3 | 13 | 17086 |
| Băng | Thành hình | trung-nang×3 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-ice 768ms 53x32 | 6 / 3 | 30 | 17045 |
| Băng | Thức tỉnh | trung-nang×3 360ms 24x24; chem-bua 576ms 37x37; crack 1600ms; nen-dat-ice 768ms 53x32 | 6 / 3 | 29 | 17017 |

### Búa: nện đất nấc 1

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×5 360ms 24x24; chem-bua 576ms 43x43; crack 1600ms; nen-dat 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 14 | 35344 |
| Lửa | Mầm | trung-nang×5 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-fire 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 51 | 33186 |
| Lửa | Thành hình | trung-nang×5 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-fire 768ms 64x38; ring 280ms; no-lua 670ms 67x56; he:draw 333ms | 11 / 6 | 100 | 48155 |
| Lửa | Thức tỉnh | trung-nang×5 360ms 24x24; chem-bua 576ms 33x33; crack 1600ms; nen-dat-fire 768ms 64x38; ring 280ms; no-lua 670ms 67x56; he:draw 333ms | 11 / 6 | 107 | 50547 |
| Độc | Mầm | trung-nang×5 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-poison 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 14 | 38266 |
| Độc | Thành hình | trung-nang×5 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-poison 768ms 64x38; ring×2 280–340ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 13 / 8 | 19 | 54437 |
| Độc | Thức tỉnh | trung-nang×5 360ms 24x24; chem-bua 576ms 33x33; crack 1600ms; nen-dat-poison 768ms 64x38; ring×2 280–340ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 13 / 8 | 22 | 56118 |
| Băng | Mầm | trung-nang×5 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-ice 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 31 | 36790 |
| Băng | Thành hình | trung-nang×5 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-ice 768ms 64x38; ring×2 260–280ms; gai-bang(hàng gai) 950ms; dong-bang×3 420ms 55x55; he:draw 333ms | 15 / 7 | 84 | 56035 |
| Băng | Thức tỉnh | trung-nang×5 360ms 24x24; chem-bua 576ms 33x33; crack 1600ms; nen-dat-ice 768ms 64x38; ring×2 260–280ms; gai-bang(hàng gai) 1050ms; dong-bang×3 420ms 55x55; he:draw 333ms | 15 / 7 | 85 | 63830 |

### Búa: nện đất nấc 2

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×5 360ms 24x24; chem-bua 576ms 43x43; crack 1600ms; nen-dat 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 15 | 32870 |
| Lửa | Mầm | trung-nang×5 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-fire 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 54 | 32888 |
| Lửa | Thành hình | trung-nang×5 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-fire 768ms 64x38; ring 280ms; no-lua 670ms 67x56; he:draw 333ms | 11 / 6 | 109 | 47401 |
| Lửa | Thức tỉnh | trung-nang×5 360ms 24x24; chem-bua 576ms 33x33; crack 1600ms; nen-dat-fire 768ms 64x38; ring 280ms; no-lua 670ms 67x56; he:draw 333ms | 11 / 6 | 112 | 48441 |
| Độc | Mầm | trung-nang×5 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-poison 768ms 64x38; ring 280ms; he:draw 333ms | 10 / 5 | 13 | 36209 |
| Độc | Thành hình | trung-nang×5 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-poison 768ms 64x38; ring×2 280–340ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 13 / 8 | 25 | 55679 |
| Độc | Thức tỉnh | trung-nang×5 360ms 24x24; chem-bua 576ms 33x33; crack 1600ms; nen-dat-poison 768ms 64x38; ring×2 280–340ms; doc-toe 720ms 42x31; he:drawCloud 3091ms; he:draw 333ms | 13 / 8 | 22 | 59165 |
| Băng | Mầm | trung-nang×5 360ms 24x24; chem-bua 576ms 45x45; crack 1600ms; nen-dat-ice 768ms 64x38; ring 280ms; he:draw 333ms; khoi-tron 620ms 21x22 | 10 / 5 | 28 | 34631 |
| Băng | Thành hình | trung-nang×5 360ms 24x24; chem-bua 576ms 44x44; crack 1600ms; nen-dat-ice 768ms 64x38; ring×2 260–280ms; gai-bang(hàng gai) 950ms; dong-bang×3 420ms 55x55; he:draw 333ms | 15 / 7 | 83 | 57864 |
| Băng | Thức tỉnh | trung-nang×5 360ms 24x24; chem-bua 576ms 33x33; crack 1600ms; nen-dat-ice 768ms 64x38; ring×2 260–280ms; gai-bang(hàng gai) 1050ms; dong-bang×3 420ms 55x55; he:draw 333ms | 15 / 7 | 81 | 61982 |

### Búa: Địa Chấn (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-nang×6 360ms 24x24/40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat 768ms 69x42 | 11 / 5 | 23 | 63948 |
| Lửa | Mầm | trung-nang×6 360ms 24x24/40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-fire 768ms 69x42 | 11 / 5 | 60 | 63718 |
| Lửa | Thành hình | trung-nang×6 360ms 24x24/40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-fire 768ms 69x42; pillar×6 300ms | 11 / 10 | 94 | 64454 |
| Lửa | Thức tỉnh | trung-nang×6 360ms 24x24/40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-fire 768ms 69x42; pillar×6 300ms | 11 / 10 | 93 | 68236 |
| Độc | Mầm | trung-nang×6 360ms 24x24/40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-poison 768ms 69x42 | 11 / 5 | 25 | 66964 |
| Độc | Thành hình | trung-nang×6 360ms 24x24/40x40; ring×4 200–340ms; he:draw 30000ms; crack 1600ms; nen-dat-poison 768ms 69x42; doc-toe×2 720ms 42x31; he:drawCloud×2 3588ms | 15 / 10 | 32 | 137709 |
| Độc | Thức tỉnh | trung-nang×6 360ms 24x24/40x40; ring×4 200–340ms; he:draw 30000ms; crack 1600ms; nen-dat-poison 768ms 69x42; doc-toe×2 720ms 42x31; he:drawCloud×2 3588ms | 15 / 10 | 36 | 131616 |
| Băng | Mầm | trung-nang×6 360ms 24x24/40x40; ring×2 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-ice 768ms 69x42 | 11 / 5 | 32 | 65875 |
| Băng | Thành hình | trung-nang×6 360ms 24x24/40x40; ring×3 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-ice 768ms 69x42; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 950ms | 14 / 6 | 83 | 142278 |
| Băng | Thức tỉnh | trung-nang×6 360ms 24x24/40x40; ring×3 200–260ms; he:draw 30000ms; crack 1600ms; nen-dat-ice 768ms 69x42; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 1050ms | 14 / 6 | 79 | 154936 |

### Phi tiêu: 3 phát

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | trung-phi-tieu×4 320ms 26x26 | 2 / 3 | 7 | 0 |
| Lửa | Mầm | trung-phi-tieu×4 320ms 26x26; hat-no×2 450ms 21x21 | 4 / 3 | 17 | 786 |
| Lửa | Thành hình | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 26x18; ring×4 220ms; hat-no×2 450ms 21x21 | 8 / 5 | 70 | 755 |
| Lửa | Thức tỉnh | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 26x18; ring×4 220ms; hat-no×2 450ms 21x21 | 8 / 6 | 75 | 778 |
| Độc | Mầm | trung-phi-tieu×4 320ms 26x26 | 2 / 3 | 10 | 12649 |
| Độc | Thành hình | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 22x15; ring×4 200ms; hat-no 450ms 21x21 | 7 / 6 | 28 | 13268 |
| Độc | Thức tỉnh | trung-phi-tieu×4 320ms 26x26; va-cham×4 320ms 22x15; ring×4 200ms; hat-no 450ms 21x21 | 7 / 6 | 30 | 13216 |
| Băng | Mầm | trung-phi-tieu×4 320ms 26x26; hat-no×2 450ms 21x21/26x26 | 4 / 1 | 13 | 5259 |
| Băng | Thành hình | trung-phi-tieu×6 320ms 26x26; flash×6 90ms; hat-no×5 450ms 21x21/26x26 | 8 / 3 | 33 | 6331 |
| Băng | Thức tỉnh | trung-phi-tieu×6 320ms 26x26; hat-no×4 450ms 21x21/26x26; flash×6 90ms | 7 / 3 | 36 | 4564 |

### Phi tiêu: giữ → ném chùm

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng | phi-tieu-chum 672ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no×2 450ms 21x21 | 5 / 2 | 14 | 9152 |
| Lửa | Mầm | phi-tieu-chum 672ms 39x39; hat-no×2 450ms 21x21; trung-phi-tieu×2 320ms 26x26 | 5 / 6 | 28 | 9368 |
| Lửa | Thành hình | phi-tieu-chum 672ms 39x39; hat-no×3 450ms 21x21; trung-phi-tieu×2 320ms 26x26; va-cham×2 320ms 26x18; ring×2 220ms | 10 / 8 | 63 | 13258 |
| Lửa | Thức tỉnh | phi-tieu-chum 672ms 39x39; hat-no×3 450ms 21x21; trung-phi-tieu×2 320ms 26x26; va-cham×2 320ms 26x18; ring×2 220ms | 10 / 6 | 68 | 13086 |
| Độc | Mầm | phi-tieu-chum 672ms 39x39; trung-phi-tieu×2 320ms 26x26 | 3 / 4 | 20 | 20278 |
| Độc | Thành hình | phi-tieu-chum 672ms 39x39; trung-phi-tieu×2 320ms 26x26; va-cham×2 320ms 22x15; ring×2 200ms | 7 / 7 | 28 | 22741 |
| Độc | Thức tỉnh | phi-tieu-chum 672ms 39x39; trung-phi-tieu×2 320ms 26x26; hat-no 450ms 21x21; va-cham×2 320ms 22x15; ring×2 200ms | 8 / 7 | 30 | 20833 |
| Băng | Mầm | phi-tieu-chum 672ms 39x39; trung-phi-tieu×2 320ms 26x26 | 3 / 4 | 22 | 10779 |
| Băng | Thành hình | phi-tieu-chum 672ms 39x39; trung-phi-tieu×3 320ms 26x26; flash×3 90ms; hat-no 450ms 21x21 | 7 / 5 | 36 | 14221 |
| Băng | Thức tỉnh | phi-tieu-chum 672ms 39x39; trung-phi-tieu×3 320ms 26x26; flash×3 90ms; hat-no 450ms 21x21 | 7 / 5 | 43 | 14675 |

### Phi tiêu: mưa (Đặc biệt)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| — | Trắng |  | 0 / 0 | 6 | 0 |
| Lửa | Mầm |  | 0 / 0 | 35 | 0 |
| Lửa | Thành hình | hat-no×2 450ms 21x21; no-lua 670ms 67x56 | 2 / 1 | 67 | 27371 |
| Lửa | Thức tỉnh | hat-no 450ms 21x21; no-lua 670ms 67x56 | 1 / 1 | 77 | 27372 |
| Độc | Mầm | hat-no 450ms 21x21 | 1 / 0 | 22 | 0 |
| Độc | Thành hình | doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3108ms; hat-no 450ms 21x21 | 4 / 3 | 35 | 32528 |
| Độc | Thức tỉnh | hat-no×3 450ms 21x21; doc-toe 720ms 42x31; ring 340ms; he:drawCloud 3108ms | 4 / 3 | 33 | 34310 |
| Băng | Mầm |  | 0 / 0 | 23 | 0 |
| Băng | Thành hình | dong-bang×3 420ms 55x55; hat-no 450ms 21x21; gai-bang(hàng gai) 950ms; ring 260ms | 6 / 3 | 75 | 36363 |
| Băng | Thức tỉnh | hat-no×3 450ms 21x21/26x26; dong-bang×3 420ms 55x55; gai-bang(hàng gai) 1050ms; ring×4 260–280ms; bang-vo×3 420ms 58x58 | 13 / 5 | 128 | 40362 |

### Chưởng (cây theo hệ)

| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |
|---|---|---|---|---|---|
| Lửa | chưa học | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 6 | 52 | 31786 |
| Lửa | chưa học | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 6 | 46 | 31786 |
| Lửa | đủ cây | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 45 | 31802 |
| Độc | chưa học | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 48 | 31829 |
| Độc | chưa học | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 49 | 31786 |
| Độc | đủ cây | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 46 | 31786 |
| Băng | chưa học | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 51 | 31805 |
| Băng | chưa học | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 50 | 31834 |
| Băng | đủ cây | ra-chuong-fire 512ms 28x28; scorch 2200ms; no-lua 670ms 48x40; vong-phep 620ms 37x25 | 4 / 5 | 47 | 31786 |

## Lên bậc thì hình đổi gì (trúng 3 quái)

| Đòn | Hệ | Mầm → Thành hình | Thành hình → Thức tỉnh | Nhận xét |
|---|---|---|---|---|
| Kiếm nặng 3 nhát | Lửa | thêm no-lua; lớp +1, hạt +36, điểm ảnh vệt +119% | lớp +0, hạt +13, điểm ảnh vệt +2% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (9 lớp, 115 hạt) |
| Kiếm nặng 3 nhát | Độc | thêm he:drawCloud, doc-toe, ring; lớp +0, hạt +6, điểm ảnh vệt +67% | lớp -1, hạt +3, điểm ảnh vệt +5% | Thành hình→Thức tỉnh: không đổi gì |
| Kiếm nặng 3 nhát | Băng | thêm gai-bang(hàng gai), ring; lớp +1, hạt +23, điểm ảnh vệt +90% | lớp +0, hạt +5, điểm ảnh vệt +11% | Thành hình→Thức tỉnh: đổi quá ít |
| Kiếm: né rồi lướt chém | Lửa | lớp +0, hạt +12, điểm ảnh vệt +19% | thêm hat-no; lớp +2, hạt +12, điểm ảnh vệt -3% | Mầm→Thành hình: đổi quá ít |
| Kiếm: né rồi lướt chém | Độc | lớp +1, hạt +1, điểm ảnh vệt +27% | bớt hat-no; lớp -2, hạt +0, điểm ảnh vệt +17% | Thành hình→Thức tỉnh: đổi quá ít |
| Kiếm: né rồi lướt chém | Băng | thêm hat-no; lớp +1, hạt +4, điểm ảnh vệt -15% | bớt hat-no; lớp -1, hạt +10, điểm ảnh vệt +47% | — |
| Kiếm: Trảm Nguyệt (Đặc biệt) | Lửa | thêm hat-no, pillar; lớp +1, hạt +19, điểm ảnh vệt +39% | lớp +0, hạt +8, điểm ảnh vệt +14% | Thành hình→Thức tỉnh: đổi quá ít |
| Kiếm: Trảm Nguyệt (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe, ring; lớp +4, hạt +0, điểm ảnh vệt +230% | lớp +0, hạt +3, điểm ảnh vệt +5% | Thành hình→Thức tỉnh: không đổi gì |
| Kiếm: Trảm Nguyệt (Đặc biệt) | Băng | thêm gai-bang(hàng gai), ring; lớp +0, hạt +4, điểm ảnh vệt +321% | lớp +0, hạt +8, điểm ảnh vệt +12% | Thành hình→Thức tỉnh: đổi quá ít |
| Thương: 3 đâm + quét vòng | Lửa | thêm no-lua; lớp +0, hạt +34, điểm ảnh vệt +46% | lớp +0, hạt +15, điểm ảnh vệt +10% | Thành hình→Thức tỉnh: đổi quá ít; Thức tỉnh quá rối (9 lớp, 102 hạt) |
| Thương: 3 đâm + quét vòng | Độc | thêm he:drawCloud, doc-toe; bớt hat-no; lớp +0, hạt +12, điểm ảnh vệt +33% | thêm hat-no; lớp +1, hạt +0, điểm ảnh vệt +1% | — |
| Thương: 3 đâm + quét vòng | Băng | thêm gai-bang(hàng gai), dong-bang, hat-no; lớp +3, hạt +37, điểm ảnh vệt +30% | lớp +2, hạt +24, điểm ảnh vệt +15% | Thành hình→Thức tỉnh: đổi quá ít; Thức tỉnh quá rối (12 lớp, 94 hạt) |
| Thương: giữ → xốc tới | Lửa | thêm hat-no, pillar; lớp +3, hạt +33, điểm ảnh vệt +87% | lớp +0, hạt +9, điểm ảnh vệt +36% | — |
| Thương: giữ → xốc tới | Độc | thêm he:drawCloud, doc-toe, ring; bớt hat-no; lớp +4, hạt +3, điểm ảnh vệt +546% | thêm hat-no; lớp +1, hạt +2, điểm ảnh vệt -1% | — |
| Thương: giữ → xốc tới | Băng | thêm gai-bang(hàng gai), ring; lớp +3, hạt +24, điểm ảnh vệt +687% | lớp +0, hạt +7, điểm ảnh vệt +3% | Thành hình→Thức tỉnh: không đổi gì |
| Thương: Phi Thương (Đặc biệt) | Lửa | thêm pillar; lớp +0, hạt +35, điểm ảnh vệt +72% | lớp +1, hạt +3, điểm ảnh vệt +51% | — |
| Thương: Phi Thương (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe; lớp +8, hạt +17, điểm ảnh vệt +861% | lớp -1, hạt +2, điểm ảnh vệt +8% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (15 lớp, 40 hạt) |
| Thương: Phi Thương (Đặc biệt) | Băng | thêm gai-bang(hàng gai); lớp +2, hạt +24, điểm ảnh vệt +449% | lớp +1, hạt +2, điểm ảnh vệt +31% | — |
| Búa: nện thường | Lửa | lớp +0, hạt +26, điểm ảnh vệt +20% | lớp +0, hạt +10, điểm ảnh vệt -11% | Mầm→Thành hình: đổi quá ít; Thành hình→Thức tỉnh: đổi quá ít |
| Búa: nện thường | Độc | lớp +0, hạt +5, điểm ảnh vệt +1% | lớp +0, hạt +1, điểm ảnh vệt +7% | Mầm→Thành hình: không đổi gì; Thành hình→Thức tỉnh: không đổi gì |
| Búa: nện thường | Băng | lớp +0, hạt +17, điểm ảnh vệt -0% | lớp +0, hạt -1, điểm ảnh vệt -0% | Mầm→Thành hình: không đổi gì; Thành hình→Thức tỉnh: không đổi gì |
| Búa: nện đất nấc 1 | Lửa | thêm no-lua; lớp +1, hạt +49, điểm ảnh vệt +45% | lớp +0, hạt +7, điểm ảnh vệt +5% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (11 lớp, 107 hạt) |
| Búa: nện đất nấc 1 | Độc | thêm he:drawCloud, doc-toe; lớp +3, hạt +5, điểm ảnh vệt +42% | lớp +0, hạt +3, điểm ảnh vệt +3% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (13 lớp, 22 hạt) |
| Búa: nện đất nấc 1 | Băng | thêm gai-bang(hàng gai), dong-bang; lớp +5, hạt +53, điểm ảnh vệt +52% | lớp +0, hạt +1, điểm ảnh vệt +14% | Thành hình→Thức tỉnh: đổi quá ít; Thức tỉnh quá rối (15 lớp, 85 hạt) |
| Búa: nện đất nấc 2 | Lửa | thêm no-lua; lớp +1, hạt +55, điểm ảnh vệt +44% | lớp +0, hạt +3, điểm ảnh vệt +2% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (11 lớp, 112 hạt) |
| Búa: nện đất nấc 2 | Độc | thêm he:drawCloud, doc-toe; lớp +3, hạt +12, điểm ảnh vệt +54% | lớp +0, hạt -3, điểm ảnh vệt +6% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (13 lớp, 22 hạt) |
| Búa: nện đất nấc 2 | Băng | thêm gai-bang(hàng gai), dong-bang; bớt khoi-tron; lớp +5, hạt +55, điểm ảnh vệt +67% | lớp +0, hạt -2, điểm ảnh vệt +7% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (15 lớp, 81 hạt) |
| Búa: Địa Chấn (Đặc biệt) | Lửa | thêm pillar; lớp +0, hạt +34, điểm ảnh vệt +1% | lớp +0, hạt -1, điểm ảnh vệt +6% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (11 lớp, 93 hạt) |
| Búa: Địa Chấn (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe; lớp +4, hạt +7, điểm ảnh vệt +106% | lớp +0, hạt +4, điểm ảnh vệt -4% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (15 lớp, 36 hạt) |
| Búa: Địa Chấn (Đặc biệt) | Băng | thêm gai-bang(hàng gai), dong-bang; lớp +3, hạt +51, điểm ảnh vệt +116% | lớp +0, hạt -4, điểm ảnh vệt +9% | Thành hình→Thức tỉnh: không đổi gì; Thức tỉnh quá rối (14 lớp, 79 hạt) |
| Phi tiêu: 3 phát | Lửa | thêm va-cham, ring; lớp +4, hạt +53, điểm ảnh vệt -4% | lớp +0, hạt +5, điểm ảnh vệt +3% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: 3 phát | Độc | thêm hat-no, va-cham, ring; lớp +5, hạt +18, điểm ảnh vệt +5% | lớp +0, hạt +2, điểm ảnh vệt -0% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: 3 phát | Băng | thêm flash; lớp +4, hạt +20, điểm ảnh vệt +20% | lớp -1, hạt +3, điểm ảnh vệt -28% | — |
| Phi tiêu: giữ → ném chùm | Lửa | thêm va-cham, ring; lớp +5, hạt +35, điểm ảnh vệt +42% | lớp +0, hạt +5, điểm ảnh vệt -1% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: giữ → ném chùm | Độc | thêm va-cham, ring; lớp +4, hạt +8, điểm ảnh vệt +12% | thêm hat-no; lớp +1, hạt +2, điểm ảnh vệt -8% | — |
| Phi tiêu: giữ → ném chùm | Băng | thêm flash, hat-no; lớp +4, hạt +14, điểm ảnh vệt +32% | lớp +0, hạt +7, điểm ảnh vệt +3% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: mưa (Đặc biệt) | Lửa | thêm hat-no, no-lua; lớp +2, hạt +32, điểm ảnh vệt +0% | lớp -1, hạt +10, điểm ảnh vệt +0% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: mưa (Đặc biệt) | Độc | thêm he:drawCloud, doc-toe, ring; lớp +3, hạt +13, điểm ảnh vệt +0% | lớp +0, hạt -2, điểm ảnh vệt +5% | Thành hình→Thức tỉnh: không đổi gì |
| Phi tiêu: mưa (Đặc biệt) | Băng | thêm gai-bang(hàng gai), dong-bang, hat-no, ring; lớp +6, hạt +52, điểm ảnh vệt +0% | thêm bang-vo; lớp +7, hạt +53, điểm ảnh vệt +11% | Thức tỉnh quá rối (13 lớp, 128 hạt) |

## Tầm sau khi sửa

| Đòn | Nhát | Hệ · bậc | Tầm trúng thật (mép thân quái) | Tầm hình vệt | Lệch (hình − trúng) | Phía sau lưng: hình / trúng | Cao hình vệt (trên chân) |
|---|---|---|---|---|---|---|---|
| Kiếm nặng | nhát 1 (lê → hất lên) | Trắng · Trắng | 30 | 48 | **+18** | -43 / không | 37 |
| Kiếm nặng | nhát 2 (bổ xuống) | Trắng · Trắng | 30 | 40 | **+10** | None / không | 34 |
| Kiếm nặng | nhát 3 (chém ngang) | Trắng · Trắng | 36 | 43 | **+7** | -33 / không | 44 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Lửa · Mầm | 30 | 48 | **+18** | -49 / không | 39 |
| Kiếm nặng | nhát 2 (bổ xuống) | Lửa · Mầm | 30 | 45 | **+15** | None / không | 36 |
| Kiếm nặng | nhát 3 (chém ngang) | Lửa · Mầm | 36 | 46 | **+10** | -37 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Lửa · Thức tỉnh | 30 | 54 | **+24** | -54 / không | 40 |
| Kiếm nặng | nhát 2 (bổ xuống) | Lửa · Thức tỉnh | 30 | 49 | **+19** | None / không | 37 |
| Kiếm nặng | nhát 3 (chém ngang) | Lửa · Thức tỉnh | 48 | 50 | +2 | -42 / không | 47 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Độc · Mầm | 30 | 48 | **+18** | -49 / không | 39 |
| Kiếm nặng | nhát 2 (bổ xuống) | Độc · Mầm | 30 | 45 | **+15** | None / không | 36 |
| Kiếm nặng | nhát 3 (chém ngang) | Độc · Mầm | 36 | 46 | **+10** | -37 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Độc · Thức tỉnh | 30 | 54 | **+24** | -54 / không | 40 |
| Kiếm nặng | nhát 2 (bổ xuống) | Độc · Thức tỉnh | 30 | 49 | **+19** | None / không | 37 |
| Kiếm nặng | nhát 3 (chém ngang) | Độc · Thức tỉnh | 36 | 51 | **+15** | -42 / không | 47 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Băng · Mầm | 30 | 48 | **+18** | -49 / không | 50 |
| Kiếm nặng | nhát 2 (bổ xuống) | Băng · Mầm | 30 | 45 | **+15** | None / không | 40 |
| Kiếm nặng | nhát 3 (chém ngang) | Băng · Mầm | 36 | 46 | **+10** | -37 / không | 46 |
| Kiếm nặng | nhát 1 (lê → hất lên) | Băng · Thức tỉnh | 30 | 54 | **+24** | -54 / không | 45 |
| Kiếm nặng | nhát 2 (bổ xuống) | Băng · Thức tỉnh | 30 | 49 | **+19** | None / không | 37 |
| Kiếm nặng | nhát 3 (chém ngang) | Băng · Thức tỉnh | 72 | 84 | **+12** | -42 / không | 47 |
| Kiếm lướt chém | — | Trắng · Trắng | 60 | 151 | **+91** | -8 / không | 31 |
| Kiếm lướt chém | — | Lửa · Mầm | 60 | 136 | **+76** | -8 / không | 25 |
| Kiếm lướt chém | — | Lửa · Thức tỉnh | 60 | 149 | **+89** | -8 / không | 26 |
| Kiếm lướt chém | — | Độc · Mầm | 60 | 132 | **+72** | -8 / không | 25 |
| Kiếm lướt chém | — | Độc · Thức tỉnh | 60 | 138 | **+78** | -8 / không | 30 |
| Kiếm lướt chém | — | Băng · Mầm | 60 | 133 | **+73** | -8 / không | 41 |
| Kiếm lướt chém | — | Băng · Thức tỉnh | 60 | 143 | **+83** | -8 / không | 41 |
| Thương | đâm 1 | Trắng · Trắng | 54 | 63 | **+9** | None / không | 34 |
| Thương | đâm 2 | Trắng · Trắng | 54 | 63 | **+9** | None / không | 65 |
| Thương | đâm 3 | Trắng · Trắng | 60 | 65 | +5 | -3 / không | 64 |
| Thương | quét vòng | Trắng · Trắng | 42 | 65 | **+23** | -48 / không | 52 |
| Thương | đâm 1 | Lửa · Mầm | 54 | 63 | **+9** | None / không | 34 |
| Thương | đâm 2 | Lửa · Mầm | 54 | 63 | **+9** | None / không | 65 |
| Thương | đâm 3 | Lửa · Mầm | 60 | 65 | +5 | -3 / không | 64 |
| Thương | quét vòng | Lửa · Mầm | 42 | 65 | **+23** | -48 / không | 53 |
| Thương | đâm 1 | Lửa · Thức tỉnh | 54 | 63 | **+9** | None / không | 34 |
| Thương | đâm 2 | Lửa · Thức tỉnh | 54 | 71 | **+17** | None / không | 65 |
| Thương | đâm 3 | Lửa · Thức tỉnh | 60 | 71 | **+11** | -3 / không | 64 |
| Thương | quét vòng | Lửa · Thức tỉnh | 42 | 78 | **+36** | -55 / -16 | 64 |
| Thương | đâm 1 | Độc · Mầm | 54 | 62 | **+8** | None / không | 33 |
| Thương | đâm 2 | Độc · Mầm | 54 | 62 | **+8** | None / không | 64 |
| Thương | đâm 3 | Độc · Mầm | 60 | 66 | +6 | -3 / không | 64 |
| Thương | quét vòng | Độc · Mầm | 42 | 66 | **+24** | -48 / không | 53 |
| Thương | đâm 1 | Độc · Thức tỉnh | 54 | 65 | **+11** | None / không | 34 |
| Thương | đâm 2 | Độc · Thức tỉnh | 54 | 65 | **+11** | None / không | 65 |
| Thương | đâm 3 | Độc · Thức tỉnh | 60 | 65 | +5 | -3 / không | 64 |
| Thương | quét vòng | Độc · Thức tỉnh | 42 | 78 | **+36** | -55 / không | 64 |
| Thương | đâm 1 | Băng · Mầm | 54 | 66 | **+12** | None / không | 43 |
| Thương | đâm 2 | Băng · Mầm | 54 | 68 | **+14** | None / không | 65 |
| Thương | đâm 3 | Băng · Mầm | 60 | 68 | **+8** | -3 / không | 64 |
| Thương | quét vòng | Băng · Mầm | 42 | 68 | **+26** | -48 / không | 53 |
| Thương | đâm 1 | Băng · Thức tỉnh | 54 | 67 | **+13** | None / không | 39 |
| Thương | đâm 2 | Băng · Thức tỉnh | 54 | 69 | **+15** | None / không | 65 |
| Thương | đâm 3 | Băng · Thức tỉnh | 60 | 71 | **+11** | -3 / không | 64 |
| Thương | quét vòng | Băng · Thức tỉnh | 48 | 78 | **+30** | -55 / -28 | 64 |
| Thương xốc tới | — | Trắng · Trắng | 60 | 45 | -15 | -4 / -4 | 22 |
| Thương xốc tới | — | Lửa · Mầm | 60 | 45 | -15 | -4 / -4 | 22 |
| Thương xốc tới | — | Lửa · Thức tỉnh | 60 | 57 | -3 | -4 / -4 | 22 |
| Thương xốc tới | — | Độc · Mầm | 60 | 45 | -15 | -4 / -4 | 33 |
| Thương xốc tới | — | Độc · Thức tỉnh | 60 | 73 | **+13** | -5 / -4 | 30 |
| Thương xốc tới | — | Băng · Mầm | 60 | 63 | +3 | -4 / -4 | 32 |
| Thương xốc tới | — | Băng · Thức tỉnh | 60 | 69 | **+9** | -4 / -4 | 32 |
| Búa nện | — | Trắng · Trắng | 30 | 47 | **+17** | None / không | 49 |
| Búa nện | — | Lửa · Mầm | 30 | 44 | **+14** | None / không | 50 |
| Búa nện | — | Lửa · Thức tỉnh | 30 | 49 | **+19** | None / không | 47 |
| Búa nện | — | Độc · Mầm | 30 | 46 | **+16** | None / không | 50 |
| Búa nện | — | Độc · Thức tỉnh | 30 | 52 | **+22** | None / không | 47 |
| Búa nện | — | Băng · Mầm | 30 | 46 | **+16** | -9 / không | 50 |
| Búa nện | — | Băng · Thức tỉnh | 30 | 52 | **+22** | -2 / không | 47 |
| Búa nện đất nấc 1 | — | Trắng · Trắng | 108 | 88 | -20 | -8 / -4 | 43 |
| Búa nện đất nấc 1 | — | Lửa · Mầm | 108 | 88 | -20 | -8 / -4 | 43 |
| Búa nện đất nấc 1 | — | Lửa · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 41 |
| Búa nện đất nấc 1 | — | Độc · Mầm | 108 | 88 | -20 | -24 / -4 | 43 |
| Búa nện đất nấc 1 | — | Độc · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 40 |
| Búa nện đất nấc 1 | — | Băng · Mầm | 108 | 88 | -20 | -8 / -4 | 55 |
| Búa nện đất nấc 1 | — | Băng · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 45 |
| Búa nện đất nấc 2 | — | Trắng · Trắng | 108 | 88 | -20 | -8 / -4 | 43 |
| Búa nện đất nấc 2 | — | Lửa · Mầm | 108 | 88 | -20 | -8 / -4 | 43 |
| Búa nện đất nấc 2 | — | Lửa · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 41 |
| Búa nện đất nấc 2 | — | Độc · Mầm | 108 | 88 | -20 | -8 / -4 | 43 |
| Búa nện đất nấc 2 | — | Độc · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 40 |
| Búa nện đất nấc 2 | — | Băng · Mầm | 108 | 88 | -20 | -8 / -4 | 52 |
| Búa nện đất nấc 2 | — | Băng · Thức tỉnh | 108 | 88 | -20 | -8 / -4 | 40 |

## Tình huống riêng sau khi sửa

| Tình huống | Hệ đòn | Bậc | Hình hiệu ứng (tên ảnh ×lần, ms) | Lớp cùng lúc tối đa | Phản ứng ghi được | Số hiện trên quái |
|---|---|---|---|---|---|---|
| Nổ khói (Lửa + Độc) | Lửa | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; no-khoi 720; scorch 1800; hat-no 450; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; no-lua 670 | 6 | smoke | 2·nhịp, 35, 13, 1·nhịp, 26, 2·nhịp |
| Nổ khói (Lửa + Độc) | Độc | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; no-khoi×2 720; scorch×2 1800; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; doc-toe 720; ring 340; he:drawCloud 3283 | 10 | smoke, smoke | 1·nhịp, 31, 13, 2·nhịp, 58, 2·nhịp |
| Sốc nhiệt (Lửa + Băng) | Lửa | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; soc-nhiet 620; hat-no×2 450; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; no-lua 670 | 6 | shock | 43, 13, 1·nhịp, 26, 2·nhịp |
| Sốc nhiệt (Lửa + Băng) | Băng | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; soc-nhiet 620; hat-no×2 450; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; he:drawSpikes 1050; ring 260 | 7 | shock | 1·nhịp, 43, 13, 29 |
| Đóng băng (5 tầng Băng) rồi vỡ | Băng | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; dong-bang 420; hat-no×2 450; chem-kiem-nang-3 672; bang-vo×2 420; ring×2 260/280; chem-kiem-nang-4 544; trung-nang 360; he:drawSpikes 1050 | 7 | freeze | 12, 22, 29 |
| Đóng băng (5 tầng Băng) rồi vỡ | Băng | Mầm | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; dong-bang 420; hat-no×2 450; chem-kiem-nang-4 544; trung-nang 360 | 6 | freeze | 12, 13, 22 |
| Nổ lan khi quái cháy chết | Lửa | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; chem-kiem-nang-4 544; quai-chet 620; orb 1400; scorch 2200; no-lua×2 670; hat-no 450; trung-nang 360 | 9 | — | 1·nhịp, 12, 13, 1·nhịp, 22 |
| Lây độc khi quái trúng độc chết | Độc | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung 320; chem-kiem-nang-3 672; quai-chet 620; orb 1400; trung-nang 360; chem-kiem-nang-4 544; doc-toe 720; ring 340; he:drawCloud 3283 | 8 | — | 2·nhịp, 14, 15 |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Lửa | Mầm | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; hat-no 450 | 4 | — | 12, 13, 1·nhịp, 22, 1·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Lửa | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; hat-no×2 450; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; no-lua 670 | 5 | — | 12, 13, 1·nhịp, 26, 2·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Độc | Mầm | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360 | 3 | — | 12, 14, 1·nhịp, 23, 1·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Độc | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360; doc-toe 720; ring 340; he:drawCloud 3283 | 6 | — | 12, 14, 1·nhịp, 24, 3·nhịp |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Băng | Mầm | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; chem-kiem-nang-4 544; trung-nang 360 | 3 | — | 12, 13, 22 |
| Đánh trùm Mộc Tinh (kiếm 3 nhát) | Băng | Thức tỉnh | chem-kiem-nang-1 400; chem-kiem-nang-2 512; trung×2 320; chem-kiem-nang-3 672; hat-no 450; chem-kiem-nang-4 544; trung-nang 360; he:drawSpikes 1050; ring 260 | 6 | — | 12, 13, 29 |
