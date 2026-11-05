# F4 ổn định (05/11): vũ khí PixelLab mặc định + chia nhỏ ảnh lớn cho bớt bộ nhớ — báo cáo

Phiên tiếp F3 (`../on-dinh-f3-anh-bo-nho/bao-cao.md`). Mọi số đo là **Chromium headless giả iPhone** (UA iPhone, 844×390) trên bản web
`game/dist` chạy ở máy chủ cục bộ — **không phải iPhone thật**. Không chơi thử bằng tay. Không đổi luật chơi, cân bằng, bản lưu, đăng nhập
Google, lưu mây, `?cloud=0`, Firestore rules.

## 1. Nói ngắn gọn (cho chủ game)

1. **Vũ khí PixelLab nay là mặc định** (đúng quyết định "Có dùng pixellab" 05/11 14:48): Rowan cầm, ô đồ, Lò rèn, nút đánh, phi tiêu bay,
   ảnh theo hệ Lửa/Độc/Băng và ảnh "gân" đều là hình PixelLab. Ảnh PixelLab được **ghép sẵn vào tấm vũ khí lúc dựng** (không ghép lúc chạy
   nữa), 3 tấm PixelLab riêng và ảnh ChatGPT cũ **ra khỏi phần người chơi tải**. Web tải đầu: **19,89 → 19,73 MB** (bước này), cả phiên
   **→ 19,65 MB** / trần 20 MB. Muốn xem lại vũ khí cũ: thêm **`?vkpl=0`**.
2. **Bộ nhớ ảnh giảm khoảng một nửa** nhờ chia ảnh lớn thành trang ≤ 2048 × 2048 và chỉ mở trang đang cần (bảng mục 4):
   màn chào **193 → 105 MiB**, làng **222 → 134 MiB**, ải 1-1 **311 → 174 MiB**, đánh trùm Thornwood **311 → 203 MiB**,
   đổi đủ 4 bộ trang phục **496 → 252 MiB** (đỉnh). Không còn ảnh nào có cạnh > 2048 điểm trong bộ nhớ (trước: tấm 1152 × 12192).
3. **Chưa đạt mục tiêu ≤ 96 MiB** — nói thẳng: phần còn lại chủ yếu là **~62 MiB ảnh hiệu ứng** (195 tấm, tải hết sau màn chào, phiên này
   không đụng vì đụng là đổi cảm giác lần đầu ra chiêu) và **~40 MiB quái vùng đang chơi**. Đề xuất ở mục 7.
4. Trùm + dáng pha nay **chỉ giải mã khi tới phòng trước phòng trùm** (Suối hồi); vào ải trùm chỉ tải sẵn tệp. Rời ải là bỏ được.
5. Cổng kiểm trước khi đăng web nay **chạy luôn 6 bản lưu mẫu của F2** (bài node, không mạng).
6. Quay lui: `?vkpl=0` (vũ khí ChatGPT), `?trangcu=1` (tải nguyên tấm như trước F4), hoặc revert commit (mục 6).

## 2. Bước A — vũ khí PixelLab mặc định (commit riêng, đã đẩy trước)

- `cong-cu/nuong_vk_pl.py`: dán **62 ô PixelLab** (zed-vk 16, zed-vk-he 36, zed-vk-gan 10) thẳng vào ô cũ cùng rộng × cao (Pillow chỉ
  cắt + dán ô nguyên vẹn, không vẽ / vá điểm ảnh; ô lệch cỡ thì dừng). Kiếm dùng ô kiếm vuông + khung đầu kiếm `mui_kv` của PixelLab, như
  bản thử `?vkpl=1` đã làm lúc chạy.
- Tấm ChatGPT cũ giữ nguyên vẹn ở `game/art/custom/zed-vk-vkcu`, `zed-vk-he-vkcu`, `zed-vk-gan-vkcu` (mục `"vk_cu_cua"`): **chỉ bản web,
  chỉ tải khi `?vkpl=0`**, không tính vào tải đầu (build.py xếp chung nhóm "tấm cũ" như `-muotcu`, `-netcu`). Ảnh PNG cũ để tham khảo:
  `docs/anh-goc/zed/vk-chatgpt-cu/`. Ba tấm PixelLab gốc chuyển sang `docs/anh-goc/zed/pixellab-vk/tam/`.
