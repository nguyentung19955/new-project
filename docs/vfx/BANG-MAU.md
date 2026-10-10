# Bảng màu và hướng mỹ thuật — Linh Khí / Spiritblade

Phiên `dt-dau-truong`, 10/10/2026. Ba phiên giai đoạn 2–4 (`dt-dau-truong`, `dt-nhan-vat`, `dt-hud-dang-nhap`) cùng dùng bảng này.
Màu viết dạng `#rrggbb`. Ô "lấy từ" cho biết màu đang nằm ở tệp nào; đổi màu thì đổi ở đó, rồi sửa bảng này cho khớp.

## 0. Ba nguyên tắc (đọc trước)

1. **Nền trầm – nhân vật sáng – nguy hiểm nóng.** Nền môi trường luôn tối hơn và nhạt màu hơn nhân vật, quái và hiệu ứng.
   Độ sáng (độ sáng cảm nhận, 0–100) gợi ý:
   | Lớp | Độ sáng | Độ đậm màu (bão hoà) |
   |---|---|---|
   | Khoảng tối ngoài phòng, nóc tường | 3–10 | rất thấp |
   | Tường, rào, thân cây (hậu cảnh) | 12–26 | thấp |
   | Mép sàn sát tường | 15–22 | thấp |
   | Sàn giữa phòng (khu chiến đấu) | 26–36 | thấp – vừa |
   | Quái (thân) | 30–60 | vừa, có điểm nhấn |
   | Em bé (mặt nạ, áo) | 45–95 | cao ở áo đỏ, mặt nạ trắng |
   | Hiệu ứng kỹ năng (lõi) | 70–100 | cao |
   | Vùng nguy hiểm | đỏ/cam bão hoà cao, viền sáng | cao |
   Không tô sàn sáng hơn 40: em bé và quái phải luôn là thứ sáng nhất trong khu chiến đấu, chỉ thua hiệu ứng.
2. **Mỗi vùng một sắc chủ đạo, một màu đèn.** Rừng già xanh rêu + nâu đất, đèn vàng lục; Hang biển xanh đen + xám đá, đèn lam ngọc;
   Lâu đài cổ xám ấm + nâu đỏ, đèn cam lửa. Ánh sáng giữa phòng mang màu đèn của vùng, rất nhẹ.
3. **Không dùng đỏ/cam bão hoà cao trên nền.** Đỏ tươi `#ff2818`–`#ff5a40` và cam sáng dành riêng cho vùng nguy hiểm, ổ khoá, đòn quái.
   Nền Lâu đài cổ có đỏ thì là đỏ trầm (`#4e2a32`, `#7a2a2a`), không vượt độ sáng 30.

## 1. Nền môi trường theo vùng

Lấy từ: `game/js/room_art.js` (bảng `F` Rừng già, `C` Hang biển, `K` Lâu đài cổ; lớp sàn mới `ZONE`).

### Rừng già (vùng 0) — xanh rêu, nâu đất
| Vai trò | Màu | Ghi chú |
|---|---|---|
| Khoảng tối ngoài phòng | `#0b1610` | |
| Lá tối / vừa / sáng / điểm sáng | `#13291a` `#1d3d25` `#2f5f34` `#4c8a3e` | tán lá, rào lá |
| Vỏ cây tối / vừa / sáng | `#261c14` `#3b2d20` `#57432e` | thân cây tường sau |
| Rêu / rêu sáng | `#3d6a2e` `#69994a` | |
| Đất nền sàn | `#3f4130` | nâu rêu, hơi lục để quái nâu (lợn rừng) tách màu |
| Lối mòn, giữa phòng | `#55503a` | đất nện sáng hơn, nơi đánh nhau |
| Mảng rêu/cỏ trên sàn | `#38492b` → `#46602f` | mảng lớn, ít, theo cụm |
| Viền tối sát tường | `#262a1d` | 10–16 điểm ảnh sát tường |
| Màu đèn (ánh sáng giữa phòng, đom đóm) | `#e4f0a0` | |
| Sương | `#c8dcb0` | rất mỏng, chỉ ở rìa |

### Hang biển (vùng 1) — xanh đen, xám đá, lam ngọc
| Vai trò | Màu | Ghi chú |
|---|---|---|
| Khoảng tối | `#0a121c` | |
| Đá tối / vừa / sáng | `#141d29` `#22303f` `#34495c` | vách hang |
| Đá ướt (ánh) | `#6f9ab8` | |
| Sàn đá nền | `#39424d` | |
| Giữa phòng | `#46505b` | phiến đá phẳng, sáng hơn |
| Viền tối sát vách | `#1f2731` | |
| Nước tối / nước / ánh nước | `#123650` `#1b4a66` `#8fd0ea` | |
| Tinh thể tối / vừa / sáng | `#2a7fae` `#58c8ea` `#d8f6ff` | điểm nhấn |
| Màu đèn | `#9fe0f4` | |
| Sương | `#cfe8f0` | dải sát sàn |

