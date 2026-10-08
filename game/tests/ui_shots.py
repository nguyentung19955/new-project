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
    n = [0]
    def shot(name):
        n[0] += 1
        g.shot(f'{OUT}/{size}-{n[0]:02d}-{name}.png')
    shot('title')
    g.tap(240, 200); shot('hub-moi')
    # ải hướng dẫn: từng phòng
    g.ev("G.startStage(0,0,0)"); g.wait(500); shot('tut-1')
    for k in range(1, 7):
        g.ev(f"G.gotoRoom({k}); G.sim(100)"); g.wait(450); shot(f'tut-{k+1}')
    g.ev("G.gotoRoom(2); G.sim(30); const S=G.getRun(); S.P.x=240; S.P.y=S.W.props[0].y+4"); g.wait(300); shot('tut-ruong-gan')
    g.ev("G.gotoRoom(6); G.finishStage(true)"); g.wait(700); shot('ketqua-thang')
    g.ev("G.startStage(0,0,0); G.gotoRoom(3); G.finishStage(false)"); g.wait(700); shot('ketqua-thua')
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
    g.ev("G.startStage(1,2,0); G.gotoRoom(2); G.getRun().opts = null"); g.wait(400)
    g.ev("const S=G.getRun(); S.P.x=250; S.P.y=S.W.props[0].y+4"); g.wait(200)
    g.down(430 + g.ev("G.cx"), 220 + g.ev("G.cy")); g.wait(80); g.up(); shot('bang-ruong')
    g.ev("G.getRun().mode='play'; G.gotoRoom(4)"); g.wait(400); shot('phong-chon-cua')
    for kind in ['merchant', 'curse', 'challenge']:
        g.ev(f"const S=G.getRun(); S.rooms[4]='{kind}'; G.gotoRoom(4); G.sim(90)"); g.wait(400); shot('phong-' + kind)
        if kind != 'challenge':
            g.ev(f"G.getRun().mode='{kind}'; G.getRun().prop=G.getRun().W.props[0]"); shot('bang-' + kind); g.ev("G.getRun().mode='play'")
    g.ev("G.gotoRoom(6)"); g.wait(400); shot('phong-suoi')
    g.ev("G.getRun().mode='swap'"); shot('bang-doi-do')
    g.ev("G.getRun().mode='play'; const S=G.getRun(); S.stats.el.fire=500; S.stats.melee=500; G.gotoRoom(7); G.sim(200)"); g.wait(300); shot('trum-nho')
    g.ev("G.getRun().mode='paused'"); shot('bang-dung')
    g.ev("G.startStage(0,4,0); const S=G.getRun(); S.stats.el.fire=500; S.stats.melee=500; S.stats.dodges=300; G.gotoRoom(7); G.sim(240); G.addCoat('ice',60); S.P.st.fire=3; S.W.boss.exposed=3"); g.wait(300); shot('trum-lon')
    g.ev("G.startStage(2,3,0); G.gotoRoom(3); G.sim(240)"); g.wait(300); shot('danh-quai')
    print('lỗi:', g.errs[:5])
    g.close()
