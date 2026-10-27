# Chém, bị đánh, nhảy/rơi, lướt, trượt tường của Lam + hiệu ứng ảnh gen – BẢN CHỜ DUYỆT (27/10/2026)

> **Chưa gọi là xong** – chờ chủ dự án xem chuyển động. **Chưa thử trên iPhone thật** (không có máy); mọi số đo dưới đây là
> trong Chromium headless trên máy tính.

Làm theo `art/modular/lam-moi/YEU-CAU-CHAY-NHANH-C.md` mục 5 + phần "Bổ sung", và `art/hieu-ung/YEU-CAU.md`.
Động tác Lam vẽ bằng **rig-v4** (cùng mảnh, cùng tỉ lệ 112 px, sheet 2x, neo chân – không đổi thiết kế, mũ/chóp/chuông lắc trong
đúng biên độ của clip chạy). Hiệu ứng là **ảnh gen ChatGPT** của chủ dự án; code chỉ tách khung, xoá nền trắng, đặt chỗ / hướng /
thời điểm theo gameplay, lật, mờ dần – **không vẽ hình hiệu ứng bằng hình học canvas**.

## Xem gì
| File | Nội dung |
|---|---|
| **`chem-nhay-60fps.mp4`** | **bản chính**, quay trong game thật 60 khung/s (20,8 s): combo chém 1→2→3 trúng quái (hitstop + tia trúng), bị đánh từ trước / từ sau lưng, chém hất, chém trên không, chém nảy trên đầu quái (nảy 2 lần), nhảy tại chỗ + nhảy khi chạy, rơi từ gờ 320 px (bụi to), lướt đất + lướt trên không (bóng mờ), bám → trượt tường → nhảy tường → quay lại tường, Tiếng Vọng phát lại cú chém |
| `chem-debug-hitbox-60fps.mp4` | các cảnh chém + bị đánh, bật `?debug=anim`: **hộp đòn đỏ** (chỉ hiện đúng các bước bật), vùng ăn đòn, hộp quái, khung sprite |
| `so-do.json`, `log-tung-buoc.csv` | số đo từ log từng bước logic (bảng dưới) |
| `../../art/modular/lam-moi/hanh-dong/gif/*-lon.gif` | **GIF lớn** từng động tác (2 px / px logic), vẽ **hộp đòn đỏ** lúc bật, hộp quái thử (xám), atkT từng bước |
| `../../art/modular/lam-moi/hanh-dong/gif/*-112px.gif` | cùng cảnh ở **đúng 112 px logic 1:1** (thu nhỏ LANCZOS từ sheet 2x, không phóng nearest) |

GIF: mỗi bước logic 20 ms (GIF không có 16,7 ms) → chậm hơn game 1,2×; hitstop giữ như game. Video mp4 là nhịp thật.
Góc trên trái video: tên cảnh, trạng thái Lam, tên khung đang vẽ, atkT, "HỘP ĐÒN BẬT", hitstop, vx/vy, hiệu ứng đang chạy.

## Chơi thử
- https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
  (thêm `?debug=anim` để xem hộp đòn + tên khung; `?clip=v3` vẫn so clip chạy cũ – phần hành động dùng chung)
- `game/demo-doi-chieu-v3.html` **không sửa**.

## Bảng trạng thái gameplay ↔ khung hình (đọc từ demo.html, KHÔNG đổi số nào)
Khung chọn trong bước logic 60 Hz theo **biến gameplay của chính bước đó** (atkT, hurtT, vy, bước lướt, quãng trượt…), không chạy
clip độc lập. `dung_hd.py` đọc lại `ATK` + `P` trong demo.html trước khi dựng sheet, game kiểm lại su/ac/re/box khi nạp – lệch là báo lỗi.

