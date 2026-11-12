// UNITY B1–B4 (12/11): xuất bảng dữ liệu của bản web ra JSON cho dự án Unity — chạy ĐÚNG code game trong Chrome (Playwright), không gõ lại tay.
// Ra (mặc định D:/Unity/AstralArsenalUnity/Assets/Data/Web/ — đổi bằng --ra <thư mục>):
//   luat.json   (B1) bậc, luật, quái, trùm, chỉ huy, kỹ năng ụ, cấp thẻ, bố cục bàn theo chế độ…
//   chu.json    (B2) chữ EN (TEXT) + bảng dịch VI
//   kinhte.json (B3) rương, khe, gacha, nhiệm vụ, sự kiện, cửa hàng, cúp, thưởng chế độ, tiến trình
//   anh.json    (B4) danh mục ảnh/hiệu ứng/animation (meta), kèm THONG-KE-HIEU-UNG.json nếu có
//   vecto.json  véc-tơ kiểm: kết quả các hàm luật thuần (máu/mana/số quái theo wave, hệ số sao, danh sách quái theo hạt…) → C# phải ra y hệt
//   nguon.json  commit web, giờ xuất, bảng nào vào file nào, bảng nào BỎ QUA (chủ yếu là hàm vẽ/giao diện)
// Hàm nằm trong bảng dữ liệu được giữ dưới dạng {"$fn": "<mã nguồn>"} để dịch sang C#. Set → mảng, Map → đối tượng.
// Chạy (gốc repo web): python -m http.server 8765 --bind 127.0.0.1   rồi   node tools/thap-unity-xuat.js
//   cần thư viện playwright (PW=<đường dẫn playwright>) và Chrome (CHROME=<exe>, mặc định Chrome trên Windows).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require(process.env.PW || 'playwright');
const A = {}; { const v = process.argv.slice(2); for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) A[v[i].slice(2)] = v[i + 1] && !v[i + 1].startsWith('--') ? v[++i] : '1'; }
const GOC = path.resolve(__dirname, '..'), JS = path.join(GOC, 'thap', 'js');
const RA = path.resolve(A.ra || 'D:/Unity/AstralArsenalUnity/Assets/Data/Web');
const BASE = process.env.BASE || 'http://127.0.0.1:8765/thap/';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// nhóm theo file nguồn
const NHOM = {
  luat: /^(data|game|skills\d*|vangmoi1|nongskill|trum|thebai|chihuy(-moi)?|phattrien|support|buff|hotro|keoghep|thacmana|statthuc|artscale)\.js$/,
  kinhte: /^(kinhte|chedo-[a-z]+|khe|nv-the|tientrinh|sohuu|manh|tietkiem|meta|jackpot|thebai-ui|ctdeck|bobai)\.js$/,
  chu: /^(text|ngonngu(-vi)?)\.js$/,
};
const nhomCua = (f) => { for (const k in NHOM) if (NHOM[k].test(f)) return k; return 'anh'; };

// bảng toàn cục VIẾT HOA khai báo ở đầu dòng → file nguồn
const BANG = {};
for (const f of fs.readdirSync(JS).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(JS, f), 'utf8');
  for (const m of s.matchAll(/^(?:const|let|var) ([A-Z][A-Z0-9_]+) *=/gm)) if (!BANG[m[1]]) BANG[m[1]] = f;
}

