"""Kiểm tra bộ nút mới trong game thật (trang thu.html): nhiều cỡ màn hình, bấm thật bằng cảm ứng, đo thời gian vẽ.
Dùng: python3 kiem_tra.py <thư mục ra ảnh>"""
import sys, os, json
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
URL = 'file://' + os.path.join(here, 'thu.html')
SIZES = {
    'phone': dict(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=3),
    'p169': dict(viewport={'width': 667, 'height': 375}, has_touch=True, is_mobile=True, device_scale_factor=3),
    'nho': dict(viewport={'width': 568, 'height': 320}, has_touch=True, is_mobile=True, device_scale_factor=2),
    'may-tinh': dict(viewport={'width': 1280, 'height': 720}),
    'le': dict(viewport={'width': 915, 'height': 412}, has_touch=True, is_mobile=True, device_scale_factor=2.625),
}
VAO = """(o) => { G.resetSave(); const sv = G.save; sv.sound = false; sv.tut.done = !o.tut;
  for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
  sv.hero = o.hero || 'smith';
  const w = G.weaponById(sv.carry[0]); w.type = o.type || 'sword';
  if (o.el) { w.marks[o.el] = 140; w.branch = o.el; } w.tier = 2;
  G.rnd = G.srand(11);
  if (o.tut) G.startStage(0, 0, 0); else { G.startStage(2, 2, 0); G.gotoRoom(1); }
  G.sim(120); const S = G.getRun(); S.P.mana = S.P.maxmana; S.P.hp = S.P.maxhp; }"""
ok = True
with sync_playwright() as p:
    br = p.chromium.launch()
    for name, cfg in SIZES.items():
        ctx = br.new_context(**cfg); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('LỖI ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
        pg.goto(URL); pg.wait_for_function('window.G && G.scene')
        pg.evaluate(VAO, {'hero': 'hunter', 'type': 'spear', 'el': 'ice', 'tut': name == 'p169'})
        info = pg.evaluate("({ uiScale: G.uiScale, cx: G.cx, cy: G.cy })")
        pg.wait_for_timeout(300); pg.evaluate("G.tick = function () {}"); pg.wait_for_timeout(200)
        pg.screenshot(path=f'{out}/co-{name}.png')
        print(name, json.dumps(info), 'lỗi:', errs[:3]); ok = ok and not errs
        ctx.close()
    # bấm thật: giữ nút Đánh, kéo cần điều khiển lên trái, rồi bấm Né và kỹ năng
    ctx = br.new_context(**SIZES['phone']); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('LỖI ' + str(e)))
    pg.goto(URL); pg.wait_for_function('window.G && G.scene')
    pg.evaluate(VAO, {'hero': 'healer', 'type': 'hammer', 'el': 'poison'})
    cdp = ctx.new_cdp_session(pg)
    def xy(x, y):
        r = pg.evaluate("(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, G.scale]; })()")
        return {'x': r[0] + x * r[2], 'y': r[1] + y * r[2]}
    def touch(kind, pts):
        cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [dict(xy(x, y), id=i, radiusX=4, radiusY=4, force=1) for i, (x, y) in pts.items()]})
    cx, cy = pg.evaluate("G.cx"), pg.evaluate("G.cy")
    f = {0: (60, 210)}; touch('touchStart', f)
    f[0] = (46, 196); touch('touchMove', f)
    f[1] = (430 + cx, 220 + cy); touch('touchStart', f)
    pg.wait_for_timeout(250)
    st = pg.evaluate("[...G.pointers.values()].map((p) => p.role)")
    print('vai trò ngón:', st); ok = ok and sorted(st) == ['atk', 'joy']
    pg.screenshot(path=f'{out}/bam-danh-va-can.png')
    f[2] = (434 + cx, 166 + cy); touch('touchStart', f); pg.wait_for_timeout(120)
    f[3] = (380 + cx, 246 + cy); touch('touchStart', f); pg.wait_for_timeout(120)
    r = pg.evaluate("(() => { const P = G.getRun().P; return [P.skillCd > 0, P.dodgeCd > 0 || P.dodgeT > 0]; })()")
    print('kỹ năng và né đã chạy:', r); ok = ok and all(r)
    pg.screenshot(path=f'{out}/bam-ky-nang-va-ne.png')
    touch('touchEnd', {})
    # nháy sáng khi hồi xong: chờ nút Né hồi
    pg.wait_for_function("G.getRun().P.dodgeCd <= 0"); pg.wait_for_timeout(120)
    pg.screenshot(path=f'{out}/ne-vua-hoi-xong.png')
    # đo thời gian vẽ giao diện: 300 khung
    t = pg.evaluate("""() => { const t0 = performance.now(); for (let i = 0; i < 300; i++) { G.time += 1 / 60; G.ui.begin(); G.scene.draw(); } return (performance.now() - t0) / 300; }""")
    t2 = pg.evaluate("""() => { const c = G.ux, S = G.getRun(), P = S.P; const t0 = performance.now();
      for (let i = 0; i < 2000; i++) { G.btnArt.draw(c, 'atk', 430, 220, 29, { weapon: { type: 'sword', branch: 'fire', stage: 2 }, t: i / 60 });
        G.btnArt.draw(c, 'skill', 434, 166, 19, { hero: 'smith', cost: 40, cd: (i % 300) / 300, cdSec: 5 - (i % 300) / 60, t: i / 60 });
        G.btnArt.draw(c, 'dodge', 380, 246, 19, { dir: i / 50, t: i / 60 }); }
      return (performance.now() - t0) / 2000; }""")
    print('một khung vẽ cả màn hình: %.2f ms; riêng ba nút: %.3f ms' % (t, t2), 'lỗi:', errs[:3])
    ok = ok and not errs
    br.close()
print('ĐẠT' if ok else 'HỎNG')
