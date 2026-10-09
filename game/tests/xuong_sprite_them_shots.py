"""Ảnh cho docs/xuong-sprite/ (đợt 3): trang chọn chia nhóm, vũ khí tám hướng, trang phục ba dáng, người làng,
và ảnh trước/sau trong game (làng, khung nói chuyện, Hành trang, trong trận) khi có vũ khí, khăn, quặng, người làng tự vẽ.
Chạy: python3 tests/xuong_sprite_them_shots.py   (game/art/custom/ được trả về chỉ còn .gitkeep khi xong)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from xuong_sprite_ve import ve_mu, ve_kiem_ngang, ve_quang, ve_nguoi_lang  # noqa: E402

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


def chon(pg, ma):
    pg.evaluate('ma => { if (XS_S.buoc !== 1) XS_UI.denBuoc(1); XS_UI.moNhom(XS_UI.nhomCuaMa(ma)); }', ma)
    pg.click('.the[data-ma="' + ma + '"]')


def shot(pg, name, clip=None):
    pg.screenshot(path=os.path.join(OUT, name), clip=clip)
    print('ảnh', name)


def font(n):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, n)
    return ImageFont.load_default()


def ghep(truoc, sau, name, k=1):
    """Hai ảnh cạnh nhau: trái hình code (trước), phải hình tự vẽ (sau)."""
    a, b = Image.open(truoc).convert('RGB'), Image.open(sau).convert('RGB')
    if k != 1:
        a = a.resize((a.width * k, a.height * k), Image.NEAREST)
        b = b.resize((b.width * k, b.height * k), Image.NEAREST)
    W, H = a.width + b.width + 12, max(a.height, b.height) + 34
    im = Image.new('RGB', (W, H), (18, 41, 42))
    im.paste(a, (0, 34)); im.paste(b, (a.width + 12, 34))
    d = ImageDraw.Draw(im)
    d.text((8, 7), 'Trước: hình vẽ bằng code', fill=(246, 220, 146), font=font(18))
    d.text((a.width + 20, 7), 'Sau: hình tự vẽ trong Xưởng Sprite', fill=(246, 220, 146), font=font(18))
    im.save(os.path.join(OUT, name))
    print('ảnh', name)


def cong_cu(pw, tmp):
    kn, mu, qu, nl = (ve_kiem_ngang(os.path.join(tmp, 'kn.png')), ve_mu(os.path.join(tmp, 'mu.png')),
                      ve_quang(os.path.join(tmp, 'qu.png')), ve_nguoi_lang(os.path.join(tmp, 'nl.png')))
    for p, ten in ((kn, 've-tay-mau-kiem-ngang.png'), (qu, 've-tay-mau-quang.png'), (nl, 've-tay-mau-nguoi-lang.png')):
        im = Image.open(p); im.thumbnail((360, 360)); im.save(os.path.join(OUT, ten))
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 760})
    pg.goto(TOOL); pg.wait_for_function('window.XS_UI')
    pg.evaluate("XS_UI.moNhom('vu-khi')"); pg.wait_for_timeout(700)
    shot(pg, 'chon-nhom-vu-khi.png')
    pg.evaluate("XS_UI.moNhom('nguoi-lang')"); pg.wait_for_timeout(700)
    shot(pg, 'chon-nhom-nguoi-lang.png')
    pg.evaluate("XS_UI.moNhom('do')"); pg.wait_for_timeout(700)
    shot(pg, 'chon-nhom-do.png')
    tep = {}
    chon(pg, 'vk-sword-2'); pg.set_input_files('#chonAnh', kn); pg.wait_for_function('XS_S.R'); pg.wait_for_timeout(2700)
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(500)
    shot(pg, 'do-8-cham-chuoi.png')
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="tam"]'); pg.wait_for_timeout(500)
    shot(pg, 'do-9-tam-huong.png')
    tep['vk'] = pg.evaluate('XS_UI.tepChoGame()')
    chon(pg, 'tp-hats-khan_xep'); pg.set_input_files('#chonAnh', mu); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "tp-hats-khan_xep"')
    pg.evaluate("() => { const e = document.getElementById('caoPx'); e.value = 14; e.dispatchEvent(new Event('input')); }"); pg.wait_for_function('XS_S.R.h === 14')
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(800)
    shot(pg, 'do-10-dat-mu-ba-dang.png')
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="ba"]'); pg.wait_for_timeout(500)
    shot(pg, 'do-11-ba-dang.png')
    tep['tp'] = pg.evaluate('XS_UI.tepChoGame()')
    chon(pg, 'vp-ore'); pg.set_input_files('#chonAnh', qu); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "vp-ore"'); pg.wait_for_timeout(2700)
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="icon"]'); pg.wait_for_timeout(400)
    shot(pg, 'do-12-quang.png')
    tep['vp'] = pg.evaluate('XS_UI.tepChoGame()')
    chon(pg, 'nl-lai'); pg.set_input_files('#chonAnh', nl); pg.wait_for_function('XS_S.R && XS_S.muc.ma === "nl-lai"'); pg.wait_for_timeout(2700)
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(500)
    shot(pg, 'nl-1-khung.png')
    pg.evaluate('XS_UI.denBuoc(4)'); pg.click('#dsDongTac [data-dt="noi"]'); pg.click('#coGoc'); pg.wait_for_timeout(700)
    shot(pg, 'nl-2-noi-chuyen.png')
    tep['nl'] = pg.evaluate('XS_UI.tepChoGame()')
    pg.evaluate('XS_UI.moGame()'); pg.wait_for_timeout(5000)
    shot(pg, 'nl-3-xem-trong-game.png')
    b.close()
    return tep


CHUAN_BI = """() => { const sv = G.newSave(); sv.tut = Object.assign(sv.tut || {}, { done: true }); sv.sound = false; sv.ore = 42; sv.gold = 350;
  sv.weapons = []; sv.nextId = 1; const w = G.newWeapon(sv, 'sword', 1, { family: 2 }), w2 = G.newWeapon(sv, 'bow', 0, { family: 0 }); sv.carry = [w.id, w2.id];
  const it = G.outfit.add(sv, 'khan_xep', 1, { quiet: true }); if (it) G.outfit.wear(sv, it); G.save = sv; G.persist = () => {}; }"""


def trong_game(pw, ten):
    """Chụp làng, khung nói chuyện, Hành trang, trong trận. ten: 'truoc' hoặc 'sau'."""
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.goto(GAME_DIST + '?cloud=0'); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(600)
    pg.evaluate(CHUAN_BI)
    pg.evaluate("() => { G.setScene(G.Village); const VS = G.villageScene, N = VS.NPCS.lai, S = VS.state; S.x = N.den[0] - 6; S.y = N.den[1]; S.path = null; S.face = 1; }")
    pg.wait_for_timeout(1500)
    p = {}
    for k, js in (('lang', None), ('noi', "G.villageScene.goNpc('lai', true)"), ('hanh', "G.villageApi.goHub(); G.hanhTrang.openVillage(); G.hanhTrang.tab = 'res';")):
        if js:
            pg.evaluate('() => { ' + js + ' }'); pg.wait_for_timeout(900)
        p[k] = os.path.join(tmp_dir, ten + '-' + k + '.png'); pg.screenshot(path=p[k])
    pg.evaluate("() => { G.villageApi.goHub(); G.rnd = G.srand(3); G.startStage(0, 2, 0); const W = G.getWorld(); W.waves = []; W.spawns = []; const S = G.getRun(); S.hint = null; S.P.x = 200; S.P.y = 150; }")
    pg.wait_for_timeout(500)
    # bé chém về bên phải: giữ nút đánh một lúc
    pg.evaluate("() => { G.botInput = () => ({ mx: 0.01, my: 0, atk: true, atkP: Math.floor(G.time * 4) % 2 === 0, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false }); }")
    pg.wait_for_timeout(260)
    p['tran'] = os.path.join(tmp_dir, ten + '-tran.png'); pg.screenshot(path=p['tran'])
    xy = pg.evaluate("(() => { const P = G.getRun().P, cv = document.querySelector('canvas'), r = cv.getBoundingClientRect(); return [r.x + P.x * r.width / 480, r.y + P.y * r.height / 270, r.width / 480]; })()")
    b.close()
    return p, xy


tmp_dir = None


def main():
    global tmp_dir
    tmp_dir = tempfile.mkdtemp(prefix='xs_them_')
    don()
    try:
        build()
        with sync_playwright() as pw:
            tep = cong_cu(pw, tmp_dir)
            truoc, _ = trong_game(pw, 'truoc')
            for t in tep.values():
                with open(os.path.join(CUSTOM, t['ma'] + '.sprite.json'), 'w', encoding='utf-8') as f:
                    json.dump(t, f)
            build()
            sau, xy = trong_game(pw, 'sau')
        ghep(truoc['lang'], sau['lang'], 'truoc-sau-lang.png')
        ghep(truoc['noi'], sau['noi'], 'truoc-sau-noi-chuyen.png')
        ghep(truoc['hanh'], sau['hanh'], 'truoc-sau-hanh-trang.png')
        # trận: cắt quanh em bé rồi phóng to
        s = xy[2]; box = (int(xy[0] - 60 * s), int(xy[1] - 50 * s), int(xy[0] + 60 * s), int(xy[1] + 20 * s))
        for k in ('truoc', 'sau'):
            src = truoc['tran'] if k == 'truoc' else sau['tran']
            Image.open(src).crop(box).save(os.path.join(tmp_dir, k + '-tran-cat.png'))
        ghep(os.path.join(tmp_dir, 'truoc-tran-cat.png'), os.path.join(tmp_dir, 'sau-tran-cat.png'), 'truoc-sau-tran.png', 2)
    finally:
        don()
        build()
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == '__main__':
    main()
