# Nhận diện 93 ụ — kết quả đo + đề xuất + prompt 6 ụ mẫu

Nguồn yêu cầu: `TURRET_MERGE_BAO_CAO_V2_ART_ANIMATION_TEN_GAME_HUD.txt` (ChatGPT, 07/11) mục II "Quy tắc kiểm tra nhận diện", mục X.P0.
Công cụ: `tools/thap-kt-nhandien.js` + `tools/thap-nhandien-bang.py` (chỉ đọc game, không sửa luật/ảnh).

## 1. Cách đo

- iPhone 13 (390×844, DPR 3). Ô thật trên bàn = **46,5 px CSS = 140 px điểm ảnh**.
- Mỗi ụ vẽ bằng chính `REN.veU` của game: 1★, không huy hiệu, không sao, không hiệu ứng, nòng hướng lên.
- Xuất bảng màu, bảng xám (bỏ màu) và bảng xám 1× (mô phỏng nhìn lướt), sau đó chấm điểm giống cho cả 4.278 cặp:
  `0,45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0,55 × tương quan ảnh xám mờ 20 px`.
- Điểm chỉ dùng để **xếp thứ tự ưu tiên vẽ lại**. Nó không thay được bài test 1 giây với người thật.

## 2. Kết quả chính

| Đo | Bệ chung (đang chạy) | Bệ riêng `<id>_de.png` (thử) |
|---|---|---|
| IoU hình bóng **cả ô** trung bình (gồm bệ) | **0,98** | — |
| Cặp điểm ≥ 0,80 | **1.553** / 4.278 | **865** (−44%) |
| Cặp giống nhất | Máy Nhân Mana ↔ Thánh Địa 0,94 | Pháo Ngôi Sao ↔ Hộp Tiến Hoá 0,93 |

1. **Báo cáo ChatGPT nói đúng điểm yếu nhất: hình bóng.** Cả 93 ụ đang vẽ trên **cùng một bệ tròn tối có ốc** (`de_chung.png`, `render.js` hàm `than()`).
   Phần đầu chỉ chiếm khoảng 45% đường kính bệ. Ở 46 px, mắt thấy "93 cái đĩa giống nhau có chấm sáng ở giữa".
   Chuyển sang ảnh xám thì nhiều cặp gần như không phân biệt được: Laser ↔ Súng Bão, Bão Tuyết ↔ Bộ Ép Xung, Băng ↔ Kiếm Băng, Súng Lục ↔ Độc (`CAP-DE-NHAM.png`).
2. **Hiện tại màu đang gánh việc nhận diện**, kèm huy hiệu vai trò và màu khoá bộ bài (`nhandien.js`). Đúng như báo cáo cảnh báo: khi dồn hiệu ứng hoặc khi người chơi mù màu thì mất nhận diện.
3. **Có sẵn 64 bệ riêng nhưng không dùng.** Thư mục `thap/assets/` có `canon_de`, `lien_de`, `bang_de` (tinh thể băng), `blackhole_de` (càng đỏ), `radar_de` (màn quét)…
   Code cố tình bỏ chúng để giữ bệ trung tính (tư vấn B.2). Thử bật bệ riêng thì số cặp dễ nhầm **giảm 44%** mà không cần gen ảnh mới.
   Tuy vậy các bệ riêng vẫn chung khung bát giác nên chưa giải quyết tận gốc.
4. **Nhiều đầu ụ vẽ góc nghiêng 3/4 nhìn ngang** (nòng chĩa sang phải, có mặt bên). Khi xoay theo mục tiêu thì dễ bị cảm giác "quạt giấy" như báo cáo mục IV đã nói.
   Bản gen mới phải là **top-down thật** cho mọi phần xoay 360°.

## 3. Đề xuất theo thứ tự rẻ → đắt

| # | Việc | Chi phí | Ghi chú |
|---|---|---|---|
| A | Bật **bệ riêng** cho 64 ụ có `_de` (còn lại dùng bệ chung), giữ viên ngọc độ hiếm | 1 hàm trong `render.js` + chụp kiểm | Trái với quyết định B.2 cũ → **cần bạn chốt**. Đo: −44% cặp dễ nhầm |
| B | Gen lại **6 ụ mẫu** theo kiểu module (mục 4) rồi đo lại bằng tool này | 6 tấm ChatGPT + cắt | Đúng lộ trình P0 của báo cáo |
| C | Thêm lớp **PART_B** (bộ phận động thứ 2) vào `veU` + `anim.js` cho các nhóm cần (Tesla, Frost, Black Hole, Radar) | Code vừa | Chỉ làm sau khi B đạt |
| D | Mở rộng cho cả 93 ụ theo 6 họ hình dáng, ưu tiên 25 ụ trong bảng "giống nhất" của `KET-QUA.md` | Lớn | P2 |

Mục tiêu đo cho B và D: **không còn cặp nào ≥ 0,85** trong bảng xám, và bài test người thật nhận đúng ≥ 80%.

