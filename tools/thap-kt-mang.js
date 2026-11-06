// TURRET MERGE — ĐO MẠNG TRONG TRẬN (máy nóng khi chơi bằng 4G: sóng di động bật liên tục khi còn tải/ping).
// Tự bật máy chủ tĩnh giống GitHub Pages (Cache-Control: max-age=600 + ETag/304) ở cổng PORT (8770), mở iPhone 13 (DPR 3),
// ghi mọi yêu cầu (CDP Network: số yêu cầu, byte thật qua mạng, WebSocket, tên miền ngoài) theo từng pha:
//   khởi động (0–20 s) · HOME đứng yên 60 s · SOLO: 20 s đầu trận · SOLO phút 1–3 (GIAY) · tải lại trang (bộ đệm ấm).
// Chạy (gốc repo): NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-mang.js      (DO=1 → ghi JSON vào OUT)
// TRƯỢT khi trong trận SOLO (sau 20 s đầu) có > 1 yêu cầu/phút hoặc > 8 KB/phút, hoặc có WebSocket/tên miền ngoài trong SOLO.
'use strict';
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +(process.env.PORT || 8770), GIAY = +(process.env.GIAY || 120), HOME_GIAY = +(process.env.HOME_GIAY || 60);
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/nong/', NHAN = process.env.NHAN || 'mang', DO = !!process.env.DO;
const GOC = path.resolve(process.env.GOC || path.join(__dirname, '..'));
const Q = process.env.NETFB ? '&net=fb' : ''; // NETFB=1: bật Firebase thật (trình duyệt tự động mặc định tắt online)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOAI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4', '.wav': 'audio/wav' };

// máy chủ giống GitHub Pages: max-age=600, ETag, 304
let SV = { n: 0, n304: 0, byte: 0, ds: {} };
const srv = http.createServer((q, r) => {
  SV.n++;
  let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
  const f = path.join(GOC, u); if (!f.startsWith(GOC)) { r.writeHead(403); return r.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { r.writeHead(404); return r.end('404'); }
    const et = '"' + crypto.createHash('md5').update(st.size + ':' + st.mtimeMs).digest('hex').slice(0, 16) + '"';
    const h = { 'Content-Type': LOAI[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'max-age=600', ETag: et, 'Last-Modified': st.mtime.toUTCString() };
    if (q.headers['if-none-match'] === et) { SV.n304++; r.writeHead(304, h); return r.end(); }
    h['Content-Length'] = st.size; r.writeHead(200, h); if (q.method !== 'HEAD') { SV.byte += st.size; SV.ds[u] = (SV.ds[u] || 0) + st.size; }
    if (q.method === 'HEAD') return r.end();
    fs.createReadStream(f).pipe(r);
  });
});

