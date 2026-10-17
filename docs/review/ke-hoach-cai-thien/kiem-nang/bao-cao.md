# Kiếm nặng — combo 3 nhát mới của Cu Tí (17/10) — đã đưa vào game

Ảnh chủ game gen: `docs/anh-goc/kiem-nang/kiem-nang-10k.png` (Cu Tí 10 khung, tay trống) và `vet-kiem-nang-4x6.png` (4 hàng vệt chém).

**Chờ trước:** phiên "Kiếm bớt cứng" đã có mục "## Phần B" lúc 03:09 (chờ ~4 phút, không quá 75 phút) → làm TRÊN nền phần B (đường góc liền `?kiemmuot`, thân nghiêng / nhích, chặn mũi kiếm xuyên đất).

## Tóm tắt (cho chủ game)

- Khi Cu Tí **cầm kiếm** (bộ Ninja), 3 nhát kiếm giờ là combo **kiếm nặng**:
  - **Nhát 1** (khung 1–4): xách kiếm một tay, mũi **lê đất sau lưng** (tia lửa bám mũi kiếm) → hai tay quét sát đất ra trước → **★ chém hất lên** (vệt cong hất lên).
  - **Nhát 2** (khung 5–7): giơ kiếm cao trên đầu bằng hai tay → **★ bổ xuống** → mũi kiếm sát đất trước mặt (vệt bổ dọc + **nổ đất** đúng chỗ mũi chạm).
  - **Nhát 3** (khung 8–10): kéo kiếm ra sau → **★ chém ngang** (vệt ngang dài) → theo đà kiếm vòng qua vai.
- **Cân bằng KHÔNG đổi:** không sửa dòng nào trong `moves.js` / `combat.js`. Mỗi nhát giữ thời lượng cũ (0,3 / 0,3 / 0,46 giây), khung ★ rơi đúng lúc chạm cũ (u = 0,45), vùng trúng, sát thương y nguyên. Chỉ đổi HÌNH.
- Hết nhát mà không bấm tiếp → về thế đứng như hiện nay (giữ khung cuối 0,06 giây rồi mờ chuyển, cơ chế cũ).
- **Cờ tắt: `?kiemnang=0`** → về đúng hàng kiếm + vệt chém trước phiên này. Đã so bằng bot: hình Cu Tí **giống tới từng điểm ảnh** (0 điểm khác, kiếm cấp 1 và cấp 4, cả combo); vệt dùng lại đúng ảnh cũ `hu-chem-kiem`.
- Bộ Rừng / Biển / Lâu đài (chưa có ảnh kiếm nặng) và `?netcu=1` giữ kiếm cũ.
- Dung lượng: bản một tệp **29,83 MB** (< 30 MB); người chơi tải **17,74 MB** (< 20 MB).

## Đã làm

1. **Cắt khung**: `docs/anh-goc/zed/cat-diem-anh.py` → ĐẠT, đúng 10 khung → `docs/anh-goc/zed/moi16/28-kiem-nang-10k-gif/`.
2. **Cỡ người = hàng đứng**: dựng bằng chính `dung_than` của `dung-zed-game.py`, thu nhỏ kiểu nét (`do-net/cong-cu/thu_net.py`, qua `dung_zed_net.py`) + bản to ×1,2 dựng thẳng từ ảnh gốc, **căn bàn chân trước** như kiếm 16/10 (chân trước đứng đúng chỗ chân trước lúc đứng, không trượt khi vào đòn).
   - Khác kiếm 16/10 một chỗ: ảnh kiếm nặng vẽ người **ít "chibi" hơn** (đầu gần bằng, thân + chân dài hơn). Co theo cỡ đầu như lần trước thì người **cao hơn lúc đứng 12 điểm ảnh ô 96 (~19 %)** — vào đòn như lớn phổng lên. Nên co theo **chiều cao người**: các khung thẳng người (1, 2, 3, 8, 9, 10) cao đúng bằng hàng đứng (64 điểm ảnh ô 96). Đầu vì thế nhỏ hơn đầu lúc đứng ~13 % (21,9 so với 25,2) — xem lưới.
   - Công cụ: `docs/anh-goc/zed/dung-kiem-nang.py` (chạy lại được). Thêm **9 hàng vào cuối tấm `zed-moi`** (3 hàng thân + 3 hàng nắm tay cũ + 3 hàng nắm tay mới), **các ô cũ giữ nguyên từng điểm ảnh** (đã so), màu đưa về đúng bảng 64 màu đang có. Tấm 924 → 968 KB.
