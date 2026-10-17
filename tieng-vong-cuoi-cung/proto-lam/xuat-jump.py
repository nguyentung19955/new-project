#!/usr/bin/env python3
"""Xuất JUMP 4 khung (10 FPS, ô 64×64, pivot [32,63], KHÔNG loop – giữ khung cuối) của prototype Lam 3/4 bằng Chromium headless, ghi vào proto-lam/out/jump/:
  jump-0.png … jump-3.png      từng khung 64×64 nền trong suốt
  jump-x4.png, jump-x8.png     contact sheet 4 khung: số khung + ms, đường pivot (hàng 63 + chữ thập [32,63]), đánh dấu đáy 2 bàn chân (đường ngang xanh = gần, cam = xa)
  jump.gif                     ×4, 100 ms/khung; GIF lặp CHỈ để xem (animation thật non-loop, giữ F3 – ghi rõ trên ảnh)
  silhouette.png               bóng đen 4 khung ×4 + pivot + vị trí bàn chân (mắt cá/mũi/gót) từng khung
  chong-silhouette.png         4 khung chồng mờ + đường biên từng khung (biên độ)
  so-sanh-idle-jump-x4.png     idle khung cuối (F5) · run F0 · run F1 · jump F0..F3 cạnh nhau (kiểm chuyển trạng thái)
  idle-jump-fall.gif           Idle (6) → Jump F0..F3 → giữ F3 (4 lần) → Fall placeholder (TV.Anim.placeholder, KHÔNG vẽ lại Lam) → Idle
  trong-game.png               nền Làng Chuông 480×270 ×2: idle + 4 khung jump đặt ở độ cao physics giả định 0/−6/−14/−20 px (sprite không tự nâng)
  lat-check.png                4 khung thuận | lật (pivotLat = [fw−1−px, py]) cùng điểm chân
  anim2d-check.png             sheet lam-proto.png nạp vào game/xem-thu/anim2d.html headless (không sửa trang), animation jump: xong() chỉ true sau khi khung cuối hết 100 ms, giữ F3, Kiểm lật
  kiem-tra.json                màu, alpha, pivot, bbox, bàn chân/hông từng khung, khoảng cách chân so pivot, gối co, tay, kiếm liền tay, chuông không xuyên mũ, áo choàng, chuyển Idle/Run → Jump, idle + run render lại trùng pixel
và sheet cho game:  game/anim/lam-proto.png (512×320: hàng 0 idle, hàng 1 run – lấy nguyên từ out/idle, out/run (trùng từng pixel bản cũ), hàng 2 jump 4 khung) + lam-proto.anim.json (thêm jump 4 khung @10 FPS, loop false)
Chạy:  python3 proto-lam/xuat-jump.py [--xem]   (--xem: chỉ ghi jump-x8 + kiem-tra để chỉnh keyframe nhanh)
Không đụng gì ngoài proto-lam/out/jump/ và game/anim/lam-proto.*  (out/idle, out/run giữ nguyên; idle/run render lại chỉ để SO SÁNH)
Dùng chung hàm với xuat-run.py (chromium, anh, mat_na_id, bbox, bb_id, day_khung, gif, lat_check, kiem_idle).
"""
import base64, http.server, importlib.util, json, math, os, socketserver, sys, threading, time, warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(HERE, 'out', 'jump')
IDLE = os.path.join(HERE, 'out', 'idle')
RUN = os.path.join(HERE, 'out', 'run')
GAME = os.path.join(ROOT, 'game')
GAME_ANIM = os.path.join(GAME, 'anim')
_spec = importlib.util.spec_from_file_location('xuat_run', os.path.join(HERE, 'xuat-run.py')); xr = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(xr)
chromium, anh, mat_na_id, bbox, bb_id, day_khung, gif, lat_check, chu = xr.chromium, xr.anh, xr.mat_na_id, xr.bbox, xr.bb_id, xr.day_khung, xr.gif, xr.lat_check, xr.chu
CAO = 44
FPS = 10
MS = 100
NEN = xr.NEN
PAL = xr.PAL
PIVOT = [32, 63]
ID_UNG_GAN, ID_UNG_XA = xr.ID_UNG_GAN, xr.ID_UNG_XA
DO_CAO_GAME = [0, -6, -14, -20]   # độ cao physics giả định (px, âm = lên) cho trong-game.png – chỉ minh hoạ, sprite không tự nâng
MG, MX = (40, 150, 230, 255), (235, 140, 40, 255)   # màu đánh dấu chân gần / chân xa
NHAN = ['F0 · 0 ms · lấy đà', 'F1 · 100 ms · bật', 'F2 · 200 ms · bay lên', 'F3 · 300 ms · gần đỉnh (giữ)']


def dung():
    def chay(br):
        page = br.new_page(); loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.goto('file://' + os.path.join(HERE, 'proto.html'))
        page.wait_for_function('window.PROTO && window.THREE', timeout=30000)
        t0 = time.time()
        data = page.evaluate('(cao) => PROTO.xuatJump(cao)', CAO)
        idle = page.evaluate('(cao) => { var d = PROTO.xuatIdle(cao); delete d.muot; return d; }', CAO)   # Idle V3 + Run V2 render lại cùng trang → kiểm trùng pixel bản đã khoá
        run = page.evaluate('(cao) => PROTO.xuatRun(cao)', CAO)
        if loi: sys.exit('Lỗi JS: ' + '; '.join(loi))
        print('render jump + idle + run: %.1fs' % (time.time() - t0))
        data['idleRenderLai'] = idle; data['runRenderLai'] = run
        return data
    return chromium(chay)


def doc_khung(thu_muc, ten, so):
    fr = []
    for i in range(so):
        p = os.path.join(thu_muc, '%s-%d.png' % (ten, i))
        if not os.path.isfile(p): return None
        fr.append(Image.open(p).convert('RGBA'))
    return fr


def kiem_run(data, n):
    """Run V2 render lại từ cùng trang phải trùng TỪNG PIXEL với out/run/run-*.png (và hàng 1 của game/anim/lam-proto.png cũ)."""
    kq = {'soKhung': len(data['frames']), 'trungPixel': [], 'soPixelKhac': []}
    for i, f in enumerate(data['frames']):
        im = anh(f, n); goc = Image.open(os.path.join(RUN, 'run-%d.png' % i)).convert('RGBA')
        khac = sum(1 for u, v in zip(im.getdata(), goc.getdata()) if u != v)
        kq['soPixelKhac'].append(khac); kq['trungPixel'].append(khac == 0)
    kq['tatCaTrung'] = all(kq['trungPixel'])
    return kq


