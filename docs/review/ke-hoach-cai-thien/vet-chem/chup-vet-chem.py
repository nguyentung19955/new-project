"""Chụp vệt đòn 4 vũ khí ở bản hai tệp. python3 shot.py <dist dir> <port> <out.png> [hero]"""
import io, os, sys, subprocess, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
DIST, PORT, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]
HERO = sys.argv[4] if len(sys.argv) > 4 else 'smith'
TESTS = sys.argv[5] if len(sys.argv) > 5 else '/home/claude/new-project/game/tests'
EXTRA = os.environ.get('EXTRA', '')
srv = subprocess.Popen([sys.executable, '/home/claude/new-project/docs/review/kiem-thu-12-10/srv.py', DIST, str(PORT)], stderr=subprocess.DEVNULL)
time.sleep(0.8)
LIB = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib.js')).read()
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
A = "T.run({ atkP: true, atk: true }, 1)"
# (tên, setup, bước: [(js, nhãn)])
SC = [
 ('kiem', "T.room({hero:H, melee:'sword', dum:[[26,0]]})", [(A+";T.run({},8)",'kiếm +8'),("T.run({},2)",'+10'),("T.run({},2)",'+12'),("T.run({atkP:true,atk:true},1);T.run({},10);T.run({atkP:true,atk:true},1);T.run({},3)",'nhát 3')]),
 ('cung', "T.room({hero:H, bow:true, dum:[[70,0]]})", [(A+";T.run({},11)",'cung +11'),("T.run({},3)",'+14'),("T.hold({atk:true},50)",'giữ'),("T.run({},2)",'buông +2')]),
 ('giao', "T.room({hero:H, melee:'spear', dum:[[30,0]]})", [(A+";T.run({},11)",'giáo +11'),("T.run({},2)",'+13'),("T.run({atkP:true,atk:true},1);T.run({},12);T.run({atkP:true,atk:true},1);T.run({},12);T.run({atkP:true,atk:true},1);T.run({},4)",'quét'),("T.run({},4)",'+4')]),
 ('bua', "T.room({hero:H, melee:'hammer', dum:[[26,0]]})", [(A+";T.run({},17)",'búa +17'),("T.run({},2)",'+19'),("T.hold({atk:true},70)",'giữ'),("T.run({},2)",'nện +2')]),
 ('dacbiet', "T.room({hero:H, melee:'sword', dum:[[40,0]]})", [("T.run({specialP:true},1);T.run({},6)",'kiếm ĐB +6'),("T.run({},6)",'+12'),("T.run({dodgeP:true},1);T.run({},2);T.run({atkP:true,atk:true},1);T.run({},3)",'lướt chém'),("T.run({},3)",'+3')]),
]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (PORT, EXTRA))
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    # chờ ảnh tải sau về hết
    for i in range(60):
        n = pg.evaluate("(() => { const A = G.fxAnh ? Object.values(G.fxAnh.ds) : []; return [A.length, A.filter(a => a.ready).length, !!(G.fxAnh && G.fxAnh.co('hu-quet-giao'))]; })()")
        if n[2] and n[0] == n[1]: break
        pg.wait_for_timeout(500)
    print('fx anh', n)
    pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(TESTS, 'bot.js'))
    pg.add_script_tag(path=os.path.join(TESTS, 'setup.js'))
    pg.evaluate(LIB)
    if os.environ.get('JS'): pg.evaluate(os.environ['JS'])
    rows = []
    for name, setup, steps in SC:
        cx, cy = pg.evaluate("() => { const H='%s'; return %s; }" % (HERO, setup))
        ims = []
        for js, cap in steps:
            pg.evaluate('() => { ' + js + ' }')
            box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam]; })()")
            hw, hh = int(os.environ.get('HW',70)), int(os.environ.get('HH',45))
            clip = {'x': box[0] + (cx - box[3] - hw) * box[2], 'y': box[1] + (cy - hh) * box[2], 'width': 2 * hw * box[2], 'height': 2 * hh * box[2]}
            im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
            ims.append((im, cap))
        rows.append((name, ims))
    errs += pg.evaluate('T.errs')
    b.close()
srv.kill()
w, h = rows[0][1][0][0].size
out = Image.new('RGB', (4 * (w + 6) + 6, len(rows) * (h + 22) + 6), '#140f10')
d = ImageDraw.Draw(out)
for r, (name, ims) in enumerate(rows):
    for i, (im, cap) in enumerate(ims):
        x, y = 6 + i * (w + 6), 6 + r * (h + 22)
        out.paste(im, (x, y)); d.text((x + 3, y + h + 3), cap, font=F, fill='#ffd27a')
out.save(OUT)
print('saved', OUT, 'errs', errs[:5])
