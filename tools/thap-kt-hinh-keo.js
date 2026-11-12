// ASTRAL ARSENAL — KIỂM HÌNH Ụ KHI KÉO / BAY / GHÉP (12/11, người dùng: "cầm ụ thả vào ụ khác, ụ có hình riêng bị sai hình khi kéo")
//  Với mỗi ụ / dạng có hình riêng (Merge King vàng, Twin Anvil Tốc / ST, trứng Evolver, Blood dạng 4, mặt nạ Prism, Rồng, Sói, Hydra, La Bàn, 20 ụ grow dạng 3…):
//  ảnh đầu dùng ở BẢN NHẤC khi kéo (GF.veUCam), BÓNG Ô GỐC, Ụ BAY (VX.veBay) phải = ảnh đầu của ụ ĐỨNG YÊN (REN.veU). Chạy cả 2D (?gl=0) và WebGL (?gl=1).
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-hinh-keo.js [BASE]
'use strict';
const { chromium } = require('playwright');
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  for (const gl of [0, 1]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message.slice(0, 200)));
    await p.goto(BASE + 'index.html?notut=1&net=0&gl=' + gl, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof GF !== 'undefined' && G.roster && G.roster.length);
    await p.waitForTimeout(4000);
    const r = await p.evaluate(async () => {
      HD.moKhoa = () => true; const grow = G.roster.map(x => x.id).filter(id => typeof laGrow === 'function' && laGrow(id) && window.STAGE_K && STAGE_K[id]);
      const coDau = Object.keys(SKILLS).filter(id => SKILLS[id].dauAnh), coDe = Object.keys(SKILLS).filter(id => SKILLS[id].deAnh);
      UI.chon = ['vughep', 'loren', 'tienhoa', 'mauhut', 'bienmau']; G.debug.auto = false; UI.che = 'coop'; UI.vao();
      await new Promise(r => setTimeout(r, 2500));
      const B = G.ban[0], o = B.o[7];
      const ghi = (f) => { const ds = [], dt = REN.dauTen, co = REN.co; REN.dauTen = function () { const t = dt.apply(this, arguments); ds.push('DAU:' + t); return t; }; REN.co = function (ten) { if (/_de$|_vien$|_phu/.test(ten)) ds.push(ten); return co.apply(this, arguments); };
        try { f(); } catch (e) { ds.push('LOI:' + e.message.slice(0, 60)); } finally { REN.dauTen = dt; REN.co = co; } return [...new Set(ds)].sort().join(' '); };
      const c = REN.ctx || document.querySelector('canvas').getContext('2d');
      const ca = [['vughep', T => { T.vang = true; }, 'vàng'], ['loren', T => { T.dang = 'toc'; T.lo = 3; }, 'tốc'], ['loren', T => { T.dang = 'dmg'; T.lo = 3; }, 'ST'], ['tienhoa', T => { }, 'trứng 3★'], ['mauhut', T => { T.mau = 9999; }, 'dạng 4'], ['bienmau', T => { }, 'mặt nạ'], ['ronglua', T => { T.gd = 3; }, 'dạng 3'], ['soi', T => { T.gd = 3; T.sao = 7; }, 'thức tỉnh'], ['hydra', T => { T.sao = 5; }, '5★'], ['canon', T => { }, 'la bàn'], ['nhatthuc', T => { }, 'ngày/đêm'], ['xucxac', T => { }, 'slot'], ['saochep', T => { }, 'copycat']];
      for (const id of grow.slice(0, 40)) if (!ca.some(x => x[0] === id)) ca.push([id, T => { T.sao = 7; T.gd = 3; }, 'gd3']);
      const ra = { coDau, coDe, grow: grow.length, ds: [] };
      for (const [id, dat, nh] of ca) {
        if (!SKILLS[id]) continue;
        let T; try { T = sinhU(taoU(B, id, 3, 7)); dat(T); B.t[7] = T; } catch (e) { ra.ds.push([id, nh, 'LOI tao ' + e.message]); continue; }
        // tải ảnh đầu riêng
        for (let i = 0; i < 30; i++) { const s1 = ghi(() => REN.veU(c, T, o.x, o.y, {})); if (!/null/.test(s1) && i > 3) break; await new Promise(r => setTimeout(r, 100)); }
        const s1 = ghi(() => REN.veU(c, T, o.x, o.y, {}));
        const s2 = ghi(() => GF.veUCam(c, T, o.x + 30, o.y - 30, 1.1, 0, Math.min(B.cw, B.ch), o, true));
        const s3 = ghi(() => REN.veU(c, T, o.x, o.y, { alpha: 0.25 }));
        const bay = { id: T.id, sao: T.sao, x0: o.x, y0: o.y, x1: o.x + 60, y1: o.y, t: 0, bac: T.bac, t0: VX.t, dai: 0.12, ng: T };
        const s4 = ghi(() => VX.veBay(c, bay, REN));
        ra.ds.push([id, nh, s1, s2 === s1, s3 === s1, s4 === s1, s2, s4]);
        B.t[7] = null;
      }
      // ghép thật: bản chụp nguồn của ghepfx.js mang đúng hình
      const thu = (id, f, id2) => { for (let i = 0; i < 15; i++) B.t[i] = null; const a = sinhU(taoU(B, id, 2, 6)); f(a); B.t[6] = a; const d = sinhU(taoU(B, id2, 2, 7)); B.t[7] = d; GF.mg.length = 0; G.bay.length = 0; ghep(B, a, d); const m = GF.mg[GF.mg.length - 1], v = G.bay[G.bay.length - 1], h = m ? m.a._hinh : v && v.ng ? REN.hinhCua(v.ng) : null; return (m ? 'GF:' : v ? 'bay:' : '') + (h && h.dau ? h.dau[0] : null); };
      ra.ghep = thu('vughep', T => { T.vang = true; }, 'tia'); ra.ghepAnvil = thu('loren', T => { T.dang = 'toc'; T.lo = 2; }, 'tia'); ra.ghepMau = thu('mauhut', T => { T.mau = 99999; }, 'mauhut');
      return ra;
    });
    console.log('--- gl=' + gl + ' · ' + r.ds.length + ' ụ / dạng (đầu riêng: ' + r.coDau.join() + ' · bệ riêng: ' + r.coDe.join() + ' · grow: ' + r.grow + ')');
    for (const x of r.ds) if (x.length < 5 || !x[3] || !x[4] || !x[5]) { loi++; console.log('  ✗ ' + x[0] + ' ' + x[1] + (x.length < 5 ? ' ' + x[2] : ' · đứng yên: ' + x[2] + ' · kéo: ' + x[6] + ' · bay: ' + x[7])); }
    ok(r.ds.length >= 25 && r.ds.every(x => x.length > 5 && x[3] && x[4] && x[5]), 'gl=' + gl + ': bản nhấc khi kéo, bóng ô gốc, ụ bay dùng ĐÚNG ảnh đầu như ụ đứng yên cho ' + r.ds.length + ' ụ / dạng');
    ok(/vughepvang_nong$/.test(r.ghep) && /lorentoc_nong$/.test(r.ghepAnvil) && /mauhut_f4_nong$/.test(r.ghepMau), 'gl=' + gl + ': ghép thật — ụ bay (G.bay.ng) / bản chụp ghép (GF) giữ hình Merge King vàng, Anvil Tốc, Blood dạng 4 ' + JSON.stringify([r.ghep, r.ghepAnvil, r.ghepMau]));
    await ctx.close();
  }
  await b.close();
  console.log(loi ? '\n✗ hình khi kéo: ' + loi + ' lỗi' : '\n✓ hình khi kéo / bay / ghép đúng dạng');
  process.exit(loi ? 1 : 0);
})();
