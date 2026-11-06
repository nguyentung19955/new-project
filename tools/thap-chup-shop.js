// TURRET MERGE — ảnh kiểm CỬA HÀNG / RƯƠNG / VÒNG QUAY / NHIỆM VỤ / SỰ KIỆN → docs/demo-hop-tuong/tuvan/shop/
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-shop.js   (SIZES=390x844x3)
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/shop/';
const SIZES = (process.env.SIZES || '390x844x3,360x780x3,430x932x3,1280x800x1').split(',').map(s => s.split('x').map(Number));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const LOI = [];
  for (const [w, h, d] of SIZES) {
    const co = w + 'x' + h, chinh = co === '390x844';
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: d, hasTouch: w < 800, isMobile: w < 800 });
    const p = await ctx.newPage();
    p.on('pageerror', e => LOI.push(co + ' pageerror ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION|favicon|firebase/i.test(m.text())) LOI.push(co + ' console ' + m.text().slice(0, 200)); });
    p.on('response', r => { if (r.status() >= 400 && /\/thap\//.test(r.url())) LOI.push(co + ' ' + r.status() + ' ' + r.url()); });
    await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof KTUI !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await sleep(1500);
    // người chơi đã chơi vài trận: có ngọc + vàng, 2 nhiệm vụ xong, sự kiện 420 điểm
    await p.evaluate(() => {
      const d = THEBAI.doc(); d.vang = 24500; d.ngoc = 1260; KT.nv(); const s = KT.doc();
      s.nv.tien[s.nv.ds[0]] = 999; s.nv.tien[s.nv.ds[1]] = 2; s.sk = { tuan: KT.tuan(), diem: 420, nhan: { 0: 1 } }; s.tk.wave = 34; s.tk.trum = 3;
      KT.luu(); HM.ve();
    });
    await sleep(400);
    const chup = async (ten) => { await sleep(350); await p.screenshot({ path: OUT + co + '_' + ten + '.png' }); };
    await chup('home');
    const mo = async (tab) => { await p.evaluate((t) => KTUI.moTab(t), tab); await sleep(300); };
    await mo('shop'); await chup('shop');
    await p.evaluate(() => { document.getElementById('kt-than').scrollTop = 9999; }); await chup('shop_duoi');
    await p.evaluate(() => KTUI.tiLe('vang')); await chup('ti_le_ruong_vang');
    await p.evaluate(() => KTUI.dongPhu());
    if (chinh) {
      await p.click('[data-act="kt-ru"][data-k="vang"]');
      await sleep(500); await chup('mo_ruong_1_lac');
      await sleep(700); await chup('mo_ruong_2_bung');
      await sleep(1300); await chup('mo_ruong_3_lat');
      await sleep(2600); await chup('mo_ruong_4_tong');
      await p.evaluate(() => KTUI.dongPhu());
    }
    await mo('vq'); await chup('vong_quay');
    if (chinh) {
      await p.click('[data-act="kt-quay"][data-tra="0"]'); await sleep(1500); await chup('vong_quay_dang_quay');
      await sleep(2600); await chup('vong_quay_trung');
      await p.evaluate(() => KTUI.dongPhu()); await p.evaluate(() => KTUI.tiLe('vq')); await chup('ti_le_vong_quay');
      await p.evaluate(() => KTUI.dongPhu());
    }
    await mo('nv'); await chup('nhiem_vu');
    await p.evaluate(() => { document.getElementById('kt-than').scrollTop = 9999; }); await chup('thanh_tuu');
    await mo('sk'); await chup('su_kien');
    await p.evaluate(() => KTUI.dong()); await sleep(200);
    await ctx.close();
    console.log(co, 'xong');
  }
  await b.close();
  console.log(LOI.length ? 'LỖI:\n' + LOI.join('\n') : 'KHÔNG LỖI');
  process.exit(LOI.length ? 1 : 0);
})();
