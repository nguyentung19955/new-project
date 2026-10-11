"""Làn D2b (gộp khung cửi + lửa lò vào một tấm): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo:
  python3 docs/review/lang-d2b/kiem.py <tệp index.html của trang Tách Làng CŨ để so>
  (ví dụ: git show 9435c54:tools/tach-lang/index.html > /tmp/cu.html)
Làm gì:
  1) mở trang MỚI và trang CŨ ở bề rộng điện thoại; so prompt và ảnh tham chiếu của 6 lô cũ (phải giống hệt);
  2) lấy ảnh tham chiếu của lô gộp (2 hàng × 3 cột, nền xanh dương) do trang tự dựng, LẬT NGANG từng hình cho dễ nhận là ảnh mẫu
     (không phải hình code) → đó là ẢNH MẪU GỘP. Từ chính 6 hình đó dựng 2 ảnh mẫu lẻ: khung cửi 3 × 1 nền hồng tím, lửa lò 3 × 1 nền xanh dương;
  3) đưa ảnh mẫu gộp vào lô gộp → bấm "Tải tất cả" → mở .zip: phải có đúng 4 tệp (2 mã × 2 bản), đúng cỡ;
     đưa 2 ảnh mẫu lẻ vào 2 lô lẻ ở trang MỚI và trang CŨ → bấm tải → so TỪNG BYTE với tệp của lô gộp;
  4) xem thử trong làng: cả hai hình đều hiện từ một tấm; thử ca một hàng hỏng (vẫn tải được hàng kia); không lỗi JavaScript;
  5) ghép ảnh kiểm docs/review/lang-d2b/anh-kiem.png, ghi so-do.json.
Trang tải thư viện nén .zip từ mạng; máy kiểm không ra mạng nên trỏ sang bản JSZip có sẵn trên máy (biến JSZIP).
Không ghi gì vào game/. Ảnh mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, hashlib, http.server, io, json, os, sys, tempfile, threading, zipfile
from PIL import Image, ImageDraw, ImageFont, ImageOps
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
CU = os.path.abspath(sys.argv[1])
TMP = tempfile.mkdtemp(prefix='d2b-', dir=os.environ.get('D2B_TMP') or None)
JSZIP = os.environ.get('JSZIP') or '/opt/npm-tools/node_modules/jszip/dist/jszip.min.js'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
LOI_MANG = ('Failed to load resource', 'bad HTTP response', 'net::ERR')
GOP = 'khung-cui-lua-lo'
SO, KQ = {}, []


def dat(ten, ok, ghi=''):
    KQ.append((ten, bool(ok), ghi)); print(('ĐẠT   ' if ok else 'HỎNG  ') + ten + (' · ' + str(ghi) if ghi else ''))


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


def tu_url(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1])))


# ---------- thư mục phục vụ: trang mới, trang cũ, bản game gói cho công cụ ----------
WWW = os.path.join(TMP, 'www'); os.makedirs(os.path.join(WWW, 'tools', 'tach-lang-cu'))
os.symlink(os.path.join(REPO, 'tools', 'tach-lang'), os.path.join(WWW, 'tools', 'tach-lang'))
os.symlink(os.path.join(REPO, 'tools', 'xuong-sprite'), os.path.join(WWW, 'tools', 'xuong-sprite'))
os.symlink(CU, os.path.join(WWW, 'tools', 'tach-lang-cu', 'index.html'))
GOC = serve(WWW)


def mo(ctx, duong, nhan, errs):
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('%s: %s' % (nhan, e)))
    pg.on('console', lambda m: errs.append('%s console: %s' % (nhan, m.text)) if m.type == 'error' and not any(k in m.text for k in LOI_MANG) else None)
    if os.path.exists(JSZIP):
        pg.route('**/jszip.min.js', lambda r: r.fulfill(path=JSZIP, content_type='application/javascript'))
    pg.goto(GOC + duong)
    pg.wait_for_function('typeof GAME !== "undefined" && GAME && Object.keys(TC).length >= 6', timeout=60000)
    return pg


def chon_lo(pg, id_lo):
    pg.evaluate('(id) => { const s = document.getElementById("chonLo"); s.value = String(LO.findIndex((l) => l.id === id)); s.dispatchEvent(new Event("change")); }', id_lo)


def dua_anh(pg, path):
    pg.set_input_files('#chonAnh', path)
    pg.wait_for_function('!document.getElementById("buoc3").hidden && ANH && KQ.length', timeout=60000)
    pg.wait_for_timeout(500)


def tai_zip(pg):
    """Bấm nút tải thật, trả về {tên tệp trong zip: bytes}."""
    with pg.expect_download(timeout=60000) as d:
        pg.click('#nutTaiZip')
    f = os.path.join(TMP, 'tai-%d-%s' % (len(os.listdir(TMP)), d.value.suggested_filename)); d.value.save_as(f)
    z = zipfile.ZipFile(f)
    return d.value.suggested_filename, {n: z.read(n) for n in z.namelist()}


# ---------- ảnh mẫu ----------
def cat_o(tam, cot, hang, i):
    ow, oh = tam.size[0] // cot, tam.size[1] // hang
    x, y = (i % cot) * ow, (i // cot) * oh
    return tam.crop((x + 8, y + 8, x + ow - 8, y + oh - 8))  # bỏ nét kẻ lưới ở mép ô


def dung_luoi(hinh, cot, hang, nen, path, trong=()):
    """Xếp các hình (đã cắt theo ô, nền xanh dương) vào lưới cot × hang trên ảnh 1500×1000 nền `nen`, kẻ lưới tối 4 điểm như ảnh tham chiếu của trang."""
    W, H = 1500, 1000; ow, oh = W // cot, H // hang
    a = Image.new('RGB', (W, H), nen)
    for i, h in enumerate(hinh):
        if i in trong: continue
        if nen != (0, 0, 255):  # đổi nền của hình sang màu nền mới (hình không có điểm xanh dương thuần)
            px = h.load()
            for y in range(h.size[1]):
                for x in range(h.size[0]):
                    if px[x, y] == (0, 0, 255): px[x, y] = nen
        a.paste(h, ((i % cot) * ow + (ow - h.size[0]) // 2, (i // cot) * oh + (oh - h.size[1]) // 2))
    d = ImageDraw.Draw(a)
    for i in range(1, cot): d.rectangle((i * ow - 2, 0, i * ow + 1, H), fill=(26, 18, 10))
    for i in range(1, hang): d.rectangle((0, i * oh - 2, W, i * oh + 1), fill=(26, 18, 10))
    a.save(path); return path


def cat_cv(pg, sel):
    return tu_url(pg.evaluate('(s) => document.querySelector(s).toDataURL("image/png")', sel)).convert('RGB')


with sync_playwright() as pw:
    br = pw.chromium.launch()
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2, accept_downloads=True)
    errs = []
    moi = mo(ctx, '/tools/tach-lang/index.html', 'trang mới', errs)
    cu = mo(ctx, '/tools/tach-lang-cu/index.html', 'trang cũ', errs)

    # 1) prompt và ảnh tham chiếu của 6 lô cũ: trang mới phải giống hệt trang cũ
    lay = '() => LO.filter((l) => !l.gop).map((l) => [l.id, taoPrompt(l), (TC[l.id] || []).map((a) => a.url)])'
    a, b = moi.evaluate(lay), cu.evaluate(lay)
    dat('6 lô cũ: prompt ở trang mới giống hệt trang cũ', len(a) == 6 and [x[:2] for x in a] == [x[:2] for x in b])
    dat('6 lô cũ: ảnh tham chiếu ở trang mới giống hệt trang cũ', [x[2] for x in a] == [x[2] for x in b] and all(x[2] for x in a))
    dat('Lô gộp nằm CUỐI danh sách lô', moi.evaluate('() => LO[LO.length - 1].id') == GOP and moi.evaluate('() => LO.length') == 7)

    # prompt và ảnh tham chiếu của lô gộp
    p_gop = moi.evaluate('(id) => taoPrompt(LO.find((l) => l.id === id))', GOP)
    open(os.path.join(TMP, 'prompt-gop.txt'), 'w', encoding='utf-8').write(p_gop)
    SO['prompt_gop_ky_tu'] = len(p_gop)
    tc = moi.evaluate('(id) => TC[id].map((a) => [a.url, a.tep, a.chu])', GOP)
    dat('Lô gộp có đúng 1 ảnh tham chiếu', len(tc) == 1, tc[0][1])
    tham = tu_url(tc[0][0]).convert('RGB'); tham.save(os.path.join(HERE, 'lang-khung-cui-lua-lo-tham-chieu.png'))
    dat('Ảnh tham chiếu lô gộp 1500×1000, nền xanh dương', tham.size == (1500, 1000) and tham.getpixel((20, 20)) == (0, 0, 255))

    # 2) ảnh mẫu: lật ngang 6 hình của ảnh tham chiếu gộp
    hinh = [ImageOps.mirror(cat_o(tham, 3, 2, i)) for i in range(6)]
    xanh, hong = (0, 0, 255), (255, 0, 255)
    co_xanh = sum(1 for h in hinh[:3] for p in list(h.getdata()) if p != xanh and p[2] > 200 and p[0] < 90 and p[1] < 90)
    dat('Hình khung cửi không có điểm nào gần màu xanh dương của nền', co_xanh == 0, '%d điểm' % co_xanh)
    m_gop = dung_luoi(hinh, 3, 2, xanh, os.path.join(TMP, 'mau-gop.png'))
    m_cui = dung_luoi([h.copy() for h in hinh[:3]], 3, 1, hong, os.path.join(TMP, 'mau-khung-cui.png'))
    m_lua = dung_luoi(hinh[3:], 3, 1, xanh, os.path.join(TMP, 'mau-lua-lo.png'))
    m_hong = dung_luoi(hinh, 3, 2, xanh, os.path.join(TMP, 'mau-gop-hong-1-khung.png'), trong=(4,))  # ca hỏng: thiếu khung 2 của lửa

    # 3) lô gộp ở trang mới
    chon_lo(moi, GOP)
    dat('Lô gộp: ô "Số màu" chọn sẵn "Theo từng dải (32 / 16)"', moi.evaluate('() => document.getElementById("soMau").selectedOptions[0].textContent') == 'Theo từng dải (32 / 16)')
    dua_anh(moi, m_gop)
    tt = moi.evaluate('() => ({ the: document.getElementById("theKq").textContent, nut: document.getElementById("nutTaiZip").textContent, tim: KQ.filter(Boolean).length, kiem: [...document.querySelectorAll("#dsKiem li")].map((l) => [l.className, l.textContent]) })')
    dat('Lô gộp: ĐẠT, tìm được 6/6 khung', tt['the'] == 'ĐẠT' and tt['tim'] == 6, tt['the'])
    dat('Lô gộp: nút "Tải tất cả (.zip, 2 tệp dải)"', tt['nut'] == 'Tải tất cả (.zip, 2 tệp dải)', tt['nut'])
    SO['kiem_lo_gop'] = [k[1] for k in tt['kiem']]
    moi.locator('#buoc3').screenshot(path=os.path.join(TMP, 'buoc3.png'))
    ten_zip, T = tai_zip(moi)
    can = ['hu-lang-khung-cui.sprite.json', 'hu-lang-khung-cui.thuong.sprite.json', 'hu-lang-lua-lo.sprite.json', 'hu-lang-lua-lo.thuong.sprite.json']
    dat('Lô gộp: .zip có đúng 4 tệp với mã cũ', sorted(T) == can, ten_zip + ': ' + ', '.join(sorted(T)))
    for ma, kr, kc, giay in (('hu-lang-khung-cui', 28, 22, 1.364), ('hu-lang-lua-lo', 12, 15, 0.429)):
        j = json.loads(T[ma + '.sprite.json']); im = tu_url(j['tam']); jt = json.loads(T[ma + '.thuong.sprite.json']); it = tu_url(jt['tam'])
        ok = (j['ma'] == ma and j['doi_tuong'] == 'hieu-ung' and j['net'] == 2 and j['khung_rong'] == kr and j['khung_cao'] == kc and j['so'] == 3 and j['giay'] == giay
              and j['goc'] == [kr / 2, kc] and im.size == (kr * 6, kc * 2) and 'net' not in jt and it.size == (kr * 3, kc))
        dat('%s: dải %d×%d nét gấp đôi ("net": 2), bản thường %d×%d, 3 khung %d×%d' % (ma, kr * 6, kc * 2, kr * 3, kc, kr, kc), ok, 'ảnh %s, bản thường %s' % (im.size, it.size))
        SO[ma] = {'anh_net_doi': list(im.size), 'anh_thuong': list(it.size), 'byte_net_doi': len(T[ma + '.sprite.json']), 'byte_thuong': len(T[ma + '.thuong.sprite.json']),
                  'sha256_net_doi': hashlib.sha256(T[ma + '.sprite.json']).hexdigest()[:16], 'so_mau': len(set(p for p in im.convert('RGBA').getdata() if p[3]))}
        im.save(os.path.join(TMP, ma + '.png'))

    # hai lô lẻ, trang MỚI và trang CŨ, cùng hình
    for pg, nhan in ((moi, 'trang mới'), (cu, 'trang cũ')):
        for id_lo, mau, ma in (('khung-cui', m_cui, 'hu-lang-khung-cui'), ('lua-lo', m_lua, 'hu-lang-lua-lo')):
            chon_lo(pg, id_lo); dua_anh(pg, mau)
            the = pg.evaluate('() => document.getElementById("theKq").textContent')
            _, L1 = tai_zip(pg)
            giong = all(L1.get(ma + d) == T[ma + d] for d in ('.sprite.json', '.thuong.sprite.json')) and len(L1) == 2
            dat('%s: lô lẻ %s (%s) ra 2 tệp GIỐNG TỪNG BYTE tệp của lô gộp' % (ma, nhan, the), giong and the == 'ĐẠT')
    dat('Rời lô gộp: ô "Số màu" không còn mục "Theo từng dải"', moi.evaluate('() => !document.querySelector("#soMau option[value=rieng]") && document.getElementById("soMau").value') == '16')

    # ảnh tham chiếu lẻ của chính trang (lửa phóng 29 lần thay vì 23): số đo thêm, không phải tiêu chí
    tc_lua = moi.evaluate('() => TC["lua-lo"][0].url'); t_lua = tu_url(tc_lua).convert('RGB'); p_lua = dung_luoi([ImageOps.mirror(cat_o(t_lua, 3, 1, i)) for i in range(3)], 3, 1, xanh, os.path.join(TMP, 'tc-lua.png'))
    dua_anh(moi, p_lua); _, L2 = tai_zip(moi)
    SO['lua_lo_anh_phong_29_giong_byte'] = L2.get('hu-lang-lua-lo.sprite.json') == T['hu-lang-lua-lo.sprite.json']
    i1, i2 = [tu_url(json.loads(z['hu-lang-lua-lo.sprite.json'])['tam']).convert('RGBA') for z in (T, L2)]
    SO['lua_lo_anh_phong_29_so_diem_khac'] = sum(1 for p, q in zip(list(i1.getdata()), list(i2.getdata())) if p != q) if i1.size == i2.size else -1

    # 4) xem thử trong làng từ MỘT tấm
    chon_lo(moi, GOP); dua_anh(moi, m_gop); moi.wait_for_timeout(900)
    xem = moi.evaluate('() => ({ hu: Object.keys(GAME.fxAnh.ds).sort(), san: ["hu-lang-khung-cui", "hu-lang-lua-lo"].every((m) => GAME.fxAnh.co(m)), nut: [...document.querySelectorAll("#nutGan button")].map((b) => b.textContent), b4: !document.getElementById("buoc4").hidden })')
    dat('Xem thử: game xem thử nhận cả 2 dải từ một tấm', xem['san'] and xem['b4'], ', '.join(xem['hu']))
    dat('Xem thử: có nút xem gần cho cả hai hình', xem['nut'] == ['Khung cửi', 'Lửa lò rèn'], ', '.join(xem['nut']))
    gan = {}
    moi.evaluate('() => { performance.now = () => 1000; }')  # đứng yên một nhịp để ảnh và hình code được so ở CÙNG một khung hình
    for i, ten in enumerate(('khung-cui', 'lua-lo')):
        moi.locator('#nutGan button').nth(i).click(); moi.wait_for_timeout(300)
        moi.evaluate('() => { XEM_NGAY = true; SO_CODE = false; veXem(); }'); anh = cat_cv(moi, '#cvGan')
        moi.evaluate('() => { SO_CODE = true; veXem(); }'); code = cat_cv(moi, '#cvGan')
        moi.evaluate('() => { SO_CODE = false; veXem(); }')
        gan[ten] = (anh, code)
        khac = sum(1 for p, q in zip(anh.getdata(), code.getdata()) if p != q)
        dat('Xem thử: %s trong làng dùng ẢNH (khác hình code, vì ảnh mẫu đã lật ngang)' % ten, khac > 0, '%d điểm ảnh khác hình code' % khac)
    moi.evaluate('() => { XEM_NGAY = false; veXem(); }'); lang = cat_cv(moi, '#cvLang')

    # ca một hàng hỏng: thiếu khung 2 của lửa → vẫn tải được khung cửi, giống hệt
    dua_anh(moi, m_hong)
    h = moi.evaluate('() => ({ the: document.getElementById("theKq").textContent, dai: DAIS.map((q) => !!q.dai), nut: document.getElementById("nutTaiZip").textContent, tat: document.getElementById("nutTaiZip").disabled })')
    _, T2 = tai_zip(moi)
    dat('Ca hỏng (thiếu 1 khung lửa): báo CÓ LỖI, vẫn tải được riêng khung cửi và tệp giống hệt', h['the'] == 'CÓ LỖI' and h['dai'] == [True, False] and not h['tat'] and sorted(T2) == can[:2] and all(T2[n] == T[n] for n in T2), h['nut'])
    xem2 = moi.evaluate('() => [GAME.fxAnh.co("hu-lang-khung-cui"), GAME.fxAnh.co("hu-lang-lua-lo")]')
    dat('Ca hỏng: xem thử giữ khung cửi, lửa lò về hình code', xem2 == [True, False], str(xem2))

    # trang không tràn ngang ở bề rộng điện thoại
    chon_lo(moi, GOP); dua_anh(moi, m_gop)
    tran = moi.evaluate('() => document.documentElement.scrollWidth - window.innerWidth')
    dat('Trang không tràn ngang ở bề rộng 390', tran <= 0, 'thừa %d' % tran)
    dat('Không có lỗi JavaScript ở cả hai trang', not errs, '; '.join(errs[:3]))
    br.close()

# 5) ảnh kiểm
f = ImageFont.truetype(FONT, 22) if os.path.exists(FONT) else None
b3 = Image.open(os.path.join(TMP, 'buoc3.png')).convert('RGB'); b3 = b3.resize((b3.size[0] * 2 // 3, b3.size[1] * 2 // 3))
mau = Image.open(m_gop).resize((750, 500), Image.NEAREST)
d_cui = Image.open(os.path.join(TMP, 'hu-lang-khung-cui.png')).convert('RGBA'); d_lua = Image.open(os.path.join(TMP, 'hu-lang-lua-lo.png')).convert('RGBA')
cot1 = 790; W = cot1 + b3.size[0] + 20
H = max(40 + 500 + 50 + 44 * 4 + 50 + 30 * 6 + 50 + 480 * 2 + 60, b3.size[1] + 60)
A = Image.new('RGB', (W, H + 330), (24, 18, 12)); D = ImageDraw.Draw(A)
chu = lambda x, y, t: D.text((x, y), t, fill=(246, 220, 146), font=f)
y = 10; chu(10, y, '1. Ảnh mẫu máy dựng: 1 tấm, 2 hàng × 3 khung'); y += 34
A.paste(mau, (10, y)); y += 510
chu(10, y, '2. Tệp ra: hu-lang-khung-cui 168×44 (phóng 4 lần)'); y += 34
t = Image.new('RGB', d_cui.size, (60, 50, 40)); t.paste(d_cui, (0, 0), d_cui); A.paste(t.resize((168 * 4, 44 * 4), Image.NEAREST), (10, y)); y += 44 * 4 + 12
chu(10, y, '   hu-lang-lua-lo 72×30 (phóng 6 lần)'); y += 34
t = Image.new('RGB', d_lua.size, (60, 50, 40)); t.paste(d_lua, (0, 0), d_lua); A.paste(t.resize((72 * 6, 30 * 6), Image.NEAREST), (10, y)); y += 30 * 6 + 12
chu(10, y, '3. Xem thử trong làng: trái = ảnh từ tấm gộp, phải = code cũ'); y += 34
for ten in ('khung-cui', 'lua-lo'):
    for k, im in enumerate(gan[ten]): A.paste(im.resize((360, 240), Image.NEAREST), (10 + k * 372, y))
    y += 250
chu(cot1, 10, '4. Bước 3 của trang (điện thoại)'); A.paste(b3, (cot1, 44))
yy = max(y, b3.size[1] + 60); chu(10, yy, '5. Cả làng lúc chạng vạng (khung cửi trước nhà thợ may, lửa trong lò rèn)'); A.paste(lang.crop((720, 120, 1440, 400)).resize((W - 20, int((W - 20) * 280 / 720)), Image.NEAREST).crop((0, 0, W - 20, 290)), (10, yy + 34))
A.crop((0, 0, W, yy + 34 + 300)).save(os.path.join(HERE, 'anh-kiem.png'))

SO['kiem'] = [{'ten': t, 'dat': ok, 'ghi': g} for t, ok, g in KQ]
SO['tong'] = '%d/%d' % (sum(1 for k in KQ if k[1]), len(KQ))
json.dump(SO, open(os.path.join(HERE, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('\nTỔNG: %s mục đạt · thư mục tạm %s' % (SO['tong'], TMP))
sys.exit(0 if all(k[1] for k in KQ) else 1)
