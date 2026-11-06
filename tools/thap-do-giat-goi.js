// TURRET MERGE — ĐO GIẬT KHUNG KHI RA SKILL (tuvan/giat_skill). Người dùng: "khi ra skill có nhanh quá dẫn đến giật cục không".
// Mỗi nhóm = 1 trang mới (bộ bài 5 ụ như trận thật → ảnh của bộ bài đã nạp sẵn, ảnh "tình huống" nạp lần đầu): dựng bàn, chờ ổn định,
// kích từng kỹ năng (đỏ chủ động, vàng đặc biệt, ghép, trùm, chỉ huy, nhiều kỹ năng cùng khung) rồi ghi từng khung 3 s:
//   dt (khoảng cách 2 khung rAF — cái mắt thấy), viec (JS+lệnh vẽ của khung), các hàm tốn > 2 ms trong khung (ảnh nạp lần đầu, thu ảnh,
//   mipmap, âm thanh, FX, DOM), số thay đổi DOM; + vết CDP: task dài trên luồng chính (GC, giải mã ảnh, layout).
// iPhone 13 (390×844, DPR 3, cảm ứng). Chromium (WebKit không có trong máy kiểm — tải trình duyệt bị chặn).
// Chạy (gốc repo):  python3 -m http.server 8765 &   rồi   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-giat.js
//   NHOM=do1,do2,vang1,… (mặc định: tất cả) · TEN=sau|truoc (tên tệp kết quả) · OUT=thư mục · VET=0 bỏ vết CDP (nhanh hơn)
//   KIEM=1 (chế độ hồi quy): TRƯỢT (mã 1) nếu một kỹ năng làm 1 khung tốn > NGUONG_MS ms việc (JS + lệnh vẽ; mặc định 33; CO-OP NGUONG_COOP=50)
//     trong 3 s sau kích, hoặc có lỗi trang. (Khoảng cách khung trên máy kiểm 2 lõi bị chi phối bởi bước ghép hình phần mềm ~30–50 ms
//     ở 3× ngay cả khi không ra skill → không dùng làm ngưỡng; vẫn ghi trong JSON.) RO=n: thêm kiểm số khung rớt 1 s sau kích.
//   GHI_AM=1: ghi lại danh sách cỡ hình cần dựng sẵn → thap/js/muotkn-am.js (chạy lại khi thêm kỹ năng / hình mới)
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/giat_skill/goi/';
const TEN = process.env.TEN || 'sau';
const KIEM = !!process.env.KIEM;
const NGUONG = +(process.env.NGUONG_MS || 33);      // ms việc (JS + lệnh vẽ) của 1 khung quanh kỹ năng — SOLO
const NGUONG_COOP = +(process.env.NGUONG_COOP || 50); // CO-OP: 2 bàn 30 ụ 7★ (máy kiểm: nền đã ~14 ms/khung)
const RO = process.env.RO ? +process.env.RO : null;   // (tuỳ chọn) số khung rớt tối đa 1 s sau kích — máy kiểm 2 lõi rớt sẵn ở 3× nên mặc định không kiểm
const VET = process.env.VET !== '0' && !KIEM;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

