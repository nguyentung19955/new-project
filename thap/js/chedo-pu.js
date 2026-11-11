// ASTRAL ARSENAL — ĐẨY TRÙM (PUSH, theo Destiny Child Defense War) — người dùng cho làm tiếp 12/11 00:58. Thiết kế: tuvan/che-do-dcdw/THIET-KE.md §2.3 + §8.
//  DCDW: PVP, mỗi người bắn 1 trùm để ĐẨY LÙI; hết giờ ai đẩy trùm về gần điểm xuất phát hơn thì thắng.
//  Game mình: biến thể PVP đấu máy (bàn + đường PVP, đối thủ theo cúp như PVP — chedo-dd.js CUP):
//  · Mỗi bên 1 trùm KHÔNG CHẾT đi chậm từ cổng về lõi trên làn của bên đó. Sát thương gây ra ĐẨY LÙI trùm: lùi (px) = sát thương / K(t),
//    K(t) = PUC.k0 × máu wave(chặng) / máu wave(1) — tăng dần theo đồng hồ (chặng PUC.chang giây), tất định, không Math.random.
//  · KHÔNG có quái thường → mana không đến từ diệt quái: mỗi giây mỗi bàn nhận PUC.mana × mana-mỗi-mạng của chặng (đối thủ máy: × hệ số theo cúp).
//  · 3:00. Hết giờ: trùm bên nào còn XA lõi hơn thì bên đó thắng (bằng nhau: so tổng sát thương đã gây; vẫn bằng: thua). Trùm chạm lõi = thua ngay (mất cả 3 tim).
//  · Thắng / thua tính CÚP như PVP (+30 / −20) và Rương Trận theo luật túi thắng (thắng + 60% tất định) — đi qua chính đường kết quả PVP;
//    không ghi kỷ lục wave PVP. Sát thương theo % máu tính trên máu trùm chuẩn của chặng (E.maxPct, như Đột Kích).
//  · Không cần khoá lưu riêng (cúp dùng turret_kt.cd.cup). Mở ở cấp phi công 4 (sau khi đã quen PVP ở cấp 2).
'use strict';

const PUC = {
  gio: 180, prep: 4, chang: 12, cap: 4,
  v: 6,                  // tốc độ trùm (px luật / giây): không ai bắn thì ~110 s chạm lõi
  k0: 24,                // sát thương cần để đẩy lùi 1 px ở chặng 1 (giữ trùm đứng yên cần ~144 ST/giây lúc đầu, ~1 480 ở chặng cuối)
  mana: 0.8,             // mana mỗi giây = mana × manaGiet(chặng)
  waveThuong: 10,        // "wave" ghi cho Rương Trận / XP / điểm sự kiện của 1 trận Đẩy Trùm (cố định)
  H: 1e9,                // máu trùm (không bao giờ hết — được hồi đầy mỗi bước)
  knDau: 30, knNghi: 10, // chiêu trùm: lần đầu sau 30 s, mỗi lần sau nghỉ thêm 10 s
  ICON: 'ic_push',       // ảnh ChatGPT 12/11
};

