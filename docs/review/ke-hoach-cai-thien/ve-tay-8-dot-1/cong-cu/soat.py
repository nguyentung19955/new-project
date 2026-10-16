"""Vẽ tay 8 đợt 1: ảnh soát tĩnh (headless, KHÔNG chơi thử). Dựng cảnh bằng lệnh (game/tests/quai_lib.py LIB), chụp màn 960×540 (×2).
    python3 soat.py <tệp trang .html> <thư mục ra> [cờ url, vd '&vecode=1']
Cảnh:
  hud        phòng quái Rừng già: máu 55 %, vừa mất máu (phần vàng tụt dần), mana nửa; cắt góc trên trái (thanh máu, mana, Linh khí)
  quai-nho   2 quái thường + 1 tinh anh vừa trúng đòn: thanh máu nhỏ trên đầu (đỏ / cam / phần vừa mất)
  bt-tron    vùng báo tròn (Nấm Phồng sắp nổ)
  bt-trum    trùm nhỏ Hổ Lửa gầm phun lửa (quạt rộng) — vùng báo của trùm
  bt-trum-lau  Hồ Tinh: Vòng lửa ma (nhiều vòng tròn)"""
import io, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game/tests'))
from PIL import Image
from quai_lib import sync_playwright, ROOT, LIB