// ---------- các nhóm (1 trang / nhóm) ----------
// ban: 15 ô [id, sao] · viec: [{nhan, k: 'do'|'ghep'|'trum'|'mv'|'cung'|'cho', ...}]
const F = (id, s) => [id, s];
const NHOM = {
  do1: { che: 'solo', wave: 22, deck: 'blackhole,overlord,leviathan,ronglua,chuato',
    ban: [F('blackhole', 7), F('overlord', 7), F('leviathan', 7), F('ronglua', 7), F('chuato', 7), F('blackhole', 4), F('overlord', 4), F('leviathan', 4), F('ronglua', 4), F('chuato', 4), F('blackhole', 2), F('overlord', 2), F('leviathan', 2), F('ronglua', 2), F('chuato', 2)],
    viec: ['blackhole', 'overlord', 'leviathan', 'ronglua', 'chuato'].map(id => ({ nhan: 'đỏ ' + id, k: 'do', id })) },
  do2: { che: 'solo', wave: 22, deck: 'ngaithoigian,khoisinh,lophanung,haoquang,canon',
    ban: [F('ngaithoigian', 7), F('khoisinh', 7), F('lophanung', 7), F('haoquang', 7), F('canon', 7), F('ngaithoigian', 4), F('khoisinh', 4), F('lophanung', 4), F('canon', 4), F('canon', 3), null, F('canon', 2), F('lophanung', 2), F('khoisinh', 2), F('canon', 2)],
    viec: ['ngaithoigian', 'khoisinh', 'lophanung', 'haoquang'].map(id => ({ nhan: 'đỏ ' + id, k: 'do', id })) },
  vang1: { che: 'solo', wave: 22, deck: 'orbital,pandora,hydra,cuuvi,ngoisao',
    ban: [F('orbital', 6), F('orbital', 6), F('pandora', 7), F('hydra', 7), F('cuuvi', 7), F('ngoisao', 7), F('pandora', 6), F('pandora', 6), F('hydra', 6), F('hydra', 6), F('cuuvi', 6), F('cuuvi', 6), F('ngoisao', 6), F('ngoisao', 6), null],
    viec: [{ nhan: 'vàng chạy 8 s (Pandora / Hydra / Cửu Vĩ / Star Cannon)', k: 'cho', ms: 8000 },
      { nhan: 'ghép Orbital (thức tỉnh, bom quỹ đạo)', k: 'ghep', a: 0, b: 1 },
      { nhan: 'ghép Pandora 6★', k: 'ghep', a: 6, b: 7 }, { nhan: 'ghép Hydra 6★→7★', k: 'ghep', a: 8, b: 9 },
      { nhan: 'ghép Cửu Vĩ 6★', k: 'ghep', a: 10, b: 11 }, { nhan: 'ghép Star Cannon 6★', k: 'ghep', a: 12, b: 13 }] },
  vang2: { che: 'solo', wave: 22, deck: 'soi,wallgen,marionette,sinhdoi,vughep',
    ban: [F('soi', 7), F('wallgen', 5), F('wallgen', 5), F('marionette', 7), F('sinhdoi', 5), F('sinhdoi', 5), F('vughep', 5), F('vughep', 5), F('soi', 5), F('soi', 5), F('marionette', 5), F('marionette', 5), F('soi', 3), F('marionette', 3), null],
    viec: [{ nhan: 'vàng chạy 8 s (Werewolf / Marionette)', k: 'cho', ms: 8000 },
      { nhan: 'ghép Wall Projector (tường)', k: 'ghep', a: 1, b: 2 }, { nhan: 'ghép Twin Maker (tia sinh đôi)', k: 'ghep', a: 4, b: 5 },
      { nhan: 'ghép Merge King', k: 'ghep', a: 6, b: 7 }, { nhan: 'ghép Werewolf 5★', k: 'ghep', a: 8, b: 9 }, { nhan: 'ghép Marionette 5★', k: 'ghep', a: 10, b: 11 }] },
  trum: { che: 'solo', wave: 30, deck: 'canon,lien,bang,tia,set',
    ban: [F('canon', 3), F('lien', 3), F('bang', 3), F('tia', 3), F('set', 3), F('canon', 2), F('lien', 2), F('bang', 2), F('tia', 2), F('set', 2), F('canon', 1), F('lien', 1), F('bang', 1), F('tia', 1), F('set', 1)],
    viec: ['freezer', 'mad_crown', 'janus', 'joker_king', 'octopus', 'nightmare', 'hive', 'jammer', 'prism', 'patcher', 'leech', 'twin_core'].map(id => ({ nhan: 'trùm ' + id, k: 'trum', id })) },
  mv: { che: 'solo', wave: 20, deck: 'canon,lien,bang,tia,set', mvs: ['hero', 'dahlia', 'eve'],
    ban: [F('canon', 3), F('lien', 3), F('bang', 3), null, F('set', 3), F('canon', 2), F('lien', 2), null, F('tia', 2), F('set', 2), F('canon', 1), null, F('bang', 1), F('tia', 1), F('set', 1)],
    viec: ['hero', 'dahlia', 'eve'].map(id => ({ nhan: 'chỉ huy ' + id, k: 'mv', id })) },
  cung: { che: 'solo', wave: 35, deck: 'blackhole,overlord,leviathan,ronglua,chuato',
    ban: [F('blackhole', 7), F('overlord', 7), F('leviathan', 7), F('ronglua', 7), F('chuato', 7), F('blackhole', 6), F('overlord', 6), F('leviathan', 6), F('ronglua', 6), F('chuato', 6), F('blackhole', 5), F('overlord', 5), F('leviathan', 5), F('ronglua', 5), F('chuato', 5)],
    viec: [{ nhan: '5 đỏ cùng 1 khung + 2 ghép + trùm (wave 35)', k: 'cung' }] },
  coop: { che: 'coop', wave: 30, deck: 'blackhole,overlord,leviathan,ronglua,chuato', deck2: 'ngaithoigian,khoisinh,lophanung,haoquang,canon',
    ban: [F('blackhole', 7), F('overlord', 7), F('leviathan', 7), F('ronglua', 7), F('chuato', 7), F('blackhole', 6), F('overlord', 6), F('leviathan', 6), F('ronglua', 6), F('chuato', 6), F('blackhole', 5), F('overlord', 5), F('leviathan', 5), F('ronglua', 5), F('chuato', 5)],
    ban2: [F('ngaithoigian', 7), F('khoisinh', 7), F('lophanung', 7), F('haoquang', 7), F('canon', 7), F('ngaithoigian', 6), F('khoisinh', 6), F('lophanung', 6), F('haoquang', 6), F('canon', 6), F('canon', 5), F('canon', 5), F('lophanung', 5), F('khoisinh', 5), F('canon', 5)],
    viec: [{ nhan: 'CO-OP: 9 đỏ 2 bàn cùng khung + trùm', k: 'cung', hai: true }] },
};