| Trạng thái (game) | Số gameplay | Khung (tư thế rig) |
|---|---|---|
| Chém 1 – ngang (`ATK[1]`) | su 11, ac 8, re 8 → vẽ atkT 1–26; **hộp đòn bật atkT 11–18**; lao tới vx 2,2; hitstop 3 khi trúng | 1–2 vào thế · 3–5 chuẩn bị · 6–8 giương (dao ra sau) · 9 xen · 10 vung · **11–13 TRÚNG** · 14–18 trúng (theo đà) · 19–21 thu tay · 22–26 về |
| Chém 2 – hất chéo lên | như trên, combo khi bấm lại lúc atkT ≥ 19; hitstop 4 | 1–3 nối từ thu tay đòn 1 · 4–8 giương thấp · 9–10 vung · **11–13 TRÚNG** · 14–18 · 19–21 thu · 22–26 về |
| Chém 3 – bổ xuống (nặng) | su 11, ac 8, **re 16** → atkT 1–34; lao 3,08; hitstop 6 | 1–3 nhấc dao · 4–8 giương qua đầu · 9–10 vung · **11–13 TRÚNG** (dao sát đất) · 14–18 · 19–26 thu · 27–34 về |
| Chém hất (↑+X, `ATK[5]`) | như chém 1, hộp trên đầu | 1–2 · 3–5 khuỵu · 6–8 nén · 9–10 bật · **11–13 TRÚNG** dao thẳng lên · 14–18 · 19–26 |
| Chém trên không (`ATK[6]`) | su 9, ac 8, re 4 → atkT 1–20; **hộp bật 9–16** | 1–5 giương · 6 xen · 7–8 vung · **9–11 TRÚNG** · 12–16 · 17–20 thu (chân co) |
| Chém nảy (↓+X trên không, `ATK[4]`) | su 0, ac 11, re 4 → **hộp bật ngay atkT 1–10**; trúng → nảy lên, atkT nhảy tới ≥ 11 | 1 đâm xuống · 2–10 giữ dao dưới chân · 11–14 thu (nảy thì vào thu ngay) |
| Bị đánh | `hurt()`: vx ±4,8, vy −6, hurtT 18, hitstop 6, i-frame 60 | tư thế trúng hiện **ngay trong 6 bước hitstop** · hurtT 17–13 / 12–7 / 6–1 = 3 khung; **lực đẩy ngược hướng nhìn → ngửa ra sau**, đẩy cùng hướng (đánh từ sau lưng) → **chúi tới** |
| Nhảy / đỉnh / rơi | vy nhảy −11,97; trọng lực 0,64 (đổi quanh đỉnh); maxFall 10,4 | airT ≤ 3 & vy < −6 bật · vy < −4 lên · vy < 2 đỉnh · vy < 7 rơi · còn lại rơi nhanh (tay giơ, chóp bay) |
| Tiếp đất | landT 10 chỉ khi rơi vy > 5 và **không** đang chạy (game ưu tiên chạy) | landT 10–8 khuỵu sâu · 7–5 đứng dậy; bước chạm đất khít mép (game đặt landT ở bước sau) cũng vẽ khuỵu, không lóe dáng nghỉ |
| Lướt | 8 bước × 11 px = **88 px**, i-frame 11, hồi 18 | bước 1 nhún lao · 2–6 duỗi lướt · 7–8 hãm (cả bước thứ 8 khi `pl.dash` đã về 0) |
| Bám tường | wallStick 6 bước, vy = 0 | bám (mặt quay vào tường, cắm dao) |
| Trượt tường | vy ≤ 1,6 | 2 khung xen kẽ **mỗi 6 px trượt** (theo quãng đường, không theo thời gian) |
| Nhảy tường | vy −11,01, vx 5,4 ra xa tường, wjT 16 | wjT 16–11: đạp tường (chân duỗi về phía tường), rồi các khung nhảy theo vy |
| Chạy | (phiên trước) | clip v4 theo quãng đường – không đổi |
| Đứng, rút dao | | **dáng nghỉ TẠM** (chưa có clip) |
| Chết | deadT 0–104, mờ dần | **TẠM**: khung bị đánh 2 |
| Tiếng Vọng | bản ghi thêm cờ `h2` (khung thuộc sheet hành động) | bóng vẽ đúng khung đã ghi (tô ngọc từng khung, không giữ bản tô cả sheet); vệt chém của bóng hiện đúng atkT đã ghi, mờ 55 % |

