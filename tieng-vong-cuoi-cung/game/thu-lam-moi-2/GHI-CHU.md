# Thử Lam mới 2: CHẠY 8 tư thế + CHÉM 1 (A/B/C/D) + VỆT MẪU PH13 – 28–29/10/2026 – BẢN CHỜ DUYỆT HÌNH

> **Mới nhất (29/10, tối): xem mục "Bộ tư thế 4" ở cuối** – trượt tường LƯNG áp vách (thay kiểu cũ; `?tuong=mat` để so), chém 2, chém 3, hất, chém trên không, lướt, bị đánh đã gắn vào game + vệt mẫu chém 2/3/hất/trên không; GIF + video trong `xem-thu/bo4/`.
> Trước đó: mục "Bộ tư thế 3" – đứng 3, chạy sửa, chém 1 sửa, nhảy/rơi/tiếp đất 6, pogo 3, tường 4 đã gắn vào game; GIF từng động tác + video chơi thật trong `xem-thu/bo3/`.
> Trước đó (PH13): mục "Vệt mẫu PH13" – vệt chém 1 + vệt pogo vẽ bằng code, sửa quy ước tick.

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
| `art/huong-moi/lam-tu-the-2/gif/chem1-tai-cho-{112,2x}-{mau,bong}.gif` | chém tại chỗ: đứng → A 6 bước → B 4 → C 4 → D 8 (quy ước engine, xem mục "Quy ước tick"); có bản `-cham4` |
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
- **CHÉM 1**: hình chọn theo **chính điều kiện hộp đòn** của game: trước hộp → A (atkT 1–6); 4 bước đầu hộp → B (atkT 7–10); 4 bước sau → C (11–14); sau hộp → D (15–22).
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
- **Lịch tick chém**: hình đổi ĐÚNG lúc hộp bật/tắt. Game tính bước bấm = atkT 1 và hộp bật ở atkT 7 (su 7 – không đổi), nên A hiện
  **6 bước**, B 4, C 4, D 8. (29/10: tài liệu, JSON sheet, GIF tại chỗ và log đã sửa theo quy ước này – xem mục "Quy ước tick".)
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

## Vệt mẫu PH13 (29/10)

Làm theo `docs/gameplay/PHAN-HOI-13-LAM-MOI-DONG-TAC.md` mục 1.4, 3 và "Gửi Claude". **Gameplay, hộp đòn, startup, tốc độ không đổi** – chỉ đổi
HÌNH vệt của Lam MỚI ở chém 1 và pogo. Vệt vẽ bằng **path Canvas** (chưa gen ảnh) để duyệt hướng + thời điểm trước. `?lam=cu` giữ nguyên vệt ảnh +
âm nhận cũ. Các đòn khác (chém 2/3, hất, trên không, chém vang) vẫn vệt cũ vì chưa có tư thế. **Chưa thử trên iPhone thật.**

**Xem ngay** (`xem-thu/vet-ph13/`, Lam cao ~112 px, nền thật phòng A):

| File | Nội dung |
|---|---|
| **`dai-chem1-vet.png`** | chém 1 vào không khí, mỗi bước atkT 6 → 15 một ô (phóng 2, điểm ảnh thật); hàng dưới có hộp đòn (đỏ) |
| **`dai-pogo-vet.png`** | pogo không trúng (thấy đủ các pha), atkT 1 → 11; hàng dưới có hộp đòn |
| `chem1-vet-112-mau.gif` / `-mau-cham4.gif` / `-hitbox-cham4.gif` | chém 1 vào hình nộm (trúng thật, có khựng) – toàn tốc / chậm 4 / chậm 4 có hộp |
| `pogo-truot-112-*.gif` | pogo vào không khí: nêm bật → cung ép → mảnh tách → dấu nhỏ, hết hộp là tắt |
| `pogo-trung-112-*.gif` | pogo trúng hình nộm nhiều lần: nảy → vệt tắt ngay, vòng va chạm nhỏ tại điểm trúng |
| `do-vet.json` | log từng bước: atkT, hộp bật?, tư thế, pha vệt, khựng, điểm nảy |

**Chém 1 – lưỡi liềm ngang thấp** (`cong-cu/khoi-lam-moi-2.js`, `V1`):
- Đo trên sheet thử 2 (px logic so với chân, nhìn phải): **B** tay (−8, −59), mũi dao (48, −52); **C** tay (31, −61), mũi (86, −56) → dải quét
  y ≈ −52…−61. Hộp chém 1 = x 4…95, y −97…−49.
- Liềm mở về TRÁI, bụng cong phía trước phải: hai đầu mảnh ở x 14 (giữa tay B và tay C), bụng ở x 88; tâm y −60, cao 25 → **dài : cao ≈ 74 : 25 ≈ 3 : 1**;
  nghiêng xuống 4° theo tư thế C. Lõi nằm trong hộp (chỉ đầu dưới mảnh chạm mép dưới hộp ~1 px); không tô kín hộp.
- Màu: cạnh đồng trầm `#8C6C3C`, thân ngà `#E8DCBC`, lõi `#FFF2D2` (sáng vừa, không trắng chói), viền than mảnh. Không vàng neon, không teal.
- 4 pha trong 8 bước active (atkT 7–14) chia **1 / 3 / 2 / 2**: atkT 7 nét mảnh · 8–10 cung đầy (lõi giảm dần) · 11–12 vỡ (4 mảnh, lõi mờ ở bước đầu)
  · 13–14 mảnh tắt (3 mảnh nhỏ, KHÔNG lõi). **atkT 15 trở đi không vẽ gì** → không còn lõi sáng giả sau active. Pha 1/3 trùng hình B, 2/2 trùng hình C.
- Vệt bám chân Lam mỗi khung (Lam bị đẩy tới khi lấy đà thì vệt đi theo); khựng (hitstop) → vệt đứng yên cùng hình.
- Bóng Vọng: cùng vệt, độ đục 0,5.

**Pogo – nêm/cung ngắn ép xuống** (`VP`, `vePogo`):
- Gốc ở (8, 2) px logic so với chân = ngay dưới mép gấu trước, nơi mũi dao P1 sẽ nhô ra (đổi bằng `vet_pogo` trong `code/bang-thu3.json` khi có
  ảnh P1). Mũi hướng xuống; bề ngang ~28 → 46 px, sâu ~17 → 25 px: **rộng và thuôn, không phải tia dài**. Không kéo dài vũ khí. Nằm trong hộp pogo
  (x −26…38, y −24…58).
