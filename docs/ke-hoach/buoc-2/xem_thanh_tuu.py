#!/usr/bin/env python3
"""Ảnh soát TĨNH xem-thanh-tuu.png (Bước 2 — Phiên C: Thành tựu + Danh hiệu). KHÔNG chơi thử game.

Mở game/dist/linh-khi.html (?cloud=0) trong Chromium không màn hình, dừng vòng lặp khung hình, dựng bản lưu thử rồi vẽ ĐÚNG MỘT khung hình
cho từng màn, chụp lại; hai hàng: tiếng Việt, tiếng Anh. Bốn màn:
  1. Ông Từ, thẻ Thành tựu (lưới huy hiệu, ô chi tiết của một huy hiệu chờ nhận, danh hiệu đang đeo)
  2. Ông Từ, Đổi danh hiệu (danh sách danh hiệu đã có)
  3. Hành trang, thẻ Nhân vật (dải danh hiệu dưới hình Cu Tí)
  4. Làng (danh hiệu trên đầu Cu Tí)
Phông: máy thử không tải Google Fonts nên "Be Vietnam Pro" thay bằng Inter (gần cỡ).
Kèm đếm chữ tràn lòng khung (T.chuDo: số lần phải cắt "…" / chữ thấp hơn khung) — in ra màn hình.

  python3 game/build.py && python3 docs/ke-hoach/buoc-2/xem_thanh_tuu.py
"""
import os, time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
W, H = 720, 405
CSS = "@font-face{font-family:'Be Vietnam Pro';font-weight:500;src:local('Inter Medium'),local('Inter-Medium')}@font-face{font-family:'Be Vietnam Pro';font-weight:700;src:local('Inter Bold'),local('Inter-Bold')}"
DUNG = r"""
(() => {
  window.__tinh = true;
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 22, tier: 1, sharpen: 10, branch: 'fire', marksMoi: G.MARKS[2] });
  const s = G.save;
  for (let i = 0; i < 5; i++) s.stars['0-' + i] = 3;
  s.stars['1-0'] = 3; s.stars['1-1'] = 2; s.stars['1-2'] = 3;
  s.heroes.hunter.unlocked = true; if (!s.zed || typeof s.zed !== 'object') s.zed = {}; s.zed.hoc = Object.assign({}, s.zed.hoc, { hunter: 1 });
  G.suKien.suaBanLuu(s);
  s.tt.dem = { quai: 412, tinhAnh: 23, khongBinh: 6, khacChe: 4 };
  s.so = { v: 1, q: {}, vung: { 0: 1 } };
  const TT = G.thanhTuu; TT.kiem(s);
  TT.nhan('buocDau'); TT.nhan('quai100'); TT.nhan('cuuTeo'); TT.deo('cuuBan');
  s.sound = false; G.setScene(G.Village); G.sim && G.sim(1);
  return TT.choNhan(s);
})()
"""
CANH = [
    ('Ông Từ: thẻ Thành tựu', "VA.open('tu'); V.tab = 'thanhTuu'; V.ttab = 'thanhTuu'; V.ttDoi = false; V.ttSel = 'sao15';"),
    ('Ông Từ: Đổi danh hiệu', "VA.open('tu'); V.tab = 'thanhTuu'; V.ttDoi = true;"),
    ('Hành trang: Nhân vật', "VA.goHub(); V.tab = 'bag'; if (G.hanhTrang.reset) G.hanhTrang.reset();"),
    ('Làng: danh hiệu trên đầu', "VA.goHub(); const S = G.villageScene.state; S.x = 300; S.y = 170; S.cam = 120; S.hintT = 0; S.msgT = 0;"),
]


def chup(b, lang):
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1)
    ctx.add_init_script("(() => { const raf = window.requestAnimationFrame.bind(window); window.__tinh = false; window.requestAnimationFrame = (cb) => (window.__tinh ? 0 : raf(cb)); })()")
    ctx.add_init_script("try{localStorage.setItem('linhkhi_lang','%s')}catch(e){}" % lang)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg = ctx.new_page()
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)[:300]))
    pg.goto('file://' + os.path.join(GAME, 'dist', 'linh-khi.html') + '?cloud=0')
    pg.wait_for_function('window.G && G.scene && G.theme && G.ui && G.thanhTuu', timeout=90000)
    pg.evaluate("document.fonts.ready")
    time.sleep(2.5)  # ảnh gd-* tải xong
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    cho = pg.evaluate(DUNG)
    pg.evaluate("l => { if (G.ngonNgu && G.LANG !== l) G.ngonNgu.dat(l, false); }", lang)
    out = []
    for ten, js in CANH:
        pg.evaluate("() => { const VA = G.villageApi, V = VA.V; G.click = null; " + js + " }")
        time.sleep(0.4)
        for _ in range(2):  # vẽ hai lần: lần đầu kích tải ảnh nếu thiếu
            pg.evaluate("() => { G.T0 = G.time = 3.2; G.click = null; G.ui.begin(); G.scene.draw(); if (G.theme.endFrame) G.theme.endFrame(); }")
            time.sleep(0.3)
        p = os.path.join('/tmp', 'xem-tt-%s-%d.png' % (lang, len(out)))
        pg.screenshot(path=p)
        out.append((ten, p))
    do = pg.evaluate("() => Object.assign({}, G.theme.chuDo)")
    ctx.close()
    return out, loi, cho, do


def main():
    hang = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for lang in ('vi', 'en'):
            out, loi, cho, do = chup(b, lang)
            print(lang, 'chờ nhận:', cho, '| chữ cắt "…":', do.get('cat'), '| chữ thấp hơn khung:', do.get('thap'), '| lỗi trang:', loi[:3])
            hang.append((lang, out))
        b.close()
    try:
        fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    except Exception:
        fnt = ImageFont.load_default()
    top, left = 30, 44
    im = Image.new('RGB', (left + W * len(CANH), top + H * len(hang)), (24, 28, 34))
    d = ImageDraw.Draw(im)
    for j, (ten, _) in enumerate(hang[0][1]):
        d.text((left + j * W + 8, 6), ten, fill=(240, 230, 200), font=fnt)
    for i, (lang, out) in enumerate(hang):
        d.text((8, top + i * H + H // 2 - 8), lang.upper(), fill=(240, 230, 200), font=fnt)
        for j, (_, pth) in enumerate(out):
            im.paste(Image.open(pth).convert('RGB'), (left + j * W, top + i * H))
    dst = os.path.join(HERE, 'xem-thanh-tuu.png')
    im.save(dst, optimize=True)
    print('xong:', dst, im.size)


if __name__ == '__main__':
    main()
