# CÂN BẰNG Ụ VÀNG / ĐỎ — SỐ HOÁ (10/11)

Yêu cầu người dùng: kiểm 33 ụ Vàng + ụ Đỏ, **mỗi ụ đặt trong bộ phù hợp nhất**, xem ụ/bộ nào yếu hay mạnh lệch so với các ụ **cùng bậc** — bằng số đo, không chơi mô phỏng dài.
**Chỉ đề xuất — chưa sửa số gameplay nào.** Công cụ: `tools/thap-can-bang-so.js` (đo) · `tools/thap-can-bang-bieudo.py` (bảng + biểu đồ) · số thô: `tocban/can-bang-a.json`, `can-bang-b.json`, `can-bang-de-xuat.json`, `can-bang-kiem-cheo.json`.

## 1. Nguyên tắc cân bằng (người dùng chốt)
1. **Chỉ so trong cùng bậc.** Đỏ hơn Vàng là bình thường (bảng dưới: trung vị Đỏ Tấn công 3.71 ≈ 2.4× trung vị Vàng Tấn công 1.52).
2. **Cơ chế KHÓ được mạnh hơn.** Khó = cần điều kiện, xếp chỗ, ghép có chủ đích, tích luỹ lâu, bấm kích hoạt đúng lúc.
3. **Cơ chế DỄ (bắn thẳng, không điều kiện) mà sát thương/tốc bắn cao hơn ụ khó cùng bậc là vô lý.**

Mức nên có theo độ khó (so với trung vị nhóm cùng bậc, dung sai phép đo ±15%):

| Độ khó | Nghĩa | Mức nên có |
|---|---|---|
| 1 — dễ | bắn thẳng / đặt là xong / tự chạy | 0.90–1.00× trung vị |
| 2 — vừa | cần điều kiện vừa phải (ụ đi kèm, ghép cùng loại, giữ mana, bấm kích hoạt) | 1.00–1.15× |
| 3 — khó | xếp chỗ, ghép có chủ đích, tích luỹ lâu và dễ mất | 1.15–1.35× |

## 2. Cách đo
- **Game thật, không giao diện:** nạp code `thap/js` bằng `vm` (như `tools/thap-sim-vaitro.js`; nhanh hơn Playwright ~50×, cùng hàm `capNhat`, `dmgU`, `tocU`, `trung`), bước 1/30 s, RNG có hạt. Mỗi điểm: 6 s làm nóng + 60 s đo, trung bình 3 hạt (bộ Tấn công) / 8 hạt (bộ trên bàn tham chiếu).
- **Gán thẳng trạng thái bàn 15 ô** (không chơi từ wave 1). 3 kịch bản, mọi bộ như nhau: **w20** — mọi ô 3★, power-up +1, mana giữ 200 · **w40** — 5★, power-up +3, mana 400 · **w60** — 7★, power-up MAX, mana 600. Cấp thẻ = cấp đầu bậc (Vàng LV9, Đỏ LV11). Ụ có chủ động tự dùng khi nạp đầy (theo `aiNen`).
- **Bộ phù hợp nhất** (≤ 5 loại, ≤ 1 Đỏ): ụ Tấn công = 12 ụ chính + Sync Cannon (ô 2) + Star Breaker (ô 6) + Sanctum (ô 8), trừ khi cơ chế cần bộ khác (xem bảng mục 6). Ụ Hỗ trợ/Đặc biệt = đặt 2 ụ (ô 6, 8) vào bàn 15 ụ tham chiếu R = **Eclipse** (Vàng Tấn công bắn thẳng, sát trung vị).
- **Dòng quái chuẩn** (cùng hạt): 1 **Trùm thật** của wave đó luôn có mặt (máu thật, không tung chiêu; chết → trùm mới) + quái thường của wave (2 con/giây, tối đa 10). Quái tới cuối đường quay lại đầu → đo sát thương thuần. Hai bài: **A** quái thường máu ×4 (đám đông trâu) · **B** máu ×1 (quái thật, sát thương dồn vào trùm). Điểm mỗi kịch bản = trung bình nhân A và B (số nhỏ trong bảng: A·B).
- **Trạng thái tích luỹ** (lửa, stack, Máu, VỰC SÂU, điểm quả, phán quyết, mana giữ…) đặt sẵn theo wave và giữ nguyên lúc đo — xem cột giả định mục 6.
- **Điểm E** = "mỗi ô của bộ đáng bao nhiêu ụ Vàng tham chiếu". Bộ Tấn công: E = DPS cả bàn / DPS bàn 15 R. Ụ trên bàn R: E = (DPS bàn có X − DPS bàn bỏ trống ô đó) / (DPS bàn R − DPS bàn bỏ trống ô đó) → 1 = đáng bằng 1 ụ R, 0 = như ô trống. **Điểm tổng** = trung bình nhân 3 kịch bản.
- DPS bàn 15 R (bài A): 11405 / 65206 / 235033 ST/giây ở w20 / w40 / w60.

## 3. Tự kiểm chéo (công thức tay so với số đo)
1 ụ ở ô 2, chỉ bắn Trùm, 90 s. Tay = `dmgU × tocU × (1 + crit × (1 + cdmg))` × 4/3.12 nếu có mốc 5★ DOUBLE TAP. Lệch lớn nhất 3.3% (< 10%) → phép đo khớp công thức.