- Pha theo atkT (hộp bật NGAY atkT 1): 1–2 nêm bật · 3–5 cung ép · 6–8 mảnh tách · 9–10 dấu rất nhỏ gần lưỡi (không bùng lại).
- **Nảy hoặc hết hộp → tắt ngay** (nảy đặt atkT 11 cùng bước). Trúng → **vòng va chạm nhỏ** (bầu dục ngà viền đồng, 7 bước rồi tắt) tại điểm
  trúng = giữa phần giao hộp ↔ mục tiêu (không vẽ bụi sàn). Lam mới bỏ tia ảnh `trung_don` cũ dưới chân lúc nảy (tia trúng của mục tiêu vẫn có).
- Lưu ý đọc log: pogo tự động / bấm khi đứng ngay trên mục tiêu thường **trúng ngay atkT 1** → nảy cùng bước → không kịp thấy nêm, chỉ thấy vòng
  va chạm + P3. Đúng luật PH13 ("nảy phải tắt ngay vệt bổ"); muốn xem đủ pha vệt thì xem bản pogo trượt.

**Cách tắt/bật để duyệt** (như cũ): `?vfx=0` tắt cả vệt mẫu · `?hitbox=1` hộp đòn · `?cham=4` · `?lam=cu` vệt cũ; trên iPhone: ⚙ → "Lam mới 2".

**Tự đánh giá (chưa phải duyệt)**: liềm đọc rõ hướng ngang thấp ở 112 px; pha vỡ/mảnh tắt còn hơi giống "mũi tên" vì mảnh tách theo trục dài – có
thể chỉnh khi duyệt. Pogo vẫn đang dùng hình tạm D (dao chĩa ngang) nên vệt nằm dưới gấu, chưa nối với mũi dao – sẽ khớp khi có tư thế P1/P2.

### Quy ước tick (sửa 29/10 theo engine thật)

`startAtk` đặt atkT = 0 rồi **cùng bước** cộng 1 → bước đầu vẽ ra màn là **atkT 1**. Hộp bật khi su ≤ atkT < su + ac.

| Đòn | Hình | atkT | Số bước |
|---|---|---|---|
| Chém 1 (su 7, ac 8, re 8) | A lấy đà | 1–6 | 6 |
| | B cắt (hộp bật) | 7–10 | 4 |
| | C kết thúc (hộp bật) | 11–14 | 4 |
| | D hồi | 15–22 | 8 (atkT 23 đòn hết) |
| Pogo (su 0, ac 11, re 4) | P1 (hộp bật ngay) | 1–2 | 2 |
| | P2 | 3 → hết | – |
| | nảy: P3 | từ bước nảy (atkT nhảy lên 11) | 3 bước rồi J2/J3/F |

**Không thêm tick startup.** PH12 ghi "A 1–7, hộp 8–15" là cách đếm lệch 1 tick. Đã sửa cùng quy ước ở: JSON `lam-moi2-chem1-{2x,3x}.json`
(`lich_tick`, `khung_theo_atkT`, `tick` của từng khung), `code/dung_sheet.py`, `code/xuat.py` (GIF tại chỗ A = 6 bước, nhãn ảnh dải),
`khoi-lam-moi-2.js` (chú thích), `xem-thu/do-trong-game.json` (thêm `quy_uoc`, `tu_the`, `vet_pha`, `hitstop` từng bước), `vet-ph13/do-vet.json`.

### Khung code cho các sheet sắp gen (PH13 mục 2)

**Máy hình** đã chạy sẵn trong game (mỗi bước logic, khựng không cộng bước, ghi vào bản ghi Vọng). Khi CHƯA có ảnh thì vẫn vẽ hình tạm như trước;
log `LM2.nhan` cho biết tư thế đáng lẽ hiện (đã kiểm trong Chromium: W1 2 bước → W2 4 → W3/W4 6/6 lặp; J1 2 bước → J2 → J3 2–3 bước quanh đỉnh;
F2 khi rơi nhanh; P1 atkT 1–2 → P2; P3 đúng bước nảy, 3 bước; I1 36 → I2 24 → I3 24 → I1 36).

| Tư thế | Khi nào hiện |
|---|---|
| W1 / W2 | bám tường: 2 bước đầu W1, sau đó W2 (giữ W2 nếu đứng yên trên vách) |
| W3 / W4 | trượt: W3 6 bước + W4 6 bước lặp. Mẫu vách PHẢI; vách trái lật cả hình |
| J1 | tối đa 2 bước đầu sau khi physics đã bật nhảy (nhảy tường: wjT 16–15) – không thêm chờ trên đất |
| J2 | còn đi lên |
| J3 | quanh đỉnh: từ lúc vy ≥ −0,8, tối đa 4 bước, khi vy ≤ 1,8 (= `P.apexThreshold`, vùng game giảm trọng lực ở đỉnh) |
| F1 / F2 | rơi; vào F2 khi vy > 7, về F1 khi vy < 5,5 (trễ chống nháy; maxFall 10,4) |
| L | vừa chạm đất (vy trước chạm > 2) và đứng yên: tối đa 3 bước; chạy/đánh → bỏ ngay; không khoá điều khiển |
| P1 / P2 / P3 | xem bảng quy ước tick |
| I1 / I2 / I3 | đứng: 36 / 24 / 24 / 36 bước (vòng 2 s) |

**Dựng sheet bằng 1 lệnh** (`art/huong-moi/lam-tu-the-2/code/dung_thu3.py`, bảng `code/bang-thu3.json`):
1. Lưu ảnh gen vào `art/huong-moi/nguon/lam-tu-the/` đúng tên: `thu3-pogo-3o.png`, `thu3-tuong-4o.png`, `thu3-nhay-roi-6o.png` (2 hàng × 3:
   J1 J2 J3 / F1 F2 L), `thu3-dung-3o.png`, `thu3-chay-sua.png` (8 ô 2×4), `thu3-chem1-sua.png` (4 ô) – nền trắng, ô đều.
2. Chạy `python3 art/huong-moi/lam-tu-the-2/code/dung_thu3.py` (hoặc chỉ một sheet: `… dung_thu3.py pogo`). Ra `sprite/lam-moi3-<tên>-{2x,3x}.png/.json`,
   ảnh kiểm `kiem/thu3-<tên>-dai.png`, số đo `kiem/thu3-so-do.json`, và cập nhật `sprite/thu3-danh-sach.json` – game tự nạp, không cần sửa code.
