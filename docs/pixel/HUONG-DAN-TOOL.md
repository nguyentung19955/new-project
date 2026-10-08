# Hướng dẫn tool Vẽ Pixel (cho người không lập trình)

Tool giúp **vẽ hình pixel cho game rồi nạp thẳng vào game** để xem — không cần cài gì, không cần mạng.

## 1. Mở tool

- Mở thư mục game → `tools` → **bấm đúp `ve-pixel.html`** (mở bằng Chrome hoặc Edge).
- Màn hình có 3 cột: **1. Chọn mã** (trái) · **2. Đang vẽ** (giữa) · **3. Xem trước** + bảng màu + kiểm tra (phải).

## 2. Chọn hình cần vẽ (nhiều hình một lần)

1. Cột trái: chọn **nhóm** (Tướng, Quái, Boss, Icon, Kỹ năng, Đồ, Nền…) hoặc gõ tên vào ô tìm. Tích **"chỉ mã chưa có pixel"** để
   chỉ hiện hình còn thiếu.
2. **Tích ô** cạnh các mã muốn vẽ (tích bao nhiêu cũng được) → bấm **"＋ Thêm mã đã chọn"**.
3. Tool **tự vẽ sẵn** mỗi mã theo mô tả có sẵn trong danh sách (đủ các động tác: đứng, đánh, tung chiêu, trúng đòn, ngã; quái thì đi).
   Các mã hiện thành nút ở đầu cột giữa — bấm để chuyển qua lại.
- Hình không có trong danh sách: chọn nhóm ở dòng dưới cùng, gõ **mã** (chữ thường không dấu, vd `ong-tao-moi`), bấm **＋**.

## 3. Đổi tạo hình nhanh

- **Mẫu vẽ tay:** hình đã có bản vẽ tay (kể cả ở nhánh chưa gộp) được tool **tự lấy làm mẫu** — đủ mọi động tác, đúng như bản gốc.
  Ô **"Mẫu vẽ tay"** cho chọn bản vẽ tay khác cùng nhóm; **Thay** một bộ phận (vd `gay` ← gậy của Sơn Tinh) và **Đổi màu** cả dải
  (vd đỏ son → chàm). Chọn "— không —" để quay về sinh từ mô tả / bộ phận.

- Ô **Mô tả ngắn**: viết vài cụm, cách nhau dấu phẩy, ví dụ: `khăn vàng, giáp sắt, áo choàng đỏ, gậy sắt, hành Hỏa` → bấm
  **✨ Sinh từ mô tả**. Tool hiểu: *bộ xương, người đá, hồn ma, hình nhân giấy, rối gỗ, tượng đồng, ma cây* · *tóc búi / dựng / dài,
  đầu trọc* · *khăn, nón lá, mũ lông chim, vương miện, mũ trùm, sừng* · *áo, giáp, áo giao lĩnh, cởi trần, khố, váy, quần* + màu (đỏ, son,
  vàng, đồng, sắt, bạc, trắng, đen, nâu, rêu, xanh lá, chàm, nước, tím, ngọc…) · *gậy, giáo, rìu, kiếm/đao, cung/nỏ, mái chèo, chuông* ·
  *cánh* · *hổ, nghê, lân, trâu, rùa… (thú 4 chân)* · *rắn, rồng, cá, thuồng luồng* · *hành Kim / Mộc / Thủy / Hỏa / Thổ*.
- Hoặc chọn thẳng ở các ô **bộ phận** bên dưới (Dáng, Chất liệu thân, Tóc, Mũ, Áo, Màu áo, Vũ khí, Hành…) — đổi là vẽ lại ngay.
- ⚠ Sinh lại sẽ **xoá phần đã chỉnh tay** của mã đó. Chỉnh tay sau cùng.

## 4. Chỉnh tay từng điểm

- Chọn **Động tác** (idle = đứng, attack = đánh, cast = chiêu, hurt = trúng đòn, die = ngã, walk = đi) và bấm hình nhỏ để chọn **khung**.
- Bảng màu bên phải: bấm một màu (chỉ được dùng màu trong bảng — đúng bảng màu chung của game).
- Công cụ: ✏️ bút (kéo để vẽ; **chuột phải = tẩy**) · 🧽 tẩy · 🪣 đổ màu · 💧 hút màu · ↶ ↷ hoàn tác / làm lại (Ctrl+Z / Ctrl+Y) ·
  **▢ Viền** (thêm viền đen 1 điểm quanh hình — nên bấm sau khi vẽ thêm ra ngoài) · ⇋ lật · ← → ↑ ↓ dịch cả khung ·
  ⧉ chép khung trước · ＋ / － khung · ⌫ xoá trắng khung.
- "bóng khung trước" hiện mờ khung trước để vẽ chuyển động cho khớp. Ô vuông đỏ nhỏ dưới chân = **điểm chân chạm đất**.
- Cột phải **Xem trước** chạy động tác đang chọn; bấm **▶ mọi động tác** để xem lần lượt tất cả. Đổi **Phóng** để to / nhỏ.
- Mục **Kiểm tra**: chữ đỏ = lỗi phải sửa (thiếu khung, sai cỡ…); chữ vàng = nên sửa (thường chỉ cần bấm ▢ Viền); xanh = đạt.

## 5. Lưu bản nháp

- Tool **tự lưu** trên máy mỗi lần sửa (đóng mở lại vẫn còn — cùng trình duyệt, cùng máy).
- **💾 Lưu nháp** tải file `ve-pixel-nhap.json` để cất / gửi máy khác; **📂 Mở nháp / zip** mở lại file đó (hoặc một `goi-pixel.zip`
  đã xuất để vẽ tiếp).

## 6. Xuất gói và nạp vào game

1. Bấm **📦 Xuất goi-pixel.zip** → trình duyệt tải về `goi-pixel.zip` (gồm mọi mã đạt kiểm tra; mã còn lỗi đỏ bị bỏ ra và có báo).
2. Mở game → **Cài đặt** (ở menu chính, không phải trong trận) → kéo xuống dòng **"Gói pixel (thử)"**:
   - **Nạp gói (.zip)** → chọn `goi-pixel.zip`. Game kiểm tra gói, báo "Đã nạp N mã pixel" (hoặc báo lỗi nếu file hỏng / không phải gói).
     Gói được **lưu lại trong máy**, mở game lần sau vẫn còn.
   - **Pixel: Tắt / Bật** — phải **bật** thì game mới vẽ hình pixel (bấm là game tự tải lại).
   - **Gỡ gói** — bỏ gói, game trở về hình sẵn có.
3. Vào trận để xem: mã có trong gói vẽ bằng hình của bạn; mã không có trong gói vẫn vẽ như cũ.
- Nạp gói mới sẽ **thay** gói cũ (muốn gộp: mở cả hai trong tool rồi xuất một gói).

## 7. Đưa hình vào game chính thức

Gửi `goi-pixel.zip` cho Claude (session điều phối). Trong zip đã có sẵn file nguồn `tools/pixel/src/<nhóm>/<mã>.txt` đúng chuẩn —
Claude giải nén vào repo, chạy `node tools/build-pixel.js --strict` (ra đúng từng điểm ảnh như bạn thấy trong tool), kiểm tra rồi gộp.
