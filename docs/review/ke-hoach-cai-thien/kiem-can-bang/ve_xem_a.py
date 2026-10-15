#!/usr/bin/env python3
"""A — vẽ ảnh soát tĩnh xem-A.png từ số đo (phan_tich_a.py --json, do_sm75.py --json, do_trum_a.py --json, do_cap.py --json).
  python3 .../ve_xem_a.py <thư mục số đo> [ra=xem-A.png]"""
import json, os, sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
d = sys.argv[1]
ra = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'xem-A.png')
J = lambda f: json.load(open(os.path.join(d, f))) if os.path.exists(os.path.join(d, f)) else None
tom = J('tom.json')
sm75 = {}
for f in ('sm75-a.json', 'sm75-b.json'):
    x = J(f)
    if x:
        sm75.update(x)
T = J('trum-thuong.json') or []
T65 = {r['muc']: r for r in (J('trum-thuong-65.json') or [])}
TT = {r['muc']: r for r in (J('trum-that-nho.json') or []) + (J('trum-that-vung.json') or [])}
import re
def doc_log(*fs):
    out = {}
    for f in fs:
        p = os.path.join(d, f)
        if not os.path.exists(p):
            continue
        for ln in open(p):
            m = re.match(r'^\| (\d-\d) \| .*?\| (\d+)/(\d+) \((\d+)%\) \| (\d+)/(\d+) \| (\d+)/(\d+)', ln)
            if m:
                out[m.group(1)] = (int(m.group(2)) / int(m.group(3)), int(m.group(5)) / int(m.group(6)))
    return out
W0 = doc_log('v0m-a.log', 'v0m-b.log')
W2 = doc_log('v2m-a.log', 'v2m-b.log')
DX = J('dx-khuyen.json'); DXL = J('dx-lieu.json')
CK = J('cd-khuyen-kiem.json'); CL = J('cd-lieu-kiem.json')
M = J('trum-mep-ne.json') or []
cap = J('cap.json')
AI = ['%d-%d' % (k // 5 + 1, k % 5 + 1) for k in range(15)]
REC = [95, 105, 125, 140, 175, 180, 215, 260, 275, 305, 310, 330, 410, 420, 520]
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 9})
C = {'a': '#2a6fdb', 'b': '#e07a1f', 'c': '#3a9a5b', 'd': '#9b59b6', 'x': '#555555', 'r': '#c0392b'}
fig, ax = plt.subplots(4, 2, figsize=(15, 20.5))
fig.suptitle('A — Độ khó & đường cong cấp (bot cân bằng, Node; chỉ đo — chưa sửa số)', fontsize=13, fontweight='bold')

# 1. lần chơi mỗi ải
a = ax[0][0]
x = np.arange(15)
ser = [('khuyen', 'Kiếm, nghe khuyên dùng', C['a']), ('lieu', 'Kiếm, không nghe khuyên dùng', C['b']), ('khuyen-thuong', 'Thương', C['c']), ('khuyen-bua', 'Búa', C['d'])]
ser = [s for s in ser if tom.get(s[0])]
w = 0.8 / len(ser)
for j, (k, lab, col) in enumerate(ser):
    a.bar(x + (j - (len(ser) - 1) / 2) * w, [r['plays'] for r in tom[k][:15]], w, label=lab, color=col)
a.axhline(6, color=C['r'], ls='--', lw=1); a.text(14.4, 6.15, 'kẹt (≥ 6)', color=C['r'], ha='right', fontsize=8)
a.set_xticks(x); a.set_xticklabels(AI); a.set_ylabel('lần chơi trung bình để qua ải'); a.set_title('1. Số lần chơi mỗi ải (độ khó 1)')
a.legend(fontsize=8, loc='upper left')

# 2. Sức mạnh khuyên dùng vs bot cần
a = ax[0][1]
a.plot(x, REC, 'k-o', ms=4, label='G.STAGE_REC (khuyên dùng hiện tại)')
kd = tom['kd']
p75 = []
for k, t in enumerate(AI):
    if t in sm75:
        p75.append((k, sm75[t]['p75'], 'fit'))
    elif t in kd:
        p75.append((k, kd[t]['p75'], kd[t]['tag']))
for k, v, tag in p75:
    mk = {'fit': 'o', 'le': 'v', 'gt': '^'}[tag]
    a.plot(k, v, mk, color=C['r'], ms=7, mfc='none' if tag != 'fit' else C['r'])
a.plot([], [], 'o', color=C['r'], label='SM để bot thắng 75% (▼ ≤, ▲ > : ngoài khoảng đo)')
a.plot(x, [r['pw1'] for r in tom['khuyen'][:15]], 's--', color=C['a'], ms=3, lw=1, label='SM lúc thử đầu (nghe khuyên dùng)')
a.plot(x, [r['pw1'] for r in tom['lieu'][:15]], 's--', color=C['b'], ms=3, lw=1, label='SM lúc thử đầu (không nghe)')
a.set_xticks(x); a.set_xticklabels(AI); a.set_ylabel('Sức mạnh'); a.set_title('2. Khuyên dùng so với Sức mạnh bot cần'); a.legend(fontsize=8)