3. Sheet hoàn toàn mới: `… dung_thu3.py them <tên> <file.png> <cột> <hàng> <nhãn1,nhãn2,…> [neo_x] [neo_y]` (thêm vào bảng rồi dựng).
- **Tỉ lệ từ ảnh Lam chốt**: mỗi ảnh nguồn MỘT tỉ lệ = bề rộng mũ ở hàng mắt của Lam chốt (41,6 px logic) / trung vị bề rộng mũ các ô – không theo
  khung bao, không theo chiều cao. Mũ các sheet bộ 3 vì vậy cùng cỡ ảnh chốt. ⚠ Sheet chạy/chém thử 2 dựng theo chiều cao nên mũ to hơn chốt 8–31 %;
  khi gen `thu3-chay-sua` / `thu3-chem1-sua` thì dựng lại cả hai bằng lệnh này để cùng luật (game tự ưu tiên bản bộ 3).
- Neo: pogo/nhảy theo giữa mũ (trên không); đứng/chém theo giữa hai ủng + hằng số (chân trụ đứng yên); chạy giữ vị trí trong ô; tường đặt điểm xa
  nhất bên phải (tay áp vách) cách trục 10 px logic (= nửa collider). Đổi trong bảng nếu ảnh thật cần khác.
- Chạy sửa: nếu máy gen đổi các ô yêu cầu giữ, thêm `"lay_o_tu": {"file": "thu2-chay-8o.png", "o": [1, 3, 4, 7, 8]}` vào mục `chay` của bảng.
- Đã chạy thử script bằng ảnh GIẢ (cắt từ sheet thử 2) ngoài repo: dựng đủ 6 sheet, game nạp được; không commit ảnh giả – danh sách hiện rỗng.

**Chạy lại phần PH13:**
```
python3 art/huong-moi/lam-tu-the-2/code/dung_thu3.py                 # khi có ảnh bộ 3
python3 game/thu-lam-moi-2/cong-cu/tao-thu-lam-moi-2.py               # sinh lại index.html
python3 -B game/thu-lam-moi-2/cong-cu/quay-lam-moi-2.py vet do         # ảnh/GIF vệt + log
```

## Bộ tư thế 3 (29/10)

Làm theo `docs/gameplay/PHAN-HOI-13-LAM-MOI-DONG-TAC.md` (mục 2, 5, "Gửi Claude"). Ảnh gen mới trong `art/huong-moi/nguon/lam-tu-the/thu3-*.png`.
**Gameplay, hộp đòn, startup, tốc độ, va chạm KHÔNG đổi** – chỉ đổi HÌNH. `am-dao.html`, P0-B, P0-C, `demo.html` không sửa (vẫn Lam cũ).
**Chưa thử trên iPhone thật** – mọi ảnh/GIF/video quay trong Chromium trên máy chủ.

**Chơi thử:** cùng link ở đầu file (trang `thu-lam-moi-2/index.html`). Trên iPhone: ⚙ → mục "Lam mới – bộ tư thế 3" có 5 nút (Lam mới/cũ · vệt · bóng đen · chậm ×4 · hộp đòn).

### Xem gì trước (`xem-thu/bo3/`)

Mọi GIF: Lam đúng cỡ game (~112 px), **nền thật phòng A**; **trái = màu có vệt, phải = bóng đen (tắt vệt)**, hai bên cùng phím cùng bước.
Dưới mỗi hình ghi: tư thế · trạng thái · bước. Bản thường ≈ toàn tốc (GIF tối đa 50 hình/s → 0,83×; video mới đúng 60 hình/s); `-cham4` = chậm 4 lần.

| File | Nội dung |
|---|---|
| **`choi-that-bo3-60fps.mp4`** | **xem đầu tiên** – chơi thật 22 s, **không bất tử**: đứng 2 s → chạy → chém 1 hình nộm → nhảy-rơi-tiếp đất → pogo trúng hình nộm 3 lần → bám/trượt/nhảy tường (vách trái = hình lật) → sang phòng B đánh Chuông Gỗ (bị đánh 4 lần, còn 1 máu – thấy cả hình tạm "bị đánh"). Góc trên ghi tư thế đang hiện |
| `dung.gif` / `-cham4` | đứng 130 bước: I1 → I2 → I3 → I1 |
| `chay.gif` / `-cham4` | chạy từ đứng, 2 vòng 8 ô rồi dừng |
| `chem1.gif` / `-cham4` | chém 1 vào hình nộm (có khựng), vệt liềm ngang mới |
| `nhay-roi-tiep-dat.gif` / `-cham4` | nhảy tại chỗ: J1 → J2 → J3 → F1 → F2 → L → I1 (khung cố định theo thế giới, thấy cả quỹ đạo) |
| `pogo-trung-hinh-nom.gif` / `-cham4` | 4 lần pogo trên hình nộm: có lần thấy đủ P1 → P2 → P3 |
| `bam-truot-tuong.gif` / `-cham4` | vách TRÁI (hình lật): W1 → W2 → W3/W4 trượt → nhảy tường → rơi → tiếp đất |
| `man-iphone-ngang.png` | màn kiểu iPhone ngang 844×390 @3x có nút cảm ứng (game tự chọn sheet 3x, không lỗi) |
| `log-bo3.json`, `log-video.json` | từng bước: [tư thế, trạng thái, atkN, atkT, vy, chạm đất, khựng, máu, sheet 2x/3x, hộp bật, đã nảy] |
| **`art/huong-moi/lam-tu-the-2/kiem/thu3-so-mu.png`** | **so đầu**: mọi tư thế cạnh Lam chốt, căn theo mắt; khung vàng = cỡ mũ chốt; ⚠ = lệch rõ |
| `art/huong-moi/lam-tu-the-2/kiem/thu3-<sheet>-dai.png` | ảnh dải từng sheet: Lam chốt cùng thang + từng tư thế 2x (đỏ = chân, xanh = trục, vàng = hàng mắt chốt) + 112 px + bóng đen |
| `art/huong-moi/lam-tu-the-2/kiem/thu3-do-dao.png` | lưới 1 px logic trên B, C, P1, P2 – chỗ đo tay / mũi dao để đặt vệt |
| `xem-thu/vet-ph13/` | (quay lại 29/10 với tư thế mới) ảnh dải vệt chém 1 / pogo theo từng bước + GIF + log |

### Đã làm

