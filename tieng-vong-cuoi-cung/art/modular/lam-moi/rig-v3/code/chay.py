"""Bước 5 (v3): xuất chu kỳ chạy → ../chay/   (tối 10 % tay sau + ủng xa BẬT trong mọi file, trừ file ghi "khong-toi")
  chay-112px.gif          112 px logic 1:1 (đúng cỡ trong game, chưa nhân 2,17 thiết bị)
  chay-112px-x4.gif       112 px phóng ×4 điểm-ảnh (nearest) – soi từng px
  chay-lon.gif            cỡ lớn (½ ảnh ngang) – xem dáng;  chay-lon-cham-x4.gif  chậm ×4
  chay-khong-toi-112px-x4.gif   CHỈ để so sánh: tắt tối 10 %
  chay-nhun-v2-v3-112px-x4.gif  so sánh nhún: trái = bảng nhún v2, phải = v3 (cùng mảnh/pivot v3)
  chay-contact-sheet.png  toàn chu kỳ 32 khung: cỡ lớn + 112 px 1:1 + 112 px bóng
Mọi khung: cùng gốc, cùng canvas, cùng đường đất; vạch đất trôi sang trái đúng tốc độ đất (ủng chịu lực phải
đứng yên so với vạch). Tam giác xanh dưới đất = vị trí gốc (cố định)."""
import os
import numpy as np
from PIL import Image, ImageDraw
from chung import CHAY, font, load_json
from khung import khung_co_dinh, nen, ghep, bong, ve_khung, KHUNG_VIEN
from chu_ky import NHAN, PHA_TU_THE

K_LON = 0.5


def luu_gif(frames, path, ms):
    """một bảng màu CHUNG cho mọi khung (màu không nhấp nháy giữa các khung), không dither."""
    mau = frames[::2]
    big = Image.new('RGB', (frames[0].width, frames[0].height * len(mau)))
    for i, f in enumerate(mau):
        big.paste(f, (0, i * f.height))
    pal_img = big.quantize(colors=256, method=Image.Quantize.MEDIANCUT, kmeans=2)
    pal = [f.quantize(palette=pal_img, dither=Image.Dither.NONE) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=ms, loop=0, optimize=False, disposal=1)


