"""Kiểm Đợt 7 (trạng thái dính độc / cháy / đóng băng trên thân quái). Một lượt Playwright, không chạy bộ test dài.
Chạy: python3 docs/review/ke-hoach-cai-thien/dot-7/kiem.py [THƯ_MỤC_GAME_TRƯỚC]
THƯ_MỤC_GAME_TRƯỚC: thư mục game/ của bản trước khi sửa (vd. một git worktree) để so FPS và so ảnh khi tắt cờ.
Ra: anh/*.png và ket-qua.json cạnh tệp này."""
import base64, io, json, os, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont, ImageChops
from playwright.sync_api import sync_playwright

DAY = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(DAY, '..', '..', '..', '..', 'game'))
ANH = os.path.join(DAY, 'anh')
sys.path.insert(0, os.path.join(GAME, 'tests'))
from quai_lib import LIB

try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
except Exception: FONT = ImageFont.load_default()

THEM = r"""
(() => {
  // đặt trạng thái thẳng vào e.st (chỉ để chụp hình; không qua luật chơi)
  T.dat = (e, k) => { const s = e.st; s.fire = 0; s.fireDmg = 0; s.poisonN = 0; s.poisonT = 0; s.poisonDmg = 0; s.iceN = 0; s.iceT = 0; s.frozen = 0; s.root = 0;
    for (const x of k.split('+')) { if (x === 'doc') { s.poisonN = 3; s.poisonT = 9; } else if (x === 'chay') s.fire = 9; else if (x === 'lanh') { s.iceN = 2; s.iceT = 9; } else if (x === 'bang') s.frozen = 9; else if (x === 'troi') s.root = 9; } };
  T.quai = (vai, art, x, y, o) => { const e = G.spawnEnemy(vai, x, y, Object.assign({ art }, o || {})); e.an = { n: 'idle', t: 0, spd: 1 }; e.cd = 99; e.flash = 0; return e; };
  // vẽ một con quái bằng đúng đường vẽ của game (A.enemy) lên một tấm riêng, phóng k lần
  T.ve = (e, k, w, h, nen, khung) => { const cv = document.createElement('canvas'); cv.width = w * k; cv.height = h * k; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    if (nen) { c.fillStyle = nen; c.fillRect(0, 0, cv.width, cv.height); }
    const x0 = e.x, y0 = e.y, t0 = G.time; e.x = Math.round(w / 2); e.y = h - 8; if (khung != null) G.time = khung / 60;
    c.save(); c.scale(k, k); G.art.enemy(c, e); c.restore(); e.x = x0; e.y = y0; G.time = t0; return cv; };
  T.url = (cv) => cv.toDataURL('image/png');
})();
"""


