# Rowan cầm vũ khí do PixelLab vẽ sẵn trong tay — báo cáo (05/11/2026)

## Tóm tắt cho chủ game

- **Rowan nay là nhân vật PixelLab.** Mỗi loại vũ khí là **một nhân vật PixelLab riêng**: Rowan cầm kiếm, Rowan cầm thương, Rowan cầm búa,
  Rowan cầm phi tiêu. **Vũ khí do PixelLab vẽ ngay trong tay ở từng khung hình** (cả lúc đứng, đi, chạy, lộn, đánh, đòn đặc biệt, trúng đòn, chết).
  Code **không còn đặt ảnh vũ khí vào điểm cầm** cho Rowan nữa — code chỉ chọn khung, đặt chân vào đúng chỗ, ghép tấm.
- Ngoại hình giữ đúng Rowan: mũ trùm vàng nghệ, áo lam, tạp dề da, túi đeo bên hông trái (ảnh mẫu ChatGPT của Rowan làm ảnh tham chiếu cho PixelLab).
- **Vũ khí luôn ở tay phải**: game dùng 2 hướng PixelLab — quay phải (đông nam) và quay trái (tây nam) — **không lật gương** nữa
  (lật gương sẽ đưa vũ khí sang tay trái).
- **Hình thái / hệ** (Trắng → Mầm → Thành hình → Thức tỉnh × Lửa / Độc / Băng): thể hiện bằng **vòng hào quang dưới chân do PixelLab vẽ**
  (lửa, dây gai độc, tinh thể băng; vũ khí chưa có hệ thì vòng vàng), to và rõ dần theo cấp. Đây là lớp hiệu ứng, vũ khí vẫn nằm trong khung PixelLab.
  Lý do và chi phí ở mục 4.
- Luật chơi, sát thương, vùng trúng, nhịp đòn, bản lưu, đăng nhập Google, lưu mây, `?cloud=0`: **không đổi**.
  Ô đồ / Lò rèn / túi đồ vẫn hiện ảnh vũ khí như cũ.
- **Quay lui**: thêm `?rowancu=1` vào địa chỉ → Rowan cũ (thân + lớp vũ khí đặt theo điểm cầm) y như trước phiên này.
- Chi phí PixelLab của phiên: **≈ 703 lượt** (trần 2000). Số dư tài khoản: đầu phiên 6 102,55 → cuối phiên 3 834,01
  (số dư giảm nhiều hơn 703 vì 2 phiên làm quái chạy song song cùng tài khoản).
- Cổng kiểm `tools/phat-hanh/cong_kiem.sh`: **ĐẠT** (14/14 bước smoke). Web tải đầu **17,86 MB / 20 MB**, bản một tệp **25,83 MB / 30 MB**
  (số sau khi gộp với phiên quái vùng 1 vừa đẩy; riêng phiên này trước khi gộp: 19,68 MB / 28,29 MB).

## 1. Game vẽ Rowan thế nào (đọc trước khi làm)

- Màn chơi nhìn từ trên xuống, Rowan chỉ có **một hướng nghiêng quay phải**; quay trái thì code lật gương. Đòn đánh xoay theo hướng nhắm bằng code.
- Các hàng động tác (`game/art/custom/zed-rowan.sprite.json`, số khung / thời lượng giữ nguyên trong game):
  đứng 8/1,0 s · đi 8/0,8 s · chạy 12/0,6 s · lộn né 6/0,27 s · trúng đòn 4/0,2 s · chết 8/0,6 s · chưởng (bắn xa) 6/0,3 s;
  kiếm: chém 1 / 2 / 3 + đặc biệt; thương: đâm 1 / 2 / 3, quét, giữ, xốc + đặc biệt; búa: nện, giữ, nện đất + đặc biệt;
  phi tiêu: ném, ngắm, ném chùm + đặc biệt. Ở làng Rowan dùng hàng đứng / đi.
- Trước phiên này: thân Rowan (`zed-rowan`) + ảnh vũ khí riêng (`zed-vk`, `zed-vk-he`, `zed-vk-gan`) do code đặt vào điểm cầm từng khung
  (`js/zed_moi.js`, `js/vien_vk.js`, `js/vk_moi.js`).

## 2. Làm bằng PixelLab (theo skill pixellab-api)

