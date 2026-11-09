# Cộng dồn: Ember (Lửa Thập Tự) vs La Bàn vs Prism Thief — đo + đề xuất (09/11)

Người dùng (ảnh iPhone, đợt 53): bàn ~11 Ember, lửa 274 / 275 / 274 / 145 / **797** / 132, 1 đòn **281 881** ST, mana 132k.
*"ember như này có mạnh quá không, la bàn, prism thief có mạnh được như này không … nếu ember mạnh quá thì phải nerf, có trần lửa"*
+ bổ sung 16:24: *"để nó không thua quá sớm thì cũng phải tăng lượng sát thương và tốc đánh lên chút để cân bằng"*.

**Việc này chỉ ĐO + ĐỀ XUẤT — chưa sửa code game.** Tool: `tools/thap-do-cong-don.js` (vá phương án chỉ trong mô phỏng).

## 1. Cách đo

- **Hệ số lý thuyết** (`node tools/thap-do-cong-don.js heso [pa=…]`): × sát thương trung bình/giây so với 0 stack (gồm ST, chí mạng ≤100%, STCM, tốc), 5★, chưa gồm Đột phá.
- **Bot SOLO** (`… song <id> hat=1-5 [pa=…]`, `EP=0.5`): AI game + lớp "người chơi giỏi dồn ụ X": Ember **bơm lửa** (ghép cặp Ember cùng sao ở ô có nhiều Ember cùng hàng/cột nhất), La Bàn gộp hướng → NSWE+NSWE, Prism hợp thể (AI game sẵn); X không làm nguyên liệu ghép thường; nâng thẻ X trước. Bộ = X + `soi, nhatthuc, hasao, cuongno` (đúng bộ "Vàng" của DO-VANG-DO → so thẳng với Đỏ ở đó). `EP=0.5` = mỗi lần triệu hồi 50% ra X (mô phỏng bàn đầy X như ảnh). Cấp thẻ 0, tim thật.
- Ghi theo mốc wave: stack lớn nhất trên bàn, **ST thô cả bàn/giây** (gồm phần thừa — đo "sức mạnh", không bị chặn bởi máu quái), đòn lớn nhất.
- Mẫu nhỏ (máy chủ chung tải 40+): 5–10 trận/nhóm. Số wave TB lệch ±3–4; xu hướng rõ, chữ số lẻ không.

## 2. Hệ số theo số stack (lý thuyết, ×so với 0 stack)

| Ember lửa | 0 | 10 | 30 | 60 | 100 | 150 | 200 | 300 | 500 | 800 |
|---|---|---|---|---|---|---|---|---|---|---|
| **gốc** | 1 | 2.4 | 7.1 | 20.8 | 59.8 | 160.9 | 346 | 878 | 2 396 | **6 077** |
| A (trần 120 + bù) | 1.5 | 3.7 | 10.7 | 31.3 | 89.6 | 137.9 | 137.9 | 137.9 | 137.9 | 137.9 |
| B (giảm dần + bù) | 1.5 | 4.4 | 12.4 | 30.5 | 55.8 | 78.3 | 95.9 | 123.5 | 163.8 | 206.8 |

| La Bàn stack (NSWE) | 0 | 1 | 3 | 7 | 15 | 31 |
|---|---|---|---|---|---|---|
| gốc (×so với 1 hướng 0 stack) | 3.7 | 5.5 | 9.1 | 16.4 | 31 | 60 |
| C (stack 50→120%, tên lửa ×1.3) | 3.7 | 8.0 | 16.8 | 34.3 | 69.4 | 139.5 |

| Prism hợp thể n | 0 | 1 | 2 | 3 | 5 | 10 |
|---|---|---|---|---|---|---|
| gốc | 1 | 4.4 | 8.4 | 13 | 24 | 62 |
| C (HOP_DMG 3→6, HOP_TOC 0.1→0.2) | 1 | 8.4 | 18.2 | 30.4 | 62 | 183 |

