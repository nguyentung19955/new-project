#!/usr/bin/env python3
"""In sẵn atlas sprite để game không cần WebGL/Three.js lúc chạy.

Mở Chromium (Playwright) với WebGL phần mềm (SwiftShader), nạp Three.js r128 + lib/rig-lam.js
+ lib/rig-quai-chuong.js, gọi TV.taoAtlasLam / TV.taoAtlasQuaiChuong / TV.taoAtlasBoss rồi ghi:
  art/sprite/lam.png, quai-chuong.png, boss.png   — ảnh atlas
  art/sprite/atlas.json                          — metadata y như object atlas trả về (bỏ canvas)

Nguồn Three.js (theo thứ tự): biến môi trường THREE_JS (đường dẫn file),
game/tools/node_modules/three/build/three.min.js  (npm i --no-save three@0.128.0 trong game/tools),
rồi cdnjs.
Chạy: python3 game/tools/in-atlas.py      (KHÔNG cần chạy "playwright install"; dùng Chromium có sẵn)
"""
import base64, json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
OUT = os.path.normpath(os.path.join(GAME, '..', 'art', 'sprite'))
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

ATLAS = [  # (khóa trong JSON, hàm, file ảnh)
    ('lam', 'taoAtlasLam', 'lam.png'),
    ('quaiChuong', 'taoAtlasQuaiChuong', 'quai-chuong.png'),
    ('boss', 'taoAtlasBoss', 'boss.png'),
]

def three_src():
    p = os.environ.get('THREE_JS')
    if p and os.path.isfile(p):
        return {'path': p}
    p = os.path.join(HERE, 'node_modules', 'three', 'build', 'three.min.js')
    if os.path.isfile(p):
        return {'path': p}
    return {'url': CDN}

JS = """(list) => {
  const out = {};
  for (const [key, fn] of list) {
    if (typeof TV[fn] !== 'function') continue;
    const at = TV[fn](THREE);
    const meta = {};
    for (const k in at) if (k !== 'canvas') meta[k] = at[k];
    out[key] = { meta: JSON.parse(JSON.stringify(meta)), png: at.canvas.toDataURL('image/png'),
                 cw: at.canvas.width, ch: at.canvas.height };
  }
  return out;
}"""

def main():
    os.makedirs(OUT, exist_ok=True)
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist', '--enable-webgl']
    with sync_playwright() as pw:
        exe = '/opt/pw-browsers/chromium'
        kw = {'args': args}
        if not os.path.isfile(exe):
            exe = None
        if exe:
            kw['executable_path'] = exe
        try:
            br = pw.chromium.launch(**kw)
        except Exception:
            kw.pop('executable_path', None)
            br = pw.chromium.launch(**kw)
        page = br.new_page()
        page.set_content('<!doctype html><meta charset="utf-8"><body></body>')
        try:
            page.add_script_tag(**three_src())
        except Exception as e:
            br.close()
            sys.exit('Không nạp được Three.js r128 (' + str(e).splitlines()[0] + ').\n'
                     'Cách sửa: cho phép mạng tới cdnjs.cloudflare.com, hoặc chạy trong game/tools: '
                     'npm i --no-save three@0.128.0, hoặc đặt THREE_JS=/đường/dẫn/three.min.js')
        page.add_script_tag(path=os.path.join(GAME, 'lib', 'rig-lam.js'))
        page.add_script_tag(path=os.path.join(GAME, 'lib', 'rig-quai-chuong.js'))
        if page.evaluate('typeof THREE') != 'object':
            sys.exit('Không nạp được Three.js r128')
        res = page.evaluate(JS, [[k, f] for k, f, _ in ATLAS])
        br.close()

    meta = {}
    for key, fn, fname in ATLAS:
        if key not in res:
            print('bỏ qua', fn, '(không có)')
            continue
        r = res[key]
        png = base64.b64decode(r['png'].split(',', 1)[1])
        open(os.path.join(OUT, fname), 'wb').write(png)
        m = r['meta']
        m['anh'] = fname
        meta[key] = m
        print('Đã ghi', fname, r['cw'], '×', r['ch'], '·', len(m.get('anims', {})), 'anim')
    with open(os.path.join(OUT, 'atlas.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, separators=(',', ':'))
    print('Đã ghi atlas.json →', OUT)

if __name__ == '__main__':
    main()
