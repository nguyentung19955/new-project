"""AUDIT chiến đấu — đầu vào thật trên trình duyệt (góp ý ChatGPT mục 3.1, 3.5) và âm thanh trúng/hụt (mục 2.6).
  cd game && python3 tests/au_input.py
Phần A (trình duyệt chạy thật, cảm ứng giả lập qua CDP, màn điện thoại ngang 844x390):
  1. Độ trễ: từ lúc ngón chạm nút (sự kiện pointerdown) tới khung xử lý đầu tiên em bé vào động tác, và tới lúc gây sát thương.
     Kiếm và Né ra ngay khi chạm; cung/giáo/búa chỉ ra đòn khi NHẤC ngón (hoặc giữ quá 0,16 giây thì thành lấy đà).
  2. Ba ngón cùng lúc: giữ cần + giữ Đánh + chạm Né (+ chạm Đặc biệt) — có ngón nào bị bỏ không.
Phần B (mô phỏng từng khung):
  3. Đổi vũ khí đúng khung đòn chạm: sát thương tính theo vũ khí nào; hoạt ảnh còn chạy tiếp bao lâu với hình vũ khí mới.
  4. Bị đánh / đổi vũ khí / lộn trong lúc giữ lấy đà.
  5. Âm thanh: tiếng "trúng" có phát đúng khung gây sát thương không, đòn hụt có phát tiếng trúng không, đòn nào trúng mà im.
Ghi JSON vào /tmp/au_input.json."""
import os, sys, json, statistics as stx
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import Game

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SETUP_LIVE = r"""
([melee, want]) => {
  const { W, P } = AU.room({ melee, lvl: 10 });
  AU.want(P, want);
  G.botInput = null; AU.live(true);
  P.x = W.geo.cx - 30; P.y = W.geo.cy; P.face = 1; P.mana = 0;
  const e = AU.dummy(P.x + (want === 'bow' ? 70 : want === 'spear' ? 36 : 20), P.y, { hp: 1e8 });
  window.__lat = []; window.__cur = null;
  if (!window.__hooked) {
    window.__hooked = true;
    document.getElementById('fit').addEventListener('pointerdown', () => { window.__cur = { down: performance.now(), up: null, start: null, hit: null, dodge: null }; window.__lat.push(window.__cur); }, true);
    document.getElementById('fit').addEventListener('pointerup', () => { if (window.__cur && window.__cur.up == null) window.__cur.up = performance.now(); }, true);
    const up0 = G.updatePlayer;
    G.updatePlayer = function (P, inp, dt) {
      const a0 = P.atkT > 0 || (P.mv && P.mv.holding), h0 = P.hitDone, d0 = P.dodgeT > 0;
      up0(P, inp, dt);
      const c = window.__cur; if (!c) return;
      const now = performance.now();
      if (c.start == null && !a0 && (P.atkT > 0 || (P.mv && P.mv.holding))) c.start = now;
      if (c.hit == null && !h0 && P.hitDone && P.atkT > 0) c.hit = now;
      if (c.dodge == null && !d0 && P.dodgeT > 0) c.dodge = now;
    };
    const d0 = G.damage;
    G.damage = function (t, a, o) { const r = d0(t, a, o); const c = window.__cur; if (c && c.dmg == null && (!o || o.fromPlayer !== false)) c.dmg = performance.now(); return r; };
  }
  return G.stageUi.btnPos('atk');
}
"""

