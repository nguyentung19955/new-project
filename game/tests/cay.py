"""CÂN BẰNG PHẢI CÀY: bot chơi từ bản lưu mới như một người chơi bình thường và đếm số lần chơi cần cho từng ải.

Cách bot chơi (mỗi lượt):
  - Ở làng: học kỹ năng, nâng lò, nâng bậc, mài, rèn và mặc đồ tốt nhất, mang vũ khí mạnh nhất (như người chơi chăm chỉ).
  - Kiểu "khuyen" (mặc định): nhìn "Sức mạnh khuyên dùng" của ải kế; sức mạnh chưa đủ (chưa xanh) thì chơi lại ải mới nhất đã qua
    để cày (tối đa 8 lượt liền), đủ thì vào ải mới. Thua thì về làng nâng cấp và chơi lại ải cũ một lượt rồi mới thử lại.
  - Kiểu "lieu": không nhìn lời khuyên, cứ vào ải mới; thua thì chơi lại ải cũ một lượt rồi thử lại.
Số lần chơi của một ải = mọi lượt (kể cả chơi lại ải cũ và lượt thua) từ lúc qua ải trước cho tới lúc qua ải đó.
Bot chơi hơi vụng như người mới (phản xạ chậm hơn, bỏ sót nhiều đạn hơn bot mặc định).

Chạy: python3 tests/cay.py [số lượt chiến dịch, mặc định 3] [khuyen|lieu] [--nhanh: chỉ kiểm vùng 1]
Thoát mã 1 nếu không đạt mục tiêu (xem MUC_TIEU) hoặc có lỗi trang."""
import sys, json, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOT = {'react': 0.3, 'missProj': 0.33}

AUTO = r"""
() => {
  const sv = G.save, api = G.villageApi;
  // điểm kỹ năng: Công 1, Thủ 1, rồi lần lượt
  for (const k of G.HKEYS) {
    const hs = sv.heroes[k];
    let pts = Math.floor(hs.lvl / 3) - (hs.sk.atk + hs.sk.def + hs.sk.elem), i = 0;
    while (pts > 0 && i < 40) { const b = G.SKEYS[(hs.sk.atk + hs.sk.def + hs.sk.elem) % 3]; if (hs.sk[b] < 5) { hs.sk[b]++; pts--; } i++; }
  }
  // chọn vũ khí theo sức tiềm năng: bậc cao mà chưa mài vẫn đáng mang (mài lại được), như người chơi tính trước
  const cap = G.FORGE_CAP[Math.min(3, sv.forge + 1)];
  const pw = (w) => G.wRarMult(w) * G.STAGE_MULT[G.wStage(w)] * (1 + 0.08 * Math.max(w.sharpen, cap - 3));
  const melee = sv.weapons.filter((w) => w.type !== 'bow').sort((a, b) => pw(b) - pw(a))[0];
  const bow = sv.weapons.filter((w) => w.type === 'bow').sort((a, b) => pw(b) - pw(a))[0];
  if (melee) sv.carry[0] = melee.id;
  if (bow) sv.carry[1] = bow.id;
  const up = G.FORGE_UP[sv.forge];
  if (up && api.canPay(up)) { api.pay(up); sv.forge++; }
  const carry = () => sv.carry.map(G.weaponById).filter(Boolean);
  for (const w of carry()) {
    while (w.tier < 2 && api.canPay(G.TIER_UP[w.tier + 1])) { api.pay(G.TIER_UP[w.tier + 1]); w.tier++; if (w.rarity != null) w.rarity = w.tier; }
    if (w.tier === 2) for (let r = 2; r >= 0; r--) { const c = G.goldCost(r); if (api.canPay(c)) { api.pay(c); w.tier = 3; if (w.rarity != null) w.rarity = 3; w.gold = r; break; } }
  }
  for (let n = 0; n < 30; n++) {
    const ws = carry().sort((a, b) => (a.type === 'bow') - (b.type === 'bow') || a.sharpen - b.sharpen);
    let done = false;
    for (const w of ws) {
      if (w.sharpen >= G.FORGE_CAP[sv.forge]) continue;
      const c = G.sharpenCost(w.sharpen), cost = { ore: c.ore, gold: c.gold, mat: [0, 0, 0] };
      if (c.mat) cost.mat[w.sharpen < 7 ? 1 : 2] = c.mat;
      if (api.canPay(cost)) { api.pay(cost); w.sharpen++; done = true; break; }
    }
    if (!done) break;
  }
  for (const slot of ['armor', 'helm']) {
    for (const id of Object.keys(G.GEAR[slot]).reverse()) {
      const g = G.GEAR[slot][id];
      if (!sv.owned[slot].includes(id) && api.canPay(g.cost)) { api.pay(g.cost); sv.owned[slot].push(id); }
    }
    const best = (id) => slot === 'armor' ? G.GEAR.armor[id].hp * (1 + 4 * G.GEAR.armor[id].dr) : G.GEAR.helm[id].pct * 100 + Object.keys(G.GEAR.helm).indexOf(id);
    const own = sv.owned[slot].slice().sort((a, b) => best(b) - best(a));
    if (own.length) sv[slot] = own[0];
  }
  const pref = ['c_leech', 'c_ember', 'c_spirit', 'c_mist', 'c_greed'];
  sv.charm = pref.find((c) => sv.owned.charm.includes(c)) || null;
  const hs = sv.heroes[sv.hero];
  return { lvl: hs.lvl, power: G.power(), gold: sv.gold, ore: sv.ore, forge: sv.forge, armor: sv.armor,
    carry: carry().map((w) => G.WTYPES[w.type].name + ' ' + G.RARITY[G.wRar(w)].name + ' +' + w.sharpen) };
}
"""

