# -*- coding: utf-8 -*-
"""kiem-tra.py – kiểm tra 16 phòng Vùng 2 + mô phỏng đường đi bằng hộp (dùng lại máy mô phỏng của Vùng 1:
game/vung-1/cong-cu-man/kiem-tra.py + fiz.py – chỉ NẠP, không sửa).
Chạy:  python3 kiem-tra.py            (kiểm tra + ảnh xem trước vào cong-cu-man/xem/, không đưa vào repo)
       python3 kiem-tra.py --khong-ve
Luật (A.md + kế hoạch ChatGPT mục 8):
  1. Lưới, mép kín, cửa khớp 2 chiều, quái/vật phẩm đứng trên nền CHẮC (không đứng trên gỗ mục / gai / ao).
  2. Mô phỏng hộp 28×96 (đi, nhảy, nhảy đôi, dây leo; KHÔNG bám/bật tường, KHÔNG lướt):
     - Gỗ mục R/Q/P coi là đứng được (đủ giờ đi qua) – có kiểm riêng độ dài cụm.
     - Gai X / ao B: không đứng được (chạm → về gờ chắc) → không thành chỗ đứng.
     - Chốt rễ L: ĐẶC khi chưa có Neo Rễ, đi qua được khi có (Neo Rễ giữ mở 3 s).
     - Cổng rễ đan C: ĐẶC cho tới khi mở (mở 1 lần từ phía `mo_tu`).
     Lượt A (chưa Neo Rễ): R201 → tới được Đền Neo Rễ R206; KHÔNG được tới R208 (Neo Rễ phải bắt buộc).
     Lượt B (có Neo Rễ, cổng đóng): tới được R213; phía mở của mọi cổng lối tắt tới được.
     Lượt C (có Neo Rễ, cổng mở, tường nứt vỡ): tới đủ 16 phòng; mọi chỗ tới được quay về được R204 (S1) và tới được R213 – không kẹt.
  3. Khe chui ≥ 3 ô ở mọi chỗ đứng; cụm gỗ mục thường ≤ 4 ô, nhanh ≤ 3 ô (đi qua kịp trước khi sập); nút neo ôm ≤ 4 ô, cách chỗ đứng/dây ≤ 3 ô.
"""
import importlib.util, json, math, os, sys
from collections import defaultdict, deque

DAY = os.path.dirname(os.path.abspath(__file__))
V1 = os.path.join(DAY, '../../vung-1/cong-cu-man')
sys.path.insert(0, V1)
import fiz  # noqa: E402
_spec = importlib.util.spec_from_file_location('kiem_tra_v1', os.path.join(V1, 'kiem-tra.py'))
KT = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(KT)
KT.GOC = os.path.join(DAY, '..')
XEM = os.path.join(DAY, 'xem')
T, W, H = fiz.T, fiz.W, fiz.H

MUC = set('RQP')          # gỗ mục
NGUY = set('XB')          # gai rễ / ao bào tử
CO = {'neo': False, 'cong': False, 'muc': True}


class Map2(fiz.Map):
    def dac(self, ch):
        if ch == '#' or ch in NGUY:
            return True
        if ch in MUC:
            return CO['muc']          # lượt 'mục đã sập': coi gỗ mục là trống
        if ch == 'N':
            return not self.nut_vo
        if ch == 'L':
            return not CO['neo']
        if ch == 'C':
            return not CO['cong']
        return False


fiz.Map = Map2
KT.fiz.Map = Map2
_la_dung = KT.Mo.la_dung


def la_dung2(self, c, r):
    if not _la_dung(self, c, r):
        return False
    return not (0 <= r + 1 < self.R and self.d['luoi'][r + 1][c] in NGUY)


KT.Mo.la_dung = la_dung2


_CACHE = {}


def chay(bat_dau, neo, cong, nut_vo, muc=True):
    CO['neo'], CO['cong'], CO['muc'] = neo, cong, muc
    KT._MO = _CACHE.setdefault((neo, cong, nut_vo, muc), {})
    bd, ph = KT.nap()
    return KT.mo_phong(bd, ph, nut_vo=nut_vo, mo_khoa=True, bat_dau=bat_dau)


def ve_duoc(seen, ke, dich):
    nguoc = defaultdict(set)
    for a, bs in ke.items():
        for b in bs:
            nguoc[b].add(a)
    ok = set(dich); dq = deque(dich)
    while dq:
        s = dq.popleft()
        for a in nguoc[s]:
            if a not in ok:
                ok.add(a); dq.append(a)
    return [s for s in seen if s not in ok]


def bao_ket(ten, ket):
    by = defaultdict(list)
    for p, n in ket:
        by[p].append(n[1:])
    for p, ns in by.items():
        KT.loi(f'{p}: {len(ns)} chỗ không {ten}, vd {sorted(ns)[:5]}')


