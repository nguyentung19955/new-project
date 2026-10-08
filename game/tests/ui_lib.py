"""Đồ dùng chung cho các bài kiểm tra giao diện: mở game, đổi toạ độ game sang toạ độ màn hình, chạm, giữ, kéo."""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'file://' + ROOT + '/index.html'
SIZES = {
    'phone': dict(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=3),
    'p169': dict(viewport={'width': 667, 'height': 375}, has_touch=True, is_mobile=True, device_scale_factor=3),
    'desk': dict(viewport={'width': 1280, 'height': 720}),
    'port': dict(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=3),
}


class Game:
    def __init__(self, p, size='phone', url=None, fresh=True, init_script=None):
        self.size = size
        self.touch = size != 'desk'
        self.browser = p.chromium.launch()
        self.ctx = self.browser.new_context(**SIZES[size])
        self.pg = self.ctx.new_page()
        self.errs = []
        self.fingers = {}
        self.pg.on('pageerror', lambda e: self.errs.append('PAGEERROR ' + str(e)))
        self.pg.on('console', lambda m: self.errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
        if init_script:
            self.pg.add_init_script(init_script)
        self.pg.goto(url or URL)
        self.pg.wait_for_function('window.G && G.scene')
        self.cdp = self.ctx.new_cdp_session(self.pg)
        if fresh:
            self.ev("G.resetSave(); G.save.sound = false; G.setScene(G.Title)")
        self.wait(120)

    def ev(self, js, arg=None):
        return self.pg.evaluate(js, arg) if arg is not None else self.pg.evaluate(js)

    def wait(self, ms=120):
        self.pg.wait_for_timeout(ms)

    def xy(self, x, y):
        """Toạ độ game (480x270) -> toạ độ màn hình. Khi cầm dọc, khung game xoay 90 độ (khoá ngang) nên đổi theo phép xoay."""
        r = self.ev("""(() => { const st = document.getElementById('stage'), fit = document.getElementById('fit'), sh = document.getElementById('shell');
          if (G.rot) { const s = sh.getBoundingClientRect(); return [1, s.right, s.top, fit.offsetLeft + st.offsetLeft, fit.offsetTop + st.offsetTop, G.scale]; }
          const r = st.getBoundingClientRect(); return [0, r.left, r.top, 0, 0, G.scale]; })()""")
        if r[0]:
            return r[1] - (r[4] + y * r[5]), r[2] + (r[3] + x * r[5])
        return r[1] + x * r[5], r[2] + y * r[5]

    def tap(self, x, y, wait=140):
        cx, cy = self.xy(x, y)
        if self.touch:
            self.pg.touchscreen.tap(cx, cy)
        else:
            self.pg.mouse.click(cx, cy)
        self.wait(wait)

    # chạm nhiều ngón qua CDP; fingers: {id: (x, y)} theo toạ độ game
    def _pts(self, fingers):
        out = []
        for i, (x, y) in fingers.items():
            cx, cy = self.xy(x, y)
            out.append({'x': cx, 'y': cy, 'id': i, 'radiusX': 4, 'radiusY': 4, 'force': 1})
        return out

    def touch_ev(self, kind, fingers):
        self.cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': self._pts(fingers)})

    # Các ngón đang giữ được nhớ trong self.fingers; mỗi lệnh gửi lại đủ danh sách ngón cho trình duyệt.
    def down(self, x, y, fid=0):
        if self.touch:
            self.fingers[fid] = (x, y)
            self.touch_ev('touchStart', self.fingers)
        else:
            cx, cy = self.xy(x, y); self.pg.mouse.move(cx, cy); self.pg.mouse.down()

    def move(self, x, y, fid=0):
        if self.touch:
            self.fingers[fid] = (x, y)
            self.touch_ev('touchMove', self.fingers)
        else:
            cx, cy = self.xy(x, y); self.pg.mouse.move(cx, cy)

    def up(self, fid=None):
        """Nhấc một ngón (fid) hoặc tất cả. Với touchEnd, danh sách gửi đi là các ngón được nhấc."""
        if self.touch:
            if fid is None or len(self.fingers) <= 1:
                self.touch_ev('touchEnd', {}); self.fingers = {}
            else:
                self.touch_ev('touchEnd', {fid: self.fingers.pop(fid)})
        else:
            self.pg.mouse.up()

    def shot(self, path):
        self.wait(200)
        self.pg.screenshot(path=path)

    def close(self):
        self.browser.close()


class Checker:
    def __init__(self, name):
        self.name = name; self.fails = []; self.n = 0

    def ok(self, cond, msg):
        self.n += 1
        if not cond:
            self.fails.append(msg); print('  HỎNG:', msg)
        return cond

    def done(self, g=None):
        if g and g.errs:
            self.fails.append('lỗi trang: ' + '; '.join(g.errs[:3])); print('  LỖI TRANG:', g.errs[:3])
        print(f"[{self.name}] {self.n - len([f for f in self.fails if not f.startswith('lỗi trang')])}/{self.n} đạt" + ('' if not self.fails else f', {len(self.fails)} hỏng'))
        return not self.fails
