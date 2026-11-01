# KIỂM TRA ĐƯỜNG ĐI phòng demo "tổ kiến"
# Mô phỏng nhân vật bằng HỘP (chép vật lý di chuyển từ game/thu-mat-na/dong-co-mn.js: chạy, nhảy mềm,
# nhảy đôi, bám/trượt vách, nhảy vách, leo dây 'H', coyote, đệm nhảy) trên lưới art/phong-demo/man.json.
# Từ mọi chỗ đứng được + mọi chỗ bám dây, thử các kiểu bấm phím → xem tới được đâu → dựng đồ thị.
# Báo: chỗ "xuống được mà KHÔNG lên lại được" (một chiều), chỗ kẹt, chỗ không tới được.
#
# Chế độ:  python3 kiemtra_duongdi.py          → chế độ DỄ (đi, rơi, nhảy + nhảy đôi, leo dây; KHÔNG cần trèo vách liên tục)
#          python3 kiemtra_duongdi.py --du     → thêm trèo vách bằng nhảy vách liên tục (người chơi giỏi)
#          python3 kiemtra_duongdi.py --cao    → chỉ in tầm nhảy cao/xa
import json, math, os, sys
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__))
MAN = os.path.join(HERE, '../../art/phong-demo/man.json')

# ---------- hằng số (dong-co-mn.js P) ----------
RUN, JH, GRAV, ACCF, DECF, AIRC, TURNB, MAXF = 4.2, 118, 0.768, 6, 5, 0.8, 1.6, 10.4
FALLG, APEXG, APEXT, JCUT, COYOTE, JBUF, CORNER = 0.93, 0.3, 4, 0.5, 6, 8, 8
WSLIDE, WJVX, WJMUL, WJLOCK, WSENSE, WCOY, WBACK, WSTICK = 1.5, 5.4, 0.92, 9, 6, 8, 0.35, 6
LEO, DJ = 2.6, 0.88
JV = math.sqrt(2 * GRAV * JH)
T = 48
PW, PH = 28, 78      # trang demo: pl.w mặc định 28, pl.h = 78

L = []; COT = HANG = 0
def nap(luoi):
    global L, COT, HANG
    L = luoi; HANG = len(L); COT = len(L[0])
def tile(tx, ty):
    if tx < 0 or tx >= COT: return '#'
    if ty < 0: return '.'
    if ty >= HANG: return '#'
    return L[ty][tx]
def collide(x, y, w=PW, h=PH):
    x0, x1 = math.floor(x / T), math.floor((x + w - 0.001) / T)
    y0, y1 = math.floor(y / T), math.floor((y + h - 0.001) / T)
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1):
            if tile(tx, ty) == '#': return True
    return False
def sign(v): return (v > 0) - (v < 0)
def approach(v, t, d): return min(v + d, t) if v < t else max(v - d, t)

class NV:
    __slots__ = ('x', 'y', 'vx', 'vy', 'og', 'coy', 'jb', 'jumping', 'wd', 'leo', 'leoK', 'wlock', 'wcoy', 'lastW',
                 'wstick', 'wjb', 'djCo', 'sliding')
    def __init__(s, x, y, og=True):
        s.x, s.y, s.vx, s.vy = x, y, 0.0, 0.0
        s.og = og; s.coy = 0; s.jb = 0; s.jumping = False; s.wd = 0; s.leo = False; s.leoK = 0
        s.wlock = 0; s.wcoy = 0; s.lastW = 0; s.wstick = 0; s.wjb = 0; s.djCo = False; s.sliding = False

def moveX(o, dx):
    rem = dx
    while rem != 0:
        s = sign(rem) if abs(rem) > 1 else rem
        if not collide(o.x + s, o.y): o.x += s; rem -= s; continue
        return True
    return False
def moveY(o, dy):
    rem = dy
    while rem != 0:
        s = sign(rem) if abs(rem) > 1 else rem
        if not collide(o.x, o.y + s): o.y += s; rem -= s; continue
        if s < 0:
            ok = False
            for k in range(1, CORNER + 1):
                for d in (k, -k):
                    if not collide(o.x + d, o.y + s): o.x += d; ok = True; break
                if ok: break
            if ok: continue
        return 1 if s > 0 else -1
    return 0
