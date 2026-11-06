// TURRET MERGE — BỘ KIỂM HỒI QUY (chạy TRƯỚC MỌI LẦN publish — QUY-TAC-HINH.md mục 9).
// Mở game MỚI (localStorage trống + có bản lưu cũ), đi hết: màn tải → hướng dẫn lần đầu → HOME → chọn chế độ → cài đặt →
// xây bộ bài (kéo thẻ, chạm→xem→thêm/bỏ→lui, lọc, bộ mẫu, bộ sưu tập) → chỉ huy → trang ụ + Test range →
// trận SOLO tới wave 12 (có trùm; triệu hồi, ghép kéo + chạm–chạm, xem nhanh, dừng/tiếp, tốc độ) → CO-OP, PVP với máy →
// sảnh ONLINE (máy chủ giả) → cộng hưởng đá/băng (thap-kt-conghuong.js) → kết quả thắng/thua → chơi lại. Ở 360×780, 390×844, 430×932 (DPR 3) và 1280×800.
// TRƯỢT khi có: lỗi trang / console · ảnh tải hỏng (4xx/5xx) · phần tử ra ngoài màn / nút bị nút khác đè · chữ tràn,
// ảnh méo, cuộn ngang (thap-kt-tran-do.js) · chân dung lọt khung (thap-kt-vach.js) · ảnh bị phóng mờ (px hiển thị > 1,25 ×
// px ảnh gốc ở DPR 3) · vẽ tay (thap-kt-vetay.js) · màn trống/đen · fps trận < 45 · kẹt (wave không chạy, nút không phản hồi).
// Chạy (gốc repo):
//   python3 -m http.server 8765 &
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-hoiquy.js            (SIZES=390x844x3 để chạy 1 cỡ; NHANH=1 bỏ wave 12)
//   (gồm cả tools/thap-kt-online-sanh.js — sảnh online qua đường code Firebase với SDK + máy chủ giả, tự bật cổng 8790/8791; CHI=sanh)
// Ảnh chụp mỗi lỗi: OUT (mặc định docs/demo-hop-tuong/hoiquy/). Thoát mã 1 nếu còn lỗi.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const DO = require('./thap-kt-tran-do.js');
const { KT_VACH } = require('./thap-kt-vach.js');
let sharp = null; try { sharp = require('sharp'); } catch (e) { }

const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const MOCK = +(process.env.MOCK || 8787);
const OUT = process.env.OUT || 'docs/demo-hop-tuong/hoiquy/';
const NHANH = !!process.env.NHANH;
const SIZES = (process.env.SIZES || '360x780x3,390x844x3,430x932x3,1280x800x1').split(',').map(s => s.split('x').map(Number));
const DECK = 'canon,bang,tia,set,lien', DECK2 = 'drone,bao,kiembang,hydra,anhsang';
const MO = /(mờ|blur)/;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const LOI = []; // { co, buoc, loai, chi, anh }
// NỢ ẢNH: ảnh đã ở đúng độ phân giải tấm ChatGPT gốc nhưng vẫn bị phóng > 1,25× (cần gen lại — xem HOI-QUY.md).
// Không trượt vì những ảnh này nếu tỉ lệ KHÔNG tăng quá 5 % so với mốc; ảnh MỚI bị mờ hoặc mờ hơn mốc → trượt.
// Ghi lại mốc (sau khi đã gen ảnh mới / đổi cỡ có chủ đích): GHI_MO=1 node tools/thap-kt-hoiquy.js
const MO_F = path.join(__dirname, 'thap-kt-hoiquy-mo.json');
const MO_MOC = (() => { try { return JSON.parse(fs.readFileSync(MO_F, 'utf8')); } catch (e) { return {}; } })();
const MO_GHI = {}, NO_ANH = {};
let nAnh = 0;

// ---------- đo trong trang: ra ngoài màn, nút bị đè, ảnh phóng mờ ----------
function DO_THEM(o) {
  const dpr = devicePixelRatio, vw = innerWidth, vh = innerHeight, out = { ngoai: [], de: [], mo: [], canAnh: [] };
  const hien = (e) => {
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) {
      if (x.hidden) return false; const s = getComputedStyle(x);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false;
    }
    const r = e.getBoundingClientRect(); return r.width >= 4 && r.height >= 4;
  };
  const ten = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; const c = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2); if (c.length) s += '.' + c.join('.'); if (e.dataset && e.dataset.act) s += '[' + e.dataset.act + ']'; return s; };
  // vùng thấy được sau khi bị cắt bởi cha (overflow) — phần tử nằm ngoài vùng cuộn thì không tính
  const catBoi = (e) => {
    let r = e.getBoundingClientRect(), L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) {
      const s = getComputedStyle(x); if (!/(hidden|auto|scroll|clip)/.test(s.overflow + s.overflowX + s.overflowY)) continue;
      const q = x.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom);
    }
    return { L, T, R, B, r };
  };
  const lop = (e) => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if ((s.position === 'fixed' || s.position === 'absolute') && s.zIndex !== 'auto' || x.id === 'wrap') return x; } return document.body; };
  const nut = [...document.querySelectorAll('button, [data-act], input, .c[data-id], .o-bo')].filter(e => hien(e));
  for (const e of nut) {
    const k = catBoi(e); if (k.R - k.L < 3 || k.B - k.T < 3) continue; // bị cuộn khuất — bình thường
    if (k.L < -1 || k.T < -1 || k.R > vw + 1 || k.B > vh + 1) out.ngoai.push(ten(e) + ' ra ngoài màn (' + [k.L, k.T, k.R, k.B].map(Math.round).join(',') + ' / ' + vw + '×' + vh + ')');
    // nút bị nút KHÁC đè lên giữa (không phải lớp nền mờ của bảng mở)
    const cx = (Math.max(k.L, 0) + Math.min(k.R, vw)) / 2, cy = (Math.max(k.T, 0) + Math.min(k.B, vh)) / 2;
    const h = document.elementFromPoint(cx, cy); if (!h || e.contains(h) || h.contains(e)) continue;
    const hn = h.closest('button, [data-act]');
    // chỉ tính 2 nút CÙNG LỚP (cùng gốc xếp chồng): bảng/hộp thoại mở đè lên màn dưới là bình thường
    if (hn && hn !== e && !hn.contains(e) && !e.contains(hn) && !/nen|dong/.test(hn.className + ' ' + (hn.dataset.act || '') + ' ' + e.className) && hien(hn) && lop(hn) === lop(e)) out.de.push(ten(e) + ' bị ' + ten(hn) + ' đè');
  }
  // ảnh bị phóng: chỉ đo ở DPR ≥ 2 (DPR 1 chỉ xem bố cục). Bỏ nền phủ > 45 % màn (ảnh nền toàn màn, xem HOI-QUY.md).
  if (dpr >= 2) {
    const NAT = window.__HQ_NAT || (window.__HQ_NAT = {});
    // đang chạy hoạt ảnh phóng/thu (bung sao, nảy nút…): cỡ lúc chụp không phải cỡ hiển thị → bỏ qua
    const dongAnim = (e) => { for (let x = e, d = 0; x && d < 5; x = x.parentElement, d++) { if (!x.getAnimations) continue; for (const a of x.getAnimations()) { if (a.playState !== 'running' || !a.effect || !a.effect.getKeyframes) continue; if (a.effect.getKeyframes().some(k => 'transform' in k || 'scale' in k)) return true; } } return false; };
    const xet = (e, url, dw, dh) => {
      if (!/\/assets\//.test(url) || /^data:/.test(url)) return;
      if (dongAnim(e)) return;
      const n = NAT[url]; if (!n) { out.canAnh.push(url); return; }
      if (dw * dh > vw * vh * 0.45) return;
      const rx = dw * dpr / n[0], ry = dh * dpr / n[1], r = Math.min(rx, ry); // dải kéo dài: xét chiều ít bị kéo nhất
      if (r > o.nguong) out.mo.push(ten(e) + ' ' + url.split('/assets/')[1] + ' phóng ' + r.toFixed(2) + '× (' + Math.round(dw * dpr) + '×' + Math.round(dh * dpr) + ' / ' + n[0] + '×' + n[1] + ')');
    };
    for (const im of document.images) {
      if (!hien(im) || !im.naturalWidth) continue; const r = im.getBoundingClientRect();
      const s = getComputedStyle(im); let dw = r.width, dh = r.height;
      if (s.objectFit === 'contain' || s.objectFit === 'scale-down') { const k = Math.min(dw / im.naturalWidth, dh / im.naturalHeight); dw = im.naturalWidth * k; dh = im.naturalHeight * k; }
      NAT[im.currentSrc || im.src] = [im.naturalWidth, im.naturalHeight];
      xet(im, im.currentSrc || im.src, dw, dh);
    }
    for (const e of document.querySelectorAll('#wrap *, body > *')) {
      const s = getComputedStyle(e), bg = s.backgroundImage; if (!bg || bg === 'none' || bg.indexOf('url(') < 0 || bg.split('url(').length > 2) continue;
      if (!hien(e)) continue;
      const url = bg.slice(bg.indexOf('url(') + 4).replace(/^["']|["']?\)$/g, '').replace(/["']\)?$/, ''), r = e.getBoundingClientRect();
      const n = NAT[url]; let dw = r.width, dh = r.height;
      if (n) {
        const bs = s.backgroundSize; if (bs === 'contain') { const k = Math.min(dw / n[0], dh / n[1]); dw = n[0] * k; dh = n[1] * k; }
        else if (bs === 'cover') { const k = Math.max(dw / n[0], dh / n[1]); dw = n[0] * k; dh = n[1] * k; }
        else if (bs === 'auto' || bs === 'auto auto') { const k = r.width / e.offsetWidth || 1; dw = n[0] * k; dh = n[1] * k; }
        else if (/%|px/.test(bs) && !/100% 100%/.test(bs)) continue; // trang sprite / cỡ riêng — để thap-kt-min3x.js
      }
      xet(e, url, dw, dh);
    }
  }
  return out;
}

