# Prompt vẽ giao diện (bản đồ, nút) cho Linh Khí

Các prompt dưới đây chép nguyên từ trang công cụ **Tách Giao Diện** (https://spiritblade.web.app/tach-giao-dien.html, nút "Sao chép prompt vẽ").
Cách dùng: dán một prompt vào ChatGPT → lưu tấm ảnh ChatGPT vẽ → mở trang công cụ, chọn đúng lô, đưa ảnh vào → tải tệp .zip → gửi cho Claude để đưa vào game.

## Lô 1. Bản đồ · 12 biểu tượng phòng

Lưới 4 cột × 3 hàng. Các hình (đúng thứ tự), cỡ trong game và mã tệp:

1. Điểm bắt đầu · 7×7 · `gd-phong-start`
2. Đánh thường · 7×7 · `gd-phong-fight`
3. Tinh anh · 7×7 · `gd-phong-elite`
4. Rương báu · 7×7 · `gd-phong-chest`
5. Suối hồi · 7×7 · `gd-phong-fountain`
6. Thương nhân · 7×7 · `gd-phong-merchant`
7. Thử thách · 7×7 · `gd-phong-challenge`
8. Lời nguyền · 7×7 · `gd-phong-curse`
9. Trùm · 7×7 · `gd-phong-boss`
10. Ổ khoá · 7×7 · `gd-phong-lock`
11. Chìa khoá · 7×7 · `gd-phong-key`
12. Cổng dịch chuyển · 7×7 · `gd-phong-portal`

Prompt:

```text
Dùng công cụ tạo ảnh vẽ MỘT tấm ảnh pixel art 2D gồm ĐÚNG 12 biểu tượng nhỏ cho BẢN ĐỒ của game Linh Khí (game hành động pixel art lấy cảm hứng dân gian Việt Nam và hoa văn trống đồng Đông Sơn). Mỗi biểu tượng báo một loại phòng trên bản đồ. BỐ CỤC: lưới ĐỀU đúng 4 cột × 3 hàng = 12 ô (KHÔNG thêm cột, KHÔNG thêm hàng), các ô bằng nhau, kẻ lưới mảnh màu tối. Mỗi ô đúng MỘT hình, theo thứ tự đọc từ trái sang phải, hết hàng trên mới xuống hàng dưới: ô 1: Điểm bắt đầu: cổng làng nhỏ: hai cột và một mái ngói cong, giữa cổng để trống; ô 2: Đánh thường: một thanh gươm ngắn dựng đứng, mũi hướng lên, có chắn tay ngang; ô 3: Tinh anh: đầu trâu nhìn thẳng với hai sừng cong to vểnh lên; ô 4: Rương báu: rương gỗ nắp vòm, có đai ngang và ổ khoá nhỏ ở giữa; ô 5: Suối hồi: một giọt nước to, đầu nhọn ở trên, bụng tròn ở dưới; ô 6: Thương nhân: túi vải bụng tròn thắt miệng bằng dây, trên thân túi có đồng xu lỗ vuông; ô 7: Thử thách: cái trống hội nhìn nghiêng với hai dùi trống bắt chéo phía trên; ô 8: Lời nguyền: một con mắt mở to hình hạt thóc, tròng mắt tròn ở giữa; ô 9: Trùm: mặt nạ quỷ: đầu tròn, hai sừng nhọn, hai mắt trừng và hàm răng; ô 10: Ổ khoá: ổ khoá đồng cổ: thân vuông, quai cong ở trên, lỗ khoá ở giữa; ô 11: Chìa khoá: chìa khoá đồng cổ nằm chéo: đầu tròn có lỗ, thân thẳng, hai răng; ô 12: Cổng dịch chuyển: vòng tròn xoáy trôn ốc (như hoa văn xoáy trên mặt trống đồng). KIỂU VẼ: trong game mỗi biểu tượng chỉ to 7×7 điểm ảnh nên phải CỰC KỲ đơn giản: một hình khối đặc, to, nhìn chính diện, nhận ra ngay từ hình bóng; chỉ dùng 1 đến 2 màu phẳng sáng (màu chính vàng kem #f6e6b8, thêm tối đa một màu nhấn) và viền tối một nét #1a120a quanh mép; không chi tiết nhỏ, không nét mảnh, không đổ bóng nhiều sắc, không chuyển màu, không phát sáng. Biểu tượng sẽ nằm trên ô phòng màu xanh ngọc đậm nên phải sáng và rõ. CỠ TRONG Ô: mỗi biểu tượng gần vuông, chiếm khoảng 70% ô, nằm giữa ô, nằm TRỌN trong ô, không chạm đường lưới. KHÔNG vẽ: chữ, số, nhãn, tên, chú thích, vòng tròn hay ô nền sau biểu tượng, bảng màu, bóng đổ. Nền trơn MỘT MÀU HỒNG TÍM #FF00FF (không ô cờ, không nền trắng, không chuyển màu), không dùng màu hồng tím ở chỗ nào khác trong hình. Chỉ cần gửi tấm ảnh, không cần code, không cần file json.
```

## Lô 2. Bản đồ · ô phòng và lối nối

Lưới 3 cột × 1 hàng. Các hình (đúng thứ tự), cỡ trong game và mã tệp:

1. Ô phòng thường · 36×28 · `gd-o-phong`
2. Ô đang đứng · 36×28 · `gd-o-phong-cur`
3. Lối nối · 12×5 · `gd-loi-noi`

Prompt:

```text
Dùng công cụ tạo ảnh vẽ MỘT tấm ảnh pixel art 2D gồm ĐÚNG 3 hình dùng để ghép BẢN ĐỒ của game Linh Khí (game hành động pixel art lấy cảm hứng dân gian Việt Nam và hoa văn trống đồng Đông Sơn): hai ô phòng và một đoạn lối nối giữa hai ô. BỐ CỤC: lưới ĐỀU đúng 3 cột × 1 hàng = 3 ô (KHÔNG thêm cột, KHÔNG thêm hàng), các ô bằng nhau, kẻ lưới mảnh màu tối. Mỗi ô đúng MỘT hình, theo thứ tự đọc từ trái sang phải, hết hàng trên mới xuống hàng dưới: ô 1: Ô phòng thường: tấm thẻ chữ nhật nằm ngang (rộng 9 phần, cao 7 phần), nền xanh ngọc đậm #1f5750, viền đồng #a8752f một nét, bốn góc có hoa văn trống đồng rất nhỏ, phần GIỮA để trơn (game đặt biểu tượng lên đó); ô 2: Ô đang đứng: cùng hình dáng và cùng cỡ với ô 1 nhưng nổi bật hơn: nền xanh ngọc sáng #3f9486, viền vàng sáng #fff0c4 dày hơn, phần giữa vẫn để trơn; ô 3: Lối nối: một THANH NGANG ngắn, dẹt (dài 12 phần, dày 5 phần) màu đồng #a8752f như đoạn đường lát đá hoặc đoạn dây thừng, hai đầu trái phải cắt PHẲNG (để nối liền hai ô), không bo tròn, không mũi tên. KIỂU VẼ: phẳng, nhìn thẳng từ trên, khối đơn giản, ít chi tiết vì trên bản đồ nhỏ mỗi ô chỉ to 13×9 điểm ảnh; màu phẳng 2 đến 3 sắc, viền rõ; không chuyển màu, không phát sáng, không bóng đổ. Ô 1 và ô 2 phải là hình CHỮ NHẬT kín, bốn cạnh thẳng, góc vuông (không bo tròn nhiều, không rách mép), vì game kéo giãn hình cho vừa ô. CỠ TRONG Ô: mỗi hình nằm giữa ô lưới, chiếm khoảng 70% bề ngang ô, nằm TRỌN trong ô, không chạm đường lưới. KHÔNG vẽ: chữ, số, nhãn, biểu tượng bên trong ô phòng, mũi tên, bảng màu. Nền trơn MỘT MÀU HỒNG TÍM #FF00FF (không ô cờ, không nền trắng, không chuyển màu), không dùng màu hồng tím ở chỗ nào khác trong hình. Chỉ cần gửi tấm ảnh, không cần code, không cần file json.
```

## Lô 3. Bản đồ · khung bản đồ to

Một ảnh. Cỡ trong game và mã tệp:

1. Khung bản đồ to · 380×242 · `gd-khung-ban-do`

Prompt:

```text
Dùng công cụ tạo ảnh vẽ MỘT tấm ảnh pixel art 2D: MỘT cái KHUNG trang trí cho bảng BẢN ĐỒ của game Linh Khí (game hành động pixel art lấy cảm hứng dân gian Việt Nam và hoa văn trống đồng Đông Sơn). BỐ CỤC: ảnh nằm ngang, tỉ lệ rộng 11 phần, cao 7 phần. Khung là một hình chữ nhật kín chạy sát bốn mép ảnh. VIỀN khung bằng đồng (màu #a8752f, #d9a441, #5a3d1a), dày ĐỀU khoảng 1/30 bề ngang ảnh, khắc hoa văn trống đồng Đông Sơn (răng cưa, vòng tròn tiếp tuyến, chim Lạc nhỏ); bốn GÓC có hoa văn to hơn một chút (ngôi sao trống đồng) nhưng không lấn sâu vào trong. Cạnh trên, dưới, trái, phải thẳng và lặp đều (game có thể kéo giãn các cạnh). PHẦN GIỮA khung để TRỐNG hoàn toàn: tô kín đúng màu nền hồng tím #FF00FF (game tự lót nền tối, vẽ bản đồ, chú giải và chữ vào đó). KIỂU VẼ: pixel art, màu phẳng, đổ bóng 3 sắc (tối, vừa, sáng), viền tối một nét #1a120a ở mép ngoài và mép trong của khung; không chuyển màu, không phát sáng, không nhoè. KHÔNG vẽ: chữ, số, tiêu đề, bản đồ, biểu tượng, dây treo, bóng đổ, bất cứ thứ gì ở phần giữa. Nền trơn MỘT MÀU HỒNG TÍM #FF00FF (không ô cờ, không nền trắng, không chuyển màu), không dùng màu hồng tím ở chỗ nào khác trong hình. Chỉ cần gửi tấm ảnh, không cần code, không cần file json.
```

## Lô 4. Nút điều khiển · 18 biểu tượng (chỉ xuất tệp, game chưa dùng)

Lưới 5 cột × 4 hàng. Các hình (đúng thứ tự), cỡ trong game và mã tệp:

1. Đánh · Kiếm · 24×24 · `gd-nut-danh-sword`
2. Đánh · Cung · 24×24 · `gd-nut-danh-bow`
3. Đánh · Giáo · 24×24 · `gd-nut-danh-spear`
4. Đánh · Búa · 24×24 · `gd-nut-danh-hammer`
5. Đặc biệt · Kiếm · 24×24 · `gd-nut-dac-biet-sword`
6. Đặc biệt · Cung · 24×24 · `gd-nut-dac-biet-bow`
7. Đặc biệt · Giáo · 24×24 · `gd-nut-dac-biet-spear`
8. Đặc biệt · Búa · 24×24 · `gd-nut-dac-biet-hammer`
9. Kỹ năng · Thợ rèn · 24×24 · `gd-nut-ky-nang-smith`
10. Kỹ năng · Thợ săn · 24×24 · `gd-nut-ky-nang-hunter`
11. Kỹ năng · Thầy thuốc · 24×24 · `gd-nut-ky-nang-healer`
12. Kỹ năng · Đô vật · 24×24 · `gd-nut-ky-nang-wrestler`
13. Chưởng · Lửa · 24×24 · `gd-nut-chuong-fire`
14. Chưởng · Độc · 24×24 · `gd-nut-chuong-poison`
15. Chưởng · Băng · 24×24 · `gd-nut-chuong-ice`
16. Né · 24×24 · `gd-nut-ne`
17. Bình máu · 24×24 · `gd-nut-binh-mau`
18. Tạm dừng · 24×24 · `gd-nut-tam-dung`

Prompt:

```text
Dùng công cụ tạo ảnh vẽ MỘT tấm ảnh pixel art 2D gồm ĐÚNG 18 biểu tượng cho các NÚT ĐIỀU KHIỂN của game Linh Khí (game hành động pixel art lấy cảm hứng dân gian Việt Nam và hoa văn trống đồng Đông Sơn). Mỗi biểu tượng nằm trên mặt một nút tròn trong trận đánh. BỐ CỤC: lưới ĐỀU đúng 5 cột × 4 hàng = 20 ô (KHÔNG thêm cột, KHÔNG thêm hàng), các ô bằng nhau, kẻ lưới mảnh màu tối. Mỗi ô đúng MỘT hình, theo thứ tự đọc từ trái sang phải, hết hàng trên mới xuống hàng dưới: ô 1: Đánh · Kiếm: thanh kiếm chéo, mũi hướng lên phải; ô 2: Đánh · Cung: cây cung đã lắp tên, mũi tên hướng sang phải; ô 3: Đánh · Giáo: ngọn giáo chéo, mũi hướng lên phải; ô 4: Đánh · Búa: cây búa đầu to chéo, đầu búa ở trên phải; ô 5: Đặc biệt · Kiếm: Trảm Nguyệt: vệt chém hình trăng lưỡi liềm đang bay; ô 6: Đặc biệt · Cung: Mưa tên: ba mũi tên cắm chéo xuống; ô 7: Đặc biệt · Giáo: Phi Thương: ngọn giáo bay chéo lên có vệt gió; ô 8: Đặc biệt · Búa: Địa Chấn: búa nện xuống đất, mặt đất nứt toác; ô 9: Kỹ năng · Thợ rèn: Nung: lưỡi kiếm đỏ rực trong ngọn lửa; ô 10: Kỹ năng · Thợ săn: Đặt bẫy: cái bẫy kẹp há miệng có răng cưa; ô 11: Kỹ năng · Thầy thuốc: Bình thuốc: bầu hồ lô thuốc xanh sủi bọt; ô 12: Kỹ năng · Đô vật: Gồng: nắm đấm siết chặt, lực toả ra xung quanh; ô 13: Chưởng · Lửa: quả cầu lửa cam bay sang phải, đuôi lửa kéo về sau; ô 14: Chưởng · Độc: cục độc xanh lá bay sang phải, nhỏ giọt; ô 15: Chưởng · Băng: mũi băng nhọn xanh nhạt bay sang phải; ô 16: Né: mũi tên to chỉ sang phải kèm ba vệt gió phía sau; ô 17: Bình máu: bầu hồ lô đựng thuốc đỏ, nút lá; ô 18: Tạm dừng: hai thanh dọc song song. Ô 19 đến ô 20 (cuối hàng dưới) để TRỐNG hoàn toàn. KIỂU VẼ: trong game mỗi biểu tượng chỉ to khoảng 24×24 điểm ảnh: khối to, đậm, đơn giản, nhìn là hiểu ngay; màu phẳng, đổ bóng 3 sắc (tối, vừa, sáng), viền tối một nét #140e0c quanh mép; không chuyển màu, không phát sáng, không nhoè. CỠ TRONG Ô: mỗi biểu tượng gần vuông, chiếm khoảng 70% ô, nằm giữa ô, nằm TRỌN trong ô, không chạm đường lưới. KHÔNG vẽ: chữ, số, nhãn, tên, vòng tròn hay mặt nút phía sau biểu tượng (game tự vẽ nút), tay người, bảng màu, bóng đổ. Nền trơn MỘT MÀU HỒNG TÍM #FF00FF (không ô cờ, không nền trắng, không chuyển màu), không dùng màu hồng tím ở chỗ nào khác trong hình. Chỉ cần gửi tấm ảnh, không cần code, không cần file json.
```
