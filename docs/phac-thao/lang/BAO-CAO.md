# Làng có người: tờ phác thảo để duyệt

Yêu cầu của chủ dự án: giao diện phá cách, "các nút chức năng chuyển thành người".
Phiên này chỉ thiết kế và vẽ phác thảo. Chưa sửa dòng mã game nào.

## Ý chính

- Màn làng không còn danh sách nút. Làng là một cảnh nhìn từ trên xuống chếch, cùng góc nhìn với phòng trong ải.
- Em bé hero đi tám hướng bằng cần điều khiển. Vũ khí sống bay theo sau.
- Mỗi chức năng là một người đứng cạnh công trình của mình. Có bảy người.
- Tới gần một người: người đó ngẩng lên, nút Đánh đổi thành "Nói chuyện". Chạm thẳng vào người cũng được.
- Mép trên màn hình có dải bảy khuôn mặt. Chạm một mặt là em bé tự chạy tới và mở bảng luôn.
- Ai có việc mới thì có dấu chấm than vàng trên đầu, và chấm đỏ trên khuôn mặt ở dải lối tắt.

## Các ảnh

| Ảnh | Nội dung |
|---|---|
| `lang-toan-canh.png` | Toàn cảnh làng, phóng 3 lần, có đánh số từng người |
| `nguoi-trong-lang.png` | Từng người phóng 6 lần: câu thoại, động tác khi rảnh, hình khi có việc mới |
| `tuong-tac.png` | Bốn bước nói chuyện với thợ rèn, và dải lối tắt |
| `hai-bo-cuc.png` | So sánh làng rộng và làng vừa một màn hình |
| `ban-do-vung.png` | Bản đồ vùng dạng tranh vẽ |
| `tren-man-hinh-that.png` | Ghép lên khung điện thoại, có vẽ chỗ ngón tay che |

## Chức năng nào thuộc người nào

Bảng này phủ hết mọi thứ đang có trong `game/js/village.js`.

| Chức năng đang có | Ở đâu trong mã | Giao cho ai |
|---|---|---|
| Vào ải: chọn vùng, chọn ải, xem sao, thưởng, gợi ý cấp, nút Bắt đầu | bảng "Bản đồ: chọn ải" | **Chú Lái Đò** ở bến đò. Mở ra là tranh bản đồ, nút thành "Lên đò" |
| Đổi độ khó thường và độ khó 2 | bảng Bản đồ | **Chú Lái Đò** (một dòng trong thẻ ải) |
| Mài vũ khí | Lò rèn, thẻ Mài | **Ông Thợ Rèn** ở lò rèn |
| Nâng bậc (Thường, Lam, Tím, Vàng theo trùm) | Lò rèn, thẻ Nâng bậc | **Ông Thợ Rèn** |
| Tôi lại (đổi hệ bằng đá tôi) | Lò rèn, thẻ Tôi lại | **Ông Thợ Rèn** |
| Rèn đồ (mũ, áo) | Lò rèn, thẻ Rèn đồ | **Ông Thợ Rèn** |
| Nâng lò | Lò rèn, thẻ Nâng lò | **Ông Thợ Rèn** |
| Rương vũ khí, chọn hai món đang mang, lật trang | bảng Trang bị, nửa trái | **Bà Hàng Xén** ở gánh hàng (có cái rương cạnh bà) |
| Bán vũ khí lấy vàng | bảng Trang bị, nút Bán | **Bà Hàng Xén** |
| Đổi mũ, áo, bùa | bảng Trang bị, nửa phải | **Cô Thợ May** ở khung cửi |
| Trang phục sắp có: đồ đeo lưng, cánh | chưa có | **Cô Thợ May** (đã chừa chỗ) |
| Chọn hero, xem chỉ số, sở trường, nội tại, kỹ năng | bảng "Hero và kỹ năng", nửa trái | **Ông Từ** ở sân đình. Ba bé còn lại ngồi chơi trong sân, chạm vào bé nào là đổi sang bé đó |
| Cây kỹ năng: học ba nhánh Công, Thủ, Hệ; đặt lại điểm | bảng "Hero và kỹ năng", nửa phải | **Cụ Đồ** dưới gốc đa |
| Hướng dẫn ba trang | bảng Hướng dẫn | **Cụ Đồ** |
| Xem vũ khí (bậc, dòng phụ, đặc trưng hệ) | bảng Xem vũ khí | Chạm vào **vũ khí sống** đang bay theo em bé. Ở chỗ Bà Hàng Xén vẫn có nút Xem cho món trong rương |
| Cài đặt: âm thanh, toàn màn hình, xoá tiến trình (có hỏi lại) | bảng Cài đặt | **Anh Mõ** ở cổng làng |
| Dòng tài nguyên: vàng, quặng, đá tôi, nguyên liệu ba vùng, mảnh trùm | dải trên cùng | Giữ nguyên ở mép trên |
| Thẻ hero ở góc phải: cấp, máu, mana, hai vũ khí, mũ áo | màn làng cũ | Bỏ thẻ. Tên và cấp lên dải trên cùng. Em bé và vũ khí thì nhìn thấy ngay trong làng |
| Báo "còn điểm kỹ năng chưa dùng" | màn làng cũ | Dấu chấm than trên đầu Cụ Đồ |
| Màn tiêu đề "Chạm để bắt đầu", phím Esc đóng bảng | cuối file | Giữ nguyên |

