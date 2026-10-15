#!/usr/bin/env python3
"""Ảnh soát TĨNH xem-truyen.png (KHÔNG chạy game): mỗi trang truyện mới = ảnh nền (game/art/truyen, khung đầu Ken Burns phóng 1,02)
+ dải tối + chữ, dựng lại đúng bố cục js/truyen.js (DAI: lề 20, rộng 440, đáy 265; cỡ 9,5 → 8 khi quá 3 dòng; tên người nói 8,5 đậm),
cả tiếng Việt và tiếng Anh (game/js/ngon_ngu_en.js). Chữ đo bằng phông DejaVu Sans (máy dựng không có Be Vietnam Pro) và ghi
bề rộng dòng dài nhất so với 440 để soát tràn. Trang nào chưa có ảnh thì ghi "nền code cũ + khung thoại cũ" (nay đủ 7 ảnh).

  python3 docs/review/ke-hoach-cai-thien/canh-truyen/dung-xem-truyen.py
"""
import json
import os
import subprocess

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
JS = os.path.join(ROOT, 'game', 'js')
ART = os.path.join(ROOT, 'game', 'art', 'truyen')
K = 4 / 3  # ô 640×360 = cỡ game 480×270 phóng 4/3
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
ANH = {'cayda': 'b1-trong-vo-cay-da-ua', 'yeu': 'b2-ba-yeu-tinh', 'song': 'b2b-bong-duoi-song', 'emBe': 'b3-ba-ban-bi-bat',
       'cuti': 'b4-trao-vu-khi', 'hoi': 'b5-hoi-lang', 'lang': 'b6-nen-lang'}
TEN = {'do': 'Cụ Đồ', 'lai': 'Chú Lái Đò', 'hunter': 'Cu Tèo', 'healer': 'Cái Bống', 'wrestler': 'Cu Lì'}

NODE = r'''
const fs = require('fs'); const s = fs.readFileSync(process.argv[1] + '/truyen.js', 'utf8');
const lay = (ten) => { const i = s.indexOf('const ' + ten + ' = ['); let d = 0, j = s.indexOf('[', i);
  for (let k = j; k < s.length; k++) { if (s[k] === '[') d++; else if (s[k] === ']') { d--; if (!d) return eval(s.slice(j, k + 1)); } } };
global.window = { G: { ngonNgu: { them: (o) => { global.EN = o; } } } }; global.G = window.G;
require(process.argv[1] + '/ngon_ngu_en.js');
console.log(JSON.stringify({ MO: lay('MO_DAU_MOI'), VUNG: lay('VUNG_MOI'), KET: lay('KET_MOI'), EN: global.EN }));
'''


