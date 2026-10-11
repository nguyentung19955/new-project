# Báo cáo làn C5: khung co giãn 9 mảnh dùng được ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn C (Giao diện)

## Tóm tắt một dòng

Game đã sẵn sàng nhận ảnh ChatGPT cho **15 cái khung**: 8 ô đồ (4 bậc, thường và đang chọn), 3 vỏ thanh (máu, mana, kinh nghiệm), 3 khung tên và máu (trùm vùng, trùm nhỏ, tinh anh), 1 thẻ. Chưa có tệp ảnh nào nên game **y hệt cũ** (đã so từng điểm ảnh: khác 0).

## Bạn cần làm gì tiếp

Chỉ cần vẽ **1 tấm ảnh**.

1. Mở https://spiritblade.web.app/tach-giao-dien.html, chọn lô **Khung 9 mảnh · ô đồ, vỏ thanh máu, khung trùm, thẻ (15 hình)** (cuối danh sách), bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Đưa ảnh vào bước 2 của trang. Xem thử ở bước 4. Ưng thì bấm **Tải tất cả (.zip)**.
3. Gửi tệp .zip cho Claude.

Prompt đầy đủ và bảng thứ tự các ô: `PROMPT.md` cùng thư mục này.

## "Khung 9 mảnh" là gì

Một cái khung dùng ở nhiều cỡ: ô đồ có 7 cỡ (20 đến 70), thanh máu dài 120, thanh máu trùm dài 214. Nếu kéo giãn cả tấm ảnh thì góc và đinh tán bị bè ra. Vì vậy game cắt ảnh khung thành 9 mảnh: **bốn góc giữ nguyên cỡ, bốn cạnh kéo dài, phần giữa để trống**. Điều này dẫn tới hai yêu cầu với tranh: hoa văn chỉ nằm ở góc, và giữa khung phải trống.

## Đã làm

**1. Game** (`game/js/ui_theme.js`)

| Khung | Mã tệp | Cỡ ảnh gốc | Game co thế nào |
|---|---|---|---|
| Ô đồ bậc Thường, Lam, Tím, Vàng | `gd-o-do-0` đến `gd-o-do-3` | 32×32 | co cả hai chiều theo cỡ ô (20, 21, 24, 28, 32, 36, 70) |
| Ô đồ đang chọn, bốn bậc | `gd-o-do-0-chon` đến `gd-o-do-3-chon` | 32×32 | như trên, phủ rộng hơn 1 điểm mỗi bên |
| Vỏ thanh máu | `gd-khung-mau` | 33×11 | co ngang (thanh máu em bé 120) |
| Vỏ thanh mana | `gd-khung-mana` | 32×8 | co ngang (108) |
| Vỏ thanh kinh nghiệm | `gd-khung-xp` | 28×7 | co ngang (104 ở hành trang, 192 ở làng) |
| Khung trùm vùng | `gd-khung-trum` | 60×30 | co ngang (226) |
| Khung trùm nhỏ | `gd-khung-trum-nho` | 52×26 | co ngang (196) |
| Khung tinh anh | `gd-khung-tinh-anh` | 44×22 | co ngang (150 đến 224, theo độ dài tên) |
| Thẻ phần thưởng | `gd-the-thuong` | 32×32 | co cả hai chiều |