def main(doc=None, K=None):
    os.makedirs(CHAY, exist_ok=True)
    doc = doc or load_json()
    K = K or khung_co_dinh(doc)
    ck = doc['chu_ky']
    v = ck['van_toc_dat_px_moi_chu_ky']
    W112, H112 = K['co_112']
    out = {'112': [], 'x4': [], 'lon': [], 'khong_x4': [], 'khong_lon': [], 'bong112': [], 'v2_x4': []}
    import chu_ky
    chu_ky.chuan_bi_ung(doc['rig'])
    cu = chu_ky.BANG_CHON
    chu_ky.dat_bang('V2')
    pose_v2 = [chu_ky.make_pose(doc['rig'], p['_pha'])[0] for p in ck['khung']]
    chu_ky.dat_bang(cu)
    for i, p in enumerate(ck['khung']):
        pha = p['_pha']
        bg = nen(K, 1.0, pha, v)
        for key, t in (('', None), ('khong_', {})):
            nv = ve_khung(doc, K, p, 1.0, toi=t)
            full = ghep(bg, nv)
            s112 = full.resize((W112, H112), Image.LANCZOS)
            lon = full.resize((int(full.width * K_LON), int(full.height * K_LON)), Image.LANCZOS)
            out[key + 'x4'].append(s112.resize((W112 * 4, H112 * 4), Image.NEAREST))
            out[key + 'lon'].append(lon)
            if not key:
                out['112'].append(s112)
                out['bong112'].append(ghep(bg, bong(nv)).resize((W112, H112), Image.LANCZOS))
        s2 = ghep(bg, ve_khung(doc, K, pose_v2[i], 1.0)).resize((W112, H112), Image.LANCZOS)
        out['v2_x4'].append(s2.resize((W112 * 4, H112 * 4), Image.NEAREST))
        print(f'khung {i:2d} φ={pha:.4f}', end='\r')
    ms = int(round(ck['ms_moi_khung']))
    luu_gif(out['112'], os.path.join(CHAY, 'chay-112px.gif'), ms)
    luu_gif(out['x4'], os.path.join(CHAY, 'chay-112px-x4.gif'), ms)
    luu_gif(out['lon'], os.path.join(CHAY, 'chay-lon.gif'), ms)
    luu_gif(out['khong_x4'], os.path.join(CHAY, 'chay-khong-toi-112px-x4.gif'), ms)
    ss = []
    for a, b in zip(out['v2_x4'], out['x4']):
        c = Image.new('RGB', (a.width * 2 + 16, a.height + 30), 'white')
        c.paste(a, (0, 30))
        c.paste(b, (a.width + 16, 30))
        dd = ImageDraw.Draw(c)
        dd.text((6, 6), 'nhún v2 (6,3 px logic)', fill='black', font=font(16, True))
        dd.text((a.width + 22, 6), 'v3 (3,1 px logic)', fill='black', font=font(16, True))
        ss.append(c)
    luu_gif(ss, os.path.join(CHAY, 'chay-nhun-v2-v3-112px-x4.gif'), ms)
    # bản chậm ×4 (80 ms/khung) để soi chân bám đất
    luu_gif(out['lon'], os.path.join(CHAY, 'chay-lon-cham-x4.gif'), ms * 4)

    # ---------------- contact sheet
    n = len(ck['khung'])
    cols = 8
    rows = (n + cols - 1) // cols
    S = 0.24
    tw = int(K['khung'][2] * S - K['khung'][0] * S)
    th = int(K['khung'][3] * S - K['khung'][1] * S)
    small = [f.resize((tw, th), Image.LANCZOS) for f in out['lon']]
    LBL = 34
    pad = 8
    top = 110
    blk1 = rows * (th + LBL + pad)
    per = 16
    blk2 = 4 * (H112 + 6) + 80
    Wc = cols * (tw + pad) + pad
    sheet = Image.new('RGB', (max(Wc, per * (W112 + 4) + 40), top + blk1 + blk2 + 40), 'white')
    d = ImageDraw.Draw(sheet)
    d.text((pad, 10), 'Lam rig-v3 – contact sheet toàn chu kỳ chạy (32 khung = 0,64 s; 20 ms/khung; tối 10 % tay sau + ủng xa)',
           fill='black', font=font(30, True))
    d.text((pad, 52), 'Cùng gốc/canvas/đường đất. Vạch xám dưới đất trôi đúng tốc độ đất. G/X = ủng gần/xa đang '
                      'CHỊU LỰC (chạm đất). Khung có tên = 4 tư thế. Nửa sau (16–31) chỉ đổi pha. Tam giác xanh = gốc cố định.',
           fill=(70, 70, 70), font=font(17))
    ten_tt = {round(v_ * 32): k for k, v_ in PHA_TU_THE.items()}
    for i, im in enumerate(small):
        r, c = divmod(i, cols)
        x = pad + c * (tw + pad)
        y = top + r * (th + LBL + pad)
        sheet.paste(im, (x, y + LBL))
        d.rectangle([x, y + LBL, x + tw - 1, y + LBL + th - 1], outline=KHUNG_VIEN)
        p = ck['khung'][i]
        cl = ''.join(t for t, k in (('G', 'ung-gan'), ('X', 'ung-xa')) if p['_ung'][k]['chiu_luc'])
        lab = f'{i:02d} · {int(round(p["_thoi_gian_s"] * 1000))} ms · {cl or "bay"}'
        nm = ten_tt.get(i) or ({k + 16: v2 for k, v2 in ten_tt.items()}.get(i))
        col = (0, 0, 0)
        if nm:
            lab += f' · {NHAN[nm]}' + (' (đổi pha)' if i >= 16 else '')
            col = (170, 30, 30)
        d.text((x + 2, y + 6), lab, fill=col, font=font(15, True))
    y = top + blk1 + 10
    d.text((pad, y), '112 px logic 1:1 – 2 hàng màu (00–15, 16–31), 2 hàng bóng', fill='black', font=font(18, True))
    y += 28
    for i in range(n):
        r, c = divmod(i, per)
        sheet.paste(out['112'][i], (pad + c * (W112 + 4), y + r * (H112 + 6)))
        sheet.paste(out['bong112'][i], (pad + c * (W112 + 4), y + (2 + r) * (H112 + 6)))
    sheet.save(os.path.join(CHAY, 'chay-contact-sheet.png'))
    print('\nđã xuất', sorted(os.listdir(CHAY)))
    return out


if __name__ == '__main__':
    main()
