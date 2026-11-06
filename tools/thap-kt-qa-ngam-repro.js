// TURRET MERGE — hồi quy các lỗi QA NGÂM tìm ra (docs/demo-hop-tuong/tuvan/qa-ngam/BAO-CAO.md), mỗi lỗi 1 tình huống nhỏ + 1 vòng ngâm ngắn.
//  1) 2 Star Leech cùng nhắm 1 ụ 2★ (PVP đột tử) → không được về 0★ (SOLO / CO-OP / PVP)
//  2) Trùm mới (hive/jammer/prism/twin_core/patcher/leech) ra khi dải _8 chưa nạp → không tải trum_<id>.png (404)
//  3) Nhãn cấp thẻ dài "LV16+1" trên khay trận nằm TRONG khung thẻ (iPhone 13, SOLO / CO-OP / PVP)
//  4) Báo chiêu trùm: trùm chết giữa lúc báo → không còn tâm ngắm / dấu (đã sửa ở cc1c21f — giữ ở đây làm lưới an toàn)
//  5) Ngâm ngắn: 9 trận bot (SOLO/CO-OP/PVP, 3 tốc độ, bộ thật Star Cannon + Mystery Box + Leviathan + Evolver + Copycat) — 0 lỗi bất biến
// Chạy: python3 -m http.server 8765 & ; NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-qa-ngam-repro.js
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const TRANG = fs.readFileSync(path.join(__dirname, 'thap-qa-ngam-trang.js'), 'utf8');
const ok = [], hong = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? '✓ ' : '✗ ') + s); };

(async () => {
  const b = await chromium.launch();
  for (const che of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage(), err = [], h404 = [];
    p.on('pageerror', e => err.push(e.message));
    p.on('response', r => { if (r.status() >= 400) h404.push(r.url()); });
    await p.goto(BASE + '?nointro=1&notut=1&mode=' + che + '&deck=canon,bang,tia,set,lien&wave=50', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban.length && !TAI.cho, null, { timeout: 40000 });
    // 1) 2 Star Leech
    const r1 = await p.evaluate(() => {
      const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; G.quai.length = 0;
      const T = B.t[7] = sinhU(taoU(B, 'canon', 2, 7));
      const mk = () => { const E = sinhTrum('leech', 0); E.ban = 0; E.bao = { t: 0, song: 1.4, muc: [T.uid] }; T.st.ngam = 1.4; return E; };
      const E1 = mk(), E2 = mk();
      TRUM_KN.leech.lam(E1, B, [T]); TRUM_KN.leech.lam(E2, B, [T]);
      return T.sao;
    });
    kt(r1 === 1, che + ': 2 Star Leech cùng hút 1 ụ 2★ → còn ' + r1 + '★ (≥ 1★)');
    // 2) trùm mới khi dải _8 chưa nạp: tên ảnh luôn là _8 (không xin trum_<id>.png không tồn tại)
    const r2 = await p.evaluate(() => { const ds = []; for (const id of TRUM_ANH) { delete REN.anh['trum_' + id + '_8']; ds.push(id + '=' + REN.tenQuai({ trum: id, d: {} })); } return ds; });
    kt(r2.every(x => /_8$/.test(x)), che + ': trùm mới chưa nạp ảnh → ' + r2.join(' '));
    await p.waitForTimeout(1500);
    const bad = h404.filter(u => /trum_[a-z_]+\.png/.test(u) && !/_8|_side|_back|_atk|portrait/.test(u));
    kt(!bad.length, che + ': không tải 404 trum_<id>.png' + (bad.length ? ' — ' + bad.join(' ') : ''));
    // 4) trùm chết giữa lúc báo chiêu → hết tâm ngắm sau ≤ 1 s
    const r4 = await p.evaluate(() => {
      const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; G.quai.length = 0;
      for (const o of [5, 6, 7]) B.t[o] = sinhU(taoU(B, 'canon', 3, o));
      const E = sinhTrum('mad_crown', 0); E.vao = 1; E.knT = 0;
      for (let i = 0; i < 6; i++) capNhat(BUOC);
      const coBao = !!E.bao; chet(E, B);
      for (let i = 0; i < 90; i++) capNhat(BUOC);
      REN.ve(0, 1);
      return { coBao, ngam: B.t.filter(T => T && T.st.ngam > 0).length, tvf: TVF.ds.length };
    });
    kt(r4.coBao && r4.ngam === 0 && r4.tvf === 0, che + ': trùm chết giữa lúc báo chiêu → tâm ngắm còn ' + r4.ngam + ', dấu TVF còn ' + r4.tvf + (r4.coBao ? '' : ' (không báo được chiêu?)'));
    kt(!err.length, che + ': không lỗi trang' + (err.length ? ' — ' + err.slice(0, 2).join(' | ') : ''));
    await ctx.close();
  }
  // 3) nhãn cấp thẻ dài trên khay trận (iPhone 13)
  for (const che of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext(devices['iPhone 13']); const p = await ctx.newPage();
    await p.goto(BASE + '?nointro=1&notut=1&mode=' + che + '&deck=ngoisao,hopbi,leviathan,tienhoa,saochep&mana=5000', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban.length && !TAI.cho, null, { timeout: 40000 }); await p.waitForTimeout(2000);
    const r = await p.evaluate(async () => {
      const B = G.ban[0]; B.capThe = { ngoisao: 15, hopbi: 9, leviathan: 14, tienhoa: 11, saochep: 0 }; for (const id of B.deck) nangCap(B, id); UI.capNhat();
      await new Promise(r => setTimeout(r, 300));
      return [...document.querySelectorAll('#bo-the .the')].map(d => {
        const l = d.querySelector('.lv'), rg = document.createRange(); rg.selectNodeContents(l); const a = rg.getBoundingClientRect(), c = d.getBoundingClientRect();
        return { t: l.textContent, ok: a.left >= c.left + 1 && a.right <= c.right - 1 };
      });
    });
    const sai = r.filter(x => !x.ok);
    kt(!sai.length, che + ': nhãn cấp thẻ trong khung thẻ (' + r.map(x => x.t).join(' ') + ')' + (sai.length ? ' — tràn: ' + sai.map(x => x.t).join(' ') : ''));
    await ctx.close();
  }
  await b.close();
  // 5) ngâm ngắn
  if (!process.env.KHONG_NGAM) {
    try {
      const o = execFileSync('node', [path.join(__dirname, 'thap-qa-ngam.js')], { stdio: 'pipe', timeout: 900000,
        env: Object.assign({}, process.env, { SO: process.env.NGAM_SO || '9', SEED0: '7001', NHIN: '0', TAILAP: '2', ONLINE: '0', KHONG_DAI: '1', TRAN_S: '60', OUT: process.env.NGAM_OUT || '/tmp/qa-ngam-hoiquy/' }) });
      kt(true, 'ngâm ngắn: ' + String(o).split('\n').filter(l => /====|XANH/.test(l)).join(' '));
    } catch (e) { kt(false, 'ngâm ngắn có lỗi: ' + String(e.stdout || e.message).split('\n').filter(l => /^\d+×/.test(l)).slice(0, 6).join(' · ')); }
  }
  console.log(hong.length ? '✗ ' + hong.length + ' lỗi / ' + (ok.length + hong.length) : '✓ QA ngâm hồi quy XANH (' + ok.length + ' mục)');
  process.exit(hong.length ? 1 : 0);
})();
