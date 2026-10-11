# Báo cáo phiên C3: nút Nói chuyện, thẻ ải, mặt trống đồng và logo dùng được ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn C (Giao diện)

## Tóm tắt một dòng

Game đã sẵn sàng nhận ảnh ChatGPT cho **11 hình lớn**: nút tròn Nói chuyện (3 trạng thái), thẻ ải (3), thẻ ải trùm (3), mặt trống đồng ở màn chào, và logo chữ LINH KHÍ. Chưa có tệp ảnh nào nên game **y hệt cũ** (đã so từng điểm ảnh: khác 0).

## Bạn cần làm gì tiếp

Chỉ cần vẽ **2 tấm ảnh**.

1. Mở https://spiritblade.web.app/tach-giao-dien.html, chọn lô **Hình lớn · nút Nói chuyện, thẻ ải, mặt trống đồng (10 hình)** (gần cuối danh sách), bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Đưa ảnh vào bước 2 của trang. Xem thử ở bước 4. Ưng thì bấm **Tải tất cả (.zip)**.
3. Chọn lô **Logo · chữ LINH KHÍ (1 tấm riêng)**, làm lại y như vậy.
4. **Riêng logo: bạn tự đọc lại chữ trước khi tải.** Phải đúng "LINH KHÍ", có một dấu sắc trên chữ I cuối. Máy vẽ ảnh rất hay viết sai chữ có dấu, và công cụ không tự đọc được chữ.
5. Gửi hai tệp .zip cho Claude.

Hai prompt đầy đủ: `PROMPT.md` cùng thư mục này.

## Đã làm

**1. Game** (`game/js/ui_theme.js`, `game/js/village.js`)

| Hình | Mã tệp | Cỡ | Hiện ở đâu |
|---|---|---|---|
| Nút Nói chuyện: lúc nghỉ, sáng, đang bấm | `gd-nut-noi-chuyen`, `-sang`, `-bam` | 64×64 | góc dưới phải ở làng; trong ải khi đứng cạnh cổng dịch chuyển (nút "Vào cổng") |
| Thẻ ải: thường, đang chọn, chưa mở | `gd-the-ai`, `-chon`, `-khoa` | 38×30 | bản đồ ải của Chú Lái Đò |
| Thẻ ải trùm: thường, đang chọn, chưa mở | `gd-the-trum`, `-chon`, `-khoa` | 42×34 | bản đồ ải |
| Mặt trống đồng | `gd-trong-dong` | 42×42 | màn chào, phía trên tên game |
| Logo chữ LINH KHÍ | `gd-logo` | 200×40 | màn chào |

- Có tệp thì game vẽ ảnh, không có thì vẽ code như cũ. Không cần đủ cả 11 hình mới dùng được.
- **Thiếu hình trạng thái thì game tự lo.** Có hình "thường" mà thiếu "sáng" hoặc "chọn": game tự làm sáng hình thường. Thiếu "khoá": game tự làm tối và vẽ thêm ổ khoá nhỏ. Thiếu "bấm": game dùng hình sáng.
- Số ải, sao, chữ "Nói chuyện" / "Vào cổng" vẫn do game viết đè lên ảnh. Nút tự lún 1 điểm khi bấm. Nút lúc nghỉ vẫn được vẽ mờ một nửa như cũ.
- Ảnh nạp xong lúc nào hiện lúc đó; gỡ tệp ra thì về hình cũ ngay.
- Dòng chữ SPIRITBLADE và câu giới thiệu dưới logo vẫn là chữ của game.

**2. Trang công cụ** https://spiritblade.web.app/tach-giao-dien.html

- Hai lô mới ở cuối danh sách: **Hình lớn** (lưới 4×3, 10 hình, 2 ô cuối trống) và **Logo** (1 tấm riêng).
- Prompt tiếng Việt một đoạn, dán thẳng ChatGPT. Mọi chi tiết của hình vẽ code đều có trong prompt: vành đồng, vòng tối, ngôi sao 12 và 14 cánh, vòng chấm, đĩa giữa, bong bóng lời nói ba vạch, hai quai trống, ổ khoá, vòng sáng khi chọn; logo có mặt chữ vàng, vệt sáng, viền tối, bóng khối. Mặt trống đồng có thêm vành chim Lạc như bạn dặn.
- Prompt logo ghi rõ từng chữ cái, tả dấu sắc, liệt kê các kiểu viết sai, và dặn kiểm chính tả trước khi gửi.
- Ba hình của cùng một vật được thu theo **cùng một tỉ lệ**, nên vào game không hình nào to nhỏ hơn hình nào.
- Bước 4 **xem thử**: (a) từng hình ở từng trạng thái, do chính code giao diện của game vẽ; (b) một màn của game thật, có nút "Đổi cảnh": bản đồ ải, làng, màn chào. Có nút so với bản vẽ code cũ.
- Các lô cũ (bản đồ, nút điều khiển, biểu tượng nhỏ) không đổi.