| Bước | Công cụ PixelLab | Kết quả |
|---|---|---|
| Ảnh gốc (hướng nam) | `generate-image-v2`, ảnh tham chiếu = Rowan mặt trước (ảnh ChatGPT) + ảnh vũ khí PixelLab cấp Trắng | 4 vũ khí × 4 ảnh, chọn ảnh vũ khí ở **tay phải** (`anh/anh-goc-4-vu-khi-x3.png`) |
| 8 hướng | `generate-8-rotations-v3`, 2 seed mỗi vũ khí | chọn nguyên một bộ: kiếm r7, thương r7, búa r8 (bộ r7 mất búa ở hướng tây), phi tiêu r7 |
| Nhập nhân vật | `create-character-v3`, đủ 8 hướng, khung xương `mannequin`, góc low top-down | 4 nhân vật PixelLab |
| Động tác | `characters/animations` chế độ **skeleton-v3**, 2 hướng (đông nam, tây nam) trong **cùng một nhóm động tác** | 47 động tác × 2 hướng = 94 bộ khung |
| Hào quang | `generate-image-v2` 96×48 | 4 hệ (lửa / độc / băng / vàng) × 3 cấp |

- Mô tả động tác **thuần động tác** (không chữ bắn / lửa / nổ), luôn kèm: "vũ khí ở tay phải, thấy rõ mọi khung, không thêm tay, không nhoè, không vệt tốc độ".
- Đòn đánh mô tả đủ 3 nhịp: **vào thế** (giơ vũ khí) → **vung** (đường cung trên vũ khí) → **theo đà**. Đòn đánh dùng 8 khung PixelLab
  (game vẫn phát đúng thời lượng cũ; nhiều khung hơn → vũ khí ít bị nhoè hơn so với lần thử 5 khung).
- **Soát từng khung, phóng to** (bảng soát ×2, tự động + bằng mắt): vũ khí mất (đếm điểm ảnh thép so với ảnh đứng), vũ khí nhoè / vệt mờ,
  mảnh rời, thừa tay.
  - Hướng hỏng → **chạy lại đúng hướng đó trong cùng nhóm động tác** (đổi seed), giữ bản ít lỗi nhất.
  - Kiểu động tác làm vũ khí bị che / nhoè dù đổi seed → **làm lại cả nhóm** với mô tả khác:
    - kiếm chém 1–3 và xoay kiếm: 8 khung, kiếm giơ bên vai thay vì sau đầu;
    - búa đặc biệt: đổi "xoay vòng" thành "quét búa ngang nặng nề";
    - phi tiêu: ngắm trước ngực thay vì sau tai; đặc biệt: "ném mạnh từ trên đầu" thay vì xoay người.
  - Tổng: 206 lượt chạy theo hướng cho 94 bộ cần dùng (112 lượt chạy lại / làm lại).
- **Chọn khung (code chỉ cắt, không vẽ)**: vài bộ còn 1–2 khung nhoè ở đầu / cuối đòn → bỏ khung đó (phát ít khung hơn trong cùng thời lượng):
  búa nện (quay phải: bỏ 2 khung thu búa cuối), búa giữ (bỏ khung 0), búa nện đất (quay trái: bắt đầu từ thế giơ cao), búa đặc biệt (bỏ 1 khung),
  thương đâm 2 (bỏ 2 khung), kiếm chém 2 (quay phải: bỏ 1 khung kiếm khuất sau người), phi tiêu ném (bỏ khung nhoè), phi tiêu đặc biệt (bỏ khung 0).
  Danh sách đầy đủ: `docs/anh-goc/pixellab-rowan/chon-khung.json`.
- **Đặt chân**: mỗi hướng của mỗi nhân vật một độ dịch chung (đo giữa hai bàn chân trên các khung đứng thở). Đo lại bằng số trên các động tác
  đứng tại chỗ (đứng, trúng đòn, chưởng, giữ, ngắm): lệch 0–2 điểm (riêng búa quay phải, cán búa nằm sát ủng nên phép đo lẫn — đã soát bằng mắt, chân không xê dịch).
- **Cỡ**: 4 nhân vật PixelLab có khung khác nhau (112 / 128 / 144) nên thân cao khác nhau → mỗi tấm có hệ số cỡ riêng để thân Rowan cao bằng nhau
  khi đổi vũ khí (35 điểm game; Rowan cũ ~31 điểm → mới cao hơn ~10 %, chỉ là hình). Nhân vật kiếm vẽ đúng 1 điểm PixelLab = 1 điểm màn hình trong trận.

Ảnh soát:

