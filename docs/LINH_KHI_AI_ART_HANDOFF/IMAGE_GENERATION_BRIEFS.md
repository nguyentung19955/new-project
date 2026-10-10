# LINH KHÍ — Brief tạo ảnh bằng AI (IMAGE GENERATION BRIEFS)

> **Đọc trước:** game **không dùng file ảnh**. Mọi hình trong game đều **vẽ bằng code**. Vì vậy ảnh AI tạo ra được dùng theo 2 cách:
> 1. **Concept / ảnh tham chiếu.** Đây là cách chính. Ảnh dùng để duyệt hướng mỹ thuật, rồi người vẽ code (các nhánh gd5-*) vẽ lại theo.
> 2. **Sprite thật.** Chỉ làm được cho em bé (phần thân), quái và trùm (phần thân), vũ khí (hình tĩnh), trang phục và biểu tượng vật phẩm, thông qua tệp `.sprite.json`. Ảnh phải qua **hậu kỳ pixel bằng tay** trước khi dùng (xem mục 0.4).
>
> **Quy định bắt buộc cho mọi brief:**
> - **Luôn tạo CONCEPT/REFERENCE SHEET trước.** Không coi ảnh AI là sprite hoàn chỉnh.
> - Chỉ làm sprite sheet sau khi chủ dự án duyệt concept.
>
> Prompt tiếng Anh nằm trong khối `code` để dán thẳng vào công cụ AI. Phần mô tả tiếng Việt dành cho chủ dự án.
>
> Ký hiệu:
> - ✅ = số lấy từ code hoặc đo trên ảnh (`anh/do_dac.json`).
> - 💡 = số đề xuất, chưa có trong game.

---

## 0. Phần chung cho mọi brief

### 0.1 Prompt phong cách gốc (ghép vào đầu mọi prompt)
```
Pixel art game sprite, Vietnamese folk-fantasy action roguelite "Linh Khi", top-down 3/4 view room,
crisp hard-edged pixels, 1-pixel dark outline (#1b1118), 3-tone shading per material (dark/mid/light),
light from upper-right, limited palette, readable silhouette at tiny size, no anti-aliasing, no blur,
flat transparent background, no cast shadow on ground, no text.
```

### 0.2 Negative prompt chung
```
blurry, anti-aliased, soft edges, gradient background, painterly, 3D render, realistic, photo,
semi-transparent pixels, glow halo, white fringe, drop shadow, ground, floor, scenery, frame border,
text, watermark, signature, logo, extra limbs, cropped, inconsistent scale, perspective distortion,
bright red large areas, noisy dithering everywhere, tiny unreadable details
```

### 0.3 Cỡ ảnh đầu ra (chung)

| Bước | Canvas ra | Ghi chú |
|---|---|---|
| Concept | 1024×1024 hoặc 1536×1024 | Nền trong suốt hoặc xám trung tính phẳng `#808080` (để dễ tách nền) |
| Vẽ lại pixel | đúng **cỡ khung đích** ở từng brief | 1 điểm ảnh = 1 điểm ảnh thế giới |
| Xem kiểm | ×1 và ×3 / ×4, phóng bằng "láng giềng gần nhất" | — |

### 0.4 Hậu kỳ khi AI không ra pixel-perfect
Hầu như lúc nào cũng phải làm bước này.
1. Giảm ảnh về cỡ đích bằng **nearest-neighbor**.
   - Không dùng Lanczos hay bicubic.
   - Chú ý: `godot/linh-khi-godot/xuat_sprite.gd` đang dùng Lanczos, sẽ sinh ra điểm ảnh bán trong suốt. Phải làm sạch lại sau đó.
2. Ép màu về bảng màu của brief: tối đa 16 màu cho quái hoặc em bé, 32 màu cho trùm.
3. Alpha chỉ được là 0 hoặc 255 (ngưỡng 128). Xoá viền trắng hoặc xám do bước tách nền để lại.
4. Vẽ lại viền ngoài 1 px bằng màu mực của nhóm.
5. Sửa tay từng điểm ảnh (Aseprite, Piskel, Libresprite…):
   - mắt;
   - mép vũ khí và tay cầm;
   - các khung bị lệch chân.
