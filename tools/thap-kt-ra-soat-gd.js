// TURRET MERGE — RÀ SOÁT GIAO DIỆN TỰ ĐỘNG: icon/ảnh nằm gọn trong khung, chữ không tràn/không bị cắt, nút không chồng nhau.
// Mở từng màn (HOME, bộ bài, bộ sưu tập, trang ụ, cửa hàng, vòng quay, rương, nhiệm vụ, sự kiện, trùm, chế độ, lò rèn, hồ sơ,
// cài đặt, lên cấp, kết quả, tạm dừng, HUD solo/PVP/co-op, màn tải) ở nhiều cỡ màn + EN/VI, đo bằng getBoundingClientRect:
//   LOI  : ảnh/icon vượt khỏi khung cha có hình (nút, ô có nền/viền/ảnh nền) > NGUONG px
//   CAT  : ảnh/icon bị khung overflow:hidden (không phải vùng cuộn) cắt mất một phần
//   CHU  : chữ tràn khỏi hộp của nó (scrollWidth/Height > client* khi overflow ẩn) hoặc vượt khung có hình
//   CHONG: 2 nút/ô bấm chồng lên nhau
//   NGOAI: phần tử lòi ra ngoài màn hình
// Mỗi màn chụp 2 ảnh: <ten>.jpg (gốc) và <ten>_d.jpg (khoanh đỏ chỗ nghi lỗi) + JSON kết quả.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi
//   OUT=/tmp/rs/ node tools/thap-kt-ra-soat-gd.js [390x844,844x390,...] [en,vi] [lọc tên màn]
// Mã thoát ≠ 0 nếu còn lỗi chưa nằm trong danh sách bỏ qua (BO_QUA — chỗ cố ý: huy hiệu nổi trên nóc nút…).
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/ra-soat/';
const URL = process.env.URL || 'http://127.0.0.1:8765/thap/';
const CO = (process.argv[2] || '390x844,393x852,375x667,844x390').split(',').map(s => s.split('x').map(Number));
const NGU = (process.argv[3] || 'en,vi').split(',');
const LOC = process.argv[4] ? new RegExp(process.argv[4]) : null;
const NGUONG = +(process.env.NGUONG || 3);
fs.mkdirSync(OUT, { recursive: true });

// chỗ CỐ Ý vượt khung (thiết kế): khớp theo đường dẫn phần tử
const BO_QUA = [
  /\.kt-cham\b/, // chấm đỏ thông báo đặt chéo góc nút
  /#hm-mo\b.*\.hm-ic-noi/, // icon nổi trên nóc nút HOME (thiết kế)
];

