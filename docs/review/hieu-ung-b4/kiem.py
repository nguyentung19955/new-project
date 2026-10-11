"""Làn B4 (7 vũng trên sàn): MỘT lượt kiểm nhanh bằng Playwright, không chạy bộ test dài.
Chạy từ thư mục gốc repo:
  python3 docs/review/hieu-ung-b4/kiem.py <thư mục bản code CŨ để so>     (ví dụ một git worktree của commit trước làn này)
Làm gì:
  1) Trang tools/tach-hieu-ung (cỡ màn iPhone): máy tự vẽ 7 dải mẫu lẻ và 2 tấm lô gộp (nền đúng màu prompt, có kẻ lưới) → phải ĐẠT,
     tệp có "net": 2, vũng rộng đúng (khung − 4); prompt của mọi mục và mọi lô CŨ không đổi một chữ so với bản cũ.
  2) Game (bản gói game/dist/linh-khi.html, ?cloud=0, bản lưu thử): một phòng có 8 vũng. Chụp bản CŨ và bản MỚI không có tệp (phải khác 0 điểm ảnh);
     nạp tạm 7 tệp mẫu (chỉ trong bộ nhớ trang thử), chụp 844×390, đo bề ngang vũng vẽ ra so với bán kính luật.
  3) Bot chơi ải 1: nhật ký sát thương bản mới phải trùng bản cũ.
Ra: anh-kiem.png, anh-kiem-trang-tach.png, ket-qua.json cạnh tệp này. KHÔNG ghi gì vào game/art/custom."""
import base64, functools, hashlib, http.server, io, json, math, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OLD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
TMP = tempfile.mkdtemp(prefix='b4-')
sys.path.insert(0, os.path.join(REPO, 'game', 'tests'))
from quai_lib import LIB

NEN = {'duong': (0, 0, 255), 'hong': (255, 0, 255), 'xanh': (0, 255, 0)}
MOI = ['hu-vung-lua', 'hu-vung-doc', 'hu-may-doc', 'hu-vung-quai-lua', 'hu-vung-quai-doc', 'hu-vung-quai-bang', 'hu-vung-quai-do']
LO_MOI = ['b4-duong', 'b4-hong']
# Màu thân của hình mẫu: cố ý CHÓI và khác hẳn màu trong phòng để máy đo được bề ngang vũng trên ảnh chụp (không phải màu của prompt).
THAN = {'hu-vung-lua': (255, 255, 0), 'hu-vung-doc': (255, 160, 0), 'hu-may-doc': (0, 255, 255), 'hu-vung-quai-lua': (0, 255, 128),
        'hu-vung-quai-doc': (0, 128, 255), 'hu-vung-quai-bang': (255, 255, 0), 'hu-vung-quai-do': (0, 255, 0)}
MUC = (20, 24, 46)


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


def ve_o(d, ma, x0, y0, cw, ch, i, so, nen):
    """Một khung mẫu trong ô (x0, y0, cw, ch): vũng elip rộng 70% ô, cao 85% bề ngang (mây: 50%), giữa ô; bên trong có chấm chạy vòng."""
    cx, cy = x0 + cw / 2, y0 + ch / 2
    rx = min(cw, ch / 0.9) * 0.35; ry = rx * (0.5 if ma == 'hu-may-doc' else 0.85)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=THAN[ma])
    u = i / so
    if ma == 'hu-may-doc':  # mây: ba lỗ thủng tròn (màu nền) đổi chỗ chậm, không có vạch ngang mảnh (trang tách sẽ tưởng là đường kẻ lưới)
        for j, (ox, oy) in enumerate(((-0.5, -0.3), (0.05, 0.38), (0.5, -0.25))):
            px, py = cx + (ox + math.sin(u * math.tau + j) * 0.06) * rx, cy + oy * ry
            r = rx * 0.12
            d.ellipse([px - r, py - r, px + r, py + r], fill=nen)
    else:  # vũng: ba "bong bóng" mực chạy vòng trong vũng, một vạch sáng ở nửa trên
        for j in range(3):
            a = u * math.tau + j * 2.094
            px, py = cx + math.cos(a) * rx * 0.5, cy + math.sin(a) * ry * 0.5
            r = rx * (0.10 + 0.04 * j)
            d.ellipse([px - r, py - r, px + r, py + r], fill=MUC)
        d.rectangle([cx - rx * 0.3, cy - ry * 0.75, cx + rx * 0.3, cy - ry * 0.68], fill=(251, 254, 208))


