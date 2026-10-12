"""Kiểm tạm tắt thân bộ cũ Cái Bống trên bản hai tệp. Chạy: srv2.py game/dist 8771 rồi python3 kiem_than_bo.py <thư mục ảnh>"""
import base64, json, os, sys
from playwright.sync_api import sync_playwright
RA = sys.argv[1] if len(sys.argv) > 1 else '.'
loi = []
JS = """async (cu) => {
  const SC = G.spriteCustom, O = G.outfit, out = {};
  G.THAN_BO_CU = cu;
  const BO = { rung: { hat: 'mu_sung', robe: 'ao_vo_cay', back: 'gui_tre', hand: 'bua_nanh' },
               bien: { hat: 'mu_vay_ca', robe: 'ao_vay', back: 'khan_bang', hand: 'bua_oc' },
               lau: { hat: 'mu_tai_cao', robe: 'ao_long', back: 'trong_nho', hand: 'bua_lua' } };
  const KEYS = ['healer', 'smith', 'hunter', 'wrestler'];
  const ofCua = (b) => Object.assign({}, BO[b], { rar: {}, fx: Object.assign({ els: [], du_bo: b, bo: b, aura: null }, O.fxThanBo(BO[b])) });
  // nạp trước mọi thân sẽ dùng (bản hai tệp nạp ảnh sau)
  const can = Object.keys(SC.ds).filter((m) => /^em-be-(smith|hunter|healer|wrestler)(-(rung|bien|lau))?$/.test(m));
  for (let n = 0; n < 300; n++) { if (can.every((m) => SC.get(m))) break; await new Promise(r => setTimeout(r, 150)); }
  out.chuaNap = can.filter((m) => !SC.get(m));
  out.chon = {}; for (const k of KEYS) { out.chon[k] = {}; for (const b in BO) { const s = SC.cuaEmBe(k, { key: k, outfit: ofCua(b) }); out.chon[k][b] = s && s.ma; } }
  out.tat = SC.thanBoTat();
  const K = 3, W = 56, H = 60, cv = document.createElement('canvas'); cv.width = W * 4 * K; cv.height = H * 2 * K; const c = cv.getContext('2d');
  c.fillStyle = '#4b6a52'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
  const t1 = document.createElement('canvas'); t1.width = W * 2; t1.height = H * 2; const x = t1.getContext('2d');
  const ve = (o, col, row) => { x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,t1.width,t1.height); x.setTransform(2,0,0,2,0,0); x.imageSmoothingEnabled = false; try { G.art.hero(x, o); } catch (e) { out.err = String(e); } c.drawImage(t1, col * W * K, row * H * K, W * K, H * K); };
  const ds = [null, 'rung', 'bien', 'lau'];
  ds.forEach((b, i) => { ve({ x: 28, y: 53, face: 1, key: 'healer', t: 0.3, weapon: { type: 'spear', family: 0, rarity: 0 }, outfit: b ? ofCua(b) : { rar: {}, fx: { els: [] } } }, i, 0);
                         ve({ x: 28, y: 53, face: 1, key: 'healer', move: true, t: 0.25, weapon: { type: 'spear', family: 0, rarity: 0 }, outfit: b ? ofCua(b) : { rar: {}, fx: { els: [] } } }, i, 1); });
  out.png = cv.toDataURL(); out.loiSC = SC.loi.slice();
  return out; }"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium') if os.path.exists('/opt/pw-browsers/chromium') else p.chromium.launch()
    for cu, ten in ((False, 'sau'), (True, 'truoc')):
        g = b.new_page(viewport={'width': 900, 'height': 600})
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto('http://localhost:8771/linh-khi-nhe.html?cloud=0' + ('&thanbocu=1' if cu else ''))
        g.wait_for_function("window.G && G.spriteCustom && G.outfit && G.art && G.spriteCustom.get('em-be-healer')", timeout=120000)
        g.wait_for_timeout(1000)
        r = g.evaluate(JS, cu)
        open(os.path.join(RA, 'cai-bong-%s.png' % ten), 'wb').write(base64.b64decode(r.pop('png').split(',')[1]))
        print(ten, json.dumps(r, ensure_ascii=False))
        g.close()
    b.close()
print('pageerror:', loi or 'không có')
