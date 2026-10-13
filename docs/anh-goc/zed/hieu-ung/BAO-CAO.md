# Báo cáo: đưa ảnh hiệu ứng PHI TIÊU vào game (thay hiệu ứng cung)

Mã commit đưa vào game: **7dce4b9** (nhánh `khoi-tao-du-an`).
Không thử trên trình duyệt (theo yêu cầu): chỉ chạy script cắt ảnh, `node --check` mọi tệp JS và `python3 build.py`.
Ảnh xem trước mọi khung đã cắt (phóng 4 lần, nền tối, chấm đỏ = điểm neo): `xem-truoc.png` cùng thư mục.

## Cách cắt ảnh

Script `cat_phi_tieu.py` (cùng thư mục, chạy `python3 docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py` từ gốc repo):

- Xoá nền xanh lá, gỡ phần xanh trộn vào điểm mép, rồi khử viền xanh lần nữa sau khi thu nhỏ.
  Hiệu ứng trắng (A, B, C, E, phi tiêu thường) chuyển hẳn mọi điểm còn ám xanh sang xám.
  Tấm hệ Độc giữ màu xanh chanh thật, chỉ bỏ điểm xanh lá thuần ở mép.
- Cắt khung theo đường viền hình: tìm các dải cột trống dài nhất giữa các hình (không chia đều ô).
  Ở 4 tấm vệt ném (A, A1, A2, A3), khung 2 và khung 3 dính nhau. Script tự tách chỗ đó ở cột thưa điểm nhất.
- Thu về cỡ điểm ảnh game, `net` 2, đúng định dạng `linh-khi-sprite` như tệp cũ.

## Đã thay / thêm

| Ảnh gốc | Tệp trong game/art/custom | Cỡ khung (điểm ảnh game) | Dùng ở đâu |
|---|---|---|---|
| A-nem (4 khung) | hu-ban-cung | 32×13, neo mép trái | Vệt ném nhỏ mỗi lần ném phi tiêu thường (mới móc ở `fx_dan.js`) |
| A1 / A2 / A3 | hu-ban-cung-fire / -poison / -ice | 32×13–15 | Như trên, khi vũ khí có hệ |
| D1 / D2 / D3 (4 khung) | hu-dan-ten-fire / -poison / -ice | 20×14–15, neo tâm phi tiêu | Phi tiêu mang hệ đang bay (bọc lửa, nhớt độc, băng) |
| D3 bỏ phần băng (**tạm**) | hu-dan-ten | 19×14 | Phi tiêu thường đang bay, chỉ dùng khi không có ảnh vũ khí phi tiêu của Zed (ví dụ ảnh chưa tải xong) |
| B-trung (4 khung) | hu-trung-phi-tieu (mới) | 32×32, neo giữa | Phi tiêu của người chơi trúng quái (không chí mạng; chí mạng vẫn dùng hu-chi-mang) |
| C-mua (6 khung) | hu-mua-phi-tieu (mới) | 96×100, vòng rộng 80 = đúng vùng mưa | Chiêu Đặc biệt của phi tiêu (Mưa Phi Tiêu): vẽ cả trận mưa bằng ảnh, bỏ vòng nét đứt và mũi tên rơi |
| E-chum (5 khung) | hu-phi-tieu-chum (mới) | 40×40, mép trái ở tay | Đòn giữ rồi thả (ném chùm, `banManh`): đặt ở tay, xoay theo hướng ném |
| F-tui | tp-backs-ong_ten | 14×18 | Món trang phục "Ống tên" đổi thành **"Túi phi tiêu"** (`outfit.js`, `hero_tinhlinh.js`; tiếng Anh "Shuriken pouch") |

## Sửa mã (đều ít dòng)

- `js/fx.js`: thêm ảnh trúng phi tiêu và ảnh mưa phi tiêu.
- `js/fx_he.js`: đòn ném mạnh dùng ảnh ném chùm.
- `js/fx_dan.js`: thêm vệt ném khi ném thường.
- `js/zed_moi.js`, **chỉ 2 dòng**: phi tiêu mang hệ thì vẽ ảnh D1–D3 (có lửa, độc, băng bọc quanh) thay cho ảnh vũ khí trơn. Phi tiêu không hệ vẫn vẽ ảnh vũ khí phi tiêu theo cấp như trước.
- Không sửa `combat.js` và `sprite_custom.js`.
- Mọi chỗ mới chỉ chạy với bộ Zed mới. Thêm `?zedmoi=0` vào địa chỉ trang thì game vẫn là cung như cũ. Thiếu tệp ảnh thì game vẽ bằng code như cũ.
- Đã chạy lại `build.py` (dist + công cụ Xưởng Sprite) sau khi gộp phần "chạy + chém" của phiên khác.
- Không đụng đăng nhập Google, lưu mây hay `?cloud=0`.

## Chỗ còn dùng tạm / cần chủ dự án xem trên điện thoại

1. **hu-dan-ten (phi tiêu thường đang bay)** đang làm tạm từ D3: đã xoá băng xanh, còn thân xám và vệt trắng.
   Khi có ảnh D trắng thật, bỏ ảnh vào thư mục này rồi sửa dòng `D3-bay-bang.png … sua=bo_bang` trong script cho đọc ảnh mới.
2. Các cỡ và độ to là ước lượng khi chưa xem trong game. Nếu thấy to hoặc nhỏ quá thì chỉnh ở các chỗ sau:
   - Phi tiêu: khoảng 12 điểm ảnh, ném chùm 18. Chỉnh bằng số `27.0` trong script.
   - Vệt ném thường: `sc: 0.55` trong `fx_dan.js`.
   - Ném chùm: `(14 + 8 * c) / 22` trong `fx_he.js`.
3. Mưa phi tiêu vẽ ở lớp mặt đất (cùng lớp vòng ngắm cũ), nên phi tiêu rơi có thể bị quái đứng trong vòng che mất một phần.
4. Ảnh "Túi phi tiêu" chỉ 14×18 ô nên chi tiết khuy đồng và phi tiêu ló ra khá nhỏ. Vị trí đeo vẫn giữ như ống tên cũ.
5. Ảnh mới (hu-trung-phi-tieu, hu-mua-phi-tieu, hu-phi-tieu-chum) là ảnh tải sau. Khi chưa tải xong, game vẽ hiệu ứng code cũ.
