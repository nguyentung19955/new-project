# Báo cáo phiên 2: khung que đo từ hàng chạy thật của Zed

Tất cả nằm trong `docs/thu-modular/`. Sinh lại bằng `python3 docs/thu-modular/do-chay-that.py` (chạy khoảng 5 giây; dựng lại cả `kiem-tra.html`). Code game không đổi.

## Dùng hàng nào

Hàng 3 (chạy, **8 khung**) của `docs/anh-goc/zed/zed-v2-canonical.png`. Lý do: cùng tấm và cùng tỉ lệ với dáng đứng của phiên 1, nên dùng chung hệ toạ độ và tỉ lệ sang game.

Hàng chạy game đang dùng là `moi/03-chay-v4` (12 khung). Đó là bản vẽ khác (bộ ninja tóc đen, cỡ khác), nên không đo ở đây. Nếu cần đo hàng đó thì dùng cùng script, chỉ đổi nguồn.

Ô que là ô 256 của tấm gốc, dời xuống 9 px để đường đất (đáy dép thấp nhất cả hàng) nằm ở y = 248, như mọi que phiên 1. Không co, không dời ngang, nên 8 khung cùng cỡ và cùng đường chân. Gốc toạ độ ở góc trên-trái ô.

## Đã làm

1. **Đo khớp từng khung**: đủ 23 khớp như phiên 1 (đỉnh đầu, tâm đầu, cằm, cổ, vai, khuỷu, cổ tay, nắm tay, eo, hông, gối, cổ chân, mũi chân, gốc).
   - Đo tự động trước: tách màu tóc, da và đỏ để lấy đầu, cằm, eo, nắm tay, bàn chân. Vai và hông suy theo thân; khuỷu và gối tính bằng IK.
   - Sau đó soát bằng mắt trên ảnh phóng ×4/×5 có lưới, rồi sửa tay. Sau soát chỉ giữ được 3 khớp đo tự động (đỉnh đầu, tâm đầu, cằm); 19/23 khớp mỗi khung là sửa tay. Các khớp sửa ghi trong `que-chay-that.chinh-tay.json` kèm lý do. `que-chay-that.json` ghi nguồn của từng khớp và cả số đo tự động trước khi sửa.
   - Lỗi tự động hay gặp: eo bị kéo về phía đuôi khăn; tay xa bị nhận nhầm thành mép ngực, bụng hoặc ngón chân; cổ chân bị đặt lệch ra phía mũi chân.
   - Ảnh ra: `que-chay-that.png`/`.gif`/`-luoi.png`, `que-chay-that-chong-zed.png`/`.gif` (que đè lên Zed thật), `que-chay-that-chong-zed-luoi.png` (×3, có lưới và số khớp), `que-chay-that-tu-dong-va-chinh.png` (cam = tự động, đen = sau sửa).
2. **Tách lớp bộ phận từng khung** từ sprite thật, bằng mặt nạ theo xương: `bo-phan-chay/khung-01..08/` có 14 bộ phận (đầu, thân, cánh tay trên, cánh tay dưới, bàn tay, đùi, cẳng chân, bàn chân, mỗi loại phải/trái) và thêm khăn. `bo-phan-chay.json` ghi chỗ đặt trong ô, pivot, khớp cuối, góc và lớp. Kiểm: ráp lại theo lớp **trùng ảnh gốc 100%** (lệch 0 điểm ảnh ở cả 8 khung). Ảnh tổng `bo-phan-chay.png` có 4 hàng: gốc, bản đồ màu, ráp lại, tách rời.
3. **Neo đồ từng khung** (áo, quần, tóc/mũ, phụ kiện lưng và tay cầm): nằm trong `que-chay-that.json → khung[i].neo_do`, cùng cấu trúc với phiên 1. Ghép thử giáp và nón có sẵn (không vẽ lại): `ghep-thu-giap-non-chay-that.png`/`.gif`.
4. **`kiem-tra.html`**: thêm dáng `chay-that`. JSON và ảnh 8 khung đều nhúng sẵn trong trang.
   - Nút **Zed thật dưới que** dùng được ở mọi khung, que vẽ đè lên.
   - Nút **Bản đồ bộ phận** tô màu từng bộ phận lên hình.
   - Các dáng cũ (đứng, đi 6, chạy 8, kiếm) giữ nguyên.
   - Đã chạy thử trên Chromium (bước qua 8 khung, đổi qua mọi dáng): không có lỗi.
