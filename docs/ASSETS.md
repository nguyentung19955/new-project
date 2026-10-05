# Ảnh vẽ tay (AI) cho Núi Cao Nước Dâng

## Cách mới (bản giao v15): 37 bảng asset + script cắt ảnh

1. Tạo ảnh bằng `docs/PROMPT-TAO-ANH.txt` (Gemini vẽ lần lượt 37 bảng S01–S37 và 10 ảnh đơn F01–F10). Lưu mỗi ảnh theo **mã bảng**: `S01.png`, `S02.png`, …, `F01.png`.
2. Gửi các ảnh bảng cho Claude, hoặc tự cắt:
   ```
   pip install pillow numpy scipy
   python3 tools/cat-anh.py <thư mục ảnh bảng> assets
   ```
   Script đọc `tools/asset-manifest.json`, tìm ô nền xám trong từng bảng, xoá nền và lưu từng PNG nền trong suốt thẳng vào `assets/` với tên như `lac-tuong_hiem.png`, `quai_ca-sau.png`, `do-ghep_trong-dong.png`.
3. Tải lại game (tăng số `?v=` trong `index.html` nếu điện thoại còn giữ bản cũ).

Game dùng các tên file này như sau (ảnh nào chưa có thì vẫn dùng hình vector):

| Ảnh | Dùng ở |
|---|---|
| `<tướng>_thuong / _hiem / _su-thi / _huyen-thoai.png` (S01–S08) | Tướng trên bản đồ. Game chọn theo **bậc trang phục** = độ hiếm trung bình của vũ khí, mũ, giáp (ô trống tính là Thường). Hào quang tiến hoá, sao, cánh và hiệu ứng bộ đồ vẫn vẽ chồng lên. |
| `chan-dung_<tướng>.png` (S09–S10) | Chân dung ở thẻ tướng, nút triệu hồi, hộp thoại |
| `quai_*.png`, `boss_*.png` (S11–S12) | Quái và boss; có bản riêng cho Cá Sấu / Thuồng Luồng hóa điên, Rùa Giáp khổng lồ, Hà Bá hóa Kim |
| `giao-long_<hành>.png`, `sinh-le_*.png` (S13) | Giao Long Con theo hành, 3 sính lễ |
| `do_<riu/no/gay/mu/giap>_<độ hiếm>.png` (S14–S16) | Icon đồ trang phục |
| `bo-<bộ>_<riu/no/gay/mu/giap>.png` (S17–S21) | Icon đồ bộ |
| `phu-kien_*.png`, `do-ghep_*.png` (S22–S25) | Icon phụ kiện và đồ ghép |
| `hanh_<kim/moc/thuy/hoa/tho>.png` (S26) | Biểu tượng Ngũ hành |
| `ui_hu-bau.png` (S27), `ban-do_nui-1…5.png` (S29) | Hũ báu, 5 giai đoạn Núi Tản Viên |
| `ky-nang_<tướng>_<q/w/e/r>.png` (S30–S37) | Icon kỹ năng |
| `nen_menu.png`, `truyen_1…3.png` (F05–F08) | Nền menu, 3 khung truyện |

Tên `<tướng>` là tên tướng bỏ dấu, nối bằng gạch ngang (`lac-tuong`, `than-suong-nui`, `lac-long-quan`…), đúng như trong `tools/asset-manifest.json`.

Chưa dùng: `nen_ai-1…4` (bản đồ ải: ảnh AI không giữ đúng đường sông mà quái đi theo, nên game vẫn vẽ bản đồ bằng code), các ô `ban-do_o-*`, icon `ui_*` còn lại, ảnh sinh vật triệu hồi, `bo-*_sau-lung` và `bo-*_huy-hieu` (hiệu ứng sau lưng đang vẽ bằng code).

---

## Cách cũ (vẫn dùng được làm dự phòng)

