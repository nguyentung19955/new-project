"""GIF trước / sau cho báo cáo bao-truoc-tat: 3 ca (Nhím Biển, một tinh anh, một trùm vùng).
  cd game && python3 tests/bao_truoc_tat_gif.py <thư mục ra>
Mỗi ca chạy hai lần cùng hạt ngẫu nhiên: G.BAO_TAT = false (trước, như ?baotat=0) rồi true (sau). Bắt đầu chụp khi vùng báo của đòn
được chọn còn ~0,3 giây là nổ, chụp mỗi 2 khung (1/30 giây) tới 0,45 giây sau khi đòn ra; ghép hai bên trái (TRƯỚC) / phải (SAU),
phát chậm 3 lần. Khung nào hình báo còn hiện SAU lúc đòn ra thì có chữ đỏ "còn hiện". Không sửa luật chơi."""
import os, sys, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/bao_truoc_tat_gif'
os.makedirs(OUT, exist_ok=True)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

SETUP = r"""
([kind, r, art, moi, pick]) => {
  G.BAO_TAT = moi;
  const D = window.BTD, big = kind === 'boss';
  const { S, W, P } = AU.room({ region: r, stage: big ? 4 : 0, big, keepBoss: big, lvl: 30, tier: 2, seed: 11 });
  window.__h0 = window.__h0 || G.hurtPlayer;
  G.hurtPlayer = function () { return false; };
  const cx = W.geo.cx, cy = W.geo.cy;
  let e;
  if (!big) { const role = kind === 'elite' ? 'elite' : Object.keys(G.MOB_ART).find((k) => k !== 'elite' && k !== 'mini' && k !== 'boss' && G.MOB_ART[k][r] === art); e = G.spawnEnemy(role, cx + 60, cy - 6, { art }); e.inside = true; e.cd = 0.4; if (kind === 'elite') e.skCd = 0.4; }
  else { e = W.boss; e.invuln = 0; e.busy = 0; e.intro = 0; e.cd = 0.3; }
  window.__e = e; window.__i = 0; window.__z = null;
  D.begin();
  // chạy tới lúc vùng được chọn còn ≤ 0,3 giây là nổ
  for (let i = 0; i < 60 * 30; i++) {
    const t = i / 60, a = t * 0.8;
    P.x = cx - 30 + Math.cos(a) * 40; P.y = cy + Math.sin(a) * 22; P.hp = P.maxhp; P.inv = 0;
    window.__i = i;
    D.frame();
    const z = W.zones.find((q) => q.src === e && q.t > 0 && q.t <= 0.3 && !q.pool && !q.quiet && (pick === 'bao' ? !(q.dmg > 0) && q.shape === 'line' : pick === 'dmg' ? q.dmg > 0 : true));
    if (z && i > 20) { window.__z = z; window.__fireAt = null; return { ok: true, x: z.x + (z.shape === 'line' ? Math.cos(z.ang) * z.len / 2 : z.shape === 'rect' ? z.w / 2 : 0), y: z.y + (z.shape === 'line' ? Math.sin(z.ang) * z.len / 2 : z.shape === 'rect' ? z.h / 2 : 0), t: z.t }; }
  }
  return { ok: false };
}
"""
STEP = r"""
(n) => {
  const D = window.BTD, W = G.getWorld(), P = W.P, cx = W.geo.cx, cy = W.geo.cy, z = window.__z;
  for (let k = 0; k < n; k++) {
    const i = ++window.__i, t = i / 60, a = t * 0.8;
    P.x = cx - 30 + Math.cos(a) * 40; P.y = cy + Math.sin(a) * 22; P.hp = P.maxhp; P.inv = 0;
    const t0 = z.t;
    D.frame();
    if (window.__fireAt == null && t0 > 0 && z.t <= 0) window.__fireAt = G.time;
  }
  const rec = D.rec.get('z' + D.idOf(z));
  const now = G.time, vis = !!rec && Math.abs((rec.last + D.t0) - now) < 0.005;
  // còn hình báo nào (của cùng con) đang vẽ ở khung này?
  let any = false; for (const q of D.rec.values()) if (q.s === D.idOf(window.__e) && Math.abs(q.last + D.t0 - now) < 0.005) any = true;
  const cam = Math.round(W.cam), k2 = (G.uiScale || 1) / (G.dpr || 1), rect = G.ux.canvas.getBoundingClientRect();
  return { rec: !!rec, recLast: rec ? rec.last : null, nowRel: now - D.t0, since: window.__fireAt == null ? null : now - window.__fireAt, vis, any, cam, k: k2, left: rect.left + G.ox, top: rect.top + G.oy };
}
"""

