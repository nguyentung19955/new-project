#!/usr/bin/env python3
"""Camera kiểu Dead Cells 28/10 – quay + đo trên trang P0-C (game/thu-p0c/index.html). KHÔNG phải bộ kiểm thử tự động (không đạt / trượt):
chỉ quay video + ghi số ra game/thu-p0c/video/camera-dead-cells-2810.json để đọc.

  1. VIDEO (không bất tử, chế độ cảm ứng → lệch dọc +28 như iPhone): bot chạy liền A → F từ chuông lưu A: giữ phải, gặp bậc thì nhảy,
     Chuông Gỗ ở B / C (cổng C chỉ mở khi hạ quái gác) thì đứng chém, Bọ D / tinh anh E thì LƯỚT xuyên. Dừng khi tới giữa F.
     Mỗi hình = 1 bước logic, 60 hình/s. Ghi theo từng bước: x Lam, phòng, camx / camy, look-ahead → số: tốc độ camera lúc qua ranh phòng,
     vị trí Lam trên màn, camera có ra ngoài thế giới không; quái / Bọ nằm trong màn mà KHÔNG được cập nhật (đứng im); lần mất máu.
  2. NỀN: quét camera (datCam) suốt A → F, lệch dọc 0 và 28: khoảng các mảnh nền giữa trên màn (chồng nhau? hở bao nhiêu?), ảnh 12 vị trí.
  3. RANH MẢNG ĐẤT (TVPB.soiRanh – cách kiểm của thu-phong-b B3.2) ở 26 vị trí camera lẻ × 5 tỉ lệ K × lệch dọc 0 / 28: số điểm hở.
Chạy: python3 -B game/thu-p0c/cong-cu/quay-camera.py [--khong-video]   (cần playwright, Chromium, ffmpeg, Pillow)"""
import asyncio, functools, http.server, io, json, os, socketserver, subprocess, sys, threading
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-p0c', 'video'); os.makedirs(OUT, exist_ok=True)
VIDEO = '--khong-video' not in sys.argv
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except Exception: FONT = ImageFont.load_default()


