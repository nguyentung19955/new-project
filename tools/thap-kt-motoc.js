// TURRET MERGE — kiểm tra "mờ tóc": chụp phóng to phần ĐỈNH TÓC chân dung ở mọi nơi (390×844 DPR3) + soát bằng script:
//  · không phần tử chân dung (img pilot_/af_ hoặc tổ tiên ≤4 cấp) có mask-image gradient mờ ở PHÍA TRÊN, không ::before/::after gradient phủ, không filter blur
//  · không huy hiệu vai trò tròn (.gl/.gt-gl/.tt-gl/.up-gl/.ic) hiện cạnh mặt trên thẻ/ô
// Chạy: python3 -m http.server 8765 (gốc repo) rồi  OUT=docs/demo-hop-tuong/tuvan/motoc/sau/ node tools/thap-kt-motoc.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/';
const URL = 'http://localhost:8765/thap/';
fs.mkdirSync(OUT, { recursive: true });
function audit() {
  const out = { mask: [], overlay: [], blur: [], badge: [], n: 0 };
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && el.checkVisibility && el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }); };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : '');
  const imgs = [...document.querySelectorAll('img')].filter(im => /pilot_|af_(hero|dahlia|eve)/.test(im.getAttribute('src') || '') && vis(im));
  out.n = imgs.length;
  for (const im of imgs) {
    let el = im;
    for (let d = 0; d < 5 && el; d++, el = el.parentElement) {
      const cs = getComputedStyle(el), m = cs.maskImage || cs.webkitMaskImage || '';
      // mờ ở phía trên = có gradient dọc (to bottom/to top/không hướng) mà điểm đầu trong suốt
      for (const g of m.match(/linear-gradient\((?:[^()]|\([^()]*\))*\)/g) || []) {
        const dir = (g.match(/^linear-gradient\(\s*(to [a-z ]+|-?[\d.]+deg)/) || [])[1] || 'to bottom';
        const stops = g.replace(/^linear-gradient\(\s*(to [a-z ]+|-?[\d.]+deg)\s*,/, '').split(/,(?![^(]*\))/).map(s => s.trim());
        const doc = /bottom|top|^180deg|^0deg/.test(dir);
        const tren = /top/.test(dir) ? stops[stops.length - 1] : stops[0];
        if (doc && /transparent|rgba\([^)]*,\s*0\)|#0000/.test(tren)) out.mask.push(name(el) + ' <- ' + name(im) + ' :: ' + g.slice(0, 90));
      }
      if (/blur\(/.test(cs.filter)) out.blur.push(name(el) + ' ' + cs.filter);
      for (const p of ['::before', '::after']) { const c = getComputedStyle(el, p); if (c.content !== 'none' && c.content !== 'normal' && /gradient/.test(c.backgroundImage)) out.overlay.push(name(el) + p); }
    }
    if (/blur\(/.test(getComputedStyle(im).filter)) out.blur.push(name(im));
    // phủ anh em (lớp phủ gradient chồng lên ảnh)
    for (const s of im.parentElement ? im.parentElement.children : []) { if (s === im) continue; const c = getComputedStyle(s); if (/gradient/.test(c.backgroundImage) && vis(s)) out.overlay.push(name(s)); }
  }
  for (const b of document.querySelectorAll('.gl, .gt-gl, .tt-gl, .up-gl, .c .ic, .the .ic, .o-bo .ic, .dp-the .ic, .vt-ten img')) if (vis(b) && b.tagName === 'IMG') out.badge.push(name(b.parentElement) + ' > ' + name(b) + ' ' + (b.getAttribute('src') || ''));
  return out;
}
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } }); // mở đủ bộ sưu tập
  const errs = [], rep = {};
  const mo = async (q, cho = 2200) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ' :: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/firebase|ERR_|net::|Failed to load resource/i.test(m.text())) errs.push(q + ' :: console ' + m.text()); });
    await p.goto(URL + q, { waitUntil: 'load' }); await p.waitForTimeout(cho);
    await p.evaluate(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } });
    return p;
  };
  const chup = async (p, ten) => { await p.screenshot({ path: OUT + ten + '.jpg', type: 'jpeg', quality: 85 }); rep[ten] = await p.evaluate(audit); };
  // phóng phần trên các chân dung khớp sel (tối đa n): cắt nửa trên của phần tử chứa
  const crop = async (p, sel, ten, n = 10, phan = 0.6) => {
    const rs = await p.evaluate(([s, n]) => [...document.querySelectorAll(s)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight; }).slice(0, n).map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }), [sel, n]);
    let i = 0;
    for (const [x, y, w, h] of rs) {
      const cx = Math.max(0, x - 2), cy = Math.max(0, y - 4);
      await p.screenshot({ path: OUT + ten + '-' + (i++) + '.jpg', type: 'jpeg', quality: 85, clip: { x: cx, y: cy, width: Math.min(390 - cx, w + 4), height: Math.max(8, Math.min(844 - cy, h * phan + 4)) } });
    }
    return rs.length;
  };
  let p = await mo('?notut=1');
  await chup(p, '01-home'); await crop(p, '.hm-anh', 'z01-home-hero', 1, 0.5);
  await p.evaluate(() => { UI.chon = ['sungluc', 'canon', 'bang', 'tia', 'aten']; UI.veBoChon(); HM.di('dk'); HM.ve(); });
  await p.waitForTimeout(1200); await chup(p, '02-deck');
  await crop(p, '#chon-luoi .c', 'z02-roster', 10); await crop(p, '#chon-bo .o-bo', 'z03-slot', 5, 0.8);
  await p.evaluate(() => { try { HM.moPre(); } catch (e) { } }); await p.waitForTimeout(700); await chup(p, '03-presets'); await crop(p, '#hm-mo img[src*="pilot_"]', 'z05-preset', 6, 0.8);
  await p.evaluate(() => { try { HM.dong(true); HM.moXem('sungluc'); } catch (e) { } }); await p.waitForTimeout(700); await chup(p, '04-xem'); await crop(p, '.hm-xem-po', 'z06-xem', 1, 0.7);
  await p.evaluate(() => { try { HM.dong(true); HM.moMVs(); } catch (e) { } }); await p.waitForTimeout(700); await chup(p, '05-mvs'); await crop(p, '#hm-mo .mv-anh', 'z07-mvs', 3, 0.8);
  await p.evaluate(() => { try { HM.dong(true); } catch (e) { } UP.mo('sungluc'); }); await p.waitForTimeout(1500); await chup(p, '06-unit-revolver'); await crop(p, '#up .up-pi', 'z08-hero-revolver', 1, 0.5);
  for (const id of ['doc', 'aten', 'overlord']) { await p.evaluate((id) => UP.mo(id), id); await p.waitForTimeout(900); await crop(p, '#up .up-pi', 'z08-hero-' + id, 1, 0.5); }
  await p.evaluate(() => { const t = document.querySelector('#up .up-than'); t.scrollTop = t.scrollHeight; }); await p.waitForTimeout(400); await crop(p, '#up .up-the', 'z09-unit-the', 4, 0.8);
  await p.evaluate(() => { UP.dong && UP.dong(); }); await p.waitForTimeout(500);
  await p.evaluate(() => { UP.moMV('hero'); }); await p.waitForTimeout(1300); await chup(p, '07-commander'); await crop(p, '#up .up-pi', 'z10-hero-cmd', 1, 0.5);
  await p.evaluate(() => { UP.dong && UP.dong(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { try { ONL.code = 'ABCD'; ONL.host = true; ONL.meta = { host: 'me', st: 'wait' }; ONL.pl = { me: { ten: 'Tung', av: 'sungluc', deck: ['sungluc', 'canon', 'bang', 'tia', 'aten'], mv: 'hero' }, b: { ten: 'Bot', av: 'aten', deck: ['doc', 'set', 'lien', 'bang', 'tia'], mv: 'eve' } }; ONL.me = 'me'; ONL.veSanh(); } catch (e) { console.log('sanh', e.message); } });
  await p.waitForTimeout(700); await chup(p, '08-sanh'); await crop(p, 'img[src*="pilot_"],img[src*="af_"]', 'z11-sanh', 6, 0.8);
  await p.close();
  for (const che of ['solo', 'coop', 'pvp']) {
    p = await mo('?mode=' + che + '&deck=sungluc,canon,bang,tia,aten&wave=3&fill=3&mana=999&intro=1', 500);
    await p.evaluate(() => { try { VT.batDau(); } catch (e) { } }); await p.waitForTimeout(1500); await chup(p, '1-' + che + '-vaotran'); await crop(p, '.vt-kh', 'z12-' + che + '-vaotran', 6, 0.8);
    await p.evaluate(() => { try { VT.dong(); } catch (e) { } }); await p.waitForTimeout(1800); await chup(p, '1-' + che + '-tran');
    await crop(p, '#bo-the .the', 'z13-' + che + '-tray', 5, 0.8); await crop(p, '#the-mv', 'z14-' + che + '-cmd', 1, 0.8); await crop(p, '#dp-dai .dp-the', 'z15-' + che + '-strip', 6, 1);
    if (che === 'solo') {
      await p.evaluate(() => { const T = G.ban[0].t.find(t => t); UI.moTT(T.id, T); }); await p.waitForTimeout(500); await chup(p, '1-solo-tt'); await crop(p, '#tt .tt-anh', 'z16-tt', 1, 1);
      await p.evaluate(() => { $('#tt').hidden = true; ketThuc(false); }); await p.waitForSelector('#ketqua:not([hidden])', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(900); await chup(p, '1-solo-ketqua'); await crop(p, '#ketqua img[src*="pilot_"],#ketqua img[src*="af_"]', 'z17-ketqua', 6, 0.8);
    }
    await p.close();
  }
  fs.writeFileSync(OUT + 'audit.json', JSON.stringify({ rep, errs }, null, 1));
  const tong = { mask: 0, overlay: 0, blur: 0, badge: 0, n: 0 };
  for (const k in rep) for (const f in tong) tong[f] += f === 'n' ? rep[k].n : rep[k][f].length;
  console.log('tong', JSON.stringify(tong)); for (const k in rep) { const r = rep[k]; if (r.mask.length + r.overlay.length + r.blur.length + r.badge.length) console.log(k, JSON.stringify({ mask: [...new Set(r.mask)], ov: [...new Set(r.overlay)], blur: r.blur, badge: [...new Set(r.badge)].slice(0, 4) })); }
  console.log('errors:', errs.length); errs.slice(0, 20).forEach(e => console.log('  ' + e));
  await b.close();
})();
