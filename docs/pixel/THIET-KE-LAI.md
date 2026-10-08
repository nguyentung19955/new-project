# THIẾT KẾ LẠI — các hình pixel "chuyển ảnh" / phác thảo thô (claude/ve-lai-pixel)

Người dùng: *"Những hình trước đó chuyển sang pixel XẤU QUÁ. Bạn tự đưa ra thiết kế và làm lại các item đó."*
→ Bỏ hẳn chế độ chuyển ảnh tự động (`anh` trong spec) cho các mã dưới đây; mỗi hình **vẽ tay bằng khối hình có chủ đích**
(chữ nhật, đa giác, elip, lưới vẽ tay từng điểm) trong `tools/pixel/ve-lai/<nhóm>.js` → sinh nguồn `tools/pixel/src/<nhóm>/<mã>.txt`
→ `node tools/build-pixel.js --strict`. Mã đã vẽ lại được gỡ khỏi `tools/pixel/spec/*.json` (danh sách `tools/pixel/ve-lai/DA-VE-LAI.json`,
lệnh `node tools/pixel/ve-lai/bo-spec.js`) để `ve-pixel.js --nap --ghi-de` không ghi đè.

**Quy tắc chung (mọi nhóm)**
- Bảng màu chung `tools/pixel/palette.txt` (khớp hướng A3 của designer: đồng hun `dong*`, son `son*`, chàm `cham*`, rêu `reu*`,
  gỗ tối `toi`/`dat-toi`, vàng nghệ `vang-nghe` cho điểm nhấn). Mỗi hình ≤ ~16–22 màu, thường 6–15.
- Nguồn sáng **trên-trái**: mép trên/trái sáng, mép dưới/phải tối (hàm `shade`), 3 tông mỗi mảng. Không nhiễu lấm tấm, không dithering.
- **Viền tối 1px** (`vien`) quanh khối chính (vật trong suốt); cảnh kín khung thì viền tối quanh khối tiền cảnh.
- Bóng đổ **cứng** (mảng tối lệch xuống-phải), không gradient.
- Hoạ tiết văn hoá: mặt trống đồng (sao nhiều tia + vành chấm), chim Lạc, mái đình cong đầu đao vểnh, nhà sàn mái thuyền Đông Sơn,
  cổng làng trụ biểu, rào cọc tre, nỏ thần, núi Tản Viên ba đỉnh.
- So trước/sau: `python3 tools/pixel/ve-lai/truoc-sau.py tools/pixel/mau/ve-lai/<nhóm>-truoc-sau.png <tỉ lệ> <nhóm/mã>…`
  (trước = bản trên nhánh chính).

---

## 1. Cổng thành (nen/cong-*, 48 → **64×64**) — `tools/pixel/ve-lai/cong.js`

Hiển thị: ảnh vuông 124×124 (toạ độ thiết kế) ở cuối đường — ≈ 250 px trên 1920, ≈ 110 px trên 844. Cửa đặt giữa-dưới (đáy cửa ≈ dòng 58)
để đường quái "đi vào" cửa. Mỗi kiểu một **khối hình đọc được ngay**: mái / vòm / khối đá, cửa tối ở giữa.

