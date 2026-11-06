// TURRET MERGE — KIỂM TIẾNG VIỆT (có trong tools/thap-kt-hoiquy.js). TRƯỢT khi:
//   1) một khoá chữ trong TEXT (text.js) chưa có bản Việt (chuỗi → NN.t trả lại y nguyên tiếng Anh; hàm → gọi thử với số mẫu);
//   2) đi qua các màn chính ở chế độ Tiếng Việt (HOME, cài đặt, chế độ, bộ bài, bộ sưu tập, trang ụ 1–7★ của mọi ụ + chỉ huy,
//      trận SOLO/CO-OP/PVP: bảng thông tin ụ, cảnh báo trùm, băng wave, kết quả, tạm dừng) còn chuỗi tiếng Anh chưa dịch (NN.thieu)
//      hoặc chữ tiếng Anh viết cứng đang HIỆN trong DOM.
// Sửa: thêm bản dịch vào docs/demo-hop-tuong/tuvan/ngonngu/vi.json → python3 tools/thap-vi-dung.py.
// Chạy: python3 -m http.server 8765 & · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-vi.js  (in danh sách thiếu, mã 1 nếu trượt)
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOI = [], THIEU = new Set(), CUNG = new Set();
// chữ tiếng Anh được phép còn lại (tên riêng / ký hiệu)
const CHO = /^(Pilot-[A-Z0-9]+|TM-\d+|TURRET MERGE|SOLO|CO-OP|PVP|PvP|ONLINE|Online|Co-op|Solo|HP|LV|LV\s*\d+|MAX|VS|OK|mana|Mana|MANA|BINGO|Bingo|COMBO|Combo|JACKPOT|JOKER|VAMP|Vamp|[A-Z]{1,3}|.*@.*)$/;
async function mo(b, url) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('tm_lang', 'vi'); } catch (e) { } });
  const p = await ctx.newPage();
  p.on('pageerror', e => LOI.push(url + ' · lỗi trang: ' + e.message));
  await p.goto(BASE + url, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length > 0 && window.NN, null, { timeout: 60000 });
  await sleep(1200);
  return p;
}
// chữ tiếng Anh đang hiện trong DOM (không dấu Việt, có từ ≥ 3 chữ cái, không phải tên riêng)
const QUET = () => {
  const ra = [], hien = (e) => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { if (x.hidden) return false; const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight; };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const v = n.nodeValue.trim(); if (!/[A-Za-z]{3,}/.test(v) || /[À-ỹđĐ]/.test(v)) continue;
    const p = n.parentElement; if (!p || /SCRIPT|STYLE|TEMPLATE/.test(p.nodeName) || p.closest('[data-nn-giu]') || !hien(p)) continue;
    if (NN.giu(v) || NN.t(v) !== v) continue;
    ra.push(v.slice(0, 120));
  }
  return ra;
};
async function lay(p, ten) {
  const r = await p.evaluate((q) => ({ th: [...NN.thieu], dom: eval('(' + q + ')')() }), QUET.toString());
  r.th.forEach(s => THIEU.add(s)); r.dom.forEach(s => CUNG.add(ten + ': ' + s));
}
(async () => {
  const b = await chromium.launch();
  let p = await mo(b, 'index.html?notut=1');
  // 1) khoá TEXT
  const khoa = await p.evaluate(() => {
    const ra = [], di = (o, d, duong) => {
      for (const k in o) {
        const v = o[k], dg = duong + '.' + k;
        if (k === 'name' || k === 'portrait') continue;
        if (typeof v === 'string') { if (/[A-Za-z]{2,}/.test(v) && NN.t(v) === v && !NN.giu(v)) ra.push(dg + ' = ' + v); }
        else if (typeof v === 'function') { let e; try { e = String(v(3, 2, 1)); } catch (er) { continue; } if (/[A-Za-z]{2,}/.test(e) && NN.t(e) === e && !NN.giu(e)) ra.push(dg + '() = ' + e); }
        else if (v && typeof v === 'object') di(v, d + 1, dg);
      }
    };
    di(NN.goc || {}, 0, 'TEXT'); return ra;
  });
  // 2) màn chính
  const man = [
    ['HOME', () => { }], ['cài đặt', () => HM.moCai()], ['chế độ', () => HM.moChe()], ['bộ mẫu', () => HM.moPre()], ['lọc', () => HM.moLoc()],
    ['bộ bài', () => { HM.dong(true); HM.di('dk'); }], ['bộ sưu tập', () => HM.di('dk', true)],
  ];
  for (const [ten, f] of man) { await p.evaluate(`(${f.toString()})()`).catch(() => { }); await sleep(500); await lay(p, ten); }
  const ids = await p.evaluate(() => G.roster.map(r => r.id));
  for (const id of ids) {
    await p.evaluate((id) => { try { UP.mo(id); for (let s = 1; s <= 7; s++) UP.chonSao(s, true); } catch (e) { } }, id);
    await lay(p, 'trang ' + id);
  }
  // bộ bài đầy + trang ụ mở từ màn bộ bài (nút Swap into deck / Remove from deck)
  await p.evaluate(() => { try { UP.dong(true); UI.chon = ['canon', 'bang', 'tia', 'set', 'lien']; UI.veBoChon(); HM.di('dk'); HM.ve(); } catch (e) { } }); await sleep(500); await lay(p, 'bộ bài đầy');
  for (const id of ['vughep', 'canon']) { await p.evaluate((id) => { try { HM.moXem(id); } catch (e) { } try { UP.mo(id); } catch (e) { } }, id); await sleep(300); await lay(p, 'trang ụ (bộ đầy) ' + id); }
  for (const k of ['hero', 'dahlia', 'eve']) { await p.evaluate((k) => { try { UP.moMV(k); } catch (e) { } }, k); await lay(p, 'chỉ huy ' + k); }
  await p.context().close();
  // 3) trận
  for (const m of ['solo', 'coop', 'pvp']) {
    p = await mo(b, 'index.html?notut=1&mode=' + m + '&auto=1&speed=4&mana=9999&fill=3&wave=9&deck=canon,bang,tia,set,lien');
    await sleep(7000); await lay(p, m + ' trận');
    await p.evaluate(() => { const B = G.ban[0]; for (const r of G.roster) for (const s of [1, 4, 7]) { try { UI.moTT(r.id, sinhU(taoU(B, r.id, s, 0))); } catch (e) { } } });
    await lay(p, m + ' bảng ụ');
    await p.evaluate(() => { for (const k in TRUM) { try { UI.canhBaoTrum(k); } catch (e) { } } }); await lay(p, m + ' cảnh báo trùm');
    await p.evaluate(() => { try { UI.ketQua({ thang: false, wave: 9, ly: TEXT.end.coopOut }); } catch (e) { } }); await sleep(400); await lay(p, m + ' kết quả');
    await p.context().close();
  }
  await b.close();
  const th = [...THIEU].filter(s => !CHO.test(s.trim()));
  const cung = [...CUNG].filter(s => !CHO.test(s.split(': ').slice(1).join(': ').trim()));
  if (khoa.length) console.log('✗ TEXT thiếu bản Việt (' + khoa.length + '):\n  ' + khoa.join('\n  '));
  if (th.length) console.log('✗ chuỗi chưa dịch (' + th.length + '):\n  ' + th.slice(0, 200).join('\n  '));
  if (cung.length) console.log('✗ chữ Anh còn hiện trong DOM (' + cung.length + '):\n  ' + cung.slice(0, 80).join('\n  '));
  if (LOI.length) console.log('✗ lỗi trang:\n  ' + LOI.join('\n  '));
  const ok = !khoa.length && !th.length && !cung.length && !LOI.length;
  console.log(ok ? '✓ thap-kt-vi: Tiếng Việt đủ' : '✗ thap-kt-vi TRƯỢT');
  if (process.env.RA) require('fs').writeFileSync(process.env.RA, JSON.stringify([...new Set(khoa.map(x => x.split(' = ').slice(1).join(' = ')).concat(th, cung.map(x => x.split(': ').slice(1).join(': '))))], null, 1));
  process.exit(ok ? 0 : 1);
})();
