"""Chạy trọn vài ải có vẽ từng khung để bắt lỗi trong hoạt ảnh quái và trùm."""
import json
from playwright.sync_api import sync_playwright
errs = []
JS = """([r, i]) => {
  window.requestAnimationFrame = () => 0;
  G.resetSave(); const sv = G.save; sv.sound = false;
  for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
  const w = G.weaponById(sv.carry[0]); w.marks.fire = 140; w.branch='fire'; w.tier=2; w.sharpen=6;
  G.startStage(r, i, 0); G.getRun().stats.el.fire = 300; G.getRun().stats.ranged = 300; G.getRun().stats.dodges = 45; // GĐ3 (M4): ngưỡng "Bắt bài lăn né" nay là > 30 cú né rỗng
  let n = 0, draws = 0, err = null, modes = {};
  for (let s = 0; s < 60 * 900; s++) { // ải 8 phòng dài hơn trước, cho tối đa 900 giây
    const S = G.getRun(); if (!S) break;
    if (S.mode !== 'play') { if (S.mode === 'result' || S.mode === 'dead') { modes.end = S.mode; break; } G.botRun(1); continue; }
    S.W.P.hp = Math.max(S.W.P.hp, S.W.P.maxhp * 0.6);
    G.tick(); G.click = null;
    if (s % 2 === 0) { try { G.ui.begin(); G.scene.draw(); draws++; } catch (e) { err = String(e.stack || e); break; } }
  }
  return { draws, err, end: modes.end, room: G.getRun() && G.getRun().idx };
}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={'width': 844, 'height': 390})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.goto('file://' + __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))) + '/index.html')
    pg.wait_for_timeout(1200)
    pg.add_script_tag(path=__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), 'bot.js'))
    for r in range(3):
        for i in (1, 4):
            print(r, i, json.dumps(pg.evaluate(JS, [r, i]))[:600])
    print('errors', errs[:6])
    br.close()
