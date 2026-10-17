#!/usr/bin/env python3
"""Xuất RUN 8 khung (12 FPS, ô 64×64, pivot [32,63]) của prototype Lam 3/4 bằng Chromium headless, ghi vào proto-lam/out/run/:
  run-0.png … run-7.png        từng khung 64×64 nền trong suốt
  run-x4.png, run-x8.png       contact sheet 8 khung có số khung + mốc ms (nearest-neighbor)
  run.gif                      ×4, 12 FPS, lặp vô hạn (loop=0)
  silhouette.png               bóng đen 8 khung ×4, đánh dấu pivot + quỹ đạo mũi 2 bàn chân
  quy-dao-chan.png             đồ thị x, y (pixel) của 2 bàn chân theo khung
  chong-silhouette.png         8 khung chồng mờ lên nhau (biên độ)
  idle-run-idle.gif            Idle (6) → Run (2 vòng) → Idle: kiểm chân không nhảy vị trí
  trong-game.png               nền Làng Chuông ×2, 8 khung Lam chạy dọc lối đi cạnh Quái Chuông Gỗ
  lat-check.png                8 khung thuận | lật (pivotLat = [fw−1−px, py]) cùng điểm chân
  kiem-tra.json                màu, alpha, bbox, quỹ đạo chân (mặt nạ ID + 3D chiếu), chân chống đất, sai khác kề/khép vòng, nhún thân, tay, kiếm, áo choàng, chuông, bộ phận, lật
  anim2d-check.png             sheet lam-proto.png nạp vào game/xem-thu/anim2d.html headless, animation run
  so-sanh-v1-v2-x4.png         vòng 1 (vong1/run-*.png, lưu trước khi ghi đè) trên / vòng 2 dưới, 8 khung ×4
  vong1/                       bản vòng 1 giữ lại để so (run-0..7.png, run-x4.png, kiem-tra.json) – chỉ tạo nếu chưa có
Vòng 2 còn render lại Idle V3 (6 khung) từ cùng trang và so từng pixel với out/idle/idle-*.png (kiem-tra.json → "idle") – chỉnh Run không được làm Idle đổi.
và sheet cho game:  game/anim/lam-proto.png (512×320: hàng 0 = idle 6 khung lấy từ out/idle/idle-*.png, hàng 1 = run 8 khung) + lam-proto.anim.json
Chạy:  python3 proto-lam/xuat-run.py [--xem]   (--xem: chỉ ghi run-x8 + kiem-tra để chỉnh keyframe nhanh)
Không đụng gì ngoài proto-lam/out/run/ và game/anim/lam-proto.*
"""
import base64, http.server, importlib.util, json, os, socketserver, sys, threading, time, warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(HERE, 'out', 'run')
IDLE = os.path.join(HERE, 'out', 'idle')
GAME = os.path.join(ROOT, 'game')
GAME_ANIM = os.path.join(GAME, 'anim')
CAO = 44
FPS = 12
MS = 83
NEN = (42, 36, 51, 255)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
PAL = ['#0C0F14', '#1A212B', '#212835', '#2C3546', '#4A5A6E', '#21413A', '#32804F', '#83CC93', '#9C6B30', '#E1B85A', '#F3E6C8', '#CEF0D6']
PIVOT = [32, 63]
# ID bộ phận (proto.html): mat 1, mu 2, vienMu 3, than 4, ao 5, tayG 6 (xa), tayX 7 (gần), chanG 8, chanX 9, luoi 10, chuoi 11, chuong 12, day 13, thatLung 14, vachG 15, vachX 16, tram 17, ungG 18 (xa), ungX 19 (gần)
ID_UNG_GAN, ID_UNG_XA = (16, 19), (15, 18)
CHONG_GAN, CHONG_XA = [1, 2, 3], [5, 6, 7]   # khung chân gần / chân xa chống đất (pha chịu lực → đạp)


def chu(c):
    try: return ImageFont.truetype(FONT, c)
    except Exception: return ImageFont.load_default()


def chromium(fn):
    from playwright.sync_api import sync_playwright
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']
    with sync_playwright() as pw:
        kw = {'args': args}
        if os.path.isfile('/opt/pw-browsers/chromium'): kw['executable_path'] = '/opt/pw-browsers/chromium'
        br = pw.chromium.launch(**kw)
        try: return fn(br)
        finally: br.close()


def dung():
    def chay(br):
        page = br.new_page(); loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.goto('file://' + os.path.join(HERE, 'proto.html'))
        page.wait_for_function('window.PROTO && window.THREE', timeout=30000)
        t0 = time.time()
        data = page.evaluate('(cao) => PROTO.xuatRun(cao)', CAO)
        idle = page.evaluate('(cao) => { var d = PROTO.xuatIdle(cao); delete d.muot; return d; }', CAO)   # Idle V3 render lại cùng trang → kiểm trùng pixel
        if loi: sys.exit('Lỗi JS: ' + '; '.join(loi))
        print('render run: %.1fs · lệch khép vòng mô phỏng ≈ %.4f px' % (time.time() - t0, data['lechVong'] * data['ppu']))
        data['idleRenderLai'] = idle
        return data
    return chromium(chay)


def anh(f, n): return Image.frombytes('RGBA', (n, n), base64.b64decode(f['px']))
def mat_na_id(f): return list(base64.b64decode(f['id']))
def bbox(im): return im.getchannel('A').point(lambda v: 255 if v > 0 else 0).getbbox()


def bb_id(d, idv, n):
    pts = [(i % n, i // n) for i, v in enumerate(d) if v in idv]
    return [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)] if pts else None


def day_khung(frames, S, nhan=None):
    n = frames[0].width; W = len(frames) * (n * S + 4) + 4; H = n * S + 20 + 8
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); fnt = chu(12)
    for i, im in enumerate(frames):
        x = 4 + i * (n * S + 4); y = 4
        out.alpha_composite(im.resize((n * S, n * S), Image.NEAREST), (x, y))
        dr.rectangle([x, y, x + n * S - 1, y + n * S - 1], outline=(60, 70, 85, 255))
        dr.text((x + 3, y + n * S + 3), nhan[i] if nhan else str(i), font=fnt, fill=(138, 150, 166, 255))
    return out


def gif(frames, duong_dan, S=4, ms=MS):
    n = frames[0].width; ims = []
    for im in frames:
        bg = Image.new('RGBA', (n, n), NEN); bg.alpha_composite(im)
        ims.append(bg.resize((n * S, n * S), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=32))
    ims[0].save(duong_dan, save_all=True, append_images=ims[1:], duration=ms if isinstance(ms, int) else list(ms), loop=0, disposal=2)


