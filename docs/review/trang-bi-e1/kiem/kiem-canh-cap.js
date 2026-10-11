// Làn E1 · kiểm "cánh theo cấp" (một lượt Playwright, không phải bộ test dài).
// Chạy từ gốc repo:  NODE_PATH=$(npm root -g) node docs/review/trang-bi-e1/kiem/kiem-canh-cap.js <thư mục chứa linh-khi.html bản TRƯỚC khi sửa>
// Việc làm: (1) bản mới chưa có tệp cánh theo cấp so với bản trước: 0 điểm ảnh khác; (2) dựng ảnh mẫu 4×2 từ 4 cánh cấp 2 (đổi cỡ, đổi màu),
// đưa qua trang Tách Đồ lô "Cánh theo cấp"; (3) nạp TẠM 8 tệp vào game, chụp Cu Tí cấp 1/2/3, đo gốc cánh so với cấp 2; (4) gỡ tệp / tắt cờ: hình về như cũ.
// KHÔNG ghi gì vào game/art/custom.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const GOC = path.resolve(__dirname, '../../../..'), RA = path.resolve(__dirname, '..'), CU = path.resolve(process.argv[2] || '');
const KIEU = ['chuon', 'la', 'lua', 'bang'], TEN = { chuon: 'Chuồn chuồn', la: 'Lá', lua: 'Lửa', bang: 'Băng' };
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

// Chạy trong trang game: vẽ Cu Tí (hoặc bé khác) mang cánh, trả về điểm ảnh từng ô.
const VE = `(() => {
  window.DT = [['idle', { move: false, t: 0.2 }], ['run', { move: true, t: 0.33 }], ['atk', { move: false, atk: 0.45, t: 0.2 }]];
  window.veO = (key, kind, lv, q, W, H) => {
    const cv = document.createElement('canvas'); cv.width = W || 72; cv.height = H || 64; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const w0 = { type: 'sword', family: 0, rarity: 0, marks: { fire: 0, poison: 0, ice: 0 }, sharpen: 0 };
    G.art.hero(g, Object.assign({ x: 42, y: 56, face: 1, key, move: false, atk: -1, dodge: -1, weapon: w0, outfit: { hat: null, robe: null, back: null, hand: null, mask: null, wing: { kind, level: lv } } }, q));
    return cv;
  };
  window.tatCa = (keys) => { const o = {}; for (const key of keys) for (const k of ${JSON.stringify(KIEU)}) for (const lv of [1, 2, 3]) for (const [ten, q] of DT) {
    const cv = veO(key, k, lv, q); o[[key, k, lv, ten].join('|')] = Array.from(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data).join(','); } return o; };
})()`;
const khac = (a, b) => { let n = 0; for (const k in a) if (a[k] !== b[k]) n++; return n; };

