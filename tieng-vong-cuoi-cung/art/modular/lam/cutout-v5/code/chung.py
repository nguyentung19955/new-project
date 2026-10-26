"""Tiện ích dùng chung v4: font có fallback, đường dẫn tương đối theo vị trí file (chạy độc lập)."""
import os
from PIL import ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
_FONT_DIRS = ['/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/dejavu', '/usr/share/fonts/TTF',
              '/Library/Fonts', '/System/Library/Fonts/Supplemental', 'C:/Windows/Fonts', HERE]


def font(size, bold=False):
    names = (['DejaVuSans-Bold.ttf', 'Arial Bold.ttf', 'arialbd.ttf'] if bold
             else ['DejaVuSans.ttf', 'Arial.ttf', 'arial.ttf'])
    for d in _FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.isfile(p):
                try:
                    return ImageFont.truetype(p, size)
                except OSError:
                    pass
    try:
        return ImageFont.load_default(size=size)     # Pillow ≥ 10.1
    except TypeError:
        return ImageFont.load_default()
