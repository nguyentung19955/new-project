"""CÂN BẰNG PHẢI CÀY: bot chơi từ bản lưu mới như một người chơi bình thường và đếm số lần chơi cần cho từng ải.

Cách bot chơi (mỗi lượt):
  - Cây chưởng: lượt chiến dịch 1, 4, 7... dùng Hỏa chưởng; 2, 5, 8... Độc chưởng; 3, 6, 9... Băng chưởng. Học hết điểm chưởng mỗi lần về làng.
  - Ở làng: học kỹ năng, nâng lò, nâng bậc, mài, rèn và mặc đồ tốt nhất, mang vũ khí mạnh nhất (như người chơi chăm chỉ).
  - Kiểu "khuyen" (mặc định): nhìn "Sức mạnh khuyên dùng" của ải kế; sức mạnh chưa đủ (chưa xanh) thì chơi lại ải mới nhất đã qua
    để cày (tối đa 8 lượt liền; cày 3 lượt mà sức mạnh không tăng thì thử luôn), đủ thì vào ải mới. Thua thì về làng nâng cấp và chơi lại ải cũ một lượt rồi mới thử lại.
  - Kiểu "lieu": không nhìn lời khuyên, cứ vào ải mới; thua thì chơi lại ải cũ một lượt rồi thử lại.
Số lần chơi của một ải = mọi lượt (kể cả chơi lại ải cũ và lượt thua) từ lúc qua ải trước cho tới lúc qua ải đó.
Bot chơi hơi vụng như người mới (phản xạ chậm hơn, bỏ sót nhiều đạn hơn bot mặc định).

Chạy: python3 tests/cay.py [số lượt chiến dịch, mặc định 12] [khuyen|lieu] [--nhanh: chỉ kiểm vùng 1] [--ban: bot bán đồ thừa]
Thoát mã 1 nếu không đạt mục tiêu (hàm muc_tieu, cho lệch 20-25% vì số lần chơi ở trùm hên xui), tổng thời gian ngoài 2,5-4 giờ,
có luật hỏng hoặc có lỗi trang."""
import sys, json, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOT = {'react': 0.3, 'missProj': 0.33}

