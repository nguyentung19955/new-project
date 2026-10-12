"""Phiên kiểm 3 pha trùm — phần TẢI ẢNH (bổ sung cho tests/au_pha_trum.py): bản HAI TỆP, máy chủ thử hỗ trợ Range như Firebase Hosting.
Mặc định (--ngat), như mất mạng / khoá máy giữa chừng trên iPhone:
  - bản ẢNH RỜI (mặc định trên web, Tải nhanh 12/10): mỗi ảnh trùm vùng (anh/<trùm>*) trả 503 bốn lần đầu (WebP rồi PNG 3 lần), đủ để game bỏ ảnh;
    sau đó máy chủ lành lại. Kiểm tra: vào phòng trùm thì game thử lại và có đủ 3 dáng (SC.uuTienTrum → SC.roiThuLai + roiCan).
  - bản tệp JSON (LK_ANH_ROI=0): máy chủ làm hỏng MỌI lượt tải cả tệp ảnh, chỉ trả lời yêu cầu Range (SC.uuTienTrum tải riêng dòng ảnh trùm).
Rồi đánh từng trùm tới chết, pha 2/3 phải vẽ đúng tệp -p2/-p3.
--du: tải cả tệp bình thường. Ảnh chụp ghi vào thư mục tạm (hoặc thư mục truyền vào).
Chạy (từ thư mục game, sau khi LK_HAI_TEP=1 python3 build.py --hai-tep):  python3 tests/au_pha_trum.py [thư mục ảnh] [--ngat]
--ngat: máy chủ thử làm hỏng MỌI lượt tải cả tệp ảnh (như mất mạng giữa chừng trên iPhone), chỉ trả lời yêu cầu Range:
        kiểm tra ảnh trùm (pha 1, 2, 3) vẫn về nhờ tải ưu tiên khi vào ải (SC.uuTienTrum). Không chụp ảnh.
Máy chủ thử hỗ trợ Range như Firebase Hosting.
Thoát mã 1 nếu có pageerror hoặc pha 2/3 không vẽ bằng tệp -p2/-p3 (khi tệp đó có trong game)."""
import os, sys, json, glob, threading, http.server, functools, re, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
NGAT = '--du' not in sys.argv
HONG, NGAT_LAN = {}, 4
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
OUT = ARGS[0] if ARGS else __import__('tempfile').mkdtemp(prefix='pha-trum-tai-')
os.makedirs(OUT, exist_ok=True)
BOSSES = [(0, 'mocTinh', 'Mộc Tinh'), (1, 'nguTinh', 'Ngư Tinh'), (2, 'hoTinh', 'Hồ Tinh')]
CO_PHA = {os.path.basename(p).split('.')[0] for p in glob.glob(os.path.join(ROOT, 'art', 'custom', '*-p[23].sprite.json'))}

SETUP = r"""
() => {
  window.__BOT = G.botInput;
  const SC = G.spriteCustom, v0 = SC.veKhung;
  window.__ve = {};
  SC.veKhung = function (c, sp, ten) { if (sp && /Tinh/.test(sp.ma)) window.__ve[sp.ma] = (window.__ve[sp.ma] || 0) + 1; return v0.apply(this, arguments); };
  return true;
}
"""

FIGHT = r"""
([r, frames]) => {
  const o = AU.room({ region: r, stage: 4, big: true, keepBoss: true, lvl: 30, tier: 3, sharpen: 10, seed: 5 });
  G.botInput = window.__BOT;
  AU.manual = true; // au_lib chặn vòng lặp thật; G.sim cần G.tick chạy thật
  window.__dbg = { scene: G.scene === G.StageScene, mode: o.S.mode };
  const W = o.W, P = o.P, b = W.boss;
  return { dbg: window.__dbg, name: b.name, art: b.art, maxhp: Math.round(b.maxhp) };
}
"""

