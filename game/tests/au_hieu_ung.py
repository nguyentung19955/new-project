"""AUDIT chiến đấu — mật độ hiệu ứng (góp ý ChatGPT mục 2.5).
  cd game && python3 tests/au_hieu_ung.py [giây=20]
1. Mỗi lần trúng sinh bao nhiêu hạt, khựng bao lâu, rung tối đa mấy điểm ảnh (thường / búa / nặng / chí mạng / kết liễu / trùm).
2. Tình huống xấu nhất, chạy thật có vẽ (màn điện thoại ngang 844x390): Lâu đài cổ, 12 quái hình mới máu mỏng mọc lại liên tục,
   em bé cầm búa Lửa Thức tỉnh (nổ lan dây chuyền) do bot đánh, đầy mana để tung Địa Chấn và chưởng liên tục, có đồ rơi.
   Lấy mẫu fx.stats() mỗi khung: số hạt (trần 400), hình hiệu ứng (trần 72), số sát thương (trần 28), thời gian khung.
   Chụp ảnh lúc nhiều hạt nhất (docs/review/anh-chien-dau/) để tự xem vùng báo đỏ có còn nổi không.
Ghi JSON vào /tmp/au_hieu_ung.json."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh-chien-dau')
SECS = int(sys.argv[1]) if len(sys.argv) > 1 else 20

JS_TIER = r"""
() => {
  const out = [];
  const cases = [
    ['kiếm thường', { type: 'sword' }, false],
    ['búa thường', { type: 'hammer' }, false],
    ['nặng (nhát kết)', { type: 'sword', heavy: true }, false],
    ['chí mạng', { type: 'sword', crit: true }, false],
    ['kết liễu', { type: 'sword', dead: true }, false],
    ['tên thường', { type: 'bow', ranged: true }, false],
    ['tên mạnh', { type: 'bow', ranged: true, heavy: true }, false],
    ['kiếm Lửa', { type: 'sword', el: 'fire' }, false],
    ['trúng trùm', { type: 'sword' }, true],
  ];
  for (const [name, o, boss] of cases) {
    const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
    G.noRender = false; G.fx.reset();
    const e = AU.dummy(P.x + 24, P.y, { hp: 1e6 });
    if (boss) { e.isBoss = true; e.layers = []; e.weak = []; }
    AU.run(2, true);
    const s0 = G.fx.state(), np0 = s0.np, e0 = s0.E.length;
    G.fx.hit(e, Object.assign({ dir: 1 }, o));
    const s1 = G.fx.state();
    const parts = s1.np - np0, shapes = s1.E.length - e0, stop = Math.round(s1.stop * 1000);
    let mx = 0, my = 0;
    for (let i = 0; i < 40; i++) { G.fx.update(1 / 60); const q = G.fx.shakeOffset(); mx = Math.max(mx, Math.abs(q.x)); my = Math.max(my, Math.abs(q.y)); }
    out.push({ name, parts, shapes, stop, shakeX: mx, shakeY: my });
  }
  return out;
}
"""

JS_WORST = r"""
([NMOB]) => {
  const bot = window.__bot;
  const { S, W, P } = AU.room({ melee: 'hammer', lvl: 30, tier: 3, sharpen: 5, region: 2, stage: 2, branch: 'fire', marks: 300 });
  AU.want(P, 'hammer');
  G.botInput = bot; Object.assign(G.botCfg, { prefer: 'hammer', explore: false, props: false });
  G.hurtPlayer = ((h0) => function () { const r = h0.apply(this, arguments); const P2 = G.getWorld().P; P2.hp = P2.maxhp; P2.dead = false; return r; })(G.hurtPlayer);
  W.over = null;
  window.__wst = { n: 0, maxP: 0, maxE: 0, maxN: 0, satP: 0, satE: 0, ft: [], peakAt: 0, kills: 0, zones: 0 };
  const roles = ['rusher', 'swarm', 'kami', 'bomber', 'archer', 'spiky', 'rusher', 'swarm', 'nimble', 'shield', 'kami', 'rusher'];
  let ri = 0, last = performance.now();
  const up0 = G.updateWorld;
  G.updateWorld = function (dt, inp) {
    const W2 = G.getWorld(), P2 = W2.P;
    P2.mana = P2.maxmana; P2.specCd = Math.min(P2.specCd, 0.3); P2.skillCd = 0;
    if (G.time % 2.5 < 1 / 60) inp.specialP = true; // Địa Chấn mỗi 2,5 giây
    if (G.time % 1.7 < 1 / 60) { inp.skillP = true; inp.skill = false; } // chưởng
    while (W2.ents.filter((e) => !e.dead).length < NMOB) {
      const e = G.spawnEnemy(roles[ri++ % roles.length], G.rr(W2.x0 + 10, W2.x1 - 10), G.rr(W2.y0 + 6, W2.y1 - 6), {});
      e.maxhp *= 0.35; e.hp = e.maxhp; e.inside = true; e.spawnT = 0;
    }
    return up0(dt, inp);
  };
  const kill0 = G.kill;
  G.kill = function (e, o) { if (!e.dead) window.__wst.kills++; if (G.doRoi && G.rnd() < 0.3) G.doRoi.tha(W, e.x, e.y, { kind: 'gold', s: '+5 vàng' }); return kill0(e, o); };
  AU.live(true);
  const tick = () => {
    if (!window.__wst.on) return;
    const now = performance.now(), q = window.__wst, s = G.fx.stats();
    if (s) {
      q.n++; q.ft.push(now - last);
      if (s.parts > q.maxP) { q.maxP = s.parts; q.peakAt = G.time; }
      q.maxE = Math.max(q.maxE, s.fx); q.maxN = Math.max(q.maxN, s.nums);
      if (s.parts >= 400) q.satP++;
      if (s.fx >= 72) q.satE++;
      q.zones = Math.max(q.zones, G.getWorld().zones.filter((z) => z.t > 0 && z.team !== 'player').length);
    }
    last = now;
    requestAnimationFrame(tick);
  };
  window.__wst.on = true;
  requestAnimationFrame(tick);
  return true;
}
"""


def main():
    os.makedirs(SHOTS, exist_ok=True)
    errs = []
    out = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate("() => { window.__bot = G.botInput; }")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'au_lib.js'))
        print('== 1. Mỗi lần trúng (mức hiệu ứng mặc định G.VFX = 1)')
        tiers = pg.evaluate(JS_TIER)
        print('%-18s %6s %8s %9s %10s' % ('đòn', 'hạt', 'hình', 'khựng ms', 'rung x/y'))
        for r in tiers:
            print('%-18s %6d %8d %9d %6d/%d' % (r['name'], r['parts'], r['shapes'], r['stop'], r['shakeX'], r['shakeY']))
        out['tiers'] = tiers
        for NM, tag in [(12, 'day-nhat'), (4, 'phong-thuong')]:
            print('== 2. %s: %d quái cùng lúc, %d giây chạy thật có vẽ' % ('Tình huống xấu nhất' if NM > 4 else 'Phòng thường (tối đa 4 quái sống cùng lúc như G.ROOM_WAVES.maxAlive)', NM, SECS))
            pg.goto('file://' + ROOT + '/index.html')
            pg.wait_for_function('window.G && G.scene')
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
            pg.evaluate("() => { window.__bot = G.botInput; }")
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'au_lib.js'))
            pg.evaluate(JS_WORST, [NM])
            best = 0; bestT = 0
            for i in range(SECS * 4):
                pg.wait_for_timeout(250)
                cur, tel = pg.evaluate("[G.fx.stats().parts, G.getWorld().zones.filter((z) => z.t > 0 && !z.quiet && z.team !== 'player').length]")
                if cur > best and i > 4:
                    best = cur
                    pg.screenshot(path=os.path.join(SHOTS, 'hieu-ung-%s.png' % tag))
                if tel and cur > bestT and i > 4:
                    bestT = cur
                    pg.screenshot(path=os.path.join(SHOTS, 'hieu-ung-%s-bao-truoc.png' % tag))
            q = pg.evaluate("(() => { const q = window.__wst; q.on = false; const f = q.ft.slice(5).sort((a, b) => a - b); return { n: q.n, maxP: q.maxP, maxE: q.maxE, maxN: q.maxN, satP: q.satP, satE: q.satE, kills: q.kills, zones: q.zones, ftMed: f[Math.floor(f.length / 2)], ft95: f[Math.floor(f.length * 0.95)], ftMax: f[f.length - 1] }; })()")
            print('  khung đã đo %d | hạt nhiều nhất %d (khung chạm trần 400: %d) | hình %d (chạm trần 72: %d) | số sát thương %d | quái chết %d | vùng báo cùng lúc %d' % (
                q['n'], q['maxP'], q['satP'], q['maxE'], q['satE'], q['maxN'], q['kills'], q['zones']))
            print('  thời gian khung (máy chủ không có GPU, chỉ để so tương đối): giữa %.1f ms, 95%% %.1f ms, chậm nhất %.1f ms' % (q['ftMed'], q['ft95'], q['ftMax']))
            print('  ảnh lúc nhiều hạt nhất (%d hạt): hieu-ung-%s.png; có vùng báo đỏ (%d hạt): hieu-ung-%s-bao-truoc.png' % (best, tag, bestT, tag))
            out['worst' + str(NM)] = q
        b.close()
    if errs:
        print('LỖI JS:', errs[:5])
    json.dump(out, open('/tmp/au_hieu_ung.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
