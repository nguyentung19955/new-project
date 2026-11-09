# Đo tốc bắn + DPS ụ Vàng / Đỏ (09/11)

## 09/11 (lần 2) — Đỏ phải mạnh hơn Vàng RÕ RỆT (lệch 2 cấp thẻ)

Người dùng: *"vì tướng vàng bắt đầu từ level 9 còn đỏ bắt đầu từ level 11 nên tôi nghĩ là chỉ số của đỏ phải mạnh hơn rõ rệt lệch 2 cấp cơ mà"*.
Mục tiêu (điều phối): Đỏ trung vị ≈ 1.5–1.8× Vàng tốt nhất ở 3★/5★, ≈ 1.8–2.2× ở 7★, cả lúc vừa có thẻ lẫn max thẻ; ụ Đỏ yếu nhất ≥ 1.2×.

### Cách so cũ có sai không

- **So cấp thẻ: đúng.** "dau" = `capThe 0` = LV đầu bậc (Đỏ LV11, Vàng LV9 — cùng "vừa có thẻ"); "max" = Đỏ +6 (LV17) vs Vàng +8 (LV17).
- **Nhưng lợi thế "2 cấp" của Đỏ gần như không tồn tại trong công thức:** `B.capThe` = số cấp TRÊN cấp đầu của bậc (thebai.js `THE.lvDau` bị trừ đi), nên LV11 Đỏ và LV9 Vàng đều là `capThe 0` → `hsThe = 1`. Phần hơn duy nhất là `TIERS.hs` (Đỏ 3.3 / Vàng 2.6 = ×1.27) — ít hơn cả 2 cấp Vàng (+10% ST/+4% tốc ≈ ×1.14) cộng chênh bậc. Kết quả đo: Đỏ trung vị chỉ **0.86× Vàng tốt nhất ở 3★**, 1.04× ở 5★.
- **Số đo "Vàng tốt nhất" cũ nhảy theo hạt giống:** Werewolf (Sói) quay Thường/Thức tỉnh lúc sinh (30%+), trung vị 3 hạt lúc ra bản này lúc bản kia → "Vàng tốt nhất" nhảy ×1.6–3 giữa các wave (vd dau3: 1892 → 1344 → 3071), bảng 09/11 đọc ra 0.97 / 1.09 / 1.25 / 1.62 là may rủi. Sửa tool: Sói đo CẢ HAI bản (ép `T.thuc`) rồi lấy **kỳ vọng** theo `SKILLS.soi.tiLe` ở cấp thẻ đó → Sói thành Vàng tốt nhất ổn định ở mọi ô (mạnh hơn Eclipse 1.2–1.7×) — mốc so khó hơn trước.
- Leviathan: bài 24 s chỉ được vài điểm VỰC SÂU. Thêm cột **VỰC SÂU kỳ vọng** (đặt sẵn điểm theo wave: w20 8 · w30 20 · w40 80 · w50 180 — từ 18 trận SOLO bot có Leviathan: trung vị điểm Leviathan mạnh nhất trên bàn ≈ 9 / 20–27 / 100 / 190–235) và bài dài 90 s từ 0 điểm. Bảng chính vẫn tính Leviathan TỪ 0 (thận trọng, như cũ).

Tool: `node tools/thap-do-vang-do.js [ra.json]` · bảng: `node tools/thap-do-vang-do.js bang=ra.json khoa=… tungdo` · bài dài: `T0=90 WAVE=20,30,40 node tools/thap-do-vang-do.js ra.json chi=…` · `VUC=0` tắt VỰC SÂU kỳ vọng.
Số thô: `do2-truoc.json` (fe2d03c2c, tool mới), `do2-sau.json`, `do2-dai90.json` (90 s, sau sửa).

### Sửa (chỉ số / công thức, tất định, không RNG mới, không lan / tràn sát thương mới)

| # | Thay đổi | File |
|---|---|---|
| 1 | **Nền khởi điểm Đỏ** `heDoNen` (trong `heSaoST` → dmgU / hsU / statThuc): ụ Tấn công Đỏ ST × (1.8 − 0.2 × (max(3, sao) − 3)): 1–3★ ×1.8 · 4★ ×1.6 · 5★ ×1.4 · 6★ ×1.2 · **7★ ×1 (giữ nguyên)**. Đỏ lên sao mạnh hơn Vàng (cơ chế gom / lan theo sao) nên phần bù giảm dần theo sao. Đỏ Hỗ trợ / Đặc biệt không đổi | `data.js` |
| 2 | Arcane Cascade `dmg` 13 → **20** (ụ Đỏ yếu nhất ≈0.6× Vàng tốt nhất ở 3–5★) | `thacmana.js` |
| 3 | Tool đo: Sói = kỳ vọng 2 dạng; Leviathan có VỰC SÂU kỳ vọng; T0/SAO/WAVE qua biến môi trường; bảng tên ụ min/max + ma trận từng ụ Đỏ | `tools/thap-do-vang-do.js` |

Đã thử và **bỏ**: dốc riêng Leviathan 0.1 (7★ ×1.4) — 18 trận SOLO bộ có Leviathan chạm wave 70: 5/18 (trước sửa 3/18) → bỏ; bản cuối 3/18.

### Kết quả — Đỏ trung vị / Vàng tốt nhất (trung bình 4 wave)

| | 3★ LV đầu | 3★ max | 5★ LV đầu | 5★ max | 7★ LV đầu | 7★ max |
|---|---|---|---|---|---|---|
| 09/11 (bảng cũ, Sói trung vị 3 hạt) | 0.97 | 1.09 | 1.25 | 1.62 | 1.96 | 1.89 |
| **Trước** (fe2d03c2c, tool mới) | 0.86 | 0.96 | 1.04 | 1.28 | 1.86 | 1.92 |
| **Sau** | **1.69** | **1.74** | **1.58** | **1.66** | **1.84** | **1.93** |
| Mục tiêu | 1.5–1.8 | 1.5–1.8 | 1.5–1.8 | 1.5–1.8 | 1.8–2.2 | 1.8–2.2 |

Max thẻ ≥ LV đầu ở mọi mốc sao. Vàng / Tím giữ nguyên (Vàng TV / Tím TV ≈ 2.1–6.5 như trước, số Vàng không đổi). `thap-kt-tier` 4★: Red 5.66 → 7.55 (Gold 3.14), thứ tự giữ.

Từng ụ Đỏ (bài 24 s, sau): **mạnh nhất Overlord 2.2–3.2×**, Wyrm Engine 1.7–2.7×, Hive Queen 1.6–2.3×, Black Hole 1.0–2.9×, Arcane Cascade 1.16–1.78×; **yếu nhất Leviathan từ 0 điểm** 0.34–1.07× (VỰC SÂU kỳ vọng: 1.23–11×, trừ 5★ ở wave 20 và 7★ ở wave 20–30: 0.51–0.87). Black Hole 5★ LV đầu 1.02–1.12× là do lượng tử bài 24 s (hố 7–8 s/lần, quái to chỉ bị giữ 0.6 s) — bài 90 s 2.1–2.3×.

**Bài dài 90 s** (đo thêm, sau sửa): Đỏ "tăng tốc" theo thời gian (Wyrm nhiệt không trần, Hive, Black Hole, VỰC SÂU) → Đỏ trung vị / Vàng tốt nhất **1.9–2.5×** (cao hơn bài 24 s); mọi ụ Đỏ ≥ 1.3× trừ Leviathan 5★/7★ từ 0 điểm (0.68–1.11×; VỰC SÂU kỳ vọng 0.93–5.4×).

