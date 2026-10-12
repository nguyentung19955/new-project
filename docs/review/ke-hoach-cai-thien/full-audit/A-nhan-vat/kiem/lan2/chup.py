#!/usr/bin/env python3
"""Chụp nhanh em bé theo danh sách tư thế (JSON), phóng to. python3 chup.py <url> <ra.png> '<json: [[key, o, p, outfit], ...]>' [cột] [JS cờ]
Mỗi ô vẽ 2 lần: trái = như game; phải = sau khi chạy JS cờ thứ hai (nếu có) -> so trước/sau trên cùng ảnh."""
import sys, json, base64, io
from PIL import Image
from playwright.sync_api import sync_playwright
URL, OUT, SPEC = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
COT = int(sys.argv[4]) if len(sys.argv) > 4 else 8
CO = sys.argv[5] if len(sys.argv) > 5 else ''
JS = r"""
([spec, cot]) => {
  const CW = 64, CH = 56, Z = 4, rows = Math.ceil(spec.length / cot), cv = document.createElement('canvas'); cv.width = CW * cot * Z; cv.height = CH * rows * Z;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const sm = document.createElement('canvas'); sm.width = CW; sm.height = CH; const s = sm.getContext('2d');
  spec.forEach((q, j) => {
    const [key, o0, p0, of0] = q; s.setTransform(1, 0, 0, 1, 0, 0); s.fillStyle = j % 2 ? '#4a6b3c' : '#56744a'; s.fillRect(0, 0, CW, CH);
    const of = Object.assign({ hat: null, robe: null, back: null, hand: null, mask: null, wing: null }, of0 || {});
    if (G.outfit && G.outfit.fxThanBo) { of.fx = Object.assign({ els: [] }, G.outfit.fxThanBo(of)); of.fx.els = []; of.fx.aura = null; of.fx.glow = null; }
    const p = p0 ? Object.assign({ outfit: of, mv: null, comboI: 0 }, p0) : null;
    const o = Object.assign({ x: 30, y: CH - 7, face: 1, key, move: false, t: 0.31, atk: -1, dodge: -1, weapon: null, outfit: of, noShadow: true, p }, o0);
    if (o.wt) { o.weapon = { type: o.wt, family: o.fam || 0, tier: 0, rarity: 0, stage: 0 }; delete o.wt; }
    try { G.art.hero(s, o); } catch (e) { s.fillStyle = 'red'; s.fillRect(0, 0, 6, 6); }
    c.drawImage(sm, (j % cot) * CW * Z, Math.floor(j / cot) * CH * Z, CW * Z, CH * Z);
  });
  return cv.toDataURL();
}"""
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function("window.G && G.spriteCustom && G.spriteCustom.ds['em-be-smith']", timeout=120000)
    pg.evaluate("() => { const SC = G.spriteCustom; for (const m in SC.ds) SC.canAnh(m); for (const m in SC.do) SC.canAnh(m); }")
    pg.wait_for_function("() => { const SC = G.spriteCustom; return Object.keys(SC.ds).filter(m => /^em-be/.test(m)).every(m => SC.ds[m].ready && (!/^em-be-(smith|hunter|healer|wrestler)$/.test(m) || SC.ds[m].donMa)) && Object.keys(SC.do).every(m => SC.do[m].ready !== false); }", timeout=180000)
    pg.wait_for_timeout(500)
    a = Image.open(io.BytesIO(base64.b64decode(pg.evaluate(JS, [SPEC, COT]).split(',')[1])))
    if CO:
        pg.evaluate(CO); pg.wait_for_timeout(100)
        bb = Image.open(io.BytesIO(base64.b64decode(pg.evaluate(JS, [SPEC, COT]).split(',')[1])))
        im = Image.new('RGB', (a.width, a.height * 2 + 8), (255, 255, 255)); im.paste(a, (0, 0)); im.paste(bb, (0, a.height + 8)); a = im
    a.save(OUT); print('pageerror', errs)