// ---------- ghi lỗi + chụp ----------
const KHONG_DAU = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const chup = async (p, co, buoc) => { const f = OUT + (++nAnh).toString().padStart(3, '0') + '_' + co + '_' + KHONG_DAU(buoc).replace(/[^\w-]+/g, '-') + '.jpg'; try { await p.screenshot({ path: f, type: 'jpeg', quality: 60 }); } catch (e) { return ''; } return f; };
// bỏ qua có chủ đích (mỗi dòng 1 lý do; đừng thêm để "cho xanh" — sửa lỗi thật)
const BO_QUA = [
  /\.cht-vong > b "\d+s" đè viền khung div#duoi/, // vòng hồi chiêu chỉ huy: huy hiệu PNG cố ý gắn ở góc thẻ, đè mép khay #duoi như DCDW
  /\.the > span\.lv "LV\d+" đè viền khung div#duoi/, // ô tướng tối giản (otoigian.css): chữ LV nằm TRÊN ảnh ô tướng; ô tướng cố ý chồng lên mép trên khay #duoi
];
const loi = async (p, co, buoc, loai, ds) => {
  ds = (ds || []).filter(x => !BO_QUA.some(r => r.test(x)));
  if (!ds.length) return;
  const uniq = [...new Set(ds)];
  const anh = p ? await chup(p, co, buoc + '_' + loai) : '';
  for (const chi of uniq) { LOI.push({ co, buoc, loai, chi, anh }); console.log('  ✗ ' + co + ' ' + buoc + ' [' + loai + '] ' + chi); }
};

function locMo(ds) {
  return ds.filter(x => {
    const m = / (\S+\.(?:png|jpg)) phóng ([\d.]+)×/.exec(x); if (!m) return true;
    const a = m[1], r = +m[2]; MO_GHI[a] = Math.max(MO_GHI[a] || 0, r);
    if (process.env.GHI_MO) return false;
    if (MO_MOC[a] && r <= MO_MOC[a] * 1.05 + 0.01) { NO_ANH[a] = Math.max(NO_ANH[a] || 0, r); return false; }
    return true;
  });
}
// đo màn hiện tại (chữ tràn/méo/cuộn ngang + vạch + ngoài màn/đè + mờ + màn đen + lỗi trang mới)
async function kiem(p, co, buoc, opt = {}) {
  await sleep(opt.cho || 350);
  const g = p.__hq; const loiTrang = g.errs.splice(0), hong = g.hong.splice(0);
  await loi(p, co, buoc, 'lỗi trang', loiTrang);
  await loi(p, co, buoc, 'ảnh hỏng', hong);
  let r;
  if (opt.chiTai) { // màn tải: chỉ đo ảnh mờ của chính màn tải (DOM bên dưới đang dựng dở)
    const t = await p.evaluate(DO_THEM, { nguong: 1.25 }); await loi(p, co, buoc, 'ảnh mờ', locMo(t.mo.filter(x => /tai_|hud_trum_khung|logo/.test(x))));
    return;
  }
  try {
    r = await p.evaluate(DO);
    const can = await p.evaluate(() => [...(window.__KT_CAN || [])]);
    if (can.length) { await p.evaluate(async (us) => { window.__KT_NAT = window.__KT_NAT || {}; await Promise.all(us.map(u => new Promise(ok => { const i = new Image(); i.onload = () => { __KT_NAT[u] = [i.naturalWidth, i.naturalHeight]; ok(); }; i.onerror = ok; i.src = u; }))); window.__KT_CAN = new Set(); }, can); r = await p.evaluate(DO); }
  } catch (e) { await loi(p, co, buoc, 'đo lỗi', [e.message]); return; }
  await loi(p, co, buoc, 'chữ tràn', r.chu); await loi(p, co, buoc, 'ảnh méo', r.anh); await loi(p, co, buoc, 'cuộn ngang', r.ngang.concat(r.thanh)); await loi(p, co, buoc, 'tiêu đề bị đè', r.de);
  await loi(p, co, buoc, 'chân dung lọt khung', (await p.evaluate(KT_VACH)).hong);
  let t = await p.evaluate(DO_THEM, { nguong: 1.25 });
  if (t.canAnh.length) { await p.evaluate(async (us) => { const N = window.__HQ_NAT; await Promise.all(us.map(u => new Promise(ok => { const i = new Image(); i.onload = () => { N[u] = [i.naturalWidth, i.naturalHeight]; ok(); }; i.onerror = ok; i.src = u; }))); }, [...new Set(t.canAnh)]); t = await p.evaluate(DO_THEM, { nguong: 1.25 }); }
  if (!opt.boNgoai) await loi(p, co, buoc, 'ngoài màn', t.ngoai);
  await loi(p, co, buoc, 'nút bị đè', t.de);
  await loi(p, co, buoc, 'ảnh mờ', locMo(t.mo));
  // màn trống / đen
  if (sharp) {
    try {
      const buf = await p.screenshot({ type: 'png', scale: 'css' }); const st = await sharp(buf).stats();
      const sd = st.channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0) / 3, tb = st.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;
      if (sd < 12 || tb < 8) await loi(p, co, buoc, 'màn trống', ['màn gần như một màu (độ lệch ' + sd.toFixed(1) + ', sáng ' + tb.toFixed(0) + ')']);
    } catch (e) { }
  }
}

