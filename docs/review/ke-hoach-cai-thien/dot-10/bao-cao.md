# Báo cáo Đợt 10 — Đo dung lượng và tách ảnh tải sau (quyết định Q5)

Ngày 11/10/2026. Nhánh `khoi-tao-du-an`. Commit: `48afb486` (lưu số đo bản cũ, đẩy TRƯỚC khi đổi cách đóng gói), `471c6c0d` (thay đổi).

## Kết luận ngắn

1. **Dùng 2 tệp trên web.** Ở mạng 1,5 Mbps, thời gian tới màn chào giảm từ **37,4 giây xuống 9,0 giây (giảm 76 %)**, vượt mục tiêu 40 %. Ở 10 Mbps: 7,0 giây xuống 1,9 giây.
2. Thiếu hoặc lỗi tệp ảnh thứ hai thì game vẫn chạy bình thường, quái và đồ thiếu ảnh được vẽ bằng code như trước khi có ảnh AI. Đã thử 5 kiểu hỏng.
3. Luật chơi không đổi: bot chơi ải 1 ra kết quả giống hệt nhau ở cả 6 trường hợp thử.
4. Trần dung lượng còn lại: **9,9 MB** nếu tính theo trần 20 MB của bản 2 tệp (bản một tệp chỉ còn 4,9 MB tới trần 15 MB). Kế hoạch ảnh còn lại ước khoảng 9 MB, tức là **vừa sát trần, và không còn chỗ cho việc tách lại 36 quái nét gấp đôi (E3)**. Xem mục 5 và mục 9.
5. Quay lui: đổi một dòng `HAI_TEP: '1'` thành `'0'` trong workflow là web về bản một tệp như cũ.

## 1. Danh sách tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/build.py` | Thêm cờ `--hai-tep` (hoặc biến `LK_HAI_TEP=1`) và `--mot-tep`; hàm `bat_buoc`, `thu_tu_sau`, `hai_tep`; mỗi lần đóng gói in dung lượng so với trần |
| `game/js/sprite_custom.js` | Chỉ thêm khối "ẢNH TẢI SAU" ở cuối tệp (phần nạp). Không sửa dòng nào của phần vẽ |
| `game/js/engine.js` | Sau khung hình đầu thì gọi tải phần sau; vẽ chỉ báo nhỏ ở góc dưới trái |
| `.github/workflows/linh-khi-hosting.yml` | Cờ `HAI_TEP`; đăng trang nhẹ + tệp ảnh + bản một tệp ở `/linh-khi.html`; tệp ảnh được lưu đệm lâu |
| `.gitignore` | Bỏ qua hai tệp do chế độ 2 tệp tạo ra (workflow tự tạo lúc đăng) |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Tệp do `build.py` tạo lại |
| `docs/review/ke-hoach-cai-thien/dot-10/` | Báo cáo, `so-do-truoc.json`, `so-do-sau.json`, `ket-qua-kiem.json`, `ket-qua-sw.json`, công cụ đo `do.py`, bài kiểm `kiem.py`, ảnh trong `anh/` |
| `docs/review/ke-hoach-cai-thien/TRANG-THAI.md` | Dòng Đợt 10 |

Không đụng: ảnh trong `game/art/custom`, định dạng `.sprite.json`, bản lưu, luật chơi, `index.html` (không cần sửa), `firebase.json` (repo không có tệp này, workflow tự viết ra lúc đăng nên tôi sửa ở đó).

## 2. Tóm tắt thay đổi và lý do

**Trước:** một tệp HTML 10,1 MB chứa cả code lẫn 280 hình. Máy phải tải hết mới thấy màn chào.

**Nay (bản đăng web):**

- **Trang chính** (3,42 MB): code game và 83 hình cần ngay cho màn chào, làng, lúc bắt đầu ải 1.
- **Tệp ảnh tải sau** `linh-khi-anh.<mã>.json` (6,68 MB, 197 hình): game bắt đầu tải sau khi màn chào đã hiện. Hình nào về tới là dùng được ngay, không chờ cả tệp.

