"""Phân loại số đo (so-lieu/<nhãn>.json) thành từng CA: hiệu ứng × quái × biến thể → "dính" / "lệch X điểm" / "không theo khi bị hất" /
"không theo khi di chuyển" / "sai cỡ" / "sai lớp" / "không tắt". In bảng tổng và ghi so-lieu/<nhãn>-ca.json.
  python3 phan_tich.py truoc [sau]"""
import json, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
SL = os.path.join(os.path.dirname(HERE), 'so-lieu')

TEN_DON = {'kiem': 'Kiếm (3 nhát)', 'thuong': 'Thương (đâm/quét)', 'bua': 'Búa nện', 'phitieu': 'Phi tiêu bay', 'db_kiem': 'Trảm Nguyệt',
           'db_thuong': 'Phi Thương', 'db_bua': 'Địa Chấn', 'db_phitieu': 'Mưa phi tiêu', 'chuong_hoa': 'Hỏa chưởng', 'chuong_doc': 'Độc chưởng', 'chuong_bang': 'Băng chưởng'}
TEN_TT = {'chay': 'Cháy', 'doc': 'Độc', 'bang': 'Băng (chậm)', 'dongbang': 'Đóng băng', 'choang': 'Choáng', 'troi': 'Trói chân (dây leo)', 'cham': 'Chậm (Thuỷ triều)', 'loyeu': 'Lộ điểm yếu'}
TEN_LOAI = {'thuong': 'quái thường', 'tinhanh': 'tinh anh', 'trumnho': 'trùm nhỏ', 'trum': 'trùm vùng'}
VUNG = ['Rừng già', 'Hang biển', 'Lâu đài cổ', 'Sông sâu']
HIT_API = {'hit', 'chHit', 'chBoom', 'chShatter', 'heShatter', 'heBoom', 'spPin', 'combo', 'status', 'freeze'}


def ca(nhom, q, bien, kq, x=0, ghi=''):
    return {'nhom': nhom, 'id': q['id'], 'loai': q['loai'], 'r': q['r'], 'bien': bien, 'kq': kq, 'x': round(x, 1), 'ghi': ghi}


def xet_trung(g, b):
    """Hình trúng (chớp, tia, nổ): tâm hình phải chạm điểm ảnh thân (≤ 3 điểm) và không nằm ở 1/5 dưới cùng (chân) hay trên đỉnh đầu."""
    e = g['e']
    if not e or not b: return None
    H = max(1, b['y1'] - b['y0'])
    cao = b['y1'] - e['cy']  # độ cao tâm hình tính từ đáy thân
    lo = 0.2 * H
    dev = 0; ly = []
    if g['gt'] is not None and g['gt'] > 3: dev = max(dev, g['gt']); ly.append('ngoài thân')
    if cao < lo: dev = max(dev, lo - cao); ly.append('ở chân')
    if cao > 0.95 * H: dev = max(dev, cao - 0.95 * H); ly.append('trên đầu')
    return ('dính', 0, '') if dev <= 0 else ('lệch', dev, ', '.join(ly))


def xet_so(s, b, ey=None):
    """Số sát thương: đáy chữ (y + 4) cách đỉnh đầu -2..12 điểm. Trùm cao chạm mép trên màn: số đặt sát dưới thanh máu trùm (y = 32) cũng tính là đúng."""
    if ey is not None and abs(s['y'] + ey - 32) < 0.6 and b['y0'] + ey < 36: return ('dính', 0, 'sát dưới thanh máu trùm')
    gap = b['y0'] - (s['y'] + 4)
    if gap > 12: return ('lệch', gap - 12, 'lơ lửng trên đầu %d điểm' % round(gap))
    if gap < -2: return ('lệch', -gap - 2, 'đè lên thân %d điểm' % round(-gap))
    return ('dính', 0, '')


