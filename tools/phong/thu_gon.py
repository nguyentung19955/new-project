#!/usr/bin/env python3
"""Thu gọn phông chủ đề Talesworn (phiên E, 05/11/2026) từ bản gốc google/fonts thành game/art/phong/*.woff2.

Lấy bản gốc (npm / pip có thể bị chặn, dùng git sparse clone):
  git clone --depth 1 --filter=blob:none --sparse https://github.com/google/fonts.git /tmp/gfonts
  cd /tmp/gfonts && git sparse-checkout set ofl/grenzegotisch ofl/alegreyasans ofl/silkscreen
Chạy:   python3 tools/phong/thu_gon.py /tmp/gfonts/ofl     rồi   python3 tools/phong/dung_phong.py
Cần: fontTools + brotli (pip install fonttools brotli).

Các bước:
  - Grenze Gotisch là phông biến thiên (trục wght) → cố định nét 700;
  - Alegreya Sans và Grenze Gotisch mặc định dùng SỐ KIỂU CŨ (cao thấp lệch nhau: 0 1 2 thấp như chữ thường) → đổi bảng ký tự cho 0–9 trỏ thẳng vào
    số thẳng hàng (glyph *.lf của tính năng lnum): canvas không bật được tính năng phông nên phải đổi ngay trong tệp;
  - chỉ giữ các ký tự game cần: Latin cơ bản, Latin-1, đủ chữ tiếng Việt (ă â đ ê ô ơ ư + 5 dấu, cả hoa), dấu nối, ngoặc kép, …, mũi tên,
    ≤ ≥ ≈ ≠ − ₫ (Silkscreen: chỉ Latin cơ bản + Latin-1 + × −).
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'game', 'art', 'phong')
U_VI = ('U+0020-007E,U+00A0-00FF,U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0303,U+0309,U+0323,'
        'U+1EA0-1EF9,U+2010-2027,U+2030-203A,U+2190-2195,U+2212,U+2248,U+2260,U+2264-2265,U+20AB')
U_SO = 'U+0020-007E,U+00A0-00FF,U+00D7,U+2212'


def so_thang(font):
    """0–9 → glyph số thẳng hàng (lnum) nếu phông có."""
    cm = font.getBestCmap()
    gsub = font['GSUB'].table if 'GSUB' in font else None
    if not gsub:
        return
    m = {}
    for fr in gsub.FeatureList.FeatureRecord:
        if fr.FeatureTag != 'lnum':
            continue
        for li in fr.Feature.LookupListIndex:
            for st in gsub.LookupList.Lookup[li].SubTable:
                mp = getattr(st, 'mapping', None) or getattr(getattr(st, 'ExtSubTable', None), 'mapping', None)
                if mp:
                    m.update(mp)
    for t in font['cmap'].tables:
        for c in '0123456789':
            g = t.cmap.get(ord(c))
            if g in m:
                t.cmap[ord(c)] = m[g]


def thu(font, unicodes, ra):
    opt = subset.Options()
    opt.flavor = 'woff2'
    opt.layout_features = ['kern', 'liga', 'ccmp', 'mark', 'mkmk', 'locl']
    opt.hinting = False
    opt.desubroutinize = True
    s = subset.Subsetter(options=opt)
    s.populate(unicodes=subset.parse_unicodes(unicodes))
    s.subset(font)
    subset.save_font(font, os.path.join(OUT, ra), opt)
    print('%-28s %6d byte' % (ra, os.path.getsize(os.path.join(OUT, ra))))


def main():
    ofl = sys.argv[1] if len(sys.argv) > 1 else '/tmp/gfonts/ofl'
    os.makedirs(OUT, exist_ok=True)
    gg = instancer.instantiateVariableFont(TTFont(os.path.join(ofl, 'grenzegotisch', 'GrenzeGotisch[wght].ttf')), {'wght': 700})
    so_thang(gg)
    thu(gg, U_VI, 'grenze-gotisch-700.woff2')
    for net, ten in (('500', 'Medium'), ('700', 'Bold')):
        f = TTFont(os.path.join(ofl, 'alegreyasans', 'AlegreyaSans-%s.ttf' % ten))
        so_thang(f)
        thu(f, U_VI, 'alegreya-sans-%s.woff2' % net)
    thu(TTFont(os.path.join(ofl, 'silkscreen', 'Silkscreen-Bold.ttf')), U_SO, 'silkscreen-700.woff2')


if __name__ == '__main__':
    main()
