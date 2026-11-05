# Vũ khí vẽ bằng PixelLab — bản THỬ (05/11/2026)

**Tóm tắt cho chủ game:** cả **4 vũ khí** của Rowan (kiếm, thương, búa, phi tiêu) đã có bộ hình mới do PixelLab vẽ theo hướng cổ tích châu Âu. Bộ hình gồm đủ 4 hình thái (Trắng → Mầm → Thành hình → Thức tỉnh), 3 hệ (Lửa / Độc / Băng) và cả ảnh **"gân" tiến độ**. Bộ mới **mặc định TẮT**, game vẫn y như trước. Muốn xem thì mở game với cờ **`?vkpl=1`**, ví dụ `https://spiritblade.web.app/?vkpl=1`. Khi bật, Rowan cầm vũ khí mới, và ô đồ, Lò rèn, túi đồ, nút đánh, phi tiêu bay cũng hiện hình mới.

## 1. Cách làm (để gắn vào game mà không phải sửa điểm cầm)

- Mỗi ô ảnh mới **cùng rộng × cao** với ô cũ, ví dụ kiếm Trắng 135×33, Thành hình 167×81, búa Thức tỉnh 146×139. Kiếm dùng ô của kiếm vuông đang chạy trong game.
- Công cụ PixelLab: **`edit-image-pixen`**. Công cụ này lấy ảnh cũ làm khung rồi vẽ lại theo lời mô tả, nên giữ được dáng, hướng (mũi chĩa sang phải, cán bên trái) và chỗ nắm tay. Cả bộ chỉ dùng **một công cụ** và **một câu "phong cách" chung**: viền tối #18202A, cổ tích, không chữ.
  - Hình thái thường: sửa từ ô cũ. Chạy 2 seed (11 và 23) rồi chọn ô đẹp hơn. Hai ô bị lệch ra mép (kiếm Thức tỉnh, búa Mầm) được chạy lại bằng seed 51.
  - Ảnh hệ: sửa **từ chính ảnh PixelLab** của cấp đó (thêm "mực" Lửa #F26838/#FFC067, Độc #75B44A/#B9E86B, Băng #64BED5/#B7F0EF). Nhờ vậy cùng một cấp, ba hệ có cùng dáng vũ khí.
  - Ảnh gân: sửa từ ảnh PixelLab, thêm vân sáng vàng mảnh.
- Mã chỉ **cắt, xếp ô và đo khung mũi kiếm**, không vẽ hay vá điểm ảnh nào. Ảnh gốc PixelLab lưu ở `docs/anh-goc/zed/pixellab-vk/` (64 ô). Tấm ghép được dựng bằng `docs/review/ke-hoach-cai-thien/pixellab-vu-khi/dung_zed_vk_pl.py` và ra 3 tấm:
  - `game/art/custom/zed-vk-pl.sprite.json` — 4 loại × 4 cấp, kèm `mui_kv` là khung mũi kiếm để chặn đất (145 KB)
  - `game/art/custom/zed-vk-pl-he.sprite.json` — 4 loại × 3 hệ × 3 cấp (457 KB)
  - `game/art/custom/zed-vk-pl-gan.sprite.json` — ảnh gân Trắng / Mầm / Thành hình (87 KB)
- Gắn vào game: `game/js/vien_vk.js`, mục "VŨ KHÍ PIXELLAB". Khi có `?vkpl=1`:
  - Mã chép tấm cũ ra một canvas, dán ô PixelLab đè đúng vị trí ô cũ (ô nào lệch cỡ thì giữ ô cũ), rồi dùng canvas này thay ảnh. Vì vậy mọi chỗ trong game đang dùng ảnh vũ khí đều đổi theo, không phải sửa neo hay điểm cầm.
  - Trong lúc chờ ghép, `zed_moi.js` và `vk_moi.js` coi ảnh vũ khí như chưa tải xong, nên ảnh cũ không chớp qua.
  - Không có cờ thì đoạn mã này không chạy gì.
  - Không đụng: luật chơi, cân bằng, sát thương, lưu mây, đăng nhập, `sprite_custom.js`, `engine.js`, `build.py`.

## 2. Bảng so sánh (cũ ChatGPT | PixelLab, phóng ×3, mọi cấp × hệ)

| Loại | Bảng |
|---|---|
| Kiếm | [so-sanh-kiem-x3.png](so-sanh-kiem-x3.png) |
| Thương | [so-sanh-thuong-x3.png](so-sanh-thuong-x3.png) |
| Búa | [so-sanh-bua-x3.png](so-sanh-bua-x3.png) |
| Phi tiêu | [so-sanh-phitieu-x3.png](so-sanh-phitieu-x3.png) |
| Ảnh gân (trái: thường, phải: có gân) | [gan-pixellab-x3.png](gan-pixellab-x3.png) |

Rowan cầm vũ khí trong trận (chụp headless 844×390; mỗi hàng một cấp; cột: cũ đứng · cũ đánh · PixelLab đứng · PixelLab đánh):
[tren-tay-kiem.png](tren-tay-kiem.png) · [tren-tay-thuong.png](tren-tay-thuong.png) · [tren-tay-bua.png](tren-tay-bua.png) · [tren-tay-phitieu.png](tren-tay-phitieu.png).
Lò rèn (trái cũ, phải `?vkpl=1`): [lo-ren-cu-pl.png](lo-ren-cu-pl.png).

Nhận xét nhanh:
- **Kiếm** đổi rõ nhất: kiếm hiệp sĩ lưỡi thẳng mũi nhọn, chuôi da nâu.
  - Mầm có chắn tay hình lá cong.
  - Thành hình có chắn tay lá sồi vàng, đá xanh và tua xanh.
  - Thức tỉnh có cánh vàng, ngọc trắng, lưỡi chạm vân dây leo và chuôi xanh hoàng gia.
- **Thương**: tua đỏ thay bằng tua xanh – vàng nghệ (màu Talesworn), cán gỗ sáng. Cấp Thức tỉnh có ngọc trắng.
- **Búa**: búa thợ rèn → búa người lùn viền đồng → búa hiệp sĩ có khiên sư tử → búa khổng lồ đá chạm viền vàng có ngọc.
- **Phi tiêu**: dáng gần bản cũ, vì công cụ sửa giữ khung, nhưng tâm thành đồng/ngọc xanh và cấp Thức tỉnh có tâm mặt trời vàng.
- **Hệ**:
  - Lửa: vân lửa cam, lưỡi lửa nhỏ ở mép.
  - Độc: dây gai quấn quanh, giọt xanh nhỏ xuống.
  - Băng: lớp sương và tinh thể xanh nhạt. Ở cỡ nhỏ thì Băng nhạt nhất trong ba hệ.

## 3. Tự soát (đạt hết rồi mới đẩy)

- Mỗi ô có cỡ đúng bằng ô cũ; mã ghép dừng lại ngay nếu thấy ô lệch cỡ.
- Kiếm: điểm cầm (nắm tay trước) của mọi ô, cả ô hệ và ô gân, đều nằm trên chuôi (9/9 điểm ảnh quanh điểm cầm đều có màu).
- Thương, búa, phi tiêu: phần cán / tâm trùng với ô cũ 77–99 %. Ô hệ so với ô thường PixelLab trùng 80–100 %, tức là cùng dáng.
- Hướng mũi: tất cả chĩa sang phải như bản cũ. Không có chữ, không nhoè.
- Hai ô có vật thừa (phi tiêu Mầm và Thành hình seed 11 có thêm cây giáo hoặc vòng) đã bị loại và dùng seed khác.
- Một vài ô hệ có lưỡi lửa hoặc mảnh băng chạm mép ô nên bị cắt mất vài điểm ảnh ở đầu ngọn. Phần vũ khí không bị mất.
- Trong game: hình chụp khi bật `?vkpl=1` cho thấy tay Rowan nắm đúng cán ở mọi loại và mọi cấp, cả lúc đứng lẫn lúc đánh. Không có lỗi JS.
- Lệnh kiểm:
  - `node --check` cho vien_vk.js, zed_moi.js, vk_moi.js: đạt.
  - `python3 game/build.py`: bản một tệp **27,24 MB / 30 MB**.
  - `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: "người chơi tải" **19,70 MB / 20 MB**.
- Cảnh báo dung lượng: 3 tấm mới (WebP khoảng 0,5 MB) đang được build.py tính vào phần ảnh tải. Tấm ảnh nạp theo yêu cầu, nên trên web thực tế chỉ ai bật `?vkpl=1` mới tải. Tuy vậy, mức 19,70 MB đã sát trần 20 MB.
  - Nếu chọn dùng PixelLab thật: **thay** tấm cũ bằng tấm mới (bỏ tấm ChatGPT) thì dung lượng còn giảm.
  - Nếu không chọn: xoá 3 tệp `zed-vk-pl*.sprite.json`.

## 4. Chi phí PixelLab

- Mỗi lần vẽ `edit-image-pixen` tốn 1 lượt. PixelLab chỉ trả về số giây chạy (`usage.seconds`), không trả số lượt.
- Phiên này chạy khoảng **105 lượt**:
  - 99 ô thành công: 16 + 32 ô thường, 4 ô chạy lại, 36 ô hệ, 12 ô gân
  - 3 ô thử ban đầu
  - vài ô bị huỷ giữa chừng
  - 1 lệnh bị từ chối vì mô tả quá dài (lệnh này không tính phí)
- Số dư (`GET /balance`): đầu phiên **6.671,3**, cuối phiên **6.301,55 / 10.000 lượt** (gói Tier 3).
  - Số dư giảm 369,75 lượt, nhiều hơn 105 lượt của phiên này. Nguyên nhân: phiên vẽ quái nấm cũng đang dùng chung tài khoản trong cùng thời gian.

## 5. Còn lại / cần chủ game quyết

- So sánh rồi chọn: giữ ChatGPT, chuyển sang PixelLab, hoặc trộn (ví dụ dùng kiếm PixelLab, giữ phi tiêu cũ).
- Nếu chuyển hẳn: đổi cờ thành mặc định bật (hoặc ghép thẳng vào zed-vk), rồi bỏ tấm cũ cho nhẹ.
- Phi tiêu và thương thay đổi ít hơn kiếm. Muốn khác hẳn thì cần vẽ mới từ đầu (create-image-pixen) rồi tự căn điểm cầm; cách này tốn công kiểm hơn.
- Ảnh gân chỉ có ở những ô mà tấm gân cũ đang có: thương chỉ có cấp Trắng (đúng như game hiện tại).

Commit: `PixelLab vũ khí (bản thử ?vkpl=1): kiếm/thương/búa/phi tiêu × 4 hình thái × 3 hệ + gân`
