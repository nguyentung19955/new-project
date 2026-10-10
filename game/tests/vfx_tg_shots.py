"""Chụp ảnh kiểm tra phần thế giới và giao diện (VFX Phase 4, 5): làng, ba vùng, HUD lúc mất máu, màn dọc.
Chạy từ thư mục game:  python3 tests/vfx_tg_shots.py [thư mục ra]
Ảnh để tự xem bằng mắt; bài cũng báo lỗi JS nếu có."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'file://' + ROOT + '/index.html'
HELP = r"""
window.T = {
  sc: null,
  // Dừng trận đấu nhưng vẫn vẽ, để chụp đúng khoảnh khắc.
  freeze() { if (!T.sc) { const sc = G.StageScene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  // Tìm hạt giống mà bản đồ thoả điều kiện.
  findSeed(kind, pred) { for (let s = 1; s < 3000; s++) { const m = G.mapgen.make(kind, s); if (pred(m)) return s; } return 1; },
  doorsOf(m, id) { return G.mapgen.DKEYS.filter((d) => m.rooms[id].doors[d] != null).length; },
  start(r, i, kind, seed, save) {
    T.thaw(); T.rng(seed * 13 + 5);
    G.testSave(Object.assign({ lvl: 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2 + r * 2, branch: 'fire', marks: 140, armor: ['a_r1', 'a_r2', 'a_r3'][r], helm: ['h_r1', 'h_r2', 'h_r3'][r] }, save || {}));
    G.startStage(r, i, 0, { kind, seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  // Cho bot đánh tới khi đang vung đòn giữa ít nhất n quái, rồi dừng hình.
  fightUntil(n, maxTicks) {
    const S = G.getRun();
    for (let k = 0; k < (maxTicks || 900); k++) {
      G.sim(1);
      const W = S.W, P = S.P;
      if (S.mode !== 'play') break;
      if (W.ents.length >= n && P.atkT > 0 && P.atkT < P.atkDur * 0.6 && W.ents.some((e) => Math.abs(e.x - P.x) < 40 && Math.abs(e.y - P.y) < 16)) break;
    }
    S.P.hp = Math.max(S.P.hp, Math.round(S.P.maxhp * 0.8));
    T.freeze();
  },
  // Cho bot chơi tới khi vào phòng thoả điều kiện (hoặc hết giờ).
  playUntil(pred, maxSec) {
    for (let k = 0; k < (maxSec || 300) * 4; k++) {
      const S = G.getRun();
      if (!S || S.mode === 'result' || S.mode === 'dead') return false;
      if (S.mode !== 'play') { G.botRun(1); continue; }
      if (pred(S)) return true;
      G.sim(15);
      S.P.hp = Math.max(S.P.hp, S.P.maxhp * 0.6);
    }
    return false;
  },
};
"""


class Cam:
    def __init__(self, p):
        self.b = p.chromium.launch()
        self.pg = self.b.new_page(viewport={'width': 992, 'height': 540}, device_scale_factor=1.5)
        self.errs = []
        self.pg.on('pageerror', lambda e: self.errs.append(str(e)))
        self.pg.on('console', lambda m: self.errs.append(m.text) if m.type == 'warning' and 'art' in m.text else None)
        self.pg.goto(URL)
        self.pg.wait_for_function('window.G && G.scene')
        self.pg.wait_for_timeout(600)
        self.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        self.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        self.pg.evaluate(HELP)

    def ev(self, js, arg=None):
        return self.pg.evaluate(js, arg) if arg is not None else self.pg.evaluate(js)

    def grab(self, wait=180):
        self.pg.wait_for_timeout(wait)
        box = self.pg.evaluate("(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
        png = self.pg.screenshot(clip={'x': box[0], 'y': box[1], 'width': box[2], 'height': box[3]})
        return Image.open(io.BytesIO(png)).convert('RGB')

    def close(self):
        self.b.close()



OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tests', 'out_vfx_tg')
os.makedirs(OUT, exist_ok=True)


def main():
    with sync_playwright() as p:
        c = Cam(p)
        errs = c.errs
        # ba vùng
        for r, name in ((0, 'rung'), (1, 'hang'), (2, 'laudai')):
            c.ev("""([r]) => {
              const S = T.start(r, 1, 'A', 3);
              T.fightUntil(2, 300);
            }""", [r])
            c.grab().save(os.path.join(OUT, name + '.png'))
            c.ev("() => T.thaw()")
            c.grab(500).save(os.path.join(OUT, name + '-2.png'))
        # HUD mất máu: em bé và quái mất máu cùng lúc, chụp ngay (phần tụt dần còn đang chạy), rồi chụp lúc đã rút xong, rồi lúc hồi máu
        c.ev("""() => { const S = T.start(0, 1, 'A', 3); const W = S.W;
           W.waves = [['rusher', 'shield', 'swarm', 'archer', 'elite']]; W.waveI = -1; W.waveT = 0.1;
           for (let k = 0; k < 400 && W.ents.length < 4; k++) { G.sim(1); for (const e of W.ents) if (!e.shot) { e.shot = 1; e.hp = e.maxhp = e.maxhp * 6; } }
           G.sim(30); const P = S.P; P.hp = P.maxhp; G.sim(10); P.hp = Math.round(P.maxhp * 0.55);
           T.freeze(); G.scene.draw(); for (const e of W.ents) e.hp = e.maxhp * 0.3; }""")
        c.grab(60).save(os.path.join(OUT, 'hud-mat-mau.png'))
        c.grab(900).save(os.path.join(OUT, 'hud-mat-mau-2.png'))
        c.ev("() => { const S = G.getRun(); S.P.hp = S.P.maxhp * 0.9; }")
        c.grab(150).save(os.path.join(OUT, 'hud-hoi-mau.png'))
        # làng
        c.ev("() => { G.testSave({ lvl: 8 }); G.save.tut && (G.save.tut.done = true); G.setScene(G.Village); }")
        c.grab(800).save(os.path.join(OUT, 'lang.png'))
        c.grab(900).save(os.path.join(OUT, 'lang-2.png'))
        c.close()
        print('lỗi JS:', [e for e in errs] or 'không có')


if __name__ == '__main__':
    main()