| Ụ | Kịch bản | dmgU | tocU | crit | +ST chí mạng | Double Tap | Tính tay | Đo | Lệch |
|---|---|---|---|---|---|---|---|---|---|
| `luutru` | w20 | 156 | 2.82 | 0.1 | 0 | — | 484 | 478 | -1.1% |
| `luutru` | w40 | 556.9 | 3.24 | 0.1 | 0 | có | 2545 | 2525 | -0.8% |
| `luutru` | w60 | 1639.3 | 3.66 | 0.2 | 0 | có | 9231 | 9126 | -1.1% |
| `hopca` | w20 | 156 | 2.82 | 0.1 | 0 | — | 484 | 489 | +1.0% |
| `hopca` | w40 | 556.9 | 3.24 | 0.1 | 0 | có | 2545 | 2500 | -1.8% |
| `hopca` | w60 | 1639.3 | 4.16 | 0.2 | 0 | có | 10492 | 10437 | -0.5% |
| `mauhut` | w20 | 143 | 1.833 | 0.1 | 0 | — | 288 | 288 | -0.3% |
| `mauhut` | w40 | 510.5 | 2.106 | 0.1 | 0 | có | 1516 | 1509 | -0.5% |
| `mauhut` | w60 | 1502.7 | 2.379 | 0.2 | 0 | có | 5500 | 5510 | +0.2% |
| `lualien` | w20 | 241.8 | 2.709 | 0.112 | 0.12 | — | 737 | 713 | -3.3% |
| `lualien` | w40 | 974.6 | 3.193 | 0.12 | 0.2 | có | 4564 | 4418 | -3.2% |
| `lualien` | w60 | 3196.7 | 3.67 | 0.228 | 0.28 | có | 19431 | 18832 | -3.1% |
| `cobac` | w20 | 689 | 1.621 | 0.25 | 0 | — | 1397 | 1355 | -3.0% |
| `cobac` | w40 | 1447 | 1.863 | 0.25 | 0 | có | 4320 | 4357 | +0.9% |
| `cobac` | w60 | 2823.1 | 2.104 | 0.35 | 0 | có | 10283 | 10289 | +0.1% |

## 4. Bảng xếp hạng (riêng từng bậc, từng nhóm vai)
Biểu đồ: `tocban/can_bang_vang_do.png` (bản xem nhanh: `/home/claude/xem/can_bang_vang_do.png`; màu theo độ khó, vạch = trung vị Tấn công).

### Đỏ — Tấn công: 7 ụ · trung vị **3.71**

| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Wyrm Engine (`ronglua`) | 2 | 3.85 <sub>4.1·3.6</sub> | 5.77 <sub>6.3·5.3</sub> | 5.84 <sub>6.8·5.0</sub> | **5.06** | 1.36 | 1.00–1.15 | **vượt mức** |
| 2 | Lucky Slot (`cobac`) | 1 | 4.43 <sub>4.7·4.2</sub> | 4.74 <sub>5.4·4.2</sub> | 4.70 <sub>5.5·4.0</sub> | **4.62** | 1.24 | 0.90–1.00 | **MẠNH LỆCH** (dễ mà mạnh) |
| 3 | Black Hole (`blackhole`) | 2 | 3.58 <sub>6.5·2.0</sub> | 4.40 <sub>6.0·3.2</sub> | 4.18 <sub>6.5·2.7</sub> | **4.04** | 1.09 | 1.00–1.15 | số đo KHÔNG ỔN ĐỊNH (bài A/B lệch ×3.3) — chưa kết luận |
| 4 | Arcane Cascade (`thacmana`) | 2 | 2.74 <sub>3.2·2.4</sub> | 4.05 <sub>4.9·3.4</sub> | 4.62 <sub>5.9·3.6</sub> | **3.71** | 1.00 | 1.00–1.15 | đúng mức |
| 5 | Hive Queen (`chuato`) | 1 | 2.48 <sub>2.4·2.6</sub> | 3.78 <sub>3.9·3.7</sub> | 3.12 <sub>3.5·2.8</sub> | **3.08** | 0.83 | 0.90–1.00 | đúng mức |
| 6 | Overlord (`overlord`) | 1 | 1.88 <sub>2.3·1.5</sub> | 3.14 <sub>3.8·2.6</sub> | 3.84 <sub>4.8·3.1</sub> | **2.83** | 0.76 | 0.90–1.00 | **yếu** |
| 7 | Leviathan (`leviathan`) | 3 | 1.95 <sub>2.0·1.9</sub> | 3.21 <sub>3.3·3.1</sub> | 3.30 <sub>3.6·3.0</sub> | **2.74** | 0.74 | 1.15–1.35 | **YẾU LỆCH** (khó mà yếu) |

### Đỏ — Hỗ trợ: 1 ụ · trung vị **3.71** (ít ụ → so với trung vị Tấn công cùng bậc, chỉ tham khảo)

| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Cryo Reactor (`lophanung`) | 2 | 1.37 <sub>1.3·1.4</sub> | 2.18 <sub>2.1·2.2</sub> | 3.70 <sub>4.0·3.4</sub> | **2.23** | 0.60 | 1.00–1.15 | **yếu** |

### Đỏ — Đặc biệt (quy đổi): 1 ụ · trung vị **3.71** (ít ụ → so với trung vị Tấn công cùng bậc, chỉ tham khảo)

| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Genesis Core (`khoisinh`) | 2 | 0.77 <sub>0.7·0.9</sub> | 2.40 <sub>1.9·3.0</sub> | 2.73 <sub>2.2·3.3</sub> | **1.72** | 0.46 | 1.00–1.15 | **yếu** |

**Không xếp hạng (Đỏ)** — phép đo không phản ánh giá trị chính:

| Ụ | Vai | Khó | Phần đo được (w20 / w40 / w60) | Vì sao |
|---|---|---|---|---|
| Holy Halo (`haoquang`) | Đặc biệt | 2 | — | KHÔNG ĐO: không bắn; giá trị là bất tử ngắn (phòng thủ) |
| Chrono Throne (`ngaithoigian`) | Đặc biệt | 2 | 0.88 / 0.55 / 0.47 | KHÔNG ĐO HẾT: chậm toàn đường + tua ngược (khống chế) |