const PU = {
  cho: null,
  cauHinh() { return { on: true }; },
  vao() {
    if (typeof UI === 'undefined' || UI.chon.length !== 5) { try { UI.nhac('Pick 5 turrets'); } catch (e) { } return false; }
    if (!TT.tnMo('pu')) { TTUI.toast(TT.tnChu('pu')); return false; }
    const c = this.cauHinh(); this.cho = c; UI.che = 'pvp';
    UI.vao();
    if (this.cho === c) { this.cho = null; return false; }
    return true;
  },
  K(w) { return PUC.k0 * mauWave(Math.max(1, w)) / mauWave(1); },
  // % quãng đường còn lại tới lõi của trùm làn i (100 = còn ở cổng)
  con(i) { const d = G.pu, E = d && d.E[i]; if (!E) return 100; const L = G.duong[E.p].len; return Math.max(0, Math.min(100, Math.round((1 - E.s / L) * 1000) / 10)); },
  buoc(dt) {
    const d = G.pu; if (!d || d.t0 == null || G.ketThuc || !G.ban.length) return;
    const t = G.t - d.t0;
    G.wave = 1 + Math.floor(t / PUC.chang); G.tWave = 0; G.cho = 0;
    const K = this.K(G.wave), ref = Math.round(mauWave(G.wave) * 30 * (1 + G.wave / 35));
    for (const E of d.E) {
      if (!E || E.chet) continue;
      const st = PUC.H - E.hp; E.hp = E.max = PUC.H; E.maxPct = ref;
      if (st > 0) { E.s = Math.max(d.sMin, E.s - st / K); d.st[E.p] += st; }
      if (E.bao) E._bao = true; else if (E._bao) { E._bao = false; E.knT += PUC.knNghi; }
    }
    while (d.moc.length < Math.floor(t / 30)) d.moc.push([Math.round(d.st[0]), Math.round(d.st[1])]); // sát thương cộng dồn mỗi 30 s (công cụ đo)
    // mana theo giây (thay mana diệt quái)
    d.tM += dt;
    while (d.tM >= 1) { d.tM -= 1; for (const B of G.ban) { const m = Math.round(manaGiet(G.wave) * PUC.mana * (B.ai && G.cupM < 1 ? G.cupM : 1)); B.mana += m; B.manaNay += m; } }
    if (t >= PUC.gio) { const a = this.con(0), b = this.con(1); d.het = true; d.thang = a > b || (a === b && d.st[0] > d.st[1]); // bằng quãng đường (cả 2 ghìm trùm ở cổng): ai gây nhiều sát thương hơn thắng; vẫn bằng: thua
      ketThuc(d.thang, d.thang ? 'Time up — your boss is farther from the core' : 'Time up — the rival pushed harder'); }
  },
  conGio() { const d = G.pu; return !d ? 0 : d.t0 == null ? PUC.gio : Math.max(0, PUC.gio - (G.t - d.t0)); },
};

const PUUI = {
  chip() {
    const d = G.pu; let e = document.getElementById('pu-chip');
    if (!d || !G.ban.length || G.ketThuc) { if (e && !e.hidden) e.hidden = true; return; }
    const wr = document.getElementById('wrap'); if (!e && wr) { e = document.createElement('div'); e.id = 'pu-chip'; e.className = 'cd-chip'; wr.appendChild(e); }
    if (!e) return;
    const con = PU.conGio(), t = 'PUSH ' + DDUI.gio(con) + ' · YOU ' + Math.round(PU.con(0)) + '% · RIVAL ' + Math.round(PU.con(1)) + '%';
    if (e._t !== t) { e._t = t; e.textContent = t; }
    e.classList.toggle('gap', PU.con(0) < PU.con(1));
    if (e.hidden) e.hidden = false;
  },
  kq(k) {
    const kq = document.getElementById('ketqua'); if (!kq || !k.pu) return;
    const dich = (x) => (typeof NN !== 'undefined' && NN.t ? NN.t(x) : x);
    const phu = document.getElementById('kq-phu'); if (phu) phu.textContent = dich('PUSH') + (k.ly ? ' · ' + dich(k.ly) : '');
    const so = document.getElementById('kq-so'), chu = 'YOU · RIVAL <b>' + k.pu.a + '% · ' + k.pu.b + '%</b>'; // 1 dòng số (2 khối <b> làm màn dài, che hàng thưởng cúp)
    if (so) { so.innerHTML = chu; setTimeout(() => { if (G.ketThuc === k && !kq.hidden) so.innerHTML = chu; }, 800); }
    const o = kq.querySelectorAll('#kq-chi .kq-hang .kq-o'); // 3 ô của màn PVP: BOSSES · BEST PVP · LIVES → thời gian · sát thương đã đẩy
    if (o[0]) o[0].innerHTML = '<small>TIME</small><b>' + DDUI.gio(k.pu.t) + '</b>';
    if (o[1]) o[1].innerHTML = '<small>YOUR PUSH</small><b>' + CDUI.so(k.pu.st) + '</b>';
    const lai = kq.querySelector('[data-act="choilai"]'); if (lai) lai.textContent = 'PUSH AGAIN';
  },
};

