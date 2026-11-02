# Đối chiếu Linh Khí với "Sổ tay Last Echo" + kế hoạch đề xuất (02/11/2026)

*Phiên này **chỉ đọc và viết tài liệu**: không sửa mã, không sửa ảnh, không đổi cân bằng, không chơi thử bằng tay (chỉ chạy máy không giao diện). Đọc trên nhánh `khoi-tao-du-an`, commit `c708bf9`. Sổ tay chép nguyên văn ở [docs/so-tay/so-tay-last-echo.md](../../../so-tay/so-tay-last-echo.md). Bảng rà hình vẽ bằng code: [docs/ra-soat-hinh-code-02-11.md](../../../ra-soat-hinh-code-02-11.md).*

*Theo lời dặn, kế hoạch dưới đây **không đề xuất gì về cốt truyện, tên hay chủ đề hình** (anh đang hỏi ChatGPT chuyện đưa game ra toàn cầu); chỉ nói về cách làm, kỹ thuật, chuyển động, hiệu ứng, giao diện, kiểm thử.*

---

## 0. Tóm tắt cho anh (đọc 1 phút)

- **Phần lớn sổ tay Linh Khí đã làm rồi**, nhiều chỗ làm theo cách riêng nhưng cùng ý: ảnh do ChatGPT vẽ, có trang tách ảnh, thu nét cho sắc, vòng lặp 60 nhịp/giây, khựng hình khi chém trúng, khung 9 mảnh, kiểm thử máy ở 844×390, nút to, mọi thứ nằm trong vùng an toàn của tai thỏ, báo cáo tiếng Việt kèm ảnh trước/sau, có cờ quay lui.
- **Đo thật 3 thứ anh hỏi:**
  - **(a) Hình vẽ bằng code:** trong game thật **không còn nhân vật, quái, trùm, phòng, nút cảm ứng nào vẽ bằng code**. Còn **17 chỗ nhỏ ở giao diện** (lòng/viền ô con, ô nền số bậc vũ khí, ruột thanh có màu riêng, phần "máu vừa mất" của thanh trùm, vòng chấm trên sàn, dải nền mép trên làng…), **3 chỗ dự phòng** lúc ảnh chưa kịp hiện (Cu Tí code loé ~1 giây đầu), **6 chỗ dựng ngầm** không hiện nhưng tốn máy, và ~45 ký hiệu ★ ✓ ✕ ✉ 🏆 dùng làm biểu tượng trong chữ.
  - **(b) Chuyển động:** logic chạy **đúng 60 bước/giây cố định**, vẽ nội suy (màn 90/120 Hz mượt); khung hình của Cu Tí chọn theo **mốc riêng từng khung** (không chia đều) và khung "chạm" rơi đúng lúc trừ máu — **tương đương** mảng ms của sổ tay. **Quái và trùm thì vẫn chia đều** khung theo tổng thời gian. **Có khựng hình** khi đánh trúng (45–115 ms tuỳ món, kiếm nặng 3/3/6 bước), **nhưng chưa khựng khi Cu Tí bị đánh**, và trùm chỉ khựng ngắn với búa.
  - **(c) Nút và HUD:** ở iPhone 844×390, nút Đánh 79 px (vùng chạm rộng hơn nhiều), Né 62 px (chạm 71 px), Đặc biệt / Chưởng 53 px (chạm 63 px), Bình máu 47 px (chạm 56 px), Tạm dừng chạm 52×45 px. **Đều ≥ 44 px cao, nhưng 3 nút chưa đủ 70 px rộng** như sổ tay. Cả khung game nằm trong vùng an toàn 47 px; thanh máu cao 45 điểm ảnh thật (sổ tay đòi ≥ 17); nút cách HUD ≥ 136 px.
- **Việc nên làm trước (P0):** một bộ kiểm thử "theo sổ tay" chạy trên **bản game thật có ảnh** (hiện nhiều bài kiểm mở bản chưa gói nên không thấy ảnh, và bước đăng web chỉ kiểm cú pháp + lưu mây + gói); thay **các hình code trong HUD lúc đánh** (ô vũ khí, thanh trùm, thanh quái nhỏ); nếp lưu tư vấn ChatGPT nguyên văn.
- **Những việc đổi cảm giác chơi, cần anh quyết** (mục 3.3): khựng hình khi Cu Tí bị đánh, khựng khi đánh trùm, nhịp từng khung của quái/trùm, nới vùng chạm 3 nút nhỏ.
- Đã chia sẵn **3 phiên song song không đụng tệp của nhau** (mục 4).

---

## 1. Ba số đo thật

### 1a. Hình vẽ bằng code (chi tiết: `docs/ra-soat-hinh-code-02-11.md`)

Cách đo: mở **bản gói thật một tệp** (đủ ảnh) ở cỡ iPhone 844×390 ×3, bọc các lệnh vẽ hình của canvas, ghi dòng mã gọi tới, cho máy đi: màn chào → làng (đi 4 hướng) → bản đồ vùng → 12 bảng người làng → 5 thẻ lò rèn (có **Luyện**) → **Hành trang** 4 thẻ → **ải Rừng già 1** (phòng đánh, tinh anh, rương, suối, thương nhân, bàn thờ, **trùm** — máy hạ được trùm) → tạm dừng → **bản đồ ải** → hành trang trong ải → bảng kết quả. 0 lỗi trang.

