"""Ảnh tổng hợp xem-muot.png + noi-dong-tac.png + khung-trang-trum.png + cu-ti-nhip.png (đặt thẳng vào thư mục báo cáo)."""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from phan_tich import nap, cat, QUAI, SP
from ve import font, chu, len_nen, bang_hang

OUT = sys.argv[1]
K = json.load(open(os.path.join(SP, 'so_lieu.json')))
SO = json.load(open(os.path.join(SP, 'so.json')))
BG = (20, 20, 24, 255)
DO, VANG, XANH, XAM = (200, 60, 60, 255), (210, 160, 40, 255), (60, 160, 90, 255), (70, 70, 80, 255)
Q = {q['ma']: q for q in K['quai']}


def fps_thuc(q, ten):
    r = q['hang'].get(ten)
    if not r: return None
    so = len(r['khung']) if r.get('khung') else r['so']
    if ten in ('idle', 'move'): return so / r['giay']
    if ten == 'tele':
        b = SO.get(q['ma'], {}).get('bao') or r.get('D_game')
        return so / b
    D = r.get('D_game') or r['giay']
    return so / D


def mau(ten, f):
    if f is None: return XAM
    nguong = {'idle': (4, 5), 'die': (4, 5)}.get(ten, (7, 10))
    return DO if f < nguong[0] else VANG if f < nguong[1] else XANH


def bang_nhiet():
    cols = ['idle', 'move', 'tele', 'atk', 'hit', 'die']
    nhan = ['đứng', 'đi', 'báo đòn', 'đánh', 'trúng', 'chết']
    cw, ch, lw = 62, 19, 112
    ds = QUAI
    im = Image.new('RGBA', (lw + cw * len(cols) + 10, 40 + ch * len(ds) + 10), BG)
    d = ImageDraw.Draw(im)
    chu(im, (6, 2), 'Khung/giây THỰC trong game — 30 quái thường', 13, (255, 220, 120, 255))
    for j, n in enumerate(nhan): chu(im, (lw + j * cw + 4, 21), n, 11)
    for i, ma in enumerate(ds):
        y = 40 + i * ch; q = Q[ma]
        chu(im, (6, y + 2), ma, 11)
        for j, c in enumerate(cols):
            f = fps_thuc(q, c); r = q['hang'].get(c, {})
            d.rectangle([lw + j * cw, y, lw + j * cw + cw - 3, y + ch - 3], fill=mau(c, f))
            s = f'{f:.0f}' if f else '-'
            if r.get('lech_chan', 0) >= 6 and c not in ('die',): s += ' ↕'
            chu(im, (lw + j * cw + 5, y + 2), s, 11, (255, 255, 255, 255))
    return im


def bang_trum():
    ds = [m for m in Q if Q[m]['loai'] == 'trum']
    cw, ch, lw = 44, 19, 100
    cols = ['idle', 'move', 'tele', 'atk', 'hit', 'die']
    im = Image.new('RGBA', (lw + cw * 6 + 10, 40 + ch * len(ds) + 26), BG); d = ImageDraw.Draw(im)
    chu(im, (6, 2), 'Trùm: số khung mỗi hàng (phát ~12 khung/giây)', 12, (255, 220, 120, 255))
    for j, n in enumerate(['đứng', 'đi', 'báo', 'đánh', 'trúng', 'chết']): chu(im, (lw + j * cw + 3, 21), n, 11)
    for i, ma in enumerate(ds):
        y = 40 + i * ch; chu(im, (6, y + 2), ma, 11)
        for j, c in enumerate(cols):
            r = Q[ma]['hang'].get(c)
            if not r:
                d.rectangle([lw + j * cw, y, lw + j * cw + cw - 3, y + ch - 3], fill=XAM); continue
            tr = max([x for x in r['trang'] if x is not None])
            col = DO if (c == 'atk' and r['so'] <= 3) or tr > 0.14 else VANG if (c == 'atk' and r['so'] == 4) else XANH
            d.rectangle([lw + j * cw, y, lw + j * cw + cw - 3, y + ch - 3], fill=col)
            chu(im, (lw + j * cw + 5, y + 2), str(r['so']) + (' T' if tr > 0.14 else ''), 11, (255, 255, 255, 255))
    chu(im, (6, 40 + ch * len(ds) + 6), 'T = khung trúng đòn trắng gần hết thân; đỏ = quá ít khung', 11)
    return im


