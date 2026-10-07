# Chuẩn animation & ảnh nhân vật — Thần Thoại Việt

Tài liệu này **tự đủ**: đưa nguyên file (kèm ảnh trong `docs/mau-luoi/`) cho bất kỳ AI tạo ảnh / video nào
(Gemini, ChatGPT, Midjourney, Leonardo, Pippit, Ideogram, Firefly, Fooocus…) hoặc cho họa sĩ là họ vẽ được
ảnh **dùng thẳng trong game**, chỉ cần cắt bằng một lệnh.

Thay cho `docs/LUAT_GEN_ANIMATION.md` (luật cũ: dải 4 ô, mỗi ảnh một động tác — vẫn cắt được bằng `tools/cat-strip.py`, nhưng không dùng cho ảnh mới).

**Bộ tài liệu gồm:**

| File | Dùng để |
|---|---|
| `docs/CHUAN-ANIMATION.md` (+ bản chữ thường `.txt`) | Tài liệu này: phong cách, quy cách từng loại ảnh, nhịp phát, mẫu prompt, cách giao nộp |
| `docs/mau-luoi/hero12.png` · `enemy6.png` · `enemy6-bay.png` · `boss9.png` · `icon4.png` | Ảnh lưới trống có số ô + đường đáy chân — **đính kèm cho AI làm mẫu bố cục** |
| `docs/mau-luoi/vi-du-hero12-lactuong.png` | Ví dụ một tấm tướng đã xếp đúng lưới (ghép từ ảnh Lạc Tướng hiện có) |
| `docs/prompts-tuong.csv` | 60 tướng, mỗi dòng: mã · tên · bậc · hệ · cỡ ảnh · tên file · lệnh cắt · **prompt đầy đủ** |
| `docs/prompts-quai.csv` | 21 quái (2 quái bay) + 9 boss, cùng cột như trên |
| `tools/ghep-luoi.py` | Ghép N ảnh rời (mỗi ảnh một khung) thành tấm lưới đúng chuẩn |
| `tools/cat-sheet.py` | Cắt tấm lưới thành các khung game dùng |

Mở file `.csv` bằng Excel / Google Sheets / Numbers (đã có BOM UTF-8, dấu tiếng Việt hiển thị đúng). Hai file CSV sinh lại bằng `node tools/build-prompts.js`; ảnh mẫu lưới vẽ lại bằng `python3 tools/ve-mau-luoi.py`.

---

## 1. Phong cách chung

- **Chibi dễ thương, đề tài truyền thuyết Việt Nam (Văn Lang – Âu Lạc)**, game thủ thành trên điện thoại màn ngang. Nhân vật nhìn rõ ở cỡ nhỏ (~40 px trên màn hình).
- **Viền nâu sẫm dày, sạch: `#2A1608`** quanh mọi hình (nhân vật, vũ khí, hiệu ứng). Không viền đen thuần.
- **Đổ bóng phẳng (cel shading)**: mỗi mảng màu chỉ 1 sắc tối + 1 sắc sáng. **Không** chuyển màu (gradient), không vân vải / vân giấy, không phát sáng trừ hiệu ứng chiêu nhỏ.
- **Họa tiết trống đồng Đông Sơn** trên trang phục / đồ vật: dải răng cưa (zigzag), ngôi sao mặt trời nhiều cánh, chim Lạc bay, vòng tròn có chấm.
- **Ít màu**: khoảng 20–30 màu phẳng mỗi nhân vật (file nhẹ, tách nền sạch).
- **Hướng nhìn**: quay **sang PHẢI**, góc nghiêng 3/4 (game tự lật khi cần đi sang trái).
- **Tướng phải phân biệt được chỉ bằng bóng đen**: mỗi tướng có tỉ lệ cơ thể riêng (không ép mọi tướng đầu = 1/3 thân), một **mảng hình đặc trưng lớn** (mũ lông, khiên tròn, chuông to…) và **màu chủ đạo riêng**. Không dùng lại một khuôn mặt chibi chung. Thẻ nhận diện từng tướng: `tools/hero-id.js` (đã có sẵn trong prompt ở `prompts-tuong.csv`).

### Bảng màu theo hệ (ngũ hành)

