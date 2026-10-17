#!/usr/bin/env python3
"""Xuất IDLE 6 khung (8 FPS, ô 64×64, pivot [32,63]) của prototype Lam 3/4 bằng Chromium headless, ghi vào proto-lam/out/idle/:
  idle-0.png … idle-5.png       từng khung 64×64 nền trong suốt
  idle-x4.png, idle-x8.png      6 khung cạnh nhau có số (nearest-neighbor)
  idle.gif                      ×4, 8 FPS, lặp
  overlay-mau.png               ảnh mẫu (cùng chiều cao) | render mượt | chồng 50% | viền silhouette 2 màu
  so-sanh-mau-x4.png            mẫu | khung 1 ×4
  so-sanh-v2-v3-x4.png          khung 1 vòng 2 (vong2-idle-0.png, giữ lại để so) | khung 1 vòng 3 | mẫu – ×4   (so-sanh-v1-v2-x4.png của vòng 2 giữ nguyên)
  kiem-tra.json                 số màu, bbox từng khung, mặt nạ ủng, bề rộng thân trước/sau, độ cao đầu kiếm trước/sau, kiếm liền tay, chuông ngoài mũ + dây liền, vạt áo, sai khác pixel giữa các khung (khép vòng)
và sheet thử cho game:  game/anim/lam-idle-proto.png (512×320, hàng 0 = idle) + lam-idle-proto.anim.json
Chạy:  python3 proto-lam/xuat-idle.py [--xem]   (--xem: chỉ ghi overlay + idle-x8 vào out/idle/ để chỉnh mô hình nhanh)
"""
import base64, io, json, os, sys, time
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(HERE, 'out', 'idle')
GAME_ANIM = os.path.join(ROOT, 'game', 'anim')
MAU = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-48', 'nguyen-con-v2-mat-sang.png')
CAO = 44          # cấu hình ô 64 (ppu 42)
FPS = 8
NEN = (42, 36, 51, 255)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
PAL = ['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']


def chu(c):
    try: return ImageFont.truetype(FONT, c)
    except Exception: return ImageFont.load_default()


def dung(cam=None):
    from playwright.sync_api import sync_playwright
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']
    with sync_playwright() as pw:
        kw = {'args': args}
        if os.path.isfile('/opt/pw-browsers/chromium'): kw['executable_path'] = '/opt/pw-browsers/chromium'
        br = pw.chromium.launch(**kw)
        page = br.new_page()
        loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.goto('file://' + os.path.join(HERE, 'proto.html'))
        page.wait_for_function('window.PROTO && window.THREE', timeout=30000)
        if cam: page.evaluate('(c) => { Object.assign(PROTO.CAM, c); }', cam)
        t0 = time.time()
        data = page.evaluate('(cao) => PROTO.xuatIdle(cao)', CAO)
        br.close()
    if loi: sys.exit('Lỗi JS: ' + '; '.join(loi))
    print('render idle: %.1fs · lệch khép vòng mô phỏng ≈ %.3f px' % (time.time() - t0, data['lechVong'] * data['ppu']))
    return data


def anh(f, n):
    return Image.frombytes('RGBA', (n, n), base64.b64decode(f['px']))


def mat_na_id(f, n):
    return list(base64.b64decode(f['id']))


def bbox(im):
    return im.getchannel('A').point(lambda v: 255 if v > 0 else 0).getbbox()


def dem_mau(im):
    return sorted(set(px for px in im.getdata()))


def mau_scaled(h_px):
    """Ảnh mẫu cắt theo bbox nhân vật, đưa về chiều cao h_px (lọc vùng), nền trong suốt."""
    im = Image.open(MAU).convert('RGB')
    bg = im.getpixel((0, 0))
    a = im.point(lambda v: v)  # copy
    px = im.load(); W, H = im.size
    mask = Image.new('L', im.size, 0); mp = mask.load()
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > 90: mp[x, y] = 255
    im = im.convert('RGBA'); im.putalpha(mask)
    bb = mask.getbbox(); im = im.crop(bb)
    s = h_px / im.height
    return im.resize((max(1, round(im.width * s)), h_px), Image.LANCZOS)


