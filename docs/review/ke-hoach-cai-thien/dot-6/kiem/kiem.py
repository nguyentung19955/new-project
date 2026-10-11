"""Đợt 6 (tile vùng Rừng già): các kiểm theo brief. Chạy từ thư mục gốc repo.
  python3 docs/review/ke-hoach-cai-thien/dot-6/kiem/kiem.py congcu          thử trang Tách Phòng với tấm ảnh lưới mẫu (ĐẠT 9/9, xem lát lặp, xem cả phòng)
  python3 .../kiem.py sosanh <thư mục game TRƯỚC đợt>                        cờ tắt / thiếu tệp → so từng điểm ảnh với bản trước đợt (phải = 0)
  python3 .../kiem.py khe                                                    bộ tile một màu: dò khe hở, tile lệch chỗ
  python3 .../kiem.py phong                                                  5 phòng liên tiếp (hạt giống 1–5) + phòng trước/sau
  python3 .../kiem.py game                                                   vào game thật: 4 cỡ cửa sổ, phóng mép nối; cửa, quái đúng chỗ; lối chơi không đổi
  python3 .../kiem.py fps <thư mục game TRƯỚC đợt>                           đo khung hình/giây 10 giây, phòng Rừng 6 quái, trước và sau
Bộ tile là bộ MẪU TỰ DỰNG (kiem/tile_mau.js), chỉ nạp tạm vào trang thử, KHÔNG ghi vào game/art/custom. Dùng bản lưu thử trong trình duyệt tạm."""
import base64, functools, http.server, io, json, os, sys, threading
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
ANH = os.path.join(HERE, '..', 'anh')
TILE_JS = os.path.join(HERE, 'tile_mau.js')
os.makedirs(ANH, exist_ok=True)


def png(data_url):
    return Image.open(io.BytesIO(base64.b64decode(data_url.split(',')[1]))).convert('RGBA')


def may_chu(root):
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(H, directory=root)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, 'http://127.0.0.1:%d' % s.server_address[1]


def trang_game(b, game_dir, qs='', **kw):
    pg = b.new_page(**(kw or dict(viewport={'width': 960, 'height': 540})))
    pg.errs = []
    pg.logs = []
    pg.on('pageerror', lambda e: pg.errs.append(str(e)))
    pg.on('console', lambda m: pg.logs.append(m.text) if 'Tile' in m.text else None)
    pg.goto('file://' + game_dir + '/index.html' + qs)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(400)
    for f in ('bot.js', 'setup.js'):  # bot và bản lưu THỬ của bộ kiểm có sẵn (G.testSave, G.sim, G.gotoRoom)
        pg.add_script_tag(path=os.path.join(game_dir, 'tests', f))
    pg.add_script_tag(path=TILE_JS)
    pg.evaluate(HELP)
    return pg


HELP = r"""
window.K = {
  // nạp bộ tile mẫu vào game (canvas đưa thẳng, sẵn dùng ngay). bo: 'mau' | 'do'; bot: mã bỏ bớt (thử thiếu tệp)
  nap(bo, bot) { const t = bo === 'do' ? taoTileDo() : taoTileMau(); for (const ma in t) if (!(bot || []).includes(ma)) G.spriteCustom.add({ loai: 'linh-khi-sprite', ma, doi_tuong: 'giao-dien', net: 2, anhCanvas: t[ma] }); G.roomArt.xoaDem(); },
  go() { for (const ma of Object.keys(G.spriteCustom.gd)) if (ma.startsWith('gd-nen-rung-')) G.spriteCustom.remove(ma); G.roomArt.xoaDem(); },
  W(o) { const RA = G.roomArt, geo = RA.geo(!!o.big); return { uid: 'kiem' + JSON.stringify(o), region: o.region || 0, type: o.type || 'fight', seed: o.seed, variant: o.variant || 0, geo, doors: (o.doors || ['up', 'down', 'left', 'right']).map((dir, i) => ({ dir, open: o.mo == null ? i % 2 === 0 : !!o.mo, boss: !!o.boss, gate: !!o.boss })) }; },
  // ba lớp dựng sẵn của một phòng: nền, lớp phủ trước, tiền cảnh
  lop(o) { const r = G.roomArt.get(K.W(o)); return [r.base.toDataURL(), r.fore.toDataURL(), r.fg.toDataURL()]; },
  ghep(o) { const r = G.roomArt.get(K.W(o)), cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; const c = cv.getContext('2d'); c.drawImage(r.base, 0, 0); c.drawImage(r.fore, 0, 0); c.drawImage(r.fg, 0, 0); return cv.toDataURL(); },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
};
"""