6. Đặt điểm gốc (chân) và kiểm tra độ thẳng hàng giữa các khung (xem `INTEGRATION_AND_QA.md`).
7. Ghép thành sprite sheet: **mỗi động tác một hàng, khung xếp từ trái sang phải**, mọi khung cùng cỡ.
8. Đóng gói `.sprite.json` bằng công cụ **Xưởng Sprite** (`tools/xuong-sprite/index.html`).

### 0.5 Tiêu chí nghiệm thu chung
- ✔ Đọc ra được nhân vật ở ×1 trên ảnh cảnh `anh/canh/*_480x270.png`.
- ✔ Không có điểm ảnh bán trong suốt.
- ✔ Viền 1 px liền mạch.
- ✔ Đúng hướng nhìn.
- ✔ Đúng cỡ khung và đúng điểm gốc.
- ✔ Không có mảng đỏ tươi.
- ✔ Bóng dáng khác các nhân vật cùng nhóm.

---

## B1 · P0 — Bóng dáng 4 em bé (CONCEPT, chưa làm sprite)

| Mục | Nội dung |
|---|---|
| Mục tiêu | 4 em bé phải phân biệt được chỉ bằng bóng dáng (lỗi H1) |
| Tham chiếu | `anh/contact/em_be_*.png`, `anh/em_be/*_sheet_x4.png` |
| Bóng dáng giữ | Tỉ lệ chibi, đầu khoảng 2/5 chiều cao. Mặt nạ trắng tròn có 2 mắt (dấu hiệu chung của "tinh linh"). Thân nhỏ, chân ngắn |
| Canvas ra | 1536×1024: 4 bé xếp hàng ngang cùng tỉ lệ, kèm hàng thứ hai là **bóng đen** của 4 bé |
| Cỡ khung đích | khoảng **22×33** ✅ (Thợ Săn đứng yên). 3 bé còn lại hiện là 19×31, 24×32, 20×29 ✅. Đề xuất 💡: mỗi bé nằm trong khoảng 18–26 × 28–34 |
| Số khung, bố cục | 4 bé × 1 tư thế đứng yên, quay phải |
| Bảng màu | xem `ART_STYLE_GUIDE.md` mục 5.3 (bảng đề xuất). Màu cấm: đỏ tươi `#ff2818`–`#ff5a40` |
| Nền | trong suốt hoặc xám phẳng |
| Hướng, ánh sáng, tư thế | quay **phải**, nhìn chếch 3/4, ánh sáng trên-phải, đứng thẳng, tay buông |
| Chi tiết giữ | mặt nạ trắng `#f6f0e2`, da tím nhạt `#b7b1d8`, màu chủ đạo của từng bé |
| Được phép đổi | mũ, khăn, dáng người (thấp và chắc, cao và hẹp, tròn mềm, bè ngang), đồ đeo lưng |
| Tiêu chí nghiệm thu | Khi tô đen, nhận ra được cả 4 bé ở 22×33. Mỗi bé có đúng 1 dấu hiệu chính |

```
[0.1 style prompt] Character lineup sheet of 4 chibi spirit children, same scale, facing right, standing idle,
each wears a round white mask with two dot eyes, pale lavender skin, big head (2/5 of height).
1) Blacksmith kid: short stocky, wide shoulders, round hood, small hammer slung on back, crimson cloth #8c1c1f #d2362e #f47a62, brass #e2b64e.
2) Hunter kid: taller and slim, pointed cloth hood, quiver making a diagonal line, forest green #315b3c #4f8951 #a7cf78.
3) Herbalist kid: round head wrap, soft robe, medicine gourd / leaf bundle on back, teal #286b70 #43a39a #9ce5c7, bag #8a5a39.
4) Wrestler kid: wide body, wide-legged stance, headband and big belt #d9a441, no hood, rust orange #7d382b #b85b40 #ed9a61.
Second row: the same four as solid black silhouettes. Each character fits a 22x33 pixel cell when downscaled.
```
Negative: chung (0.2) và thêm `different art styles per character, weapons in hands`.

