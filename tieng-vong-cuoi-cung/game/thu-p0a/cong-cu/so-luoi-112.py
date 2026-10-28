#!/usr/bin/env python3
"""PH7 mục 2: ảnh so lưỡi âm thoa CŨ (15,7 px, commit 96f662c) / MỚI (17,8 px, khe 2,5 px) ở cỡ trong game (Lam ≈ 112 px) + phóng ×8.
Chỉ đọc sheet (bản cũ lấy từ git), ghi game/thu-p0a/video-am-dao/7-luoi-112px-cu-moi.png. Chạy từ gốc repo: python3 -B game/thu-p0a/cong-cu/so-luoi-112.py"""
import io, json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
CU = '96f662c'   # commit trang Âm Đao trước phản hồi 7
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)


def git(p):
    top = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], cwd=THU, text=True).strip()
    rel = os.path.relpath(os.path.join(THU, p), top)
    return subprocess.check_output(['git', 'show', '%s:%s' % (CU, rel)], cwd=top)


def bo(cu):
    if cu: return Image.open(io.BytesIO(git('am-dao/lam-hanh-dong-am-dao-2x.png'))).convert('RGBA'), json.loads(git('am-dao/lam-hanh-dong-am-dao-2x.json'))
    return Image.open(os.path.join(THU, 'am-dao/lam-hanh-dong-am-dao-2x.png')).convert('RGBA'), json.load(open(os.path.join(THU, 'am-dao/lam-hanh-dong-am-dao-2x.json'), encoding='utf-8'))


def khung(im, m, ten):
    f = [f for f in m['frames'] if f['ten'] == ten][0]
    c = im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    return c.resize((round(c.width / 2), round(c.height / 2)), Image.LANCZOS), f   # sheet 2x → cỡ game


out = Image.new('RGBA', (1500, 470), (58, 62, 70, 255)); d = ImageDraw.Draw(out)
x = 10
for nhan, cu in (('CŨ 15,7 px', True), ('MỚI 17,8 px', False)):
    im, m = bo(cu)
    for ten in ('nghi', 'c1-trung', 'c3-trung'):
        g, _ = khung(im, m, ten); out.alpha_composite(g, (x, 30)); d.text((x, 8), '%s · %s' % (nhan, ten), font=F, fill=(255, 230, 180)); x += max(g.width, 160) + 12
    x += 14
x = 10
for nhan, cu in (('CŨ', True), ('MỚI', False)):
    im, m = bo(cu); g, f = khung(im, m, 'c1-trung'); L = m['luoi']['c1-trung']; ax, ay = f['ax'] / 2, f['ay'] / 2
    gx, gy, mx = ax + L['goc'][0], ay + L['goc'][1], ax + L['mui'][0]
    z = g.crop((int(gx - 8), int(gy - 14), int(mx + 8), int(gy + 14))); z = z.resize((z.width * 8, z.height * 8), Image.NEAREST)
    out.alpha_composite(z, (x, 205)); d.text((x, 185), '%s · c1-trung: lưỡi ở cỡ game, phóng ×8 (nearest)' % nhan, font=F, fill=(255, 230, 180)); x += max(z.width, 420) + 30
dst = os.path.join(THU, 'video-am-dao', '7-luoi-112px-cu-moi.png'); out.convert('RGB').save(dst); print('ghi', dst)
