"""Còn vẽ tay 9: so màu nhuộm nhanh (G.locVe) với ctx.filter cũ (?songnhanh=0) ở phòng trùm Sông sâu, cùng khung. In số điểm ảnh khác."""
import os, sys, io
from PIL import Image, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../../../../../game'))
sys.path.insert(0, os.path.join(ROOT, 'tests'))
from quai_lib import sync_playwright, LIB
def chup(pw, q, moc):
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540})
    pg.goto('file://' + ROOT + '/dist/linh-khi.html?cloud=0' + q); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0"); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.evaluate(LIB)
    pg.evaluate("() => { G.testSave({ lvl: 30 }); const x = T.boss(3, true, { seed: 5, save: { lvl: 30 } }); x.S.fade = 0; }")
    out = []; da = 0
    for m in moc:
        pg.evaluate('(n) => T.frame(n)', m - da); da = m; pg.wait_for_timeout(150)
        out.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
    b.close(); return out
with sync_playwright() as pw:
    moc = [40, 120, 200]
    A = chup(pw, '&songnhanh=0', moc); B = chup(pw, '', moc)
for i, (a, b) in enumerate(zip(A, B)):
    d = ImageChops.difference(a, b).convert('L'); n = sum(1 for v in d.getdata() if v > 24)
    print('khung', moc[i], 'điểm khác (>24):', n, '/', a.width * a.height, 'lệch lớn nhất', d.getextrema()[1])
    if i == 1:
        im = Image.new('RGB', (a.width, a.height * 2)); im.paste(a, (0, 0)); im.paste(b, (0, a.height)); im.resize((a.width // 2, a.height)).save(os.path.join(HERE, '..', 'anh-soat', 'so-mau-song-trum.png'))
