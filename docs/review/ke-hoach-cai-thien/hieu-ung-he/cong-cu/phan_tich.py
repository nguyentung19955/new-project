"""Tổng hợp số đo do.py thành bảng (Markdown) + JSON gọn.
Chạy: python3 phan_tich.py <do-a.json> <ra.md> <ra-gon.json>"""
import sys, json, collections
SRC, RA_MD, RA_JS = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(SRC))
TEN_HE = {'fire': 'Lửa', 'poison': 'Độc', 'ice': 'Băng', '-': '—'}
TEN_BAC = {0: 'Trắng', 1: 'Mầm', 2: 'Thành hình', 3: 'Thức tỉnh'}
TEN_DON = {
    'kiem-3nhat': 'Kiếm nặng 3 nhát', 'kiem-luot': 'Kiếm: né rồi lướt chém', 'kiem-tram-nguyet': 'Kiếm: Trảm Nguyệt (Đặc biệt)',
    'thuong-dam-quet': 'Thương: 3 đâm + quét vòng', 'thuong-xoc-toi': 'Thương: giữ → xốc tới', 'thuong-phi-thuong': 'Thương: Phi Thương (Đặc biệt)',
    'bua-nen': 'Búa: nện thường', 'bua-nen-dat-1': 'Búa: nện đất nấc 1', 'bua-nen-dat-2': 'Búa: nện đất nấc 2', 'bua-dia-chan': 'Búa: Địa Chấn (Đặc biệt)',
    'phitieu-3': 'Phi tiêu: 3 phát', 'phitieu-chum': 'Phi tiêu: giữ → ném chùm', 'phitieu-mua': 'Phi tiêu: mưa (Đặc biệt)', 'chuong': 'Chưởng (cây theo hệ)'}
CUA = {'kiem-3nhat': [[0, 20], [20, 40], [40, 90]], 'thuong-dam-quet': [[0, 22], [22, 44], [44, 66], [66, 115]], 'phitieu-3': [[0, 20], [20, 40], [40, 80]]}
HE_TEN = {'he:drawFlames': 'giot-he-fire(lưỡi lửa theo vệt)', 'he:drawDrips': 'giot-he-poison(giọt độc theo vệt)', 'he:drawIce': 'giot-he-ice(răng băng theo vệt)', 'he:drawSpikes': 'gai-bang(hàng gai)'}
BAN = lambda t: HE_TEN.get(t, t)
gon = {}
hang = []
for k, v in d.items():
    if k.startswith('dac:'): continue
    ma, el, st = k.split('|'); st = int(st)
    ba, mot, tr, kh = v['ba'], v['mot'], v['truot'], v.get('khong', v['truot'])
    # hiệu ứng theo tên: số lần, đời (ms), cỡ
    anh = collections.OrderedDict()
    for h in ba['hinh']:
        t = BAN(h['ten'])
        a = anh.setdefault(t, {'n': 0, 'ms': set(), 'co': set(), 'mau': set()})
        a['n'] += 1; a['ms'].add(h['ms'])
        if h['rong']: a['co'].add('%dx%d' % (h['rong'], h['cao']))
        if h['mau']: a['mau'].add(h['mau'])
    anhT = collections.OrderedDict()
    for h in tr['hinh']:
        t = BAN(h['ten']); a = anhT.setdefault(t, {'n': 0, 'ms': set()}); a['n'] += 1; a['ms'].add(h['ms'])
    # mặt nạ hình (trượt) theo cửa sổ; vùng trúng (lưới)
    vt = v['vung']; r, hq = vt['r'], vt['h']
    cua = CUA.get(ma) or [[0, 10 ** 6]]
    mats = kh['mat'] or []
    ss = []
    for ci, c in enumerate(cua):
        m = mats[ci] if ci < len(mats) else None
        px = set()
        if m and m.get('ds'):
            ds = m['ds']
            for i in range(0, len(ds), 3): px.add((ds[i], ds[i + 1]))
        thay = trung = thayKhong = trungKhong = 0; maxHit = maxThay = -999; minHit = minThay = 999
        for (pt, rs) in zip(vt['pts'], vt['res']):
            dx, dy = pt
            hit = any(c[0] <= q < c[1] for q in rs['ks'])
            any_ = hit or any(c[0] <= q < c[1] + 60 for q in rs['src'].values())
            ov = 0
            if px:
                for x in range(dx - r, dx + r + 1):
                    for y in range(dy - hq, dy + 1):
                        if (x, y) in px: ov += 1
            look = ov >= 8
            if hit: trung += 1; maxHit = max(maxHit, dx); minHit = min(minHit, dx)
            if look: thay += 1; maxThay = max(maxThay, dx); minThay = min(minThay, dx)
            if look and not any_: thayKhong += 1
            if hit and not look: trungKhong += 1
        ss.append({'nhat': ci + 1, 'vet_x0': m and m.get('x0'), 'vet_x1': m and m.get('x1'), 'vet_y0': m and m.get('y0'), 'vet_y1': m and m.get('y1'), 'vet_dt': m and m.get('o'),
                   'quai_trung': trung, 'quai_trung_xa': maxHit if trung else None, 'quai_trung_gan': minHit if trung else None,
                   'quai_thay_cham': thay, 'quai_thay_xa': maxThay if thay else None, 'thay_ma_khong_trung': thayKhong, 'trung_ma_khong_thay': trungKhong})
    so = mot['so']
    g = {'don': ma, 'he': el, 'bac': st, 'hinh_trung3': {t: {'n': a['n'], 'ms': sorted(a['ms']), 'co': sorted(a['co']), 'mau': sorted(a['mau'])} for t, a in anh.items()},
         'hinh_truot': {t: {'n': a['n'], 'ms': sorted(a['ms'])} for t, a in anhT.items()},
         'lop_cung_luc_max': {'trung3': max(ba['song'] or [0]), 'trung1': max(mot['song'] or [0]), 'truot': max(tr['song'] or [0])},
         'hat_max': {'trung3': max(ba['hat'] or [0]), 'trung1': max(mot['hat'] or [0]), 'truot': max(tr['hat'] or [0])},
         'diem_anh_hieu_ung_khong_quai': round(kh.get('matN') or 0), 'tam': ss,
         'so_sat_thuong_trung1': [{'k': q['k'], 's': q['s'], 'nhip': q['dot'], 'mau': q['mau'], 'co': q['co']} for q in so],
         'sat_theo_nguon_trung1': dict(collections.Counter(q['src'] for q in mot['sat'])),
         'trang_thai_cuoi_trung1': mot['quai'], 'phan_ung': [q['kind'] for q in ba['phanUng']],
         'lop_thay_duoc_trung3': {BAN(t): {'px': round(px), 'khung': ba.get('lopKhung', {}).get(t, 0)} for t, px in sorted((ba.get('lopPx') or {}).items(), key=lambda q: -q[1])}}
    gon[k] = g
