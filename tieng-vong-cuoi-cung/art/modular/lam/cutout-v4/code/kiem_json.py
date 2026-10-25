"""Validator lam-v4.json + manh/*.png:  python3 kiem_json.py [đường_dẫn_json]
Kiểm: schema_version, cha tồn tại / không chu trình, số hữu hạn, PNG tồn tại + RGBA + đúng kich_thuoc,
P/D nằm trong ảnh, xuong == |D−P|, gan của chuỗi chi == D của cha, slot/thu_tu_phu nguyên, khoá sắp lớp
(slot, thu_tu_phu, ten) không trùng ở MỌI tổ hợp slot_theo_tu_the, ủng đè cẳng chân ở mọi tổ hợp,
IK: chuỗi cha–con liên tiếp, gap ∈ {−1,+1}, 0 ≤ mix ≤ 1, diem_de trong ảnh ủng; visible kiểu bool.
Ghi kết quả ra ../kiem-thu/00-validator.json; mã thoát 1 nếu có lỗi."""
import os, sys, json, math, itertools
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))


def finite(x):
    if isinstance(x, (int, float)):
        return math.isfinite(x)
    if isinstance(x, (list, tuple)):
        return all(finite(v) for v in x)
    if isinstance(x, dict):
        return all(finite(v) for v in x.values())
    return True


