"""AUDIT chiến đấu — thời gian báo trước so với thời gian thật cần để chạy ra khỏi vùng (góp ý ChatGPT mục 3.6).
  cd game && python3 tests/au_bao_truoc.py
Cách đo (không sửa game):
  - Dựng phòng trống, em bé đứng yên giữa phòng, không nhận sát thương (G.hurtPlayer tạm thay bằng hàm ghi lại).
  - Thả từng loại quái thật (hình mới, cả ba vùng) hoặc trùm nhỏ / trùm vùng (ép từng chiêu bằng G.bossDebug),
    chờ nó ra đòn, chụp lại mọi vùng báo trước vừa sinh (hình, thời gian báo t0, có vẽ vùng đỏ hay không).
  - Từ đúng chỗ em bé đứng lúc vùng sinh ra, cho em bé đi bộ theo 8 hướng (tốc độ Thợ Rèn 72, chiều dọc 0,75; Đô Vật 0,9 lần)
    và đếm số khung tới lúc ra khỏi vùng (dùng chính G.inZone của game, có chặn tường phòng).
  - Lộn né: em bé bất tử 20 khung kể từ khung bấm (tests/au_ne.py), nên lộn kịp nếu bấm trước lúc nổ.
Ghi JSON vào /tmp/au_bao_truoc.json."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS_CAP = r"""
([kind, r, role, art, skill]) => {
  const big = kind === 'boss';
  const { S, W, P } = AU.room({ melee: 'sword', lvl: 20, region: r, stage: kind === 'boss' ? 4 : kind === 'mini' ? 1 : 0, big: kind !== 'mob', keepBoss: kind !== 'mob' });
  P.x = W.geo.cx - (kind === 'mob' ? 0 : 50); P.y = W.geo.cy;
  const caps = [];
  const seen = new Set();
  const h0 = G.hurtPlayer;
  G.hurtPlayer = function () { return false; };
  let e = null;
  try {
    if (kind === 'mob') {
      e = G.spawnEnemy(role, P.x + 40, P.y - 4, art ? { art } : {});
      e.inside = true;
      if (role === 'elite') e.skCd = 0.2;
    } else {
      const b = W.boss;
      b.invuln = 0; b.busy = 0; b.intro = 0;
      if (skill) G.bossDebug(skill);
      e = b;
    }
    const lim = kind === 'mob' ? 600 : 240;
    AU.run(lim, false, (i) => {
      P.x = W.geo.cx - (kind === 'mob' ? 0 : 50); P.y = W.geo.cy; P.inv = 0; P.hp = P.maxhp;
      for (const z of W.zones) {
        if (seen.has(z)) continue;
        seen.add(z);
        if (!(z.t0 > 0) || z.team === 'player' || z.team === 'fx') continue;
        const g = { shape: z.shape, x: z.x, y: z.y, r: z.r, w: z.w, h: z.h, ang: z.ang, len: z.len, span: z.span, r0: z.r0, r1: z.r1, gaps: z.gaps, gw: z.gw };
        caps.push({ i, g, t0: z.t0, wait: z.wait || 0, quiet: !!z.quiet, px: P.x, py: P.y, inside: G.inZone(z, P), ex: e.x, ey: e.y, el: z.el || null, fxKind: z.fxKind || null, wall: !!z.wall });
      }
      if (kind !== 'mob' && caps.length && i > caps[0].i + 120) return false;
      if (kind === 'mob' && caps.length >= 2) return false;
    });
  } finally { G.hurtPlayer = h0; }
  // thời gian đi bộ ra khỏi vùng, 8 hướng
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const x1 = W.px1 != null ? W.px1 : W.x1;
  for (const c of caps) {
    c.walk = {};
    for (const spk of [1, 0.9]) {
      const res = [];
      for (const d of dirs) {
        const l = Math.hypot(d[0], d[1]), sp = 72 * spk;
        let x = c.px, y = c.py, f = 0;
        if (!G.inZone(c.g, { x, y })) { res.push(0); continue; }
        while (f < 300 && G.inZone(c.g, { x, y })) { x = G.clamp(x + d[0] / l * sp / 60, W.x0, x1); y = G.clamp(y + d[1] / l * sp * 0.75 / 60, W.y0, W.y1); f++; }
        res.push(f >= 300 ? null : f / 60);
      }
      c.walk[spk] = res;
    }
    // lộn né cùng 8 hướng: có ra khỏi vùng trong lúc lộn không (không tính bất tử)
    const dres = [];
    for (const d of dirs) {
      const l = Math.hypot(d[0], d[1]);
      let x = c.px, y = c.py, f = 0, out = !G.inZone(c.g, { x, y });
      while (!out && f < 17) { x = G.clamp(x + d[0] / l * 195 / 60, W.x0, x1); y = G.clamp(y + d[1] / l * 195 * 0.75 / 60, W.y0, W.y1); f++; out = !G.inZone(c.g, { x, y }); }
      dres.push(out ? f / 60 : null);
    }
    c.roll = dres;
  }
  return { kind, r, role, art: e ? e.art : null, skill, caps };
}
"""

MOB_ROLES = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite']


def main():
    errs = []
    res = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        arts = pg.evaluate("() => G.MOB_ART")
        jobs = []
        for r in range(3):
            for role in MOB_ROLES:
                if role == 'elite':
                    for a in arts['elite'][r]: jobs.append(('mob', r, role, a, None))
                else:
                    jobs.append(('mob', r, role, arts[role][r], None))
            for sk in ['atk', 'chieu1', 'chieu2']: jobs.append(('mini', r, 'mini', None, sk))
            for sk in ['c1', 'c2', 'c3', 'c4', 'c5']: jobs.append(('boss', r, 'boss', None, sk))
        for j in jobs:
            o = pg.evaluate(JS_CAP, list(j))
            res.append(o)
            for c in o['caps']:
                w = c['walk']['1']
                ok = [x for x in w if x is not None]
                best = min(ok) if ok else None
                worst = max(ok) if ok else None
                T = c['t0']
                tag = '%s/%s' % (o['art'] or o['kind'], o['skill'] or '')
                print('%-26s %-6s T=%.2f%s đứng trong=%s đi ra nhanh nhất %s chậm nhất %s | dư %s %s' % (
                    tag, c['g']['shape'], T, (' +chờ %.2f' % c['wait']) if c['wait'] else '', 'có' if c['inside'] else 'không',
                    '%.2f' % best if best is not None else '—', '%.2f' % worst if worst is not None else '—',
                    ('%.2f' % (T - best)) if best is not None else '—', '(không vẽ vùng đỏ)' if c['quiet'] else ''))
            sys.stdout.flush()
        b.close()
    if errs:
        print('LỖI JS:', errs[:5]); sys.exit(1)
    json.dump(res, open('/tmp/au_bao_truoc.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
