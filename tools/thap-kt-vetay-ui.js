// TURRET MERGE — RÀ SOÁT VẼ TAY (vùng UI): mở từng màn DOM, liệt kê MỌI phần tử đang hiện có hình vẽ bằng CSS
// (gradient, box-shadow, viền, outline, bo góc + nền màu, clip-path, glow, ::before/::after hình khối, ký tự giả icon)
// + quy về tệp CSS/luật gây ra. Chụp màn (390×844 DPR3).
// Chạy: python3 -m http.server 8765 (gốc repo) rồi  OUT=docs/demo-hop-tuong/tuvan/vetay/ui/sau/ node tools/thap-kt-vetay-ui.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/';
const JSON_OUT = process.env.JSON || '';
const URL = 'http://localhost:8765/thap/';
fs.mkdirSync(OUT, { recursive: true });

function auditPage() { // chạy trong trang
  const GLYPH = /[←-⇿⌀-⏿■-➿⬀-⯿✀-➿☀-⛿✓✗✕✖★☆❤➔➜❰-❵\u{1f300}-\u{1faff}]/u;
  const alpha = (c) => { if (!c || c === 'transparent') return 0; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const rules = [];
  for (const sh of document.styleSheets) {
    let rs; try { rs = sh.cssRules; } catch (e) { continue; }
    const file = (sh.href || 'inline-style').split('/').pop();
    const walk = (list) => { for (const r of list) { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText) rules.push({ file, r }); } };
    walk(rs);
  }
  const nguon = (el, pseudo, props) => {
    const out = new Set();
    for (const { file, r } of rules) {
      for (const sel of r.selectorText.split(',')) {
        const s = sel.trim(); const coP = /::?(before|after)\s*$/.test(s);
        if (!!pseudo !== coP) continue;
        if (pseudo && !s.replace(/:/g, ':').includes(pseudo)) continue;
        const base = s.replace(/::?(before|after)\s*$/, '') || '*';
        let ok = false; try { ok = el.matches(base); } catch (e) { }
        if (!ok) continue;
        for (const p of props) if (r.style.getPropertyValue(p)) { out.add(file + ' ' + s + ' {' + p + '}'); }
      }
    }
    if (!pseudo && el.getAttribute('style')) for (const p of props) if (el.style.getPropertyValue(p)) out.add('inline-style(js) {' + p + '}');
    return [...out];
  };
  const vis = (el) => { if (!el.checkVisibility || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false; const r = el.getBoundingClientRect(); return r.width > 0.5 && r.height > 0.5 && r.bottom > 0 && r.top < innerHeight; };
  const res = [];
  const check = (el, pseudo) => {
    const cs = getComputedStyle(el, pseudo || null);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal' || cs.display === 'none')) return;
    const f = [], props = [];
    const bi = cs.backgroundImage || '', bsrc = cs.borderImageSource || 'none';
    if (/gradient/.test(bi)) { f.push('gradient'); props.push('background', 'background-image'); }
    if (/gradient/.test(cs.maskImage || cs.webkitMaskImage || '')) { f.push('mask-gradient'); props.push('mask-image', '-webkit-mask-image'); }
    if (cs.boxShadow && cs.boxShadow !== 'none') { f.push('box-shadow'); props.push('box-shadow'); }
    if (bsrc === 'none') {
      const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(s => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none' && cs['border' + s + 'Style'] !== 'hidden' && alpha(cs['border' + s + 'Color']) > 0.04);
      if (sides.length) { f.push('border(' + sides.map(s => s[0]).join('') + ' ' + cs['border' + sides[0] + 'Style'] + ')'); props.push('border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-color', 'border-width', 'border-style', 'border-top-color', 'border-left-color', 'border-bottom-color'); }
    }
    if (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none' && alpha(cs.outlineColor) > 0.04) { f.push('outline'); props.push('outline'); }
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    const coAnh = /url\(/.test(bi) || bsrc !== 'none';
    if (rad > 0 && alpha(cs.backgroundColor) > 0.04 && !coAnh && el.tagName !== 'IMG') { f.push('rounded-plate'); props.push('border-radius', 'background', 'background-color'); }
    if (cs.clipPath && cs.clipPath !== 'none' && !(el.tagName === 'IMG' && el._mat)) { f.push('clip-path'); props.push('clip-path'); }
    if (/drop-shadow\([^)]*\)/.test(cs.filter)) {
      const glow = [...cs.filter.matchAll(/drop-shadow\((rgba?\([^)]*\))[^)]*\)/g)].some(m => { const c = m[1].match(/[\d.]+/g).map(Number); return (c[0] + c[1] + c[2]) > 60; });
      if (glow) { f.push('glow-filter'); props.push('filter'); }
    }
    if (pseudo) {
      const txt = cs.content.replace(/^"|"$/g, '');
      if (txt && txt !== '' && cs.content !== '""') { f.push('pseudo-glyph:' + txt); props.push('content'); }
      else if (!coAnh && (alpha(cs.backgroundColor) > 0.04)) { f.push('pseudo-block'); props.push('background', 'background-color'); }
    } else {
      // khối màu nhỏ giả vật thể (không chữ, không ảnh)
      const r = el.getBoundingClientRect();
      if (!coAnh && alpha(cs.backgroundColor) > 0.04 && !el.textContent.trim() && !el.querySelector('img,canvas,iframe') && el.tagName !== 'IMG' && el.tagName !== 'CANVAS' && r.width * r.height < 3000 && el.children.length === 0) { f.push('color-block'); props.push('background', 'background-color'); }
      for (const n of el.childNodes) if (n.nodeType === 3 && GLYPH.test(n.textContent)) { f.push('text-glyph:' + n.textContent.trim().slice(0, 8)); }
    }
    if (!f.length) return;
    const r = el.getBoundingClientRect();
    let path = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : '');
    let p = el.parentElement, d = 0; while (p && d < 2 && p.id !== 'wrap') { path = (p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + (p.classList.length ? '.' + [...p.classList].slice(0, 2).join('.') : '')) + ' > ' + path; p = p.parentElement; d++; }
    res.push({ el: path + (pseudo || ''), f, rect: [r.x, r.y, r.width, r.height].map(Math.round), src: nguon(el, pseudo, [...new Set(props)]) });
  };
  for (const el of document.querySelectorAll('#wrap *, #wrap')) {
    if (!vis(el)) continue;
    check(el); check(el, '::before'); check(el, '::after');
  }
  return res;
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3) });
  const errs = [], all = {};
  const mo = async (q, cho = 1800) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ' :: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/firebase|ERR_|net::/i.test(m.text())) errs.push(q + ' :: console ' + m.text()); });
    await p.goto(URL + q, { waitUntil: 'load' }); await p.waitForTimeout(cho); return p;
  };
  const chup = async (p, ten) => { await p.screenshot({ path: OUT + ten + '.jpg', type: 'jpeg', quality: 78 }); all[ten] = await p.evaluate(auditPage); };
  const sach = async (p) => p.evaluate(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } });

  let p = await ctx.newPage();
  p.on('pageerror', e => errs.push('tai :: ' + e.message));
  await p.goto(URL + '?notut=1', { waitUntil: 'commit' }); await p.waitForSelector('#tai:not([hidden])', { timeout: 5000 }).catch(() => { });
  await p.waitForTimeout(150); await chup(p, '00-loading');
  await p.waitForTimeout(2500); await sach(p); await p.close();

  p = await mo('?notut=1');
  await chup(p, '01-menu');
  await p.evaluate(() => { UI.chon = ['canon', 'bang', 'tia']; UI.veBoChon && UI.veBoChon(); UI.veChon && UI.veChon(); });
  await p.waitForTimeout(300); await chup(p, '02-menu-3chon');
  await p.evaluate(() => { const l = document.querySelector('#chon-luoi'); l.scrollTop = l.scrollHeight; });
  await p.waitForTimeout(300); await chup(p, '03-menu-cuoi');
  await p.evaluate(() => UP.mo('canon')); await p.waitForTimeout(1500); await chup(p, '04-unitpage');
  await p.evaluate(() => { const t = document.querySelector('#up .up-than'); t.scrollTop = 700; }); await p.waitForTimeout(400); await chup(p, '05-unitpage-giua');
  await p.evaluate(() => { const t = document.querySelector('#up .up-than'); t.scrollTop = t.scrollHeight; }); await p.waitForTimeout(400); await chup(p, '06-unitpage-cuoi');
  await p.evaluate(() => UP.mo('lienket')); await p.waitForTimeout(800); await chup(p, '07-unitpage-growup');
  await p.evaluate(() => { const t = document.querySelector('#up .up-than'); t.scrollTop = 900; }); await p.waitForTimeout(400); await chup(p, '08-unitpage-growup-giua');
  await p.evaluate(() => UP.mo('radar')); await p.waitForTimeout(800);
  await p.evaluate(() => { const t = document.querySelector('#up .up-than'); t.scrollTop = 800; }); await p.waitForTimeout(400); await chup(p, '09-unitpage-support');
  await p.evaluate(() => { UP.dong && UP.dong(); }); await p.waitForTimeout(600); await p.evaluate(() => { UP.moMV(Object.keys(MAVUONG)[0]); }).catch(e => errs.push('moMV ' + e.message));
  await p.waitForTimeout(1200); await chup(p, '10-commander');
  await p.evaluate(() => { const t = document.querySelector('#up .up-than'); t.scrollTop = t.scrollHeight; }); await p.waitForTimeout(400); await chup(p, '11-commander-cuoi');
  await p.evaluate(() => { UP.dong && UP.dong(); }); await p.waitForTimeout(300);
  // online: tài khoản + bảng online
  await p.evaluate(() => { try { TK.moBang(); } catch (e) { } }); await p.waitForTimeout(600); await chup(p, '12-taikhoan');
  await p.evaluate(() => { try { TK.dongBang(); ONL.moBang(); } catch (e) { } }); await p.waitForTimeout(600); await chup(p, '13-online');
  await p.evaluate(() => { try { ONL.dongBang(); ONL.code = 'ABCD'; ONL.host = true; ONL.meta = { host: 'me', st: 'wait' }; ONL.pl = {}; ONL.veSanh(); } catch (e) { console.log('sanh', e.message); } }); await p.waitForTimeout(600); await chup(p, '14-sanh');
  await p.close();

  // trận: màn mở đầu
  p = await mo('?mode=solo&deck=canon,bang,tia,set,lien&wave=9&fill=3&mana=999&intro=1', 400);
  await p.evaluate(() => { try { VT.batDau(); } catch (e) { } }); await p.waitForTimeout(1600); await chup(p, '15-vaotran');
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } }); await p.waitForTimeout(1500); await chup(p, '16-tran');
  await p.evaluate(() => { const T = G.ban[0].t.find(t => t); UI.moTT(T.id, T); }); await p.waitForTimeout(400); await chup(p, '17-bang-tt');
  await p.evaluate(() => { $('#tt').hidden = true; UI.bangWave(4, false); }); await p.waitForTimeout(500); await chup(p, '18-bang-wave');
  await p.evaluate(() => { UI.canhBaoTrum && UI.canhBaoTrum(Object.keys(TRUM)[0]); }); await p.waitForTimeout(600); await chup(p, '19-canh-bao');
  await p.evaluate(() => { UI.cutIn(G.ban[0].mv.id, G.ban[0]); }); await p.waitForTimeout(700); await chup(p, '20-cutin');
  await p.waitForTimeout(2200);
  await p.evaluate(() => document.querySelector('[data-act="dung"]').click()); await p.waitForTimeout(400); await chup(p, '21-tamdung');
  await p.evaluate(() => { document.querySelector('[data-act="tiep"]').click(); ketThuc(false); }); await p.waitForSelector('#ketqua:not([hidden])', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(800); await chup(p, '22-ketqua');
  await p.evaluate(() => { try { TAI.matMang('test'); } catch (e) { } }); await p.waitForTimeout(500); await chup(p, '23-matmang');
  await p.close();
  p = await mo('?mode=coop&deck=canon,bang,tia,set,lien&wave=3&fill=3&mana=999', 400);
  await p.evaluate(() => { try { VT.batDau(); } catch (e) { } }); await p.waitForTimeout(2200); await chup(p, '24-vaotran-coop');
  await p.close();
  // hướng dẫn
  p = await mo('?tut=1', 3500); await chup(p, '25-huongdan'); await p.waitForTimeout(2500); await chup(p, '26-huongdan-b'); await p.close();

  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ all, errs }, null, 1));
  console.log('errors:', errs.length); errs.slice(0, 30).forEach(e => console.log('  ' + e));
  await b.close();
})();
