// Test TỰ CỬ ĐỘNG (claude/tu-cu-dong): 1 ảnh tĩnh → game tự chuyển động (js/tu-cu-dong.js).
// Chạy: node tests/tu-cu-dong/tu-cu-dong.test.js   (ảnh chụp ở tests/tu-cu-dong/shots/)
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { enter, ok, ROOT } = require('../cho-tuong/helpers');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZES = [[1920, 934], [844, 390], [667, 375]];
const MA = 'lactuong,chantrau,thosan,thaymo,lucsi,kinhduong,kybinh,tom,anvuong';   // mã không nằm trong CD_SKIP (trang thử bỏ mã chờ gen lại)

// bat: ép bật công tắc ảnh mới (CD_BAT trong js/tu-cu-dong.js đang tắt chờ đủ 90 ảnh) — mặc định bật để thử hệ tự cử động
async function open(browser, w, h, q = '', bat = true) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon|firebase|gstatic/i.test(m.text())) page.errors.push(m.text()); });
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  if (bat) await page.addInitScript(() => { window.CD_BAT_EP = true; });
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })); sessionStorage.setItem('seeded', '1'); } });
  await page.goto('file://' + path.join(ROOT, 'index.html') + q);
  // đợi điều kiện (game + giao diện đã khởi tạo, ảnh asset-list nạp xong) thay vì thời gian cố định — máy tải nặng vẫn ổn
  await page.waitForFunction(() => typeof game !== 'undefined' && typeof ui !== 'undefined' && document.readyState === 'complete' && typeof cdSoloImg === 'function', null, { timeout: 60000 });
  return page;
}

