# Cu Tí to hơn một chút + động tác mượt hơn (16/10)

Yêu cầu chủ game (16/10 19:29): *"nhân vật cần to hơn 1 chút thôi, đồng thời tôi muốn động tác cần phải mượt mà hơn, không muốn trông cứng hoặc trông lạ lùng như hiện tại"*.

Hàng đợi: đã chờ `vu-khi-chatgpt/bao-cao-B.md` (có sẵn khi bắt đầu) rồi mới sửa code. **Không chơi thử bằng tay**: mọi GIF quay headless bằng kịch bản phím cố định (`quay.py`). **Không thêm hình vẽ bằng code**: chỉ phóng, dời, xoay, làm mờ chính các ảnh có sẵn. **Không đổi** sát thương, tầm đánh, vùng trúng, thời lượng đòn, khung chạm, tốc độ chạy.

## Tóm tắt

| Việc | Kết quả | Cờ tắt |
|---|---|---|
| 1. To hơn | Cu Tí trong trận vẽ **×1,2** (thân, vũ khí, nắm tay, vệt chém gắn tay, bóng chân, viền sáng). Hộp va chạm / vùng trúng **giữ nguyên**. | `?cotiTo=0` (thử cỡ khác: `?cotiTo=1.25`) |
| 2. Mượt hơn | 6 sửa bằng code (bảng dưới). Chân chạy trượt **42% → 12%** tốc độ, chạy + chém **82% → 36%**, chạy lùi + chém **~100% → 27%**. Góc vũ khí bật ≥ 90° trong 1 nhịp: **6 chỗ → 1 chỗ cố ý** (Địa chấn). | `?muot2=0` |
| 3. Cần gen lại | 7 động tác, mỗi cái 1 prompt ngắn hướng E (mục Việc 3). | — |
| 4. Kiểm | `node --check` 3 tệp đạt; `build.py` và `build.py --hai-tep` đạt; `tests/smoke.py` 0 lỗi; `cam_giac_vk.test.js` 24/24; `zed_chay_danh.py` 4/7 **giống hệt trước khi sửa** (3 mục hỏng cũ, không do phiên này). | — |

Tệp sửa: `game/js/zed_moi.js` (gần hết), `game/js/fx.js` (nới khung viền sáng quanh bé), `game/js/fx_he.js` (vạch lấy đà nhích lên theo cỡ). Công cụ soát: `quay.py`, `so_sanh.py`, `chup_hud.py` trong thư mục này.

## Việc 1 — To hơn một chút (×1,2)

**Cách làm.** Mỗi lần vẽ Cu Tí trong trận, cả người + vũ khí + nắm tay được dựng ở cỡ cũ vào một canvas phụ (nét ×2 như nền thế giới), rồi vẽ ra ×1,2 **quanh điểm chân**. Canvas phụ luôn đặt đúng lưới điểm ảnh thật (vị trí đã làm tròn theo nửa điểm ảnh game), nên phép phóng 6/5 lặp **đều** mỗi 5 điểm ảnh, không nhoè (`imageSmoothingEnabled = false`), không rung khi đi. Vì phóng quanh chân, chân luôn nằm trên bóng.

| Phóng theo ×1,2 | Giữ nguyên |
|---|---|
| Thân, vũ khí, nắm tay, phi tiêu đang cầm | **Hộp va chạm, vùng trúng, tầm đánh** của Tí (không đụng `combat.js` / `moves.js`) |
| Mũi vũ khí cho vệt chém gắn tay (`doiTip`: nắm tay + độ dài lưỡi ×1,2) | Quái, trùm, đạn, phi tiêu đang bay |
| Bóng chân (rộng 8 → 10 điểm ảnh, lúc chết 12 → 14) | Hình Cu Tí ở giao diện: chân dung, túi đồ, làng, truyện (chỉ lần vẽ có `o.p` trong trận mới phóng) |
| Viền sáng quanh bé, bóng mờ khi lộn, phân thân, bóng mờ khi đứng sau quái to | Vệt chém / cung sáng vẽ theo **tầm đánh** (vị trí ngực 12–17 điểm ảnh): cố ý không dời để vệt vẫn khớp vùng trúng |
| Vạch / vòng lấy đà trên đầu nhích lên 6 điểm ảnh | Số sát thương bay lên (vẫn nằm trên đầu) |

