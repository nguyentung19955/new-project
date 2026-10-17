"""Đo từng nhịp (1/60 s) combo kiếm nặng của Cu Tí bằng bot headless (KHÔNG chơi tay): hàng/khung thân, u, góc kiếm, mũi kiếm
(x so với chân, y so với đất), thân nghiêng / nhích. Tuỳ chọn --chay: bot giữ D (chạy sang phải) trong lúc chém.
Chạy từ thư mục game: python3 ../docs/review/ke-hoach-cai-thien/tu-van-17-10-don-kiem/do_goc.py dist/linh-khi.html ra.json [cờ] [--chay]
"""
import json, os, sys
from playwright.sync_api import sync_playwright
TRANG = os.path.abspath(sys.argv[1]); RA = sys.argv[2]
CO = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else ''
CHAY = '--chay' in sys.argv
URL = 'file://' + TRANG + '?cloud=0' + CO
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
src = open(os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'kiem-bot-cung', 'quay.py'), encoding='utf-8').read()
DUNG = src.split("DUNG = r'''", 1)[1].split("'''", 1)[0]
NHIP = r'''
([bam, chay]) => {
  const S = G.getRun(), W = S.W, P = W.P;
  G.keys = {}; G.pointers.clear(); G.keyP = {};
  if (bam) { G.keys.KeyJ = true; G.keyP.KeyJ = true; }
  if (chay) G.keys.KeyD = true;
  if (W.ents) W.ents.length = 0;
  if (P.x > W.x1 - 30) P.x = W.x0 + 30;
  const keyP = G.keyP; G.tick(); G.keyP = keyP; const k2 = G.keys; G.keys = {};
  const a = G.heroArgs(P), D = G.spriteCustom.zed['zed-moi'];
  let s = null; try { s = G.zedMoi.chon(Object.assign({}, a), D.tep); } catch (e) { s = null; }
  G.scene.draw();
  const q = G.tinhLinh && G.tinhLinh.tip ? G.tinhLinh.tip(G.heroArgs(P)) : null;
  let goc = null, mx = null, my = null;
  if (q && q.anim === 'atk') { const h = Math.hypot(q.dx, q.dy), l = q.L * h; goc = Math.atan2(q.dy, q.dx) * 180 / Math.PI; mx = (q.gx + q.dx / h * l - P.x) * (P.face < 0 ? -1 : 1); my = (q.gy + q.dy / h * l) - P.y; }
  return { ten: s && s.ten, i: s && s.i, eo: s && s.eo ? s.eo.chan : null, u: a.atk, step: P.mv && P.mv.step, goc, mx, my, x: P.x, mov: !!P.moving };
}
'''
KB = [(1, 1), (17, 0), (1, 1), (17, 0), (1, 1), (40, 0)]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(800)
    pg.add_script_tag(path=os.path.join(GOC, 'game', 'tests', 'setup.js'))
    pg.wait_for_function("() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return false; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (!q || !q.ready) return false; } return true; }", timeout=90000)
    pg.evaluate(DUNG, [0])
    ds = []
    if CHAY:
        for _ in range(20): pg.evaluate(NHIP, [0, 1])
    for n, bam in KB:
        for j in range(n): ds.append(pg.evaluate(NHIP, [bam if j == 0 else 0, CHAY]))
    loi = pg.evaluate('() => (G.zedMoi && G.zedMoi.loi) || []')
    b.close()
json.dump({'nhip': ds, 'loi': errs, 'loi_zed': loi}, open(RA, 'w'), ensure_ascii=False)
for d in ds:
    print(d['step'], d['ten'], d['i'], d['eo'], None if d['u'] is None else round(d['u'], 3), None if d['goc'] is None else round(d['goc']), None if d['mx'] is None else round(d['mx'], 1), None if d['my'] is None else round(d['my'], 1))
print('lỗi', errs, loi)