const mo = async (b, W, H, D, co, init) => {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: D, hasTouch: D > 1, isMobile: D > 1 && W < 800 });
  if (init) await ctx.addInitScript(init);
  await ctx.addInitScript(DO_KHUNG);
  const p = await ctx.newPage();
  p.__hq = { errs: [], hong: [] };
  p.on('pageerror', e => p.__hq.errs.push('pageerror ' + e.message));
  p.on('console', x => { if (x.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(x.text())) p.__hq.errs.push('console ' + x.text().slice(0, 200)); });
  p.on('response', r => { if (r.status() >= 400 && !/favicon|ping=|\.mp3/.test(r.url())) p.__hq.hong.push(r.status() + ' ' + r.url().replace(/^.*\/thap\//, '')); });
  p.on('requestfailed', r => { if (/ERR_ABORTED/.test((r.failure() || {}).errorText || '')) return; /* ảnh bị thay src trước khi tải xong — không phải lỗi */ if (/\.(png|jpg|webp|css|js|json)(\?|$)/.test(r.url()) && !/ping=/.test(r.url())) p.__hq.hong.push('tải hỏng ' + r.url().replace(/^.*\/thap\//, '') + ' ' + (r.failure() || {}).errorText); });
  return { ctx, p };
};
const choMenu = (p) => p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && typeof TAI !== 'undefined' && TAI.daBoot && !TAI.cho, null, { timeout: 45000 });
const choTran = (p) => p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho && !document.getElementById('cv').hidden, null, { timeout: 45000 });
// chạm thật vào giữa nút (như ngón tay — không chờ nút "đứng yên" như locator.click); nút bị che/ẩn → lỗi kẹt
const bam = async (p, sel) => {
  const l = p.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 5000 }); await l.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => { });
  const r = await l.boundingBox(); if (!r) throw new Error(sel + ' không có hộp');
  const x = r.x + r.width / 2, y = r.y + r.height / 2;
  const trung = await l.evaluate((e, [x, y]) => { const h = document.elementFromPoint(x, y); return !!h && (e === h || e.contains(h) || h.contains(e)); }, [x, y]);
  if (!trung) { const h = await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h ? h.tagName + '#' + h.id + '.' + h.className : '-'; }, [x, y]); throw new Error(sel + ' bị ' + h + ' che, không bấm được'); }
  await p.mouse.click(x, y);
};
const viTri = (p, o, k = 0) => p.evaluate(([o, k]) => { const B = G.ban[k], c = B.o[o], r = document.getElementById('cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height, Math.min(B.cw, B.ch) * 0.6 / H * r.height]; }, [o, k]);
// fps rAF + thời gian CPU mỗi khung của game (trong các callback rAF). Máy kiểm thử không GPU (2 lõi, vẽ phần mềm): fps rAF thấp
// có thể do trình duyệt headless chứ không do game → chỉ TRƯỢT khi fps < 45 VÀ chính game tốn > 22 ms/khung (p90).
const DO_KHUNG = () => { if (window.__HQ_RAF) return; window.__HQ_RAF = []; const goc = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => goc((t) => { const a = performance.now(); try { cb(t); } finally { const L = window.__HQ_RAF; L.push(performance.now() - a); if (L.length > 600) L.shift(); } }); };
const fps = async (p, ms) => {
  const r = await p.evaluate((ms) => new Promise(ok => { const L = window.__HQ_RAF || []; L.length = 0; let n = 0; const t0 = performance.now(); const f = (t) => { n++; if (t - t0 < ms) requestAnimationFrame(f); else { const c = L.slice().sort((a, b) => a - b); ok({ fps: n * 1000 / (t - t0), p90: c.length ? c[Math.floor(c.length * 0.9)] : 0 }); } }; requestAnimationFrame(f); }), ms);
  r.thap = r.fps < 45 && r.p90 > 22; return r;
};
// kéo bằng chuột/cảm ứng (pointer) từ (x0,y0) tới (x1,y1)
const keo = async (p, x0, y0, x1, y1, giu = 220) => { await p.mouse.move(x0, y0); await p.mouse.down(); await sleep(giu); for (let i = 1; i <= 10; i++) { await p.mouse.move(x0 + (x1 - x0) * i / 10, y0 + (y1 - y0) * i / 10); await sleep(18); } await sleep(120); await p.mouse.up(); await sleep(250); };
const buoc = async (p, co, ten, f, opt) => { try { await f(); } catch (e) { await loi(p, co, ten, 'kẹt', [String(e.message || e).split('\n')[0].slice(0, 220)]); return false; } await kiem(p, co, ten, opt); return true; };

// =============== các luồng ===============
// 1) mở lần đầu (localStorage trống): màn tải tràn màn → trận hướng dẫn → bỏ qua → HOME
async function lanDau(b, W, H, D, co) {
  const { ctx, p } = await mo(b, W, H, D, co);
  let n = 0; await p.route(/\/assets\/.*\.(png|jpg)$/, async r => { if (++n > 40 && n < 60) await sleep(1500); r.continue().catch(() => { }); });
  await p.goto(BASE, { waitUntil: 'commit' });
  await p.waitForSelector('#tai:not([hidden])', { timeout: 15000 }).catch(() => { });
  await sleep(600);
  const tai = await p.evaluate(() => { const t = document.getElementById('tai'); if (!t || t.hidden) return null; const r = t.getBoundingClientRect(), th = t.querySelector('.tai-thanh').getBoundingClientRect(); return { r: [r.left, r.top, r.width, r.height], th: th.width, vw: innerWidth, vh: innerHeight }; });
  if (!tai) await loi(p, co, 'man_tai', 'kẹt', ['không thấy màn tải']);
  else {
    if (tai.r[0] > 0.5 || tai.r[1] > 0.5 || tai.r[2] < tai.vw - 1 || tai.r[3] < tai.vh - 1) await loi(p, co, 'man_tai', 'màn tải không tràn màn', ['màn tải ' + tai.r.map(Math.round).join(',') + ' trong cửa sổ ' + tai.vw + '×' + tai.vh]);
    if (tai.th < Math.min(tai.vw * 0.6, 270)) await loi(p, co, 'man_tai', 'thanh tải nhỏ', ['thanh tải rộng ' + Math.round(tai.th) + ' px']);
    // dải đầy (tai_day.png) phải TRẢI HẾT rãnh — lỗi cũ: luật img chung object-fit: contain thu ảnh thành 1 mẩu ở giữa rãnh
    const day = await p.evaluate(() => { const d = document.querySelector('#tai .tai-day'), im = d && d.querySelector('img'); if (!im || !im.naturalWidth) return null; const r = d.getBoundingClientRect(), s = getComputedStyle(im); let w = im.getBoundingClientRect().width; if (s.objectFit === 'contain' || s.objectFit === 'scale-down') w = Math.min(w, im.naturalWidth * im.getBoundingClientRect().height / im.naturalHeight); return { w, ray: r.width }; });
    if (day && day.w < day.ray * 0.97) await loi(p, co, 'man_tai', 'dải tải chỉ ở giữa', ['ảnh dải đầy rộng ' + Math.round(day.w) + ' / rãnh ' + Math.round(day.ray) + ' px (object-fit thu nhỏ)']);
    await kiem(p, co, 'man_tai', { cho: 50, chiTai: true });
  }
  await p.unroute(/\/assets\/.*\.(png|jpg)$/);
  try { await choMenu(p); } catch (e) { await loi(p, co, 'boot', 'kẹt', ['màn tải không xong sau 45 s']); await ctx.close(); return; }
  // trận hướng dẫn tự vào
  const hd = await p.waitForFunction(() => typeof HD !== 'undefined' && HD.dang && G.ban.length && !TAI.cho, null, { timeout: 20000 }).then(() => true).catch(() => false);
  if (!hd) { await loi(p, co, 'huong_dan', 'kẹt', ['lần đầu không vào trận hướng dẫn']); await ctx.close(); return; }
  await sleep(1200); await kiem(p, co, 'hd_muc');
  await buoc(p, co, 'hd_ok', () => bam(p, '#hd .hd-ok'));
  await buoc(p, co, 'hd_trieu', async () => { await p.evaluate(() => { G.ban[0].mana = Math.max(G.ban[0].mana, 200); }); await bam(p, '#nut-trieu'); await sleep(300); await bam(p, '#nut-trieu'); await sleep(500); const s = await p.evaluate(() => G.ban[0].t.filter(Boolean).length); if (s < 2) throw new Error('bấm SUMMON 2 lần mà bàn có ' + s + ' ụ'); });
  await buoc(p, co, 'hd_bo_qua', async () => { await bam(p, '#hd:not([hidden]) .hd-bo, #hd-gon:not([hidden]) button'); await p.waitForFunction(() => !HD.dang && !document.getElementById('chon').hidden, null, { timeout: 8000 }); }, { cho: 900 });
  await ctx.close();
}

// 2) bản lưu cũ: khoá lạ, bộ bài có ụ đã xoá, JSON hỏng
const LUU_CU = () => { try {
  localStorage.setItem('turret_hd', JSON.stringify({ xong: true, buoc: { muc: 1, trieu: 1 } }));
  localStorage.setItem('turret_bo', JSON.stringify({ chon: ['canon', 'khongcotuong', 'bang', 'tia', 'set'], mv: 'khongco', che: 'solo' }));
  localStorage.setItem('turret_hm', '{hỏng');
  localStorage.setItem('turret_loc', JSON.stringify({ vai: 'xyz', bac: ['do'], tim: 123 }));
  localStorage.setItem('turret_best', JSON.stringify({ solo: 'abc', coop: 14 }));
} catch (e) { } };
const DA_XONG = () => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } };

async function menu(b, W, H, D, co) {
  const { ctx, p } = await mo(b, W, H, D, co, LUU_CU);
  await p.goto(BASE, { waitUntil: 'load' });
  try { await choMenu(p); } catch (e) { await loi(p, co, 'luu_cu_boot', 'kẹt', ['không vào được menu với bản lưu cũ']); await ctx.close(); return; }
  await sleep(1200);
  await kiem(p, co, 'luu_cu_home');
  await buoc(p, co, 'che_mo', () => bam(p, '#hm-che'));
  for (const c of ['coop', 'pvp', 'solo']) await buoc(p, co, 'che_' + c, async () => { const s = '#hm-tam [data-act][data-che="' + c + '"], #hm-tam [data-che="' + c + '"]'; if (await p.locator(s).count()) await bam(p, s); else await p.evaluate((c) => HM.chonChe(c), c); await sleep(300); if (!(await p.locator('#hm-mo[hidden]').count())) await p.evaluate(() => HM.dong(true)); await bam(p, '#hm-che'); }, { cho: 300 });
  await p.evaluate(() => HM.dong(true));
  await buoc(p, co, 'cai_dat', () => bam(p, '[data-act="hm-cai"]'));
  await p.evaluate(() => HM.dong(true));
  await buoc(p, co, 'bo_bai', async () => { await bam(p, '#hm-deck'); await sleep(500); });
  // kéo 1 thẻ trong lưới vào ô bộ bài
  await buoc(p, co, 'keo_the', async () => {
    await p.evaluate(() => { UI.chon = ['canon', 'bang', 'tia', 'set']; UI.veBoChon(); HM.ve(); document.getElementById('chon-luoi').scrollTop = 0; }); await sleep(300);
    const r = await p.evaluate(() => { const c = [...document.querySelectorAll('#chon-luoi .c[data-id]')].find(c => SKILLS[c.dataset.id] && !UI.chon.includes(c.dataset.id) && c.getBoundingClientRect().height > 20 && !/do/.test(G.rosterMap[c.dataset.id].bac)); const o = document.querySelectorAll('#chon-bo .o-bo')[4]; if (!c || !o) return null; const a = c.getBoundingClientRect(), b = o.getBoundingClientRect(); return { id: c.dataset.id, a: [a.left + a.width / 2, a.top + a.height / 2], b: [b.left + b.width / 2, b.top + b.height / 2] }; });
    if (!r) throw new Error('không tìm thấy thẻ/ô để kéo');
    await keo(p, r.a[0], r.a[1], r.b[0], r.b[1]);
    const ok = await p.evaluate((id) => UI.chon.includes(id), r.id); if (!ok) throw new Error('kéo thẻ ' + r.id + ' vào ô 5 không thêm được');
  });
  // chạm thẻ → xem → bỏ → thêm → lui
  await buoc(p, co, 'cham_the', async () => { const id = await p.evaluate(() => UI.chon[0]); await p.evaluate(() => { document.getElementById('chon-luoi').scrollTop = 0; }); await sleep(200); await bam(p, '#chon-luoi .c[data-id="' + id + '"]'); await sleep(500); const mo = await p.evaluate(() => (!document.getElementById('hm-mo').hidden) || !!(typeof UP !== 'undefined' && UP.el && !UP.el.hidden)); if (!mo) throw new Error('chạm thẻ không mở gì'); });
  await buoc(p, co, 'lui_tu_trang_u', async () => { if (await p.evaluate(() => !!(UP.el && !UP.el.hidden))) { await bam(p, '#up .up-lui, #up [data-up="dong"], #up .up-x'); await sleep(500); } await p.evaluate(() => HM.dong(true)); if (await p.evaluate(() => !!(UP.el && !UP.el.hidden))) throw new Error('nút lui trang ụ không đóng'); });
  await buoc(p, co, 'xem_bo', async () => { const id = await p.evaluate(() => UI.chon[1]); await p.evaluate((id) => HM.moXem(id), id); await sleep(300); await bam(p, '#hm-tam [data-act="hm-bo"]'); const v = await p.evaluate((id) => UI.chon.includes(id), id); if (v) throw new Error('REMOVE không bỏ được ' + id); });
  await buoc(p, co, 'xem_them', async () => { await p.evaluate(() => HM.moXem('lien')); await sleep(300); await bam(p, '#hm-tam [data-act="hm-them"]'); if (!(await p.evaluate(() => UI.chon.includes('lien')))) throw new Error('ADD TO DECK không thêm được'); });
  await buoc(p, co, 'loc', async () => { await bam(p, '.dk-loc'); await sleep(300); });
  await p.evaluate(() => HM.dong(true));
  await buoc(p, co, 'tim', async () => { const i = p.locator('#dk-o input, #dk-tim, .dk-tim input').first(); if (await i.count()) { await i.fill('can'); await sleep(300); await i.fill(''); } });
  await buoc(p, co, 'bo_mau', () => bam(p, '[data-act="hm-pre"]'));
  await p.evaluate(() => HM.dong(true));
  await buoc(p, co, 'chi_huy', async () => { const o = p.locator('#chon-bo .o-mv'), c = p.locator('#dkd-cmd'); await bam(p, (await c.count()) && await c.first().isVisible() ? '#dkd-cmd' : (await o.count()) && await o.first().isVisible() ? '#chon-bo .o-mv' : '#dk-mv'); }); // ô chỉ huy (ô thứ 6 thanh bộ bài) hoặc hàng chỉ huy cũ
  await p.evaluate(() => { HM.dong(true); try { UP.dong(); } catch (e) { } });
  await buoc(p, co, 'trang_chi_huy', () => p.evaluate(() => UP.moMV('hero')), { cho: 700 });
  await p.evaluate(() => { try { UP.dong(); } catch (e) { } });
  await buoc(p, co, 'trang_u', () => p.evaluate(() => { HM.di('dk'); UP.mo('canon'); }), { cho: 700 });
  await buoc(p, co, 'test_range', () => p.evaluate(() => UP.moTam('ts')), { cho: 3500 });
  await p.evaluate(() => { try { UP.dongTam(true); UP.dong(); } catch (e) { } });
  await buoc(p, co, 'lui_home', async () => { await bam(p, '[data-act="hm-ve"]'); }, { cho: 500 });
  await buoc(p, co, 'bo_suu_tap', () => bam(p, '[data-act="hm-bst"]'), { cho: 600 });
  await buoc(p, co, 'lui_home2', () => p.evaluate(() => HM.di('hm')));
  // mất mạng: màn "Connection lost" phủ CẢ cửa sổ (không chỉ cột giữa), nối lại → BACK TO MENU
  await buoc(p, co, 'mat_mang', async () => {
    await p.context().setOffline(true); await sleep(700);
    const m = await p.evaluate(() => { const e = document.getElementById('matmang'); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, innerWidth, innerHeight]; });
    if (!m) throw new Error('tắt mạng mà không hiện màn mất mạng');
    if (m[0] > 0.5 || m[1] > 0.5 || m[2] < m[4] - 1 || m[3] < m[5] - 1) throw new Error('màn mất mạng không phủ kín cửa sổ: ' + m.map(Math.round).join(','));
  }, { cho: 100 });
  await p.context().setOffline(false);
  await buoc(p, co, 'noi_lai', async () => { await sleep(500); const st = await p.evaluate(() => { const m = document.getElementById('matmang'); return m ? [m.hidden, TAI.mat, document.getElementById('mm-nut').textContent] : null; }); if (!st || st[0]) throw new Error('màn mất mạng biến mất trước khi bấm nối lại ' + JSON.stringify(st)); await bam(p, '#mm-nut'); /* có mạng lại → nút đã là BACK TO MENU (1 chạm về menu); còn RECONNECT → chạm thêm khi đổi */ await p.waitForFunction(() => document.getElementById('matmang').hidden || /BACK/.test(document.querySelector('#mm-nut').textContent), null, { timeout: 8000 }); if (await p.evaluate(() => !document.getElementById('matmang').hidden)) await bam(p, '#mm-nut'); await p.waitForFunction(() => document.getElementById('matmang').hidden && TAI.daBoot && document.getElementById('tai').hidden, null, { timeout: 30000 }); });
  // PLAY thật từ HOME → trận SOLO
  await buoc(p, co, 'play_solo', async () => {
    await p.evaluate(() => { UI.chon = ['canon', 'bang', 'tia', 'set', 'lien']; UI.veBoChon(); HM.che = 'solo'; HM.ve(); });
    await bam(p, '#hm-choi'); await choTran(p);
    const ch = await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }).then(() => true).catch(() => false);
    if (!ch) throw new Error('màn giới thiệu trận không đóng');
  }, { cho: 1200 });
  await ctx.close();
}

