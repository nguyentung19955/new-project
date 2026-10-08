# Chụp ảnh và GIF em bé tinh linh chạy trong game thật (qua trang thử thu.html, không sửa gì trong game/).
#   python3 thu.py            -> dựng mọi ảnh trong-game-*.png và trong-game-*.gif
#   python3 thu.py kiem       -> chỉ một GIF (kiem, cung, giao, bua) hoặc một ảnh (dung-chay, mac-do)
import base64, io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..'))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FM = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
if not os.path.exists(FB):
    FB = FM = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PAGE, CREAM, GOLD = (28, 25, 33), (241, 234, 217), (255, 210, 122)

# Công cụ trong trang: dựng một phòng trống, đặt người chơi, vẽ một khung, cắt vùng quanh người chơi.
PRE = r"""
() => {
  window.requestAnimationFrame = () => 0;
  G.sfx = () => {};
  const T = (window.T = {});
  const blank = () => ({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false });
  T.inp = blank();
  T.room = function (hero, melee, o) {
    o = o || {};
    const rnd = G.srand(7); Math.random = rnd; G.rnd = rnd;
    G.testSave(Object.assign({ hero, melee, lvl: 12 }, o.save || {}));
    G.startStage(o.reg == null ? 2 : o.reg, 2, 0); G.gotoRoom(3);
    const S = G.getRun(), W = S.W, P = S.P;
    W.ents.length = 0; W.waves = []; W.zones.length = 0; W.projs.length = 0; W.texts.length = 0; W.props.length = 0;
    W.banner = null; S.hint = null; S.tut = false; S.fade = 0;
    if (G.fx.reset) G.fx.reset();
    P.x = 150; P.y = 196; P.face = 1; P.inv = 0; P.mana = P.maxmana;
    G.botInput = () => { const i = T.inp; T.inp = blank(); return i; };
    T.step({});
    return true;
  };
  T.dummy = function (dx) {
    const P = G.getRun().P, e = G.spawnEnemy('shield', P.x + dx, P.y, { hpMult: 1e6 });
    e.st.stun = 1e9; e.inside = true; e.face = -1; return true;
  };
  T.step = function (i) { T.inp = Object.assign(blank(), i || {}); G.tick(); G.click = null; const P = G.getRun().P; P.hp = P.maxhp; P.mana = Math.max(P.mana, 60); };
  T.draw = function () { G.ui.begin(); G.scene.draw(); };
  // cắt vùng (x0..x0+w, y0..y0+h) tính theo điểm ảnh màn hình game, phóng k lần
  T.grab = function (x0, y0, w, h, k) {
    const cv = document.createElement('canvas'); cv.width = w * k; cv.height = h * k;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    c.drawImage(document.getElementById('world'), x0, y0, w, h, 0, 0, w * k, h * k);
    return cv.toDataURL('image/png');
  };
  T.sx = () => { const S = G.getRun(); return Math.round(S.P.x - S.W.cam); };
  // đặt trạng thái lên người chơi rồi vẽ một khung, cắt quanh người chơi
  T.still = function (set, w, h, k, ox) {
    const P = G.getRun().P;
    Object.assign(P, set || {});
    T.draw();
    return T.grab(T.sx() - (ox || Math.round(w * 0.4)), Math.round(P.y) - h + 14, w, h, k);
  };
  return true;
}
"""

