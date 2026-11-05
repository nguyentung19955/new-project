// TURRET MERGE — bảng soát CHÂN DUNG §D (TU-VAN-TOAN-BO.txt): 85 phi công + 3 chỉ huy ở MỌI chỗ chứa
//   thẻ kho (roster) · ô bộ bài (slot) · dải tóm tắt (summary) · xem nhanh (quick) · khay trận (tray) · bảng chạm (inspect)
//   · dải đồng đội/đối thủ (partner) · trang ụ (detail hero) · trang chỉ huy (commander hero) · thẻ chỉ huy trận (cmd card).
// Mỗi ô: chụp phần tử thật trong game, vẽ đường MẮT (đỏ) + ĐỈNH TÓC (xanh lá) theo mốc PO_NEO (js/chandung.js) và vị trí cắt thật.
// LỖI nếu: mắt hoặc đỉnh tóc nằm NGOÀI cửa sổ ảnh, mắt ngoài dải mục tiêu của chỗ chứa, hoặc chip/huy hiệu đè lên vùng mặt.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  node tools/thap-kt-chandung.js   → docs/demo-hop-tuong/tuvan/tvA/portrait_qa.png
// KHUNG MẶT ô nhỏ (người dùng: tile_zoom_qua.png — "zoom quá đà"; mẫu DCDW dcdw_the_toigian.png): cửa sổ ≤ 140 px CSS còn LỖI nếu
//   cả đầu (đỉnh tóc → cằm, mốc PO_NEO[3]) > 60 % chiều cao cửa sổ · cằm bị cắt · tóc bị cắt (tóc < 4 % mép trên mà ảnh gốc còn chỗ)
//   · phóng quá độ nét (px hiển thị ở DPR 3 > 1.0 px nguồn).
//   SIZES=360x780x3,390x844x3,430x932x3 (nhiều cỡ) · CHI=roster,slot,tray (chỉ vài chỗ chứa) · SACH=<file> (bảng sạch không vạch, để so DCDW)
// Thoát mã 1 nếu có lỗi.
const MAVUONG_IDS = { hero: 1, dahlia: 1, eve: 1 };
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tvA/portrait_qa.png';
const TMP = fs.mkdtempSync('/tmp/kt-cd-');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// dải mắt mục tiêu (phần chiều cao cửa sổ) theo §D; tóc phải ≥ 0 (trong cửa sổ)
const DAI = { roster: [.22, .55], slot: [.22, .55], slot_mv: [.22, .55], summary: [.22, .55], quick: [.22, .55], tray: [.22, .55], inspect: [.22, .55], partner: [.22, .56], detail: [.12, .55], commander: [.12, .55], cmd: [.22, .56] };
const NHO = { dau: .605, toc: .04, cam: .985, nguon: 1.02 }; // ô nhỏ: đầu ≤ 60 %, tóc ≥ 4 % (trừ khi cửa sổ đã ở mép ảnh gốc), cằm trong, ≤ 1.0 px nguồn/px máy
const SIZES = (process.env.SIZES || '390x844x2').split(',').map(x => x.split('x').map(Number));
const CHI = process.env.CHI ? new Set(process.env.CHI.split(',')) : null, co = (c) => !CHI || CHI.has(c);
// mốc cằm đọc từ js/chandung.js (PO_NEO[id][3]) — đo được cả bản cũ chưa có _po.cam
const NEO = (() => { const t = fs.readFileSync(process.env.NEO_FILE || path.join(__dirname, '../thap/js/chandung.js'), 'utf8'); return eval('(' + /const PO_NEO = (\{[\s\S]*?\});/.exec(t)[1] + ')'); })(); // hero: ảnh 1:1 cắt sẵn (tools/thap-hero.py) — chỉ kiểm mắt trong vùng trên của ảnh