### Vàng — Tấn công: 15 ụ · trung vị **1.52**

| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Compass Cannon (`canon`) | 3 | 1.56 <sub>1.9·1.3</sub> | 4.29 <sub>5.2·3.6</sub> | 7.77 <sub>9.0·6.7</sub> | **3.73** | 2.46 | 1.15–1.35 | trên mức (cơ chế khó — chấp nhận, theo dõi) |
| 2 | Ember Relay (`lualien`) | 3 | 1.94 <sub>2.0·1.8</sub> | 3.61 <sub>3.9·3.3</sub> | 6.20 <sub>6.5·5.9</sub> | **3.51** | 2.31 | 1.15–1.35 | trên mức (cơ chế khó — chấp nhận, theo dõi) |
| 3 | Salvo Battery (`railgun`) | 3 | 2.91 <sub>3.4·2.5</sub> | 3.24 <sub>3.8·2.8</sub> | 2.70 <sub>3.2·2.3</sub> | **2.94** | 1.94 | 1.15–1.35 | trên mức (cơ chế khó — chấp nhận, theo dõi) |
| 4 | Werewolf (`soi`) | 1 | 1.65 <sub>2.0·1.4</sub> | 2.43 <sub>2.8·2.1</sub> | 2.38 <sub>2.8·2.0</sub> | **2.12** | 1.40 | 0.90–1.00 | **MẠNH LỆCH** (dễ mà mạnh) |
| 5 | Quantum Choir (`hopca`) | 3 | 1.88 <sub>1.9·1.8</sub> | 1.78 <sub>1.9·1.7</sub> | 2.24 <sub>2.4·2.1</sub> | **1.96** | 1.29 | 1.15–1.35 | đúng mức |
| 6 | Prism Thief (`bienmau`) | 3 | 0.94 <sub>1.1·0.8</sub> | 1.76 <sub>2.1·1.5</sub> | 2.98 <sub>3.5·2.5</sub> | **1.70** | 1.12 | 1.15–1.35 | đúng mức |
| 7 | Blood Circuit (`mauhut`) | 3 | 0.49 <sub>0.5·0.5</sub> | 1.25 <sub>1.3·1.2</sub> | 6.53 <sub>7.1·6.0</sub> | **1.59** | 1.04 | 1.15–1.35 | đúng mức |
| 8 | Nemesis (`nemesis`) | 2 | 0.68 <sub>0.6·0.8</sub> | 1.82 <sub>1.7·1.9</sub> | 2.82 <sub>2.9·2.7</sub> | **1.52** | 1.00 | 1.00–1.15 | đúng mức |
| 9 | Eclipse (`nhatthuc`) | 1 | 1.14 <sub>1.2·1.1</sub> | 1.59 <sub>1.6·1.6</sub> | 1.78 <sub>1.9·1.7</sub> | **1.48** | 0.97 | 0.90–1.00 | đúng mức |
| 10 | Wall Projector (`wallgen`) | 2 | 1.13 <sub>1.2·1.1</sub> | 1.14 <sub>1.5·0.9</sub> | 1.37 <sub>1.7·1.1</sub> | **1.21** | 0.80 | 1.00–1.15 | **yếu** |
| 11 | Star Cannon (`ngoisao`) | 3 | 1.17 <sub>1.3·1.0</sub> | 1.00 <sub>1.1·0.9</sub> | 1.32 <sub>1.5·1.2</sub> | **1.16** | 0.76 | 1.15–1.35 | **YẾU LỆCH** (khó mà yếu) |
| 12 | Purifier (`aten`) | 2 | 0.93 <sub>0.8·1.0</sub> | 1.04 <sub>1.0·1.1</sub> | 1.07 <sub>1.2·1.0</sub> | **1.01** | 0.67 | 1.00–1.15 | **yếu** |
| 13 | Hydra (`hydra`) | 2 | 0.59 <sub>0.6·0.6</sub> | 1.05 <sub>1.1·1.0</sub> | 0.80 <sub>0.8·0.8</sub> | **0.79** | 0.52 | 1.00–1.15 | **yếu** |
| 14 | Fusion Archive (`luutru`) | 2 | 0.59 <sub>0.6·0.6</sub> | 0.76 <sub>0.8·0.7</sub> | 0.94 <sub>1.0·0.8</sub> | **0.75** | 0.49 | 1.00–1.15 | **yếu** |
| 15 | Nine-Tail (`cuuvi`) | 2 | 0.35 <sub>0.3·0.4</sub> | 0.33 <sub>0.3·0.4</sub> | 0.28 <sub>0.3·0.3</sub> | **0.32** | 0.21 | 1.00–1.15 | **yếu** |

### Vàng — Hỗ trợ: 5 ụ · trung vị **2.28**

| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Sanctum (`thanhdia`) | 1 | 1.11 <sub>1.1·1.1</sub> | 3.61 <sub>2.8·4.6</sub> | 4.02 <sub>4.6·3.5</sub> | **2.53** | 1.11 | 0.90–1.00 | đúng mức |
| 2 | Rainbow (`cauvong`) | 1 | 1.36 <sub>1.3·1.4</sub> | 2.99 <sub>2.6·3.5</sub> | 3.57 <sub>3.8·3.4</sub> | **2.44** | 1.07 | 0.90–1.00 | đúng mức |
| 3 | Resonance Grid (`luoicheo`) | 2 | 1.22 <sub>1.1·1.3</sub> | 2.67 <sub>2.3·3.2</sub> | 3.64 <sub>4.2·3.2</sub> | **2.28** | 1.00 | 1.00–1.15 | đúng mức |
| 4 | Sync Cannon (`dongbo`) | 2 | 0.93 <sub>0.9·0.9</sub> | 1.51 <sub>1.5·1.5</sub> | 3.71 <sub>3.5·3.9</sub> | **1.73** | 0.76 | 1.00–1.15 | **yếu** |
| 5 | Star Breaker (`hasao`) | 1 | 1.13 <sub>1.2·1.1</sub> | 1.80 <sub>1.6·2.0</sub> | 2.36 <sub>2.7·2.1</sub> | **1.69** | 0.74 | 0.90–1.00 | **yếu** |

### Vàng — Đặc biệt (quy đổi): 5 ụ · trung vị **1.52** (ít ụ → so với trung vị Tấn công cùng bậc, chỉ tham khảo)

| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Marionette (`marionette`) | 1 | 1.04 <sub>1.2·0.9</sub> | 2.35 <sub>4.1·1.3</sub> | 2.54 <sub>5.9·1.1</sub> | **1.84** | 1.21 | 0.90–1.00 | số đo KHÔNG ỔN ĐỊNH (bài A/B lệch ×5.4) — chưa kết luận |
| 2 | Orbital (`orbital`) | 3 | 1.45 <sub>2.5·0.8</sub> | 1.24 <sub>1.2·1.3</sub> | 0.47 <sub>0.5·0.5</sub> | **0.94** | 0.62 | 1.15–1.35 | số đo KHÔNG ỔN ĐỊNH (bài A/B lệch ×2.9) — chưa kết luận |
| 3 | Copycat (`saochep`) | 2 | 0.76 <sub>0.6·0.9</sub> | 0.68 <sub>0.7·0.7</sub> | 0.76 <sub>0.8·0.7</sub> | **0.73** | 0.48 | 1.00–1.15 | **yếu** |
| 4 | Hero Foundry (`xuonganh`) | 3 | 0.39 <sub>0.3·0.6</sub> | 0.16 <sub>0.3·0.1</sub> | 0.26 <sub>0.3·0.2</sub> | **0.25** | 0.17 | 1.15–1.35 | số đo KHÔNG ỔN ĐỊNH (bài A/B lệch ×3.0) — chưa kết luận |
| 5 | Twin Anvil (`loren`) | 3 | 0.11 <sub>0.1·0.2</sub> | 0.30 <sub>0.3·0.4</sub> | 0.36 <sub>0.4·0.3</sub> | **0.23** | 0.15 | 1.15–1.35 | **YẾU LỆCH** (khó mà yếu) |

**Không xếp hạng (Vàng)** — phép đo không phản ánh giá trị chính:

| Ụ | Vai | Khó | Phần đo được (w20 / w40 / w60) | Vì sao |
|---|---|---|---|---|
| Merge King (`vughep`) | Đặc biệt | 2 | 0.31 / 0.06 / 0.13 | KHÔNG ĐO HẾT: giá trị là +1★ giữ loại (kinh tế ghép) |
| Twin Maker (`sinhdoi`) | Đặc biệt | 2 | 0.25 / 0.17 / 0.14 | KHÔNG ĐO HẾT: giá trị là ụ tặng thêm (kinh tế ghép) |
| Evolver (`tienhoa`) | Đặc biệt | 1 | — | KHÔNG ĐO: không bắn; giá trị là ụ +1★ sau 10 s + 2 s/★ (tạo ụ) |
| Pandora Vault (`pandora`) | Đặc biệt | 2 | 0.14 / 0.05 / 0.08 | KHÔNG ĐO HẾT: 6 hiệu ứng khi ghép |
| Mirror Gate (`guongcong`) | Hỗ trợ | 2 | 0.03 / 0.04 / 0.04 | KHÔNG ĐO ĐƯỢC: giá trị là chặn chiêu Trùm / kháng khống chế (bài đo tắt chiêu Trùm) |
| Hex Saboteur (`nguyenrua`) | Đặc biệt | 2 | 0.28 / 0.05 / 0.05 | KHÔNG ĐO HẾT: lời nguyền khi ghép (chậm + nhận thêm ST) và PVP −1★ |
| Wild Link (`tudo`) | Đặc biệt | 1 | 0.26 / 0.03 / 0.14 | KHÔNG ĐO HẾT: giá trị là ghép tự do (kinh tế ghép) |
| Hatchery Gate (`congap`) | Đặc biệt | 1 | — | KHÔNG ĐO: không bắn; giá trị là ụ 1★ miễn phí (tạo ụ) |


## 5. Danh sách LỆCH + đề xuất số (đã đo lại bằng vá thử trong mô phỏng — `SUA=…`, chưa sửa game)
Cột "sau": điểm tổng đo lại với số đề xuất (× trung vị Tấn công cùng bậc hiện tại: Đỏ 3.71, Vàng 1.52). DPS = cả bàn 15 ô, bài A, w20 / w40 / w60.

