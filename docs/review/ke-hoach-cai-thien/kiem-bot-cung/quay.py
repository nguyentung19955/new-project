"""KIẾM BỚT CỨNG — quay headless kiếm 1 → 2 → 3 (17/10). KHÔNG chơi thử bằng tay: bot bấm J theo kịch bản cố định,
nhịp logic 60/giây (G.tick), Cu Tí đứng yên quay phải; mỗi nhịp vẽ riêng Cu Tí ×3 (hàm vẽ thật của game) và đo mũi kiếm
(G.tinhLinh.tip = cùng số vệt chém dùng).
Chạy từ gốc repo sau khi build:
  python3 docs/review/ke-hoach-cai-thien/kiem-bot-cung/quay.py <trang html> <tệp ra .npz> [cờ url, vd '&kiemmuot=0']
Ra .npz: anh[cap][nhịp] (ảnh RGBA), so (json: từng nhịp hàng ảnh, khung, u, góc kiếm, mũi so với đất) cho cấp kiếm 1 và 4.
"""
import base64, io, json, os, sys
import numpy as np
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
TRANG = os.path.abspath(sys.argv[1])
RA = os.path.abspath(sys.argv[2])
CO = sys.argv[3] if len(sys.argv) > 3 else ''
URL = 'file://' + TRANG + '?cloud=0' + CO
KB = [(10, 0)] + [(1, 1), (23, 0)] * 3 + [(20, 0)]  # (số nhịp, bấm J ở nhịp đầu)

DUNG = r'''
([cap]) => {
  if (!window.__Q) { window.__Q = 1; window.requestAnimationFrame = () => 0; }
  G.testSave({ lvl: 12 }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0; if (W.projs) W.projs.length = 0;
  W.boss = null;
  for (const w of P.weapons) { w.marks = { fire: 0, poison: 0, ice: 0 }; w.branch = null; }
  P.cur = 0; P.weapons[0].type = 'sword';
  if (cap > 0) { P.weapons[0].marks.ice = G.MARKS[cap - 1]; P.weapons[0].branch = 'ice'; }
  P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 0; P.hurtT = 0; P.dodgeT = 0; P.dashT = 0; P.specT = 0; P.castT = 0; P.dead = false;
  P.hp = P.maxhp; P.mana = 999; P.moving = false;
  if (P.mv) { P.mv.holding = false; P.mv.name = ''; P.mv.kind = ''; }
  P.x = (W.x0 + (W.px1 != null ? W.px1 : W.x1)) / 2; P.y = (W.y0 + W.y1) / 2 + 10;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 40; i++) G.tick();
  return G.wStage(P.weapons[0]);
}
'''

NHIP = r'''
([bam]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (bam) { G.keys.KeyJ = true; G.keyP.KeyJ = true; }
  if (W.ents) W.ents.length = 0; if (W.mobs) W.mobs.length = 0;
  const keyP = G.keyP; G.tick(); G.keyP = keyP; G.keys = {};
  const a = G.heroArgs(P), D = G.spriteCustom.zed['zed-moi'];
  let s = null; try { s = G.zedMoi.chon(Object.assign({}, a), D.tep); } catch (e) { s = null; }
  G.scene.draw();
  const q = G.tinhLinh && G.tinhLinh.tip ? G.tinhLinh.tip(G.heroArgs(P)) : null;
  const cv = window.__cv || (window.__cv = document.createElement('canvas'));
  const sc = 3; cv.width = 120 * sc; cv.height = 90 * sc;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  c.setTransform(sc, 0, 0, sc, 0, 0); c.imageSmoothingEnabled = false;
  G.art.hero(c, Object.assign({}, a, { x: 50, y: 70, noShadow: true, alpha: null, flash: false, to: 1 }));
  let goc = null, mui = null;
  if (q && q.anim === 'atk') { goc = Math.atan2(q.dy, q.dx) * 180 / Math.PI; const l = q.L * Math.hypot(q.dx, q.dy); mui = (q.gy + q.dy / Math.hypot(q.dx, q.dy) * l) - P.y; }
  return { ten: s && s.ten, i: s && s.i, u: a.atk, combo: P.comboI, goc, mui, K: G.cotiTo ? G.cotiTo() : 1, png: cv.toDataURL('image/png') };
}
'''


def main():
    errs, so, anh = [], {}, {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(800)
        pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
        pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=90000)
        for cap in (0, 3):
            st = pg.evaluate(DUNG, [cap])
            ds, im = [], []
            for n, bam in KB:
                for j in range(n):
                    r = pg.evaluate(NHIP, [bam if j == 0 else 0])
                    im.append(np.array(Image.open(io.BytesIO(base64.b64decode(r.pop('png').split(',')[1]))).convert('RGBA')))
                    ds.append(r)
            so[cap] = {'stage': st, 'nhip': ds}
            anh[cap] = np.array(im)
            print('cấp', cap + 1, 'stage', st, len(ds), 'nhịp', flush=True)
        loi = pg.evaluate('() => (G.zedMoi && G.zedMoi.loi) || []')
        b.close()
    np.savez_compressed(RA, a0=anh[0], a3=anh[3], so=json.dumps({'so': so, 'loi_trang': errs, 'loi_zed': loi, 'co': CO}))
    print('lỗi trang:', errs[:3], 'lỗi zedMoi:', loi)


if __name__ == '__main__':
    main()
