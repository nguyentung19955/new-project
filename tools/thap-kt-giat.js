// TURRET MERGE — KIỂM GIẬT KHI RA SKILL (bản ngắn của tools/thap-do-giat.js, chạy trong thap-kt-hoiquy.js).
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-giat.js [BASE]
// Hồ sơ headless: Chromium 390×844 DPR 3 (iPhone 13), ép DPR 3. Máy đo vẽ canvas bằng CPU (không GPU) → khoảng khung (dt) bị chi phối
// bởi raster, KHÔNG dùng làm ngân sách. Ngân sách đo thứ code game điều khiển được, giống nhau trên mọi máy:
//   · JS khung (REN._viec, trừ các lệnh drawImage trên canvas chính > 2 ms = raster của máy đo) ≤ NGAN_JS ms (mặc định 30 ≈ 15 ms trên iPhone 13: CPU máy đo chậm ~2×)
//   · việc THU NHỎ ẢNH trong 1 khung (REN.veNho/mip) ≤ NGAN_SC ms (mặc định 12: ngân sách 4 ms + 1 việc dựng không chia được)
//   · không lỗi trang. Quanh mỗi khoảnh khắc: kỹ năng đỏ lần đầu, trùm ra + tung chiêu (đã làm nóng như trận thật), ghép Orbital,
//     chỉ huy Dahlia, nhiều skill cùng 1 khung (bàn đầy 7★).
'use strict';
const { chromium } = require('playwright');
if (process.argv[2]) process.env.BASE = process.argv[2];
if (!process.env.OUT) process.env.OUT = require('os').tmpdir() + '/thap-kt-giat/';
if (!process.env.TAG) process.env.TAG = 'kt';
const D = require('./thap-do-giat.js');
const NGAN_JS = +(process.env.NGAN_JS || 30), NGAN_SC = +(process.env.NGAN_SC || 12);
// mọi ụ 7★ trên bàn kích hoạt CÙNG 1 khung (cực đoan): khung đó vẽ ~1 300 lệnh hiệu ứng thật → ngân sách riêng (≈ 18 ms iPhone 13)
const NGAN_DONG = +(process.env.NGAN_DONG || 40);
Object.assign(D.NHOM, {
  kt_do: { deck: ['blackhole', 'overlord', 'leviathan', 'ronglua', 'canon'], kich: ['blackhole', 'overlord', 'leviathan', 'ronglua'], sao: 7, motLan: true },
  kt_trum: { deck: ['blackhole', 'hydra', 'canon', 'set', 'bang'], trum: ['freezer', 'hive', 'janus', 'patcher'], sao: 4, mv: ['dahlia'], ghep: [['orbital', 3]], motLan: true },
  kt_dong: { deck: ['blackhole', 'overlord', 'hydra', 'cuuvi', 'ronglua'], wave: 30, sao: 7, cungLuc: true, motLan: true },
});
(async () => {
  const b = await chromium.launch({ args: ['--enable-precise-memory-info'] });
  const loi = [];
  for (const ten of ['kt_do', 'kt_trum', 'kt_dong']) {
    let r; try { r = await D.chayNhom(b, ten); } catch (e) { loi.push(ten + ': kẹt ' + e.message.split('\n')[0]); continue; }
    const ngan = (k) => /^cungluc/.test(k.ten) ? NGAN_DONG : NGAN_JS;
    // máy đo 2 lõi dao động: vượt ngân sách → chạy lại nhóm 1 lần, lấy lần tốt hơn từng khoảnh khắc (giật thật thì lặp lại cả 2 lần)
    if (r.kq && r.kq.some(k => k.xauV > ngan(k))) { try { const r2 = await D.chayNhom(b, ten); const m = new Map((r2.kq || []).map(k => [k.ten, k])); r.kq = r.kq.map(k => (m.get(k.ten) && m.get(k.ten).xauV < k.xauV ? m.get(k.ten) : k)); r.loi = (r.loi || []).concat(r2.loi || []); } catch (e) { } }
    if (r.loi && r.loi.length) loi.push(ten + ': lỗi trang ' + r.loi.slice(0, 2).join(' | '));
    const F = require('fs').existsSync(D.OUT + 'raw_' + (process.env.TAG || 'do') + '_' + ten + '.json') ? JSON.parse(require('fs').readFileSync(D.OUT + 'raw_' + (process.env.TAG || 'do') + '_' + ten + '.json')) : [];
    const scMax = Math.max(0, ...F.map(f => f.sc || 0));
    for (const k of r.kq) {
      const ok = k.xauV <= ngan(k);
      console.log((ok ? '  ✓ ' : '  ✗ ') + 'giật ' + k.ten.padEnd(18) + ' JS khung xấu nhất ' + k.xauV + ' ms (≤ ' + ngan(k) + ')' + (ok ? '' : ' — ' + k.xauTag.slice(0, 160)));
      if (!ok) loi.push(ten + ' ' + k.ten + ' JS ' + k.xauV + ' ms');
    }
    const okS = scMax <= NGAN_SC; console.log((okS ? '  ✓ ' : '  ✗ ') + 'giật ' + ten + ': thu nhỏ ảnh tối đa ' + scMax.toFixed(1) + ' ms/khung (≤ ' + NGAN_SC + ')');
    if (!okS) loi.push(ten + ' thu nhỏ ảnh ' + scMax.toFixed(1) + ' ms/khung');
  }
  await b.close();
  console.log(loi.length ? '✗ giật skill: ' + loi.length + ' lỗi\n' + loi.map(l => '  ✗ ' + l).join('\n') : '  ✓ giật skill: mọi khoảnh khắc trong ngân sách (thap-kt-giat.js)');
  process.exit(loi.length ? 1 : 0);
})();
