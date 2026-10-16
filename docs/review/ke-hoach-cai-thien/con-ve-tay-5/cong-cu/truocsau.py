"""Ảnh soát trước/sau cho cảnh giống ảnh chủ game: Rừng già 5 (phòng Bắt đầu), Zed kiếm Mầm hệ Độc chém Bọ Hung (con giáp).
python3 truocsau.py <ra.png>"""
import io, os, sys
sys.path.insert(0, '/home/claude/new-project/game/tests')
from PIL import Image, ImageDraw, ImageFont
from quai_lib import sync_playwright, ROOT, LIB

SCENE = r"""() => {
  Math.random = G.srand(4242);
  const { S, W, P } = T.room(0, 4, { seed: 7, save: { lvl: 12, branch: 'poison', marksMoi: G.MARKS[0] + 10 } });
  const e = G.spawnEnemy('shield', 250, 140, { art: 'boHung' }); e.inside = true; e.hp = e.maxhp = 99999;
  P.x = 290; P.y = 150;
  for (let k = 0; k < 60; k++) T.frame(1);
  window.__e = e;
}"""
STEP = r"""(n) => { const P = G.getRun().P; for (let k = 0; k < n; k++) { T.frame(1, { atk: true, atkP: true }); P.hp = P.maxhp; window.__e.hp = 99999; } }"""

def chay(q, frames):
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/dist/linh-khi.html' + q); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.evaluate(LIB)
        pg.evaluate(SCENE); pg.wait_for_timeout(2500); pg.evaluate(SCENE)
        ims = []
        last = 0
        for f in frames:
            pg.evaluate(STEP, f - last); last = f
            ims.append(Image.open(io.BytesIO(pg.screenshot(clip={'x': 16, 'y': 0, 'width': 960, 'height': 540}))).convert('RGB'))
        b.close()
        return ims, errs

FR = [int(x) for x in os.environ.get('FR', '6,14,22,30,38,46').split(',')]
cu, e1 = chay('?vecode=1', FR)
moi, e2 = chay('', FR)
crop = (330, 150, 750, 400)  # vùng sàn quanh Zed / quái (toạ độ ảnh 960×540)
cw, ch = crop[2] - crop[0], crop[3] - crop[1]
n = len(FR)
out = Image.new('RGB', (cw * n // 2 + 0, ch * 2 // 2 * 2 + 40), (16, 14, 20))
W = Image.new('RGB', (cw * n, ch * 2 + 60), (16, 14, 20))
d = ImageDraw.Draw(W)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except Exception:
    font = None
d.text((10, 4), 'TRUOC (?vecode=1: ve code nhu cu)', fill=(255, 210, 120), font=font)
d.text((10, ch + 32), 'SAU (mac dinh: chan hinh ve code)', fill=(140, 240, 140), font=font)
for i in range(n):
    W.paste(cu[i].crop(crop), (i * cw, 30))
    W.paste(moi[i].crop(crop), (i * cw, ch + 60))
W.save(sys.argv[1], optimize=True)
cu[0].save(sys.argv[1].replace('.png', '-cu-day-du.png'), optimize=True)
moi[0].save(sys.argv[1].replace('.png', '-moi-day-du.png'), optimize=True)
print('loi', e1, e2)
