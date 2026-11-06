# Star Cannon (ngoisao) — luật mốc sao (06/11/2026)

Người dùng: "mỗi 10× sao phải tăng tốc đánh, đến 50× thì tăng dame, 60× lại tăng tốc đánh, 100× thì tăng dame".

**n = tổng ★ của mọi ụ trên bàn của chủ ụ** (như cũ). Mốc mỗi 10 sao:

- **Mốc SÁT THƯƠNG** = bội 50 (50, 100, 150…)
- **Mốc TỐC** = các bội 10 còn lại (10, 20, 30, 40, 60, 70, 80, 90, 110…)

Công thức (`SKILLS.ngoisao.luat(n)` trong `thap/js/skills2.js`, thuần + tất định → SOLO/CO-OP/PVP/ONLINE giống nhau):

```
m10 = floor(n/10), m50 = floor(n/50), dung = n>0 && n%10==0
toc = 0.10 × (m10 − m50)  + (dung && n%50≠0 ? 1.00 : 0)     // +10%/mốc tốc đã qua, +100% khi ĐÚNG mốc tốc
dmg = 0.50 × m50          + (dung && n%50==0 ? 3.50 : 0)     // +50%/mốc sát thương đã qua, +350% khi ĐÚNG mốc sát thương
```

| n | tốc bắn | sát thương | tấm đếm |
|---|---|---|---|
| 9 | +0% | +0% | ⏩ 9/10 |
| 10 | +110% | +0% | ⏩ 10/10 (sáng) |
| 19 | +10% | +0% | ⏩ 19/20 |
| 20 | +120% | +0% | ⏩ 20/20 (sáng) |
| 47 | +40% | +0% | 🗡 47/50 |
| 50 | +40% | +400% | 🗡 50/50 (sáng, quả cầu NOVA 5 + tiếng thức tỉnh) |
| 53 | +40% | +50% | ⏩ 53/60 |
| 60 | +150% | +50% | ⏩ 60/60 (sáng) |
| 100 | +80% | +450% | 🗡 100/100 (sáng) |

So với luật cũ (≥10: +25% tốc mãi; đúng bội 10: +100% tốc; ≥50: +350% sát thương MÃI):
cú bùng khi đúng mốc giữ nguyên độ mạnh; giữa các mốc thì nhẹ hơn (+10%/mốc tốc, +50%/mốc sát thương)
→ người chơi có lý do canh đúng bội 10/50, và leo sao vẫn mạnh dần. Dạng grow-up giữ: ≥10 NOVA, ≥50 SUPERNOVA.

Tấm đếm trên bàn (`thap/js/demkn.js`): `n/mốc kế` + icon loại mốc kế (`ic_toc` tốc, `ic_dmg` sát thương), chữ vàng khi đúng mốc.
Mô tả: "Board ★ total: every 10 → faster; every 50 → more damage". Demo kỹ năng: lấp bàn tới 20★ rồi 50★.

Kiểm: `tools/thap-kt-hoiquy.js` bước `<chế độ>_ngoisao_luat` (n = 10, 19, 20, 50, 60, 100 — buff + tấm đếm, mọi chế độ);
ảnh: `node tools/thap-kt-ngoisao-dem.js` → `solo_dem_19/20/47/50/60.png`, `solo_dem_tonghop.png`, `coop_*`, `pvp_*` (cả bàn đối thủ).