## Đã kiểm (một lượt tự động, ảnh mẫu máy tự dựng)

| Việc kiểm | Kết quả |
|---|---|
| Ảnh lưới mẫu 4×3 đưa vào lô Hình lớn | **ĐẠT**, tìm được 10/10 hình, mọi tệp ghi `"net": 2`, ảnh đúng gấp đôi cỡ trong game |
| Ảnh logo mẫu đưa vào lô Logo | **ĐẠT**, tệp 400×80, `"net": 2`; dấu sắc trên chữ Í còn nguyên |
| Game không có tệp, bản trước phiên so với bản mới, 844×390, 4 cảnh (màn chào, bản đồ ải, làng đứng cạnh người, làng không ai ở gần) | **khác 0 điểm ảnh** ở cả 4 cảnh |
| Nạp tạm đủ 11 tệp mẫu vào game | hình hiện đúng chỗ, đúng cỡ ở cả 4 cảnh; phần khác chỉ nằm ở logo, mặt trống, thẻ ải, nút |
| Chỉ nạp 3 tệp "thường" | thẻ đang chọn tự sáng lên, thẻ khoá tự tối và có ổ khoá, nút tự sáng khi có người ở gần |
| Gỡ tệp mẫu ra | game về đúng như lúc đầu, khác 0 điểm ảnh |
| Bước 4 của trang công cụ | vẽ được cả ba cảnh trên game thật; bản lưu của người chơi không bị ghi; tệp đang làm dở của Xưởng Sprite còn nguyên |
| Lỗi JavaScript | không có (game, trang công cụ) |
| `node --check game/js/*.js`, bài kiểm tra lưu mây, `python3 game/build.py` | đều qua |
| Workflow đăng web | xanh sau mỗi lần đẩy |

Ảnh kiểm: `anh-kiem.png`. Từ trên xuống: (1) màn chào, code và có tệp; (2) bản đồ ải: code, đủ tệp, chỉ tệp thường; (3) làng và nút Nói chuyện phóng to; (4) và (5) bước 4 của trang công cụ.

Lưu ý: hình trong ảnh kiểm là **hình mẫu máy tự vẽ để thử** (vòng tròn, ngôi sao, chữ phông máy), không phải tranh thật. Không có ảnh nào được thêm vào `game/art/custom`; ảnh mẫu đã xoá.

Chạy lại: `python3 docs/review/giao-dien-c3/kiem.py <thư mục bản code cũ>`.

## Nên biết

- **Nút bằng ảnh to hơn nút cũ một chút** (khoảng 64 so với 61 điểm), vì ảnh phủ kín ô 64×64, còn hình code chừa mép cho bóng đổ.
- **Bóng đổ dưới nút và dưới thẻ không còn khi dùng ảnh.** Prompt dặn không vẽ bóng, vì bóng mờ trên nền hồng tím rất khó tách sạch. Nếu bạn thấy thiếu, game có thể tự vẽ bóng dưới ảnh, việc nhỏ.
- **Vòng chấm sáng rời quanh nút và quanh thẻ đang chọn** (hình code có) được đổi trong prompt thành một vòng sáng liền nét dính sát vành. Lý do: công cụ tách ảnh coi chấm rời là vụn và bỏ đi.
- **Logo:** ô đặt ảnh là 200×40, trùm đúng chỗ chữ cũ. Ảnh được thu vừa ô và giữ tỉ lệ, không bị kéo méo.
- **Tiếng Anh:** logo là tên game nên giữ nguyên ở cả hai ngôn ngữ, giống hiện nay.
- Hình "thường" của nút nên vẽ màu trầm (prompt đã dặn), vì game còn vẽ mờ thêm một nửa.

## Chỗ tôi tự quyết (không hỏi lại)

1. **Phần xem thử nạp bản game thử đầy đủ** (`xuong-sprite-thu.html`, đã có sẵn trên web) chứ không nạp `xuong-sprite.html` như C1/C2. Lý do: bản `xuong-sprite.html` không có phần vẽ giao diện và màn chào; muốn thêm phải sửa `game/build.py`, mà tệp đó phiên Đợt 10 đang sửa. Bản game thử vốn đã tắt ghi bản lưu và trang mở nó ở chế độ không dùng mây. Mặt trái: lần đầu nạp nặng hơn (khoảng 10 MB), chờ vài giây.
2. **Thu ba trạng thái theo cùng tỉ lệ** (đã nói ở trên).
3. **Thẻ khoá tự làm thì vẽ thêm ổ khoá nhỏ của code**, để người chơi vẫn biết là ải chưa mở.
4. Thêm một kiểu lô mới trong trang công cụ ("cả ảnh là một hình, giữ tỉ lệ") cho logo. Nếu tách logo theo kiểu lưới thì dấu sắc bị coi là vụn và mất.
5. Màu viền trong hai prompt này là `#1a120a` (nâu đen của bộ giao diện trống đồng), không phải `#14182e` của nhân vật, để hợp với các khung bảng game đang vẽ quanh đó.

