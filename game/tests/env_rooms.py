# Đi qua mọi loại phòng ở cả ba vùng, kiểm tra cảnh phòng mới vẽ được mà không rơi về cảnh cũ.
import sys
from playwright.sync_api import sync_playwright
URL = 'file:///home/claude/new-project/game/index.html'
TYPES = ['fight', 'elite', 'fight2', 'challenge', 'chest', 'fountain', 'choice', 'merchant', 'curse']
JS = """([r, i, t]) => {
  G.startStage(r, i, 0); const S = G.getRun();
  if (t === 'boss') G.gotoRoom(S.rooms.length - 1); else { S.rooms[2] = t; G.gotoRoom(2); }
  const W = G.getWorld(), c = G.wx, out = { type: W.type, w: W.w };
  const px = (x, y) => Array.from(c.getImageData(x, y, 1, 1).data).join(',');
  const draw = () => { c.setTransform(1, 0, 0, 1, 0, 0); G.art.bg(c, r, W.seed, 0, W.w, W.shrink); for (const p of W.props) G.art.prop(c, p); };
  const was = W.cleared; W.cleared = false;
  draw(); out.wall = px(240, 100); out.closed = px(480 - 15, 150); W.cleared = was;
  if (t !== 'boss') { W.cleared = true; draw(); out.open = px(480 - 15, 150); }
  else if (W.boss && W.boss.kind === 'ngu') { W.shrink = { y0: 158, y1: 230, x0: 142 }; draw(); out.water = [px(300, 150), px(300, 250), px(60, 190), px(300, 190)]; out.dry = px(300, 190); W.shrink = null; draw(); out.dry0 = px(300, 150); }
  for (const p of W.props) { p.used = true; G.art.prop(c, p); }
  out.err = String(G.art.envErr || G.art.envErrP || '');
  return out; }"""
fails = []
def ok(cond, msg):
    if not cond: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(1000)
    pg.evaluate("() => { G.resetSave(); G.save.sound = false; G.save.tut.done = true; }")
    n = 0
    for r in range(3):
        for i in (0, 2, 4):
            for t in TYPES + ['boss']:
                o = pg.evaluate(JS, [r, i, t]); n += 1
                name = f'vùng {r} ải {i} phòng {t}'
                ok(o['err'] == '', name + ': lỗi vẽ ' + o['err'])
                ok(o['type'] == t, name + ': sai loại phòng')
                if t != 'boss': ok(o['open'] != o['closed'], name + ': cửa ra không đổi khi dọn xong phòng')
                if 'water' in o:
                    ok(o['water'][0] != o['dry0'], name + ': dải nước phía trên không hiện')
                    ok(o['water'][3] == o['dry'] and o['water'][2] != o['dry'], name + ': nước phủ sai vùng')
    ok(not errs, 'lỗi trang: ' + '; '.join(errs[:3]))
    b.close()
for f in fails: print('  HỎNG:', f)
print(f'{n} phòng, {len(fails)} lỗi')
sys.exit(1 if fails else 0)
