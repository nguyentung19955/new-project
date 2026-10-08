"""Chụp ảnh thật từ game cho phòng vuông và bản đồ ải, lưu vào docs/phong-vuong/.
Chạy từ thư mục game:  python3 tests/room_shots.py [tên ảnh ...]
Tên ảnh: phong (ba ảnh phòng theo chủ đề), cua, bando, trum, loai. Không ghi gì thì chụp hết."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'phong-vuong')
URL = 'file://' + ROOT + '/index.html'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

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


def sheet(title, panels, cols, pw, path, note=None):
    """Ghép nhiều ảnh thành một tấm: panels = [(ảnh, chú thích)]."""
    f1, f2, f3 = ImageFont.truetype(FONT, 34), ImageFont.truetype(FONT, 22), ImageFont.truetype(FONT2, 19)
    ph = round(pw * 9 / 16)
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
        out.paste(im.resize((pw, ph), Image.LANCZOS), (x, y))
        d.rectangle([x - 1, y - 1, x + pw, y + ph], outline='#7a5a3a')
        lines = text.split('\n')
        d.text((x + pw / 2, y + ph + 20), lines[0], font=f2, fill='#f1ead9', anchor='mm')
        if len(lines) > 1:
            d.text((x + pw / 2, y + ph + 46), lines[1], font=f3, fill='#d9cdb8', anchor='mm')
    if note:
        d.text((W / 2, H - 30), note, font=f3, fill='#d9cdb8', anchor='mm')
    out.save(path)
    print('đã ghi', os.path.relpath(path, os.path.dirname(ROOT)))


REG = ['Rừng già', 'Hang biển', 'Lâu đài cổ']


def shot_rooms(c):
    """Ba ảnh: đang đánh quái trong phòng có nhiều cửa, mọi cửa khóa."""
    for r, name in ((0, 'phong-rung'), (1, 'phong-hang'), (2, 'phong-lau-dai')):
        c.ev("""([r]) => {
          const seed = T.findSeed('B', (m) => m.rooms.some((o) => o.type === 'fight' && T.doorsOf(m, o.id) >= 4));
          const S = T.start(r, 2, 'B', seed);
          const id = S.map.rooms.find((o) => o.type === 'fight' && T.doorsOf(S.map, o.id) >= 4).id;
          for (const o of S.map.rooms) if (o.id < id && o.id !== id) { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; }
          G.gotoRoom(id); G.getRun().fade = 0;
          const W = G.getWorld();
          W.zones.push({ shape: 'circle', x: W.geo.cx + 40, y: W.geo.cy + 52, r: 22, t: 0.9, t0: 1.6, dmg: 1, el: null, life: 0.12 });
          W.zones.push({ shape: 'circle', x: W.geo.cx - 50, y: W.geo.cy - 44, r: 20, t: 0, pool: true, team: 'enemy', el: G.REGIONS[r].el, life: 30, tick: 9, dmg: 0 });
          T.fightUntil(4, 700);
          for (const z of W.zones) if (z.t > 0) z.t = Math.max(z.t, 0.5);
        }""", [r])
        im = c.grab()
        im.save(os.path.join(OUT, name + '.png'))
        print('đã ghi docs/phong-vuong/' + name + '.png')


def shot_doors(c):
    """Cửa khóa, cửa mở, đang trượt sang phòng kề, vừa vào phòng mới."""
    panels = []
    c.ev("""() => {
      const seed = T.findSeed('B', (m) => T.doorsOf(m, 0) >= 2 && G.mapgen.DKEYS.some((d) => m.rooms[0].doors[d] != null && m.rooms[m.rooms[0].doors[d]].type === 'chest'));
      const S = T.start(2, 1, 'B', seed);
      T.fightUntil(2, 400);
    }""")
    panels.append((c.grab(), '1. Còn quái: mọi cửa khóa\nSong sắt chắn cửa, có ổ khóa đỏ'))
    c.ev("""() => { T.thaw(); T.playUntil((S) => S.W.cleared && S.W.ents.length === 0 && !S.W.banner, 60); const S = G.getRun(), g = S.W.geo; S.P.x = g.cx; S.P.y = g.cy + 10; G.sim(40); T.freeze(); }""")
    panels.append((c.grab(), '2. Hết quái: các cửa mở cùng lúc\nÁnh sáng tràn vào, mũi tên chỉ lối đi'))
    c.ev("""() => {
      T.thaw(); const S = G.getRun();
      const d = S.W.doors.find((x) => S.map.rooms[x.to].type === 'chest') || S.W.doors[0];
      S.trans = { to: d.to, dir: d.dir, phase: 0, t: 0.07 }; T.freeze();
    }""")
    panels.append((c.grab(), '3. Bước vào cửa: màn hình trượt theo hướng đi\nPhòng cũ trượt ra và tối dần'))
    c.ev("""() => { T.thaw(); const S = G.getRun(); G.sim(6); S.trans = { to: S.idx, dir: S.trans ? S.trans.dir : 'up', phase: 1, t: 0.12 }; T.freeze(); }""")
    panels.append((c.grab(), '4. Phòng kề hiện ra, đứng ngay cửa đối diện\nBản đồ nhỏ sáng thêm một ô'))
    c.ev("""() => { T.thaw(); const S = G.getRun(); S.trans = null; G.sim(30); T.freeze(); }""")
    sheet('Cửa khóa, cửa mở và chuyển phòng (ảnh chụp từ game)', panels, 2, 880, os.path.join(OUT, 'cua-mo-va-chuyen-phong.png'))


def shot_maps(c):
    """Bản đồ to của một ải mẫu ở mỗi kiểu, chụp lúc đã đi gần hết ải."""
    panels = []
    names = {'A': 'Kiểu A: đường chính có nhánh phụ', 'B': 'Kiểu B: mê cung nhỏ', 'C': 'Kiểu C: sảnh trung tâm'}
    notes = {'A': 'Suối hồi và Trùm nằm cuối lối chính, hai phòng phụ bỏ qua được', 'B': 'Cửa Trùm trong phòng Suối hồi, mở khi dọn xong 3 phòng quái', 'C': 'Đủ 3 mảnh chìa thì cửa phía trên sảnh mở, qua Suối hồi tới Trùm'}
    for kind, r, i in (('A', 0, 1), ('B', 1, 2), ('C', 2, 4)):
        # ảnh giữa chừng: bản đồ nhỏ trong lúc chơi, cửa Trùm còn khóa
        c.ev("""([r, i, kind]) => {
          const S = T.start(r, i, kind, kind === 'A' ? 1 : kind === 'B' ? 1 : 3);
          T.playUntil((S) => Object.keys(S.seen).length >= 4 && S.W.cleared && !S.trans, 200);
          G.sim(20); T.freeze();
        }""", [r, i, kind])
        mid = c.grab()
        c.ev("""() => { T.thaw(); T.playUntil((S) => S.W.type === 'fountain' && Object.keys(S.seen).length >= 7 && !S.trans, 400); const S = G.getRun(); G.sim(10); S.mode = 'map'; }""")
        panels.append((mid, names[kind] + ' · giữa ải\nBản đồ nhỏ ở góc phải chỉ hiện phòng đã qua và phòng kề'))
        panels.append((c.grab(300), names[kind] + ' · bản đồ to\n' + notes[kind]))
        c.ev("() => { const S = G.getRun(); if (S) S.mode = 'play'; }")
    sheet('Bản đồ ải ba kiểu (ảnh chụp từ game)', panels, 2, 880, os.path.join(OUT, 'ban-do-nho-ba-kieu.png'), 'Chạm vào bản đồ nhỏ thì tạm dừng và hiện bản đồ to; chạm lần nữa để chơi tiếp.')


def shot_boss(c):
    panels = []
    for r, name in ((0, 'Mộc Tinh'), (1, 'Ngư Tinh'), (2, 'Hồ Tinh')):
        c.ev("""([r]) => {
          const S = T.start(r, 4, 'C', 3, { lvl: 10 + r * 8 });
          for (const o of S.map.rooms) if (o.type !== 'boss') { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; }
          S.stats.el.fire = 500; S.stats.melee = 400;
          G.gotoRoom(7); G.getRun().fade = 0;
          const W = G.getWorld();
          for (let k = 0; k < 1500; k++) { G.sim(1); const P = S.P; P.hp = Math.max(P.hp, P.maxhp * 0.7); if (k > 240 && W.zones.some((z) => z.t > 0.25 && z.t < 0.5) && !W.boss.hidden) break; }
          T.freeze();
        }""", [r])
        panels.append((c.grab(), name + ' · ' + REG[r] + '\nPhòng trùm rộng hơn, vẫn vừa một màn hình'))
    c.ev("""() => {
      const S = T.start(2, 2, 'A', 4);
      for (const o of S.map.rooms) if (o.type !== 'boss') { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; }
      G.gotoRoom(7); G.getRun().fade = 0;
      const W = G.getWorld();
      for (let k = 0; k < 1200; k++) { G.sim(1); const P = S.P; P.hp = Math.max(P.hp, P.maxhp * 0.7); if (k > 200 && W.zones.some((z) => z.t > 0.25 && z.t < 0.5)) break; }
      T.freeze();
    }""")
    panels.append((c.grab(), 'Trùm nhỏ Hổ Lửa · Lâu đài cổ\nẢi 1 đến 4 của mỗi vùng kết thúc bằng trùm nhỏ'))
    sheet('Phòng trùm và trùm nhỏ (ảnh chụp từ game)', panels, 2, 880, os.path.join(OUT, 'phong-trum.png'))


def shot_types(c):
    panels = []
    todo = (('chest', 0, 'Rương báu', 'Lại gần rồi bấm Đánh để chọn một phần thưởng'), ('fountain', 1, 'Suối hồi', 'Hồi máu hoặc mana; cho biết trùm đã học gì'),
            ('merchant', 2, 'Thương nhân', 'Bán bình máu, bùa hệ, quặng'), ('challenge', 1, 'Thử thách', 'Bệ đồng hồ cát: hạ hết quái trước khi hết giờ'),
            ('curse', 0, 'Lời nguyền', 'Bàn thờ: chịu bất lợi để dấu ấn tăng gấp đôi'), ('elite', 2, 'Tinh anh', 'Vòng lửa trên sàn, quái tinh anh mang hệ'))
    for t, r, name, sub in todo:
        c.ev("""([t, r]) => {
          const S = T.start(r, 2, 'A', 9);
          const id = S.map.rooms.find((o) => o.type === t || (G.mapgen.SIDE.includes(t) && G.mapgen.SIDE.includes(o.type))).id;
          for (const o of S.map.rooms) if (o.main && o.id < 4) { S.seen[o.id] = true; S.known[o.id] = true; S.cleared[o.id] = true; }
          G.gotoRoom(id, t); G.getRun().fade = 0;
          const P = S.P, g = S.W.geo;
          if (t === 'challenge' || t === 'elite') { T.fightUntil(t === 'elite' ? 1 : 3, t === 'elite' ? 1500 : 500); if (t === 'elite') { for (let k = 0; k < 2500 && !S.W.ents.some((e) => e.role === 'elite'); k++) { G.sim(1); P.hp = P.maxhp; } T.thaw(); T.fightUntil(1, 300); } }
          else { P.x = g.cx - 40; P.y = g.cy + 34; G.sim(30); T.freeze(); }
        }""", [t, r])
        panels.append((c.grab(), name + ' · ' + REG[r] + '\n' + sub))
    sheet('Các loại phòng (ảnh chụp từ game)', panels, 2, 880, os.path.join(OUT, 'cac-loai-phong.png'))


def main():
    want = sys.argv[1:] or ['phong', 'cua', 'bando', 'trum', 'loai']
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        c = Cam(p)
        for name, fn in (('phong', shot_rooms), ('cua', shot_doors), ('bando', shot_maps), ('trum', shot_boss), ('loai', shot_types)):
            if name in want:
                fn(c)
        if c.errs:
            print('LỖI TRANG:', c.errs[:5])
        c.close()
    sys.exit(1 if c.errs else 0)


main()
