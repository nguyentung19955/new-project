# Báo cáo phiên D2: đạo cụ nhỏ và con vật của làng bằng ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn D (Làng), phiên D2 (nối tiếp D1)

## Đã làm xong

**1. Game đã sẵn sàng nhận ảnh AI cho mọi hình nhỏ còn vẽ bằng code trong làng** (14 tệp):

| Hình | Mã tệp | Ghi chú |
|---|---|---|
| Cái đe, giếng, dây phơi, bảng tranh, cây rơm | `gd-lang-de`, `-gieng`, `-day-phoi`, `-bang-tranh`, `-cay-rom` | đứng yên |
| Chum | `gd-lang-chum` | một ảnh, game đặt 2 chiếc |
| Cột đèn | `gd-lang-cot-den` | một ảnh, game đặt 3 cột |
| Đèn lồng đỏ treo rời | `gd-lang-den-long` | xem mục "Chỗ tự quyết" |
| Con đò | `gd-lang-do` | vẫn nhấp nhô trên sông |
| Gà đứng, gà mổ thóc, con cóc | `gd-lang-ga`, `-ga-mo`, `-coc` | gà vẫn đi lại và mổ thóc, cóc vẫn nhún |
| Khung cửi (3 khung) | `hu-lang-khung-cui` | con thoi chạy đúng nhịp cũ |
| Lửa lò rèn (3 khung) | `hu-lang-lua-lo` | bập bùng đúng nhịp cũ, khói vẫn do game vẽ |

- Có tệp thì game dùng ảnh, đặt đúng chỗ hình cũ. Không có tệp thì vẽ như cũ.
- Game vẫn tự phủ màu chạng vạng lên đồ vật. Con vật và lửa giữ màu sáng, giống hình cũ.
- Chỗ em bé không đi vào được, chỗ đèn chập chờn, quầng sáng: giữ nguyên.
- Hiện **chưa có tệp ảnh nào** nên làng **y như cũ**. Lối chơi, bản lưu, đăng nhập Google, lưu mây không bị đụng tới.

