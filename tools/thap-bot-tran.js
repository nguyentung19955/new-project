// TURRET MERGE — TRẬN BOT THẬT không giao diện (11/11, cân bằng wave): chạy đúng code game trong Chromium (Playwright),
// bàn mình do bot của game chơi (?auto=1 → aiBan), gọi thẳng capNhat(1/60) (không vẽ) → ~vài nghìn bước/giây, TẤT ĐỊNH theo hạt.
// Đo: wave tới được, tim còn, thời gian trận, số quái sinh mỗi wave (kể cả con tách ra), ĐỈNH quái sống cùng lúc, mana thừa, bàn cuối.
// Biến thể "sau khi sửa" bơm lúc chạy (KHÔNG sửa thap/): --bt <tên trong tools/thap-bot-bienthe.js> hoặc --js "<đoạn JS chạy trong trang trước batDau>".
//
// Chạy (gốc repo):  python3 -m http.server 8765 &
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-bot-tran.js --che thap --tang 1 --deck tia,lien,sungluc,bang,set --hat 1,2
//   … --che solo --deck cobac,vughep,sinhdoi,saochep,tudo --max 100 --bt A      … --che coop --deck … --deck2 …
//   … --lo tools/thap-bot-lo.json --bt goc,A,B --song 2 --ra docs/demo-hop-tuong/tocban/bot-wave.json     (chạy cả lô, 2 trang song song)
// Tham số: --che solo|coop|thap|dd (dd = Đường Đua) · --tang N (Leo Tháp) · --wave W0 --mana M (solo/coop: wave đầu / mana đầu) · --cap K (số cấp thẻ trên cấp đầu, mặc định 0)
//   --mv hero (chỉ huy) · --max 100 (trần wave solo/coop; game thật 70) · --hat 1,2 (hạt giống) · --chitiet 1 (in từng wave) · BASE=http://localhost:8765/thap/
// Ghi chú: Leo Tháp game thật dùng hạt cố định theo tầng (CD.hat) → hạt h ở đây = hạt tầng + h·7919 (h = 0: đúng hạt game).
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = {}; { const v = process.argv.slice(2); for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) A[v[i].slice(2)] = v[i + 1] && !v[i + 1].startsWith('--') ? v[++i] : '1'; }
const BASE = process.env.BASE || 'http://localhost:' + (process.env.PORT || 8765) + '/thap/';
let BT = {}; try { BT = require('./thap-bot-bienthe.js'); } catch (e) { }