### Kiểm "không biến game quá dễ" — SOLO bot (AI game), cấp thẻ 0, tim thật

Bộ = 1 Đỏ + `lien, canon, set, tia` ("Thường") hoặc + `soi, nhatthuc, hasao, cuongno` ("Vàng"); hạt 11–15 (script tạm như `thap-sim-vaitro.js song`, AI của game `G.ban[0].ai`):

| Ụ Đỏ | bộ | wave trước (5 trận) | TB / trung vị / chạm 70 | wave sau | TB / trung vị / chạm 70 |
|---|---|---|---|---|---|
| leviathan | Thường | 22 26 30 26 29 | 26.6 / 26 / 0 | 21 31 32 34 33 | 30.2 / 32 / 0 |
| leviathan | Vàng | 35 43 36 39 62 | 43.0 / 39 / 0 | 70 63 33 70 54 | 58.0 / 63 / 2 |
| blackhole | Thường | 22 30 29 30 24 | 27.0 / 29 / 0 | 32 31 26 20 30 | 27.8 / 30 / 0 |
| blackhole | Vàng | 52 42 54 44 43 | 47.0 / 44 / 0 | 52 44 54 60 46 | 51.2 / 52 / 0 |
| overlord | Thường | 21 26 29 34 32 | 28.4 / 29 / 0 | 40 31 32 26 36 | 33.0 / 32 / 0 |
| overlord | Vàng | 30 33 60 62 47 | 46.4 / 47 / 0 | 53 60 60 66 46 | 57.0 / 60 / 0 |
| chuato | Thường | 22 28 20 25 24 | 23.8 / 24 / 0 | 24 23 32 29 28 | 27.2 / 28 / 0 |
| chuato | Vàng | 44 35 38 29 35 | 36.2 / 35 / 0 | 48 43 59 40 58 | 49.6 / 48 / 0 |
| ronglua | Thường | 22 28 31 34 30 | 29.0 / 30 / 0 | 42 32 31 28 42 | 35.0 / 32 / 0 |
| ronglua | Vàng | 53 54 32 57 62 | 51.6 / 54 / 0 | 27 64 32 60 53 | 47.2 / 53 / 0 |
| thacmana | Thường | 21 28 23 20 26 | 23.6 / 23 / 0 | 30 32 33 30 32 | 31.4 / 32 / 0 |
| thacmana | Vàng | 44 62 35 43 43 | 45.4 / 43 / 0 | 54 42 60 64 38 | 51.6 / 54 / 0 |
| **tổng** | | | 35.7 / 32 / 0/60 | | 41.6 / 37 / 2/60 |

Leviathan + bộ Vàng chạm 70 ở 2/5 trận (hạt 11–15, trước 0/5) nên đo thêm 18 trận bộ có Leviathan (Thường / Vàng / Tím `bao, anhsang, taylo, no5`, hạt 1–6): chạm wave 70 **3/18 trước → 3/18 sau**, wave TB 44.7 → 44.1 (bộ Leviathan vốn đã có trận chạm 70 trước sửa nhờ VỰC SÂU). → Đỏ đi xa hơn ~+6 wave trung bình (35.7 → 41.6), chạm 70: 3/78 → 5/78 trận gộp — chưa "chạm 70 dễ dàng" ở cấp thẻ thấp.

### Tổng hợp từng kịch bản — TRƯỚC (fe2d03c2c, tool mới)

| kịch bản | Tím TV | Vàng TV | Vàng top-3 TB | Vàng tốt nhất | Đỏ TV | Đỏ thấp nhất | Vàng TV / Tím TV | Đỏ TV / Vàng TV | **Đỏ TV / Vàng tốt nhất** | Đỏ thấp nhất / Vàng tốt nhất |
|---|---|---|---|---|---|---|---|---|---|---|
| dau3w20 | 234 | 589 | 1099 | 1579 soi | 1324 | 870 leviathan | 2.52 | 2.25 | **0.84** | 0.55 |
| dau3w30 | 198 | 815 | 1492 | 2154 soi | 1826 | 1148 leviathan | 4.11 | 2.24 | **0.85** | 0.53 |
| dau3w40 | 251 | 1002 | 1853 | 2701 soi | 2413 | 1557 leviathan | 4.00 | 2.41 | **0.89** | 0.58 |
| dau3w50 | 194 | 1251 | 2263 | 3251 soi | 2830 | 1941 leviathan | 6.44 | 2.26 | **0.87** | 0.60 |
| dau5w20 | 615 | 1461 | 2538 | 3457 soi | 3492 | 1479 leviathan | 2.38 | 2.39 | **1.01** | 0.43 |
| dau5w30 | 616 | 1990 | 3420 | 4715 soi | 4908 | 1923 leviathan | 3.23 | 2.47 | **1.04** | 0.41 |
| dau5w40 | 616 | 2460 | 4318 | 5910 soi | 6064 | 2525 leviathan | 4.00 | 2.47 | **1.03** | 0.43 |
| dau5w50 | 637 | 2984 | 5282 | 7309 soi | 7970 | 3162 leviathan | 4.69 | 2.67 | **1.09** | 0.43 |
| dau7w20 | 1212 | 3064 | 4746 | 5248 soi | 9536 | 2017 leviathan | 2.53 | 3.11 | **1.82** | 0.38 |
| dau7w30 | 1218 | 4184 | 6498 | 7326 soi | 13220 | 2729 leviathan | 3.44 | 3.16 | **1.80** | 0.37 |
| dau7w40 | 1211 | 5189 | 8115 | 8880 soi | 16750 | 3583 leviathan | 4.28 | 3.23 | **1.89** | 0.40 |
| dau7w50 | 1196 | 6447 | 9848 | 11010 soi | 21460 | 4326 leviathan | 5.39 | 3.33 | **1.95** | 0.39 |
| max3w20 | 399 | 825 | 1895 | 2975 soi | 2672 | 1423 leviathan | 2.07 | 3.24 | **0.90** | 0.48 |
| max3w30 | 386 | 1141 | 2562 | 4023 soi | 4043 | 2020 leviathan | 2.96 | 3.54 | **1.01** | 0.50 |
| max3w40 | 384 | 1402 | 3223 | 5039 soi | 4856 | 2711 leviathan | 3.66 | 3.46 | **0.96** | 0.54 |
| max3w50 | 384 | 1752 | 3905 | 6090 soi | 5927 | 3289 leviathan | 4.56 | 3.38 | **0.97** | 0.54 |
| max5w20 | 993 | 2303 | 4390 | 6476 soi | 7873 | 2283 leviathan | 2.32 | 3.42 | **1.22** | 0.35 |
| max5w30 | 1003 | 3199 | 5843 | 8619 soi | 10250 | 3324 leviathan | 3.19 | 3.20 | **1.19** | 0.39 |
| max5w40 | 1023 | 4012 | 7352 | 10834 soi | 14621 | 4401 leviathan | 3.92 | 3.64 | **1.35** | 0.41 |
| max5w50 | 1008 | 4970 | 8920 | 12914 soi | 17884 | 5318 leviathan | 4.93 | 3.60 | **1.38** | 0.41 |
| max7w20 | 1952 | 4869 | 8162 | 9816 soi | 18091 | 3342 leviathan | 2.49 | 3.72 | **1.84** | 0.34 |
| max7w30 | 1957 | 6573 | 11024 | 13349 soi | 26884 | 4602 leviathan | 3.36 | 4.09 | **2.01** | 0.34 |
| max7w40 | 1969 | 8306 | 13823 | 16489 soi | 31430 | 6017 leviathan | 4.22 | 3.78 | **1.91** | 0.36 |
| max7w50 | 2058 | 10053 | 16801 | 19900 soi | 38351 | 7539 leviathan | 4.88 | 3.81 | **1.93** | 0.38 |