| mã | chủ đề | bố cục | màu chính |
|---|---|---|---|
| `cong-lang-tre` | làng (Thánh Gióng) | cổng làng: 2 trụ biểu búp sen đồng, vòm cuốn tối, biển chữ son 3 chữ vàng, **mái ngói 2 tầng đầu đao vểnh**, tường cánh thấp có con tiện, khóm tre 2 bên | vôi `trang`, ngói `son`, đồng `dong` |
| `cong-phong-chau` | thành Văn Lang (Sơn Tinh) | nhà cổng gỗ **mái thuyền Đông Sơn** (nóc võng, 2 đầu vểnh mũi thuyền, chim Lạc trên nóc), **mặt trống đồng** trên cửa son đinh đồng, cột son, tường đất nện + rào cọc, 2 cờ son | rơm `cat`, gỗ `dat`, son, đồng |
| `cong-hang` | hang | khối đá **mảng phẳng** (sáng trên-trái, tối phải), rêu phủ đỉnh, miệng hang đen, **nhũ đá răng nanh**, 2 đuốc lửa | sắt `sat*`, rêu, lửa |
| `cong-ban-rung` | rừng (Thạch Sanh) | cổng gỗ 2 cột, mái lá, **sọ trâu sừng cong** treo xà, chấn song tre, rào cọc nhọn, 2 cây đa tán tròn | gỗ `dat*`, lá `la*`, xương `trang` |
| `cong-co-loa` | Cổ Loa | **3 vòng thành đất (thành ốc)** cỏ phủ mép, vọng lâu gỗ mái ngói cong, cửa vòm son, **nỏ thần** khắc trên cổng, cờ son | đất `dat-sang`/`cat`, rêu, son |

Trước: ảnh gen thu nhỏ → nhiễu, Cổ Loa thành lâu đài châu Âu, cổng làng thành cổng tam quan Trung Hoa.

## 2. Bệ đặt tướng (nen/de-tuong-*, 32×32) — `tools/pixel/ve-lai/de.js`

Hiển thị ≈ 44×44 (thiết kế) quanh ô — trong chế độ pixel chỉ hiện ở trạng thái đặc biệt (chọn / sẵn sàng / ngập / núi); ô thường đã có bệ trong nền bản đồ.
Một **bệ trụ đá tròn nhìn 3/4**: mặt trên elip (13×7,5) sáng trên-trái, thành bệ cao 5 có mạch đá, **vành khắc trống đồng** (vòng + 12 chấm + tâm).

| mã | khác biệt |
|---|---|
| `de-tuong-thuong` | đá xám, vành đồng |
| `de-tuong-chon` | vành + chấm vàng nghệ sáng, **4 góc ngắm** vàng (ô đích) |
| `de-tuong-san-sang` | vành ngọc sáng (đặt được) |
| `de-tuong-ngap` | bệ thấp chìm trong vũng nước `nuoc`, gợn sóng sáng hai bên, vành nước |
| `de-tuong-nui` | bệ cao 9 (Sơn Tinh nâng), mặt rêu, thành đất |
| `de-tuong-co · dat · cat · da · gach` | đổi màu mặt / thành theo chủ đề (dùng khi tắt pixel nền) |

Trước: elip phẳng xám một vòng màu, không khối, không hoạ tiết.

## 3. Tranh nhỏ Sính lễ / Hũ báu / Kho lúa (giao-dien/tranh-*, 96×96) — `tools/pixel/ve-lai/tranh.js`

Hiển thị trong "giếng" bảng Vua Hùng ban thưởng ≈ 70–100 px (844) · 180–300 px (1920). Vật đứng giữa, nền trong suốt, viền 1px, bóng đất `toi`.
**Thú vẽ ở 48×48 rồi phóng ×2** (khối gọn, cỡ điểm ngang sprite tướng phóng); vật tĩnh vẽ thẳng 96×96.

| mã | thiết kế | màu |
|---|---|---|
| `tranh-qua-voi` | voi trắng nhìn ngang quay phải, tai lớn lót hồng, vòi cuộn, **3 ngà vểnh xếp lớp** (chín ngà), yên vải son viền vàng hoa văn, mũ trán đồng | trắng ngà 3 tông, son, vàng nghệ |
| `tranh-qua-ga` | gà trống đứng ngực ưỡn, thân son, bờm cổ vàng cam, mào răng cưa, đuôi cong xanh đen ánh ngọc, chân vàng **9 cựa trắng (5 + 4)** | son, lửa, chàm/lá tối, ngọc |
| `tranh-qua-ngua` | ngựa lông vàng cát, chân trước giơ gập, **9 lọn bờm đỏ như lưỡi lửa** vuốt ngược gió + đuôi đỏ, cương son chuông đồng | cát, son, lửa |
| `tranh-hu-bau` (cả Hũ vua Hùng) | hũ đồng bụng tròn khắc răng cưa + vòng chấm, nắp mở lệch, **hào quang 12 tia hình nêm**, đồng vàng rơi quanh chân | đồng, vàng nghệ, lửa sáng |
| `tranh-kho-lua` | **kho sàn mái thuyền Đông Sơn** (chim Lạc trên nóc), vách nan tre, cột sàn, thúng thóc vàng, 2 bó lúa | rơm `cat`, gỗ `dat`, vàng |
| `tranh-trong-dong` | mặt trống đồng nhìn thẳng: sao 12 cánh, vòng tròn tiếp tuyến có chấm, **6 chim Lạc** bay, răng cưa, vành chấm; vầng sáng trên-trái | đồng 3 tông + vàng |
| `tranh-xoay` | điện thoại nằm ngang (màn cảnh sông núi) giữa 2 mũi tên cung tròn vàng đồng | sắt tối, đồng, cảnh |