| Nhóm | Số dòng mã | Ghi chú |
|---|---|---|
| A — hình đang hiện bằng code | **17** | toàn giao diện nhỏ; 0 nhân vật / quái / trùm / phòng / nút cảm ứng |
| C — dự phòng lúc ảnh chưa giải mã | 3 | Cu Tí code ~1 giây đầu, đom đóm, gạch đồng màn chào |
| D — dựng ngầm, không hiện | 6 | nền làng code (dựng 2 lần), vũng hệ code, vũ khí code để tính mũi kiếm |
| B — được phép (sáng, tối, bóng, mờ, nhuộm, mặt nạ, xoá) | 40 | — |

Cùng chuyến đi, game dán ~649 nghìn lần ảnh so với ~25 nghìn lệnh vẽ hình nhóm A.

### 1b. Chuyển động và nhịp

| Điều sổ tay | Linh Khí đang làm | Dẫn chứng |
|---|---|---|
| Logic cố định 60 bước/giây, vẽ nội suy | **Đúng**: bước 1/60 giây, tối đa 5 bước bù mỗi lần vẽ, vẽ nội suy giữa hai bước (tắt: `?noisuy=0`) | `game/js/engine.js` (vòng lặp, `G.nsAlpha`); đo rung ở 120 Hz 0,44 → 0,21 điểm ảnh game (`soat-muot/bao-cao-phien-3.md`) |
| Khung tăng theo bước logic, không theo lần vẽ | **Đúng**: khung chọn theo đồng hồ đòn (đếm bằng bước logic) | `game/js/zed_moi.js` (chỉ đọc `atkT, hitAt…`) |
| Mỗi khung có ms riêng | **Làm khác, tương đương** cho Cu Tí: mỗi đòn có bảng **mốc tỉ lệ** riêng từng khung (ví dụ kiếm nhát 3: 0 / 0,2 / 0,45 / 0,6 / 0,75 / 0,88), kiếm nặng có mốc chỉnh theo tư vấn ChatGPT 17/10. **Quái / trùm: chưa** — khung chia đều theo `giay / so` trong tệp ảnh, một số con dùng danh sách khung lặp để giả "giữ dáng" | `zed_moi.js` bảng `MOC`, `MOC_KN`; tệp `game/art/custom/<quái>.sprite.json` (ví dụ heoCon: đòn 6 khung / 0,6 s) |
| Sự kiện gắn với mốc khung | **Đúng** cho Cu Tí: khung ★ (tư thế chạm) rơi đúng lúc trừ máu; đã sửa búa và chưởng lệch | `zed_moi.js` đầu tệp; `he-thong-animation/TOM-TAT.md` |
| Chết chậm dần, giữ khung cuối | Cu Tí: giữ khung cuối. Quái: có mờ dần (`mo`) | `sprite_custom.js` |
| Hitstop đánh trúng ~3 bước | **Có**: theo món 45–115 ms; kiếm nặng 48 / 48 / 95 ms (3 / 3 / 6 bước); có trần tổng 150 ms mỗi 0,5 giây, phần khựng dài hơn được trả lại cho đồng hồ đòn | `game/js/fx.js` (`khungVk`, `KN_MS`, `stop`) |
| Người chơi bị đánh: 5 bước | **Chưa**: chỉ rung màn + chớp đỏ, không khựng | `game/js/combat.js` (`G.hurtPlayer`) |
| Trùm: 1 bước | **Một phần**: chỉ búa đánh trùm khựng ngắn | `fx.js` (`trumBua`) |
| Bất tử sau trúng đòn 70 bước, nháy; lướt không nháy HUD | Bất tử 0,55 giây (≈ 33 bước); **nháy tách khỏi lộn né** (đang né thì không nháy) | `combat.js` (`P.inv = 0.55`; `alpha: P.inv > 0 && P.dodgeT <= 0`) |
| Làm tròn theo điểm ảnh thật | **Làm khác**: làm tròn theo nửa điểm ảnh game (lưới canvas thế giới), camera và nhân vật cùng một cách; canvas sau đó phóng lên màn bằng hệ số không nguyên | `engine.js` `G.lamTron` |

### 1c. Nút cảm ứng, vùng an toàn, HUD

Đo trên bản gói thật, có giả tai thỏ 47 px mỗi bên + 21 px đáy, bản lưu đã mở đủ nút (`cong-cu/nut.py`):

| | 844×390 ×3 | 932×430 ×3 | 960×540 | Sổ tay |
|---|---|---|---|---|
| Đánh (hình / vùng chạm) | 79 / 133 px | 88 / 145 px | 112 / 184 px | ✔ |
| Né | 62 / 71 px | 68 / 77 px | 87 / 99 px | ✔ |
| Đặc biệt, Chưởng | 53 / **63** px | 56 / **65** px | 72 / 83 px | ≥ 44 cao ✔ · ≥ 70 rộng ✘ (điện thoại) |
| Bình máu (góc trái) | 47 / **56** px | 48 / **58** px | 62 / 73 px | ≥ 44 ✔ · ≥ 70 rộng ✘ (điện thoại) |
| Tạm dừng (vùng chạm rộng × cao) | **52** × 45 px | **58** × 50 px | 73 × 64 px | cao ✔ · rộng ✘ (điện thoại) |
| Khe nhỏ nhất giữa hai nút | 15 px | 15 px | 15 px | — |
| Nút gần nhất tới ô vũ khí (HUD phải) | 136 px | 155 px | 201 px | ≥ 40 ✔ |
| Thanh máu cao | 15 px CSS = **45 điểm thật** | 50 điểm thật | 21 | ≥ 17 ✔ |
| Vùng an toàn | cả khung game và lớp giao diện nằm trong lề tai thỏ (đệm `env(safe-area-inset-*)`) | | | ✔ |