**1. Tách nền + dựng sheet** (`art/huong-moi/lam-tu-the-2/code/dung_thu3.py`, bảng `code/bang-thu3.json`; một lệnh dựng cả 6 sheet 2x + 3x):
- **Tỉ lệ: MỘT luật chung cho mọi sheet, lấy từ ảnh Lam chốt.** k (px ảnh gen → px logic) = cỡ mũ Lam chốt / trung vị cỡ mũ các ô của sheet;
  **cỡ mũ = căn(bề rộng mũ ở hàng mắt × cao mũ trên mắt)**. Không co theo khung bao, không theo chiều cao người. Mỗi ảnh gen vẽ Lam ở cỡ khác nhau
  (mũ cao 125 → 233 px gen) nên mỗi ảnh có một số k, nhưng tất cả khớp **cùng một cỡ mũ chốt**.
  Vì sao không chỉ bề rộng như khung cũ: ở tường tay áp vách nằm đúng hàng mắt, ở pogo P1 vạt áo chạm hàng mắt → bề rộng đo ra to giả 25–40 %.
  Ô nào rộng/cao > 1,35 thì bề rộng thay bằng cao × 1,18 (tỉ lệ ở các ô sạch). Tường: cả 4 ô; pogo: P1.
- **Chạy sửa**: so `thu3-chay-sua.png` với `thu2-chay-8o.png` từng ô: ô 2/5/6 đổi thật (lệch 10,7–12,0/255); **ô 1/3/4/7/8 máy gen đã vẽ lại dù không
  yêu cầu** (lệch 3,1–3,6/255, mềm hơn 2–4 % theo độ nét Laplacian) → **lấy lại ô cũ 1/3/4/7/8 từ thử 2**, ô 2/5/6 từ bản sửa. Hai ảnh cùng khổ nên dùng
  MỘT tỉ lệ chung (đo trên đúng 8 ô được dùng).
- **Nhảy-rơi**: ảnh là 6 ô MỘT hàng (bảng đã sửa 6 × 1).
- **Neo** (chân của game): đứng/chém 1 = giữa hai ủng (chân trụ đứng yên); chạy = giữ vị trí trong ô như thử 2; **nhảy J1–F2, pogo, tường = mắt đặt
  cao đúng như Lam chốt (72,6 px trên chân)** → đầu không nhảy khi đổi hình trên không; tiếp đất L = đáy ủng; tường: điểm xa nhất bên phải
  (bàn tay áp vách) đặt đúng mép collider (10 px từ trục).
- Xuất `sprite/lam-moi3-{dung,chay,chem1,nhay,pogo,tuong}-{2x,3x}.png/.json` (3x thu thẳng từ ảnh gen bằng Lanczos + làm nét nhẹ có kẹp như trước;
  mọi sheet đều là THU nhỏ ảnh gen, không phóng). Game tự nạp qua `sprite/thu3-danh-sach.json`, bản bộ 3 thay bản thử 2 cho chạy/chém 1.

**2. Gắn vào máy hình** (`cong-cu/khoi-lam-moi-2.js` – máy hình có sẵn từ phiên trước, chỉ sửa 1 chỗ): **bấm nhảy tường → J1 ngay bước đó** (trước đó
còn 1 bước W2). Đo trong game (log-bo3.json):

| Động tác | PH13 yêu cầu | Đo được (bước 60 Hz) |
|---|---|---|
| Đứng | I1 36 / I2 24 / I3 24 / I1 36 | I1 36 → I2 24 → I3 24 → I1 36 (+36 đầu vòng sau) ✔ |
| Chạy | 8 ô / 132 px | mỗi ô 3–4 bước (16,5 px) ✔ |
| Chém 1 | A/B/C/D theo hộp | A 6 · B 4 (+3 khựng) · C 4 · D 8 ✔ |
| Nhảy | J1 ≤ 2 sau khi bật; J2 khi lên; J3 quanh đỉnh | J1 2 · J2 16 · J3 4 (vy −0,26…+1,61; ngưỡng = vùng giảm trọng lực ở đỉnh của game 1,8) ✔ |
| Rơi | F1/F2 có trễ | F1 7 → F2 khi vy > 7 (giữ tới khi < 5,5) → không nháy ✔ |
| Tiếp đất | L ≤ 3 khi đứng yên; chạy/đánh → bỏ ngay | L 3 ✔; đang chạy chạm đất → R ngay ✔ |
| Pogo | P1 ngay tick pogo; P2 sau 2; P3 ngay sự kiện nảy 2–3 | P1 2 (hộp bật cùng bước) · P2 tới hết · P3 ngay bước nảy, đứng yên 3 bước khựng rồi 3 bước ✔. Nảy ngay atkT 1–2 thì không kịp thấy P1/P2 (đúng luật) |
| Tường | W1 2 → W2 4 → W3/W4 mỗi 6; vách trái lật | W1 2 · W2 4 · W3 6 / W4 6 lặp ✔; vách trái lật cả hình ✔; nhảy tường → J1 2 bước ✔ |

**Vệt mẫu PH13 ghép vào tư thế mới** (đo tay trên lưới, `kiem/thu3-do-dao.png`; số ghi trong JSON sheet → game đọc, không viết cứng):
- **Chém 1**: B tay (10, −47) mũi (57, −48) lưỡi ngang; C tay (−2, −34) mũi (47, −20) lưỡi chúc ~16°. Liềm đặt hai đầu ở x 6 (giữa tay B và C),
  bụng x 86, **tâm y −47 = đường lưỡi B**, cao 24 (dài:cao ≈ 3,3:1), nghiêng xuống 5° theo C. Pha 1/3/2/2 như cũ (cung đầy trùng B, vỡ trùng C).
- **Pogo**: gốc vệt dưới mũi dao THEO TƯ THẾ: P1 (19, −20), nêm nghiêng 25° về trước theo lưỡi chéo; P2 (−8, −11) thẳng xuống.

**3. Hình còn TẠM** (chưa có tư thế – máy hình ghi nhãn `tam:<trạng thái>`):

| Động tác | Đang dùng |
|---|---|
| chém 2, chém 3, chém hất, chém trên không, chém vang (Dư Âm), tụ Dư Âm | **D** (hồi chém 1 mới) |
| bị đánh, chết, rút dao lúc vào màn | **D** |
| lướt | ô chạy 4 (bay) |
| tư thế đẩy khỏi vách riêng (PH13 gợi ý "bước sau") | chưa có – nhảy tường dùng J1 |