def dai_mau(q, path):
    so = q['so']; cw = 1536 // so; ch = round(cw * q['fh'] / q['fw'])
    nen = NEN[q['nen']]
    im = Image.new('RGB', (cw * so, ch), nen); d = ImageDraw.Draw(im)
    for i in range(so):
        if i: d.line([(i * cw, 0), (i * cw, ch)], fill=(10, 10, 10), width=2)
        ve_o(d, q['ma'], i * cw, 0, cw, ch, i, so, nen)
    im.save(path); return path


def lo_mau(L, path):
    """Tấm lô gộp: lưới C cột × M hàng phủ kín ảnh, kẻ lưới mảnh màu tối."""
    w, h, C, M = L['w'], L['h'], L['so'], len(L['hang'])
    nen = NEN[L['nen']]
    im = Image.new('RGB', (w, h), nen); d = ImageDraw.Draw(im)
    cw, ch = w / C, h / M
    for r, ma in enumerate(L['hang']):
        for i in range(C): ve_o(d, ma, i * cw, r * ch, cw, ch, i, C, nen)
    for i in range(1, C): d.line([(round(i * cw), 0), (round(i * cw), h)], fill=(10, 10, 10), width=2)
    for r in range(1, M): d.line([(0, round(r * ch)), (w, round(r * ch))], fill=(10, 10, 10), width=2)
    im.save(path); return path


def png(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1])))


def khac(a, b):
    d = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
    if not d.getbbox(): return 0
    r, g, bb = d.split()
    return sum(1 for v in ImageChops.lighter(ImageChops.lighter(r, g), bb).tobytes() if v)


def rong_vung(t):
    """Bề ngang phần hình (alpha > 40) rộng nhất trong các khung của tệp, tính theo điểm ảnh GAME."""
    im = png(t['tam']).convert('RGBA'); n = t.get('net', 1); fw = t['khung_rong'] * n; a = im.split()[3]
    best = 0
    for f in range(t['so']):
        box = a.crop((f * fw, 0, (f + 1) * fw, im.size[1])).point(lambda v: 255 if v > 40 else 0).getbbox()
        if box: best = max(best, box[2] - box[0])
    return best / n


PROMPT_JS = '''() => { const o = {}; HU.forEach((q, i) => { chonHu(i); o[Q.ma] = taoPrompt(Q);
    if (q.phe && !("mau" in q)) for (const he of ["fire", "poison", "ice"]) { chonHu(i, he); o[Q.ma] = taoPrompt(Q); } });
    for (const L of LO_DS) o["lo:" + L.id] = taoPromptLo(L); return o; }'''


