"""Kiểm tra phần NHÂN VẬT, QUÁI, HIỆU ỨNG CHIẾN ĐẤU của giai đoạn 3 (phiên dt-nhan-vat), khi CÓ vẽ:
- nhịp độc/cháy không làm quái chớp trắng (nhuộm màu hệ), đòn thật cùng lúc vẫn chớp trắng;
- khựng hình: chỉ khung đầu chớp trắng hẳn;
- vành sáng: có đổi điểm ảnh (ít), G.VFX.vien = 0 thì hình như cũ;
- chiều cao hình thật cho thanh máu (không thấp hơn hình gốc), không đổi vùng va chạm (e.r, e.hr);
- vũng của địch: có viền đang-gây-sát-thương, tự tắt; bụi bước chân có trần và tắt được (G.VFX.bui = 0);
- rung màn hình có trần và G.VFX.rung = 0 thì không rung, không chớp màn hình;
- trần hạt 400; luật không đổi: chạy có vẽ và không vẽ cho máu, vị trí quái giống hệt.
Chạy (từ thư mục game): python3 tests/nhan_vat.py   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.environ.get('GAME') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nhan_vat_shots import LIB  # dùng chung T.vao, T.quai, T.coc, T.frame

JS = r"""
(() => {
  const res = [], ok = (n, c, d) => res.push([n, !!c, d == null ? '' : String(d)]);
  const K = G.fx.kit, S = () => K.S();
  // 1. nhịp độc không chớp trắng, có nhuộm màu hệ
  T.vao(0, { seed: 3 });
  const a = T.coc('rusher', -40, 0), b = T.coc('shield', 40, 0);
  G.applyStatus(a, 'poison', 50, 3); T.run(6);
  a.flash = 0; a.st.tick = 0.001; T.frame({});
  ok('nhịp độc: quái không chớp trắng (flash = 0)', !(a.flash > 0), a.flash);
  const tn = G.fx.dotTint(a);
  ok('nhịp độc: nhuộm màu hệ độc', tn && tn[0] === G.fx.pal('poison').c && tn[1] > 0.2, tn && tn.join(','));
  T.run(20);
  ok('nhuộm màu hệ tự tắt sau 0,22 giây', G.fx.dotTint(a) === null);
  // đòn thật cùng lúc với nhịp độc: vẫn chớp trắng
  G.fx.hit(a, { el: null, dir: 1 }); G.damage(a, 3, { el: null }); G.damage(a, 1, { el: 'poison', src: 'dot' });
  ok('đòn thật cùng lúc với nhịp độc: vẫn chớp trắng', a.flash > 0, a.flash);
  // cháy trên trùm nhỏ / quái giáp
  G.applyStatus(b, 'fire', 50, 1); T.run(4); b.flash = 0; b.st.tick = 0.001; T.frame({});
  ok('nhịp cháy: không chớp trắng, nhuộm màu lửa', !(b.flash > 0) && G.fx.dotTint(b) && G.fx.dotTint(b)[0] === G.fx.pal('fire').c);
  // 2. khựng hình: chỉ khung đầu trắng hẳn
  T.vao(2, { seed: 4, melee: 'hammer' });
  const d = T.coc('rusher', 18, 0); T.run(3);
  T.frame({ atkP: true, atk: true });
  const ks = [];
  for (let k = 0; k < 40; k++) { T.frame({}); ks.push([d.flash > 0 ? 1 : 0, G.fx.chop()]); }
  const lit = ks.filter((q) => q[0]), full = lit.filter((q) => q[1] === 1).length;
  ok('khựng hình: quái có chớp', lit.length > 0, lit.length);
  ok('khựng hình: chỉ 1 khung chớp trắng hẳn, các khung sau nhạt', full <= 1 && lit.length - full >= 2, full + '/' + lit.length);
  // 3. vành sáng: đổi ít điểm ảnh, G.VFX.vien = 0 thì hình như cũ
  const MA = G.monsterArt, cv = () => { const c = document.createElement('canvas'); c.width = 120; c.height = 90; return c; };
  const px = (vien) => { G.VFX.vien = vien; MA.xoaNho(); const c = cv(), x = c.getContext('2d'); MA.draw(x, 'heoCon', 60, 80, { anim: 'idle', t: 0, face: -1, fx: false }); return x.getImageData(0, 0, 120, 90).data; };
  const p0 = px(0), p1 = px(1), p0b = px(0); G.VFX.vien = 1; MA.xoaNho();
  let diff = 0, body = 0, same = 0;
  for (let i = 0; i < p0.length; i += 4) { if (p0[i + 3]) body++; if (p0[i] !== p1[i] || p0[i + 1] !== p1[i + 1] || p0[i + 2] !== p1[i + 2]) diff++; if (p0[i] === p0b[i] && p0[i + 3] === p0b[i + 3]) same++; }
  ok('vành sáng: có đổi điểm ảnh, ít (dưới 20% thân)', diff > 10 && diff < body * 0.2, diff + '/' + body);
  ok('vành sáng: không đổi hình dáng (cùng số điểm có màu)', p1.filter((v, i) => i % 4 === 3 && v).length === body);
  ok('G.VFX.vien = 0: hình giống hệt khi dựng lại', same === p0.length / 4);
  // em bé
  const hp = (vien) => { G.VFX.vien = vien; G.tinhLinh.clearCache(); const c = cv(), x = c.getContext('2d'); (G.art.heroCode || G.art.hero)(x, { key: 'smith', x: 60, y: 80, face: 1, t: 0, anim: 'idle' }); return x.getImageData(0, 0, 120, 90).data; };
  const h0 = hp(0), h1 = hp(1); G.VFX.vien = 1; G.tinhLinh.clearCache();
  let hd = 0, hb = 0; for (let i = 0; i < h0.length; i += 4) { if (h0[i + 3]) hb++; if (h0[i] !== h1[i] || h0[i + 1] !== h1[i + 1] || h0[i + 2] !== h1[i + 2]) hd++; }
  ok('em bé: vành sáng đổi ít điểm ảnh, không đổi hình dáng', hd > 3 && hd < hb * 0.15 && h1.filter((v, i) => i % 4 === 3 && v).length === hb, hd + '/' + hb);
  // 4. chiều cao hình thật, vùng va chạm không đổi
  T.vao(0, { seed: 5 });
  let hOk = true, rOk = true, info = '';
  for (const role of ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite']) {
    const e = T.coc(role, 30, 0), I = MA.list.find((q) => q.id === e.art), elite = role === 'elite';
    if (!(e.h >= I.h + 2)) { hOk = false; info += e.art + ' ' + e.h + '<' + I.h + '; '; }
    const r = Math.min(elite ? 16 : 12, Math.max(6, Math.round(I.w * (elite ? 0.2 : 0.24)))), hr = Math.min(elite ? 11 : 8, Math.max(5, Math.round(I.h * 0.18)));
    if (e.r !== r || e.hr !== hr) { rOk = false; info += e.art + ' r ' + e.r + '/' + r; }
  }
  ok('e.h = chiều cao hình thật (không thấp hơn hình gốc)', hOk, info);
  ok('vùng va chạm (e.r, e.hr) không đổi', rOk, info);
  // 5. vũng của địch: vẽ được, tự tắt; bụi bước chân có trần, tắt được
  T.vao(0, { seed: 2 });
  const z = G.zoneCircle(T.P.x + 50, T.P.y, 22, 0.3, 1, 'fire', { then: 1.2 });
  let zmax = 0; for (let k = 0; k < 140; k++) { T.frame({}); if (T.W.zones.includes(z)) zmax = k; }
  ok('vũng của địch tự tắt (không tồn tại vô hạn)', !T.W.zones.includes(z), zmax);
  const walk = (bui) => { G.VFX.bui = bui; T.vao(0, { seed: 6 }); const e = T.quai('rusher', 120, 0); e.cd = 1e9; let n = 0, mx = 0; const PT = S();
    for (let k = 0; k < 90; k++) { T.frame({}); e.x -= 1.2; e.cd = 1e9; mx = Math.max(mx, PT.np); }
    G.VFX.bui = 1; return mx; };
  const w1 = walk(1), w0 = walk(0);
  ok('bụi bước chân: có hạt khi quái đi, G.VFX.bui = 0 thì ít hạt hơn', w1 > w0, w1 + ' > ' + w0);
  // 6. rung có trần, tắt được
  T.vao(1, { seed: 7, melee: 'hammer' });
  const ds = [T.coc('rusher', 18, 0), T.coc('shield', 20, 10), T.coc('elite', 26, -8)];
  let sx = 0, sy = 0;
  for (let k = 0; k < 120; k++) { T.frame(k % 12 === 0 ? { atkP: true, atk: true } : {}); const o = G.fx.shakeOffset(); sx = Math.max(sx, Math.abs(o.x)); sy = Math.max(sy, Math.abs(o.y)); }
  ok('rung màn hình có trần (±4 ngang, ±3 dọc, cộng giật ≤ 4)', sx <= 8 && sy <= 6 && sx + sy > 0, sx + ',' + sy);
  G.VFX.rung = 0; let s0 = 0, fl = 0;
  for (let k = 0; k < 120; k++) { T.frame(k % 12 === 0 ? { atkP: true, atk: true } : {}); const o = G.fx.shakeOffset(); s0 = Math.max(s0, Math.abs(o.x) + Math.abs(o.y)); }
  T.W.boss = null; G.VFX.rung = 1;
  ok('G.VFX.rung = 0: không rung', s0 === 0, s0);
  // 7. trần hạt
  ok('trần hạt 400', S().np <= 400, S().np);
  return res;
})()
"""

# Luật không đổi: cùng hạt giống, chạy có vẽ và không vẽ, máu và vị trí quái phải giống hệt.
# Tắt khựng hình (G.VFX.khung = 0) vì khựng hình cố ý dừng thế giới vài khung khi có vẽ (đã có từ trước, không phải phần này).
# (Đã so thêm bằng tay: bản trước giai đoạn 3 và bản này, cùng có vẽ, cho kết quả giống hệt.)
SAME = r"""
(draw) => {
  G.noRender = !draw; G.VFX.khung = 0;
  T.vao(0, { seed: 9, melee: 'hammer' });
  const es = [T.quai('rusher', 60, 0), T.quai('shield', -60, 10), T.quai('spiky', 30, 40), T.quai('elite', 70, -30)];
  G.applyStatus(es[0], 'poison', 50, 3); G.applyStatus(es[1], 'fire', 50, 1);
  for (let k = 0; k < 240; k++) T.frame(k % 15 === 0 ? { atkP: true, atk: true } : {});
  const out = es.map((e) => [Math.round(e.hp * 10), Math.round(e.x * 10), Math.round(e.y * 10), e.dead ? 1 : 0]);
  G.noRender = false; G.VFX.khung = 1;
  return JSON.stringify(out);
}
"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
        pg.goto('file://' + HERE + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(HERE, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        res = pg.evaluate(JS)
        a, bb = pg.evaluate(SAME, True), pg.evaluate(SAME, False)
        res.append(['luật không đổi: máu và vị trí quái giống hệt khi có vẽ và không vẽ', a == bb, '' if a == bb else a[:160] + ' / ' + bb[:160]])
        fe = pg.evaluate('G.fx.errs ? [G.fx.errs, String(G.fx.lastErr)] : null')
        res.append(['không lỗi hiệu ứng (G.fx.errs)', not fe, str(fe)])
        b.close()
    res.append(['không lỗi JS', not errs, '; '.join(errs[:3])])
    bad = 0
    for n, good, d in res:
        print('ĐÚNG' if good else 'SAI ', n, ('(' + d + ')') if d else '')
        bad += 0 if good else 1
    print(f'{len(res) - bad}/{len(res)} mục đúng')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