- Ảnh chỉ là **viền khung**. Game vẫn tự vẽ: bóng đổ, màu lót trong lòng khung, phần màu máu / mana / kinh nghiệm, vạch khắc, phần máu tụt dần, vạch pha của trùm, tên, số phần trăm, hình món đồ.
- **Thanh máu:** game vẽ ảnh vỏ trước, rồi vẽ lòng thanh đè lên đúng chỗ cũ. Nhờ vậy máu hiện y như trước dù ảnh thế nào. Màu máu trùm, màu cam của tinh anh (Đợt 8) không đổi. Thanh máu nhỏ trên đầu quái và viền hệ của Đợt 8b không bị đụng tới.
- **Thanh máu bên trong khung trùm và tinh anh** dùng chung ảnh `gd-khung-mau`.
- **Ô đang chọn:** có tệp `-chon` thì dùng tệp đó. Thiếu thì game dùng tệp thường và tự vẽ vòng sáng bên ngoài như hình cũ.
- **Thẻ đang bấm:** game tự làm sáng ảnh thẻ. **Thẻ theo bậc** ở màn kết quả: game kẻ thêm một đường chỉ màu bậc lên vành thẻ, vì chỉ có một ảnh thẻ cho mọi bậc.
- **Giữa khung** (đọc code rồi quyết): lòng ô đồ và lòng thẻ là màu đặc, game tô y màu cũ. Lòng khung trùm là gỗ sẫm hơi trong (thấy mờ cảnh phía sau), game tô y như cũ. Tất cả tô **dưới** ảnh, nên ảnh phải trống ở giữa.
- Ảnh nạp xong lúc nào thì khung đổi lúc đó; gỡ tệp thì về hình cũ. Thiếu tệp nào thì riêng khung đó vẽ như cũ.
- **Cờ tắt:** `G.KHUNG_ANH = false` thì game bỏ qua 15 ảnh này.
- Không đụng `T.panel`, `T.btn`, `T.dialog`, `T.round`, `T.stageCard`, `T.drum`, `btn_art.js`.

**2. Trang công cụ** https://spiritblade.web.app/tach-giao-dien.html

- Lô mới ở cuối danh sách: **Khung 9 mảnh** (lưới 4×4, 15 hình, ô cuối trống, nền hồng tím).
- Prompt tiếng Việt một đoạn, tả từng khung theo hình code đang có: viền `#14182e`, vành đồng, vành màu bậc, đinh tán ở góc, ngôi sao trống đồng ở góc khung trùm vùng. Dặn rõ giữa để trống và cạnh phải trơn. Có đoạn bảng màu (kim loại, gỗ).
- Mỗi tệp tải về ghi sẵn số đo viền để cắt 9 mảnh (`vien`); bạn không phải chỉnh gì.
- Bước 4 **xem thử**: cùng một khung ở nhiều cỡ, do chính code giao diện của game vẽ. Có nút so với bản vẽ code cũ.
- **Sửa phần tách hình cho riêng lô này:** vành khung mảnh và dài, công cụ cũ tưởng là nét kẻ lưới nên xoá mất. Thử trước khi sửa: chỉ tìm được 11/15 hình, khung còn lại bị mất vành. Sau khi sửa: 15/15. Các lô khác chạy y như cũ.

## Đã kiểm (một lượt tự động, ảnh mẫu máy tự dựng)

Ảnh mẫu có **ô đánh dấu trắng ở mỗi góc khung** để thấy ngay nếu góc bị kéo méo.

| Việc kiểm | Kết quả |
|---|---|
| Ảnh lưới mẫu 4×4 đưa vào lô Khung 9 mảnh | **ĐẠT**, tìm được 15/15 hình, mọi tệp ghi `"net": 2` và có `vien` |
| Vành tím của ô bậc Tím sau khi tách nền hồng tím | còn nguyên (824 điểm tím), giữa ô trong suốt |
| Bốn góc của khung sau khi co giãn, so với bốn góc ảnh gốc, 15 khung, mỗi khung 3 đến 5 cỡ | **trùng từng điểm ảnh**, 0 góc sai |
| Game không tệp, bản trước làn so với bản mới, 4 cảnh ở 844×390 (trùm vùng, tinh anh, hành trang, màn kết quả) | **khác 0 điểm ảnh** ở cả 4 |
| Vẽ riêng cả bộ khung (ô đồ 7 cỡ, thanh các loại, 4 khung trùm / tinh anh, thẻ) ở 5 cỡ màn, bản trước so bản mới, không tệp | **khác 0 điểm ảnh** ở cả 5 |
| Nạp tạm đủ 15 tệp mẫu vào game | khung đổi sang ảnh ở cả 4 cảnh; máu, tên, số, hình món đồ vẫn nằm đúng chỗ |
| Có tệp nhưng tắt cờ `G.KHUNG_ANH` | về đúng hình cũ, khác 0 điểm ảnh (4 cảnh và bộ khung vẽ riêng) |
| Gỡ 4 tệp (ô Lam đang chọn, ô Vàng, vỏ mana, khung trùm nhỏ) | bốn khung đó về hình code, khung khác vẫn dùng ảnh |
| Gỡ hết tệp | game về đúng như lúc đầu, khác 0 điểm ảnh |
| Lỗi JavaScript | không có (game, bản gói, trang công cụ) |
| `node --check game/js/*.js`, bài kiểm tra lưu mây, `python3 game/build.py` | đều qua |