Trung bình 4 wave — Đỏ TV / Vàng tốt nhất: dau3 0.86 · dau5 1.04 · dau7 1.86 · max3 0.96 · max5 1.28 · max7 1.92

| kịch bản | Black Hole | Overlord | Hive Queen | Leviathan (từ 0) | Wyrm Engine | Arcane Cascade |
|---|---|---|---|---|---|---|
| dau3w20 | 0.82 | 1.48 | 0.86 | 0.55 | 1.36 | 0.59 |
| dau3w30 | 0.82 | 1.62 | 0.88 | 0.53 | 1.40 | 0.60 |
| dau3w40 | 0.86 | 1.80 | 0.92 | 0.58 | 1.44 | 0.62 |
| dau3w50 | 0.87 | 1.54 | 0.87 | 0.60 | 1.49 | 0.67 |
| dau5w20 | 0.73 | 1.77 | 1.29 | 0.43 | 1.30 | 0.60 |
| dau5w30 | 0.75 | 1.79 | 1.41 | 0.41 | 1.33 | 0.61 |
| dau5w40 | 0.73 | 1.85 | 1.33 | 0.43 | 1.40 | 0.63 |
| dau5w50 | 0.80 | 1.91 | 1.38 | 0.43 | 1.42 | 0.63 |
| dau7w20 | 2.78 | 2.79 | 1.70 | 0.38 | 1.93 | 0.86 |
| dau7w30 | 2.74 | 3.14 | 1.67 | 0.37 | 1.94 | 0.87 |
| dau7w40 | 2.54 | 3.20 | 1.73 | 0.40 | 2.04 | 0.91 |
| dau7w50 | 2.89 | 2.99 | 1.83 | 0.39 | 2.07 | 0.92 |
| max3w20 | 0.94 | 1.35 | 0.86 | 0.48 | 1.26 | 0.52 |
| max3w30 | 1.12 | 1.28 | 0.89 | 0.50 | 1.32 | 0.54 |
| max3w40 | 1.00 | 1.36 | 0.93 | 0.54 | 1.32 | 0.56 |
| max3w50 | 1.03 | 1.42 | 0.91 | 0.54 | 1.40 | 0.60 |
| max5w20 | 1.26 | 1.55 | 1.20 | 0.35 | 1.23 | 0.54 |
| max5w30 | 1.08 | 1.65 | 1.31 | 0.39 | 1.30 | 0.57 |
| max5w40 | 1.38 | 1.74 | 1.36 | 0.41 | 1.34 | 0.57 |
| max5w50 | 1.40 | 1.73 | 1.38 | 0.41 | 1.39 | 0.60 |
| max7w20 | 1.89 | 2.70 | 2.12 | 0.34 | 1.80 | 0.77 |
| max7w30 | 2.18 | 2.66 | 2.21 | 0.34 | 1.85 | 0.79 |
| max7w40 | 1.87 | 2.64 | 2.21 | 0.36 | 1.94 | 0.82 |
| max7w50 | 1.85 | 2.71 | 2.39 | 0.38 | 2.01 | 0.86 |

### Tổng hợp từng kịch bản — SAU

| kịch bản | Tím TV | Vàng TV | Vàng top-3 TB | Vàng tốt nhất | Đỏ TV | Đỏ thấp nhất | Vàng TV / Tím TV | Đỏ TV / Vàng TV | **Đỏ TV / Vàng tốt nhất** | Đỏ thấp nhất / Vàng tốt nhất | Leviathan (VỰC SÂU kỳ vọng) / Vàng tốt nhất |
|---|---|---|---|---|---|---|---|---|---|---|---|
| dau3w20 | 234 | 589 | 1093 | 1579 soi | 2587 | 1588 leviathan | 2.52 | 4.39 | **1.64** | 1.01 | 1.44 (8 điểm) |
| dau3w30 | 198 | 815 | 1485 | 2154 soi | 3563 | 2189 leviathan | 4.11 | 4.37 | **1.65** | 1.02 | 2.24 (20 điểm) |
| dau3w40 | 251 | 1002 | 1869 | 2701 soi | 4556 | 2784 leviathan | 4.00 | 4.55 | **1.69** | 1.03 | 5.56 (80 điểm) |
| dau3w50 | 193 | 1251 | 2243 | 3251 soi | 5775 | 3469 leviathan | 6.47 | 4.62 | **1.78** | 1.07 | 11.23 (180 điểm) |
| dau5w20 | 628 | 1454 | 2536 | 3457 soi | 5204 | 1979 leviathan | 2.32 | 3.58 | **1.51** | 0.57 | 0.86 (8 điểm) |
| dau5w30 | 615 | 1999 | 3466 | 4715 soi | 7243 | 2828 leviathan | 3.25 | 3.62 | **1.54** | 0.60 | 1.34 (20 điểm) |
| dau5w40 | 628 | 2436 | 4301 | 5910 soi | 9698 | 3600 leviathan | 3.88 | 3.98 | **1.64** | 0.61 | 3.29 (80 điểm) |
| dau5w50 | 631 | 2970 | 5293 | 7309 soi | 11945 | 4350 leviathan | 4.71 | 4.02 | **1.63** | 0.60 | 6.44 (180 điểm) |
| dau7w20 | 1197 | 3087 | 4786 | 5248 soi | 9116 | 2002 leviathan | 2.58 | 2.95 | **1.74** | 0.38 | 0.56 (8 điểm) |
| dau7w30 | 1193 | 4104 | 6501 | 7326 soi | 13001 | 2772 leviathan | 3.44 | 3.17 | **1.77** | 0.38 | 0.87 (20 điểm) |
| dau7w40 | 1241 | 5229 | 8060 | 8880 soi | 16769 | 3499 leviathan | 4.21 | 3.21 | **1.89** | 0.39 | 2.31 (80 điểm) |
| dau7w50 | 1242 | 6260 | 10037 | 11010 soi | 21453 | 4481 leviathan | 5.04 | 3.43 | **1.95** | 0.41 | 4.38 (180 điểm) |
| max3w20 | 399 | 825 | 1915 | 2975 soi | 4900 | 2607 leviathan | 2.07 | 5.94 | **1.65** | 0.88 | 1.33 (8 điểm) |
| max3w30 | 386 | 1141 | 2580 | 4023 soi | 7217 | 3563 leviathan | 2.96 | 6.32 | **1.79** | 0.89 | 2.04 (20 điểm) |
| max3w40 | 384 | 1402 | 3222 | 5039 soi | 8818 | 4684 leviathan | 3.66 | 6.29 | **1.75** | 0.93 | 5.01 (80 điểm) |
| max3w50 | 384 | 1752 | 3890 | 6090 soi | 10848 | 5828 leviathan | 4.56 | 6.19 | **1.78** | 0.96 | 9.55 (180 điểm) |
| max5w20 | 1003 | 2379 | 4374 | 6476 soi | 10174 | 3285 leviathan | 2.37 | 4.28 | **1.57** | 0.51 | 0.77 (8 điểm) |
| max5w30 | 988 | 3173 | 5808 | 8619 soi | 14213 | 4624 leviathan | 3.21 | 4.48 | **1.65** | 0.54 | 1.23 (20 điểm) |
| max5w40 | 1058 | 4077 | 7388 | 10834 soi | 18227 | 5859 leviathan | 3.85 | 4.47 | **1.68** | 0.54 | 2.96 (80 điểm) |
| max5w50 | 993 | 4851 | 8860 | 12914 soi | 22237 | 7381 leviathan | 4.88 | 4.58 | **1.72** | 0.57 | 5.74 (180 điểm) |
| max7w20 | 1977 | 4985 | 8176 | 9816 soi | 17517 | 3341 leviathan | 2.52 | 3.51 | **1.78** | 0.34 | 0.51 (8 điểm) |
| max7w30 | 1949 | 6484 | 10974 | 13349 soi | 26406 | 4723 leviathan | 3.33 | 4.07 | **1.98** | 0.35 | 0.81 (20 điểm) |
| max7w40 | 2081 | 8221 | 13922 | 16489 soi | 31857 | 6021 leviathan | 3.95 | 3.88 | **1.93** | 0.37 | 1.99 (80 điểm) |
| max7w50 | 2021 | 10433 | 16740 | 19900 soi | 40309 | 7928 leviathan | 5.16 | 3.86 | **2.03** | 0.40 | 3.68 (180 điểm) |

