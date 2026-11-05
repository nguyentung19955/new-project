// TURRET MERGE — kiểm SẢNH ONLINE (tạo phòng → vào phòng → READY → vào trận) bằng 2 trình duyệt Playwright (2 context = 2 người).
// Chạy ĐÚNG đường code Firebase của game (?net=fb, js/online/net.js nhánh firebase) nhưng thay SDK trong js/online/vendor bằng SDK giả
// (tools/thap-fb-gia/client.js) nối tới máy chủ giả tools/thap-fb-gia/server.js — máy chủ này THI HÀNH file luật database thật
// (tools/thap-fb-gia/luat.js). Firebase thật không gọi được từ máy kiểm (CI / sandbox chặn mạng) → bài này dùng máy chủ GIẢ.
// Chạy 2 bộ luật: luật đang publish (luat-dang-chay.json) + luật chặt (docs/demo-hop-tuong/turretmerge-database.rules.json).
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-online-sanh.js          (tự bật máy chủ giả :8792 + web tĩnh :8791; FB= / WEB= đổi cổng)
//   OUT=docs/demo-hop-tuong/tuvan/lobbyket/ … (ảnh chụp)  · LUAT=chay|chat (chỉ 1 bộ luật)
// Kiểm (lỗi 05/11: chủ phòng kẹt "Waiting for teammate…", khách "Both ready — launching…" mà không ai vào trận):
//   1 tạo + vào bằng MÃ → READY cả 2 → cả 2 vào trận ≤ 3 s · 2 vào bằng LINK MỜI ?phong= · 3 khách RỜI rồi VÀO LẠI sảnh (lỗi gốc)
//   4 chủ phòng TẢI LẠI trang ở sảnh → tự về sảnh, vẫn là chủ phòng → vào trận · 5 khách tải lại ở sảnh
//   6 chủ phòng không ghi bắt đầu (ngủ máy) → khách tự bắt đầu (luật đang chạy) · không lỗi trang · không bị luật từ chối ngoài dự kiến · dọn phòng
'use strict';
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');
const GOC = path.resolve(__dirname, '..');
const OUT = process.env.OUT || null;
const WEB = +(process.env.WEB || 8791), FB = +(process.env.FB || 8792); // cổng riêng (không đụng máy chủ giả :8790 của kt-2-may.py)
const FAKE = fs.readFileSync(path.join(__dirname, 'thap-fb-gia/client.js'), 'utf8').replace('ws://localhost:8790', 'ws://localhost:' + FB);
const URL = `http://localhost:${WEB}/thap/?net=fb&nointro=1&notut=1`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ok = [], hong = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? 'OK   ' : 'FAIL ') + s); };
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.svg': 'image/svg+xml' };
function webTinh() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(GOC, p); if (!f.startsWith(GOC)) { res.writeHead(403); return res.end(); }
      fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(d); });
    });
    s.listen(WEB, () => ok(s));
  });
}
function mayChuGia(rules) {
  return new Promise((ok, hong) => {
    const env = Object.assign({}, process.env, { PORT: String(FB) }); if (rules) env.RULES = rules; else delete env.RULES;
    const c = spawn(process.execPath, [path.join(__dirname, 'thap-fb-gia/server.js')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d) => { if (/fake rtdb on/.test(String(d))) ok(c); });
    c.on('exit', (code) => hong(new Error('fake server exit ' + code)));
  });
}
// đọc/ghi thẳng máy chủ giả (dump cây + danh sách bị luật từ chối)
async function dump(p) {
  return p.evaluate((port) => new Promise(ok => { const w = new WebSocket('ws://localhost:' + port); w.onopen = () => w.send(JSON.stringify({ op: 'dump', rid: 1 })); w.onmessage = e => { const r = JSON.parse(e.data); if (r.rid === 1) { ok(r); w.close(); } }; }), FB);
}

