// TURRET MERGE — 6 TRÙM MỚI (thiết kế: docs/demo-hop-tuong/TRUM-MOI.md · nghiên cứu: TRUM-DCDW.md)
//  · Cắm vào bể trùm (TRUM_POOL) mà lịch trùm game.js (lichTrum) bốc ngẫu nhiên — SOLO/PVP theo tuWave, CO-OP từ wave 60.
//  · Chiêu: bọc capNhatTrum / sinhTrum / trung / chet / capNhatU / hopLeGhep — 6 trùm cũ chạy y như trước.
//  · Hình: CHỈ ảnh ChatGPT. Chưa có ảnh riêng → mượn dải của 1 trùm cũ (anhTam); có ảnh → thêm id vào TRUM_ANH.
//    Hướng nhìn trước/ngang/sau: dùng hệ hướng nhìn của quaianim.js (session "enemy facing") khi có, tên ảnh
//    trum_<id>_8 / trum_<id>_side_8 / trum_<id>_back_8; hiệu ứng chiêu fx_trum_<id> (dải 16 khung) khi có.
//  · Gỡ lỗi: ?trum=<id> → mọi wave trùm là trùm đó + trùm ra ngay 2 s sau khi vào trận (kèm &wave=N).
'use strict';

const TRUM_MOI = {
  hive:      { ten: 'HIVE MOTHER',   kn: 'SWARM',        mo: 'Launches 4 drones ahead of itself (6 from wave 40)',            nguy: 'Launches drone swarms',            mau: '#ffb648', tuWave: 10, hp: 0.85, v: 13, anhTam: 'mad_crown' },
  jammer:    { ten: 'STATIC JAMMER', kn: 'JAM',          mo: 'Jams 2 turrets (supports first): no fire, no merge, no aura 6 s', nguy: 'Jams 2 turrets — supports first', mau: '#b77dff', tuWave: 20, hp: 0.9, v: 15, anhTam: 'freezer' },
  prism:     { ten: 'PRISM WARDEN',  kn: 'PRISM SHIELD', mo: '−90% damage until hit by 3 different turret types (4 from wave 40); re-shields ~8 s after breaking', nguy: 'Shield breaks to 3–4 turret types', mau: '#7ff0ff', tuWave: 20, hp: 1.15, v: 13, anhTam: 'janus' },
  twin_core: { ten: 'TWIN CORE',     kn: 'SPLIT',        mo: 'Splits into 2 fast cores when destroyed',      nguy: 'Splits in two when destroyed',     mau: '#ff4b5a', tuWave: 30, hp: 0.7, v: 15, anhTam: 'joker_king' },
  patcher:   { ten: 'PATCH TITAN',   kn: 'REPAIR',       mo: 'Heals itself 12% and every enemy in its lane 35%', nguy: 'Repairs itself and every enemy',  mau: '#5dff8a', tuWave: 30, hp: 0.85, v: 12, anhTam: 'octopus' },
  leech:     { ten: 'STAR LEECH',    kn: 'STAR THEFT',   mo: 'Steals 1★ from your top turret (2★+), then dashes. Kill it: the stolen stars return to random turrets', nguy: 'Steals stars — kill it to get them back', mau: '#ffd84a', tuWave: 40, hp: 0.8, v: 16, anhTam: 'nightmare' },
};
// trùm mới ĐÃ có ảnh ChatGPT riêng (trum_<id>_8.png…) — thêm id khi ảnh ráp xong
// ↓ 5 dòng dưới do tools/thap-cat-p6-trum.py tự ghi theo ảnh có trong assets/ (đừng sửa tay)
const TRUM_ANH = new Set(['hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech']); // trum_<id>_8.png (đi trước) — bỏ ảnh mượn
const TRUM_HUONG = new Set([]); // 'id_side' / 'id_back' — dải hướng nhìn ngang/sau
const TRUM_FX = new Set(['jammer', 'prism', 'patcher', 'leech']); // fx_trum_<id>.png — dải hiệu ứng chiêu 16 khung
const TRUM_ATK = new Set(['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech']); // trum_<id>_atk_16.png — dải ĐÁNH 8 khung, ô ×ATK_K (thân trùm tung chiêu, nhìn về bàn; ảnh 07/11 tools/thap-cat-trum2.py) — quaianim.js phát lúc báo chiêu
const TRUM_CHANDUNG = new Set(['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech']); // trum_<id>_portrait.png — băng giới thiệu / màn mở trận dùng chân dung
const TRUM_CU_WAVE = 10; // 6 trùm cũ: có từ wave 10
for (const id in TRUM_MOI) { const M = TRUM_MOI[id]; TRUM[id] = { ten: M.ten, kn: M.kn, mo: M.mo, mau: M.mau, moi: true }; }
// bể trùm cho lịch ngẫu nhiên (game.js lichTrum): 6 cũ + 6 mới; TRUM_THU_TU (thứ tự CO-OP cố định) giữ nguyên
const TRUM_POOL = TRUM_THU_TU.concat(Object.keys(TRUM_MOI));
function trumTuWave(id) { return TRUM_MOI[id] ? TRUM_MOI[id].tuWave : TRUM_CU_WAVE; }
let TRUM_DBG = (() => { try { const q = new URLSearchParams(location.search).get('trum'); return q && TRUM[q] ? q : null; } catch (e) { return null; } })();

