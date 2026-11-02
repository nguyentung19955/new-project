import json, sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1]
SIZES = [('844x390@3', 844, 390, 3), ('932x430@3', 932, 430, 3), ('960x540@1', 960, 540, 1)]
SAVE = """(() => { G.resetSave(); const s = JSON.parse(JSON.stringify(G.save)); delete s.moDan; s.sound = false; s.truyen = { mo: 1, v: 3, n: {} }; s.tut.done = true;
  s.stars = { '0-0': 3, '0-1': 3, '0-2': 3, '1-0': 3 }; s.heroes[s.hero].lvl = 12; localStorage.setItem(G.SAVE_KEY, JSON.stringify(s)); return true; })()"""
DO = """() => { const U = G.stageUi, sc = G.scale, S = G.getRun(), B = U.boCuc(), out = { sc, nut: {}, gapMin: 1e9 };
  const ten = ['atk', 'dodge', 'special', 'skill', 'potion'].filter(n => B[n] && (n !== 'special' || G.moDan.co('dacBiet')) && (n !== 'skill' || G.moDan.co('chuong')));
  for (const n of ten) { const b = B[n];
    // vùng chạm thật: quét lưới 0,5 đơn vị quanh nút, lấy khung bao các điểm nutTai trả về đúng tên nút
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let x = b[0] - 60; x <= b[0] + 60; x += 0.5) for (let y = b[1] - 60; y <= b[1] + 60; y += 0.5) { if (U.nutTai({ x, y }) === n) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    out.nut[n] = { hinh: Math.round(2 * (b[2] + 1) * sc), chamRong: Math.round((x1 - x0) * sc), chamCao: Math.round((y1 - y0) * sc) }; }
  for (let i = 0; i < ten.length; i++) for (let j = i + 1; j < ten.length; j++) { const a = B[ten[i]], b = B[ten[j]]; out.gapMin = Math.min(out.gapMin, Math.round((Math.hypot(a[0] - b[0], a[1] - b[1]) - a[2] - b[2] - 2) * sc)); }
  out.PAU = { rong: Math.round((U.PAU[2] + 8) * sc), cao: Math.round(Math.max(U.PAU[3] + 9, G.CHAM44 && G.theme.chamMin ? G.theme.chamMin() : 0) * sc) };
  out.OVK = { rong: Math.round(U.OVK[2] * sc), cao: Math.round(U.OVK[3] * sc) };
  const mm = G.minimap.rect(S); out.banDo = { rong: Math.round(mm[2] * sc), cao: Math.round(mm[3] * sc) };
  out.thanhMau = { caoCss: Math.round(11 * sc * 10) / 10, caoThat: Math.round(11 * sc * devicePixelRatio) };
  const r = document.getElementById('stage').getBoundingClientRect(); out.khung = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
  // khoảng cách từ nút gần HUD nhất (trên trái: thanh máu 0..130 × 0..24; trên phải: ô vũ khí) tới HUD
  let dHud = 1e9; for (const n of ten) { const b = B[n], rr = b[2] + 1; const dx = Math.max(U.OVK[0] - (b[0] + rr), (b[0] - rr) - (U.OVK[0] + U.OVK[2]), 0), dy = Math.max((b[1] - rr) - (U.OVK[1] + U.OVK[3] + 14), 0); dHud = Math.min(dHud, Math.round(Math.hypot(dx, dy) * sc)); }
  out.nutToiOVK = dHud; out.CHAM44 = !!G.CHAM44; out.cx = G.cx; out.cy = G.cy; out.tam = {}; for (const n of ten) out.tam[n] = B[n].slice(0,3).map(v => Math.round(v));
  return out; }"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h, dpr in SIZES:
        ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=dpr > 1, is_mobile=dpr > 1, device_scale_factor=dpr)
        pg = ctx.new_page(); pg.goto(URL); pg.wait_for_function('window.G && G.scene')
        pg.evaluate(SAVE); pg.reload(); pg.wait_for_function('window.G && G.scene'); pg.wait_for_timeout(800)
        if dpr > 1:
            pg.evaluate("document.documentElement.style.setProperty('--sa-l', '47px'); document.documentElement.style.setProperty('--sa-r', '47px'); document.documentElement.style.setProperty('--sa-b', '21px'); window.dispatchEvent(new Event('resize'))")
        pg.evaluate("(() => { G.save.sound = false; G.setScene(G.Village); G.startStage(0, 1, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0; S.tut = null; })()")
        pg.wait_for_timeout(1500)
        res[name] = pg.evaluate(DO)
        pg.screenshot(path=f'nut-{name}.png')
        ctx.close()
    b.close()
print(json.dumps(res, ensure_ascii=False, indent=1))
