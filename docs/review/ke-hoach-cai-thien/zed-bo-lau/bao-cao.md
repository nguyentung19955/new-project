# Báo cáo: đưa trang phục bộ 4 "Lâu đài cổ" của Zed vào game (13/10/2026)

Làm theo `YEU-CAU.md` cùng thư mục, y cách bộ Biển (`../zed-bo-bien/bao-cao.md`). Nhánh `khoi-tao-du-an`.

**Commit chính: `ffcb62f4`** — "Zed: thêm trang phục bộ 4 "Lâu đài cổ" (Hiệp Sĩ Lâu Đài), mở khoá khi hạ trùm Lâu đài cổ, cờ ?zedbo=lau".

Đúng yêu cầu: **không chạy test, không chạy game, không dùng Playwright**. Chỉ chạy `dung-zed-game.py`, `game/build.py` và `node --check` cho các tệp JS đã sửa.

## Cách xem thử
- **Mở game với `?zedbo=lau`** (ví dụ `.../linh-khi.html?zedbo=lau`): Zed mặc ngay bộ Hiệp Sĩ Lâu Đài, không cần mở khoá, không ghi vào bản lưu.
- **Xem nhanh không cần mở game:** `xem-truoc-lau.png` trong thư mục này (mỗi động tác một hàng; hàng có vũ khí vẽ cấp 1 và cấp 4, ghép như trong game).
- **Chơi bình thường:** hạ trùm Lâu đài cổ (Hồ Tinh) → bảng kết quả có dòng "Mở trang phục Zed: Hiệp Sĩ Lâu Đài!" → về làng có lời nhắc → Hành trang › Nhân vật, bấm "Bộ: … ›" để đổi. Nút xoay vòng Ninja → Rừng → Biển → Lâu đài (chỉ qua các bộ đã mở).

## Đã làm
1. **`game/art/custom/zed-lau.sprite.json`** (`docs/anh-goc/zed/dung-zed-game.py`): thêm một mục `lau` vào `BO_KHAC`, dùng nguyên hàm `dung_bo` (co theo cỡ đầu, `NEO_DAU`/`DAU_X`, neo lấy từ `neo.json` hàng ninja tương ứng, `chinh_nam` bán kính 18 — `R_NAM_LAU`, vũ khí dùng chung `zed-vk`).
   - Tấm thân 1152×4032. `chinh_nam` dời điểm cầm trung vị 2,4, lớn nhất 15,0 điểm ảnh nguồn (79 điểm).
   - Tràn ô đã dời vào trong (không cắt hình): `06-chet` khung 5, `16-thuong-xoc` khung 1 và 2.
   - `02-di`, `03-chay-v4` (chế độ phục hồi) đọc bình thường, đủ số khung.
   - **Bộ ninja, Rừng, Biển dựng lại ra y hệt từng byte** (git không thấy thay đổi ở `zed-moi`, `zed-vk`, `zed-rung`, `zed-bien` và các ảnh xem trước cũ).
2. **Soát 27 tấm** (xem bằng mắt cả tấm, phóng to các tấm nghi). **Không sửa PNG nào** — các chỗ sót đều là cả bàn chân / cả dải đai, không gọn trong vùng nhỏ:
   - **Còn DÉP (lộ ngón chân) thay vì ủng:**
     - `22-phi-tieu-chum`: cả 6 khung, hai chân. Nặng nhất — nên gen lại.
     - `10-kiem-3`: khung 2 (đang nhảy, hai chân dép rõ); khung 3, 4 chân trước dép.
     - `19-bua-nen-dat` khung 3, 4 và `25-dia-chan` khung 3: chân trước trông như dép, nhỏ, có thể chấp nhận.
   - **Còn dải đai thả xuống (kiểu đai ninja):**
     - `17-bua-nen`: dải đai đỏ thả trước bụng ở khung 1, 3–8 — giống đai đỏ ninja.
     - `25-dia-chan`: dải đỏ đô viền đồng thả xuống (cùng màu bộ, ít chói).
     - `14-thuong-quet` và `22-phi-tieu-chum` (khung 1–3): đai màu xám bạc có dải thả — không đỏ nhưng khác ảnh mẫu (đai da đen khoá đồng).
   - Các tấm còn lại khớp ảnh mẫu (áo đỏ đô, giáp bạc, đai đen khoá đồng, găng nâu, ủng nâu).
3. **Bộ `'lau'`** trong `G.ZED_BO` (`game/js/data.js`): tên "Hiệp Sĩ Lâu Đài", vùng "Lâu đài cổ" (vùng thứ 3, trùm Hồ Tinh). Mở khoá (`stage.js`), dòng bảng kết quả, lời nhắc ở làng, mở bù save cũ đã có sao ải trùm (`engine.js` `fixSave`), lưu máy/mây — đều là code chung theo `G.ZED_BO_KEYS`, không phải sửa thêm. Không đụng `cloud.js`, đăng nhập Google, `?cloud=0`. Không đổi nhịp đánh/gameplay.
   - Tiếng Anh "Castle Knight" thêm vào `tools/ngon-ngu/tu-dien/zed.json` và `game/js/ngon_ngu_en.js`. **Không chạy gop.py.**
4. **Cờ `?zedbo=lau`** chạy nhờ code đọc cờ chung (`G.ZED_BO_THU`).
5. **`python3 game/build.py`** đã chạy. `zed-lau` là ảnh tải sau (như `zed-rung`, `zed-bien`, `game/build.py`), trang đầu không nặng thêm. Bản một tệp (trang công cụ) nay 28,45 MB / trần 30 MB — còn ít chỗ, bộ thứ 5 có thể chạm trần.

## Lưu ý
- Chưa xem trong game thật (yêu cầu không test). Chủ dự án mở `?zedbo=lau` xem nắm tay khớp vũ khí không, nhất là chỗ `chinh_nam` dời tới 15 điểm ảnh nguồn và các hàng thương/búa.
- Đề nghị gen lại `22-phi-tieu-chum` (dép cả hàng) và cân nhắc `10-kiem-3`, `17-bua-nen`; xong chỉ cần chạy lại `dung-zed-game.py` và `game/build.py`.