## Số đo khớp hộp đòn (từ rig + log game)
**8/8 lần ra đòn trong video: bước hộp đòn bật đầu tiên vẽ đúng khung TRÚNG** (`so-do.json → don`). Mũi dao (px logic so với chân,
Lam nhìn phải) đo trên chính rig, mọi bước hộp đòn bật:

| Đòn | Hộp đòn [x, y, rộng, cao] | Bước bật | Mũi dao lúc bật → cuối | Trong hộp |
|---|---|---|---|---|
| 1 | [4, −97, 147, 48] | 11–18 | (89, −72) → (92, −55) | 8/8 |
| 2 | [−36, −100, 116, 48] | 11–18 | (77, −92) → (74, −97) | 8/8 |
| 3 | [−13, −59, 99, 64] | 11–18 | (85, −3) → (84, −1) | 8/8 |
| 4 nảy | [−26, −24, 64, 82] | 1–10 | (26, 6) → (23, 11) | 10/10 |
| 5 hất | [−9, −140, 97, 60] | 11–18 | (23, −126) → (7, −125) | 8/8 |
| 6 trên không | [−3, −107, 127, 48] | 9–16 | (84, −85) → (89, −69) | 8/8 |

Trong video: combo 3 nhát trúng cả 3 (hitstop 3 / 4 / 6 bước đúng `ATK.hs`), tia trúng hiện ở **giữa phần giao hộp đòn ↔ thân
quái** ngay bước trúng; lướt đo được **8 bước, 88 px** cả hai lần; trượt tường vy tối đa **1,60**; rơi 320 px → **bụi to**, nhảy
thường → bụi nhỏ; bóng Tiếng Vọng phát 26 bước chém, cả 26 vẽ từ sheet hành động.

## Hiệu ứng (ảnh gen) – dùng ở đâu
Cả **6/6 ảnh** trong danh sách đã có trong `art/hieu-ung/nguon/` → đã tách thành `art/hieu-ung/sprite/<ten>-2x.png + .json`
(`art/hieu-ung/code/tach-hieu-ung.py`: flood-fill nền trắng từ mép + khử viền trắng; `lam-bi-danh.png` có alpha sẵn nên giữ).
Ảnh kiểm tách nền: `art/hieu-ung/sprite/kiem-*.png` (nền tối + nền sáng, chấm neo).

| Ảnh | Khi nào (gameplay) | Đặt ở đâu |
|---|---|---|
| vet-chem (ngang / chéo lên / chéo xuống) | khung 0 ở atkT = su−1 (đang vung), **khung 1 đúng bước hộp đòn bật**, khung 3 mờ dần | trước mặt theo cung dao + hộp đòn, bám người khi lao tới; đòn 1, 6 ngang · 2, 5 chéo lên (5 xoay −30°) · 3 chéo xuống · 4 chéo xuống xoay 30° dưới chân |
| trung-don | bước chém trúng (cả nhát của bóng, mờ 60 %); vỏ cứng "Keng" dùng cỡ 55 % | giữa phần giao hộp đòn ↔ thân quái; chém nảy: dưới chân |
| bui nhỏ / to | bật nhảy, tiếp đất (to khi rơi ≥ 150 px), bước tới khi chém, bắt đầu lướt, mỗi bước chân chạy (rất nhỏ, mờ), quái đập / boss nện | chân; đạp tường: xoay 90° áp vào tường |
| dash | 8 bước lướt (bám người) rồi tan | sau lưng, hướng theo hướng lướt; bóng mờ = **chính sprite Lam** mờ dần (mỗi 2 bước, sống 12 bước) |
| truot-tuong | mỗi **14 px trượt** (theo vận tốc trượt), tối đa 3 cái cùng lúc, trôi xuống 0,5 px/bước | mũi dao cắm ở mép tường |
| lam-bi-danh | bước Lam trúng đòn (đứng hình theo hitstop) | ngực Lam |