| Hệ | Tên trong prompt | Màu chủ đạo | Màu phụ |
|---|---|---|---|
| Kim | METAL | trắng bạc `#D9DDE0` | điểm đồng vàng |
| Mộc | WOOD | xanh lá `#5FB84A` | nâu gỗ |
| Thủy | WATER | xanh nước `#5AB4D6` | trắng |
| Hỏa | FIRE | đỏ cam lửa `#E0452C` | vàng kim |
| Thổ | EARTH | vàng đất `#C99A3C` | nâu |

(Thẻ nhận diện từng tướng có 3 màu riêng — màu chính, màu phụ, điểm nhấn — ưu tiên theo thẻ đó; màu hệ chỉ là nền chung.)

Màu đồng trống đồng dùng cho giao diện / bản đồ: vàng đồng `#C9963A`, xanh gỉ đồng `#2F6B5E`.

### Độ hiếm (bậc tướng)

| Bậc | Trong prompt | Trang phục |
|---|---|---|
| **Thường** | common hero | quần áo đơn giản, ít chi tiết |
| **Tím** (sử thi) | epic hero | trang phục cầu kỳ hơn, viền tím bạc, hào quang nhỏ |
| **Vàng** (huyền thoại) | legendary hero | lộng lẫy nhất, viền vàng, vương miện nhỏ hoặc vầng sáng |

Bậc cao chỉ thêm chi tiết; **không** được làm mất bóng dáng đặc trưng của tướng.

---

## 2. Luật chung cho MỌI tấm ảnh có lưới

1. **Một ảnh = một nhân vật** (hoặc một bộ icon). Không gộp hai nhân vật vào một tấm.
2. **Lưới vô hình**: các ô vuông bằng nhau, xếp sát nhau, **không vẽ** đường kẻ ô. Đọc ô **trái → phải, trên → dưới** (ô 1 ở góc trên trái).
3. **Nền một màu hồng tím phẳng tuyệt đối `#FF00FF`** ở mọi ô và giữa các ô (game tự xoá màu này). **Không** dùng màu hồng tím / hồng sen trên người nhân vật.
4. **Cùng một nhân vật ở mọi ô**: cùng mặt, trang phục, màu, vũ khí, **cùng tỉ lệ** (không ô to ô nhỏ).
5. **Đường đáy chân**: ở mọi ô toàn thân, bàn chân chạm **cùng một đường ngang cách đáy ô 8%** (92% chiều cao ô, vạch vàng trong ảnh mẫu). Nhân vật **cao khoảng 80–85% ô**. Quái bay: đáy thân ở cùng một độ cao ở mọi ô.
6. **Lề**: chừa trống ít nhất **7–8% mỗi phía** trong ô; vũ khí, cánh, đuôi, vệt chém, hiệu ứng **không chạm / vượt sang ô bên**. Giữa hai nhân vật cạnh nhau phải có khe nền trống.
7. **Tâm chân ở giữa ô** theo chiều ngang (trục dọc mảnh trong ảnh mẫu). Vũ khí dài chìa sang một bên thì vẫn giữ chân ở giữa.
8. **CẤM**: chữ, số, nhãn "[1] IDLE…", tên nhân vật, khung viền, đường kẻ ô, vạch đáy, **bóng đổ dưới chân / dưới sàn**, mặt đất, cỏ, nền cảnh, nền caro giả trong suốt, chữ ký, watermark / logo công cụ, ánh sáng hắt ra ngoài ô.
9. **Thay đổi giữa hai khung liền nhau nhỏ** (chuyển động mượt), nhưng đủ thấy khác.

> Ảnh trong `docs/mau-luoi/` **có** số và vạch để người / AI hiểu bố cục. Khi đính kèm cho AI, luôn ghi kèm: *"the attached grid is only a layout guide — do NOT draw its numbers, lines or labels"*.

---

## 3. Quy cách từng loại

### 3.1 Tướng — `hero12`: 4 cột × 3 hàng = 12 ô 192×192, ảnh **768×576**

Mẫu: `docs/mau-luoi/hero12.png` · Ví dụ: `docs/mau-luoi/vi-du-hero12-lactuong.png`