# 3. độ khó 2
a = ax[1][0]
k2 = tom['khuyen'][15:30]
KA = J('dx-k2-a.json'); KB = J('dx-k2-b.json')
def k2pl(D):
    rs = [r for r in D['runs'] if r.get('st') and not r.get('ket')]
    return [sum(r['st'][15 + k]['plays'] for r in rs) / len(rs) for k in range(15)]
if k2:
    a.plot(x, [r['rec'] for r in k2], 'k-o', ms=4, label='khuyên dùng độ khó 2 hiện tại')
    a.plot(x, [r['pw1'] for r in k2], 's-', color=C['a'], ms=4, label='SM bot lúc tới (hiện tại: tới đã dư sức)')
    for k, t in enumerate(AI):
        q = kd.get('K2 ' + t)
        if q:
            mk = {'fit': 'o', 'le': 'v', 'gt': '^'}[q['tag']]
            a.plot(k, q['p75'], mk, color=C['r'], ms=6, mfc='none' if q['tag'] != 'fit' else C['r'])
    a.plot([], [], 'o', color=C['r'], label='SM bot cần để thắng 75% (hiện tại)')
    a.plot(x, [round((580 + 220 * k / 14) / 5) * 5 for k in range(15)], ':', color=C['c'], lw=2, label='đề xuất "vừa": 580 → 800')
    a.plot(x, [round((560 + 200 * k / 14) / 5) * 5 for k in range(15)], ':', color=C['d'], lw=2, label='đề xuất "khó": 560 → 760 (quái mạnh hơn)')
    a2 = a.twinx()
    a2.bar(x - 0.27, [r['plays'] for r in k2], 0.25, color=C['x'], alpha=0.45)
    if KA: a2.bar(x, k2pl(KA), 0.25, color=C['c'], alpha=0.45)
    if KB: a2.bar(x + 0.27, k2pl(KB), 0.25, color=C['d'], alpha=0.45)
    a2.set_ylim(0, 12); a2.set_ylabel('lần chơi (cột: xám hiện tại · xanh "vừa" · tím "khó")')
    a.set_xticks(x); a.set_xticklabels(['K2 ' + t for t in AI], rotation=45, fontsize=7.5); a.set_ylabel('Sức mạnh')
    a.set_title('3. Độ khó 2: hiện tại tới đã dư sức (qua ngay lần đầu) — và 2 đề xuất đã thử'); a.legend(fontsize=7, loc='center left')

# 4. đường cong cấp
a = ax[1][1]
cr = tom['cap']
a.plot(x, [r['lvl1'] for r in cr], 'o-', color=C['a'], label='cấp lúc thử đầu (nghe khuyên dùng)')
a.plot(x, [r['lvl1'] for r in tom['lieu'][:15]] if 'lvl1' in tom['lieu'][0] else [], 'o--', color=C['b'], label='cấp lúc thử đầu (không nghe)')
a.set_ylabel('cấp nhân vật'); a.set_xticks(x); a.set_xticklabels(AI)
a2 = a.twinx()
a2.bar(x - 0.2, [r['base'] for r in cr], 0.4, color=C['c'], alpha=0.35, label='KN một lượt thắng')
a2.bar(x + 0.2, [r['need'] for r in cr], 0.4, color=C['x'], alpha=0.25, label='KN cần lên 1 cấp (lúc tới ải)')
a2.set_ylabel('kinh nghiệm')
h1, l1 = a.get_legend_handles_labels(); h2, l2 = a2.get_legend_handles_labels(); a.legend(h1 + h2, l1 + l2, fontsize=8, loc='upper left')
a.set_title('4. Đường cong cấp: vào vùng ở cấp 1 · 9 · 20, qua 3-5 ở cấp 29')

# 5. trùm: tỉ lệ thắng
a = ax[2][0]
lab = []; v1 = []; v2 = []
for r in T:
    n = r['muc'].replace(' tinh anh ', '\n')
    lab.append((r['muc'] if 'tinh anh' not in r['muc'] else r['ten']) + '\n' + (r['ten'] if 'tinh anh' not in r['muc'] else 'tinh anh'))
    v1.append(r['thang'] * 100 / r['n'])
    q = TT.get(r['muc']) or r; v2.append(q['thang'] * 100 / q['n'])
xx = np.arange(len(lab))
a.bar(xx - 0.2, v1, 0.4, color='#9bbcf0', label='vào thẳng, đủ máu, trùm KHÔNG có lớp thích nghi')
a.bar(xx + 0.2, v2, 0.4, color=C['a'], label='như lượt thật: 90% máu + lớp thích nghi (Kháng Lửa; trùm vùng thêm Chống áp sát)')
a.axhline(75, color=C['r'], ls='--', lw=1)
a.set_xticks(xx); a.set_xticklabels(lab, fontsize=6.5, rotation=90); a.set_ylim(0, 105); a.set_ylabel('% thắng trùm')
a.set_title('5. Thắng từng trùm ở Sức mạnh = khuyên dùng (60–100 lượt/cột)'); a.legend(fontsize=7.5, loc='lower left')