def trang_tach(pw):
    url = serve(REPO) + '/tools/tach-hieu-ung/index.html'
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, accept_downloads=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type in ('error', 'warning') and 'jszip' not in m.text.lower() and 'ERR_' not in m.text and 'willReadFrequently' not in m.text else None)
    pg.goto(url); pg.wait_for_function('typeof HU !== "undefined" && typeof chonHu === "function"')
    hu = pg.evaluate('HU.map((q, i) => ({ i, ma: q.ma, ten: q.ten, nen: q.nen, fw: q.fw, fh: q.fh, gx: q.gx, gy: q.gy, so: q.so, giay: q.giay, lap: !!q.lap, phe: q.phe || "", to: !!q.to }))')
    lo = pg.evaluate('LO_DS.map((L, k) => { const K = khoLo(L); return { k, id: L.id, ten: L.ten, hang: L.hang, so: L.so, nen: L.nen, w: K.w, h: K.h, kho: K.ten, phong: K.phong }; })')
    prompts = pg.evaluate(PROMPT_JS)
    bang, shots, le = [], [], {}
    # --- 7 dải lẻ ---
    for q in [h for h in hu if h['ma'] in MOI]:
        path = dai_mau(q, os.path.join(TMP, q['ma'] + '.png'))
        pg.select_option('#chonHu', str(q['i']))
        pg.set_input_files('#chonAnh', path)
        pg.wait_for_function('!document.getElementById("buoc3").hidden && document.getElementById("dangCho").textContent.indexOf("(%s)") >= 0' % q['ma'])
        pg.wait_for_timeout(250)
        kq = pg.evaluate('''() => ({ the: document.getElementById("theKq").textContent, ds: [...document.querySelectorAll("#dsKiem li.loi")].map((l) => l.textContent),
            cuon: document.documentElement.scrollWidth > window.innerWidth + 1, tep: taoTep() })''')
        t = kq['tep']; im = png(t['tam']); rv = rong_vung(t)
        dung = t.get('net') == 2 and im.size == (q['fw'] * q['so'] * 2, q['fh'] * 2) and t['ma'] == q['ma'] and t['lap'] is True and t['goc'] == [q['gx'], q['gy']]
        bang.append({'kieu': 'lẻ', 'ma': q['ma'], 'the': kq['the'], 'dung_co': dung, 'cuon_ngang': kq['cuon'], 'loi': kq['ds'], 'rong_vung': rv, 'khung': q['fw'], 'kb': round(len(json.dumps(t)) / 1024, 1)})
        le[q['ma']] = t
        if q['ma'] == 'hu-vung-doc':
            pg.locator('#buoc3').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
            shots.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
    # --- 2 lô gộp ---
    tep = {}
    for L in [x for x in lo if x['id'] in LO_MOI]:
        path = lo_mau(L, os.path.join(TMP, 'lo-' + L['id'] + '.png'))
        pg.select_option('#chonHu', 'lo:%d' % L['k'])
        pg.set_input_files('#chonAnh', path)
        pg.wait_for_function('!document.getElementById("buoc3").hidden && KQL.length === %d && LO && LO.id === "%s"' % (len(L['hang']), L['id']))
        pg.wait_for_timeout(300)
        kq = pg.evaluate('''() => ({ tt: document.getElementById("ttLo").textContent, cuon: document.documentElement.scrollWidth > window.innerWidth + 1,
            hang: KQL.map((h) => ({ ma: h.q.ma, dat: !!(h.R && h.R.kq.dat), loi: h.R ? h.R.muc.filter((m) => !m[1]).map((m) => m[0]) : ["không thấy hàng"], tep: h.R ? taoTep(h.q, h.R.kq) : null })) })''')
        for h in kq['hang']:
            t = h['tep']; q = next(x for x in hu if x['ma'] == h['ma'])
            dung = bool(t) and t.get('net') == 2 and png(t['tam']).size == (q['fw'] * q['so'] * 2, q['fh'] * 2) and t['ma'] == q['ma']
            bang.append({'kieu': 'lô ' + L['id'], 'ma': h['ma'], 'the': 'ĐẠT' if h['dat'] else 'CÓ LỖI', 'dung_co': dung, 'cuon_ngang': kq['cuon'], 'loi': h['loi'], 'rong_vung': rong_vung(t) if t else 0, 'khung': q['fw'], 'kb': round(len(json.dumps(t)) / 1024, 1) if t else 0})
            if t: tep[h['ma']] = t
        pg.locator('#buoc3').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
        shots.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
    b.close()
    return hu, lo, prompts, bang, tep, le, errs, shots


THEM = r"""
(() => {
  T.dau = () => { G.time = 0; try { performance.now = () => G.time * 1000; } catch (e) { /* bỏ qua */ } };
  T.cho = (ms) => new Promise((r) => setTimeout(r, ms));
})();
"""

