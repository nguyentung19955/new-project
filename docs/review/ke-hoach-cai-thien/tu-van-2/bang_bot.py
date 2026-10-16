#!/usr/bin/env python3
"""Gộp 4 tệp kết quả do_trum_cb.py (sạch trước / sau, thật trước / sau) thành bảng Markdown.
  python3 docs/review/ke-hoach-cai-thien/tu-van-2/bang_bot.py sach_cu.txt sach_moi.txt that_cu.txt that_moi.txt"""
import re, sys

TRUM = ['Nấm Chúa'] * 4 + ['Mộc Tinh'] + ['Cua Đá'] * 4 + ['Ngư Tinh'] + ['Hổ Lửa'] * 4 + ['Hồ Tinh'] + ['Cá Trê Râu Roi'] * 4 + ['Thuồng Luồng']
R = re.compile(r'^(\d)-(\d): thắng trùm (\d+)/(\d+) \((\d+)%\)(?: · máu còn TB (\d+)% · (\d+) giây)?')


def doc(p):
    o = {}
    for ln in open(p, encoding='utf-8'):
        m = R.match(ln)
        if m:
            k = (int(m[1]) - 1) * 5 + int(m[2]) - 1
            o[k] = (int(m[5]), int(m[6]) if m[6] else None, int(m[7]) if m[7] else None)
    return o


sc, sm, tc, tm = (doc(p) for p in sys.argv[1:5])
print('| Ải | Trùm | Sạch: thắng trước → sau | Sạch: thời gian hạ (s) trước → sau | Thật: thắng trước → sau | Thật: thời gian hạ (s) trước → sau | Thật: máu còn khi thắng |')
print('|---|---|---|---|---|---|---|')
for k in range(20):
    if k not in sc: continue
    f = lambda d, i: '—' if k not in d or d[k][i] is None else str(d[k][i])
    def dt(a, b):
        if k not in a or k not in b or not a[k][2] or not b[k][2]: return ''
        return f' ({(b[k][2] / a[k][2] - 1) * 100:+.0f}%)'.replace('.', ',')
    print(f"| {k // 5 + 1}-{k % 5 + 1} | {TRUM[k]} | {f(sc, 0)}% → {f(sm, 0)}% | {f(sc, 2)} → {f(sm, 2)}{dt(sc, sm)} | {f(tc, 0)}% → {f(tm, 0)}% | {f(tc, 2)} → {f(tm, 2)}{dt(tc, tm)} | {f(tc, 1)}% → {f(tm, 1)}% |")
tong = lambda d: round(sum(v[0] for v in d.values()) / max(1, len(d)))
print(f"| | **Trung bình** | {tong(sc)}% → {tong(sm)}% | | {tong(tc)}% → {tong(tm)}% | | |")
