"""Đo chỉ số nét trên TẤM ẢNH GỐC trong game/art/custom (trước khi game vẽ): mỗi tấm quái / trùm / Cu Tí / vũ khí / em bé / người làng.
python3 do_tam.py [ra.json]"""
import base64, glob, io, json, os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chi_so import do
CUS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game', 'art', 'custom'))
LOAI = {'quai', 'zed', 'em-be', 'nguoi-lang'}
def main():
    kq = {}
    for f in sorted(glob.glob(os.path.join(CUS, '*.sprite.json'))):
        d = json.load(open(f))
        if d.get('doi_tuong') not in LOAI or d['ma'].endswith('-muotcu'):
            continue
        im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1])))
        r = do(im); r = {k: float(v) for k, v in r.items()}
        r['loai'] = d['doi_tuong']; r['net'] = d.get('net'); r['tl'] = d.get('ti_le')
        kq[d['ma']] = r
    out = sys.argv[1] if len(sys.argv) > 1 else None
    if out: json.dump(kq, open(out, 'w'), ensure_ascii=False, indent=1)
    for k, r in sorted(kq.items(), key=lambda x: -x[1]['NHOE']):
        print('%-16s %-10s NHOE %6.2f  mo_vien %6.2f  pha_tron %6.2f  doc %.3f' % (k, r['loai'], r['NHOE'], r['mo_vien'], r['pha_tron'], r['doc_canh']))
main()
