# Báo cáo phiên "hieu-ung-b3" — nổ, trạng thái, trùm, cổng

Ngày 11/10/2026. Làn B (Hiệu ứng), phiên B3 theo `docs/review/kiem-ke-hinh-code.md` mục 6.4 và bảng 3.11. Nối tiếp B1 và B2.

## Đã làm gì

1. **Trang công cụ** https://spiritblade.web.app/tach-hieu-ung.html có thêm **15 mục mới ở cuối** ô chọn hiệu ứng (sau 8 mục của B2). Mỗi mục có prompt riêng để dán thẳng vào ChatGPT (chép nguyên văn ở `PROMPT.md` cùng thư mục).
2. **Game đọc được 15 ảnh đó.** Đặt tệp `hu-….sprite.json` vào `game/art/custom/` là game dùng ảnh thay cho hình vẽ bằng code. **Chưa có tệp nào thì game vẽ y hệt như cũ** (đã so từng điểm ảnh, xem mục "Đã kiểm").

## 15 hình của lô này

| Mã tệp | Hình | Hiện ở đâu trong game | Của ai | Cỡ khung × số khung |
|---|---|---|---|---|
| `hu-no-khoi` | Nổ khói | Đòn Lửa đánh vào quái đang dính Độc (hoặc ngược lại) | người chơi | 96×80 × 8 |
| `hu-soc-nhiet` | Sốc nhiệt | Đòn Lửa đánh vào quái đang dính Băng (hoặc ngược lại) | người chơi | 96×80 × 8 |
| `hu-cot-lua` | Cột lửa | Chỗ vùng đòn hệ Lửa của quái và trùm phát nổ; chiêu Nung; vệt lửa nhát kết | quái, trùm | 32×64 × 6 |
| `hu-cot-nuoc` | Cột nước | Chỗ vùng đòn hệ Băng (nước) của quái và trùm phát nổ | quái, trùm | 32×64 × 6 |
| `hu-vong-phep` | Vòng phép trên sàn | Dưới chỗ chưởng nổ, nổ lan hệ Lửa, Nổ khói, Sốc nhiệt | trung tính | 96×64 × 8 |
| `hu-be-trung` | Em bé trúng đòn | Trên người em bé mỗi lần bị đánh trúng | quái, trùm | 40×40 × 5 |
| `hu-hoi-mau` | Uống thuốc, hồi máu | Quanh em bé lúc uống Bình máu | người chơi | 40×48 × 6 |
| `hu-choang` | Sao choáng | Trên đầu quái hoặc em bé đang choáng, chạy lặp | trung tính | 20×10 × 6 |
| `hu-bang-vo` | Băng vỡ | Khối băng bọc quái vỡ ra | người chơi | 56×56 × 6 |
| `hu-dong-bang` | Vừa đóng băng | Lúc quái vừa bị đóng băng | người chơi | 48×48 × 6 |
| `hu-no-nho` | Nổ nhỏ trên thân trùm | Chuỗi nổ nhỏ lúc trùm đang gục | quái, trùm | 40×40 × 5 |
| `hu-trum-no` | Trùm nổ cuối | Vụ nổ lớn lúc trùm tan biến | quái, trùm | 192×160 × 6 |
| `hu-tien-hoa` | Tiến hoá vũ khí | Cột sáng từ trời lúc vũ khí lên bậc mới trong trận | người chơi | 96×180 × 8 |
| `hu-lap-lanh` | Lấp lánh | Lúc mở rương báu, dùng bàn thờ lời nguyền | trung tính | 40×40 × 6 |
| `hu-cong` | Cổng dịch chuyển | Cổng mọc giữa phòng trùm sau khi thắng, chạy lặp | trung tính | 56×40 × 6 |

