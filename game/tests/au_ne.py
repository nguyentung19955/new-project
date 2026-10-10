"""AUDIT chiến đấu — đo Né (góp ý ChatGPT mục 3.3) và bộ nhớ nút bấm (mục 3.1).
  cd game && python3 tests/au_ne.py
Đo bằng mô phỏng từng khung (1/60 giây), không sửa game:
  1. Cửa sổ bất tử khi Né: vùng sát thương nổ ở khung k so với khung bấm Né (k âm = nổ trước khi bấm).
  2. Quãng lộn theo 8 hướng và thời gian đi bộ tương đương.
  3. Bấm Né sớm khi chưa hồi xong / trong lúc lướt: lượt bấm có được nhớ không.
  4. Nhát lướt của kiếm: bấm Đánh ở khung k sau khi bấm Né thì ra Nhát lướt hay nhát chém thường; còn bất tử khi lướt không.
  5. Nút bấm trong lúc khựng hình (hit-stop) có bị mất không.
Ghi JSON vào /tmp/au_ne.json."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS_IFRAME = r"""
([k]) => {
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  P.dodgeCd = 0;
  // vùng tròn phủ cả phòng, nổ đúng khung 10 + k (khung 10 là khung bấm Né)
  G.zoneCircle(P.x, P.y, 400, (10 + k + 0.5) / 60, 5, null, {});
  AU.inp.mx = -1; // đẩy cần sang trái để lộn
  let res = null;
  const log = AU.hurtLog(() => AU.run(40, false, (i) => { if (i === 10) AU.inp.dodgeP = true; }));
  return { k, hurt: log.some((x) => x.ok), inv: log.length ? log[0].inv : null };
}
"""

JS_DIST = r"""
() => {
  const out = [];
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  for (const d of dirs) {
    const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
    P.x = W.geo.cx; P.y = W.geo.cy; P.dodgeCd = 0;
    const l = Math.hypot(d[0], d[1]); AU.inp.mx = d[0] / l; AU.inp.my = d[1] / l;
    AU.inp.dodgeP = true;
    const x0 = P.x, y0 = P.y; let fr = 0;
    AU.run(1); fr = 1; while (P.dodgeT > 0 && fr < 60) { AU.inp.mx = 0; AU.inp.my = 0; AU.run(1); fr++; }
    const dx = P.x - x0, dy = P.y - y0;
    // đi bộ cùng hướng: cùng quãng mất bao lâu (tốc độ Thợ Rèn; chiều dọc 0,75)
    const vx = P.speed * d[0] / l, vy = P.speed * 0.75 * d[1] / l, v = Math.hypot(vx, vy);
    out.push({ dir: d, dx: +dx.toFixed(1), dy: +dy.toFixed(1), dist: +Math.hypot(dx, dy).toFixed(1), frames: fr, walk: +(Math.hypot(dx, dy) / v).toFixed(2) });
  }
  return out;
}
"""

# Bấm Né lần hai ở khung k sau lần một (hồi Né 1 giây = 60 khung). Có lộn lần hai trong 40 khung sau đó không.
JS_CD = r"""
([k]) => {
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  P.dodgeCd = 0; AU.inp.mx = 1;
  let second = null;
  AU.run(k + 41, false, (i) => {
    if (i === 0 || i === k) AU.inp.dodgeP = true;
    if (i > k && second == null && P.dodgeT > 0.26) second = i - k;
    if (i < 60) AU.inp.mx = (i % 40 < 20) ? 1 : -1;
  });
  return { k, second };
}
"""

# Né bấm trong lúc đang lướt (Nhát lướt 0,12 giây): có được nhớ để lộn ngay khi lướt xong không.
JS_DASH = r"""
() => {
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  P.dodgeCd = 0; AU.inp.mx = 1;
  AU.inp.dodgeP = true; AU.run(1);
  while (P.dodgeT > 0) AU.run(1);
  AU.inp.atk = true; AU.inp.atkP = true; AU.run(1); AU.inp.atk = false;
  const glide = P.dashT > 0;
  P.dodgeCd = 0; // cho Né sẵn sàng để chỉ thử chuyện đang lướt
  AU.run(2);
  AU.inp.dodgeP = true; AU.run(1); // bấm Né giữa lúc lướt
  let rolled = false;
  AU.run(30, false, () => { if (P.dodgeT > 0) rolled = true; });
  return { glide, rolledLater: rolled };
}
"""

# Nhát lướt: bấm Đánh ở khung k sau khung bấm Né.
JS_GLIDE = r"""
([k]) => {
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  P.dodgeCd = 0; AU.inp.mx = 1;
  let kind = null, inv = [];
  AU.run(k + 60, false, (i) => {
    if (i === 0) AU.inp.dodgeP = true;
    if (i === k) { AU.inp.atk = true; AU.inp.atkP = true; }
    if (i === k + 1) AU.inp.atk = false;
    if (i > k && kind == null && P.mv && (P.mv.kind === 'luot' || P.mv.kind === 'chem')) kind = P.mv.kind;
    if (P.dashT > 0) inv.push(+P.inv.toFixed(3));
  });
  return { k, kind, dodgeFrames: 17, invDuringDash: inv };
}
"""

# Nút bấm trong lúc khựng hình: chạy có fx (khựng thật), đánh trúng bia rồi bấm Né ngay trong khung khựng.
JS_STOP = r"""
() => {
  const { W, P } = AU.room({ melee: 'hammer', lvl: 10 });
  AU.want(P, 'hammer');
  AU.dummy(P.x + 20, P.y, { hp: 1e6 }); P.face = 1; P.dodgeCd = 0;
  let stopAt = null, pressed = null, rolled = null, frozenFrames = 0;
  // bấm búa (nhát thường), chờ tới lúc trúng (fx.js khựng 70 ms), bấm Né trong lúc khựng
  AU.inp.atk = true; AU.inp.atkP = true; AU.run(1, true); AU.inp.atk = false;
  for (let i = 0; i < 120; i++) {
    const hd = P.hitDone;
    AU.run(1, true);
    if (stopAt == null && !hd && P.hitDone) stopAt = i;
    if (stopAt != null && pressed == null && i === stopAt + 1) { AU.inp.dodgeP = true; pressed = i; }
    if (pressed != null && rolled == null && P.dodgeT > 0) rolled = i - pressed;
  }
  return { stopAt, pressed, rolledAfter: rolled };
}
"""


def main():
    out = {}
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        print('== 1. Cửa sổ bất tử: vùng nổ ở khung k (so với khung bấm Né)')
        rows = [pg.evaluate(JS_IFRAME, [k]) for k in range(-3, 26)]
        safe = [r['k'] for r in rows if not r['hurt']]
        print('  khung an toàn:', safe)
        print('  => bất tử từ khung %d đến %d = %d khung = %.0f ms' % (min(safe), max(safe), len(safe), len(safe) * 1000 / 60))
        out['iframe'] = {'safe': safe, 'ms': len(safe) * 1000 / 60}
        print('== 2. Quãng lộn 8 hướng (Thợ Rèn)')
        dist = pg.evaluate(JS_DIST)
        for r in dist:
            print('  hướng %-8s lộn %5.1f điểm ảnh trong %d khung (đi bộ cùng quãng mất %.2f giây)' % (r['dir'], r['dist'], r['frames'], r['walk']))
        out['dist'] = dist
        print('== 3. Bấm Né lần hai sớm (hồi 60 khung)')
        cd = [pg.evaluate(JS_CD, [k]) for k in [50, 54, 57, 59, 60, 61]]
        for r in cd:
            print('  bấm lại ở khung %d -> %s' % (r['k'], 'lộn sau %d khung' % r['second'] if r['second'] is not None else 'MẤT lượt bấm (không lộn)'))
        out['cd'] = cd
        d = pg.evaluate(JS_DASH)
        print('  bấm Né giữa lúc đang Nhát lướt: lướt=%s, sau đó có lộn=%s' % (d['glide'], d['rolledLater']))
        out['dash'] = d
        print('== 4. Nhát lướt: bấm Đánh ở khung k sau khi bấm Né (lộn dài 17 khung)')
        gl = [pg.evaluate(JS_GLIDE, [k]) for k in range(0, 50, 2)]
        for r in gl:
            print('  k=%2d -> %-5s %s' % (r['k'], r['kind'], ('bất tử lúc lướt ' + str(r['invDuringDash'])) if r['invDuringDash'] else ''))
        out['glide'] = gl
        print('== 5. Bấm Né trong lúc khựng hình (chạy có fx)')
        s = pg.evaluate(JS_STOP)
        print('  ', s)
        out['stop'] = s
        b.close()
    if errs:
        print('LỖI JS:', errs[:5]); sys.exit(1)
    json.dump(out, open('/tmp/au_ne.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