3. **Neo kiếm hai tay** (`docs/anh-goc/zed/gan-vk/neo-kiem-nang.py` → `neo.json` mục `28-kiem-nang-10k`), theo `cam-vk-chuan/LUAT.md`:
   - tay cầm kiếm = nắm tay phía sau (như mọi hàng kiếm cũ); khung 1–2 **một tay**; khung 3–10 **hai tay**: cán đi qua cả hai nắm tay (khung 8, 9 thấy rõ hai nắm → góc kiếm = đường nối hai nắm; khung khác hai nắm chồng thành một cụm → hai tay đặt trên trục kiếm quanh tâm cụm, như búa nện mới).
   - Góc theo khung người đặc `ve-kiem-nang.py` (đổi dấu: người đặc dương = lên, game dương = xuống). Khung lê / sát đất (1, 2, 3, 7) tính lại cho mũi chạm vạch đất, không xuyên đất:

   | Khung | 1 | 2 | 3 | 4 ★ | 5 | 6 ★ | 7 | 8 | 9 ★ | 10 |
   |---|---|---|---|---|---|---|---|---|---|---|
   | Góc game | 150,8° | 150,4° | 26,1° | −70° | −140° (sau thân) | 15° | 19,7° | 180° | 1,3° | −165° (sau thân) |
   | Cầm | 1 tay | 1 tay | 2 tay | 2 tay | 2 tay | 2 tay | 2 tay | 2 tay | 2 tay | 2 tay |

   - Trong game mũi kiếm lúc lê đất (nhát 1, u ≤ 0,3) và sát đất (nhát 2, u ≥ 0,72) được đặt **đúng trên vạch đất theo độ dài lưỡi từng cấp** (cấp 1 ngắn hơn cấp 4 tới 7 điểm ảnh — không thì mũi cấp 1 lơ lửng). Đo bằng bot: mũi thấp nhất −0,6 điểm ảnh (trên đất) ở mọi nhịp, cấp 1 và cấp 4.
4. **Soát cầm vũ khí** `cam-vk-chuan/soat.py` (đã cho máy đo hiểu hàng `~kn`): **0 lỗi** — kiếm 1: 0/16, kiếm 2: 0/12, kiếm 3: 0/12 (khung × 4 cấp); toàn bộ 27 hàng 0 lỗi.
5. **Game** (`game/js/zed_moi.js`, mục "KIẾM NẶNG"): hàng `kiem_N~kn` thay `kiem_N` (sau hàng ~16). Mốc khung (★ đúng 0,45):
   - nhát 1 `[0; 0,15; 0,3; 0,45]` · nhát 2 `[0; 0,45; 0,72]` · nhát 3 `[0; 0,45; 0,72]`.
   - Đường góc liền của phần B dùng tiếp, thêm: nhát 2, 3 **giữ thế** khung đầu (giơ cao / kéo ra sau) tới 70 % rồi mới vung; nhát 3 vung **qua phía trên** (180° → 0°, đi vòng dưới thì lưỡi cắm đất); nhát 1 vào thẳng thế lê kiếm (không nối góc từ thế đứng — nối thì kiếm vung qua đầu và chỉ còn 1 nhịp lê đất). Thân nghiêng / nhích / nhún của phần B **giảm nhẹ** cho hàng mới (ảnh đã tự có dáng người): ≤ 4°, ≤ 2 điểm ảnh.
