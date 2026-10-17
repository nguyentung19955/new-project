"""CHỤP CÙNG MỘT CẢNH TRẬN ở nét 2 | 3 | 4 (headless, KHÔNG chơi thử: dựng cảnh bằng lệnh, ngẫu nhiên gieo hạt cố định).
Cảnh: ải 1-1 (hạt 7), Cu Tí cầm kiếm (bộ ninja) đứng giữa sân, 3 quái của phòng kéo lại gần; khung A = đứng thở, khung B = nhát 1 kiếm nặng
ở khung ★ (vệt chém hất lên đang hiện). Màn 844×390 dpr 3 (iPhone ngang) và 1280×720 dpr 1.
Ra (thư mục <ra>):  <màn>-n<N>-<khung>.png (cả màn), <màn>-n<N>-<khung>-ti.png (vùng Cu Tí phóng ×4 từ ảnh màn), the-n<N>-<khung>.png (canvas
thế giới thật), so-lieu.json (thời gian vẽ, lỗi JS, số đo).
  python3 chup_tran.py <url trang (không có ?)> <ra> [nét, vd 2,3,4] [--cham]   (--cham: thêm đo thời gian vẽ với CPU chậm ×4)"""
import base64, io, json, os, sys, time
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game'))
URL = sys.argv[1]
OUT = os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
NETS = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 and sys.argv[3][0].isdigit() else '2,3,4').split(',')]
CHAM = '--cham' in sys.argv
MAN = (('m844', (844, 390), 3), ('m1280', (1280, 720), 1))

INIT = r'''() => {
  let s = 12345; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  window.__hat = (n) => { s = n >>> 0; };
}'''

DUNG = r'''() => {
  window.__hat(777); G.time = 0; if (G.fx && G.fx.reset) G.fx.reset(); // cùng điểm xuất phát mọi lần chạy
  G.testSave({ lvl: 12, melee: 'sword' }); G.save.sound = false;
  G.startStage(0, 0, 0, { kind: 'A', seed: 7 });
  const S = G.getRun(), W = S.W, P = W.P;
  S.fade = 0; S.mode = 'play';
  P.cur = 0; P.atkT = 0; P.cdT = 0; P.face = 1; P.inv = 999; P.hurtT = 0; P.dodgeT = 0; P.dashT = 0; P.specT = 0; P.castT = 0;
  P.x = (W.x0 + W.x1) / 2 - 30; P.y = (W.y0 + W.y1) / 2 + 6;
  for (let i = 0; i < 150 && !(W.ents || []).some((e) => e !== P && e.hp > 0); i++) G.tick(); // quái hiện ra (W.spawns)
  P.x = (W.x0 + W.x1) / 2 - 30; P.y = (W.y0 + W.y1) / 2 + 6; P.hp = P.maxhp;
  const M = (W.ents || []).filter((e) => e !== P && e.hp > 0 && !e.dead).slice(0, 3);
  W.ents.length = 0; M.forEach((m) => W.ents.push(m)); if (W.spawns) W.spawns.length = 0;
  M.forEach((m, i) => { m.x = P.x + 48 + i * 34; m.y = P.y - 18 + i * 18; m.hp = m.maxhp = 1e9; m.cd = 99; m.cdT = 99; });
  if (W.projs) W.projs.length = 0; if (W.zones) W.zones.length = 0;
  G.keys = {}; G.keyP = {}; G.pointers.clear();
  for (let i = 0; i < 110; i++) { M.forEach((m, j) => { m.x = P.x + 48 + j * 34; m.y = P.y - 18 + j * 18; m.cd = 99; m.cdT = 99; }); G.tick(); }
  return { mobs: M.map((m) => m.kind || m.type || m.id) };
}'''

