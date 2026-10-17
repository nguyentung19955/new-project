# Thuồng Luồng thật — thay Ngư Tinh nhuộm màu bằng ảnh rắn sông 3 pha (17/10)

**Tóm tắt cho chủ game:** trong trận ải 4-5, Thuồng Luồng nay là **con rắn sông có xúc tu, mảnh trống đồng trên trán, mắt lam** do chủ game gen,
đủ 3 pha (Độc xanh đen tím → Băng lam → Lửa đỏ đen), không còn là con mực Ngư Tinh nhuộm màu. Chỉ đổi **HÌNH**: máu, sát thương, vùng trúng,
thời lượng đòn, báo trước, luật trùm **giữ y nguyên**. Không chơi thử — chỉ bot / headless. Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

Ảnh `gop-p1-a.png` (pha 1 đứng / báo đòn / cắn) đã về giữa phiên → **đã dùng luôn**, pha 1 không còn hàng tạm.

## Cờ quay lui

| Cờ | Về như cũ |
|---|---|
| `?tlmoi=0` | Thuồng Luồng là Ngư Tinh nhuộm màu như trước. Đã so từng điểm ảnh với bản trước phiên: **231 khung (3 pha × đứng / báo đòn + đánh / trúng đòn / lặn) — 0 khung khác** |

## Ảnh để xem

- Trận 844×390, trước (trái) / sau (phải), 3 pha: **`anh/tran-truoc-sau-3-pha.png`** (từng ảnh: `anh/tran-truoc-phaN.png`, `anh/tran-sau-phaN.png`).
- Lưới khung (×2 — đúng nét trong game; vạch đỏ = mặt nước, vạch vàng = điểm đứng của trùm): `anh/luoi-khung-thuongLuong.png`, `-p2`, `-p3`.
- GIF mỗi pha (sau / trước): `anh/gif/sau-phaN-dung.gif`, `-bao-don-danh.gif` (chiêu Phun nước đen, đúng thời lượng thật: báo đòn rồi đánh),
  `-trung-don.gif`, `-lan.gif`; bản trước: `anh/gif/truoc-phaN-*.gif`.

## Đã làm

### 1. Cắt khung — `cong-cu/cat-thuong-luong.py`
- Cắt 4 tấm gộp `docs/anh-goc/trum-moi/thuong-luong/gop-p1-a/-p1-b/-p2/-p3.png` thành 15 hàng khung rời ở `docs/anh-goc/trum-moi/thuong-luong/<hàng>-cat/`
  (cùng kiểu thư mục với Ngư Tinh / Hồ Tinh): tách hàng theo dải trống, tách khung bằng đường cắt cong qua chỗ ít điểm ảnh nhất, bỏ nền xanh.
- Sương / khói vẽ trong suốt trên nền xanh (pha 2, 3) bị ngả xanh lá → bỏ. Bụng rắn nhạt giữ nguyên.
- **Pha 2 đánh (phun luồng băng)**: ảnh gen cho luồng băng của mỗi khung bay đè sang khung kế (pha màu với xúc tu, không tách sạch được). Mỗi khung
  giữ đoạn luồng ở miệng; đoạn thừa đè sang khung sau bị bỏ. (Luồng băng dài trong ảnh cũng không trùng vùng trúng thật của chiêu nào.)

### 2. Dựng 3 tệp hình — `cong-cu/dung-thuong-luong.py --ghi`
`game/art/custom/thuongLuong.sprite.json`, `thuongLuong-p2…`, `thuongLuong-p3…` (mỗi pha một bảng 192 màu, nét ×2, thu nhỏ kiểu điểm ảnh `do-net/thu_net.py`).

