"""Chụp ảnh tám hướng và bốn chiêu đặc biệt riêng để xem bằng mắt. Ảnh lưu vào docs/tam-huong-va-chieu/.
Chạy: python3 tests/tam_huong_shots.py [bang | tamhuong | gif]   (mặc định: chụp hết)
  bang:     bang-chieu.png  (bốn chiêu Đặc biệt, mỗi chiêu bốn hướng kể cả chéo)
  tamhuong: tam-huong.gif   (nhát lướt, chuỗi kiếm, đâm giáo, búa đánh lên, xuống, chéo) và tam-huong.png
  gif:      GIF từng chiêu (tram-nguyet.gif, phi-thuong.gif, dia-chan.gif, mua-ten.gif)"""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'tam-huong-va-chieu')

LIB = r"""
(() => {
  const T = (window.T = {});
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  T.frame = (i) => { if (i) inp = i; G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of PRESS) delete inp[q]; };
  T.CW = 230; T.CH = 160;
  // Phòng thử: em bé đứng giữa phòng, quái đứng yên (máu rất nhiều) ở các chỗ cho trước (lệch so với em bé, đo trên màn hình)
  T.room = function (type, el, dummies, o) {
    o = o || {};
    G.testSave({ hero: o.hero || 'smith', lvl: 12, melee: type === 'bow' ? 'sword' : type, tier: 2, branch: el || undefined, marks: el ? 300 : 0 });
    G.startStage(o.region == null ? 2 : o.region, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = []; W.banner = null; S.hint = null;
    for (const e of W.ents) e.dead = true;
    W.ents = [];
    if (type === 'bow') P.cur = 1;
    inp = {};
    for (let i = 0; i < 8; i++) T.frame({});
    W.banner = null;
    P.x = W.geo.cx; P.y = W.geo.cy + 6; P.face = 1; P.inv = 0; P.mana = P.maxmana; P.hp = P.maxhp; P.ldx = null; P.ldy = null;
    for (const d of dummies || []) { const e = G.spawnEnemy(d[2] || 'rusher', P.x + d[0], P.y + d[1], { hpMult: 1e5 }); e.st.stun = 1e9; e.inside = true; e.face = d[0] > 0 ? -1 : 1; }
    for (let i = 0; i < 70; i++) { T.frame({}); P.x = T.cx0 = P.x; } // chờ quái hiện hình xong
    W.zones = W.zones.filter((z) => z.team === 'player'); P.mana = P.maxmana; P.cdT = 0; P.specCd = 0;
    T.W = W; T.P = P; T.cx = P.x; T.cy = P.y;
    return W;
  };
  T.grab = function () {
    const cv = document.createElement('canvas');
    cv.width = T.CW; cv.height = T.CH;
    const x0 = Math.round(T.cx - T.W.cam) - (T.CW >> 1), y0 = Math.round(T.cy) - 96;
    cv.getContext('2d').drawImage(G.wx.canvas, x0, y0, T.CW, T.CH, 0, 0, T.CW, T.CH);
    return cv;
  };
  T.url = (cv, z) => { const c2 = document.createElement('canvas'); z = z || 3; c2.width = cv.width * z; c2.height = cv.height * z; const c = c2.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(cv, 0, 0, c2.width, c2.height); return c2.toDataURL('image/png'); };
  // Chạy một đòn: seq [[inp, số khung]], chụp ở các khung trong grabAt (đếm từ 1). Trả về danh sách ảnh (data URL, phóng to z).
  T.run = function (seq, grabAt, z) {
    const out = []; let n = 0;
    for (const s of seq) for (let k = 0; k < s[1]; k++) {
      const q = Object.assign({}, s[0]); if (k > 0) for (const p of PRESS) delete q[p];
      T.frame(q); n++;
      if (grabAt === 'all' || (grabAt && grabAt.includes(n))) out.push(T.url(T.grab(), z));
    }
    return out;
  };
  return true;
})()
"""

# tám hướng trên màn hình (dx, dy), quái đặt ở đó
DIRS = {'phải': (1, 0), 'trái': (-1, 0), 'lên': (0, -1), 'xuống': (0, 1), 'chéo lên phải': (0.72, -0.7), 'chéo lên trái': (-0.72, -0.7), 'chéo xuống phải': (0.72, 0.7), 'chéo xuống trái': (-0.72, 0.7)}


def dum(d, r, n=1, step=26):
    return [[round(d[0] * (r + i * step)), round(d[1] * (r + i * step) * 0.85)] for i in range(n)]


