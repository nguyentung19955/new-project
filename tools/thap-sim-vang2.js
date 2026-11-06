// TURRET MERGE — mô phỏng DPS trong trình duyệt (Playwright) cho ụ VÀNG đợt 2 + so dải vàng.
//   python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-sim-vang2.js [giây] [id,id…]
'use strict';
const { chromium } = require('playwright');
const T0 = +(process.argv[2] || 30);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=lien,canon,bang,tia,set&wave=20&mana=0', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const ids = process.argv[3] ? process.argv[3].split(',') : null;
  const kq = await p.evaluate(({ T0, ids }) => {
    G.dung = true; const r0 = Math.random; let s = 12345; Math.random = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const _tr = trung; let sum = 0;
    window.trung = trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _tr(E, d, o); if (!c) sum += Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };
    function dps(id, sao, opt) {
      opt = opt || {}; const B = G.ban[0];
      G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.hang.length = 0; G.cho = 1e9; G.wave = 20; B.tim = 1e9; B.mana = 0; B.t.fill(null);
      if (!B.deck.includes(id)) B.deck[0] = id; B.lv[id] = 1; B.capThe = B.capThe || {}; B.capThe[id] = 0;
      for (const k of Object.keys(B)) if (/^(vamp|hexCd|combo)$/.test(k)) delete B[k];
      const dat = (o, id2, s2) => { const T = sinhU(taoU(B, id2, s2, o)); B.t[o] = T; return T; };
      if (opt.fill) opt.fill(B, dat); else dat(2, id, sao);
      sum = 0; let q = 0; const dt = 1 / 30;
      for (let t = 0; t < T0; t += dt) {
        if (t >= q * 0.5) { q++; const d = taoWave(G.wave).ds; sinhQuai(pick(d), 0, 0, 6); G.quai[G.quai.length - 1].vao = 1; }
        capNhat(dt); G.quai = G.quai.filter(E => !E.chet);
      }
      return sum / T0;
    }
    const vang = G.roster.filter(r => r.bac === 'vang' && SKILLS[r.id] && SKILLS[r.id].dmg && SKILLS[r.id].vai === 'tc').map(r => r.id);
    const ds = ids || vang;
    const out = {};
    for (const id of ds) out[id] = [1, 4, 7].map(s => Math.round(dps(id, s)));
    out._lien = [1, 4, 7].map(s => Math.round(dps('lien', s)));
    Math.random = r0; return out;
  }, { T0, ids });
  for (const k in kq) console.log(k.padEnd(14), kq[k].join('\t'));
  console.log('ERR', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();