// ---------- trong trang ----------
function CAI() { // gắn bộ ghi khung + bọc hàm (đo thời gian từng lời gọi)
  if (window.__GT) return;
  const GT = window.__GT = { k: [], cur: {}, lon: [], mut: 0, on: true, sau: [] };
  const now = () => performance.now();
  let tr = 0;
  const vong = (t) => {
    if (tr) GT.k.push({ t, dt: t - tr, viec: +(REN._viec || 0).toFixed(1), lab: GT.cur, mut: GT.mut, lon: GT.sau });
    tr = t; GT.cur = {}; GT.mut = 0; GT.sau = [];
    if (GT.k.length > 6000) GT.k.splice(0, 3000);
    requestAnimationFrame(vong);
  };
  requestAnimationFrame(vong);
  new MutationObserver(ms => { GT.mut += ms.length; }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  let sau = 0; // độ sâu (chỉ ghi lời gọi ngoài cùng của mỗi đối tượng để không cộng trùng)
  const boc = (o, ten, ma) => {
    const f = o[ten]; if (typeof f !== 'function' || f.__boc) return;
    const g = function () {
      const t0 = now(); sau++;
      try { return f.apply(this, arguments); } finally {
        sau--; const d = now() - t0;
        if (sau === 0) GT.cur[ma] = (GT.cur[ma] || 0) + d;
        if (d > 2) { const a0 = arguments[0]; GT.sau.push(ma + (typeof a0 === 'string' ? '(' + a0.slice(0, 40) + ')' : '') + ' ' + d.toFixed(1)); }
      }
    };
    g.__boc = true; o[ten] = g;
  };
  const bocHet = (o, tien) => { if (!o) return; for (const k of Object.keys(o)) if (typeof o[k] === 'function' && !/^(constructor)$/.test(k)) boc(o, k, tien + '.' + k); };
  for (const [ten, o] of [['FX', window.FX], ['SND', window.SND], ['VX', window.VX], ['GF', window.GF], ['SIG', window.SIG], ['TVX', window.TVX], ['BVX', window.BVX], ['BANGFX', window.BANGFX], ['VM1', window.VM1], ['GFX', window.GFX], ['NH', window.NH], ['FXU', window.FXU], ['PX', window.PX], ['NS', window.NS]]) {
    try { bocHet(o || (typeof eval(ten) !== 'undefined' ? eval(ten) : null), ten); } catch (e) { }
  }
  for (const k of ['img', 'co', 'coDai', 'toMauA', 'mip', 'banTrang', 'banXam', 'thuNho', 'lamNen', 'toBien']) boc(REN, k, 'REN.' + k);
  for (const k of ['cutIn', 'canhBaoTrum', 'bangWave', 'capNhat']) boc(UI, k, 'UI.' + k);
  for (const id in SKILLS) { const s = SKILLS[id]; for (const k of ['chuDong', 'ghep', 'ghepDB']) if (typeof s[k] === 'function') boc(s, k, 'SK.' + id + '.' + k); }
  // ảnh nạp lần đầu (REN.img chép Image → canvas): ghi tên + thời gian
  const img0 = REN.img;
  REN.img = function (ten) { const a = REN.anh[ten], co = a && a._cv; const t0 = now(); const r = img0.apply(this, arguments); if (!co && r && r.getContext) { const d = now() - t0; GT.sau.push('ANH1(' + ten + ') ' + d.toFixed(1)); GT.cur['ANH1'] = (GT.cur['ANH1'] || 0) + d; } return r; };
  REN.img.__boc = true;
  // "quá nhanh": mỗi hiệu ứng dải khung (FX.no/no1) — số khung n / thời gian sống → khung/giây (> 40 = nháy, khó đọc)
  GT.nhanh = {};
  const ghiFx = (ten0) => { const A = FX.anim[FX.anim.length - 1]; if (!A || A._gt) return; A._gt = 1; const ten = A.ten || ten0, a = REN.anh[ten] || REN.anh['fx_' + ten]; const w = a && (a.naturalWidth || a.width), h = a && (a.naturalHeight || a.height); const n = w && h ? Math.max(1, Math.round(w / h)) : 0; if (!(A.song > 0)) return; const r = GT.nhanh[ten] || (GT.nhanh[ten] = { n, songMin: 9, lan: 0 }); r.lan++; if (A.song < r.songMin) r.songMin = +A.song.toFixed(3); r.fps = n ? +(n / r.songMin).toFixed(0) : 0; };
  for (const k of ['no', 'no1']) { const f = FX[k]; FX[k] = function (ten) { const r = f.apply(this, arguments); try { ghiFx(ten); } catch (e) { } return r; }; }
  if (window.__VONG_TO) { const v0 = VX.vong; GT.vongTo = []; VX.vong = function (ctx, x, y, r, w, mau, al) { if (r > 200 && GT.vongTo.length < 12) GT.vongTo.push([Math.round(r), mau, +(al || 0).toFixed(2), (new Error().stack || '').split('\n').slice(2, 5).map(l => l.trim().replace(/https?:\/\/[^/]+\/thap\//, '')).join(' < ')]); return v0.apply(this, arguments); }; }
  window.GT_GHI = () => { GT.lap = GT.k.length; return performance.now(); };
}
function datBan(o) {
  const ds = [o.ban, o.ban2];
  G.ban.forEach((B, i) => {
    const BAN = ds[i] || ds[0];
    B.tim = 1e9; B.timMax = 1e9; B.mana = 99999;
    for (let k = 0; k < 15; k++) { const v = BAN[k]; if (!v) { B.t[k] = null; continue; } B.t[k] = sinhU(taoU(B, v[0], v[1], k)); }
    B.ai = i > 0 ? true : false;
  });
  if (G.ban[1] && o.che === 'coop') G.ban[1].ai = true;
}
function KICH(v) { // trả về thời gian (performance.now) lúc kích
  const B = G.ban[0], t0 = performance.now();
  const doU = (B, id) => { const T = B.t.find(T => T && T.id === id && SKILLS[id].chuDong); if (!T) return 'không có ụ ' + id; T.nap = 1; T.st.bang = 0; T.st.da = false; SKILLS[id].chuDong(G, B, T); return ''; };
  if (v.k === 'do') { if (!SKILLS[v.id].chuDong) { const T = B.t.filter(T => T && T.id === v.id).sort((a, b) => b.sao - a.sao)[0]; if (!T) return { t0, loi: 'không có ụ ' + v.id }; T.nap = 0.999; return { t0, loi: '' }; } return { t0, loi: doU(B, v.id) }; }
  if (v.k === 'ghep') { const a = B.t[v.a], b = B.t[v.b]; if (!a || !b) return { t0, loi: 'thiếu ụ ghép' }; const r = ghep(B, a, b); return { t0, loi: r ? '' : 'ghép không được' }; }
  if (v.k === 'trum') { const E = sinhTrum(v.id, 0, 1); E.s = 120; [E.x, E.y, E.goc] = viTri(G.duong[E.p], E.s); E.vao = 1; E.knT = 1.0; window.__trum = E; return { t0, loi: '' }; }
  if (v.k === 'mv') { B.mv = { id: v.id, gia: 0, cd: 0 }; B.mana = 99999; const ok = dungMV(B); return { t0, loi: ok ? '' : 'chỉ huy không dùng được' }; }
  if (v.k === 'cung') {
    const bans = v.hai ? G.ban : [B];
    for (const X of bans) for (const T of X.t) if (T && SKILLS[T.id].chuDong && T.sao >= 7) { T.nap = 1; T.st.bang = 0; try { SKILLS[T.id].chuDong(G, X, T); } catch (e) { } }
    for (const X of bans) { const ps = []; for (const T of X.t) if (T && T.sao === 6) ps.push(T); const p1 = ps.find((a, i) => ps.slice(i + 1).some(b => b.id === a.id)); if (p1) { const p2 = ps.find(b => b !== p1 && b.id === p1.id); ghep(X, p1, p2); } }
    const E = sinhTrum('freezer', 0, 1); E.s = 100; E.vao = 1; E.knT = 0.8;
    if (v.hai && G.duong.length > 1) { const pi = G.duong.findIndex(p => p.ban === 1); if (pi >= 0) { const E2 = sinhTrum('nightmare', pi, 1); E2.vao = 1; E2.knT = 0.8; } }
    return { t0, loi: '' };
  }
  return { t0, loi: '' };
}
function LAY(t0, ms) { // khung từ t0 − 300 ms tới t0 + ms
  const GT = window.__GT; const ds = GT.k.filter(k => k.t >= t0 - 300 && k.t <= t0 + ms);
  const i0 = GT.k.indexOf(ds[0]);
  return ds.map((k, j) => { const tr = GT.k[i0 + j - 1] || { lab: {}, lon: [] }; const lab = Object.assign({}, tr.lab); for (const a in k.lab) lab[a] = (lab[a] || 0) + k.lab[a]; return { lab, lon: tr.lon.concat(k.lon), k }; }).map(({ lab, lon, k }) => ({ t: +(k.t - t0).toFixed(1), dt: +k.dt.toFixed(1), viec: k.viec, mut: k.mut, lab: Object.fromEntries(Object.entries(lab).filter(([, v]) => v > 0.5).map(([a, v]) => [a, +v.toFixed(1)])), lon }));
}

// ---------- vết CDP ----------
async function vetBat(cdp) { await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8,disabled-by-default-devtools.timeline,blink.user_timing', transferMode: 'ReturnAsStream' }); }
async function vetTat(cdp) {
  const ev = await new Promise(async (ok) => {
    cdp.once('Tracing.tracingComplete', async ({ stream }) => {
      let s = ''; for (;;) { const r = await cdp.send('IO.read', { handle: stream }); s += r.data; if (r.eof) break; } await cdp.send('IO.close', { handle: stream });
      try { const j = JSON.parse(s); ok(j.traceEvents || j); } catch (e) { ok([]); }
    });
    await cdp.send('Tracing.end');
  });
  const main = ev.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
  const laMain = (e) => main && e.pid === main.pid && e.tid === main.tid;
  const tasks = ev.filter(e => laMain(e) && e.ph === 'X' && e.name === 'RunTask' && e.dur > 30000).map(e => {
    const con = {}; for (const c of ev) if (laMain(c) && c.ph === 'X' && c.ts >= e.ts && c.ts + (c.dur || 0) <= e.ts + e.dur && c !== e && c.dur > 1000) {
      const k = /GC/.test(c.name) ? 'GC' : c.name; if (/^(RunTask|ThreadControllerImpl::RunTask)$/.test(k)) continue; con[k] = (con[k] || 0) + c.dur / 1000;
    }
    return { ms: +(e.dur / 1000).toFixed(1), con: Object.fromEntries(Object.entries(con).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => [k, +v.toFixed(1)])) };
  });
  let giaiMa = 0, gc = 0; for (const e of ev) { if (e.ph !== 'X' || !e.dur) continue; if (/Decode|ImageDecode/.test(e.name)) giaiMa += e.dur / 1000; if (laMain(e) && /GC/.test(e.name)) gc += e.dur / 1000; }
  return { taskDai: tasks.sort((a, b) => b.ms - a.ms).slice(0, 5), giaiMaAnhMs: +giaiMa.toFixed(1), gcMs: +gc.toFixed(1) };
}

function tomTat(ks) {
  const sau = ks.filter(k => k.t >= 0), truoc = ks.filter(k => k.t < 0);
  let maxDt = 0, kMax = null, ro = 0, ro1s = 0, maxViec = 0;
  for (const k of sau) { if (k.dt > maxDt) { maxDt = k.dt; kMax = k; } const r = Math.max(0, Math.round(k.dt / 16.67) - 1); ro += r; if (k.t <= 1000) ro1s += r; if (k.viec > maxViec) maxViec = k.viec; }
  const lon = []; for (const k of sau) for (const l of k.lon) lon.push(l);
  const dem = {}; for (const l of lon) { const m = l.replace(/ [\d.]+$/, ''); const v = +l.split(' ').pop(); dem[m] = Math.max(dem[m] || 0, v); }
  return { khungMaxMs: +maxDt.toFixed(1), viecMaxMs: maxViec, roKhung: ro, roKhung1s: ro1s, khung33: sau.filter(k => k.dt > 33.4).length,
    nenMaxMs: +Math.max(0, ...truoc.map(k => k.dt)).toFixed(1), giuaMs: +(sau.map(k => k.dt).sort((a, b) => a - b)[sau.length >> 1] || 0).toFixed(1), viecGiua: +(sau.map(k => k.viec).sort((a, b) => a - b)[sau.length >> 1] || 0).toFixed(1),
    khungXau: kMax ? { t: kMax.t, dt: kMax.dt, viec: kMax.viec, mut: kMax.mut, lab: kMax.lab, lon: kMax.lon } : null,
    goiLon: Object.entries(dem).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + v.toFixed(1)) };
}

async function chayNhom(b, ten, o) {
  const ctx = await b.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const loi = []; p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Firebase|firebase|WebSocket|net::|ERR_/.test(m.text())) loi.push('console: ' + m.text()); });
  const q = `?mode=${o.che}&deck=${o.deck}&deck2=${o.deck2 || o.deck}&wave=${o.wave}&mana=99999&seed=4242` + (o.mvs ? '&af=' + o.mvs[0] : '') + (process.env.QX != null ? process.env.QX : '&dpr=3');
  await p.goto(BASE + q, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho && !TAI.doi, null, { timeout: 120000 });
  await p.keyboard.press('Shift'); // mở khoá âm thanh (SND.mo) như lần chạm đầu
  await p.evaluate(datBan, o);
  if (process.env.VONG_TO) await p.evaluate(() => { window.__VONG_TO = 1; });
  await p.evaluate(CAI);
  await p.evaluate(`window.KICH = ${KICH.toString()}; window.LAY = ${LAY.toString()};`);
  await sleep(4500);
  const cdp = await ctx.newCDPSession(p);
  const kq = [];
  for (const v of o.viec) {
    if (VET) await vetBat(cdp);
    await sleep(400);
    if (v.k === 'cho') { const t0 = await p.evaluate(() => performance.now()); await sleep(v.ms); const ks = await p.evaluate(([t0, ms]) => LAY(t0, ms), [t0, v.ms]); const r = Object.assign({ nhom: ten, nhan: v.nhan }, tomTat(ks)); if (VET) r.vet = await vetTat(cdp); kq.push(r); console.log(JSON.stringify([r.nhan, r.khungMaxMs, r.roKhung, r.goiLon.slice(0, 3)])); continue; }
    const r0 = await p.evaluate(v => { const r = KICH(v); return r; }, v).catch(e => ({ t0: 0, loi: String(e.message || e) }));
    const ms = v.k === 'trum' || v.k === 'cung' ? 3500 : 3000;
    if (process.env.CHUP && v.k === 'cung') { // dải ảnh khoảnh khắc nặng (kiểm hình: hiệu ứng vẫn đủ, không thiếu ảnh)
      const t0 = Date.now(); let i = 0;
      for (const moc of [60, 200, 400, 650, 1000, 1500]) { const c = moc - (Date.now() - t0); if (c > 0) await sleep(c); await p.screenshot({ path: OUT + 'chup_' + ten + '_' + TEN + '_' + (i++) + '.png' }); }
      await sleep(Math.max(0, ms + 200 - (Date.now() - t0)));
    } else await sleep(ms + 200);
    const ks = await p.evaluate(([t0, ms]) => LAY(t0, ms), [r0.t0, ms]);
    const r = Object.assign({ nhom: ten, nhan: v.nhan, loiKich: r0.loi || undefined }, tomTat(ks));
    if (VET) r.vet = await vetTat(cdp);
    if (process.env.KHUNG) r.khung = ks;
    if (process.env.DAI && v.k === 'cung') { await p.screenshot({ path: OUT + 'cung_' + ten + '_' + TEN + '.png' }); }
    kq.push(r);
    console.log(JSON.stringify([r.nhan, r.khungMaxMs, r.roKhung, r.giuaMs, r.viecGiua, r.viecMaxMs, r.loiKich || '', r.goiLon.slice(0, 4)]));
    if (v.k === 'trum') await p.evaluate(() => { for (const E of G.quai) if (E.trum) { E.hp = 0; E.chet = true; } G.quai = G.quai.filter(E => !E.trum); });
    await sleep(600);
  }
  const nhanh = await p.evaluate(() => window.__GT.nhanh);
  if (process.env.VONG_TO) console.log('vòng to:', JSON.stringify(await p.evaluate(() => window.__GT.vongTo), null, 0));
  const ghi = await p.evaluate(() => typeof MKN !== 'undefined' ? { ghi: [...MKN.ghi], hoan: MKN.hoanDem, xay: MKN.xayDem, con: MKN.hang.length } : { ghi: [] });
  console.log('  MKN: hoãn', ghi.hoan, '· dựng', ghi.xay, '· còn hàng', ghi.con, '· ghi', ghi.ghi.length);
  await ctx.close();
  return { kq, loi: loi.slice(0, 6), ghi: ghi.ghi, nhanh, mkn: { hoan: ghi.hoan, xay: ghi.xay } };
}

(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization=false', '--autoplay-policy=no-user-gesture-required'] });
  const chon = (process.env.NHOM || Object.keys(NHOM).join(',')).split(',');
  const tat = { ten: TEN, luc: new Date().toISOString(), nhom: {} };
  let truot = false;
  for (const ten of chon) {
    const r = await chayNhom(b, ten, NHOM[ten]);
    tat.nhom[ten] = r;
    if (r.loi.length) { console.log('✗', ten, 'lỗi trang:', r.loi); truot = true; }
    for (const x of r.kq) {
      if (x.loiKich) console.log('  ! ', x.nhan, x.loiKich);
      const ng = NHOM[ten].che === 'coop' ? NGUONG_COOP : NGUONG;
      if (KIEM && x.viecMaxMs > ng) { console.log('✗ giật', x.nhan, 'việc khung', x.viecMaxMs, 'ms > ', ng, '|', x.goiLon.slice(0, 4).join(' · ')); truot = true; }
      if (KIEM && RO != null && x.roKhung1s > RO) { console.log('✗ rớt khung', x.nhan, x.roKhung1s, 'khung trong 1 s sau kích > ', RO); truot = true; }
    }
  }
  await b.close();
  if (process.env.GHI_AM) { // danh sách làm ấm cho js/muotkn.js (hợp với bản cũ)
    const F = path.join(__dirname, '../thap/js/muotkn-am.js'); let cu = [];
    try { cu = JSON.parse(fs.readFileSync(F, 'utf8').split('const MKN_AM = ')[1].replace(/;\s*$/, '')); } catch (e) { }
    const u = [...new Set(cu.concat(...Object.values(tat.nhom).map(r => r.ghi)))].sort();
    fs.writeFileSync(F, "// sinh bởi tools/thap-kt-giat.js (GHI_AM=1) — mỗi dòng 'hàm|ảnh|cỡ logic|biến thể' cần dựng sẵn khi vào trận (js/muotkn.js)\nconst MKN_AM = " + JSON.stringify(u, null, 0).replace(/","/g, '",\n"') + ';\n');
    console.log('ghi', u.length, 'mục làm ấm →', F);
  }
  for (const r of Object.values(tat.nhom)) delete r.ghi;
  if (!KIEM) fs.writeFileSync(OUT + `do_${TEN}.json`, JSON.stringify(tat, null, 1));
  if (!truot) console.log('✓ giật skill: mọi kỹ năng ≤', NGUONG, 'ms việc/khung (CO-OP ≤', NGUONG_COOP + ')', RO != null ? '≤ ' + RO + ' khung rớt' : '');
  process.exit(truot ? 1 : 0);
})();