Ghi chú: nút tròn nên "rộng" = đường kính vùng chạm. Bài kiểm có sẵn `tests/nut_danh_shots.py` (67/67 đạt, 17/10) kiểm cỡ, khe, không đè HUD; cờ `G.CHAM44` nới vùng chạm nút chữ nhật cho đủ 44 pt.

---

## 2. Bảng đối chiếu từng điểm của sổ tay (mục 1.2 → 8)

Ký hiệu: **ĐÃ LÀM** · **LÀM KHÁC** (khác ở đâu, có nên đổi) · **CHƯA LÀM** · **KHÔNG ÁP DỤNG** (game nhìn từ trên xuống, không nhảy, không dây leo).

### 2.1 Luật làm việc (mục 1)

| Điểm | Linh Khí | Dẫn chứng / ghi chú |
|---|---|---|
| 1.1 Báo cáo tiếng Việt dễ hiểu, % tiến độ, ảnh trước/sau, tìm gốc lỗi | **ĐÃ LÀM** | Mọi `docs/review/ke-hoach-cai-thien/*/bao-cao.md` có ảnh trước/sau, số đo, cờ quay lui; ví dụ `do-net/bao-cao.md` (đo chỉ số nhoè trước 18 → sau 8), `chan-di-danh` (tìm gốc "chân bóp méo") |
| 1.1 Hỏi trước khi đổi cảm giác chơi | **ĐÃ LÀM** | Các thay đổi cảm giác đều có cờ tắt và mục "chờ duyệt" trong `TRANG-THAI.md` |
| 1.2 Không hình nào vẽ bằng code | **GẦN XONG** | Còn 17 chỗ giao diện nhỏ (mục 1a). Các làn "con vẽ tay", "vẽ tay 8/9", `khung-gd-con`, `zed-*` đã thay gần hết |
| 1.2 Chưa có ảnh thì tắt tính năng; dự phòng chỉ khi ảnh lỗi | **LÀM KHÁC** | Linh Khí vẽ code **trong lúc ảnh đang tải / giải mã** (Cu Tí code loé ~1 giây đầu; bản web ảnh rời thì quái, tile có thể hiện code lúc mạng chậm). **Nên đổi**: chưa có ảnh thì chưa vẽ (hoặc bóng mờ), chỉ vẽ code khi ảnh tải lỗi |
| 1.2 Được giữ: ánh sáng, độ tối, hạt, mờ, rung, chữ | **ĐÃ LÀM** | 40 chỗ nhóm B đều thuộc loại này |
| 1.2 Nhân vật chính đã chốt giữ nguyên | **ĐÃ LÀM** | Cu Tí bộ ảnh `zed-*`; các phiên sau chỉ sửa ghép, nét, không đổi thiết kế |
| 1.2 Rà soát định kỳ `docs/ra-soat-hinh-code-*.md` | **CHƯA LÀM → làm lần đầu hôm nay** | `docs/ra-soat-hinh-code-02-11.md`; công cụ để chạy lại ở `cong-cu/` |
| 1.3 Mọi quyết định hỏi ChatGPT trước | **ĐÃ LÀM phần lớn** | `CO-VAN-CHATGPT-2026-10-11.md`, `TU-VAN-CHATGPT-TOAN-BO-16-10.md`, `TU-VAN-CHATGPT-17-10.md`, các thư mục `tu-van-*` |
| 1.3 Lưu nguyên văn `docs/<chu-de>/tu-van-chatgpt.txt` | **LÀM KHÁC** | Lưu dạng `.md`, tên khác nhau, có chỗ là tóm tắt chứ không nguyên văn. **Nên thống nhất** tên + nguyên văn |
| 1.4 Chia phiên song song | **ĐÃ LÀM** | Đợt 1–11, làn A–E (`TRANG-THAI.md`) |
| 1.4 Phiên không có Chrome ghi yêu cầu ảnh vào `docs/yeu-cau-anh/` | **LÀM KHÁC** | Linh Khí dùng **trang tách ảnh** (`tools/tach-*`) có sẵn prompt + lưới trống, anh tự gen rồi gửi zip; yêu cầu ghi trong `YEU-CAU.md` từng phiên. Hợp với Linh Khí; chỉ nên thêm một **danh sách chờ ảnh chung** để khỏi sót |
| 1.4 Dòng ghi công trong commit; repo sạch | **ĐÃ LÀM** phần ghi công. Ảnh chụp thử thì **đang để trong repo** (`docs/review/**/anh`, docs ~2,3 GB) — LÀM KHÁC; có thể giữ vì là bằng chứng báo cáo |

### 2.2 Quy trình vẽ ảnh bằng ChatGPT (mục 2)

