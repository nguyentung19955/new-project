"""Dựng phòng trùm Mộc Tinh, ép máu xuống pha 2 rồi pha 3, chụp ảnh từng pha + GIF đòn tấn công 3 pha.
Chạy từ gốc repo, cần server: python3 -m http.server 8765"""
import base64, io, sys
from PIL import Image
from playwright.sync_api import sync_playwright
OUT = 'docs/review/ke-hoach-cai-thien/nhap-anh-12-10/moc-tinh/'
TRANG = sys.argv[1] if len(sys.argv) > 1 else 'linh-khi.html'
loi = []
with sync_playwright() as p:
    br = p.chromium.launch(); g = br.new_page(viewport={'width': 430, 'height': 760}, device_scale_factor=1)
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(f'http://localhost:8765/game/dist/{TRANG}?cloud=0')
    g.wait_for_function("window.G && G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds['mocTinh-p2'] && G.spriteCustom.ds['mocTinh-p3'] && G.spriteCustom.ds['mocTinh']", timeout=180000)
    g.add_script_tag(path='game/tests/bot.js'); g.add_script_tag(path='game/tests/setup.js')
    g.wait_for_timeout(1500)
    info = g.evaluate("""() => {
      G.testSave({ hero: 'smith', lvl: 30, tier: 2, sharpen: 6 });
      G.startStage(0, 4, 0, { kind: 'A', seed: 3 });
      const S = G.getRun(); G.gotoRoom(S.map.boss);
      const b = G.getWorld().boss; G.botInput = () => ({ mx: 0, my: 0 });
      const SC = G.spriteCustom, o = {};
      for (const k of ['mocTinh', 'mocTinh-p2', 'mocTinh-p3']) { const s = SC.ds[k]; o[k] = { fw: s.fw, fh: s.fh, net: s.net, dt: Object.fromEntries(Object.entries(s.dt).map(([a, v]) => [a, v.hang + '/' + v.so])) }; }
      o.name = b.name; o.hp = Math.round(b.maxhp); o.loiSC = (SC.loi || []).slice();
      return o; }""")
    print(info)
    shots = []
    for ph, frac in [(0, 1), (1, 0.6), (2, 0.3)]:
        r = g.evaluate("""([frac]) => { const W = G.getWorld(), b = W.boss, P = G.getRun().P;
          b.hp = b.maxhp * frac;
          for (let f = 0; f < 400; f++) { P.inv = 9; P.hp = P.maxhp; G.sim(1); if (f > 200 && !(b.busy > 0) && !(b.invuln > 0)) break; }
          b.x = P.x + 70; b.y = P.y; return { phase: b.phase, hp: Math.round(b.hp), an: b.an && b.an.n, maxhp: Math.round(b.maxhp) }; }""", [frac])
        g.wait_for_timeout(300)
        png = g.screenshot()
        im = Image.open(io.BytesIO(png)).convert('RGB'); im.save(OUT + f'pha{ph + 1}-trong-phong.png')
        print('pha', ph + 1, r); shots.append(im)
    # ảnh 3 pha cạnh nhau + GIF đòn tấn công, vẽ bằng chính hàm vẽ quái của game (SC.veQuai)
    r = g.evaluate("""() => { const SC = G.spriteCustom, sp = SC.ds['mocTinh'], out = { canh: null, gif: [] };
      const K = 2, cv = document.createElement('canvas'); cv.width = 3 * 180 * K; cv.height = 150 * K; const c = cv.getContext('2d');
      c.fillStyle = '#4b6a52'; c.fillRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
      for (let ph = 1; ph <= 3; ph++) { c.save(); c.scale(K, K); c.translate((ph - 1) * 180 + 90, 142); SC.veQuai(c, sp, 0, 0, { anim: 'idle', t: 0.2, face: 1, phase: ph }); c.restore();
        c.fillStyle = '#fff'; c.font = '20px sans-serif'; c.fillText('pha ' + ph, (ph - 1) * 180 * K + 10, 26); }
      // đường chân chung
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.moveTo(0, 142 * K + 0.5); c.lineTo(cv.width, 142 * K + 0.5); c.stroke();
      out.canh = cv.toDataURL();
      const d = SC.dur ? null : null;
      for (let i = 0; i < 24; i++) { const cv2 = document.createElement('canvas'); cv2.width = 3 * 180; cv2.height = 150; const h = cv2.getContext('2d');
        h.fillStyle = '#4b6a52'; h.fillRect(0, 0, cv2.width, cv2.height); h.imageSmoothingEnabled = false;
        for (let ph = 1; ph <= 3; ph++) { h.save(); h.translate((ph - 1) * 180 + 90, 142); SC.veQuai(h, sp, 0, 0, { anim: 'atk', t: (i % 12) / 12 * 0.6, face: 1, phase: ph }); h.restore(); }
        out.gif.push(cv2.toDataURL()); }
      return out; }""")
    Image.open(io.BytesIO(base64.b64decode(r['canh'].split(',')[1]))).save(OUT + '3-pha-canh-nhau.png')
    fr = [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('P', palette=Image.ADAPTIVE, colors=128) for u in r['gif']]
    fr[0].save(OUT + 'tan-cong-3-pha.gif', save_all=True, append_images=fr[1:], duration=50, loop=0)
    br.close()
print('pageerror:', loi or 'không có')
