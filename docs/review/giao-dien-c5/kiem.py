"""Làn C5 (khung co giãn 9 mảnh bằng ảnh AI): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo, sau khi đã `python3 game/build.py`:
  python3 docs/review/giao-dien-c5/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) tự dựng ảnh lưới mẫu 4×4 nền hồng tím (15 khung RỖNG giữa, mỗi góc có một ô đánh dấu trắng chấm tối) → đưa vào trang
     tools/tach-giao-dien, lô "Khung 9 mảnh" → phải ĐẠT, mọi tệp có "net": 2 và "vien";
  2) game 844×390, bốn cảnh (trùm vùng, tinh anh, hành trang, màn kết quả): bản cũ / bản mới không tệp (phải khác 0 điểm ảnh) / bản mới nạp tạm tệp mẫu;
  3) vẽ thẳng bộ khung ở nhiều cỡ, bản cũ và bản mới không tệp: phải giống nhau từng điểm ảnh;
  4) so bốn góc của khung sau khi co giãn với bốn góc của ảnh gốc: phải trùng từng điểm ảnh ở mọi cỡ;
  5) tắt cờ G.KHUNG_ANH, gỡ một phần tệp, gỡ hết tệp: phải về y như lúc chưa có tệp;
  6) ghép ảnh kiểm docs/review/giao-dien-c5/anh-kiem.png; có tham số --prompt thì ghi prompt của lô ra prompt-khung9.txt (để chép vào PROMPT.md).
Không ghi gì vào game/art/custom. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
OLD = os.path.abspath(ARGS[0]) if ARGS else None
TMP = tempfile.mkdtemp(prefix='c5-')
DT = dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2)
V = '#14182e'


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- 1) ảnh lưới mẫu: khung rỗng, góc có ô đánh dấu (hình máy tự vẽ, cố ý thô) ----------
def anh_mau(path):
    C, NEN = 256, '#FF00FF'
    im = Image.new('RGB', (C * 4, C * 4), NEN)
    d = ImageDraw.Draw(im)
    for i in range(1, 4):
        d.line([(i * C, 0), (i * C, C * 4)], fill='#201820', width=4); d.line([(0, i * C), (C * 4, i * C)], fill='#201820', width=4)

    def o(i, w, h): x0 = (i % 4) * C + (C - w) // 2; y0 = (i // 4) * C + (C - h) // 2; return x0, y0

    def hop(x0, y0, w, h, lop, t=0):  # các lớp vành lồng nhau [(dày, màu)], trong cùng là nền (rỗng)
        for day, mau in lop:
            d.rectangle([x0 + t, y0 + t, x0 + w - 1 - t, y0 + h - 1 - t], fill=mau); t += day
        d.rectangle([x0 + t, y0 + t, x0 + w - 1 - t, y0 + h - 1 - t], fill=NEN)
        return t

    def dau(cx, cy, r=7, mau='#ffffff'):  # ô đánh dấu góc: vuông trắng, chấm tối lệch về góc trên trái (để thấy nếu bị lật hay kéo méo)
        d.rectangle([cx - r, cy - r, cx + r, cy + r], fill=mau); d.rectangle([cx - r + 2, cy - r + 2, cx - 1, cy - 1], fill=V)

    def goc(x0, y0, w, h, lui, r=7, mau='#ffffff'):
        for cx, cy in ((x0 + lui, y0 + lui), (x0 + w - 1 - lui, y0 + lui), (x0 + lui, y0 + h - 1 - lui), (x0 + w - 1 - lui, y0 + h - 1 - lui)): dau(cx, cy, r, mau)

    BAC = [('#b9b1a2', '#6b655c'), ('#4aa3ff', '#1f5fae'), ('#b36bff', '#6a2fb0'), ('#ffc83d', '#a8741a')]
    S = 180
    for i, (sg, toi) in enumerate(BAC):  # ô đồ thường
        x0, y0 = o(i, S, S)
        hop(x0, y0, S, S, [(5, V), (11, '#a8752f'), (6, sg), (6, toi)])
        d.rectangle([x0 + 16, y0 + 5, x0 + S - 17, y0 + 7], fill='#f6dc92')
        goc(x0, y0, S, S, 13, 6, sg)
    for i, (sg, toi) in enumerate(BAC):  # ô đồ đang chọn: thêm vòng vàng nhạt ngoài cùng
        x0, y0 = o(4 + i, S, S)
        hop(x0, y0, S, S, [(5, '#f6dc92'), (5, V), (10, '#d9a441'), (6, sg), (6, toi)])
        goc(x0, y0, S, S, 17, 6, '#ffffff')
    for k, (i, h, dinh) in enumerate(((8, 60, '#d9a441'), (9, 45, '#8fc6ff'), (10, 45, '#f6dc92'))):  # vỏ thanh: hai thanh mảnh trên dưới, hai chụp hai đầu
        x0, y0 = o(i, S, h); ray = round(h / 6)
        d.rectangle([x0, y0, x0 + S - 1, y0 + h - 1], fill=V)
        d.rectangle([x0 + 4, y0 + 4, x0 + S - 5, y0 + h - 5], fill='#d9a441' if k == 2 else '#a8752f')
        d.rectangle([x0 + 8, y0 + 4, x0 + S - 9, y0 + 5], fill='#f6dc92')
        d.rectangle([x0 + 37, y0 + ray, x0 + S - 38, y0 + h - 1 - ray], fill=NEN)
        for cx in (x0 + 19, x0 + S - 20): dau(cx, y0 + h // 2, 6, dinh)
    for i, vanh, day, r in ((11, '#d9a441', 8, 9), (12, '#a8752f', 7, 7), (13, '#a8752f', 5, 5)):  # khung trùm vùng, trùm nhỏ, tinh anh
        x0, y0 = o(i, S, 90)
        hop(x0, y0, S, 90, [(4, V), (day, vanh), (3, V)])
        d.rectangle([x0 + 8, y0 + 4, x0 + S - 9, y0 + 5], fill='#f6dc92')
        for cx, cy in ((x0 + 14, y0 + 13), (x0 + S - 15, y0 + 13), (x0 + 14, y0 + 76), (x0 + S - 15, y0 + 76)):
            if i == 11: d.ellipse([cx - 12, cy - 11, cx + 12, cy + 11], fill='#5a3d1a', outline=V, width=2)
            dau(cx, cy, r, '#ffffff' if i != 13 else '#f6dc92')
    x0, y0 = o(14, S, S)  # thẻ
    hop(x0, y0, S, S, [(4, V), (11, '#a8752f'), (3, '#1a120a')])
    d.rectangle([x0 + 10, y0 + 4, x0 + S - 11, y0 + 6], fill='#f6dc92')
    goc(x0, y0, S, S, 12, 6, '#ffffff')
    im.save(path)


# ---------- game ----------
HELP = r"""
window.T = {
  freeze() { const sc = G.scene; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; G.tick = function () {}; },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  save(o) { G.time = 100; T.rng(5); G.testSave(Object.assign({ lvl: 12, gold: 500, branch: 'fire', marks: 40, tier: 2 }, o || {})); G.save.stars = { '0-0': 3, '0-1': 2 }; return G.save; },
  start(r, i, seed) { T.save(); G.save.potions = 2; T.rng(seed * 13 + 5); G.startStage(r, i, 0, { kind: 'A', seed }); const S = G.getRun(); S.fade = 0; return S; },
  elite() {
    const R = G.getRun(), W = R.W, P = R.P; P.inv = 9999;
    const xong = () => W.ents.some((e) => e.role === 'elite' && !e.dead && !(e.spawnT > 0));
    for (let k = 0; k < 3000 && !xong(); k++) { for (const e of W.ents) if (!e.dead && e.role !== 'elite' && !(e.spawnT > 0)) G.kill(e, {}); G.sim(2); }
    for (const e of W.ents) if (!e.dead && e.role !== 'elite') G.kill(e, {});
    G.sim(240);
    for (let i = W.ents.length - 1; i >= 0; i--) if (W.ents[i].role !== 'elite') W.ents.splice(i, 1);
    for (const e of W.ents) if (e.role === 'elite') { Object.assign(e.st, { fire: 0, poisonN: 0, poisonT: 0, iceN: 0, iceT: 0, frozen: 0, stun: 0, root: 0, last: null }); e.hp = e.maxhp * 0.7; e.x = Math.round((W.x0 + W.x1) / 2 + 40); e.y = Math.round(P.y - 10); e.act = null; e.an = { n: 'idle', t: 0, spd: 1 }; e.hitT = 0; e.flash = 0; e.face = -1; e.dirA = Math.PI; e.trait = 'no'; e.spikeUp = 0; e.wind = 0; }
    if (G.fx && G.fx.reset) G.fx.reset();
    P.hp = Math.round(P.maxhp * 0.62); P.mana = Math.round(P.maxmana * 0.4);
  },
  lang() { T.save(); const sv = G.save; sv.weapons[0].lock = true; G.newWeapon(sv, 'spear', 1).lock = true; G.newWeapon(sv, 'hammer', 0); G.newWeapon(sv, 'sword', 3); G.setScene(G.Village); G.villageApi.V.tab = 'hub'; for (let k = 0; k < 30; k++) G.tick(); G.time = 200; G.villageScene.state.t = 50; },
  // vẽ thẳng bộ khung ở tỉ lệ a (điểm thật trên một đơn vị giao diện) → chuỗi ảnh PNG
  sheet(a) {
    const cv = document.createElement('canvas'); cv.width = Math.round(480 * a); cv.height = Math.round(300 * a);
    const c = cv.getContext('2d'); c.setTransform(a, 0, 0, a, 0, 0); c.textBaseline = 'alphabetic';
    c.fillStyle = '#12292a'; c.fillRect(0, 0, 480, 120); c.fillStyle = '#3a5a44'; c.fillRect(0, 120, 480, 100); c.fillStyle = '#17363a'; c.fillRect(0, 220, 480, 80);
    const ux0 = G.ux, us0 = G.uiScale, TH = G.theme; G.ux = c; G.uiScale = a;
    try {
      for (let r = 0; r < 4; r++) { TH.slot(6 + r * 38, 6, 32, r); TH.slot(162 + r * 38, 7, 32, r, { sel: true }); TH.slot(320 + r * 26, 12, 20, r, { dim: r > 1 }); }
      [20, 21, 24, 28, 36].forEach((s, i) => { TH.slot(6 + i * 42, 48, s, i % 4); TH.slot(216 + i * 42, 49, s, (i + 1) % 4, { sel: true }); });
      TH.slot(404, 44, 70, 2);
      TH.bar(6, 126, 120, 'hp', 0.62, '62 / 100', { h: 11, size: 7.5 }); TH.bar(6, 140, 108, 'mana', 0.4, '20 / 50', { h: 8, size: 6.5 });
      TH.bar(140, 128, 104, 'xp', 0.55, null, { h: 7 }); TH.bar(140, 140, 192, 'xp', 0.8, null, { h: 7 }); TH.bar(260, 126, 60, 'hp', 1, null, { h: 9 }); TH.bar(340, 126, 130, null, 0.3, null, { h: 6, col: '#7fe060' });
      TH.bar(340, 138, 80, null, 0.5, null, { h: 4, col: '#55625e' }); G.ui.bar(340, 146, 120, 3, 0.5, '#d0482f');
      TH.bossBar(120, 154, { tier: 'big', name: 'Hổ Vằn Núi Tản', frac: 0.7, marks: [0.3, 0.6] });
      TH.bossBar(360, 156, { tier: 'mini', name: 'Cua Đá', frac: 0.45, marks: [0.3, 0.6] });
      TH.bossBar(100, 190, { tier: 'elite', name: 'Tinh anh · Nhện', sub: 'Giáp dày', frac: 0.85 });
      TH.bossBar(350, 190, { tier: 'elite', name: 'Tinh anh · Hổ Lửa Núi Tản Viên', sub: 'Hút máu', frac: 0.3 });
      TH.card(6, 226, 70, 46, {}); TH.card(82, 226, 70, 46, { sel: true }); TH.card(158, 226, 100, 62, { title: 'Phần thưởng' });
      for (let r = 0; r < 4; r++) { TH.card(266 + (r % 2) * 104, 226 + (r >> 1) * 30, 100, r < 2 ? 24 : 13, { rar: r }); if (r < 2) TH.slot(269 + (r % 2) * 104, 228, 20, r); }
    } finally { G.ux = ux0; G.uiScale = us0; }
    return cv.toDataURL('image/png');
  },
  // bốn góc của khung sau khi SC.veGd co giãn so với bốn góc của ảnh gốc (theo "vien"): số điểm ảnh khác
  goc() {
    const SC = G.spriteCustom, kq = {};
    const CO = { o: [[20, 20], [24, 24], [36, 36], [70, 70], [34, 34]], thanh: [[120, 11], [108, 8], [192, 7], [214, 11]], trum: [[226, 30], [196, 26], [150, 22], [224, 22]], the: [[152, 24], [70, 46], [100, 62]] };
    for (const ma of G.theme.MA_KHUNG) {
      const g = SC.gdSan(ma); if (!g) { kq[ma] = 'thiếu tệp'; continue; }
      const N = g.net, [t, r, b, l] = g.vien.map((v) => v * N);
      const goc0 = document.createElement('canvas'); goc0.width = g.pw; goc0.height = g.ph; const c0 = goc0.getContext('2d'); c0.drawImage(g.img, 0, 0);
      const ds = ma.indexOf('gd-o-do') === 0 ? CO.o : ma.indexOf('trum') > 0 || ma.indexOf('tinh-anh') > 0 ? CO.trum : ma === 'gd-the-thuong' ? CO.the : CO.thanh;
      let sai = 0, soCo = 0;
      for (const [w, h] of ds) {
        if (h * N < t + b || w * N < l + r) continue; // chật hơn hai góc cộng lại: game thu góc cho vừa (không so)
        soCo++;
        const cv = document.createElement('canvas'); cv.width = w * N; cv.height = h * N; const c = cv.getContext('2d'); c.setTransform(N, 0, 0, N, 0, 0);
        SC.veGd(c, g, 0, 0, w, h);
        for (const [sx, sy, dx, dy, bw, bh] of [[0, 0, 0, 0, l, t], [g.pw - r, 0, cv.width - r, 0, r, t], [0, g.ph - b, 0, cv.height - b, l, b], [g.pw - r, g.ph - b, cv.width - r, cv.height - b, r, b]]) {
          const A = c0.getImageData(sx, sy, bw, bh).data, B = c.getImageData(dx, dy, bw, bh).data;
          for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) { sai++; break; }
        }
      }
      kq[ma] = soCo + ' cỡ, góc sai: ' + sai;
    }
    return kq;
  },
};
"""
SCENES = [
    ('trum', "() => { const S = T.start(0, 4, 3); G.testGoto('boss'); const R = G.getRun(), P = R.P; P.inv = 9999; for (let k = 0; k < 900 && !R.W.boss; k++) G.sim(1); G.sim(120); P.hp = Math.round(P.maxhp * 0.62); P.mana = Math.round(P.maxmana * 0.4); if (R.W.boss) R.W.boss.hp = R.W.boss.maxhp * 0.55; if (G.fx && G.fx.reset) G.fx.reset(); T.freeze(); }"),
    ('tinh-anh', "() => { const S = T.start(0, 2, 3); G.testGoto('elite'); T.elite(); T.freeze(); }"),
    ('hanh-trang', "() => { T.lang(); G.hanhTrang.openVillage(); G.hanhTrang.tab = 'weapon'; T.freeze(); }"),
    ('ket-qua', "() => { const S = T.start(0, 1, 3); G.testGoto('boss'); const R = G.getRun(); R.P.inv = 9999; for (let k = 0; k < 900 && !R.W.boss; k++) G.sim(1); const sv = G.save; for (const [k, t] of [['spear', 1], ['hammer', 3], ['sword', 0]]) { const w = G.newWeapon(sv, k, t); S.got.push({ s: G.wName(w), w }); } G.finishStage(true); T.freeze(); }"),
]


def mo_game(b, base, errs, ten):
    pg = b.new_page(**DT)
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (ten, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (ten, m.text)) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
    pg.goto(base + '/game/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(600)
    pg.add_script_tag(url=base + '/game/tests/bot.js')
    pg.add_script_tag(url=base + '/game/tests/setup.js')
    pg.evaluate(HELP)
    return pg


def chup(pg):
    pg.wait_for_timeout(350)
    return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')


def khac(a, b):
    if a.size != b.size: return -1
    return ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0).histogram()[255]


def tu_url(u, mode='RGB'):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert(mode)


def main():
    kq = {'loi': []}
    moi = serve(REPO)
    cu = serve(OLD) if OLD else None
    m1 = os.path.join(TMP, 'luoi-mau-khung.png')
    anh_mau(m1)
    anh = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        # ----- 1) trang công cụ -----
        errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append('cong-cu: %s' % e))
        pg.on('console', lambda m: errs.append('cong-cu console: %s' % m.text) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
        pg.goto(moi + '/tools/tach-giao-dien/index.html')
        kq['thu_tu_lo'] = pg.evaluate('LO.map((l) => l.id)')
        pg.select_option('#chonLo', str(pg.evaluate("LO.findIndex((l) => l.id === 'khung9')")))
        prompt = pg.input_value('#oPrompt')
        kq['mo_ta_lo'] = pg.inner_text('#moTaLo')
        pg.set_input_files('#chonAnh', m1)
        pg.wait_for_function("document.getElementById('theKq') && /ĐẠT|CÓ LỖI/.test(document.getElementById('theKq').textContent)", timeout=30000)
        kq['cong_cu'] = pg.inner_text('#theKq')
        kq['cong_cu_kiem'] = pg.eval_on_selector_all('#dsKiem li', 'els => els.map(e => (e.className ? "[" + e.className + "] " : "") + e.textContent)')
        teps = [t for t in pg.evaluate('L.ds.map((m, i) => (KQ[i] ? jsonMon(i) : null))') if t]
        ds = [json.loads(t) for t in teps]
        kq['tep'] = ['%s %dx%d net=%s vien=%s' % (t['ma'], *tu_url(t['anh']).size, t.get('net'), t.get('vien')) for t in ds]
        kq['byte_tep'] = sum(len(t) for t in teps)
        # màu tím của ô bậc Tím có còn sau khi tách nền hồng tím không
        tim = tu_url([t for t in ds if t['ma'] == 'gd-o-do-2'][0]['anh'], 'RGBA')
        kq['o_tim: số điểm màu tím còn lại'] = (lambda q: sum(1 for i in range(0, len(q), 4) if q[i + 3] and q[i + 2] > 150 and q[i] > 80 and q[i + 1] < 130))(tim.tobytes())
        kq['o_tim: giữa ô trong suốt'] = tim.getpixel((32, 32))[3] == 0
        pg.wait_for_function("!document.getElementById('vungXem').hidden && !document.getElementById('xemLon').hidden", timeout=60000)
        pg.wait_for_timeout(1200)
        anh['xem'] = tu_url(pg.evaluate("document.getElementById('cvTT').toDataURL('image/png')"))
        pg.click('#nutSoCode'); pg.wait_for_timeout(600)
        anh['xem_code'] = tu_url(pg.evaluate("document.getElementById('cvTT').toDataURL('image/png')"))
        kq['xem_thu_khac_code'] = khac(anh['xem'], anh['xem_code'])
        pg.click('#nutSoCode')
        # đổi sang lô Hình lớn rồi quay lại: phần "màn hình thật" của lô kia phải hiện lại
        pg.select_option('#chonLo', str(pg.evaluate("LO.findIndex((l) => l.id === 'lon')"))); pg.wait_for_timeout(500)
        kq['lo_lon_sau_khi_doi'] = pg.evaluate("[document.getElementById('khCanh').hidden, document.getElementById('nutDoiMau').hidden, document.getElementById('ttLon').textContent.slice(0, 30)]")
        pg.screenshot(path=os.path.join(TMP, 'cong-cu.png'), full_page=True)
        pg.close()
        kq['loi'] += errs
        ma = [t['ma'] for t in ds]

        # ----- 2) 3) 4) 5) game -----
        errs = []
        pm = mo_game(b, moi, errs, 'moi')
        pc = mo_game(b, cu, errs, 'cu') if cu else None
        kq['ma_game_can'] = pm.evaluate('G.theme.MA_KHUNG')
        kq['ma_trung_cong_cu'] = sorted(kq['ma_game_can']) == sorted(ma)
        if pc:
            for a in (1.444, 1.758, 2.667, 3.516, 4.333):
                kq['bo_khung_cu_so_moi_a%s' % a] = khac(tu_url(pc.evaluate('(a) => T.sheet(a)', a)), tu_url(pm.evaluate('(a) => T.sheet(a)', a)))
        s0 = tu_url(pm.evaluate('T.sheet(3.516)'))
        pm.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(JSON.parse(t)); }', teps)
        pm.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=ma)
        s1 = tu_url(pm.evaluate('T.sheet(3.516)'))
        anh['bo_khong'], anh['bo_co'] = s0, s1
        kq['goc_9_manh'] = pm.evaluate('T.goc()')
        pm.evaluate('G.KHUNG_ANH = false'); kq['bo_khung: có tệp + cờ tắt so không tệp'] = khac(s0, tu_url(pm.evaluate('T.sheet(3.516)'))); pm.evaluate('delete G.KHUNG_ANH')
        pm.evaluate("for (const m of ['gd-o-do-1-chon', 'gd-o-do-3', 'gd-khung-mana', 'gd-khung-trum-nho']) G.spriteCustom.remove(m)")
        anh['bo_thieu'] = tu_url(pm.evaluate('T.sheet(3.516)'))
        pm.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', ma)
        kq['bo_khung: gỡ tệp so lúc đầu'] = khac(s0, tu_url(pm.evaluate('T.sheet(3.516)')))
        pm.close()
        if pc: pc.close()
        for ten, ma_chay in SCENES:
            pm = mo_game(b, moi, errs, 'moi-' + ten)
            pm.evaluate(ma_chay)
            k0 = chup(pm); kq[ten + ': hai lần chụp cùng trang'] = khac(k0, chup(pm))
            if cu:
                pc = mo_game(b, cu, errs, 'cu-' + ten); pc.evaluate(ma_chay)
                kq[ten + ': CŨ so MỚI không tệp (điểm ảnh khác)'] = khac(chup(pc), k0); pc.close()
            pm.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(JSON.parse(t)); }', teps)
            pm.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=ma)
            k1 = chup(pm)
            kq[ten + ': có tệp so không tệp'] = khac(k0, k1)
            pm.evaluate('G.KHUNG_ANH = false'); kq[ten + ': có tệp + cờ tắt so không tệp'] = khac(k0, chup(pm)); pm.evaluate('delete G.KHUNG_ANH')
            pm.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', ma)
            kq[ten + ': gỡ tệp so lúc đầu'] = khac(k0, chup(pm))
            anh[ten + '_khong'], anh[ten + '_co'] = k0, k1
            pm.close()
        kq['loi'] += errs
        # bản gói: mở không lỗi, có phần mới
        errs = []
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append('dist: %s' % e))
        pg.goto(moi + '/game/dist/linh-khi.html?cloud=0'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1200)
        kq['dist_so_ma_khung'] = pg.evaluate('G.theme.MA_KHUNG.length')
        pg.close(); kq['loi'] += errs
        b.close()

    if '--prompt' in sys.argv:
        with open(os.path.join(HERE, 'prompt-khung9.txt'), 'w', encoding='utf-8') as f: f.write(prompt)

    # ----- 6) ảnh kiểm: mỗi hàng = trái KHÔNG có tệp (hình vẽ code), phải CÓ tệp mẫu -----
    W, w = 1400, 696
    hang = []

    def doi(a, c, loc=Image.LANCZOS):
        k = w / a.width
        r = Image.new('RGB', (W, round(a.height * k)), '#101010')
        r.paste(a.resize((w, r.height), loc), (0, 0)); r.paste(c.resize((w, r.height), loc), (W - w, 0))
        hang.append(r)
    for ten, _ in SCENES: doi(anh[ten + '_khong'], anh[ten + '_co'])
    a, c = anh['trum_khong'], anh['trum_co']  # phóng to nửa trên màn trùm và tinh anh
    for ten in ('trum', 'tinh-anh'):
        a, c = anh[ten + '_khong'], anh[ten + '_co']
        bx = (0, 0, int(a.width * 0.72), int(a.height * 0.2)); doi(a.crop(bx), c.crop(bx), Image.NEAREST)
    doi(anh['bo_khong'], anh['bo_co'], Image.NEAREST)
    doi(anh['bo_co'], anh['bo_thieu'], Image.NEAREST)
    doi(anh['xem_code'], anh['xem'])
    a1 = Image.open(m1); a1 = a1.resize((420, 420), Image.LANCZOS)
    r = Image.new('RGB', (W, 420), '#101010'); r.paste(a1, (0, 0)); hang.append(r)
    H = sum(h.height for h in hang) + 8 * (len(hang) - 1)
    out = Image.new('RGB', (W, H), '#101010'); y = 0
    for h in hang: out.paste(h, (0, y)); y += h.height + 8
    out = out.quantize(colors=200, method=Image.MEDIANCUT, dither=Image.NONE)
    out.save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)
    for k, v in anh.items(): v.save(os.path.join(TMP, k + '.png'))
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    print('ảnh tạm:', TMP)


main()
