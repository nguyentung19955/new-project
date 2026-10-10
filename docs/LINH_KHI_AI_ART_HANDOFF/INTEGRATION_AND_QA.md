# LINH KHÍ — Tích hợp ảnh và kiểm tra chất lượng (INTEGRATION & QA)

> Gói bàn giao này **không** tích hợp gì vào game và **không** sửa code game. Tài liệu chỉ ghi lại cách tích hợp **đang có sẵn trong code** và các tiêu chí đạt / không đạt mà người làm sau phải kiểm.
> **Sự thật:** game vẽ mọi thứ bằng code. Hiện chỉ có **một** đường đưa ảnh vào game: tệp `.sprite.json` (`loai: "linh-khi-sprite"`), được `game/js/sprite_custom.js` đọc.

## 1. Đường nạp ảnh hiện có (đã đọc code, CHƯA thử trong game với ảnh AI)

### 1.1 Cách tệp vào game
1. Đặt tệp `<mã>.sprite.json` vào `game/art/custom/`. Thư mục này **hiện đang trống**, chỉ có `.gitkeep`.
2. Chạy `game/build.py`. Script nhúng tệp vào bản đóng gói thành `G.customSpriteData` (`build.py` dòng 58–65), rồi `sprite_custom.js` (dòng ~507) đọc vào.
3. **Lưu ý:** mở `game/index.html` trực tiếp thì **không** đọc thư mục này. Chỉ bản đóng gói (`game/dist`) và công cụ Xưởng Sprite (`tools/xuong-sprite`) mới thấy ảnh.
4. Tạo tệp bằng **Xưởng Sprite** (`tools/xuong-sprite/index.html`): kéo thả ảnh PNG vào, đặt khung, đặt gốc, rồi tải về `.sprite.json`. Cách khác: dùng các script xuất trong `godot/linh-khi-godot/xuat_*.gd`.

### 1.2 Nhóm nào có đường nạp

| Nhóm | Mã tệp | Thay phần nào | Code vẫn vẽ | Hạn chế |
|---|---|---|---|---|
| Em bé | `em-be` (dùng cho cả 4) hoặc `em-be-smith`, `em-be-hunter`, `em-be-healer`, `em-be-wrestler` | **thân** (`noiEmBe`, sprite_custom.js ~221) | bóng, **vũ khí** (theo điểm cầm của tư thế code), hào quang, ánh bậc | Chỉ có các động tác idle, move, tele, atk, hit, die, ne. **Không** có hàng đánh riêng cho từng vũ khí. spec và cast dùng atk; dash dùng move ×2. Tay trong ảnh phải khớp vị trí vũ khí do code tính, nếu không vũ khí sẽ lơ lửng |
| Quái thường, tinh anh, trùm nhỏ | trùng mã quái (ví dụ `heoCon`) | **thân** (`noiQuai`, ~164) | bóng, hiệu ứng (vệt, tia, vòng), chớp trắng, nhuộm hệ | Đổi tên động tác: intro/idle→idle; tele/phase2/phase3→tele; c1..c5→40% tele rồi 60% atk; stun→hit lắc |
| Trùm vùng | `mocTinh`, `nguTinh`, `hoTinh` | thân | như quái | **Không đổi hình theo pha** (một tấm cho cả 3 pha), không có chiêu riêng, Hồ Tinh pha 3 bị thu 0.72 → **CẦN THÊM CODE** nếu muốn đủ |
| Vũ khí | `vk-<loại>-<dòng>[-<nhánh>[-<mốc>]]`, loại = sword/bow/spear/hammer, dòng 0–9 | hình tĩnh (`themDo`, ~315) | xoay theo góc (nấc 5°), mắt và miệng, dây cung, lấp lánh bậc Vàng | Cần có `vu_khi.cam` (điểm cầm) và `vu_khi.mui` (mũi); cung cần thêm `vu_khi.day`. Màu `#1b1118` trong ảnh sẽ bị đổi sang màu viền của bậc hiếm |
| Trang phục | `tp-<ô>-<kiểu>` (ô: hats, robes, backs, hands, masks, wings) | lớp đồ trên em bé | viền ngoài | dán phẳng (không vát sáng); neo theo đầu hoặc chân |
| Biểu tượng vật phẩm | `vp-<loại>` | ô biểu tượng | — | chỉ phóng theo số nguyên |
| **Hiệu ứng** (vệt, tia, hạt, đạn, rune, số) | — | — | — | **CHƯA có đường nạp ảnh — cần thêm code.** Lưu ý thêm: `xuat_sprite.gd` có thể xuất `doi_tuong: "hieu-ung"`, nhưng `SC.add` sẽ coi tệp đó là **quái** (lỗi tiềm ẩn) |
| **Nền phòng, làng** | — | — | — | **CHƯA có đường nạp ảnh — cần thêm code** (thay `A.bg` / `room_art.js` bằng `drawImage`, giữ nguyên `RA.geo`) |
| **Giao diện (HUD, nút, khung)** | — | — | — | **CHƯA có — cần thêm code** |

