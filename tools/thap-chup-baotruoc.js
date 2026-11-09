// TURRET MERGE — chụp BÁO TRƯỚC chữ ký Đỏ (dosig.js) quanh lúc TỰ KÍCH (sau đổi tự kích, commit 335decc86): nạp 70% → đầy → nổ.
// Mỗi ụ 1 dải 10 khung × 0,15 s (390×844 DPR 2), nạp được đẩy đều 0,7 → 1 trong 1,2 s (giả lập thanh nạp), ụ tự kích nổ khi đầy.
// node tools/thap-chup-baotruoc.js [OUT]  (CHI=id,id) — kiểm: báo trước hiện TRƯỚC lúc nổ, tích tụ (MV.tichTu) nhường từ 80% (không hiện đôi)
const fs = require('fs'), { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8813/thap/', OUT = process.argv[2] || '/dev/shm/anim/bao';
const CHI = (process.env.CHI || 'ronglua,leviathan,khoisinh,chuato,lophanung,ngaithoigian,thacmana,overlord').split(',');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '?mode=solo&deck=' + (process.env.DECK || CHI.slice(0, 5).join(',')) + '&wave=6&fill=5&mana=99999&notut=1' + (process.env.Q || ''), { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 40000 });
  await p.waitForTimeout(4000);
  for (const id of CHI) {
    const r = await p.evaluate((id) => {
      const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0]; G.dung = true; B.mana = 1e6;
      G.quai.length = 0; G.hu.length = 0; FX.reset(); for (let i = 0; i < 15; i++) B.t[i] = null; G.t = 200;
      const O = 7, T = B.t[O] = sinhU(taoU(B, id, 5, O)), c = B.o[O];
      if (id === 'chuato') for (let i = 0; i < 6; i++) { chupTruoc(); capNhat(BUOC); }
      for (let i = 0; i < 10; i++) { const E = sinhQuai('bo', 0, p0.len * (0.3 + i * 0.04), 60); E.vao = 1; E.max = E.hp = 1e9; E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(p0, E.s); }
      const k = REN.s * REN.dpr, CO = 170, w = Math.round(CO * k / 1.6), cv = document.createElement('canvas'); cv.width = w * 10 + 36; cv.height = w; const x2 = cv.getContext('2d');
      let n = 0, t = 0, no = -1; const log = [];
      while (n < 10 && t < 4) {
        const u = Math.min(1, t / 1.2); if (T.nap != null && no < 0) T.nap = Math.max(T.nap, 0.7 + 0.3 * u); if (id === 'overlord') T.nap = Math.min(T.nap, 0.999 + (u >= 1 ? 1 : 0));
        for (const E of G.quai) { E.hp = E.max; E.chet = false; }
        const nap0 = T.nap; chupTruoc(); capNhat(BUOC); FX.capNhat(BUOC); REN.ve(BUOC, 1); t += BUOC;
        if (no < 0 && nap0 > 0.9 && T.nap < 0.5) no = t;
        if (t >= n * 0.15) { const dx = n * (w + 4); if (REN.nen.width > 2) { const kn = REN.nen.width / W; x2.drawImage(REN.nen, (c.x - CO / 2) * kn, (c.y - CO / 2) * kn, CO * kn, CO * kn, dx, 0, w, w); } x2.drawImage(REN.cv, (c.x - CO / 2) * k, (c.y - CO / 2) * k, CO * k, CO * k, dx, 0, w, w); log.push((T.nap || 0).toFixed(2)); n++; }
      }
      return { anh: cv.toDataURL('image/jpeg', 0.8), no: no < 0 ? -1 : +no.toFixed(2), log };
    }, id);
    fs.writeFileSync(`${OUT}/${id}.jpg`, Buffer.from(r.anh.split(',')[1], 'base64'));
    console.log(id, 'nổ lúc', r.no, 's · nạp mỗi khung', r.log.join(' '));
  }
  console.log('loi trang:', errs);
  await b.close();
})();