Những thứ **vẫn vẽ bằng code**: hạt bụi, tàn lửa, mảnh văng (khi có ảnh thì bớt khoảng một nửa cho đỡ rối), vết cháy trên sàn, số máu mất, dòng chữ "Nổ khói" và "Sốc nhiệt", chớp màu cả màn hình, khối băng bọc quái, cột sáng mờ với đốm sáng bay lên và vòng sáng lúc cổng xuất hiện, mọi vùng đỏ báo nguy hiểm.

## Màu

- Hiệu ứng **của người chơi** (6 mục): lõi trắng ngà `#fbfed0`, màu khác chỉ ở phần bao quanh.
- Hiệu ứng **của quái và trùm** (5 mục): nấc đậm, không lõi trắng to, không phát sáng.
- **Trung tính** (4 mục: vòng phép, sao choáng, lấp lánh, cổng): trắng ngà và vàng kim; cổng thêm đồng và xanh ngọc.
- Mã màu đều lấy từ khối "BẢNG MÀU LINH KHÍ" có sẵn trên trang (Đợt 4), không ghi mã riêng.
- Bốn mục có ô **Bản màu** (Chung, Lửa, Độc, Băng): Em bé trúng đòn, Nổ nhỏ, Trùm nổ cuối, Tiến hoá vũ khí. Chỉ cần bản Chung là dùng được; có bản theo hệ thì game tự chọn theo hệ của đòn. Nên làm đủ ba bản cho **Tiến hoá vũ khí** vì vũ khí tiến hoá luôn theo một hệ.
- Các mục có màu cố định (băng vỡ luôn là băng, cột lửa luôn là lửa…) không hiện ô Bản màu.

## Hiệu ứng to: đã dặn riêng trong prompt

Nổ khói, Sốc nhiệt, Vòng phép, Trùm nổ cuối, Tiến hoá vũ khí có câu "CỠ TRONG GAME" riêng: ghi rõ cỡ ô so với màn hình game 480×270 và em bé cao 28, kèm lời dặn **"hình tự nhiên, không chạm mép ô, không bo theo hình vuông hay chữ nhật của ô, không có cạnh thẳng bị cắt phẳng"** (bài học từ lô hiệu ứng đầu).

## Tệp đã sửa

- `game/js/fx.js`: chỗ móc cho 13 hiệu ứng (mọi mục trừ vòng phép và cổng); hàm thêm ảnh có hai tuỳ chọn mới: phát đủ khung trong đúng thời gian của hiệu ứng, và bám theo nhân vật đang di chuyển.
- `game/js/fx_ky_nang.js`: vòng phép.
- `game/js/portal.js`: cổng dịch chuyển.
- `tools/tach-hieu-ung/index.html`: 15 mục mới ở cuối mảng `HU`; ba trường tuỳ chọn mới cho mục (`mau`, `mep`, `to`); vài kiểu xem thử mới (chân em bé, trên đầu, trùm, trên sàn). Prompt của 40 mục cũ không đổi một chữ.
- `game/dist/*`: do `build.py` tạo lại.

Không đổi lối chơi, bản lưu, đăng nhập Google, lưu mây. Không có chữ mới hiện cho người chơi. Không thêm ảnh nào vào `game/art/custom`. Không sửa `fx_anh.js`, `sprite_custom.js`, `build.py`, `fx_he.js`.

## Đã kiểm (một lượt Playwright, script ở `kiem.py`; ảnh ở `anh-kiem.png` và `anh-kiem-trang-tach.png`)