Game tự nạp ảnh PNG trong thư mục `assets/` nếu **đúng tên file** dưới đây. Ảnh nào chưa có thì game dùng hình vector hiện tại (`js/art.js`), nên có thể bổ sung dần từng ảnh. Sau khi thêm ảnh, tải lại trang (trên điện thoại có thể cần tăng số `?v=` trong `index.html` để trình duyệt bỏ bản cũ).

Tên file và mã (H01–H16, E01–E08, B01–B03) theo tài liệu prompt. Mọi ảnh là **PNG, nền trong suốt** (trừ bản đồ, cảnh nền, ô đặt tướng và icon có nền tối).

## Quy ước chung

- **Sprite trong trận** (tướng, quái, boss): nhân vật **quay mặt sang phải**, **chân ở giữa cạnh dưới ảnh**, không có bóng dưới đất (game tự vẽ bóng), nên vuông hoặc dọc, khoảng 512 px. Game tự lật ảnh khi quái đi sang trái và tự làm chuyển động thở / nhún / lao tới.
- **Ảnh phẳng không đổi được từng món đồ:** khi tướng dùng ảnh vẽ tay, đồ mặc hiện qua hào quang, cánh rồng (Bộ Lạc Long) và sao tiến hoá. Muốn giữ đúng tính năng "mặc đồ đổi hình dạng" bằng ảnh vẽ tay thì cần vẽ tướng chia khớp (đầu, thân, tay, vũ khí riêng) như tài liệu bàn giao đề xuất (Spine / DragonBones).
- **Bản đồ** phải giữ **đúng đường dòng sông** của bản thiết kế, vì quái đi và ô đặt tướng tính theo đường này: đường cong `M -20 210 C 100 210 150 120 280 128 S 450 240 580 214 S 740 140 880 160` trong khung 932×430 (ảnh 1864×860 thì nhân đôi tọa độ). Thành Phong Châu ở góc phải (x 846–932, y 80–210), núi Tản Viên phía trên bên phải. Phần dưới y > 280 bị bảng điều khiển che.
- **Hiệu ứng (VFX)**: một dải khung hình **nằm ngang**, mỗi khung **vuông** (ví dụ 8 khung 256×256 → ảnh 2048×256), nền trong suốt. Game chia số khung theo tỉ lệ rộng / cao.

## 1. Key art & cảnh

| File | Kích thước | Dùng ở |
|---|---|---|
| `assets/key-art-menu.png` | 1920×1080 | Nền menu chính (chừa trống phía trên giữa cho tên game) |
| `assets/scenes/story-1.png`, `story-2.png`, `story-3.png` | ~1120×760 | 3 khung truyện Vua Hùng kén rể |
| `assets/scenes/victory-bg.png`, `defeat-bg.png` | ~650×720 (dọc) | Tranh bên trái màn thắng / thua |
| `assets/scenes/mountain-1.png` … `mountain-5.png` | ~640×400 | 5 giai đoạn Núi Tản Viên |

## 2. Tướng (H01–H16)

Mỗi tướng 4 ảnh. Theo quy tắc trong tài liệu: tạo A trước, dùng A làm ảnh tham chiếu để tạo B, C, D.

| Hậu tố | Nội dung | Dùng ở |
|---|---|---|
| `_A` | Splash art 1920×1080 (STYLE) | Màn Anh Hùng (16) |
| `_B` | Chân dung vuông nửa người, nền tối (STYLE) | Ô chân dung ở bảng điều khiển, nút triệu hồi, hộp thoại |
| `_C` | Sprite chibi đứng yên (SPRITE STYLE) | Trên bản đồ, tab Huyền thoại |
| `_D` | Sprite chibi lúc vung đòn / tung chiêu (SPRITE STYLE) | Trên bản đồ khi đánh hoặc dùng kỹ năng |

