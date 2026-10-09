"""Đo sát thương theo thời gian của bốn vũ khí khi bot chơi trong một phòng tập có quái hồi sinh liên tục.
Mỗi vũ khí đo ở bốn trạng thái: chưa có hệ, và Thức tỉnh Lửa, Độc, Băng. Số ngẫu nhiên có hạt giống nên chạy lại ra đúng số cũ.
Từ đợt ghép 2 game chỉ còn phòng vuông, nên bài này đo trong phòng thật:
  python3 tests/dps.py [giây mỗi lượt] [số hạt giống] [nho | trum] [mot] [khonghe]
    nho (mặc định): phòng thường, sàn 208x196      trum: phòng trùm, sàn 300x198 (không có trùm)
    mot: chỉ một quái (máu dày) thay cho cụm năm quái     khonghe: chỉ đo vũ khí chưa có hệ (nhanh hơn)
    quaimoi: đánh quái mới thật (js/mobs.js: giáp che trước, lặn, cử động xuất hiện...) thay cho bia tập kiểu cũ.
      Cân bằng phải cày: cụm quái mới có máu x2,5 (như quái các ải sau khi cân bằng), để số đo không bị giới hạn bởi thời gian quái
      diễn cử động xuất hiện (trước đây quái chết nhanh hơn tốc độ mọc nên mọi vũ khí như nhau, cung chỉ thấp hơn kiếm khoảng 11%).
  Mặc định đo trên bia tập kiểu cũ (cỡ và cách đánh của quái trước đợt quái mới), để số đo vũ khí không đổi theo cơ chế quái.
Trước khi đo, in bảng số liệu của bốn loại: tầm với, thời gian một đòn, sát thương mỗi đòn, sát thương mỗi giây trên giấy.
Nguyên tắc cân bằng (sửa góp ý 3): càng chậm hoặc càng phải áp sát thì mỗi đòn càng mạnh.
Thoát mã 1 nếu một trong các điều sau sai:
  - mỗi đòn thường: búa > giáo > kiếm > cung (trên giấy)
  - cung có sát thương mỗi giây thấp nhất, thấp hơn kiếm khoảng 15-25% (cho phép 13-27% vì bot đánh có độ lệch)
  - ba vũ khí cận chiến (kiếm, giáo, búa) lệch nhau không quá 15% so với trung bình của chúng
  - không loại nào vô dụng: vũ khí thấp nhất vẫn đạt ít nhất 70% vũ khí cao nhất
  - ba hệ ở Thức tỉnh lệch nhau không quá 15% (bỏ qua khi chạy khonghe)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
([wtype, el, secs, seed, small, one, real]) => {
  for (const k of G.HKEYS) G.HEROES[k].fav = [];           // bỏ thưởng vũ khí ưa thích để so cho công bằng
  G.testSave({ hero: 'smith', melee: wtype === 'bow' ? 'sword' : wtype, lvl: 10, tier: 1, sharpen: 3, branch: el || undefined, marks: el ? 300 : 0 });
  G.rnd = G.srand(seed);
  G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
  const S = G.getRun();
  if (!small) G.gotoRoom(S.map.boss); // phòng trùm rộng, bỏ trùm đi để chỉ đo đánh quái thường
  const W = G.getWorld(), P = S.P;
  W.waves = []; W.spawns = []; W.props = []; W.zones = []; W.banner = null;
  if (W.boss) { W.boss.dead = true; W.boss = null; W.px1 = null; W.shrink = null; }
  P.x = W.geo.cx; P.y = W.geo.cy;
  Object.assign(G.botCfg, { prefer: wtype, explore: false, props: false });
  if (G.curW(P).type !== wtype) P.cur = 1 - P.cur;
  let dealt = 0, hurt = 0;
  const dmg0 = G.damage, hurt0 = G.hurtPlayer;
  G.damage = function (t, amt, o) {
    const h = t.hp, r = dmg0(t, amt, o);
    if (!o || o.fromPlayer !== false) dealt += Math.max(0, h - Math.max(0, t.hp));
    return r;
  };
  G.hurtPlayer = function (a, b, c, d) { const h = P.hp, r = hurt0(a, b, c, d); hurt += Math.max(0, h - P.hp); return r; };
  const roles = ['rusher', 'rusher', 'swarm', 'shield', 'archer', 'nimble', 'swarm', 'rusher'];
  let ri = 0, kills = 0, bad = '';
  try {
    for (let f = 0; f < secs * 60; f++) {
      const alive = W.ents.filter((e) => !e.dead).length;
      if (alive < (one ? 1 : 5)) {
        const side = G.rnd() < 0.5 ? W.x0 + 8 : W.x1 - 8;
        const e = G.spawnEnemy(one ? 'rusher' : roles[ri++ % roles.length], side + G.rr(-4, 4), G.rr(W.y0 + 6, W.y1 - 6), Object.assign(one ? { hpMult: 8 } : real ? { hpMult: 2.5 } : {}, real ? {} : { noArt: true }));
        if (!real && e.role === 'swarm') { e.maxhp *= 0.34 / G.ROLES.swarm.hp; e.hp = e.maxhp; e.r = 5; } // bia bầy nhỏ kiểu cũ: một con nhỏ, máu mỏng
        e.inside = true; kills++;
      }
      G.sim(1);
      if (S.mode !== 'play') { bad = 'thoát khỏi trận: ' + S.mode; break; }
      if (!W.over) P.hp = Math.max(P.hp, P.maxhp * 0.6);
      if (!isFinite(P.x) || !isFinite(P.hp)) { bad = 'số liệu hỏng'; break; }
    }
  } finally { G.damage = dmg0; G.hurtPlayer = hurt0; G.rnd = Math.random; }
  const st = S.stats;
  return { dps: dealt / secs, hurt: hurt / secs, kills: kills - (one ? 1 : 5), bad, melee: Math.round(st.melee), ranged: Math.round(st.ranged), el: st.el, marks: Math.round(S.W.marksGained) };
}
"""