---

## B2 · P0 — Hiệu ứng trúng đòn 4 bậc và quy tắc cảnh đông (MOCKUP để vẽ lại bằng code)

| Mục | Nội dung |
|---|---|
| Mục tiêu | Nhìn là biết bậc đòn: thường, nặng, chí mạng, vỡ giáp (lỗi H4). Cảnh 12 quái vẫn đọc được (lỗi H3) |
| Tham chiếu | `anh/canh/hieu_ung_dong_1_480x270_x3.png` (và _2, _3), `..._kem_giao_dien.png` |
| Giữ | Bảng màu theo hệ (`ART_STYLE_GUIDE.md` 5.2). Vệt chém có đuôi kiểu ô cờ. Không dùng cộng sáng |
| Canvas ra | 1536×512: 4 cột (4 bậc) × 4 khung thời gian, mỗi ô vẽ ở **cỡ 32×32 rồi phóng ×8** |
| Cỡ khung đích | Hiện tại ✅: sao chớp bán kính 4–9; chí mạng r12, vòng tới 20 / 28 px. Đề xuất 💡 (theo GPT §9.2): thường 3–5 tia; nặng 5–8 tia; chí mạng 7–10 tia và vòng 8–14 px; vỡ giáp 4–7 mảnh `#aab3bc` |
| Số khung | 4 khung mỗi bậc. Thời gian sống ✅ 0.08–0.14 s, tức khoảng 5–8 khung hình ở 60 fps |
| Bảng màu | thường `#fff3df`, nặng `#ffd23f`, chí mạng trắng + `#ffd23f`, giáp `#aab3bc`. **Cấm đỏ** (đỏ là đòn của quái) |
| Nền | trong suốt |
| Được phép đổi | hình dạng tia, số tia, vòng |
| Tiêu chí nghiệm thu | Ở ×1, 4 bậc khác nhau rõ ràng. Không phủ kín thân quái quá 1 khung |
| Tích hợp | **Chưa có đường nạp ảnh** cho hiệu ứng. Ảnh này dùng làm bản mẫu để vẽ lại trong `fx.js` (nhánh gd5-c) |

```
[0.1 style prompt] VFX reference sheet, 4 columns x 4 frames, pixel art hit sparks for an action game, each frame 32x32 px shown at 8x:
col1 normal hit: 3-5 short white rays #fff3df; col2 heavy hit: 5-8 thicker gold rays #ffd23f;
col3 critical: white core, 7-10 gold rays and a thin ring; col4 armor break: 4-7 angular steel shards #aab3bc.
Frames: spawn, peak, fade (checker dither), gone. Transparent background, no red.
```

---

## B3 · P0 — Tương phản Lâu đài cổ (CONCEPT phòng kèm quái)

| Mục | Nội dung |
|---|---|
| Mục tiêu | Quái phải tách khỏi sàn: độ sáng chênh từ khoảng 38–59 (hiện tại) lên ≥ 80 💡 (lỗi H2, H7) |
| Tham chiếu | `anh/canh/laudai_phong_trong_480x270_x3.png`, `laudai_phong_co_quai_480x270_x3.png`, `anh/contact/quai_laudai.png` |
| Giữ | Bố cục phòng ✅: sàn x136–344, y56–252; tường cao 42; nhìn từ trên chếch; ô sàn 16 px; đuốc ở tường sau |
| Canvas ra | 1920×1080 (đúng 480×270 × 4) |
| Cỡ đích | **480×270**, chỉ để tham chiếu bảng màu |
| Bảng màu | sàn `#45403d #514744 #60524b`; tường `#2b2528 #403234 #594342`; đuốc `#e5a75e #ffc878`. Đỏ trầm ≤ `#7a2a2a` |
| Ánh sáng | trên-phải, giảm tối ở góc |
| Được phép đổi | độ sáng, bão hoà, đồ trang trí |
| Cấm | đỏ tươi trên nền; vẽ nhân vật hoặc giao diện vào ảnh nền (riêng bản thử tương phản được phép đặt sprite thật lên trên) |
| Tiêu chí nghiệm thu | Đặt `anh/quai/laudai_sheet.png` lên nền ×1 vẫn đọc được 11 con |
| Tích hợp | **Chưa có đường nạp ảnh nền.** Dùng để chỉnh `room_art.js` (nhánh gd5-c) |

