// TURRET MERGE — bảng soát CHÂN DUNG §D (TU-VAN-TOAN-BO.txt): 85 phi công + 3 chỉ huy ở MỌI chỗ chứa
//   thẻ kho (roster) · ô bộ bài (slot) · dải tóm tắt (summary) · xem nhanh (quick) · khay trận (tray) · bảng chạm (inspect)
//   · dải đồng đội/đối thủ (partner) · trang ụ (detail hero) · trang chỉ huy (commander hero) · thẻ chỉ huy trận (cmd card).
// Mỗi ô: chụp phần tử thật trong game, vẽ đường MẮT (đỏ) + ĐỈNH TÓC (xanh lá) theo mốc PO_NEO (js/chandung.js) và vị trí cắt thật.
// LỖI nếu: mắt hoặc đỉnh tóc nằm NGOÀI cửa sổ ảnh, mắt ngoài dải mục tiêu của chỗ chứa, hoặc chip/huy hiệu đè lên vùng mặt.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  node tools/thap-kt-chandung.js   → docs/demo-hop-tuong/tuvan/tvA/portrait_qa.png
// Thoát mã 1 nếu có lỗi.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tvA/portrait_qa.png';
const TMP = fs.mkdtempSync('/tmp/kt-cd-');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// dải mắt mục tiêu (phần chiều cao cửa sổ) theo §D; tóc phải ≥ 0 (trong cửa sổ)
const DAI = { roster: [.30, .50], slot: [.33, .52], summary: [.30, .55], quick: [.30, .52], tray: [.33, .52], inspect: [.33, .52], partner: [.30, .56], detail: [.30, .48], commander: [.30, .48], cmd: [.28, .56] };