Trung bình 4 wave — Đỏ TV / Vàng tốt nhất: dau3 1.69 · dau5 1.58 · dau7 1.84 · max3 1.74 · max5 1.66 · max7 1.93

| kịch bản | Black Hole | Overlord | Hive Queen | Leviathan (từ 0) | Wyrm Engine | Arcane Cascade | Leviathan VỰC SÂU kỳ vọng |
|---|---|---|---|---|---|---|---|
| dau3w20 | 1.48 | 2.71 | 1.62 | 1.01 | 2.44 | 1.66 | 1.44 |
| dau3w30 | 1.47 | 2.76 | 1.58 | 1.02 | 2.52 | 1.73 | 2.24 |
| dau3w40 | 1.55 | 2.72 | 1.62 | 1.03 | 2.64 | 1.75 | 5.56 |
| dau3w50 | 1.57 | 3.01 | 1.78 | 1.07 | 2.71 | 1.78 | 11.23 |
| dau5w20 | 1.02 | 2.38 | 1.72 | 0.57 | 1.82 | 1.29 | 0.86 |
| dau5w30 | 1.05 | 2.55 | 1.73 | 0.60 | 1.88 | 1.35 | 1.34 |
| dau5w40 | 1.02 | 2.45 | 1.94 | 0.61 | 1.92 | 1.36 | 3.29 |
| dau5w50 | 1.12 | 2.58 | 1.89 | 0.60 | 1.96 | 1.38 | 6.44 |
| dau7w20 | 2.78 | 2.98 | 1.59 | 0.38 | 1.88 | 1.37 | 0.56 |
| dau7w30 | 2.74 | 2.96 | 1.63 | 0.38 | 1.91 | 1.41 | 0.87 |
| dau7w40 | 2.54 | 3.24 | 1.77 | 0.39 | 2.01 | 1.40 | 2.31 |
| dau7w50 | 2.89 | 3.08 | 1.83 | 0.41 | 2.07 | 1.41 | 4.38 |
| max3w20 | 1.69 | 2.19 | 1.61 | 0.88 | 2.28 | 1.51 | 1.33 |
| max3w30 | 2.02 | 2.27 | 1.57 | 0.89 | 2.34 | 1.47 | 2.04 |
| max3w40 | 1.79 | 2.46 | 1.71 | 0.93 | 2.51 | 1.56 | 5.01 |
| max3w50 | 1.85 | 2.57 | 1.71 | 0.96 | 2.53 | 1.58 | 9.55 |
| max5w20 | 1.46 | 2.28 | 1.68 | 0.51 | 1.71 | 1.16 | 0.77 |
| max5w30 | 1.49 | 2.20 | 1.83 | 0.54 | 1.81 | 1.19 | 1.23 |
| max5w40 | 1.53 | 2.51 | 1.91 | 0.54 | 1.84 | 1.22 | 2.96 |
| max5w50 | 1.52 | 2.35 | 1.94 | 0.57 | 1.93 | 1.31 | 5.74 |
| max7w20 | 1.76 | 2.71 | 2.03 | 0.34 | 1.80 | 1.18 | 0.51 |
| max7w30 | 2.24 | 2.66 | 2.09 | 0.35 | 1.86 | 1.20 | 0.81 |
| max7w40 | 1.91 | 2.49 | 2.24 | 0.37 | 1.96 | 1.25 | 1.99 |
| max7w50 | 2.02 | 2.52 | 2.33 | 0.40 | 2.03 | 1.27 | 3.68 |

### Bài dài 90 s (sau sửa) — từng ụ Đỏ / Vàng tốt nhất

| kịch bản (90 s) | Vàng tốt nhất | Đỏ TV / Vàng tốt nhất | Black Hole | Overlord | Hive Queen | Leviathan (từ 0) | Wyrm Engine | Arcane Cascade | Leviathan VỰC SÂU kỳ vọng |
|---|---|---|---|---|---|---|---|---|---|
| dau3w20 | 1601 soi | **2.09** | 2.13 | 2.48 | 1.58 | 1.50 | 3.64 | 2.04 | 1.93 |
| dau3w30 | 1975 soi | **2.39** | 2.44 | 2.73 | 1.82 | 1.68 | 3.87 | 2.35 | 3.32 |
| dau3w40 | 2521 soi | **2.25** | 2.29 | 2.59 | 1.79 | 1.61 | 4.09 | 2.21 | 9.05 |
| dau5w20 | 3256 soi | **2.24** | 2.24 | 2.47 | 2.23 | 1.03 | 2.72 | 1.62 | 1.48 |
| dau5w30 | 4504 soi | **2.25** | 2.29 | 2.22 | 2.28 | 1.05 | 2.64 | 1.55 | 1.99 |
| dau5w40 | 5832 soi | **2.26** | 2.26 | 2.26 | 2.28 | 1.06 | 2.66 | 1.54 | 5.38 |
| dau7w20 | 5336 nhatthuc | **2.30** | 2.46 | 2.50 | 2.18 | 0.71 | 2.42 | 1.52 | 0.94 |
| dau7w30 | 6983 soi | **2.41** | 2.53 | 2.67 | 2.33 | 0.73 | 2.50 | 1.58 | 1.36 |
| dau7w40 | 8629 nhatthuc | **2.48** | 2.68 | 2.63 | 2.39 | 0.76 | 2.57 | 1.64 | 3.73 |
| max3w20 | 2729 soi | **1.93** | 1.98 | 2.24 | 1.72 | 1.44 | 3.59 | 1.88 | 1.92 |
| max3w30 | 3877 soi | **1.86** | 1.84 | 2.02 | 1.68 | 1.37 | 3.48 | 1.88 | 2.73 |
| max3w40 | 4326 soi | **2.22** | 2.27 | 2.24 | 1.92 | 1.57 | 4.08 | 2.20 | 8.63 |
| max5w20 | 6233 soi | **1.90** | 1.91 | 1.89 | 2.28 | 0.96 | 2.36 | 1.32 | 1.28 |
| max5w30 | 7352 soi | **2.13** | 2.10 | 2.16 | 2.64 | 1.11 | 2.87 | 1.64 | 1.97 |
| max5w40 | 9565 soi | **2.08** | 2.05 | 2.11 | 2.60 | 1.04 | 2.77 | 1.54 | 4.98 |
| max7w20 | 8975 soi | **2.30** | 2.51 | 2.46 | 2.28 | 0.68 | 2.33 | 1.39 | 0.93 |
| max7w30 | 11687 soi | **2.40** | 2.58 | 2.39 | 2.40 | 0.76 | 2.44 | 1.56 | 1.36 |
| max7w40 | 14617 soi | **2.38** | 2.35 | 2.41 | 2.40 | 0.73 | 2.51 | 1.61 | 3.55 |

