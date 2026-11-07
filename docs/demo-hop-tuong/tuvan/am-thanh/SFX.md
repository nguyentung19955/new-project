# Bộ SFX do ChatGPT tạo — kiểm tra từng file (07/11/2026)

**Nguồn:** ChatGPT (chế độ suy nghĩ High, công cụ Python) tự tổng hợp bằng numpy rồi trả về `turret_merge_sfx.zip` (877 KB). Script gốc: `turret_merge_sfx_generator.py` (lấy nguyên từ zip, seed cố định 260711).
**Chuyển về repo:** không tải file zip qua trình duyệt được (công cụ trình duyệt không chuyển được dữ liệu nhị phân ra ngoài), nên chạy lại chính script đó ở máy (python3 + numpy 2.5.3) rồi **so SHA-256 từng WAV với bản trong zip của ChatGPT: 38/38 trùng khớp từng bit** → đây đúng là file ChatGPT tạo.
**Sửa nhỏ sau kiểm tra:** script trừ DC *sau* bước fade nên 20/38 file có mẫu đầu/cuối ≠ 0 (lớn nhất `shot_cannon` cuối = 0.0134 ≈ −37 dBFS → có thể lách tách nhẹ). Đã fade lại 3 ms + đặt mẫu đầu/cuối = 0 + giữ đỉnh −1 dBFS cho 20 file đó: boss_down, breakthrough, jackpot, kill_small, level_up, lose, merge_1/2/3, merge_high, shot_cannon, shot_explosion, shot_gatling, shot_poison, shot_summoner, star_milestone, summon, wave_clear, wave_start, win.

**Tổng:** 38 file WAV, 32 kHz mono PCM 16-bit, 1.04 MB (yêu cầu < 20 MB). Mọi file đỉnh −1.00 dBFS, DC < 0.001, mẫu đầu/cuối = 0.
**Độ to:** file được chuẩn hoá theo ĐỈNH (−1 dBFS) nên RMS chênh nhau (−9 … −18.5 dBFS) — đúng ý ChatGPT: độ to đồng đều đạt bằng **gain khi phát** theo nhóm (cột cuối, tính = RMS đích theo bảng mục 5 của ChatGPT − RMS file). Không nén/ép RMS vào file để giữ độ "đấm" (transient). Trang `nghe-thu.html` có nút "Nghe theo gain gợi ý" để nghe cân bằng thật.

**Thiếu so với lời ChatGPT:** ChatGPT nói 39 file và có `merge_ultra` (ghép 6–8★) nhưng script/zip KHÔNG có file này (chỉ 38). Tạm dùng `merge_high` hoặc nhờ làm thêm.

