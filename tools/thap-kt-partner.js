// TURRET MERGE — kiểm "bạn rời / rớt mạng giữa trận CO-OP online KHÔNG chặn trận của mình" (máy chủ GIẢ, 2–3 trình duyệt).
// Chạy:  NODE_PATH=<nơi có ws> node tools/thap-online-mock-server.js 8787 &
//        OUT=docs/demo-hop-tuong/tuvan/partner/ node tools/thap-kt-partner.js
// Kiểm: rớt mạng 5 s → không giao AI, không dừng · tab đóng băng 8 s (khoá màn) → không giao AI · đóng băng 16 s → giao AI
//       rồi bạn quay lại → trả bàn · khách đóng hẳn → host chơi tiếp, AI đặt ụ bàn đồng đội, fps ≥ 50, không bảng che
//       · host đóng hẳn → khách tự chạy wave + AI · host bấm QUIT → khách chơi tiếp ngoại tuyến · không lỗi trang.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/partner/';
const PORT = +(process.env.PORT || 8787);
const URL = `http://localhost:${PORT}/thap/?net=mock&mockws=ws://localhost:${PORT}&nointro=1&notut=1&auto=1`;
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ok = [], hong = [], errs = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? 'OK   ' : 'FAIL ') + s); };
const tom = (p) => p.evaluate(() => Object.assign(ONS.tom(), { modal: !!document.querySelector('#onl-mat:not([hidden])'), dungHien: !(document.getElementById('dung') || { hidden: true }).hidden, t: G.t, nAlly: G.ban[1] ? G.ban[1].t.filter(Boolean).length : 0, ten: G.ban[1] && G.ban[1].ten }));
const fps = (p) => p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(Math.round(n * 1000 / (performance.now() - t0))); }; requestAnimationFrame(f); }));

(async () => {
  const b = await chromium.launch();
  const mo = async (ten, deck) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(ten + ' :: ' + e.message));
    p.on('console', x => { if (x.type() === 'error') errs.push(ten + ' :: console ' + x.text()); });
    await p.goto(URL, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok, null, { timeout: 30000 });
    await p.evaluate((d) => { UI.chon = d; UI.veBoChon(); }, deck);
    const cdp = await ctx.newCDPSession(p);
    return { ctx, p, ten, cdp };
  };
  // "khoá màn": dừng hẳn JS của trang (Debugger.pause — không timer, không gửi gì; tin nhắn mạng xếp hàng) rồi chạy lại
