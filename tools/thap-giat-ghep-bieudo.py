#!/usr/bin/env python3
# TURRET MERGE — biểu đồ trước/sau (tuvan/giat-ghep): thời gian khung vẽ + bước luật theo bước trận, SOLO / CO-OP / PVP,
# từ docs/demo-hop-tuong/tuvan/giat-ghep/do-truoc.json và do-sau.json (tools/thap-do-giat-ghep.js NHAN=truoc|sau).
# Ra: bieu-do-khung.png (đường thời gian khung, cửa sổ trượt max 30 bước) + bieu-do-lan-dau.png (ra chiêu lần đầu, cột trước/sau)
#     + BUOC-MAX.md (bảng p50/p95/max + 10 khung chậm nhất mỗi chế độ, kèm việc nặng đo được).
# python3 tools/thap-giat-ghep-bieudo.py [thư mục]
import json, sys, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

D = sys.argv[1] if len(sys.argv) > 1 else 'docs/demo-hop-tuong/tuvan/giat-ghep/'
T = json.load(open(os.path.join(D, 'do-truoc.json')))
S = json.load(open(os.path.join(D, 'do-sau.json')))
C_TRUOC, C_SAU, C_NGUONG = '#c0504d', '#2f7ed8', '#888888'

def cuaso_max(a, k=30):
    return [max(a[max(0, i - k):i + 1]) for i in range(len(a))]

def tran(d, che):
    for r in d.get('tran', []):
        if r['che'] == che: return r
    return None

CHE = [c for c in ['solo', 'coop', 'pvp'] if tran(T, c) and tran(S, c)]
if CHE:
    fig, ax = plt.subplots(len(CHE), 1, figsize=(11, 3.1 * len(CHE)), sharex=True)
    if len(CHE) == 1: ax = [ax]
    for a, che in zip(ax, CHE):
        for d, mau, ten in [(T, C_TRUOC, 'trước'), (S, C_SAU, 'sau')]:
            r = tran(d, che); v = [x + y for x, y in zip(r['dayVe'], r['dayBuoc'])]
            a.plot(cuaso_max(v), color=mau, lw=0.9, label=f"{ten}: p95 {r['ve']['p95']:.1f} · max khung {r['ve']['max']:.0f} · max bước {r['buoc']['max']:.0f} ms")
        a.axhline(120, color=C_NGUONG, ls='--', lw=0.8); a.text(5, 123, '120 ms', color=C_NGUONG, fontsize=8)
        a.set_ylabel('ms / bước (luật + vẽ)'); a.set_title(f'{che.upper()} — bộ nặng ghép đặc biệt, 3×, wave 8→14 (iPhone 13, CPU ×4)', fontsize=10, loc='left')
        a.legend(fontsize=8, loc='upper right', frameon=False); a.set_ylim(0, max(140, a.get_ylim()[1])); a.spines[['top', 'right']].set_visible(False)
    ax[-1].set_xlabel('bước trận (1/60 s) — đường = max trong 30 bước gần nhất')
    fig.tight_layout(); fig.savefig(os.path.join(D, 'bieu-do-khung.png'), dpi=110); plt.close(fig)

# ra chiêu lần đầu
def lan_dau(d):
    m = {}
    for r in d.get('lanDau', []):
        for x in r['ds']:
            k = r['che'] + ' ' + x['loai'] + ' ' + x['id']
            m[k] = max(x['lam'], x['maxBuoc'] + x['maxVe'])
    return m
LT, LS = lan_dau(T), lan_dau(S)
K = [k for k in LT if k in LS]
if K:
    K.sort(key=lambda k: -max(LT[k], LS[k]))
    K = K[:30]
    fig, a = plt.subplots(figsize=(11, 0.28 * len(K) + 1.4))
    y = list(range(len(K)))
    a.barh([i + 0.2 for i in y], [LT[k] for k in K], height=0.4, color=C_TRUOC, label='trước')
    a.barh([i - 0.2 for i in y], [LS[k] for k in K], height=0.4, color=C_SAU, label='sau')
    a.set_yticks(y); a.set_yticklabels(K, fontsize=7); a.invert_yaxis()
    a.axvline(120, color=C_NGUONG, ls='--', lw=0.8)
    a.set_xlabel('ms — khung nặng nhất trong 1,5 s sau khi ra (bước luật + vẽ), iPhone 13, CPU ×4')
    a.set_title('Ra chiêu / ghép đặc biệt / chỉ huy / trùm LẦN ĐẦU — 30 việc nặng nhất', fontsize=10, loc='left')
    a.legend(fontsize=8, frameon=False); a.spines[['top', 'right']].set_visible(False)
    fig.tight_layout(); fig.savefig(os.path.join(D, 'bieu-do-lan-dau.png'), dpi=110); plt.close(fig)

# bảng
L = ['# Bước / khung chậm nhất — trước và sau (tools/thap-do-giat-ghep.js, iPhone 13, CPU ×4)', '',
     'Số đo: 1 trận/chế độ, bộ nặng ghép đặc biệt, tốc 3×, wave 8 → ~14 (qua Mad Crown wave 10), bot ghép đặc biệt 90 %. "Bước" = 1 bước luật 1/60 s; "khung" = 1 lần vẽ.', '',
     '| Chế độ | Bản | bước p95 | bước max | khung p50 | khung p95 | khung max | khung > 60 ms | > 120 ms |', '|---|---|---|---|---|---|---|---|---|']
for che in CHE:
    for d, ten in [(T, 'trước'), (S, 'sau')]:
        r = tran(d, che); v = r['dayVe'][180:]
        L.append(f"| {che.upper()} | {ten} | {r['buoc']['p95']} | {r['buoc']['max']:.1f} | {r['ve']['p50']} | {r['ve']['p95']} | {r['ve']['max']:.1f} | {sum(1 for x in v if x > 60)} | {sum(1 for x in v if x > 120) + sum(1 for x in r['dayBuoc'][180:] if x > 120)} |")
for che in CHE:
    for d, ten in [(T, 'trước'), (S, 'sau')]:
        r = tran(d, che)
        L += ['', f'## {che.upper()} — {ten}: 10 bước/khung chậm nhất', '']
        for s in r['cham'][:10]:
            viec = ' · '.join(' '.join(str(z) for z in v) for v in s['viec'][:5]) or '—'
            cpu = ' · '.join(s.get('cpu', [])[:3]) or '—'
            L.append(f"- {s['loai']} #{s['i']} **{s['ms']} ms** (wave {s['wave']}) — sự kiện: {' ; '.join(s['nk'][-2:])}  \n  việc nặng: {viec}  \n  CPU: {cpu}")
L += ['', '## Ra chiêu lần đầu (ms, khung nặng nhất trong 1,5 s sau khi ra)', '', '| Việc | trước | sau |', '|---|---|---|']
for k in K: L.append(f'| {k} | {LT[k]:.1f} | {LS[k]:.1f} |')
open(os.path.join(D, 'BUOC-MAX.md'), 'w').write('\n'.join(L) + '\n')
print('ok', D)
