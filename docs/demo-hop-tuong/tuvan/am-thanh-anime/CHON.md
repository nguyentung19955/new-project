# CHỌN — bộ SFX anime / hào hùng đã gắn vào Turret Merge (08/11/2026)

Người dùng (23:44): "bạn quyết định âm thanh". Claude không nghe được nên chọn bằng **tiêu chí đo** (numpy trên bản giải mã 44.1 kHz mono của 75 file `sfx/*.ogg`), rồi mã hoá bản chọn sang **MP3 mono 96 kbps 44.1 kHz** (iOS Safari không phát OGG) ở `thap/assets/sfx/<sự-kiện>.mp3` — 25 file, **406 KB**.

## Tiêu chí
- **Âm phát dày** (bắn, trúng/chết, crit, nổ, UI): ngắn (< 0.6 s, file dài hơn được cắt + fade 100 ms), tấn công không quá cứng, phổ tầm trung (loa điện thoại mất < 200 Hz, dải 2–5 kHz đang chật/chói), độ biến thiên độ to thấp, không lách tách đầu file.
- **Khoảnh khắc lớn hiếm** (trùm ra/gục, đột phá, jackpot, thắng/thua, ghép sao cao): bản nhiều lớp (mix) nhất, đuôi rõ.
- Ngang nhau thì ưu tiên **CC0** hơn CC BY.
- Cột đo: `dài` (s) · `atk` = ms từ lúc bắt đầu tới đỉnh đường bao · `đuôi` = s từ đỉnh tới −30 dB · `bt` = độ lệch chuẩn độ to (dB) · `f̄` = trọng tâm phổ (Hz) · `<200` / `0.2–2k` / `2–5k` / `>7k` = tỉ lệ năng lượng theo dải · `click` = bước nhảy mẫu lớn nhất trong 3 ms đầu / RMS (> 1.5 = nguy cơ "tách").

## Bản chọn

