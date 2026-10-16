> **ĐÃ BỎ (16/10, phiên 3):** báo cáo này làm trên Cu Tí CŨ (zed-v2-canonical.png). Mọi ảnh/JSON nhắc dưới đây đã xoá. Bản đúng (Cu Tí MỚI): xem `bao-cao-3.md` và `HUONG-DAN.md`.

# Báo cáo: bộ thử mặc đồ modular (Zed)

## Đã làm

Tất cả nằm trong `docs/thu-modular/`, sinh lại bằng `python3 docs/thu-modular/tao-bo-thu.py`. Code game không đổi.

1. **Nhân vật mẫu**: Zed dáng đứng nghiêng phải, khung 1 của `docs/anh-goc/zed/zed-v2-canonical.png`. Có ảnh phóng ×4, ảnh nền trong suốt, và `nhan-vat.json` gồm:
   - khung bao, điểm gốc chân, tỉ lệ sang game (236 điểm ảnh = 31 điểm game);
   - 23 khớp (đỉnh đầu, tâm đầu, cằm, cổ, vai, khuỷu, cổ tay, nắm tay, eo, hông, gối, cổ chân, mũi chân, gốc), toạ độ theo ảnh gốc, ảnh cắt và điểm game;
   - 18 đoạn xương (độ dài, góc), thứ tự lớp vẽ.

   Ảnh `nhan-vat-khop.png` đánh số khớp kèm bảng tên và toạ độ.
2. **Khung que**: dáng đứng (`que-dung.png` ×2 có đánh số, `que-dung-x1.png` cỡ thật, `que-dung-chong-hinh.png` chồng lên Zed), đi 6 khung, chạy 8 khung, chém kiếm 1 nhát 6 khung. Mỗi tấm là một hàng ô 256×256 cùng đường đất, có GIF và ảnh lưới toạ độ. Mỗi `que-*.json` ghi toạ độ khớp và góc xương **từng khung**, cùng **neo đồ** từng khung (áo, quần, tóc/mũ, phụ kiện: lưng, tay cầm), theo điểm ảnh ô (gốc góc trên-trái) và điểm game.
3. **Bộ phận que rời**: 14 ảnh trong `bo-phan/`: đầu, thân, cánh tay trên, cánh tay dưới, bàn tay, đùi, cẳng chân, bàn chân (mỗi loại phải/trái). Pivot là chấm đỏ có dấu cộng, khớp con là vòng đỏ. `bo-phan.json` ghi pivot (theo ảnh ×3, ảnh gốc, game), khớp cuối, độ dài, góc gốc, bề rộng, cha, lớp. `bo-phan.png` xếp tất cả và có bản ráp lại theo thứ tự lớp.
4. **Hướng dẫn** `HUONG-DAN.md`: cách hiểu toạ độ, bảng "món nào bám xương nào, neo ở đâu, gửi ảnh mẫu nào", 3 quy tắc gen, 5 prompt ngắn (mũ, giáp thân, quần chia mảnh, găng + giày, áo cả chu kỳ chạy), giới hạn.
5. **Ghép thử**: giáp và nón lá có sẵn ở `docs/anh-goc/zed/lop-ghep/` (không vẽ lại) đặt lên Zed thật, rồi lên que chạy 8 khung. Giáp bám thân, nón bám đầu, nón mặt sau nằm sau đầu.
6. **Theo `YEU-CAU-2.md`**: thêm neo đồ từng khung, ảnh lưới, và trang `kiem-tra.html`. Trang là một tệp tự chứa, mở thẳng bằng trình duyệt. Trang đọc JSON que, vẽ xương, khớp và đồ chồng lên, bật/tắt từng lớp, chạy hoặc bước từng khung, mở JSON khác, nạp ảnh đồ mới (tự bỏ nền xanh). Đã chạy thử trên Chromium: không có lỗi.

## Ảnh nên gửi chủ game xem trước

1. `nhan-vat-khop.png`: nhân vật và khớp đánh số, kèm toạ độ.
2. `que-dung-chong-hinh.png`: que khớp người Zed.
3. `que-chay-8.png` (hoặc `que-chay-8.gif`), `que-di-6.png`, `que-kiem-1-nhat.png`: các dáng que.
4. `bo-phan.png`: bộ phận rời và bản ráp.
5. `ghep-thu-giap-non-chay.gif` và `ghep-thu-dung-tren-zed.png`: đồ có sẵn đi theo khung.
6. `HUONG-DAN.md` mục 4: 5 prompt để thử gen.

## Còn mở / cần chủ game chọn

- Que đi, chạy và kiếm là dáng máy dựng theo tỉ lệ Zed, chưa đo từ hàng chạy thật. Nếu muốn đồ khớp từng điểm với sprite chạy hiện có thì bước sau là đo khớp 8 khung chạy thật (hàng 3 của `zed-v2-canonical.png`).
- Tay và đùi khi chạy xoay lớn (40–60°). Đồ ở tay, chân nên vẽ theo từng khung (prompt P5) hoặc chia mảnh. Đồ ở thân và đầu dùng một ảnh là đủ.
- Chưa có công cụ tự đo neo cho ảnh đồ mới gen. Hiện phải đặt ảnh đúng ô 256 trên `que-dung-x1.png`, hoặc gửi Claude đo như đã làm với `lop-ghep`.