### Kiểm tra (lần 2)

- `tools/thap-kt-tier.js`: White 1.07 < Blue 1.48 < Purple 1.68 < Gold 3.14 < Red 7.55 (cảnh báo Purple +14% có sẵn).
- `thap-kt-thac-mana` 32/32, `thap-kt-cong-ap` 31/31, `thap-kt-nguyen-tac` 52 ca, `thap-kt-khong-ban` 25 ụ, `thap-kt-ban-sao-giu`, `thap-kt-ngau-nhien-sinh`, `thap-kt-ngoai-deck` (LAN=1000 + 6 trận dài): đạt.
- `thap-kt-cong-huong-luat`: 34/406 lệch — **y hệt trước sửa** (chạy trên fe2d03c2c cũng 34; lệch ở ghép tudo / maychem / Ember / Jammer, không liên quan).
- Trình duyệt (390×844, trận SOLO 6 ụ Đỏ 1/3/5/7★): không lỗi trang; `statThuc().dmg` = `dmgU` (số hiển thị = số đánh thật).

---

# (09/11 lần 1) Đo tốc bắn + DPS ụ Vàng / Đỏ


Người dùng: *"Check lại xem phần tốc đánh của các ụ vàng đỏ đang có vấn đề đấy, các ụ đỏ không imba như tôi nghĩ, vì để có ụ đỏ phải mất rất nhiều công mà kết quả đem lại không xứng đáng lắm"*.

Tool: `node tools/thap-do-vang-do.js [ra.json]` (≈2 phút) · in bảng: `node tools/thap-do-vang-do.js bang=ra.json khoa=max5w30,dau7w40`.
Số thô: `do-truoc.json` (trước sửa), `do-sau.json` (sau sửa).

## Cách đo

- Mô phỏng không giao diện (như `tools/thap-sim-tier.js`), 1 ụ ở ô 2 sát đường, POWER-UP +3 như nhau cho mọi ụ.
- Sao 3/5/7 × cấp thẻ **dau** (LV đầu bậc: Tím 6, Vàng 9, Đỏ 11) và **max** (Tím 15, Vàng/Đỏ 17) × wave 20/30/40/50 (máu quái giữ cùng mức tuyệt đối → chỉ còn khác biệt của heHauKy / cơ chế theo wave).
- DPS đơn (1 quái trâu) và DPS đám đông (≤10 quái); **chỉ số = trung bình nhân**. Ụ có chủ động tự dùng khi nạp đầy. Mỗi điểm = trung vị 3 hạt giống.
- "tốc" = `tocU(T)` (phát/giây danh nghĩa, đã gồm sao, cấp thẻ, mốc 3★, tốc theo sao).
- "Vàng tốt nhất / top-3" bỏ **Nemesis** (đòn % máu tối đa → bài thử quái trâu phồng ảo) và **Prism Thief** (màu quay lúc sinh → số đo nhảy ×10 giữa các hạt).
- Không đo được: VỰC SÂU của Leviathan cộng dồn cả trận (+4%/điểm, không trần) — bài 24 s chỉ có vài điểm nên Leviathan bị đo thấp hơn thực tế; Arcane Cascade đặt mana 600.
- Ụ Đỏ không bắn (Cryo Reactor, Holy Halo, Chrono Throne, Genesis Core) không nằm trong bảng này (tiến triển theo `KY_NANG_CAP` riêng); bài hồi quy bậc `tools/thap-kt-tier.js` vẫn giữ thứ tự (xem cuối).

## Lỗi gốc tìm thấy

1. **Cấp thẻ tốc bắn KHÔNG áp cho ụ tự quản nhịp.** Luật 08/11: mỗi cấp thẻ Tấn công Vàng/Đỏ +2% tốc — nhưng chỉ `tocU()` (bắn thường) nhân `tocThe`. Ụ tự quản nhịp dùng `nhipU()` hoặc `1 + buf.toc` nên mất phần này: **4/6 ụ Tấn công Đỏ** (Hố Đen, Chúa Tổ, Overlord, Rồng Máy) + Vàng Sói, Máy Dựng Tường, Hydra. Overlord / Rồng Máy / Máy Dựng Tường còn mất luôn Ép Xung (Overclock) và Kẹp Phá vì dùng `1 + buf.toc`.
2. **Hệ số bậc Đỏ chỉ hơn Vàng 4%** (`TIERS.do.hs` 2.7 so với Vàng 2.6) trong khi Đỏ rơi 0.2%/lượt (Vàng 1.8%), tối đa 1 Đỏ/bộ bài.
3. **Thẻ Đỏ lên max được ÍT hơn Vàng.** Đỏ bắt đầu LV11 → LV17 chỉ 6 cấp; Vàng LV9 → LV17 8 cấp; cùng % mỗi cấp → max thẻ Đỏ +30% ST / +12% tốc, Vàng +40% / +16%. Càng cày Đỏ càng tụt so với Vàng (Đỏ TV / Vàng TV: LV đầu ≈1.9–2.1 → max ≈1.6–1.8).
4. Tốc bắn Đỏ thấp: 5★ max thẻ Hố Đen / Chúa Tổ 1.12 phát/s, Leviathan 1.01 (Vàng bắn thường 3–4.8). Miễn trừ "tốc theo sao" của Rồng/Thuỷ Quái/Hố Đen/Chúa Tổ (`SAO_CU`) **không** làm thiệt DPS (ST ×(1+0.85/★) ×1.2 bằng ×(1+0.5/★)×(1.2+0.105/★) ở 7★, hơn ở 3–5★) — giữ nguyên theo người dùng chốt, chỉ là cảm giác chậm.
5. heHauKy (Vàng +3.5%/wave, Đỏ +4%/wave từ w20; sau w40 ×1.02 / ×1.023) gần như không tách Đỏ khỏi Vàng (w40: ×1.70 / ×1.80) — không phải lỗi, giữ nguyên.
6. Không có kẹp/trần nào trên tốc bắn ngoài sàn ×0.1.

## Sửa

| # | Thay đổi | File |
|---|---|---|
| 1 | `nhipU()` nhân `tocThe` (cấp thẻ tốc Vàng/Đỏ). Overlord, Máy Dựng Tường, Rồng Máy (hơi thở), nhịp nuốt Leviathan, tia điện dạng 2 Overlord dùng `nhipU` thay `1 + buf.toc` (nhận thêm Ép Xung / Kẹp Phá như ụ khác) | `skills2.js`, `skills.js`, `skills5.js`, `growfx.js` |
| 2 | `TIERS.do.hs` 2.7 → **3.3** (Đỏ ×1.27 Vàng) | `data.js` |
| 3 | Cấp thẻ Đỏ (`CAP_DO`): Tấn công +7% ST & +3% tốc mỗi cấp (max +42% / +18% ≥ Vàng +40% / +16%), Hỗ trợ +5.5%, Đặc biệt +4% (`heDB` theo bậc) | `data.js` |
| 4 | Tốc bậc Đỏ `TOC_DO` ×1.15 cho ụ Tấn công Đỏ (nhân trong `tocThe` → áp cả bắn thường lẫn nhịp tự quản) | `data.js` |

Tất định: chỉ đổi hằng số / công thức, không thêm RNG; online 2 máy cùng code tính như nhau.

## Kết quả — trung bình theo nhóm kịch bản (4 wave)