- `node --check` mọi tệp JS, bài kiểm lưu mây, `python3 game/build.py`: đều qua. Hai lần đẩy (game, rồi công cụ) đều qua kiểm tra tự động.
- **Trang tách** (cỡ màn iPhone): dựng 15 dải mẫu bằng máy (rộng 1536 như ảnh ChatGPT, nền đúng màu prompt, có kẻ lưới). Cả 15 đều **ĐẠT**, tệp có `"net": 2`, cỡ ảnh đúng gấp đôi, trang không cuộn ngang, không lỗi. Bấm Tải ra đủ 2 bản (gấp đôi + thường). So 64 bản prompt cũ (40 mục và các bản theo hệ) giữa trang cũ và trang mới: không bản nào đổi chữ.
- **Không có tệp = y hệt cũ:** chạy cùng một kịch bản 15 hiệu ứng trong phòng (phòng thường và phòng trùm thật) trên bản cũ và bản mới, chụp 16 ảnh rồi so từng điểm ảnh: **cả 16 ảnh khác 0 điểm ảnh**.
- **Nạp tạm 15 tệp mẫu vào game** (chỉ trong lúc thử, không nằm trong kho mã): cả 15 hiệu ứng hiện ảnh mẫu đúng chỗ, cỡ gần bằng hình code; cổng lớn dần lúc mọc; cột sáng tiến hoá và hồi máu đứng đúng chân em bé; nổ nhỏ và nổ cuối hiện trên thân trùm thật. Lớp hiệu ứng không báo lỗi nào, console không có dòng lỗi mới. Trong `anh-kiem.png`: mỗi ô có hai hình, trên là hình code, dưới là dải mẫu.

Giới hạn của lượt kiểm, nói rõ để bạn biết:

- Dải mẫu chỉ là hình tròn, cột, vòng đơn giản do máy dựng. **Chưa thử với ảnh thật của ChatGPT**; cỡ và điểm đặt có thể phải chỉnh nhẹ khi có ảnh thật (ô "Cỡ trong game" và "Neo x, Neo y" trên trang tách).
- Các hiệu ứng được gọi thẳng trong phòng (ví dụ ra lệnh "nổ khói tại con quái này"), không qua đánh thật từng đòn. Trùm thì dùng trùm thật của phòng trùm, cho gục ngay.
- Sao choáng chỉ thử trên quái kiểu cũ. Vài quái hình mới tự vẽ sao choáng trong cử động riêng (ở `monster_art.js`, không thuộc tệp của phiên này) nên chỗ đó chưa đổi.
- Console có ba loại dòng cảnh báo sẵn có: một dòng không tải được tệp ngoài (máy thử không có mạng), một dòng 404 "khi tải script", và cảnh báo của trình duyệt về tốc độ đọc ảnh. Cả ba có ở bản cũ lẫn bản mới, không phải do phiên này; B2 cũng đã ghi nhận dòng 404, tôi chưa truy nguyên nhân.
- Lúc thử, máy không tải được thư viện nén zip nên trang chuyển sang tải 2 tệp rời (đúng thiết kế dự phòng).

## Những chỗ tự quyết (cần bạn biết)