class Im(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


BOT = r'''() => {
  const cx = pl.x + pl.w / 2; let phim = 'r', gan = null, gd = 1e9, loai = '';
  for (const q of Q) { if (qDown(q) || q.gone || q.nom) continue; const d = (q.x + q.w / 2) - cx; if (d > -30 && d < gd) { gd = d; gan = q; loai = q.tinhAnh ? 'ta' : 'q'; } }
  for (const b of BO.DS) { if (b.gone || b.st === 'chet') continue; const d = (b.x + b.w / 2) - cx; if (d > -30 && d < gd) { gd = d; gan = b; loai = 'bo'; } }
  const r = ROOMS[S.room];
  if (gan && loai === 'q' && (r === PB || r === PC) && (gan.st === 'wind' || gan.st === 'strike') && gd < 150) phim = gd < 140 ? 'l' : '';   // Chuông Gỗ báo đòn: lùi
  else if (gan && loai === 'q' && (r === PB || r === PC) && gd < 95) phim = (S.frame % 14 < 1) ? 'a' : '';   // Chuông Gỗ B / C: đứng chém
  else if (gan && gd < 150 && pl.dashCd <= 0 && pl.dash <= 0) phim += 's';                             // Bọ / tinh anh: lướt xuyên
  if (pl.onGround && Math.abs(pl.dxT) < 0.5 && pl.dash <= 0 && phim.includes('r')) phim += 'j';         // vướng bậc: nhảy
  if (!pl.onGround && pl.vy < 0) phim += 'j';
  return phim; }'''

BUOC = r'''() => {
  const ph = BOTF(); const qt = Q.map(q => q.t), bt = BO.DS.map(b => b.t), hs = S.hitstop, hp0 = pl.hp;
  TVP0.datPhim(ph); savePrev(); step(); render(1);
  const om = []; const trongMan = o => o.x + o.w > S.camx && o.x < S.camx + W;
  if (!hs && !S.paused) { Q.forEach((q, i) => { if (!q.gone && !qDown(q) && trongMan(q) && q.t === qt[i]) om.push('Q' + i + '@' + ROOMS[roomAt(q.x + q.w / 2)].name); });
    BO.DS.forEach((b, i) => { if (!b.gone && trongMan(b) && b.t === bt[i]) om.push('Bo' + i); }); }
  const ke = []; if (pl.hp < hp0) { for (const q of Q) if (!qDown(q) && Math.abs(q.x + q.w / 2 - pl.x - pl.w / 2) < 220) ke.push(ROOMS[roomAt(q.x + q.w / 2)].name);
    for (const b of BO.DS) if (!b.gone && Math.abs(b.x + b.w / 2 - pl.x - pl.w / 2) < 220) ke.push(ROOMS[roomAt(b.x + b.w / 2)].name); }
  return [S.frame, +(pl.x + pl.w / 2).toFixed(1), S.room, +S.camx.toFixed(2), +S.camy.toFixed(2), +S.look.toFixed(1), pl.hp, pl.dead ? 1 : 0, ph, om, pl.hp < hp0 ? [ROOMS[S.room].name, ke] : null]; }'''


def chuoi(R):   # số bước LIÊN TIẾP dài nhất một quái nằm trong màn mà không được cập nhật (1 bước lẻ = bị trúng đòn đặt lại bộ đếm, không phải đứng im)
    dai, cur = {}, {}
    for r in R:
        for k in list(cur):
            if k not in r[9]: cur.pop(k)
        for k in r[9]: cur[k] = cur.get(k, 0) + 1; dai[k] = max(dai.get(k, 0), cur[k])
    return dai


def nhan(im, chu):
    d = ImageDraw.Draw(im, 'RGBA'); w = d.textlength(chu, font=FONT)
    d.rectangle([im.width - w - 16, 512, im.width, 540], fill=(12, 15, 20, 210)); d.text((im.width - w - 8, 515), chu, font=FONT, fill=(243, 230, 200))
    return im


async def main():
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Im, directory=GOC)); cong = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    KQ = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
        await pg.route('https://fonts.g*/**', lambda r: r.abort())
        await pg.goto('http://127.0.0.1:%d/game/thu-p0c/index.html?ghi=1' % cong)
        await pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=120000)
        await pg.evaluate('TVP0.batDau()'); await pg.evaluate('setMode(true)'); await pg.evaluate('TVP0.anUI(1)')
        await pg.evaluate('window.BOTF = ' + BOT)
        KQ['khu'] = await pg.evaluate('camKhu()'); KQ['so_camera'] = await pg.evaluate('Object.fromEntries(Object.entries(CAM).filter(([k, v]) => typeof v === "number" && k === k.toUpperCase()))')
        KQ['phong'] = await pg.evaluate('ROOMS.map(r => [r.name, r.x0 * T, (r.x0 + r.w) * T])')
        await pg.evaluate('render(1)')

        # ---- 1. video A → F ----
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'mjpeg', '-i', '-', '-vf', 'format=yuv420p',
                               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-r', '60', '-movflags', '+faststart',
                               os.path.join(OUT, 'camera-dead-cells-2810.mp4')], stdin=subprocess.PIPE) if VIDEO else None
        R = []; xF = await pg.evaluate('(PF.x0 + 8) * T')
        for i in range(3000):
            r = await pg.evaluate(BUOC); R.append(r)
            if ff:
                im = Image.open(io.BytesIO(await pg.screenshot(type='jpeg', quality=88))).convert('RGB')
                nhan(im, 'Camera kiểu Dead Cells 28/10 · P0-C A→F · không bất tử · phòng %s · máu %d' % (KQ['phong'][r[2]][0], r[6]))
                b2 = io.BytesIO(); im.save(b2, 'JPEG', quality=90); ff.stdin.write(b2.getvalue())
            if r[1] > xF or r[7]: break
        if ff: ff.stdin.close(); ff.wait()
        dc = [R[i][3] - R[i - 1][3] for i in range(1, len(R))]
        ranh = []
        for i in range(2, len(R)):
            if R[i][2] != R[i - 1][2]:
                ranh.append({'tu': KQ['phong'][R[i - 1][2]][0], 'sang': KQ['phong'][R[i][2]][0], 'f': R[i][0], 'camx_buoc_truoc': round(dc[i - 2], 2), 'camx_buoc_qua_ranh': round(dc[i - 1], 2),
                             'lam_tren_man_x': round(R[i][1] - R[i][3])})
        khu = [k for k in KQ['khu'] if k['tu'] == 'Khởi đầu'][0]
        KQ['video'] = {'buoc': len(R), 'giay': round(len(R) / 60, 1), 'toi_F': R[-1][1] > xF, 'chet': R[-1][7], 'mau_cuoi': R[-1][6],
                       'mat_mau': [{'f': r[0], 'lam_o': r[10][0], 'quai_gan_o': r[10][1]} for r in R if r[10]],
                       'qua_ranh': ranh, 'camx_buoc_max': round(max(abs(x) for x in dc), 2),
                       'camx_min_max': [min(r[3] for r in R), max(r[3] for r in R)], 'khu_cho_phep': [khu['a'], khu['b'] - 960],
                       'ra_ngoai_the_gioi': sum(1 for r in R if r[3] < khu['a'] - 0.01 or r[3] > khu['b'] - 960 + 0.01),
                       'camy_min_max': [min(r[4] for r in R), max(r[4] for r in R)],
                       'lam_tren_man_x_min_max': [round(min(r[1] - r[3] for r in R)), round(max(r[1] - r[3] for r in R))],
                       'quai_trong_man_khong_cap_nhat_1_buoc': sorted({x for r in R for x in r[9]}), 'chuoi_dai_nhat_quai_trong_man_dung_im': chuoi(R)}
        print('video:', json.dumps(KQ['video'], ensure_ascii=False))

        # ---- 2. nền giữa + ảnh quét ----
        so = json.load(open(os.path.join(GOC, 'art', 'huong-moi', 'dia-hinh', 'dia-hinh.json'), encoding='utf-8'))['nen']['giua']
        rong = {k: v[2] / 2 for k, v in so['khung'].items()}; hs = so['he_so']
        manh = await pg.evaluate('NEN_ABC.giua.map(p => ({m: p.m, x: p.x, rc: p.rc, w: p.w, al: p.al}))')
        u = sorted([(p['x'] + p['rc'] * hs - khu['a'] * hs, p['x'] + p['rc'] * hs - khu['a'] * hs + rong[p['m']], p['m']) for p in manh])
        KQ['nen_giua'] = {'manh_u': [[round(a), round(b2), m] for a, b2, m in u], 'ho_giua_2_manh': [round(u[i + 1][0] - u[i][1]) for i in range(len(u) - 1)],
                          'ghi_chu': 'u = x trên màn khi camera ở mép trái A; mảnh trên màn = u − (camx − mép A) × 0,4; số âm = chồng (chỉ cặp tháp + cây của F, giữ như thiết kế F)'}
        anh = []
        for k in range(12):
            cx = khu['a'] + (khu['b'] - 960 - khu['a']) * k / 11
            await pg.evaluate('([x]) => { S.camy = 28; TVPB.datCam(x); }', [cx])
            anh.append(Image.open(io.BytesIO(await pg.screenshot(type='png'))).convert('RGB').resize((480, 270)))
        tong = Image.new('RGB', (960, 270 * 6), (0, 0, 0))
        for i, im in enumerate(anh): tong.paste(im, ((i % 2) * 480, (i // 2) * 270))
        tong.save(os.path.join(OUT, 'camera-dead-cells-nen-2810.png'))

        # ---- 3. soi ranh mảng đất ----
        soi = {}
        for K in [1, 1.5, 2, 2.165625, 3]:
            ho = ranh_ho = n = 0
            for cy in (0, 28):
                for j in range(13):
                    cx = khu['a'] + 17.37 + (khu['b'] - 960 - khu['a'] - 40) * j / 12
                    r = await pg.evaluate('([cx, cy, K]) => { const r = TVPB.soiRanh(cx, cy, K, false); delete r.url; return r; }', [cx, cy, K])
                    ho += r['ho']; ranh_ho += r['ranh']; n += 1
            soi[str(K)] = {'vi_tri': n, 'diem_ho_trong_o_dac': ho, 'trong_do_sat_ranh_mang': ranh_ho}
        KQ['soi_ranh_dat'] = soi
        print('nền:', json.dumps(KQ['nen_giua'], ensure_ascii=False)); print('soi ranh:', soi)
        KQ['loi_trang'] = loi
        await b.close()
    json.dump(KQ, open(os.path.join(OUT, 'camera-dead-cells-2810.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('lỗi trang:', loi)


asyncio.run(main())
