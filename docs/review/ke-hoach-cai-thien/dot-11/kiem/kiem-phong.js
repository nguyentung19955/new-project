// Kiểm Đợt 11 (trang Tách Phòng): lô gộp cửa 3 vùng. Chạy: node kiem-phong.js <trang mới> <trang cũ> <thư mục ảnh> <thư mục ra>
const { chromium } = require('playwright'), fs = require('fs'), crypto = require('crypto');
const [MOI, CU, ANH, RA] = process.argv.slice(2);
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const KQ = { ok: 0, hong: 0, muc: [] };
const kiem = (ten, dat, them) => { KQ[dat ? 'ok' : 'hong']++; KQ.muc.push({ ten, dat, them }); console.log((dat ? 'ĐẠT  ' : 'HỎNG ') + ten + (them ? '  | ' + them : '')); };
(async () => {
  const b = await chromium.launch(), loi = [];
  const mo = async (tep) => { const p = await b.newPage({ viewport: { width: 1100, height: 1400 } }); p.on('pageerror', (e) => loi.push(tep.split('/').pop() + ': ' + e.message)); await p.route(/^https?:/, (r) => r.abort()); await p.goto('file://' + tep); await p.waitForTimeout(300); return p; };
  const pm = await mo(MOI), pc = await mo(CU);
  const dsLo = (p) => p.evaluate(() => LO.map((l) => ({ id: l.id, ten: l.ten, n: l.ds.length, prompt: taoPrompt(l) })));
  const lm = await dsLo(pm), lc = await dsLo(pc);
  kiem(`Các lô cũ giữ nguyên thứ tự, tên và prompt (${lc.length} lô)`, lc.every((l, i) => lm[i] && lm[i].id === l.id && lm[i].ten === l.ten && lm[i].prompt === l.prompt), sha(JSON.stringify(lc)) + ' = ' + sha(JSON.stringify(lm.slice(0, lc.length))));
  kiem('Thêm đúng 1 lô mới ở cuối danh sách: cua-gop, 18 hình', lm.length === lc.length + 1 && lm[lm.length - 1].id === 'cua-gop' && lm[lm.length - 1].n === 18, lm[lm.length - 1].ten);
  const G = await pm.evaluate(() => { const l = LO.find((x) => x.id === 'cua-gop'); return { cot: l.cot, hang: l.hang, ds: l.ds.map((m) => ({ ma: m.ma, ten: m.ten, w: m.w, h: m.h, mo: m.mo })), prompt: taoPrompt(l) }; });
  const le = await pm.evaluate(() => LO.filter((l) => l.cua).flatMap((l) => l.ds.map((m) => ({ ma: m.ma, w: m.w, h: m.h, mo: m.mo }))));
  kiem('Lô gộp có đủ 18 mã của 3 lô lẻ, cùng cỡ', le.length === 18 && le.every((m) => G.ds.some((g) => g.ma === m.ma && g.w === m.w && g.h === m.h)));
  const soO = G.ds.map((g, i) => { const m = /ở ô (\d+)/.exec(g.mo); return m ? [i + 1, +m[1]] : null; }).filter(Boolean);
  kiem('Câu "ĐÚNG … ở ô N" của cửa khoá trỏ đúng ô cửa mở cùng hàng (ô khoá − 3)', soO.length === 9 && soO.every(([o, n]) => n === o - 3), JSON.stringify(soO));
  kiem('Prompt lô gộp: 6 cột × 3 hàng = 18 ô, đủ 18 ô, một đoạn BẢNG MÀU, một câu nền', G.prompt.includes('6 cột × 3 hàng = 18 ô') && G.ds.every((g, i) => G.prompt.includes(`ô ${i + 1}: `) && G.prompt.includes(g.ten) && G.prompt.includes(`Ô ${i + 1}: ${g.mo}.`)) && (G.prompt.match(/BẢNG MÀU \(/g) || []).length === 1 && (G.prompt.match(/Nền trơn MỘT MÀU/g) || []).length === 1, 'dài ' + G.prompt.length + ' ký tự');
  fs.writeFileSync(RA + '/prompt-cua-gop.txt', G.prompt);
  // tách ảnh thử
  const chay = async (p, id, png) => {
    const i = await p.evaluate((id) => LO.findIndex((l) => l.id === id), id); await p.selectOption('#chonLo', String(i)); await p.waitForTimeout(200);
    await p.setInputFiles('#chonAnh', png); await p.waitForFunction(() => !document.getElementById('buoc3').hidden, null, { timeout: 60000 }); await p.waitForTimeout(600);
    return p.evaluate(() => { const ds = L.ds.map((m, i) => i).filter((i) => KQ[i]); const hb = haiBan(ds); return { co: ds.length, tong: L.ds.length, hb, the: (document.getElementById('theKq') || {}).textContent, kiem: [...document.querySelectorAll('#dsKiem li')].map((e) => (e.classList.contains('loi') ? '✘ ' : '') + e.textContent) }; });
  };
  const X = await chay(pm, 'cua-gop', ANH + '/cua-gop.png');
  await pm.screenshot({ path: RA + '/trang-phong-cua-gop.png', fullPage: true });
  fs.writeFileSync(RA + '/phong-gop.json', JSON.stringify({ co: X.co, tong: X.tong, the: X.the, kiem: X.kiem, khoa: Object.keys(X.hb) }, null, 1));
  const tep = (hb) => { const ra = {}; for (const [nhom, duoi] of [['gap', '@2'], ['thuong', '']]) for (const j of Object.values(hb[nhom])) { const o = JSON.parse(j); ra[o.ma + duoi] = o; } return ra; };
  const TG = tep(X.hb);
  kiem('Lô gộp: tìm đủ 18/18 hình trên tấm 6×3', X.co === 18 && X.tong === 18, `${X.co}/${X.tong} · thẻ: ${X.the} · lỗi: ${X.kiem.filter((k) => k.startsWith('✘')).join(' / ') || 'không'}`);
  kiem('Lô gộp: tệp ra đúng 18 mã × 2 độ nét, kiểu giao-dien', Object.keys(TG).length === 36 && G.ds.every((g) => TG[g.ma + '@2'] && TG[g.ma] && TG[g.ma].doi_tuong === 'giao-dien'), Object.keys(TG).length + ' tệp');
  let giong = 0, giongCu = 0, tong = 0; const lech = [];
  for (const v of ['rung', 'bien', 'lau']) {
    const a = tep((await chay(pm, 'cua-' + v, `${ANH}/cua-${v}.png`)).hb), c = tep((await chay(pc, 'cua-' + v, `${ANH}/cua-${v}.png`)).hb);
    for (const k of Object.keys(a)) { tong++; if (JSON.stringify(a[k]) === JSON.stringify(TG[k])) giong++; else lech.push(k + (TG[k] ? ` (gộp ${TG[k].rong}×${TG[k].cao}, lẻ ${a[k].rong}×${a[k].cao})` : ' (thiếu)')); if (JSON.stringify(a[k]) === JSON.stringify(c[k])) giongCu++; }
  }
  kiem(`Hình của lô gộp = hình của 3 lô lẻ cùng hình vẽ (tệp giống từng byte), ${tong} tệp`, giong === tong && tong === 36, giong + '/' + tong + (lech.length ? ' · lệch: ' + lech.slice(0, 6).join(', ') : ''));
  kiem(`3 lô lẻ: trang mới = trang cũ (tệp giống từng byte), ${tong} tệp`, giongCu === tong, giongCu + '/' + tong);
  kiem('Không có lỗi JavaScript trên trang', !loi.length, loi.join(' | '));
  fs.writeFileSync(RA + '/ket-qua-phong.json', JSON.stringify(KQ, null, 1));
  console.log(`\nTỔNG: ${KQ.ok} đạt, ${KQ.hong} hỏng`);
  await b.close(); process.exit(KQ.hong ? 1 : 0);
})();