| Điểm | Linh Khí | Ghi chú |
|---|---|---|
| Mỗi ảnh một cuộc chat mới | **LÀM KHÁC** | Anh tự gen theo prompt của trang tách; prompt đã dặn "không lấy lại bố cục ảnh trước" |
| Nền magenta #FF00FF, tách xa, "crisp pixel art, no text…" | **ĐÃ LÀM** (hầu hết trang); trang nhân vật dùng **nền xanh lá #00FF00** | `tools/tach-giao-dien`, `tach-phong`, `tach-lang`, `tach-do` (magenta); `tach-anh-hung` (xanh lá) |
| Khung 9 mảnh: cạnh thẳng, trang trí ở góc NGOÀI, lòng trống | **ĐÃ LÀM** | Lô "Khung 9 mảnh" (làn C5), `khung-gd-con`; nên kiểm lại prompt có câu "decoration OUTSIDE the plate" |
| Nhập chữ / chờ xong / lấy ảnh gốc đúng điểm ảnh | **KHÔNG ÁP DỤNG** (anh tải ảnh về, không lấy qua trình duyệt của phiên) | — |
| Tách nền, khử viền hồng | **ĐÃ LÀM, cách khác** | Trang tách tự khử nền; `tools/kiem-alpha.py` soát alpha. Có thể thử công thức khử hồng của sổ tay nếu thấy viền hồng |
| Cắt từng món theo cụm, alpha < 20 → 0 | **ĐÃ LÀM** | trang tách cắt theo lưới / vạch kẻ (lô gộp 27/27 hàng đúng, đợt 11) |
| Thu nhỏ theo điểm ảnh thật, NEAREST | **ĐÃ LÀM** | `docs/review/ke-hoach-cai-thien/do-net/cong-cu/thu_net.py`, `tools/pixelize.py`, cờ `?netcao` |
| Lượng tử 256 màu | **LÀM KHÁC** | `pixelize.py` có giảm màu; bản gói dùng WebP không mất nét khi nhỏ hơn; bảng màu lõi 32 + 12 (đợt 4) |
| Lưu ảnh nguồn cạnh ảnh cắt | **ĐÃ LÀM, chỗ khác** | `docs/anh-goc/` (không theo tên `*-nguon-chatgpt.png`) |
| Bản một tệp < 16 MB | **LÀM KHÁC** | Bản một tệp 26,07 MB (trần tự đặt 30 MB, chỉ dùng cho trang công cụ); **web dùng trang nhẹ + ảnh rời** (tải đầu ~5 MB, cả 4 vùng ~19 MB / trần 20). **Không cần đổi** — cách của Linh Khí hợp với web hơn |

### 2.3 Animation (mục 3)

| Điểm | Linh Khí | Ghi chú |
|---|---|---|
| Pivot cố định ở chân, vị trí do vật lý | **ĐÃ LÀM** | chân `[24,45]` mỗi khung; Cu Tí phóng ×1,2 quanh chân; luật chơi chỉ đọc đồng hồ |
| Căn ngang theo tâm thân | **ĐÃ LÀM, cách khác** | ghép thân trên / chân "khớp tâm đai" (`chan-di-danh`) |
| Khoá chân trụ, hết trượt chân | **ĐÃ LÀM** | chân chạy theo quãng đường thật (`cu-ti-to-muot` mục d) |
| Nhảy, trên không, tiếp đất, treo trần | **KHÔNG ÁP DỤNG** | game nhìn từ trên xuống |
| Lật quanh pivot | **ĐÃ LÀM** | — |
| Làm tròn theo điểm ảnh thật | **LÀM KHÁC** (mục 1b) | Nên đo lại ở 932×430; chỉ đổi nếu thấy rung bậc thang |
| 60 bước/giây cố định, vẽ nội suy | **ĐÃ LÀM** | mục 1b |
| ms riêng từng khung | **ĐÃ LÀM (Cu Tí) · CHƯA (quái, trùm, hiệu ứng chia đều)** | mục 1b |
| Bộ ms nhân vật chính đã chốt | **LÀM KHÁC** | Linh Khí có bảng mốc riêng, đã chỉnh theo ChatGPT cho kiếm nặng; các đòn khác chưa đưa ChatGPT duyệt theo bảng ms |
| Hitstop trúng / bị đánh / trùm | **Một phần** | trúng ✔; bị đánh ✘; trùm chỉ búa (mục 1b) |
| Bất tử sau trúng đòn, không nháy khi lướt | **ĐÃ LÀM** (0,55 giây; khác số sổ tay nhưng là cân bằng — không đề xuất đổi) | — |
| 3.3 Đo tự động từng clip (IoU, trượt chân, khung trùng, chạm mép) | **Một phần** | đã có nhiều đo lẻ (`he-thong-animation`, `cu-ti-to-muot`, `soat-muot`, `full-audit`), **chưa có một bộ đo chung** chạy cho mọi clip |
| 3.3 Gửi contact sheet theo nhóm cho ChatGPT, nhận P0/P1/P2 | **Một phần** | đã làm cho kiếm (`tu-van-17-10-don-kiem`); chưa làm cho quái / trùm / hiệu ứng |
| 3.3 Mức 1 (không đụng hình) làm ngay, mức 2 hỏi trước | **ĐÃ LÀM** theo tinh thần | — |
| 3.4 Mô tả tay gần / tay xa, rig tham chiếu | **ĐÃ LÀM một phần** | `khung-que-8-huong`, `xuong-sprite` (khung que tham chiếu) |

### 2.4 Hiệu ứng (mục 4)