# 6. bản đồ nhiệt đứng mép
a = ax[2][1]
CHO = ['giua', 'tren', 'duoi', 'trai', 'phai', 'goc-tt', 'goc-tp', 'goc-dt', 'goc-dp']
TC = ['giữa', 'mép\ntrên', 'mép\ndưới', 'mép\ntrái', 'mép\nphải', 'góc\ntrên-trái', 'góc\ntrên-phải', 'góc\ndưới-trái', 'góc\ndưới-phải']
muc = []
for r in M:
    if r['muc'] not in muc:
        muc.append(r['muc'])
Tm = {r['muc']: r for r in T}
mat = np.zeros((len(muc), len(CHO))); txt = [[''] * len(CHO) for _ in muc]; rl = []
for i, m in enumerate(muc):
    rs = {r['cho']: r for r in M if r['muc'] == m}
    g = rs['giua']['mauPhut']; bt = Tm[m]['mauPhut'] if m in Tm else g
    rl.append(rs['giua']['ten'] + ' ' + m.split()[0])
    for j, c in enumerate(CHO):
        v = rs[c]['mauPhut']
        mat[i, j] = v / max(1, g)
        ok = c != 'giua' and v <= 0.5 * g and v <= 0.5 * bt and rs[c]['thang'] >= rs['giua']['thang']
        txt[i][j] = f"{v:.0f}{' ✓' if ok else ''}"
im = a.imshow(np.clip(mat, 0, 2), cmap='RdYlGn_r', vmin=0, vmax=2, aspect='auto')
for i in range(len(muc)):
    for j in range(len(CHO)):
        a.text(j, i, txt[i][j], ha='center', va='center', fontsize=7, fontweight='bold' if '✓' in txt[i][j] else None)
a.set_xticks(range(len(CHO))); a.set_xticklabels(TC, fontsize=7); a.set_yticks(range(len(muc))); a.set_yticklabels(rl, fontsize=7.5)
a.set_title('6. Đứng sát mép/góc + né: máu mất %/phút (màu = so với đứng giữa; ✓ = chỗ an toàn)')
fig.colorbar(im, ax=a, fraction=0.03, label='÷ đứng giữa')
# 7. thắng ải ở SM = khuyên dùng: hiện tại vs đề xuất
a = ax[3][0]
a.bar(x - 0.2, [W0.get(t, (0, 0))[0] * 100 for t in AI], 0.4, color=C['x'], label='hiện tại')
a.bar(x + 0.2, [W2.get(t, W0.get(t, (0, 0)))[0] * 100 for t in AI], 0.4, color=C['c'], label='đề xuất A (de_xuat_a.js, thử trong bộ nhớ)')
a.axhline(75, color=C['r'], ls='--', lw=1); a.axhline(60, color=C['r'], ls=':', lw=1)
a.set_xticks(x); a.set_xticklabels(AI); a.set_ylim(0, 105); a.set_ylabel('% thắng cả ải')
a.set_title('7. Thắng cả ải khi Sức mạnh = khuyên dùng (20 bản lưu thật × 5 lượt)'); a.legend(fontsize=8, loc='lower left')
# 8. lần chơi: hiện tại vs đề xuất
a = ax[3][1]
def pl(D):
    rs = [r for r in D['runs'] if r.get('st') and not r.get('ket')]
    return [sum(r['st'][k]['plays'] for r in rs) / len(rs) for k in range(15)], sum(sum(s['plays'] for s in r['st'][:15]) for r in rs) / len(rs), sum(sum(s['t'] for s in r['st'][:15]) for r in rs) / len(rs) / 60
if DX and CK:
    for D, lab, col, off in ((CK, 'nghe khuyên dùng · hiện tại', C['x'], -0.3), (DX, 'nghe khuyên dùng · đề xuất A', C['c'], -0.1), (CL, 'không nghe · hiện tại', '#bbbbbb', 0.1), (DXL, 'không nghe · đề xuất A', '#8fd19e', 0.3)):
        if not D:
            continue
        v, tot, ph = pl(D)
        a.bar(x + off, v, 0.2, color=col, label=f'{lab}: {tot:.0f} lần, {ph:.0f} phút')
    a.axhline(6, color=C['r'], ls='--', lw=1)
    a.set_xticks(x); a.set_xticklabels(AI); a.set_ylabel('lần chơi trung bình'); a.set_title('8. Chiến dịch: số lần chơi mỗi ải, hiện tại so với đề xuất A'); a.legend(fontsize=7.5)
fig.tight_layout(rect=[0, 0, 1, 0.97])
fig.savefig(ra, dpi=110)
print('Đã vẽ', ra)