Vì vậy combo 1→2→3 vẫn trông như chém một lần rồi đứng (vệt nhát 2/3 vẫn là vệt ảnh cũ). Chóp/chuông/tà chuyển động phụ: **chưa làm** (PH13: chỉ khi tách sạch).

### Số đo mũ / mắt giữa các sheet (px logic, cùng thang Lam chốt cao 112) – `kiem/thu3-so-do.json`

| Sheet | Cỡ mũ so chốt | Rộng mũ hàng mắt (chốt 41,6) | Cao mũ trên mắt (chốt 39,4) | Mắt (diện tích; chốt 7,3) | Mắt trên chân | Đỉnh mũ trên chân |
|---|---|---|---|---|---|---|
| Đứng I1–I3 | −0,7…+0,2 % | 42,4–43,4 | 37,7–38,0 | 7,5 | 70,9–71,2 | 108,9–109,0 |
| Chạy R1–R8 | −2,3…+1,7 % | 42,0–44,5 | 36,1–38,8 | 8,2–9,0 | 60,3–69,9 | 96,4–107,0 |
| Chém 1 A–D | −3,8…+1,7 % | 44,9–46,8 | 33,7–36,2 | 6,7–7,0 | 60,3–63,0 ⚠ | 96,5–96,7 ⚠ |
| Nhảy/rơi J1–F2 · L | −2,8…+3,5 % | 43,9–46,4 | 35,0–37,8 | 7,7–8,5 | 72,6 (neo) · L 57,5 | 95–110 |
| Pogo P1–P3 | P1 0 · P2 +0,8 · **P3 −12 %** ⚠ | 39,4–52,0 | 32,2–37,9 | **10,0–10,9** ⚠ | 72,6 (neo) | 105–111 |
| Tường W1–W4 | −2,6…+4,1 % | (52–53, dính tay) | 36,3–38,8 | **12,2–12,6** ⚠ | 72,6 (neo) | 109–112 |

**Lệch rõ (đánh dấu ⚠ trong `thu3-so-mu.png`):**
- **Tường: mắt to hơn chốt ~65 %, mũ trông rộng hơn** (cao mũ khớp, phần mặt tối/khe mũ mở to hơn). Ảnh gen vẽ đầu tường kiểu "cận" hơn. Không co thêm
  vì cao mũ đã khớp; nếu nhìn thấy phình khi nhảy → bám, nên gen lại tường với "same hood opening and eye size as approved Lam".
- **Pogo: mắt to hơn ~40 %; P3 mũ nhỏ hơn 12 %** (đầu ngửa lên nên cao mũ trên mắt ngắn). P3 chỉ hiện 3–6 bước.
- **Chém 1: mũ khớp nhưng người thấp hơn đứng ~11 %** (ảnh gen vẽ chém thân ngắn, đầu to) → khi bấm chém từ đứng, **đầu hạ 8–11 px**. Theo đúng yêu cầu
  "một tỉ lệ từ cỡ mũ" nên không kéo cao người (PH13 cấm thu người để sửa đầu; ở đây là ngược lại – giữ mũ, thân ngắn là do ảnh). Đọc như hạ thấp người
  khi vung; nếu thấy tụt đầu thì cần gen lại chém với thân cao như ảnh chốt.
- **Chạy: nhún vẫn lớn – mắt dao động 9,6 px logic** (60,3–69,9), không giảm so với thử 2: ô sửa 2 và 6 **thấp hơn** ô cũ (mắt 65,0 → 63,5 và
  63,2 → 62,2 khi đo cùng tỉ lệ, cùng mặt đất hàng), ô 5 gần như cũ. Cỡ mũ thì đều (±2,3 %). Ô 5 đã khác ô 1 hơn (ủng xa) – cần mắt người duyệt.
- Màu mũ (trung vị RGB) giữa các sheet: 44–51, 51–57, 68–76 – pogo sáng hơn nhẹ, không thấy nháy trong GIF.

### Tự kiểm theo PH13 mục 5

| Dòng kiểm | Kết quả | Ghi chú |
|---|---|---|
| 112 px, màu + bóng đen, nền thật; toàn tốc rồi chậm | **Đạt** | `xem-thu/bo3/*.gif` (trái màu, phải bóng đen) + `-cham4` + video 60 hình/s |
| Tường: tay/chân tiếp xúc hợp lý, dao không xuyên vách | **Đạt một phần** | bàn tay xa đặt đúng mép vách, dao chúc xuống trong tay gần, không chạm vách, mũi ủng nhỏ phía vách ✔. Thân cách vách ~27 px (chỉ tay chạm) – đúng ảnh gen. **Mũi dao thòng 31–47 px dưới chân** (neo theo mắt) → mấy bước cuối trượt chạm đất dao lấn vào sàn trước khi chuyển L |
| Nhảy: đang lên và rơi khác nhau | **Đạt** | J2 gấu rủ / F1–F2 gấu nhấc, bóng đen phân biệt được |
| Pogo nhận ra người đang bổ khi tắt VFX | **Đạt** | bóng đen P1 dao chéo xuống, P2 dao thẳng dưới gấu |
| Mũ không phình khi đổi trạng thái (không chỉ căn chiều cao) | **Đạt một phần** | cỡ mũ ±4 % mọi tư thế trừ P3 −12 %; **mắt tường +65 %, pogo +40 %** ⚠ (xem trên) |
| Chém thấp đi cùng cung thấp | **Đạt một phần** | vệt nằm trên đường lưỡi B, nghiêng theo C; **nhưng hộp chém 1 cũ (y −97…−49) cao hơn đường quét mới** → lõi vệt sát/dưới mép dưới hộp. Không đổi hộp (luật gameplay) – cần quyết định khi duyệt |
| Pogo = dao ngắn + sóng ngắn, không cọc dài | **Đạt** | dao giữ kích thước thật, vệt nêm/cung ngắn dưới mũi dao. Lưu ý: hộp pogo cũ sâu 58 px dưới chân nên trúng hình nộm khi mũi dao P2 còn cách tới ~70 px (hộp tới 58 px dưới chân, mũi dao 11 px trên chân) |
| Pogo bật ngay, nảy đúng sự kiện, hitstop không phát tiếp hình; không startup / khoá tiếp đất | **Đạt** | bảng nhịp ở trên; khựng giữ nguyên hình |
| Không làm lại gameplay; trang thử riêng; P0-A/B/C giữ Lam cũ | **Đạt** | chỉ sửa `thu-lam-moi-2/` + `art/huong-moi/lam-tu-the-2/` |