| Hàng | Ô | Nội dung | Tên khung game |
|---|---|---|---|
| 1 — đứng thở | 1 | dáng đứng đặc trưng, cầm vũ khí | `idle_1` |
| | 2 | cùng dáng, hít vào: ngực + vai nhích lên, tóc / vải / vũ khí hơi nâng | `idle_2` |
| | 3 | cùng dáng, hạ người: gối hơi chùng, vải đung đưa ngược lại | `idle_3` |
| | 4 | **chân dung**: đầu + vai, to, ở giữa ô, thấy rõ nét mặt riêng (không cần đường đáy) | `head` |
| 2 — đánh thường | 5 | chuẩn bị: dồn trọng tâm ra sau, kéo vũ khí về sau (đánh xa: giương / ngắm) | `attack_1` |
| | 6 | vung: thân xoay tới, vũ khí đang lao với **MỘT vệt chém mờ ngắn** (đánh xa: sắp bắn) | `attack_2` |
| | 7 | trúng: duỗi hết cỡ, vũ khí ở cuối đường vung (đánh xa: đạn / tên rời tay) | `attack_3` |
| | 8 | thu về: đang trở về dáng đứng | `attack_4` |
| 3 — chiêu + bị đánh | 9 | bắt đầu chiêu: tụ lực, ánh sáng nhỏ quanh tay | `cast_1` |
| | 10 | đỉnh chiêu: hiệu ứng chiêu riêng của tướng (nhỏ, nằm gọn trong ô) | `cast_2` |
| | 11 | kết thúc chiêu: hiệu ứng tan, người thả lỏng | `cast_3` |
| | 12 | bị đánh: ngả người ra sau, nhắm chặt mắt, một tay giơ đỡ (không máu) | `hurt` |

Cắt: `python3 tools/cat-sheet.py lactuong.png lactuong hero12`

### 3.2 Quái thường — `enemy6`: 3 cột × 2 hàng = 6 ô 192×192, ảnh **576×384**

Mẫu: `docs/mau-luoi/enemy6.png`

| Ô | Nội dung | Khung game |
|---|---|---|
| 1 | đi: chân phải (chân trước) bước tới | `walk_1` |
| 2 | đi: hai chân chụm, người nhô cao nhất | `walk_2` |
| 3 | đi: chân trái (chân sau) bước tới | `walk_3` |
| 4 | đi: hai chân chụm, người nhô cao (khép vòng 4 khung) | `walk_4` |
| 5 | đánh – lấy đà: ngả về sau | `attack_1` |
| 6 | đánh – lao tới cắn / vồ / đâm | `attack_2` |

Quái có thân rắn / bò / bơi: thay "bước chân" bằng uốn thân / quẫy đuôi theo cùng nhịp 4 khung.
Cắt: `python3 tools/cat-sheet.py tom.png tom enemy6`

### 3.3 Quái bay — `enemy6` (cùng lưới), mẫu `docs/mau-luoi/enemy6-bay.png`

| Ô | Nội dung |
|---|---|
| 1 | bay, cánh giơ cao nhất |
| 2 | cánh hạ nửa chừng |
| 3 | cánh hạ thấp nhất |
| 4 | cánh nâng nửa chừng (khép vòng vỗ cánh) |
| 5 | đánh – lấy đà: lùi lại, mắt nheo |
| 6 | đánh – bổ nhào lao tới |

Thân giữ **cùng độ cao** ở mọi ô (không có mặt đất). Cắt giống quái thường: `… doi enemy6`.

### 3.4 Boss — `boss9`: 3 × 3 = 9 ô 256×256, ảnh **768×768**

Mẫu: `docs/mau-luoi/boss9.png`

| Ô | Nội dung | Khung game |
|---|---|---|
| 1–4 | đi 4 khung: chân trước bước · chụm (cao) · chân sau bước · chụm (cao) | `walk_1..4` |
| 5 | đánh – giơ vũ khí lên cao | `attack_1` |
| 6 | đánh – vung xuống với MỘT vệt chém mờ ngắn | `attack_2` |
| 7 | đánh – chạm đất: vũ khí thấp, bụi tung nhỏ | `attack_3` |
| 8 | nổi giận: người ánh đỏ cam, gầm, dang tay | `rage_1` |
| 9 | nổi giận: như trên, ánh mạnh hơn, ngửa đầu | `rage_2` |