# chạy tới khi trùm đổi pha (hoặc chết / hết khung); em bé bất tử để bot không thua
STEP = r"""
([maxF]) => {
  const S = G.getRun(), W = G.getWorld(), P = S.P, b = W.boss;
  if (!b) return { dead: true };
  const ph0 = b.phase;
  for (let f = 0; f < maxF; f++) {
    P.hp = P.maxhp; P.inv = Math.max(P.inv || 0, 0.2);
    // em bé đánh: mỗi 0,5 giây một đòn 1,5% máu trùm qua G.damage (đúng đường sát thương của game, kể cả miễn sát thương lúc chuyển pha)
    if (f % 30 === 0 && !(b.invuln > 0)) G.damage(b, b.maxhp * 0.015, { src: P, crit: false });
    G.sim(1);
    if (!W.boss || b.dead || b.dying != null) return { dead: true, hp: Math.max(0, b.hp) / b.maxhp, f };
    if (b.phase !== ph0) return { phase: b.phase, frac: b.hp / b.maxhp, anim: b.an && b.an.n, banner: W.banner && W.banner.s, f };
  }
  return { phase: b.phase, frac: b.hp / b.maxhp, timeout: true };
}
"""

SIM = r"""([n]) => { const S = G.getRun(), P = S.P; for (let i = 0; i < n; i++) { P.hp = P.maxhp; P.inv = Math.max(P.inv || 0, 0.2); G.sim(1); } const b = G.getWorld().boss; return b ? { an: b.an && b.an.n, ph: b.phase, dying: b.dying } : null; }"""