Có hai bảng cũ bị tách đôi: Trang bị (vũ khí về Bà Hàng Xén, mũ áo bùa về Cô Thợ May) và Hero và kỹ năng (chọn hero về Ông Từ, cây kỹ năng về Cụ Đồ). Tách ra thì mỗi bảng nhỏ hơn và đủ chỗ cho người đứng cạnh.

Con cóc ở giếng chỉ để vui, không giữ chức năng nào.

## Bố cục khuyên chọn: làng rộng 1,5 màn hình

Khuyên chọn phương án A trong `hai-bo-cuc.png`: làng rộng 720 điểm (màn hình 480), màn hình trượt ngang theo em bé.

Lý do:

1. Trên điện thoại hai ngón cái che hai góc dưới. Làng một màn hình chỉ còn dùng được khoảng hai phần ba, bảy người phải đứng sát nhau và vẽ nhỏ.
2. Làng rộng thì cảnh trượt, không ai bị ngón tay che mãi.
3. Từ ải về, em bé xuống đò ở bến bên phải. Bốn người hay dùng nhất (lái đò, thợ rèn, hàng xén, thợ may) nằm ngay màn hình đầu tiên. Ba người ít dùng (cụ đồ, ông từ, anh mõ) nằm bên trái.
4. Còn đất để thêm người mới sau này.

Cách xếp trong màn hình: người đứng ở hàng trên và hàng giữa. Hàng dưới chỉ có ao sen, giếng, cây rơm, đàn gà.

Khi mở bảng: bảng nằm bên phải, người đứng bên trái và nói một câu. Nút chính của bảng rơi đúng chỗ ngón phải vẫn bấm nút Đánh.

## Ước lượng công làm thật

Tính theo phiên làm việc như phiên này.

| Việc | Công |
|---|---|
| Vẽ làng thật vào game (nền, công trình, đèn, đom đóm) | 2 phiên |
| Bảy người, mỗi người 3 khung động tác, hình ngẩng lên | 1 đến 2 phiên |
| Mã đi lại trong làng, màn hình trượt, tới gần thì hiện bong bóng, nút "Nói chuyện" | 1 đến 2 phiên |
| Dải lối tắt, chạm vào người thì tự chạy tới, dấu chấm than | 1 phiên |
| Chuyển sáu bảng cũ sang kiểu "bảng cạnh người", tách hai bảng | 1 đến 2 phiên |
| Bản đồ vùng dạng tranh | 1 đến 2 phiên |
| Thử trên điện thoại, sửa chỗ khó chạm | 1 phiên |
| **Tổng** | **khoảng 8 đến 12 phiên** |

Có thể làm từng bước: bước đầu chỉ cần làng, người và nút "Nói chuyện" mở lại đúng các bảng cũ. Tranh bản đồ và việc tách bảng làm sau.

## Rủi ro

- **Chậm hơn bấm nút.** Em bé đi 72 điểm mỗi giây. Từ bến đò sang cổng làng mất chừng 7 giây. Cách giảm: dải lối tắt, chạm thẳng vào người, và cho em bé chạy nhanh gấp rưỡi khi ở làng.
- **Người mới chưa biết ai làm gì.** Cách giảm: bong bóng ghi tên chức năng ("Lò rèn") chứ không ghi tên người; lần đầu vào làng Anh Mõ rao và dẫn đi một vòng.
- **Khó chạm trúng.** Người cao khoảng 30 điểm, khá nhỏ trên điện thoại. Vùng chạm phải rộng hơn hình, và khuôn mặt ở dải lối tắt phải đủ to. Cần thử trên máy thật.
- **Trời chạng vạng làm hình tối.** Phác thảo đang để trời tối cho có đèn lồng và đom đóm. Nếu thấy khó nhìn thì đổi sang ban ngày, đêm chỉ dùng cho độ khó 2.
- **Tách bảng Trang bị làm hai** có thể làm người chơi cũ lạ tay lúc đầu.
- **Tốn công vẽ hơn** màn làng hiện tại nhiều lần.

## Điều cần chủ dự án quyết

1. Chọn làng rộng (A) hay làng một màn hình (B)?
2. Giữ trời chạng vạng hay đổi sang ban ngày?
3. Đồng ý tách bảng Trang bị và bảng Hero như bảng trên không?
4. Tên và dáng bảy người có cần đổi ai không?

## Ghi chú thật thà

- Các ảnh do mã vẽ trong `nguon/` dựng ra, chưa phải hình chạy trong game. Em bé hero và vũ khí sống thì lấy thẳng từ mã game nên giống hệt.
- Động tác khi rảnh của vài người (lái đò, ông từ, cô thợ may) mới khác nhau ít giữa các khung. Lúc làm thật cần vẽ rõ hơn.
- Bảng lò rèn và thẻ ải trong ảnh là hình mẫu, số liệu chỉ để minh hoạ.
- Dựng lại ảnh: `python3 docs/phac-thao/lang/nguon/dung.py`.
