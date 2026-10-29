#!/usr/bin/env python3
"""ĐO chém 1 sáu hình (PH15 mục 2): TAY (găng cầm dao) + MŨI DAO thực tế từng hình so với ẢNH HƯỚNG DẪN (kiem/huong-dan-chem1-6o.png).

    python3 do_chem1_6.py   → kiem/chem1-6-do.json + kiem/chem1-6-so-huong-dan.png (+ in bảng)

Hướng dẫn: ô 1000 × 1000 (lưới 3 × 2, A T U / V W G), chân (350, 900), 5 px ảnh / 1 px logic; chấm XANH = tay, chấm ĐỎ = mũi dao; hộp chém 1 x 4…95, y −97…−49.
Thực tế: đo trên sheet 2x đã dựng (dung_thu3.py chem1_6 / chem1_ghep – cùng neo game: x = giữa hai ủng + hằng, y = đáy ủng):
  mũi dao = điểm THÉP (xám ít màu, sáng vừa) xa găng nhất trong các mảnh thép lớn; găng = cụm NÂU TỐI (không phải đồng chuông / chắn dao) gần chắn dao nhất.
  Kiểm bằng mắt ở ảnh: chấm rỗng = hướng dẫn, chấm đặc = đo; ô đỏ = hộp chém 1."""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.normpath(os.path.join(HERE, '..'))
SP = os.path.join(GOC, 'sprite'); KI = os.path.join(GOC, 'kiem')
HOP = (4, -97, 95, -49)
TEN = ['A lấy đà', 'T bắt đầu vung', 'U cắt sớm', 'V cắt đầy', 'W kết thúc', 'G thủ']
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception:
    FONT = ImageFont.load_default()