def ketDat(o):
    o.og = collide(o.x, o.y + 1)
    if o.og: o.coy = COYOTE; o.djCo = False
    elif o.coy > 0: o.coy -= 1

def buoc(o, l, r, j, bamJ, u, d):
    """một khung (60 hình/giây) — chép capNhatNV phần di chuyển"""
    if bamJ: o.jb = JBUF
    dr = (1 if r else 0) - (1 if l else 0)
    if o.wlock > 0: o.wlock -= 1
    cx = o.x + PW / 2
    daySo = lambda yy: tile(math.floor(cx / T), math.floor(yy / T)) == 'H'
    trenDay = lambda: daySo(o.y + PH * 0.4) or daySo(o.y + PH * 0.12)
    if o.leoK > 0: o.leoK -= 1
    if not o.leo and o.leoK <= 0 and trenDay() and (u or (not o.og and o.vy > 0 and not d) or (not o.og and d)):
        o.leo = True; o.vx = 0; o.vy = 0; o.djCo = True; o.jumping = False
        o.x = math.floor(cx / T) * T + T / 2 - PW / 2
    if o.leo:
        o.vy = ((-1 if u else 0) + (1 if d else 0)) * LEO; o.vx = 0
        if o.jb > 0:
            o.leo = False; o.leoK = 14; o.vy = -JV * 0.85; o.vx = dr * RUN; o.jumping = True; o.jb = 0; o.djCo = True
        else:
            ry = moveY(o, o.vy)
            if ry == 1 or (not trenDay() and o.vy > 0): o.leo = False; o.leoK = 10
            elif not trenDay() and o.vy < 0: o.leo = False; o.leoK = 10; o.vy = -JV * 0.6
            ketDat(o); o.sliding = False
            if o.jb > 0: o.jb -= 1
            return
    # ngang
    target = dr * RUN; acc = RUN / ACCF; dec = RUN / DECF
    if not o.og: acc *= AIRC; dec *= AIRC * 0.6
    back = o.wlock > 0 and dr != 0 and dr == o.wjb
    if o.wlock > 0 and not back: acc *= 0.25
    if back: o.vx = approach(o.vx, target, acc * TURNB * 1.5)
    elif target != 0:
        turning = o.vx != 0 and sign(o.vx) != sign(target)
        o.vx = approach(o.vx, target, acc * TURNB if turning else acc)
    elif o.wlock <= 0: o.vx = approach(o.vx, 0, dec)
    # dọc
    g = GRAV
    if not o.og:
        a0 = min(1, abs(o.vy) / APEXT); a = a0 * a0 * (3 - 2 * a0); top = APEXG if j else 0.8
        g *= top + (1 - top) * a
        if o.vy > 0: g *= 1 + (FALLG - 1) * a
    o.vy = min(o.vy + g, MAXF)
    # vách
    ws = WSENSE + 0.5
    o.wd = 0 if o.og else (-1 if collide(o.x - ws, o.y) else (1 if collide(o.x + ws, o.y) else 0))
    if o.wd: o.wcoy = WCOY; o.lastW = o.wd
    else:
        if o.wcoy > 0: o.wcoy -= 1
        o.wstick = 0
    if o.og: o.wcoy = 0; o.wstick = 0
    sliding = False
    touching = o.wd and collide(o.x + o.wd, o.y)
    if o.wd and o.vy > 0 and dr != -o.wd and (touching or dr == o.wd):
        if o.wstick < WSTICK: o.wstick += 1; o.vy = 0
        else: o.vy = min(o.vy, WSLIDE)
        sliding = True; o.djCo = True
    if o.jb > 0:
        if o.og or o.coy > 0:
            o.vy = -JV; o.jumping = True; o.coy = 0; o.jb = 0; o.og = False; o.djCo = True
        elif o.wd or o.wcoy > 0:
            wd = o.wd or o.lastW; bk = dr == wd
            o.vy = -JV * WJMUL; o.vx = -wd * WJVX * (WBACK if bk else 1); o.wlock = WJLOCK
            o.wjb = wd; o.wcoy = 0; o.wstick = 0; o.jumping = True; o.jb = 0; o.djCo = True; sliding = False
        elif o.djCo:
            o.djCo = False; o.vy = -JV * DJ; o.jumping = True; o.jb = 0
    if o.jumping and not j and o.vy < 0: o.vy *= JCUT; o.jumping = False
    if o.vy >= 0: o.jumping = False
    if moveX(o, o.vx): o.vx = 0
    ry = moveY(o, o.vy)
    if ry != 0: o.vy = 0
    ketDat(o)
    o.sliding = sliding
    if o.jb > 0: o.jb -= 1