def bang_cuti():
    z = K['zed']['hang']
    ds = ['dung', 'di', 'chay', 'lon', 'trung', 'chet', 'kiem_1', 'kiem_2', 'kiem_3', 'thuong_1', 'thuong_2', 'thuong_3', 'thuong_quet', 'thuong_xoc',
          'bua_nen', 'bua_nen_dat', 'bua_giu', 'phitieu', 'phitieu_chum', 'thuong_giu', 'phitieu_ngam', 'chuong', 'dam']
    lw, bw, ch = 104, 220, 17
    im = Image.new('RGBA', (lw + bw + 120, 40 + ch * len(ds) + 8), BG); d = ImageDraw.Draw(im)
    chu(im, (6, 2), 'Cu Tí — khung/giây mỗi động tác', 13, (255, 220, 120, 255))
    chu(im, (6, 20), 'vạch: 12 khung/giây', 11, (160, 160, 170, 255))
    x12 = lw + int(12 / 25 * bw); d.line([(x12, 36), (x12, 40 + ch * len(ds))], fill=(120, 120, 140, 255))
    for i, t in enumerate(ds):
        r = z[t]; y = 40 + i * ch; f = r['fps'] * (0.8 if r['lap'] else 1)
        chu(im, (6, y + 1), t, 11)
        c = DO if f < 7 else VANG if f < 11 else XANH
        d.rectangle([lw, y + 2, lw + int(min(f, 25) / 25 * bw), y + ch - 3], fill=c)
        ghi = f'{f:.1f}'
        if r['trung']: ghi += f"  {len(r['trung'])} khung gần trùng"
        chu(im, (lw + int(min(f, 25) / 25 * bw) + 4, y + 1), ghi, 11)
    return im


def bang_hu():
    H = K['hu']
    bins = [(0, 6, '<6'), (6, 9, '6–9'), (9, 12, '9–12'), (12, 20, '12–20'), (20, 99, '≥20')]
    lw, bw = 70, 200
    im = Image.new('RGBA', (lw + bw + 120, 150), BG); d = ImageDraw.Draw(im)
    chu(im, (6, 2), f'Hiệu ứng ảnh (hu-*, {len(H)} tấm): khung/giây', 13, (255, 220, 120, 255))
    mx = max(sum(1 for h in H if a <= h['fps'] < b) for a, b, _ in bins)
    for i, (a, b, n) in enumerate(bins):
        k = sum(1 for h in H if a <= h['fps'] < b); y = 26 + i * 20
        chu(im, (6, y), n, 11)
        d.rectangle([lw, y + 2, lw + int(k / mx * bw), y + 15], fill=DO if b <= 9 else VANG if b <= 12 else XANH)
        chu(im, (lw + int(k / mx * bw) + 4, y), str(k), 11)
    tat = [h for h in H if not h['lap'] and h['cuoi_con'] >= 0.9]
    chu(im, (6, 130), f'{len(tat)} hiệu ứng một lần còn đậm ở khung cuối → tắt phụt', 11, (255, 160, 160, 255))
    return im


def o_khung(ma, ten, i, sc=1.0):
    d, im = nap(ma); a = d['dong_tac'][ten]
    k = Image.fromarray(cat(d, im, a['hang'], a['so'])[i], 'RGBA')
    f = len_nen(k, (40, 42, 52, 255))
    return f.resize((int(f.width * sc), int(f.height * sc)), Image.NEAREST)