CASES = [
    ('nhim-bien', 'Nhím Biển — vạch gai', 'mob', 1, 'nhim', 'bao'),
    ('tinh-anh-heo-nanh', 'Tinh anh Heo Nanh Dài', 'elite', 0, 'heoNanh', 'any'),
    ('trum-thuong-luong', 'Trùm Thuồng Luồng', 'boss', 3, None, 'dmg'),
]


def run_side(pg, kind, r, art, moi, pick):
    o = pg.evaluate(SETUP, [kind, r, art, moi, pick])
    if not o['ok']: return None
    frames = []
    for j in range(40):
        s = pg.evaluate(STEP, 2)
        if j == 0: cen = (o['x'], o['y'])
        png = pg.screenshot()
        im = Image.open(io.BytesIO(png)).convert('RGB')
        k = s['k'] * 2  # device_scale_factor 2
        sx = (s['left'] + (cen[0] - s['cam']) * s['k']) * 2; sy = (s['top'] + cen[1] * s['k']) * 2
        w, h = 150 * k, 92 * k
        box = (int(sx - w / 2), int(sy - h / 2), int(sx + w / 2), int(sy + h / 2))
        im = im.crop(box).resize((420, 258), Image.NEAREST)
        frames.append((im, s))
        if s['since'] is not None and s['since'] > 0.45: break
    return frames


def label(im, txt, sub, col):
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 17); f2 = ImageFont.truetype(FONT, 14)
    d.rectangle((0, 0, im.width, 24), fill=(16, 16, 22))
    d.text((8, 3), txt, font=f, fill=col)
    if sub: d.rectangle((0, im.height - 22, im.width, im.height), fill=(16, 16, 22)); d.text((8, im.height - 20), sub[0], font=f2, fill=sub[1])


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(2500)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        for f in ['bot.js', 'setup.js', 'au_lib.js', 'bao_truoc_tat_lib.js']: pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        for ma, ten, kind, r, art, pick in CASES:
            if os.environ.get('GIF_ONLY') and os.environ['GIF_ONLY'] not in ma: continue
            A = run_side(pg, kind, r, art, False, pick)
            B = run_side(pg, kind, r, art, True, pick)
            if not A or not B: print('không bắt được', ma); continue
            n = max(len(A), len(B)); out = []
            for i in range(n):
                fa, sa = A[min(i, len(A) - 1)]; fb, sb = B[min(i, len(B) - 1)]
                fa = fa.copy(); fb = fb.copy()
                for im, s, tt in ((fa, sa, 'TRƯỚC (cũ)'), (fb, sb, 'SAU (mới)')):
                    if s['since'] is None: sub = ('đang báo trước', (255, 220, 120))
                    elif s['vis']: sub = ('đòn đã ra %.2f giây — hình báo CÒN HIỆN' % s['since'], (255, 90, 80))
                    else: sub = ('đòn đã ra %.2f giây — hình báo đã tắt' % s['since'], (140, 235, 140))
                    label(im, tt + '   ' + ten, sub, (255, 255, 255))
                cv = Image.new('RGB', (fa.width * 2 + 6, fa.height), (0, 0, 0))
                cv.paste(fa, (0, 0)); cv.paste(fb, (fa.width + 6, 0))
                out.append(cv)
            path = os.path.join(OUT, ma + '.gif')
            out[0].save(path, save_all=True, append_images=out[1:], duration=100, loop=0, optimize=True)
            # số khung còn hiện sau khi đòn ra
            ca = sum(1 for _, s in A if s['since'] is not None and s['vis']); cb = sum(1 for _, s in B if s['since'] is not None and s['vis'])
            print('%s: %d khung; còn hiện sau khi đòn ra: trước %d khung (~%.2fs), sau %d khung (~%.2fs) → %s' % (ma, len(out), ca, ca / 30, cb, cb / 30, path))
        b.close()
        print('lỗi JS:', errs[:3] or 0)


if __name__ == '__main__':
    main()
