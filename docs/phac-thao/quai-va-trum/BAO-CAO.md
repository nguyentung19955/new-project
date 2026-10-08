# Báo cáo: vẽ lại quái và trùm

Nhánh: `claude/quai-va-trum` (tách từ `khoi-tao-du-an`). Chưa nối vào game, chưa sửa file nào khác trong `game/`.

## Tóm tắt

- Game có đủ ba vùng, mỗi vùng một bộ quái riêng, một trùm nhỏ và một trùm vùng. Tất cả đã được vẽ lại cùng nét với em bé hero và vũ khí sống: viền tối, mắt to tròn, đầu to thân tròn.
- Vùng biển được làm kỹ nhất: Ngư Tinh (cá khổng lồ đầu gai, miệng rộng, râu dài), Cua Đá, sáu loại quái biển.
- Mọi hình nằm trong MỘT file mới `game/js/monster_art.js`. Nạp file này sau `art.js` là game dùng hình mới; bỏ dòng nạp là game trở về hình cũ.
- Trùm hiện rõ đang kháng gì: giáp màu hệ nó kháng, viên ngọc hoặc lõi màu hệ khắc, và ba dấu riêng cho chống đánh xa, chống áp sát, bắt bài lăn né.

## Ảnh nên xem (theo thứ tự)

Tờ phác thảo chờ duyệt:

1. `vung-bien.png`: bộ quái Hang biển, Cua Đá, Ngư Tinh, ô so cỡ với em bé hero.
2. `trum-bien-cac-pha.png`: Ngư Tinh qua ba giai đoạn (nước dâng), sáu tư thế đòn, bốn dạng thích nghi.
3. `tat-ca-trum.png`: sáu trùm đứng cạnh nhau cùng tỉ lệ.
4. `vung-rung.png`, `vung-lau-dai.png`: hai vùng còn lại, cùng bố cục.
5. `truoc-va-sau.png`: hình cũ bên trái, hình mới bên phải.

Chụp từ game thật (bản sao tạm có nạp thêm file mới):

6. `trum-ngu-tinh.gif`: trận Ngư Tinh, có kháng Lửa và chống đánh xa, đủ ba giai đoạn tới lúc gục.
7. `trum-moc-tinh.gif`, `trum-ho-tinh.gif`: hai trận còn lại.
8. `ba-trum-nho.png`: ba trùm nhỏ lúc sắp nện và lúc lao húc.
9. `trong-game-bien.png`, `trong-game-rung.png`, `trong-game-lau-dai.png`: phòng đánh thường của ba vùng.

Lưu ý: trong ảnh chụp từ game, người chơi vẫn là hero kiểu cũ và phòng vẫn là phòng ngang, vì nhánh này tách từ `khoi-tao-du-an`, chưa có hero mới và phòng vuông.

## Danh sách quái và trùm

| Vai trong game | Rừng già (hệ Độc) | Hang biển (hệ Băng) | Lâu đài cổ (hệ Lửa) |
|---|---|---|---|
| Lính xông | Mầm Gỗ | Cá Nóc Lính | Lính Ma |
| Bầy nhỏ | Nấm Con | Cua Con | Dơi Lửa |
| Khiên | Bọ Gai | Ốc Mượn Hồn | Nghê Đá |
| Xạ thủ | Hoa Phun Độc | Hải Quỳ Bắn | Đèn Lồng Ma |
| Nhanh nhẹn | Chồn Rừng | Rắn Biển | Cáo Lửa |
| Tinh anh | Cóc Tía | Sứa Chúa | Tướng Ma |
| Trùm nhỏ | Nấm Chúa | Cua Đá | Hổ Lửa |
| Trùm vùng | Mộc Tinh | Ngư Tinh | Hồ Tinh |

Cỡ hình (điểm ảnh của game): quái thường cao 12 đến 27, tinh anh 36 đến 40, trùm nhỏ 54 đến 57, Mộc Tinh cao 122, Ngư Tinh dài 150 và cao 70 trên mặt nước, Hồ Tinh cao 52 ở tai và 75 ở chóp đuôi (hóa cuồng thì game phóng 1,5 lần).

Tinh anh mang hệ nào thì vương miện, nấm trên lưng hoặc ngọn lửa đổi màu theo hệ đó. Trùm nhỏ đang kháng hệ nào thì tinh thể, bào tử hoặc lửa của nó đổi sang màu hệ đó và có vòng sáng dưới chân.

Dấu thích nghi dùng chung cho cả ba trùm vùng:

