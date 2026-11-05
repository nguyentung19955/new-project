// TURRET MERGE — Pass 9 khung thẻ: chụp phóng to MỌI khung the_khung_<bậc> ở từng chỗ (bộ bài, bộ sưu tập, xem, chỉ huy, presets, vào trận, khay SOLO/CO-OP/PVP, dải đồng đội)
// tại 390×844 DPR 3 → OUT<chỗ>.jpg + ghép sau.png; kiểm hoạ tiết KHÔNG bị cha overflow:hidden cắt (ô ảnh có scale của css/khung-p9.css).
//   BASE=http://localhost:8765 OUT=docs/demo-hop-tuong/tuvan/khung/sau_ node tools/thap-kt-khung-p9.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765', OUT = process.env.OUT || 'shots/khung_';
const DECK = ['lophanung', 'radar', 'lien', 'bang', 'canon'];
const KT = () => { // khung hiện + ô cha nào overflow != visible mà cắt vào vùng ảnh đã phóng
  const hong = []; let n = 0;
  for (const k of document.querySelectorAll('img[src*="the_khung_"]')) {
    const r = k.getBoundingClientRect(); if (r.width < 4) continue;
    let an = false; for (let x = k; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) { an = true; break; } } if (an) continue;
    n++;
    for (let x = k.parentElement; x && x !== document.body; x = x.parentElement) {
      const c = getComputedStyle(x); if (c.overflow === 'visible' && c.clipPath === 'none') continue;
      const p = x.getBoundingClientRect();
      const ra = Math.max(p.left - r.left, r.right - p.right, p.top - r.top, r.bottom - p.bottom);
      if (ra > 2 && x === k.parentElement) hong.push((x.id || x.className) + ' cắt khung ' + ra.toFixed(1) + 'px (' + k.src.split('/').pop() + ')');
      break;
    }
  }
  return { n, hong };
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('turret_bo', JSON.stringify({ chon: d, mv: 'hero' })); localStorage.setItem('turret_hd', JSON.stringify({ xong: false, boQua: true, buoc: {} })); } catch (e) { } }, DECK);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const anh = []; const kq = {};
  const chup = async (ten, sel, pad = 14) => {
    const r = await p.evaluate(([s, pad]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 2) return null;
      const x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad); return { x, y, width: Math.min(innerWidth - x, r.width + pad * 2), height: Math.min(innerHeight - y, r.height + pad * 2) }; }, [sel, pad]);
    if (!r) { console.log('  (không thấy ' + sel + ')'); return; }
    const f = OUT + ten + '.jpg'; await p.screenshot({ path: f, clip: r, type: 'jpeg', quality: 88 }); anh.push(f);
  };
  const kt = async (ten) => { kq[ten] = await p.evaluate(KT); };
  await p.goto(BASE + '/thap/?notut=1&nointro=1', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  await p.evaluate(() => HM.di('dk')); await p.waitForTimeout(1200);
  await chup('deck_o', '#chon-bo'); await chup('deck_mv', '#dk-mv'); await kt('deck');
  // bộ sưu tập: cuộn tới thẻ đỏ / vàng / tím
  for (const bac of ['do', 'vang', 'tim', 'xanh']) {
    const id = await p.evaluate((bac) => { const c = [...document.querySelectorAll('#chon-luoi .c[data-id]')].find(c => (c.querySelector('img.kh') || {}).src && c.querySelector('img.kh').src.includes('the_khung_' + bac + '.png'));
      if (!c) return null; c.scrollIntoView({ block: 'center' }); return c.dataset.id; }, bac);
    if (!id) { console.log('  (không có thẻ ' + bac + ')'); continue; }
    await p.waitForTimeout(500); await chup('bst_' + bac, '#chon-luoi .c[data-id="' + id + '"]', 22); await kt('bst ' + bac);
  }
  await p.evaluate(() => HM.moMVs()); await p.waitForTimeout(700); await chup('chihuy', '#hm-tam', 0); await kt('chihuy');
  await p.evaluate(() => HM.moPre()); await p.waitForTimeout(700); await chup('presets', '#hm-tam', 0); await kt('presets');
  await p.evaluate(() => HM.dong(true));
  for (const che of ['solo', 'coop', 'pvp']) {
    await p.goto(BASE + '/thap/?mode=' + che + '&deck=' + DECK.join(',') + '&deck2=drone,bao,kiembang,hydra,anhsang&mana=3000&notut=1', { waitUntil: 'load' }); await p.waitForTimeout(3200);
    await chup('vaotran_' + che, '#nd-gt', 0); await kt('vaotran ' + che);
    for (let i = 0; i < 2; i++) { await p.mouse.click(195, 844 * .56); await p.waitForTimeout(600); }
    await p.waitForTimeout(900);
    await chup('khay_' + che, '#bo-the', 16); await chup('chihuy_tran_' + che, '#the-mv', 16); await kt('tran ' + che);
    if (che !== 'solo') await chup('dai_' + che, '#dp-dai', 6);
  }
  let loi = errs.length; for (const [k, v] of Object.entries(kq)) { console.log(k, JSON.stringify(v)); loi += v.hong.length; }
  console.log('lỗi trang', errs.slice(0, 5));
  // ghép sau.png
  const g = await b.newPage({ viewport: { width: 1200, height: 800 } });
  const fs = require('fs');
  await g.setContent('<body style="margin:0;background:#222;color:#ddd;font:14px sans-serif;display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:1184px">' + anh.map(f => '<figure style="margin:0"><img style="max-width:580px;max-height:420px" src="data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64') + '"><figcaption>' + require('path').basename(f) + '</figcaption></figure>').join('') + '</body>');
  await g.screenshot({ path: OUT.replace(/[^/]*$/, '') + 'sau.png', fullPage: true });
  console.log(loi ? 'HỎNG: ' + loi : 'ĐẠT'); await b.close(); process.exitCode = loi ? 1 : 0;
})();
