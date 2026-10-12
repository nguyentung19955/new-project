"""Kiểm 3 pha trùm vùng ở bản HAI TỆP (đúng như web): đánh Mộc Tinh, Ngư Tinh, Hồ Tinh tới chết bằng các nhát sát thương đều,
ghi máu lúc đổi pha, tệp ảnh thật sự vẽ thân trùm theo từng pha (đứng / đi / ra chiêu), chụp ảnh từng pha.
Chạy (từ thư mục game, sau LK_HAI_TEP=1 python3 build.py --hai-tep):  python3 tests/au_pha_trum.py [--cham]
--cham: giả lập mạng chậm (tệp ảnh tải sau về rất chậm) để xem ảnh dáng pha có kịp về trước phòng trùm không."""
import os, sys, json, threading, functools, http.server, socketserver, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'ke-hoach-cai-thien', 'pha-trum')
CHAM = '--cham' in sys.argv

HOOK = r"""() => {
  const SC = G.spriteCustom, v0 = SC.veKhung;
  window.__ve = [];
  SC.veKhung = function (c, sp, ten, i, face, o) { if (sp && /^(mocTinh|nguTinh|hoTinh)/.test(sp.ma)) window.__ve.push(sp.ma + ':' + ten); return v0.apply(this, arguments); };
}"""

FIGHT = r"""([r, step]) => {
  const { S, W, P } = AU.room({ region: r, stage: 4, big: true, keepBoss: true, lvl: 30, tier: 2 });
  const b = W.boss; b.layers = []; b.weak = [];
  const __cx = document.createElement('canvas').getContext('2d');
  const log = [], ve = {}, seen = {};
  let last = b.phase, f = 0;
  const ghiVe = () => { for (const s of window.__ve) { const n = b.dying != null ? 'die' : b.an ? b.an.n : '?', k = 'p' + (b.phase + 1) + ' ' + (b.tired > 0 || b.st.stun > 0 ? 'mệt' : /^c\d$/.test(n) ? 'chiêu' : n); (ve[k] = ve[k] || {})[s] = 1; } window.__ve = []; };
  AU.live(false); AU.manual = true;
  while (!b.dead && f < 60 * 400 && !(b.dying != null && b.dying >= 0.95)) {
    P.inv = 9; P.hp = P.maxhp;
    if (f % 30 === 0 && !(b.invuln > 0)) G.damage(b, b.maxhp * step, {});
    G.tick(); f++;
    if (f % 6 === 0) { window.__ve = []; G.art.boss(__cx, b); ghiVe(); }
    if (b.phase !== last) { log.push({ pha: b.phase + 1, mau: +(b.hp / b.maxhp * 100).toFixed(1), giay: +(f / 60).toFixed(1), banner: W.banner && W.banner.s, rung: W.shake }); last = b.phase; }
  }
  AU.manual = false;
  const gucVe = {}; for (const ph of [0, 1, 2]) { const sn = Object.assign({}, b, { phase: ph, dying: 0.3 }); window.__ve = []; G.art.boss(__cx, sn); gucVe['p' + (ph + 1)] = window.__ve.join(','); }
  return { ten: b.name, log, ve, gucVe, chet: b.dead || b.dying != null, giay: +(f / 60).toFixed(1) };
}"""

