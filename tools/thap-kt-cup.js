// ASTRAL ARSENAL — KIỂM CÚP PVP · MỐC CÚP · ĐỐI THỦ THEO CÚP · TÚI THẮNG · BẢO HIỂM RƯƠNG VÀNG · ĐỒNG ĐỘI CHO NGƯỜI MỚI (11/11, thap/js/chedo-dd.js, kinhte.js)
//  ✓ thắng +30 / thua −20, không âm · mốc cúp cao nhất đạt lần đầu phát 1 lần (tụt cúp rồi lên lại không phát lại) · lưu turret_kt.cd.cup
//  ✓ đối thủ máy: 0 cúp = bộ chỉ Trắng / Xanh, cấp thẻ 0, mana mỗi mạng ×0,6 · 600 cúp = không Đỏ · bộ luôn 5 ụ, ≥ 3 ụ gây sát thương
//  ✓ túi thắng TẤT ĐỊNH: cùng hạt trận → cùng kết quả rơi; tần suất ≈ 60% · thua PVP / không trúng: Rương Trận không có thẻ (chỉ vàng) · CO-OP không đổi
//  ✓ bảo hiểm: Rương Vàng pityV = 7 — không bao giờ quá 6 rương liên tiếp không ra Huyền thoại
//  ✓ CO-OP cấp phi công ≤ 5: đồng đội máy dùng bộ cố định 5 ụ gây sát thương Trắng / Xanh; CO-OP không giới hạn lượt (không có khoá cd.luot)
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-cup.js [BASE]
'use strict';
const { chromium } = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof CUP !== 'undefined' && typeof HM !== 'undefined', null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const o = {}; HD.moKhoa = () => true; UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc'];
    // cúp
    const s = CUP.st(); o.c0 = s.c; o.thua0 = CUP.ket(false).c;
    const v0 = KT.vang; let x; for (let i = 0; i < 4; i++) x = CUP.ket(true); o.c4 = x.c; o.moc4 = x.moc.join(); o.vang4 = KT.vang - v0;
    CUP.ket(false); CUP.ket(false); const v1 = KT.vang; x = CUP.ket(true); x = CUP.ket(true); o.lai = x.moc.length; o.vangLai = KT.vang - v1; o.c = x.c; o.max = CUP.st().max;
    o.luu = JSON.stringify(JSON.parse(localStorage.getItem('turret_kt')).cd.cup); o.ke = CUP.ke(); o.luot = 'luot' in CD.st();
    // đối thủ theo cúp
    const bac = (d) => [...new Set(d.map(id => G.rosterMap[id].bac))].sort().join(), dmg = (d) => d.filter(id => SKILLS[id].dmg && SKILLS[id].vai !== 'ht').length;
    const a = CUP.doiThu(0), c = CUP.doiThu(600);
    o.d0 = { n: a.deck.length, bac: bac(a.deck), dmg: dmg(a.deck), cap: Object.values(a.cap).join(''), mana: a.mana };
    o.d600 = { n: c.deck.length, bac: bac(c.deck), mana: c.mana };
    // túi thắng
    let n = 0; for (let h = 1; h <= 2000; h++) if (CUP.roi(h)) n++; o.tanSuat = n / 2000; o.cung = [11, 12, 13, 14].every(h => CUP.roi(h) === CUP.roi(h));
    let hT = 1, hK = 1; while (!CUP.roi(hT)) hT++; while (CUP.roi(hK)) hK++;
    const thu = (che, thang, hat, wave) => { G.hat = hat; G.wave = wave; G.dd = null; const m = { che, deck: UI.chon.slice(), mv: 'hero', trum: 0 }; const t = THEBAI.thuong({ thang, wave }, m); return t ? t.the.length + ':' + (t.vang > 0) : 'null'; };
    o.pvpThangTrung = thu('pvp', true, hT, 12); o.pvpThangTruot = thu('pvp', true, hK, 12); o.pvpThua = thu('pvp', false, hT, 12); o.coop = thu('coop', false, hK, 12);
    // bảo hiểm Rương Vàng
    TT.st().xp = TT.xpTong(6); TT.xetCap(); o.pityV = KTC.ruong.vang.pityV; o.poolV = KT.dsPool('vang').length;
    let chuoi = 0, dai = 0, pvMax = 0, pity = 0;
    for (let i = 0; i < 40; i++) { const ru = KT.moRuong('vang', true); const co = ru.the.some(t => ['vang', 'do'].includes(t.bac || THEBAI.bac(t.id))); if (ru.pityV) pity++; chuoi = co ? 0 : chuoi + 1; dai = Math.max(dai, chuoi); pvMax = Math.max(pvMax, KT.doc().ru.pv); }
    o.dai = dai; o.pvMax = pvMax; o.pity = pity;
    return o;
  });
  ok(r.c0 === 0 && r.thua0 === 0, 'bắt đầu 0 cúp; thua ở 0 cúp vẫn 0 (không âm)');
  ok(r.c4 === 120 && r.moc4 === '100' && r.vang4 === 500, '4 trận thắng = 120 cúp, mốc 100 phát 1 lần (500 vàng + rương) ' + JSON.stringify([r.c4, r.moc4, r.vang4]));
  ok(r.c === 140 && r.max === 140 && r.lai === 0 && r.vangLai === 0 && r.ke === 200, 'thua 2 (−40) rồi thắng 2: 140 cúp, không phát lại mốc 100, mốc kế 200');
  ok(/"nhan":\{"100":1\}/.test(r.luu) && !r.luot, 'lưu turret_kt.cd.cup = ' + r.luu + ' · không có khoá cd.luot (CO-OP không giới hạn lượt)');
  ok(r.d0.n === 5 && /^(trang|xanh|trang,xanh)$/.test(r.d0.bac) && r.d0.dmg >= 3 && r.d0.cap === '00000' && r.d0.mana === 0.6, 'đối thủ 0 cúp: ' + JSON.stringify(r.d0));
  ok(r.d600.n === 5 && !/do/.test(r.d600.bac) && r.d600.mana === 1, 'đối thủ 600 cúp: không Đỏ ' + JSON.stringify(r.d600));
  ok(r.cung && r.tanSuat > 0.55 && r.tanSuat < 0.65, 'túi thắng tất định theo hạt, tần suất ' + r.tanSuat);
  ok(/^[1-9]\d*:true$/.test(r.pvpThangTrung) && r.pvpThangTruot === '0:true' && r.pvpThua === '0:true' && /^[1-9]\d*:true$/.test(r.coop), 'Rương Trận: PVP thắng + trúng ' + r.pvpThangTrung + ' · thắng trượt ' + r.pvpThangTruot + ' · thua ' + r.pvpThua + ' · CO-OP như cũ ' + r.coop);
  ok(r.pityV === 7 && r.poolV > 0 && r.dai <= 6 && r.pvMax <= 6, 'bảo hiểm Rương Vàng: pityV 7, chuỗi dài nhất không ra Huyền thoại = ' + r.dai + ' (≤ 6), bảo hiểm kích ' + r.pity + ' lần / 40 rương');
  // đồng đội người mới + đối thủ thật trong trận
  const t = await p.evaluate(() => {
    const o = {}; TT.st().xp = 0; TT.xetCap(); G.debug.auto = true;
    UI.che = 'coop'; batDau('coop', UI.chon, UI.mv); o.coop = G.ban[1].deck.join(); o.bacCoop = G.ban[1].deck.every(id => ['trang', 'xanh'].includes(G.rosterMap[id].bac) && SKILLS[id].dmg && SKILLS[id].vai !== 'ht');
    CD.st().cup.c = 0; UI.che = 'pvp'; batDau('pvp', UI.chon, UI.mv); o.pvp = G.ban[1].deck.every(id => ['trang', 'xanh'].includes(G.rosterMap[id].bac)); o.capPvp = Object.values(G.ban[1].capThe).join(''); o.cupM = G.cupM; o.debug = !!(G.debug.deck2 || G.debug.cap2);
    TT.st().xp = TT.xpTong(8); TT.xetCap(); UI.che = 'coop'; batDau('coop', UI.chon, UI.mv); o.cupM2 = G.cupM;
    return o;
  });
  ok(t.bacCoop && t.coop.split(',').length === 5, 'CO-OP cấp ≤ 5: đồng đội bộ cố định ' + t.coop);
  ok(t.pvp && t.capPvp === '00000' && t.cupM === 0.6 && !t.debug && t.cupM2 === 1, 'trận PVP 0 cúp: đối thủ Trắng / Xanh cấp 0, mana ×0,6; không rò cấu hình sang trận sau');
  ok(!errs.length, 'không lỗi trang ' + errs.join(' | '));
  await b.close();
  console.log(loi ? '✗ cúp / túi thắng / bảo hiểm: ' + loi + ' lỗi' : '✓ cúp / túi thắng / bảo hiểm đạt');
  process.exit(loi ? 1 : 0);
})();