Nhẹ cho iPhone: pool cố định **16 hiệu ứng đồng thời** (đầy thì thay cái cũ nhất), mọi ảnh `decode()` sẵn trong màn tải; sheet
hiệu ứng tổng ~0,7 MB PNG. Sheet hành động Lam 2043×1822 (2,9 MB PNG, **~14,9 MB RAM giải nén**); bóng Tiếng Vọng tô màu từng khung
vào 1 canvas nháp nên không thêm bản tô cả sheet. Bản build tự chứa: 9,4 MB.
Ảnh nào thiếu → hiệu ứng đó vẽ **khung giữ chỗ TẠM** (viền hồng đứt + chữ "TẠM tên"), có cảnh báo nhỏ, game vẫn chạy.

### Ảnh hiệu ứng còn thiếu (chưa có trong danh sách, đang để như cũ – hạt/vòng vẽ bằng code TẠM)
1. `vong.png` – lúc bấm Vọng (ghi / bóng bắt đầu phát) – hiện là hạt vuông + khung nháy.
2. `cong-huong.png` – Cộng hưởng (vòng sáng to) – hiện là vòng pixel cũ.
3. `keng.png` – tia kim loại khi chém vào vỏ cứng – đang mượn trung-don cỡ nhỏ.
4. `lam-chet.png` (tuỳ) – Lam ngã; còn quái vỡ, mảnh chuông, sóng âm boss… vẫn là hạt cũ (ngoài phạm vi lượt này).

## Cái chưa đẹp / chưa làm
- **Tầm dao ngắn hơn hộp đòn nhiều**: Lam chibi tay ngắn, mũi dao xa nhất ~92 px trước chân, hộp đòn 1 tới 151 px (đòn 6: 124 px) →
  quái ở xa vẫn trúng dù dao chưa chạm; vệt chém + tia trúng đặt ở điểm chạm che bớt. (Đề xuất bên dưới, chưa đổi.)
- Đòn 1 / 6 lúc giương: dao vắt ngang trước mặt / sau mũ một nháy (tay trước luôn vẽ trên cùng) – nhanh nên ít thấy, nhưng ở GIF
  chậm thấy rõ.
- Bị đánh trên không ngắn: sau hurtT về 0 là sang khung nhảy/rơi ngay, chưa có khung "lấy lại thăng bằng".
- Bám/trượt tường: Lam **quay mặt vào tường** và người lệch ~21 px khỏi giữa collider (đầu chibi to, mũ chạm tường thì chân cách
  tường) – xem câu hỏi 1.
- Chân trên không còn nhỏ, khác biệt lên / đỉnh / rơi chủ yếu ở tay + thân; chưa có khung chuyển chạy → nhảy riêng.
- Đứng yên, rút dao (52 bước đầu ải), chết, Vọng: vẫn **TẠM** (dáng nghỉ / khung bị đánh).
- Hiệu ứng vẽ đè lên Lam (theo thứ tự cũ: sau Lam, trước hạt). Vệt chém đã thu nhỏ (0,5–0,6) và đẩy ra trước mặt cho đỡ che mặt;
  thấy lấn át thì giảm tiếp `k` trong `anim_hd.py → VET`.
- Chưa đo trên iPhone / Safari (bộ nhớ, decode, FPS).

## Câu hỏi cần chủ dự án quyết
1. **Trượt tường quay mặt vào tường (cắm dao hãm, vụn gỗ toé từ mũi dao)** hay quay lưng vào tường như hiện game đặt `pl.face`?
   Quay lưng thì chóp mũ to cắm vào tường (cần dời người ~27 px).
2. Hộp đòn đòn 1 / 6 dài hơn tầm dao ~55 px: giữ (dễ trúng, hiệu ứng che) hay thu hộp đòn về sát cung dao (~100 px)?
3. Đòn 3 hộp đòn xuống dưới mặt đất 5 px (y tới +5) – giữ?
4. Hitstop: game đứng hình 3/4/6 bước – đủ "nặng" chưa, hay muốn thêm? (chưa đổi)
5. Lúc HITSTOP tôi **tắt nháy i-frame** (chỉ hình) để luôn thấy tư thế trúng đòn; sau hitstop nháy như cũ – đồng ý?
6. Ưu tiên tiếp: clip đứng thở + rút dao, hay ảnh Vọng / Cộng hưởng?

