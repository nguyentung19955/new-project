// TURRET MERGE — kiểm TRÀN / MÉO / CUỘN NGANG / TIÊU ĐỀ BỊ ĐÈ trên MỌI màn, ở 360×780, 390×844, 430×932.
// Báo: chữ tràn tấm/nút/thẻ · ảnh méo (> 3% so với tỉ lệ gốc) · trang hoặc danh sách cuộn dọc bị tràn ngang · thanh cuộn
//      hệ thống lộ ra · tiêu đề nhóm (sticky) bị thẻ đè · nhảy bố cục khi chọn thẻ · lỗi trang.
// Chạy (gốc repo):  python3 -m http.server 8765 &
//                   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &   (màn sảnh + ONLINE)
//                   [OUT=docs/demo-hop-tuong/tuvan/tran/sau/] node tools/thap-kt-tran.js
// Thoát mã 1 nếu còn lỗi.
const { chromium } = require('playwright');
const fs = require('fs');
const DO = require('./thap-kt-tran-do.js');
const { KT_VACH } = require('./thap-kt-vach.js'); // khung độ hiếm: chân dung gọn trong ô cửa sổ, khung không méo (vạch khung cắt ngang mặt)
const OUT = process.env.OUT || '';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const MOCK = +(process.env.MOCK || 8787);
const SIZES = (process.env.SIZES || '360x780,390x844,430x932').split(',').map(s => s.split('x').map(Number));
const DECK = 'canon,bang,tia,set,lien';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const MENU = BASE + '?notut=1';
const TRAN = (m, x) => `${BASE}?mode=${m}&deck=${DECK}&deck2=drone,bao,kiembang,hydra,anhsang&wave=7&fill=15&mana=260&notut=1&nointro=1${x || ''}`;
const cuon = (p, f) => p.evaluate((f) => { const l = document.getElementById('chon-luoi'); if (l) l.scrollTop = (l.scrollHeight - l.clientHeight) * f; }, f);
const ctHM = (p, js) => p.evaluate(js);
// ô đầu có ụ trên bàn mình → toạ độ màn hình
const oCoU = (p) => p.evaluate(() => { const B = G.ban[0], i = B.t.findIndex(Boolean); if (i < 0) return null; const c = B.o[i], r = document.getElementById('cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height]; });

// mỗi màn: url + các bước; mỗi bước đo + chụp
const MAN = [
  { ten: 'home', url: MENU, buoc: [['home', p => ctHM(p, () => HM.di('hm'))], ['home_mode', p => ctHM(p, () => HM.moChe())], ['settings', p => ctHM(p, () => { HM.dong(true); HM.moCai(); })]] },
  { ten: 'deck', url: MENU, buoc: [
    ['deck_top', p => ctHM(p, () => { HM.di('dk'); })],
    ['deck_giua', p => cuon(p, 0.45)],
    ['deck_cuoi', p => cuon(p, 1)],
    ['deck_mythic', p => p.evaluate(() => { const l = document.getElementById('chon-luoi'), h = [...l.querySelectorAll('.nhom')].pop(); if (h) l.scrollTop = h.offsetTop - 40; })],
    ['deck_filter', p => ctHM(p, () => HM.moLoc())],
    ['deck_loc_atk', p => ctHM(p, () => { BOBAI.loc.vai = 'tc'; BOBAI.ap(); HM.locLai(); })],
    ['deck_presets', p => ctHM(p, () => { BOBAI.loc.vai = 'all'; BOBAI.ap(); HM.dong(true); HM.moPre(); })],
    ['deck_cmd', p => ctHM(p, () => { HM.dong(true); HM.moMVs(); })],
    ['deck_xem', p => ctHM(p, () => { HM.dong(true); HM.moXem('blackhole'); })],
    ['deck_5the', p => ctHM(p, () => { HM.dong(true); UI.chon = ['canon', 'bang', 'tia', 'set', 'blackhole']; UI.veBoChon(); HM.ve(); })],
    ['collection', p => ctHM(p, () => { HM.di('dk', true); const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight * 0.3; })],
    // tiếng Việt: tên/kỹ năng dài hơn (roster ten_vi / kyNang_vi)
    ['deck_vi', p => p.evaluate(() => { for (const r of G.roster) if (r.ten_vi) { r.ten = r.ten_vi; r.kyNang = r.kyNang_vi || r.kyNang; if (TEXT.turret[r.id]) { TEXT.turret[r.id].name = r.ten_vi; TEXT.turret[r.id].skill = r.kyNang; } } HM.di('dk'); UI.veChon(); HM.noi = 'lophanung'; HM.ve(); const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight * 0.5; })],
    ['deck_vi_xem', p => ctHM(p, () => HM.moXem('lophanung'))],
    ['unit_vi', p => ctHM(p, () => { HM.dong(true); UP.mo('lophanung'); })],
  ] },
  { ten: 'unit', url: MENU, buoc: [
    ['unit_common', p => ctHM(p, () => { HM.di('dk'); UP.mo('canon'); })],
    ['unit_mythic', p => ctHM(p, () => { UP.ve('blackhole', 0); })],
    ['unit_details', p => ctHM(p, () => UP.moTam('ct'))],
    ['test_range', p => ctHM(p, () => { UP.dongTam(true); UP.moTam('ts'); })],
    ['commander', p => ctHM(p, () => { UP.dongTam(true); UP.dong(); UP.moMV('hero'); })],
  ] },
  ...['solo', 'coop', 'pvp'].map(m => ({ ten: 'boss_' + m, url: `${BASE}?mode=${m}&deck=${DECK}&notut=1`, cho: 2600, buoc: [['boss_' + m, async () => { }]] })),
  ...['solo', 'coop', 'pvp'].map(m => ({ ten: 'tran_' + m, url: TRAN(m), buoc: [
    ['tran_' + m, async p => { await p.evaluate(() => { G.dung = true; const b = document.querySelector('#bang-wave'); if (b) b.hidden = true; }); }],
    ['tran_' + m + '_bang_wave', p => p.evaluate(() => { UI.bangWave(1, false); })],
    ['tran_' + m + '_bang_trum', p => p.evaluate(() => { UI.bangWave(10, true); })],
    ['tran_' + m + '_canh_bao', p => p.evaluate(() => { document.querySelector('#bang-wave').hidden = true; UI.canhBaoTrum(TRUM_THU_TU[0]); })],
    ['tran_' + m + '_xem', p => p.evaluate(() => { document.querySelector('#canh-bao').hidden = true; const T = G.ban[0].t.find(Boolean); UI.moTT(T.id, T); })],
    ['tran_' + m + '_rong', p => p.evaluate(() => { const T = G.ban[0].t.find(Boolean); HB.moRong(true); })],
    ['tran_' + m + '_ten_dai', p => p.evaluate(() => { const T = G.ban[0].t.find(Boolean); HB.moRong(false); UI.moTT('nemesis', T); HB.moRong(true); })],
    ['tran_' + m + '_dung', p => p.evaluate(() => { HB.dongHet(); document.querySelector('[data-act="dung"]').click(); })],
    ['ketqua_' + m + '_thang', p => p.evaluate(() => { document.getElementById('dung').hidden = true; G.dung = false; ketThuc(true); })],
    ['ketqua_' + m + '_thua', p => p.evaluate(() => { document.getElementById('ketqua').hidden = true; G.ketThuc = false; G.het = false; ketThuc(false, TEXT.end.coreDown); })],
  ] })),
];

const doDu = async (p) => {
  let r = await p.evaluate(DO);
  const can = await p.evaluate(() => [...(window.__KT_CAN || [])]);
  if (can.length) {
    await p.evaluate(async (us) => { window.__KT_NAT = window.__KT_NAT || {}; await Promise.all(us.map(u => new Promise(ok => { const i = new Image(); i.onload = () => { __KT_NAT[u] = [i.naturalWidth, i.naturalHeight]; ok(); }; i.onerror = ok; i.src = u; }))); window.__KT_CAN = new Set(); }, can);
    r = await p.evaluate(DO);
  }
  r.vach = (await p.evaluate(KT_VACH)).hong;
  return r;
};

(async () => {
  const b = await chromium.launch();
  const bao = {}, errs = [];
  let tong = 0;
  const ghi = (W, ten, r) => {
    for (const k of Object.keys(r)) for (const s of r[k]) { const key = k + ' | ' + s; (bao[key] = bao[key] || []).push(W + ':' + ten); tong++; }
  };
  const moCtx = async (W, H) => {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: +(process.env.DPR || (OUT ? 2 : 1)), hasTouch: false });
    await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
    return ctx;
  };
  const nghe = (p, W, ten) => {
    p.on('pageerror', e => errs.push(W + ' ' + ten + ' :: ' + e.message));
    p.on('console', x => { if (x.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(x.text())) errs.push(W + ' ' + ten + ' :: console ' + x.text()); });
  };
  const CHUP = process.env.CHUP ? new RegExp(process.env.CHUP) : /./;
  const chup = (p, W, ten) => OUT && CHUP.test(ten) ? p.screenshot({ path: `${OUT}${W}_${ten}.jpg`, type: 'jpeg', quality: 72 }) : null;
  for (const [W, H] of SIZES) {
    const ctx = await moCtx(W, H);
    for (const m of MAN) {
      const p = await ctx.newPage(); nghe(p, W, m.ten);
      await p.goto(m.url, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 30000 }).catch(() => { });
      await sleep(m.cho || 1800);
      for (const [ten, f] of m.buoc) {
        try { await f(p); } catch (e) { errs.push(W + ' ' + ten + ' :: bước lỗi ' + e.message); }
        await sleep(/ketqua|boss_/.test(ten) ? 1600 : /bang_|canh_/.test(ten) ? 300 : 500);
        ghi(W, ten, await doDu(p)); await chup(p, W, ten);
      }
      // nhảy bố cục: chọn 1 thẻ trong lưới bộ bài không được dời các thẻ khác
      if (m.ten === 'deck') {
        const nhay = await p.evaluate(async () => {
          HM.dong(true); HM.di('dk'); const l = document.getElementById('chon-luoi'); l.scrollTop = 0; UI.chon = []; UI.veBoChon(); HM.ve();
          await new Promise(r => setTimeout(r, 300));
          const vt = () => [...l.querySelectorAll('.c[data-id]')].slice(0, 12).map(c => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; });
          const a = vt(), st = l.scrollTop; HM.them(l.querySelector('.c[data-id]').dataset.id);
          await new Promise(r => setTimeout(r, 500));
          const c = vt(); let d = 0; a.forEach((x, i) => { d = Math.max(d, Math.abs(x[0] - c[i][0]), Math.abs(x[1] - c[i][1])); });
          return { d, st, st2: l.scrollTop };
        });
        if (nhay.d > 1) ghi(W, 'deck_chon_the', { nhay: ['lưới nhảy ' + nhay.d + 'px khi thêm thẻ (cuộn ' + nhay.st + '→' + nhay.st2 + ')'] });
      }
      await p.close();
    }
    await ctx.close();
    // sảnh + trận ONLINE (máy chủ giả)
    const ok = await fetch(`http://localhost:${MOCK}/`).then(() => true).catch(() => false);
    if (!ok) { errs.push(W + ' online :: chưa chạy máy chủ giả cổng ' + MOCK); continue; }
    const URL = `${BASE}?net=mock&mockws=ws://localhost:${MOCK}&nointro=1&notut=1`;
    const mo = async (ten, deck) => {
      const c = await moCtx(W, H), p = await c.newPage(); nghe(p, W, ten);
      await p.goto(URL, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && NET.ok && typeof ONL !== 'undefined', null, { timeout: 30000 });
      await p.evaluate((d) => { UI.chon = d; UI.veBoChon(); HM.ve(); }, deck); await sleep(500);
      return { c, p };
    };
    const A = await mo('A', DECK.split(',')), B = await mo('B', ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
    try {
      await A.p.evaluate(() => ONL.moBang()); await sleep(400);
      ghi(W, 'online_bang', await doDu(A.p)); await chup(A.p, W, 'online_bang');
      await A.p.click('[data-act="onl-tao"]');
      await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
      const code = await A.p.textContent('#sanh-ma');
      await sleep(400); ghi(W, 'lobby_cho', await doDu(A.p)); await chup(A.p, W, 'lobby_cho');
      await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await B.p.click('[data-act="onl-vao"]');
      await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
      await A.p.click('#sanh-san'); await sleep(400);
      ghi(W, 'lobby_ready', await doDu(A.p)); await chup(A.p, W, 'lobby_ready');
      await B.p.click('#sanh-san');
      await A.p.waitForFunction(() => typeof ONS !== 'undefined' && ONS.on && G.ban.length === 2, null, { timeout: 15000 });
      await sleep(2500);
      ghi(W, 'tran_online', await doDu(A.p)); await chup(A.p, W, 'tran_online');
    } catch (e) { errs.push(W + ' online :: ' + e.message); }
    await A.c.close(); await B.c.close();
  }
  await b.close();
  const ds = Object.entries(bao).sort();
  for (const [k, v] of ds) console.log(k + '   [' + v.length + '× ' + [...new Set(v)].slice(0, 4).join(', ') + (v.length > 4 ? ', …' : '') + ']');
  console.log('\nTỔNG LỖI: ' + ds.length + ' loại (' + tong + ' lần)  ·  LỖI TRANG: ' + errs.length);
  for (const e of errs) console.log('  ERR ' + e);
  process.exit(ds.length || errs.length ? 1 : 0);
})();