NHIP = r'''([giu, bam, n]) => {
  const K = { J: 'KeyJ' }, W = G.getRun().W, P = W.P;
  const M = W.ents.filter((e) => e !== P);
  for (let i = 0; i < n; i++) {
    G.keys = {}; for (const k of giu.split(',')) if (K[k]) G.keys[K[k]] = true;
    G.keyP = {}; if (i === 0) for (const k of bam.split(',')) if (K[k]) G.keyP[K[k]] = true;
    M.forEach((m, j) => { m.x = P.x + 48 + j * 34; m.y = P.y - 18 + j * 18; m.cd = 99; m.cdT = 99; });
    G.tick();
  }
  return { u: P.atkDur ? 1 - P.atkT / P.atkDur : null, combo: P.comboI };
}'''

VE = r'''() => {
  G.setNet(G.netMuon());
  const W = G.getRun().W, P = W.P, iv = P.inv;
  P.inv = 0; // không nhấp nháy bất tử trong ảnh chụp
  try { G.ui.begin(); G.scene.draw(); } finally { P.inv = iv; }
  const cam = G.camVe(W);
  return { net: G.NET, x: P.x - cam, y: P.y, w: document.getElementById('world').width };
}'''

DO_GIO = r'''([n, ep]) => {
  const W = G.getRun().W, P = W.P, wv = document.getElementById('world'), t = [];
  const M = W.ents.filter((e) => e !== P);
  for (let i = 0; i < n; i++) {
    G.keys = {}; G.keyP = {}; if (i % 40 === 0) G.keyP.KeyJ = true;
    M.forEach((m, j) => { m.x = P.x + 48 + j * 34; m.y = P.y - 18 + j * 18; m.cd = 99; m.cdT = 99; });
    G.tick();
    const now = window.__now || performance.now.bind(performance), a = now();
    G.ui.begin(); G.scene.draw();
    if (ep) G.wx.getImageData(0, 0, 1, 1); // ép trình duyệt vẽ xong thật (không để dồn lệnh)
    t.push(now() - a);
  }
  t.sort((a, b) => a - b);
  return { tb: t.reduce((a, b) => a + b, 0) / t.length, p50: t[Math.floor(t.length / 2)], p90: t[Math.floor(t.length * 0.9)], max: t[t.length - 1] };
}'''


def png(d):
    return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')


