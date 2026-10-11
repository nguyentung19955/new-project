// Kiểm Đợt 11 (trang Tách Hiệu Ứng): lô gộp ra đúng tệp; hàng của lô = dải lẻ cùng hình; đường gen lẻ cũ không đổi; prompt lẻ không đổi.
// Chạy: NODE_PATH=$(npm root -g) node kiem.js <tệp trang mới> <tệp trang cũ> <thư mục ảnh> <thư mục ra>
const { chromium } = require('playwright'), fs = require('fs'), crypto = require('crypto');
const [MOI, CU, ANH, RA] = process.argv.slice(2);
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const KQ = { ok: 0, hong: 0, muc: [] };
const kiem = (ten, dat, them) => { KQ[dat ? 'ok' : 'hong']++; KQ.muc.push({ ten, dat, them }); console.log((dat ? 'ĐẠT  ' : 'HỎNG ') + ten + (them ? '  | ' + them : '')); };
(async () => {
  const b = await chromium.launch(), loi = [];
  const mo = async (tep) => { const p = await b.newPage({ viewport: { width: 1100, height: 1400 } }); p.on('pageerror', (e) => loi.push(tep.split('/').pop() + ': ' + e.message)); await p.route(/^https?:/, (r) => (/jszip/.test(r.request().url()) && process.env.JSZIP ? r.fulfill({ path: process.env.JSZIP, contentType: 'application/javascript' }) : r.abort())); await p.goto('file://' + tep); return p; };
  const chon = (p, v) => p.evaluate((v) => { const o = document.getElementById('chonHu'); o.value = v; o.dispatchEvent(new Event('change')); return o.value; }, String(v));
  const nap = async (p, png) => { await p.setInputFiles('#chonAnh', png); await p.waitForFunction(() => !document.getElementById('buoc3').hidden); await p.waitForTimeout(150); };
  const xuatLe = (p) => p.evaluate(() => { const ra = {}; for (const [n, m] of [['2', '48'], ['1', '32']]) { document.getElementById('heNet').value = n; document.getElementById('soMau').value = m; chay(); ra[n] = Object.assign(taoTep(), { dat: KQ.dat }); } return ra; });
  const xuatLo = (p) => p.evaluate(() => { const ra = {}; for (const [n, m] of [['2', '48'], ['1', '32']]) { document.getElementById('heNet').value = n; document.getElementById('soMau').value = m; chay(); ra[n] = KQL.map((h) => (h.R ? Object.assign(taoTep(h.q, h.R.kq), { dat: h.R.kq.dat, kiem: h.R.muc.filter((x) => !x[1]).map((x) => x[0]) }) : null)); } return { ra, tt: document.getElementById('ttLo').textContent }; });

  // ---------- 1. Prompt gen lẻ: trang mới = trang cũ, mọi mục × mọi bản màu ----------
  const pm = await mo(MOI), pc = await mo(CU);
  const moiP = await pm.evaluate(() => { const ra = {}; HU.forEach((q, i) => { for (const b of BAN_MAU) { const r = taoQ(i, b.k); if (b.k && !r.coBan) continue; ra[r.q.ma] = taoPrompt(r.q); } }); return ra; });
  const cuP = await pc.evaluate(() => { const ra = {}, o = document.getElementById('chonHu'); HU.forEach((q, i) => { for (const b of BAN_MAU) { chonHu(i, b.k); if (b.k && document.getElementById('oBanMau').hidden) continue; ra[Q.ma] = taoPrompt(Q); } }); return ra; });
  const khac = Object.keys(cuP).filter((k) => cuP[k] !== moiP[k]);
  kiem(`Prompt gen lẻ không đổi (${Object.keys(cuP).length} prompt: mọi mục × bản màu)`, !khac.length && Object.keys(cuP).length === Object.keys(moiP).length, khac.join(',') || sha(JSON.stringify(cuP)) + ' = ' + sha(JSON.stringify(moiP)));
  // prompt hiện trên trang khi chọn mục lẻ (đi qua ô chọn như người dùng)
  const soMuc = await pm.evaluate(() => HU.length); let lechTrang = 0;
  for (let i = 0; i < soMuc; i++) { await chon(pm, i); const t = await pm.evaluate(() => [Q.ma, document.getElementById('oPrompt').value]); if (cuP[t[0]] !== t[1]) lechTrang++; }
  kiem(`Ô prompt trên trang khi chọn từng mục lẻ = prompt cũ (${soMuc} mục)`, lechTrang === 0, lechTrang + ' mục lệch');

  // ---------- 2. Ô chọn: nhóm Lô gộp ở đầu ----------
  const nhom = await pm.evaluate(() => [...document.getElementById('chonHu').children].map((g) => [g.tagName, g.label, g.children.length, g.children[0].value]));
  kiem('Nhóm "Lô gộp" đứng đầu ô chọn, nhóm gen lẻ còn đủ', nhom[0][0] === 'OPTGROUP' && /Lô gộp/.test(nhom[0][1]) && nhom[0][3] === 'lo:0' && nhom[1][2] === soMuc, JSON.stringify(nhom.map((n) => n.slice(1, 3))));
  const lo = await pm.evaluate(() => LO_DS.map((L, k) => { const K = khoLo(L); return { k, id: L.id, ten: L.ten, so: L.so, nen: L.nen, hang: L.q.map((q) => ({ ma: q.ma, ten: q.ten, fw: q.fw, fh: q.fh, so: q.so, nen: q.nen, cong: !!q.cong })), kho: K.ten, w: K.w, h: K.h, phong: +K.phong.toFixed(2), prompt: taoPromptLo(L) }; }));
  const bo = await pm.evaluate(() => LO_GOP.filter((L) => L.loi).map((L) => L.id + ': ' + L.loi));
  kiem(`Cả ${lo.length} lô gộp hợp lệ (cùng số khung, cùng nền, ≤ 8 hàng)`, !bo.length && lo.every((L) => L.hang.every((h) => h.so === L.so && h.nen === L.nen) && L.hang.length <= 8), bo.join('; '));
  const thieu = lo.filter((L) => { const p = L.prompt; return !L.hang.every((h, i) => p.includes(`HÀNG ${i + 1}, hiệu ứng "${h.ten}"`) && p.includes(`hàng ${i + 1}: "${h.ten}"`)) || !p.includes(`${L.so} cột × ${L.hang.length} hàng = ${L.so * L.hang.length} ô`) || (p.match(/BẢNG MÀU \(/g) || []).length > 1 || (p.match(/Nền trơn MỘT MÀU/g) || []).length !== 1; });
  kiem('Prompt mỗi lô có đủ từng hàng, đúng số cột × hàng, BẢNG MÀU không quá 1 lần, một câu nền', !thieu.length, thieu.map((L) => L.id).join(','));
  // các đoạn mô tả của từng mục có nguyên văn trong prompt lô
  const nguyen = await pm.evaluate(() => LO_DS.filter((L) => { const p = taoPromptLo(L); return !L.q.every((q) => ['mo', 'thoi', 'dat', 'la', 'huong'].every((k) => !q[k] || p.includes(q[k])) && (!cauMau(q) || p.includes(cauMau(q)))); }).map((L) => L.id));
  kiem('Prompt lô chép nguyên văn mo / thoi / dat / la / huong và câu MÀU của từng mục', !nguyen.length, nguyen.join(','));
  fs.writeFileSync(RA + '/lo.json', JSON.stringify(lo, null, 1));

  // ---------- 3. Lô 4 hàng × 4 cột (b1-tron-hong) ----------
  const kLo = lo.find((L) => L.id === 'b1-tron-hong');
  await chon(pm, 'lo:' + kLo.k); await nap(pm, ANH + '/lo-4x4.png');
  const X = await xuatLo(pm);
  const dung = X.ra['2'].every((t, i) => t && t.ma === kLo.hang[i].ma && t.khung_rong === kLo.hang[i].fw && t.khung_cao === kLo.hang[i].fh && t.so === 4 && t.net === 2 && t.dat) && X.ra['1'].every((t, i) => t && t.ma === kLo.hang[i].ma && !t.net && t.dat);
  kiem('Lô 4×4: ra 4 tệp đúng mã, đúng cỡ khung, đúng số khung, cả 4 hàng ĐẠT', dung, X.ra['2'].map((t) => t && `${t.ma} ${t.khung_rong}×${t.khung_cao}×${t.so}${t.dat ? '' : ' LỖI:' + t.kiem.join('/')}`).join(' · ') + ' | ' + X.tt);
  // cỡ thật của tấm trong tệp
  const coTam = await pm.evaluate(async (ds) => Promise.all(ds.map((u) => new Promise((ok) => { const im = new Image(); im.onload = () => ok([im.naturalWidth, im.naturalHeight]); im.src = u; }))), X.ra['2'].map((t) => t.tam));
  kiem('Lô 4×4: ảnh trong tệp đúng cỡ (rộng khung × số khung × 2, cao khung × 2)', coTam.every(([w, h], i) => w === kLo.hang[i].fw * 4 * 2 && h === kLo.hang[i].fh * 2), JSON.stringify(coTam));
  await pm.screenshot({ path: RA + '/trang-lo-4x4.png', fullPage: true });
  // so từng hàng với dải lẻ cùng hình (trang MỚI, đường gen lẻ) và với trang CŨ
  const soLe = async (L, X, tienTo) => {
    let giongLe = 0, giongCu = 0; const soSanh = [], n = L.hang.length;
    for (let i = 0; i < n; i++) {
      const iHU = await pm.evaluate((ma) => HU.findIndex((q) => q.ma === ma), L.hang[i].ma);
      await chon(pm, iHU); await nap(pm, `${ANH}/${tienTo}-${i + 1}.png`); const le = await xuatLe(pm);
      await chon(pc, iHU); await nap(pc, `${ANH}/${tienTo}-${i + 1}.png`); const cu = await xuatLe(pc);
      const bo = (t) => { const o = Object.assign({}, t); delete o.kiem; return JSON.stringify(o); };
      const a = ['2', '1'].every((m) => bo(X.ra[m][i]) === bo(le[m])), c = ['2', '1'].every((m) => bo(le[m]) === bo(cu[m]));
      giongLe += a; giongCu += c; soSanh.push(`${L.hang[i].ma}: lô ${sha(bo(X.ra['2'][i]))} / lẻ mới ${sha(bo(le['2']))} / lẻ cũ ${sha(bo(cu['2']))}`);
    }
    kiem(`Lô ${L.id}: hàng của lô = dải lẻ cùng hình (tệp giống từng byte, cả 2 độ nét), ${n}/${n} hàng`, giongLe === n, soSanh.join(' · '));
    kiem(`Lô ${L.id}: đường gen lẻ trang mới = trang cũ (tệp giống từng byte, cả 2 độ nét), ${n}/${n} dải`, giongCu === n);
  };
  await soLe(kLo, X, 'dai');
  await pm.screenshot({ path: RA + '/trang-gen-le.png', fullPage: true });

  // ---------- 4. Các kiểu ảnh lô khó ----------
  const thu = async (ten, tep, id, mong) => { const L = lo.find((x) => x.id === id); await chon(pm, 'lo:' + L.k); await nap(pm, ANH + '/' + tep); const Y = await xuatLo(pm); const d = Y.ra['2'].map((t) => (t && t.dat ? 1 : 0)); kiem(ten, JSON.stringify(d) === JSON.stringify(mong) && Y.ra['2'].every((t, i) => !t || t.ma === L.hang[i].ma), 'ĐẠT theo hàng: ' + d.join('') + ' | ' + Y.tt); return Y; };
  await thu('Lô 4×4 vạch dày 14 điểm + nhiễu: 4/4 hàng ĐẠT', 'lo-4x4-day.png', 'b1-tron-hong', [1, 1, 1, 1]);
  await thu('Lô 4×4 không kẻ vạch: 4/4 hàng ĐẠT (chia theo khoảng trống)', 'lo-4x4-khong-vach.png', 'b1-tron-hong', [1, 1, 1, 1]);
  await thu('Lô 4×4 lưới không phủ kín ảnh (có lề): 4/4 hàng ĐẠT', 'lo-4x4-co-le.png', 'b1-tron-hong', [1, 1, 1, 1]);
  const Yh = await thu('Lô 4×4 hàng 3 vẽ hỏng (trống): 3 hàng kia vẫn ĐẠT, hàng 3 báo lỗi', 'lo-4x4-hang-3-trong.png', 'b1-tron-hong', [1, 1, 0, 1]);
  const tich = await pm.evaluate(() => [...document.querySelectorAll('#dsHang input')].map((o) => o.checked));
  kiem('Hàng hỏng tự bỏ tích, 3 hàng kia vẫn được tích để tải', JSON.stringify(tich) === '[true,true,false,true]', JSON.stringify(tich));
  await pm.screenshot({ path: RA + '/trang-lo-hang-hong.png', fullPage: true });
  const Y5 = await thu('Lô 5 hàng × 4 cột (b1-dai-hong, ảnh ngang, hình mảnh dài như vạch kẻ): 5/5 hàng ĐẠT', 'lo-4x5.png', 'b1-dai-hong', [1, 1, 1, 1, 1]);
  kiem('Lô 5×4: thân mũi tên mảnh không bị nhận nhầm là vạch kẻ ngang', !/bảng phụ|chia đều/.test(Y5.tt), Y5.tt);
  await soLe(lo.find((x) => x.id === 'b1-dai-hong'), Y5, 'dai5');
  await thu('Lô 2 hàng × 8 cột nền xanh dương (b23-8-khung): 2/2 hàng ĐẠT', 'lo-8x2.png', 'b23-8-khung', [1, 1]);
  await pm.screenshot({ path: RA + '/trang-lo-8x2.png', fullPage: true });

  // ---------- 5. Nút "Tải tất cả (.zip)": bắt tệp tải về (mạng bị chặn nên trang tải rời từng tệp, tên tệp phải đúng mã) ----------
  await chon(pm, 'lo:' + kLo.k); await nap(pm, ANH + '/lo-4x4.png');
  const [dl] = await Promise.all([pm.waitForEvent('download'), pm.click('#nutTaiLo')]);
  const tepZip = RA + '/' + dl.suggestedFilename(); await dl.saveAs(tepZip);
  const z = await require('jszip').loadAsync(fs.readFileSync(tepZip)), tenTep = Object.keys(z.files).sort();
  const mongTen = kLo.hang.flatMap((h) => [h.ma + '.sprite.json', h.ma + '.thuong.sprite.json']).sort();
  let khop = 0; for (const h of kLo.hang) for (const [duoi, m] of [['.sprite.json', '2'], ['.thuong.sprite.json', '1']]) { const t = JSON.parse(await z.file(h.ma + duoi).async('string')), g = X.ra[m].find((x) => x.ma === h.ma); if (t.ma === h.ma && t.tam === g.tam && t.khung_rong === h.fw && t.khung_cao === h.fh && t.so === 4 && (m === '2' ? t.net === 2 : !('net' in t)) && t.loai === 'linh-khi-sprite' && t.doi_tuong === 'hieu-ung') khop++; }
  kiem('Nút "Tải tất cả (.zip)": một tệp zip, đủ 8 tệp (4 mã × 2 độ nét), tên tệp giữ mã cũ, nội dung đúng', /^lo-b1-tron-hong_4-hieu-ung\.zip$/.test(dl.suggestedFilename()) && JSON.stringify(tenTep) === JSON.stringify(mongTen) && khop === 8, dl.suggestedFilename() + ': ' + tenTep.join(', ') + ' | khớp nội dung ' + khop + '/8');
  kiem('Không có lỗi JavaScript trên trang', !loi.length, loi.join(' | '));
  fs.writeFileSync(RA + '/ket-qua.json', JSON.stringify(KQ, null, 1));
  console.log(`\nTỔNG: ${KQ.ok} đạt, ${KQ.hong} hỏng`);
  await b.close(); process.exit(KQ.hong ? 1 : 0);
})();