### 1.3 Cấu trúc tệp động (em bé, quái, trùm)
```json
{ "loai": "linh-khi-sprite", "doi_tuong": "quai", "ma": "heoCon", "ten": "Heo Rừng Con", "vung": "rung",
  "tam": "data:image/png;base64,...",          // 1 tấm sheet: mỗi động tác 1 HÀNG, khung trái → phải
  "khung_rong": 64, "khung_cao": 40,            // ≤ 1024
  "goc": [32, 36],                              // điểm chân trong khung
  "rong": 56, "cao": 32, "bong": 35,            // bong: rộng bóng (mặc định max(6, rong*0.62))
  "dong_tac": { "idle": {"hang":0,"so":6,"giay":1.2,"lap":true}, "move": {...}, "tele": {...},
                "atk": {...}, "hit": {...}, "die": {"hang":5,"so":8,"giay":1.2,"mo":0.6} } }
```
- Ảnh được vẽ **1:1, không phóng to**, tại toạ độ `-goc`.
- Code tự lật hình bằng `scale(-1,1)`.
- Hình được vẽ với làm mịn tắt.
- Chớp trắng do code chồng lên (source-in).
- Idle là động tác bắt buộc.

## 2. Tiêu chí ĐẠT / KHÔNG ĐẠT (kiểm cho mọi ảnh trước khi đưa vào)

| # | Kiểm tra | ĐẠT | KHÔNG ĐẠT | Cách kiểm |
|---|---|---|---|---|
| 1 | Đúng cỡ | Mọi khung bằng `khung_rong × khung_cao`. Thân nằm trong cỡ ở brief (± 2 px) | Thân to hoặc nhỏ hơn bản code quá 10% | Mở ảnh 1×, so với `anh/do_dac.json` |
| 2 | Đúng số khung | `so` bằng số ô có hình trong hàng; tấm rộng = so × khung_rong | Thiếu khung, khung trống, lệch lưới | Đếm ô |
| 3 | Không viền trắng hay pixel rác | Alpha chỉ có 0 hoặc 255; không có điểm ảnh lẻ ngoài thân | Có quầng xám hoặc trắng, điểm lẻ | Đặt lên nền đen và nền trắng ở ×4 |
| 4 | Không mờ | Cạnh sắc, đếm được số màu (≤ 16 với sprite thường, ≤ 32 với trùm) | Có dải chuyển màu, nhiều màu gần nhau | Đếm màu (ví dụ dùng PIL `getcolors`) |
| 5 | Không lệch hoạt ảnh | Chân nằm đúng `goc` ở mọi khung idle và move (± 1 px khi có nhún) | Hình trôi hoặc rung | Chồng các khung lên nhau |
| 6 | Đúng hướng | Em bé, quái và trùm đều quay **PHẢI** (sprite_custom.js: face<0 thì lật sang trái; ảnh gốc phải quay phải) | Ngược hướng (sau khi code lật sẽ thành đi lùi) | Xem khung idle |
| 7 | Không che giao diện hay đòn | Không vẽ hiệu ứng, vùng đỏ hay đạn vào thân. Không có mảng đỏ tươi (đỏ = nguy hiểm) | Thân có vòng nổ hoặc lửa lớn che vùng báo trước | So với `anh/canh/hieu_ung_dong_*_kem_giao_dien.png` |
| 8 | Không đổi hitbox / gameplay / timing | `giay` trong tệp = thời lượng code (xem manifest `animation_states`). Không sửa `mobs.js`, `combat.js`, `data.js` | Đổi thời lượng hoặc kích thước để "đẹp hơn" | Kiểm diff: chỉ được có thêm tệp trong `game/art/custom/` |
| 9 | Điểm cầm vũ khí (em bé) | Tay gần khớp REST: kiếm (12,−9), giáo (11,−15), búa (12,−10), cung (3,−16) tính từ chân, sai lệch ± 1 px | Vũ khí lơ lửng hoặc xuyên đầu | Xem trong Xưởng Sprite hoặc bản `dist` |
| 10 | Không hỏng nạp | `build.py` chạy không lỗi; `G.spriteCustom.loi` rỗng; mở game không có cảnh báo `sprite_custom: bỏ qua tệp hỏng` | Có lỗi trong console | Chạy build và mở `dist` |
| 11 | Đọc được ở cỡ thật | Phân biệt được nhân vật trong cảnh 480×270 ở ×1 | Phải phóng to mới nhận ra | Dán lên `anh/canh/*_phong_trong_480x270.png` |
| 12 | Tương phản (Lâu đài) | Thân sáng hơn sàn rõ ràng (mục tiêu độ sáng chênh ≥ 80, là đề xuất) | Lẫn vào sàn `#514744` | Đo độ sáng trung bình |