# ---------- nút đồ thị ----------
def dungDuoc(c, r):    # ô (c,r) đặc, phía trên đủ chỗ đứng (h=78 → 2 ô)
    return tile(c, r) == '#' and tile(c, r - 1) != '#' and tile(c, r - 2) != '#' and 0 < r < HANG
def nutDung(o):
    """chỗ đứng hiện tại → ('d', cột, hàng sàn)"""
    r = round((o.y + PH) / T); c = math.floor((o.x + PW / 2) / T)
    for cc in (c, c - 1, c + 1):
        if dungDuoc(cc, r): return ('d', cc, r)
    return ('d', c, r)
def nutDay(o):
    return ('h', math.floor((o.x + PW / 2) / T), math.floor((o.y + PH * 0.4) / T))

MAXF_SIM = 260
def chay(o, pol, du):
    """chạy chính sách phím pol(t, o) -> (l,r,j,u,d) tới khi đứng yên trên đất / bám dây. Trả nút hoặc None"""
    pj = False; daBay = False; st = {}
    for t in range(MAXF_SIM):
        l, r, j, u, d = pol(t, o, st)
        buoc(o, l, r, j, j and not pj, u, d); pj = j
        if not o.og: daBay = True
        if o.leo and daBay and t > 0: return nutDay(o)
        if o.og and daBay: return nutDung(o)
    return None

def chinhSachDung(du):
    P = []
    for h in (-1, 0, 1):
        # rơi khỏi mép: đi theo h, khi rời đất giữ h / thả / quay lại
        if h:
            for sau in (h, 0, -h):
                def p(t, o, st, h=h, sau=sau):
                    if not o.og: st['bay'] = True
                    hh = sau if st.get('bay') else h
                    return (hh < 0, hh > 0, False, False, False)
                P.append(('roi', h, sau, p))
        for chay0 in ((0, 10) if h else (0,)):
            for dj in (None, 6, 12, 18, 26, 34):
                for uu in (False, True):
                    for dung in (None, 14):
                        def p(t, o, st, h=h, c0=chay0, dj=dj, uu=uu, dung=dung):
                            if t < c0: return (h < 0, h > 0, False, False, False)
                            k = t - c0
                            hh = 0 if (dung is not None and k > dung) else h
                            j = True
                            if dj is not None and k == dj: j = False   # nhả để bấm lại = nhảy đôi
                            return (hh < 0, hh > 0, j, uu, False)
                        P.append(('nhay', h, chay0, dj, uu, dung, p))
    if du:   # trèo vách: hướng vào vách, mỗi lần đang trượt thì bấm nhảy (nhảy vách lưng-vách)
        for h in (-1, 1):
            for ra in (None, 40, 80, 120):
                def p(t, o, st, h=h, ra=ra):
                    if ra is not None and t > ra: return (h > 0, h < 0, True, False, False)
                    j = not (o.sliding and t % 2 == 0)
                    return (h < 0, h > 0, j, False, False)
                P.append(('vach', h, ra, p))
    return P

