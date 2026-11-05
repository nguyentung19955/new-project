#!/usr/bin/env python3
"""Cổng kiểm trước khi đăng — SMOKE TEST headless (Playwright) trên ĐÚNG thư mục site vừa gói (phiên F1).

  python3 tools/phat-hanh/smoke_dist.py <thư-mục-site>            (tự mở máy chủ web tạm trên 127.0.0.1)
  python3 tools/phat-hanh/smoke_dist.py --url https://...          (kiểm một địa chỉ thật, ví dụ bản staging; chỉ phần không ghi gì)

Không dùng tài khoản thật: mọi trang mở với ?cloud=0, và mọi yêu cầu ra ngoài máy chủ tạm (Firebase, Google…) bị chặn —
chỉ cho phông chữ Google. Biến LK_KENH=chrome: dùng Chrome có sẵn trên máy chạy GitHub Actions (khỏi tải Chromium).

Các bước (bước nào hỏng thì in "HỎNG: ..." và thoát mã 1):
  1. mở trang ?cloud=0 không lỗi JS nghiêm trọng (pageerror), không ảnh nào trong anh/ bị 404
  2. màn đầu vẽ được (canvas có nhiều màu, không trắng/đen trơn) và có buildId
  3. vào ải 1-1: di chuyển, đánh, né, đổi vũ khí được
  4. lưu → tải lại trang: bản lưu giữ nguyên (đúng số vàng đánh dấu)
  5. ?cloud=0: đám mây tắt hẳn (G.cloud.why = 'off'), vẫn lưu trên máy được
  6. ?lang=en và ?lang=vi: mở được, màn đầu vẽ được, không lỗi JS
"""
import functools
import http.server
import json
import os
import socketserver
import sys
import threading
import time
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

LOI = []
GHI = []


def buoc(ten, ok, chi_tiet=''):
    (GHI if ok else LOI).append(ten)
    print(('  ĐẠT  ' if ok else '  HỎNG ') + ten + (' — ' + str(chi_tiet) if chi_tiet else ''), flush=True)


class Lang(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def may_chu(thu_muc):
    h = functools.partial(Lang, directory=thu_muc)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    s = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h)
    s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, 'http://127.0.0.1:%d/' % s.server_address[1]


VE_DUOC = """() => {
  // màn đầu "vẽ được": gom hai lớp canvas (#world, #ui) vào một ảnh nhỏ rồi đếm số màu khác nhau
  const c = document.createElement('canvas'); c.width = 120; c.height = 68; const x = c.getContext('2d');
  for (const id of ['world', 'ui']) { const e = document.getElementById(id); if (e && e.width && e.height) try { x.drawImage(e, 0, 0, 120, 68); } catch (er) { return -1; } }
  const d = x.getImageData(0, 0, 120, 68).data, m = new Set();
  for (let i = 0; i < d.length; i += 4) m.add((d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3));
  return m.size;
}"""

P_SNAP = "() => { const S = G.getRun && G.getRun(); if (!S || !S.P) return null; const P = S.P; return { x: P.x, y: P.y, atkT: P.atkT || 0, comboI: P.comboI, dodgeT: P.dodgeT || 0, inv: P.inv || 0, cur: P.cur, n: (P.weapons || []).length, scene: G.scene === G.StageScene }; }"


def mo(ctx, url, errs, cho_ve=True):
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('Lỗi JS: ' + str(e)[:300]))
    pg.goto(url, wait_until='domcontentloaded', timeout=60000)
    pg.wait_for_function('window.G && G.scene', timeout=40000)
    so = 0
    if cho_ve:
        han = time.time() + 25
        while time.time() < han:
            so = pg.evaluate(VE_DUOC)
            if so >= 12:
                break
            pg.wait_for_timeout(400)
    return pg, so


