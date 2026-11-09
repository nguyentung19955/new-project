# Cân bằng Lucky Slot / Máy Xèng (`cobac`, Đỏ Tấn công) — 09/11

Người dùng (16:16): *"ember về dame tốc đánh ok rồi, nhưng lại thấy lucky slot lại không ok, dù là tướng đỏ, nhưng chỉ số cộng thêm tốc đánh không bằng, mà chơi thì khó"*.

## Cách đo

- `tools/thap-do-vang-do.js` (như bảng Đỏ / Vàng `DO-VANG-DO.md` lần 2) nay nạp thêm `jackpot.js` → đo được Lucky Slot (trước đây tool **bỏ sót** Lucky Slot: thiếu file nên không có trong bảng Đỏ).
  Bài 24 s, 3★/5★/7★, cấp thẻ đầu (LV11) / max (LV17), wave 20–50, trung vị 3 hạt. Ụ đặt sẵn đã quay xong; ngăn quả đặt sẵn `[n, n, n]`:
  `CB=0` (vừa xuất hiện) · `CB=4` · `CB=8` · mặc định = **kỳ vọng theo wave** 13 / 18 / 23 / 25 điểm (w20 / 30 / 40 / 50).
- Điểm kỳ vọng: 16 trận SOLO bot (`tools/thap-sim-co-bac.js`, bộ 1/5 Thường `cobac lien canon tia set` + 1/5 Vàng `cobac soi nhatthuc hasao cuongno`, cấp thẻ 0):

| wave | Dưa hấu TB (Thường / Vàng) | ít nhất – nhiều nhất | số lần quay | Máy Xèng trên bàn |
|---|---|---|---|---|
| 20 | 11.6 / 14.4 | 5 – 19 | 17 / 21 | 2.3 |
| 30 | 16.0 / 20.5 | 8 – 29 | 25 / 32 | 1.8 – 3.1 |
| 40 | 18.5 / 26.6 | 8 – 37 | 29 / 42 | 2.0 – 3.6 |
| 50 | 19.0 / 30.6 | 8 – 42 | 30 / 50 | 1.5 – 2.8 |
| 12 (bộ Thường, 4 trận) | 4.3 điểm / quả | | 9 | 3.5 |

  Mỗi lần xuất hiện chỉ ≈ 1.7 điểm chia cho 3 quả (cặp 6/7 = +1 · jackpot 1/7 = +2 mỗi quả) → **Dưa hấu ≈ +0.57 điểm/lần quay ≈ +2 % tốc**. Bộ 1/5: ~1 lần quay / 17 s; cuối trận gần như ngừng (bàn đầy sao cao, ít triệu hồi mới).
- Bài dài 90 s (`T0=90 WAVE=20,30,40`) cho cùng kết luận.

## Chẩn đoán vì sao "khó"

1. **Nền yếu nhất Đỏ khi chưa có điểm**: 0 điểm = 0.63–0.95× Vàng tốt nhất (Đỏ trung vị 1.6–1.9×). Cần ≈ 8 điểm mỗi quả (≈ wave 15–20, bộ 1/5) mới bằng trung vị Đỏ.
2. **Tốc cộng thêm nhỏ**: +3.5 %/điểm Dưa hấu, có giảm dần → 4 điểm (≈ wave 12) chỉ +13 %; 13 điểm (wave 20) +39 %. Tốc 3★ lúc xuất hiện 1.62 phát/s **= Overlord**, thấp hơn Ember (Vàng, 0 lửa) 2.26 → "tốc đánh cộng thêm không bằng" là đúng.
3. **Phụ thuộc may rủi + số Máy Xèng**: cùng wave 20 Dưa hấu 5 → 19 điểm (×4); phải triệu hồi / ghép nhiều Máy Xèng mới tích được. Jackpot 1/7 không hiếm; ghép KHÔNG làm mất điểm (ngăn của bàn) — không phải nguyên nhân. Thời gian quay (không bắn) chỉ ≈ 4 % thời gian sống.
4. **Đường cong quá dốc**: cam (ST) × nho (ST chí mạng) nhân nhau, tuyến tính không trần → 25 điểm (wave 50) lại **3.2–5×** Vàng tốt nhất (hơn cả Overlord 2.2–3.2×). Yếu lúc đầu, quá mạnh cuối trận.

## Sửa (`thap/js/jackpot.js`, tất định, không RNG mới, không lan / tràn)