def overlay(data, frames, muot):
    """mẫu | render | chồng 50% | silhouette 2 màu — tất cả cùng chiều cao nhân vật, phóng ×6 từ cỡ pixel."""
    n = data['cell']; im0 = frames[0]
    bb = bbox(im0); hchar = bb[3] - bb[1] + 1
    S = 6
    mau = mau_scaled(hchar * S)
    # render mượt: cắt vùng bbox của khung pixel (cùng camera, 512 = 64 ô → 8 px/ô)
    k = muot.width / n
    ren = muot.crop((int(bb[0] * k), int(bb[1] * k), int((bb[2] + 1) * k), int((bb[3] + 1) * k))).resize((round((bb[2] - bb[0] + 1) * S), hchar * S), Image.LANCZOS)
    pxl = im0.crop((bb[0], bb[1], bb[2] + 1, bb[3] + 1)).resize(((bb[2] - bb[0] + 1) * S, hchar * S), Image.NEAREST)
    # căn theo pivot ngang: mẫu – lấy giữa bbox chân (hàng dưới cùng); render – pivot x
    def chan_x(im):
        a = im.getchannel('A'); w, h = im.size; xs = [x for x in range(w) if a.getpixel((x, h - 2)) > 0]
        return (min(xs) + max(xs)) / 2 if xs else w / 2
    W1 = max(mau.width, ren.width, pxl.width) + 20
    def o(im): return Image.new('RGBA', (W1, hchar * S), (0, 0, 0, 0))
    def dat(im, ox=None):
        c = o(im); cx = chan_x(im); c.alpha_composite(im, (int(W1 / 2 - cx), 0)); return c
    A = dat(mau); Bm = dat(ren); Bp = dat(pxl)
    chong = Image.blend(A, Bm, 0.5)
    chong2 = Image.blend(A, Bp, 0.5)
    # silhouette: mẫu đỏ, render xanh, chồng nhau
    def sil(im, col):
        a = im.getchannel('A').point(lambda v: 255 if v > 40 else 0); s = Image.new('RGBA', im.size, col); s.putalpha(a); return s
    sA = sil(A, (230, 70, 90, 255)); sB = sil(Bp, (80, 180, 240, 255))
    sl = Image.new('RGBA', A.size, (0, 0, 0, 0)); sl.alpha_composite(sA)
    sB2 = sB.copy(); sB2.putalpha(sB.getchannel('A').point(lambda v: 150 if v else 0)); sl.alpha_composite(sB2)
    cot = [('mẫu (cùng cao)', A), ('render 3D mượt', Bm), ('pixel 64 ×6', Bp), ('chồng 50% mẫu/mượt', chong), ('chồng 50% mẫu/pixel', chong2), ('silhouette: đỏ=mẫu, xanh=pixel', sl)]
    fnt = chu(13); H = hchar * S + 30
    out = Image.new('RGBA', (W1 * len(cot), H), NEN); dr = ImageDraw.Draw(out)
    for i, (t, im) in enumerate(cot):
        out.alpha_composite(im, (i * W1, 24)); dr.text((i * W1 + 4, 4), t, font=fnt, fill=(230, 235, 240, 255))
    dr.text((4, H - 14), 'cam az %s° el %s° · cao nhân vật %d px (ô %d, ppu %d)' % (data['cam']['az'], data['cam']['el'], hchar, n, data['ppu']), font=chu(11), fill=(138, 150, 166, 255))
    return out


def day_khung(frames, S, so=True):
    n = frames[0].width; W = len(frames) * (n * S + 4) + 4; H = n * S + (18 if so else 0) + 8
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); fnt = chu(12)
    for i, im in enumerate(frames):
        x = 4 + i * (n * S + 4); y = 4
        out.alpha_composite(im.resize((n * S, n * S), Image.NEAREST), (x, y))
        dr.rectangle([x, y, x + n * S - 1, y + n * S - 1], outline=(60, 70, 85, 255))
        if so: dr.text((x + 3, y + n * S + 3), str(i + 1), font=fnt, fill=(138, 150, 166, 255))
    return out