**2. Trang Tách Làng có thêm 3 lô** (https://spiritblade.web.app/tach-lang.html, chọn ở bước 1):

- **Làng · 12 đạo cụ và con vật** (lưới 5 × 3)
- **Làng · Khung cửi (dải 3 khung)**
- **Làng · Lửa lò rèn (dải 3 khung)**, nền xanh dương

Mỗi lô có prompt dán thẳng ChatGPT, có đoạn bảng màu Linh Khí (gỗ, đá, vải, kim loại, nước, và mã màu cho gà, cóc, đèn lồng, rơm, chum). Mỗi lô có ảnh tham chiếu trang tự dựng từ hình hiện tại. Bước 4 xem thử trong cảnh làng: xem gần từng hình (phóng 8 lần), xem cả làng, đổi ban ngày / chạng vạng, so với hình cũ.

**3. Prompt** nằm ở `docs/review/lang-d2/PROMPT.md` (chép nguyên từ trang).

## Bạn cần làm gì tiếp

Làm lần lượt 3 lô, mỗi lô một tấm ảnh:

1. Mở trang Tách Làng trên iPhone, chọn lô ở bước 1, bấm **Sao chép prompt vẽ**.
2. Bấm **Lưu / gửi ảnh** để lấy ảnh tham chiếu (lô đạo cụ có 2 ảnh, hai lô dải khung có 1 ảnh).
3. Dán prompt vào ChatGPT, gửi kèm ảnh tham chiếu.
4. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang. Xem thử ở bước 4.
5. Ưng thì bấm nút tải .zip và gửi tệp cho Claude để đưa vào game.

## Đã kiểm

Một lượt thử tự động (ảnh chụp: `docs/review/lang-d2/anh-kiem.png`):

- Kiểm lỗi gõ mọi tệp code game, bài kiểm tra lưu mây, gói game: đều qua. Hai lần đẩy (game, rồi trang công cụ) đều qua kiểm tra tự động.
- **Không có tệp ảnh:** vẽ làng ở 6 chỗ và thời điểm khác nhau, thêm 2 ảnh cả làng (chạng vạng, ban ngày), so bản mới với bản trước khi sửa: **khác 0 điểm ảnh** ở cả 8 ảnh.
- **Trang công cụ**, bề rộng điện thoại (390), ảnh lưới mẫu máy tự dựng:
  - Lô đạo cụ: **ĐẠT**, đủ 12/12 hình, mọi tệp có `"net": 2`, ảnh đúng gấp đôi cỡ ghi trong tệp.
  - Lô khung cửi: **ĐẠT**, 3/3 khung, ra một tệp dải 168 × 44 (3 khung 28 × 22, nét gấp đôi).
  - Lô lửa lò (nền xanh dương): **ĐẠT**, 3/3 khung, ra một tệp dải 72 × 30 (3 khung 12 × 15).
  - Trang không tràn ngang. Nút tải tệp dải ra đủ 2 bản (nét cao và thường). Lô công trình của D1 thử lại vẫn ĐẠT 6/6.
- **Nạp tạm vào game thật** 3 đạo cụ (giếng, cây rơm, con đò) và 1 dải (khung cửi), không lưu vào repo: cả 4 hiện ảnh, đúng chỗ và đúng cỡ (lệch 0 điểm ảnh so với khung hình cũ; con đò lệch đúng 1 điểm vì đang nhấp nhô), không có lỗi của game.
- **Gỡ ra:** làng về y như cũ, khác 0 điểm ảnh.
- Thử riêng thêm một lần nạp đủ cả 14 tệp mẫu vào game thật: tất cả đều hiện, gỡ ra thì về như cũ.

Lưu ý:

- Hình trong ảnh kiểm là **hình mẫu máy tự dựng** (chính hình code cũ đổi sang màu xanh), không phải tranh thật. **Chưa thử với ảnh ChatGPT thật**, nên lần đầu dùng có thể phải chỉnh nhẹ (cắt mép, bấm "Nhỏ hơn" / "To hơn").
- Chưa thử trên điện thoại thật.
- Các hình này rất nhỏ trong game (con gà 9 × 7, đèn lồng 5 × 10 điểm ảnh). Tranh ChatGPT thu về cỡ đó có thể không đẹp hơn hình cũ bao nhiêu. Xem thử ở bước 4 rồi hãy quyết định hình nào đáng thay.
- Máy kiểm có vài dòng báo lỗi mạng và "404" không phải lỗi của game: máy kiểm không ra được mạng ngoài (phông chữ, tệp chạy nền của trang web), và trang công cụ thử tìm game ở chỗ thứ nhất không thấy rồi tìm ở chỗ khác (đúng thiết kế, D1 cũng vậy).
- Trang đã đăng lên web (kiểm tra tự động xanh), nhưng chưa mở thử bản trên web, chỉ thử bản trên máy kiểm.

## Dung lượng

Ảnh thêm vào game trong phiên này: **0 MB** (chưa có ảnh thật). Khi có đủ ảnh thật của cả 3 lô, ước thêm **dưới 0,1 MB** (khoảng 40 đến 80 KB), vì các hình đều rất nhỏ. Bộ 14 tệp mẫu trong lượt kiểm nặng 10 KB.

## Chỗ tự quyết (khác hoặc thêm so với kế hoạch)

- **Cỡ từng hình lấy theo số đo thật trong game**, không theo "ô 48 × 40" của kế hoạch: đe 18 × 13, giếng 34 × 18, dây phơi 40 × 26, bảng tranh 23 × 24, cây rơm 27 × 32, chum 11 × 12, cột đèn 9 × 26, đèn lồng 5 × 10, đò 49 × 26, gà 9 × 7, cóc 8 × 6, khung cửi 28 × 22. **Lửa lò là 12 × 15**, không phải 12 × 10 như kế hoạch ghi (ngọn lửa code cao 15 điểm).
- **Ảnh tỉ lệ 3:2** như lô D1 (ChatGPT hay ra ảnh 3:2), nên ô lưới không đúng 48 × 40. Không ảnh hưởng kết quả.
- **Đèn lồng rời (`gd-lang-den-long`).** Trong code, đèn lồng là một phần của công trình, cột đèn, con đò. Tôi cho nó làm việc như sau: có tệp này thì mọi chiếc đèn trên các vật **còn vẽ bằng code** đổi sang ảnh; vật nào đã có ảnh AI riêng thì dùng đèn vẽ sẵn trong ảnh đó. Hệ quả: khi mọi công trình, cột đèn, con đò đều đã có ảnh thì đèn lồng rời không còn hiện ở đâu. Nó có ích khi mới thay được một phần. Đèn treo từ giữa **đỉnh** ảnh (không phải giữa đáy).
- **Dây phơi không có quần áo.** Bản kiểm kê xếp "áo phơi lay theo gió" vào nhóm giữ code. Nên ảnh chỉ có 2 cọc và sợi dây, game vẫn vẽ áo lay theo gió đè lên. Nếu bạn muốn áo cũng là tranh (đứng yên, không lay) thì báo, sửa nhanh.
- **Chum:** code vẽ 2 chiếc. Ảnh chỉ vẽ MỘT chiếc, game đặt 2 lần.
- **Đàn gà 3 màu:** ChatGPT vẽ gà **trắng**, game tự nhuộm nâu và vàng cho 2 con kia (như hình cũ có 3 màu). Chưa có tệp "gà mổ" thì gà mổ thóc dùng luôn ảnh gà đứng. Chỉ có "gà mổ" mà không có "gà đứng" thì game vẫn vẽ code.
- **Gà mổ thóc được thu cùng tỉ lệ với gà đứng** để hai dáng to bằng nhau (nếu thu riêng, con đang cúi sẽ bị nhỏ hơn).
- **Con vật và lửa lò không bị phủ màu chạng vạng**, vì hình code của chúng cũng không bị phủ (sáng như người). Khung cửi và đồ vật thì có phủ.
- **Con đò:** prompt dặn không vẽ nước và bóng dưới đáy. Hình code có một vệt bóng nước sẫm dưới đáy đò; ảnh AI sẽ không có vệt đó.
- **Hai lô dải khung riêng** (khung cửi, lửa lò) thay vì gộp vào lô đạo cụ, vì mỗi dải là một tấm ảnh 3 khung của cùng một hình. Trang ghép 3 khung thành một tệp, thu chung một tỉ lệ, đặt sát đáy, giảm màu chung để phần đứng yên không nhấp nháy.
- **Sửa một lỗi tách ảnh có sẵn:** trang coi mọi nét mảnh và dài là đường kẻ lưới rồi xoá. Cọc đèn, cọc và dây phơi sẽ bị xoá mất. Giờ chỉ nét chạy ít nhất 30% bề ngang (hoặc chiều cao) ảnh mới bị coi là đường kẻ. Thay đổi này áp dụng cho cả lô công trình D1 (rễ phụ cây đa sẽ được giữ tốt hơn); đã thử lại lô D1 vẫn ĐẠT.
- **Xem thử dải khung trong trang:** bản game gói cho công cụ chưa có phần đọc dải khung (`fx_anh.js`), mà phiên này không được sửa `build.py`. Nên trang tự gắn một phần đọc tối thiểu để xem thử. Game thật dùng phần đọc thật, đã thử trong game thật.
- **Ảnh tham chiếu lô công trình (D1) giữ nguyên** (không có gà, cóc). Hàm vẽ cảnh cho công cụ nay vẽ thêm gà và cóc; ảnh tham chiếu lô đạo cụ có chúng.
- Thêm một dòng kiểu trang để phần đang ẩn thì ẩn thật (cần cho khung ảnh tham chiếu thứ hai ở hai lô chỉ có một ảnh).

## Điều nên biết khi vẽ

- Cột đèn: đèn lồng phải ở bên TRÁI thân cột, gần đỉnh, vì ánh đèn chập chờn của game nằm ở đó. Con đò: đèn ở phía mũi bên PHẢI.
- Giếng: mép thành giếng bên trái là chỗ con cóc ngồi.
- Lửa lò được vẽ đè lên miệng lò rèn ở chỗ cũ, kể cả khi lò rèn đã là ảnh AI của D1.
- Bảng tranh, cột đèn, dây phơi có cọc mảnh: prompt đã dặn vẽ nét dày. Nếu ChatGPT vẫn vẽ quá mảnh thì khi thu nhỏ sẽ mất nét, cần nhờ vẽ lại.

## Còn lại trong làng (chưa làm)

- Nền làng (cỏ, đường, sông, ao, sân đình, cầu bến đò, chiếu Cụ Đồ) và tranh bản đồ vùng: phiên D3.
- Giữ code theo bản kiểm kê: áo phơi lay, sậy, vệt nước, lá rụng, đom đóm, quầng đèn, khói lò, bong bóng nói.

## Hướng dẫn cho phiên D3

- Trang: thêm mục vào CUỐI mảng `LO`, thêm nhánh ở đầu `taoPrompt`. Kiểu lô đang có: `'vat'`, `'icon'`, `'gian'`, `'dai'` (dải khung, mới). Nền làng 720 × 270 là một tấm kín: cần kiểu mới bỏ qua bước tách nền.
- Ảnh tham chiếu: `taoThamChieu()` ghi vào `TC[id lô]` một mảng 1 hoặc 2 ảnh; `hienThamChieu()` tự hiện. Hàm `soTC()` cho biết lô cần mấy ảnh.
- Game (`village_scene.js`): mọi hình đứng yên đi qua `addNha(tên, y, hàm vẽ, lon)`; `anhNha()` đổi hình khi có tệp. `VS.nhaLang()` trả 6 công trình lớn, `VS.vatLang()` trả đạo cụ, con vật, 2 dải. Vật có cử động nằm trong `lopCui`, `lopDo`, `lopGa`, `lopCoc`, `luaLo`, dùng chung cho game và cho `VS.veTinh` của công cụ.
- Nền làng: thay `ground` trong `dung()`; nhớ soát mỗi khung hình như `anhNha` để ảnh nạp chậm vẫn lên. Có ảnh đèn lồng rời thì làng được dựng lại (xem `conDung`): làm tương tự cho nền nếu tiện.
- Nhớ `git pull --rebase` trước khi đẩy; đụng `game/dist/*` thì chạy lại `python3 game/build.py`.

## Tệp đã sửa / thêm

- Sửa: `game/js/village_scene.js` (và bản gói `game/dist/*`, `tools/xuong-sprite/index.html` do `build.py` tạo lại).
- Sửa: `tools/tach-lang/index.html`.
- Mới: `docs/review/lang-d2/` (báo cáo này, `PROMPT.md`, `anh-kiem.png`, 4 ảnh tham chiếu).
- Không sửa `sprite_custom.js`, `fx_anh.js`, `build.py`. Không thêm tệp nào vào `game/art/custom`. Không thêm chữ nào hiện cho người chơi nên không đụng từ điển ngôn ngữ.