function trongTrang(ten) {
  const out = {}, boqua = {};
  const doi = (v, sau, thay) => {
    if (v === null || typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
    if (typeof v === 'undefined') return null;
    if (typeof v === 'function') return { $fn: String(v) };
    if (typeof v !== 'object' || sau > 40) return null;
    if (typeof Node !== 'undefined' && v instanceof Node) return null;
    if (typeof HTMLCanvasElement !== 'undefined' && (v instanceof HTMLImageElement || v instanceof HTMLCanvasElement || v instanceof ImageBitmap)) return null;
    if (thay.has(v)) return { $ref: thay.get(v) };
    thay.set(v, '#' + thay.size);
    if (v instanceof Set) return [...v].map(x => doi(x, sau + 1, thay));
    if (v instanceof Map) { const o = {}; for (const [k, x] of v) o[String(k)] = doi(x, sau + 1, thay); return o; }
    if (ArrayBuffer.isView(v)) return Array.from(v);
    if (Array.isArray(v)) return v.map(x => doi(x, sau + 1, thay));
    const o = {}; for (const k of Object.keys(v)) o[k] = doi(v[k], sau + 1, thay); return o;
  };
  for (const n of ten) {
    let v; try { v = (0, eval)(n); } catch (e) { boqua[n] = 'không đọc được (' + e.message + ')'; continue; }
    if (typeof v === 'function') { boqua[n] = 'hàm'; continue; }
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Set) && !(v instanceof Map)) {
      let k = 0, f = 0; for (const x in v) { k++; if (typeof v[x] === 'function') f++; }
      if (k > 0 && f * 2 > k) { // không gian hàm (mã): chỉ giữ phần KHÔNG phải hàm (bảng số / trạng thái mặc định) — hàm dịch tay sang C#
        boqua[n] = 'không gian hàm (' + f + '/' + k + ' là hàm): chỉ xuất ' + (k - f) + ' mục dữ liệu, bỏ hàm';
        if (k === f) continue;
        const o = {}; for (const x in v) if (typeof v[x] !== 'function') o[x] = v[x];
        try { out[n] = doi(o, 0, new Map()); } catch (e) { boqua[n] += '; lỗi chuyển: ' + e.message; }
        continue;
      }
    }
    try { out[n] = doi(v, 0, new Map()); } catch (e) { boqua[n] = 'lỗi chuyển: ' + e.message; }
  }
  // giá trị đặc biệt không phải bảng viết hoa
  out.__boCuc = {}; for (const che of ['solo', 'pvp', 'coop']) { try { out.__boCuc[che] = doi(boCuc(che), 0, new Map()); } catch (e) { out.__boCuc[che] = { loi: e.message }; } }
  out.__roster = (typeof G !== 'undefined' && G.roster ? G.roster : []).map(r => ({ id: r.id, ten: r.ten, bac: r.bac })); // G.roster (bậc từng ụ) — tên 1 chữ, không lọt bộ lọc VIẾT HOA
  out.__hang = { W, H, TOC_DO: typeof TOC_DO !== 'undefined' ? TOC_DO : null, MAU_TANG_SAU, MAU_GAY2, MAU_TANG_SAU2, SAO_ST_CU, SAO_TOC, MANA_GIET_W };
  return { out, boqua };
}

