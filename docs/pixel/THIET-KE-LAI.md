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
