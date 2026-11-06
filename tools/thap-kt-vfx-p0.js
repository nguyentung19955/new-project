// TURRET MERGE — kiểm VFX P0 · SỐ THẬT & ĐỌC ĐƯỢC (docs/demo-hop-tuong/tuvan/vfx/REVIEW-VFX-93.txt mục IX/X; thap/js/thatso.js)
//  · mọi ụ, 1–7★, cấp thẻ đầu / cấp 15: chữ kỹ năng không lỗi, không NaN/undefined
//  · ụ hỗ trợ: số trong SUP.chu + mô tả = số THẬT sau trần (HOTRO.hd), không còn số thô vượt trần
//  · hàng CARD LV: ụ không gây sát thương KHÔNG có dòng '+damage' — có dòng kỹ năng chính (KY_NANG_CAP); 5 ụ mới đổi số thật theo cấp thẻ
//  · 7★ ụ chỉ tác dụng khi ghép: không hứa số bất khả thi · Pandora/Radar/Laser/Holy Halo mốc sao khớp code
//  · Sanctum 5★: 8 ô buff (trang ụ + trận) · trạng thái quái ≤ 2 dấu · skill tự phát (Cryo) bật huy hiệu
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-vfx-p0.js   (SHOTS=thư mục: chụp ảnh)
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS && process.env.SHOTS !== '0' ? process.env.SHOTS : '';
const LOI = [];
const ok = (dk, ten, chi) => { if (dk) console.log('  ✓ ' + ten); else { console.log('  ✗ ' + ten + (chi ? ' — ' + String(chi).slice(0, 600) : '')); LOI.push(ten); } };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: SHOTS ? 3 : 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  await p.goto(BASE + '?mode=solo&deck=canon,lien,tia,set,radar&wave=1&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 60000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await p.waitForTimeout(600);
  await p.evaluate(() => { G.tocDo = 0; });
  ok(await p.evaluate(() => typeof THATSO !== 'undefined' && typeof HOTRO.hd === 'function'), 'thatso.js nạp (THATSO, HOTRO.hd)');

  // 1. mọi ụ × sao × cấp thẻ: chữ hợp lệ
  let r = await p.evaluate(() => {
    const B = G.ban[0], loi = [];
    for (const id of Object.keys(SKILLS)) {
      if (!G.rosterMap[id]) continue;
      const n = THE.lvMax - THE.lvDau[G.rosterMap[id].bac];
      for (const k of [0, n]) {
        B.capThe = Object.assign({}, B.capThe, { [id]: k });
        for (let s = 1; s <= 7; s++) {
          for (let i = 0; i < 15; i++) B.t[i] = null;
          const T = sinhU(taoU(B, id, s, 7)); B.t[7] = T; T.nguon = []; try { mocBuf(B); } catch (e) { }
          let m = ''; try { m = SKILLS[id].mo ? SKILLS[id].mo(T) : ''; if (typeof SUP !== 'undefined' && SUP[id]) m += ' | ' + SUP[id].chu(T); } catch (e) { loi.push(id + s + '★ ' + e.message); continue; }
          if (/NaN|undefined|Infinity/.test(m)) loi.push(id + ' ' + s + '★ k' + k + ': ' + m.slice(0, 120));
        }
      }
      B.capThe[id] = 0;
    }
    return loi;
  });
  ok(!r.length, 'mọi ụ 1–7★, cấp đầu/cấp 15: chữ kỹ năng không lỗi / NaN', r.join(' ; '));

  // 2. ụ hỗ trợ: số hiển thị = số thật sau trần
  r = await p.evaluate(() => {
    const B = G.ban[0], loi = [], pc = (v) => Math.round(v * 100), co = (s, v) => s.includes(pc(v) + '%') || s.includes((v * 100).toFixed(1) + '%');
    let vuot = 0;
    for (const id in THATSO.TRAN_HT) {
      if (!SKILLS[id] || !G.rosterMap[id]) continue;
      const n = THE.lvMax - THE.lvDau[G.rosterMap[id].bac];
      for (const k of [0, n]) {
        B.capThe = Object.assign({}, B.capThe, { [id]: k });
        for (let s = 1; s <= 7; s++) {
          for (let i = 0; i < 15; i++) B.t[i] = null;
          const T = sinhU(taoU(B, id, s, 7)); B.t[7] = T;
          const h = THATSO.hieu(T, id), mo = SKILLS[id].mo(T), chu = SUP[id] ? SUP[id].chu(T) : null;
          if (h.v > h.h + 1e-9) vuot++;
          // nangsao/tron/dongbo: số có điều kiện (không có ô kề đúng loại vẫn hiện số tiềm năng) — vẫn phải ≤ trần
          if (!co(mo, h.h)) loi.push(id + ' ' + s + '★ k' + k + ' mô tả thiếu ' + pc(h.h) + '%: ' + mo.slice(0, 90));
          if (chu != null && id !== 'taylo' && !co(chu, h.h)) loi.push(id + ' ' + s + '★ k' + k + ' SUP thiếu ' + pc(h.h) + '%: ' + chu);
          if (h.v > h.h + 0.005 && (co(mo, h.v) && pc(h.v) !== pc(h.h))) loi.push(id + ' ' + s + '★ k' + k + ' còn số thô vượt trần ' + pc(h.v) + '%');
          // trần thật: buff áp lên ụ kề không vượt số hiển thị
        }
      }
      B.capThe[id] = 0;
    }
    return { loi, vuot };
  });
  ok(!r.loi.length && r.vuot > 0, 'hỗ trợ: số buff hiển thị = số thật sau trần (' + r.vuot + ' ca đã kẹp: Armor Breaker, Crit Antenna, Reaper, Cryo…)', r.loi.slice(0, 12).join(' ; '));
  r = await p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, 'radar', 7, 7)); B.t[7] = T; return { od: SKILLS.radar.odThat(T), them: SKILLS.radar.them(T), tran: HOTRO.tran(T, 'toc'), mo: SKILLS.radar.mo(T) }; });
  ok(r.od <= 0.25 && Math.abs(r.them + r.od - Math.min(r.tran, r.them + 0.25)) < 1e-9 && r.mo.includes('+' + Math.round(r.od * 100) + '% for 2s'), 'Radar 7★ OVERDRIVE: hiện +' + Math.round(r.od * 100) + '% thật (trần tốc ' + Math.round(r.tran * 100) + '%)', r.mo);
  r = await p.evaluate(() => { // phép thật: Armor Breaker 7★ + ụ kề → N.ht.lo = số hiển thị
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    const T = sinhU(taoU(B, 'phagiap', 7, 7)), N = sinhU(taoU(B, 'canon', 1, 6)); B.t[7] = T; B.t[6] = N;
    for (const X of B.t) if (X) { X.buf = { toc: 0, dmg: 0, crit: 0, cdmg: 0, cham: 0, chet: 0 }; X.nguon = []; }
    HOTRO.apDung(B, 0); const lo = Math.min(N.ht.lo || 0, N.ht.capDmg), mo = SKILLS.phagiap.mo(T);
    return { lo, mo, ok: mo.includes(Math.round(lo * 100) + '%') };
  });
  ok(r.ok, 'Armor Breaker 7★: số hiển thị = buff thật ụ kề nhận (' + Math.round(r.lo * 100) + '%)', r.mo);

  // 3. hàng CARD LV
  r = await p.evaluate(() => {
    const loi = [];
    for (const id of Object.keys(SKILLS)) {
      if (!G.rosterMap[id]) continue;
      const h = TBUI.hang(id).replace(/<[^>]+>/g, ' ');
      if (!SKILLS[id].dmg) {
        if (/damage|dmg/i.test(h.replace(/Dmg buff|Slowed dmg|Trail dmg|Crit dmg/g, ''))) loi.push(id + ' có dòng +damage: ' + h.trim().slice(0, 80));
        if (!KY_NANG_CAP[id]) loi.push(id + ' không có mục kỹ năng theo cấp');
        else if (!h.includes(KY_NANG_CAP[id].ten)) loi.push(id + ' thiếu dòng "' + KY_NANG_CAP[id].ten + '"');
      }
    }
    return loi;
  });
  ok(!r.length, 'CARD LV: ụ không gây sát thương không có dòng "+damage" — có dòng kỹ năng chính', r.join(' ; '));
  r = await p.evaluate(() => {
    const B = G.ban[0], out = {};
    const f = { bomhen: (T) => SKILLS.bomhen.yw(T), tienhoa: (T) => SKILLS.tienhoa.can(T), haoquang: (T) => SKILLS.haoquang.tg(T), loren: (T) => SKILLS.loren.moi(T), khoisinh: (T) => SKILLS.khoisinh.g(T) };
    for (const id in f) {
      const n = THE.lvMax - THE.lvDau[G.rosterMap[id].bac], v = [];
      for (const k of [0, n]) { B.capThe = Object.assign({}, B.capThe, { [id]: k }); for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, 3, 7)); B.t[7] = T; v.push(f[id](T)); }
      B.capThe[id] = 0; out[id] = v;
    }
    return out;
  });
  ok(r.bomhen[1] > r.bomhen[0] && r.tienhoa[1] < r.tienhoa[0] && r.haoquang[1] > r.haoquang[0] && r.loren[1] > r.loren[0] && r.khoisinh[1] < r.khoisinh[0] && Math.abs(r.bomhen[0] - 0.10) < 1e-9 && Math.abs(r.haoquang[0] - 3.5) < 1e-9,
    'cấp thẻ nâng SỐ KỸ NĂNG THẬT: Time Bomb suy yếu, Evolver đếm, Holy Halo rào, Scrap Forge %/lò, Genesis chu kỳ (cấp đầu = như cũ)', JSON.stringify(r));

  // 4. 7★ ghép / mốc sao
  r = await p.evaluate(() => {
    const B = G.ban[0], loi = [];
    for (const id of THATSO.GHEP7) { if (!SKILLS[id]) continue; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, 7, 7)); B.t[7] = T; const m = SKILLS[id].mo(T); if (!/cannot merge/.test(m)) loi.push(id + ': ' + m.slice(0, 80)); }
    const pd = mocCua('pandora').find(m => m.n === 7).mo, la = mocCua('laser').find(m => m.n === 7).mo, hq = mocCua('haoquang');
    if (/Every opening/.test(pd)) loi.push('Pandora 7★: ' + pd);
    if (/crit/.test(la) && !/never crits/.test(la)) loi.push('Laser 7★: ' + la);
    if (/2\.5s|3\.5s/.test(hq.map(m => m.mo).join())) loi.push('Holy Halo mốc: ' + hq.map(m => m.mo).join(' / '));
    if (!/MAX 7★|cannot merge|fizzle/i.test(mocCua('kepha').find(m => m.n === 7).mo)) loi.push('Jammer 7★ mốc: ' + mocCua('kepha').find(m => m.n === 7).mo);
    // mốc chung vẫn áp (đổi chữ không tắt +30% APEX)
    for (let i = 0; i < 15; i++) B.t[i] = null; const L = sinhU(taoU(B, 'laser', 7, 7)); B.t[7] = L; if (!(heSoMocDmg(L) > 1.29)) loi.push('Laser 7★ mất APEX ×1.3 sát thương');
    for (const id of THATSO.GHEP7) { if (!SKILLS[id]) continue; for (let i = 0; i < 15; i++) B.t[i] = null; const X = sinhU(taoU(B, id, 7, 7)); B.t[7] = X; if (SKILLS[id].dmg && (THATSO.DOI[id] || {})[7] && !(heSoMocDmg(X) > 1.29)) loi.push(id + ' 7★ mất APEX'); }
    return loi;
  });
  ok(!r.length, '7★ ghép: không hứa số bất khả thi (Jammer, Hero Foundry, Pandora…) · mốc sao Laser/Pandora/Holy Halo khớp code (APEX chung vẫn áp)', r.join(' ; '));

  // 5. Sanctum 5★: 8 ô
  r = await p.evaluate(() => {
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, 'thanhdia', 5, 7)); B.t[7] = T; const T3 = sinhU(taoU(B, 'thanhdia', 3, 2)); B.t[2] = T3;
    const dc = upDauChan('thanhdia');
    return { tran5: HOTRO.oDich(T).length, tran3: HOTRO.oDich(T3).length, a: dc && dc.a.length, b: dc && dc.b && dc.b.length, cheo: upCheo('thanhdia'), cheoLuoi: upCheo('luoicheo') };
  });
  ok(r.tran5 === 8 && r.a === 4 && r.b === 8 && !r.cheo && r.cheoLuoi, 'Sanctum: 1–4★ 4 ô thẳng, 5★+ 8 ô (trận + trang ụ) · Resonance Grid = 4 ô chéo', JSON.stringify(r));

  // 6. trạng thái quái ≤ 2 dấu
  r = await p.evaluate(() => { const E = { chan: 1, docT: 2, chayT: 2, yeu: 3, cvT: 0, giapT: 0, uid: 1 }; const s = REN.stV2 ? REN.stV2(E, true) : (typeof QA !== 'undefined' && QA.stV2 ? QA.stV2(E, true) : null); return s ? s.n : -1; });
  ok(r >= 0 && r <= 2, 'quái dính 5 trạng thái: chỉ vẽ ≤ 2 dấu (' + r + ')');

  // 7. skill tự phát: Cryo Reactor đầy + trùm/5 quái → tự phát → huy hiệu
  r = await p.evaluate(() => {
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, 'lophanung', 5, 7)); B.t[7] = T;
    T.nap = 1; T.napDay = 7; SKILLS.lophanung.aiNen = () => true;
    SKILLS.lophanung.capNhat(G, B, T, 0.05);
    return { g: T.tuPhatG, n: T.tuPhatN || 0, nap: T.nap };
  });
  ok(r.n === 1 && r.g != null && r.nap === 0, 'Cryo Reactor tự phát → đánh dấu tự phát (huy hiệu PNG góc trên-trái)', JSON.stringify(r));
  r = await p.evaluate(() => { const B = G.ban[0], T = B.t[7]; T.nap = 1; const n0 = T.tuPhatN; SKILLS.lophanung.chuDong(G, B, T); return T.tuPhatN === n0; });
  ok(r, 'chạm tay (chuDong ngoài capNhat) KHÔNG bật huy hiệu tự phát');

  if (SHOTS) {
    const fs = require('fs'); fs.mkdirSync(SHOTS, { recursive: true });
    await p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, 'lophanung', 5, 7)); B.t[7] = T; T.tuPhatG = G.t - 0.25; G.tocDo = 0; });
    await p.waitForTimeout(300);
    await p.screenshot({ path: SHOTS + '/p0-tuphat-cryo.png' });
  }
  ok(!errs.length, 'không lỗi trang', errs.join(' ; '));
  await b.close();
  console.log(LOI.length ? '✗ VFX P0: ' + LOI.length + ' lỗi' : '✓ VFX P0 xanh');
  process.exit(LOI.length ? 1 : 0);
})();