5. **`HUONG-DAN.md` mục 7**: bảng tệp mới, quy ước trái/phải của hàng này, 5 prompt gen theo từng phần cho cả chu kỳ chạy (C1 áo, C2 quần, C3 mũ, C4 găng, C5 giày), và giới hạn. Mỗi prompt đi kèm một ảnh vùng `mau-gen/vung-*.png`: Zed màu xám, vùng món đồ phải phủ tô màu cam ở từng khung.

## Ảnh nên gửi chủ game xem

1. `que-chay-that-chong-zed.gif`: que đo được chạy cùng Zed thật (xem nhanh nhất).
2. `que-chay-that-chong-zed-luoi.png`: từng khung có lưới toạ độ và số khớp.
3. `que-chay-that-tu-dong-va-chinh.png`: đo tự động so với sau khi sửa tay.
4. `bo-phan-chay.png`: bộ phận tách từng khung và bản ráp lại.
5. `ghep-thu-giap-non-chay-that.gif`: đồ vẽ ở dáng đứng xoay theo que chạy (để thấy giới hạn).
6. `mau-gen/vung-ao.png`: một ảnh vùng mẫu dùng khi gen.
7. `kiem-tra.html`: chọn dáng `chay-that`, bật "Zed thật dưới que", bấm Chạy.

## Prompt mẫu (trích HUONG-DAN.md mục 7)

Ảnh gửi kèm, theo đúng thứ tự: (1) `zed-chay-that-hang.png`, (2) `que-chay-that-chong-zed.png`, (3) `mau-gen/vung-<phần>.png`.

> Pixel art, 1 hàng 8 khung, mỗi ô 256×256, đúng vị trí và cỡ như ảnh 1. Mỗi khung vẽ CHỈ chiếc áo ngắn tay vải nâu phủ đúng vùng tô cam ở ảnh 3 của khung đó, theo dáng chạy của ảnh 1 và que ảnh 2. Không vẽ người, không vẽ que. Nền xanh #00FF00 thuần, không chữ, không bóng.

Đổi món và ảnh 3 cho quần (`vung-quan`), mũ (`vung-mu`), găng (`vung-gang`), giày (`vung-giay`). Nguyên văn 5 prompt C1–C5 ở `HUONG-DAN.md`.

## Còn mở / cần chủ game chọn

- **Độ chính xác**: gối và khuỷu nằm trong quần thụng và ống tay, nên sai số khoảng ±5 px (±0.7 điểm game). Các khớp khác khoảng ±3 px.
- **Sprite chạy không đổi chân**: hàng chạy này vẽ kiểu phi, chân trước luôn là một chân, tay trước luôn là một tay. Que ghi đúng như hình. Nếu sau này vẽ lại hàng chạy có đổi chân thì phải đo lại (chạy lại script và sửa tay các khớp).
- **Đồ dáng đứng xoay theo que lệch nhiều**: thân khi chạy nghiêng 18–32° so với lúc đứng, nên giáp vẽ ở dáng đứng xoay theo sẽ méo và lệch chỗ. Muốn đồ khi chạy đẹp thì gen theo từng khung (C1–C5), hoặc dùng bộ phận tách sẵn làm khuôn.
- **Hàng chạy trong game**: muốn đồ khớp với game ngay thì có hai cách. Một là đo hàng `03-chay-v4` (12 khung, bộ ninja). Hai là chọn hàng 3 canonical làm hàng chạy chuẩn cho hệ modular. Cần chủ game chọn.
- Trang kiểm trên claude.ai (artifact "Kiểm khung que" đăng ở phiên trước) đã được cập nhật lên bản này (phiên bản 2), vẫn giữ link cũ.
