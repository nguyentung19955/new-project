"""Ảnh và GIF cho docs/xuong-sprite/: từng bước của Xưởng Sprite, trước/sau trong phòng game, GIF động tác.
Chạy: python3 tests/xuong_sprite_shots.py   (game/art/custom/ được trả về chỉ còn .gitkeep khi xong)
"""
import base64
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from xuong_sprite_ve import ve_bon_chan, ve_nguoi, ve_kiem, ve_mu, ve_xu  # noqa: E402

GAME = os.path.dirname(HERE)
REPO = os.path.dirname(GAME)
OUT = os.path.join(REPO, 'docs', 'xuong-sprite')
CUSTOM = os.path.join(GAME, 'art', 'custom')
TOOL = 'file://' + os.path.join(GAME, 'dist', 'xuong-sprite.html')
GAME_DIST = 'file://' + os.path.join(GAME, 'dist', 'linh-khi.html')


def build():
    subprocess.run([sys.executable, os.path.join(GAME, 'build.py')], check=True, capture_output=True)


def don():
    for n in os.listdir(CUSTOM):
        if n != '.gitkeep':
            os.remove(os.path.join(CUSTOM, n))


def shot(pg, name, clip=None):
    pg.screenshot(path=os.path.join(OUT, name), clip=clip)
    print('ảnh', name)


def gif_dong_tac(tep, name, nen=(23, 54, 58), k=4):
    """GIF ghép các động tác trong tấm sprite, phát lần lượt, phóng to k lần."""
    tam = Image.open(io.BytesIO(base64.b64decode(tep['tam'].split(',')[1]))).convert('RGBA')
    fw, fh = tep['khung_rong'], tep['khung_cao']
    frames, ms = [], []
    for ten in ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne']:
        a = tep['dong_tac'].get(ten)
        if not a:
            continue
        lap = 2 if a['lap'] else 1
        for _ in range(lap):
            for i in range(a['so']):
                f = tam.crop((i * fw, a['hang'] * fh, (i + 1) * fw, (a['hang'] + 1) * fh))
                if ten == 'die':
                    u = i / max(1, a['so'] - 1)
                    if u > 0.6:
                        al = f.getchannel('A').point(lambda v, q=1 - (u - 0.6) / 0.4: int(v * q))
                        f.putalpha(al)
                bg = Image.new('RGBA', (fw, fh), nen + (255,))
                bg.alpha_composite(f)
                frames.append(bg.resize((fw * k, fh * k), Image.NEAREST).convert('P', palette=Image.ADAPTIVE))
                ms.append(int(a['giay'] / a['so'] * 1000))
        for _ in range(3):
            frames.append(frames[-1]); ms.append(120)
    frames[0].save(os.path.join(OUT, name), save_all=True, append_images=frames[1:], duration=ms, loop=0, disposal=2)
    print('gif', name)