| Ụ | Khó | Đề xuất | Điểm trước | Điểm sau | DPS bàn trước → sau | Ghi chú |
|---|---|---|---|---|---|---|
| Lucky Slot (`cobac`) | 1 dễ | GIẢM: ST gốc 58 → **38** (−34%) | 4.62 (1.24×) | **3.63 (0.98×)** | 53406 / 351352 / 1282715 → 40938 / 274403 / 1034526 | về đúng trung vị Đỏ; vẫn không cần nâng mana |
| Wyrm Engine (`ronglua`) | 2 | GIẢM NHẸ (tuỳ chọn): ST gốc 8.5 → **7.5** (−12%) | 5.06 (1.36×) | **4.67 (1.26×)** | 46817 / 408866 / 1593400 → 44372 / 385837 / 1518182 | vẫn đứng đầu Đỏ; nếu muốn giữ "ụ biểu tượng" thì để nguyên |
| Leviathan (`leviathan`) | 3 khó | TĂNG: ST gốc 24 → **34**, VỰC SÂU +4% → **+6%**/điểm | 2.74 (0.74×) | **4.21 (1.13×)** | 23340 / 214781 / 850036 → 32212 / 344239 / 1407282 | lên sát cận dưới mức "khó" (1.15×); w20 gần như không đổi (ít điểm) |
| Werewolf (`soi`) | 1 dễ | GIẢM: ST gốc 38.7 → **29** (−25%) | 2.12 (1.40×) | **1.67 (1.10×)** | 22530 / 180497 / 668733 → 17873 / 144872 / 485881 | còn hơi trên mức dễ (đám đông vẫn là thế mạnh) |
| Star Cannon (`ngoisao`) | 3 khó | TĂNG: ST gốc 21 → **40** (+90%) | 1.16 (0.76×) | **1.54 (1.01×)** | 14969 / 71413 / 355542 → 19535 / 104541 / 497735 | mới bằng trung vị; muốn đúng mức "khó" (≥1.15×) cần ≈ 46 hoặc thưởng đúng mốc 50★ +350% → +500% |
| Purifier (`aten`) | 2 | TĂNG: ST gốc 23.4 → **40** (+71%) | 1.01 (0.67×) | **1.55 (1.02×)** | 9586 / 66883 / 277765 → 14314 / 105311 / 436612 | đúng mức |
| Hydra (`hydra`) | 2 | TĂNG: ST gốc 40 → **80** (×2) | 0.79 (0.52×) | **1.40 (0.92×)** | 7062 / 74243 / 195425 → 11833 / 125162 / 361963 | gần trung vị (không nâng mana nên tăng gốc là hợp lý) |
| Fusion Archive (`luutru`) | 2 | TĂNG: ST gốc 24 → **44**, mỗi điểm +2% → **+5%** ST | 0.75 (0.49×) | **1.21 (0.79×)** | 7143 / 53936 / 245573 → 11441 / 87598 / 424044 | vẫn dưới trung vị; nếu cần nữa: thêm mốc 10 điểm +15% → +30% tốc |
| Nine-Tail (`cuuvi`) | 2 | TĂNG: ST gốc 20 → **44**, tốc 1.2 → **1.8**/s, hồ hoả ×(2 + 0.5★) → **×(4 + 1★)** | 0.32 (0.21×) | **1.21 (0.80×)** | 3945 / 20692 / 65411 → 12786 / 71250 / 284568 | vẫn dưới trung vị 20%; ụ yếu nhất bậc — nên làm lại số từ đầu |
| Blood Circuit (`mauhut`) | 3 khó | TĂNG NHẸ (tuỳ chọn): ST gốc 22 → **28** | 1.59 (1.04×) | **1.91 (1.26×)** | 5751 / 82659 / 1664486 → 6929 / 102227 / 1939649 | điểm tổng đã ổn nhờ w60; vấn đề là w20/w40 quá yếu — nên thưởng sớm hơn (mốc 20 Máu +15% → +40%) |

Nhận xét kèm theo (không vá thử):
- **Dễ mà mạnh — rõ nhất:** Lucky Slot (Đỏ, tự quay, không điều khiển, đứng nhì bậc ở cả 3 mốc) và Werewolf (Vàng, bắn thẳng + lan, hơn mọi ụ Vàng "vừa" và ngang Quantum Choir "khó").
- **Khó mà yếu — rõ nhất:** Leviathan (Đỏ khó nhất, thấp nhất nhóm Tấn công, dưới cả Overlord/Hive Queen dễ) · Star Cannon (giữ đúng mốc tổng sao rất khó mà chỉ 0.76×; lệch mốc còn ≈ ½) · Twin Anvil (rủi ro hỏng, mỗi Anvil chỉ đáng 0.1–0.4 ụ) · Hero Foundry (2 ô + ghép đúng ô mà chỉ 0.25).
- **Yếu hẳn dù cơ chế vừa:** Nine-Tail (0.21×, yếu nhất bậc), Fusion Archive (0.49×), Hydra (0.52×), Purifier (0.67×).
- **Khó và đang rất mạnh (chấp nhận theo nguyên tắc, nhưng theo dõi):** Compass Cannon 2.5×, Ember Relay 2.3×, Salvo Battery 1.9× trung vị. Hai ụ đầu phụ thuộc hoàn toàn vào giả định stack (w20 chỉ ≈ 1.0–1.3×, w60 4–5×); Salvo mạnh đều cả 3 mốc chỉ nhờ xếp kín bàn — nếu thấy quá tay: bingo hàng +200% → +150%.
- **Blood Circuit:** w20 0.32× · w40 0.82× · w60 4.3× — quá chậm rồi bùng nổ; nên dời sức mạnh về sớm thay vì tăng tổng.
- **Hỗ trợ Vàng khá đều** (1.7–2.5): Sanctum/Rainbow (dễ) nhỉnh hơn Sync Cannon (cần cùng sao; bàn đồng sao tuyệt đối thì Sync 1.6 / 2.6 / 4.3) và Star Breaker — chênh trong biên nhiễu ±0.25, chưa đề xuất.
- **Cryo Reactor (Đỏ hỗ trợ) 2.23 ≈ hỗ trợ Vàng (trung vị 2.28):** Đỏ mà không hơn Vàng về sát thương; giá trị làm chậm/đóng băng không được đo — cần bài đo khống chế trước khi chỉnh.
- **Overlord (Đỏ, dễ) 0.76×:** sát cận dưới, chấp nhận (ụ dễ nên thấp).
- **Đề xuất ước lượng (chưa đo):** Twin Anvil 3% → 6% ST mỗi cộng dồn (giá trị ×2) · Hero Foundry ô anh hùng 25 s → 45 s và +80% → +120% tốc · Orbital 7★ tự thức 8 s mỗi 20 s (hiện 7★ không ghép được nên gần như không bao giờ thức).

