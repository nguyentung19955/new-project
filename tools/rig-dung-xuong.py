#!/usr/bin/env python3
"""Sinh rig tay cầm vũ khí (js/rigs.js, khối giữa 2 dòng đánh dấu) từ tools/rig-dung-xuong.txt.

  python3 tools/rig-dung-xuong.py        (cần: pip install shapely pillow)

Mỗi dòng txt: mã | hip | kind | pivot | tip | capsule ; capsule …  — vùng tay = hợp các khối capsule
(đoạn thẳng có bán kính), xuất ra đa giác (đã đơn giản hoá) toạ độ 0..1 theo ảnh assets/<mã>.png.
kind@k: nhân biên độ vung với k. kind = none → { hip, noArm: true }: không tách tay, chỉ nhún / lao nguyên khối (chân vẫn đứng yên).
"""
import os, re, json
from PIL import Image
from shapely.geometry import LineString
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEGIN, END = '  // <<< rig-dung-xuong (tools/rig-dung-xuong.py)', '  // >>> rig-dung-xuong'


def r4(v):
    return round(v, 4)


def build():
    out = []
    for line in open(os.path.join(ROOT, 'tools/rig-dung-xuong.txt'), encoding='utf-8'):
        note = ''
        if '#' in line:
            line, note = line.split('#', 1)
            note = note.strip()
        f = [s.strip() for s in line.split('|')]
        if len(f) < 3 or not f[0]:
            continue
        ma, hip, kind = f[0], float(f[1]), f[2]
        amp = None
        if '@' in kind:                      # kind@0.5 → thu biên độ vung (vũ khí cán dài dựng đứng)
            kind, amp = kind.split('@')
            amp = float(amp)
        W, H = Image.open(os.path.join(ROOT, 'assets', ma + '.png')).size
        e = {'hip': hip, 'kind': kind}
        if kind == 'none':
            e = {'hip': hip, 'noArm': True}
        else:
            pv = [float(v) for v in f[3].split(',')]
            tip = [float(v) for v in f[4].split(',')]
            shapes = []
            for c in f[5].split(';'):
                x1, y1, x2, y2, r = [float(v) for v in c.split(',')]
                shapes.append(LineString([(x1 * W, y1 * H), (x2 * W + 0.01, y2 * H)]).buffer(r * H, quad_segs=4))
            u = unary_union(shapes).simplify(1.2)
            if u.geom_type != 'Polygon':
                raise SystemExit(f'{ma}: các khối capsule không dính nhau ({len(u.geoms)} mảng) — sửa tools/rig-dung-xuong.txt')
            poly = [[r4(min(1, max(0, x / W))), r4(min(1, max(0, y / H)))] for x, y in list(u.exterior.coords)[:-1]]
            e.update({'pivot': pv, 'tip': tip, 'poly': poly})
            if amp:
                e['amp'] = amp
        out.append((ma, e, note))
    return out


def main():
    rigs = build()
    lines = [BEGIN]
    for ma, e, note in rigs:
        js = json.dumps(e, separators=(', ', ': ')).replace('"hip"', 'hip').replace('"kind"', 'kind').replace('"pivot"', 'pivot') \
            .replace('"tip"', 'tip').replace('"poly"', 'poly').replace('"noArm"', 'noArm').replace('"amp"', 'amp').replace('"', "'")
        lines.append(f'  {ma}: {js},' + (f'   // {note}' if note else ''))
    lines.append(END)
    p = os.path.join(ROOT, 'js/rigs.js')
    s = open(p, encoding='utf-8').read()
    block = '\n'.join(lines)
    if BEGIN in s:
        s = re.sub(re.escape(BEGIN) + r'.*?' + re.escape(END), lambda m: block, s, flags=re.S)
    else:
        s = s.replace('\n};', '\n' + block + '\n};', 1)
    open(p, 'w', encoding='utf-8').write(s)
    print(f'js/rigs.js: {len(rigs)} rig')


if __name__ == '__main__':
    main()