def chinhSachDay():
    P = []
    for huong in ('u', 'd'):     # leo lên/xuống 1 ô (hoặc tới hết dây rồi rời)
        for h in (-1, 0, 1):
            def p(t, o, st, huong=huong, h=h):
                if o.leo: return (False, False, False, huong == 'u', huong == 'd')
                return (h < 0, h > 0, True, False, False)
            P.append(('leo', huong, h, p))
    for h in (-1, 0, 1):
        for dj in (None, 8, 16, 26):
            for dung in (None, 10):
                def p(t, o, st, h=h, dj=dj, dung=dung):
                    hh = 0 if (dung is not None and t > dung) else h
                    j = t >= 1 and not (dj is not None and t == dj)
                    return (hh < 0, hh > 0, j, False, False)
                P.append(('nhayday', h, dj, dung, p))
    return P

def leoMotO(c, r, huong):
    """leo dây 1 ô bằng mô phỏng: trả nút kế"""
    o = NV(c * T + T / 2 - PW / 2, r * T + T * 0.5 - PH * 0.4, og=False); o.leo = True
    if collide(o.x, o.y): return None
    pj = False
    for t in range(200):
        if o.leo:
            n = nutDay(o)
            if n != ('h', c, r): return n
            buoc(o, False, False, False, False, huong == 'u', huong == 'd')
        else:
            # rời dây (hết dây): giữ hướng không, chờ đáp
            buoc(o, False, False, False, False, False, False)
            if o.og: return nutDung(o)
            if o.leo: return nutDay(o)
    return None

def xuLyNut(args):
    nut, du = args
    ra = set()
    if nut[0] == 'd':
        _, c, r = nut
        for pol in chinhSachDung(du):
            fn = pol[-1]
            o = NV(c * T + T / 2 - PW / 2, r * T - PH)
            if collide(o.x, o.y): break
            o.og = True
            n = chay(o, fn, du)
            if n and n != nut: ra.add(n)
        # bám dây ngay tại chỗ (đứng cạnh/trong dây, bấm ↑)
        o = NV(c * T + T / 2 - PW / 2, r * T - PH)
        if not collide(o.x, o.y):
            buoc(o, False, False, False, False, True, False)
            if o.leo: ra.add(nutDay(o))
    else:
        _, c, r = nut
        for huong in ('u', 'd'):
            n = leoMotO(c, r, huong)
            if n and n != nut: ra.add(n)
        for pol in chinhSachDay():
            if pol[0] == 'leo': continue
            o = NV(c * T + T / 2 - PW / 2, r * T + T * 0.5 - PH * 0.4, og=False); o.leo = True
            if collide(o.x, o.y): break
            n = chay(o, pol[-1], du)
            if n and n != nut: ra.add(n)
    return nut, ra

def doThi(luoi, du=False, procs=None):
    nap(luoi)
    nuts = [('d', c, r) for r in range(HANG) for c in range(COT) if dungDuoc(c, r)]
    nuts += [('h', c, r) for r in range(HANG) for c in range(COT) if tile(c, r) == 'H']
    E = {n: set() for n in nuts}
    # đi bộ trên cùng mặt sàn (hai chiều)
    for (_, c, r) in [n for n in nuts if n[0] == 'd']:
        if dungDuoc(c + 1, r):
            o = NV(c * T + T / 2 - PW / 2, r * T - PH)
            ok = True
            for _ in range(24):
                if moveX(o, 2): ok = False; break
            if ok: E[('d', c, r)].add(('d', c + 1, r)); E[('d', c + 1, r)].add(('d', c, r))
    with Pool(procs or os.cpu_count()) as pool:
        for nut, ra in pool.imap_unordered(xuLyNut, [(n, du) for n in nuts], chunksize=4):
            for m in ra:
                E[nut].add(m); E.setdefault(m, set())
    return E

def scc(E):
    idx = {}; low = {}; st = []; on = set(); comp = {}; k = [0]; nc = [0]
    sys.setrecursionlimit(100000)
    def dfs(v):
        idx[v] = low[v] = k[0]; k[0] += 1; st.append(v); on.add(v)
        for w in E.get(v, ()):
            if w not in idx: dfs(w); low[v] = min(low[v], low[w])
            elif w in on: low[v] = min(low[v], idx[w])
        if low[v] == idx[v]:
            while True:
                w = st.pop(); on.discard(w); comp[w] = nc[0]
                if w == v: break
            nc[0] += 1
    for v in list(E):
        if v not in idx: dfs(v)
    return comp

