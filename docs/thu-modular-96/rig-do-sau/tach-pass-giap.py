#!/usr/bin/env python3
"""Tách sprite giáp thành nửa sau/trước (giữ nguyên canvas và neo).

Chạy độc lập hoặc được gọi tự động bởi tao-rig.py. Mỗi ảnh gốc vẫn được giữ.
Các phần tách chỉ thay alpha; không co/giãn, không cắt canvas, không đổi neo.
"""
import json
import os
from pathlib import Path

from PIL import Image, ImageDraw

RIG = Path(__file__).resolve().parent

BASE = [
    'giap-vai', 'giap-cang-tay', 'giap-ong-chan',
    'chup-vai', 'chup-khuyu', 'chup-goi',
]
GEN = BASE + ['giap-nguc']
MANIFEST = RIG / '.tach-pass-manifest.json'


def rgba_color(hex_color, fallback):
    try:
        h = hex_color.lstrip('#')
        rgb = tuple(bytes.fromhex(h))
        return rgb + ((255,) if len(rgb) == 3 else ())
    except Exception:
        return fallback


def widen_joint_caps(folder: Path, names, palette=None):
    """Make a pixel-art joint cap with an opaque 5x5 core (selfCheck radius=2)."""
    palette = palette or {}
    outline = rgba_color(palette.get('outline'), (5, 4, 3, 255))
    shade = rgba_color(palette.get('dark'), (55, 43, 39, 255))
    mid = rgba_color(palette.get('metal'), (116, 130, 147, 255))
    light = rgba_color(palette.get('light'), (224, 199, 166, 255))
    accent = rgba_color(palette.get('accent'), (221, 137, 64, 255))
    # Central 5×5 is fully opaque so every body pixel tested within radius 2 is covered.
    # Outer pixels form a beveled pixel-art rim. Canvas is 7×7, anchor center = 3.5.
    rows = {
        'chup-vai': ["..OOO..", ".OMLMO.", "OMMAMO", "OMAMMO", "OMMAMO", ".OMLMO.", "..OOO.."],
        'chup-khuyu': ["..OOO..", ".OSSSO.", "OSSSSO", "OSSSSO", "OSSSSO", ".OSSSO.", "..OOO.."],
        'chup-goi': ["..OOO..", ".OMLMO.", "OMMAMO", "OMAMMO", "OMMAMO", ".OMLMO.", "..OOO.."],
    }
    # Extend strings with edge pixels where needed; each core row is solid across x=1..5.
    colors = {'O': outline, 'S': mid, 'M': shade, 'L': light, 'A': accent, '.': (0, 0, 0, 0)}
    for name in names:
        path = folder / f'{name}.png'
        if not path.exists():
            continue
        grid = rows[name]
        im = Image.new('RGBA', (7, 7), (0, 0, 0, 0))
        px = im.load()
        for y, row in enumerate(grid):
            row = row.ljust(7, '.')[:7]
            for x, ch in enumerate(row):
                px[x, y] = colors[ch]
        im.save(path)
    return [3.5, 3.5]


