// Thử đi một vòng thật trong game (Playwright): A → rơi xuống giếng A → bám rễ → xuống sàn C → leo lên lại A;
// rồi A → B → xuống giếng B → sàn C → leo lên lại B. Chạy: phục vụ thư mục tieng-vong-cuoi-cung bằng
//   python3 -m http.server 8765   rồi   node tools/phong-demo/thu_duongdi_playwright.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 960, height: 540 } });
  pg.on('pageerror', e => console.log('LỖI TRANG', e.message));
  await pg.goto('http://localhost:8765/game/phong-demo/index.html?tu=1');
  await pg.waitForFunction(() => window.TV && TV.xong, null, { timeout: 30000 });
  const vt = () => pg.evaluate(() => { const p = TV.E.pl, T = 48; p.iframes = 99999; p.hp = 6;
    return { c: Math.floor((p.x + p.w / 2) / T), r: Math.round((p.y + p.h) / T), leo: p.leo, og: p.onGround, x: p.x, y: p.y }; });
  const bam = (n, k) => pg.evaluate(([n, k]) => TV.buoc(n, k), [n, k]);
  const log = async (ten) => { const v = await vt(); console.log(ten.padEnd(34), `cột ${v.c} hàng ${v.r} ${v.leo ? '(đang bám dây)' : v.og ? '(đứng)' : '(trên không)'}`); return v; };
  async function diToi(cot, maxF = 900) {   // đi ngang tới cột (nhảy qua chướng ngại nếu kẹt)
    let last = null, ket = 0;
    for (let f = 0; f < maxF; f += 4) { const v = await vt(); if (v.c === cot) { await bam(4, ''); return true; }
      const k = v.c < cot ? 'r' : 'l'; if (last && Math.abs(last.x - v.x) < 0.5) ket++; else ket = 0;
      await bam(4, ket > 3 && v.og ? k + 'j' : k); last = v; }
    return false;
  }
  async function leoHet(huong, maxF = 1500) { for (let f = 0; f < maxF; f += 4) { await bam(4, huong); const v = await vt(); if (!v.leo) return; } }
  let ok = true;
  await log('Xuất phát (A)');
  for (let i = 0; i < 400; i++) { const w = await vt(); if (w.leo || w.r >= 39) break; await bam(3, w.c < 13 ? 'r' : ''); }
  await log('Đi phải, rơi vào giếng A');
  if (!(await vt()).leo) { await bam(2, 'u'); await log('Bấm ↑ bám rễ trong giếng'); }
  await leoHet('d'); for (let i = 0; i < 40; i++) await bam(3, ''); let v = await log('Tụt xuống tận sàn C');
  ok &&= v.r === 39;
  await diToi(13); await bam(2, 'u'); await log('Bấm ↑ bám rễ');
  for (let f = 0; f < 1500; f += 4) { const w = await vt(); if (w.r <= 16 || !w.leo) break; await bam(4, 'u'); }
  await log('Leo gần tới miệng giếng');
  await bam(1, 'r'); await bam(20, 'rj'); await bam(30, 'r'); for (let i = 0; i < 30; i++) await bam(3, '');
  v = await log('Nhảy rời rễ sang phải → về A'); ok &&= v.r === 16 && v.c >= 14;
  // A → B → giếng B
  await diToi(52, 3000); await bam(1, ''); await log('Tới miệng giếng B');
  for (let i = 0; i < 60; i++) { await bam(2, ''); const w = await vt(); if (w.leo) break; if (w.og) await bam(2, 'r'); }
  await log('Rơi vào giếng B, bám rễ');
  await leoHet('d'); for (let i = 0; i < 40; i++) await bam(3, ''); v = await log('Tụt xuống sàn C'); ok &&= v.r === 39;
  await diToi(52); await bam(2, 'u');
  for (let f = 0; f < 1500; f += 4) { const w = await vt(); if (w.r <= 18 || !w.leo) break; await bam(4, 'u'); }
  await log('Leo gần miệng giếng B');
  await bam(1, 'l'); await bam(20, 'lj'); await bam(30, 'l'); for (let i = 0; i < 30; i++) await bam(3, '');
  v = await log('Nhảy rời rễ sang trái → về B'); ok &&= v.r === 18 && v.c <= 51;
  // C → D → bậc phụ lên bệ cao
  await pg.screenshot({ path: process.argv[2] || 'thu.png' });
  console.log(ok ? 'KẾT QUẢ: ĐẠT – xuống rồi leo lên lại được ở cả hai giếng' : 'KẾT QUẢ: CHƯA ĐẠT');
  await b.close(); process.exit(ok ? 0 : 1);
})();