Ảnh kiểm: `anh-kiem.png`. **Bên trái là hình vẽ code, bên phải là có tệp mẫu.** Từ trên xuống:

1. Trận trùm vùng ở 844×390.
2. Trận tinh anh.
3. Hành trang (ô đồ bậc Tím, Vàng, Lam).
4. Màn kết quả (thẻ vũ khí theo bậc, ô đồ nhỏ).
5. Phóng to dải trên của trận trùm, rồi của trận tinh anh.
6. Cả bộ khung vẽ riêng ở nhiều cỡ.
7. Bộ khung có đủ tệp (trái) và thiếu 4 tệp (phải).
8. Bước 4 của trang công cụ: bản vẽ code (trái), ảnh mẫu (phải).
9. Tấm ảnh lưới mẫu đã dùng.

Lưu ý: hình trong ảnh kiểm là **hình mẫu máy tự vẽ để thử**, cố ý thô, không phải tranh thật. Không có ảnh nào được thêm vào `game/art/custom`.

Chạy lại: `python3 docs/review/giao-dien-c5/kiem.py <thư mục bản code cũ>`.

## Chưa làm, chưa thử

- **Chưa thử với ảnh ChatGPT thật** và chưa thử trên iPhone thật. Lần đầu có thể phải nhờ ChatGPT vẽ lại.
- **Ô vũ khí trong trận** (góc trên phải) là lô của phiên C4 (`gd-o-vk-*`), không thuộc làn này. Brief ghi chụp "ô vũ khí 4 bậc + ô chọn" trong trận; tôi chụp ô đồ 4 bậc và ô chọn ở phần bộ khung vẽ riêng và ở hành trang.
- Hành trang trong ảnh chụp không có ô đang chọn và ô bậc Thường. Hai trường hợp này chỉ có ở phần bộ khung vẽ riêng.
- Chỉ chụp 4 cảnh ở 844×390. Thợ may, hàng xén, rương báu, thanh kinh nghiệm ở làng dùng cùng các hàm này nhưng không chụp riêng. Không chạy bộ test dài (theo lời dặn).
- Thanh mỏng dưới 6 điểm (thanh dấu ấn, thanh mốc linh khí) vẫn vẽ code: quá mỏng để có vỏ bằng ảnh.
- Nền xanh lá cho lô này chưa thử (xem "Rủi ro").

## Nên biết

- **Ô bậc Vàng mất hàng răng cưa nhỏ** ở mép trên lòng ô khi dùng ảnh. Răng cưa nằm trên cạnh, mà cạnh bị kéo dài nên không đưa vào ảnh được. Bậc Vàng vẫn nhận ra nhờ màu.
- **Thẻ mất hai dải răng cưa** trên và dưới khi dùng ảnh, cùng lý do.
- **Đinh tán ở hai đầu thanh máu bị ép dẹt** ở thanh máu trùm nhỏ (cao 9) và tinh anh (cao 7), vì chúng dùng chung ảnh vỏ cao 11. Ở thanh máu em bé thì nguyên dạng.
- **Lòng khung trùm:** nếu ChatGPT tô giữa khung bằng màu đặc thì không còn thấy mờ cảnh phía sau. Tên và thanh máu vẫn hiện đủ.
- **Hoa văn góc khung trùm phải nhỏ.** Thanh máu nằm cách mép khung 5 đến 6 điểm; hoa văn to hơn sẽ bị thanh máu che một phần.
- Viền ngoài trong prompt là `#14182e` theo brief. Hình code hiện dùng nâu đen `#1a120a`; hai màu gần như không phân biệt được ở cỡ này.

## Chỗ tôi tự quyết (không hỏi lại)

