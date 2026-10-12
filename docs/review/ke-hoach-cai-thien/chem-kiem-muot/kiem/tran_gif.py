"""Trong trận thật (luật game thật, có vệt chém, khựng hình): 4 em bé cầm kiếm đánh bia, vẽ MỌI khung 60 fps, cắt quanh em bé.
Cảnh: 'dung' giữ nút Đánh 1,3 giây (chuỗi 3 nhát liên tục) rồi thả; 'chay' vừa chạy sang phải vừa giữ Đánh; 'trai' bia bên trái.
Ghi: khung gây sát thương (P.hitDone đổi), góc kiếm lúc đó, tổng sát thương lên bia (để so trước / sau: phải bằng nhau).
Chạy: python3 tran_gif.py <url trước> <url sau> <thư mục ra> [rộng cao dpr]   (mặc định iPhone ngang 844 390 3)"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

U0, U1, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
VW, VH, DPR = (int(sys.argv[4]), int(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else (844, 390, 3)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game')
os.makedirs(OUT, exist_ok=True)
JS = r"""([canh]) => {
  const KEYS = ['smith','hunter','wrestler','healer'], K = 3, CW = 84, CH = 66, NF = canh === 'dung' ? 110 : 90;
  const out = [], info = {};
  for (let i = 0; i < NF; i++) { const c = document.createElement('canvas'); c.width = CW * K * 4; c.height = CH * K; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); out.push(c); }
  KEYS.forEach((k, j) => {
    const { W, P } = AU.room({ hero: k, melee: 'sword', lvl: 10 });
    AU.want(P, 'sword');
    const dx = canh === 'trai' ? -30 : 30, e = AU.dummy(P.x + dx, P.y, { hp: 1e7 });
    if (canh === 'trai') P.face = -1;
    AU.run(30, true);
    const hits = [];
    let f = 0, done = P.hitDone;
    const cnt = AU.count(() => {
      AU.press({ atk: true, atkP: true, mx: canh === 'chay' ? 1 : 0 });
      AU.run(NF, true, () => {
        if (canh !== 'chay') AU.pin([{ e, x: P.x + dx, y: P.y }]); else AU.pin([{ e, x: P.x + 26, y: P.y }]);
        if (f === (canh === 'dung' ? 78 : 60)) { AU.inp.atk = false; AU.inp.mx = 0; }
        if (f >= NF) return false;
        try { G.drawWorld(G.getRun().r); } catch (er) { info.err = String(er); }
        const cv = G.wx.canvas, sc = cv.width / G.W, cam = Math.round(W.cam);
        out[f].getContext('2d').drawImage(cv, (P.x - cam - CW / 2) * sc, (P.y - CH + 14) * sc, CW * sc, CH * sc, j * CW * K, 0, CW * K, CH * K);
        if (P.hitDone && !done) { const q = G.tinhLinh.tip(G.heroArgs(P)); hits.push([f, P.comboI, q ? Math.round(Math.atan2(q.dy, q.dx * (P.face < 0 ? -1 : 1)) * 180 / Math.PI) : null]); }
        done = P.hitDone; f++;
      });
    });
    info[k] = { hits, dmg: Math.round(cnt.dmg), n: cnt.hits };
  });
  return { png: out.map((c) => c.toDataURL()), info };
}"""


def chup(url):
    kq, loi = {}, []
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=DPR); g = ctx.new_page()
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto(url)
        g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=240000)
        g.wait_for_timeout(2000)
        for f in ('bot.js', 'setup.js', 'au_lib.js'): g.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        for canh in ('dung', 'chay', 'trai'): kq[canh] = g.evaluate(JS, [canh])
        b.close()
    print(url, 'pageerror:', loi or 'không có')
    return kq


A, B = chup(U0), chup(U1)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception: font = ImageFont.load_default()
TEN = ['Cu Tí', 'Cu Tèo', 'Cu Lì', 'Cái Bống']
tom = {}
for canh in ('dung', 'chay', 'trai'):
    tom[canh] = {'truoc': A[canh]['info'], 'sau': B[canh]['info']}
    fr = []
    for i in range(0, len(A[canh]['png']), 2):
        a = Image.open(io.BytesIO(base64.b64decode(A[canh]['png'][i].split(',')[1]))).convert('RGB')
        b = Image.open(io.BytesIO(base64.b64decode(B[canh]['png'][i].split(',')[1]))).convert('RGB')
        W, H = a.size
        im = Image.new('RGB', (W, 2 * H + 22), '#1d2620'); im.paste(a, (0, 22)); im.paste(b, (0, H + 22))
        d = ImageDraw.Draw(im)
        for j, t in enumerate(TEN): d.text((j * W // 4 + 8, 3), t, fill='#ffffff', font=font)
        d.text((4, 26), 'TRƯỚC', fill='#ffb0b0', font=font); d.text((4, H + 26), 'SAU', fill='#b0ffb0', font=font)
        fr.append(im.quantize(colors=128, method=Image.Quantize.MEDIANCUT))
    fn = os.path.join(OUT, f'tran-{canh}.gif')
    fr[0].save(fn, save_all=True, append_images=fr[1:], duration=33, loop=0, optimize=True, disposal=1)
    print(canh, len(fr), 'khung', os.path.getsize(fn) // 1024, 'KB')
json.dump(tom, open(os.path.join(OUT, 'tran-so.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(tom, ensure_ascii=False))