def kiem_them(ph):
    for pid, d in ph.items():
        g = d['luoi']; R, C = len(g), len(g[0])
        # cụm gỗ mục theo hàng
        for r in range(R):
            c = 0
            while c < C:
                if g[r][c] in MUC:
                    c0 = c
                    while c < C and g[r][c] in MUC:
                        c += 1
                    n = c - c0
                    loai = g[r][c0]
                    gioi = 3 if loai == 'Q' else 4
                    if n > gioi:
                        KT.loi(f'{pid}: cụm gỗ mục {loai} dài {n} ô ở hàng {r} (tối đa {gioi})')
                else:
                    c += 1
        for nn in d.get('neo', []):
            if len(nn['cum']) > 4:
                KT.loi(f"{pid}/{nn['id']}: nút neo ôm {len(nn['cum'])} ô (>4)")
            for c, r in nn['cum']:
                if g[r][c] not in 'RQPL':
                    KT.loi(f"{pid}/{nn['id']}: ô ({c},{r}) không phải gỗ mục/chốt rễ")
        for cg in d.get('cong', []):
            for c, r in cg['o']:
                if g[r][c] != 'C':
                    KT.loi(f"{pid}/{cg['id']}: ô ({c},{r}) không phải 'C'")
        # quái/vật phẩm không đứng trên gỗ mục / nguy hiểm
        for x in d['quai'] + d['vat_pham']:
            r = x['hang'] + 1
            if 0 <= r < R and g[r][x['cot']] in MUC | NGUY:
                KT.loi(f"{pid}: {x.get('loai')} ({x['cot']},{x['hang']}) đứng trên ô '{g[r][x['cot']]}' – phải đứng nền chắc")