def day_chan(ids, n):
    """Đáy (hàng thấp nhất) + tâm x của ủng gần / ủng xa theo mặt nạ ID."""
    ug, ux = bb_id(ids, ID_UNG_GAN, n), bb_id(ids, ID_UNG_XA, n)
    return {'ungGan': ug, 'ungXa': ux, 'dayGan': ug[3] if ug else None, 'dayXa': ux[3] if ux else None,
            'tamXGan': round((ug[0] + ug[2]) / 2, 1) if ug else None, 'tamXXa': round((ux[0] + ux[2]) / 2, 1) if ux else None}


def ve_pivot(dr, ox, oy, S, n, mau=(220, 40, 40, 255)):
    px, py = ox + (PIVOT[0] + 0.5) * S, oy + (PIVOT[1] + 0.5) * S
    dr.line([ox, py, ox + n * S - 1, py], fill=(220, 40, 40, 140), width=1)   # đường pivot hàng 63 (mờ)
    dr.line([px - 8, py, px + 8, py], fill=mau, width=2); dr.line([px, py - 8, px, py + 8], fill=mau, width=2)


def contact(frames, dc, S):
    """Contact sheet có số khung + ms + đường pivot + đánh dấu đáy 2 bàn chân (vạch ngang theo bbox ủng: xanh = gần, cam = xa) + số px chân trên pivot."""
    n = frames[0].width; cw = n * S + 6; W = len(frames) * cw + 6; H = n * S + 54
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(12); f11 = chu(11)
    dr.text((6, 4), 'JUMP ×%d · 4 khung · 10 FPS · KHÔNG loop, giữ F3 · pivot [32,63] (chữ thập đỏ, đường đỏ = hàng 63) · vạch xanh = đáy ủng gần, cam = đáy ủng xa' % S, font=f, fill=(230, 235, 240, 255))
    for i, im in enumerate(frames):
        ox, oy = 6 + i * cw, 22
        out.alpha_composite(im.resize((n * S, n * S), Image.NEAREST), (ox, oy))
        dr.rectangle([ox, oy, ox + n * S - 1, oy + n * S - 1], outline=(60, 70, 85, 255))
        ve_pivot(dr, ox, oy, S, n)
        d = dc[i]
        for ten, bb, mau in (('ungGan', d['ungGan'], MG), ('ungXa', d['ungXa'], MX)):
            if bb: y = oy + (bb[3] + 1) * S; dr.line([ox + bb[0] * S, y, ox + (bb[2] + 1) * S, y], fill=mau, width=2)
        dr.text((ox + 3, oy + n * S + 3), NHAN[i], font=f11, fill=(138, 150, 166, 255))
        dr.text((ox + 3, oy + n * S + 17), 'đáy ủng gần/xa trên pivot: %s / %s px' % (63 - d['dayGan'] if d['dayGan'] is not None else '?', 63 - d['dayXa'] if d['dayXa'] is not None else '?'), font=f11, fill=(138, 150, 166, 255))
    return out


def gif_jump(frames, duong_dan, S=4):
    """GIF ×4 có dòng chữ dưới khung: lặp chỉ để xem, animation thật non-loop giữ F3 (khung cuối giữ 400 ms trong GIF để thấy 'giữ')."""
    n = frames[0].width; ims = []; f = chu(11)
    for i, im in enumerate(frames):
        bg = Image.new('RGBA', (n * S, n * S + 30), NEN); bg.alpha_composite(im.resize((n * S, n * S), Image.NEAREST))
        dr = ImageDraw.Draw(bg); dr.text((4, n * S + 2), NHAN[i], font=f, fill=(230, 235, 240, 255))
        dr.text((4, n * S + 16), 'non-loop: giữ F3 · GIF lặp chỉ để xem', font=f, fill=(138, 150, 166, 255))
        ims.append(bg.convert('P', palette=Image.ADAPTIVE, colors=48))
    ims[0].save(duong_dan, save_all=True, append_images=ims[1:], duration=[MS, MS, MS, 400], loop=0, disposal=2)


def silhouette(frames, toa, dc, S=4):
    n = frames[0].width; W = len(frames) * (n * S + 4) + 4; H = n * S + 92
    out = Image.new('RGBA', (W, H), (214, 214, 206, 255)); dr = ImageDraw.Draw(out); fnt = chu(12); f11 = chu(11)
    dr.text((4, 3), 'silhouette jump ×%d · chữ thập đỏ = pivot [32,63], đường đỏ = hàng 63 · chân gần xanh / chân xa cam: chấm to = mắt cá, chấm nhỏ = mũi + gót (3D chiếu)' % S, font=fnt, fill=(60, 60, 60, 255))
    dr.text((4, H - 16), 'vạch màu dưới ủng = đáy ủng theo mặt nạ ID · sprite không dịch lên: hông/đầu đứng yên từ F1, chỉ bàn chân rời đất', font=f11, fill=(60, 60, 60, 255))
    for i, im in enumerate(frames):
        a = im.getchannel('A').point(lambda v: 255 if v > 0 else 0)
        den = Image.new('RGBA', (n, n), (12, 15, 20, 255)); den.putalpha(a)
        ox, oy = 4 + i * (n * S + 4), 20
        out.alpha_composite(den.resize((n * S, n * S), Image.NEAREST), (ox, oy))
        dr.rectangle([ox, oy, ox + n * S - 1, oy + n * S - 1], outline=(120, 120, 110, 255))
        t = toa[i]['toaDo']
        for mc, mui, got, mau, bb in (('matCaGan', 'muiGan', 'gotGan', MG, dc[i]['ungGan']), ('matCaXa', 'muiXa', 'gotXa', MX, dc[i]['ungXa'])):
            p = (ox + t[mc][0] * S, oy + t[mc][1] * S); dr.ellipse([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5], fill=mau)
            for k in (mui, got): q = (ox + t[k][0] * S, oy + t[k][1] * S); dr.ellipse([q[0] - 2.5, q[1] - 2.5, q[0] + 2.5, q[1] + 2.5], fill=mau)
            if bb: y = oy + (bb[3] + 1) * S; dr.line([ox + bb[0] * S, y, ox + (bb[2] + 1) * S, y], fill=mau, width=2)
        ve_pivot(dr, ox, oy, S, n)
        dr.text((ox + 3, oy + n * S + 3), NHAN[i], font=f11, fill=(60, 60, 60, 255))
        dr.text((ox + 3, oy + n * S + 17), 'đáy ủng gần/xa: %d / %d px trên pivot' % (63 - dc[i]['dayGan'], 63 - dc[i]['dayXa']), font=f11, fill=(60, 60, 60, 255))
        dr.text((ox + 3, oy + n * S + 31), 'hông y %.1f · mắt cá gần (%.1f, %.1f)' % (t['hong'][1], t['matCaGan'][0], t['matCaGan'][1]), font=f11, fill=(60, 60, 60, 255))
        dr.text((ox + 3, oy + n * S + 45), 'mắt cá xa (%.1f, %.1f)' % (t['matCaXa'][0], t['matCaXa'][1]), font=f11, fill=(60, 60, 60, 255))
    return out


