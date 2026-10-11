"""Phiên C1 (ảnh AI cho biểu tượng nút điều khiển): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo:
  python3 docs/review/giao-dien-c1/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) tự dựng ảnh lưới mẫu 5×4 (18 biểu tượng, nền hồng tím) → đưa vào trang tools/tach-giao-dien → phải ĐẠT, tệp có "net": 2;
  2) chụp game ở 844×390 và 1280×720, phòng thường và phòng trùm: bản cũ / bản mới không có tệp (phải khác 0 điểm ảnh) / bản mới nạp tạm tệp mẫu;
  3) vẽ thẳng bộ nút ở nhiều cỡ, bản cũ và bản mới không tệp: phải giống nhau từng điểm ảnh;
  4) ghép ảnh kiểm docs/review/giao-dien-c1/anh-kiem.png.
Không ghi gì vào game/art/custom. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OLD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
TMP = tempfile.mkdtemp(prefix='c1-')
SIZES = {
    'dt844': dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2),
    'may1280': dict(viewport={'width': 1280, 'height': 720}, device_scale_factor=1),
}


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Im, directory=root)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- 1) ảnh lưới mẫu ----------
def anh_mau(path):
    C, cot, hang = 200, 5, 4
    im = Image.new('RGB', (C * cot, C * hang), '#FF00FF')
    d = ImageDraw.Draw(im)
    for i in range(1, cot): d.line([(i * C, 0), (i * C, C * hang)], fill='#201820', width=2)
    for j in range(1, hang): d.line([(0, j * C), (C * cot, j * C)], fill='#201820', width=2)
    V = '#14182e'
    thep, thep2, vang, go = '#cecdda', '#5c5b73', '#f4bf4d', '#79451d'

    def o(i): return ((i % cot) * C, (i // cot) * C)

    def kiem(i, mau):  # thanh chéo, mũi lên phải
        x, y = o(i); d.line([(x + 50, y + 150), (x + 150, y + 50)], fill=V, width=34); d.line([(x + 50, y + 150), (x + 150, y + 50)], fill=mau, width=22)
        d.line([(x + 58, y + 110), (x + 92, y + 144)], fill=V, width=22); d.line([(x + 60, y + 112), (x + 90, y + 142)], fill=vang, width=12)
    def cung(i, mau):
        x, y = o(i); d.arc([x + 30, y + 35, x + 150, y + 165], -70, 70, fill=V, width=24); d.arc([x + 34, y + 39, x + 146, y + 161], -68, 68, fill=mau, width=14)
        d.line([(x + 40, y + 100), (x + 165, y + 100)], fill=V, width=14); d.line([(x + 42, y + 100), (x + 160, y + 100)], fill=thep, width=6)
    def giao(i, mau):
        x, y = o(i); d.line([(x + 40, y + 160), (x + 160, y + 40)], fill=V, width=18); d.line([(x + 40, y + 160), (x + 160, y + 40)], fill=go, width=8)
        d.polygon([(x + 165, y + 35), (x + 120, y + 50), (x + 150, y + 80)], fill=mau, outline=V)
    def bua(i, mau):
        x, y = o(i); d.line([(x + 50, y + 160), (x + 120, y + 80)], fill=V, width=20); d.line([(x + 50, y + 160), (x + 120, y + 80)], fill=go, width=10)
        d.rectangle([x + 80, y + 35, x + 165, y + 95], fill=mau, outline=V, width=6)
    VK = [kiem, cung, giao, bua]
    for k in range(4): VK[k](k, thep)                                   # Đánh
    for k in range(4):                                                   # Đặc biệt: cùng hình + ngôi sao vàng
        VK[k](4 + k, '#f6e6b8'); x, y = o(4 + k); d.ellipse([x + 30, y + 30, x + 75, y + 75], fill=vang, outline=V, width=5)
    for k, mau in enumerate(['#c43b37', '#506f2a', '#3d69cd', '#7763ac']):  # Kỹ năng: ô vuông màu áo
        x, y = o(8 + k); d.rounded_rectangle([x + 45, y + 45, x + 155, y + 155], 18, fill=mau, outline=V, width=8); d.ellipse([x + 80, y + 80, x + 120, y + 120], fill='#efe2d1')
    for k, (a, b) in enumerate([('#fe7d04', '#feec86'), ('#5aca02', '#fbfed0'), ('#32b0e9', '#eefffc')]):  # Chưởng: quả cầu bay sang phải
        x, y = o(12 + k); d.polygon([(x + 30, y + 100), (x + 110, y + 60), (x + 110, y + 140)], fill=a, outline=V)
        d.ellipse([x + 80, y + 50, x + 170, y + 140 + 10], fill=a, outline=V, width=8); d.ellipse([x + 110, y + 80, x + 145, y + 115], fill=b)
    x, y = o(15)                                                          # Né: mũi tên sang PHẢI + 3 vệt gió
    d.polygon([(x + 170, y + 100), (x + 100, y + 40), (x + 100, y + 78), (x + 60, y + 78), (x + 60, y + 122), (x + 100, y + 122), (x + 100, y + 160)], fill=vang, outline=V)
    d.line([(x + 170, y + 100), (x + 100, y + 40), (x + 100, y + 78), (x + 60, y + 78), (x + 60, y + 122), (x + 100, y + 122), (x + 100, y + 160), (x + 170, y + 100)], fill=V, width=7)
    for yy in (70, 100, 130): d.line([(x + 25, y + yy), (x + 48, y + yy)], fill='#efe2d1', width=10)
    x, y = o(16)                                                          # Bình máu
    d.ellipse([x + 50, y + 75, x + 150, y + 170], fill='#c43b37', outline=V, width=8); d.rectangle([x + 85, y + 40, x + 115, y + 85], fill='#cedaea', outline=V, width=6); d.ellipse([x + 70, y + 95, x + 95, y + 120], fill='#f66c52')
    x, y = o(17)                                                          # Tạm dừng
    for xx in (55, 115): d.rectangle([x + xx, y + 45, x + xx + 32, y + 155], fill='#efe2d1', outline=V, width=7)
    im.save(path)


# ---------- game ----------
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } G.tick = function () {}; },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed) {
    G.time = 100; // đồng hồ game về cùng một mốc để hai trang (cũ, mới) vẽ cùng một khung hình
    T.rng(seed * 13 + 5); G.testSave({ lvl: 1 + r * 7 + i * 3, sharpen: i * 2 }); G.save.potions = 2;
    G.startStage(r, i, 0, { kind: 'A', seed }); const S = G.getRun(); S.fade = 0; return S;
  },
  // vẽ thẳng bộ nút ở tỉ lệ a (điểm thật trên một đơn vị giao diện) → chuỗi ảnh PNG
  sheet(a) {
    const cv = document.createElement('canvas'); cv.width = Math.round(480 * a); cv.height = Math.round(300 * a);
    const c = cv.getContext('2d'); c.setTransform(a, 0, 0, a, 0, 0); c.fillStyle = '#2c4a36'; c.fillRect(0, 0, 480, 300);
    const B = G.btnArt, VK = ['sword', 'bow', 'spear', 'hammer'], HE = [null, 'fire', 'poison', 'ice'], t = 3.21; let n = 0;
    const id = () => 'kiem' + a + '-' + (n++);
    VK.forEach((k, i) => HE.forEach((e, j) => B.draw(c, 'atk', 32 + i * 60 + (j % 2) * 0, 34 + j * 0, 27, { weapon: { type: k, branch: e, stage: 2 }, t, id: id(), ready: -9 })));
    VK.forEach((k, i) => HE.forEach((e, j) => B.draw(c, 'atk', 30 + (i * 4 + j) * 29, 30, 13, { weapon: { type: k, branch: e, stage: 1 + (j % 3) }, t, id: id(), ready: -9 })));
    VK.forEach((k, i) => HE.forEach((e, j) => B.draw(c, 'atk', 34 + (i * 4 + j) * 29, 82, 27 - j, { weapon: { type: k, branch: e, stage: 3 }, pressed: j === 1, t, id: id(), ready: -9 })));
    VK.forEach((k, i) => B.draw(c, 'special', 24 + i * 42, 140, 18, { weapon: { type: k, branch: HE[i] }, cost: 20, disabled: i === 3, cd: i === 2 ? 0.5 : 0, cdSec: i === 2 ? 3 : 0, t, id: id(), ready: -9 }));
    ['fire', 'poison', 'ice'].forEach((e, i) => B.draw(c, 'chuong', 200 + i * 42, 140, 17, { el: e, cost: 30, t, id: id(), ready: -9 }));
    ['smith', 'hunter', 'healer', 'wrestler'].forEach((h, i) => B.draw(c, 'skill', 330 + i * 38, 140, 17, { hero: h, cost: 30, t, id: id(), ready: -9 }));
    for (let i = 0; i < 16; i++) B.draw(c, 'dodge', 24 + i * 29, 192, i % 2 ? 17 : 18, { dir: (i / 16) * Math.PI * 2, t, id: id(), ready: -9 });
    B.draw(c, 'dodge', 24, 240, 18, { t, id: id(), ready: -9 });
    B.draw(c, 'potion', 70, 240, 12, { count: 2, t, id: id(), ready: -9 }); B.draw(c, 'potion', 100, 240, 12, { count: 0, disabled: true, t, id: id(), ready: -9 });
    B.draw(c, 'pause', 130, 240, 11, { t, id: id(), ready: -9 }); B.draw(c, 'pause', 160, 240, 11, { pressed: true, t, id: id(), ready: -9 });
    VK.forEach((k, i) => B.slot(c, 200 + i * 60, 225, 54, 35, { weapon: { type: k, branch: HE[i], stage: 2, rarity: i }, active: i === 1, t, id: id(), ready: -9, flash: false }));
    B.stick(c, 440, 250, 24, 6, -4, true);
    return cv.toDataURL('image/png');
  },
};
"""
SCENES = [
    ('thuong', "() => { const S = T.start(0, 2, 3); G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W; for (let k = 0; k < 400 && W.ents.length < 3; k++) G.sim(1); G.sim(30); T.freeze(); }"),
    ('trum', "() => { const S = T.start(0, 4, 5); T.rng(77); G.testGoto('boss'); G.botInput0 = G.botInput; G.botInput = null; G.getRun().P.inv = 99; G.sim(200); G.botInput = G.botInput0; T.freeze(); }"),
]


