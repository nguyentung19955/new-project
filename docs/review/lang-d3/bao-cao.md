# Báo cáo phiên D3: nền làng và tranh bản đồ vùng bằng ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn D (Làng), phiên D3 (nối tiếp D1, D2)

## Tóm tắt một dòng

Game đã sẵn sàng nhận ảnh ChatGPT cho **2 tấm lớn**: nền làng (`gd-lang-nen`, 720×270) và tranh bản đồ ải (`gd-ban-do-vung`, 480×270). Chưa có tệp ảnh nào nên game **y hệt cũ** (đã so từng điểm ảnh: khác 0).

## Bạn cần làm gì tiếp

Chỉ cần vẽ **2 tấm ảnh**, mỗi lô một tấm.

1. Mở https://spiritblade.web.app/tach-lang.html, ở bước 1 chọn lô **Làng · Nền làng (1 tấm kín)** (gần cuối danh sách).
2. Bấm **Sao chép prompt vẽ**. Bấm **Lưu / gửi ảnh 1** và **Lưu / gửi ảnh 2** để lấy 2 ảnh tham chiếu.
3. Dán prompt vào ChatGPT, **gửi kèm cả 2 ảnh tham chiếu** (bắt buộc, nếu không đường, sông, ao sẽ sai chỗ).
4. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang.
5. Ở bước 4 bật **Hiện chỗ không đi được** và **Chồng mờ nền cũ để soi lệch**. Sông, ao, đường, sân đình, cây cầu phải nằm đúng chỗ. Lệch nhiều thì nhờ ChatGPT vẽ lại.
6. Ưng thì bấm nút tải .zip.
7. Làm lại y như vậy với lô **Làng · Tranh bản đồ vùng (1 tấm kín)**. Ở bước 4 bật **Hiện vị trí 15 ải**: rừng, hang biển, lâu đài phải nằm đúng dưới các ải của vùng mình.
8. Gửi hai tệp .zip cho Claude để đưa vào game.

Hai prompt đầy đủ và 4 ảnh tham chiếu chụp sẵn: `PROMPT.md` và các tệp `*-tham-chieu-*.png` cùng thư mục này.

## Đã làm

**1. Game** (`game/js/village_scene.js`)

| Hình | Mã tệp | Cỡ trong game | Hiện ở đâu |
|---|---|---|---|
| Nền làng: cỏ, hàng cây mép trên, sông, đường đất, sân đình, ao sen, cầu bến đò, chiếu Cụ Đồ | `gd-lang-nen` | 720×270 | cảnh làng |
| Tranh bản đồ vùng (cả 3 vùng trên một tranh) | `gd-ban-do-vung` | 480×270 | bản đồ ải của Chú Lái Đò |

- Có tệp thì game dùng ảnh làm lớp nền. Không có tệp thì vẽ bằng code như cũ.
- **Ảnh chỉ là lớp nền.** Chỗ em bé đi được, chỗ bị chặn, vị trí nhà, người, đồ vật, 15 thẻ ải, đường nối các ải, tên vùng: không đổi gì.
- Game vẫn tự phủ màu chạng vạng lên nền làng, tự vẽ sậy, vệt nước, quầng đèn, đom đóm đè lên. Tranh bản đồ vẫn được game kẻ viền và phủ màu đêm khi chơi độ khó 2.
- Ảnh nạp chậm hơn code vẫn lên: mỗi khung hình game soát lại, ảnh vừa có (hoặc vừa gỡ) thì đổi nền ngay và bỏ hình đã nhớ.
- Game vẽ cả 3 vùng trên MỘT tranh, nên chỉ có một mã `gd-ban-do-vung`, không chia 3 tranh theo vùng.

**2. Trang Tách Làng** (`tools/tach-lang/index.html`): thêm 2 lô ở cuối danh sách

- Kiểu lô mới **"tấm kín"**: cả ảnh là một hình, không tách nền. Trang tự bỏ hai dải hồng tím trên dưới, rồi đưa phần tranh về đúng 720×270 hoặc 480×270.
- Ảnh không đúng tỉ lệ thì chọn được: cắt bớt giữ tỉ lệ (dịch phần được lấy bằng 4 nút mũi tên) hoặc kéo giãn cho kín.
- Mỗi lô có prompt tiếng Việt một đoạn và **2 ảnh tham chiếu trang tự dựng từ chính code của game**:
  - Nền làng: ảnh 1 là nền hiện tại không nhà, không người; ảnh 2 là cùng cảnh khi đã đặt nhà, có phủ đỏ mờ chỗ không đi được.
  - Tranh bản đồ: ảnh 1 là tranh hiện tại; ảnh 2 có thêm 15 chấm ải đánh số.