- `js/vien_vk.js`: bỏ hẳn đoạn ghép canvas lúc chạy (`G.vkPlCho()` luôn `false`). `js/sprite_custom.js`: cờ `?vkpl=0` nạp tấm `-vkcu`.
- Soát điểm cầm: `cong-cu/chup_vk.py` chụp 844×390 **4 vũ khí × 13 trạng thái** (Trắng; Mầm/Thành hình/Thức tỉnh × Lửa/Độc/Băng; 3 cấp có gân),
  đứng + đang đánh, cạnh bản `?vkpl=0`: [kiếm](anh/tren-tay-kiem.png) · [thương](anh/tren-tay-thuong.png) · [búa](anh/tren-tay-bua.png) ·
  [phi tiêu](anh/tren-tay-phitieu.png). Tay nắm đúng cán ở mọi ô (ô cùng cỡ → điểm cầm / neo không đổi); 0 lỗi trang. Chụp lại sau khi
  chia trang: vẫn đủ hình (lần chụp đầu thấy 1 khung thiếu thân ở đòn thương đầu tiên → đã sửa, mục 3.3).
  Ghi chú: bản dist trước phiên này với `?vkpl=1` chụp headless lại ra kiếm cũ (bản ghép lúc chạy không kịp ghép) nên không so điểm ảnh được
  với bản thử; so bằng mắt với ảnh soát của phiên `pixellab-vu-khi` thì giống.
- Kết quả: bản một tệp **27,51 → 27,38 MB**; web tải đầu **19,89 → 19,73 MB**; cổng kiểm ĐẠT (14/14 bước smoke).

## 3. Chia trang ảnh lớn (bước 1–3)

### 3.1 Lúc dựng (`game/build.py`, chỉ bản web ảnh rời)
- Mọi ảnh có cạnh > 2048 (28 ảnh: 5 tấm thân Rowan/ninja/3 trang phục, 5 bản to ×1,2 của chúng, 11 tấm trùm + dáng pha, 7 hiệu ứng dài)
  được **cắt lại thành 123 trang ≤ 2048 × 2048**, chỉ chép nguyên từng **ô khung** (không đổi điểm ảnh nào; ô trong suốt hoàn toàn bỏ).
- Tấm thân Zed xếp ô theo **nhóm động tác**: `chung` (đứng/đi/chạy/lộn/trúng đòn), `di-<vũ khí>` (các động tác đó khi cầm vũ khí),
  `<vũ khí>` (đòn của kiếm/thương/búa/phi tiêu), `danh` (chưởng, đâm, chết). Ở làng chỉ cần `chung` + `di-` của vũ khí mang theo.
- Thông số trang ghi kèm ảnh (`"trang"`, `"trang_to"`); tệp nguyên tấm vẫn ghi ra cho `?trangcu=1` (không tính vào tải đầu).
- **Rộng × cao** mỗi ảnh ghi vào thông số (`_u[5]`, `_u[6]`). `build-manifest.json` có thêm `"anh_vung"` (danh sách ảnh cần theo vùng:
  lõi, từng vùng — quái/nền và trùm riêng, kèm MiB và tệp/trang) và `"chia_trang"` (mỗi ảnh: số trang, MiB nguyên tấm / theo trang, KB tải).

### 3.2 Lúc chạy (`js/trang_anh.js` mới, + `sprite_custom.js`, `zed_moi.js`, `vien_vk.js`, `stage.js`)
- Đối tượng ảnh của hình giữ nguyên (mọi chỗ vẽ không đổi); lệnh `drawImage` lên ảnh chia trang được chuyển sang ô ở trang đã giải mã.
  Trang chưa có → tải ngay (khung đó không vẽ). Trước khi dựng hình nhớ (chân sạch, tay nâng thương) game chờ đủ trang.
- Bộ tải F3 tải ảnh chia trang **theo trang**: tấm thân ở làng = nhóm cần; bản to trong trận = mọi nhóm (để đòn đầu không thiếu khung),
  bắt đầu giải mã **ngay khi vào ải** (trong lúc chờ ảnh vùng). Trùm, hiệu ứng: đủ mọi trang mới coi là xong.
