"""Phiên Phòng A3 (đồ trang trí phòng bằng ảnh AI): bài kiểm nhanh. Chạy từ thư mục gốc repo, sau khi `python3 game/build.py`.
  python3 docs/review/phong-a3/kiem/kiem.py sosanh <thư mục game TRƯỚC phiên>   không có tệp ảnh → so từng điểm ảnh với bản trước (phải = 0)
  python3 docs/review/phong-a3/kiem/kiem.py thu                                 trang Tách Phòng với 4 tấm ảnh lưới MẪU TỰ DỰNG → nạp tạm vào game → chụp ảnh kiểm
Ảnh mẫu là hình khối máy tự vẽ, chỉ nằm trong trình duyệt thử và thư mục tạm; KHÔNG ghi gì vào game/art/custom."""
import base64, functools, http.server, io, json, os, sys, tempfile, threading
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
RA = os.path.join(HERE, '..', 'anh-kiem.png')
LO_TT = ['tt-rung', 'tt-bien', 'tt-lau', 'lua-duoc']


def png(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')


def may_chu(root):
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- so sánh trước / sau khi không có tệp ----------
JS_SO = r"""
() => {
  const RA = G.roomArt, out = {};
  const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; const c = cv.getContext('2d');
  const cu = { gw: G.getWorld, t: G.time };
  const h = (s) => { let a = 2166136261; for (let i = 0; i < s.length; i++) { a ^= s.charCodeAt(i); a = Math.imul(a, 16777619); } return (a >>> 0).toString(16) + ':' + s.length; };
  const cuaBo = [['up'], ['up', 'down', 'left', 'right'], ['down', 'left'], ['left', 'right', 'up']];
  let n = 0;
  for (let region = 0; region < 3; region++) for (let variant = 0; variant < 3; variant++) for (const big of [false, true]) for (let seed = 1; seed <= 6; seed++) {
    const loai = ['fight', 'fountain', 'start', 'elite', 'boss', 'curse'][(seed + variant) % 6], doors = cuaBo[(seed + region) % 4], geo = RA.geo(big);
    const W = { uid: 'ss' + [region, variant, big, seed].join('-'), region, type: loai, seed: seed * 7919 + region * 31 + variant, variant, geo,
      doors: doors.map((dir, i) => ({ dir, open: (i + seed) % 2 === 0, boss: seed === 3, gate: seed === 3 })), P: { x: geo.fx0 + 20, y: geo.fy1 - 8 }, ents: [], boss: null, props: [], zones: [], projs: [], spawns: [] };
    Object.assign(W, geo.bounds);
    G.getWorld = () => W;
    const key = W.uid, room = RA.get(W);
    out[key + ':nen'] = h(room.base.toDataURL()); out[key + ':truoc'] = h(room.fore.toDataURL()); out[key + ':tien-canh'] = h(room.fg.toDataURL());
    for (const t of [0.37, 5.21]) { // cả lớp sống (lửa đuốc, nến) và tiền cảnh
      G.time = t; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 480, 270);
      G.art.bg(c, region, W.seed, 0); G.art.prop(c, { type: 'roomFore', x: 0, y: 9999 });
      out[key + ':song' + t] = h(cv.toDataURL());
    }
    n++;
  }
  G.getWorld = cu.gw; G.time = cu.t;
  return { n, out, err: G.art.roomErr ? String(G.art.roomErr) : null };
}
"""


def trang_game(b, d):
    pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.errs = []
    pg.on('pageerror', lambda e: pg.errs.append(str(e)))
    pg.goto('file://' + d + '/index.html?cloud=0')
    pg.wait_for_function('window.G && G.roomArt && G.art && G.spriteCustom')
    pg.wait_for_timeout(1200)
    return pg


def sosanh(truoc):
    with sync_playwright() as p:
        b = p.chromium.launch()
        kq = []
        for d in (os.path.abspath(truoc), os.path.join(REPO, 'game')):
            pg = trang_game(b, d); kq.append((pg.evaluate(JS_SO), pg.errs)); pg.close()
        (a, ea), (z, ez) = kq
        khac = [k for k in a['out'] if a['out'][k] != z['out'].get(k)]
        print('Số phòng: %d · số ảnh đem so: %d · số ảnh KHÁC: %d %s · lỗi: %s %s %s %s' % (a['n'], len(a['out']), len(khac), khac[:6], a['err'], z['err'], ea[:2], ez[:2]))
        b.close()
        return not khac


# ---------- ảnh lưới mẫu tự dựng ----------
def hinh_mau(d, x0, y0, x1, y1, ma, mau):
    V = '#14182e'
    sang = tuple(min(255, int(v + (255 - v) * 0.4)) for v in bytes.fromhex(mau[1:]))
    w, h = x1 - x0, y1 - y0
    if 'nhu-da' in ma:  # mũi nhọn chĩa xuống
        d.polygon([(x0, y0), (x1, y0), ((x0 + x1) // 2, y1)], fill=mau, outline=V, width=5)
        if 'nhu-da-4' in ma: d.polygon([(x0 + w * 0.55, y0), (x1, y0), (x0 + w * 0.8, y0 + h * 0.6)], fill=sang, outline=V, width=5)
    elif 'tinh-the' in ma:  # ba mũi nhọn chĩa lên
        for fx, fh, c in ((0.0, 0.62, mau), (0.5, 0.55, mau), (0.2, 1.0, sang)):
            d.polygon([(x0 + w * fx, y1), (x0 + w * (fx + 0.5), y1), (x0 + w * (fx + 0.25), y1 - h * fh)], fill=c, outline=V, width=5)
    elif any(k in ma for k in ('vung', 'tham-tron', 'dong-da', 'bui-qua', 'tan-la', 'nam', 'goc', 'co-thu', 'hoa')):
        d.ellipse([x0, y0, x1, y1], fill=mau, outline=V, width=5)
        d.ellipse([x0 + w * 0.2, y0 + h * 0.15, x0 + w * 0.55, y0 + h * 0.45], fill=sang)
    else:
        d.rectangle([x0, y0, x1, y1], fill=mau, outline=V, width=5)
        d.rectangle([x0 + 8, y0 + 8, x0 + max(12, w * 0.3), y1 - 8], fill=sang)
        if 'tien-canh' in ma:  # cụm cao ở mép ngoài, thấp dần vào trong (để thấy bên trái / bên phải)
            tr = 'trai' in ma
            d.polygon([(x0 if tr else x1, y0 - 2), (x1 if tr else x0, y0 - 2), (x1 if tr else x0, y0 + h * 0.55)], fill='#ff00ff')


def luoi_mau(lo, duong):
    """lo: mục LO của trang (id, cot, hang, ds[ma, w, h]); vẽ tấm lưới mẫu ra tệp PNG."""
    cot, hang, lua = lo['cot'], lo['hang'], lo['id'] == 'lua-duoc'
    O = 256 if not lua else 384
    W, H = cot * O, hang * (O if not lua else 640)
    oh = H // hang
    im = Image.new('RGB', (W, H), '#0000ff' if lua else '#ff00ff'); d = ImageDraw.Draw(im)
    for i in range(1, cot): d.line([(i * O, 0), (i * O, H)], fill='#201828', width=3)
    for j in range(1, hang): d.line([(0, j * oh), (W, j * oh)], fill='#201828', width=3)
    for i, m in enumerate(lo['ds']):
        cx, by = (i % cot) * O + O // 2, (i // cot) * oh + int(oh * 0.9)
        if lua:  # giọt lửa: 3 lớp màu, khung 2 cao hơn và ngả phải, khung 3 thấp hơn và ngả trái
            hh, dx = [(300, 0), (360, 26), (250, -26)][i]
            for k, c in ((1.0, '#a03409'), (0.82, '#eb7e14'), (0.6, '#ffc90e'), (0.36, '#feec86')):
                r = 90 * k
                d.polygon([(cx - r, by - r), (cx + r, by - r), (cx + dx * k, by - hh * k)], fill=c)
                d.ellipse([cx - r, by - 2 * r, cx + r, by], fill=c)
            continue
        s = O * 0.7 / max(m['w'], m['h'])
        w, h = max(14, m['w'] * s), max(14, m['h'] * s)
        hinh_mau(d, int(cx - w / 2), int(by - h), int(cx + w / 2), by, m['ma'], MAU.get(m['ma'].split('-', 3)[-1], MAU_NHOM[i % len(MAU_NHOM)]))
    im.save(duong)


MAU_NHOM = ['#79451d', '#2f5f34', '#c85a3a', '#58371e', '#4a5560', '#32b0e9', '#3d69cd', '#efe2d1', '#557521', '#8a7a6e', '#5c5b73', '#7a2a2a', '#3a4a6a', '#d8823a', '#4e2a32', '#69994a']
MAU = {'tien-canh-trai': '#16261c', 'tien-canh-phai': '#1c2c30', 'co-do': '#7a2a2a', 'co-xanh': '#3a4a6a', 'tham-tron': '#4e2a32', 'tham-vuong': '#5c3038', 'cot-da': '#6e5f58', 'duoc': '#5c5b73', 'nen': '#e8e0c8', 'chan-nen': '#cecdda',
       'tan-la': '#2f5f34', 'tan-la-2': '#3d6a2e', 'tan-la-3': '#557521', 'day-leo': '#557521', 'day-leo-2': '#3d6a2e', 'day-leo-3': '#69994a', 'nam-sang': '#9ad860', 'nam-sang-2': '#d0f8a0',
       'nhu-da': '#4a5560', 'nhu-da-2': '#5a6570', 'nhu-da-3': '#6a7580', 'nhu-da-4': '#3a4550', 'vung-nuoc': '#3d69cd', 'vung-sang': '#2a40a5', 'cua-so': '#d8823a', 'cua-so-kinh': '#4a7ab0', 'tuong-hiep-si': '#8a7a6e'}

# vẽ một phòng trong game thật (code game, bút nét gấp đôi): ttThu bày đủ 4 món góc phòng như phòng xem thử của công cụ
JS_PHONG = r"""
(ds) => {
  const RA = G.roomArt, out = [], cu = { gw: G.getWorld, t: G.time, net: G.NET, wx: G.wx };
  for (const [region, variant, kind, doors] of ds) {
    const geo = RA.geo(false);
    const W = { uid: 'a3' + [region, variant, kind].join('-') + ':' + Object.keys(G.spriteCustom.gd).length, region, type: 'fight', seed: 77 + region, variant, geo, ttThu: { decor: [0, 1, 2, 3], kind },
      doors: doors.map((dir) => ({ dir, open: true })), P: { x: 240, y: 150 }, ents: [], boss: null, props: [], zones: [], projs: [], spawns: [] };
    Object.assign(W, geo.bounds);
    const cv = document.createElement('canvas'); cv.width = 960; cv.height = 540; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.setTransform(2, 0, 0, 2, 0, 0);
    G.getWorld = () => W; G.NET = 2; G.wx = c; G.time = 1.3;
    G.art.bg(c, region, W.seed, 0); G.art.prop(c, { type: 'roomFore', x: 0, y: 9999 });
    const room = RA.get(W);
    out.push({ url: cv.toDataURL(), tt: room.ttNen.length, fg: room.fgCl.filter((q) => q.anh).length });
  }
  G.getWorld = cu.gw; G.time = cu.t; G.NET = cu.net; G.wx = cu.wx;
  return { out, err: G.art.roomErr ? String(G.art.roomErr.stack || G.art.roomErr) : null, errP: G.art.roomErrP ? String(G.art.roomErrP.stack) : null };
}
"""
PHONG = [[0, 0, 1, ['up', 'left']], [1, 0, 0, ['up', 'left']], [2, 0, 1, ['up', 'left']], [0, 2, 0, ['down']], [1, 2, 1, ['down']], [2, 2, 0, ['down']]]


def thu():
    tam = tempfile.mkdtemp(prefix='a3-', dir=os.environ.get('A3_TAM') or None)
    sv, goc = may_chu(REPO)
    ok = True
    with sync_playwright() as p:
        b = p.chromium.launch()
        # --- 1. trang công cụ, màn điện thoại rộng 390 ---
        pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(goc + '/tools/tach-phong/index.html'); pg.wait_for_function('typeof LO !== "undefined"')
        los = pg.evaluate('LO.map((l, i) => ({ i, id: l.id, ten: l.ten, cot: l.cot, hang: l.hang, ds: l.ds.map((m) => ({ ma: m.ma, w: m.w, h: m.h })) }))')
        tep, anh_ct, prompt = [], {}, {}
        for lo in [l for l in los if l['id'] in LO_TT]:
            pg.select_option('#chonLo', str(lo['i']))
            prompt[lo['id']] = pg.input_value('#oPrompt')
            f = os.path.join(tam, lo['id'] + '.png'); luoi_mau(lo, f)
            pg.set_input_files('#chonAnh', f)
            pg.wait_for_function('!document.getElementById("buoc3").hidden && KQ.length === L.ds.length')
            pg.wait_for_function('!!GAME', timeout=30000); pg.wait_for_timeout(500)
            r = pg.evaluate(r"""() => ({ kq: document.getElementById('theKq').textContent, du: KQ.filter(Boolean).length, loi: [...document.querySelectorAll('#dsKiem li.loi')].map((e) => e.textContent),
              co: L.ds.map((m, i) => KQ[i] ? m.ma.replace('gd-tt-', '') + ' ' + KQ[i].out.gw + '×' + KQ[i].out.gh + '/' + m.w + '×' + m.h : m.ma + ' THIẾU'),
              tep: L.dai ? (() => { const d = tepDai(); d.t.tam = d.cv.toDataURL(); return [d.t]; })() : L.ds.map((m, i) => KQ[i] ? phanTep(i, false) : null).filter(Boolean),
              cuon: document.documentElement.scrollWidth > window.innerWidth + 1, xem: document.getElementById('ttXem').textContent })""")
            print('%-9s %s · %d/%d hình · lỗi: %s · cuộn ngang: %s · %s' % (lo['id'], r['kq'], r['du'], len(lo['ds']), r['loi'], r['cuon'], r['xem']))
            print('   cỡ ra/khung:', '; '.join(r['co']))
            ok = ok and r['kq'] == 'ĐẠT' and r['du'] == len(lo['ds']) and not r['cuon'] and all(t.get('net') == 2 for t in r['tep'])
            tep += r['tep']
            anh = [png(pg.evaluate('document.getElementById("cvPhong").toDataURL()'))]
            pg.click('#nutDoiMau'); pg.wait_for_timeout(200); anh.append(png(pg.evaluate('document.getElementById("cvPhong").toDataURL()')))
            anh_ct[lo['id']] = anh
            if lo['id'] == 'tt-lau':
                pg.locator('#buoc3').screenshot(path=os.path.join(tam, 'buoc3.png'))
        # tải .zip của lô dải lửa: phải ra 1 tệp zip
        with pg.expect_download() as dl: pg.click('#nutTaiZip')
        print('tải lô lửa:', dl.value.suggested_filename)
        print('lỗi trang công cụ:', errs[:3]); ok = ok and not errs
        pg.close()
        json.dump(prompt, open(os.path.join(tam, 'prompt.json'), 'w'), ensure_ascii=False, indent=1)
        # --- 2. game thật: trước (code), nạp tạm tệp vừa tách, gỡ ra ---
        pg = trang_game(b, os.path.join(REPO, 'game'))
        truoc = pg.evaluate(JS_PHONG, PHONG)
        pg.evaluate("(ds) => { for (const t of ds) G.spriteCustom.add(t); }", tep)
        pg.wait_for_function("(n) => Object.keys(G.spriteCustom.gd).filter((k) => k.startsWith('gd-tt-') && G.spriteCustom.gd[k].ready).length === n && G.fxAnh.co('hu-lua-duoc')", arg=len(tep) - 1)
        sau = pg.evaluate(JS_PHONG, PHONG)
        print('game: lệnh vẽ ảnh mỗi phòng', [o['tt'] for o in sau['out']], '· cụm tiền cảnh bằng ảnh', [o['fg'] for o in sau['out']], '· lỗi', sau['err'], sau['errP'], pg.errs[:2])
        ok = ok and not sau['err'] and not sau['errP'] and not pg.errs and all(o['tt'] > 5 and o['fg'] == 2 for o in sau['out'])
        pg.evaluate("() => { for (const k of Object.keys(G.spriteCustom.gd)) if (k.startsWith('gd-tt-')) G.spriteCustom.remove(k); G.fxAnh.remove('hu-lua-duoc'); }")
        go = pg.evaluate(JS_PHONG, PHONG)
        print('gỡ ảnh ra: về y như cũ =', [a['url'] == z['url'] for a, z in zip(truoc['out'], go['out'])])
        ok = ok and all(a['url'] == z['url'] for a, z in zip(truoc['out'], go['out']))
        pg.close(); b.close()
    sv.shutdown()
    # --- 3. ghép ảnh kiểm ---
    cat = lambda im: im.crop((120, 0, 820, 540))
    T, S = [cat(png(o['url'])) for o in truoc['out']], [cat(png(o['url'])) for o in sau['out']]
    b3 = Image.open(os.path.join(tam, 'buoc3.png')).convert('RGB'); b3 = b3.resize((700, int(b3.height * 700 / b3.width)))
    xt = [a.resize((700, int(a.height * 700 / a.width))) for a in (anh_ct['tt-rung'][0], anh_ct['tt-bien'][0], anh_ct['tt-lau'][1])]
    H3 = max(b3.height, 1)
    ra = Image.new('RGB', (2100, 30 + 540 * 3 + 30 * 3 + max(x.height for x in xt) + 30 + min(H3, 900)), '#1a120a'); d = ImageDraw.Draw(ra)
    y = 6
    for ten, ds in (('1. Game, CHUA co tep (ve bang code nhu cu): Rung gia, Hang bien, Lau dai co', T[:3]), ('2. Game, nap tam lo MAU (hinh khoi may tu dung): phong 1', S[:3]), ('3. Game, lo MAU: phong 2 (diem nhan kia, tham vuong)', S[3:])):
        d.text((8, y), ten, fill='#f6dc92'); y += 24
        for i, im in enumerate(ds): ra.paste(im, (i * 700, y))
        y += 540 + 6
    d.text((8, y), '4. Trang cong cu, buoc 4 xem thu (3 lo) va buoc 3 (lo Lau dai co)', fill='#f6dc92'); y += 24
    for i, im in enumerate(xt): ra.paste(im, (i * 700, y))
    y += max(x.height for x in xt) + 6
    ra.paste(b3.crop((0, 0, 700, min(H3, 900))), (0, y))
    ra = ra.crop((0, 0, 2100, y + min(H3, 900)))
    ra = ra.resize((1400, round(ra.height * 1400 / 2100)), Image.LANCZOS).quantize(256, dither=Image.Dither.NONE)  # thu lại, giảm màu cho nhẹ repo
    ra.save(RA, optimize=True)
    print('Ảnh kiểm:', RA, ra.size, '· prompt:', os.path.join(tam, 'prompt.json'))
    print('KẾT QUẢ:', 'ĐẠT' if ok else 'CÓ LỖI')
    return ok


if __name__ == '__main__':
    viec = sys.argv[1] if len(sys.argv) > 1 else ''
    sys.exit(0 if (sosanh(sys.argv[2]) if viec == 'sosanh' else thu()) else 1)