1. **Thanh máu: ảnh ở dưới, lòng thanh do code vẽ đè lên.** Cách này an toàn nhất: dù ChatGPT có tô giữa khung, người chơi vẫn thấy đúng lượng máu.
2. **Cỡ ảnh gốc theo dáng thật của từng khung**, không phải mọi hình 32×32 như brief ghi: vỏ thanh 33×11, 32×8, 28×7; khung trùm 60×30, 52×26, 44×22. Ô đồ và thẻ vẫn 32×32. Nếu ép vỏ thanh thành hình vuông thì ChatGPT khó vẽ và hai đầu thanh bị méo.
3. **Ô đồ co theo cỡ**, không cố định 32 như brief ghi, vì game đang dùng ô đồ ở 7 cỡ.
4. **Màu ô đồ theo bốn bậc của game** (xám be, lam, tím, vàng), chất liệu tả là gỗ mộc, ngọc lam, ngọc tím, vàng kim. Giữ màu bậc vì người chơi nhận bậc qua màu.
5. **Thanh máu trùm và tinh anh dùng chung vỏ `gd-khung-mau`**, để giữ đúng 15 hình của brief.
6. **Nền hồng tím theo brief**, dù có ô màu tím (C4 đã chọn nền xanh lá vì lý do này). Ảnh mẫu tách tốt; prompt dặn dùng tím xanh và có viền tối ngăn giữa vành tím và nền.
7. **Bỏ răng cưa của ô Vàng và của thẻ khi dùng ảnh** (xem "Nên biết").
8. **Thêm một khối hàm dùng chung nhỏ** ngay trước `T.bossBar` (dựng và dán lớp khung). Brief chỉ ghi bốn hàm; khối này là phần bốn hàm đó cần, không đổi hàm nào khác.

## Tệp đã đổi

- `game/js/ui_theme.js`: khối "Làn C5" (hàm dùng chung), `T.slot`, `T.bar` (phần vỏ), `T.bossBar` (tấm khung), `T.card`.
- `game/dist/*`, `tools/xuong-sprite/index.html`: gói lại.
- `tools/tach-giao-dien/index.html`: lô mới ở cuối, prompt, mô tả lô, xem thử, tệp xuất ghi `vien`, sửa phần tách cho khung rỗng.
- `docs/review/giao-dien-c5/`: báo cáo, `PROMPT.md`, `anh-kiem.png`, `kiem.py`.
- `docs/review/ke-hoach-cai-thien/TRANG-THAI.md`: dòng C5.

## Dung lượng

Không thêm ảnh nào. Code game tăng khoảng 6,5 KB. Khi bạn gửi đủ 15 hình, ước chừng thêm **30 đến 70 KB**. Đây là ước lượng: 15 tệp mẫu máy vẽ nặng 16 KB, tranh thật nhiều màu hơn nên nặng hơn. Bản gói hiện 10,13 MB trên trần 15 MB.

## Rủi ro còn lại

- **Ảnh thật có thể không trống ở giữa, hoặc có hoa văn trên cạnh.** Xem bước 4 của trang công cụ trước khi tải: góc bè ra hay cạnh có vệt lặp là dấu hiệu.
- **Vành tím trên nền hồng tím:** ảnh ChatGPT thật có mép nhoè hơn ảnh mẫu, công cụ có thể ăn mất một phần vành tím. Cách xử lý: nhờ vẽ lại với nền xanh lá. Trường hợp đó chưa thử với lô này.
- **Vành ảnh dày mỏng khác hình code.** Game lót màu lòng khung từ điểm thứ 3 tính từ mép; vành ảnh mỏng hơn 2 điểm sẽ lộ một đường màu lót sát mép.
- **Sửa phần tách hình** chỉ bật cho lô này. Nếu ChatGPT kẻ lưới đứt đoạn trong từng ô thì công cụ có thể nhận nhầm nét kẻ là hình thừa; khi đó trang báo lỗi và bạn cắt mép hoặc nhờ vẽ lại.

## Cách quay lui