- Bộ nhớ: F3 cộng thêm phần trang. Quá ngân sách (iPhone 96 MiB) thì mỗi 3 giây bỏ tấm trang phục không mặc + trang lâu không vẽ (12 s).
- **Trùm**: không chặn màn chờ vào ải nữa; vào ải trùm chỉ tải sẵn tệp vào bộ nhớ đệm; tới phòng có cửa thông phòng trùm (Suối hồi) mới
  giải mã trùm + dáng pha; về làng / vào ải khác thì bỏ được.
- `js/vien_vk.js` thôi đòi tấm `zed-moi` (chỉ đọc số liệu tỉ lệ từ tệp Rowan). `zed-moi` (hình ninja cũ, chỉ dùng khi `?zedbo=ninja`) nay
  tải như trang phục — chỉ khi mặc. `js/zed_moi.js` không còn bắt tải `zed-moi` để vẽ tạm khi Rowan chưa về.

### 3.3 Lỗi bắt được trong lúc làm
- Lần đầu: bản to trong trận chỉ nạp nhóm của vũ khí đang mang → đổi sang thương rồi đánh ngay thì 1 khung thiếu thân. Sửa: trong trận nạp mọi nhóm.
- Gói trang cho dải hiệu ứng ban đầu thừa ô trống (3,4 → 4,3 MiB) → chọn số cột ít ô thừa nhất, nay bằng đúng nguyên tấm.

## 4. Bộ nhớ trước / sau (MiB ảnh đã giải mã; đo độc lập: cộng rộng × cao × 4 của mọi ảnh đang sống, `cong-cu/do_bo_nho.py`)

"Trước" = bản dist trước phiên này (F3). "Sau" = bản đẩy lên. Cùng một hành trình, giả iPhone. Kết quả gốc: `ket-qua/*.json`.

| Mốc | Trước | Sau | `?trangcu=1` (quay lui) |
|---|---:|---:|---:|
| Màn chào | 193,4 | **104,8** | 189,2 |
| Làng | 222,1 | **133,5** | 218,0 |
| Ải 1-1 (vào, đỉnh) | 310,6 | **173,8** | 306,4 |
| Ải 1-1 sau đổi vũ khí | 310,6 | 155,2 | 306,4 |
| Ải trùm 1-5, phòng đầu | 310,6 | **163,6** | 306,4 |
| Phòng trước trùm (trùm vừa giải mã) | 310,6 | 203,4 | 306,4 |
| Đánh trùm Thornwood | 310,6 | **190,7** (đỉnh 203,4) | 306,4 |
| Làng sau trùm | 310,6 | 163,6 | 306,4 |
| Làng mặc bộ Rừng / Biển / Lâu đài / ninja | 391,6 / 443,8 / 496,1 / 496,1 | 188,6 / 213,9 / 214,4 / 216,1 | 387,4 / 439,7 / 491,9 / 491,9 |
| Ải 1-1 mặc bộ Rừng | 496,1 | 218,6 | 491,9 |
| **Đỉnh cả hành trình** | **496,1** | **251,6** | 491,9 |

Ảnh lớn nhất còn trong bộ nhớ: trước 1152 × 12192, sau 2002 × 1928 (trang trùm). Lỗi JS: 0 ở cả 3 lượt.
Ghi chú: bài đo đổi trang phục liên tục (mỗi 3–40 giây) nên tấm cũ chưa kịp bị bỏ (giữ 12 giây sau lần vẽ cuối) — chơi thật đổi đồ ít hơn.
Làng mới mở với bản lưu 2 vũ khí, không tải trước vùng: **~92 MiB** (hiệu ứng 43 + 19, giao diện 10,5, Rowan 12,6, khác ~7).

Còn lại ở làng/ải (sau): hiệu ứng ~62 MiB, quái + nền vùng đang chơi ~40 MiB, giao diện ~11 MiB, Rowan 13–43 MiB (làng / trong trận
thêm bản to ~30 MiB), trùm + dáng pha khi tới phòng trước trùm ~40 MiB.