- Bước 4 xem thử trong game thật, có **lớp phủ soi lệch** bật tắt được:
  - Nền làng: "Hiện chỗ không đi được", "Chồng mờ nền cũ để soi lệch", "Chỉ xem nền", xem gần 7 góc làng.
  - Tranh bản đồ: "Hiện vị trí 15 ải" (kèm chỗ game phủ bảng thông tin, tên vùng, người lái đò), "Xem màu đêm".
- Các lô cũ của D1, D2 không đổi.

**3. Prompt** chép nguyên vào `PROMPT.md`.

## Đã kiểm (một lượt tự động, ảnh mẫu máy tự dựng)

| Việc kiểm | Kết quả |
|---|---|
| `node --check game/js/*.js`, bài kiểm tra lưu mây, `python3 game/build.py` | đều qua |
| Game không có tệp, bản trước phiên so với bản mới, 844×390, 5 cảnh (đầu làng, giữa làng, bến đò, bản đồ ải, bản đồ ải độ khó 2) | **khác 0 điểm ảnh** ở cả 5 cảnh |
| Ảnh mẫu 1536×1024 có hai dải hồng tím đưa vào lô Nền làng | **ĐẠT**, ra đúng 720×270, kín, tự bỏ hai dải |
| Ảnh mẫu đưa vào lô Tranh bản đồ vùng | **ĐẠT**, ra đúng 480×270, kín |
| Ảnh mẫu KHÔNG có dải hồng tím (vẽ kín cả tấm 3:2) | trang báo "phần bị bỏ khá nhiều" (44% và 16% chiều cao); bấm "Kéo giãn cho kín" thì lấy hết ảnh, vẫn ĐẠT |
| Bước 4 của trang (nạp tạm vào bản game của công cụ) | nền làng và tranh bản đồ đổi sang ảnh mẫu; lớp phủ hiện đúng; ảnh mẫu cố ý vẽ lệch sang phải thì thấy rõ đường và sông lệch |
| Nạp tạm 2 tệp mẫu vào game thật | cả 5 cảnh đổi nền; nhà, người, thẻ ải vẫn đúng chỗ |
| Gỡ 2 tệp ra | game về đúng như đầu, **khác 0 điểm ảnh** |
| Trang ở bề rộng điện thoại (390) | không tràn ngang |
| Lỗi JavaScript (game, trang) | không có |
| Workflow đăng web | xanh (lượt chạy số 198) |

Ảnh kiểm: `anh-kiem.png`. Số đo đầy đủ: `so-do.json`. Chạy lại: `python3 docs/review/lang-d3/kiem.py <thư mục bản code cũ>`.

Lưu ý:

- Hình trong ảnh kiểm là **hình mẫu máy tự dựng** (chính nền code đổi màu, kẻ sọc, ghi chữ "HÌNH MẪU"), không phải tranh thật. **Chưa thử với ảnh ChatGPT thật.**
- Chưa thử trên điện thoại thật. Chưa mở thử bản trên web, chỉ thử bản trên máy kiểm.
- Không có ảnh nào được thêm vào `game/art/custom`.

## Dung lượng

Ảnh thêm vào game trong phiên này: **0 MB** (chưa có ảnh thật).

Ước lượng khi có ảnh thật. Đo bằng hai loại ảnh mẫu: hình phẳng (nhẹ nhất có thể) và hình "kiểu AI" có nhiễu hạt (gần ảnh thật hơn).

| Tấm | Nét thường | Nét gấp đôi |
|---|---|---|
| Nền làng 720×270 | 0,09 MB (hình phẳng) đến 0,26 – 0,41 MB (kiểu AI, 32 đến 128 màu) | 0,74 – 1,16 MB |
| Tranh bản đồ 480×270 | 0,05 MB (hình phẳng) đến 0,21 – 0,28 MB (kiểu AI) | không dùng được (xem dưới) |
| **Cộng 2 tấm** | **khoảng 0,15 đến 0,7 MB** | nền làng gấp đôi + bản đồ thường: khoảng 0,8 đến 1,4 MB |

Tác động lên trang chính (nên dưới 5 MB, hiện **3,42 MB**):