### Chạy lại

```
python3 art/huong-moi/lam-tu-the-2/code/dung_thu3.py                   # 6 sheet + ảnh dải + thu3-so-mu.png + số đo
python3 game/thu-lam-moi-2/cong-cu/tao-thu-lam-moi-2.py                 # sinh lại index.html
python3 -B game/thu-lam-moi-2/cong-cu/quay-lam-moi-2.py bo3 videobo3     # GIF từng động tác + video chơi thật (~12 phút)
python3 -B game/thu-lam-moi-2/cong-cu/quay-lam-moi-2.py vet              # ảnh dải vệt chém 1 / pogo
```

## Bộ tư thế 4 (29/10)

Ảnh gen mới: `art/huong-moi/nguon/lam-tu-the/thu4-*.png` (7 ảnh, mỗi ảnh một hàng ô). **Gameplay, hộp đòn, startup, tốc độ, miễn sát thương, cửa sổ
nối combo KHÔNG đổi** – chỉ đổi HÌNH (+ vệt mẫu vẽ bằng code). Không thêm khoá điều khiển. `am-dao.html`, P0-B, P0-C, `demo.html` không sửa.
**Chưa thử trên iPhone thật** – mọi ảnh/GIF/video quay trong Chromium trên máy chủ.

**Chơi thử:** cùng link ở đầu file. Thêm cờ mới **`?tuong=mat`** = trượt tường kiểu CŨ (mặt vào vách, bộ 3) để so; mặc định giờ là **lưng áp vách**.
Trên iPhone: ⚙ → mục "Lam mới – bộ tư thế 3 + 4" có thêm nút **"Tường: LƯNG áp vách (mới) / mặt vào vách (bộ 3)"**.

### Xem gì trước (`xem-thu/bo4/`)

Mọi GIF: Lam đúng cỡ game (~112 px), **nền thật**; **trái = màu có vệt mẫu, phải = bóng đen (tắt vệt)**, cùng phím cùng bước. Dưới hình: tư thế · trạng thái
· atkT · bước · "khựng". Bản thường ≈ toàn tốc (20 ms/bước = 0,83×, giới hạn GIF); `-cham4` = chậm 4 lần.

| File | Nội dung |
|---|---|
| **`choi-that-bo4-60fps.mp4`** | **xem đầu tiên** – chơi thật 21 s, **không bất tử**: đứng → chạy → combo 1→2→3 vào hình nộm → hất → nhảy chém trên không → lướt → bám/trượt LƯNG áp vách trái + nhảy tường → sang phòng B: combo vào Chuông Gỗ, **bị Chuông Gỗ đánh thật 2 lần** (còn 3 máu), lướt, hất. Góc trên ghi tư thế đang hiện. Không có hình tạm nào hiện trong video |
| `combo-1-2-3.gif` / `-cham4` | A B C D → C2A C2B C2C → C3A C3B C3C C3D C3E vào hình nộm (có khựng) |
| `hat.gif` / `-cham4` | H1 nén → H2 chém lên → H3 kết thúc cao → H4 hồi |
| `chem-tren-khong.gif` / `-cham4` | nhảy cạnh hình nộm: J1 J2 → K1 K2 K3 → F1 F2 → L |
| `luot.gif` / `-cham4` | 2 lần lướt trên đất: LU1 → LU2 → LU3 → chạy/đứng |
| `bi-danh.gif` / `-cham4` | đứng cạnh Chuông Gỗ, bị đánh THẬT: BD1 (gồm 6 bước khựng) → BD2 → đứng. Lam nhấp nháy là miễn sát thương cũ của game |
| `tuong-lung-vach-trai.gif` / `-cham4` | vách TRÁI phòng A (hình gốc): WL1 → WL2 → WL3/WL4 trượt → nhảy tường bật sang phải → rơi → tiếp đất |
| `tuong-lung-vach-phai.gif` / `-cham4` | vách PHẢI (khối đá Cổng làng, cột 28) – **cả hình lật**, nhảy tường bật sang trái |
| `dai-vet-chem2.png`, `-chem3`, `-hat`, `-chem-tren-khong` | mỗi bước quanh lúc hộp bật một ô (phóng 2): hàng trên vệt mẫu, hàng dưới có hộp đòn (đỏ) |
| `log-bo4.json`, `log-video.json` | từng bước: [tư thế, trạng thái, atkN, atkT, vy, chạm đất, khựng, máu, bộ sheet, hộp bật, hurtT, lướt, hướng, lật] |
| **`art/huong-moi/lam-tu-the-2/kiem/thu4-so-mu.png`** | **so đầu**: mọi tư thế bộ 4 cạnh Lam chốt, căn theo mắt; khung vàng = cỡ mũ chốt; ⚠ = lệch rõ; "(che)" = tay/dao đè lên mũ nên số cỡ mũ không dùng được |
| `art/huong-moi/lam-tu-the-2/kiem/thu4-<sheet>-dai.png` | ảnh dải từng sheet: Lam chốt cùng thang + từng tư thế (đỏ = chân, xanh = trục, vàng = hàng mắt chốt) + 112 px + bóng đen |
| `art/huong-moi/lam-tu-the-2/kiem/thu4-do-dao.png` | lưới 10 px logic trên C2A–C2C, C3B–C3D, H1–H3, K1–K3 – chỗ đo tay / mũi dao để đặt vệt |

### Đã làm

**1. Dựng sheet** – cùng script `art/huong-moi/lam-tu-the-2/code/dung_thu3.py`, thêm 7 mục vào `code/bang-thu3.json` (`"bo": 4`, ra `sprite/lam-moi4-<tên>-{2x,3x}.png/.json`,
game tự nạp qua `sprite/thu3-danh-sach.json`). **Cùng luật tỉ lệ**: k = cỡ mũ Lam chốt / trung vị cỡ mũ các ô, cỡ mũ = căn(rộng hàng mắt × cao trên mắt).
Sửa nhỏ để đo đúng (luật không đổi):
- **Tìm mắt** (`code/tach.py`): chỉ nhận cụm hổ phách nằm trong mặt tối của mũ. Trước đó viên đá đồng ở chuôi Âm Đao (giơ ngang/trên đầu ở chém 2, 3, hất)
  bị nhận nhầm là mắt. Đã kiểm lại: kết quả đo mọi ảnh bộ 3 + Lam chốt **không đổi**.