## 5. Kiểm (kết quả thật)

- Chụp 844×390: hero 4 vũ khí × 13 trạng thái (mục 2); làng, ải 1-1 (kiếm, phi tiêu đứng + đánh), đổi sang bộ Lâu đài giữa ải, phòng trước
  trùm, vào phòng trùm Thornwood, đang đánh trùm (`anh/moi-*.png`): **đủ hình, số lần vẽ tới trang chưa có trong lúc chụp = 0**, trùm 3 dáng
  đã sẵn khi vào phòng, **0 lỗi trang**. Cùng cảnh với `?vkpl=0&trangcu=1` (`anh/quaylui-*.png`): 0 lỗi, vũ khí cũ.
- Bản một tệp (`dist/linh-khi.html`): mở được, vào ải 1-1, 0 lỗi (không có trang → chạy như cũ).
- `node game/tests/luu_an_toan.test.js`: ĐẠT 47 mục; `node game/tests/luu_may.test.js`: ĐẠT 26 mục.
- `bash tools/phat-hanh/cong_kiem.sh` (dựng lại dist): xem mục 8.

## 6. Quay lui

| Cách | Tác dụng |
|---|---|
| `?vkpl=0` | Vũ khí ChatGPT cũ (tấm `-vkcu`, chỉ bản web; bản một tệp không có tấm cũ) |
| `?trangcu=1` | Tải nguyên tấm như trước F4: không chia trang, trùm tải cùng vùng, tấm ninja tải ngay (tệp nguyên tấm vẫn trên máy chủ) |
| `LK_CHIA_TRANG=0` khi dựng | Không tạo trang nào |
| Revert commit F4 / commit bước A | Về hẳn như trước (A riêng một commit) |
| Cờ cũ của F3 (`?taicu=1`, `?bonhocu=1`, …) | Giữ nguyên |

Cờ mới `?trangcu=1` (thêm 05/11 cho đường quay lui của thay đổi lớn) — xoá khi đã chạy ổn trên iPhone thật vài tuần.

## 7. Còn lại / đề xuất

1. **Hiệu ứng (~62 MiB)**: chia bộ theo vũ khí + hệ đang dùng và theo vùng quái (hiệu ứng riêng của trùm như `hu-trum-no*` 11 MiB dùng cả
   cho trùm nhỏ nên chưa hoãn được), tải trước khi vào ải, bỏ khi về làng. Cần chủ game đồng ý vì nếu chưa kịp tải thì lần đầu sẽ vẽ bằng code.
2. **Quái vùng (~40 MiB)**: chỉ giữ quái của ải đang chơi (danh sách quái mỗi ải) thay vì cả vùng.
3. **Đo trên iPhone thật** bằng `?perf=1` (bảng số: MiB ảnh đang giữ) — số ở đây là ước tính rộng × cao × 4.
4. Tấm ninja `zed-moi` + `-netcu` có thể bỏ hẳn nếu không cần `?zedbo=ninja`.

## 8. Commit

- Bước A: **`231a568`** — "F4 bước A: vũ khí PixelLab thành MẶC ĐỊNH …" (đã đẩy).
- F4 chia trang + bộ nhớ + cổng kiểm: **`1ca8014`** — "F4 ổn định: chia ảnh lớn thành trang ≤ 2048 …" (đã đẩy). Trước khi đẩy đã
  `git pull --rebase`: đụng nhau ở `game/dist` với phiên quái nấm (`138e3c1`) → dựng lại dist rồi chạy lại cổng kiểm (`LK_BO_DUNG=1`):
  **ĐẠT** (lưu mây, 6 bản lưu mẫu 47 + 26 mục, kiểm ảnh, trần dung lượng: một tệp 27,40 MB / 30, web tải đầu **19,65 MB** / 20, smoke 14/14).
  Cổng kiểm đầy đủ (dựng lại dist trong cổng) trước đó cũng ĐẠT.
- Có một phiên F4 chạy trùng giờ (`3535558`, chỉ ghi chú + bản nháp ở `phien-trung/`, không đổi game) — bản đẩy là của phiên này.