// Twin Maker: chạy TRONG TRANG — trả danh sách lỗi (rỗng = đạt). Ca: 2 Twin (kéo cả 2 chiều), Twin + Mimic (2 chiều), bàn đầy, 7 sao.
function KT_SINHDOI() {
  const loi = [], keep = G.ban.map(B => B.t.slice()), mana = G.ban.map(B => B.mana);
  const dem = (B) => B.t.filter(Boolean).length;
  for (const B of G.ban) {
    if (B.net) continue;
    const ca = [['sinhdoi', 'sinhdoi', 0, 1], ['sinhdoi', 'sinhdoi', 1, 0], ['sinhdoi', 'mimic', 0, 1], ['mimic', 'sinhdoi', 0, 1]];
    for (let lap = 0; lap < 6; lap++) for (const [ia, ib, oa, ob] of ca) for (const day of [false, true]) {
      const sao = 1 + (lap % 6);
      for (let i = 0; i < 15; i++) B.t[i] = null;
      const put = (o, id, sv) => { const T = sinhU(taoU(B, id, sv, o)); T.vxA = null; B.t[o] = T; return T; };
      put(oa, ia, sao); put(ob, ib, sao);
      if (day) for (let i = 0; i < 15; i++) if (!B.t[i]) put(i, 'canon', 7); // bàn đầy: ô duy nhất trống = ô ụ kéo
      const n0 = dem(B), cu = new Set(B.t.filter(Boolean)), a = B.t[oa], b = B.t[ob];
      const r = ghep(B, a, b);
      const ten = 'bàn ' + B.i + ' ' + ia + '→' + ib + ' ' + sao + '★' + (day ? ' đầy' : '');
      if (!r) { loi.push(ten + ': không ghép được'); continue; }
      const moi = B.t.filter(T => T && !cu.has(T) && T !== B.t[ob]);
      if (dem(B) !== n0) loi.push(ten + ': số ụ ' + n0 + '→' + dem(B) + ' (phải giữ nguyên: −1 ghép +1 sinh đôi)');
      if (moi.length !== 1) { loi.push(ten + ': ' + moi.length + ' ụ sinh đôi'); continue; }
      const T = moi[0];
      if (T.sao !== sao) loi.push(ten + ': ụ sinh đôi ' + T.sao + '★ (phải ' + sao + '★)');
      if (day && T.o !== oa) loi.push(ten + ': bàn đầy mà ụ sinh đôi không ở ô vừa trống');
      if (!B.deck.includes(T.id)) loi.push(ten + ': ụ sinh đôi ' + T.id + ' không thuộc bộ bài');
      if (B.t[ob].sao !== Math.min(LUAT.saoMax, sao + 1)) loi.push(ten + ': ụ ghép ra ' + B.t[ob].sao + '★');
    }
  }
  G.ban.forEach((B, i) => { for (let o = 0; o < 15; o++) B.t[o] = keep[i][o]; B.mana = mana[i]; });
  return loi;
}