```
×ST (log)   1    10   100  1000 10000
Ember 100   |=========|                  60
Ember 300   |==============|            878
Ember 800   |===================|      6077   ← ảnh người dùng (797 lửa)
La Bàn 31   |=======|                    60 (cần ~128 La Bàn)
Prism n=10  |=======|                    62 (cần 31 Prism)
```

**Gốc rễ:** (1) Ember nhân **bình phương** theo lửa (+8% ST × +4% STCM, chí mạng chạm 100% ở ~240 lửa, tốc thêm ×3); (2) lửa được **SAO CHÉP** chứ không tiêu: ghép 2 Ember chép (a+b) cho tới 6 Ember cùng hàng/cột → bơm lửa tăng **theo cấp số nhân**. La Bàn (stack a+b+1) và Prism (n = a+b+1) là **bảo toàn**: stack k tốn ~4(k+1) La Bàn / 3n+1 Prism → tuyến tính theo công.

## 3. Bot SOLO — số đo (stack lớn nhất / ST thô cả bàn mỗi giây, trung vị)

| nhóm | trận | wave TB | trung vị | chạm 70 | w10 | w20 | w30 | w40 | w50 | w60 | w70 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ember gốc (bot thường) | 8 | **45.0** | 42 | 1/8 | 15 / 392 | 114 / 2.4k | 216 / 7.8k | 400 / 44k | 240–528 / 62k | 528 / 169k | **3 736** / 728k |
| Ember gốc (dồn, EP .5) | 8 | 43.1 | 38 | 1/8 | 103 / 416 | 322 / 7.9k | (6–652) / 10k | 84–333 / 21k | 333 / 79k | 540 / 183k | 551 / 253k |
| La Bàn (dồn) | 10 | **27.7** | 31 | 0/10 | 0 / 340 | 1 / 1.5k | 3 / 3.8k | — | | | |
| Prism Thief (dồn) | 8 | **34.6** | 34 | 0/8 | 0 / 431 | 0 / 1.8k | 0 / 4.5k | — | | | |
| La Bàn (bot thường) | 9 | 27.4 | 28 | 0/9 | | | | | | | |
| Prism (bot thường) | 9 | 31.8 | 33 | 0/9 | | | | | | | |
| *Đỏ cùng bộ (DO-VANG-DO, 30 trận)* | 30 | *51.6* | — | *2/30* | | | | | | | |

Đòn lớn nhất Ember (trung vị): w40 18k · w60 40k · w70 **163k** (bot chỉ giữ 3–5 Ember; ảnh có ~11 Ember → lửa và đòn cao hơn nữa).
**Đối chiếu ảnh:** bot đạt 240–528 lửa ở w50, 528–3 736 ở w60–70 → **~800 lửa ở wave 53 là thực tế** với bàn đầy Ember; 281k/đòn khớp hệ số ×6 000 (ST gốc 24 × hệ số Vàng × ×6 077).

## 4. Kết luận

- **Ember vượt hẳn các Vàng cộng dồn khác ngay từ wave ~15–20** (lửa 100+ ⇒ ×60): wave TB 43–45 so với **La Bàn 27–28 (kém ~16 wave)**, **Prism 32–35 (kém ~10–12 wave)**. ST thô bàn w30: Ember 7.8–10k vs La Bàn 3.8k, Prism 4.5k (×2–2.5); w40+ La Bàn/Prism đã chết.
- **So với Đỏ:** wave TB Ember (43–45) xấp xỉ dải dưới của Đỏ (47–58, TB 51.6), có trận chạm 70 (1/8 ≈ tỉ lệ Đỏ 2/30). Nhưng **trần sức mạnh** thì Ember vượt Đỏ xa từ ~w50: ST bàn tăng ×3–4 mỗi 10 wave (62k → 169k → 728k) không giới hạn — vi phạm "Vàng cộng dồn không vượt Đỏ". Ember chết sớm ở nhiều trận là do **bơm lửa may rủi** (đầu trận ít Ember), không phải do yếu.
- **La Bàn / Prism không thể "mạnh được như vậy"**: bot hiếm khi có stack (La Bàn trung vị 1–3 ở w20–30, Prism 0–2 hợp thể) — nút thắt là **khó đạt stack** (cần đủ 4 hướng / 4 màu thẳng hàng), không phải hệ số. Buff hệ số (C) chỉ +4 wave cho La Bàn, Prism không đổi.