def main():
    d = json.loads(subprocess.check_output(['node', '-e', NODE, JS]))
    en = d['EN']
    td = ['Trống đồng vỡ', 'Ba yêu tinh', 'Bóng dưới sông', 'Bị bắt', 'Lên đường']
    trang = [dict(f, tieuDe=td[i], nhom='Mở đầu %d' % (i + 1)) for i, f in enumerate(d['MO'])]
    for r, v in enumerate(d['VUNG']):
        trang += [dict(f, nen='lang', nhom='Kết vùng %d · %d' % (r + 1, i + 1)) for i, f in enumerate(v)]
    trang += [dict(f, nhom='Đoạn kết %d' % (i + 1)) for i, f in enumerate(d['KET'])]
    cot = 4
    W, H = int(480 * K), int(270 * K)
    hang = (len(trang) * 2 + cot - 1) // cot
    out = Image.new('RGB', (cot * W + (cot + 1) * 8, hang * (H + 26) + 8 + 40), (20, 18, 24))
    dr0 = ImageDraw.Draw(out)
    dr0.text((10, 10), 'xem-truyen.png — ảnh soát tĩnh (không chạy game): ảnh + dải tối + chữ ở cỡ game ×4/3, VI | EN. Phông đo: DejaVu Sans.',
             font=ImageFont.truetype(FONT, 16), fill=(246, 220, 146))
    bao = []
    o = 0
    for f in trang:
        for lg in ('vi', 'en'):
            loi = f['loi'] if lg == 'vi' else en.get(f['loi'], '!!! THIẾU BẢN DỊCH: ' + f['loi'])
            ten = TEN.get(f.get('ai')) if f.get('ai') else None
            if ten and lg == 'en':
                ten = en.get(ten, ten)
            img, w = o_trang(f, loi, ten, lg, en)
            x, y = 8 + (o % cot) * (W + 8), 48 + (o // cot) * (H + 26)
            out.paste(img, (x, y))
            nhan = '%s · %s · dòng dài nhất %.0f/440%s' % (f['nhom'], lg.upper(), w, '  ← TRÀN' if w > 440 else '')
            dr0.text((x + 2, y + H + 4), nhan, font=ImageFont.truetype(FONT, 13), fill=(255, 120, 100) if w > 440 else (200, 200, 190))
            bao.append((f['nhom'], lg, w))
            o += 1
    p = os.path.join(HERE, 'xem-truyen.png')
    out.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(p, optimize=True)  # 256 màu cho nhẹ repo
    print('Đã ghi', os.path.relpath(p, ROOT), out.size)
    print('Dòng dài nhất mọi trang: %.1f / 440 (VI %.1f, EN %.1f)' % (max(b[2] for b in bao), max(b[2] for b in bao if b[1] == 'vi'), max(b[2] for b in bao if b[1] == 'en')))


def wrap(s, maxw, font):
    lines, cur = [], ''
    for wd in s.split(' '):
        t = cur + ' ' + wd if cur else wd
        if font.getlength(t) / K > maxw and cur:
            lines.append(cur); cur = wd
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


def o_trang(f, loi, ten, lg, en):
    W, H = int(480 * K), int(270 * K)
    tep = os.path.join(ART, ANH.get(f.get('nen') or 'lang', '') + '.webp')
    co = os.path.isfile(tep)
    if co:
        im = Image.open(tep).convert('RGB')
        s = 1.02  # khung đầu Ken Burns
        im = im.resize((int(W * s), int(H * s)), Image.LANCZOS)
        im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
    else:
        im = Image.new('RGB', (W, H), (40, 34, 44))
    im = im.convert('RGBA')
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(lay)
    if not co:
        dr.text((W // 2, H // 2 - 20), 'chưa có ảnh %s → nền vẽ code cũ + khung thoại cũ' % ANH[f['nen']], font=ImageFont.truetype(FONT, 15), fill=(230, 220, 200), anchor='mm')
    size = 9.5
    fnt = ImageFont.truetype(FONT, round(size * K))
    lines = wrap(loi, 440, fnt)
    while len(lines) > 3 and size > 8:
        size -= 0.5; fnt = ImageFont.truetype(FONT, round(size * K)); lines = wrap(loi, 440, fnt)
    lh, hTen = size + 4, 12 if ten else 0
    h = hTen + size + 2 + (len(lines) - 1) * lh + 6
    y0 = 265 - h
    if co:  # dải tối như veDai
        for yy in range(int((y0 - 26) * K), H):
            p = (yy / K - (y0 - 26)) / (270 - (y0 - 26))
            a = 0.6 * p / 0.3 if p < 0.3 else 0.6 + (0.88 - 0.6) * (p - 0.3) / 0.7
            dr.line([(0, yy), (W, yy)], fill=(8, 6, 12, int(255 * max(0, min(1, a)))))
        for yy in range(int(46 * K)):
            dr.line([(0, yy), (W, yy)], fill=(8, 6, 12, int(255 * 0.55 * (1 - yy / (46 * K)))))
    im = Image.alpha_composite(im, lay)
    dr = ImageDraw.Draw(im)
    if ten:
        dr.text((20 * K, (y0 + 9) * K), ten, font=ImageFont.truetype(FONTB, round(8.5 * K)), fill=(246, 220, 146), anchor='ls')
    wmax = 0
    for k, l in enumerate(lines):
        by = (y0 + hTen + size + 2 + k * lh) * K
        dr.text((20 * K + 0.8, by + 0.8), l, font=fnt, fill=(0, 0, 0), anchor='ls')
        dr.text((20 * K, by), l, font=fnt, fill=(246, 239, 220), anchor='ls')
        wmax = max(wmax, fnt.getlength(l) / K)
    tip = en.get('Chạm để tiếp ›', 'Tap to continue ›') if lg == 'en' else 'Chạm để tiếp ›'
    dr.text((462 * K, (y0 - 5) * K), tip, font=ImageFont.truetype(FONT, round(7.5 * K)), fill=(246, 220, 146), anchor='rs')
    if f.get('tieuDe'):
        t = f['tieuDe'] if lg == 'vi' else en.get(f['tieuDe'], f['tieuDe'])
        dr.text((240 * K, 34 * K), t, font=ImageFont.truetype(FONTB, round(10 * K)), fill=(246, 220, 146), anchor='ms')
    return im.convert('RGB'), wmax


if __name__ == '__main__':
    main()
