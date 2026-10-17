"""Kiểm kê ảnh nhóm NỀN (sàn, tường, nền ngoài, phủ mép, cửa, đồ trang trí, vật trong phòng, làng): mã, cỡ, net, có ảnh gốc / công cụ
dựng lại hay không, ảnh dựng lại net 2 có trùng ảnh game không. Ghi ra/kiem-ke.json + in bảng Markdown."""
import glob, json, os, re
from chung import CUS, RA, doc
NHOM = [('Rừng già', r'^gd-(nen|tt|cua)-rung-|^gd-loi-mon-rung$|^gd-cot-nang-rung$'),
        ('Hang biển', r'^gd-(nen|tt|cua)-bien-|^gd-cot-nang-bien$'),
        ('Lâu đài cổ', r'^gd-(nen|tt|cua)-lau-|^gd-tham-lau$|^gd-cot-nang-lau$'),
        ('Sông sâu', r'^gd-(nen|tt|cua)-song-|^gd-song-cau$'),
        ('Cửa chung', r'^gd-cua-(o-khoa|dau-lau)$'),
        ('Vật trong phòng', r'^gd-vat-'),
        ('Làng', r'^gd-lang-(?!dia|thanh-duoi)')]
CONG = {}  # mã → công cụ dựng lại
for f in glob.glob(os.path.join(RA, 'net3-net', '*.png')):
    CONG[os.path.basename(f)[:-4]] = True
so2 = {}
for d in ('net2-box', 'net2-net', 'net2-min'):
    p = os.path.join(RA, d, 'so-net2.json')
    if os.path.exists(p):
        for k, v in json.load(open(p)).items():
            if v.get('giong') == 1.0 or (k not in so2):
                so2[k] = v
kq = []
for f in sorted(glob.glob(os.path.join(CUS, 'gd-*.sprite.json'))):
    ma = os.path.basename(f)[:-12]
    nhom = next((n for n, r in NHOM if re.search(r, ma)), None)
    if not nhom:
        continue
    d, a = doc(ma)
    kq.append({'ma': ma, 'nhom': nhom, 'ten': d.get('ten', ''), 'rong': d['rong'], 'cao': d['cao'], 'net': d.get('net', 1),
               'kb': os.path.getsize(f) // 1024, 'dung_lai': ma in CONG, 'so_net2': so2.get(ma)})
json.dump(kq, open(os.path.join(RA, 'kiem-ke.json'), 'w'), ensure_ascii=False, indent=1)
for n, _ in NHOM:
    ds = [x for x in kq if x['nhom'] == n]
    co = [x for x in ds if x['dung_lai']]
    print('%-16s %3d ảnh, dựng lại được %3d, thiếu gốc %3d' % (n, len(ds), len(co), len(ds) - len(co)))
print('tổng', len(kq), 'dựng lại', sum(x['dung_lai'] for x in kq))
