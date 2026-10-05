# Núi Cao Nước Dâng · Tài liệu bàn giao thiết kế

Dành cho người làm game tiếp theo (lập trình viên, họa sĩ, animator). Đọc kèm **GAMEPLAY.md (phiên bản 15)** — tài liệu luật chơi và số liệu.

---

## 1. Trong gói có gì

| Đường dẫn | Nội dung |
|---|---|
| `GAMEPLAY.md` | Luật chơi v15: tướng, 16 tướng (6 cơ bản + 10 huyền thoại), kỹ năng, tiến hoá, đồ, quái, boss, Núi Tản Viên, Nước Dâng, animation |
| `HANDOFF.md` | Tài liệu này |
| `giao-dien/NuiCaoNuocDang-giao-dien.html` | Toàn bộ 21 màn hình trong một trang, mở bằng trình duyệt |
| `giao-dien/png/*.png` | Ảnh chụp từng màn (độ phân giải gấp đôi, 1864×860) |
| `animation/den-anh-hung.html` | Bản mẫu animation 16 tướng: đứng yên, 4 chiêu, xuất hiện, bị đánh, sa lầy, gục. Cần mạng để tải thư viện GSAP và font |
| `nguon-thiet-ke/*.dc.html` | File nguồn từng màn (HTML + SVG), lấy được màu, kích thước, hình vẽ vector |

Kích thước thiết kế: **932 × 430 px** (điện thoại cầm ngang). Màn nhắc xoay ngang là 390 × 844.

---

## 2. Danh sách màn hình

| # | Màn | File nguồn | Ghi chú |
|---|---|---|---|
| 1 | Menu chính | `MenuChinh` | Chơi tiếp, Chiến dịch, Đền Anh Hùng, Bách khoa, Cài đặt |
| 2 | Mở đầu · Vua Hùng kén rể | `MoDau` | 3 khung truyện, Bỏ qua / Vào trận |
| 3 | Bản đồ chiến dịch | `BanDo` | 8 ải dọc sông Đà (tên ải là đề xuất), điều kiện 1–3 sao |
| 4 | Màn chơi | `Main` | Bản đồ, thanh trên, bảng triệu hồi (cơ bản + nút Huyền thoại), bảng điều khiển dưới: bản đồ nhỏ, chân dung, thông tin, 6 ô đồ, lưới lệnh 4×3 |
| 5 | Chọn sính lễ (hạ boss) | `SinhLe` | Chọn 1 trong 3, cảnh báo nước dâng |
| 6 | Lò đúc đồng · Công thức | `LoDucDong` | |
| 7 | Lò đúc đồng · Cửa hàng | `CuaHang` | Giá từng món là đề xuất (100–130) |
| 8 | Lò đúc đồng · Hũ báu | `HuBau` | |
| 9 | Túi đồ | `TuiDo` | Cường hóa, thăng phẩm khi full +5, khóa, đổi vàng |
| 10 | Đổi đồ ra vàng | `DoiVang` | Lọc theo chất lượng, xác nhận |
| 11 | Cây kỹ năng | `CayKyNang` | Mở W/E/R bằng vàng |
| 12 | Tiến hoá | `TienHoa` | Mua ★ bằng vàng, Bộ Lạc Long |
| 13 | Núi Tản Viên | `NuiTanVien` | 5 giai đoạn, Hái Linh Chi, Bồi đất |
| 14 | Bách khoa · Quái | `BachKhoa` | Lịch 30 đợt |
| 15 | Bách khoa · Boss | `BachKhoaBoss` | Thuồng Luồng, Hà Bá, Thủy Tinh |
| 16 | Thắng trận | `ThangTran` | Số liệu là ví dụ |
| 17 | Thua trận | `ThuaTran` | Mẹo lần sau |
| 18 | Icon 24 kỹ năng cơ bản | `KyNang` | |
| 19–20 | Icon 40 kỹ năng huyền thoại | `KyNangHT1`, `KyNangHT2` | |
| 21 | Nhắc xoay ngang | `XoayNgang` | 390 × 844 |

Các màn mở lên trong trận (Lò đúc, Túi đồ, Cây kỹ năng, Tiến hoá, Núi, Bách khoa) **không dừng game** — có chip "Quái vẫn đang chạy".

---

## 3. Phong cách (design tokens)

Phong cách: bảng điều khiển game chiến thuật kiểu Warcraft 3 (khung kim loại viền vàng) kết hợp họa tiết **trống đồng Đông Sơn** (vòng tròn đồng tâm, ngôi sao 12–14 cánh, răng cưa, chim Lạc).

### Màu
| Vai trò | Mã màu |
|---|---|
| Nền | `#14110D` |
| Panel kim loại (gradient trên → dưới) | `#3B3327` → `#231E17` → `#17130F`, viền `#8C6A2E`, sáng mép trên `#D9B25A` 33% |
| Ô lõm (inset) | nền `#0D0B08`, viền `#5C4620` |
| Vàng (tiêu đề, giá) | `#F2D27A`, nhấn `#FFD66B` |
| Chữ | `#E8E0CC`, chữ phụ `#C8BFA8` |
| Nút chính | gradient `#F2D27A` → `#B8852A`, viền `#FFF1C4`, chữ `#2A1A08` |
| Thành công / máu | `#3EDC4E` |
| Nguy hiểm | `#C8401E`, chữ `#FFB08A` |
| Nước | `#5AB4D6`, nhạt `#9EDDF2` |
| Độ hiếm | Thường `#8A8478` · Hiếm `#4FA3D9` · Sử thi `#A86CE0` · Huyền thoại `#F0A030` |
| Hệ tướng | Sức mạnh `#E25A3A` · Nhanh nhẹn `#7FC24A` · Trí tuệ `#A88CE8` |

