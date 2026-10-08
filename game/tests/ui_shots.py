"""Chụp mọi màn hình và bảng chọn để xem bằng mắt. Dùng: python3 tests/ui_shots.py <thư mục> [phone|p169|port|desk] [url]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *

OUT = sys.argv[1]; size = sys.argv[2] if len(sys.argv) > 2 else 'phone'
url = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(OUT, exist_ok=True)
RICH = """() => { G.resetSave(); const sv = G.save; sv.sound=false; sv.gold=2400; sv.ore=40; sv.stones=3; sv.mats=[20,20,20]; sv.shards=[3,3,3];
  for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
  const w = G.weaponById(sv.carry[0]); w.marks.fire = 140; w.branch='fire'; w.tier=1; w.sharpen=3;
  const b2 = G.weaponById(sv.carry[1]); b2.marks.ice = 40; b2.branch='ice';
  G.newWeapon(sv,'hammer',1); const sp = G.newWeapon(sv,'spear',2); sp.marks.poison=320; sp.branch='poison'; G.addMarks(sp,'poison',1);
  for (let i=0;i<6;i++) G.newWeapon(sv, G.WKEYS[i%4], i%3);
  sv.owned.helm=['h_moc','h_r1']; sv.owned.armor=['a_moc']; sv.owned.charm=['c_mist','c_greed']; sv.helm='h_moc'; sv.armor='a_moc'; sv.charm='c_mist';
  for (let r=0;r<3;r++) for (let i=0;i<5;i++) sv.stars[r+'-'+i]=1+((r+i)%3);
  sv.tut.done = true; G.setScene(G.Village); }"""
with sync_playwright() as p:
    g = Game(p, size, url=url)
    g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))  # G.testGoto: nhảy tới phòng theo loại
    ACT = "(a) => { const S = G.getRun(), pr = S.W.props.find((p) => p.act === a); S.P.x = pr.x - 10; S.P.y = pr.y + 4; S.prop = pr; }"  # đứng cạnh một đồ vật
    n = [0]
    def shot(name):
        n[0] += 1
        g.shot(f'{OUT}/{size}-{n[0]:02d}-{name}.png')
    shot('title')
    g.tap(240, 200); shot('hub-moi')
    # ải hướng dẫn: từng phòng
    g.ev("G.startStage(0,0,0)"); g.wait(500); shot('tut-1')
    for k in range(1, 8):
        t = g.ev(f"G.gotoRoom({k}); G.sim(100); G.getRun().W.type"); g.wait(450); shot(f'tut-{k+1}-{t}')
    g.ev("G.testGoto('chest'); G.sim(30)"); g.ev(ACT, 'chest'); g.wait(300); shot('tut-ruong-gan')
    # phòng đầu dọn xong: cửa mở, có mũi tên chỉ lối và lời chỉ dẫn về cửa
    g.ev("G.gotoRoom(0); (() => { const S = G.getRun(); S.P.inv = 999; for (let k = 0; k < 40 && !S.W.cleared; k++) { for (const e of S.W.ents.slice()) G.damage(e, 1e6, {}); G.sim(50); S.P.inv = 999; } })()"); g.wait(400); shot('tut-cua-mo')
    mm = g.ev("G.minimap.rect(G.getRun())"); g.tap(mm[0] + mm[2] / 2, mm[1] + mm[3] / 2); shot('bang-ban-do-A'); g.ev("G.getRun().mode='play'")
    g.ev("G.testGoto('boss'); G.finishStage(true)"); g.wait(700); shot('ketqua-thang')
    g.ev("G.startStage(0,0,0); G.testGoto('elite'); G.finishStage(false)"); g.wait(700); shot('ketqua-thua')
    g.ev(RICH); shot('hub-giau')
    V = "G.villageApi.V"
    for tab in ['map', 'forge', 'gear', 'hero', 'help', 'settings']:
        g.ev(f"{V}.tab = '{tab}'; {V}.sel = {'[1,4]' if tab=='map' else 'G.save.carry[0]' if tab=='forge' else 'null'}")
        shot('lang-' + tab)
    g.ev(f"{V}.tab='gear'; {V}.sel=G.save.weapons[3].id"); shot('lang-gear-chon')
    g.ev(f"{V}.tab='settings'; {V}.confirm=true"); shot('lang-xoa'); g.ev(f"{V}.confirm=false")
    for ft in ['tier', 'reforge', 'craft', 'up']:
        g.ev(f"{V}.tab='forge'; {V}.ftab='{ft}'; {V}.sel = {'G.save.carry[0]' if ft!='craft' else chr(39)+'a_ngu'+chr(39)}")
        shot('lo-' + ft)
    g.ev(f"{V}.ftab='sharpen'")
    g.ev("G.startStage(1,2,0,{kind:'B',seed:1}); G.testGoto('chest'); G.getRun().opts = null"); g.wait(400)
    g.ev(ACT, 'chest'); g.wait(200)
    g.down(430 + g.ev("G.cx"), 220 + g.ev("G.cy")); g.wait(80); g.up(); shot('bang-ruong')
    # phòng phụ đúng như bản đồ sinh ra (thay cho phòng chọn cửa trước đây), rồi lần lượt cả ba loại phòng phụ
    t = g.ev("G.getRun().mode='play'; (() => { const S = G.getRun(); G.gotoRoom(S.rooms.findIndex((t) => G.mapgen.SIDE.includes(t))); return S.W.type; })()"); g.wait(400); shot('phong-phu-' + t)
    for kind in ['merchant', 'curse', 'challenge']:
        g.ev(f"G.testGoto('{kind}'); G.sim(90)"); g.wait(400); shot('phong-' + kind)
        if kind != 'challenge':
            g.ev(ACT, 'merchant' if kind == 'merchant' else 'altar'); g.ev(f"G.getRun().mode='{kind}'"); shot('bang-' + kind); g.ev("G.getRun().mode='play'")
    g.ev("G.testGoto('fountain')"); g.wait(400); shot('phong-suoi')
    g.ev("G.getRun().mode='map'"); shot('bang-ban-do-B'); g.ev("G.getRun().mode='play'")
    g.ev("G.getRun().mode='swap'"); shot('bang-doi-do')
    g.ev("G.getRun().mode='play'; const S=G.getRun(); S.stats.el.fire=500; S.stats.melee=500; G.testGoto('boss'); G.sim(200)"); g.wait(300); shot('trum-nho')
    g.ev("G.getRun().mode='paused'"); shot('bang-dung')
    g.ev("G.startStage(0,4,0); const S=G.getRun(); S.stats.el.fire=500; S.stats.melee=500; S.stats.dodges=300; G.testGoto('boss'); G.sim(240); G.addCoat('ice',60); S.P.st.fire=3; S.W.boss.exposed=3"); g.wait(300); shot('trum-lon')
    g.ev("G.getRun().mode='map'"); shot('bang-ban-do-C'); g.ev("G.getRun().mode='play'")
    g.ev("G.startStage(2,3,0); G.testGoto('fight'); G.sim(240)"); g.wait(300); shot('danh-quai')
    print('lỗi:', g.errs[:5])
    g.close()
