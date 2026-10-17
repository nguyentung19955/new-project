"""Tổng hợp ra/net-cao/*.json: mỗi mã bao nhiêu khung dựng từ gốc (nét 4)."""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chung import RA, pham_vi
R = {}
for f in glob.glob(os.path.join(RA, 'net-cao', '*.json')):
    d = json.load(open(f)); g = [k for k in d['khung'] if k['n'] == 4]
    R[d['ma']] = (sum(k['cach'] == 'goc' for k in g), len(g), min([k.get('iou_ve', 1) for k in g if k['cach'] == 'goc'] or [0]))
pv = pham_vi()
du = [m for m in pv if m in R and R[m][1] and R[m][0] == R[m][1]]
mot = [m for m in pv if m in R and 0 < R[m][0] < R[m][1]]
khong = [m for m in pv if m not in R or R[m][0] == 0]
print('đủ', len(du), 'một phần', len(mot), 'chưa', len(khong), '/', len(pv))
if '-v' in sys.argv:
    print('MỘT PHẦN', [(m, R[m][:2]) for m in mot]); print('CHƯA', khong)
