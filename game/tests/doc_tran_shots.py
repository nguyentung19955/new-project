"""Phiên Độ đọc trận + giao diện (12/10): chụp các màn cần so trước/sau trên iPhone ngang (844x390, dpr 3).
Chạy từ thư mục gốc repo:  python3 game/tests/doc_tran_shots.py <thư mục ảnh> [tiền tố] [tham số thêm sau ?cloud=0]
Ví dụ so: ... /tmp/truoc truoc "&doctran2=0"   rồi   ... /tmp/sau sau
Mở game/dist/linh-khi.html qua http.server (build trước: python3 game/build.py). In số pageerror; có lỗi thì thoát mã 1."""
import os, sys, time, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/doc-tran'
PRE = sys.argv[2] if len(sys.argv) > 2 else 'anh'
EXTRA = sys.argv[3] if len(sys.argv) > 3 else ''
CHI = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
os.makedirs(OUT, exist_ok=True)

SCENES = r"""
(() => {
  const C = (window.__canh = {});
  let timers = [];
  const clear = () => { for (const t of timers) clearInterval(t); timers = []; G.botInput = window.__bot0; };
  window.__bot0 = window.__bot0 || G.botInput;
  const spam = (on) => { const b0 = window.__bot0; G.botInput = function (S) { const i = b0(S); if (on) { i.skillP = true; i.specialP = (G.time * 60 | 0) % 20 === 0; i.atk = true; i.atkP = true; } return i; }; };
  const bat = () => timers.push(setInterval(() => { const S = G.getRun(); if (!S) return; const P = S.P; P.hp = P.maxhp; P.inv = 0.5; P.mana = P.maxmana; if (S.mode === 'dead') S.mode = 'play'; const W = G.getWorld(); if (W) W.over = null; }, 200));
  const fill = (n, roles, hp) => timers.push(setInterval(() => {
    const S = G.getRun(); if (!S || G.scene !== G.StageScene) return;
    const W = G.getWorld(); if (S.mode !== 'play') S.mode = 'play';
    const rw = W.x1 - W.x0 - 20, rh = W.y1 - W.y0 - 30;
    const live = W.ents.filter((e) => !e.dead && !e.isBoss).length;
    for (let i = live; i < n; i++) { const e = G.spawnEnemy(roles[i % roles.length], W.x0 + 10 + (i * 53) % rw, W.y0 + 20 + (i * 37) % rh, { hpMult: hp }); e.inside = true; }
  }, 250));
  C.dong = (r, br, hero, mua) => { clear(); G.testSave({ hero: hero || 'smith', melee: 'sword', lvl: 30, tier: 2, sharpen: 6, branch: br, marks: 300 });
    G.save.tut.done = true; G.startStage(r, 2, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight');
    const W = G.getWorld(); W.waves = []; W.spawns = []; Object.assign(G.botCfg, { explore: false, props: false });
    const P0 = G.getRun().P; if (P0.mv) { P0.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P0.mv.tipWait = null; }
    spam(!!mua); bat(); fill(12, ['rusher', 'swarm', 'shield', 'nimble', 'archer', 'spiky', 'elite'], 1e5); };
  C.trum = (r) => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 30, tier: 2, sharpen: 6, branch: 'ice', marks: 300 });
    G.startStage(r, 4, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.gotoRoom(S.map.boss);
    Object.assign(G.botCfg, { explore: false, props: false }); spam(false); bat(); };
  C.thang = () => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, tier: 1, sharpen: 3 }); G.startStage(0, 1, 0, { kind: 'A', seed: 99 });
    const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.gotoRoom(S.map.boss); S.got.push('3 quặng'); G.finishStage(true); S.modeT = -9; };
  C.thua = () => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, tier: 1, sharpen: 3 }); G.startStage(0, 1, 0, { kind: 'A', seed: 99 });
    const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight'); G.getWorld().waves = []; G.getWorld().spawns = []; S.P.hp = -8; };
  C.thua2 = () => { const S = G.getRun(); G.finishStage(false); S.modeT = -9; };
  C.lang = (moi) => { clear(); G.testSave({ hero: 'smith', melee: 'sword', lvl: moi ? 2 : 14, tier: 1, gold: moi ? 0 : 400 });
    if (!moi) { for (let i = 0; i < 5; i++) G.save.stars['0-' + i] = 2; }
    G.setScene(G.Village); };
  C.bang = (k, tab) => { const V = G.villageApi; V.open(k); if (tab) V.V.tab = tab; };
  C.xemVk = () => { const V = G.villageApi; V.V.wid = G.save.carry[0]; V.V.back = 'hub'; V.V.tab = 'weapon'; };
  C.dung = clear;
  return Object.keys(C);
})()
"""

