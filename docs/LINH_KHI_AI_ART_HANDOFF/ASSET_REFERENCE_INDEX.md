# LINH KHÍ — Mục lục ảnh tham chiếu (ASSET REFERENCE INDEX)

> Game **không có file ảnh** nào. Mọi ảnh dưới đây đều được **chụp bằng cách gọi hàm vẽ thật của game** trong Chromium (Playwright). Script dùng để chụp: `cong_cu/chup_tham_chieu.py`. Script chỉ đọc game, không sửa gì.
> - Ảnh **1×** là đúng cỡ gốc: 1 điểm ảnh trong ảnh bằng 1 điểm ảnh thế giới (lớp 480×270).
> - Ảnh `_x2`, `_x3`, `_x4` là bản phóng to bằng "láng giềng gần nhất", không làm mịn.
> - Ảnh sprite có **nền trong suốt** và **không có bóng chân** (bóng do code vẽ riêng).
> - Số đo của từng ảnh nằm trong `anh/do_dac.json`.
> - Để chụp lại: chạy `python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/chup_tham_chieu.py`, rồi `lam_contact_sheet.py`, rồi `tao_manifest.py` (chạy từ thư mục gốc của repo).

Thang độ tin cậy:
- **Cao:** hình vẽ đúng bằng hàm của game, tham số rõ ràng.
- **Trung bình:** cảnh chạy thật nhưng có ngẫu nhiên (vị trí quái, hiệu ứng).
- **Thấp:** chỉ mô tả, chưa có ảnh.

## 1. Contact sheet (xem trước tiên)

| Đường dẫn | Nội dung | Tỉ lệ |
|---|---|---|
| `anh/contact/00_TONG_QUAN.png` | Tổng quan mọi contact sheet, thu nhỏ để xem nhanh. **Không** dùng để đo | thu nhỏ (có làm mịn) |
| `anh/contact/em_be_smith.png` · `em_be_hunter.png` · `em_be_healer.png` · `em_be_wrestler.png` | 11 hàng động tác của từng em bé, có nhãn: số khung và hộp bao tính từ chân | ×3 |
| `anh/contact/quai_rung.png` · `quai_bien.png` · `quai_laudai.png` | 11 con mỗi vùng (8 thường, 2 tinh anh, 1 trùm nhỏ) × 10 cột động tác | ×2 |
| `anh/contact/trum_mocTinh.png` · `trum_nguTinh.png` · `trum_hoTinh.png` | 3 pha × 8 cột động tác | ×1 |
| `anh/contact/vu_khi_40_dong.png` | 4 loại × 10 dòng vũ khí, nằm ngang | ×3 |
| `anh/contact/canh_480x270.png` | 12 cảnh game ở cỡ thật | ×1 |

## 2. Ảnh nguồn từng nhóm

