# Báo cáo phiên D1: công trình làng bằng ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn D (Làng), phiên D1

## Đã làm xong

**1. Game đã sẵn sàng nhận ảnh AI cho 6 công trình lớn của làng:** cổng làng, đình làng, cây đa, lò rèn, sạp hàng xén, nhà thợ may.

- Có tệp ảnh thì cảnh làng dùng ảnh thay hình vẽ bằng code. Ảnh được đặt đúng chỗ công trình cũ (giữa đáy ảnh nằm đúng chân công trình).
- Game vẫn tự phủ màu chạng vạng lên ảnh, vẫn tự vẽ lửa lò, khói, ánh đèn lồng chập chờn và quầng sáng như cũ.
- Chỗ em bé không đi vào được (tường đình, gốc đa, lò rèn…) giữ nguyên.
- Hiện **chưa có tệp ảnh nào** trong game nên làng **y như cũ**. Lối chơi, bản lưu, đăng nhập Google, lưu mây không bị đụng tới.

**2. Trang công cụ mới: Tách Làng**
Địa chỉ: https://spiritblade.web.app/tach-lang.html (các trang tách khác đã có mục "Làng" ở cuối thanh menu).

- Bước 1: prompt dán thẳng ChatGPT, kèm **2 ảnh tham chiếu** trang tự dựng từ hình làng hiện tại (cảnh làng ban ngày, và 6 công trình xếp đúng lưới). Có nút lưu hoặc gửi ảnh ngay trên iPhone.
- Bước 2 và 3: đưa ảnh ChatGPT vào, trang tách thành 6 tệp, tự kiểm, tải 2 bản (nét gấp đôi + thường).
- Bước 4: **xem thử trong cảnh làng thật của game**. Xem gần từng công trình, xem cả làng, đổi qua lại với hình cũ, xem màu ban ngày, và bật "Hiện chỗ không đi được" để soi ảnh có khớp chỗ chặn đường không.

**3. Prompt** nằm ở `docs/review/lang-d1/PROMPT.md` (chép nguyên từ trang).

## Bạn cần làm gì tiếp

1. Mở trang Tách Làng trên iPhone, bấm **Sao chép prompt vẽ**.
2. Bấm **Lưu / gửi ảnh 1** và **Lưu / gửi ảnh 2** để lấy 2 ảnh tham chiếu.
3. Dán prompt vào ChatGPT, gửi kèm 2 ảnh đó.
4. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang. Xem thử ở bước 4.
5. Ưng thì bấm **Tải tất cả (.zip)** và gửi tệp cho Claude để đưa vào game.

## Đã kiểm

Một lượt thử tự động (ảnh chụp: `docs/review/lang-d1/anh-kiem.png`):

- Kiểm lỗi gõ mọi tệp code game, bài kiểm tra lưu mây, gói game: đều qua.
- **Không có tệp ảnh:** chụp làng ở 3 chỗ (đầu, giữa, cuối làng) và màn chào, so bản mới với bản trước khi sửa: **khác 0 điểm ảnh**. (Ở màn chào đã che dòng "Phiên bản…" vì dòng này đổi theo giờ gói.)
- **Trang công cụ:** ảnh lưới mẫu 3×2 tự dựng tách ra **ĐẠT**, đủ 6/6 hình, mọi tệp có `"net": 2`, ảnh đúng gấp đôi cỡ ghi trong tệp, bản thường đúng cỡ. Trang không tràn ngang ở bề rộng điện thoại (390).
- **Nạp tạm 6 tệp đó vào game** (không lưu vào repo): cả 6 công trình hiện ảnh, đúng chỗ và đúng cỡ (lệch 0 điểm ảnh so với khung hình cũ), không có lỗi của game.
- **Gỡ 6 tệp ra:** làng về y như cũ, khác 0 điểm ảnh.

Lưu ý:

- Ảnh trong ảnh kiểm là **hình mẫu máy tự dựng** (chính hình code cũ đổi sang màu xanh cho dễ nhận), không phải tranh thật. Chưa thử với ảnh ChatGPT thật, nên lần đầu dùng có thể cần chỉnh nhẹ (cắt mép, bấm "Nhỏ hơn" / "To hơn").
- Chưa thử trên điện thoại thật.
- Máy kiểm có 3 dòng báo "404" không phải lỗi của game: máy kiểm không có tệp chạy nền của trang web (bản cũ cũng báo y vậy), và trang công cụ thử tìm game ở chỗ thứ nhất không thấy rồi tìm ở chỗ khác (đúng thiết kế).
- Màn chào khi mở lại lần hai trong cùng một lượt thử thì khác lần đầu vài nghìn điểm ảnh, kể cả khi không sửa gì (do hiệu ứng động của màn chào). Vì vậy chỉ so lần mở đầu tiên.

## Chỗ tự quyết (khác hoặc thêm so với kế hoạch)

- **Cỡ từng công trình** lấy theo số đo thật trong game, không theo số ước lượng trong bản kiểm kê: đình 144×70 (kế hoạch ghi 145×70), cây đa 103×82 (105×86), lò rèn 84×71 (84×73), hàng xén 73×55 (73×56), nhà may 77×54 (76×58). Cổng làng 62×56 giữ nguyên. Trang công cụ tự đọc lại số đo từ game mỗi lần mở.
- **Cách đặt cỡ:** mỗi ảnh được thu vừa trong khung của hình cũ, giữ tỉ lệ, cắt sát hình. Ảnh ChatGPT có tỉ lệ khác hình cũ thì không bị méo, chỉ nhỏ hơn một chiều. Chỉnh được từ 50% đến 140% bằng nút "Nhỏ hơn" / "To hơn".
- **Hai ảnh tham chiếu thay vì một.** Kế hoạch chỉ nói ảnh cảnh làng. Thêm ảnh thứ hai (6 công trình xếp đúng lưới) vì game vẽ lửa lò, khói, ánh đèn đè lên đúng chỗ cũ, nên ChatGPT cần thấy rõ chỗ miệng lò, ống khói, đèn lồng của từng công trình.
- **Ảnh tham chiếu vẽ màu ban ngày** (bỏ lớp màu chạng vạng), vì prompt yêu cầu vẽ màu ban ngày để game tự phủ tối.
- **Ô lưới vuông, ảnh tỉ lệ 3:2** thay cho "ô 160×100": ChatGPT hay ra ảnh 3:2, lưới 3×2 trên đó cho ô vuông. Cỡ trong game của từng hình vẫn ghi trong prompt.
- **"Xoá bộ nhớ đệm khi ảnh nạp xong":** làm theo cách nhẹ hơn. Mỗi khung hình game soát 6 công trình, cái nào ảnh vừa có (hoặc vừa bị gỡ) thì đổi riêng cái đó, không dựng lại cả làng. Kết quả như nhau, không giật.
- **Mảnh nhỏ rời** (đòn gánh, đèn lồng treo rời) nằm sát thân hình được giữ lại khi tách. Trang Tách Giao Diện bỏ các mảnh này, nên ở lần thử đầu sạp hàng xén bị mất đôi quang gánh; đã sửa trong trang Tách Làng.
- Thêm mục "Làng" vào cả trang Tách Phòng (trang mới của làn A), và thêm mục "Phòng" vào menu trang Tách Làng cho đủ.

## Điều nên biết khi vẽ

- Cái đe, khung cửi, dây phơi, giếng, bảng tranh, cây rơm, cột đèn, con đò vẫn là hình code (phiên D2 sẽ làm). Nền làng (cỏ, đường, sông, ao, sân đình) là phiên D3.
- Lửa trong miệng lò và khói trên ống khói do game vẽ đè lên ảnh ở đúng chỗ cũ. Nếu ChatGPT vẽ lò ở chỗ khác thì lửa sẽ lệch: xem ở bước 4, cần thì nhờ vẽ lại.
- Ánh đèn lồng chập chờn cũng ở chỗ cũ. Đèn lồng trong ảnh lệch một chút thì vẫn ổn vì quầng sáng rộng.