**Soát HUD / tường / cửa** (`anh/hud-6-cho.png`, cỡ điện thoại 844×390): đứng ở 4 góc phòng, sát cửa trên, giữa phòng cầm búa. Lớp giao diện luôn vẽ trên cùng nên **không bị che**. Đứng sát tường trên, đầu Tí khuất sau nút Dừng / ô vũ khí — **y như trước** (`anh/hud-sat-tuong-truoc-sau.png`: trái cỡ cũ, phải cỡ mới; cỡ mới chỉ cao hơn ~6 điểm ảnh). Chân đứng đúng mép sàn, thân trùm lên tán cây tường trên như cũ, cửa vẫn rõ.

## Việc 2 — Mượt hơn

### Cách soát
`quay.py` bấm phím giả 60 nhịp/giây cho **22 động tác** (đứng, đi, chạy, lộn, trúng đòn, chết, chưởng, kiếm 1–3, thương 1–3 + quét, thương giữ → xốc, búa nện, búa giữ → nện đất, phi tiêu, phi tiêu ngắm → chùm, chạy + chém, chạy lùi + chém, 4 chiêu đặc biệt, đổi vũ khí, chuyển động tác liên tiếp). Mỗi nhịp ghi: hàng ảnh + khung, tâm thân, các bàn chân chạm đất, góc vũ khí. Từ đó đo: số nhịp mỗi khung, khung bật tâm, chân trượt (bàn chân trụ trôi ròng trên nền), góc vũ khí bật.

GIF (trái TRƯỚC = `?muot2=0&cotiTo=0`, phải SAU):
- `gif/so-sanh-<động tác>.gif` — cỡ thật (canvas thế giới), 22 động tác.
- `gif/dien-thoai-<động tác>.gif` — cỡ màn điện thoại ngang (dung, chay, kiem-1-3, lon, chay-chem, bua).
- `anh/dai-truoc|sau-<động tác>.png` — từng nhịp 1/60 giây (để soi khung).

### Bảng vấn đề từng động tác