# các phòng dùng để so trước/sau: 3 vùng, 3 kiểu sàn, vài hạt giống, phòng trùm, cửa mở/khoá, vài loại phòng
def ds_phong():
    ds = []
    for seed in (1, 2, 3, 4, 5, 77):
        for v in (0, 1, 2):
            ds.append(dict(region=0, seed=seed, variant=v))
    ds += [dict(region=0, seed=9, variant=1, big=True, type='boss', doors=['down']), dict(region=0, seed=12, variant=2, mo=True), dict(region=0, seed=13, variant=0, mo=False, boss=True),
           dict(region=0, seed=14, variant=0, type='start', doors=['up']), dict(region=0, seed=15, variant=1, type='elite', doors=['left', 'right']), dict(region=0, seed=16, variant=2, type='fountain', doors=['up', 'down'])]
    for r in (1, 2):
        for seed in (1, 2, 3):
            ds.append(dict(region=r, seed=seed, variant=seed % 3))
    return ds


def sosanh():
    truoc = os.path.abspath(sys.argv[2])
    ds = ds_phong()
    with sync_playwright() as p:
        b = p.chromium.launch()
        goc = trang_game(b, truoc)
        chuan = [goc.evaluate('(o) => K.lop(o)', o) for o in ds]
        ca = [('không có tệp tile, cờ bật (trạng thái đang đăng)', '', None), ('có đủ tệp tile, cờ G.TILE_RUNG = false', '', 'tat'), ('có đủ tệp tile, địa chỉ có ?tile=0', '?tile=0', 'url'),
              ('thiếu 1 tệp bắt buộc (tường bên), cờ bật', '', 'thieu'), ('có đủ tệp tile, cờ BẬT: chỉ soi Hang biển và Lâu đài', '', 'vungkhac')]
        tong_loi = 0
        for ten, qs, kieu in ca:
            pg = trang_game(b, GAME, qs)
            if kieu == 'tat': pg.evaluate("() => { G.TILE_RUNG = false; K.nap('mau'); }")
            if kieu == 'url': pg.evaluate("() => { K.nap('mau'); }")
            if kieu == 'thieu': pg.evaluate("() => { K.nap('mau', ['gd-nen-rung-tuong-ben']); }")
            if kieu == 'vungkhac': pg.evaluate("() => { K.nap('mau'); }")
            khac = 0; so = 0
            for o, c in zip(ds, chuan):
                if kieu == 'vungkhac' and not o.get('region'): continue
                moi = pg.evaluate('(o) => K.lop(o)', o)
                for a, m in zip(c, moi):
                    so += 1
                    if a != m:
                        d = ImageChops.difference(png(a), png(m)).convert('L').point(lambda v: 255 if v else 0)
                        n = sum(1 for v in d.getdata() if v)
                        khac += n
                        if n: print('   KHÁC', o, n, 'điểm ảnh')
            tong_loi += khac
            print('%-52s %d lớp ảnh của %d phòng: khác %d điểm ảnh   cờ=%s   lỗi JS=%s' % (ten, so, so // 3, khac, pg.evaluate('G.TILE_RUNG'), pg.errs))
            print('      dòng console:', pg.logs[:1])
            pg.close()
        print('TỔNG số điểm ảnh khác bản trước đợt:', tong_loi)
        b.close()
    return tong_loi


def khe():
    """Bộ tile một màu chói: sàn lục, tường sau đỏ, tường bên vàng, tường trước tím hồng, nền ngoài lam. Soi nền dựng sẵn (cỡ game 480×270)."""
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = trang_game(b, GAME)
        pg.evaluate("() => { G.roomArt.THEMES[0].tile.duong = 0; K.nap('do'); }")
        xau = 0
        for seed in (1, 2, 3, 4, 5):
            for big in (False, True):
                o = dict(region=0, seed=seed, variant=seed % 3, big=big, doors=[])
                im = png(pg.evaluate('(o) => G.roomArt.get(K.W(o)).base.toDataURL()', o)).convert('RGB')
                g = pg.evaluate('(o) => { const g = K.W(o).geo; return g; }', o)
                px = im.load()
                fx0, fx1, fy0, fy1, sw, fw, wh, cap = g['fx0'], g['fx1'], g['fy0'], g['fy1'], g['sw'], g['fw'], g['wh'], g['cap']
                top = fy0 - wh - cap
                loi = []
                # 1) nền ngoài: mọi điểm ngoài khung phòng phải đúng màu lam (không lộ màu nền code #0b1610)
                n = 0
                for y in range(270):
                    for x in range(480):
                        trong = fx0 - sw <= x < fx1 + sw and top <= y < fy1 + fw
                        if not trong and px[x, y] != (0x40, 0x40, 0xff): n += 1
                if n: loi.append('nền ngoài lệch %d điểm' % n)
                # 2) tường trước: đúng màu tím hồng trên cả dải (phòng không cửa)
                n = sum(1 for y in range(fy1, fy1 + fw) for x in range(fx0 - sw, fx1 + sw) if px[x, y] != (0xff, 0x40, 0xff))
                if n: loi.append('tường trước lệch %d điểm' % n)
                # 3) tường bên: đúng màu vàng (trừ phần tường trước đè lên ở dưới và nóc tường sau do backPass làm trầm)
                n = sum(1 for y in range(fy0, fy1) for x in list(range(fx0 - sw, fx0)) + list(range(fx1, fx1 + sw)) if px[x, y] != (0xff, 0xff, 0x40))
                if n: loi.append('tường bên lệch %d điểm' % n)
                # 4) tường sau (đã qua backPass, có dây leo, nấm, cột nắng vẽ đè): đỏ phải trội ở gần hết diện tích, không có điểm lam/lục của lớp khác
                t = d = 0
                for y in range(top, fy0):
                    for x in range(fx0, fx1):
                        r_, g_, b_ = px[x, y]; t += 1
                        if r_ > g_ + 25 and r_ > b_ + 25: d += 1
                if d < 0.93 * t: loi.append('tường sau chỉ %d%% đỏ' % (100 * d // t))
                dsau, tsau_t = d, t
                # 5) sàn (đã qua lightPass; đồ trang trí, nấm sáng, điểm nhấn do code vẽ đè lên): lục phải trội ở gần hết diện tích
                luc = lambda x, y: px[x, y][1] > px[x, y][0] + 20 and px[x, y][1] > px[x, y][2] + 20
                t = (fx1 - fx0) * (fy1 - fy0)
                d = sum(1 for y in range(fy0, fy1) for x in range(fx0, fx1) if luc(x, y))
                if d < 0.97 * t: loi.append('sàn chỉ %d%% lục' % (100 * d // t))
                # 6) KHE HỞ: nền ngoài (lam) được vẽ trước tiên, nên chỗ nào trong khung phòng mà tile không phủ tới sẽ lộ màu lam. Phải = 0 điểm.
                lam = sum(1 for y in range(top, fy1 + fw) for x in range(fx0 - sw, fx1 + sw) if px[x, y][2] > px[x, y][0] + 20 and px[x, y][2] > px[x, y][1] + 20)
                if lam: loi.append('lộ nền ngoài %d điểm trong khung phòng' % lam)
                # 7) tile đúng chỗ: hàng và cột sát mép sàn phải là màu sàn (hàng trên cùng có chân nấm sáng do code vẽ nên chỉ đòi 85%)
                mep = [sum(1 for x in range(fx0, fx1) if luc(x, fy0)) / (fx1 - fx0), sum(1 for x in range(fx0, fx1) if luc(x, fy1 - 1)) / (fx1 - fx0),
                       sum(1 for y in range(fy0, fy1) if luc(fx0, y)) / (fy1 - fy0), sum(1 for y in range(fy0, fy1) if luc(fx1 - 1, y)) / (fy1 - fy0)]
                if min(mep) < 0.85: loi.append('mép sàn chỉ %d%% lục' % (100 * min(mep)))
                tsau = 100 * dsau / tsau_t
                print('hạt giống %d %s: sàn %.1f%% lục · tường sau %.0f%% đỏ · lộ nền ngoài %d điểm · mép sàn tệ nhất %.0f%% → %s' % (seed, 'phòng trùm' if big else 'phòng thường', 100 * d / t, tsau, lam, 100 * min(mep), 'ĐẠT' if not loi else 'LỖI: ' + '; '.join(loi)))
                xau += len(loi)
                if seed == 1 and not big: im.resize((960, 540), Image.NEAREST).save(os.path.join(ANH, 'do-khe-ho-bo-mot-mau.png'))
        print('lỗi JS:', pg.errs, '· số lỗi dò khe:', xau)
        b.close()
    return xau


def phong():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = trang_game(b, GAME)
        # 5 phòng liên tiếp, hạt giống 1..5, kiểu sàn xoay vòng như mapgen; hàng trên: tile; hàng dưới: code cũ
        def hang(co):
            pg.evaluate("(co) => { if (co) K.nap('mau'); else K.go(); }", co)
            return [png(pg.evaluate('(o) => K.ghep(o)', dict(region=0, seed=s, variant=(s - 1) % 3))) for s in (1, 2, 3, 4, 5)]
        tile, code = hang(True), hang(False)
        X0, X1, Y0, Y1 = 58, 402, 0, 270
        w = X1 - X0
        for ten, ds in (('5-phong-tile', tile), ('5-phong-code-cu', code)):
            tam = Image.new('RGB', (w * 5 + 4 * 4, 270), (10, 10, 10))
            for i, im in enumerate(ds): tam.paste(im.convert('RGB').crop((X0, Y0, X1, Y1)), (i * (w + 4), 0))
            tam.resize((tam.width * 2, tam.height * 2), Image.NEAREST).save(os.path.join(ANH, ten + '.png'))
        # độ khác nhau từng cặp trên vùng sàn
        g = pg.evaluate('() => G.roomArt.geo(false)')
        box = (g['fx0'], g['fy0'], g['fx1'], g['fy1'])
        print('Tỉ lệ điểm ảnh sàn khác nhau giữa từng cặp phòng (tile):')
        nho = 100
        for i in range(5):
            for j in range(i + 1, 5):
                d = ImageChops.difference(tile[i].convert('RGB').crop(box), tile[j].convert('RGB').crop(box)).convert('L')
                k = 100 * sum(1 for v in d.getdata() if v) / (d.width * d.height); nho = min(nho, k)
                print('   phòng %d – phòng %d: %.1f%%' % (i + 1, j + 1, k))
        print('   cặp giống nhau nhất: khác %.1f%% số điểm ảnh sàn' % nho)
        # trước/sau một phòng 4 cửa
        a, c = code[0].convert('RGB'), tile[0].convert('RGB')
        tam = Image.new('RGB', (480 * 2 + 6, 270), (10, 10, 10)); tam.paste(a, (0, 0)); tam.paste(c, (486, 0))
        tam.resize((tam.width * 2, tam.height * 2), Image.NEAREST).save(os.path.join(ANH, 'truoc-sau-phong-4-cua.png'))
        # thiếu 2 tệp không bắt buộc (điểm nhấn, cỏ mép): vẫn lát tile, cỏ mép vẽ bằng code
        pg.evaluate("() => { K.go(); K.nap('mau', ['gd-nen-rung-san-nhan', 'gd-nen-rung-mep']); }")
        png(pg.evaluate('(o) => K.ghep(o)', dict(region=0, seed=1, variant=0))).convert('RGB').resize((960, 540), Image.NEAREST).save(os.path.join(ANH, 'thieu-diem-nhan-va-co-mep.png'))
        # thời gian dựng một phòng mới (vỏ + cửa), trung bình 12 phòng
        for ten, co in (('tile', True), ('code cũ', False)):
            pg.evaluate("(co) => { K.go(); if (co) K.nap('mau'); }", co)
            ms = pg.evaluate("() => { const t0 = performance.now(); for (let s = 100; s < 112; s++) G.roomArt.get(K.W({ region: 0, seed: s, variant: s % 3 })); return (performance.now() - t0) / 12; }")
            print('Dựng một phòng Rừng già (%s): %.1f ms' % (ten, ms))
        # dung lượng bộ tile mẫu (9 tệp .sprite.json nét gấp đôi)
        kb = pg.evaluate("() => tepTile(taoTileMau()).map((t) => [t.ma, JSON.stringify(t).length])")
        print('Dung lượng bộ tile MẪU (.sprite.json, nét gấp đôi):', sum(n for _, n in kb), 'byte =', round(sum(n for _, n in kb) / 1024, 1), 'KB', kb)
        print('lỗi JS:', pg.errs)
        b.close()


CO = {
    '960x540': dict(viewport={'width': 960, 'height': 540}),
    '844x390': dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2),
    '1280x720': dict(viewport={'width': 1280, 'height': 720}),
    '1024x768': dict(viewport={'width': 1024, 'height': 768}),
}
# Vào ải Rừng già thật bằng bản lưu thử, tới phòng đánh có nhiều cửa nhất, cho mọc 6 quái rồi đứng hình.
VAO = r"""(seed) => {
  K.rng(seed * 13 + 5); G.testSave({ lvl: 6, sharpen: 2 }); G.save.potions = 2;
  G.startStage(0, 2, 0, { kind: 'A', seed });
  const S = G.getRun(); S.fade = 0;
  const R = S.map.rooms.filter((o) => o.type === 'fight').sort((a, b) => Object.keys(b.doors).length - Object.keys(a.doors).length)[0];
  G.gotoRoom(R.id);
  const W = G.getRun().W;
  G.ROOM_WAVES.maxAlive = 6; // chỉ trong trang thử: cho đủ 6 quái cùng lúc (game thật giới hạn ít hơn ở phòng thường)
  W.waves = [['rusher', 'rusher', 'archer', 'rusher', 'shield', 'archer']]; W.waveI = -1;
  S.P.inv = 9999; G.botInput0 = G.botInput; G.botInput = null;
  for (let k = 0; k < 900 && W.ents.filter((e) => !e.dead).length < 6; k++) G.sim(1);
  G.sim(20);
  return { region: W.region, type: W.type, seed: W.seed, variant: W.variant, doors: W.doors.map((d) => d.dir + (d.open ? ':mở' : ':khoá')), quai: W.ents.filter((e) => !e.dead).length };
}"""
TT = r"""() => { const W = G.getRun().W, g = W.geo, r = (v) => Math.round(v * 100) / 100;
  return { geo: [g.fx0, g.fy0, g.fx1, g.fy1, g.sw, g.fw, g.wh, g.cap], bounds: [W.x0, W.x1, W.y0, W.y1], P: [r(W.P.x), r(W.P.y), Math.round(W.P.hp)],
    quai: W.ents.map((e) => [e.kind || e.type, r(e.x), r(e.y), Math.round(e.hp), e.dead ? 1 : 0]), props: W.props.filter((p) => p.type !== 'roomFore').map((p) => [p.type, r(p.x), r(p.y)]),
    cua: W.doors.map((d) => [d.dir, d.open ? 1 : 0, r(G.roomArt.doorPos(g, d.dir).x), r(G.roomArt.doorPos(g, d.dir).y)]), spawns: (W.spawns || []).map((s) => [r(s.x), r(s.y)]) }; }"""
DUNG = "() => { const sc = G.scene; if (!K.sc) { K.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } }"


def game():
    with sync_playwright() as p:
        b = p.chromium.launch()
        # 1) lối chơi không đổi: cùng hạt giống, cờ tắt và cờ bật (có tile) → mô phỏng 900 bước, so toạ độ mọi thứ
        kq = {}
        for ten, co in (('tile', True), ('code', False)):
            pg = trang_game(b, GAME)
            if co: pg.evaluate("() => K.nap('mau')")
            # một lệnh duy nhất (vòng lặp game thật không chen vào): vào phòng, rồi 900 bước, MỖI bước vẽ lại cả cảnh (có dựng và dán nền phòng)
            vao, kq[ten] = pg.evaluate("([vao, tt, seed]) => { G.run = () => {}; const v = eval(vao)(seed); G.botInput = G.botInput0; G.getRun().P.inv = 0; let ve = 0; for (let i = 0; i < 900; i++) { G.tick(); G.click = null; if (G.ui && G.ui.begin) G.ui.begin(); G.scene.draw(); ve++; } const t = eval(tt)(); t.ve = ve; t.phongDaDung = G.roomArt.cache.size; return [v, t]; }", [VAO, TT, 5])
            kq[ten]['vao'] = vao
            print(ten, 'phòng:', json.dumps(vao, ensure_ascii=False), '· lỗi JS:', pg.errs)
            pg.close()
        giong = json.dumps(kq['tile'], sort_keys=True) == json.dumps(kq['code'], sort_keys=True)
        print('Sau 900 bước mô phỏng, khung phòng, vùng đi được, vị trí cửa, người chơi, %d quái, %d vật thể: %s' % (len(kq['tile']['quai']), len(kq['tile']['props']), 'Y HỆT giữa tile và code' if giong else 'KHÁC NHAU'))
        print('   khung sàn', kq['tile']['geo'], '· vùng đi được', kq['tile']['bounds'], '· cửa', kq['tile']['cua'])
        # 2) ảnh 4 cỡ cửa sổ, tile bật; phóng to mép nối
        for co, kw in CO.items():
            pg = trang_game(b, GAME, **kw)
            pg.evaluate("() => K.nap('mau')")
            vao = pg.evaluate(VAO, 5)
            pg.evaluate(DUNG); pg.wait_for_timeout(400)
            f = os.path.join(ANH, 'game-tile-%s.png' % co)
            pg.screenshot(path=f)
            # ảnh phóng mép nối: cùng phòng đó nhưng tạm cất quái, em bé và chữ chỉ dẫn để không che sàn
            pg.evaluate("() => { const W = G.getRun().W; W.ents.length = 0; W.projs.length = 0; W.zones.length = 0; W.banner = null; W.P.x = W.x0 + 4; W.P.y = W.y1 - 2; }"); pg.wait_for_timeout(300)
            f2 = os.path.join(HERE, '_tam.png'); pg.screenshot(path=f2)
            m = pg.evaluate("() => { const cv = document.getElementById('game') || document.querySelector('canvas'), r = cv.getBoundingClientRect(), g = G.getRun().W.geo; return { l: r.left, t: r.top, w: r.width, h: r.height, dpr: devicePixelRatio, fx0: g.fx0, fy0: g.fy0, fx1: g.fx1, fy1: g.fy1 }; }")
            im = Image.open(f2).convert('RGB'); k = m['w'] / 480 * m['dpr']
            def cat(gx, gy, r):  # ô vuông cạnh 2r điểm ảnh game quanh (gx, gy), phóng lên 384×384 không làm mịn
                x0 = (m['l'] * m['dpr']) + (gx - r) * k; y0 = (m['t'] * m['dpr']) + (gy - r) * k
                return im.crop((round(x0), round(y0), round(x0 + 2 * r * k), round(y0 + 2 * r * k))).resize((384, 384), Image.NEAREST)
            tam = Image.new('RGB', (384 * 6 + 30, 384), (10, 10, 10))
            # 2 chỗ bốn khối 64×64 gặp nhau, rồi 4 chỗ sàn gặp tường (trái, sau, trước + cỏ mép, phải). Bốn góc phòng bị giao diện che nên soi ở bài 'khe' (nền dựng sẵn).
            diem = [(m['fx0'] + 128, m['fy0'] + 64), (m['fx0'] + 192, m['fy0'] + 128), (m['fx0'], m['fy0'] + 48), (m['fx0'] + 100, m['fy0']), (m['fx0'] + 110, m['fy1']), (m['fx1'], m['fy0'] + 120)]
            for i, (gx, gy) in enumerate(diem):
                tam.paste(cat(gx, gy, 24), (i * 390, 0))
            tam.save(os.path.join(ANH, 'phong-to-mep-noi-%s.png' % co)); os.remove(f2)
            print(co, 'tỉ lệ màn/điểm ảnh game = %.4f' % (m['w'] / 480), '(×%s điểm ảnh thật)' % m['dpr'], json.dumps(vao, ensure_ascii=False), 'lỗi JS:', pg.errs)
            if co == '960x540':
                pg.evaluate("() => { G.TILE_RUNG = false; }"); pg.wait_for_timeout(300)
                pg.screenshot(path=os.path.join(ANH, 'game-code-cu-960x540.png'))
            pg.close()
        b.close()


def fps():
    truoc = os.path.abspath(sys.argv[2])
    DO = r"""() => new Promise((ok) => { const t0 = performance.now(); let n = 0, cham = 0, tr = t0; const f = (t) => { n++; if (t - tr > 25) cham++; tr = t; if (t - t0 >= 10000) ok({ fps: +(n * 1000 / (t - t0)).toFixed(2), khung: n, khungCham: cham }); else requestAnimationFrame(f); }; requestAnimationFrame(f); })"""
    VE = "() => { const sc = G.scene, t0 = performance.now(); for (let i = 0; i < 600; i++) sc.draw(); return +((performance.now() - t0) / 600).toFixed(3); }"
    with sync_playwright() as p:
        b = p.chromium.launch()
        for ten, d, co in (('TRƯỚC đợt (code)', truoc, False), ('SAU đợt, không có tệp (code)', GAME, False), ('SAU đợt, tile bật', GAME, True)):
            pg = trang_game(b, d)
            if co: pg.evaluate("() => K.nap('mau')")
            vao = pg.evaluate(VAO, 5)
            pg.evaluate("() => { const W = G.getRun().W; setInterval(() => { for (const e of W.ents) { e.hp = e.maxhp || e.hp; } G.getRun().P.inv = 9999; }, 200); }")  # giữ đủ 6 quái sống, em bé không chết
            pg.wait_for_timeout(1500)
            r1 = pg.evaluate(DO); q = pg.evaluate("() => G.getRun().W.ents.filter((e) => !e.dead).length")
            ve = pg.evaluate(VE)
            print('%-32s %s khung/giây (%d khung trong 10 giây, %d khung chậm hơn 25 ms) · còn %d quái · một lần vẽ cả cảnh: %s ms · lỗi JS: %s' % (ten, r1['fps'], r1['khung'], r1['khungCham'], q, ve, pg.errs))
            pg.close()
        b.close()


def congcu():
    srv, url = may_chu(REPO)
    with sync_playwright() as p:
        b = p.chromium.launch()
        # dựng tấm ảnh lưới mẫu (giả ảnh ChatGPT: nền hồng tím, kẻ lưới tối)
        pg0 = b.new_page(); pg0.goto('about:blank'); pg0.add_script_tag(path=TILE_JS)
        f_anh = os.path.join(HERE, '_luoi-mau.png')
        png(pg0.evaluate('() => anhLuoiTile(taoTileMau()).toDataURL()')).save(f_anh)
        pg0.close()
        try:
            for ten, kw in (('dt390', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)), ('may1200', dict(viewport={'width': 1200, 'height': 900}))):
                pg = b.new_page(**kw); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                pg.goto(url + '/tools/tach-phong/index.html')
                i = pg.evaluate("() => LO.findIndex((l) => l.id === 'nen-rung')")
                pg.select_option('#chonLo', str(i))
                prompt = pg.evaluate("() => document.getElementById('oPrompt').value")
                if ten == 'may1200' and '--prompt' in sys.argv: print(prompt)  # in prompt của lô để chép vào PROMPT.md
                pg.set_input_files('#chonAnh', f_anh)
                pg.wait_for_function("() => !document.getElementById('buoc3').hidden")
                pg.wait_for_function("() => typeof GAME !== 'undefined' && GAME && !document.getElementById('vungXem').hidden", timeout=60000)
                pg.wait_for_timeout(600)
                kq = pg.evaluate("""() => ({ the: document.getElementById('theKq').textContent, kiem: [...document.querySelectorAll('#dsKiem li')].map((l) => (l.className === 'loi' ? '✘ ' : '') + l.textContent),
                  mon: L.ds.map((m, i) => KQ[i] ? [m.ma, KQ[i].out.w, KQ[i].out.h, KQ[i].out.N, KQ[i].out.hong, KQ[i].out.soMau] : [m.ma, null]), tt: document.getElementById('ttXem').textContent,
                  tile: !!GAME.roomArt.THEMES[0].tile, cuon: document.documentElement.scrollWidth > innerWidth + 1, tai: document.getElementById('nutTaiZip').textContent })""")
                print(ten, json.dumps(kq, ensure_ascii=False, indent=1), 'lỗi JS:', errs)
                # mép sau khi "làm liền mép": cột trái và cột phải của Sàn A phải gần như một màu (đo trước và sau khi tắt ô)
                DO_MEP = """() => L.ds.map((m, i) => { const o = KQ[i].out, w = o.w, h = o.h, p = o.px; let sx = 0, sy = 0;
                  for (let y = 0; y < h; y++) for (let c = 0; c < 3; c++) sx += Math.abs(p[(y * w) * 4 + c] - p[(y * w + w - 1) * 4 + c]);
                  for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) sy += Math.abs(p[x * 4 + c] - p[((h - 1) * w + x) * 4 + c]);
                  return [m.ma.slice(12), m.lap, +(sx / (h * 3)).toFixed(1), +(sy / (w * 3)).toFixed(1)]; })"""
                if ten == 'may1200':
                    print('Chênh màu trung bình giữa hai mép đối nhau [mảng, kiểu lặp, trái–phải, trên–dưới] (0–255), ĐANG BẬT liền mép:', pg.evaluate(DO_MEP))
                    pg.uncheck('#lienMep'); pg.wait_for_timeout(300)
                    print('   … TẮT liền mép:', pg.evaluate(DO_MEP))
                    pg.check('#lienMep'); pg.wait_for_timeout(300)
                    # tấm ảnh XẤU cố ý: Sàn A có dải sáng dọc mép phải → tắt liền mép thì công cụ phải báo CÓ LỖI, bật lại thì ĐẠT
                    pgx = b.new_page(); pgx.goto('about:blank'); pgx.add_script_tag(path=TILE_JS)
                    fx = os.path.join(HERE, '_luoi-xau.png')
                    png(pgx.evaluate("() => { const t = taoTileMau(), c = t['gd-nen-rung-san0'].getContext('2d'); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(116, 0, 12, 128); return anhLuoiTile(t).toDataURL(); }")).save(fx); pgx.close()
                    pg.set_input_files('#chonAnh', fx); pg.wait_for_timeout(700); pg.uncheck('#lienMep'); pg.wait_for_timeout(300)
                    print('Ảnh XẤU cố ý, TẮT liền mép:', pg.evaluate("() => [document.getElementById('theKq').textContent, [...document.querySelectorAll('#dsKiem li.loi')].map((l) => l.textContent)]"))
                    pg.check('#lienMep'); pg.wait_for_timeout(300)
                    print('Ảnh XẤU cố ý, BẬT liền mép:', pg.evaluate("() => [document.getElementById('theKq').textContent, KQ[0].out.mep, KQ[0].out.mepTho]"))
                    os.remove(fx); pg.set_input_files('#chonAnh', f_anh); pg.wait_for_timeout(700)
                pg.locator('#buoc3').screenshot(path=os.path.join(ANH, 'cong-cu-%s-buoc3.png' % ten))
                pg.locator('#khoiLap').screenshot(path=os.path.join(ANH, 'cong-cu-%s-lat-lap-san-a.png' % ten))
                if ten == 'may1200':
                    for buoc, ma in ((3, 'diem-nhan'), (2, 'tuong-sau'), (3, 'tuong-ben')):
                        for _ in range(buoc): pg.click('#nutLapSau')
                        pg.wait_for_timeout(150)
                        pg.locator('#khoiLap').screenshot(path=os.path.join(ANH, 'cong-cu-%s-lat-lap-%s.png' % (ten, ma)))
                pg.locator('#buoc4').scroll_into_view_if_needed(); pg.wait_for_timeout(500)
                pg.locator('#buoc4').screenshot(path=os.path.join(ANH, 'cong-cu-%s-buoc4-ca-phong.png' % ten))
                if ten == 'may1200':
                    pg.click('#nutDoiMau'); pg.wait_for_timeout(400)
                    pg.locator('#cvPhong').screenshot(path=os.path.join(ANH, 'cong-cu-phong-2.png'))
                    pg.click('#nutSoCode'); pg.wait_for_timeout(400)
                    pg.locator('#cvPhong').screenshot(path=os.path.join(ANH, 'cong-cu-phong-2-code-cu.png'))
                # lô "vẽ riêng một mảng sàn": tấm ảnh vuông 3 × 3 lần lặp (cố ý lệch 5 điểm ảnh), công cụ lấy ô giữa và dò lệch
                if ten == 'may1200':
                    pgr = b.new_page(); pgr.goto('about:blank'); pgr.add_script_tag(path=TILE_JS)
                    f3 = os.path.join(HERE, '_lap3.png'); png(pgr.evaluate("() => anhLap3(taoTileMau()['gd-nen-rung-san1'], 1024, 5).toDataURL()")).save(f3); pgr.close()
                    pg.select_option('#chonLo', str(pg.evaluate("() => LO.findIndex((l) => l.id === 'nen-rung-san1')")))
                    if '--prompt' in sys.argv: print('--- vẽ riêng ---'); print(pg.evaluate("() => LO.filter((l) => l.giua).map((l) => l.ten + '\\n' + taoPrompt(l)).join('\\n\\n')"))
                    pg.set_input_files('#chonAnh', f3); pg.wait_for_timeout(700)
                    print('Lô vẽ riêng Sàn B:', json.dumps(pg.evaluate("() => ({ the: document.getElementById('theKq').textContent, kiem: [...document.querySelectorAll('#dsKiem li')].map((l) => (l.className === 'loi' ? '✘ ' : '') + l.textContent), co: [KQ[0].out.w, KQ[0].out.h], mepTho: KQ[0].out.mepTho })"), ensure_ascii=False, indent=1))
                    pg.uncheck('#lienMep'); pg.wait_for_timeout(300)
                    print('   … tắt liền mép:', pg.evaluate("() => [document.getElementById('theKq').textContent, KQ[0].out.mep]"))
                    pg.check('#lienMep'); pg.wait_for_timeout(300)
                    pg.locator('#buoc3').screenshot(path=os.path.join(ANH, 'cong-cu-ve-rieng-san-b.png'))
                    os.remove(f3)
                # các lô cũ không đổi prompt (so với bản trước đợt nếu có tệp _prompt-cu.json)
                cu = os.path.join(HERE, '_prompt-cu.json')
                ds = pg.evaluate("() => LO.filter((l) => !l.tile).map((l) => [l.id, taoPrompt(l)])")
                if os.path.exists(cu): print('   prompt các lô cũ so với bản trước đợt:', 'Y HỆT' if json.load(open(cu, encoding='utf-8')) == ds else 'KHÁC')
                pg.close()
        finally:
            srv.shutdown(); b.close()
            if os.path.exists(f_anh): os.remove(f_anh)  # ảnh lưới mẫu chỉ dùng để thử, không để lại trong repo


if __name__ == '__main__':
    r = {'sosanh': sosanh, 'khe': khe, 'phong': phong, 'game': game, 'fps': fps, 'congcu': congcu}[sys.argv[1]]()
    sys.exit(1 if r else 0)
