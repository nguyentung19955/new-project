"""AUDIT khả năng truy cập (phiên au-kien-truc-tiep-can), cỡ 844x390 cảm ứng.
  cd game && python3 tests/au_truy_cap.py
1. Chụp 7 màn (làng, tranh chọn ải, phòng đánh có vùng báo đỏ, lò rèn có đủ 4 bậc vũ khí, bảng kết quả, hành trang, hướng dẫn).
2. Ghi lại MỌI dòng chữ vẽ lên lớp giao diện trong một khung hình (bọc fillText): cỡ chữ thật theo CSS px, màu chữ, vị trí.
3. Chụp lại đúng màn đó khi tạm ẩn chữ để lấy màu nền dưới mỗi dòng chữ -> tính tỉ lệ tương phản WCAG (chữ nhỏ cần >= 4,5).
4. Tạo ảnh giả lập mù màu đỏ-lục (protan, deutan; ma trận Machado 2009, mức nặng nhất) và ảnh xám cho từng màn.
Ảnh: docs/review/anh/truy-cap/*.png   Số liệu: docs/review/anh/truy-cap/truy_cap.json. KHÔNG sửa game."""
import os, json, statistics
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh', 'truy-cap')
DPR = 2

HOOK = r"""
(() => {
  const ft = CanvasRenderingContext2D.prototype.fillText, st = CanvasRenderingContext2D.prototype.strokeText;
  window.__log = null; window.__hide = false;
  CanvasRenderingContext2D.prototype.strokeText = function () { if (this.canvas.id === 'ui' && window.__hide) return; return st.apply(this, arguments); };
  CanvasRenderingContext2D.prototype.fillText = function (s, x, y) {
    if (this.canvas.id === 'ui') {
      if (window.__hide) return;
      if (window.__log && this.fillStyle && typeof this.fillStyle === 'string') {
        const m = this.getTransform(), dpr = window.devicePixelRatio || 1, mm = /([\d.]+)px/.exec(this.font), fs = mm ? parseFloat(mm[1]) : 10;
        const w = this.measureText(String(s)).width; let x0 = x; if (this.textAlign === 'center') x0 -= w / 2; else if (this.textAlign === 'right') x0 -= w;
        window.__log.push({ s: String(s), px: +(fs * m.a / dpr).toFixed(2), color: this.fillStyle, a: this.globalAlpha, bold: /^700/.test(this.font), x: (m.a * x0 + m.e) / dpr, y: (m.d * y + m.f) / dpr, w: w * m.a / dpr });
      }
    }
    return ft.apply(this, arguments);
  };
})();
"""

# Ma trận giả lập mù màu (Machado, Oliveira, Fernandes 2009), mức 1.0, áp trên RGB tuyến tính
PROTAN = np.array([[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]])
DEUTAN = np.array([[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]])


def lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def unlin(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055) * 255


def sim(path, m, out):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float64)
    l = lin(im) @ m.T
    Image.fromarray(unlin(l).astype(np.uint8)).save(out)


