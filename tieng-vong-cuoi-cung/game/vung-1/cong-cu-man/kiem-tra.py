# -*- coding: utf-8 -*-
"""kiem-tra.py – LUỒNG B: kiểm tra toàn bộ phòng Vùng 1 + mô phỏng đường đi bằng hộp.
Chạy:  python3 kiem-tra.py            (kiểm tra + vẽ ảnh xem trước vào cong-cu-man/xem/)
       python3 kiem-tra.py --khong-ve (chỉ kiểm tra)
Kiểm tra:
  1. Lưới đều cột, kích thước 30–90 × 14–45, mép kín trừ cửa.
  2. Cửa khớp 2 chiều (A→B và B→A), hướng đối nhau, cùng 'cao', ô cửa thông, cửa ngang có sàn; lệch toạ độ thế giới.
  3. Quái / vật phẩm / Chuông Lưu / điểm bắt đầu đứng trên sàn (Màn Tang treo dưới trần; quái bay chỉ cần ô trống).
  4. Mô phỏng hộp 28×96 (vật lý chép từ engine – fiz.py): đi bộ + nhảy + nhảy đôi + dây leo, KHÔNG bám/bật tường, KHÔNG lướt,
     tường nứt 'N' coi là ĐẶC (tuyến chính không được cần chém vỡ). Phải: đi P01 → P12, nhặt đủ 3 chuong_vo,
     cửa khoá chỉ mở sau khi đủ 3 chuông, và mọi chỗ tới được đều quay về được P12 (không kẹt).
  5. Lượt 2: coi 'N' đã vỡ → kiểm tra hốc bí mật (H1) và lối tắt P02↔P06.
"""
import json, math, os, sys, glob
from collections import deque, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fiz
from fiz import T, W, H, JUMP_VEL

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
XEM = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'xem')
LOI, CANH = [], []
QUAI_BAY = {'doi', 'vai', 'chuong'}
NGUOC = {'trai': 'phai', 'phai': 'trai', 'tren': 'duoi', 'duoi': 'tren'}


def loi(s): LOI.append(s)
def canh(s): CANH.append(s)


def nap():
    bd = json.load(open(os.path.join(GOC, 'ban-do.json'), encoding='utf-8'))
    ph = {}
    for f in sorted(glob.glob(os.path.join(GOC, 'phong', '*.json'))):
        d = json.load(open(f, encoding='utf-8'))
        ph[d['id']] = d
    return bd, ph


