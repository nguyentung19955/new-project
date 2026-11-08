// TURRET MERGE — kiểm VFX P0 · SỐ THẬT & ĐỌC ĐƯỢC (docs/demo-hop-tuong/tuvan/vfx/REVIEW-VFX-93.txt + REVIEW-VFX-93-v2-ANIM.txt mục IX/X; thap/js/thatso.js; bảng: docs/demo-hop-tuong/tuvan/muc-ix/KIEM.md)
//  · v2: Radar 7★ một câu · Mirror Gate trần 35% · thanh soi ụ hỗ trợ sau trần · power-up vô tác dụng · huy hiệu tự phát 7 ụ · FX = vùng trúng (đo ảnh) · roster đồng bộ vai
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
  ok(!r.loi.length, 'hỗ trợ: số buff hiển thị = số thật (07/11 bỏ trần hỗ trợ: ' + r.vuot + ' ca còn kẹp — chỉ giới hạn tự nhiên xác suất/chậm)', r.loi.slice(0, 12).join(' ; '));
  r = await p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, 'radar', 7, 7)); B.t[7] = T; return { od: SKILLS.radar.odThat(T), them: SKILLS.radar.them(T), tran: HOTRO.tran(T, 'toc'), mo: SKILLS.radar.mo(T) }; });
  ok(r.od <= 0.25 && Math.abs(r.them + r.od - Math.max(r.them, Math.min(r.tran + 0.15, r.them + 0.25))) < 1e-9 && r.mo.includes('+' + Math.round(r.od * 100) + '% for 2s'), 'Radar 7★ OVERDRIVE: hiện +' + Math.round(r.od * 100) + '% thật (trần tốc ' + Math.round(r.tran * 100) + '% +15% lúc OVERDRIVE)', r.mo);
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
    if (!G.rosterMap.haoquang) delete f.haoquang; // 08/11 người dùng: bỏ Hào Quang Thánh khỏi bộ bài (thebai.js THE_BO)
    for (const id in f) {
      const n = THE.lvMax - THE.lvDau[G.rosterMap[id].bac], v = [];
      for (const k of [0, n]) { B.capThe = Object.assign({}, B.capThe, { [id]: k }); for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, 3, 7)); B.t[7] = T; v.push(f[id](T)); }
      B.capThe[id] = 0; out[id] = v;
    }
    return out;
  });
  ok(r.bomhen[1] > r.bomhen[0] && r.tienhoa[1] < r.tienhoa[0] && (!r.haoquang || r.haoquang[1] > r.haoquang[0]) && r.loren[1] > r.loren[0] && r.khoisinh[1] < r.khoisinh[0] && Math.abs(r.bomhen[0] - 0.11) < 1e-9 /* 10% + 0.5%/★ trên 1★ (3★) — BAO-CAO gioi-han Mức 3 */ && (!r.haoquang || Math.abs(r.haoquang[0] - 3.5) < 1e-9),
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

  // ===================== REVIEW-VFX-93-v2 mục IX / X (docs/demo-hop-tuong/tuvan/muc-ix/KIEM.md) =====================
  // 8. Radar 7★: một câu OVERDRIVE (không chồng 2 câu) · Mirror Gate: số kháng = trần thật 35% của HOTRO.khang
  r = await p.evaluate(() => {
    const B = G.ban[0], S = (id, s) => { for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, s, 7)); B.t[7] = T; return T; };
    const ra = SKILLS.radar.mo(S('radar', 7)), loi = [];
    if ((ra.match(/OVERDRIVE/g) || []).length !== 1 || (ra.match(/for 2s/g) || []).length !== 1) loi.push('Radar 7★: ' + ra);
    if (HOTRO.tran(S('guongcong', 1), 'khang') !== 1) loi.push('HOTRO.tran khang ≠ 100% (07/11: chỉ giới hạn xác suất)');
    for (let s = 1; s <= 7; s++) { const T = S('guongcong', s), that = Math.round(Math.min(HOTRO.tran(T, 'khang'), SKILLS.guongcong.khang(T)) * 100) + '%'; if (!SKILLS.guongcong.mo(T).includes('control ' + that) || !SUP.guongcong.chu(T).startsWith(that)) loi.push('Mirror Gate ' + s + '★ không ghi ' + that); }
    return loi;
  });
  ok(!r.length, 'Radar 7★ một câu OVERDRIVE thật · Mirror Gate kháng = số thật, chỉ kẹp xác suất ≤ 100% (code HOTRO.khang)', r.join(' ; '));

  // 9. thanh soi ụ / bảng thông tin (buff.js hoTroTT): số 'hiện tại' ≤ trần thật, nhãn đúng thứ được buff
  r = await p.evaluate(() => {
    const B = G.ban[0], loi = []; let kep = 0;
    for (const id in SUP_GIA) {
      if (!SKILLS[id] || !G.rosterMap[id]) continue;
      for (let s = 1; s <= 7; s++) {
        for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, s, 7)); B.t[7] = T;
        const h = hoTroTT(T), so = +(/\+([\d.]+)%/.exec(h.dong) || [])[1], tran = id === 'khuech' ? HOTRO.tran(T, 'amp') : (THATSO.TRAN_HT[id] && id !== 'lophanung') ? HOTRO.tran(T, THATSO.TRAN_HT[id][0]) : Infinity;
        if (!(so <= tran * 100 + 0.51)) loi.push(id + ' ' + s + '★ "' + h.dong + '" > trần ' + Math.round(tran * 100) + '%');
        if (SUP_GIA[id](T) > tran + 1e-9) { kep++; if (!/ \(LV raises it\)/.test(h.tach)) loi.push(id + ' ' + s + '★ thiếu "cap X% (LV raises it)"'); }
      }
    }
    for (const [id, ten] of [['thanhdia', 'Damage'], ['guongcong', 'Control resist'], ['lophanung', 'Aura slow']]) { for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, 5, 7)); B.t[7] = T; if (!hoTroTT(T).dong.startsWith(ten + ' +')) loi.push(id + ' nhãn: ' + hoTroTT(T).dong); }
    return { loi, kep };
  });
  ok(!r.loi.length, 'thanh soi ụ hỗ trợ: số hiện tại = số thật (07/11 không trần; ' + r.kep + ' ca kẹp ghi "cap X% (LV raises it)") · nhãn Sanctum/Mirror Gate/Cryo đúng', r.loi.slice(0, 10).join(' ; '));

  // 10. POWER-UP trong trận (KIEM.md 'Đã quyết' #1): KHÔNG còn ụ nào nâng mà không đổi gì (đo thật mọi ụ không sát thương, 4★, LV1 vs MAX);
  //     trang ụ của 10 ụ không sát thương ghi đúng bước power-up (không '+25% base damage')
  r = await p.evaluate(() => {
    const B = G.ban[0], khong = [];
    for (const id of Object.keys(SKILLS)) {
      const sk = SKILLS[id]; if (!G.rosterMap[id] || sk.dmg) continue;
      const anh = [];
      for (const lv of [1, 5]) {
        B.lv[id] = lv; for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, 4, 7)); B.t[7] = T; try { mocBuf(B); } catch (e) { }
        let s = ''; try { s = (sk.mo ? sk.mo(T) : '') + '|' + (typeof SUP !== 'undefined' && SUP[id] ? SUP[id].chu(T) : '') + '|' + (SUP_GIA[id] ? SUP_GIA[id](T) : ''); } catch (e) { }
        for (const k of Object.keys(sk)) if (typeof sk[k] === 'function' && sk[k].length === 1 && !/^(mo|sinh|ve|veThem|sangDau)$/.test(k)) { try { const v = sk[k](T); if (typeof v === 'number') s += '|' + k + Math.round(v * 1e5); } catch (e) { } }
        anh.push(s);
      }
      B.lv[id] = 1;
      if (anh[0] === anh[1]) khong.push(id);
    }
    const chu = THATSO.PU_KN.filter(id => { const c = THATSO.chuPU(id); return !c || /\+25%/.test(c) || !c.includes(THATSO.puBuoc(id, 1)); });
    return { ok: !khong.length && !chu.length && THATSO.PU_KN.length === 10 && !/\+25%/.test(THATSO.chuPU('radar') || ''), khong, chu };
  });
  ok(r.ok, 'POWER-UP: mọi ụ không sát thương đổi số thật khi nâng (còn vô tác dụng: ' + ((r.khong || []).join(',') || 'không') + ') · trang ụ ghi bước power-up', JSON.stringify(r));

  // 10b. bước POWER-UP từng ụ = đúng số đã chốt (đổi số → sửa bảng này + KIEM.md) · hàm chơi đọc đúng (LV1 → MAX = 4 bước)
  r = await p.evaluate(() => {
    const B = G.ban[0], loi = [], S = (id, s) => { for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, s, 7)); B.t[7] = T; return T; };
    const CHOT = { bang: 0.15, doc: 0.75, bomhen: 0.75, khien: -0.5, hopbi: -2, tienhoa: -3, haoquang: 0.15, loren: 0.3, khoisinh: -3 };
    for (const id in CHOT) if (KY_NANG_CAP[id].pu !== CHOT[id]) loi.push(id + ' pu ' + KY_NANG_CAP[id].pu + ' ≠ ' + CHOT[id]);
    const capC = B.capThe; B.capThe = {};
    const ham = { // hàm số kỹ năng THẬT (đơn vị như KY_NANG_CAP)
      bang: (T) => SKILLS.bang.dai(T), doc: (T) => { const E = { yeu: 0 }; return knThe(B, 'doc'); }, bomhen: (T) => SKILLS.bomhen.yw(T) * 100, khien: (T) => SKILLS.khien.ky(T),
      hopbi: (T) => SKILLS.hopbi.can(T), tienhoa: (T) => SKILLS.tienhoa.can(T) / SKILLS.tienhoa.goc(T.sao) * 100, // 08/11 Trứng: (10 + 2×★) s haoquang: (T) => SKILLS.haoquang.tg(T),
      loren: (T) => SKILLS.loren.moi(T) * 100, khoisinh: (T) => SKILLS.khoisinh.g(T) / (12 / (1 + 0.03 * capThe9(B, 'khoisinh'))) * 100, // 08/11: chu kỳ 12 s ÷ cấp thẻ, power-up −3%/bước
    };
    if (!G.rosterMap.haoquang) delete ham.haoquang; // 08/11: Hào Quang Thánh đã bỏ
    for (const id in ham) {
      B.lv[id] = 1; const a = ham[id](S(id, 2)); B.lv[id] = 5; const c = ham[id](S(id, 2)); B.lv[id] = 1;
      if (Math.abs((c - a) - 4 * CHOT[id]) > 0.11) loi.push(id + ' LV1→MAX đổi ' + (c - a).toFixed(3) + ' ≠ ' + 4 * CHOT[id]);
    }
    // Reaper Pillar 6★: 07/11 không trần nhóm — power-up MAX: +6% độ mạnh + cộng thẳng +2% (điểm) vào tỉ lệ giết ngay, vẫn ≤ 100%
    { B.lv.tuthan = 1; const T1 = S('tuthan', 6), a = SKILLS.tuthan.tile(T1); B.lv.tuthan = 5; const T5 = S('tuthan', 6), c = SKILLS.tuthan.tile(T5); B.lv.tuthan = 1;
      if (!(c >= a + 0.02 - 1e-9) || c > 1) loi.push('Reaper: tỉ lệ ' + a + ' → ' + c); }
    // chữ trong trận: 'power-up +2: Freeze +0.3s'
    B.lv.bang = 3; if (THATSO.puDong(B, 'bang') !== 'power-up +2: Freeze +0.3s') loi.push('puDong: ' + THATSO.puDong(B, 'bang')); B.lv.bang = 1;
    if (THATSO.puDong(B, 'bang') !== '') loi.push('puDong LV1 phải rỗng');
    B.capThe = capC;
    return loi;
  });
  ok(!r.length, 'POWER-UP từng ụ đúng số chốt (Frost +0.15s, Venom +0.75%, Time Bomb +0.75%, Shield −0.5s, Box −2s, Evolver −3%, Halo +0.15s, Forge +0.3%, Genesis −3%, Reaper +0.5% giết ngay)', r.join(' ; '));

  // 10c. CẤP THẺ NÂNG TRẦN (KIEM.md 'Đã quyết' #2): trần nới đều tới +18% ở LV15, không vượt; số buff thật (apDung) theo trần mới; chữ ghi 'LV raises it'
  r = await p.evaluate(() => {
    const B = G.ban[0], loi = [], S = (id, s, o) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };
    const capC = B.capThe;
    for (const [id, nh] of [['phagiap', 'lo'], ['chimang', 'crit'], ['thaukinh', 'cdmg'], ['guongcong', 'khang'], ['cauvong', 'vet'], ['lanhgia', 'cham'], ['tuthan', 'chet']]) {
      const n = THE.lvMax - THE.lvDau[G.rosterMap[id].bac], tr = [];
      for (const k of [0, 1, n, n + 5]) { B.capThe = { [id]: k }; for (let i = 0; i < 15; i++) B.t[i] = null; tr.push(HOTRO.tran(S(id, 7, 7), nh)); }
      // 07/11 bỏ trần hỗ trợ: nhóm thường = không trần; chậm 90%, giết ngay / kháng ≤ 100% — cố định, không đổi theo cấp thẻ
      const mong = nh === 'cham' ? 0.9 : (nh === 'chet' || nh === 'khang') ? 1 : Infinity;
      if (tr.some(x => x !== mong)) loi.push(id + ': trần ' + tr.join('/') + ' ≠ ' + mong);
    }
    // số thật: Crit Antenna 7★ (đã chạm trần) cạnh Cannon — crit nhận được tăng theo cấp thẻ
    const crit = (k) => { B.capThe = { chimang: k }; for (let i = 0; i < 15; i++) B.t[i] = null; S('chimang', 7, 7); const C = S('canon', 1, 8); C.nguon = []; C.buf.crit = 0; HOTRO.apDung(B); return C.buf.crit; };
    const c0 = crit(0), c6 = crit(6);
    if (!(c6 > c0 + 0.01)) loi.push('Crit Antenna 7★: crit thật ' + c0 + ' → ' + c6 + ' (LV không nới)');
    // Mirror Gate 7★ (vượt trần): mô tả ghi 'cap · LV raises it', nhãn SUP trên bàn giữ gọn
    B.capThe = { guongcong: 6 }; for (let i = 0; i < 15; i++) B.t[i] = null; const M = S('guongcong', 7, 7);
    if (/cap · LV raises it/.test(SKILLS.guongcong.mo(M))) loi.push('Mirror Gate mô tả còn chữ trần: ' + SKILLS.guongcong.mo(M));
    if (/LV raises it/.test(SUP.guongcong.chu(M))) loi.push('nhãn SUP trên bàn không được thêm chữ trần');
    B.capThe = capC; for (let i = 0; i < 15; i++) B.t[i] = null;
    return loi;
  });
  ok(!r.length, '07/11 bỏ trần hỗ trợ: chỉ còn chậm 90% / xác suất 100% (không theo cấp thẻ), crit thật vẫn tăng theo cấp thẻ, không còn chữ trần', r.join(' ; '));

  // 11. skill TỰ PHÁT bật huy hiệu cho cả Holy Halo, Chrono Throne và 4 ụ đỏ nạp chung (Hive Queen, Leviathan, Genesis, Wyrm)
  r = await p.evaluate(() => {
    const B = G.ban[0], loi = [];
    for (const id of ['haoquang', 'ngaithoigian', 'chuato', 'leviathan', 'ronglua']) { // Lõi Khởi Sinh bỏ khỏi danh sách tự phát 08/11 (GENESIS tốn mana)
      if (!G.rosterMap[id]) continue; // Hào Quang Thánh đã bỏ (08/11)
      if (!THATSO.TU.includes(id) || !/_tuPhat/.test(SKILLS[id].capNhat.toString())) { loi.push(id + ' không trong THATSO.TU'); continue; }
      if (id === 'chuato') continue; // cần quái thật trên đường (bầy lao vào chỗ đông) — đã kiểm móc ở trên
      for (let i = 0; i < 15; i++) B.t[i] = null; const T = sinhU(taoU(B, id, 5, 7)); B.t[7] = T;
      const sk = SKILLS[id], ai = sk.aiNen; sk.aiNen = () => true;
      T.nap = 1; T.napDay = 9; if (id === 'chuato') T.bay = [1, 2, 3, 4, 5];
      try { sk.capNhat(G, B, T, 0.05); } catch (e) { loi.push(id + ' lỗi ' + e.message); }
      sk.aiNen = ai;
      if (!(T.tuPhatN >= 1)) loi.push(id + ' tự phát không bật huy hiệu');
      const n0 = T.tuPhatN || 0; T.nap = 1; try { sk.chuDong(G, B, T); } catch (e) { } if ((T.tuPhatN || 0) !== n0) loi.push(id + ' chạm tay bật huy hiệu');
    }
    return loi;
  });
  ok(!r.length, 'skill TỰ PHÁT → huy hiệu: Holy Halo, Chrono Throne, Hive Queen, Leviathan, Wyrm (chạm tay thì không; Genesis tốn mana nên không tự phát)', r.join(' ; '));

  // 12. FX = VÙNG TRÚNG: đo ảnh THẬT (điểm sáng ≥ 60, phân vị 97 từ tâm khung) × cỡ code vẽ ↔ bán kính/nón trúng
  r = await p.evaluate(async () => {
    const loi = [], ghi = [];
    const nap = (ten) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = (typeof anhUrl === 'function' ? anhUrl(ten) : 'assets/' + ten + '.png'); });
    const doc = async (ten, f0, f1, nk) => { // trả về [bán kính 97% / nửa khung, x99 / rộng khung, bề ngang ở 70% / cao khung, nửa bề ngang theo CỘT (≥ 3 điểm sáng) / nửa khung] trung bình các khung f0..f1
      const im = await nap(ten); if (!im) return null; const n = nk || Math.max(1, Math.round(im.width / im.height)), fw = im.width / n, H = im.height;
      const c = document.createElement('canvas'); c.width = Math.ceil(fw); c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); const kq = [];
      for (let f = f0; f <= Math.min(f1, n - 1); f++) {
        x.clearRect(0, 0, c.width, H); x.drawImage(im, f * fw, 0, fw, H, 0, 0, fw, H); const d = x.getImageData(0, 0, c.width, H).data, R = [], X = [], P = [];
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < c.width; xx++) { const i = (yy * c.width + xx) * 4; if (Math.max(d[i], d[i + 1], d[i + 2]) * d[i + 3] / 255 > 60) { R.push(Math.hypot(xx - fw / 2, yy - H / 2) / (fw / 2)); X.push(xx / fw); P.push([xx / fw, yy / H]); } }
        if (!R.length) continue; const cot = new Map(); for (const v of X) { const k = Math.floor(v * fw); cot.set(k, (cot.get(k) || 0) + 1); } const ck = [...cot].filter(e => e[1] >= 3).map(e => e[0]);
        const nua = ((fw / 2 - Math.min(...ck)) + (Math.max(...ck) + 1 - fw / 2)) / fw; R.sort((a, b) => a - b); X.sort((a, b) => a - b);
        const xm = X[Math.floor(X.length * 0.99)], ys = P.filter(q => Math.abs(q[0] - 0.7 * xm) < 0.04).map(q => q[1]).sort((a, b) => a - b);
        kq.push([R[Math.floor(R.length * 0.97)], xm, ys.length > 5 ? ys[Math.floor(ys.length * 0.98)] - ys[Math.floor(ys.length * 0.02)] : 0, nua]);
      }
      return [0, 1, 2, 3].map(j => kq.reduce((s, q) => s + q[j], 0) / kq.length);
    };
    const gan = (a, b, tol, ten) => { ghi.push(ten + ' ' + a.toFixed(1) + '/' + b.toFixed(1)); if (!(Math.abs(a - b) <= tol * b)) loi.push(ten + ': thấy ' + a.toFixed(1) + ' px ↔ trúng ' + b.toFixed(1) + ' px'); };
    const B = G.ban[0], ctx = document.createElement('canvas').getContext('2d');
    // Black Hole (tờ P2 16 khung) — bắt cỡ vẽ của REN.khungMuot
    const km = REN.khungMuot; let co = 0; REN.khungMuot = function (c, ten, f, x, y, w) { co = w * (c && c.getTransform ? Math.hypot(c.getTransform().a, c.getTransform().b) : 1); return true; }; // tính cả hệ thu nhỏ của VXD.dat (vfxmoi.js) → đo cỡ THẤY trên màn, không phải cỡ trước khi thu
    const bh = await doc('p2_blackhole', 0, 15), cr = await doc('p2_cryo', 8, 11);
    await new Promise(ok => { REN.img('p2_blackhole'); REN.img('p2_cryo'); setTimeout(ok, 300); });
    for (let i = 0; i < 40 && !(REN.img('p2_blackhole') && REN.img('p2_cryo')); i++) await new Promise(ok => setTimeout(ok, 100));
    if (bh && P2.co('p2_blackhole')) { co = 0; HU.hoden.ve(ctx, { t: 1.5, song: 3, x: 100, y: 100, r: 80 }, REN); gan(co / 2 * bh[0], 80, 0.06, 'Black Hole mép xoáy'); } else loi.push('chưa nạp p2_blackhole');
    if (cr && P2.co('p2_cryo')) { co = 0; const was = GFX.coDOM; GFX.coDOM = true; HU.gBaoLuoi.ve(ctx, { t: 0.5, song: 1.1, x: 100, y: 100, r: 200 }, REN); GFX.coDOM = was; gan(co / 2 * cr[0], 200, 0.06, 'Cryo FREEZE băng lan'); } else loi.push('chưa nạp p2_cryo');
    REN.khungMuot = km;
    // Toxic Pool: ảnh vũng (bầu dục) — trục dài DỌC đường, mép = r + 8
    const vd = await doc('fx_vungdoc_hieu', 0, 0), ag = REN.anhGiua; let g = null;
    REN.anhGiua = function (c, im, x, y, w, goc) { g = { w, goc }; return true; };
    const p0 = G.duong[0], [px, py, pg] = viTri(p0, p0.len * 0.3);
    HU.may.ve(ctx, { t: 1, song: 5, x: px, y: py, r: 44, goc: pg, _T: { id: 'vungdoc' }, T: undefined }, REN);
    REN.anhGiua = ag;
    if (vd && g) { gan(g.w / 2 * vd[3], 52, 0.06, 'Toxic Pool mép dọc đường'); if (Math.abs((g.goc || 0) - pg) > 1e-6) loi.push('Toxic Pool không xoay theo đường'); } else loi.push('Toxic Pool: không bắt được ảnh vũng (đã gắn tờ P3 vungdoc? → vfxp3.js: cỡ vẽ = (r + 8) × 2 / tỉ lệ ảnh đo, rồi sửa bước kiểm này)');
    // Wyrm Engine 1★ TIA LỬA (08/11 thay nón): mép lửa = dải fx_wyrm_lua2 kéo mảnh — mũi lửa = đầu tia (≤ tầm tia), bề ngang lửa ở 70% = bề ngang trúng 2 × rong
    const wy = await doc('fx_wyrm_lua2', 3, 5, 8); // khung lặp lúc phun đều (veTia: 3 + …% 3)
    for (let i = 0; i < 15; i++) B.t[i] = null; const W = sinhU(taoU(B, 'ronglua', 1, 7)); B.t[7] = W; W.phun = 0.3; W.goc = 0;
    const Lt = SKILLS.ronglua.tamTia(W); RONG_TIA.set(W, { ds: [{ g: 0, L: Lt, ex: tamU(W).x + Lt * 0.8, ey: tamU(W).y }], t: G.t });
    const sk = SIG.k; let sw = null; SIG.k = function (c, ten, f, x, y, w, o) { sw = { x, y, w, h: o.h, ax: o.ax, g: o.g }; return true; };
    for (let i = 0; i < 40 && !REN.img('fx_wyrm_lua2'); i++) await new Promise(ok => setTimeout(ok, 100));
    HU.nonLua.ve(ctx, { T: W }, REN); SIG.k = sk;
    if (wy && sw) {
      const c0 = tamU(W), lech = Math.hypot(sw.x - c0.x, sw.y - c0.y), mui = lech + sw.w * (wy[1] - sw.ax);
      gan(mui, Lt, 0.06, 'Wyrm mũi tia');
      gan(sw.h * wy[2], 2 * SKILLS.ronglua.rong(W), 0.15, 'Wyrm bề ngang tia'); // ±12% lập loè
      if (Math.abs(sw.g) > 1e-6) loi.push('Wyrm tia lệch hướng ' + sw.g);
    } else loi.push('Wyrm: không bắt được dải lửa tia');
    // số đo ↔ hằng VUNG_ANH (đổi ảnh thì báo)
    const ss = [['p2_blackhole', bh && bh[0]], ['p2_cryo', cr && cr[0]], ['vungdoc', vd && vd[3]], ['wyrm2X', wy && wy[1]], ['wyrm2Y', wy && wy[2]]];
    for (const [k, v] of ss) if (v && Math.abs(VUNG_ANH[k] - v) > 0.04) loi.push('VUNG_ANH.' + k + ' = ' + VUNG_ANH[k] + ' nhưng ảnh đo ' + v.toFixed(3));
    return { loi, ghi };
  });
  ok(!r.loi.length, 'FX = vùng trúng: Black Hole, Cryo FREEZE, Toxic Pool, Wyrm Engine (đo ảnh thật) · ' + r.ghi.join(' · '), r.loi.join(' ; '));

  // 13. roster.json (nguồn dữ liệu chính) đồng bộ vai trò code; tên Jammer
  r = await p.evaluate(() => { const loi = []; for (const id in G.rosterMap) { const v = G.rosterMap[id].vai, sk = SKILLS[id]; if (sk && v && v !== sk.vai) loi.push(id + ' roster ' + v + ' ≠ code ' + sk.vai); } if (G.rosterMap.kepha && G.rosterMap.kepha.ten !== 'Jammer') loi.push('kepha tên ' + G.rosterMap.kepha.ten); return loi; });
  const rj = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../thap/assets/roster.json'), 'utf8'));
  for (const x of rj) { if (x.id === 'kepha' && x.ten !== 'Jammer') r.push('roster.json kepha ' + x.ten); if (x.id === 'loren' && !/Twin Anvil/.test(x.ten)) r.push('roster.json loren chưa đổi tên Twin Anvil'); /* 08/11: buff Twin Anvil vĩnh viễn là luật mới */ }
  ok(!r.length, 'roster: vai trò = code (Mirror Gate Hỗ trợ, Scrap Forge Đặc biệt), tên Jammer, Scrap Forge không "vĩnh viễn"', r.join(' ; '));

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