1. **Trùm nổ cuối chỉ 6 khung, Tiến hoá 8 khung** (bản kiểm kê đề xuất 10). Ảnh ChatGPT rộng tối đa khoảng 1536 điểm; chia 10 khung thì mỗi khung của Trùm nổ cuối chỉ còn 153 điểm, ít hơn cả cỡ trong game (192), hình sẽ nhoè. 6 khung thì mỗi khung 256 điểm. Dù vậy dải này vẫn chưa đạt đủ độ nét gấp đôi; muốn nét hơn có thể nhờ ChatGPT vẽ ảnh rộng hơn nếu được.
2. **Vòng phép làm khung 96×64** (đề xuất 96×82): vòng nằm dẹt trên sàn chỉ cao khoảng 55 điểm, khung cao 82 thì thừa.
3. **Năm mục không vẽ kiểu ánh sáng** dù bản kiểm kê đề xuất có: Nổ khói (khói tối sẽ biến mất nếu vẽ kiểu ánh sáng), Cổng (lòng cổng tối), và các mục của quái (Em bé trúng đòn, Nổ nhỏ, Trùm nổ cuối: theo luật "của quái thì nấc đậm, không phát sáng"). Đổi được bằng ô "Cộng sáng" trên trang tách.
4. **Em bé trúng đòn xếp vào "của quái"** vì đó là dấu đòn của quái đánh lên em bé; bản Chung dùng nâu đỏ than hồng thay cho đỏ tươi của hình code.
5. **Cột lửa xếp vào "của quái"** vì chỗ dùng chính là đòn quái phát nổ. Chiêu Nung của em bé và vệt lửa nhát kết cũng dùng chung hình cột này (trong code chúng vốn dùng chung một hình), nên khi có ảnh thì cột lửa của em bé cũng mang màu đậm của quái. Nếu bạn muốn em bé có cột lửa sáng riêng thì cần thêm một dải nữa ở phiên sau.
6. **Hồi máu dùng hồng cam nhạt**, không dùng xanh lá: xanh lá là màu hệ Độc, dễ nhầm; hình code hiện cũng là hồng.
7. **Vòng phép, lấp lánh chỉ có một màu.** Trong code vòng phép đổi màu theo hệ, lấp lánh ở bàn thờ màu tím; ảnh thì một màu trung tính (vàng kim). Đốm sáng nhỏ bằng code ở bàn thờ vẫn màu tím.
8. **Cổng:** ảnh thay phần vành, lòng cổng và xoáy; lúc mọc game phóng ảnh to dần. Đốm sáng bay lên và vòng sáng lúc xuất hiện giữ bằng code (đúng đề xuất trong bản kiểm kê).
9. **Thêm ba trường tuỳ chọn cho mục trên trang** (`mau` = màu cố định, không hiện ô Bản màu; `mep` = câu màu viết riêng; `to` = hiệu ứng to). Mục cũ không dùng các trường này nên không đổi gì.
10. **Sốc nhiệt, Băng vỡ, Đóng băng, Cột nước, Cổng, Nổ khói dùng nền hồng tím** vì có xanh băng, xanh ngọc hoặc xám khói, dễ lẫn với nền xanh dương.

## Dung lượng

- Ảnh thêm vào game ở phiên này: **0 KB** (chưa có ảnh thật).
- Bản gói `linh-khi.html`: khoảng 10,5 MB; phần mã của phiên này thêm chừng 6 KB.
- Khi bạn vẽ đủ 15 dải bản Chung: ước thêm **1,2 đến 2 MB** tất cả, nhiều hơn hẳn hai phiên trước vì có bốn dải to (Trùm nổ cuối 400 đến 600 KB, Tiến hoá 200 đến 450 KB, Nổ khói và Sốc nhiệt mỗi dải khoảng 200 KB). Mỗi bản theo hệ nặng bằng bản Chung của nó; riêng ba bản theo hệ của Trùm nổ cuối sẽ thêm hơn 1 MB, nên cân nhắc chỉ làm bản Chung cho mục này.

## Bạn cần làm gì

1. Mở https://spiritblade.web.app/tach-hieu-ung.html, chọn một trong 15 mục cuối, bấm **Sao chép prompt vẽ**, dán vào ChatGPT, lưu ảnh về máy.
2. Đưa ảnh vào trang. Thấy **ĐẠT** thì bấm **Tải** và gửi tệp cho Claude để đưa vào game.
3. Nên làm trước ba mục thấy nhiều nhất: **Em bé trúng đòn**, **Hồi máu**, **Cổng dịch chuyển**; rồi tới Nổ khói và Sốc nhiệt.
4. Sao choáng rất nhỏ (cao 10 điểm ảnh): nếu ChatGPT vẽ quá nhiều chi tiết thì nhờ vẽ lại "đơn giản hơn, khối to hơn".
5. Nếu ChatGPT vẽ dải to (Trùm nổ cuối, Tiến hoá) ra số khung khác: ở bước 2 đổi "Cách tách" sang **Chia đều theo số cột** và gõ đúng số cột trong ảnh.

## Phiên sau của làn B

B4 (vũng trên sàn: vũng lửa, vũng độc, mây độc, 4 vũng của quái) thêm mục vào cuối mảng `HU`, sau 15 mục của phiên này. Hai tuỳ chọn mới của hàm thêm ảnh trong `fx.js` (`gian`: phát đủ khung trong thời gian cho trước; `theo`: bám theo nhân vật) dùng lại được.