| Động tác | Khung · thời lượng | Vấn đề thấy được | Sửa bằng code | Còn lại (cần ảnh) |
|---|---|---|---|---|
| Đứng thở | 8 · 1,25 s | Sau mỗi động tác vào đứng ở **khung bất kỳ** (theo đồng hồ chung) → nhảy dáng; 8 khung gần như trùng nhau → trông **đứng im, cứng** | Đứng luôn bắt đầu từ khung 1; mờ chuyển 0,1 s khi vào đứng | Biên độ thở quá nhỏ → **gen lại** |
| Đi bộ | 8 · 1,0 s | Khung 2–3 và 6–7 gần trùng: bàn chân trụ gần như không lùi → trượt nhẹ (đo ~88%, trước/sau như nhau) | Nhịp theo quãng đường (đều hơn khi đẩy cần nhẹ / mạnh) | Bàn chân trụ phải lùi đều mỗi khung → **gen lại** |
| Chạy | 12 · 0,75 s | **Trượt chân 42%** (15/10 làm chậm nhịp ×1,25 nhưng tốc độ chạy không đổi); thân thẳng đơ, không nhún | Nhịp chân theo **quãng đường thật** ÷ sải chân đo trên ảnh × 1,2 → **trượt 12%** (vòng chạy ~0,6 s) | Thân không nhún, tóc / đai không bay → **gen lại** |
| Chạy + chém | ghép eo | Chân chạy đủ nhịp trong khi người đi chậm 0,4 → **trượt 82%** | Cùng nhịp quãng đường → **36%**; chạy lùi + chém ~100% → **27%** | — |
| Lộn | 6 · 0,27 s | Khung 1 chồm xa phía trước (tâm thân +9 điểm ảnh so với đứng) → bật khi vào; hết lộn về đứng tức thì | Giữ khung cuối 0,06 s + mờ chuyển về đứng / chạy | Khung 1 nên thu người tại chỗ → **gen lại** |
| Trúng đòn | 4 · 0,2 s | Khung 1–2 ngả hẳn ra sau 8 điểm ảnh rồi khung 3 đứng thẳng ngay → **giật**; chỉ 4 khung | Giữ khung cuối + mờ chuyển về đứng | Thiếu khung hồi → **gen lại (6 khung)** |
| Chết | 8 · 0,6 s | Ổn (khung đầu ngả mạnh nhưng hợp lý) | — | — |
| Chưởng | 6 · 0,3 s | Hết chưởng về đứng tức thì | Giữ khung cuối + mờ chuyển | — |
| Kiếm 1, 2 | 5 · 0,3 s | Chỉ 5 khung, thân gần như không xoay, chỉ tay vung; vào đứng nhảy dáng | Nối góc kiếm liền (không đổi phía), giữ khung cuối, đứng từ khung 1 | Thiếu khung + thân cứng → **gen lại** |
| Kiếm 3 | 6 · 0,46 s | Khung 2 vươn thẳng người, tay giơ cao (dáng **lạ**, như bị kéo dài) rồi khung 3 khuỵu sâu ngay → **bật tâm 4–5 điểm ảnh** | Giữ khung cuối, mờ chuyển | Thiếu khung giữa đứng ↔ khuỵu → **gen lại** |
| Thương 1–3 | 6 · 0,34–0,38 s | Khung 2→3 chồm 6–7 điểm ảnh trong 1 nhịp, khung ★ chỉ hiện 2 nhịp (+ khựng hình) | Nối góc liền | Thiếu khung giữa (ưu tiên sau) |
| Thương quét | 6 · 0,52 s | Góc giáo **bật +144° trong 1 nhịp** lúc vào thế (đường ngắn nhất đổi phía giữa chừng) | Nối theo **đường vung liền** → hết bật | — |
| Thương giữ → xốc | 3 + 4 | Ổn | — | — |
| Búa nện | 8 · 0,8 s | Lúc giữ búa giơ cao (0,24 s, phiên B), đầu búa **trôi dần xuống quét qua bụng** rồi mới nện (đường ngắn nhất 170° → 40° đi vòng dưới); bật 176° lúc vào thế | Ép **vòng qua đầu**; khung giữ dài thì búa đứng yên, chỉ quay trong 0,09 s cuối; nối góc khi đổi hàng | — |
| Búa giữ → nện đất | 4 + 6 | Bật 164–176° khi thả | Như búa nện (nện đất bắt đầu thẳng từ khung giơ cao, không nối ngược) | — |
| Phi tiêu / ngắm / chùm | 6 · 3 · 6 | Ổn; hết đòn về đứng tức thì | Giữ khung cuối + mờ chuyển | — |
| Trảm nguyệt (kiếm đặc biệt) | 6 · 0,35 s | Góc kiếm **bật 146°** lúc tung | Nối góc khi đổi hàng 0,1 s | — |
| Phi thương / Mưa phi tiêu | 6 · 0,35 s | Ổn | Giữ khung cuối | — |
| Địa chấn (búa đặc biệt) | 6 · 0,35 s | Búa **quét vòng dưới chân** 170° → 20° | Ép vòng qua đầu. Còn **1 chỗ bật cố ý**: khung đầu thân đã giơ búa sau đầu nên búa nhảy theo thân (nối thì búa chạy ngược chiều cú nện) | — |
| Đổi vũ khí | — | Món mới hiện ra tức thì | Món mới hiện dần 0,12 s (độ mờ của chính ảnh vũ khí) | — |
| Chuyển động tác | — | Đánh / lộn / trúng đòn → đứng: **bật ngay**; đứng ↔ chạy: đổi hàng tức thì | Giữ khung cuối 0,06 s (chỉ khi đứng yên, cùng mặt) + mờ chuyển 0,1 s khi vào đứng / bước. Vào đòn KHÔNG mờ (đòn phải bắt nhanh) | — |