## 5. Phương án (số trước / sau)

Bù theo yêu cầu 16:24: **ST gốc 24 → 30 (+25%), tốc gốc 1.5 → 1.8 (+20%)** = ×1.5 sát thương/giây khi lửa thấp → wave 10–30 không yếu đi (lý thuyết: mọi mức lửa ≤ 120 đều mạnh hơn bản gốc ×1.5; B ≤ 60 lửa ×1.5–1.85).

| | gốc | **A — trần cứng 120** | **B — giảm dần (khuyên dùng)** | C — giữ Ember, buff La Bàn + Prism |
|---|---|---|---|---|
| Luật | không trần | lửa ≤ 120; truyền lửa chạm trần → mất phần thừa (đã có `Math.min(tran, …)` trong `LUA_ROI.truyen`); + bù | lửa hiệu dụng = n (≤60), trên 60: 60 + 30·ln(1+(n−60)/30); STCM/lửa 4% → 2.5%; lửa 1–20 thêm +4% ST/lửa; + bù. Số lửa hiển thị vẫn không trần | La Bàn stack 50% → 120%, tên lửa ×1.3; Prism HOP_DMG 3 → 6, HOP_TOC 0.1 → 0.2 |
| × hệ số ở 10 / 60 / 120 / 800 lửa | 2.4 / 21 / ~110 / 6 077 | 3.7 / 31 / 138 / **138** | 4.4 / 31 / 70 / **207** | như gốc |
| ST thô bàn w10 (Ember dồn) | 416 | 496 (+19%) | 509 (+22%) | — |
| ST thô bàn w50 / w60 / w70 | 79k / 183k / 253k | 54k / 83k / 118k | 46k / 127k / 185k | — |
| Đòn lớn nhất w70 | 51k (bot thường: 163k) | 18k | 33k | — |
| Wave TB bot (Ember dồn) | 43.1 (8 trận) | 45.3 (7) | 48.9 (7) | — |
| Chạm 70 | 1/8 | 1/7 | 1/7 | — |
| La Bàn / Prism wave TB | 27.7 / 34.6 | — | — | 31.8 / 32.9 (≈ không đổi) |

Đọc bảng: A và B **không làm Ember thua sớm hơn** (wave TB ngang/nhỉnh hơn, đầu trận +20%), chỉ **cắt đuôi bùng nổ** (w70 ST bàn ÷2, đòn ÷3–9; hệ số tối đa ÷30–45 so với 800 lửa gốc). C không giải quyết: muốn La Bàn/Prism ngang Ember 800 lửa phải ×100 hệ số → sẽ phá cả game, và vẫn kẹt ở chỗ khó đạt stack.

### Khuyên dùng: **B (giảm dần) + bù ST 30 / tốc 1.8**

- Đúng triết lý "vừa đủ khó": đầu–giữa trận Ember mạnh hơn hiện tại, hậu kỳ vẫn còn tăng (log — người dùng 08/11 không thích trần cứng ở kỹ năng cộng dồn), nhưng tối đa ~×200 thay vì ×6 000 → không vượt Đỏ.
- Nếu muốn đơn giản/dễ hiểu cho người chơi: **A trần 120** (số hiển thị "120/120", mốc màu 10/30/50/70 vẫn còn ý nghĩa).
- La Bàn / Prism: không buff hệ số; việc riêng nên làm sau là **giảm độ khó đạt stack** (La Bàn: ghép cùng hướng cũng +0.5 stack; Prism: hợp thể 3 màu thay vì 4) rồi đo lại bằng tool này.
- Sau khi chốt: kiểm Đỏ vs Ember bằng `node tools/thap-do-vang-do.js chi=lualien,…` (bài 1 ụ) + 20–30 trận bot.

## 6. Tái hiện

