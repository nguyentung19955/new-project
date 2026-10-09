"""Cho bot chơi lần lượt 15 ải trên một bản lưu mới và in kết quả từng ải.
Cân bằng phải cày: thua thì bot về làng nâng cấp rồi chơi lại ải trước một lượt (cày) và thử lại, như người chơi bình thường;
thua 12 lần liền một ải thì dừng. Bài đếm số lần chơi chi tiết (nhiều lượt chiến dịch, bảng mục tiêu) là tests/cay.py."""
import sys, json
from playwright.sync_api import sync_playwright

AUTO = r"""
() => {
  const sv = G.save, api = G.villageApi;
  // mang vũ khí tốt nhất: một cận chiến, một cung
  const score = (w) => G.wRar(w) * 4 + w.sharpen + G.wStage(w) * 6;
  const melee = sv.weapons.filter((w) => w.type !== 'bow').sort((a, b) => score(b) - score(a))[0];
  const bow = sv.weapons.filter((w) => w.type === 'bow').sort((a, b) => score(b) - score(a))[0];
  if (melee) sv.carry[0] = melee.id;
  if (bow) sv.carry[1] = bow.id;
  // nâng cấp như người chơi: việc rẻ mà hiệu quả trước (js/upgrade.js: kỹ năng, mài, nâng bậc, lò, trang phục, cánh)
  G.upg.auto(sv, { skip: ['carry'] });
  const hs = sv.heroes[sv.hero];
  return { lvl: hs.lvl, gold: sv.gold, ore: sv.ore, forge: sv.forge, carry: sv.carry.map(G.weaponById).map((w) => G.wName(w) + '[' + Object.values(w.marks).map(Math.round).join('/') + ']'), armor: sv.armor, helm: sv.helm, stones: sv.stones };
}
"""

def main():
    cfg = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    hero = cfg.pop('hero', None)
    stages = cfg.pop('stages', 15)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))) + '/index.html')
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path='tests/bot.js')
        pg.add_script_tag(path='tests/setup.js')
        pg.evaluate("(c) => { G.resetSave(); G.save.sound = false; Object.assign(G.botCfg, c); }", cfg)
        if hero:
            pg.evaluate("(h) => { for (const k of G.HKEYS) G.save.heroes[k].unlocked = true; G.save.hero = h; }", hero)
        total_fail = 0
        fails = [0, 0, 0]
        total_t = 0
        hurt = {}
        for n in range(stages):
            r, i = divmod(n, 5)
            for attempt in range(1, 13):
                if attempt > 1 and n > 0:  # thua: về làng nâng cấp, cày ải trước một lượt rồi mới thử lại
                    pg.evaluate(AUTO)
                    pr, pi = divmod(n - 1, 5)
                    pg.evaluate("([r, i]) => G.startStage(r, i, 0)", [pr, pi])
                    g = pg.evaluate("G.probeRun(900)")
                    total_t += g.get('t') or 0
                    print(f"   cày lại {pr+1}-{pi+1}: {'thắng' if g.get('win') else 'thua'} {g.get('t')}s")
                v = pg.evaluate(AUTO)
                pg.evaluate("([r, i]) => G.startStage(r, i, 0)", [r, i])
                res = pg.evaluate("G.probeRun(900)")
                total_t += res.get('t') or 0
                last = res['rooms'][-1] if res.get('rooms') else ['?', 0]
                boss_t = last[1] if last[0] == 'boss' else None
                for k, x in (res.get('hurt') or {}).items():
                    k = k.split(':')[1]
                    hurt[k] = hurt.get(k, 0) + x
                tag = 'THẮNG' if res.get('win') else 'thua ' if 'win' in res else 'KẸT  '
                print(f"{r+1}-{i+1} lần {attempt} {tag} {res.get('t'):>3}s cấp {v['lvl']:>2} máu {res.get('hp')}/{res.get('maxhp')} bình {res.get('potions')} sao {res.get('stars')} phòng {len(res.get('rooms') or [])} trùm {boss_t}s còn {res.get('bossHp')}% dấu ấn {res.get('marks')} | {v['carry']} {v['armor']} | {res.get('layers')}")
                sys.stdout.flush()
                if errs or res.get('bad'):
                    print('LỖI:', errs[:5], res.get('bad')); return
                if res.get('win'):
                    break
                total_fail += 1
                fails[r] += 1
            else:
                print('Dừng: thua 12 lần liên tiếp'); break
        print('nguồn sát thương:', dict(sorted(hurt.items(), key=lambda kv: -kv[1])))
        print('tổng số lần thua:', total_fail, 'theo vùng', fails, '| tổng thời gian', round(total_t / 60), 'phút | lưu:', pg.evaluate("JSON.stringify({gold:G.save.gold, ore:G.save.ore, stones:G.save.stones, mats:G.save.mats, shards:G.save.shards, heroes:Object.fromEntries(G.HKEYS.map(k=>[k,G.save.heroes[k].unlocked?G.save.heroes[k].lvl:0])), weapons:G.save.weapons.filter(w=>G.save.carry.includes(w.id)).map(w=>G.WTYPES[w.type].name+' '+G.TIERS[w.tier].name+' +'+w.sharpen+' '+G.STAGE_NAMES[G.wStage(w)]), forge:G.save.forge, armor:G.save.armor, helm:G.save.helm, owned:G.save.owned, stars:Object.values(G.save.stars).join('')})"))
        b.close()

main()