// 3) trận: SOLO đầy đủ thao tác, CO-OP/PVP với máy, kết quả, chơi lại
async function tran(b, W, H, D, co, m) {
  const { ctx, p } = await mo(b, W, H, D, co, DA_XONG);
  await p.goto(`${BASE}?mode=${m}&deck=${DECK}&deck2=${DECK2}&mana=0&notut=1`, { waitUntil: 'load' });
  try { await choTran(p); await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); } catch (e) { await loi(p, co, m + '_vao', 'kẹt', ['không vào được trận ' + m]); await ctx.close(); return; }
  await sleep(800); await kiem(p, co, m + '_bat_dau');
  // fps (1×, quái đang chạy)
  await p.evaluate(() => { G.ban.forEach(B => B.mana = 400); });
  for (let i = 0; i < 6; i++) { await bam(p, '#nut-trieu').catch(() => { }); await sleep(120); }
  await sleep(2500);
  const f = await fps(p, 3000); console.log('    fps ' + m + ': ' + f.fps.toFixed(0) + ' (game ' + f.p90.toFixed(1) + ' ms/khung p90)');
  if (f.thap) await loi(p, co, m + '_fps', 'fps thấp', ['fps ' + f.fps.toFixed(0) + ' < 45, game ' + f.p90.toFixed(1) + ' ms/khung (' + W + '×' + H + ' DPR ' + D + ')']);
  // LUẬT Star Cannon (ngoisao) — tổng ★ trên bàn: mốc TỐC = bội 10 (không phải bội 50): +100% tốc khi đúng mốc, +10%/mốc đã qua;
  // mốc SÁT THƯƠNG = bội 50: +350% sát thương khi đúng mốc, +50%/mốc đã qua. Tấm đếm trên bàn = n/mốc kế + icon loại mốc, sáng khi đúng mốc.
  await buoc(p, co, m + '_ngoisao_luat', async () => {
    const r = await p.evaluate(() => {
      const B = G.ban[0], keep = B.t.slice(), out = {};
      for (const n of [10, 19, 20, 50, 60, 100]) {
        for (let i = 0; i < 15; i++) B.t[i] = null;
        const T = B.t[0] = sinhU(taoU(B, 'ngoisao', 2, 0)); let k = n - 2, o = 1; while (k > 0) { const q = Math.min(7, k); B.t[o] = sinhU(taoU(B, 'mana', q, o)); o++; k -= q; }
        const buf = { toc: 0, dmg: 0 }, T2 = Object.assign(Object.create(Object.getPrototypeOf(T)), T, { buf }); SKILLS.ngoisao.capNhat(G, B, T2);
        const d = DEMKN.DS.ngoisao(T, B); out[n] = [SKILLS.ngoisao.tong(B), +buf.toc.toFixed(2), +buf.dmg.toFixed(2), d.m[0].ic, d.m[0].s, !!d.sang];
      }
      for (let i = 0; i < 15; i++) B.t[i] = keep[i];
      return out;
    });
    const mong = { 10: [10, 1.1, 0, 'ic_toc', '10/10', true], 19: [19, 0.1, 0, 'ic_toc', '19/20', false], 20: [20, 1.2, 0, 'ic_toc', '20/20', true],
      50: [50, 0.4, 4, 'ic_dmg', '50/50', true], 60: [60, 1.5, 0.5, 'ic_toc', '60/60', true], 100: [100, 0.8, 4.5, 'ic_dmg', '100/100', true] };
    const sai = Object.keys(mong).filter(n => JSON.stringify(r[n]) !== JSON.stringify(mong[n]));
    if (sai.length) throw new Error('Star Cannon luật sai ở ' + sai.map(n => n + ': ' + JSON.stringify(r[n]) + ' ≠ ' + JSON.stringify(mong[n])).join(' · '));
  });
  if (m !== 'solo') await buoc(p, co, m + '_ghep_vughep', async () => {
    const s = await p.evaluate(() => { const B = G.ban[0], o0 = B.t.findIndex(T => !T), keep = B.t.slice(); for (let i = 0; i < 15; i++) B.t[i] = null; B.t[0] = sinhU(taoU(B, 'vughep', 2, 0)); B.t[1] = sinhU(taoU(B, 'vughep', 2, 1)); const r = ghep(B, B.t[0], B.t[1]); const kq = [!!B.t[0], B.t[1] && B.t[1].id, B.t[1] && B.t[1].sao, r === B.t[1]]; for (let i = 0; i < 15; i++) B.t[i] = keep[i]; return kq; });
    if (s[0] || s[1] !== 'vughep' || s[2] !== 3 || !s[3]) throw new Error(m + ': Merge King★2 + Merge King★2 không ra Merge King★3 (' + JSON.stringify(s) + ')');
  });
  // TWIN MAKER (sinhdoi): mỗi lần ghép THƯỜNG có Twin Maker → đúng 1 ụ thêm, ĐÚNG sao nguyên liệu ngay khi tạo (mọi bàn của chế độ)
  await buoc(p, co, m + '_ghep_sinhdoi', async () => {
    const s = await p.evaluate(KT_SINHDOI);
    if (s.length) throw new Error(m + ': Twin Maker — ' + s.slice(0, 4).join(' · '));
  });
  if (m === 'solo') {
    // ghép kéo + chạm–chạm
    const dat = () => p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; }; put(0, 'canon', 1); put(1, 'canon', 1); put(5, 'bang', 1); put(6, 'bang', 1); UI.keo = null; UI.chonGhep = null; });
    await buoc(p, co, 'ghep_keo', async () => { await dat(); await sleep(150); const a = await viTri(p, 0), c = await viTri(p, 1); await keo(p, a[0], a[1], c[0], c[1], 60); /* chuột: lech = 0 (ui.js) */ await sleep(400); const s = await p.evaluate(() => [G.ban[0].t[0], G.ban[0].t[1]].filter(Boolean).map(T => T.sao)); if (!(s.length === 1 && s[0] === 2)) throw new Error('kéo ghép canon★1 → canon★1 không ra ★2 (' + JSON.stringify(s) + ')'); });
    await buoc(p, co, 'ghep_cham', async () => { const a = await viTri(p, 5), c = await viTri(p, 6); await p.mouse.click(a[0], a[1]); await sleep(250); await p.mouse.click(c[0], c[1]); await sleep(500); const s = await p.evaluate(() => [G.ban[0].t[5], G.ban[0].t[6]].filter(Boolean).map(T => T.sao)); if (!(s.length === 1 && s[0] === 2)) throw new Error('chạm–chạm bang★1 + bang★1 không ghép (' + JSON.stringify(s) + ')'); });
    // Merge King + Merge King (cùng sao) → 1 Merge King sao kế tiếp (không ra ụ ngẫu nhiên); 7★ không ghép
    await buoc(p, co, 'ghep_vughep', async () => {
      await p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; }; put(0, 'vughep', 2); put(1, 'vughep', 2); put(3, 'vughep', LUAT.saoMax); put(4, 'vughep', LUAT.saoMax); UI.keo = null; UI.chonGhep = null; });
      await sleep(150); const a = await viTri(p, 0), c = await viTri(p, 1); await keo(p, a[0], a[1], c[0], c[1], 60); await sleep(400);
      const s = await p.evaluate(() => { const B = G.ban[0]; return { a: !!B.t[0], b: B.t[1] && [B.t[1].id, B.t[1].sao], max: hopLeGhep(B.t[3], B.t[4]) }; });
      if (s.a || !s.b || s.b[0] !== 'vughep' || s.b[1] !== 3) throw new Error('Merge King★2 + Merge King★2 không ra Merge King★3 (' + JSON.stringify(s) + ')');
      if (s.max) throw new Error('Merge King ở sao tối đa vẫn ghép được');
    });
    await buoc(p, co, 'xem_nhanh', async () => { const o = await p.evaluate(() => G.ban[0].t.findIndex(Boolean)); const a = await viTri(p, o); await p.mouse.click(a[0], a[1]); await sleep(350); if (await p.evaluate(() => document.getElementById('tt').hidden)) throw new Error('chạm ụ không mở bảng xem nhanh'); });
    await p.evaluate(() => { try { HB.dongHet(); } catch (e) { } UI.chonGhep = null; });
    await buoc(p, co, 'tam_dung', async () => { await bam(p, '[data-act="dung"]'); await sleep(300); if (await p.evaluate(() => document.getElementById('dung').hidden)) throw new Error('nút dừng không mở bảng'); });
    await buoc(p, co, 'tiep_tuc', async () => { const t0 = await p.evaluate(() => G.t); await bam(p, '#dung [data-act="tiep"]'); await sleep(800); if ((await p.evaluate(() => G.t)) <= t0) throw new Error('RESUME xong trận không chạy'); });
    await buoc(p, co, 'toc_do', async () => { const a = await p.evaluate(() => G.tocDo); await bam(p, '#nut-tocdo'); await sleep(200); if ((await p.evaluate(() => G.tocDo)) === a) throw new Error('nút tốc độ không đổi tốc độ'); });
    await buoc(p, co, 'mv', async () => { await p.evaluate(() => { G.ban[0].mana = 999; }); await bam(p, '#the-mv'); await sleep(500); });
    // tới wave 12 (qua trùm wave 10): tự chơi, tốc độ cao
    if (!NHANH) {
      await p.evaluate(() => { G.debug.auto = true; G.wave = Math.max(G.wave, 8); G.tocDo = 3; G.ban[0].mana = 5000; G.tim = 99; });
      let trum = false, t0 = Date.now(), w0 = await p.evaluate(() => G.wave), wCu = w0, tCu = Date.now(), chupTrum = false;
      while (Date.now() - t0 < 150000) {
        await sleep(1000);
        const s = await p.evaluate(() => ({ w: G.wave, trum: G.quai.some(q => q.trum || (typeof TRUM !== 'undefined' && TRUM[q.id])), ket: !!G.ketThuc, tim: G.tim }));
        if (s.trum) { trum = true; if (!chupTrum) { chupTrum = true; await kiem(p, co, 'solo_trum', { cho: 50 }); } }
        if (s.ket) { await p.evaluate(() => { document.getElementById('ketqua').hidden = true; G.ketThuc = null; G.het = false; G.dung = false; G.tim = 99; }); }
        if (s.w !== wCu) { wCu = s.w; tCu = Date.now(); }
        if (Date.now() - tCu > 60000) { await loi(p, co, 'solo_wave', 'kẹt', ['wave đứng ở ' + s.w + ' quá 60 s']); break; }
        if (s.w >= 12) break;
      }
      const w = await p.evaluate(() => G.wave);
      if (w < 12) await loi(p, co, 'solo_wave12', 'kẹt', ['sau 150 s mới tới wave ' + w]);
      if (!trum) await loi(p, co, 'solo_trum', 'kẹt', ['không thấy trùm trên đường (wave ' + w0 + '→' + w + ')']);
      const f2 = await fps(p, 2500); console.log('    fps wave ' + w + ': ' + f2.fps.toFixed(0) + ' (game ' + f2.p90.toFixed(1) + ' ms p90)'); if (f2.thap) await loi(p, co, 'solo_fps_w12', 'fps thấp', ['fps ' + f2.fps.toFixed(0) + ', game ' + f2.p90.toFixed(1) + ' ms/khung ở wave ' + w]);
      await kiem(p, co, 'solo_w12');
      await p.evaluate(() => { G.debug.auto = false; G.tocDo = 1; });
    }
    // MỌI trùm trong bể (6 cũ + trùm mới): gọi ra từng con → không 404 ảnh, không lỗi trang, băng cảnh báo không tràn
    const ds = await p.evaluate(() => (typeof TRUM_POOL !== 'undefined' ? TRUM_POOL : TRUM_THU_TU).slice());
    for (const id of ds) {
      await buoc(p, co, 'trum_' + id, async () => {
        await p.evaluate((id) => { G.quai = []; G.ketThuc = null; G.dung = false; G.tim = 99; document.getElementById('ketqua').hidden = true; G.hang.push({ t: G.t, trum: id, p: 0 }); }, id); /* không gọi UI.canhBaoTrum bằng tay: tạo trạng thái băng giả (băng thật đo ở solo_trum) */
        await sleep(1500);
        const co1 = await p.evaluate((id) => G.quai.some(q => q.trum === id), id); if (!co1) throw new Error('gọi trùm ' + id + ' mà không thấy trên đường');
      }, { cho: 200 });
    }
    await p.evaluate(() => { G.quai = []; });
  } else {
    await p.evaluate(() => { G.debug.auto = true; G.tocDo = 2; });
    const w0 = await p.evaluate(() => G.wave); await sleep(14000);
    const s = await p.evaluate(() => ({ w: G.wave, b: G.ban.map(B => B.t.filter(Boolean).length) }));
    if (s.w <= w0) await loi(p, co, m + '_chay', 'kẹt', ['14 s ở 2× mà wave vẫn ' + s.w]);
    if (s.b.length < 2 || s.b[1] === 0) await loi(p, co, m + '_may', 'kẹt', ['bàn máy không đặt ụ (' + JSON.stringify(s.b) + ')']);
    await kiem(p, co, m + '_giua_tran');
    await p.evaluate(() => { G.debug.auto = false; G.tocDo = 1; });
  }
  // kết quả thắng / thua + chơi lại
  await buoc(p, co, m + '_thang', () => p.evaluate(() => { HB && HB.dongHet && HB.dongHet(); ketThuc(true); }), { cho: 1800 });
  await buoc(p, co, m + '_thua', () => p.evaluate(() => { document.getElementById('ketqua').hidden = true; G.ketThuc = null; G.het = false; ketThuc(false, TEXT.end.coreDown); }), { cho: 1800 });
  await buoc(p, co, m + '_choi_lai', async () => { await bam(p, '#ketqua [data-act="choilai"]'); await choTran(p); await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(1500); const s = await p.evaluate(() => ({ w: G.wave, ket: !!G.ketThuc, an: document.getElementById('ketqua').hidden })); if (s.ket || !s.an) throw new Error('PLAY AGAIN không bắt đầu trận mới ' + JSON.stringify(s)); }, { cho: 600 });
  await ctx.close();
}