```
node tools/thap-do-cong-don.js heso [pa=A|B|C]
EP=0.5 node tools/thap-do-cong-don.js song lualien hat=1-8 pa=B ra=/tmp/b.json
node tools/thap-do-cong-don.js gop "Ember B=/tmp/b.json" "Ember gốc=/tmp/g.json"
node tools/thap-do-cong-don.js ban lualien pa=A     # DPS 1 ụ theo số lửa (bài như thap-do-vang-do)
```
Phương án chỉ vá trong mô phỏng (`PA` trong tool) — chưa đụng `thap/js`.

---

## Lần 2 — đã áp dụng (09/11, người dùng chốt 16:46)

**Chốt:** Ember = phương án **A, trần lửa CỨNG tăng theo cấp thẻ** + bù ST/tốc; La Bàn / Prism **không dễ tích stack hơn** mà **mạnh hơn theo MỖI stack** (ST + tốc bắn + ST chí mạng). Tất định (chỉ đọc `B.capThe` — online đi theo chuỗi bộ bài), không thêm bắn lan / tràn sát thương.

### Luật mới

| Ụ | Trước | Sau | File |
|---|---|---|---|
| **Ember** (`lualien`) | không trần · ST 24 · tốc 1.5 | **trần lửa = 90 + 12 × cấp thẻ trên LV9** (`KY_NANG_CAP.lualien` 90 → 186): LV9 **90** · LV10 102 · LV11 114 · LV12 126 · LV13 **138** · LV14 150 · LV15 162 · LV16 174 · LV17 **186**. Chạm trần: lửa thừa MẤT (sinh / truyền khi rời bàn / ghép đều `min(trần, …)`). ST **30**, tốc **1.8**. Tấm đếm + mô tả hiện **"n/trần"** (vd 186/186, sáng khi đầy); trang ụ: dòng "Flame limit 90 → 102" ở hàng CẤP THẺ | `vangmoi1.js` |
| **La Bàn** (`canon`) | mỗi stack +50 → 70% ST | mỗi stack **+175% → +195% ST** (cấp thẻ, `KY_NANG_CAP.canon`), **+25% ST chí mạng**, **tốc bắn trần mềm +300% × s/(s+2)** (s1 +100% · s3 +180% · s7 +233%) — s = stack hiệu dụng (5★ ×1.5) | `data.js`, `skills.js` |
| **Prism Thief** (`bienmau`) | mỗi hợp thể +300% ST, +10% tốc | mỗi hợp thể **+600% ST**, **+50% ST chí mạng**, tốc **+10%·n + 300% × n/(n+2)** (n1 +110% · n3 +210% · n10 +350%) | `skills7.js` |

Hệ số lý thuyết (×ST/giây so với 0 stack, 4–5★, gồm Đột phá — `heso cap=0`): Ember trần 90 = **×126** (LV17 trần 186 = ×645; trước: 800 lửa ×6 922) · La Bàn stack 1/3/7 = ×22 / 71 / 189 (trước 6.3 / 10.7 / 20) · Prism n 1/3/10 = ×15 / 63 / 342 (trước 4.4 / 13 / 62).

### Bot SOLO trước / sau (20 trận/nhóm, Đỏ 12 trận; EP=0.5 "dồn ụ X", Đỏ = AI game; cấp thẻ áp cho cả bộ)

ST = ST thô cả bàn/giây (trung vị; ngoặc = số trận còn sống ở mốc đó). Prism "trước" đo bằng bot mới (giữ Prism, tự hợp thể — bot lần 1 lấy Prism làm nguyên liệu ghép nên hầu như không hợp thể).