def shot(pg, name):
    pg.evaluate('() => { window.__ve = {}; }')
    pg.wait_for_timeout(250)
    p = os.path.join(OUT, name + '.png')
    pg.screenshot(path=p)
    try:
        from PIL import Image
        im = Image.open(p).convert('RGB'); im = im.resize((im.width * 2 // 3, im.height * 2 // 3)); im = im.quantize(96)
        im.save(p, optimize=True)
    except Exception:
        pass
    return pg.evaluate('() => window.__ve')


class May(http.server.SimpleHTTPRequestHandler):
    """Máy chủ tĩnh có hỗ trợ Range (một khoảng). --ngat: lượt tải cả tệp ảnh trả 503."""
    def log_message(self, *a):
        pass

    def do_GET(self):
        rg = self.headers.get('Range')
        path = self.translate_path(self.path)
        if 'linh-khi-anh.' in self.path and os.path.isfile(path):
            data = open(path, 'rb').read()
            if rg and rg.startswith('bytes='):
                a, b = rg[6:].split('-'); a = int(a); b = int(b) if b else len(data) - 1
                part = data[a:b + 1]
                self.send_response(206); self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Range', 'bytes %d-%d/%d' % (a, a + len(part) - 1, len(data))); self.send_header('Content-Length', str(len(part))); self.end_headers()
                self.wfile.write(part); return
            if NGAT:
                self.send_response(503); self.send_header('Content-Length', '0'); self.end_headers(); return
        m = re.search(r'/anh/((mocTinh|nguTinh|hoTinh)[^./?]*)', self.path)
        if NGAT and m and HONG.get(m.group(1), 0) < NGAT_LAN:  # hỏng 4 lần đầu mỗi ảnh trùm (WebP 1 + PNG 3): game bỏ ảnh đó
            HONG[m.group(1)] = HONG.get(m.group(1), 0) + 1
            self.send_response(503); self.send_header('Content-Length', '0'); self.end_headers(); return
        return super().do_GET()


def main():
    errs, rep = [], []
    h = functools.partial(May, directory=DIST)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0' % srv.server_address[1] + os.environ.get('LK_THEM', '')  # ví dụ LK_THEM='&uutien=0' để xem cách cũ
    bad = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url)
        pg.wait_for_function('window.G && G.scene && G.spriteCustom')
        pg.wait_for_function('G.spriteCustom.sau.tt === "xong" || G.spriteCustom.sau.tt === "loi" || G.spriteCustom.sau.tt === "khong"', timeout=180000)
        print('ảnh trùm hỏng chờ thử lại:', pg.evaluate("() => G.spriteCustom.roi ? G.spriteCustom.roi.loi() : '-'"))
        print('ảnh tải sau:', pg.evaluate('G.spriteCustom.sau.tt'), pg.evaluate('G.spriteCustom.sau.xong'), '/', pg.evaluate('G.spriteCustom.sau.tong'))
        pg.wait_for_timeout(1500)
        if NGAT:
            co = pg.evaluate("() => Object.keys(G.spriteCustom.ds).filter(k => /Tinh/.test(k) && G.spriteCustom.ds[k].ready)")
            print('--ngat: ảnh trùm có sẵn trước khi vào ải:', co)
            if co: bad.append('--ngat: tệp ảnh lẽ ra hỏng mà trùm đã có ảnh ' + str(co))
        for f in ('bot.js', 'setup.js', 'au_lib.js'):
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        pg.evaluate(SETUP)
        for r, ma, nm in BOSSES:
            info = pg.evaluate(FIGHT, [r, 0])
            if NGAT:  # chờ lượt tải ưu tiên (bắt đầu lúc vào ải) đem ảnh trùm về
                try:
                    pg.wait_for_function('(m) => ["", "-p2", "-p3"].every(s => { const k = m + s; return !(k in G.spriteCustom.ds) || G.spriteCustom.ds[k].ready; })', arg=ma, timeout=30000)
                except Exception:
                    bad.append('--ngat: %s chưa có ảnh sau 30 giây (uu=%s)' % (nm, pg.evaluate('() => G.spriteCustom.uu')))
                pg.evaluate(FIGHT, [r, 0])
            sp = pg.evaluate('(m) => Object.keys(G.spriteCustom.ds).filter(k => k.indexOf(m) === 0 && G.spriteCustom.ds[k].ready)', ma)
            row = {'trum': nm, 'mau': info['maxhp'], 'tep_san': sp, 'pha': []}
            pg.evaluate(SIM, [240])  # ra mắt
            ve = shot(pg, '%s-pha1' % ma)
            row['pha'].append({'pha': 1, 've': ve})
            for k in range(2):
                st = pg.evaluate(STEP, [60 * 240])
                if st.get('dead') or st.get('timeout'):
                    row['loi'] = 'không tới pha %d: %s' % (k + 2, st); break
                pha = st['phase'] + 1
                pg.evaluate(SIM, [70])  # giữa cảnh chuyển pha (chớp đổi dáng)
                ve_c = shot(pg, '%s-chuyen-pha%d' % (ma, pha))
                pg.evaluate(SIM, [150])
                ve = shot(pg, '%s-pha%d' % (ma, pha))
                row['pha'].append({'pha': pha, 'mau_luc_doi': round(st['frac'] * 100, 1), 'chu': st.get('banner'), 'canh': st.get('anim'), 've_chuyen': ve_c, 've': ve})
                can = '%s-p%d' % (ma, pha)
                if can in CO_PHA and not any(x == can for x in ve):
                    bad.append('%s pha %d không vẽ bằng %s (vẽ: %s)' % (nm, pha, can, ve))
            st = pg.evaluate(STEP, [60 * 300])
            row['chet'] = bool(st.get('dead'))
            if row['chet']:
                pg.evaluate(SIM, [60]); shot(pg, '%s-chet' % ma)
            rep.append(row)
            print(json.dumps(row, ensure_ascii=False))
        br.close()
    srv.shutdown()
    with open(os.path.join(OUT, 'ket-qua-tai.json'), 'w') as f:
        json.dump({'tran': rep, 'pageerror': errs, 'loi_pha': bad}, f, ensure_ascii=False, indent=1)
    print('pageerror:', len(errs), errs[:3])
    print('lỗi pha:', bad)
    if errs or bad:
        sys.exit(1)


main()
