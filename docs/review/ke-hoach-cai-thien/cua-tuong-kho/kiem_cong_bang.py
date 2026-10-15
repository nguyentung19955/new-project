#!/usr/bin/env python3
"""SOÁT CÔNG BẰNG Cua Đá mới (Node, không trình duyệt): ép trùm ra từng chiêu (G.bossDebug) ở pha 1 / pha 2 với em bé đứng giữa, sát
mỗi mép, mỗi góc; ghi mọi vùng trùm tạo ra rồi kiểm:
  1. báo trước: vùng thường ≥ 0,45 giây, vùng to (vòng / vành / đường dài / mảnh tường) ≥ 0,6 giây (G.NOI_GIAN.san);
  2. chiêu nhắm theo em bé: Kẹp càng quạt hướng về em bé và với tới em bé; vết nứt chạy qua hướng em bé tới tận mép sàn (không bị cắt);
  3. Tường tinh thể: tường hai bên chỗ em bé (hoặc tường phòng), đúng một khe thoát ≥ 24; mỗi loạt mảnh chừa dải trống ≥ 16 (né được),
     các loạt so le phủ HẾT bề cao sàn (đứng yên không an toàn), mảnh bay tới cả hai mép trái / phải;
  4. đá rơi dọc chân tường: chỉ phủ ≤ 22 điểm tính từ mép (bước vào trong là né).
  python3 kiem_cong_bang.py      → in từng mục, thoát mã 1 nếu có mục sai.
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('LK_GAME') or os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""
(o) => {
  G.save = G.fixSave(JSON.parse(o.sv)); G.save.sound = false;
  G.startStage(1, 1, 0);
  const S = G.getRun(); G.gotoRoom(S.map.boss);
  const W = G.getWorld(), b = W.boss, P = S.P;
  G.botInput = () => ({ mx: 0, my: 0 });
  for (let f = 0; f < 200; f++) { G.sim(1); P.hp = P.maxhp; }
  if (o.pha) { b.hp = b.maxhp * 0.4; G.sim(2); }
  const X = W.x0 + o.pt[0] * (W.x1 - W.x0), Y = W.y0 + o.pt[1] * (W.y1 - W.y0);
  P.x = X; P.y = Y;
  // trùm đứng cách em bé o.d (để thử Kẹp càng gần / xa, đá rơi khi em bé ở xa)
  const g = Math.atan2((W.y0 + W.y1) / 2 - Y, (W.x0 + W.x1) / 2 - X) || 0.3;
  b.x = Math.max(W.x0 + 4, Math.min(W.x1 - 4, X + Math.cos(g) * o.d)); b.y = Math.max(W.y0, Math.min(W.y1, Y + Math.sin(g) * o.d));
  W.zones = W.zones.filter((z) => z.src !== b); b.seq = []; b.busy = 0; b.st.stun = 0; b.lunge = null; b.luotCd = 99;
  const z0 = new Set(W.zones), log = [], t0 = G.time;
  const bx = b.x, by = b.y;
  G.bossDebug(o.k); b.cd = 0;
  for (let f = 0; f < 60 * 6; f++) {
    G.sim(1); P.hp = P.maxhp; P.x = X; P.y = Y; P.inv = 9; // em bé đứng yên, bất tử (chỉ ghi vùng)
    for (const z of W.zones) if (!z0.has(z)) { z0.add(z); if (z.src === b || z.ct) log.push({ sh: z.shape, x: z.x, y: z.y, r: z.r, r0: z.r0, r1: z.r1, ang: z.ang, len: z.len, w: z.w, span: z.span, t0: z.t0, at: G.time - t0, skill: z.skill, chan: z.ct && z.ct.chan ? z.ct.chan.map((t) => [t.x, t.y0, t.y1]) : null, day: z.ct && z.ct.day }); }
  }
  try { S.quit = true; G.finishStage(false); } catch (e) { /* bỏ qua */ }
  return { log, X, Y, bx, by, x0: W.x0, x1: W.x1, y0: W.y0, y1: W.y1, ZK: G.ZK, san: G.NOI_GIAN && G.NOI_GIAN.san, CUA: G.CUA_SO };
}
"""