**Luật chọn hình nằm trong trang chính** (hàm `bat_buoc` trong `build.py`). Mọi thứ không khớp luật đều là tải sau, kể cả loại hình mới do phiên khác thêm:

1. Hồ sơ ghép `ghep-*` (chỉ số liệu).
2. Em bé 4 thân gốc.
3. Người làng `nl-*`.
4. Ảnh giao diện, làng, phòng `gd-*`.
5. Vật phẩm `vp-*` và trang phục rời `tp-*` (rất nhỏ, cả 58 món mới 86 KB).
6. Vũ khí khởi đầu: Kiếm Rèn `vk-sword-0*` và Cung Tre `vk-bow-3*`.
7. Hiệu ứng cơ bản: vệt chém/đâm, mũi tên của bé, trúng đòn, chí mạng, vỡ giáp, quái chết.

**Thứ tự trong tệp tải sau** (thứ người mới gặp trước thì về trước): quái Rừng già → hiệu ứng còn lại → vũ khí còn lại → trùm Rừng già → Hang biển → Lâu đài cổ → còn lại.

**Khi tải hỏng:** giữ phần đã nhận, thử lại sau 3 giây rồi 10 giây. Vẫn không được thì thôi, hiện dòng nhỏ "Mạng yếu: thiếu vài ảnh, game vẫn chơi bình thường" trong 6 giây và ghi vào console. Có mạng trở lại thì thử thêm một lượt.

**Chỉ báo:** chấm vàng nháy và chữ "Đang tải thêm ảnh… 46%" ở góc dưới trái, cỡ chữ nhỏ nhất của game, không nhận chạm, tải xong tự mất. Có bản tiếng Anh.

**Lưu đệm:** tên tệp ảnh có mã theo nội dung, máy giữ được 1 năm. Trang chính vẫn kiểm bản mới mỗi lần mở. Lợi thêm: mỗi lần chỉ sửa code, người chơi chỉ tải lại khoảng 1,5 MB thay vì 6,5 MB như trước.

### Ba chỗ tôi chọn khác chữ trong brief (chọn cách ít rủi ro hơn)

1. **`python3 game/build.py` không có cờ vẫn xuất MỘT tệp đủ ảnh như cũ**; muốn cặp 2 tệp thì thêm `--hai-tep`. Brief ghi ngược lại (mặc định 2 tệp, cờ `--mot-tep` để về cũ). Lý do: nhiều bài kiểm có sẵn mở thẳng `game/dist/linh-khi.html` từ ổ đĩa và chờ ảnh quái; mở kiểu đó trình duyệt không cho tải tệp thứ hai, nên các bài đó và việc của phiên đang chạy song song sẽ hỏng. Cờ `--mot-tep` vẫn có và được ưu tiên.
2. **Trang nhẹ có tên riêng `linh-khi-nhe.html`**, không ghi đè `linh-khi.html`. Trên web nó vẫn là trang chính.
3. **Bản một tệp vẫn được đăng kèm ở `/linh-khi.html`.** Ba trang công cụ (Tách Quái, Tách Ghép, Tách Đồ) đọc mọi hình đang có trong game từ trang chính. Trang nhẹ chỉ có một phần hình, nên tôi để công cụ tự bỏ qua nó và đọc bản đủ ảnh. Đã thử: cả ba trang đọc được số hình y như trước (204 món, 40 vũ khí bản thường, 3 trùm). Tôi không sửa tệp nào của công cụ.

## 3. Kết quả kiểm thử