### Sáu sửa bằng code (`?muot2=0` tắt cả 6)
1. **Giữ khung cuối** của động tác một lần (đòn, lộn, trúng đòn, chưởng, chiêu đặc biệt) thêm 0,06 giây khi về đứng (chỉ khi đứng yên, cùng mặt; đang chạy hoặc ra đòn mới thì không giữ).
2. **Mờ chuyển 0,1 giây** khi vào đứng / bước: khung vừa vẽ (chính ảnh đó, chụp ở canvas phụ) mờ dần từ 50% đè lên khung mới. Không mờ khi quay mặt, khi chết, khi vào đòn.
3. **Đứng thở từ khung 1** sau mỗi động tác (đồng hồ đứng riêng).
4. **Chân theo quãng đường**: pha bước tăng theo quãng đường thật ÷ (sải chân đo trên ảnh × cỡ hiển thị): chạy 36,8, chạy hai tay 44,3, đi 31 điểm ảnh một vòng. Đứng sát tường (đẩy cần mà không đi được) vẫn bước chậm 35%. Lướt kiếm sau lộn giữ nhịp cũ.
5. **Góc vũ khí liền**: (a) vào thế đi trên đường vung cộng dồn (không quy về ±180°), chọn phía theo góc đường vung ở cuối đoạn nối; (b) về thế cầm không đổi phía giữa chừng; (c) đổi hàng ảnh có vũ khí (vào chiêu đặc biệt…) nối 0,1 giây; (d) ép chiều quay qua đầu cho búa nện, nện đất, Địa chấn; (e) khung dài (giữ thế) thì vũ khí đứng yên, chỉ quay ở 0,09 giây cuối khung; (f) búa dùng cùng mốc khung với thân (mốc báo trước của phiên B).
6. **Đổi vũ khí**: món mới hiện dần 0,12 giây.

Tất cả chỉ là hình: đồng hồ đòn, `hitAt`, hộp trúng, tốc độ, đòn nối của phiên B không đổi (bài `cam_giac_vk.test.js` 24/24 vẫn đạt).

## Việc 3 — Động tác cần GEN LẠI (hướng ngang E)

Cách gen: **sửa ảnh gốc, giữ dáng** (khớp 92–94%), mỗi lần chỉ sửa đúng chỗ ghi. Gửi kèm 2 ảnh: (1) ảnh gốc cả hàng `docs/anh-goc/zed/moi/<tệp>.png` (đúng tệp game đang dùng), (2) khung que hướng E cả hàng `docs/khung-que-8-huong/anh/<động-tác>/e-sach.png` (từng khung: `e/k1.png`…; cam = tay phải trước thân, tím = tay trái sau thân). Giữ **đúng số khung** như hiện tại thì game dùng ngay (chỉ chạy lại `docs/anh-goc/zed/dung-zed-game.py` + chỉnh neo vũ khí); riêng trúng đòn xin 6 khung (cần sửa thêm 1 dòng `DONG` + `MOC`).

Thứ tự ưu tiên: **Chạy → Đứng → Kiếm 1 → Kiếm 2 → Kiếm 3 → Lộn → Trúng đòn** (đi bộ để sau cùng).

**Lưu ý phiên song song** `hang-moi-16-10/bao-cao.md` (đẩy lên trong lúc phiên này chạy): chủ game đã gen hàng mới **đứng, lộn, trúng đòn — đạt, chờ đưa vào game** (sau phiên này); kiếm 1 / 2 / 3 mới hỏng (đổi tay) và đã có prompt gen lại kiểu "người đặc". Vì vậy: prompt 2, 6, 7 dưới đây chỉ là **dự phòng** nếu hàng mới chưa ưng; prompt 3–5 (kiếm) là cách **"sửa ảnh gốc, giữ dáng"** từ hàng game đang dùng — thử song song với prompt A/B/C bên đó, lấy bản khớp hơn. Prompt 1 (chạy) chưa có ở đâu khác.

**1. Chạy** — gửi kèm `moi/03-chay-v4.png` + `khung-que-8-huong/anh/03-chay/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti running (12 frames, facing RIGHT). Keep the same character, outfit, colors, size, head size, frame count and feet ground line. Only fix the motion to match the stick figure sheet (orange = right arm in front of body, purple = left arm behind body): lean the body forward ~8°, body 1 px lower on the two contact frames (1 and 7) and 1 px higher on the passing frames (4 and 10), hair and red belt ends trail behind and bounce, the planted foot moves back evenly every frame. Flat #00FF00 background, no weapon, no text.
```

**2. Đứng thở** — gửi kèm `moi/01-dung.png` + `khung-que-8-huong/anh/01-dung/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti idle breathing (8 frames, facing RIGHT). Keep the same character, outfit, pose, size and feet exactly in place. Make the breathing visible: chest and shoulders rise 1 px over frames 1-4 and fall back over 5-8, head bobs 1 px with them, hair tips and red belt ends sway slightly. Right fist stays at the same spot (it holds the weapon in game). Flat #00FF00 background, no weapon, no text.
```

