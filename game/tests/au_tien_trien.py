"""AUDIT (phiên au-vong-lap) — đo tiến triển, CHỈ ĐO, không sửa game.
  cap      : sức mạnh, sát thương một đòn, máu ở cấp 1/10/20/30/40 (cùng một kiếm Thường +0, không điểm kỹ năng) và
             với bản lưu thật của bot (tests/cay_luu.json, lúc vừa đủ khuyên dùng từng ải): số đòn hạ một Lính xông, số đòn chịu được.
  kynang   : số điểm kỹ năng theo cấp, số nút, cấp nào học hết.
  linhkhi  : bot chơi chiến dịch như tests/cay.py (kiểu "khuyen") và ghi dấu ấn của vũ khí đang mang sau mỗi lượt:
             thời gian trò chơi tới khi một vũ khí đạt 30/120/300, số lần đổi vũ khí làm mất tiến độ.
  embe     : 4 em bé cùng một bản lưu (cùng cấp, cùng vũ khí, cùng đồ) ở vài ải: tỉ lệ thắng, thời gian, máu mất, nguồn mất máu.
  lop      : mỗi lớp nâng cấp góp bao nhiêu % Sức mạnh (bỏ lớp đó khỏi bản lưu thật của bot).
Chạy: python3 tests/au_tien_trien.py [cap|kynang|linhkhi|embe|lop ...] [--n=số lượt]"""
import sys, json, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOT = {'react': 0.3, 'missProj': 0.33}  # như tests/cay.py: bot hơi vụng như người mới

CAP = r"""
(saves) => {
  const out = { base: [], real: [] };
  for (const L of [1, 10, 20, 30, 40]) {
    G.testSave({ lvl: L, sk: { atk: 0, def: 0, elem: 0 } });
    if (G.chuong) for (const k of G.HKEYS) { const h = G.save.heroes[k]; if (h.ch) { h.ch.pts = {}; } }
    const P = G.buildPlayer(), w = G.weaponById(G.save.carry[0]);
    out.base.push({ lvl: L, power: G.power(), dmg: +G.pDamage(P, w).toFixed(1), hp: P.maxhp, dmgX: +(1 + G.LVL_DMG * (L - 1)).toFixed(3), hpX: +(1 + G.LVL_HP * (L - 1)).toFixed(3) });
  }
  saves.forEach((s, k) => {
    if (!s) return;
    G.save = G.fixSave(JSON.parse(s)); G.save.sound = false;
    const r = Math.floor(k / 5), i = k % 5, st = G.stageStats(r, i, 0);
    const P = G.buildPlayer(), w = P.weapons[0];
    const dmg = G.pDamage(P, w) * P.dmgMult;
    const mobHp = st.hp * G.ROLES.rusher.hp, mobDmg = st.dmg * G.ROLES.rusher.dmg * (1 - Math.min(0.75, P.dr));
    const bossHp = st.hp * (i === 4 ? (G.BOSS_HP_OF[G.REGIONS[r].boss] || G.BOSS_HP) : G.MINI_HP) * st.bossHp;
    out.real.push({ st: (r + 1) + '-' + (i + 1), lvl: G.save.heroes[G.save.hero].lvl, power: G.power(), rec: G.stageRec(r, i, 0), weapon: G.WTYPES[w.type].name + ' ' + G.RARITY[G.wRar(w)].name + ' +' + w.sharpen,
      dmg: +dmg.toFixed(1), hp: P.maxhp, dr: Math.round(P.dr * 100), mobHp: Math.round(mobHp), mobDmg: +mobDmg.toFixed(1),
      hitsToKill: +(mobHp / dmg).toFixed(1), hitsToDie: +(P.maxhp / mobDmg).toFixed(1), bossHits: Math.round(bossHp / dmg) });
  });
  return out;
}
"""

