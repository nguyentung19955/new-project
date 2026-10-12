"""Rà soát C (12/10), mục 5: đồ vật trong phòng — nằm trong sàn, không đè nhau, không chắn lối cửa, không trùng chỗ em bé bước vào.
Chạy trên bản hai tệp (srv.py cổng 8765) hoặc LK_URL. In số phòng đã xét và danh sách lỗi; có lỗi thì thoát mã 1.
Chạy: python3 game/tests/au_c_ban_do.py [số hạt mỗi vùng, mặc định 40]"""
import os, sys, json
from playwright.sync_api import sync_playwright
URL = os.environ.get('LK_URL', 'http://127.0.0.1:8765/linh-khi-nhe.html') + '?cloud=0'
N = int(sys.argv[1]) if len(sys.argv) > 1 else 40
GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = r"""
(N) => {
  const loi = [], dem = { phong: 0, vat: 0 };
  const FLAT = new Set(['roomFore', 'loot', 'portal', 'door']);
  for (let r = 0; r < 3; r++) for (let s = 1; s <= N; s++) {
    G.testSave({ hero: 'smith', lvl: 30, tier: 2 });
    G.startStage(r, 1 + (s % 5), 0, { kind: 'ABC'[s % 3], seed: s * 7919 });
    const S = G.getRun();
    for (const R of S.map.rooms) {
      G.gotoRoom(R.id);
      const W = G.getWorld(), g = W.geo; dem.phong++;
      const ps = W.props.filter((p) => !FLAT.has(p.type));
      const ten = r + '-' + s + ' ' + R.type + ' ';
      for (const p of ps) {
        dem.vat++;
        if (p.x < g.fx0 + 6 || p.x > g.fx1 - 6 || p.y < g.fy0 || p.y > g.fy1) loi.push(ten + p.type + ' ngoài sàn ' + Math.round(p.x) + ',' + Math.round(p.y));
        for (const d of W.doors) {
          const q = G.roomArt.doorPos(g, d.dir);
          if (Math.hypot(p.x - q.x, p.y - q.y) < 22) loi.push(ten + p.type + ' sát cửa ' + d.dir + ' (' + Math.round(Math.hypot(p.x - q.x, p.y - q.y)) + ')');
        }
      }
      // chỗ có thể đặt đồ trang trí (js/room_art.js decor) và điểm nhấn hai góc trên: vật mang hệ đặt đè lên thì hai hình chồng nhau
      const spots = [[g.fx0 + 20, g.fy0 + 26], [g.fx1 - 20, g.fy0 + 26], [g.fx0 + 18, g.fy1 - 42], [g.fx1 - 18, g.fy1 - 42], [g.fx0 + 22, g.fy0 + 24], [g.fx1 - 22, g.fy0 + 24]];
      if (g.fx1 - g.fx0 > 240) spots.push([g.fx0 + 70, g.fy0 + 22], [g.fx1 - 70, g.fy0 + 22]);
      for (const p of ps) if (p.env) for (const q of spots) if (Math.abs(p.x - q[0]) < 14 && Math.abs(p.y - q[1]) < 10) { dem.deTrangTri = (dem.deTrangTri || 0) + 1; break; }
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        if (a.type === 'stash' || b.type === 'stash') continue;
        if (Math.hypot(a.x - b.x, (a.y - b.y) * 1.4) < 18) loi.push(ten + a.type + ' đè ' + b.type);
      }
    }
  }
  return { dem, loi };
}
"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function('window.G && G.scene', timeout=90000)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    G = pg.evaluate('() => { G.noRender = true; return 1 }')
    kq = pg.evaluate(JS, N)
    b.close()
loi = kq['loi']
gom = {}
for l in loi:
    k = ' '.join(l.split(' ')[1:3]); gom[k] = gom.get(k, 0) + 1
print('phòng', kq['dem']['phong'], 'đồ vật', kq['dem']['vat'], 'lỗi', len(loi), '| vật mang hệ nằm ở chỗ có thể có đồ trang trí (chỉ đếm, cần xem ảnh):', kq['dem'].get('deTrangTri', 0))
for k, v in sorted(gom.items(), key=lambda x: -x[1]): print('  ', v, k)
for l in loi[:15]: print('   ví dụ:', l)
print('pageerror', len(errs), errs[:3])
sys.exit(1 if loi or errs else 0)