// đỉnh tóc tối thiểu (phần cửa sổ): khung độ hiếm the_khung_* có tấm ngọc giữa cạnh trên lấn 4 % khung = 6,2 % cửa sổ
const TOC = { roster: .02, tray: .02, slot: .02, partner: .02, summary: .02, quick: .02, inspect: .02, detail: 0, commander: 0, cmd: .02 }; // ô tối giản o-toigian: viền mảnh, không tấm ngọc lấn cửa sổ
// trong trang: đo 1 ảnh chân dung → {id, box (so với phần tử chụp), mat, toc, x, che}
const DO = ([sel, host, NEO]) => {
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
    return b.left < mx + fw && b.right > mx - fw && b.top < my + fh * .6 && b.bottom > my - fh; // dải mắt + trán thấp (chip trên tóc ở góc thì cho phép)
  }).map(e => e.className || e.tagName);
  // cằm / cả đầu / độ nét — tính lại từ mốc (không phụ thuộc phiên bản chandung.js)
  const id = MAT.id(im), a = NEO[id], nh = im.naturalHeight || 256, nw = im.naturalWidth || 256, c = Math.max(win.w / nw, win.h / nh), k = (po.k || 1) * c;
  let cam = null, dau = null, bien = false;
  if (po.che === 'dau') { // bản mới: số đo đã theo VÙNG THẤY (trừ phần viền đè --po-mep)
    const m = po.mep || 0; win.x += m * win.w; win.y += m * win.h; win.w *= 1 - 2 * m; win.h *= 1 - 2 * m;
    return { id, box: [hb.left, hb.top, hb.width, hb.height], win, mat: po.mat, toc: po.toc, x: po.x, che, cam: po.cam, dau: po.dau, bien: po.bien, nguon: po.nguon };
  }
  if (a && a[3] != null && !/^hero:/.test(id)) {
    cam = po.mat + (a[3] - a[1]) / 100 * nh * k / win.h; dau = cam - Math.max(0, po.toc);
    const Tsrc = a[1] / 100 * nh - po.mat * win.h / k - (po.ho || 0) * win.h / k; bien = Tsrc <= 0.6; // cửa sổ bắt đầu đúng mép trên ảnh gốc
    const m = im.closest('.ot') ? 0.081 : 0, v = (y) => (y - m) / (1 - 2 * m); // bản cũ: đổi sang vùng thấy (viền o_vien_* đè 8,1 %)
    po.mat = v(po.mat); po.toc = v(po.toc); cam = v(cam); dau = cam - Math.max(0, po.toc);
    win.x += m * win.w; win.y += m * win.h; win.w *= 1 - 2 * m; win.h *= 1 - 2 * m;
  }
  return { id, box: [hb.left, hb.top, hb.width, hb.height], win, mat: po.mat, toc: po.toc, x: po.x, che, cam, dau, bien, nguon: k * 3 };
};