## 3. Việc cần viết thêm code (ngoài phạm vi gói này)
1. **Hiệu ứng** (vệt chém, trúng đòn, hạt, đạn, rune, chưởng, linh khí): chưa có đường nạp ảnh. Khuyên tiếp tục vẽ bằng code theo mockup B2 và B9.
2. **Nền phòng, làng**: chưa có đường nạp. Nếu muốn dùng ảnh thì cần bộ nạp mới thay `A.bg`, giữ `RA.geo` và các vùng va chạm.
3. **Trùm theo pha và theo chiêu**: định dạng hiện tại chưa có. Cần mở rộng `sprite_custom.js`, ví dụ thêm trường `pha` hoặc các hàng `c1..c5`.
4. **Em bé đánh theo từng vũ khí**: hiện chỉ có 1 hàng atk. Cần mở rộng, ví dụ `atk_sword`, `atk_spear`… kèm điểm cầm cho từng khung.
5. **Giao diện**: chưa có đường nạp.
6. Sửa nhỏ: `doi_tuong: "hieu-ung"` đang bị hiểu nhầm là quái.

## 4. Asset khó tích hợp (xếp từ khó nhất)
1. **Trùm vùng**: 3 pha, 5 chiêu, Hồ Tinh bị thu 0.72. Định dạng không đủ.
2. **Em bé**: vũ khí do code vẽ theo tư thế của code. Ảnh thân AI phải khớp tay từng khung, rất khó nếu không vẽ tay.
3. **Hiệu ứng, nền, giao diện**: không có đường nạp.
4. **Vũ khí**: dễ hơn (hình tĩnh). Nhưng mắt do code vẽ chồng lên, và màu viền bị đổi theo bậc.
5. **Quái thường**: dễ nhất. Thân thay trọn, hiệu ứng vẫn do code vẽ.

## 5. Quy trình gợi ý cho một asset
1. Tạo concept theo brief.
2. Chủ dự án duyệt.
3. Vẽ lại hoặc hậu kỳ pixel ở cỡ thật.
4. Kiểm 12 tiêu chí ở mục 2.
5. Đóng gói bằng Xưởng Sprite.
6. Chép tệp vào `game/art/custom/` **trên một nhánh riêng**.
7. Chạy `build.py`, mở `dist`.
8. Chụp lại bằng `cong_cu/chup_tham_chieu.py` để so trước / sau. Lưu ý: script chụp từ `index.html` nên sẽ thấy hình code, muốn so thì phải chụp bản `dist`.
