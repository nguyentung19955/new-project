import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'file://' + ROOT + '/index.html'
OUTF = sys.argv[2] if len(sys.argv) > 2 else 'ket-qua.json'
HERE = os.path.dirname(os.path.abspath(__file__))
HOOK = open(os.path.join(HERE, 'hook.js')).read()
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=3)
    ctx.add_init_script(HOOK)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e) + ' @ ' + (e.stack or '')[:300]))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
    pg.goto(URL)
    pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=ROOT + '/tests/bot.js')
    pg.add_script_tag(path=ROOT + '/tests/setup.js')
    def sc(name, ms):
        pg.evaluate(f"__AUD.scene = {json.dumps(name)}; __AUD.t0 = performance.now()")
        pg.wait_for_timeout(ms)
    sc('man-chao', 2500)
    pg.evaluate("G.testSave({ lvl: 12, tier: 1, sharpen: 2, branch: 'fire', marks: 140, gold: 5000 }); G.save.potions = 2; G.save.stars = {'0-0': 3, '0-1': 3}; G.setScene(G.Village)")
    sc('lang', 1500)
    for k in ['KeyD', 'KeyS', 'KeyA', 'KeyW']:
        pg.keyboard.down(k); sc('lang', 1200); pg.keyboard.up(k)
    V = "G.villageApi.V"
    for tab in ['map', 'forge', 'gear', 'outfit', 'hero', 'skill', 'chuong', 'help', 'settings', 'so', 'thanhTuu', 'viecNgay']:
        pg.evaluate(f"{V}.tab = {json.dumps(tab)}; {V}.who = null")
        sc('lang-' + tab, 900)
    for ft in ['luyen', 'sharpen', 'vk', 'ep', 'up']:
        pg.evaluate(f"{V}.tab = 'forge'; {V}.ftab = {json.dumps(ft)}")
        sc('lang-ren-' + ft, 700)
    pg.evaluate(f"G.hanhTrang.openVillage()")
    for t in ['hero', 'weapon', 'skill', 'res']:
        pg.evaluate(f"G.hanhTrang.tab = {json.dumps(t)}")
        sc('hanh-trang-' + t, 800)
    pg.evaluate(f"{V}.tab = 'hub'")
    sc('lang', 600)
    # Ải 1 (Rừng già 1) với bot, bất tử
    pg.evaluate("(() => { const r = G.srand(5); Math.random = r; G.rnd = r; G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); const S = G.getRun(); S.fade = 0; S.tut = null; window.__S = S; })()")
    pg.evaluate("G.botInput = G.botInput; setInterval(() => { try { const S = G.getRun(); if (S && S.P) { S.P.inv = 9; S.P.hp = S.P.maxhp; } } catch (e) {} }, 200)")
    sc('ai-danh', 25000)
    for t in ['elite', 'chest', 'fountain', 'merchant', 'altar']:
        try:
            pg.evaluate(f"G.testGoto({json.dumps(t)})")
        except Exception as e:
            errs.append('goto ' + t + ' ' + str(e)[:80])
        sc('ai-phong-' + t, 4000)
    pg.evaluate("G.testGoto('boss')")
    sc('ai-trum', 20000)
    pg.evaluate("(() => { const save = G.botInput; G.__bot = save; G.botInput = () => ({ mx: 0, my: 0 }); })()")
    for m in ['paused', 'map', 'bag']:
        pg.evaluate(f"(() => {{ const S = G.getRun(); if (S) {{ if ({json.dumps(m)} === 'bag') G.hanhTrang.reset(); S.mode = {json.dumps(m)}; }} }})()")
        sc('ai-' + m, 1500)
    pg.evaluate("(() => { const S = G.getRun(); if (S) S.mode = 'result'; })()")
    sc('ai-ket-qua', 1500)
    res = pg.evaluate("__AUD")
    res['ma'] = pg.evaluate("(() => { const SC = G.spriteCustom, out = {}; for (const id of Object.keys(G.monsterArt._defs || {})) { const sp = SC.ds[id]; out[id] = sp ? (sp.ready ? 'ready' : 'chua') : 'khong'; } return out; })()")
    st = pg.evaluate("(() => { const S = G.getRun(); return S ? { mode: S.mode, idx: S.idx, boss: S.W && S.W.boss ? { hp: S.W.boss.hp, dead: S.W.boss.dead } : null } : null })()")
    b.close()
res['errs'] = errs; res['state'] = st
json.dump(res, open(os.path.join(HERE, OUTF), 'w'), ensure_ascii=False, indent=1)
print('sites', len(res['sites']), 'img', res['nimg'], 'errs', errs[:8], st)