(async () => {
  const b = await chromium.launch();
  const errs = [], rows = {}; // rows[container] = [{id, file, ...}]
  for (const [VW, VH, DPR] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR || 3 });
  const SUF = SIZES.length > 1 ? '@' + VW : '';
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  const cho = (p) => p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 30000 }).catch(() => { });
  const chup = async (p, cont, id, sel, host) => {
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const d = await p.evaluate(DO, [sel, host, NEO]);
    if (!d || d.loi) { errs.push(cont + ' ' + id + ': ' + (d ? d.loi : 'không thấy ảnh')); return; }
    const f = path.join(TMP, cont + '_' + id + '_' + Math.random().toString(36).slice(2, 7) + '.png');
    await p.screenshot({ path: f, clip: { x: d.box[0], y: d.box[1], width: Math.max(1, d.box[2]), height: Math.max(1, d.box[3]) } });
    (rows[cont + SUF] = rows[cont + SUF] || []).push(Object.assign({ file: f }, d, { id, loai: cont }));
  };
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('trang: ' + e.message));
  await p.goto(BASE + '?notut=1'); await cho(p); await sleep(1500);
  const ids = await p.evaluate(() => G.roster.filter(r => hasPilot(r.id)).map(r => r.id));
  const mvs = ['hero', 'dahlia', 'eve'];
  // 1. thẻ kho (COLLECTION, không lọc)
  await p.evaluate(() => { HM.di('dk', true); });
  await sleep(500);
  if (co('roster')) for (const id of ids) {
    await p.evaluate((id) => { const c = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); c.scrollIntoView({ block: 'center' }); }, id);
    await chup(p, 'roster', id, `#chon-luoi .c[data-id="${id}"] img.anh`, '.c');
  }
  // 2. ô bộ bài + 3. dải tóm tắt + 4. xem nhanh
  await p.evaluate(() => { HM.di('dk'); document.getElementById('chon-luoi').scrollTop = 0; }); await sleep(400);
  if (co('slot')) for (let i = 0; i < ids.length; i += 5) {
    const g = ids.slice(i, i + 5);
    await p.evaluate((g) => { UI.chon = g.slice(); UI.veBoChon(); HM.ve(); }, g); await sleep(150);
    for (let j = 0; j < g.length; j++) await chup(p, 'slot', g[j], `#chon-bo .o-bo:nth-child(${j + 1}) > img:not(.kh):not(.gl):not(.dk-vien)`, '.o-bo');
  }
  // dải "ụ nổi bật" đã bỏ (bo2hang) — ô chỉ huy thứ 6 trong hàng bộ bài
  if (co('slot')) for (const mv of Object.keys(MAVUONG_IDS)) {
    await p.evaluate((mv) => { UI.mv = mv; HM.ve(); }, mv); await sleep(150);
    await chup(p, 'slot_mv', 'af_' + mv, '#chon-bo .o-mv .o-mv-po img', '.o-mv-po');
  }
  if (co('quick')) for (const id of ids) {
    await p.evaluate((id) => { HM.dong(true); HM.moXem(id); }, id); await sleep(320);
    await chup(p, 'quick', id, '.hm-xem-po img', '.hm-xem-po');
  }
  await p.evaluate(() => HM.dong(true));
  // 5. trang ụ (hero) + 6. trang chỉ huy
  if (co('detail')) { await p.evaluate((id) => { UP.mo(id); }, ids[0]); await sleep(500); }
  if (co('detail')) for (const id of ids) {
    await p.evaluate((id) => { UP.ve(id, 0); }, id); await sleep(380);
    await chup(p, 'detail', id, '#up .up-pi img', '.up-hero');
  }
  if (co('detail')) { await p.evaluate(() => UP.dong()); await sleep(300); }
  if (co('commander')) for (const id of mvs) {
    await p.evaluate((id) => { UP.moMV(id); }, id); await sleep(450);
    await chup(p, 'commander', 'af_' + id, '#up .up-pi img', '.up-hero');
    await p.evaluate(() => UP.dong()); await sleep(300);
  }
  await p.close();
  // 7. khay trận + 8. bảng chạm + 9. dải đồng đội (CO-OP) + 10. thẻ chỉ huy trận
  const q = await ctx.newPage(); q.on('pageerror', e => errs.push('trận: ' + e.message));
  await q.goto(BASE + '?mode=coop&deck=canon,bang,tia,set,lien&deck2=drone,bao,kiembang,hydra,anhsang&wave=3&fill=8&notut=1&nointro=1'); await cho(q); await sleep(2500);
  await q.evaluate(() => { G.dung = true; const b = document.querySelector('#bang-wave'); if (b) b.hidden = true; });
  if (co('tray')) for (let i = 0; i < ids.length; i += 5) {
    const g = ids.slice(i, i + 5);
    await q.evaluate((g) => { G.ban[0].deck = g.slice(); UI.vaoTran(); G.dung = true; }, g); await sleep(250);
    for (let j = 0; j < g.length; j++) await chup(q, 'tray', g[j], `#bo-the .the[data-id="${g[j]}"] img.anh`, '.the');
  }
  if (co('inspect')) for (const id of ids) {
    await q.evaluate((id) => { const T = G.ban[0].t.find(Boolean); UI.moTT(id, T); }, id); await sleep(120);
    await chup(q, 'inspect', id, '#tt .tt-anh', '#tt .tt-anh');
  }
  await q.evaluate(() => { document.getElementById('tt').hidden = true; });
  const coDP = await q.evaluate(() => typeof DP !== 'undefined' && !!DP.el);
  if (coDP && co('partner')) for (let i = 0; i < ids.length; i += 5) {
    const g = ids.slice(i, i + 5);
    await q.evaluate((g) => { G.ban[1].deck = g.slice(); DP.ve && DP.ve(true); }, g); await sleep(200);
    for (const id of g) { const has = await q.$(`.dp-the[data-id="${id}"] img.po`); if (has) await chup(q, 'partner', id, `.dp-the[data-id="${id}"] img.po`, '.dp-the'); }
  }
  if (co('cmd') || co('tray')) for (const id of mvs) {
    await q.evaluate((id) => { G.ban[0].mv.id = id; UI.vaoTran(); G.dung = true; }, id); await sleep(250);
    await chup(q, 'cmd', 'af_' + id, '#the-mv img.po', '#the-mv');
  }
  await ctx.close();
  }
  await b.close();
  // kiểm + ghép bảng
  const loi = [];
  for (const [cont, ds] of Object.entries(rows)) for (const r of ds) {
    const [a, z] = DAI[r.loai] || [.25, .6];
    const tMin = TOC[r.loai] || 0;
    if (r.win.h <= 140 && r.dau != null) { // ô nhỏ: khung mặt kiểu DCDW
      if (r.dau > NHO.dau) loi.push(`${cont} ${r.id}: phóng quá — cả đầu ${(r.dau * 100).toFixed(0)} % chiều cao ô (≤ ${NHO.dau * 100} %)`);
      if (r.cam > NHO.cam) loi.push(`${cont} ${r.id}: CẰM bị cắt (cằm ở ${(r.cam * 100).toFixed(0)} %)`);
      if (r.toc < NHO.toc && !r.bien) loi.push(`${cont} ${r.id}: TÓC bị cắt — đỉnh tóc ${(r.toc * 100).toFixed(1)} % (cần ≥ ${NHO.toc * 100} %, ảnh gốc còn chỗ)`);
      if (r.nguon > NHO.nguon) loi.push(`${cont} ${r.id}: phóng quá độ nét — ${r.nguon.toFixed(2)} px nguồn/px máy ở DPR 3 (≤ 1.0)`);
    }
    if (r.toc < -0.005) loi.push(`${cont} ${r.id}: đỉnh tóc NGOÀI cửa sổ (${(r.toc * 100).toFixed(0)} %)`);
    else if (r.toc < tMin) loi.push(`${cont} ${r.id}: đỉnh tóc ${(r.toc * 100).toFixed(1)} % — dưới thanh trên của khung (cần ≥ ${tMin * 100} %)`);
    if (r.mat < 0 || r.mat > 1) loi.push(`${cont} ${r.id}: mắt NGOÀI cửa sổ (${(r.mat * 100).toFixed(0)} %)`);
    else if (r.mat < a || r.mat > z) loi.push(`${cont} ${r.id}: mắt ở ${(r.mat * 100).toFixed(0)} % (mục tiêu ${a * 100}–${z * 100} %)`);
    if (r.che.length) loi.push(`${cont} ${r.id}: chip đè vùng mặt (${r.che.join(', ')})`);
  }
  const J = path.join(TMP, 'qa.json'); fs.writeFileSync(J, JSON.stringify({ rows, loi }));
  execFileSync('python3', [path.join(__dirname, 'thap-kt-chandung-sheet.py'), J, OUT].concat(process.env.SACH ? [process.env.SACH] : []), { stdio: 'inherit' });
  const tong = Object.values(rows).reduce((s, d) => s + d.length, 0);
  console.log('Chỗ chứa:', Object.entries(rows).map(([k, v]) => k + ' ' + v.length).join(' · '), '· tổng', tong, 'ảnh');
  for (const l of loi) console.log('  LỖI ' + l);
  for (const e of errs) console.log('  ERR ' + e);
  console.log('LỖI CHÂN DUNG: ' + loi.length + '  ·  LỖI TRANG: ' + errs.length + '  →  ' + OUT);
  process.exit(loi.length || errs.length ? 1 : 0);
})();
