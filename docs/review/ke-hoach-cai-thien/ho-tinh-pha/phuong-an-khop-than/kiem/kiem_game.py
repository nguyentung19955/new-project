# Dựng phòng trùm Hồ Tinh trong bản đóng gói (game/dist/linh-khi.html?cloud=0), chụp mỗi pha 1 ảnh và quay GIF chuyển pha.
# Chạy từ gốc repo, có sẵn `python3 -m http.server 8765`:  python3 docs/review/ke-hoach-cai-thien/ho-tinh-pha/kiem/kiem_game.py
import io, os, sys
from PIL import Image
from playwright.sync_api import sync_playwright
RA = 'docs/review/ke-hoach-cai-thien/ho-tinh-pha/phuong-an-khop-than/'
loi = []
with sync_playwright() as p:
    b = p.chromium.launch()
    g = b.new_page(viewport={'width': 844, 'height': 390})
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto('http://localhost:8765/game/dist/linh-khi.html?cloud=0')
    g.wait_for_function("window.G && G.scene && G.spriteCustom && ['hoTinh','hoTinh-p2','hoTinh-p3'].every(k => G.spriteCustom.ds[k] && G.spriteCustom.ds[k].ready)", timeout=120000)
    g.add_script_tag(path='game/tests/bot.js'); g.add_script_tag(path='game/tests/setup.js')
    info = g.evaluate("""() => {
      G.botInput = () => ({ mx: 0, my: 0 });
      G.testSave({ hero: 'smith', lvl: 30, tier: 2 });
      G.startStage(2, 4, 0, { kind: 'A', seed: 3 });
      const S = G.getRun(); G.gotoRoom(S.map.boss);
      const W = G.getWorld(), P = S.P, bo = W.boss;
      bo.layers = []; bo.weak = [];
      for (let f = 0; f < 900 && (bo.invuln > 0 || bo.busy > 0); f++) { P.inv = 9; P.hp = P.maxhp; G.sim(1); }
      // em bé bất tử, trùm không ra chiêu khi chụp (chỉ đứng thở) để so hình ba pha cho rõ
      window.__giu = setInterval(() => { P.inv = 9; P.hp = P.maxhp; if (window.__dung) { bo.cd = 9; } }, 16);
      window.__dung = true;
      const ds = ['hoTinh','hoTinh-p2','hoTinh-p3'].map(k => { const s = G.spriteCustom.ds[k]; return k + ' ' + s.fw + '×' + s.fh + ' net ' + (s.net || 1) + ' chân ' + JSON.stringify(s.goc || [s.gx, s.gy]) + ' ' + Object.entries(s.dt).map(([a, v]) => a + ':' + v.so).join(','); });
      return { ten: bo.name, art: bo.art, ds, x: bo.x, y: bo.y };
    }""")
    print(info)
    def chup():
        # cắt quanh trùm (toạ độ màn hình của trùm lấy từ camera của cảnh)
        png = g.screenshot()
        return Image.open(io.BytesIO(png)).convert('RGB')
    def doi_pha(frac, ten):
        # cho máu xuống dưới ngưỡng, quay GIF cảnh chuyển pha
        khung = []
        g.evaluate("f => { const bo = G.getWorld().boss; bo.hp = bo.maxhp * f; window.__dung = false; }", frac)
        for _ in range(20):
            khung.append(chup()); g.wait_for_timeout(90)
        g.evaluate("() => { const bo = G.getWorld().boss; bo.busy = 0; bo.invuln = 0; bo.tired = 0; bo.hitT = 0; bo.lunge = null; if (bo.st) bo.st.stun = 0; const W = G.getWorld(); W.zones = W.zones.filter(z => z.src !== bo); window.__dung = true; }")
        return khung
    g.wait_for_timeout(1200)
    p1 = chup(); p1.save(RA + 'pha-1-trong-game.png')
    k2 = doi_pha(0.6, 'pha2'); g.wait_for_timeout(1500)
    p2 = chup(); p2.save(RA + 'pha-2-trong-game.png')
    k3 = doi_pha(0.3, 'pha3'); g.wait_for_timeout(1500)
    p3 = chup(); p3.save(RA + 'pha-3-trong-game.png')
    pha = g.evaluate("() => G.getWorld().boss.phase")
    print('pha cuối', pha)
    # GIF nhỏ: chỉ vùng quanh trùm, thu 3/4, 32 màu, cách một khung lấy một
    def nho(im):
        return im.crop((285, 30, 535, 245)).resize((188, 162)).quantize(32)
    ks = [nho(p1)] * 4 + [nho(k) for k in k2[::2]] + [nho(p2)] * 4 + [nho(k) for k in k3[::2]] + [nho(p3)] * 5
    ks[0].save(RA + 'chuyen-pha.gif', save_all=True, append_images=ks[1:], duration=180, loop=0, optimize=True)
    b.close()
print('pageerror:', loi or 'không có')
print('GIF', os.path.getsize(RA + 'chuyen-pha.gif') // 1024, 'KB')