| Điểm | Linh Khí | Ghi chú |
|---|---|---|
| Thứ tự lớp vệt chém (vệt sau / trước) | **Một phần** | vệt vẽ sau viền quanh nhân vật (`vet-chem`), vũ khí sau / trước người theo neo; **chưa tách vệt sau tối hơn 25–35 %** |
| Neo vào điểm tác động, tàn 1–2 khung | **ĐÃ LÀM** phần lớn | `hieu-ung-dinh-quai`, `vet-combo` |
| Đạn khoá tâm, tách sinh → bay → nổ | **Một phần** | `fx_dan.js`; nên soát bằng bộ đo |
| Chừa đệm quanh hiệu ứng | **ĐÃ LÀM** qua trang tách (lề 4 điểm) | — |
| Hồi máu 8 khung trước / sau mốc | **Cần soát** | chưa thấy báo cáo riêng |
| Mờ dần bằng engine | **ĐÃ LÀM** | — |
| Trúng đòn 4 kiểu, loé trắng, rung nhẹ | **ĐÃ LÀM, cách khác** | chớp trắng khung đầu rồi nhạt (`fx.chop`), rung theo món |

### 2.5 Giao diện, chữ, bản đồ (mục 5)

| Điểm | Linh Khí | Ghi chú |
|---|---|---|
| Phông chữ ChatGPT chọn, nạp trước khi vẽ | **LÀM KHÁC** | **Be Vietnam Pro** (đủ dấu tiếng Việt), nạp trước tối đa 1,2 giây (`js/main.js`); phông thật trong `docs/fonts/` để soát chữ. Không cần đổi theo sổ tay (Alegreya/Cormorant thiếu chất Việt); nếu ra toàn cầu thì chỉ cần hỏi ChatGPT có nên thêm phông tiêu đề |
| Hướng dẫn dài trong khung ảnh 9 mảnh | **ĐÃ LÀM** | `gd-dai-thong-bao`, `gd-loi-noi` (thấy trong ảnh chụp ải) |
| Một hàm 9 mảnh dùng chung | **ĐÃ LÀM** | `SC.veGd` (có cả "lặp cạnh") |
| HUD khung ảnh, thanh máu trùm giữa trên, xa nút | **ĐÃ LÀM** | ảnh `gd-khung-mau`, `gd-ruot-thanh`, `gd-ruot-thanh-trum`; còn phần "máu vừa mất" vẽ code (A11–A14) |
| Bản đồ: nền, 3 kiểu ô phòng, biểu tượng | **ĐÃ LÀM** | ảnh `gd-khung-ban-do`, `gd-o-phong`, `gd-o-phong-cur`, `gd-phong-*`, `gd-phong-lock`; còn một khung chữ nhật code quanh vùng bản đồ (A7) |
| Nút cảm ứng là ảnh, ≥ 44 × 70 px, vùng an toàn, cách HUD ≥ 40 | **Gần đủ** | là ảnh ✔, vùng an toàn ✔, cách HUD ✔; 3 nút chưa đủ 70 px rộng ở điện thoại (mục 1c) |
| Hộp thoại chân dung có khung nói | **ĐÃ LÀM một phần** | hàng `noi` của người làng |
| Bảng đối chiếu Việt ↔ Anh | **ĐÃ LÀM** | `js/ngon_ngu_en.js`, `tools/ngon-ngu` |
| Không dùng emoji làm biểu tượng | **CHƯA** | ~45 chỗ ★ ✓ ✕ ✉ ⚔ 📥 🏆 ✎ 🗑 |

### 2.6 Lỗi đã gặp (mục 6) — có xảy ra ở Linh Khí không

| Lỗi của Last Echo | Linh Khí |
|---|---|
| Dây leo / bệ | KHÔNG ÁP DỤNG |
| Thanh máu nháy khi lướt | Đã tách: lộn né không làm nhân vật nháy |
| Đòn giật lùi do căn gót / căn mắt | Đã gặp dạng khác và sửa (khớp tâm đai) |
| Chân lơ lửng do dy giả | Không có (không nhảy) |
| Màn rung bậc thang trên iPhone | Đã sửa bằng nội suy + làm tròn chung; nên đo lại ở 932×430 |
| Clip tỉ lệ chạy đều | Cu Tí đã sửa (mốc riêng); quái còn chia đều |
| Bản gói quá to | Đã xử bằng web ảnh rời, WebP, thu nét |
| Lỗi mạng phông Google tính là lỗi JS | Đã lọc (`ERR_`, `fonts.g` trong `tests/ui_lib.py`) |

### 2.7 Kiểm thử (mục 7)

| Điểm | Linh Khí | Ghi chú |
|---|---|---|
| Playwright 844×390, 932×430 @3x, 960×540 | **ĐÃ LÀM rời rạc** | 120 bài Python + nhiều bài node trong `game/tests/`; 932×430 có ở `au_giao_dien_c.py` |
| Giả 60 / 120 Hz | **Một phần** | đo riêng ở `soat-muot` phiên 3; không có trong bộ kiểm chạy đều |
| Bộ kiểm không lỗi JS / HUD an toàn / ô máu / nút / phòng / trùm | **ĐÃ LÀM rời rạc** | `nut_danh_shots.py` 67/67, `au_mapgen.py`, `au_trum.py`, `smoke.py`… |
| Đạt 100 % trước khi commit | **CHƯA thành luật** | bước đăng web chỉ kiểm cú pháp + bài lưu mây + gói thử (`.github/workflows/linh-khi-hosting.yml`); nhiều bài mở `game/index.html` là bản **không có ảnh AI** nên không thấy đúng hình người chơi thấy |
| Rà hình code khi chạy thật | **Làm lần đầu hôm nay** | — |
| `?debug=anim` (khung, chân, vùng trúng, chạy chậm, từng bước) | **CHƯA** | có Xưởng Sprite xem khung, nhưng chưa có lớp gỡ lỗi trong game |
| Ảnh trước / sau mỗi lần sửa hình | **ĐÃ LÀM** | mọi báo cáo |