- Chưa có tệp ảnh thì không có gì để quay lui: game đang vẽ y như cũ.
- Có ảnh mà không ưng: đặt `G.KHUNG_ANH = false`, hoặc xoá các tệp `gd-o-do-*`, `gd-khung-mau`, `gd-khung-mana`, `gd-khung-xp`, `gd-khung-trum*`, `gd-khung-tinh-anh`, `gd-the-thuong` khỏi `game/art/custom` rồi gói lại. Lưu ý: **không** xoá `gd-khung-ban-do` (khung bản đồ, lô khác).
- Bỏ hẳn phần code: `git revert 674859e 34d2d2d` (công cụ, rồi game), sau đó chạy `python3 game/build.py`.

## Quyết định cần bạn duyệt

1. Ô bậc Vàng và thẻ mất răng cưa khi dùng ảnh. Mặc định: chấp nhận. Lựa chọn khác: game vẽ thêm răng cưa code đè lên ảnh (có thể lệch với vành ảnh).
2. Thanh máu trùm nhỏ và tinh anh dùng chung vỏ với thanh máu em bé, đinh tán bị ép dẹt. Mặc định: giữ. Lựa chọn khác: thêm 2 ảnh vỏ riêng cao 9 và cao 7.
3. Thẻ theo bậc chỉ khác nhau ở một đường chỉ màu. Mặc định: giữ. Lựa chọn khác: thêm 4 ảnh thẻ theo bậc.
4. Nền hồng tím hay xanh lá cho lô này. Mặc định: hồng tím theo brief; đổi sang xanh lá nếu ảnh thật bị mất vành tím.

## Cho người làm kỹ thuật

- `khungCo(mã)`: `gdCo` có thêm cờ `G.KHUNG_ANH`. `T.MA_KHUNG`: 15 mã, cho công cụ và bài kiểm tra.
- `khungLop(ga, khoá, w, h, ve)`: dựng một lớp ở độ nét của ảnh (`ga.net`), nhớ trong `WeakMap` theo chính vật ảnh. Ảnh nạp xong, đổi hay gỡ là vật mới nên lớp cũ tự bỏ; không cần `T.clearCache()`. Mỗi ảnh giữ tối đa 24 lớp. `khungVe` gọi `SC.veGd` vào lớp đang dựng; `khungDat` dán lớp lên `G.ux` (cùng luật làm mịn với `SC.veGd`).
- `T.slot`: lớp `(s + 2) × (s + 3)` gồm bóng, lót `C.bg` từ điểm thứ 2, rồi ảnh tại `(1, 1, s, s)`; tệp `-chon` tại `(0, 0, s + 2, s + 2)`. `o.dim` áp cho cả lớp.
- `T.bar` (cao từ 6): lớp vỏ `w × (h + 1)` gồm bóng và ảnh; lòng thanh là lớp `barL|…` trong bộ nhớ đệm thường, đặt tại `(x + cap, y + 2)`, cùng toạ độ với phần tụt dần. `kind` `mana` → `gd-khung-mana`, `xp` → `gd-khung-xp`, còn lại → `gd-khung-mau`.
- `T.bossBar`: thay riêng lời gọi `T.plate`; lót `rgba(22,15,10,0.8)` từ điểm thứ 2.
- `T.card`: lót như hình code (`C.dk` rồi màu lòng theo trạng thái), ảnh (đang chọn: `gdBien(…, 'sang')`), bậc ≥ 0 thì kẻ đường 1 điểm màu `RAR` ở vị trí vành màu bậc của hình code.
- `vien` ghi sẵn: ô đồ `[6,6,6,6]`, ô chọn `[7,7,7,7]`, vỏ thanh `[2,7,2,7]`, khung trùm `[7,10,7,10]`, trùm nhỏ `[6,9,6,9]`, tinh anh `[5,8,5,8]`, thẻ `[6,6,6,6]`. Khung chật hơn hai góc cộng lại (thẻ cao 13) thì `SC.veGd` tự thu góc.
- Trang công cụ: mảng `KHUNG9`, lô `id: 'khung9'` (`kieu: 'gian'`, `rong: true`, `xemKhung: true`); `phanTep` ghi `m.vien`; `tachNen` với `L.rong` chỉ coi là nét kẻ lưới khi nét dài hơn 1,15 ô; `veXemKhung` dùng bản game đầy đủ như lô Hình lớn.
