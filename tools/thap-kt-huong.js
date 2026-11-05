// Kiểm thử HƯỚNG NHÌN quái khi ĐI THẬT trên đường (không dịch chỗ tay): SOLO / CO-OP / PVP / Test range (iframe preview).
// Khẳng định: quái có dải NGANG (HUONG8 '<loai>_<id>_side') đi ngang → vẽ dải _side_8 (sang trái = lật);
//             quái có dải SAU đi lên → vẽ dải _back_8; đi xuống → dải trước _8. Quái chưa có dải → dải trước + nghiêng nhẹ.
// + chụp dải khung bo/bay đi xuống / phải / trái / lên mỗi chế độ (390×844, DPR 3) → OUT/<mode>_<id>_<huong>.png + OUT/tong.png
// Chạy: python3 -m http.server 8765 (gốc repo) rồi  OUT=docs/demo-hop-tuong/tuvan/huongquai2/ node tools/thap-kt-huong.js
//   URL=https://nguyentung19955.github.io/new-project/thap/ … để chạy trên bản thật (bỏ bộ đệm)
const { chromium } = require('playwright');
const fs = require('fs'), { execFileSync } = require('child_process');
const OUT = process.env.OUT || 'shots/huong/';
const URL0 = process.env.URL || `http://localhost:${process.env.PORT || 8765}/thap/`;
const DPR = +(process.env.DPR || 3);
const ID = ['bo', 'bay'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const kq = { url: URL0, errs: [], sai: [], dem: {}, chuaCo: null };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR });
  await ctx.route('**/*', r => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache', pragma: 'no-cache' } })); // bỏ bộ đệm
  for (const mode of ['solo', 'coop', 'pvp']) {
    const p = await ctx.newPage();
    p.on('pageerror', e => kq.errs.push(mode + ': ' + e.message));
    await p.goto(URL0 + `?mode=${mode}&deck=lien,canon,bang,tia,set&wave=3&nointro=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.duong && G.duong.length && REN.img('quai_bo_8'), null, { timeout: 60000 });
    await p.waitForTimeout(1500);
    // dừng sinh quái/ụ bắn, rồi cho bo + bay đi THẬT từ đầu mỗi đường (mỗi đoạn: sinh ngay trước đoạn, đi qua bằng mô phỏng thường)
    await p.evaluate(() => { UI.canhBaoTrum = () => {}; G.cho = 1e9; G.hang.length = 0; for (const B of G.ban) { B.tim = 1e9; B.t.fill(null); B.ai = false; } G.quai.length = 0; });
    for (const id1 of ID) {
    const ds = await p.evaluate((ID) => {
      G.quai.length = 0; const ra = [];
      G.duong.forEach((pd, pi) => pd.segs.forEach((g, si) => {
        if (G.chung && pi === 1 && si > 0) return;
        const huong = Math.abs(g.dx) > Math.abs(g.dy) ? (g.dx > 0 ? 'phai' : 'trai') : (g.dy > 0 ? 'xuong' : 'len');
        ID.forEach((id, k) => { const E = sinhQuai(id, pi, g.s0 + g.len * 0.15); E.vao = 1; ra.push({ uid: E.uid, id, huong, pi, si, s1: g.s0 + g.len }); });
      }));
      // ghi lại dải thật sự được vẽ mỗi khung (hướng chính, không tính lớp hoà 120 ms)
      window._dai = {}; const o = REN.veQuai; if (!REN._ktHuong) REN._ktHuong = REN.veQuai = function (c) { o.call(this, c); for (const E of G.quai) if (!E.chet) { const t = this.tenQuai(E); (_dai[E.uid] = _dai[E.uid] || []).push([this.tenHuong(t, E._hv) || t, E._hl, E.s]); } };
      return ra;
    }, [id1]);
    // dải khung: 4 lần × 160 ms, cắt quanh từng quái
    for (let k = 0; k < 4; k++) {
      await p.waitForTimeout(k ? 160 : 900);
      const pos = await p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return G.quai.filter(E => !E.chet).map(E => ({ uid: E.uid, x: r.left + E.x / W * r.width, y: r.top + (E.y - (E.d.bay ? 6 : 0)) / H * r.height, co: E.d.co * r.width / W })); });
      for (const d of ds) {
        const q = pos.find(z => z.uid === d.uid); if (!q) continue;
        const c = Math.round(q.co * 1.5);
        const f = `${OUT}${mode}_${d.id}_${d.huong}_${d.pi}${d.si}_${k}.png`;
        await p.screenshot({ path: f, clip: { x: Math.max(0, q.x - c / 2), y: Math.max(0, q.y - c / 2), width: c, height: c } });
      }
    }
    const dai = await p.evaluate(() => _dai);
    for (const d of ds) {
      const ghi = (dai[d.uid] || []).filter(z => z[2] < d.s1 - 4); // chỉ khung khi còn trên đoạn đang xét
      const ten = d.id === 'bo' ? 'quai_bo' : 'quai_bay';
      const coSide = await p.evaluate(t => !!REN.tenHuong(t + '_8', 's'), ten), coBack = await p.evaluate(t => !!REN.tenHuong(t + '_8', 'b'), ten);
      const mong = d.huong === 'xuong' ? ten + '_8' : (d.huong === 'len' ? (coBack ? ten + '_back_8' : ten + '_8') : (coSide ? ten + '_side_8' : ten + '_8'));
      const dung = ghi.filter(z => z[0] === mong && (d.huong === 'trai' && coSide ? z[1] < 0 : d.huong === 'phai' && coSide ? z[1] > 0 : true)).length;
      const key = `${mode} ${d.id} ${d.huong}`; kq.dem[key] = `${dung}/${ghi.length} khung → ${mong}${d.huong === 'trai' && coSide ? ' (lật)' : ''}`;
      if (!ghi.length || dung / ghi.length < 0.9) kq.sai.push(key + ': ' + kq.dem[key] + ' — thấy ' + [...new Set(ghi.map(z => z[0]))].join(','));
    }
    }
    if (!kq.chuaCo) kq.chuaCo = await p.evaluate(() => {
      const ra = [], q = [...Object.keys(QUAI).map(id => 'quai_' + (QUAI[id].anh || id)), ...TRUM_THU_TU.map(t => 'trum_' + t)];
      for (const g of new Set(q)) { const m = []; if (!REN.tenHuong(g + '_8', 's')) m.push('ngang'); if (!REN.tenHuong(g + '_8', 'b')) m.push('sau'); if (m.length) ra.push(g + ': thiếu ' + m.join('+')); }
      return ra;
    });
    await p.close();
  }
  // Test range: iframe preview của trang ụ (unitpage.js) cũng vẽ bằng REN.veQuai → cùng đường chọn dải
  {
    const p = await ctx.newPage(); p.on('pageerror', e => kq.errs.push('preview: ' + e.message));
    await p.goto(URL0 + '?preview=lien', { waitUntil: 'load' }); await p.waitForTimeout(6000);
    kq.testRange = await p.evaluate(() => { const s = new Set(); for (const E of G.quai) if (!E.chet && E._hv) { const t = REN.tenQuai(E); s.add(E.id + ' ' + E._hv + ' → ' + (REN.tenHuong(t, E._hv) || t)); } return [...s]; }).catch(e => 'lỗi: ' + e.message);
    await p.close();
  }
  await b.close();
  try { execFileSync('python3', ['-c', `
import glob,os
from PIL import Image,ImageDraw
O=${JSON.stringify(OUT)}; hang=[]
for m in ['solo','coop','pvp']:
  for i in ['bo','bay']:
    for h in ['xuong','phai','trai','len']:
      for g in sorted({f.rsplit('_',1)[0] for f in glob.glob(O+f'{m}_{i}_{h}_*_0.png')}):
        hang.append((f'{m} {i} {h}',[Image.open(f'{g}_{k}.png').convert('RGB').resize((120,120)) for k in range(4) if os.path.exists(f'{g}_{k}.png')]))
W=170+4*124; c=Image.new('RGB',(W,len(hang)*124+4),(24,24,28)); d=ImageDraw.Draw(c)
for r,(t,ims) in enumerate(hang):
  d.text((6,r*124+56),t,fill=(240,240,240))
  for k,im in enumerate(ims): c.paste(im,(170+k*124,r*124+4))
c.save(O+'tong.png')
`]); } catch (e) { kq.errs.push('ghép: ' + e.message); }
  fs.writeFileSync(OUT + 'ketqua.json', JSON.stringify(kq, null, 1));
  console.log(JSON.stringify(kq, null, 1));
  process.exit(kq.sai.length || kq.errs.length ? 1 : 0);
})();
