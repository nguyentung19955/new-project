#!/usr/bin/env python3
"""KIẾM NẶNG — ảnh soát (17/10). KHÔNG chạy game bằng tay: lưới dựng từ tấm game (như cam-vk-chuan), GIF dựng từ tệp quay headless (quay.py).
Chạy từ gốc repo:
  python3 docs/review/ke-hoach-cai-thien/kiem-nang/soat.py <truoc.npz> <sau.npz> [<thư mục chan-di-danh/quay.py chỉ 'kiem'>]
    truoc.npz = quay.py trên bản dist trước phiên này (git show HEAD~:game/dist/linh-khi.html), sau.npz = bản mới.
Ra (thư mục này):
  luoi-kiem-nang.png        10 khung × 4 cấp kiếm, ×3, ★ = khung chạm, vạch xanh = mặt đất, vạch vàng = bàn chân trước lúc đứng
  combo-vet-x1.gif / -x3.gif  combo 3 nhát có vệt chém (khung cắt từ màn trận thật), đúng thời lượng (50 hình/giây), kiếm cấp 1
  combo-vet-cap4-x3.gif     như trên, kiếm cấp 4 (Thức tỉnh, hệ băng)
  truoc-sau-x3.gif          Cu Tí riêng: trái TRƯỚC (hàng kiếm cũ), phải SAU (kiếm nặng); trên cấp 1, dưới cấp 4; đúng thời lượng
  ghep-eo.png               vừa chạy / đi vừa chém: nhát 1, 2 ghép thân trên (tới đai) lên chân chạy / đi; nhát 3 toàn thân
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'cam-vk-chuan'))
import do_cam as DC  # noqa: E402
import luoi as L  # noqa: E402
import soat as SV  # noqa: E402

HANG = [('kiem_1~kn', 4, 3), ('kiem_2~kn', 3, 1), ('kiem_3~kn', 3, 1)]   # (khoá, số khung, khung ★ đếm từ 0)
CAP = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh']


def chan_truoc_dung(T):
    """Tâm bàn chân trước (ô 96) của hàng đứng mới khung 1 (khối phải ở 6 hàng đáy)."""
    a = np.array(T['_img'].crop((0, T['dong_tac']['dung~16']['hang'] * 96, 96, T['dong_tac']['dung~16']['hang'] * 96 + 96)))[..., 3] > 0
    cols = np.nonzero(a[84:90].any(0))[0]
    k = int(np.argmax(np.diff(cols)))
    return (cols[k + 1:].min() + cols[k + 1:].max()) / 2


def luoi():
    T = DC.VZ.tai('zed-moi'); V = DC.VZ.tai('zed-vk')
    sua = SV.lam_sua(T, SV.doc_bang())
    Z, P = 3, DC.VZ.PAD * 3
    X0, X1, Y0, Y1 = -14, 116, -34, 100    # vùng cắt (ô 96): kiếm giơ cao khung 4–5 không bị cắt
    cw, ch = (X1 - X0) * Z, (Y1 - Y0) * Z
    xc = chan_truoc_dung(T)
    nhan_w, top = 96, 40
    out = Image.new('RGBA', (nhan_w + 10 * cw, top + 4 * ch), (34, 38, 48, 255))
    d = ImageDraw.Draw(out)
    d.text((6, 4), 'Kiếm nặng — 10 khung × 4 cấp kiếm (×3). ★ = khung chạm (u 0,45). Vạch xanh = mặt đất, vạch vàng = bàn chân trước lúc đứng.',
           fill=(235, 235, 235), font=L.F)
    c = 0
    for k, so, sao in HANG:
        for i in range(so):
            nh = 'khung %d%s · nhát %d' % (c + 1, ' ★' if i == sao else '', HANG.index((k, so, sao)) + 1)
            d.text((nhan_w + c * cw + 4, 22), nh, fill=(255, 220, 90) if i == sao else (210, 210, 210), font=L.F)
            for cap in range(4):
                nc = sua(k, i, cap)
                neo, cam = nc if nc else (None, None)
                im, chu, info = DC.dung(T, V, k, i, cap, neo, cam, Z=Z)
                o = Image.new('RGBA', (cw, ch), (52, 58, 72, 255))
                o.alpha_composite(im.crop((P + X0 * Z, P + Y0 * Z, P + X1 * Z, P + Y1 * Z)))
                q = ImageDraw.Draw(o)
                yd = (90 - Y0) * Z
                q.line([(0, yd), (cw, yd)], fill=(90, 220, 110, 255), width=1)
                xf = (xc - X0) * Z
                q.line([(xf, yd - 8), (xf, yd + 6)], fill=(255, 220, 60, 255), width=2)
                if i == sao:
                    q.rectangle([0, 0, cw - 1, ch - 1], outline=(255, 220, 90, 255), width=2)
                out.alpha_composite(o, (nhan_w + c * cw, top + cap * ch))
            c += 1
    for cap in range(4):
        d.text((6, top + cap * ch + ch // 2 - 8), 'cấp %d\n%s' % (cap + 1, CAP[cap]), fill=(230, 230, 230), font=L.F)
    out.convert('RGB').save(os.path.join(HERE, 'luoi-kiem-nang.png'), optimize=True)
    print('Ghi luoi-kiem-nang.png', out.size)


def doc(p):
    z = np.load(p)
    return z, json.loads(str(z['so']))


def chon_nhip(n):
    """60 nhịp/giây → 50 hình/giây (bỏ 1 nhịp mỗi 6), mỗi hình 20 ms."""
    return [k for k in range(n) if k % 6 != 5]


def gif(frames, p, ms=20):
    pal = [f.convert('RGB').quantize(192, dither=Image.Dither.NONE) for f in frames]
    pal[0].save(p, save_all=True, append_images=pal[1:], duration=ms, loop=0, optimize=True)
    print('Ghi', os.path.basename(p), len(frames), 'hình', os.path.getsize(p) // 1024, 'KB')


def gif_man(sau, ten, cap='0', to=3):
    z, so = sau
    m = z['m' + cap]
    ks = chon_nhip(len(m))
    fr = []
    for k in ks:
        a = m[k][::2, ::2]  # canvas thế giới ×2 → điểm ảnh game
        im = Image.fromarray(a)
        if to != 1:
            im = im.resize((im.width * to, im.height * to), Image.NEAREST)
        r = so['so'][cap]['nhip'][k]
        if to >= 3:
            d = ImageDraw.Draw(im)
            t = (r['ten'] or '') + ('' if r['i'] is None else ' k%d' % (r['i'] + 1))
            d.text((6, 4), '%s  u=%s' % (t, '-' if r['u'] is None or r['u'] < 0 else '%.2f' % r['u']), fill=(255, 255, 255), font=L.F)
        fr.append(im)
    gif(fr, os.path.join(HERE, ten))


def gif_truoc_sau(truoc, sau, ten):
    za, sa = truoc; zb, sb = sau
    n = min(len(za['a0']), len(zb['a0']))
    fr = []
    for k in chon_nhip(n):
        hang = []
        for cap in ('0', '3'):
            a, b = za['a' + cap][k], zb['a' + cap][k]
            w, h = a.shape[1], a.shape[0]
            o = Image.new('RGBA', (2 * w + 6, h), (30, 32, 40, 255))
            for j, x in enumerate((a, b)):
                bg = Image.new('RGBA', (w, h), (52, 58, 72, 255)); bg.alpha_composite(Image.fromarray(x))
                q = ImageDraw.Draw(bg); q.line([(0, 70 * 3), (w, 70 * 3)], fill=(90, 220, 110, 255))
                o.paste(bg, (j * (w + 6), 0))
            hang.append(o)
        f = Image.new('RGBA', (hang[0].width, 2 * hang[0].height + 20), (20, 20, 26, 255))
        f.paste(hang[0], (0, 20)); f.paste(hang[1], (0, 20 + hang[0].height))
        d = ImageDraw.Draw(f)
        rb = sb['so']['0']['nhip'][k]
        d.text((4, 3), 'TRƯỚC (kiếm cũ)', fill=(255, 255, 160), font=L.F)
        d.text((hang[0].width // 2 + 6, 3), 'SAU (kiếm nặng)  %s' % ((rb['ten'] or '') + ('' if rb['i'] is None else ' k%d' % (rb['i'] + 1))), fill=(160, 255, 160), font=L.F)
        fr.append(f)
    gif(fr, os.path.join(HERE, ten))


def ghep_eo(thu):
    so = json.load(open(os.path.join(thu, 'so-lieu.json')))
    so = so.get('so', so)
    hang = []
    for ten in ('chay-kiem-phai', 'di-kiem-phai'):
        sl = so[ten]; z = np.load(os.path.join(thu, ten + '.npz'))['gif']
        for nh in ('kiem_1', 'kiem_2', 'kiem_3'):
            ks = [k for k, r in enumerate(sl) if r['ten'] == nh and r['atk'] is not None and r['atk'] >= 0]
            ks = ks[::max(1, len(ks) // 6)][:6]
            hang.append(('%s · %s%s' % ('chạy' if ten.startswith('chay') else 'đi', nh.replace('kiem_', 'nhát '),
                                        ' (ghép ở đai)' if any(sl[k]['eo'] for k in ks) else ' (toàn thân, không ghép)'), [z[k] for k in ks]))
    w, h = hang[0][1][0].shape[1], hang[0][1][0].shape[0]
    out = Image.new('RGBA', (6 * w, len(hang) * (h + 18)), (40, 44, 54, 255))
    d = ImageDraw.Draw(out)
    for r, (nhan, ims) in enumerate(hang):
        y = r * (h + 18)
        d.text((6, y + 2), nhan, fill=(235, 235, 235), font=L.F)
        for j, a in enumerate(ims):
            out.alpha_composite(Image.fromarray(a), (j * w, y + 18))
    out.convert('RGB').save(os.path.join(HERE, 'ghep-eo.png'), optimize=True)
    print('Ghi ghep-eo.png', out.size)


def main():
    luoi()
    truoc, sau = doc(sys.argv[1]), doc(sys.argv[2])
    gif_man(sau, 'combo-vet-x1.gif', '0', 1)
    gif_man(sau, 'combo-vet-x3.gif', '0', 3)
    gif_man(sau, 'combo-vet-cap4-x3.gif', '3', 3)
    gif_truoc_sau(truoc, sau, 'truoc-sau-x3.gif')
    if len(sys.argv) > 3:
        ghep_eo(sys.argv[3])


if __name__ == '__main__':
    main()
