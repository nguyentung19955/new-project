# Prompt vẽ: Làng · 6 công trình lớn (phiên D1)

Chép nguyên từ trang công cụ https://spiritblade.web.app/tach-lang.html (bước 1, nút "Sao chép prompt vẽ"). Nếu trang và tệp này khác nhau thì lấy theo trang.

## Cách dùng

1. Mở trang Tách Làng, bấm **Sao chép prompt vẽ**.
2. Lưu 2 ảnh tham chiếu ở ngay dưới nút đó (bấm "Lưu / gửi ảnh 1", "Lưu / gửi ảnh 2"). Bản chụp sẵn cũng nằm cạnh tệp này:
   - `tham-chieu-1-canh-lang.png`: cảnh làng hiện tại, màu ban ngày.
   - `tham-chieu-2-cong-trinh.png`: 6 công trình hiện tại, xếp đúng lưới và đúng thứ tự.
3. Dán prompt vào ChatGPT, **gửi kèm cả 2 ảnh**.
4. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang.

## Lô "Làng · 6 công trình lớn"

Lưới 3 cột × 2 hàng, nền hồng tím `#FF00FF`, ảnh ngang tỉ lệ 3:2. Kiểu tệp `giao-dien`, nét gấp đôi (`"net": 2`), tải ra 2 bản.

| Ô | Hình | Mã tệp | Cỡ trong game (điểm ảnh) |
|---|---|---|---|
| 1 | Cổng làng | `gd-lang-cong` | 62 × 56 |
| 2 | Đình làng | `gd-lang-dinh` | 144 × 70 |
| 3 | Cây đa | `gd-lang-cay-da` | 103 × 82 |
| 4 | Lò rèn | `gd-lang-lo-ren` | 84 × 71 |
| 5 | Sạp hàng xén | `gd-lang-hang-xen` | 73 × 55 |
| 6 | Nhà thợ may | `gd-lang-nha-may` | 77 × 54 |

### Prompt (dán thẳng vào ChatGPT, kèm 2 ảnh tham chiếu)