def chong_silhouette(frames, S=6):
    n = frames[0].width; W1 = n * S + 16
    out = Image.new('RGBA', (W1 * 2, n * S + 60), NEN); dr = ImageDraw.Draw(out)
    MAU = [(83, 204, 147), (131, 170, 230), (225, 184, 90), (230, 120, 120)]
    for i, im in enumerate(frames):
        a = im.getchannel('A').point(lambda v: 255 if v > 0 else 0)
        mo = Image.new('RGBA', (n, n), (236, 240, 244, 255)); mo.putalpha(a.point(lambda v: 64 if v else 0))
        out.alpha_composite(mo.resize((n * S, n * S), Image.NEAREST), (8, 8))
        ero = a.filter(ImageFilter.MinFilter(3)); ap, ep = a.load(), ero.load(); bm = Image.new('L', (n, n), 0); bp = bm.load()
        for y in range(n):
            for x in range(n):
                if ap[x, y] and not ep[x, y]: bp[x, y] = 255
        c = Image.new('RGBA', (n, n), MAU[i] + (255,)); c.putalpha(bm)
        out.alpha_composite(c.resize((n * S, n * S), Image.NEAREST), (W1 + 8, 8))
    for ox in (8, W1 + 8):
        px, py = ox + (PIVOT[0] + 0.5) * S, 8 + (PIVOT[1] + 0.5) * S
        dr.line([ox, py, ox + n * S, py], fill=(255, 60, 60, 120), width=1)
        dr.line([px - 10, py, px + 10, py], fill=(255, 60, 60, 255), width=2); dr.line([px, py - 10, px, py + 10], fill=(255, 60, 60, 255), width=2)
    f = chu(12)
    dr.text((8, n * S + 14), 'Trái: 4 khung jump chồng mờ ×%d (càng sáng = càng nhiều khung có pixel). Phải: đường biên từng khung –' % S, font=f, fill=(230, 235, 240, 255))
    dr.text((8, n * S + 32), 'F0 xanh lá, F1 xanh dương, F2 vàng, F3 đỏ · chữ thập/đường đỏ = pivot [32,63] / hàng 63 (sprite không dịch lên, chỉ bàn chân rời đất)', font=f, fill=(230, 235, 240, 255))
    return out


def so_sanh(idle, run, frames, S=4):
    """idle F5 · run F0 · run F1 · jump F0..F3 cạnh nhau, cùng pivot, đường hàng 63; ghi tâm x ủng gần/xa để thấy chân không nhảy ngang."""
    cols = [('idle F5 (khung cuối)', idle[5]), ('run F0', run[0]), ('run F1', run[1])] + [('jump F%d' % i, im) for i, im in enumerate(frames)]
    n = frames[0].width; cw = n * S + 6; W = len(cols) * cw + 6; H = n * S + 56
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(12); f11 = chu(11)
    dr.text((6, 4), 'so sánh chuyển trạng thái ×%d: Idle (khung cuối) → Jump F0 và Run F0/F1 → Jump F0 · cùng pivot [32,63] · vạch xanh/cam = đáy ủng gần/xa' % S, font=f, fill=(230, 235, 240, 255))
    for i, (ten, im) in enumerate(cols):
        ox, oy = 6 + i * cw, 22
        out.alpha_composite(im.resize((n * S, n * S), Image.NEAREST), (ox, oy))
        dr.rectangle([ox, oy, ox + n * S - 1, oy + n * S - 1], outline=(60, 70, 85, 255)); ve_pivot(dr, ox, oy, S, n)
        a = im.getchannel('A')
        # đáy theo alpha (không có mặt nạ ID cho idle/run đã khoá): hàng thấp nhất có pixel, cột trái/phải
        ys = [y for y in range(n) if any(a.getpixel((x, y)) for x in range(n))]
        if ys:
            y = ys[-1]; xs = [x for x in range(n) if a.getpixel((x, y))]
            dr.line([ox + xs[0] * S, oy + (y + 1) * S, ox + (xs[-1] + 1) * S, oy + (y + 1) * S], fill=(230, 235, 240, 255), width=1)
        dr.text((ox + 3, oy + n * S + 3), ten, font=f11, fill=(138, 150, 166, 255))
        dr.text((ox + 3, oy + n * S + 17), 'hàng 63: cột %s' % (('%d–%d' % (xs[0], xs[-1])) if ys and y == n - 1 else 'trống'), font=f11, fill=(138, 150, 166, 255))
    return out


def placeholder_fall(port):
    """Lấy ô 'fall' (hàng 3, 2 khung) của TV.Anim.placeholder(lam.anim.json) từ game/lib/anim2d.js trong trang headless – KHÔNG vẽ lại Lam."""
    def chay(br):
        page = br.new_page()
        page.goto('http://127.0.0.1:%d/xem-thu/anim2d.html' % port); page.wait_for_timeout(500)
        d = page.evaluate("""async () => { const j = await (await fetch('../anim/lam.anim.json')).json(); const c = TV.Anim.placeholder(j); const a = j.animations.fall;
            const o = document.createElement('canvas'); o.width = j.frameWidth * a.frames; o.height = j.frameHeight; o.getContext('2d').drawImage(c, 0, a.row * j.frameHeight, o.width, o.height, 0, 0, o.width, o.height); return o.toDataURL('image/png'); }""")
        return d
    return chromium(chay)


def server():
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k): super().__init__(*a, directory=GAME, **k)
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', 0), H); th = threading.Thread(target=srv.serve_forever, daemon=True); th.start()
    return srv, srv.server_address[1]


