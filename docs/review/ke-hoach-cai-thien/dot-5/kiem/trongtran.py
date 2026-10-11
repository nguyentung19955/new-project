"""Chụp trong trận thật (bản mới, cổng 8801): bot đánh ải 1, dừng ở lúc đang ra đòn / đang trúng đòn rồi chụp màn hình game. python3 trongtran.py <thư mục ảnh>"""
from chung import *
OUT = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    for key, vk in (('smith', 'sword'), ('wrestler', 'hammer')):
        pg = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2).new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8801/linh-khi.html?cloud=0'); pg.wait_for_timeout(1500)
        pg.add_script_tag(path=REPO + '/game/tests/setup.js'); pg.add_script_tag(path=REPO + '/game/tests/bot.js')
        pg.evaluate("window.requestAnimationFrame = () => 0"); pg.wait_for_timeout(200)
        r = pg.evaluate("""([key, vk]) => { G.testSave({ hero: key, lvl: 6, tier: 1, melee: vk }); Object.assign(G.botCfg, { prefer: vk }); G.startStage(0, 0, 0, { kind: 'A', seed: 1 });
          let n = 0; for (let i = 0; i < 4000; i++) { const S = G.getRun(); if (!S || S.mode !== 'play') { G.botRun(1); continue; } G.sim(1); const P = S.P; if (P.atkT > 0 && P.atkT < 0.33 && S.W.ents.length && i > 200) { n = i; break; } }
          G.ui.begin(); G.scene.draw(); const P = G.getRun().P; return { buoc: n, atkT: P.atkT, vk: G.curW ? G.curW(P).type : null }; }""", [key, vk])
        pg.screenshot(path='%s/trong-tran-%s.png' % (OUT, key)); print(key, r); pg.close()
    b.close()
print('lỗi trang:', errs[:3])
