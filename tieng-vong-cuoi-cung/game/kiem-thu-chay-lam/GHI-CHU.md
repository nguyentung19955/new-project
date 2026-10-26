# Ghép clip chạy Lam rig-v3 vào game – ghi chú + kết quả kiểm (26/10/2026)

Làm theo `art/modular/lam-moi/YEU-CAU-TICH-HOP-CHAY.md` (phương án **a**: giữ tốc độ game 264 px logic/s, phát clip theo quãng đường).
Không đổi collider, tốc độ, lực nhảy, khoảng cách màn, đòn đánh. Không đụng `art/the-gioi-moi/` (quái/boss/gạch giữ nguyên bản cũ).

Chơi thử: https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
(demo.html tự tải `../art/modular/lam-moi/rig-v3/sprite/lam-chay-2x.json` + `.png` theo đường dẫn tương đối.)
Thêm `?debug=anim` vào địa chỉ để xem bảng: trạng thái, khung, **pha**, dx thực.

## 1. Đã làm gì
| File | Thay đổi |
|---|---|
| `game/demo.html` | Lam chibi cũ → **Lam mới**: clip chạy = `rig-v3/sprite/lam-chay-2x.png` + `.json` (cùng thư mục). Biến pha liên tục, chọn khung theo quãng đường, vẽ ½ quanh neo chân, khung TẠM cho trạng thái chưa có clip, Tiếng Vọng ghi pha + khung. Nền parallax cũ (đã bị xoá) → **nền gradient TẠM** (`drawNenTam`). Thêm `<meta charset="utf-8">` (chạy thẳng từ link không lỗi dấu). |
| `game/build-demo.py` | Nhúng JSON + **PNG nguyên bản** của Lam mới (không nén lại/đổi cỡ, kiểm 2142×970) + dáng nghỉ TẠM; bỏ nền cũ; quái/thế giới vẫn WebP. Bản build ≈ 2,9 MB (không commit, đã có `.gitignore`). |
| `game/anim/lam-nghi-2x.png` | MỚI – dáng nghỉ TẠM render từ rig-v3 (xem mục 3). |
| `game/tools/lam-dang-nghi.py` | MỚI – sinh ảnh trên từ rig-v3 (cùng hộp, cùng cách vẽ với sheet). |
| `game/tools/kiem-thu-chay-lam.py` | MỚI – kiểm thử tự động trong Chromium headless, xuất video/GIF/số đo ở thư mục này. |
| `game/anim/lam-chibi.json/.png` | **Đã xoá** (không còn dùng). |

### Kiểm ảnh khi nạp (yêu cầu 1)
Khi nạp, game kiểm ảnh thực `naturalWidth×naturalHeight` **= 2142×970** và **= `co_sheet` trong JSON**, số khung = `so_khung`,
dáng nghỉ đúng cỡ ô 266×241. Sai → màn nạp báo lỗi rõ và không vào game. Đã thử thay PNG bằng bản bị thu 2048×927:
game báo *"ảnh lam-chay-2x.png cỡ 2048×927 – phải đúng 2142×970 và trùng co_sheet trong JSON (2142×970). Dùng PNG + JSON cùng
lấy từ rig-v3/sprite/."* `build-demo.py` cũng dừng với thông báo tương tự nếu ảnh sai cỡ.

## 2. Cách phát theo quãng đường (yêu cầu 2, 3)
- Mỗi bước logic (60/s), trong `updatePlayer`: `dxT = pl.x sau moveX − pl.x trước moveX` = **dịch ngang thực sau va chạm**,
  không dính camera. Va tường → moveX chặn → dxT = 0.
- Trong `lamChon()` (chạy ngay sau `updatePlayer`, vẫn trong bước logic): **chỉ khi CHẠY TRÊN ĐẤT**
  `pl.pha = (pl.pha + |dxT| / 83.66) % 1; khung = floor(pha × 32)`. 83,66 đọc từ JSON (`quang_duong_moi_chu_ky_px_logic`).
- `pl.pha` **không bao giờ bị reset** (kể cả khi dừng, nhảy, quay đầu, đổi tốc độ); các trạng thái khác chỉ không cộng pha.
  Lướt, nhảy, rơi, bị đẩy (trúng đòn), đòn đánh có trạng thái riêng.