Trước: thú kiểu chibi má hồng (QUY-CHUAN mục 0 cấm "trẻ con"), hũ / kho bị nhiễu và kho lúa là tường thành châu Âu.

## 4. Núi Tản Viên 5 giai đoạn (giao-dien/nui-tan-vien-1..5, 48×48) — `tools/pixel/ve-lai/nui.js`

Bảng "Núi Tản Viên": ô cao 100 px, ảnh vuông. Mỗi giai đoạn **một khung cảnh vuông đủ trời–núi–đất**, viền khung đồng 2px;
núi lớn dần, sườn trái sáng / phải tối, dãy núi xa chàm nhạt phía sau, bãi cỏ phía trước:
Gò Đất (gò nâu nhú cỏ) → Đồi Nhỏ (đồi xanh + một cây) → Núi Non (2 đỉnh, đỉnh đá) → Núi Cao (rêu, đỉnh đá, thác, mây lưng chừng)
→ Núi Thần (**Tản Viên ba đỉnh** hình tán ô trên biển mây, trời chiều vàng, mặt trời tia sáng, **mái đền son** trên đỉnh).
Trước: huy hiệu tròn nhìn từ trên, nhiễu, 5 ảnh gần như giống nhau (2 = 1, 5 = 4).

## 5. Bản đồ chương (canh/chuong-*, 320×180) — `tools/pixel/ve-lai/canh.js`

Màn chọn ải: ảnh phủ kín khung (cover, cắt hai bên ở 1920), game vẽ đè đường nét đứt vàng + nút ải ở dải giữa
→ **bản đồ cổ nhìn từ trên**, núi vẽ 3/4 như tranh bản đồ, vật trang trí dồn ra mép, dải giữa (x 40–280, y 58–140) thoáng.
Nền cỏ: màu gốc + vệt cỏ tối dẹt + khóm cỏ 3 điểm (không nhiễu từng điểm); cây / nhà / lều / thuyền là lưới vẽ tay đóng dấu.

| mã | địa danh / dấu hiệu |
|---|---|
| `chuong-thachsanh` | rừng sâu tán tối, **cây đa cổ thụ + miếu son**, **hang Chằn Tinh** trong núi đá (răng nhũ), đại bàng bay, suối |
| `chuong-giong` | **làng Phù Đổng trong lũy tre** (nhà rơm, đình son), ruộng lúa ô bờ xanh / vàng, **núi Sóc + vệt lửa ngựa sắt bay**, trại giặc Ân lều đen cờ tím |
| `chuong-llq` | bờ biển cát + làng chài, biển chàm sóng, đảo hang Ngư tinh, **rồng ngọc uốn trên sóng**, thuyền |
| `chuong-adv` | **thành Cổ Loa 3 vòng đất xoáy ốc** + điện son + nỏ thần + cờ vàng, sông uốn, ruộng, trại Triệu Đà lều tím |

`chuong-sontinh` (bản đồ chuyển ảnh đã chi tiết) giữ nguyên. Trước: 4 bản kia chỉ là trời phẳng + 3 tam giác (designer N6).