```
[0.1 style prompt but background allowed] Top-down 3/4 dungeon room of an ancient Vietnamese castle, 480x270 pixel art at 4x,
square stone floor in warm greys #45403d #514744 #60524b, back wall dark wine #2b2528 #403234 #594342, two torches #ffc878,
calm low-detail center floor, details only near walls, soft corner darkening, no characters, no UI, no bright red.
```

---

## B4 · P1 — Sprite sheet 4 em bé (sau khi B1 đã duyệt)

| Mục | Nội dung |
|---|---|
| Mục tiêu | Thân em bé đủ động tác, đúng định dạng `em-be-<mã>` |
| Tham chiếu | `anh/em_be/<mã>_sheet_x4.png`. Hàng ảnh: đứng yên, chạy, đứng cầm kiếm, kiếm combo 1, kiếm combo 3, giáo, búa, cung, né, trúng đòn, ngã |
| Bóng dáng giữ | đúng concept B1 đã duyệt |
| Canvas ra | concept 1536×1024; sheet sau hậu kỳ đúng cỡ đích |
| Cỡ khung đích | 💡 **56×56**, gốc chân **(36,46)**. Lý do: phần thân lớn nhất đo được ✅ là ngã dài 43 px (x −34…+8, y −35…+7) và chạy cao 37 px (y −35…+1). Thân phải đứng **trong** ô, vũ khí do code vẽ |
| Số khung, bố cục | mỗi hàng một động tác (định dạng sprite_custom): **idle 8**, **move 8**, **tele 5** (tụ lực), **atk 10**, **hit 2**, **die 8**, **ne 8**. Code đang dùng ✅: idle 8 khung với t×6.5 (khoảng 1.23 s); run 8 khung với t×13 (khoảng 0.62 s); dodge 0.27 s; die 8×0.075 = 0.6 s |
| Bảng màu | mục 5.3 (theo bản đã duyệt) + da / mặt nạ chung. Cấm đỏ tươi |
| Nền | trong suốt, **không** có bóng chân (code tự vẽ) |
| Hướng, tư thế | quay **phải**. Tay gần (phía người xem) ở vị trí cầm ✅: kiếm (12,−9), giáo (11,−15), búa (12,−10), trục cung (3,−16), tính từ chân |
| Chi tiết giữ | mặt nạ và mắt (6 trạng thái mắt ✅: mở, chớp, nhắm, đau, x, mở to), màu chủ đạo |
| Được phép đổi | nếp áo, nhịp nhún. **Không** đổi thời lượng |
| Tiêu chí nghiệm thu | chân thẳng hàng ở mọi khung idle và move; tay khớp điểm cầm ±1 px; đọc được ở ×1 |
| Hạn chế đường nạp | chỉ có **1 hàng atk cho mọi loại vũ khí**. spec, cast dùng atk; dash dùng move ×2. Nếu tay trong ảnh không theo kịp tư thế code thì vũ khí sẽ "lơ lửng". Xem `INTEGRATION_AND_QA.md` |

```
[0.1 style prompt] Sprite sheet reference for ONE chibi spirit child (the approved <Blacksmith/Hunter/Herbalist/Wrestler> design),
facing right, rows: idle breathing (8 frames), run cycle (8), charge-up crouch (5), generic weapon swing body pose without weapon (10),
hurt (2), fall down and lie (8), dodge roll (8). Same scale every frame, feet on the same baseline, empty right hand ready to grip a weapon,
transparent background, no ground shadow, no weapon drawn.
```