(async () => {
  const sv = [spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: GOC, stdio: 'ignore' }), spawn('python3', ['-m', 'http.server', '8766', '--bind', '127.0.0.1'], { cwd: CU, stdio: 'ignore' })];
  await cho(1200);
  const br = await chromium.launch(), kq = { ngay: new Date().toISOString() }, loi = [];
  try {
    const mo = async (url) => { const p = await br.newPage({ viewport: { width: 900, height: 1400 } }); p.on('pageerror', (e) => loi.push(url + ': ' + e.message)); await p.goto(url); return p; };
    const sanSang = (p) => p.waitForFunction(() => window.G && G.spriteCustom && G.art && G.art.hero && ['chuon', 'la', 'lua', 'bang'].every((k) => { const s = G.spriteCustom.do['tp-wings-' + k]; return s && s.ready; }) && G.spriteCustom.do['em-be-smith'] !== null, null, { timeout: 60000 });
    const KEYS = ['smith', 'hunter', 'healer', 'wrestler'];

    // (1) bản trước và bản mới, chưa có tệp theo cấp
    const cu = await mo('http://127.0.0.1:8766/linh-khi.html?cloud=0'); await sanSang(cu); await cho(1500); await cu.evaluate(VE);
    const moi = await mo('http://127.0.0.1:8765/game/dist/linh-khi.html?cloud=0'); await sanSang(moi); await cho(1500); await moi.evaluate(VE);
    const A = await cu.evaluate((k) => tatCa(k), KEYS), B = await moi.evaluate((k) => tatCa(k), KEYS);
    kq.khong_co_tep = { so_o_so_sanh: Object.keys(A).length, so_o_khac: khac(A, B) };
    await cu.close();

    // (2) ảnh mẫu máy dựng từ 4 cánh cấp 2: hàng trên thu nhỏ + nhạt màu (cấp 1), hàng dưới phóng to + thêm lá cánh xoay quanh gốc + sáng màu (cấp 3)
    const mau = await moi.evaluate((KIEU) => {
      const O = 300, cv = document.createElement('canvas'); cv.width = O * 4; cv.height = O * 2; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#ff00ff'; g.fillRect(0, 0, cv.width, cv.height);
      const doiMau = (src, f) => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height); for (let i = 0; i < d.data.length; i += 4) if (d.data[i + 3] > 127) { const r = f(d.data[i], d.data[i + 1], d.data[i + 2]); d.data[i] = r[0]; d.data[i + 1] = r[1]; d.data[i + 2] = r[2]; d.data[i + 3] = 255; } else d.data[i + 3] = 0;
        x.putImageData(d, 0, 0); return c; };
      const vien = (r, g2, b) => r + g2 + b < 150; // giữ nguyên viền tối
      KIEU.forEach((k, i) => {
        const sp = G.spriteCustom.do['tp-wings-' + k], gc = sp.tp.diem.goc_canh, N = sp.net || 1;
        // cấp 1: nhạt và xám hơn
        const c1 = doiMau(sp.img, (r, g2, b) => (vien(r, g2, b) ? [r, g2, b] : [r * 0.8 + 30, g2 * 0.8 + 30, b * 0.8 + 30].map(Math.round)));
        let z = Math.max(1, Math.floor((O * 0.45) / Math.max(c1.width, c1.height)));
        g.drawImage(c1, i * O + Math.round((O - c1.width * z) / 2), Math.round((O - c1.height * z) / 2), c1.width * z, c1.height * z);
        // cấp 3: 3 lá cánh (xoay -24, 0, +22 độ quanh gốc), sáng hơn
        const c3 = doiMau(sp.img, (r, g2, b) => (vien(r, g2, b) ? [r, g2, b] : [Math.min(250, r * 1.12 + 8), Math.min(250, g2 * 1.12 + 8), Math.min(250, b * 1.05)].map(Math.round)));
        const t = document.createElement('canvas'); t.width = t.height = 96; const x = t.getContext('2d'); x.imageSmoothingEnabled = false;
        for (const a of [-24, 22, 0]) { x.save(); x.translate(80, 70); x.rotate((a * Math.PI) / 180); x.drawImage(c3, -gc[0] * N, -gc[1] * N); x.restore(); }
        const d = x.getImageData(0, 0, 96, 96); let x0 = 96, y0 = 96, x1 = 0, y1 = 0;
        for (let y = 0; y < 96; y++) for (let X = 0; X < 96; X++) { const j = (y * 96 + X) * 4; if (d.data[j + 3] > 127) { d.data[j + 3] = 255; x0 = Math.min(x0, X); y0 = Math.min(y0, y); x1 = Math.max(x1, X); y1 = Math.max(y1, y); } else d.data[j + 3] = 0; }
        x.putImageData(d, 0, 0);
        const w = x1 - x0 + 1, h = y1 - y0 + 1; z = Math.max(1, Math.floor((O * 0.8) / Math.max(w, h)));
        g.drawImage(t, x0, y0, w, h, i * O + Math.round((O - w * z) / 2), O + Math.round((O - h * z) / 2), w * z, h * z);
      });
      g.fillStyle = '#222'; for (let x = 0; x <= 4; x++) g.fillRect(Math.min(cv.width - 2, x * O - 1), 0, 2, cv.height); for (let y = 0; y <= 2; y++) g.fillRect(0, Math.min(cv.height - 2, y * O - 1), cv.width, 2);
      return cv.toDataURL('image/png');
    }, KIEU);
    const tepMau = path.join(RA, 'anh', 'mau-may-dung-4x2.png'); fs.mkdirSync(path.dirname(tepMau), { recursive: true });
    fs.writeFileSync(tepMau, Buffer.from(mau.split(',')[1], 'base64'));

    // trang Tách Đồ: chọn lô cuối, lấy ảnh tham chiếu, đưa ảnh mẫu
    const td = await mo('http://127.0.0.1:8765/tools/tach-do/index.html');
    await td.evaluate(() => { const s = document.getElementById('chonLo'); s.value = String(s.options.length - 1); s.dispatchEvent(new Event('change')); });
    kq.lo = await td.evaluate(() => ({ ten: L.ten, cuoi: LO[LO.length - 1] === L, so_lo: LO.length, ds: L.ds.map((m) => [m.ma, m.w, m.h]) }));
    kq.prompt = await td.evaluate(() => taoPrompt(L));
    await td.click('#nutAnhCanh'); await td.waitForFunction(() => !document.getElementById('anhCanh').hidden, null, { timeout: 30000 });
    kq.tham_chieu = await td.evaluate(() => document.getElementById('ttCanh').textContent);
    fs.writeFileSync(path.join(RA, 'anh-tham-chieu-canh-cap-2.png'), Buffer.from((await td.evaluate(() => document.getElementById('anhCanh').src)).split(',')[1], 'base64'));
    await td.setInputFiles('#chonAnh', tepMau);
    await td.waitForFunction(() => !document.getElementById('buoc3').hidden && document.getElementById('theKq').textContent, null, { timeout: 30000 });
    await cho(800);
    kq.tach = await td.evaluate(() => ({ the: document.getElementById('theKq').textContent, kiem: [...document.querySelectorAll('#dsKiem li')].map((l) => (l.className === 'loi' ? '✘ ' : '✔ ') + l.textContent) }));
    const tep = await td.evaluate(() => L.ds.map((m, i) => (KQ[i] ? JSON.parse(jsonMon(i)) : null)));
    kq.tep = tep.map((t) => t && { ma: t.ma, rong: t.rong, cao: t.cao, net: t.net, trang_phuc: t.trang_phuc, byte: JSON.stringify(t).length });
    // xem thử trong trang: chạm món cấp 3 của cánh lửa (em bé trong game mặc cánh đúng cấp)
    await td.evaluate(() => chonMon(6)); await cho(1500);
    await td.locator('#buoc3').screenshot({ path: path.join(RA, 'anh', 'trang-tach-do-lo-canh-theo-cap.png') });
    await td.close();

    // (3) nạp TẠM vào game
    await moi.evaluate((ds) => { for (const t of ds) if (t) G.spriteCustom.add(t); }, tep);
    await moi.waitForFunction(() => ['chuon', 'la', 'lua', 'bang'].every((k) => [1, 3].every((c) => { const s = G.spriteCustom.do['tp-wings-' + k + '-' + c]; return s && s.ready; })), null, { timeout: 20000 });
    await cho(300);
    const C = await moi.evaluate((k) => tatCa(k), KEYS);
    const dem = { cap1: 0, cap2: 0, cap3: 0 }; for (const k in B) if (B[k] !== C[k]) dem['cap' + k.split('|')[2]]++;
    kq.co_tep = { o_doi_theo_cap: dem, ghi: 'cấp 1 và cấp 3 phải đổi (48 ô mỗi cấp = 4 bé × 4 loại cánh × 3 động tác), cấp 2 phải 0' };
    // gốc cánh (toạ độ tính từ chân, điểm ảnh game) của ảnh theo cấp so với ảnh cấp 2, cùng động tác, cùng khung
    kq.goc_canh = await moi.evaluate(({ KEYS, KIEU }) => {
      const SC = G.spriteCustom, goc = (key, ma, lv, kind, dt, i) => { const r = SC.datDo(key, ma, dt, i, { outfit: { hat: null, robe: null, back: null, hand: null, mask: null, wing: { kind, level: lv } } }); if (!r || r.x == null) return null;
        const p = SC.do[ma].tp.diem.goc_canh, a = (r.xoay * Math.PI) / 180, X = p[0] * r.sx, Y = p[1] * r.sy; return [r.x + X * Math.cos(a) - Y * Math.sin(a), r.y + X * Math.sin(a) + Y * Math.cos(a), r.than]; };
      let max = 0, n = 0, than = {}; const chiTiet = [];
      for (const key of KEYS) for (const k of KIEU) for (const dt of ['idle', 'run', 'atk', 'hit', 'ne']) for (let i = 0; i < 6; i++) {
        const g2 = goc(key, 'tp-wings-' + k, 2, k, dt, i); if (!g2) continue; than[key] = g2[2];
        for (const lv of [1, 3]) { const g = goc(key, 'tp-wings-' + k + '-' + lv, lv, k, dt, i); if (!g) continue; const d = Math.max(Math.abs(g[0] - g2[0]), Math.abs(g[1] - g2[1])); n++; if (d > max) max = d;
          if (key === 'smith' && k === 'lua' && i === 0 && ['idle', 'run', 'atk'].includes(dt)) chiTiet.push({ dong_tac: dt, cap: lv, goc_cap_2: g2.slice(0, 2), goc_cap_nay: g.slice(0, 2) }); }
      }
      return { so_phep_do: n, lech_lon_nhat_px: Math.round(max * 100) / 100, than, vi_du_cu_ti_canh_lua: chiTiet };
    }, { KEYS, KIEU });
    // ảnh kiểm: Cu Tí, mỗi loại cánh một khối 3 cột (cấp 1, 2, 3) × 3 hàng (đứng, chạy, đánh), phóng 4 lần
    const anh = await moi.evaluate(({ KIEU, TEN }) => {
      const Z = 4, OW = 72, OH = 64, BW = OW * 3 * Z + 24, cv = document.createElement('canvas'); cv.width = BW * 2 + 12; cv.height = (OH * 3 * Z + 64) * 2 + 40; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#17363a'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#f6dc92'; g.font = 'bold 18px sans-serif';
      g.fillText('Làn E1 · Cu Tí mang cánh cấp 1 / 2 / 3 (cấp 1 và 3: ẢNH MẪU MÁY DỰNG, nạp tạm). Hàng: đứng, chạy, đánh', 12, 24);
      KIEU.forEach((k, b) => {
        const bx = 12 + (b % 2) * BW, by = 40 + Math.floor(b / 2) * (OH * 3 * Z + 64);
        g.fillStyle = '#f6dc92'; g.font = 'bold 16px sans-serif'; g.fillText('Cánh ' + TEN[k], bx, by + 18);
        g.font = '14px sans-serif'; [1, 2, 3].forEach((lv, c) => g.fillText('cấp ' + lv + (lv === 2 ? ' (ảnh đang có)' : ''), bx + c * OW * Z + 8, by + 40));
        DT.forEach(([ten, q], r) => [1, 2, 3].forEach((lv, c) => { const o = veO('smith', k, lv, q, OW, OH); g.fillStyle = '#12292a'; g.fillRect(bx + c * OW * Z, by + 48 + r * OH * Z + 56 * Z, OW * Z - 4, 8 * Z); g.drawImage(o, bx + c * OW * Z, by + 48 + r * OH * Z, OW * Z, OH * Z); }));
      });
      return cv.toDataURL('image/png');
    }, { KIEU, TEN });
    fs.writeFileSync(path.join(RA, 'anh-kiem.png'), Buffer.from(anh.split(',')[1], 'base64'));

    // chỉnh theo cặp (cap) của ảnh cấp 2 trong tệp ghép cũng dời ảnh theo cấp (thử tạm trong bộ nhớ, rồi trả lại)
    kq.cap_cua_cap_2 = await moi.evaluate(() => {
      const SC = G.spriteCustom, g = SC.ghep.smith, x = (ma, lv) => SC.datDo('smith', ma, 'idle', 0, { outfit: { wing: { kind: 'lua', level: lv } } }).x, dem = (cv) => cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.join(',');
      const q = { move: false, t: 0.2 }, truoc = dem(veO('smith', 'lua', 1, q));
      g.cap['tp-wings-lua'] = { goc: { dx: 3, dy: 0, sx: 1, sy: 1, xoay: 0, an: false, bien_the: null, da_chinh: false }, theo: {} }; SC.ghepVer++; G.tinhLinh.clearCache();
      const sau = dem(veO('smith', 'lua', 1, q));
      delete g.cap['tp-wings-lua']; SC.ghepVer++; G.tinhLinh.clearCache();
      return { hinh_cap_1_doi_khi_cap_2_co_chinh: truoc !== sau, tra_lai_nhu_cu: dem(veO('smith', 'lua', 1, q)) === truoc };
    });

    // (4) cờ tắt, rồi gỡ tệp
    await moi.evaluate(() => { G.spriteCustom.CANH_THEO_CAP = false; G.tinhLinh.clearCache(); });
    kq.co_tat = { so_o_khac_so_voi_chua_co_tep: khac(B, await moi.evaluate((k) => tatCa(k), KEYS)) };
    await moi.evaluate(() => { G.spriteCustom.CANH_THEO_CAP = true; for (const k of ['chuon', 'la', 'lua', 'bang']) for (const c of [1, 3]) G.spriteCustom.remove('tp-wings-' + k + '-' + c); G.tinhLinh.clearCache(); });
    kq.go_tep = { so_o_khac_so_voi_chua_co_tep: khac(B, await moi.evaluate((k) => tatCa(k), KEYS)) };

    // chỉ có ảnh cấp 1 và 3, KHÔNG có ảnh cấp 2: cấp 2 vẽ code như khi không có ảnh nào, cấp 1/3 vẽ ảnh; gỡ hết thì về code
    kq.khong_co_cap_2 = await moi.evaluate((ds) => new Promise((ok) => {
      const SC = G.spriteCustom, dem = (lv) => { const cv = veO('smith', 'lua', lv, { move: false, t: 0.2 }); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data.join(','); };
      SC.remove('tp-wings-lua'); G.tinhLinh.clearCache(); const code = [1, 2, 3].map(dem);
      for (const t of ds) if (t && /^tp-wings-lua-/.test(t.ma)) SC.add(t);
      setTimeout(() => { const co = [1, 2, 3].map(dem); SC.remove('tp-wings-lua-1'); SC.remove('tp-wings-lua-3'); G.tinhLinh.clearCache(); const het = [1, 2, 3].map(dem);
        ok({ cap_1_ve_anh: co[0] !== code[0], cap_2_van_ve_code: co[1] === code[1], cap_3_ve_anh: co[2] !== code[2], go_het_ve_code: het.every((v, i) => v === code[i]) }); }, 600);
    }), tep);
    kq.loi_trang = loi;
  } catch (e) { kq.loi = String(e && e.stack || e); }
  await br.close(); sv.forEach((s) => s.kill());
  delete kq.prompt_; const p = kq.prompt; delete kq.prompt;
  fs.writeFileSync(path.join(RA, 'kiem', 'ket-qua.json'), JSON.stringify(kq, null, 1));
  if (p) fs.writeFileSync(path.join(RA, 'kiem', 'prompt.txt'), p);
  console.log(JSON.stringify(kq, null, 1));
})();
