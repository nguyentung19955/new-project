// TURRET MERGE — ảnh kiểm 4 ụ vàng mới đợt 1 (390×844 DPR 3): bộ sưu tập, trang ụ, dải khung kỹ năng trong trận SOLO + CO-OP
//   python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-vangmoi1.js
// → docs/demo-hop-tuong/tuvan/tuong_vang/dot1/ (khung lẻ ghép thành dải bằng PIL ở cuối). Thoát mã 1 nếu có lỗi trang.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tuong_vang/dot1/';
const IDS = ['lualien', 'hopca', 'luutru', 'xuonganh'];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(path.join(OUT, 'k'), { recursive: true });
const LOI = [];
async function trang(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  const p = await ctx.newPage();
  p.on('pageerror', e => LOI.push(e.message));
  p.on('response', r => { if (r.status() >= 400 && /\/thap\//.test(r.url())) LOI.push(r.status() + ' ' + r.url()); });
  return { ctx, p };
}
// dàn bàn + kích hoạt kỹ năng, chụp n khung quanh bàn mình
const DAN = {
  lualien: `dat(6,'lualien',3); dat(8,'lualien',3); dat(2,'lualien',3); dat(12,'lualien',3); var a = dat(5,'lualien',2), b = dat(7,'lualien',2); B.deck=['lien']; ghep(B, a, b);`,
  hopca: `for (const o of [0,1,2,3,4,10,11,12]) dat(o, o % 2 ? 'lien' : 'canon', 3); dat(7,'hopca',3); var a = dat(5,'lien',2), b = dat(6,'lien',2); B.deck=['hopca']; ghep(B, a, b);`,
  luutru: `dat(2,'luutru',3); dat(12,'luutru',3); for (let i=0;i<8;i++){ const a=dat(0,'lien',1), b=dat(1,'lien',1); B.deck=['lien']; ghep(B,a,b); B.t[1]=null; } var a = dat(6,'luutru',3), b = dat(7,'luutru',3); B.deck=['lien']; ghep(B, a, b);`,
  xuonganh: `for (const o of [0,1,2,3,4,10,11,12,13,14]) dat(o,'lien',2); var a = dat(6,'xuonganh',3), b = dat(7,'xuonganh',3); B.deck=['lien']; ghep(B, a, b);`,
};
async function dai(b, che, id) {
  const { ctx, p } = await trang(b);
  await p.goto(BASE + '?mode=' + che + '&deck=' + IDS.join(',') + ',lien&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 60000 });
  await sleep(10000); // màn giới thiệu trùm / lịch trùm đầu trận tự tắt
  await p.evaluate(() => { G.tocDo = 1; G.cho = 1e9; const B = G.ban[0]; B.t.fill(null); G.quai.length = 0; window.dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; }; window.B = B; });
  // quái trên đường để thấy xung nổ / đạn
  await p.evaluate(() => { for (let i = 0; i < 10; i++) { sinhQuai('bo', 0, 120 + i * 18, 30); G.quai[G.quai.length - 1].vao = 1; } });
  await sleep(300);
  await p.evaluate(DAN[id]);
  const bb = await p.evaluate(() => { const B = G.ban[0], r = document.getElementById('cv').getBoundingClientRect(), k = r.width / W, xs = B.o.map(c => c.x), ys = B.o.map(c => c.y); const x0 = Math.min(...xs) - B.cw, y0 = Math.min(...ys) - B.ch * 1.2, x1 = Math.max(...xs) + B.cw, y1 = Math.max(...ys) + B.ch * 1.2; return { x: Math.max(0, r.left + x0 * k), y: Math.max(0, r.top + y0 * k), width: (x1 - x0) * k, height: (y1 - y0) * k }; });
  const ds = [];
  for (let i = 0; i < 6; i++) { const f = path.join(OUT, 'k', che + '_' + id + '_' + i + '.png'); await p.screenshot({ path: f, clip: bb }); ds.push(f); await sleep(i < 3 ? 140 : 450); }
  if (che === 'coop') await p.screenshot({ path: path.join(OUT, 'coop_' + id + '_ca.png') });
  await ctx.close();
  return ds;
}
(async () => {
  const b = await chromium.launch();
  // bộ sưu tập + trang ụ
  { const { ctx, p } = await trang(b);
    await p.goto(BASE, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof HM !== 'undefined' && document.querySelector('#hm-deck'), null, { timeout: 60000 }); await sleep(2500);
    await p.click('#hm-deck'); await sleep(1500);
    await p.evaluate(() => { const c = document.querySelector('#chon-luoi .c[data-id="lualien"]'); if (c) c.scrollIntoView({ block: 'center' }); }); await sleep(1200);
    await p.screenshot({ path: path.join(OUT, 'bo_suu_tap.png') });
    for (const id of IDS) { await p.evaluate((id) => UP.mo(id, document.querySelector('#chon-luoi .c[data-id="' + id + '"]')), id); await sleep(1500); await p.screenshot({ path: path.join(OUT, 'trang_' + id + '.png') }); await p.evaluate(() => { const x = document.querySelector('[data-a="dong"], .up-dong, #up-dong'); if (x) x.click(); else if (UP.dong) UP.dong(); }); await sleep(500); }
    await ctx.close(); }
  for (const che of ['solo', 'coop']) for (const id of IDS) {
    const ds = await dai(b, che, id);
    execFileSync('python3', ['-c', 'import sys;from PIL import Image\nim=[Image.open(f) for f in sys.argv[2:]];w=sum(i.width for i in im);h=max(i.height for i in im);o=Image.new("RGB",(w,h));x=0\nfor i in im:o.paste(i,(x,0));x+=i.width\no.thumbnail((3600,3600));o.save(sys.argv[1])', path.join(OUT, 'dai_' + che + '_' + id + '.png'), ...ds]);
  }
  await b.close();
  fs.rmSync(path.join(OUT, 'k'), { recursive: true, force: true });
  console.log(LOI.length ? '✗ lỗi:\n' + [...new Set(LOI)].slice(0, 20).join('\n') : '✓ không lỗi trang');
  process.exit(LOI.length ? 1 : 0);
})();
