# Đo tốc bắn + DPS ụ Vàng / Đỏ (09/11)

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