def split_image(src: Path, mode: str):
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    back = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    front = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if mode == 'chest':
        # Neck/collar end is the local anchorStart (left). Put its first 30% behind the torso/head.
        cut = max(1, min(w - 1, round(w * 0.30)))
        back.paste(im.crop((0, 0, cut, h)), (0, 0))
        front.paste(im.crop((cut, 0, w, h)), (cut, 0))
    else:
        # Bone sprites run along x. Split thickness (y), not length (x): same anchors in both passes.
        cut = max(1, min(h - 1, h // 2))
        back.paste(im.crop((0, 0, w, cut)), (0, 0))
        front.paste(im.crop((0, cut, w, h)), (0, cut))
    # Preserve exact RGBA canvas dimensions and original pixel coordinates.
    stem = src.stem
    back.save(src.with_name(stem + '-back.png'))
    front.save(src.with_name(stem + '-front.png'))


def pad_bone(src: Path, pad: int, manifest):
    """Extend each opaque scanline past both anchors without scaling its pixels."""
    key = src.relative_to(RIG).as_posix()
    old = Image.open(src).convert('RGBA')
    recorded = manifest.get(key, {})
    if list(old.size) == recorded.get('resultSize'):
        return False
    w, h = old.size
    out = Image.new('RGBA', (w + 2 * pad, h), (0, 0, 0, 0))
    out.paste(old, (pad, 0))
    a = old.getchannel('A')
    pix, srcpix = out.load(), old.load()
    for y in range(h):
        xs = [x for x in range(w) if a.getpixel((x, y))]
        if not xs:
            continue
        left, right = xs[0], xs[-1]
        for d in range(pad):
            pix[pad - d - 1, y] = srcpix[left, y]
            pix[pad + w + d, y] = srcpix[right, y]
    out.save(src)
    manifest[key] = {'sourceSize': [w, h], 'resultSize': [w + 2 * pad, h], 'padding': pad}
    return True


def main():
    base_dir = RIG / 'giap'
    gen_dir = RIG / 'giap-gen'
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8')) if MANIFEST.exists() else {}
    widen_joint_caps(base_dir, ['chup-vai', 'chup-khuyu', 'chup-goi'])
    gen = json.loads((gen_dir / 'gen.json').read_text(encoding='utf-8'))
    palette = {p.get('role'): p.get('rgb') for p in gen.get('palette', [])}
    anchors = widen_joint_caps(gen_dir, ['chup-vai', 'chup-khuyu', 'chup-goi'], {
        'outline': palette.get('viền'), 'dark': palette.get('thép/tối'),
        'metal': palette.get('thép/tối'), 'light': palette.get('đồng'), 'accent': palette.get('đồng'),
    })
    for cap in ['chup-vai', 'chup-khuyu', 'chup-goi']:
        if cap in gen.get('pieces', {}):
            gen['pieces'][cap]['anchor'] = anchors
    # Keep X2 cap sheet exactly 2× for the existing large-preview mode.
    for cap in ['chup-vai', 'chup-khuyu', 'chup-goi']:
        im = Image.open(gen_dir / f'{cap}.png').convert('RGBA')
        im.resize((14, 14), Image.Resampling.NEAREST).save(gen_dir / f'{cap}-x2.png')
    if not gen.get('rigAnchorPad'):
        for name in GEN:
            g = gen.get('pieces', {}).get(name)
            if g and 'anchorStart' in g:
                g['anchorStart'][0] += 2
                g['anchorEnd'][0] += 2
        gen['rigAnchorPad'] = 2
    (gen_dir / 'gen.json').write_text(json.dumps(gen, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')

    # Pad source sprites before making the two depth passes. x2 source gets 4 pixels per end.
    for name in [n for n in BASE if not n.startswith('chup-')]:
        pad_bone(base_dir / f'{name}.png', 2, manifest)
    for name in [n for n in GEN if not n.startswith('chup-')]:
        pad_bone(gen_dir / f'{name}.png', 2, manifest)
        x2 = gen_dir / f'{name}-x2.png'
        if x2.exists():
            pad_bone(x2, 4, manifest)

    for name in BASE:
        split_image(base_dir / f'{name}.png', 'bone' if not name.startswith('chup-') else 'cap')
    for name in GEN:
        split_image(gen_dir / f'{name}.png', 'chest' if name == 'giap-nguc' else ('bone' if not name.startswith('chup-') else 'cap'))
        x2 = gen_dir / f'{name}-x2.png'
        if x2.exists():
            split_image(x2, 'chest' if name == 'giap-nguc' else ('bone' if not name.startswith('chup-') else 'cap'))
    # Also split the four full-resolution source cutouts. They remain archival assets and are not loaded by the rig.
    for name in ['giap-vai', 'giap-cang-tay', 'giap-ong-chan', 'giap-nguc']:
        src = gen_dir / f'goc-{name}.png'
        if src.exists():
            split_image(src, 'chest' if name == 'giap-nguc' else 'bone')
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('Tách xong pass sau/trước; giữ canvas và neo; chụp khớp 7×7, neo (3.5,3.5).')


if __name__ == '__main__':
    main()