# Lỗi console kiểu "Failed to load resource" là lỗi mạng của máy thử (phông chữ, Firebase, tệp dò đường), không tính.
def mo_game(b, base, sz, errs):
    pg = b.new_page(**SIZES[sz])
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (sz, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (sz, m.text)) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
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
    if a.size != b.size: return -1, None
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0)
    return d.histogram()[255], d.getbbox()


def tu_url(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')


def main():
    kq = {'loi': []}
    moi = serve(REPO)
    cu = serve(OLD) if OLD else None
    mau = os.path.join(TMP, 'luoi-mau-nut.png')
    anh_mau(mau)
    anh = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        # ----- 1) trang công cụ -----
        errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append('cong-cu: %s' % e))
        pg.on('console', lambda m: errs.append('cong-cu console: %s' % m.text) if m.type == 'error' and 'Failed to load resource' not in m.text and 'bad HTTP response' not in m.text else None)
        pg.goto(moi + '/tools/tach-giao-dien/index.html')
        i_nut = pg.evaluate("LO.findIndex((l) => l.id === 'nut')")
        pg.select_option('#chonLo', str(i_nut))
        kq['prompt_co_bang_mau'] = 'BẢNG MÀU' in pg.input_value('#oPrompt')
        pg.set_input_files('#chonAnh', mau)
        pg.wait_for_function("document.getElementById('theKq') && /ĐẠT|CÓ LỖI/.test(document.getElementById('theKq').textContent)", timeout=30000)
        kq['cong_cu'] = pg.inner_text('#theKq')
        kq['cong_cu_kiem'] = pg.eval_on_selector_all('#dsKiem li', 'els => els.map(e => (e.className ? "[" + e.className + "] " : "") + e.textContent)')
        teps = pg.evaluate('L.ds.map((m, i) => (KQ[i] ? jsonMon(i) : null))')
        ds = [json.loads(t) for t in teps if t]
        kq['so_tep'] = len(ds)
        kq['net'] = sorted(set(t.get('net') for t in ds))
        kq['co_anh'] = sorted(set(tu_url(t['anh']).size for t in ds))
        kq['ma'] = [t['ma'] for t in ds]
        pg.wait_for_function("!document.getElementById('vungXem').hidden && !document.getElementById('xemNut').hidden", timeout=30000)
        pg.wait_for_timeout(900)
        anh['xem'] = tu_url(pg.evaluate("document.getElementById('cvNut').toDataURL('image/png')"))
        pg.click('#nutDoiMau'); pg.wait_for_timeout(500)
        anh['xem_lua'] = tu_url(pg.evaluate("document.getElementById('cvNut').toDataURL('image/png')"))
        pg.click('#nutSoCode'); pg.wait_for_timeout(500)
        anh['xem_code'] = tu_url(pg.evaluate("document.getElementById('cvNut').toDataURL('image/png')"))
        kq['xem_thu_khac_code'] = khac(anh['xem_lua'], anh['xem_code'])[0]
        pg.screenshot(path=os.path.join(TMP, 'cong-cu.png'), full_page=True)
        pg.close()
        kq['loi'] += errs

        # ----- 2) + 3) game -----
        for sz in SIZES:
            errs = []
            pm = mo_game(b, moi, sz, errs)
            pc = mo_game(b, cu, sz, errs) if cu else None
            for a in (1.444, 2.667, 2.889, 4.333):  # 3) bộ nút vẽ thẳng, không tệp: cũ = mới
                if pc:
                    n, _ = khac(tu_url(pc.evaluate('(a) => T.sheet(a)', a)), tu_url(pm.evaluate('(a) => T.sheet(a)', a)))
                    kq['bo_nut_cu_moi_%s_a%s' % (sz, a)] = n
            for ten, code in SCENES:
                pm.evaluate(code)
                k0 = chup(pm)
                k0b = chup(pm)
                kq['%s-%s: hai lần chụp cùng trang' % (sz, ten)] = khac(k0, k0b)[0]
                if pc:
                    pc.evaluate(code)
                    kc = chup(pc)
                    kq['%s-%s: CŨ so MỚI không tệp (điểm ảnh khác)' % (sz, ten)] = khac(kc, k0)[0]
                    anh['%s-%s-cu' % (sz, ten)] = kc
                # nạp tạm tệp mẫu
                pm.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(JSON.parse(t)); }', [t for t in teps if t])
                pm.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=kq['ma'])
                k1 = chup(pm)
                n, box = khac(k0, k1)
                kq['%s-%s: có tệp so không tệp' % (sz, ten)] = {'diem_khac': n, 'vung': box, 'man': k1.size}
                anh['%s-%s-khong' % (sz, ten)] = k0
                anh['%s-%s-co' % (sz, ten)] = k1
                # gỡ tệp: phải về y như lúc chưa có
                pm.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', kq['ma'])
                kq['%s-%s: gỡ tệp so lúc đầu' % (sz, ten)] = khac(k0, chup(pm))[0]
                pm.reload(); pm.wait_for_function('window.G && G.scene'); pm.wait_for_timeout(500)
                pm.add_script_tag(url=moi + '/game/tests/bot.js'); pm.add_script_tag(url=moi + '/game/tests/setup.js'); pm.evaluate(HELP)
                if pc:
                    pc.reload(); pc.wait_for_function('window.G && G.scene'); pc.wait_for_timeout(500)
                    pc.add_script_tag(url=cu + '/game/tests/bot.js'); pc.add_script_tag(url=cu + '/game/tests/setup.js'); pc.evaluate(HELP)
            pm.close()
            if pc: pc.close()
            kq['loi'] += errs
        # bản gói: mở không lỗi
        errs = []
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append('dist: %s' % e))
        pg.goto(moi + '/game/dist/linh-khi.html?cloud=0'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(1200)
        kq['dist_co_btnArt_maAnh'] = pg.evaluate("G.btnArt.maAnh('dodge')")
        pg.close(); kq['loi'] += errs
        b.close()

    # ----- 4) ảnh kiểm: mỗi hàng = trái KHÔNG có tệp (hình vẽ code), phải CÓ tệp mẫu -----
    def nho(im, w):
        return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    W, w = 1200, 596
    hang = []
    def doi(a, c, loc=Image.LANCZOS, k=None):
        k = k or w / a.width
        r = Image.new('RGB', (W, round(a.height * k)), '#101010')
        r.paste(a.resize((round(a.width * k), r.height), loc), (0, 0)); r.paste(c.resize((round(c.width * k), r.height), loc), (W - w, 0))
        hang.append(r)
    for sz in SIZES:
        for ten, _ in SCENES:
            doi(anh['%s-%s-khong' % (sz, ten)], anh['%s-%s-co' % (sz, ten)])
        # phóng to cụm nút (phòng trùm) để soi từng điểm ảnh
        a, c = anh['%s-trum-khong' % sz], anh['%s-trum-co' % sz]
        o = (int(a.width * 0.74), int(a.height * 0.48), a.width, a.height)
        ca, cc = a.crop(o), c.crop(o)
        doi(ca, cc, Image.NEAREST, min(w / ca.width, 2))
    doi(anh['xem_code'], anh['xem_lua'])  # trang công cụ, bước 4: vẽ code (trái) và ảnh mẫu (phải)
    H = sum(h.height for h in hang) + 8 * (len(hang) - 1)
    out = Image.new('RGB', (W, H), '#101010'); y = 0
    for h in hang: out.paste(h, (0, y)); y += h.height + 8
    out = out.quantize(colors=160, method=Image.MEDIANCUT, dither=Image.NONE)
    out.save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)
    for k, v in anh.items(): v.save(os.path.join(TMP, k + '.png'))
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    print('ảnh tạm:', TMP)


main()