- **Ô có tay/dao đè lên mũ không góp vào trung vị** (bảng: `o_do_mu` + lý do): chém 3 ô 1–2 (dao giơ trên đầu → "cao trên mắt" tính tới mũi dao), hất ô 3 (dao dựng
  thẳng trên đầu), bị đánh ô 1 (đầu ngả ra sau → chiều cao mũ đo theo phương đứng ngắn giả). Tường lưng: tay xa giơ áp vách nằm đúng hàng mắt ở cả 4 ô → luôn
  dùng rộng = cao × 1,18 (`mu_thay_rong`, như cách bộ 3 xử lý tay áp vách).
- **Neo**: chém 2 / chém 3 / hất = giữa hai ủng + hằng số theo ô hồi (chân trụ đứng yên, như chém 1); trên không = mắt cao như Lam chốt (như nhảy);
  lướt / bị đánh = trục giữa mũ, chân = đáy ủng; **tường lưng = điểm xa nhất bên TRÁI (bàn tay / lưng áp vách) đặt đúng mép collider phía vách (10 px
  từ trục)**, mắt cao như Lam chốt (như tường bộ 3). Vách phải → lật cả hình quanh trục.

**2. Gắn vào máy hình** (`cong-cu/khoi-lam-moi-2.js`). Lịch đọc **ATK thật lúc chạy** (P0: chém 2 su 7 / ac 8 / re 8; chém 3 9/8/16; hất 11/8/8; trên không 9/8/4).
Đo trong game (log), atkT 1 = bước bấm:

| Đòn | Lấy đà (startup) | Đánh = đúng các tick hộp bật | Kết thúc / hồi (recovery) |
|---|---|---|---|
| Chém 2 (4 ô) | C2A atkT 1–6 | C2B 7–14 | C2C 15–18 · C2D 19–22 |
| Chém 3 (5 ô) | C3A lấy lực 1–5 · C3B đỉnh 6–8 | C3C bổ 9–16 | C3D kết thúc 17–24 · C3E hồi 25–32 |
| Hất (4 ô) | H1 nén 1–10 | H2 chém lên 11–18 | H3 kết thúc cao 19–22 · H4 hồi 23–26 |
| Trên không (3 ô) | K1 lấy đà 1–8 | K2 cắt ngang 9–16 | K3 kết thúc 17–20 |

- **Nối combo** giữ luật cũ (bấm trong recovery, atkT ≥ su + ac): đòn mới bắt đầu → hình đòn mới **ngay bước đó** (đo: D atkT 15 → C2A atkT 1 cùng bước; C2C atkT 15 → C3A).
  Vì vậy khi nối liền thì không thấy C2D (chỉ hiện khi dừng sau nhát 2). Khựng (hitstop) không cộng bước → hình đứng yên.
- **Lướt** (8 bước): LU1 bước 1–2 · LU2 3–6 · LU3 7–8 (đo đúng 2 / 4 / 2); nhảy cắt lướt / va tường / hết lướt → đổi hình ngay.
- **Bị đánh**: BD1 **cùng bước trúng** (hurt() gọi máy hình ngay) qua 6 bước khựng tới hurtT 13 (đo: 12 bước); BD2 hurtT 12 → 1 (đo: 12 bước). Không khoá thêm:
  hết hurtT 8 bấm đòn được như cũ → hình đòn. Chết vẫn hình tạm.
- **Tường lưng**: cùng nhịp **W1 2 → W2 4 → W3/W4 mỗi 6 lặp** (đo: WL1 2 · WL2 4 · WL3 6 / WL4 6 ✔). Lam nhìn RA khỏi vách (= hướng game đã đặt khi bám: mặt
  ngược vách). **Nhảy tường**: J1 ngay bước bấm, nhìn và bật ra phía mặt đang nhìn (vách trái → bật phải, vách phải → bật trái) – không còn quay đầu như kiểu cũ.
- `?tuong=mat` / nút ⚙: dùng lại W1–W4 bộ 3 (mặt vào vách) để so; bóng Vọng ghi lại đúng hình đã hiện.

**3. Vệt mẫu – VỆT MẪU CHỜ DUYỆT** (vẽ bằng code, kiểu liềm PH13, cùng màu ngà/đồng; số đặt trong `bang-thu3.json` → JSON sheet `"vet"`, game đọc – không
viết cứng). Pha như chém 1: 8 bước active chia 1/3/2/2 (nét mảnh → cung đầy → vỡ → mảnh tắt), **ngoài tick hộp không vẽ gì**. Vệt ảnh + âm nhận cũ
của 4 đòn này tắt khi Lam mới (`?lam=cu` giữ nguyên cũ; `?vfx=0` tắt hết). Đo trên tư thế (`kiem/thu4-do-dao.png`, px logic so với chân, nhìn phải):

| Đòn | Đường quét đo | Vệt | So với hộp |
|---|---|---|---|
| Chém 2 – chéo lên | mũi dao C2A (5, −12) → C2B (55, −97), tay ~vai | cung tròn R 62 quanh vai (0, −58), bụng hướng lên-trước 15°, nửa góc 35° | lõi trong hộp (x −36…80, y −100…−52); đầu dưới mảnh thò dưới mép hộp |
| Chém 3 – bổ xuống | mũi C3B (10, −131) trên đầu → C3C (52, −4) | cung R 62 quanh (−5, −55), bụng hướng xuống-trước 25°, nửa góc 43°, **dày hơn** (13) | lõi trong hộp (x −13…86, y −59…0); đầu trên thò trên mép hộp |
| Hất – cung lên | mũi H1 (50, −8) → H2 (55, −110) → H3 (30, −145) | cung R 62 quanh (0, −72), bụng hướng lên-trước 40°, nửa góc 50° | lõi trong hộp (x −9…88, y −140…−80) |
| Trên không – ngang | lưỡi K2 ngang ở y −60, mũi x 81 | liềm ngang như chém 1: hai đầu x 8, bụng x 88, tâm y −66, cao 28 | **lưỡi K2 nằm sát MÉP DƯỚI hộp (y −59)** → tâm vệt đặt cao hơn lưỡi 6 px; nửa dưới liềm vẫn thò dưới hộp ⚠ (giống chém 1 – không đổi hộp) |

Tự đánh giá: vệt chém 2 đọc như cung đứng hơi nghiêng (không rõ "chéo" bằng ảnh tư thế); chém 3 bổ xuống và hất cung lên đọc đúng hướng; trên không ngang rõ.

**4. Hình còn TẠM** (máy hình ghi `tam:<trạng thái>`):