# (tên ảnh, câu lệnh JS, chờ giây)
SHOTS = [
    ('01-tran-rung-doc', "__canh.dong(0, 'poison')", 3.0),
    ('02-tran-bien-bang', "__canh.dong(1, 'ice')", 3.0),
    ('03-tran-lau-dai-lua', "__canh.dong(2, 'fire')", 3.0),
    ('04-tran-lau-dai-lua-spam', "__canh.dong(2, 'fire', null, true)", 3.0),
    ('05-phong-trum', "__canh.trum(0)", 2.0),
    ('06-mau-am', "__canh.thua(); const sc = G.scene, u = sc.update; sc.update = () => {}; setTimeout(() => { sc.update = u; }, 700)", 0.4),
    ('07-thua', "__canh.thua2()", 0.8),
    ('08-thang', "__canh.thang()", 0.8),
    ('09-lang', "__canh.lang(false)", 2.5),
    ('10-lang-nguoi-moi', "__canh.lang(true)", 2.5),
    ('11-ong-tu', "__canh.lang(false); __canh.bang('tu')", 1.2),
    ('12-xem-vu-khi', "__canh.lang(false); __canh.xemVk()", 1.2),
    ('13-hang-xen', "__canh.lang(false); __canh.bang('xen')", 1.2),
    ('14-lo-ren', "__canh.lang(false); __canh.bang('ren')", 1.2),
    ('15-lo-ren-ren-do', "__canh.lang(false); __canh.bang('ren', 'forge'); G.villageApi.V.ftab = 'craft'", 1.2),
    ('16-cu-do-chuong', "__canh.lang(false); G.save.stars['0-0']=3; __canh.bang('do', 'chuong')", 1.2),
    ('17-cai-dat', "__canh.lang(false); __canh.bang('mo')", 1.2),
    ('18-hanh-trang', "__canh.lang(false); G.villageApi.V.tab = 'bag'", 1.2),
]


def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=GAME)
    h.log_message = lambda *a: None
    s = socketserver.TCPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s.server_address[1]


def main():
    port = serve()
    errs = []
    VT = {}  # vị trí em bé trên màn (CSS px) ở mỗi ảnh trận, để cắt phóng to so trước / sau
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/dist/linh-khi.html?cloud=0%s' % (port, EXTRA))
        pg.wait_for_function('window.G && G.scene', timeout=60000)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
        pg.evaluate(SCENES)
        time.sleep(1.5)
        for name, js, wait in SHOTS:
            if CHI and name not in CHI: continue
            try:
                pg.evaluate('() => { ' + js + ' }')
            except Exception as e:
                errs.append(name + ': ' + str(e)[:200]); continue
            time.sleep(wait)
            pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (PRE, name)))
            try: VT[name] = pg.evaluate("() => { const S = G.scene === G.StageScene && G.getRun(); if (!S || !S.P) return null; const W = G.getWorld(), r = document.getElementById('stage').getBoundingClientRect(); return [r.left + (S.P.x - W.cam) * G.scale, r.top + S.P.y * G.scale]; }")
            except Exception: pass
        pg.evaluate('() => __canh.dung()')
        import json; json.dump(VT, open(os.path.join(OUT, PRE + '-vitri-be.json'), 'w'))
        b.close()
    print('pageerror:', len(errs))
    for e in errs[:20]: print('  ', e)
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