Boss to, dữ nhưng vẫn dễ thương, cao ~85% ô. Cắt: `python3 tools/cat-sheet.py thuytinh.png thuytinh boss9`

### 3.5 Icon kỹ năng — 4 ô 128×128 một hàng, ảnh **512×128** (mẫu `icon4.png`)

Mỗi tướng 4 icon theo thứ tự kỹ năng. Mỗi icon: **một biểu tượng đậm, đơn giản, ở giữa ô**, viền `#2A1608`, màu theo hệ của tướng, **không vẽ thân nhân vật, không chữ**. Đọc được ở 40 px. Tên file `icon-<mã>.png`, cắt bằng `python3 tools/cat-icons.py <ảnh> <mã>`.

### 3.6 Icon đồ vật / Thần Khí / Ấn Phù

- **Đồ vật**: một hàng N ô 128×128 (ảnh N×128, thường 4–5 ô), mỗi ô một món, vành / màu theo độ hiếm: Thường = đồng xỉn + gỗ, không ngọc · Hiếm = đồng bóng viền xanh, 1 ngọc xanh · Sử thi = bạc viền tím, ngọc tím, ánh tím nhẹ · Huyền thoại = vàng chạm sao mặt trời, ngọc đỏ, ánh vàng nhỏ. Cắt: `python3 tools/cat-items.py <ảnh> <mã tấm>` (danh sách tấm: `tools/item-sheets.json`).
- **Thần Khí**: 3 ô 128×128 (ảnh 384×128), vành vàng. Tên file `than-khi-<mã>.png`, cắt bằng `python3 tools/cat-icons.py <ảnh> <mã> 3`.
- **Ấn Phù**: lưới 4×3 ô 128×128 (ảnh 512×384), con dấu tròn đá + đồng, ký hiệu khắc ở giữa. Cắt: `python3 tools/cat-runes.py <ảnh> nui|gio|sam`.

Mọi icon: nền `#FF00FF`, không chữ, chừa lề 8%.

### 3.7 Nền bản đồ — **1792×832** (ngang ~2,15:1), không lưới

Nhìn từ trên xuống, hơi nghiêng. **KHÔNG vẽ đường đi / lối mòn / nét đứt** (game tự vẽ đường). **Giữa ảnh để trống**, mặt đất đều; chi tiết chỉ ở gần 4 mép. Họa tiết trống đồng mờ chìm vào nền đất hoặc ở đá góc. Tràn viền (không khung), không chữ. Nền **không** cần hồng tím. Lưu `nen-<mã>.jpg` vào `assets/maps/`.

### 3.8 Nút giao diện — 4 ô 128×128 một hàng, ảnh **512×128**

Phong cách trống đồng: mặt đồng khắc, vòng tròn đồng tâm, sao mặt trời, chim Lạc, viền răng cưa, vàng đồng `#C9963A` + gỉ xanh `#2F6B5E`, viền `#2A1608`. Mỗi ô một biểu tượng đậm ở giữa, đọc được ở 40 px, **không chữ**. Nền `#FF00FF`. Cắt: `python3 tools/cat-items.py <ảnh> <mã tấm>` (ví dụ `ui-tran-4`).

---

## 4. Nhịp phát trong game (cho AI video / animation)

Game **không** phát video; nó lấy từng khung PNG và đổi khung theo nhịp dưới đây (đọc từ `js/render.js`, `js/game.js`). Khi dùng công cụ video, hãy tạo chuyển động **khớp số khung và nhịp này**, rồi rút đúng số khung.

