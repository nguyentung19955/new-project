# Kiểm kê âm thanh — Turret Merge (07/11/2026)

## Cách tạo âm hiện tại
- **100% tổng hợp Web Audio thời gian thực** (`thap/js/sound.js`, 816 dòng), không có file mẫu nào. Kỹ thuật: FM 2 toán tử, ring-mod, ồn lọc, bit-crush (WaveShaper ≈4 bit), "boom" (sub bão hoà), riser, hợp âm supersaw (stab), convolver vang 1.5 s, delay ping-pong, giọng robot formant ("WAVE", "WARNING").
- **Nhạc nền** `thap/js/nhac.js`: bộ tuần tự darksynth thích ứng (menu 120 BPM Rê thứ / trận 128 BPM Mi thứ / trùm Phrygian + kèn đồng + hợp xướng), lớp vào/ra theo cường độ (wave + số quái), stinger trùm/thắng/thua. Trống cũng tổng hợp vào AudioBuffer.
- **Chuỗi trộn**: bus vũ khí (`wpn`) → bus SFX → HPF 80 Hz + peak +2.5 dB @2.8 kHz → limiter (−9 dB, 14:1) → soft-clip tanh → master 0.92. Nhạc: bus nhạc → `duck` → cùng EQ/limiter.
- **Giới hạn**: mỗi âm có `LIM[k] = [khoảng cách tối thiểu ms, số giọng đồng thời]`; trần toàn cục 40 giọng, ≥26 giọng thì bỏ âm ưu tiên <2. Biến thể: 3 biến thể xoay vòng + lệch cao độ ±3–8 % cho vũ khí.
- **Ducking**: `duck(sâu, dài)` hạ nhạc; nếu sâu ≥0.3 hạ cả bus vũ khí (tối thiểu 0.35). Ghép 0.38, wave 0.55, trùm chết 0.75, thắng/thua 0.85, nổ lớn 0.2+0.45m.
- Âm lượng SFX/NHẠC riêng (localStorage), trang thử `index.html?sfxlab`.

