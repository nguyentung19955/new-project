# Báo cáo phiên "hieu-ung-b1" — đạn quái, bom, mũi tên mang hệ

Ngày 11/10/2026. Làn B (Hiệu ứng), phiên B1 theo `docs/review/kiem-ke-hinh-code.md` mục 6.4 và bảng 3.11.

## Đã làm gì

1. **Trang công cụ** https://spiritblade.web.app/tach-hieu-ung.html có thêm **14 mục mới ở cuối** ô chọn hiệu ứng. Mỗi mục có prompt riêng để dán thẳng vào ChatGPT (chép nguyên văn ở `PROMPT.md` cùng thư mục).
2. **Game đọc được 14 ảnh đó.** Đặt tệp `hu-….sprite.json` vào `game/art/custom/` là game dùng ảnh thay cho hình vẽ bằng code. **Chưa có tệp nào thì game vẽ y như cũ.**

## 14 hình của lô này

| Mã tệp | Hình | Hiện ở đâu trong game |
|---|---|---|
| `hu-dan-bot` | Đạn bọt nước | Quái vùng Hang biển bắn |
| `hu-dan-gai-bang` | Đạn gai băng | Quái gai và quái vùng Hang biển (game xoay theo hướng bay) |
| `hu-dan-hat-doc` | Đạn hạt độc | Quái vùng Rừng già (xoay theo hướng bay) |
| `hu-dan-lua` | Đạn cục lửa | Quái và trùm vùng Lâu đài cổ (xoay, vẽ kiểu ánh sáng) |
| `hu-dan-bua` | Đạn lá bùa | Chiêu "Bùa bay" của trùm Mộc Tinh |
| `hu-dan-phao` | Đạn bi sắt | Quái vùng Lâu đài cổ |
| `hu-dan-cau` | Đạn cầu thường | Quái bắn xa không mang hệ |
| `hu-dan-gai` | Đạn gai thường | Quái gai (nhím) không mang hệ (xoay theo hướng bay) |
| `hu-bom-bang` | Bom băng | Sứa thả, Hải Quỳ ném, bom ở vùng băng |
| `hu-bom-phao` | Bó pháo | Tiểu Yêu Ném Pháo, bom ở vùng lửa |
| `hu-bom-to` | Bom to | Quái tinh anh có dấu "nổ" để lại khi chết |
| `hu-dan-ten-fire` | Mũi tên Lửa | Cung của em bé khi mang hệ Lửa |
| `hu-dan-ten-poison` | Mũi tên Độc | Cung của em bé khi mang hệ Độc |
| `hu-dan-ten-ice` | Mũi tên Băng | Cung của em bé khi mang hệ Băng |

Những thứ **vẫn vẽ bằng code** (đúng luật "đỏ dành cho báo nguy hiểm"): quầng đỏ và chấm đỏ nhấp nháy trên đạn quái, vệt bay, vòng đỏ đếm ngược của bom, bóng dưới bom, tia ngòi nhấp nháy nhanh dần khi bom sắp nổ, quầng sáng và vệt bay của mũi tên. Vụ nổ của bom đã dùng ảnh nổ lửa/độc/băng có từ trước (`hu-no-*`), không cần làm thêm.

## Tệp đã sửa

- `game/js/fx_dan.js`: bảng "kiểu đạn → mã ảnh" cho đạn quái; mũi tên mang hệ chọn ảnh theo hệ.
- `game/js/fx_he.js`: thêm 1 dòng, khi đã có ảnh mũi tên hệ thì không vẽ chồng lửa/nhớt/băng bằng code nữa.
- `game/js/mobs.js` (chỉ hàm `drawBomb`): chọn ảnh bom theo loại.
- `tools/tach-hieu-ung/index.html`: 14 mục mới ở cuối mảng `HU`; prompt của mục mới có thêm câu "cỡ trong game" và "nét lạ".
- `game/dist/*`: do `build.py` tạo lại.

Không đổi lối chơi, bản lưu, đăng nhập, lưu mây. Không có chữ mới hiện cho người chơi nên không phải thêm vào từ điển song ngữ. Không thêm ảnh nào vào `game/art/custom`.

## Đã kiểm (một lượt Playwright, ảnh ở `anh-kiem.png` và `anh-kiem-trang-tach.png`)