### Lâu đài cổ (vùng 2) — xám ấm, nâu đỏ trầm, ánh lửa
| Vai trò | Màu | Ghi chú |
|---|---|---|
| Khoảng tối | `#120c0c` | |
| Gạch tối / vừa / sáng | `#342a2b` `#4b3f3f` `#5f504c` | tường sau |
| Đá cột / đá sáng | `#6e5f58` `#8a7a6e` | |
| Nóc tường | `#2a2223` `#3a3031` `#4c4041` | |
| Gỗ tối / vừa / sáng | `#2e1c12` `#4a3020` `#6a4830` | thùng, rương |
| Sắt / sắt sáng | `#55555e` `#8a8a96` | song cửa, giá đuốc |
| Đỏ cờ / đỏ tối | `#7a2a2a` `#4e1c20` | chỉ ở tường, cờ, thảm |
| Vàng đồng (viền thảm, cờ) | `#c89a3a` | |
| Sàn đá nền | `#4c4442` | |
| Giữa phòng (ánh đuốc) | `#5a504b` | |
| Viền tối sát tường | `#2a2324` | |
| Màu đèn (đuốc) | `#ffc878` / quầng `#ff9a40` | |
| Bụi trong ánh lửa | `#ffd9a0` | |

### Phòng đặc biệt (dấu trên sàn, cùng mọi vùng)
| Phòng | Màu | |
|---|---|---|
| Bắt đầu | `#8fe06a` | vòng lục |
| Tinh anh | `#ff8a3a` | vòng cam trầm (độ trong ≤ 0,45 để không lẫn vùng nguy hiểm) |
| Thử thách | `#4ad0c0` | |
| Lời nguyền | `#b46aff` | |
| Trùm | màu đèn của vùng | hai vòng + 8 chấm |

### Làng (village_scene.js)
Chạng vạng/ban đêm, giữ như hiện tại: nước `#1b3a4a`–`#2e5a6a`, mái gỗ nâu, đèn lồng `#ffb347`/`#ffd98a`. Nền làng sau chữ đăng nhập: phiên `dt-hud-dang-nhap` làm tối thêm phía sau khối chữ.

## 2. Nhân vật

Lấy từ: `game/js/hero_tinhlinh.js` (dải 3 nấc tối – vừa – sáng).
| Phần | Dải màu | |
|---|---|---|
| Viền (mực) | `#1b1118` | viền ngoài mọi sprite |
| Mặt nạ | `#c9c0ae` `#f6f0e2` `#ffffff` | sáng nhất trên sân — điểm nhận diện |
| Da tinh linh | `#7f79a6` `#b7b1d8` `#e2def4` | tím nhạt, khác mọi nền |
| Áo đỏ | `#8c1c1f` `#d2362e` `#f47a62` | điểm nhấn chính |
| Vàng (trang sức) | `#9c7426` `#e2b64e` `#ffe9a0` | |
| Thép vũ khí | `#5f6b84` `#b4c0d4` `#f4f8ff` | |
Quái: mỗi loài có bảng riêng trong `monster_art.js` / `art.js`. Quy tắc: thân quái độ sáng 30–60, có một điểm nhấn sáng (mắt, nanh, mào) ≥ 75; quái cùng tông với nền vùng (ví dụ lợn rừng nâu ở Rừng già) cần viền tối rõ và vành sáng phía trên (phiên `dt-nhan-vat`).
Bóng chân: `rgba(0,0,0,0.30–0.35)` hình elip, mọi nhân vật như nhau.

## 3. Kỹ năng (theo hệ)

Lấy từ: `game/js/fx.js` bảng `PAL` (và `G.DATA` hệ trong `data.js`). Mỗi hệ: sáng nhất – sáng – chính – tối.
| Hệ | hi | c2 | c (chính) | d (tối) | Ý nghĩa |
|---|---|---|---|---|---|
| Lửa | `#fff3b0` | `#ffd23f` | `#ff7a2a` | `#a8320a` | nóng, nổ, cháy |
| Độc | `#e6ffc0` | `#c2f58a` | `#6fcf3a` | `#2f6b1a` | lục ngả tím khi tan |
| Băng | `#ffffff` | `#e9f9ff` | `#7fd4ff` | `#2b6ea3` | lạnh, chậm |
| Không hệ (thép) | `#ffffff` | `#ffffff` | `#e4e0d4` | `#8a93a0` | vệt kiếm trắng |
| Vàng (chí mạng, nhặt) | `#ffffff` | `#fff3b0` | `#ffd23f` | `#a8742a` | |
| Đòn quái | `#ffffff` | `#ffd0c0` | `#ff5a40` | `#8a1c12` | |
Hồi máu: lục sáng ngả trắng có dấu cộng (khác độc). Vòng phép của mình: vàng/lục/lam theo hệ, KHÔNG đỏ.