## Bảng sự kiện
| Sự kiện (SND.*) | Khi nào (gọi từ) | Âm hiện tại | Tần suất/s wave đông (ước) | Vấn đề |
|---|---|---|---|---|
| `nut` | mọi nút UI (home 19, ui, kinhte-ui, dkkeo…) | blip sin 1.9k→1.25k + tick vuông | thấp | Không có âm "quay lại/đóng" riêng (`ui_back` thiếu) |
| `trieu` | bấm TRIỆU HỒI (ui.js) | quét bandpass lên + stab supersaw + boom nhỏ + lấp lánh, duck 0.2 | 1–3 (spam triệu) | 0.4 s, khá dày; spam liên tục mỏi tai (LIM 70 ms ×2) |
| `dat` | ụ đáp/khoá ô (ghepfx, skills) | servo whir + cạch + ping | 1–3 | ổn |
| `ghep(sao, xa)` | ghép 2 ụ (game.js:221, skills2/3) | 2 tông hội tụ → boom + stab, cao giọng theo sao 2–8, ≥4★ thêm lấp lánh | 0.5–2 | Chênh lệch giữa sao thấp/cao chưa rõ (chỉ dời bậc); không có tầng "merge cao" khác hẳn |
| `nang(lv)` / `lo` / `sao` | lên cấp thẻ, lộ kết quả ghép, mốc sao | arp vuông + stab + boom | thấp | `lo`, `sao` dùng lại `nang` → trùng tiếng |
| `thucTinh` / `hu` | thức tỉnh, **jackpot** (jackpot.js:68), Sói hú | sub 75→30 + arp răng cưa + ring-mod + boom 1.0, duck 0.6 | hiếm | **Jackpot và đột phá không có âm riêng** — mượn thức tỉnh |
| `trung` | mỗi phát trúng (game.js:329) | tick FM 20–25 ms | 10–30 (chặn còn ~11/s, LIM 90ms×2) | Dày nhất; cùng dải 2.7–3.6 kHz với crit, đạn |
| `crit` | trúng chí mạng | ping FM 3.2 kHz vút + bíp crush | 3–10 (chặn ~12/s) | Dễ chìm/lẫn với `trung` và họ đạn |
| `chet(trum)` | quái chết (game.js:356) | 3 bíp vuông crush + pop | 5–20 (chặn ~22/s) | Dày, gắt (crush) khi cả bầy chết |
| `chetTrum` | trùm chết | nổ kép + mảnh vụn + stab, duck 0.75 | hiếm | ổn |
| `canhBao` | trùm xuất hiện (ui.js:284) + stinger nhạc `trum` | còi 2 tông + BRAAM + giọng "WARNING" | hiếm | Chồng với stinger nhạc BRAAM cùng lúc → đục |
| `bao` / `chieuTrum(id)` | trùm báo/tung chiêu (trum.js, game.js) | bíp lên + boom, màu riêng 6 trùm | 0.2–0.5 | ổn |
| `wave(n, trum)` | bắt đầu wave (game.js:442/461) | riser 0.35 s → boom + stab + giọng "WAVE", duck 0.55 | 1/wave | Wave thường có giọng robot mỗi lần → mỏi tai sau 30 wave |
| *(wave clear)* | — | **không có** | — | Thiếu âm hết wave / phần thưởng |
| `lot` | quái lọt / mất mạng (game.js:681) | rè vuông trầm 2 nhịp | 0–2 | ổn |
| `ketThuc(thang)` | thắng/thua (game.js:873) | stinger nhạc (fanfare / tape-stop) + boom; nếu tắt nhạc thì SFX arp/hợp âm | 1 | ổn |
| Vũ khí `lien/tia/phao/set/bang/doc/nap/mana` → họ W: `dan, tia, phao, phong, laser, nl, bang, doc, set, can, trieu` | mỗi phát bắn (skills*.js, growfx, vangmoi1); họ chọn theo `G.dangBan.id` qua bảng `DOI` | 11 chữ ký, 3 biến thể/họ, bus `wpn` | đạn 15–24/s (LIM 42ms×4), còn lại 3–12/s | Tổng 40–80 âm/s trước giới hạn; chỉ có trần toàn cục, không ưu tiên theo khoảng cách/ô; **không có họ LỬA** (chỉ `gLua` ở growfx) |
| `laser()` tia liên tục | ụ laser giữ tia | 1 giọng drone dùng chung | liên tục | ổn (không chồng) |
| `no(m)` | nổ (skills 20+ chỗ) | đấm + crack + crush; m>0.8 thêm rền | 2–8 (LIM 65ms×4) | Nhiều nổ → nhiều duck chồng → bus vũ khí "bơm" |
| `rail/sam/hoden/mv/tua/hoLy/quay/combo/nay/tich/kinhVo` | kỹ năng đặc biệt từng ụ | riêng | thấp | — |
| `g*` (gNap, gKhoa, gVuot, gLua, gBang, …) | biến hình / đòn dạng mới (growfx, skills5) | ngắn, nhẹ | thấp–vừa | Âm thô hơn bộ chính |
| `hoTro` / `xich` | chạm ụ hỗ trợ, xích | blip hologram | thấp | Không có "xung hỗ trợ" khi buff kích hoạt |

## Lỗ hổng chính
1. Thiếu âm: **jackpot**, **đột phá (breakthrough)**, **hết wave**, **UI back/đóng**, **họ lửa**, **xung hỗ trợ**.
2. Dải 2–4 kHz quá chật khi đông: `trung` + `crit` + `dan` + `chet` cùng dải → crit không nổi.
3. Merge theo sao chỉ khác cao độ; nên có tầng rõ (1–3★ / cao / jackpot).
4. Duck chồng nhau từ nổ + ghép + wave → bơm nhịp khó chịu.
5. Âm tổng hợp trực tiếp tốn CPU (node/giọng) trên máy yếu; file mẫu ngắn có thể nhẹ hơn cho âm phát dày.