| Dạng | Mộc Tinh | Ngư Tinh | Hồ Tinh |
|---|---|---|---|
| Kháng hệ | Vỏ giáp màu hệ trên tay, sườn, trán | Vảy giáp màu hệ dọc lưng và trán | Bờm, vằn, chóp đuôi đổi màu hệ |
| Điểm yếu (hệ khắc) | Hốc nứt trên thân có lõi sáng | Viên ngọc ở sườn | Viên ngọc ở cổ |
| Chống đánh xa | Màn dây leo trước thân | Ba bong bóng nước quanh đầu | Ba lá bùa bay quanh |
| Chống áp sát | Vòng gai trắng quanh gốc | Hàng gai xương dọc sườn | Lửa ở bốn chân và quanh chân |
| Bắt bài lăn né | Mắt thứ ba trên trán | Mắt thứ ba treo trên cần câu | Mắt thứ ba trên trán |

## Cách nối vào game

Thêm đúng một dòng vào `game/index.html`, ngay sau dòng nạp `js/art.js`:

```html
<script src="js/art.js"></script>
<script src="js/monster_art.js"></script>
```

Sau đó chạy `python3 game/build.py` để đóng gói lại (file này đọc danh sách script từ `index.html`).

File mới làm gì khi được nạp:

- Thay `G.art.enemy`, `G.art.boss` và phần đạn của quái xạ thủ trong `G.art.proj`. Hàm cũ được giữ ở `G.art.enemyOld`, `G.art.bossOld`, `G.art.projOld`.
- Giữ đúng chữ ký `(c, e)` và `(c, b)`, đọc đúng các trường mà `combat.js` và `boss.js` đang đặt (đi, báo đòn, ra đòn, lao, trúng đòn, đóng băng, choáng, gục, `b.anim` của từng đòn, các giai đoạn, lớp thích nghi, ảo ảnh của Hồ Tinh).
- Nếu hàm mới lỗi thì tự gọi lại hàm cũ cho khung hình đó và đếm lại ở `G.monsterArt.fallbacks()`.
- Quái vẽ theo vùng hiện tại của ải. Không đụng luật chơi, không dùng số ngẫu nhiên của game.
- `G.monsterArt.unhook()` tháo ra, `G.monsterArt.hook()` gắn lại (để so hình cũ và mới khi thử).

## Kiểm tra đã chạy

Chạy trên bản sao tạm của `game/` có chèn dòng nạp nói trên. Thư mục `game/` thật không bị sửa.

| Bài | Kết quả |
|---|---|
| `tests/rules.py` | 82 trên 82 luật đạt |
| `tests/fuzz.py` | tổng số lỗi: 0 |
| `tests/anim_smoke.py` | 6 lượt chạy, không lỗi vẽ, số lần phải dùng lại hình cũ: 0. Ba lượt kết thúc ải, ba lượt chạy hết giờ ở phòng trùm, giống hệt game gốc khi chạy cùng bài này |
| Ép từng đòn của ba trùm và ba trùm nhỏ rồi nhìn khung hình | Đã xem: mọi đòn, ba giai đoạn, mệt, choáng, đóng băng, gục, các lớp thích nghi |

Thời gian dựng một hình trên máy thử (Chromium): Mộc Tinh 4,6 đến 6,5 mili giây, Ngư Tinh 2,4 đến 3,7, Hồ Tinh 1,2 đến 1,8, trùm nhỏ khoảng 1, quái thường dưới 0,6. Hình dựng xong được cất vào kho để dùng lại; tư thế của trùm đổi tối đa khoảng 12 lần mỗi giây.

Công cụ trong `nguon/`:

- `to.html`, `to.js`, `chup.py`: dựng và chụp sáu tờ phác thảo từ chính `monster_art.js`.
- `thu-trong-game.py`: tự tạo bản sao tạm của game, nạp file mới, ép cảnh rồi chụp ảnh hoặc GIF. Ví dụ làm lại GIF Ngư Tinh:

```
python3 nguon/thu-trong-game.py '{"r":1,"i":4,"room":"last","px":262,"py":196,"hold":1,"keepBoss":0.05,"ticks":1200,"from":20,"every":8,"ms":133,"zoom":2,"stats":{"el":{"fire":300},"ranged":300},"debug":[[30,"spout"],[170,"wave"],[330,"charge"],[560,"hp",0.55],[640,"dive"],[800,"hp",0.25],[890,"spikes"],[1010,"kill"]]}' trum-ngu-tinh.gif
```

