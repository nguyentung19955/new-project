#!/usr/bin/env python3
"""A — ĐO TỪNG TRÙM (trùm nhỏ, trùm vùng, tinh anh) bằng bot cân bằng chạy trong Node (luật game thật, ?cloud=0, không vẽ).
Chỉ ĐO — không sửa số game.

Bản lưu: mỗi ải một bản lưu thật của bot lúc Sức mạnh ≈ khuyên dùng (mặc định luu-A.json cùng thư mục, do do_chien_dich.py --luu ghi;
thiếu thì game/tests/cay_luu.json). Vào ải rồi nhảy thẳng vào phòng trùm (tinh anh: một phòng đánh, xoá quái, thả đúng một tinh anh).

Kiểu đo:
  thuong  bot né như người chơi (tests/bot.js): tỉ lệ thắng, thời gian, máu còn, máu mất theo chiêu (% máu tối đa mỗi lần trúng, số lần trúng / phút).
  dung    "đứng im" ở một chỗ (giữa, 4 mép, 4 góc), KHÔNG đánh, KHÔNG né, không chết (máu trả lại sau mỗi đòn): máu mất / phút theo chỗ
          đứng và theo chiêu. Trùm ở pha 1 hoặc ép pha bằng --pha=0.5 (đặt máu trùm = 50%).
  mep     "đứng sát mép / góc": đứng lì ở chỗ đó, trùm tới tầm thì chém, KHÔNG né (hoặc --ne: né vùng đỏ rồi quay về chỗ); máu thật, có bình.
          Thắng / thua / hết giờ, thời gian, máu còn — chỗ nào thắng dễ hơn bot thường là "chỗ đứng an toàn".

  python3 .../do_trum_a.py <thuong|dung|mep> <mục tiêu> [số lượt] [--pha=0.5] [--ne] [--T=40] [--cho=giua,tren,...] [--json=tệp] [--kho2]
          [--sm=khuyen|luu]  (mặc định khuyen: bản lưu dưới khuyên dùng thì nâng cấp nhân vật tới khi Sức mạnh >= khuyên dùng; luu: giữ nguyên)
    mục tiêu: ải 0..14 (phẩy), hoặc "tinhanh:heoNanh@2" (tinh anh + ải 0..14), "tinhanh" = cả 6 con ở ải giữa vùng (2, 7, 12).
    Biến môi trường LK_JS=mã: chạy mã đó trong game trước khi đo (thử đề xuất số trong bộ nhớ, không sửa tệp game).
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME', os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game')))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

CHO = ['giua', 'tren', 'duoi', 'trai', 'phai', 'goc-tt', 'goc-tp', 'goc-dt', 'goc-dp']
TEN_CHO = {'giua': 'giữa', 'tren': 'mép trên', 'duoi': 'mép dưới', 'trai': 'mép trái', 'phai': 'mép phải',
           'goc-tt': 'góc trên-trái', 'goc-tp': 'góc trên-phải', 'goc-dt': 'góc dưới-trái', 'goc-dp': 'góc dưới-phải'}
TINH_ANH = [('heoNanh', 2), ('namPhongChua', 2), ('cuaTuong', 7), ('caNocChua', 7), ('tuongMa', 12), ('huChua', 12)]

SETUP = r"""() => {
  const A = window.__A = { hb: {}, bat: false, cho: null, kieu: 'thuong', ne: false, luot: 0 };
  // máu mất theo nguồn (trùm: tên chiêu + pha; tinh anh: loại đòn), có thể "không chết" (trả máu sau mỗi đòn)
  const h0 = G.hurtPlayer;
  G.hurtPlayer = function (amt, el, src, melee) {
    const W = G.getWorld(), P = W.P, hp0 = P.hp;
    const r = h0.apply(this, arguments);
    if (r) {
      const lost = hp0 - P.hp, b = W.boss;
      let k;
      if (src && src.isBoss) k = 'p' + (src.phase + 1) + ' ' + (src.skillName || '?') + (melee ? ' (cận)' : '');
      else if (src && src.role === 'elite') k = (src.act ? src.act.k : 'đi') + (melee ? ' (cận)' : '');
      else if (b && !b.dead) k = 'p' + (b.phase + 1) + ' ' + (b.skillName || '?') + ' (vùng/đạn)';
      else if (src) k = src.role || '?';
      else k = A.tinhAnh ? 'tinh anh: vùng/đạn' : 'vùng/đạn';
      const q = A.hb[k] || (A.hb[k] = [0, 0, 0]);
      q[0] += lost / P.maxhp; q[1]++; q[2] = Math.max(q[2], lost / P.maxhp);
      if (A.bat) { P.hp = hp0; P.dead = false; if (W.over === 'dead') W.over = null; }
    }
    return r;
  };
  const b0 = G.botInput;
  const vungNguy = (W, P) => {
    for (const z of W.zones) { if (z.team === 'player' || z.team === 'fx') continue; if (z.wave || z.wall) return true; if (G.inZone(z, P, 6)) return true; }
    for (const o of W.projs) if (o.team === 'enemy' && Math.hypot(o.x - P.x, o.y - P.y) < 34) return true;
    return false;
  };
  G.botInput = function (S) {
    if (!A.cho || S.W !== A.W) return b0(S);
    const W = S.W, P = S.P;
    if (A.kieu === 'mep' && A.ne && vungNguy(W, P)) return b0(S);
    const inp = { mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false };
    const dx = A.cho[0] - P.x, dy = A.cho[1] - P.y, d = Math.hypot(dx, dy);
    if (d > 3) { inp.mx = dx / d; inp.my = dy / d; }
    if (A.kieu === 'mep') {
      if (P.hp < P.maxhp * 0.35 && P.potions > 0) inp.potionP = true;
      const t = A.dich();
      if (t && Math.abs(t.x - P.x) < 46 + (t.r || 10) && Math.abs(t.y - P.y) < 16 + (t.hr || 8)) { inp.atk = true; S.botTap = !S.botTap; inp.atkP = S.botTap; }
    }
    return inp;
  };
  return 1;
}"""

RUN = r"""(c) => {
  const A = window.__A;
  G.save = G.fixSave(JSON.parse(c.sv)); G.save.sound = false; G.botCfg.prefer = null;
  if (c.datSm) { const hs = G.save.heroes[G.save.hero]; while (G.power() < c.datSm && hs.lvl < G.MAX_LEVEL) hs.lvl++; } // bản lưu dưới khuyên dùng: nâng cấp nhân vật tới đủ
  G.startStage(c.r, c.i, c.diff || 0);
  const S0 = G.getRun();
  let dich;
  if (c.tinhAnh) {
    const room = S0.map.rooms.find((o) => o.type === 'fight' || o.type === 'elite' || o.type === 'start');
    G.gotoRoom(room.id);
    const W = G.getWorld();
    W.waves = []; W.spawns = []; W.ents.length = 0; W.zones.length = 0; W.projs.length = 0;
    const g = W.geo || { cx: (W.x0 + W.x1) / 2, cy: (W.y0 + W.y1) / 2 };
    dich = G.spawnEnemy('elite', g.cx + 60, g.cy - 6, { art: c.tinhAnh });
    A.tinhAnh = true;
  } else {
    G.gotoRoom(S0.map.boss); dich = G.getWorld().boss; A.tinhAnh = false;
  }
  const W = G.getWorld(), P = S0.P;
  A.cast = {};
  if (dich && dich.isBoss) { let sn = dich.skillName; Object.defineProperty(dich, 'skillName', { configurable: true, get() { return sn; }, set(v) { sn = v; const k = 'p' + (dich.phase + 1) + ' ' + v; A.cast[k] = (A.cast[k] || 0) + 1; } }); }
  if (c.lop && dich && dich.layers) dich.layers = c.lop.split(',').map((t) => (t.indexOf(':') > 0 ? { type: t.split(':')[0], el: t.split(':')[1], pct: 0.3 } : { type: t }));
  if (c.mau) P.hp = Math.max(1, Math.round(P.maxhp * c.mau));
  const g = W.geo || { cx: (W.x0 + W.x1) / 2, cy: (W.y0 + W.y1) / 2 };
  const CHO = { giua: [g.cx, g.cy], tren: [g.cx, W.y0], duoi: [g.cx, W.y1], trai: [W.x0, g.cy], phai: [W.x1, g.cy],
    'goc-tt': [W.x0, W.y0], 'goc-tp': [W.x1, W.y0], 'goc-dt': [W.x0, W.y1], 'goc-dp': [W.x1, W.y1] };
  A.hb = {}; A.W = W; A.kieu = c.kieu; A.ne = !!c.ne; A.dich = () => dich;
  A.cho = c.kieu === 'thuong' ? null : CHO[c.cho];
  A.bat = c.kieu === 'dung';
  if (A.cho) { P.x = A.cho[0]; P.y = A.cho[1]; }
  const out = { win: false, t: 0, hp: 0, dichHp: 100, maxhp: P.maxhp, het: false, tTrung: 0, dmg: Math.round(dich.dmg), dichMaxhp: Math.round(dich.maxhp) };
  const T = c.kieu === 'dung' ? c.T : 360;
  let ep = false;
  for (let s = 0; s < T * 2; s++) {
    const S = G.getRun();
    if (!S) break;
    if (c.kieu === 'dung') {
      if (!ep && c.pha && dich && !(dich.invuln > 0)) { dich.hp = dich.maxhp * c.pha; ep = true; }
      if (dich && dich.hp < dich.maxhp * 0.05) dich.hp = dich.maxhp * 0.05; // không để chết
    }
    if (S.won || (dich && dich.dead)) { out.win = true; out.hp = Math.round(P.hp / P.maxhp * 100); break; }
    if (S.mode === 'dead' || S.mode === 'result' || P.dead) break;
    if (S.mode !== 'play') { G.botRun(1); continue; }
    G.sim(30); out.t += 0.5;
    if (A.cho && Math.hypot(P.x - A.cho[0], P.y - A.cho[1]) < 8) out.tTrung += 0.5;
  }
  if (!out.win && !P.dead && out.t >= T - 0.5) out.het = true;
  out.dichHp = dich ? Math.max(0, Math.round(dich.hp / dich.maxhp * 100)) : null;
  out.ten = dich ? (dich.name || dich.art) : '?';
  out.hb = A.hb; out.cast = A.cast; out.pha = dich && dich.phase;
  A.cho = null; A.bat = false; A.W = null;
  try { const S = G.getRun(); if (S) { S.quit = true; G.finishStage(false); } } catch (e) { /* bỏ qua */ }
  return out;
}"""


def arg(name, d=None):
    for a in sys.argv[1:]:
        if a.startswith('--' + name + '='):
            return a.split('=', 1)[1]
    return d


def muc_tieu(s):
    out = []
    for p in s.split(','):
        if p == 'tinhanh':
            out += [('ta', a, k) for a, k in TINH_ANH]
        elif p.startswith('tinhanh:'):
            a, k = p[8:].split('@')
            out.append(('ta', a, int(k)))
        else:
            out.append(('st', None, int(p)))
    return out


def gop_hb(rs):
    tot = {}
    for x in rs:
        for k, v in x['hb'].items():
            q = tot.setdefault(k, [0, 0, 0])
            q[0] += v[0]; q[1] += v[1]; q[2] = max(q[2], v[2])
    return tot


def main():
    kieu = sys.argv[1]
    mt = muc_tieu(sys.argv[2])
    n = int(sys.argv[3]) if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else 10
    pha = float(arg('pha', '0') or 0)
    T = float(arg('T', '40'))
    cho = (arg('cho') or ','.join(CHO)).split(',')
    ne = '--ne' in sys.argv
    diff = 1 if '--kho2' in sys.argv else 0
    luu_f = arg('luu') or os.path.join(HERE, 'luu-A.json')
    if not os.path.exists(luu_f):
        luu_f = os.path.join(GAME, 'tests', 'cay_luu.json')
    REAL = json.load(open(luu_f))
    mau = float(os.environ.get('LK_MAU') or 0)
    lop = os.environ.get('LK_LOP') or ''
    errs = []
    pg = cd_lib.NodePage(errs)
    pg.evaluate(SETUP)
    if os.environ.get('LK_JS'):  # thử một đề xuất số TRONG BỘ NHỚ (không sửa tệp game), vd LK_JS='G.STAGE_K.mob[8] = [1.3, 2.2]'
        pg.evaluate('() => { ' + os.environ['LK_JS'] + '; return 1; }')
    ket = []
    for loai, art, k in mt:
        r, i = divmod(k, 5)
        sv = REAL[k]
        rec = pg.evaluate('([r, i, d]) => G.stageRec(r, i, d)', [r, i, diff])
        dat = rec if (arg('sm', 'khuyen') == 'khuyen' and not diff) else 0
        pw = pg.evaluate("([s, d]) => { G.save = G.fixSave(JSON.parse(s)); const hs = G.save.heroes[G.save.hero]; while (d && G.power() < d && hs.lvl < G.MAX_LEVEL) hs.lvl++; return G.power(); }", [sv, dat])
        base = {'r': r, 'i': i, 'diff': diff, 'sv': sv, 'kieu': kieu, 'T': T, 'pha': pha, 'ne': ne, 'mau': mau, 'lop': lop, 'tinhAnh': art if loai == 'ta' else None, 'datSm': dat}
        nhan = f"{'K2 ' if diff else ''}{r+1}-{i+1}" + (f" tinh anh {art}" if art else '')
        dsc = cho if kieu != 'thuong' else ['-']
        for c in dsc:
            rs = [pg.evaluate(RUN, dict(base, cho=c)) for _ in range(n)]
            w = [x for x in rs if x['win']]
            het = [x for x in rs if x['het']]
            hb = gop_hb(rs)
            cast = {}
            for x in rs:
                for k2, v in (x.get('cast') or {}).items():
                    cast[k2] = cast.get(k2, 0) + v
            tsum = sum(x['t'] for x in rs) or 1
            rec_o = {'muc': nhan, 'ten': rs[0]['ten'], 'cho': c, 'kieu': kieu, 'pha': pha, 'ne': ne, 'n': n, 'sm': pw, 'rec': rec,
                     'thang': len(w), 'het': len(het), 'tThang': (sum(x['t'] for x in w) / len(w)) if w else None,
                     'hpThang': (sum(x['hp'] for x in w) / len(w)) if w else None,
                     'dichConKhiThua': (sum(x['dichHp'] or 0 for x in rs if not x['win']) / max(1, n - len(w))),
                     'mauPhut': sum(v[0] for v in hb.values()) / (tsum / 60) * 100, 'tTrung': sum(x['tTrung'] for x in rs) / tsum,
                     'hb': {k2: [v[0] / (tsum / 60) * 100, v[1] / (tsum / 60), v[2] * 100, v[0] / max(1e-9, sum(q[0] for q in hb.values())) * 100] for k2, v in hb.items()},
                     'cast': {k2: v / (tsum / 60) for k2, v in cast.items()},
                     'dmg': rs[0]['dmg'], 'dichMaxhp': rs[0]['dichMaxhp'], 'maxhp': rs[0]['maxhp']}
            ket.append(rec_o)
            top = sorted(rec_o['hb'].items(), key=lambda q: -q[1][0])[:6]
            print(f"{nhan} {rec_o['ten']} [{kieu}{' né' if ne else ''}{' pha=' + str(pha) if pha else ''}] {TEN_CHO.get(c, 'bot thường')}: "
                  + (f"máu mất {rec_o['mauPhut']:.0f}%/phút" if kieu == 'dung' else
                     f"thắng {len(w)}/{n}{' (hết giờ ' + str(len(het)) + ')' if het else ''}"
                     + (f" · {rec_o['tThang']:.0f}s · máu còn {rec_o['hpThang']:.0f}%" if w else '') + f" · mất {rec_o['mauPhut']:.0f}%/phút")
                  + (f" · ở đúng chỗ {rec_o['tTrung']*100:.0f}% thời gian" if c != '-' else '') + f" | SM {pw}/{rec} | " + '; '.join(f"{k2}: {v[0]:.0f}%/ph, {v[1]:.1f} lần/ph, to nhất {v[2]:.0f}%" for k2, v in top), flush=True)
    jf = arg('json')
    if jf:
        json.dump(ket, open(jf, 'w'), ensure_ascii=False)
    if errs:
        print('LỖI TRANG:', errs[:3])
    pg.close()


main()
