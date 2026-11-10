# Fusion Archive — luật DỒN ĐIỂM + đo cân bằng (10/11)

Người dùng chốt: (1) **"Chuyển điểm dồn hết"** — Archive bị đem GHÉP (rời bàn) → TOÀN BỘ điểm dồn sang Archive còn trên bàn có NHIỀU ĐIỂM NHẤT;
quá trần thì phần dư sang Archive kế tiếp; không còn Archive → mất. (2) *"nhớ cân bằng để sức mạnh nó ngang các con tướng vàng khác"*.

## Luật (thap/js/vangmoi1.js — `SKILLS.luutru.don` + bọc `ghep`)

- Đọc điểm 2 nguyên liệu TRƯỚC khi ghép; sau ghép chỉ tính Archive **thực sự rời bàn** (`B.t[X.o] !== X` hoặc không còn là Archive).
  Merge King +★ tại chỗ / Teleporter đổi chỗ: Archive vẫn ở bàn → giữ điểm, không nhân đôi.
- Nhận: Archive trên bàn (trừ 2 nguyên liệu, trừ Archive hoá đá), sắp **nhiều điểm trước, hoà → ô nhỏ hơn**; mỗi Archive lấp tới trần cấp thẻ (40/50/60/70), dư sang Archive kế.
- Ụ VỪA GHÉP RA là Archive mới (0 điểm) cũng là Archive còn trên bàn → nhận được.
- Chạy TRƯỚC "+1 điểm ghép thật cho 1 Archive ngẫu nhiên" (`nhan`, rngHat theo hạt trận + bàn + B.ghepN). Không Math.random → bàn con rối online chạy cùng `ghep` ra cùng kết quả.
- Kiểm: `node tools/thap-kt-luutru-don.js` (dồn đủ, tràn trần, hoà ô, không còn Archive, Archive mới nhận, Archive đá không nhận, Merge King không nhân đôi, 2 lần bot 120 s cùng hạt → cùng điểm).

## Đo (bot SOLO `tools/thap-do-cong-don.js song luutru`, EP=0.5, cấp thẻ 0, bộ luutru + soi, nhatthuc, hasao, cuongno)

Bot "dồn" (`chien=ky`) nay được ghép Archive với Archive khi bàn kẹt — 2 Archive ÍT điểm nhất trước (trước đây bot không bao giờ ghép Archive → luật dồn không có tác dụng).
Luật cũ đo bằng `SUA='SKILLS.luutru.don = () => {};'`, cùng hạt.

| nhóm | trận | wave TB cũ | wave TB mới |
|---|---|---|---|
| bot dồn (ky), hạt 1–8 | 8 | 33.5 | 33.6 |
| bot dồn (ky), hạt 9–32 | 24 | 35.5 | 34.3 |
| AI gốc (ai), hạt 1–16 | 16 | 32.0 | 34.9 |
| **gộp** | **48** | **34.0** | **34.4** |

Điểm Archive lớn nhất trên bàn (trung vị, bot dồn): w20 **7 → 34**, w30 **6 → 39** (cũ: Archive giữ điểm hay bị đem ghép → mất). ST thô cả bàn/s w30: 3 639 → 3 873 (+6%).

DPS 1 Archive (5★, wave 30, cấp 0, `node tools/thap-do-cong-don.js ban luutru`): 0 điểm 1 797 · 7 điểm 2 048 · 20 điểm 2 709 · 34 điểm 3 734 · 40 điểm 3 967.
So trung vị 12 ụ Tấn công Vàng khác (`thap-do-vang-do.js`, LV đầu, đo từ 0 stack): Archive 40 điểm ≈ 1.7–2.3× trung vị (hạng 2–5/13) — nhưng
Ember / La Bàn / Prism / Nemesis / Cửu Vĩ cũng đo ở 0 stack nên bảng này thiên về Archive; số quyết định là wave trụ được.

Độ nhạy (bot dồn, hạt 1–24, luật mới): mỗi điểm 1.5% → 34.4 · 2% (hiện tại) → 34.1 (32 trận) · 2.5% → 36.3.

## Kết luận — KHÔNG đổi số

Tham chiếu Vàng (bot EP=0.5, cấp 0, 8 trận): Ember ~38 · La Bàn 37.1 · Nemesis 37.0 · Hydra 34.0 · Salvo 33.3 · Prism 31.4 · Nine-Tail 31.0 · Eclipse 30.5 ·
Star Cannon 30.4 · Purifier 26.1 → **trung vị 32.4** (gộp cả Archive cũ 34: 33.3). Mục tiêu nhóm giữa 31–35.
Archive luật mới **34.4** (48 trận) ≈ cũ 34.0 — chênh +0.4 nhỏ hơn nhiễu (±0.7), nằm trong dải 31–35 (nửa trên, cùng Hydra / Salvo).
Luật dồn làm điểm 1 Archive lên cao hơn hẳn (34–40 thay 6–7) nhưng số Archive giữ trên bàn ít đi (ghép bớt) → sức cả bàn chỉ +6%.
Giữ nguyên: ST 24, tốc 2.0, +2% ST mỗi điểm, mốc 10/20/30/40/50/60/70, trần 40/50/60/70.