def lum(rgb):
    r, g, b = [lin(np.array(float(v))) for v in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = float(lum(a)), float(lum(b))
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def parse_col(s):
    s = s.strip()
    if s.startswith('#'):
        s = s[1:]
        if len(s) == 3:
            s = ''.join(ch * 2 for ch in s)
        return [int(s[i:i + 2], 16) for i in (0, 2, 4)], 1.0
    if s.startswith('rgb'):
        v = [float(t) for t in s[s.index('(') + 1:s.index(')')].split(',')]
        return v[:3], (v[3] if len(v) > 3 else 1.0)
    return None, 1.0


def main():
    os.makedirs(OUT, exist_ok=True)
    res = {'man': {}}
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=DPR)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script(HOOK)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        pg.evaluate("""(() => { G.testSave({ hero: 'smith', lvl: 8, melee: 'sword' }); const sv = G.save;
          for (let r = 0; r < 4; r++) G.newWeapon(sv, G.WKEYS[r], r, { gold: 0 });
          sv.gold = 900; sv.ore = 30; sv.stars = { '0-0': 3, '0-1': 2 }; G.persist(); })()""")
        ui = pg.evaluate("(() => { const r = document.getElementById('ui').getBoundingClientRect(); return [r.left, r.top]; })()")

        def shoot(name):
            pg.wait_for_timeout(250)
            pg.evaluate('window.__hide = true'); pg.wait_for_timeout(120)
            bg = os.path.join(OUT, name + '-nen.png'); pg.screenshot(path=bg)
            pg.evaluate('window.__hide = false; window.__log = []'); pg.wait_for_timeout(60)
            log = pg.evaluate('(() => { const l = window.__log; window.__log = null; return l; })()')
            full = os.path.join(OUT, name + '.png'); pg.screenshot(path=full)
            sim(full, PROTAN, os.path.join(OUT, name + '-protan.png'))
            sim(full, DEUTAN, os.path.join(OUT, name + '-deutan.png'))
            Image.open(full).convert('L').save(os.path.join(OUT, name + '-xam.png'))
            # bỏ trùng (một lần đo có thể dính 2-3 khung), bỏ bóng đổ đen
            seen = set(); rows = []
            bgim = np.asarray(Image.open(bg).convert('RGB')).astype(np.float64)
            H, Wd = bgim.shape[:2]
            for t in log:
                k = (t['s'], round(t['x']), round(t['y']))
                if k in seen or not t['s'].strip():
                    continue
                seen.add(k)
                col, ca = parse_col(t['color'])
                if col is None or (col == [0, 0, 0] and ca < 1):
                    continue
                ux, uy = ui[0] + t['x'], ui[1] + t['y']
                x0, x1 = int(max(0, ux * DPR)), int(min(Wd, (ux + max(2, t['w'])) * DPR))
                y0, y1 = int(max(0, (uy - t['px'] * 0.8) * DPR)), int(min(H, (uy + t['px'] * 0.15) * DPR))
                if x1 <= x0 or y1 <= y0:
                    continue
                reg = bgim[y0:y1, x0:x1].reshape(-1, 3)
                med = np.median(reg, axis=0)
                a = ca * t['a']
                eff = [col[i] * a + med[i] * (1 - a) for i in range(3)]
                rows.append({'s': t['s'][:40], 'px': t['px'], 'mau': t['color'], 'nen': [int(v) for v in med], 'tuong_phan': round(contrast(eff, med), 2), 'dam': t['bold']})
            px = [r['px'] for r in rows]
            res['man'][name] = {
                'so_dong_chu': len(rows), 'co_nho_nhat_px': min(px) if px else None,
                'duoi_10px': sum(1 for v in px if v < 10), 'duoi_12px': sum(1 for v in px if v < 12),
                'tuong_phan_duoi_4_5': sum(1 for r in rows if r['tuong_phan'] < 4.5), 'tuong_phan_duoi_3': sum(1 for r in rows if r['tuong_phan'] < 3),
                'te_nhat': sorted(rows, key=lambda r: r['tuong_phan'])[:8], 'nho_nhat': sorted(rows, key=lambda r: r['px'])[:5],
            }
            os.remove(bg)
            m = res['man'][name]
            print(name, 'dòng', m['so_dong_chu'], 'nhỏ nhất', m['co_nho_nhat_px'], '<12px', m['duoi_12px'], 'tương phản <4.5:', m['tuong_phan_duoi_4_5'], '<3:', m['tuong_phan_duoi_3'])

        pg.evaluate('G.setScene(G.Village)'); pg.wait_for_timeout(500)
        shoot('lang')
        pg.evaluate("G.villageApi.open('lai')"); shoot('chon-ai')
        pg.evaluate("G.villageApi.goHub(); G.villageApi.open('ren')"); shoot('lo-ren')
        pg.evaluate("G.villageApi.goHub(); G.villageApi.open('do'); G.villageApi.V.tab = 'help'; G.villageApi.V.page = 1"); shoot('huong-dan')
        pg.evaluate("G.villageApi.goHub(); G.hanhTrang.openVillage(); G.hanhTrang.tab = 'weapon'"); shoot('hanh-trang')
        # phòng đánh: ải 3 vùng ba (đủ vai quái), chờ tới khi có vùng báo đỏ
        pg.evaluate("G.villageApi.goHub(); G.rnd = G.srand(11); G.startStage(2, 2, 0, { kind: 'A', seed: 5 })")
        for _ in range(60):
            n = pg.evaluate("(() => { const S = G.getRun(); S.P.hp = S.P.maxhp; G.sim(10); return S.W.zones.filter(z => z.team !== 'player' && z.t > 0).length; })()")
            if n >= 2:
                break
        pg.evaluate("(() => { const S = G.getRun(); S.P.hp = S.P.maxhp * 0.25; })()")  # máu thấp: viền đỏ nhịp
        shoot('phong-danh')
        pg.evaluate("(() => { G.winPortal && 0; const S = G.getRun(); })()")
        # bảng kết quả: thắng nhanh bằng bot
        pg.evaluate("(() => { G.rnd = G.srand(3); G.testSave({ hero: 'smith', lvl: 12 }); G.startStage(0, 1, 0, { kind: 'A', seed: 2 }); G.botRun(400); })()")
        if pg.evaluate("(() => { const S = G.getRun(); return S && S.mode; })()") == 'play':
            pg.evaluate("G.usePortal()")
        pg.wait_for_timeout(800)
        shoot('ket-qua')
        res['loi_trang'] = errs[:3]
        b.close()
    allpx = []
    with open(os.path.join(OUT, 'truy_cap.json'), 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
