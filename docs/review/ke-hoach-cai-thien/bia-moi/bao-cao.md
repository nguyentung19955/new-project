# Báo cáo: Bìa game mới ở màn hình chính, bỏ Cu Tí đứng góc (15/10/2026)

Làm theo `YEU-CAU.md`. **Không chơi thử game**: chỉ `node --check` mọi tệp `game/js/*.js` (đạt), `build.py` (một tệp và `--hai-tep`, đạt mọi kiểm tra
của build), và ảnh soát tĩnh `xem-bia.png` (dựng bằng `dung-xem-bia.py`). Commit code: `9654fd3`.

## 1. Nền màn hình chính = ảnh bìa

- Tệp mới `game/js/bia.js` (nạp trước `village.js`). Mỗi lần mở game chọn **ngẫu nhiên 1 trong 2** bìa:
  `bia-1-cay-da` (ấm, cây đa + trống đồng) / `bia-2-dong-song` (kịch tính). Cờ: `?bia=1`, `?bia=2` ép bìa; `?biacu=1` = màn chào cũ (cảnh làng làm tối + Cu Tí + bố cục cũ, y như trước).
- `G.Title.draw()` (village.js): có bìa thì **không vẽ Cu Tí nữa**. Ảnh chưa về → vẽ cảnh làng sống như cũ (không Cu Tí); ảnh về → hiện dần 0,8 giây
  (ảnh đã có sẵn trước khung đầu thì hiện luôn). Ảnh đã hiện đủ thì thôi vẽ cảnh làng (đỡ việc). WebP và JPEG đều hỏng → giữ cảnh làng.
- Hiệu ứng nhẹ: **Ken Burns rất chậm** (phóng 1,03 ↔ 1,07 chu kỳ 50 giây, trôi ngang/dọc vài điểm ảnh, luôn phủ kín khung); **đom đóm** quanh cây đa
  (12 con ở bìa 1, 7 con ở bìa 2, trôi vòng nhỏ, sáng mờ theo nhịp); **ánh nước** lấp lánh (18–20 vệt ngắn trên mặt sông, màu theo phía: vàng / lam / đỏ).
  Hiệu ứng đi theo Ken Burns (vẽ trong toạ độ ảnh). Không lá rơi (để không rối).

## 2. Logo, chữ, nút (bố cục `TL_BIA` trong village.js)

| | Cũ (`TL_CU`, giữ cho ?biacu=1) | Bìa (`TL_BIA`) |
|---|---|---|
| Mặt trống nhỏ | (240, 30) r 20 | (240, 15) r 13 |
| Logo gd-logo | [140, 52, 200, 40] | [140, 30, 200, 40] — vùng trời tối trên giữa |
| SPIRITBLADE / câu giới thiệu | y 101,5 / 116 | y 79,5 / ô [90, 84, 300, 14] |
| Chơi ngay / Vào game | [140, 128, 200, 32] | [140, 176, 200, 30] / [160, 176, 160, 30] |
| Đăng nhập Google · Bảng vàng | y 166, cao 24 | y 212, cao 24 (cùng bề rộng) |
| Hàng nút khi không cần đăng nhập (row) | y 168 | y 213 |
| Dòng thông tin (2 dòng) | y 210 | ô [100, 247, 280, 18] |

- Lớp tối (bia.js `veMan`, canvas giao diện): elip tối dịu sau logo, dải dẹt sau câu giới thiệu (đầu câu nằm trên tán đa sáng ở bìa 1),
  dải mờ trên cùng (nút EN/VI), **dải tối dưới từ y 166** (0 → 0,8) cho nút. Trống đồng bìa 1 nằm ở y ≈ 123–167, x ≈ 98–142: dải bắt đầu đúng dưới mặt
  trống, nút đều ở y ≥ 176 và lệch phải → **không che trống**. Lớp tối phủ cả phần lề ngoài khung 16:9 (màn 4:3 có lề trên/dưới).
- Chữ: câu giới thiệu và dòng thông tin (2 dòng) đặt bằng **`T.chuTrongKhung`** (đo cả tiếng Anh, dài thì thu cỡ 8 → 6,5 / 7 → 6, cùng lắm cắt "…").
  Nút vẫn qua `T.btn` (đã dùng `T.chuTrongKhung` từ phiên chu-lech-khung). Dòng gợi ý "Mở bằng Chrome/Safari…" ở y 246, trên dòng thông tin.
- **Đăng nhập Google / lưu mây / ?cloud=0 không đổi logic**: chỉ dời toạ độ trong `TL` (cùng một đối tượng `G.titleLayout`, gán lại ở `enter()`),
  nên vùng bấm cho `G.syncTaps` (nút Đăng nhập chạy ngay trong lúc chạm, Safari không chặn cửa sổ), vùng loại trừ "chạm chỗ trống để vào"
  (`update()` dùng `TL.row`) và nút vẽ luôn trùng nhau. Nút đủ vùng chạm 31 đơn vị (nới vô hình), không chồng nhau (176–206 / 212–236).
- Bảng vàng mở trên màn chính: như cũ (T.dim + khung), nền là ảnh bìa.

## 3. Tải

