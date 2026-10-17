"""MŨI KIẾM KHÔNG XUYÊN ĐẤT với ảnh kiếm vuông theo hệ: quay combo kiếm nặng 4 cấp bằng kiem-nang/quay.py (bot headless, hình Cu Tí thật
G.art.hero ×3), kiếm mang hệ EL (Lửa / Độc / Băng — cấp 1..3 dùng ảnh theo hệ mới), đếm điểm ảnh nằm DƯỚI vạch đất ở MỌI nhịp.
Chạy (từ gốc repo, sau build):  python3 docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/cong-cu/dat.py <fire|poison|ice> [cờ url]"""
import os, sys, tempfile
import numpy as np
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
KN = os.path.join(GOC, 'docs/review/ke-hoach-cai-thien/kiem-nang')
MUI = '--mui' in sys.argv
EL = sys.argv[1]; CO = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else ''
ra = os.path.join(tempfile.mkdtemp(), 'q.npz')
src = open(os.path.join(KN, 'quay.py'), encoding='utf-8').read()
src = src.replace("CAP = (0,) if '--mot-cap' in sys.argv else (0, 3)", 'CAP = (0, 1, 2, 3)')
sys.argv = ['quay.py', os.path.join(GOC, 'game/dist/linh-khi.html'), ra] + ([CO] if CO else [])
g = {'__name__': 'quay', '__file__': os.path.join(KN, 'quay.py')}
exec(compile(src, os.path.join(KN, 'quay.py'), 'exec'), g)
g['DUNG'] = g['DUNG'].replace("'ice'", "'%s'" % EL).replace('.ice = ', "['%s'] = " % EL)
assert EL == 'ice' or "'ice'" not in g['DUNG']
g['main']()
z = np.load(ra, allow_pickle=True)
import json
so = json.loads(str(z['so']))['so']
for cap in range(4):
    A = z['a%d' % cap]
    nh = so[str(cap)]['nhip']
    duoi = (A[:, 211:, :, 3] > 0).reshape(len(A), -1).sum(1)
    # khung CỐ Ý sát đất (đặt mũi chạm vạch đất): nhát 1 u ≤ 0,45 (lê kiếm + quét sát đất), nhát 2 u ≥ 0,72 (mũi cắm đất)
    sat = [bool(r.get('ten') and r.get('u') is not None and ((r['ten'].startswith('kiem_1') and r['u'] <= 0.45) or (r['ten'].startswith('kiem_2') and r['u'] >= 0.72))) for r in nh]
    a = [int(d) for d, s_ in zip(duoi, sat) if s_]; b = [int(d) for d, s_ in zip(duoi, sat) if not s_]
    print('%s cấp %d: %d nhịp — khung sát đất: %d/%d nhịp có điểm ảnh dưới vạch (tổng %d); khung khác: %d/%d (tổng %d)' % (
        EL, cap, len(A), sum(1 for x in a if x), len(a), sum(a), sum(1 for x in b if x), len(b), sum(b)))
    if MUI:
        print('   mũi (y so với chân, khung sát đất):', [round(r['mui'], 1) if r.get('mui') is not None else None for r, s_ in zip(nh, sat) if s_])
