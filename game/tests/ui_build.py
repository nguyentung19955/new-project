"""Đóng gói rồi chơi thử cả hai bản trong dist/ bằng điều khiển thật.
Mảnh artifact.html được bọc trong một khung trang tối thiểu giống nơi lưu trữ (có chặn tài nguyên ngoài).
Dùng: python3 tests/ui_build.py [full|frag|all]"""
import sys, os, subprocess, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import *
import ui_input

which = sys.argv[1] if len(sys.argv) > 1 else 'all'
subprocess.run([sys.executable, os.path.join(ROOT, 'build.py')], check=True)
SKELETON = """<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data: blob:">
<style>html, body { height: 100%; margin: 0; } :root { box-sizing: border-box; padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }</style>
<script>window.__bad = []; document.addEventListener('securitypolicyviolation', (e) => window.__bad.push(e.blockedURI + ' ' + e.violatedDirective));
for (const k of ['alert', 'confirm', 'prompt']) window[k] = function () { window.__bad.push('gọi ' + k); };</script>
</head><body>@@MANH@@</body></html>"""
ok = True
with sync_playwright() as p:
    targets = []
    if which in ('full', 'all'):
        targets.append(('linh-khi.html', 'file://' + os.path.join(ROOT, 'dist', 'linh-khi.html')))
    if which in ('frag', 'all'):
        frag = open(os.path.join(ROOT, 'dist', 'artifact.html'), encoding='utf-8').read()
        tmp = os.path.join(tempfile.mkdtemp(), 'khung-thu.html')
        open(tmp, 'w', encoding='utf-8').write(SKELETON.replace("@@MANH@@", frag))
        targets.append(('artifact.html trong khung', 'file://' + tmp))
    for name, url in targets:
        print('==', name)
        g = Game(p, 'phone', url=url)
        c = Checker('nạp ' + name)
        c.ok(g.ev("typeof G.botInput") == 'undefined' and g.ev("typeof G.botRun") == 'undefined' and g.ev("typeof G.testGoto") == 'undefined', 'bản đóng gói không chứa bot chơi thử và đồ dựng sẵn để kiểm tra')
        c.ok(g.ev("document.querySelectorAll('script[src]').length") == 0, 'không nạp JS từ ngoài')
        r = g.ev("(() => { const f = document.getElementById('fit').getBoundingClientRect(), s = document.getElementById('shell'); return [f.width, f.height, innerWidth, innerHeight, getComputedStyle(s).paddingLeft, document.documentElement.scrollHeight, document.documentElement.scrollWidth]; })()")
        c.ok(r[1] == r[3] and r[0] == r[2] - 32 and r[4] == '16px', f'khung game cao bằng màn hình, lề hai bên 16px {r}')
        c.ok(r[5] <= r[3] and r[6] <= r[2], 'trang không cuộn')
        c.ok(g.ev("getComputedStyle(document.documentElement).colorScheme") == 'dark', 'giao diện tối')
        bad = g.ev("window.__bad || []")
        c.ok(not bad, f'không bị chặn tài nguyên, không gọi hộp thoại: {bad}')
        ok &= c.done(g); g.close()
        ok &= ui_input.run(p, 'phone', url)
sys.exit(0 if ok else 1)