def toi(E, s):
    seen = {s}; q = [s]
    while q:
        v = q.pop()
        for w in E.get(v, ()):
            if w not in seen: seen.add(w); q.append(w)
    return seen

def nhom(nuts):
    """gom các nút liền kề thành vùng để báo gọn"""
    nuts = set(nuts); out = []
    while nuts:
        a = nuts.pop(); g = [a]; q = [a]
        while q:
            v = q.pop()
            for w in list(nuts):
                if abs(w[1] - v[1]) <= 1 and abs(w[2] - v[2]) <= 1: nuts.discard(w); g.append(w); q.append(w)
        out.append(g)
    return out

def kiemTra(man, du=False, in_ra=True):
    E = doThi(man['luoi'], du)
    start = ('d', man['xuat_phat_cot'], man['xuat_phat_hang'])
    cong = ('d', int(man['cong'][0] // 16), int(man['cong'][1] // 16))
    comp = scc(E)
    di = toi(E, start)
    chinh = comp[start]
    motChieu = [n for n in di if comp[n] != chinh]
    khongToi = [n for n in E if n not in di]
    if in_ra:
        print(f'Số chỗ đứng: {sum(1 for n in E if n[0]=="d")}, chỗ bám dây: {sum(1 for n in E if n[0]=="h")}')
        print('Tới được cổng:', cong in di, ' cổng thuộc vùng chính:', comp.get(cong) == chinh)
        for ten, ds in (('MỘT CHIỀU (xuống được, không quay về được)', motChieu), ('KHÔNG TỚI ĐƯỢC', khongToi)):
            vs = [g for g in nhom([n for n in ds if n[0] == 'd'])]
            print(f'{ten}: {len(vs)} vùng')
            for g in sorted(vs, key=lambda g: (min(n[2] for n in g), min(n[1] for n in g))):
                cs = [n[1] for n in g]; rs = [n[2] for n in g]
                print(f'   cột {min(cs)}–{max(cs)}, sàn hàng {min(rs)}–{max(rs)}  ({len(g)} ô)')
    return E, comp, di, motChieu, khongToi, start, cong

def tamNhay():
    nap(['.' * 40] * 30 + ['#' * 40])
    def thu(dj, h=0, tiep=None):
        o = NV(10 * T, 30 * T - PH); y0 = o.y; x0 = o.x; best = 0; pj = False
        for t in range(200):
            j = not (dj is not None and t == dj)
            buoc(o, h < 0, h > 0, j, j and not pj, False, False); pj = j
            best = max(best, y0 - o.y)
            if o.og and t > 2: break
        return best, o.x - x0
    print(f'Nhảy thường: cao {thu(None)[0]:.0f}px = {thu(None)[0]/T:.2f} ô; xa (chạy) {thu(None,1)[1]/T:.1f} ô')
    b = max(thu(d)[0] for d in range(5, 45))
    bx = max(thu(d, 1)[1] for d in range(5, 45))
    print(f'Nhảy + nhảy đôi: cao tối đa {b:.0f}px = {b/T:.2f} ô; xa tối đa {bx/T:.1f} ô')
    print(f'Leo dây {LEO}px/khung; rời đỉnh dây bật {JV*0.6:.1f}px/khung, nhảy rời dây {JV*0.85:.1f}')

if __name__ == '__main__':
    if '--cao' in sys.argv: tamNhay(); sys.exit()
    tamNhay()
    man = json.load(open(MAN))
    du = '--du' in sys.argv
    print('Chế độ:', 'ĐỦ (có trèo vách)' if du else 'DỄ (không cần trèo vách)')
    r = kiemTra(man, du)
    sys.exit(1 if (r[3] or r[4]) else 0)