| Mã | Tướng | Tên file |
|---|---|---|
| H01 | Lạc Tướng | `assets/heroes/hero_h01_A.png` … `_B`, `_C`, `_D` |
| H02 | Lực Sĩ Núi | `assets/heroes/hero_h02_A.png` … `_B`, `_C`, `_D` |
| H03 | Xạ Thủ Văn Lang | `assets/heroes/hero_h03_A.png` … `_B`, `_C`, `_D` |
| H04 | Thợ Săn Rừng | `assets/heroes/hero_h04_A.png` … `_B`, `_C`, `_D` |
| H05 | Thầy Mo Lửa | `assets/heroes/hero_h05_A.png` … `_B`, `_C`, `_D` |
| H06 | Thần Sương Núi | `assets/heroes/hero_h06_A.png` … `_B`, `_C`, `_D` |
| H07 | Thánh Gióng | `assets/heroes/hero_h07_A.png` … `_B`, `_C`, `_D` |
| H08 | Lạc Long Quân | `assets/heroes/hero_h08_A.png` … `_B`, `_C`, `_D` |
| H09 | Thần Kim Quy | `assets/heroes/hero_h09_A.png` … `_B`, `_C`, `_D` |
| H10 | Thạch Sanh | `assets/heroes/hero_h10_A.png` … `_B`, `_C`, `_D` |
| H11 | Âu Cơ | `assets/heroes/hero_h11_A.png` … `_B`, `_C`, `_D` |
| H12 | Cao Lỗ | `assets/heroes/hero_h12_A.png` … `_B`, `_C`, `_D` |
| H13 | Mai An Tiêm | `assets/heroes/hero_h13_A.png` … `_B`, `_C`, `_D` |
| H14 | Chử Đồng Tử | `assets/heroes/hero_h14_A.png` … `_B`, `_C`, `_D` |
| H15 | Tiên Dung | `assets/heroes/hero_h15_A.png` … `_B`, `_C`, `_D` |
| H16 | Lang Liêu | `assets/heroes/hero_h16_A.png` … `_B`, `_C`, `_D` |

## 3. Quái & boss

Thường: `assets/enemies/E0x.png`; tinh anh: `assets/enemies/E0x_elite_B.png` (dùng cho quái tinh anh và Rùa khổng lồ). Boss: `assets/bosses/B0x.png` (có thể thêm `B0x_elite_B.png`).

| Mã | Quái | | Mã | Boss |
|---|---|---|---|---|
| E01 | Tôm Binh | | B01 | Thuồng Luồng (đợt 10) |
| E02 | Cá Sấu | | B02 | Hà Bá (đợt 20) |
| E03 | Rùa Giáp | | B03 | Thủy Tinh (đợt 30) |
| E04 | Phù Thủy Nước | | | |
| E05 | Chim Bão (bay: tâm thân ở giữa ảnh) | | | |
| E06 | Ếch Mẹ | | | |
| E07 | Nòng Nọc | | | |
| E08 | Giao Long Con | | | |

## 4. Bản đồ, ô đặt tướng, thành

| File | Kích thước | Ghi chú |
|---|---|---|
| `assets/maps/map-01.png` … `map-08.png` | 1864×860 | Mỗi ải một bản đồ (Bến Sông Đà, Thác Bờ, Rừng Lim, Bãi Phù Sa, Chân Núi Tản, Đầm Lầy, Cửa Sông Hồng, Thành Phong Châu). Giữ đúng đường sông ở trên. |
| `assets/tiles/tile-low.png`, `tile-mid.png`, `tile-high.png`, `tile-flooded.png` | 256×256 | Ô đặt tướng nhìn từ trên xuống (game vẽ dẹt theo phối cảnh). Ô đã Mọc Núi dùng `tile-high`. |
| `assets/tiles/castle-phong-chau.png` | 1024×1024 | Chỉ dùng khi ải đó chưa có ảnh bản đồ riêng |

## 5. Đồ (icon 512×512, ICON STYLE)

`assets/items/<tên>.png`. Tên theo tài liệu prompt ở cột đầu; các món khác dùng mã đồ đổi `_` thành `-`.