- `node --check` mọi tệp JS, bài kiểm lưu mây, `python3 game/build.py`: đều qua.
- **Trang tách:** dựng 14 dải mẫu bằng máy (nền đúng màu prompt, có kẻ lưới), đưa lần lượt vào trang ở cỡ màn iPhone: cả 14 đều **ĐẠT**, tệp có `"net": 2`, tải ra đủ 2 bản (gấp đôi + thường), trang không cuộn ngang, không lỗi. 18 prompt cũ không đổi một chữ.
- **Không có tệp mới = y hệt cũ:** vẽ đủ mọi kiểu đạn theo 8 hướng, đạn to của trùm, tên thường và tên 3 hệ, 9 kiểu bom (đang bay và đang nằm) bằng bản cũ và bản mới rồi so từng điểm ảnh: **khác 0 điểm ảnh**. (Riêng hàng "quả nổ của quái khác" thì khác, xem mục dưới.)
- **Nạp tạm 14 dải mẫu vào game:** hình hiện đúng chỗ, đúng cỡ, xoay đúng hướng bay; đạn tròn không bị lật; lá bùa và bi sắt lật khi bay sang trái; bom đứng trên mặt đất, tia ngòi ở trên đỉnh. Thử trong 3 phòng thật (Lâu đài cổ, Hang biển, Rừng già) có quái bắn, quái ném bom và em bé bắn cung mang hệ: thấy ảnh mẫu bay đúng hướng, không lỗi console. Tệp mẫu chỉ nạp trong lúc thử, không nằm trong kho mã.

## Những chỗ tự quyết (cần bạn biết)

1. **Quả nổ của quái khác dùng lại ảnh Quả nổ của sóc** (`hu-dan-qua-no`), đúng theo kế hoạch. Tệp này đã có trong game, nên đây là **chỗ duy nhất đổi hình ngay bây giờ**: viên đạn kiểu "quả" của quái kiểu cũ ở vùng Rừng già và Hang biển giờ là ảnh quả nổ tím thay cho quả tròn vẽ bằng code. Kiểu đạn này rất hiếm gặp (quái hình mới không bắn kiểu này).
2. **Đạn cầu, đạn gai thường và bom to chỉ có một màu.** Trong code ba hình này đổi màu theo loài quái hoặc theo vùng; ảnh thì một màu trung tính (trắng ngà, ngà nâu, gang xám). Quầng và vệt bay vẫn giữ màu của quái.
3. **Đạn gai thường làm khung 16×8** thay vì 14×6 như đề xuất trong bản kiểm kê: khung cao 6 thì hình chỉ còn cao 2 điểm ảnh, quá mảnh.
4. **Bom to hơn hình code.** Bom code là ô vuông 6×6 (bom to 10×10); ảnh bom cao khoảng 14 (bom to 18) theo đề xuất trong bản kiểm kê, nhìn rõ hơn. Vùng nổ không đổi. Muốn nhỏ lại thì chỉnh ô "Cỡ trong game (hệ số)" trên trang tách.
5. **Bom vùng độc của quái khác Sóc** (hiện chưa có quái nào như vậy) vẫn vẽ bằng code.
6. **Màu:** bó pháo và nét vẽ trên lá bùa dùng đỏ gạch sẫm / nâu đỏ, không dùng đỏ tươi. Hạt độc và tên độc chỉ dùng xanh lá, không dùng tím (để tách nền hồng tím không bị ăn mất hình). Nền vẽ: xanh dương cho hình sáng (lửa, bùa, cầu, bó pháo, tên lửa), hồng tím cho hình tối, băng và độc.
7. Mã tên hệ đặt theo kế hoạch: `-fire`, `-poison`, `-ice` (các dải cũ dùng `-lua`, `-doc`, `-bang`; hai kiểu tên cùng tồn tại, không ảnh hưởng gì).
8. Điểm neo của đạn là **giữa hình**. Với đạn có đuôi (cục lửa) đầu đạn sẽ nằm trước tâm vài điểm ảnh; nếu thấy lệch thì chỉnh "Neo x" trên trang tách.

## Dung lượng

- Ảnh thêm vào game ở phiên này: **0 KB** (chưa có ảnh thật).
- Bản gói `linh-khi.html`: khoảng 10,4 MB, phần mã của phiên này thêm chừng 3 KB.
- Khi bạn vẽ đủ 14 dải: ước thêm 30 đến 70 KB tất cả (3 dải đạn đang có nặng 2,4 đến 4,9 KB mỗi dải).

## Bạn cần làm gì

1. Mở https://spiritblade.web.app/tach-hieu-ung.html, chọn một trong 14 mục cuối, bấm **Sao chép prompt vẽ**, dán vào ChatGPT, lưu ảnh về máy.
2. Đưa ảnh vào trang. Thấy **ĐẠT** thì bấm **Tải** và gửi tệp cho Claude để đưa vào game.
3. Đạn và tên rất nhỏ (cao 4 đến 10 điểm ảnh trong game): nếu ChatGPT vẽ quá nhiều chi tiết thì nhờ vẽ lại "đơn giản hơn, khối to hơn".

## Phiên sau của làn B

B2 (đòn cận chiến và chiêu) sửa tiếp `fx_he.js`, `fx.js`, `fx_chuong.js` và thêm mục vào cuối mảng `HU`, sau 14 mục của phiên này.