# Một phòng trống vùng Rừng, 8 vũng đặt thẳng vào danh sách vùng của phòng (chỉ để chụp và đo; sát thương = 0, em bé đứng ngoài).
CANH = r"""
async (mau) => {
  T.dau(); _gieo(41);
  const { S, W, P } = T.room(0, 2, { seed: 7 }); T.useBot(false);
  G.fxAnh.clear();
  const loi = [];
  for (const t of mau) if (!G.fxAnh.add(t)) loi.push('không nạp được ' + t.ma);
  if (mau.length) await T.cho(600);
  for (const t of mau) if (!G.fxAnh.co(t.ma)) loi.push('ảnh chưa sẵn sàng ' + t.ma);
  const g = W.geo, cx = g.cx, cy = g.cy;
  P.x = W.x0 + 14; P.y = W.y1 - 6; P.face = 1;
  const he = (x, y, r, el, ex) => { const z = Object.assign({ shape: 'circle', x, y, r, t: 0, pool: true, team: 'player', el, life: 99, tick: 99, every: 99, src: 0, he: true }, ex || {}); W.zones.push(z); return z; };
  const quai = (x, y, r, el) => { const z = { shape: 'circle', x, y, r, t: 0, t0: 0, dmg: 0, el, pool: true, life: 99, tick: 0.5 }; W.zones.push(z); return z; };
  const ch = (x, y, r, kind, el) => { const z = { kind, el, x, y, r, life: 99, life0: 99, every: 99, tick: 99, t: 0, src: 0, dmg: 0 }; (W.chZones || (W.chZones = [])).push(z); return z; };
  const y1 = cy - 34, y2 = cy + 30;
  const ds = [
    ['Vũng lửa em bé', 'hu-vung-lua', he(cx - 150, y1, 18, 'fire'), 0, 1],
    ['Vũng độc em bé', 'hu-vung-doc', he(cx - 80, y1, 25, 'poison', { cloud: true }), 0, 1],
    ['Mây độc (trên vũng độc)', 'hu-may-doc', W.zones[W.zones.length - 1], -14, 1],
    ['Vệt cháy của chưởng', 'hu-vung-lua', ch(cx + 5, y1, 13, 'vet', 'fire'), 0, 1],
    ['Mây độc của chưởng (mặt sàn)', 'hu-vung-doc', ch(cx + 105, y1, 35, 'may', 'poison'), 0, 1.07],
    ['Vũng lửa của quái', 'hu-vung-quai-lua', quai(cx - 140, y2, 24, 'fire'), 0, 1],
    ['Vũng độc của quái', 'hu-vung-quai-doc', quai(cx - 55, y2, 34, 'poison'), 0, 1],
    ['Vũng nước lạnh của quái', 'hu-vung-quai-bang', quai(cx + 20, y2, 15, 'ice'), 0, 1],
    ['Vũng đỏ của quái', 'hu-vung-quai-do', quai(cx + 90, y2, 24, null), 0, 1],
  ];
  T.frame(50);
  P.x = W.x0 + 14; P.y = W.y1 - 6;
  const cv = document.getElementById('world');
  const out = { loi, w: cv.width, h: cv.height, cam: W.cam || 0, anh: cv.toDataURL(), fxErr: G.fx.errs ? G.fx.errs + ' lỗi fx: ' + G.fx.lastErr : '',
    ds: ds.map(([ten, ma, z, dy, tho]) => ({ ten, ma, x: z.x - (W.cam || 0), y: z.y + dy, r: z.r, tho })), phong: [W.x0, W.x1, W.y0, W.y1] };
  return out;
}
"""
# pha sắp tắt: cho mọi vũng tắt dần, không được có lỗi lớp vẽ
TAT = r"""() => { const W = G.getWorld();
  for (const z of W.zones) z.life = 0.5; for (const z of W.chZones) z.life = 0.5;
  T.frame(40);
  return { conLai: W.zones.filter((z) => z.pool && !z.dead && z.life > 0).length + (W.chZones || []).length, fxErr2: G.fx.errs ? G.fx.errs + ' lỗi fx: ' + G.fx.lastErr : '' }; }"""

BOT = r"""() => { T.dau(); _gieo(31); G.pointers.clear(); G.testSave({ lvl: 1 }); G.save.potions = 2; const r = G.srand(3 * 13 + 5); Math.random = r; G.rnd = r; T.useBot(true);
  const nk = [], d0 = G.damage, h0 = G.hurtPlayer; let buoc = 0;
  G.damage = function (t, amt, o) { const hp = t.hp, v = d0.apply(this, arguments); nk.push(buoc + ':' + (t.isBoss ? 'trum' : t.role) + ':' + (Math.round((hp - t.hp) * 100) / 100)); return v; };
  G.hurtPlayer = function (amt) { const P = G.getWorld().P, hp = P.hp, v = h0.apply(this, arguments); if (v) nk.push(buoc + ':be:' + (Math.round((hp - P.hp) * 100) / 100)); return v; };
  G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S0 = G.getRun(); S0.fade = 0;
  const out = { thang: null, giay: 0 };
  for (; buoc < 600 * 60; buoc++) { const S = G.getRun(); if (!S) break; if (S.mode === 'result' || S.mode === 'dead') { out.thang = S.mode === 'result'; break; }
    if (S.mode !== 'play') { G.botRun(1); continue; }
    T.frame(1); }
  const S = G.getRun(); out.giay = +(buoc / 60).toFixed(1); out.mau = S ? Math.round(S.P.hp) + '/' + S.P.maxhp : null; out.soDong = nk.length; out.nhatKy = nk.join('\n'); out.loiFx = G.fx.errs; return out; }"""


