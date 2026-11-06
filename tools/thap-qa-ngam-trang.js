// TURRET MERGE — QA NGÂM: phần chạy TRONG TRANG (tiêm bằng addInitScript trước mọi script của game).
// Bot chơi thật qua đúng hàm của game (trieu / ghep / nangCap / dungMV / chuDong — y như nút & kéo thả của UI),
// mô phỏng do bot tự bước (bước cố định BUOC, không theo rAF) → chạy nhanh, tái lập theo hạt giống.
// Bất biến kiểm MỖI BƯỚC (rẻ) và mỗi 4 bước (đủ): xem BAT_BIEN bên dưới. Lỗi ghi vào __QA.loi kèm hạt giống + bước.
(function () {
  'use strict';
  const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const r0 = Math.random.bind(Math);
  const Q = window.__QA = {
    inSim: false, rS: mb(1), rB: mb(2), cho: false, ve: false, cfg: null, buoc: 0, loi: [], daLoi: {}, nk: [], dem: {},
    max: { dan: 0, hu: 0, bay: 0, quai: 0, hat: 0, chu: 0, vx: 0, tvfPop: 0, tvfDs: 0, ve: 0, step: 0 },
    tHetTrum: -1e9, coTrum: false, veTam: [], vong: [], chu: [], tVe: [], tStep: [],
  };
  // Math.random: trong mô phỏng/bot = RNG hạt giống (tái lập), ngoài (vẽ, HUD, hoạt ảnh thời gian thực) = RNG thật
  Math.random = function () { return Q.inSim ? Q.rS() : r0(); };
  const sim = (f) => { const c = Q.inSim; Q.inSim = true; try { return f(); } finally { Q.inSim = c; } };
  const nk = (s) => { Q.nk.push(Q.buoc + ':' + s); if (Q.nk.length > (Q.cfg && Q.cfg.nkMax || 40)) Q.nk.shift(); };
  Q.nkLog = nk;
  const LOI = (loai, chi, them) => {
    const k = loai + '|' + chi.replace(/\d+(\.\d+)?/g, '#');
    Q.dem[loai] = (Q.dem[loai] || 0) + 1;
    if (Q.daLoi[k]) return; Q.daLoi[k] = 1;
    Q.loi.push(Object.assign({ loai, chi, seed: Q.cfg && Q.cfg.seed, che: Q.cfg && Q.cfg.che, buoc: Q.buoc, wave: G.wave, t: +G.t.toFixed(2), nk: Q.nk.slice(-(Q.cfg && Q.cfg.nkMax || 14)) }, them || {}));
  };
  Q.LOI = LOI;

  // ---------- móc vào game (sau khi mọi script đã chạy) ----------
  Q.cai = function () {
    if (Q._cai) return; Q._cai = true;
    const capThat = window.capNhat;
    window.capNhat = function (dt) { if (Q.thuc && !Q.cho) { Q.motBuoc(); return; } if (!Q.cho) return; return capThat(dt); };
    Q.capThat = capThat;
    const veThat = REN.ve.bind(REN);
    REN.ve = function (dt, a) {
      if (Q.thuc && !Q.ve) { const v0 = performance.now(); Q.ve = true; try { return veThat(dt, a); } finally { Q.ve = false; Q.tVe.push(performance.now() - v0); try { Q.ktVe(); } catch (e) { } } }
      if (!Q.ve) return; return veThat(dt, a);
    };
    Q.veThat = veThat;
    // batDau: hạt giống RNG mô phỏng + ghi bộ bài gốc mỗi bàn
    const bd = window.batDau;
    window.batDau = function () {
      Q.rS = mb((Q.cfg ? Q.cfg.seed : 1) * 2654435761 >>> 0); Q.rB = mb(((Q.cfg ? Q.cfg.seed : 1) ^ 0x9e3779b9) >>> 0);
      const r = sim(() => bd.apply(this, arguments));
      Q.deck0 = G.ban.map(B => new Set(B.deck)); Q.buoc = 0; Q.cuoi = G.ban.map(B => B.t.map(T => T ? T.uid : 0)); Q.tHetTrum = -1e9;
      Q.saoChep = new Map(); Q.ghepUid = new Set();
      return r;
    };
    // nhật ký sự kiện (để biết ụ lạ / mất bản sao do đâu)
    const boc = (ten, f, mo) => { const g = window[ten]; if (typeof g !== 'function') return; window[ten] = function () { try { nk(mo.apply(null, arguments)); } catch (e) { } return f ? f(g, this, arguments) : g.apply(this, arguments); }; };
    boc('ghep', (g, th, a) => { const A = a[1], Bb = a[2]; if (A) Q.ghepUid.add(A.uid); if (Bb) Q.ghepUid.add(Bb.uid); return g.apply(th, a); }, (B, a, b, ep) => 'ghep ' + (a && a.id + (a.banSao ? '(copy)' : '') + a.sao) + '→' + (b && b.id + (b.banSao ? '(copy)' : '') + b.sao) + (ep ? ' ep' : ''));
    boc('chuyenU', (g, th, a) => { const T = a[1], N = g.apply(th, a); if (T && T.banSao && N && !N.banSao) LOI('mat-ban-sao', 'chuyenU ' + T.id + '(copy)→' + N.id + ' mất dấu bản sao'); return N; }, (B, T, id, sao) => 'chuyenU ' + (T && T.id + (T.banSao ? '(copy)' : '')) + '→' + id + sao);
    boc('trieu', null, (B, m, id) => 'trieu b' + (B && B.i) + (id ? ' ' + id : '') + (m ? ' free' : ''));
    boc('sinhDoi', null, (B) => 'sinhDoi b' + (B && B.i));
    boc('dungMV', null, (B) => 'dungMV b' + (B && B.i) + ' ' + (B && B.mv.id));
    boc('thucHienChieu', null, (E) => 'chieuTrum ' + (E && E.trum));
    boc('sinhTrum', null, (id) => 'sinhTrum ' + id);
    // vẽ: đánh dấu ảnh dấu báo chiêu trùm + ảnh vòng để biết khung nào đang vẽ gì
    const anhTVF = TVF.anh.bind(TVF);
    TVF.anh = function (n) { const a = anhTVF(n); if (a) try { a.__tvf = n; } catch (e) { } return a; };
    const imgThat = REN.img.bind(REN);
    REN.img = function (n) { const a = imgThat(n); if (a && !a.__n) try { a.__n = n; } catch (e) { } return a; };
    const P = CanvasRenderingContext2D.prototype, di = P.drawImage;
    P.drawImage = function (im) {
      if (Q.ve && im) {
        const n = im.__tvf || im.__n;
        if (n) {
          if (im.__tvf || /^tb_|^prism_seg/.test(n)) Q.veTam.push(n);
          // h2_vong_xam = khung tròn của BIỂU TƯỢNG (kỹ năng khi ghép nổi trên ô — hieuung.js 'kh'), không phải vòng hiệu ứng: trùng tâm
          // với chớp đỏ triệu hồi ở ô NGAY TRÊN là tình cờ hình học (ngâm 06/11 s50 PVP) → không xét
          if (/vong|ring/.test(n) && !/^loi_|^h2_vong_xam$/.test(n) && arguments.length >= 5 && this.globalAlpha > 0.25) {
            const k = arguments.length >= 9 ? 5 : 1, w = arguments[k + 2], h = arguments[k + 3];
            if (w > 30) { const m = this.getTransform(), cx = arguments[k] + w / 2, cy = arguments[k + 1] + h / 2; Q.vong.push([n, m.a * cx + m.c * cy + m.e, m.b * cx + m.d * cy + m.f, Math.hypot(m.a, m.b) * w]); }
          }
        }
      }
      return di.apply(this, arguments);
    };
    // hiệu ứng / âm thanh / HUD được gọi TỪ luật chơi: chạy bằng RNG thật (không ăn RNG luật) → luật tái lập độc lập với hình
    // (đúng điều kiện online lockstep: hình mỗi máy khác nhau không được làm lệch luật)
    const HINH = { FX: typeof FX !== 'undefined' && FX, VX: typeof VX !== 'undefined' && VX, TVF: typeof TVF !== 'undefined' && TVF, TVX: typeof TVX !== 'undefined' && TVX,
      BANGFX: typeof BANGFX !== 'undefined' && BANGFX, BVX: typeof BVX !== 'undefined' && BVX, CG: typeof CG !== 'undefined' && CG, GF: typeof GF !== 'undefined' && GF,
      GFX: typeof GFX !== 'undefined' && GFX, EVO: typeof EVO !== 'undefined' && EVO, SND: typeof SND !== 'undefined' && SND, REN: typeof REN !== 'undefined' && REN,
      PX: typeof PX !== 'undefined' && PX, FXU: typeof FXU !== 'undefined' && FXU, ND: typeof ND !== 'undefined' && ND, HT: typeof HT !== 'undefined' && HT,
      HUD2: typeof HUD2 !== 'undefined' && HUD2, DEMKN: typeof DEMKN !== 'undefined' && DEMKN, TIENUI: typeof TIENUI !== 'undefined' && TIENUI, UI: UI };
    if (!Q.HINH_TRON) for (const [ten, o] of Object.entries(HINH)) {
      if (!o) continue;
      for (const k of Object.keys(o)) {
        const f = o[k]; if (typeof f !== 'function' || k === 'init' || k === 'vao' || /^[A-Z]/.test(k)) continue;
        o[k] = function () { const c = Q.inSim; Q.inSim = false; try { return f.apply(this, arguments); } finally { Q.inSim = c; } };
      }
    }
    const ft = P.fillText;
    P.fillText = function (txt, x, y) {
      if (Q.ve && Q.cfg && Q.cfg.chu && this.canvas && this.canvas.id === 'cv' && this.globalAlpha > 0.6 && String(txt).trim().length >= 3) {
        const m = this.getTransform(), w = this.measureText(txt).width * Math.hypot(m.a, m.b), h = (parseFloat(this.font) || 10) * Math.hypot(m.c, m.d);
        const X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f, al = this.textAlign;
        const L = al === 'center' ? X - w / 2 : al === 'right' || al === 'end' ? X - w : X;
        Q.chu.push([String(txt), L, Y - h * 0.8, L + w, Y + h * 0.2]);
      }
      return ft.apply(this, arguments);
    };
    // console.error → lỗi
    const ce = console.error.bind(console);
    console.error = function () { try { LOI('console-error', [...arguments].map(x => x && x.stack ? x.stack.split('\n').slice(0, 3).join(' | ') : String(x)).join(' ').slice(0, 300)); } catch (e) { } return ce.apply(console, arguments); };
    addEventListener('error', (e) => LOI('pageerror', (e.message || '') + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  };

  // ---------- vào trận ----------
  Q.vaoTran = function (cfg) {
    Q.cfg = cfg; Q.loi = []; Q.daLoi = {}; Q.dem = {}; Q.nk = []; Q.tVe = []; Q.tStep = []; Q.cham = []; Q.bams = [];
    for (const k in Q.max) Q.max[k] = 0;
    G.debug.seed = cfg.seed; G.debug.cap0 = cfg.cap0 || null; G.debug.cap2 = cfg.cap2 || null; G.debug.deck2 = cfg.deck2 || null; G.debug.wave = cfg.wave || 0; G.debug.mana = cfg.mana || 0; G.debug.fill = cfg.fill || 0;
    G.tocDo = cfg.toc || 1;
    UI.chon = cfg.deck.slice(); UI.che = cfg.che; UI.mv = cfg.mv;
    Q.cho = false; Q.ve = false;
    UI.vao();
    if (cfg.batTu) for (const B of G.ban) B.tim = 9999;
    if (cfg.batTu1 && G.ban[1]) G.ban[1].tim = 9999;
    G.debug.fill = 0; G.debug.wave = 0; G.debug.mana = 0;
    return { deck: G.ban.map(B => B.deck), mv: G.ban.map(B => B.mv.id), hat: G.hat };
  };
  Q.san = () => G.ban.length > 0 && !TAI.cho && !(typeof VT !== 'undefined' && VT.mo);

  // ---------- BOT ----------
  const ri = (n) => Math.floor(Q.rB() * n), co = (p) => Q.rB() < p, chon = (a) => a[ri(a.length)];
  Q.bot = function (B) {
    const ts = B.t.filter(Boolean), trong = oTrong(B).length;
    // 1) kỹ năng chủ động (ụ ĐỎ) — chạm khi nạp đầy, như UI (không đóng băng / hoá đá)
    for (const T of ts) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && !T.st.bang && !T.st.da && co(0.7)) { nk('chuDong ' + T.id + T.sao); sk.chuDong(G, B, T); return 'kn'; } }
    // 2) chỉ huy
    if (CH.trangThai(B) === 'san' && co(0.25)) { if (dungMV(B)) return 'mv'; }
    // 3) ghép đặc biệt (kéo Copycat / Merge King / Blood Circuit / Scrap Forge / Teleporter / Mixer…)
    const db = [], th = [];
    for (const a of ts) for (const b of ts) if (a !== b && hopLeGhep(a, b)) (ghepDBHop(a, b) ? db : th).push([a, b]);
    if (db.length && co(Q.cfg.dbP != null ? Q.cfg.dbP : 0.45)) { const [a, b] = chon(db); ghep(B, a, b); return 'db'; }
    // 4) triệu hồi
    if (B.mana >= B.gia && trong && co(0.85)) { trieu(B); return 'trieu'; }
    // 5) ghép thường: bàn càng đầy càng hay ghép; ưu tiên sao thấp
    if (th.length && co(trong <= 2 ? 0.9 : trong <= 6 ? 0.45 : 0.15)) {
      th.sort((x, y) => x[0].sao - y[0].sao); const [a, b] = th[ri(Math.min(th.length, 3))]; ghep(B, a, b); return 'ghep';
    }
    // 6) power-up
    // (người chơi thật không đốt sạch mana đầu trận vào power-up khi bàn còn trống → chỉ nâng khi bàn ≥ 6 ụ hoặc dư đủ 1 lần triệu hồi)
    if (co(0.35) && (ts.length >= 6 || !trong)) { const L = B.deck.filter(id => B.lv[id] < 5 && B.mana >= LUAT.giaNangCap[B.lv[id] - 1] + (trong ? B.gia : 0)); if (L.length) { const id = chon(L); nk('nang ' + id); nangCap(B, id); return 'nang'; } }
    return '';
  };

  // ---------- BẤT BIẾN ----------
  const fin = (v) => typeof v === 'number' && isFinite(v);
  Q.ktNhanh = function () { // mỗi bước: ô đổi chủ → ụ mới phải thuộc bộ bài; bản sao không được biến mất khi không bị ghép
    for (const B of G.ban) {
      const cu = Q.cuoi[B.i] || (Q.cuoi[B.i] = []);
      for (let o = 0; o < 15; o++) {
        const T = B.t[o], u = T ? T.uid : 0;
        if (u === cu[o]) continue;
        const P = Q.uMap && Q.uMap.get(cu[o]);
        if (T) {
          const hl = Q.deck0[B.i].has(T.id) || B.deck.includes(T.id);
          if (!hl) LOI('u-ngoai-bo', 'bàn ' + B.i + ' ô ' + o + ': ' + T.id + ' ' + T.sao + '★ không có trong bộ bài [' + [...Q.deck0[B.i]].join(',') + ']', { id: T.id });
          if (!SKILLS[T.id] || !G.rosterMap[T.id]) LOI('u-khong-ton-tai', 'bàn ' + B.i + ' ô ' + o + ': ' + T.id);
          if (T.o !== o || T.ban !== B.i) LOI('u-sai-cho', T.id + ' T.o=' + T.o + ' ô=' + o + ' T.ban=' + T.ban + ' bàn=' + B.i);
        }
        // bản sao ở ô này bị thay bằng ụ khác KHÔNG phải do ghép nó, và nó cũng không còn trên bàn (đổi chỗ) → mất bản sao
        if (P && P.banSao && !Q.ghepUid.has(P.uid) && T && !T.banSao && !B.t.includes(P) && !G.ban.some(X => X.t.includes(P))) LOI('mat-ban-sao', 'bàn ' + B.i + ' ô ' + o + ': bản sao ' + P.id + ' ' + P.sao + '★ → ' + T.id + ' ' + T.sao + '★ (không ghép) mất dấu bản sao');
        cu[o] = u;
      }
    }
    Q.ghepUid.clear();
    // bản đồ uid → ụ (để lần sau biết ụ cũ)
    const m = Q.uMap || (Q.uMap = new Map()); m.clear();
    const sc = Q.saoCu || (Q.saoCu = new Map());
    for (const B of G.ban) for (const T of B.t) if (T) { m.set(T.uid, T); const s0 = sc.get(T.uid); if (s0 !== undefined && s0 !== T.sao) nk('sao ' + T.id + ' b' + B.i + 'o' + T.o + ' ' + s0 + '→' + T.sao); sc.set(T.uid, T.sao); }
    if (sc.size > 4000) sc.clear();
  };
  Q.kt = function () {
    const coTrum = G.quai.some(E => E.trum && !E.chet);
    if (coTrum) Q.tHetTrum = G.t;
    const hetTrum = !coTrum && G.t - Q.tHetTrum > 1.2;
    for (const B of G.ban) {
      if (!fin(B.mana) || B.mana < -1e-6) LOI('mana-sai', 'bàn ' + B.i + ' mana=' + B.mana);
      if (!fin(B.gia) || B.gia <= 0) LOI('gia-sai', 'bàn ' + B.i + ' giá triệu=' + B.gia);
      if (!fin(B.tim)) LOI('tim-sai', 'bàn ' + B.i + ' tim=' + B.tim);
      if (B.t.length !== 15) LOI('ban-sai', 'bàn ' + B.i + ' có ' + B.t.length + ' ô');
      for (const id in B.lv) if (!(B.lv[id] >= 1 && B.lv[id] <= 5)) LOI('lv-sai', id + ' lv=' + B.lv[id]);
      for (let o = 0; o < 15; o++) {
        const T = B.t[o]; if (!T) continue;
        if (!(Number.isInteger(T.sao) && T.sao >= 1 && T.sao <= 7)) LOI('sao-sai', 'bàn ' + B.i + ' ô ' + o + ' ' + T.id + ' sao=' + T.sao);
        if (!fin(T.goc) || !fin(T.cd) || !fin(T.rx)) LOI('nan-u', T.id + ' goc=' + T.goc + ' cd=' + T.cd + ' rx=' + T.rx);
        if (T.nap != null && !fin(T.nap)) LOI('nan-u', T.id + ' nap=' + T.nap);
        if (!(T.st.bang <= 30)) LOI('bang-qua-lau', T.id + ' bang=' + T.st.bang);
        if (hetTrum && T.st.ngam > 0 && !(T.hexT > 0) && !G.hu.some(h => h.k === 'nhieu' && h.ds && h.ds.includes(T))) LOI('trum-de-lai', 'bàn ' + B.i + ' ô ' + o + ' ' + T.id + ': tâm ngắm trùm còn (st.ngam=' + T.st.ngam.toFixed(2) + ') khi không còn trùm');
        // Evolver 7★ xịt bị giảm sao → phải đếm lại (skill chỉ chạy khi ụ không bị khoá: băng / đá / câm Jammer / Hex) — kiểm khi còn xịt > 1 s lúc RẢNH
        if (T.id === 'tienhoa' && T.xit && T.sao < 7 && !biKhoa(T) && !(T.st.cam > 0) && !(T.hexT > 0)) { T._qaX = (T._qaX || 0) + BUOC * (Q.cfg.ktMoi || 4); if (T._qaX > 1) LOI('evolver-xit-sai', 'Evolver ' + T.sao + '★ vẫn xịt > 1 s khi không bị khoá'); } else T._qaX = 0;
        // Evolver mất sao DƯỚI 7★ cũng phải đếm lại từ đầu (KIEM.md mục IX 'Đã quyết' #3): còn nhớ sao cũ cao hơn > 1 s lúc RẢNH = chưa đếm lại
        //  + thấy sao giảm giữa 2 lần kiểm (cùng ụ, không bị khoá) mà bộ đếm vẫn lớn hơn khoảng thời gian đó → không đếm lại
        if (T.id === 'tienhoa' && T.sao < 7) {
          const ranh = !biKhoa(T) && !(T.st.cam > 0) && !(T.hexT > 0), w = BUOC * (Q.cfg.ktMoi || 4);
          if (ranh && T.evoSao > T.sao) { T._qaE = (T._qaE || 0) + w; if (T._qaE > 1) LOI('evolver-ha-sao', 'Evolver ' + T.evoSao + '★→' + T.sao + '★ chưa đếm lại > 1 s khi không bị khoá'); } else T._qaE = 0;
          if (ranh && T._qaR && T._qaS != null && T.sao < T._qaS && T.evoSao === T.sao && T.tuoi > w * 3.1 + 0.05) LOI('evolver-ha-sao', 'Evolver ' + T._qaS + '★→' + T.sao + '★: bộ đếm ' + T.tuoi.toFixed(2) + ' s không về 0');
          T._qaS = T.sao; T._qaR = ranh;
        }
      }
    }
    if (hetTrum && TVF.ds.length) LOI('trum-de-lai', 'TVF.ds còn ' + TVF.ds.length + ' dấu báo chiêu khi không còn trùm (' + TVF.ds.map(d => d.ten).join(',') + ')');
    for (const E of G.quai) {
      if (E.chet) continue;
      if (!fin(E.hp) || !fin(E.x) || !fin(E.y) || !fin(E.s)) LOI('nan-quai', (E.trum || E.id) + ' hp=' + E.hp + ' x=' + E.x + ' s=' + E.s);
      if (E.hp > E.max * 1.001 + 1) LOI('quai-mau-vuot', (E.trum || E.id) + ' hp ' + E.hp + ' > max ' + E.max);
    }
    if (G.tWave > 400 && !G.ketThuc) LOI('wave-ket', 'wave ' + G.wave + ' chạy ' + G.tWave.toFixed(0) + ' s');
    const M = Q.max, hat = FX.hat.length, chu = FX.chu.length;
    M.dan = Math.max(M.dan, G.dan.length); M.hu = Math.max(M.hu, G.hu.length); M.bay = Math.max(M.bay, G.bay.length); M.quai = Math.max(M.quai, G.quai.length);
    M.hat = Math.max(M.hat, hat); M.chu = Math.max(M.chu, chu); M.vx = Math.max(M.vx, VX.ds.length); M.tvfPop = Math.max(M.tvfPop, TVF.pop.length); M.tvfDs = Math.max(M.tvfDs, TVF.ds.length);
    if (G.dan.length > 4000) LOI('ro-dan', 'G.dan=' + G.dan.length);
    if (G.hu.length > 800) LOI('ro-hu', 'G.hu=' + G.hu.length + ' (' + [...new Set(G.hu.slice(-50).map(o => o.k))].join(',') + ')');
    if (G.bay.length > 200) LOI('ro-bay', 'G.bay=' + G.bay.length);
    if (VX.ds.length > 600) LOI('ro-vx', 'VX.ds=' + VX.ds.length);
  };
  // lớp phủ sai chế độ: trận offline không được hiện bảng mạng / online
  Q.ktPhu = function () {
    const onl = typeof ONS !== 'undefined' && ONS.on;
    if (onl) return;
    for (const s of ['#matmang', '#ons-bao', '#onl-bang', '#onl-sanh', '#kqo-tt', '#nn-phong']) {
      const e = document.querySelector(s); if (!e) continue;
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (!e.hidden && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && r.width > 4 && r.height > 4) LOI('phu-sai-che-do', s + ' hiện trong trận ' + G.che + ' offline');
    }
  };
  // khung vẽ: dấu báo chiêu trùm khi không còn trùm; 2 vòng chồng nhau cùng tâm
  Q.ktVe = function () {
    const coTrum = G.quai.some(E => E.trum && !E.chet), hetTrum = !coTrum && G.t - Q.tHetTrum > 1.2;
    if ((hetTrum || G.ketThuc) && Q.veTam.length) {
      const L = Q.veTam.filter(n => !/^cmd_/.test(n));
      if (L.length) LOI('trum-de-lai', 'vẽ dấu báo chiêu trùm [' + [...new Set(L)].join(',') + '] khi không còn trùm' + (G.ketThuc ? ' (đã hết trận)' : ''));
    }
    const V = Q.vong;
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
      const a = V[i], b = V[j];
      if (Math.hypot(a[1] - b[1], a[2] - b[2]) < 3 && a[3] / b[3] > 0.8 && a[3] / b[3] < 1.25 && a[0] !== b[0]) LOI('vong-chong', 'hai vòng chồng cùng tâm: ' + a[0] + ' + ' + b[0] + ' (cỡ ' + Math.round(a[3]) + '/' + Math.round(b[3]) + ' px)');
    }
    const C = Q.chu; // 2 dòng chữ KHÁC nhau đè lên nhau > 40 % phần nhỏ hơn (nhãn tên ụ / nhãn kỹ năng chồng nhau)
    for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {
      const a = C[i], b = C[j]; if (a[0] === b[0]) continue;
      const ox = Math.min(a[3], b[3]) - Math.max(a[1], b[1]), oy = Math.min(a[4], b[4]) - Math.max(a[2], b[2]);
      if (ox <= 0 || oy <= 0) continue;
      const nho = Math.min((a[3] - a[1]) * (a[4] - a[2]), (b[3] - b[1]) * (b[4] - b[2]));
      if (ox * oy > 0.4 * nho) LOI('chu-chong', 'chữ "' + a[0].slice(0, 24) + '" đè "' + b[0].slice(0, 24) + '"');
    }
    Q.veTam.length = 0; Q.vong.length = 0; Q.chu.length = 0;
  };

  // ---------- bước trận ----------
  // chạy n bước (dừng sớm khi hết trận / quá wall ms); vẽ 1 khung mỗi cfg.veMoi bước (mặc định 20 ≈ 3 khung / giây trận)
  // 1 bước luật + bot + kiểm (dùng chung cho chế độ tua nhanh và chế độ THẬT theo rAF)
  Q.motBuoc = function () {
    const cfg = Q.cfg, s0 = performance.now();
    Q.inSim = true;
    try {
      Q.capThat(BUOC);
      // bot: mỗi bàn ra quyết định mỗi 0,25–0,8 s trận (bàn máy vẫn có AI sẵn của game)
      if (!G.ketThuc) for (const B of G.ban) {
        B._qaT = (B._qaT || 0) - BUOC;
        if (B.net) continue; // online: bàn đồng đội là con rối (máy kia điều khiển)
        if (B._qaT <= 0) { B._qaT = 0.25 + Q.rB() * 0.55; if (!B.ai || co(cfg.botMay != null ? cfg.botMay : 0.5)) Q.bot(B); }
      }
    } catch (e) { LOI('ngoai-le-sim', (e && e.message) + ' | ' + String(e && e.stack || '').split('\n').slice(1, 4).join(' | ').replace(/https?:\/\/[^/]+\/thap\//g, '')); }
    finally { Q.inSim = false; }
    Q.buoc++;
    Q.ktNhanh();
    if (Q.buoc % (cfg.ktMoi || 4) === 0) Q.kt();
    const ds = performance.now() - s0; Q.max.step = Math.max(Q.max.step, ds);
    if (ds > 250 && Q.buoc > 120) { Q.cham = Q.cham || []; if (Q.cham.length < 5) Q.cham.push({ ms: Math.round(ds), wave: G.wave, nk: Q.nk.slice(-3) }); } // cảnh báo giật (máy đo 2 lõi dùng chung — không tính lỗi)
    if (ds > (cfg.buocCham || 1000) && Q.buoc > 120) LOI('buoc-cham', '1 bước luật (1/60 s) mất ' + Math.round(ds) + ' ms');
  };
  // chạy n bước tua nhanh (dừng sớm khi hết trận / quá wall ms); vẽ 1 khung mỗi cfg.veMoi bước (mặc định 20 ≈ 3 khung / giây trận)
  Q.chay = function (n, wall) {
    const t0 = performance.now(), cfg = Q.cfg, veMoi = cfg.veMoi || 20, toc = cfg.toc || 1;
    let i = 0;
    Q.cho = true;
    try {
      for (; i < n && !G.ketThuc; i++) {
        if (performance.now() - t0 > (wall || 2500)) break;
        if (typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)) break; // như vòng thật: ảnh lẻ đang giải mã → luật đứng chờ (bàn vẫn vẽ)
        chupTruoc();
        Q.motBuoc();
        if (cfg.ghiBam && Q.buoc % 600 === 0) Q.bams.push(Q.bam());
        if (Q.buoc % veMoi === 0) {
          const v0 = performance.now();
          Q.ve = true;
          try { FX.capNhat(BUOC * veMoi * (toc > 1 ? Math.sqrt(toc) : 1)); Q.veThat(BUOC * veMoi, 1); UI.capNhat(); }
          catch (e) { LOI('ngoai-le-ve', (e && e.message) + ' | ' + String(e && e.stack || '').split('\n').slice(1, 4).join(' | ').replace(/https?:\/\/[^/]+\/thap\//g, '')); }
          finally { Q.ve = false; }
          const dv = performance.now() - v0; Q.tVe.push(dv); Q.max.ve = Math.max(Q.max.ve, dv);
          Q.ktVe();
          if (Q.buoc % (veMoi * 10) === 0) Q.ktPhu();
        }
      }
    } finally { Q.cho = false; }
    return { i, het: !!G.ketThuc, wave: G.wave, t: G.t, buoc: Q.buoc, nloi: Q.loi.length };
  };
  // chế độ THẬT: vòng rAF của game tự chạy (đúng nhịp 1×/2×/3×, hoạt ảnh thời gian thực, HUD) — bot + kiểm móc vào từng bước
  Q.thucBat = function (v, cfg) { if (cfg) { Q.cfg = cfg; Q.loi = []; Q.daLoi = {}; Q.dem = {}; } Q.thuc = !!v; };
  Q.oCua = (B) => B ? B.t.map(T => T ? T.id + T.sao : '-') : [];
  Q.trangThai = () => ({ het: !!G.ketThuc, wave: G.wave, t: G.t, buoc: Q.buoc, nloi: Q.loi.length });
  // băm trạng thái (so tái lập)
  Q.bam = function () {
    let s = G.wave + '|' + G.t.toFixed(3) + '|' + G.quai.length + '|' + Math.round(G.quai.reduce((a, E) => a + (E.chet ? 0 : E.hp), 0));
    for (const B of G.ban) s += '#' + Math.round(B.mana) + ',' + B.tim + ',' + B.t.map(T => T ? T.id + T.sao + (T.banSao ? 'c' : '') : '-').join('.');
    let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) | 0;
    return (h >>> 0).toString(36);
  };
  Q.tom = function () {
    const tv = Q.tVe.slice().sort((a, b) => a - b), p95 = tv.length ? tv[Math.floor(tv.length * 0.95)] : 0;
    return { bams: Q.bams || [], cham: Q.cham || [], wave: G.wave, t: +G.t.toFixed(1), kt: G.ketThuc, max: Object.assign({}, Q.max), veP95: +p95.toFixed(1), loi: Q.loi, dem: Q.dem, bam: Q.bam(),
      ban: G.ban.map(B => ({ deck: B.deck, mana: Math.round(B.mana), tim: B.tim, u: B.t.filter(Boolean).map(T => T.id + T.sao + (T.banSao ? 'c' : '') + (T.st.da ? 'D' : '')).join(' ') })) };
  };
  // sau khi hết trận: màn kết quả phải hiện, vừa màn, băng thông báo đã tắt, không còn dấu trùm
  Q.ktKetQua = function () {
    const kq = document.querySelector('#ketqua');
    if (!kq || kq.hidden) { LOI('ketqua-khong-hien', 'hết trận nhưng #ketqua không hiện'); return; }
    const vw = innerWidth, vh = innerHeight;
    for (const e of kq.querySelectorAll('button, [data-act], b, span, div')) {
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) { LOI('ketqua-tran', (e.id || e.className || e.tagName) + ' ra ngoài màn (' + [r.left, r.top, r.right, r.bottom].map(Math.round) + ' / ' + vw + '×' + vh + ')'); break; }
      if ((e.tagName === 'B' || e.tagName === 'SPAN' || e.tagName === 'BUTTON') && e.scrollWidth > e.clientWidth + 2 && cs.overflow !== 'visible' && e.clientWidth > 0) { LOI('ketqua-tran', 'chữ tràn: ' + (e.id || e.className || e.tagName) + ' "' + e.textContent.slice(0, 30) + '"'); break; }
    }
    for (const s of ['#canh-bao', '#bang-wave', '#cutin']) { const e = document.querySelector(s); if (e && !e.hidden && getComputedStyle(e).display !== 'none') LOI('bang-tran-con', s + ' còn hiện trên màn kết quả'); }
    if (TVF.ds.length) LOI('trum-de-lai', 'hết trận còn ' + TVF.ds.length + ' dấu báo chiêu (TVF.ds)');
    for (const B of G.ban) for (const T of B.t) if (T && T.st.ngam > 0 && !G.quai.some(E => E.trum && !E.chet)) { LOI('trum-de-lai', 'hết trận ụ ' + T.id + ' còn tâm ngắm'); break; }
    Q.ktPhu();
  };
})();
