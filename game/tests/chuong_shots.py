"""Chụp ảnh và GIF của CHƯỞNG để xem bằng mắt. Ảnh lưu vào docs/chuong/.
Chạy: python3 tests/chuong_shots.py [bang | gif | ui]   (mặc định: chụp hết)
  bang: ba-chuong.png   ba loại chưởng (Hỏa, Độc, Băng) lúc bay, lúc trúng, sau khi trúng; chuong-8-huong.png (bắn tám hướng)
  gif:  hoa-chuong.gif, doc-chuong.gif, bang-chuong.gif (mỗi cây đã học nhiều nút: tích lực, tách 3 luồng, xuyên quái...)
  ui:   cu-do-cay-chuong.png (thẻ Cây chưởng ở Cụ Đồ), hanh-trang-chuong.png (Hành trang, thẻ Kỹ năng), nut-chuong.png (nút Chưởng),
        doc-cay-chuong.png (thẻ Cây chưởng khi cầm dọc, khung bị xoay)"""
import base64, io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'chuong')

LIB = r"""
(() => {
  const T = (window.T = {});
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  T.frame = (i) => { if (i) inp = i; G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of PRESS) delete inp[q]; };
  T.CW = 240; T.CH = 150;
  // cay: cây chưởng, n: các nút đã học, dummies: [dx, dy, vai] lệch so với em bé (trên màn hình)
  T.room = function (cay, n, dummies, o) {
    o = o || {};
    G.testSave({ hero: o.hero || 'smith', lvl: 30, tier: 2 });
    const hs = G.save.heroes[o.hero || 'smith'];
    hs.ch = { cay, n: Object.assign({}, n || {}) };
    G.startStage(o.region == null ? 0 : o.region, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = []; W.banner = null; S.hint = null;
    for (const e of W.ents) e.dead = true;
    W.ents = [];
    inp = {};
    for (let i = 0; i < 8; i++) T.frame({});
    W.banner = null;
    P.x = W.geo.cx - (o.left || 40); P.y = W.geo.cy + 6; P.face = 1; P.inv = 0; P.mana = P.maxmana; P.hp = P.maxhp; P.ldx = null; P.ldy = null;
    for (const d of dummies || []) { const e = G.spawnEnemy(d[2] || 'rusher', P.x + d[0], P.y + d[1], { hpMult: 1e5 }); e.st.root = 1e9; e.inside = true; e.face = d[0] > 0 ? -1 : 1; e.speed = 0; e.cd = 1e9; /* đứng yên (không choáng: quái choáng nhấp nháy trắng) */ }
    for (let i = 0; i < 70; i++) T.frame({});
    W.zones = W.zones.filter((z) => z.team === 'player'); P.mana = P.maxmana; P.cdT = 0; P.specCd = 0; P.skillCd = 0;
    T.W = W; T.P = P; T.cx = P.x + (o.shift || 40); T.cy = P.y;
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
  T.run = function (seq, grabAt, z) {
    const out = []; let n = 0;
    for (const s of seq) for (let k = 0; k < s[1]; k++) {
      const q = Object.assign({}, s[0]); if (k > 0) for (const p of PRESS) delete q[p];
      T.P.inv = 9;
      T.frame(q); n++;
      if (grabAt === 'all' || (grabAt && grabAt.includes(n))) out.push(T.url(T.grab(), z));
    }
    return out;
  };
  return true;
})()
"""


def img(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')


def fonts():
    try:
        return (ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22), ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17))
    except Exception:
        return (ImageFont.load_default(), ImageFont.load_default())


def sheet(rows, cols, head, path):
    F, f = fonts()
    w0, h0 = rows[0][1][0].size
    LW, TH = 190, 34
    out = Image.new('RGB', (LW + w0 * len(cols) + 6 * len(cols), 44 + TH + (h0 + 6) * len(rows)), (20, 16, 22))
    d = ImageDraw.Draw(out)
    d.text((10, 10), head, fill=(255, 220, 140), font=F)
    for j, cname in enumerate(cols):
        d.text((LW + j * (w0 + 6) + 6, 44), cname, fill=(220, 220, 200), font=f)
    for i, (name, ims) in enumerate(rows):
        y = 44 + TH + i * (h0 + 6)
        for k, line in enumerate(name.split('\n')):
            d.text((10, y + 10 + k * 22), line, fill=(255, 240, 200) if k == 0 else (190, 200, 190), font=F if k == 0 else f)
        for j, im in enumerate(ims):
            out.paste(im, (LW + j * (w0 + 6), y))
    out.save(path)
    print('đã lưu', path)


def gif(frames, path, ms=50):
    ims = [img(u) for u in frames]
    ims[0].save(path, save_all=True, append_images=ims[1:], duration=ms, loop=0, optimize=True)
    print('đã lưu', path, len(ims), 'khung')


def open_page(p, vp=None):
    b = p.chromium.launch()
    pg = b.new_page(viewport=vp or {'width': 960, 'height': 540})
    pg.goto('file://' + ROOT + '/index.html')
    pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=ROOT + '/tests/bot.js')
    pg.add_script_tag(path=ROOT + '/tests/setup.js')
    pg.evaluate(LIB)
    return b, pg


