"""Phiên D3 (nền làng và tranh bản đồ vùng bằng ảnh AI): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo, sau khi đã `python3 game/build.py`:
  python3 docs/review/lang-d3/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) mở trang tools/tach-lang ở bề rộng điện thoại, lấy prompt và 2 × 2 ảnh tham chiếu của hai lô mới (ghi vào thư mục này);
  2) máy tự dựng ảnh mẫu 1536×1024 cho từng lô (phần tranh ở giữa, hai dải hồng tím trên dưới) → đưa vào trang → phải ĐẠT, đúng cỡ 720×270 và 480×270;
     chụp phần xem thử (bước 4) có lớp phủ soi lệch; đo cỡ tệp (nét thường, nét gấp đôi); thử thêm một ảnh KHÔNG có dải hồng tím;
  3) game thật 844×390: bản CŨ so bản MỚI không có tệp (phải khác 0 điểm ảnh) ở làng (3 chỗ) và bản đồ ải (ngày, đêm);
     nạp tạm 2 tệp mẫu → làng và bản đồ đổi nền; gỡ ra → về như đầu (khác 0);
  4) ghép ảnh kiểm docs/review/lang-d3/anh-kiem.png, in số đo ra màn hình và ghi so-do.json.
Không ghi gì vào game/art/custom. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, os, random, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OLD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
TMP = tempfile.mkdtemp(prefix='d3-', dir=os.environ.get('D3_TMP') or None)
DT = dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
LOI_MANG = ('Failed to load resource', 'bad HTTP response')
SO = {}


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


def nghe(pg, errs, nhan):
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (nhan, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (nhan, m.text)) if m.type == 'error' and not any(k in m.text for k in LOI_MANG) else None)


def tu_url(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))).convert('RGB')


def khac(a, b):
    if a.size != b.size: return -1
    return ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0).histogram()[255]


# ---------- ảnh mẫu máy tự dựng: lấy phần tranh của ảnh tham chiếu 1, đổi màu cho dễ nhận, kẻ ô, ghi chữ MẪU, đặt lại vào khung 3:2 có hai dải hồng tím ----------
def anh_mau(tc1, path, kieu='dai', lech=0, nhieu=0):
    W, H = tc1.size  # 1440×960
    px = tc1.load(); y0 = 0
    while px[W // 2, y0][0] > 200 and px[W // 2, y0][1] < 60 and px[W // 2, y0][2] > 200: y0 += 1
    y1 = H - 1
    while px[W // 2, y1][0] > 200 and px[W // 2, y1][1] < 60 and px[W // 2, y1][2] > 200: y1 -= 1
    tranh = tc1.crop((0, y0, W, y1 + 1))
    r, g, b = tranh.split()
    tranh = Image.merge('RGB', (g.point(lambda v: min(255, int(v * 1.15))), b.point(lambda v: min(255, int(v * 1.1 + 20))), r))  # xoay kênh màu: cỏ thành xanh lam, đất thành tím nhạt
    if nhieu:  # ảnh "kiểu AI": phóng mềm, thêm nhiễu hạt, để ước cỡ tệp sát thực tế hơn hình mẫu phẳng
        tranh = tranh.resize((W // 2, (y1 - y0 + 1) // 2), Image.BILINEAR).resize(tranh.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
        rd = random.Random(7); n = Image.new('RGB', (W // 3, tranh.size[1] // 3)); n.putdata([tuple(128 + rd.randint(-nhieu, nhieu) for _ in range(3)) for _ in range(n.size[0] * n.size[1])])
        tranh = ImageChops.add(tranh, n.resize(tranh.size, Image.BICUBIC), 1, -128)
    d = ImageDraw.Draw(tranh)
    for x in range(0, W, 120): d.line([(x, 0), (x, tranh.size[1])], fill=(255, 255, 255), width=1)
    d.text((W // 2 - 150, 16), 'HÌNH MẪU MÁY DỰNG', font=ImageFont.truetype(FONT, 28), fill=(255, 240, 120))
    if lech: tranh = ImageChops.offset(tranh, lech, 0)  # cố ý vẽ lệch sang phải để thử lớp phủ soi lệch
    if kieu == 'dai':
        im = Image.new('RGB', (1536, 1024), '#FF00FF'); t = tranh.resize((1536, round(1536 * tranh.size[1] / W)), Image.BICUBIC)
        im.paste(t, (0, (1024 - t.size[1]) // 2))
    else:  # ChatGPT không giữ hai dải: vẽ kín cả tấm 3:2
        im = tranh.resize((1536, 1024), Image.BICUBIC)
    im.save(path); return path


# ---------- trang công cụ ----------
def trang(b, base, errs):
    out = {}
    cx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    pg = cx.new_page(); nghe(pg, errs, 'trang')
    pg.goto(base + '/tools/tach-lang/index.html')
    pg.wait_for_function('GAME && TC["nen-lang"] && TC["ban-do-vung"]', timeout=60000)
    los = pg.evaluate('LO.map((l) => l.id)')
    assert los[-2:] == ['nen-lang', 'ban-do-vung'], los
    SO['lo'] = los
    for lo, tep_tc in (('nen-lang', 'lang-nen-tham-chieu'), ('ban-do-vung', 'ban-do-vung-tham-chieu')):
        i = los.index(lo)
        pg.select_option('#chonLo', str(i))
        o = pg.evaluate('''() => ({ prompt: taoPrompt(L), tc: TC[L.id].map((a) => ({ url: a.url, tep: a.tep, chu: a.chu })), net: NET(), heNet: document.getElementById('heNet').value, mau: document.getElementById('soMau').value })''')
        out[lo] = {'prompt': o['prompt'], 'tc': []}
        for a in o['tc']:
            im = tu_url(a['url']); im.save(os.path.join(HERE, a['tep'])); out[lo]['tc'].append(im)
            assert im.size == (1440, 960), im.size
        assert o['net'] == 1, o  # nền: mặc định nét thường
        # --- ảnh mẫu có hai dải hồng tím, cố ý lệch 12 điểm ảnh gốc sang phải ---
        mau = anh_mau(out[lo]['tc'][0], os.path.join(TMP, lo + '-mau.png'), lech=12)
        pg.set_input_files('#chonAnh', mau)
        pg.wait_for_function('!document.getElementById("buoc3").hidden && KQ[0] && KQ[0].out && XEM[L.ds[0].ma]')
        kq = pg.evaluate('''() => { const O = KQ[0].out, t = tepNen(O); return { the: document.getElementById('theKq').textContent, kiem: [...document.querySelectorAll('#dsKiem li')].map((li) => (li.className || 'ok') + ': ' + li.textContent),
          w: O.w, h: O.h, N: O.N, dac: O.dac, kb1: Math.round(JSON.stringify(t).length / 1024), tep: t, tran: document.documentElement.scrollWidth, vien: SEG.vien } }''')
        assert kq['the'] == 'ĐẠT', kq['kiem']
        m = pg.evaluate('L.ds[0]')
        assert (kq['w'], kq['h'], kq['N']) == (m['w'], m['h'], 1) and kq['dac'] == m['w'] * m['h'], kq
        assert kq['tran'] <= 390, kq['tran']
        assert kq['tep']['ma'] == m['ma'] and kq['tep']['doi_tuong'] == 'giao-dien' and 'net' not in kq['tep']
        out[lo]['tep'] = kq['tep']; out[lo]['kiem'] = kq['kiem']
        pg.wait_for_timeout(700)
        # --- bước 4: xem thử có lớp phủ ---
        if lo == 'nen-lang':
            out[lo]['xem'] = tu_url(pg.evaluate('document.getElementById("cvLang").toDataURL()'))
            pg.click('#nutVung'); pg.click('#nutChong'); pg.wait_for_timeout(200)
            out[lo]['phu'] = tu_url(pg.evaluate('document.getElementById("cvLang").toDataURL()'))
            pg.click('#nutChong'); pg.click('#nutVung'); pg.click('#nutSoCode'); pg.wait_for_timeout(200)
            out[lo]['code'] = tu_url(pg.evaluate('document.getElementById("cvLang").toDataURL()'))
            pg.click('#nutSoCode')
            assert khac(out[lo]['xem'], out[lo]['code']) > 100000  # nền đã đổi sang ảnh
        else:
            assert pg.evaluate('!document.getElementById("khoiXemBanDo").hidden && document.getElementById("khoiXemLang").hidden')
            out[lo]['xem'] = tu_url(pg.evaluate('document.getElementById("cvBanDo").toDataURL()'))
            pg.click('#nutAi'); pg.wait_for_timeout(200)
            out[lo]['phu'] = tu_url(pg.evaluate('document.getElementById("cvBanDo").toDataURL()'))
            pg.click('#nutAi'); pg.click('#nutDem'); pg.wait_for_timeout(200)
            out[lo]['dem'] = tu_url(pg.evaluate('document.getElementById("cvBanDo").toDataURL()'))
            pg.click('#nutDem'); pg.click('#nutSoCode'); pg.wait_for_timeout(200)
            out[lo]['code'] = tu_url(pg.evaluate('document.getElementById("cvBanDo").toDataURL()'))
            pg.click('#nutSoCode')
            assert khac(out[lo]['xem'], out[lo]['code']) > 50000
        out[lo]['trang'] = Image.open(io.BytesIO(pg.locator('#buoc3').screenshot())).convert('RGB')
        # --- ước cỡ tệp bằng ảnh "kiểu AI" (mềm, có nhiễu hạt): nét thường và nét gấp đôi, theo số màu ---
        pg.set_input_files('#chonAnh', anh_mau(out[lo]['tc'][0], os.path.join(TMP, lo + '-nhieu.png'), nhieu=14))
        pg.wait_for_function('KQ[0] && KQ[0].out')
        pg.wait_for_timeout(300)
        SO[lo] = pg.evaluate('''() => { const r = {}, s = document.getElementById('soMau'), cu = s.value;
          for (const n of ['128', '64', '32']) { s.value = n; const kb = (N) => Math.round(JSON.stringify(tepNen(nenRa(KQ[0].src, N))).length / 1024); r[n] = { thuong: kb(1), gap: kb(2) }; }
          s.value = cu; return r; }''')
        SO[lo]['mau-phang-kb'] = kq['kb1']
        # --- ảnh KHÔNG có dải hồng tím (kín cả tấm 3:2): phải báo cắt nhiều, bấm "Kéo giãn cho kín" thì lấy hết ---
        pg.set_input_files('#chonAnh', anh_mau(out[lo]['tc'][0], os.path.join(TMP, lo + '-kin.png'), kieu='kin'))
        pg.wait_for_function('KQ[0] && KQ[0].out && !SEG.vien.co')
        k1 = pg.evaluate('({ cat: KQ[0].hop, kiem: [...document.querySelectorAll("#dsKiem li")].map((li) => li.textContent).filter((t) => /CẮT|KÉO/.test(t)) })')
        pg.click('#nutKieuVua'); pg.wait_for_timeout(300)
        k2 = pg.evaluate('({ cat: KQ[0].hop, the: document.getElementById("theKq").textContent, kiem: [...document.querySelectorAll("#dsKiem li")].map((li) => li.textContent).filter((t) => /CẮT|KÉO/.test(t)) })')
        assert k1['cat']['sh'] < k1['cat']['bh'] and k2['cat']['sh'] == k2['cat']['bh'] and k2['the'] == 'ĐẠT', (k1, k2)
        out[lo]['kin'] = [k1['kiem'], k2['kiem']]
        pg.click('#nutKieuVua')
    # lô cũ vẫn chạy: chọn lại lô công trình, phần xem của lô nền phải ẩn
    pg.select_option('#chonLo', '0'); pg.wait_for_timeout(300)
    assert pg.evaluate('document.getElementById("heNet").value === "2" && !document.getElementById("heNet").disabled && NET() === 2')
    cx.close()
    return out


# ---------- game ----------
HELP = r"""
window.T = {
  freeze() { const sc = G.scene; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; G.tick = function () {}; },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  save() { G.time = 100; T.rng(5); G.testSave({ lvl: 12, gold: 500, branch: 'fire', marks: 40 }); G.save.stars = { '0-0': 3, '0-1': 2, '0-2': 1, '0-3': 3, '0-4': 2, '1-0': 1 }; return G.save; },
  dung() { G.time = 200; G.villageScene.state.t = 50; T.freeze(); },
  lang(x) { T.save(); G.setScene(G.Village); G.villageApi.V.tab = 'hub'; for (let k = 0; k < 30; k++) G.tick(); const VS = G.villageScene, S = VS.state; S.x = x; S.y = 166; S.path = null; S.goal = null; S.cam = Math.max(0, Math.min(VS.W - 480, x - 240)); },
};
"""
SCENES = [
    ('lang-trai', 'Làng, đầu làng', "() => { T.lang(150); T.dung(); }"),
    ('lang-giua', 'Làng, giữa làng', "() => { T.lang(380); T.dung(); }"),
    ('lang-phai', 'Làng, bến đò', "() => { T.lang(610); T.dung(); }"),
    ('ban-do', 'Bản đồ ải', "() => { T.lang(610); G.villageApi.open('lai'); T.dung(); }"),
    ('ban-do-dem', 'Bản đồ ải, độ khó 2', "() => { T.lang(610); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) G.save.stars[r + '-' + i] = 3; G.villageApi.open('lai'); G.villageApi.V.diff = 1; T.dung(); }"),
]


def nap(pg, base):
    pg.goto(base + '/game/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(500)
    pg.add_script_tag(url=base + '/game/tests/setup.js')
    pg.evaluate(HELP)


def chup_het(b, base, errs, nhan, teps=None, sau=None):
    """Chụp các cảnh. teps: nạp tạm các tệp này trước khi chụp. sau: gỡ các mã này rồi chụp thêm một lượt nữa."""
    ra = {}
    cx = b.new_context(**DT)
    for ten, _, js in SCENES:
        pg = cx.new_page(); nghe(pg, errs, nhan + '/' + ten)
        nap(pg, base)
        if teps:
            pg.evaluate('(ds) => { for (const t of ds) G.spriteCustom.add(t); }', teps)
            pg.wait_for_function('(ms) => ms.every((m) => G.spriteCustom.gdSan(m))', arg=[t['ma'] for t in teps])
        pg.evaluate(js); pg.wait_for_timeout(300)
        ra[ten] = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
        if sau:
            pg.evaluate('(ms) => { for (const m of ms) G.spriteCustom.remove(m); }', sau)
            pg.wait_for_timeout(300)
            ra[ten + '/go'] = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
        pg.close()
    cx.close()
    return ra


def ghep(tr, moi, co):
    f = ImageFont.truetype(FONT, 22); f2 = ImageFont.truetype(FONT, 16)
    W = 1700; hang = []

    def dong(ds, cao):  # ds: [(ảnh, chú thích)]
        w = (W - 20 * (len(ds) + 1)) // len(ds); im = Image.new('RGB', (W, cao + 40), '#12292a'); d = ImageDraw.Draw(im)
        for i, (a, chu) in enumerate(ds):
            k = min(w / a.size[0], cao / a.size[1]); t = a.resize((max(1, round(a.size[0] * k)), max(1, round(a.size[1] * k))), Image.LANCZOS)
            x = 20 + i * (w + 20); im.paste(t, (x, 34)); d.text((x, 6), chu, font=f2, fill='#f6dc92')
        return im

    def tieu(t):
        im = Image.new('RGB', (W, 44), '#1a120a'); ImageDraw.Draw(im).text((20, 8), t, font=f, fill='#f6dc92'); return im

    hang.append(tieu('D3 · 1) Ảnh tham chiếu trang tự dựng (gửi kèm prompt): nền làng 1, 2 · tranh bản đồ 1, 2'))
    hang.append(dong([(tr['nen-lang']['tc'][0], 'nền làng · ảnh 1'), (tr['nen-lang']['tc'][1], 'nền làng · ảnh 2 (đỏ: không đi được)'), (tr['ban-do-vung']['tc'][0], 'bản đồ · ảnh 1'), (tr['ban-do-vung']['tc'][1], 'bản đồ · ảnh 2 (15 ải)')], 270))
    hang.append(tieu('2) Trang Tách Làng, bước 4: nền làng bằng ảnh mẫu (cố ý vẽ lệch) · bật "chỗ không đi được" + "chồng mờ nền cũ"'))
    hang.append(dong([(tr['nen-lang']['xem'], 'xem thử cả làng, nền là hình mẫu máy dựng')], 300))
    hang.append(dong([(tr['nen-lang']['phu'], 'lớp phủ soi lệch: đỏ = không đi được, nền cũ chồng mờ (thấy đường, sông lệch sang phải)')], 300))
    hang.append(tieu('3) Trang Tách Làng, bước 4: tranh bản đồ bằng ảnh mẫu · bật "Hiện vị trí 15 ải" · màu đêm'))
    hang.append(dong([(tr['ban-do-vung']['xem'], 'tranh bằng hình mẫu'), (tr['ban-do-vung']['phu'], 'có 15 ải và chỗ game phủ lên'), (tr['ban-do-vung']['dem'], 'màu đêm (độ khó 2)')], 300))
    hang.append(tieu('4) Game thật 844×390 · trên: không có tệp (khác bản cũ 0 điểm ảnh) · dưới: nạp tạm 2 tệp mẫu'))
    ten = ['lang-trai', 'lang-giua', 'lang-phai', 'ban-do', 'ban-do-dem']
    hang.append(dong([(moi[t], n) for t, n in zip(ten, ['đầu làng', 'giữa làng', 'bến đò', 'bản đồ ải', 'bản đồ, độ khó 2'])], 150))
    hang.append(dong([(co[t], n + ' · có tệp mẫu') for t, n in zip(ten, ['đầu làng', 'giữa làng', 'bến đò', 'bản đồ ải', 'bản đồ, độ khó 2'])], 150))
    hang.append(tieu('5) Trang Tách Làng ở bề rộng điện thoại (390): bước 3 của hai lô mới'))
    hang.append(dong([(tr['nen-lang']['trang'], 'lô Nền làng'), (tr['ban-do-vung']['trang'], 'lô Tranh bản đồ vùng')], 620))
    H = sum(h.size[1] for h in hang); im = Image.new('RGB', (W, H), '#12292a'); y = 0
    for h in hang: im.paste(h, (0, y)); y += h.size[1]
    im.convert('P', palette=Image.ADAPTIVE, colors=220).save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)  # giảm màu cho tệp ảnh kiểm nhẹ


def main():
    errs = []
    base = serve(REPO)
    with sync_playwright() as p:
        b = p.chromium.launch()
        tr = trang(b, base, errs)
        teps = [tr['nen-lang']['tep'], tr['ban-do-vung']['tep']]; ms = [t['ma'] for t in teps]
        moi = chup_het(b, base, errs, 'moi')
        if OLD:
            cu = chup_het(b, serve(OLD), errs, 'cu')
            SO['khac-ban-cu-khi-khong-co-tep'] = {t: khac(cu[t], moi[t]) for t in cu}
            assert all(v == 0 for v in SO['khac-ban-cu-khi-khong-co-tep'].values()), SO
        co = chup_het(b, base, errs, 'co-tep', teps=teps, sau=ms)
        SO['khac-khi-co-tep'] = {t: khac(moi[t], co[t]) for t in moi}
        SO['khac-sau-khi-go'] = {t: khac(moi[t], co[t + '/go']) for t in moi}
        assert all(v > 20000 for v in SO['khac-khi-co-tep'].values()), SO
        assert all(v == 0 for v in SO['khac-sau-khi-go'].values()), SO
        b.close()
    SO['loi-js'] = errs
    ghep(tr, moi, co)
    open(os.path.join(TMP, 'prompt.json'), 'w', encoding='utf-8').write(json.dumps({k: tr[k]['prompt'] for k in ('nen-lang', 'ban-do-vung')}, ensure_ascii=False))
    SO['kiem-trang'] = {k: tr[k]['kiem'] for k in ('nen-lang', 'ban-do-vung')}
    SO['anh-khong-co-dai'] = {k: tr[k]['kin'] for k in ('nen-lang', 'ban-do-vung')}
    open(os.path.join(HERE, 'so-do.json'), 'w', encoding='utf-8').write(json.dumps(SO, ensure_ascii=False, indent=1))
    print(json.dumps(SO, ensure_ascii=False, indent=1))
    print('prompt:', os.path.join(TMP, 'prompt.json'))
    assert not errs, errs


if __name__ == '__main__':
    main()
