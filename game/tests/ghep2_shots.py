"""Chụp ảnh thật từ game cho đợt ghép 2, lưu vào docs/ghep-2/.
Chạy từ thư mục game:  python3 tests/ghep2_shots.py [tên ảnh ...]
Tên ảnh: hero (phong-vuong-hero-moi), vung (ba-vung), bando (ban-do-mot-mau), trum (phong-trum),
vukhi (bon-vu-khi-trong-phong), gif (mot-ai-tu-dau-den-cuoi). Không ghi gì thì chụp hết. Cần thêm Pillow."""
import io, os, re, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'ghep-2')
URL = 'file://' + ROOT + '/index.html'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
# dùng lại bộ đồ nghề T.* của tests/room_shots.py
HELP = re.search(r'HELP = r"""(.*?)"""', open(os.path.join(ROOT, 'tests', 'room_shots.py'), encoding='utf-8').read(), re.S).group(1)
# Thêm: chạy game CÓ vẽ hiệu ứng (G.sim thì tắt hiệu ứng) để ảnh có vệt chém, tia lửa, số sát thương.
HELP2 = r"""
G.MOVE_TIPS = {}; // tắt dòng mẹo vũ khí lúc chụp, để không che phòng
Object.assign(T, {
  step(n) { const sc = T.sc || G.scene; for (let i = 0; i < (n || 1); i++) { G.time += 1 / 60; sc.update(1 / 60); G.keyP = {}; G.downs.length = 0; } },
  // bot đánh (có hiệu ứng) tới khi pred(S, W, P) đúng; giữ máu để không gục giữa chừng
  liveUntil(pred, maxTicks) {
    T.freeze();
    const S = G.getRun();
    for (let k = 0; k < (maxTicks || 1200); k++) {
      T.step(1);
      if (S.mode !== 'play') { G.botRun(1); T.freeze(); continue; }
      S.P.hp = Math.max(S.P.hp, S.P.maxhp * 0.75);
      if (pred(S, S.W, S.P, k)) return true;
    }
    return false;
  },
  // dựng một phòng đánh quái có nhiều cửa, đã qua vài phòng (để bản đồ nhỏ có nhiều ô)
  fightRoom(r, save, waves, i) {
    const seed = T.findSeed('B', (m) => m.rooms.some((o) => o.type === 'fight' && T.doorsOf(m, o.id) >= 3));
    const S = T.start(r, i == null ? 2 : i, 'B', seed, save);
    const id = S.map.rooms.find((o) => o.type === 'fight' && T.doorsOf(S.map, o.id) >= 3).id;
    for (const o of S.map.rooms) if (o.id < id) { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; for (const d of G.mapgen.DKEYS) if (o.doors[d] != null) S.known[o.doors[d]] = true; }
    G.gotoRoom(id); S.fade = 0;
    const W = G.getWorld();
    W.banner = null;
    W.waves = waves || [['rusher', 'shield', 'swarm', 'swarm', 'swarm', 'archer', 'nimble']]; W.waveI = -1; W.waveT = 0.1;
    T.freeze();
    for (let k = 0; k < 400 && W.ents.length < W.waves[0].length; k++) { T.step(1); for (const e of W.ents) if (!e.shot) { e.shot = 1; e.hp = e.maxhp = e.maxhp * 5; } S.P.inv = 1; }
    W.banner = null;
    return S;
  },
});
"""
REG = ['Rừng già', 'Hang biển', 'Lâu đài cổ']
LONG = (1170, 540)   # màn hình dài (tỉ lệ 19,5:9), game phóng đúng 2 lần, có lề hai bên
WIDE = (960, 540)    # màn hình 16:9, không có lề


class Cam:
    def __init__(self, p, size=LONG, dsf=2):
        self.b = p.chromium.launch()
        self.pg = self.b.new_page(viewport={'width': size[0], 'height': size[1]}, device_scale_factor=dsf)
        self.errs = []
        self.pg.on('pageerror', lambda e: self.errs.append(str(e)))
        self.pg.on('console', lambda m: self.errs.append(m.text) if m.type == 'warning' and ('art' in m.text or 'hero' in m.text) else None)
        self.pg.goto(URL)
        self.pg.wait_for_function('window.G && G.scene')
        self.pg.wait_for_timeout(600)
        self.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        self.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        self.pg.evaluate(HELP)
        self.pg.evaluate(HELP2)

    def ev(self, js, arg=None):
        return self.pg.evaluate(js, arg) if arg is not None else self.pg.evaluate(js)

    def grab(self, wait=160):
        """Chụp cả trang (kể cả hai lề, nơi nút bấm nằm ở màn hình dài)."""
        self.pg.wait_for_timeout(wait)
        return Image.open(io.BytesIO(self.pg.screenshot())).convert('RGB')

    def close(self):
        self.b.close()


