# 001 – Nút "Sign in with Google" + "Sign out" (tấm đồng/gỗ, co giãn 9 mảnh)
- **Trạng thái:** CHỜ
- **Dùng vào:** game/dang-nhap.js – ô tài khoản ở trang chọn (game/index.html), menu Vùng 1, màn chờ Làng Chuông. Chưa có ảnh → game tạm dùng khung_bang.png (art/giao-dien/khung) co giãn + chữ thường. Có ảnh là game tự dùng, không cần sửa mã (chỉ chỉnh lề cắt `ANH.CAT` trong game/dang-nhap.js nếu khác 20/24 px).
- **Mô tả:** 2 tấm nút nằm ngang, hợp phong cách khung_bang.png (gỗ vỏ cây tối + viền đồng cổ, góc có rễ nhỏ/chuông nhỏ):
  1. **nut_dang_nhap.png** – nút chính (đăng nhập): mặt gỗ tối hơi ấm, viền đồng sáng hơn một chút, điểm vàng đồng #E1B85A nhẹ ở 4 góc.
  2. **nut_dang_xuat.png** – nút phụ (đăng xuất): cùng kiểu nhưng trầm hơn (đồng xỉn, ít ánh vàng).
  Mỗi nút kèm bản **nhấn** (lún, tối hơn 15%): nut_dang_nhap_an.png, nut_dang_xuat_an.png.
- **KHÔNG** vẽ chữ, **KHÔNG** vẽ lại logo Google hay chữ "G" (chữ do game tự viết). Lòng nút trống, phẳng.
- **Cỡ:** mỗi tấm 240×60 px (sau khi thu nhỏ theo điểm ảnh thật). Lề góc trang trí ≤ 20 px trên/dưới, ≤ 24 px trái/phải; **giữa mỗi cạnh là đường thẳng trơn** để co giãn 9 mảnh (rộng 120–260 px, cao 44–52 px trên iPhone ngang 844×390).
- **Trang trí** chỉ ở góc, nằm NGOÀI/sát mép, không che lòng nút.
- **Lưu:** art/giao-dien/dang-nhap/nut_dang_nhap.png, nut_dang_nhap_an.png, nut_dang_xuat.png, nut_dang_xuat_an.png + ảnh gốc `…-nguon-chatgpt.png` cùng thư mục.
- **Phong cách chung:** pixel art u tối, đồng cổ + gỗ vỏ cây tối, hợp art/giao-dien/khung/khung_bang.png và art/giao-dien/hud/khung_hud.png (gửi kèm 2 ảnh này làm tham chiếu). Nền #FF00FF đặc, các món cách xa nhau, sắc nét, không nhoè.
- **Prompt mở đầu:** "Draw ONE image: two horizontal dark-fantasy pixel art UI button plates (plus a pressed version of each, 4 plates total) matching the attached frame: dark bark wood face, aged bronze rim, tiny roots/bells only at the corners. Straight plain edges in the middle of each side so they can be 9-slice stretched. EMPTY interior, no text, no logos, no letters. Solid flat #FF00FF background, wide gaps between plates, nothing touching the edges, crisp pixel art, no blur, no shadow on the magenta."
