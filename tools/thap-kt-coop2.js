// TURRET MERGE — kiểm CO-OP online: CHẠY NỀN / TỰ VÀO LẠI + CHAT NHANH (máy chủ GIẢ, 2 trình duyệt Playwright).
// Chạy:  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &
//        OUT=docs/demo-hop-tuong/tuvan/coop2/ NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-coop2.js
// Kiểm: chat ở sảnh (câu nhanh, chữ tự do + lọc từ xấu, giới hạn 1 tin / 2 s, nhật ký, bong bóng) ·
//       khách B "ẩn app" 30 s (visibility hidden + mất mạng + JS đóng băng) → A chơi tiếp, AI lái bàn B, wave chạy ·
//       B quay lại → tự đồng bộ (không bấm gì), B điều khiển lại bàn mình, wave/tim/bàn khớp, A thấy "PARTNER IS BACK" ·
//       chat trong trận 2 chiều (bong bóng hiện rồi tắt) · trận xong khi B vắng → B về thấy màn kết quả ·
//       HOST ẩn 30 s → khách nắm quyền (tự chạy wave, tính tim) → host về đồng bộ theo khách · host đóng hẳn → khách chơi tiếp ·
//       ảnh bảng chat 360/390/430 · fps ≥ 50 · không lỗi trang.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/coop2/';
const PORT = +(process.env.PORT || 8787);
const URL = `http://localhost:${PORT}/thap/?net=mock&mockws=ws://localhost:${PORT}&nointro=1&notut=1&auto=1`;
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ok = [], hong = [], errs = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? 'OK   ' : 'FAIL ') + s); };
const tom = (p) => p.evaluate(() => Object.assign(ONS.tom(), { t: G.t, ketQua: !(document.getElementById('ketqua') || { hidden: true }).hidden }));
const giong = (x, y) => (x || []).filter((v, i) => v === (y || [])[i]).length;
const fps = (p) => p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(Math.round(n * 1000 / (performance.now() - t0))); }; requestAnimationFrame(f); }));