STATIC = r"""
() => {
  const M = G.MOVES, T = G.WTYPES, out = {};
  const row = (name, reach, hits) => { const t = hits.reduce((a, h) => a + h.t, 0), d = hits.reduce((a, h) => a + h.d, 0); return { name, reach, t: t / hits.length, hit: d / hits.length, dps: d / t, aoe: hits.some((h) => h.aoe) }; };
  out.sword = row('Kiếm (chuỗi 3 nhát)', M.sword.chain[0].reach + '-' + M.sword.chain[2].reach, M.sword.chain.map((m) => ({ t: m.dur, d: T.sword.dmg * m.mult, aoe: true })));
  out.bow = row('Cung (bắn thường)', M.bow.shot.range, [{ t: M.bow.shot.still, d: T.bow.dmg * M.bow.shot.mult }]);
  out.spear = row('Giáo (3 đâm + quét)', M.spear.chain[0].reach + '-' + M.spear.chain[2].reach, M.spear.chain.map((m) => ({ t: m.dur, d: T.spear.dmg * m.mult, aoe: !!m.sweep })));
  out.hammer = row('Búa (nện)', M.hammer.swing.reach, [{ t: M.hammer.swing.dur, d: T.hammer.dmg * M.hammer.swing.mult, aoe: true }]);
  const ch = M.bow.charge, hc = M.hammer.charge;
  out.bowCharge = row('Cung (giương đầy)', ch.range, [{ t: M.tap + ch.time + ch.recover * 0.55, d: T.bow.dmg * ch.mult1 }]);
  out.hammerCharge = row('Búa (lấy đà 2 nấc)', hc.slam[2].r + ' vòng', [{ t: M.tap + hc.time + hc.recover * 0.64, d: T.hammer.dmg * hc.slam[2].mult, aoe: true }]);
  out.spearCharge = row('Giáo (xốc tới đầy)', M.spear.charge.len1, [{ t: M.tap + M.spear.charge.time + M.spear.charge.t + 0.2, d: T.spear.dmg * M.spear.charge.mult1 }]);
  return out;
}
"""