| Nhân vật | Động tác | Số khung | Cách phát | Nhịp |
|---|---|---|---|---|
| Tướng | Đứng thở `idle` | 3 | qua lại 1-2-3-2-1-2… (không nhảy về khung 1) | **5,5 khung/giây** (~0,18 s/khung), một vòng ~0,73 s |
| Tướng | Đánh thường `attack` | 4 | chạy một lượt theo pha đòn | cả đòn **~0,38 s** (tốc đánh cao thì nhanh hơn; ở tốc độ game x2/x3 vẫn chiếu tối thiểu 0,3 s). Xấp xỉ: khung 1 ≈ 10% · khung 2 ≈ 15% · khung 3 (trúng) ≈ 20% · khung 4 (thu về) ≈ 55% |
| Tướng | Tung chiêu `cast` | 3 | lặp vòng 1-2-3 | **9 khung/giây** (~0,11 s/khung) trong suốt thời gian chiêu: 0,5 s (chiêu cuối 0,9 s) |
| Tướng | Bị đánh `hurt` | 1 | giữ nguyên | 0,2 s |
| Tướng | Thắng trận | — | dùng `win.png` nếu có; không có thì `cast` qua lại | 4 khung/giây |
| Tướng | Chân dung `head` | 1 | ảnh tĩnh (thẻ tướng, bảng chọn) | — |
| Quái / boss | Đi `walk` (quái bay: vỗ cánh) | 4 | lặp vòng 1-2-3-4 | **8 khung/giây** (vòng 0,5 s); boss nổi giận 12 khung/giây |
| Quái | Đánh `attack` | 2 | chạy một lượt | đòn **0,45 s** (đánh xa 0,4 s) chia đều: ~0,22 s/khung |
| Boss | Đánh `attack` | 3 | chạy một lượt | 0,45 s chia đều: 0,15 s/khung |
| Boss | Nổi giận `rage` | 2 | lặp vòng 1-2 | 8 khung/giây |

Hệ quả khi vẽ:
- **Đứng thở** phải khép kín qua lại: khung 3 nối ngược về 2 rồi 1 mượt — khác biệt nhỏ (vài px).
- **Đi** phải khép vòng: khung 4 nối thẳng về khung 1.
- **Đánh**: khung 3 (trúng) là khung "đọc" rõ nhất; khung 4 gần dáng đứng để chuyển về idle không giật.
- Game tự đặt **tâm chân** (trung vị điểm có hình ở 10% hàng dưới cùng) vào ô đất — chân lệch giữa các khung sẽ làm nhân vật trượt qua lại.

---

## 5. Tên file & giao nộp

- **Một tấm = một file, tên = mã nhân vật**: `lactuong.png`, `tom.png`, `thuytinh.png`. Mã lấy ở cột `ma` của `prompts-tuong.csv` / `prompts-quai.csv` (chữ thường, không dấu, không cách).
- Icon: `icon-<mã>.png`; Thần Khí: `than-khi-<mã>.png`; bản đồ: `nen-<mã>.jpg`; nút: `<mã tấm>.png`.
- Định dạng **PNG** (bản đồ được phép JPG). Đúng kích thước ở mục 3; AI ra ảnh lớn hơn **đúng tỉ lệ** (ví dụ 1536×1152 cho tướng) vẫn dùng được — cắt tự co theo tỉ lệ ô.
- Bỏ file vào thư mục dự án rồi chạy lệnh cắt:

| Loại | Lệnh |
|---|---|
| Tướng | `python3 tools/cat-sheet.py <ảnh> <mã> hero12` |
| Quái / quái bay | `python3 tools/cat-sheet.py <ảnh> <mã> enemy6` |
| Boss | `python3 tools/cat-sheet.py <ảnh> <mã> boss9` |
| Ảnh rời → lưới | `python3 tools/ghep-luoi.py <hero12\|enemy6\|boss9> <ra.png> <ảnh1> … <ảnhN>` (hoặc một thư mục) |

Lệnh cắt tự: xoá nền hồng tím (kể cả viền ám hồng), xoá nhãn / vạch kẻ AI lỡ vẽ, cắt mọi khung toàn thân cùng chiều cao (chân cùng đường đáy), ghi số khung vào `PACK_FRAMES` trong `js/render.js`, lưu vào `assets/packs/<mã>/`. Sau khi cắt: tăng phiên bản game theo `CLAUDE.md`.

---

## 6. Mẫu prompt CHUNG (tiếng Anh — AI ảnh hiểu tốt nhất)

Thay các chỗ `[…]`. Cần prompt điền sẵn cho từng nhân vật thì lấy cột `prompt` trong `docs/prompts-tuong.csv` / `docs/prompts-quai.csv`.

### 6.1 Tướng (hero12)