## 6. Bộ test, độ khó và giả định từng ụ


| Bậc | Ụ | Khó | Lý do độ khó | Bộ / cách xếp | Trạng thái tích luỹ giả định | Giới hạn |
|---|---|---|---|---|---|---|
| Đỏ | Holy Halo (`haoquang`) | 2 | bấm đúng lúc để bất tử | — | — | KHÔNG ĐO: không bắn; giá trị là bất tử ngắn (phòng thủ) |
| Đỏ | Genesis Core (`khoisinh`) | 2 | phải xếp ụ chủ lực KỀ 4 phía; hết lượt tự vỡ | bàn R: sau khi Lõi dùng hết lượt, 4 ụ kề +1★ (w60: bàn 6★ → 7★), ô của Lõi trả lại cho R | số ★ tặng = sao của Lõi: 3 / 5 / 7 → chia cho 4 ụ kề (kẹp 7★) | quy đổi: 1 Lõi = 1 ô; so với bàn R cùng sao gốc |
| Đỏ | Chrono Throne (`ngaithoigian`) | 2 | chậm dần toàn đường + TUA NGƯỢC tự kích | bàn R + 2 Ngai | — | KHÔNG ĐO HẾT: chậm toàn đường + tua ngược (khống chế) |
| Đỏ | Cryo Reactor (`lophanung`) | 2 | chỉ +ST lên quái đang CHẬM trong vùng khí lạnh; đóng băng tự kích | bàn R + Cryo Reactor | — | làm chậm/đóng băng không vào DPS |
| Đỏ | Black Hole (`blackhole`) | 2 | hố tự mở, nhưng SỤP ĐỔ KỲ DỊ phải bấm đúng lúc (30 mana) | chuẩn; tự dùng chủ động khi nạp đầy | — | giữ chân quái không vào DPS |
| Đỏ | Hive Queen (`chuato`) | 1 | drone tự sinh, tự xả khi đầy | chuẩn | — | — |
| Đỏ | Lucky Slot (`cobac`) | 1 | quay may rủi tự động, không điều khiển được; không nâng mana | chuẩn; điểm quả chung của bàn | điểm quả mỗi ngăn 13 / 23 / 27 (kỳ vọng theo wave, DO-VANG-DO.md) | — |
| Đỏ | Leviathan (`leviathan`) | 3 | VỰC SÂU tích rất lâu theo từng ụ, ghép là về 0 | chuẩn; 3 Leviathan già giữ điểm | VỰC SÂU: 3 ụ 8 / 80 / 250 điểm, còn lại ¼ (kỳ vọng trận bot, DO-VANG-DO.md) | — |
| Đỏ | Overlord (`overlord`) | 1 | tự nạp rồi bắn sấm vùng, không điều kiện | chuẩn | — | — |
| Đỏ | Wyrm Engine (`ronglua`) | 2 | giữ Nhiệt (nguội 2%/s), ghép cùng hàng/cột để bơm nhiệt | chuẩn; nhiệt tự tích trong bài đo | nhiệt đặt sẵn 60 / 150 / 300 (sàn; tia trúng tự cộng thêm) | — |
| Đỏ | Arcane Cascade (`thacmana`) | 2 | phải GIỮ mana không tiêu (hy sinh triệu hồi/nâng cấp) | chuẩn; giữ mana cao | mana giữ 300 / 800 / 2000 | — |
| Vàng | Hatchery Gate (`congap`) | 1 | tự gọi ụ 1★ mỗi 11 s | — | — | KHÔNG ĐO: không bắn; giá trị là ụ 1★ miễn phí (tạo ụ) |
| Vàng | Twin Anvil (`loren`) | 3 | cộng dồn Anvil có rủi ro hỏng, rồi kéo lên ụ chủ lực | bàn R; 3 ụ R mang buff Anvil ST (Anvil đã dùng, không chiếm ô) | mỗi Anvil cộng dồn = sao × 2 (đã rèn 1 lần): +18% / +30% / +42% ST cho 1 ụ | quy đổi: mỗi Anvil đã dùng tính như 1 ô |
| Vàng | Marionette (`marionette`) | 1 | tự bắt quái theo chu kỳ | bàn R + 2 Rối Máy | — | đi lùi (khống chế) không vào DPS |
| Vàng | Hex Saboteur (`nguyenrua`) | 2 | ghép 2 Kẻ Nguyền mới ra lời nguyền | bàn R + 2 Kẻ Nguyền (chỉ đo phần tự bắn) | — | KHÔNG ĐO HẾT: lời nguyền khi ghép (chậm + nhận thêm ST) và PVP −1★ |
| Vàng | Orbital (`orbital`) | 3 | chỉ đánh khi GHÉP 2 Vệ Tinh (thức 23 s) — phải canh ghép | bàn R + 4 Vệ Tinh; đo lúc THỨC × tỉ lệ thức giả định | tỉ lệ thời gian thức 50% (w20, w40) · 25% (w60, 7★ không ghép được nữa) | — |
| Vàng | Pandora Vault (`pandora`) | 2 | ghép 2 Hộp mới mở, kết quả 1 trong 6 | bàn R + 2 Pandora (chỉ đo phần tự bắn) | — | KHÔNG ĐO HẾT: 6 hiệu ứng khi ghép |
| Vàng | Copycat (`saochep`) | 2 | kéo lên ụ cùng sao để chép (70%) | bàn R; 3 bản sao của R (70% ST) | — | chép ụ R; chép ụ chủ lực thật thì = 70% điểm ụ đó (đặc tính ngẫu nhiên quay lại, stack riêng mất) |
| Vàng | Twin Maker (`sinhdoi`) | 2 | ghép 2 Máy Sinh Đôi để được thêm ụ | bàn R + 2 Sinh Đôi (chỉ đo phần tự bắn) | — | KHÔNG ĐO HẾT: giá trị là ụ tặng thêm (kinh tế ghép) |
| Vàng | Evolver (`tienhoa`) | 1 | tự nở sau thời gian | — | — | KHÔNG ĐO: không bắn; giá trị là ụ +1★ sau 10 s + 2 s/★ (tạo ụ) |
| Vàng | Wild Link (`tudo`) | 1 | ghép với bất kỳ ụ nào | bàn R + 2 Wild Link (chỉ đo phần tự bắn) | — | KHÔNG ĐO HẾT: giá trị là ghép tự do (kinh tế ghép) |
| Vàng | Merge King (`vughep`) | 2 | kéo lên ụ cùng sao (+1★ giữ loại) | bàn R + 2 Vua Ghép (chỉ đo phần tự bắn) | — | KHÔNG ĐO HẾT: giá trị là +1★ giữ loại (kinh tế ghép) |
| Vàng | Hero Foundry (`xuonganh`) | 3 | ghép 2 Xưởng đúng Ô của ụ chủ lực, hiệu lực 25 s | bàn R + 2 Xưởng chờ ghép; ô anh hùng trên 1 ụ R | ô ANH HÙNG bật 50% thời gian (đo bật/tắt rồi trung bình) | — |
| Vàng | Rainbow (`cauvong`) | 1 | tự vẽ vệt lên đường | bàn R + Rainbow | — | — |
| Vàng | Sync Cannon (`dongbo`) | 2 | chỉ buff ụ CÙNG SAO với nó | 14 R cùng sao + 1 Sync Cannon | bàn lẫn sao: 7 ụ R cùng sao với Sync, 6 ụ R thấp hơn 1★ (bàn đồng sao tuyệt đối: xem ghi chú) | — |
| Vàng | Mirror Gate (`guongcong`) | 2 | kháng khống chế + chặn chiêu Trùm theo hồi chiêu | bàn R + Mirror Gate | — | KHÔNG ĐO ĐƯỢC: giá trị là chặn chiêu Trùm / kháng khống chế (bài đo tắt chiêu Trùm) |
| Vàng | Star Breaker (`hasao`) | 1 | buff 4 ô kề, đặt là xong | bàn R + Star Breaker ở ô giữa hàng | — | — |
| Vàng | Resonance Grid (`luoicheo`) | 2 | buff 4 ô CHÉO, đủ 4 ô chéo mới Cộng hưởng | bàn R + Resonance Grid ở ô có đủ 4 ô chéo (hàng giữa) | — | — |
| Vàng | Sanctum (`thanhdia`) | 1 | buff 4 ô kề + khiên, đặt là xong | bàn R + Sanctum | — | khiên/tẩy không vào DPS |
| Vàng | Purifier (`aten`) | 2 | cần ụ gây độc đi kèm (×4 chỉ khi quái trúng độc) | 9 Purifier + 3 Toxic Pool (độc) + 3 hỗ trợ | — | — |
| Vàng | Prism Thief (`bienmau`) | 3 | xếp 4 màu khác nhau cạnh nhau rồi vuốt HỢP THỂ, hợp thể tiếp để mạnh | chuẩn; 1–2 Lăng Kính Quang Phổ + Prism màu đơn | hợp thể: 1 ụ n=1 (w20) · n=3 và n=1 (w40) · n=6 và n=3 (w60); stack màu ở trần | — |
| Vàng | Compass Cannon (`canon`) | 3 | gộp đủ 4 hướng NSWE rồi NSWE + NSWE mới có stack | chuẩn; 2 Pháo NSWE dồn stack, phần còn lại đang gộp hướng | w20: 1 ụ NSWE stack 1 + 3 ụ NSWE stack 0 + 8 ụ 2 hướng · w40: 2 ụ NSWE stack 3 + 10 ụ NSWE stack 0 · w60: 2 ụ stack 6 + 10 ụ NSWE stack 1 (bot dồn đo được stack lớn nhất 1 ở w20, 3 ở w30) | — |
| Vàng | Nine-Tail (`cuuvi`) | 2 | phải GIẾT để mọc đuôi (9 đuôi mới xả) | chuẩn; đuôi tích tự nhiên theo số quái bị giết trong bài đo | — | — |
| Vàng | Quantum Choir (`hopca`) | 3 | HOÀ ÂM: ụ kề 4 phía phải CÙNG SAO | chuẩn, mọi ô cùng sao → ô trong 4 Hoà âm, ô biên 3, góc 2 | — | — |
| Vàng | Hydra (`hydra`) | 2 | không nâng mana; cuồng nộ tốn mana gấp đôi mỗi lần, phải để dành | chuẩn; tự kích khi đủ mana (mana giữ 200/400/600) | — | — |
| Vàng | Ember Relay (`lualien`) | 3 | truyền lửa theo HÀNG/CỘT khi ghép/bán — phải xếp và ghép có chủ đích | chuẩn; lửa dồn vào 2–4 ụ | lửa: 2 ụ 45 + còn lại 10 (w20) · 2 ụ 90 + 25 (w40) · 3 ụ 90 + 40 (w60); trần LV9 = 90 | — |
| Vàng | Fusion Archive (`luutru`) | 2 | điểm tích thụ động theo số lần ghép (lâu), dồn điểm khi ghép Archive | chuẩn; điểm Archive theo số lần ghép | điểm: 2 ụ 10 + còn lại 3 (w20) · 2 ụ 30 + 10 (w40) · 3 ụ 40 + 20 (w60); trần LV9 = 40 | — |
| Vàng | Blood Circuit (`mauhut`) | 3 | đánh dấu và HY SINH ụ của mình để lấy Máu | chuẩn; 2 ụ nuôi Máu | Máu: 2 ụ 20 + còn lại 0 (w20) · 2 ụ 80 + 5 (w40) · 2 ụ 200 + 15 (w60) — 200 Máu = đã nuốt 40★ | — |
| Vàng | Nemesis (`nemesis`) | 2 | tích PHÁN QUYẾT vĩnh viễn theo từng ụ, mất khi ghép | chuẩn; đòn % máu tối đa hợp trùm | phán quyết: tốc +20/40/60%, ST +12/40/100% (w20/40/60) | đòn % máu tối đa phồng khi Trùm luôn có mặt: điểm = trung bình nhân của (bài chuẩn) và (bài tắt % máu lên Trùm); cả 2 số ghi ở cột ghi chú |
| Vàng | Star Cannon (`ngoisao`) | 3 | phải giữ TỔNG SAO bàn đúng mốc 10/50 (ghép là lệch mốc) | chuẩn, chỉnh sao vài ô để tổng sao ĐÚNG mốc: 50★ (w20) · 80★ (w40) · 100★ (w60) | tổng sao đúng mốc 50 / 80 / 100 | — |
| Vàng | Eclipse (`nhatthuc`) | 1 | bắn thẳng, tự đổi Ngày/Đêm, không điều kiện | chuẩn: 12 Eclipse + 3 hỗ trợ buff ST (Sync/Star Breaker/Sanctum) | — | — |
| Vàng | Salvo Battery (`railgun`) | 3 | BINGO: phải xếp đủ hàng 5 / cột 3 toàn Salvo | kín 15 ô Salvo (3 hàng + 5 cột bingo) hoặc 2 hàng bingo + hàng giữa hỗ trợ | — | — |
| Vàng | Werewolf (`soi`) | 1 | bắn thẳng + lan; bản Thức tỉnh là may rủi lúc sinh (30%), người chơi chỉ lọc dần | chuẩn + 4/6/6 trong 12 Sói là bản Thức tỉnh | thức tỉnh 4/12 (w20, ≈30% tự nhiên) → 6/12 (lọc dần qua ghép) | — |
| Vàng | Wall Projector (`wallgen`) | 2 | tường tự dựng (dễ) nhưng Tường Vàng cần ghép 2 Máy Dựng Tường | chuẩn; giá trị chặn quái không tính | không tính Tường Vàng khi ghép | chặn quái (khống chế) không vào DPS |

