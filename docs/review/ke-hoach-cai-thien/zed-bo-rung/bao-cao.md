# Báo cáo: đưa trang phục bộ 2 "Rừng" của Zed vào game (13/10/2026)

Làm theo `YEU-CAU.md` cùng thư mục. Nhánh `khoi-tao-du-an`. **Commit chính: `048cb9c3`** ("Zed: thêm trang phục bộ 2 "Rừng" (Thợ Săn Rừng), chọn/mở khoá bộ đồ, cờ ?zedbo=rung").
Đúng yêu cầu: **không chạy test, không chạy game, không Playwright**. Chỉ chạy các bước dựng: `dung-zed-game.py`, `sua-dai-do.py`, `game/build.py` và kiểm tra cú pháp (`node --check`).

## Cách xem thử
- Mở game với **`?zedbo=rung`** (ví dụ `.../linh-khi.html?zedbo=rung`): Zed mặc ngay bộ Thợ Săn Rừng, không cần mở khoá. Cờ này không ghi vào bản lưu: bỏ cờ là về bộ đang mặc thật.
- Xem nhanh không cần mở game: `xem-truoc-rung.png` (thư mục này). Mỗi động tác một hàng; hàng có vũ khí được vẽ 2 lần: cấp 1 và cấp 4, ghép như trong game (người → vũ khí → nắm tay).
- Chơi bình thường: hạ trùm Rừng già (Mộc Tinh) → bảng kết quả có dòng "Mở trang phục Zed: Thợ Săn Rừng!", về làng có lời nhắc → Hành trang › thẻ Nhân vật › nút "Bộ: … ›" ở trên khung hình Zed để đổi bộ.

## Đã làm, theo từng mục của YEU-CAU
1. **Dựng `zed-rung.sprite.json`** (`docs/anh-goc/zed/dung-zed-game.py`): dùng chung một hàm dựng cho hai bộ, cùng chuẩn: net 2, goc [24,45], ô 96, chân (48,90), co từng hàng theo cỡ ĐẦU so với tấm đứng của chính bộ Rừng. Đầu Zed sau khi co ≈ 23–27 điểm ảnh (ô 96) ở mọi hàng, giống bộ ninja.
   - **Neo vũ khí dùng lại `gan-vk/neo.json` của hàng ninja tương ứng.** Điểm cầm đã chỉnh trên ảnh ninja (chinh_nam, như cũ) được quy đổi sang ảnh Rừng theo điểm chân + tỉ lệ chiều cao hình của cùng khung, rồi chạy `chinh_nam` trên ảnh Rừng để bám đúng nắm tay. Góc độ, cờ "sau", độ dài, điểm cầm trên vũ khí giữ nguyên. chinh_nam dời điểm cầm trung bình 1,5 điểm ảnh nguồn (nhiều nhất 13,8; 79 điểm).
   - Bán kính chinh_nam trên ảnh Rừng là 18 (bộ ninja: 28). Lý do: áo bộ Rừng không có tay, cánh tay trần cũng là màu da, nên bán kính 28 sẽ kéo điểm cầm lên cẳng tay.
   - Vũ khí dùng chung tấm `zed-vk` và cùng `vk_tl`/`vk_cam` với bộ ninja, nên vũ khí to bằng nhau ở cả hai bộ.
   - Dựng lại thì `zed-moi.sprite.json`, `zed-vk.sprite.json` và `xem-truoc-than.png` của bộ ninja ra **y hệt từng byte** (git không thấy thay đổi).
   - Có 3 khung bị tràn ô nên được dời vào trong, không cắt hình: 06-chet khung 5, 16-thuong-xoc khung 1 và 2.
2. **Sửa vệt đỏ ở đai** (`trang-phuc/bo-2-rung/sua-dai-do.py`, sửa thẳng vào PNG): tấm 03-chay-v4, khung 3, 9, 11 theo yêu cầu. Khung 2 và 8 cũng còn đuôi đai đỏ nên sửa luôn. Chỉ tô những mảng đỏ thuần nằm dưới vùng mặt (y > 120) và vùng ngay quanh đó, nên mắt đỏ không bị đụng. Màu mới lấy từ chính đai vàng đất trong khung đó, giữ độ sáng tối của nếp vải.
3. **Lưu bộ đồ đang mặc**: lưu ở `save.zed.bo` (`'rung'`; không có trường = `'ninja'`) và `save.zed.boMo` (các bộ đã mở), kiểm tra lại trong `G.fixSave` (js/engine.js).
   - Lưu mây dùng chung cách cũ: mây gửi nguyên bản lưu và cũng chạy qua fixSave. Không đụng cloud.js, đăng nhập Google hay `?cloud=0`.
   - Bản lưu cũ không có các trường này thì mặc bộ ninja.
   - `js/zed_moi.js` chọn tấm theo `G.zedBo()`. Vũ khí, nhịp đánh, neo và cách ghép không đổi. Nếu tấm Rừng chưa tải xong thì tạm vẽ bộ ninja.
4. **Mở khoá**:
   - Hạ trùm vùng có tên "Rừng già" (`G.REGIONS`, chỉ số 0), ở độ khó nào cũng được, thì mở bộ Rừng (js/stage.js) và hiện một dòng ở bảng kết quả.
   - Về làng có lời nhắc một lần (js/village_scene.js, dấu `save.zed.boBao`).
   - Bản lưu cũ đã có sao ở ải trùm Rừng thì được mở bù, kèm lời nhắc.
   - Mở rồi thì mặc được ở mọi vùng.
   - Chỗ đổi bộ: **Hành trang › Nhân vật** (js/hanh_trang.js), một nút nhỏ trên khung hình Zed. Chỉ đổi được ở làng; trong ải thì chỉ xem. Khi bộ Rừng chưa mở, chỗ đó ghi "Hạ Mộc Tinh để mở Thợ Săn Rừng".
   - Tên bộ: "Ninja Bóng Đêm"/"Night Ninja", "Thợ Săn Rừng"/"Forest Hunter". Tiếng Anh thêm vào `tools/ngon-ngu/tu-dien/zed.json` và `game/js/ngon_ngu_en.js`.
5. **Cờ `?zedbo=rung`** (js/data.js `G.ZED_BO_THU`).
6. **Đã chạy `python3 game/build.py`**. `zed-rung` là ảnh tải sau, khoảng 1,1 MB: không làm nặng trang đầu. Khi người chơi mặc bộ này, game tải ảnh ngay.

## Lưu ý
- **Không chạy lại `tools/ngon-ngu/gop.py`.** Tệp `ngon_ngu_en.js` đang có 5 mục tiếng Anh được thêm tay mà chưa có trong các tệp .json; chạy gop.py sẽ làm mất 5 mục đó. Vì vậy 6 mục mới được thêm vào cả hai nơi.
- Chưa kiểm tra trong game thật, vì yêu cầu không test. Cần chủ dự án mở `?zedbo=rung` xem các điểm sau:
  - nắm tay có khớp vũ khí không, nhất là các hàng thương và búa;
  - nút đổi bộ trong Hành trang có vừa chỗ không.