def img(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')


def label_sheet(rows, head, path):
    from PIL import ImageDraw, ImageFont
    try:
        F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    except Exception:
        F = f = ImageFont.load_default()
    cw, ch = rows[0][1][0][1].size
    cols = max(len(r[1]) for r in rows)
    W, H = 8 + cols * (cw + 8), 44 + len(rows) * (ch + 58)
    sh = Image.new('RGB', (W, H), (23, 17, 15))
    d = ImageDraw.Draw(sh)
    d.text((10, 10), head, fill=(255, 210, 122), font=F)
    for j, (title, shots) in enumerate(rows):
        y = 44 + j * (ch + 58)
        d.text((10, y + 4), title, fill=(241, 234, 217), font=F)
        for i, (lab, im) in enumerate(shots):
            x = 8 + i * (cw + 8)
            sh.paste(im, (x, y + 30))
            d.rectangle([x, y + 30 + ch - 24, x + len(lab) * 9 + 12, y + 30 + ch], fill=(23, 17, 15))
            d.text((x + 6, y + 30 + ch - 22), lab, fill=(255, 210, 122), font=f)
    sh.save(path)
    print('đã lưu', path)


def save_gif(frames, path, ms=50):
    ims = [img(u) for u in frames]
    ims[0].save(path, save_all=True, append_images=ims[1:], duration=ms, loop=0, optimize=True)
    print('đã lưu', path, len(ims), 'khung')


SPECIALS = [
    ('Kiếm: Trảm Nguyệt (Lửa)', 'sword', 'fire', 12),
    ('Giáo: Phi Thương (Băng)', 'spear', 'ice', 26),
    ('Búa: Địa Chấn (Độc)', 'hammer', 'poison', 16),
    ('Cung: Mưa Tên', 'bow', None, 20),
]


def main():
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        if what in ('all', 'bang'):
            rows = []
            for title, wt, el, at in SPECIALS:
                shots = []
                for dn in ['phải', 'chéo lên trái', 'xuống', 'chéo xuống phải']:
                    d = DIRS[dn]
                    pg.evaluate('([t, e, ds]) => T.room(t, e, ds)', [wt, el, dum(d, 46, 3, 30)])
                    u = pg.evaluate('([a]) => T.run([[{ specialP: true }, a]], [a])', [at])
                    shots.append((dn, img(u[0])))
                rows.append((title, shots))
            label_sheet(rows, 'Bốn chiêu Đặc biệt riêng, mỗi chiêu bốn hướng (tự ngắm quái gần nhất)', os.path.join(OUT, 'bang-chieu.png'))
        if what in ('all', 'tamhuong'):
            rows, gif = [], []
            moves = [
                ('Kiếm: chuỗi ba nhát', 'sword', 'fire', [[{'atk': True}, 40]], [6, 24, 36]),
                ('Kiếm: nhát lướt sau Né', 'sword', None, 'glide', None),
                ('Giáo: đâm', 'spear', 'ice', [[{'atk': True}, 2], [{}, 10]], [7]),
                ('Búa: nện', 'hammer', None, [[{'atk': True}, 2], [{}, 34]], [24]),
                ('Búa: nện tích lực nấc 2', 'hammer', 'poison', [[{'atk': True}, 80], [{}, 20]], [86]),
            ]
            for title, wt, el, seq, at in moves:
                shots = []
                for dn in ['lên', 'chéo xuống trái', 'xuống', 'chéo lên phải']:
                    d = DIRS[dn]
                    if seq == 'glide':
                        pg.evaluate('([t, e, ds]) => T.room(t, e, ds)', [wt, el, dum(d, 52)])
                        # né về phía quái rồi đánh ngay: lướt chém theo hướng đó
                        u = pg.evaluate('([dx, dy]) => T.run([[{ dodgeP: true, mx: dx, my: dy }, 17], [{ atk: true }, 2], [{}, 6]], "all")', [d[0], d[1]])
                        sel = u[19:21]
                        shots.append((dn, img(u[19])))
                        gif += u[10:25]
                        continue
                    pg.evaluate('([t, e, ds]) => T.room(t, e, ds)', [wt, el, dum(d, 30 if wt != 'spear' else 44)])
                    u = pg.evaluate('([s]) => T.run(s, "all")', [seq])
                    for a in at[:1] if len(at) > 1 else at:
                        shots.append((dn, img(u[a - 1])))
                    gif += u[: max(at) + 4: 2]
                rows.append((title, shots))
            label_sheet(rows, 'Tám hướng: đòn thường của kiếm, giáo, búa đánh lên, xuống, chéo', os.path.join(OUT, 'tam-huong.png'))
            save_gif(gif, os.path.join(OUT, 'tam-huong.gif'), 45)
        if what in ('all', 'gif'):
            names = {'sword': 'tram-nguyet', 'spear': 'phi-thuong', 'hammer': 'dia-chan', 'bow': 'mua-ten'}
            for title, wt, el, at in SPECIALS:
                fr = []
                for dn in ['chéo lên phải', 'trái', 'chéo xuống trái']:
                    pg.evaluate('([t, e, ds]) => T.room(t, e, ds)', [wt, el, dum(DIRS[dn], 46, 3, 30)])
                    u = pg.evaluate('() => T.run([[{ specialP: true }, 1], [{}, 75]], "all")')
                    fr += u[::2]
                save_gif(fr, os.path.join(OUT, names[wt] + '.gif'), 40)
        b.close()
    if errs:
        print('LỖI:', errs[:5]); sys.exit(1)


main()