## Chưa làm, chưa thử

- Chưa thử trên iPhone thật và chưa thử với ảnh ChatGPT thật. Lần đầu có thể cần chỉnh ở bước 3 (nút "Nhỏ hơn / To hơn") hoặc nhờ ChatGPT vẽ lại vài ô.
- Nút "Vào cổng" trong ải chưa chụp trong game (cần đánh xong trùm mới có cổng). Nó dùng chung đúng hàm vẽ với nút Nói chuyện và đã hiện ở bước 4 của trang công cụ.
- Chỉ chụp ở 844×390. Không chạy bộ test dài (theo lời dặn).
- Trong lúc làm có Đợt 8b và Đợt 10 đẩy lên. Đã gộp (chỉ đụng nhau ở `game/dist`, đã gói lại). Lượt kiểm ảnh chạy trên bản đã gộp với 8b.

## Tệp đã đổi

- `game/js/ui_theme.js`: `T.round`, `T.stageCard`, `T.drum` và một khối hàm trợ giúp nhỏ (`gdCo`, `gdBien`, `gdVe`).
- `game/js/village.js`: `titleLogo`, thêm ô `logo` vào `G.titleLayout`.
- `game/dist/*`: gói lại.
- `tools/tach-giao-dien/index.html`: hai lô mới, prompt, xem thử.
- `docs/review/giao-dien-c3/`: báo cáo, `PROMPT.md`, `anh-kiem.png`, `kiem.py`.
- `docs/review/ke-hoach-cai-thien/TRANG-THAI.md`: dòng C3.

## Dung lượng

Không thêm ảnh nào. Bản gói tăng khoảng 5 KB (10.576.697 → 10.581.495 byte). Khi bạn gửi đủ 11 hình, ước chừng thêm 60 đến 100 KB (ước lượng, chưa đo; logo 400×80 là hình nặng nhất).

## Rủi ro còn lại

- Ảnh thật có thể lệch tâm vài điểm so với số ải game viết lên. Sửa bằng nút chỉnh cỡ ở bước 3 hoặc vẽ lại ô đó.
- Logo sai chính tả là rủi ro lớn nhất, và chỉ người nhìn mới bắt được.

## Cách quay lui

- Chưa có tệp ảnh thì không có gì để quay lui: game đang vẽ y như cũ.
- Sau này có ảnh mà không ưng: xoá các tệp `gd-nut-noi-chuyen*`, `gd-the-ai*`, `gd-the-trum*`, `gd-trong-dong`, `gd-logo` khỏi `game/art/custom` rồi gói lại.
- Bỏ hẳn phần code: `git revert` commit "Giao diện C3 (game)" (`a711d35`) và commit "Giao diện C3 (công cụ)" (`0d26de4`) cùng commit chỉnh prompt đi sau nó.

## Quyết định cần bạn duyệt

1. Có muốn game tự vẽ bóng đổ dưới nút và thẻ khi dùng ảnh không? Mặc định: không.
2. Nút bằng ảnh to hơn nút cũ khoảng 3 điểm. Mặc định: giữ.

## Cho người làm kỹ thuật

- Ảnh không đi qua bộ nhớ đệm `layer()` của `ui_theme.js`: mỗi lần vẽ hỏi `SC.gdSan`, vẽ bằng `SC.veGd`. Bản tự làm sáng / tối nhớ theo từng ảnh bằng `WeakMap` (`gdBien`), nên nạp ảnh mới là tự bỏ bản cũ. `G.theme.gdHinhLon = { co, bien }` cho công cụ và bài kiểm tra.
- `T.round`: chỉ `kind === 'talk'` dùng ảnh. Ảnh đặt đúng ô của lớp code `(cx − r − 3, cy − r − 3, 2r + 8, 2r + 8)`, cộng 1 điểm khi bấm.
- `T.stageCard`: ảnh đặt ở `(round(cx − cw/2), top − 1, cw, chh)` để tâm ảnh trùng tâm mặt trống code (chỗ viết số ải).
- `T.drum`: ô `(cx − r − 1, cy − r − 1, 2r + 2, 2r + 2)`, giữ độ đậm `alpha`.
- Trang công cụ: mảng `LON`; lô `id: 'lon'` (`kieu: 'icon'`, mỗi hình có `nhom`) và `id: 'logo'` (`kieu: 'mot'`: tách như lô khung, thu như lô biểu tượng, không có `vien`). `lamMon` lấy tỉ lệ nhỏ nhất trong nhóm. Xem thử: `napGameDu`, `datGameDu`, `datCanh`, `veXemLon`; khung ẩn 960×540; tạm cất khoá `xuongSprite.thu` trong lúc nạp rồi trả lại; `G.noRender = true` để game ẩn không tự vẽ liên tục.