def silhouette(frames, toa, S=4):
    n = frames[0].width; W = len(frames) * (n * S + 4) + 4; H = n * S + 44
    out = Image.new('RGBA', (W, H), (214, 214, 206, 255)); dr = ImageDraw.Draw(out); fnt = chu(12)
    dr.text((4, 3), 'silhouette run ×%d · chữ thập đỏ = pivot [32,63] · quỹ đạo mũi chân: xanh = chân gần, cam = chân xa (chấm to = khung này)' % S, font=fnt, fill=(60, 60, 60, 255))
    for i, im in enumerate(frames):
        a = im.getchannel('A').point(lambda v: 255 if v > 0 else 0)
        den = Image.new('RGBA', (n, n), (12, 15, 20, 255)); den.putalpha(a)
        ox, oy = 4 + i * (n * S + 4), 20
        out.alpha_composite(den.resize((n * S, n * S), Image.NEAREST), (ox, oy))
        dr.rectangle([ox, oy, ox + n * S - 1, oy + n * S - 1], outline=(120, 120, 110, 255))
        for ten, mau in (('muiGan', (40, 150, 230, 255)), ('muiXa', (235, 140, 40, 255))):
            pts = [(ox + t['toaDo'][ten][0] * S, oy + t['toaDo'][ten][1] * S) for t in toa]
            dr.line(pts + [pts[0]], fill=mau, width=2)
            for j, p in enumerate(pts): r = 5 if j == i else 2; dr.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=mau)
        px, py = ox + (PIVOT[0] + 0.5) * S, oy + (PIVOT[1] + 0.5) * S
        dr.line([px - 8, py, px + 8, py], fill=(220, 40, 40, 255), width=2); dr.line([px, py - 8, px, py + 8], fill=(220, 40, 40, 255), width=2)
        dr.text((ox + 3, oy + n * S + 3), 'F%d · %d ms' % (i, i * MS), font=fnt, fill=(60, 60, 60, 255))
    return out


def chong_silhouette(frames, S=6):
    """Hai ô: trái = 8 bóng chồng mờ (alpha thấp, vùng tối = mọi khung đều có); phải = chỉ ĐƯỜNG BIÊN mỗi khung một màu (thấy biên độ chân/tay/áo)."""
    from PIL import ImageFilter
    n = frames[0].width; W1 = n * S + 16
    out = Image.new('RGBA', (W1 * 2, n * S + 60), NEN); dr = ImageDraw.Draw(out)
    MAU = [(83, 204, 147), (131, 170, 230), (225, 184, 90), (230, 120, 120), (40, 140, 90), (70, 110, 200), (200, 140, 40), (200, 70, 90)]
    for i, im in enumerate(frames):
        a = im.getchannel('A').point(lambda v: 255 if v > 0 else 0)
        mo = Image.new('RGBA', (n, n), (236, 240, 244, 255)); mo.putalpha(a.point(lambda v: 40 if v else 0))
        out.alpha_composite(mo.resize((n * S, n * S), Image.NEAREST), (8, 8))
        ero = a.filter(ImageFilter.MinFilter(3))
        ap, ep = a.load(), ero.load(); bm = Image.new('L', (n, n), 0); bp = bm.load()
        for y in range(n):
            for x in range(n):
                if ap[x, y] and not ep[x, y]: bp[x, y] = 255
        c = Image.new('RGBA', (n, n), MAU[i] + (255,)); c.putalpha(bm)
        out.alpha_composite(c.resize((n * S, n * S), Image.NEAREST), (W1 + 8, 8))
    for ox in (8, W1 + 8):
        px, py = ox + (PIVOT[0] + 0.5) * S, 8 + (PIVOT[1] + 0.5) * S
        dr.line([px - 10, py, px + 10, py], fill=(255, 60, 60, 255), width=2); dr.line([px, py - 10, px, py + 10], fill=(255, 60, 60, 255), width=2)
    f = chu(12)
    dr.text((8, n * S + 14), 'Trái: 8 khung run chồng mờ ×%d (càng sáng = càng nhiều khung có pixel). Phải: đường biên từng khung –' % S, font=f, fill=(230, 235, 240, 255))
    dr.text((8, n * S + 32), 'F0 xanh lá, F1 xanh dương, F2 vàng, F3 đỏ (F4–F7 cùng màu, đậm hơn) · chữ thập đỏ = pivot [32,63]', font=f, fill=(230, 235, 240, 255))
    return out