def check(path):
    err, warn, info = [], [], {}
    base = os.path.dirname(os.path.abspath(path))
    J = json.load(open(path, encoding='utf-8'))
    for k in ('schema_version', 'world_to_logic', 'manh', 'goc', 'quy_uoc_goc', 'sap_lop', 'lat_ngang', 'ik'):
        if k not in J:
            err.append('thiếu khoá gốc ' + k)
    if not isinstance(J.get('world_to_logic'), (int, float)):
        err.append('world_to_logic không phải số')
    sv = str(J.get('schema_version', ''))
    if not (sv.count('.') == 2 and all(p.isdigit() for p in sv.split('.'))):
        err.append('schema_version không dạng a.b.c: ' + sv)
    man = J['manh']
    if 'ik' not in J:
        J['ik'] = []
    roots = [n for n, d in man.items() if d['cha'] is None]
    if roots != [J['goc']['manh']]:
        err.append('gốc không duy nhất / không khớp goc.manh: %s' % roots)
    for n, d in man.items():
        if d['cha'] is not None and d['cha'] not in man:
            err.append('%s: cha %s không tồn tại' % (n, d['cha']))
        seen, m = set(), n
        while m is not None and m in man:
            if m in seen:
                err.append('%s: chu trình cha–con' % n); break
            seen.add(m); m = man[m]['cha']
        if not finite(d):
            err.append('%s: có số không hữu hạn' % n)
        for k in ('slot', 'thu_tu_phu'):
            if not isinstance(d.get(k), int):
                err.append('%s: %s không phải số nguyên' % (n, k))
        if not isinstance(d.get('visible'), bool):
            err.append('%s: visible không phải bool' % n)
        f = os.path.join(base, 'manh', d['anh'])
        if not os.path.isfile(f):
            err.append('%s: thiếu PNG %s' % (n, d['anh'])); continue
        im = Image.open(f)
        if im.mode != 'RGBA':
            err.append('%s: PNG không RGBA (%s)' % (n, im.mode))
        if list(im.size) != d['kich_thuoc']:
            err.append('%s: kích thước PNG %s ≠ JSON %s' % (n, im.size, d['kich_thuoc']))
        W, H = d['kich_thuoc']
        pts = [('P', d.get('P')), ('D', d.get('D'))]
        if isinstance(d.get('diem_de'), dict):
            pts += [('diem_de.' + k, v) for k, v in d['diem_de'].items()]
        for key, p in pts:
            if p is not None and not (-1 <= p[0] <= W + 1 and -1 <= p[1] <= H + 1):
                err.append('%s: %s %s ngoài ảnh %dx%d' % (n, key, p, W, H))
        if d.get('D') is not None:
            L = math.hypot(d['D'][0] - d['P'][0], d['D'][1] - d['P'][1])
            if abs(L - d['xuong']) > 0.01:
                err.append('%s: |D−P| %.3f ≠ xuong %.3f' % (n, L, d['xuong']))
            hg = math.degrees(math.atan2(d['D'][1] - d['P'][1], d['D'][0] - d['P'][0]))
            if abs(hg - d['huong_anh']) > 0.01:
                err.append('%s: huong_anh lệch' % n)
    # chuỗi IK
    info['ik'] = []
    for c in J.get('ik', []):
        x = c['xuong']
        if man[x[1]]['cha'] != x[0] or man[x[2]]['cha'] != x[1]:
            err.append('IK %s: xương không liên tiếp cha–con' % c['ten'])
        for a, b in ((x[0], x[1]), (x[1], x[2])):
            if man[a]['D'] is None or [round(v, 2) for v in man[b]['gan']] != [round(v, 2) for v in man[a]['D']]:
                err.append('IK %s: gan của %s ≠ D của %s' % (c['ten'], b, a))
        if c['gap'] not in (-1, 1):
            err.append('IK %s: gap phải ±1' % c['ten'])
        if not (0 <= c['mix'] <= 1):
            err.append('IK %s: mix ngoài [0,1]' % c['ten'])
        W, H = man[x[2]]['kich_thuoc']
        if not (0 <= c['diem_de'][0] <= W and 0 <= c['diem_de'][1] <= H + 1):
            err.append('IK %s: diem_de ngoài ảnh ủng' % c['ten'])
        info['ik'].append(dict(ten=c['ten'], tam=man[x[0]]['xuong'] + man[x[1]]['xuong']))
    # sắp lớp ở mọi tổ hợp luật slot
    rules = J.get('slot_theo_tu_the', [])
    combos = []
    for on in itertools.product([False, True], repeat=len(rules)):
        sl = {n: d['slot'] for n, d in man.items()}
        for r, o in zip(rules, on):
            if o:
                for n in r['manh']:
                    sl[n] = r['slot']
        keys = {}
        for n in man:
            k = (sl[n], man[n].get('thu_tu_phu', 0))
            keys.setdefault(k, []).append(n)
        dup = {str(k): v for k, v in keys.items() if len(v) > 1}
        order = sorted(man, key=lambda n: (sl[n], man[n].get('thu_tu_phu', 0), n))
        boot_ok = all(order.index('ung-' + s) > order.index('cang-chan-' + s) for s in ('gan', 'xa'))
        if not boot_ok:
            err.append('tổ hợp luật %s: ủng không đè cẳng chân' % (on,))
        if dup:
            warn.append('tổ hợp luật %s: trùng (slot, thu_tu_phu) %s – phân xử bằng tên' % (on, dup))
        combos.append(dict(luat_bat=list(on), trung_khoa=dup, ung_de_cang=boot_ok,
                           thu_tu=[n for n in order if n.startswith(('dui-gan', 'cang-chan-gan', 'ung-gan', 'than'))]))
    info['to_hop_slot'] = combos
    info['an'] = [n for n, d in man.items() if not d.get('visible', True)]
    return dict(file=os.path.basename(path), schema_version=sv, so_manh=len(man), loi=err, canh_bao=warn,
                thong_tin=info, dat=not err)


if __name__ == '__main__':
    p = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'lam-v4.json')
    res = check(p)
    out = os.path.join(HERE, '..', 'kiem-thu', '00-validator-%s.json' % os.path.splitext(os.path.basename(p))[0])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('validator:', 'ĐẠT' if res['dat'] else 'LỖI', '| lỗi', len(res['loi']), '| cảnh báo', len(res['canh_bao']))
    for e in res['loi'] + res['canh_bao']:
        print('  ', e)
    sys.exit(0 if res['dat'] else 1)
