"""Ảnh soi 13 mũ: ảnh mũ phóng 8 lần có chữ thập ở điểm dinh_dau, cạnh đó Cu Tí đội mũ (khung đứng đầu tiên, phóng 4 lần) ở bản trước và bản mới.
python3 mu13.py <tệp ảnh ra>   (cần cổng 8801 bản mới, 8802 bản trước)"""
from chung import *
import glob
JS = "(m) => { const D = K.dung('smith', 'sword', { hat: m }); return K.png(K.cell(K.o5(D, 'idle', 0, { khongVk: 1 }), 40, 44, 20, 40, 4, null)); }"
fs = sorted(glob.glob(REPO + '/game/art/custom/tp-hats-*.sprite.json')); R = {}
with sync_playwright() as p:
    b = p.chromium.launch(); moi = page(b, 8801); cu = page(b, 8802)
    for f in fs:
        t = json.load(open(f)); R[t['ma']] = (t, img(cu.evaluate(JS, t['trang_phuc']['look'])), img(moi.evaluate(JS, t['trang_phuc']['look'])))
    b.close()
Z = 8; cw, ch = 460, 220; im = Image.new('RGB', (10 + 3 * cw, 40 + 5 * ch), (24, 34, 36)); d = ImageDraw.Draw(im)
d.text((8, 8), '13 mũ: điểm neo đỉnh đầu (chữ thập đỏ) trên ảnh mũ phóng 8 lần · Cu Tí đội mũ ở bản TRƯỚC và bản MỚI (phóng 4 lần)', fill=(246, 220, 146), font=font(15))
for i, (ma, (t, a, c)) in enumerate(R.items()):
    x0, y0 = 10 + (i % 3) * cw, 40 + (i // 3) * ch; dd = t['trang_phuc']['diem']['dinh_dau']
    d.text((x0, y0), '%s · %s · %d×%d · dinh_dau %s · %s' % (t['ten'], ma, t['rong'], t['cao'], dd, 'giống hệt' if a.tobytes() == c.tobytes() else 'KHÁC'), fill=(200, 220, 210), font=font(11))
    h = img(t['anh']).resize((t['rong'] * Z, t['cao'] * Z), Image.NEAREST); oy = y0 + 20 + 3 * Z
    d.rectangle([x0, y0 + 18, x0 + 25 * Z + 4, y0 + 18 + 24 * Z], fill=(43, 58, 46)); im.paste(h, (x0 + 2, oy), h)
    px, py = x0 + 2 + (dd[0] + 0.5) * Z, oy + (dd[1] + 0.5) * Z   # tâm của điểm ảnh thứ dd
    d.line([px - 10, py, px + 10, py], fill=(255, 60, 60), width=2); d.line([px, py - 10, px, py + 10], fill=(255, 60, 60), width=2)
    for k, q in enumerate((a, c)):
        x = x0 + 25 * Z + 12 + k * 124; d.rectangle([x, y0 + 18, x + 119, y0 + 18 + 175], fill=(43, 58, 46)); im.paste(q.crop((20, 0, 140, 176)), (x, y0 + 18), q.crop((20, 0, 140, 176)))
        d.text((x + 4, y0 + 180), 'trước' if k == 0 else 'mới', fill=(169, 194, 180), font=font(11))
im.save(sys.argv[1]); print('đã ghi', sys.argv[1], '· số mũ đội giống hệt bản trước:', sum(a.tobytes() == c.tobytes() for _, a, c in R.values()), '/', len(R))