// 4) sảnh ONLINE (máy chủ giả, 2 người)
async function online(b, W, H, D, co) {
  const ok = await fetch(`http://localhost:${MOCK}/`).then(() => true).catch(() => false);
  if (!ok) { await loi(null, co, 'online', 'kẹt', ['chưa chạy máy chủ giả cổng ' + MOCK + ' (tools/thap-online-mock-server.js)']); return; }
  const URL = `http://localhost:${MOCK}/thap/?net=mock&mockws=ws://localhost:${MOCK}&nointro=1&notut=1`;
  const vao = async (deck) => { const x = await mo(b, W, H, D, co, DA_XONG); await x.p.goto(URL, { waitUntil: 'load' }); await x.p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && typeof NET !== 'undefined' && NET.ok && typeof ONL !== 'undefined', null, { timeout: 45000 }); await x.p.evaluate((d) => { UI.chon = d; UI.veBoChon(); HM.ve(); }, deck); await sleep(400); return x; };
  let A, B;
  try {
    A = await vao(DECK.split(',')); B = await vao(DECK2.split(','));
    await buoc(A.p, co, 'online_bang', () => A.p.evaluate(() => ONL.moBang()));
    let code;
    await buoc(A.p, co, 'online_sanh', async () => { await bam(A.p, '[data-act="onl-tao"]'); await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 }); code = await A.p.textContent('#sanh-ma'); });
    await buoc(A.p, co, 'online_2_nguoi', async () => { await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await bam(B.p, '[data-act="onl-vao"]'); await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 }); });
    await buoc(A.p, co, 'online_tran', async () => { await bam(A.p, '#sanh-san'); await bam(B.p, '#sanh-san'); await A.p.waitForFunction(() => typeof ONS !== 'undefined' && ONS.on && G.ban.length === 2 && !TAI.cho, null, { timeout: 20000 }); await sleep(2500); }, { cho: 300 });
    await kiem(B.p, co, 'online_tran_B');
    // TWIN MAKER online (lockstep): A ghép 2 Twin Maker → máy B dựng y hệt bàn A (ụ sinh đôi đúng ô/loại/sao) NGAY khi áp gói 'gh'
    // (đo ngay sau ONS.apGhep — không nhờ ảnh chụp 1 s sửa lại)
    await buoc(A.p, co, 'online_sinhdoi', async () => {
      await B.p.evaluate(() => { ONS._kt = []; if (!ONS._ktBoc) { ONS._ktBoc = 1; const g = ONS.apGhep; ONS.apGhep = function (B1, d) { const r = g.apply(this, arguments); this._kt.push({ d, c: this.oCua(B1) }); return r; }; } });
      for (let lan = 0; lan < 3; lan++) {
        const sao = 2 + lan;
        await A.p.evaluate((sao) => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const put = (o, id) => { const T = sinhU(taoU(B, id, sao, o)); T.vxA = null; B.t[o] = T; }; put(0, 'sinhdoi'); put(1, 'sinhdoi'); for (let i = 5; i < 9; i++) put(i, 'canon'); ONS.chupAnh(); }, sao);
        const cA = await A.p.evaluate(() => ONS.oCua(G.ban[0]));
        await B.p.waitForFunction((c) => JSON.stringify(ONS.oCua(G.ban[1])) === c, JSON.stringify(cA), { timeout: 15000 }).catch(() => { throw new Error('bàn A chưa đồng bộ sang B (ảnh chụp)'); });
        const sau = await A.p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[0], B.t[1]); return ONS.oCua(B); });
        const nSD = sau.filter(x => x).length;
        if (nSD !== 6) throw new Error('A: sau ghép Twin có ' + nSD + ' ụ (phải 6)');
        if (!sau.some((x, i) => x && i !== 1 && !(i >= 5 && i < 9) && x.endsWith(':' + sao))) throw new Error('A: không có ụ sinh đôi ' + sao + '★ (' + sau.join(',') + ')');
        await B.p.waitForFunction(() => ONS._kt.length > 0, null, { timeout: 10000 }).catch(() => { throw new Error('B không nhận gói ghép'); });
        const kt = await B.p.evaluate(() => ONS._kt.shift());
        if (!kt.d.tw) throw new Error('gói ghép không kèm ụ sinh đôi (d.tw)');
        if (JSON.stringify(kt.c) !== JSON.stringify(sau)) throw new Error('B dựng khác A: ' + kt.c.join(',') + ' ≠ ' + sau.join(','));
      }
    });
  } catch (e) { await loi(A && A.p, co, 'online', 'kẹt', [e.message.split('\n')[0]]); }
  if (A) await A.ctx.close(); if (B) await B.ctx.close();
}