def ve(ph, seen, phu):
    from PIL import Image, ImageDraw
    os.makedirs(XEM, exist_ok=True)
    S = 12
    MAU = {'#': (52, 38, 30), '.': (14, 13, 18), 'H': (60, 150, 60), 'N': (200, 120, 40), 'G': (140, 70, 160), '=': (170, 140, 90),
           'R': (150, 110, 50), 'Q': (220, 170, 60), 'P': (160, 160, 70), 'X': (200, 40, 40), 'B': (110, 140, 40), 'L': (190, 120, 200), 'C': (230, 90, 160)}
    for pid, d in ph.items():
        g = d['luoi']; R, C = len(g), len(g[0])
        im = Image.new('RGB', (C * S, R * S + 16)); dr = ImageDraw.Draw(im)
        dung = {(n[1], n[2]) for (p, n) in seen if p == pid and n[0] == 'dat'}
        for r in range(R):
            for c in range(C):
                ch = g[r][c]; col = MAU.get(ch, (14, 13, 18))
                if ch in '.H' and (c, r) in phu.get(pid, ()):
                    col = (36, 46, 70) if ch == '.' else (90, 190, 90)
                dr.rectangle([c * S, r * S, c * S + S - 1, r * S + (S // 3 if ch == '=' else S - 1)], fill=col)
                if (c, r) in dung:
                    dr.rectangle([c * S + 4, r * S + S - 3, c * S + S - 5, r * S + S - 1], fill=(80, 110, 170))
        for cu in d['cua']:
            n = cu['cao']
            box = ([cu['cot'] * S, cu['hang'] * S, cu['cot'] * S + S - 1, (cu['hang'] + n) * S - 1] if cu['huong'] in ('trai', 'phai')
                   else [cu['cot'] * S, cu['hang'] * S, (cu['cot'] + n) * S - 1, cu['hang'] * S + S - 1])
            dr.rectangle(box, outline=(0, 220, 230), width=2); dr.text((box[0] + 2, box[1] + 2), cu['toi'], fill=(0, 220, 230))
        for q in d['quai']:
            c, r = q['cot'], q['hang']
            dr.ellipse([c * S, (r - 1) * S + 4, c * S + S - 1, r * S + S - 1], fill=(230, 50, 50)); dr.text((c * S - 2, (r - 2) * S), q['loai'], fill=(255, 120, 120))
        for v in d['vat_pham']:
            c, r = v['cot'], v['hang']; dr.ellipse([c * S + 2, r * S + 2, c * S + S - 3, r * S + S - 3], fill=(255, 220, 80))
        for nn in d.get('neo', []):
            c, r = nn['cot'], nn['hang']; dr.ellipse([c * S + 1, r * S + 1, c * S + S - 2, r * S + S - 2], outline=(255, 160, 40), width=2)
        if d.get('chuong_luu'):
            c, r = d['chuong_luu']['cot'], d['chuong_luu']['hang']; dr.rectangle([c * S, (r - 1) * S, c * S + S - 1, r * S + S - 1], outline=(80, 160, 255), width=2)
        if d.get('ky_nang'):
            c, r = d['ky_nang']['cot'], d['ky_nang']['hang']; dr.rectangle([c * S, (r - 1) * S, c * S + S - 1, r * S + S - 1], outline=(0, 255, 200), width=2)
        dr.text((4, R * S + 3), f"{pid} {d['ten']}", fill=(255, 255, 255))
        im.save(os.path.join(XEM, pid + '.png'))


LIEN = []
_nap0 = KT.nap


def _nap_bo_lien():
    """cửa liên vùng (toi = None, có 'lien_vung'): tách khỏi phòng – không khớp 2 chiều trong Vùng 2; đi ra mép ở đó là hợp lệ"""
    bd, ph = _nap0()
    LIEN.clear()
    for pid, d in ph.items():
        for c in [c for c in d['cua'] if c.get('lien_vung')]:
            d['cua'].remove(c); LIEN.append((pid, c))
    return bd, ph


KT.nap = _nap_bo_lien


def la_lien(pid, n2):
    """chỗ đi ra mép nằm ở cửa liên vùng?"""
    for p, c in LIEN:
        if p != pid:
            continue
        o = [(c['cot'], c['hang'] + i) for i in range(c.get('cao', 3))] if c['huong'] in ('trai', 'phai') else [(c['cot'] + i, c['hang']) for i in range(c.get('cao', 3))]
        if any(abs(n2[1] - x) <= 1 and abs(n2[2] - y) <= 3 for x, y in o):
            return True
    return False


def main():
    bd, ph = KT.nap()
    for pid, c in LIEN:
        print(f"  · cửa liên vùng {c['id']} → {c['lien_vung']['vung']}/{c['lien_vung']['phong']}")
    KT.kiem_tinh(bd, ph)
    KT.LOI[:] = [s for s in KT.LOI if not s.startswith('Số Chuông Vỡ')]
    mep_lien = {f"{p}: mép hở tại ({c['cot']},{c['hang'] + i}) không phải cửa" for p, c in LIEN for i in range(c.get('cao', 3))}
    KT.LOI[:] = [s for s in KT.LOI if s not in mep_lien]   # ô mép của cửa liên vùng
    kiem_them(ph)
    b = bd['bat_dau']
    goc = [(b['phong'], ('dat', b['cot'], b['hang']))]
    # Lượt A – chưa có Neo Rễ
    sA, kA, pA, mA = chay(goc, False, False, False)
    kn = ph['R206']['ky_nang']
    if (kn['cot'], kn['hang']) not in pA['R206']:
        KT.loi('Lượt A: không tới được Đền Neo Rễ R206')
    toiA = {p for p, n in sA}
    # R208: chỉ được vào túi chân giếng (cột 30–32, từ lối phụ R205) – túi bị chốt rễ chặn
    if any(p == 'R208' and not (30 <= n[1] <= 32) for p, n in sA):
        KT.loi('Lượt A: ra khỏi túi chân giếng R208 khi CHƯA có Neo Rễ')
    for p in ('R209', 'R210', 'R211', 'R212', 'R213'):
        if p in toiA:
            KT.loi(f'Lượt A: tới được {p} khi CHƯA có Neo Rễ (kỹ năng không bắt buộc)')
    # Lượt B – có Neo Rễ, cổng lối tắt còn đóng
    sB, kB, pB, mB = chay(goc, True, False, False)
    toiB = {p for p, n in sB}
    for p in ('R207', 'R208', 'R209', 'R210', 'R211', 'R212', 'R213'):
        if p not in toiB:
            KT.loi(f'Lượt B: không tới được {p}')
    for pid, d in ph.items():
        for cg in d.get('cong', []):
            if cg['mo_tu'] == 'trum':
                continue
            dx, dy = {'phai': (1, 0), 'trai': (-1, 0), 'duoi': (0, 1), 'tren': (0, -1)}[cg['mo_tu']]
            ke = {(c + dx * k, r + dy * k) for c, r in cg['o'] for k in (1, 2, 3)}
            if not (ke & pB[pid]):
                KT.loi(f"{pid}/{cg['id']}: phía mở ({cg['mo_tu']}) không tới được khi cổng còn đóng")
            else:
                print(f"  ✓ {cg['id']}: tới được phía mở ({cg['mo_tu']})")
    kB_ = ve_duoc(sB, kB, {s for s in sB if s[0] == 'R213'})
    bao_ket('tới được R213 (lượt B – kẹt)', kB_)
    # Lượt C – mọi thứ mở
    sC, kC, pC, mC = chay(goc, True, True, True)
    for pid, nut, n2 in mA + mB + mC:
        if la_lien(pid, n2):
            continue
        KT.loi(f'{pid}: hộp đi ra khỏi mép không có cửa tại {n2[1:]} (từ {nut})')
    toiC = {p for p, n in sC}
    for p in ph:
        if p not in toiC:
            KT.loi(f'Lượt C: không tới được {p}')
    # Lượt D – gỗ mục có thể đã sập rồi mọc lại: hợp đồ thị 'mục chắc' + 'mục sập' tới khi không thêm chỗ mới;
    # mọi chỗ (kể cả rơi xuống hố dưới cầu mục) phải quay về được R204 – không bị gỗ mục mọc lại nhốt.
    tap = set(sC); keU = defaultdict(set)
    for a_, bs in kC.items():
        keU[a_] |= bs
    moi = set(sC)
    for vong in range(6):
        sD, kD, _, mD = chay(list(moi), True, True, True, muc=False)
        sE, kE, _, mE = chay(list(moi | sD), True, True, True, muc=True)
        for kk in (kD, kE):
            for a_, bs in kk.items():
                keU[a_] |= bs
        them = (sD | sE) - tap
        tap |= them
        if not them:
            break
        moi = them
    print('  Lượt D (mục sập/mọc):', len(tap), 'chỗ,', len(tap - set(sC)), 'chỗ chỉ tới được khi mục đã sập')
    bao_ket('quay về được R204 sau khi rơi qua gỗ mục (bị nhốt)', ve_duoc(tap, keU, {s for s in tap if s[0] == 'R204'}))
    for pid, c in LIEN:
        o = [(c['cot'] + (1 if c['huong'] == 'trai' else -1), c['hang'] + c.get('cao', 3) - 1)]
        cham = [s for s in sC if s[0] == pid and s[1][0] == 'dat' and abs(s[1][1] - o[0][0]) <= 2 and s[1][2] == o[0][1]]
        if not cham:
            KT.loi(f"{pid}/{c['id']}: không tới được cửa liên vùng")
        else:
            print(f"  ✓ {c['id']}: tới được cửa liên vùng ({len(cham)} chỗ đứng sát cửa)")
            bao_ket(f"đi từ cửa liên vùng {c['id']} về được R204", ve_duoc(set(cham), kC, {s for s in sC if s[0] == 'R204'}))
    bao_ket('quay về được R204 (S1)', ve_duoc(sC, kC, {s for s in sC if s[0] == 'R204'}))
    bao_ket('tới được R213', ve_duoc(sC, kC, {s for s in sC if s[0] == 'R213'}))
    print('=== VẬT PHẨM ===')
    for pid, d in ph.items():
        for v in d['vat_pham']:
            o = (v['cot'], v['hang'])
            tt = 'trước Neo Rễ' if o in pA[pid] else ('sau Neo Rễ' if o in pB[pid] else ('cần lối tắt/tường nứt' if o in pC[pid] else 'KHÔNG TỚI ĐƯỢC (hộp)'))
            print(f"  {v['id']:22s} {v['loai']:12s} {tt}")
            if tt.startswith('KHÔNG'):
                KT.canh(f"{v['id']}: hộp mô phỏng không tới được (thử thách bật tường tuỳ chọn – kiểm bằng tay)")
    for nn in [(pid, n) for pid, d in ph.items() for n in d.get('neo', [])]:
        pid, n = nn
        gan = [s for s in sC if s[0] == pid and s[1][0] in ('dat', 'day') and math.hypot(s[1][1] - n['cot'], s[1][2] - n['hang']) <= 3]
        if not gan:
            KT.loi(f"{pid}/{n['id']}: không có chỗ đứng/dây nào trong 3 ô để đặt neo")
    thap = defaultdict(list)
    for p, n in sC:
        if n[0] == 'dat':
            g = ph[p]['luoi']; c, r = n[1], n[2]
            if r - 2 < 0 or g[r - 2][c] in '#RQP':     # lượt C: tường nứt đã vỡ, chốt rễ đang mở
                thap[p].append((c, r))
    for p, ns in thap.items():
        KT.loi(f'{p}: {len(ns)} chỗ đứng chỉ cao 2 ô (< 3): {sorted(ns)[:8]}')
    print('Số nút: A', len(sA), 'B', len(sB), 'C', len(sC))
    if '--khong-ve' not in sys.argv:
        ve(ph, sC, pC)
        print('Ảnh xem trước:', XEM)
    print('=== CẢNH BÁO (%d) ===' % len(KT.CANH))
    for s in KT.CANH:
        print('  ! ' + s)
    print('=== LỖI (%d) ===' % len(KT.LOI))
    for s in KT.LOI:
        print('  ✗ ' + s)
    if not KT.LOI:
        print('  ✓ Vùng 2: R201 → Đền Neo Rễ → R213 đi được, Neo Rễ bắt buộc, cửa khớp, 3 phòng bí mật, không kẹt.')
    return 1 if KT.LOI else 0


if __name__ == '__main__':
    sys.exit(main())