// trong trang: đo 1 ảnh chân dung → {id, box (so với phần tử chụp), mat, toc, x, che}
const DO = ([sel, host]) => {
  const im = document.querySelector(sel); if (!im) return null;
  const h = host ? im.closest(host) : im;
  MAT.fit(im);
  const po = im._po; if (!po) return { loi: 'không có mốc' };
  // hộp CỬA SỔ thật = hộp ảnh khi chưa phóng (clip-path giữ ảnh trong đúng hộp này)
  const sc = im.style.scale, tr = im.style.transition; im.style.transition = 'none'; im.style.scale = '';
  const r = im.getBoundingClientRect(); im.style.scale = sc; im.style.transition = tr;
  const hb = h.getBoundingClientRect();
  const win = { x: r.left - hb.left, y: r.top - hb.top, w: r.width, h: r.height };
  // chip/huy hiệu (img nhỏ, nút) đè lên vùng mặt (hình elip quanh mắt)?
  const mx = win.x + po.x * win.w + hb.left, my = win.y + po.mat * win.h + hb.top;
  const che = [...h.querySelectorAll('img, button, i, span, b')].filter(e => e !== im && !e.contains(im) && !e.classList.contains('kh') && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05).filter(e => {
    const b = e.getBoundingClientRect(); if (b.width < 2 || b.width > win.w * 0.7) return false;
    const fw = win.w * 0.22, fh = win.h * 0.16; // vùng mắt/trán
    return b.left < mx + fw && b.right > mx - fw && b.top < my + fh && b.bottom > my - fh * 1.6;
  }).map(e => e.className || e.tagName);
  return { id: MAT.id(im), box: [hb.left, hb.top, hb.width, hb.height], win, mat: po.mat, toc: po.toc, x: po.x, che };
};

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  const errs = [], rows = {}; // rows[container] = [{id, file, ...}]
  const cho = (p) => p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 30000 }).catch(() => { });
  const chup = async (p, cont, id, sel, host) => {
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const d = await p.evaluate(DO, [sel, host]);
    if (!d || d.loi) { errs.push(cont + ' ' + id + ': ' + (d ? d.loi : 'không thấy ảnh')); return; }
    const f = path.join(TMP, cont + '_' + id + '.png');
    await p.screenshot({ path: f, clip: { x: d.box[0], y: d.box[1], width: Math.max(1, d.box[2]), height: Math.max(1, d.box[3]) } });
    (rows[cont] = rows[cont] || []).push(Object.assign({ file: f }, d, { id }));
  };
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('trang: ' + e.message));
  await p.goto(BASE + '?notut=1'); await cho(p); await sleep(1500);
  const ids = await p.evaluate(() => G.roster.filter(r => hasPilot(r.id)).map(r => r.id));
  const mvs = ['hero', 'dahlia', 'eve'];
  // 1. thẻ kho (COLLECTION, không lọc)
  await p.evaluate(() => { HM.di('dk', true); });
  await sleep(500);
  for (const id of ids) {
    await p.evaluate((id) => { const c = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); c.scrollIntoView({ block: 'center' }); }, id);
    await chup(p, 'roster', id, `#chon-luoi .c[data-id="${id}"] img.anh`, '.c');
  }
  // 2. ô bộ bài + 3. dải tóm tắt + 4. xem nhanh
  await p.evaluate(() => { HM.di('dk'); document.getElementById('chon-luoi').scrollTop = 0; }); await sleep(400);
  for (let i = 0; i < ids.length; i += 5) {
    const g = ids.slice(i, i + 5);
    await p.evaluate((g) => { UI.chon = g.slice(); UI.veBoChon(); HM.ve(); }, g); await sleep(150);
    for (let j = 0; j < g.length; j++) await chup(p, 'slot', g[j], `#chon-bo .o-bo:nth-child(${j + 1}) > img:not(.kh):not(.gl):not(.dk-vien)`, '.o-bo');
  }
  for (const id of ids) {
    await p.evaluate((id) => { HM.noi = id; HM.ve(); }, id);
    await chup(p, 'summary', id, '#dk-noi .dk-noi-po img', '#dk-noi');
  }
  for (const id of ids) {
    await p.evaluate((id) => { HM.dong(true); HM.moXem(id); }, id); await sleep(320);
    await chup(p, 'quick', id, '.hm-xem-po img', '.hm-xem-po');
  }
  await p.evaluate(() => HM.dong(true));
  // 5. trang ụ (hero) + 6. trang chỉ huy
  await p.evaluate((id) => { UP.mo(id); }, ids[0]); await sleep(500);
  for (const id of ids) {
    await p.evaluate((id) => { UP.ve(id, 0); }, id); await sleep(380);
    await chup(p, 'detail', id, '#up .up-pi img', '.up-hero');
  }
  await p.evaluate(() => UP.dong()); await sleep(300);
  for (const id of mvs) {
    await p.evaluate((id) => { UP.moMV(id); }, id); await sleep(450);
    await chup(p, 'commander', 'af_' + id, '#up .up-pi img', '.up-hero');
    await p.evaluate(() => UP.dong()); await sleep(300);
  }
  await p.close();
  // 7. khay trận + 8. bảng chạm + 9. dải đồng đội (CO-OP) + 10. thẻ chỉ huy trận
  const q = await ctx.newPage(); q.on('pageerror', e => errs.push('trận: ' + e.message));
  await q.goto(BASE + '?mode=coop&deck=canon,bang,tia,set,lien&deck2=drone,bao,kiembang,hydra,anhsang&wave=3&fill=8&notut=1&nointro=1'); await cho(q); await sleep(2500);
  await q.evaluate(() => { G.dung = true; const b = document.querySelector('#bang-wave'); if (b) b.hidden = true; });
  for (let i = 0; i < ids.length; i += 5) {
    const g = ids.slice(i, i + 5);
    await q.evaluate((g) => { G.ban[0].deck = g.slice(); UI.vaoTran(); G.dung = true; }, g); await sleep(250);
    for (let j = 0; j < g.length; j++) await chup(q, 'tray', g[j], `#bo-the .the[data-id="${g[j]}"] img.anh`, '.the');
  }
  for (const id of ids) {
    await q.evaluate((id) => { const T = G.ban[0].t.find(Boolean); UI.moTT(id, T); }, id); await sleep(120);
    await chup(q, 'inspect', id, '#tt .tt-anh', '#tt .tt-anh');
  }
  await q.evaluate(() => { document.getElementById('tt').hidden = true; });
  const coDP = await q.evaluate(() => typeof DP !== 'undefined' && !!DP.el);
  if (coDP) for (let i = 0; i < ids.length; i += 5) {
    const g = ids.slice(i, i + 5);
    await q.evaluate((g) => { G.ban[1].deck = g.slice(); DP.ve && DP.ve(true); }, g); await sleep(200);
    for (const id of g) { const has = await q.$(`.dp-the[data-id="${id}"] img.po`); if (has) await chup(q, 'partner', id, `.dp-the[data-id="${id}"] img.po`, '.dp-the'); }
  }
  for (const id of mvs) {
    await q.evaluate((id) => { G.ban[0].mv.id = id; UI.vaoTran(); G.dung = true; }, id); await sleep(250);
    await chup(q, 'cmd', 'af_' + id, '#the-mv img.po', '#the-mv');
  }
  await b.close();
  // kiểm + ghép bảng
  const loi = [];
  for (const [cont, ds] of Object.entries(rows)) for (const r of ds) {
    const [a, z] = DAI[cont] || [.25, .6];
    if (r.toc < -0.005) loi.push(`${cont} ${r.id}: đỉnh tóc NGOÀI cửa sổ (${(r.toc * 100).toFixed(0)} %)`);
    if (r.mat < 0 || r.mat > 1) loi.push(`${cont} ${r.id}: mắt NGOÀI cửa sổ (${(r.mat * 100).toFixed(0)} %)`);
    else if (r.mat < a || r.mat > z) loi.push(`${cont} ${r.id}: mắt ở ${(r.mat * 100).toFixed(0)} % (mục tiêu ${a * 100}–${z * 100} %)`);
    if (r.che.length) loi.push(`${cont} ${r.id}: chip đè vùng mặt (${r.che.join(', ')})`);
  }
  const J = path.join(TMP, 'qa.json'); fs.writeFileSync(J, JSON.stringify({ rows, loi }));
  execFileSync('python3', [path.join(__dirname, 'thap-kt-chandung-sheet.py'), J, OUT], { stdio: 'inherit' });
  const tong = Object.values(rows).reduce((s, d) => s + d.length, 0);
  console.log('Chỗ chứa:', Object.entries(rows).map(([k, v]) => k + ' ' + v.length).join(' · '), '· tổng', tong, 'ảnh');
  for (const l of loi) console.log('  LỖI ' + l);
  for (const e of errs) console.log('  ERR ' + e);
  console.log('LỖI CHÂN DUNG: ' + loi.length + '  ·  LỖI TRANG: ' + errs.length + '  →  ' + OUT);
  process.exit(loi.length || errs.length ? 1 : 0);
})();
