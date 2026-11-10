// ASTRAL ARSENAL — KIỂM BẢNG XẾP HẠNG (LEADERBOARD) — thap/js/chedo-d.js (BXH, CDDUI.bxh*), tuvan/che-do-d/THIET-KE.md §3 + §3.2 (rules đã publish)
//  KHÔNG chạm database thật: trình duyệt tự động → NET tắt (navigator.webdriver); bài này cắm FIREBASE GIẢ (stub NET._db / NET._fb) có bộ
//  GIẢ LẬP RULES §3.2: chỉ ghi ô uid của mình · chỉ trường n, av, w, t, k, at, v · n 1–16 · av ≤ 24 · w 1…51 (tw) / 1…999 · t ≥ 6·w, < 100000 ·
//  k = w·100000 + 99999 − t · at = ServerValue.TIMESTAMP ({'.sv':'timestamp'}) · v số · k chỉ tăng · đọc cần đăng nhập.
//  ✓ ghi turretmerge/lb/tw/{tuần}/{uid} · lb/vt/{tuần}/{uid} · lb/vtAll/{uid} đúng trường + công thức k, at = TIMESTAMP (rules giả nhận)
//  ✓ t < 6·w → nâng lên 6·w (k vẫn khớp) · w > 51 ở bảng tuần → 51 · tên dài → 16 ký tự · tên trống → "Pilot"
//  ✓ điểm thấp hơn trên máy chủ (k không tăng) → rules từ chối, giữ hàng chờ; đọc bảng thấy điểm mình ≥ → bỏ hàng chờ
//  ✓ trận thử (?mana / ?wave …) không gửi · trận tuần thật → gửi điểm khi mở bảng
//  ✓ đọc top 50 (orderByChild k, limitToLast 50), sắp giảm dần, dòng của mình tô sáng + "YOUR RANK #n"; ngoài top 50 → "50+"
//  ✓ lỗi quyền (đọc + ghi) / chưa đăng nhập / quá giờ → NOT CONNECTED + kỷ lục cá nhân, không lỗi trang, hàng chờ giữ để gửi lại
//  ✓ 3 tab (Tuần / Vô tận tuần / Vô tận mọi thời đại) ở bảng riêng HOME → EVENT → RANKS
//  Ảnh (SHOTS, mặc định /tmp/thap-bxh): 393×852 EN + VI.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-bxh.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-bxh';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// cắm Firebase giả vào trang (chạy trong trình duyệt)
function camStub(uid) {
  const DB = window.__DB = {}; const LOG = window.__LOG = [];
  window.__CHE = { docLoi: false, ghiLoi: false, treo: false };
  const TS = { '.sv': 'timestamp' };
  const loiQ = () => Object.assign(new Error('PERMISSION_DENIED: Permission denied'), { code: 'PERMISSION_DENIED' });
  const rules = (p, v, cu) => { // giả lập rules §3.2 — trả chuỗi lỗi hoặc ''
    let m = p.match(/^turretmerge\/lb\/(tw|vt)\/([^/]+)\/([^/]+)$/), bang, u;
    if (m) { bang = m[1]; u = m[3]; } else if ((m = p.match(/^turretmerge\/lb\/vtAll\/([^/]+)$/))) { bang = 'vtAll'; u = m[1]; } else return 'path';
    if (!NET.user || u !== NET.user.uid) return 'uid';
    if (!v || typeof v !== 'object') return 'obj';
    for (const k of Object.keys(v)) if (!['n', 'av', 'w', 't', 'k', 'at', 'v'].includes(k)) return 'la:' + k;
    for (const k of ['n', 'w', 't', 'k', 'at']) if (!(k in v)) return 'thieu:' + k;
    if (typeof v.n !== 'string' || v.n.length < 1 || v.n.length > 16) return 'n';
    if ('av' in v && (typeof v.av !== 'string' || v.av.length > 24)) return 'av';
    if (typeof v.w !== 'number' || v.w < 1 || v.w > 999 || (bang === 'tw' && v.w > 51)) return 'w';
    if (typeof v.t !== 'number' || v.t < v.w * 6 || v.t >= 100000) return 't';
    if (typeof v.k !== 'number' || v.k !== v.w * 100000 + 99999 - v.t) return 'k';
    if (JSON.stringify(v.at) !== JSON.stringify(TS)) return 'at';
    if ('v' in v && typeof v.v !== 'number') return 'v';
    if (cu && !(v.k > cu.k)) return 'k-giam';
    return '';
  };
  const snap = (ds) => ({ forEach(f) { for (const [key, val] of ds) if (f({ key, val: () => val }) === true) break; }, val: () => Object.fromEntries(ds) });
  const ref = (p) => {
    if (!/^turretmerge\/lb(\/|$)/.test(p)) { // phần khác của game (hồ sơ, đồng bộ…): bỏ qua, không ghi gì
      const z = { set: () => Promise.resolve(), update: () => Promise.resolve(), remove: () => Promise.resolve(), once: () => Promise.resolve(snap([])), on() { }, off() { },
        transaction: () => Promise.resolve({ committed: false }), onDisconnect: () => ({ set: () => Promise.resolve(), remove: () => Promise.resolve(), cancel: () => Promise.resolve() }),
        orderByChild: () => z, orderByKey: () => z, startAt: () => z, limitToLast: () => z, push: () => ({ key: 'k' + Date.now() }) };
      return z;
    }
    const q = { _o: null, _n: 0,
      update() { return Promise.reject(loiQ()); }, remove() { return Promise.reject(loiQ()); },
      set(v) {
        LOG.push({ op: 'set', p, v: JSON.parse(JSON.stringify(v)) });
        if (window.__CHE.ghiLoi) return Promise.reject(loiQ());
        const l = rules(p, v, DB[p]); if (l) { LOG[LOG.length - 1].tuChoi = l; return Promise.reject(loiQ()); }
        DB[p] = Object.assign({}, v, { at: Date.now() }); return Promise.resolve();
      },
      orderByChild(k) { q._o = k; return q; }, limitToLast(n) { q._n = n; return q; },
      once() {
        LOG.push({ op: 'read', p, o: q._o, n: q._n });
        if (window.__CHE.treo) return new Promise(() => { });
        if (window.__CHE.docLoi || !NET.user) return Promise.reject(loiQ());
        let ds = Object.entries(DB).filter(([k]) => k.startsWith(p + '/') && !k.slice(p.length + 1).includes('/')).map(([k, v]) => [k.slice(p.length + 1), v]);
        ds.sort((a, b) => a[1][q._o] - b[1][q._o]); if (q._n) ds = ds.slice(-q._n);
        return Promise.resolve(snap(ds));
      } };
    return q;
  };
  NET._fb = { database: { ServerValue: { TIMESTAMP: TS } } };
  NET._db = { ref: (p) => ref(p === undefined ? '' : p), goOnline() { }, goOffline() { } };
  NET.kieu = 'firebase'; NET.ok = true; NET.user = { uid, anon: true };
  BXH._c = {};
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const mo = async (vp, lang) => {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); p.setDefaultTimeout(120000); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); localStorage.setItem('tm_lang', lang); }, lang);
    await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof BXH !== 'undefined' && G.roster && G.roster.length, null, { timeout: 90000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 120000 }).catch(() => { });
    await sleep(800);
    ok(await p.evaluate(() => NET.kieu !== 'firebase' && !NET._db), 'trình duyệt tự động: NET thật không bật (không chạm database thật)');
    await p.evaluate(() => { TT.st().xp = TT.xpTong(8); KT.luu(true); UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); HM.ve(); CDDC.lb.choMs = 1500; });
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  const doiDs = (p) => p.waitForFunction(() => { const e = document.getElementById('cdd-ds'); return e && !/LOADING|ĐANG TẢI/.test(e.textContent); }, null, { timeout: 15000 });

  let { ctx, p, errs } = await mo({ width: 393, height: 852 }, 'en');
  // 1) chưa cắm stub → ngoại tuyến
  await p.evaluate(() => CDDUI.bxhMo('tw')); await doiDs(p);
  let r = await p.evaluate(() => document.querySelector('#tt-phu').textContent);
  ok(/NOT CONNECTED/.test(r) && /YOUR RANK/.test(r), 'chưa có mạng: NOT CONNECTED + kỷ lục cá nhân', r.slice(0, 200));
  await p.evaluate(() => TTUI.dong());
  // 2) cắm stub + ghi
  await p.evaluate(camStub, 'uMe');
  await p.evaluate(() => { TK.ho.name = 'Tester'; TK.ho.av = 'laser'; BXH.ghi('tw', 16, 200); });
  await sleep(300);
  r = await p.evaluate(() => { const tu = KT.tuan(), k = 'turretmerge/lb/tw/' + tu + '/uMe'; return { tu, db: window.__DB[k], log: window.__LOG.slice(-1)[0], cho: CDD.st().lb.tw }; });
  const v = r.log && r.log.v;
  ok(r.log && r.log.p === 'turretmerge/lb/tw/' + r.tu + '/uMe' && !r.log.tuChoi && r.db, 'ghi đúng đường turretmerge/lb/tw/{tuần}/{uid}, rules giả nhận', JSON.stringify(r));
  ok(v && Object.keys(v).sort().join() === 'at,av,k,n,t,v,w' && v.n === 'Tester' && v.av === 'laser' && v.w === 16 && v.t === 200 && v.v === 1, 'đúng trường n, av, w, t, k, at, v', JSON.stringify(v));
  ok(v && v.k === 16 * 100000 + 99999 - 200 && JSON.stringify(v.at) === '{".sv":"timestamp"}', 'k = w·100000 + 99999 − t (' + (v && v.k) + ') · at = ServerValue.TIMESTAMP', JSON.stringify(v));
  ok(!r.cho, 'gửi xong → bỏ hàng chờ', JSON.stringify(r.cho));
  // 3) t < 6·w, w > 51, tên dài
  r = await p.evaluate(async () => { TK.ho.name = 'Người chơi có tên rất là dài quá'; BXH.ghi('tw', 60, 30); await new Promise(o => setTimeout(o, 200)); return window.__LOG.slice(-1)[0]; });
  ok(!r.tuChoi && r.v.w === 51 && r.v.t === 306 && r.v.k === 51 * 100000 + 99999 - 306 && Array.from(r.v.n).length === 16, 'w 60 → 51 (bảng tuần) · t 30 → 6·w = 306 · tên → 16 ký tự · rules nhận', JSON.stringify(r));
  r = await p.evaluate(async () => { TK.ho.name = '   '; BXH.ghi('vt', 85, 1500); BXH.ghi('vtAll', 85, 1500); await new Promise(o => setTimeout(o, 200)); const tu = KT.tuan(); return { a: window.__DB['turretmerge/lb/vt/' + tu + '/uMe'], b: window.__DB['turretmerge/lb/vtAll/uMe'], l: window.__LOG.slice(-2).map(x => x.tuChoi || '') }; });
  ok(r.a && r.b && r.a.n === 'Pilot' && r.a.w === 85 && r.b.k === 85 * 100000 + 99999 - 1500 && r.l.join('') === '', 'Vô tận: ghi lb/vt/{tuần}/{uid} + lb/vtAll/{uid} · tên trống → "Pilot"', JSON.stringify(r));
  // 4) điểm thấp hơn máy chủ → rules từ chối, giữ hàng chờ; đọc bảng → bỏ hàng chờ
  r = await p.evaluate(async () => { TK.ho.name = 'Tester'; BXH.ghi('tw', 20, 300); await new Promise(o => setTimeout(o, 200)); return { l: window.__LOG.slice(-1)[0].tuChoi, cho: CDD.st().lb.tw, loi: BXH.loi }; });
  ok(r.l === 'k-giam' && r.cho && r.cho.w === 20 && /PERMISSION/.test(r.loi), 'k không tăng → rules từ chối (PERMISSION_DENIED), giữ hàng chờ, không lỗi trang', JSON.stringify(r));
  // 5) đọc: 60 người khác + mình
  await p.evaluate(() => { const tu = KT.tuan(); for (let i = 0; i < 60; i++) { const w = 2 + Math.floor(i * 49 / 59), t = 400 + i; window.__DB['turretmerge/lb/tw/' + tu + '/o' + i] = { n: 'Rival ' + i, av: 'laser', w, t, k: w * 100000 + 99999 - t, at: 1, v: 1 }; } for (let i = 0; i < 8; i++) { const w = 70 + i * 3, t = 900; window.__DB['turretmerge/lb/vtAll/a' + i] = { n: 'Ace ' + i, av: 'laser', w, t, k: w * 100000 + 99999 - t, at: 1, v: 1 }; window.__DB['turretmerge/lb/vt/' + tu + '/a' + i] = { n: 'Ace ' + i, av: 'laser', w: w - 1, t, k: (w - 1) * 100000 + 99999 - t, at: 1, v: 1 }; } window.__DB['turretmerge/lb/tw/' + tu + '/uMe'] = { n: 'Tester', av: 'laser', w: 3, t: 100, k: 3 * 100000 + 99999 - 100, at: 1, v: 1 }; delete CDD.st().lb.tw; CDD.st().tw.best = 3; CDD.st().tw.bestT = 100; BXH._c = {}; });
  await p.evaluate(() => CDDUI.bxhMo('tw')); await doiDs(p);
  r = await p.evaluate(() => ({ rd: window.__LOG.filter(x => x.op === 'read').slice(-1)[0], n: document.querySelectorAll('#cdd-ds .cdd-h').length, toi: document.getElementById('cdd-toi').textContent, dau: document.querySelector('#cdd-ds .cdd-h').textContent, cho: CDD.st().lb.tw, tab: [...document.querySelectorAll('#tt-phu .cdd-tb')].map(x => x.dataset.id).join() }));
  ok(r.rd && r.rd.o === 'k' && r.rd.n === 50, 'đọc orderByChild("k").limitToLast(50)', JSON.stringify(r.rd));
  ok(r.n === 51 && /50\+/.test(r.toi) && /WAVE 3/.test(r.toi) && /Rival 59/.test(r.dau) && /CLEAR/.test(r.dau), 'top 50 giảm dần (đầu: Rival 59 CLEAR) + dòng mình ngoài top: YOUR RANK 50+ · YOUR BEST WAVE 3', JSON.stringify(r));
  ok(r.tab === 'tw,vt,vtAll', 'bảng riêng có 3 tab Tuần / Vô tận tuần / Vô tận mọi thời đại', r.tab);
  // mình vào top: điểm cao
  await p.evaluate(async () => { const tu = KT.tuan(); CDD.st().tw.best = 51; CDD.st().tw.bestT = 900; delete CDD.st().lb.tw; BXH.ghi('tw', 51, 900); await new Promise(o => setTimeout(o, 200)); BXH._c = {}; });
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-tab"][data-id="vt"]').click()); await doiDs(p);
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-tab"][data-id="tw"]').click()); await doiDs(p);
  r = await p.evaluate(() => ({ toi: document.getElementById('cdd-toi').textContent, minh: (document.querySelector('#cdd-ds .cdd-h.toi') || {}).textContent, n: document.querySelectorAll('#cdd-ds .cdd-h.toi').length, cho: CDD.st().lb.tw || null }));
  ok(/#2(?!\d)/.test(r.toi) && /^2/.test(r.minh) && /CLEAR/.test(r.minh) && r.n === 1 && !r.cho, 'mình CLEAR (51, chậm hơn Rival 59) → dòng tô sáng hạng 2 + YOUR RANK #2 (hoà wave → thời gian ngắn hơn đứng trên)', JSON.stringify(r));
  await chup(p, '393-en-bxh-tuan');
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-tab"][data-id="vtAll"]').click()); await doiDs(p);
  r = await p.evaluate(() => ({ toi: document.getElementById('cdd-toi').textContent, ds: [...document.querySelectorAll('#cdd-ds .cdd-h')].map(x => x.textContent).join('|') }));
  ok(/#\d/.test(r.toi) && /Ace 7/.test(r.ds.split('|')[0]) && /Pilot|Tester/.test(r.ds), 'tab Vô tận mọi thời đại: Ace 7 đứng đầu, có dòng của mình + hạng', JSON.stringify(r).slice(0, 300));
  await chup(p, '393-en-bxh-vtall');
  // dọn hàng chờ khi điểm máy chủ ≥ điểm chờ
  r = await p.evaluate(async () => { CDD.st().lb.vtAll = { w: 50, t: 999, tuan: KT.tuan() }; BXH._c = {}; await BXH.doc('vtAll'); return CDD.st().lb.vtAll || null; });
  ok(!r, 'hàng chờ thấp hơn điểm của mình trên máy chủ → bỏ (khỏi bị từ chối mãi)', JSON.stringify(r));
  await p.evaluate(() => TTUI.dong());
  // 6) lỗi quyền đọc + ghi → ngoại tuyến
  await p.evaluate(() => { window.__CHE.docLoi = true; window.__CHE.ghiLoi = true; BXH._c = {}; CDD.st().lb.vt = { w: 99, t: 2000, tuan: KT.tuan() }; CDD.st().vt.tBest = 99; CDD.st().vt.tBestT = 2000; });
  await p.evaluate(() => CDDUI.bxhMo('vt')); await doiDs(p);
  r = await p.evaluate(() => ({ t: document.querySelector('#tt-phu').textContent, cho: CDD.st().lb.vt, loi: BXH.loi }));
  ok(/NOT CONNECTED/.test(r.t) && /WAVE 99/.test(r.t) && r.cho && r.cho.w === 99 && /PERMISSION/.test(r.loi), 'lỗi quyền → NOT CONNECTED + kỷ lục cá nhân (WAVE 99), hàng chờ giữ', JSON.stringify(r).slice(0, 300));
  await chup(p, '393-en-bxh-loi-quyen');
  await p.evaluate(() => TTUI.dong());
  // quá giờ / chưa đăng nhập
  await p.evaluate(() => { window.__CHE.docLoi = false; window.__CHE.treo = true; BXH._c = {}; CDDUI.bxhMo('tw'); });
  await doiDs(p); r = await p.evaluate(() => document.getElementById('cdd-ds').textContent);
  ok(/NOT CONNECTED/.test(r), 'đọc treo quá giờ → NOT CONNECTED', r);
  await p.evaluate(() => { TTUI.dong(); window.__CHE.treo = false; window.__CHE.ghiLoi = false; NET.user = null; BXH._c = {}; CDDUI.bxhMo('tw'); });
  await doiDs(p); r = await p.evaluate(() => document.getElementById('cdd-ds').textContent);
  ok(/NOT CONNECTED/.test(r), 'chưa đăng nhập → NOT CONNECTED', r);
  await p.evaluate(() => { TTUI.dong(); NET.user = { uid: 'uMe', anon: true }; });
  // gửi lại hàng chờ khi mở bảng (mạng có lại)
  r = await p.evaluate(async () => { BXH._c = {}; await BXH.doc('vt'); await new Promise(o => setTimeout(o, 200)); return { db: window.__DB['turretmerge/lb/vt/' + KT.tuan() + '/uMe'], cho: CDD.st().lb.vt || null }; });
  ok(r.db && r.db.w === 99 && !r.cho, 'mạng có lại: mở bảng → gửi lại hàng chờ (WAVE 99)', JSON.stringify(r));
  // 7) trận thử không gửi; trận tuần thật gửi
  r = await p.evaluate(async () => { const n = window.__LOG.length; G.debug.mana = 999; BXH.ghi('tw', 51, 500); delete G.debug.mana; await new Promise(o => setTimeout(o, 200)); return window.__LOG.length - n; });
  ok(r === 0, 'trận thử (?mana=) không gửi điểm', String(r));
  await p.evaluate(() => { const s = CDD.st().tw; s.best = 0; s.bestT = 0; s.nhan = {}; KT.luu(true); delete window.__DB['turretmerge/lb/tw/' + KT.tuan() + '/uMe']; HM.chonChe('tw'); HM.choi(); });
  await sleep(800);
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-tw-vao"]').click());
  await p.waitForFunction(() => G.ban.length && G.tw && !G.ketThuc, null, { timeout: 120000 }); await sleep(400);
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.dung = false; let n = 0; while (!G.ketThuc && G.wave < 12 && n < 30 * 60 * 20) { capNhat(1 / 30); G.ban[0].tim = 3; for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } n++; } G.ban[0].tim = 0; ketThuc(false, 'The core fell'); });
  await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 60000 }); await sleep(600);
  r = await p.evaluate(async () => { await BXH.gui(); await new Promise(o => setTimeout(o, 200)); return { db: window.__DB['turretmerge/lb/tw/' + KT.tuan() + '/uMe'], w: G.wave, t: Math.round(G.t) }; });
  ok(r.db && r.db.w === 12 && r.db.t === Math.max(72, r.t) && r.db.k === 12 * 100000 + 99999 - r.db.t, 'trận tuần thật (wave 12) → điểm lên bảng tuần: w 12, t = giây trận, k khớp', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang (EN)', errs.slice(0, 3).join(' | '));
  await ctx.close();

  // ---------- VI: ảnh bảng có dữ liệu ----------
  ({ ctx, p, errs } = await mo({ width: 393, height: 852 }, 'vi'));
  await p.evaluate(camStub, 'uMe');
  await p.evaluate(async () => { const tu = KT.tuan(); for (let i = 0; i < 12; i++) { const w = 10 + i * 3, t = 600 + i; window.__DB['turretmerge/lb/tw/' + tu + '/o' + i] = { n: 'Đối thủ ' + i, av: 'laser', w, t, k: w * 100000 + 99999 - t, at: 1, v: 1 }; } TK.ho.name = 'Phi công'; CDD.st().tw.best = 30; CDD.st().tw.bestT = 700; BXH.ghi('tw', 30, 700); await new Promise(o => setTimeout(o, 200)); BXH._c = {}; });
  await p.evaluate(() => KTUI.moTab('sk')); await sleep(500);
  await p.evaluate(() => document.querySelector('#kt-than [data-act="cdd-lb"]').click()); await doiDs(p);
  r = await p.evaluate(() => document.querySelector('#tt-phu').textContent);
  ok(/BẢNG XẾP HẠNG/.test(r) && /HẠNG CỦA BẠN/.test(r) && /#\d/.test(r), 'tiếng Việt: EVENT → HẠNG mở bảng xếp hạng (có hạng của mình)', r.slice(0, 200));
  await chup(p, '393-vi-bxh-tuan');
  await p.evaluate(() => { HM.chonChe('tw'); HM.choi(); }); await doiDs(p); await chup(p, '393-vi-man-tuan-bxh');
  ok(!errs.length, 'không lỗi trang (VI)', errs.slice(0, 3).join(' | '));
  await ctx.close();
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Bảng xếp hạng đạt'); process.exit(loi ? 1 : 0);
})();