# Mục tiêu (số lần chơi trung bình mỗi ải, qua nhiều lượt chiến dịch): [thấp, cao]
def muc_tieu(k):
    r, i = divmod(k, 5)
    if r == 0:
        return (1, 2.5) if i < 4 else (5, 9)
    if i == 4:
        return (6, 10)
    if i >= 2:
        return (2.5, 5.5)
    return (1, 2.5)

SAVES = None
NGUONG = 1.0  # bot kiểu khuyen: đợi sức mạnh đủ (xanh) mới vào ải mới
KEHOACH = [0, 0, 0, 1, 5, 0, 1, 3, 3, 7, 0, 1, 3, 4, 8]
def campaign(pg, mode, upto):
    seen = set()
    def s_first(k):
        if k in seen: return False
        seen.add(k); return True
    pg.evaluate("(c) => { G.resetSave(); G.save.sound = false; Object.assign(G.botCfg, c); }", BOT)
    cleared = -1
    st = [{'plays': 0, 'tries': 0, 'fails': 0, 't': 0, 'lvl': 0, 'pw': 0, 'rec': 0} for _ in range(15)]
    tot_t = 0
    grind_run = 0
    must_grind = False
    hurt = {}
    log = []
    guard = 0
    while cleared < upto - 1 and guard < 160:
        guard += 1
        nxt = cleared + 1
        v = pg.evaluate(AUTO)
        rec = pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(nxt, 5)))
        if mode == 'kehoach':  # cày đúng số lượt định trước rồi mới thử (để đo sức mạnh theo số lần chơi)
            grind = cleared >= 0 and (must_grind or grind_run < KEHOACH[nxt])
        else:
            grind = cleared >= 0 and (must_grind or (mode == 'khuyen' and v['power'] < rec * NGUONG and grind_run < 8))
        k = cleared if grind else nxt
        r, i = divmod(k, 5)
        if not grind and SAVES is not None and s_first(nxt):
            SAVES.setdefault(nxt, []).append(pg.evaluate("JSON.stringify(G.save)"))
        pg.evaluate("([r, i]) => G.startStage(r, i, 0)", [r, i])
        res = pg.evaluate("G.probeRun(900)")
        errs = res.get('bad')
        if errs:
            return None, 'LỖI số liệu ' + str(errs[:3])
        t = res.get('t') or 0
        tot_t += t
        s = st[nxt]
        s['plays'] += 1; s['t'] += t
        for kk, x in (res.get('hurt') or {}).items():
            kk = kk.split(':')[1]; hurt[kk] = hurt.get(kk, 0) + x
        win = bool(res.get('win'))
        log.append(f"{'cày ' if grind else 'thử '}{r+1}-{i+1} {'thắng' if win else 'THUA '} {t:>3}s cấp {v['lvl']:>2} sức mạnh {v['power']:>4}/{rec:<4} {v['carry']} {v['armor']} vàng {v['gold']} quặng {v['ore']}")
        if grind:
            grind_run += 1
            must_grind = False
            continue
        s['tries'] += 1
        grind_run = 0
        if win:
            s['lvl'] = v['lvl']; s['pw'] = v['power']; s['rec'] = rec
            cleared = nxt
        else:
            s['fails'] += 1
            must_grind = True
    if cleared < upto - 1:
        return None, 'kẹt ở ải %d-%d' % divmod(cleared + 1, 5)
    return {'st': st, 't': tot_t, 'hurt': hurt, 'log': log}, None

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    n = int(args[0]) if args else 3
    mode = args[1] if len(args) > 1 else 'khuyen'
    upto = 5 if '--nhanh' in sys.argv else 15
    global SAVES
    errs = []
    runs = []
    luu = [a.split('=',1)[1] for a in sys.argv if a.startswith('--luu=')]
    if luu: SAVES = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for k in range(n):
            pg = b.new_page(viewport={'width': 844, 'height': 390})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file://' + HERE + '/index.html')
            pg.wait_for_timeout(1200)
            pg.add_script_tag(path=HERE + '/tests/bot.js')
            pg.add_script_tag(path=HERE + '/tests/setup.js')
            out, why = campaign(pg, mode, upto)
            pg.close()
            if not out:
                print('Lượt', k + 1, 'không xong:', why); runs.append(None); continue
            runs.append(out)
            if '-v' in sys.argv:
                print('\n'.join(out['log']))
            print(f"lượt {k+1}: tổng {out['t']/60:.0f} phút, {sum(s['plays'] for s in out['st'])} lần chơi | " + ' '.join(str(s['plays']) for s in out['st'][:upto]))
            sys.stdout.flush()
        b.close()
    if luu: json.dump(SAVES, open(luu[0], 'w'))
    ok = [r for r in runs if r]
    bad = 0
    if len(ok) < n:
        print('SAI: có lượt chiến dịch bị kẹt'); bad = 1
    if not ok:
        sys.exit(1)
    m = len(ok)
    print(f"\nKiểu bot: {mode}, {m} lượt chiến dịch. Số lần chơi = mọi lượt (cả chơi lại ải cũ và lượt thua) để qua ải đó.")
    print('| Ải | Số lần chơi | Lần thử ải mới | Thua | Thời gian (phút) | Cấp khi qua | Sức mạnh khi qua / khuyên dùng | Mục tiêu |')
    print('|---|---|---|---|---|---|---|---|')
    for k in range(upto):
        avg = lambda key: sum(r['st'][k][key] for r in ok) / m
        lo, hi = muc_tieu(k)
        pl = avg('plays')
        flag = '' if lo <= pl <= hi else ' ✗'
        if flag and mode == 'khuyen': bad = 1
        print(f"| {k//5+1}-{k%5+1} | {pl:.1f}{flag} | {avg('tries'):.1f} | {avg('fails'):.1f} | {avg('t')/60:.0f} | {avg('lvl'):.0f} | {avg('pw'):.0f} / {avg('rec'):.0f} | {lo:g}-{hi:g} |")
    tt = sum(r['t'] for r in ok) / m / 60
    print(f"Tổng thời gian đi hết {upto} ải lần đầu: {tt:.0f} phút ({tt/60:.1f} giờ), {sum(sum(s['plays'] for s in r['st']) for r in ok)/m:.0f} lần chơi")
    hurt = {}
    for r in ok:
        for kk, x in r['hurt'].items(): hurt[kk] = hurt.get(kk, 0) + x
    tot = sum(hurt.values()) or 1
    print('Nguồn mất máu:', ', '.join(f"{kk} {x*100/tot:.0f}%" for kk, x in sorted(hurt.items(), key=lambda kv: -kv[1])))
    if upto == 15 and mode == 'khuyen' and not (150 <= tt <= 240):
        print('SAI: tổng thời gian ngoài 2,5-4 giờ'); bad = 1
    if errs:
        print('LỖI TRANG:', errs[:3]); bad = 1
    sys.exit(bad)

main()