## 7. Giới hạn phép đo
- **Giả định tích luỹ quyết định thứ hạng của ụ cộng dồn** (La Bàn, Ember, Mạch Máu, Prism, Leviathan, Lucky Slot, Arcane Cascade, Archive, Nemesis): số stack theo wave là ước lượng (một phần từ trận bot trong `CONG-DON-EMBER-LABAN-PRISM.md`, `DO-VANG-DO.md`), chưa đo trên người chơi thật. Đổi giả định trong `KIT` của công cụ rồi chạy lại (~4 phút).
- **Bàn "mọi ô cùng sao"** có lợi cho Sync Cannon / Quantum Choir; bàn 15 ô 7★ ở w60 giàu hơn thực tế (như nhau cho mọi bộ).
- **Không đo được:** khống chế (chậm, giữ chân, đi lùi, tua ngược, tường chặn), phòng thủ (Holy Halo, Mirror Gate, khiên Sanctum), tạo ụ / kinh tế ghép (Merge King, Twin Maker, Wild Link, Pandora, Evolver, Hatchery Gate, lời nguyền Hex), hiệu ứng PVP. Các ụ này chỉ liệt kê phần tự bắn, không xếp hạng. Genesis Core, Twin Anvil, Copycat, Orbital, Hero Foundry là **quy đổi** (sao tặng, buff vĩnh viễn, bản sao 70% của R, tỉ lệ thức giả định 50/50/25%, ô anh hùng bật 50%).
- **Bài A và B lệch nhau nhiều ở Black Hole (×3) và Marionette (×5)**: sát thương theo máu quái / theo số quái bị giữ → phụ thuộc mật độ và máu quái; chưa kết luận hai ụ này. Bàn 12 Black Hole chỉ 0.7–1.8 (các hố nghiền trùng một đám) — số trong bảng là 2 hố trên bàn Vàng.
- **Trùm luôn có mặt** thổi phồng đòn % máu của Nemesis → điểm Nemesis = trung bình nhân (bài chuẩn, bài tắt % máu lên Trùm).
- Hệ số sửa → điểm **không tuyến tính** (sát thương thừa lên quái nhỏ): Lucky Slot −34% ST gốc chỉ −21% điểm → luôn đo lại sau khi chỉnh.
- Nhiễu: bộ Tấn công ±5%, ụ đặt 2 ô trên bàn R ±0.25 điểm. Roster hiện có **11 ụ Đỏ** (mục 5–6 của `TAI-LIEU-GOC.md` ghi 10).
- Chưa đo ở cấp thẻ tối đa (LV17) và chưa đo PVP/Co-op.
