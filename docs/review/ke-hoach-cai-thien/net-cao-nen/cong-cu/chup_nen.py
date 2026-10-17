"""NÉT CAO — NỀN: chụp nền phòng 4 vùng (thường + phòng trùm) và làng bằng lệnh (headless, KHÔNG chơi thử).
  python3 chup_nen.py <thư mục ra> [đuôi url, vd '&netcao=3'] [tệp html hoặc địa chỉ http (bản web: http://127.0.0.1:8781/linh-khi-nhe.html), mặc định game/dist/linh-khi.html]
Ra: <ra>/<cảnh>-the.png  (canvas thế giới, điểm ảnh thật)
    <ra>/<cảnh>-nen.png  (canvas nền phòng dựng sẵn — để so điểm ảnh mặc định trước / sau)
    <ra>/<cảnh>-m844.png (ảnh màn 844×390, dpr 3)
    <ra>/so-lieu.json   (cỡ canvas, G.NET, lỗi JS)
  So mặc định trước / sau: dùng <cảnh>-nen.png (nền dựng sẵn, cố định). Ảnh -the / -m844 có hạt bay, lửa… chạy theo giờ thật nên mỗi lần chụp khác vài điểm."""
import base64, json, os, sys, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game')
OUT = os.path.abspath(sys.argv[1]); os.makedirs(OUT, exist_ok=True)
CO = sys.argv[2] if len(sys.argv) > 2 else ''
HTML = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else os.path.join(GAME, 'dist', 'linh-khi.html')
URL = (HTML if HTML.startswith('http') else 'file://' + os.path.abspath(HTML)) + '?cloud=0' + CO
CANH = [('rung', 0, 3, False), ('rung-trum', 0, 5, True), ('bien', 1, 3, False), ('bien-trum', 1, 5, True),
        ('lau', 2, 3, False), ('lau-trum', 2, 5, True), ('song', 3, 3, False), ('song-trum', 3, 5, True), ('song-thuong-luong', 3, 4, 'giu')]  # 'giu': giữ trùm (Thuồng Luồng, sân riêng)


def luu(url, p):
    open(p, 'wb').write(base64.b64decode(url.split(',', 1)[1]))


def main():
    loi = []; so = {'url': URL, 'canh': {}}
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=3)
        pg.on('pageerror', lambda e: loi.append(str(e)[:300]))
        pg.goto(URL)
        pg.wait_for_function('window.G && G.scene', timeout=120000)
        for f in ('setup.js', 'au_lib.js'):
            pg.add_script_tag(path=os.path.join(GAME, 'tests', f))
        time.sleep(8)
        for ten, r, seed, trum in CANH:
            # bản web: ảnh của vùng tải khi vào vùng (G.startStage chờ ảnh) → vào vùng một lần, chờ tới khi có phòng
            pg.evaluate("(r) => { AU.live(true); G.testSave({ lvl: 10 }); G.save.sound = false; G.startStage(r, 0, 0, { kind: 'A', seed: 3 }); }", r)
            pg.wait_for_function("() => G.getRun && G.getRun() && G.getRun().W", timeout=120000)
            time.sleep(2)
            pg.evaluate('() => AU.live(false)')
            for lan in range(3):  # lần đầu ảnh của vùng có thể còn đang tải lười: dựng lại vài lần
                kq = pg.evaluate("""([r, seed, trum]) => {
                  const o = AU.room({ region: r, seed, stage: seed % 5, big: !!trum, keepBoss: trum === 'giu' });
                  const S = G.getRun(); S.fade = 0; S.trans = null; o.W.ents = []; if (o.W.boss) o.W.boss.cd = 1e9;
                  const P = o.P; P.x = o.W.geo.fx0 + 30; P.y = o.W.geo.fy1 - 20;
                  AU.run(3, true);
                  const room = G.roomArt.get(o.W);
                  return { net: G.NET, the: [G.wx.canvas.width, G.wx.canvas.height], nen: [room.base.width, room.base.height] };
                }""", [r, seed, trum])
                time.sleep(1.5)
            kq['nen_url'] = None
            luu(pg.evaluate("() => G.roomArt.get(G.getWorld()).base.toDataURL()"), os.path.join(OUT, ten + '-nen.png'))
            luu(pg.evaluate("() => document.getElementById('world').toDataURL()"), os.path.join(OUT, ten + '-the.png'))
            pg.screenshot(path=os.path.join(OUT, ten + '-m844.png'))
            kq.pop('nen_url'); so['canh'][ten] = kq
            print(ten, kq, flush=True)
        # làng: vẽ thẳng cảnh làng ở vài chỗ (không đi bằng tay)
        for i, x in enumerate((240, 480, 700)):
            url = pg.evaluate("""(x) => { const VS = G.villageScene, S = VS.state; S.x = x; S.y = 200; S.face = 1;
                S.cam = G.clamp(x - 240, 0, VS.W - 480); for (const w of S.wp || []) { w.x = -999; w.y = -999; }
                VS.drawWorld({}); return document.getElementById('world').toDataURL(); }""", x)
            luu(url, os.path.join(OUT, 'lang-%d-the.png' % i))
        so['net'] = pg.evaluate('() => G.NET')
        b.close()
    so['loi_js'] = loi
    json.dump(so, open(os.path.join(OUT, 'so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('lỗi JS:', len(loi), loi[:3])


if __name__ == '__main__':
    main()
