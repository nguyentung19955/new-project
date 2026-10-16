"""Còn vẽ tay 7: ảnh soát tĩnh trước / sau (headless, KHÔNG chơi thử). Trên: bản đợt 6 (trước khi thay 5 ảnh gen lại); dưới: bản mới.
    python3 soat7.py <tệp linh-khi.html bản TRƯỚC> <thư mục ra>
Dựa trên ../../con-ve-tay-6/cong-cu/soat.py; thêm phòng thử thách, lời nguyền, trùm.
Cảnh:
  luot        Zed lướt hệ Lửa, lộn, nổ hạt (G.fx.burst): hạt nổ, khói gót
  tu-luc      Zed búa Băng giữ nút đánh rồi nện: vòng sóng, hạt nổ, khói bụi nện
  phong-bat-dau  phòng Bắt đầu Rừng già cửa mở: dấu phòng (giữ ảnh cũ), cột nắng
  phong-tinh-anh / phong-thu-thach / phong-loi-nguyen / phong-trum  dấu phòng riêng từng loại (quái bị xoá để thấy sàn)"""
import io, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game/tests'))
from PIL import Image, ImageDraw, ImageFont
from quai_lib import sync_playwright, ROOT, LIB

TRUOC = os.path.abspath(sys.argv[1]); od = sys.argv[2]; os.makedirs(od, exist_ok=True)
CANH = {
    'luot': (r"""() => {
  Math.random = G.srand(77);
  const { S, W, P } = T.room(0, 4, { seed: 7, save: { lvl: 12, branch: 'fire', marksMoi: G.MARKS[0] + 10 } });
  P.x = 200; P.y = 150; for (let k = 0; k < 30; k++) T.frame(1); window.__n = 0;
}""", r"""(n) => { const P = G.getRun().P; for (let k = 0; k < n; k++) { window.__n++; if (window.__n === 1) { P.face = 1; G.fx.dash(P, 'sword', 'fire'); } if (window.__n === 20) { P.ddx = -1; P.ddy = 0; G.fx.dodge(P); G.fx.burst(P.x + 30, P.y, '#ffd23f', 14, 60); } P.x += window.__n < 12 ? 5 : 0; T.frame(1); } }""", [2, 5, 9, 21, 24, 28]),
    'tu-luc': (r"""() => {
  Math.random = G.srand(5);
  const { S, W, P } = T.room(0, 4, { seed: 7, save: { lvl: 12, melee: 'hammer', branch: 'ice', marksMoi: G.MARKS[0] + 10 } });
  const e = G.spawnEnemy('rusher', 330, 150, {}); e.inside = true; e.hp = e.maxhp = 99999; e.spd = 0; window.__e = e;
  P.x = 280; P.y = 150; P.face = 1; for (let k = 0; k < 30; k++) T.frame(1); window.__n = 0;
}""", r"""(n) => { const P = G.getRun().P; for (let k = 0; k < n; k++) { window.__n++; const h = window.__n < 70; T.frame(1, h ? (window.__n === 1 ? { atk: true, atkP: true } : { atk: true }) : {}); P.hp = P.maxhp; window.__e.hp = 99999; } }""", [12, 30, 50, 66, 74, 84]),
    'phong-bat-dau': (r"""() => {
  Math.random = G.srand(3);
  const { S, W, P } = T.room(0, 4, { seed: 3, save: { lvl: 12 } });
  P.x = 150; P.y = 200; for (const d of W.doors || []) d.open = true; for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { for (let k = 0; k < n; k++) { T.frame(1); G.time += 0.4; } }""", [1, 6, 12, 18, 24, 30]),
    'phong-tinh-anh': (r"""() => {
  let S = null, id = -1;
  for (const seed of [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]) { Math.random = G.srand(seed); T.room(0, 4, { seed, save: { lvl: 12 } }); S = G.getRun(); id = S.map.rooms.findIndex((x) => x.type === 'elite'); if (id >= 0) break; }
  if (id < 0) throw new Error('không có phòng elite');
  G.gotoRoom(id);
  const W = G.getWorld(); W.waves = []; W.spawns = []; for (const e of W.enemies || []) { e.hp = 0; e.dead = true; } W.enemies = [];
  for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { const W = G.getWorld(); for (let k = 0; k < n; k++) { W.enemies = []; T.frame(1); } }""", [1, 20, 40]),
    'phong-thu-thach': (r"""() => {
  let S = null, id = -1;
  for (const seed of [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]) { Math.random = G.srand(seed); T.room(0, 4, { seed, save: { lvl: 12 } }); S = G.getRun(); id = S.map.rooms.findIndex((x) => x.type === 'challenge'); if (id >= 0) break; }
  if (id < 0) throw new Error('không có phòng challenge');
  G.gotoRoom(id);
  const W = G.getWorld(); W.waves = []; W.spawns = []; for (const e of W.enemies || []) { e.hp = 0; e.dead = true; } W.enemies = [];
  for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { const W = G.getWorld(); for (let k = 0; k < n; k++) { W.enemies = []; T.frame(1); } }""", [1, 20, 40]),
    'phong-loi-nguyen': (r"""() => {
  let S = null, id = -1;
  for (const seed of [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]) { Math.random = G.srand(seed); T.room(0, 4, { seed, save: { lvl: 12 } }); S = G.getRun(); id = S.map.rooms.findIndex((x) => x.type === 'curse'); if (id >= 0) break; }
  if (id < 0) throw new Error('không có phòng curse');
  G.gotoRoom(id);
  const W = G.getWorld(); W.waves = []; W.spawns = []; for (const e of W.enemies || []) { e.hp = 0; e.dead = true; } W.enemies = [];
  for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { const W = G.getWorld(); for (let k = 0; k < n; k++) { W.enemies = []; T.frame(1); } }""", [1, 20, 40]),
    'phong-trum': (r"""() => {
  let S = null, id = -1;
  for (const seed of [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]) { Math.random = G.srand(seed); T.room(0, 4, { seed, save: { lvl: 12 } }); S = G.getRun(); id = S.map.rooms.findIndex((x) => x.type === 'boss'); if (id >= 0) break; }
  if (id < 0) throw new Error('không có phòng boss');
  G.gotoRoom(id);
  const W = G.getWorld(); W.waves = []; W.spawns = []; for (const e of W.enemies || []) { e.hp = 0; e.dead = true; } W.enemies = [];
  for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { const W = G.getWorld(); for (let k = 0; k < n; k++) { W.enemies = []; T.frame(1); } }""", [1, 20, 40]),
}
# vùng cắt (ảnh 960×540) quanh chỗ cần soát
CROP = {'phong-thu-thach': (40, 0, 940, 540), 'phong-loi-nguyen': (40, 0, 940, 540), 'phong-trum': (40, 0, 940, 540), 'chu-nhan': (330, 150, 750, 400), 'luot': (250, 170, 650, 400), 'tu-luc': (380, 150, 720, 380), 'dan-quai': (300, 120, 700, 380), 'phong-bat-dau': (40, 0, 940, 540), 'phong-tinh-anh': (40, 0, 940, 540)}
CLIP = {'x': 16, 'y': 0, 'width': 960, 'height': 540}