def kiem_tinh(bd, ph):
    vp_ids = set()
    for pid, d in ph.items():
        g = d['luoi']; R, C = len(g), len(g[0])
        if any(len(r) != C for r in g):
            loi(f'{pid}: hàng lưới không đều độ dài')
        if not (30 <= C <= 90 and 14 <= R <= 45):
            canh(f'{pid}: kích thước {C}×{R} ngoài khoảng 30–90 × 14–45')
        o_cua = set()
        for c in d['cua']:
            n = c['cao']
            if c['huong'] in ('trai', 'phai'):
                cells = [(c['cot'], c['hang'] + i) for i in range(n)]
                if c['cot'] != (0 if c['huong'] == 'trai' else C - 1):
                    loi(f"{pid}/{c['id']}: cửa {c['huong']} không nằm ở mép")
                fl = c['hang'] + n
                if fl >= R or g[fl][c['cot']] != '#':
                    loi(f"{pid}/{c['id']}: cửa ngang không có sàn dưới")
            else:
                cells = [(c['cot'] + i, c['hang']) for i in range(n)]
                if c['hang'] != (0 if c['huong'] == 'tren' else R - 1):
                    loi(f"{pid}/{c['id']}: cửa {c['huong']} không nằm ở mép")
            for (cc, rr) in cells:
                if g[rr][cc] not in '.H':
                    loi(f"{pid}/{c['id']}: ô cửa ({cc},{rr}) bị chặn '{g[rr][cc]}'")
                o_cua.add((cc, rr))
            # khớp 2 chiều
            if c['toi'] not in ph:
                loi(f"{pid}/{c['id']}: phòng đích {c['toi']} không tồn tại"); continue
            dich = [x for x in ph[c['toi']]['cua'] if x['id'] == c['toi_cua']]
            if not dich:
                loi(f"{pid}/{c['id']}: cửa đích {c['toi_cua']} không có"); continue
            x = dich[0]
            if x['toi'] != pid or x['toi_cua'] != c['id']:
                loi(f"{pid}/{c['id']}: cửa đích {x['id']} không trỏ ngược lại")
            if x['huong'] != NGUOC[c['huong']]:
                loi(f"{pid}/{c['id']}: hướng {c['huong']} không đối với {x['huong']}")
            if x['cao'] != c['cao']:
                loi(f"{pid}/{c['id']}: cao {c['cao']} ≠ {x['cao']}")
            # lệch thế giới
            pa = next(p for p in bd['phong'] if p['id'] == pid); pb = next(p for p in bd['phong'] if p['id'] == c['toi'])
            if c['huong'] in ('trai', 'phai'):
                dy = (pa['y_o'] + c['hang']) - (pb['y_o'] + x['hang'])
                dx = (pa['x_o'] + c['cot'] + (1 if c['huong'] == 'phai' else -1)) - (pb['x_o'] + x['cot'])
            else:
                dx = (pa['x_o'] + c['cot']) - (pb['x_o'] + x['cot'])
                dy = (pa['y_o'] + c['hang'] + (1 if c['huong'] == 'duoi' else -1)) - (pb['y_o'] + x['hang'])
            if dx or dy:
                canh(f"{pid}/{c['id']}: lệch bản đồ thế giới với {x['id']} (dx={dx}, dy={dy})")
        # mép kín
        for r in range(R):
            for cc in (0, C - 1):
                if g[r][cc] != '#' and (cc, r) not in o_cua:
                    loi(f'{pid}: mép hở tại ({cc},{r}) không phải cửa')
        for cc in range(C):
            for r in (0, R - 1):
                if g[r][cc] != '#' and (cc, r) not in o_cua:
                    loi(f'{pid}: mép hở tại ({cc},{r}) không phải cửa')

        def trong(c_, r_):
            return 0 <= r_ < R and 0 <= c_ < C and g[r_][c_] in '.H'

        def san(c_, r_):
            return 0 <= r_ < R and 0 <= c_ < C and g[r_][c_] in '#='
        for q in d['quai']:
            c_, r_ = q['cot'], q['hang']
            if q['loai'] == 'tang':
                if not (trong(c_, r_) and 0 <= r_ - 1 and g[r_ - 1][c_] == '#'):
                    loi(f"{pid}: Màn Tang ({c_},{r_}) không treo dưới trần")
                else:
                    # LUỒNG D: Màn Tang chỉ vồ được khi sàn cách trần đúng 3 ô (thân treo 92 px, engine cần chân→sàn 10–90 px)
                    k = 0
                    while trong(c_, r_ + k):
                        k += 1
                    if k != 3 or not san(c_, r_ + k):
                        loi(f"{pid}: Màn Tang ({c_},{r_}) trần→sàn {k} ô (cần đúng 3 ô để vồ được người đi dưới)")
                    elif q.get('cao') not in (None, 1):
                        canh(f"{pid}: Màn Tang ({c_},{r_}) 'cao' nên = 1 (chân cách sàn ~52 px)")
            elif q['loai'] in QUAI_BAY:
                if not trong(c_, r_):
                    loi(f"{pid}: quái bay {q['loai']} ({c_},{r_}) trong đá")
            else:
                if not (trong(c_, r_) and trong(c_, r_ - 1) and san(c_, r_ + 1)):
                    loi(f"{pid}: quái {q['loai']} ({c_},{r_}) không đứng trên sàn / thiếu chỗ")
                if 'tu' in q:
                    hong = [x for x in range(q['tu'], q['den'] + 1) if not (trong(x, r_) and san(x, r_ + 1))]
                    if hong:
                        canh(f"{pid}: quái {q['loai']} đi tuần {q['tu']}–{q['den']} có ô không có sàn: {hong[:6]}")
        # LUỒNG D: không đặt quái sát cửa vào (vùng tuần tra cách ô cửa ≥ 7 ô); trùm/tinh anh tự lo
        o_cua2 = []
        for cu in d['cua']:
            for i in range(cu['cao']):
                o_cua2.append((cu['cot'], cu['hang'] + i) if cu['huong'] in ('trai', 'phai') else (cu['cot'] + i, cu['hang']))
        for q in d['quai']:
            for x in range(q.get('tu', q['cot']), q.get('den', q['cot']) + 1):
                kc = min(math.hypot(x - a, q['hang'] - b) for a, b in o_cua2) if o_cua2 else 99
                if kc < 7:
                    loi(f"{pid}: quái {q['loai']} ({x},{q['hang']}) sát cửa ({kc:.1f} ô < 7)")
                    break
        diem = [(v['id'], v['cot'], v['hang']) for v in d['vat_pham']]
        if d.get('chuong_luu'):
            diem.append(('chuong_luu', d['chuong_luu']['cot'], d['chuong_luu']['hang']))
        if d.get('bat_dau'):
            diem.append(('bat_dau', d['bat_dau']['cot'], d['bat_dau']['hang']))
        for vid, c_, r_ in diem:
            if not (trong(c_, r_) and san(c_, r_ + 1)):
                loi(f'{pid}: {vid} ({c_},{r_}) không nằm trên sàn')
        for v in d['vat_pham']:
            if v['id'] in vp_ids:
                loi(f"trùng id vật phẩm {v['id']}")
            vp_ids.add(v['id'])
    n = sum(1 for d in ph.values() for v in d['vat_pham'] if v['loai'] == 'chuong_vo')
    if n != 3:
        loi(f'Số Chuông Vỡ = {n} (cần 3)')