6. **Ghép eo chạy + chém** (cắt ở đai, không kéo giãn — cách `chan-di-danh`): đo điểm eo + đai cho 3 hàng (`docs/anh-goc/zed/eo-kiem-nang.py`, chèn vào `zed_eo_data.js`, số cũ không đổi).
   - **Nhát 1, 2: ghép được** (vừa đi / chạy vừa chém: thân trên khung đòn + chân đi / chạy) — `ghep-eo.png`.
   - **Nhát 3: không ghép** — không phải do ảnh: `moves.js` coi nhát kết kiếm là đòn đứng tấn (chạy chậm lại, vẽ toàn thân) như kiếm 3 cũ; đổi phải sửa `moves.js` (cấm). Khung 8–10 vẫn vẽ toàn thân, người trượt theo hướng đi.
7. **Vệt chém** (`docs/anh-goc/kiem-nang/cat-vet-kiem-nang.py` → `game/art/custom/hu-chem-kiem-nang-1..4.sprite.json`, mỗi tệp 6 khung, 5–10 KB): bỏ nền xanh, cắt cùng khung bao mỗi hàng, thu nhỏ kiểu nét, ≤ 48 màu. Gắn ở `game/js/fx.js` (mục "KIẾM NẶNG"), **chỉ cho combo kiếm nặng của Cu Tí**; vũ khí / nhân vật khác giữ vệt cũ:
   - hàng 1 (tia lửa lê đất): **bám mũi kiếm trên mặt đất** suốt khung 1–3, tắt khi kiếm hất lên;
   - hàng 2 (hất lên): đuôi vệt đặt ở mũi kiếm lúc quét sát đất, đầu vệt ở mũi lúc vừa hất xong (xoay + co theo hai điểm), khung to nhất ≈ lúc ★;
   - hàng 3 (bổ xuống + nổ đất): đứng thẳng, đáy ở mặt đất **ngay dưới mũi kiếm khung 7**, nổ đúng lúc mũi chạm đất;
   - hàng 4 (chém ngang): đuôi ở mũi kiếm lúc kéo ra sau, đầu ở mũi lúc chém hết tầm.
   - Game gọi "vệt" lúc CHẠM (u 0,45) nên ảnh được thả theo tiến độ nhát mỗi nhịp (tia lửa có trước lúc chạm). **Nhuộm hệ:** vệt kiếm cũ không nhuộm theo hệ → vệt mới cũng không (hạt hệ văng ra giữ như cũ). Không vẽ hiệu ứng nào bằng code.

## Ảnh soát (thư mục này)

- `luoi-kiem-nang.png` — 10 khung × 4 cấp kiếm, ×3; ★ = khung chạm (khung vàng); vạch xanh = mặt đất; vạch vàng = bàn chân trước lúc đứng. (Lưới vẽ góc neo; trong game mũi cấp 1–2 còn được hạ cho chạm đất ở khung lê / sát đất.)
- `combo-vet-x1.gif`, `combo-vet-x3.gif` — combo 3 nhát có vệt, khung cắt từ màn trận thật (bot), **đúng thời lượng** (50 hình/giây), kiếm cấp 1; `combo-vet-cap4-x3.gif` — kiếm cấp 4 (hệ băng).
- `truoc-sau-x3.gif` — Cu Tí riêng: trái TRƯỚC (kiếm cũ), phải SAU (kiếm nặng); trên cấp 1, dưới cấp 4; đúng thời lượng.
- `ghep-eo.png` — vừa chạy / đi vừa chém (nhát 1, 2 ghép ở đai; nhát 3 toàn thân).
- Dựng lại: `python3 docs/anh-goc/zed/gan-vk/neo-kiem-nang.py` (từ thư mục đó) → `python3 docs/anh-goc/zed/dung-kiem-nang.py` → `python3 docs/anh-goc/zed/eo-kiem-nang.py` → `python3 docs/anh-goc/kiem-nang/cat-vet-kiem-nang.py`; ảnh soát: `quay.py` (bot) rồi `soat.py` (cách chạy ghi đầu tệp).

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp **29,83 MB** / 30; người chơi tải **17,74 MB** / 20 |
| Nạp `dist/linh-khi.html?cloud=0` headless (bot, không chơi tay): mặc định, `?kiemnang=0` | **0 lỗi JS**, 0 lỗi vẽ (`G.zedMoi.loi` rỗng) |
| Bot đi / chạy + chém kiếm (`chan-di-danh/quay.py`) | 0 lỗi |
| `game/tests/smoke.py`, `cam_giac_danh.test.js`, `cam_giac_vk.test.js` | 0 lỗi / đạt 15 / đạt 24 |
| `?kiemnang=0` so bản trước phiên | hình Cu Tí 0 điểm ảnh khác; vệt = `hu-chem-kiem` như cũ |
| `cam-vk-chuan/soat.py` | 0 lỗi (27 hàng × 4 cấp) |

Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Chỗ còn yếu / cần chủ game xem