KYNANG = r"""
() => {
  const nodes = G.SKEYS.reduce((n, b) => n + G.SKILLS[b].nodes.length, 0);
  const pts = (L) => Math.floor(L / 3);
  let full = null; for (let L = 1; L <= G.MAX_LEVEL; L++) if (pts(L) >= nodes && full == null) full = L;
  const ch = G.chuong ? { trees: Object.keys(G.CHUONG.trees), info: (() => { try { G.testSave({ lvl: 40 }); const h = G.save.heroes.smith; return G.chuong.pts(h, 'smith'); } catch (e) { return String(e); } })() } : null;
  let xpTot = 0; for (let L = 1; L < G.MAX_LEVEL; L++) xpTot += G.xpNeed(L);
  return { nodes, ranksPerNode: 1, ptsAt: [1, 10, 15, 20, 30, 40].map((L) => [L, pts(L)]), fullAt: full, maxPts: pts(G.MAX_LEVEL), xpTo40: xpTot,
    stageXp: Array.from({ length: 15 }, (_, n) => G.stageStats(Math.floor(n / 5), n % 5, 0).xp), chuong: ch };
}
"""

AUTO = r"""
() => {
  const sv = G.save;
  const cap = G.FORGE_CAP[Math.min(G.FORGE_CAP.length - 1, sv.forge + 1)];
  const pw = (w) => G.wRarMult(w) * G.STAGE_MULT[G.wStage(w)] * (1 + 0.08 * Math.max(w.sharpen, cap - 3));
  const melee = sv.weapons.filter((w) => w.type !== 'bow').sort((a, b) => pw(b) - pw(a))[0];
  const bow = sv.weapons.filter((w) => w.type === 'bow').sort((a, b) => pw(b) - pw(a))[0];
  if (melee) sv.carry[0] = melee.id;
  if (bow) sv.carry[1] = bow.id;
  G.upg.auto(sv, { skip: ['carry'] });
  const best = (w) => { let el = w.branch; if (!el) { el = 'fire'; for (const e of G.ELS) if (w.marks[e] > w.marks[el]) el = e; } return { id: w.id, el, m: Math.floor(w.marks[el]), st: G.wStage(w), rar: G.wRar(w), type: w.type }; };
  const allMax = Math.max(...sv.weapons.map((w) => Math.max(w.marks.fire, w.marks.poison, w.marks.ice)));
  return { carry: sv.carry.map(G.weaponById).filter(Boolean).map(best), allMax: Math.floor(allMax), power: G.power(), lvl: sv.heroes[sv.hero].lvl, nW: sv.weapons.length };
}
"""

def linhkhi(pg, hero, cay, upto=15):
    pg.evaluate("(c) => { G.resetSave(); G.save.sound = false; Object.assign(G.botCfg, c); }", BOT)
    if hero != 'smith':
        pg.evaluate("(h) => { for (const k of G.HKEYS) G.save.heroes[k].unlocked = true; G.save.hero = h; }", hero)
    pg.evaluate("(c) => { if (G.chuong) for (const k of G.HKEYS) { G.chuong.use(G.save.heroes[k], c, k); G.save.heroes[k].ch.cay = c; } }", cay)
    cleared, grind_run, must, t = -1, 0, False, 0
    hit = {30: None, 120: None, 300: None}
    hitAny = {30: None, 120: None, 300: None}
    swaps, last_ids, plays, perRun = 0, None, 0, []
    while cleared < upto - 1 and plays < 160:
        v = pg.evaluate(AUTO)
        ids = [c['id'] for c in v['carry']]
        if last_ids is not None:
            for a, b in zip(last_ids, ids):
                if a != b: swaps += 1
        last_ids = ids
        nxt = cleared + 1
        rec = pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(nxt, 5)))
        grind = cleared >= 0 and (must or (v['power'] < rec and grind_run < 8))
        k = cleared if grind else nxt
        if grind and cleared % 5 == 4: k = cleared - 1
        pg.evaluate("([r, i]) => G.startStage(r, i, 0)", list(divmod(k, 5)))
        res = pg.evaluate("G.probeRun(900)")
        t += res.get('t') or 0
        plays += 1
        v2 = pg.evaluate(AUTO)
        cm = max([c['m'] for c in v2['carry']] or [0])
        perRun.append(res.get('marks') or 0)
        for th in (30, 120, 300):
            if hit[th] is None and cm >= th: hit[th] = (round(t / 60), plays, k)
            if hitAny[th] is None and v2['allMax'] >= th: hitAny[th] = (round(t / 60), plays, k)
        if grind:
            grind_run += 1; must = False; continue
        grind_run = 0
        if res.get('win'): cleared = nxt
        else: must = True
    v = pg.evaluate(AUTO)
    return {'hero': hero, 'cay': cay, 'minutes': round(t / 60), 'plays': plays, 'cleared': cleared + 1, 'hit': hit, 'hitAny': hitAny, 'swaps': swaps,
            'marksPerRun': round(sum(perRun) / max(1, len(perRun)), 1), 'end': v}