```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right).
CHARACTER: [TÊN] — [MÔ TẢ NHẬN DIỆN: tuổi, vóc dáng, tỉ lệ đầu/thân].
SIGNATURE SHAPE: [MẢNG HÌNH ĐẶC TRƯNG LỚN, nhận ra từ bóng đen].
COLORS: main [MÀU CHÍNH #mã], second [MÀU PHỤ], accent [ĐIỂM NHẤN] (element [METAL|WOOD|WATER|FIRE|EARTH]). [common hero: simple clothes, few details | epic hero: richer costume with a purple-silver trim and a small aura | legendary hero: most ornate, gold trim, small crown or halo].
FACE: [NÉT MẶT RIÊNG]. OUTFIT: [TRANG PHỤC]. WEAPON: [VŨ KHÍ].
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline 8% above the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] [DÁNG ĐỨNG] [2] same pose, breathing in: chest and shoulders slightly up [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered.
ROW 2 — [melee attack | attack (shooting / casting forward)]: [5] prepare: weight back, weapon pulled back [6] swing: body twisting forward, weapon moving with ONE short pale motion swoosh [7] hit: full extension, weapon at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: [HIỆU ỨNG CHIÊU] (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells; nothing touches or crosses a cell border.
STYLE: cute stylized chibi mobile-game character, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes, about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked. Recognizable from its black silhouette alone at 40 px.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell.
```

### 6.2 Quái (enemy6) / quái bay / boss (boss9)

```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: [TÊN]: [MÔ TẢ: con gì, màu gì, đặc điểm, vũ khí]. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline 8% above the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back [6] attack: lunging forward with the [bite / claw / weapon].
ANIMATION RULES: same character identical in every cell, consistent size, smooth motion between consecutive frames, clear gaps between cells; nothing touches or crosses a cell border.
STYLE: cute chibi, thick clean dark-brown outline #2A1608, flat cel shading, Dong Son bronze-drum motifs, about 20-30 flat colors, no gradients, no texture.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell.
```

- **Quái bay**: thay câu "feet on the same baseline…" bằng `flying at the same height in every cell`, và CELLS bằng `[1] flying, wings fully up [2] wings half down [3] wings fully down [4] wings half up (a smooth 4-frame flap loop) [5] attack wind-up: pulling back, eyes narrowed [6] diving attack: lunging forward`.
- **Boss**: đổi dòng đầu thành `a 768x768 boss animation sprite sheet … an invisible 3x3 grid of nine equal 256x256 cells`, "Big, menacing but still cute chibi boss", body ~85%, và CELLS: `[1] walk: front foot forward [2] walk: passing, body higher [3] walk: back foot forward [4] walk: passing, body higher [5] attack wind-up: weapon raised high [6] attack swing: weapon coming down with ONE short pale swoosh [7] attack impact: weapon low, small dust burst [8] rage: body glowing red-orange, roaring, arms wide [9] rage: same, stronger glow, head thrown back`.

### 6.3 Ví dụ điền sẵn — Tướng: Lạc Tướng (`lactuong`, Thường, Kim)

```
Create ONE image: a 768x576 animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 4x3 grid of twelve equal 192x192 cells (4 columns, 3 rows, each ROW is one action read left to right).
CHARACTER: Lạc Tướng — adult man about 30, stocky and broad-chested, short legs, head about 1/4 of the height.
SIGNATURE SHAPE: a HUGE fan-shaped headdress of tall white Lac-bird feathers, as tall as his torso, standing straight up.
COLORS: main polished bronze gold #C9963A, second dark patina teal #2F6B5E, accent white feathers (element METAL). common hero: simple clothes, few details.
FACE: thick straight eyebrows, square jaw, three short tattoo lines on each cheek, confident smirk. OUTFIT: bronze chest plate with zigzag bands, teal loincloth with a bronze-drum sun-star buckle. WEAPON: Dong Son boot-shaped bronze axe (riu xeo) with a curved asymmetric blade.
CELLS (facing RIGHT in 3/4 view; in every full-body cell the feet stand on the same invisible baseline 8% above the bottom of the cell, same scale, the body fills about 85% of the cell height):
ROW 1 — idle loop: [1] axe resting on the shoulder, chin up, proud wide stance [2] same pose, breathing in: chest and shoulders slightly up [3] same pose, small settle: knees slightly bent, cloth swinging the other way [4] portrait: head and shoulders, big and centered.
ROW 2 — melee attack: [5] prepare: weight back, axe pulled back [6] swing: body twisting forward, axe moving with ONE short pale motion swoosh [7] hit: full extension, axe at the end of the swing [8] recover: returning toward the idle pose.
ROW 3 — skill and reaction: [9] skill start: gathering power, small glow around the hands [10] skill peak: a wide golden arc of the axe with Lac-bird shapes (small, inside the cell) [11] skill end: effect fading, body relaxing [12] hurt: flinching backward, eyes squeezed shut, one arm raised to guard (no blood).
ANIMATION RULES: same character identical in every cell, consistent size and outfit, feet on the same baseline, smooth motion between consecutive frames, clear gaps between cells; nothing touches or crosses a cell border.
STYLE: cute stylized chibi mobile-game character, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds) on the clothes, about 20-30 flat colors, no gradients, no texture, no glow except the small effect asked. Recognizable from its black silhouette alone at 40 px.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell.
```