---

## B5 · P1 — Quái thường theo vùng (3 brief con: Rừng già, Hang biển, Lâu đài cổ)

| Mục | Nội dung |
|---|---|
| Mục tiêu | Quái đẹp hơn và dễ đọc hơn (H8), mỗi vai đánh có bóng dáng riêng |
| Tham chiếu | `anh/contact/quai_rung.png`, `quai_bien.png`, `quai_laudai.png` (hàng = con, cột = động tác ở tỉ lệ thời gian u) |
| Danh sách ✅ (lưới w×h) | **Rừng già:** Heo Rừng Con 56×32, Bầy Ong Vò Vẽ 44×39, Bọ Hung Mai Cứng 54×34, Hoa Phun Bào Tử 53×36, Chồn Bóng 63×28, Nấm Phồng 32×27, Sóc Ném Quả Nổ 49×37, Nhím Gai Độc 44×28 |
| | **Hang biển:** Cua Lính 48×36, Bầy Cá Con 36×31, Ốc Mượn Hồn 52×41, Hải Quỳ 45×40, Cá Chuồn 53×34, Cá Nóc 32×26, Sứa Bom 39×37, Nhím Biển 29×24 |
| | **Lâu đài cổ:** Lính Ma Giáp Gỉ 50×31, Bầy Dơi Than 46×31, Tượng Đá Cầm Khiên 50×32, Đèn Lồng Ma 44×34, Mèo Đen Hai Đuôi 58×32, Hũ Lửa Sống 30×30, Tiểu Yêu Ném Pháo 44×32, Nhím Than Hồng 30×27 |
| Bóng dáng giữ | dáng loài và tư thế quay PHẢI (ảnh tham chiếu đang quay trái — lật lại) như trong ảnh tham chiếu. Phần thân thật khoảng 20–45 px |
| Canvas ra | concept: 1 tấm/vùng, 8 con cùng tỉ lệ, 1536×1024 |
| Cỡ khung đích | **bằng lưới của từng con +8 px mỗi chiều** (ví dụ Heo Rừng Con → 64×40). Gốc ở giữa đáy (chân) |
| Số khung | Code ✅ chạy 12 khung/giây, thời lượng từng con nằm trong manifest. Ví dụ Heo Rừng Con: idle 1.2 s, move 0.45, tele 0.75, atk 0.6, hit 0.35, die 1.2. Đề xuất 💡 cho sheet: idle 6, move 6, tele 4, atk 6, hit 3, die 8; trong `.sprite.json` đặt `giay` đúng bằng thời lượng code |
| Bảng màu | 2–4 màu chính + 1 màu nhấn (màu hiện tại trong `GAME_ASSET_MANIFEST.json` → `source_dimensions` / `generation_target`). Mẫu GPT: heo `#59402b #916344 #c99a63`, nanh `#f5e6c5`; sứa `#315d8a #4b8fc1 #9de8ef`, lõi `#e9f9ff`; giáp gỉ `#373d4b #697386 #aab3bc`, gỉ `#99513c`; nấm `#724332 #b76b48 #f0c89c`, bào tử `#c4ef85` |
| Màu cấm | đỏ tươi chỉ được ở mắt hoặc điểm nhấn ≤ 4 px. Lâu đài: thân quái phải sáng hơn sàn `#514744` |
| Nền | trong suốt, không bóng, **không** vẽ vòng nổ, tia gai hay đạn vào thân (code vẽ những thứ đó) |
| Hướng | quay **PHẢI** (game tự lật khi đi sang trái), nhìn chếch 3/4, ánh sáng trên-phải |
| Tiêu chí nghiệm thu | mắt và điểm nhận diện vẫn đọc được khi thu 50%; 8 con trong vùng khác bóng dáng nhau |

