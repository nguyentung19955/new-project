"""Đòn kiếm nặng Cu Tí (17/10) — quay GIF TRƯỚC / SAU bằng bot headless (KHÔNG chơi tay).
Kịch bản (60 nhịp/giây, G.tick thật của game, có khựng hình + rung thật): một quái bù nhìn đứng ngay trước mặt (máu rất nhiều, không đánh);
(1) đứng chém đủ combo 1 → 2 → 3; (2) chạy sang phải rồi vừa giữ chạy vừa chém đủ combo. Khung cắt từ canvas thế giới quanh Cu Tí
(rung khung hình có thật trong ảnh). TRƯỚC = tắt cả 6 cờ (?kndung=0&knrung=0&knam=0&knnhip=0&knmuot=0&knghim=0), SAU = mặc định.
Chạy từ thư mục game sau khi build:  python3 ../docs/review/ke-hoach-cai-thien/tu-van-17-10-don-kiem/quay_gif.py dist/linh-khi.html
Ra (cùng thư mục): combo-truoc-sau-x1.gif (đúng thời lượng), combo-truoc-sau-x3.gif (chậm 3 lần).
"""
import base64, io, os, sys
import numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
TRANG = os.path.abspath(sys.argv[1])
TAT = '&kndung=0&knrung=0&knam=0&knnhip=0&knmuot=0&knghim=0'
DUNG = r'''
() => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; }
  let x = 12345; Math.random = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  W.ents.length = 0; if (W.projs) W.projs.length = 0; W.waves = []; W.spawns = []; W.boss = null;
  P.cur = 0; P.weapons[0].type = 'sword'; P.crit = 0;
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 0; P.hp = P.maxhp; P.mana = 999; P.moving = false;
  P.x = W.x0 + 40; P.y = (W.y0 + W.y1) / 2 + 10;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 40; i++) G.tick();
  const e = G.spawnEnemy('rusher', P.x + 24, P.y);
  e.inside = true; e.speed = 0; e.cd = 99; e.hp = e.maxhp = 1e7; e.armor = 0; e.spawnT = 0;
  window.__e = e;
  return true;
}
'''
NHIP = r'''
([bam, chay]) => {
  const S = G.getRun(), W = S.W, P = W.P, e = window.__e;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (bam) { G.keys.KeyJ = true; G.keyP.KeyJ = true; }
  if (chay) G.keys.KeyD = true;
  e.speed = 0; e.cd = 99; e.wind = 0; e.hp = e.maxhp; P.crit = 0; P.hp = P.maxhp;
  e.x = P.x + 30; e.y = P.y - 6; e.kbVx = 0; e.kbVy = 0;
  const keyP = G.keyP; G.tick(); G.keyP = keyP; G.keys = {};
  G.scene.draw();
  const wc = document.getElementById('world'), cam = W.cam || 0, k = wc.width / G.W;
  const mc = window.__mc || (window.__mc = document.createElement('canvas'));
  mc.width = 130 * k; mc.height = 80 * k;
  const m = mc.getContext('2d'); m.imageSmoothingEnabled = false; m.clearRect(0, 0, mc.width, mc.height);
  const cx = window.__cx == null ? (window.__cx = P.x - cam - 45) : (window.__cx += Math.max(0, (P.x - cam - 45) - window.__cx));
  m.drawImage(wc, Math.round(cx * k), Math.round((P.y - 64) * k), mc.width, mc.height, 0, 0, mc.width, mc.height);
  return mc.toDataURL('image/png');
}
'''
def kb(chay):
    s = [(1, 1, 0), (23, 0, 0), (1, 1, 0), (23, 0, 0), (1, 1, 0), (45, 0, 0)]
    if not chay: return [(10, 0, 0)] + s
    return [(18, 0, 1)] + [(n, b, 1) for n, b, _ in s[:5]] + [(10, 0, 1), (35, 0, 0)]

def quay(pg, co, chay):
    pg.goto('file://' + TRANG + '?cloud=0' + co); pg.wait_for_timeout(800)
    pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
    pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=90000)
    pg.wait_for_function("() => !G.fxAnh || ['hu-chem-kiem-nang-1','hu-chem-kiem-nang-2','hu-chem-kiem-nang-3','hu-chem-kiem-nang-4','hu-lao-bui'].every(m => !G.fxAnh.ds[m] || G.fxAnh.co(m))", timeout=60000)
    pg.evaluate(DUNG)
    for _ in range(20): pg.evaluate(NHIP, [0, 0]); pg.wait_for_timeout(20)
    pg.evaluate('() => { window.__cx = null; }')
    out = []
    for n, bam, ch in kb(chay):
        for j in range(n):
            s = pg.evaluate(NHIP, [bam if j == 0 else 0, ch])
            out.append(Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))).convert('RGBA'))
    return out

def ghep(T, S, nhan):
    n = max(len(T), len(S)); T = T + [T[-1]] * (n - len(T)); S = S + [S[-1]] * (n - len(S))
    w, h = T[0].size; ra = []
    for i in range(n):
        im = Image.new('RGB', (w * 2 + 6, h + 14), (20, 20, 20))
        im.paste(T[i].convert('RGB'), (0, 14)); im.paste(S[i].convert('RGB'), (w + 6, 14))
        d = ImageDraw.Draw(im); d.text((4, 1), 'TRUOC ' + nhan, fill=(255, 255, 255)); d.text((w + 10, 1), 'SAU ' + nhan, fill=(255, 220, 90))
        ra.append(im)
    return ra

errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    kq = {}
    for ten, co in (('t', TAT), ('s', '')):
        for chay in (0, 1):
            kq[ten, chay] = quay(pg, co, chay)
    b.close()
fr = ghep(kq['t', 0], kq['s', 0], '(dung)') + ghep(kq['t', 1], kq['s', 1], '(chay+chem)')
fr = [f.convert('P', palette=Image.ADAPTIVE, colors=64) for f in fr]
# ×1: 60 nhịp/giây → GIF 50 hình/giây (20 ms): lấy nhịp floor(t·60) — đúng thời lượng thật
x1 = [fr[int(i * 0.02 * 60)] for i in range(int(len(fr) / 60 / 0.02))]
x1[0].save(os.path.join(HERE, 'combo-truoc-sau-x1.gif'), save_all=True, append_images=x1[1:], duration=20, loop=0)
fr[0].save(os.path.join(HERE, 'combo-truoc-sau-x3.gif'), save_all=True, append_images=fr[1:], duration=50, loop=0)
print('nhịp', {k: len(v) for k, v in kq.items()}, 'lỗi trang', errs)
