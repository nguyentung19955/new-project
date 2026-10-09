"""Vẽ lại mọi hình đang có trong game (vẽ bằng code) ra ảnh tham chiếu và đo đặc điểm.

Chạy: python3 docs/xuong-sprite/tham-chieu/tao_anh.py
- Mở Xưởng Sprite (tools/xuong-sprite/index.html, đã chứa mã vẽ của game) bằng Chromium của Playwright.
- Mỗi thứ (em bé, quái, vũ khí, trang phục, đồ, người làng) vẽ ở cỡ thật, quay mặt sang phải, cắt sát.
- Ghi docs/xuong-sprite/tham-chieu/<mã>.png (phóng to 8 lần, nearest-neighbor, nền trắng)
  và docs/xuong-sprite/tham-chieu/do-dac.json (số đo để viết DAC-DIEM-HINH-GAME.md và PROMPT-VE.md).
Chỉ đọc mã game, không sửa gì.
"""
import base64
import io
import json
import os
from collections import Counter

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
TOOL = 'file://' + os.path.join(REPO, 'tools', 'xuong-sprite', 'index.html')
PHONG = 8

JS = r"""() => {
  const out = [], MA = G.monsterArt, WA = G.weaponArt, L = G.heroLooks, TL = G.tinhLinh, VS = G.villageScene;
  const cat = (cv) => { const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 127) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null; const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(cv, -x0, -y0); return o.toDataURL('image/png'); };
  const ve = (f, W, H) => { const cv = document.createElement('canvas'); cv.width = W || 420; cv.height = H || 320; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; f(c, cv); return cat(cv); };
  const them = (o) => { try { o.png = ve(o.f); } catch (e) { o.loi = String(e); } delete o.f; out.push(o); };
  // em bé
  for (const [k, ten] of [['smith', 'Thợ Rèn'], ['hunter', 'Thợ Săn'], ['healer', 'Thầy Lang'], ['wrestler', 'Đô Vật']]) {
    // không cầm vũ khí: game vẽ vũ khí riêng đè lên em bé
    them({ ma: 'em-be-' + k, nhom: 'em-be', ten, f: (c) => (G.art.heroCode || G.art.hero).call(G.art, c, { x: 210, y: 280, face: 1, key: k, move: false, t: 0, atk: -1, dodge: -1, weapon: null }) });
  }
  // quái
  for (const m of MA.list) {
    const d = MA._defs[m.id]; let parts = [];
    try { const p = typeof d.parts === 'function' ? d.parts(1, 0) : d.parts; parts = (p || []).map((q) => q.n); } catch (e) { /* */ }
    them({ ma: m.id, nhom: 'quai', ten: m.ten, vung: m.vung, loai: m.loai, w0: m.w, h0: m.h, bay: m.bay, parts, anims: m.anims.map((a) => a.id),
      f: (c) => (MA.drawCode || MA.draw).call(MA, c, m.id, 210, 290, { anim: 'idle', t: 0, face: 1, bao: false, fx: false }) });
  }
  // vũ khí: nằm ngang (góc 0), chuôi trái mũi phải; cung đứng
  for (const t of ['sword', 'bow', 'spear', 'hammer']) WA.FAMILIES[t].forEach((F, f) => {
    const sz = WA.size({ type: t, family: f });
    them({ ma: 'vk-' + t + '-' + f, nhom: 'vu-khi', loai: t, dong: f, ten: F.name, len: sz.len, f: (c) => WA.draw(c, { type: t, family: f, rarity: 0, mood: 'calm', t: 0 }, 210, 160, 0, 0) });
  });
  // trang phục: một lớp của em bé đứng yên
  const LOP = { hats: 'mu', robes: 'ao', backs: 'lung', hands: 'tay', masks: 'mat', wings: 'lung' };
  for (const o of ['hats', 'robes', 'backs', 'hands', 'masks', 'wings']) for (const k of Object.keys(L[o] || {})) {
    const x = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null, rar: {} };
    if (o === 'hats') x.hat = k; else if (o === 'robes') x.robe = k; else if (o === 'backs') x.back = k; else if (o === 'hands') x.hand = k; else if (o === 'masks') x.mask = k; else x.wing = { kind: k, level: 2 };
    them({ ma: 'tp-' + o + '-' + k, nhom: 'trang-phuc', o, ten: (L[o][k].cuGoc || L[o][k]).name || k,
      f: (c) => { const ps = TL.pose('smith', 'none', 'idle', 0, 0); const cv = TL.kidSprite('smith', x, ps, '', LOP[o]).cv; c.drawImage(cv, 100, 100); } });
  }
  // đồ và tài nguyên: biểu tượng 7x7 của game (dải tài nguyên); bình máu và linh khí: hình đồ rơi
  const RES = (G.theme && G.theme.RES) || __RES__, EL = G.EL || {};
  for (const [k, ten] of [['gold', 'Vàng'], ['potion', 'Bình máu'], ['linhkhi-fire', 'Linh khí Lửa'], ['linhkhi-poison', 'Linh khí Độc'], ['linhkhi-ice', 'Linh khí Băng'],
    ['ore', 'Quặng'], ['stone', 'Đá tôi'], ['mat0', 'Gỗ linh'], ['mat1', 'Vảy cá'], ['mat2', 'Đá lửa'], ['shard0', 'Mảnh Mộc Tinh'], ['shard1', 'Mảnh Ngư Tinh'], ['shard2', 'Mảnh Hồ Tinh'], ['xp', 'Kinh nghiệm']]) {
    them({ ma: 'vp-' + k, nhom: 'do', ten, f: (c) => {
      const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
      if (RES[k]) { const d = RES[k]; for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) { const ch = d.rows[j][i]; if (ch !== '.' && d.pal[ch]) px(100 + i, 100 + j, 1, 1, d.pal[ch]); } return; }
      const x = 100, y = 100;
      if (k === 'potion') { px(x - 1, y - 5, 2, 1, '#5a3a1e'); px(x - 2, y - 4, 4, 1, '#e8e0d0'); px(x - 3, y - 3, 6, 6, '#c4202c'); px(x - 2, y - 2, 2, 2, '#ff5a5a'); px(x - 4, y - 3, 1, 6, '#14182e'); px(x + 3, y - 3, 1, 6, '#14182e'); px(x - 3, y + 3, 6, 1, '#14182e'); return; }
      const E = EL[k.split('-')[1]] || { col: '#fff', col2: '#fff', dark: '#888' };
      px(x - 3, y - 5, 6, 10, E.dark); px(x - 5, y - 3, 10, 6, E.dark); px(x - 2, y - 4, 4, 8, E.col); px(x - 4, y - 2, 8, 4, E.col);
      px(x - 1, y - 2, 2, 4, E.col2); px(x - 2, y - 1, 4, 2, E.col2); px(x - 1, y - 1, 1, 1, '#ffffff'); } });
  }
  // người làng
  for (const k of VS.ORDER) them({ ma: 'nl-' + k, nhom: 'nguoi-lang', ten: VS.NPCS[k].ten, viec: VS.NPCS[k].viec, f: (c) => { const sp = VS.npcCode(k, 0, {}); c.drawImage(sp.cv, 100, 100); } });
  return out;
}"""