```
[0.1 style prompt] Monster lineup for the <Old Forest (poison) / Sea Cave (ice) / Ancient Castle (fire)> zone, 8 small creatures,
same pixel scale, all facing RIGHT, idle pose, each 20-45 px tall when downscaled: <list names in English, e.g. wild piglet, wasp swarm,
hard-shell beetle with shield, spore-spitting flower, shadow weasel, puffball mushroom, bomb-throwing squirrel, poison hedgehog>.
2-4 main colors + 1 accent each, eyes readable, transparent background, no effects, no projectiles, no ground shadow.
```

## B6 · P1 — Tinh anh (6) và trùm nhỏ (3)
- Tinh anh ✅:
  - Heo Rừng Nanh Dài 90×44, Nấm Phồng Chúa 83×44;
  - Cua Tướng 84×63, Cá Nóc Chúa 66×61;
  - Tướng Ma 64×44, Hũ Lửa Chúa 68×42.
- Trùm nhỏ ✅: Nấm Chúa 97×64, Cua Đá 116×70, Hổ Lửa 109×65.
- Giữ nguyên loài gốc. Chỉ thêm **1–2 dấu hiệu cấp bậc** lớn (giáp vai, sừng, lõi sáng, vương miện).
- Các mục khác như B5. Trùm nhỏ có thêm `skill1` và `skill2`; đường nạp gộp chúng thành tele + atk.

```
[0.1 style prompt] Elite version of <base monster>, same species and silhouette, facing RIGHT, add only 1-2 big rank marks
(shoulder armor / horns / glowing core / crown), 1.5x bulk, transparent background, no effects.
```

---

## B7 · P1 — Ba trùm vùng (3 brief con)

| | Mộc Tinh (Rừng già) | Ngư Tinh (Hang biển) | Hồ Tinh (Lâu đài cổ) |
|---|---|---|---|
| Tham chiếu | `anh/contact/trum_mocTinh.png` | `trum_nguTinh.png` | `trum_hoTinh.png` |
| Cỡ hiện tại ✅ | lưới 140×126 (vẽ trong ô 164×142) | 150×102 | 174×115; pha 3 là 281×174 nhưng vẽ thu 0.72 |
| Pha ✅ | 3 pha. Pha 2 xanh đậm hơn, pha 3 ngả tím `#8a3cc4 #4a1a78` | Pha 3 hoá băng `#ffffff #b0e2fa #9fd4f0` | Pha 2 phân thân, pha 3 hoá cuồng (đuôi lửa) |
| Động tác ✅ | intro 3.0, idle 2.4, move 1.4, c1–c5 2.0–2.6, phase2 2.4, phase3 2.6, stun 1.6, hit 0.4, die 3.4 (giây) | intro 2.8, idle 2.0, move 1.2, c1–c5 1.9–2.6, die 3.2 | intro 3.0, idle 2.4, move 1.1, c1–c5 2.0–2.5, die 3.4 |
| Bóng dáng giữ | cây cổ thụ có mặt, rễ làm chân | cá lớn nằm ngang, hàm răng, vây lưng | cáo trắng ngà, 9 đuôi xoè |
| Đề xuất 💡 | tán gom 3–5 khối; mặt là khối riêng; 2–3 rễ chính. Gỗ `#513725 #82583a #b18a57`, lá `#287444 #49a34f #a3d86c`, mắt `#e4f0a0` | vảy thành dải lớn. `#183c56 #2d6b88 #63b9cc`, lõi băng `#d8f6ff` | 9 đuôi tách hướng, chỉ 2–3 đuôi sáng cùng lúc. `#542b36 #9d4650 #e57a54`, lõi `#ffd23f`, điểm nóng `#fff3b0` |
| Canvas ra | 1536×1024: 3 pha đứng cạnh nhau, quay phải | như trái | như trái |
| Cỡ đích | giữ lưới ✅. Không phóng to trùm | giữ lưới ✅ | 174×115 (pha 1–2). Pha 3 💡 nên ≤ 202×125 để khỏi phải thu nhỏ |
| Nghiệm thu | đọc được mặt và mắt ở ×1 trong phòng trùm 300×198; không che vùng báo trước | thân không biến thành một mảng trắng khi ra đòn băng | mặt cáo là điểm nhận diện chính |
| Tích hợp | Đường nạp quái **dùng được nhưng không đổi hình theo pha** và không có hàng riêng cho từng chiêu. Muốn đủ thì **cần thêm code** | như trái | như trái |

