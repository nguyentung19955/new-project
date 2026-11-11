// ASTRAL ARSENAL — ĐỘT KÍCH (RAID, theo Destiny Child Defense War) — người dùng cho làm tiếp 12/11 00:58. Thiết kế: tuvan/che-do-dcdw/THIET-KE.md §2.2 + §7.
//  DCDW: 2 người co-op hạ 1 trùm chung; trùm đứng ở phía cửa và GỌI quái; vào tốn 20 token Raid (token từ thắng PVP / co-op ≥ wave 30); mở ở cấp tài khoản 6.
//  Game mình (dùng lại bàn + đường CO-OP — CHƯA dựng đường tách nhánh riêng):
//  · Bạn + đồng đội máy (bộ như CO-OP), cấp thẻ thật, 3 tim chung. TRÙM ĐỨNG YÊN ở cổng ra quái của làn bạn (không đi, không lọt), dùng chiêu của nó lên bàn bạn,
//    và GỌI quái theo chu kỳ tất định ở cả 2 làn (đợt sau đông hơn; máu quái theo "chặng" 20 s như wave thường — không đổi số máu quái có sẵn).
//  · THẮNG = trùm hết máu. THUA = hết 3 tim chung hoặc hết giờ RDC.gio. 10 bậc: máu trùm tăng dần, trùm xoay theo bậc (12 trùm sẵn có), bậc mở lần lượt.
//  · VÉ: token Raid — thắng PVP +5, CO-OP đạt wave ≥ 30 +10 (1 lần / trận), trần 100; vào Raid tốn 20 (trừ khi trận bắt đầu, thua không hoàn).
//  · THƯỞNG: lần đầu mỗi bậc (ghi cờ TRƯỚC khi phát) + thắng lại: vàng + ít thẻ Xanh. Không ghi kỷ lục wave / Rương Trận / nhiệm vụ theo wave.
//  · TẤT ĐỊNH: lịch gọi quái sinh bằng rngHat(hạt theo bậc) — không Math.random trong file này. Lưu: khoá con mới turret_kt.cd.rd { token, da, max }.
'use strict';

const RDC = {
  gio: 360, tim: 3, prep: 5, chang: 20, bac: 10, cap: 6,
  ve: 20, tran: 100, vePvp: 5, veCoop: 10, waveCoop: 30,
  // máu trùm theo bậc (số tuyệt đối — chỉnh bằng bot: tools/thap-bot-tran.js --che rd --bac N)
  hp: [0, 5000, 14000, 45000, 80000, 180000, 400000, 800000, 1250000, 1550000, 1800000],
  // đợt quái: mỗi RDC.dot giây 1 đợt ở MỖI làn; số con = n0 + ⌊đợt / 2⌋ (trần nMax)
  dot: 12, n0: 4, nMax: 12, cach: 0.9,
  knDau: 40, knNghi: 12,                                       // chiêu trùm: lần đầu sau 40 s, mỗi lần sau nghỉ thêm 12 s (trùm đứng đó cả trận — niệm dày như trùm wave thì bàn đầu trận bị phá sạch)
  dau(b) { return b <= 3 ? [{ vang: 500 + 500 * b }, { ruong: 'thuong', n: b === 3 ? 2 : 1 }].concat(b === 3 ? [{ ngoc: 30 }] : []) : b <= 5 ? [{ vang: 1000 * (b - 1) }, { ruong: 'vang' }].concat(b === 5 ? [{ ngoc: 50 }] : []) : b === 6 ? [{ vang: 5000 }, { ruong: 'hh', n: 1 }] : b === 7 ? [{ vang: 6000 }, { ngoc: 80 }, { ruong: 'hh', n: 1 }, { tt: 1 }] : b === 8 ? [{ vang: 8000 }, { ruong: 'hh', n: 2 }, { tt: 1 }] : b === 9 ? [{ vang: 10000 }, { ngoc: 100 }, { ruong: 'hh', n: 2 }, { tt: 2 }] : [{ vang: 15000 }, { ruong: 'hh', n: 3 }, { tt: 3 }]; },
  lai: (b) => [{ vang: 150 * b }, { the: { bac: 'xanh', n: 2 + Math.floor(b / 3) } }],
  ICON: 'ua_ic_trum', // icon tạm (biểu tượng trùm sẵn có) — CẦN ảnh riêng cho RAID
};