// ---- chạy trong trang ----
function trongTrang(c) {
  const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const S = window.__S = { w: {}, dinh: 0, dinhW: 0, buoc: 0, loi: '', c };
  const W = (w) => S.w[w] || (S.w[w] = { sinh: 0, tach: 0, dinh: 0, lot: 0, t0: +G.t.toFixed(1) });
  if (c.js) (0, eval)(c.js);                                   // biến thể: vá bảng wave / hệ số trong trang
  if (c.max) LUAT.waveMax = c.max;
  G.debug.auto = true; G.debug.seed = 1000 + c.hat; G.tocDo = 1;
  if (c.cap) { G.debug.cap0 = {}; G.debug.cap2 = {}; for (const id of c.deck) G.debug.cap0[id] = c.cap; for (const id of (c.deck2 || [])) G.debug.cap2[id] = c.cap; }
  if (c.deck2) G.debug.deck2 = c.deck2;
  if (c.che !== 'thap') { if (c.wave) G.debug.wave = c.wave; if (c.mana) G.debug.mana = c.mana; }
  REN.ve = () => { }; UI.capNhat = () => { }; try { for (const k in SND) if (typeof SND[k] === 'function') SND[k] = () => { }; } catch (e) { }
  const sq = sinhQuai; sinhQuai = function (id, pi, s) { const E = sq.apply(this, arguments); const x = W(G.wave); x.sinh++; if (s > 0) x.tach++; return E; };
  const st = sinhTrum; sinhTrum = function () { const E = st.apply(this, arguments); W(G.wave).sinh++; W(G.wave).trum = 1; return E; };
  const lo = lot; lot = function (E) { W(G.wave).lot += E.tim || 1; return lo.apply(this, arguments); };
  let sauCh = 0; const tongMana = () => { let t = 0; for (const b of G.ban) t += b.mana; return t; };
  const ch0 = chet; chet = function (E, B) { if (!E || E.chet || sauCh) return ch0.apply(this, arguments); sauCh = 1; const m0 = tongMana(); try { return ch0.apply(this, arguments); } finally { sauCh = 0; const x = W(G.wave); x.mn = (x.mn || 0) + Math.round(tongMana() - m0); } }; // mana nhận khi giết quái mỗi wave (mọi bàn, kể cả thưởng kỹ năng lúc giết)
  const kt = ketThuc; ketThuc = function (thang, ly) { if (!S.kq) S.kq = { thang: !!thang, ly: String(ly || ''), wave: G.wave }; return kt.apply(this, arguments); };
  // BOT+ (mặc định; --botgoc 1 để tắt): aiBan của game chọn mãi 1 cặp ghép ĐẶC BIỆT không đổi gì trên bàn (vd Blood Vein đã đánh dấu + ụ khác)
  //   → bot đứng hình, bàn đầy, mana thừa hàng chục nghìn. Ở đây: cặp nào bot ghép mà bàn không đổi thì cấm cặp đó 8 s (chỉ trong lượt bot) → bot đi tiếp.
  if (!c.botgoc) {
    const cam = new Map(); let trongAI = 0; S.ket = 0;
    const kh = (a, b) => a.uid + ':' + b.uid, dau = (B) => B.t.map(T => T ? T.uid + '.' + T.sao + '.' + (T.mh ? 1 : 0) : '-').join(',') + '|' + Math.round(B.mana);
    // BOT+ (2) chống KẸT BÀN: aiBan triệu hồi tới khi bàn đầy; 15 ô khác (loại, sao) nhau = không còn cặp ghép → không triệu hồi được nữa, mana thừa vô ích.
    //   Ở đây: còn đúng 1 ô trống mà bàn chưa có cặp ghép nào → chỉ triệu hồi khi ụ 1★ mới CHẮC CHẮN có cặp (đủ 1★ của cả 5 loại, không bị khoá); không thì giữ ô trống (bot vẫn power-up).
    const coCap = (B) => { const ts = B.t.filter(Boolean); for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) if (hopLeGhep(ts[i], ts[j]) || hopLeGhep(ts[j], ts[i])) return true; return false; };
    const chacCap = (B) => B.deck.filter(id => B.t.some(T => T && T.id === id && T.sao === 1 && !biKhoa(T) && !T.st.da && !(T.st.bang > 0))).length >= (c.lieu || 5); // --lieu 4: liều triệu hồi khi 4/5 loại có 1★ (80% ra cặp)
    const ai0 = aiBan; aiBan = function (B, dt) {
      let o = -1; // giữ ô trống: lượt bot này coi ô đó như đã có ụ (ụ giả không ghép được) → bot bỏ qua triệu hồi, vẫn ghép / power-up bình thường
      if (B.aiT - dt <= 0 && oTrong(B).length === 1 && !coCap(B) && !chacCap(B)) { o = B.t.indexOf(null); B.t[o] = { _gia: 1, id: B.deck[0], sao: 0, uid: -1, o, ban: B.i, nap: 0, st: { bang: 0, da: false, lua: 0, ngam: 0, kep: 0 }, buf: {} }; S.giuO = (S.giuO | 0) + 1; }
      trongAI++; try { return ai0.apply(this, arguments); } finally { trongAI--; if (o >= 0 && B.t[o] && B.t[o]._gia) B.t[o] = null; } };
    const hl0 = hopLeGhep; hopLeGhep = function (a, b) { if (a && b && (a._gia || b._gia)) return false; if (trongAI && a && b && cam.get(kh(a, b)) > G.t) return false; return hl0.apply(this, arguments); };
    const g0 = ghep; ghep = function (B, a, b) { if (!trongAI) return g0.apply(this, arguments); const k = kh(a, b), d0 = dau(G.ban[b.ban]); const r = g0.apply(this, arguments); if (dau(G.ban[b.ban]) === d0) { cam.set(k, G.t + 8); S.ket++; } return r; };
  }
  S.gr = mb(777 + c.hat * 104729); const r0 = Math.random; Math.random = S.gr;
  try {
    UI.chon = c.deck.slice(); UI.mv = c.mv || 'hero';
    if (c.che === 'thap') {
      const cd = CD.cauHinh('thap', c.tang); cd.hat = (cd.hat + c.hat * 7919) | 0;
      if (c.mana) cd.M = c.mana;
      CD.cho = cd; UI.che = 'solo'; batDau('solo', UI.chon, UI.mv);
      S.cd = { w0: G.cd.w0, w1: G.cd.w1, M: G.cd.M, trum: G.cd.trum || null }; G.cho = 1;
    } else if (c.che === 'dd') { // ĐƯỜNG ĐUA (chedo-dd.js): hạt h = hạt tuần + h·7919 (h = 0: đúng hạt game tuần này)
      const dd = DD.cauHinh(); dd.hat = (dd.hat + c.hat * 7919) | 0; DD.cho = dd; UI.che = 'coop'; batDau('coop', UI.chon, UI.mv); G.cho = 1;
    } else { UI.che = c.che; batDau(c.che, UI.chon, UI.mv); }
  } finally { Math.random = r0; }
  S.w0 = G.wave + 1; S.deck = G.ban.map(B => B.deck.join(','));
  window.__tiep = (n) => {
    const r = Math.random; Math.random = S.gr; let w = null, wv = -1;
    try {
      for (let i = 0; i < n && !G.ketThuc; i++) {
        capNhat(1 / 60); S.buoc++;
        if (G.wave !== wv) { wv = G.wave; w = W(wv); if (w.tim0 == null) { w.tim0 = G.ban[0].tim; w.mana0 = Math.round(G.ban[0].mana); } }
        let a = 0; const q = G.quai; for (let j = 0; j < q.length; j++) if (!q[j].chet) a++;
        if (a > w.dinh) w.dinh = a; if (a > S.dinh) { S.dinh = a; S.dinhW = wv; }
        if (S.buoc % 30 === 0) { try { FX.capNhat(0.5); } catch (e) { } try { if (VX.ds && VX.ds.length > 200) VX.reset(); } catch (e) { } }
      }
    } catch (e) { S.loi = String(e && e.stack || e).slice(0, 600); return true; } finally { Math.random = r; }
    if (G.ketThuc && !S.ra) S.ra = window.__kq1();
    return !!G.ketThuc;
  };
  window.__kq = () => S.ra || window.__kq1();
  window.__kq1 = () => {
    if (!G.ban.length) return { thang: !!(S.kq && S.kq.thang), ly: S.kq ? S.kq.ly : '', wave: S.kq ? S.kq.wave : 0, w0: S.w0, cd: S.cd, tim: 0, t: 0, buoc: S.buoc, dinh: S.dinh, dinhW: S.dinhW, mana: [], gia: [], pu: [], ban: [], w: S.w, loi: 'G.ban rỗng · ' + S.loi };
    const B = G.ban[0], k = S.kq || { thang: false, ly: 'chưa xong', wave: G.wave };
    return { dd: G.dd ? { diem: G.dd.diem, giet: G.dd.giet, t: Math.round(G.t - (G.dd.t0 || 0)) } : undefined, thang: k.thang, ly: k.ly, wave: k.wave, w0: S.w0, cd: S.cd, tim: B.tim, t: Math.round(G.t), buoc: S.buoc, dinh: S.dinh, dinhW: S.dinhW,
      mana: G.ban.map(b => Math.round(b.mana)), gia: G.ban.map(b => b.gia), pu: G.ban.map(b => b.deck.map(id => b.lv[id] - 1).join('')),
      ket: S.ket | 0, ban: G.ban.map(b => b.t.filter(Boolean).map(T => T.id + T.sao).sort().join(' ')), deck: S.deck, w: S.w, loi: S.loi };
  };
}