| Động tác | Đang dùng |
|---|---|
| chém vang (Dư Âm, đòn 7), tụ Dư Âm | D (hồi chém 1) – vệt ảnh cũ |
| chết | D |
| rút dao lúc vào màn | D |
| đẩy khỏi vách (tư thế riêng) | chưa có – nhảy tường dùng J1 |
| bóng lướt (vệt bóng mờ sau lưng khi lướt) | LU2 (bóng ghi trước không có nhãn → luôn LU2) |

### Số đo mũ / mắt (px logic, cùng thang Lam chốt cao 112) – `kiem/thu3-so-do.json`, `kiem/thu4-so-mu.png`

Chốt: rộng mũ hàng mắt 41,6 · cao mũ trên mắt 39,4 · mắt (diện tích) 7,3 · mắt trên chân 72,6. Đứng I1: mắt (13,5, −70,9).

| Sheet | Cỡ mũ so chốt | Mắt (diện tích) | Mắt so chân (x, y) | Đỉnh trên chân |
|---|---|---|---|---|
| Tường lưng WL1–4 | −1,8…+2,9 % | 5,6–6,3 (nhỏ hơn chốt ~20 %) | **(52–53, −72,6)** ⚠ | 109–111 |
| Chém 2 C2A–D | +4,9 · **C2B −14,1** ⚠ · −3,9 · +3,9 % | 5,1–8,9 | (9–21, −65…−70) | 102–103 |
| Chém 3 C3A–E | (A, B che) · **C3C +12,0** ⚠ · 0 · −6,3 % | 5,2–6,3 | C3C (26, −55) · C3D (19, −46) | 83–132 (dao) |
| Hất H1–H4 | +2,6 · −7,7 · (H3 che) · 0 % | 3,4–5,4 | H1 (29, −52) · H2 (13, −76) | 90–145 (dao) |
| Trên không K1–K3 | 0 · −6,3 · +0,5 % | 6,6–7,3 | (17–19, −72,6 neo) | 107–110 |
| Lướt LU1–LU3 | 0 · −4,0 · +4,6 % | 7,1–7,3 | (21–26, −48…−54) | 85–93 |
| Bị đánh BD1–BD2 | (BD1 che) · 0 % | 6,2–7,0 | BD1 (25, −82) · BD2 (17, −72) | 107 |

**Lệch rõ:**
- **Tường lưng: thân Lam nằm cách vách ~50 px** (mắt ở 52 px từ trục, trục cách vách 10 px) – ảnh gen chỉ cho BÀN TAY xa chạm vách, tay duỗi dài; lưng/áo không
  áp vách. Vì vậy hình chồi ra phòng hơn collider (hộp ăn đòn 40 px không đổi). Mắt nhỏ hơn chốt ~20 % (bộ 3 to hơn 65 %) – đỡ hơn kiểu cũ. Nếu muốn
  "lưng áp vách" thật thì cần gen lại với lưng/vai sát vách, tay xa gập.
- **Chém 2 C2B −14 %**: mũ bị quét về sau nên đo mỏng; nhìn ở `thu4-so-mu.png` mũ vẫn cùng cỡ khung chốt. **Chém 3 C3C +12 %**: thang chém 3 lấy từ 3 ô
  cúi (C3C–E) vì 2 ô đầu bị dao che; C3C hơi to hơn hai ô kia – cần mắt người duyệt.
- **Thân thấp hơn đứng** (như chém 1 bộ 3): đòn đất mắt ở −65…−70 (đứng −71); hất H1 / chém 3 C3D / lướt cúi thấp hẳn (−46…−54) – đúng dáng nén/bổ/lướt.
- Nối combo: mắt nhảy ≤ 5 px giữa D → C2A → C3A (cùng thang + neo ủng) – không thấy đầu phình trong `combo-1-2-3`.

### Tự kiểm theo PH13 mục 5

| Dòng kiểm | Kết quả | Ghi chú |
|---|---|---|
| 112 px, màu + bóng đen, nền thật; toàn tốc rồi chậm | **Đạt** | `xem-thu/bo4/*.gif` (trái màu, phải bóng đen) + `-cham4` + video 60 hình/s |
| Tường: tay/chân tiếp xúc hợp lý, dao không xuyên vách | **Đạt một phần** | bàn tay xa đúng mép vách cả hai bên (hình lật), dao chúc xuống-trước về phía phòng, không chạm vách ✔. Thân cách vách ~50 px (xem trên) ⚠ |
| Nhảy: đang lên và rơi khác nhau | **Đạt** (bộ 3) | không đổi |
| Pogo nhận ra khi tắt VFX | **Đạt** (bộ 3) | không đổi |
| Mũ không phình khi đổi trạng thái | **Đạt một phần** | cỡ mũ ±7 % ở các ô đo sạch, trừ C2B −14 % (mũ quét), C3C +12 % ⚠; ô bị tay/dao che không đo được, xem bằng mắt ở `thu4-so-mu.png` – không thấy phình |
| Chém đi cùng cung đúng hướng | **Đạt một phần** | chém 3 / hất / trên không đọc đúng hướng; chém 2 cung hơi đứng. Trên không: lưỡi ở mép dưới hộp → nửa dưới vệt ngoài hộp (không đổi hộp) |
| Bóng đen vẫn đọc được động tác khi tắt VFX | **Đạt** | chém 2 dao chéo lên, chém 3 dao giơ trên đầu rồi bổ, hất dao dựng thẳng, trên không dao ngang, lướt người dài ngang |
| Bật ngay, khựng không phát tiếp hình; không thêm startup / khoá | **Đạt** | bảng lịch ở trên; khựng giữ nguyên hình; lướt / bị đánh không khoá thêm |
| Không làm lại gameplay; trang thử riêng; P0-A/B/C giữ Lam cũ | **Đạt** | chỉ sửa `thu-lam-moi-2/` + `art/huong-moi/lam-tu-the-2/` |

### Chạy lại

```
python3 art/huong-moi/lam-tu-the-2/code/dung_thu3.py tuong_lung chem2 chem3 hat chem_khong luot bi_danh   # 7 sheet bộ 4 + ảnh dải + thu4-so-mu.png
python3 game/thu-lam-moi-2/cong-cu/tao-thu-lam-moi-2.py                                                    # sinh lại index.html
python3 -B game/thu-lam-moi-2/cong-cu/quay-lam-moi-2.py bo4 videobo4                                        # GIF + ảnh dải vệt + video (~10 phút)
```
