// TURRET MERGE — kiểm "mở LINK MỜI CO-OP → vào thẳng sảnh READY" (máy chủ GIẢ, nhiều trình duyệt, bộ nhớ trống).
// Chạy:  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &
//        OUT=docs/demo-hop-tuong/tuvan/moi/ NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-moi.js
// Kiểm: A tạo phòng → SHARE ra ?room=ABCD + chữ 'Join my TURRET MERGE co-op room ABCD' · B mở link LẠNH (bộ nhớ trống):
//       không hướng dẫn / không trận SOLO, màn tải → sảnh 2 thẻ + READY, mã bị gỡ khỏi URL, A thấy B · DECK từ sảnh rồi ‹ về sảnh
//       · cả 2 READY → trận · B mở lại link giữa trận → vào lại trận · C mở link phòng đầy → báo đầy · mã sai → báo + CREATE A NEW ROOM / HOME.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/moi/';
const PORT = +(process.env.PORT || 8787);
const GOC = `http://localhost:${PORT}/thap/`;
const NETQ = `net=mock&mockws=ws://localhost:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ok = [], hong = [], errs = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? 'OK   ' : 'FAIL ') + s); };
const hien = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!(e && !e.hidden && e.getClientRects().length && getComputedStyle(e).display !== 'none'); }, sel);

(async () => {
  const b = await chromium.launch();
  const ctxMoi = async (ten) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(ten + ' :: ' + e.message));
    p.on('console', x => { if (x.type() === 'error') errs.push(ten + ' :: console ' + x.text()); });
    return { ctx, p, ten };
  };
  // ---- A: chủ phòng (đã chơi trước: có bộ bài) ----
  const A = await ctxMoi('A');
  await A.p.goto(GOC + '?' + NETQ + '&notut=1&nointro=1', { waitUntil: 'load' });
  await A.p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok && TAI.daBoot, null, { timeout: 30000 });
  await A.p.evaluate(() => { UI.chon = ['canon', 'bang', 'lien', 'laser', 'doc']; UI.veBoChon(); });
  await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
  await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
  const code = await A.p.textContent('#sanh-ma');
  // SHARE LINK: bắt navigator.share
  await A.p.evaluate(() => { window._chiaSe = null; navigator.share = (d) => { window._chiaSe = d; return Promise.resolve(); }; });
  await A.p.click('[data-act="onl-chiase"]');
  const cs = await A.p.evaluate(() => window._chiaSe);
  kt(cs && /\?room=[A-Z]{4}$/.test(cs.url) && cs.text === 'Join my TURRET MERGE co-op room ' + code, 'SHARE LINK: ' + (cs && cs.text) + ' · ' + (cs && cs.url));
  const link = cs.url.replace('?room=', '?' + NETQ + '&room='); // bài kiểm: thêm máy chủ giả
  await A.p.screenshot({ path: OUT + '01_A_sanh_cho.png' });

  // ---- B: mở link LẠNH (bộ nhớ trống, chưa từng chơi) ----
  const B = await ctxMoi('B');
  const t0 = Date.now();
  await B.p.goto(link, { waitUntil: 'commit' });
  let thayTai = false;
  for (let i = 0; i < 80 && !thayTai; i++) { thayTai = await hien(B.p, '#tai').catch(() => false); if (!thayTai) await sleep(50); }
  await B.p.waitForFunction(() => { const s = document.getElementById('onl-sanh'); return s && !s.hidden && document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2; }, null, { timeout: 30000 });
  const tB = Date.now() - t0;
  const sB = await B.p.evaluate(() => ({ hd: !!(HD && HD.dang), ban: G.ban.length, url: location.href, tai: !document.getElementById('tai') || document.getElementById('tai').hidden, bang: !!document.querySelector('#onl-bang:not([hidden])'), deck: UI.chon.length, nut: document.getElementById('sanh-san').textContent, hdXong: HD.moKhoa() }));
  kt(thayTai, 'B: có màn tải khi mở link');
  kt(!sB.hd && sB.ban === 0, 'B: không chạy hướng dẫn / trận SOLO (HD.dang=' + sB.hd + ', G.ban=' + sB.ban + ')');
  kt(sB.tai && !sB.bang && sB.nut === 'READY' && sB.deck === 5, 'B: vào thẳng SẢNH (2 thẻ + nút READY, không bảng CREATE ROOM), sau ' + tB + ' ms');
  kt(!/room=/.test(sB.url), 'B: mã đã gỡ khỏi URL (' + sB.url.replace(/^.*\/thap\//, '') + ')');
  kt(!sB.hdXong, 'B: hướng dẫn chưa bị đánh dấu xong (để mời lại sau)');
  await B.p.screenshot({ path: OUT + '02_B_mo_link_vao_sanh.png' });
  await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
  kt(true, 'A: thấy B vào phòng');
  await A.p.screenshot({ path: OUT + '03_A_thay_B.png' });

  // ---- B: DECK từ sảnh → màn bộ bài → ‹ → về sảnh, bộ mới ghi lên phòng ----
  await B.p.click('#sanh-bo'); await sleep(500);
  const dk = await B.p.evaluate(() => document.getElementById('chon').classList.contains('xem-dk') && document.getElementById('onl-sanh').hidden);
  kt(dk, 'B: DECK ở sảnh mở màn bộ bài');
  await B.p.screenshot({ path: OUT + '04_B_doi_bo.png' });
  const boMoi = await B.p.evaluate(() => { UI.chon = ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']; UI.veBoChon(); return UI.chon.join(','); });
  await B.p.click('[data-act="hm-ve"]'); await sleep(800);
  const veLai = await B.p.evaluate(() => !document.getElementById('onl-sanh').hidden && ONL.pl[ONL.me()].deck);
  kt(veLai === boMoi, 'B: ‹ về lại sảnh, bộ mới đã ghi (' + veLai + ')');
  await A.p.waitForFunction((d) => ONL.pl[ONL.khach] && ONL.pl[ONL.khach].deck === d, boMoi, { timeout: 5000 }).then(() => kt(true, 'A: thấy bộ mới của B'), () => kt(false, 'A: thấy bộ mới của B'));

  // ---- cả 2 READY → trận ----
  await A.p.click('#sanh-san'); await B.p.click('#sanh-san');
  await B.p.screenshot({ path: OUT + '05_B_ready.png' });
  await A.p.waitForFunction(() => typeof ONS !== 'undefined' && ONS.on && G.ban.length === 2, null, { timeout: 20000 });
  await B.p.waitForFunction(() => typeof ONS !== 'undefined' && ONS.on && G.ban.length === 2, null, { timeout: 20000 });
  await A.p.waitForFunction(() => G.wave >= 1, null, { timeout: 60000 });
  kt(true, 'Cả 2 READY → vào trận CO-OP online');
  await sleep(3000);

  // ---- B mở lại link giữa trận → vào lại trận ----
  await B.p.goto(link, { waitUntil: 'load' });
  await B.p.waitForFunction(() => typeof ONS !== 'undefined' && ONS.on && G.ban.length === 2 && !TAI.cho, null, { timeout: 30000 }).then(() => kt(true, 'B: mở lại link giữa trận → vào lại trận'), () => kt(false, 'B: mở lại link giữa trận → vào lại trận'));
  const sR = await B.p.evaluate(() => ({ hd: HD.dang, sanh: !document.getElementById('onl-sanh').hidden, url: location.href, w: G.wave }));
  kt(!sR.hd && !sR.sanh && !/room=/.test(sR.url), 'B: vào lại không hướng dẫn, không kẹt ở sảnh, URL sạch (wave ' + sR.w + ')');
  await sleep(1500);
  await B.p.screenshot({ path: OUT + '06_B_mo_lai_giua_tran.png' });

  // ---- C: phòng đầy ----
  const C = await ctxMoi('C');
  await C.p.goto(link, { waitUntil: 'load' });
  await C.p.waitForFunction(() => { const b = document.querySelector('#onl-bang .onl-bang.moi-loi'); return b && /full|started/.test(document.getElementById('onl-loi').textContent); }, null, { timeout: 30000 })
    .then(() => kt(true, 'C: phòng đầy → báo rõ'), () => kt(false, 'C: phòng đầy → báo rõ'));
  await sleep(300);
  await C.p.screenshot({ path: OUT + '07_C_phong_day.png' });
  await C.ctx.close();

  // ---- D: mã sai ----
  const D = await ctxMoi('D');
  await D.p.goto(GOC + '?' + NETQ + '&room=ZZZQ', { waitUntil: 'load' });
  await D.p.waitForFunction(() => document.querySelector('#onl-bang .onl-bang.moi-loi') && /not found/.test(document.getElementById('onl-loi').textContent), null, { timeout: 30000 })
    .then(() => kt(true, 'D: mã sai → "not found or has ended"'), () => kt(false, 'D: mã sai → báo lỗi'));
  await sleep(300);
  const sD = await D.p.evaluate(() => ({ tao: [...document.querySelectorAll('#onl-bang button')].filter(x => x.offsetParent).map(x => x.innerText.trim()), hd: HD.dang, ban: G.ban.length, msg: document.getElementById('onl-loi').textContent }));
  kt(sD.tao.includes('CREATE A NEW ROOM') && sD.tao.includes('HOME') && !sD.hd && !sD.ban, 'D: nút ' + sD.tao.join(' / ') + ' · "' + sD.msg + '"');
  await D.p.screenshot({ path: OUT + '08_D_ma_sai.png' });
  await D.p.click('#onl-bang [data-act="onl-dong"]'); await sleep(400);
  kt(await D.p.evaluate(() => document.getElementById('onl-bang').hidden && !document.getElementById('chon').hidden), 'D: HOME → về menu');
  await D.p.screenshot({ path: OUT + '09_D_home.png' });
  await D.ctx.close();

  await A.ctx.close(); await B.ctx.close();
  kt(errs.length === 0, 'Không lỗi trang (' + errs.length + ')');
  if (errs.length) console.log(errs.slice(0, 20).join('\n'));
  fs.writeFileSync(OUT + 'ket-qua.txt', ok.map(s => 'OK   ' + s).concat(hong.map(s => 'FAIL ' + s), errs.map(s => 'ERR  ' + s)).join('\n') + '\n');
  await b.close();
  process.exit(hong.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