EMBE = r"""
([save, r, i, n, hero]) => {
  const out = { win: 0, t: 0, hpLost: 0, hurt: {}, dodges: 0, kills: 0, n };
  for (let k = 0; k < n; k++) {
    const s = G.fixSave(JSON.parse(save));
    const src = s.heroes[s.hero];
    for (const h of G.HKEYS) s.heroes[h].unlocked = true;
    s.heroes[hero].lvl = src.lvl; s.heroes[hero].sk = Object.assign({}, src.sk);
    if (src.ch && s.heroes[hero].ch) s.heroes[hero].ch = JSON.parse(JSON.stringify(src.ch));
    s.hero = hero; s.sound = false; G.save = s;
    G.startStage(r, i, 0);
    const res = G.probeRun(900);
    if (res.win) out.win++;
    out.t += res.t || 0; out.dodges += res.dodges || 0; out.kills += res.kills || 0;
    for (const kk in res.hurt || {}) { const q = kk.split(':')[1]; out.hurt[q] = (out.hurt[q] || 0) + res.hurt[kk]; out.hpLost += res.hurt[kk]; }
  }
  const P = G.buildPlayer();
  out.maxhp = P.maxhp; out.power = G.power(); out.dr = P.dr; out.speed = P.speed;
  return out;
}
"""

# Phần đóng góp của từng lớp vào Sức mạnh: bỏ lần lượt từng lớp khỏi bản lưu thật (bot vừa đủ khuyên dùng ải 2-5 và 3-5).
LOP = r"""
(save) => {
  const base = () => { G.save = G.fixSave(JSON.parse(save)); G.save.sound = false; return G.save; };
  const hk = (s) => s.heroes[s.hero];
  const carry = (s) => s.carry.map((id) => s.weapons.find((w) => w.id === id)).filter(Boolean);
  const cut = {
    'cấp hero (về 1)': (s) => { hk(s).lvl = 1; hk(s).sk = { atk: 0, def: 0, elem: 0 }; if (hk(s).ch) hk(s).ch.n = {}; },
    'chỉ cấp, giữ điểm': null,
    'cây kỹ năng': (s) => { hk(s).sk = { atk: 0, def: 0, elem: 0 }; },
    'cây chưởng': (s) => { if (hk(s).ch) hk(s).ch.n = {}; },
    'mài': (s) => { for (const w of carry(s)) w.sharpen = 0; },
    'bậc màu (về Thường)': (s) => { for (const w of carry(s)) { w.rarity = 0; if (w.tier != null) w.tier = 0; w.affixes = []; w.power = null; } },
    'tiến hóa linh khí': (s) => { for (const w of carry(s)) { w.marks = { fire: 0, poison: 0, ice: 0 }; w.branch = null; } },
    'trang phục': (s) => { if (s.outfit) { s.outfit.items = []; s.outfit.worn = {}; } s.armor = null; s.helm = null; s.charm = null; },
  };
  const s0 = base(), p0 = G.power(), out = { full: p0, lvl: hk(s0).lvl, parts: {} };
  for (const k in cut) { if (!cut[k]) continue; const s = base(); cut[k](s); G.save = s; out.parts[k] = Math.round((1 - G.power() / p0) * 100); }
  return out;
}
"""