## 6. Nền sân theo chủ đề (canh/ban-do-*, 320×180) — cùng file

Dùng làm nền **thẻ chế độ** (Vô Tận = biển, Cùng Giữ Thành = thành; phủ gradient tối bên trái) và nền trận dự phòng khi thiếu `ban-do/<mã>`.
Khoảng sân giữa hình hữu cơ (hợp nhiều elip), trang trí dồn ra mép:
song (sông uốn mép trên + phải, lau, cây) · dam (5 ao bờ cát + sen hồng, lau) · rung (vòng cây tán tối, sân đất) ·
hang (**sàn đá lát ô Voronoi**: đá xám ngoài, đất giữa, tinh thể tím/ngọc, măng đá, xương) · dong (ruộng ô bờ phủ kín, sân đất, trâu, nhà rơm) ·
bien (cát + dải cát ướt, biển chàm sóng, dừa, ốc, sao biển, thuyền) · thanh (sân đá lát, vòng trống đồng, lũy đất rào cọc + 3 vọng lâu mái son cờ vàng).
Trước: ảnh nền trận gen thu nhỏ — nhiễu lấm tấm, dải hoa văn cũ.

## 7. Phông truyện (canh/truyen-nen-*, 320×180) — `tools/pixel/ve-lai/tranh-ngang.js`

Tranh ngang, game vẽ tướng / quái đè lên (chân ở y ≈ 150 sau khi phủ 320×200). Lớp: **trời 3–4 dải màu phẳng** (không gradient) ·
mặt trời / trăng · **núi xa 2–3 lớp đỉnh gãy khúc**, sườn đi lên sáng · trung cảnh theo chủ đề · đất có khóm cỏ 3 điểm.
bien (đảo xa, sóng, bãi cát, dừa) · dam (mặt nước lá + hoa sen, lau tiền cảnh) · dem (trời chàm, trăng khuyết, nhà sàn đèn vàng, lũy tre đen) ·
dong (ruộng bậc xanh / vàng) · hang (nhũ đá rủ, cửa hang đá gãy khúc sáng xa, măng đá, tinh thể tím) · nui (3 lớp núi, mây) ·
rung (thân cây + tán dày) · thanh (trời chiều, 3 lớp lũy Cổ Loa rào cọc, vọng lâu cờ vàng).

## 8. Cảnh thắng / thua + tranh truyện Sơn Tinh (canh/thang-*, thua-*, nen-thang, nen-thua, truyen-sontinh-1..3) — cùng file

**Nhân vật = sprite pixel vẽ tay của game** (tướng 32×32 phóng ×3, boss 48/64 phóng ×2/×1) — cùng nét với trận, bỏ hẳn kiểu chibi má hồng.
Màn kết quả cắt hai bên ảnh (1920) → chủ thể ở **giữa**.
- **Thắng**: bình minh vàng, **mặt trống đồng làm mặt trời** + 14 tia, tướng chương đứng giữa (hào quang trống sau lưng):
  Sơn Tinh trên đỉnh Tản Viên nước rút · Gióng giữa đồng lúa lũy tre · Thạch Sanh khoảng rừng sáng · Lạc Long Quân trên đá giữa biển lặng · An Dương Vương trước 3 lớp lũy.
- **Thua** (màn hiện sau mỗi trận vô tận): đêm mây đen / trời đỏ lửa, **boss chương chiếm giữa**: thành Phong Châu chìm lũ + mưa + Thủy Tinh ·
  làng Phù Đổng cháy + Ân Vương · rừng đen sương + Chằn Tinh · biển bão sóng nhọn + thuyền vỡ + Ngư tinh · Cổ Loa cháy + Triệu Đà.
  `nen-thang` / `nen-thua` = cảnh Sơn Tinh.
- **Truyện Sơn Tinh**: (1) hai chàng cầu hôn trước cổng Phong Châu · (2) bình minh trống đồng, Sơn Tinh đem voi chín ngà / gà chín cựa / ngựa hồng mao
  (dùng chính tranh mục 3) · (3) giao chiến: Sơn Tinh trên núi rêu tung phép, Thủy Tinh cưỡi sóng, mưa, sét.

