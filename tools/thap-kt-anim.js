// ANIMATION HYBRID (thap/js/anim.js) — kiểm hồi quy: (1) 92 ụ đều có nhóm chuyển động · (2) 30 FPS vs 60 FPS: cùng kịch bản (hạt giống cố định)
// → sự kiện bắn trùng bước, mọi đường cong giật / tụ lực / xung / quay nòng / rung cục bộ trùng giá trị ở cùng thời điểm (chỉ khác độ mịn)
// · (3) MUZZLE: đạn hiện ra ở cửa nòng (không ở tâm ảnh), chớp nòng neo đúng socket · (4) anim.js không gọi Math.random · (5) không lỗi trang.
// node tools/thap-kt-anim.js [BASE]   (cần http.server ở gốc repo) — in JSON + dòng cuối "ANIM: XANH" / "ANIM: DO"
const fs = require('fs'), path = require('path');
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/';
(async () => {
  const loi = [];
  const src = fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', 'anim.js'), 'utf8').replace(/\/\/.*$/gm, '');
  if (/Math\.random/.test(src)) loi.push('anim.js gọi Math.random (phá online lockstep)');
  const b = await chromium.launch(), errs = [];
  const mot = async (moi) => {
  const p = await b.newPage({ ...devices['iPhone 13'] });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}?mode=solo&deck=canon,lien,set,laser,mana&wave=4&fill=1&mana=99999&notut=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho && typeof AN !== 'undefined', null, { timeout: 40000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate((moi) => {
    const out = { thieu: [], parity: {}, muzzle: {} };
    for (const r of G.roster) if (!ANIM_U[r.id] || !ANIM_NHOM[ANIM_U[r.id]]) out.thieu.push(r.id);
    out.soU = G.roster.length;
    const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
    const ids = ['canon', 'lien', 'sungluc', 'set', 'laser', 'mana', 'railgun', 'bang', 'doc', 'khoathoigian', 'blackhole', 'tienhoa', 'drone', 'phun', 'mortar'];
    const lcg = (s) => () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
    // 1 lần chạy: n bước luật; vẽ mỗi `moi` bước (1 = 60 FPS, 2 = 30 FPS); lấy mẫu mỗi 2 bước (α = 1, cùng thời điểm ở cả 2 lần chạy)
    const chay = (moi, N) => {
      const r0 = Math.random, rLuat = lcg(12345), rVe = lcg(999);
      Math.random = rLuat;
      G.dung = true; G.t = 0; G.tocDo = 1; B.tim = 1e9; G.quai.length = 0; G.hang.length = 0; G.dan.length = 0; G.hu.length = 0; FX.reset(); AN._lac.length = 0; REN.t = 0;
      for (let o = 0; o < 15; o++) { B.t[o] = sinhU(taoU(B, ids[o], 4, o)); B.t[o].goc = -Math.PI / 2; }
      for (let i = 0; i < 24; i++) { const E = sinhQuai('bo', 0, p0.len * (0.12 + (i % 12) * 0.06), 4000); E.vao = 1;[E.x, E.y, E.goc] = viTri(p0, E.s); }
      const mau = [], banEv = [], dan = [];
      const g0 = window.giat; window.giat = function (T, m) { banEv.push(Math.round(G.t / BUOC) + ':' + T.o); return g0(T, m); };
      try {
        for (let k = 1; k <= N; k++) {
          chupTruoc(); capNhat(BUOC);
          if (k % moi === 0) {
            Math.random = rVe; FX.capNhat(BUOC * moi); REN.ve(BUOC * moi, 1);
            // đạn vừa vẽ lần đầu: so với muzzle socket lúc đó
            for (const d of G.dan) if (d._v0 && !d._kt && d.T && G.ban[d.T.ban] && G.ban[d.T.ban].t[d.T.o] === d.T) {
              d._kt = 1; const N2 = AN.nhom(d.T); if (N2.ho || N2.bay || d.cong || (SKILLS[d.T.id] || {}).gocDau || d.duoi === 'tenlua') continue; // 08/11: tên lửa Pháo La Bàn phóng từ MÉP BỆ theo hướng mũi tên (cố ý, skills.js banMot), không từ nòng
              const [mx, my] = AN.muzzle(d.T), Dd = REN.coDau(d.T), c = tamU(d.T);
              dan.push({ id: d.T.id, lech: Math.hypot(d._v0[0] - mx, d._v0[1] - my), tam: Math.hypot(d._v0[0] - c.x, d._v0[1] - c.y), D: Dd, buoc: (d.sp || 300) * BUOC * moi });
            }
            Math.random = rLuat;
          }
          if (k % 2 === 0) {
            const tR = AN.tR(), row = [];
            for (const T of B.t) if (T) { const s = AN.st(T), N2 = AN.nhom(T); row.push(+AN.giatAt(s, N2, tR).toFixed(6), +AN.antP(T, N2, tR).toFixed(6), +AN.xungAt(s, N2, tR).toFixed(6), +AN.spinAt(s, tR).toFixed(6), +AN.sphAt(s, tR).toFixed(5)); }
            const E = G.quai.find(q => !q.chet); if (E) { const q = AN.lacQuai(E); row.push(+q[0].toFixed(6), +q[1].toFixed(6)); }
            mau.push(row.join(','));
          }
        }
      } finally { window.giat = g0; Math.random = r0; }
      return { mau, banEv, dan };
    };
    const R = chay(moi, 600);
    out.R = R;
    // chớp nòng: điểm neo = socket (AN.muzzle) — kiểm 1 ụ đang giật: socket lùi theo nòng, xoay theo đầu
    const T = B.t[0], c = tamU(T); T.goc = 0.7; const D = REN.coDau(T);
    AN.st(T).tf = -1e9; const m1 = AN.muzzle(T).slice(), r1 = Math.hypot(m1[0] - c.x, m1[1] - c.y - AN._o.by);
    out.muzzle.goc = +Math.atan2(m1[1] - c.y - AN._o.by, m1[0] - c.x).toFixed(3);
    out.muzzle.rTip = +(r1 / D).toFixed(3);
    G.dung = false;
    return out;
  }, moi);
  await p.close(); return r;
  };
  const kq = await mot(+(process.env.MA || 1)), k2 = await mot(+(process.env.MB || 2));
  const A = kq.R, Bk = k2.R; delete kq.R;
  let khac = 0, dau = -1; for (let i = 0; i < Math.min(A.mau.length, Bk.mau.length); i++) if (A.mau[i] !== Bk.mau[i]) { khac++; if (dau < 0) dau = i; }
  kq.parity = { mau: A.mau.length, khac, dauKhac: dau, ban60: A.banEv.length, ban30: Bk.banEv.length, banTrung: A.banEv.join('|') === Bk.banEv.join('|'), viDu: dau >= 0 ? [A.mau[dau].slice(0, 200), Bk.mau[dau].slice(0, 200)] : null };
  const ds = A.dan.concat(Bk.dan);
  const xau = ds.filter(x => x.lech > Math.max(10, x.D * 0.3) + x.buoc);
  const tam = ds.filter(x => x.tam < x.D * 0.25);
  Object.assign(kq.muzzle, { soDan: ds.length, lechMax: +Math.max(0, ...ds.map(x => x.lech - x.buoc)).toFixed(1), xau: xau.slice(0, 5), hienOTam: tam.length });
  await b.close();
  if (kq.thieu.length) loi.push('ụ chưa có nhóm chuyển động: ' + kq.thieu.join(','));
  if (kq.soU < 92) loi.push('roster < 92: ' + kq.soU); // 08/11: bỏ Holy Halo (haoquang, THE_BO) → 92 ụ
  if (kq.parity.khac) loi.push('30/60 FPS lệch ' + kq.parity.khac + ' mẫu (đầu tiên #' + kq.parity.dauKhac + ')');
  if (!kq.parity.banTrung) loi.push('sự kiện bắn 30/60 FPS khác nhau');
  if (kq.parity.ban60 < 20) loi.push('quá ít phát bắn để so: ' + kq.parity.ban60);
  if (kq.muzzle.soDan < 10) loi.push('quá ít đạn để kiểm muzzle: ' + kq.muzzle.soDan);
  if (kq.muzzle.xau.length) loi.push('đạn hiện xa cửa nòng: ' + JSON.stringify(kq.muzzle.xau[0]));
  if (kq.muzzle.hienOTam) loi.push(kq.muzzle.hienOTam + ' đạn hiện ở tâm ảnh');
  if (Math.abs(kq.muzzle.goc - 0.7) > 0.05) loi.push('socket không xoay theo đầu súng: ' + kq.muzzle.goc);
  if (errs.length) loi.push('lỗi trang: ' + errs.slice(0, 3).join(' | '));
  console.log(JSON.stringify({ BASE, ...kq, loi }, null, 1));
  console.log(loi.length ? 'ANIM: DO' : 'ANIM: XANH');
  process.exitCode = loi.length ? 1 : 0;
})();
