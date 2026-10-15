"""(quai-moi-lau: chép từ ../../quai-moi-bien/cong-cu/ve-soat.py, đổi sang 10 con Lâu đài cổ: tên tệp xem-lau.*; trong ảnh động Hũ Lửa
có đoạn "lăn" (cử động 'lan', 0,7 s) trước khung vỡ; Tướng Ma / Hũ Chúa có đoạn chiêu (chieu1: 40% báo đòn + 60% đánh, như SC.chonQuai).
Gốc: quai-moi-bien — chép từ ../../quai-moi-6-con/cong-cu/ve-soat.py; ảnh tĩnh ×2 và mỗi con cao theo ô của nó cho ảnh không quá dài)
Ảnh soát tĩnh: xem-lau.png (mỗi con 6 hàng × khung, cùng tỉ lệ game ×2, vạch đỏ = đường đất / điểm neo, vạch xanh = điểm neo, cột đầu là tấm cũ)
và xem-lau.gif (cả 10 con lần lượt chạy 6 động tác ở cỡ game ×3, nhịp theo dong_tac / thời lượng trong game).
python3 ve-soat.py [ra]   ra: đọc tấm ở cong-cu/ra/ (chưa ghi vào game); mặc định đọc game/art/custom/."""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../quai-moi-4-con/cong-cu')))
from anh_quai import *
MA = ['linhMa', 'doiThan', 'tuongDa', 'denLong', 'meoDen', 'huLua', 'tieuYeu', 'nhimThan', 'tuongMa', 'huChua']
from PIL import ImageDraw, ImageFont

RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra')
THU = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
TL = 3   # điểm ảnh game × 3 (ảnh động); ảnh tĩnh × TLP
TLP = 2
NEN, DAT, NEO = (58, 62, 54, 255), (235, 90, 60, 255), (120, 200, 255, 255)
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception: FONT = ImageFont.load_default()
HANG = ['idle', 'move', 'tele', 'atk', 'hit', 'die']
TEN_HANG = {'vo': 'trong vỏ (hàng báo đòn, giữ khung cuối)', 'lan': 'lăn (lặp cột 2–4 hàng đánh)', 'chieu1': 'chiêu (40% báo đòn + 60% đánh)', 'idle': 'đứng thở', 'move': 'đi', 'tele': 'báo đòn', 'atk': 'đánh', 'hit': 'trúng đòn', 'die': 'chết'}


def doc_moi(ma):
    if len(sys.argv) > 1 and sys.argv[1] == 'ra':
        d = json.load(open(os.path.join(RA, ma + '.sprite.json'), encoding='utf-8'))
        return d, np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA'))
    return doc_tam(ma)


def khung_game(d, a, ten, i):
    """khung ở cỡ game ×TL (ảnh RGBA), độ dời căn tâm"""
    k = Image.fromarray(khung_tam(d, a, ten, i)); n = d.get('net', 1)
    k = k.resize((d['khung_rong'] * TL, d['khung_cao'] * TL), Image.NEAREST)
    ct = (d.get('can_tam') or {}).get(ten) or []
    return k, (ct[i] if i < len(ct) else 0)