| | trước | sau |
|---|---|---|
| Điểm sẵn mỗi ngăn (`CB.KHOI`) — tính thêm vào mọi phép cộng, số trên khay vẫn là điểm quay được | 0 | **10** |
| Cam: ST / điểm | 5 % | **2.5 %** |
| Dưa hấu: tốc / điểm (giảm dần, trần +150 % giữ nguyên) | 3.5 % | **5 %** |
| Nho: ST chí mạng / điểm | 17 % | **6 %** |

→ Lucky Slot vừa quay xong (0 điểm) đã có +25 % ST · +42 % tốc · +60 % ST chí mạng; 13 điểm (wave 20): +58 % · +80 % · +138 % (trước +65 % · +39 % · +221 %).
Online 2 máy: `CB.gt` thuần theo `B.cb` (đã đồng bộ bằng gói `cb`) + hằng số → 2 máy giống nhau. Mô tả: "Every fruit starts with 10 bonus points" (+ vi.json "Mỗi loại quả có sẵn # điểm").

## Kết quả — Lucky Slot / Vàng tốt nhất (bài 24 s, trung bình 4 wave)

| ngăn quả | 3★ LV đầu | 5★ LV đầu | 7★ LV đầu | 3★ max | 5★ max | 7★ max |
|---|---|---|---|---|---|---|
| Đỏ trung vị (6 Đỏ khác, `do2-sau.json`) | 1.69 | 1.58 | 1.84 | 1.74 | 1.66 | 1.93 |
| **0 điểm** trước → sau | 0.95 → **1.67** | 0.70 → **1.23** | 0.68 → **1.24** | 0.82 → **1.69** | 0.65 → **1.28** | 0.63 → **1.26** |
| **4 điểm** (≈ wave 12) | 1.34 → **1.97** | 1.01 → **1.46** | 1.06 → **1.48** | 1.43 → **2.10** | 1.07 → **1.64** | 1.06 → **1.61** |
| **8 điểm** (vận đen wave 30–50) | 1.85 → **2.33** | 1.42 → **1.69** | 1.50 → **1.80** | 2.12 → **2.61** | 1.51 → **1.92** | 1.53 → **1.93** |
| **kỳ vọng** 13–25 điểm | 4.00 → **3.48** | 3.21 → **2.64** | 3.31 → **2.65** | 4.95 → **4.10** | 3.88 → **3.03** | 4.09 → **3.10** |

Bài 90 s: 0 điểm 0.71–0.96 → **1.25–1.84**; kỳ vọng 2.95–4.88 → **2.53–4.24** (Đỏ trung vị 90 s 2.0–2.4).

Tốc bắn (phát/s, `tocU`): 3★ LV đầu w20 — Lucky Slot 0 điểm 1.62 → **2.11**, kỳ vọng 2.07 → **2.55**; Ember (Vàng, 0 lửa) 2.26; Overlord 1.62; Arcane Cascade 1.39.
5★ max w30 — Lucky 0 điểm 2.20 → **2.91**, kỳ vọng 3.05 → **3.63**; Ember 3.09; Overlord 2.20.

So Vàng tốt nhất: vừa có (0 điểm) ≈ 1.25–1.7× (trước 0.63–0.95×, yếu nhất Đỏ sau Leviathan từ 0), wave 12 ≈ trung vị Đỏ, cuối trận ≈ ngang Overlord (Đỏ mạnh nhất) thay vì vượt xa.

## SOLO bot (AI game, cấp thẻ 0, tim thật, hạt 11–22)

| bộ | trước (12 trận) | sau |
|---|---|---|
| Thường (1/5) | TB 27.8 | TB 30.3 |
| Vàng (1/5) | TB 38.8 | TB 40.0 |

Đối chứng cùng hạt 11–16: thay Lucky Slot bằng Hive Queen (Thường) 22.8 · bằng Overlord (Vàng) 56.7. Thử cả `KHOI 40` (mạnh gấp nhiều lần) vẫn chỉ 30.5 / 40.2 → ở bộ Vàng, kết quả trận **không còn phụ thuộc chỉ số Lucky Slot**: Lucky Slot chỉ bắn 1 xu vào quái đầu (không lan, đúng ràng buộc) nên dư sát thương ở quái đầu trong khi Overlord khoẻ ở đám đông. Không tăng thêm chỉ số vì đơn mục tiêu đã ≈ Overlord; muốn bộ Vàng đi xa hơn cần đổi cơ chế (ngoài phạm vi).

Số thô: `ls-truoc-{0,4,8,KV}.json`, `ls-sau-{0,4,8,KV}.json` (chỉ Lucky Slot; gộp với `do2-sau.json` để so). Lệnh: `CB=0 node tools/thap-do-vang-do.js ra.json chi=cobac`.