```
[0.1 style prompt, 32 colors max] Boss concept sheet, 3 phases side by side, facing RIGHT, same scale:
Moc Tinh - ancient tree spirit, face carved in trunk as one clear block, canopy grouped in 3-5 big masses, 2-3 main roots as legs;
phase 2 darker greens, phase 3 corrupted purple #8a3cc4 #4a1a78. Transparent background, no effects, no ground.
```
(Đổi phần mô tả tương ứng cho Ngư Tinh / Hồ Tinh theo bảng.)

---

## B8 · P2 — Vũ khí (4 loại × 10 dòng)

| Mục | Nội dung |
|---|---|
| Tham chiếu | `anh/contact/vu_khi_40_dong.png` (nằm ngang, góc 0), `anh/vu_khi/kiem_ren_nhanh_va_bac.png` (3 nhánh lửa/độc/băng ở mốc 3, 4 bậc hiếm) |
| Danh sách ✅ | **Kiếm:** Kiếm Rèn, Đao Lưỡi Liềm, Kiếm Lá Lúa, Gươm Rồng, Mã Tấu, Dao Rựa, Kiếm Tre, Đoản Kiếm Đông Sơn, Đao Cá Chép, Kiếm Sóng Nước |
| | **Cung:** Cung Rồng Rắn, Nỏ Thần, Cung Sừng Trâu, Cung Tre, Ná Thun, Cung Cánh Cò, Cung Trăng Khuyết, Cung Đàn Bầu, Cung Xương Cá, Cung Đèn Ông Sao |
| | **Giáo:** Giáo Tre Vót, Đinh Ba, Câu Liêm, Mác, Lao Phóng, Giáo Đồng Đông Sơn, Xà Mâu, Mái Chèo, Cờ Lau, Bút Lông |
| | **Búa:** Búa Lò Rèn, Chày Giã Gạo, Chùy Gai, Rìu Đá, Vồ Gỗ, Chiêng Đồng, Trống Đồng, Rìu Xéo Đông Sơn, Búa Đầu Trâu, Chùy Hồ Lô |
| Cỡ đích ✅ | khi dựng đứng: kiếm khoảng 16–28 × 43–52, mũi cách điểm cầm 34–37; cung 18–31 × 32–44; giáo 11–22 × 56–62, mũi 35–40; búa 17–33 × 40–45. Số riêng từng dòng nằm trong manifest (`weapon_<loại>_<dòng>`) |
| Bố cục | concept: 10 dòng của một loại xếp **nằm ngang, cán bên trái, mũi bên phải**. Sprite: 1 hình tĩnh mỗi dòng, có ghi toạ độ **điểm cầm** và **mũi**. Cung: thêm 2 đầu dây |
| Bảng màu | thép `#e4e0d4`, gỗ `#7a4a22 #9a6430`, đồng `#c89a3a`. Viền `#1b1118` (code tự đổi màu viền theo bậc hiếm). Cấm đỏ tươi lớn |
| Chi tiết giữ | mỗi vũ khí có "mặt" (mắt, miệng). Code vẽ chồng mắt lên, nên ảnh AI **không** được vẽ mắt (nếu không sẽ thành hai đôi mắt) |
| Được phép đổi | hình lưỡi và đầu vũ khí, hoa văn Đông Sơn. Mỗi dòng thêm tối đa 1 dấu hiệu nhận diện |
| Nghiệm thu | ở ×1 phân biệt được 10 dòng; điểm cầm nằm đúng giữa cán |

