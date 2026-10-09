"""CÂN BẰNG PHẢI CÀY: bot chơi từ bản lưu mới như một người chơi bình thường và đếm số lần chơi cần cho từng ải.

Cách bot chơi (mỗi lượt):
  - Ở làng: học kỹ năng, nâng lò, nâng bậc, mài, rèn và mặc đồ tốt nhất, mang vũ khí mạnh nhất (như người chơi chăm chỉ).
  - Kiểu "khuyen" (mặc định): nhìn "Sức mạnh khuyên dùng" của ải kế; sức mạnh chưa đủ (chưa xanh) thì chơi lại ải mới nhất đã qua
    để cày (tối đa 8 lượt liền; cày 3 lượt mà sức mạnh không tăng thì thử luôn), đủ thì vào ải mới. Thua thì về làng nâng cấp và chơi lại ải cũ một lượt rồi mới thử lại.
  - Kiểu "lieu": không nhìn lời khuyên, cứ vào ải mới; thua thì chơi lại ải cũ một lượt rồi thử lại.
Số lần chơi của một ải = mọi lượt (kể cả chơi lại ải cũ và lượt thua) từ lúc qua ải trước cho tới lúc qua ải đó.
Bot chơi hơi vụng như người mới (phản xạ chậm hơn, bỏ sót nhiều đạn hơn bot mặc định).

Chạy: python3 tests/cay.py [số lượt chiến dịch, mặc định 12] [khuyen|lieu] [--nhanh: chỉ kiểm vùng 1]
Thoát mã 1 nếu không đạt mục tiêu (hàm muc_tieu, cho lệch 20-25% vì số lần chơi ở trùm hên xui), tổng thời gian ngoài 2,5-4 giờ,
có luật hỏng hoặc có lỗi trang."""
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
  // Trang phục (js/outfit.js): mua món thường ở Bà Hàng Xén, may món ở Cô Thợ May, mặc món làm sức mạnh cao nhất ở từng ô,
  // nâng bậc món đang mặc và mở cấp cánh khi đủ tiền (sau khi đã lo vũ khí), như người chơi bình thường.
  const O = G.outfit;
  if (O && sv.outfit) {
    for (const k of O.shopList()) if (!O.has(sv, k) && sv.gold >= 400) O.buy(sv, k);
    for (const k of O.craftList()) if (!O.has(sv, k) && O.canPay(sv, O.craftCost(k))) O.craft(sv, k);
    const wearBest = () => {
      for (const slot of O.SLOTS) {
        const cands = sv.outfit.items.filter((it) => O.ITEMS[it.k] && O.ITEMS[it.k].slot === slot);
        if (!cands.length) continue;
        let best = sv.outfit.wear[slot], bp = -1;
        for (const it of cands) { O.wear(sv, it); const p = G.power() + it.r * 2 + (it.lv || 0); if (p > bp) { bp = p; best = it.id; } }
        sv.outfit.wear[slot] = best;
      }
    };
    wearBest();
    for (let n = 0; n < 10; n++) {
      let done = false;
      for (const slot of O.SLOTS) {
        const it = O.worn(sv, slot);
        if (!it) continue;
        if (O.ITEMS[it.k].slot === 'wing' && O.wingUp(sv, it)) done = true;
        else if (it.r < 3 && O.upgrade(sv, it)) done = true;
      }
      if (!done) break;
    }
    wearBest();
  } else for (const slot of ['armor', 'helm']) {
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
  const look = O && sv.outfit ? O.SLOTS.map((k) => { const it = O.worn(sv, k); return it ? it.k + it.r : '-'; }).join(',') : sv.armor;
  return { lvl: hs.lvl, power: G.power(), gold: sv.gold, ore: sv.ore, forge: sv.forge, armor: look,
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
    pw_run = 0
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
            # cày tới khi đủ sức mạnh; nhưng cày 3 lượt liền mà sức mạnh không tăng (đồ đã chạm trần) thì thử luôn, như người chơi thật
            stall = grind_run >= 3 and v['power'] <= pw_run * 1.01
            grind = cleared >= 0 and (must_grind or (mode == 'khuyen' and v['power'] < rec * NGUONG and grind_run < 8 and not stall))
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
            if grind_run == 0 or grind_run % 3 == 0: pw_run = v['power']
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

LUAT = r"""
() => {
  const out = [];
  const ok = (c, m) => out.push([!!c, m]);
  G.resetSave(); G.save.sound = false;
  ok(G.power() >= 95 && G.power() <= 105, 'em bé mới (cấp 1, kiếm Thường) có sức mạnh khoảng 100: ' + G.power());
  let mono = true; for (let k = 1; k < 15; k++) if (G.STAGE_REC[k] <= G.STAGE_REC[k - 1]) mono = false;
  ok(mono, 'sức mạnh khuyên dùng tăng dần qua 15 ải');
  ok(G.stageRec(2, 4, 1) > G.stageRec(2, 4, 0), 'độ khó thứ hai cần sức mạnh cao hơn');
  ok(G.grindMult(100, 100) === 1 && G.grindMult(130, 100) === 1 && G.grindMult(160, 100) < 1 && G.grindMult(400, 100) === 0.4, 'thưởng khi cày: đủ khi chưa quá 130%, giảm dần, thấp nhất 40%');
  // sức mạnh tăng theo cấp, mài, bậc, áo
  const p0 = G.power(); G.save.heroes.smith.lvl = 10; const p1 = G.power();
  const w = G.weaponById(G.save.carry[0]); w.sharpen = 3; const p2 = G.power(); w.tier = 1; if (w.rarity != null) w.rarity = 1; const p3 = G.power();
  G.save.owned.armor.push('a_r1'); G.save.armor = 'a_r1'; const p4 = G.power();
  ok(p1 > p0 && p2 > p1 && p3 > p2 && p4 > p3, 'sức mạnh tăng theo cấp, mài, bậc, áo: ' + [p0, p1, p2, p3, p4].join(' < '));
  // quyết tâm: thua thật thì tăng, bỏ ải thì không, thắng thì hết
  G.resetSave(); G.save.sound = false; G.save.tut.done = true;
  G.startStage(0, 1, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120);
  ok(G.save.grit['0-1'] === 1, 'thua thật ở ải 1-2 thì quyết tâm 1: ' + JSON.stringify(G.save.grit));
  G.startStage(0, 1, 0); const S = G.getRun();
  ok(S.grit === 1 && S.P.maxhp === Math.round(G.buildPlayer().maxhp * (1 + G.GRIT.step)), 'vào lại ải đó thì máu và sát thương tăng ' + G.GRIT.step * 100 + '%');
  S.quit = true; G.finishStage(false);
  ok(G.save.grit['0-1'] === 1, 'bỏ ải thì không thêm quyết tâm');
  G.startStage(0, 1, 0); G.getRun().W.boss = G.getRun().W.boss || { weak: [], dead: true }; G.finishStage(true);
  ok(!G.save.grit['0-1'], 'qua ải thì hết quyết tâm');
  // bản lưu cũ không có quyết tâm vẫn đọc được
  const old = JSON.parse(JSON.stringify(G.save)); delete old.grit; old.grit = undefined;
  const fx = G.fixSave(JSON.parse(JSON.stringify(old)));
  ok(fx.grit && typeof fx.grit === 'object' && fx.heroes.smith.lvl === old.heroes.smith.lvl, 'bản lưu cũ (chưa có quyết tâm) vẫn đọc được');
  ok(G.fixSave(Object.assign(JSON.parse(JSON.stringify(old)), { grit: { '0-1': 99, x: 'a' } })).grit['0-1'] === G.GRIT.max, 'quyết tâm trong bản lưu bị sửa tay vẫn bị chặn ở mức tối đa');
  // nguồn linh khí: tinh anh không dính hệ vẫn cho dấu ấn của vùng; quái thường rơi viên linh khí, nhặt mới có
  G.testSave({ lvl: 20, sharpen: 6 }); G.save.tut.done = true;
  G.startStage(0, 1, 0); let W = G.getWorld(); W.waves = []; W.spawns = []; W.ents = [];
  const w0 = G.curW(G.getRun().P), m0 = w0.marks.poison;
  const el = G.spawnEnemy('elite', W.P.x + 30, W.P.y, {}); el.inside = true; G.kill(el, {});
  ok(Math.abs(w0.marks.poison - m0 - G.LINHKHI.elite * G.getRun().P.markMult) < 0.01, 'hạ tinh anh không dính hệ: +' + G.LINHKHI.elite + ' dấu ấn Độc của Rừng già');
  const r0 = G.rnd; G.rnd = () => 0.01;
  const mob = G.spawnEnemy('rusher', W.P.x + 60, W.P.y, {}); mob.inside = true; const m1 = w0.marks.poison; G.kill(mob, {});
  G.rnd = r0;
  const orb = W.props.find((o) => o.type === 'loot' && o.kind === 'linhkhi');
  ok(orb && w0.marks.poison === m1, 'quái thường rơi viên linh khí trên sàn, chưa nhặt thì chưa có');
  if (orb) { orb.born = -9; orb.x = W.P.x; orb.y = W.P.y - 4; G.doRoi.hut(W, W.P, 1 / 60); }
  ok(Math.abs(w0.marks.poison - m1 - G.LINHKHI.orb * G.getRun().P.markMult) < 0.01, 'nhặt viên linh khí: vũ khí đang cầm +' + G.LINHKHI.orb + ' dấu ấn');
  G.resetSave();
  return out;
}
"""

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    n = int(args[0]) if args else 12
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
            if k == 0:
                bad_luat = 0
                for good, msg in pg.evaluate(LUAT):
                    print(('đạt ' if good else 'HỎNG ') + msg)
                    bad_luat += 0 if good else 1
                if bad_luat: errs.append('%d luật hỏng' % bad_luat)
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
    print('| Ải | Số lần chơi (trung bình) | Trung vị | Lần thử ải mới | Thua | Thời gian (phút) | Cấp khi qua | Sức mạnh khi qua / khuyên dùng | Mục tiêu |')
    print('|---|---|---|---|---|---|---|---|---|')
    for k in range(upto):
        avg = lambda key: sum(r['st'][k][key] for r in ok) / m
        lo, hi = muc_tieu(k)
        pl = avg('plays')
        flag = '' if lo * 0.8 <= pl <= hi * 1.25 else ' ✗'  # cho lệch 20-25% vì trùm và đồ rơi hên xui, 12 lượt vẫn còn dao động
        if flag and mode == 'khuyen': bad = 1
        med = sorted(r['st'][k]['plays'] for r in ok)[m // 2] if m % 2 else sum(sorted(r['st'][k]['plays'] for r in ok)[m // 2 - 1:m // 2 + 1]) / 2
        print(f"| {k//5+1}-{k%5+1} | {pl:.1f}{flag} | {med:g} | {avg('tries'):.1f} | {avg('fails'):.1f} | {avg('t')/60:.0f} | {avg('lvl'):.0f} | {avg('pw'):.0f} / {avg('rec'):.0f} | {lo:g}-{hi:g} |")
    tt = sum(r['t'] for r in ok) / m / 60
    ts = sorted(r['t'] / 60 for r in ok)
    print(f"Tổng thời gian đi hết {upto} ải lần đầu: trung bình {tt:.0f} phút ({tt/60:.1f} giờ), trung vị {ts[m//2]:.0f} phút, nhanh nhất {ts[0]:.0f}, lâu nhất {ts[-1]:.0f}; {sum(sum(s['plays'] for s in r['st']) for r in ok)/m:.0f} lần chơi")
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