| | |
|---|---|
| GIF mỗi vũ khí (đứng → đi → combo → đặc biệt → đứng, quay phải rồi quay trái, ×3 NEAREST, vạch đỏ = điểm neo chân) | `anh/rowan-kiem.gif`, `anh/rowan-thuong.gif`, `anh/rowan-bua.gif`, `anh/rowan-phitieu.gif` |
| Ải 1-1, 844×390 (như iPhone xoay ngang), mỗi vũ khí | `anh/ai-1-1-kiem.png`, `…-thuong.png`, `…-bua.png`, `…-phitieu.png` |
| So sánh mới / cũ `?rowancu=1` (đứng, chạy, đánh, đặc biệt, quay trái; Trắng và Thức tỉnh Lửa) | `anh/so-sanh-kiem.png`, `…-thuong.png`, `…-bua.png`, `…-phitieu.png` |
| Ảnh gốc 4 vũ khí / hào quang | `anh/anh-goc-4-vu-khi-x3.png`, `anh/hao-quang-x2.png` |

## 3. Gắn vào game

- Tấm mới (code chỉ cắt + xếp): `game/art/custom/zed-rowan-pl-kiem|thuong|bua|phitieu.sprite.json` (mỗi tấm ≤ 2048 × 2048, không cần chia trang),
  `zed-rowan-pl-hao.sprite.json` (hào quang). Dựng bằng `docs/review/ke-hoach-cai-thien/pixellab-rowan/cong-cu/dung_rowan_pl.py --ghi` từ khung gốc
  `docs/anh-goc/pixellab-rowan/<vũ khí>/<động tác>/<se|sw>/`.
- `game/js/zed_moi.js`, mục "ROWAN PIXELLAB": Rowan bộ mặc định cầm vũ khí → chọn trạng thái y như cũ (`chon`: đứng / đi / chạy / đòn / lộn / trúng / chết…),
  lấy khung PixelLab tương ứng theo tiến độ đòn, hướng se / sw, vẽ qua `veLop` (bóng, nhuộm trúng đòn, mờ chuyển, hào quang Gồng giữ nguyên).
  **Không gọi lớp vũ khí** (`veVk`) cho Rowan. Giáo đang bay (tay không) → vẫn hình nhân vật giáo.
- Tải ảnh: tấm PixelLab là **ảnh tải sau**, chỉ tải tấm của **vũ khí đang cầm** (đổi vũ khí thì tải tấm kia), như cách tải trang phục (`js/sprite_custom.js`).
- Vẫn dùng code như cũ: vệt chém / đâm, phi tiêu bay, hiệu ứng hệ trên đòn, ảnh vũ khí trong ô đồ / Lò rèn / túi đồ / nút đánh.
  Trang phục Rừng / Biển / Lâu đài vẫn vẽ kiểu cũ (thân + lớp vũ khí) — chưa có bản PixelLab.
- Dung lượng: 4 tấm + hào quang ≈ 0,6 MB WebP. Để vừa trần 20 MB: `game/build.py` thôi tính tấm ninja cũ `zed-moi` (0,63 MB) vào "người chơi tải"
  — từ phiên C hình mặc định là Rowan và F4 cho `zed-moi` chỉ tải khi mặc, nên trình duyệt chỉ tải nó khi mở `?zedbo=ninja` (đã kiểm: chụp headless
  không có yêu cầu tải `zed-moi`). Web tải đầu 19,79 → **19,68 MB**.

## 4. Hình thái / hệ: chọn hào quang, không làm nhân vật riêng cho từng hình thái

- Làm nhân vật PixelLab riêng cho mỗi hình thái: 4 vũ khí × 3 hình thái = 12 nhân vật nữa, mỗi nhân vật ~140–170 lượt (ảnh gốc, 8 hướng,
  ~12 động tác × 2 hướng × 3 lượt + chạy lại) ≈ **1 800 lượt** → vượt trần 2000 khi cộng 4 nhân vật gốc; thêm 3 hệ thì gấp 3 nữa.
- Đã làm: **hào quang PixelLab dưới chân** (12 ảnh, 40 lượt): Mầm = vòng mảnh, Thành hình = vòng rõ, Thức tỉnh = vòng lớn rực; hệ Lửa / Độc / Băng,
  chưa có hệ = vàng. Nửa sau vòng vẽ sau lưng, nửa trước vẽ trước chân, thở nhẹ theo thời gian. Tắt riêng hào quang: `?haopl=0`.
- Nếu sau này muốn vũ khí trong tay đổi theo hình thái: ước ~150 lượt cho mỗi (vũ khí × hình thái), làm dần cho hình thái hay gặp nhất trước
  (ví dụ kiếm Thức tỉnh).