def shots_do(pw):
    """Ảnh phần đồ: vũ khí, trang phục, vật phẩm."""
    kiem, mu, xu = ve_kiem(os.path.join(OUT, 've-tay-mau-kiem.png')), ve_mu(os.path.join(OUT, 've-tay-mau-mu.png')), ve_xu(os.path.join(OUT, 've-tay-mau-xu.png'))
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 760})
    pg.goto(TOOL); pg.wait_for_function('window.XS_UI'); pg.wait_for_timeout(400)
    pg.evaluate("document.querySelector('.the[data-ma=\"vk-sword-0\"]').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(300)
    shot(pg, 'do-1-chon-vu-khi.png')
    pg.click('.the[data-ma="vk-sword-0"]'); pg.set_input_files('#chonAnh', kiem); pg.wait_for_function('XS_S.R'); pg.wait_for_timeout(2600)
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(300); shot(pg, 'do-2-diem-cam.png')
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="atk"]'); pg.click('[data-zoom="3"]')
    fr, ms = [], []
    for dt, n in [('idle', 6), ('run', 8), ('atk', 10), ('dodge', 8)]:
        pg.click('#dsDongTac [data-dt="%s"]' % dt)
        for _ in range(n):
            pg.wait_for_timeout(60)
            im = Image.open(io.BytesIO(pg.locator('#cv4').screenshot())).convert('RGB')
            fr.append(im.resize((im.width // 2, im.height // 2), Image.NEAREST).convert('P', palette=Image.ADAPTIVE)); ms.append(80)
    fr[0].save(os.path.join(OUT, 'do-vu-khi-tren-tay.gif'), save_all=True, append_images=fr[1:], duration=ms, loop=0)
    print('gif do-vu-khi-tren-tay.gif')
    pg.click('#dsDongTac [data-dt="icon"]'); pg.click('[data-zoom="2"]'); pg.wait_for_timeout(400); shot(pg, 'do-3-o-do.png')
    pg.click('#cacBuoc [data-b="1"]'); pg.click('.the[data-ma="tp-hats-non_la"]'); pg.set_input_files('#chonAnh', mu); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "tp-hats-non_la"'); pg.wait_for_timeout(300)
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(300); shot(pg, 'do-4-dat-len-nguoi.png')
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="run"]'); pg.click('#coGoc'); pg.click('[data-zoom="3"]'); pg.wait_for_timeout(400); shot(pg, 'do-5-mac-thu.png')
    pg.click('#coGoc')
    pg.click('#cacBuoc [data-b="1"]'); pg.click('.the[data-ma="vp-gold"]'); pg.set_input_files('#chonAnh', xu); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "vp-gold"'); pg.wait_for_timeout(300)
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="icon"]'); pg.click('#coGoc'); pg.wait_for_timeout(400); shot(pg, 'do-6-vat-pham.png')
    pg.evaluate('XS_UI.denBuoc(1)'); pg.click('.the[data-ma="vk-sword-0"]'); pg.wait_for_timeout(300); pg.evaluate('XS_UI.denBuoc(5)')
    pg.click('#nutXemGame5')
    for _ in range(60):
        pg.wait_for_timeout(150)
        f = next((x for x in pg.frames if 'xuong-sprite-thu' in x.url), None)
        try:
            if f and f.evaluate('!!(window.G && G.scene === G.StageScene)'):
                break
        except Exception:
            pass
    pg.click('#nutTuDanh'); pg.wait_for_timeout(2600); shot(pg, 'do-7-xem-trong-game.png')
    b.close()


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='xs_shots_')
    bon = ve_bon_chan(os.path.join(OUT, 've-tay-mau-bon-chan.png'))
    nguoi = ve_nguoi(os.path.join(OUT, 've-tay-mau-em-be.png'))
    don(); build()
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch()
            pg = b.new_page(viewport={'width': 1280, 'height': 760})
            pg.goto(TOOL); pg.wait_for_function('window.XS_UI'); pg.wait_for_timeout(500)
            shot(pg, 'buoc-1-chon.png')
            pg.click('.the[data-ma="heoCon"]'); pg.wait_for_timeout(300)
            shot(pg, 'buoc-2-dua-hinh.png')
            pg.set_input_files('#chonAnh', bon); pg.wait_for_function('XS_S.R'); pg.wait_for_timeout(3000)
            shot(pg, 'buoc-2-tach-nen.png')
            pg.click('#xemPixel'); pg.wait_for_timeout(300)
            shot(pg, 'buoc-2-pixel.png')
            pg.click('#nutSang3'); pg.wait_for_timeout(400)
            shot(pg, 'buoc-3-khung.png')
            pg.click('[data-che="to"]'); pg.wait_for_timeout(200)
            shot(pg, 'buoc-3-to-bo-phan.png')
            pg.click('[data-che="khop"]')
            pg.click('#nutSang4'); pg.wait_for_timeout(300)
            pg.click('#coGoc'); pg.click('#dsDongTac [data-dt="atk"]'); pg.wait_for_timeout(250)
            shot(pg, 'buoc-4-chuyen-dong.png')
            # GIF xem trong công cụ: chụp canvas cảnh qua các động tác
            pg.click('#coGoc'); pg.click('[data-zoom="3"]')
            fr, ms = [], []
            for dt, n in [('idle', 10), ('move', 8), ('tele', 6), ('atk', 6), ('hit', 4), ('die', 10)]:
                pg.click('#dsDongTac [data-dt="%s"]' % dt)
                for _ in range(n):
                    pg.wait_for_timeout(70)
                    im = Image.open(io.BytesIO(pg.locator('#cv4').screenshot())).convert('RGB')
                    fr.append(im.resize((im.width // 2, im.height // 2), Image.NEAREST).convert('P', palette=Image.ADAPTIVE)); ms.append(90)
            fr[0].save(os.path.join(OUT, 'cong-cu-xem-chuyen-dong.gif'), save_all=True, append_images=fr[1:], duration=ms, loop=0)
            print('gif cong-cu-xem-chuyen-dong.gif')
            pg.click('#nutSang5'); pg.wait_for_timeout(400)
            shot(pg, 'buoc-5-xuat-tep.png')
            tep = pg.evaluate('XS_UI.taoTep(true, false)')
            with open(os.path.join(tmp, 'heoCon.sprite.json'), 'w', encoding='utf-8') as f:
                json.dump(tep, f)
            gif_dong_tac(tep, 'dong-tac-heo-tu-ve.gif')
            pg.click('#nutXemGame5')
            for _ in range(60):
                pg.wait_for_timeout(150)
                f = next((x for x in pg.frames if 'xuong-sprite-thu' in x.url), None)
                try:
                    if f and f.evaluate('!!(window.G && G.scene === G.StageScene)'):
                        break
                except Exception:
                    pass
            pg.click('#nutTuDanh'); pg.wait_for_timeout(2600)
            shot(pg, 'xem-trong-game.png')
            pg.click('#nutDongGame')
            # em bé
            pg.click('#cacBuoc [data-b="1"]'); pg.click('.the[data-ma="em-be"]'); pg.set_input_files('#chonAnh', nguoi)
            pg.wait_for_function('XS_S.R && XS_S.muc.ma === "em-be"'); pg.evaluate('XS_UI.denBuoc(4)'); pg.wait_for_timeout(500)
            shot(pg, 'em-be-chuyen-dong.png')
            tep_be = pg.evaluate('XS_UI.taoTep(true, false)')
            gif_dong_tac(tep_be, 'dong-tac-em-be-tu-ve.gif', k=5)
            b.close()
            # điện thoại cầm ngang
            b = pw.chromium.launch()
            ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=2)
            pg = ctx.new_page(); pg.goto(TOOL); pg.wait_for_function('window.XS_UI')
            pg.click('.the[data-ma="heoCon"]'); pg.wait_for_timeout(300)
            pg.evaluate('XS_UI.denBuoc(4)'); pg.wait_for_timeout(700)
            shot(pg, 'dien-thoai-ngang.png')
            b.close()

            shots_do(pw)
            # trước / sau trong phòng game
            def phong(pg2):
                pg2.evaluate('window.requestAnimationFrame = () => 0')
                pg2.add_script_tag(path=os.path.join(HERE, 'setup.js'))
                pg2.evaluate("""() => { G.testSave({ lvl: 10 }); G.rnd = G.srand(5); G.startStage(0, 2, 0); const S = G.getRun(), W = G.getWorld(); W.waves = []; W.spawns = []; S.hint = null; W.banner = null;
                  if (S.P.mv) { S.P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; S.P.mv.tipWait = null; }
                  S.P.x = 200; S.P.y = 170; const pos = [[262, 150], [288, 182], [250, 205]];
                  for (const p of pos) { const e = G.spawnEnemy('rusher', p[0], p[1], { art: 'heoCon' }); e.inside = true; e.spawnT = 0; e.cd = 99; }
                  for (let k = 0; k < 40; k++) { G.tick(); for (const e of W.ents) e.cd = 99; } G.ui.begin(); G.scene.draw(); }""")
            for ten, co in (('truoc', False), ('sau', True)):
                don()
                if co:
                    shutil.copy(os.path.join(tmp, 'heoCon.sprite.json'), os.path.join(CUSTOM, 'heoCon.sprite.json'))
                    with open(os.path.join(CUSTOM, 'em-be.sprite.json'), 'w', encoding='utf-8') as f:
                        json.dump(tep_be, f)
                build()
                b = pw.chromium.launch(); pg2 = b.new_page(viewport={'width': 960, 'height': 540})
                pg2.goto(GAME_DIST); pg2.wait_for_function('window.G && G.scene'); pg2.wait_for_timeout(500)
                phong(pg2)
                pg2.screenshot(path=os.path.join(tmp, ten + '.png'), clip={'x': 300, 'y': 180, 'width': 360, 'height': 260})
                b.close()
            a, c = Image.open(os.path.join(tmp, 'truoc.png')), Image.open(os.path.join(tmp, 'sau.png'))
            o = Image.new('RGB', (a.width * 2 + 12, a.height), (26, 18, 10))
            o.paste(a, (0, 0)); o.paste(c, (a.width + 12, 0))
            o = o.resize((o.width * 2, o.height * 2), Image.NEAREST)
            o.save(os.path.join(OUT, 'truoc-sau-trong-phong.png'))
            print('ảnh truoc-sau-trong-phong.png')
    finally:
        don(); build()
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