(async () => {
  const b = await chromium.launch();
  const mo = async (ten, deck, w) => {
    const ctx = await b.newContext({ viewport: { width: w || 390, height: 844 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(ten + ' :: ' + e.message));
    p.on('console', x => { if (x.type() === 'error') errs.push(ten + ' :: console ' + x.text()); });
    await p.goto(URL, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok && typeof CHAT !== 'undefined', null, { timeout: 30000 });
    await p.evaluate((d) => { UI.chon = d; UI.veBoChon(); }, deck);
    const cdp = await ctx.newCDPSession(p);
    return { ctx, p, ten, cdp };
  };
  // "ẩn app" như điện thoại: visibility hidden → (gửi 'an') → mất mạng → JS ĐÓNG BĂNG hẳn (Debugger.pause) ms mili-giây → chạy lại + hiện
  const anApp = async (X, ms) => {
    await X.p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
    await sleep(250);
    await X.p.evaluate((ms) => NET._mockNgat(ms), ms);
    await X.cdp.send('Debugger.enable'); await X.cdp.send('Debugger.pause');
    return async () => {
      await X.cdp.send('Debugger.resume'); await X.cdp.send('Debugger.disable');
      await X.p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); dispatchEvent(new Event('pageshow')); });
    };
  };
  const tran = async (n) => {
    const A = await mo('A' + n, ['canon', 'bang', 'lien', 'laser', 'doc']);
    const B = await mo('B' + n, ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
    await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
    await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
    const code = await A.p.textContent('#sanh-ma');
    await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await B.p.click('[data-act="onl-vao"]');
    await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
    await B.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
    return { A, B, code };
  };
  const vaoTran = async (A, B) => {
    await sleep(400);
    await A.p.click('#sanh-san'); await B.p.click('#sanh-san');
    await A.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 15000 });
    await B.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 15000 });
    await A.p.waitForFunction(() => G.wave >= 1, null, { timeout: 60000 });
    await B.p.waitForFunction(() => G.wave >= 1, null, { timeout: 20000 });
    await sleep(3000);
  };

  // ===================== TRẬN 1: A = host, B = khách
  let { A, B } = await tran(1);
  // ---- chat ở sảnh
  await A.p.click('#chat-nut-s');
  await A.p.waitForSelector('#chat-bang:not([hidden]) #chat-chu');
  await A.p.screenshot({ path: OUT + '01_A_sanh_bang_chat.png' });
  await A.p.fill('#chat-chu', 'hello shit team'); await A.p.click('[data-act="chat-x"]');
  await B.p.waitForFunction(() => /hello \*\*\*\* team/.test((document.getElementById('chat-log') || {}).textContent || ''), null, { timeout: 5000 }).then(() => kt(true, 'Sảnh: A gõ "hello shit team" → B thấy "hello **** team" (lọc từ xấu) trong nhật ký'), () => kt(false, 'Sảnh: chữ tự do tới B'));
  kt(await B.p.evaluate(() => !!document.querySelector('.sanh-p[data-u="ban"] > .chat-bong')), 'Sảnh: bong bóng hiện trên hàng của A ở máy B');
  await B.p.screenshot({ path: OUT + '02_B_sanh_bong_bong.png' });
  await sleep(2100);
  await A.p.click('#chat-nut-s'); await A.p.click('[data-act="chat-q"][data-v="GG"]');
  kt(await A.p.evaluate(() => CHAT.conCho() > 0 && !CHAT.gui('q', 'Nice!')), 'Giới hạn: tin thứ 2 trong 2 s bị chặn');
  await B.p.click('#chat-nut-s'); await B.p.click('[data-act="chat-e"][data-v="vui"]');
  await A.p.waitForFunction(() => document.querySelectorAll('#chat-log .chat-dong').length >= 3, null, { timeout: 5000 }).then(() => kt(true, 'Sảnh: B gửi biểu cảm → A thấy trong nhật ký (3 tin)'), () => kt(false, 'Sảnh: biểu cảm B → A'));
  await A.p.screenshot({ path: OUT + '03_A_sanh_nhat_ky.png' });
  kt(await A.p.evaluate(() => CHAT.sach('x'.repeat(80)).length === 60), 'Chữ tự do cắt ở 60 ký tự');

  await vaoTran(A, B);
  kt(true, 'Trận 1: cả 2 vào CO-OP online');
  // ---- chat trong trận 2 chiều
  await A.p.waitForSelector('#chat-nut:not([hidden])', { timeout: 5000 });
  await A.p.click('#chat-nut');
  await A.p.waitForSelector('#chat-bang:not([hidden])');
  kt(await A.p.evaluate(() => !document.getElementById('chat-chu') && !G.dung), 'Trận: bảng chat KHÔNG có ô chữ tự do, trận không dừng');
  await A.p.screenshot({ path: OUT + '04_A_tran_bang_chat.png' });
  await A.p.click('[data-act="chat-q"][data-v="Help my lane!"]');
  await B.p.waitForFunction(() => /Help my lane/.test((document.querySelector('#wrap > .chat-bong.tran') || {}).textContent || ''), null, { timeout: 5000 }).then(() => kt(true, 'Trận: A "Help my lane!" → bong bóng trên bàn đồng đội ở B'), () => kt(false, 'Trận: chat A → B'));
  await B.p.screenshot({ path: OUT + '05_B_tran_bong_bong.png' });
  await sleep(2200);
  await B.p.click('#chat-nut'); await B.p.click('[data-act="chat-e"][data-v="ok"]');
  await A.p.waitForFunction(() => !!document.querySelector('#wrap > .chat-bong.tran.emo:not(.toi)'), null, { timeout: 5000 }).then(() => kt(true, 'Trận: B gửi biểu cảm → A thấy bong bóng'), () => kt(false, 'Trận: chat B → A'));
  await A.p.screenshot({ path: OUT + '06_A_tran_bieu_cam.png' });
  await sleep(3600);
  kt(await A.p.evaluate(() => !document.querySelector('#wrap > .chat-bong')), 'Bong bóng tự tắt sau ~3 s');

  // ---- B ẩn app 30 s
  const w0 = (await tom(A.p)).wave;
  const veB = await anApp(B, 30000);
  await sleep(9000);
  let a = await tom(A.p);
  kt(a.thay === 'im' && a.ai && !a.dung, 'B ẩn app: sau ~6 s A cho AI lái bàn B, trận không dừng (thay=' + a.thay + ')');
  await A.p.screenshot({ path: OUT + '07_A_B_vang_AI_lai.png' });
  await sleep(20000);
  a = await tom(A.p);
  kt(a.wave > w0 && a.t > 25, 'A chơi tiếp khi B vắng: wave ' + w0 + ' → ' + a.wave);
  const nAI = await A.p.evaluate(() => G.ban[1].t.filter(Boolean).length);
  await veB();
  await B.p.waitForFunction(() => ONS.on && !ONS._choDB && !ONS._offT && NET.noi, null, { timeout: 20000 });
  await sleep(3500);
  a = await tom(A.p); let bb = await tom(B.p);
  kt(!a.thay && !a.ai, 'B về: A trả bàn cho B (không còn AI)');
  kt(Math.abs(a.wave - bb.wave) <= 1 && a.tim === bb.tim, 'B tự đồng bộ: wave A ' + a.wave + ' / B ' + bb.wave + ', tim ' + a.tim + ' = ' + bb.tim);
  kt(giong(bb.toi, a.ban) >= 13 && nAI > 0, 'Bàn B lấy lại cả phần AI đã xây: ' + giong(bb.toi, a.ban) + '/15 ô khớp (A thấy ' + nAI + ' ụ trước khi về)');
  await B.p.screenshot({ path: OUT + '08_B_ve_lai_dong_bo.png' }); await A.p.screenshot({ path: OUT + '09_A_ban_quay_lai.png' });
  const tr = await B.p.evaluate(() => { const B0 = G.ban[0]; B0.mana += 500; const T = trieu(B0); return T ? { o: T.o, id: T.id } : null; });
  await sleep(900);
  kt(tr && await A.p.evaluate((t) => { const T = G.ban[1].t[t.o]; return !!T && T.id === t.id; }, tr), 'B điều khiển lại bàn mình: B triệu hồi → A thấy ngay');

  // ---- trận xong khi B vắng → B về thấy kết quả
  const veB2 = await anApp(B, 12000);
  await sleep(8000);
  await A.p.evaluate(() => { G.ban[0].tim = 1; const E = sinhQuai('bo', 0, G.duong[0].len - 0.5); E.vao = 1; E.tim = 1; });
  await A.p.waitForFunction(() => !!G.ketThuc, null, { timeout: 8000 });
  await sleep(6500); // quá 5 s: bình thường host đã xoá phòng — có bạn vắng thì giữ
  await veB2();
  await B.p.waitForSelector('#ketqua:not([hidden])', { timeout: 20000 }).then(() => kt(true, 'Trận xong khi B vắng → B về thấy màn kết quả'), () => kt(false, 'B về: không thấy kết quả'));
  await B.p.screenshot({ path: OUT + '10_B_ve_thay_ket_qua.png' });
  await A.ctx.close(); await B.ctx.close();

  // ===================== TRẬN 2: HOST vắng → khách nắm quyền
  ({ A, B } = await tran(2));
  await vaoTran(A, B);
  const w1 = (await tom(B.p)).wave;
  const veA = await anApp(A, 30000);
  await sleep(28000);
  bb = await tom(B.p);
  kt(bb.thay === 'im' && bb.wave > w1 && !bb.dung, 'HOST ẩn app → khách B nắm quyền: AI lái bàn host, B tự chạy wave ' + w1 + ' → ' + bb.wave);
  await B.p.screenshot({ path: OUT + '11_B_host_vang_khach_giu_quyen.png' });
  await veA();
  await A.p.waitForFunction(() => ONS.on && !ONS._choDB && !ONS._offT && NET.noi, null, { timeout: 20000 });
  await sleep(3500);
  a = await tom(A.p); bb = await tom(B.p);
  kt(!bb.thay && Math.abs(a.wave - bb.wave) <= 1 && a.tim === bb.tim, 'Host về: đồng bộ theo khách — wave ' + a.wave + '/' + bb.wave + ', tim ' + a.tim + '/' + bb.tim);
  // host đóng hẳn → khách chơi tiếp
  await A.ctx.close();
  await sleep(16000);
  bb = await tom(B.p); const t1 = bb.t;
  await sleep(2000);
  const bb2 = await tom(B.p);
  kt(bb.ai && bb2.t > t1 + 1 && !bb2.dung, 'Host đóng hẳn → khách chơi tiếp với AI (G.t ' + t1.toFixed(1) + ' → ' + bb2.t.toFixed(1) + ')');
  const f = await fps(B.p);
  kt(f >= 50, 'fps máy B: ' + f);

  // ---- ảnh bảng chat ở 360 / 390 / 430
  for (const w of [360, 390, 430]) {
    await B.p.setViewportSize({ width: w, height: Math.round(w * 2.16) }); await sleep(500);
    await B.p.evaluate(() => { CHAT.code = CHAT.code || 'TEST'; CHAT.moBang(); });
    await sleep(200);
    await B.p.screenshot({ path: OUT + '12_bang_chat_tran_' + w + '.png' });
    await B.p.evaluate(() => CHAT.dong());
  }
  await B.ctx.close();
  // sảnh ở 360 / 430
  for (const w of [360, 430]) {
    const X = await mo('S' + w, ['canon', 'bang', 'lien', 'laser', 'doc'], w);
    await X.p.evaluate(() => ONL.moBang()); await X.p.click('[data-act="onl-tao"]');
    await X.p.waitForSelector('#chat-nut-s'); await X.p.click('#chat-nut-s'); await sleep(300);
    await X.p.screenshot({ path: OUT + '13_bang_chat_sanh_' + w + '.png' });
    await X.ctx.close();
  }

  kt(errs.length === 0, 'Không lỗi trang (' + errs.length + ')');
  if (errs.length) console.log(errs.slice(0, 20).join('\n'));
  fs.writeFileSync(OUT + 'ket-qua.txt', ok.map(s => 'OK   ' + s).concat(hong.map(s => 'FAIL ' + s), errs.map(s => 'ERR  ' + s)).join('\n') + '\n');
  await b.close();
  process.exit(hong.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