const RD = {
  cho: null, lap: 0,
  st() {
    const c = CD.st(); let s = c.rd;
    if (!s || typeof s !== 'object' || Array.isArray(s)) s = c.rd = {};
    s.token = Math.max(0, Math.min(RDC.tran, s.token | 0)); s.max = Math.max(0, Math.min(RDC.bac, s.max | 0)); if (!s.da || typeof s.da !== 'object') s.da = {};
    return s;
  },
  congVe(n) { const s = this.st(), t0 = s.token; s.token = Math.min(RDC.tran, s.token + n); KT.luu(); return s.token - t0; },
  bacMo() { return ADMIN.la() ? RDC.bac : Math.min(RDC.bac, this.st().max + 1); },
  trum(b) { const ds = CD.dsTrum(); return ds[(b - 1) % ds.length]; },
  cauHinh(b) { return { bac: b, trum: this.trum(b), hat: (KT.bam('rd:' + b) | 0) || 1 }; },
  vao(b) {
    if (typeof UI === 'undefined' || UI.chon.length !== 5) { try { UI.nhac('Pick 5 turrets'); } catch (e) { } return false; }
    if (!TT.tnMo('rd')) { TTUI.toast(TT.tnChu('rd')); return false; }
    if (!(b >= 1 && b <= this.bacMo())) return false;
    if (this.st().token < RDC.ve && !ADMIN.la()) { TTUI.toast('Not enough Raid tokens'); return false; }
    const c = this.cauHinh(b); this.cho = c; UI.che = 'coop';
    try { TTUI.dong(); } catch (e) { }
    UI.vao();
    if (this.cho === c) { this.cho = null; return false; }
    return true;
  },
  // mỗi bước (trước capNhat): chặng theo đồng hồ, gọi quái theo lịch, kiểm thắng / hết giờ
  buoc() {
    const d = G.rd; if (!d || d.t0 == null || G.ketThuc || !G.ban.length) return;
    const t = G.t - d.t0;
    G.wave = 1 + Math.floor(t / RDC.chang); G.tWave = 0; G.cho = 0;
    const E = d.E;
    if (E && E.chet) { d.thang = true; ketThuc(true, 'Raid boss defeated'); return; }
    if (t >= RDC.gio) { d.hetGio = true; ketThuc(false, 'Time up — the raid boss survived'); return; }
    if (E) { if (E.bao) d.bao = true; else if (d.bao) { d.bao = false; E.knT += RDC.knNghi; } }
    if (E) { E.s = d.s0; E.cham = 0; E.chan = 0; E.maxPct = Math.round(mauWave(G.wave) * 30 * (1 + G.wave / 35)); } // trùm đứng yên ở cổng · maxPct: sát thương theo % máu (Nemesis…) tính trên máu trùm CHUẨN của chặng — không thì 1 ụ %-máu hạ mọi bậc trong ~1 phút
    while (d.tKe <= t) {
      const k = d.n++, n = Math.min(RDC.nMax, RDC.n0 + Math.floor(k / 2));
      for (let pi = 0; pi < G.duong.length; pi++) for (let i = 0; i < n; i++) {
        const x = d.r(); let id = 'bo';
        if (k >= 1 && x < 0.2) id = 'bay'; else if (k >= 8 && x < 0.33) id = 'bay_bang'; else if (k >= 5 && x < 0.46) id = 'tach';
        if (k >= 3 && i % 6 === 5) id = 'khong_lo';
        G.hang.push({ t: G.t + 0.4 + i * RDC.cach, id, p: pi });
      }
      d.tKe += RDC.dot;
    }
  },
  conGio() { const d = G.rd; return !d ? 0 : d.t0 == null ? RDC.gio : Math.max(0, RDC.gio - (G.t - d.t0)); },
  // hết trận: thắng → thưởng lần đầu (cờ trước) hoặc thưởng lặp lại → { moi, ra }
  ket(c, thang) {
    const s = this.st(), ra = { vang: 0, ngoc: 0, the: [], tt: 0 }; let moi = false;
    if (thang) {
      if (!s.da[c.bac]) { s.da[c.bac] = 1; moi = true; CD.gop(ra, CD.phat(RDC.dau(c.bac), 'cdrd' + c.bac, 'raid')); }
      else CD.gop(ra, CD.phat(RDC.lai(c.bac), 'cdrdl' + c.bac + ':' + (s.lan = (s.lan | 0) + 1), 'raid'));
      s.max = Math.max(s.max, c.bac);
    }
    KT.luu();
    return { moi, ra };
  },
};