```
/tmp/truoc.json
  dau3 Đỏ/Vàngtop3 1.03 Đỏ/Vàngbest 0.73 VàngTV/TímTV 4.30 ĐỏTV/VàngTV 1.83
  dau5 Đỏ/Vàngtop3 1.30 Đỏ/Vàngbest 1.00 VàngTV/TímTV 3.62 ĐỏTV/VàngTV 1.97
  dau7 Đỏ/Vàngtop3 1.37 Đỏ/Vàngbest 1.26 VàngTV/TímTV 3.85 ĐỏTV/VàngTV 2.12
  max3 Đỏ/Vàngtop3 0.97 Đỏ/Vàngbest 0.74 VàngTV/TímTV 3.27 ĐỏTV/VàngTV 1.81
  max5 Đỏ/Vàngtop3 1.13 Đỏ/Vàngbest 0.89 VàngTV/TímTV 3.45 ĐỏTV/VàngTV 1.77
  max7 Đỏ/Vàngtop3 1.12 Đỏ/Vàngbest 1.02 VàngTV/TímTV 3.45 ĐỏTV/VàngTV 1.80
/tmp/sau.json
  dau3 Đỏ/Vàngtop3 1.35 Đỏ/Vàngbest 0.97 VàngTV/TímTV 4.22 ĐỏTV/VàngTV 2.38
  dau5 Đỏ/Vàngtop3 1.64 Đỏ/Vàngbest 1.25 VàngTV/TímTV 3.61 ĐỏTV/VàngTV 2.49
  dau7 Đỏ/Vàngtop3 2.13 Đỏ/Vàngbest 1.96 VàngTV/TímTV 3.73 ĐỏTV/VàngTV 3.30
  max3 Đỏ/Vàngtop3 1.55 Đỏ/Vàngbest 1.09 VàngTV/TímTV 3.45 ĐỏTV/VàngTV 3.26
  max5 Đỏ/Vàngtop3 2.11 Đỏ/Vàngbest 1.62 VàngTV/TímTV 3.67 ĐỏTV/VàngTV 3.23
  max7 Đỏ/Vàngtop3 2.26 Đỏ/Vàngbest 1.89 VàngTV/TímTV 3.76 ĐỏTV/VàngTV 3.86
```

Mục tiêu: Đỏ (trung vị) ≈ 1.4–1.8× Vàng tốt nhất; Vàng rõ hơn Tím. Sau sửa: Đỏ / Vàng tốt nhất ≈ 1.0–1.25 ở 3★, 1.25–1.6 ở 5★, ≈1.9 ở 7★ (trung bình mọi ô ≈1.46); Đỏ / trung bình top-3 Vàng ≈1.35–2.25. Vàng TV / Tím TV giữ ≈3.5×. Ở 7★ hơi vượt dải vì ụ Đỏ đánh lan (Hố Đen, Chúa Tổ) tăng hơn tuyến tính khi nạp nhanh hơn; 3★ còn dưới dải do "Vàng tốt nhất" là Sói thức tỉnh (dạng quay ngẫu nhiên).

## Tổng hợp từng kịch bản — TRƯỚC

| kịch bản | Tím TV | Vàng TV | Vàng top-3 TB | Vàng tốt nhất | Đỏ TV | Đỏ thấp nhất | Vàng TV / Tím TV | Đỏ TV / Vàng TV | Đỏ TV / Vàng tốt nhất |
|---|---|---|---|---|---|---|---|---|---|
| dau3w20 | 234 | 618 | 1195 | 1892 | 1042 | 579 | 2.64 | 1.69 | 0.55 |
| dau3w30 | 198 | 795 | 1158 | 1381 | 1478 | 842 | 4.01 | 1.86 | 1.07 |
| dau3w40 | 251 | 1026 | 1987 | 3071 | 1877 | 1053 | 4.09 | 1.83 | 0.61 |
| dau3w50 | 193 | 1251 | 2333 | 3479 | 2419 | 1300 | 6.47 | 1.93 | 0.70 |
| dau5w20 | 628 | 1467 | 1941 | 2378 | 2788 | 977 | 2.34 | 1.90 | 1.17 |
| dau5w30 | 640 | 2008 | 3507 | 5030 | 3787 | 1403 | 3.14 | 1.89 | 0.75 |
| dau5w40 | 609 | 2471 | 3309 | 4129 | 5018 | 1736 | 4.05 | 2.03 | 1.22 |
| dau5w50 | 600 | 2970 | 5209 | 7147 | 6112 | 2210 | 4.95 | 2.06 | 0.86 |
| dau7w20 | 1175 | 3194 | 4758 | 5122 | 5995 | 1344 | 2.72 | 1.88 | 1.17 |
| dau7w30 | 1170 | 3842 | 5987 | 6496 | 9493 | 1867 | 3.28 | 2.47 | 1.46 |
| dau7w40 | 1202 | 4791 | 7546 | 8194 | 10248 | 2406 | 3.99 | 2.14 | 1.25 |
| dau7w50 | 1185 | 6423 | 10023 | 11206 | 12804 | 3016 | 5.42 | 1.99 | 1.14 |
| max3w20 | 399 | 845 | 1655 | 2209 | 1602 | 840 | 2.12 | 1.89 | 0.72 |
| max3w30 | 386 | 1141 | 2198 | 2943 | 1946 | 1202 | 2.96 | 1.71 | 0.66 |
| max3w40 | 384 | 1402 | 2220 | 2829 | 2407 | 1556 | 3.66 | 1.72 | 0.85 |
| max3w50 | 384 | 1666 | 3397 | 4585 | 3229 | 1938 | 4.34 | 1.94 | 0.70 |
| max5w20 | 1028 | 2314 | 3711 | 4679 | 3891 | 1442 | 2.25 | 1.68 | 0.83 |
| max5w30 | 1003 | 3103 | 4123 | 5197 | 5427 | 2036 | 3.09 | 1.75 | 1.04 |
| max5w40 | 1018 | 3856 | 6361 | 8059 | 6964 | 2590 | 3.79 | 1.81 | 0.86 |
| max5w50 | 1003 | 4703 | 8144 | 10793 | 8718 | 3299 | 4.69 | 1.85 | 0.81 |
| max7w20 | 1951 | 4161 | 6827 | 7789 | 7500 | 2034 | 2.13 | 1.80 | 0.96 |
| max7w30 | 2037 | 6729 | 9913 | 10266 | 10817 | 2842 | 3.30 | 1.61 | 1.05 |
| max7w40 | 2004 | 6606 | 11598 | 13102 | 13744 | 3553 | 3.30 | 2.08 | 1.05 |
| max7w50 | 1978 | 10022 | 15537 | 16537 | 17022 | 4473 | 5.07 | 1.70 | 1.03 |

## Tổng hợp từng kịch bản — SAU

