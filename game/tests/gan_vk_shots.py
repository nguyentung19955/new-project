"""Ảnh soát TĨNH vũ khí "có gân" tiến độ Luyện (docs/review/ke-hoach-cai-thien/gan-vk/bao-cao.md). KHÔNG chơi thử: đặt bản lưu, tự chạy
G.tick + vẽ từng khung (vòng lặp game dừng), chụp. Mặc định mở dist/linh-khi.html (chạy python3 build.py trước).

  python3 tests/gan_vk_shots.py [thư mục ra]   (mặc định docs/review/ke-hoach-cai-thien/gan-vk/)

Ra:
  o-vk-cap-1-12-x3.png   ô vũ khí 4 loại × cấp Luyện 1..12 — hàng trên: gân (mặc định), hàng dưới: ?gan=0. Phóng ×3.
  tren-tay-x3.png        Cu Tí đứng cầm vũ khí ở cấp có gân (thương 2, búa 5, búa 8, phi tiêu 2, 4, 9) — trái gân, phải ?gan=0. ×3.
  bang-luyen-*.jpg       bảng Luyện ở Ông Thợ Rèn (thương Lv 2, búa Lv 5, phi tiêu Lv 8).
In: kiểm G.vkGan theo cấp (đúng Lv 2, 4–5, 7–11), ô gân cùng cỡ ô zed-vk, lỗi JS."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import au_phan_hoi_shots as AP

HERE = AP.HERE
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'docs', 'review', 'ke-hoach-cai-thien', 'gan-vk')
Z = 3  # 1 điểm ảnh game = 3 điểm ảnh ảnh chụp (khung 1440×810, game 480×270)
LOAI = [('sword', 'Kiem'), ('spear', 'Thuong'), ('hammer', 'Bua'), ('bow', 'Phi tieu')]

KIEM = r"""(() => {
  const ra = [], w = { type: 'spear', luyen: 1 };
  for (let L = 1; L <= 15; L++) { w.luyen = L; const c = G.luyen.hinhThai(L); ra.push(G.vkGan(w, c) ? L : 0); }
  const z = G.spriteCustom.zed, V = z['zed-vk'].tep.vk, Q = z['zed-vk-gan'] && z['zed-vk-gan'].tep && z['zed-vk-gan'].tep.vk, lech = [], co = [];
  for (const l in Q || {}) Q[l].forEach((q, i) => { if (q) { co.push(l + i); if (q[2] !== V[l][i][2] || q[3] !== V[l][i][3]) lech.push(l + i); } });
  return { cap: ra.filter((x) => x), co, lech };
})()"""

# ô vũ khí: vẽ thẳng lên lớp giao diện bằng G.art.weaponIcon (như ô đồ / bảng Luyện), mỗi loại một hàng, cấp 1..12
O_VK = r"""((gan) => {
  G.VK_GAN = gan; const c = G.ux, sv = G.save;
  G.ui.rect(0, 0, 480, 270, '#1c1f1a');
  ['sword', 'spear', 'hammer', 'bow'].forEach((t, j) => {
    const w = sv.weapons.find((x) => x.type === t) || G.newWeapon(sv, t, 0);
    for (let L = 1; L <= 12; L++) {
      w.luyen = L; if (L >= 3 && !w.branch) w.branch = 'fire'; G.luyen.dongBo(w);
      const x = 8 + (L - 1) * 39, y = 6 + j * 40;
      G.oBacVk(x, y, 34, w); G.art.weaponIcon(c, w, x + 17, y + 17, 28);
    }
  });
  G.VK_GAN = true;
})"""

LIB2 = r"""
window.LK2 = {
  // Cu Tí đứng trong phòng trống, cầm loại t ở cấp Luyện L; trả [x màn hình, y] (điểm ảnh game)
  dung(t, L, gan) {
    G.VK_GAN = gan;
    const xy = T.room({ melee: t === 'bow' ? 'sword' : t, bow: t === 'bow', shift: 0 });
    const P = T.P;
    for (const w of [P.weapons ? P.weapons[0] : null, P.weapons ? P.weapons[1] : null, ...(G.save.weapons || [])]) {
      if (!w) continue; w.luyen = L; if (L >= 3 && !w.branch) w.branch = 'fire'; G.luyen.dongBo(w);
    }
    T.run({}, 30);
    const W = G.getWorld();
    return [P.x - (W.cam || 0), P.y];
  },
};
"""


def mo(p, vp):
    b = p.chromium.launch()
    pg = b.new_page(viewport=vp)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file://' + HERE + '/dist/linh-khi.html?cloud=0')
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    pg.evaluate("(() => { const SC = G.spriteCustom; for (const m of ['zed-moi', 'zed-vk', 'zed-vk-gan']) SC.canAnh && SC.canAnh(m); })()")
    pg.wait_for_function("() => ['zed-moi', 'zed-vk', 'zed-vk-gan'].every((m) => G.spriteCustom.zed[m] && G.spriteCustom.zed[m].ready)", timeout=60000)
    pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(HERE, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
    pg.evaluate(AP.LIB)
    pg.evaluate(LIB2)
    return b, pg, errs


def canvas_box(pg):
    return pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480]; })()")


def main():
    os.makedirs(OUT, exist_ok=True)
    F = ImageFont.truetype(AP.FONT, 18)
    with sync_playwright() as p:
        b, pg, errs = mo(p, {'width': 1440, 'height': 810})
        kq = pg.evaluate(KIEM)
        print('G.vkGan bật ở cấp Luyện:', kq['cap'], '(cần [2, 4, 5, 7, 8, 9, 10, 11])')
        print('ô zed-vk-gan có ảnh:', kq['co'], '| lệch cỡ ô zed-vk:', kq['lech'] or 'không')
        if kq['cap'] != [2, 4, 5, 7, 8, 9, 10, 11]: errs.append('G.vkGan sai cấp: %s' % kq['cap'])
        if kq['lech']: errs.append('ô gân lệch cỡ: %s' % kq['lech'])
        # 1) ô vũ khí cấp 1..12, gân / ?gan=0
        pg.evaluate("G.testSave({ lvl: 30, luyen: 1 }); G.setScene(G.Village); T.run({}, 2)")
        anh = []
        for gan in (True, False):
            pg.evaluate("G.ui.begin(); G.scene.draw();")
            pg.evaluate(O_VK + '(%s)' % ('true' if gan else 'false'))
            bx = canvas_box(pg)
            anh.append(Image.open(io.BytesIO(pg.screenshot(clip={'x': bx[0], 'y': bx[1], 'width': 480 * bx[2], 'height': 166 * bx[2]}))).convert('RGB'))
        w, h = anh[0].size
        out = Image.new('RGB', (w + 150, 2 * h + 70), '#140f10'); d = ImageDraw.Draw(out)
        d.text((150, 8), 'O VU KHI, cap Luyen 1 → 12 (trai → phai). Tren: co gan (mac dinh). Duoi: ?gan=0', font=F, fill='#ffd27a')
        for k, (im, nhan) in enumerate(zip(anh, ('GAN', '?gan=0'))):
            y0 = 40 + k * (h + 26)
            out.paste(im, (150, y0))
            d.text((8, y0 + 4), nhan, font=F, fill='#ffe9a8' if k == 0 else '#c8c8c8')
            for j, (_, ten) in enumerate(LOAI):
                d.text((8, y0 + (6 + j * 40 + 12) * Z), ten, font=F, fill='#f1ead9')
        for L in range(1, 13):
            d.text((150 + (8 + (L - 1) * 39 + 10) * Z, 40 + h + 2), 'Lv%d' % L, font=F, fill='#9fd49f' if L in (2, 4, 5, 7, 8, 9, 10, 11) else '#888')
        out.save(os.path.join(OUT, 'o-vk-cap-1-12-x3.png')); print('ghi o-vk-cap-1-12-x3.png')
        # 2) trên tay (đứng), gân | ?gan=0
        CANH = [('spear', 2), ('hammer', 5), ('hammer', 8), ('bow', 2), ('bow', 4), ('bow', 9), ('spear', 3)]
        hang = []
        for t, L in CANH:
            cap = []
            for gan in (True, False):
                x, y = pg.evaluate("LK2.dung('%s', %d, %s)" % (t, L, 'true' if gan else 'false'))
                bx = canvas_box(pg)
                hw, hh = 30, 26
                clip = {'x': bx[0] + (x - hw) * bx[2], 'y': bx[1] + (y - hh - 12) * bx[2], 'width': 2 * hw * bx[2], 'height': 2 * hh * bx[2]}
                cap.append(Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB'))
            hang.append(((t, L), cap))
        pg.evaluate('G.VK_GAN = true')
        cw, ch = hang[0][1][0].size
        out = Image.new('RGB', (2 * cw + 30, 40 + len(hang) * (ch + 30)), '#140f10'); d = ImageDraw.Draw(out)
        d.text((10, 8), 'Cam tren tay (dung). Trai: co gan. Phai: ?gan=0. Phong x3', font=F, fill='#ffd27a')
        for i, ((t, L), cap) in enumerate(hang):
            y0 = 36 + i * (ch + 30)
            for k, im in enumerate(cap):
                out.paste(im, (10 + k * (cw + 10), y0))
            d.text((14, y0 + ch + 4), '%s Lv%d%s' % (dict(LOAI)[t], L, '  (Lv 3 = moc Mam: khong gan, 2 ben nhu nhau)' if L == 3 else ''), font=F, fill='#f1ead9')
        out.save(os.path.join(OUT, 'tren-tay-x3.png')); print('ghi tren-tay-x3.png')
        errs += pg.evaluate('T.errs')
        b.close()
        # 3) bảng Luyện (khung 960×540 như tests/luyen2_shots.py)
        b, pg, e2 = mo(p, {'width': 960, 'height': 540})
        for t, L in (('spear', 2), ('hammer', 5), ('bow', 8)):
            pg.evaluate(r"""(() => { G.testSave({ lvl: 30, luyen: 1 }); const sv = G.save;
              for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) sv.stars[r + '-' + i] = 3;
              G.save = G.fixSave(JSON.parse(JSON.stringify(sv))); const s2 = G.save; s2.gold = 2400; s2.linhKhi = 260; s2.nlr = 64; s2.mats = [9, 6, 12];
              let w = s2.weapons.find((x) => x.type === '%s'); if (!w) w = G.newWeapon(s2, '%s', 0);
              w.luyen = %d; if (w.luyen >= 3 && !w.branch) w.branch = 'ice'; G.luyen.dongBo(w);
              if (G.hinhThai && G.hinhThai.am) G.hinhThai.am.on = null; G.luyen.anMung.on = null; G.luyen.baoBang.on = null;
              G.time = 100; G.setScene(G.Village); const A = G.villageApi; A.open('ren'); A.V.ftab = 'luyen'; G.luyen.ui.sel = w.id; G.luyen.ui.doi = null;
              G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); })()""" % (t, t, L))
            pg.wait_for_timeout(60)
            pg.evaluate("G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame();")
            f = os.path.join(OUT, 'bang-luyen-%s-lv%d.jpg' % (dict(LOAI)[t].lower().replace(' ', '-'), L))
            Image.open(io.BytesIO(pg.screenshot())).convert('RGB').save(f, quality=88); print('ghi', os.path.basename(f))
        errs += e2 + pg.evaluate('T.errs')
        b.close()
    print('--- lỗi JS: %d' % len(errs))
    for e in errs[:20]: print('  ' + str(e)[:300])
    return 1 if errs else 0


sys.exit(main())