def ve_png():
    global TL
    TL = TLP
    ds = []
    for ma in MA:
        d, a = doc_moi(ma)
        cu = doc_tam(ma + '-cu') if os.path.exists(os.path.join(CUSTOM, ma + '-cu.sprite.json')) else doc_tam(ma)   # chưa ghi: tệp trong game vẫn là tấm cũ
        ds.append((ma, d, a, cu))
    W = max(d['khung_rong'] for _, d, _, _ in ds) * TL + 8
    LW = 150; CW = max(W, 64 * TL + 8)
    tong_h = sum(6 * (d['khung_cao'] * TL + 8) + 30 for _, d, _, _ in ds)
    img = Image.new('RGBA', (LW + CW + 6 * W + 10, tong_h + 10), (30, 30, 34, 255)); dr = ImageDraw.Draw(img)
    y = 5
    for ma, d, a, cu in ds:
        dr.text((8, y + 4), '%s · %s · net %d · ô %d×%d · neo %s · %d màu' % (ma, d['ten'], d.get('net', 1), d['khung_rong'], d['khung_cao'], d['goc'],
                len(np.unique(a[a[..., 3] > 0][:, :3], axis=0))), fill=(255, 255, 255, 255), font=FONT)
        y += 24
        gx, gy = d['goc']; H = d['khung_cao'] * TL + 8   # mỗi con cao theo ô của nó
        for R, ten in enumerate(HANG):
            dt = d['dong_tac'][ten]; y0 = y + R * H
            ghi = '%s\n%d khung · %.2f s%s%s' % (TEN_HANG[ten], dt['so'], dt['giay'], ' lặp' if dt.get('lap') else '',
                                                 ('\nphát cột %s' % dt['khung']) if dt.get('khung') else ('\nmờ từ %.2f' % dt['mo']) if dt.get('mo') else '') + (('\nlặp cột %d–%d' % (dt['lap_tu'], dt.get('lap_den', dt['so'] - 1))) if dt.get('lap_tu') is not None else '')
            dr.multiline_text((8, y0 + 8), ghi, fill=(220, 220, 220, 255), font=FONT)
            # cột tấm cũ (cùng tỉ lệ, cùng đường đất)
            if cu:
                cd, ca = cu
                if ten in cd['dong_tac']:
                    k, _ = khung_game(cd, ca, ten, 0)
                    x0 = LW + (CW - 8) // 2 - cd['goc'][0] * TL; yy = y0 + 4 + gy * TL - cd['goc'][1] * TL
                    dr.rectangle([LW, y0 + 2, LW + CW - 6, y0 + H - 4], fill=(44, 44, 50, 255))
                    cx0, cy0 = max(0, LW - x0), max(0, y0 + 2 - yy)   # tấm cũ có neo thấp hơn ô mới: cắt phần thừa phía trên, không dời hình
                    img.alpha_composite(k.crop((cx0, cy0, k.width, k.height)), (x0 + cx0, yy + cy0))
                    dr.line([(LW, y0 + 4 + gy * TL), (LW + CW - 6, y0 + 4 + gy * TL)], fill=DAT, width=1)
                    if R == 0: dr.text((LW + 4, y0 + 4), 'tấm cũ', fill=(200, 200, 200, 255), font=FONT)
            for C in range(dt['so']):
                k, ct = khung_game(d, a, ten, C)
                x0 = LW + CW + C * W
                dr.rectangle([x0 + 2, y0 + 2, x0 + W - 4, y0 + H - 4], fill=NEN)
                cx = x0 + 4 + gx * TL
                img.alpha_composite(k, (x0 + 4 + ct * TL, y0 + 4))
                dr.line([(x0 + 2, y0 + 4 + gy * TL), (x0 + W - 4, y0 + 4 + gy * TL)], fill=DAT, width=1)   # đường đất
                dr.line([(cx, y0 + 4 + gy * TL - 6), (cx, y0 + 4 + gy * TL + 6)], fill=NEO, width=1)      # điểm neo
                if dt.get('khung') and C not in dt['khung']:
                    dr.line([(x0 + 6, y0 + 6), (x0 + 30, y0 + 6)], fill=(255, 210, 80, 255), width=3)
                    dr.text((x0 + 34, y0 + 0), 'không phát', fill=(255, 210, 80, 255), font=FONT)
        y += 6 * H + 6
    img.save(os.path.join(THU, 'xem-lau.png'), optimize=True)
    print('xem-lau.png', img.size)
    TL = 3


CHIEU = {'tuongMa': 1.6, 'huChua': 1.7}
ma_dang = None