function vecTo() {
  const v = {};
  const ws = []; for (let w = 1; w <= 120; w++) ws.push(w);
  const G0 = G.che; G.che = 'solo';
  v.mauWave = ws.map(mauWave); v.mauHeSo = ws.map(w => +mauHeSo(w).toPrecision(15));
  G.che = 'pvp'; v.mauWavePvp = ws.map(mauWave); G.che = G0;
  v.manaGiet = ws.map(manaGiet); v.manaGietGoc = ws.map(manaGietGoc); v.soQuaiWave = ws.map(soQuaiWave); v.chuDeWave = ws.map(chuDeWave);
  v.rngHat = {}; for (const h of [1, 2, 7, 1001, 123456789, -5]) { const r = rngHat(h); v.rngHat[h] = Array.from({ length: 8 }, () => r()); }
  v.dsQuaiChuDe = {}; for (const h of [1, 2, 3]) { v.dsQuaiChuDe[h] = {}; for (let w = 1; w <= 80; w++) { const r = rngHat(h * 1000 + w); v.dsQuaiChuDe[h][w] = dsQuaiChuDe(w, r, null); } }
  v.dsQuaiChuDeLeoThap = {}; { const c = { n: 1.3, kl: 5, bay: 0.3 }; v.dsQuaiChuDeLeoThap.c = c; for (let w = 1; w <= 40; w++) v.dsQuaiChuDeLeoThap[w] = dsQuaiChuDe(w, rngHat(w * 31), c); }
  v.saoMoi = {}; v.heSaoST = {}; for (const id of Object.keys(SKILLS)) { v.saoMoi[id] = saoMoi(id); v.heSaoST[id] = [1, 2, 3, 4, 5, 6, 7].map(s => heSaoST(id, s)); }
  v.knGt = {}; for (const id in KY_NANG_CAP) { const e = KY_NANG_CAP[id]; v.knGt[id] = {}; for (const k in e) if (e[k] && typeof e[k] === 'object' && 'base' in e[k]) v.knGt[id][k] = [0, 1, 2, 3, 4, 5, 6, 8, 10, 15].map(c => knGt(e[k], c)); }
  // ĐẦU NÒNG (game.js dauNong → vị trí đạn xuất phát = LUẬT: thời gian bay): ụ có gocDau → tâm ô + 6 px theo góc;
  //   còn lại r = min(cw, ch) × dauK × 0,5 × tip + T.rx (dạng grow-up gd: STAGE_K / STAGE_TIP)
  v.dauNong = {};
  for (const id of Object.keys(SKILLS)) {
    const m = (window.ART_META || {})[id] || { s: 1, tip: 0.9 };
    REN._luat = 1; let dk; try { dk = REN.dauK(id, undefined); } finally { REN._luat = 0; } // coDau (LUẬT) đặt _luat = 1 → kDau khác số dùng để vẽ
    const o = { gocDau: !!SKILLS[id].gocDau, dauK: dk, tip: m.tip };
    if (window.STAGE_K && STAGE_K[id]) o.stage = [1, 2, 3].map(gd => ({ dauK: (REN._luat = 1, (() => { try { return REN.dauK(id, gd); } finally { REN._luat = 0; } })()), tip: window.STAGE_TIP && STAGE_TIP[id] ? STAGE_TIP[id][gd - 1] : m.tip }));
    v.dauNong[id] = o;
  }
  return v;
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, headless: true });
  const p = await b.newPage(); const loi = [];
  p.on('pageerror', e => loi.push(e.message));
  await p.goto(BASE + 'index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof SKILLS !== 'undefined' && typeof boCuc === 'function', null, { timeout: 30000 });
  const ten = Object.keys(BANG).sort();
  const { out, boqua } = await p.evaluate(trongTrang, ten);
  let vec = null; try { vec = await p.evaluate(vecTo); } catch (e) { loi.push('vecTo: ' + e.message); }
  await b.close();

  fs.mkdirSync(RA, { recursive: true });
  const tep = { luat: {}, kinhte: {}, chu: {}, anh: {} };
  for (const n of Object.keys(out)) {
    if (n.startsWith('__')) { tep.luat[n] = out[n]; continue; }
    tep[nhomCua(BANG[n])][n] = { nguon: BANG[n], gt: out[n] };
  }
  const tk = path.join(GOC, 'docs', 'demo-hop-tuong', 'tuvan', 'webgl', 'THONG-KE-HIEU-UNG.json');
  const tkRel = path.relative(GOC, tk).split(path.sep).join('/'); let tkS = '';
  try { tkS = fs.existsSync(tk) ? fs.readFileSync(tk, 'utf8') : cp.execSync('git show HEAD:' + tkRel, { cwd: GOC, maxBuffer: 64 << 20 }).toString(); } catch (e) { } // kho sparse: đọc thẳng từ git
  if (tkS) tep.anh.__THONG_KE_HIEU_UNG = { nguon: tkRel, gt: JSON.parse(tkS) };
  const kq = {};
  for (const k in tep) { const s = JSON.stringify(tep[k], null, 1); fs.writeFileSync(path.join(RA, k + '.json'), s); kq[k] = { bang: Object.keys(tep[k]).length, kb: Math.round(s.length / 1024) }; }
  if (vec) fs.writeFileSync(path.join(RA, 'vecto.json'), JSON.stringify(vec));
  let commit = '', nhanh = '', ban = '';
  try { commit = cp.execSync('git rev-parse HEAD', { cwd: GOC }).toString().trim(); nhanh = cp.execSync('git branch --show-current', { cwd: GOC }).toString().trim(); ban = cp.execSync('git status --porcelain thap', { cwd: GOC }).toString().trim(); } catch (e) { }
  const nguon = { commit, nhanh, thapSach: !ban, luc: new Date().toISOString(), tep: kq,
    bang: Object.fromEntries(Object.keys(out).filter(n => !n.startsWith('__')).map(n => [n, { nguon: BANG[n], tep: nhomCua(BANG[n]) }])), boqua, loiTrang: loi };
  fs.writeFileSync(path.join(RA, 'nguon.json'), JSON.stringify(nguon, null, 1));
  console.log('Ra:', RA); console.log(kq); console.log('bỏ qua', Object.keys(boqua).length, 'bảng; lỗi trang', loi.length, loi.slice(0, 3));
})().catch(e => { console.error(e); process.exit(1); });