def sheet(title, panels, cols, pw, path, note=None):
    """Ghép nhiều ảnh thành một tấm: panels = [(ảnh, chú thích)]. Mỗi ảnh giữ đúng tỉ lệ của nó."""
    f1, f2, f3 = ImageFont.truetype(FONT, 34), ImageFont.truetype(FONT, 22), ImageFont.truetype(FONT2, 19)
    ph = max(round(pw * im.size[1] / im.size[0]) for im, _ in panels)
    rows = (len(panels) + cols - 1) // cols
    pad, cap, top = 24, 64, 84
    W = cols * pw + (cols + 1) * pad
    H = top + rows * (ph + cap + pad) + (40 if note else 0)
    out = Image.new('RGB', (W, H), '#140f10')
    d = ImageDraw.Draw(out)
    d.text((W / 2, 44), title, font=f1, fill='#ffd27a', anchor='mm')
    for k, (im, text) in enumerate(panels):
        x = pad + (k % cols) * (pw + pad)
        y = top + (k // cols) * (ph + cap + pad)
        h = round(pw * im.size[1] / im.size[0])
        out.paste(im.resize((pw, h), Image.LANCZOS), (x, y + (ph - h) // 2))
        d.rectangle([x - 1, y - 1, x + pw, y + ph], outline='#7a5a3a')
        lines = text.split('\n')
        d.text((x + pw / 2, y + ph + 20), lines[0], font=f2, fill='#f1ead9', anchor='mm')
        if len(lines) > 1:
            d.text((x + pw / 2, y + ph + 46), lines[1], font=f3, fill='#d9cdb8', anchor='mm')
    if note:
        d.text((W / 2, H - 30), note, font=f3, fill='#d9cdb8', anchor='mm')
    out.save(path)
    print('đã ghi', os.path.relpath(path, os.path.dirname(ROOT)))


# Điều kiện "đang ra đòn đẹp" cho từng vũ khí (S, W, P) -> bool
MOMENT = {
    'sword': "(S, W, P) => P.mv && P.mv.name === 'Nhát kết' && P.atkT > 0 && P.atkT < P.atkDur * 0.5 && W.ents.some((e) => Math.abs(e.x - P.x) < 46 && Math.abs(e.y - P.y) < 18)",
    'bow': "(S, W, P) => W.projs.some((o) => o.team === 'player' && o.big && Math.abs(o.x - P.x) > 30 && Math.abs(o.x - P.x) < 70)",
    'spear': "(S, W, P) => P.mv && P.mv.kind === 'quet' && P.atkT > 0 && P.atkT < P.atkDur * 0.5 && W.ents.some((e) => Math.hypot(e.x - P.x, e.y - P.y) < 50)",
    'hammer': "(S, W, P) => (W.mvWaves || []).some((z) => Math.abs(z.x - P.x) > 30) && W.ents.some((e) => Math.abs(e.x - P.x) < 60 && Math.abs(e.y - P.y) < 24)",
}


def fight(c, r, hero, wtype, el, tier, moment=None, waves=None, family=0):
    """Dựng một trận trong phòng đánh quái rồi dừng hình đúng lúc đang ra đòn."""
    save = {'hero': hero, 'melee': 'sword' if wtype == 'bow' else wtype, 'tier': tier, 'sharpen': 3, 'branch': el, 'marks': 300 if el else 0, 'lvl': 8 + r * 6, 'family': family}
    return c.ev("""([r, save, wtype, moment, waves]) => {
      for (let seed = 5; seed < 17; seed++) {
        T.rng(seed * 31 + r);
        const S = T.fightRoom(r, save, waves);
        Object.assign(G.botCfg, { prefer: wtype, props: false });
        if (G.curW(S.P).type !== wtype) { S.P.cur = 1 - S.P.cur; }
        const pred = eval(moment);
        const mid = (W, P) => P.x > W.x0 + 40 && P.x < W.x1 - 40 && P.y > W.y0 + 44 && P.y < W.y1 - 24; // đứng giữa phòng cho dễ nhìn
        const hit = T.liveUntil((S, W, P, k) => k > 50 && W.ents.length >= 3 && mid(W, P) && pred(S, W, P), 1800);
        S.W.banner = null;
        if (hit) return seed;
      }
      return -1;
    }""", [r, save, wtype, moment or MOMENT[wtype], waves])


def shot_hero(c):
    # nhát thứ hai của chuỗi kiếm, đúng lúc lưỡi kiếm vừa chạm quái (chưa tới vụ nổ của nhát kết, để còn thấy rõ em bé)
    ok = fight(c, 2, 'smith', 'sword', 'fire', 2, family=3, moment="(S, W, P) => P.mv && P.mv.step === 1 && P.atkT > 0 && P.atkT < P.atkDur * 0.5 && P.atkT > P.atkDur * 0.25 && W.ents.filter((e) => Math.abs(e.x - P.x) < 50 && Math.abs(e.y - P.y) < 20).length >= 2")
    im = c.grab()
    im.save(os.path.join(OUT, 'phong-vuong-hero-moi.png'))
    print('đã ghi docs/ghep-2/phong-vuong-hero-moi.png', '(hạt giống %s)' % ok)


def shot_regions(c):
    panels = []
    for r, hero, wt, el, tier, name in ((0, 'hunter', 'bow', 'poison', 1, 'Thợ Săn giương cung Độc'), (1, 'healer', 'spear', 'ice', 2, 'Thầy Lang quét giáo Băng'), (2, 'wrestler', 'hammer', 'fire', 3, 'Đô Vật nện búa Lửa bậc Vàng')):
        fight(c, r, hero, wt, el, tier, family=r * 3 + 1)
        panels.append((c.grab(), REG[r] + ' · ' + name + '\nEm bé tinh linh và vũ khí sống trong phòng vuông, nút mới ở lề phải'))
    sheet('Ba vùng sau khi ghép (ảnh chụp từ game, màn hình dài)', panels, 1, 1500, os.path.join(OUT, 'ba-vung.png'))


def shot_weapons(c):
    panels = []
    info = (('sword', 'smith', 0, 'fire', 'Kiếm: nhát kết của chuỗi ba nhát'), ('bow', 'hunter', 1, 'ice', 'Cung: tên mạnh vừa rời dây, ngắm chéo được'),
            ('spear', 'healer', 2, 'poison', 'Giáo: nhát thứ tư quét một vòng'), ('hammer', 'wrestler', 0, None, 'Búa: nện đất, sóng chấn động chạy trên sàn'))
    for wt, hero, r, el, text in info:
        res = fight(c, r, hero, wt, el, 1, family=5)
        if res < 0: print('  (không bắt được đúng khoảnh khắc cho', wt + ')')
        panels.append((c.grab(), text + '\n' + REG[r] + (' · hệ ' + {'fire': 'Lửa', 'ice': 'Băng', 'poison': 'Độc'}[el] if el else ' · chưa có hệ')))
    sheet('Bốn vũ khí trong phòng vuông (ảnh chụp từ game)', panels, 2, 1100, os.path.join(OUT, 'bon-vu-khi-trong-phong.png'))


def shot_maps(c):
    panels = []
    names = {'A': 'Kiểu A: đường chính có nhánh phụ', 'B': 'Kiểu B: mê cung nhỏ', 'C': 'Kiểu C: sảnh trung tâm'}
    for kind, r, i in (('A', 0, 1), ('B', 1, 2), ('C', 2, 4)):
        c.ev("""([r, i, kind]) => {
          const M = G.mapgen;
          const S = T.start(r, i, kind, kind === 'C' ? 3 : 1);
          const ok = (S) => S.W.cleared && !S.trans && !S.W.banner && S.W.ents.length === 0;
          if (kind === 'A') T.playUntil((S) => Object.keys(S.seen).length >= 5 && ok(S), 300);
          else if (kind === 'B') T.playUntil((S) => M.gateCount(S.map, S.cleared) === 2 && S.W.type !== 'boss' && S.W.cleared && !S.trans, 300);
          else T.playUntil((S) => S.idx === 0 && M.gateCount(S.map, S.cleared) === 2 && ok(S), 300);
          const S2 = G.getRun(), P = S2.P, g = S2.W.geo; S2.W.banner = null; P.x = g.cx - 24; P.y = g.cy + 24; P.face = 1;
          G.sim(20); T.freeze();
        }""", [r, i, kind])
        mid = c.grab()
        c.ev("() => { T.thaw(); G.getRun().mode = 'map'; }")
        panels.append((mid, names[kind] + ' · bản đồ nhỏ lúc đang chơi\nMọi ô một màu; loại phòng xem ở biểu tượng'))
        panels.append((c.grab(300), names[kind] + ' · bản đồ to\nÔ đang đứng sáng và có viền nổi; ô đã qua đậm, ô mới biết nhạt'))
        c.ev("() => { const S = G.getRun(); if (S) S.mode = 'play'; }")
    sheet('Bản đồ nhỏ và bản đồ to một màu, ba kiểu A, B, C (ảnh chụp từ game)', panels, 2, 1100, os.path.join(OUT, 'ban-do-mot-mau.png'), 'Cửa Trùm còn khóa thì có ổ khóa ở lối vào. Chạm vào bản đồ nhỏ để xem bản đồ to.')


BOSS_JS = """([r, i, kind, hero, wt]) => {
  const S = T.start(r, i, kind, 3, { lvl: 10 + r * 8, hero, melee: wt, tier: 2, branch: 'fire', marks: 300 });
  for (const o of S.map.rooms) if (o.type !== 'boss') { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; }
  S.stats.el.fire = 500; S.stats.melee = 400;
  G.gotoRoom(S.map.boss); S.fade = 0;
  T.liveUntil((S, W, P, k) => k > 260 && W.zones.some((z) => z.t > 0.25 && z.t < 0.5) && !W.boss.hidden && P.atkT > 0, 1800);
}"""


def shot_boss(p):
    panels = []
    c = Cam(p, LONG)
    for r, name, hero, wt in ((0, 'Mộc Tinh', 'smith', 'sword'), (1, 'Ngư Tinh', 'hunter', 'spear'), (2, 'Hồ Tinh', 'wrestler', 'hammer')):
        c.ev(BOSS_JS, [r, 4, 'C', hero, wt])
        panels.append((c.grab(), name + ' · ' + REG[r] + ' · màn hình dài\nNút nằm ở lề, không đè lên sàn phòng trùm'))
    errs = c.errs; c.close()
    c = Cam(p, WIDE)
    c.ev(BOSS_JS, [1, 4, 'C', 'healer', 'sword'])
    panels.append((c.grab(), 'Ngư Tinh · màn hình 16:9 (không có lề)\nBộ nút tự thu nhỏ và nép sát mép phải, không đè sàn'))
    errs += c.errs; c.close()
    sheet('Phòng trùm với hero mới (ảnh chụp từ game)', panels, 2, 1100, os.path.join(OUT, 'phong-trum.png'))
    return errs


def shot_gif(p):
    """Ảnh động: bot đi qua vài phòng của một ải (đánh quái, cửa mở, sang phòng kề, tới rương, vào phòng trùm)."""
    c = Cam(p, WIDE, dsf=1)
    frames = []

    def rec(ticks, every=6):
        for k in range(0, ticks, every):
            c.ev("([n]) => { const S = G.getRun(); if (S && S.mode !== 'play' && S.mode !== 'map') { G.botRun(1); T.freeze(); } T.step(n); if (S) S.P.hp = Math.max(S.P.hp, S.P.maxhp * 0.7); }", [every])
            c.pg.wait_for_timeout(40)
            frames.append(Image.open(io.BytesIO(c.pg.screenshot())).convert('RGB').resize((600, 338), Image.LANCZOS))

    c.ev("""() => {
      T.rng(77);
      const S = T.start(0, 2, 'A', 5, { hero: 'smith', melee: 'sword', tier: 1, sharpen: 3, branch: 'fire', marks: 300, lvl: 9 });
      S.fade = 0; G.botCfg.side = true; T.freeze();
    }""")
    rec(210)                                                 # phòng Bắt đầu: quái hiện ra, đánh
    c.ev("() => T.liveUntil((S, W) => W.cleared && !S.trans, 3000)")
    rec(150)                                                 # cửa mở, đi sang phòng kề
    c.ev("() => T.liveUntil((S, W) => W.ents.length >= 3, 1200)")
    rec(180)                                                 # đánh trong phòng thứ hai
    c.ev("() => T.liveUntil((S, W) => W.cleared && !S.trans && Object.keys(S.seen).length >= 3, 6000)")
    rec(150)                                                 # sang phòng kế tiếp
    c.ev("() => { const S = G.getRun(); S.mode = 'map'; }")  # mở bản đồ to một lúc
    for _ in range(8):
        c.pg.wait_for_timeout(60)
        frames.append(Image.open(io.BytesIO(c.pg.screenshot())).convert('RGB').resize((600, 338), Image.LANCZOS))
    c.ev("() => { const S = G.getRun(); S.mode = 'play'; }")
    c.ev("() => T.liveUntil((S, W) => W.type === 'boss', 40000)")
    rec(210)                                                 # vào phòng trùm
    path = os.path.join(OUT, 'mot-ai-tu-dau-den-cuoi.gif')
    pal = [f.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=100, loop=0, optimize=True)
    print('đã ghi docs/ghep-2/mot-ai-tu-dau-den-cuoi.gif', len(frames), 'khung,', round(os.path.getsize(path) / 1e6, 1), 'MB')
    errs = c.errs; c.close()
    return errs


def main():
    want = sys.argv[1:] or ['hero', 'vung', 'bando', 'trum', 'vukhi', 'gif']
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        if any(k in want for k in ('hero', 'vung', 'bando', 'vukhi')):
            c = Cam(p)
            for name, fn in (('hero', shot_hero), ('vung', shot_regions), ('bando', shot_maps), ('vukhi', shot_weapons)):
                if name in want:
                    fn(c)
            errs += c.errs; c.close()
        if 'trum' in want:
            errs += shot_boss(p)
        if 'gif' in want:
            errs += shot_gif(p)
    if errs:
        print('LỖI TRANG:', errs[:5])
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
