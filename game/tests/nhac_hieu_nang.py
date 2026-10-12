"""Nhạc có làm tụt khung hình không: chạy vòng lặp thật 8 giây trong phòng trùm (nhạc trùm, nhiều nốt nhất) khi tắt và khi bật nhạc,
đo khoảng cách giữa các khung (requestAnimationFrame) và thời gian JS của bộ lên lịch nhạc. cd game && python3 tests/nhac_hieu_nang.py"""
import os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DO = r"""async (bat) => {
  G.testSave({ lvl: 12 }); G.save.sound = bat; G.save.truyen = { mo: 1, v: 3, n: {} };
  G.startStage(0, 4, 0); G.gotoRoom(G.getRun().map.boss); G.getRun().P.inv = 99;
  G.audioStart();
  let tNhac = 0, nNhac = 0; const f0 = G.nhac.nhip;
  const id = setInterval(() => { const a = performance.now(); f0(); tNhac += performance.now() - a; nNhac++; }, 120);
  const ds = []; let last = performance.now(), run = true;
  const loop = (t) => { ds.push(t - last); last = t; if (run) requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  await new Promise((r) => setTimeout(r, 8000)); run = false; clearInterval(id);
  ds.sort((a, b) => a - b);
  const tb = ds.reduce((a, b) => a + b, 0) / ds.length;
  return { bai: G.nhac.ten, ac: G.amThanh.ac() && G.amThanh.ac().state, khung: ds.length, tb: +tb.toFixed(2), p95: +ds[Math.floor(ds.length * 0.95)].toFixed(2), tren25: ds.filter((x) => x > 25).length, msNhacMoiGiay: +(tNhac / 8).toFixed(2), lanGoi: nNhac };
}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for bat in (False, True, False, True):
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.goto('file://' + ROOT + '/index.html'); pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        print('nhạc bật' if bat else 'nhạc tắt', pg.evaluate(DO, bat))
        pg.close()
    b.close()