1. **Khung 1–2 (ảnh gen yếu nhất):** hai nắm tay vẫn **giơ thế thủ trước ngực** (giống thế đứng), không thật sự thả một tay xuống xách kiếm kéo lê. Kiếm gắn vào nắm tay sau ngang hông nên mũi vẫn lê đất được, nhưng dáng chưa "nặng". Nên gen lại riêng 2 khung này (prompt dưới).
2. **Khung 8:** hai nắm tay ở **ngang ngực** chứ không "ngang hông" — kéo kiếm ra sau vẫn đọc được; gen lại nếu muốn rõ hơn (prompt dưới, tuỳ chọn).
3. **Khung 6:** hai tay duỗi thẳng ngang vai (giống đấm) — bổ xuống đọc được nhờ kiếm + vệt, không bắt buộc gen lại.
4. **Người ít chibi hơn hàng đứng** (cả 10 khung): đã co cho bằng chiều cao người đứng, đầu vì thế nhỏ hơn ~13 % lúc chém. Nếu thấy vướng, gen lại cả tấm với tỉ lệ đầu to như hàng đứng (thêm câu "same chibi proportions as the idle sheet: big head ≈ 40% of body height").
5. **Nhát 1, lúc kiếm từ sau lưng quét ra trước:** lưỡi không thể vẽ "ngắn lại" khi đi qua dưới chân → mũi kiếm chuyển từ sau ra trước trong **1 nhịp** (1/60 giây), tia lửa vẫn chạy theo mũi trên mặt đất. Nếu thấy giật: cách duy nhất là gen thêm 1 khung giữa (kiếm dưới chân, nhìn chéo).
6. Vạch đất chỉ đúng khi Tí đứng trên nền phẳng (như mọi hàng).

### Prompt gen lại (tiếng Anh, dán kèm khung người đặc `docs/khung-que-8-huong/nguoi-dac/kiem-nang-e.png` khung 1–2 / 8)

**Khung 1–2 (nên làm):**

> Pixel art sprite, same character as reference (Cu Ti: black spiky hair, red eyes, black ninja gi, red belt, sandals), side view facing right, green #00FF00 background, 2 frames in one row, same size and style as the reference sheet. EMPTY HANDS (no weapon drawn). Pose: holding a very heavy greatsword in the BACK hand only — that arm hangs straight down and slightly behind the hip, fist at hip height, knuckles down as if gripping a hilt; the FRONT arm relaxed, bent slightly forward for balance (not raised in a guard). Knees bent, torso leaning forward a little, as if dragging a heavy blade on the ground behind. Frame 2: same but one small step forward, back arm trailing further behind. Do not change proportions, outline or colors.

**Khung 8 (tuỳ chọn):**

> Same character and style, side view facing right, green #00FF00 background, 1 frame, EMPTY HANDS. Both fists together at the BACK hip (low, at belt height), arms pulled back as if holding a two-handed sword horizontally behind the body ready for a horizontal slash; torso twisted back, front shoulder forward, knees bent in a wide stance. Do not change proportions, outline or colors.

Gen xong: cắt lại bằng `cat-diem-anh.py`, thay khung trong `moi16/28-kiem-nang-10k-gif/kiem/`, sửa điểm đoán nắm tay (`DOAN`) trong `neo-kiem-nang.py`, chạy lại chuỗi dựng ở trên.