| Kiểm | Kết quả |
|---|---|
| `node --check game/js/*.js` | Đạt |
| `python3 game/build.py`, `--mot-tep`, `--hai-tep` | Đạt cả ba |
| `game/tests/cloud_save_regression.test.js` | Đạt 7/7 |
| Tệp ảnh CÓ: màn chào → làng → ải 1 (bot) | Đạt, đủ 197 hình, bot thắng 2 sao |
| Tệp ảnh KHÔNG CÓ (404) | Đạt: thử 3 lượt trong 13,7 giây rồi thôi, bot thắng 2 sao, không lỗi |
| Tệp ảnh BỊ CHẶN (yêu cầu không tới máy chủ) | Đạt, như trên |
| Nội dung lạ (máy chủ trả trang HTML thay tệp ảnh) | Đạt, như trên |
| Tệp cụt (chỉ về 40 %) | Đạt: giữ 172/197 hình đã nhận, phần thiếu vẽ code |
| Bản một tệp như cũ | Đạt |
| Kết quả ải 1 của bot giống hệt nhau ở cả 6 trường hợp | Đạt (cùng thời gian, máu, sao, số liệu) |
| `?cloud=0` | Đạt (mọi lượt thử đều chạy với `?cloud=0`) |
| Cài lên màn hình chính (`sw.js`): ngắt mạng mở lại | Đạt: đủ 197 hình từ bộ lưu của máy; tệp ảnh của bản cũ được dọn |
| Mở trang nhẹ từ ổ đĩa, không có tệp ảnh | Đạt: game chạy, thiếu ảnh tải sau |
| Bản thử Xưởng Sprite, `artifact.html` | Đạt: vẫn là một tệp đủ ảnh |
| Workflow xanh, bản trên mạng có tệp ảnh | Đạt (mục 10) |
| `curl -I` xem dòng lưu đệm của tệp ảnh | **Chưa kiểm được** (máy phiên này bị chặn, mục 10) |

**Chưa kiểm:** đăng nhập Google và lưu mây trên trình duyệt thật (phần code đó không bị sửa, bài kiểm lưu mây đạt); iPhone thật; mạng 4G thật. Không chạy bộ test dài, theo lời dặn.

Chi tiết: `ket-qua-kiem.json`, `ket-qua-sw.json`. Chạy lại: `python3 game/build.py --hai-tep` rồi `python3 docs/review/ke-hoach-cai-thien/dot-10/kiem.py`.

## 4. Số đo trước và sau

Cách đo giống Đợt 1: Chromium giả lập mạng, tệp nén gzip như Firebase Hosting, phông chữ Google bị chặn, không có bộ đệm, mỗi tốc độ đo 2 lần lấy trung bình. 1 MB = 1 048 576 byte.

### Thời gian

| | Trước (1 tệp) | Sau (2 tệp) | Đổi |
|---|---|---|---|
| **1,5 Mbps** — thấy chữ "Đang tải…" | 0,4 giây | 0,3 giây | đạt mức dưới 1 giây |
| 1,5 Mbps — tới màn chào | 37,4 giây | **9,0 giây** | giảm 76 % |
| 1,5 Mbps — thao tác được (chạm vào làng) | 37,9 giây | **9,3 giây** | giảm 76 % |
| 1,5 Mbps — quái Rừng già có ảnh | 37,8 giây | 11,6 giây | 2,5 giây sau màn chào |
| 1,5 Mbps — đủ mọi ảnh | 37,8 giây | 37,2 giây | như cũ |
| **10 Mbps** — tới màn chào | 7,0 giây | **1,9 giây** | giảm 73 % |
| 10 Mbps — thao tác được | 7,4 giây | 2,1 giây | giảm 71 % |
| 10 Mbps — đủ mọi ảnh | 7,2 giây | 6,7 giây | như cũ |

Không có lúc nào màn hình đen hay trắng mà không có thông báo: chữ "Đang tải…" hiện từ 0,3 giây cho tới khi màn chào thay vào.

### Dung lượng (byte)

| | Trước | Sau: trang chính | Sau: tệp ảnh | Sau: cộng |
|---|---|---|---|---|
| Tệp | 10 574 623 | 3 584 998 | 7 006 661 | 10 591 659 |
| Truyền sau gzip | 6 774 587 | **1 555 893** | 5 229 402 | 6 785 295 |
| Truyền sau brotli | 6 522 957 | 1 364 883 | 5 160 394 | 6 525 277 |

Tổng không đổi (thêm 17 KB code tải sau). Cái đổi là phần phải tải trước khi chơi được: 6,77 MB xuống 1,56 MB.

### Bản trước chia theo phần

| Phần | Tệp (byte) | Sau gzip |
|---|---|---|
| Mã JS (46 tệp) | 2 473 995 | 759 873 |
| Khung trang (HTML, CSS) | 4 683 | 2 184 |
| Ảnh nhúng (280 hình) | 8 095 896 | 6 010 747 |