def main():
    kq = {'url': URL, 'loi': [], 'chup': {}, 'gio': {}}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for ten, vp, dpr in MAN:
            for N in NETS:
                ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dpr)
                pg = ctx.new_page()
                loi = []
                pg.on('pageerror', lambda e, loi=loi: loi.append(str(e)))
                pg.on('console', lambda m, loi=loi: loi.append('console: ' + m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
                pg.add_init_script('(' + INIT + ')()')
                u = URL + '?cloud=0' + ('&netcao=%d' % N if N != 2 else '')
                pg.goto(u)
                pg.wait_for_timeout(1500)
                pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
                pg.wait_for_function("() => window.G && G.spriteCustom && G.art && G.monsterArt && G.testSave", timeout=60000)
                # ảnh rời: nạp hết ảnh cần cho cảnh (quái vùng 1, Cu Tí, vũ khí, hiệu ứng)
                pg.evaluate("() => { const SC = G.spriteCustom; for (const k in SC.ds) SC.canAnh && SC.canAnh(k); for (const k of ['zed-moi','zed-vk']) SC.canAnh && SC.canAnh(k); if (G.fxAnh) for (const k in G.fxAnh.ds) G.fxAnh.co(k); }")
                pg.wait_for_timeout(2500)
                # bản web: vào ải lần đầu có thể chờ ảnh vùng tải về (vòng lặp game còn chạy) → vào thử một lần cho ảnh về hết
                pg.evaluate("() => { G.testSave({ lvl: 12, melee: 'sword' }); G.save.sound = false; G.startStage(0, 0, 0, { kind: 'A', seed: 7 }); }")
                pg.wait_for_function("() => G.getRun && G.getRun() && G.getRun().W", timeout=60000)
                pg.wait_for_timeout(2000)
                pg.evaluate("() => { window.requestAnimationFrame = () => 0; }")  # dừng vòng lặp game (khung đang chờ chạy nốt một lần)
                pg.wait_for_timeout(300)
                # đồng hồ đứng yên (hình động theo giờ thật → ảnh chụp lặp lại đúng từng điểm); DO_GIO đo bằng đồng hồ thật đã cất
                pg.evaluate("() => { const p0 = performance.now.bind(performance); window.__now = p0; performance.now = () => 100000; Date.now = () => 1760000000000; }")
                pg.wait_for_timeout(300)
                info = pg.evaluate(DUNG)
                for _ in range(3):  # lần vẽ đầu: bắt đầu tải bản to / bản nét cao (tải lười như trong game) rồi chờ về
                    pg.evaluate(VE); pg.wait_for_timeout(1200)
                    pg.evaluate(NHIP, ['J', 'J', 1]); pg.evaluate(NHIP, ['', '', 40]); pg.evaluate(VE); pg.wait_for_timeout(600)
                pg.evaluate(DUNG)
                for khung in ('dung', 'kiem'):
                    if khung == 'kiem':
                        pg.evaluate(NHIP, ['J', 'J', 1]); st = pg.evaluate(NHIP, ['', '', 9])
                    else:
                        st = pg.evaluate(NHIP, ['', '', 12])
                    v = pg.evaluate(VE)
                    shot = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
                    shot.save(os.path.join(OUT, '%s-n%d-%s.png' % (ten, N, khung)))
                    the = png(pg.evaluate("() => document.getElementById('world').toDataURL('image/png')"))
                    if ten == 'm1280':
                        the.save(os.path.join(OUT, 'the-n%d-%s.png' % (N, khung)))
                    el = pg.query_selector('#world').bounding_box()
                    sc = el['width'] / 480.0 * dpr
                    cx, cy = (el['x'] * dpr + v['x'] * sc), (el['y'] * dpr + v['y'] * sc)
                    box = (int(cx - 40 * sc), int(cy - 62 * sc), int(cx + 70 * sc), int(cy + 8 * sc))
                    vung = shot.crop(box)
                    f = 4 if dpr == 1 else 2  # phóng nguyên lần ảnh màn
                    vung.resize((vung.width * f, vung.height * f), Image.NEAREST).save(os.path.join(OUT, '%s-n%d-%s-ti.png' % (ten, N, khung)))
                    if ten == 'm1280':  # vùng Cu Tí trên canvas thế giới, phóng về cùng 12 điểm / điểm game (nét 2 ×6, nét 3 ×4, nét 4 ×3)
                        n_ = v['net']; cam_x = v['x']
                        cv = the.crop((int((cam_x - 40) * n_), int((v['y'] - 62) * n_), int((cam_x + 70) * n_), int((v['y'] + 8) * n_)))
                        cv.resize((cv.width * 12 // n_, cv.height * 12 // n_), Image.NEAREST).save(os.path.join(OUT, 'the-n%d-%s-ti.png' % (N, khung)))
                    kq['chup']['%s-n%d-%s' % (ten, N, khung)] = {'net': v['net'], 'canvas_rong': v['w'], 'trang_thai': st, 'vung_ti': box, 'quai': info['mobs']}
                if ten == 'm844':
                    kq['gio']['n%d' % N] = {'thuong': pg.evaluate(DO_GIO, [120, True])}
                    if CHAM:
                        cdp = ctx.new_cdp_session(pg)
                        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
                        kq['gio']['n%d' % N]['cham4'] = pg.evaluate(DO_GIO, [60, True])
                        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
                    print('n%d giờ vẽ:' % N, json.dumps(kq['gio']['n%d' % N]), flush=True)
                kq['loi'] += ['%s n%d: %s' % (ten, N, e) for e in loi]
                print(ten, 'n%d' % N, 'lỗi', loi[:3], flush=True)
                ctx.close()
        b.close()
    json.dump(kq, open(os.path.join(OUT, 'so-lieu.json'), 'w'), ensure_ascii=False, indent=1)


main()