# ---------- phần B ----------
JS_SWAP = r"""
() => {
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  P.face = 1; AU.dummy(P.x + 20, P.y, { hp: 1e7 });
  const I = AU.inp;
  I.atk = true; I.atkP = true;
  // chạy tới khung ngay trước khi nhát chém đầu chạm (atkT <= 0,55 * atkDur)
  let guard = 0;
  AU.run(1); I.atk = false;
  while (!(P.atkT - 1 / 60 <= P.atkDur * 0.55) && guard++ < 60) AU.run(1);
  const r = AU.count(() => { I.swapP = true; AU.run(1); });
  const after = [];
  for (let k = 0; k < 20 && P.atkT > 0; k++) { after.push(G.heroArgs(P).weapon.type); AU.run(1); }
  const hitW = r.list.length ? r.list[0].w : null;
  return { hitWith: hitW, moveKind: P.mv && P.mv.cur ? P.mv.cur.kind : null, nowHolding: G.curW(P).type, animFramesWithNewWeapon: after.length, drawnAs: after[0] || null };
}
"""
JS_SWAP2 = r"""
() => {
  // đổi vũ khí ở khung SAU khung chạm (trường hợp thường gặp): nhát chém bị bỏ?
  const { W, P } = AU.room({ melee: 'sword', lvl: 10 });
  P.face = 1; AU.dummy(P.x + 20, P.y, { hp: 1e7 });
  const I = AU.inp; I.atk = true; I.atkP = true; AU.run(1); I.atk = false;
  AU.run(2); // đang lấy đà, chưa chạm
  const r = AU.count(() => { I.swapP = true; AU.run(30); });
  return { hits: r.list.length, hitWith: r.list.length ? r.list[0].w : null };
}
"""
JS_CHARGE = r"""
([what]) => {
  const { W, P } = AU.room({ melee: 'hammer', lvl: 10 });
  AU.want(P, 'hammer'); P.face = 1; AU.dummy(P.x + 22, P.y, { hp: 1e7 });
  const I = AU.inp;
  for (let k = 0; k < 40; k++) { I.atk = true; AU.run(1); }
  const before = { holding: !!P.mv.holding, charge: +P.mv.charge.toFixed(2) };
  if (what === 'hurt') G.hurtPlayer(5, null, null, true);
  if (what === 'swap') I.swapP = true;
  if (what === 'dodge') { P.dodgeCd = 0; I.dodgeP = true; }
  I.atk = true; AU.run(1);
  const mid = { holding: !!(P.mv && P.mv.holding), charge: P.mv ? +P.mv.charge.toFixed(2) : 0, weapon: G.curW(P).type };
  // vẫn giữ nút thêm 30 khung rồi thả
  for (let k = 0; k < 30; k++) { I.atk = true; AU.run(1); }
  const later = { holding: !!(P.mv && P.mv.holding), charge: P.mv ? +P.mv.charge.toFixed(2) : 0, weapon: G.curW(P).type, atkT: +P.atkT.toFixed(2), kind: P.mv ? P.mv.kind : null };
  return { what, before, mid, later };
}
"""
JS_SFX = r"""
([mode, hit]) => {
  const melee = { sword: 'sword', glide: 'sword', spear: 'spear', lunge: 'spear', hammer: 'hammer', slam: 'hammer', bow: 'sword', special: 'sword', specialSpear: 'spear', specialHammer: 'hammer' }[mode];
  const { W, P } = AU.room({ melee, lvl: 10 });
  AU.want(P, mode === 'bow' ? 'bow' : melee);
  P.face = 1; P.mana = P.maxmana; P.dodgeCd = 0;
  if (hit) AU.dummy(P.x + (mode === 'bow' ? 70 : mode.startsWith('special') ? 50 : 22), P.y, { hp: 1e7 });
  const log = [], s0 = G.sfx;
  G.sfx = function (n, p) { log.push({ t: Math.round(G.time * 60), n }); };
  const dl = [];
  const d0 = G.damage;
  G.damage = function (t, a, o) { if (!o || o.fromPlayer !== false) dl.push(Math.round(G.time * 60)); return d0(t, a, o); };
  const I = AU.inp;
  try {
    if (mode === 'glide') { I.mx = 1; I.dodgeP = true; AU.run(1); while (P.dodgeT > 0) AU.run(1); I.mx = 0; }
    if (mode === 'sword' || mode === 'glide') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; }
    else if (mode === 'spear' || mode === 'hammer' || mode === 'bow') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; }
    else if (mode === 'lunge' || mode === 'slam') { for (let k = 0; k < (mode === 'slam' ? 80 : 45); k++) { I.atk = true; AU.run(1); } I.atk = false; }
    else { I.specialP = true; }
    AU.run(90);
  } finally { G.sfx = s0; G.damage = d0; }
  const hits = log.filter((x) => x.n === 'hit').map((x) => x.t);
  return { mode, hit, dmgFrames: dl.slice(0, 4), hitSfx: hits.slice(0, 4), all: log.map((x) => x.n).filter((n, i, a) => a.indexOf(n) === i) };
}
"""


def lat_run(p, melee, want, kind, hold_ms, n=16):
    g = Game(p, 'phone')
    g.ev("() => 0")
    for f in ['bot.js', 'setup.js', 'au_lib.js']:
        g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
    atk = g.ev(SETUP_LIVE, [melee, want])
    dodge = g.ev("G.stageUi.btnPos('dodge')")
    g.wait(400)
    for i in range(n):
        g.ev("() => { const P = G.getRun().P; P.dodgeCd = 0; P.cdT = 0; P.atkT = 0; P.mana = 0; }")
        if kind == 'dodge':
            g.down(dodge[0], dodge[1]); g.wait(hold_ms); g.up()
        else:
            g.down(atk[0], atk[1]); g.wait(hold_ms); g.up()
        g.wait(900 if want == 'hammer' else 650)
    rows = g.ev("window.__lat")
    errs = g.errs[:]
    g.close()
    res = {'start': [], 'hit': [], 'dmg': [], 'dodge': [], 'hold': [], 'afterUp': []}
    for r in rows:
        if r.get('up') is not None: res['hold'].append(r['up'] - r['down'])
        if r.get('up') is not None and r.get('start') is not None: res['afterUp'].append(r['start'] - r['up'])
        if kind == 'dodge':
            if r.get('dodge'): res['dodge'].append(r['dodge'] - r['down'])
        else:
            if r.get('start'): res['start'].append(r['start'] - r['down'])
            if r.get('dmg'): res['dmg'].append(r['dmg'] - r['down'])
    return res, errs


def med(a):
    return '%.0f ms (thấp %.0f, cao %.0f, n=%d)' % (stx.median(a), min(a), max(a), len(a)) if a else '—'