const dongBang = async (X, v) => { if (v) { await X.cdp.send('Debugger.enable'); await X.cdp.send('Debugger.pause'); } else { await X.cdp.send('Debugger.resume'); await X.cdp.send('Debugger.disable'); } };
  const tran = async (n) => {
    const A = await mo('A' + n, ['canon', 'bang', 'lien', 'laser', 'doc']);
    const B = await mo('B' + n, ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
    await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
    await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
    const code = await A.p.textContent('#sanh-ma');
    await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await B.p.click('[data-act="onl-vao"]');
    await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
    await sleep(500);
    await A.p.click('#sanh-san'); await B.p.click('#sanh-san');
    await A.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 15000 });
    await B.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 15000 });
    await A.p.waitForFunction(() => G.wave >= 1, null, { timeout: 60000 });
    await B.p.waitForFunction(() => G.wave >= 1, null, { timeout: 20000 });
    await sleep(2500);
    return { A, B, code };
  };

  // ===== TRẬN 1: A = host, B = khách
  let { A, B } = await tran(1);
  kt(true, 'Trận 1: 2 máy vào CO-OP online');
  // 1) rớt mạng ngắn 5 s bên B
  await B.p.evaluate(() => NET._mockNgat(5000));
  await sleep(2500);
  let a = await tom(A.p), bb = await tom(B.p);
  kt(!a.dung && !bb.dung && !a.modal && !bb.modal, 'Rớt mạng 5 s: cả 2 KHÔNG dừng, không bảng che (A dung=' + a.dung + ', B dung=' + bb.dung + ')');
  await sleep(6000);
  a = await tom(A.p); bb = await tom(B.p);
  kt(!a.thay && !a.ai && !bb.thay, 'Rớt mạng 5 s: không giao AI (A thay=' + a.thay + ', im=' + a.im + ' ms)');
  // 2) khoá màn ngắn: B đóng băng 8 s
  const t0 = a.t;
  await dongBang(B, true); await sleep(8000);
  a = await tom(A.p);
  kt(!a.thay && !a.dung && !a.modal && a.t > t0 + 6 && a.im > 6000, 'B khoá màn 8 s (A không nghe gì ' + a.im + ' ms): A chạy tiếp, chưa giao AI (G.t ' + t0.toFixed(1) + '→' + a.t.toFixed(1) + ')');
  await dongBang(B, false); await sleep(3000);
  bb = await tom(B.p); a = await tom(A.p);
  kt(!bb.thay && !a.thay && bb.on && !bb.ketThuc, 'B mở lại màn: B không tự coi là đã rời, không giao AI bên nào');
  // 3) B đóng băng 16 s → A giao AI → B quay lại → A trả bàn
  await dongBang(B, true); await sleep(15000);
  a = await tom(A.p);
  kt(a.thay === 'im' && a.ai && !a.dung && !a.modal && /AI/.test(a.ten), 'B vắng > 12 s: A tự giao bàn đồng đội cho AI, không bảng che, nhãn "' + a.ten + '"');
  await A.p.screenshot({ path: OUT + '01_A_ban_vang_AI_choi.png' });
  await dongBang(B, false); await sleep(6000);
  a = await tom(A.p); bb = await tom(B.p);
  kt(!a.thay && !a.ai && a.on && !bb.thay, 'B quay lại: A trả bàn cho B (thay=' + a.thay + ', ten "' + a.ten + '")');
  await A.p.screenshot({ path: OUT + '02_A_ban_quay_lai.png' });
  // 4) khách B đóng hẳn giữa wave → A chơi tiếp, AI đặt ụ
  const w0 = a.wave, n0 = a.nAlly;
  await B.ctx.close();
  await sleep(4000);
  a = await tom(A.p);
  kt(!a.dung && !a.modal, 'B đóng hẳn: A không dừng, không bảng che (4 s sau)');
  await A.p.screenshot({ path: OUT + '03_A_ban_mat_4s.png' });
  await A.p.waitForFunction(() => ONS.thay && G.ban[1].ai, null, { timeout: 15000 });
  await sleep(1000);
  await A.p.screenshot({ path: OUT + '04_A_toast_AI.png' });
  await A.p.evaluate(() => { G.ban[1].mana += 400; });
  await sleep(6000);
  const f = await fps(A.p);
  a = await tom(A.p);
  kt(a.ai && !a.dung && !a.modal && a.nAlly > 0, 'A chơi tiếp với AI: bàn đồng đội ' + n0 + '→' + a.nAlly + ' ụ, wave ' + w0 + '→' + a.wave);
  kt(f >= 50, 'A fps sau khi bạn rời: ' + f);
  await A.p.waitForFunction((w) => G.wave > w || G.ketThuc, w0, { timeout: 70000 }).catch(() => { });
  a = await tom(A.p);
  kt(a.wave > w0 || a.ketThuc, 'Wave chạy tiếp: ' + w0 + '→' + a.wave);
  await A.p.screenshot({ path: OUT + '05_A_choi_tiep_AI.png' });
  await A.ctx.close();

  // ===== TRẬN 2: host A đóng hẳn → khách B tự chạy wave
  ({ A, B } = await tran(2));
  bb = await tom(B.p); const wb0 = bb.wave;
  await A.ctx.close();
  await B.p.waitForFunction(() => ONS.thay && G.ban[1].ai, null, { timeout: 25000 });
  bb = await tom(B.p);
  kt(!bb.dung && !bb.modal, 'Host đóng hẳn: khách giao bàn host cho AI, không bảng che');
  await B.p.waitForFunction((w) => G.wave > w, wb0 + (bb.wave > wb0 ? bb.wave - wb0 : 0), { timeout: 70000 }).catch(() => { });
  const bb2 = await tom(B.p);
  kt(bb2.wave > bb.wave, 'Khách tự chạy wave khi host vắng: ' + bb.wave + '→' + bb2.wave);
  await B.p.screenshot({ path: OUT + '06_B_host_roi_choi_tiep.png' });
  await B.ctx.close();

  // ===== TRẬN 3: host A bấm QUIT (menu tạm dừng) → phòng bị xoá → khách B chơi tiếp ngoại tuyến
  ({ A, B } = await tran(3));
  await A.p.click('[data-act="dung"]'); await sleep(400);
  bb = await tom(B.p);
  kt(bb.dung && bb.dungHien, 'Tạm dừng CHUNG vẫn còn (A bấm dừng → B dừng)');
  await A.p.click('#dung [data-act="bo"]');
  await sleep(2500);
  const t3 = await B.p.evaluate(() => G.t);
  await sleep(2500);
  bb = await tom(B.p);
  kt(bb.ai && !bb.dung && !bb.modal && !bb.dungHien && bb.t > t3 + 1.5 && !bb.ketThuc, 'Host bấm QUIT: khách bỏ tạm dừng, chơi tiếp với AI (G.t ' + t3.toFixed(1) + '→' + bb.t.toFixed(1) + ')');
  await B.p.screenshot({ path: OUT + '07_B_host_quit_choi_tiep.png' });
  await B.ctx.close(); await A.ctx.close();

  kt(errs.length === 0, 'Không lỗi trang (' + errs.length + ')');
  if (errs.length) console.log(errs.slice(0, 20).join('\n'));
  fs.writeFileSync(OUT + 'ket-qua.txt', ok.map(s => 'OK   ' + s).concat(hong.map(s => 'FAIL ' + s), errs.map(s => 'ERR  ' + s)).join('\n') + '\n');
  await b.close();
  process.exit(hong.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
