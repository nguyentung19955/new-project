# Tóm tắt — tư vấn âm thanh Turret Merge (ChatGPT, 07/11/2026)

**Đã có gì:** ChatGPT tự tạo được file âm thanh bằng Python (numpy): **38 WAV** 32 kHz mono 16-bit, tổng 1.04 MB, ở `sfx/`. Nghe thử: mở `nghe-thu.html` (cùng thư mục). Chi tiết đo từng file: `SFX.md`. Nguyên văn tư vấn: `CHATGPT.md`. Kiểm kê âm hiện tại: `KIEM-KE.md`. **Chưa gắn vào game** — chờ người dùng duyệt.

## Bản sắc âm thanh
- "Máy móc nặng + mạch điện + phần thưởng có nhạc tính". Né sub-bass thuần (loa điện thoại mất < 180 Hz), né sóng vuông chói, đuôi dài, tiếng súng thật, giọng robot lặp.
- **Motif chữ ký Mi–Si–Sol** (E4→B4→G4, hợp Mi thứ của nhạc trận): dùng trong ghép, mốc sao, jackpot, hết wave, thắng — đổi quãng/tốc độ. Trùm thì ngược lại: nửa cung Fa/Mi, đi xuống.
- Chia dải tần: 180–550 Hz lực đấm · 550–1150 Hz bản sắc (ghép, crit, năng lượng — nghe rõ trên loa nhỏ) · 1.15–2 kHz UI · **2–4 kHz đang chật → cắt bớt** · 4.5–7 kHz chi tiết ngắn.

## Từng sự kiện (điểm mới chính)
- Ghép 1–3★: ngẫu nhiên `merge_1/2/3`; 4–5★ `merge_high`; 6–8★ `merge_ultra` (ChatGPT mô tả nhưng **không tạo file** — tạm dùng merge_high).
- **Jackpot** (2 lần motif đi lên lấp lánh) và **Đột phá** (nạp điện bậc thang → nổ) có âm riêng, khác hẳn nhau; không mượn "thức tỉnh" nữa. Jackpot trùng ghép → bỏ/giảm 6 dB tiếng ghép.
- Crit chuyển xuống 790→1620 Hz (tách khỏi dải súng); quái chết = 1 tiếng "pop" tròn, không 3 bíp gắt; thêm **hết wave**, **quay lại UI**, **họ lửa**, **xung hỗ trợ**.
- Bỏ giọng robot "WAVE" mỗi wave; trùm xuất hiện chỉ giữ MỘT BRAAM (SFX *hoặc* nhạc, không cả hai).

## Luật trộn
- Trần **24 giọng** (thay 40), 4 mức ưu tiên P0 (cảnh báo trùm, lọt quái) > P1 (jackpot, đột phá, ghép cao, thắng/thua) > P2 (triệu, ghép thường, vũ khí đặc trưng) > P3 (súng, trúng, crit, chết, nổ thường); đông thì cướp giọng P3 trước.
- Wave đông (60 yêu cầu/s): chỉ phát 10–14 phát bắn/s, 3–6 trúng/s, 2–4 chết/s, 3–6 crit/s; gộp phát bắn cùng họ trong 40–80 ms; > 3 quái chết trong 80 ms → 1 tiếng.
- Ducking tính bằng dB, **lấy mức lớn nhất, không cộng dồn**; nổ/trúng/bắn KHÔNG duck. Ví dụ: ghép thường −2 dB, jackpot −5 dB, trùm chết −7 dB.
- Lệch cao độ ±3–5 % vũ khí, ±2 % crit, ±1.5 % UI; không lệch motif/jackpot/thắng.
- Chuỗi tổng: bỏ boost +2.5 dB @2.8 kHz và bỏ limiter −9 dB + tanh mạnh; dùng nén nhẹ 3–4:1 + limiter true-peak −1 dBTP. Mục tiêu RMS sau gain theo nhóm (bảng trong `SFX.md`, cột gain gợi ý).

## Chất lượng file (Claude kiểm)
- 38/38 file trùng từng bit với zip ChatGPT (chạy lại script seed cố định, so SHA-256). Đỉnh −1 dBFS, không DC.
- 20 file có mẫu đầu/cuối ≠ 0 (lỗi thứ tự trong script) → đã fade lại 3 ms, hết nguy cơ lách tách.
- Âm khá "sạch/chiptune", trọng tâm trung tần → ít chói nhưng hơi mềm so với bộ Web Audio hiện tại, không vang/stereo; `merge_1/2/3` chỉ khác cao độ ±6 %. Cần người dùng nghe trên điện thoại thật.

## Đề xuất bước tiếp (chờ duyệt)
1. Nghe `nghe-thu.html` (bật "Gain gợi ý", thử "wave đông 5 s").
2. Nếu ưng: gắn trước jackpot, đột phá, hết wave, ui_back, họ lửa (đang thiếu hoàn toàn), giữ synth hiện tại cho phần còn lại; sau đó mới áp luật trần 24 giọng + duck lấy max.