| Sự kiện | Chọn | Gọi từ (SND.*) | Đo bản chọn | Vì sao (so với bản bỏ) | Giấy phép |
|---|---|---|---|---|---|
| Bắn súng/pháo | **c** → 0.55 s | `W.dan` · `W.tia` (×1.1) · `W.phao` (×0.86) · `W.phong` (×0.95) | 0.7 s, atk 20, 0.2–2k **0.74**, 2–5k 0.05 | Tầm trung nhiều nhất, ít trầm (a/b 31–43 % < 200 Hz), ngắn nhất | CC0 |
| Bắn năng lượng | **a** | `W.laser` (×1.08) · `W.nl` (×0.92) | 0.39 s, đuôi 0.07, crest 14.5 | Ngắn nhất; b = sub 181 Hz (mất trên loa nhỏ); c chói hơn (2–5k+>7k 0.62) | CC0 (mix) |
| Bắn băng | **c** → 0.55 s | `W.bang` | bt 4.4 (thấp nhất), 2–5k 0.27 | a chói 0.59, b chói 0.77 + click 3.4 | CC0 |
| Bắn lửa (họ MỚI) | **a** → 0.6 s | `W.lua` / `gLua` (dạng lửa Grow-up) | atk 60, 2–5k 0.23 | c hỏng (99 % < 200 Hz, f̄ 21 Hz); b tấn công chậm 440 ms | CC0 |
| Bắn độc | **a** | `W.doc` | 0.57 s, 0.2–2k 0.51, 2–5k 0.15, ùng ục 7 nhịp | b chói 0.46; c nặng trầm 46 % | CC0 |
| Bắn sét | **b** → 0.6 s | `W.set` | 0.2–2k 0.40, click 0.02 | a click 1.67 + 70 % trầm; c 81 % trầm + click 0.9 | CC0 |
| Cận chiến | **b** → 0.5 s | `W.can` | atk 20, >7k 0.43 | a xì 76 % > 7 kHz, vút chậm; c click 8.2 (+ CC BY) | CC0 |
| Hạ quái | **c** | `chet()` | **0.26 s** (ngắn nhất), không chói | b keng kim loại 60 % > 7 kHz (mỏi tai khi cả bầy chết); a CC BY | CC0 |
| Chí mạng | **a** → 0.6 s | `crit()` | 0.7 s, atk 90, crest 13.9 (đấm chắc) | b 1.2 s + click 1.6; c keng 64 % > 7 kHz, nhỏ −20 dB | CC BY (mix) |
| Nổ | **b** → 0.8 s | `no(m)` (to theo m) | 2–5k **0.00**, bt 4.9, click 0 | a chói hơn; c 1.8 s quá dài cho âm 2–8 lần/s | CC0 |
| UI chạm | **b** | `nut()` | 0.46 s, atk 170 (mềm) | c chói 0.73; a 0.8 s dài | CC BY |
| UI quay lại | **b** | `nut()` khi chạm nút đóng/quay lại (`hm-dong`, `*-ve`, `tiep`, aria Close…) | 0.38 s, bt 3.9 | c quá nhỏ (−30.7 dB, crest 26.7); a xì 62 % > 7 kHz. Cùng họ "Metal" với UI chạm | CC BY |
| Triệu hồi | **b** → 1.2 s | `trieu()` | 0.2–2k **0.96** | c gần như toàn sub (99 % < 200 Hz); a 2.2 s CC BY | CC0 |
| Hợp tướng thường | **b** | `ghep(sao < 4)` | 0.61 s, bt **3.5** (đều nhất) | c toàn sub; a 1.45 s CC BY | CC0 |
| Hỗ trợ (xung buff) | **a** | `hoTro()` / `xich` | sạch, click 0.06 | b click 10 (tách rõ); c chói 0.46 + atk 720 | CC BY |
| Bắt đầu đợt | **b** → 1.5 s | `wave(n, trum)` | ngắn nhất (mỗi wave 1 lần × 30 wave → chống mỏi) | a 2.6 s CC BY, atk 1.7 s; c 2.6 s | CC0 |
| Xong đợt (MỚI) | **a** | `xongDot()` — `game.js` khi sân sạch quái | 0.74 s ngắn, jingle | b/c 1.5–2 s quá dài cho nhịp 1.2 s giữa 2 wave | CC0 |
| Hợp tướng sao cao | **b** | `ghep(sao ≥ 4)` · `sao()` | mix 2 lớp, đuôi 1.45 s | c ngắn 0.93 s ít "hoành tráng"; a CC BY | CC0 (mix) |
| Đột phá | **a** | `thucTinh()` (thức tỉnh / ace / hú) | mix 3 lớp (riser + slam + kèn), 0.2–2k **0.75**, đuôi 2.46 s | c CC0 nhưng 68 % trầm (mất trên loa nhỏ); b 1 lớp | CC BY (mix) |
| Jackpot | **a** | `jackpot()` — `jackpot.js` (trước mượn thức tỉnh) | mix kèn chiến thắng + xu, đuôi 1.5 s | b ngắn 1.68 s, 73 % trầm; c 1 lớp | CC BY (mix) |
| Trùm xuất hiện | **b** | `canhBao()` | mix kim loại + gầm, đuôi 1.64 s | a 1 lớp trống; c CC BY tiếng cười | CC0 (mix) |
| Trùm tung kỹ năng | **c** | `chieuTrum(id)` | 1.36 s (ngắn nhất, lặp 0.2–0.5/s), tầm trung 0.61 | a click 2.85; b 3 s CC BY | CC0 (mix) |
| Trùm gục ngã | **b** | `chetTrum()` / `chet(true)` | mix, crest 23 (đấm mạnh), đuôi 2 s | a 99 % trầm 4 s; c CC BY | CC0 (mix) |
| Thắng | **b** | `ketThuc(true)` | 3.64 s, bt 3.6 | a 5.66 s quá dài; c = cùng gốc với jackpot-a → trùng tiếng | CC BY |
| Thua | **a** | `ketThuc(false)` | 2.81 s (ngắn nhất) | b/c 3.7–5.3 s | CC BY |

**CC BY 4.0 dùng thật:** 8 file, tất cả từ *Oculus Audio Pack 01* (Oculus VR, LLC) — chí mạng, UI chạm, UI quay lại, hỗ trợ, đột phá, jackpot, thắng, thua → ghi công ở **Cài đặt → GHI CÔNG / CREDITS** (EN + VI). Nguồn CC0 khác cũng được liệt kê tên (không bắt buộc).

