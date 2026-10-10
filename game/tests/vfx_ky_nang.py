"""Kiểm tra hiệu ứng KỸ NĂNG (js/fx_ky_nang.js, js/fx_chuong.js, js/fx_dan.js, phần độc trong js/fx.js, js/bao_truoc.js):
không lỗi JS, không vượt trần hạt/hình, hình nào cũng tự tắt, G.VFX.hat = 0 thì không sinh hạt độc, G.VFX.rung = 0 thì không rung,
bậc cường độ tăng dần, vùng báo bị huỷ thì mờ dần rồi biến mất, không đổi luật (vị trí đạn, thời gian vùng).
Chạy: python3 tests/vfx_ky_nang.py   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tests'))
from vfx_ky_nang_shots import LIB  # noqa: E402

JS = r"""
() => {
  const out = [], ok = (n, c, d) => out.push([n, !!c, d == null ? '' : String(d)]);
  const st = () => G.fx.stats();
  let maxP = 0, maxE = 0;
  const run = (i, n) => { for (let k = 0; k < n; k++) { T.frame(k === 0 ? i : null); T.P.hp = T.P.maxhp; const s = st(); if (s) { maxP = Math.max(maxP, s.parts); maxE = Math.max(maxE, s.fx); } } };
  ok('có fx.kyNang và fx.capDo', G.fx.kyNang && G.fx.capDo);
  // bậc cường độ tăng dần
  const C = G.fx.capDo, L = ['thuong', 'chiMang', 'kyNang', 'toiThuong'];
  ok('bậc rung: thường < chí mạng < tối thượng', C.thuong.rung < C.chiMang.rung && C.chiMang.rung < C.toiThuong.rung);
  ok('bậc hạt: thường < kỹ năng < tối thượng', C.thuong.hat < C.kyNang.hat && C.kyNang.hat < C.toiThuong.hat);
  ok('chỉ tối thượng mới chớp màn hình', L.every((k) => (k === 'toiThuong') === (C[k].chop > 0)));
  // ba cây chưởng, thường và tích lực
  for (const cay of ['hoa', 'doc', 'bang']) {
    T.room({ cay, n: { luc: 3, no: 3, vet: 3, may: 3, tach: 3, xuyen: 3, phong: 2, tich: 3 }, dum: [[60, 0], [76, 12], [96, -8]] });
    run({ skillP: true, skill: true }, 1); run(cay === 'hoa' ? { skill: true } : {}, 70); run({}, 220);
    ok('chưởng ' + cay + ': không lỗi hiệu ứng', !G.fx.errs, G.fx.lastErr);
  }
  ok('chưởng: trần hạt 400, trần hình 72', maxP <= 400 && maxE <= 72, maxP + ' / ' + maxE);
  // vòng phép tự tắt
  T.room({ dum: [] });
  run({}, 5);
  const e0 = st().fx;
  G.fx.rune(T.P.x + 40, T.P.y, 30, 'fire', 0.5, 6, 2);
  ok('vòng phép: thêm một hình', st().fx === e0 + 1, st().fx + ' / ' + e0);
  run({}, 40);
  ok('vòng phép: tắt sau thời gian sống', st().fx <= e0, st().fx + ' / ' + e0);
  // độc: dính độc, hào quang, nhịp; G.VFX.hat = 0 thì không sinh hạt
  T.room({ dum: [[60, 0]] });
  const e = T.dum[0];
  G.applyStatus(e, 'poison', 50, 3); run({}, 90);
  ok('độc: không lỗi khi trúng độc 3 tầng', !G.fx.errs, G.fx.lastErr);
  const hat0 = G.VFX.hat;
  G.VFX.hat = 0;
  T.room({ dum: [[60, 0]] }); run({}, 30);
  const p0 = st().parts;
  G.applyStatus(T.dum[0], 'poison', 50, 5); run({}, 1);
  const pDinh = st().parts;
  // nhịp độc: các hạt có sẵn (bước chân, bụi) vẫn tan dần, chỉ đếm hạt mới
  T.dum[0].st.tick = 0.0001; run({}, 1);
  const pNhip = st().parts;
  run({}, 60);
  G.VFX.hat = hat0;
  ok('G.VFX.hat = 0: lúc dính độc không thêm hạt', pDinh <= p0, p0 + ' -> ' + pDinh);
  ok('G.VFX.hat = 0: nhịp độc không thêm hạt', pNhip <= pDinh, pDinh + ' -> ' + pNhip);
  ok('G.VFX.hat = 0: hạt về 0 khi đứng yên', st().parts <= 2, st().parts);
  // G.VFX.rung = 0: chưởng tích lực không rung, không chớp
  const rung0 = G.VFX.rung;
  G.VFX.rung = 0;
  T.room({ cay: 'hoa', n: { luc: 3, tich: 3 }, dum: [[60, 0]] });
  run({ skillP: true, skill: true }, 1); run({ skill: true }, 70);
  let maxTr = 0, maxFl = 0;
  for (let k = 0; k < 60; k++) { T.frame(k === 0 ? {} : null); const S = G.fx.state(); maxTr = Math.max(maxTr, S.trauma); maxFl = Math.max(maxFl, S.flash); }
  G.VFX.rung = rung0;
  // (luật vẫn đặt W.shake = 0,22 khi nổ to, js/fx.js đổi thành độ rung ~0,39: phần đó không thuộc tệp hiệu ứng kỹ năng)
  ok('G.VFX.rung = 0: chưởng tích lực không thêm rung, không chớp', maxTr < 0.42 && maxFl === 0, maxTr.toFixed(3) + ' / ' + maxFl);
  // tên: lõi sáng và hạt bám đường bay có trần (mỗi mũi tối đa 6 hạt)
  T.room({ hero: 'hunter', bow: true, dum: [[140, 0]] });
  const arrows = [];
  run({ atk: true, atkP: true }, 1); run({ atk: true }, 6);
  for (let k = 0; k < 20; k++) { run({}, 1); for (const o of T.W.projs) if (o.team === 'player' && !arrows.includes(o)) arrows.push(o); }
  ok('tên: có mũi tên đang bay', arrows.length > 0, arrows.length);
  run({}, 60);
  ok('tên: số hạt bám mỗi mũi không quá 6', arrows.every((o) => (o.kyN | 0) <= 6), arrows.map((o) => o.kyN).join(','));
  ok('tên: không lỗi hiệu ứng', !G.fx.errs, G.fx.lastErr);
  // báo trước bị huỷ: mờ dần rồi biến mất
  T.room({ dum: [] });
  const P = T.P, z = { shape: 'cone', x: P.x + 20, y: P.y, ang: 0, r: 70, span: 1, t: 1, t0: 1, dmg: 0, life: 0.12, el: null };
  T.W.zones.push(z); run({}, 20);
  const tLeft = z.t;
  ok('báo trước: vẽ không đổi thời gian của vùng', Math.abs(tLeft - (1 - 20 / 60)) < 0.02, tLeft.toFixed(3));
  z.src = { dead: true }; z.cancel = true; run({}, 2);
  ok('báo trước: đòn bị huỷ thì còn hình mờ dần', G.baoTruoc.gone.length === 1, G.baoTruoc.gone.length);
  run({}, 15);
  ok('báo trước: hình mờ biến mất sau ~0,16 giây', G.baoTruoc.gone.length === 0, G.baoTruoc.gone.length);
  const z2 = { shape: 'line', x: P.x + 20, y: P.y, ang: 0, len: 80, w: 14, t: 0.3, t0: 0.3, dmg: 0, life: 0.12, el: null };
  T.W.zones.push(z2); run({}, 30);
  ok('báo trước: đòn nổ thật thì không có hình huỷ', G.baoTruoc.gone.length === 0, G.baoTruoc.gone.length);
  ok('báo trước: không lỗi', !G.baoTruoc.errs, G.baoTruoc.errs);
  // chạy không vẽ: không sinh hình
  G.noRender = true;
  const before = G.fx.state() ? G.fx.state().E.length : 0;
  G.fx.rune(0, 0, 10, 'fire'); G.fx.status(T.P, 'poison'); G.fx.chBoom('hoa', 100, 100, 20, { big: 1 });
  const after = G.fx.state() ? G.fx.state().E.length : 0;
  G.noRender = false;
  ok('chạy không vẽ: không sinh hình', before === after, before + ' -> ' + after);
  ok('không lỗi hiệu ứng (toàn bài)', !G.fx.errs, G.fx.lastErr);
  ok('không lỗi JS', !T.errs.length, T.errs.join(' | '));
  return out;
}
"""

# Luật không đổi: cùng hạt giống, chạy có vẽ và không vẽ, đường bay của chưởng phải giống hệt
SAME = r"""
(draw) => {
  G.noRender = !draw;
  T.room({ cay: 'hoa', n: { luc: 3, no: 3, tich: 3 }, dum: [[90, 0], [100, 14]], seed: 9 });
  const pos = [];
  for (let k = 0; k < 90; k++) { T.frame(k === 0 ? { skillP: true, skill: true } : k < 50 ? { skill: true } : {}); const q = (T.W.chs || [])[0]; if (q) pos.push(Math.round(q.x * 100) / 100); }
  const hp = T.dum.map((e) => Math.round(e.hp));
  G.noRender = false;
  return JSON.stringify([pos, hp]);
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
        res.append(['luật không đổi: đường bay và máu quái giống hệt khi có vẽ và không vẽ', a == bb, '' if a == bb else a[:120] + ' / ' + bb[:120]])
        b.close()
    bad = 0
    for n, good, d in res:
        print(('ĐÚNG ' if good else 'SAI  ') + n + ((' — ' + d) if d and not good else ''))
        bad += 0 if good else 1
    for e in errs:
        print('LỖI TRANG:', e)
    bad += len(errs)
    print('%d/%d mục đúng' % (len(res) - (bad - len(errs)), len(res)))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