async function main() {
  await new Promise(ok => srv.listen(PORT, ok));
  const BASE = `http://localhost:${PORT}/thap/`;
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  const loi = []; p.on('pageerror', e => loi.push(e.message));
  let pha = 'khoidong'; const PH = {}; const yc = new Map();
  const ph = (k) => PH[k] || (PH[k] = { yc: 0, byte: 0, ws: 0, wsKhung: 0, ngoai: new Set(), url: {}, t0: Date.now(), t1: 0 });
  cdp.on('Network.requestWillBeSent', (e) => {
    const P = ph(pha); P.yc++; yc.set(e.requestId, pha);
    const u = e.request.url; if (!/^https?:\/\/localhost/.test(u) && !/^data:|^blob:/.test(u)) P.ngoai.add(u.replace(/^(https?:\/\/[^/]+).*/, '$1'));
    const k = u.replace(/^https?:\/\/localhost:\d+\/thap\//, '').replace(/\?.*$/, '?…'); P.url[k] = (P.url[k] || 0) + 1;
  });
  cdp.on('Network.loadingFinished', (e) => { const k = yc.get(e.requestId); if (k) ph(k).byte += e.encodedDataLength || 0; });
  cdp.on('Network.webSocketCreated', (e) => { ph(pha).ws++; ph(pha).ngoai.add(e.url.replace(/^(wss?:\/\/[^/]+).*/, '$1')); });
  cdp.on('Network.webSocketFrameSent', () => { ph(pha).wsKhung++; });
  cdp.on('Network.webSocketFrameReceived', () => { ph(pha).wsKhung++; });
  const qua = (k) => { const P = ph(pha); P.t1 = Date.now(); P.sv = SV; SV = { n: 0, n304: 0, byte: 0, ds: {} }; pha = k; ph(k).t0 = Date.now(); };

  // 1) khởi động + HOME đứng yên
  await p.goto(BASE + '?notut=1' + Q, { waitUntil: 'load' });
  await sleep(20000); qua('home');
  await sleep(HOME_GIAY * 1000); qua('solo_dau');
  // 2) SOLO (chơi tự động tới wave cao: bàn đầy, quái liên tục)
  await p.goto(BASE + '?mode=solo&deck=ngoisao,mana,nangluong,hutmana,nhanmana&wave=11&mana=5000&auto=1&notut=1' + Q, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 60000 });
  await p.evaluate(() => { for (const B of G.ban) B.tim = 1e9; });
  // Firebase giả (máy kiểm không vào được Firebase thật): trận offline phải ngắt kết nối (goOffline), về menu nối lại
  const fbGia = await p.evaluate(async () => {
    if (typeof NET === 'undefined' || !NET.theoDoiNgu) return { co: false };
    const L = []; NET.kieu = 'firebase'; NET._db = { goOffline: () => L.push('off'), goOnline: () => L.push('on') }; NET._ngu = false; NET.theoDoiNgu();
    await new Promise(r => setTimeout(r, 2500)); const trongTran = L.slice();
    const g = G.ban; G.ban = []; await new Promise(r => setTimeout(r, 2500)); const veMenu = L.slice(); G.ban = g;
    await new Promise(r => setTimeout(r, 2500));
    return { co: true, trongTran, veMenu, ngatLai: L.slice(), ok: trongTran[0] === 'off' && veMenu[1] === 'on' && L[2] === 'off' };
  });
  await sleep(20000); qua('solo');
  await sleep(GIAY * 1000);
  const wave = await p.evaluate(() => G.wave);
  qua('taiLai');
  // 3) tải lại (bộ đệm ấm): còn tải lại gì?
  await p.reload({ waitUntil: 'load' });
  await sleep(15000); qua('het');
  await b.close(); srv.close();

  const kq = { wave, loi: loi.slice(0, 5), fbGia };
  for (const [k, P] of Object.entries(PH)) {
    if (k === 'het') continue;
    const phut = Math.max(1 / 60, ((P.t1 || Date.now()) - P.t0) / 60000);
    kq[k] = { giay: +(phut * 60).toFixed(0), yc: P.yc, kb: +(P.byte / 1024).toFixed(1), ycMoiPhut: +(P.yc / phut).toFixed(1), kbMoiPhut: +(P.byte / 1024 / phut).toFixed(1), ws: P.ws, wsKhung: P.wsKhung, mayChu: P.sv && { yc: P.sv.n, yc304: P.sv.n304, kb: +(P.sv.byte / 1024).toFixed(1), top: Object.entries(P.sv.ds).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([u, n]) => u.replace('/thap/', '') + ' ' + (n / 1024).toFixed(0) + 'KB') }, ngoai: [...P.ngoai], top: Object.entries(P.url).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([u, n]) => n + '× ' + u) };
  }
  for (const k of ['khoidong', 'home', 'solo_dau', 'solo', 'taiLai']) if (kq[k]) console.log(`${k}: ${kq[k].yc} yêu cầu, ${kq[k].kb} KB (${kq[k].ycMoiPhut}/phút, ${kq[k].kbMoiPhut} KB/phút) · máy chủ thật: ${kq[k].mayChu.yc} yc (${kq[k].mayChu.yc304}× 304), ${kq[k].mayChu.kb} KB · ws ${kq[k].ws}/${kq[k].wsKhung} ngoài [${kq[k].ngoai.join(' ')}]` + (kq[k].top.length ? '\n    ' + kq[k].top.slice(0, 5).join(' · ') : ''));
  if (DO) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'mang_' + NHAN + '.json'), JSON.stringify(kq, null, 1)); }
  const S = kq.solo || { ycMoiPhut: 0, kbMoiPhut: 0, ws: 0, ngoai: [] };
  if (fbGia.co) console.log('Firebase trong trận offline: ' + (fbGia.ok ? 'ngắt khi đánh, nối lại ở menu ✓' : 'KHÔNG ngắt ✗ ' + JSON.stringify(fbGia)));
  const truot = (fbGia.co && !fbGia.ok) || S.ycMoiPhut > 1 || S.kbMoiPhut > 8 || S.ws > 0 || S.ngoai.length > 0 || loi.length > 0;
  if (loi.length) console.log('LỖI: ' + loi.join(' | '));
  console.log(truot ? `MẠNG: ĐỎ — trận SOLO còn ${S.ycMoiPhut} yêu cầu/phút, ${S.kbMoiPhut} KB/phút (phải ≤ 1 và ≤ 8 KB)` : 'MẠNG: XANH');
  process.exit(truot ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