json.dump(gon, open(RA_JS, 'w'), ensure_ascii=False, indent=1)
# ---------- bảng Markdown ----------
L = []
def fmt_anh(h):
    out = []
    for t, a in h.items():
        ms = a['ms']; s = t.replace('hu-', '') + ('×%d' % a['n'] if a['n'] > 1 else '') + ' ' + ('%d' % ms[0] if len(ms) == 1 else '%d–%d' % (ms[0], ms[-1])) + 'ms'
        if a.get('co'): s += ' ' + '/'.join(a['co'][:2])
        out.append(s)
    return '; '.join(out)
by = collections.defaultdict(list)
for k, g in gon.items(): by[g['don']].append(g)
for ma in TEN_DON:
    if ma not in by: continue
    L.append('\n### %s\n' % TEN_DON[ma])
    L.append('| Hệ | Bậc | Hình hiệu ứng khi trúng 3 quái (tên ảnh ×số lần, thời gian hiện, cỡ điểm game) | Lớp cùng lúc (trúng 3 / trượt) | Hạt tối đa (trúng 3) | Điểm ảnh hiệu ứng cộng mọi khung (không quái) |')
    L.append('|---|---|---|---|---|---|')
    for g in sorted(by[ma], key=lambda g: (g['he'] != '-', ['fire', 'poison', 'ice', '-'].index(g['he']), g['bac'])):
        L.append('| %s | %s | %s | %d / %d | %d | %d |' % (TEN_HE[g['he']], TEN_BAC[g['bac']] if ma != 'chuong' else ('đủ cây' if g['bac'] == 3 else 'chưa học'), fmt_anh(g['hinh_trung3']), g['lop_cung_luc_max']['trung3'], g['lop_cung_luc_max']['truot'], g['hat_max']['trung3'], g['diem_anh_hieu_ung_khong_quai']))
open(RA_MD, 'w').write('\n'.join(L) + '\n')
print('ok', len(gon))

# ---------- đổi theo bậc: Mầm → Thành hình → Thức tỉnh ----------
B = ['\n## Lên bậc thì hình đổi gì (trúng 3 quái)\n', '| Đòn | Hệ | Mầm → Thành hình | Thành hình → Thức tỉnh | Nhận xét |', '|---|---|---|---|---|']
NHAN = []
def doi(a, b):
    sa, sb = set(a['hinh_trung3']), set(b['hinh_trung3'])
    them = sorted(sb - sa); bot = sorted(sa - sb)
    dl = b['lop_cung_luc_max']['trung3'] - a['lop_cung_luc_max']['trung3']; dh = b['hat_max']['trung3'] - a['hat_max']['trung3']
    pa, pb = a['diem_anh_hieu_ung_khong_quai'], b['diem_anh_hieu_ung_khong_quai']
    dp = (pb - pa) / pa * 100 if pa else 0
    s = []
    if them: s.append('thêm ' + ', '.join(t.replace('hu-', '') for t in them))
    if bot: s.append('bớt ' + ', '.join(t.replace('hu-', '') for t in bot))
    s.append('lớp %+d, hạt %+d, điểm ảnh vệt %+.0f%%' % (dl, dh, dp))
    loai = 'không đổi gì' if not them and not bot and abs(dp) < 10 else 'đổi quá ít' if not them and abs(dp) < 25 else 'đổi'
    return '; '.join(s), loai, them
for ma in TEN_DON:
    for el in ('fire', 'poison', 'ice'):
        g = [gon.get('%s|%s|%d' % (ma, el, st)) for st in (1, 2, 3)]
        if not all(g): continue
        if ma == 'chuong': continue
        s12, l12, t12 = doi(g[0], g[1]); s23, l23, t23 = doi(g[1], g[2])
        nx = []
        if l12 != 'đổi': nx.append('Mầm→Thành hình: ' + l12)
        if l23 != 'đổi': nx.append('Thành hình→Thức tỉnh: ' + l23)
        if g[2]['lop_cung_luc_max']['trung3'] >= 12 or g[2]['hat_max']['trung3'] >= 90: nx.append('Thức tỉnh quá rối (%d lớp, %d hạt)' % (g[2]['lop_cung_luc_max']['trung3'], g[2]['hat_max']['trung3']))
        B.append('| %s | %s | %s | %s | %s |' % (TEN_DON[ma], TEN_HE[el], s12, s23, '; '.join(nx) or '—'))
open(RA_MD, 'a').write('\n'.join(B) + '\n')
