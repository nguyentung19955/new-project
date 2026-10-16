#!/usr/bin/env python3
"""ẢNH SOÁT TRƯỚC / SAU (ve-tay-8-gop-giao-dien, 16/10) — Chromium không màn hình, KHÔNG chơi thử.

Mở bản một tệp (TRƯỚC: tệp html đưa vào; SAU: game/dist/linh-khi.html), dừng vòng lặp khung hình, dựng màn bằng bản lưu thử
(dùng lại CANH_JS / INIT của can-chu-khung/cong-cu/do-can-chu.py), vẽ một khung rồi chụp. Mỗi màn ghép TRƯỚC | SAU (hàng VI, hàng EN
cho thẻ phúc lành) vào thư mục ra.
  python3 chup-soat.py <truoc.html> <thư mục ra>
"""
import importlib.util, os, sys, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
sp = importlib.util.spec_from_file_location('dcc', os.path.join(REPO, 'docs/review/ke-hoach-cai-thien/can-chu-khung/cong-cu/do-can-chu.py'))
sys.argv = [sys.argv[0]] + sys.argv[1:]
TRUOC, RA = sys.argv[1], sys.argv[2]
sys_argv = list(sys.argv); sys.argv = [sys.argv[0], '/tmp/khong-dung']
D = importlib.util.module_from_spec(sp); sp.loader.exec_module(D)
sys.argv = sys_argv
SAU = os.path.join(REPO, 'game', 'dist', 'linh-khi.html')
os.makedirs(RA, exist_ok=True)

PL = "__canh.phucLanh(); { const S = G.getRun(); S.pl.opts = %s; S.mode = 'phuclanh'; }"
# (tên, js dựng, vùng cắt [x, y, w, h] theo điểm game hoặc None = cả màn, ngôn ngữ)
MAN = [
    ('chao-bia-gach', "__canh.chao()", [120, 30, 240, 90], ['vi']),
    ('lang-dai-mat', "__canh.lang()", [80, 10, 320, 50], ['vi']),
    ('ban-do-vung', "__canh.lang(); G.villageApi.V.tab = 'map'", None, ['vi']),
    ('cu-do-ky-nang', "__canh.bang('do', (V) => { V.tab = 'skill'; V.dtab = 'skill'; })", None, ['vi']),
    ('cu-do-chuong', "__canh.bang('do', (V) => { V.tab = 'chuong'; V.dtab = 'chuong'; })", None, ['vi']),
    ('phuc-lanh-nguoi-moi', "__canh.phucLanh()", None, ['vi', 'en']),
    ('phuc-lanh-1', PL % "['guom', 'ngua', 'than']", None, ['vi', 'en']),
    ('phuc-lanh-2', PL % "['no', 'nui', 'hoa']", None, ['vi', 'en']),
    ('phuc-lanh-3', PL % "['tre', 'song', 'noc']", None, ['vi', 'en']),
    ('phuc-lanh-4', PL % "['riu', 'ca', 'suong']", None, ['vi', 'en']),
    ('phuc-lanh-5', PL % "['trong', 'ngan', 'than']", None, ['vi', 'en']),
    ('rung-loi-mon', "__canh.tran(0)", None, ['vi']),
    ('lau-dai-tham', "__canh.tran(2)", None, ['vi']),
    ('lau-dai-tham-2', "__canh.phong('merchant'); G.startStage(2, 1, 0, { kind: 'A', seed: 777 }); G.getRun().fade = 0; G.testGoto('fight'); G.getWorld().waves = []; G.getWorld().spawns = []", None, ['vi']),
]
VW, VH = 960, 540


def chup(b, tep, lang):
    ctx = b.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=1)
    ctx.add_init_script(D.INIT)
    ctx.add_init_script("try{localStorage.clear();localStorage.setItem('linhkhi_lang','%s')}catch(e){}" % lang)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=D.CSS_PHONG))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg = ctx.new_page()
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)[:200]))
    pg.goto('file://' + tep + '?cloud=0')
    pg.wait_for_function('window.G && G.scene && G.theme && G.ui', timeout=90000)
    pg.evaluate("document.fonts.ready"); time.sleep(0.8)
    pg.evaluate("() => { window.__tinh = true; }"); time.sleep(0.2)
    pg.add_script_tag(path=os.path.join(REPO, 'game', 'tests', 'setup.js'))
    pg.evaluate(D.CANH_JS)
    ra = {}
    for ten, js, cat, langs in MAN:
        if lang not in langs: continue
        try:
            pg.evaluate('() => { if (G.truyen) G.truyen.dang = null; G.click = null; ' + js + '; if (G.ngonNgu && G.LANG !== "%s") G.ngonNgu.dat("%s", false); G.sim(2); }' % (lang, lang))
            if ten.startswith('lang'):  # chấm "có mới" trên vài khuôn mặt
                pg.evaluate("() => { const S = G.villageScene && G.villageScene.state; if (S) { S.news = { ren: true, do: true, may: true }; S.newsT = 99; } }")
            pg.evaluate('() => { __canh.ve(); __canh.ve(); }')
        except Exception as e:
            loi.append('%s: %s' % (ten, str(e)[:200])); continue
        p = os.path.join(RA, '_tam.png'); pg.screenshot(path=p)
        im = Image.open(p).convert('RGB')
        geo = pg.evaluate("() => { const f = document.getElementById('fit').getBoundingClientRect(); return { fx: f.left, fy: f.top, ox: G.ox, oy: G.oy, sc: G.scale }; }")
        if cat:
            sc = geo['sc']; x0 = geo['fx'] + geo['ox'] + cat[0] * sc; y0 = geo['fy'] + geo['oy'] + cat[1] * sc
            im = im.crop((int(x0), int(y0), int(x0 + cat[2] * sc), int(y0 + cat[3] * sc)))
            im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
        ra[ten] = im
        os.remove(p)
    ctx.close()
    return ra, loi


def nhan(im, s):
    d = ImageDraw.Draw(im)
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    except Exception: f = ImageFont.load_default()
    d.rectangle([0, 0, 8 + len(s) * 9, 20], fill=(0, 0, 0)); d.text((4, 2), s, fill=(255, 230, 150), font=f)
    return im


def main():
    tat, loi_all = {}, []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for nh, tep in (('TRUOC', TRUOC), ('SAU', SAU)):
            for lang in ('vi', 'en'):
                r, loi = chup(b, tep, lang)
                tat[(nh, lang)] = r; loi_all += ['%s %s %s' % (nh, lang, e) for e in loi]
        b.close()
    for ten, js, cat, langs in MAN:
        hang = []
        for lang in langs:
            a, c = tat[('TRUOC', lang)].get(ten), tat[('SAU', lang)].get(ten)
            if a and c: hang.append((nhan(a.copy(), 'TRUOC · ' + lang.upper()), nhan(c.copy(), 'SAU · ' + lang.upper())))
        if not hang: continue
        W, H = hang[0][0].size
        o = Image.new('RGB', (W * 2 + 6, (H + 6) * len(hang) - 6), (30, 30, 30))
        for j, (a, c) in enumerate(hang):
            o.paste(a, (0, j * (H + 6))); o.paste(c, (W + 6, j * (H + 6)))
        o.save(os.path.join(RA, ten + '.jpg'), quality=85, optimize=True)
    print('lỗi trang:', len(loi_all))
    for e in loi_all: print('  ', e)


if __name__ == '__main__':
    main()
