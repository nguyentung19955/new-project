// ĐỀ XUẤT A (độ khó 2) — CHỈ ĐỂ THỬ TRONG BỘ NHỚ. Độ khó 2 chỉ mở khi xong cả 15 ải thường (village.js unlocked), lúc đó người chơi
// đã có Sức mạnh ~530–590, nên khuyên dùng độ khó 2 theo vùng (145 … 690) quá thấp ở mọi ải trừ 3-5.
// Đề xuất: khuyên dùng độ khó 2 theo TỪNG ẢI = K2_REC (520 → 690), quái + trùm độ khó 2 = chỉ số ải thường × m[k] (máu và sát thương),
// m[k] = (K2_REC[k] / G.STAGE_REC[k]) ^ (1 / (2·E)). E = độ dốc "Sức mạnh cần ∝ (máu × sát thương)^E" (E = 0,5 là giả định cũ của
// G.DIFF2; số đo bước 1 cho thấy vùng 2–3 dốc hơn). Đặt window.K2_E (mặc định 0,75), window.K2_T0 / K2_T1 trước khi nạp để thử.
(function () {
  const E = window.K2_E || 0.75;
  const T0 = window.K2_T0 || 520, T1 = window.K2_T1 || 690; // khuyên dùng K2 1-1 và K2 3-5, ở giữa tăng đều (làm tròn 5)
  const T = Array.from({ length: 15 }, (_, k) => Math.round((T0 + ((T1 - T0) * k) / 14) / 5) * 5);
  window.K2_REC = T;
  const ss = G.stageStats, R = G.STAGE_REC.slice();
  window.K2_M = T.map((t, k) => Math.round(Math.pow(t / R[k], 1 / (2 * E)) * 100) / 100);
  G.stageStats = function (r, i, diff) {
    const o = ss(r, i, 0);
    if (!diff) return o;
    const m = window.K2_M[r * 5 + i];
    o.hp *= m; o.dmg *= m; o.xp = Math.round(o.xp * 1.5); o.gold = Math.round(o.gold * 1.5);
    return o;
  };
  const sr = G.stageRec;
  G.stageRec = function (r, i, diff) { return diff ? T[r * 5 + i] : sr(r, i, 0); };
})()