async function main() {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

  // ---------- 1. đo ảnh: khung bao, hàng chân, tâm chân (ảnh giả có lề trong suốt + vũ khí chìa một bên)
  console.log('Đo ảnh đơn:');
  {
    const page = await open(browser, 844, 390);
    const r = await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 400; c.height = 400;
      const x = c.getContext('2d');
      x.fillStyle = '#c33'; x.fillRect(150, 60, 80, 240);   // thân: chân ở hàng 300 (còn 100 px lề dưới)
      x.fillRect(150, 300, 30, 40); x.fillRect(200, 300, 30, 40);   // 2 chân tới hàng 340
      x.fillRect(230, 100, 140, 12);                       // giáo chìa sang phải
      c.naturalWidth = 400; c.naturalHeight = 400;
      const p = cdPrepare(c);
      return { w: p.c.width, h: p.c.height, ar: p.ar, fx: p.fx, again: cdPrepare(c) === p };
    });
    ok(Math.abs(r.h / r.w - (280 / 220)) < 0.08, `cắt sát khung bao (bỏ lề trong suốt): ${r.w}×${r.h}`);
    ok(Math.abs(r.fx - (40 / 220)) < 0.06, `tâm chân theo đáy hình, không theo giữa ảnh (giáo chìa phải): fx=${r.fx.toFixed(3)}`);
    ok(r.again, 'đo một lần, lần sau dùng lại (không tạo canvas mỗi khung)');

    // ---------- 2. chọn ảnh đơn: bộ nhiều khung vẫn ưu tiên; chỉ còn idle (hoặc <mã>.png) → ảnh đơn
    console.log('Chọn ảnh:');
    const s = await page.evaluate(() => {
      ['lactuong.png', 'xathu.png', 'tom.png'].forEach((f) => ASSET_SET.delete(f));   // giả mã chưa có ảnh dựng xương
      const a = !!cdSoloImg('lactuong', false);
      ['wind', 'strike', 'cast'].forEach((n) => ASSET_SET.delete(`packs/xathu/${n}.png`)); cdMultiCache.clear();
      ASSET_SET.add('ma-moi.png');
      return { lac: a, xathu: hasAsset('packs/xathu/idle.png') && !cdHasMulti('xathu', false), tom: !!cdSoloImg('tom', true), path: ['ma-moi.png', 'packs/ma-moi/idle.png'].filter(hasAsset) };
    });
    ok(!s.lac, 'Lạc Tướng có bộ nhiều khung (wind / strike) → giữ đường vẽ cũ');
    ok(s.xathu, 'chỉ còn packs/<mã>/idle.png → coi là ảnh đơn');
    ok(!s.tom, 'quái có walk2 / attack → giữ bộ nhiều khung');
    ok(s.path[0] === 'ma-moi.png', '<mã>.png ở gốc assets/ được nhận làm ảnh đơn');
    const dx = await page.evaluate(() => ({ adv: hasAsset('adv.png') && hasAsset('packs/adv/strike.png'), solo: hasAsset('adv.png') && !cdHasMulti('adv', false) === false }));
    ok(dx.adv && dx.solo, 'có ảnh dựng xương adv.png thì dùng thay bộ cũ packs/adv (wind / strike)');
    // tester t6: ảnh vẽ sai → danh sách loại trừ giữ cách hiển thị cũ; boss to; vệt đúng phía vũ khí; không cắt ở mép
    const t6 = await page.evaluate(async () => {
      const skip = [...CD_SKIP].filter((k) => hasAsset(k + '.png') && cdSoloImg(k, !HEROES[k]));
      const load = async (k) => { const im = new Image(); im.src = 'assets/' + k + '.png'; await im.decode(); return cdPrepare(im); };
      const lac = await load('lactuong'), kd = await load('kinhduong');
      const boss = cdEnemySize({ def: { boss: true } }, { w: 40 }, await load('haba')).H, boss2 = cdEnemySize({ def: { boss: true } }, { w: 140 }, await load('thuongluong')).H;
      const quai = cdEnemySize({ def: {} }, { w: 40 }, await load('tom')).H;
      // tướng ở ô sát mép trái: không vẽ ra ngoài canvas
      const c = document.createElement('canvas'); c.width = 300; c.height = 300; const x = c.getContext('2d', { willReadFrequently: true });
      CD.force = true;
      for (let i = 0; i < 400 && !asset('lactuong.png', true); i++) await new Promise((r) => setTimeout(r, 50));   // đợi ảnh tải xong
      drawHeroSprite(x, { type: 'lactuong', id: 1, tier: 3, equip: {} }, 6, 280, { t: 1, scale: 0.9, noShadow: true });
      const d = x.getImageData(0, 0, 1, 300).data; let edge = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) edge++;
      const cast = [0.5, 0.42, 0.32, 0.25, 0.1].map((ct) => +cdPose({ t: 0, seed: 0, castT: ct }).sy.toFixed(3));
      return { skip, lacSide: lac.wside, kdSide: kd.wside, boss, boss2, quai, edge, cast };
    });
    const cd = await page.evaluate(() => ({ head: heroImgUrl('cuoi', 'head'), front: heroImgUrl('cuoi'), skip: heroImgUrl('nguphu', 'head'),
      n: Object.keys(HEROES).filter((k) => cdNewArt(k)).filter((k) => !hasAsset(`chan-dung-moi/${k}.png`)) }));
    ok(/chan-dung-moi\/cuoi\.png/.test(cd.head) && /\/cuoi\.png/.test(cd.front), 'thẻ chợ / chân dung / Anh Hùng dùng ảnh mới (chan-dung-moi/<mã>.png, <mã>.png)');
    ok(!/chan-dung-moi/.test(cd.skip), 'mã trong CD_SKIP vẫn dùng chân dung cũ');
    ok(cd.n.length === 0, 'mọi tướng có ảnh mới đều có chân dung cắt sẵn (thiếu: ' + cd.n.join(' ') + ')');
    // không che mặt: Thầy Chuông Đồng (chiêng to) — điểm của tay + chiêng không lấn vào hộp mặt ở mọi khung đánh / tung chiêu
    const face = await page.evaluate(async () => {
      const out = {};
      for (const k of ['chuongdong', 'dapde', 'thansan', 'denroi']) {
        const im = new Image(); im.src = 'assets/' + k + '.png'; await im.decode();
        const R = cdBuildRig(cdPrepare(im), RIGS[k] || null);
        if (!R.arm || !R.face) { out[k] = 'không tách tay'; continue; }
        let bad = 0;
        const kind = cdWeapon(k, HEROES[k].attack);
        const q0 = cdArmTip(R, { t: 1, seed: 0 }, kind, 0, 1);
        for (let i = 0; i <= 40; i++) {
          const st = i <= 30 ? { t: 2 + i * 0.05, seed: 0.4, swing: 1 - i / 30 } : { t: 4, seed: 0.4, castT: 0.5 * (i - 30) / 10 };
          const P = cdPose(st), T = cdArmTip(R, st, kind, cdRigBend(P), P.sy);
          const [x0, y0, x1, y1] = R.face, bb = Math.max(-0.26, Math.min(0.26, cdRigBend(P))) * R.hip * 0.25;
          const inF = (x, y) => x > x0 + bb && x < x1 + bb && y > y0 && y < y1;
          if (inF(T.tip[0], T.tip[1]) && !inF(q0.tip[0], q0.tip[1])) bad++;
        }
        out[k] = bad;
      }
      return out;
    });
    console.log('  đầu vũ khí lấn vào mặt (số khung / 41):', JSON.stringify(face));
    // tester2 C1: tung chiêu với giáo / gậy dài — vật cầm không bị xoay dựng đứng (đầu cán thòng xuống chân, lộ chỗ cắt ở bụng)
    const c1 = await page.evaluate(async () => {
      const o = {};
      for (const k of ['giaodong', 'tanvien', 'lachau']) {
        const im = new Image(); im.src = 'assets/' + k + '.png'; await im.decode();
        const R = cdBuildRig(cdPrepare(im), RIGS[k] || null); if (!R.arm) { o[k] = 0; continue; }
        const kind = cdWeapon(k, HEROES[k].attack), a0 = cdArmTip(R, { t: 3, seed: 0 }, kind, 0, 1).ang;
        o[k] = Math.max(...[0.45, 0.3, 0.15].map((ct) => Math.abs(cdArmTip(R, { t: 3, seed: 0, castT: ct }, kind, 0, 1).ang - a0)));
      }
      return o;
    });
    ok(Object.values(c1).every((v) => v < 0.12), 'tung chiêu: giáo / gậy dài chỉ nghiêng nhẹ (' + Object.entries(c1).map(([k, v]) => k + ' ' + v.toFixed(2)).join(', ') + ' rad)');
    ok(Object.values(face).every((v) => v === 0 || v === 'không tách tay'), 'vũ khí / vật cầm không cắt qua mặt khi đánh / tung chiêu (chuongdong, dapde, thansan, denroi)');
    // hàm ảnh chung ngoài sân: ảnh mới chưa tải → false (không quay về ảnh cũ)
    const ui1 = await page.evaluate(() => { const p = 'zz-chua-tai.png'; ASSET_SET.add(p); return cdUiImg(p, () => {}); });
    ok(ui1 === false, 'cdUiImg: ảnh mới chưa tải xong → chờ vẽ lại, không chớp ảnh cũ');
    ok(t6.skip.length === 0, 'mã trong CD_SKIP (ảnh vẽ sai, chờ gen lại) không dùng ảnh mới — giữ hiển thị cũ');
    ok(t6.lacSide === -1 && t6.kdSide === 1, 'phía vũ khí: Lạc Tướng cầm rìu bên trái → vệt bên trái; Kinh Dương Vương bên phải');
    ok(t6.boss >= 100 && t6.boss2 <= 125 && t6.boss > t6.quai * 1.6, `boss cao ${Math.round(t6.boss)}–${Math.round(t6.boss2)} (quái thường ${Math.round(t6.quai)}) — không bé như quái`);
    ok(t6.edge === 0, `tướng ở ô sát mép trái không bị vẽ lẹm ra ngoài canvas (${t6.edge} điểm ở cột 0)`);
    ok(t6.cast[1] < 0.95 && t6.cast[3] > 1.05, `tung chiêu nhún xuống rồi bật lên (cao ${t6.cast.join(' → ')})`);
    await page.close();
  }

  // ---------- 3. tư thế: biên độ hợp lý, chết mờ dần (không biến mất cụt), lệch pha giữa các tướng
  console.log('Tư thế:');
  {
    const page = await open(browser, 844, 390);
    const r = await page.evaluate(() => {
      const out = { minS: 9, maxS: 0, maxRot: 0, alpha: [], phases: new Set() };
      for (const melee of [true, false]) for (let sw = 1; sw >= 0; sw -= 0.02) {
        const P = cdPose({ t: 1, seed: 0.3, swing: sw, melee });
        out.minS = Math.min(out.minS, P.sx, P.sy); out.maxS = Math.max(out.maxS, P.sx, P.sy); out.maxRot = Math.max(out.maxRot, Math.abs(P.rot)); if (P.phase) out.phases.add(P.phase);
      }
      for (const f of [0.6, 0.45, 0.3, 0.15, 0.01]) out.alpha.push(cdPose({ t: 1, seed: 0, fall: f }).alpha);
      const cast = cdPose({ t: 1, seed: 0, castT: 0.3, castUlt: true });
      const rage = cdPose({ t: 1, seed: 0, enraged: true });
      const hurt = cdPose({ t: 1, seed: 0, hurt: 0.2 });
      const a = cdPose({ t: 3, seed: cdSeed(1, 'lactuong') }), b = cdPose({ t: 3, seed: cdSeed(2, 'lactuong') });
      return { ...out, phases: [...out.phases], cast: [cast.sy, cast.glow, cast.dy], rage: [rage.sx, rage.flash, rage.flashC], hurt: [hurt.flash, hurt.dx], desync: Math.abs(a.sy - b.sy) + Math.abs(a.bend - b.bend) };
    });
    ok(r.minS > 0.85 && r.maxS < 1.25, `co giãn trong khoảng an toàn ${r.minS.toFixed(3)}…${r.maxS.toFixed(3)} (không méo hình)`);
    ok(r.maxRot < 0.2, `nghiêng tối đa ${r.maxRot.toFixed(3)} rad khi đánh`);
    ok(['wind', 'strike', 'recover'].every((p) => r.phases.includes(p)), 'đánh đủ 3 pha: lấy đà → lao tới → bật về');
    ok(r.alpha.every((a, i) => i === 0 || a < r.alpha[i - 1]) && r.alpha[4] > 0.1 && r.alpha[4] < 0.25, `chết mờ dần ${r.alpha.map((a) => a.toFixed(2)).join(' → ')} (không biến mất cụt)`);
    ok(r.cast[0] > 1.1 && r.cast[1] > 0.9 && r.cast[2] < 0, 'tung chiêu: nhún lên, phóng to, phát sáng viền');
    ok(r.rage[0] > 1.1 && r.rage[1] > 0.2 && r.rage[2] === '#FF2A1A', 'boss nổi giận: phồng to, ám đỏ');
    ok(r.hurt[0] > 0.5 && r.hurt[1] < 0, 'trúng đòn: chớp sáng + giật lùi');
    ok(r.desync > 0.004, 'các tướng lệch pha (không thở đồng bộ)');

    // ---------- 4. chân không trôi: vẽ một tướng ảnh đơn, đáy hình & tâm chân đứng yên khi thở / lấy đà
    const feet = await page.evaluate(async () => {
      CD.force = true;
      const c = document.createElement('canvas'); c.width = 300; c.height = 300;
      const x = c.getContext('2d', { willReadFrequently: true });
      for (let i = 0; i < 400 && !cdSoloImg('lactuong', false); i++) await new Promise((r) => setTimeout(r, 50));   // đợi ảnh tải xong
      const res = [];
      const meas = (o) => {
        x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 300, 300);
        drawHeroSprite(x, { type: 'lactuong', id: 3, tier: 1, equip: {} }, 150, 270, { t: o.t, scale: 1, noShadow: true, swing: o.swing || 0 });
        const d = x.getImageData(0, 0, 300, 300).data;
        let bot = 0; for (let y = 299; y >= 0 && !bot; y--) for (let xx = 0; xx < 300; xx++) if (d[(y * 300 + xx) * 4 + 3] > 80) { bot = y; break; }
        let n = 0, sx = 0; for (let y = bot - 6; y <= bot; y++) for (let xx = 0; xx < 300; xx++) if (d[(y * 300 + xx) * 4 + 3] > 80) { n++; sx += xx; }
        return { bot, cx: n ? sx / n : 0 };
      };
      for (let k = 0; k < 12; k++) res.push(meas({ t: k * 0.21 }));
      const wind = meas({ t: 1, swing: 0.8 });
      return { idle: res, wind };
    });
    const bots = feet.idle.map((f) => f.bot), cxs = feet.idle.map((f) => f.cx);
    ok(Math.max(...bots) - Math.min(...bots) <= 2, `đứng thở: đáy hình (chân) lệch ≤ 2 px (${Math.min(...bots)}…${Math.max(...bots)})`);
    ok(Math.max(...cxs) - Math.min(...cxs) <= 3, `đứng thở: tâm chân trôi ngang ≤ 3 px (${(Math.max(...cxs) - Math.min(...cxs)).toFixed(1)} px)`);
    ok(Math.abs(feet.wind.bot - bots[0]) <= 3, 'lấy đà: chân vẫn chạm đất');
    ok(page.errors.length === 0, 'không lỗi trang: ' + page.errors.join(' | '));
    await page.close();
  }

  // ---------- 4b. RIG vung tay: 3 lớp ghép lại đúng ảnh gốc, chân đứng yên tuyệt đối, tay vung rõ, xuất GIF mẫu
  console.log('Vung tay (rig 3 lớp):');
  {
    const page = await open(browser, 844, 390);
    // chỉ ảnh dựng xương mới (assets/<mã>.png) + mẫu docs/mau-vung-tay — không dùng ảnh cũ packs/
    const SAMPLES = [['mau-nv', 'docs/mau-vung-tay/mau-nv.png'], ['potaoapui', 'assets/potaoapui.png'], ['cuoi', 'assets/cuoi.png'], ['xathu', 'assets/xathu.png'],
      ['auco', 'assets/auco.png'], ['sodua', 'assets/sodua.png'], ['giaodong', 'assets/giaodong.png']];
    const res = await page.evaluate(async (SAMPLES) => {
      const out = [], frames = [];
      const FW = 220, FH = 250;
      for (const [k, src] of SAMPLES) {
        const im = new Image(); im.src = src; await im.decode();
        const p = cdPrepare(im), R = cdBuildRig(p, RIGS[k] || null), kind = k === 'mau-nv' ? 'slash' : cdWeapon(k, HEROES[k] ? HEROES[k].attack : '');
        // (a) ghép 3 lớp ở tư thế gốc = ảnh gốc (không sót mảnh, không thừa)
        const c0 = document.createElement('canvas'); c0.width = R.W; c0.height = R.H;
        const x0 = c0.getContext('2d', { willReadFrequently: true });
        x0.drawImage(R.legs, 0, 0); x0.drawImage(R.upper, 0, 0); if (R.arm) x0.drawImage(R.arm, R.ax0, R.ay0);
        const a = x0.getImageData(0, 0, R.W, R.H).data, b = p.c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, R.W, R.H).data;
        let miss = 0, n = 0; for (let i = 3; i < a.length; i += 4) { if (b[i] > 40) n++; if (Math.abs(a[i] - b[i]) > 60) miss++; }
        // (b) chân đứng yên: vẽ nhiều khung (thở, lấy đà, chém, thu, tung chiêu, trúng đòn), so điểm ảnh từ hông xuống
        const S = 200 / R.H, cv = document.createElement('canvas'); cv.width = FW; cv.height = FH;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        const legRow = Math.ceil(FH - 20 - (R.H - R.hip) * S) + 2;   // hàng màn hình ngay dưới đường hông
        const draw = (st, opt) => { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, FW, FH); cx.translate(FW * 0.42, FH - 20); cx.scale(S, S); cx.translate(-p.fx * R.W, -R.H); const P = cdPose(st); if (opt.noFlash) P.flash = 0; return { P, T: cdRigFrame(cx, R, P, st, { kind, col: '#FFE08A', ...opt }) }; };
        const legsOf = (alphaOnly) => { const d = cx.getImageData(0, legRow, FW, FH - legRow).data; if (!alphaOnly) return d; const o = new Uint8Array(d.length / 4); for (let i = 0; i < o.length; i++) o[i] = d[i * 4 + 3]; return o; };
        const states = [{ t: 0.2 }, { t: 1.1 }, { t: 2.3 }, ...[0.95, 0.8, 0.65, 0.55, 0.45, 0.3, 0.1].map((sw) => ({ t: 3, swing: sw })), { t: 4, castT: 0.3 }, { t: 4, castT: 0.15 }];
        let legDiff = 0, tips = [], ref = null;
        for (const st0 of states) {
          const st = { seed: 0.4, melee: kind !== 'shot' && kind !== 'orb', ...st0 };
          const r = draw(st, { noArm: true, noFx: true });
          const d = legsOf(false);
          if (!ref) ref = d; else for (let i = 0; i < d.length; i++) if (d[i] !== ref[i]) { legDiff++; }
          if (R.arm) tips.push(cdArmTip(R, st, kind, cdRigBend(r.P), r.P.sy).tip);
        }
        const refA = (() => { draw({ t: 0.2, seed: 0.4 }, { noArm: true, noFx: true }); return legsOf(true); })();
        draw({ t: 5, seed: 0.4, hurt: 0.2 }, { noArm: true, noFx: true, noFlash: true });   // (bỏ lớp chớp màu: chỉ so vị trí hình)
        const hurtA = legsOf(true); let hurtDiff = 0; for (let i = 0; i < hurtA.length; i++) if ((hurtA[i] > 128) !== (refA[i] > 128)) hurtDiff++;
        let span = 0; for (const t1 of tips) for (const t2 of tips) span = Math.max(span, Math.hypot(t1[0] - t2[0], t1[1] - t2[1]));
        out.push({ k, kind, arm: !!R.arm, hip: +(R.hip / R.H).toFixed(2), miss: miss / n, legDiff, hurtDiff, span: span / R.H });
        // khung cho GIF: thở → đánh → đánh → tung chiêu → trúng đòn (đủ tay + vệt)
        const seq = [];
        for (let i = 0; i < 8; i++) seq.push({ t: i * 0.1 });
        for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i <= 14; i++) seq.push({ t: 1 + r2 + i * 0.04, swing: 1 - i / 14 });
        for (let i = 0; i < 8; i++) seq.push({ t: 3 + i * 0.06, castT: 0.3 * Math.sin(Math.PI * i / 7) });
        for (let i = 0; i < 6; i++) seq.push({ t: 4 + i * 0.05, hurt: 0.2 * (1 - i / 5) });
        frames.push(seq.map((st0) => { const st = { seed: 0.4, melee: kind !== 'shot' && kind !== 'orb', ...st0 }; draw(st, {}); return cv.toDataURL('image/png'); }));
      }
      return { out, frames };
    }, SAMPLES);
    for (const r of res.out) {
      console.log(`  ${r.k} (${r.kind}) tay: ${r.arm ? 'có' : 'không'} · hông ${r.hip} · sót ${(r.miss * 100).toFixed(2)}% · tay vung ${(r.span * 100).toFixed(0)}% chiều cao`);
      ok(r.miss < 0.005, `${r.k}: 3 lớp (chân · thân · tay) ghép lại khớp ảnh gốc (sót ${(r.miss * 100).toFixed(2)}%)`);
      ok(r.legDiff === 0, `${r.k}: chân đứng yên — điểm ảnh dưới hông trùng khít qua thở / lấy đà / chém / thu / tung chiêu (${r.legDiff} điểm khác)`);
      ok(r.hurtDiff === 0, `${r.k}: trúng đòn chỉ chớp màu, hình chân không xê dịch (${r.hurtDiff} điểm)`);
      if (r.arm) ok(r.span > ({ shot: 0.05, punch: 0.12, thrust: 0.12 }[r.kind] || 0.2), `${r.k}: tay + vũ khí ${r.kind === 'shot' ? 'kéo lùi rồi bật (cung / nỏ: nhẹ)' : 'vung rõ'} (đầu vũ khí đi ${(r.span * 100).toFixed(0)}% chiều cao)`);
    }
    ok(res.out.filter((r) => r.arm).length >= 6, 'mẫu mau-nv + 5 tướng ảnh mới tách được tay (kiếm, rìu, cung, gậy, tay không)');
    // GIF: các nhân vật xếp ngang, mỗi khung một hình
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vungtay-'));
    const nF = res.frames[0].length;
    for (let i = 0; i < nF; i++) res.frames.forEach((fr, j) => fs.writeFileSync(path.join(tmp, `f${String(i).padStart(3, '0')}_${j}.png`), Buffer.from(fr[i].split(',')[1], 'base64')));
    require('child_process').execFileSync('python3', ['-c', `
import glob,sys
from PIL import Image
d,n,m,out=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
fr=[]
for i in range(n):
  ims=[Image.open(f'{d}/f{i:03d}_{j}.png').convert('RGBA') for j in range(m)]
  w,h=ims[0].size; c=Image.new('RGBA',(w*m,h),(38,52,31,255))
  for j,im in enumerate(ims): c.alpha_composite(im,(j*w,0))
  fr.append(c.convert('RGB'))
fr[0].save(out+'.gif',save_all=True,append_images=fr[1:],duration=55,loop=0)
pick=[2,10,13,16,19,25,40,44,49]
s=Image.new('RGB',(fr[0].width,fr[0].height*len(pick)))
for k,i in enumerate(pick): s.paste(fr[i],(0,k*fr[0].height))
s.save(out+'-khung.png')
`, tmp, String(nF), String(res.frames.length), path.join(SHOTS, 'vung-tay')]);
    ok(fs.existsSync(path.join(SHOTS, 'vung-tay.gif')), 'xuất tests/tu-cu-dong/shots/vung-tay.gif + vung-tay-khung.png');
    ok(page.errors.length === 0, 'không lỗi trang: ' + page.errors.join(' | '));
    await page.close();
  }

  // ---------- 5. trang thử tools/xem-cu-dong.html → index.html?xem-cu-dong: đủ nhân vật, đủ trạng thái, chụp ảnh
  console.log('Trang thử:');
  for (const [w, h] of SIZES) {
    const page = await open(browser, w, h, `?xem-cu-dong&ma=${MA}`);
    await page.waitForFunction(() => window.XEM && XEM.frames > 5, null, { timeout: 60000 });
    await page.waitForFunction(() => XEM.cells.every((c) => asset(c.type + '.png', true)), null, { timeout: 60000 });   // ảnh mọi ô đã tải
    await page.evaluate(() => { XEM.pause = true; });
    const n = await page.evaluate(() => XEM.cells.length);
    ok(n === MA.split(',').length, `${w}×${h}: ${n} nhân vật trong lưới`);
    for (const st of ['attack', 'cast', 'hurt', 'die', 'walk', 'rage']) {
      await page.selectOption('#xcd-st', st);
      for (const [i, dt] of [[0, 0.12], [1, 0.3], [2, 0.5]]) {
        await page.evaluate((t) => { document.querySelector('#xem-cu-dong').scrollTop = 0; XEM.draw(t); }, 20 + dt);
        if (w === 1920 || i === 1) await page.screenshot({ path: path.join(SHOTS, `${w}x${h}-${st}-${i}.jpg`), quality: 80 });
      }
    }
    ok(page.errors.length === 0, `${w}×${h}: không lỗi trang ` + page.errors.join(' | '));
    await page.close();
  }
  const tool = fs.readFileSync(path.join(ROOT, 'tools/xem-cu-dong.html'), 'utf8');
  ok(/index\.html\?xem-cu-dong/.test(tool), 'tools/xem-cu-dong.html mở được trang thử');

  // ---------- 0. công tắc CD_BAT tắt (mặc định): không dùng ảnh mới nào, mọi nhân vật vẽ hình cũ
  console.log('Công tắc tắt:');
  {
    const src = fs.readFileSync(path.join(ROOT, 'js/tu-cu-dong.js'), 'utf8');
    ok(/^const CD_BAT = false;/m.test(src), 'js/tu-cu-dong.js: const CD_BAT = false (chờ đủ 90 ảnh mới)');
    const page = await open(browser, 844, 390, '', false);
    const r = await page.evaluate(async () => {
      const ma = [...Object.keys(HEROES), ...Object.keys(ENEMIES)];
      const coAnh = ma.filter((k) => hasAsset(k + '.png'));
      const solo = ma.filter((k) => cdSoloImg(k, !HEROES[k]));
      const im = new Image(); im.src = 'assets/lactuong.png'; await im.decode();
      return { bat: cdBat(), coAnh: coAnh.length, solo, rig: cdBuildRig(cdPrepare(im), null) };
    });
    ok(!r.bat && r.coAnh >= 80 && r.solo.length === 0, `tắt: ${r.coAnh} mã có ảnh mới nhưng không mã nào dùng ảnh đơn (${r.solo.join(' ')})`);
    ok(r.rig === null, 'tắt: cdBuildRig trả null');
    await enter(page);
    await page.evaluate(() => { const g = ui.game; g.gold = 99999; for (let i = 0; i < 8; i++) g.summonRandom(); g.running = true; g.speed = 3; g.startWave(); });
    await sleep(3000);
    const st = await page.evaluate(() => ({ ...CD.stats, seen: [...CD.seen] }));
    ok(st.hero === 0 && st.enemy === 0 && st.seen.length === 0, `tắt: trong trận không vẽ ảnh đơn nào (${st.hero} tướng, ${st.enemy} quái)`);
    ok(page.errors.length === 0, 'tắt: không lỗi trang ' + page.errors.join(' | '));
    await page.screenshot({ path: path.join(SHOTS, 'tat-tran-844x390.jpg'), quality: 80 });
    await page.close();
  }

  // ---------- 6. chơi thật ?solo=1: tướng + quái vẽ bằng ảnh đơn, đo FPS so với bộ nhiều khung
  console.log('Trong trận:');
  const fps = {};
  for (const q of ['', '?solo=1']) {
    for (const [w, h] of SIZES) {
      const page = await open(browser, w, h, q);
      await enter(page);
      await page.evaluate(() => {
        const g = ui.game; g.gold = 99999; for (let i = 0; i < 10; i++) g.summonRandom();
        const sp = g.spawn.bind(g); g.spawn = (...a) => { const e = sp(...a); e.hp = e.maxHp = 1e9; return e; };
        g.wave = 29; g.nextWave = buildWave(30, g.level); g.lives = 9999; g.running = true; g.speed = 3; g.startWave();
        const base = g.spawnQueue.filter((s) => !s.champion); g.spawnQueue = []; for (let k = 0; k < 8; k++) g.spawnQueue.push(...base.map((s) => ({ ...s, gap: 0.25 })));
      });
      // đợi sân đông quái + (khi ép ảnh đơn) đã vẽ được tướng + quái bằng ảnh đơn — không đợi cố định
      await page.waitForFunction((solo) => ui.game.enemies.length >= 40 && (!solo || (CD.stats.hero > 0 && CD.stats.enemy > 0)), !!q, { timeout: 90000, polling: 250 });
      await sleep(1000);
      const r = await page.evaluate(() => new Promise((res) => { const s0 = { ...CD.stats }; let n = 0; const t0 = performance.now(); const f = (now) => { n++; if (now - t0 < 2500) requestAnimationFrame(f); else res({ fps: n / ((now - t0) / 1000), en: ui.game.enemies.length, hero: CD.stats.hero - s0.hero, enemy: CD.stats.enemy - s0.enemy, seen: [...CD.seen], root: [...CD.seen].filter((k) => hasAsset(k + '.png')).length }); }; requestAnimationFrame(f); }));
      fps[q + w] = r.fps;
      console.log(`  ${q || 'nhiều khung'} ${w}×${h}: ${r.fps.toFixed(1)} FPS · ${r.en} quái · vẽ ảnh đơn: ${r.hero} lượt tướng, ${r.enemy} lượt quái`);
      // ẩn bảng "bộ quái mới" / thông báo cho ảnh chụp thấy rõ sân
      await page.evaluate(() => { const r = document.querySelector('#roster-hint'); if (r) r.hidden = true; document.querySelectorAll('.toast, #toasts > *').forEach((e) => e.remove()); });
      await sleep(150);
      await page.screenshot({ path: path.join(SHOTS, `tran-${q ? 'anh-don' : 'nhieu-khung'}-${w}x${h}.jpg`), quality: 80 });
      if (q) ok(r.hero > 0 && r.enemy > 0, `${w}×${h}: ?solo=1 vẽ tướng + quái bằng ảnh đơn`);
      else ok(r.root === r.seen.length, `${w}×${h}: không ép thì chỉ mã có ảnh dựng xương <mã>.png dùng ảnh đơn (${r.seen.length} mã: ${r.seen.join(' ')}), còn lại giữ bộ cũ`);
      ok(page.errors.length === 0, `${w}×${h}: không lỗi trang ` + page.errors.join(' | '));
      await page.close();
    }
  }
  // FPS chỉ so khi máy rảnh (bản gốc ≥ 30 FPS); chạy song song nhiều test thì số đo nhiễu → in ra để tham khảo, không đánh lỗi
  for (const [w] of SIZES) {
    const a = fps['?solo=1' + w], b = fps[w], msg = `${w}: FPS ảnh đơn ${a.toFixed(1)} · nhiều khung ${b.toFixed(1)} (Chromium không GPU, tham khảo)`;
    if (b >= 30) ok(a >= b * 0.75, msg + ' — ảnh đơn ≥ 75%'); else console.log('  (máy bận, bỏ qua so FPS) ' + msg);
  }
  await browser.close();
  console.log('Tất cả đạt');
}
main().catch((e) => { console.error(e); process.exit(1); });