| Đường dẫn | Nội dung | Giữ gì | Cải thiện gì | Độ tin cậy |
|---|---|---|---|---|
| `anh/em_be/<mã>_sheet.png` (+`_x4`) — mã: smith, hunter, healer, wrestler | Ô 96×80, gốc chân (44,66), quay phải. Các hàng: đứng yên 8, chạy 8, đứng cầm kiếm 8, kiếm combo 1 (10), kiếm combo 3 (10), giáo 10, búa 14, cung 12, né 8, trúng đòn 1, ngã 8 | tỉ lệ chibi, mặt nạ trắng, màu chủ đạo, điểm cầm vũ khí, nhịp động tác | bóng dáng 4 bé giống nhau (H1); chi tiết dưới 2 px | Cao. Lưu ý: hàng "trúng đòn" vẽ **không** có tô trắng, vì lớp tô trắng chỉ bật khi có trạng thái người chơi thật |
| `anh/quai/<vùng>_sheet.png` (+`_x3`) — vùng: rung, bien, laudai | Mỗi hàng 1 con, quay trái. Cột: idle@0, idle@.5, move@0, move@.5, tele@.6, atk@.2, atk@.45, hit@.1, die@.35, die@.75 (u = tỉ lệ thời lượng) | bóng dáng loài, màu chủ đạo, mắt | quái "xấu" (H8); Lâu đài kém tương phản (H2). Hiệu ứng vẽ dính vào sprite (vòng nổ, tia gai) **không** cần AI vẽ lại | Cao. Cột hit có chớp trắng toàn thân là đúng như game |
| `anh/trum/<mã>_sheet.png` (+`_x2`) — mã: mocTinh, nguTinh, hoTinh | Hàng = pha 1/2/3. Cột: idle, move, c1, c2, c3, hit, stun, die (ở u ghi trên nhãn) | khối lớn, mặt hoặc mắt, màu từng pha | quá nhiều chi tiết nhỏ cùng độ sáng (Mộc Tinh); vảy li ti (Ngư Tinh); 9 đuôi cùng sáng (Hồ Tinh) | Cao. Hồ Tinh pha 3 ở đây vẽ cỡ **gốc 281×174**; trong game hình này bị thu còn 0.72 |
| `anh/vu_khi/vu_khi_40_dong_sheet.png` (+`_x4`) | Ô 96×56, điểm cầm (24,28), góc 0 (chĩa sang phải), dạng gốc, bậc Thường | hình dáng dòng, mặt (mắt) | 40 dòng khó nhớ (H6) | Cao |
| `anh/vu_khi/kiem_ren_nhanh_va_bac.png` (+`_x4`) | Kiếm Rèn ở 3 nhánh mốc 3 (lửa, độc, băng), rồi 4 bậc hiếm (Thường, Xanh, Tím, Vàng) | cách code biến đổi theo nhánh và bậc | — | Cao |
| `anh/canh/<vùng>_phong_trong_480x270.png` (+`_x3`) | Phòng đánh trống (chỉ có em bé), lớp thế giới | bố cục phòng, sàn, tường, đuốc | nền tối và xỉn (H7) | Cao |
| `anh/canh/<vùng>_phong_co_quai_480x270.png` (+`_x3`, `_kem_giao_dien`) | 8 vai quái + 1 tinh anh của vùng, lớp thế giới. Bản `_kem_giao_dien` là ảnh chụp màn hình 960×540 có HUD (×2, do khung trình duyệt 992×540) | tỉ lệ quái so với phòng | tương phản quái–sàn | Trung bình |
| `anh/canh/<vùng>_phong_trum_480x270.png` (+`_x3`, `_kem_giao_dien`) | Phòng trùm sau khoảng 200 bước mô phỏng | tỉ lệ trùm so với phòng | — | Trung bình |
| `anh/canh/hieu_ung_dong_{1,2,3}_480x270.png` (+`_x3`, `_kem_giao_dien`) | **P0**: Lâu đài cổ, 12 quái, bot tự đánh bằng kiếm; 3 thời điểm | — | hiệu ứng rối, số sát thương chồng lên nhau (H3). Vùng báo trước chỉ có trong bản `_kem_giao_dien`, vì chúng nằm ở lớp giao diện | Trung bình (bot ngẫu nhiên) |
| `anh/do_dac.json` | Số đo hộp bao, màu chính, thời lượng động tác cho mọi ảnh ở trên | — | — | Cao |

## 3. Ảnh CHƯA có (cần bổ sung nếu muốn)
- Làng (`village_scene.js`, cảnh 720×270) và người làng.
- Giao diện riêng: các bảng Hành trang, Rèn, Thợ may.
- Từng hiệu ứng tách riêng: vệt chém theo 4 hệ, trúng đòn từng bậc, đạn 10 kiểu, rune, chưởng. Hiện các hiệu ứng này chỉ thấy trong ảnh cảnh.
- Em bé mặc các bộ trang phục khác. Ảnh hiện tại chỉ có bộ khởi đầu.
- Vũ khí ở mọi nhánh và mốc cho cả 40 dòng (hiện mới chụp Kiếm Rèn).
- Chiêu c4, c5 và cảnh chuyển pha của trùm.

## 4. Ảnh tham chiếu cũ đã có trong repo (không thuộc gói này, chỉ để biết)
Các thư mục sau do các phiên trước tạo. Chúng có thể đã cũ so với code hiện tại:
- `docs/review/anh/`, `docs/review/anh-chien-dau/`, `docs/review/xin-y-kien-hinh-anh/`
- `docs/vfx/`
- `docs/quai-vao-game/`