### Ảnh nhúng chia theo nhóm

| Nhóm | Số tệp | Byte | Sau gzip | Nay nằm ở |
|---|---|---|---|---|
| Trùm vùng (3 con) | 3 | 1 943 642 | 1 450 272 | tải sau |
| Quái Hang biển | 11 | 1 408 929 | 1 059 428 | tải sau |
| Quái Rừng già | 11 | 1 157 865 | 868 546 | tải sau (về đầu tiên) |
| Hiệu ứng `hu-*` | 18 | 1 044 028 | 786 093 | 9 cơ bản ở trang chính, 9 tải sau |
| Quái Lâu đài cổ | 11 | 984 089 | 738 527 | tải sau |
| Vũ khí dòng 1–9 | 144 | 716 870 | 512 472 | tải sau (trừ Cung Tre) |
| Em bé 4 thân gốc | 4 | 660 670 | 487 731 | trang chính |
| Vũ khí dòng 0 | 16 | 76 200 | 54 662 | Kiếm Rèn ở trang chính, còn lại tải sau |
| Trang phục rời | 44 | 63 423 | 37 277 | trang chính |
| Vật phẩm | 14 | 22 935 | 15 404 | trang chính |
| Hồ sơ ghép | 4 | 16 964 | 1 343 | trang chính |

Ảnh chiếm 77 % tệp; riêng quái và trùm chiếm 52 %. Ảnh PNG hầu như không nén thêm được (gzip chỉ bớt phần phình do cách nhúng).

Số đầy đủ: `so-do-truoc.json`, `so-do-sau.json`. Đo lại: `python3 docs/review/ke-hoach-cai-thien/dot-10/do.py tất-cả <tệp ra> game trang=linh-khi-nhe.html`.

## 5. Ước lượng khi nhập đủ ảnh theo kế hoạch, và trần còn lại

Đây là **ước lượng thô** (số tệp theo `TRANG-THAI.md` × cỡ trung bình của nhóm gần nhất đang có). Nhóm giao diện, phòng, làng chưa có tệp nào trong repo nên phải đoán cỡ.

| Lô ảnh còn lại | Cách ước | Thêm (MB) | Rơi vào |
|---|---|---|---|
| 12 thân theo bộ trang phục | 12 × 161 KB (cỡ em bé) | 1,9 | tải sau |
| Trùm đổi hình theo pha (E2) | 6 dáng × nửa cỡ trùm | 1,9 | tải sau |
| Hiệu ứng B1–B4 | 44 dải × 57 KB | 2,4 | phần lớn tải sau |
| 7 người làng | 7 × nửa cỡ em bé (đoán) | 0,6 | trang chính |
| Khoảng 200 hình tĩnh nhỏ (phòng, cửa, tile, nút, biểu tượng, làng, cánh) | 200 × 4 KB (đoán theo cỡ vũ khí) | 0,8 | trang chính |
| Hình lớn: nền làng, 3 tranh vùng, logo, thẻ ải | 5 × 300 KB (đoán) | 1,4 | trang chính theo luật hiện tại |
| **Cộng** | | **khoảng 9,0** | |
| Bản theo hệ của 8 đòn/chiêu (nếu làm) | 24 dải × 57 KB | +1,3 | tải sau |
| Tách lại 36 quái nét gấp đôi (E3) | số điểm ảnh gấp 4, cỡ tệp gấp 2 đến 3,5 lần | **+6 đến +14** | tải sau |

| | Hiện nay | Sau khi nhập đủ (không E3) | Có thêm E3 |
|---|---|---|---|
| Tổng gói | 10,1 MB | khoảng 19 MB | 25 đến 33 MB |
| So với trần một tệp 15 MB | còn 4,9 MB | **vượt** | vượt |
| So với trần hai tệp 20 MB | còn 9,9 MB | vừa sát (còn khoảng 1 MB) | **vượt 5 đến 13 MB** |
| Trang chính (nên dưới 5 MB) | 3,4 MB | khoảng 6,4 MB | như cột bên |

