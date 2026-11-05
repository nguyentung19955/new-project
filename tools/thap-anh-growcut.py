#!/usr/bin/env python3
"""TURRET MERGE — bảng ảnh kiểm 15 ụ grow-up: đầu thường (v2) + dạng 1/2/3 (_s1/_s2/_s3) đặt trên bệ chung như trong trận.
Mỗi hàng: tên | cỡ trong game (ô 55 px CSS @1×, bệ 71 % ô, đầu = ô × K) | phóng 3× (= điểm ảnh iPhone DPR 3).
K: đầu thường HEAD_K, dạng: STAGE_K_CHO (artscale.js). Ô viền đỏ = ảnh còn bị cờ bởi tools/thap-kt-cat-hinh.py.
Chạy: python3 tools/thap-anh-growcut.py <ra.png> [thư mục assets]
"""
import os, sys, re, json, importlib.util
from PIL import Image, ImageDraw

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = sys.argv[2] if len(sys.argv) > 2 else os.path.join(GOC, 'thap/assets')
OUT = sys.argv[1]
IDS = ['overlord', 'hopbi', 'tienhoa', 'lophanung', 'soi', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'cuuvi', 'ngaithoigian', 'ronglua', 'luoicheo']
js = open(os.path.join(GOC, 'thap/js/artscale.js'), encoding='utf-8').read()
get = lambda n: json.loads(re.search(r'window\.' + n + r' = (\{.*?\});', js).group(1))
HK, SK = get('HEAD_K'), get('STAGE_K_CHO')
spec = importlib.util.spec_from_file_location('kt', os.path.join(GOC, 'tools', 'thap-kt-cat-hinh.py'))
KT = importlib.util.module_from_spec(spec); spec.loader.exec_module(KT)

C1 = 55
DE = Image.open(os.path.join(A, 'de_chung.png')).convert('RGBA')
NEN = (24, 27, 33)


def o(ten, K, C):
    t = Image.new('RGBA', (C, C), NEN + (255,))
    SB = round(C * 0.714); de = DE.resize((SB, SB), Image.LANCZOS); t.alpha_composite(de, ((C - SB) // 2, (C - SB) // 2))
    p = os.path.join(A, ten + '.png')
    if not os.path.exists(p): return t, None
    D = round(C * K); im = Image.open(p).convert('RGBA').resize((D, D), Image.LANCZOS)
    t.alpha_composite(im, ((C - D) // 2, (C - D) // 2))  # được phép tràn ô (như trong trận) → cắt mép là do khung ô
    return t, p


def main():
    C3 = C1 * 3; lab = 120; gap = 6
    W = lab + 4 * (C1 + gap) + 20 + 4 * (C3 + gap)
    Hh = 26 + len(IDS) * (C3 + 22)
    S = Image.new('RGB', (W, Hh), (40, 44, 52)); d = ImageDraw.Draw(S)
    d.text((lab, 6), 'in game (1x): base / s1 / s2 / s3', fill=(220, 220, 220))
    d.text((lab + 4 * (C1 + gap) + 20, 6), 'zoom 3x (iPhone DPR 3): base / s1 / s2 / s3', fill=(220, 220, 220))
    for r, id_ in enumerate(IDS):
        Y = 26 + r * (C3 + 22)
        d.text((6, Y + C3 // 2 - 6), id_, fill=(255, 255, 255))
        cot = [(id_ + '_nong', HK.get(id_, 0.8))] + [(id_ + '_nong_s%d' % (i + 1), SK.get(id_, [HK.get(id_, 0.8)] * 3)[i]) for i in range(3)]
        for j, (ten, K) in enumerate(cot):
            for z, (C, X0) in enumerate(((C1, lab), (C3, lab + 4 * (C1 + gap) + 20))):
                t, p = o(ten, K, C)
                X = X0 + j * (C + gap); YY = Y + (C3 - C) // 2
                S.paste(t.convert('RGB'), (X, YY))
                if p:
                    co, _ = KT.kiem(p)
                    bad = [c for c in co if c.startswith(('cut', 'manh', 'bien'))]
                    if bad: d.rectangle([X - 1, YY - 1, X + C, YY + C], outline=(255, 60, 60), width=2)
                    if z == 1: d.text((X + 3, YY + C + 3), ten.split('_nong')[1] or 'base', fill=(170, 230, 170) if not bad else (255, 120, 120))
                elif z == 1: d.text((X + 3, YY + C + 3), '(none)', fill=(150, 150, 150))
    S.save(OUT, optimize=True)


if __name__ == '__main__': main()