**3. Kiếm nhát 1** — gửi kèm `moi/08-kiem-1-tp.png` + `khung-que-8-huong/anh/08-kiem-1/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti sword slash 1 (5 frames, facing RIGHT, ★hit = frame 3). Keep the same character, outfit, size, frame count, feet ground line and the empty right fist (sword is added in game). Match the stick figure: frame 2 twist shoulders back and bend the knees, frame 3 turn the hips and chest forward into the slash with weight on the front leg, frame 4 follow-through with the body still turned, frame 5 settle back toward the guard. Smooth in-betweens, no jumps. Flat #00FF00 background, no text.
```

**4. Kiếm nhát 2** — gửi kèm `moi/09-kiem-2-tp.png` + `khung-que-8-huong/anh/09-kiem-2/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti sword slash 2, rising slash (5 frames, facing RIGHT, ★hit = frame 3). Keep the same character, outfit, size, frame count, feet ground line and the empty right fist. Match the stick figure: frame 2 dip the body low with the fist low in front, frame 3 rise up from the legs with the chest opening, frame 4 body tall with the fist high, frame 5 settle back down toward the guard. Smooth in-betweens, no jumps. Flat #00FF00 background, no text.
```

**5. Kiếm nhát 3** — gửi kèm `moi/10-kiem-3.png` + `khung-que-8-huong/anh/10-kiem-3/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti sword slash 3, heavy overhead finisher (6 frames, facing RIGHT, ★hit = frame 3). Keep the same character, outfit, size, frame count, feet ground line and the empty right fist. Fix frame 2: not stretched thin — normal body proportions, fists above the head, knees already slightly bent. Frame 3: half crouch (not the deepest yet) as the fists come down. Frame 4: deepest crouch. Frames 5-6 rise smoothly to the guard. No sudden jumps between frames. Flat #00FF00 background, no text.
```

**6. Lộn né** — gửi kèm `moi/04-lon.png` + `khung-que-8-huong/anh/04-lon/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti dodge roll (6 frames, facing RIGHT). Keep the same character, outfit, size, frame count and ground line. Fix frame 1: start the roll from the standing spot — crouch and tuck at the body's center instead of lunging far forward. Frame 2 dives forward a little, frames 3-4 are the tucked ball, frame 5 unrolls, frame 6 stands back in guard at the same height as the idle pose. Flat #00FF00 background, no weapon, no text.
```

**7. Trúng đòn (6 khung)** — gửi kèm `moi/05-trung-don.png` + `khung-que-8-huong/anh/05-trung-don/e-sach.png`
```
Edit the attached sprite sheet of Cu Ti getting hit (now 4 frames, facing RIGHT) into 6 frames. Keep the same character, outfit, size and feet ground line. Frame 1 = current frame 1 (flinch back), frame 2 = current frame 2 (strongest lean back), NEW frame 3 = halfway back up (lean half as much), NEW frame 4 = almost upright, frames 5-6 = current frames 3-4 (recover to guard). Feet stay planted, head size the same every frame. Flat #00FF00 background, no weapon, no text.
```

(Đi bộ, khi rảnh: `moi/02-di.png` + `anh/02-di/e-sach.png` — sửa khung 2–3 và 6–7 để bàn chân trụ lùi đều mỗi khung, giữ 8 khung.)

## Việc 4 — Kiểm tra

| Bài | Kết quả |
|---|---|
| `node --check` zed_moi.js, fx.js, fx_he.js | đạt |
| `python3 build.py` / `python3 build.py --hai-tep` | đạt (trang chính nén 1,15 / 1,50 MB) |
| `tests/smoke.py` | 0 lỗi |
| `node tests/cam_giac_vk.test.js` (phiên B) | 24/24 |
| `tests/zed_chay_danh.py` | 4/7 — **trước khi sửa cũng 4/7, đúng 3 mục đó** (nhát kết khi chạy giảm tốc 25%; mục "chân quay theo hướng chạy" viết cho cách ghép cũ trước zed-eo-sua). Không do phiên này. |
| `quay.py` 22 động tác (cờ bật / tắt) | 0 lỗi JS, `G.zedMoi.loi` rỗng |
| Đăng nhập Google / lưu mây / `?cloud=0` | không đụng tới |

Chạy lại soát: từ `game/` sau khi build: `python3 ../docs/review/ke-hoach-cai-thien/cu-ti-to-muot/quay.py <ra> [cờ]`, rồi `so_sanh.py <trước> <sau> <ra>`; HUD: `chup_hud.py <ra> [cờ]`.
