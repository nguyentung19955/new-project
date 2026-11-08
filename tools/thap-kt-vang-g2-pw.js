// TURRET MERGE — phần chạy thật của tools/thap-kt-vang-g2.js (PW=1): trận SOLO có từng ụ làm lại 08/11 + trang chi tiết ụ,
//   ở 844×390 (ngang) và 390×844 (dọc). Kiểm không lỗi trang, luật chạy trong trình duyệt (Archive bay vào, Anvil buff, Prism vuốt 4 ô bằng
//   pointer thật, Blood đánh dấu → nuốt, trứng nở, Salvo hàng, Ember lửa). Ảnh: tools/shots-vang-g2/ (không commit) — xem bằng mắt.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.SHOTS || path.join(__dirname, 'shots-vang-g2');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
module.exports = async function () {
  fs.mkdirSync(OUT, { recursive: true });
  let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };
  const b = await chromium.launch();
  for (const [w, h] of [[844, 390], [390, 844]]) {
    console.log('Playwright ' + w + '×' + h);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: false });
    const errs = [];
    const mo = async (q) => {
      const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(e.message));
      p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION|favicon|404/.test(m.text())) errs.push('console ' + m.text().slice(0, 160)); });
      await p.goto(BASE + q, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 60000 });
      await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); // màn giới thiệu trùm tự tắt
      await sleep(900);
      return p;
    };
    const chup = async (p, ten) => { const f = path.join(OUT, ten + '-' + w + 'x' + h + '.png'); await p.screenshot({ path: f }); console.log('    ảnh ' + f); };
    const DUNG = (ds) => { const B = G.ban[0]; G.quai.length = 0; B.t.fill(null); for (const [o, id, s, f] of ds) { const T = sinhU(taoU(B, id, s, o)); T.goc = -Math.PI / 2; B.t[o] = T; if (f) Object.assign(T, f); } };
    const buoc = (p, g) => p.evaluate((g) => { G.dung = true; for (let t = 0; t < g; t += 1 / 30) capNhat(1 / 30); G.dung = false; }, g);
    // 1) trận: Ember / Archive / Anvil / Prism / Blood
    let p = await mo('?mode=solo&deck=lualien,luutru,loren,bienmau,mauhut&wave=3&mana=0&notut=1');
    await p.evaluate(`window.DUNG = ${DUNG.toString()}`);
    let r = await p.evaluate(() => {
      DUNG([[0, 'lualien', 2, { lc: 12 }], [1, 'lualien', 2, { lc: 35 }], [3, 'lualien', 1, { lc: 55 }], [5, 'lualien', 1, { lc: 4 }], [4, 'luutru', 2], [9, 'luutru', 3],
        [10, 'bienmau', 2, { pm: 0, pms: 3 }], [11, 'bienmau', 2, { pm: 1, pms: 2 }], [12, 'bienmau', 2, { pm: 2, pms: 1 }], [13, 'bienmau', 2, { pm: 3, pms: 4 }],
        [6, 'loren', 3, { dang: 'dmg', lo: 6 }], [7, 'loren', 2, { dang: 'toc', lo: 4 }], [8, 'mauhut', 2, { mau: 12 }], [14, 'lien', 3], [2, 'canon', 2]]);
      const B = G.ban[0]; B.deck = ['lien']; const k0 = B.t[4].kho + B.t[9].kho;
      ghep(B, B.t[0], B.t[1]); // Relay 12 + 35 → hàng 0 / cột 1: 47
      return { relay3: B.t[3] && B.t[3].lc, kho: B.t[4].kho + B.t[9].kho - k0, bay: G.hu.some(o => o.k === 'khoBay') };
    });
    ok(r.relay3 === 55 && r.kho === 1 && r.bay, 'trình duyệt: Relay giữ lửa cao hơn · ghép thật → 1 điểm Archive + viên bay (' + JSON.stringify(r) + ')');
    await buoc(p, 0.3); await sleep(150); await chup(p, 'tran-ember-archive');
    r = await p.evaluate(() => { const B = G.ban[0]; ghep(B, B.t[6], B.t[14]); ghep(B, B.t[8], B.t[2]); return { anv: B.t[14] && B.t[14].anv, mh: B.t[8] && B.t[8].mh && B.t[8].mh.o }; });
    ok(r.anv && r.anv.k === 'dmg' && r.mh === 2, 'Anvil buff ST lên ụ khác · Blood Circuit đánh dấu ô 2 (' + JSON.stringify(r) + ')');
    // Prism: vuốt thật 10 → 11 → 12 → 13
    const cell = (o) => p.evaluate((o) => { const B = G.ban[0], c = B.o[o], rr = document.querySelector('#cv').getBoundingClientRect(); return [rr.left + c.x / W * rr.width, rr.top + c.y / H * rr.height]; }, o);
    await sleep(2600); // chờ nhãn chữ (DOM) của lần ghép/buff vừa rồi tắt — nhãn nằm trên canvas
    const pts = []; for (const o of [10, 11, 12, 13]) pts.push(await cell(o));
    await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
    for (let i = 1; i < 4; i++) for (let k = 1; k <= 6; k++) await p.mouse.move(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k / 6, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k / 6);
    await p.mouse.up();
    r = await p.evaluate(() => { const B = G.ban[0]; return { n: B.t[13] && B.t[13].pf, trong: [10, 11, 12].every(o => !B.t[o]) }; });
    ok(r.n === 1 && r.trong, 'VUỐT 4 Prism 4 màu (pointer thật) → HỢP THỂ 1 mặt nạ 4 màu ở ô cuối (' + JSON.stringify(r) + ')');
    await sleep(250); await chup(p, 'tran-prism-circuit');
    await buoc(p, 15); await sleep(150);
    r = await p.evaluate(() => { const B = G.ban[0]; return { o2: B.t[2] ? B.t[2].id : null, mau: B.t[8] && B.t[8].mau }; });
    ok(r.o2 === null && r.mau === 22, 'Blood Circuit nuốt 2★ sau 11 s: +10 Máu (' + JSON.stringify(r) + ')');
    await p.evaluate(() => { const B = G.ban[0]; const X = sinhU(taoU(B, 'lien', 2, 3)); B.t[3] = X; }); // ụ Tấn công kề Mạch Máu (ô 3)
    r = await p.evaluate(() => { const B = G.ban[0], M = B.t[8], c = B.o[8], rr = document.querySelector('#cv').getBoundingClientRect(); return [rr.left + c.x / W * rr.width, rr.top + c.y / H * rr.height]; });
    await p.mouse.click(r[0], r[1]); await sleep(200);
    r = await p.evaluate(() => { const B = G.ban[0]; return { mau: B.t[8].mau, rite: !!B.t[8].rite }; });
    ok(r.mau === 12 && r.rite, 'CHẠM Mạch Máu (≥10 Máu) → Blood Rite (' + JSON.stringify(r) + ')');
    await buoc(p, 0.4); await sleep(150); await chup(p, 'tran-anvil-blood');
    await p.close();
    // 2) trận: Salvo / Trứng / Choir / Foundry
    p = await mo('?mode=solo&deck=railgun,tienhoa,hopca,xuonganh,lien&wave=3&mana=0&notut=1');
    await p.evaluate(`window.DUNG = ${DUNG.toString()}`);
    r = await p.evaluate(() => {
      DUNG([[5, 'railgun', 2], [6, 'railgun', 2], [7, 'railgun', 2], [8, 'railgun', 2], [2, 'railgun', 2], [0, 'tienhoa', 1], [1, 'tienhoa', 3], [3, 'tienhoa', 6, { egg: 21.5 }], [4, 'tienhoa', 7],
        [11, 'hopca', 2], [10, 'lien', 2], [12, 'lien', 2], [13, 'xuonganh', 1], [14, 'xuonganh', 1], [9, 'lien', 3]]);
      const B = G.ban[0]; B.deck = ['lien']; ghep(B, B.t[13], B.t[14]); capNhatBan(B, 1 / 30);
      return { row: Math.round(B.t[5].buf.dmg * 100), col: Math.round(B.t[7].buf.toc * 100), hop: SKILLS.hopca.hoa(B, B.t[11]), hero: B.hero && B.hero[0] && B.hero[0].o };
    });
    ok(r.row === 65 && r.hero === 14 && r.hop === 3, 'Salvo 4/5 hàng +65% · Choir 3 Harmony (2 Gatling + Salvo kề cùng sao) · ô anh hùng = ô ghép (' + JSON.stringify(r) + ')');
    await buoc(p, 1); await sleep(150); await chup(p, 'tran-salvo-trung-choir');
    r = await p.evaluate(() => { const B = G.ban[0]; return { o3: B.t[3] && B.t[3].sao, chay: B.t[3] && SKILLS.tienhoa.chay(B.t[3]) }; });
    ok(r.o3 === 7 && r.chay, '6★ → trứng cháy 7★ (' + JSON.stringify(r) + ')');
    await buoc(p, 12); await sleep(150);
    r = await p.evaluate(() => { const B = G.ban[0]; return B.t[0] && B.t[0].id + B.t[0].sao; });
    ok(r === 'lien2', 'trứng 1★ nở sau 12 s → ụ 2★ (' + r + ')');
    await chup(p, 'tran-trung-no');
    await p.close();
    // 3) trang chi tiết ụ (Test range)
    p = await mo('?notut=1');
    for (const id of ['lualien', 'hopca', 'luutru', 'loren', 'bienmau', 'mauhut', 'railgun', 'tienhoa', 'xuonganh']) {
      await p.evaluate((id) => { if (typeof UP !== 'undefined') UP.mo(id); }, id); await sleep(2600);
      await chup(p, 'trang-' + id);
      { // bấm 'More' (chữ kỹ năng đầy đủ + khung Test range) nếu có
        const co = await p.evaluate(() => { const r = (typeof UP !== 'undefined' && UP.el) || document.body; const e = r.querySelector('[data-up="more"]'); if (!e) return false; e.click(); return true; });
        if (co) { await sleep(3200); await chup(p, 'trang-' + id + '-more'); await p.keyboard.press('Escape').catch(() => {}); await sleep(300); }
      }
      await p.evaluate(() => { const x = document.querySelector('#up') || (typeof UP !== 'undefined' && UP.el); if (typeof UP !== 'undefined' && UP.dong) UP.dong(); else if (x) x.hidden = true; }); await sleep(300);
    }
    await p.close();
    ok(!errs.length, 'không lỗi trang (' + errs.slice(0, 3).join(' | ') + ')');
    await ctx.close();
  }
  await b.close();
  return loi;
};
if (require.main === module) module.exports().then(n => process.exit(n ? 1 : 0));