def main():
    out = {}
    allerr = []
    with sync_playwright() as p:
        print('== A1. Độ trễ chạm -> em bé vào động tác -> sát thương (trình duyệt chạy thật, 60 khung/giây)')
        out['lat'] = {}
        for melee, want, kind, hold in [('sword', 'sword', 'atk', 60), ('sword', 'sword', 'dodge', 60), ('spear', 'spear', 'atk', 60), ('spear', 'spear', 'atk', 120), ('hammer', 'hammer', 'atk', 60), ('sword', 'bow', 'atk', 60), ('sword', 'bow', 'atk', 120)]:
            r, e = lat_run(p, melee, want, kind, hold)
            allerr += e
            key = '%s-%s-%d' % (want, kind, hold)
            out['lat'][key] = {k: (stx.median(v) if v else None) for k, v in r.items()}
            if kind == 'dodge':
                print('  %-6s Né, giữ ngón %3d ms: bắt đầu lộn %s' % (want, hold, med(r['dodge'])))
            else:
                print('  %-6s Đánh, giữ ngón %s: vào động tác %s | sau lúc nhấc ngón %s | gây sát thương %s' % (want, med(r['hold']), med(r['start']), med(r['afterUp']), med(r['dmg'])))
            sys.stdout.flush()

        print('== A2. Ba ngón: giữ cần + giữ Đánh + chạm Né, rồi chạm Đặc biệt')
        g = Game(p, 'phone')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            g.pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        g.ev(SETUP_LIVE, ['sword', 'sword'])
        g.ev("() => { const P = G.getRun().P; P.mana = P.maxmana; P.x -= 40; window.__rec = []; const u0 = G.updateWorld; G.updateWorld = function (dt, inp) { window.__rec.push({ mx: inp.mx, atk: inp.atk, dodgeP: inp.dodgeP, specialP: inp.specialP }); return u0(dt, inp); }; }")
        bp = lambda n: g.ev("G.stageUi.btnPos('%s')" % n)[:2]
        sx, sy = g.ev("G.stageUi.stickPos()")[:2]
        g.down(sx, sy, 0); g.wait(40); g.move(sx + 22, sy, 0); g.wait(150)
        a = bp('atk'); g.down(a[0], a[1], 1); g.wait(200)
        x0 = g.ev("G.getRun().P.x")
        d = bp('dodge'); g.down(d[0], d[1], 2); g.wait(50); g.up(2); g.wait(300)
        s = bp('special'); g.down(s[0], s[1], 2); g.wait(50); g.up(2); g.wait(200)
        rec = g.ev("window.__rec")
        st = g.ev("(() => { const P = G.getRun().P; return { x: P.x, ptr: G.pointers.size, mana: P.mana, max: P.maxmana, dodges: G.getRun().stats.dodges }; })()")
        g.up(); g.wait(100)
        moved = any(r['mx'] > 0.5 for r in rec)
        atkHeld = sum(1 for r in rec if r['atk'])
        dodged = any(r['dodgeP'] for r in rec)
        spec = any(r['specialP'] for r in rec)
        print('  cần nhận=%s, khung giữ Đánh=%d, Né nhận=%s, Đặc biệt nhận=%s, số ngón đang giữ=%d, mana %d/%d, số lần lộn=%d' % (moved, atkHeld, dodged, spec, st['ptr'], st['mana'], st['max'], st['dodges']))
        out['multi'] = {'stick': moved, 'atkFrames': atkHeld, 'dodge': dodged, 'special': spec, 'ptr': st['ptr'], 'manaSpent': st['mana'] < st['max']}
        allerr += g.errs
        g.close()

        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: allerr.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        print('== B3. Đổi vũ khí giữa đòn')
        r = pg.evaluate(JS_SWAP)
        print('  đổi đúng khung chạm:', r)
        r2 = pg.evaluate(JS_SWAP2)
        print('  đổi khi đang lấy đà (trước khung chạm):', r2)
        out['swap'] = [r, r2]
        print('== B4. Trong lúc giữ búa lấy đà')
        out['charge'] = []
        for w in ['hurt', 'swap', 'dodge']:
            r = pg.evaluate(JS_CHARGE, [w])
            print('  ', r)
            out['charge'].append(r)
        print('== B5. Âm thanh trúng / hụt (khung 1/60)')
        out['sfx'] = []
        for mode in ['sword', 'glide', 'spear', 'lunge', 'hammer', 'slam', 'bow', 'special', 'specialSpear', 'specialHammer']:
            for hit in [True, False]:
                r = pg.evaluate(JS_SFX, [mode, hit])
                out['sfx'].append(r)
                print('  %-13s %-4s khung gây st %-18s khung tiếng "trúng" %-18s các tiếng: %s' % (mode, 'trúng' if hit else 'hụt', r['dmgFrames'], r['hitSfx'], r['all']))
        b.close()
    if allerr:
        print('LỖI JS:', allerr[:5])
    json.dump(out, open('/tmp/au_input.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