def serve():
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def copyfile(self, src, dst):
            if CHAM and self.path.find('linh-khi-anh') >= 0:
                while True:
                    b = src.read(64 * 1024)
                    if not b: break
                    dst.write(b); time.sleep(0.05)  # ~1,3 MB/giây
            else: super().copyfile(src, dst)
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(H, directory=DIST))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def main():
    srv = serve(); port = srv.server_address[1]
    errs, res = [], {}
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        t0 = time.time()
        pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0' % port)
        pg.wait_for_function('window.G && G.scene && G.spriteCustom')
        if CHAM:
            # vào phòng trùm Rừng ngay khi tệp vừa bắt đầu về: ảnh dáng pha đã có chưa?
            pg.wait_for_function('G.spriteCustom.sau.xong > 0', timeout=120000)
            for f in ['setup.js', 'au_lib.js']: pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
            pg.evaluate("() => AU.room({ region: 0, stage: 4, big: true, keepBoss: true })")
            pg.wait_for_timeout(3000)
            st = pg.evaluate("() => ['mocTinh','mocTinh-p2','mocTinh-p3'].map((k) => k + ':' + !!(G.spriteCustom.ds[k] && G.spriteCustom.ds[k].ready)).join(' ') + ' | ' + G.spriteCustom.sau.xong + '/' + G.spriteCustom.sau.tong")
            print('Mạng chậm, 3 giây sau khi vào phòng trùm Rừng:', st)
            pg.wait_for_function("['mocTinh','mocTinh-p2','mocTinh-p3'].every((k) => G.spriteCustom.ds[k] && G.spriteCustom.ds[k].ready)", timeout=300000)
            print('Mạng chậm: đủ 3 dáng Mộc Tinh sau %.1f giây; ảnh tải sau đã về %s' % (time.time() - t0, pg.evaluate("G.spriteCustom.sau.xong + '/' + G.spriteCustom.sau.tong")))
            br.close(); srv.shutdown(); print('pageerror:', errs or 0); return
        pg.wait_for_function("G.spriteCustom.sau.tt === 'xong'", timeout=180000)
        pg.wait_for_timeout(1500)
        for f in ['setup.js', 'au_lib.js']: pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        print('Ảnh dáng pha đã nạp:', pg.evaluate("() => Object.keys(G.spriteCustom.ds).filter((k) => /-p[23]$/.test(k) && G.spriteCustom.ds[k].ready).join(', ')"))
        pg.evaluate(HOOK)
        for r, ma in [(0, 'mocTinh'), (1, 'nguTinh'), (2, 'hoTinh')]:
            out = pg.evaluate(FIGHT, [r, 0.04])
            res[ma] = out
            print('==', out['ten'], '| chết:', out['chet'], 'sau', out['giay'], 'giây')
            for l in out['log']: print('   sang pha %d lúc máu %.1f%% (giây %.1f) | chữ: %s | rung %.2f' % (l['pha'], l['mau'], l['giay'], l['banner'], l['rung'] or 0))
            print('   lúc gục vẽ bằng:', out['gucVe'])
            for k in sorted(out['ve']): print('   %-16s vẽ bằng: %s' % (k, ', '.join(sorted(out['ve'][k]))))
            # ảnh từng pha: dựng lại phòng, đặt máu, cho chạy thật vài giây, chụp phần quanh trùm
            for ph, frac in [(1, 1.0), (2, 0.6), (3, 0.3)]:
                pg.evaluate("""([r, frac]) => { const { W, P } = AU.room({ region: r, stage: 4, big: true, keepBoss: true, lvl: 30, tier: 2 }); const b = W.boss;
                  P.inv = 99; AU.live(true); b.hp = b.maxhp * frac; P.x = b.x - 70; P.y = b.y + 30; }""", [r, frac])
                pg.wait_for_timeout(7000)
                bx = pg.evaluate("() => { const W = G.getWorld(), b = W.boss; return { ph: b.phase + 1, an: b.an && b.an.n }; }")
                pg.screenshot(path=os.path.join(OUT, '%s-pha%d.jpg' % (ma, ph)), type='jpeg', quality=55)
                print('   ảnh pha %d: trùm đang ở pha %d (%s)' % (ph, bx['ph'], bx['an']))
            pg.evaluate("() => AU.live(false)")
        br.close()
    srv.shutdown()
    with open(os.path.join(OUT, 'ket-qua.json'), 'w', encoding='utf-8') as f: json.dump(res, f, ensure_ascii=False, indent=1)
    print('pageerror:', errs or 0)

main()