def chay(tep, q=''):
    out, errs, kb = {}, [], {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.goto('file://' + tep + q); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js')); pg.evaluate(LIB)
        pg.wait_for_timeout(2500)
        for ten, (dung, buoc, fr) in CANH.items():
            try:
                pg.evaluate(dung); pg.wait_for_timeout(200); pg.evaluate(dung)
                ims, last = [], 0
                for f in fr:
                    pg.evaluate(buoc, f - last); last = f
                    ims.append(Image.open(io.BytesIO(pg.screenshot(clip=CLIP))).convert('RGB'))
                out[ten] = ims
            except Exception as e:
                errs.append(ten + ': ' + str(e)[:300])
        kb['loi_fx'] = pg.evaluate("() => (G.fxAnh ? G.fxAnh.loi : []).concat(G.spriteCustom ? G.spriteCustom.loi : [])")
        b.close()
    return out, errs, kb


cu, e1, k1 = chay(TRUOC)
moi, e2, k2 = chay(os.path.join(ROOT, 'dist', 'linh-khi.html'))
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception:
    font = None
for ten in CANH:
    if ten not in cu or ten not in moi: continue
    n = len(cu[ten]); cr = CROP.get(ten, (0, 0, 960, 540)); w, h = cr[2] - cr[0], cr[3] - cr[1]
    if w > 500: w, h = w // 2, h // 2
    W = Image.new('RGB', (w * n, h * 2 + 56), (16, 14, 20)); d = ImageDraw.Draw(W)
    d.text((8, 2), 'TRUOC: ban ve tay 6', fill=(255, 210, 120), font=font)
    d.text((8, h + 30), 'SAU: 5 anh gen lai (ve tay 7)', fill=(140, 240, 140), font=font)
    for i in range(n):
        W.paste(cu[ten][i].crop(cr).resize((w, h)), (i * w, 26)); W.paste(moi[ten][i].crop(cr).resize((w, h)), (i * w, h + 56))
    W.save(os.path.join(od, 'truoc-sau-' + ten + '.png'), optimize=True)
    moi[ten][0].save(os.path.join(od, ten + '-sau.png'), optimize=True)
    cu[ten][0].save(os.path.join(od, ten + '-truoc.png'), optimize=True)
print('loi cu', e1, k1)
print('loi moi', e2, k2)