| Trạng thái trùm | Pha 1 Độc | Pha 2 Băng | Pha 3 Lửa |
|---|---|---|---|
| Đứng | 1-dung (6) | p2-1-dung (6) | p3-1-dung (6) |
| Đi (trườn dọc mép) | hàng đứng, nhanh hơn | hàng đứng (như cũ: tệp pha không có hàng đi) | như pha 2 |
| Báo đòn | 3-bao-don + 3 khung lao tới (9) | p2-2-bao-don + khung há miệng (7) | p3-2-bao-don + 2 khung vươn cao (8) |
| Đánh | 3 khung cắn (đầu đập nước) | 5 khung phun băng | 4 khung đập đầu |
| Trúng đòn | 5-trung-don (4) | p2-4-trung-don (4) | p3-4-trung-don (4) |
| Lặn / trồi (Lặn đổi chỗ) | 6-lan (6): 45 % đầu lặn xuống, 30 % cuối phát ngược = trồi lên | gợn nước vẽ code như cũ | như pha 2 |

- **Nhịp đòn**: hàng "đánh" bắt đầu đúng khung chạm / phun (như Ngư Tinh); khung lấy đà nằm cuối "báo đòn". Thời lượng và mốc ra đòn **vẫn lấy của Ngư Tinh**:
  game giữ mã trùm `nguTinh` cho luật (hộp thân, thời gian chiêu, báo trước), chỉ lúc VẼ mới đổi sang ảnh mới → không con số nào của trận đổi.
- **Cỡ, chỗ đặt**: cao ~111 điểm game từ đỉnh vây tới mặt nước (bằng Ngư Tinh nhuộm cũ). Điểm đứng của trùm = chân cổ rắn trên mặt nước;
  mặt nước mọi hàng, mọi pha cùng một vạch. Hộp trúng đòn cũ (rộng 72, cao 100) phủ đúng cổ + đầu; xúc tu xoè ra phía sau (phía bờ nước).
  Mỗi tấm gộp một hệ số cỡ riêng (tấm `gop-p1-a` gen to hơn 3 tấm kia).
- **Mắt lam sáng giữ nguyên** (ảnh gốc). Quầng vàng "lộ điểm yếu" nay đặt đúng **mảnh trống trên trán** của ảnh (đo từ tấm); mảnh trống vẽ code cũ bỏ khi có ảnh.
- Chữ ký nối code: `js/thuong_luong.js` (vẽ), `js/sprite_custom.js` (nạp 3 tệp, cờ `?tlmoi=0`, nhịp khung theo thời lượng mượn), `js/dinh_quai.js` (bảng neo mới).

### 3. Bảng neo thân (hiệu ứng / số / biểu tượng dính đúng)
Chạy lại `hieu-ung-dinh-quai/cong-cu/tao_bang.py --thuong-moi` trên bản web → khoá mới `trum:thuongMoi` trong `js/dinh_quai_bang.js`
(khoá cũ `trum:thuong` giữ nguyên cho `?tlmoi=0`). Đo trên trùm đứng (điểm game, tính từ điểm đứng, quay trái):

| | Thân vẽ thật | Hộp neo dùng cho hiệu ứng | Độ cao chớp trúng |
|---|---|---|---|
| Nếu giữ bảng cũ cho ảnh mới | −58 … +107 | −52 … +41 (hụt **66 điểm** phía xúc tu, tâm lệch ~18) | 33 |
| **Sau** (bảng mới) | −58 … +107 | **−58 … +108** (tâm hiệu ứng +12, đã chặn ±12 như mọi trùm) | 33 |
| Pha 2 / 3 (sau) | −52 … +80 / −62 … +80 | bề ngang lấy pha 1 (như mọi trùm), đỉnh đầu theo khung đang vẽ | 33 |

Báo trước (vùng đỏ) và vùng trúng **không đổi** (không đụng). Số liệu đủ: `so-lieu.json`.

### 4. Nét cao (tam_n3 / tam_n4) — KHÔNG làm, có lý do
Ảnh gốc chỉ có ~2 điểm ảnh cho mỗi điểm game (con rắn cao ~220–235 điểm ảnh gốc = 111 điểm game). Nét 3 / 4 phải **phóng to** ảnh gốc, không thêm chi tiết nào.
Khi bật `?netcao=3|4`, Thuồng Luồng vẽ tấm thường (như mọi tấm không có bản nét cao). Muốn có: gen lại ảnh to gấp đôi.