def huong_dan():
    im = np.asarray(Image.open(os.path.join(KI, 'huong-dan-chem1-6o.png')).convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    xanh = (b > 180) & (r < 90) & (g > 80) & (g < 160); do = (r > 200) & (g < 90) & (b < 80)
    ra = []
    for j in range(2):
        for i in range(3):
            sl = (slice(j * 1000, j * 1000 + 1000), slice(i * 1000, i * 1000 + 1000)); kq = {}
            for k, m in (('tay', xanh), ('mui', do)):
                yy, xx = np.nonzero(m[sl])
                # bỏ khung hộp (đỏ nhạt) – chấm là cụm đặc lớn
                lab, n = ndi.label(m[sl]); co = ndi.sum(m[sl], lab, range(1, n + 1)); kk = int(np.argmax(co)) + 1
                cy, cx = ndi.center_of_mass(m[sl], lab, kk)
                kq[k] = [round(float(cx - 350) / 5, 1), round(float(cy - 900) / 5, 1)]
            ra.append(kq)
    return ra


def do_khung(fr, ax, ay, boi):
    a = fr[..., 3] > 160; c = fr[..., :3].astype(int); r, g, b = c[..., 0], c[..., 1], c[..., 2]
    mx, mn = c.max(-1), c.min(-1); lum = c.mean(-1)
    thep = a & (mx - mn < 26) & (lum > 95) & (lum < 215) & (g - r < 6) & (g - b < 10)
    dong = a & (r > 120) & (r - b > 50) & (g > 70)                       # đồng: chuông, chắn dao
    gang = a & (r - b > 14) & (r >= g) & (lum < 95) & (lum > 25) & ~dong  # găng nâu tối
    lab, n = ndi.label(thep, structure=np.ones((3, 3))); co = ndi.sum(thep, lab, range(1, n + 1))
    lon = [k + 1 for k in range(n) if co[k] >= 30 * boi * boi / 4]
    if not lon: return None
    luoi = np.isin(lab, lon)
    lg, ng = ndi.label(ndi.binary_opening(gang, iterations=1)); cg = ndi.sum(gang, lg, range(1, ng + 1))
    dl = ndi.binary_closing(dong, iterations=2); ld, nd = ndi.label(dl)
    # chắn dao = cụm đồng gần thép nhất (chuông thường xa lưỡi)
    dt = ndi.distance_transform_edt(~luoi)
    chan = None
    if nd:
        best = min(range(1, nd + 1), key=lambda k: dt[ld == k].min()); yy, xx = np.nonzero(ld == best); chan = (xx.mean(), yy.mean())
    tay = None
    if ng:
        ung = [k + 1 for k in range(ng) if cg[k] >= 12 * boi * boi / 4]
        if ung:
            ref = chan if chan else ndi.center_of_mass(luoi)[::-1]
            def kc(k): yy, xx = np.nonzero(lg == k); return np.hypot(xx.mean() - ref[0], yy.mean() - ref[1])
            k = min(ung, key=kc); yy, xx = np.nonzero(lg == k); tay = (xx.mean(), yy.mean())
    goc = tay or chan
    yy, xx = np.nonzero(luoi); d = np.hypot(xx - goc[0], yy - goc[1]); j = int(np.argmax(d)); mui = (xx[j], yy[j])
    L = lambda p: [round(float(p[0] - ax) / boi, 1), round(float(p[1] - ay) / boi, 1)] if p is not None else None
    return {'tay': L(tay), 'chan_dao': L(chan), 'mui': L(mui)}


# ĐO TAY trên lưới 1 px logic (sheet 3x, cùng neo game) – máy dò thép/găng nhầm viền áo xám với lưỡi nên dùng số đo tay (ảnh lưới: chạy với --luoi)
DO_TAY = {
    'chem1_6': [((-23, -43), (-73, -12)), ((-18, -48), (-65, -16)), ((7, -60), (66, -77)), ((23, -66), (89, -70)), ((12, -50), (74, -22)), ((-14, -41), (43, -11))],
    'chem1_ghep': [((-30, -42), (10, -12)), ((4, -43), (-36, -12)), ((24, -48), (74, -43)), ((25, -48), (79, -49)), ((-5, -41), (44, -21)), ((7, -35), (43, -12))],
}
VET_KEY = {'chem1_6': '11', 'chem1_ghep': '12'}


def luoi_y(tay, mui, x):
    if abs(mui[0] - tay[0]) < 1e-6: return None
    t = (x - tay[0]) / (mui[0] - tay[0]); t = min(1.0, max(0.0, t)); return tay[1] + t * (mui[1] - tay[1])


def main():
    hd = huong_dan(); kq = {'huong_dan': hd, 'hop_chem1': HOP, 'quy_doi': '5 px ảnh hướng dẫn = 1 px logic; chân (350, 900)'}
    hang = []
    for ten, nhan in (('chem1_6', 'C1 (thu11 toạ độ)'), ('chem1_ghep', 'C2 (ghép)')):
        m = json.load(open(os.path.join(SP, 'lam-moi8-%s-2x.json' % ten), encoding='utf-8')); sh = np.asarray(Image.open(os.path.join(SP, m['anh'])).convert('RGBA'))
        ax, ay = m['diem_neo']['x'], m['diem_neo']['y']; ds = []
        for i, f in enumerate(m['frames']):
            tay, mui = DO_TAY[ten][i]; d = {'tay': list(tay), 'mui': list(mui), 'cach_do': 'đo tay trên lưới 1 px logic'}
            h = hd[i]
            for k in ('tay', 'mui'):
                if d.get(k): d['lech_' + k] = [round(float(d[k][0] - h[k][0]), 1), round(float(d[k][1] - h[k][1]), 1)]; d['lech_' + k + '_px'] = round(float(np.hypot(*d['lech_' + k])), 1)
            if d.get('mui'):
                x, y = d['mui']; d['mui_trong_hop'] = bool(HOP[0] <= x <= HOP[2] and HOP[1] <= y <= HOP[3])
            if d.get('tay') and d.get('mui'):
                d['goc_luoi_do'] = round(float(np.degrees(np.arctan2(d['mui'][1] - d['tay'][1], d['mui'][0] - d['tay'][0]))), 1)
                h_ = hd[i]; d['goc_huong_dan_do'] = round(float(np.degrees(np.arctan2(h_['mui'][1] - h_['tay'][1], h_['mui'][0] - h_['tay'][0]))), 1)
            d['nhan'] = f['nhan']; d['y'] = TEN[i]; ds.append(d)
        # lệch dao – vệt: tâm LÕI SÁNG vệt gen (vet-gen-2x.json dat[11 | 12], + dời từng khung) so với đường lưỡi của hình đang hiện ở cùng tick
        vg = json.load(open(os.path.join(SP, 'vet-gen-2x.json'), encoding='utf-8'))['dat'][VET_KEY[ten]]; L = vg['loi_logic']; kd = vg['khung_doi']
        cx, cy = (L[0] + L[2]) / 2, (L[1] + L[3]) / 2; lv = []
        for j, (hinh, ten_k) in enumerate(((2, 'nét mảnh (tick U đầu)'), (3, 'cung đầy (U cuối + V)'), (3, 'vỡ (V cuối + W đầu)'), (4, 'mảnh tắt (W)'))):
            x, y = cx + kd[j][0], cy + kd[j][1]; tay, mui = DO_TAY[ten][hinh]; yl = luoi_y(tay, mui, min(x, mui[0]))
            lv.append({'khung_vet': j + 1, 'ten': ten_k, 'hinh': ds[hinh]['nhan'], 'tam_loi': [round(x, 1), round(y, 1)], 'luoi_y_tai_x': round(yl, 1),
                       'lech_px': round(abs(y - yl), 1), 'mui_qua_tam_loi_px': round(mui[0] - x, 1)})
        kq[ten + '_vet'] = lv
        kq[ten] = ds; hang.append((nhan, m, sh, ds))
    json.dump(kq, open(os.path.join(KI, 'chem1-6-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # ảnh kiểm: mỗi hàng 1 bản, mỗi ô 1 hình 2x + hộp + chấm
    K = 2; W, H = 380, 260
    o = Image.new('RGB', (6 * (W + 6) + 120, 2 * (H + 26) + 40), (36, 40, 48)); dr = ImageDraw.Draw(o)
    for r, (nhan, m, sh, ds) in enumerate(hang):
        ax, ay = m['diem_neo']['x'], m['diem_neo']['y']; dr.text((6, 30 + r * (H + 26) + H // 2), nhan, font=FONT, fill=(240, 230, 200))
        for i, f in enumerate(m['frames']):
            c = Image.new('RGBA', (W, H), (128, 128, 128, 255)); X0, Y0 = 180, H - 14
            fr = Image.fromarray(sh[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']]); c.alpha_composite(fr, (X0 - ax, Y0 - ay)); d = ImageDraw.Draw(c)
            d.rectangle([X0 + HOP[0] * K, Y0 + HOP[1] * K, X0 + HOP[2] * K, Y0 + HOP[3] * K], outline=(230, 60, 60), width=2)
            h = hd[i]; P = lambda p: (X0 + p[0] * K, Y0 + p[1] * K)
            d.line([P(h['tay']), P(h['mui'])], fill=(40, 40, 40), width=1)
            for k, col in (('tay', (40, 110, 240)), ('mui', (235, 60, 40))):
                x, y = P(h[k]); d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=col, width=2)
                if ds[i].get(k): x, y = P(ds[i][k]); d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=col)
            d.line([(X0 - 4, Y0), (X0 + 4, Y0)], fill=(20, 200, 90), width=2)
            x, y = 120 + i * (W + 6), 30 + r * (H + 26); o.paste(c.convert('RGB'), (x, y))
            t = '%s %s · lệch tay %s mũi %s' % (f['nhan'], TEN[i].split()[0], ds[i].get('lech_tay_px', '–'), ds[i].get('lech_mui_px', '–'))
            dr.text((x + 2, y - 15), t, font=FONT, fill=(230, 230, 230))
    dr.text((6, o.height - 22), 'vòng rỗng = hướng dẫn (xanh tay, đỏ mũi) · chấm đặc = đo trên sheet · khung đỏ = hộp chém 1 (x 4…95, y −97…−49) · vạch lục = chân · 2 px / px logic',
            font=FONT, fill=(220, 220, 220))
    o.save(os.path.join(KI, 'chem1-6-so-huong-dan.png'))
    for ten in ('chem1_6', 'chem1_ghep'):
        print(ten)
        for d in kq[ten]:
            print('  %-4s tay %-14s mũi %-14s lệch tay %-12s mũi %-12s trong hộp %s góc %s/%s' % (d['nhan'], d.get('tay'), d.get('mui'), d.get('lech_tay'), d.get('lech_mui'),
                  d.get('mui_trong_hop'), d.get('goc_luoi_do'), d.get('goc_huong_dan_do')))
        for v in kq[ten + '_vet']: print('   vệt', v)
    print('hướng dẫn', hd)


def chuoi():
    """kiem/chem1-6-chuoi-112.png: chuỗi 1 → 2 → 3 và 5 → 6 → đứng (I1) ở ĐÚNG 112 px (1 px logic = 1 px ảnh) + phóng 3x, C1 / C2; cùng neo chân như game.
    Cột cuối mỗi chuỗi: chồng 3 hình (đường bao) – thấy tay / dao / thân dời bao nhiêu giữa các hình kề."""
    def khung(ten, nhan, tt='lam-moi8'):
        m = json.load(open(os.path.join(SP, '%s-%s-2x.json' % (tt, ten)), encoding='utf-8')); sh = Image.open(os.path.join(SP, m['anh'])).convert('RGBA')
        f = m['frames'][m['tu_the'].index(nhan)]; fr = sh.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        return fr, m['diem_neo']['x'], m['diem_neo']['y']
    W, H, X0, Y0 = 170, 130, 70, 122
    def dat(fr, ax, ay, k):
        c = Image.new('RGBA', (W * k, H * k), (0, 0, 0, 0)); im = fr.resize((max(1, round(fr.width * k / 2)), max(1, round(fr.height * k / 2))), Image.LANCZOS)
        c.alpha_composite(im, (round(X0 * k - ax * k / 2), round(Y0 * k - ay * k / 2))); return c
    hang = []
    for ten, p, nhan in (('chem1_6', 'C1', 'C1 (thu11)'), ('chem1_ghep', 'GH', 'C2 (ghép)')):
        for ds, tn in ((['A', 'T', 'U'], '1 → 2 → 3'), (['W', 'G', 'I1'], '5 → 6 → đứng')):
            fs = [khung('dung', 'I1', 'lam-moi3') if x == 'I1' else khung(ten, p + x) for x in ds]
            hang.append(('%s · %s' % (nhan, tn), [x if x == 'I1' else p + x for x in ds], fs))
    K = 3; o = Image.new('RGB', (150 + 4 * (W + 6) + 4 * (W * K // 3 + 6) + 200, len(hang) * (H * K // 3 * 3 // 3 + H + 30) + 40), (36, 40, 48)); dr = ImageDraw.Draw(o)
    y = 8; mau = [(240, 120, 90), (120, 220, 120), (110, 160, 250)]
    for t, nh, fs in hang:
        dr.text((6, y + 40), t, font=FONT, fill=(240, 230, 200)); x = 150
        for (fr, ax, ay), n in zip(fs, nh):
            c = Image.new('RGBA', (W, H), (22, 26, 34, 255)); c.alpha_composite(dat(fr, ax, ay, 1)); o.paste(c.convert('RGB'), (x, y + 14)); dr.text((x + 2, y), n + ' · 112', font=FONT, fill=(220, 220, 220)); x += W + 6
        # chồng bao
        c = Image.new('RGBA', (W, H), (22, 26, 34, 255)); d = ImageDraw.Draw(c)
        for (fr, ax, ay), col in zip(fs, mau):
            a = np.asarray(dat(fr, ax, ay, 1))[..., 3] > 100; e = a & ~ndi.binary_erosion(a)
            ys, xs = np.nonzero(e)
            for yy, xx in zip(ys, xs): c.putpixel((int(xx), int(yy)), col + (255,))
        o.paste(c.convert('RGB'), (x, y + 14)); dr.text((x + 2, y), 'chồng bao (đỏ→lục→lam)', font=FONT, fill=(220, 220, 220)); x += W + 12
        for (fr, ax, ay), n in zip(fs, nh):
            c = Image.new('RGBA', (W * K, H * K), (128, 128, 128, 255)); c.alpha_composite(dat(fr, ax, ay, K)); c = c.resize((W * K // 2, H * K // 2), Image.LANCZOS)
            o.paste(c.convert('RGB'), (x, y + 14)); dr.text((x + 2, y), n + ' · ×1,5', font=FONT, fill=(220, 220, 220)); x += c.width + 6
        y += H * K // 2 + 24
    o = o.crop((0, 0, o.width, y + 24)); dr = ImageDraw.Draw(o)
    dr.text((6, y + 4), 'neo như game: x = trục thân (giữa hai ủng + hằng), y = đáy ủng · I1 = đứng (lam-moi3-dung)', font=FONT, fill=(200, 200, 200))
    o.save(os.path.join(KI, 'chem1-6-chuoi-112.png'))


if __name__ == '__main__':
    main(); chuoi()