def quy_dao_chan(kq):
    """Hai ô đồ thị: x và y (pixel, gốc trên-trái ô 64) của mũi/mắt cá 2 bàn chân theo khung 0..7 (nối F7→F0)."""
    W, H = 860, 360; out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f11, f12 = chu(11), chu(12)
    MG, MX = (40, 150, 230, 255), (235, 140, 40, 255); LU = (138, 150, 166, 255)
    def o(ox, oy, w, h, tieude, ymin, ymax, series, yline=None):
        dr.rectangle([ox, oy, ox + w, oy + h], outline=(70, 80, 95, 255))
        dr.text((ox, oy - 16), tieude, font=f12, fill=(230, 235, 240, 255))
        def X(i): return ox + 10 + i * (w - 20) / 8.0
        def Y(v): return oy + h - (v - ymin) / float(ymax - ymin) * h
        for v in range(int(ymin), int(ymax) + 1, 4):
            dr.line([ox, Y(v), ox + w, Y(v)], fill=(55, 62, 75, 255)); dr.text((ox - 24, Y(v) - 6), str(v), font=f11, fill=LU)
        for i in range(9): dr.text((X(i) - 6, oy + h + 4), 'F%d' % (i % 8), font=f11, fill=LU)
        if yline is not None: dr.line([ox, Y(yline), ox + w, Y(yline)], fill=(220, 60, 60, 255), width=1)
        for vals, mau, net in series:
            pts = [(X(i), Y(vals[i % 8])) for i in range(9)]
            if net: dr.line(pts, fill=mau, width=2)
            else:
                for a, b in zip(pts, pts[1:]): dr.line([a, b], fill=mau, width=1)
            for p in pts: dr.ellipse([p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3], fill=mau)
    T = kq['quyDaoChan3D']
    mg, mx = [t['muiGan'] for t in T], [t['muiXa'] for t in T]
    cg, cx = [t['matCaGan'] for t in T], [t['matCaXa'] for t in T]
    xs = [p[0] for p in mg + mx + cg + cx]; ys = [p[1] for p in mg + mx + cg + cx]
    o(50, 30, 340, 240, 'x bàn chân (px; phải = trước mặt; đỏ = cột pivot 32)', int(min(xs) // 4 * 4) - 4, int(max(xs) // 4 * 4) + 4,
      [([p[0] for p in mg], MG, True), ([p[0] for p in mx], MX, True), ([p[0] for p in cg], MG, False), ([p[0] for p in cx], MX, False)], yline=PIVOT[0] + 0.5)
    o(480, 30, 340, 240, 'y bàn chân (px; dưới = đất; đỏ = hàng đất 63)', int(min(ys) // 4 * 4) - 4, 64 + 2,
      [([p[1] for p in mg], MG, True), ([p[1] for p in mx], MX, True), ([p[1] for p in cg], MG, False), ([p[1] for p in cx], MX, False)], yline=63.5)
    dr.text((50, H - 66), 'xanh = chân gần camera (X) · cam = chân xa (G) · nét đậm = đáy mũi ủng, nét mảnh = mắt cá (toạ độ 3D chiếu, liên tục; mũi có thể quá 64 vì là điểm hình học dưới đáy bo tròn)', font=f11, fill=LU)
    dr.text((50, H - 51), 'Đáy ủng theo mặt nạ ID (hàng pixel thấp nhất từng khung): gần %s · xa %s' % (kq['chanChongDat']['dayUngGan'], kq['chanChongDat']['dayUngXa']), font=f11, fill=LU)
    dr.text((50, H - 36), 'Chân chống đất ở hàng 63 (F1–F3 gần, F5–F7 xa): %s · trượt đều ra sau, dịch x mũi gần %s · xa %s px/khung' % (
        'ĐẠT' if kq['chanChongDat']['datHang63'] else 'CHƯA', kq['chanChongDat']['dichXGan'], kq['chanChongDat']['dichXXa']), font=f11, fill=LU)
    dr.text((50, H - 21), 'Sải (nửa biên độ x mắt cá): gần %s · xa %s px (tiêu chí 4–7) · nâng chân tối đa (đáy ủng trên hàng 63): gần %s · xa %s px' % (
        kq['chanChongDat']['saiChanPx']['ganMatCa'], kq['chanChongDat']['saiChanPx']['xaMatCa'], kq['chanChongDat']['caoNangChanToiDa']['gan'], kq['chanChongDat']['caoNangChanToiDa']['xa']), font=f11, fill=LU)
    return out


def lat_check(frames, S=4):
    """Mỗi khung: thuận | lật, vẽ cùng điểm chân (X,Y) – thuận tại X−px, lật tại X−pivotLat[0] với pivotLat = [fw−1−px, py] (đúng công thức anim2d.js)."""
    n = frames[0].width; fw = n; px, py = PIVOT; pl = [fw - 1 - px, py]
    cw = n * S + 8; W = len(frames) * cw * 2 + 8; H = n * S + 48
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); fnt = chu(11); kq = []
    for i, im in enumerate(frames):
        lat = im.transpose(Image.FLIP_LEFT_RIGHT)
        for k, (img, piv, ten) in enumerate(((im, PIVOT, 'thuận'), (lat, pl, 'lật'))):
            ox = 4 + (i * 2 + k) * cw; X, Y = ox + (px + 0.5) * S, 20 + (py + 0.5) * S   # điểm chân chung cho cả 2 bản
            dx, dy = int(round(X - (piv[0] + 0.5) * S)), int(round(Y - (piv[1] + 0.5) * S))
            out.alpha_composite(img.resize((n * S, n * S), Image.NEAREST), (dx, dy))
            dr.rectangle([dx, dy, dx + n * S - 1, dy + n * S - 1], outline=(60, 70, 85, 255))
            dr.line([X - 7, Y, X + 7, Y], fill=(255, 70, 70, 255), width=2); dr.line([X, Y - 7, X, Y + 7], fill=(255, 70, 70, 255), width=2)
            dr.text((ox + 2, 22 + n * S), 'F%d %s' % (i, ten), font=fnt, fill=(138, 150, 166, 255))
        # số liệu như TV.Anim.kiemLat: bbox thuận quanh X vs bbox lật quanh X
        b1, b2 = bbox(im), bbox(lat)
        t1 = {'trai': b1[0] - px, 'phai': b1[2] - 1 - px, 'day': b1[3] - 1 - py}; t2 = {'trai': b2[0] - pl[0], 'phai': b2[2] - 1 - pl[0], 'day': b2[3] - 1 - py}
        lech = {'trai': t1['trai'] - (-t2['phai']), 'phai': t1['phai'] - (-t2['trai']), 'day': t1['day'] - t2['day']}
        a1, a2 = im.getchannel('A').load(), lat.getchannel('A').load(); sai = 0
        for y in range(n):
            for x in range(n):
                xl = 2 * px - x - (px - pl[0])   # cột lật tương ứng khi cùng điểm chân: thuận x ↔ lật (fw−1−x) đặt lệch (px − pl[0])
                v2 = a2[xl, y] if 0 <= xl < n else 0
                if (a1[x, y] > 0) != (v2 > 0): sai += 1
        kq.append({'khung': i, 'thuan': t1, 'lat': t2, 'lech': lech, 'saiPixel': sai, 'tamLech': round((b1[0] + b1[2] - 1) / 2 - px, 1), 'dung': lech == {'trai': 0, 'phai': 0, 'day': 0} and sai == 0})
    dr.text((8, H - 14), 'pivot thuận [%d,%d] · pivotLat [%d,%d] · chữ thập = điểm chân chung · lech/saiPixel ghi trong kiem-tra.json ("lat")' % (px, py, pl[0], pl[1]), font=fnt, fill=(138, 150, 166, 255))
    return out, kq


def vong1_frames():
    fr = []
    for i in range(8):
        p = os.path.join(OUT, 'vong1', 'run-%d.png' % i)
        if not os.path.isfile(p): return None
        fr.append(Image.open(p).convert('RGBA'))
    return fr


def so_sanh_v1_v2(v1, v2, S=4):
    """Hai hàng 8 khung ×4: trên = vòng 1, dưới = vòng 2 (cùng số khung + ms)."""
    n = v2[0].width; cw = n * S + 4; W = 8 * cw + 4 + 70; rh = n * S + 22; H = rh * 2 + 24
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(12)
    dr.text((4, 4), 'so sánh RUN vòng 1 (trên) / vòng 2 (dưới) ×%d · cùng khung, cùng ms' % S, font=f, fill=(230, 235, 240, 255))
    for r, (ten, fr) in enumerate((('vòng 1', v1), ('vòng 2', v2))):
        oy = 20 + r * rh
        dr.text((4, oy + n * S // 2 - 6), ten, font=f, fill=(138, 150, 166, 255))
        for i, im in enumerate(fr):
            ox = 70 + i * cw
            out.alpha_composite(im.resize((n * S, n * S), Image.NEAREST), (ox, oy))
            dr.rectangle([ox, oy, ox + n * S - 1, oy + n * S - 1], outline=(60, 70, 85, 255))
            dr.text((ox + 3, oy + n * S + 3), 'F%d · %d ms' % (i, i * MS), font=f, fill=(138, 150, 166, 255))
    return out


def kiem_idle(data, n):
    """Idle V3 render lại từ cùng trang phải trùng TỪNG PIXEL với out/idle/idle-*.png (và hàng 0 của game/anim/lam-idle-proto.png)."""
    kq = {'soKhung': len(data['frames']), 'trungPixel': [], 'soPixelKhac': [], 'trungSheetIdleProto': None}
    sheet = os.path.join(GAME_ANIM, 'lam-idle-proto.png'); sh = Image.open(sheet).convert('RGBA') if os.path.isfile(sheet) else None
    ok_sheet = True
    for i, f in enumerate(data['frames']):
        im = anh(f, n); goc = Image.open(os.path.join(IDLE, 'idle-%d.png' % i)).convert('RGBA')
        khac = sum(1 for u, v in zip(im.getdata(), goc.getdata()) if u != v)
        kq['soPixelKhac'].append(khac); kq['trungPixel'].append(khac == 0)
        if sh: ok_sheet = ok_sheet and (sum(1 for u, v in zip(im.getdata(), sh.crop((i * n, 0, i * n + n, n)).getdata()) if u != v) == 0)
    kq['trungSheetIdleProto'] = ok_sheet if sh else None
    kq['tatCaTrung'] = all(kq['trungPixel']) and (ok_sheet if sh else True)
    return kq


def idle_frames():
    fr = []
    for i in range(6):
        p = os.path.join(IDLE, 'idle-%d.png' % i)
        if not os.path.isfile(p): return None
        fr.append(Image.open(p).convert('RGBA'))
    return fr


def trong_game(frames, nhan=''):
    spec = importlib.util.spec_from_file_location('build', os.path.join(HERE, 'build.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA'); DAT = 241
    atlas = json.load(open(os.path.join(ROOT, 'art', 'sprite', 'atlas.json')))
    q = atlas['quaiChuong']; qs = Image.open(os.path.join(ROOT, 'art', 'sprite', 'quai-chuong.png')).convert('RGBA')
    f0 = q['anims']['idle']['frames'][0]; quai = qs.crop((f0['x'], f0['y'], f0['x'] + q['w'], f0['y'] + q['h'])); qp = q['pivot']
    # 8 khung chạy nối tiếp dọc lối đi (cách 54 px), chạy về phía Quái Chuông Gỗ (nhìn trái) ở cuối lối đi
    xs = [24 + i * 54 for i in range(8)]
    for i, im in enumerate(frames): nen.alpha_composite(im, (xs[i] - PIVOT[0], DAT - PIVOT[1]))
    nen.alpha_composite(quai, (457 - qp['x'], DAT - qp['y']))
    big = nen.resize((960, 540), Image.NEAREST); d2 = ImageDraw.Draw(big); fnt = chu(14); f12 = chu(12)
    for i, x in enumerate(xs): d2.text((x * 2 - 8, DAT * 2 + 8), 'F%d' % i, font=f12, fill=(243, 230, 200, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    d2.text((457 * 2 - 60, DAT * 2 + 8), 'Quái Chuông Gỗ', font=f12, fill=(243, 230, 200, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    d2.text((8, 8), 'trong-game.png · 480×270 phóng ×2 · nền Làng Chuông · Lam RUN 8 khung (ô 64, pivot [32,63]) chân đặt tại y=241 ' + nhan, font=fnt, fill=(230, 235, 240, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    return big


# ---------------------------------------------------------------- kiểm tra số liệu
def kiem_tra(data, frames):
    n = data['cell']; ids = [mat_na_id(f) for f in data['frames']]; pxs = [list(im.getdata()) for im in frames]
    kq = {'soKhung': len(frames), 'fps': FPS, 'msKhung': MS, 'tongMs': MS * len(frames), 'o': n, 'pivot': PIVOT, 'loop': True}
    tat = set()
    for im in frames: tat |= set(im.getdata())
    mau = sorted(tat, key=lambda c: (c[3], c))
    kq['soMauKeCaTrongSuot'] = len(mau)
    kq['mau'] = ['#%02X%02X%02X' % c[:3] if c[3] else 'trong suốt' for c in mau]
    kq['mauNgoaiBang'] = [m for m in kq['mau'] if m != 'trong suốt' and m not in PAL]
    kq['alphaChi0_255'] = all(c[3] in (0, 255) for c in tat)
    kq['bbox'] = [list(bbox(im)) for im in frames]
    kq['caoNhanVat'] = [b[3] - b[1] for b in kq['bbox']]
    kq['rongNhanVat'] = [b[2] - b[0] for b in kq['bbox']]
    kq['pivotRender'] = [f['pivot'] for f in data['frames']]
    kq['pivotDung'] = all(p == PIVOT for p in kq['pivotRender'])
    kq['tuThe'] = [f['P'] for f in data['frames']]
    # --- quỹ đạo chân: 3D chiếu + mặt nạ ID ủng
    kq['quyDaoChan3D'] = [f['toaDo'] for f in data['frames']]
    ug = [bb_id(d, ID_UNG_GAN, n) for d in ids]; ux = [bb_id(d, ID_UNG_XA, n) for d in ids]
    kq['ungGanBbox'] = ug; kq['ungXaBbox'] = ux
    def day(b): return b[3] if b else None
    def tamx(b): return round((b[0] + b[2]) / 2, 1) if b else None
    cc = {'dayUngGan': [day(b) for b in ug], 'dayUngXa': [day(b) for b in ux], 'tamXUngGan': [tamx(b) for b in ug], 'tamXUngXa': [tamx(b) for b in ux],
          'khungChongGan': CHONG_GAN, 'khungChongXa': CHONG_XA}
    cc['chongDatHang63Gan'] = [day(ug[i]) == n - 1 for i in CHONG_GAN]; cc['chongDatHang63Xa'] = [day(ux[i]) == n - 1 for i in CHONG_XA]
    cc['datHang63'] = all(cc['chongDatHang63Gan']) and all(cc['chongDatHang63Xa'])
    T = kq['quyDaoChan3D']
    cc['dichXGan'] = [round(T[i + 1]['muiGan'][0] - T[i]['muiGan'][0], 2) for i in [0, 1, 2]]   # F0→F1, F1→F2, F2→F3 (mũi chân gần)
    cc['dichXXa'] = [round(T[i + 1]['muiXa'][0] - T[i]['muiXa'][0], 2) for i in [4, 5, 6]]    # F4→F5, F5→F6, F6→F7 (mũi chân xa)
    cc['dichXMatNaGan'] = [round(tamx(ug[i + 1]) - tamx(ug[i]), 1) if ug[i] and ug[i + 1] else None for i in [0, 1, 2]]
    cc['dichXMatNaXa'] = [round(tamx(ux[i + 1]) - tamx(ux[i]), 1) if ux[i] and ux[i + 1] else None for i in [4, 5, 6]]
    def deu(v): v = [x for x in v if x is not None]; return (max(v) - min(v)) <= 1.5 and all(x < 0 for x in v) if v else False
    cc['truotDeuRaSau'] = deu(cc['dichXGan']) and deu(cc['dichXXa'])
    cc['saiChanTrungTamGan'] = [round(t['muiGan'][0] - (PIVOT[0] + 0.5), 1) for t in T]; cc['saiChanTrungTamXa'] = [round(t['muiXa'][0] - (PIVOT[0] + 0.5), 1) for t in T]
    cc['saiChanPx'] = {'ganMatCa': round((max(t['matCaGan'][0] for t in T) - min(t['matCaGan'][0] for t in T)) / 2, 1), 'xaMatCa': round((max(t['matCaXa'][0] for t in T) - min(t['matCaXa'][0] for t in T)) / 2, 1),
                       'ganMuiTheoMatNa': round((max(b[2] for b in ug) - min(b[2] for b in ug)) / 2, 1) if all(ug) else None, 'xaMuiTheoMatNa': round((max(b[2] for b in ux) - min(b[2] for b in ux)) / 2, 1) if all(ux) else None}
    cc['caoNangChanToiDa'] = {'gan': round(n - 1 - min(day(b) for b in ug if b), 1), 'xa': round(n - 1 - min(day(b) for b in ux if b), 1)}
    kq['chanChongDat'] = cc
    # --- sai khác pixel kề nhau, khép vòng
    def diff(a, b): pa, pb = a.getdata(), b.getdata(); return sum(1 for u, v in zip(pa, pb) if u != v)
    kq['saiKhacKeNhau'] = [diff(frames[i], frames[(i + 1) % len(frames)]) for i in range(len(frames))]   # phần tử cuối = F7 → F0
    kq['saiKhacF7F0'] = kq['saiKhacKeNhau'][-1]; kq['saiKhacKeNhauTrungBinh'] = round(sum(kq['saiKhacKeNhau'][:-1]) / 7, 1)
    kq['khepVongKhongGiat'] = kq['saiKhacF7F0'] <= max(kq['saiKhacKeNhau'][:-1])
    kq['lechKhepVongMoPhongPx'] = round(data['lechVong'] * data['ppu'], 4)
    # --- nhún thân: đỉnh đầu (bbox top), hông, đỉnh mũ theo ID
    def top_id(d, idv):
        ys = [i // n for i, v in enumerate(d) if v in idv]; return min(ys) if ys else None
    kq['nhunThan'] = {'hangDinhBbox': [b[1] for b in kq['bbox']], 'hangDinhMu': [top_id(d, (2, 3)) for d in ids], 'yHong3D': [t['hong'][1] for t in T], 'yDinhDau3D': [t['dinhDau'][1] for t in T]}
    nt = kq['nhunThan']; nt['bienDoDinhMuPx'] = max(nt['hangDinhMu']) - min(nt['hangDinhMu']); nt['bienDoHong3DPx'] = round(max(nt['yHong3D']) - min(nt['yHong3D']), 2)
    nt['khungThapNhat'] = [i for i, v in enumerate(nt['yHong3D']) if v == max(nt['yHong3D'])]; nt['khungCaoNhat'] = [i for i, v in enumerate(nt['yHong3D']) if v == min(nt['yHong3D'])]
    # --- tay
    def tam(d, idv):
        pts = [(i % n, i // n) for i, v in enumerate(d) if v in idv]
        return [round(sum(p[0] for p in pts) / len(pts), 1), round(sum(p[1] for p in pts) / len(pts), 1), len(pts)] if pts else None
    kq['tay'] = {'tayXa3D': [t['tayXa'] for t in T], 'tayGan3D': [t['tayGan'] for t in T],
                 'bienDoTayXaPx': round(max(t['tayXa'][0] for t in T) - min(t['tayXa'][0] for t in T), 2), 'bienDoTayGanPx': round(max(t['tayGan'][0] for t in T) - min(t['tayGan'][0] for t in T), 2),
                 'tamTayGanMatNa': [tam(d, (7,)) for d in ids], 'tamTayXaMatNa': [tam(d, (6,)) for d in ids]}
    tx = [t['tayXa'][0] for t in T]; fx = [t['muiXa'][0] for t in T]
    kq['tay']['khungTayXaTruocNhat'] = tx.index(max(tx)); kq['tay']['khungChanXaTruocNhat'] = fx.index(max(fx))
    kq['tay']['doiPha'] = abs((kq['tay']['khungTayXaTruocNhat'] - kq['tay']['khungChanXaTruocNhat']) % 8 - 4) <= 1   # tay xa trước nhất cách chân xa trước nhất ≈ 4 khung
    # --- kiếm: liền tay, không mất, đầu kiếm, không chui vào áo choàng (pixel lưỡi không kề/ chồng pixel áo choàng ở phía sau thân)
    def lien(d):
        S = set(i for i, v in enumerate(d) if v in (6, 10, 11))
        if not any(d[i] == 10 for i in S): return {'motKhoi': False, 'tayChuoiKe': False, 'chuoiLuoiKe': False}
        start = next(i for i in S if d[i] == 10); seen = {start}; st = [start]
        while st:
            i = st.pop(); x, y = i % n, i // n
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                j = (y + dy) * n + x + dx
                if 0 <= x + dx < n and 0 <= y + dy < n and j in S and j not in seen: seen.add(j); st.append(j)
        def ke(a, b): return any(d[j] == b for i in S if d[i] == a for j in (i + 1, i - 1, i + n, i - n) if 0 <= j < n * n)
        kiem = set(i for i in S if d[i] in (10, 11))
        return {'motKhoi': kiem <= seen and any(d[i] == 6 for i in seen), 'tayChuoiKe': ke(6, 11), 'chuoiLuoiKe': ke(11, 10)}
    def dau_kiem(d):
        pts = [(i % n, i // n) for i, v in enumerate(d) if v == 10]
        if not pts: return None
        mx = max(p[0] for p in pts); return [mx, max(p[1] for p in pts if p[0] == mx)]
    def dem(d, idv): return sum(1 for v in d if v in idv)
    luoi_ao = []
    for d in ids:   # pixel lưỡi/chuôi kề pixel áo choàng (ID 5) hoặc lưỡi nằm trái pivot (vào vùng áo sau lưng)
        ke = 0; trai = 0
        for i, v in enumerate(d):
            if v in (10, 11):
                x, y = i % n, i // n
                if x < PIVOT[0] - 4: trai += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if 0 <= x + dx < n and 0 <= y + dy < n and d[(y + dy) * n + x + dx] == 5: ke += 1
        luoi_ao.append({'keAoChoang': ke, 'pixelSauLung': trai})
    kq['kiem'] = {'lien': [lien(d) for d in ids], 'dauKiemMatNa': [dau_kiem(d) for d in ids], 'dauKiem3D': [t['dauKiem'] for t in T], 'soPixelLuoi': [dem(d, (10,)) for d in ids], 'soPixelChuoiChan': [dem(d, (11,)) for d in ids],
                 'luoiVsAoChoang': luoi_ao, 'gocLuoiDeg': []}
    for t in T:
        dx, dy = t['dauKiem'][0] - t['tayXa'][0], t['tayXa'][1] - t['dauKiem'][1]
        import math; kq['kiem']['gocLuoiDeg'].append(round(math.degrees(math.atan2(dy, dx)), 1))
    kq['kiem']['lienMoiKhung'] = all(k['motKhoi'] and k['tayChuoiKe'] and k['chuoiLuoiKe'] for k in kq['kiem']['lien'])
    kq['kiem']['luonBenPhaiThan'] = all(x['pixelSauLung'] == 0 for x in luoi_ao)
    kq['kiem']['khongKeAoChoang'] = all(x['keAoChoang'] == 0 for x in luoi_ao)
    kq['kiem']['luoiToiThieuPx'] = min(kq['kiem']['soPixelLuoi']); kq['kiem']['chuoiToiThieuPx'] = min(kq['kiem']['soPixelChuoiChan'])
    # --- áo choàng: bbox, đuôi (cột trái nhất, hàng gấu) theo khung; trễ pha so với hông
    ao = [bb_id(d, (5,), n) for d in ids]
    duoi = []
    for d in ao and ids:
        pts = [(i % n, i // n) for i, v in enumerate(d) if v == 5]
        mx = min(p[0] for p in pts); duoi.append([mx, max(p[1] for p in pts if p[0] == mx)])
    gau = [max(i // n for i, v in enumerate(d) if v == 5) for d in ids]
    kq['aoChoang'] = {'bbox': ao, 'duoiAo': duoi, 'hangGau': gau, 'bienDoDuoiXPx': max(x[0] for x in duoi) - min(x[0] for x in duoi), 'bienDoDuoiYPx': max(x[1] for x in duoi) - min(x[1] for x in duoi), 'bienDoGauPx': max(gau) - min(gau),
                      'xoeSauPx': [PIVOT[0] - b[0] for b in ao], 'khungDuoiXaNhat': [i for i, x in enumerate(duoi) if x[0] == min(y[0] for y in duoi)],
                      'thSimDoanCuoi': [round(f['sim']['th'][-1], 3) for f in data['frames']], 'thSimDoanDau': [round(f['sim']['th'][0], 3) for f in data['frames']]}
    kq['aoChoang']['bayRaSau'] = all(b[0] < PIVOT[0] - 10 for b in ao)
    # --- chuông: tâm, biên độ, cách mũ, dây liền 8, không trùm mặt
    def chuong_mu(d):
        ch = bb_id(d, (12,), n)
        if not ch: return None
        mep = [min(x for x in range(n) if d[y * n + x] in (1, 2, 3)) for y in range(ch[1], ch[3] + 1) if any(d[y * n + x] in (1, 2, 3) for x in range(n))]
        mat = bb_id(d, (1,), n)
        return {'bboxChuong': ch, 'khoangCachToiMu': (min(mep) - ch[2] - 1) if mep else None, 'chuongTrumMat': bool(mat) and not (ch[2] < mat[0] or ch[0] > mat[2] or ch[3] < mat[1] or ch[1] > mat[3])}
    def day_lien8(d):
        ds = [(i % n, i // n) for i, v in enumerate(d) if v == 13]
        if not ds: return {'lien': False, 'soPixel': 0}
        S = set(i for i, v in enumerate(d) if v in (12, 13)); top = min(ds, key=lambda p: p[1]); start = top[1] * n + top[0]
        seen = {start}; st = [start]; toi = False
        while st:
            i = st.pop(); x, y = i % n, i // n
            if d[i] == 12: toi = True; continue
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if 0 <= x + dx < n and 0 <= y + dy < n:
                        j = (y + dy) * n + x + dx
                        if j in S and j not in seen: seen.add(j); st.append(j)
        def cham(idv): return any(d[(top[1] + dy) * n + top[0] + dx] in idv for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= top[0] + dx < n and 0 <= top[1] + dy < n)
        return {'lien': toi, 'soPixel': len(ds), 'dinhDay': list(top), 'dinhChamMu': cham((1, 2, 3)), 'dinhChamCoAo': cham((4, 5, 6, 7, 14))}   # khi chạy thân nghiêng tới: đỉnh dây ló ra từ sau cổ áo/vai thay vì mép mũ
    tc = [tam(d, (12,)) for d in ids]
    kq['chuong'] = {'tam': tc, 'bienDoXPx': round(max(t[0] for t in tc) - min(t[0] for t in tc), 1), 'bienDoYPx': round(max(t[1] for t in tc) - min(t[1] for t in tc), 1), 'soPixel': [t[2] for t in tc],
                    'ngoaiMu': [chuong_mu(d) for d in ids], 'day': [day_lien8(d) for d in ids], 'thSim': [round(f['sim']['cth'], 3) for f in data['frames']]}
    kq['chuong']['khongXuyenMu'] = all(c and c['khoangCachToiMu'] is not None and c['khoangCachToiMu'] >= 1 and not c['chuongTrumMat'] for c in kq['chuong']['ngoaiMu'])
    kq['chuong']['dayLienMoiKhung'] = all(x['lien'] for x in kq['chuong']['day'])   # dây liền (liên thông 8) từ đỉnh dây xuống chuông
    kq['chuong']['dinhDayChamMu'] = [x['dinhChamMu'] for x in kq['chuong']['day']]
    def cach_mu(d, x):   # khoảng cách ngang (px nền) từ đỉnh dây tới pixel mũ gần nhất cùng hàng, về phía trước
        tx, ty = x['dinhDay']; k = 0
        while tx + k + 1 < n and d[ty * n + tx + k + 1] not in (1, 2, 3): k += 1
        return k
    kq['chuong']['dinhDayCachMuPx'] = [cach_mu(d, x) for d, x in zip(ids, kq['chuong']['day'])]   # 0 = chạm mép mũ (như idle); vòng 1 là 1–2 (gốc dây ló ra sau mũ); vòng 2 dời gốc dây theo mũ → phải 0 ở mọi khung
    kq['chuong']['dinhDayChamMuMoiKhung'] = all(v == 0 for v in kq['chuong']['dinhDayCachMuPx'])

    # --- vòng 2: màu chân xa / chân gần theo ID (mục 1), gấu vạt áo phía gần camera (mục 2), so với vòng 1
    def mau_id(px, d, idv):
        c = {}
        for i, v in enumerate(d):
            if v in idv: k = '#%02X%02X%02X' % px[i][:3]; c[k] = c.get(k, 0) + 1
        return dict(sorted(c.items(), key=lambda kv: -kv[1]))
    kq['mauChan'] = {'chanXa(quan+ung)': [mau_id(px, d, (8, 18)) for px, d in zip(pxs, ids)], 'chanGan(quan+ung)': [mau_id(px, d, (9, 19)) for px, d in zip(pxs, ids)]}
    def mau_chinh(ds): 
        t = {}
        for c in ds:
            for k, v in c.items(): t[k] = t.get(k, 0) + v
        return dict(sorted(t.items(), key=lambda kv: -kv[1]))
    kq['mauChan']['tongChanXa'] = mau_chinh(kq['mauChan']['chanXa(quan+ung)']); kq['mauChan']['tongChanGan'] = mau_chinh(kq['mauChan']['chanGan(quan+ung)'])
    gau_gan = [max([i // n for i, v in enumerate(d) if v == 5 and 18 <= i % n <= 34] or [0]) for d in ids]   # hàng thấp nhất của áo choàng trong cột 18–34 (vạt phía gần, sát hai chân)
    kq['vatAoGan'] = {'hangGauCot18_34': gau_gan, 'soHangChanDuoiGau': [n - 1 - g for g in gau_gan]}
    v1p = os.path.join(OUT, 'vong1', 'kiem-tra.json')
    if os.path.isfile(v1p):
        v1 = json.load(open(v1p)); T1 = v1['quyDaoChan3D']
        lech = [round(max(abs(T[i][k][j] - T1[i][k][j]) for k in ('matCaGan', 'muiGan', 'gotGan', 'matCaXa', 'muiXa', 'gotXa') for j in (0, 1)), 3) for i in range(len(T))]
        kq['soVoiVong1'] = {'lechQuyDaoChan3DPxToiDa': max(lech), 'lechQuyDaoChanTungKhung': lech, 'pivotVong1': v1['pivotRender'],
                            'dinhDayCachMuPxVong1': v1['chuong']['dinhDayCachMuPx'], 'dinhDayCachMuPxVong2': kq['chuong']['dinhDayCachMuPx'],
                            'khoangCachChuongMuVong1': [c['khoangCachToiMu'] for c in v1['chuong']['ngoaiMu']], 'khoangCachChuongMuVong2': [c['khoangCachToiMu'] for c in kq['chuong']['ngoaiMu']],
                            'duoiAoVong1': v1['aoChoang']['duoiAo'], 'duoiAoVong2': kq['aoChoang']['duoiAo'], 'bienDoDuoiVong1': [v1['aoChoang']['bienDoDuoiXPx'], v1['aoChoang']['bienDoDuoiYPx']], 'bienDoDuoiVong2': [kq['aoChoang']['bienDoDuoiXPx'], kq['aoChoang']['bienDoDuoiYPx']],
                            'hangGauVong1': v1['aoChoang']['hangGau'], 'hangGauVong2': kq['aoChoang']['hangGau'], 'xoeSauVong1': v1['aoChoang']['xoeSauPx'], 'xoeSauVong2': kq['aoChoang']['xoeSauPx'],
                            'saiKhacKeNhauVong1': v1['saiKhacKeNhau'], 'saiKhacKeNhauVong2': kq['saiKhacKeNhau'], 'dayUngGanVong1': v1['chanChongDat']['dayUngGan'], 'dayUngXaVong1': v1['chanChongDat']['dayUngXa']}
        kq['soVoiVong1']['hangGauVatGanVong1'] = [55, 56, 57, 56, 55, 56, 56, 56]   # đo cùng cách (mặt nạ ID áo, cột 18–34) trên render vòng 1 trước khi sửa (ảnh vòng 1 không lưu mặt nạ ID)
        kq['soVoiVong1']['hangGauVatGanVong2'] = gau_gan
        kq['soVoiVong1']['gauVatGanVenLenPx'] = [a - b for a, b in zip(kq['soVoiVong1']['hangGauVatGanVong1'], gau_gan)]
    # --- bộ phận có mặt mọi khung
    bp = {'matSang(#F3E6C8)': [sum(1 for p in px if p[:3] == (0xF3, 0xE6, 0xC8)) for px in pxs], 'luoi': kq['kiem']['soPixelLuoi'], 'chuoiChan': kq['kiem']['soPixelChuoiChan'], 'chuong': kq['chuong']['soPixel'],
          'dayChuong': [x['soPixel'] for x in kq['chuong']['day']], 'tram': [dem(d, (17,)) for d in ids], 'vachUngGan': [dem(d, (16,)) for d in ids], 'vachUngXa': [dem(d, (15,)) for d in ids],
          'ungGan': [dem(d, (19,)) for d in ids], 'ungXa': [dem(d, (18,)) for d in ids], 'tayGan': [dem(d, (7,)) for d in ids], 'tayXa': [dem(d, (6,)) for d in ids], 'chanGan': [dem(d, (9,)) for d in ids], 'chanXa': [dem(d, (8,)) for d in ids],
          'mu': [dem(d, (2, 3)) for d in ids], 'than': [dem(d, (4,)) for d in ids], 'aoChoang': [dem(d, (5,)) for d in ids]}
    bp['mat2Diem'] = [sum(1 for i, p in enumerate(px) if p[:3] == (0xF3, 0xE6, 0xC8) and i % n >= 30 and i // n < 40) for px in pxs]   # 2 điểm mắt trong bóng mũ (phần mặt bên phải, trên hàng 40) – tách khỏi chỏm chuông
    kq['boPhan'] = bp
    kq['boPhanDuMoiKhung'] = all(min(v) >= 1 for k, v in bp.items() if k not in ('vachUngXa', 'chanXa', 'mat2Diem')) and all(v == 2 for v in bp['mat2Diem'])
    kq['boPhanBiCheTamThoi'] = {k: [i for i, v in enumerate(bp[k]) if v == 0] for k in ('vachUngXa', 'chanXa')}   # đùi/vạch ủng chân xa bị chân gần + áo choàng che ở vài khung (che khuất, không phải thiếu)
    return kq


def anim2d_check(kq):
    """Mở game/xem-thu/anim2d.html qua http cục bộ (không sửa trang), nạp sheet lam-proto.png bằng ô URL, chọn animation run, chụp ảnh + kiểm lật của trang."""
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k): super().__init__(*a, directory=GAME, **k)
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
    th = threading.Thread(target=srv.serve_forever, daemon=True); th.start()
    def chay(br):
        page = br.new_page(viewport={'width': 760, 'height': 1200}); loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.goto('http://127.0.0.1:%d/xem-thu/anim2d.html' % port); page.wait_for_timeout(600)
        page.fill('#uPng', 'http://127.0.0.1:%d/anim/lam-proto.png' % port); page.click('#bUrl')
        page.wait_for_function("document.getElementById('nguon').textContent.indexOf('PNG') === 0", timeout=10000)
        page.click('#rAnim button[data-ten="run"]'); page.wait_for_timeout(700)
        page.click('#z6'); page.wait_for_timeout(300)
        page.click('#bKiemLat'); page.wait_for_timeout(300)
        kqLat = page.inner_text('#kqKiem')
        info = page.evaluate("() => ({ten: document.getElementById('iTen').textContent, fps: document.getElementById('iFps').textContent, loop: document.getElementById('iLoop').textContent, nguon: document.getElementById('nguon').textContent, msg: document.getElementById('msg').textContent})")
        page.click('#bVong'); page.wait_for_timeout(400)
        kqVong = page.inner_text('#kqKiem')
        page.screenshot(path=os.path.join(OUT, 'anim2d-check.png'), full_page=True)
        return {'trang': info, 'kiemLat': kqLat, 'phat20Vong': kqVong, 'loiJS': loi}
    try: return chromium(chay)
    finally: srv.shutdown(); srv.server_close()


def main():
    os.makedirs(OUT, exist_ok=True); xem = '--xem' in sys.argv
    data = dung(); n = data['cell']
    frames = [anh(f, n) for f in data['frames']]
    V1 = os.path.join(OUT, 'vong1')
    if not os.path.isdir(V1) and os.path.isfile(os.path.join(OUT, 'run-0.png')):   # lưu bản vòng 1 trước khi ghi đè (chỉ lần đầu)
        os.makedirs(V1)
        for f in ['run-%d.png' % i for i in range(8)] + ['run-x4.png', 'kiem-tra.json']:
            if os.path.isfile(os.path.join(OUT, f)): import shutil; shutil.copy(os.path.join(OUT, f), os.path.join(V1, f))
    kq = kiem_tra(data, frames)
    kq['idle'] = kiem_idle(data['idleRenderLai'], n)
    print('idle render lại trùng pixel out/idle:', kq['idle']['trungPixel'], '· trùng sheet lam-idle-proto:', kq['idle']['trungSheetIdleProto'])
    print('màu chân xa:', kq['mauChan']['tongChanXa'], '· chân gần:', kq['mauChan']['tongChanGan'], '· gấu vạt gần (cột 18–34):', kq['vatAoGan']['hangGauCot18_34'], '· đỉnh dây cách mũ:', kq['chuong']['dinhDayCachMuPx'])
    if 'soVoiVong1' in kq: print('so với vòng 1: lệch quỹ đạo chân tối đa %.3f px' % kq['soVoiVong1']['lechQuyDaoChan3DPxToiDa'])
    nhan = ['F%d · %d ms' % (i, i * MS) for i in range(len(frames))]
    day_khung(frames, 8, nhan).save(os.path.join(OUT, 'run-x8.png'))
    cc = kq['chanChongDat']
    print('màu %d · ngoài bảng %s · alpha0/255 %s · pivot đúng %s · cao %s · rộng %s' % (kq['soMauKeCaTrongSuot'], kq['mauNgoaiBang'], kq['alphaChi0_255'], kq['pivotDung'], kq['caoNhanVat'], kq['rongNhanVat']))
    print('đáy ủng gần %s · xa %s · hàng 63 khi chống: %s · dịch x gần %s xa %s · sải mắt cá gần %s xa %s px' % (cc['dayUngGan'], cc['dayUngXa'], cc['datHang63'], cc['dichXGan'], cc['dichXXa'], cc['saiChanPx']['ganMatCa'], cc['saiChanPx']['xaMatCa']))
    print('nhún: đỉnh mũ %d px, hông %.2f px (thấp F%s cao F%s) · tay xa %.2f px, tay gần %.2f px, đối pha %s · lưỡi deg %s' % (kq['nhunThan']['bienDoDinhMuPx'], kq['nhunThan']['bienDoHong3DPx'], kq['nhunThan']['khungThapNhat'], kq['nhunThan']['khungCaoNhat'], kq['tay']['bienDoTayXaPx'], kq['tay']['bienDoTayGanPx'], kq['tay']['doiPha'], kq['kiem']['gocLuoiDeg']))
    print('kiếm liền %s · không kề áo %s · lưỡi px %s · áo: đuôi %s biên độ x %d y %d, gấu %s · chuông biên độ %.1f/%.1f, cách mũ %s, dây liền %s · sai khác kề %s' % (
        kq['kiem']['lienMoiKhung'], kq['kiem']['khongKeAoChoang'], kq['kiem']['soPixelLuoi'], kq['aoChoang']['duoiAo'], kq['aoChoang']['bienDoDuoiXPx'], kq['aoChoang']['bienDoDuoiYPx'], kq['aoChoang']['hangGau'],
        kq['chuong']['bienDoXPx'], kq['chuong']['bienDoYPx'], [c['khoangCachToiMu'] for c in kq['chuong']['ngoaiMu']], kq['chuong']['dayLienMoiKhung'], kq['saiKhacKeNhau']))
    print('bộ phận đủ mọi khung:', kq['boPhanDuMoiKhung'], {k: min(v) for k, v in kq['boPhan'].items()})
    if xem:
        json.dump(kq, open(os.path.join(OUT, 'kiem-tra.json'), 'w'), ensure_ascii=False, indent=1); return
    for i, im in enumerate(frames): im.save(os.path.join(OUT, 'run-%d.png' % i))
    day_khung(frames, 4, nhan).save(os.path.join(OUT, 'run-x4.png'))
    GIF_MS = [80, 90, 80, 80, 90, 80, 80, 90]   # GIF chỉ nhận bội số 10 ms → xen 80/90 để trung bình 83,75 ms ≈ 83,3 ms (12 FPS); loop=0 = lặp vô hạn
    gif(frames, os.path.join(OUT, 'run.gif'), ms=GIF_MS)
    silhouette(frames, data['frames']).save(os.path.join(OUT, 'silhouette.png'))
    chong_silhouette(frames).save(os.path.join(OUT, 'chong-silhouette.png'))
    lc, kqLat = lat_check(frames); lc.save(os.path.join(OUT, 'lat-check.png')); kq['lat'] = kqLat; kq['latDungMoiKhung'] = all(k['dung'] for k in kqLat)
    quy_dao_chan(kq).save(os.path.join(OUT, 'quy-dao-chan.png'))
    trong_game(frames).save(os.path.join(OUT, 'trong-game.png'))
    v1 = vong1_frames()
    if v1: so_sanh_v1_v2(v1, frames).save(os.path.join(OUT, 'so-sanh-v1-v2-x4.png'))
    idle = idle_frames()
    if idle:
        chuoi = idle + frames + frames + idle; ms = [120, 130] * 3 + GIF_MS * 2 + [120, 130] * 3   # idle 8 FPS = 125 ms → xen 120/130
        gif(chuoi, os.path.join(OUT, 'idle-run-idle.gif'), ms=ms)
        # chân khi chuyển Idle → Run F0 và Run F7 → Idle: bbox ủng
        def ub(im):
            a = im.getchannel('A'); w, h = im.size; xs = [x for x in range(w) if a.getpixel((x, h - 1)) > 0]; return [min(xs), max(xs)] if xs else None
        kq['chuyenIdleRun'] = {'hang63Idle0': ub(idle[0]), 'hang63Run0': ub(frames[0]), 'hang63Run7': ub(frames[7]), 'saiKhacIdle5_Run0': sum(1 for u, v in zip(idle[5].getdata(), frames[0].getdata()) if u != v), 'saiKhacRun7_Idle0': sum(1 for u, v in zip(frames[7].getdata(), idle[0].getdata()) if u != v)}
    # sheet cho game: 512×320, hàng 0 = idle (giữ nguyên bản đã duyệt), hàng 1 = run
    os.makedirs(GAME_ANIM, exist_ok=True)
    sheet = Image.new('RGBA', (512, 320), (0, 0, 0, 0))
    if idle:
        for i, im in enumerate(idle): sheet.paste(im, (i * n, 0))
    for i, im in enumerate(frames): sheet.paste(im, (i * n, n))
    sheet.save(os.path.join(GAME_ANIM, 'lam-proto.png'), optimize=True)
    js = {'version': 1, 'image': 'lam-proto.png', 'frameWidth': n, 'frameHeight': n, 'pivot': PIVOT,
          'animations': {'idle': {'row': 0, 'frames': 6, 'fps': 8, 'loop': True}, 'run': {'row': 1, 'frames': len(frames), 'fps': FPS, 'loop': True}}}
    with open(os.path.join(GAME_ANIM, 'lam-proto.anim.json'), 'w') as f: json.dump(js, f, indent=2); f.write('\n')
    try: kq['anim2d'] = anim2d_check(kq)
    except Exception as e: kq['anim2d'] = {'loi': str(e)}
    json.dump(kq, open(os.path.join(OUT, 'kiem-tra.json'), 'w'), ensure_ascii=False, indent=1)
    print('đã ghi', OUT, 'và', GAME_ANIM, '· anim2d:', kq['anim2d'].get('trang'), kq['anim2d'].get('loi', ''))


if __name__ == '__main__':
    main()
