"""Phiên C3 (ảnh AI cho nút Nói chuyện, thẻ ải, mặt trống đồng, logo): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo:
  python3 docs/review/giao-dien-c3/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) tự dựng ảnh lưới mẫu 4×3 (10 hình) và ảnh logo mẫu, nền hồng tím → đưa vào trang tools/tach-giao-dien, lô "Hình lớn" và lô "Logo"
     → phải ĐẠT, tệp có "net": 2; chụp phần xem thử (bước 4) trên game thật;
  2) chụp game ở 844×390, 4 cảnh (màn chào, bản đồ, làng đứng gần người, làng đứng xa): bản CŨ so bản MỚI không có tệp (phải khác 0 điểm ảnh),
     bản MỚI nạp tạm đủ 11 tệp mẫu, bản MỚI chỉ nạp 3 tệp "thường" (game tự làm sáng / tối), gỡ tệp (phải về như đầu);
  3) ghép ảnh kiểm docs/review/giao-dien-c3/anh-kiem.png.
Không ghi gì vào game/art/custom. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, math, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OLD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
TMP = tempfile.mkdtemp(prefix='c3-', dir=os.environ.get('C3_TMP') or None)
DT = dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
V = '#1a120a'


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- 1) ảnh mẫu: hình khối đơn giản, mỗi trạng thái một màu để nhận ra trong game ----------
def sao(d, cx, cy, r, n, mau):
    pts = []
    for k in range(n * 2):
        a = -math.pi / 2 + k * math.pi / n; q = r if k % 2 == 0 else r * 0.5
        pts.append((cx + math.cos(a) * q, cy + math.sin(a) * q))
    d.polygon(pts, fill=mau)


def trong(d, cx, cy, r, vanh, mat, sao_mau, n, giua, quai=None, vong=None):
    if vong: d.ellipse([cx - r - 7, cy - r - 7, cx + r + 7, cy + r + 7], fill=vong, outline=V, width=2)
    if quai:
        for sx in (cx - r - 16, cx + r - 8):
            d.rectangle([sx, cy - 16, sx + 24, cy + 16], fill=quai, outline=V, width=4)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=vanh, outline=V, width=5)
    d.ellipse([cx - r + 13, cy - r + 13, cx + r - 13, cy + r - 13], fill=mat, outline=V, width=3)
    sao(d, cx, cy, r - 18, n, sao_mau)
    g = r * 0.45
    d.ellipse([cx - g, cy - g, cx + g, cy + g], fill=giua, outline=V, width=3)


def anh_luoi(path):
    C, cot, hang = 240, 4, 3
    im = Image.new('RGB', (C * cot, C * hang), '#FF00FF'); d = ImageDraw.Draw(im)
    for i in range(1, cot): d.line([(i * C, 0), (i * C, C * hang)], fill='#201820', width=2)
    for j in range(1, hang): d.line([(0, j * C), (C * cot, j * C)], fill='#201820', width=2)
    def o(i): return ((i % cot) * C + C // 2, (i // cot) * C + C // 2)
    def bong(i, mau, vach):
        x, y = o(i); d.rounded_rectangle([x - 24, y - 26, x + 24, y + 2], 5, fill=mau); d.polygon([(x - 16, y + 2), (x - 6, y + 2), (x - 20, y + 14)], fill=mau)
        for k in range(3): d.line([(x - 16, y - 19 + k * 8), (x + 10 + (k % 2) * 6, y - 19 + k * 8)], fill=vach, width=3)
    def khoa(i):
        x, y = o(i); d.rectangle([x - 12, y - 4, x + 12, y + 16], fill='#7f948e'); d.arc([x - 10, y - 20, x + 10, y + 4], 180, 360, fill='#7f948e', width=5)
    # 1–3 nút Nói chuyện: nghỉ (xám xanh), sáng (đỏ đồng + vòng sáng), bấm (đỏ sẫm)
    x, y = o(0); trong(d, x, y, 76, '#4c6e66', '#26403c', '#4c6e66', 14, '#26403c'); bong(0, '#7f948e', '#26403c')
    x, y = o(1); trong(d, x, y, 76, '#d9a441', '#8a2f22', '#f6dc92', 14, '#b8452f', vong='#f6dc92'); bong(1, '#fff0c4', '#3a1a12')
    x, y = o(2); trong(d, x, y, 76, '#d9a441', '#5a1f1a', '#f6dc92', 14, '#8a2f22'); bong(2, '#fff0c4', '#3a1a12')
    # 4–6 thẻ ải: thường (xanh ngọc), chọn (đỏ + vòng sáng), khoá (xám + ổ khoá)
    x, y = o(3); trong(d, x, y, 62, '#a8752f', '#1f4f4a', '#d9a441', 12, V, quai='#a8752f')
    x, y = o(4); trong(d, x, y, 62, '#f6dc92', '#8a2f22', '#f6dc92', 12, V, quai='#a8752f', vong='#f6dc92')
    x, y = o(5); trong(d, x, y, 62, '#4c6e66', '#26403c', '#4c6e66', 12, '#1c2c2a', quai='#35524c'); khoa(5)
    # 7–9 thẻ ải trùm: to hơn, mặt đỏ
    x, y = o(6); trong(d, x, y, 70, '#a8752f', '#8a2f22', '#d9a441', 14, V, quai='#a8752f')
    x, y = o(7); trong(d, x, y, 70, '#f6dc92', '#b8452f', '#f6dc92', 14, V, quai='#a8752f', vong='#f6dc92')
    x, y = o(8); trong(d, x, y, 70, '#4c6e66', '#26403c', '#4c6e66', 14, '#1c2c2a', quai='#35524c'); khoa(8)
    # 10 mặt trống đồng: vành chấm (thay cho vành chim Lạc)
    x, y = o(9); trong(d, x, y, 80, '#a8752f', '#1f4f4a', '#d9a441', 14, V)
    for k in range(12):
        a = k * math.pi / 6; px, py = x + math.cos(a) * 54, y + math.sin(a) * 54; d.ellipse([px - 5, py - 5, px + 5, py + 5], fill='#f6dc92')
    im.save(path)


def anh_logo(path):
    im = Image.new('RGB', (1536, 1024), '#FF00FF'); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 190)
    chu = 'LINH KHÍ'
    box = d.textbbox((0, 0), chu, font=f); tw = box[2] - box[0]
    x, y = (1536 - tw) // 2 - box[0], 512 - 150
    d.text((x, y + 12), chu, font=f, fill=V, stroke_width=12, stroke_fill=V)           # bóng khối
    d.text((x, y), chu, font=f, fill='#f6dc92', stroke_width=12, stroke_fill=V)
    by = y + box[3] + 34
    d.rectangle([x - 150, by, x + tw + 150, by + 18], fill='#a8752f', outline=V, width=4)  # dải hoa văn dưới chân chữ
    for cx in (x - 110, x + tw + 110):
        trong(d, cx, 512 - 20, 70, '#a8752f', '#1f4f4a', '#d9a441', 12, V)
        d.rectangle([cx - 8, 512 + 40, cx + 8, by + 4], fill='#a8752f', outline=V, width=3)  # nối trống với dải dưới (không bắt buộc)
    im.save(path)


# ---------- game ----------
HELP = r"""
window.T = {
  freeze() { const sc = G.scene; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; G.tick = function () {}; },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  save() { G.time = 100; T.rng(5); G.testSave({ lvl: 12, gold: 500, branch: 'fire', marks: 40 }); G.save.stars = { '0-0': 3, '0-1': 2, '0-2': 1, '0-3': 3, '0-4': 2, '1-0': 1 }; return G.save; },
  dung() { G.time = 200; G.villageScene.state.t = 50; T.freeze(); }, // đặt lại hai đồng hồ để bản cũ và bản mới vẽ cùng một khung hình
  lang() { T.save(); G.setScene(G.Village); G.villageApi.V.tab = 'hub'; for (let k = 0; k < 30; k++) G.tick(); },
};
"""
SCENES = [
    ('chao', 'Màn chào', "() => { T.save(); G.setScene(G.Title); for (let k = 0; k < 10; k++) G.tick(); T.dung(); }"),
    ('ban-do', 'Bản đồ ải', "() => { T.lang(); G.villageApi.open('lai'); T.dung(); }"),
    ('lang-gan', 'Làng, đứng cạnh người', "() => { T.lang(); const VS = G.villageScene, N = VS.NPCS.ren, S = VS.state; S.x = N.den[0]; S.y = N.den[1]; S.path = null; S.goal = null; S.cam = Math.max(240, Math.min(VS.W - 240, S.x)); for (let k = 0; k < 20; k++) G.tick(); T.dung(); }"),
    ('lang-xa', 'Làng, không ai ở gần', "() => { T.lang(); T.dung(); }"),
]
LOI_MANG = ('Failed to load resource', 'bad HTTP response')


def nghe(pg, errs, nhan):
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (nhan, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (nhan, m.text)) if m.type == 'error' and not any(k in m.text for k in LOI_MANG) else None)


def nap(pg, base):
    pg.goto(base + '/game/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(500)
    pg.add_script_tag(url=base + '/game/tests/setup.js')
    pg.evaluate(HELP)


def chup(pg):
    pg.wait_for_timeout(300)
    return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')


def khac(a, b):
    if a.size != b.size: return -1, None
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0)
    return d.histogram()[255], d.getbbox()


def tu_url(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1])))


def cv(pg, id):
    return tu_url(pg.evaluate("(id) => document.getElementById(id).toDataURL('image/png')", id)).convert('RGB')


def main():
    kq = {'loi': []}
    moi = serve(REPO)
    cu = serve(OLD) if OLD else None
    luoi, logo = os.path.join(TMP, 'luoi-mau-hinh-lon.png'), os.path.join(TMP, 'logo-mau.png')
    anh_luoi(luoi); anh_logo(logo)
    anh = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        # ----- 1) trang công cụ -----
        errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400}, device_scale_factor=1)
        nghe(pg, errs, 'cong-cu')
        pg.goto(moi + '/tools/tach-giao-dien/index.html')
        pg.evaluate("localStorage.setItem('xuongSprite.thu', '{\"ma\":\"gia\",\"doi_tuong\":\"quai\"}')")  # giả như Xưởng Sprite còn để lại tệp đang làm
        teps = []
        for lo, tep_anh in (('lon', luoi), ('logo', logo)):
            pg.select_option('#chonLo', str(pg.evaluate("(id) => LO.findIndex((l) => l.id === id)", lo)))
            prompt = pg.input_value('#oPrompt')
            open(os.path.join(TMP, 'prompt-%s.txt' % lo), 'w', encoding='utf-8').write(prompt)
            kq['prompt ' + lo] = {'dai': len(prompt), 'bang_mau': prompt.count('BẢNG MÀU ('), 'nen': '#FF00FF' in prompt, 'so_o': len([1 for i in range(1, 11) if ('ô %d:' % i) in prompt]), 'LINH KHÍ': prompt.count('LINH KHÍ'), 'kiem_chinh_ta': 'KIỂM CHÍNH TẢ' in prompt}
            pg.set_input_files('#chonAnh', tep_anh)
            pg.wait_for_function("document.getElementById('theKq') && /ĐẠT|CÓ LỖI/.test(document.getElementById('theKq').textContent) && document.getElementById('dangCho').textContent === L.ten", timeout=30000)
            kq['cong cu ' + lo] = pg.inner_text('#theKq')
            kq['cong cu ' + lo + ' kiem'] = pg.eval_on_selector_all('#dsKiem li', 'els => els.map(e => (e.className ? "[" + e.className + "] " : "") + e.textContent)')
            ds = [t for t in pg.evaluate('L.ds.map((m, i) => (KQ[i] ? jsonMon(i) : null))') if t]
            teps += ds
            kq['tep ' + lo] = [(t['ma'], t.get('net'), tu_url(t['anh']).size, (t['rong'], t['cao']), t.get('vien')) for t in map(json.loads, ds)]
            kq['dac ' + lo] = pg.evaluate("L.ds.map((m, i) => { const o = KQ[i].out, x = o.cv.getContext('2d').getImageData(0, 0, o.w, o.h).data; let x0 = o.w, x1 = -1, y0 = o.h, y1 = -1; for (let j = 0; j < x.length; j += 4) if (x[j + 3]) { const px = (j / 4) % o.w, py = Math.floor(j / 4 / o.w); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } return m.ma.slice(3) + ' ' + (x1 - x0 + 1) + 'x' + (y1 - y0 + 1); })")
            pg.wait_for_function("!document.getElementById('xemLon').hidden && !document.getElementById('vungXem').hidden && document.getElementById('cvCanh').width > 300", timeout=60000)
            pg.wait_for_timeout(600)
            if lo == 'lon':
                kq['game thu: cảnh sau khi nạp'] = pg.evaluate("[GD.scene === GD.Village, GD.villageApi.V.tab, localStorage.getItem('xuongSprite.thu')]")
                anh['tt-co'] = cv(pg, 'cvTT'); anh['canh-bando'] = cv(pg, 'cvCanh')
                pg.click('#nutSoCode'); pg.wait_for_timeout(500); anh['tt-code'] = cv(pg, 'cvTT'); anh['canh-bando-code'] = cv(pg, 'cvCanh'); pg.click('#nutSoCode')
                pg.click('#nutDoiMau'); pg.wait_for_timeout(500); anh['canh-lang'] = cv(pg, 'cvCanh'); kq['canh 2'] = pg.inner_text('#ttXem')
            else:
                kq['canh logo'] = pg.inner_text('#ttXem')
                anh['canh-chao'] = cv(pg, 'cvCanh'); anh['tt-co-2'] = cv(pg, 'cvTT')
                pg.click('#nutSoCode'); pg.wait_for_timeout(500); anh['canh-chao-code'] = cv(pg, 'cvCanh'); pg.click('#nutSoCode')
        kq['game thu: bản lưu thật không bị ghi'] = pg.evaluate("localStorage.getItem('linhkhi_save_v1')")
        pg.screenshot(path=os.path.join(TMP, 'cong-cu.png'), full_page=True)
        # đổi sang lô cũ rồi quay lại: không lỗi
        for v in ('0', str(pg.evaluate("LO.findIndex((l) => l.id === 'nho')")), str(pg.evaluate("LO.findIndex((l) => l.id === 'lon')"))): pg.select_option('#chonLo', v); pg.wait_for_timeout(300)
        pg.close()
        kq['loi'] += errs
        TEP = [json.loads(t) for t in teps]
        MA = [t['ma'] for t in TEP]
        GOC = [t for t in TEP if t['ma'] in ('gd-nut-noi-chuyen', 'gd-the-ai', 'gd-the-trum')]

        # ----- 2) game, 844×390 -----
        errs = []
        pm = b.new_page(**DT); nghe(pm, errs, 'moi'); nap(pm, moi)
        pc = None
        if cu: pc = b.new_page(**DT); nghe(pc, errs, 'cu'); nap(pc, cu)
        for ten, _, code in SCENES:
            pm.evaluate(code)
            k0 = chup(pm)
            kq['%s: hai lần chụp cùng trang' % ten] = khac(k0, chup(pm))[0]
            if pc:
                pc.evaluate(code)
                n, box = khac(chup(pc), k0)
                kq['%s: CŨ so MỚI không tệp' % ten] = {'diem_khac': n, 'vung': box}
            anh[ten + '-khong'] = k0
            for nhan, ds in (('du', TEP), ('goc', GOC)):
                pm.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(t); }', ds)
                pm.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=[t['ma'] for t in ds])
                k1 = chup(pm)
                n, box = khac(k0, k1)
                kq['%s: %s so không tệp' % (ten, 'đủ 11 tệp' if nhan == 'du' else 'chỉ 3 tệp thường')] = {'diem_khac': n, 'vung': box}
                anh[ten + '-' + nhan] = k1
                pm.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', [t['ma'] for t in ds])
                kq['%s: gỡ tệp (%s) so lúc đầu' % (ten, nhan)] = khac(k0, chup(pm))[0]
            nap(pm, moi)
            if pc: nap(pc, cu)
        pm.close()
        if pc: pc.close()
        kq['loi'] += errs
        b.close()

    # ----- 3) ghép ảnh kiểm -----
    f1, f2 = ImageFont.truetype(FONT, 22), ImageFont.truetype(FONT, 16)
    CW, PAD = 600, 12
    def vua(im, w=CW): return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    hang = []
    def them(tieu_de, o):  # o: [(nhãn, ảnh)]
        hs = [vua(im) for _, im in o]
        H = max(h.height for h in hs) + 30
        r = Image.new('RGB', (PAD + len(o) * (CW + PAD), H + 34), '#12292a'); d = ImageDraw.Draw(r)
        d.text((PAD, 4), tieu_de, font=f1, fill='#f6dc92')
        for i, ((nh, _), h) in enumerate(zip(o, hs)):
            x = PAD + i * (CW + PAD); d.text((x, 34), nh, font=f2, fill='#a9c2b4'); r.paste(h, (x, 58))
        hang.append(r)
    them('1. Màn chào 844×390: logo và mặt trống đồng', [('hình vẽ code (không có tệp)', anh['chao-khong']), ('có tệp mẫu gd-logo, gd-trong-dong', anh['chao-du'])])
    them('2. Bản đồ ải: thẻ ải thường / đang chọn / khoá', [('hình vẽ code', anh['ban-do-khong']), ('đủ tệp mẫu (9 thẻ)', anh['ban-do-du']), ('chỉ tệp "thường": game tự làm sáng, làm tối', anh['ban-do-goc'])])
    def nut(im): return im.crop((1390, 520, 1630, 760)).resize((300, 300), Image.NEAREST)
    def ghep(ds):
        o = Image.new('RGB', (len(ds) * 310, 300), '#12292a')
        for i, im in enumerate(ds): o.paste(nut(im), (i * 310, 0))
        return o
    them('3. Làng: nút Nói chuyện', [('đứng cạnh người, đủ tệp mẫu', anh['lang-gan-du']), ('phóng to nút: code | tệp sáng | tự làm sáng từ tệp thường', ghep([anh['lang-gan-khong'], anh['lang-gan-du'], anh['lang-gan-goc']])), ('không ai ở gần: code | tệp thường (game vẽ mờ 50%)', ghep([anh['lang-xa-khong'], anh['lang-xa-du']]))])
    them('4. Trang công cụ, bước 4: từng trạng thái do code game vẽ', [('ảnh mẫu vừa tách (lô Hình lớn)', anh['tt-co']), ('bản vẽ code cũ (nút "Xem bản vẽ code")', anh['tt-code'])])
    them('5. Trang công cụ, bước 4: màn hình thật của game', [('bản đồ ải', anh['canh-bando']), ('làng', anh['canh-lang']), ('màn chào (sau khi tách thêm lô Logo)', anh['canh-chao'])])
    W = max(r.width for r in hang)
    out = Image.new('RGB', (W, sum(r.height for r in hang) + PAD * len(hang)), '#12292a'); y = 0
    for r in hang: out.paste(r, (0, y)); y += r.height + PAD
    out.save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)
    for k, im in anh.items(): im.save(os.path.join(TMP, k + '.png'))
    print(json.dumps(kq, ensure_ascii=False, indent=1, default=str))
    print('Thư mục tạm:', TMP)


if __name__ == '__main__':
    main()