CHO = {'giữa': (0.5, 0.5), 'mép trên': (0.5, 0), 'mép dưới': (0.5, 1), 'mép trái': (0, 0.5), 'mép phải': (1, 0.5),
       'góc trên-phải': (1, 0), 'góc dưới-trái': (0, 1)}


def main():
    import math
    errs = []
    pg = cd_lib.NodePage(errs)
    sv = json.load(open(os.path.join(GAME, 'tests', 'cay_luu.json')))[6]
    sai = []
    dem = 0

    def ok(dk, s):
        nonlocal dem
        dem += 1
        if not dk:
            sai.append(s)

    for pha in (0, 1):
        for ten, pt in CHO.items():
            for k, d in (('atk', 40), ('atk', 80), ('chieu1', 46), ('chieu1', 110), ('chieu2', 60)):
                r = pg.evaluate(JS, {'sv': sv, 'pha': pha, 'pt': pt, 'k': k, 'd': d})
                X, Y, x0, x1, y0, y1 = r['X'], r['Y'], r['x0'], r['x1'], r['y0'], r['y1']
                vung = [z for z in r['log'] if z['sh'] != 'ct']
                nhan = f"pha {pha + 1} · {ten} · {k} cách {d}"
                for z in vung:
                    to = z['sh'] in ('circle', 'donut') and (z.get('r') or z.get('r1') or 0) >= 60 or (z['sh'] == 'line' and (z['len'] or 0) >= 60)
                    can = 0.6 if to else 0.45
                    ok(z['t0'] >= can - 1e-6, f"{nhan}: vùng {z['sh']} báo trước {z['t0']:.2f} < {can}")
                if k == 'atk':
                    q = [z for z in vung if z['sh'] == 'cone'][0]
                    a = math.atan2(Y - r['by'], X - r['bx'])
                    da = abs(math.atan2(math.sin(a - q['ang']), math.cos(a - q['ang'])))
                    ok(da < 0.05 and math.hypot(X - q['x'], Y - q['y']) <= q['r'] + 3, f"{nhan}: Kẹp càng không với tới em bé (lệch {da:.2f}, tầm {q['r']:.0f})")
                if k == 'chieu1':
                    nut = [z for z in vung if z['sh'] == 'line' and z['skill'] == 'Đập càng rung sàn']
                    trong_vong = math.hypot((X - r['bx']) / 80, (Y - r['by']) / (80 * r['ZK'])) <= 1
                    if not nut:
                        ok(trong_vong, f"{nhan}: không có vết nứt mà em bé ngoài vòng đập")
                    for z in nut[:1]:
                        ex, ey = z['x'] + math.cos(z['ang']) * z['len'], z['y'] + math.sin(z['ang']) * z['len']
                        mep = min(abs(ex - x0), abs(ex - x1), abs(ey - y0), abs(ey - y1))
                        ok(mep <= 8 or ex < x0 or ex > x1 or ey < y0 or ey > y1, f"{nhan}: vết nứt dừng cách mép {mep:.0f} (bị cắt)")
                        al = (X - z['x']) * math.cos(z['ang']) + (Y - z['y']) * math.sin(z['ang']); ac = -(X - z['x']) * math.sin(z['ang']) + (Y - z['y']) * math.cos(z['ang'])
                        ok(abs(ac) <= z['w'] / 2 and -4 <= al <= z['len'] + 3 or trong_vong, f"{nhan}: vết nứt không qua chỗ em bé")
                    da = [z for z in vung if z['sh'] == 'circle' and z['r'] == r['CUA']['da']['r'] and z['at'] < 1.5]
                    for z in da:
                        tam = min(z['y'] - y0, y1 - z['y']) if abs(z['x'] - x0) > 9 and abs(z['x'] - x1) > 9 else min(z['x'] - x0, x1 - z['x'])
                        phu = tam + z['r'] * (r['ZK'] if abs(z['x'] - x0) > 9 and abs(z['x'] - x1) > 9 else 1)
                        ok(phu <= 23, f"{nhan}: đá rơi phủ {phu:.0f} điểm từ mép (> 22)")
                    xa = math.hypot(X - r['bx'], Y - r['by']) > r['CUA']['da']['xa']
                    satMep = min(X - x0, x1 - X, Y - y0, y1 - Y) < r['CUA']['da']['mep']
                    ok(bool(da) == (xa and satMep), f"{nhan}: đá rơi {'có' if da else 'không'} (xa {xa}, sát mép {satMep})")
                if k == 'chieu2':
                    vat = [z for z in r['log'] if z['sh'] == 'ct' and z['chan']]
                    ok(len(vat) == 1, f"{nhan}: không dựng tường")
                    if not vat: continue
                    TU = vat[0]['chan']; h = vat[0]['day'] / 2 + 1
                    xs = sorted({t[0] for t in TU})
                    trai = [x for x in xs if x < X]; phai = [x for x in xs if x > X]
                    ok((trai or X - x0 < 60) and (phai or x1 - X < 60), f"{nhan}: tường không ở hai bên em bé ({xs}, X {X:.0f})")
                    # khe: chỗ trống giữa các đoạn cùng một x (trừ vạch chắn 3 điểm mỗi bên như js/chieu_trum.js)
                    khe = []
                    for x in xs:
                        seg = sorted([t for t in TU if t[0] == x], key=lambda t: t[1])
                        ok(seg[0][1] <= y0 and seg[-1][2] >= y1, f"{nhan}: tường x={x:.0f} không cao hết sàn")
                        for a, c in zip(seg, seg[1:]): khe.append(c[1] - a[2] - 6)
                    ok(len(khe) == 1 and khe[0] >= 24, f"{nhan}: khe thoát {khe} (cần đúng 1 khe ≥ 24)")
                    manh = [z for z in vung if z['sh'] == 'line' and z['skill'] == 'Tường tinh thể' and (abs(z['ang']) < 0.01 or abs(abs(z['ang']) - math.pi) < 0.01)]
                    loat = {}
                    for z in manh: loat.setdefault(round(z['at'], 1), []).append(z)
                    ok(len(loat) >= 2, f"{nhan}: chỉ {len(loat)} loạt mảnh")
                    phu_all = []
                    for t, ds in sorted(loat.items()):
                        ys = sorted({round(z['y']) for z in ds})
                        bang = [(yy - (ds[0]['w'] / 2 + 3), yy + (ds[0]['w'] / 2 + 3)) for yy in ys]
                        phu_all += bang
                        trong = max(b2[0] - b1[1] for b1, b2 in zip(bang, bang[1:]))
                        ok(trong >= 16, f"{nhan}: loạt {t}s chỉ chừa dải trống {trong:.0f} (< 16)")
                        for yy in ys:
                            hang = [z for z in ds if round(z['y']) == yy]
                            lo = min(min(z['x'], z['x'] + math.cos(z['ang']) * z['len']) for z in hang); hi = max(max(z['x'], z['x'] + math.cos(z['ang']) * z['len']) for z in hang)
                            ok(lo <= x0 and hi >= x1, f"{nhan}: hàng mảnh y={yy} chỉ từ {lo:.0f} tới {hi:.0f}")
                    phu_all.sort(); cur = y0
                    for a, c in phu_all:
                        if a > cur + 0.5: break
                        cur = max(cur, c)
                    ok(cur >= y1, f"{nhan}: các loạt mảnh chưa phủ hết bề cao sàn (tới {cur:.0f}/{y1})")
    pg.close()
    print(f"Soát công bằng Cua Đá mới: {dem - len(sai)}/{dem} mục đúng")
    for s in sai[:30]: print('  SAI:', s)
    sys.exit(1 if sai else 0)


main()