| kịch bản | Tím TV | Vàng TV | Vàng top-3 TB | Vàng tốt nhất | Đỏ TV | Đỏ thấp nhất | Vàng TV / Tím TV | Đỏ TV / Vàng TV | Đỏ TV / Vàng tốt nhất |
|---|---|---|---|---|---|---|---|---|---|
| dau3w20 | 234 | 589 | 1189 | 1892 | 1321 | 858 | 2.52 | 2.24 | 0.70 |
| dau3w30 | 198 | 815 | 1137 | 1344 | 2081 | 1210 | 4.11 | 2.55 | 1.55 |
| dau3w40 | 251 | 1002 | 1977 | 3071 | 2379 | 1555 | 4.00 | 2.38 | 0.77 |
| dau3w50 | 199 | 1251 | 2328 | 3479 | 2952 | 1904 | 6.27 | 2.36 | 0.85 |
| dau5w20 | 606 | 1447 | 1930 | 2402 | 3462 | 1386 | 2.39 | 2.39 | 1.44 |
| dau5w30 | 618 | 1953 | 3513 | 5030 | 4768 | 1939 | 3.16 | 2.44 | 0.95 |
| dau5w40 | 615 | 2506 | 3299 | 4113 | 6282 | 2593 | 4.07 | 2.51 | 1.53 |
| dau5w50 | 619 | 2983 | 5208 | 7147 | 7806 | 3182 | 4.82 | 2.62 | 1.09 |
| dau7w20 | 1214 | 3121 | 4708 | 5122 | 9353 | 1999 | 2.57 | 3.00 | 1.83 |
| dau7w30 | 1207 | 3842 | 5933 | 6345 | 12755 | 2759 | 3.18 | 3.32 | 2.01 |
| dau7w40 | 1198 | 4791 | 7423 | 8033 | 16881 | 3664 | 4.00 | 3.52 | 2.10 |
| dau7w50 | 1220 | 6300 | 10096 | 11206 | 21118 | 4513 | 5.17 | 3.35 | 1.88 |
| max3w20 | 399 | 825 | 2740 | 5456 | 2672 | 1435 | 2.07 | 3.24 | 0.49 |
| max3w30 | 386 | 1398 | 1868 | 2167 | 3741 | 2005 | 3.62 | 2.68 | 1.73 |
| max3w40 | 384 | 1402 | 3169 | 4841 | 4900 | 2563 | 3.66 | 3.49 | 1.01 |
| max3w50 | 384 | 1709 | 3721 | 5510 | 6207 | 3276 | 4.45 | 3.63 | 1.13 |
| max5w20 | 1023 | 2398 | 4058 | 5639 | 7752 | 2301 | 2.34 | 3.23 | 1.37 |
| max5w30 | 993 | 3186 | 4352 | 5304 | 10020 | 3363 | 3.21 | 3.14 | 1.89 |
| max5w40 | 953 | 4044 | 7419 | 10848 | 13057 | 4182 | 4.24 | 3.23 | 1.20 |
| max5w50 | 997 | 4870 | 6607 | 7994 | 16173 | 5231 | 4.88 | 3.32 | 2.02 |
| max7w20 | 1974 | 4829 | 11035 | 18367 | 19099 | 3316 | 2.45 | 3.96 | 1.04 |
| max7w30 | 2006 | 6460 | 10699 | 12602 | 25141 | 4678 | 3.22 | 3.89 | 1.99 |
| max7w40 | 1945 | 8154 | 12082 | 13021 | 31513 | 5839 | 4.19 | 3.86 | 2.42 |
| max7w50 | 1974 | 10227 | 16239 | 18002 | 38212 | 7198 | 5.18 | 3.74 | 2.12 |

## Từng ụ Vàng / Đỏ (trước → sau)

### dau3w30

| Bậc | Ụ | tốc trước → sau (phát/s) | chỉ số trước | chỉ số sau | × |
|---|---|---|---|---|---|
| Vàng | Prism Thief (`bienmau`) | 2.82 → 2.82 | 915 | 58789 | 64.26 |
| Vàng | Nemesis (`nemesis`) | 1.13 → 1.13 | 5584 | 5493 | 0.98 |
| Đỏ | Overlord (`overlord`) | 1.41 → 1.62 | 1946 | 3327 | 1.71 |
| Đỏ | Wyrm Engine (`ronglua`) | 5.00 → 5.75 | 2115 | 3017 | 1.43 |
| Đỏ | Black Hole (`blackhole`) | 1.00 → 1.15 | 1688 | 2221 | 1.32 |
| Đỏ | Hive Queen (`chuato`) | 1.00 → 1.15 | 1268 | 1941 | 1.53 |
| Đỏ | Arcane Cascade (`thacmana`) | 1.21 → 1.39 | 982 | 1362 | 1.39 |
| Vàng | Eclipse (`nhatthuc`) | 2.12 → 2.12 | 1381 | 1344 | 0.97 |
| Đỏ | Leviathan (`leviathan`) | 0.90 → 1.03 | 842 | 1210 | 1.44 |
| Vàng | Werewolf (`soi`) | 1.01 → 1.01 | 1150 | 1150 | 1.00 |
| Vàng | Quantum Choir (`hopca`) | 2.82 → 2.82 | 903 | 915 | 1.01 |
| Vàng | Fusion Archive (`luutru`) | 2.82 → 2.82 | 909 | 909 | 1.00 |
| Vàng | Ember Relay (`lualien`) | 2.26 → 2.26 | 942 | 892 | 0.95 |
| Vàng | Wall Projector (`wallgen`) | 1.20 → 1.20 | 795 | 815 | 1.02 |
| Vàng | Salvo Battery (`railgun`) | 0.71 → 0.71 | 658 | 658 | 1.00 |
| Vàng | Blood Circuit (`mauhut`) | 1.83 → 1.83 | 552 | 541 | 0.98 |
| Vàng | Hydra (`hydra`) | 1.21 → 1.21 | 532 | 513 | 0.97 |
| Vàng | Compass Cannon (`canon`) | 0.78 → 0.78 | 495 | 495 | 1.00 |
| Vàng | Nine-Tail (`cuuvi`) | 1.69 → 1.69 | 461 | 456 | 0.99 |
| Vàng | Star Cannon (`ngoisao`) | 1.55 → 1.55 | 430 | 430 | 1.00 |
| Vàng | Purifier (`aten`) | 1.21 → 1.21 | 377 | 377 | 1.00 |

### dau7w40

| Bậc | Ụ | tốc trước → sau (phát/s) | chỉ số trước | chỉ số sau | × |
|---|---|---|---|---|---|
| Vàng | Nemesis (`nemesis`) | 1.46 → 1.46 | 51281 | 55160 | 1.08 |
| Đỏ | Overlord (`overlord`) | 1.83 → 2.10 | 20073 | 27426 | 1.37 |
| Đỏ | Black Hole (`blackhole`) | 1.00 → 1.15 | 8082 | 22346 | 2.76 |
| Đỏ | Wyrm Engine (`ronglua`) | 5.00 → 5.75 | 12414 | 18023 | 1.45 |
| Đỏ | Hive Queen (`chuato`) | 1.00 → 1.15 | 12594 | 15739 | 1.25 |
| Đỏ | Arcane Cascade (`thacmana`) | 1.63 → 1.87 | 5699 | 8055 | 1.41 |
| Vàng | Eclipse (`nhatthuc`) | 2.75 → 2.75 | 8194 | 8033 | 0.98 |
| Vàng | Ember Relay (`lualien`) | 3.06 → 3.06 | 7436 | 7316 | 0.98 |
| Vàng | Hydra (`hydra`) | 1.63 → 1.63 | 7009 | 6921 | 0.99 |
| Vàng | Quantum Choir (`hopca`) | 4.16 → 4.16 | 6174 | 6013 | 0.97 |
| Vàng | Fusion Archive (`luutru`) | 3.66 → 3.66 | 5187 | 5349 | 1.03 |
| Vàng | Prism Thief (`bienmau`) | 3.66 → 3.66 | 5553 | 5310 | 0.96 |
| Vàng | Werewolf (`soi`) | 1.36 → 1.36 | 4791 | 4791 | 1.00 |
| Vàng | Wall Projector (`wallgen`) | 1.20 → 1.20 | 3944 | 3944 | 1.00 |
| Vàng | Salvo Battery (`railgun`) | 0.92 → 0.92 | 3917 | 3917 | 1.00 |
| Đỏ | Leviathan (`leviathan`) | 0.90 → 1.03 | 2406 | 3664 | 1.52 |
| Vàng | Compass Cannon (`canon`) | 1.01 → 1.01 | 3282 | 3282 | 1.00 |
| Vàng | Blood Circuit (`mauhut`) | 2.38 → 2.38 | 3005 | 3114 | 1.04 |
| Vàng | Star Cannon (`ngoisao`) | 2.01 → 2.01 | 2463 | 2463 | 1.00 |
| Vàng | Nine-Tail (`cuuvi`) | 2.20 → 2.20 | 1495 | 1480 | 0.99 |
| Vàng | Purifier (`aten`) | 1.63 → 1.63 | 1312 | 1312 | 1.00 |

