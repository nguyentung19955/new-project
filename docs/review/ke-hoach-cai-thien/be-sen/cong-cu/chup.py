"""Ảnh soát tĩnh (KHÔNG chơi thử): mở dist/linh-khi-nhe.html?cloud=0 bằng Chromium không giao diện, vào làng, đặt Cu Tí ở bến đò,
chạm vào Bé Sen (đúng đường chạm của game: sự kiện chuột trên canvas) để hiện câu thoại, chụp VI rồi EN.
Cần chạy trước: python3 game/build.py --hai-tep. python3 chup.py <thư mục ra>"""
import sys, os, subprocess, time, json
from playwright.sync_api import sync_playwright
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
RA = sys.argv[1]; os.makedirs(RA, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8766', '-d', os.path.join(DAY, 'game/dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
loi = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome' if os.path.exists('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') else None)
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.goto('http://localhost:8766/linh-khi-nhe.html?cloud=0')
        pg.wait_for_function('window.G && G.Village && G.villageScene && G.spriteCustom', timeout=60000)
        pg.wait_for_timeout(1500)
        pg.evaluate("G.truyen.bat = () => false; G.setScene(G.Village)")
        pg.wait_for_function("G.spriteCustom.get('nl-sen') && G.spriteCustom.get('nl-lai')", timeout=60000)
        # bến đò lúc chưa ai nói: Cu Tí đứng ở đường đất, Bé Sen ngồi cạnh bố
        pg.evaluate("() => { const S = G.villageScene.state; S.x = 560; S.y = 176; S.face = 1; S.cam = 240; S.path = null; S.goal = null; S.bubble = null; }")
        pg.wait_for_timeout(400)
        pg.screenshot(path=os.path.join(RA, 'ben-trong.png'))
        for lang, cau in (('vi', [0, 3]), ('en', [2, 3])):
            pg.evaluate("l => G.ngonNgu.dat(l)", lang)
            for i in cau:
                # đặt Cu Tí đứng dưới bến, màn hình nhìn bến đò; chạm vào Bé Sen (toạ độ màn hình 480 x 270)
                pg.evaluate("i => { const S = G.villageScene.state; S.x = 616; S.y = 172; S.face = 1; S.cam = 240; S.path = null; S.goal = null; S.bubble = null; S.senI = (i + 3) % 4; }", i)
                pg.wait_for_timeout(200)
                xy = pg.evaluate("() => { const VS = G.villageScene, S = VS.state, cv = document.querySelector('canvas'), r = cv.getBoundingClientRect();"
                                 " const sx = VS.SEN.x - S.cam, sy = VS.SEN.y - 10 + VS.OY; return [r.left + sx / 480 * r.width, r.top + sy / 270 * r.height]; }")
                pg.mouse.click(xy[0], xy[1])
                pg.wait_for_timeout(500)
                pg.screenshot(path=os.path.join(RA, 'ben-%s-%d.png' % (lang, i)))
                st = pg.evaluate("() => { const S = G.villageScene.state; return { bubble: S.bubble && S.bubble.s, x: S.x, y: S.y }; }")
                print(lang, i, st)
        pg.evaluate("G.ngonNgu.dat('vi')")
        b.close()
finally:
    srv.terminate()
print('lỗi trang:', loi)