def mo(pw, root, w=844, h=390, q=''):
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    cong = CONG[0]; CONG[0] += 1  # trang cần máy chủ nhỏ trong game/dist thì mới nạp được ảnh AI (CHUNG.md luật 7)
    may = subprocess.Popen([sys.executable, '-m', 'http.server', str(cong), '--bind', '127.0.0.1'], cwd=os.path.join(root, 'dist'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    MAY.append(may); time.sleep(1.0)
    # Hạt hiệu ứng của game dùng Math.random: gắn hạt giống cố định để hai lần chạy ra ảnh giống hệt (mới so "0 điểm ảnh khác" được)
    pg.add_init_script("(() => { let a = 20261011; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window._gieo = (v) => { a = v; }; })();")
    pg.goto('http://127.0.0.1:%d/linh-khi.html?cloud=0' % cong + q)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(600)
    pg.evaluate("window._raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(root, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(root, 'tests', 'setup.js'))
    pg.evaluate(LIB)
    pg.evaluate(THEM)
    pg.wait_for_function("G.spriteCustom && ['heoCon','nhimDoc','heoNanh','namChua','boHung','ongVo'].every((m) => G.spriteCustom.get(m))")
    return b, pg, errs


def anh(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA')


CONG = [8791]; MAY = []
NEN = '#3b6d2a'  # màu sàn rừng chính (đặc tả mục 5)
QUAI = [('spiky', 'nhimDoc', 'Nhím Gai Độc (thân cao ≈ 30)', {}), ('elite', 'heoNanh', 'Heo Rừng Nanh Dài, tinh anh (thân cao ≈ 50)', {}), ('mini', 'namChua', 'Nấm Chúa (thân cao ≈ 60)', {})]
COT = [('', 'thường'), ('doc', 'dính độc'), ('chay', 'cháy'), ('bang', 'đóng băng')]


def bang_anh(pg, cot, ten, quai=QUAI, khung=20, ghi=''):
    K = 3
    hang = []
    for vai, art, nhan, o in quai:
        o2 = pg.evaluate("""([vai, art, cot, K, nen, khung]) => { T.room(0); const e = T.quai(vai, art, 240, 150); e.face = 1; e.dirA = 0;
          const I = G.spriteCustom.get(art), w = I.fw + 26, h = I.fh + 30, out = [];
          for (const k of cot) { T.dat(e, k); G.ttTatHat = false; for (let i = 0; i < 8; i++) { G.time += 1 / 60; T.ve(e, 1, w, h, null, null); } out.push(T.url(T.ve(e, K, w, h, nen, khung))); }
          return out; }""", [vai, art, [c[0] for c in cot], K, NEN, khung])
        ims = [anh(u) for u in o2]
        w, h = ims[0].size
        im = Image.new('RGB', (w * len(ims), h + 44), (18, 14, 22)); d = ImageDraw.Draw(im); d.text((6, 3), nhan, fill=(255, 255, 255), font=FONT)
        for i, a in enumerate(ims):
            im.paste(a.convert('RGB'), (i * w, 44)); d.text((i * w + 6, 24), cot[i][1], fill=(255, 220, 140), font=FONT)
        hang.append(im)
    W = max(r.width for r in hang); H = sum(r.height for r in hang) + (22 if ghi else 0)
    out = Image.new('RGB', (W, H), (18, 14, 22)); y = 0
    for r in hang: out.paste(r, (0, y)); y += r.height
    if ghi: ImageDraw.Draw(out).text((6, y + 3), ghi, fill=(200, 200, 210), font=FONT)
    out.save(os.path.join(ANH, ten), optimize=True); print('ảnh', ten, out.size)


MOT = r"""([vai, art, k]) => { window._gieo(99); G.time = 0; T.room(0, 2, { seed: 7 }); const W = G.getWorld(), P = G.getRun().P;
  const sp = G.spriteCustom.get(art), x = 215, y = 175, e = T.quai(vai, art, x, y); e.speed = 0;
  const giu = () => { T.dat(e, k); e.x = x; e.y = y; e.face = 1; e.dirA = 0; e.cd = 99; e.wind = 0; e.act = null; e.state = 'move'; e.an = e.an && e.an.n === 'idle' ? e.an : { n: 'idle', t: 0, spd: 1 }; e.hp = e.maxhp * 0.8; e.flash = 0; e.hitT = 0; P.hp = P.maxhp; P.dead = false; P.x = 40; P.y = 250; W.over = null; W.banner = null; };
  for (let i = 0; i < 45; i++) { giu(); T.frame(1); giu(); }
  giu(); G.ui.begin(); G.scene.draw();
  const w = Math.max(70, sp.fw + 16), h = sp.fh + 38;
  return { x0: x - w / 2, y0: y - sp.fh - 26, w, h }; }"""


def bang_that(pg, cot, ten, quai=QUAI, ghi=''):
    """Cùng một con quái, mỗi cột một trạng thái, chụp trong phòng Rừng thật (mỗi cột một lần chụp, cùng chỗ đứng) rồi phóng 3 lần: đúng thứ người chơi thấy."""
    hang = []
    for vai, art, nhan, o in quai:
        o2 = []
        for c in cot:
            r = pg.evaluate(MOT, [vai, art, c[0]])
            im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
            hop = pg.evaluate("() => { const b = document.getElementById('world').getBoundingClientRect(); return [b.x, b.y, b.width / 480]; }")
            k = hop[2]; cat = im.crop((round(hop[0] + r['x0'] * k), round(hop[1] + r['y0'] * k), round(hop[0] + (r['x0'] + r['w']) * k), round(hop[1] + (r['y0'] + r['h']) * k)))
            o2.append(cat.resize((int(r['w'] * 3), int(r['h'] * 3)), Image.NEAREST))
        w, h = o2[0].size
        t = Image.new('RGB', (w * len(cot), h + 44), (18, 14, 22)); d = ImageDraw.Draw(t); d.text((6, 3), nhan, fill=(255, 255, 255), font=FONT)
        for i, a in enumerate(o2): t.paste(a, (i * w, 44)); d.text((i * w + 6, 24), cot[i][1], fill=(255, 220, 140), font=FONT)
        hang.append(t)
    W = max(r.width for r in hang); H = sum(r.height for r in hang) + (22 if ghi else 0)
    out = Image.new('RGB', (W, H), (18, 14, 22)); y = 0
    for r in hang: out.paste(r, (0, y)); y += r.height
    if ghi: ImageDraw.Draw(out).text((6, y + 3), ghi, fill=(200, 200, 210), font=FONT)
    out.save(os.path.join(ANH, ten), optimize=True); print('ảnh', ten, out.size)


def so_vien_mat(pg):
    """Nhuộm riêng (không hạt): điểm ảnh viền #14182e và cụm sáng nhỏ (mắt, răng) phải giống hệt bản thường. Hạt: nằm trong hộp thân + 2 px, không nằm trước mặt."""
    return pg.evaluate("""() => { const kq = {}; T.room(0);
      for (const [vai, art] of [['spiky', 'nhimDoc'], ['elite', 'heoNanh'], ['mini', 'namChua'], ['rusher', 'heoCon'], ['shield', 'boHung'], ['swarm', 'ongVo']]) {
        const e = T.quai(vai, art, 240, 150); e.face = 1; e.dirA = 0; e.trait = null;
        const sp = G.spriteCustom.get(art), D = G.spriteCustom.dangQuai(sp), w = sp.fw + 40, h = sp.fh + 40, r = { H: D.h, hat: Math.max(2, Math.round(D.h / 12)), vien: 0, mat: 0, khacVien: 0, khacMat: 0, nhuom: 0, hatNgoai: 0, hatMat: 0, hatMax: 0 };
        const lay = (k, tatHat, f) => { T.dat(e, k); G.ttTatHat = tatHat; const cv = T.ve(e, 1, w, h, null, f); G.ttTatHat = false; return cv.getContext('2d').getImageData(0, 0, w, h).data; };
        for (const k of ['doc', 'chay', 'bang']) {
          for (let i = 0; i < 12; i++) { G.time += 1 / 60; T.dat(e, k); T.ve(e, 1, w, h, null, null); } // qua 6 khung "vừa dính"
          for (let f = 100; f < 220; f += 3) {
            const a = lay('', true, f), b = lay(k, true, f), c = lay(k, false, f);
            const cx = Math.round(w / 2), cy = h - 8; let soHat = 0;
            for (let q = 0; q < a.length; q += 4) {
              const x = (q / 4) % w, y = Math.floor(q / 4 / w), same = a[q] === b[q] && a[q + 1] === b[q + 1] && a[q + 2] === b[q + 2] && a[q + 3] === b[q + 3];
              if (a[q + 3] === 255) {
                const vien = a[q] === 0x14 && a[q + 1] === 0x18 && a[q + 2] === 0x2e, sang = a[q] >= 0xe0 && a[q + 1] >= 0xe0 && a[q + 2] >= 0xe0;
                if (vien) { r.vien++; if (!same) r.khacVien++; }
                else if (sang && D.h * D.w > 0) { r.mat++; if (!same) r.khacMat++; }
                else if (!same) r.nhuom++;
              }
              if (b[q] !== c[q] || b[q + 1] !== c[q + 1] || b[q + 2] !== c[q + 2] || b[q + 3] !== c[q + 3]) { // điểm ảnh của hạt
                soHat++; const rx = x - cx, ry = y - cy;
                if (rx < D.x0 - 2 || rx >= D.x1 + 2 || ry < D.y0 - 2 || ry >= D.y1 + 2) r.hatNgoai++;
                if (rx > D.x0 + D.w * 0.67 && ry < D.y0 + D.h * 0.5) r.hatMat++;
              }
            }
            r.hatMax = Math.max(r.hatMax, soHat);
          }
        }
        // mắt, răng, nanh: các cụm sáng nhỏ mà game chọn giữ (mọi kênh màu ≥ 200, cụm ≤ 1,5% diện tích thân) phải y nguyên sau khi nhuộm
        const SC = G.spriteCustom, n = sp.net || 1, fw = sp.fw * n, fh = sp.fh * n, hang = sp.dt.idle.hang; r.matGiu = 0; r.matGiuKhac = 0; r.vienKhung = 0; r.vienKhungKhac = 0;
        for (const than of [{ mau: '#5aca02', muc: 0.35, suong: 0 }, { mau: '#fe7d04', muc: 0.4, suong: 0 }, { mau: '#9cfefa', muc: 0.45, suong: 0.2 }]) for (let i = 0; i < sp.dt.idle.so; i++) {
          const cv = SC.khungThan(sp, hang, i, than), goc = document.createElement('canvas'); goc.width = fw; goc.height = fh; const g = goc.getContext('2d'); g.drawImage(sp.img, i * fw, hang * fh, fw, fh, 0, 0, fw, fh);
          const A = g.getImageData(0, 0, fw, fh).data, B = cv.getContext('2d').getImageData(0, 0, fw, fh).data, giu = sp.giu[hang + '|' + i];
          for (let q = 0, j = 0; q < giu.length; q++, j += 4) { if (!giu[q]) continue; const same = A[j] === B[j] && A[j + 1] === B[j + 1] && A[j + 2] === B[j + 2] && A[j + 3] === B[j + 3], vien = Math.abs(A[j] - 0x14) <= 6 && Math.abs(A[j + 1] - 0x18) <= 6 && Math.abs(A[j + 2] - 0x2e) <= 6;
            if (vien) { r.vienKhung++; if (!same) r.vienKhungKhac++; } else { r.matGiu++; if (!same) r.matGiuKhac++; } }
        }
        r.matGiu = Math.round(r.matGiu / 3 / sp.dt.idle.so); // số điểm ảnh mắt/răng giữ nguyên, trung bình mỗi khung
        e.dead = true; kq[art] = r;
      }
      return kq; }""")


def dem_hat(pg):
    """Số hạt và màu nhuộm theo tổ hợp trạng thái (đọc thẳng từ bộ tính của game)."""
    return pg.evaluate("""() => { T.room(0); const kq = {};
      for (const [vai, art] of [['spiky', 'nhimDoc'], ['elite', 'heoNanh'], ['mini', 'namChua']]) for (const k of ['doc', 'chay', 'lanh', 'bang', 'bang+chay', 'bang+doc', 'chay+doc', 'bang+chay+doc']) {
        const e = T.quai(vai, art, 240, 150); T.dat(e, k.split('+')[0]); G.time += 1; G.ttQuai(e); G.time += 1; T.dat(e, k); G.ttQuai(e); const R0 = G.ttQuai(e), moi = R0.nhuom && R0.nhuom.mau; G.time += 1; const R = G.ttQuai(e);
        kq[art + ' ' + k] = { bang: R.n[0], chay: R.n[1], doc: R.n[2], tong: R.n[0] + R.n[1] + R.n[2], nhuom: R.nhuom && R.nhuom.mau, nhuom6KhungDau: moi }; e.dead = true; }
      return kq; }""")


CANH = r"""(tt) => { window._gieo(777); G.time = 0; T.room(0, 2, { seed: 7 }); const W = G.getWorld(), P = G.getRun().P; P.x = 240; P.y = 205; P.face = 1;
  const ds = [['rusher', 'heoCon', 120, 150, 1], ['spiky', 'nhimDoc', 185, 120, 1], ['shield', 'boHung', 300, 125, -1], ['elite', 'heoNanh', 372, 172, -1], ['archer', 'hoaBaoTu', 95, 205, 1], ['swarm', 'ongVo', 262, 150, -1], ['mini', 'namChua', 420, 105, -1], ['kami', 'namPhong', 330, 215, -1]];
  window._q = ds.map((d, i) => { const e = T.quai(d[0], d[1], d[2], d[3]); e.face = d[4]; e.dirA = d[4] > 0 ? 0 : Math.PI; e._tt = tt[i] || ''; e._x = d[2]; e._y = d[3]; e._f = d[4]; e.speed = 0; return e; });
  window._giu = () => { for (const e of window._q) { T.dat(e, e._tt); e.x = e._x; e.y = e._y; e.face = e._f; e.dirA = e._f > 0 ? 0 : Math.PI; e.cd = 99; e.wind = 0; e.act = null; e.state = 'move'; e.an = e.an && e.an.n === 'idle' ? e.an : { n: 'idle', t: 0, spd: 1 }; e.hp = e.maxhp; e.flash = 0; e.hitT = 0; e.busy = 0; } P.hp = P.maxhp; P.dead = false; P.x = 240; P.y = 205; W.over = null; };
  for (let i = 0; i < 40; i++) { window._giu(); T.frame(1); window._giu(); }
  return window._q.map((e) => e.art + ':' + e._tt); }"""


def phong(pg, tt, ten, luu=True):
    r = pg.evaluate(CANH, tt)
    pg.evaluate("() => { window._giu(); G.ui.begin(); G.scene.draw(); }")
    im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
    if luu: im.save(os.path.join(ANH, ten), optimize=True); print('ảnh', ten, im.size, r)
    return im


FPS = r"""async (giay) => { T.room(0, 2, { seed: 7 }); const W = G.getWorld(), P = G.getRun().P; P.x = 240; P.y = 205;
  const ds = [['rusher', 'heoCon', 120, 150], ['spiky', 'nhimDoc', 185, 120], ['shield', 'boHung', 300, 125], ['elite', 'heoNanh', 372, 172], ['archer', 'hoaBaoTu', 95, 205], ['swarm', 'ongVo', 262, 150]];
  const q = ds.map((d) => { const e = T.quai(d[0], d[1], d[2], d[3]); e._x = d[2]; e._y = d[3]; e.speed = 0; return e; });
  const giu = () => { for (const e of q) { T.dat(e, 'doc'); e.x = e._x; e.y = e._y; e.cd = 99; e.wind = 0; e.act = null; e.hp = e.maxhp; } P.hp = P.maxhp; P.dead = false; P.x = 240; P.y = 205; W.over = null; };
  for (let i = 0; i < 120; i++) { giu(); T.frame(1); }
  // (a) thời gian máy tính cho một khung (luật chơi + vẽ), 600 khung = 10 giây game
  const luot = []; let ms = [];
  for (let L = 0; L < 5; L++) { ms = []; const t9 = performance.now(); for (let i = 0; i < 600; i++) { giu(); const t0 = performance.now(); T.frame(1); ms.push(performance.now() - t0); } luot.push(+((performance.now() - t9) / 600).toFixed(3)); }
  ms.sort((a, b) => a - b); const tb = Math.min.apply(null, luot);
  // (b) số khung thật trên giây: chạy theo nhịp màn hình trong `giay` giây
  let n = 0; const t1 = performance.now();
  await new Promise((xong) => { const buoc = () => { giu(); T.frame(1); n++; if (performance.now() - t1 >= giay * 1000) xong(); else window._raf(buoc); }; window._raf(buoc); });
  return { msMoiKhung5Luot: luot, msTotNhat: +tb.toFixed(3), msGiua: +ms[300].toFixed(3), ms95: +ms[570].toFixed(3), fps: +(n / ((performance.now() - t1) / 1000)).toFixed(1), soQuaiDinhDoc: q.filter((e) => e.st.poisonN > 0).length }; }"""


def do_sang(pg):
    """Độ sáng (0–1) của thân quái dính độc so với sàn rừng thật trong phòng."""
    return pg.evaluate("""() => { T.room(0, 2, { seed: 7 }); T.frame(3); const wc = document.getElementById('world'), d = wc.getContext('2d').getImageData(60, 100, 360, 120).data; let s = 0, n = 0;
      for (let q = 0; q < d.length; q += 4) { s += (0.2126 * d[q] + 0.7152 * d[q + 1] + 0.0722 * d[q + 2]) / 255; n++; }
      const kq = { san: +(s / n).toFixed(3) };
      for (const [vai, art] of [['rusher', 'heoCon'], ['spiky', 'nhimDoc'], ['elite', 'heoNanh'], ['shield', 'boHung'], ['mini', 'namChua']]) { const e = T.quai(vai, art, 240, 150), sp = G.spriteCustom.get(art), w = sp.fw + 20, h = sp.fh + 20;
        for (const k of ['', 'doc']) { T.dat(e, k); G.ttTatHat = true; for (let i = 0; i < 10; i++) { G.time += 1 / 60; T.ve(e, 1, w, h, null, null); } const im = T.ve(e, 1, w, h, null, 30).getContext('2d').getImageData(0, 0, w, h).data; G.ttTatHat = false; let a = 0, m = 0;
          for (let q = 0; q < im.length; q += 4) if (im[q + 3] === 255) { a += (0.2126 * im[q] + 0.7152 * im[q + 1] + 0.0722 * im[q + 2]) / 255; m++; }
          kq[art + (k ? ' dính độc' : ' thường')] = +(a / m).toFixed(3); }
        e.dead = true; }
      return kq; }""")


def chay_that(pg):
    """Chạy thử thật: bot đánh 900 khung trong một ải Rừng (quái dính độc/cháy/băng theo luật chơi, có con chết khi đang dính), đếm lỗi trang."""
    return pg.evaluate("""() => { window._gieo(5); G.pointers.clear(); G.testSave({ lvl: 12, branch: 'poison', marks: 130 }); G.rnd = G.srand(11); G.startStage(0, 2, 0);
      const S = G.getRun(); let dinh = 0, chet = 0, toiDa = 0; const thay = new Set();
      T.useBot(true);
      for (let i = 0; i < 900; i++) { T.frame(1); const W = G.getWorld(), P = S.P; P.hp = Math.max(P.hp, P.maxhp * 0.6); P.dead = false; if (W) { W.over = null;
        for (const e of W.ents) { if (i % 90 === 0 && !e.dead && e.dying == null) G.applyStatus(e, ['fire', 'poison', 'ice'][(i / 90 + (e.x | 0)) % 3 | 0], 5, 2); const R = e.art && G.spriteCustom.get(e.art) ? G.ttQuai(e) : null; if (!R) continue; const n = R.n[0] + R.n[1] + R.n[2]; if (n) { dinh++; thay.add(e); } toiDa = Math.max(toiDa, n); if (e.dying != null && n) chet++; } } }
      T.useBot(false);
      return { khungCoQuaiDinh: dinh, soQuaiTungDinh: thay.size, khungQuaiChetKhiDangDinh: chet, soHatNhieuNhat: toiDa, loiThu: T.errs.slice(0, 5) }; }""")


def luc_chet(pg):
    """Quái chết khi đang cháy + dính độc: nhuộm tắt ngay, hạt co dần về 0 trong 6 khung."""
    return pg.evaluate("""() => { T.room(0); const e = T.quai('rusher', 'heoCon', 240, 150); for (let i = 0; i < 20; i++) { T.dat(e, 'chay+doc'); e.hp = e.maxhp; T.frame(1); }
      const tr = G.ttQuai(e), a = { nhuomLucSong: tr.nhuom && tr.nhuom.mau, soHatLucSong: tr.n.slice() };
      const A0 = G.art.enemy, ks = []; G.art.enemy = function (c, q) { A0(c, q); if (q.dying != null && q.ttR) ks.push([+q.ttR.k.toFixed(2), q.ttR.nhuom ? 'còn nhuộm' : 'hết nhuộm']); };
      G.damage(e, 1e9, {}); for (let i = 0; i < 8; i++) T.frame(1); G.art.enemy = A0;
      a.coHatTheoKhungSauKhiChet = ks; return a; }""")


def khac(a, b):
    d = ImageChops.difference(a.convert('RGB'), b.convert('RGB')).convert('L').point(lambda v: 255 if v else 0)
    return sum(1 for v in d.get_flattened_data() if v) if hasattr(d, 'get_flattened_data') else sum(1 for v in d.getdata() if v)


if __name__ == '__main__':
    truoc = sys.argv[1] if len(sys.argv) > 1 else None
    KQ = {}
    TT4 = ['doc', 'chay', 'lanh', 'bang', 'chay+doc', 'bang+doc', 'bang+chay', '']
    HAI = [('chay+doc', 'cháy + độc'), ('bang+doc', 'băng + độc'), ('bang+chay', 'băng + cháy'), ('lanh', 'mới lạnh')]
    with sync_playwright() as pw:
        # --- bản SAU, cờ bật ---
        b, pg, errs = mo(pw, GAME)
        sau = phong(pg, TT4, 'phong-sau.png')
        bang_that(pg, COT, 'ba-trang-thai.png', ghi='Chụp trong phòng Rừng thật, phóng 3 lần. Ô vuông có hình hệ trên đầu là dấu Linh Khí (js/linhkhi.js), không thuộc đợt này: xem báo cáo.')
        bang_that(pg, HAI, 'hai-trang-thai.png', ghi='Hai trạng thái cùng lúc: chỉ nhuộm MỘT màu (băng > cháy > độc), trạng thái kia hiện bằng hạt; tổng hạt mới ≤ 6. Cột cuối: mới lạnh, chưa đông cứng.')
        bang_anh(pg, COT, 'ba-trang-thai-rieng-phan-moi.png', ghi='Chỉ phần mới của Đợt 7 (nhuộm thân + hạt bám thân), nền phẳng màu sàn rừng, phóng 3 lần.')
        KQ['vien_mat_hat'] = so_vien_mat(pg)
        KQ['so_hat'] = dem_hat(pg)
        KQ['do_sang'] = do_sang(pg)
        KQ['fps_sau'] = pg.evaluate(FPS, 10)
        KQ['luc_chet'] = luc_chet(pg)
        KQ['chay_that'] = chay_that(pg)
        KQ['loi_trang'] = errs
        b.close()
        # --- bản SAU, cờ tắt bằng ?than=0 (trang mới hẳn) ---
        b, pg, errs = mo(pw, GAME, q='&than=0')
        KQ['co_tat_gia_tri'] = pg.evaluate("G.TRANG_THAI_TREN_THAN")
        tat = phong(pg, TT4, 'phong-co-tat.png')
        bang_that(pg, COT, 'ba-trang-thai-co-tat.png', ghi='Cờ G.TRANG_THAI_TREN_THAN = false: y như trước.')
        KQ['fps_co_tat'] = pg.evaluate(FPS, 10)
        b.close()
        if truoc:
            b, pg, errs = mo(pw, truoc)
            cu = phong(pg, TT4, 'phong-truoc.png')
            bang_that(pg, COT, 'ba-trang-thai-truoc.png', ghi='TRƯỚC khi sửa.')
            KQ['fps_truoc'] = pg.evaluate(FPS, 10)
            KQ['loi_trang_truoc'] = errs
            b.close()
            b, pg, errs = mo(pw, truoc)
            cu2 = phong(pg, TT4, '', luu=False)
            b.close()
            KQ['so_anh_phong_844x390'] = {'truoc_voi_truoc_lan_hai (độ nhiễu của phép so)': khac(cu, cu2), 'co_tat_voi_truoc': khac(cu, tat), 'co_bat_voi_truoc': khac(cu, sau)}
    for m in MAY: m.terminate()
    json.dump(KQ, open(os.path.join(DAY, 'ket-qua.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({k: v for k, v in KQ.items() if k != 'so_hat'}, ensure_ascii=False, indent=1))