TRANG, OD = os.path.abspath(sys.argv[1]), sys.argv[2]
CO = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(OD, exist_ok=True)
PREP = r"""
(() => {
  T.keep = () => { const S = G.getRun(); const P = S.P; P.hp = Math.max(P.hp, 1); P.dead = false; S.W.over = null; P.inv = 9;
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; } S.hint = null; if (S.W.banner) S.W.banner = null; };
  T.pin = (x, y) => { const P = G.getRun().P; P.x = x; P.y = y; };
  T.until = (f, n, x, y) => { for (let k = 0; k < (n || 600); k++) { T.frame(1); T.keep(); if (x != null) T.pin(x, y); if (f()) return k; } return -1; };
  T.mob = (role, x, y) => { const e = G.spawnEnemy(role, x, y, { hpMult: 1e4 }); e.inside = true; e.spawnT = 0; return e; };
  T.zp = (pred) => G.getWorld().zones.find((z) => z.t > 0 && z.t0 && pred(z) && 1 - z.t / z.t0 > 0.55 && !(z.wait > 0));
})();
"""
CANH = [
    ('hud', (0, 0, 480, 64), r"""() => { Math.random = G.srand(4); const { S, W, P } = T.room(0, 2, { seed: 7, save: { lvl: 12 } }); T.pin(220, 170);
        for (let k = 0; k < 20; k++) { T.frame(1); T.keep(); } P.mana = (P.maxMana || 100) * 0.5; P.inv = 0; P.hp = P.maxhp * 0.75;
        T.frame(2); G.hurtPlayer(Math.round(P.maxhp * 0.2), null, null, true); T.frame(4); T.keep(); }"""),
    ('quai-nho', (110, 80, 380, 230), r"""() => { Math.random = G.srand(5); const { S, W, P } = T.room(0, 2, { seed: 7, save: { lvl: 12 } }); T.pin(160, 200);
        const a = T.mob('rusher', 250, 150), b = T.mob('rusher', 300, 190), c = T.mob('elite', 330, 140);
        for (const e of [a, b, c]) { e.spd = 0; e.wind = 0; }
        for (let k = 0; k < 10; k++) { T.frame(1); T.keep(); T.pin(160, 200); }
        a.hp = a.maxhp * 0.7; b.hp = b.maxhp * 0.35; c.hp = c.maxhp * 0.6; T.frame(1); a.hp = a.maxhp * 0.45; c.hp = c.maxhp * 0.4; T.frame(3); T.keep(); G.getRun().P.inv = 0; T.frame(1); }"""),
    ('bt-tron', None, r"""() => { const { W, P } = T.room(0, 2, { seed: 9 }); T.pin(220, 172); const e = T.mob('kami', 250, 160);
        T.until(() => T.zp((z) => z.shape === 'circle' && !z.bomb), 900, 220, 172); return [242, 160]; }"""),
    ('bt-trum', None, r"""() => { const { W, P, b } = T.boss(2, false, { seed: 3 }); T.until(() => false, 30); b.x = 300; b.y = 160; T.pin(230, 170);
        for (let k = 0; k < 900; k++) { if (!(b.busy > 0) && !b.dbg) G.bossDebug('chieu2'); T.frame(1); T.keep(); T.pin(230, 170); if (T.zp((z) => z.shape === 'cone' && z.r > 70)) break; }
        return [b.x - 50, b.y]; }"""),
    ('bt-trum-lau', None, r"""() => { const { W, P, b } = T.boss(2, true, { seed: 3 }); T.until(() => false, Math.ceil(b.intro * 60) + 10);
        b.hp = b.maxhp * 0.6; T.until(() => false, Math.ceil(G.monsterArt.dur(b.art, 'phase2') * 60) + 30); b.hp = b.maxhp * 0.6;
        for (let k = 0; k < 1500; k++) { if (!(b.busy > 0) && !b.dbg) G.bossDebug('c4'); T.frame(1); T.keep(); T.pin(W.x0 + 70, W.y1 - 40); if (b.an && b.an.n === 'c4' && W.zones.filter((z) => z.t > 0 && z.src === b && z.t0 && 1 - z.t / z.t0 > 0.5).length > 4) break; }
        return [W.x0 + 70, W.y1 - 50]; }"""),
]
CLIP = {'x': 16, 'y': 0, 'width': 960, 'height': 540}
errs = []
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540}, device_scale_factor=2)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file://' + TRANG + '?cloud=0' + CO); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(300)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(LIB); pg.evaluate(PREP)
    # chờ ảnh tải sau (gd-bt-*, hu-*, gd-*) về hết
    pg.wait_for_timeout(4000)
    pg.evaluate("() => { const SC = G.spriteCustom; if (SC && SC.canAnh) for (const m of ['gd-ruot-thanh','gd-mau-quai-nho','gd-icon-linh-khi','hu-bao-vung-soc','hu-bao-vung-vong','gd-bt-tron','gd-bt-quat']) SC.canAnh(m); }")
    pg.wait_for_timeout(3000)
    for ten, cr, js in CANH:
        try:
            r = pg.evaluate(js); pg.wait_for_timeout(100)
            im = Image.open(io.BytesIO(pg.screenshot(clip=CLIP))).convert('RGB')
            im.save(os.path.join(OD, ten + '-ca-man.png'))
            if cr is None:
                cam = pg.evaluate('() => { const W = G.getWorld(); return G.camVe ? G.camVe(W) : W.cam || 0; }'); cx, cy = r[0] - cam, r[1]
                cr = (max(0, int(cx - 120)), max(0, int(cy - 70)), min(480, int(cx + 120)), min(270, int(cy + 70)))
            k = im.width / pg.evaluate('() => G.W')  # điểm ảnh ảnh chụp / điểm game
            im = im.crop(tuple(int(v * k) for v in cr))
            im.save(os.path.join(OD, ten + '.png')); print(ten, cr)
        except Exception as e:
            errs.append('%s: %s' % (ten, e)); print('LỖI', ten, e)
    co = pg.evaluate("() => ['gd-ruot-thanh','gd-mau-quai-nho','gd-icon-linh-khi'].map((m) => m + ':' + !!(G.spriteCustom.gdSan && G.spriteCustom.gdSan(m))).concat(['hu-bao-vung-soc','hu-bao-vung-vong'].map((m) => m + ':' + !!G.fxAnh.co(m)))")
    print('ảnh sẵn sàng:', co)
    print('lỗi spriteCustom / fxAnh:', pg.evaluate("() => [G.spriteCustom.loi, G.fxAnh.loi]"))
    b.close()
print('LỖI JS:', errs if errs else 'không')