def page(p, errs):
    pg = p.chromium.launch().new_page(viewport={'width': 844, 'height': 390})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + HERE + '/index.html')
    pg.wait_for_timeout(1200)
    pg.add_script_tag(path=HERE + '/tests/bot.js')
    pg.add_script_tag(path=HERE + '/tests/setup.js')
    return pg

def main():
    what = [a for a in sys.argv[1:] if not a.startswith('-')] or ['cap', 'kynang', 'lop', 'linhkhi', 'embe']
    nn = [int(a.split('=')[1]) for a in sys.argv if a.startswith('--n=')]
    errs = []
    saves = json.load(open(HERE + '/tests/cay_luu.json'))
    with sync_playwright() as p:
        pg = page(p, errs)
        if 'cap' in what:
            o = pg.evaluate(CAP, saves)
            print('== CẤP (kiếm Thường +0, không điểm kỹ năng, Thợ Rèn) ==')
            for x in o['base']: print(' ', json.dumps(x, ensure_ascii=False))
            print('== BẢN LƯU THẬT CỦA BOT (tests/cay_luu.json: lúc vừa đủ khuyên dùng từng ải) ==')
            for x in o['real']: print(' ', json.dumps(x, ensure_ascii=False))
        if 'lop' in what:
            print('== MỖI LỚP GÓP BAO NHIÊU % SỨC MẠNH (bỏ lớp đó đi thì sức mạnh giảm bấy nhiêu %) ==')
            for k in (4, 9, 14):
                print('  ải', f"{k//5+1}-{k%5+1}", json.dumps(pg.evaluate(LOP, saves[k]), ensure_ascii=False))
        if 'kynang' in what:
            print('== CÂY KỸ NĂNG ==')
            print(' ', json.dumps(pg.evaluate(KYNANG), ensure_ascii=False))
        if 'linhkhi' in what:
            n = nn[0] if nn else 3
            print('== LINH KHÍ (bot chiến dịch, %d lượt) ==' % n)
            plan = [('smith', 'hoa'), ('smith', 'doc'), ('smith', 'bang'), ('hunter', 'hoa'), ('healer', 'doc'), ('wrestler', 'bang')][:n]
            for hero, cay in plan:
                print(' ', json.dumps(linhkhi(pg, hero, cay), ensure_ascii=False)); sys.stdout.flush()
        if 'embe' in what:
            n = nn[0] if nn else 4
            print('== 4 EM BÉ, cùng bản lưu (%d lượt mỗi ải) ==' % n)
            for k in (2, 6, 9, 12, 14):
                r, i = divmod(k, 5)
                for hero in ('smith', 'hunter', 'healer', 'wrestler'):
                    o = pg.evaluate(EMBE, [saves[k], r, i, n, hero])
                    hurt = ', '.join(f"{a} {b}" for a, b in sorted(o['hurt'].items(), key=lambda kv: -kv[1])[:4])
                    print(f"  ải {r+1}-{i+1} {hero:8} thắng {o['win']}/{n}  thời gian TB {o['t']/n:.0f}s  máu mất TB {o['hpLost']/n:.0f} (máu tối đa {o['maxhp']}, giảm {o['dr']*100:.0f}%)  né TB {o['dodges']/n:.0f}  hạ TB {o['kills']/n:.0f}  sức mạnh {o['power']} | {hurt}")
                    sys.stdout.flush()
    if errs: print('LỖI TRANG:', errs[:3])

main()