(async () => {
  const t0 = Date.now();
  // vẽ tay (tĩnh)
  try { execFileSync('node', [path.join(__dirname, 'thap-kt-vetay.js'), '--list'], { stdio: 'pipe' }); }
  catch (e) { const ds = String(e.stdout || '').split('\n').filter(l => /\[/.test(l)); for (const l of ds) LOI.push({ co: '-', buoc: 'vetay', loai: 'vẽ tay', chi: l, anh: '' }); console.log('  ✗ vẽ tay: ' + ds.length + ' dòng (node tools/thap-kt-vetay.js --list)'); }
  // kéo-thả bộ bài bằng cảm ứng thật (tools/thap-kt-keo.js) — lớp/ô bộ bài đổi mà mất kéo-thả = TRƯỢT
  if (!process.env.CHI || /keo|menu/.test(process.env.CHI)) {
    try { const o = execFileSync('node', [path.join(__dirname, 'thap-kt-keo.js'), BASE], { stdio: 'pipe', env: process.env }); console.log(String(o).trim()); }
    catch (e) { const ds = String(e.stdout || e.message).split('\n').filter(l => /✗/.test(l)); for (const l of ds) LOI.push({ co: '-', buoc: 'keo', loai: 'kéo-thả bộ bài', chi: l, anh: '' }); console.log(ds.join('\n') || '  ✗ kéo-thả: kẹt'); }
  }
  // đầu ụ phân biệt được (tools/thap-dau-giong.py --kiem): 2 ụ CÙNG ĐỘ HIẾM có đầu quá giống (vd. Copycat cũ ≈ Twin Maker) = TRƯỢT
  if (!process.env.CHI || /dau|menu/.test(process.env.CHI)) {
    try { const o = execFileSync('python3', [path.join(__dirname, 'thap-dau-giong.py'), '--kiem'], { stdio: 'pipe' }); console.log(String(o).trim().split('\n').pop()); }
    catch (e) { const ds = String(e.stdout || e.message).split('\n').filter(l => /✗/.test(l)); for (const l of (ds.length ? ds : ['thap-dau-giong.py lỗi ' + e.status])) LOI.push({ co: '-', buoc: 'dau', loai: 'đầu ụ giống nhau', chi: l, anh: 'docs/demo-hop-tuong/tuvan/dau_giong/cap_giong.png' }); console.log(ds.join('\n')); }
  }
  // nút SUMMON luôn hiện + ảnh nền HUD trận đã tải (tools/thap-kt-nut-trieu.js — lỗi 06/11 bàn đầy = hốc tròn trống)
  if (!process.env.CHI || /solo|coop|pvp|hud/.test(process.env.CHI)) {
    try { const o = execFileSync('node', [path.join(__dirname, 'thap-kt-nut-trieu.js'), BASE], { stdio: 'pipe', env: Object.assign({}, process.env, { KHONG_CHUP: '1' }), timeout: 600000 }); console.log(String(o).trim().split('\n').pop()); }
    catch (e) { const ds = String(e.stdout || e.message).split('\n').filter(l => /✗/.test(l)); for (const l of (ds.length ? ds : ['thap-kt-nut-trieu.js kẹt'])) LOI.push({ co: '-', buoc: 'nut_trieu', loai: 'nút SUMMON / ảnh HUD', chi: l.trim(), anh: '' }); console.log(ds.join('\n') || '  ✗ nút SUMMON: kẹt'); }
  }
  // cộng hưởng kỹ năng với ô ĐÁ / BĂNG (luật DCDW: Merge King nâng sao ô đá → 2 đá cùng sao ghép; Teleporter đổi chỗ đá; Copycat… không) — tools/thap-kt-conghuong.js
  if (!process.env.CHI || /conghuong|solo/.test(process.env.CHI)) {
    try { execFileSync('node', [path.join(__dirname, 'thap-kt-conghuong.js')], { stdio: 'pipe', env: Object.assign({}, process.env, { SHOTS: '0' }), timeout: 300000 }); console.log('  ✓ cộng hưởng đá/băng (thap-kt-conghuong.js)'); }
    catch (e) { const ds = String(e.stdout || e.message || '').split('\n').filter(l => /✗/.test(l)); for (const l of (ds.length ? ds : ['thap-kt-conghuong.js lỗi ' + e.status])) LOI.push({ co: '-', buoc: 'conghuong', loai: 'cộng hưởng đá/băng', chi: l, anh: '' }); console.log(ds.join('\n') || '  ✗ cộng hưởng: lỗi chạy'); }
  }
  // cộng hưởng kỹ năng ĐẶC BIỆT × NHAU (Copycat giữ dạng, đá không tính bingo/chuỗi, Star Breaker chỉ ghép thật, ghép đặc biệt online) — tools/thap-kt-conghuong2.js
  if (!process.env.CHI || /conghuong|solo/.test(process.env.CHI)) {
    try { execFileSync('node', [path.join(__dirname, 'thap-kt-conghuong2.js')], { stdio: 'pipe', env: Object.assign({}, process.env, { SHOTS: '0' }), timeout: 300000 }); console.log('  ✓ cộng hưởng kỹ năng × nhau (thap-kt-conghuong2.js)'); }
    catch (e) { const ds = String(e.stdout || e.message || '').split('\n').filter(l => /✗/.test(l)); for (const l of (ds.length ? ds : ['thap-kt-conghuong2.js lỗi ' + e.status])) LOI.push({ co: '-', buoc: 'conghuong2', loai: 'cộng hưởng kỹ năng', chi: l, anh: '' }); console.log(ds.join('\n') || '  ✗ cộng hưởng 2: lỗi chạy'); }
  }
  const CHI = process.env.CHI ? new RegExp(process.env.CHI) : /./;
  // SẢNH ONLINE trên đường code Firebase (SDK giả + máy chủ giả thi hành luật database thật): tạo/vào mã/link mời/READY/vào trận ≤ 3 s,
  // khách rời–vào lại, chủ phòng/khách tải lại ở sảnh (lỗi 05/11 "không vào game được") — tools/thap-kt-online-sanh.js, chạy 1 lần
  if (CHI.test('sanh') || CHI.test('online')) {
    try { execFileSync('node', [path.join(__dirname, 'thap-kt-online-sanh.js')], { stdio: 'pipe', env: process.env, timeout: 900000 }); console.log('  ✓ sảnh online (thap-kt-online-sanh.js)'); }
    catch (e) { const ds = String(e.stdout || e.message || '').split('\n').filter(l => /^FAIL|Error/.test(l)); for (const l of (ds.length ? ds : ['thap-kt-online-sanh.js lỗi ' + e.status])) LOI.push({ co: '-', buoc: 'sanh', loai: 'online sảnh', chi: l.slice(0, 300), anh: '' }); console.log('  ✗ sảnh online: ' + ds.length + ' dòng (node tools/thap-kt-online-sanh.js)'); }
  }
  const b = await chromium.launch();
  for (const [W, H, D] of SIZES) {
    const co = W + 'x' + H; console.log('— ' + co + ' DPR ' + D);
    if (CHI.test('landau')) await lanDau(b, W, H, D, co).catch(e => loi(null, co, 'landau', 'kẹt', [e.message]));
    if (CHI.test('menu')) await menu(b, W, H, D, co).catch(e => loi(null, co, 'menu', 'kẹt', [e.message]));
    for (const m of ['solo', 'coop', 'pvp']) if (CHI.test(m)) await tran(b, W, H, D, co, m).catch(e => loi(null, co, m, 'kẹt', [e.message]));
    if (CHI.test('online')) await online(b, W, H, D, co).catch(e => loi(null, co, 'online', 'kẹt', [e.message]));
  }
  await b.close();
  fs.writeFileSync(OUT + 'ketqua.json', JSON.stringify(LOI, null, 1));
  if (process.env.GHI_MO) { const g = Object.assign({}, MO_MOC); for (const k in MO_GHI) g[k] = Math.max(g[k] || 0, +MO_GHI[k].toFixed(2)); fs.writeFileSync(MO_F, JSON.stringify(Object.fromEntries(Object.entries(g).sort()), null, 1) + '\n'); console.log('đã ghi mốc ảnh mờ: ' + Object.keys(g).length + ' ảnh → ' + MO_F); }
  const no = Object.keys(NO_ANH); if (no.length) console.log('nợ ảnh (cần gen lại, không tính trượt): ' + no.length + ' ảnh — ' + no.slice(0, 12).join(', ') + (no.length > 12 ? ', …' : ''));
  const nhom = {}; for (const l of LOI) { const k = l.loai + ' | ' + l.chi.replace(/\d+(\.\d+)?/g, '#'); (nhom[k] = nhom[k] || []).push(l); }
  console.log('\n==== ' + LOI.length + ' lỗi, ' + Object.keys(nhom).length + ' loại  (' + Math.round((Date.now() - t0) / 1000) + ' s) ====');
  for (const [k, v] of Object.entries(nhom)) console.log(v.length + '×  ' + k.slice(0, 200) + '   [' + [...new Set(v.map(x => x.co + ':' + x.buoc))].slice(0, 4).join(', ') + ']');
  console.log(LOI.length ? 'TRƯỢT' : 'XANH — không lỗi hồi quy');
  process.exit(LOI.length ? 1 : 0);
})();