def main():
    args = [a for a in sys.argv[1:] if a not in ('nho', 'trum', 'mot', 'khonghe', 'quaimoi')]
    real = 'quaimoi' in sys.argv
    small = 'trum' not in sys.argv
    one = 'mot' in sys.argv
    noel = 'khonghe' in sys.argv
    secs = int(args[0]) if len(args) > 0 else 60
    seeds = int(args[1]) if len(args) > 1 else 4
    errs = []
    table = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        if os.environ.get('DPS_PRE'): pg.evaluate(os.environ['DPS_PRE'])
        st = pg.evaluate(STATIC)
        print('Trên giấy (sát thương gốc của loại vũ khí, chưa tính cấp, bậc, mài):')
        print('%-22s %10s %10s %10s %10s' % ('lối đánh', 'tầm với', 'giây/đòn', 'st/đòn', 'st/giây'))
        for k in ['sword', 'spear', 'hammer', 'bow', 'spearCharge', 'hammerCharge', 'bowCharge']:
            r = st[k]
            print('%-22s %10s %10.2f %10.1f %10.1f' % (r['name'], r['reach'], r['t'], r['hit'], r['dps']))
        print('phòng thường 208x196' if small else 'phòng trùm 300x198', '|', 'một quái' if one else 'cụm năm quái', '|', secs, 'giây x', seeds, 'hạt giống')
        print('%-7s %-6s %7s %7s %6s %7s' % ('vũ khí', 'hệ', 'st/giây', 'bị đánh', 'hạ', 'dấu ấn'))
        for wt in ['sword', 'bow', 'spear', 'hammer']:
            for el in ([None] if noel else [None, 'fire', 'poison', 'ice']):
                tot = {'dps': 0, 'hurt': 0, 'kills': 0, 'marks': 0}
                for s in range(seeds):
                    if os.environ.get('DPS_PRE'): pg.evaluate(os.environ['DPS_PRE'])  # đoạn JS chỉnh thử con số trước khi đo
                    r = pg.evaluate(JS, [wt, el, secs, 1000 + s * 77, small, one, real])
                    if r['bad'] or errs:
                        print('LỖI', wt, el, r['bad'], errs[:3]); sys.exit(1)
                    for k in tot:
                        tot[k] += r[k] / seeds
                table[(wt, el)] = tot
                print('%-7s %-6s %7.1f %7.1f %6.1f %7.1f' % (wt, el or 'không', tot['dps'], tot['hurt'], tot['kills'], tot['marks']))
                sys.stdout.flush()
        b.close()
    bad = []
    d = {w: table[(w, None)]['dps'] for w in ['sword', 'bow', 'spear', 'hammer']}
    hit = {w: st[w]['hit'] for w in ['sword', 'bow', 'spear', 'hammer']}
    if not (hit['hammer'] > hit['spear'] > hit['sword'] > hit['bow']):
        bad.append('thứ tự sát thương mỗi đòn phải là búa > giáo > kiếm > cung')
    gap = 1 - d['bow'] / d['sword']
    print('Cung thấp hơn kiếm %.0f%% (cần 13-27%%)' % (gap * 100))
    if not (0.13 <= gap <= 0.27): bad.append('cung phải thấp hơn kiếm khoảng 15-25%')
    if d['bow'] > min(d['sword'], d['spear'], d['hammer']): bad.append('cung phải có sát thương mỗi giây thấp nhất')
    mel = [d['sword'], d['spear'], d['hammer']]
    mavg = sum(mel) / 3
    mdev = max(abs(x - mavg) / mavg for x in mel)
    print('Ba vũ khí cận chiến: trung bình %.1f, lệch nhiều nhất %.0f%% (cần không quá 15%%)' % (mavg, mdev * 100))
    if mdev > 0.15: bad.append('ba vũ khí cận chiến lệch nhau quá 15%')
    lo = min(d.values()) / max(d.values())
    print('Vũ khí thấp nhất bằng %.0f%% vũ khí cao nhất (cần từ 70%%)' % (lo * 100))
    if lo < 0.7: bad.append('có loại vũ khí quá yếu')
    if not noel:
        els = [sum(table[(w, e)]['dps'] for w in ['sword', 'bow', 'spear', 'hammer']) / 4 for e in ['fire', 'poison', 'ice']]
        eavg = sum(els) / 3
        edev = max(abs(x - eavg) / eavg for x in els)
        print('Ba hệ ở Thức tỉnh (trung bình bốn vũ khí): Lửa %.1f, Độc %.1f, Băng %.1f, lệch nhiều nhất %.0f%%' % (els[0], els[1], els[2], edev * 100))
        if edev > 0.15: bad.append('ba hệ lệch nhau quá 15%')
    for x in bad: print('SAI:', x)
    print('đạt' if not bad else 'không đạt')
    sys.exit(1 if bad else 0)

main()