## 4. Prompt gen 6 ụ mẫu (ChatGPT)

Theo `thap/QUY-TAC-HINH.md` mục 2: dùng tiếng Anh ngắn, nền magenta #FF00FF đặc, không chữ, đính kèm 1 ảnh ụ cũ để giữ phong cách.
Mỗi tấm là **lưới 2×2 ô vuông bằng nhau**:
ô 1 = ụ lắp hoàn chỉnh · ô 2 = BASE (đứng yên) · ô 3 = HEAD (phần xoay theo mục tiêu / phần động chính) · ô 4 = PART_B (phần động phụ).
Sau khi gen thì cắt bằng `tools/thap-cat-3x.py`, đặt tâm xoay (pivot) bằng tay, và giữ ảnh gốc ở `docs/demo-hop-tuong/thap-art/`.

**Phần chung, dán ở đầu mọi prompt:**

```
Same art style, palette and lighting as the attached turret. Mobile tower defense unit, strict top-down view
(camera straight down, no side faces), readable at 46 px. 2×2 grid of equal square cells on solid magenta #FF00FF,
each part centered, complete, not touching cell edges, same scale in every cell. Cell 1: assembled unit.
Cell 2: BASE only (static mount). Cell 3: HEAD only (main moving module). Cell 4: PART_B only (secondary moving part).
No text, no grid lines, no shadows on the background, no human limbs.
```

**Riêng từng ụ (dán tiếp sau phần chung):**

1. **Cannon (`canon`)**, họ Ballistic, chuyển động A01 TRACK_RECOIL
```
UNIT: heavy cannon. BASE: low square bunker with chamfered corners and 4 stubby stabilizer feet (not round).
HEAD: one thick short barrel on a boxy housing, big muzzle ring, pointing straight up in the image.
PART_B: recoil sleeve / spring cylinder that slides along the barrel. Silhouette reads as a fat "T". Steel and brass.
```
2. **Gatling (`lien`)**, Ballistic, A02 SPIN_FIRE
```
UNIT: gatling. BASE: hexagonal plate with an orange ammo belt drum on one side.
HEAD: housing with a 6-barrel cluster seen from above as a long rectangle pointing up.
PART_B: the 6-barrel rotor seen end-on as a perfect circle of 6 holes (symmetric, will spin in code). Silhouette long and narrow.
```
3. **Tesla (`set`)**, Energy, A03 CHARGE_RELEASE
```
UNIT: tesla coil. BASE: triangular mount with 3 ceramic insulators at the corners.
HEAD: Y-shaped pair of copper electrodes (fork), no gun barrel.
PART_B: glowing blue coil core ring, perfectly round (pulses in code). Silhouette reads as a "Y".
```
4. **Frost (`bang`)**, Energy, A04 OPEN_BLOOM
```
UNIT: frost emitter. BASE: snowflake-shaped six-point plate with ice crystals.
HEAD: central tall ice crystal, faceted, pointing up.
PART_B: ONE ice petal (curved blade) — 3 copies will be placed 120° apart in code and open/close. Silhouette reads as a flower.
```
5. **Radar (`radar`)**, Field/Control, A06 SWEEP_SCAN (ụ hỗ trợ: không ngắm quái)
```
UNIT: radar support tower (clearly NOT a weapon). BASE: round console with a green scope screen.
HEAD: tilted parabolic dish with a long antenna arm (sweeps in code).
PART_B: small ping beacon light on a short mast. Silhouette reads as a dish, no barrel at all.
```
6. **Black Hole (`blackhole`)**, Field/Control, A07 ORBIT_PULSE
```
UNIT: black hole generator. BASE: three red claw pylons in a triangle around an empty center.
HEAD: dark void core sphere with a thin bright rim, perfectly round.
PART_B: outer containment ring, perfectly round, with 3 notches (counter-rotates in code). Silhouette reads as a ring with 3 claws.
```

Mỗi ụ có một hình bóng riêng: chữ T, hình dài hẹp, chữ Y, bông hoa, cái đĩa, vòng có 3 càng. Như vậy dù ở ảnh xám thì 6 ụ vẫn khác nhau.
Sau khi gen: đưa ảnh vào `thap/assets/` (tên `<id>_de.png` / `<id>_nong.png`; PART_B thì chờ việc C) rồi chạy lại tool để so điểm với bảng hiện tại.

## 5. File trong thư mục này

- `BANG-MAU.png`, `BANG-XAM.png`, `BANG-NHO.png`: 93 ụ với bệ chung (đang chạy)
- `be-rieng/…`: cùng bộ ảnh nhưng thay bằng bệ riêng (thử nghiệm A)
- `CAP-DE-NHAM.png`: 30 cặp giống nhất · `KET-QUA.md`: bảng số · `cap.json`: 200 cặp đầu
- Chạy lại: `python3 -m http.server 8765 &` rồi `NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nhandien.js` (thêm `BE=rieng` để chạy bản bệ riêng). Mỗi lần mất khoảng 1 phút.