async function boLuat(b, ten, rulesFile) {
  const srv = await mayChuGia(rulesFile);
  const errs = [];
  const mo = async (nhan, deck, url) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
    await ctx.addInitScript((d) => { try { if (!localStorage.getItem('turret_hd')) localStorage.setItem('turret_hd', '{"xong":true,"boQua":true}'); if (!localStorage.getItem('turret_bo')) localStorage.setItem('turret_bo', JSON.stringify({ chon: d, mv: 'hero', che: 'solo' })); } catch (e) { } }, deck);
    await ctx.route('**/js/online/vendor/*.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: /app-compat/.test(r.request().url()) ? FAKE : '/*fake*/' }));
    const p = await ctx.newPage(); p.setDefaultTimeout(8000);
    const nghe = (pg) => {
      pg.on('pageerror', e => errs.push(nhan + ' :: ' + e.message));
      pg.on('console', x => { if (x.type() === 'error') errs.push(nhan + ' :: console ' + x.text()); });
    };
    nghe(p);
    const vao = async (u) => {
      await p.goto(u || URL, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && typeof NET !== 'undefined' && NET.ok && document.querySelector('#onl-nut'), null, { timeout: 40000 });
      await p.evaluate((d) => { UI.chon = d.slice(); }, deck);
    };
    await vao(url);
    return { ctx, p, nhan, deck, vao };
  };
  const DA = ['canon', 'bang', 'lien', 'laser', 'doc'], DB = ['drone', 'bao', 'kiembang', 'hydra', 'anhsang'];
  const soNguoi = (p) => p.evaluate(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length);
  const choSanh2 = async (A, B, s) => {
    for (const X of [A, B]) await X.p.waitForFunction(() => !document.querySelector('#onl-sanh').hidden && document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 })
      .catch(() => { });
    const [na, nb] = [await soNguoi(A.p), await soNguoi(B.p)];
    kt(na === 2 && nb === 2, ten + ' · ' + s + ': sảnh cả 2 máy thấy 2 người (chủ ' + na + ', khách ' + nb + ')');
  };
  const ready = async (X) => { await X.p.click('#sanh-san'); };
  const choTran = async (A, B, s) => {
    const t0 = Date.now();
    const r = await Promise.all([A, B].map(X => X.p.waitForFunction(() => typeof ONS !== 'undefined' && ONS.on && G.ban.length === 2, null, { timeout: 6000 }).then(() => Date.now() - t0).catch(() => -1)));
    const tt = await Promise.all([A, B].map(X => X.p.evaluate(() => ({ st: ONL.meta && ONL.meta.st, loi: (document.querySelector('#sanh-loi') || {}).textContent, goi: (document.querySelector('#sanh-goi') || {}).textContent }))));
    kt(r[0] >= 0 && r[1] >= 0 && Math.max(r[0], r[1]) <= 3000, ten + ' · ' + s + ': cả 2 vào trận ≤ 3 s (chủ ' + r[0] + ' ms, khách ' + r[1] + ' ms)' + (r[0] < 0 || r[1] < 0 ? ' ' + JSON.stringify(tt) : ''));
    const seed = await Promise.all([A, B].map(X => X.p.evaluate(() => ONS.o && ONS.o.seed)));
    kt(seed[0] && seed[0] === seed[1], ten + ' · ' + s + ': cùng hạt giống trận (' + seed.join(' / ') + ')');
  };
  const anh = async (X, f) => { if (OUT) await X.p.screenshot({ path: OUT + ten + '_' + f + '.png' }); };
  const taoPhong = async (A) => {
    await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
    await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || '') && !document.querySelector('#onl-sanh').hidden, null, { timeout: 10000 });
    const loi = await A.p.textContent('#sanh-loi');
    kt(!/Creating/.test(loi), ten + ' · sảnh chủ phòng không còn kẹt chữ "Creating room…" (' + JSON.stringify(loi) + ')');
    return A.p.textContent('#sanh-ma');
  };
  const vaoMa = async (B, c) => { await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', c); await B.p.click('[data-act="onl-vao"]'); };
  const xong = async (...ds) => { // chủ phòng rời → xoá phòng; đóng máy
    for (const X of ds) { try { await X.p.evaluate(() => { if (ONL.code) ONL.roiPhong(); }); } catch (e) { } await sleep(700); } // khách rời trước (ghi 'bye'), chủ phòng xoá phòng sau
    await sleep(500);
    for (const X of ds) await X.ctx.close().catch(() => { });
  };

  // 1) mã phòng
  {
    const A = await mo('A1', DA), B = await mo('B1', DB);
    const c = await taoPhong(A); await anh(A, '01_chu_tao');
    await vaoMa(B, c); await choSanh2(A, B, '1 vào bằng mã'); await ready(A); await ready(B);
    await anh(B, '02_khach_ready');
    await choTran(A, B, '1 vào bằng mã'); await sleep(800); await anh(A, '03_chu_tran'); await anh(B, '04_khach_tran');
    await xong(B, A);
  }
  // 2) link mời
  {
    const A = await mo('A2', DA);
    const c = await taoPhong(A);
    const B = await mo('B2', DB, URL + '&phong=' + c);
    await choSanh2(A, B, '2 link mời'); await ready(A); await ready(B); await choTran(A, B, '2 link mời');
    await xong(B, A);
  }
  // 3) khách rời rồi vào lại (lỗi gốc 05/11)
  {
    const A = await mo('A3', DA), B = await mo('B3', DB);
    const c = await taoPhong(A); await vaoMa(B, c); await choSanh2(A, B, '3 lần đầu');
    await B.p.evaluate(() => ONL.roiPhong()); await sleep(800);
    kt(await soNguoi(A.p) === 1, ten + ' · 3: khách rời → chủ phòng thấy ô trống');
    await vaoMa(B, c); await choSanh2(A, B, '3 khách vào lại');
    await ready(A); await ready(B); await anh(A, '05_chu_khach_vao_lai'); await choTran(A, B, '3 khách vào lại');
    await xong(B, A);
  }
  // 4) chủ phòng tải lại trang ở sảnh
  {
    const A = await mo('A4', DA), B = await mo('B4', DB);
    const c = await taoPhong(A); await vaoMa(B, c); await choSanh2(A, B, '4 trước tải lại');
    const uid = await A.p.evaluate(() => NET.user.uid);
    await A.vao();
    await A.p.waitForFunction((c) => ONL.code === c && !document.querySelector('#onl-sanh').hidden, c, { timeout: 15000 }).catch(() => { });
    const sau = await A.p.evaluate(() => ({ code: ONL.code, host: ONL.host, uid: NET.user.uid }));
    kt(sau.code === c && sau.host && sau.uid === uid, ten + ' · 4: chủ phòng tải lại → tự về sảnh ' + c + ', vẫn là chủ phòng, cùng uid ' + JSON.stringify(sau));
    await choSanh2(A, B, '4 sau tải lại'); await ready(A); await ready(B); await anh(A, '06_chu_tai_lai'); await choTran(A, B, '4 chủ phòng tải lại');
    await xong(B, A);
  }
  // 5) khách tải lại trang ở sảnh (khách đã READY)
  {
    const A = await mo('A5', DA), B = await mo('B5', DB);
    const c = await taoPhong(A); await vaoMa(B, c); await choSanh2(A, B, '5 trước tải lại'); await ready(B); await sleep(300);
    await B.vao();
    await B.p.waitForFunction((c) => ONL.code === c && !document.querySelector('#onl-sanh').hidden, c, { timeout: 15000 }).catch(() => { });
    kt(await B.p.evaluate((c) => ONL.code === c && !ONL.host, c), ten + ' · 5: khách tải lại → tự về sảnh ' + c);
    await choSanh2(A, B, '5 sau tải lại'); await ready(A); await ready(B); await choTran(A, B, '5 khách tải lại');
    await xong(B, A);
  }
  // 6) chủ phòng không ghi bắt đầu (ngủ máy / lỡ sự kiện) → khách tự bắt đầu
  if (!rulesFile) {
    const A = await mo('A6', DA), B = await mo('B6', DB);
    const c = await taoPhong(A); await vaoMa(B, c); await choSanh2(A, B, '6');
    await A.p.evaluate(() => { ONL.batTran = () => { }; });
    await ready(A); await ready(B); await choTran(A, B, '6 chủ phòng im → khách bắt đầu');
    await xong(B, A);
  }
  // dọn phòng + luật
  const ctx = await b.newContext(); const p = await ctx.newPage(); await p.goto(`http://localhost:${WEB}/thap/ver.json`).catch(() => { });
  const d = await dump(p); await ctx.close();
  const rooms = Object.keys(((d.v || {}).turretmerge || {}).rooms || {});
  kt(rooms.length === 0, ten + ' · dọn sạch phòng thử (' + rooms.join(',') + ')' + (rooms.length ? ' ' + JSON.stringify(d.v.turretmerge.rooms).slice(0, 600) : ''));
  // từ chối được phép: khách đọc 'khach' trước khi là thành viên (luật chặt) · khách ghi bắt đầu trận (luật chặt chỉ cho chủ phòng)
  const la = (d.denied || []).filter(x => !(/\/khach$/.test(x[2]) && x[0] === 'read') && !/meta/.test(x[2]) && x[0] !== 'read-revoked');
  kt(la.length === 0, ten + ' · không bị luật từ chối ngoài dự kiến (' + la.length + ') ' + JSON.stringify(la.slice(0, 5)));
  kt(errs.length === 0, ten + ' · không lỗi trang (' + errs.length + ') ' + errs.slice(0, 5).join(' | '));
  srv.kill(); await sleep(300);
}

(async () => {
  const web = await webTinh();
  const b = await chromium.launch();
  const L = process.env.LUAT || 'chay,chat';
  if (/chay/.test(L)) await boLuat(b, 'luat-dang-chay', null);
  if (/chat/.test(L)) await boLuat(b, 'luat-chat', path.join(GOC, 'docs/demo-hop-tuong/turretmerge-database.rules.json'));
  await b.close(); web.close();
  console.log(hong.length ? 'ĐỎ: ' + hong.length + ' lỗi' : 'XANH: ' + ok.length + ' mục');
  if (OUT) fs.writeFileSync(OUT + 'ket-qua.txt', ok.map(s => 'OK   ' + s).concat(hong.map(s => 'FAIL ' + s)).join('\n') + '\n');
  process.exit(hong.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