- `cu/`: hình cũ chụp từ game hiện tại, dùng cho tờ trước và sau. `be-*.png`: hình em bé hero lấy từ nhánh `claude/hero-tinh-linh-2` để so cỡ.

## Chỗ còn yếu

- **Chưa thử với hero mới và phòng vuông.** Hai phần đó nằm ở nhánh khác. Ô "cỡ thật" trong tờ phác thảo dùng nền phòng tôi tự vẽ đơn giản, không phải phòng thật.
- **Máy yếu có thể giật nhẹ lúc trùm ra đòn lần đầu.** Mỗi tư thế mới của trùm phải dựng một lần (Mộc Tinh nặng nhất). Điện thoại chậm hơn máy thử vài lần. Chưa đo trên điện thoại thật.
- **Dáng gục của quái thường còn đơn giản.** Chủ yếu là mắt chữ X rồi ngã, xẹp, nổ hoặc vỡ theo loài; không có hình gục riêng cho từng con. Trùm nhỏ và trùm vùng thì có.
- **Cua Đá:** sáu chân còn là que thẳng; đòn nện thì càng đập tại chỗ trong khi vùng nổ ở chỗ người chơi (bản cũ cũng vậy).
- **Mộc Tinh:** sợi roi mảnh so với vùng đánh; lúc quất nhanh cánh tay nhảy hai tư thế; đợt đầu trong rừng trùm chỉ mang một lớp thích nghi nên ít khi thấy hai dấu cùng lúc.
- **Hồ Tinh:** khi hóa cuồng mà chỉ còn một hai đuôi thì hình chủ yếu là đầu và thân; ảo ảnh vẫn mang giáp hệ và mắt thứ ba như cáo thật; hình phóng 1,5 lần nên hơi thô khi xoay.
- **Ngư Tinh:** biểu tượng trạng thái (cháy, độc, băng) do game đặt theo chiều cao va chạm cũ nên nằm đè lên thân cá.
- **Vài tư thế báo đòn chưa thật rõ:** Lính Ma kéo giáo, Bọ Gai hạ sừng, Rắn Biển cuộn mình.
- **Đòn cắn và nhảy lùi của Hồ Tinh** mới thử bằng cách ép đòn, chưa thử qua một trận đánh xa hoặc áp sát thật.
- Phiên này có dùng hai phụ tá chạy song song để vẽ vùng rừng và vùng lâu đài theo mẫu của vùng biển. Tôi đã xem lại hình và chạy lại toàn bộ bài thử trên file ghép cuối cùng.

## Đề xuất

Kích thước va chạm nằm trong `data.js` và `boss.js`, tôi không sửa. Hình mới vẽ khớp với số hiện có; các chỗ nên cân nhắc đổi:

| Con | Hiện có | Đề xuất | Lý do |
|---|---|---|---|
| Ngư Tinh | `h: 44` | `h: 72` | Thân mới cao 70; biểu tượng trạng thái và chữ sát thương sẽ lên đúng đầu cá |
| Hồ Tinh | `h: 42` | `h: 54` | Tai cao 52 |
| Trùm nhỏ Cua Đá, Hổ Lửa | `r: 16` | `r: 22` | Thân rộng 85 đến 92, hiện chỉ phần giữa nhận đòn |
| Khiên | `h: 15` | `h: 21` | Bọ Gai, Ốc Mượn Hồn, Nghê Đá cao 21 đến 22 |
| Bầy nhỏ | `h: 10` | `h: 14` | Nấm Con, Cua Con, Dơi Lửa cao 12 đến 17 |

Việc nên làm tiếp:

1. Chủ dự án duyệt tờ phác thảo, nhất là Ngư Tinh và Cua Đá.
2. Phiên điều phối thêm một dòng nạp file vào `index.html` khi gộp nhánh, rồi chạy `build.py`.
3. Khi phòng vuông xong: xem lại chỗ đặt trùm. Ngư Tinh dài 150 nên cần vũng nước rộng khoảng 170 ở một cạnh phòng 300; roi của Mộc Tinh hiện chỉ quất sang trái.
4. Nếu điện thoại yếu bị giật ở phòng trùm: dựng sẵn các tư thế của trùm lúc màn hình chuyển phòng.
5. Có thể làm thêm tờ "các pha và dạng thích nghi" cho Mộc Tinh và Hồ Tinh; hình đã có sẵn trong file, chỉ cần thêm vào `to.js`.
