# Dựng ảnh co-that-phong-vuong.png: bốn bé cầm vũ khí ở cỡ thật trong phòng vuông nhìn từ trên, có quái của game để so cỡ.
# Mở trang game thật, nạp thêm hero_tinhlinh.js (thay G.art.hero) và mã phòng mượn từ nhánh claude/phac-thao-phong.
# Không sửa gì trong game/.   Chạy: python3 dung_phong.py
import base64, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
JS = r"""
() => {
  const M = window.Mock, A = G.art;
  const kids = [
    { key: 'hunter', x: 292, y: 112, face: -1, w: 'bow', name: 'Thợ Săn' },
    { key: 'healer', x: 182, y: 214, face: 1, w: 'spear', name: 'Thầy Lang' },
    { key: 'wrestler', x: 300, y: 218, face: -1, w: 'hammer', name: 'Đô Vật' },
  ];
  const cv = M.plainA('castle', {
    scene: {
      hero: { x: 186, y: 118, face: 1 }, props: [], zones: [],
      ents: [{ role: 'rusher', x: 236, y: 122, cd: 9 }, { role: 'shield', x: 242, y: 196, cd: 9 }, { role: 'swarm', x: 214, y: 162, cd: 9 }, { role: 'swarm', x: 266, y: 158, cd: 9 },
        { role: 'archer', x: 322, y: 164, cd: 9 }, { role: 'nimble', x: 160, y: 164, face: 1, cd: 9 }, { role: 'elite', x: 244, y: 232, cd: 9 }],
    },
    play: { warm: 1, move: { mx: 0 }, hits: 0, hp: 1 },
    after: (R) => {
      const c = R.wc; c.setTransform(1, 0, 0, 1, 0, 0);
      for (const k of kids) A.hero(c, { x: k.x, y: k.y, face: k.face, key: k.key, move: false, t: 0.3, atk: -1, dodge: -1, weapon: { type: k.w, tier: 0, marks: { fire: 0, poison: 0, ice: 0 } } });
    },
  }, 1440);
  const W = 1080, top = 190, H = top + 810 + 150;
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const c = out.getContext('2d'), F = '"Inter","DejaVu Sans",sans-serif';
  c.fillStyle = '#1c1921'; c.fillRect(0, 0, W, H);
  c.textBaseline = 'alphabetic';
  c.font = '700 56px ' + F; c.fillStyle = '#ffd27a'; c.fillText('Cỡ thật trong phòng vuông', 26, 80);
  c.font = '500 31px ' + F; c.fillStyle = '#f1ead9';
  c.fillText('Bốn bé và vũ khí sống đứng cạnh quái của game.', 26, 130);
  c.fillText('Một điểm ảnh của game được phóng 3 lần.', 26, 172);
  c.imageSmoothingEnabled = false;
  c.drawImage(cv, 180, 0, 1080, 810, 0, top, 1080, 810);
  const tag = (s, gx, gy, col) => {
    c.font = '700 24px ' + F; const w = c.measureText(s).width + 20, x = (gx - 60) * 3 - w / 2, y = top + gy * 3;
    c.fillStyle = 'rgba(20,14,18,0.82)'; c.beginPath(); c.roundRect(x, y, w, 34, 8); c.fill();
    c.fillStyle = col; c.textAlign = 'center'; c.fillText(s, x + w / 2, y + 25); c.textAlign = 'left';
  };
  tag('Thợ Rèn', 186, 122, '#ffb070'); tag('Thợ Săn', 292, 116, '#a8e08a'); tag('Thầy Lang', 182, 218, '#9db8ff'); tag('Đô Vật', 300, 222, '#ff8f7a');
  c.font = '500 27px ' + F; c.fillStyle = '#cfc5b4';
  c.fillText('Bé cao chừng 25 điểm ảnh, ngang cỡ quái thường. Vũ khí sống cao hơn bé.', 26, top + 810 + 56);
  c.fillText('Ở cỡ này vẫn thấy rõ màu áo, kiểu mũ và từng loại vũ khí.', 26, top + 810 + 98);
  return out.toDataURL('image/png');
}
"""

def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1472, 'height': 810})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + os.path.join(ROOT, 'game', 'index.html'))
        pg.wait_for_timeout(1600)
        pg.add_script_tag(path=os.path.join(ROOT, 'game', 'tests', 'setup.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'game', 'js', 'hero_tinhlinh.js'))
        for f in ('phong.js', 'chu-de.js', 'canh.js'):
            pg.add_script_tag(path=os.path.join(HERE, 'muon-phong', f))
        pg.evaluate('Mock.init(); G.testSave({ lvl: 12 })')
        url = pg.evaluate(JS)
        out = os.path.join(HERE, '..', 'co-that-phong-vuong.png')
        open(out, 'wb').write(base64.b64decode(url.split(',', 1)[1]))
        print('đã ghi', os.path.abspath(out))
        b.close()
    if errs:
        print('LỖI:', errs[:6])

main()