def noi_dong_tac():
    CASES = [('caNocChua', 'tele', 5, 'atk', 0, 'Cá Nóc Chúa: báo đòn (phồng hết cỡ) → khung đánh 1 nhỏ lại, cỡ ×2,3, chân lệch 21'),
             ('caNoc', 'tele', 5, 'atk', 2, 'Cá Nóc: báo đòn phồng → khung đánh đầu tiên được phát, cỡ ×1,66'),
             ('nhimDoc', 'tele', 5, 'atk', 0, 'Nhím Gai Độc: cuộn tròn → bung, cỡ ×1,81'),
             ('nhim', 'atk', 3, 'idle', 0, 'Nhím Biển: lăn (gai bung) → đứng, cỡ ×1,78, không có khung thu gai'),
             ('mocTinh-p3', 'atk', 3, 'idle', 0, 'Mộc Tinh pha 3: đánh → đứng, cỡ ×1,43'),
             ('heoNanh', 'hit', 0, 'hit', 1, 'Heo Nanh Dài: trúng đòn khung 1 (chồm lên) → khung 2 (đứng thấp): đổi dáng đột ngột'),
             ('heoCon', 'atk', 4, 'idle', 0, 'Heo Rừng Con: khung đánh CUỐI THỰC PHÁT (k5, bị cắt 75%) → đứng; k6 thu đòn không bao giờ hiện')]
    rows = []
    for ma, a, i, b, j, ghi in CASES:
        sc = 1.0 if Q[ma]['khung'][0] < 100 else 0.6
        A, B = o_khung(ma, a, i, sc), o_khung(ma, b, j, sc)
        h = max(A.height, B.height)
        r = Image.new('RGBA', (900, h + 30), BG)
        chu(r, (10, 4), f'{ma}: {a} k{i+1} → {b} k{j+1}', 12, (255, 220, 120, 255))
        r.paste(A, (10, 24)); ImageDraw.Draw(r).text((18 + A.width, 24 + h // 2 - 10), '→', fill=(255, 200, 80, 255), font=font(18))
        r.paste(B, (40 + A.width, 24))
        x = 56 + A.width + B.width; dong = []; cur = ''
        for tu in ghi.split(' '):
            if font(12).getlength(cur + ' ' + tu) > 900 - x - 10: dong.append(cur); cur = tu
            else: cur = (cur + ' ' + tu).strip()
        dong.append(cur)
        for k, dg in enumerate(dong): chu(r, (x, 24 + h // 2 - 8 * len(dong) + 16 * k), dg, 12)
        rows.append(r)
    o = Image.new('RGBA', (900, sum(r.height for r in rows) + 30), BG)
    chu(o, (10, 6), 'Nối động tác bị "bật" — hai khung liền nhau khi đổi động tác (cùng tỉ lệ, 1 ô = 2 điểm ảnh game)', 13)
    y = 30
    for r in rows: o.paste(r, (0, y)); y += r.height
    return o


def khung_trang():
    CASES = [('hoLua-p2', 'hit', 1), ('namChua-p2', 'hit', 2), ('mocTinh-p2', 'hit', 2), ('cuaDa', 'hit', 2)]
    rows = []
    for ma, ten, i in CASES:
        b = bang_hang(ma, ten, 1.2, chan=False)
        tr = Q[ma]['hang'][ten]['trang'][i]
        r = Image.new('RGBA', (max(620, b.width + 20), b.height + 24), BG)
        chu(r, (10, 4), f'{ma} · {ten} · khung {i+1} trắng {tr*100:.0f}% thân' + ('  (ĐÃ vá bằng code 15/10)' if ma in ('mocTinh-p2', 'cuaDa') else '  (CHƯA có trong danh sách vá)'), 12,
            (255, 160, 160, 255) if ma in ('hoLua-p2', 'namChua-p2') else (160, 220, 160, 255))
        r.paste(b, (10, 22), b); rows.append(r)
    W = max(r.width for r in rows)
    o = Image.new('RGBA', (W, sum(r.height for r in rows)), BG); y = 0
    for r in rows: o.paste(r, (0, y)); y += r.height
    return o


def xep(ds, W, gap=14):
    """xếp ảnh theo hàng, tự xuống dòng."""
    hang = []; cur = []; w = 0
    for im in ds:
        if cur and w + im.width + gap > W: hang.append(cur); cur = []; w = 0
        cur.append(im); w += im.width + gap
    if cur: hang.append(cur)
    H = sum(max(i.height for i in h) + gap for h in hang)
    o = Image.new('RGBA', (W, H), BG); y = 0
    for h in hang:
        x = 0
        for im in h: o.paste(im, (x, y)); x += im.width + gap
        y += max(i.height for i in h) + gap
    return o


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    nd = noi_dong_tac(); nd.convert('RGB').save(f'{OUT}/noi-dong-tac.png', optimize=True)
    kt = khung_trang(); kt.convert('RGB').save(f'{OUT}/khung-trang-trum.png', optimize=True)
    bn, bt, bc, bh = bang_nhiet(), bang_trum(), bang_cuti(), bang_hu()
    W = 1360
    tren = xep([bn, bt, bc], W)
    duoi = xep([bh, nd.resize((int(nd.width * 0.92), int(nd.height * 0.92)), Image.NEAREST)], W)
    head = Image.new('RGBA', (W, 54), BG)
    chu(head, (10, 6), 'XEM ĐỘ MƯỢT — số đo từ chính ảnh sprite + nhịp trong code (không chạy game)', 18, (255, 230, 150, 255))
    chu(head, (10, 32), 'Màu ô: đỏ = khựng (ít khung/giây) · vàng = tạm · xanh = mượt.  ↕ = khung trong hàng nhảy chân ≥ 6 điểm ảnh (nhảy/bay cố ý thì bỏ qua)', 12)
    o = Image.new('RGBA', (W, head.height + tren.height + duoi.height + 10), BG)
    o.paste(head, (0, 0)); o.paste(tren, (10, head.height)); o.paste(duoi, (10, head.height + tren.height))
    o.convert('RGB').save(f'{OUT}/xem-muot.png', optimize=True)
    print(o.size, nd.size, kt.size)