| Tên file | Món |
|---|---|
| `riu-dong.png` | Rìu Đồng |
| `riu-chien.png` | Rìu Chiến |
| `riu-lua.png` | Rìu Lửa |
| `long-riu.png` | Long Rìu |
| `no.png` | Nỏ Tre |
| `no-lim.png` | Nỏ Gỗ Lim |
| `no-bao.png` | Nỏ Bão |
| `long-no.png` | Long Nỏ |
| `gay-thay-mo.png` | Gậy Thầy Mo |
| `gay-ngoc.png` | Gậy Ngọc |
| `truong-hu-khong.png` | Trượng Hư Không |
| `long-truong.png` | Long Trượng |
| `mulong-chim.png` | Mũ Lông Chim |
| `mu-dong.png` | Mũ Đồng |
| `mu-sung.png` | Mũ Sừng |
| `non-mo.png` | Nón Thầy Mo |
| `mu-lac-long.png` | Mũ Lạc Long |
| `ao-vai.png` | Áo Vải |
| `giap-dong.png` | Giáp Đồng |
| `ao-choang-mo.png` | Áo Choàng Mo |
| `giap-vua.png` | Giáp Vua |
| `giap-vay-rong.png` | Giáp Vảy Rồng |
| `vuot-ho.png` | Vuốt Hổ |
| `gang-da.png` | Găng Da |
| `dai.png` | Đai |
| `dep-co.png` | Dép Cỏ |
| `khan.png` | Khăn |
| `khan-hien-gia.png` | Khăn Hiền Giả |
| `mat-ngoc.png` | Mắt Ngọc |
| `ngoc-sinh-luc.png` | Ngọc Sinh Lực |
| `mat-trong.png` | Mặt Trống |
| `dui-trong.png` | Dùi Trống |
| `trong-dong.png` | Trống Đồng |
| `song-riu-cuong-no.png` | Song Rìu Cuồng Nộ |
| `gay-tam-gioi.png` | Gậy Tam Giới |
| `gay-thoi-khong.png` | Gậy Thời Không |
| `giap-bat-diet.png` | Giáp Đồng Bất Diệt |
| `luoi-hai.png` | Lưỡi Hái Chí Tử |
| `voi-chin-nga.png` | Voi Chín Ngà |
| `ga-chin-cua.png` | Gà Chín Cựa |
| `ngua-chin-hong-mao.png` | Ngựa Chín Hồng Mao |
| `ngoc-hoi-sinh.png` | Ngọc Hồi Sinh |
| `hu-bau.png` | Hũ báu (minh họa ở Lò đúc và sính lễ) |

## 6. Kỹ năng (64 icon 512×512, ICON STYLE)

`assets/skills/h<mã>_<Q|W|E|R>.png`, ví dụ `assets/skills/h05_Q.png` = Cột Lửa của Thầy Mo Lửa, `assets/skills/h07_R.png` = Bay Về Trời của Thánh Gióng. Không vẽ khung và chữ Q/W/E/R; game tự thêm.

## 7. Hiệu ứng (VFX)

`assets/vfx/<tên>.png` (dải khung hình ngang).

| File | Thay cho hiệu ứng trong game |
|---|---|
| `fire-pillar.png` | Cột Lửa |
| `fire-burst.png` | Hỏa Sơn (nổ lửa) |
| `ice-ring.png` | Vòng Sương |
| `freeze.png` | Mù Sương Tản Viên (đóng băng) |
| `water-wave.png` | Gầm Biển, Sóng Sông Hồng, quẫy đuôi Thuồng Luồng |
| `lightning.png` | Sấm Tản Viên |
| `slash-gold.png` | Vệt chém, chém chữ X, Vuốt Rồng |
| `heal.png` | Hồi máu |
| `shield-gold.png` | Mai Vàng, Bánh Chưng |
| `rocks.png` | Vùi Đá, Địa Chấn |
| `coins.png` | Rơi đồ |
| `music-notes.png` | Đàn Thần |
| `dust.png` | Quái bị hạ |
| `spawn-ring.png` | Triệu hồi tướng |
| `hit-spark.png` | Khiên Đồng, Rìu Đốn Củi |
| `mountain-rise.png` | Mọc Núi |
| `stun-stars.png`, `flood-rise.png` | Chưa dùng (sao choáng và nước dâng đang vẽ bằng code) |
