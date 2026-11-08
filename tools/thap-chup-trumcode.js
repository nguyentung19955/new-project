// TURRET MERGE — GIF TRƯỚC/SAU hoạt ảnh trùm bằng code (quaianim.js TRUM_ANIM_CODE) ở 390×844 (DPR 3).
// Bước mô phỏng THỦ CÔNG (capNhat + REN.ve, dt cố định) → khung tất định, không phụ thuộc máy chậm.
// Chạy (gốc repo): python3 -m http.server 8796 &  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-trumcode.js [BASE]
//   CHI=hive,prism  · FPS=20 (khung GIF/giây) · OUT=thư mục ra
// Ra: OUT/<id>_truoc-sau.gif (trái: dải khung cũ ?trumanim=0 · phải: code) + OUT/<id>_tomtat.jpg (bảng khung) — cần python3 + Pillow.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8796/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/trum-anim-code/';
const TAM = process.env.TAM || '/tmp/trumcode-khung/';
const FPS = +process.env.FPS || 15;
const CHI = (process.env.CHI || 'hive,prism,mad_crown').split(',').filter(Boolean);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// đoạn: [nhãn, giây, tốc độ, việc trước đoạn]
const DOAN = [['walk 1x', 1.8, 1, 'di'], ['walk 3x + turn', 1.6, 3, 're'], ['attack', 2.3, 1, 'chieu'], ['hit', 0.9, 1, 'trung'], ['death', 0.6, 1, 'chet']];

async function chup(b, id, cu) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const loi = [];
  p.on('pageerror', e => loi.push(e.message));
  await p.goto(BASE + '?mode=solo&deck=canon,bang,tia,set,khien&mana=0&notut=1&seed=12345&af=hero' + (cu ? '&trumanim=0' : ''), { waitUntil: 'load', timeout: 90000 });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && typeof REN !== 'undefined', null, { timeout: 60000 });
  await sleep(4500);
  await p.waitForFunction(() => !G.dung, null, { timeout: 20000 }).catch(() => {}); await sleep(2000);
  await p.evaluate((id) => {
    G.dung = true; // vòng rAF chỉ vẽ lại dt = 0; mô phỏng do kịch bản bước tay
    for (const B of G.ban) { B.t.fill(null); B.khien = 0; }
    G.quai.length = 0; G.hang.length = 0; G.cho = 1e9; G.wave = 20;
    const E = sinhTrum(id, 0); E.s = 180; E.vao = 1; E.knT = 99; E.hp = E.max = 1e12; if (E.khien) { E.khien.on = false; E.khien.be = 0; } // lăng kính: tắt khiên để thấy thân
    const P = G.duong[0]; window.__goc = P.segs.length > 2 ? P.segs[2].s0 : P.len / 2; // góc rẽ dưới-trái (đi xuống → rẽ phải)
    REN.img('trum_' + id + '_m'); REN.img('trum_' + id + '_m_sang'); REN.img('trum_' + id + '_m_vm');
    window.__E = E;
    window.__buoc = (dt, k) => {
      G.tocDo = k; window.__no = (window.__no || 0) + dt * k; let n = 0;
      while (window.__no >= BUOC - 1e-9) { chupTruoc(); capNhat(BUOC); window.__no -= BUOC; n++; }
      FX.capNhat(dt); REN.ve(dt, 1);
    };
    window.__cat = (o) => { // cắt vùng quanh trùm (theo trùm), trả dataURL
      const cv = document.getElementById('cv'), r = cv.getBoundingClientRect(), k = r.width / W * (cv.width / r.width);
      const E = window.__E, s = 150 * k, cx = clamp(E.x * k, s / 2, cv.width - s / 2), cy = (E.y - 6) * k;
      const c = document.createElement('canvas'); c.width = c.height = o; const x = c.getContext('2d');
      x.fillStyle = '#2a3a2a'; x.fillRect(0, 0, o, o); // nền bàn là lớp DOM → lót màu cỏ tối cho GIF
      x.drawImage(cv, cx - s / 2, cy - s / 2, s, s, 0, 0, o, o);
      return c.toDataURL('image/png');
    };
  }, id);
  await sleep(1500); // nạp ảnh gốc
  const dir = path.join(TAM, id + (cu ? '_cu' : '_moi')); fs.mkdirSync(dir, { recursive: true });
  let f = 0; const nhan = [];
  for (const [ten, giay, k, viec] of DOAN) {
    await p.evaluate(([viec]) => {
      const E = window.__E;
      if (viec === 're') { E.s = window.__goc - 45; }
      if (viec === 'chieu') { // đặt ụ để trùm có mục tiêu, tung chiêu ngay
        for (const B of G.ban) for (let i = 0; i < 15; i++) { B.t[i] = sinhU(taoU(B, B.deck[i % 4], 2, i)); B.t[i].vxA = null; B.t[i].cd = 1e9; B.t[i].hoi = 1e9; } // 2★: STAR LEECH chỉ nhắm ụ ≥2★
        E.knT = 0.01; E.bao = null;
      }
      if (E.khien) { E.khien.on = false; E.khien.be = 0; }
      if (viec === 'trung') { E.knT = 99; for (const B of G.ban) B.t.fill(null); }
      if (viec === 'chet') { E.hp = 1; }
      window.__viec = viec; window.__tv = 0;
    }, [viec]);
    const n = Math.round(giay * FPS);
    for (let i = 0; i < n; i++) {
      await p.evaluate(([dt, k]) => {
        const E = window.__E;
        if (window.__viec === 'trung' && Math.floor((window.__tv + dt) / 0.18) > Math.floor(window.__tv / 0.18)) trung(E, 1, { im: true, phu: true, crit: false });
        if (window.__viec === 'chet' && window.__tv === 0) trung(E, 10, { im: true, phu: true, crit: false });
        window.__tv += dt; window.__buoc(dt, k);
      }, [1 / FPS, k]);
      const u = await p.evaluate(() => window.__cat(150));
      fs.writeFileSync(path.join(dir, String(f++).padStart(4, '0') + '.png'), Buffer.from(u.split(',')[1], 'base64'));
      nhan.push(ten);
    }
  }
  fs.writeFileSync(path.join(dir, 'nhan.json'), JSON.stringify(nhan));
  await ctx.close();
  if (loi.length) console.log('  ✗ lỗi trang', id, cu ? 'cũ' : 'mới', loi.slice(0, 3));
  return dir;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const id of CHI) {
    const a = await chup(b, id, true), m = await chup(b, id, false);
    execFileSync('python3', [path.join(__dirname, 'thap-gif-truocsau.py'), a, m, path.join(OUT, id), String(FPS)], { stdio: 'inherit' });
  }
  await b.close();
})();