## Mã hoá
- `atrim` (giới hạn dài cột trên) + fade-in 2 ms + fade-out 10 ms (100 ms nếu bị cắt) → không lách tách; trộn về mono; đỉnh sau giải mã ≤ −1.5 dBFS (tự hạ nếu MP3 vượt). Công cụ: lệnh ffmpeg `libmp3lame -b:a 96k -ac 1 -ar 44100`.
- Độ to: gain khi phát (bảng `MAU` trong `thap/js/sound.js`) đưa RMS về đích theo nhóm (theo tư vấn `../am-thanh/SFX.md`, neo sự kiện lớn ngang synth cũ): bắn −29 (súng −28), hạ quái −31, crit −26, nổ −25, UI −25, triệu hồi −21, hỗ trợ −25, bắt đầu đợt −20, xong đợt −22, ghép −18, ghép cao −16, kỹ năng trùm −19, đột phá/jackpot/trùm ra/trùm gục/thắng/thua −15 dBFS.

## Luật trộn đã áp (`thap/js/sound.js` v4)
- Mẫu phát trước, **synth cũ giữ làm dự phòng** khi mẫu chưa nạp/lỗi. `?nomau` = tắt mẫu (so sánh).
- Nạp: `fetch` sớm lúc trang rảnh (1.2 s sau `load`) → `decodeAudioData` (cả dạng callback cho Safari cũ) ngay khi có AudioContext (lần chạm đầu). Mở khoá chỉ ở sự kiện có quyền phát: chạm = `touchend`/`pointerup`, chuột = `mousedown`, phím (bỏ Shift/Ctrl/Alt/Meta) — không tạo context ở `pointerdown` cảm ứng (bị chặn trên iOS/Android).
- Đi qua bus SFX (bắn: bus `wpn`) → theo nút SFX, thanh âm lượng SFX, tắt là im.
- **Trần 24 giọng** toàn cục (synth + mẫu, trước là 40); ≥ 18 giọng thì bỏ âm ưu tiên thấp. **4 mức ưu tiên**: P0 trùm xuất hiện · P1 đột phá, jackpot, ghép cao, kỹ năng/gục trùm, thắng/thua · P2 triệu hồi, ghép, hỗ trợ, UI, đầu/cuối đợt · P3 bắn, chết, crit, nổ. Đầy thì P0–P1 **cướp giọng P3** cũ nhất (fade 30 ms).
- Giới hạn từng sự kiện [cách tối thiểu ms, số giọng]: bắn 70–90 / 2–3 mỗi họ + **cả nhóm bắn 60 ms / 6 giọng** (≤ ~16 phát/s); hạ quái 220 / 2 (≈ 4/s); crit 180 / 2; nổ 120 / 3; UI 40; ghép 90 / 2; triệu hồi 110 / 2; sự kiện lớn 300–3000 / 1. Tiếng trúng (`trung`, synth) 90 → 160 ms.
- **Lệch cao độ** ±4–5 % bắn/chết, ±3 % nổ, ±2 % crit/ghép/triệu hồi, ±1.5 % UI; không lệch jackpot/đột phá/thắng/thua/trùm.
- **Né nhạc tính bằng dB, lấy mức SÂU NHẤT** đang hiệu lực (không cộng dồn, không "bơm"): ghép −2, xong đợt −2, bắt đầu đợt −3, kỹ năng trùm −3, ghép cao −4, đột phá/jackpot −5, trùm ra/gục −7, thắng/thua −9 dB. **Bắn/trúng/chết/nổ thường không né** (nổ synth chỉ né khi m > 0.8).
- Bỏ giọng robot **"WAVE"** mỗi wave. Trùm: **1 BRAAM** — có mẫu trùm xuất hiện thì bỏ stinger BRAAM của nhạc.
- Chuỗi tổng: bỏ nhấn +2.5 dB @2.8 kHz, bỏ limiter −9 dB 14:1 + soft-clip tanh → nén 3.5:1 (−12 dB) + bù +2.3 dB + limiter 20:1 trần −2 dB (độ to nhạc/sự kiện lớn đo lại bằng bản cũ).

## Kiểm tra
- `tools/thap-kt-am-thanh.js`: nạp 25/25, ánh xạ 25 sự kiện, giới hạn giọng (dồn ~1 400 yêu cầu/s), tắt SFX, `?nomau` dự phòng, trận 60 s 390×844 (15 ụ, wave 16→20) xen kẽ mẫu/synth mỗi 10 s cùng 1 trận.
- Ảnh: `anh/cai-dat-390x844.jpg`, `anh/ghi-cong-390x844.jpg`.
