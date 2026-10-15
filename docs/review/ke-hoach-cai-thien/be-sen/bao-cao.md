# Bé Sen ở bến đò — báo cáo

Theo `docs/cot-truyen/CHUNG.md` (mục "Chủ game chốt thêm": Bé Sen ra mắt ở bến đò ngay từ bây giờ) và `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 3 (Bé Sen là người cần cứu ở vùng 4).
Ảnh soát tĩnh: `xem-truoc.png` (chụp bằng Chromium không giao diện, ảnh tĩnh, không chơi thử). Trang không báo lỗi nào.

## 1. Cắt ảnh
- Cắt bằng `docs/anh-goc/zed/cat-diem-anh.py <tấm> --hang 1 --so 6`, giống các em bé khác. Cả hai tấm đều ĐẠT ngay (6 khung, không lỗi, không cảnh báo, không bỏ mảnh nào), nên không cần tệp cắt tay `*-tay.json`.
  - `docs/anh-goc/npc-moi/em-be-sen-1-dung-cat/` (đứng) và `em-be-sen-2-ngoi-cat/` (ngồi): mỗi thư mục có `bao-cao.json` và `khung-01..06.png`. Đã bỏ `debug.png` và gif, như các thư mục cũ.
- Dựng tấm: `cong-cu/dung-be-sen.py [--ghi]` dùng lại `thu()`, `luu_png()` (của `dung-npc.py`) và `doc_hang()` (của `dung-ban-nho.py`). Ra tệp `game/art/custom/nl-sen.sprite.json`.
  - **Cỡ giống Cái Bống**: hàng đứng cao 31 điểm game (gồm tóc). Hàng ngồi co theo tỉ lệ SIFT so với hàng đứng: Bé Sen 1,126; đo lại Cái Bống được 1,096, khớp số cũ. Hai hàng, mỗi hàng 6 khung, nhịp 1,2 s; net 2; 96 màu.
  - **Neo giống Cái Bống**: đáy chân hoặc mông nằm trên đường đất. Theo chiều ngang: hàng đứng lấy dải chân, hàng ngồi lấy phần đầu và mình (55% trên).
  - Kết quả: ô 26×34, gốc (11, 32). Đứng cao 30, ngồi cao 22 (Cái Bống ngồi cao 24, nên Bé Sen nhỏ hơn một chút). Ảnh 10,9 KB PNG / 10,1 KB WebP.
- Tóc ở tấm đứng là búi đôi, hơi khác tấm mẫu. Vì vậy làng chỉ dùng **tấm ngồi**. Hàng đứng (`idle`) nằm sẵn trong tệp để vùng 4 dùng sau.
- Tệp ghi là `doi_tuong: 'nguoi-lang'`, mã `nl-sen`, **không** phải `em-be-*`. Lý do: `sprite_custom.js` và `build.py` chỉ cho 3 mã em bé (hunter / healer / wrestler) và chặn mã khác. Làm vậy thì không phải sửa hai tệp đó. `sen` không nằm trong `ORDER` bảy người làng, nên không bị vẽ như người làng và không có ô mặt trên dải lối tắt.

## 2. Gắn vào làng (`game/js/village_scene.js`, chỉ thêm, không sửa chỗ khác)
- Bé ngồi ở đầu cầu bến (670, 160), cạnh Chú Lái Đò (638, 152), quay mặt về phía bố. Có bóng nhỏ dưới người. Bé chạy hàng `ngoi` 6 khung, lặp liên tục.
- Chạm vào bé: Cu Tí chạy tới cạnh bé (656, 160), rồi bé nói **lần lượt** từng câu trong 4 câu (bong bóng hiện 3,2 s). Đứng gần bé thì hiện bong bóng tên "Bé Sen", và nút "Nói chuyện" cũng dùng được.
  1. Bố tớ chèo đò giỏi nhất làng đấy! — *My dad's the best boatman in the village!*
  2. Tớ ngồi đây đếm cá nhảy, được bảy con rồi! — *I'm counting jumping fish. Seven so far!*
  3. Cu Tí đi ải nhớ cẩn thận nha, về kể tớ nghe! — *Be careful out there, Cu Tí! Then tell me all about it!*
  4. Đêm nay sông đục lạ... Bố dặn tớ đừng thò chân xuống nước. — *The river's strangely murky tonight... Dad says keep my feet out of the water.* (câu móc vùng 4)
- Bé chắn đường giống ba bạn ở sân đình (bán kính 8). Khi từ ải về, Cu Tí lên bờ ở (662, 160), cách bé 8, nên không bị kẹt.
- Ảnh chưa tải xong thì bé chưa hiện và không chạm được. Không có chức năng mới, không đổi số liệu nào.
- **Chỗ nối vùng 4** (đã ghi chú trong code): mọi chỗ vẽ, chạm và chắn đường đều đi qua `senO()`. Phiên 2C vùng 4 gán `VS.senVang = () => <đã chiếu mở vùng 4 mà chưa hạ Thuồng Luồng>`. Hàm trả `true` thì bé vắng mặt. Chưa gán thì bé luôn ở bến.

## 3. Tiếng Anh
- Đã thêm 5 khoá (tên "Bé Sen" → "Little Sen" và 4 câu) vào `tools/ngon-ngu/tu-dien/lang.json`. `kiem.py lang village_scene.js` báo còn 0 chuỗi chưa dịch.
- `game/js/ngon_ngu_en.js`: **thêm tay** 5 dòng ở cuối tệp, **không** chạy lại `gop.py`. Lý do: tệp này hiện đang lệch với `tu-dien/*.json`. Chạy `gop.py` sẽ thay đổi khoảng 390 dòng (thêm và bỏ cả khoá của phiên khác), nên phải để phiên làm từ điển xử lý riêng.

## 4. Kiểm
- `node --check` cho `village_scene.js` và `ngon_ngu_en.js`: qua.
- `python3 game/build.py`: bản một tệp 27,36 MB / trần 30 MB.
- `python3 game/build.py --hai-tep`: người chơi tải 15,80 MB / trần 20 MB; trang chính nén 1,04 / 1,50 MB; lõi 347 ảnh 3,90 MB. `nl-sen` nằm trong lõi (người làng tải ngay) và chỉ thêm khoảng 10 KB.
- Ảnh soát `xem-truoc.png`: toàn cảnh làng, bến đò phóng to, 2 câu tiếng Việt và 2 câu tiếng Anh. Bong bóng chỉ đúng vào bé. Trang không báo lỗi.
  - Cách làm lại: `cong-cu/chup.py <thư mục>` (chạy trên bản `--hai-tep`; chạm vào bé bằng sự kiện chuột thật trên canvas), rồi `cong-cu/ghep-xem-truoc.py <thư mục>`.
- Không chơi thử trên trình duyệt. Không đụng đăng nhập Google, lưu mây hay `?cloud=0`.