- "Đang chạy" = trên đất, dxT ≠ 0 và |vx| > 0,6 (giữ chạy tới |vx| > 0,05 khi đang giảm tốc / quay đầu, như trễ cũ).
  Va tường → dxT = 0 → chuyển sang dáng đứng, **pha đứng yên**; chạy lại thì tiếp từ đúng pha cũ.
- Vẽ: điểm neo (123, 234) của ô đặt đúng chân nhân vật (giữa đáy hitbox 20×30), vẽ ½ ô (133×120,5 px logic → Lam cao
  112 px), `imageSmoothingEnabled = true`, `imageSmoothingQuality = 'high'` (không nearest). Quay trái: `scale(-1,1)` tại chân
  → lật quanh neo x. Nội suy vị trí khi vẽ như cũ; khung chỉ chọn trong bước logic.
- Ở 4,4 px/bước (264 px/s): **19,01 bước logic/chu kỳ = 0,317 s**, 6,31 bước chân/giây, mỗi bước logic tiến 1,68 khung sheet.

## 3. Khung TẠM (chưa có clip mới – không trộn sheet chibi cũ)
| Trạng thái game | Hình đang dùng (TẠM) |
|---|---|
| đứng, tiếp đất, rút dao khi vào ải, 6 đòn chém, bị đánh, bám tường, chết (mờ dần) | **dáng nghỉ** `anim/lam-nghi-2x.png` – render từ rig-v3 (`lam-moi-v3.json → tu_the_nghi`) bằng chính hàm vẽ + thu nhỏ của `rig-v3/code/sprite.py`, cùng hộp thế giới trong JSON → cùng ô 266×241, cùng neo (123,234), cùng tỉ lệ 2x. Kiểm: vẽ lại khung chạy 0 cùng cách lệch alpha ≤ 1/255 so với sheet; dáng nghỉ cao đúng 224 px nguồn = 112 px logic, đáy đế ở hàng 233. (Sheet chạy không có khung nào hai chân cùng chạm đất nên dùng render dáng nghỉ.) |
| nhảy, rơi, lướt | **khung 14** của clip chạy (khung bay, hai chân rời đất) |

Thời lượng đòn đánh / rút dao giữ đúng số cũ (trước đây đọc từ sheet chibi; nay ghi cứng cùng giá trị) → gameplay không đổi,
nhưng **trong lúc chém Lam chỉ đứng dáng nghỉ** (hộp đòn vẫn bật đúng lúc). Cần clip đứng/nhảy/lướt/chém… mới.

## 4. Tiếng Vọng (yêu cầu 5)
Mỗi bước ghi vào bản ghi: vị trí, `a2` (trạng thái), **`k2` (khung đã chọn: 0–31 hoặc −1 = dáng nghỉ)**, `l2` (lật) và
**`p2` (pha)**. Bóng phát lại vẽ **đúng `k2` đã ghi**, không tính lại pha/khung theo va chạm của bóng.
Bóng + vệt lướt dùng bản tô màu ngọc của chính sheet mới + dáng nghỉ mới.

## 5. Kết quả kiểm (Chromium headless, `tools/kiem-thu-chay-lam.py`)
Chạy tay từng bước logic (savePrev → step → render), mỗi bước = 1 khung video 60 fps, khung 960×540 (đúng tỉ lệ game).
Input giả lập: 700 bước (~11,7 s) trong màn **Cổng làng** thật. Số đo đầy đủ: `so-do.json`; log từng bước: `log-tung-buoc.csv`.