const RDUI = {
  chon: 0,
  gio: (s) => DDUI.gio(s),
  mo() {
    const s = RD.st(), bm = RD.bacMo(); let b = this.chon; if (!(b >= 1 && b <= bm)) b = bm; this.chon = b;
    const c = RD.cauHinh(b), da = !!s.da[b], du = s.token >= RDC.ve || ADMIN.la();
    let h = CDUI.dau(RDC.ICON, 'RAID', 'TOKENS ' + s.token + ' / ' + RDC.tran + ' · ENTRY ' + RDC.ve);
    h += '<div class="cd-tuan"><img src="assets/trum_' + c.trum + '_portrait.png" alt="" draggable="false"><span><small>RAID BOSS · TIER ' + b + '</small><b>' + CDUI.esc(CD.tenTrum(c.trum)) + '</b><em><i>HP ' + CDUI.so(RDC.hp[b]) + '</i></em></span></div>';
    h += '<div class="cd-bac">' + Array.from({ length: RDC.bac }, (_, i) => i + 1).map(x => '<button class="cd-bp' + (x === b ? ' on' : '') + (s.da[x] ? ' xong' : '') + '" data-act="rd-bac" data-id="' + x + '"' + (x <= bm ? '' : ' disabled') + '>' + x + '</button>').join('') + '</div>';
    h += '<div class="cd-ct"><div class="cd-so"><span><small>TIME</small><b>' + this.gio(RDC.gio) + '</b></span><span><small>LIVES</small><b>' + RDC.tim + '</b></span><span><small>BEST TIER</small><b>' + (s.max || '—') + '</b></span></div>' +
      '<p class="kt-chu cd-luat">You and an AI ally fight one boss. It stands at the gate, uses its skill and keeps calling enemies. Destroy it before time runs out. Tokens: PVP win +' + RDC.vePvp + ', CO-OP wave ' + RDC.waveCoop + ' +' + RDC.veCoop + '.</p>' +
      '<small class="cd-nh">' + (da ? 'REPEAT REWARD' : 'FIRST CLEAR REWARD') + '</small>' + CDUI.dsThuong(da ? RDC.lai(b) : RDC.dau(b)) + '</div>';
    CDUI.phu(h + CDUI.nut('<button class="hm-nut2 vang" data-act="rd-vao" data-id="' + b + '"' + (du ? '' : ' disabled') + '><b>' + (du ? 'START · ' + RDC.ve + ' TOKENS' : 'NEED ' + RDC.ve + ' TOKENS') + '</b></button>'), 'cd-san rd-p');
  },
  // nhãn nhỏ dưới thanh trên: bậc + đồng hồ (máu trùm: thanh trùm sẵn có của HUD)
  chip() {
    const d = G.rd; let e = document.getElementById('rd-chip');
    if (!d || !G.ban.length || G.ketThuc) { if (e && !e.hidden) e.hidden = true; return; }
    const wr = document.getElementById('wrap'); if (!e && wr) { e = document.createElement('div'); e.id = 'rd-chip'; e.className = 'cd-chip'; wr.appendChild(e); }
    if (!e) return;
    const con = RD.conGio(), E = d.E, t = 'RAID ' + d.bac + ' · ' + this.gio(con) + (E && !E.chet ? ' · ' + Math.max(1, Math.ceil(E.hp / E.max * 100)) + '%' : '');
    if (e._t !== t) { e._t = t; e.textContent = t; }
    e.classList.toggle('gap', con <= 30);
    if (e.hidden) e.hidden = false;
  },
  kq(k, c) {
    const kq = document.getElementById('ketqua'), chi = document.getElementById('kq-chi'); if (!kq || !chi || !k.rd) return;
    const r = RD.ket(c, !!k.thang), tim = G.ban[0] ? Math.max(0, G.ban[0].tim | 0) : 0, dich = (x) => (typeof NN !== 'undefined' && NN.t ? NN.t(x) : x);
    const phu = document.getElementById('kq-phu'); if (phu) phu.textContent = dich('RAID · TIER ' + c.bac) + ' · ' + CD.tenTrum(c.trum) + (!k.thang && k.ly ? ' · ' + dich(k.ly) : '');
    const so = document.getElementById('kq-so'), chu = k.thang ? 'CLEARED IN <b>' + this.gio(k.rd.t) + '</b>' : 'BOSS HP LEFT <b>' + k.rd.pct + '%</b>';
    if (so) { so.innerHTML = chu; setTimeout(() => { if (G.ketThuc === k && !kq.hidden) so.innerHTML = chu; }, 800); }
    const o = (nhan, v) => '<div class="kq-o"><small>' + nhan + '</small><b>' + v + '</b></div>';
    let th;
    if (k.thang && CDDUI.coThuong(r.ra)) th = '<small>' + (r.moi ? 'FIRST CLEAR REWARDS' : 'REWARDS') + '</small>' + DDUI.thuongGon(r.ra);
    else th = '<small>NO REWARD · TOKENS LEFT ' + RD.st().token + '</small>';
    chi.innerHTML = '<div class="kq-hang">' + o('TIER', c.bac) + o('TOKENS', RD.st().token) + o('LIVES', tim + '/' + RDC.tim) + '</div><div class="tb-kq cd-kq dd-xd">' + th + '</div>';
    try { OT.quet(chi); } catch (e) { }
    RD.lap = k.thang && c.bac < RDC.bac ? c.bac + 1 : c.bac;
    const lai = kq.querySelector('[data-act="choilai"]'); if (lai) lai.textContent = RD.st().token >= RDC.ve || ADMIN.la() ? (RD.lap > c.bac ? 'NEXT TIER · ' : 'RAID AGAIN · ') + RDC.ve + ' TOKENS' : 'NEED ' + RDC.ve + ' TOKENS';
  },
};