### 2.8 Xuất bản (mục 8)

| Điểm | Linh Khí | Ghi chú |
|---|---|---|
| Một tệp HTML tự chứa, đăng lại cùng địa chỉ | **LÀM KHÁC** | Đăng `spiritblade.web.app` (cùng địa chỉ) bằng trang nhẹ + ảnh rời; vẫn dựng bản một tệp `dist/linh-khi.html`. Giữ như vậy |
| 2 bản (đầy đủ + phòng demo) | **LÀM KHÁC** | có bản game thử cho Xưởng Sprite; không cần phòng demo riêng |
| Sửa → kiểm 100 % → commit → gói → đăng → báo | **ĐÃ LÀM, trừ "kiểm 100 %"** | xem 2.7 |

---

## 3. Kế hoạch đề xuất

Cỡ: **nhỏ** (≤ nửa phiên) · **vừa** (1 phiên) · **lớn** (nhiều phiên / chờ ảnh). Cột "Cảm giác": **CÓ** = đổi cảm giác chơi, phải hỏi anh trước. Cột "ChatGPT": cần vẽ ảnh hay tư vấn (câu hỏi ngắn ở mục 3.4).

### 3.1 P0 — nên làm ngay

| # | Việc | Cỡ | Cảm giác | ChatGPT |
|---|---|---|---|---|
| P0-1 | **Bộ kiểm thử theo sổ tay** chạy trên **bản gói thật có ảnh**: 844×390 và 932×430 ×3, 960×540; 60 và 120 Hz; tai thỏ 47 px; 0 lỗi JS; thanh máu ≥ 17 điểm thật; nút ≥ 44 px, không đè HUD; đi được mọi phòng ải 1 và hạ được trùm (máy chơi); in ra "đạt x/y". Gộp các bài lẻ đang có thay vì viết lại | vừa | không | không |
| P0-2 | **Gắn rà hình code vào bộ kiểm** (công cụ hôm nay): báo lỗi nếu xuất hiện dòng mã nhóm A mới | nhỏ | không | không |
| P0-3 | **Thay hình code trong HUD lúc đánh**: ô số bậc + ruột thanh tiến độ ở ô vũ khí (A1, A2), phần "máu vừa mất" + chớp của thanh trùm (A11, A12, A14), chỗ hở của thanh máu quái nhỏ (A18, A19), ô dấu hệ (một phần A3, A7) | vừa | không | vẽ (Q1, Q2) |
| P0-4 | **Nếp lưu tư vấn ChatGPT**: mỗi chủ đề một `tu-van-chatgpt.txt` nguyên văn; thêm `docs/yeu-cau-anh/DANH-SACH.md` liệt kê ảnh đang chờ | nhỏ | không | không |

### 3.2 P1 — nên làm

| # | Việc | Cỡ | Cảm giác | ChatGPT |
|---|---|---|---|---|
| P1-1 | **Không loé hình code lúc ảnh chưa giải mã** (nhóm C): chưa có ảnh thì chưa vẽ / bóng mờ; chỉ dùng code khi ảnh tải lỗi. Gồm cả quái, tile ở bản web ảnh rời khi mạng chậm | vừa | không | không |
| P1-2 | **Bỏ dựng ngầm** (nhóm D): nền làng code, vũng hệ code, vũ khí code chỉ để tính mũi kiếm | nhỏ–vừa | không (cần ảnh chụp trước / sau để chứng minh y hệt) | không |
| P1-3 | **Giao diện menu còn vẽ code**: lòng / viền ô con, nét chọn (A5, A6, A9, A13), nút tông vàng / tím / màu riêng + biểu tượng bitmap (A4), dải nền mép trên làng (A8), vòng chấm trên sàn (A10), viền tranh bản đồ vùng (A21), các `ui.rect` còn lại (A3, A7) | vừa–lớn | không | vẽ (Q1, Q3, Q4) |
| P1-4 | **Biểu tượng thay ký hiệu chữ** ★ ✓ ✕ ✉ ⚔ 📥 🏆 ✎ 🗑 | vừa | không | vẽ (Q5) |
| P1-5 | **Bộ đo animation chung** (IoU khung liền nhau, % đổi cao, trượt chân, khung trùng, chạm mép ô, trùng tệp) cho Cu Tí, 47 quái / trùm, hiệu ứng; xuất contact sheet theo nhóm | vừa | không | không |
| P1-6 | **Gửi ChatGPT duyệt theo nhóm** (di chuyển / đòn / trúng-chết / từng nhóm quái / hiệu ứng), lưu nguyên văn, lập danh sách P0/P1/P2 | vừa | không (chỉ tư vấn) | tư vấn (Q6) |
| P1-7 | **`?debug=anim`**: hiện khung ảnh, chân, vùng trúng, hộp đòn, tên động tác, khung, ms, FPS; dừng / từng bước / ×½ ×¼ ×⅒; bấm được trên iPhone. Chỉ bật bằng cờ, người chơi không thấy | vừa | không | không |
| P1-8 | **Nhịp riêng từng khung cho quái / trùm** (thay chia đều): lấy đà chậm, ra đòn 35–50 ms, giữ dáng, hồi chậm; mốc trừ máu giữ nguyên | vừa | **CÓ** (nhịp hình, không đổi luật) | tư vấn (Q6) |
| P1-9 | **Khựng hình khi Cu Tí bị đánh** (~5 bước ≈ 83 ms) | nhỏ | **CÓ** | tư vấn (Q7) |
| P1-10 | **Khựng khi đánh trùm** chỉ 1 bước cho mọi món (hiện chỉ búa ngắn) | nhỏ | **CÓ** | tư vấn (Q7) |
| P1-11 | **Nới vùng chạm** Đặc biệt / Chưởng / Bình máu / Tạm dừng cho đủ ~70 px ở điện thoại (không đổi hình nút; giữ khe 15 px, Đánh vẫn ưu tiên) | nhỏ | **CÓ** (cảm giác bấm) | không |