### 5. Dung lượng
- **Bản một tệp: 29,95 / 30 MB** — không đủ chỗ cho ~2,7 MB ảnh mới → 3 tệp ghi `chi_hai_tep` (build bỏ khỏi bản một tệp). Bản một tệp (chỉ dùng cho trang công cụ)
  vẫn vẽ Thuồng Luồng nhuộm cũ. Đã bot chạy bản này: 0 lỗi.
- **Bản web (người chơi): tải 19,51 / 20 MB** (trước phiên 17,69; Sông sâu +1,8 MB). Tải trước khi vào vùng đầu: 5,50 MB (không đổi — ảnh trùm Sông sâu chỉ tải khi chọn vùng 4).
  Để vừa trần: pha 1 "đi" dùng chung hàng đứng, pha 2 / 3 bỏ hàng lặn đổi màu, 192 màu thay 255 (255 màu: +0,11 MB). **Còn 0,49 MB** — phiên khác thêm ảnh lớn cần để ý.

## Còn vẽ code (để gen sau — prompt TL5–TL7 ở `../tu-van-17-10-nen-song/PROMPT.md`)
1. Thân trồi vòm (Vòng thân), thân quấn mép sân (Siết sân), thân dưới nước ở mép trên / dưới, đuôi quét (Quật đuôi) — **TL6 `gop-than.png`**.
2. Xoáy nước, dải dòng nước, tảng băng / gỗ cháy trôi, mảnh đồng rơi, vây lưng rẽ nước khi lặn — **TL7 `gop-vat.png`**.
3. Cảnh bỏ trốn (nhả mảnh trống, ngoạm mảnh mặt trời, lặn mất) — **TL5**; nay dùng ảnh mới chìm dần + mảnh vẽ code.
4. Pha 2 / 3 lặn: gợn nước vẽ code (hàng lặn chỉ có pha 1; muốn có: gen hàng lặn Băng / Lửa hoặc nới trần dung lượng).
5. Lúc Thuồng Luồng ra mắt: không còn cột nước "Ngư Tinh xuất hiện" (đó là hiệu ứng riêng của Ngư Tinh); ảnh mới vào thẳng dáng đứng.

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp 29,95 MB / 30; người chơi tải 19,51 MB / 20 |
| Headless bot (`cong-cu/kiem_tl.py`): phòng trùm 4-5, bot đánh qua 3 pha rồi hạ trùm (cảnh bỏ trốn) — bản web mặc định, web `?tlmoi=0`, một tệp mặc định, một tệp `?tlmoi=0` | **0 lỗi JS** cả 4 |
| `?tlmoi=0` so với bản trước phiên | 231 / 231 khung giống hệt |
| `tests/thuong_luong`, `thuong_luong_3c`, `thuong_b2`, `vung4`, `trum_song`, `quai_song`, `cloud_save_regression` | PASS |
| `tests/smoke.py` | 0 lỗi |

## Tệp
- Ảnh cắt: `docs/anh-goc/trum-moi/thuong-luong/*-cat/`. Hình game: `game/art/custom/thuongLuong*.sprite.json`.
- Mã: `game/js/thuong_luong.js`, `game/js/sprite_custom.js`, `game/js/dinh_quai.js`, `game/js/dinh_quai_bang.js`, `game/build.py` (khoá `chi_hai_tep`), `game/dist/*`.
- Công cụ (`cong-cu/`): `cat-thuong-luong.py`, `dung-thuong-luong.py`, `tl_mau.py` (đổi màu giữa pha — hiện chỉ để sẵn: dùng khi thiếu hàng của một pha),
  `kiem_tl.py` (bot + ảnh + đo), `lam_anh.py` (lưới khung, ghép ảnh). `hieu-ung-dinh-quai/cong-cu/tao_bang.py` thêm `--thuong-moi`.
- Gen lại ảnh nào: đặt vào `docs/anh-goc/trum-moi/thuong-luong/`, chạy `cat-thuong-luong.py` → `dung-thuong-luong.py --ghi` → `tao_bang.py --thuong-moi` → build.
