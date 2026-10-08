# Đi qua mọi loại phòng ở cả ba vùng, kiểm tra phòng vuông mới vẽ được: sàn, tường, cửa khóa và cửa mở ở từng phía, lớp phủ trước, đồ vật.
import sys
from playwright.sync_api import sync_playwright
URL = 'file://' + __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))) + '/index.html'
TYPES = ['start', 'fight', 'elite', 'challenge', 'chest', 'fountain', 'merchant', 'curse', 'boss']
JS = """([r, i, t, kind, seed]) => {
  G.startStage(r, i, 0, { kind, seed }); const S = G.getRun();
  const id = G.testGoto(t);
  const W = G.getWorld(), c = G.wx, g = W.geo, out = { type: W.type, id, doors: W.doors.length, big: !!g.big, diff: {} };
  const px = (x, y) => Array.from(c.getImageData(Math.round(x), Math.round(y), 1, 1).data).join(',');
  const block = (x, y) => Array.from(c.getImageData(Math.round(x) - 6, Math.round(y) - 6, 12, 12).data).join(',');
  const draw = () => { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 480, 270); G.art.bg(c, r, W.seed, 0, W.w, W.shrink); for (const p of W.props) G.art.prop(c, p); };
  // điểm nằm trong lòng cửa của từng phía
  const spot = { up: [g.cx, g.fy0 - 14], down: [g.cx, g.fy1 + 5], left: [g.fx0 - 7, g.cy], right: [g.fx1 + 7, g.cy] };
  const was = W.doors.map((d) => d.open);
  for (const d of W.doors) d.open = false;
  draw();
  out.floor = px(g.cx + 30, g.cy + 40); out.wall = px(g.cx + 60, g.fy0 - 20); out.margin = px(10, 135); out.side = px(g.fx0 - 7, g.fy0 + 30);
  const shut = {}; for (const d of W.doors) shut[d.dir] = block(spot[d.dir][0], spot[d.dir][1]);
  for (const d of W.doors) d.open = true;
  draw();
  for (const d of W.doors) out.diff[d.dir] = shut[d.dir] !== block(spot[d.dir][0], spot[d.dir][1]);
  // phía không có cửa thì phải là tường liền, không đổi theo trạng thái cửa
  W.doors.forEach((d, k) => { d.open = was[k]; });
  out.inFloor = W.props.filter((p) => p.type !== 'roomFore').every((p) => p.x >= g.fx0 && p.x <= g.fx1 && p.y >= g.fy0 && p.y <= g.fy1);
  // đồ vật bấm được không nằm chắn lối vào cửa
  out.clear = W.props.filter((p) => p.act).every((p) => W.doors.every((d) => { const q = G.roomArt.doorPos(g, d.dir); return Math.hypot(p.x - q.x, p.y - q.y) > 34; }));
  out.fits = g.fx0 - g.sw >= 0 && g.fx1 + g.sw <= 480 && g.fy0 - g.wh - g.cap >= 0 && g.fy1 + g.fw <= 270;
  out.size = [g.fx1 - g.fx0, g.fy1 - g.fy0];
  if (W.boss && W.boss.kind === 'ngu') {
    W.shrink = null; draw(); const dry = [px(g.cx, g.fy0 + 6), px(g.fx0 + 10, g.cy), px(g.cx + 30, g.cy)];
    W.shrink = { y0: g.fy0 + 30, y1: g.fy1 - 30, x0: g.fx0 + 60 }; draw();
    out.water = [px(g.cx, g.fy0 + 6) !== dry[0], px(g.fx0 + 10, g.cy) !== dry[1], px(g.cx + 30, g.cy) === dry[2]];
    W.shrink = null;
  }
  for (const p of W.props) { p.used = true; G.art.prop(c, p); }
  out.err = String(G.art.roomErr || G.art.roomErrP || G.art.envErr || G.art.envErrP || '');
  out.variant = W.variant;
  return out; }"""
fails = []
def ok(cond, msg):
    if not cond: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(1000)
    pg.add_script_tag(path='tests/setup.js')
    pg.evaluate("() => { G.resetSave(); G.save.sound = false; G.save.tut.done = true; }")
    n = 0; variants = set(); sides = set()
    for r in range(3):
        for i, kind, seed in ((0, 'A', 3), (2, 'B', 5), (4, 'C', 7), (1, 'B', 11)):
            for t in TYPES:
                o = pg.evaluate(JS, [r, i, t, kind, seed]); n += 1
                name = f'vùng {r} ải {i} kiểu {kind} phòng {t}'
                ok(o['err'] == '', name + ': lỗi vẽ ' + o['err'])
                ok(o['type'] == t, name + ': sai loại phòng')
                ok(o['doors'] >= 1, name + ': phòng không có cửa')
                for d, changed in o['diff'].items():
                    ok(changed, name + f': cửa {d} không đổi hình khi mở')
                    sides.add(d)
                ok(o['floor'] != o['margin'] and o['wall'] != o['margin'], name + ': sàn hoặc tường trùng màu lề')
                ok(o['inFloor'], name + ': có đồ vật nằm ngoài sàn')
                ok(o['clear'], name + ': đồ vật chắn lối vào cửa')
                ok(o['fits'], name + ': phòng tràn ra ngoài màn hình')
                if t == 'boss':
                    ok(o['big'] and o['size'][0] >= 280 and o['size'][1] >= 190, name + f": phòng trùm phải rộng hơn ({o['size']})")
                else:
                    ok(not o['big'] and 190 <= o['size'][0] <= 220 and 185 <= o['size'][1] <= 205, name + f": sàn phòng thường phải gần vuông khoảng 208x196 ({o['size']})")
                    variants.add((r, o['variant']))
                if 'water' in o:
                    ok(all(o['water']), name + f": nước dâng phủ sai vùng {o['water']}")
    ok(len(sides) == 4, 'chưa thử đủ cửa bốn phía: ' + str(sorted(sides)))
    for r in range(3):
        ok(len([v for v in variants if v[0] == r]) >= 2, f'vùng {r} chỉ có một kiểu sàn')
    ok(not errs, 'lỗi trang: ' + '; '.join(errs[:3]))
    b.close()
for f in fails: print('  HỎNG:', f)
print(f'{n} phòng, {len(fails)} lỗi')
sys.exit(1 if fails else 0)