const TRM = {
  SO_DRONE: 4, JAM_S: 6, JAM_N: 2, PRISM_GIAM: 0.1, PRISM_BE: 7, CON_HP: 0.35, CON_V: 22, CON_CO: 0.72,
  HOI_TRUM: 0.12, HOI_QUAI: 0.35, HOI_TRUM_KHAC: 0.06, DASH_S: 2, DASH_X: 2.4,
  hsPhu: 1, // hệ số máu quái do trùm gọi ra (chỉ sim chỉnh)
  prismCan: (w) => (w >= 40 ? 4 : 3),
  // hiệu ứng chiêu: ảnh ChatGPT riêng fx_trum_<id> nếu đã có, không thì ảnh FX có sẵn
  fx(id, ten, x, y, co, song) { FX.no(TRUM_FX.has(id) ? 'trum_' + id : ten, x, y, co, Math.max(song || 0, TRUM_FX.has(id) ? 0.6 : 0)); },
  chu(x, y, s, mau, co) { FX.chu1(x, y, s, mau, co || 13, 'to'); },
};

// ---------- vòng chiêu của 6 trùm mới ----------
const TRUM_KN = {
  hive: {
    chon: () => [],
    lam(E) {
      const p = G.duong[E.p], hs = 1.3 * TRM.hsPhu, n = TRM.SO_DRONE + (G.wave >= 40 ? 2 : 0);
      for (let i = 0; i < n; i++) { const q = sinhQuai('bay', E.p, Math.min(p.len - 5, E.s + 30 + i * 14), hs); q.vao = 0.3; }
      TRM.fx('hive', 'no_phao', E.x, E.y + 10, 110, 0.5); FX.bui(E.x, E.y, 10, 18);
      TRM.chu(E.x, E.y - 40, 'SWARM ×' + n, TRUM_MOI.hive.mau, 14);
    },
  },
  jammer: {
    chon(E, B, ds) {
      const r = rngTrum(E); // tất định (online lockstep) — game.js
      ds = ds.filter(T => !biKhoa(T)); // ụ khoá (băng) không nhận Câm mới — rà cộng hưởng 07/11, người dùng chốt
      const ht = tronTrum(ds.filter(T => SKILLS[T.id] && SKILLS[T.id].vai === 'ht' && !(T.st.cam > 0)), r);
      const khac = tronTrum(ds.filter(T => !ht.includes(T) && !(T.st.cam > 0)), r); // phần còn lại: ngẫu nhiên đều (bỏ ưu tiên sao cao — 08/11); ưu tiên Hỗ trợ giữ (bản sắc trùm)
      return ht.concat(khac).slice(0, TRM.JAM_N);
    },
    lam(E, B, muc) {
      for (const T of muc) {
        const c = B.o[T.o]; G.hu.push({ k: 'chieuTrum', t: 0, song: 0.45, x0: E.x, y0: E.y, x1: c.x, y1: c.y, mau: TRUM_MOI.jammer.mau });
        T.st.kep = Math.max(T.st.kep || 0, TRM.JAM_S); T.st.cam = TRM.JAM_S; // xích có sẵn (vong_xich) + cờ câm → xoá debuff gỡ được
        TRM.fx('jammer', 'set_nho', c.x, c.y, 80, 0.45); TRM.chu(c.x, c.y - 22, 'JAMMED', TRUM_MOI.jammer.mau, 12);
      }
    },
  },
  prism: {
    chon: (E) => (E.khien && !E.khien.on && E.khien.be <= 0 ? [] : null), // chỉ niệm khi khiên đã vỡ xong → dựng lại
    lam(E) {
      E.khien.on = true; E.khien.ds.clear(); E.khien.can = TRM.prismCan(G.wave); E.giapT = 0.5;
      FX.no('bang_vo', E.x, E.y, 120, 0.5); TRM.chu(E.x, E.y - 46, 'SHIELD UP', TRUM_MOI.prism.mau, 14);
    },
    tick(E, dt) {
      const K = E.khien; if (!K) return;
      if (K.on) E.giapT = 0.5; else { K.be -= dt; E.giapT = 0; }
    },
  },
  twin_core: { chon: () => null },
  patcher: {
    chon: () => [],
    lam(E) {
      const hoi = (Q, k) => { if (Q.chet) return; const h = Math.round(Q.max * k); Q.hp = Math.min(Q.max, Q.hp + h); TRM.fx('patcher', 'khoisinh_no', Q.x, Q.y, Q.d.co * 1.2, 0.4); };
      hoi(E, TRM.HOI_TRUM); TRM.chu(E.x, E.y - 46, '+' + Math.round(TRM.HOI_TRUM * 100) + '% REPAIR', TRUM_MOI.patcher.mau, 14);
      for (const Q of G.quai) if (Q !== E && !Q.chet && Q.p === E.p) hoi(Q, Q.trum ? TRM.HOI_TRUM_KHAC : TRM.HOI_QUAI);
    },
  },
  leech: {
    chon(E, B, ds) { const c = tronTrum(ds.filter(T => T.sao >= 2), rngTrum(E)).sort((a, b) => b.sao - a.sao); return c.length ? [c[0]] : null; },
    lam(E, B, muc) {
      for (const T of muc) {
        if (T.sao < 2) continue; // QA ngâm: 2 Star Leech (PVP đột tử) cùng nhắm 1 ụ 2★ → con thứ 2 hút về 0★ — báo chiêu lúc ≥2★, tung chiêu thì kiểm lại
        const c = B.o[T.o]; G.hu.push({ k: 'tiaTia', t: 0, song: 0.3, x0: c.x, y0: c.y, x1: E.x, y1: E.y, mau: TRUM_MOI.leech.mau });
        T.sao--; T.sang = 1; E.kho++;
        FX.no('hasao_trung', c.x, c.y, 80, 0.45); TRM.chu(c.x, c.y - 20, '−1★ STOLEN', '#ff4b3e', 14);
      }
      TRM.fx('leech', 'hasao_trung', E.x, E.y, 110, 0.6); // fx_trum_leech: sao bị hút vào thân + lao (bám theo trùm)
      E.dashT = TRM.DASH_S; TRM.chu(E.x, E.y - 46, 'DASH!', TRUM_MOI.leech.mau, 15);
    },
    tick(E, dt) {
      if (E.dashT > 0) { E.dashT -= dt; E.d.v = E.v0 * TRM.DASH_X; E.cham = 0; E.chan = 0; if (Math.random() < dt * 25) FX.khoi(E.x, E.y + 10, 14); }
      else E.d.v = E.v0;
    },
  },
};
(() => { // bọc hàm game.js (tên biến cục bộ — không đụng biến toàn cục của file khác)
// ---------- sinh trùm: chỉ số riêng ----------
const _sinhTrumGoc = sinhTrum;
sinhTrum = function (id, pi, hs, con) {
  const E = _sinhTrumGoc(id, pi, hs);
  const M = TRUM_MOI[id]; if (!M) return E;
  E.max = E.hp = Math.round(E.max * M.hp); E.d.v = E.v0 = M.v;
  if (!TRUM_ANH.has(id)) E.d.anh = M.anhTam; // cỡ vẽ (K8) theo ảnh đang mượn
  if (id === 'prism') { E.khien = { on: true, ds: new Set(), can: TRM.prismCan(G.wave), be: 0 }; E.giapT = 0.5; }
  if (id === 'leech') { E.kho = 0; E.dashT = 0; }
  return E;
};
// lõi con của TWIN CORE (không tách tiếp, không chiêu, không băng giới thiệu)
function sinhLoiCon(P, lech) {
  const cb = UI.canhBaoTrum; UI.canhBaoTrum = () => {};
  let E; try { E = _sinhTrumGoc('twin_core', P.p, 1); } finally { UI.canhBaoTrum = cb; }
  E.max = E.hp = Math.max(1, Math.round(P.max * TRM.CON_HP)); E.d.v = E.v0 = TRM.CON_V; E.d.co = Math.round(P.d.co * TRM.CON_CO);
  E.d.anh = P.d.anh; E.tim = 1; E.d.tim = 1; E.con = true; E.vao = 1; E.knT = 1e9;
  const p = G.duong[P.p]; E.s = clamp(P.s + lech, 0, p.len - 1); [E.x, E.y, E.goc] = viTri(p, E.s);
  return E;
}

const _capNhatTrumGoc = capNhatTrum;
capNhatTrum = function (E, dt) {
  const K = TRUM_KN[E.trum]; if (!K) return _capNhatTrumGoc(E, dt);
  if (E.con) return;
  const B = G.ban[E.ban];
  if (K.tick) K.tick(E, dt);
  if (E.bao) {
    E.bao.t += dt;
    if (E.bao.t >= E.bao.song) {
      const muc = B.t.filter(T => T && E.bao.muc.includes(T.uid)); for (const T of muc) T.st.ngam = 0;
      E.bao = null; E.knT = Math.max(6, 10 - G.wave / 15);
      SND.chieuTrum(E.trum);
      if (E.bao0) { // chiêu nhắm ụ → khiên Ma vương / Máy Khiên chặn như 6 trùm cũ
        if (B.khien > 0) { for (const T of muc) { const c = B.o[T.o]; VX.chanKhien(B, T); FX.chu1(c.x, c.y - 18, TEXT.fx.blocked, '#73A9FF', 11); } return; }
        G._trumDang = true; // chiêu TRÙM (như thucHienChieu): Mirror Gate chặn, không PHẢN sang đối thủ
        try { for (let i = muc.length - 1; i >= 0; i--) if (chanKhien(B, muc[i])) muc.splice(i, 1); } finally { G._trumDang = false; }
        if (!muc.length) return;
      }
      K.lam && K.lam(E, B, muc);
    }
    return;
  }
  E.knT -= dt;
  if (E.knT > 0) return;
  const ds = B.t.filter(T => T && !T.st.da);
  const muc = K.chon ? K.chon(E, B, ds) : null;
  if (!muc) { E.knT = 2; return; }
  E.bao0 = muc.length > 0;
  E.bao = { t: 0, song: 1.4, muc: muc.map(T => T.uid) };
  for (const T of muc) T.st.ngam = 1.4;
  FX.chu1(E.x, E.y - 52, TRUM[E.trum].kn + '!', TRUM[E.trum].mau, 18, 'to');
  SND.bao();
};

// ---------- PRISM WARDEN: khiên giảm sát thương tới khi đủ N loại ụ ----------
const _trungGoc = trung;
trung = function (E, dmg, o) {
  const K = E && E.khien;
  if (K && K.on && !E.chet) {
    o = o || {};
    const T = o.T !== undefined ? o.T : G.dangBan;
    if (T && T.id && !o.phu && !K.ds.has(T.id)) {
      K.ds.add(T.id);
      if (K.ds.size >= K.can) {
        K.on = false; K.be = TRM.PRISM_BE; E.giapT = 0; E.knT = TRM.PRISM_BE;
        TRM.fx('prism', 'bang_vo', E.x, E.y, 130, 0.5); TRM.chu(E.x, E.y - 46, 'SHIELD BROKEN', '#ffffff', 15); FX.lac(5);
      } else TRM.chu(E.x, E.y - 40, 'PRISM ' + K.ds.size + '/' + K.can, TRUM_MOI.prism.mau, 12);
    }
    if (K.on) dmg *= TRM.PRISM_GIAM / 0.75; // giapT (ảnh khiên vàng) nhân thêm 0,75 trong trung → bù để tổng = −90%
  }
  return _trungGoc(E, dmg, o);
};

// ---------- chết: TWIN CORE tách đôi, STAR LEECH trả sao ----------
const _chetGoc = chet;
chet = function (E, B) {
  if (E.chet) return;
  _chetGoc(E, B);
  if (E.trum === 'twin_core' && !E.con) {
    // chiêu TÁCH: thân lõi NỨT (trum_twin_core_atk_16, nhìn về bàn) phát tại chỗ chết, rồi 2 lõi con chạy ra
    if (typeof REN !== 'undefined' && REN.nutTrum && TRUM_ATK.has('twin_core')) REN.nutTrum(E); else TRM.fx('twin_core', 'no_phao', E.x, E.y, 140, 0.5);
    sinhLoiCon(E, -10); sinhLoiCon(E, 10);
    FX.no('no_phao', E.x, E.y, 90, 0.35); TRM.chu(E.x, E.y - 40, 'SPLIT!', TRUM_MOI.twin_core.mau, 16);
  }
  if (E.trum === 'leech' && E.kho > 0) {
    const BB = G.ban[E.ban];
    const r = rngTrum(E);
    for (let i = 0; i < E.kho; i++) {
      const ds = BB.t.filter(nhanSaoTuDong); // +★ tự động: bỏ đá + băng (AUDIT F10)
      if (ds.length) { const T = chonTrum(ds, r); T.sao++; T.sang = 1; const c = BB.o[T.o]; TRM.fx('leech', 'starup', c.x, c.y, 80, 0.5); TRM.chu(c.x, c.y - 22, '+1★ RETURNED', '#ffd84a', 13); }
      else BB.mana += manaGiet(G.wave) * 3;
    }
    E.kho = 0;
  }
};

// ---------- STATIC JAMMER: ụ bị câm không bắn, không ghép (hết khi xích st.kep bị gỡ / hết giờ) ----------
const _capNhatUGoc = capNhatU;
capNhatU = function (B, T, dt) {
  if (T.st.cam > 0) {
    if (!(T.st.kep > 0)) T.st.cam = 0;
    else { T.st.cam -= dt; if (T.anim) T.anim.t += dt; T.sang = Math.max(0, T.sang - dt * 3); return; }
  }
  return _capNhatUGoc(B, T, dt);
};
const _hopLeGhepGoc = hopLeGhep;
hopLeGhep = function (a, b) {
  if ((a && a.st && a.st.cam > 0) || (b && b.st && b.st.cam > 0)) return false;
  return _hopLeGhepGoc(a, b);
};

// ---------- lịch trùm: ?trum=<id> ----------
const _trumCuaWaveGoc = trumCuaWave;
trumCuaWave = function (w, p) { return TRUM_DBG || _trumCuaWaveGoc(w, p); };
const _batDauGoc = batDau;
batDau = function () {
  const r = _batDauGoc.apply(this, arguments);
  if (TRUM_DBG) G.duong.forEach((d, pi) => G.hang.push({ t: G.t + 2, trum: TRUM_DBG, p: pi }));
  return r;
};

// ---------- hình: ảnh mượn khi chưa có ảnh riêng; băng giới thiệu ----------
if (typeof REN !== 'undefined' && REN.tenQuai) {
  const _tq = REN.tenQuai;
  REN.tenQuai = function (E) {
    const M = E.trum && TRUM_MOI[E.trum];
    if (!M || TRUM_ANH.has(E.trum)) return _tq.call(this, E);
    const goc = 'trum_' + M.anhTam;
    return this.img(goc + '_8') ? goc + '_8' : goc;
  };
}
// ảnh riêng đã có: bật dải 8 khung + 2 hướng nhìn ngang/sau trong hệ hướng nhìn của quaianim.js (HUONG8, Pass 5) — không viết hệ riêng
if (typeof TRUM8 !== 'undefined') for (const id of TRUM_ANH) TRUM8.add(id);
if (typeof HUONG8 !== 'undefined') for (const k of TRUM_HUONG) HUONG8.add('trum_' + k);
// chưa có ảnh riêng: REN.tenQuai trả dải MƯỢN (trum_<anhTam>_8) → hệ hướng nhìn tự dùng hướng ngang/sau của trùm mượn khi Pass 5 về
if (typeof VT !== 'undefined') {
  for (const id in TRUM_MOI) VT.NGUY[id] = TRUM_MOI[id].nguy;
  const _sp = VT.sprite, _nf = VT.soKhung;
  const anh = (id) => (TRUM_MOI[id] && !TRUM_ANH.has(id) ? TRUM_MOI[id].anhTam : id);
  VT.sprite = (id) => (TRUM_CHANDUNG.has(id) ? 'url(assets/trum_' + id + '_portrait.png)' : _sp.call(VT, anh(id)));
  VT.soKhung = (id) => (TRUM_CHANDUNG.has(id) ? 1 : _nf.call(VT, anh(id))); // 1 khung: nền 100% → hoạt ảnh bước khung không dịch ảnh
}
})();