(function () {
  if (typeof KT === 'undefined' || typeof TT === 'undefined' || typeof CD === 'undefined' || typeof DD === 'undefined' || typeof batDau !== 'function') return;
  if (typeof UP_XEM !== 'undefined' && UP_XEM) return;
  if (!KT.NGUON.includes('raid')) KT.NGUON.splice(KT.NGUON.length - 1, 0, 'raid');
  try { RD.st(); } catch (e) { console.error('RD', e); }
  TTC.tn.rd = { cap: RDC.cap, ten: 'RAID' };

  const bd = batDau;
  batDau = function (che, deck, mv) {
    const c = RD.cho; RD.cho = null; RD.lap = 0; G.rd = null;
    if (!c || che !== 'coop') return bd.apply(this, arguments);
    G.rd = Object.assign({}, c, { t0: null, tKe: 2, n: 0, E: null, s0: 0, r: rngHat((c.hat * 2654435761 + 53) | 0) });
    const r = bd.call(this, che, deck, mv);
    try {
      G.cho = RDC.prep; G.ban[0].tim = RDC.tim;
      const s = RD.st(); if (!ADMIN.la() && !(G.debug && G.debug.auto)) { s.token = Math.max(0, s.token - RDC.ve); KT.luu(); } // vé trừ lúc trận bắt đầu
    } catch (e) { console.error('RD', e); G.rd = null; }
    return r;
  };
  const wm = wavMoi;
  wavMoi = function () {
    const d = G.rd; if (!d) return wm.apply(this, arguments);
    G.tWave = 0; G.laTrum = true;
    if (d.t0 == null) {
      d.t0 = G.t; G.wave = 1;
      const E = sinhTrum(d.trum, 0, 1); // trùm đứng ở cổng ra quái của làn bạn
      E.max = E.hp = RDC.hp[d.bac]; E.d = Object.assign({}, E.d, { v: 0, tim: 0 }); E.v0 = 0; E.tim = 0; E.s = d.s0 = 26; [E.x, E.y, E.goc] = viTri(G.duong[E.p], E.s);
      E.knT = RDC.knDau; d.E = E;
      try { SND.nhac(2); } catch (e) { }
    }
  };
  const cn = capNhat;
  capNhat = function () { if (G.rd) { try { RD.buoc(); } catch (e) { console.error('RD', e); } } return cn.apply(this, arguments); };
  const ct = coTrum; coTrum = function (w) { return G.rd ? false : ct.apply(this, arguments); };
  const tcw = trumCuaWave; trumCuaWave = function (w, p) { return G.rd ? G.rd.trum : tcw.apply(this, arguments); };
  const kt0 = ketThuc;
  ketThuc = function (thang, ly) {
    const d = G.rd; if (!d || G.ketThuc || !G.ban.length) return kt0.apply(this, arguments);
    const x = kt0.call(this, !!d.thang, d.thang ? 'Raid boss defeated' : d.hetGio ? 'Time up — the raid boss survived' : ly);
    if (G.ketThuc) G.ketThuc.rd = { t: Math.max(1, Math.round(d.t0 == null ? 0 : G.t - d.t0)), pct: d.E ? Math.max(0, Math.ceil(d.E.hp / d.E.max * 100)) : 100, st: d.E ? Math.round(d.E.max - Math.max(0, d.E.hp)) : 0 };
    return x;
  };
  if (typeof HT !== 'undefined' && HT.theoDoi) { const td = HT.theoDoi; HT.theoDoi = function () { if (G.rd) return; return td.apply(this, arguments); }; }
  if (typeof VT !== 'undefined' && VT.dsTrum) {
    const ds = VT.dsTrum; VT.dsTrum = function () { return G.rd ? [1] : ds.apply(this, arguments); };
    if (VT.dung) { const dg = VT.dung; VT.dung = function () { if (!G.rd) return dg.apply(this, arguments); const b = this.CHU.boss; this.CHU.boss = 'RAID · TIER ' + G.rd.bac; try { return dg.apply(this, arguments); } finally { this.CHU.boss = b; } }; }
  }
  const bocHud = () => {
    if (UI._rdHud) return; UI._rdHud = 1;
    const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { RDUI.chip(); } catch (e) { } return r; };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bocHud, 14), { once: true }); else setTimeout(bocHud, 14);

  // ---- màn kết quả + token từ PVP / CO-OP ----
  if (typeof UI !== 'undefined' && UI.ketQua) {
    const kq = UI.ketQua;
    UI.ketQua = function (k) {
      const c = G.rd;
      if (!c) {
        const x = kq.apply(this, arguments);
        try { // token Raid: thắng PVP +5 · CO-OP (không phải Đường Đua / hướng dẫn / trận thử) đạt wave ≥ 30: +10
          const tut = typeof KQ !== 'undefined' && KQ.m && KQ.m.tut, thu = G.debug && (G.debug.mana || G.debug.wave || G.debug.fill);
          if (!tut && !thu && !G.dd && G.ban.length && k) {
            const n = G.che === 'pvp' && k.thang ? RDC.vePvp : G.che === 'coop' && (k.wave | 0) >= RDC.waveCoop ? RDC.veCoop : 0, co = n ? RD.congVe(n) : 0;
            const chi = document.getElementById('kq-chi'); if (co && chi) chi.insertAdjacentHTML('beforeend', '<div class="tb-kq cd-kq"><small>RAID TOKENS +' + co + ' · ' + RD.st().token + '/' + RDC.tran + '</small></div>');
          }
        } catch (e) { console.error('RD', e); }
        return x;
      }
      const dw = G.debug.wave, lb = typeof KQ !== 'undefined' ? KQ.luuBest : null;
      G.debug.wave = -1; if (lb) KQ.luuBest = function () { };
      let x;
      try { x = kq.apply(this, arguments); } finally { G.debug.wave = dw; if (lb) KQ.luuBest = lb; if (!dw) delete G.debug.wave; }
      try { RDUI.kq(k, c); } catch (e) { console.error('RD', e); }
      return x;
    };
  }
  document.addEventListener('click', (e) => { // RAID AGAIN / NEXT TIER (pha capture, trước ui.js)
    const el = e.target.closest && e.target.closest('#ketqua [data-act="choilai"]'); if (!el || !G.rd || !RD.lap) return;
    if (RD.st().token < RDC.ve && !ADMIN.la()) { e.stopImmediatePropagation(); e.preventDefault(); TTUI.toast('Not enough Raid tokens'); return; }
    RD.cho = RD.cauHinh(RD.lap); UI.che = 'coop'; if (typeof KQ !== 'undefined' && KQ.m) KQ.m.che = 'coop';
  }, true);
  document.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest('[data-act="doibo"], [data-act="bo"]'); if (el) { RD.cho = null; RD.lap = 0; } }, true);

  // ---- HOME: mục RAID trong GAME MODE ----
  if (typeof HM !== 'undefined') {
    HM.CHE.rd = { ten: 'RAID', ic: RDC.ICON, phu: () => 'Tokens ' + RD.st().token + '/' + RDC.tran, get mo() { return 'Boss fight with an AI ally · tokens ' + RD.st().token + '/' + RDC.tran; } };
    const khoa = () => !TT.tnMo('rd');
    const cc = HM.chonChe;
    HM.chonChe = function (k) {
      if (k !== 'rd') return cc.apply(this, arguments);
      if (khoa()) { TTUI.toast(TT.tnChu('rd')); return; }
      this.che = 'rd'; UI.che = 'coop'; this.luu(); try { SND.nut(); } catch (e) { } this.dong(); this.ve();
    };
    const ch = HM.choi;
    HM.choi = function () {
      if (this.che !== 'rd') return ch.apply(this, arguments);
      if (khoa()) { TTUI.toast(TT.tnChu('rd')); return; }
      if (UI.chon.length !== 5) { if (!this.el('chon').classList.contains('xem-dk') || this.bst) this.di('dk'); UI.nhac('Pick 5 turrets'); return; }
      UI.che = 'coop'; this.luuBo(); try { SND.nut(); } catch (e) { }
      RDUI.mo();
    };
    const ini = UI.init;
    UI.init = async function () {
      const r = await ini.apply(this, arguments);
      try { const l = JSON.parse(localStorage.getItem(HM.KEY) || 'null'); if (l && l.che === 'rd' && !khoa() && !G.debug.mode) { HM.che = 'rd'; UI.che = 'coop'; HM.ve(); } } catch (e) { }
      return r;
    };
  }
  // ---- gộp hồ sơ Firebase: bậc cao nhất + cờ OR; token lấy lớn nhất ----
  const gp = KT.gop;
  KT.gop = function (o) {
    let a = null; const b = o && o.kt && o.kt.cd && o.kt.cd.rd;
    try { a = JSON.parse(JSON.stringify(RD.st())); } catch (e) { }
    const x = gp.apply(this, arguments);
    try { const s = RD.st(); for (const y of [a, b]) if (y && typeof y === 'object') { s.max = Math.max(s.max, Math.min(RDC.bac, y.max | 0)); s.token = Math.max(s.token, Math.min(RDC.tran, y.token | 0)); s.lan = Math.max(s.lan | 0, y.lan | 0); for (const i in (y.da || {})) if (y.da[i]) s.da[i] = 1; } KT.luu(true); } catch (e) { console.error('RD', e); }
    return x;
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act^="rd-"]'); if (!b || b.disabled) return;
    e.stopPropagation(); try { SND.nut(); } catch (er) { }
    if (b.dataset.act === 'rd-bac') { RDUI.chon = +b.dataset.id; RDUI.mo(); }
    else if (b.dataset.act === 'rd-vao') RD.vao(+b.dataset.id);
  });
  if (typeof VI_MAU !== 'undefined') Object.assign(VI_MAU, {
    'RAID': 'ĐỘT KÍCH', 'TOKENS # / # · ENTRY #': 'VÉ # / # · VÀO TỐN #', 'RAID BOSS · TIER #': 'TRÙM ĐỘT KÍCH · BẬC #', 'BEST TIER': 'BẬC CAO NHẤT', 'REPEAT REWARD': 'THƯỞNG LẶP LẠI', 'TOKENS': 'VÉ',
    'You and an AI ally fight one boss. It stands at the gate, uses its skill and keeps calling enemies. Destroy it before time runs out. Tokens: PVP win +#, CO-OP wave # +#.': 'Bạn và đồng đội máy đánh một trùm. Trùm đứng ở cổng, dùng chiêu và liên tục gọi quái. Hạ nó trước khi hết giờ. Vé: thắng PVP +#, CO-OP wave # +#.',
    'START · # TOKENS': 'BẮT ĐẦU · # VÉ', 'NEED # TOKENS': 'CẦN # VÉ', 'Not enough Raid tokens': 'Không đủ vé Đột Kích', 'RAID # · #:#': 'ĐỘT KÍCH # · #:#', 'RAID # · #:# · #%': 'ĐỘT KÍCH # · #:# · #%',
    'Raid boss defeated': 'Đã hạ trùm Đột Kích', 'Time up — the raid boss survived': 'Hết giờ — trùm Đột Kích còn sống', 'RAID · TIER #': 'ĐỘT KÍCH · BẬC #', 'CLEARED IN': 'HẠ TRONG', 'BOSS HP LEFT': 'MÁU TRÙM CÒN',
    'NO REWARD · TOKENS LEFT #': 'KHÔNG THƯỞNG · CÒN # VÉ', 'NEXT TIER · # TOKENS': 'BẬC KẾ · # VÉ', 'RAID AGAIN · # TOKENS': 'ĐỘT KÍCH LẠI · # VÉ', 'RAID TOKENS +# · #/#': 'VÉ ĐỘT KÍCH +# · #/#',
    'Tokens #/#': 'Vé #/#', 'Boss fight with an AI ally · tokens #/#': 'Đánh trùm cùng đồng đội máy · vé #/#', 'HP #,#': 'MÁU #.#', 'HP #,#,#': 'MÁU #.#.#',
  });
})();
