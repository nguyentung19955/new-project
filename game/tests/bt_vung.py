"""Rà soát B 12/10: VŨNG đang gây sát thương (lửa, độc, băng, đỏ) — hình vẽ trên sàn có khớp vùng gây sát thương thật không.
Quái: G.inZone (elip r x r*G.ZK). Vũng của em bé (gây hệ lên quái): hypot(dx, dy*1.6) < r + e.r (combat.js) — báo cáo số, không đổi.
Đo ở lớp điểm ảnh (#world): điểm có hình vũng (khác nền) so với vùng trúng. Chạy: python3 tests/bt_vung.py"""
import os, sys, json
from quai_lib import sync_playwright, LIB, ROOT

JS = r"""
async ([el, foe, r]) => {
  const { W, P } = T.room(0, 2, { seed: 5 });
  for (let i = 0; i < 10; i++) T.frame(1);
  P.x = W.x0 + 8; P.y = W.y1 - 4; W.ents = []; W.projs = []; W.parts = [];
  const cam = Math.round(W.cam), cx = 240 + cam, cy = 150, N = G.NET || 1;
  const ma = foe ? { fire: 'hu-vung-quai-lua', poison: 'hu-vung-quai-doc', ice: 'hu-vung-quai-bang' }[el] || 'hu-vung-quai-do' : null;
  if (ma && G.fxAnh) { for (let i = 0; i < 60 && !G.fxAnh.co(ma); i++) await new Promise((q) => setTimeout(q, 50)); }
  const z = { shape: 'circle', x: cx, y: cy, r, t: 0, dmg: 1, el, pool: true, life: 5, tick: 0.3, team: foe ? undefined : 'player' };
  const draw = (zs) => { W.zones = zs; W.shake = 0; G.ui.begin(); G.scene.draw(); return G.wx.getImageData(0, 0, G.wx.canvas.width, G.wx.canvas.height).data; };
  W.zones = [z]; for (let i = 0; i < 40; i++) { T.frame(1); P.x = W.x0 + 8; P.y = W.y1 - 4; z.life = 5; }
  const d1 = draw([z]), d0 = draw([]);
  const cw = G.wx.canvas.width;
  let thua = 0, thieu = 0, dung = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const pt = { x: 0, y: 0 }, er = 8;
  for (let Y = cy - r - 20; Y < cy + r + 20; Y++) for (let X = cx - cam - r - 30; X < cx - cam + r + 30; X++) {
    const q = ((Y * N + (N >> 1)) * cw + X * N + (N >> 1)) * 4;
    const drawn = Math.abs(d1[q] - d0[q]) + Math.abs(d1[q + 1] - d0[q + 1]) + Math.abs(d1[q + 2] - d0[q + 2]) > 24;
    pt.x = X + 0.5 + cam; pt.y = Y + 0.5;
    const hit = foe ? G.inZone(z, pt) : Math.hypot(pt.x - z.x, (pt.y - z.y) * 1.6) < z.r + er;
    if (drawn) { x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    if (hit && drawn) dung++; else if (drawn) thua++; else if (hit) thieu++;
  }
  W.zones = [];
  return { anh: !!(ma && G.fxAnh && G.fxAnh.co(ma)), dung, thua, thieu, rongVe: x1 - x0 + 1, caoVe: y1 - y0 + 1, rongTrung: foe ? 2 * r : 2 * (r + er), caoTrung: foe ? Math.round(2 * r * G.ZK) : Math.round(2 * (r + er) / 1.6) };
}
"""
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file://' + ROOT + '/index.html'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(300)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.evaluate(LIB)
    out = {}
    for foe in (True, False):
        for el in ('fire', 'poison', 'ice', None):
            if not foe and el is None: continue
            for r in (24, 40):
                k = ('quái ' if foe else 'bé ') + str(el) + ' r' + str(r)
                out[k] = pg.evaluate(JS, [el, foe, r]); o = out[k]
                print('%-18s ảnh=%-5s vẽ %3dx%-3d trúng %3dx%-3d | thừa %4d thiếu %4d đúng %5d' % (k, o['anh'], o['rongVe'], o['caoVe'], o['rongTrung'], o['caoTrung'], o['thua'], o['thieu'], o['dung']))
    b.close()
json.dump(out, open('/tmp/bt_vung.json', 'w'), ensure_ascii=False)
if errs: print('LỖI TRANG', errs[:5]); sys.exit(1)
