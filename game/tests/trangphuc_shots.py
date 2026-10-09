"""Chụp ảnh trang phục để xem bằng mắt, lưu vào docs/trang-phuc/ (cần Pillow):
  bang-co-tho-may.png, bang-may-do.png, bang-canh.png, hang-xen-trang-phuc.png  bảng trong làng
  ba-bo-vung.png       em bé mặc từng bộ của ba vùng: đứng, chạy, lộn
  ba-cap-canh.png      bốn kiểu cánh, ba cấp, lúc đứng và lúc lộn
  trong-lang.png       em bé mặc đồ đi trong làng
  tac-dung-tran.png    các tác dụng trong trận
  trong-tran.gif       một đoạn đánh nhau ngắn khi mặc đủ bộ
Chạy: python3 tests/trangphuc_shots.py"""
import base64, io, os
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'trang-phuc')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BG = (24, 34, 36)


def font(n):
    try:
        return ImageFont.truetype(FONT, n)
    except Exception:
        return ImageFont.load_default()


def img(data):
    return Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGBA')


def sheet(rows, cols, cells, cw, ch, title, rlab, clab, pad=8, lw=150):
    """cells[r][c]: ảnh; rlab: nhãn hàng; clab: nhãn cột."""
    W = lw + cols * (cw + pad) + pad
    H = 44 + 22 + rows * (ch + pad) + pad
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((pad, 10), title, fill=(246, 220, 146), font=font(18))
    for c, t in enumerate(clab):
        d.text((lw + c * (cw + pad) + pad, 46), t, fill=(200, 220, 210), font=font(13))
    for r in range(rows):
        y = 66 + r * (ch + pad) + pad
        for i, line in enumerate(rlab[r].split('\n')):
            d.text((pad, y + ch // 2 - 18 + i * 18), line, fill=(241, 230, 198) if i == 0 else (169, 194, 180), font=font(14 if i == 0 else 12))
        for c in range(cols):
            x = lw + c * (cw + pad) + pad
            d.rectangle([x - 1, y - 1, x + cw, y + ch], outline=(90, 70, 40))
            if cells[r][c] is not None:
                im.paste(cells[r][c].resize((cw, ch), Image.NEAREST), (x, y), cells[r][c].resize((cw, ch), Image.NEAREST))
    return im


LIB = r"""
(() => {
  const L = (window.L = {}), O = G.outfit;
  L.realTick = L.realTick || G.tick;
  G.tick = () => {}; // dừng vòng lặp thật: chỉ bước khi gọi L.step, để ảnh chụp đúng khung đã dựng
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  L.step = (n, o) => { for (let i = 0; i < (n || 1); i++) { inp = Object.assign({}, o || {}); if (i > 0) for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP']) delete inp[q]; L.realTick(); } inp = {}; };
  L.draw = () => { G.ui.begin(); G.scene.draw(); };
  L.wear = (list) => { for (const q of list) O.wear(G.save, O.add(G.save, q[0], q[1], { lv: q[2] || 1 })); };
  L.SETS = { rung: ['mu_sung', 'ao_vo_cay', 'gui_tre', 'bua_nanh', 'canh_la'], bien: ['mu_vay_ca', 'ao_vay', 'khan_bang', 'bua_oc', 'canh_bang'], lau: ['mu_tai_cao', 'ao_long', 'trong_nho', 'bua_lua', 'canh_lua'] };
  // Một ô hình: em bé (key) mặc look, động tác o, trên nền sàn; trả về ảnh PNG phóng z lần.
  L.kid = (key, look, o, w, h, z, bg) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    c.fillStyle = bg || '#2b3a2e'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, h - 16, w, 16);
    G.art.hero(c, Object.assign({ x: Math.round(w / 2) + 5, y: h - 9, face: 1, key, atk: -1, dodge: -1, weapon: null, outfit: look, roundShadow: true }, o));
    const big = document.createElement('canvas'); big.width = w * z; big.height = h * z;
    const b = big.getContext('2d'); b.imageSmoothingEnabled = false; b.drawImage(cv, 0, 0, w * z, h * z);
    return big.toDataURL('image/png');
  };
  L.look = (list) => { G.testSave({ lvl: 12 }); L.wear(list); return O.look(G.save); };
  // Phòng thử trong ải r: em bé ở giữa, vài con quái đứng yên.
  L.room = (r, list, dummies) => {
    G.testSave({ hero: 'smith', lvl: 14, tier: 2, melee: 'sword', branch: ['poison', 'ice', 'fire'][r], marks: 140 });
    L.wear(list || []);
    G.startStage(r, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.props = []; W.banner = null; S.hint = null;
    L.step(8);
    W.banner = null;
    P.x = 150; P.y = 196; P.face = 1; P.inv = 0; P.mana = P.maxmana;
    for (const d of dummies || []) { const e = G.spawnEnemy(d[2] || 'rusher', d[0], d[1], { hpMult: d[3] || 400 }); e.st.stun = d[4] == null ? 1e9 : d[4]; e.inside = true; e.face = -1; }
    W.cam = 0; L.step(2);
    L.W = W; L.P = P; L.S = S;
    return true;
  };
  L.rect = () => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, r.width / 480]; };
  return true;
})()
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        ev = pg.evaluate
        ev(LIB)

        def shot(name, clip=None):
            pg.wait_for_timeout(120)
            pg.screenshot(path=os.path.join(OUT, name), clip=clip)

        # ---- bảng Cô Thợ May, Bà Hàng Xén
        ev("""() => { G.testSave({ lvl: 14 }); const sv = G.save; sv.gold = 2400; sv.mats = [24, 18, 12]; sv.shards = [3, 4, 1]; sv.stones = 2;
          L.wear([['mu_vay_ca', 2], ['ao_vay', 3], ['khan_bang', 1], ['bua_oc', 2], ['canh_bang', 3, 2]]);
          for (const q of [['giap_da', 2], ['gui_tre', 3], ['mu_rom', 0], ['canh_chuon', 0, 1], ['bua_hut', 1], ['ao_vo_cay', 0], ['khan_lua', 1]]) G.outfit.add(sv, q[0], q[1], { lv: q[2] || 1 });
          G.setScene(G.Village); G.villageScene.goNpc('may', true); const V = G.villageApi.V; V.otab = 'wear'; V.sel = sv.outfit.wear.robe; V.pv = 'dung';
          L.step(30); L.draw(); }""")
        shot('bang-co-tho-may.png')
        ev("() => { const V = G.villageApi.V; V.otab = 'craft'; V.page = 1; V.sel = 'khan_bang'; V.pv = 'chay'; L.step(9); L.draw(); }")
        shot('bang-may-do.png')
        ev("() => { const V = G.villageApi.V; V.otab = 'wing'; V.sel = G.save.outfit.wear.wing; V.pv = 'lon'; G.time = 0.3; L.draw(); }")
        shot('bang-canh.png')
        ev("() => { G.villageApi.goHub(); G.villageScene.goNpc('xen', true); G.villageApi.V.gtab = 'outfit'; L.step(5); L.draw(); }")
        shot('hang-xen-trang-phuc.png')
        ev("() => { G.villageApi.V.gtab = 'weapon'; G.villageApi.goHub(); const S = G.villageScene.state; S.x = 470; S.y = 176; S.cam = 230; S.path = null; L.step(4); L.draw(); }")
        shot('trong-lang.png')

        # ---- ba bộ của ba vùng: đứng, chạy, lộn
        poses = [('Đứng', {'t': 0.0}), ('Đứng (vỗ cánh)', {'t': 0.31}), ('Chạy', {'move': True, 't': 0.1}), ('Chạy', {'move': True, 't': 0.4}),
                 ('Lộn', {'dodge': 0.25, 't': 0.3}), ('Lộn', {'dodge': 0.6, 't': 0.3})]
        names = [('rung', 'Bộ Rừng Già\nĐộc · bậc Tím', 'thuong', '#2b3a2e'), ('bien', 'Bộ Hang Biển\nBăng · bậc Vàng', 'healer', '#24344a'), ('lau', 'Bộ Lâu Đài\nLửa · bậc Vàng', 'wrestler', '#3e2a24')]
        cells = []
        for k, lab, hero, bg in names:
            row = []
            for _, o in poses:
                key = 'smith' if hero == 'thuong' else hero
                rar = 2 if k == 'rung' else 3
                data = ev("([k, rar, key, o, bg]) => { const lk = L.look(L.SETS[k].map((x, i) => [x, rar, 3])); return L.kid(key, lk, o, 62, 56, 4, bg); }", [k, rar, key, o, bg])
                row.append(img(data))
            cells.append(row)
        sheet(3, 6, cells, 248, 224, 'Em bé mặc từng bộ của ba vùng (đủ 5 món, cánh lớn): vầng sáng đủ bộ, ánh viền theo bậc, hạt theo hệ',
              [n[1] for n in names], [q[0] for q in poses]).save(os.path.join(OUT, 'ba-bo-vung.png'))

        # ---- ba cấp cánh
        kinds = [('canh_chuon', 'Cánh chuồn chuồn\nkhông hệ'), ('canh_la', 'Cánh lá\nĐộc'), ('canh_bang', 'Cánh băng\nBăng'), ('canh_lua', 'Cánh lửa\nLửa')]
        cols = [('Mầm cánh · đứng', 1, {'t': 0.31}), ('Mầm cánh · lộn', 1, {'dodge': 0.4, 't': 0.2}), ('Cánh nhỏ · đứng', 2, {'t': 0.31}), ('Cánh nhỏ · lộn', 2, {'dodge': 0.4, 't': 0.2}),
                ('Cánh lớn · đứng', 3, {'t': 0.31}), ('Cánh lớn · lộn', 3, {'dodge': 0.4, 't': 0.2})]
        cells = []
        for k, _ in kinds:
            row = []
            for _, lv, o in cols:
                row.append(img(ev("([k, lv, o]) => L.kid('smith', L.look([[k, 1, lv]]), o, 62, 56, 4, '#22303a')", [k, lv, o])))
            cells.append(row)
        sheet(4, 6, cells, 248, 224, 'Ba cấp cánh: mầm cánh, cánh nhỏ, cánh lớn (vỗ khi đứng và khi lộn; không bay, không nhảy)',
              [k[1] for k in kinds], [c[0] for c in cols]).save(os.path.join(OUT, 'ba-cap-canh.png'))

        # ---- tác dụng trong trận (chụp thật cả lớp giao diện để thấy chữ và số)
        def grab(label):
            r = ev("() => { L.draw(); return L.rect(); }")
            pg.wait_for_timeout(60)
            x0, y0 = r[0] + (80 - 0) * r[2], r[1] + (110) * r[2]
            data = pg.screenshot(clip={'x': x0, 'y': y0, 'width': 230 * r[2], 'height': 120 * r[2]})
            return (label, Image.open(io.BytesIO(data)).convert('RGBA'))
        shots = []
        ev("() => L.room(2, [['giap_da', 2]], [[300, 180, 'rusher', 400, 0]])")
        ev("() => { L.step(1, { dodgeP: true, mx: 1 }); L.step(14, { mx: 1 }); L.step(2); }")
        shots.append(grab('Áo giáp đá (Tím, Lửa): lộn để lại vệt cháy'))
        ev("() => { L.room(0, [['gui_tre', 3]], [[250, 196], [270, 186]]); L.step(150); }")
        shots.append(grab('Gùi tre độc (Vàng): rải vũng độc mỗi 4 giây'))
        ev("() => { L.room(1, [['mu_vay_ca', 2]], [[178, 192, 'rusher', 400, 0]]); const e = L.W.ents[0]; L.P.inv = 0; G.hurtPlayer(6, null, e, true); L.step(10); }")
        shots.append(grab('Mũ vây cá (Tím, Băng): quái đánh trúng bé bị chậm'))
        ev("() => { L.room(2, [['bua_lua', 3]], [[180, 196, 'rusher', 1], [196, 188], [194, 204]]); const e = L.W.ents[0]; e.hp = 1; G.damage(e, 99, {}); L.step(6); }")
        shots.append(grab('Bùa đá lửa (Vàng): quái gục nổ, đốt quái bên cạnh'))
        ev("() => { L.room(1, [['canh_bang', 3, 2]], [[250, 196]]); L.step(1, { dodgeP: true, mx: 1 }); L.step(17, { mx: 1 }); L.P.inv = 0; G.hurtPlayer(8, null, null, false); L.step(4); }")
        shots.append(grab('Cánh nhỏ: lộn xa hơn, khiên sau khi lộn chặn đòn'))
        ev("() => { L.room(2, L.SETS.lau.map((k) => [k, 3, 3]), [[196, 196], [206, 186]]); L.step(1, { atkP: true, atk: true }); L.step(12, { atk: true }); }")
        shots.append(grab('Đủ bộ Lâu Đài (Vàng): +18% sát thương Lửa, vầng sáng'))
        cw, ch = shots[0][1].size
        W2, H2 = 2 * (cw + 12) + 12, 3 * (ch + 34) + 50
        im = Image.new('RGB', (W2, H2), BG)
        d = ImageDraw.Draw(im)
        d.text((12, 12), 'Tác dụng đặc biệt của trang phục trong trận (món Tím, Vàng; cánh cấp 2)', fill=(246, 220, 146), font=font(18))
        for i, (lab, s) in enumerate(shots):
            x, y = 12 + (i % 2) * (cw + 12), 46 + (i // 2) * (ch + 34)
            d.text((x, y), lab, fill=(241, 230, 198), font=font(14))
            im.paste(s, (x, y + 22))
        im.save(os.path.join(OUT, 'tac-dung-tran.png'))

        # ---- GIF: mặc đủ bộ Lâu Đài, chạy, lộn, đánh
        ev("() => L.room(2, L.SETS.lau.map((k) => [k, 3, 3]), [[300, 190, 'rusher', 50, 0], [330, 200, 'rusher', 50, 0], [280, 210, 'rusher', 50, 0]])")
        seq = [({'mx': 1}, 14), ({'dodgeP': True, 'mx': 1}, 1), ({'mx': 1}, 16), ({'atk': True, 'atkP': True}, 24), ({'dodgeP': True, 'mx': -1}, 1), ({'mx': -1}, 16), ({}, 10),
               ({'dodgeP': True, 'mx': 1, 'my': -0.5}, 1), ({'mx': 1}, 18), ({'atk': True, 'atkP': True}, 26), ({}, 12)]
        frames = []
        r = ev("() => L.rect()")
        n = 0
        for o, k in seq:
            for i in range(k):
                ev("o => L.step(1, o)", o if i == 0 else {q: v for q, v in o.items() if not q.endswith('P')})
                n += 1
                if n % 3 == 0:
                    ev("() => L.draw()")
                    data = pg.screenshot(clip={'x': r[0] + 40 * r[2], 'y': r[1] + 80 * r[2], 'width': 380 * r[2], 'height': 180 * r[2]})
                    frames.append(Image.open(io.BytesIO(data)).convert('RGB').resize((570, 270), Image.LANCZOS))
        pal = [f.quantize(colors=96, method=Image.MEDIANCUT) for f in frames]
        path = os.path.join(OUT, 'trong-tran.gif')
        pal[0].save(path, save_all=True, append_images=pal[1:], duration=50, loop=0, optimize=True)
        print('GIF', len(frames), 'khung,', round(os.path.getsize(path) / 1e6, 2), 'MB')
        ev("() => { G.tick = L.realTick; G.botInput = null; }")
        b.close()
    print('xong, lỗi trang:', errs[:3])


main()