def idle_jump_fall(idle, frames, fall_png, duong_dan, S=4):
    """Idle (6) → Jump F0..F3 → giữ F3 (×4 = 400 ms) → Fall placeholder (2 khung × 2 vòng) → Idle (6). Vẽ trên nền, cùng pivot; chữ ghi trạng thái."""
    n = frames[0].width; f = chu(11); ims = []; ms = []
    fall = Image.open(fall_png).convert('RGBA'); fall_fr = [fall.crop((i * n, 0, i * n + n, n)) for i in range(fall.width // n)]
    chuoi = [('Idle', im, 125) for im in idle] + [('Jump F%d' % i, im, MS) for i, im in enumerate(frames)] + [('Jump giữ F3 (xong())', frames[3], MS)] * 4 + [('Fall placeholder (TV.Anim.placeholder)', im, 125) for im in fall_fr * 2] + [('Idle', im, 125) for im in idle]
    for ten, im, d in chuoi:
        bg = Image.new('RGBA', (n * S, n * S + 30), NEN); bg.alpha_composite(im.resize((n * S, n * S), Image.NEAREST))
        dr = ImageDraw.Draw(bg); py = (PIVOT[1] + 1) * S; dr.line([0, py, n * S, py], fill=(220, 40, 40, 160), width=1)
        dr.text((4, n * S + 2), ten, font=f, fill=(230, 235, 240, 255)); dr.text((4, n * S + 16), 'pivot [32,63] cố định · độ cao thật do physics', font=f, fill=(138, 150, 166, 255))
        ims.append(bg.convert('P', palette=Image.ADAPTIVE, colors=64)); ms.append(d - (d % 10))
    ims[0].save(duong_dan, save_all=True, append_images=ims[1:], duration=ms, loop=0, disposal=2)


def trong_game(idle, frames):
    spec = importlib.util.spec_from_file_location('build', os.path.join(HERE, 'build.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA'); DAT = 241
    atlas = json.load(open(os.path.join(ROOT, 'art', 'sprite', 'atlas.json')))
    q = atlas['quaiChuong']; qs = Image.open(os.path.join(ROOT, 'art', 'sprite', 'quai-chuong.png')).convert('RGBA')
    f0 = q['anims']['idle']['frames'][0]; quai = qs.crop((f0['x'], f0['y'], f0['x'] + q['w'], f0['y'] + q['h'])); qp = q['pivot']
    xs = [40 + i * 56 for i in range(5)]; ds = [0] + DO_CAO_GAME
    cols = [('idle', idle[5], 0)] + [('F%d · y%+d' % (i, DO_CAO_GAME[i]), im, DO_CAO_GAME[i]) for i, im in enumerate(frames)]
    for i, (ten, im, dy) in enumerate(cols): nen.alpha_composite(im, (xs[i] - PIVOT[0], DAT + dy - PIVOT[1]))
    nen.alpha_composite(quai, (400 - qp['x'], DAT - qp['y']))
    big = nen.resize((960, 540), Image.NEAREST); d2 = ImageDraw.Draw(big); fnt = chu(14); f12 = chu(12)
    for i, (ten, im, dy) in enumerate(cols):
        X, Y = xs[i] * 2, (DAT + dy) * 2
        d2.line([X - 10, Y + 1, X + 10, Y + 1], fill=(255, 70, 70, 255), width=2); d2.line([X, Y - 8, X, Y + 10], fill=(255, 70, 70, 255), width=2)   # pivot (điểm chân physics)
        d2.text((X - 18, DAT * 2 + 8), ten, font=f12, fill=(243, 230, 200, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    d2.line([0, DAT * 2 + 1, 960, DAT * 2 + 1], fill=(255, 70, 70, 90), width=1)
    d2.text((400 * 2 - 60, DAT * 2 + 8), 'Quái Chuông Gỗ', font=f12, fill=(243, 230, 200, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    d2.text((8, 8), 'trong-game.png · 480×270 phóng ×2 · nền Làng Chuông · Lam JUMP 4 khung (ô 64, pivot [32,63])', font=fnt, fill=(230, 235, 240, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    d2.text((8, 28), 'chữ thập đỏ = pivot đặt tại player.y giả định 0 / −6 / −14 / −20 px (physics) – sprite KHÔNG tự nâng, chỉ bàn chân rời pivot khi bay', font=fnt, fill=(230, 235, 240, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    return big


# ---------------------------------------------------------------- kiểm tra số liệu
def kiem_tra(data, frames, idle_do, run_do):
    n = data['cell']; ids = [mat_na_id(f) for f in data['frames']]; pxs = [list(im.getdata()) for im in frames]
    kq = {'soKhung': len(frames), 'fps': FPS, 'msKhung': MS, 'tongMs': MS * len(frames), 'o': n, 'pivot': PIVOT, 'loop': False, 'giuKhungCuoi': True}
    tat = set()
    for im in frames: tat |= set(im.getdata())
    mau = sorted(tat, key=lambda c: (c[3], c))
    kq['soMauKeCaTrongSuot'] = len(mau); kq['mau'] = ['#%02X%02X%02X' % c[:3] if c[3] else 'trong suốt' for c in mau]
    kq['mauNgoaiBang'] = [m for m in kq['mau'] if m != 'trong suốt' and m not in PAL]
    kq['alphaChi0_255'] = all(c[3] in (0, 255) for c in tat)
    kq['bbox'] = [list(bbox(im)) for im in frames]; kq['caoNhanVat'] = [b[3] - b[1] for b in kq['bbox']]; kq['rongNhanVat'] = [b[2] - b[0] for b in kq['bbox']]
    kq['pivotRender'] = [f['pivot'] for f in data['frames']]; kq['pivotDung'] = all(p == PIVOT for p in kq['pivotRender'])
    kq['tuThe'] = [f['P'] for f in data['frames']]; kq['vyQuyUoc'] = [round(f['vy'], 3) for f in data['frames']]; kq['gio'] = [round(f['gio'], 3) for f in data['frames']]
    T = [f['toaDo'] for f in data['frames']]; kq['toaDo3D'] = T
    # --- bàn chân / hông từng khung
    dc = [day_chan(d, n) for d in ids]; kq['chan'] = {'theoMatNa': dc}
    ch = kq['chan']
    ch['dayUngGan'] = [d['dayGan'] for d in dc]; ch['dayUngXa'] = [d['dayXa'] for d in dc]
    ch['chanTrenPivotPx'] = {'gan': [63 - d['dayGan'] for d in dc], 'xa': [63 - d['dayXa'] for d in dc]}   # khoảng cách đáy ủng so pivot (hàng 63); 0 = chạm đất
    ch['F0_haiChanChamHang63'] = dc[0]['dayGan'] == 63 and dc[0]['dayXa'] == 63
    ch['F1_chanCaoHonPivot0_2'] = all(0 <= 63 - d <= 2 for d in (dc[1]['dayGan'], dc[1]['dayXa']))
    ch['F3_chanCaoHonPivot2_5'] = all(2 <= 63 - d <= 5 for d in (dc[3]['dayGan'], dc[3]['dayXa']))
    ch['hongY'] = [t['hong'][1] for t in T]; ch['dinhDauY'] = [t['dinhDau'][1] for t in T]
    ch['thanHaF0SoIdlePx'] = round(T[0]['hong'][1] - idle_do['hongY'], 2) if idle_do.get('hongY') is not None else None
    ch['thanVuonF1SoIdlePx'] = round(idle_do['hongY'] - T[1]['hong'][1], 2) if idle_do.get('hongY') is not None else None
    # gối co: khoảng cách dọc mắt cá – hông (px) từng khung; thay đổi F1 → F3 = mức "gối co" (tiêu chí 2–4 px)
    ch['matCaDuoiHongPx'] = {'gan': [round(t['matCaGan'][1] - t['hong'][1], 2) for t in T], 'xa': [round(t['matCaXa'][1] - t['hong'][1], 2) for t in T]}
    ch['goiCoF1toF3Px'] = {'gan': round(ch['matCaDuoiHongPx']['gan'][1] - ch['matCaDuoiHongPx']['gan'][3], 2), 'xa': round(ch['matCaDuoiHongPx']['xa'][1] - ch['matCaDuoiHongPx']['xa'][3], 2)}
    ch['goiCoF1toF2Px'] = {'gan': round(ch['matCaDuoiHongPx']['gan'][1] - ch['matCaDuoiHongPx']['gan'][2], 2), 'xa': round(ch['matCaDuoiHongPx']['xa'][1] - ch['matCaDuoiHongPx']['xa'][2], 2)}
    ch['goiCo2_4Px'] = all(2 <= v <= 4.5 for v in ch['goiCoF1toF3Px'].values())
    ch['khoangCachHongMatCa3D'] = {k: [round(math.hypot(P[x] , P['hy'] - P[y]), 3) for P in kq['tuThe']] for k, x, y in (('gan', 'fXx', 'fXy'), ('xa', 'fGx', 'fGy'))}   # so với tối đa 0,291 (duỗi thẳng)
    # --- tay
    def tam(d, idv):
        pts = [(i % n, i // n) for i, v in enumerate(d) if v in idv]
        return [round(sum(p[0] for p in pts) / len(pts), 1), round(sum(p[1] for p in pts) / len(pts), 1), len(pts)] if pts else None
    kq['tay'] = {'tayGan3D': [t['tayGan'] for t in T], 'tayXa3D': [t['tayXa'] for t in T], 'tamTayGanMatNa': [tam(d, (7,)) for d in ids], 'tamTayXaMatNa': [tam(d, (6,)) for d in ids]}
    if idle_do.get('tayGan'):
        kq['tay']['tayGanNangSoIdlePx'] = [round(idle_do['tayGan'][1] - t['tayGan'][1], 2) for t in T]   # dương = cao hơn idle
        kq['tay']['tayGanNang1_3PxKhiBay'] = all(1 <= v <= 3.2 for v in kq['tay']['tayGanNangSoIdlePx'][1:])
    # --- kiếm (như xuat-run)
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
    def dem(d, idv): return sum(1 for v in d if v in idv)
    luoi_ao = []
    for d in ids:
        ke = 0; trai = 0; keThan = 0
        for i, v in enumerate(d):
            if v in (10, 11):
                x, y = i % n, i // n
                if x < PIVOT[0] - 4: trai += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if 0 <= x + dx < n and 0 <= y + dy < n:
                        if d[(y + dy) * n + x + dx] == 5: ke += 1
                        if v == 10 and d[(y + dy) * n + x + dx] in (4, 14, 17, 2, 3, 1): keThan += 1
        luoi_ao.append({'keAoChoang': ke, 'pixelSauLung': trai, 'luoiKeThanDau': keThan})
    kq['kiem'] = {'lien': [lien(d) for d in ids], 'dauKiem3D': [t['dauKiem'] for t in T], 'soPixelLuoi': [dem(d, (10,)) for d in ids], 'soPixelChuoiChan': [dem(d, (11,)) for d in ids], 'luoiVsAoChoang': luoi_ao,
                 'gocLuoiDeg': [round(math.degrees(math.atan2(t['tayXa'][1] - t['dauKiem'][1], t['dauKiem'][0] - t['tayXa'][0])), 1) for t in T]}
    kq['kiem']['lienMoiKhung'] = all(k['motKhoi'] and k['tayChuoiKe'] and k['chuoiLuoiKe'] for k in kq['kiem']['lien'])
    kq['kiem']['luonBenPhaiThan'] = all(x['pixelSauLung'] == 0 for x in luoi_ao); kq['kiem']['khongKeAoChoang'] = all(x['keAoChoang'] == 0 for x in luoi_ao)
    kq['kiem']['luoiKhongXuyenThan'] = all(x['luoiKeThanDau'] == 0 for x in luoi_ao)
    kq['kiem']['luonTayXa'] = all(k['motKhoi'] for k in kq['kiem']['lien'])   # lưỡi+chuôi liên thông với ID tay xa (6) ở mọi khung → không đổi tay
    # --- áo choàng
    ao = [bb_id(d, (5,), n) for d in ids]; duoi = []; gau = []
    for d in ids:
        pts = [(i % n, i // n) for i, v in enumerate(d) if v == 5]
        mx = min(p[0] for p in pts); duoi.append([mx, max(p[1] for p in pts if p[0] == mx)]); gau.append(max(p[1] for p in pts))
    kq['aoChoang'] = {'bbox': ao, 'duoiAo': duoi, 'hangGau': gau, 'bienDoDuoiXPx': max(x[0] for x in duoi) - min(x[0] for x in duoi), 'bienDoDuoiYPx': max(x[1] for x in duoi) - min(x[1] for x in duoi),
                      'bienDoGauPx': max(gau) - min(gau), 'xoeSauPx': [PIVOT[0] - b[0] for b in ao], 'thSim': [[round(v, 3) for v in f['sim']['th']] for f in data['frames']],
                      'gauSoHongPx': [round(g - t['hong'][1], 1) for g, t in zip(gau, T)]}   # gấu áo tính từ hông: tăng = áo trễ xuống so thân
    # "trễ": khi bay lên, luồng khí ép áo cụp xuống/ít xoè → đuôi áo (pixel trái nhất) dịch về phía thân so với F1 (ngang là chính; gấu so hông chỉ đổi ≤ 1 px vì góc nhỏ)
    kq['aoChoang']['treDuoiXSoF1Px'] = [duoi[i][0] - duoi[1][0] for i in range(len(duoi))]; kq['aoChoang']['treGauSoHongSoF1Px'] = [round(g - kq['aoChoang']['gauSoHongPx'][1], 1) for g in kq['aoChoang']['gauSoHongPx']]
    kq['aoChoang']['treChuyenDongPx'] = max(abs(v) for v in kq['aoChoang']['treDuoiXSoF1Px'][2:] + [kq['aoChoang']['treGauSoHongSoF1Px'][2], kq['aoChoang']['treGauSoHongSoF1Px'][3]])
    kq['aoChoang']['treXuong1_3Px'] = 1 <= kq['aoChoang']['treChuyenDongPx'] <= 3
    # --- chuông (như xuat-run)
    def chuong_mu(d):
        chb = bb_id(d, (12,), n)
        if not chb: return None
        mep = [min(x for x in range(n) if d[y * n + x] in (1, 2, 3)) for y in range(chb[1], chb[3] + 1) if any(d[y * n + x] in (1, 2, 3) for x in range(n))]
        mat = bb_id(d, (1,), n)
        return {'bboxChuong': chb, 'khoangCachToiMu': (min(mep) - chb[2] - 1) if mep else None, 'chuongTrumMat': bool(mat) and not (chb[2] < mat[0] or chb[0] > mat[2] or chb[3] < mat[1] or chb[1] > mat[3])}
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
        cham = any(d[(top[1] + dy) * n + top[0] + dx] in (1, 2, 3) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= top[0] + dx < n and 0 <= top[1] + dy < n)
        return {'lien': toi, 'soPixel': len(ds), 'dinhDay': list(top), 'dinhChamMu': cham}
    tc = [tam(d, (12,)) for d in ids]
    kq['chuong'] = {'tam': tc, 'bienDoXPx': round(max(t[0] for t in tc) - min(t[0] for t in tc), 1), 'bienDoYPx': round(max(t[1] for t in tc) - min(t[1] for t in tc), 1), 'soPixel': [t[2] for t in tc],
                    'tamSoHong': [[round(t[0] - h['hong'][0], 1), round(t[1] - h['hong'][1], 1)] for t, h in zip(tc, T)],
                    'ngoaiMu': [chuong_mu(d) for d in ids], 'day': [day_lien8(d) for d in ids], 'thSim': [round(f['sim']['cth'], 3) for f in data['frames']]}
    cs = kq['chuong']['tamSoHong']; kq['chuong']['bienDoSoThanPx'] = [round(max(c[k] for c in cs) - min(c[k] for c in cs), 1) for k in (0, 1)]   # dao động chuông so với hông (gồm cả phần thân nghiêng)
    kq['chuong']['tamSoDinhDau'] = [[round(t[0] - h['dinhDau'][0], 1), round(t[1] - h['dinhDau'][1], 1)] for t, h in zip(tc, T)]   # so với đỉnh đầu (gần điểm gắn) → dao động thật của chuông quanh chỗ treo
    cd = kq['chuong']['tamSoDinhDau']; kq['chuong']['bienDoSoDinhDauPx'] = [round(max(c[k] for c in cd) - min(c[k] for c in cd), 1) for k in (0, 1)]
    kq['chuong']['khongXuyenMu'] = all(c and c['khoangCachToiMu'] is not None and c['khoangCachToiMu'] >= 1 and not c['chuongTrumMat'] for c in kq['chuong']['ngoaiMu'])
    kq['chuong']['dayLienMoiKhung'] = all(x['lien'] for x in kq['chuong']['day']); kq['chuong']['dinhDayChamMu'] = [x['dinhChamMu'] for x in kq['chuong']['day']]
    kq['chuong']['daoDongNhe'] = max(kq['chuong']['bienDoSoDinhDauPx']) <= 2
    # --- sai khác pixel khung kề (không loop → không có F3→F0)
    def diff(a, b): return sum(1 for u, v in zip(a.getdata(), b.getdata()) if u != v)
    kq['saiKhacKeNhau'] = [diff(frames[i], frames[i + 1]) for i in range(len(frames) - 1)]
    # --- chuyển trạng thái: Idle khung cuối → Jump F0, Run F? → Jump F0 (tâm x ủng theo mặt nạ; 3D mắt cá)
    def lech(a, b): return None if a is None or b is None else round(abs(a - b), 1)
    cj = {'idle5': idle_do, 'jumpF0': dc[0], 'lechTamXUngIdle5_JumpF0': {'gan': lech(idle_do['ung'][5]['tamXGan'], dc[0]['tamXGan']), 'xa': lech(idle_do['ung'][5]['tamXXa'], dc[0]['tamXXa'])},
          'lechDayUngIdle5_JumpF0': {'gan': lech(idle_do['ung'][5]['dayGan'], dc[0]['dayGan']), 'xa': lech(idle_do['ung'][5]['dayXa'], dc[0]['dayXa'])},
          'runTungKhung_JumpF0': [{'khung': i, 'lechTamXUngGan': lech(r['tamXGan'], dc[0]['tamXGan']), 'lechTamXUngXa': lech(r['tamXXa'], dc[0]['tamXXa']),
                                   'lechMatCa3D': {'gan': round(abs(run_do['toaDo'][i]['matCaGan'][0] - T[0]['matCaGan'][0]), 2), 'xa': round(abs(run_do['toaDo'][i]['matCaXa'][0] - T[0]['matCaXa'][0]), 2)}} for i, r in enumerate(run_do['ung'])]}
    cj['idleToF0_khongNhayNgangQua3Px'] = all(v is not None and v <= 3 for v in cj['lechTamXUngIdle5_JumpF0'].values())
    cj['runKhungVaoDuoc3Px'] = [r['khung'] for r in cj['runTungKhung_JumpF0'] if r['lechTamXUngGan'] is not None and r['lechTamXUngGan'] <= 3 and r['lechTamXUngXa'] <= 3]
    cj['saiKhacPixelIdle5_JumpF0'] = idle_do.get('saiKhacIdle5_JumpF0')
    kq['chuyenTrangThai'] = cj
    # --- bộ phận có mặt mọi khung
    bp = {'matSang(#F3E6C8)': [sum(1 for p in px if p[:3] == (0xF3, 0xE6, 0xC8)) for px in pxs], 'luoi': kq['kiem']['soPixelLuoi'], 'chuoiChan': kq['kiem']['soPixelChuoiChan'], 'chuong': kq['chuong']['soPixel'],
          'dayChuong': [x['soPixel'] for x in kq['chuong']['day']], 'tram': [dem(d, (17,)) for d in ids], 'vachUngGan': [dem(d, (16,)) for d in ids], 'vachUngXa': [dem(d, (15,)) for d in ids],
          'ungGan': [dem(d, (19,)) for d in ids], 'ungXa': [dem(d, (18,)) for d in ids], 'tayGan': [dem(d, (7,)) for d in ids], 'tayXa': [dem(d, (6,)) for d in ids], 'chanGan': [dem(d, (9,)) for d in ids], 'chanXa': [dem(d, (8,)) for d in ids],
          'mu': [dem(d, (2, 3)) for d in ids], 'than': [dem(d, (4,)) for d in ids], 'aoChoang': [dem(d, (5,)) for d in ids]}
    bp['mat2Diem'] = [sum(1 for i, p in enumerate(px) if p[:3] == (0xF3, 0xE6, 0xC8) and i % n >= 30 and i // n < 40) for px in pxs]
    kq['boPhan'] = bp
    kq['boPhanDuMoiKhung'] = all(min(v) >= 1 for k, v in bp.items() if k not in ('vachUngXa', 'chanXa', 'mat2Diem')) and all(v == 2 for v in bp['mat2Diem'])
    kq['boPhanBiCheTamThoi'] = {k: [i for i, v in enumerate(bp[k]) if v == 0] for k in ('vachUngXa', 'chanXa')}
    return kq


def anim2d_check(port):
    """Mở game/xem-thu/anim2d.html (không sửa trang), nạp sheet lam-proto.png qua ô URL (JSON của trang = anim/lam.anim.json: jump hàng 2, 4 khung, 10 FPS, loop false),
    chọn animation jump, chụp ảnh sau khi hết thời lượng (giữ F3, xong() = true) + Kiểm lật; thêm bộ phát riêng TV.Anim.tao để đo đúng bước nào xong() lật true."""
    def chay(br):
        page = br.new_page(viewport={'width': 760, 'height': 1200}); loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.goto('http://127.0.0.1:%d/xem-thu/anim2d.html' % port); page.wait_for_timeout(600)
        page.fill('#uPng', 'http://127.0.0.1:%d/anim/lam-proto.png' % port); page.click('#bUrl')
        page.wait_for_function("document.getElementById('nguon').textContent.indexOf('PNG') === 0", timeout=10000)
        page.click('#rAnim button[data-ten="jump"]'); page.wait_for_timeout(150)
        som = page.evaluate("() => ({khung: document.getElementById('iKhung').textContent, xong: document.getElementById('iXong').textContent, khungCuoi: document.getElementById('iKhungCuoi').textContent})")
        page.wait_for_timeout(1200)   # 400 ms thời lượng + dư → phải đứng ở khung 4/4, xong() = true, loop false
        page.click('#z6'); page.wait_for_timeout(300)
        page.click('#bKiemLat'); page.wait_for_timeout(300)
        kqLat = page.inner_text('#kqKiem')
        info = page.evaluate("() => ({ten: document.getElementById('iTen').textContent, khung: document.getElementById('iKhung').textContent, fps: document.getElementById('iFps').textContent, loop: document.getElementById('iLoop').textContent, xong: document.getElementById('iXong').textContent, khungCuoi: document.getElementById('iKhungCuoi').textContent, acc: document.getElementById('iAcc').textContent, nguon: document.getElementById('nguon').textContent, msg: document.getElementById('msg').textContent})")
        page.wait_for_timeout(1000)
        sau = page.evaluate("() => ({khung: document.getElementById('iKhung').textContent, xong: document.getElementById('iXong').textContent})")   # 1 s sau vẫn giữ 4/4
        # bộ phát riêng (cùng TV.Anim, cùng sheet URL): bước 1000/60 ms, ghi khung + xong() từng bước
        buoc = page.evaluate("""async (u) => { const j = await (await fetch('../anim/lam.anim.json')).json(); const im = await TV.Anim.napAnh(u); const s = TV.Anim.taoSheet(im, j); const bp = TV.Anim.tao(s).set('jump');
            const dt = 1000 / 60, log = []; let xongTai = null, toiCuoiTai = null, t = 0;
            for (let i = 1; i <= 40; i++) { bp.update(dt); t += dt; if (toiCuoiTai === null && bp.khungCuoi()) toiCuoiTai = {buoc: i, ms: +t.toFixed(1)}; if (xongTai === null && bp.xong()) xongTai = {buoc: i, ms: +t.toFixed(1)}; log.push(bp.frame() + (bp.xong() ? 'X' : '')); }
            const kl = [0, 1, 2, 3].map(k => TV.Anim.kiemLat(s, 'jump', k)).map(r => ({khung: r.khung, dung: r.dung, saiPixel: r.saiPixel, lech: r.lech, tamLech: r.tamLech}));
            return {log, toiCuoiTai, xongTai, khungSauCung: bp.frame(), msKhung: s.anims.jump.msKhung, loop: s.anims.jump.loop, frames: s.anims.jump.frames, kiemLat4Khung: kl}; }""", 'http://127.0.0.1:%d/anim/lam-proto.png' % port)
        page.screenshot(path=os.path.join(OUT, 'anim2d-check.png'), full_page=True)
        return {'trang': info, 'ngayKhiChon': som, 'sau1sNua': sau, 'kiemLat': kqLat, 'boPhatRieng': buoc, 'loiJS': loi}
    return chromium(chay)


def main():
    os.makedirs(OUT, exist_ok=True); xem = '--xem' in sys.argv
    data = dung(); n = data['cell']
    frames = [anh(f, n) for f in data['frames']]
    idle = doc_khung(IDLE, 'idle', 6); run = doc_khung(RUN, 'run', 8)
    # số đo idle/run từ bản render lại (có mặt nạ ID) – chỉ để so chuyển trạng thái
    idl = data['idleRenderLai']; rn = data['runRenderLai']
    idle_do = {'ung': [day_chan(mat_na_id(f), n) for f in idl['frames']], 'hongY': None, 'tayGan': None}
    run_do = {'ung': [day_chan(mat_na_id(f), n) for f in rn['frames']], 'toaDo': [f['toaDo'] for f in rn['frames']]}
    # hông/tay gần idle: lấy từ run F? không được (khác tư thế) → tính từ khung idle qua PROTO không có toaDo; dùng mặt nạ: hông idle ≈ tâm thắt lưng (ID 14), tay gần = tâm ID 7
    def tam_id(d, idv):
        pts = [(i % n, i // n) for i, v in enumerate(d) if v in idv]; return [round(sum(p[0] for p in pts) / len(pts), 2), round(sum(p[1] for p in pts) / len(pts), 2)] if pts else None
    idle_do['tayGanMatNa'] = tam_id(mat_na_id(idl['frames'][5]), (7,))
    idle_do['hongY'] = data['idleThamChieu']['hong'][1]; idle_do['tayGan'] = data['idleThamChieu']['tayGan']; idle_do['toaDo'] = data['idleThamChieu']
    if idle: idle_do['saiKhacIdle5_JumpF0'] = sum(1 for u, v in zip(idle[5].getdata(), frames[0].getdata()) if u != v)
    kq = kiem_tra(data, frames, idle_do, run_do)
    kq['idle'] = xr.kiem_idle(idl, n); kq['run'] = kiem_run(rn, n)
    dc = kq['chan']['theoMatNa']
    print('idle render lại trùng pixel out/idle:', kq['idle']['trungPixel'], '· run trùng out/run:', kq['run']['trungPixel'])
    print('màu %d · ngoài bảng %s · alpha0/255 %s · pivot đúng %s · cao %s · rộng %s' % (kq['soMauKeCaTrongSuot'], kq['mauNgoaiBang'], kq['alphaChi0_255'], kq['pivotDung'], kq['caoNhanVat'], kq['rongNhanVat']))
    print('đáy ủng gần %s · xa %s · chân trên pivot gần %s xa %s · F0 chạm 63 %s · F1 0–2 %s · F3 2–5 %s' % (kq['chan']['dayUngGan'], kq['chan']['dayUngXa'], kq['chan']['chanTrenPivotPx']['gan'], kq['chan']['chanTrenPivotPx']['xa'], kq['chan']['F0_haiChanChamHang63'], kq['chan']['F1_chanCaoHonPivot0_2'], kq['chan']['F3_chanCaoHonPivot2_5']))
    print('hông y %s · mắt cá dưới hông gần %s xa %s · gối co F1→F3 %s · hông–mắt cá 3D gần %s xa %s' % (kq['chan']['hongY'], kq['chan']['matCaDuoiHongPx']['gan'], kq['chan']['matCaDuoiHongPx']['xa'], kq['chan']['goiCoF1toF3Px'], kq['chan']['khoangCachHongMatCa3D']['gan'], kq['chan']['khoangCachHongMatCa3D']['xa']))
    print('tay gần 3D %s · nâng so idle %s · kiếm liền %s · không kề áo %s · không xuyên thân %s · lưỡi deg %s' % (kq['tay']['tayGan3D'], kq['tay'].get('tayGanNangSoIdlePx'), kq['kiem']['lienMoiKhung'], kq['kiem']['khongKeAoChoang'], kq['kiem']['luoiKhongXuyenThan'], kq['kiem']['gocLuoiDeg']))
    print('áo: đuôi %s gấu %s gấu−hông %s · chuông tâm %s so thân %s biên độ so thân %s, cách mũ %s, dây liền %s · sai khác kề %s' % (kq['aoChoang']['duoiAo'], kq['aoChoang']['hangGau'], kq['aoChoang']['gauSoHongPx'], kq['chuong']['tam'], kq['chuong']['tamSoDinhDau'], kq['chuong']['bienDoSoDinhDauPx'], [c['khoangCachToiMu'] for c in kq['chuong']['ngoaiMu']], kq['chuong']['dayLienMoiKhung'], kq['saiKhacKeNhau']))
    print('chuyển: idle5→F0 lệch tâm x ủng %s · run→F0 vào được (≤3 px) từ khung %s' % (kq['chuyenTrangThai']['lechTamXUngIdle5_JumpF0'], kq['chuyenTrangThai']['runKhungVaoDuoc3Px']))
    print('bộ phận đủ mọi khung:', kq['boPhanDuMoiKhung'], {k: min(v) for k, v in kq['boPhan'].items()})
    day_khung(frames, 8, NHAN).save(os.path.join(OUT, 'jump-x8.png'))
    if xem:
        json.dump(kq, open(os.path.join(OUT, 'kiem-tra.json'), 'w'), ensure_ascii=False, indent=1); return
    for i, im in enumerate(frames): im.save(os.path.join(OUT, 'jump-%d.png' % i))
    contact(frames, dc, 4).save(os.path.join(OUT, 'jump-x4.png'))
    gif_jump(frames, os.path.join(OUT, 'jump.gif'))
    silhouette(frames, data['frames'], dc).save(os.path.join(OUT, 'silhouette.png'))
    chong_silhouette(frames).save(os.path.join(OUT, 'chong-silhouette.png'))
    lc, kqLat = lat_check(frames); lc.save(os.path.join(OUT, 'lat-check.png')); kq['lat'] = kqLat; kq['latDungMoiKhung'] = all(k['dung'] for k in kqLat)
    if idle and run: so_sanh(idle, run, frames).save(os.path.join(OUT, 'so-sanh-idle-jump-x4.png'))
    if idle: trong_game(idle, frames).save(os.path.join(OUT, 'trong-game.png'))
    # sheet cho game: hàng 0 idle, hàng 1 run (nguyên bản đã khoá), hàng 2 jump
    os.makedirs(GAME_ANIM, exist_ok=True)
    sheet = Image.new('RGBA', (512, 320), (0, 0, 0, 0))
    cu = os.path.join(GAME_ANIM, 'lam-proto.png'); sheet_cu = Image.open(cu).convert('RGBA') if os.path.isfile(cu) else None
    for i, im in enumerate(idle or []): sheet.paste(im, (i * n, 0))
    for i, im in enumerate(run or []): sheet.paste(im, (i * n, n))
    for i, im in enumerate(frames): sheet.paste(im, (i * n, 2 * n))
    if sheet_cu is not None:   # hàng 0, 1 phải trùng từng pixel bản cũ
        kq['sheetHang01TrungBanCu'] = sum(1 for u, v in zip(sheet.crop((0, 0, 512, 2 * n)).getdata(), sheet_cu.crop((0, 0, 512, 2 * n)).getdata()) if u != v) == 0
    sheet.save(cu, optimize=True)
    js = {'version': 1, 'image': 'lam-proto.png', 'frameWidth': n, 'frameHeight': n, 'pivot': PIVOT,
          'animations': {'idle': {'row': 0, 'frames': 6, 'fps': 8, 'loop': True}, 'run': {'row': 1, 'frames': 8, 'fps': 12, 'loop': True}, 'jump': {'row': 2, 'frames': len(frames), 'fps': FPS, 'loop': False}}}
    with open(os.path.join(GAME_ANIM, 'lam-proto.anim.json'), 'w') as f: json.dump(js, f, indent=2); f.write('\n')
    srv, port = server()
    try:
        fall_uri = placeholder_fall(port); fall_png = os.path.join(OUT, 'fall-placeholder.png')
        with open(fall_png, 'wb') as f: f.write(base64.b64decode(fall_uri.split(',', 1)[1]))
        if idle: idle_jump_fall(idle, frames, fall_png, os.path.join(OUT, 'idle-jump-fall.gif'))
        try: kq['anim2d'] = anim2d_check(port)
        except Exception as e: kq['anim2d'] = {'loi': str(e)}
    finally: srv.shutdown(); srv.server_close()
    json.dump(kq, open(os.path.join(OUT, 'kiem-tra.json'), 'w'), ensure_ascii=False, indent=1)
    print('đã ghi', OUT, 'và', GAME_ANIM, '· sheet hàng 0–1 trùng bản cũ:', kq.get('sheetHang01TrungBanCu'), '· anim2d:', kq['anim2d'].get('trang'), kq['anim2d'].get('boPhatRieng', {}).get('xongTai'), kq['anim2d'].get('loi', ''))


if __name__ == '__main__':
    main()