- Ảnh: `tools/anh-truyen/dung.py` (thêm danh sách `BIA`): `docs/anh-goc/bia/*.png` → `game/art/bia/<tên>.webp` (960×540, q80) + `.jpg` (q80 progressive)
  + `.mo.jpg` (32×18, ~0,5 KB). Bìa 1: WebP 152 KB / JPEG 157 KB; bìa 2: 147 KB / 152 KB. (Ảnh nhiều chi tiết nên nặng hơn ảnh truyện.)
- `build.py`: khai `G.BIA_ANH`; bản ảnh rời chép `dist/anh/bia-<tên>.<mã>.webp|jpg` (sw.js đã lưu đệm lâu đúng mẫu tên này;
  `sprite_custom.js` donBanCuRoi giữ ảnh bìa khi dọn ảnh bản cũ); bản một tệp nhúng WebP `data:`.
- **Tải SỚM, không chặn**: build.py gắn `data-bia` (đường dẫn 2 bìa + bản mờ) vào `<div id="lk-tai">`. Thẻ `onanimationstart` sẵn có của màn tải HTML
  (không thêm thẻ script — build kiểm "đúng một thẻ script") chọn bìa, **bắt đầu tải đúng một bìa ngay khi trang còn đang về** (`window.LK_BIA`),
  WebP lỗi thì tự đổi JPEG. `bia.js` dùng lại ảnh đó; nếu mã game chạy trước khi thẻ kịp chọn thì bia.js chọn, tự tải, và đặt `LK_BIA` để thẻ không tải bìa thứ hai.
  Chạy thẳng `game/index.html` qua http: tải `art/bia/`; mở `file://` (các bài kiểm): không dùng ảnh → cảnh làng như cũ.
- Mục 4 (tuỳ chọn) — **đã làm**: màn tải `#lk-tai` lấy bản 32×18 của đúng bìa sắp hiện làm nền (trình duyệt phóng to tự mờ, phủ lớp tối 0,6).
  Nặng thêm ~1,5 KB trong trang (2 bản mờ dạng data:). Máy cầm dọc: chữ màn tải xoay, nền mờ không xoay (chỉ là mảng màu nhòe nên không lộ).

### Dung lượng (build.py --hai-tep)

| | Trước | Sau |
|---|---|---|
| Tải trước khi vào vùng đầu (trang nén + ảnh lõi [+ bìa]) | 4,87 MB | **5,02 MB** (+0,15 MB: một bìa WebP; trang nén 0,97 → 0,98 MB) |
| Người chơi tải (thước đo chính, trần 20 MB) | 15,46 MB | **15,61 MB** |
| Trình duyệt không có WebP | 18,32 MB | 18,48 MB |
| Bản một tệp (trần 30 MB) | 27,46 MB | 27,86 MB (nhúng 2 bìa WebP, +0,4 MB) |

Màn chào cũ không tải gì thêm cho nền (cảnh làng vẽ bằng ảnh lõi đã có), nên +0,15 MB là toàn bộ chi phí; ảnh tải song song, không làm chậm màn chào.

## 4. Ảnh soát tĩnh `xem-bia.png`

`python3 docs/review/ke-hoach-cai-thien/bia-moi/dung-xem-bia.py` — dựng lại đúng `TL_BIA` (đọc từ village.js) + lớp tối của bia.js + ảnh giao diện thật
(gd-trong-dong, gd-logo, gd-nut-chinh, gd-nut-thuong, gd-khung-bang): **2 bìa × VI/EN × {ngang 19,5:9, 4:3, dọc (game xoay)} + Bảng vàng mở** (16 ô).
Trạng thái vẽ: có mây, đang là khách (đông chữ nhất: 3 nút + 2 dòng thông tin). Phông đo DejaVu Sans (rộng hơn Be Vietnam Pro một chút).

Đo chữ (không ô nào tràn): Đăng nhập Google 112/138 (EN "Sign in with Google" 117/138), Bảng vàng 62/88 (EN 71/88), Chơi ngay 80/188,
câu giới thiệu VI 187/296, EN 238/296 (cỡ 8, không phải thu), dòng thông tin VI 273/280, EN 248/280 (2 dòng, cỡ 7).
Không vẽ đom đóm / ánh nước (động). Không mở game để chụp.

## 5. Chưa làm / cần chủ game xem

- Chưa xem trên máy thật (theo yêu cầu không chạy game): độ mượt Ken Burns + đom đóm, lúc ảnh hiện dần, màn tải có nền mờ.
- Bìa 2: đôi mắt và vòng thân dưới nước (giữa đáy ảnh) nằm sau dải tối và các nút — nút che phần "kịch tính" này. Nếu muốn thấy rõ hơn có thể giảm dải tối riêng bìa 2.
- Đang ở cách 2 tệp Đợt 10 (`LK_ANH_ROI=0`) thì `G.BIA_ANH = {}`: màn chào dùng bố cục bìa trên cảnh làng (không Cu Tí). Cách này hiện không dùng để đăng.
- Không sửa cloud.js / đăng nhập; rebase lên các commit của phiên khác (su-kien-ai, quyết định chủ game) không xung đột.
