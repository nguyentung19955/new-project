import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page()
    g.goto('http://localhost:8771/linh-khi-nhe.html?cloud=0')
    g.wait_for_function("window.G && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k=>{const s=G.spriteCustom.cuaEmBe(k,{key:k});return s&&s.img&&G.spriteCustom.ghep[k]})", timeout=120000)
    r = g.evaluate("""() => { const SC = G.spriteCustom, out = {};
      for (const k of ['smith','hunter','wrestler']) { const sp = SC.cuaEmBe(k, {key:k}), gh = SC.ghep[k], luu = gh.theo; gh.theo = {}; gh.theoThan = null;
        out[k] = { so: sp.dt.move.so, ma: sp.ma, pts: [] };
        for (let i = 0; i < sp.dt.move.so; i++) { const kh = SC.khopEmBe(sp, 'move', i); const d = SC.diemAI(k, 'move', i, kh); out[k].pts.push({ kh, d: d.diem }); }
        gh.theo = luu; }
      return out; }""")
    json.dump(r, open('do.json', 'w'), indent=0)
    for k, v in r.items():
        print(k, v['so'], v['ma']); [print('  ', i, q['kh'], q['d']['dinh_dau'], q['d'].get('tay_truoc')) for i, q in enumerate(v['pts'])]
    b.close()
