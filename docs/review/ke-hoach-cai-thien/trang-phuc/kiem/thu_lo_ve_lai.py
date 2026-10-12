"""Thử 2 lô "VẼ LẠI 12/10" của trang tools/tach-do bằng ảnh lưới máy vẽ (chưa có ảnh ChatGPT thật):
vẽ lưới đúng như prompt (nền đúng màu, mỗi ô một khối có viền tối, đúng tỉ lệ rộng/cao của món), thả vào trang, đọc tệp xuất của từng ô.
Kiểm: đủ món, đúng mã tệp, nét gấp đôi, cỡ trong game gần cỡ chuẩn, điểm đỉnh đầu của mũ cách mép dưới đúng số đã định, prompt có LUẬT VẼ CHUNG.
Chạy từ gốc repo:  python3 -m http.server 8782 &   rồi   python3 docs/review/ke-hoach-cai-thien/trang-phuc/kiem/thu_lo_ve_lai.py"""
import os, sys, json, tempfile
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8782/tools/tach-do/index.html'

def luoi(lo, path):
    cot, hang, nen = lo['cot'], lo['hang'], (255, 0, 255) if not lo['nenXanh'] else (0, 255, 0)
    C = 220; im = Image.new('RGB', (cot * C, hang * C), nen); d = ImageDraw.Draw(im)
    for i, m in enumerate(lo['ds']):
        cx, cy = (i % cot) * C + C // 2, (i // cot) * C + C // 2
        k = 0.7 * C / max(m['w'], m['h']); w, h = m['w'] * k, m['h'] * k
        d.rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=(27, 17, 24))
        d.rectangle([cx - w / 2 + 8, cy - h / 2 + 8, cx + w / 2 - 8, cy + h / 2 - 8], fill=tuple(int(m['mau'][0][j:j + 2], 16) for j in (1, 3, 5)))
    for x in range(1, cot): d.line([x * C, 0, x * C, hang * C], fill=(30, 30, 30), width=2)
    for y in range(1, hang): d.line([0, y * C, cot * C, y * C], fill=(30, 30, 30), width=2)
    im.save(path)

def main():
    loi = []; out = []; DU = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1100, 'height': 900})
        pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(1500)
        for lid in ('tp-hats-ve-lai', 'tp-backs-ve-lai'):
            lo = pg.evaluate("(id) => { const i = LO.findIndex((l) => l.id === id); const s = document.getElementById('chonLo'); s.value = i; s.dispatchEvent(new Event('change')); const l = LO[i]; return { cot: l.cot, hang: l.hang, nenXanh: l.nenXanh, ds: l.ds.map((m) => ({ ma: m.ma, w: m.w, h: m.h, mau: m.mau, duoi: m.duoi })) , prompt: document.getElementById('oPrompt').value }; }", lid)
            f = os.path.join(tempfile.mkdtemp(), lid + '.png'); luoi(lo, f)
            pg.set_input_files('#chonAnh', f); pg.wait_for_timeout(2500)
            tepDu = pg.evaluate("() => L.ds.map((m, i) => KQ[i] ? phanTep(i, false) : null).filter(Boolean)")
            DU.extend(tepDu)
            tep = pg.evaluate("() => L.ds.map((m, i) => { if (!KQ[i]) return { ma: m.ma, thieu: true }; const t = phanTep(i, true); return { ma: t.ma, rong: t.rong, cao: t.cao, net: t.net || 1, tp: t.trang_phuc }; })")
            ok = True
            for m, t in zip(lo['ds'], tep):
                d = []
                if t.get('thieu'): d.append('THIẾU')
                else:
                    if t['ma'] != m['ma']: d.append('sai mã')
                    if t['net'] != 2: d.append('net %s' % t['net'])
                    if abs(t['rong'] - m['w']) > 2 or abs(t['cao'] - m['h']) > 2: d.append('cỡ %sx%s (chuẩn %sx%s)' % (t['rong'], t['cao'], m['w'], m['h']))
                    if m.get('duoi') is not None:
                        y = t['tp']['diem']['dinh_dau'][1]
                        if abs((t['cao'] - y) - m['duoi']) > 1.01: d.append('đỉnh đầu cách mép dưới %s (muốn %s)' % (t['cao'] - y, m['duoi']))
                ok = ok and not d
                out.append('%s: %s %s' % (lid, m['ma'], 'ĐẠT' if not d else '; '.join(d)))
            out.append('%s: prompt có LUẬT VẼ CHUNG: %s; có câu ảnh tham chiếu: %s; dài %d ký tự' % (lid, 'LUẬT VẼ CHUNG CỦA GAME' in lo['prompt'], 'ẢNH THAM CHIẾU' in lo['prompt'], len(lo['prompt'])))
        # nạp các tệp vừa xuất vào game: mũ phải ở trên mắt, chỉnh cỡ tạm (TP_CHINH) tự thôi áp vì cỡ ảnh đã khác
        g = b.new_page(); g.on('pageerror', lambda e: loi.append('game: ' + str(e)))
        g.goto('http://localhost:8782/game/dist/linh-khi.html?cloud=0')
        g.wait_for_function("window.G && G.scene && G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds['em-be-smith']", timeout=90000)
        g.wait_for_timeout(800)
        r = g.evaluate("""async (ds) => { const SC = G.spriteCustom; for (const t of ds) SC.add(t); await new Promise((r) => setTimeout(r, 600)); G.tinhLinh.clearCache();
          const out = []; for (const t of ds) { if (!/^tp-hats-/.test(t.ma)) { const p = SC.datDo('hunter', t.ma, 'idle', 0); out.push([t.ma, p && p.rong, p && p.cao, p && p.y, null]); continue; }
            for (const k of ['smith', 'hunter', 'healer', 'wrestler']) { const p = SC.datDo(k, t.ma, 'idle', 0), n = SC.diemNhanVat(k, 'idle', 0); out.push([t.ma + ' ' + k, p.rong, p.cao, p.y + p.cao * p.sy, n.diem.mat[1], p.sx]); } }
          return out; }""", DU)
        for q in r:
            if q[4] is None: out.append('game: %s cỡ %sx%s, mép trên y=%s' % tuple(q[:4]))
            else: out.append('game: %s mép dưới mũ y=%.1f, mắt y=%s -> %s; hệ số co %s' % (q[0], q[3], q[4], 'không che mắt' if q[3] <= q[4] - 1 else 'CHE MẮT', q[5]))
        b.close()
    print('\n'.join(out)); print('pageerror:', loi or 'không có')

main()