### 6.4 Ví dụ điền sẵn — Quái: Tôm Binh (`tom`, quái thường)

```
Create ONE image: a 576x384 enemy animation sprite sheet for a cute mobile tower-defense game based on Vietnamese folk legends, an invisible 3x2 grid of six equal 192x192 cells, read left to right, top to bottom.
CREATURE: Tôm Binh: orange river-shrimp soldier walking on small legs, tiny bronze helmet, round bronze shield with a star, short spear. Cute-but-mischievous chibi monster facing RIGHT, the body fills about 80% of the cell height, feet on the same invisible baseline 8% above the bottom of every cell.
CELLS: [1] walk: right foot forward [2] walk: passing, body slightly higher [3] walk: left foot forward [4] walk: passing, body slightly higher (a smooth 4-frame walk loop) [5] attack wind-up: rearing back, spear pulled back [6] attack: lunging forward with the spear.
ANIMATION RULES: same character identical in every cell, consistent size, smooth motion between consecutive frames, clear gaps between cells; nothing touches or crosses a cell border.
STYLE: cute chibi, thick clean dark-brown outline #2A1608, flat cel shading, Dong Son bronze-drum motifs, about 20-30 flat colors, no gradients, no texture.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell.
```

---

## 7. Hướng dẫn theo loại công cụ

### 7.1 Công cụ tạo ảnh ra cả lưới một lần (Gemini, ChatGPT, Ideogram, Leonardo…)
1. Dán prompt (mục 6 hoặc cột `prompt` trong CSV).
2. Đính kèm **2 ảnh**: ảnh nhân vật hiện có (`assets/packs/<mã>/idle.png`) làm mẫu nhân vật + ảnh lưới `docs/mau-luoi/<kiểu>.png` làm mẫu bố cục. Thêm câu: *"Use the first image as the exact character reference. The second image is only a layout guide — do NOT draw its numbers, lines or labels."*
3. Chọn tỉ lệ khung gần nhất: tướng 4:3, quái 3:2, boss 1:1.
4. Sai bố cục → gõ: *"Regenerate: exactly [12 / 6 / 9] equal square cells in a [4x3 / 3x2 / 3x3] grid, one pose per cell, same character, feet on the same baseline, flat #FF00FF background, no text."*

**Midjourney**: viết prompt gọn hơn (bỏ phần BACKGROUND dài, giữ "flat magenta #FF00FF background, sprite sheet, 4x3 grid"), thêm `--ar 4:3` (tướng) / `--ar 3:2` (quái) / `--ar 1:1` (boss), `--no text, letters, numbers, grid lines, shadow`, dùng `--cref <link ảnh nhân vật>` để giữ nhân vật. Midjourney hay lệch lưới — nếu vậy dùng cách 7.2.

