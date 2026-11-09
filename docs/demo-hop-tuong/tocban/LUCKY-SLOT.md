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

## Tia theo ngưỡng (09/11, người dùng chốt 16:57)

*"có nhưng phải là khi cả 3 loại quả đạt ngưỡng bằng nhau thì mới cho bắn 2 tia, và ngưỡng tiếp theo bắn 3 tia"* — trước đó Lucky Slot chỉ bắn 1 xu vào quái đầu nên bộ Vàng + Lucky Slot dừng ~wave 40 dù chỉ số đơn mục tiêu ≈ Overlord.

**Luật** (`jackpot.js` `CB.TIA`, `CB.tia`, `CB.mucTieu`):
- `min(cam, dưa, nho)` điểm **quay được** (đúng số trên khay, KHÔNG tính 10 điểm có sẵn `KHOI` — tính cả thì mọi Lucky Slot vừa ra đã có 10, ngưỡng mất ý nghĩa "phải quay mới lên") **≥ 10 → 2 tia**, **≥ 20 → 3 tia**.
- Mỗi tia 1 xu vào 1 quái KHÁC NHAU: quái đầu + quái kế tiếp theo thứ tự đường (còn lại trên đường ít nhất; hoà → uid nhỏ). Ít quái hơn số tia → bắn ít tia hơn, không trùng. Không nổ lan.
- **Mỗi tia đủ sát thương** (`CB.TIA_ST = [1, 1, 1]`, = dmgU của ụ, chí mạng tính riêng từng tia).
- Tất định: số tia thuần theo `B.cb` (đã đồng bộ gói `cb` / ảnh chụp), chọn mục tiêu theo thứ tự đường — không RNG mới. Online 2 máy như nhau (test 2 máy cùng hạt → cùng chuỗi mục tiêu).
- Hình: huy hiệu xu `×2` (lam) / `×3` (tím) góc trên-trái thẻ khay (1 tia thì ẩn); mỗi loạt chớp 0,14 s các tia mảnh (PNG `tia_laser` nhuộm lam / tím) từ đầu nòng tới từng mục tiêu, xu nhuộm cùng màu. Clip skilldemo thêm 2 cảnh (8,2 s: 2 tia · 10,2 s: 3 tia).

**Chọn ngưỡng** — điểm quả THẤP NHẤT theo wave (bot SOLO, máu vô hạn, 16 trận mỗi bộ, script đo tạm như `tools/thap-sim-co-bac.js diem`):

| wave | min 3 quả — Vàng (trung vị / dải) | Thường | Máy Xèng trên bàn |
|---|---|---|---|
| 20 | 11 / 4–17 | 8 / 3–17 | 2.5–3.3 |
| 25 | 13 / 7–18 | 11 / 4–21 | 2.6 |
| 30 | 18 / 7–21 | 13 / 5–23 | 2.1–2.8 |
| 40 | 21 / 8–29 | 16 / 5–27 | 2.0–2.6 |
| 50 | 24 / 8–39 | 19 / 5–32 | 1.3–2.3 |

→ đạt 10 (2 tia): trung vị **wave 25** (cả 2 bộ, sớm nhất 15); đạt 20 (3 tia): bộ Vàng trung vị **wave 40** (11/16 trận), bộ Thường ít khi (6/16). Số tròn 10 / 20 dễ đọc trên khay.

**Kết quả SOLO bot** (AI game, cấp thẻ 0, tim thật, hạt 11–34 = 24 trận mỗi dòng):

| bộ | trước (1 tia) | sau (2–3 tia, đủ ST) | đối chứng |
|---|---|---|---|
| Vàng `cobac soi nhatthuc hasao cuongno` | TB 39.1 | **TB 52.9** | thay bằng Overlord 55.2 · Đỏ trung vị (6 Đỏ, hạt 11–22) 53.6: Hố Đen 49.3 · Chúa Tổ 42.3 · Overlord 52.6 · Arcane 54.6 · Rồng 55.1 · Thuỷ Quái 56.6 |
| Thường `cobac lien canon tia set` | TB 29.8 | **TB 34.9** | |

Số tia lúc wave 40 (bộ Vàng, hạt 11–22, trận còn sống): 1 / 2 / 3 tia = 0 / 6 / 4. Bộ Vàng + Lucky Slot nay ≈ trung vị Đỏ, vẫn dưới Overlord → giữ **đủ ST mỗi tia** (không cần giảm).

**Bài 24 s / 90 s** (`CB=10` / `CB=20 node tools/thap-do-vang-do.js … chi=cobac`; `CB_TIA=[1e9,1e9]` = tắt tia để so): đám đông ×2 / ×3, đơn mục tiêu giữ nguyên. Lucky Slot / Overlord (TB 4 wave, 3★–7★, LV đầu–max): 10 điểm 0.6–1.1× → **0.9–1.7×**; 20 điểm 0.9–1.6× → **1.4–2.9×** (90 s: 10 điểm 0.75–1.4× → 1.05–2.0×; 20 điểm 1.0–2.0× → 1.8–3.5×). Bài đo đặt sẵn điểm từ giây 0 nên thổi phồng: trong trận thật mức 3 tia chỉ tới ~wave 40, kết quả trận (bảng trên) vẫn dưới Overlord. Số thô: `ls-tia-{10,20}-{truoc,sau}[-90].json`.
