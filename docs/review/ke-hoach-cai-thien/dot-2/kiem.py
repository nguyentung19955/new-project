"""Đợt 2 (mở rộng sàn phòng thường): đo nhịp dọn phòng bằng bot và chụp ảnh kiểm.
Chạy từ thư mục gốc repo:
  python3 docs/review/ke-hoach-cai-thien/dot-2/kiem.py nhip [--rong=208] [hạt giống...]   đo thời gian dọn phòng ải 1 và ải 3 (bot); --rong=208 là sàn cũ
  python3 docs/review/ke-hoach-cai-thien/dot-2/kiem.py anh <tiền tố>   chụp ảnh 3 cỡ màn vào anh/<tiền tố>-...
Chỉ dùng bản lưu thử tự tạo trong trình duyệt tạm (không đụng dữ liệu thật)."""
import json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + ROOT + '/index.html'
SIZES = {
    'dt844': dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2),
    'may1280': dict(viewport={'width': 1280, 'height': 720}, device_scale_factor=1),
    'doc390': dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2),
}
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed, tut) {
    T.thaw(); T.rng(seed * 13 + 5);
    G.testSave({ lvl: 1 + r * 7 + i * 3, sharpen: i * 2 });
    if (tut) G.save.tut.done = false;
    G.save.potions = 2;
    G.startStage(r, i, 0, { kind: 'A', seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  // Một lượt bot chơi cả ải, ghi thời gian dọn từng phòng có quái (giây, bước 1/60).
  run(r, i, seed, maxSec) {
    const S = T.start(r, i, seed, false);
    const out = { rooms: [], win: null, t: 0, bad: 0, power: S.power, rec: S.rec };
    let idx = -1, t0 = 0, done = {};
    for (let s = 0; s < maxSec * 60; s++) {
      const S2 = G.getRun(); if (!S2) break;
      if (S2.mode === 'result' || S2.mode === 'dead') { out.win = S2.mode === 'result'; break; }
      if (S2.mode !== 'play') { G.botRun(1); continue; }
      G.sim(1); out.t += 1 / 60;
      const W = S2.W;
      if (S2.idx !== idx) { idx = S2.idx; t0 = out.t; }
      if (W.hadWaves && W.cleared && !done[idx]) { done[idx] = 1; out.rooms.push([W.type, +(out.t - t0).toFixed(2)]); }
      for (const e of W.ents) if (e.inside && !e.dead && (e.x < W.x0 - 1 || e.x > W.x1 + 1)) out.bad++;
    }
    const S3 = G.getRun();
    if (S3) { out.hp = Math.round(S3.P.hp); out.maxhp = S3.P.maxhp; out.pot = S3.P.potions; if (S3.won && out.win == null) out.win = true; }
    out.t = +out.t.toFixed(1);
    return out;
  },
};
"""


def page(b, sz):
    pg = b.new_page(**SIZES[sz])
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(500)
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(HELP)
    return pg, errs


def nhip():
    rong = [a for a in sys.argv[2:] if a.startswith('--rong=')]
    seeds = [int(a) for a in sys.argv[2:] if not a.startswith('--')] or [3, 7, 11]
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg, errs = page(b, 'may1280')
        if rong: pg.evaluate('(n) => { G.roomArt.RONG_PHONG = n; }', int(rong[0].split('=')[1]))  # --rong=208: đo lại với sàn cũ để so
        for name, r, i in [('ai1', 0, 0), ('ai3', 0, 2)]:
            rows = []
            for sd in seeds:
                o = pg.evaluate('([r,i,sd]) => T.run(r, i, sd, 600)', [r, i, sd])
                rows.append(o)
                print(name, 'seed', sd, json.dumps(o, ensure_ascii=False))
            ts = [t for o in rows for ty, t in o['rooms'] if ty in ('start', 'fight')]
            el = [t for o in rows for ty, t in o['rooms'] if ty == 'elite']
            res[name] = dict(tb_phong_thuong=round(sum(ts) / max(1, len(ts)), 2), so_phong=len(ts), tb_tinh_anh=round(sum(el) / max(1, len(el)), 2),
                             thang=sum(1 for o in rows if o['win']), luot=len(rows), tb_ca_ai=round(sum(o['t'] for o in rows) / len(rows), 1), quai_ngoai_san=sum(o['bad'] for o in rows))
        print(json.dumps(res, ensure_ascii=False, indent=1))
        print('lỗi JS:', errs)
        b.close()


SHOTS = [
    # tên, mã dựng cảnh
    ('thuong', "() => { const S = T.start(0, 2, 3); G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W; for (let k = 0; k < 400 && W.ents.length < 3; k++) G.sim(1); G.sim(30); T.freeze(); }"),
    ('huong-dan', "() => { const S = T.start(0, 0, 3, true); G.sim(60); T.freeze(); }"),
    ('huong-dan-tinh-anh', "() => { const S = T.start(0, 0, 3, true); G.testGoto('elite'); G.sim(40); T.freeze(); }"),
    ('huong-dan-suoi', "() => { const S = T.start(0, 0, 3, true); G.testGoto('fountain'); G.sim(20); T.freeze(); }"),
    ('cua-mo', "() => { const S = T.start(0, 0, 5, true); const R = S.map.rooms.filter(o => o.type === 'fight').sort((a, b) => Object.keys(b.doors).length - Object.keys(a.doors).length)[0]; G.gotoRoom(R.id); const W = G.getRun().W; S.P.inv = 999; for (let k = 0; k < 6000 && !W.cleared; k++) G.sim(1); G.botInput0 = G.botInput; G.botInput = null; G.sim(90); G.botInput = G.botInput0; T.freeze(); }"),
    ('tinh-anh', "() => { const S = T.start(0, 0, 3, true); G.testGoto('elite'); const W = G.getRun().W; S.P.inv = 999; G.botInput0 = G.botInput; G.botInput = null; for (let k = 0; k < 2000 && !W.ents.some(e => e.role === 'elite'); k++) G.sim(1); G.sim(30); G.botInput = G.botInput0; T.freeze(); }"),
    ('meo-vu-khi', "() => { const S = T.start(0, 2, 5); G.sim(30); const W = G.getRun().W; if (!(W.banner && W.banner.tip)) W.banner = { s: 'Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh ngay để lướt chém. Đặc biệt: Trảm Nguyệt phóng vệt chém xuyên quái.', col: '#ffd27a', t: 6, tip: true }; G.sim(2); T.freeze(); }"),
    ('ruong', "() => { T.start(0, 2, 3); G.testGoto('chest'); G.sim(20); T.freeze(); }"),
    ('suoi', "() => { T.start(0, 2, 3); G.testGoto('fountain'); G.sim(20); T.freeze(); }"),
    ('thuong-nhan', "() => { T.start(0, 2, 3); G.testGoto('merchant'); G.sim(20); T.freeze(); }"),
    ('thu-thach', "() => { T.start(0, 2, 3); G.testGoto('challenge'); G.sim(150); T.freeze(); }"),
    ('loi-nguyen', "() => { T.start(0, 2, 3); G.testGoto('curse'); G.sim(20); T.freeze(); }"),
    ('quai-lao', "() => { const S = T.start(0, 2, 3); G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W; W.waves = [['rusher', 'rusher', 'shield']]; W.waveI = -1; G.botInput0 = G.botInput; G.botInput = null; S.P.inv = 99; let ok = 0; for (let k = 0; k < 900 && !ok; k++) { G.sim(1); ok = W.zones.some(z => z.team !== 'player' && z.t > 0.1) || W.ents.some(e => e.wind > 0.15); } G.botInput = G.botInput0; T.freeze(); }"),
    ('dan', "() => { const S = T.start(0, 2, 3); G.gotoRoom(S.map.rooms.find(o => o.type === 'fight').id); const W = G.getRun().W; W.waves = [['archer', 'archer', 'archer']]; W.waveI = -1; G.botInput0 = G.botInput; G.botInput = null; S.P.inv = 99; let ok = 0; for (let k = 0; k < 900 && !ok; k++) { G.sim(1); ok = W.projs.filter(o => o.team !== 'player').length >= 2; } G.sim(6); G.botInput = G.botInput0; T.freeze(); }"),
    ('trum', "() => { const S = T.start(0, 4, 5); T.rng(77); G.testGoto('boss'); G.botInput0 = G.botInput; G.botInput = null; G.getRun().P.inv = 99; G.sim(200); G.botInput = G.botInput0; T.freeze(); }"),
]


def anh():
    pre = sys.argv[2]
    only = sys.argv[3:]
    out = os.path.join(HERE, 'anh')
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for sz in SIZES:
            pg, errs = page(b, sz)
            for name, code in SHOTS:
                if only and name not in only: continue
                if sz == 'doc390' and name not in ('thuong', 'huong-dan', 'trum'): continue
                pg.evaluate(code)
                pg.wait_for_timeout(350)
                pg.screenshot(path=os.path.join(out, '%s-%s-%s.png' % (pre, sz, name)))
                info = pg.evaluate("() => { const W = G.getRun().W, g = W.geo; return { fx0: g.fx0, fx1: g.fx1, scale: G.scale, ox: G.ox, cx: G.cx, vw: innerWidth, props: W.props.filter(p => p.type !== 'roomFore').map(p => [p.type, Math.round(p.x), Math.round(p.y)]), b: [W.x0, W.x1, W.y0, W.y1] }; }")
                print(sz, name, json.dumps(info))
            print(sz, 'lỗi JS:', errs)
        b.close()


if __name__ == '__main__':
    {'nhip': nhip, 'anh': anh}[sys.argv[1]]()
