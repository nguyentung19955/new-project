"""Lực chiến: chụp ảnh + kiểm chiều tăng/giảm bằng chạm thật. python3 lc_shots.py URL OUTDIR"""
import os, sys, json
sys.path.insert(0, '/home/claude/new-project/game/tests')
from ui_lib import Game
from playwright.sync_api import sync_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SAVE = ("G.testSave({lvl: 9, branch: 'fire', marks: 140, tier: 1, sharpen: 2}); const sv = G.save; sv.gold = 5000; sv.ore = 60; sv.stones = 2; sv.mats = [15, 6, 7]; sv.forge = 3;"
        "const t = G.newWeapon(sv, 'sword', 2); t.affixes = ['crit','mana']; t.sharpen = 3; G.newWeapon(sv, 'spear', 0);"
        "const O = G.outfit; O.wear(sv, O.add(sv, 'ao_vay', 2)); O.add(sv, 'mu_tai_cao', 3); O.add(sv, 'mu_rom', 0); G.persist(); G.setScene(G.Village)")
res = {}
def shot(g, name, clip=True):
    p = os.path.join(OUT, name + '.png'); g.pg.screenshot(path=p); return p
with sync_playwright() as p:
    g = Game(p, 'phone', url=URL)
    g.pg.add_script_tag(path='/home/claude/new-project/game/tests/setup.js')
    g.ev(SAVE); g.wait(900)
    lc = lambda: g.ev("G.lucChien()")
    st = lambda: g.ev("JSON.stringify(G.lucChienUI.st.toast && {base:G.lucChienUI.st.toast.base,to:G.lucChienUI.st.toast.to})")
    res['dau'] = lc(); shot(g, '0-lang-hud')
    # hành trang
    g.tap(454, 32, 400); shot(g, '1-hanh-trang-chi-so')
    # thẻ vũ khí, chọn món trong rương (Kiếm Tím)
    g.tap(16 + 1 * 74 + 30, 75, 300)  # thẻ thứ 2 (ước lượng)
    res['tab'] = g.ev("G.hanhTrang.tab")
    tid = g.ev("G.save.weapons.find(w=>w.type==='sword'&&w.rarity===2).id")
    g.ev(f"G.hanhTrang.sel = {tid}"); g.wait(400)
    res['thuVuKhi'] = g.ev(f"[0,1].map(s=>G.lucChienUI.thuVuKhi(G.weaponById({tid}), s))")
    shot(g, '2-ruong-so-sanh')
    before = lc()
    # bấm Mang ô 1 bằng chạm thật: tìm nút theo vị trí hàng đã chọn
    g.ev(f"(()=>{{const sv=G.save; sv.carry[0]={tid}; G.hanhTrang.sel=null; G.persist();}})()")
    g.wait(350); shot(g, '3-thong-bao-tang')
    res['mang'] = [before, lc(), st()]
    g.wait(2300)
    # tháo vũ khí ô 2 → giảm
    before = lc(); g.ev("G.save.carry[1] = null; G.persist()"); g.wait(350); shot(g, '4-thong-bao-giam')
    res['thao'] = [before, lc(), st()]
    g.wait(2300)
    # mài +1
    before = lc(); g.ev("G.weaponById(G.save.carry[0]).sharpen++"); g.wait(300); res['mai'] = [before, lc(), st()]
    g.wait(2300)
    # trang phục: chọn mũ tai cáo
    g.ev("G.hanhTrang.tab='outfit'; G.hanhTrang.osel = G.save.outfit.items.find(x=>x.k==='mu_tai_cao').id"); g.wait(400)
    shot(g, '5-trang-phuc-thu')
    res['thuMu'] = g.ev("G.lucChienUI.thuTrangPhuc(G.outfit.byId(G.save, G.hanhTrang.osel), false)")
    before = lc(); g.tap(428, 99, 300); res['mu'] = [before, lc(), g.ev("G.save.outfit.wear.hat")]
    g.wait(2300)
    # gộp: hai thay đổi liên tiếp
    before = lc(); g.ev("G.save.heroes.smith.lvl++"); g.wait(250); g.ev("G.save.heroes.smith.lvl++"); g.wait(250)
    res['gop'] = [before, lc(), st()]
    g.wait(2300)
    # Ông Từ
    g.ev("G.hanhTrang.tab='hero'"); g.tap(438, 57, 300)
    g.ev("G.villageApi.V.tab = 'hero'"); g.wait(500); shot(g, '6-ong-tu')
    # đổi em bé: không báo
    g.ev("G.save.hero='hunter'"); g.wait(500); res['doiBe'] = st()
    g.ev("G.villageApi.V.tab = 'hub'"); g.wait(400)
    shot(g, '7-lang-hud-sau')
    # trong trận: không hiện; màn kết quả: hiện
    g.ev("G.startStage(0, 0, 0)"); g.wait(600)
    g.ev("G.save.heroes[G.save.hero].lvl++"); g.wait(500)
    res['trongTran'] = [g.ev("G.getRun().mode"), st()]
    g.ev('(()=>{const S=G.getRun(); S.fade=0; S.tut=null; S.hint=null; G.gotoRoom(S.map.boss); G.finishStage(true); S.modeT=-9;})()'); g.wait(700)
    res['ketQua'] = [g.ev("G.getRun().mode"), st()]
    try: shot(g, '8-ket-qua')
    except Exception as e: res['shotErr']=str(e)
    res['errs'] = g.errs
    print(json.dumps(res, ensure_ascii=False))
