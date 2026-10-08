import sys
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/new-project/game/index.html')
    pg.wait_for_timeout(1500)
    pg.add_script_tag(path='tests/bot.js')
    pg.evaluate("""() => { G.resetSave(); const sv = G.save; sv.sound=false; sv.gold=2400; sv.ore=40; sv.stones=3; sv.mats=[20,20,20]; sv.shards=[3,3,3];
      for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
      const w = G.weaponById(sv.carry[0]); w.marks.fire = 140; w.branch='fire'; w.tier=1; w.sharpen=3;
      const b2 = G.weaponById(sv.carry[1]); b2.marks.ice = 40; b2.branch='ice';
      G.newWeapon(sv,'hammer',1); G.newWeapon(sv,'spear',2); sv.owned.helm=['h_moc']; sv.owned.armor=['a_moc']; sv.helm='h_moc'; sv.armor='a_moc';
      for (let r=0;r<3;r++) for (let i=0;i<5;i++) sv.stars[r+'-'+i]=1+((r+i)%3);
      G.setScene(G.Village); }""")
    def shot(name): pg.wait_for_timeout(250); pg.screenshot(path=f'{OUT}/{name}.png')
    V = "G.villageApi.V"
    for tab in ['map', 'forge', 'gear', 'hero', 'help', 'settings']:
        pg.evaluate(f"{V}.tab = '{tab}'; {V}.sel = {'[1,4]' if tab=='map' else 'G.save.carry[0]' if tab=='forge' else 'null'}")
        shot('m-' + tab)
    for ft in ['tier', 'reforge', 'craft']:
        pg.evaluate(f"{V}.tab='forge'; {V}.ftab='{ft}'; {V}.sel = {'G.save.carry[0]' if ft!='craft' else chr(39)+'a_ngu'+chr(39)}")
        shot('m-forge-' + ft)
    for (r, name) in [(0, 'moc'), (1, 'ngu'), (2, 'ho')]:
        pg.evaluate(f"G.startStage({r},4,0); const S=G.getRun(); S.stats.el.fire=500; S.stats.melee=500; G.gotoRoom(7); G.botCfg.swapOnResist=false;")
        pg.evaluate("G.sim(60*9)"); shot('b-' + name + '-1')
        pg.evaluate("G.getRun().W.boss.hp *= 0.5; G.sim(60*7)"); shot('b-' + name + '-2')
        pg.evaluate("G.getRun().W.boss.hp = G.getRun().W.boss.maxhp*0.25; G.sim(60*6)"); shot('b-' + name + '-3')
    pg.evaluate("G.startStage(1,2,0); G.gotoRoom(2)"); shot('r-chest')
    pg.evaluate("G.gotoRoom(4)"); shot('r-choice')
    pg.evaluate("G.gotoRoom(6)"); shot('r-fountain')
    pg.evaluate("G.getRun().mode='swap'"); shot('r-swap')
    pg.evaluate("G.getRun().mode='play'; G.gotoRoom(7); G.sim(60*5)"); shot('r-mini')
    pg.evaluate("G.gotoRoom(3); G.sim(60*4)"); shot('r-fight')
    print('errors', errs[:5])
    b.close()
