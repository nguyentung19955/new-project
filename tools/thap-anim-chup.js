// ANIMATION HYBRID — chụp DẢI KHUNG (iPhone 13) cho mỗi nhóm chuyển động: hàng 1 = đứng yên 10 s (1 khung / s, nhịp thở),
// hàng 2 = phát bắn / xung QUAY CHẬM 0,25× (khung vẽ mỗi 1/240 s nội suy giữa các bước luật 1/60 s → thấy được mượt giữa bước),
// hàng 3 = cùng phát bắn ở 30 FPS (khung mỗi 1/30 s) để so độ dài thời gian.  Ra docs/demo-hop-tuong/tuvan/anim/dai_<nhom>.png
// node tools/thap-anim-chup.js [BASE] [nhom,nhom…]   (cần http.server ở gốc repo; ghép ảnh bằng python3 PIL)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/';
const OUT = path.join(__dirname, '..', 'docs', 'demo-hop-tuong', 'tuvan', 'anim');
const MAU = { cannon: 'canon', nang: 'railgun', revolver: 'sungluc', gatling: 'lien', beam: 'laser', chain: 'set', ice: 'bang', poison: 'doc', support: 'mana', drone: 'drone', portal: 'blackhole', chrono: 'khoathoigian', evolver: 'tienhoa' };
const CHON = process.argv[3] ? process.argv[3].split(',') : Object.keys(MAU);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'anim-'));
  const b = await chromium.launch(), p = await b.newPage({ ...devices['iPhone 13'] }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}?mode=solo&deck=canon,lien,set,laser,mana&wave=3&fill=1&mana=99999&notut=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho && typeof AN !== 'undefined', null, { timeout: 40000 });
  await p.waitForTimeout(6000);
  await p.evaluate(() => { for (const e of document.querySelectorAll('#nd-gt')) e.remove(); });
  const ketQua = {};
  for (const nhom of CHON) {
    const id = MAU[nhom]; if (!id) continue;
    // dựng bàn: 1 ụ ở ô giữa (o = 7) + vài quái trước mặt
    const clip = await p.evaluate((id) => {
      G.dung = true; const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
      for (let o = 0; o < 15; o++) B.t[o] = null;
      G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.hang.length = 0; FX.reset(); B.tim = 1e9;
      const T = sinhU(taoU(B, id, 3, 7)); B.t[7] = T; T.goc = -Math.PI / 2; T.cd = 0.6; if (T.nap != null) T.nap = 0.55;
      for (let i = 0; i < 6; i++) { const E = sinhQuai('bo', 0, p0.len * (0.3 + i * 0.05), 1e9); E.vao = 1; E.max = E.hp; [E.x, E.y, E.goc] = viTri(p0, E.s); E.v = 0; if (E.d) E.d = Object.assign({}, E.d, { v: 0 }); }
      window.__T = T; window.__ban = []; const g0 = window.__g0 || window.giat; window.__g0 = g0;
      window.giat = function (T2, m) { if (T2 === window.__T) window.__ban.push(G.t); return g0(T2, m); };
      for (let k = 0; k < 30; k++) { chupTruoc(); capNhat(BUOC); } REN.ve(1 / 60, 1);
      const r = REN.cv.getBoundingClientRect(), k = r.width / W, c = B.o[7], S = Math.min(B.cw, B.ch) * 1.05;
      return { x: Math.round(r.left + (c.x - S / 2) * k), y: Math.round(r.top + (c.y - S / 2) * k), width: Math.round(S * k), height: Math.round(S * k) };
    }, id);
    const anh = { idle: [], cham: [], f30: [] };
    // hàng 1: đứng yên 10 s (không quái): thở lõi + nhún nhẹ
    await p.evaluate(() => { window.__q = G.quai.slice(); window.__T.cd = 99; for (const e of document.querySelectorAll('#cutin,#canh-bao,#bang-wave')) e.hidden = true; }); // đứng yên: không bắn (cd lớn), vẫn có quái
    for (let s = 0; s < 10; s++) {
      await p.evaluate(() => { for (let k = 0; k < 60; k++) { chupTruoc(); capNhat(BUOC); REN.ve(1 / 60, 1); } });
      const f = path.join(tmp, `${nhom}_i${s}.png`); await p.screenshot({ path: f, clip }); anh.idle.push(f);
    }
    // hàng 2 (0,25×) và hàng 3 (30 FPS): chạy tới đúng 3 bước trước phát bắn kế tiếp rồi chụp
    for (const kieu of ['cham', 'f30']) {
      const ok = await p.evaluate(() => {
        G.quai.push(...window.__q.filter(E => !G.quai.includes(E))); const T = window.__T; T.cd = 0.5; window.__ban.length = 0;
        // tìm bước bắn bằng 1 lần chạy thử trên bản chép? → đơn giản: chạy từng bước, giữ 3 bước gần nhất trong vòng; khi bắn thì dừng
        return true;
      });
      // chạy tới khi còn ~4 bước nữa là bắn: dò T.cd / tốc bắn (với ụ không đạn thường: dò T.nap / T.sang)
      await p.evaluate(() => {
        const T = window.__T, sk = SKILLS[T.id];
        for (let k = 0; k < 900; k++) {
          const r = typeof tocU === 'function' ? tocU(T) : 1;
          if (sk.dmg && !sk.capNhat && T.muc && T.cd > 0 && T.cd / r < 4.5 * BUOC) break;
          if ((sk.capNhat || !sk.dmg) && T.nap != null && T.nap > 0.985 - 4 * BUOC / 7) break;
          chupTruoc(); capNhat(BUOC);
        }
      });
      const n = kieu === 'cham' ? 72 : 12, sub = kieu === 'cham' ? 4 : 0.5; // 0,25×: 4 khung vẽ / bước luật · 30 FPS: 1 khung / 2 bước
      for (let i = 0; i < n; i++) {
        await p.evaluate(([i, sub]) => {
          if (sub >= 1) { if (i % sub === 0) { chupTruoc(); capNhat(BUOC); } FX.capNhat(BUOC / sub); REN.ve(BUOC / sub, ((i % sub) + 1) / sub); }
          else { for (let k = 0; k < 2; k++) { chupTruoc(); capNhat(BUOC); } FX.capNhat(BUOC * 2); REN.ve(BUOC * 2, 1); }
        }, [i, sub]);
        if (kieu === 'cham' && i % 3) continue; // 0,25×: giữ 1/3 khung (mỗi 12,5 ms) cho dải gọn
        const f = path.join(tmp, `${nhom}_${kieu}${i}.png`); await p.screenshot({ path: f, clip }); anh[kieu].push(f);
      }
    }
    ketQua[nhom] = { id, ban: await p.evaluate(() => window.__ban.length) };
    const ra = path.join(OUT, `dai_${nhom}.png`);
    execFileSync('python3', ['-c', `
import sys, json
from PIL import Image, ImageDraw
rows = json.loads(sys.argv[1]); out = sys.argv[2]
ims = [[Image.open(f).convert('RGB') for f in r] for r in rows]
w, h = ims[0][0].size; s = 0.75
tw, th = int(w * s), int(h * s)
cols = max(len(r) for r in ims)
sheet = Image.new('RGB', (cols * tw, len(ims) * th), (16, 16, 18))
for y, r in enumerate(ims):
  for x, im in enumerate(r): sheet.paste(im.resize((tw, th), Image.LANCZOS), (x * tw, y * th))
sheet.save(out, optimize=True)
`, JSON.stringify([anh.idle, anh.cham, anh.f30]), ra]);
    console.log(nhom, id, 'khung', anh.idle.length, anh.cham.length, anh.f30.length, '→', path.relative(process.cwd(), ra));
  }
  await p.evaluate(() => { if (window.__g0) window.giat = window.__g0; G.dung = false; });
  console.log(JSON.stringify({ ketQua, errs }));
  await b.close();
})();