## Hướng dẫn cho phiên D2 và D3 (dùng tiếp trang Tách Làng)

- **Thêm lô:** thêm một mục vào CUỐI mảng `LO` trong `tools/tach-lang/index.html` (`id`, `ten`, `kieu`, `cot`, `hang`, `mau`, `net`, `xem`, `ds`), và một nhánh `if (L.id === '…')` ở đầu hàm `taoPrompt`.
- **Kiểu lô có sẵn:** `'vat'` (vật đứng trong cảnh: thu vừa khung, giữ tỉ lệ, cắt sát, game đặt giữa đáy vào chân vật; hợp cho đạo cụ D2), `'icon'` (thu vừa ô, đặt giữa), `'gian'` (kéo giãn kín cỡ đích). Nền làng 720×270 của D3 là một tấm kín, không có nền hồng tím: cần thêm kiểu mới bỏ qua bước tách nền (xem `tachKhung` ở trang Tách Giao Diện làm mẫu cho "cả ảnh là một hình").
- **Móc game (`game/js/village_scene.js`):**
  - Công trình lớn đi qua `addNha(tên, y, hàm vẽ)` trong `dung()`; `anhNha()` đổi hình khi có `gd-lang-<tên>`. Đạo cụ D2 (đe, giếng, bảng tranh, cây rơm, chum, cột đèn…) chỉ cần đổi `add(...)` thành `addNha('<tên>', ...)` và thêm tên vào mảng `NHA`. Cột đèn có 3 cái dùng chung một ảnh: gọi `addNha` ba lần cùng tên là được.
  - Vật có cử động (con đò nhấp nhô, khung cửi 3 khung, gà, cóc) vẽ ở `VS.drawWorld`, chưa qua `anhNha`: D2 phải móc riêng ở đó.
  - Nền làng D3: thay `ground` trong `dung()`; nhớ làm theo kiểu `anhNha` (soát mỗi khung hình) để ảnh nạp chậm vẫn lên.
- **Xem thử** dùng `G.villageScene.veTinh(bút, { t, k, ngay, nguoi })` của game, nên hình nào game đã móc thì bước 4 tự hiện, không phải sửa phần xem thử. `G.villageScene.nhaLang()` trả về chỗ, cỡ và điểm chân của từng công trình (trang dùng để lấy cỡ đích và vẽ khung nét đứt). `veTinh` cũng phải vẽ thêm vật động nếu D2 móc chúng.
- **Lớp phủ chỗ không đi được** (nút ở bước 4) đã có sẵn, D3 dùng luôn để soi nền.
- **Ảnh tham chiếu:** hàm `taoThamChieu()` dựng 2 ảnh cho lô công trình. Lô mới muốn có ảnh tham chiếu riêng thì dựng thêm ở đó; khối ảnh tham chiếu đang chỉ hiện với lô `cong-trinh`.
- Nhớ `git pull --rebase` trước khi đẩy; đụng `game/dist/*` thì chạy lại `python3 game/build.py`.

## Tệp đã sửa / thêm

- Sửa: `game/js/village_scene.js` (và bản gói `game/dist/*`, `tools/xuong-sprite/index.html` do `build.py` tạo lại).
- Mới: `tools/tach-lang/index.html`.
- Thêm một dòng menu: `tools/tach-quai`, `tach-anh-hung`, `tach-do`, `tach-hieu-ung`, `tach-ghep`, `tach-giao-dien`, `tach-phong`.
- Mới: `docs/review/lang-d1/` (báo cáo này, `PROMPT.md`, `anh-kiem.png`, 2 ảnh tham chiếu).
- Không sửa `sprite_custom.js`, `build.py`. Không thêm chữ nào hiện cho người chơi nên không đụng từ điển ngôn ngữ. Dung lượng ảnh thêm vào game: 0 MB.