async function chayMot(ctx, c) { // khởi động trang đôi khi dọn G.ban sau khi trận đã bắt đầu (đua lúc nạp) → chạy lại
  for (let lan = 0; ; lan++) { const r = await chayMot1(ctx, c); if (lan >= 3 || !/^G\.ban rỗng/.test(r.loi || '')) return r; }
}
async function chayMot1(ctx, c) {
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  const t0 = Date.now();
  try {
    await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && G.rosterMap && typeof CD !== 'undefined' && typeof UI !== 'undefined', null, { timeout: 30000 });
    await p.waitForTimeout(300);
    await p.evaluate(trongTrang, c);
    let xong = false, n = 0;
    while (!xong && n < 400) { xong = await p.evaluate(() => window.__tiep(3000)); n++; }
    const r = await p.evaluate(() => window.__kq());
    r.giay = +((Date.now() - t0) / 1000).toFixed(1); if (errs.length) r.errs = errs.slice(0, 3);
    return r;
  } finally { await p.close(); }
}

const tenCa = (c) => c.ten || (c.che === 'thap' ? 'tầng ' + c.tang : c.che + (c.wave ? ' w' + c.wave : '')) + ' ' + c.deck.join(',');
function dong(c, bt, r) {
  const ws = Object.keys(r.w).map(Number).filter(w => !r.w[w].trum && r.w[w].sinh > 4), tb = ws.length ? Math.round(ws.reduce((s, w) => s + r.w[w].sinh, 0) / ws.length) : 0;
  return [bt.padEnd(5), tenCa(c).padEnd(46), 'hạt ' + c.hat, r.dd ? 'ĐƯỜNG ĐUA điểm ' + r.dd.diem + ' · diệt ' + r.dd.giet + ' · ' + r.dd.t + 's' : '', (r.thang ? 'THẮNG' : 'thua ') + ' w' + r.wave + (r.cd ? ' (' + r.cd.w0 + '–' + r.cd.w1 + ', M' + r.cd.M + ')' : ''), '♥' + r.tim,
    'đỉnh ' + r.dinh + '@w' + r.dinhW, 'quái/wave ~' + tb, 'mana ' + r.mana.join('/'), 'manaGiết≤30 ' + Object.keys(r.w).filter(w => +w <= 30).reduce((t, w) => t + (r.w[w].mn || 0), 0), 'pu ' + (r.pu || []).join('/'), r.ket ? 'kẹt×' + r.ket : '', r.t + 's', '[' + r.giay + 's]', r.loi ? 'LỖI ' + r.loi.slice(0, 120) : '', (r.errs || []).join(' | ').slice(0, 120)].join(' · ');
}