## Đề xuất gameplay (CHƯA đổi)
- Thu `ATK[1].box` rộng 147 → ~100, `ATK[6]` 127 → ~95 cho khớp tầm dao; `ATK[3].box` cao 64 → 59 (không xuống dưới đất).
- Cho tiếp đất mạnh (vy > 9) hiện khuỵu ngắn kể cả khi đang chạy (hiện game ưu tiên chạy nên chạy-nhảy-chạy không thấy khuỵu).

## File đổi
- `game/demo.html`: nạp sheet hành động + 6 hiệu ứng (decode sẵn, kiểm su/ac/re/box); `lamChon` chọn khung theo gameplay (cờ `h2`);
  `drawLam` vẽ khung cắt sát + neo riêng; hệ hiệu ứng ảnh (pool, `hu()`, `huVet()`, khung TẠM); `dust()` → ảnh bụi; tia trúng tại
  điểm chạm trong `strike()`; `hurt()` gọi `lamChon(true)` để tư thế trúng hiện trong hitstop; bóng mờ lướt = sprite thật; bóng
  Tiếng Vọng ghi/vẽ `h2` + vệt chém; không nháy i-frame trong hitstop; debug ghi tên khung + atkT. **Không đổi** ATK, P, collider,
  vùng ăn đòn, tốc độ, thời lượng.
- `game/build-demo.py`: nhúng `lam_hd` + `hu`.
- `art/modular/lam-moi/hanh-dong/` (mới): `code/` (tu_the_hd.py mốc tư thế, anim_hd.py bảng tick + đặt hiệu ứng, dung_hd.py dựng sheet,
  gif_hd.py GIF), `sprite/lam-hanh-dong-2x.png/.json`, `gif/`.
- `art/hieu-ung/code/tach-hieu-ung.py`, `art/hieu-ung/sprite/` (mới).
- `game/tools/kiem-thu-chem-nhay.py` (quay + đo, file này).

## Chạy lại
```
python3 -B art/hieu-ung/code/tach-hieu-ung.py                 # ảnh gen → sheet hiệu ứng
cd art/modular/lam-moi/hanh-dong/code && python3 -B dung_hd.py && python3 -B gif_hd.py   # sheet hành động + GIF
python3 -B game/tools/kiem-thu-chem-nhay.py                   # quay + đo trong game (~1,5 phút; --khong-quay chỉ đo)
python3 game/build-demo.py                                    # bản build tự chứa
```
Cần pillow, numpy, scipy, playwright + Chromium, ffmpeg.

## Trả lời của chủ dự án (27/10/2026, 07:32) – nguyên văn
1. Quay mặt ra, cắt chóp mũ luôn cũng được
2. Sát tầm
3. Sửa
4. Ok sửa sau nếu tôi thấy chưa ổn
5. Ok
6. Ok
(Điều phối hiểu: 1 = trượt tường quay lưng vào tường/mặt ra ngoài, được cắt chóp mũ chỗ chạm tường; 2 = thu hộp đòn đòn 1/6 về sát tầm dao; 3 = sửa hộp đòn đòn 3 không xuống dưới đất; 4 = giữ hitstop; 5 = giữ tắt nháy trong hitstop; 6 = làm cả clip đứng thở + rút dao, và ảnh Vọng/Cộng hưởng/keng – ảnh do chủ dự án gen.)
Bổ sung (07:33) – nguyên văn: "Ý tôi là cắt hẳn chóp mũ trong giao diện"
(Điều phối hiểu: bỏ hẳn mảnh chóp mũ khỏi Lam ở MỌI hình trong game – clip chạy, sheet hành động, dáng nghỉ, bóng Tiếng Vọng – không chỉ lúc trượt tường.)