def chay(goc, chi_doc=False):
    t0 = time.time()
    with sync_playwright() as p:
        kenh = os.environ.get('LK_KENH') or None
        b = p.chromium.launch(channel=kenh) if kenh else p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390})
        host = urlparse(goc).netloc
        ngoai = []

        def chan(route):
            u = urlparse(route.request.url)
            if u.netloc == host or u.netloc in ('fonts.googleapis.com', 'fonts.gstatic.com') or u.scheme in ('data', 'blob'):
                return route.continue_()
            ngoai.append(u.netloc)
            return route.abort()
        ctx.route('**/*', chan)
        hong_anh = []
        ctx.on('response', lambda r: hong_anh.append('%d %s' % (r.status, r.url)) if r.status >= 400 and '/anh/' in r.url else None)
        errs = []

        # 1–2. màn đầu
        pg, so = mo(ctx, goc + '?cloud=0', errs)
        buoc('Mở trang ?cloud=0 không lỗi JS nghiêm trọng', not errs, '; '.join(errs[:3]))
        buoc('Màn đầu vẽ được', so >= 12, '%d màu' % so)
        bid = pg.evaluate('G.BUILD_ID || ""')
        buoc('Có buildId trong trang', bool(bid) or chi_doc, bid or 'không có G.BUILD_ID')
        pg.wait_for_timeout(1500)
        buoc('Không ảnh nào trong anh/ lỗi tải', not hong_anh, '; '.join(hong_anh[:3]))
        why = pg.evaluate("G.cloud ? G.cloud.why : 'không có G.cloud'")
        buoc('?cloud=0 → đám mây tắt (không đụng lưu mây)', why == 'off', why)

        # 3. vào ải 1-1 (bản lưu mới của bài kiểm, đã qua hướng dẫn + mở đủ chức năng để thử đổi vũ khí)
        pg.evaluate("G.resetSave(); G.save.sound = false; G.save.tut.done = true; G.save.moDan = Object.assign({}, G.save.moDan, { cu: true }); G.startStage(0, 0, 0)")
        pg.wait_for_timeout(1200)
        a = pg.evaluate(P_SNAP)
        buoc('Vào ải 1-1', bool(a and a['scene']), a)
        if a and a['scene']:
            pg.keyboard.down('KeyD'); pg.wait_for_timeout(600); pg.keyboard.up('KeyD')
            m = pg.evaluate(P_SNAP)
            buoc('Di chuyển', abs(m['x'] - a['x']) + abs(m['y'] - a['y']) > 8, 'x %.0f → %.0f' % (a['x'], m['x']))
            pg.keyboard.press('KeyJ'); pg.wait_for_timeout(100)
            d = pg.evaluate(P_SNAP)
            buoc('Đánh', d['atkT'] > 0 or d['comboI'] != m['comboI'], 'atkT %.2f' % d['atkT'])
            pg.wait_for_timeout(900)
            pg.keyboard.press('KeyK'); pg.wait_for_timeout(80)
            n = pg.evaluate(P_SNAP)
            buoc('Né (lộn)', n['dodgeT'] > 0, 'dodgeT %.2f' % n['dodgeT'])
            pg.wait_for_timeout(900)
            pg.keyboard.press('KeyQ'); pg.wait_for_timeout(200)
            s = pg.evaluate(P_SNAP)
            buoc('Đổi vũ khí', s['cur'] != n['cur'], 'ô %s → %s (%d món)' % (n['cur'], s['cur'], s['n']))
        buoc('Không lỗi JS khi chơi', not errs, '; '.join(errs[:3]))

        # 4–5. lưu → tải lại (vẫn ?cloud=0, chỉ lưu trên máy)
        pg.evaluate("G.save.gold = 424242; G.persist()")
        pg.reload(wait_until='domcontentloaded')
        pg.wait_for_function('window.G && G.save', timeout=40000)
        pg.wait_for_timeout(800)
        vang = pg.evaluate('G.save.gold')
        buoc('Lưu → tải lại giữ nguyên bản lưu (?cloud=0, lưu trên máy)', vang == 424242, 'vàng %s' % vang)
        pg.close()

        # 6. hai thứ tiếng
        for lg in ('en', 'vi'):
            e2 = []
            pg, so = mo(ctx, goc + '?cloud=0&lang=' + lg, e2)
            ll = pg.evaluate('G.LANG')
            buoc('Ngôn ngữ %s: mở được, vẽ được, không lỗi JS' % lg.upper(), not e2 and so >= 12 and ll == lg, 'LANG=%s, %d màu %s' % (ll, so, '; '.join(e2[:2])))
            pg.close()
        if ngoai:
            print('  (đã chặn %d yêu cầu ra ngoài: %s)' % (len(ngoai), ', '.join(sorted(set(ngoai))[:5])))
        b.close()
    print('Smoke test: %d bước đạt, %d bước hỏng, %.0f giây' % (len(GHI), len(LOI), time.time() - t0))


def main():
    if '--url' in sys.argv:
        goc = sys.argv[sys.argv.index('--url') + 1].rstrip('/') + '/'
        try:
            chay(goc, chi_doc=False)
        except Exception as e:  # noqa: BLE001
            buoc('Trang chạy được tới hết bài kiểm', False, str(e).splitlines()[0][:300])
    else:
        site = os.path.abspath(sys.argv[1])
        if not os.path.isfile(os.path.join(site, 'index.html')):
            sys.exit('HỎNG: %s không có index.html' % site)
        s, goc = may_chu(site)
        try:
            chay(goc)
        except Exception as e:  # noqa: BLE001  (trang không mở được / game không chạy: hết giờ chờ G)
            buoc('Trang chạy được tới hết bài kiểm', False, str(e).splitlines()[0][:300])
        finally:
            s.shutdown()
    if LOI:
        print('HỎNG: ' + ' | '.join(LOI))
        sys.exit(1)
    print('Smoke test: ĐẠT')


if __name__ == '__main__':
    main()