### 7.2 Công cụ chỉ ra một nhân vật / một dáng mỗi lần
1. Tạo từng dáng **riêng một ảnh** (vẫn nền #FF00FF hoặc nền trong suốt / một màu phẳng), cùng ảnh mẫu nhân vật, mô tả đúng ô cần vẽ ("frame 6: swing, …"). Giữ nguyên seed / ảnh tham chiếu để nhân vật không đổi.
2. Đặt tên theo thứ tự ô: `01.png … 12.png` (tướng), `01 … 06` (quái), `01 … 09` (boss) — **ô 4 của tướng là chân dung**.
3. Ghép: `python3 tools/ghep-luoi.py hero12 lactuong.png thu-muc-khung/` — công cụ tự xoá nền, đưa mọi khung về **cùng một tỉ lệ**, đặt tâm chân giữa ô, chân chạm đường đáy 92%, nền #FF00FF.
4. Cắt như bình thường: `python3 tools/cat-sheet.py lactuong.png lactuong hero12`.

### 7.3 Công cụ video / animation (Pippit, Runway, Kling, Pika, Luma, Spine, Aseprite…)
1. Tạo **từng động tác thành một clip ngắn riêng**, nhân vật đứng yên tại chỗ (không chạy khỏi khung), **camera cố định**, nền phẳng một màu (tốt nhất #FF00FF hoặc xanh lá phẳng), quay sang phải. Gợi ý độ dài: thở ~0,7 s lặp; đánh ~0,4 s; chiêu ~0,5 s; đi ~0,5 s lặp (xem mục 4).
2. Xuất PNG từng khung (hoặc dùng ffmpeg: `ffmpeg -i clip.mp4 -vf fps=12 khung/%03d.png`), rồi **chọn đúng số khung** cần cho động tác — các khung cách đều nhau, khung cuối nối được về khung đầu với động tác lặp.
3. Xếp các khung đã chọn theo thứ tự ô vào một thư mục (`01.png …`), thêm chân dung ở vị trí 04 (tướng), rồi ghép **giữ nguyên vị trí tương đối** để không mất độ nhún:
   `python3 tools/ghep-luoi.py hero12 lactuong.png thu-muc-khung/ --chung-khung`
   (`--chung-khung`: dùng một khung cắt chung cho mọi khung toàn thân — chỉ dùng khi mọi khung xuất từ cùng góc máy, cùng cỡ ảnh.)
4. Cắt bằng `cat-sheet.py` như trên.

### 7.4 Họa sĩ
Vẽ thẳng trên ảnh lưới `docs/mau-luoi/<kiểu>.png` (đúng cỡ pixel), mỗi động tác một layer; khi xuất **ẩn layer lưới / số / vạch**, chỉ giữ nền #FF00FF phẳng. Hoặc giao PNG trong suốt từng khung → ghép bằng `ghep-luoi.py`.

---

## 8. Danh sách kiểm tra trước khi gửi / trước khi cắt

- [ ] Đúng **số ô và cỡ ảnh** (tướng 768×576 / 12 ô · quái 576×384 / 6 ô · boss 768×768 / 9 ô), hoặc đúng tỉ lệ.
- [ ] **Đúng thứ tự ô** theo bảng mục 3 (tướng: ô 4 là chân dung, ô 12 là bị đánh).
- [ ] **Cùng một nhân vật** ở mọi ô: mặt, trang phục, màu, vũ khí, tỉ lệ y hệt.
- [ ] Nhân vật quay **sang phải**; chân ở **cùng đường đáy**, tâm chân giữa ô.
- [ ] **Không phần nào chạm mép ô** hoặc lấn sang ô bên; còn khe nền giữa các nhân vật.
- [ ] Nền **#FF00FF phẳng đều** ở mọi ô (không ô nào nhạt / trắng / caro); không màu hồng tím trên nhân vật.
- [ ] **Không** chữ, số, nhãn, đường kẻ, khung, bóng đổ dưới chân, mặt đất, watermark.
- [ ] Viền nâu sẫm, màu phẳng, ít màu; đúng màu hệ / thẻ nhận diện; đúng bậc (Thường / Tím / Vàng).
- [ ] Động tác lặp khép kín (thở qua lại, đi 4→1); khung "trúng đòn" rõ ràng; hiệu ứng chiêu nằm gọn trong ô.
- [ ] Tên file = mã (`lactuong.png`), định dạng PNG.

Sai một mục: gen lại ô / tấm đó (với 7.2 và 7.3 chỉ cần làm lại khung hỏng rồi ghép lại).
