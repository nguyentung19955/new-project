"""Chụp hình hiện tại của quái Sông sâu (hình tạm: ảnh con mượn nhuộm màu) để chủ game nhận ra. Headless, không chơi.
    python3 chup_quai_song.py
Ra: ../anh/quai-<mã>.png (cỡ thật ×2) và ../mau/quai-<mã>-hien-tai.png (×4)."""
import os, sys, io, base64
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../../../../../game'))
sys.path.insert(0, os.path.join(ROOT, 'tests'))
from quai_lib import sync_playwright, LIB
from PIL import Image
QUAI = [('raiCa', 'rusher'), ('diaTrau', 'swarm'), ('baBa', 'shield'), ('cocTia', 'archer'), ('ranNuoc', 'nimble'), ('echPhinh', 'kami'), ('maDa', 'bomber'), ('traiGai', 'spiky'),
        ('raiCaChua', 'elite'), ('cocChua', 'elite')]
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540})
    pg.goto('file://' + ROOT + '/dist/linh-khi.html?cloud=0'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.evaluate(LIB)
    pg.wait_for_timeout(500)
    for ma, vai in QUAI:
        png = pg.evaluate("""([ma, vai]) => {
          const { S, W, P } = T.room(3, 2, { seed: 9, save: { lvl: 30 } }); S.fade = 0;
          P.x = 120; P.y = 200;
          const e = G.spawnEnemy(vai, 300, 150, { art: ma }); e.inside = true; e.hp = e.maxhp = 99999; e.spd = 0; e.ai = null;
          for (let k = 0; k < 160; k++) { T.frame(1); e.hp = 99999; e.x = 300; e.y = 150; P.hp = P.maxhp; P.x = 120; P.y = 200; }
          const ui = document.getElementById('ui'), w = document.getElementById('world'), d = G.dpr || 1;
          const cv = document.createElement('canvas'); cv.width = ui.width; cv.height = ui.height; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
          g.drawImage(w, G.ox * d, G.oy * d, G.W * G.scale * d, G.H * G.scale * d); g.drawImage(ui, 0, 0);
          const k = G.scale * d, x = G.ox * d + 300 * k, y = G.oy * d + 150 * k, R = 34 * k;
          const t = document.createElement('canvas'); t.width = 2 * R; t.height = 2 * R; t.getContext('2d').drawImage(cv, x - R, y - R * 1.4, 2 * R, 2 * R, 0, 0, 2 * R, 2 * R);
          return t.toDataURL('image/png') + '|' + (e.art || '') + '|' + (G.monsterArt && G.monsterArt.hinhTam && G.monsterArt.hinhTam[ma] ? G.monsterArt.hinhTam[ma].muon : '');
        }""", [ma, vai])
        data, art, muon = png.split('|')
        im = Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGB')
        im.save(OUT + '/anh/quai-%s.png' % ma, optimize=True)
        im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(OUT + '/mau/quai-%s-hien-tai.png' % ma, optimize=True)
        print(ma, art, 'mượn', muon)
    b.close()