# ------------------------------------------------------------------ MÔ PHỎNG ĐƯỜNG ĐI
def tao_chinh_sach():
    """các kiểu bấm khi nhảy: (huong_ham, giu_frames, dj_frame)"""
    cs = []
    for d in (-1, 1):
        for dung in (None, 6, 12, 20, 30):
            hf = (lambda d, k: (lambda f: d if (k is None or f <= k) else 0))(d, dung)
            for dj in (None, 8, 14, 20, 26, 34, 44):
                cs.append((d, hf, 99, dj))
        # nhảy thấp
        cs.append((d, (lambda d: lambda f: d)(d), 5, None))
        cs.append((d, (lambda d: lambda f: d if f <= 8 else 0)(d), 5, None))
        # nhảy rồi bẻ lái ngược (vòng qua mép trần)
        for dj in (None, 20, 34):
            cs.append((d, (lambda d: lambda f: d if f <= 14 else -d)(d), 99, dj))
    for dj in (None, 10, 18, 26, 36):
        cs.append((0, lambda f: 0, 99, dj))
    for d in (-1, 1):   # nhảy thẳng lên rồi mới bẻ (lên gờ ngay trên đầu)
        for dj in (None, 18, 26):
            cs.append((0, (lambda d: lambda f: 0 if f <= 16 else d)(d), 99, dj))
    return cs


CS = tao_chinh_sach()