def so_sanh_x4(frames):
    im0 = frames[0]; bb = bbox(im0); hchar = bb[3] - bb[1] + 1
    mau = mau_scaled(hchar * 4)
    pxl = im0.resize((im0.width * 4, im0.height * 4), Image.NEAREST)
    H = max(mau.height, pxl.height) + 28; W = mau.width + pxl.width + 24
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); fnt = chu(12)
    out.alpha_composite(mau, (8, 20 + (H - 28 - mau.height))); dr.text((8, 4), 'mẫu (thu về cùng cao)', font=fnt, fill=(230, 235, 240, 255))
    out.alpha_composite(pxl, (mau.width + 16, 20)); dr.text((mau.width + 16, 4), 'khung 1 ×4', font=fnt, fill=(230, 235, 240, 255))
    return out


def so_sanh_vong(frames, truoc='vong2-idle-0.png', ten_truoc='khung 1 – vòng 2', ten_sau='khung 1 – vòng 3'):
    v1p = os.path.join(OUT, truoc)
    if not os.path.isfile(v1p): return None
    v1 = Image.open(v1p).convert('RGBA'); im0 = frames[0]; bb = bbox(im0); hchar = bb[3] - bb[1] + 1
    mau = mau_scaled(hchar * 4)
    cot = [(ten_truoc, v1.resize((v1.width * 4, v1.height * 4), Image.NEAREST)), (ten_sau, im0.resize((im0.width * 4, im0.height * 4), Image.NEAREST)), ('mẫu (cùng cao)', mau)]
    H = max(im.height for _, im in cot) + 28; W = sum(im.width for _, im in cot) + 8 * (len(cot) + 1)
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); fnt = chu(12); x = 8
    for t, im in cot:
        out.alpha_composite(im, (x, 20 + (H - 28 - im.height))); dr.text((x, 4), t, font=fnt, fill=(230, 235, 240, 255)); x += im.width + 8
    return out


def gif(frames, duong_dan, S=4):
    n = frames[0].width; ims = []
    for im in frames:
        bg = Image.new('RGBA', (n, n), NEN); bg.alpha_composite(im)
        ims.append(bg.resize((n * S, n * S), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=32))
    ims[0].save(duong_dan, save_all=True, append_images=ims[1:], duration=int(1000 / FPS), loop=0, disposal=2)


