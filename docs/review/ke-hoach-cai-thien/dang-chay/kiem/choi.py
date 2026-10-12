# Chơi thật bản hai tệp: 4 em bé đi hết tốc / nửa cần / vừa đi vừa đánh, đo tốc độ đi, nhịp chân (khung chạy/giây), vẽ cảnh; bắt pageerror.
import json, sys
from playwright.sync_api import sync_playwright
T = '/home/claude/new-project/game/tests/'
JS = """([k, r, atk]) => { window.requestAnimationFrame = () => 0;
  G.testSave({ hero: k, lvl: 5, melee: 'spear' }); G.startStage(0, 1, 0);
  let S = G.getRun(), g = 0; while (S && S.mode !== 'play' && g++ < 600) { G.botRun ? G.botRun(1) : G.tick(); S = G.getRun(); }
  const P = S.W.P; P.x = (S.W.x0 + S.W.x1) / 2 - 60; P.y = (S.W.y0 + S.W.y1) / 2; for (const e of S.W.ents) e.hp = 1e9;
  let tog = false; G.botInput = () => { tog = !tog; return { mx: r, my: 0, atk: atk && tog, atkP: atk && tog, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false }; };
  const sp = G.spriteCustom.cuaEmBe(k, { key: k }); let x0 = P.x, c0 = P.chayT || 0, t0 = P.t, doi = 0, last = -1, err = null, n = 0;
  for (let s = 0; s < 90; s++) { P.hp = P.maxhp; G.tick(); const o = G.heroObj ? null : null;
    const s2 = G.spriteCustom.chonEmBe(sp, { key: k, move: P.moving, t: P.t, tc: P.chayT, p: P, atk: P.atkT > 0 ? 1 - P.atkT / P.atkDur : -1, dodge: -1, weapon: G.curW(P) });
    if (s2.ten === 'move') { if (s2.i !== last) doi++; last = s2.i; n++; }
    if (s % 3 === 0) { try { G.ui.begin(); G.scene.draw(); } catch (e) { err = String(e.stack || e); break; } } }
  const dt = P.t - t0; delete G.botInput;
  return { k, r, atk, vx: +((P.x - x0) / dt).toFixed(1), nhip: +(((P.chayT || 0) - c0) / dt).toFixed(2), khungChay: n, doiKhung: doi, khungMoiGiay: +(doi / dt).toFixed(1), so: sp.dt.move.so, err }; }"""
loi = []
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(viewport={'width': 844, 'height': 390})
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(sys.argv[1]); g.wait_for_function("window.G && G.startStage && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k=>{const s=G.spriteCustom.cuaEmBe(k,{key:k});return s&&s.img})", timeout=180000)
    g.add_script_tag(path=T + 'setup.js'); g.add_script_tag(path=T + 'bot.js')
    for k in ['smith', 'hunter', 'wrestler', 'healer']:
        for r, atk in [(1, False), (0.5, False), (1, True)]:
            print(json.dumps(g.evaluate(JS, [k, r, atk]), ensure_ascii=False))
    b.close()
print('pageerror:', loi or 'không có')