### 3.3 P2 — để sau / chỉ đo

| # | Việc | Cỡ | Cảm giác | ChatGPT |
|---|---|---|---|---|
| P2-1 | Đo rung camera ở 932×430 và 120 Hz; chỉ đổi sang làm tròn theo điểm ảnh thật nếu thấy bậc thang | nhỏ (đo) | không | không |
| P2-2 | Vệt chém tách lớp sau (tối hơn 25–35 %, không lõi trắng) / lớp trước; lõi trắng chỉ ở đỉnh lực | vừa | không | vẽ + tư vấn (Q8) |
| P2-3 | Soát hiệu ứng bình máu theo mẫu 8 khung (4 trước, 4 sau mốc hồi) | nhỏ (soát) | không | tư vấn nếu thiếu |
| P2-4 | Thanh tải trước khi game chạy và viền khung game đang là CSS → ảnh | nhỏ | không | vẽ (Q4) |
| P2-5 | Thời gian bất tử sau trúng đòn (0,55 giây ≈ 33 bước, sổ tay 70) — **chỉ ghi để anh biết, không đề xuất đổi** (là cân bằng) | — | CÓ | — |
| P2-6 | Phông chữ khi ra toàn cầu: hỏi ChatGPT có nên thêm phông tiêu đề (giữ Be Vietnam Pro cho thân chữ) | nhỏ | không | tư vấn (Q9) |
| P2-7 | Bản một tệp < 16 MB: **không cần** (web dùng ảnh rời); chỉ làm nếu muốn đăng dạng một trang tự chứa | lớn | không | không |

### 3.4 Câu hỏi ngắn sẵn cho ChatGPT

Dặn kèm mọi câu: *"Viết toàn bộ câu trả lời vào 1 file .txt để tải về VÀ in luôn nội dung trong khung chat."* Câu vẽ ảnh dùng mẫu sổ tay: *"Draw ONE image … flat magenta #FF00FF background, items far apart, crisp pixel art, no blur, no text, nothing cut off, no shadow on the magenta"*, gửi kèm ảnh chụp HUD hiện tại để giữ cùng phong cách.

- **Q1 (vẽ — ô con):** "Draw ONE image: a small dark-wood UI slot plate, EMPTY interior, straight plain edges in the middle of each side so it can be 9-slice stretched, decoration only at the corners OUTSIDE the plate; plus 5 thin selection rims in 5 colors (red-orange, green-poison, ice-blue, gold, neutral), same size."
- **Q2 (vẽ — thanh máu trùm):** "Draw ONE image: horizontal bar fill strips for a boss HP bar, 3 versions: 'recent damage' pale gold, 'hit flash' white, 'progress' gold; each a seamless repeatable strip, plus a small dark rank-number tag with EMPTY center."
- **Q3 (vẽ — nút còn thiếu):** "Draw ONE image: 3 button plates in gold, purple and neutral-dark tones, matching the attached button style, EMPTY center, 9-slice friendly."
- **Q4 (vẽ — dải / viền):** "Draw ONE image: a thin horizontal top strip (dark wood, repeatable), a painting frame border (9-slice, empty center), a floor marker ring (dots in a circle, top-down view), and a loading bar frame + fill."
- **Q5 (vẽ — biểu tượng nhỏ):** "Draw ONE image: 10 tiny pixel icons, 12×12 style, far apart: star filled, star empty, check mark, close X, letter/mail, crossed swords, download-to-tray, trophy, pencil, trash."
- **Q6 (tư vấn — nhịp khung):** "Đây là bảng số đo và ảnh khung (contact sheet) của nhóm động tác [tên nhóm]. Mỗi khung nên bao nhiêu ms (bội 16,67)? Khung nào là lúc chạm? Xếp lỗi theo P0/P1/P2, ghi rõ mức 1 (không vẽ lại) / mức 2 (cần vẽ thêm khung)."
- **Q7 (tư vấn — khựng hình):** "Game hành động nhìn từ trên xuống, logic 60 bước/giây. Hiện khựng khi đánh trúng 45–115 ms, khi người chơi bị đánh không khựng, khi đánh trùm chỉ búa khựng ngắn. Có nên thêm khựng 5 bước khi bị đánh và 1 bước khi đánh trùm không? Số cụ thể?"
- **Q8 (tư vấn + vẽ — vệt chém):** "Gửi kèm ảnh vệt chém hiện tại. Nên tách vệt sau / vệt trước thế nào, độ tối, chỗ lõi trắng? Vẽ lại bộ vệt theo đề xuất đó."
- **Q9 (tư vấn — phông):** "Game pixel có chữ Việt và Anh, thân chữ Be Vietnam Pro. Khi phát hành toàn cầu có nên thêm một phông tiêu đề? Gợi ý phông miễn phí đủ dấu tiếng Việt."

