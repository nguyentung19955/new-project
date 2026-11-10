# TURRET MERGE — dựng BẢNG + BIỂU ĐỒ cân bằng Vàng/Đỏ từ số đo của tools/thap-can-bang-so.js
#   python3 tools/thap-can-bang-bieudo.py <thư mục có can-bang-a.json, can-bang-b.json[, de-xuat.json]> <ra.png> [ra-bang.md]
#   Điểm mỗi kịch bản = trung bình nhân (bài A quái máu ×4, bài B quái máu ×1); điểm tổng = trung bình nhân 3 kịch bản.
import json, math, sys, os
d = sys.argv[1]; png = sys.argv[2]; md = sys.argv[3] if len(sys.argv) > 3 else None
A = json.load(open(os.path.join(d, 'can-bang-a.json'))); B = json.load(open(os.path.join(d, 'can-bang-b.json')))
gm = lambda xs: math.exp(sum(math.log(max(0.02, x)) for x in xs) / len(xs))
def med(a):
    b = sorted(a); n = len(b); return 0 if not n else b[n // 2] if n % 2 else (b[n // 2 - 1] + b[n // 2]) / 2
MUC = {1: (0.9, 1.0), 2: (1.0, 1.15), 3: (1.15, 1.35)}  # mức nên có so với trung vị bậc theo độ khó
SAI = 0.15  # dung sai phép đo
U = []
for id, a in A['u'].items():
    b = B['u'].get(id, {'kb': []})
    u = dict(id=id, ten=a['ten'], bac=a['bac'], vai=a['vai'], kho=a['kho'], lk=a['lk'], ly=a['ly'], gd=a['gd'], hc=a['hc'], pa=None)
    if len(a['kb']) == 3 and len(b['kb']) == 3:
        u['EA'] = [x['E'] for x in a['kb']]; u['EB'] = [x['E'] for x in b['kb']]
        u['E'] = [gm([x, y]) for x, y in zip(u['EA'], u['EB'])]; u['tong'] = gm(u['E'])
        u['chi'] = [x for x in a['kb']]
    u['loai'] = 'khong' if 'E' not in u or a['hc'].startswith('KHÔNG ĐO:') else 'phan' if a['hc'].startswith('KHÔNG ĐO') else 'xep'
    U.append(u)
TEN_BAC = {'vang': 'Vàng', 'do': 'Đỏ'}; VAI = {'tc': 'Tấn công', 'ht': 'Hỗ trợ', 'db': 'Đặc biệt'}
L = []; LECH = []; TV = {}
NHOM = {'tc': 'Tấn công', 'ht': 'Hỗ trợ', 'db': 'Đặc biệt (quy đổi)'}
def danhgia(u, m):
    r = u['tong'] / m; lo, hi = MUC[u['kho']]
    lechAB = max(max(a / max(0.02, b), b / max(0.02, a)) for a, b in zip(u['EA'], u['EB']))
    if lechAB > 2.5: dg = 'số đo KHÔNG ỔN ĐỊNH (bài A/B lệch ×%.1f) — chưa kết luận' % lechAB
    elif r > hi * (1 + SAI): dg = '**MẠNH LỆCH** (dễ mà mạnh)' if u['kho'] == 1 else '**vượt mức**' if u['kho'] == 2 else 'trên mức (cơ chế khó — chấp nhận, theo dõi)'
    elif r < lo * (1 - SAI): dg = '**YẾU LỆCH** (khó mà yếu)' if u['kho'] == 3 else '**yếu**'
    else: dg = 'đúng mức'
    u['r'] = r; u['dg'] = dg; u['lech'] = dg.startswith('**')
    if u['lech']: LECH.append(u)
for bac in ['do', 'vang']:
    for vai in ['tc', 'ht', 'db']:
        X = sorted([u for u in U if u['bac'] == bac and u['loai'] == 'xep' and u['vai'] == vai], key=lambda u: -u['tong'])
        if not X: continue
        if vai == 'tc': TV[bac] = med([u['tong'] for u in X])
        m = med([u['tong'] for u in X]) if (vai != 'db' and len(X) >= 3) else TV[bac]; ghi = '' if (vai != 'db' and len(X) >= 3) else ' (ít ụ → so với trung vị Tấn công cùng bậc, chỉ tham khảo)'
        L += ['', f'### {TEN_BAC[bac]} — {NHOM[vai]}: {len(X)} ụ · trung vị **{m:.2f}**{ghi}', '',
              '| # | Ụ | Khó | w20 (3★) | w40 (5★) | w60 (7★) | **Điểm tổng** | × trung vị | Mức nên có | Đánh giá |', '|---|---|---|---|---|---|---|---|---|---|']
        for i, u in enumerate(X):
            danhgia(u, m); lo, hi = MUC[u['kho']]
            L.append(f"| {i + 1} | {u['ten']} (`{u['id']}`) | {u['kho']} | " + ' | '.join(f"{e:.2f} <sub>{a:.1f}·{b:.1f}</sub>" for e, a, b in zip(u['E'], u['EA'], u['EB'])) + f" | **{u['tong']:.2f}** | {u['r']:.2f} | {lo:.2f}–{hi:.2f} | {u['dg']} |")
    P = [u for u in U if u['bac'] == bac and u['loai'] != 'xep']
    if P:
        L += ['', f'**Không xếp hạng ({TEN_BAC[bac]})** — phép đo không phản ánh giá trị chính:', '', '| Ụ | Vai | Khó | Phần đo được (w20 / w40 / w60) | Vì sao |', '|---|---|---|---|---|']
        for u in P: L.append(f"| {u['ten']} (`{u['id']}`) | {VAI[u['vai']]} | {u['kho']} | " + (' / '.join(f'{e:.2f}' for e in u['E']) if 'E' in u else '—') + f" | {u['hc']} |")
L += ['', '### Bộ test, độ khó và giả định từng ụ', '', '| Bậc | Ụ | Khó | Lý do độ khó | Bộ / cách xếp | Trạng thái tích luỹ giả định | Giới hạn |', '|---|---|---|---|---|---|---|']
for u in sorted(U, key=lambda u: (u['bac'] != 'do', u['vai'], u['id'])):
    L.append(f"| {TEN_BAC[u['bac']]} | {u['ten']} (`{u['id']}`) | {u['kho']} | {u['lk']} | {u['ly']} | {u['gd'] or '—'} | {u['hc'] or '—'} |")
if md: open(md, 'w', encoding='utf8').write('\n'.join(L) + '\n')
json.dump({'tv': TV, 'lech': [dict(id=u['id'], ten=u['ten'], bac=u['bac'], kho=u['kho'], tong=u['tong'], r=u['r'], dg=u['dg'], E=u['E']) for u in LECH],
           'tat': [dict(id=u['id'], bac=u['bac'], kho=u['kho'], tong=u.get('tong'), r=u.get('r'), loai=u['loai']) for u in U]}, open(os.path.join(d, 'tong-hop.json'), 'w'), ensure_ascii=False, indent=1)
for u in LECH: print(u['bac'], u['id'], 'kho', u['kho'], 'tong %.2f' % u['tong'], 'x%.2f' % u['r'], u['dg'])
print('trung vi', TV)
# ---------- biểu đồ ----------
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
MAU = {1: '#2a78d6', 2: '#eda100', 3: '#c8384a'}
fig, ax = plt.subplots(2, 1, figsize=(19, 11.5), gridspec_kw={'height_ratios': [1, 1.25]})
for a, bac in zip(ax, ['do', 'vang']):
    X = sorted([u for u in U if u['bac'] == bac and u['loai'] == 'xep'], key=lambda u: -u['tong']); m = TV[bac]
    DUOI = {'tc': '', 'ht': '\n(hỗ trợ)', 'db': '\n(đặc biệt)'}
    bars = a.bar(range(len(X)), [u['tong'] for u in X], color=[MAU[u['kho']] for u in X], width=0.72, zorder=3)
    a.axhline(m, color='#333', lw=1.4, ls='--', zorder=4); a.text(len(X) - 0.45, m, f' trung vị Tấn công {m:.2f}', va='bottom', ha='right', fontsize=10, color='#333')
    for i, u in enumerate(X):
        lech = u.get('lech')
        a.text(i, u['tong'], f"{u['tong']:.2f}" + ('\n▲ mạnh' if lech and u['r'] > 1 else '\n▼ yếu' if lech else ''), ha='center', va='bottom', fontsize=8.5, fontweight='bold' if lech else 'normal', color='#111')
    a.set_xticks(range(len(X))); a.set_xticklabels([u['ten'].replace(' ', '\n') + DUOI[u['vai']] for u in X], fontsize=8.5)
    a.set_ylabel('Điểm tổng (số ụ Vàng tham chiếu / ô)'); a.set_title(f"Bậc {TEN_BAC[bac]} — điểm tổng mỗi ụ trong bộ phù hợp nhất (trung bình nhân w20 · w40 · w60)", fontsize=12, loc='left')
    a.grid(axis='y', color='#ddd', zorder=0); a.set_axisbelow(True); a.spines[['top', 'right']].set_visible(False); a.set_ylim(0, max(u['tong'] for u in X) * 1.22)
    a.legend(handles=[plt.Rectangle((0, 0), 1, 1, color=MAU[k]) for k in (1, 2, 3)], labels=['Khó 1 — dễ (bắn thẳng) · nên ≈ 0.9–1.0× trung vị', 'Khó 2 — có điều kiện · nên ≈ 1.0–1.15×', 'Khó 3 — xếp chỗ / ghép chủ đích / tích luỹ · nên ≈ 1.15–1.35×'], loc='upper right', fontsize=9, frameon=False)
fig.suptitle('Astral Arsenal — cân bằng ụ Vàng / Đỏ (số hoá, so trong cùng bậc; ▲▼ = lệch so với mức nên có theo độ khó)', fontsize=13, x=0.01, ha='left')
fig.tight_layout(rect=(0, 0, 1, 0.97)); os.makedirs(os.path.dirname(png), exist_ok=True); fig.savefig(png, dpi=110)