```
[0.1 style prompt] Weapon sheet: 10 Vietnamese folk <swords> lying horizontally, handle on the left, tip on the right, same scale,
<list names>, Dong Son bronze-drum motifs, no faces, no eyes, transparent background, each max 60 px long when downscaled.
```

---

## B9 · P2 — Vệt chém, đạn, chưởng, linh khí (MOCKUP)
- **Vệt chém ✅:**
  - Vòng 12 điểm bám theo mũi vũ khí, sống 0.085 / 0.115 / 0.12 s.
  - Hiện tại vẽ màu đặc + đuôi ô cờ.
  - 💡 Ảnh mẫu: kiếm (cung ngắn), búa (ngắn và dày), giáo (thẳng, dài) × 4 hệ. Mỗi mẫu 3–5 khung, ô 64×64.
- **Đạn quái ✅:**
  - 10 kiểu (bubble, icespike, spore, toxseed, fruit, ember, bua, cannon, orb, thorn), cỡ 17×17. Trùm vùng dùng 34×34.
  - Luôn có quầng đỏ `#ff2a1a` (đỏ = nguy hiểm, phải giữ).
  - 💡 Sheet 10 ô 17×17, quay phải.
- **Mũi tên người chơi:** 17×17, theo 4 hệ. **Không** dùng đỏ.
- **Chưởng:** cầu bán kính 5–8, 3 hệ; bay 4 khung, nổ 5 khung.
- **Linh khí:** viên 5×5 (dấu cộng, lõi trắng); biểu tượng hệ 8×8, 3 tông màu.
- **Tích hợp:** tất cả các mục trên **chưa có đường nạp ảnh**, cần vẽ lại bằng code.

```
[0.1 style prompt] VFX sprite reference, pixel art, transparent background: enemy projectiles 17x17 shown at 8x (bubble, ice spike,
spore, toxic seed, fruit, ember, paper talisman, cannonball, orb, thorn) each with dark outline #1a0a0c and a thin red danger rim #ff2a1a;
player arrows in 4 elements (none, fire #ff7a2a, poison #6fcf3a, ice #7fd4ff) without red.
```

---

## B10 · P3 — Nền ba vùng (CONCEPT bảng màu)
- Giống B3, áp dụng cho Rừng già và Hang biển (bảng màu ở `ART_STYLE_GUIDE.md` mục 5.4).
- Kích thước 480×270 (canvas ra 1920×1080).
- Phòng thường: sàn 208×196. Phòng trùm: sàn 300×198.
- Không có parallax, không cuộn.
- Tham chiếu: `anh/contact/canh_480x270.png`.
- **Chưa có đường nạp ảnh nền** (cần thêm code). Ảnh chỉ dùng làm tham chiếu.

---

## Bảng tổng hợp: brief nào đủ, brief nào thiếu

| Brief | Trạng thái | Còn thiếu |
|---|---|---|
| B1 | **Đủ** | — |
| B2 | Đủ để làm mockup | Hiệu ứng vỡ khiên chưa có trong game, nên không có ảnh tham chiếu |
| B3 | **Đủ** | — |
| B4 | Đủ, nhưng cỡ khung 56×56 là **đề xuất** | Hàng `atk` gộp mọi vũ khí. Điểm cầm theo từng khung đánh chưa xuất (chỉ có điểm cầm khi đứng nghỉ) |
| B5 | **Đủ** | Tên tiếng Anh trong prompt là tự dịch, nên kiểm lại |
| B6 | **Đủ** | — |
| B7 | Đủ cho concept | Ảnh hiệu ứng từng chiêu c1..c5 chưa tách riêng (chỉ có 1 khung giữa chiêu ở mỗi pha) |
| B8 | **Đủ** | Chưa chụp đủ 3 nhánh × 3 mốc cho cả 40 dòng (chỉ có Kiếm Rèn) |
| B9 | Mockup | Chưa tách ảnh đạn và vệt riêng (chỉ thấy trong ảnh cảnh) |
| B10 | Concept | Chưa chụp làng |