### max5w30

| Bậc | Ụ | tốc trước → sau (phát/s) | chỉ số trước | chỉ số sau | × |
|---|---|---|---|---|---|
| Vàng | Nemesis (`nemesis`) | 1.50 → 1.50 | 23259 | 23698 | 1.02 |
| Đỏ | Overlord (`overlord`) | 1.81 → 2.20 | 7162 | 14356 | 2.00 |
| Đỏ | Hive Queen (`chuato`) | 1.12 → 1.36 | 6632 | 11077 | 1.67 |
| Đỏ | Wyrm Engine (`ronglua`) | 5.60 → 6.78 | 5838 | 11023 | 1.89 |
| Đỏ | Black Hole (`blackhole`) | 1.12 → 1.36 | 5017 | 9017 | 1.80 |
| Vàng | Eclipse (`nhatthuc`) | 2.82 → 2.82 | 5197 | 5304 | 1.02 |
| Đỏ | Arcane Cascade (`thacmana`) | 1.59 → 1.93 | 3138 | 4813 | 1.53 |
| Vàng | Werewolf (`soi`) | 1.37 → 1.37 | 3431 | 4140 | 1.21 |
| Vàng | Ember Relay (`lualien`) | 3.09 → 3.09 | 3741 | 3612 | 0.97 |
| Vàng | Hydra (`hydra`) | 1.65 → 1.65 | 3103 | 3547 | 1.14 |
| Đỏ | Leviathan (`leviathan`) | 1.01 → 1.22 | 2036 | 3363 | 1.65 |
| Vàng | Fusion Archive (`luutru`) | 3.76 → 3.76 | 3212 | 3250 | 1.01 |
| Vàng | Prism Thief (`bienmau`) | 3.76 → 3.76 | 3250 | 3190 | 0.98 |
| Vàng | Quantum Choir (`hopca`) | 3.76 → 3.76 | 3263 | 3186 | 0.98 |
| Vàng | Wall Projector (`wallgen`) | 1.39 → 1.39 | 2433 | 2324 | 0.96 |
| Vàng | Salvo Battery (`railgun`) | 0.94 → 0.94 | 2248 | 2248 | 1.00 |
| Vàng | Blood Circuit (`mauhut`) | 2.44 → 2.44 | 1892 | 1903 | 1.01 |
| Vàng | Compass Cannon (`canon`) | 1.03 → 1.03 | 1615 | 1615 | 1.00 |
| Vàng | Star Cannon (`ngoisao`) | 2.07 → 2.07 | 1512 | 1512 | 1.00 |
| Vàng | Nine-Tail (`cuuvi`) | 2.26 → 2.26 | 1268 | 1279 | 1.01 |
| Vàng | Purifier (`aten`) | 1.65 → 1.65 | 1082 | 1082 | 1.00 |

### max7w40

| Bậc | Ụ | tốc trước → sau (phát/s) | chỉ số trước | chỉ số sau | × |
|---|---|---|---|---|---|
| Vàng | Prism Thief (`bienmau`) | 4.25 → 4.25 | 8649 | 101698 | 11.76 |
| Vàng | Nemesis (`nemesis`) | 1.70 → 1.70 | 63984 | 63984 | 1.00 |
| Đỏ | Overlord (`overlord`) | 2.05 → 2.48 | 25945 | 41835 | 1.61 |
| Đỏ | Hive Queen (`chuato`) | 1.12 → 1.36 | 16724 | 37884 | 2.27 |
| Đỏ | Wyrm Engine (`ronglua`) | 5.60 → 6.78 | 15811 | 31714 | 2.01 |
| Đỏ | Black Hole (`blackhole`) | 1.12 → 1.36 | 11677 | 31313 | 2.68 |
| Đỏ | Arcane Cascade (`thacmana`) | 1.83 → 2.21 | 8462 | 13664 | 1.61 |
| Vàng | Eclipse (`nhatthuc`) | 3.18 → 3.18 | 13102 | 13021 | 0.99 |
| Vàng | Ember Relay (`lualien`) | 3.55 → 3.55 | 11837 | 11974 | 1.01 |
| Vàng | Hydra (`hydra`) | 1.89 → 1.89 | 9854 | 11250 | 1.14 |
| Vàng | Quantum Choir (`hopca`) | 4.83 → 4.83 | 9685 | 9404 | 0.97 |
| Vàng | Fusion Archive (`luutru`) | 4.25 → 4.25 | 8163 | 8277 | 1.01 |
| Vàng | Werewolf (`soi`) | 1.58 → 1.58 | 6606 | 8154 | 1.23 |
| Vàng | Salvo Battery (`railgun`) | 1.06 → 1.06 | 6061 | 6061 | 1.00 |
| Đỏ | Leviathan (`leviathan`) | 1.01 → 1.22 | 3553 | 5839 | 1.64 |
| Vàng | Wall Projector (`wallgen`) | 1.39 → 1.39 | 5400 | 5756 | 1.07 |
| Vàng | Compass Cannon (`canon`) | 1.17 → 1.17 | 5469 | 5469 | 1.00 |
| Vàng | Blood Circuit (`mauhut`) | 2.76 → 2.76 | 5007 | 5213 | 1.04 |
| Vàng | Star Cannon (`ngoisao`) | 2.34 → 2.34 | 4136 | 4136 | 1.00 |
| Vàng | Nine-Tail (`cuuvi`) | 2.55 → 2.55 | 2346 | 2364 | 1.01 |
| Vàng | Purifier (`aten`) | 1.89 → 1.89 | 2090 | 2090 | 1.00 |


## Kiểm tra

- `tools/thap-kt-tier.js`: thứ tự bậc giữ — trước White 1.02 < Blue 1.49 < Purple 1.68 < Gold 3.18 < Red 5.33; sau … Gold 3.07 < Red 5.66.
- `thap-kt-cong-ap` 31/31, `thap-kt-thac-mana` 32/32, `thap-kt-nguyen-tac` 52 ca, `thap-kt-khong-ban`, `thap-kt-cong-huong-luat`, `thap-kt-ban-sao-giu`, `thap-kt-ngau-nhien-sinh`, `thap-kt-ngoai-deck`: đạt.
- `thap-kt-vang-g2` (2 dòng ✗), `thap-kt-kynang-tx` (41), `thap-kt-kynang-vd` (lỗi chạy): **như trước sửa** (lỗi có sẵn).
- `thap-kt-vang-moi`: thêm 1 ✗ "Quantum Choir trong dải Vàng" — dải trên 4★ của bài này lấy từ ụ Vàng mạnh nhất trong 1 lần chạy (trước 5094 do Prism Thief ra dạng màu đơn, sau 1405) nên dao động theo RNG; Quantum Choir không đổi (1453 → 1466).