AUTO = r"""
() => {
  const sv = G.save, api = G.villageApi;
  // chọn vũ khí theo sức tiềm năng: bậc cao mà chưa mài vẫn đáng mang (mài lại được), như người chơi tính trước
  const cap = G.FORGE_CAP[Math.min(G.FORGE_CAP.length - 1, sv.forge + 1)];
  const pw = (w) => G.wRarMult(w) * G.STAGE_MULT[G.wStage(w)] * (1 + 0.08 * Math.max(w.sharpen, cap - 3));
  const melee = sv.weapons.filter((w) => w.type !== 'bow').sort((a, b) => pw(b) - pw(a))[0];
  const bow = sv.weapons.filter((w) => w.type === 'bow').sort((a, b) => pw(b) - pw(a))[0];
  if (melee) sv.carry[0] = melee.id;
  if (bow) sv.carry[1] = bow.id;
  // Nâng cấp như người chơi (js/upgrade.js): lặp "việc làm ngay được mà Sức mạnh tăng nhiều nhất trên mỗi đồng bỏ ra" — học kỹ năng,
  // mài, nâng bậc, lên Vàng, nâng lò, mua, may, mặc, nâng bậc trang phục, mở cấp cánh. Vũ khí mang theo đã chọn ở trên.
  const did = G.upg.auto(sv, { skip: ['carry'] });
  // --ban: bán đồ thừa như người chơi dọn kho (js/ban_do.js) sau khi đã nâng cấp xong; vàng dùng cho lượt nâng cấp sau.
  // Đồ thừa: trang phục không mặc, bậc không cao hơn món đang mặc cùng ô; vũ khí trong rương, bậc không cao hơn vũ khí đang mang.
  if (window.__ban && G.banDo) {
    const O2 = G.outfit, BD = G.banDo;
    const oj = sv.outfit.items.filter((it) => { const w = O2.worn(sv, O2.ITEMS[it.k].slot); return w && w.id !== it.id && it.r <= w.r && !BD.why(sv, 'o', it); }).map((it) => it.id);
    const minR = Math.min(...sv.carry.map(G.weaponById).filter(Boolean).map(G.wRar));
    const wj = sv.weapons.filter((w) => !BD.why(sv, 'w', w) && G.wRar(w) <= minR).map((w) => w.id);
    const a = BD.sell(sv, 'o', oj), b = BD.sell(sv, 'w', wj);
    window.__banVang = (window.__banVang || 0) + a.gold + b.gold; window.__banTP = (window.__banTP || 0) + a.gold;
  }
  const carry = () => sv.carry.map(G.weaponById).filter(Boolean);
  const O = G.outfit;
  const hs = sv.heroes[sv.hero];
  const look = O && sv.outfit ? O.SLOTS.map((k) => { const it = O.worn(sv, k); return it ? it.k + it.r : '-'; }).join(',') : sv.armor;
  const P = G.buildPlayer();
  // chỗ nên cày: như người chơi đọc gợi ý ở bảng thua (js/upgrade.js), lấy việc đáng làm nhất còn thiếu đồ
  const nx = G.upg.grindTarget(sv);
  const block = G.upg.rate(sv, G.upg.list(sv).filter((q) => q.kind !== 'carry')).filter((q) => !q.ok && q.gain > 0 && q.miss).sort((a, b) => b.gain - a.gain).slice(0, 2).map((q) => q.title + ' [' + G.upg.missText(sv, q.miss) + ']');
  const pp = G.powerParts();
  return { off: Math.round(pp.off * 100) / 100, ehp: Math.round(pp.ehp), did, block, where: nx ? nx[0] * 5 + nx[1] : null, mats: sv.mats.join('/'), shards: sv.shards.join('/'), stones: sv.stones, hp: P.maxhp, dr: Math.round(P.dr * 100), lvl: hs.lvl, power: G.power(), gold: sv.gold, ore: sv.ore, forge: sv.forge, armor: look,
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
CAY = ['hoa', 'doc', 'bang']  # cây chưởng bot dùng, lần lượt theo lượt chiến dịch (js/chuong.js)
def campaign(pg, mode, upto, cay='hoa'):
    seen = set()
    def s_first(k):
        if k in seen: return False
        seen.add(k); return True
    pg.evaluate("(c) => { G.resetSave(); G.save.sound = false; Object.assign(G.botCfg, c); }", BOT)
    # bot chọn một cây chưởng rồi học dần điểm chưởng như người chơi (G.upg.auto học hết điểm chưởng theo G.chuong.PLAN)
    pg.evaluate("(c) => { if (G.chuong) for (const k of G.HKEYS) { G.chuong.use(G.save.heroes[k], c, k); G.save.heroes[k].ch.cay = c; } }", cay)
    pg.evaluate("(b) => { window.__ban = b; window.__banVang = 0; window.__banTP = 0; }", '--ban' in sys.argv)
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
        if grind and cleared % 5 == 4 and v['power'] < 1.15 * pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(cleared, 5))):
            k = cleared - 1  # vừa qua trùm vùng mà chưa dư sức: cày ải 4 của vùng đó (dễ thắng hơn đánh lại trùm), như người chơi
        wh = v.get('where')
        if grind and wh is not None and wh <= cleared and (wh % 5 < 4 or v['power'] >= 1.15 * pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(wh, 5)))):
            k = wh  # cày đúng chỗ bảng gợi ý chỉ: thiếu mảnh trùm thì đánh lại trùm, thiếu nguyên liệu vùng nào thì chơi lại vùng đó
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
        log.append(f"{'cày ' if grind else 'thử '}{r+1}-{i+1} {'thắng' if win else 'THUA '} {t:>3}s cấp {v['lvl']:>2} sức mạnh {v['power']:>4}/{rec:<4} {v['carry']} {v['armor']} vàng {v['gold']} quặng {v['ore']} nl {v['mats']} mảnh {v['shards']} đá {v['stones']} máu {v['hp']} giáp {v['dr']}% off {v['off']} ehp {v['ehp']} | {'; '.join(v['block'])}")
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
    return {'st': st, 't': tot_t, 'hurt': hurt, 'log': log, 'ban': pg.evaluate('window.__banVang || 0'), 'banTP': pg.evaluate('window.__banTP || 0')}, None

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
  // KHÔNG còn "Quyết tâm": thua bao nhiêu lần cũng không làm bé mạnh thêm, không có chữ, không có trường lưu
  G.resetSave(); G.save.sound = false; G.save.tut.done = true;
  const P0 = G.buildPlayer(), pw0 = G.power();
  for (let k = 0; k < 6; k++) { G.startStage(0, 1, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120); }
  const R6 = G.getRun().result;
  ok(G.save.grit === undefined && G.GRIT === undefined, 'thua 6 lần liền ở ải 1-2: không còn trường quyết tâm trong bản lưu và trong dữ liệu');
  G.startStage(0, 1, 0); const S = G.getRun();
  ok(S.P.maxhp === P0.maxhp && S.P.dmgMult === P0.dmgMult && S.power === pw0 && !('grit' in S), 'vào lại ải sau 6 lần thua: máu ' + S.P.maxhp + ', sát thương x' + S.P.dmgMult + ', sức mạnh ' + S.power + ' như lúc đầu (không tăng)');
  ok(!R6.lines.some((l) => typeof l === 'string' && /quyết tâm|mạnh thêm/i.test(l)), 'bảng thua không còn dòng "quyết tâm"');
  ok(S.base.hp === G.stageStats(0, 1, 0).hp && S.base.dmg === G.stageStats(0, 1, 0).dmg, 'thua nhiều cũng không làm quái yếu đi');
  S.quit = true; G.finishStage(false);
  // bản lưu cũ còn trường grit vẫn đọc được, trường đó bị xoá
  const old = JSON.parse(JSON.stringify(G.save)); old.grit = { '0-1': 3, '2-4': 99, x: 'a' }; old.heroes.smith.lvl = 12;
  const fx = G.fixSave(JSON.parse(JSON.stringify(old)));
  ok(fx.grit === undefined && fx.heroes.smith.lvl === 12, 'bản lưu cũ có "quyết tâm" vẫn đọc được, trường đó bị bỏ');
  // TRẦN MỚI: cấp 40, mài +15 (lò cấp 4)
  ok(G.MAX_LEVEL === 40 && G.MAX_SHARPEN === 15 && G.FORGE_CAP[G.FORGE_CAP.length - 1] === 15 && G.FORGE_UP[3] && G.FORGE_UP[3].mat[2] > 0, 'trần mới: cấp 40, mài +15 với lò cấp 4 (cần đá lửa)');
  const big = JSON.parse(JSON.stringify(G.save)); big.heroes.smith.lvl = 40; big.forge = 4; big.weapons[0].sharpen = 15;
  const fb = G.fixSave(big);
  ok(fb.heroes.smith.lvl === 40 && fb.forge === 4 && fb.weapons[0].sharpen === 15, 'bản lưu cấp 40, lò 4, mài +15 đọc lại đúng');
  // chỉ cày nâng cấp (không đồ của Hồ Tinh) mà vẫn vượt xa khuyên dùng của Hồ Tinh
  G.resetSave(); G.save.tut.done = true;
  const sv = G.save, w0 = G.weaponById(sv.carry[0]);
  sv.heroes.smith.lvl = 40; sv.heroes.smith.sk = { atk: 5, def: 5, elem: 3 }; sv.forge = 4;
  w0.rarity = 3; w0.gold = 1; w0.sharpen = 15; w0.branch = 'fire'; w0.marks.fire = 300;
  const w1 = G.weaponById(sv.carry[1]); w1.rarity = 3; w1.gold = 1; w1.sharpen = 15; w1.branch = 'ice'; w1.marks.ice = 300;
  const O = G.outfit; for (const k of ['mu_vay_ca', 'ao_vay', 'khan_bang', 'bua_oc']) O.wear(sv, O.add(sv, k, 3)); O.wear(sv, O.add(sv, 'canh_bang', 3, { lv: 3 }));
  const top = G.power(), need = G.STAGE_REC[14];
  ok(top >= need * 1.4, 'trần trước Hồ Tinh (cấp 40, hai vũ khí Vàng Ngư Tinh +15, Thức tỉnh, bộ Hang Biển Vàng, cánh lớn): sức mạnh ' + top + ' >= 1,4 x khuyên dùng Hồ Tinh ' + need);
  sv.heroes.smith.lvl = 30; sv.forge = 3; w0.sharpen = 10; w1.sharpen = 10; const old30 = G.power();
  ok(top > old30 * 1.15, 'trần mới cao hơn trần cũ (cấp 30, mài +10) rõ rệt: ' + old30 + ' -> ' + top);
  // GỢI Ý Ở BẢNG THUA
  G.resetSave(); G.save.tut.done = true;
  const s2 = G.save; s2.heroes.smith.lvl = 7; s2.gold = 120; s2.ore = 3; s2.mats = [2, 0, 0]; s2.stars = { '0-0': 3, '0-1': 2, '0-2': 2, '0-3': 1 };
  G.startStage(0, 4, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120);
  const T = G.getRun().result.tips;
  ok(T && T.tips.length >= 2 && T.tips.length <= 3, 'bảng thua có 2-3 gợi ý: ' + (T ? T.tips.map((t) => t.text + ' (' + t.sub + ')').join(' | ') : 'không có'));
  ok(T && T.power === G.power() && T.rec === G.stageRec(0, 4, 0), 'bảng thua so Sức mạnh hiện tại ' + (T && T.power) + ' với khuyên dùng ' + (T && T.rec));
  ok(T && T.tips[0].kind === 'skill' && /2 điểm kỹ năng/.test(T.tips[0].text), 'còn điểm kỹ năng thì gợi ý học trước tiên');
  ok(T && T.tips[1] && T.tips[1].kind === 'chuong' && /7 điểm chưởng/.test(T.tips[1].text), 'còn điểm chưởng thì gợi ý học ngay sau điểm kỹ năng: ' + (T && T.tips[1] && T.tips[1].text));
  ok(T && T.tips.every((t) => (t.gain > 0 || t.kind === 'skill' || t.kind === 'chuong') && t.go && (t.go.who || t.go.weapon != null)), 'gợi ý nào cũng tăng sức mạnh (hoặc là điểm kỹ năng chưa học) và có chỗ để đi tới');
  // gợi ý đúng số còn thiếu: mài khi thiếu vàng
  G.resetSave(); G.save.tut.done = true;
  const s3 = G.save, w3 = G.weaponById(s3.carry[0]); s3.forge = 2; w3.sharpen = 5; s3.gold = 220; s3.ore = 50; s3.mats = [0, 9, 0]; s3.stars = { '0-0': 1, '0-1': 1, '1-0': 1, '1-1': 1 };
  const L3 = G.upg.rate(s3, G.upg.list(s3)), sh = L3.find((q) => q.kind === 'sharpen' && q.key === 'sh' + w3.id);
  const tx = sh && G.upg.missText(s3, sh.miss);
  ok(sh && sh.title === 'Mài ' + G.wName(w3).replace(/ \+\d+$/, '') + ' lên +6' && !sh.ok && tx.indexOf('thiếu 80 vàng') === 0, 'gợi ý mài lên +6 ghi đúng "thiếu 80 vàng" (giá 300, có 220): ' + (sh && sh.title) + ' — ' + tx);
  const ti = L3.find((q) => q.kind === 'tier' && q.key === 'ti' + w3.id);
  s3.gold = 1000; s3.mats = [6, 2, 0]; s3.ore = 10; w3.rarity = 1;
  const L4 = G.upg.rate(s3, G.upg.list(s3)), ti2 = L4.find((q) => q.kind === 'tier' && q.key === 'ti' + w3.id), tx2 = ti2 && G.upg.missText(s3, ti2.miss);
  ok(ti2 && /lên Tím/.test(ti2.title) && /thiếu 6 vảy cá.* — chơi lại Hang biển 2/.test(tx2) && /1 đá tôi/.test(tx2), 'gợi ý nâng lên Tím: thiếu vảy cá thì chỉ chơi lại ải Hang biển đã qua: ' + tx2);
  // bấm gợi ý thì về làng mở đúng người
  G.villageGo = { who: 'ren', ftab: 'tier', sel: w3.id }; G.setScene(G.Village);
  const V = G.villageApi.V;
  ok(V.who === 'ren' && V.tab === 'forge' && V.ftab === 'tier' && V.sel === w3.id, 'bấm gợi ý nâng bậc: về làng mở lò rèn, thẻ Nâng bậc, chọn sẵn vũ khí');
  G.villageGo = { who: 'lai', stage: [1, 1] }; G.setScene(G.Village);
  ok(V.who === 'lai' && V.tab === 'map' && V.sel && V.sel[0] === 1 && V.sel[1] === 1, 'bấm gợi ý lên cấp: mở tranh bản đồ, chọn sẵn ải nên chơi lại');
  G.villageGo = { who: 'do' }; G.setScene(G.Village);
  ok(V.who === 'do' && V.tab === 'skill', 'bấm gợi ý kỹ năng: mở cây kỹ năng của Cụ Đồ');
  G.villageApi.goHub();
  // bot nâng cấp tự động chỉ tiêu tài nguyên đang có, không bao giờ âm
  G.resetSave(); const s5 = G.save; s5.heroes.smith.lvl = 9; s5.gold = 2000; s5.ore = 40; s5.mats = [30, 10, 0]; s5.stones = 2;
  const pb = G.power(), did = G.upg.auto(s5), pa = G.power();
  ok(pa > pb && s5.gold >= 0 && s5.ore >= 0 && s5.mats.every((x) => x >= 0) && s5.stones >= 0, 'nâng cấp tự động (bot): sức mạnh ' + pb + ' -> ' + pa + ' sau ' + did.length + ' việc, không tiêu quá số có');
  {
  // nguồn linh khí: tinh anh không dính hệ vẫn cho dấu ấn của vùng; quái thường không rơi viên linh khí
  G.testSave({ lvl: 20, sharpen: 6 }); G.save.tut.done = true;
  G.startStage(0, 1, 0); let W = G.getWorld(); W.waves = []; W.spawns = []; W.ents = [];
  const w0 = G.curW(G.getRun().P), m0 = w0.marks.poison;
  const el = G.spawnEnemy('elite', W.P.x + 30, W.P.y, {}); el.inside = true; G.kill(el, {});
  ok(Math.abs(w0.marks.poison - m0 - G.LINHKHI.elite * G.getRun().P.markMult) < 0.01, 'hạ tinh anh không dính hệ: +' + G.LINHKHI.elite + ' dấu ấn Độc của Rừng già');
  const r0 = G.rnd; G.rnd = () => 0.01;
  const mob = G.spawnEnemy('rusher', W.P.x + 60, W.P.y, {}); mob.inside = true; const m1 = w0.marks.poison; G.kill(mob, {});
  G.rnd = r0;
  const orb = W.props.find((o) => o.type === 'loot' && o.kind === 'linhkhi');
  ok(G.LINHKHI.drop === 0 && !orb && w0.marks.poison === m1, 'quái thường không rơi viên linh khí (chủ dự án bỏ, tinh anh và trùm đã đủ)');
  }
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
            out, why = campaign(pg, mode, upto, CAY[k % 3])
            pg.close()
            if not out:
                print('Lượt', k + 1, 'không xong:', why); runs.append(None); continue
            runs.append(out)
            if '-v' in sys.argv:
                print('\n'.join(out['log']))
            print(f"lượt {k+1}: bán đồ được {out['ban']} vàng (trang phục {out['banTP']}), tổng {out['t']/60:.0f} phút, {sum(s['plays'] for s in out['st'])} lần chơi | " + ' '.join(str(s['plays']) for s in out['st'][:upto]))
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
