// KIỂM NHẬN DIỆN SILHOUETTE 93 Ụ (TURRET_MERGE_BAO_CAO_V2 mục II "Quy tắc kiểm tra nhận diện" + X.P0.4)
//  Vẽ từng ụ bằng chính REN.veU của game (1★, không huy hiệu / sao / hiệu ứng) ở ĐÚNG cỡ ô thật trên iPhone 13 (390×844, DPR 3),
//  rồi xuất: từng ô PNG + tấm ghép màu + tấm ghép xám (grayscale) + bảng cặp dễ nhầm (so hình dáng bằng mặt nạ alpha + độ sáng xám).
//  Ra: docs/demo-hop-tuong/tuvan/nhandien/  (o/<id>.png · BANG-MAU.png · BANG-XAM.png · cap.json) → python tools/thap-nhandien-bang.py ghép + chấm điểm
//  Chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nhandien.js [BASE]
//  Chỉ ĐỌC game (không ghi js/ assets/), không đổi luật.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/';
// BE=rieng → thử nghiệm: thay BỆ CHUNG bằng bệ riêng <id>_de.png có sẵn (64/93 ụ) — chỉ trong trang chụp, KHÔNG sửa game
const BE = process.env.BE === 'rieng' ? 'rieng' : 'chung';
const OUT = path.join(__dirname, '..', 'docs', 'demo-hop-tuong', 'tuvan', 'nhandien', BE === 'rieng' ? 'be-rieng' : '');
(async () => {
  fs.mkdirSync(path.join(OUT, 'o'), { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ ...devices['iPhone 13'] }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}?mode=solo&deck=canon,lien,set,laser,mana&wave=1&mana=99999&notut=1`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && !TAI.cho && typeof REN !== 'undefined' && REN.s, null, { timeout: 60000 });
  await p.waitForTimeout(4000);
  // danh sách ụ = mọi id trong SKILLS có ảnh đầu súng (bỏ id nội bộ)
  const ids = await p.evaluate(() => { G.dung = true; return (window.ROSTER_EMBED || []).map(r => r.id).filter(id => SKILLS[id]); });
  // nạp trước mọi ảnh thân/đầu (REN.co trả null khi chưa tải xong) — vẽ thử 2 vòng có chờ
  if (BE === 'rieng') await p.evaluate(() => {
    const than0 = REN.than, img0 = REN.img;
    REN.than = function (T, S, da, bong) {
      const ten = T.id + '_de'; this.donCache();
      this.img = function (n) { if (n === 'de_chung') { const a = img0.call(this, ten); if (a) return a; if (this.anh[ten] && this.anh[ten]._loi) return img0.call(this, n); return null; } return img0.call(this, n); };
      try { return than0.call(this, T, S, da, bong); } finally { this.img = img0; }
    };
  });
  const veMot = async (id) => p.evaluate((id) => {
    const B = G.ban[0], S = Math.min(B.cw, B.ch); // cỡ ô logic
    const k = REN.s * REN.dpr, cssPx = S * REN.s; // điểm ảnh thật / CSS px của 1 ô trên máy
    const N = Math.round(S * 1.1 * k), cv = document.createElement('canvas'); cv.width = cv.height = N;
    const ctx = cv.getContext('2d'); ctx.setTransform(k, 0, 0, k, 0, 0);
    let T; try { T = sinhU(taoU(B, id, 1, 7)); } catch (e) { return { loi: String(e) }; }
    T.goc = -Math.PI / 2; T.st = T.st || {};
    try { REN.veU(ctx, T, S * 0.55, S * 0.55, { ghost: true, noBadge: true }); } catch (e) { return { loi: String(e) }; }
    const r = (window.ROSTER_EMBED || []).find(q => q.id === id) || {}, sk = SKILLS[id] || {};
    return { url: cv.toDataURL('image/png'), cssPx: Math.round(cssPx * 10) / 10, N, ten: r.ten_vi || r.ten || id, tenEn: r.ten || id, vai: sk.vai || r.vai || '', bac: r.bac || '' };
  }, id);
  for (const id of ids) await veMot(id); // vòng 1: kích tải ảnh
  await p.waitForTimeout(5000);
  await p.evaluate(() => REN.donCache && REN.donCache());
  for (const id of ids) await veMot(id);
  await p.waitForTimeout(3000);
  const meta = [];
  for (const id of ids) {
    const r = await veMot(id);
    if (!r || r.loi) { meta.push({ id, loi: r && r.loi }); continue; }
    fs.writeFileSync(path.join(OUT, 'o', id + '.png'), Buffer.from(r.url.split(',')[1], 'base64'));
    meta.push({ id, be: BE, ten: r.ten, tenEn: r.tenEn, vai: r.vai, bac: r.bac, cssPx: r.cssPx, N: r.N });
  }
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
  await b.close();
  console.log(`ụ: ${meta.length} · lỗi vẽ: ${meta.filter(m => m.loi).length} · cỡ ô CSS: ${(meta.find(m => m.cssPx) || {}).cssPx}px · lỗi trang: ${errs.length}`);
  if (errs.length) console.log(errs.slice(0, 5).join('\n'));
  execFileSync('python3', [path.join(__dirname, 'thap-nhandien-bang.py'), OUT], { stdio: 'inherit' });
})().catch(e => { console.error(e); process.exit(1); });