| nhóm | trận | wave TB | trung vị | chạm 70 | ST w10 | ST w30 | ST w50 | ST w70 |
|---|---|---|---|---|---|---|---|---|
| Ember trước · LV9 | 20 | **42.2** | 40 | 1/20 | 448 | 13.0k | 79.1k (2) | 253k (1) |
| Ember sau · LV9 (trần 90) | 20 | **43.0** | 39 | 0/20 | 404 | 4750 | 30.7k (5) | — |
| Ember sau · LV13 (trần 138) | 20 | **49.8** | 48 | 2/20 | 496 | 7255 | 50.4k (9) | 133k (2) |
| Ember trước · LV17 | 20 | **60.0** | 55 | 6/20 | 440 | 21.5k | 106k (13) | 412k (6) |
| Ember sau · LV17 (trần 186) | 20 | **61.0** | 60 | 7/20 | 470 | 8518 | 62.1k (14) | 203k (7) |
| La Bàn trước · LV9 | 20 | **27.7** | 31 | 0/20 | 351 | 4659 (13) | — | — |
| La Bàn sau · LV9 | 20 | **40.0** | 34 | 1/20 | 334 | 7442 (17) | 81.9k (5) | 295k (1) |
| La Bàn trước · LV17 | 20 | **36.2** | 34 | 0/20 | 392 | 5474 | — | — |
| La Bàn sau · LV17 | 20 | **54.6** | 53 | 5/20 | 397 | 8029 | 86.5k (15) | 248k (5) |
| Prism trước · LV9 | 20 | **33.3** | 33 | 0/20 | 408 | 5138 (16) | — | — |
| Prism sau · LV9 | 20 | **39.4** | 38 | 0/20 | 547 | 13.2k (19) | 26.9k (2) | — |
| Prism trước · LV17 | 20 | **47.0** | 47 | 0/20 | 421 | 7225 | 40.6k (8) | — |
| Prism sau · LV17 | 20 | **50.9** | 50 | 1/20 | 431 | 12.0k | 52.8k (11) | 491k (1) |
| *Đỏ Wyrm Engine · LV11* | 12 | *53.0* | 55 | 2/12 | 339 | 6552 | 66.7k (7) | 201k (2) |
| *Đỏ Arcane Cascade · LV11* | 12 | *52.3* | 52 | 0/12 | 462 | 5196 | 73.2k (8) | — |
| *Đỏ Wyrm Engine · LV17* | 12 | *66.8* | 70 | 9/12 | 375 | 8141 | 84.2k (11) | 227k (9) |
| *Đỏ Arcane Cascade · LV17* | 12 | *67.3* | 67 | 6/12 | 489 | 7780 | 83.1k | 351k (6) |

Đòn lớn nhất Ember (trung vị) w40 / w60 / w70: LV9 trước 21.6k / 41.4k / 51.5k → sau 2.8k / 8.4k / — · LV17 trước 41.3k / 71k / 99.7k → sau 9.8k / 27.2k / 33.9k.

### Đọc số

- **Ember:** LV9 wave TB 42.2 → **43.0** (không thua sớm hơn; w10 ST ngang, lửa chạm 90 từ ~w20); đuôi bùng nổ bị cắt: ST w30 ÷2.7, đòn w60 ÷5. LV17 61 wave (Đỏ max 67, chạm 70 7/20 vs Đỏ 15/24) → **max thẻ vẫn dưới dải Đỏ max**. Số lửa không còn vượt 186 (trước 3 736+ lửa, có trận tới wave 120).
- **La Bàn:** 27.7 → **40.0** (LV9), 36.2 → 54.6 (LV17); w10 không đổi (chưa có stack), w30 ST ×1.6. Vẫn có "tường" boss wave 30 (trùm lấy 2 tim, rồi đám đông w32–33) ở trận stack thấp — trung vị 34.
- **Prism:** 33.3 → **39.4** (LV9), 47.0 → 50.9 (LV17); w30 ST ×2.6.
- Cả 3 ở LV9 trong dải **≈ 39–43** (mục tiêu 40–45, Prism sát dưới), LV17 51–61 < Đỏ max 67; LV9 đều < Đỏ LV11 (52–53). wave 10–30 không yếu đi.
- Mẫu nhỏ (20 trận, máy 2 nhân): wave TB lệch ±2–3.

### Tái hiện

```
node tools/thap-do-cong-don.js heso cap=0|8 [pa=cu]
EP=0.5 node tools/thap-do-cong-don.js song lualien|canon|bienmau hat=1-20 cap=0|4|8 ra=/tmp/x.json   # pa=cu = luật trước lần 2
node tools/thap-do-cong-don.js song ronglua chien=ai hat=1-12 cap=6                               # Đỏ max thẻ
node tools/thap-do-cong-don.js ban lualien cap=8                                                   # DPS 1 ụ theo số lửa
```