def phan_loai(k):
    out = []
    ro = {q['id']: q for q in k['roster']}
    # ---- đòn của Cu Tí: hình trúng + số
    for nguon, ds in (('don', k['don']), ('mep', k.get('mep', [])), ('pl', k.get('pl', []))):
        for x in ds:
            q = ro[x['id']]; b = x.get('b')
            if not b: continue
            ten = TEN_DON.get(x['don'], x['don'])
            bien = ('mặt trái' if x['ben'] < 0 else 'mặt phải') + (', sát mép' if nguon == 'mep' else '')
            if nguon == 'pl':
                th = x.get('them') or {}
                ten = ten + ' + ' + ('phúc lành ' + th['pl'] if 'pl' in th else 'hệ ' + th.get('he', ''))
            nhom_t = ('Mép phòng: ' if nguon == 'mep' else 'Phúc lành/hệ: ' if nguon == 'pl' else '') + 'Hình trúng — ' + ten
            for g in x['nhom']:
                if g['api'] not in HIT_API or not g['e']: continue
                r = xet_trung(g, b)
                if r: out.append(ca(nhom_t, q, bien + ' · nhát %d' % (x['thu'] + 1) + ' · ' + g['api'], r[0], r[1], r[2]))
            for s in x['so']:
                if not s.get('moi'): continue
                r = xet_so(s, x.get('bso') or b, x.get('ey'))
                out.append(ca(('Mép phòng: ' if nguon == 'mep' else '') + 'Số sát thương', q, bien + ' · ' + ten, r[0], r[1], r[2]))
    # ---- trạng thái trên thân
    for x in k['tt']:
        q = ro[x['id']]; b = x['b']; e = x['e']
        bien = 'mặt trái' if x['mat'] < 0 else 'mặt phải'
        ten = TEN_TT[x['ten']]
        if x['ten'] == 'loyeu' and q['loai'] not in ('trum', 'trumnho'): continue
        # biểu tượng trên đầu (trùm): đáy biểu tượng cách đỉnh đầu 0..12 điểm
        ic = x.get('icon')
        if ic and b and q['loai'] in ('trum', 'trumnho') and x['ten'] not in ('troi', 'cham'):
            gap = b['y0'] - ic['y1']
            if gap > 12: out.append(ca('Biểu tượng trạng thái trên đầu', q, bien + ' · ' + ten, 'lệch', gap - 12, 'lơ lửng %d điểm' % round(gap)))
            elif gap < -3: out.append(ca('Biểu tượng trạng thái trên đầu', q, bien + ' · ' + ten, 'lệch', -gap - 3, 'đè lên thân %d điểm' % round(-gap)))
            else: out.append(ca('Biểu tượng trạng thái trên đầu', q, bien + ' · ' + ten, 'dính'))
        if not e:
            if x['ten'] == 'choang' and q['loai'] == 'trum':
                out.append(ca('Trạng thái: ' + ten, q, bien, 'dính', 0, 'sao choáng vẽ trong hình trùm (theo thân)'))
            elif x['ten'] in ('troi', 'cham', 'loyeu'):
                out.append(ca('Trạng thái: ' + ten, q, bien, 'không có hình', 0, 'không có hình riêng'))
            else:
                out.append(ca('Trạng thái: ' + ten, q, bien, 'không có hình', 0, 'không thấy hình'))
            continue
        bw = max(1, b['x1'] - b['x0']); bh = max(1, b['y1'] - b['y0'])
        ew = e['x1'] - e['x0']; eh = e['y1'] - e['y0']
        loi = []
        if x['ten'] == 'choang':
            gap = b['y0'] - e['cy']
            if gap > 14: loi.append(('lệch', gap - 14, 'sao lơ lửng trên đầu %d điểm' % round(gap)))
            elif gap < -2: loi.append(('lệch', -gap - 2, 'sao đè xuống thân %d điểm' % round(-gap)))
            if ew < 0.18 * bw: loi.append(('sai cỡ', 0.18 * bw - ew, 'sao quá nhỏ (%d/%d điểm)' % (round(ew), round(bw))))
        elif x['ten'] in ('troi', 'cham'):
            if e['cy'] < b['y1'] - 0.45 * bh or e['cy'] > b['y1'] + 8: loi.append(('lệch', abs(e['cy'] - b['y1']), 'không ở chân'))
            if ew < 0.35 * bw: loi.append(('sai cỡ', 0.35 * bw - ew, 'vòng chân nhỏ (%d/%d điểm)' % (round(ew), round(bw))))
        else:
            if x['inn'] is not None and x['inn'] < 0.7: loi.append(('lệch', x.get('gt') or 0, 'chỉ %d%% hình nằm trên thân' % round(100 * x['inn'])))
            if ew < 0.45 * bw or eh < 0.4 * bh: loi.append(('sai cỡ', max(0.45 * bw - ew, 0.4 * bh - eh), 'quá nhỏ so với thân (%d×%d / %d×%d)' % (ew, eh, bw, bh)))
            if ew > 1.6 * bw or eh > 1.6 * bh: loi.append(('sai cỡ', max(ew - 1.6 * bw, eh - 1.6 * bh), 'trùm lấp thân (%d×%d / %d×%d)' % (ew, eh, bw, bh)))
            if x.get('front') is not None and x['front'] < 0.3 and x.get('ten') != 'troi': loi.append(('sai lớp', 0, 'bị thân che (%d%% trước thân)' % round(100 * x['front'])))
        if x.get('hat') is not None and abs(x['hat'] + 10) > 1.5: loi.append(('không theo khi bị hất', abs(x['hat'] + 10), 'thân nhấc 10 điểm, hình nhấc %s' % round(-x['hat'], 1)))
        if x.get('di') is not None and abs(x['di'] - 20) > 2: loi.append(('không theo khi di chuyển', abs(x['di'] - 20), 'quái đi 20, hình đi %s' % x['di']))
        if x.get('het', 0) > 3: loi.append(('không tắt', x['het'], 'còn %d điểm ảnh khi hết trạng thái' % x['het']))
        if not loi: out.append(ca('Trạng thái: ' + ten, q, bien, 'dính'))
        for l in loi: out.append(ca('Trạng thái: ' + ten, q, bien, l[0], l[1], l[2]))
    # ---- hình một lần khi vừa dính
    for x in k.get('motlan', []):
        q = ro[x['id']]
        if not x.get('e'): continue
        b = x['b']; e = x['e']; bw = max(1, b['x1'] - b['x0'])
        ten = 'Vừa đóng băng (một lần)' if x['api'] == 'freeze' else 'Vừa dính hệ (%s)' % x['el']
        loi = []
        if x['inn'] is not None and x['inn'] < 0.5: loi.append(('lệch', x.get('gt') or 0, 'chỉ %d%% hình trên thân' % round(100 * x['inn'])))
        ew = e['x1'] - e['x0']
        if ew < 0.45 * bw: loi.append(('sai cỡ', 0.45 * bw - ew, 'nhỏ (%d/%d)' % (ew, bw)))
        if not loi: out.append(ca(ten, q, 'mặt trái', 'dính'))
        for l in loi: out.append(ca(ten, q, 'mặt trái', l[0], l[1], l[2]))
    # ---- tắt khi chết
    for x in k.get('chet', []):
        q = ro[x['id']]
        if x['sau'] > 3: out.append(ca('Tắt khi quái chết', q, 'cháy+độc+băng+choáng', 'không tắt', x['sau'], 'còn %d điểm ảnh sau khi chết' % x['sau']))
        else: out.append(ca('Tắt khi quái chết', q, 'cháy+độc+băng+choáng', 'dính', 0, 'tắt'))
    # ---- đòn của quái
    for x in k.get('quai', []):
        q = ro[x['id']]
        bien = ('quay trái' if x['ben'] < 0 else 'quay phải') + (' · pha %d' % (x['pha'] + 1) if x.get('pha') else '')
        for d in x['dan']:
            if d['gt'] > 3: out.append(ca('Đòn quái: đạn bắn ra', q, bien, 'lệch', d['gt'], 'đạn sinh ngoài thân'))
            else: out.append(ca('Đòn quái: đạn bắn ra', q, bien, 'dính', 0, 'từ thân, cách tâm khung %s' % d['tam']))
        for d in x['cao']:
            if not d['e']: continue
            mat = (d['e']['cx'] - d['b']['cx']) * d['face']
            if d['k'] == 'lunge':  # bụi / vệt lao: vốn toả ra SAU lưng khi quái lao tới — chỉ xét có sát thân không
                out.append(ca('Đòn quái: bụi khi lao tới', q, bien, 'dính' if (d['gt'] or 0) <= 8 else 'lệch', d['gt'] or 0, 'sau lưng (đúng kiểu)'))
                continue
            if d['gt'] is not None and d['gt'] > 3: out.append(ca('Đòn quái: vệt cào / lao', q, bien, 'lệch', d['gt'], 'ngoài thân'))
            elif mat < -2: out.append(ca('Đòn quái: vệt cào / lao', q, bien, 'lệch', -mat, 'ở phía lưng'))
            else: out.append(ca('Đòn quái: vệt cào / lao', q, bien, 'dính'))
        for d in x['bom']:
            n = 'Đòn quái: vật ném / phóng ra'
            if d['gt'] > 3: out.append(ca(n, q, bien, 'lệch', d['gt'], 'phát từ ngoài thân'))
            else: out.append(ca(n, q, bien, 'dính'))
    return out


def tong(cs):
    t = collections.Counter(c['kq'] for c in cs)
    return t


def main():
    nhan = sys.argv[1] if len(sys.argv) > 1 else 'truoc'
    k = json.load(open(os.path.join(SL, nhan + '.json')))
    cs = phan_loai(k)
    json.dump(cs, open(os.path.join(SL, nhan + '-ca.json'), 'w'), ensure_ascii=False, indent=0)
    t = tong(cs)
    co = [c for c in cs if c['kq'] != 'không có hình']
    dung = sum(1 for c in co if c['kq'] == 'dính')
    print(nhan, 'NET', k.get('net'), '— tổng ca:', len(co), 'đúng:', dung, 'lệch:', len(co) - dung, dict(t))
    g = collections.defaultdict(collections.Counter)
    for c in co: g[c['nhom']][c['kq']] += 1
    for n in sorted(g): print('  %-58s %s' % (n, dict(g[n])))


if __name__ == '__main__':
    main()
