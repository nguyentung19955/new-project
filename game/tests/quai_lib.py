"""Đồ dùng chung cho các bài kiểm tra và ảnh chụp quái mới (tests/quai.py, tests/quai_shots.py)."""
import os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# T.frame: chạy từng khung có vẽ; T.room: vào một phòng đánh trống của vùng r; T.boss: vào phòng trùm.
LIB = r"""
(() => {
  const T = (window.T = {});
  T.inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, T.inp);
  T.frame = (n, i) => { for (let k = 0; k < (n || 1); k++) { if (i) T.inp = Object.assign({}, i); G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete T.inp[q]; } };
  T.sim = (n, keepHp) => { const S = G.getRun(); for (let k = 0; k < n; k++) { G.sim(1); if (keepHp && S && S.P) { S.P.hp = S.P.maxhp; S.P.dead = false; S.W.over = null; } } };
  T.room = function (r, i, o) {
    o = o || {};
    G.pointers.clear();
    G.testSave(Object.assign({ lvl: 10 }, o.save || {}));
    G.rnd = G.srand(o.seed || 5);
    G.startStage(r, i == null ? 2 : i, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'roomFore'); S.hint = null; W.banner = null;
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    P.inv = 0; P.hp = P.maxhp;
    return { S, W, P };
  };
  T.boss = function (r, big, o) {
    o = o || {};
    G.pointers.clear();
    G.testSave(Object.assign({ lvl: 14 }, o.save || {}));
    G.rnd = G.srand(o.seed || 5);
    G.startStage(r, big ? 4 : 2, 0);
    const S = G.getRun();
    const id = S.map.rooms.findIndex((x) => x.type === 'boss');
    if (!big) S.i = 2;
    G.gotoRoom(id);
    const W = G.getWorld(), P = S.P;
    S.hint = null; if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    return { S, W, P, b: W.boss };
  };
  T.errs = [];
  window.addEventListener('error', (e) => T.errs.push(String(e.message)));
})();
"""


def open_page(pw, w=992, h=540):
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.goto('file://' + ROOT + '/index.html')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(300)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    return b, pg, errs