def img(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGB')

def label(d, s, x, y, size=24, col=CREAM, bold=True, anchor='ma'):
    d.text((x, y), s, font=ImageFont.truetype(FB if bold else FM, size), fill=col, anchor=anchor)

def sheet(title, sub, rows, cw, ch, path, gap=54):
    """rows: [(tên hàng, [(ảnh, chú thích)])]"""
    n = max(len(r[1]) for r in rows)
    W = 40 + n * (cw + 12)
    H = 150 + sum(ch + 42 + gap for _ in rows) + 10
    im = Image.new('RGB', (W, H), PAGE); d = ImageDraw.Draw(im)
    label(d, title, 24, 22, 46, GOLD, anchor='la'); label(d, sub, 24, 84, 25, CREAM, False, 'la')
    y = 140
    for name, cells in rows:
        label(d, name, 24, y, 28, GOLD, anchor='la'); y += 42
        for i, (pic, cap) in enumerate(cells):
            x = 20 + i * (cw + 12)
            im.paste(pic, (x, y)); label(d, cap, x + cw // 2, y + ch + 8, 22, CREAM, False)
        y += ch + gap
    im.save(path); print('đã ghi', path)

NAME = {'smith': 'Thợ Rèn', 'hunter': 'Thợ Săn', 'healer': 'Thầy Lang', 'wrestler': 'Đô Vật'}
FAV = {'smith': 'sword', 'hunter': 'bow', 'healer': 'spear', 'wrestler': 'hammer'}

def room(pg, hero, wt, extra='{}'):
    pg.evaluate('([h, m, o]) => T.room(h, m, o)', [hero, 'sword' if wt == 'bow' else wt, {}])
    if extra != '{}':
        pg.evaluate('() => Object.assign(G.getRun().P, %s)' % extra)
    if wt == 'bow':
        pg.evaluate('() => { T.step({ swapP: true }); for (let i = 0; i < 40; i++) T.step({}); }')

def dung_chay(pg):
    w, h, k = 96, 76, 3
    rows = [('Đứng', []), ('Chạy', []), ('Né, trúng đòn, ra chiêu, gục', [])]
    for hero in NAME:
        room(pg, hero, FAV[hero])
        rows[0][1].append((img(pg.evaluate('([w,h,k]) => T.still({ t: 0.5 }, w, h, k)', [w, h, k])), NAME[hero]))
        rows[1][1].append((img(pg.evaluate('([w,h,k]) => T.still({ moving: true, t: 0.4 }, w, h, k)', [w, h, k])), NAME[hero]))
    for hero, st, cap in (('smith', '{ dodgeT: 0.17 }', 'Né'), ('hunter', '{ hurtT: 0.1 }', 'Trúng đòn'), ('healer', '{ castT: 0.22 }', 'Ra chiêu'), ('wrestler', '{ dead: true, deadT: 1 }', 'Gục')):
        room(pg, hero, FAV[hero])
        rows[2][1].append((img(pg.evaluate('([w,h,k]) => T.still(%s, w, h, k)' % st, [w, h, k])), cap))
    sheet('Trong game: đứng và chạy', 'Ảnh chụp từ game thật, phóng 3 lần.', rows, w * k, h * k, os.path.join(OUT, 'trong-game-dung-chay.png'))

def mac_do(pg):
    w, h, k = 66, 78, 3
    G1 = [('h_r1', 'a_r1', 'Nón lá rừng, áo vải thô'), ('h_r2', 'a_r2', 'Mũ da cá, áo da biển'), ('h_r3', 'a_r3', 'Khăn đá lửa, áo giáp đá'),
          ('h_moc', 'a_moc', 'Mũ sừng gỗ, áo vỏ cây'), ('h_ngu', 'a_ngu', 'Mũ vây cá, áo vảy'), ('h_ho', 'a_ho', 'Mũ tai cáo, áo lông trắng')]
    G2 = [("{}", 'Bộ khởi đầu'), ("{ hat: 'khan_xep', robe: 'ao_the' }", 'Khăn xếp, áo the'), ("{ hat: 'mu_rom', robe: 'giap_tre', back: 'gui_tre' }", 'Mũ rơm, giáp tre, gùi'),
          ("{ hat: 'vong_la', robe: 'ao_la' }", 'Vòng lá, áo lá'), ("{ hat: 'non_la', robe: 'ao_toi', back: 'ao_choang' }", 'Nón lá, áo tơi, áo choàng'), ("{ robe: 'kho_vat', hat: null, back: null }", 'Khố đô vật, đầu trần')]
    G3 = [("{ wing: { kind: 'chuon', level: 1 } }", 'Mầm cánh'), ("{ wing: { kind: 'chuon', level: 2 } }", 'Cánh vừa'), ("{ wing: { kind: 'chuon', level: 3 } }", 'Cánh lớn'),
          ("{ wing: { kind: 'lua', level: 3 }, back: null }", 'Cánh lửa'), ("{ wing: { kind: 'la', level: 3 }, back: null }", 'Cánh lá'), ("{ wing: { kind: 'bang', level: 3 }, back: null }", 'Cánh băng')]
    rows = [('Mũ và áo đang có trong game (tự nối sang lớp mới)', []), ('Món mới, đổi qua o.outfit', []), ('Cánh: ba cấp và ba kiểu theo hệ', [])]
    room(pg, 'healer', 'spear')
    pg.evaluate('() => { const P = G.getRun().P; P.x = 170; T.step({}); }')
    small = lambda s: s if len(s) < 22 else s
    for helm, armor, cap in G1:
        rows[0][1].append((img(pg.evaluate('([w,h,k,a,b]) => T.still({ helm: a, armor: b, outfit: null, t: 0.5 }, w, h, k)', [w, h, k, helm, armor])), cap))
    for of, cap in G2:
        rows[1][1].append((img(pg.evaluate('([w,h,k]) => T.still({ helm: null, armor: null, outfit: %s, t: 0.5 }, w, h, k)' % of, [w, h, k])), cap))
    for of, cap in G3:
        rows[2][1].append((img(pg.evaluate('([w,h,k]) => T.still({ helm: null, armor: null, outfit: %s, t: 0.5 }, w, h, k, 38)' % of, [w, h, k])), cap))
    # chú thích dài: xuống dòng
    rows = [(n, [(p, c.replace(', ', ',\n', 1) if len(c) > 16 else c) for p, c in cells]) for n, cells in rows]
    sheet('Trong game: một bé đổi đồ', 'Cùng bé Thầy Lang trong game thật, phóng 3 lần. Đổi món nào thấy món đó.', rows, w * k, h * k, os.path.join(OUT, 'trong-game-mac-do.png'), 84)

def gif(pg, name, hero, wt, title):
    room(pg, hero, wt)
    pg.evaluate('() => T.dummy(%d)' % (150 if wt == 'bow' else 34))
    frames = []
    w, h, k = 250, 100, 3
    box = pg.evaluate('() => [T.sx() - 50, Math.round(G.getRun().P.y) - 84]')
    def run(n, inp):
        for i in range(n):
            pg.evaluate('(i) => T.step(i)', inp)
            if i % 2 == 0:
                pg.evaluate('() => T.draw()')
                frames.append(img(pg.evaluate('([x,y,w,h,k]) => T.grab(x, y, w, h, k)', [box[0], box[1], w, h, k])))
    cd = {'sword': 0.36, 'bow': 0.5, 'spear': 0.44, 'hammer': 0.8}[wt]
    run(24, {})
    run(int(cd * 60 * 3) + 4, {'atk': True})
    run(20, {})
    pg.evaluate("() => T.step({ specialP: true })")
    run(50, {})
    font = ImageFont.truetype(FB, 24)
    for f in frames:
        ImageDraw.Draw(f).text((12, 8), title, font=font, fill=GOLD)
    path = os.path.join(OUT, 'trong-game-danh-%s.gif' % name)
    pal = frames[0].quantize(colors=128, method=Image.MEDIANCUT)
    q = [f.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE) for f in frames]
    q[0].save(path, save_all=True, append_images=q[1:], duration=33, loop=0, optimize=False)
    print('đã ghi', path, len(frames), 'khung', os.path.getsize(path) // 1024, 'KB')
    return frames

def main():
    want = sys.argv[1:]
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'ERR_' not in m.text else None)
        pg.goto('file://' + os.path.join(HERE, 'thu.html'))
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path=os.path.join(ROOT, 'game', 'tests', 'setup.js'))
        pg.evaluate(PRE)
        assert pg.evaluate('() => G.art.hero === G.tinhLinh.hero && typeof G.art.heroOld === "function"'), 'file mới chưa thay G.art.hero'
        jobs = {'dung-chay': lambda: dung_chay(pg), 'mac-do': lambda: mac_do(pg),
                'kiem': lambda: gif(pg, 'kiem', 'smith', 'sword', 'Thợ Rèn và kiếm sống'), 'cung': lambda: gif(pg, 'cung', 'hunter', 'bow', 'Thợ Săn và cung rồng'),
                'giao': lambda: gif(pg, 'giao', 'healer', 'spear', 'Thầy Lang và giáo sống'), 'bua': lambda: gif(pg, 'bua', 'wrestler', 'hammer', 'Đô Vật và búa chiêng')}
        for n in (want or list(jobs)):
            jobs[n]()
        b.close()
    if errs:
        print('CẢNH BÁO:', errs[:8]); sys.exit(1)

if __name__ == '__main__':
    main()