## 4. Vùng nguy hiểm

Lấy từ: `game/js/bao_truoc.js` `cols()`.
| Trạng thái | Màu | |
|---|---|---|
| Sắp xảy ra (báo trước) — lòng | `rgb(255,40,28)` độ trong 0,28–0,40 | đầy dần |
| Sắp xảy ra — viền | `rgb(255,150,128)` | nhấp nháy theo nhịp |
| Đang gây sát thương (chớp) | trắng ấm `rgb(255,246,226)` + viền đỏ dày | 0,22 giây |
| Pha theo hệ quái | băng → đỏ ngả lam, độc → đỏ ngả lục, lửa → đỏ cam | pha ≤ 30% |
| Chỗ quái sắp mọc | đỏ `#ff3a22` + lõi tối `#08040a` | |
| Cửa khoá | đỏ `#c8352a`, vệt `rgba(255,60,40,0.4)` | |
Nền không được có màu nào trong dải này (xem nguyên tắc 3).

## 5. Giao diện

Lấy từ: `game/js/ui_theme.js` bảng `C` (phiên `dt-hud-dang-nhap` có thể tinh chỉnh, ghi lại ở đây).
| Vai trò | Màu |
|---|---|
| Tối nhất (viền ngoài) | `#1a120a` |
| Gỗ/đồng tối – đồng – vàng – vàng nhạt | `#5a3d1a` `#a8752f` `#d9a441` `#f6dc92` |
| Lam ngọc (hoa văn) tối – vừa – sáng | `#1f4f4a` `#3f8f7f` `#6fc1a8` |
| Nền bảng | `#12292a` `#17363a` |
| Đồng đỏ (nút chính) | `#8a2f22` `#b8452f` |
| Chữ chính / chữ nhấn / chữ phụ | `#f1e6c6` `#fff0c4` `#a9c2b4` |
| Thanh máu | `#d0482f` → `#f08a5a` |
| Thanh năng lượng | `#3f8fe0` → `#8fc6ff` |
| Thanh kinh nghiệm | `#d9a441` → `#f6dc92` |
| Thanh trùm | `#b8452f` → `#ff9a6a` |
| Bậc đồ: Thường / Lam / Tím / Vàng | `#b9b1a2` `#4aa3ff` `#b36bff` `#ffc83d` |
| Khung nhỏ HUD (`T.plate`): viền ngoài / viền đồng / mép trên sáng / lòng gỗ sẫm | `#1a120a` / `#a8752f` / `#cba06e` / `rgba(22,15,10,0.84)`, đinh góc `#d9a441` |
| Khung trùm vùng (`T.bossBar`): viền vàng, tên | `#d9a441`, chữ `#ffe2c8`; trùm nhỏ viền `#a8752f` chữ `#ffd9c8` |
| Khung tinh anh: thanh, tên, dấu hiệu | `#ff8a3a` → `#ffc890`, chữ `#ffd0a8`, dấu hiệu `#ffb48a` |
| Màn đăng nhập: chữ LINH KHÍ / dòng SPIRITBLADE / lớp tối sau chữ | `#f6dc92` viền `#1a120a` / `#d9a441` / elip `rgba(8,6,10,0.78)` → trong suốt |

Quy ước HUD (phiên `dt-hud-dang-nhap`): khung HUD trong ải là gỗ sẫm viền đồng mảnh 1 điểm (không viền dày, không màu cạnh tranh);
bảng menu (Hành trang, bảng làng) giữ lòng lam ngọc sẫm của trống đồng. Màu theo bậc đồ và theo hệ chỉ dùng cho viền ô đồ, chữ bậc, thanh hệ.

## 6. Ánh sáng và sương (phiên dt-dau-truong)
- Ánh sáng giữa phòng: hình elip lớn theo màu đèn vùng, tô bằng **lưới điểm ảnh (dither)** 2–3 nấc, độ trong ≤ 0,07; không gradient mịn, không blur.
- Rìa phòng: tối hơn giữa phòng khoảng 15–25% (dither), KHÔNG phủ đen nặng ở góc.
- Đuốc/đèn: quầng sáng bậc thang (3 nấc elip, mỗi nấc độ trong cố định) + hạt sáng; chập chờn ở lớp động.
- Sương: dải mỏng màu sương của vùng, độ trong ≤ 0,06, chỉ trôi ở rìa và sát tường, không đi qua giữa phòng quá 1 lớp.
