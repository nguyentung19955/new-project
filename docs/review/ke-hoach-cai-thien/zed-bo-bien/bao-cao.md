# Báo cáo: đưa trang phục bộ 3 "Biển" của Zed vào game (13/10/2026)

Làm theo `YEU-CAU.md` trong cùng thư mục, cách làm giống bộ Rừng (`../zed-bo-rung/bao-cao.md`). Nhánh `khoi-tao-du-an`.

**Commit chính: `8564a5cb`**. Tên commit: "Zed: thêm trang phục bộ 3 "Biển" (Chiến Binh Biển), mở khoá khi hạ trùm Hang biển, cờ ?zedbo=bien".

Đúng yêu cầu: **không chạy test, không chạy game, không dùng Playwright**. Chỉ chạy các bước dựng và kiểm tra:
- `sua-bang-tay.py`
- `dung-zed-game.py`
- `game/build.py`
- `node --check` cho các tệp JS đã sửa

## Cách xem thử
- **Mở game với `?zedbo=bien`** (ví dụ `.../linh-khi.html?zedbo=bien`). Zed mặc ngay bộ Chiến Binh Biển, không cần mở khoá. Cờ này không ghi vào bản lưu.
- **Xem nhanh không cần mở game:** ảnh `xem-truoc-bien.png` trong thư mục này. Mỗi động tác một hàng. Hàng có vũ khí được vẽ hai lần (cấp 1 và cấp 4) và ghép như trong game.
- **Chơi bình thường:**
  1. Hạ trùm Hang biển (Ngư Tinh).
  2. Bảng kết quả hiện dòng "Mở trang phục Zed: Chiến Binh Biển!".
  3. Về làng có lời nhắc.
  4. Vào Hành trang › Nhân vật, bấm nút "Bộ: … ›" để đổi bộ. Nút xoay vòng: Ninja → Rừng → Biển (chỉ qua các bộ đã mở).

## Đã làm theo từng mục
1. **Dựng `game/art/custom/zed-bien.sprite.json`** (`docs/anh-goc/zed/dung-zed-game.py`).
   - Phần dựng bộ Rừng được tách thành hàm `dung_bo`. Hàm này chạy cho danh sách `BO_KHAC` gồm Rừng và Biển.
   - Bộ Biển dựng giống hệt bộ Rừng:
     - co từng hàng theo cỡ đầu;
     - đứng, đi, chạy neo ngang theo tâm đầu (`NEO_DAU`/`DAU_X`);
     - neo vũ khí lấy từ `gan-vk/neo.json` của hàng ninja tương ứng, quy đổi theo chân và tỉ lệ hình;
     - `chinh_nam` chạy trên ảnh Biển với bán kính 18 (áo ngắn tay, như bộ Rừng);
     - dùng chung tấm vũ khí `zed-vk`.
   - Kết quả neo: `chinh_nam` dời điểm cầm trung bình 1,8 điểm ảnh nguồn, nhiều nhất 9,5 (trên 79 điểm).
   - Hai khung bị tràn ô nên được dời vào trong, không cắt hình: `16-thuong-xoc` khung 1 và 2.
   - **Bộ ninja và bộ Rừng dựng lại ra y hệt từng byte**: git không thấy thay đổi ở `zed-moi`, `zed-vk`, `zed-rung` và hai ảnh xem trước cũ.
2. **Sửa băng tay còn trắng** (`docs/anh-goc/zed/trang-phuc/bo-3-bien/sua-bang-tay.py`, sửa thẳng vào PNG).
   - Đã soát bằng mắt cả 27 tấm, mọi khung. Các khung đã sửa:
     - `10-kiem-3` khung 6: băng tay sau trắng hẳn.
     - `12-thuong-2` khung 3 và 4: vệt trắng giữa băng tay giơ cao.
     - `20-phi-tieu` khung 3: băng tay sau màu trắng xám nhạt.
   - Cách giới hạn:
     - Mỗi khung chỉ sửa trong một ô chữ nhật quanh cổ tay. Nhờ vậy áo ngà, răng, mắt và vỏ ốc không bị đụng.
     - Chỉ tô điểm trắng hoặc xám, không phải da.
     - Màu mới lấy từ băng xanh lam trong chính khung đó, theo thứ hạng sáng, để giữ nếp vải. Riêng khung 6 của `10-kiem-3` lấy màu từ băng xanh ở tay trước.
   - Chạy lại script thì gần như không tô thêm gì (chỉ 0–2 điểm).
   - **Chưa sửa** `13-thuong-3` khung 5: nắm tay sau ở đó màu xám ngà. Đây là cả bàn tay, không phải mảng băng trắng; nếu tô xanh thì cả nắm tay thành xanh, nhìn kỳ. Chủ dự án xem lại; nếu cần thì nên gen lại khung đó.
3. **Thêm bộ `'bien'`** vào `G.ZED_BO` (`game/js/data.js`).
   - Tên "Chiến Binh Biển", gắn với vùng "Hang biển" (vùng thứ 2 trong `G.REGIONS`, trùm Ngư Tinh).
   - Các phần sau dùng chung code của bộ Rừng nên tự áp dụng cho bộ Biển, không phải sửa thêm:
     - mở khoá khi hạ trùm ở mọi độ khó (`stage.js`);
     - dòng báo ở bảng kết quả;
     - lời nhắc ở làng;
     - mở bù cho bản lưu cũ đã có sao ở ải trùm Hang biển (`engine.js` `fixSave`);
     - lưu máy và lưu mây.
   - Không đụng `cloud.js`, đăng nhập Google hay `?cloud=0`.
   - Hành trang: nút đổi bộ xoay vòng qua các bộ đã mở. Mới thêm: dưới nút có dòng nhắc cách mở bộ còn khoá, ví dụ "Hạ Ngư Tinh để mở Chiến Binh Biển".
   - Tiếng Anh "Sea Warrior" được thêm vào `tools/ngon-ngu/tu-dien/zed.json` và `game/js/ngon_ngu_en.js`. **Không chạy gop.py.**
4. **Cờ `?zedbo=bien`** chạy được luôn nhờ code đọc cờ chung (`G.ZED_BO_THU`).
5. **Đã chạy `python3 game/build.py`.** `zed-bien` là ảnh tải sau, giống `zed-rung`: trang đầu không nặng thêm. Ảnh xem trước: `xem-truoc-bien.png`.

## Lưu ý
- Lời nhắc ở làng liệt kê **mọi** bộ đã mở. Ví dụ, mở Biển sau Rừng thì câu nhắc ghi "Thợ Săn Rừng, Chiến Binh Biển". Cách này giữ nguyên định dạng bản lưu.
- Chưa kiểm tra trong game thật, vì yêu cầu không test. Chủ dự án mở `?zedbo=bien` để xem:
  - nắm tay có khớp vũ khí không, nhất là các hàng thương và búa;
  - dòng nhắc dưới nút đổi bộ có vừa chỗ không.
