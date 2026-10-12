"""Cắt Hồ Tinh pha 1 (thử), pha 2, pha 3 bằng trang tools/tach-quai (headless).
python3 tach.py <ra_thu_muc> [json cấu hình]
cấu hình: {"hoTinh-p2": {"s": 0.6, "bo": [[x,y],...]}, ...}"""
import json, os, subprocess, sys, time, base64
from playwright.sync_api import sync_playwright

REPO = '/home/claude/new-project'
RA = sys.argv[1]; os.makedirs(RA, exist_ok=True)
CH = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
ANH = {'hoTinh': 'hoTinh-pha1.png', 'hoTinh-p2': 'hoTinh-pha2.png', 'hoTinh-p3': 'hoTinh-pha3.png'}
cong = 8871
sv = subprocess.Popen([sys.executable, '-m', 'http.server', str(cong), '--bind', '127.0.0.1'], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
PATCH = r"""
(() => {
  let src = chay.toString();
  const k = 'for (const t of tiLe) if (t >= tlGiua / 1.5) { s = t; break; }';
  if (src.indexOf(k) < 0) throw new Error('khong tim thay cho va');
  src = src.replace(k, k + ' window._sTu = s; if (window._sEp) s = window._sEp;');
  // _khongEp: mọi khung cùng một tỉ lệ s (không thu nhỏ riêng khung cao), phần vượt mép trên ô thì cắt (giống tấm pha 1 hiện có)
  const a1 = 'const sf = Math.min(s, caoMax / f.h, rongMax / f.w);', a2 = 'if (o[i+3]) tam.set(o.subarray(i, i + 4), ((oy + y) * TW + ox + x) * 4);';
  if (src.indexOf(a1) < 0 || src.indexOf(a2) < 0) throw new Error('khong tim thay cho dat hinh');
  src = src.replace(a1, 'const sf = window._khongEp ? s : Math.min(s, caoMax / f.h, rongMax / f.w); if (window._khongEp && caoMax / f.h < s) (window._cat = window._cat || []).push((r + 1) + "." + (c + 1) + ":" + Math.round(f.h * s - caoMax));');
  src = src.replace(a2, 'if (o[i+3] && (!window._khongEp || (oy + y >= r * FH + 2 * N && ox + x >= c * FW + 2 * N && ox + x < (c + 1) * FW - 2 * N))) tam.set(o.subarray(i, i + 4), ((oy + y) * TW + ox + x) * 4);');
  src = src.replace('const k = tuTim(A, coAlpha);', 'const k = tuTim(A, coAlpha); window._hinh = k.hinh; window._khung = k.khung;');
  (0, eval)('chay = (' + src + ')');
  let t = tuTim.toString(); const m = 'const MONG = Math.max(6, Math.round(0.015 * Math.max(W, H)));';
  if (t.indexOf(m) < 0) throw new Error('khong tim thay MONG');
  t = t.replace(m, 'const MONG = window._MONG || Math.max(6, Math.round(0.015 * Math.max(W, H)));');
  (0, eval)('tuTim = (' + t + ')');
})();
"""
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(); errs = []
        pg = b.new_page(viewport={'width': 900, 'height': 1400})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:%d/tools/tach-quai/index.html' % cong)
        pg.wait_for_function('typeof QUAI !== "undefined"')
        pg.evaluate('napTrum()'); pg.wait_for_timeout(1500)
        pg.evaluate(PATCH)
        kq = {}
        for ma, tep in ANH.items():
            if CH.get('chi') and ma not in CH['chi']: continue
            c = CH.get(ma, {})
            i = pg.evaluate('(m) => QUAI.findIndex((q) => q.ma === m)', ma)
            pg.select_option('#chonQuai', str(i))
            pg.evaluate('([s, m, k]) => { window._sEp = s; window._MONG = m; window._khongEp = !!k; window._cat = []; }', [c.get('s'), CH.get('mong'), c.get('khongEp')])
            pg.evaluate('() => { KQ = null; document.getElementById("buoc3").hidden = true; }')
            pg.set_input_files('#chonAnh', c.get('anh') or os.path.join(REPO, 'docs/anh-goc/2026-10-12', tep))
            pg.wait_for_function('KQ && !document.getElementById("buoc3").hidden'); pg.wait_for_timeout(300)
            if c.get('bo'):
                pg.evaluate('(bo) => { BO = bo; chay(); }', c['bo']); pg.wait_for_timeout(200)
            o = pg.evaluate('''() => ({ locDom: document.getElementById('locDom').checked, net: NET(), soMau: document.getElementById('soMau').value,
                s: window._sTu, cat: window._cat, sDung: window._sEp || window._sTu, dat: KQ.dat, so: SO.slice(), Q: { fw: Q.fw, fh: Q.fh, gx: Q.gx, gy: Q.gy, rong: Q.rong, cao: Q.cao },
                kiem: [...document.querySelectorAll('#dsKiem li')].map((l) => (l.className === 'loi' ? 'LỖI: ' : '') + l.textContent),
                khung: (window._khung || []).map((k) => [k.r, k.c, k.f.x0, k.f.y0, k.f.x1, k.f.y1]), tep: taoTep() })''')
            tep_o = o.pop('tep')
            json.dump(tep_o, open(os.path.join(RA, ma + '.sprite.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
            open(os.path.join(RA, ma + '.png'), 'wb').write(base64.b64decode(tep_o['tam'].split(',')[1]))
            pg.locator('#cvGoc').screenshot(path=os.path.join(RA, ma + '-goc.png'))
            kq[ma] = o
        kq['loi'] = errs
        json.dump(kq, open(os.path.join(RA, 'kq.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(json.dumps({k: (v if k == 'loi' else {x: v[x] for x in ('s', 'cat', 'sDung', 'dat', 'so', 'locDom', 'net', 'kiem')}) for k, v in kq.items()}, ensure_ascii=False, indent=1))
        b.close()
finally:
    sv.kill()
