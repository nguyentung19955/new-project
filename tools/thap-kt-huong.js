// Kiểm thử HƯỚNG NHÌN quái / TINH ANH / TRÙM khi ĐI THẬT trên đường (không dịch chỗ tay): SOLO / CO-OP / PVP / Test range (iframe preview).
// Khẳng định (mọi loại quái thường, tinh anh khong_lo/que_tach, 6 trùm cũ + 6 trùm mới):
//   đi ngang → dải NGANG '<ten>_side_8' (sang trái: dải '_left_8' nếu có, không thì lật dải phải) nếu đã có, chưa có → dải trước + nghiêng nhẹ;
//   đi lên → dải SAU '_back_8' nếu có; đi xuống → dải trước '_8'. Trùm: chỉ nhìn màn hình lúc vừa vào (0,9 s) và lúc tung chiêu;
//   trùm có dải ĐÁNH (trum_<id>_atk_16) → lúc báo chiêu vẽ dải đánh.
// (huong4) + BẮT BUỘC đủ ảnh trước/ngang/sau cho tinh anh + 12 trùm (CAN_DU) — thiếu = sai;
//   MỌI trùm lúc tung chiêu: nhìn về BÀN (dải trước / dải đánh), xong quay lại dải theo hướng làn; chụp dải khung lúc tung chiêu;
//   hiệu ứng chiêu rời fx_trum_<id> (TRUM_FX) phát được (ảnh nạp, đủ 16 khung) · TWIN CORE chết → dải lõi nứt tại chỗ;
//   không 404, không lỗi trang.
// + chụp dải khung mỗi loại đi xuống / phải / trái / lên mỗi chế độ (390×844, DPR 3) → OUT/<mode>_<id>_<huong>_*.png + OUT/tong_<mode>.png
// + đo fps mỗi chế độ (đủ quái + trùm trên đường) → ketqua.json
// Chạy: python3 -m http.server 8765 (gốc repo) rồi  OUT=docs/demo-hop-tuong/tuvan/huong3/ node tools/thap-kt-huong.js
//   ID=bo,bay,T:hive  → chỉ các loại đó (T:<id> = trùm) · URL=https://nguyentung19955.github.io/new-project/thap/ … để chạy trên bản thật
const { chromium } = require('playwright');
const fs = require('fs'), { execFileSync } = require('child_process');
const OUT = process.env.OUT || 'shots/huong/';
const URL0 = process.env.URL || `http://localhost:${process.env.PORT || 8765}/thap/`;
const DPR = +(process.env.DPR || 3);
const ID0 = process.env.ID ? process.env.ID.split(',') : null;
const MODES = (process.env.MODES || 'solo,coop,pvp').split(',');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const kq = { url: URL0, errs: [], sai: [], dem: {}, fps: {}, danh: {}, chieu: {}, fx: {}, chuaCo: null, h404: [] };
  const CAN_DU = ['bay', 'bay_bang', 'tach', 'que_tach', 'khong_lo', 'T:freezer', 'T:nightmare', 'T:mad_crown', 'T:janus', 'T:joker_king', 'T:octopus',
    'T:prism', 'T:twin_core', 'T:patcher', 'T:leech', 'T:hive', 'T:jammer'];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR });
  await ctx.route('**/*', r => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache', pragma: 'no-cache' } })); // bỏ bộ đệm
  let IDS = null;
  for (const mode of MODES) {
    const p = await ctx.newPage();
    p.on('pageerror', e => kq.errs.push(mode + ': ' + e.message));
    let doThu = false; // lúc bộ kiểm tự dò mọi tên dải có thể (…_left_8, …_atk_16) → 404 đó là của bộ kiểm, không phải của game
    const do404 = new Set(); // tên bộ kiểm tự dò bị 404 (kể cả lần tải lại ?r=2 của game sau đó) — bỏ qua
    p.on('response', r => { if (r.status() !== 404) return; const t = r.url().split('?')[0].split('/').pop();
      if (doThu) do404.add(t); else if (!do404.has(t)) kq.h404.push(mode + ': ' + r.url()); });
    await p.goto(URL0 + `?mode=${mode}&deck=lien,canon,bang,tia,set&wave=3&nointro=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.duong && G.duong.length && REN.img('quai_bo_8'), null, { timeout: 60000 });
    await p.waitForTimeout(1500);
    if (!IDS) IDS = ID0 || await p.evaluate(() => [...Object.keys(QUAI).filter(id => id !== 'nho'), ...(typeof TRUM_POOL !== 'undefined' ? TRUM_POOL : TRUM_THU_TU).map(t => 'T:' + t)]);
    // dừng sinh quái/ụ bắn; nạp sẵn mọi dải (trận chỉ nạp ảnh của trùm sẽ ra)
    doThu = true;
    await p.evaluate(async (IDS) => {
      UI.canhBaoTrum = () => {}; G.cho = 1e9; G.hang.length = 0; for (const B of G.ban) { B.tim = 1e9; B.t.fill(null); B.ai = false; } G.quai.length = 0;
      const ds = [];
      for (const k of IDS) { const t = k.startsWith('T:') ? 'trum_' + k.slice(2) : 'quai_' + k; ds.push(t + '_8', t + '_side_8', t + '_back_8', t + '_left_8', t + '_atk_16'); }
      for (const t of TRUM_THU_TU) ds.push('trum_' + t, 'trum_' + t + '_8');
      ds.forEach(n => REN.img(n)); await new Promise(r => setTimeout(r, 2500));
    }, IDS);
    await p.waitForTimeout(500); doThu = false;
    const sinh = (k, pi, s) => { // chạy trong trang
      if (!k.startsWith('T:')) return sinhQuai(k, pi, s);
      const E = sinhTrum(k.slice(2), pi, 1), P = G.duong[pi]; E.s = s; [E.x, E.y, E.goc] = viTri(P, s); E.knT = 1e9; E._t0 = -9; return E;
    };
    for (const id1 of IDS) {
      const ds = await p.evaluate(([id, sinhS]) => {
        const sinh = eval('(' + sinhS + ')');
        G.quai.length = 0; const ra = [];
        G.duong.forEach((pd, pi) => pd.segs.forEach((g, si) => {
          if (G.chung && pi === 1 && si > 0) return;
          if (g.len < 60) return; // đoạn quá ngắn (khúc nối) — không đủ đi hết hoà hướng
          const huong = Math.abs(g.dx) > Math.abs(g.dy) ? (g.dx > 0 ? 'phai' : 'trai') : (g.dy > 0 ? 'xuong' : 'len');
          const E = sinh(id, pi, g.s0 + g.len * 0.15); E.vao = 1; E._t0 = -9;
          ra.push({ uid: E.uid, id, huong, pi, si, s1: g.s0 + g.len, ten: REN.tenQuai(E) });
        }));
        window._dai = {}; const o = REN.veQuai;
        if (!REN._ktHuong) REN._ktHuong = REN.veQuai = function (c) { o.call(this, c); for (const E of G.quai) if (!E.chet) (_dai[E.uid] = _dai[E.uid] || []).push([E._tHv, E._lat, E.s]); };
        return ra;
      }, [id1, sinh.toString()]);
      for (let k = 0; k < 4; k++) {
        await p.waitForTimeout(k ? 160 : 900);
        const pos = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return G.quai.filter(E => !E.chet).map(E => ({ uid: E.uid, x: r.left + E.x / W * r.width, y: r.top + (E.y - (E.d.bay ? 6 : 0)) / H * r.height, co: E.d.co * r.width / W })); });
        for (const d of ds) {
          const q = pos.find(z => z.uid === d.uid); if (!q) continue;
          const c = Math.round(q.co * 1.5);
          await p.screenshot({ path: `${OUT}${mode}_${d.id.replace(':', '_')}_${d.huong}_${d.pi}${d.si}_${k}.png`, clip: { x: Math.max(0, q.x - c / 2), y: Math.max(0, q.y - c / 2), width: c, height: c } });
        }
      }
      const dai = await p.evaluate(() => _dai);
      for (const d of ds) {
        const ghi = (dai[d.uid] || []).filter(z => z[2] < d.s1 - 4);
        const [sS, sB, sL] = await p.evaluate(t => [REN.tenHuong(t, 's'), REN.tenHuong(t, 'b'), REN.tenTrai ? REN.tenTrai(t) : null], d.ten);
        let mong = d.ten, lat = 0;
        if (d.huong === 'len' && sB) mong = sB;
        if (d.huong === 'phai' && sS) { mong = sS; lat = 1; }
        if (d.huong === 'trai' && (sL || sS)) { mong = sL || sS; lat = sL ? 1 : -1; }
        const dung = ghi.filter(z => z[0] === mong && (!lat || z[1] === lat)).length;
        const key = `${mode} ${d.id} ${d.huong} ${d.pi}${d.si}`;
        kq.dem[key] = `${dung}/${ghi.length} khung → ${mong}${lat < 0 ? ' (lật)' : ''}${mong === d.ten && d.huong !== 'xuong' ? ' (chưa có ảnh hướng này: dải trước + nghiêng)' : ''}`;
        if (!ghi.length || dung / ghi.length < 0.9) kq.sai.push(key + ': ' + kq.dem[key] + ' — thấy ' + [...new Set(ghi.map(z => z[0]))].join(','));
      }
    }
    // MỌI trùm tung chiêu: nhìn về BÀN (dải trước '_8' hoặc dải đánh '_atk_16') suốt lúc báo chiêu, xong quay lại hướng làn; chụp 4 khung
    const tIds = IDS.filter(k => k.startsWith('T:')).map(k => k.slice(2));
    for (const id of tIds) {
      const r = await p.evaluate(async (id) => {
        G.quai.length = 0; window._dai = {};
        // đoạn NGANG dài nhất của đường 0 → trước chiêu phải nhìn nghiêng, lúc chiêu nhìn bàn, sau chiêu nghiêng lại
        const P = G.duong[0], g = P.segs.filter(z => Math.abs(z.dx) > Math.abs(z.dy)).sort((a, b) => b.len - a.len)[0] || P.segs[0];
        const E = sinhTrum(id, 0, 1); E.s = g.s0 + g.len * 0.2; [E.x, E.y, E.goc] = viTri(P, E.s); E.vao = 1; E._t0 = -9; E.knT = 1e9;
        const truoc = REN.tenQuai(E), danh = REN.tenDanh(E) || null;
        await new Promise(r => setTimeout(r, 450));
        E.bao = { t: 0, song: 1.4, muc: [] }; const n0 = (_dai[E.uid] || []).length;
        window._ktE = E; return { n0, truoc, danh, uid: E.uid, side: REN.tenHuong(truoc, 's') };
      }, id);
      const cv = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(), E = _ktE; return { x: r.left + E.x / W * r.width, y: r.top + E.y / H * r.height, co: E.d.co * r.width / W }; });
      const c = Math.round(cv.co * 1.6);
      for (let k = 0; k < 4; k++) { await p.waitForTimeout(k ? 260 : 200); await p.screenshot({ path: `${OUT}${mode}_T_${id}_chieu_00_${k}.png`, clip: { x: Math.max(0, cv.x - c / 2), y: Math.max(0, cv.y - c / 2), width: c, height: c } }); }
      const r2 = await p.evaluate(async () => { const E = _ktE, n1 = (_dai[E.uid] || []).length; E.bao = null; await new Promise(r => setTimeout(r, 500)); return { n1, g: _dai[E.uid] || [] }; });
      const lc = r2.g.slice(r.n0 + 2, r2.n1), sau = r2.g.slice(r2.n1 + 12);
      const dung = lc.filter(z => z[0] === r.truoc || z[0] === r.danh).length, quay = sau.filter(z => z[0] === (r.side || r.truoc)).length;
      kq.chieu[mode + ' ' + id] = `nhìn bàn ${dung}/${lc.length} (${r.danh || r.truoc}) · sau chiêu về làn ${quay}/${sau.length} (${r.side || r.truoc})`;
      if (!lc.length || dung / lc.length < 0.9) kq.sai.push(`${mode} T:${id} tung chiêu không nhìn bàn: ${kq.chieu[mode + ' ' + id]}`);
      if (!sau.length || quay / sau.length < 0.9) kq.sai.push(`${mode} T:${id} sau chiêu không quay lại hướng làn: ${kq.chieu[mode + ' ' + id]}`);
    }
    kq.danh[mode] = await p.evaluate(() => Object.fromEntries([...(typeof TRUM_ATK !== 'undefined' ? TRUM_ATK : [])].map(id => [id, !!REN.img('trum_' + id + '_atk_16')])));
    // hiệu ứng chiêu rời (fx_trum_<id>): TRM.fx phát đúng ảnh, ảnh nạp được, đủ 16 khung · TWIN CORE chết → dải lõi nứt
    kq.fx[mode] = await p.evaluate(async () => {
      const ra = {};
      for (const id of TRUM_FX) { REN.img('fx_trum_' + id); }
      await new Promise(r => setTimeout(r, 1500));
      for (const id of TRUM_FX) {
        const n = FX.anim.length; TRM.fx(id, 'no_phao', 200, 300, 100, 0.5);
        const A = FX.anim[FX.anim.length - 1], im = REN.img('fx_trum_' + id);
        ra[id] = (FX.anim.length > n || A.ten === 'trum_' + id) && A.ten === 'trum_' + id && im ? Math.round(im.width / im.height) + ' khung' : 'LỖI';
      }
      G.quai.length = 0; const P = G.duong[0], E = sinhTrum('twin_core', 0, 1); E.s = P.len * 0.4; [E.x, E.y, E.goc] = viTri(P, E.s); E.vao = 1; E.knT = 1e9;
      REN.img('trum_twin_core_atk_16'); await new Promise(r => setTimeout(r, 300));
      chet(E, G.ban[E.ban]); ra.twin_core_nut = REN._nut.length ? 'dải nứt ' + REN._nut[REN._nut.length - 1].g + ' + ' + G.quai.filter(q => q.con && !q.chet).length + ' lõi con' : 'LỖI';
      return ra;
    });
    for (const [id, v] of Object.entries(kq.fx[mode])) if (/LỖI/.test(v) || (id !== 'twin_core_nut' && v !== '16 khung')) kq.sai.push(`${mode} fx ${id}: ${v}`);
    // fps: đủ loại quái + 2 trùm trên mọi đường, đo 3 s
    kq.fps[mode] = await p.evaluate(async (IDS) => {
      G.quai.length = 0;
      G.duong.forEach((pd, pi) => { IDS.forEach((k, j) => { if (k.startsWith('T:') && j % 6) return; const s = (j * 37) % Math.max(1, pd.len - 10);
        if (k.startsWith('T:')) { const E = sinhTrum(k.slice(2), pi, 1); E.s = s; [E.x, E.y, E.goc] = viTri(pd, s); E.knT = 1e9; } else sinhQuai(k, pi, s); }); });
      let n = 0; const t0 = performance.now();
      await new Promise(r => { const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
      return Math.round(n / ((performance.now() - t0) / 1000));
    }, IDS);
    if (kq.fps[mode] < 50) kq.sai.push(`${mode}: fps ${kq.fps[mode]} < 50`);
    if (!kq.chuaCo) kq.chuaCo = await p.evaluate((IDS) => {
      const ra = [];
      for (const k of IDS) {
        const E = k.startsWith('T:') ? { trum: k.slice(2), d: {}, id: k.slice(2) } : { d: QUAI[k], id: k };
        const g = REN.tenQuai(E), m = [];
        if (!REN.tenHuong(g, 's')) m.push('ngang'); if (!REN.tenHuong(g, 'b')) m.push('sau');
        if (k.startsWith('T:') && TRUM_MOI[k.slice(2)] && !TRUM_ANH.has(k.slice(2))) m.push('cả dải trước (đang mượn ' + g + ')');
        if (m.length) ra.push(k + ': thiếu ' + m.join(' + '));
      }
      return ra;
    }, IDS);
    for (const z of kq.chuaCo || []) if (CAN_DU.includes(z.split(':').slice(0, z.startsWith('T:') ? 2 : 1).join(':'))) { if (!kq.sai.includes('thiếu ảnh ' + z)) kq.sai.push('thiếu ảnh ' + z); }
    await p.close();
  }
  // Test range: iframe preview của trang ụ (unitpage.js) cũng vẽ bằng REN.veQuai → cùng đường chọn dải
  {
    const p = await ctx.newPage(); p.on('pageerror', e => kq.errs.push('preview: ' + e.message));
    await p.goto(URL0 + '?preview=lien', { waitUntil: 'load' }); await p.waitForTimeout(6000);
    kq.testRange = await p.evaluate(() => { const s = new Set(); for (const E of G.quai) if (!E.chet && E._hv) s.add(E.id + ' ' + E._hv + ' → ' + E._tHv); return [...s]; }).catch(e => 'lỗi: ' + e.message);
    await p.close();
  }
  await b.close();
  try { execFileSync('python3', ['-c', `
import glob,os,re
from PIL import Image,ImageDraw
O=${JSON.stringify(OUT)}; IDS=${JSON.stringify((IDS || []).map(s => s.replace(':', '_')))}
for m in ${JSON.stringify(MODES)}:
  hang=[]
  for i in IDS:
    for h in ['xuong','phai','trai','len','chieu']:
      gs=sorted({f.rsplit('_',1)[0] for f in glob.glob(O+f'{m}_{i}_{h}_*_0.png')})
      if not gs: continue
      g=gs[0]
      hang.append((f'{i} {h}',[Image.open(f'{g}_{k}.png').convert('RGB').resize((110,110)) for k in range(4) if os.path.exists(f'{g}_{k}.png')]))
  if not hang: continue
  W=150+4*114; c=Image.new('RGB',(W,len(hang)*114+4),(24,24,28)); d=ImageDraw.Draw(c)
  for r,(t,ims) in enumerate(hang):
    d.text((6,r*114+50),t,fill=(240,240,240))
    for k,im in enumerate(ims): c.paste(im,(150+k*114,r*114+4))
  c.save(O+f'tong_{m}.png')
`]); } catch (e) { kq.errs.push('ghép: ' + e.message); }
  fs.writeFileSync(OUT + 'ketqua.json', JSON.stringify(kq, null, 1));
  if (kq.h404.length) kq.sai.push('404: ' + [...new Set(kq.h404)].slice(0, 10).join(' , '));
  console.log(JSON.stringify({ sai: kq.sai, errs: kq.errs, chieu: kq.chieu, fx: kq.fx, h404: kq.h404.length, fps: kq.fps, danh: kq.danh, chuaCo: kq.chuaCo, testRange: kq.testRange }, null, 1));
  process.exit(kq.sai.length || kq.errs.length ? 1 : 0);
})();
