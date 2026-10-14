// KỸ NĂNG RIÊNG CỦA 24 QUÁI CON (8 vai × 3 vùng) — docs/review/ke-hoach-cai-thien/ky-nang-quai-vung/YEU-CAU.md
// Trước đây 8 vai (G.ROLES) đánh CHUNG một kiểu ở cả ba vùng, chỉ khác hình. Nay mỗi con (mã hình e.art, G.MOB_ART) có cách đánh riêng.
// GIỮ NGUYÊN: vai (chia đợt, cost ở js/stage.js), máu, sát thương gốc e.dmg, tốc độ, giáp phía trước của quái giáp, hồi máu bạn của
// quái giáp, gọi bầy của quái bắn xa. Chỉ thay đòn tấn công và cách báo trước. Tinh anh, trùm nhỏ, trùm vùng: không đổi.
// Báo trước: mọi đòn mới đều có vùng đỏ trên sàn (hệ báo trước js/bao_truoc.js, ảnh gd-bt-*) — vùng chỉ để báo (dmg 0, knBao) hoặc
// vùng đánh thật — dài ít nhất bằng báo trước của vai cũ; né được bằng lộn / chạy.
// Số liệu: bảng SO bên dưới (JSON thuần, công cụ vẽ ảnh soát tĩnh docs/review/ke-hoach-cai-thien/ky-nang-quai-vung/ve_xem.py đọc thẳng).
// sat: hệ số nhân với e.dmg (đòn vai cũ = 1, cảm tử 1,3, bom 1,2, gai 0,8). Cờ ?kynangcu=1: dùng lại cách đánh chung cũ (js/mobs.js).
// Nạp sau js/mobs.js và js/bao_truoc.js (dùng các hàm G.mob.H của js/mobs.js).
(function () {
  const G = window.G;
  if (!G || !G.mob || !G.mob.H) return;
  const H = G.mob.H, W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  let cu = false;
  try { cu = typeof location !== 'undefined' && /[?&]kynangcu=1(&|$)/.test(location.search || ''); } catch (err) { cu = false; }
  const KN = (G.knQuai = { on: !cu });

  // ---------- SỐ LIỆU (JSON thuần giữa hai dấu /*SO*/ ... /*HET-SO*/) ----------
  // Thời gian: giây. Cự li: điểm ảnh game. bao: thời gian báo trước. hoi: nghỉ sau đòn (e.cd). tam: tầm bắt đầu ra đòn.
  const SO = /*SO*/{
    "heoCon": { "bao": 0.6, "tam": 115, "dai": 150, "rong": 18, "toc": 300, "sat": 1.0, "choang": 1.0, "hoi": 1.5 },
    "ongVo": { "tam": 70, "vong": 0.9, "banKinh": 46, "nhat": 3, "cach": 0.6, "bao": 0.5, "rong": 14, "qua": 18, "sat": 0.34, "hoi": 1.3 },
    "boHung": { "bao": 0.6, "tam": 160, "giu": 70, "dai": 170, "rong": 18, "toc": 80, "r": 8, "sat": 1.0, "hoi": 2.4 },
    "hoaBaoTu": { "bao": 0.7, "tam": 190, "bay": 0.75, "r": 14, "lech": 26, "sat": 1.0, "vungR": 12, "vungGiay": 2, "vungSat": 0.5, "hoi": 3 },
    "chonBong": { "giu": 70, "tam": 150, "mo": 0.35, "an": 1.0, "sau": 30, "dau": 18, "bao": 0.45, "r": 34, "xoe": 1.6, "sat": 1.0, "hoi": 3.2 },
    "namPhong": { "bao": 1.0, "r": 40, "sat": 1.3, "may": 34, "mayGiay": 3, "maySat": 0.6 },
    "socNo": { "giu": 95, "tam": 170, "bao": 0.5, "bay": 0.5, "nay": 26, "nayGiay": 0.4, "ngoi": 0.8, "r": 22, "sat": 1.2, "hoi": 3 },
    "nhimDoc": { "giu": 60, "tam": 150, "cuon": 1.4, "bao": 0.8, "dai": 220, "rong": 16, "toc": 190, "sat": 0.9, "hoi": 2.6 },
    "cua": { "gan": 34, "xa": 120, "lechY": 10, "bao": 0.6, "rong": 16, "toc": 260, "cach": 20, "kep": 0.25, "r": 30, "xoe": 0.8, "sat": 1.0, "hoi": 1.5 },
    "caCon": { "giu": 90, "tam": 200, "bao": 0.6, "baoVe": 0.5, "qua": 90, "bienDo": 16, "buoc": 70, "rong": 14, "toc": 150, "sat": 1.0, "hoi": 1.6 },
    "oc": { "bao": 0.6, "sat": 1.0, "hoi": 1.6, "vo": 1.5, "voHoi": 5, "nhot": 3, "nhotR": 12, "nhotCach": 10, "nhotGiay": 3, "cham": 0.4 },
    "haiQuy": { "tam": 190, "bao": 0.7, "goc": 0.32, "dai": 130, "rong": 10, "toc": 140, "sat": 1.0, "gan": 44, "r": 40, "hoi": 3, "hoiGan": 2.2 },
    "caChuon": { "giu": 80, "tam": 170, "bao": 0.35, "bay": 0.85, "cao": 46, "r": 26, "sat": 1.0, "hoi": 3 },
    "caNoc": { "tam": 64, "bao": 1.0, "hut": 26, "gai": 8, "dai": 90, "rong": 8, "toc": 110, "sat": 1.3 },
    "sua": { "giu": 60, "tam": 170, "bao": 0.5, "r": 26, "nhip": [1.6, 1.2, 1.2], "sat": 1.2, "te": 0.3, "hoi": 3.6 },
    "nhim": { "giu": 70, "tam": 150, "cuon": 1.4, "bao": 0.8, "nhanh": 2, "dai": 80, "rong": 8, "lan": 16, "cach": 0.07, "xoay": 0.28, "toc": 85, "giayGai": 1.6, "sat": 0.8, "hoi": 2.4 },
    "linhMa": { "tam": 130, "bao": 0.6, "hien": 0.15, "sau": 34, "dau": 12, "dai": 56, "rong": 14, "sat": 1.0, "hoi": 1.6 },
    "doiThan": { "tam": 100, "bao": 0.55, "canh": 22, "qua": 36, "rong": 10, "lao": 0.22, "sat": 1.0, "hut": 0.2, "hoi": 1.5 },
    "tuongDa": { "gan": 64, "xa": 170, "bao": 0.7, "cach": 0.25, "song": [[0, 30], [28, 52], [50, 74]], "sat": 1.0, "hoi": 2.0 },
    "denLong": { "tam": 190, "bao": 0.7, "dai": 70, "rong": 10, "toc": 62, "giay": 3, "sat": 1.0, "hoi": 3 },
    "meoDen": { "tam": 160, "bao": 0.45, "sat": 1.0, "hoi": 1.8, "bong": 2, "lech": 24, "giay": 5, "tamBong": 30, "baoBong": 0.45, "rongBong": 12, "satBong": 0.35, "hoiBong": 7 },
    "huLua": { "tam": 110, "bao": 0.85, "qua": 10, "rong": 16, "toc": 180, "r": 40, "sat": 1.3, "vet": 14, "vetR": 10, "vetGiay": 2, "vetSat": 0.5 },
    "tieuYeu": { "giu": 95, "tam": 170, "bao": 0.5, "bay": 0.4, "cho": 1.3, "R": 36, "rong": 6, "sat": 1.2, "hoi": 3.4 },
    "nhimThan": { "giu": 80, "tam": 170, "cuon": 1.4, "bao": 0.8, "so": 7, "dau": 22, "cach": 18, "nhip": 0.12, "r": 12, "sat": 0.85, "hoi": 2.6 }
  }/*HET-SO*/;
  KN.SO = SO;
  // Vai cũ để so (js/mobs.js trước phiên này): báo trước của đòn, hệ số sát thương một lần trúng, nghỉ sau đòn.
  KN.CU = /*CU*/{
    "rusher": { "bao": 0.58, "sat": 1.0, "hoi": 1.5 }, "swarm": { "bao": 0.5, "sat": 1.0, "hoi": 1.3 }, "shield": { "bao": 0.6, "sat": 1.0, "hoi": 1.6 },
    "archer": { "bao": 0.7, "sat": 1.0, "hoi": 3 }, "nimble": { "bao": 0.45, "sat": 1.0, "hoi": 1.8 }, "kami": { "bao": 0.85, "sat": 1.3 },
    "bomber": { "bao": 2.2, "sat": 1.2, "hoi": 3 }, "spiky": { "bao": 2.2, "sat": 0.8, "hoi": 1.2 }
  }/*HET-CU*/;

  // ---------- LỜI CHỈ DẪN THEO TỪNG CON (bảng thua "Mẹo:", dòng mẹo lần đầu gặp) ----------
  // Chuỗi tĩnh: dịch ở chỗ vẽ (từ điển tools/ngon-ngu/tu-dien/ky-nang-quai.json).
  const MEO = {
    heoCon: 'Heo Rừng Con cào chân rồi húc thẳng một đường dài: né sang bên, nó đâm tường thì choáng, đánh ngay.',
    ongVo: 'Bầy Ong Vò Vẽ bay vòng quanh rồi bổ vào ba lần theo vạch đỏ: thấy vạch là bước ngang ra khỏi vạch.',
    boHung: 'Bọ Hung lăn cục đất thẳng theo vạch đỏ: bước ra khỏi vạch, rồi vòng ra sau lưng mà đánh.',
    hoaBaoTu: 'Hoa Phun Bào Tử bắn ba hạt rơi xuống vòng đỏ, để lại vũng độc: đi ra khỏi vòng, đừng đứng trong vũng.',
    chonBong: 'Chồn Bóng biến mất rồi hiện sau lưng bạn ở chỗ có vòng đỏ: lộn ra xa chỗ đó rồi quay lại đánh.',
    namPhong: 'Nấm Phồng phồng to rồi nổ, để lại mây độc 3 giây: chạy xa vòng đỏ, đừng đứng trong mây.',
    socNo: 'Sóc ném hạt dẻ nảy một lần rồi nổ ở vòng đỏ phía sau bạn: bước sang bên hoặc tiến về phía con sóc.',
    nhimDoc: 'Nhím Gai Độc cuộn tròn rồi lăn theo vạch đỏ, chạm tường bật lại một lần: tránh cả hai vạch.',
    cua: 'Cua Lính chờ ngang hàng rồi lướt ngang tới kẹp: đừng đứng cùng hàng ngang với nó, đi lên hoặc xuống.',
    caCon: 'Bầy Cá Con bơi lượn sóng theo vạch đỏ, qua rồi quay lại một lần: tránh vạch cả hai lượt.',
    oc: 'Ốc Mượn Hồn bị đánh thì rút vỏ, không ăn đòn; bò ra để lại vệt nhớt làm chậm: chờ nó ra hẵng đánh, tránh vệt nhớt.',
    haiQuy: 'Hải Quỳ bắn ba tia nước hình quạt theo vạch đỏ, đứng sát thì bị xúc tu quét: đứng giữa hai vạch hoặc lùi ra.',
    caChuon: 'Cá Chuồn vọt lên rồi đáp xuống vòng đỏ dưới chân bạn: thấy vòng là chạy ra ngoài.',
    caNoc: 'Cá Nóc hút bạn lại gần rồi nổ 8 gai theo 8 vạch: chạy ngược ra xa, đứng giữa hai vạch.',
    sua: 'Sứa Bom thả vũng điện, vòng đỏ đầy là vũng sáng lên, giật và làm tê: đừng đứng trong vũng lúc vòng sắp đầy.',
    nhim: 'Nhím Biển bắn gai xoáy ốc: luồn qua khe giữa hai cánh gai, đừng đứng sát.',
    linhMa: 'Lính Ma đánh dấu chỗ sau lưng bạn rồi hiện ra chém một đường: bước ra khỏi vạch đỏ.',
    doiThan: 'Bầy Dơi Than bổ nhào hình chữ V, trúng thì dơi hồi máu: tránh hai vạch đỏ.',
    tuongDa: 'Tượng Đá đứng im, lại gần thì đập đất, sóng vòng lan ra: đánh xong lùi xa hoặc lộn qua sóng.',
    denLong: 'Đèn Lồng Ma bắn lửa ma đuổi theo bạn 3 giây: chém trúng là tan, hoặc chạy vòng cho hết lửa.',
    meoDen: 'Mèo Đen tạo hai bóng ảo: chỉ con thật ăn đòn, bóng lao vào thì tan, né vạch đỏ của bóng.',
    huLua: 'Hũ Lửa lăn tới rồi vỡ, để lại vệt lửa 2 giây: tránh vạch đỏ và vòng đỏ cuối đường.',
    tieuYeu: 'Tiểu Yêu đặt ba lá bùa thành tam giác quanh bạn rồi nổ cả vùng: chạy ra khỏi tam giác.',
    nhimThan: 'Nhím Than Hồng làm gai lửa trồi từ đất thành hàng về phía bạn: bước ngang khỏi hàng vòng đỏ.',
  };
  const tenQuai = (id) => { const d = G.monsterArt && G.monsterArt._defs && G.monsterArt._defs[id]; return (d && d.ten) || id; };
  // js/stage.js (bảng thua): khoá W.hurtBy là mã hình (js/combat.js hurtKey) → [tên con, mẹo]
  KN.meo = (key) => (KN.on && MEO[key] ? [tenQuai(key), MEO[key]] : null);

  // ---------- tiện ích ----------
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }
  const anh = (ma, x, y, o) => (!G.noRender && G.fx && G.fx.anh ? G.fx.anh(ma, x, y, o) : false);
  const FA = () => G.fxAnh;
  function trong(x, y) { const w = W(); return [clamp(x, w.x0 + 4, w.x1 - 4), clamp(y, w.y0 + 2, w.y1 - 2)]; }
  function giu(e) { const w = W(); e.x = clamp(e.x, w.x0, w.x1); e.y = clamp(e.y, w.y0, w.y1); }
  // Quãng đi được theo góc a trước khi chạm mép sàn (tối đa max). tuong2: kèm mép nào ('x' trái/phải, 'y' trên/dưới).
  function tuong2(x, y, a, max) {
    const w = W(), c = Math.cos(a), s = Math.sin(a);
    let t = max, m = null;
    const thu = (v, k) => { if (v < t) { t = v; m = k; } };
    if (c > 1e-6) thu((w.x1 - 2 - x) / c, 'x'); else if (c < -1e-6) thu((w.x0 + 2 - x) / c, 'x');
    if (s > 1e-6) thu((w.y1 - 1 - y) / s, 'y'); else if (s < -1e-6) thu((w.y0 + 1 - y) / s, 'y');
    return { t: Math.max(0, t), m };
  }
  const tuong = (x, y, a, max) => tuong2(x, y, a, max).t;
  // Em bé thật có đang chạm (x, y) trong bán kính r (đo dẹt theo chiều dọc) không.
  function cham(x, y, r) { const P = W().P; return !!P && !P.dead && Math.hypot(P.x - x, (P.y - y) * 1.5) < r; }
  function mat(e, a) { if (Math.abs(Math.cos(a)) > 0.15) e.face = Math.cos(a) > 0 ? 1 : -1; }
  // Vùng CHỈ ĐỂ BÁO (không sát thương): vẽ đỏ như vùng thật, lúc hết giờ chớp một nhịp; đòn thật do thân quái / vật bay gây.
  function baoV(e, shape, geo, t, o) { return H.addZone(shape, geo, t, 0, null, Object.assign({ src: e, cancel: true, knBao: true }, o || {})); }
  // Vùng đánh thật (báo trước rồi nổ). knHuy: quái bị choáng / đóng băng thì huỷ (như đòn chưa ra của vai cũ).
  function danh(e, shape, geo, t, dmg, el, o) { return H.addZone(shape, geo, t, dmg, el || null, Object.assign({ src: e, cancel: true }, o || {})); }
  // Vật tự quản (cục đất lăn, vũng điện, vệt nhớt, bóng ảo, bùa...): nằm trong W.zones với hình 'kn' (luật vùng bỏ qua: không báo,
  // không trúng), mỗi khung gọi o.buoc(o, dt, P) (trả false thì xoá), vẽ ở lớp sàn bằng o.ve(c, o).
  function vat(o) { o.age = 0; const z = { shape: 'kn', t: 0, t0: 0, life: 1e9, dmg: 0, x: o.x || 0, y: o.y || 0, kn: o }; o.z = z; W().zones.push(z); return o; }
  const p = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  function elip(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU); c.fill(); }

  // ---------- phần giữ nguyên của vai: quái giáp hồi máu bạn, quái bắn xa gọi bầy, cách đi ----------
  function chuaBan(e, dt) {
    const w = W();
    e.healCd = (e.healCd == null ? 3 : e.healCd) - dt;
    if (e.healCd > 0) return false;
    const hurt = w.ents.filter((x) => !x.dead && x !== e && x.hp < x.maxhp * 0.95 && Math.hypot(x.x - e.x, x.y - e.y) < 90);
    e.healCd = hurt.length ? G.rr(7, 9) : 1.5;
    if (!hurt.length) return false;
    H.begin(e, 'heal', e.face > 0 ? 0 : PI, 0.6, { cd: 1, keepFace: true, fire: (q) => {
      for (const x of w.ents) if (!x.dead && Math.hypot(x.x - q.x, x.y - q.y) < 90) { const h = x.maxhp * 0.14; x.hp = Math.min(x.maxhp, x.hp + h); FX('text', x.x, x.y - x.h - 4, '+' + Math.round(h), '#8fe86a', 8); }
      q.healFx = 0.6; FX('sparkle', q.x, q.y - 6, '#8fe86a', 14); G.sfx('pick', 1.6);
    } });
    return true;
  }
  function goiBay(e, dt, a) {
    const w = W();
    e.sumCd = (e.sumCd == null ? 8 : e.sumCd) - dt;
    const allies = w.ents.filter((x) => !x.dead && x.sum === e).length + (w.spawns || []).filter((s) => s.opt && s.opt.sumBy === e).length;
    if (e.sumCd > 0 || allies >= 2 || w.ents.length >= 9) return false;
    e.sumCd = G.rr(12, 16);
    H.begin(e, 'summon', a, 0.6, { cd: 1, fire: (q) => { for (let i = 0; i < 2; i++) { const b = a + PI + (i ? 0.9 : -0.9); H.summon('swarm', q.x + Math.cos(b) * 26, q.y + Math.sin(b) * 20, { hpMult: 0.45, sumBy: q }); } FX('sparkle', q.x, q.y - q.h * 0.5, '#ffd23f', 10); } });
    return true;
  }
  function xaThu(e, dt, P, sp) { const w = W(); H.keep(e, P, Math.min(120, (w.x1 - w.x0) * 0.42), sp, dt, e.t % 6 < 3 ? 1 : -1); }
  // Quái giáp đi chậm, không tự xoay mặt (H.faceSlow lo việc quay): tiến khi xa, lùi nhẹ khi quá gần.
  function diKhien(e, P, sp, dt, want) {
    const dx = P.x - e.x, dy = P.y - e.y, dd = Math.hypot(dx, dy) || 1;
    const k = dd > want + 8 ? 1 : dd < want - 22 ? -0.6 : 0;
    if (k) { e.x += (dx / dd) * sp * k * dt; e.y += (dy / dd) * sp * 0.75 * k * dt; e.moving = true; giu(e); }
  }

  // =====================================================================
  // CÁCH ĐÁNH THEO TỪNG CON. Mỗi hàm thay trọn think() của vai (đi + ra đòn). e.cd do js/mobs.js đếm.
  // =====================================================================
  const T = {};

  // ---------------- RỪNG GIÀ (dễ, dạy cơ bản) ----------------
  // Heo Rừng Con · Húc thẳng: cào chân (vạch đỏ dọc đường húc) rồi lao một đường dài, trượt quá chỗ bé; đâm tường thì choáng.
  T.heoCon = function (e, dt, P, sp, d, a) {
    const S = SO.heoCon;
    if (d > S.tam - 10) H.moveTo(e, P.x, P.y, sp, dt); else mat(e, a);
    if (e.cd > 0 || d > S.tam) return;
    const g = tuong2(e.x, e.y, a, S.dai), len = Math.max(24, g.t), dam = g.t < S.dai - 1;
    baoV(e, 'line', { x: e.x, y: e.y, ang: a, len, w: S.rong }, S.bao, { knHuy: true });
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + len / S.toc + 0.2, s: 0, trung: false,
      fire: (q) => { FX('lunge', q); G.sfx('swing', 0.8); },
      step: (q, A, dt2) => {
        if (!A.fired || A.s >= len) return;
        const k = Math.min(len - A.s, S.toc * dt2);
        A.s += k; q.x += Math.cos(A.a) * k; q.y += Math.sin(A.a) * k; giu(q); q.moving = true;
        if (!A.trung && cham(q.x, q.y, q.r + 9)) A.trung = G.hurtPlayer(q.dmg * S.sat, null, q, true);
        if (A.s >= len && dam) {
          q.st.stun = Math.max(q.st.stun || 0, S.choang);
          FX('text', q.x, q.y - q.h - 6, 'Choáng!', '#ffd23f', 8); FX('burst', q.x + Math.cos(A.a) * 6, q.y, '#c8b090', 10, 60); G.sfx('boom', 1.5);
          W().shake = Math.max(W().shake || 0, 0.1);
        }
      } });
    G.sfx('warn', 1.2);
  };

  // Bầy Ong Vò Vẽ · Vòng vây chích: bay vòng quanh bé một vòng rồi bổ thẳng vào 3 lần (mỗi lần một vạch đỏ, xuyên qua bé sang phía bên kia).
  T.ongVo = function (e, dt, P, sp, d, a) {
    const S = SO.ongVo;
    if (d > S.tam - 16) H.moveTo(e, P.x, P.y, sp, dt); else mat(e, a);
    if (e.cd > 0 || d > S.tam) return;
    const chieu = G.rnd() < 0.5 ? 1 : -1, g0 = Math.atan2(e.y - P.y, e.x - P.x), t0 = 0.01;
    H.begin(e, 'kn', a, t0, { cd: S.hoi, end: t0 + S.vong + S.nhat * S.cach + 0.35, anim1: 'move', n: 0, lao: null,
      step: (q, A, dt2, P2) => {
        if (!A.fired) return;
        const t = A.t - t0;
        if (A.lao) {
          A.lao.t += dt2; const u = Math.min(1, A.lao.t / 0.12);
          q.x = A.lao.x0 + (A.lao.x1 - A.lao.x0) * u; q.y = A.lao.y0 + (A.lao.y1 - A.lao.y0) * u;
          if (u >= 1) { A.lao = null; H.loop(q, 'move'); }
        }
        if (t < S.vong) {
          const g = g0 + chieu * TAU * (t / S.vong), tx = P2.x + Math.cos(g) * S.banKinh, ty = P2.y + Math.sin(g) * S.banKinh * 0.7, k = Math.min(1, dt2 * 12);
          if (Math.abs(tx - q.x) > 1) q.face = tx > q.x ? 1 : -1;
          q.x += (tx - q.x) * k; q.y += (ty - q.y) * k; giu(q); q.moving = true;
          return;
        }
        if (A.n < S.nhat && t >= S.vong + A.n * S.cach) {
          const b = Math.atan2(P2.y - q.y, P2.x - q.x), L = Math.hypot(P2.x - q.x, P2.y - q.y) + S.qua;
          A.n++; A.a = b; q.dirA = b; mat(q, b); H.play(q, 'tele', 1.2);
          danh(q, 'line', { x: q.x, y: q.y, ang: b, len: L, w: S.rong }, S.bao, q.dmg * S.sat, null, { melee: true, knHuy: true, onFire: () => {
            if (q.dead || q.st.stun > 0 || q.st.frozen > 0) return;
            const e2 = trong(q.x + Math.cos(b) * L, q.y + Math.sin(b) * L);
            A.lao = { x0: q.x, y0: q.y, x1: e2[0], y1: e2[1], t: 0 }; H.play(q, 'atk');
          } });
        }
      } });
  };

  // Bọ Hung Mai Cứng · Lăn cầu đất: giáp trước giữ nguyên; đẩy một cục đất lăn thẳng chậm theo vạch đỏ, chạm tường (hoặc chạm bé) thì vỡ.
  T.boHung = function (e, dt, P, sp, d, a) {
    const S = SO.boHung;
    H.faceSlow(e, P, dt);
    if (chuaBan(e, dt)) return;
    diKhien(e, P, sp, dt, S.giu);
    if (e.cd > 0 || d > S.tam || (P.x - e.x) * e.face <= -8) return;
    const len = Math.max(20, tuong(e.x, e.y, a, S.dai));
    baoV(e, 'line', { x: e.x, y: e.y, ang: a, len, w: S.rong }, S.bao, { knHuy: true });
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, keepFace: true, end: S.bao + 0.35, fire: (q) => { cauDat(q, a, len); W().shake = Math.max(W().shake || 0, 0.06); G.sfx('swing', 0.6); } });
  };
  function cauDat(q, a, len) {
    const S = SO.boHung, c0 = Math.cos(a), s0 = Math.sin(a);
    vat({ x: q.x + c0 * 6, y: q.y + s0 * 4, s: 6, len, src: q, dmg: q.dmg * S.sat, quay: 0,
      buoc(o, dt) {
        const k = S.toc * dt;
        o.s += k; o.x += c0 * k; o.y += s0 * k; o.quay += k / S.r;
        if (cham(o.x, o.y, S.r + 5) && G.hurtPlayer(o.dmg, null, o.src, false)) { vo(o); return false; }
        if (o.s >= o.len) { vo(o); return false; }
        return true;
      },
      ve(c, o) { // chưa có ảnh: vẽ tạm (prompt hu-cau-dat-lan trong PROMPT-ANH.md)
        const r = S.r, x = Math.round(o.x), y = Math.round(o.y);
        elip(c, x, y + 1, r, r * 0.35, 'rgba(0,0,0,0.3)');
        elip(c, x, y - r, r + 1, r + 1, '#14182e'); elip(c, x, y - r, r, r, '#7a5a32'); elip(c, x - 2, y - r - 2, r * 0.55, r * 0.55, '#a07a46');
        for (let i = 0; i < 4; i++) { const g = o.quay + i * PI / 2; p(c, x + Math.cos(g) * r * 0.6 - 1, y - r + Math.sin(g) * r * 0.6 - 1, 2, 2, '#4e3820'); }
      } });
    function vo(o) { FX('burst', o.x, o.y - S.r, '#a07a46', 12, 70); G.sfx('hit', 0.7); }
  }

  // Hoa Phun Bào Tử · Mưa bào tử: 3 hạt bay vòng cung rơi xuống chỗ bé (vòng đỏ), đáp đất thành vũng độc nhỏ 2 giây.
  T.hoaBaoTu = function (e, dt, P, sp, d, a) {
    if (goiBay(e, dt, a)) return;
    xaThu(e, dt, P, sp);
    const S = SO.hoaBaoTu;
    if (e.cd > 0 || d >= S.tam) return;
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + 0.45, fire: (q) => {
      const b = Math.atan2(P.y - q.y, P.x - q.x), nx = -Math.sin(b), ny = Math.cos(b);
      for (const s of [0, -1, 1]) {
        const v = trong(P.x + nx * S.lech * s + Math.cos(b) * 8 * Math.abs(s), P.y + ny * S.lech * s * 0.7 + Math.sin(b) * 8 * Math.abs(s));
        danh(q, 'circle', { x: v[0], y: v[1], r: S.r }, S.bay, q.dmg * S.sat, null, { cancel: false, knGiu: true, fxKind: 'bomb', bomb: { x0: q.x, y0: q.y - q.h * 0.5, fl: S.bay, art: q.art, anh: 'hu-dan-bao-tu' },
          onFire: (z) => { H.addZone('circle', { x: z.x, y: z.y, r: S.vungR }, 0, q.dmg * S.vungSat, 'poison', { pool: true, life: S.vungGiay, tick: 0.3 }); FX('burst', z.x, z.y, '#9be04a', 6, 40); } });
      }
      G.sfx('swing', 1.3);
    } });
    G.sfx('warn', 1.3);
  };

  // Chồn Bóng · Lẩn bóng: mờ dần rồi biến mất 1 giây (vòng đỏ ở chỗ sẽ hiện, SAU LƯNG bé), hiện ra cào một nhát hình quạt.
  T.chonBong = function (e, dt, P, sp, d, a) {
    const S = SO.chonBong, k = e.kn;
    if (k.lui > 0) { k.lui -= dt; H.keep(e, P, 90, sp, dt, 1); return; }
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d > S.tam) return;
    const f = (P.face || 1) < 0 ? -1 : 1, h = trong(P.x - f * S.sau, P.y + G.rr(-6, 6));
    H.begin(e, 'kn', a, S.mo, { cd: S.hoi, end: S.mo + S.an + S.bao + 0.4, b: 0,
      fire: (q) => { q.ghost = true; k.anT = S.an + 0.3; k.mo = 0; baoV(q, 'circle', { x: h[0], y: h[1], r: S.dau }, S.an); FX('burst', q.x, q.y - 6, '#5a3a8a', 10, 50); G.sfx('swing', 0.6); },
      step: (q, A, dt2, P2) => {
        if (!A.fired) { k.mo = 1 - 0.8 * Math.min(1, A.t / S.mo); return; }
        if (A.b === 0) {
          k.mo = 0;
          if (A.t < S.mo + S.an) return;
          A.b = 1; q.x = h[0]; q.y = h[1]; q.ghost = false; k.anT = 0; k.mo = 1;
          const b = Math.atan2(P2.y - h[1], P2.x - h[0]); A.a = b; q.dirA = b; mat(q, b); H.play(q, 'tele', 1.5);
          danh(q, 'cone', { x: h[0], y: h[1], ang: b, r: S.r, span: S.xoe }, S.bao, q.dmg * S.sat, null, { melee: true, knHuy: true });
          FX('burst', h[0], h[1] - 6, '#8a6ad0', 12, 70);
          return;
        }
        if (A.b === 1 && A.t >= S.mo + S.an + S.bao) { A.b = 2; H.play(q, 'atk'); k.lui = 0.9; }
      } });
  };

  // Nấm Phồng · Nổ bào tử: phồng to 1 giây (vòng đỏ) rồi nổ, để lại đám mây độc 3 giây (đứng trong mất máu chậm).
  T.namPhong = function (e, dt, P, sp, d, a) {
    const S = SO.namPhong, tam = (e.don && e.don.tam) || 32;
    if (d > tam * 0.6) H.moveTo(e, P.x, P.y, sp, dt);
    if (e.cd > 0 || d >= tam + 6) return;
    H.begin(e, 'boom', a, S.bao, { cd: 9, end: S.bao + H.dur(e.art, 'atk'),
      zone: danh(e, 'circle', { x: e.x, y: e.y, r: S.r }, S.bao, e.dmg * S.sat, 'poison'),
      fire: (q) => {
        q.ghost = true; q.boomT = H.dur(q.art, 'atk') * 0.95;
        FX('propBlast', { x: q.x, y: q.y, nr: S.r }, 'poison'); G.sfx('boom', 1.1);
        H.addZone('circle', { x: q.x, y: q.y, r: S.may }, 0, q.dmg * S.maySat, 'poison', { pool: true, life: S.mayGiay, tick: 0.3 });
        mayDoc(q.x, q.y, S.may, S.mayGiay);
      } });
    G.sfx('warn', 0.8);
  };
  function mayDoc(x, y, r, giay) {
    vat({ x, y, life: giay,
      buoc(o) { return o.age < o.life; },
      ve(c, o) { // ảnh có sẵn hu-may-doc (lặp lại), không có thì vài cụm khói vẽ tạm
        const k = Math.min(1, o.age / 0.25) * Math.min(1, (o.life - o.age) / 0.5), a = FA() && FA().get('hu-may-doc');
        if (a) { const t = a.lap ? o.age : o.age % a.giay; if (FA().ve(c, 'hu-may-doc', o.x, o.y, t, 0, (r * 2) / Math.max(8, a.fw * a.co), false, 0.85 * k)) return; }
        for (let i = 0; i < 6; i++) { const g = i * TAU / 6 + o.age * 0.6, rr = r * (0.45 + 0.1 * Math.sin(o.age * 3 + i)); elip(c, o.x + Math.cos(g) * rr, o.y - 4 + Math.sin(g) * rr * 0.5, 7, 5, 'rgba(150,220,90,' + (0.28 * k).toFixed(2) + ')'); }
      } });
  }

  // Sóc Ném Quả Nổ · Ném hạt dẻ: hạt dẻ bay cong tới chỗ bé, nảy thêm một đoạn rồi nổ vòng nhỏ (vòng đỏ ở chỗ nổ từ lúc ném).
  T.socNo = function (e, dt, P, sp, d, a) {
    const S = SO.socNo;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d >= S.tam) return;
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + H.dur(e.art, 'atk') * 0.8, fire: (q) => {
      const b = Math.atan2(P.y - q.y, P.x - q.x), v1 = trong(P.x, P.y), v2 = trong(v1[0] + Math.cos(b) * S.nay, v1[1] + Math.sin(b) * S.nay * 0.8), el = H.regEl();
      danh(q, 'circle', { x: v2[0], y: v2[1], r: S.r }, S.bay + S.nayGiay + S.ngoi, q.dmg * S.sat, el, { cancel: false, knGiu: true, fxKind: 'bomb',
        bomb: { x0: q.x, y0: q.y - q.h * 0.5, fl: S.bay + S.nayGiay, art: q.art, nx: v1[0], ny: v1[1], f1: S.bay },
        onHit: H.onBlastHit(el), onFire: (z) => H.blast(z.x, z.y, z.r, el, q.dmg) });
      G.sfx('swing', 1.1);
    } });
  };

  // Nhím Gai Độc · Cuộn lăn: cuộn tròn (vòng đỏ quanh thân) rồi vạch đỏ đường lăn, lăn thẳng, chạm tường bật lại một lần.
  // Không còn bắn cầu gai, không còn phản đòn khi dựng gai.
  function duongLan(x, y, a, dai) {
    const g = tuong2(x, y, a, dai), L1 = Math.max(16, g.t), out = [{ x, y, a, len: L1 }];
    if (g.t < dai - 1 && g.m) {
      const bx = x + Math.cos(a) * L1, by = y + Math.sin(a) * L1, a2 = g.m === 'x' ? PI - a : -a, L2 = Math.min(dai - L1, tuong(bx, by, a2, dai - L1));
      if (L2 > 8) out.push({ x: bx, y: by, a: a2, len: L2 });
    }
    return out;
  }
  function cuonLan(e, dt, P, sp, d, a) {
    const S = SO.nhimDoc, T0 = S.cuon + S.bao;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d >= S.tam) return;
    baoV(e, 'circle', { x: e.x, y: e.y, r: e.r + 7 }, S.cuon, { knHuy: true });
    G.sfx('warn', 0.7);
    H.begin(e, 'kn', a, T0, { cd: S.hoi, end: T0 + 1.6, path: null, i: 0, s: 0, trung: false,
      step: (q, A, dt2, P2) => {
        if (!A.path && A.t >= S.cuon) {
          A.path = duongLan(q.x, q.y, Math.atan2(P2.y - q.y, P2.x - q.x), S.dai);
          for (const g of A.path) baoV(q, 'line', { x: g.x, y: g.y, ang: g.a, len: g.len, w: S.rong }, Math.max(0.05, T0 - A.t), { knHuy: true });
          A.a = A.path[0].a; q.dirA = A.a; mat(q, A.a);
          A.end = T0 + A.path.reduce((s, g) => s + g.len, 0) / S.toc + 0.3;
        }
        if (!A.fired || !A.path || A.i >= A.path.length) { if (A.fired) q.kn.xoay = 0; return; }
        const g = A.path[A.i], k = Math.min(g.len - A.s, S.toc * dt2);
        A.s += k; q.x += Math.cos(g.a) * k; q.y += Math.sin(g.a) * k; giu(q); q.moving = true;
        q.kn.xoay = (q.kn.xoay || 0) + (k / Math.max(4, q.r)) * (Math.cos(g.a) >= 0 ? 1 : -1);
        if (!A.trung && cham(q.x, q.y, q.r + 8)) A.trung = G.hurtPlayer(q.dmg * S.sat, regElGai(), q, true);
        if (A.s >= g.len - 0.01) { A.i++; A.s = 0; if (A.i < A.path.length) { A.a = A.path[A.i].a; q.dirA = A.a; mat(q, A.a); FX('burst', q.x, q.y - 4, '#c8b090', 6, 50); G.sfx('hit', 0.9); } }
      } });
  }
  const regElGai = () => (H.regEl() === 'poison' ? 'poison' : null); // gai Rừng già có độc như gai cũ
  T.nhimDoc = cuonLan;

  // ---------------- HANG BIỂN (nước: kéo, đẩy, làm chậm) ----------------
  // Cua Lính · Lướt ngang kẹp: căn cho thẳng hàng ngang với bé, rồi chạy NGANG (trục X) tới sát bé và kẹp hai càng (quạt hẹp).
  T.cua = function (e, dt, P, sp, d, a) {
    const S = SO.cua, dx = P.x - e.x, dy = P.y - e.y, s = dx >= 0 ? 1 : -1, ax = Math.abs(dx);
    const ok = Math.abs(dy) < S.lechY && ax >= S.gan - 6 && ax <= S.xa + 6;
    if (!ok) H.moveTo(e, ax < S.gan ? P.x - s * S.gan : ax > S.xa ? P.x - s * S.xa : e.x, P.y, sp, dt);
    else e.face = s;
    if (e.cd > 0 || !ok) return;
    const xe = clamp(P.x - s * S.cach, W().x0, W().x1), len = Math.max(4, Math.abs(xe - e.x)), chay = len / S.toc, ang = s > 0 ? 0 : PI;
    baoV(e, 'line', { x: e.x, y: e.y, ang, len, w: S.rong }, S.bao, { knHuy: true });
    danh(e, 'cone', { x: xe, y: e.y, ang, r: S.r, span: S.xoe }, S.bao + chay + S.kep, e.dmg * S.sat, null, { melee: true, knHuy: true });
    H.begin(e, 'kn', ang, S.bao, { cd: S.hoi, end: S.bao + chay + S.kep + 0.3, s: 0, kep: false, anim1: 'move',
      step: (q, A, dt2) => {
        if (!A.fired) return;
        if (A.s < len) { const k = Math.min(len - A.s, S.toc * dt2); A.s += k; q.x += s * k; giu(q); q.moving = true; return; }
        if (!A.kep && A.t >= S.bao + chay + S.kep - 0.12) { A.kep = true; H.play(q, 'atk'); }
      } });
  };

  // Bầy Cá Con · Đàn sóng: cả đàn bơi xuyên phòng theo đường hình sin (vạch đỏ), qua khỏi bé rồi vòng lại một lần theo đúng đường đó.
  T.caCon = function (e, dt, P, sp, d, a) {
    const S = SO.caCon;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d > S.tam) return;
    const x0 = e.x, y0 = e.y, c0 = Math.cos(a), s0 = Math.sin(a), L = Math.max(30, tuong(x0, y0, a, d + S.qua));
    const at = (s) => trong(x0 + c0 * s - s0 * S.bienDo * Math.sin((TAU * s) / S.buoc), y0 + s0 * s + c0 * S.bienDo * Math.sin((TAU * s) / S.buoc) * 0.8);
    const baoDuong = (t) => { for (let s = 0; s < L; s += 20) { const q0 = at(s), q1 = at(Math.min(L, s + 20)); baoV(e, 'line', { x: q0[0], y: q0[1], ang: Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), len: Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) + 1, w: S.rong }, t, { knHuy: true }); } };
    baoDuong(S.bao);
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + (2 * L) / S.toc + S.baoVe + 0.3, anim1: 'move', s: 0, luot: 0, cho: 0, trung: false,
      step: (q, A, dt2) => {
        if (!A.fired || A.luot > 1) return;
        if (A.cho > 0) { A.cho -= dt2; return; }
        A.s += S.toc * dt2 * (A.luot ? -1 : 1);
        const v = at(clamp(A.s, 0, L)); if (Math.abs(v[0] - q.x) > 0.5) q.face = v[0] > q.x ? 1 : -1;
        q.x = v[0]; q.y = v[1]; q.moving = true;
        if (!A.trung && cham(q.x, q.y, q.r + 8)) A.trung = G.hurtPlayer(q.dmg * S.sat, null, q, true);
        if (!A.luot && A.s >= L) { A.luot = 1; A.trung = false; A.cho = S.baoVe; baoDuong(S.baoVe); H.play(q, 'tele', 1.4); }
        else if (A.luot && A.s <= 0) A.luot = 2;
      } });
  };

  // Ốc Mượn Hồn · Rút vỏ: bị đánh trúng thì rút vào vỏ 1,5 giây (miễn sát thương), bò ra để lại vệt nhớt làm chậm 40% (3 giây).
  // Đòn đập phía trước giữ như vai giáp cũ (nay có vùng báo đỏ).
  T.oc = function (e, dt, P, sp, d, a) {
    const S = SO.oc, k = e.kn;
    if (k.vo > 0) return; // đang trong vỏ: nằm im
    H.faceSlow(e, P, dt);
    if (chuaBan(e, dt)) return;
    const dx = P.x - e.x, dd = Math.hypot(dx, P.y - e.y);
    if (dd > 20) { const kk = sp / dd; e.x += dx * kk * dt; e.y += (P.y - e.y) * kk * 0.75 * dt; e.moving = true; }
    if (e.cd > 0 || d >= H.reachOf(e) + 4 || (P.x - e.x) * e.face <= -8) return;
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, keepFace: true, zone: H.strikeZone(e, a, S.bao, S.sat, { quiet: false, knHuy: true }), fire: () => { W().shake = Math.max(W().shake || 0, 0.08); } });
  };
  function ocRut(e) {
    const S = SO.oc, k = e.kn;
    if (k.vo > 0 || k.voCd > 0 || e.dead) return;
    k.vo = S.vo; k.voCd = S.voHoi; e.invuln = S.vo;
    for (const z of W().zones) if (z.src === e && z.t > 0 && !z.pool && !z.knGiu) z.dead = true;
    e.act = null; e.wind = 0;
    H.begin(e, 'vo', e.face > 0 ? 0 : PI, 0.01, { keepFace: true, anim1: 'hit', spd1: 0.12, end: S.vo, cd: 0.5 });
    FX('text', e.x, e.y - e.h - 6, 'Rút vỏ!', '#cfe8f5', 8); G.sfx('hit', 0.6);
  }
  function ocTick(e, k, dt) {
    const S = SO.oc;
    if (k.voCd > 0) k.voCd -= dt;
    if (k.vo > 0) {
      k.vo -= dt; e.invuln = Math.max(0, k.vo);
      if (k.vo <= 0) { e.invuln = 0; k.nhot = S.nhot; k.nx = null; }
      return;
    }
    if (k.nhot > 0) {
      k.nhot -= dt;
      if (k.nx == null || Math.hypot(e.x - k.nx, e.y - k.ny) >= S.nhotCach) { k.nx = e.x; k.ny = e.y; vetNhot(e.x, e.y); }
    }
  }
  function vetNhot(x, y) {
    const S = SO.oc, r = S.nhotR;
    vat({ x, y, life: S.nhotGiay, seed: (x * 7 + y * 13) | 0,
      buoc(o) {
        const P = W().P;
        if (P && !P.dead && ((P.x - o.x) / r) ** 2 + ((P.y - o.y) / (r * 0.6)) ** 2 <= 1) P.knCham = Math.max(P.knCham || 0, 0.12); // js/combat.js: đi chậm 40%
        return o.age < o.life;
      },
      ve(c, o) { // chưa có ảnh: vẽ tạm (prompt hu-vet-nhot trong PROMPT-ANH.md)
        const k = Math.min(1, o.age / 0.2) * Math.min(1, (o.life - o.age) / 0.6);
        elip(c, o.x, o.y, r, r * 0.55, 'rgba(120,200,190,' + (0.38 * k).toFixed(2) + ')');
        elip(c, o.x - 3, o.y - 1, r * 0.45, r * 0.22, 'rgba(220,255,250,' + (0.35 * k).toFixed(2) + ')');
        if ((o.seed + Math.floor(o.age * 4)) % 3 === 0) p(c, o.x + 4, o.y - 2, 1, 1, 'rgba(255,255,255,' + (0.7 * k).toFixed(2) + ')');
      } });
  }

  // Hải Quỳ · Quạt tia nước: 3 tia nước hình quạt (3 vạch đỏ); bé đứng sát thì quét xúc tu một vòng gần (vòng đỏ).
  T.haiQuy = function (e, dt, P, sp, d, a) {
    if (goiBay(e, dt, a)) return;
    xaThu(e, dt, P, sp);
    const S = SO.haiQuy;
    if (e.cd > 0 || d >= S.tam) return;
    if (d < S.gan) {
      H.begin(e, 'kn', a, S.bao, { cd: S.hoiGan, zone: danh(e, 'circle', { x: e.x, y: e.y, r: S.r }, S.bao, e.dmg * S.sat, null, { melee: true, knHuy: true }), fire: (q) => FX('burst', q.x, q.y - 4, '#a6deff', 12, 70) });
      return;
    }
    const gs = [a - S.goc, a, a + S.goc];
    for (const g of gs) baoV(e, 'line', { x: e.x, y: e.y, ang: g, len: S.dai, w: S.rong }, S.bao, { knHuy: true });
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + 0.45, fire: (q) => { for (const g of gs) H.shoot(q, g, S.toc, { dmg: q.dmg * S.sat, col: '#a6deff', col2: '#3883d4', t: 2 }); G.sfx('swing', 1.5); } });
    G.sfx('warn', 1.3);
  };

  // Cá Chuồn · Vọt đáp: nhún (báo) rồi vọt lên, bóng tròn đỏ báo chỗ rơi dưới chân bé, đáp xuống tạo vòng nước.
  T.caChuon = function (e, dt, P, sp, d, a) {
    const S = SO.caChuon, k = e.kn;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d > S.tam) return;
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + S.bay + 0.35, anim1: 'move',
      fire: (q, A) => {
        const v = trong(P.x, P.y);
        A.x0 = q.x; A.y0 = q.y; A.tx = v[0]; A.ty = v[1];
        q.ghost = true; k.anT = S.bay + 0.25; mat(q, Math.atan2(v[1] - q.y, v[0] - q.x));
        danh(q, 'circle', { x: v[0], y: v[1], r: S.r }, S.bay, q.dmg * S.sat, null, { melee: true, cancel: false, knGiu: true, onFire: (z) => {
          if (!anh('hu-cot-nuoc', z.x, z.y, { sc: 0.7 })) FX('burst', z.x, z.y - 4, '#a6deff', 14, 80);
          FX('burst', z.x, z.y, '#ffffff', 6, 50); G.sfx('boom', 1.6);
        } });
        G.sfx('swing', 0.7);
      },
      step: (q, A) => {
        if (!A.fired || A.x0 == null || A.dat) return;
        const u = Math.min(1, (A.t - S.bao) / S.bay);
        q.x = A.x0 + (A.tx - A.x0) * u; q.y = A.y0 + (A.ty - A.y0) * u; k.bay = Math.sin(u * PI) * S.cao;
        if (u >= 1) { A.dat = true; k.bay = 0; q.ghost = false; k.anT = 0; H.play(q, 'atk'); }
      } });
  };

  // Cá Nóc · Hút rồi nổ gai: phồng lên, hút nhẹ bé lại gần 1 giây (8 vạch đỏ toả ra), rồi nổ 8 gai toả đều (khe giữa hai vạch là chỗ an toàn).
  T.caNoc = function (e, dt, P, sp, d, a) {
    const S = SO.caNoc;
    if (d > S.tam - 14) H.moveTo(e, P.x, P.y, sp, dt);
    if (e.cd > 0 || d >= S.tam) return;
    const g0 = G.rnd() * TAU / S.gai;
    for (let i = 0; i < S.gai; i++) baoV(e, 'line', { x: e.x, y: e.y, ang: g0 + (i / S.gai) * TAU, len: S.dai, w: S.rong }, S.bao, { knHuy: true });
    H.begin(e, 'boom', a, S.bao, { cd: 9, end: S.bao + H.dur(e.art, 'atk'),
      step: (q, A, dt2) => { if (!A.fired) keo(q, S.hut, dt2); },
      fire: (q) => {
        for (let i = 0; i < S.gai; i++) H.shoot(q, g0 + (i / S.gai) * TAU, S.toc, { kind: 'spike', dmg: q.dmg * S.sat, t: S.dai / S.toc + 0.5 });
        q.ghost = true; q.boomT = H.dur(q.art, 'atk') * 0.95;
        FX('propBlast', { x: q.x, y: q.y, nr: 20 }, 'ice'); G.sfx('boom', 1.2);
      } });
    G.sfx('warn', 0.8);
  };
  // Kéo nhẹ em bé về phía q (không kéo khi đang lộn / lướt).
  function keo(q, v, dt) {
    const P = W().P, w = W();
    if (!P || P.dead || P.dodgeT > 0 || P.dashT > 0 || w.over) return;
    const dx = q.x - P.x, dy = q.y - P.y, l = Math.hypot(dx, dy);
    if (l < 16) return;
    P.x = clamp(P.x + (dx / l) * v * dt, w.x0, w.px1 != null ? w.px1 : w.x1); P.y = clamp(P.y + (dy / l) * v * 0.75 * dt, w.y0, w.y1);
    if (Math.floor(G.time * 12) % 3 === 0) FX('burst', P.x + (dx / l) * 6, P.y - 6, '#a6deff', 1, 20);
  }

  // Sứa Bom · Vũng điện: thả vũng điện tại chỗ; vũng nhấp nháy theo nhịp, mỗi nhịp một vòng đỏ đầy dần, sáng lên mới giật (choáng 0,3 giây).
  T.sua = function (e, dt, P, sp, d, a) {
    const S = SO.sua;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d >= S.tam) return;
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + 0.4, anim1: 'idle', fire: (q) => vungDien(q, q.x, q.y) });
  };
  function vungDien(q, x, y) {
    const S = SO.sua, tong = S.nhip.reduce((s, v) => s + v, 0);
    const o = vat({ x, y, life: tong + 0.3, sang: 0,
      buoc(v, dt) { v.sang -= dt; return v.age < v.life; },
      ve(c, v) { // chưa có ảnh: vẽ tạm (prompt hu-vung-dien trong PROMPT-ANH.md)
        const k = Math.min(1, v.age / 0.2) * Math.min(1, (v.life - v.age) / 0.3), sang = v.sang > 0;
        elip(c, v.x, v.y, S.r, S.r * 0.55, sang ? 'rgba(200,240,255,' + (0.55 * k).toFixed(2) + ')' : 'rgba(40,80,150,' + (0.35 * k).toFixed(2) + ')');
        const n = sang ? 8 : 3;
        for (let i = 0; i < n; i++) {
          const g = i * TAU / n + Math.floor(G.time * 12) * 0.7, r1 = S.r * (0.3 + 0.6 * ((i * 37 + Math.floor(G.time * 12)) % 5) / 5);
          const x1 = v.x + Math.cos(g) * r1, y1 = v.y + Math.sin(g) * r1 * 0.55;
          p(c, x1, y1, 2, 1, sang ? '#ffffff' : '#7fd4ff'); p(c, x1 + 2, y1 - 1, 1, 1, sang ? '#fff6b0' : '#3883d4');
        }
      } });
    let i = 0;
    const nhip = () => {
      if (i >= S.nhip.length) return;
      const t = S.nhip[i++];
      danh(q, 'circle', { x, y, r: S.r }, t, q.dmg * S.sat, null, { cancel: false, knGiu: true, onHit: teLiet, onFire: () => { o.sang = 0.25; FX('burst', x, y - 4, '#bfeaff', 8, 60); G.sfx('hit', 1.8); nhip(); } });
    };
    nhip();
  }
  function teLiet() { const P = W().P; P.frozenT = Math.max(P.frozenT || 0, SO.sua.te); FX('text', P.x, P.y - 48, 'Tê liệt!', '#bfeaff', 8); }

  // Nhím Biển · Gai xoắn ốc: dựng gai (vòng đỏ) rồi bắn gai theo hai cánh xoáy ốc xoay dần, giữa hai cánh có khe để luồn.
  T.nhim = function (e, dt, P, sp, d, a) {
    const S = SO.nhim, T0 = S.cuon + S.bao, chieu = G.rnd() < 0.5 ? 1 : -1;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d >= S.tam) return;
    baoV(e, 'circle', { x: e.x, y: e.y, r: e.r + 7 }, S.cuon, { knHuy: true });
    G.sfx('warn', 0.7);
    H.begin(e, 'kn', a, T0, { cd: S.hoi, end: T0 + S.lan * S.cach + 0.3, g: 0, n: 0, hen: 0,
      step: (q, A, dt2, P2) => {
        if (!A.bao2 && A.t >= S.cuon) {
          A.bao2 = true; A.g = Math.atan2(P2.y - q.y, P2.x - q.x);
          for (let j = 0; j < S.nhanh; j++) baoV(q, 'line', { x: q.x, y: q.y, ang: A.g + (j * TAU) / S.nhanh, len: S.dai, w: S.rong }, Math.max(0.05, T0 - A.t), { knHuy: true });
        }
        if (!A.fired) return;
        A.hen -= dt2;
        while (A.hen <= 0 && A.n < S.lan) {
          for (let j = 0; j < S.nhanh; j++) H.shoot(q, A.g + (j * TAU) / S.nhanh, S.toc, { kind: 'spike', dmg: q.dmg * S.sat, t: S.giayGai });
          A.g += chieu * S.xoay; A.n++; A.hen += S.cach;
          if (A.n % 4 === 1) G.sfx('swing', 1.6);
        }
      } });
  };

  // ---------------- LÂU ĐÀI CỔ (ma, lửa: dịch chuyển, lừa) ----------------
  // Lính Ma Giáp Gỉ · Chớp chém: đánh dấu điểm sau lưng bé (vòng đỏ nhỏ) và vạch đường chém, mờ đi rồi hiện ở đó chém một đường.
  T.linhMa = function (e, dt, P, sp, d, a) {
    const S = SO.linhMa, k = e.kn;
    if (d > S.tam - 20) H.moveTo(e, P.x, P.y, sp, dt); else mat(e, a);
    if (e.cd > 0 || d > S.tam) return;
    const dd = d || 1, ux = (P.x - e.x) / dd, uy = (P.y - e.y) / dd, q0 = trong(P.x + ux * S.sau, P.y + uy * S.sau), b = Math.atan2(P.y - q0[1], P.x - q0[0]);
    baoV(e, 'circle', { x: q0[0], y: q0[1], r: S.dau }, S.bao, { knHuy: true });
    danh(e, 'line', { x: q0[0], y: q0[1], ang: b, len: S.dai, w: S.rong }, S.bao + S.hien, e.dmg * S.sat, null, { melee: true, knHuy: true });
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + S.hien + 0.4,
      step: (q, A) => {
        if (!A.fired) { k.mo = A.t > S.bao * 0.5 ? Math.max(0.15, 1 - (A.t - S.bao * 0.5) / (S.bao * 0.5)) : 1; return; }
        if (!A.chop && A.t >= S.bao + S.hien) { A.chop = true; H.play(q, 'atk'); }
      },
      fire: (q, A) => {
        FX('burst', q.x, q.y - 8, '#b8a8ff', 10, 60);
        q.x = q0[0]; q.y = q0[1]; k.mo = 1; A.a = b; q.dirA = b; mat(q, b); H.play(q, 'tele', 4);
        FX('burst', q.x, q.y - 8, '#e0d8ff', 10, 60); G.sfx('swing', 1.2);
      } });
  };

  // Bầy Dơi Than · Bổ nhào chữ V: hai vạch đỏ hình chữ V chụm lại sau lưng bé, cả bầy bổ nhào qua; trúng thì dơi hồi máu.
  T.doiThan = function (e, dt, P, sp, d, a) {
    const S = SO.doiThan;
    if (d > S.tam - 16) H.moveTo(e, P.x, P.y, sp, dt); else mat(e, a);
    if (e.cd > 0 || d > S.tam) return;
    const dd = d || 1, ux = (P.x - e.x) / dd, uy = (P.y - e.y) / dd, nx = -uy, ny = ux, v = trong(P.x + ux * S.qua, P.y + uy * S.qua);
    const hoi = () => { if (e.dead) return; const h = Math.max(1, Math.round(e.maxhp * S.hut)); e.hp = Math.min(e.maxhp, e.hp + h); FX('text', e.x, e.y - e.h - 4, '+' + h, '#8fe86a', 8); };
    for (const s of [-1, 1]) {
      const sx = e.x + nx * S.canh * s, sy = e.y + ny * S.canh * s * 0.8;
      danh(e, 'line', { x: sx, y: sy, ang: Math.atan2(v[1] - sy, v[0] - sx), len: Math.hypot(v[0] - sx, v[1] - sy), w: S.rong }, S.bao, e.dmg * S.sat, null, { melee: true, knHuy: true, onHit: hoi });
    }
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + S.lao + 0.3, x0: e.x, y0: e.y,
      fire: () => G.sfx('swing', 1.4),
      step: (q, A) => { if (!A.fired) return; const u = Math.min(1, (A.t - S.bao) / S.lao); q.x = A.x0 + (v[0] - A.x0) * u; q.y = A.y0 + (v[1] - A.y0) * u; } });
  };

  // Tượng Đá Cầm Khiên · Đập đất: đứng im như tượng (giáp trước giữ nguyên); bé vào gần thì đập đất, sóng vòng lan ra 3 nấc.
  T.tuongDa = function (e, dt, P, sp, d, a) {
    const S = SO.tuongDa;
    H.faceSlow(e, P, dt);
    if (chuaBan(e, dt)) return;
    if (d > S.xa) diKhien(e, P, sp * 0.6, dt, S.xa - 20);
    if (e.cd > 0 || d > S.gan) return;
    S.song.forEach((g, i) => {
      const t = S.bao + i * S.cach;
      if (!g[0]) danh(e, 'circle', { x: e.x, y: e.y, r: g[1] }, t, e.dmg * S.sat, null, { melee: true, knHuy: true });
      else danh(e, 'donut', { x: e.x, y: e.y, r0: g[0], r1: g[1] }, t, e.dmg * S.sat, null, { melee: true, knHuy: true });
    });
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, keepFace: true, end: S.bao + 0.7, fire: (q) => {
      W().shake = Math.max(W().shake || 0, 0.12);
      if (!anh('hu-nut-dat', q.x, q.y, { sc: 0.8 })) FX('burst', q.x, q.y, '#b0a090', 14, 80);
      G.sfx('boom', 1.4);
    } });
  };

  // Đèn Lồng Ma · Lửa ma đuổi: vạch đỏ ngắn hướng bắn, rồi quả lửa chậm đuổi theo bé 3 giây; chém trúng thì tan.
  T.denLong = function (e, dt, P, sp, d, a) {
    if (goiBay(e, dt, a)) return;
    xaThu(e, dt, P, sp);
    const S = SO.denLong;
    if (e.cd > 0 || d >= S.tam) return;
    baoV(e, 'line', { x: e.x, y: e.y, ang: a, len: S.dai, w: S.rong }, S.bao, { knHuy: true });
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + 0.45, fire: (q) => {
      H.shoot(q, Math.atan2(P.y - q.y, P.x - q.x), S.toc, { kind: 'fire', homing: S.toc, t: S.giay, dmg: q.dmg * S.sat, knChem: true });
      G.sfx('swing', 1.1);
    } });
    G.sfx('warn', 1.3);
  };

  // Mèo Đen Hai Đuôi · Phân thân: tạo 2 bóng ảo chạy cùng; chỉ con thật nhận sát thương; bóng lại gần thì vạch đỏ rồi lao vào và tan (sát thương nhỏ).
  // Con thật vẫn cào như vai nhanh nhẹn cũ (nay có vùng báo đỏ), cào xong lùi ra.
  T.meoDen = function (e, dt, P, sp, d, a) {
    const S = SO.meoDen, k = e.kn;
    k.ptCd = (k.ptCd == null ? G.rr(1, 2.5) : k.ptCd) - dt;
    if (k.lui > 0) { k.lui -= dt; H.keep(e, P, 90, sp, dt, 1); return; }
    if (k.ptCd <= 0 && d < S.tam) {
      k.ptCd = S.hoiBong;
      H.begin(e, 'kn', a, S.bao, { cd: 0.6, end: S.bao + 0.4, fire: (q) => { for (let i = 0; i < S.bong; i++) bongMeo(q, i ? 1 : -1); G.sfx('swing', 0.9); } });
      return;
    }
    const r = H.reachOf(e);
    H.keep(e, P, r * 0.9, sp, dt, 1);
    if (e.cd <= 0 && d < r + 8) H.begin(e, 'kn', a, S.bao, { cd: S.hoi, zone: H.strikeZone(e, a, S.bao, S.sat, { quiet: false, knHuy: true }), after: (q) => { q.kn.lui = 0.9; } });
  };
  function bongMeo(q, s) {
    const S = SO.meoDen, a = q.dirA || 0, v = trong(q.x - Math.sin(a) * S.lech * s, q.y + Math.cos(a) * S.lech * s * 0.7);
    if (!anh('hu-phan-than', v[0], v[1], { sc: 0.6 })) FX('burst', v[0], v[1] - 8, '#9a6ad8', 8, 50);
    vat({ x: v[0], y: v[1], src: q, face: q.face, life: S.giay, lao: null, b: a,
      buoc(o, dt) {
        const e = o.src, P = W().P;
        if (e.dead || o.age >= o.life || !P) { tan(o); return false; }
        if (o.lao) {
          const L = o.lao; L.t += dt;
          if (L.t >= S.baoBong) { const u = Math.min(1, (L.t - S.baoBong) / 0.12); o.x = L.x0 + Math.cos(o.b) * L.len * u; o.y = L.y0 + Math.sin(o.b) * L.len * u; if (u >= 1) { tan(o); return false; } }
          return true;
        }
        const dx = P.x - o.x, dy = P.y - o.y, l = Math.hypot(dx, dy) || 1;
        if (l > S.tamBong) { const v2 = e.speed * 0.9 * dt; o.x += (dx / l) * v2; o.y += (dy / l) * v2 * 0.8; if (Math.abs(dx) > 2) o.face = dx > 0 ? 1 : -1; o.chay = true; const g = trong(o.x, o.y); o.x = g[0]; o.y = g[1]; return true; }
        o.chay = false; o.b = Math.atan2(dy, dx); o.face = dx >= 0 ? 1 : -1;
        const len = l + 12;
        o.lao = { t: 0, x0: o.x, y0: o.y, len };
        danh(e, 'line', { x: o.x, y: o.y, ang: o.b, len, w: S.rongBong }, S.baoBong, e.dmg * S.satBong, null, { melee: true, knGiu: true });
        return true;
      },
      ve(c, o) {
        const M = G.monsterArt;
        if (!M) return;
        const ga = c.globalAlpha, an = o.lao ? (o.lao.t < S.baoBong ? 'tele' : 'atk') : o.chay ? 'move' : 'idle';
        const t = o.lao ? (o.lao.t < S.baoBong ? (o.lao.t / S.baoBong) * H.dur('meoDen', 'tele') * 0.999 : o.lao.t - S.baoBong) : o.age;
        c.globalAlpha = ga * (0.42 + 0.1 * Math.sin(o.age * 9)) * Math.min(1, o.age / 0.2);
        try { M.draw(c, 'meoDen', o.x, o.y, { anim: an, t, face: o.face, dir: o.b, bao: false, tint: ['#9a6ad8', 0.6] }); } finally { c.globalAlpha = ga; }
      } });
    function tan(o) { if (!anh('hu-phan-than', o.x, o.y, { sc: 0.5 })) FX('burst', o.x, o.y - 8, '#9a6ad8', 8, 50); }
  }

  // Hũ Lửa Sống · Lăn vệt lửa: vạch đỏ đường lăn + vòng đỏ chỗ vỡ; lăn tới, vỡ ra, để lại vệt lửa dọc đường đã lăn 2 giây.
  T.huLua = function (e, dt, P, sp, d, a) {
    const S = SO.huLua;
    if (d > S.tam - 10) H.moveTo(e, P.x, P.y, sp, dt);
    if (e.cd > 0 || d >= S.tam) return;
    const len = Math.max(16, tuong(e.x, e.y, a, d + S.qua)), c0 = Math.cos(a), s0 = Math.sin(a), lan = len / S.toc, el = H.regEl();
    baoV(e, 'line', { x: e.x, y: e.y, ang: a, len, w: S.rong }, S.bao, { knHuy: true });
    danh(e, 'circle', { x: e.x + c0 * len, y: e.y + s0 * len, r: S.r }, S.bao + lan, e.dmg * S.sat, el, { knHuy: true, onHit: H.onBlastHit(el) });
    G.sfx('warn', 0.8);
    H.begin(e, 'boom', a, S.bao, { cd: 9, end: S.bao + lan + H.dur(e.art, 'atk') + 0.2, s: 0, vet: S.vet * 0.5, no: false,
      fire: (q) => { q.ghost = true; },
      step: (q, A, dt2) => {
        if (!A.fired || A.no) return;
        const k = Math.min(len - A.s, S.toc * dt2);
        A.s += k; q.x += c0 * k; q.y += s0 * k; giu(q); q.moving = true;
        q.kn.xoay = (q.kn.xoay || 0) + (k / 8) * (c0 >= 0 ? 1 : -1);
        while (A.vet <= A.s) { H.addZone('circle', { x: A.x0 + c0 * A.vet, y: A.y0 + s0 * A.vet, r: S.vetR }, 0, q.dmg * S.vetSat, 'fire', { pool: true, life: S.vetGiay, tick: 0.3 }); A.vet += S.vet; }
        if (A.s >= len - 0.01) { A.no = true; q.kn.xoay = 0; q.boomT = H.dur(q.art, 'atk') * 0.95; FX('propBlast', { x: q.x, y: q.y, nr: S.r }, 'fire'); G.sfx('boom', 1.1); }
      }, x0: e.x, y0: e.y });
  };

  // Tiểu Yêu Ném Pháo · Bùa tam giác: ném 3 lá bùa thành tam giác quanh bé (3 cạnh vạch đỏ), sau 1,3 giây nối lại nổ cả vùng tam giác.
  T.tieuYeu = function (e, dt, P, sp, d, a) {
    const S = SO.tieuYeu;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d >= S.tam) return;
    H.begin(e, 'kn', a, S.bao, { cd: S.hoi, end: S.bao + H.dur(e.art, 'atk') * 0.8, fire: (q) => buaTamGiac(q, P) });
  };
  function trongTamGiac(x, y, V) {
    const s = (A, B) => (B[0] - A[0]) * (y - A[1]) - (B[1] - A[1]) * (x - A[0]);
    const d1 = s(V[0], V[1]), d2 = s(V[1], V[2]), d3 = s(V[2], V[0]);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  }
  KN.trongTamGiac = trongTamGiac;
  function buaTamGiac(q, P) {
    const S = SO.tieuYeu, g0 = G.rnd() * TAU, V = [];
    for (let i = 0; i < 3; i++) { const g = g0 + (i * TAU) / 3; V.push(trong(P.x + Math.cos(g) * S.R, P.y + Math.sin(g) * S.R * 0.75)); }
    for (let i = 0; i < 3; i++) { const A = V[i], B = V[(i + 1) % 3]; baoV(q, 'line', { x: A[0], y: A[1], ang: Math.atan2(B[1] - A[1], B[0] - A[0]), len: Math.hypot(B[0] - A[0], B[1] - A[1]), w: S.rong }, S.bay + S.cho, { cancel: false, knGiu: true }); }
    const el = H.regEl(), cx = (V[0][0] + V[1][0] + V[2][0]) / 3, cy = (V[0][1] + V[1][1] + V[2][1]) / 3;
    vat({ x: cx, y: cy, V, x0: q.x, y0: q.y - q.h * 0.5, src: q, dmg: q.dmg * S.sat, no: false, het: 0,
      buoc(o, dt) {
        if (!o.no && o.age >= S.bay + S.cho) {
          o.no = true; o.het = 0.3;
          const P2 = W().P;
          if (P2 && trongTamGiac(P2.x, P2.y, o.V)) G.hurtPlayer(o.dmg, el, o.src, false);
          FX('propBlast', { x: o.x, y: o.y, nr: S.R * 0.7 }, el); G.sfx('boom', 1.1);
        }
        if (o.no) { o.het -= dt; return o.het > 0; }
        return true;
      },
      ve(c, o) { // lá bùa (vẽ tạm như lá bùa bay của js/mobs.js) + lòng tam giác hồng đỏ đậm dần; prompt hu-bua-tam-giac trong PROMPT-ANH.md
        const u = Math.min(1, o.age / S.bay), dat = o.age >= S.bay;
        if (dat && !o.no) {
          const k = Math.min(1, (o.age - S.bay) / S.cho), bl = Math.floor(G.time * (k > 0.7 ? 20 : 8)) % 2;
          c.fillStyle = 'rgba(255,' + (bl ? 60 : 120) + ',40,' + (0.12 + 0.22 * k).toFixed(2) + ')';
          c.beginPath(); c.moveTo(o.V[0][0], o.V[0][1]); c.lineTo(o.V[1][0], o.V[1][1]); c.lineTo(o.V[2][0], o.V[2][1]); c.closePath(); c.fill();
        }
        if (o.no) return;
        for (const v of o.V) {
          const x = dat ? v[0] : o.x0 + (v[0] - o.x0) * u, y = dat ? v[1] : o.y0 + (v[1] - o.y0) * u - Math.sin(u * PI) * 20, f = Math.floor(G.time * 10) % 2;
          p(c, x - 3, y - 8 + f, 6, 9, '#14182e'); p(c, x - 2, y - 7 + f, 4, 7, '#f4e070'); p(c, x - 1, y - 6 + f, 2, 1, '#c8372d'); p(c, x - 1, y - 4 + f, 2, 1, '#c8372d'); p(c, x - 1, y - 2 + f, 2, 1, '#c8372d');
        }
      } });
    G.sfx('swing', 1.2);
  }

  // Nhím Than Hồng · Gai trồi: dựng gai (vòng đỏ quanh thân) rồi gai lửa trồi từ đất thành hàng lan dần về phía bé (mỗi chỗ một vòng đỏ).
  T.nhimThan = function (e, dt, P, sp, d, a) {
    const S = SO.nhimThan, T0 = S.cuon + S.bao;
    H.keep(e, P, S.giu, sp, dt, 1);
    if (e.cd > 0 || d >= S.tam) return;
    baoV(e, 'circle', { x: e.x, y: e.y, r: e.r + 7 }, S.cuon, { knHuy: true });
    G.sfx('warn', 0.7);
    H.begin(e, 'kn', a, T0, { cd: S.hoi, end: T0 + S.so * S.nhip + 0.4,
      step: (q, A, dt2, P2) => {
        if (A.hang || A.t < S.cuon) return;
        A.hang = true;
        const b = Math.atan2(P2.y - q.y, P2.x - q.x), w = W(); A.a = b; q.dirA = b; mat(q, b);
        for (let i = 0; i < S.so; i++) {
          const r = S.dau + i * S.cach, x = q.x + Math.cos(b) * r, y = q.y + Math.sin(b) * r;
          if (x < w.x0 || x > w.x1 || y < w.y0 || y > w.y1) break;
          danh(q, 'circle', { x, y, r: S.r }, Math.max(0.05, T0 - A.t) + i * S.nhip, q.dmg * S.sat, null, { knHuy: true, onFire: (z) => {
            if (!anh('hu-cot-lua', z.x, z.y, { sc: 0.45 })) FX('burst', z.x, z.y - 4, '#ff8a1e', 6, 60);
            G.sfx('hit', 1.4);
          } });
        }
      } });
  };

  // =====================================================================
  // NỐI VÀO js/mobs.js
  // =====================================================================
  KN.bat = (e) => KN.on && !!(e && e.kn && T[e.art]);
  const daGap = new Set(); // con đã hiện dòng mẹo (mỗi lần mở trang một lần)
  KN.init = function (e) {
    if (!KN.on || !e || !T[e.art]) return;
    e.kn = { mo: 1 };
    e.knTen = tenQuai(e.art); // js/combat.js: khoá nguồn mất máu theo từng con (bảng thua)
    if (e.role === 'shield' && e.healCd == null) e.healCd = G.rr(3, 6);
    if (e.role === 'archer' && e.sumCd == null) e.sumCd = G.rr(7, 10);
    // Lần đầu gặp con này: dòng mẹo ở lề trái (như mẹo vũ khí), không đè thông báo đang có.
    const w = W();
    if (!daGap.has(e.art) && w && !w.banner && !G.noRender && MEO[e.art]) { daGap.add(e.art); w.banner = { s: MEO[e.art], col: '#f1e6c6', t: 5, tip: true }; }
  };
  KN.think = function (e, dt, P, sp, d, a) {
    if (!KN.bat(e)) return false;
    T[e.art](e, dt, P, sp, d, a);
    return true;
  };
  KN.onHit = function (e) { if (KN.bat(e) && e.art === 'oc') ocRut(e); };

  // Mỗi khung (sau G.mob.tick): đồng hồ an toàn, huỷ vùng khi quái bị choáng, vật tự quản, lửa ma bị chém, làm chậm.
  function tick(dt) {
    const w = W();
    if (!w || !KN.on) return;
    const P = w.P;
    if (P && P.knCham > 0) P.knCham -= dt;
    for (const e of w.ents) {
      const k = e.kn;
      if (!k || e.dead) continue;
      if (k.anT > 0) { k.anT -= dt; if (k.anT <= 0) { if (e.boomT == null) e.ghost = false; k.mo = 1; k.bay = 0; } }
      else if (!e.act && k.mo != null && k.mo < 1) k.mo = 1;
      if (!e.act && k.xoay) k.xoay = 0;
      if (e.st && (e.st.stun > 0 || e.st.frozen > 0)) for (const z of w.zones) if (z.knHuy && z.src === e && z.t > 0) z.dead = true;
      if (e.art === 'oc') ocTick(e, k, dt);
    }
    for (const z of w.zones) {
      if (!z.kn || z.dead) continue;
      if (w.cleared || w.safe || w.over) { z.dead = true; continue; } // hết quái / hết lượt: vật của quái tan hết, không gây sát thương nữa
      const o = z.kn;
      o.age += dt;
      if (o.buoc && o.buoc(o, dt, P) === false) z.dead = true;
      else { z.x = o.x; z.y = o.y; }
    }
    if (P && P.atkT > 0 && !P.dead) {
      for (const o of w.projs) if (o.knChem && o.t > 0 && Math.hypot(o.x - P.x, (o.y - P.y) * 1.3) < 26 && (o.x - P.x) * (P.face || 1) > -8) { o.t = 0; FX('burst', o.x, o.y - 10, '#ffb060', 8, 60); G.sfx('hit', 1.6); }
    }
  }
  const tick0 = G.mob.tick;
  G.mob.tick = function (dt) { tick0(dt); tick(dt); };
  // Vùng chỉ để báo: lúc hết giờ không rải chớp sáng như vùng nổ thật (vẫn chớp nhịp báo ở js/bao_truoc.js).
  if (G.fx && G.fx.zoneFire) { const zf = G.fx.zoneFire; G.fx.zoneFire = function (z) { if (z && z.knBao) return; return zf(z); }; }

  // ---------- VẼ ----------
  const A = G.art;
  if (!A) return;
  const zone0 = A.zone;
  A.zone = function (c, z) {
    if (z.kn) { if (z.kn.ve && !G.noRender) { try { z.kn.ve(c, z.kn); } catch (err) { if (window.console) console.warn('ky_nang_quai', err); } } return; }
    return zone0(c, z);
  };
  // Quái mờ (lẩn bóng, chớp chém), bay lên (vọt đáp), cuộn lăn (xoay thân), đang rút vỏ (vỏ xám trùm lên).
  const enemy0 = A.enemy;
  A.enemy = function (c, e) {
    const k = e.kn;
    if (!k || e.dying != null || !e.art) return enemy0(c, e);
    const mo = k.mo == null ? 1 : k.mo, bay = k.bay || 0, xoay = k.xoay || 0;
    if (mo >= 1 && !bay && !xoay) { enemy0(c, e); veVo(c, e, k); return; }
    if (bay) elip(c, e.x, e.y, 7, 2.5, 'rgba(0,0,0,0.3)');
    c.save();
    try {
      if (mo < 1) c.globalAlpha *= clamp(mo, 0, 1);
      if (bay) c.translate(0, -Math.round(bay));
      if (xoay) { const cy = e.y - (e.h || 16) * 0.4; c.translate(e.x, cy); c.rotate(xoay); c.translate(-e.x, -cy); }
      if (mo > 0.02) enemy0(c, e);
    } finally { c.restore(); }
  };
  function veVo(c, e, k) {
    if (!(k.vo > 0)) return;
    const x = Math.round(e.x), y = Math.round(e.y), r = Math.max(7, e.r + 2), bl = k.vo < 0.4 && Math.floor(G.time * 12) % 2;
    for (let i = -r; i <= r; i++) { const h = Math.round(Math.sqrt(Math.max(0, r * r - i * i)) * 0.8); p(c, x + i, y - h - 1, 1, h + 1, bl ? 'rgba(220,230,240,0.5)' : 'rgba(150,160,175,0.55)'); }
    for (let i = -r; i <= r; i += 2) { const h = Math.round(Math.sqrt(Math.max(0, r * r - i * i)) * 0.8); p(c, x + i, y - h - 1, 1, 1, '#ffffff'); }
  }
})();