function doTrang(NGUONG) { // chạy trong trang: trả danh sách nghi lỗi
  const W = innerWidth, H = innerHeight;
  const alpha = (c) => { if (!c || c === 'transparent') return 0; const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const csC = new Map(); const cs = (e) => { let v = csC.get(e); if (!v) { v = getComputedStyle(e); csC.set(e, v); } return v; };
  const hien = (e) => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const s = cs(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05 || x.hidden) return false; } const r = e.getBoundingClientRect(); if (!(r.width > 1 && r.height > 1 && r.right > 0 && r.bottom > 0 && r.left < W && r.top < H)) return false;
    for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const s = cs(x); if (/auto|scroll/.test(s.overflowY + s.overflowX)) { const q = x.getBoundingClientRect(); if (r.top >= q.bottom - 2 || r.bottom <= q.top + 2) return false; } } // nằm hẳn ngoài vùng cuộn
    return true; };
  const ten = (e) => { let s = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 3).join('.') : ''); let p = e.parentElement, d = 0; while (p && d < 3 && p !== document.body) { s = p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + (p.classList.length ? '.' + [...p.classList].slice(0, 2).join('.') : '') + ' > ' + s; p = p.parentElement; d++; } return s; };
  const coHinh = (e) => { // khung có hình (để so ảnh con nằm gọn)
    if (e.tagName === 'BUTTON') return true;
    const s = cs(e);
    if (/url\(/.test(s.backgroundImage)) return true;
    if (s.borderImageSource && s.borderImageSource !== 'none') return true;
    if (alpha(s.backgroundColor) > 0.25) return true;
    if (parseFloat(s.borderTopWidth) > 0.5 && alpha(s.borderTopColor) > 0.3) return true;
    return false;
  };
  const laAnh = (e) => (e.tagName === 'IMG' && e.getBoundingClientRect().width * e.getBoundingClientRect().height < 0.3 * W * H) || e.tagName === 'svg' || (/url\(/.test(cs(e).backgroundImage) && e.getBoundingClientRect().width < 140 && e.getBoundingClientRect().height < 140);
  const out = [];
  const them = (loai, e, r, chiTiet) => out.push({ loai, el: ten(e), r: [r.left, r.top, r.width, r.height].map(Math.round), ct: chiTiet });
  const vuot = (a, b) => Math.max(b.left - a.left, a.right - b.right, b.top - a.top, a.bottom - b.bottom); // a vượt b bao nhiêu px
  const tatCa = [...document.querySelectorAll('body *')].filter(e => e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE' && e.tagName !== 'CANVAS' && e.tagName !== 'IFRAME' && hien(e));
  const coDinh = (e) => { for (let x = e; x; x = x.parentElement) if (cs(x).position === 'fixed') return x; return null; };
  // bị lớp khác (bảng phủ, nền tối) che → không tính (người chơi không thấy)
  const biChe = (e) => {
    const r = e.getBoundingClientRect(); const x = Math.min(W - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    const t = document.elementFromPoint(x, y); if (!t || e.contains(t) || t.contains(e)) return false;
    let a = e, d = 0; while (a && !a.contains(t)) { a = a.parentElement; d++; } return d > 3;
  };
  for (const e of tatCa) {
    const r = e.getBoundingClientRect();
    if (biChe(e)) continue;
    // ---- ảnh/icon ----
    if (laAnh(e)) {
      // khung cha có hình gần nhất (bỏ qua chính nó)
      let k = e.parentElement; while (k && k !== document.body && !coHinh(k)) k = k.parentElement;
      if (k && k !== document.body) {
        const rk = k.getBoundingClientRect();
        // khung cha toàn màn (nền) → bỏ
        if (!(rk.width >= W - 2 && rk.height >= H * 0.6)) {
          const v = vuot(r, rk);
          if (v > NGUONG && cs(e).position !== 'fixed') them('LOI', e, r, 'vượt khung ' + Math.round(v) + 'px (' + ten(k).split(' > ').pop() + ' ' + [rk.left, rk.top, rk.width, rk.height].map(Math.round).join(',') + ')');
        }
      }
      // bị cắt bởi overflow ẩn (không phải vùng cuộn)
      for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) {
        const s = cs(x); const ox = s.overflowX, oy = s.overflowY;
        if (ox === 'visible' && oy === 'visible') continue;
        const cuon = /auto|scroll/.test(ox + oy);
        const rx = x.getBoundingClientRect(); const v = vuot(r, rx);
        if (v > NGUONG + 1 && !cuon && (ox === 'hidden' || ox === 'clip' || oy === 'hidden' || oy === 'clip')) { them('CAT', e, r, 'bị cắt ' + Math.round(v) + 'px bởi ' + ten(x).split(' > ').pop()); break; }
        if (cuon) break;
      }
    }
    // ---- chữ ----
    let coChu = false; for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { coChu = true; break; }
    if (coChu) {
      const s = cs(e);
      const an = /hidden|clip/.test(s.overflowX + s.overflowY);
      if (an && (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 3) && !/auto|scroll/.test(s.overflowX + s.overflowY)) them('CHU', e, r, 'chữ bị cắt (' + e.scrollWidth + '×' + e.scrollHeight + ' > ' + e.clientWidth + '×' + e.clientHeight + ')' + (s.textOverflow === 'ellipsis' ? ' …' : '') + ' "' + e.textContent.trim().slice(0, 30) + '"');
      // chữ thật (range) vượt khung có hình gần nhất
      const rg = document.createRange(); rg.selectNodeContents(e); const rt = rg.getBoundingClientRect();
      let k = e; while (k && k !== document.body && !coHinh(k)) k = k.parentElement;
      if (k && k !== document.body && rt.width > 0) {
        const rk = k.getBoundingClientRect();
        if (!(rk.width >= W - 2 && rk.height >= H * 0.6)) { const v = vuot(rt, rk); if (v > NGUONG + 1) them('CHU', e, rt, 'chữ vượt khung ' + Math.round(v) + 'px "' + e.textContent.trim().slice(0, 30) + '"'); }
      }
      if (rt.width > 0 && (rt.left < -1 || rt.right > W + 1) && !coDinh(e)) them('NGOAI', e, rt, 'chữ ra ngoài màn "' + e.textContent.trim().slice(0, 20) + '"');
    }
  }
  // ---- nút chồng nhau ----
  const nut = tatCa.filter(e => (e.tagName === 'BUTTON' || e.getAttribute('data-act')) && !e.closest('[aria-hidden="true"]') && !biChe(e) && (() => { const r = e.getBoundingClientRect(); return r.width * r.height < 0.35 * W * H; })());
  for (let i = 0; i < nut.length; i++) for (let j = i + 1; j < nut.length; j++) {
    const a = nut[i], b = nut[j]; if (a.contains(b) || b.contains(a)) continue;
    const lop = (e) => e.closest('#hm-mo,#tt-phu,#kt-phu,#kt,#up,#ketqua,#dung,#tt,#cdd-hoi,#tai,.kt-phu,.cd-p');
    if (lop(a) !== lop(b)) continue; // khác lớp (bảng phủ / màn khác đè lên)
    { let c = a, da = 0; while (c && !c.contains(b)) { c = c.parentElement; da++; } let db = 0; for (let x = b; x && x !== c; x = x.parentElement) db++; if (da > 4 || db > 4) continue; } // khác lớp (bảng phủ đè màn dưới) → không tính
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (w > 6 && h > 6 && w * h > 0.12 * Math.min(ra.width * ra.height, rb.width * rb.height)) {
      // chỉ tính khi cả 2 đều thật sự hiện ở điểm giao (không bị cái khác che hoàn toàn)
      const cx = Math.max(ra.left, rb.left) + w / 2, cy = Math.max(ra.top, rb.top) + h / 2; const top = document.elementFromPoint(cx, cy);
      if (top && (a.contains(top) || b.contains(top))) them('CHONG', a, ra, 'chồng ' + ten(b).split(' > ').pop() + ' ' + Math.round(w) + '×' + Math.round(h));
    }
  }
  return out;
}

function khoanh(ds) { // vẽ khung đỏ lên trang (lớp phủ tạm)
  const L = document.createElement('div'); L.id = 'rs-phu'; L.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
  const mau = { LOI: '#ff2a2a', CAT: '#ff9900', CHU: '#00e5ff', CHONG: '#ff00ff', NGOAI: '#ffff00' };
  ds.forEach((d, i) => { const b = document.createElement('div'); b.style.cssText = 'position:absolute;border:2px solid ' + mau[d.loai] + ';left:' + d.r[0] + 'px;top:' + d.r[1] + 'px;width:' + d.r[2] + 'px;height:' + d.r[3] + 'px;font:10px monospace;color:#fff;background:rgba(0,0,0,.08)'; b.textContent = i; L.appendChild(b); });
  document.body.appendChild(L);
}

// trạng thái người chơi lâu năm: mở hết, nhiều tiền (để hiện đủ màn)
const SACH = () => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } };
const GIAU = () => {
  try { const t = TT.st(); t.xp = TT.xpTong(Math.min(20, (TTC.capMax || 20))); t.nhanCap = TT.cap(); t.qv = 1; TT.xetCap && TT.xetCap(); } catch (e) { }
  try { const d = KT.doc(); d.vang = 123456; d.ngoc = 4567; KT.doc().tk && (KT.doc().tk.wave = 40); KT.luu && KT.luu(true); KTUI.capNhat(); } catch (e) { }
  try { HM.ve && HM.ve(); } catch (e) { }
};
const dongHet = () => { try { TTUI.dong(); } catch (e) { } try { KTUI.dong(); } catch (e) { } try { HM.dong(true); } catch (e) { } try { UP.dong(); } catch (e) { } try { TK.dongBang(); } catch (e) { } };