def khung_luc(d, ten, t):
    """chọn khung như js/sprite_custom.js (SC.chonQuai): hàng lặp theo giay; hàng một lần theo u = t / D (D = giay)"""
    if ten == 'vo':   # Ốc trong vỏ (js/sprite_custom.js SC.chonQuai 'vo'): chạy hàng báo đòn 0,3 s rồi giữ khung cuối
        so = d['dong_tac']['tele']['so']; return min(so - 1, int(t / 0.3 * so)), 1.0
    if ten == 'lan':  # Cá Nóc Chúa lăn (SC.chonQuai 'lan'): lặp cột lap_tu..lap_den của hàng đánh, mỗi cột giay / so
        a = d['dong_tac']['atk']; m = a.get('lap_den', a['so'] - 1) - a['lap_tu'] + 1; return a['lap_tu'] + int(t / (a['giay'] / a['so']) + 1e-6) % m, 1.0
    if ten == 'chieu1':  # tinh anh: SC.chonQuai /^chieu/ — 40% đầu hàng báo đòn, 60% sau hàng đánh (theo bảng khung); D = 1,6 / 1,7 s (MA.dur)
        D = CHIEU[ma_dang]; u = t / D
        if u < 0.4: return khung_luc(d, 'tele', u / 0.4 * d['dong_tac']['tele']['giay'])
        return khung_luc(d, 'atk', (u - 0.4) / 0.6 * d['dong_tac']['atk']['giay'])
    dt = d['dong_tac'][ten]; so = dt['so']; D = dt['giay']
    if dt.get('lap'): return int(t / (D / so) + 1e-6) % so, 1.0
    if dt.get('lap_tu') is not None and t >= D:   # Nhím lăn: hết một lượt thì lặp từ cột lap_tu (js/sprite_custom.js SC.chonQuai)
        m = dt.get('lap_den', so - 1) - dt['lap_tu'] + 1; return dt['lap_tu'] + int((t - D) / (D / so) + 1e-6) % m, 1.0
    u = min(1.0, max(0.0, t / D))
    if dt.get('khung'):
        ds = dt['khung']; i = ds[min(len(ds) - 1, int(u * len(ds)))]
    else: i = min(so - 1, int(u * so))
    al = 1.0
    if ten == 'die': mo = dt.get('mo', 0.6); al = 1 - min(1, max(0, (u - mo) / (1 - mo)))
    return i, al


def hang_ve(d, ten, t):
    if ten == 'lan': return 'atk'
    if ten == 'chieu1': return 'tele' if t / CHIEU[ma_dang] < 0.4 else 'atk'
    return ten


def ve_gif():
    FPS = 25; dtk = 1.0 / FPS
    ds = [(ma,) + doc_moi(ma) for ma in MA]
    W = max(d['khung_rong'] for _, d, _ in ds) * TL + 40; H = max(d['khung_cao'] for _, d, _ in ds) * TL + 46
    anh = []
    for ma, d, a in ds:
        gx, gy = d['goc']
        global ma_dang
        ma_dang = ma
        lich = [('idle', 2 * d['dong_tac']['idle']['giay']), ('move', 3 * d['dong_tac']['move']['giay']), ('tele', d['dong_tac']['tele']['giay'])]
        if ma == 'huLua': lich += [('lan', 0.7)]   # lăn tới (len / toc ~0,7 s) rồi vỡ: hàng đánh theo bảng khung [4, 5]
        lich += [('atk', d['dong_tac']['atk']['giay']), ('idle', 0.4)]
        if ma in CHIEU: lich += [('chieu1', CHIEU[ma]), ('idle', 0.4)]
        lich += [('hit', d['dong_tac']['hit']['giay']), ('idle', 0.4), ('die', d['dong_tac']['die']['giay']), (None, 0.3)]
        for ten, T in lich:
            for j in range(max(1, int(round(T / dtk)))):
                t = j * dtk
                im = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(im)
                dr.text((6, 4), '%s · %s%s' % (ma, TEN_HANG.get(ten, ''), ' (%.2f s)' % T if ten else ''), fill=(255, 255, 255, 255), font=FONT)
                ox, oy = W // 2 - gx * TL, 30
                dr.line([(0, oy + gy * TL), (W, oy + gy * TL)], fill=DAT, width=1)
                if ten:
                    i, al = khung_luc(d, ten, t)
                    k, ct = khung_game(d, a, hang_ve(d, ten, t), i)
                    if al < 1: k.putalpha(Image.fromarray((np.array(k)[..., 3] * al).astype(np.uint8)))
                    im.alpha_composite(k, (ox + ct * TL, oy))
                anh.append(im.convert('RGB'))
    mau = anh[::max(1, len(anh) // 96)]   # bảng màu chung lấy từ mẫu khung của cả 10 con (không lấy riêng khung đầu: lệch màu)
    ghep = Image.new('RGB', (mau[0].width, mau[0].height * len(mau)))
    for j, f in enumerate(mau): ghep.paste(f, (0, j * f.height))
    pal = ghep.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in anh]
    q[0].save(os.path.join(THU, 'xem-lau.gif'), save_all=True, append_images=q[1:], duration=int(1000 / FPS), loop=0, optimize=True)
    print('xem-lau.gif', len(q), 'khung', (W, H))


ve_png(); ve_gif()