---

## 4. Chia 3 phiên song song (không đụng tệp của nhau)

Mỗi phiên chỉ sửa đúng các tệp ghi dưới đây, viết bài kiểm **mới** của riêng mình (không sửa bài của phiên khác), báo cáo ở thư mục riêng, `git pull --rebase` trước khi đẩy.

| Phiên | Việc | Tệp được sửa | Cần anh / ChatGPT |
|---|---|---|---|
| **Phiên 1 — Giao diện bằng ảnh** | P0-3, P1-3, P1-4, P2-4 | `js/ui_theme.js`, `js/ep_do.js`, `js/vk_moi.js`, `js/linhkhi.js`, `js/luyen_ui.js`, `js/goi_y_1.js`, `js/minimap.js`, `js/chuong_ui.js`, `js/village.js`, `js/hanh_trang.js`, phần HUD của `js/stage.js` (thanh máu quái, ô vũ khí, bảng kết quả), `index.html` (thanh tải), `tools/tach-giao-dien` (lô ảnh mới) | ChatGPT vẽ Q1–Q5 (anh gen theo trang tách). Trong lúc chờ ảnh: ghi yêu cầu `docs/yeu-cau-anh/giao-dien/NNN-*.md`, chuẩn bị chỗ gắn ảnh có cờ tắt; không vẽ tạm bằng code mới |
| **Phiên 2 — Chuyển động & cảm giác đòn** | P1-5, P1-6, P1-7, P1-8 (sau khi anh duyệt), P1-9, P1-10 (sau khi anh duyệt), P1-1 phần Cu Tí và quái | `js/zed_moi.js`, `js/sprite_custom.js`, `js/fx.js`, `js/combat.js`, `js/moves.js`, `js/monster_art.js`, `js/mobs.js`, tệp mới `js/debug_anim.js`, `tools/` (bộ đo animation mới) | Tư vấn Q6, Q7; anh quyết các mục CÓ đổi cảm giác. Mọi thay đổi nhịp có cờ quay lui |
| **Phiên 3 — Kiểm thử, quy trình, dọn dựng ngầm** | P0-1, P0-2, P0-4, P1-2, P1-11 (sau khi anh duyệt), P2-1, P2-3 | `game/tests/` (bài mới), `.github/workflows/linh-khi-hosting.yml` (thêm bước chạy bộ kiểm), `js/village_scene.js`, `js/room_art.js`, `js/fx_he.js`, `js/weapon_art.js`, `js/hero_tinhlinh.js`, phần nút của `js/stage.js` (chỉ hàm vùng chạm `nutTai` / `hitBox`), `docs/yeu-cau-anh/` | Anh duyệt P1-11. Giữ luật: không đụng đăng nhập Google, lưu mây, `?cloud=0` |

Chỗ dễ đụng nhau và cách tránh: `js/stage.js` chia theo vùng (Phiên 1 chỉ phần vẽ HUD, Phiên 3 chỉ hàm vùng chạm); A8 (dải mép trên làng), A10 (vòng chấm sàn), A21 (viền tranh bản đồ vùng) nằm trong tệp của Phiên 3 nhưng ảnh do Phiên 1 xin — Phiên 3 gắn khi ảnh về. Thứ tự gợi ý: Phiên 3 làm P0-1 trước để hai phiên kia có bộ kiểm dùng chung.

---

## 5. Đã làm trong phiên này

- Lưu sổ tay nguyên văn: `docs/so-tay/so-tay-last-echo.md` (thêm 1 dòng đầu ghi ngày nhận).
- Rà hình code bằng máy trên bản gói thật: `docs/ra-soat-hinh-code-02-11.md`.
- Đo nút / HUD ở 3 cỡ màn, đọc vòng lặp, khựng hình, chọn khung.
- Công cụ + số liệu gốc để chạy lại: `docs/review/ke-hoach-cai-thien/so-tay-last-echo/cong-cu/` (`hook.js`, `run.py`, `map.py`, `phanloai.py`, `nut.py`, `ket-qua-ban-that.json`). Muốn chạy lại: dựng bản không nén chữ ở thư mục nháp (`LK_GON=0 python3 game/build.py` trên bản sao), rồi `python3 run.py file://…/linh-khi.html` → `python3 map.py ket-qua.json ket-qua-map.json …/linh-khi.html` → `python3 phanloai.py`.
- **Không sửa dòng mã, ảnh hay số cân bằng nào.** Bản dựng để đo nằm ở thư mục nháp, không vào repo.

Ghi chú thêm: khi chạy máy, lúc ép bảng kết quả hiện ra không qua đường thắng thật trên bản `index.html`, trang báo lỗi "đọc `aiNgay` của rỗng" — đó là do cách ép của phiên đo (bảng kết quả không có dữ liệu), không phải lỗi người chơi gặp; trên bản gói thật đi đúng đường thì 0 lỗi.