| File | Dài (ms) | Định dạng | Đỉnh (dBFS) | RMS cả file (dBFS) | RMS 50 ms lớn nhất | Mẫu đầu/cuối | Dung lượng | Nhóm → RMS đích | Gain gợi ý khi phát |
|---|---:|---|---:|---:|---:|---|---:|---|---:|
| `boss_down.wav` | 1300 | 32 kHz mono 16-bit | -1.00 | -16.4 | -8.6 | 0 (sạch) | 81.3 KB | trùm/kết → -22 | -5.6 dB |
| `boss_intro.wav` | 1000 | 32 kHz mono 16-bit | -1.00 | -15.5 | -9.9 | 0 (sạch) | 62.5 KB | trùm/kết → -22 | -6.5 dB |
| `boss_skill.wav` | 690 | 32 kHz mono 16-bit | -1.00 | -15.3 | -10.1 | 0 (sạch) | 43.2 KB | trùm/kết → -22 | -6.7 dB |
| `breakthrough.wav` | 900 | 32 kHz mono 16-bit | -1.00 | -18.0 | -9.2 | 0 (sạch) | 56.3 KB | thưởng lớn → -19.5 | -1.5 dB |
| `crit.wav` | 170 | 32 kHz mono 16-bit | -1.00 | -11.1 | -7.5 | 0 (sạch) | 10.7 KB | crit → -27 | -15.9 dB |
| `hit_light.wav` | 60 | 32 kHz mono 16-bit | -1.00 | -13.0 | -12.2 | 0 (sạch) | 3.8 KB | hit/kill/gun → -32 | -19.0 dB |
| `jackpot.wav` | 990 | 32 kHz mono 16-bit | -1.00 | -17.7 | -10.6 | 0 (sạch) | 61.9 KB | thưởng lớn → -19.5 | -1.8 dB |
| `kill_small.wav` | 130 | 32 kHz mono 16-bit | -1.00 | -15.8 | -12.1 | 0 (sạch) | 8.2 KB | hit/kill/gun → -32 | -16.2 dB |
| `level_up.wav` | 470 | 32 kHz mono 16-bit | -1.00 | -14.7 | -10.4 | 0 (sạch) | 29.4 KB | tiến trình → -23 | -8.3 dB |
| `lose.wav` | 870 | 32 kHz mono 16-bit | -1.00 | -10.3 | -5.7 | 0 (sạch) | 54.4 KB | trùm/kết → -22 | -11.7 dB |
| `merge_1.wav` | 480 | 32 kHz mono 16-bit | -1.00 | -13.2 | -9.1 | 0 (sạch) | 30.0 KB | ghép → -22 | -8.8 dB |
| `merge_2.wav` | 480 | 32 kHz mono 16-bit | -1.00 | -13.6 | -8.8 | 0 (sạch) | 30.0 KB | ghép → -22 | -8.4 dB |
| `merge_3.wav` | 480 | 32 kHz mono 16-bit | -1.00 | -15.3 | -10.1 | 0 (sạch) | 30.0 KB | ghép → -22 | -6.7 dB |
| `merge_high.wav` | 820 | 32 kHz mono 16-bit | -1.00 | -15.2 | -9.0 | 0 (sạch) | 51.3 KB | ghép cao → -21 | -5.8 dB |
| `place_lock.wav` | 280 | 32 kHz mono 16-bit | -1.00 | -14.3 | -10.8 | 0 (sạch) | 17.5 KB | triệu/đặt → -25 | -10.7 dB |
| `reveal.wav` | 420 | 32 kHz mono 16-bit | -1.00 | -13.7 | -9.7 | 0 (sạch) | 26.3 KB | tiến trình → -23 | -9.3 dB |
| `shot_cannon.wav` | 340 | 32 kHz mono 16-bit | -1.00 | -13.4 | -7.4 | 0 (sạch) | 21.3 KB | vũ khí lớn → -26 | -12.6 dB |
| `shot_energy.wav` | 250 | 32 kHz mono 16-bit | -1.00 | -12.0 | -7.0 | 0 (sạch) | 15.7 KB | vũ khí → -29.5 | -17.5 dB |
| `shot_explosion.wav` | 380 | 32 kHz mono 16-bit | -1.00 | -16.5 | -10.4 | 0 (sạch) | 23.8 KB | vũ khí lớn → -26 | -9.5 dB |
| `shot_fire.wav` | 270 | 32 kHz mono 16-bit | -1.00 | -14.8 | -9.8 | 0 (sạch) | 16.9 KB | vũ khí → -29.5 | -14.7 dB |
| `shot_frost.wav` | 220 | 32 kHz mono 16-bit | -1.00 | -13.3 | -9.2 | 0 (sạch) | 13.8 KB | vũ khí → -29.5 | -16.2 dB |
| `shot_gatling.wav` | 73 | 32 kHz mono 16-bit | -1.00 | -13.7 | -12.1 | 0 (sạch) | 4.6 KB | hit/kill/gun → -32 | -18.3 dB |
| `shot_gun.wav` | 82 | 32 kHz mono 16-bit | -1.00 | -15.2 | -13.1 | 0 (sạch) | 5.2 KB | hit/kill/gun → -32 | -16.8 dB |
| `shot_laser.wav` | 180 | 32 kHz mono 16-bit | -1.00 | -12.2 | -7.9 | 0 (sạch) | 11.3 KB | vũ khí → -29.5 | -17.3 dB |
| `shot_launcher.wav` | 340 | 32 kHz mono 16-bit | -1.00 | -14.3 | -9.7 | 0 (sạch) | 21.3 KB | vũ khí lớn → -26 | -11.7 dB |
| `shot_lightning.wav` | 200 | 32 kHz mono 16-bit | -1.00 | -18.5 | -14.5 | 0 (sạch) | 12.5 KB | vũ khí → -29.5 | -11.0 dB |
| `shot_melee.wav` | 180 | 32 kHz mono 16-bit | -1.00 | -16.4 | -12.8 | 0 (sạch) | 11.3 KB | vũ khí → -29.5 | -13.1 dB |
| `shot_poison.wav` | 300 | 32 kHz mono 16-bit | -1.00 | -12.4 | -7.7 | 0 (sạch) | 18.8 KB | vũ khí → -29.5 | -17.1 dB |
| `shot_sniper.wav` | 190 | 32 kHz mono 16-bit | -1.00 | -18.1 | -12.7 | 0 (sạch) | 11.9 KB | vũ khí → -29.5 | -11.4 dB |
| `shot_summoner.wav` | 310 | 32 kHz mono 16-bit | -1.00 | -11.7 | -7.3 | 0 (sạch) | 19.4 KB | vũ khí → -29.5 | -17.8 dB |
| `star_milestone.wav` | 700 | 32 kHz mono 16-bit | -1.00 | -16.3 | -9.5 | 0 (sạch) | 43.8 KB | tiến trình → -23 | -6.7 dB |
| `summon.wav` | 400 | 32 kHz mono 16-bit | -1.00 | -13.0 | -9.7 | 0 (sạch) | 25.0 KB | triệu/đặt → -25 | -12.0 dB |
| `support_pulse.wav` | 440 | 32 kHz mono 16-bit | -1.00 | -10.4 | -5.6 | 0 (sạch) | 27.5 KB | wave/hỗ trợ → -26 | -15.6 dB |
| `ui_back.wav` | 150 | 32 kHz mono 16-bit | -1.00 | -9.1 | -5.2 | 0 (sạch) | 9.4 KB | UI → -24 | -14.9 dB |
| `ui_tap.wav` | 90 | 32 kHz mono 16-bit | -1.00 | -10.1 | -7.7 | 0 (sạch) | 5.7 KB | UI → -24 | -13.9 dB |
| `wave_clear.wav` | 520 | 32 kHz mono 16-bit | -1.00 | -11.4 | -8.5 | 0 (sạch) | 32.5 KB | wave/hỗ trợ → -26 | -14.6 dB |
| `wave_start.wav` | 720 | 32 kHz mono 16-bit | -1.00 | -15.0 | -8.8 | 0 (sạch) | 45.0 KB | wave/hỗ trợ → -26 | -11.0 dB |
| `win.wav` | 1120 | 32 kHz mono 16-bit | -1.00 | -13.5 | -8.0 | 0 (sạch) | 70.0 KB | trùm/kết → -22 | -8.5 dB |


## Nhận xét (đo + đọc script; Claude không nghe được bằng tai — cần người dùng nghe thử)
- Thời lượng hợp lý cho mobile: bắn 73–340 ms, ghép 480–820 ms, sự kiện lớn ≤ 1.3 s.
- Trọng tâm phổ nằm 180 Hz–1.6 kHz (ChatGPT cố ý né dải 2.7–3.6 kHz đang chật) → nghe được trên loa điện thoại, ít chói hơn bộ Web Audio hiện tại; đổi lại hơi "mềm/đục" so với bộ hiện tại, không có vang/stereo.
- Tổng hợp đơn giản (sin/tri/saw cộng hài + ồn lọc trung bình trượt) nên chất âm "chiptune/8-bit sạch" hơn là "cyber điện ảnh"; `merge_1/2/3` chỉ khác cao độ ±6 % (ChatGPT gọi là biến thể).
- `shot_lightning`, `shot_sniper` RMS thấp (nhọn, ngắn) — cần gain dương hơn nhóm.
