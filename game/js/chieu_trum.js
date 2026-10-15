// CHIÊU MỚI THAY 10 CHIÊU LẶP KIỂU — docs/review/ke-hoach-cai-thien/ky-nang-trum-rieng/YEU-CAU.md (14/10)
// Trùm vùng, trùm nhỏ, tinh anh có 3 kiểu bị lặp (toả tròn đạn / vòng có khe, mưa rơi quanh em bé, lao thẳng). Mỗi kiểu chỉ giữ một chủ
// (Hồ Tinh c5 Bão hồ hoả, Mộc Tinh c5 Rừng gai, Mộc Tinh c3 Mưa quả độc, Heo Nanh Húc zíc zắc); 10 chỗ còn lại đổi sang chiêu mới ở đây:
//   Ngư Tinh c1 Bổ rìu san hô · c4 Cột nước đuổi · c5 Xoáy hút; Hồ Tinh c2 Vồ nhảy · c4 Hồ ly phân thân;
//   Nấm Chúa chieu2 Nấm mẹ đẻ con; Cua Đá chieu2 Tường tinh thể; Nấm Phồng Chúa Nhảy dập; Cá Nóc Chúa Phồng lăn; Hũ Chúa Đổ dầu châm lửa.
// GIỮ: sát thương MỖI LẦN TRÚNG (hệ số nhân với b.dmg / e.dmg như chiêu cũ), cử động (anim) và độ dài chiêu cũ (lệch ≤ 10%, xem bao-cao.md),
// mọi đòn đều có vùng báo trước trên sàn (vùng của luật chơi → js/bao_truoc.js vẽ), né được bằng chạy / lộn. Mọi vùng đặt đối xứng quanh
// đúng tâm của nó (tâm chân trùm, chỗ em bé, tâm sàn) — cùng cách căn của phiên trum-chet-pha3: vòng tròn dẹt theo sàn G.ZK, chia đều 360°.
// Chiêu đặc biệt: Xoáy hút kéo NHẸ (chậm hơn em bé chạy, không kéo lúc lộn / lướt, không kéo vào vùng đỏ sắp nổ mà bé đang đứng ngoài);
// Tường tinh thể chỉ chắn đường đi và đạn (không gây sát thương khi đứng cạnh).
// Cờ ?chieucu=1 (G.CHIEU_MOI = false, khai ở js/data.js): dùng lại đúng chiêu cũ (hàm cũ giữ nguyên trong js/boss.js, js/mobs.js).
// Hình: dùng lại ảnh hu-* có sẵn (hu-cot-nuoc, hu-xoay-nuoc, hu-nut-dat, hu-bang-vo, hu-no-lua, hu-no-doc, hu-nam-moc, hu-gai-bang,
// hu-vung-lua, hu-phan-than, hu-va-cham, hu-dap-san); chỗ thiếu ảnh vẽ tạm tối giản bằng code (prompt ảnh: PROMPT-ANH.md cùng thư mục yêu cầu).
// KHÔNG thêm ảnh vào build. Số liệu: bảng SO (JSON thuần giữa /*SO*/ ... /*HET-SO*/) — công cụ vẽ ảnh soát tĩnh đọc thẳng.
// Nạp sau js/boss.js, js/mobs.js, js/bao_truoc.js, js/ky_nang_quai.js.
(function () {
  const G = window.G;
  if (!G) return;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  if (G.CHIEU_MOI === undefined) { let cu = false; try { cu = typeof location !== 'undefined' && /[?&]chieucu=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; } G.CHIEU_MOI = !cu; }
  const ON = () => G.CHIEU_MOI !== false;
  const CT = (G.chieuTrum = {});

  // ---------- SỐ LIỆU ----------
  // Thời gian: giây. Cự li: điểm ảnh game. sat: hệ số × b.dmg / e.dmg (một lần trúng). Trùm vùng: pha 2, 3 mọi thời gian chia cho tốc pha
  // (1,1 / 1,2) như cử động của chiêu.
  const SO = /*SO*/{
    "nguBoRiu": { "dai": [80, 160], "them": 24, "rong": 30, "sat": 1.4, "manhDiem": [0.35, 0.65, 0.95], "manhDai": 52, "manhRong": 16, "manhSat": 1.0 },
    "nguCotNuoc": { "so": 6, "cach": 0.25, "bao": 0.6, "r": 16, "sat": 1.0 },
    "nguXoayHut": { "R": 112, "keo": 30, "dau": 0.2, "giay": 2.0, "nghi": 0.3, "r": 40, "sat": 1.3, "met": 1.5 },
    "hoVoNhay": { "bay": 0.4, "cao": 46, "r": 34, "sat": 1.25, "lan2": 0.55, "bao2": 0.62 },
    "hoPhanThan": { "le": [18, 12], "rong": 34, "sat": 1.1, "dau": 0.3, "buoc": 0.12, "bao": 0.3, "lao": 0.22, "mo": 0.7, "met": 1.0, "ngat": 1.0 },
    "namMe": { "so": 3, "R": 46, "giay": 2.5, "r": 30, "sat": 0.8, "may": 3, "chem": 30 },
    "cuaTuong": { "cach": 70, "nua": 0.36, "day": 10, "satDung": 1.0, "giu": 3.0, "bao": 1.0, "hang": 30, "manhDai": 96, "manhRong": 14, "sat": 1.0 },
    "cuaNhot": { "le": 42, "mep": 14, "khe": 32, "day": 10, "satDung": 1.0, "giu": 2.6, "bao": 1.0, "loat": 2, "bao2": 0.6, "hang": 36, "dau": 6, "manhRong": 14, "sat": 0.8 },
    "namPhongNhay": { "lan": 3, "dau": 0.2, "cach": 0.4, "bao": 0.6, "bay": 0.35, "xa": 60, "tach": 44, "cao": 26, "r": 24, "sat": 1.0, "may": 3 },
    "caNocLan": { "nay": 3, "giay": 1.9, "tocMin": 120, "tocMax": 260, "r": 14, "le": 12, "baoMin": 0.7, "sat": 0.8, "phong": 1.35 },
    "huDau": { "tay": 70, "rong": 18, "cho": 1.0, "chay": 2.0, "sat": 0.8, "nhip": 0.5, "satChay": 0.3 }
  }/*HET-SO*/;
  CT.SO = SO;
  // 15/10 sua-can-bang (bao-cao-C mục 6b): mảnh san hô Bổ rìu Ngư Tinh 1,4 → 1,0 (nhát bổ chính giữ 1,4). ?cbcu=1 (G.CB_CU, js/data.js): số cũ.
  if (G.CB_CU) SO.nguBoRiu.manhSat = 1.4;
  // Chiêu cũ để so (đọc từ js/boss.js, js/mobs.js trước phiên này): hệ số sát thương mỗi lần trúng, cử động, mốc, hết chiêu (giây, pha 1,
  // tinh anh không có tính chất "nhanh"); "dan": đạn cũ còn bay tới lúc này.
  CT.CU = /*CU*/{
    "nguBoRiu": { "ten": "Đớp", "sat": [1.4], "anim": "c1", "dur": 1.9, "moc": [0.4, 0.62], "het": 1.9 },
    "nguCotNuoc": { "ten": "Mưa băng nhọn", "sat": [1.0], "anim": "c4", "dur": 2.2, "moc": [0.38, 0.8], "het": 2.2 },
    "nguXoayHut": { "ten": "Xoáy nước", "sat": [1.3, 1.2], "anim": "c5", "dur": 2.6, "moc": [0.3, 0.82], "het": 2.6 },
    "hoVoNhay": { "ten": "Vồ mồi", "sat": [1.25, 1.25], "anim": "c2", "dur": 2.0, "moc": [0.22, 0.9], "tele": 0.65, "het": 2.21 },
    "hoPhanThan": { "ten": "Vòng lửa ma", "sat": [1.1], "anim": "c4", "dur": 2.5, "moc": [0.3, 0.92], "het": 2.5 },
    "namMe": { "ten": "Bão bào tử", "sat": [0.8, 0.15], "anim": "chieu2", "dur": 1.8, "het": 1.8 },
    "cuaTuong": { "ten": "Mưa tinh thể", "sat": [1.0], "anim": "chieu2", "dur": 1.8, "het": 1.8 },
    "namPhongNhay": { "ten": "Mưa bào tử", "sat": [1.0], "anim": "chieu1", "dur": 1.9, "T": 0.7, "het": 1.9 },
    "caNocLan": { "ten": "Gai xoáy", "sat": [0.8], "anim": "chieu1", "dur": 1.6, "T": 0.7, "het": 1.6, "dan": 2.65 },
    "huDau": { "ten": "Vòng cầu lửa", "sat": [0.8], "anim": "chieu1", "dur": 1.7, "T": 0.7, "het": 1.7, "dan": 2.9 }
  }/*HET-CU*/;
  // Tên chiêu (b.skillName / MINI_SK; tinh anh chưa có tên trên bảng thua — giữ để dịch và báo cáo). Bản tiếng Anh:
  // tools/ngon-ngu/tu-dien/chieu-trum.json → js/ngon_ngu_en.js.
  const TEN = {
    nguBoRiu: 'Bổ rìu san hô', nguCotNuoc: 'Cột nước đuổi', nguXoayHut: 'Xoáy hút', hoVoNhay: 'Vồ nhảy', hoPhanThan: 'Hồ ly phân thân',
    namMe: 'Nấm mẹ đẻ con', cuaTuong: 'Tường tinh thể', namPhongNhay: 'Nhảy dập', caNocLan: 'Phồng lăn', huDau: 'Đổ dầu châm lửa',
  };
  CT.TEN = TEN;

  // ---------- tiện ích ----------
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }
  const anh = (ma, x, y, o) => (!G.noRender && G.fx && G.fx.anh ? G.fx.anh(ma, x, y, o) : false);
  const FA = () => G.fxAnh;
  const coAnh = (ma) => !G.noRender && G.HU_TRUM !== false && !!FA() && FA().co(ma);
  // 15/10 (hieu-ung-ky-nang): ảnh riêng thay hình vẽ tạm (mảnh san hô, tường tinh thể, vệt dầu, nấm con) — có ảnh và không bật ?fxcu=1
  // (js/fx_anh.js G.huKn); không thì như cũ (ảnh tạm dùng lại hu-gai-bang / hu-nam-moc, hoặc vẽ code).
  const KA = (ma) => !!G.huKn && G.huKn(ma);
  const ZK = () => G.ZK || 0.85;
  function trong(x, y, m) { const w = W(); m = m || 0; return [clamp(x, w.x0 + m, w.x1 - m), clamp(y, w.y0 + m * 0.5, w.y1 - m * 0.5)]; }
  function moc(id, a) { const m = G.monsterArt, l = m && id && m.list.find((x) => x.id === id), an = l && l.anims.find((x) => x.id === a); return (an && an.moc) || [0.45, 0.75]; }
  function seq(b, t, f) { b.seq.push({ t: Math.max(0, t), f }); }
  // 15/10 noi-gian-manh: số đòn theo pha (bảng G.NOI_GIAN.chieu, js/data.js; cờ tắt ?giancu=1 → cu) và sàn báo trước khi nổi giận.
  const soNG = (b, key, f, cu) => (G.noiGianSo ? G.noiGianSo(b, key, f, cu) : cu);
  const sanNG = (b, to) => (G.noiGianSan ? G.noiGianSan(b, to) : 0);
  const satDot = () => (G.NOI_GIAN_BAT !== false && G.NOI_GIAN && G.NOI_GIAN.satDot) || 1; // × sát thương nhát của đợt thêm
  const theo = (b) => ({ src: b, skill: b.skillName || null });
  function vung(b, shape, geo, t, dmg, el, o) { return G.mobZone(shape, geo, t, dmg, el || null, Object.assign(theo(b), o || {})); }
  function tron(b, x, y, r, t, dmg, el, o) { return G.zoneCircle(x, y, r, t, dmg, el || null, Object.assign(theo(b), o || {})); }
  // Mệt sau chiêu lớn (như tire() của js/boss.js).
  function met(b, t) {
    if (b.dead) return;
    if (G.noiGianMet) t = G.noiGianMet(b, t); // 15/10 noi-gian-manh: nổi giận mệt ngắn hơn (G.NOI_GIAN, cờ tắt ?giancu=1)
    b.tired = t; b.exposed = Math.max(b.exposed || 0, t); b.busy = Math.max(b.busy || 0, t);
    if (b.kind === 'mini' && b.st) b.st.stun = Math.max(b.st.stun || 0, t);
  }
  // Chiêu dài hơn cử động một chút (pha 2, 3): giữ trùm bận tới lúc vùng cuối nổ (js/boss.js đặt b.busy = D ngay sau khi gọi chiêu).
  function giuBan(b, X) { seq(b, 0, () => { if (!b.dead) b.busy = Math.max(b.busy, X - 1 / 60); }); }
  function mat(e, a) { e.dirA = a; if (Math.abs(Math.cos(a)) > 0.15) e.face = Math.cos(a) > 0 ? 1 : -1; }
  // Vật tự quản (vệt nứt, xoáy, nấm con, tường, vệt dầu...): nằm trong W.zones với hình 'ct' (luật vùng bỏ qua: không báo, không trúng),
  // mỗi khung gọi o.buoc(o, dt, P) (trả false thì xoá), vẽ ở lớp sàn bằng o.ve(c, o).
  function vat(o) { o.age = 0; const z = { shape: 'ct', t: 0, t0: 0, life: 1e9, dmg: 0, x: o.x || 0, y: o.y || 0, ct: o }; o.z = z; W().zones.push(z); return o; }
  const p = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  function elip(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU); c.fill(); }
  const hh = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  // Nhảy vòng cung: thân dời thật từ chỗ đứng tới (x1, y1) trong T giây, cao H (chỉ là hình: e.ctCao).
  function nhay(e, x1, y1, T, H, xong) { e.ctNhay = { x0: e.x, y0: e.y, x1, y1, t: 0, T: Math.max(0.05, T), H, xong }; }
  // Kéo nhẹ em bé về (x, y) (Xoáy hút): không kéo khi đang lộn / lướt / đã xong trận; không kéo vào vùng đỏ sắp nổ (còn < 0,25 giây) mà
  // bé đang đứng ngoài — nên không bao giờ bị kéo xuyên vùng đỏ đang nổ.
  function keo(x, y, v, R, dt) {
    const w = W(), P = w.P;
    if (!P || P.dead || P.dodgeT > 0 || P.dashT > 0 || w.over || w.safe) return;
    const dx = x - P.x, dy = y - P.y, d = Math.hypot(dx, dy / ZK()), l = Math.hypot(dx, dy);
    if (d < 6 || d > R || l < 1) return;
    const Q = { x: clamp(P.x + (dx / l) * v * dt, w.x0, w.px1 != null ? w.px1 : w.x1), y: clamp(P.y + (dy / l) * v * 0.75 * dt, w.y0, w.y1) };
    for (const z of w.zones) if (z.team !== 'player' && z.team !== 'fx' && z.dmg && z.t > 0 && z.t < 0.25 && !z.wall && !z.ct && G.inZone(z, Q) && !G.inZone(z, P)) return;
    P.x = Q.x; P.y = Q.y;
  }
  // Em bé vừa chém / bắn trúng chỗ (x, y) chưa (nấm con của Nấm Chúa): đòn cận chiến đang ra, đứng gần và quay mặt về phía đó; hoặc đạn của bé bay qua.
  function biChem(x, y, R) {
    const w = W(), P = w.P;
    if (!P || P.dead) return false;
    if (P.atkT > 0 && Math.hypot(x - P.x, (y - P.y) * 1.5) < R && (x - P.x) * (P.face || 1) > -6) return true;
    for (const o of w.projs) if (o.team === 'player' && o.t > 0 && Math.abs(o.x - x) < 8 && Math.abs(o.y - y) < 9) return true;
    return false;
  }

  // =====================================================================
  // TRÙM VÙNG (thay hàm f của SK trong js/boss.js qua G.bossSK; tên chiêu đổi theo cờ)
  // =====================================================================
  // Ngư Tinh c1 · BỔ RÌU SAN HÔ: giơ rìu, bổ xuống trước mặt (mốc ra đòn moc[0]) → vết nứt chạy thẳng một đường; tới mốc moc[1] mảnh san hô
  // văng ra hai bên, vuông góc vết nứt, từ 3 điểm trên vết nứt (đối xứng qua trục vết nứt). Mọi vùng báo trước ngay từ đầu chiêu.
  function boRiu(b, P, T, D, a) {
    const S = SO.nguBoRiu, T2 = moc(b.art, 'c1')[1] * D, ph = b.phase;
    if (b.an) b.an.ct = true;
    const L = clamp(Math.hypot(P.x - b.x, P.y - b.y) + S.them, S.dai[0], S.dai[1]), x0 = b.x, y0 = b.y, ca = Math.cos(a), sa = Math.sin(a);
    vung(b, 'line', { x: x0, y: y0, ang: a, len: L, w: S.rong }, T, b.dmg * S.sat, 'ice', { melee: true, onFire: () => { W().shake = Math.max(W().shake, 0.25); G.sfx('boom', 1.3); } });
    const M = [];
    // 15/10 noi-gian-manh: nổi giận thì BỔ THÊM (đợt 2, 3): mỗi nhát một vết nứt mới (không văng mảnh), nhắm lại chỗ em bé, báo trước như vùng
    // to, sau lúc mảnh văng. (Thử thêm điểm văng mảnh trên cùng vết nứt: mảnh phủ kín hai bên vết nứt, không còn chỗ né → bỏ.)
    const nD = soNG(b, 'nguRiu', 'dot', 1), gap = 0.7;
    if (nD > 1 && G.noiGianLapDot) {
      for (let k = 1; k < nD; k++) G.noiGianLapDot(b, 'c1', T2 + k * gap, sanNG(b, true) || 0.6, (w) => {
        const g = G.noiGianHuong ? G.noiGianHuong(b, P, a, 'nguRiu') : a, L2 = clamp(Math.hypot(P.x - b.x, P.y - b.y) + S.them, S.dai[0], S.dai[1]);
        b.dirA = g; if (Math.abs(Math.cos(g)) > 0.15) b.face = Math.cos(g) > 0 ? 1 : -1;
        vung(b, 'line', { x: b.x, y: b.y, ang: g, len: L2, w: S.rong }, w, b.dmg * S.sat, 'ice', { melee: true, onFire: () => { W().shake = Math.max(W().shake, 0.2); G.sfx('boom', 1.3); } });
        if (b.an) b.an.ct = true;
      });
      giuBan(b, T2 + (nD - 1) * gap + 0.3);
    }
    for (const f of S.manhDiem) {
      const px = x0 + ca * L * f, py = y0 + sa * L * f;
      for (const s of [-1, 1]) { const g = a + (s * PI) / 2; M.push([px, py, g]); vung(b, 'line', { x: px, y: py, ang: g, len: S.manhDai, w: S.manhRong }, T2, b.dmg * S.manhSat, 'ice'); }
    }
    vat({ x: x0, y: y0, buoc: (o) => !b.dead && b.phase === ph && o.age < T2 + 0.7,
      ve(c, o) {
        if (o.age < T) return;
        const k = o.age < T2 + 0.3 ? 1 : clamp(1 - (o.age - T2 - 0.3) / 0.4, 0, 1), FAx = FA();
        // vết nứt: ảnh hu-nut-dat nối đoạn (xoay theo hướng), thiếu ảnh thì vạch gãy khúc tối + ánh xanh
        if (coAnh('hu-nut-dat')) {
          const n = Math.max(1, Math.round(L / 22)), f = Math.min(5, Math.floor((o.age - T) / 0.08));
          for (let i = 0; i < n; i++) { const d = (i + 0.5) * (L / n); FAx.veK(c, 'hu-nut-dat', x0 + ca * d, y0 + sa * d + 4, f, a, 1, false, k); }
        } else {
          const u = clamp((o.age - T) / 0.12, 0, 1), n = Math.max(2, Math.round((L * u) / 6));
          c.save(); c.globalAlpha *= k;
          for (let i = 0; i < n; i++) { const d = i * 6, j = (hh(i, 3) - 0.5) * 4, x = x0 + ca * d - sa * j, y = y0 + sa * d + ca * j; p(c, x - 1, y - 1, 3, 2, '#14182e'); p(c, x, y - 1, 1, 1, '#7fd4ff'); }
          c.restore();
        }
        // mảnh san hô văng: bay ra trong 0,2 giây trước mốc moc[1], rơi tan sau đó
        const v = clamp((o.age - (T2 - 0.2)) / 0.2, 0, 1);
        // ảnh hu-manh-san-ho (dài 14 khi co 1, bay sang phải, xoay theo hướng văng g): đang bay khung 1–4, chạm sàn (sau moc[1]) khung 5–6 vỡ tan
        if (v > 0 && o.age < T2 + 0.4 && KA('hu-manh-san-ho')) {
          const f = o.age < T2 ? Math.min(3, Math.floor(v * 4)) : 4 + Math.min(1, Math.floor(((o.age - T2) / 0.4) * 2)), mo = o.age > T2 ? clamp(1 - (o.age - T2 - 0.2) / 0.2, 0, 1) : 1;
          M.forEach(([px, py, g], i) => { const d = S.manhDai * v * (0.55 + 0.45 * hh(i, 1)), x = px + Math.cos(g) * d, y = py + Math.sin(g) * d - Math.sin(v * PI) * 10; FA().veK(c, 'hu-manh-san-ho', x, y, f, g, 1, false, mo); });
        } else if (v > 0 && o.age < T2 + 0.4) { // thiếu ảnh / ?fxcu=1: vẽ tạm bằng code
          c.save(); c.globalAlpha *= o.age > T2 ? clamp(1 - (o.age - T2) / 0.4, 0, 1) : 1;
          M.forEach(([px, py, g], i) => { const d = S.manhDai * v * (0.55 + 0.45 * hh(i, 1)), x = px + Math.cos(g) * d, y = py + Math.sin(g) * d - Math.sin(v * PI) * 10; p(c, x - 2, y - 2, 4, 3, '#14182e'); p(c, x - 1, y - 2, 3, 2, i % 2 ? '#ff7a8a' : '#ff9eb0'); p(c, x - 1, y - 2, 1, 1, '#ffe0e6'); });
          c.restore();
        }
      } });
  }
  // Ngư Tinh c4 · CỘT NƯỚC ĐUỔI: 6 cột nước phun nối tiếp đúng vết chân em bé — mỗi cột lấy chỗ bé đứng, báo trước 0,6 giây rồi phun;
  // cột sau trễ 0,25 giây (pha 2, 3: chia tốc pha). Đứng yên là trúng, phải chạy liên tục. Cột đầu phun đúng mốc ra đòn cũ (moc[0]).
  function cotNuoc(b, P, T, D, a, sp) {
    const S = SO.nguCotNuoc, cach = S.cach / (sp || 1), bat = Math.max(0, T - S.bao), ph = b.phase;
    if (b.an) b.an.ct = true;
    let het = 0;
    const so = soNG(b, 'nguCot', 'so', S.so); // nổi giận: thêm cột
    for (let k = 0; k < so; k++) {
      const tk = bat + k * cach;
      het = tk + S.bao;
      seq(b, tk, () => {
        if (b.dead || b.phase !== ph) return;
        const q = trong(P.x, P.y);
        tron(b, q[0], q[1], S.r, S.bao, b.dmg * S.sat, 'ice', { fxKind: 'spout', onFire: (z) => { if (!anh('hu-cot-nuoc', z.x, z.y, { t: 0.3, gian: true, mr: true })) FX('burst', z.x, z.y - 8, '#bfeaff', 10, 70); } });
      });
    }
    if (het + 0.05 > D) giuBan(b, het + 0.05);
  }
  // Ngư Tinh c5 · XOÁY HÚT: xoáy quanh thân kéo nhẹ em bé về tâm trong 2 giây (bán kính R, chạy ngược ra là thoát), xoáy tan rồi nổ nhỏ
  // ngay tâm (vùng tròn r, báo trước suốt lúc xoáy). Kéo dừng trước lúc nổ (nghỉ) nên không bị kéo vào lúc vùng đang nổ.
  function xoayHut(b, P, T, D, a, sp) {
    const S = SO.nguXoayHut, k = sp || 1, t0 = S.dau / k, t1 = t0 + S.giay / k, tn = t1 + S.nghi / k, ph = b.phase, x = b.x, y = b.y;
    if (b.an) b.an.ct = true;
    tron(b, x, y, S.r, tn, b.dmg * S.sat, 'ice', { onFire: (z) => { if (!anh('hu-bang-vo', z.x, z.y - 4, { sc: S.r / 28, t: 0.35, gian: true, mr: true })) FX('burst', z.x, z.y - 6, '#bfeaff', 16, 90); W().shake = Math.max(W().shake, 0.2); } });
    vat({ x, y,
      buoc(o, dt) { if (b.dead || b.phase !== ph) return false; if (o.age >= t0 && o.age < t1) keo(x, y, S.keo, S.R, dt); return o.age < tn + 0.1; },
      ve(c, o) {
        const m = o.age < t0 ? o.age / Math.max(0.01, t0) : o.age < t1 ? 1 : clamp(1 - (o.age - t1) / Math.max(0.01, tn - t1), 0, 1);
        if (m <= 0) return;
        if (coAnh('hu-xoay-nuoc')) { FA().veK(c, 'hu-xoay-nuoc', x, y, Math.floor(o.age * 10) % 8, 0, S.R / 69, false, m); return; }
        c.save(); c.globalAlpha *= m;
        for (let arm = 0; arm < 4; arm++) for (let i = 0; i < 30; i++) { const r = 10 + (i / 30) * (S.R - 10), g = (arm / 4) * TAU - o.age * 5 - r * 0.045; p(c, x + Math.cos(g) * r, y + Math.sin(g) * r * ZK(), 2, 2, i % 6 === 0 ? '#ffffff' : i % 2 ? '#5fb8e0' : '#2a78b0'); }
        c.restore();
      } });
    // nổi giận (pha 3): sau cú nổ giữa bung thêm vòng sóng lan ra (vành khăn, báo trước suốt lúc xoáy), mỗi vòng cách 0,4 giây
    const nV = soNG(b, 'nguXoay', 'vong', 0);
    for (let j = 1; j <= nV; j++) { const r0 = S.r + (j - 1) * 45; vung(b, 'donut', { x, y, r0, r1: r0 + 45 }, tn + j * 0.4, b.dmg * 1.2 * satDot(), 'ice'); }
    const het = tn + nV * 0.4 + 0.05;
    if (het > D) giuBan(b, het);
    seq(b, Math.max(D, het), () => met(b, S.met)); // như cũ: mệt sau chiêu lớn
  }
  // Hồ Tinh c2 · VỒ NHẢY: nhảy vòng cung lên cao, bóng tròn (vùng đỏ) báo chỗ đáp ngay dưới em bé lúc ra chiêu, đáp xuống bung lửa vòng
  // nhỏ (một lần trúng như một cú vồ cũ). Pha 2 trở đi nhảy lần hai, nhắm lại theo chỗ em bé (đúng mốc lần vồ thứ hai cũ).
  // Báo trước lần đầu = T (≥ 0,65 giây, do sk.tele của js/boss.js), lần hai 0,62 giây.
  function voNhay(b, P, T, D, a, sp) {
    const S = SO.hoVoNhay, ph = b.phase;
    if (b.an) b.an.ct = true;
    const mot = (bao, ks) => {
      const q = trong(P.x, P.y, 6);
      tron(b, q[0], q[1], S.r, bao, b.dmg * S.sat * (ks || 1), null, { melee: true, onFire: (z) => { if (!anh('hu-no-lua', z.x, z.y, { sc: S.r / 40, t: 0.45, gian: true, mr: true })) FX('burst', z.x, z.y - 4, '#ff8a1e', 14, 80); W().shake = Math.max(W().shake, 0.2); } });
      seq(b, bao - S.bay, () => { if (!b.dead && b.phase === ph) { mat(b, Math.atan2(q[1] - b.y, q[0] - b.x)); nhay(b, q[0], q[1], Math.min(S.bay, bao), S.cao); } });
    };
    mot(T);
    // Lần nhảy sau: nhắm lại ngay khi lần trước đáp + lan2 (nổi giận: nhiều lần hơn, nghỉ giữa hai lần chia tốc pha; báo trước vẫn bao2).
    const lan = soNG(b, 'hoVo', 'lan', b.phase >= 1 ? 2 : 1), nghi = G.noiGianSo && lan > 2 ? S.lan2 / Math.max(1, sp || 1) : S.lan2;
    for (let j = 1; j < lan; j++) seq(b, T + j * nghi + (j - 1) * S.bao2, () => { if (b.dead || b.phase !== ph) return; mat(b, Math.atan2(P.y - b.y, P.x - b.x)); mot(S.bao2, j >= 2 ? satDot() : 1); }); // lần nhảy thêm (thứ 3, 4): × satDot
    if (lan > 2) giuBan(b, T + (lan - 1) * (nghi + S.bao2) + 0.3);
  }
  // Hồ Tinh c4 · HỒ LY PHÂN THÂN: trùm biến mất, 4 bóng cáo hiện ở 4 góc sàn (đối xứng qua tâm sàn), lần lượt lao chéo qua tâm sang góc
  // đối diện (đường đỏ báo trước từng đường). Một bóng là thật (thân trùm); đánh trúng thân thật trước lúc nó lao thì ngắt chiêu (trùm choáng).
  // Bóng thật luôn lao sau bóng ở góc đối diện nó (khỏi chồng hình), nên là bóng thứ 3 hoặc 4. Bóng giả mờ hơn một chút (S.mo).
  function phanThan(b, P, T, D) {
    const S = SO.hoPhanThan, w = W(), ph = b.phase;
    if (b.an) b.an.ct = true;
    const cx = (w.x0 + w.x1) / 2, cy = (w.y0 + w.y1) / 2, hx = (w.x1 - w.x0) / 2 - S.le[0], hy = (w.y1 - w.y0) / 2 - S.le[1];
    const C = [[cx - hx, cy - hy], [cx + hx, cy - hy], [cx + hx, cy + hy], [cx - hx, cy + hy]]; // trên trái, trên phải, dưới phải, dưới trái
    const r = Math.floor(G.rnd() * 4) % 4, s0 = (r + (G.rnd() < 0.5 ? 1 : 2)) % 4, thu = [0, 1, 2, 3].map((k) => (s0 + k) % 4), L = 2 * Math.hypot(hx, hy);
    if (!anh('hu-phan-than', b.x, b.y, { sc: 1.6 })) FX('burst', b.x, b.y - 30, '#ffffff', 12, 60);
    b.x = C[r][0]; b.y = C[r][1]; b.face = cx >= b.x ? 1 : -1; b.dirA = Math.atan2(cy - b.y, cx - b.x);
    const st = (b.ctPT = { C, r, thu, ph, an: b.an, ngat: false, laoThat: false, cao: C.map((q, i) => ({ i, x: q[0], y: q[1], on: i !== r, d: null })) });
    for (const q of st.cao) if (q.on) anh('hu-phan-than', q.x, q.y, { sc: 1.6 });
    // 15/10 noi-gian-manh: nổi giận thì báo trước mỗi đường không ngắn hơn sàn công bằng (vùng nhiều đợt: 0,6 giây),
    // các lượt lao lùi lại cho khớp; thêm lượt lao (bóng giả lao ngược về góc cũ). Cờ tắt → như cũ.
    const tBao = Math.max(S.bao * D, sanNG(b, true)), lui = Math.max(0, tBao - S.dau * D), nL = soNG(b, 'hoPhan', 'lao', 4);
    const luot = thu.map((i) => ({ i, nguoc: false }));
    for (let k = 4; k < nL; k++) { const i = thu[(k - 4) % 4] === r ? thu[(k - 3) % 4] : thu[(k - 4) % 4]; luot.push({ i, nguoc: true }); }
    luot.forEach(({ i: i0, nguoc }, k) => {
      const i = nguoc ? (i0 + 2) % 4 : i0, tk = (S.dau + k * S.buoc) * D + lui, j = (i + 2) % 4, g = Math.atan2(C[j][1] - C[i][1], C[j][0] - C[i][0]);
      seq(b, tk - tBao, () => { if (b.dead || st.ngat || b.ctPT !== st) return; vung(b, 'line', { x: C[i][0], y: C[i][1], ang: g, len: L, w: S.rong }, tBao, b.dmg * S.sat * (nguoc ? satDot() : 1), 'fire', { ctPT: st }); });
      seq(b, tk, () => {
        if (b.dead || st.ngat || b.ctPT !== st) return;
        if (i === r && !nguoc) { st.laoThat = true; mat(b, g); b.lunge = { vx: (Math.cos(g) * L) / S.lao, vy: (Math.sin(g) * L) / S.lao, t: S.lao }; }
        else { const q = st.cao[i0]; if (nguoc) { q.on = true; q.x = C[i][0]; q.y = C[i][1]; } q.d = { x0: q.x, y0: q.y, x1: C[j][0], y1: C[j][1], t: 0 }; q.face = Math.cos(g) >= 0 ? 1 : -1; q.dir = g; }
        G.sfx('swing', 0.8);
      });
    });
    const het = Math.max(D, (S.dau + (luot.length - 1) * S.buoc) * D + lui + S.lao + 0.05);
    if (het > D) giuBan(b, het);
    seq(b, het, () => { if (b.ctPT === st) { if (!st.ngat) met(b, S.met); for (const q of st.cao) if (q.on) { q.on = false; anh('hu-phan-than', q.x, q.y, { sc: 1.6 }); } b.ctPT = null; } });
    if (!b.ctMoc) {
      b.ctMoc = true;
      const o0 = b.onHit;
      b.onHit = function (hit) {
        const s = b.ctPT;
        if (ON() && s && !s.ngat && !s.laoThat && !b.dead) ngatPT(b, s);
        if (o0) return o0.call(this, hit);
      };
    }
  }
  function ngatPT(b, st) {
    st.ngat = true;
    for (const z of W().zones) if (z.ctPT === st && z.t > 0) z.dead = true;
    for (const q of st.cao) if (q.on) { q.on = false; anh('hu-phan-than', q.x, q.y, { sc: 1.6 }); }
    b.ctPT = null; b.lunge = null;
    b.busy = 0; met(b, SO.hoPhanThan.ngat); // hết chiêu ngay: choáng ngat giây rồi đánh tiếp (các bước còn lại trong b.seq tự bỏ qua)
    FX('text', b.x, b.y - (b.h || 60) - 6, 'Ngắt chiêu!', '#ffd23f', 9); // chuỗi tĩnh: dịch lúc vẽ (tools/ngon-ngu/tu-dien/chieu-trum.json)
    G.sfx('hit', 0.8);
  }

  // =====================================================================
  // TRÙM NHỎ (móc ở thinkMini của js/boss.js): trả true nếu đã ra chiêu mới
  // =====================================================================
  // Nấm Chúa chieu2 · NẤM MẸ ĐẺ CON: tới mốc ra đòn mọc 3 nấm con quanh mình (chia đều 120°, vòng dẹt theo sàn); nấm con nào chưa bị chém
  // vỡ sau 2,5 giây thì nổ khí độc (vùng tròn báo trước suốt 2,5 giây, để lại vũng độc như Bão bào tử cũ).
  function namMe(b, P, T, D, a) {
    const S = SO.namMe;
    seq(b, T, () => {
      if (b.dead) return;
      const so = soNG(b, 'namMe', 'so', S.so); // nổi giận: thêm nấm con
      for (let k = 0; k < so; k++) {
        const g = a + (k / so) * TAU, q = trong(b.x + Math.cos(g) * S.R, b.y + Math.sin(g) * S.R * ZK(), 8);
        const z = tron(b, q[0], q[1], S.r, S.giay, b.dmg * S.sat, 'poison', { cancel: true, then: S.may, onFire: (z2) => { if (!anh('hu-no-doc', z2.x, z2.y, { sc: S.r / 40, t: 0.5, gian: true, mr: true })) FX('burst', z2.x, z2.y - 6, '#c4f43c', 14, 70); G.sfx('boom', 1.2); } });
        vat({ x: q[0], y: q[1],
          buoc(o) {
            if (z.dead || !(z.t > 0)) return false; // đã nổ (thành vũng) hoặc bị huỷ (trùm nhỏ gục / đổi pha)
            if (b.dead) { z.dead = true; return false; }
            if (biChem(o.x, o.y, S.chem)) { z.dead = true; if (!anh('hu-phan-than', o.x, o.y, { sc: 0.8 })) FX('burst', o.x, o.y - 6, '#c4f43c', 10, 60); G.sfx('hit', 1.5); return false; }
            return true;
          },
          ve(c, o) {
            const u = clamp(o.age / S.giay, 0, 1), nh = 1 + 0.12 * u * Math.abs(Math.sin(o.age * (6 + 14 * u))); // phồng nhịp nhanh dần khi sắp nổ
            // ảnh hu-nam-con (cao 18 ở khung 4 khi co 1, neo chân): trồi khung 1–2 (0,3 giây), nhún khung 3–4, 40% cuối phồng to khung 5 → 6
            if (KA('hu-nam-con')) { const f = o.age < 0.3 ? Math.floor(o.age / 0.15) : u < 0.6 ? 2 + (Math.floor(o.age * 4) % 2) : u < 0.85 ? 4 : 5; if (FA().veK(c, 'hu-nam-con', o.x, o.y, Math.min(5, f), 0, 1, false, 1)) return; }
            if (!KA('hu-nam-con') && coAnh('hu-nam-moc')) { FA().veK(c, 'hu-nam-moc', o.x, o.y, o.age < 0.3 ? Math.floor(o.age / 0.06) : 4, 0, 0.5 * nh, false, 1); return; }
            const x = o.x, y = o.y, r = 5 * nh;
            elip(c, x, y, 5, 2, 'rgba(0,0,0,0.3)');
            p(c, x - 1, y - 5, 3, 5, '#e8e0c4');
            elip(c, x, y - 6, r + 1, r * 0.7 + 1, '#14182e'); elip(c, x, y - 6, r, r * 0.7, u > 0.7 && Math.floor(o.age * 12) % 2 ? '#d894ff' : '#9a48d4');
            p(c, x - 2, y - 8, 2, 1, '#c4f43c'); p(c, x + 2, y - 7, 1, 1, '#c4f43c');
          } });
      }
      G.sfx('swing', 1.3);
    });
  }
  // Cua Đá chieu2 · TƯỜNG TINH THỂ: dựng 2 bức tường tinh thể dọc, đối xứng qua tâm sàn (cách tâm ±cach), dài 2 × nua bề cao sàn,
  // chừa lối đi trên / dưới. Tường chắn đường đi của em bé và mọi viên đạn. Đứng đúng chỗ tường trồi lên thì trúng (vạch đỏ báo trước).
  // 3 giây sau tường vỡ: mảnh bắn hai bên vuông góc tường theo các hàng cách nhau hang (đối xứng qua tâm sàn), báo trước bao giây;
  // mảnh bay xa manhDai (tối đa 34% bề ngang sàn), tới mép sàn là hết.
  function tuongTinhThe(b, P, T, D) {
    const S = SO.cuaTuong, w = W(), cx = (w.x0 + w.x1) / 2, cy = (w.y0 + w.y1) / 2, nua = (w.y1 - w.y0) * S.nua, L = Math.min(S.manhDai, (w.x1 - w.x0) * 0.34);
    const TU = [cx - S.cach, cx + S.cach].map((x) => ({ x, y0: cy - nua, y1: cy + nua }));
    const n = Math.floor(nua / S.hang), hang = [];
    for (let j = -n; j <= n; j++) hang.push(cy + j * S.hang);
    for (const t of TU) vung(b, 'line', { x: t.x, y: t.y0, ang: PI / 2, len: t.y1 - t.y0, w: S.day }, T, b.dmg * S.satDung, 'ice');
    seq(b, T, () => {
      if (b.dead) return;
      const Pp = W().P;
      for (const t of TU) if (Pp && Math.abs(Pp.x - t.x) < S.day / 2 + 2 && Pp.y > t.y0 - 4 && Pp.y < t.y1 + 4) Pp.x = t.x + (Pp.x >= t.x ? 1 : -1) * (S.day / 2 + 2); // đứng đúng chỗ tường trồi: đẩy ra mép gần
      vat({ x: cx, y: cy, chan: TU, day: S.day,
        buoc(o) {
          if (b.dead) return false;
          if (o.age >= S.giu) { for (const t of TU) for (let y = t.y0 + 8; y < t.y1; y += 22) anh('hu-bang-vo', t.x, y, { sc: 0.6, t: 0.3 }) || FX('burst', t.x, y - 4, '#bfeaff', 6, 70); G.sfx('boom', 1.5); return false; }
          return true;
        },
        ve(c, o) {
          const f = Math.min(5, Math.floor(o.age / 0.07)), rung = o.age > S.giu - S.bao && Math.floor(o.age * 14) % 2 ? 1 : 0; // sắp vỡ: rung
          for (const t of TU) for (let y = t.y0 + 6; y <= t.y1 + 0.5; y += 10) {
            const x = t.x + (rung ? (y % 20 ? 1 : -1) : 0);
            // ảnh hu-tuong-tinh-the (rộng 16 khi co 1, neo chân, mỗi 10 điểm một khúc như ảnh tạm): trồi khung 1–3 (0,21 giây), đứng khung 4,
            // lúc rung sắp vỡ (bao giây cuối) khung 5 rạn, 0,15 giây cuối khung 6 vỡ (rồi hu-bang-vo như cũ). Khúc xen kẽ lật cho đỡ lặp.
            if (KA('hu-tuong-tinh-the')) { const g = o.age < 0.21 ? Math.floor(o.age / 0.07) : o.age < S.giu - S.bao ? 3 : o.age < S.giu - 0.15 ? 4 : 5; FA().veK(c, 'hu-tuong-tinh-the', x, y, g, 0, 1, (y / 10) % 2 > 1, 1); continue; }
            if (coAnh('hu-gai-bang')) { FA().veK(c, 'hu-gai-bang', x, y, f, 0, 0.9, (y / 10) % 2 > 1, 1); continue; }
            const h = Math.round(10 * Math.min(1, o.age / 0.3)) + 4;
            p(c, x - 4, y - h, 8, h, '#14182e'); p(c, x - 3, y - h + 1, 6, h - 1, '#5fb8e0'); p(c, x - 2, y - h + 1, 2, h - 2, '#d8f6ff'); p(c, x + 1, y - h + 2, 1, 2, '#ffffff');
          }
        } });
    });
    const nD = soNG(b, 'cuaTuong', 'dot', 1); // nổi giận: thêm loạt mảnh, mỗi loạt sau 0,5 giây, lệch nửa hàng
    for (let d = 0; d < nD; d++) seq(b, T + S.giu - S.bao + d * 0.5, () => {
      if (b.dead) return;
      for (const t of TU) for (const y0 of hang) { const y = y0 + (d % 2 ? S.hang / 2 : 0); if (y > t.y1 + 2) continue; for (const g of [0, PI]) vung(b, 'line', { x: t.x, y, ang: g, len: Math.min(L, g ? t.x - w.x0 : w.x1 - t.x), w: S.manhRong }, S.bao, b.dmg * S.sat * (d ? satDot() : 1), 'ice', { cancel: true }); } // mảnh bay tới mép sàn là hết
    });
  }
  // 15/10 cua-tuong-kho (cờ tắt ?cuade=1 → tuongTinhThe cũ ở trên): TƯỜNG TINH THỂ NHỐT EM BÉ. Hai bức tường dọc dựng hai bên chỗ em bé
  // đứng (cách le; sát mép phòng thì bên đó tường phòng là vách), cao hết sàn, chỉ chừa MỘT khe thoát (khe, trừ vạch chắn còn ≥ 24) ở một
  // bức. Tường đứng giu giây rồi vỡ: mảnh bắn ngang PHỦ HẾT SÀN (từ tường tới tường, từ tường tới mép phòng) theo loat loạt SO LE (loạt sau
  // lệch nửa hàng, báo trước bao2 giây ngay khi loạt trước nổ) — đứng yên ở khe giữa hai hàng không còn an toàn: né bằng bước sang hàng vừa
  // nổ (hoặc lộn). Hàng cách hang, mảnh rộng manhRong → mỗi loạt chừa dải trống ≥ 16. Nổi giận: thêm loạt (G.NOI_GIAN.chieu.cuaTuong).
  // Trùm vẫn kẹp / đập trong lúc tường đứng (js/boss.js chỉ bỏ chiêu dựng tường mới tới khi tường cũ vỡ hết: b.cuaTuongHet).
  function tuongNhot(b, P, T, D) {
    const S = SO.cuaNhot, w = W(), px = clamp(P.x, w.x0, w.x1);
    const xs = [px - S.le, px + S.le].filter((x) => x > w.x0 + S.mep && x < w.x1 - S.mep);
    if (!xs.length) xs.push((w.x0 + w.x1) / 2);
    const coKhe = xs.length > 1 ? (G.rnd() < 0.5 ? 0 : 1) : 0, gy = G.rr(w.y0 + S.khe, w.y1 - S.khe), TU = [];
    xs.forEach((x, i) => {
      if (i === coKhe) { TU.push({ x, y0: w.y0 - 4, y1: gy - S.khe / 2 }, { x, y0: gy + S.khe / 2, y1: w.y1 + 4 }); } else TU.push({ x, y0: w.y0 - 4, y1: w.y1 + 4 });
    });
    for (const t of TU) vung(b, 'line', { x: t.x, y: t.y0, ang: PI / 2, len: t.y1 - t.y0, w: S.day }, T, b.dmg * S.satDung, 'ice');
    const nL = S.loat + soNG(b, 'cuaTuong', 'dot', 1) - 1, het = T + S.giu + (nL - 1) * S.bao2;
    b.cuaTuongHet = b.t + het + 0.2;
    seq(b, T, () => {
      if (b.dead) return;
      const Pp = W().P;
      for (const t of TU) if (Pp && Math.abs(Pp.x - t.x) < S.day / 2 + 2 && Pp.y > t.y0 - 4 && Pp.y < t.y1 + 4) Pp.x = t.x + (Pp.x >= t.x ? 1 : -1) * (S.day / 2 + 2);
      vat({ x: px, y: (w.y0 + w.y1) / 2, chan: TU, day: S.day,
        buoc(o) {
          if (b.dead) return false;
          if (o.age >= S.giu) { for (const t of TU) for (let y = Math.max(t.y0, w.y0) + 8; y < Math.min(t.y1, w.y1); y += 22) anh('hu-bang-vo', t.x, y, { sc: 0.6, t: 0.3 }) || FX('burst', t.x, y - 4, '#bfeaff', 6, 70); G.sfx('boom', 1.5); return false; }
          return true;
        },
        ve(c, o) {
          const f = Math.min(5, Math.floor(o.age / 0.07)), rung = o.age > S.giu - S.bao && Math.floor(o.age * 14) % 2 ? 1 : 0;
          for (const t of TU) for (let y = Math.max(t.y0, w.y0) + 6; y <= Math.min(t.y1, w.y1) + 0.5; y += 10) {
            const x = t.x + (rung ? (y % 20 ? 1 : -1) : 0);
            if (KA('hu-tuong-tinh-the')) { const g = o.age < 0.21 ? Math.floor(o.age / 0.07) : o.age < S.giu - S.bao ? 3 : o.age < S.giu - 0.15 ? 4 : 5; FA().veK(c, 'hu-tuong-tinh-the', x, y, g, 0, 1, (y / 10) % 2 > 1, 1); continue; }
            if (coAnh('hu-gai-bang')) { FA().veK(c, 'hu-gai-bang', x, y, f, 0, 0.9, (y / 10) % 2 > 1, 1); continue; }
            const h = Math.round(10 * Math.min(1, o.age / 0.3)) + 4;
            p(c, x - 4, y - h, 8, h, '#14182e'); p(c, x - 3, y - h + 1, 6, h - 1, '#5fb8e0'); p(c, x - 2, y - h + 1, 2, h - 2, '#d8f6ff'); p(c, x + 1, y - h + 2, 1, 2, '#ffffff');
          }
        } });
    });
    // Mảnh: mỗi hàng chia theo các bức tường thành đoạn — đoạn ngoài cùng bay từ tường ra mép phòng, đoạn giữa bay từ tường này sang tường kia.
    // (tên chiêu giữ từ lúc dựng tường: lúc mảnh bay trùm có thể đang ra chiêu khác — bảng thua vẫn ghi đúng "Tường tinh thể")
    const cot = xs.slice().sort((u, v) => u - v), oM = { cancel: true, skill: b.skillName || null };
    const manh = (y, t, k) => {
      const dmg = b.dmg * S.sat * (k ? satDot() : 1);
      vung(b, 'line', { x: cot[0], y, ang: PI, len: cot[0] - w.x0 + 4, w: S.manhRong }, t, dmg, 'ice', oM);
      for (let i = 0; i + 1 < cot.length; i++) vung(b, 'line', { x: cot[i], y, ang: 0, len: cot[i + 1] - cot[i], w: S.manhRong }, t, dmg, 'ice', oM);
      vung(b, 'line', { x: cot[cot.length - 1], y, ang: 0, len: w.x1 - cot[cot.length - 1] + 4, w: S.manhRong }, t, dmg, 'ice', oM);
    };
    for (let k = 0; k < nL; k++) {
      const bao = k ? S.bao2 : S.bao, tNo = T + S.giu + k * S.bao2;
      seq(b, tNo - bao, () => {
        if (b.dead) return;
        for (let y = w.y0 + S.dau + (k % 2 ? S.hang / 2 : 0); y <= w.y1 + 2; y += S.hang) manh(y, bao, k);
      });
    }
  }
  CT.mini = function (b, id, k, P, T, D, a) {
    if (!ON() || k !== 'chieu2' || (id !== 'namChua' && id !== 'cuaDa')) return false;
    if (b.an) b.an.ct = true;
    if (id === 'namChua') namMe(b, P, T, D, a); else if (G.cuaMoi && G.cuaMoi(b)) tuongNhot(b, P, T, D); else tuongTinhThe(b, P, T, D);
    return true;
  };

  // =====================================================================
  // TINH ANH (móc ở thinkElite của js/mobs.js): trả true nếu đã chuẩn bị chiêu mới (o: tuỳ chọn của begin())
  // =====================================================================
  const song = (e, tok) => !e.dead && !!e.act && e.act.ct === tok && !(e.st && (e.st.stun > 0 || e.st.frozen > 0));
  // 15/10 nam-nhay-mat-o: chiêu nhiều lượt của tinh anh bị CHOÁNG / ĐÔNG giữa chừng thì DỪNG HẲN và báo rõ (chữ "Ngắt chiêu!"), không
  // bỏ lặng lẽ một lượt rồi chạy tiếp lượt sau như trước (trước: mỗi lượt hẹn giờ G.later tự hỏi song() lúc tới giờ → lượt rơi đúng lúc
  // choáng bị bỏ, lượt sau vẫn chạy → mất 1 ô / thân lăn trên đoạn chưa có vạch báo). Bộ canh chiêu là một vật tự quản (vat) nên được hỏi
  // MỖI KHUNG kể cả lúc tinh anh đang choáng (js/mobs.js bỏ qua stepAct khi choáng). kq: hàm dọn riêng của từng chiêu lúc bị ngắt.
  // Chết thì không báo (vùng có cancel: true tự huỷ theo luật chung). CT.soNgat: đếm số lần ngắt (mô phỏng Node đọc).
  CT.soNgat = 0;
  function canhChieu(e, tok, het, kq) {
    const v = vat({ x: e.x, y: e.y, xong: false,
      buoc(o) {
        if (o.xong) return false;
        if (e.dead || o.age > het) { o.xong = true; return false; }
        const choang = !!(e.st && (e.st.stun > 0 || e.st.frozen > 0)), conChieu = !!e.act && e.act.ct === tok;
        if (!choang && conChieu) return true;
        o.xong = true;
        if (conChieu) e.act.end = Math.min(e.act.end, e.act.t); // hết chiêu ngay khi hết choáng (không chạy tiếp phần còn lại)
        if (choang) {
          CT.soNgat++;
          FX('text', e.x, e.y - (e.h || 30) - 8, 'Ngắt chiêu!', '#ffd23f', 9); // chuỗi tĩnh, đã có bản dịch (tools/ngon-ngu/tu-dien/chieu-trum.json)
          FX('burst', e.x, e.y - (e.h || 24) * 0.5, '#ffd23f', 8, 60);
          G.sfx('hit', 0.8);
        }
        if (kq) kq(choang);
        return false;
      } });
    return v;
  }
  // Nấm Phồng Chúa · NHẢY DẬP: nhảy 3 lần về phía em bé (mỗi lần xa nhất xa), mỗi chỗ đáp có bóng tròn (vùng đỏ) báo trước bao giây rồi nổ
  // vòng khí độc nhỏ, để lại vũng độc như mưa bào tử cũ. Lần đáp đầu đúng lúc quả bào tử đầu cũ rơi (T + dau).
  // 15/10 nam-nhay-mat-o — sửa "hay mất 1 ô độc":
  //  1. Chỗ đáp: trước nhảy thẳng tới em bé, tối đa xa → em bé đứng trong tầm (chiêu chỉ tung khi cách < 170, thường 1–2 cú là tới) thì
  //     cú 2, 3 đáp ĐÚNG CÙNG CHỖ (ô sau đè khít ô trước, nhìn như mất 1 ô); sát tường thì trong() kẹp các ô về một chỗ. Nay mỗi chỗ đáp
  //     cách MỌI chỗ đáp trước ≥ tach (44, đo trên sàn: trục dọc chia G.ZK) — em bé gần quá thì nhảy VƯỢT qua em bé cho đủ tach; kẹp
  //     tường mà trùng thì xoay hướng (±30°, ±60°, ±90°, ±130°, quay lại) tới chỗ đủ xa.
  //  2. Bị choáng / đông giữa chừng (búa "stagger", đông băng): trước lượt nào rơi đúng lúc choáng bị bỏ lặng lẽ, lượt sau chạy tiếp;
  //     choáng trước mốc ra đòn thì js/mobs.js cancelZones xoá luôn vòng đầu đang báo (vòng đỏ hiện rồi biến, không nổ). Nay: chiêu DỪNG
  //     HẲN (canhChieu: "Ngắt chiêu!"), không ô mới, không cú nhảy mới; vòng nào ĐÃ hiện vẫn nổ đúng giờ (knGiu: không tắt theo choáng).
  //  Tinh anh chết: các vòng chưa nổ huỷ như mọi vùng báo (cancel: true).
  function namPhongNhay(e, P, a, T, D, o) {
    const S = SO.namPhongNhay, tok = {}, diem = [], lich = [];
    o.ct = tok; o.end = Math.max(D, T + S.dau + (S.lan - 1) * S.cach + 0.15);
    let lx = e.x, ly = e.y, huong = a;
    const kc = (x0, y0, x1, y1) => Math.hypot(x1 - x0, (y1 - y0) / ZK());
    const xaDu = (q) => diem.every((d) => kc(q[0], q[1], d[0], d[1]) >= S.tach);
    function chon() {
      const dx = P.x - lx, dy = P.y - ly, d = Math.hypot(dx, dy);
      if (d > 4) huong = Math.atan2(dy, dx);
      const buoc = clamp(d, S.tach, S.xa); // tới em bé (tối đa xa); gần quá thì vượt qua cho đủ tach
      let tot = null, xaNhat = -1;
      for (const lech of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.3, -2.3, PI]) {
        for (const L of [buoc, S.xa]) {
          const q = trong(lx + Math.cos(huong + lech) * L, ly + Math.sin(huong + lech) * L, 6);
          if (xaDu(q) && kc(lx, ly, q[0], q[1]) >= S.tach * 0.9) return q;
          const m = diem.length ? Math.min(...diem.map((p0) => kc(q[0], q[1], p0[0], p0[1]))) : 1e9;
          if (m > xaNhat) { xaNhat = m; tot = q; }
        }
      }
      return tot; // phòng quá chật (không xảy ra với sàn thật): chỗ xa các ô trước nhất
    }
    for (let k = 0; k < S.lan; k++) {
      const land = T + S.dau + k * S.cach;
      lich.push({ t: land - S.bao, k, bao: true }, { t: land - S.bay, k, bao: false });
    }
    lich.sort((x, y) => x.t - y.t || (x.bao ? -1 : 1));
    const v = canhChieu(e, tok, o.end + 0.5);
    const buoc0 = v.buoc;
    v.buoc = (q, dt, P2) => {
      if (buoc0(q, dt, P2) === false) return false;
      while (lich.length && lich[0].t <= q.age + 1e-6) {
        const m = lich.shift();
        if (m.bao) {
          const t = chon();
          diem[m.k] = t; lx = t[0]; ly = t[1];
          // báo trước đúng S.bao kể từ mốc hẹn (khung này có thể trễ vài ms so với mốc)
          G.mobZone('circle', { x: t[0], y: t[1], r: S.r }, Math.max(0.05, S.bao - (q.age - m.t)), e.dmg * S.sat, 'poison', { src: e, cancel: true, knGiu: true, then: S.may, onFire: (z) => { if (!anh('hu-no-doc', z.x, z.y, { sc: S.r / 40, t: 0.5, gian: true, mr: true })) FX('burst', z.x, z.y - 4, '#c4f43c', 12, 70); W().shake = Math.max(W().shake, 0.12); } });
        } else if (diem[m.k]) {
          const t = diem[m.k];
          mat(e, Math.atan2(t[1] - e.y, t[0] - e.x)); nhay(e, t[0], t[1], Math.max(0.05, S.bay - (q.age - m.t)), S.cao);
        }
      }
      return lich.length > 0; // hết lịch (ô 3 đã báo, cú nhảy 3 đã bắt đầu — thân bay nốt dù bị choáng): không còn gì để ngắt
    };
  }
  // Cá Nóc Chúa · PHỒNG LĂN: phồng tròn (lấy đà T), rồi lăn nảy dội tường 3 lần khắp phòng theo hướng em bé (phản xạ gương ở mép sàn).
  // Mỗi đoạn có đường đỏ báo trước ≥ baoMin giây trước lúc lăn vào; thân lăn chạm em bé thì trúng (một lần mỗi đoạn).
  // Tốc lăn = tổng đường / giay (kẹp tocMin..tocMax): lăn xong đúng lúc đạn gai cũ bay hết (T + 1,9 ≈ 2,6 giây).
  function duongNay(x, y, a, n, le) {
    const w = W(), bx0 = w.x0 + le, bx1 = w.x1 - le, by0 = w.y0 + le * 0.5, by1 = w.y1 - le * 0.5, out = [];
    x = clamp(x, bx0, bx1); y = clamp(y, by0, by1);
    let dx = Math.cos(a), dy = Math.sin(a), lan = 0;
    for (let k = 0; out.length < n && k < n + 4; k++) {
      const tx = dx > 1e-6 ? (bx1 - x) / dx : dx < -1e-6 ? (bx0 - x) / dx : 1e9, ty = dy > 1e-6 ? (by1 - y) / dy : dy < -1e-6 ? (by0 - y) / dy : 1e9;
      const t = Math.max(0, Math.min(tx, ty)), x1 = x + dx * t, y1 = y + dy * t;
      if (t >= 8 || lan >= n) out.push({ x0: x, y0: y, x1, y1, len: t, ang: Math.atan2(dy, dx) });
      lan++;
      if (tx <= ty + 1e-6) dx = -dx;
      if (ty <= tx + 1e-6) dy = -dy;
      x = x1; y = y1;
    }
    return out;
  }
  CT.duongNay = duongNay;
  function caNocLan(e, P, a, T, D, o) {
    const S = SO.caNocLan, tok = {}, duong = duongNay(e.x, e.y, a, S.nay, S.le);
    const tong = duong.reduce((s, d) => s + d.len, 0) || 1, v = clamp(tong / S.giay, S.tocMin, S.tocMax);
    let s = 0;
    for (const d of duong) { d.s0 = s; d.t0 = T + s / v; s += d.len; d.t1 = T + s / v; }
    const R = tong / v;
    // 15/10 quai-moi-bien: tấm Cá Nóc Chúa vẽ lại có khung lăn tròn trong hàng đánh (lap_tu..lap_den) → cử động 'lan' lặp các khung đó suốt lúc lăn
    // (js/sprite_custom.js SC.chonQuai) và KHÔNG xoay thân bằng code nữa (khung lăn đã vẽ vệt xoáy). Tấm cũ (?quaicu=1): đứng thở + xoay như trước.
    const S2 = G.spriteCustom, sp2 = S2 && S2.get ? S2.get(e.art) : null, lanAnh = !!(sp2 && sp2.dt && sp2.dt.atk && sp2.dt.atk.lapTu != null);
    o.ct = tok; o.anim0 = 'chieu1'; o.anim1 = lanAnh ? 'lan' : 'idle'; o.end = T + R + 0.25;
    // 15/10 nam-nhay-mat-o: cùng lỗi với Nhảy dập — choáng / đông giữa lúc lăn: trước vạch báo của đoạn hẹn đúng lúc choáng bị bỏ, hết
    // choáng thân lăn tiếp (cử động đứng yên lúc choáng nên lăn TRỄ) vào đoạn không còn / chưa từng có vạch báo. Nay dừng hẳn (canhChieu),
    // xoá các vạch báo còn lại (đường đó không còn lăn nữa), chữ "Ngắt chiêu!".
    let dung = false;
    const vach = [];
    canhChieu(e, tok, T + R, () => { dung = true; for (const z of vach) if (z.t > 0) z.dead = true; }); // lăn xong (T + R) thì thôi canh
    duong.forEach((d, k) => {
      const tao = Math.max(0, d.t0 - Math.max(S.baoMin, k ? 0 : T));
      const mk = (ngay) => { if (!dung && (ngay ? !e.dead : song(e, tok))) vach.push(G.mobZone('line', { x: d.x0, y: d.y0, ang: d.ang, len: d.len, w: S.r * 2 }, Math.max(0.05, d.t0 - tao), 0, null, { src: e, cancel: true, ctBao: true })); };
      if (tao <= 0) mk(true); else G.later(tao, () => mk(false)); // tạo ngay lúc ra chiêu (begin() chưa gán e.act) hoặc hẹn giờ khi chiêu còn chạy
    });
    const trung = duong.map(() => false);
    e.ct = { tok, phong: 1, xoay: 0 };
    o.step = (q, A, dt, P2) => {
      const k0 = q.ct && q.ct.tok === tok ? q.ct : (q.ct = { tok, phong: 1, xoay: 0 });
      if (A.t < T) { k0.phong = 1 + (S.phong - 1) * clamp(A.t / T, 0, 1); return; }
      const s2 = Math.min(tong, (A.t - T) * v);
      let i = 0;
      while (i < duong.length - 1 && s2 > duong[i].s0 + duong[i].len) i++;
      const d = duong[i], u = d.len > 0 ? clamp((s2 - d.s0) / d.len, 0, 1) : 1;
      if (k0.doan != null && k0.doan !== i) { anh('hu-va-cham', d.x0, d.y0 - 6, { sc: 1.2 }) || FX('burst', d.x0, d.y0 - 6, '#a6deff', 8, 60); W().shake = Math.max(W().shake, 0.1); G.sfx('hit', 1.2); }
      k0.doan = i;
      q.x = d.x0 + (d.x1 - d.x0) * u; q.y = d.y0 + (d.y1 - d.y0) * u; q.dirA = d.ang; if (Math.abs(Math.cos(d.ang)) > 0.15) q.face = Math.cos(d.ang) > 0 ? 1 : -1;
      if (!lanAnh) k0.xoay += (s2 < tong ? v : 0) * dt / S.r * (q.face || 1);
      k0.phong = s2 < tong ? S.phong : Math.max(1, k0.phong - dt * 2);
      if (s2 < tong && !trung[i] && P2 && Math.hypot(P2.x - q.x, (P2.y - q.y) * 1.3) < S.r + 6) { if (G.hurtPlayer(q.dmg * S.sat, 'ice', q, true)) trung[i] = true; }
    };
    o.after = (q) => { if (q.ct && q.ct.tok === tok) q.ct = null; };
  }
  // Hũ Chúa · ĐỔ DẦU CHÂM LỬA: tới mốc ra đòn rót vệt dầu hình chữ thập căn đúng chỗ em bé (tay ngang tay, tay dọc tay × G.ZK — bằng nhau
  // trên sàn nhìn chếch), 1 giây sau châm lửa: cả vệt cháy (một lần trúng như một quả cầu lửa cũ), lửa giữ 2 giây (đứng trong mất máu chậm
  // như vũng lửa: satChay × mỗi nhịp).
  function huDau(e, P, a, T, D, o) {
    const S = SO.huDau, tok = {};
    o.ct = tok;
    o.fire = (q) => {
      const c0 = trong(P.x, P.y, 4), cx = c0[0], cy = c0[1], tx = S.tay, ty = S.tay * ZK();
      const tay = [{ shape: 'line', x: cx - tx, y: cy, ang: 0, len: 2 * tx, w: S.rong }, { shape: 'line', x: cx, y: cy - ty, ang: PI / 2, len: 2 * ty, w: S.rong }];
      const zs = tay.map((g) => G.mobZone('line', { x: g.x, y: g.y, ang: g.ang, len: g.len, w: g.w }, S.cho, q.dmg * S.sat, 'fire', { src: q, cancel: true, onFire: () => G.sfx('boom', 0.9) }));
      vat({ x: cx, y: cy, nhip: S.nhip,
        buoc(v, dt, P2) {
          if (v.age < S.cho) return !zs.every((z) => z.dead); // hũ vỡ / gục trước lúc châm: dầu tan
          if (v.age >= S.cho + S.chay) return false;
          v.nhip -= dt;
          if (v.nhip <= 0) { v.nhip = S.nhip; if (P2 && tay.some((g) => G.inShape(g, P2, 0))) G.hurtPlayer(q.dmg * S.sat * S.satChay, 'fire', q, false); }
          return true;
        },
        ve(c, v) {
          const rot = clamp(v.age / 0.25, 0, 1), chay = v.age >= S.cho, m = chay ? clamp((S.cho + S.chay - v.age) / 0.3, 0, 1) : 1;
          c.save(); c.globalAlpha *= m;
          for (const g of tay) {
            const n = Math.max(2, Math.round(g.len / 12));
            for (let i = 0; i <= n; i++) {
              const f = i / n, dd = Math.abs(f - 0.5) * 2;
              if (dd > rot) continue; // rót từ giữa ra hai đầu
              const x = g.x + Math.cos(g.ang) * g.len * f, y = g.y + Math.sin(g.ang) * g.len * f;
              // ảnh hu-vet-dau (nhìn từ trên, rộng 18 = bề rộng vệt khi co 1 → co theo S.rong): đang rót khung 1–2, loang óng ánh khung 3–4,
              // 0,4 giây cuối trước khi châm lửa khung 5–6 (mép đỏ, tia lửa). Mỗi chấm lệch pha.
              if (!chay && KA('hu-vet-dau')) { const f = v.age < 0.25 ? Math.floor(v.age / 0.125) : v.age < S.cho - 0.4 ? 2 + ((Math.floor(v.age * 6) + i) % 2) : 4 + ((Math.floor(v.age * 10) + i) % 2); FA().veK(c, 'hu-vet-dau', x, y, f, 0, S.rong / 18, i % 2 === 1, 1); continue; }
              if (!chay) { elip(c, x, y, 7, 4, 'rgba(40,24,10,0.75)'); p(c, x - 2, y - 1, 3, 1, 'rgba(160,130,60,0.8)'); continue; }
              if (G.HU_MO !== false && KA('hu-vet-dau') && v.age - S.cho < 0.15) FA().veK(c, 'hu-vet-dau', x, y, 4 + (i % 2), 0, S.rong / 18, i % 2 === 1, 1 - (v.age - S.cho) / 0.15); // soát mượt phiên 3 mục 8: vệt dầu mờ dần dưới lửa (không tắt phụt)
              if (coAnh('hu-vung-lua')) { FA().veK(c, 'hu-vung-lua', x, y, (Math.floor(v.age * 10) + i) % 6, 0, 0.42, false, 1); continue; }
              const fl = Math.floor(v.age * 12 + i) % 3;
              p(c, x - 3, y - 5 - fl, 6, 5 + fl, '#c43c10'); p(c, x - 2, y - 4 - fl, 4, 4 + fl, '#ff8a1e'); p(c, x - 1, y - 3, 2, 2, '#ffd23c');
            }
          }
          c.restore();
        } });
    };
  }
  CT.elite = function (e, id, P, a, T, D, o) {
    if (!ON()) return false;
    if (id === 'namPhongChua') namPhongNhay(e, P, a, T, D, o);
    else if (id === 'caNocChua') caNocLan(e, P, a, T, D, o);
    else if (id === 'huChua') huDau(e, P, a, T, D, o);
    else return false;
    return true;
  };

  // Cử động của chiêu mới dùng lại hàng cử động của chiêu cũ (độ dài, mốc ra đòn): hiệu ứng vẽ code của chiêu CŨ trong cử động đó
  // (js/monster_art.js P.under / P.over: vạch báo, xoáy, mưa ném, vòng đạn giả) phải tắt — js/boss.js, js/mobs.js hỏi hàm này để đặt o.fx = false.
  CT.tatFx = function (e, n) { return ON() && !!e && ((!!e.an && !!e.an.ct && e.an.n === n) || (!!e.act && !!e.act.ct)); };

  // =====================================================================
  // MỖI KHUNG: vật tự quản, thân nhảy, tường chắn
  // =====================================================================
  let truoc = null; // chỗ em bé đứng khung trước (tường chắn)
  function buocThan(e, dt) {
    const N = e.ctNhay;
    if (!N) return;
    if (e.dead) { e.ctNhay = null; e.ctCao = 0; return; }
    N.t += dt;
    const u = clamp(N.t / N.T, 0, 1);
    e.x = N.x0 + (N.x1 - N.x0) * u; e.y = N.y0 + (N.y1 - N.y0) * u; e.ctCao = Math.sin(u * PI) * N.H;
    if (u >= 1) { e.ctNhay = null; e.ctCao = 0; if (N.xong) N.xong(e); }
  }
  function tick(dt) {
    const w = W();
    if (!w) return;
    const P = w.P, chan = [];
    for (const z of w.zones) {
      if (!z.ct || z.dead) continue;
      if (w.over) { z.dead = true; continue; }
      const o = z.ct;
      o.age += dt;
      if (o.buoc && o.buoc(o, dt, P) === false) z.dead = true;
      else { z.x = o.x; z.y = o.y; if (o.chan) chan.push(o); }
    }
    const b = w.boss;
    if (b) {
      buocThan(b, dt);
      const st = b.ctPT;
      if (st && (b.dead || b.phase !== st.ph || !ON())) { for (const q of st.cao) q.on = false; b.ctPT = null; }
      else if (st) for (const q of st.cao) if (q.on && q.d) {
        q.d.t += dt;
        const u = clamp(q.d.t / SO.hoPhanThan.lao, 0, 1);
        q.x = q.d.x0 + (q.d.x1 - q.d.x0) * u; q.y = q.d.y0 + (q.d.y1 - q.d.y0) * u;
        if (u >= 1) { q.on = false; anh('hu-phan-than', q.x, q.y, { sc: 1.6 }); }
      }
    }
    for (const e of w.ents) {
      if (e.ctNhay) buocThan(e, dt);
      if (e.ct && (!e.act || e.act.ct !== e.ct.tok)) e.ct = null;
    }
    // Tường tinh thể: chắn em bé (không cho đi xuyên) và mọi viên đạn bay qua.
    if (chan.length && P && !P.dead) {
      for (const o of chan) for (const t of o.chan) {
        const h = o.day / 2 + 1;
        if (P.y > t.y0 - 3 && P.y < t.y1 + 3) {
          const s0 = truoc ? Math.sign(truoc.x - t.x) || 1 : Math.sign(P.x - t.x) || 1;
          if ((P.x - t.x) * s0 < h) P.x = t.x + s0 * h;
        }
        for (const q of w.projs) {
          if (!(q.t > 0)) continue;
          const nx = q.x + (q.vx || 0) * dt, ny = q.y + (q.vy || 0) * dt;
          if ((q.x - t.x) * (nx - t.x) <= 0 && Math.max(q.y, ny) > t.y0 - 2 && Math.min(q.y, ny) < t.y1 + 2 && q.x !== nx) { q.t = 0; (G.huVt && G.huVt('hu-va-cham') && anh('hu-va-cham', t.x, q.y - 4, { sc: 0.9, mau: '#7fd4ff' })) || G.VE_TAY_MOI !== false || FX('burst', t.x, q.y - 4, '#d8f6ff', 4, 40); } // 15/10 con-ve-tay: đạn chạm tường tinh thể → ảnh va chạm
        }
      }
    }
    truoc = P ? { x: P.x, y: P.y } : null;
  }
  CT.tick = tick;
  if (G.mob && G.mob.tick) { const tick0 = G.mob.tick; G.mob.tick = function (dt) { tick0(dt); tick(dt); }; }
  // Vùng chỉ để báo (đường lăn của Cá Nóc Chúa): lúc hết giờ không rải chớp nổ như vùng nổ thật.
  if (G.fx && G.fx.zoneFire) { const zf = G.fx.zoneFire; G.fx.zoneFire = function (z) { if (z && z.ctBao) return; return zf(z); }; }

  // =====================================================================
  // TÊN CHIÊU + THAY HÀM CHIÊU TRÙM VÙNG (giữ hàm cũ cho ?chieucu=1)
  // =====================================================================
  function thay(kind, key, ten, f) {
    const sk = G.bossSK && G.bossSK[kind] && G.bossSK[kind][key];
    if (!sk || sk.fCu) return;
    const cu = sk.f, tenCu = sk.name;
    sk.fCu = cu; sk.tenCu = tenCu;
    sk.f = function (b, P, T, D, a, sp) { return ON() ? f(b, P, T, D, a, sp) : cu.call(this, b, P, T, D, a, sp); };
    Object.defineProperty(sk, 'name', { get: () => (ON() ? ten : tenCu), configurable: true, enumerable: true });
  }
  thay('ngu', 'c1', TEN.nguBoRiu, boRiu);
  thay('ngu', 'c4', TEN.nguCotNuoc, cotNuoc);
  thay('ngu', 'c5', TEN.nguXoayHut, xoayHut);
  thay('ho', 'c2', TEN.hoVoNhay, voNhay);
  thay('ho', 'c4', TEN.hoPhanThan, phanThan);
  if (G.MINI_SK) {
    const dat = (id, key, ten) => { const M = G.MINI_SK[id]; if (!M) return; const cu = M[key]; Object.defineProperty(M, key, { get: () => (ON() ? ten : cu), configurable: true, enumerable: true }); };
    dat('namChua', 'chieu2', TEN.namMe);
    dat('cuaDa', 'chieu2', TEN.cuaTuong);
  }

  // =====================================================================
  // VẼ: vật ở lớp sàn, thân nhảy (nâng lên + bóng chân), bóng cáo phân thân, thân lăn (xoay, phồng)
  // =====================================================================
  const A = G.art;
  if (!A) return;
  const zone0 = A.zone;
  A.zone = function (c, z) {
    if (z.ct) { if (z.ct.ve && !G.noRender) { try { z.ct.ve(c, z.ct); } catch (err) { if (window.console) console.warn('chieu_trum', err); } } return; }
    return zone0(c, z);
  };
  const bong = (c, e, cao, r) => elip(c, e.x, e.y, r * (1 - Math.min(0.5, cao / 120)), r * 0.35, 'rgba(0,0,0,' + (0.32 - Math.min(0.18, cao / 300)).toFixed(2) + ')');
  function veCao(c, b) {
    const st = b.ctPT;
    if (!st || !G.monsterArt || !b.art || b.dying != null) return;
    for (const q of st.cao) {
      if (!q.on) continue;
      const n = b.an ? b.an.n : 'idle', t = b.an ? b.an.t : 0;
      const o = { anim: q.d ? 'move' : n, t: q.d ? G.time : t, face: q.d ? q.face : (q.x < (W().x0 + W().x1) / 2 ? 1 : -1), dir: q.d ? q.dir : 0, phase: (b.phase | 0) + 1, hit: 0, chop: 1, bao: false, huTrum: true, fx: false, bongGoc: true };
      c.save();
      c.globalAlpha *= SO.hoPhanThan.mo;
      try { G.monsterArt.draw(c, b.art, q.x, q.y, o); } finally { c.restore(); }
    }
  }
  const boss0 = A.boss;
  A.boss = function (c, b) {
    if (!ON() || !b) return boss0(c, b);
    veCao(c, b);
    if (b.ctCao > 0 && b.dying == null) {
      bong(c, b, b.ctCao, 26);
      c.save(); c.translate(0, -Math.round(b.ctCao));
      try { return boss0(c, b); } finally { c.restore(); }
    }
    return boss0(c, b);
  };
  const enemy0 = A.enemy;
  A.enemy = function (c, e) {
    const k = e && e.ct, cao = (e && e.ctCao) || 0;
    if (!ON() || !e || e.dying != null || (!cao && !(k && (k.xoay || k.phong > 1)))) return enemy0(c, e);
    if (cao) bong(c, e, cao, Math.max(8, (e.r || 10) + 2));
    c.save();
    try {
      if (cao) c.translate(0, -Math.round(cao));
      if (k && k.phong > 1) { c.translate(e.x, e.y); c.scale(k.phong, k.phong); c.translate(-e.x, -e.y); }
      if (k && k.xoay) { const cy = e.y - (e.h || 16) * 0.45; c.translate(e.x, cy); c.rotate(k.xoay); c.translate(-e.x, -cy); }
      enemy0(c, e);
    } finally { c.restore(); }
  };
})();
