// KIỂM ĐỘ RỐI "15 Ụ CÙNG BẮN" (báo cáo ChatGPT V3 mục XXVII, kịch bản A/B)
//  A: 15 Liên Thanh 3★ bắn nhanh + quái đông · B: Tesla + Laser + Hố Đen + Độc + Băng (mỗi loại 3 ụ, 3★)
//  Chạy luật theo bước cố định (chupTruoc + capNhat(BUOC)), vẽ mỗi bước như 60 FPS, chụp 8 khung (mỗi 0,5 s) ở iPhone 13
//  + đo mỗi khung: số dải nổ / hạt / chữ nổi đang sống, thời gian vẽ 1 khung (ms). Chỉ ĐỌC game, không đổi luật.
//  Ra: docs/demo-hop-tuong/tuvan/vfx15/<kich-ban>.png (lưới 4×2 khung) + so-lieu.json + SO-LIEU.md
//  Chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-15u.js [A,B] [BASE]
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { chromium, devices } = require('playwright');
const CHON = (process.argv[2] || 'A,B').split(',');
const BASE = process.argv[3] || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || path.join(__dirname, '..', 'docs', 'demo-hop-tuong', 'tuvan', 'vfx15');
const KB = {
  A: { ten: '15 Liên Thanh bắn nhanh', deck: 'lien,canon,set,laser,mana', o: Array(15).fill('lien') },
  B: { ten: 'Tesla + Laser + Hố Đen + Độc + Băng', deck: 'set,laser,blackhole,doc,bang',
    o: ['set', 'laser', 'blackhole', 'doc', 'bang', 'laser', 'blackhole', 'doc', 'bang', 'set', 'blackhole', 'doc', 'bang', 'set', 'laser'] },
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vfx15-'));
  const b = await chromium.launch(), soLieu = {};
  for (const k of CHON) {
    const kb = KB[k]; if (!kb) continue;
    const p = await b.newPage({ ...devices['iPhone 13'] }), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(`${BASE}?mode=solo&deck=${kb.deck}&wave=8&mana=99999&notut=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho && typeof REN !== 'undefined', null, { timeout: 60000 });
    await p.waitForTimeout(5000);
    // dựng bàn: 15 ụ 3★ theo kịch bản + 24 quái trâu ĐỨNG rải đều dọc đường
    const clip = await p.evaluate((ds) => {
      for (const e of document.querySelectorAll('#nd-gt,#hd')) e.remove();
      G.dung = true; const B = G.ban[0], p0 = G.duong.find(q => q.ban === B.i) || G.duong[0];
      G.quai.length = 0; G.dan.length = 0; FX.reset(); B.tim = 1e9;
      for (let o = 0; o < 15; o++) { const T = sinhU(taoU(B, ds[o], 3, o)); T.goc = -Math.PI / 2; B.t[o] = T; }
      for (let i = 0; i < 24; i++) { const E = sinhQuai('bo', 0, p0.len * (0.05 + i * 0.035), 1e9); E.vao = 1; E.max = E.hp; [E.x, E.y, E.goc] = viTri(p0, E.s); E.v = 0; if (E.d) E.d = Object.assign({}, E.d, { v: 0 }); } // đứng rải đều: không dồn về lõi (tránh lớp cảnh báo thua làm nhiễu ảnh)
      for (let k = 0; k < 240; k++) { chupTruoc(); capNhat(BUOC); } // chạy trước 4 s để mọi ụ vào nhịp bắn
      REN.ve(1 / 60, 1);
      const r = REN.cv.getBoundingClientRect(), kk = r.width / W;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of B.o) { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x); y1 = Math.max(y1, c.y); }
      const m = Math.min(B.cw, B.ch) * 1.6; // gồm đường quái quanh bàn
      return { x: Math.max(0, Math.round(r.left + (x0 - m) * kk)), y: Math.max(0, Math.round(r.top + (y0 - m) * kk)), width: Math.round((x1 - x0 + 2 * m) * kk), height: Math.round((y1 - y0 + 2 * m) * kk) };
    }, kb.o);
    const khung = [], so = [];
    for (let f = 0; f < 8; f++) {
      const s = await p.evaluate(() => {
        let ms = 0, nAnim = 0, nHat = 0, nChu = 0;
        for (let k = 0; k < 30; k++) {
          chupTruoc(); capNhat(BUOC);
          const t0 = performance.now(); REN.ve(1 / 60, 1); ms = Math.max(ms, performance.now() - t0);
          nAnim = Math.max(nAnim, FX.anim.length); nHat = Math.max(nHat, FX.hat.length); nChu = Math.max(nChu, FX.chu.length);
        }
        return { ms: Math.round(ms * 10) / 10, anim: nAnim, hat: nHat, chu: nChu, quai: G.quai.length };
      });
      const fp = path.join(tmp, `${k}_${f}.png`); await p.screenshot({ path: fp, clip }); khung.push(fp); so.push(s);
    }
    soLieu[k] = { ten: kb.ten, khung: so, loiTrang: errs.slice(0, 3) };
    execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw, ImageFont
fs = sys.argv[2:]; ims = [Image.open(f).convert('RGB') for f in fs]; w, h = ims[0].size
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf', 22)
out = Image.new('RGB', (4 * w + 30, 2 * (h + 30) + 10), (20, 22, 26)); d = ImageDraw.Draw(out)
for i, im in enumerate(ims):
    x = 6 + (i % 4) * (w + 6); y = 6 + (i // 4) * (h + 30)
    out.paste(im, (x, y)); d.text((x + 4, y + h + 2), f't = {4 + (i + 1) * 0.5:.1f} s', font=f, fill=(220, 220, 220))
out.save(sys.argv[1], optimize=True)`, path.join(OUT, `${k}.png`), ...khung]);
    await p.close();
    console.log(`${k} (${kb.ten}): dải nổ tối đa ${Math.max(...so.map(s => s.anim))} · hạt ${Math.max(...so.map(s => s.hat))} · chữ ${Math.max(...so.map(s => s.chu))} · vẽ chậm nhất ${Math.max(...so.map(s => s.ms))} ms · lỗi trang ${errs.length}`);
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'so-lieu.json'), JSON.stringify(soLieu, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