## 9. Nền màn phụ (canh/nen-man-phu, 320×180)

Theo designer N7: thay tranh sóng chuyển ảnh (rối sau bảng chuẩn bị / kết quả / ban thưởng) bằng **nền đen nâu `vien` + mặt trống đồng chìm**
(vòng `dong-toi`, sao, chấm, chim Lạc `khoi`); CSS còn phủ thêm lớp tối → chỉ thấy hoạ tiết rất nhẹ.

Giữ ảnh cũ: `canh/nen-menu` (menu cố ý giữ tranh gốc), `canh/chuong-sontinh` (bản đồ đã chi tiết).

## 10. Khung thanh máu + khung menu (giao-dien) — `tools/pixel/ve-lai/khung.js`

- `thanh-mau-tuong` 32×8 (đồng, đinh vàng 2 đầu, mấu giữa) · `thanh-mau-quai` 24×8 (sắt) · `thanh-mau-boss` 96×12 (sơn son đinh đồng, 2 đầu ốp đồng):
  game tô nền + máu rồi **vẽ khung đè kéo giãn** → lòng khung trong suốt đúng chỗ thanh (cột 2..w-3, hàng 2..5; boss cột 6..89, hàng 4..7),
  gờ kim loại 1px 3 tông + viền `vien`. Trước: viền ô cờ lấm tấm (dithering), lòng đen che mất một nửa thanh máu tướng.
- `khung-nguoi-choi` 192×66: huy chương trống đồng (vành chấm vàng, chim Lạc, lỗ ảnh đại diện đúng chỗ CSS `.av`) + bảng tối viền đồng răng cưa, mũi nhọn đầu phải.
- `khung-nut-chinh` 208×46: tấm vàng nghệ vát (sáng trên / đồng dưới), răng cưa đáy, 2 đầu ốp đồng khắc sao trống. Trước: ảnh chuyển nhoè, mặt nạ méo.

## 11. Đồ xấu / na ná (do/*, 24×24) — `tools/pixel/ve-lai/do.js`

Bộ sinh hình vật cũ cho ra hình thoi trơn (4 ngọc giống nhau khác màu), đĩa xám (vảy cá ×2), 2 cái sừng giống hệt, hộp (trống), cục nâu (mũ sừng).
Vẽ lại 16 món, **mỗi món một dáng riêng** đọc được ở 24 px, sáng trên-trái, viền `vien`:
ngọc Hồi Sinh = hồng ngọc mài giác trên đế đồng · Minh Châu = ngọc trai trong vỏ sò đồng · Sinh Lực = **ngọc bích hình đĩa có lỗ** + tua đỏ ·
Trấn Thủy = giọt nước xanh có sóng, chóp đồng · Mũi Sừng Phá Giáp = mũi giáo sừng chéo + khâu đồng · Sừng Tê = sừng to bè gốc sẫm ·
Áo Vảy Cá = dáng áo phủ vảy · Vảy Cá = 3 vảy hình khiên xoè · Giáp Vảy Rồng = giáp ngực ngọc lục vảy chữ U viền vàng ·
Lưỡi Hái = cán dài + lưỡi tím cong · Ngựa Hồng Mao = đầu ngựa bờm lửa · Voi Chín Ngà = đầu voi nhìn thẳng nhiều ngà ·
Mặt Trống = mặt da 3/4 tang son · Trống Đồng = trống nhìn ngang có cóc trên mặt · Dùi Trống = đôi dùi bắt chéo đầu vải son ·
Mũ Sừng = mũ đồng 2 sừng (game hiện mũ thường theo loại × độ hiếm `do_mu_*` nên icon này chỉ dùng khi đổi quy tắc).
Các bộ đồ theo loại × độ hiếm (`do_<loại>_<độ hiếm>`, bộ Chim Lạc / Trống / Ngựa sắt…) cố ý cùng dáng khác màu (nhận loại + độ hiếm) — giữ.