- Theo luật hiện tại trong `build.py`, mọi ảnh `gd-*` nằm trong trang chính. Tôi không đổi luật này.
- Dùng nét thường cho cả 2 tấm: trang chính lên khoảng **3,6 đến 4,1 MB**. Còn dưới 5 MB.
- Dùng nét gấp đôi cho nền làng: trang chính lên khoảng **4,2 đến 4,8 MB**. Sát mức 5 MB, trong khi người làng, giao diện, hình lớn của C3 cũng sẽ vào trang chính.

**Đề xuất: dùng nét thường cho cả 2 tấm.** Lý do:

1. Nhẹ hơn khoảng 3 lần.
2. Nền chỉ là lớp lót phía sau, nên dịu và ít chi tiết hơn nhà và nhân vật. Nhà, người, đồ vật (nét gấp đôi) đặt lên trên vẫn sắc.
3. Nền code hiện nay cũng là nét thường, nên không ai thấy bị kém đi.
4. Riêng tranh bản đồ: chỗ dùng tranh (`village.js`, ngoài phạm vi phiên này) dán thẳng ở cỡ 480×270, nên ảnh nét gấp đôi cũng bị thu về 480×270, không có lợi gì.

Vì vậy tệp .zip của trang đặt tên như sau (khác các lô cũ, người nhập ảnh cần biết):

- `gd-lang-nen.sprite.json` và `gd-ban-do-vung.sprite.json`: **nét thường**, là bản nên nhập.
- `gd-lang-nen.net2.sprite.json`: nét gấp đôi của nền làng, chỉ nhập nếu bạn duyệt. Game đã đọc được cả hai.

## Chỗ tôi tự quyết (không hỏi lại)

1. **Ảnh tham chiếu và ảnh ChatGPT vẽ đều là 3:2, phần tranh nằm giữa, hai dải hồng tím trên dưới.** ChatGPT chỉ vẽ được ảnh 3:2, không vẽ được ảnh dài 720×270. Nếu để nó tự xoay xở thì vị trí đường, sông sẽ sai. Có hai dải hồng tím thì trang biết chính xác chỗ cắt.
2. **Hai ảnh tham chiếu cho nền làng thay vì một.** Brief nói một ảnh nền có phủ mờ vùng đi được. Tôi tách làm hai: ảnh 1 sạch để ChatGPT vẽ lại, ảnh 2 có nhà và lớp phủ đỏ để nó hiểu bố cục. Lý do: sợ ChatGPT vẽ luôn màu phủ vào tranh.
3. **Cầu bến đò và chiếu Cụ Đồ nằm trong ảnh nền** (ChatGPT vẽ), đúng như bản kiểm kê ghi. Rủi ro: nếu ChatGPT vẽ lệch thì em bé đứng lệch cầu, Cụ Đồ ngồi lệch chiếu. Lớp phủ ở bước 4 cho thấy ngay.
4. **Ánh sáng:** brief ghi "ánh sáng chiều". Prompt viết "nắng chiều dịu nhưng màu vẫn sáng rõ như ban ngày, không nhuộm cam đỏ", vì game tự phủ màu chạng vạng lên trên, và nhà cửa của D1 cũng vẽ màu ban ngày. Vẽ sẵn hoàng hôn thì nền sẽ tối hai lần.
5. **Ba hình trùm nhỏ và la bàn trên tranh bản đồ do ChatGPT vẽ** (tranh code hiện có các hình này). Viền tranh thì game vẫn tự kẻ để mép luôn sắc.
6. **Bảng màu:** nền làng dùng nhóm cỏ cây, nước, đá, gỗ của bảng màu Linh Khí, thêm màu đường đất và gạch sân lấy từ nền code hiện tại. Tranh bản đồ dùng màu giấy cũ của tranh code hiện tại (bảng màu Linh Khí không có nhóm giấy).
7. **Số màu:** nền làng mặc định 128, tranh bản đồ 64. Thêm lựa chọn 128 vào ô "Số màu" của trang (các lô cũ vẫn mặc định như trước).
8. **Phần tranh đã sát tỉ lệ (lệch dưới 3%) thì lấy hết, không cắt**, để vị trí không xê dịch.
9. **Ảnh nền có chỗ trong suốt** thì chỗ đó lộ nền code bên dưới (không bị thủng đen). Trang báo lỗi nếu ảnh không kín.
10. Thêm tệp `kiem.py` và `so-do.json` vào thư mục báo cáo để chạy lại được lượt kiểm.

## Rủi ro còn lại