// danh sách màn: [tên, query, hàm chuẩn bị (chuỗi JS chạy trong trang), chờ ms]
const MAN = [
  ['tai', '?notut=1', null, 0, 'tai'],
  ['home', '?notut=1', GIAU],
  ['home-moi', '?notut=1', null],
  ['che', '?notut=1', () => { HM.moChe(); }],
  ['caidat', '?notut=1', () => { HM.moCai(); }],
  ['deck', '?notut=1', () => { HM.di('dk'); }],
  ['deck-cuoi', '?notut=1', () => { HM.di('dk'); const l = document.querySelector('#chon-luoi'); l.scrollTop = l.scrollHeight; }],
  ['bst', '?notut=1', () => { HM.di('dk', true); }],
  ['deck-chua-hd', '', () => { try { localStorage.removeItem('turret_hd'); } catch (e) { } HM.di('dk'); }],
  ['xemnhanh', '?notut=1', () => { HM.di('dk'); const c = document.querySelector('#chon-luoi .c'); HM.moXem(c ? c.dataset.id : 'canon', c); }],
  ['up', '?notut=1', () => { UP.mo('canon'); }],
  ['up-giua', '?notut=1', () => { UP.mo('canon'); setTimeout(() => { const t = document.querySelector('#up .up-than'); if (t) t.scrollTop = 700; }, 800); }],
  ['up-cuoi', '?notut=1', () => { UP.mo('canon'); setTimeout(() => { const t = document.querySelector('#up .up-than'); if (t) t.scrollTop = t.scrollHeight; }, 800); }],
  ['up-test', '?notut=1', () => { UP.mo('canon'); setTimeout(() => { const b = document.querySelector('#up [data-up="test"]'); b && b.click(); }, 800); }, 4500],
  ['mv', '?notut=1', () => { UP.moMV(Object.keys(MAVUONG)[0]); }],
  ['shop', '?notut=1', () => { KTUI.moTab('shop'); }],
  ['shop-giua', '?notut=1', () => { KTUI.moTab('shop'); setTimeout(() => { const t = document.querySelector('#kt-than'); t.scrollTop = 900; }, 300); }],
  ['shop-cuoi', '?notut=1', () => { KTUI.moTab('shop'); setTimeout(() => { const t = document.querySelector('#kt-than'); t.scrollTop = t.scrollHeight; }, 300); }],
  ['vq', '?notut=1', () => { KTUI.moTab('vq'); }],
  ['nv', '?notut=1', () => { KTUI.moTab('nv'); }],
  ['nv-cuoi', '?notut=1', () => { KTUI.moTab('nv'); setTimeout(() => { const t = document.querySelector('#kt-than'); t.scrollTop = t.scrollHeight; }, 300); }],
  ['sk', '?notut=1', () => { KTUI.moTab('sk'); }],
  ['ruong', '?notut=1', () => { KTUI.moTab('shop'); KT.cong('vang', 99999, 'other'); KTUI.ve(); document.querySelector('[data-act=kt-ru][data-k=thuong]').click(); }, 5000],
  ['tiLe', '?notut=1', () => { KTUI.moTab('shop'); KTUI.tiLe('thuong'); }],
  ['trum', '?notut=1', () => { TX.moDS(); }],
  ['trum-ct', '?notut=1', () => { TX.moCT(Object.keys(TRUM)[0]); }],
  ['thap', '?notut=1', () => { CDUI.mo('thap'); }],
  ['santrum', '?notut=1', () => { CDUI.mo('san'); }],
  ['thuthach', '?notut=1', () => { CDUI.mo('thu'); }],
  ['votan', '?notut=1', () => { CDDUI.votan(); }],
  ['tuan', '?notut=1', () => { CDDUI.tuan(); }],
  ['hoso', '?notut=1', () => { TK.moBang(); }],
  ['lencap', '?notut=1', () => { const t = TT.st(); t.xp = TT.xpTong(TT.cap() + 1); TT.xetCap && TT.xetCap(); TTUI.baoMoi && TTUI.baoMoi(); }],
  ['solo', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=260', null, 3000],
  ['solo-tt', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=260', () => { const T = G.ban[0].t.find(Boolean); UI.moTT(T.id, T); }, 3000],
  ['tamdung', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=260', () => { document.querySelector('[data-act="dung"]').click(); }, 3000],
  ['ketqua', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=12&fill=6&mana=260', () => { ketThuc(true, 'Wave 12'); }, 3000],
  ['ketqua-thua', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=260', () => { ketThuc(false, 'Core destroyed'); }, 3000],
  ['pvp', '?notut=1&mode=pvp&deck=canon,bang,tia,set,lien&wave=3&fill=4&mana=260', null, 3000],
  ['coop', '?notut=1&mode=coop&deck=canon,bang,tia,set,lien&wave=3&fill=4&mana=260', null, 3000],
];

(async () => {
  const b = await chromium.launch();
  const tong = {}; const errs = [];
  for (const [W, H] of CO) for (const lang of NGU) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: +(process.env.DPR || 2), hasTouch: true, isMobile: W < H });
    for (const [tenMan, q, chuanBi, cho = 2200, dacBiet] of MAN) {
      if (LOC && !LOC.test(tenMan)) continue;
      const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(tenMan + ' ' + W + ' :: ' + e.message));
      if (tenMan !== 'home-moi' && tenMan !== 'deck-chua-hd') await p.addInitScript(SACH);
      await p.addInitScript((l) => { try { localStorage.setItem('tm_lang', l); } catch (e) { } }, lang);
      const id = tenMan + '_' + W + 'x' + H + '_' + lang;
      try {
        if (dacBiet === 'tai') { await p.goto(URL + q, { waitUntil: 'commit' }); await p.waitForSelector('#tai:not([hidden])', { timeout: 6000 }).catch(() => { }); await p.waitForTimeout(400); }
        else {
          await p.goto(URL + q, { waitUntil: 'load' }); await p.waitForTimeout(1800);
          if (chuanBi) { if (tenMan !== 'home-moi') await p.evaluate(GIAU).catch(() => { }); await p.evaluate(dongHet).catch(() => { }); await p.waitForTimeout(150); await p.evaluate(chuanBi).catch(e => errs.push(id + ' chuẩn bị: ' + e.message)); }
          await p.waitForTimeout(cho);
          if (/mode=/.test(q)) { await p.evaluate(() => { try { VT.dong(); } catch (e) { } }).catch(() => { }); await p.waitForTimeout(1200); } // đóng màn giới thiệu trùm
        }
        const ds = (await p.evaluate(doTrang, NGUONG)).filter(d => !BO_QUA.some(re => re.test(d.el)));
        await p.screenshot({ path: OUT + id + '.jpg', type: 'jpeg', quality: 80 });
        if (ds.length) { await p.evaluate(khoanh, ds); await p.screenshot({ path: OUT + id + '_d.jpg', type: 'jpeg', quality: 70 }); }
        tong[id] = ds; fs.writeFileSync(OUT + 'ket-qua.json', JSON.stringify(tong, null, 1));
        console.log(id.padEnd(34), ds.length ? ds.length + ' nghi lỗi: ' + [...new Set(ds.map(d => d.loai))].join(',') : 'ok');
      } catch (e) { errs.push(id + ' :: ' + e.message.split('\n')[0]); }
      await p.close();
    }
    await ctx.close();
  }
  fs.writeFileSync(OUT + 'ket-qua.json', JSON.stringify(tong, null, 1));
  if (errs.length) console.log('LỖI TRANG:\n' + [...new Set(errs)].slice(0, 30).join('\n'));
  await b.close();
  const n = Object.values(tong).reduce((s, d) => s + d.length, 0);
  console.log('TỔNG nghi lỗi:', n);
  process.exitCode = n ? 1 : 0;
})();
