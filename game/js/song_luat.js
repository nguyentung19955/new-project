// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 2B: LUẬT RIÊNG CỦA VÙNG (docs/ke-hoach/buoc-3/KE-HOACH.md mục 1.2, 1.4, mục 5 hàng "2B").
// Vừa sức trẻ con: NHÌN LÀ HIỂU, KHÔNG GÂY CHẾT OAN.
//   1. Dòng nước chảy: dải nước có mũi tên trắng trôi (rộng ~1/4 phòng, ngang hoặc dọc) đẩy em bé và quái theo mũi tên ~28 điểm ảnh/giây
//      (≈ 39% tốc chạy của em bé). Không mất máu. Lăn né xuôi dòng đi xa hơn. Đứng trên CẦU TRE thì không trôi. Quái nhẹ trôi gấp đôi
//      (vai 'swarm'; phiên 2A đặt e.troiDong = 2 cho Đỉa, Ếch), tinh anh trôi nửa, trùm không trôi.
//      Chống chết oan: (a) dòng chỉ đẩy DỌC dải, bước ngang ra khỏi dải không bị cản; (b) dòng KHÔNG BAO GIỜ đẩy em bé vào vùng đỏ
//      đang báo / vũng nguy hiểm mà em bé chưa đứng trong đó (bước đẩy đó bị bỏ); (c) dải cách mọi cửa ≥ 2 ô (32 điểm ảnh), không phủ chỗ
//      em bé đứng lúc vào phòng đầu. Ải 4-1 phòng đầu luôn có dải + mũi tên lớn nhấp nháy + 1 câu mẹo.
//      Số dải: ải 4-1..4-3 phòng đánh quái 0–1 dải, ải 4-4, 4-5 tới 2 dải. Mỗi dải 1–2 cầu tre.
//   2. Nước sâu lạnh (nguồn Băng, từ ải 4-1): vũng xanh thẫm có bọt trắng. Em bé lội vào chậm 25% (lăn né không chậm); quái đứng trong vũng
//      bị Băng 1 tầng mỗi giây. Phòng trùm nhỏ (Cá Trê) có 2 vũng giữa bãi bùn.
//   3. Lục bình độc (nguồn Độc, từ ải 4-2): cụm lục bình tím trên mép nước. Đánh vỡ → nổ như nấm độc Rừng già + vũng độc 3 giây.
//   4. Đèn dầu thuyền chài (nguồn Lửa, từ ải 4-3): đèn treo trên cọc. Đánh đổ → nổ như chậu than + vệt lửa dầu loang 3 giây.
//   Lục bình / đèn dầu / vũng nước sâu THAY chỗ nấm độc / chậu than / tinh thể băng của ba vùng cũ (cùng số lượng, cùng chỗ đặt: js/stage.js
//   addEnv) — không thêm vật mới. Vũng độc, vệt lửa chỉ gây hệ lên quái, không làm em bé mất máu.
// Cờ quay lui: ?dongchay=0 (G.DONG_CHAY = false) tắt dòng chảy + cầu tre; ?songluat=0 (G.SONG_LUAT = false) tắt cả 4 luật (vật mang hệ như
// ba vùng cũ); ?nensong=0 (G.NEN_SONG = false) tắt theme phòng Sông sâu (js/room_art.js River) → nền mượn Hang biển như phiên 1;
// ?vung4=0 → không có vùng 4, tệp này không làm gì.
// Vẽ: dòng chảy / cầu / vũng ở lớp sàn (móc G.roomArt.lopSan, dưới dấu quái sắp mọc và nhân vật); lục bình, đèn dầu là đồ vật (A.prop).
// Ảnh D5 (dòng chảy 4 khung, cầu tre, lục bình nguyên / vỡ, đèn dầu 4 khung / đổ, vũng nước sâu) chưa gen: vẽ code; khi có tệp gd-vat-song-*
// thì thay ở các hàm ve* dưới đây.
(function () {
  const G = window.G;
  if (!G) return;
  const coCo = (k) => { try { return typeof location !== 'undefined' && new RegExp('[?&]' + k + '=0(&|$)').test(location.search || ''); } catch (e) { return false; } };
  if (G.DONG_CHAY === undefined) G.DONG_CHAY = !coCo('dongchay');
  if (G.SONG_LUAT === undefined) G.SONG_LUAT = !coCo('songluat');
  if (G.NEN_SONG === undefined) G.NEN_SONG = !coCo('nensong');
  if (!G.VUNG4) { G.songLuat = null; return; }

  const CFG = {
    v: 28,          // tốc dòng (điểm ảnh/giây theo chiều ngang); em bé chạy 72 × hệ số nhân vật (Cu Lì 0,9 → 64,8): dòng < 45% tốc chạy
    ky: 0.75,       // dòng dọc: nhân như em bé đi dọc (phòng nhìn chếch)
    nhe: 2, nang: 0.5, // hệ số trôi: quái nhẹ (swarm / e.troiDong), tinh anh
    rongDoc: 56, rongNgang: 40, // bề rộng dải dọc / ngang (~1/4 bề ngang sàn 300 → 56–75; ~1/4 bề dọc 196 → 40–49)
    chua: 32,       // chừa 2 ô quanh cửa
    cau: 22,        // bề rộng cầu tre (dọc theo dòng)
    sauCham: 0.75,  // em bé lội nước sâu: còn 75% tốc
    sauBang: 1,     // quái trong nước sâu: 1 tầng Băng mỗi ... giây
    sauRx: 18, sauRy: 9,
    vungGiay: 3,    // vũng độc lục bình, vệt lửa dầu tồn tại (giây)
    gioiThieu: { ice: 0, poison: 1, fire: 2 }, // ải đầu tiên (chỉ số trong vùng) có nguồn hệ đó; trước đó dùng nước sâu
    haiDai: 3,      // từ ải 4-4 tới 2 dải / phòng
  };
  const L = (G.songLuat = { CFG });
  const PHONG_DANH = { start: 1, fight: 1, elite: 1, challenge: 1 };
  const hs = (n) => { n = (n | 0) || 11; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return (n ^ (n >>> 16)) >>> 0; };
  const caiDat = () => G.SONG_LUAT !== false;
  const coDong = () => G.SONG_LUAT !== false && G.DONG_CHAY !== false;

  // ---------- bố cục ----------
  // Vùng cấm của cửa: lối vào cửa (32 rộng) kéo vào sàn thêm 2 ô, rộng thêm 2 ô mỗi bên.
  function vungCua(g, dirs) {
    const C = CFG.chua, b = g.bounds, out = [];
    for (const d of dirs) {
      if (d === 'up') out.push([g.cx - 16 - C, g.fy0 - 4, g.cx + 16 + C, b.y0 + C]);
      else if (d === 'down') out.push([g.cx - 16 - C, b.y1 - C, g.cx + 16 + C, g.fy1 + 4]);
      else if (d === 'left') out.push([g.fx0 - 4, g.cy - 16 - C, b.x0 + C, g.cy + 16 + C]);
      else out.push([b.x1 - C, g.cy - 16 - C, g.fx1 + 4, g.cy + 16 + C]);
    }
    return out;
  }
  const cat = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  L.vungCua = vungCua;
  function datDai(W, type, S, rn) {
    const g = W.geo, dirs = (W.doors || []).map((d) => d.dir), cam = vungCua(g, dirs);
    if (type === 'start') cam.push([g.cx - 26, g.cy, g.cx + 26, g.cy + 52]); // chỗ em bé đứng khi vào phòng đầu ải
    const ung = [];
    const wv = CFG.rongDoc, wh = CFG.rongNgang;
    for (let x = g.fx0 + 12; x + wv <= g.fx1 - 12; x += 4) ung.push({ doc: true, x0: x, x1: x + wv, y0: g.fy0, y1: g.fy1 });
    for (let y = g.fy0 + 6; y + wh <= g.fy1 - 2; y += 4) ung.push({ doc: false, x0: g.fx0, x1: g.fx1, y0: y, y1: y + wh });
    const hop = ung.filter((d) => !cam.some((c) => cat([d.x0, d.y0, d.x1, d.y1], c)));
    const meo = S && S.i === 0 && type === 'start' && !S.tut;
    let n = meo ? 1 : (S && S.i >= CFG.haiDai) ? (rn() < 0.6 ? 2 : 1) : (rn() < 0.7 ? 1 : 0);
    if (type === 'start' && !meo) n = Math.min(n, 1);
    const dai = [];
    for (let k = 0; k < n && hop.length; k++) {
      const con = hop.filter((d) => dai.every((o) => !cat([d.x0 - 24, d.y0 - 24, d.x1 + 24, d.y1 + 24], [o.x0, o.y0, o.x1, o.y1]) && (o.doc === d.doc)));
      if (!con.length) break;
      const d = con[Math.floor(rn() * con.length)];
      dai.push(Object.assign({}, d, { huong: rn() < 0.5 ? 1 : -1, ph: rn() * 40 }));
    }
    for (const d of dai) { // 1–2 cầu tre bắc ngang dải
      const a0 = d.doc ? d.y0 : d.x0, a1 = d.doc ? d.y1 : d.x1, so = a1 - a0 > 150 && rn() < 0.5 ? 2 : 1, cau = [];
      if (meo) cau.push(Math.round((d.doc ? W.geo.cy : W.geo.cx) + 36)); // phòng dạy: cầu nằm gần lối đi, lệch khỏi đường thẳng tới cửa để bé thấy cả hai
      for (let k = cau.length; k < so; k++) {
        for (let lan = 0; lan < 12; lan++) {
          const p = Math.round(a0 + 26 + rn() * (a1 - a0 - 52));
          if (cau.every((q) => Math.abs(q - p) > 56)) { cau.push(p); break; }
        }
      }
      d.cau = cau.map((p) => (d.doc ? [d.x0 - 3, p - CFG.cau / 2, d.x1 + 3, p + CFG.cau / 2] : [p - CFG.cau / 2, d.y0 - 3, p + CFG.cau / 2, d.y1 + 3]));
    }
    if (meo && dai[0]) { dai[0].lon = true; W.banner = { s: G.t('Dòng nước đẩy theo mũi tên — đứng trên cầu tre thì không trôi'), col: '#bfe8ff', t: 7 }; }
    return dai;
  }
  // Dựng phòng (js/stage.js buildRoom gọi cho mọi phòng; chỉ vùng 4 mới làm gì).
  L.datPhong = function (W, type, S) {
    if (!W || W.region !== 3) return;
    W.song = { dai: [], sau: [] };
    if (!caiDat()) return;
    const rn = G.srand(hs((W.seed || 11) * 13 + 7));
    if (PHONG_DANH[type] && coDong()) W.song.dai = datDai(W, type, S, rn);
    if (type === 'boss' && S && S.i < 4) { // phòng Cá Trê: bãi bùn rộng, giữa có 2 vũng nước sâu
      const g = W.geo;
      W.song.sau.push({ x: g.cx - 72, y: g.cy - 8, rx: 26, ry: 13 }, { x: g.cx + 70, y: g.cy + 22, rx: 26, ry: 13 });
    }
  };
  function trongDai(d, x, y, pad) { pad = pad || 0; return x >= d.x0 - pad && x <= d.x1 + pad && y >= d.y0 - pad && y <= d.y1 + pad; }
  function trenCau(d, x, y) { return d.cau && d.cau.some((c) => x >= c[0] && x <= c[2] && y >= c[1] && y <= c[3]); }
  // Đặt vật mang hệ (js/stage.js addEnv và phòng trùm). Trả về true nếu đã lo (vùng 4), false → stage.js đặt vật cũ.
  L.datVat = function (W, el, x, y, trum) {
    if (!W || W.region !== 3 || !W.song || !caiDat()) return false;
    const S = G.getRun ? G.getRun() : null, i = S && S.i != null ? S.i : 0, g = W.geo;
    let loai = el === 'poison' ? 'lucbinh' : el === 'fire' ? 'dendau' : 'sau';
    if (!trum && i < (CFG.gioiThieu[el] || 0)) loai = 'sau';
    // không đặt giữa dòng: dời ra mép dải (lục bình thì nằm ngay mép nước)
    for (const d of W.song.dai) {
      if (!trongDai(d, x, y, 10)) continue;
      if (d.doc) { const tr = x - d.x0 < d.x1 - x; x = tr ? d.x0 - 12 : d.x1 + 12; if (x < g.bounds.x0 + 8 || x > g.bounds.x1 - 8) x = tr ? d.x1 + 12 : d.x0 - 12; }
      else { const tr = y - d.y0 < d.y1 - y; y = tr ? d.y0 - 10 : d.y1 + 12; if (y < g.bounds.y0 + 8 || y > g.bounds.y1 - 4) y = tr ? d.y1 + 12 : d.y0 - 10; }
    }
    x = G.clamp(x, g.bounds.x0 + 6, g.bounds.x1 - 6); y = G.clamp(y, g.bounds.y0 + 6, g.bounds.y1 - 2);
    if (loai === 'sau') W.song.sau.push({ x: Math.round(x), y: Math.round(y), rx: CFG.sauRx, ry: CFG.sauRy });
    else W.props.push({ type: loai, env: true, x: Math.round(x), y: Math.round(y), song: true });
    return true;
  };
  const trongSau = (o, x, y) => { const dx = (x - o.x) / o.rx, dy = (y - o.y) / o.ry; return dx * dx + dy * dy <= 1; };
  L.trongSau = (W, x, y) => !!(W && W.song && W.song.sau.some((o) => trongSau(o, x, y)));
  // Hướng đẩy tại (x, y): [vx, vy] (điểm ảnh/giây, chưa nhân hệ số trôi), hoặc null.
  L.dongTai = function (W, x, y) {
    if (!W || !W.song || !coDong()) return null;
    for (const d of W.song.dai) {
      if (!trongDai(d, x, y) || trenCau(d, x, y)) continue;
      return d.doc ? [0, d.huong * CFG.v * CFG.ky] : [d.huong * CFG.v, 0];
    }
    return null;
  };

  // ---------- luật mỗi khung ----------
  // Bước đẩy (x0,y0) → (x1,y1) có đưa em bé VÀO một vùng nguy hiểm mà em bé chưa đứng trong đó không.
  function vaoVungDo(W, x0, y0, x1, y1) {
    for (const z of W.zones) {
      if (z.dead || z.team === 'player' || z.team === 'fx' || !z.shape) continue;
      if (!(z.t > 0 || z.pool || z.wall)) continue;
      try { if (G.inZone(z, { x: x1, y: y1 }, 0) && !G.inZone(z, { x: x0, y: y0 }, 0)) return true; } catch (e) { /* hình lạ: bỏ qua */ }
    }
    for (const o of W.projs) { // đạn quái: không đẩy em bé vào đường đạn sắp trúng (ô trúng 7 × 8 như js/combat.js, nới 2)
      if (o.team === 'player' || !(o.t > 0)) continue;
      if (Math.abs(x1 - o.x) < 9 && Math.abs(y1 - o.y) < 10 && !(Math.abs(x0 - o.x) < 9 && Math.abs(y0 - o.y) < 10)) return true;
    }
    return false;
  }
  L.vaoVungDo = vaoVungDo;
  const heSoTroi = (e) => (e.troiDong != null ? e.troiDong : e.role === 'swarm' ? CFG.nhe : e.role === 'elite' ? CFG.nang : 1);
  L.heSoTroi = heSoTroi;
  L.tick = function (W, dt, x0, y0, sauTruoc) {
    const P = W.P, so = W.song;
    if (!so || P.dead) return;
    // nước sâu: phần em bé TỰ đi trong khung này còn 75% (lăn né / lướt không chậm)
    if (sauTruoc && !(P.dodgeT > 0) && !(P.dashT > 0)) {
      P.x = x0 + (P.x - x0) * CFG.sauCham; P.y = y0 + (P.y - y0) * CFG.sauCham;
    }
    // dòng chảy
    const xm = W.px1 != null ? W.px1 : W.x1;
    const v = L.dongTai(W, P.x, P.y);
    if (v) {
      const nx = G.clamp(P.x + v[0] * dt, W.x0, xm), ny = G.clamp(P.y + v[1] * dt, W.y0, W.y1);
      if (!vaoVungDo(W, P.x, P.y, nx, ny)) { P.truocDay = [P.x, P.y]; P.x = nx; P.y = ny; P.troiT = (P.troiT || 0) + dt; P.troiLuc = G.time || 0; } else W.songChan = (W.songChan || 0) + 1;
    }
    for (const e of W.ents) {
      if (e.dead || e.hidden || e.isBoss || !e.inside) continue;
      const k = heSoTroi(e);
      if (!(k > 0) || (e.st && e.st.root > 0)) continue;
      const u = L.dongTai(W, e.x, e.y);
      if (u) { e.x = G.clamp(e.x + u[0] * k * dt, W.x0, W.x1); e.y = G.clamp(e.y + u[1] * k * dt, W.y0, W.y1); }
    }
    // quái (cả trùm) đứng trong nước sâu: 1 tầng Băng mỗi giây
    if (so.sau.length) {
      const w = P.weapons && P.weapons[P.cur], src = G.pDamage && w ? G.pDamage(P, w) : 1;
      for (const e of G.targets()) {
        if (!so.sau.some((o) => trongSau(o, e.x, e.y))) { e.songBang = 0; continue; }
        e.songBang = (e.songBang || 0) + dt;
        if (e.songBang >= CFG.sauBang) { e.songBang -= CFG.sauBang; G.applyStatus(e, 'ice', src, 1); }
      }
    }
  };
  const uw = G.updateWorld;
  if (typeof uw === 'function') {
    G.updateWorld = function (dt, inp) {
      const W = G.getWorld ? G.getWorld() : null;
      if (!W || !W.song || !W.P) return uw.apply(this, arguments);
      const P = W.P, x0 = P.x, y0 = P.y, sau = L.trongSau(W, x0, y0);
      const kq = uw.apply(this, arguments);
      if (G.getWorld() === W) L.tick(W, dt, x0, y0, sau);
      return kq;
    };
  }
  // Lục bình / đèn dầu bị đánh trúng (đòn chém, tên, lướt: js/combat.js gọi G.triggerProp với mọi vật env).
  const tp = G.triggerProp;
  if (typeof tp === 'function') {
    G.triggerProp = function (pr) {
      if (!pr || (pr.type !== 'lucbinh' && pr.type !== 'dendau')) return tp.apply(this, arguments);
      const W = G.getWorld(), P = W.P, w = P.weapons[P.cur];
      pr.used = true; pr.dead = true;
      const el = pr.type === 'dendau' ? 'fire' : 'poison', src = G.pDamage(P, w);
      if (!G.noRender && G.fx && G.fx.propBlast) G.fx.propBlast(pr, el);
      G.sfx('boom', 1.3);
      for (const t of G.targets()) {
        if (Math.hypot(t.x - pr.x, (t.y - pr.y) / G.ZK) < 52) { G.damage(t, src * 0.8, { el, src: 'prop' }); G.applyStatus(t, el, src, el === 'fire' ? 1 : 3); }
      }
      // vũng độc / vệt lửa dầu 3 giây: chỉ gây hệ lên quái đứng trong đó (1 tầng mỗi giây), không đụng em bé
      W.zones.push({ shape: 'circle', x: pr.x + (el === 'fire' ? 6 : 0), y: pr.y + 3, r: el === 'fire' ? 32 : 28, t: 0, pool: true, team: 'player', life: CFG.vungGiay, tick: 1, every: 1, el, src, oz: true, song: pr.type, t0s: G.time || 0 });
    };
  }

  // ---------- vẽ ----------
  let cx = null;
  const R = (x, y, w, h, col) => { if (w <= 0 || h <= 0) return; cx.fillStyle = col; cx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const ELL = (x, y, rx, ry, col) => { if (G.art && G.art.ellipse) G.art.ellipse(cx, x, y, rx, ry, col); };
  function muiTen(x, y, dx, dy, s, col) { // chữ V chỉ hướng (dx, dy) cỡ s
    for (let i = 0; i <= s; i++) {
      if (dx) { R(x - dx * i, y - i, 2, 1, col); R(x - dx * i, y + i, 2, 1, col); }
      else { R(x - i, y - dy * i, 1, 2, col); R(x + i, y - dy * i, 1, 2, col); }
    }
  }
  function veDai(d, t) {
    const doc = d.doc, w = d.x1 - d.x0, h = d.y1 - d.y0;
    R(d.x0, d.y0, w, h, 'rgba(14,44,48,0.78)');
    if (doc) { R(d.x0, d.y0, 2, h, 'rgba(200,224,216,0.55)'); R(d.x1 - 2, d.y0, 2, h, 'rgba(200,224,216,0.55)'); R(d.x0 + 2, d.y0, 3, h, 'rgba(0,0,0,0.25)'); }
    else { R(d.x0, d.y0, w, 2, 'rgba(200,224,216,0.55)'); R(d.x0, d.y1 - 2, w, 2, 'rgba(200,224,216,0.5)'); R(d.x0, d.y0 + 2, w, 3, 'rgba(0,0,0,0.25)'); }
    // vệt sóng và mũi tên trôi đúng tốc dòng (nhìn tốc mũi tên là biết tốc bị đẩy)
    const sp = doc ? CFG.v * CFG.ky : CFG.v, L0 = doc ? h : w, gap = 30;
    const off = (((t * sp + d.ph) % gap) + gap) % gap;
    const hx = doc ? 0 : d.huong, hy = doc ? d.huong : 0;
    const lanes = doc ? [d.x0 + w * 0.3, d.x0 + w * 0.7] : [d.y0 + h * 0.32, d.y0 + h * 0.72];
    for (let li = 0; li < lanes.length; li++) {
      for (let p = -gap; p < L0 + gap; p += gap) {
        const q = d.huong > 0 ? p + off + li * 15 : L0 - p - off - li * 15;
        if (q < 4 || q > L0 - 4) continue;
        const x = doc ? lanes[li] : d.x0 + q, y = doc ? d.y0 + q : lanes[li];
        if (doc) R(x - 4 + li * 3, y - hy * 7, 1, 6, 'rgba(160,200,196,0.35)'); else R(x - hx * 9, y + 3 - li * 2, 7, 1, 'rgba(160,200,196,0.35)');
        muiTen(x, y, hx, hy, 3, 'rgba(240,250,255,0.85)');
      }
    }
    if (d.lon && Math.floor(t * 2.5) % 2 === 0) { // ải 4-1 phòng đầu: mũi tên lớn nhấp nháy giữa dải
      const mx = (d.x0 + d.x1) / 2, my = (d.y0 + d.y1) / 2;
      for (let k = 0; k < 3; k++) muiTen(mx + hx * k * 6, my + hy * k * 5, hx, hy, 8, k === 2 ? '#ffffff' : 'rgba(255,255,255,0.75)');
    }
    for (const c of d.cau || []) veCau(c, doc);
  }
  function veCau(c, doc) { // cầu tre: ván ngang dòng, hai sợi dây chão hai mép
    const [x0, y0, x1, y1] = c, w = x1 - x0, h = y1 - y0;
    R(x0 + 2, y0 + 3, w, h, 'rgba(0,0,0,0.35)');
    if (doc) {
      for (let y = y0; y < y1; y += 4) { R(x0, y, w, 3, '#6e6038'); R(x0, y, w, 1, '#b8a468'); R(x0 + ((y * 7) % 13), y + 1, 2, 1, '#4a3e22'); }
      R(x0, y0, w, 1, '#c8b080'); R(x0, y1 - 1, w, 1, '#3a3020');
      for (const x of [x0 + 1, x1 - 3]) { R(x, y0 - 4, 2, h + 6, '#54482a'); R(x, y0 - 4, 1, h + 6, '#a08a5a'); }
    } else {
      for (let x = x0; x < x1; x += 4) { R(x, y0, 3, h, '#6e6038'); R(x, y0, 1, h, '#b8a468'); R(x + 1, y0 + ((x * 7) % 13), 1, 2, '#4a3e22'); }
      R(x0, y0, w, 1, '#c8b080'); R(x0, y1 - 1, w, 2, '#3a3020');
      for (const y of [y0 + 1, y1 - 3]) { R(x0 - 3, y, w + 6, 2, '#54482a'); R(x0 - 3, y, w + 6, 1, '#a08a5a'); }
    }
  }
  function veSau(o, t) { // vũng nước sâu lạnh: xanh thẫm, viền bọt trắng (khác vũng nông xám-lục của nền)
    ELL(o.x, o.y + 1, o.rx + 2, o.ry + 2, 'rgba(0,0,0,0.35)');
    ELL(o.x, o.y, o.rx + 1, o.ry + 1, '#d8eef0');
    ELL(o.x, o.y, o.rx, o.ry, '#0a3a4e');
    ELL(o.x, o.y - 1, o.rx - 3, o.ry - 2, '#0e4a64');
    for (let i = 0; i < 10; i++) { const a = i * 0.628 + t * 0.4, x = o.x + Math.cos(a) * o.rx, y = o.y + Math.sin(a) * o.ry; R(x - 1, y, 2, 1, '#ffffff'); }
    const k = Math.floor(t * 2 + o.x) % 3;
    R(o.x - o.rx * 0.4 + k, o.y - 2, 6, 1, 'rgba(190,240,255,0.7)'); R(o.x + 3 - k, o.y + 2, 4, 1, 'rgba(190,240,255,0.5)');
  }
  function veVung(z, t) { // vũng độc lục bình / vệt lửa dầu đang cháy (mờ dần về cuối)
    const a = Math.max(0, Math.min(1, z.life / CFG.vungGiay)), f = Math.floor(t * 8) % 3;
    if (z.song === 'lucbinh') {
      ELL(z.x, z.y, z.r, z.r * 0.45, 'rgba(120,60,160,' + (0.35 * a + 0.1).toFixed(2) + ')');
      for (let i = 0; i < 6; i++) { const an = i * 1.05 + t, x = z.x + Math.cos(an) * z.r * 0.6, y = z.y + Math.sin(an) * z.r * 0.25; R(x, y - f, 2, 2, 'rgba(200,140,255,' + (0.8 * a).toFixed(2) + ')'); }
      R(z.x - 6, z.y - 2, 4, 2, '#3e7a3a'); R(z.x + 4, z.y + 1, 3, 2, '#4a8a44'); R(z.x - 1, z.y - 1, 2, 2, '#b07ae0'); // lá, hoa dập nát
    } else {
      ELL(z.x, z.y, z.r, z.r * 0.4, 'rgba(255,140,40,' + (0.28 * a + 0.08).toFixed(2) + ')');
      for (let i = -3; i <= 3; i++) {
        const x = z.x + i * (z.r / 4), h = 3 + ((i + f + 9) % 3) * 2;
        R(x - 1, z.y - h, 3, h, 'rgba(255,122,42,' + (0.85 * a).toFixed(2) + ')'); R(x, z.y - h + 1, 1, h - 1, 'rgba(255,220,90,' + (0.9 * a).toFixed(2) + ')');
      }
      R(z.x - 10, z.y - 2, 6, 3, '#3a2c20'); R(z.x - 9, z.y - 3, 4, 1, '#c8a040'); // đèn đổ
    }
  }
  L.lopSan = function (c, W, room, t) {
    if (!W || !W.song) return;
    const pv = cx; cx = c;
    try {
      for (const o of W.song.sau) veSau(o, t);
      for (const d of W.song.dai) veDai(d, t);
      for (const z of W.zones) if (z.song && !z.dead) veVung(z, t);
    } finally { cx = pv; }
  };
  if (G.roomArt) G.roomArt.lopSan = L.lopSan;

  // đồ vật: lục bình, đèn dầu (quầng mời gọi dưới chân như vật mang hệ của ba vùng cũ)
  function quang(x, y, col, t) {
    const k = 0.5 + 0.5 * Math.sin(t * 4);
    ELL(x, y, 13 + k * 2, 5 + k, 'rgba(' + col + ',' + (0.1 + 0.08 * k).toFixed(2) + ')');
    if (k > 0.6) { R(x - 15, y, 2, 1, 'rgba(' + col + ',0.6)'); R(x + 14, y, 2, 1, 'rgba(' + col + ',0.6)'); }
  }
  function veLucBinh(x, y, t) {
    quang(x, y, '190,120,255', t);
    const b = Math.round(Math.sin(t * 1.7 + x) * 0.6);
    ELL(x, y + 1, 11, 4, 'rgba(0,0,0,0.3)');
    for (const [dx, dy, rx] of [[-6, -3, 5], [5, -2, 5], [0, -6, 5], [-2, 0, 4]]) { ELL(x + dx, y + dy + b, rx + 1, rx * 0.7 + 1, '#1e3a1e'); ELL(x + dx, y + dy + b, rx, rx * 0.7, '#3e8a3a'); R(x + dx - 2, y + dy + b - 2, 3, 1, '#7ac860'); }
    R(x - 1, y - 16 + b, 2, 9, '#3e7a34'); // cuống hoa
    for (const [dx, dy] of [[-3, -17], [2, -18], [0, -21], [-2, -14], [3, -14]]) { R(x + dx - 1, y + dy + b, 3, 3, '#7a3ab0'); R(x + dx, y + dy + b, 1, 1, '#d8a8ff'); }
    R(x, y - 19 + b, 1, 1, '#ffe060');
    const f = Math.floor(t * 4) % 3; R(x - 7 + f * 2, y - 22 - f + b, 1, 1, '#d8a8ff'); R(x + 6 - f, y - 20 - f * 2 + b, 1, 1, '#c890ff');
  }
  function veDenDau(x, y, t) {
    quang(x, y, '255,170,80', t);
    ELL(x, y + 1, 6, 2, 'rgba(0,0,0,0.3)');
    R(x - 1, y - 30, 3, 31, '#3a3020'); R(x, y - 30, 1, 31, '#a08a5a'); for (let k = y - 26; k < y; k += 6) R(x - 1, k, 3, 1, '#2a2216'); // cọc tre
    R(x, y - 30, 9, 2, '#54482a'); R(x + 7, y - 28, 1, 3, '#a08a5a'); // cần treo
    const sw = Math.round(Math.sin(t * 2 + x) * 0.8), lx = x + 7 + sw, ly = y - 25;
    R(lx - 3, ly, 7, 9, '#1a1410'); R(lx - 2, ly + 1, 5, 7, '#c88a3a'); R(lx - 3, ly - 1, 7, 1, '#5a4a2a'); R(lx - 2, ly + 8, 5, 1, '#5a4a2a');
    const f = Math.floor(t * 9 + x) % 3; R(lx - 1, ly + 3 - (f === 1 ? 1 : 0), 3, 3, '#ff9a30'); R(lx, ly + 3 - f % 2, 1, 2, '#ffe890');
    ELL(lx + 0.5, ly + 4, 9, 7, 'rgba(255,190,100,' + (0.1 + 0.03 * f).toFixed(2) + ')');
  }
  const A = G.art;
  if (A && typeof A.prop === 'function') {
    const p0 = A.prop;
    A.prop = function (c, o) {
      if (!o || (o.type !== 'lucbinh' && o.type !== 'dendau')) return p0.apply(this, arguments);
      const pv = cx; cx = c;
      try { if (o.type === 'lucbinh') veLucBinh(Math.round(o.x), Math.round(o.y), G.time || 0); else veDenDau(Math.round(o.x), Math.round(o.y), G.time || 0); }
      catch (e) { if (!L.loiVe) { L.loiVe = e; if (window.console) console.warn('song_luat prop', e); } }
      finally { cx = pv; }
    };
    // Có theme Sông sâu thì không phủ màu nước đục (phiên 1, js/vung4.js) lên NỀN phòng nữa; quái mượn hình vẫn nhuộm như cũ.
    const bg0 = A.bg;
    A.bg = function () {
      const V4 = G.vung4, W = G.getWorld ? G.getWorld() : null;
      if (!V4 || !V4.dangVe || !W || W.region !== 3 || !(G.roomArt && G.roomArt.vungTheme && G.roomArt.vungTheme(3) === 3)) return bg0.apply(this, arguments);
      V4.dangVe = false;
      try { return bg0.apply(this, arguments); } finally { V4.dangVe = true; }
    };
  }

  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Dòng nước đẩy theo mũi tên — đứng trên cầu tre thì không trôi': 'The current pushes you along the arrows — stand on the bamboo bridge to stay put',
  });
})();