- **Chưa thử ảnh ChatGPT thật.** Đây là hai tấm khó nhất của làn Làng: ChatGPT phải giữ đúng vị trí theo ảnh tham chiếu. Có thể phải vẽ lại vài lần. Ảnh lệch thì game vẫn chạy đúng (chỗ đi được không đổi), chỉ là nhìn sai: em bé đi trên "nước", nhà đứng trên "đường".
- ChatGPT có thể bỏ hai dải hồng tím hoặc vẽ dải không đều. Trang có lối "Kéo giãn cho kín" và 4 nút dịch, nhưng khi đó hình sẽ hơi bẹt.
- Nền ảnh và hình code còn lại (sậy, vệt nước, áo phơi) có thể không hợp tông với nhau. Xem ở bước 4 rồi quyết.
- Nền làng dùng ảnh nhưng công trình còn là hình code (hoặc ngược lại) có thể lệch phong cách. Nên nhập nền sau khi đã có ảnh công trình D1.
- Mép bờ sông của game là đường uốn lượn cố định. Ảnh vẽ bờ lệch vài điểm thì vệt nước lấp lánh của game có thể chờm lên bờ.

## Cách quay lui

- Chưa nhập ảnh thì không có gì để quay lui: game y như cũ.
- Sau khi nhập ảnh mà không ưng: xoá tệp `gd-lang-nen.sprite.json` hoặc `gd-ban-do-vung.sprite.json` trong `game/art/custom`, chạy lại `python3 game/build.py`. Game về nền code.
- Bỏ hẳn phần code của phiên này: `git revert 5404783 5150b00` (trang công cụ, rồi game), chạy lại `python3 game/build.py`.

## Quyết định mới cần duyệt

1. **Nét thường hay nét gấp đôi cho nền làng.** Đề xuất: nét thường (lý do ở mục Dung lượng).
2. **Tranh bản đồ nét gấp đôi:** muốn có thì phải sửa một dòng trong `village.js` (ngoài phạm vi phiên này). Đề xuất: chưa cần.
3. **Hai tấm này có nên nằm trong trang chính không.** Đợt 10 đã nêu: hình lớn rơi vào trang chính theo luật `bat_buoc`. Nền làng cần ngay khi vào làng nên hợp lý là ở trang chính; tranh bản đồ chỉ cần khi mở bản đồ ải nên có thể tải sau. Tôi không đổi luật, chờ bạn hoặc người điều phối quyết.
4. **Cầu bến đò và chiếu Cụ Đồ:** nếu ảnh thật hay bị lệch, có thể cho game tự vẽ hai thứ này đè lên ảnh nền (việc nhỏ). Chờ xem ảnh thật rồi quyết.

## Tệp đã sửa / thêm

- Sửa: `game/js/village_scene.js` (và bản gói `game/dist/*`, `tools/xuong-sprite/index.html` do `build.py` tạo lại).
- Sửa: `tools/tach-lang/index.html`.
- Mới: `docs/review/lang-d3/` (báo cáo này, `PROMPT.md`, `anh-kiem.png`, 4 ảnh tham chiếu, `kiem.py`, `so-do.json`).
- Sửa một dòng: `docs/review/ke-hoach-cai-thien/TRANG-THAI.md` (dòng D3).
- Không sửa `village.js`, `ui_theme.js`, `sprite_custom.js`, `build.py`, `btn_art.js`, `fx*.js`. Không đổi bản lưu, đăng nhập, lưu mây. Không thêm chữ nào hiện cho người chơi nên không đụng từ điển ngôn ngữ.

## Hướng dẫn cho phiên nhập ảnh

- Nhập `gd-lang-nen.sprite.json` và `gd-ban-do-vung.sprite.json` (nét thường) vào `game/art/custom`. KHÔNG nhập `gd-lang-nen.net2.sprite.json` nếu chưa được duyệt; nếu nhập thì đổi tên thành `gd-lang-nen.sprite.json` (thay bản thường, không để cả hai).
- Sau khi nhập, chạy `python3 game/build.py --hai-tep` và ghi lại dòng "tệp đầu … MB".

## Đẩy lên

- `5150b00` (game) và `5404783` (trang công cụ) đã đẩy lên nhánh `khoi-tao-du-an`.
- Workflow đăng web cho lần đẩy này (lượt chạy số 198, commit `5404783`): **xanh**. Lần đẩy báo cáo chỉ có tài liệu nên không chạy workflow.
