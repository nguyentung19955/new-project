# VFX P1 — CẢM GIÁC CHẠM (REVIEW-VFX-93 §II.A/B/D/E/F/G/I, §VI A–I, §VII, §VIII, §X P1)

Máy kiểm: Chromium hồ sơ iPhone 13 (390×844, DPR 3). Ảnh dải khung chụp bằng **đồng hồ ảo** (performance.now + rAF do kịch bản bước) → đúng mốc ms.
Chạy lại: `python3 -m http.server 8765 &` rồi `NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-p1.js` (env `CHI=summon,merge,invalid,star,crit,powerup,chest,ketthuc,busy,do`).
Cắt ảnh mới: `python3 tools/thap-cat-p1.py` (gỡ trộn nền magenta, ghi tên vào `CG.CO_ANH` + `KTA.khe`).

## Đã làm
| Mục | Trước | Sau | Ảnh |
|---|---|---|---|
| Triệu hồi (§VI.A) | 630 ms, ụ rơi từ trên xuống + rung màn mọi lần | ~390 ms: chớp ngắn tại ô → cổng hầm → ụ **trồi lên** từ hầm → viền màu bậc **chỉ XANH trở lên** (TRẮNG không viền); rung chỉ VÀNG/ĐỎ | p1_summon_canon / _kiembang / _aten |
| Ghép (§VI.B) | đầu súng mới lộ (405 ms) TRƯỚC dấu sao (490 ms) | **dấu sao mới đập xuống trước (380 ms)**, đầu súng ngẫu nhiên hiện sau (470 ms); ô hợp lệ sáng khi kéo, hút vào tâm, rung nhẹ: đã có | p1_merge, p1_merge_keo |
| Ghép sai (§VI.C) | bật về 340 ms (+ lắc 160 ms); ụ có thể treo giữa đường tới khung sau có "nguồn" | về ô **150 ms**, bệ **chớp đỏ 1 lần** (h2_vong_do 180 ms), lắc cục bộ ~100 ms, không rung màn; sửa lỗi treo (GF.capNhat chạy cả ở lớp cầm) | p1_invalid |
| Mốc 3/5/7★ (§VI.D, §II.G) | cùng 1 bùng sao vàng cho mọi mốc | 3★ = 3 tia (p1_sao3) · 5★ = vòng vàng 5 cung (p1_sao5) · 7★ = vương miện mảnh (p1_sao7) + 7 mảnh sao bắn ra lần lượt (p1_manh_sao, 45 ms/mảnh); tiếng cao dần 3→5→7; rung 3/5/7 khác nhau | p1_sao3 / p1_sao5 / p1_sao7 |
| Power-up (§VI.E) | thẻ bùng + vòng trên ụ cùng loại (đã có) | + **4 vạch nạp** trên thẻ (p1_vach_lv), vạch mới đầy dần theo màu khoá bộ bài, ~1 s rồi tắt (không thêm nhãn thường trực — QUY-TAC 7) | p1_powerup |
| Rương (§VI.H) | lắc 0,9 s → mở → lật 0,32 s/thẻ | 4 nhịp: chốt bật 0,28 s → khe sáng 0,28 s (VÀNG/THẦN 0,42 s, p1_ruong_khe) → nắp mở + bung → thẻ **bay ra từ rương** rồi lật 0,24 s/thẻ (thẻ đầu sớm hơn ~0,5 s) | p1_chest |
| Thua (§VI.I) | — | bàn chơi giảm bão hoà nhẹ (0,5 s) trong 0,9 s chờ màn kết quả, không nổ dài; vào trận mới trả lại | p1_thua |
| Chí mạng (§II.C) | chỉ số vàng to | + tia sắc nhỏ T2 tại điểm trúng (trần 1 lần/0,15 s mỗi ụ); đòn thường không có | p1_crit |
| Trần sáng / T4 (§II.D, §I) | trần alpha 0,82 từng dải | + trần chung theo số dải nổ cùng khung (>24 → giảm tới ×0,55); **≥ 2 dải T4 (Ø ≥ 140) cùng lúc → chỉ dải mới nhất sáng đủ**, còn lại ×0,55 (render.js gọi `CG.kA`) | p1_busy_full |
| Cài đặt (§VII, §I.10, §VIII.14) | chỉ POWER SAVE | SETTINGS: **EFFECTS Full / Balanced / Minimal** (hạt ×1 / ×0,62 / ×0,3, dải nổ 90 / 64 / 40, Minimal = bản triệu hồi/ghép gọn, 7★ chỉ vương miện) · **REDUCE FLASH** (chớp màn ×0,3, rung màn ×0,4, chớp ô ×0,4, trần sáng ×0,85) · **HAPTICS** bật/tắt (mọi `navigator.vibrate` của game; nút ẩn khi máy không hỗ trợ — iPhone Safari không có rung web). Không đổi sát thương / mục tiêu / nhịp / vùng; đạn lõi, cảnh báo trùm, trạng thái, vòng skill, kết quả ghép giữ nguyên | p1_busy_full vs p1_busy_gon |

Tỉa hạt dùng bộ đếm tất định (không thêm Math.random) → online lockstep không đổi. Không cấp phát mỗi khung (vạch power-up dùng 1 canvas/thẻ, chỉ chạy ~1 s).

## Đã có (không làm lại)
Vòng skill xanh chạy theo chiều kim đồng hồ · Evolver đếm bom + 7★ xịt + mất sao đếm lại · màn kết quả · tải 1 lần · thứ tự lớp vẽ §II.B (vật trên đường dưới quái, quái → ụ → đạn → FX → huy hiệu → HUD) · chớp nòng → đạn → trúng có trần cỡ/thời gian theo bậc (FX.no: thường ≤ 0,26 s, lớn ≤ 0,45 s, chiêu ≤ 0,65 s) · hình trúng riêng theo ụ (fxu.js) · số sát thương gộp theo quái 0,2 s · ô ghép được sáng khi kéo + sao kế tiếp (không lộ loại) · vòng power-up trên mọi ụ cùng loại · âm thanh tổng hợp (đã có tiếng triệu hồi / ghép / sao / sai / chí mạng — không thêm tệp âm).

## Chưa làm (ngoài phần P1 này / để phiên khác)
Cảnh thắng riêng cho PvP/Co-op; commander & 12 trùm (phiên boss — trumvfx.js); hit-stop; atlas kết cấu.

## Đo khung (bàn 15 ụ 7★ + 30 quái/làn, kỹ năng đỏ tự chạy, 600 khung × 2 lần)
JS mỗi khung `REN._viec` (ms, trung bình / p95). Máy đo vẽ canvas bằng CPU nên khoảng khung (~70 ms) không phải số thật của iPhone — chỉ so JS.

| Bản | lần 1 | lần 2 |
|---|---|---|
| GỐC (trước P1) | 3,35 / 7,3 | 3,47 / 8,0 |
| Full | 3,48 / 7,4 | 3,59 / 8,0 |
| Balanced | 3,46 / 7,3 | 3,44 / 7,8 |
| Minimal | 3,34 / 6,9 | 3,45 / 7,6 |

p95 không tệ hơn; trung bình Full +0,1 ms (≈ dao động máy đo); Minimal ≤ bản gốc. Số liệu: `do-khung.json`.

## Ghi chú
- 404 `trum_patcher.png` khi chạy trận (không thuộc P1 — ảnh trùm chưa có).