(async () => {
  let lo;
  if (A.lo) lo = JSON.parse(fs.readFileSync(A.lo, 'utf8'));
  else lo = [{ che: A.che || 'solo', tang: +(A.tang || 1), deck: (A.deck || 'tia,lien,sungluc,bang,set').split(','), deck2: A.deck2 ? A.deck2.split(',') : undefined, wave: +(A.wave || 0), mana: +(A.mana || 0), cap: +(A.cap || 0), mv: A.mv, max: +(A.max || 0), botgoc: +(A.botgoc || 0) }];
  if (A.lieu) for (const c of lo) c.lieu = +A.lieu;
  if (A.botgoc) for (const c of lo) c.botgoc = 1;
  const hat = (A.hat || '1,2').split(',').map(Number), bts = (A.bt || 'goc').split(',');
  const viec = [];
  for (const bt of bts) { if (bt !== 'goc' && !BT[bt] && !A.js) { console.error('không có biến thể ' + bt); process.exit(1); }
    for (const c0 of lo) for (const h of (c0.hat || hat)) viec.push([bt, Object.assign({}, c0, { hat: h, js: (bt !== 'goc' && BT[bt] ? BT[bt] + ';' : '') + (A.js || '') + ';' + (c0.js || ''), max: c0.max || +(A.max || 0) || (c0.che === 'thap' ? 0 : 100) })]); }
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(png|jpg|jpeg|webp|mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort()); // không cần ảnh / âm thanh
  const ra = []; let i = 0;
  const tho = async () => { while (i < viec.length) { const [bt, c] = viec[i++]; let r; try { r = await chayMot(ctx, c); } catch (e) { r = { thang: false, wave: 0, tim: 0, dinh: 0, dinhW: 0, mana: [], w: {}, t: 0, giay: 0, loi: String(e).slice(0, 300) }; }
    console.log(dong(c, bt, r));
    if (A.chitiet) for (const w in r.w) console.log('   w' + w, JSON.stringify(r.w[w]));
    if (A.chitiet) console.log('   bàn:', r.ban.join(' || '), '· power-up', r.pu.join('/'), '· giá triệu hồi', r.gia.join('/'));
    ra.push({ bt, ten: tenCa(c), ca: { che: c.che, tang: c.tang, deck: c.deck, deck2: c.deck2, wave: c.wave, mana: c.mana, cap: c.cap, hat: c.hat }, kq: r }); } };
  await Promise.all(Array.from({ length: Math.min(+(A.song || 2), viec.length) }, tho));
  await b.close();
  if (A.ra) { fs.mkdirSync(path.dirname(A.ra), { recursive: true }); fs.writeFileSync(A.ra, JSON.stringify(ra)); console.log('→ ' + A.ra); }
})();
