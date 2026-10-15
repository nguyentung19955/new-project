#!/usr/bin/env python3
"""Phiên 2B: ẢNH SOÁT TĨNH (không chơi thử): dựng vài phòng vùng 4 rồi vẽ MỘT khung (G.drawWorld) vào canvas thế giới, chép ra PNG.
Trình duyệt không giao diện chỉ dùng để có canvas thật; không bấm nút, không chạy vòng lặp game.
  python3 anh_soat.py   → truoc-sau.png (trái: phiên 1 mượn Hang biển + phủ nước đục; phải: theme Sông sâu + luật), cac-phong.png, phong-day.png
"""
import base64, io, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + os.path.join(GAME, 'index.html') + '?cloud=0'
JS = """([i, t, seed, nen, luat, them, tg]) => {
  G.NEN_SONG = nen; G.SONG_LUAT = luat;
  G.testSave({ lvl: 40 }); const s = G.save; s.sound = false;
  for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
  for (let ii = 0; ii < i; ii++) s.stars['3-' + ii] = 1;
  const r0 = G.rnd; G.rnd = G.srand(seed);
  try { G.startStage(3, i, 0); if (t !== 'start') G.testGoto(t); } finally { G.rnd = r0; }
  const W = G.getWorld(), g = W.geo;
  W.waves = []; W.spawns = []; W.ents.length = 0; W.waveI = 99;
  if (them) {
    for (const [role, dx, dy] of [['rusher', -50, 10], ['swarm', 40, -20], ['shield', 60, 40]]) { const e = G.spawnEnemy(role, g.cx + dx, g.cy + dy, {}); e.inside = true; }
    if (them > 1 && luat) {
      W.props.push({ type: 'lucbinh', env: true, x: g.fx0 + 40, y: g.fy1 - 30, song: true }, { type: 'dendau', env: true, x: g.fx1 - 40, y: g.fy0 + 30, song: true });
      W.song.sau.push({ x: g.cx + 20, y: g.fy1 - 26, rx: 18, ry: 9 });
      W.zones.push({ shape: 'circle', x: g.cx - 70, y: g.cy + 40, r: 28, t: 0, pool: true, team: 'player', life: 2.2, tick: 1, every: 1, el: 'poison', src: 1, oz: true, song: 'lucbinh' });
    }
  }
  W.P.x = g.cx + 10; W.P.y = g.cy + 30;
  G.time = tg; G.drawWorld(3);
  const out = G.wx.canvas.toDataURL('image/png');
  G.NEN_SONG = true; G.SONG_LUAT = true;
  return { png: out, song: W.song ? { dai: W.song.dai.length, sau: W.song.sau.length } : null, err: String(G.art.roomErr || G.songLuat.loiVe || '') };
}"""


def anh(o):
    return Image.open(io.BytesIO(base64.b64decode(o['png'].split(',', 1)[1]))).convert('RGB')


def nhan(im, chu):
    im = im.copy(); d = ImageDraw.Draw(im); d.rectangle([0, 0, 8 + 6 * len(chu), 12], fill=(0, 0, 0)); d.text((3, 1), chu, fill=(255, 255, 255)); return im


def luoi(ds, cot, ten):
    w, h = ds[0].size
    out = Image.new('RGB', (w * cot, h * ((len(ds) + cot - 1) // cot)), (0, 0, 0))
    for k, im in enumerate(ds): out.paste(im, ((k % cot) * w, (k // cot) * h))
    out.save(os.path.join(HERE, ten)); print('ghi', ten, out.size)


with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 960, 'height': 540})
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate('() => { G.resetSave(); G.save.sound = false; G.save.tut.done = true; }')
    # trước / sau: cùng phòng
    ts = []
    for i, t, seed in ((0, 'start', 4242), (3, 'fight', 77), (2, 'elite', 31)):
        a = pg.evaluate(JS, [i, t, seed, False, False, 1, 1.0]); c = pg.evaluate(JS, [i, t, seed, True, True, 2, 1.0])
        ts += [nhan(anh(a), f'TRUOC 4-{i+1} {t}'), nhan(anh(c), f'SAU 4-{i+1} {t} dai {c["song"]["dai"]}')]
        if a['err'] or c['err']: print('LOI', a['err'], c['err'])
    luoi([im.resize((im.width // 2, im.height // 2), Image.NEAREST) if im.width > 900 else im for im in ts], 2, 'truoc-sau.png')
    # các loại phòng
    ds = []
    for i, t, seed in ((1, 'fight', 5), (4, 'fight', 9), (3, 'challenge', 13), (0, 'fountain', 3), (1, 'chest', 21), (0, 'boss', 8), (2, 'merchant', 15), (4, 'fight', 41)):
        try:
            o = pg.evaluate(JS, [i, t, seed, True, True, 0, 2.0]); ds.append(nhan(anh(o), f'4-{i+1} {t}'))
            if o['err']: print('LOI', t, o['err'])
        except Exception as e: print('bo qua', t, str(e)[:120])
    luoi([im.resize((im.width // 2, im.height // 2), Image.NEAREST) if im.width > 900 else im for im in ds], 2, 'cac-phong.png')
    # dòng chảy ở 3 thời điểm (mũi tên trôi)
    fs = [nhan(anh(pg.evaluate(JS, [0, 'start', 4242, True, True, 0, tg])), f't = {tg}s') for tg in (0.0, 0.4, 0.8)]
    luoi(fs, 3, 'phong-day.png')
    print('lỗi trang:', loi[:3])
    b.close()