(function () {
  if (typeof KT === 'undefined' || typeof TT === 'undefined' || typeof CD === 'undefined' || typeof DD === 'undefined' || typeof batDau !== 'function') return;
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return;
  TTC.tn.pu = { cap: PUC.cap, ten: 'PUSH' };

  const bd = batDau;
  batDau = function (che, deck, mv) {
    const c = PU.cho; PU.cho = null; PU.lap = false; G.pu = null;
    if (!c || che !== 'pvp') return bd.apply(this, arguments);
    G.pu = { t0: null, E: [], st: [0, 0], moc: [], tM: 0, sMin: 20, het: false, thang: false };
    const r = bd.call(this, che, deck, mv);
    try { G.cho = PUC.prep; } catch (e) { console.error('PU', e); G.pu = null; }
    return r;
  };
  const wm = wavMoi;
  wavMoi = function () {
    const d = G.pu; if (!d) return wm.apply(this, arguments);
    G.tWave = 0; G.laTrum = true;
    if (d.t0 == null) {
      d.t0 = G.t; G.wave = 1;
      const be = typeof trumBe === 'function' ? trumBe(10) : CD.dsTrum(), id = be[Math.floor(rngHat(((G.hat || 1) * 2246822519 + 77) | 0)() * be.length)]; // cùng 1 trùm cho 2 bên, theo hạt trận
      for (let pi = 0; pi < G.duong.length; pi++) {
        const E = sinhTrum(id, pi, 1);
        E.max = E.hp = PUC.H; E.d = Object.assign({}, E.d, { v: PUC.v, tim: 3 }); E.v0 = PUC.v; E.tim = 3; E.s = d.sMin; E.knT = PUC.knDau; [E.x, E.y, E.goc] = viTri(G.duong[pi], E.s);
        d.E[pi] = E;
      }
      try { SND.nhac(2); } catch (e) { }
    }
  };
  const cn = capNhat;
  capNhat = function (dt) { if (G.pu) { try { PU.buoc(dt || 1 / 60); } catch (e) { console.error('PU', e); } } return cn.apply(this, arguments); };
  const ct = coTrum; coTrum = function (w) { return G.pu ? false : ct.apply(this, arguments); };
  const kt0 = ketThuc;
  ketThuc = function (thang, ly) {
    const d = G.pu; if (!d || G.ketThuc || !G.ban.length) return kt0.apply(this, arguments);
    const a = PU.con(0), b = PU.con(1), t = Math.max(1, Math.round(d.t0 == null ? 0 : G.t - d.t0));
    G.wave = PUC.waveThuong; // Rương Trận / XP / điểm sự kiện của trận Đẩy Trùm tính như 1 trận tới wave cố định
    const x = kt0.apply(this, arguments);
    if (G.ketThuc) { G.ketThuc.wave = PUC.waveThuong; G.ketThuc.pu = { a, b, t, st: Math.round(d.st[0]) }; }
    return x;
  };
  if (typeof HT !== 'undefined' && HT.theoDoi) { const td = HT.theoDoi; HT.theoDoi = function () { if (G.pu) return; return td.apply(this, arguments); }; }
  if (typeof VT !== 'undefined' && VT.dsTrum) {
    const ds = VT.dsTrum; VT.dsTrum = function () { return G.pu ? [] : ds.apply(this, arguments); };
    if (VT.dung) { const dg = VT.dung; VT.dung = function () { if (!G.pu) return dg.apply(this, arguments); const b = this.CHU.boss; this.CHU.boss = 'PUSH · 3:00'; try { return dg.apply(this, arguments); } finally { this.CHU.boss = b; } }; }
  }
  const bocHud = () => {
    if (UI._puHud) return; UI._puHud = 1;
    const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { PUUI.chip(); } catch (e) { } return r; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bocHud, 18), { once: true }); else setTimeout(bocHud, 18);

  // màn kết quả: đi đường PVP thường (cúp + túi thắng ở chedo-dd.js, XP, nhiệm vụ PVP) — chỉ không ghi kỷ lục wave PVP
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq = UI.ketQua;
    UI.ketQua = function (k) {
      if (!G.pu) return kq.apply(this, arguments);
      const lb = typeof KQ !== 'undefined' ? KQ.luuBest : null; if (lb) KQ.luuBest = function () { };
      let x; try { x = kq.apply(this, arguments); } finally { if (lb) KQ.luuBest = lb; }
      try { PUUI.kq(k); PU.lap = true; } catch (e) { console.error('PU', e); }
      return x;
    };
  }
  document.addEventListener('click', (e) => { // PUSH AGAIN (pha capture, trước ui.js)
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"]'); if (!el || !G.pu || !PU.lap) return;
    PU.cho = PU.cauHinh(); UI.che = 'pvp'; if (typeof KQ !== 'undefined' && KQ.m) KQ.m.che = 'pvp';
  }, true);
  document.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest('[data-act="doibo"], [data-act="bo"]'); if (el) { PU.cho = null; PU.lap = false; } }, true);

  if (typeof HM !== 'undefined') {
    HM.CHE.pu = { ten: 'PUSH', ic: PUC.ICON, phu: () => 'Cups ' + CDUI.so(CUP.st().c), mo: '3 minutes vs an AI rival · push your boss back with damage' };
    const khoa = () => !TT.tnMo('pu');
    const cc = HM.chonChe;
    HM.chonChe = function (k) {
      if (k !== 'pu') return cc.apply(this, arguments);
      if (khoa()) { TTUI.toast(TT.tnChu('pu')); return; }
      this.che = 'pu'; UI.che = 'pvp'; this.luu(); try { SND.nut(); } catch (e) { } this.dong(); this.ve();
    };
    const ch = HM.choi;
    HM.choi = function () {
      if (this.che !== 'pu') return ch.apply(this, arguments);
      if (khoa()) { TTUI.toast(TT.tnChu('pu')); return; }
      if (UI.chon.length !== 5) { if (!this.el('chon').classList.contains('xem-dk') || this.bst) this.di('dk'); UI.nhac('Pick 5 turrets'); return; }
      UI.che = 'pvp'; this.luuBo(); PU.vao();
    };
    const ini = UI.init;
    UI.init = async function () {
      const r = await ini.apply(this, arguments);
      try { const l = JSON.parse(localStorage.getItem(HM.KEY) || 'null'); if (l && l.che === 'pu' && !khoa() && !G.debug.mode) { HM.che = 'pu'; UI.che = 'pvp'; HM.ve(); } } catch (e) { }
      return r;
    };
  }
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, {
    'PUSH': 'ĐẨY TRÙM', '# minutes vs an AI rival · push your boss back with damage': '# phút đấu đối thủ máy · dùng sát thương đẩy lùi trùm của bạn',
    'PUSH #:# · YOU #% · RIVAL #%': 'ĐẨY #:# · BẠN #% · ĐỊCH #%', 'YOU': 'BẠN', 'RIVAL': 'ĐỊCH', 'YOU · RIVAL': 'BẠN · ĐỊCH', '#.#% · #.#%': '#.#% · #.#%', 'YOUR PUSH': 'ĐÃ ĐẨY', 'PUSH AGAIN': 'ĐẨY LẠI', 'PUSH · #:#': 'ĐẨY TRÙM · #:#',
    'Time up — your boss is farther from the core': 'Hết giờ — trùm của bạn ở xa lõi hơn', 'Time up — the rival pushed harder': 'Hết giờ — đối thủ đẩy mạnh hơn',
  });
})();