Ba điều rút ra:

- **Một tệp không đủ chỗ cho kế hoạch ảnh** (19 MB so với trần 15 MB). Đây là lý do thứ hai để dùng 2 tệp, bên cạnh tốc độ.
- **Trang chính sẽ nặng dần** vì người làng, giao diện và hình lớn đều thuộc nhóm "cần ngay". Ở 6,4 MB, màn chào ở 1,5 Mbps sẽ mất khoảng 19 giây. Nếu chuyển các hình lớn (nền làng, tranh vùng) sang tải sau thì còn khoảng 5 MB, khoảng 13 giây. `build.py` nay in cảnh báo khi trang chính vượt 5 MB.
- **E3 không vừa trần 20 MB** nếu làm cả 36 con cùng với các lô khác.

## 6. Kế hoạch chuyển đổi (Q5 yêu cầu báo cáo)

1. Số đo bản cũ đã lưu và đẩy trước (`48afb486`).
2. Bản 2 tệp lên web từ commit `471c6c0d`, bật bằng `HAI_TEP: '1'`.
3. `game/dist/linh-khi.html` trong repo và mọi bài kiểm có sẵn giữ nguyên là bản một tệp. Các phiên khác không phải đổi gì; hình `.sprite.json` mới họ thêm được chia tự động theo luật ở mục 2.
4. Trong vài ngày đầu nếu có báo lỗi thiếu ảnh trên máy thật: đổi cờ về `'0'`.

## 7. Ảnh

| Ảnh | Nội dung |
|---|---|
| `anh/kiem-mot-tep-1-man-chao.png` | Màn chào bản một tệp (như trước) |
| `anh/cham-vi-1-man-chao.png` | Màn chào bản 2 tệp ở 1,5 Mbps, có chỉ báo "Đang tải thêm ảnh… 2%" |
| `anh/cham-en-1-man-chao.png` | Như trên, tiếng Anh |
| `anh/cham-vi-2-lang.png`, `cham-vi-3-ai-1-dang-tai.png`, `cham-vi-4-ai-1-tai-xong.png` | Làng và ải 1 trong lúc tải (46 %) và khi tải xong |
| `anh/cham-vi-0-dang-tai-trang.png` | Chữ "Đang tải…" lúc trang chính chưa về hết |
| `anh/kiem-khong-co-2b-thong-bao.png` | Dòng "Mạng yếu…" khi không tải được tệp ảnh |
| `anh/kiem-khong-co-3-ai-1.png` so với `anh/kiem-co-3-ai-1.png` | Ải 1 khi thiếu tệp ảnh (quái vẽ bằng code) và khi có |
| `anh/kiem-cut-3-ai-1.png` | Ải 1 khi tệp ảnh bị cụt |

## 8. Rủi ro còn lại

- **Hình đổi giữa chừng ở lần mở đầu tiên trên mạng chậm.** Người vào ải rất nhanh có thể thấy quái vẽ bằng code vài giây rồi đổi sang ảnh AI. Ở 1,5 Mbps quái Rừng già có ảnh sau màn chào 2,5 giây, đủ hết sau khoảng 28 giây. Người chơi cũ đang cầm vũ khí dòng khác sẽ thấy vũ khí vẽ code vài giây đầu ở làng. Từ lần mở thứ hai tệp ảnh nằm sẵn trong máy nên không còn.
- **Đang mở game đúng lúc có bản mới có ảnh mới:** tệp ảnh cũ không còn trên máy chủ, lượt đó thiếu ảnh tải sau (game vẫn chạy). Mở lại là hết.
- **Chưa thử trên iPhone thật.** Cách đọc tệp dần từng phần được Safari hỗ trợ từ lâu và có lối dự phòng đọc cả tệp, nhưng tôi chỉ thử trên Chromium.
- **Số đo là mạng giả lập**, không phải 4G thật.
- **Ước lượng mục 5 là thô**, nhất là nhóm chưa có tệp mẫu và E3.
- Máy đã cài lên màn hình chính lưu thêm tệp ảnh (khoảng 7 MB); tệp của bản cũ được tự dọn.
- Web giữ thêm một bản một tệp ở `/linh-khi.html` (10 MB mỗi bản đăng) cho công cụ.
- Trang công cụ mới sau này muốn đọc hình đang có trong game thì phải đọc `/linh-khi.html`, không đọc trang chính.