def mo(pw, root):
    """Mở bản gói game/dist/linh-khi.html (?cloud=0), màn 844×390, chặn vòng lặp tự chạy để điều khiển từng khung."""
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    # Hạt hiệu ứng dùng Math.random: gắn hạt giống cố định để hai lần chạy ra ảnh giống hệt (mới so "0 điểm ảnh khác" được)
    pg.add_init_script("(() => { let a = 20261011; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; window._gieo = (v) => { a = v; }; })();")
    pg.goto(serve(os.path.join(root, 'game', 'dist')) + '/linh-khi.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(600)
    pg.evaluate("window._raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(root, 'game', 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(root, 'game', 'tests', 'setup.js'))
    pg.evaluate(LIB); pg.evaluate(THEM)
    pg.wait_for_function("G.spriteCustom && ['heoCon','nhimDoc','heoNanh','namChua'].every((m) => G.spriteCustom.get(m))")
    pg.wait_for_timeout(400)
    return b, pg, errs


def canh(pw, root, mau, chup=False):
    b, pg, errs = mo(pw, root)
    r = pg.evaluate(CANH, mau)
    shot = Image.open(io.BytesIO(pg.screenshot())).convert('RGB') if chup else None
    r.update(pg.evaluate(TAT))
    b.close()
    return r, errs, shot


def bot(pw, root):
    b, pg, errs = mo(pw, root)
    kq = pg.evaluate(BOT); b.close()
    nk = kq.pop('nhatKy'); kq['bamNhatKy'] = hashlib.sha256(nk.encode()).hexdigest()[:16]; kq['loiJS'] = errs
    return kq, nk


def gan(c, m, tol=14):
    return abs(c[0] - m[0]) <= tol and abs(c[1] - m[1]) <= tol and abs(c[2] - m[2]) <= tol


def do_ngang(im, k, x, y, r, khop):
    """Bề ngang (điểm ảnh game) của dải điểm khớp màu thân vũng trên các hàng quanh tâm; lấy hàng rộng nhất."""
    px = im.load(); W, H = im.size; best = 0
    for dy in (-1, 0, 1):
        yy = int(round(y * k)) + dy
        if yy < 0 or yy >= H: continue
        xs = [xx for xx in range(max(0, int((x - r * 1.6) * k)), min(W, int((x + r * 1.6) * k) + 1)) if khop(px[xx, yy])]
        if xs: best = max(best, xs[-1] - xs[0] + 1)
    return best / k


def chu(d, xy, s, mau=(240, 236, 220), co=14):
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', co)
    except Exception: f = ImageFont.load_default()
    d.text(xy, s, fill=mau, font=f)


def main():
    ok = True; KQ = {}
    with sync_playwright() as pw:
        print('== 1. Trang tách')
        hu, lo, prompts, bang, tep, le, errs, shots = trang_tach(pw)
        for r in bang:
            dat = r['the'] == 'ĐẠT' and r['dung_co'] and not r['cuon_ngang'] and abs(r['rong_vung'] - (r['khung'] - 4)) <= 1
            r['dat'] = dat; ok &= dat
            print('  %-12s %-18s %-7s net2+cỡ đúng: %s  vũng rộng %.1f (khung − 4 = %d)  cuộn ngang: %s  %5.1f KB %s' % (r['kieu'], r['ma'], r['the'], r['dung_co'], r['rong_vung'], r['khung'] - 4, r['cuon_ngang'], r['kb'], '' if dat else r['loi']))
        print('  lỗi trang:', errs or 'không'); ok &= not errs
        thieu = [m for m in MOI if m not in tep]
        print('  tệp từ lô gộp: %d/7' % len(tep), thieu or ''); ok &= not thieu
        KQ['trang_tach'] = bang; KQ['lo'] = [x for x in lo if x['id'] in LO_MOI]; KQ['muc'] = [h for h in hu if h['ma'] in MOI]
        KQ['kb_mau'] = {m: round(len(json.dumps(tep[m])) / 1024, 1) for m in tep}
        json.dump({k: v for k, v in prompts.items() if k in MOI or k in ['lo:' + x for x in LO_MOI]}, open(os.path.join(TMP, 'prompt-moi.json'), 'w'), ensure_ascii=False, indent=1)
        if OLD:
            b = pw.chromium.launch(); pg = b.new_page()
            pg.goto(serve(OLD) + '/tools/tach-hieu-ung/index.html'); pg.wait_for_function('typeof HU !== "undefined" && typeof chonHu === "function"')
            cu = pg.evaluate(PROMPT_JS); b.close()
            doi = [k for k in cu if cu[k] != prompts.get(k)]
            print('  prompt cũ: %d bản (mục lẻ, bản theo hệ, lô gộp), đổi chữ: %s; bản mới thêm: %d' % (len(cu), doi or 'không bản nào', len(prompts) - len(cu))); ok &= not doi
            KQ['prompt_cu'] = {'so_ban': len(cu), 'doi_chu': doi, 'them': sorted(set(prompts) - set(cu))}
        print('  tệp tạm:', TMP)

        print('== 2. Game')
        moi0, e0, _ = canh(pw, REPO, [])
        print('  bản mới, không tệp: lỗi JS', e0 or 'không', moi0['loi'] or '', moi0['fxErr'] or '', moi0['fxErr2'] or '')
        ok &= not e0 and not moi0['fxErr'] and not moi0['fxErr2']
        A0 = png(moi0['anh']).convert('RGB')
        if OLD:
            cu0, ec, _ = canh(pw, OLD, [])
            n = khac(png(cu0['anh']), A0); ok &= n == 0
            print('  không tệp, so bản cũ / bản mới: khác %d điểm ảnh (ảnh %d×%d)' % (n, moi0['w'], moi0['h']))
            KQ['khong_tep_khac'] = n
        dsTep = [tep[m] for m in MOI if m in tep]
        moi1, e1, shot = canh(pw, REPO, dsTep, True)
        print('  bản mới, nạp tạm %d tệp mẫu: lỗi JS' % len(dsTep), e1 or 'không', moi1['loi'] or '', moi1['fxErr'] or '', moi1['fxErr2'] or '', '· vũng còn lại sau pha tắt:', moi1['conLai'])
        ok &= not e1 and not moi1['loi'] and not moi1['fxErr'] and not moi1['fxErr2'] and moi1['conLai'] == 0
        A1 = png(moi1['anh']).convert('RGB'); k = moi1['w'] / 480
        # đo bề ngang vũng vẽ ra: màu thân lấy từ chính tệp mẫu (điểm giữa khung 1, lệch xuống dưới để tránh bong bóng)
        do = []
        for z in moi1['ds']:
            t = tep[z['ma']]; im = png(t['tam']).convert('RGBA'); n = t.get('net', 1)
            m = im.getpixel((int(t['khung_rong'] * n * 0.5), int(t['khung_cao'] * n * 0.5)))[:3]
            if z['ma'] == 'hu-may-doc': khop = lambda c: c[1] > c[0] + 40 and c[2] > c[0] + 40  # mây vẽ đậm 60% nên đo theo sắc xanh lơ
            else: khop = (lambda mm: lambda c: gan(c, mm))(m)
            w = do_ngang(A1, k, z['x'], z['y'], z['r'], khop)
            lech = w / 2 - z['r']
            dat = abs(lech) <= max(1.0, z['r'] * (z['tho'] - 1) + 1.0)
            ok &= dat
            do.append({'ten': z['ten'], 'ma': z['ma'], 'ban_kinh_luat': z['r'], 'ban_kinh_ve': round(w / 2, 2), 'lech': round(lech, 2), 'dat': dat})
            print('  %-30s %-18s bán kính luật %4.1f · vẽ ra %5.2f · lệch %+.2f %s' % (z['ten'], z['ma'], z['r'], w / 2, lech, '' if dat else ' <-- LỆCH'))
        KQ['do'] = do; KQ['ti_le_anh_chup'] = k
        n1 = khac(A0, A1); print('  có tệp mẫu khác bản code %d điểm ảnh' % n1); ok &= n1 > 0

        print('== 3. Bot ải 1')
        bm, nkm = bot(pw, REPO); print('  mới:', json.dumps(bm, ensure_ascii=False))
        KQ['bot_ai1'] = {'sau': bm}
        if OLD:
            bc, nkc = bot(pw, OLD); print('  cũ :', json.dumps(bc, ensure_ascii=False))
            trung = nkc == nkm; ok &= trung and bm['thang'] is True
            print('  nhật ký sát thương trùng từng dòng:', trung)
            KQ['bot_ai1'].update({'truoc': bc, 'nhat_ky_trung': trung})

    # ---------- ảnh kiểm ----------
    lon = 2
    a0 = A0.resize((A0.size[0] * lon // max(1, round(k)), A0.size[1] * lon // max(1, round(k))), Image.NEAREST)
    a1 = A1.resize(a0.size, Image.NEAREST)
    Wd = max(a0.size[0] + shot.size[0] + 30, a0.size[0] * 2 + 30)
    tam = Image.new('RGB', (Wd, 60 + a0.size[1] * 2 + 40), (18, 22, 26)); d = ImageDraw.Draw(tam)
    chu(d, (10, 8), 'Làn B4 · 7 vũng trên sàn · hình mẫu MÁY VẼ (màu chói để đo), chưa phải ảnh ChatGPT', co=16)
    chu(d, (10, 34), 'Trên: chưa có tệp (vẽ bằng code, y như bản trước)', (160, 200, 180)); tam.paste(a0, (10, 54))
    y = 54 + a0.size[1] + 8
    chu(d, (10, y), 'Dưới: nạp tạm 7 tệp mẫu. Vòng đỏ cam quanh vũng của quái vẫn do code vẽ.', (160, 200, 180)); tam.paste(a1, (10, y + 20))
    chu(d, (a0.size[0] + 20, 34), 'Ảnh chụp màn hình 844×390 (có tệp mẫu)', (160, 200, 180)); tam.paste(shot, (a0.size[0] + 20, 54))
    for z in moi1['ds']:
        for im_y in (54, y + 20):
            ImageDraw.Draw(tam).text((10 + z['x'] * lon - 3 * len(z['ma']), im_y + (z['y'] + z['r'] * 0.9 + 6) * lon), z['ma'].replace('hu-', ''), fill=(255, 255, 255))
    yy = 54 + shot.size[1] + 24; X = a0.size[0] + 20
    chu(d, (X, yy), 'Đo trên ảnh chụp: bán kính luật (gây sát thương) → bán kính vẽ ra (điểm ảnh game)', (255, 210, 122)); yy += 24
    for r in do:
        chu(d, (X, yy), '%-30s %-18s luật %4.1f → vẽ %5.2f (lệch %+.2f) %s' % (r['ten'], r['ma'], r['ban_kinh_luat'], r['ban_kinh_ve'], r['lech'], 'ĐẠT' if r['dat'] else 'LỆCH'), (200, 240, 200) if r['dat'] else (255, 140, 120)); yy += 24
    tam.save(os.path.join(HERE, 'anh-kiem.png'))
    if shots:
        h = max(s.size[1] for s in shots) // 2
        nho = [s.resize((s.size[0] * h // s.size[1], h)) for s in shots]
        tt = Image.new('RGB', (sum(s.size[0] for s in nho) + 10 * (len(nho) + 1), h + 20), (18, 22, 26))
        x = 10
        for s in nho: tt.paste(s, (x, 10)); x += s.size[0] + 10
        tt.save(os.path.join(HERE, 'anh-kiem-trang-tach.png'))
    KQ['dat_tat_ca'] = bool(ok)
    json.dump(KQ, open(os.path.join(HERE, 'ket-qua.json'), 'w'), ensure_ascii=False, indent=1)
    print('KẾT QUẢ:', 'ĐẠT' if ok else 'CÓ MỤC CHƯA ĐẠT')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