def hex_(c):
    return '#%02x%02x%02x' % c[:3]


def do_hinh(im):
    """Số đo một hình (ảnh RGBA cỡ thật)."""
    w, h = im.size
    px = im.load()
    mau = Counter()
    dac = 0
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if p[3] > 127:
                dac += 1
                mau[p[:3]] += 1
    # viền: điểm đậm sát chỗ trống
    vien = Counter()
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if p[3] <= 127:
                continue
            if any(not (0 <= x + dx < w and 0 <= y + dy < h) or px[x + dx, y + dy][3] <= 127 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                vien[p[:3]] += 1
    ink = vien.most_common(1)[0][0] if vien else None
    sang = lambda c: c[0] * .3 + c[1] * .59 + c[2] * .11
    # độ dày viền: đo theo hàng ngang từ mép trái và mép phải, số điểm tối liền nhau
    day = []
    for y in range(h):
        xs = [x for x in range(w) if px[x, y][3] > 127]
        if not xs:
            continue
        for x0, st in ((xs[0], 1), (xs[-1], -1)):
            n, x = 0, x0
            while 0 <= x < w and px[x, y][3] > 127 and sang(px[x, y]) < 70:
                n += 1
                x += st
            if n:
                day.append(n)
    chinh = [(hex_(c), round(n * 100 / dac)) for c, n in mau.most_common(8) if sang(c) >= 40 or n * 100 / dac > 25]
    return {
        'rong': w, 'cao': h, 'so_mau': len(mau), 'phu_kin': round(dac * 100 / (w * h)),
        'vien': hex_(ink) if ink else None, 'vien_day': (Counter(day).most_common(1)[0][0] if day else 0),
        'mau_chinh': chinh[:6],
    }


def res_bang():
    """Bảng biểu tượng tài nguyên 7x7 chép từ game/js/ui_theme.js (công cụ không nạp tệp này)."""
    t = open(os.path.join(REPO, 'game', 'js', 'ui_theme.js'), encoding='utf-8').read()
    a = t.index('const RES = {') + len('const RES = ')
    return t[a:t.index('\n  };', a) + 4]


def main():
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page()
        loi = []
        pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.goto(TOOL)
        pg.wait_for_function('window.G && G.monsterArt && G.monsterArt.list.length > 30 && window.XS_UI')
        ds = pg.evaluate(JS.replace('__RES__', res_bang()))
        b.close()
    if loi:
        print('Lỗi trang:', loi[:3])
    so_do = []
    for o in ds:
        if not o.get('png'):
            print('KHÔNG VẼ ĐƯỢC', o['ma'], o.get('loi'))
            continue
        im = Image.open(io.BytesIO(base64.b64decode(o.pop('png').split(',')[1]))).convert('RGBA')
        # bỏ bóng đổ mờ dưới chân (game vẽ bóng nửa trong suốt, không thuộc hình)
        im.putdata([p if p[3] > 127 else (0, 0, 0, 0) for p in im.getdata()])
        im = im.crop(im.getbbox())
        o.update(do_hinh(im))
        if o['nhom'] != 'phu':
            nen = Image.new('RGBA', (im.width + 2, im.height + 2), (255, 255, 255, 255))
            nen.alpha_composite(im, (1, 1))
            nen = nen.convert('RGB').resize((nen.width * PHONG, nen.height * PHONG), Image.NEAREST)
            nen.save(os.path.join(HERE, o['ma'] + '.png'), optimize=True)
        so_do.append(o)
    with open(os.path.join(HERE, 'do-dac.json'), 'w', encoding='utf-8') as f:
        json.dump(so_do, f, ensure_ascii=False, indent=1)
    print('Đã ghi', sum(1 for o in so_do if o['nhom'] != 'phu'), 'ảnh tham chiếu')


if __name__ == '__main__':
    main()