### Font (Google Fonts, có tiếng Việt)
- Tiêu đề, tên: **Alegreya SC** 700–800
- Nội dung: **Alegreya Sans** 400–800
- Cỡ chữ nhỏ nhất 11px, nội dung 12–14px, tiêu đề màn 22px.

### Thành phần
- Thanh tiêu đề màn: cao 48px, panel kim loại, viền dưới vàng 2px.
- Nút bấm: cao tối thiểu 40–44px (vùng chạm ngón tay).
- Ô đồ / ô kỹ năng: 44px, viền 2px theo độ hiếm; số cường hóa `+1…+5` góc dưới phải; ổ khóa góc trên phải.
- Icon kỹ năng: Q khung vàng · W/E khung tối viền trong (nội tại) · R khung vàng đôi phát sáng.
- Đồng xu: hình tròn vàng có lỗ vuông (tiền đồng cổ).

---

## 4. Asset cần làm cho game thật

| Nhóm | Số lượng | Ghi chú |
|---|---|---|
| Tướng | 16 (6 cơ bản + 10 huyền thoại) | Mỗi tướng: thân chia khớp (đầu, thân, 2 tay, vũ khí, phần sau lưng: áo choàng / cánh / đuôi / mai) để làm Spine; + chân dung |
| Ngoại hình theo đồ | 3 ô trang phục × 4 độ hiếm + Bộ Lạc Long (cánh rồng) | Vũ khí, mũ, giáp thay được trên khung xương. Bảng chất liệu / màu theo độ hiếm ở GAMEPLAY.md mục 5 |
| Hiệu ứng tiến triển | Lên cấp, tiến hoá ★/★★/★★★, mặc đồ, thăng phẩm, Bộ Lạc Long | Xem GAMEPLAY.md mục 4 và 13 |
| Quái | 6 + biến thể tinh anh | Tôm Binh, Cá Sấu, Rùa Giáp, Phù Thủy Nước, Chim Bão (bay), Ếch Mẹ + Nòng Nọc |
| Boss | 3 | Thuồng Luồng, Hà Bá (2 giai đoạn), Thủy Tinh (+ Giao Long Con) |
| Icon kỹ năng | 64 | Đã có bản vector trong `KyNang`, `KyNangHT1`, `KyNangHT2` |
| Icon đồ | khoảng 20 món + 3 sính lễ | Bản vector trong `TuiDo`, `CuaHang`, `LoDucDong` |
| Bản đồ | 8 ải | Sông, bờ đất, ô đặt tướng 3 bậc độ cao (Thấp / Giữa / Cao), thành Phong Châu, núi Tản Viên |
| Hiệu ứng hạt | Lửa, băng/sương, nước, sét, lá, hoa, lông vũ, đá, lúa, nốt nhạc, vàng | Xem `den-anh-hung.html` |

---

## 5. Animation

### Mỗi tướng cần
| Trạng thái | Mô tả (theo bản mẫu) | Thời lượng gợi ý |
|---|---|---|
| Đứng yên | Thở (thân lên xuống 3px), đầu lắc ±3°, phần sau lưng lắc ±4°, cánh vỗ | Lặp 1,1 giây mỗi chiều |
| Đánh / chiêu vung | Vung tay sau 80° rồi chém xuống, thân lao tới 16px | 0,3 giây + hồi 0,4 giây |
| Chiêu bắn | Giật lùi 9px | 0,2 + 0,3 giây |
| Chiêu phép | Hai tay giơ cao, thân nhấc 6px, hạt sáng | 0,25 + giữ 0,3 + hạ 0,45 giây |
| Chiêu tối thượng R | Phóng to 1,14 lần, rung màn hình, chớp sáng, tên chiêu hiện to giữa màn | khoảng 1,9 giây |
| Xuất hiện | Rơi xuống, bụi, vòng vàng | 0,4 giây |
| Bị đánh | Chớp đỏ, lùi | 0,2 giây |
| Sa lầy | Nước dâng quanh chân, lún xuống, chậm lại | Kéo dài suốt lúc ô ngập |
| Gục | Ngã, mờ dần; hồi sinh có cột sáng vàng | 0,6 giây + hồi sinh |

### Quái và boss cần
Đi / bay, bị đánh (lùi + chớp), bị choáng, bị làm chậm (ám màu xanh băng), chết. Boss thêm: tung chiêu, hóa điên (Thuồng Luồng), lặn xuống rồi trồi lên (Hà Bá), gọi mưa và làm ngập ô (Thủy Tinh).

### Công nghệ đề xuất
- **Phaser 3** (HTML5) + **Capacitor** để đóng gói Android / iOS.
- **Spine** hoặc **DragonBones** cho hoạt ảnh xương tướng, quái, boss.
- Hệ hạt của Phaser cho hiệu ứng; rung camera và chớp màn hình cho chiêu R.
- Không dùng Bootstrap (chỉ dành cho giao diện web).

---

## 6. Điểm còn để ngỏ

- **Số liệu cần chơi thử để cân bằng:** giá nâng cấp tướng, mở kỹ năng, tiến hoá, cường hóa, thăng phẩm, đổi vàng, triệu hồi tướng huyền thoại (đều ghi "đề xuất" trong GAMEPLAY.md).
- **Chưa có số liệu:** hiệu ứng của 3 sính lễ (`[hiệu ứng bảo vật]`), chỉ số từng món đồ, phần thưởng thắng trận (`[phần thưởng]`).
- **Tên 8 ải** dọc sông Đà là đề xuất.
- **Chưa thiết kế:** màn Cài đặt; tab Huyền thoại mở ra trong bảng triệu hồi (hiện chỉ có nút); thông báo / hướng dẫn chơi lần đầu.
