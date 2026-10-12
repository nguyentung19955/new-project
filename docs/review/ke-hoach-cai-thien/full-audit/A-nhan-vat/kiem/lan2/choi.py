#!/usr/bin/env python3
"""Chơi thật bản hai tệp: 4 em bé x 4 vũ khí, đánh thường, giữ lấy đà, chiêu, lộn, chạy; vẽ cảnh mỗi 3 nhịp; đếm pageerror / lỗi vẽ.
python3 choi.py <url linh-khi-nhe.html?cloud=0> [JS cờ]"""
import json, sys
from playwright.sync_api import sync_playwright
T = '/home/claude/new-project/game/tests/'
JS = """([k, wt]) => { window.requestAnimationFrame = () => 0;
  G.testSave({ hero: k, lvl: 8, melee: wt === 'bow' ? 'sword' : wt }); G.startStage(0, 2, 0);
  let S = G.getRun(), g = 0; while (S && S.mode !== 'play' && g++ < 600) { G.botRun ? G.botRun(1) : G.tick(); S = G.getRun(); }
  const P = S.W.P; let err = null, ve = 0, n = 0, giu = 0;
  G.botInput = () => { n++; const ph = Math.floor(n / 40) % 5; return { mx: ph === 1 ? 1 : ph === 3 ? -1 : 0, my: ph === 2 ? 0.5 : 0, atk: ph === 4 || (n % 7 < 4), atkP: n % 7 === 0, dodgeP: n % 97 === 0, specialP: n % 131 === 0, skillP: n % 151 === 0, swapP: wt === 'bow' && n === 5, potionP: false, pauseP: false }; };
  for (let s = 0; s < 900; s++) { P.hp = P.maxhp; G.tick(); if (S.mode !== 'play') break; if (P.mv && P.mv.holding) giu++;
    if (s % 3 === 0) { try { G.ui.begin(); G.scene.draw(); ve++; } catch (e) { err = String(e.stack || e); break; } } }
  delete G.botInput; return { k, wt, ve, giu, err, loi: G.spriteCustom.loi.slice(0, 3) }; }"""
loi = []
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(viewport={'width': 844, 'height': 390})
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(sys.argv[1]); g.wait_for_function("window.G && G.startStage && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k=>{const s=G.spriteCustom.cuaEmBe(k,{key:k});return s&&s.img})", timeout=180000)
    g.add_script_tag(path=T + 'setup.js'); g.add_script_tag(path=T + 'bot.js')
    if len(sys.argv) > 2: g.evaluate(sys.argv[2])
    for k in ['smith', 'hunter', 'wrestler', 'healer']:
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            print(json.dumps(g.evaluate(JS, [k, wt]), ensure_ascii=False), flush=True)
    b.close()
print('pageerror:', loi or 'không có')
