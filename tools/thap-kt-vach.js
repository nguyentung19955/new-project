// TURRET MERGE — kiểm "vạch mờ trên biểu tượng tướng": chân dung phải nằm GỌN trong ô cửa sổ của khung độ hiếm
// (the_khung_*.png: ô cửa sổ x 15.6–84.4 %, y 18.9–83.8 %; tỉ lệ khung 271 × 328), khung không bị bóp/kéo méo.
// Chụp phóng to mọi chỗ có chân dung trong khung + chỗ có biểu tượng tướng ở 360×780 / 390×844 / 430×932, DPR 3.
//   BASE=http://localhost:8765 OUT=docs/demo-hop-tuong/tuvan/vach/sau_ node tools/thap-kt-vach.js
// Hàm KT_VACH (trong trang) dùng chung cho tools/thap-kt-tran.js + tools/thap-kt-hoiquy.js — kiểm luôn KHUNG MẶT ô nhỏ (đầu ≤ 60 %, tóc/cằm không cắt).
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765', OUT = process.env.OUT || 'shots/vach_';
const DECK = ['lophanung', 'radar', 'lien', 'bang', 'canon'];
// chạy TRONG trang: trả danh sách khung hỏng
const KT_VACH = () => {
  const WX0 = .156, WX1 = .844, WY0 = .189, WY1 = .838, TL = 271 / 328, hong = [], tong = { khung: 0 };
  const hien = (e) => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; } return true; };
  const hop = (e) => { const s = e.style.scale, tl = e.style.translate; e.style.scale = 'none'; e.style.translate = 'none'; const t = e.style.transform; const r = e.getBoundingClientRect(); e.style.scale = s; e.style.translate = tl; e.style.transform = t; return r; }; // hộp ảnh = cửa sổ (phóng/dời bên trong do js/chandung.js, clip-path giữ trong hộp)
  for (const k of document.querySelectorAll('img.kh, img.vt-khung')) {
    if (!hien(k) || !/the_khung_/.test(k.getAttribute('src') || '')) continue;
    tong.khung++;
    const p = k.parentElement, ten = (p.id ? '#' + p.id : '') + '.' + [...p.classList].join('.') + (p.dataset.id ? '[' + p.dataset.id + ']' : '');
    const K = hop(k); // ô khung KHÔNG tính scale của css/khung-p9.css (ảnh có lề cho hoạ tiết tràn ra)
    // tỉ lệ khung (không méo)
    const tl = (K.width / K.height) / TL;
    if (Math.abs(tl - 1) > .03) hong.push(ten + ': khung méo ' + K.width.toFixed(1) + '×' + K.height.toFixed(1) + ' (tỉ lệ lệch ' + ((tl - 1) * 100).toFixed(0) + '%)');
    const po = [...p.querySelectorAll(':scope > img, :scope > .mv-ic, :scope > .anh')].find(x => x !== k && !x.matches('.kh,.gl,.ic,.vt-khung,.kh-k') && hien(x));
    if (!po) continue;
    const P = hop(po), W = { l: K.left + K.width * WX0, r: K.left + K.width * WX1, t: K.top + K.height * WY0, b: K.top + K.height * WY1 };
    const ra = Math.max(W.l - P.left, P.right - W.r, W.t - P.top, P.bottom - W.b);
    const ix = Math.max(0, Math.min(P.right, W.r) - Math.max(P.left, W.l)), iy = Math.max(0, Math.min(P.bottom, W.b) - Math.max(P.top, W.t));
    const phu = ix * iy / ((W.r - W.l) * (W.b - W.t));
    if (ra > 1.5) hong.push(ten + ': chân dung tràn ra ngoài ô cửa sổ ' + ra.toFixed(1) + ' px');
    if (phu < .95) hong.push(ten + ': chân dung chỉ phủ ' + (phu * 100).toFixed(0) + '% ô cửa sổ');
    if (+getComputedStyle(po).zIndex >= +getComputedStyle(k).zIndex && getComputedStyle(k).zIndex !== 'auto') hong.push(ten + ': chân dung nằm TRÊN khung');
  }
  // KHUNG MẶT ô nhỏ (js/chandung.js datDau — người dùng: tile_zoom_qua.png "zoom quá đà"; mẫu DCDW): mọi chân dung ≤ 140 px CSS
  //   LỖI nếu cả đầu (tóc → cằm) > 60 % vùng thấy · cằm bị cắt · tóc bị cắt (< 4 % mà ảnh gốc còn chỗ) · > 1.0 px nguồn / px máy ở DPR 3
  tong.mat = 0;
  for (const im of document.querySelectorAll('img[src*="pilot_"], img[src*="af_"]')) {
    const po = im._po; if (!po || po.che !== 'dau' || !hien(im)) continue;
    tong.mat++;
    const p = im.parentElement && im.parentElement.closest('[id], [class]'), ten = 'chân dung ' + (typeof MAT !== 'undefined' ? MAT.id(im) : '') + ' @' + (p ? (p.id ? '#' + p.id : '') + '.' + [...p.classList].slice(0, 2).join('.') : '') + ' ' + im.clientWidth + '×' + im.clientHeight;
    if (po.dau > .605) hong.push(ten + ': phóng quá — cả đầu ' + (po.dau * 100).toFixed(0) + ' % ô (≤ 60 %)');
    if (po.cam > .985) hong.push(ten + ': cằm bị cắt (' + (po.cam * 100).toFixed(0) + ' %)');
    if (po.toc < .04 - 1e-3 && !po.bien) hong.push(ten + ': tóc bị cắt (đỉnh tóc ' + (po.toc * 100).toFixed(1) + ' %)');
    if (po.nguon > 1.02) hong.push(ten + ': phóng quá độ nét (' + po.nguon.toFixed(2) + ' px nguồn/px máy ở DPR 3)');
  }
  return { tong, hong };
};
module.exports = { KT_VACH };
if (require.main === module) (async () => {
  const b = await chromium.launch(); const kq = {}; let loi = 0;
  const VP = [[360, 780], [390, 844], [430, 932]];
  for (const [w, h] of VP) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
    await ctx.addInitScript((d) => { try { if (!localStorage.getItem('turret_bo')) localStorage.setItem('turret_bo', JSON.stringify({ chon: d, mv: 'hero' })); if (!localStorage.getItem('turret_hd')) localStorage.setItem('turret_hd', JSON.stringify({ xong: false, boQua: true, buoc: {} })); } catch (e) { } }, DECK);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const chup = async (ten, sel, pad = 8) => {
      const r = await p.evaluate(([s, pad]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 2) return null;
        const x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad); return { x, y, width: Math.min(innerWidth - x, r.width + pad * 2), height: Math.min(innerHeight - y, r.height + pad * 2) }; }, [sel, pad]);
      if (r && r.height > 2) await p.screenshot({ path: OUT + ten + '_' + w + '.png', clip: r }); else console.log('  (không thấy ' + sel + ' — ' + ten + ')');
    };
    const da = new Set(); // mỗi lỗi chỉ báo 1 lần / cỡ màn
    const kt = async (ten) => { const r = await p.evaluate(KT_VACH); const moi = r.hong.filter(x => !da.has(x)); moi.forEach(x => da.add(x)); kq[w + ' ' + ten] = { khung: r.tong.khung, hong: moi }; loi += moi.length; };
    await p.goto(BASE + '/thap/?notut=1&nointro=1', { waitUntil: 'load' }); await p.waitForTimeout(3000);
    await chup('home_deck', '.hm-tab'); await kt('home');
    await p.evaluate(() => HM.di('dk')); await p.waitForTimeout(1200);
    await chup('deck_o', '#chon-bo', 14); await chup('deck_mv', '#chon-bo .o-mv'); await chup('deck_luoi', '#chon-luoi .luoi', 0); await kt('deck');
    await p.evaluate((id) => HM.moXem(id), DECK[0]); await p.waitForTimeout(700); await chup('xem', '#hm-tam', 0); await kt('xem');
    await p.evaluate(() => HM.moMVs()); await p.waitForTimeout(700); await chup('chihuy', '#hm-tam', 0); await kt('chihuy');
    await p.evaluate(() => HM.moPre()); await p.waitForTimeout(700); await chup('presets', '#hm-tam', 0); await kt('presets');
    await p.evaluate(() => { HM.dong(true); HM.di('dk', true); }); await p.waitForTimeout(1200); await chup('bst', '#chon-luoi .luoi', 0); await kt('bst');
    await p.evaluate((id) => { const c = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); UP.mo(id, c); }, DECK[1]); await p.waitForTimeout(1500); await chup('up_hero', '.up-hero', 0); await kt('unitpage');
    // trận SOLO / CO-OP / PVP
    for (const che of ['solo', 'coop', 'pvp']) {
      await p.goto(BASE + '/thap/?mode=' + che + '&deck=' + DECK.join(',') + '&deck2=drone,bao,kiembang,hydra,anhsang&mana=3000&notut=1', { waitUntil: 'load' }); await p.waitForTimeout(3200);
      await chup('vaotran_' + che, '#nd-gt', 0); await kt('vaotran ' + che);
      for (let i = 0; i < 2; i++) { await p.mouse.click(w / 2, h * .56); await p.waitForTimeout(600); }
      await p.waitForTimeout(900);
      await chup('khay_' + che, '#duoi', 4); await kt('tran ' + che);
      if (che !== 'solo') await chup('dai_' + che, '#dp-dai', 4);
    }
    kq[w + ' loi trang'] = errs.slice(0, 5); loi += errs.length;
    await ctx.close();
  }
  for (const [k, v] of Object.entries(kq)) console.log(k, JSON.stringify(v));
  console.log(loi ? 'HỎNG: ' + loi : 'ĐẠT'); await b.close(); process.exitCode = loi ? 1 : 0;
})();
