"""Bước 5 (v4): xuất chu kỳ chạy → ../chay/   (tối 10 % tay sau + ủng xa BẬT)
  chay-112px.gif          112 px logic 1:1 (đúng cỡ trong game, KHÔNG phóng nearest), 25 khung × 20 ms = 0,50 s
  chay-lon.gif            cỡ lớn (½ ảnh ngang), 25 khung × 20 ms = 0,50 s
  chay-lon-cham-x4.gif    30 khung × 60 ms (chậm ×3,6) để soi chân bám đất
  chay-contact-sheet.png  toàn chu kỳ 30 khung: cỡ lớn + 112 px 1:1 + 112 px bóng
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


GIF_MS = 20               # GIF chỉ lưu được bội số 10 ms (dưới 20 ms trình duyệt kéo thành 100 ms) → 20 ms/khung
GIF_SO_KHUNG = 25         # 25 × 20 ms = 0,50 s = đúng một chu kỳ v4 (vẽ lại từ rig ở pha k/25, không bỏ/lặp khung)


def main(doc=None, K=None):
    os.makedirs(CHAY, exist_ok=True)
    doc = doc or load_json()
    K = K or khung_co_dinh(doc)
    ck = doc['chu_ky']
    v = ck['van_toc_dat_px_moi_chu_ky']
    W112, H112 = K['co_112']
    out = {'112': [], 'lon': [], 'bong112': []}
    gif = {'112': [], 'lon': []}
    import chu_ky
    chu_ky.chuan_bi_ung(doc['rig'])
    for i, p in enumerate(ck['khung']):
        pha = p['_pha']
        bg = nen(K, 1.0, pha, v)
        nv = ve_khung(doc, K, p, 1.0)
        full = ghep(bg, nv)
        out['112'].append(full.resize((W112, H112), Image.LANCZOS))
        out['lon'].append(full.resize((int(full.width * K_LON), int(full.height * K_LON)), Image.LANCZOS))
        out['bong112'].append(ghep(bg, bong(nv)).resize((W112, H112), Image.LANCZOS))
        print(f'khung {i:2d} φ={pha:.4f}', end='\r')
    # GIF đúng nhịp: 25 khung × 20 ms = 0,50 s, pha k/25 vẽ thẳng từ rig
    for i in range(GIF_SO_KHUNG):
        pha = i / GIF_SO_KHUNG
        p, _ = chu_ky.make_pose(doc['rig'], pha)
        full = ghep(nen(K, 1.0, pha, v), ve_khung(doc, K, p, 1.0))
        gif['112'].append(full.resize((W112, H112), Image.LANCZOS))          # 112 px 1:1, KHÔNG phóng nearest
        gif['lon'].append(full.resize((int(full.width * K_LON), int(full.height * K_LON)), Image.LANCZOS))
    luu_gif(gif['112'], os.path.join(CHAY, 'chay-112px.gif'), GIF_MS)
    luu_gif(gif['lon'], os.path.join(CHAY, 'chay-lon.gif'), GIF_MS)
    luu_gif(out['lon'], os.path.join(CHAY, 'chay-lon-cham-x4.gif'), 60)     # 30 khung × 60 ms = chậm ×3,6

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
    per = 15
    blk2 = 4 * (H112 + 6) + 80
    Wc = cols * (tw + pad) + pad
    sheet = Image.new('RGB', (max(Wc, per * (W112 + 4) + 40), top + blk1 + blk2 + 40), 'white')
    d = ImageDraw.Draw(sheet)
    d.text((pad, 10), 'Lam rig-v4 (chạy nhanh) – contact sheet toàn chu kỳ (30 khung = 0,50 s; 16,7 ms/khung = 1 bước logic ở 264 px/s; tối 10 % tay sau + ủng xa)',
           fill='black', font=font(30, True))
    d.text((pad, 52), 'Cùng gốc/canvas/đường đất. Vạch xám dưới đất trôi đúng tốc độ đất. G/X = ủng gần/xa đang '
                      'CHỊU LỰC (chạm đất). Khung có tên = 4 tư thế. Nửa sau (15–29) chỉ đổi pha. Tam giác xanh = gốc cố định.',
           fill=(70, 70, 70), font=font(17))
    ten_tt = {round(v_ * n): k for k, v_ in PHA_TU_THE.items()}
    nua = n // 2
    for i, im in enumerate(small):
        r, c = divmod(i, cols)
        x = pad + c * (tw + pad)
        y = top + r * (th + LBL + pad)
        sheet.paste(im, (x, y + LBL))
        d.rectangle([x, y + LBL, x + tw - 1, y + LBL + th - 1], outline=KHUNG_VIEN)
        p = ck['khung'][i]
        cl = ''.join(t for t, k in (('G', 'ung-gan'), ('X', 'ung-xa')) if p['_ung'][k]['chiu_luc'])
        lab = f'{i:02d} · {int(round(p["_thoi_gian_s"] * 1000))} ms · {cl or "bay"}'
        nm = ten_tt.get(i) or ({k + nua: v2 for k, v2 in ten_tt.items()}.get(i))
        col = (0, 0, 0)
        if nm:
            lab += f' · {NHAN[nm]}' + (' (đổi pha)' if i >= nua else '')
            col = (170, 30, 30)
        d.text((x + 2, y + 6), lab, fill=col, font=font(15, True))
    y = top + blk1 + 10
    d.text((pad, y), '112 px logic 1:1 – 2 hàng màu (00–14, 15–29), 2 hàng bóng', fill='black', font=font(18, True))
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