## 5. Kiểm đã chạy (kết quả thật)

- `bash tools/phat-hanh/cong_kiem.sh`: **ĐẠT** — 120 tệp JS `node --check`, lưu mây giả, 6 bản lưu mẫu F2, kiểm ảnh 784 tệp, dựng dist,
  trần dung lượng (19,68 / 20 MB; một tệp 28,29 / 30 MB; chạy lại sau khi gộp phiên quái vùng 1: ĐẠT, 17,86 / 20 MB, 25,83 / 30 MB), smoke headless 14/14 (vào ải 1-1, đi, đánh, né, đổi vũ khí, lưu → tải lại, `?cloud=0`, EN/VI).
- Chụp headless 844×390 ải 1-1 với từng vũ khí, mặc định và `?rowancu=1`: **0 lỗi trang** (`anh/chup.json`). Bản mặc định chỉ tải `zed-rowan-pl-*`, `zed-rowan`, `zed-vk`, `zed-vk-he` — không tải `zed-moi`.
  Công cụ: `cong-cu/chup.py`, GIF: `cong-cu/gif_rowan_pl.py`.
- Không chơi thử bằng tay, không thử trên iPhone thật.

## 6. Chỗ còn yếu (nói thẳng)

- **Lộn né và chết**: vài khung vũ khí bị thân che một phần (người cuộn tròn / nằm đè lên) — PixelLab dựng từ cùng khung xương 3D nên khó tránh; đã giữ.
- Một số khung đòn còn chút vệt ở mũi vũ khí (1–3 điểm ảnh), ví dụ kiếm đặc biệt khung đầu, phi tiêu ném cuối đà. Không có khung nào mất hẳn vũ khí
  trong đòn đánh / đứng / đi / chạy sau khi đã bỏ khung hỏng.
- Phi tiêu ném chùm (quay trái) động tác nhẹ, nhìn chưa "mạnh tay" bằng ném thường.
- Rowan mới nhìn nghiêng 3/4 hướng về người xem (góc PixelLab đông nam / tây nam), Rowan cũ nhìn ngang hơn. Cao hơn Rowan cũ ~10 %.
- Vệt chém vẫn tính đầu mũi theo điểm cầm cũ → vệt có thể không trùng tuyệt đối với lưỡi PixelLab (chỉ hình, vùng trúng không đổi).
- Vũ khí trong tay không đổi theo hình thái (đã thay bằng hào quang, mục 4).
- Cờ `?rowancu=1` trước đây (phiên D) là "đầu Rowan phiên C"; nay theo yêu cầu chủ game `?rowancu=1` = Rowan trước PixelLab;
  đầu phiên C chuyển sang `?rowancu=dau`.

## 7. Quay lui

- Trên web: `?rowancu=1` (Rowan cũ thân + lớp vũ khí), `?haopl=0` (chỉ tắt hào quang).
- Trong mã: revert commit của phiên này (một commit). Tấm cũ `zed-rowan`, `zed-vk*` không bị xoá.

## 8. Việc còn lại / đề xuất

- Trang phục Rừng / Biển / Lâu đài bản PixelLab (mỗi bộ × 4 vũ khí — nên làm sau khi chủ game duyệt Rowan).
- Vũ khí đổi theo hình thái ngay trong tay (mục 4), nếu ngân sách cho phép.
- Vệt chém theo mũi vũ khí PixelLab (đo mũi từng khung) — thuộc phiên hiệu ứng.

## 9. Tệp đã sửa / thêm

- Mới: `game/art/custom/zed-rowan-pl-{kiem,thuong,bua,phitieu,hao}.sprite.json`, `docs/anh-goc/pixellab-rowan/` (khung gốc PixelLab, ảnh gốc,
  bộ 8 hướng, hào quang, `chon-khung.json`), `docs/review/ke-hoach-cai-thien/pixellab-rowan/` (báo cáo, công cụ, ảnh soát).
- Sửa: `game/js/zed_moi.js` (vẽ Rowan PixelLab + hào quang), `game/js/sprite_custom.js` (cờ, tải tấm theo vũ khí đang cầm),
  `game/build.py` (tấm PixelLab tải sau; không tính `zed-moi`), `game/dist/*` dựng lại.
- Không đụng: tệp quái (2 phiên khác), luật chơi, bản lưu, Firestore rules, đăng nhập.

## Commit

COMMIT_HASH