def shots_bang(pg):
    rows = []
    D = [[60, 0], [70, 14], [96, -6]]
    for cay, ten, n in [('hoa', 'Hỏa chưởng\ncầu lửa nổ lan', {'luc': 3, 'no': 3}), ('doc', 'Độc chưởng\nmây độc', {'luc': 3, 'may': 3}), ('bang', 'Băng chưởng\nxuyên, làm chậm', {'luc': 3, 'xuyen': 2})]:
        pg.evaluate("([c, n, d]) => T.room(c, n, d)", [cay, n, D])
        urls = pg.evaluate("() => T.run([[{ skillP: true }, 1], [{}, 70]], [6, 13, 22, 60])")
        rows.append((ten, [img(u) for u in urls]))
    sheet(rows, ['đang bay', 'trúng', 'sau khi trúng', 'một lúc sau'], 'Ba loại chưởng: bay, trúng, để lại', os.path.join(OUT, 'ba-chuong.png'))
    # tám hướng (Băng chưởng nhìn rõ hướng nhất)
    ims = []
    for dx, dy in [(1, 0), (0.72, -0.7), (0, -1), (-0.72, -0.7), (-1, 0), (-0.72, 0.7), (0, 1), (0.72, 0.7)]:
        pg.evaluate("([d]) => T.room('bang', { luc: 2 }, [d], { left: 0, shift: 0 })", [[round(dx * 74), round(dy * 58)]])
        ims.append(img(pg.evaluate("() => T.run([[{ skillP: true }, 1], [{}, 7]], [7])")[0]))
    rows = [('Băng chưởng\n4 hướng', ims[:4]), ('\n4 hướng còn lại', ims[4:])]
    sheet(rows, ['', '', '', ''], 'Chưởng tự ngắm quái gần nhất theo tám hướng', os.path.join(OUT, 'chuong-8-huong.png'))


def shots_gif(pg):
    D = [[60, 0], [72, 16], [90, -10], [110, 4]]
    pg.evaluate("([d]) => T.room('hoa', { luc: 5, no: 5, vet: 5, dai: 3, tich: 3, tan: 3 }, d)", [D])
    fr = pg.evaluate("() => T.run([[{ skillP: true }, 1], [{}, 40], [{ skillP: true, skill: true }, 1], [{ skill: true }, 60], [{}, 60]], 'all', 2)")
    gif(fr[::2], os.path.join(OUT, 'hoa-chuong.gif'))
    pg.evaluate("([d]) => T.room('doc', { luc: 5, may: 5, lay: 5, mon: 3, tach: 3, hut: 1 }, d)", [D])
    fr = pg.evaluate("() => T.run([[{ skillP: true }, 1], [{}, 120]], 'all', 2)")
    gif(fr[::2], os.path.join(OUT, 'doc-chuong.gif'))
    pg.evaluate("([d]) => T.room('bang', { luc: 5, xa: 5, xuyen: 5, dong: 5, vo: 3, phong: 1 }, d)", [[[40, 0], [62, 0], [84, 0], [106, 0]]])
    fr = pg.evaluate("() => T.run([[{ skillP: true }, 1], [{}, 50], [{ skillP: true }, 1], [{}, 60]], 'all', 2)")
    gif(fr[::2], os.path.join(OUT, 'bang-chuong.gif'))


UI = r"""
(o) => {
  G.testSave({ hero: 'smith', lvl: o.lvl || 24, tier: 2 });
  const hs = G.save.heroes.smith; hs.ch = { cay: o.cay || 'hoa', n: o.n || {} };
  G.save.gold = 900; G.setScene(G.Village);
  return true;
}
"""


def shots_ui(p):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from ui_lib import Game
    for size, name in [('phone', 'cu-do-cay-chuong.png'), ('port', 'doc-cay-chuong.png')]:
        g = Game(p, size)
        g.pg.add_script_tag(path=ROOT + '/tests/setup.js')
        g.ev(UI, {'lvl': 24, 'cay': 'hoa', 'n': {'luc': 5, 'no': 4, 'vet': 2, 'dai': 3, 'tich': 1}})
        g.ev("G.villageApi.open('do'); G.villageApi.V.tab = 'chuong'; G.villageApi.V.dtab = 'chuong'"); g.wait(300)
        g.tap(*g.ev("G.chuongUI.nodeXY('hoa', 'tich')")); g.wait(200)
        g.shot(os.path.join(OUT, name)); print('đã lưu', name)
        g.close()
    g = Game(p, 'phone')
    g.pg.add_script_tag(path=ROOT + '/tests/setup.js')
    g.ev(UI, {'lvl': 24, 'cay': 'doc', 'n': {'luc': 3, 'may': 5, 'lay': 2, 'tach': 2}})
    g.ev("G.hanhTrang.openVillage(); G.hanhTrang.tab = 'skill'; G.hanhTrang.ktab = 'chuong'"); g.wait(300)
    g.shot(os.path.join(OUT, 'hanh-trang-chuong.png')); print('đã lưu hanh-trang-chuong.png')
    g.close()


def main():
    os.makedirs(OUT, exist_ok=True)
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    with sync_playwright() as p:
        if what in ('all', 'bang', 'gif'):
            b, pg = open_page(p)
            if what in ('all', 'bang'): shots_bang(pg)
            if what in ('all', 'gif'): shots_gif(pg)
            b.close()
        if what in ('all', 'ui'):
            shots_ui(p)


main()
