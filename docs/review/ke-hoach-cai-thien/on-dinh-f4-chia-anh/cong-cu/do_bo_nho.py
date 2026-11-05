"""F4 — ĐO BỘ NHỚ ẢNH (headless Chromium, giả iPhone: UA iPhone, 6 lõi → ngân sách 96 MiB của bộ tải).
Thước đo độc lập với số của game: cộng rộng × cao × 4 của MỌI ảnh <img>/Image còn sống, đang có src, đã nạp xong (đã giải mã)
(theo dõi bằng WeakRef từ lúc tạo, gọi gc() trước mỗi lần đo). Ảnh chia trang: tính các TRANG đã giải mã (đối tượng hình gốc không có src).
Đo đỉnh: lấy mẫu mỗi 250 ms trong lúc chờ ở mỗi mốc.
  python3 do_bo_nho.py <dist> '<cờ thêm>' <tệp JSON ra>
Mốc: màn chào · làng · ải 1-1 (đi + đánh + đổi vũ khí) · ải trùm Thornwood (1-5): phòng đầu → phòng trước trùm → phòng trùm ·
về làng · làng mặc từng bộ (rung, bien, lau, ninja) · ải 1-1 mặc bộ rung."""
import json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, *['..'] * 5))
GAME = os.path.join(ROOT, 'game'); SRV = os.path.join(ROOT, 'docs', 'review', 'kiem-thu-12-10', 'srv.py')
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
INIT = r"""
Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 6 });
(() => {
  const L = []; window.__imgs = L; const O = window.Image;
  const I = function (w, h) { const i = arguments.length ? new O(w, h) : new O(); L.push(new WeakRef(i)); return i; };
  I.prototype = O.prototype; window.Image = I;
  const ce = Document.prototype.createElement;
  Document.prototype.createElement = function (t) { const e = ce.apply(this, arguments); if (String(t).toLowerCase() === 'img') L.push(new WeakRef(e)); return e; };
  window.__mem = () => { let s = 0, n = 0, to = 0, ten = '';
    for (const r of L) { const i = r.deref(); if (!i) continue; const src = i.getAttribute('src'); if (!src) continue;
      if (i.complete && i.naturalWidth) { const b = i.naturalWidth * i.naturalHeight * 4; s += b; n++; if (b > to) { to = b; ten = i.naturalWidth + 'x' + i.naturalHeight; } } }
    return { mib: +(s / 1048576).toFixed(1), n, lon: ten }; };
})();
"""
TT = r"""(() => { const SC = G.spriteCustom, R = SC.roi, b = R && R.boNho ? R.boNho() : null, TA = G.trangAnh;
  return { game_mib: b ? +b.mb.toFixed(1) : null, trang: TA && TA.thongKe ? (({ mib, trang, san, miss, bo }) => ({ mib: +mib.toFixed(1), trang, san, miss, bo }))(TA.thongKe()) : null,
    scene: G.scene === G.StageScene ? 'ai' : G.scene === G.Village ? 'lang' : G.scene === G.ChoVung ? 'cho' : '?' }; })()"""
RANH = r"""(() => { const R = G.spriteCustom.roi; const tk = R.thongKe ? R.thongKe() : { dangGiai: 0, choGiai: 0 }; const T = G.trangAnh && G.trangAnh.thongKe ? G.trangAnh.thongKe() : { dangTai: 0, cho: 0 };
  return R.dang() === 0 && !tk.dangGiai && !tk.choGiai && !T.dangTai && !T.cho; })()"""