def kiem_tra(data, frames):
    n = data['cell']; kq = {'soKhung': len(frames), 'fps': FPS, 'o': n, 'pivot': [32, 63]}
    tat = set()
    for im in frames: tat |= set(im.getdata())
    mau = sorted(tat, key=lambda c: (c[3], c))
    kq['soMauKeCaTrongSuot'] = len(mau)
    kq['mau'] = ['#%02X%02X%02X' % c[:3] if c[3] else 'trong suốt' for c in mau]
    kq['mauNgoaiBang'] = [m for m in kq['mau'] if m != 'trong suốt' and m not in PAL]
    kq['bbox'] = [list(bbox(im)) for im in frames]
    kq['caoNhanVat'] = [b[3] - b[1] + 1 for b in kq['bbox']]
    kq['pivotRender'] = [f['pivot'] for f in data['frames']]
    ids = [mat_na_id(f, n) for f in data['frames']]; pxs = [list(im.getdata()) for im in frames]
    # mặt nạ ỦNG theo ID (vòng 2): ID 15/16 = vạch cổ ủng, 18/19 = ống ủng + bàn chân. Hai bàn chân phải đứng yên tuyệt đối:
    # tập pixel mang ID ủng (hợp của 6 khung) phải có cùng ID và cùng màu ở cả 6 khung. Áo choàng dài ĐƯỢC chạm hàng 58–63 (chỉ báo cho biết).
    ID_UNG = {15, 16, 18, 19}
    mask = sorted(set(i for d in ids for i, v in enumerate(d) if v in ID_UNG))
    kq['ungSoPixel'] = len(mask)
    kq['ungBbox'] = [min(i % n for i in mask), min(i // n for i in mask), max(i % n for i in mask), max(i // n for i in mask)] if mask else None
    kq['ungKhac'] = [[i % n, i // n, [d[i] for d in ids], ['#%02X%02X%02X' % p[i][:3] if p[i][3] else '-' for p in pxs]] for i in mask if any(d[i] != ids[0][i] or p[i] != pxs[0][i] for d, p in zip(ids, pxs))]
    kq['ungCoDinh'] = not kq['ungKhac']
    kq['chanCoDinh'] = kq['ungCoDinh']   # tên cũ (vòng 1) – nay = mặt nạ ủng theo ID
    yC = n - 6
    chan = [im.crop((0, yC, n, n)).tobytes() for im in frames]
    kq['hang58_63GiongNhau'] = all(c == chan[0] for c in chan)   # chỉ tham khảo: áo choàng được phép chạm vùng này
    kq['hang58_63SoPixelKhac'] = sum(1 for i in range(yC * n, n * n) if any(p[i] != pxs[0][i] for p in pxs))
    kq['hang58_63KhacTheoID'] = sorted(set(d[i] for d in ids for i in range(yC * n, n * n) if any(p[i] != pxs[0][i] for p in pxs)))
    # vạch cổ ủng ≥ 2 hàng, chuôi/chắn/dây/trâm/mắt còn ở mọi khung
    def dem(idv): return [sum(1 for v in d if v == idv) for d in ids]
    def cao_id(idv):
        out = []
        for d in ids:
            ys = [i // n for i, v in enumerate(d) if v == idv]; out.append(max(ys) - min(ys) + 1 if ys else 0)
        return out
    kq['vachUngCaoHang'] = {'gan': cao_id(16), 'xa': cao_id(15)}
    kq['soPixel'] = {'chuoiChan': dem(11), 'dayChuong': dem(13), 'chuong': dem(12), 'tram': dem(17), 'luoi': dem(10)}
    kq['matSang'] = [sum(1 for p in px if p[:3] == (0xF3, 0xE6, 0xC8)) for px in pxs]   # #F3E6C8: 2 mắt + chỏm chuông
    # dây chuông liền: cột dây phải nối thẳng vào pixel chuông bên dưới
    def day_lien(d):
        ds = [(i % n, i // n) for i, v in enumerate(d) if v == 13]
        if not ds: return False
        return all(any(d[(y + 1) * n + x] in (12, 13) for _ in [0]) for x, y in ds)
    kq['dayChuongLien'] = [day_lien(d) for d in ids]
    # sai khác pixel giữa khung kề nhau và 6→1
    def diff(a, b):
        pa, pb = a.getdata(), b.getdata(); return sum(1 for u, v in zip(pa, pb) if u != v)
    kq['saiKhacKeNhau'] = [diff(frames[i], frames[(i + 1) % len(frames)]) for i in range(len(frames))]   # phần tử cuối = khung 6 → khung 1
    kq['lechKhepVongMoPhongPx'] = round(data['lechVong'] * data['ppu'], 4)
    # chuông / kiếm: vị trí theo ID
    ID_LUOI, ID_CHUONG = 10, 12
    def tam(ids, idv):
        pts = [(i % n, i // n) for i, v in enumerate(ids) if v == idv]
        if not pts: return None
        return [round(sum(p[0] for p in pts) / len(pts), 1), round(sum(p[1] for p in pts) / len(pts), 1), len(pts)]
    kq['tamLuoiKiem'] = [tam(mat_na_id(f, n), ID_LUOI) for f in data['frames']]
    kq['tamChuong'] = [tam(mat_na_id(f, n), ID_CHUONG) for f in data['frames']]
    kq.update(kiem_tra_vong3(ids, pxs, n))
    return kq


def kiem_tra_vong3(ids, pxs, n):
    """Số liệu cho 3 điểm sửa của vòng 3, so với khung 1 vòng 2 (vong2-id-0.png = mặt nạ ID khung 1 vòng 2, vong2-idle-0.png = ảnh)."""
    kq = {}
    v2p = os.path.join(OUT, 'vong2-id.png')   # dải 6 mặt nạ ID 64×64 của 6 khung vòng 2 (giá trị pixel = ID bộ phận)
    ids2 = None
    if os.path.isfile(v2p):
        st = Image.open(v2p).convert('L'); ids2 = [list(st.crop((i * n, 0, (i + 1) * n, n)).getdata()) for i in range(st.width // n)]
    id2 = ids2[0] if ids2 else None
    ID_THAN = (4, 14, 17)            # thân áo xanh + đai + trâm (không tính tay, áo choàng)
    ID_UNG = (15, 16, 18, 19)
    def be_rong(d, hang, idv):
        out = {}
        for y in hang:
            xs = [x for x in range(n) if d[y * n + x] in idv]
            out[str(y)] = (max(xs) - min(xs) + 1) if xs else 0
        return out
    def bb_id(d, idv):
        pts = [(i % n, i // n) for i, v in enumerate(d) if v in idv]
        return [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)] if pts else None
    def dau_kiem(d):   # đầu kiếm = pixel lưỡi (ID 10) xa nhất về bên phải (Lam nhìn sang phải); lấy hàng thấp nhất nếu có vài pixel cùng cột
        pts = [(i % n, i // n) for i, v in enumerate(d) if v == 10]
        if not pts: return None
        mx = max(p[0] for p in pts); return [mx, max(p[1] for p in pts if p[0] == mx)]
    HANG_NGUC = range(40, 46)
    # 2) bề rộng thân ngang ngực (hàng 40–45) trước/sau – phải bằng nhau
    kq['beRongThanNguc'] = {'hang': [40, 45], 'truoc_v2': [be_rong(d, HANG_NGUC, ID_THAN) for d in ids2] if ids2 else None, 'sau_v3': [be_rong(d, HANG_NGUC, ID_THAN) for d in ids]}
    kq['beRongThanBangNhau'] = bool(ids2) and kq['beRongThanNguc']['truoc_v2'] == kq['beRongThanNguc']['sau_v3']   # từng khung vòng 2 == khung tương ứng vòng 3
    # 2) áo choàng xoè ra sau: bbox áo (ID 5) trước/sau; ủng: bbox ủng trước/sau (mũi/gót)
    kq['aoBbox'] = {'truoc_v2': bb_id(id2, (5,)) if id2 else None, 'sau_v3': [bb_id(d, (5,)) for d in ids]}
    kq['aoXoeThemPx'] = [(kq['aoBbox']['truoc_v2'][0] - b[0]) for b in kq['aoBbox']['sau_v3']] if id2 else None   # cột trái bbox áo lùi ra sau bao nhiêu px (khung 1 vòng 2 → từng khung vòng 3)
    kq['ungBboxTruocSau'] = {'truoc_v2': bb_id(id2, ID_UNG) if id2 else None, 'sau_v3': bb_id(ids[0], ID_UNG), 'thanUng_truoc_v2': bb_id(id2, (18, 19)) if id2 else None, 'thanUng_sau_v3': bb_id(ids[0], (18, 19))}
    def hang_ung(d):   # cột trái/phải của thân ủng (18/19) theo hàng – để thấy gót/mũi nhô
        out = {}
        for y in range(54, n):
            xs = [x for x in range(n) if d[y * n + x] in (18, 19)]
            if xs: out[str(y)] = [min(xs), max(xs)]
        return out
    kq['ungTheoHang'] = {'truoc_v2': hang_ung(id2) if id2 else None, 'sau_v3': hang_ung(ids[0])}
    # 2) vạt áo: đáy áo theo cột → mũi vạt = cột thấp hơn hẳn 2 cột bên cạnh; ghi [x, hàng đáy, bề rộng mũi (pixel áo liền nhau ở hàng đáy)]
    def vat(d):   # mũi vạt = cụm cột liền nhau có cùng đáy, rộng ≤ 2, hai cột kề bên ngoài có đáy cao hơn (hoặc không có áo); ghi [x đầu, hàng đáy, bề rộng mũi, dài vạt = đáy − đáy nông nhất của 2 cột bên]
        day = {}
        for x in range(n):
            ys = [y for y in range(n) if d[y * n + x] == 5]
            if ys and max(ys) >= 50: day[x] = max(ys)   # chỉ xét gấu (hàng ≥ 50), bỏ mép vai
        out = []; x = 0
        while x < n:
            if x not in day: x += 1; continue
            x2 = x
            while x2 + 1 in day and day[x2 + 1] == day[x]: x2 += 1
            y = day[x]; tr, ph = day.get(x - 1, -1), day.get(x2 + 1, -1)
            if x2 - x + 1 <= 2 and tr < y and ph < y: out.append([x, y, x2 - x + 1, y - max(tr, ph)])
            x = x2 + 1
        return out
    kq['vatAo'] = {'truoc_v2': vat(id2) if id2 else None, 'sau_v3': [vat(d) for d in ids]}
    # 3) độ cao đầu kiếm trước/sau (hàng pixel; số lớn = thấp hơn)
    dk2 = dau_kiem(id2) if id2 else None; dk3 = [dau_kiem(d) for d in ids]
    kq['dauKiem'] = {'truoc_v2': dk2, 'sau_v3': dk3, 'haXuongPx': [(k[1] - dk2[1]) if (dk2 and k) else None for k in dk3]}
    # 3) kiếm liền tay: tập pixel {bàn tay xa (6) + chuôi/chắn (11) + lưỡi (10)} phải là MỘT thành phần liên thông 4 (không pixel trong suốt cắt ngang),
    #    và có cặp pixel kề nhau tay–chuôi, chuôi–lưỡi
    def lien(d):
        S = set(i for i, v in enumerate(d) if v in (6, 10, 11))
        if not S: return {'motKhoi': False}
        start = next(i for i in S if d[i] == 10); seen = {start}; st = [start]
        while st:
            i = st.pop(); x, y = i % n, i // n
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                j = (y + dy) * n + x + dx
                if 0 <= x + dx < n and 0 <= y + dy < n and j in S and j not in seen: seen.add(j); st.append(j)
        def ke(a, b): return any(d[j] == b for i in S if d[i] == a for j in (i + 1, i - 1, i + n, i - n) if 0 <= j < n * n)
        kiem = set(i for i in S if d[i] in (10, 11))
        # motKhoi: toàn bộ lưỡi + chuôi/chắn nằm trong một thành phần liên thông 4 đi từ lưỡi và thành phần đó chạm bàn tay xa (ID 6; không đòi cả cánh tay – phần trên bị thân che)
        return {'motKhoi': kiem <= seen and any(d[i] == 6 for i in seen), 'tayChuoiKe': ke(6, 11), 'chuoiLuoiKe': ke(11, 10)}
    kq['kiemLien'] = [lien(d) for d in ids]
    kq['kiemLienMoiKhung'] = all(k.get('motKhoi') and k.get('tayChuoiKe') and k.get('chuoiLuoiKe') for k in kq['kiemLien'])
    # 1) chuông ngoài mũ: bbox chuông (12) so với mép lưng mũ (cột nhỏ nhất của ID mũ/mặt 1–3) ở các hàng chuông; khoảng cách ≥ 1 → không chạm, không che mặt
    def chuong_mu(d):
        ch = bb_id(d, (12,)); 
        if not ch: return None
        mep = []
        for y in range(ch[1], ch[3] + 1):
            xs = [x for x in range(n) if d[y * n + x] in (1, 2, 3)]
            if xs: mep.append(min(xs))
        mat = bb_id(d, (1,))
        return {'bboxChuong': ch, 'mepLungMuNhoNhat': min(mep) if mep else None, 'khoangCachToiMu': (min(mep) - ch[2] - 1) if mep else None,
                'heRaNgoaiMuPx': (min(mep) - ch[0]) if mep else ch[2] - ch[0] + 1, 'chuongTrumMat': bool(mat) and not (ch[2] < mat[0] or ch[0] > mat[2] or ch[3] < mat[1] or ch[1] > mat[3])}
    kq['chuongNgoaiMu'] = {'truoc_v2': chuong_mu(id2) if id2 else None, 'sau_v3': [chuong_mu(d) for d in ids]}
    # 1) dây chuông liền (8 liên thông): từ pixel dây cao nhất đi qua pixel dây/chuông tới chuông; dây rộng ≤ 1 px mỗi hàng; đỉnh dây chạm mép mũ (kề 8 với pixel mũ)
    def day_lien8(d):
        ds = [(i % n, i // n) for i, v in enumerate(d) if v == 13]
        if not ds: return {'lien': False}
        S = set(i for i, v in enumerate(d) if v in (12, 13)); top = min(ds, key=lambda p: p[1]); start = top[1] * n + top[0]
        seen = {start}; st = [start]; toiChuong = False
        while st:
            i = st.pop(); x, y = i % n, i // n
            if d[i] == 12: toiChuong = True; continue
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if 0 <= x + dx < n and 0 <= y + dy < n:
                        j = (y + dy) * n + x + dx
                        if j in S and j not in seen: seen.add(j); st.append(j)
        rong = max(sum(1 for p in ds if p[1] == y) for y in set(p[1] for p in ds))
        chamMu = any(d[(top[1] + dy) * n + top[0] + dx] in (1, 2, 3) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= top[0] + dx < n and 0 <= top[1] + dy < n)
        return {'lien': toiChuong, 'soPixel': len(ds), 'rongToiDa': rong, 'dinhDay': list(top), 'dinhChamMu': chamMu}
    kq['dayChuongLien8'] = [day_lien8(d) for d in ids]
    kq['dayChuongLien'] = [k['lien'] for k in kq['dayChuongLien8']]   # vòng 3: dây treo chéo → kiểm liên thông 8 (thay kiểm "pixel chuông ngay dưới" của vòng 2)
    return kq


def main():
    os.makedirs(OUT, exist_ok=True)
    xem = '--xem' in sys.argv
    data = dung()
    n = data['cell']
    frames = [anh(f, n) for f in data['frames']]
    muot = Image.open(io.BytesIO(base64.b64decode(data['muot'].split(',')[1]))).convert('RGBA')
    muot = muot.transpose(Image.FLIP_LEFT_RIGHT)   # render mượt chưa lật; bản pixel đã lật trong renderPixel
    overlay(data, frames, muot).save(os.path.join(OUT, 'overlay-mau.png'))
    day_khung(frames, 8).save(os.path.join(OUT, 'idle-x8.png'))
    kq = kiem_tra(data, frames)
    print('màu: %d (kể cả trong suốt) · ngoài bảng: %s · cao: %s · chân cố định: %s · sai khác kề nhau: %s' % (kq['soMauKeCaTrongSuot'], kq['mauNgoaiBang'], kq['caoNhanVat'], kq['chanCoDinh'], kq['saiKhacKeNhau']))
    if xem: print('ủng khác:', kq['ungKhac']); return
    for i, im in enumerate(frames): im.save(os.path.join(OUT, 'idle-%d.png' % i))
    day_khung(frames, 4).save(os.path.join(OUT, 'idle-x4.png'))
    gif(frames, os.path.join(OUT, 'idle.gif'))
    so_sanh_x4(frames).save(os.path.join(OUT, 'so-sanh-mau-x4.png'))
    ss = so_sanh_vong(frames)
    if ss: ss.save(os.path.join(OUT, 'so-sanh-v2-v3-x4.png'))
    json.dump(kq, open(os.path.join(OUT, 'kiem-tra.json'), 'w'), ensure_ascii=False, indent=1)
    # sheet thử cho game: 512×320, hàng 0 = 6 khung idle
    os.makedirs(GAME_ANIM, exist_ok=True)
    sheet = Image.new('RGBA', (512, 320), (0, 0, 0, 0))
    for i, im in enumerate(frames): sheet.paste(im, (i * n, 0))
    sheet.save(os.path.join(GAME_ANIM, 'lam-idle-proto.png'), optimize=True)
    js = {'version': 1, 'image': 'lam-idle-proto.png', 'frameWidth': n, 'frameHeight': n, 'pivot': [32, 63],
          'animations': {'idle': {'row': 0, 'frames': len(frames), 'fps': FPS, 'loop': True}}}
    with open(os.path.join(GAME_ANIM, 'lam-idle-proto.anim.json'), 'w') as f: json.dump(js, f, indent=2); f.write('\n')
    print('đã ghi', OUT, 'và', GAME_ANIM)


if __name__ == '__main__':
    main()