| Kiểm | Kết quả |
|---|---|
| Pha = tổng \|dx thực\|/83,66 ở mọi bước chạy, = 0 ở mọi bước khác | lệch lớn nhất **1,1·10⁻¹⁶** (sai số làm tròn), **0** lần nhảy/reset pha |
| Đổi tốc độ khi đang chạy (tăng tốc, giảm tốc, nhả/giữ phím, quay đầu) | 64 bước đổi vx; bước nhảy khung lớn nhất giữa hai bước chạy liền nhau = **2 khung** (đúng bằng 1,68 khung/bước ở tốc độ tối đa → không có bước nhảy thừa) |
| Va tường (giữ phím vào tường) | 112 bước, 3 lần (tường trái, bậc đá bên phải, mép bậc khi quay đầu): dx = 0, **pha đứng yên tuyệt đối**, hình = dáng nghỉ (không đạp chân) |
| Chu kỳ ở 264 px/s | 19,01 bước = **0,317 s**, 6,31 bước/s (8 vòng pha quan sát) |
| Nhảy + tiếp đất | nhảy/rơi dùng khung 14, pha giữ nguyên trên không, tiếp đất chạy tiếp từ pha cũ |
| Hai hướng | lật quanh neo chân, chân đứng đúng mặt đất cả hai chiều (xem GIF 1, 3) |
| Tiếng Vọng | ghi 104 bước; bản ghi khớp khung + pha của Lam ở mọi bước; bóng phát 103 bước: **0** bước sai khung, và mọi lần **vẽ** bóng đều dùng đúng khung đã ghi (móc vào `drawLam`) |
| Lỗi trang / nạp | không có lỗi JS; build `demo.build.html` mở bằng file:// cũng chạy |

### Video / GIF
- `kiem-thu-chay-lam-60fps.mp4` – **bản chính**, đủ 60 khung/s, toàn bộ kịch bản (góc trên trái: tên tình huống, khung, pha, dx).
- `1-chay-trai-va-tuong.gif` – rút dao → chạy trái → va tường trái.
- `2-chay-phai-tang-giam-toc-va-bac.gif` – chạy phải, nhả/giữ phím (tăng/giảm tốc, dừng) → va bậc đá.
- `3-nhay-tiep-dat-quay-dau.gif` – nhảy lên bậc, tiếp đất chạy tiếp, quay đầu trái (20 fps cho nhẹ).
- `4-tieng-vong.gif` – ghi Tiếng Vọng (chạy, rơi, nhảy, quay đầu) → bóng phát lại (20 fps).
- `5-chay-tang-giam-toc-cham-x4-phong-x2.gif` – đoạn tăng/giảm tốc chậm ×4, phóng ×2 quanh Lam (khung vẫn 16:9).
GIF là bản xem nhanh (30/20 fps, 160 màu); xem nhịp chân chuẩn ở mp4.

## 6. Nhận xét nhịp chân 6,3 bước/giây
Chân **không trượt** và **không giật khung** khi đổi tốc độ (đúng mục tiêu phát theo quãng đường). Nhưng ở 264 px/s mỗi bước
chân chỉ dài ~42 px logic (≈ 0,37 chiều cao Lam) nên chân đạp **rất nhanh**, kiểu chibi "chạy lạch bạch". Nhận xét của
tôi (từ dãy khung đã quay + số đo; không xem được trên máy thật): ở cỡ 112 px nhịp **hơi líu chân**, nhất là khi chạy dài
và camera cuộn; hình không rối vì thân/mũ nhún nhẹ và mỗi khung hiển thị là một tư thế khác nhau. Cảm giác thật cần chủ dự
án xem mp4 / chơi thử.
Theo yêu cầu, **không tự làm clip mới**: nếu chủ dự án thấy líu sau khi xem `kiem-thu-chay-lam-60fps.mp4`, bước tiếp là
phương án (c) – clip chạy sải dài riêng cho 264 px/s.

## 7. Chưa làm / cần biết
- **CHƯA kiểm trên iPhone thật** (không có máy) – chưa đo tốc độ vẽ/bộ nhớ của sheet 2x (8,3 MB RGBA giải nén + bản tô màu
  cho bóng cùng cỡ) trên Safari iOS.
- Nền là gradient TẠM; quái/boss/gạch/đồ vật vẫn bản cũ (phiên khác đang làm ở `art/the-gioi-moi/`).
- Mọi trạng thái ngoài chạy là khung TẠM (mục 3). Vùng ăn đòn `hurtBox` vẫn 40×120 (giữ nguyên collider theo yêu cầu,
  dù Lam mới chỉ cao 112 px).
- Các tool cũ `game/tools/chibi-sheets.py`, `chup-demo-chibi.py`, `do-animation.py` dựa vào `art/chibi/` và
  `anim/lam-chibi.json` đã bị xoá → không còn chạy được (không dùng trong game/build).
- Chạy lại kiểm thử: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 -B game/tools/kiem-thu-chay-lam.py` (cần ffmpeg).
