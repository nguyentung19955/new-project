// TURRET MERGE — kiểm thử hiệu ứng v2 phần 2 (tờ T07 T08 T10–T13 T15 T17 T19 T21 + G1–G4) ở SOLO / CO-OP / PVP.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi OUT=docs/demo-hop-tuong/tuvan/fxv2/p2/ node tools/thap-kt-fxv2-p2.js 390 844
// Mỗi lô 5 ụ ở hàng giữa (+ ụ tấn công kề để ụ hỗ trợ có chỗ buff), quái máu cao chạy → chụp đang bắn; rồi ép biến hình dạng 2→3; đo fps cả bàn.
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const IDS = ['doc', 'vungdoc', 'tuthan', 'nhanmana', 'set', 'bao', 'epxung', 'nangluong', 'nangsao', 'vughep', 'santhuong', 'pandora',
  'blackhole', 'dichchuyen', 'tron', 'xaotron', 'mana', 'hutmana', 'khuech', 'saochep', 'chimang', 'radar', 'thaukinh', 'luoicheo',
  'cauvong', 'mimic', 'combo', 'nayda', 'maychem', 'sinhdoi', 'nhanban', 'loa', 'overlord', 'orbital', 'dongbo', 'ngoisao',
  'lophanung', 'hydra', 'lienket', 'ngaithoigian'];
const LO = []; for (let i = 0; i < IDS.length; i += 5) LO.push(IDS.slice(i, i + 5));
const MODES = (process.env.MODES || 'solo,coop,pvp').split(',');
(async () => {
  const b = await chromium.launch();
  const ketqua = {};
  for (const mode of MODES) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    const errs = []; p.on('pageerror', e => errs.push(String(e.stack || e.message).split('\n').slice(0, 3).join(' | '))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await p.goto(`http://localhost:8765/thap/?mode=${mode}&deck=lien,canon,bang,tia,set&wave=12&mana=99999`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 20000 });
    await p.waitForTimeout(1500);
    await p.evaluate(() => { if (typeof VT !== 'undefined' && VT.mo) VT.dong(); }); await p.waitForTimeout(400); // đóng màn giới thiệu trùm
    const dung = async (v) => p.evaluate((v) => { G.dung = v; }, v);
    for (let li = 0; li < LO.length; li++) {
      await p.evaluate((ids) => {
        G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.ketThuc = null; FX.reset();
        for (const B of G.ban) {
          if (!B) continue; B.tim = 1e9; B.t.fill(null);
          for (const id of ids) { if (!B.deck.includes(id)) B.deck.push(id); B.lv[id] = B.lv[id] || 1; }
          const dat = (o, uid, sao, gd) => { const T = sinhU(taoU(B, uid, sao, o)); if (gd) { T._epGd = gd; T.gd = gd; } T.cd = 0; T.nhip = 0.9; B.t[o] = T; return T; };
          ids.forEach((id, i) => dat(5 + i, id, 5, typeof G_IDS !== 'undefined' && G_IDS.includes(id) ? 2 + (i % 2) : 0));
          for (const o of [0, 1, 2, 3, 4, 10, 11, 12, 13, 14]) dat(o, o % 2 ? 'canon' : 'lien', 5, 0);
        }
        for (const [bi, p0] of G.duong.entries()) {
          if (!p0) continue;
          for (let i = 0; i < 9; i++) { const E = sinhQuai(i % 4 === 0 ? 'khong_lo' : 'bo', bi, p0.len * (0.05 + i * 0.05), 600); E.vao = 1; E.chan = 1e9; }
        }
      }, LO[li]);
      await p.waitForTimeout(1300);
      await dung(true);
      await p.screenshot({ path: `${OUT}${mode}_lo${li + 1}_a.jpg`, type: 'jpeg', quality: 82 });
      await dung(false); await p.waitForTimeout(450); await dung(true);
      await p.screenshot({ path: `${OUT}${mode}_lo${li + 1}_b.jpg`, type: 'jpeg', quality: 82 });
      await dung(false);
    }
    // biến hình (awaken) dạng 2→3 + nổ riêng của ụ
    await p.evaluate(() => {
      G.hu.length = 0; G.dan.length = 0; FX.reset();
      for (const B of G.ban) { if (!B) continue; const ids = ['overlord', 'ngoisao', 'hydra', 'lophanung', 'ngaithoigian'];
        B.t.forEach((T, o) => { if (T && o >= 5 && o <= 9) { const id = ids[o - 5]; const X = sinhU(taoU(B, id, 7, o)); X._epGd = 3; X.gd = 3; B.t[o] = X; VX.bien(X, 2, 3); } }); }
    });
    for (const [k, ms] of [['a', 250], ['b', 120]]) { await p.waitForTimeout(ms); await dung(true); await p.screenshot({ path: `${OUT}${mode}_bienhinh_${k}.jpg`, type: 'jpeg', quality: 82 }); await dung(false); }
    // fps cả bàn (15 ụ mỗi bàn đang bắn)
    const fps = await p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
    ketqua[mode] = { fps: Math.round(fps), loi: errs.slice(0, 6) };
    await p.close();
  }
  console.log(JSON.stringify(ketqua, null, 1));
  await b.close();
})();