def main():
    dist, co, ra = sys.argv[1], sys.argv[2], sys.argv[3]
    port = 8850 + (abs(hash(dist + co)) % 40)
    srv = subprocess.Popen([sys.executable, SRV, dist, str(port)], stderr=subprocess.DEVNULL)
    time.sleep(1)
    kq, loi = [], []
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(args=['--js-flags=--expose-gc'])
            ctx = b.new_context(viewport={'width': 844, 'height': 390}, user_agent=UA, is_mobile=True, has_touch=True)
            pg = ctx.new_page(); pg.add_init_script(INIT)
            pg.on('pageerror', lambda e: loi.append(str(e)[:200]))
            def mem():
                pg.evaluate('window.gc && gc()')
                return pg.evaluate('window.__mem()')
            def cho(giay, hd=None):
                dinh, t = 0, time.time(); on = 0
                while time.time() - t < giay:
                    if hd: pg.evaluate(hd)
                    m = pg.evaluate('window.__mem()')['mib']; dinh = max(dinh, m)
                    on = on + 1 if pg.evaluate(RANH) else 0
                    if on >= 8 and time.time() - t > 3 and not hd: break
                    pg.wait_for_timeout(250)
                return dinh
            def moc(ten, giay=40, hd=None):
                d = cho(giay, hd); m = mem(); x = dict(moc=ten, mib=m['mib'], dinh=max(d, m['mib']), so_anh=m['n'], anh_lon_nhat=m['lon'], **pg.evaluate(TT))
                kq.append(x); print(json.dumps(x, ensure_ascii=False), flush=True)
            pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
            pg.wait_for_function('window.G && G.scene && G.spriteCustom && G.spriteCustom.roi', timeout=120000)
            moc('màn chào', 25)
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.evaluate("(() => { G.testSave({}); G.setScene(G.Village); })()")
            moc('làng', 90)
            pg.evaluate("G.startStage(0, 0)"); pg.wait_for_function('G.scene === G.StageScene', timeout=300000)
            DANH = "(() => { const P = G.getRun().P; G.keys = G.keys || {}; P.x += Math.sin(Date.now() / 300) * 3; if (G.input) {} if (G.atkPress) G.atkPress(); })()"
            moc('ải 1-1 (vào)', 30)
            pg.evaluate("(() => { const S = G.getRun(), P = S.P; P.cur = (P.cur + 1) % P.weapons.length; })()")
            moc('ải 1-1 (đổi vũ khí)', 20)
            pg.evaluate("G.setScene(G.Village)")
            moc('làng (sau ải)', 20)
            pg.evaluate("G.startStage(0, 4)"); pg.wait_for_function('G.scene === G.StageScene', timeout=300000)
            moc('ải trùm 1-5 (phòng đầu)', 30)
            nb = pg.evaluate("(() => { const m = G.getRun().map; const b = m.rooms.find((r) => r.type === 'boss'); const d = Object.values(b.doors)[0]; return [b.id, d]; })()")
            pg.evaluate("G.gotoRoom(%d)" % nb[1])
            moc('ải trùm: phòng trước trùm', 40)
            pg.evaluate("G.gotoRoom(%d)" % nb[0])
            moc('ải trùm: phòng trùm (Thornwood)', 25)
            pg.wait_for_timeout(4000); moc('ải trùm: đang đánh trùm', 8)
            pg.evaluate("G.setScene(G.Village)")
            moc('làng (sau trùm)', 25)
            for bo in ('rung', 'bien', 'lau', 'ninja'):
                pg.evaluate("(() => { G.ZED_BO_THU = '%s'; if ('%s' === 'ninja') G.ROWAN_HINH = false; })()" % (bo, bo))
                moc('làng mặc bộ ' + bo, 40)
            pg.evaluate("(() => { G.ZED_BO_THU = 'rung'; G.ROWAN_HINH = true; G.startStage(0, 0); })()"); pg.wait_for_function('G.scene === G.StageScene', timeout=300000)
            moc('ải 1-1 mặc bộ rung', 30)
            b.close()
    finally:
        srv.kill()
    out = {'co': co, 'dist': dist, 'moc': kq, 'loi_js': loi[:10], 'so_loi_js': len(loi), 'dinh': max(x['dinh'] for x in kq)}
    json.dump(out, open(ra, 'w'), ensure_ascii=False, indent=1)
    print('ĐỈNH', out['dinh'], 'MiB; lỗi JS', len(loi))


if __name__ == '__main__':
    main()
