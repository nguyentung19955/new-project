// TURRET MERGE — dải ảnh VÒNG HỒI CHIÊU xanh lá (PX.vongHoi) ở 0/25/50/75/100 % + nhịp loé khi đầy.
// Trận SOLO/CO-OP/PVP (iPhone 13 390x844 DPR3) + trang ụ (Turret File, ?preview=<id>) — cắt quanh 1 ụ, ghép dải.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-vonghoi.js
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/vong_hoichieu/';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const PS = [0, 0.25, 0.5, 0.75, 1, 'loe'];
const CANH = [
  { ten: 'solo_blackhole', url: `${BASE}?mode=solo&deck=blackhole,canon,bang,tia,set&wave=3&fill=2&notut=1&nointro=1`, id: 'blackhole' },
  { ten: 'solo_mana', url: `${BASE}?mode=solo&deck=mana,canon,bang,tia,set&wave=3&fill=2&notut=1&nointro=1`, id: 'mana' },
  { ten: 'coop_blackhole', url: `${BASE}?mode=coop&deck=blackhole,canon,bang,tia,set&deck2=drone,bao,kiembang,hydra,anhsang&wave=3&fill=2&notut=1&nointro=1`, id: 'blackhole' },
  { ten: 'pvp_blackhole', url: `${BASE}?mode=pvp&deck=blackhole,canon,bang,tia,set&deck2=drone,bao,kiembang,hydra,anhsang&wave=3&fill=2&notut=1&nointro=1`, id: 'blackhole' },
  { ten: 'turretfile_blackhole', url: `${BASE}?preview=blackhole&star=4`, id: 'blackhole', demo: 1 },
  { ten: 'turretfile_ronglua', url: `${BASE}?preview=ronglua&star=4`, id: 'ronglua', demo: 1 },
];
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  for (const c of CANH) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(c.ten + ' :: ' + e.message));
    p.on('console', x => { if (x.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(x.text())) errs.push(c.ten + ' console :: ' + x.text()); });
    await p.goto(c.url, { waitUntil: 'load' });
    const ok = await p.waitForFunction((id) => typeof REN !== 'undefined' && G.ban && G.ban[0] && G.ban[0].t.some(T => T && T.id === id) && typeof PX !== 'undefined' && PX.vongHoi, c.id, { timeout: 30000 }).then(() => 1).catch(() => { errs.push(c.ten + ' :: không thấy ụ ' + c.id); return 0; });
    if (!ok) { await p.close(); continue; }
    await sleep(4500);
    // giữ T.nap cố định ngay trước mỗi lượt vẽ (chỉ hiển thị)
    await p.evaluate((id) => {
      window._vhP = 0;
      const g = REN.ve0.bind(REN);
      REN.ve0 = function () { for (const B of G.ban) for (const T of B.t) if (T && T.id === id && B === G.ban[0]) { T.nap = window._vhP; } return g(); };
      const bw = document.querySelector('#bang-wave'); if (bw) bw.hidden = true;
    }, c.id);
    const tiles = [];
    for (const v of PS) {
      if (v === 'loe') { await p.evaluate(() => { window._vhP = 0.9; }); await sleep(250); await p.evaluate(() => { window._vhP = 1; }); await sleep(110); }
      else { await p.evaluate((v) => { window._vhP = v; }, v); await sleep(v === 1 ? 700 : 350); }
      const box = await p.evaluate((id) => {
        const B = G.ban[0], T = B.t.find(T => T && T.id === id), o = B.o[T.o], r = REN.cv.getBoundingClientRect(), s = REN.s;
        const k = (B.cw || 60) * 0.62;
        return { x: r.left + (o.x - k) * s, y: r.top + (o.y - k) * s, width: 2 * k * s, height: 2 * k * s };
      }, c.id);
      if (!(box.width > 0)) { errs.push(c.ten + ' :: hộp cắt ' + JSON.stringify(box)); break; }
      const f = path.join(OUT, `_${c.ten}_${v}.png`);
      await p.screenshot({ path: f, clip: box });
      tiles.push(f);
    }
    fs.writeFileSync(path.join(OUT, `_${c.ten}.json`), JSON.stringify(tiles));
    if (!c.demo) { // thẻ chỉ huy: vòng hồi chiêu (h2_vong_xanh) ở 25/50/75 %
      for (const q of [0.25, 0.5, 0.75]) {
        await p.evaluate((q) => { const B = G.ban[0]; if (!B.mv) return; const d = MAVUONG[B.mv.id]; clearInterval(window._cd); window._cd = setInterval(() => { B.mv.cd = d.cd * (1 - q); }, 20); B.mv.cd = d.cd * (1 - q); UI.capNhat(); }, q);
        await sleep(250);
        const mv = await p.$('#the-mv'); if (mv) await mv.screenshot({ path: path.join(OUT, `chihuy_${c.ten}_${Math.round(q * 100)}.png`) });
      }
    }
    await p.screenshot({ path: path.join(OUT, `toan_${c.ten}.png`) });
    await p.close();
  }
  await b.close();
  console.log('LỖI TRANG:', errs.length); errs.forEach(e => console.log(' ', e));
  process.exitCode = errs.length ? 1 : 0;
})();
