"""Đo nhạc nền (js/nhac.js) mà không cần loa: dựng từng bài vào OfflineAudioContext 16 giây, đo đỉnh và độ to trung bình (RMS),
số nốt mỗi giây; đo tiếng chiêng mới. Đỉnh phải < 1 (không rè). cd game && python3 tests/nhac_do.py"""
import os, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = r"""async () => {
  const out = {};
  const do1 = async (ten, fn) => {
    const sr = 22050, ac = new OfflineAudioContext(1, sr * 16, sr);
    fn(ac);
    const b = await ac.startRendering(), d = b.getChannelData(0);
    let pk = 0, s = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; s += d[i] * d[i]; }
    out[ten] = { dinh: +pk.toFixed(3), rms: +Math.sqrt(s / d.length).toFixed(4) };
  };
  for (const ten of Object.keys(G.nhac.BAI)) await do1(ten, (ac) => G.nhac.thuBai(ac, ten, 15.5));
  await do1('chieng', (ac) => G.nhac.thuChieng(ac, 98, 0.144));
  for (const ten of Object.keys(G.nhac.BAI)) { const B = G.nhac.BAI[ten]; let n = 0, L = 0; for (const v of B.vong) { for (const o of v.theoO) n += o.length; L += v.len; } out[ten].notMoiGiay = +(n / (L * 60 / B.bpm / 2)).toFixed(1); }
  return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + ROOT + '/index.html'); pg.wait_for_function('window.G && G.nhac && G.scene')
    r = pg.evaluate(JS)
    for k, v in r.items(): print(k, v)
    print('lỗi trang:', errs)
    b.close()