class Mo:
    def __init__(self, d, nut_vo):
        self.d = d
        self.m = fiz.Map(d['luoi'], nut_vo)
        self.R, self.C = self.m.R, self.m.C
        self.cache = {}

    def la_dung(self, c, r):
        m = self.m
        if not (0 <= c < self.C and 0 <= r < self.R):
            return False
        x, y = c * T + T / 2 - W / 2, (r + 1) * T - H
        return not m.collide(x, y) and fiz.tren_dat(m, {'x': x, 'y': y})

    def la_day(self, c, rt):
        x, y = c * T + T / 2 - W / 2, rt * T
        return 0 <= rt and not self.m.collide(x, y) and fiz.tren_day(self.m, {'x': x, 'y': y})

    def cua_ra(self, x, y):
        """vị trí hộp đã ra khỏi phòng → cửa nào"""
        cx, cy = x + W / 2, y + H / 2
        for c in self.d['cua']:
            n = c['cao']
            if c['huong'] == 'trai' and x + W / 2 < 0 and c['hang'] * T - T <= cy <= (c['hang'] + n) * T + T:
                return c
            if c['huong'] == 'phai' and x + W / 2 > self.C * T and c['hang'] * T - T <= cy <= (c['hang'] + n) * T + T:
                return c
            if c['huong'] == 'tren' and y + H / 2 < 0 and c['cot'] * T - T <= cx <= (c['cot'] + n) * T + T:
                return c
            if c['huong'] == 'duoi' and y + H / 2 > self.R * T and c['cot'] * T - T <= cx <= (c['cot'] + n) * T + T:
                return c
        return None

    def ket_qua(self, x, y, tt, bam_day=True):
        """điểm kết thúc quỹ đạo → nút"""
        if tt == 'ra':
            c = self.cua_ra(x, y)
            return ('cua', c['id']) if c else ('loi_mep', int(x // T), int(y // T))
        if tt == 'day':
            c = int((x + W / 2) // T)
            for rt in (int(round(y / T)), int(y // T), int(y // T) + 1, int(y // T) - 1):
                if self.la_day(c, rt):
                    return ('day', c, rt)
            return None
        if tt == 'dat':
            r = int(round((y + H) / T)) - 1
            c = int((x + W / 2) // T)
            for cc in (c, c - 1, c + 1):
                if self.la_dung(cc, r):
                    return ('dat', cc, r)
            return None
        return None

    def phu(self, vet):
        s = set()
        for (x, y) in vet[::2]:
            for cy in range(int(y // T), int((y + H - 1) // T) + 1):
                for cx in range(int(x // T), int((x + W - 1) // T) + 1):
                    s.add((cx, cy))
        return s

    def bay(self, x, y, vx, vy, hf, giu, dj, djco=True, nhay_dat=False, bam_sau=0):
        m = self.m
        # bám dây chỉ sau bam_sau khung (engine leoKhoa)
        if bam_sau:
            x1, y1, tt, vet = fiz.bay(m, x, y, vx, vy, hf, giu, dj, djco=djco, nhay_dat=nhay_dat, bam_day=False, toi_da=bam_sau)
            if tt != 'het':
                return x1, y1, tt, vet
            # tiếp tục – xấp xỉ: tính lại vận tốc từ 2 điểm cuối
            if len(vet) >= 2:
                vx2 = vet[-1][0] - vet[-2][0]; vy2 = vet[-1][1] - vet[-2][1]
            else:
                vx2, vy2 = vx, vy
            hf2 = (lambda f, hf=hf, k=bam_sau: hf(f + k))
            dj2 = dj - bam_sau if (dj and dj > bam_sau) else None
            x2, y2, tt2, vet2 = fiz.bay(m, x1, y1, vx2, vy2, hf2, max(0, giu - bam_sau), dj2,
                                        djco=djco and not (dj and dj <= bam_sau))
            return x2, y2, tt2, vet + vet2
        return fiz.bay(m, x, y, vx, vy, hf, giu, dj, djco=djco, nhay_dat=nhay_dat)

    def canh_ke(self, nut):
        """trả list (nut_moi, tap_o_phu)"""
        if nut in self.cache:
            return self.cache[nut]
        out = []
        k = nut[0]
        if k == 'dat':
            _, c, r = nut
            x, y = c * T + T / 2 - W / 2, (r + 1) * T - H
            # đi bộ
            for d in (-1, 1):
                c2 = c + d
                if c2 < 0 or c2 >= self.C:
                    xx = -W if c2 < 0 else self.C * T + 1
                    cu = self.cua_ra(xx, y)
                    if cu:
                        out.append((('cua', cu['id']), {(c, r), (c, r - 1)}))
                    continue
                if self.la_dung(c2, r):
                    out.append((('dat', c2, r), {(c2, r), (c2, r - 1)}))
                elif not self.m.collide(c2 * T + T / 2 - W / 2, y):
                    # bước khỏi mép → rơi (không có nhảy đôi khi rơi khỏi mép)
                    xs = (c + 1) * T + 1 if d > 0 else c * T - W - 1
                    for hd in (d, 0, -d):
                        x1, y1, tt, vet = self.bay(xs, y, d * 4.2, 0.0, lambda f, hd=hd: hd, 0, None, djco=False)
                        n = self.ket_qua(x1, y1, tt)
                        if n:
                            out.append((n, self.phu(vet)))
            # rơi qua sàn mỏng
            if 0 <= r + 1 < self.R and self.d['luoi'][r + 1][c] == '=':
                for hd in (-1, 0, 1):
                    x1, y1, tt, vet = self.bay(x, y + 2, 0.0, 1.0, lambda f, hd=hd: hd, 0, None, djco=False)
                    n = self.ket_qua(x1, y1, tt)
                    if n:
                        out.append((n, self.phu(vet)))
            # bám dây tại chỗ
            if fiz.tren_day(self.m, {'x': x, 'y': y}):
                for rt in (r - 1, r - 2):
                    if self.la_day(c, rt):
                        out.append((('day', c, rt), set())); break
            # nhảy
            for (d0, hf, giu, dj) in CS:
                x1, y1, tt, vet = self.bay(x, y, d0 * 4.2, -JUMP_VEL, hf, giu, dj, nhay_dat=True)
                n = self.ket_qua(x1, y1, tt)
                if n:
                    out.append((n, self.phu(vet)))
        elif k == 'day':
            _, c, rt = nut
            x, y = c * T + T / 2 - W / 2, rt * T
            cov = {(c, rt), (c, rt + 1)}
            # leo lên
            if self.la_day(c, rt - 1):
                out.append((('day', c, rt - 1), cov))
            elif not self.m.collide(x, y - T / 2):
                # hết dây phía trên: bật lên vy = -0.6*jumpVel
                yy = y
                while fiz.tren_day(self.m, {'x': x, 'y': yy}) and not self.m.collide(x, yy - 1):
                    yy -= 1
                if rt == 0 or yy < 0:
                    cu = self.cua_ra(x, -H)
                    if cu:
                        out.append((('cua', cu['id']), cov))
                for hd in (-1, 0, 1):
                    for dj in (None, 10, 20):
                        x1, y1, tt, vet = self.bay(x, yy, 0.0, -JUMP_VEL * 0.6, lambda f, hd=hd: hd, 99, dj, bam_sau=10)
                        n = self.ket_qua(x1, y1, tt)
                        if n:
                            out.append((n, self.phu(vet)))
            # leo xuống
            if self.la_day(c, rt + 1):
                out.append((('day', c, rt + 1), cov))
            else:
                if (rt + 2) >= self.R:
                    cu = self.cua_ra(x, self.R * T + 10)
                    if cu:
                        out.append((('cua', cu['id']), cov))
                yy = y + T
                if self.m.collide(x, yy):
                    # chạm đất
                    for r in (rt + 1, rt + 2, rt):
                        if self.la_dung(c, r):
                            out.append((('dat', c, r), cov)); break
                else:
                    x1, y1, tt, vet = self.bay(x, y + 4, 0.0, 2.6, lambda f: 0, 0, None, djco=True, bam_sau=10)
                    n = self.ket_qua(x1, y1, tt)
                    if n:
                        out.append((n, self.phu(vet)))
            # nhảy rời dây
            for d in (-1, 1, 0):
                for hf_kieu in ('giu', 'dung', 'nguoc'):
                    if hf_kieu == 'giu':
                        hf = (lambda d: lambda f: d)(d)
                    elif hf_kieu == 'dung':
                        hf = (lambda d: lambda f: d if f <= 10 else 0)(d)
                    else:
                        if d == 0:
                            continue
                        hf = (lambda d: lambda f: d if f <= 14 else -d)(d)
                    for dj in (None, 10, 18, 26, 36):
                        x1, y1, tt, vet = self.bay(x, y, d * 4.2, -JUMP_VEL * 0.85, hf, 99, dj, bam_sau=14)
                        n = self.ket_qua(x1, y1, tt)
                        if n and n != nut:
                            out.append((n, self.phu(vet)))
        # gộp
        gop = {}
        for n, s in out:
            gop.setdefault(n, set()).update(s)
        res = list(gop.items())
        self.cache[nut] = res
        return res

    def vao_cua(self, cua_id):
        """nhân vật xuất hiện ở cửa cua_id của phòng này → list nút"""
        c = next(x for x in self.d['cua'] if x['id'] == cua_id)
        n = c['cao']
        if c['huong'] in ('trai', 'phai'):
            r = c['hang'] + n - 1
            return [(('dat', c['cot'], r), set())]
        cols = list(range(c['cot'], c['cot'] + n))
        if c['huong'] == 'duoi':
            out = []
            for cc in cols:
                if self.la_day(cc, self.R - 2):
                    out.append((('day', cc, self.R - 2), set()))
            if out:
                return out
            x = (c['cot'] + n / 2) * T - W / 2
            x1, y1, tt, vet = self.bay(x, (self.R - 2) * T, 0.0, -JUMP_VEL * 0.6, lambda f: 0, 99, None)
            nn = self.ket_qua(x1, y1, tt)
            return [(nn, self.phu(vet))] if nn else []
        # tren: rơi xuống
        out = []
        x = (c['cot'] + n / 2) * T - W / 2
        for hd in (-1, 0, 1):
            x1, y1, tt, vet = self.bay(x, 0.0, 0.0, 2.0, lambda f, hd=hd: hd, 0, None, djco=False)
            nn = self.ket_qua(x1, y1, tt)
            if nn:
                out.append((nn, self.phu(vet)))
        return out


_MO = {}


def mo_phong(bd, ph, nut_vo=False, mo_khoa=False, bat_dau=None):
    if nut_vo not in _MO:
        _MO[nut_vo] = {pid: Mo(d, nut_vo) for pid, d in ph.items()}
    mo = _MO[nut_vo]
    khoa = {}
    for pid, d in ph.items():
        if d.get('khoa'):
            khoa[(pid, d['khoa']['cua'])] = d['khoa']
    if bat_dau is None:
        b = bd['bat_dau']
        bat_dau = [(b['phong'], ('dat', b['cot'], b['hang']))]
    seen = set(bat_dau)
    ke = defaultdict(set)
    phu = defaultdict(set)
    dq = deque(bat_dau)
    loi_mep = []
    while dq:
        pid, nut = dq.popleft()
        for n2, cov in mo[pid].canh_ke(nut):
            phu[pid].update(cov)
            if n2[0] == 'loi_mep':
                loi_mep.append((pid, nut, n2)); continue
            if n2[0] == 'cua':
                cid = n2[1]
                if (pid, cid) in khoa and not mo_khoa:
                    continue
                cu = next(x for x in ph[pid]['cua'] if x['id'] == cid)
                for n3, cov3 in mo[cu['toi']].vao_cua(cu['toi_cua']):
                    phu[cu['toi']].update(cov3)
                    st = (cu['toi'], n3)
                    ke[(pid, nut)].add(st)
                    if st not in seen:
                        seen.add(st); dq.append(st)
                continue
            st = (pid, n2)
            ke[(pid, nut)].add(st)
            if st not in seen:
                seen.add(st); dq.append(st)
    return seen, ke, phu, loi_mep


def nhat_duoc(ph, phu):
    got = {}
    for pid, d in ph.items():
        for v in d['vat_pham']:
            got[v['id']] = (v['cot'], v['hang']) in phu[pid]
    return got


def ve(ph, phu_chinh, phu_bimat, seen):
    from PIL import Image, ImageDraw
    os.makedirs(XEM, exist_ok=True)
    S = 12
    MAU = {'#': (52, 38, 30), '.': (14, 13, 18), 'H': (60, 150, 60), 'N': (200, 120, 40), 'G': (140, 70, 160), '=': (170, 140, 90)}
    for pid, d in ph.items():
        g = d['luoi']; R, C = len(g), len(g[0])
        im = Image.new('RGB', (C * S, R * S + 16), (0, 0, 0))
        dr = ImageDraw.Draw(im)
        dung = {(n[1], n[2]) for (p, n) in seen if p == pid and n[0] == 'dat'}
        for r in range(R):
            for c in range(C):
                ch = g[r][c]
                col = MAU.get(ch, (14, 13, 18))
                if ch in '.H' and (c, r) in phu_chinh.get(pid, ()):
                    col = (36, 46, 70) if ch == '.' else (90, 190, 90)
                elif ch in '.H' and (c, r) in phu_bimat.get(pid, ()):
                    col = (60, 36, 70) if ch == '.' else col
                if ch == '=':
                    dr.rectangle([c * S, r * S, c * S + S - 1, r * S + S // 3], fill=col)
                else:
                    dr.rectangle([c * S, r * S, c * S + S - 1, r * S + S - 1], fill=col)
                if (c, r) in dung:
                    dr.rectangle([c * S + 4, r * S + S - 3, c * S + S - 5, r * S + S - 1], fill=(80, 110, 170))
        for c in range(0, C, 10):
            dr.line([c * S, R * S, c * S, R * S + 4], fill=(120, 120, 120))
            dr.text((c * S + 1, R * S + 3), str(c), fill=(150, 150, 150))
        for r in range(0, R, 5):
            dr.text((1, r * S), str(r), fill=(110, 110, 110))
        for cu in d['cua']:
            n = cu['cao']
            if cu['huong'] in ('trai', 'phai'):
                box = [cu['cot'] * S, cu['hang'] * S, cu['cot'] * S + S - 1, (cu['hang'] + n) * S - 1]
            else:
                box = [cu['cot'] * S, cu['hang'] * S, (cu['cot'] + n) * S - 1, cu['hang'] * S + S - 1]
            mau = (255, 60, 60) if d.get('khoa', {}).get('cua') == cu['id'] else (0, 220, 230)
            dr.rectangle(box, outline=mau, width=2)
            dr.text((box[0] + 2, box[1] + 2), cu['toi'], fill=mau)
        for q in d['quai']:
            c, r = q['cot'], q['hang']
            if 'tu' in q:
                dr.line([q['tu'] * S, r * S + S - 2, q['den'] * S + S, r * S + S - 2], fill=(150, 40, 40))
            dr.ellipse([c * S, (r - 1) * S + 4, c * S + S - 1, r * S + S - 1], fill=(230, 50, 50) if q['loai'] != 'tan' else (255, 0, 160))
            dr.text((c * S - 2, (r - 2) * S + 2), q['loai'], fill=(255, 120, 120))
        for v in d['vat_pham']:
            c, r = v['cot'], v['hang']
            mau = {'chuong_vo': (255, 210, 0), 'tang_mau': (255, 80, 200), 'the_ten': (200, 200, 255), 'hat_vong': (120, 255, 255)}.get(v['loai'], (240, 240, 120))
            rr = 5 if v['loai'] != 'manh_am' else 3
            dr.ellipse([c * S + S // 2 - rr, r * S + S // 2 - rr, c * S + S // 2 + rr, r * S + S // 2 + rr], fill=mau)
        if d.get('chuong_luu'):
            c, r = d['chuong_luu']['cot'], d['chuong_luu']['hang']
            dr.rectangle([c * S, (r - 1) * S, c * S + S - 1, r * S + S - 1], outline=(80, 160, 255), width=2)
        if d.get('bat_dau'):
            c, r = d['bat_dau']['cot'], d['bat_dau']['hang']
            dr.polygon([(c * S, r * S + S), (c * S + S, r * S + S), (c * S + S // 2, (r - 1) * S)], fill=(255, 255, 255))
        for l in d.get('den', []):
            c, r = l['cot'], l['hang']
            dr.ellipse([c * S + 3, r * S + 3, c * S + S - 4, r * S + S - 4], outline=(255, 170, 60))
        for t in d.get('trang_tri', []):
            if t['loai'] in ('tuong_nut', 'hai_cot', 'xac_nguoi_ngoi', 'cong_re'):
                dr.text((t['cot'] * S, t['hang'] * S - 10), '*', fill=(255, 160, 80))
        dr.text((C * S - 160, R * S + 3), f"{pid} {d['ten']}", fill=(255, 255, 255))
        im.save(os.path.join(XEM, pid + '.png'))
    # bản đồ tổng
    bd = json.load(open(os.path.join(GOC, 'ban-do.json'), encoding='utf-8'))
    S2 = 4
    mx = max(p['x_o'] + p['w'] for p in bd['phong']); my = max(p['y_o'] + p['h'] for p in bd['phong'])
    im = Image.new('RGB', (mx * S2 + 8, my * S2 + 8), (0, 0, 0)); dr = ImageDraw.Draw(im)
    for p in bd['phong']:
        p = dict(p, x=p['x_o'], y=p['y_o'])
        g = ph[p['id']]['luoi']
        for r, row in enumerate(g):
            for c, ch in enumerate(row):
                if ch != '#':
                    dr.rectangle([4 + (p['x'] + c) * S2, 4 + (p['y'] + r) * S2, 4 + (p['x'] + c) * S2 + S2 - 1, 4 + (p['y'] + r) * S2 + S2 - 1],
                                 fill=(70, 90, 130) if ch == '.' else (60, 150, 60))
        dr.rectangle([4 + p['x'] * S2, 4 + p['y'] * S2, 4 + (p['x'] + p['w']) * S2 - 1, 4 + (p['y'] + p['h']) * S2 - 1], outline=(200, 200, 200))
        dr.text((6 + p['x'] * S2, 6 + p['y'] * S2), p['id'], fill=(255, 255, 0))
    im.save(os.path.join(XEM, 'ban-do.png'))


def main():
    bd, ph = nap()
    kiem_tinh(bd, ph)
    # Lượt 1: tuyến chính, khoá còn đóng
    seen1, ke1, phu1, lm1 = mo_phong(bd, ph)
    got1 = nhat_duoc(ph, phu1)
    chuong = [v['id'] for d in ph.values() for v in d['vat_pham'] if v['loai'] == 'chuong_vo']
    thieu = [c for c in chuong if not got1[c]]
    if thieu:
        loi('Không nhặt được Chuông Vỡ khi chưa mở khoá: ' + ', '.join(thieu))
    if any(p == 'P12' for p, n in seen1):
        loi('P12 vào được khi chưa đủ 3 Chuông Vỡ (khoá không có tác dụng)')
    # Lượt 2: mở khoá (đã đủ chuông)
    seen2, ke2, phu2, lm2 = mo_phong(bd, ph, mo_khoa=True)
    for pid, nut, n2 in lm1 + lm2:
        loi(f'{pid}: hộp đi ra khỏi mép không có cửa tại {n2[1:]} (từ {nut})')
    toi = {p for p, n in seen2}
    for pid in ph:
        if pid not in toi:
            loi(f'Không tới được phòng {pid}')
    # không kẹt: từ mọi nút tới được phải quay về được P12
    nguoc = defaultdict(set)
    for a, bs in ke2.items():
        for b in bs:
            nguoc[b].add(a)
    dich = {s for s in seen2 if s[0] == 'P12'}
    ve_duoc = set(dich); dq = deque(dich)
    while dq:
        s = dq.popleft()
        for a in nguoc[s]:
            if a not in ve_duoc:
                ve_duoc.add(a); dq.append(a)
    ket = [s for s in seen2 if s not in ve_duoc]
    if ket:
        by = defaultdict(list)
        for p, n in ket:
            by[p].append(n[1:])
        for p, ns in by.items():
            loi(f'{p}: {len(ns)} chỗ bị KẸT (không quay ra được), vd {sorted(ns)[:5]}')
    # Lượt 3: tường nứt đã vỡ → bí mật
    seen3, ke3, phu3, lm3 = mo_phong(bd, ph, nut_vo=True, mo_khoa=True)
    # LUỒNG D: không hố một chiều – từ mọi chỗ tới được (kể cả P11/P12) phải về được P05 (Chuông Lưu đầu).
    # Tường nứt chém vỡ được từ cả hai phía nên tính đã vỡ (lối tắt P06→P02→P01…); vẫn KHÔNG dùng bật tường / lướt.
    nguoc3 = defaultdict(set)
    for a_, bs in ke3.items():
        for b_ in bs:
            nguoc3[b_].add(a_)
    dich5 = {s for s in seen3 if s[0] == 'P05'}
    ve5 = set(dich5); dq = deque(dich5)
    while dq:
        s = dq.popleft()
        for a_ in nguoc3[s]:
            if a_ not in ve5:
                ve5.add(a_); dq.append(a_)
    ket5 = [s for s in seen3 if s not in ve5]
    if ket5:
        by = defaultdict(list)
        for p, n in ket5:
            by[p].append(n[1:])
        for p, ns in by.items():
            loi(f'{p}: {len(ns)} chỗ không quay về được P05, vd {sorted(ns)[:5]}')
    else:
        print('  ✓ Mọi chỗ tới được (cả P11, P12) đều đi về được P05 (tính tường nứt đã chém vỡ).')
    got3 = nhat_duoc(ph, phu3)
    print('=== VẬT PHẨM ===')
    for pid, d in ph.items():
        for v in d['vat_pham']:
            tt = 'tuyến thường' if got1[v['id']] or nhat_duoc(ph, phu2)[v['id']] else ('cần chém tường nứt' if got3[v['id']] else 'KHÔNG TỚI ĐƯỢC (hộp)')
            print(f"  {v['id']:18s} {v['loai']:10s} {tt}")
            if tt.startswith('KHÔNG'):
                canh(f"{v['id']}: hộp mô phỏng không tới được (có thể cần bật tường/lướt)")
    # lối tắt P06 → P02 sau khi vỡ tường
    s06 = [('P06', ('dat', 25, 32))]
    seen4, _, _, _ = mo_phong(bd, ph, nut_vo=True, mo_khoa=True, bat_dau=s06)
    if not any(p == 'P02' and n[0] == 'dat' and n[2] <= 24 for p, n in seen4):
        canh('Lối tắt P06 → P02 (sau tường nứt) không đi được bằng hộp')
    # khe chui tối thiểu 3 ô: mọi chỗ đứng tới được phải có ≥3 ô trống phía trên mặt sàn
    thap = defaultdict(list)
    for p, n in seen2:
        if n[0] == 'dat':
            g = ph[p]['luoi']; c, r = n[1], n[2]
            if r - 2 < 0 or g[r - 2][c] in '#N':
                thap[p].append((c, r))
    for p, ns in thap.items():
        canh(f'{p}: {len(ns)} chỗ đứng chỉ cao 2 ô (< 3): {sorted(ns)[:8]}')
    print('Số nút đã thăm:', len(seen2))
    if '--khong-ve' not in sys.argv:
        ve(ph, phu2, phu3, seen2)
        print('Ảnh xem trước:', XEM)
    print('=== CẢNH BÁO (%d) ===' % len(CANH))
    for s in CANH:
        print('  ! ' + s)
    print('=== LỖI (%d) ===' % len(LOI))
    for s in LOI:
        print('  ✗ ' + s)
    if not LOI:
        print('  ✓ Không có lỗi: P01 → P12 đi được, đủ 3 Chuông Vỡ, cửa khớp, không kẹt.')
    return 1 if LOI else 0


if __name__ == '__main__':
    sys.exit(main())