```
Dùng công cụ tạo ảnh vẽ MỘT tấm ảnh pixel art 2D gồm ĐÚNG 6 CÔNG TRÌNH của một ngôi làng Bắc Bộ Việt Nam xưa, dùng cho cảnh làng của game Linh Khí (game hành động pixel art lấy cảm hứng dân gian Việt Nam và hoa văn trống đồng Đông Sơn). ẢNH THAM CHIẾU: tôi gửi kèm 2 ảnh chụp từ game. Ảnh 1 là cảnh làng hiện tại (để thấy góc nhìn, tỉ lệ và không khí chung). Ảnh 2 là 6 công trình hiện tại xếp đúng lưới và đúng thứ tự cần vẽ. Hãy VẼ LẠI từng công trình cho đẹp hơn, nhiều chi tiết hơn, đậm chất kiến trúc dân gian Bắc Bộ (mái ngói mũi hài, đầu đao cong, cột gỗ, mái rạ, tường gạch, vách đất), nhưng GIỮ ĐÚNG hình dáng chung, tỉ lệ rộng so với cao, hướng nhìn và VỊ TRÍ các bộ phận như trong ảnh 2 (cửa, mái, đèn lồng, miệng lò, ống khói, thân cây), vì game vẽ thêm lửa, khói và ánh đèn đè lên đúng các chỗ đó. BỐ CỤC: ảnh nằm ngang tỉ lệ 3:2, chia lưới ĐỀU đúng 3 cột × 2 hàng = 6 ô (KHÔNG thêm cột, KHÔNG thêm hàng), các ô bằng nhau, kẻ lưới mảnh màu tối. Mỗi ô đúng MỘT hình, theo thứ tự đọc từ trái sang phải, hết hàng trên mới xuống hàng dưới: ô 1: Cổng làng (trong game rộng 62 × cao 56 điểm ảnh): cổng làng xây gạch kiểu Bắc Bộ nhìn thẳng mặt trước: HAI TRỤ gạch vuông màu đỏ nâu, mỗi trụ đội một mái ngói nhỏ; nối hai đầu trụ là xà ngang có một tấm BIỂN tối màu viền vàng (biển để TRỐNG, không chữ); trên cùng là mái ngói đỏ sẫm hai tầng, hai đầu mái hơi cong lên; lòng cổng ở giữa mở, tối, thấy lối đất đi vào; hai chiếc đèn lồng đỏ treo ở mé NGOÀI hai trụ (một bên trái, một bên phải), ngang lưng trụ; ô 2: Đình làng (trong game rộng 144 × cao 70 điểm ảnh): đình làng Bắc Bộ năm gian nhìn thẳng mặt trước, là hình RỘNG nhất lô (rộng gấp đôi cao): thềm đá xám thấp chạy suốt bề ngang, giữa thềm có bậc tam cấp; hàng SÁU cột gỗ sơn đỏ; gian giữa là cửa chính mở, bên trong tối, thấy bàn thờ có ánh nến vàng; hai gian ngoài cùng có cửa sổ chấn song gỗ; MÁI NGÓI đỏ nâu rất to, chiếm hơn nửa chiều cao, xoè rộng hơn thân đình, bốn ĐẦU ĐAO cong vút lên; bờ nóc sẫm màu, chính giữa nóc có mặt trời tròn vàng nhân đỏ; hai chiếc đèn lồng đỏ treo dưới hiên, hai bên cửa chính; ô 3: Cây đa (trong game rộng 103 × cao 82 điểm ảnh): cây đa cổ thụ đầu làng: THÂN to xù xì màu nâu đứng CHÍNH GIỮA, gốc bạnh ra, rễ nổi; TÁN lá xanh rậm chia nhiều cụm tròn, xoè rộng gấp năm lần thân; vài rễ phụ mảnh buông thõng từ tán xuống gần đất ở hai bên thân; quanh thân buộc một dải vải ĐỎ (cây thiêng); ba chiếc đèn lồng đỏ nhỏ treo dưới tán (hai chiếc bên trái, một chiếc bên phải); ô 4: Lò rèn (trong game rộng 84 × cao 71 điểm ảnh): lán rèn mái rạ vàng trên các cột gỗ, mặt trước để trống: ở một phần ba BÊN TRÁI, sát đất, là LÒ gạch đỏ nâu có MIỆNG LÒ vòm quay ra trước, trong miệng lò là than hồng đỏ cam (không vẽ ngọn lửa to, game tự vẽ lửa); ỐNG KHÓI gạch dựng ngay phía trên lò, nhô cao khỏi mái ở phía trên bên trái (không vẽ khói, game tự vẽ khói); BÊN PHẢI dưới mái là giá gỗ treo một thanh kiếm và một cây búa; một chiếc đèn lồng đỏ treo dưới mép mái bên phải; KHÔNG vẽ cái đe, KHÔNG vẽ người thợ; ô 5: Sạp hàng xén (trong game rộng 73 × cao 55 điểm ảnh): sạp hàng xén ngoài trời: CHÍNH GIỮA là một chiếc Ô vải vàng to, cán gỗ cắm thẳng xuống đất; bên TRÁI dưới ô là đôi quang gánh (đòn gánh tre, thúng đựng quả đỏ và rau xanh); bên PHẢI là một chiếc RƯƠNG gỗ nâu có đai đồng và khoá vàng, phía trước rương trải tấm khăn đỏ nâu bày hàng nhỏ nhiều màu (cuộn chỉ, lược, gương: xanh lam, vàng, trắng, xanh lá; không dùng màu hồng, tím); KHÔNG vẽ người bán; ô 6: Nhà thợ may (trong game rộng 77 × cao 54 điểm ảnh): nhà tranh vách đất của cô thợ may nhìn thẳng mặt trước: MÁI RẠ vàng dày, xoè rộng hơn tường, chiếm gần nửa chiều cao; tường đất màu vàng nhạt, có kèo gỗ nâu chạy ngang dưới mái và sát chân tường; CỬA ra vào mở, tối, nằm giữa hơi lệch trái; một CỬA SỔ chấn song gỗ ở bên phải cửa; một chiếc đèn lồng đỏ treo dưới mái ở bên TRÁI cửa; KHÔNG vẽ khung cửi, dây phơi, người. GÓC NHÌN: giống hệt ảnh tham chiếu: nhìn thẳng vào mặt trước công trình, hơi từ trên cao xuống (kiểu game nhập vai 2D nhìn chếch từ trên), không phối cảnh xa gần, không nghiêng, không xoay. ÁNH SÁNG VÀ MÀU: vẽ màu BAN NGÀY sáng rõ, nắng đều từ phía trên bên trái; KHÔNG vẽ trời tối, KHÔNG vẽ quầng sáng quanh đèn lồng hay quanh lửa (game tự phủ màu chạng vạng và tự làm đèn, lửa sáng lên). Màu chính: ngói đỏ nâu, gạch đỏ nâu, gỗ nâu, cột sơn đỏ, rạ vàng, đá xám, lá xanh đậm, đèn lồng đỏ ruột vàng. KIỂU VẼ: pixel art, màu phẳng, đổ bóng 3 sắc (tối, vừa, sáng), viền tối một nét #1a1420 quanh mép từng công trình; không chuyển màu mượt, không nhoè, không phát sáng. Cả 6 hình cùng một kiểu vẽ, cùng bảng màu, cùng cỡ điểm ảnh. CỠ TRONG Ô: mỗi công trình nằm giữa ô, to hết mức nhưng vẫn nằm TRỌN trong ô, cách đường lưới một khoảng, không chạm đường lưới; giữ đúng tỉ lệ rộng so với cao đã ghi ở từng ô. CHÂN công trình là một đường ngang phẳng ở đáy hình, và công trình cân giữa theo chiều ngang (game đặt điểm giữa đáy hình xuống mặt đất). KHÔNG vẽ: chữ, số, nhãn, tên, chú thích; người, con vật; mặt đất, cỏ, đường đi, hàng rào, bóng đổ xuống đất dưới chân công trình; mây, trời, bảng màu; bất cứ thứ gì nằm ngoài công trình. Nền trơn MỘT MÀU HỒNG TÍM #FF00FF (không ô cờ, không nền trắng, không chuyển màu), không dùng màu hồng tím ở chỗ nào khác trong hình. Chỉ cần gửi tấm ảnh, không cần code, không cần file json.
```

## Dung lượng ảnh thêm vào

- Phiên này thêm **0 MB** ảnh vào game (chưa có ảnh thật nào; `game/art/custom` không đổi).
- Ước lượng khi có đủ 6 ảnh thật: 6 tệp ảnh mẫu tự dựng (nét gấp đôi, 48 màu) nặng tổng cộng 42 KB. Ảnh ChatGPT nhiều chi tiết hơn nên có thể nặng gấp 2 đến 3 lần, tức khoảng 0,1 MB cho cả lô. Không đáng kể so với bản gói hiện khoảng 10 MB.
- Thư mục báo cáo này thêm khoảng 0,6 MB vào repo (ảnh kiểm và 2 ảnh tham chiếu), không vào game.
