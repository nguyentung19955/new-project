# Thử Lam mới 2: CHẠY 8 tư thế + CHÉM 1 (A/B/C/D) – 28/10/2026 – BẢN CHỜ DUYỆT HÌNH

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-11-LAM-MOI-ANIMATION.md` và `PHAN-HOI-12-THIET-KE-CHAY-CHEM1-LAM.md`
(mục "Gửi Claude"): **bỏ rig 13 mảnh**, dùng thẳng các tư thế đã gen (`art/huong-moi/nguon/lam-tu-the/thu2-chay-8o.png`, `thu2-chem1-4o.png`).
**Chưa ghép vào game chính**: `am-dao.html`, P0-B, P0-C, `demo.html` không sửa – chúng vẫn dùng Lam cũ.
**Gameplay không đổi**: startup, hộp đòn, tốc độ chạy 264 px/s, miễn sát thương, cửa sổ nối nhát 2 giữ nguyên – chỉ đổi HÌNH Lam.
**Chưa thử trên iPhone thật** – ảnh, GIF, video, số đo lấy trong Chromium không GPU trên máy chủ.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-lam-moi-2/index.html
(vào thẳng **phòng A nền mới**, có hình nộm; đi tiếp sang phòng B có 2 Chuông Gỗ; có nút cảm ứng như các trang thử khác)

| Thêm vào cuối link | Tác dụng |
|---|---|
| `?vfx=0` | tắt vệt chém + âm nhận → **duyệt tạo dáng** (hộp, sát thương vẫn y nguyên) |
| `?bong=1` | Lam thành **bóng đen** (xem đường bao) |
| `?hitbox=1` | hiện hộp đòn (khung đỏ) |
| `?cham=4` | chậm 4 lần (cả trò chơi; 1–8) |
| `?lam=cu` | **Lam cũ** để so, cùng màn |

Nối nhiều cờ bằng `&`, ví dụ `index.html?vfx=0&bong=1&cham=4`. **Trên iPhone khỏi gõ link**: bấm ⚙ → mục "Lam mới 2" có 5 nút bật/tắt
(Lam mới/cũ · Vệt chém + âm nhận · Bóng đen · Tốc độ chậm ×4 · Hộp đòn).

## 1. Xem gì trước

| File | Nội dung |
|---|---|
| **`xem-thu/so-moi-cu-60fps.mp4`** | **xem đầu tiên** – chơi thật 13 s (không bất tử, bị Chuông Gỗ đánh trúng 2 lần): trên Lam mới, dưới Lam cũ, cùng phím. Chạy, 3 lần chém 1 vào hình nộm, combo 1→2→3, quay đầu, nhảy, chém khi chạy, sang phòng B |
| `xem-thu/choi-that-vfx0-hitbox-60fps.mp4` | đoạn đầu, tắt VFX + hiện hộp đòn: hình B/C trùng đúng lúc khung đỏ bật |
| `xem-thu/chay-nen-that-112-mau.gif` / `-bong.gif` | chạy trên nền thật phòng A, **đúng cỡ game** (Lam cao ~112 px), màu / bóng đen |
| `xem-thu/chay-nen-that-2x-*.gif` | như trên, phóng 2 lần |
| `xem-thu/chem1-nen-that-112-mau.gif` / `-bong.gif` | 2 lần chém 1 cạnh hình nộm, tắt VFX, đúng cỡ |
| `xem-thu/chem1-nen-that-2x-*.gif`, `*-cham4.gif` | phóng 2 lần; bản chậm 4 lần |
| `xem-thu/man-choi-co-nut.png` | màn kiểu iPhone ngang 844×390 có nút cảm ứng |
| `art/huong-moi/lam-tu-the-2/gif/chay-tai-cho-{112,2x}-{mau,bong}.gif` | chạy **tại chỗ**, nền tối, 8 ô × 62,5 ms (0,5 s/vòng) |
| `art/huong-moi/lam-tu-the-2/gif/chem1-tai-cho-{112,2x}-{mau,bong}.gif` | chém tại chỗ: đứng → A 7 tick → B 4 → C 4 → D 8; có bản `-cham4` |
| **`art/huong-moi/lam-tu-the-2/kiem/dai-khung-chay.png`**, **`dai-khung-chem1.png`** | **ảnh dải khung**: Lam chốt cùng thang + từng tư thế (cỡ 2x trên xám, có đường đất đỏ, trục thân xanh, vạch vàng = hàng mắt Lam chốt) + bản 112 px nền tối + bóng đen 112 px |
| `art/huong-moi/lam-tu-the-2/kiem/so-do.json` | số đo từng tư thế (px logic) |
| `xem-thu/do-trong-game.json` | đo trong game: lịch chém theo từng bước, quãng chạy mỗi ô, nối nhát 2 |

## 2. Đã làm gì

**Tách + cắt** (`art/huong-moi/lam-tu-the-2/code/tach.py`): nền trắng = điểm gần trắng nối với mép ảnh + lỗ trắng kín (khe chuông,
khe hai nhánh Âm Đao gần chuôi). Mép: tách màu khỏi trắng theo màu điểm bên trong → **không còn quầng trắng**, viền than giữ nguyên
(ảnh phóng ở mép mũ/tay/lưỡi đã soi). Mỗi tư thế = mảng liền lớn nhất trong ô.

**Tỉ lệ + neo** (`dung_sheet.py`) – **một tỉ lệ cho cả sheet, không co từng hình theo khung bao, không tự căn giữa**:
- CHÉM: dáng trung tính = **D (hồi)** cao đúng **112 px logic** (224 px nguồn). Neo x = **giữa hai ủng** của từng tư thế (hai ủng trụ thấy rõ
  ở cả 4 ô) + một hằng số chung để D có trục thân trùng quy ước của sheet chạy; neo y = đáy ủng. Lý do: trong ảnh gen, Lam trôi tới 26 px
  nguồn giữa các ô – nếu giữ vị trí ô thì chân sẽ trượt.
- CHẠY: không có dáng đứng → lấy trung bình 4 ô "cao trung gian" (1, 3, 5, 7) = 112 px. Neo x = giữ **nguyên vị trí trong ô** của ảnh gen
  (một số chung = giữa mũ ở hàng mắt, trung bình 8 ô; mắt lệch giữa các ô chỉ ±2 px logic → ảnh gen đã giữ trục thân). Neo y: ô chạm đất
  (1, 2, 3, 5, 6, 7) đáy ủng = mặt đất; ô bay (4, 8) giữ độ nhấc so với mặt đất của hàng trong ảnh gen (ủng sau nhấc ~4,7 px logic).
- Xuất `sprite/lam-moi2-chay-2x.png/.json` (ô 235×239, 4×2) và `lam-moi2-chem1-2x.png/.json` (ô 330×239, 4×1), cùng kiểu JSON
  `lam-ct-*-2x.json` (co_sheet, luoi, co_khung, diem_neo, ty_le, frames…) + số đo + lịch tick.

**Trang thử** (`cong-cu/tao-thu-lam-moi-2.py` sinh `index.html` từ `thu-p0a/am-dao.html`, cùng cách P0-C lấy bộ đất/nền mới A → F):
- **CHẠY**: khung = phần nguyên(pha × 8), pha là biến có sẵn của game cộng theo **quãng đường thật** (132 px/vòng) → mỗi ô 16,5 px, không
  đổi tốc độ. Đo trong game: ô đổi sau 17,6 / 13,2 / 17,6 / 17,6 px (trung bình đúng 16,5 – game bước 4,4 px nên ô giữ 4 hoặc 3 bước).
- **CHÉM 1**: hình chọn theo **chính điều kiện hộp đòn** của game: trước hộp → A; 4 bước đầu hộp → B; 4 bước sau → C; sau hộp → D.
  Đo trong game: **B + C hiện đúng 8 bước hộp bật**, D 8 bước, nối nhát 2 trong lúc D vẫn được (bấm lúc atkT 15 → nhát 2 ra ngay).
- **Không crossfade**: mỗi bước vẽ đúng một hình.
- Bóng Vọng + vệt lướt cũng vẽ bằng sheet mới (tô ngọc như cũ).

**HÌNH TẠM (chưa có tư thế – sẽ thay khi gen bộ tiếp):**

| Động tác | Tạm dùng |
|---|---|
| đứng, tiếp đất, rút dao, bị đánh, bám tường, chết, chém 2, chém 3, hất, nảy, trên không, chém vang, tụ Dư Âm | **D (hồi)** đứng yên |
| nhảy, nhảy tường, lướt | ô chạy 4 (bay) |
| rơi | ô chạy 8 (bay) |

Vì vậy combo 1 → 2 → 3 trông như chỉ chém một lần rồi đứng (vệt chém vẫn hiện) – đúng như dự kiến, không phải lỗi.

## 3. Số đo so với Lam chốt (px logic, cùng thang Lam chốt cao 112)

| | Lam chốt | Chạy (8 ô) | Chém A / B / C / D |
|---|---|---|---|
| Bề rộng mũ ở hàng mắt | 41,6 | 44,9 – 47,5 (**+8…14 %**) | 54,7 / 50,3 / 48,1 / 53,2 (**+16…31 %** ⚠) |
| Mũ cao trên mắt | 39,4 | 37,7 – 41,1 (ô 2, 6 thấp 37,7) | 40,1 / 37,9 / 35,5 / 41,8 |
| Mắt (diện tích) | 7,3 | 9,4 – 10,4 (**to hơn ~35 %**) | 9,0 / 9,4 / 7,3 / 9,2 |
| Mắt cách mép trước mũ (tỉ lệ bề rộng mũ) | 0,175 | 0,144 – 0,153 | 0,148 / 0,152 / **0,112** ⚠ / 0,149 |
| Chuông (rộng × cao) | 8,2 × 9,7 | ~9,8 × 10,5–13,8 | 13,1×12,6 / 10,4×10,2 / 10,9×12,1 / 10,9×14,3 |
| Màu mũ (trung vị RGB) | 47,54,72 | 45–47, 52–54, 71–73 | 48,56,76 / 46,54,74 / **40,46,65** ⚠ / 48,55,76 |
| Đỉnh mũ trên đất | – | 105,0 – 114,2 | 107,9 / 112,7 / 111,0 / 111,0 |
| Mắt trên đất | 72,6 | 67,2 – 74,6 (**dao động 7,4**) | 67,7 / 74,7 / 75,6 / 69,2 |

Khung lệch rõ:
- **Cả sheet chém: mũ to hơn Lam chốt 16–31 % và to hơn sheet chạy ~15 %** (ảnh gen vẽ Lam chém "lùn, đầu to" hơn). Khi chuyển chạy ↔ chém
  thấy mũ phồng lên một chút. Đã giữ đúng yêu cầu "dáng trung tính 112 px" chứ không co theo mũ.
- **Chém C**: mũ tối hơn ~13 %, mắt sát mép trước mũ hơn (mũ hơi nghiêng khác góc).
- **Chạy**: mắt to hơn Lam chốt ~35 % ở mọi ô (đều nhau nên không nhấp nháy). Ô 2 và 6 mũ thấp hơn ~4 % (mũ hơi bẹp khi nén).

## 4. Tự kiểm theo mục 3 của PHAN-HOI-12

| Dòng kiểm | Kết quả | Ghi chú |
|---|---|---|
| Chạy: ô 1 và 5 khác chân, ô 2/6 có chịu lực, ô 4/8 có bay | **Đạt một phần** | 2/6 thấp xuống rõ (chịu lực), 4/8 ủng sau nhấc khỏi đất + gấu mở. Ô 1 và 5 nhìn **gần giống nhau**: mũi ủng trước ở cùng chỗ, khó nhận ra chân xa (nhỏ/tối hơn) |
| Chạy không thành nhảy nhót: nhún ~3 px, đầu không bập bềnh riêng, mũ không phồng/xẹp | **Không đạt** | mắt lên xuống **7,4 px logic** (đỉnh mũ 9,2) – gấp ~2,5 lần mục tiêu; chủ yếu do ô 2/6 thấp 4–6 px và ô 5 thấp hơn ô 1 2,6 px trong ảnh gen. Không kéo méo/nhấc chân để ép số. Bề rộng mũ ổn (±3 %) |
| Áo dài, gấu đổi hình theo bước; không lộ chân dài/gối | **Đạt** | gấu trước/sau đổi hình từng ô, chỉ hé mũi ủng |
| Bóng đen: thấy nghiêng thân, gấu trước/sau, tay/vũ khí tách ở pha đánh; khe hai nhánh đọc được ở 112 | **Đạt** | xem hàng bóng đen ở `dai-khung-*.png`; khe nhánh còn thấy ở 112 px trong bản màu (B, C, D, chạy) |
| Chém: A rút thấp, B vung ngang, C kết thúc hơi thấp, D thu về | **Đạt một phần** | A dao thấp sau hông, không giơ trên đầu ✔; B ngang ✔; **C không thấp hơn B: tay duỗi thẳng ngang ngực như đâm giáo** (thiết kế cấm) ✘; D thế thủ thấp ✔. Thêm: ở B/C đầu lùi ~7 px so với chân trụ (thân không đẩy tới) |
| Không cùng chiều cao theo khung bao; tỉ lệ từ dáng trung tính, neo đất chung, không căn giữa | **Đạt** | một tỉ lệ / sheet; cao từng ô khác nhau tự nhiên (105–114) |
| Không yêu cầu đầu cùng độ cao; chỉ giữ cỡ/hình mũ | **Đạt (chạy) / Không đạt (chém so với chạy)** | xem mục 3 |
| Kiểm chuỗi 8→1 và hồi→đứng/combo; không crossfade | **Đạt** | 8→1 liền (mắt 72,3 → 73,5); hồi → đứng cùng hình D; nối nhát 2 trong D chạy đúng; không trộn hình |
| Tắt VFX duyệt dáng, bật VFX/hộp kiểm vùng chạm | **Đạt** | `?vfx=0`, `?hitbox=1`, nút trong ⚙; video `choi-that-vfx0-hitbox` |
| Đặt vào nền + nút cảm ứng thật | **Đạt trong máy, chưa thử iPhone thật** | `man-choi-co-nut.png` |

Cần biết thêm:
- **Lịch tick chém**: hình đổi ĐÚNG lúc hộp bật/tắt. Game tính bước bấm = atkT 1 và hộp bật ở atkT 7 (su 7 – không đổi), nên A thực tế hiện
  **6 bước**, B 4, C 4, D 8 (tài liệu ghi A 1–7 / hộp 8–15 theo cách đếm khác một tick). Không sửa startup để khớp số.
- Lúc lấy đà, game tự đẩy Lam tới 4,4 px (lunge có sẵn) → hình A trôi tới 4,4 px trên đất. Chưa bù.
- Chạy 8 hình: mỗi hình giữ 16,5 px nên chân chịu lực trượt trong lúc giữ hình (giới hạn của 8 tư thế, tài liệu đã nói trước). Xem video.
- `?lam=cu` dùng đúng Lam cũ cầm Âm Đao như trang Âm Đao.

## 5. Đề xuất gen lại (ngắn)

1. **Chém 1 – gen lại ô C** (và tốt nhất cả 4 ô để mũ cùng cỡ với sheet chạy). Thêm vào prompt: *"Same hood size as the attached run
   sheet; hood width about 37 % of character height. Pose 3: elbow bent, hand LOWER than pose 2 at belly height, blade tilted 10–15° down,
   arm NOT fully straight. Torso and head lean forward of the planted front boot in poses 2–3."* Đính kèm Lam chốt + sheet chạy thử 2.
2. **Chạy – nếu muốn giảm nhún**: gen lại ô 2, 5, 6 với *"compression poses only 1–2 px lower than contact pose at 112 px; head height almost
   constant; pose 5 = far foot (smaller, darker boot tip), not a copy of pose 1"*. Các ô 1, 3, 4, 7, 8 dùng được.
3. Nếu duyệt hướng này, bộ tiếp theo: đứng (2), nhảy (2), rơi (2) để bỏ hình tạm D.

## 6. Chạy lại

```
pip install pillow numpy scipy opencv-python playwright
python3 art/huong-moi/lam-tu-the-2/code/dung_sheet.py        # tách + sheet + JSON + so-do.json
python3 art/huong-moi/lam-tu-the-2/code/xuat.py              # ảnh dải khung + GIF tại chỗ
python3 game/thu-lam-moi-2/cong-cu/tao-thu-lam-moi-2.py      # sinh index.html từ am-dao.html (không sửa nguồn)
python3 -B game/thu-lam-moi-2/cong-cu/quay-lam-moi-2.py      # đo + GIF nền thật + video + ảnh nút cảm ứng (~5 phút)
```
Khi `am-dao.html` đổi → chạy lại dòng 3 (script báo lỗi nếu chỗ thay không còn khớp).

## Làm nét 28/10

Phản hồi: "duyệt hướng nhưng hơi nhoè". Đã đo, tìm ra lý do và thêm bản sheet nét hơn. **Gameplay, tư thế, neo, tỉ lệ, thời gian khung không đổi.**

**Xem ngay** (`xem-thu/net-28-10/`): `so-net-bk217-phong4.png` (iPhone ngang) và `so-net-bk3-phong4.png` – đầu + thân trên của Lam,
phóng 4 lần từng điểm ảnh. Cột 1 = ảnh gen gốc thu thẳng đúng cỡ (chuẩn) · cột 2 = trước (2x PNG) · cột 3 = trước, qua đóng gói WebP · cột 4 = **mới (3x)**.
`so-net-*-1x1.png` = cùng các bản ở đúng cỡ trên màn. Số đo trong `do-net.json`.

**Lý do nhoè (đo trong Chromium, vẽ đúng như game; độ nét = gradient so với ảnh gen thu thẳng, 100 % = chuẩn):**

| Màn | Lam cao (điểm ảnh thật) | Trước (sheet 2x) | Trước, qua WebP q90 | **Mới (3x)** |
|---|---|---|---|---|
| iPhone 844×390 @3x ngang (BK 2,17) – chém D / chạy ô 1 | 243 | 86 % / 84 % | 86 % / 84 % | **96 % / 95 %** |
| màn rộng @3x (BK 3) – chém D / chạy ô 1 | 336 | 78 % / 75 % | 79 % / 75 % | **101 % / 100 %** |

1. **Nguyên nhân chính: sheet 2x bị PHÓNG to** trên iPhone @3x: sheet có 224 px cho dáng đứng nhưng màn vẽ Lam cao ~243 px thật (×1,08),
   màn @3x đủ rộng là 336 px (×1,5). Phóng ảnh trong canvas luôn làm mềm. Mất ~9 % độ nét ở iPhone, ~20 % ở BK 3.
2. **Phụ: cách thu ảnh gen → 2x** (INTER_AREA) mềm hơn Lanczos ~6 % (sheet 2x đạt 94 % so với Lanczos cùng cỡ).
3. **Đóng gói WebP q90 KHÔNG làm mất nét đáng kể**: độ nét 99,5–99,8 %, PSNR ~46 dB, lệch màu trung bình ~2/255. → **không sửa**
   `game/dong-goi-trang-thu.py` (theo đúng điều kiện của việc). Nếu muốn tuyệt đối: WebP lossless cho 4 file này giống PNG ở mọi điểm thấy được
   (2x: 262 + 163 KB; 3x: 584 + 367 KB) – chưa làm.

**Đã làm:**
- Thêm `art/huong-moi/lam-tu-the-2/sprite/lam-moi2-{chay,chem1}-3x.png/.json`: dựng bằng cùng `dung_sheet.py` (cùng neo gen, cùng MỘT tỉ lệ/sheet,
  cùng frame, pha, tick) nhưng cao dáng trung tính 336 px, **thu thẳng từ ảnh gen gốc** (không phóng sheet 2x) bằng Lanczos,
  rồi **làm nét nhẹ có kẹp** (unsharp σ 0,8 px, lượng 0,45; mỗi kênh bị kẹp vào min–max 3×3 của bản thu INTER_AREA cùng cỡ →
  đo được **0 % điểm viền sáng/tối vượt**, mép không răng cưa). JSON ghi `px_nguon_moi_px_logic: 3` + mục `thu_co`.
  Sheet 2x giữ NGUYÊN từng điểm ảnh (JSON chỉ thêm mục `thu_co`).
- **Vì sao 3x, không 4x**: ảnh gen chạy chỉ có ~389 px cho dáng trung tính → 4x (448 px) là phóng ảnh gen, không thêm chi tiết.
  3x khớp đúng iPhone @3x ở BK 3 (1 điểm sheet = 1 điểm màn).
- **RAM giải nén**: 3x chạy 3,9 MB + chém 2,7 MB; 2x 1,7 + 1,2 MB → tổng 4 ảnh ~9,5 MB; bản tô bóng (ngọc cho bóng Vọng, đen cho `?bong=1`)
  giờ chỉ tạo khi cần lần đầu → tối đa ~28 MB nếu dùng hết (< 40 MB).
- Game (`cong-cu/khoi-lam-moi-2.js`): **BK ≤ 2 dùng 2x, BK > 2 dùng 3x** (BK = bộ đệm/logic; tự đổi khi xoay máy). drawImage +
  `imageSmoothingQuality 'high'` như cũ; góc đặt hình làm tròn theo điểm ảnh thật (lệch < ½ điểm thật) để ở BK 3 vẽ 1:1 không nội suy.
  Kiểm trong Chromium: 844×390 @3x → BK 2,17 dùng 3x; 960×540 @3x → BK 3 dùng 3x; 844×390 @2x → BK 1,44 dùng 2x; không lỗi.
- Đã sinh lại `index.html`. Đo lại: `python3 -B game/thu-lam-moi-2/cong-cu/do-net.py` (~2 phút).

**Giới hạn**: đo bằng Chromium (Skia); Safari iPhone dùng bộ lọc riêng nên con số có thể lệch vài %, nhưng ở BK 2,17 giờ là THU nhỏ (×0,72)
chứ không còn phóng to, nên hết nguyên nhân chính. **Chưa thử trên iPhone thật** – nhờ xem lại trên iPhone; nếu vẫn thấy mềm, có thể tăng
lượng làm nét (một số trong `dung_sheet.py`: `NET_3X`). Màn @2x (iPhone cũ, BK ≤ 2) vẫn dùng sheet 2x như trước.