## 9. Cách quay lui

| Mức | Cách |
|---|---|
| Web về một tệp, giữ code | Sửa `HAI_TEP: '1'` thành `'0'` trong `.github/workflows/linh-khi-hosting.yml` rồi đẩy |
| Gỡ hết thay đổi | `git revert 471c6c0d` |
| Đóng gói tay như cũ | `python3 game/build.py` hoặc `python3 game/build.py --mot-tep` |

Ở bản một tệp, phần code tải sau không làm gì cả.

## 10. Bản trên mạng

- Workflow của commit `471c6c0d` **xanh** (lượt 194, 1 phút 8 giây), chạy với `HAI_TEP: 1`, báo "Đã đăng https://spiritblade.web.app".
- Trang chính mở được, là trang nhẹ.
- Tệp ảnh `https://spiritblade.web.app/linh-khi-anh.a07e9686b4c1.json` có trên mạng, là mảng hình, hình đầu là `heoCon` (đúng thứ tự: quái Rừng già về trước).
- Một tên tệp ảnh không tồn tại thì máy chủ báo lỗi (đúng với trường hợp 404 đã thử ở mục 3).
- Bản một tệp cho công cụ mở được ở `/game/dist/linh-khi.html` (và `/linh-khi.html`).

**Chưa kiểm được: `curl -I`.** Máy chạy phiên này bị chặn kết nối thẳng tới `spiritblade.web.app` (cổng ra trả 403), nên tôi chỉ xem được nội dung qua công cụ đọc trang, không xem được dòng đầu trả lời của máy chủ. Vì vậy **chưa xác nhận dòng lưu đệm 1 năm của tệp ảnh đã có hiệu lực**. Nếu dòng đó chưa ăn thì game vẫn đúng, chỉ là mỗi lần mở máy hỏi lại máy chủ xem tệp có đổi không. Ai có máy nối mạng thường kiểm bằng lệnh:

```
curl -sI https://spiritblade.web.app/linh-khi-anh.a07e9686b4c1.json | grep -i cache-control
```

Kết quả đúng: `cache-control: public, max-age=31536000, immutable`. Nếu ra `no-cache` thì đổi thứ tự hai dòng `headers` trong workflow.

## 11. Quyết định mới cần bạn duyệt

1. **Web dùng bản 2 tệp** — đã bật theo số đo. Mặc định: giữ. Không muốn thì báo, đổi một dòng là về cũ.
2. **Trần 20 MB tính theo cái gì?** Tôi đang tính theo cỡ tệp (cách chặt nhất). Nếu tính theo dung lượng truyền thật sau nén thì gói hiện nay chỉ 6,5 MB và còn rộng hơn nhiều. Đề xuất: giữ cách tính theo cỡ tệp cho tổng gói, thêm một mức riêng "trang chính dưới 5 MB" vì chính nó quyết định thời gian chờ.
3. **E3 (tách lại 36 quái nét gấp đôi)** ước thêm 6 đến 14 MB, không vừa trần 20 MB cùng các lô khác. Lựa chọn: (a) chỉ làm trùm và tinh anh; (b) nâng trần riêng cho phần tải sau, vì phần này không làm chậm màn chào; (c) không làm. Mặc định nếu chưa quyết: chưa làm E3.
4. **Hình lớn (nền làng, tranh bản đồ vùng) khi có ảnh:** cho vào tải sau để trang chính không vượt 5 MB? Cái giá là màn chào hiện nền vẽ code một lúc rồi mới đổi. Mặc định: để ở trang chính cho tới khi `build.py` cảnh báo vượt 5 MB, lúc đó hỏi lại kèm số đo.
5. **Ba chỗ làm khác chữ brief** ở mục 2 (mặc định đóng gói vẫn một tệp; tên `linh-khi-nhe.html`; đăng kèm bản một tệp). Mặc định: giữ.
