"""Còn vẽ tay 6: ảnh soát tĩnh trước / sau (headless, KHÔNG chơi thử). Trên: ?vecode=1 (hình code cũ); dưới: bản mới (chặn code + ảnh gen).
    python3 soat.py <thư mục ra>
Cảnh (bản một tệp game/dist/linh-khi.html, dựng bằng tests/quai_lib.py LIB):
  chu-nhan    Rừng già 5 phòng Bắt đầu, Zed kiếm Mầm hệ Độc chém Bọ Hung (như anh-chu-nhan.png của vẽ tay 5)
  luot        Zed lướt (G.fx.dash) hệ Lửa và lộn (G.fx.dodge), khói gót
  tu-luc      Zed búa Băng giữ nút đánh (vạch / vòng lấy đà), rồi nện (vòng sóng, hạt nổ)
  dan-quai    quái bắn (archer, bomber) bắn về phía Zed: quầng đạn
  phong-bat-dau  phòng Bắt đầu Rừng già cửa mở: dấu phòng, mũi tên cửa, đom đóm, lá rơi, cột nắng (nếu phòng có)
  phong-tinh-anh  phòng tinh anh (dấu phòng dùng tạm, nhuộm cam)"""
import io, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game/tests'))
from PIL import Image, ImageDraw, ImageFont
from quai_lib import sync_playwright, ROOT, LIB

od = sys.argv[1]; os.makedirs(od, exist_ok=True)
CANH = {
    'chu-nhan': (r"""() => {
  Math.random = G.srand(4242);
  const { S, W, P } = T.room(0, 4, { seed: 7, save: { lvl: 12, branch: 'poison', marksMoi: G.MARKS[0] + 10 } });
  const e = G.spawnEnemy('shield', 250, 140, { art: 'boHung' }); e.inside = true; e.hp = e.maxhp = 99999;
  P.x = 290; P.y = 150; for (let k = 0; k < 60; k++) T.frame(1); window.__e = e;
}""", r"""(n) => { const P = G.getRun().P; for (let k = 0; k < n; k++) { T.frame(1, { atk: true, atkP: true }); P.hp = P.maxhp; window.__e.hp = 99999; } }""", [6, 14, 22, 30, 38, 46]),
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
    'dan-quai': (r"""() => {
  Math.random = G.srand(9);
  const { S, W, P } = T.room(1, 4, { seed: 9, save: { lvl: 12, branch: 'ice', marksMoi: G.MARKS[0] + 10 } });
  P.x = 280; P.y = 150; for (let k = 0; k < 20; k++) T.frame(1); window.__n = 0;
}""", r"""(n) => { const W = G.getWorld(), P = G.getRun().P; for (let k = 0; k < n; k++) { window.__n++;
  if (window.__n % 12 === 1) { // đạn quái bắn về phía Zed (đặt thẳng vào W.projs: soát hình, không đổi luật)
    const K = ['bubble', 'ember', 'orb', 'thorn', 'fruit', 'icespike'];
    for (let i = 0; i < 3; i++) { const a = window.__n * 0.7 + i * 2.1, x = P.x + Math.cos(a) * 130, y = P.y + Math.sin(a) * 70, d = Math.hypot(P.x - x, P.y - y);
      W.projs.push({ team: 'enemy', kind: K[(window.__n + i) % 6], x, y, vx: (P.x - x) / d * 120, vy: (P.y - y) / d * 120, t: 1.2, dmg: 0, el: i === 1 ? 'fire' : i === 2 ? 'ice' : null, col: '#ff9a6a' }); }
    W.projs.push({ team: 'player', kind: 'arrow', x: P.x, y: P.y, vx: 260, vy: -40, t: 0.8, w: G.curW(P), mult: 0, pierce: 9, big: false, col: '#ffffff', seen: [] }); }
  T.frame(1); P.hp = P.maxhp; P.dead = false; W.over = null; } }""", [8, 16, 24, 32, 40, 48]),
    'phong-bat-dau': (r"""() => {
  Math.random = G.srand(3);
  const { S, W, P } = T.room(0, 4, { seed: 3, save: { lvl: 12 } });
  P.x = 150; P.y = 200; for (const d of W.doors || []) d.open = true; for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { for (let k = 0; k < n; k++) { T.frame(1); G.time += 0.4; } }""", [1, 6, 12, 18, 24, 30]),
    'phong-tinh-anh': (r"""() => {
  Math.random = G.srand(3);
  T.room(0, 4, { seed: 3, save: { lvl: 12 } });
  const S = G.getRun(); const id = S.map.rooms.findIndex((x) => x.type === 'elite'); if (id >= 0) G.gotoRoom(id);
  const W = G.getWorld(); W.waves = []; W.spawns = []; for (const e of W.enemies || []) e.hp = 0;
  for (let k = 0; k < 10; k++) T.frame(1);
}""", r"""(n) => { for (let k = 0; k < n; k++) T.frame(1); }""", [1, 20, 40, 60, 80, 100]),
}
# vùng cắt (ảnh 960×540) quanh chỗ cần soát
CROP = {'chu-nhan': (330, 150, 750, 400), 'luot': (250, 170, 650, 400), 'tu-luc': (380, 150, 720, 380), 'dan-quai': (300, 120, 700, 380), 'phong-bat-dau': (40, 0, 940, 540), 'phong-tinh-anh': (40, 0, 940, 540)}
CLIP = {'x': 16, 'y': 0, 'width': 960, 'height': 540}


def chay(q):
    out, errs, kb = {}, [], {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 992, 'height': 540})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.goto('file://' + ROOT + '/dist/linh-khi.html' + q); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(300)
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


cu, e1, k1 = chay('?vecode=1')
moi, e2, k2 = chay('')
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception:
    font = None
for ten in CANH:
    if ten not in cu or ten not in moi: continue
    n = len(cu[ten]); cr = CROP.get(ten, (0, 0, 960, 540)); w, h = cr[2] - cr[0], cr[3] - cr[1]
    if w > 500: w, h = w // 2, h // 2
    W = Image.new('RGB', (w * n, h * 2 + 56), (16, 14, 20)); d = ImageDraw.Draw(W)
    d.text((8, 2), 'TRUOC: ?vecode=1 (hinh code cu)', fill=(255, 210, 120), font=font)
    d.text((8, h + 30), 'SAU: chan hinh code + anh gen (ve tay 6)', fill=(140, 240, 140), font=font)
    for i in range(n):
        W.paste(cu[ten][i].crop(cr).resize((w, h)), (i * w, 26)); W.paste(moi[ten][i].crop(cr).resize((w, h)), (i * w, h + 56))
    W.save(os.path.join(od, 'truoc-sau-' + ten + '.png'), optimize=True)
    moi[ten][0].save(os.path.join(od, ten + '-sau.png'), optimize=True)
    cu[ten][0].save(os.path.join(od, ten + '-truoc.png'), optimize=True)
print('loi cu', e1, k1)
print('loi moi', e2, k2)
