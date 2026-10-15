// ĐỀ XUẤT A (độ khó 1) — CHỈ ĐỂ THỬ TRONG BỘ NHỚ bằng bot, KHÔNG phải sửa game:
//   LK_JS="$(cat docs/review/ke-hoach-cai-thien/kiem-can-bang/de_xuat_a.js)" python3 .../do_ai_chet.py 0,...,14 100 --luu=tat.json
// 1) Quái thường các ải bot chết nhiều nhất TRƯỚC khi tới trùm (90% máu mất là do quái thường): nhân máu và sát thương cột
//    G.STAGE_K.mob với s. Vì máu / sát thương trùm = chỉ số quái của ải × cột G.STAGE_K.boss, cột boss chia lại cho s để trùm GIỮ NGUYÊN,
//    trừ hai trùm vùng có hệ số riêng T (so với trùm hiện tại):
// 2) Ngư Tinh (2-5): sát thương × 0,9 (máu giữ). Hồ Tinh (3-5): máu × 0,81, sát thương × 0,74 (tức cột cũ [1,29; 2,71] → [1,05; 2,0] trên quái cũ).
(function () {
  const S = { 6: 0.89, 7: 0.89, 8: 0.81, 9: 0.78, 11: 0.9, 13: 0.82, 14: 0.95 };
  const T = { 9: [1, 0.9], 14: [1.05 / 1.29, 2.0 / 2.71] };
  const r2 = (x) => Math.round(x * 100) / 100;
  for (let k = 0; k < 15; k++) {
    const s = S[k] || 1, t = T[k] || [1, 1], m = G.STAGE_K.mob[k], b = G.STAGE_K.boss[k];
    if (s === 1 && !T[k]) continue;
    G.STAGE_K.mob[k] = [r2(m[0] * s), r2(m[1] * s)];
    G.STAGE_K.boss[k] = [r2((b[0] * t[0]) / s), r2((b[1] * t[1]) / s)];
  }
})()
