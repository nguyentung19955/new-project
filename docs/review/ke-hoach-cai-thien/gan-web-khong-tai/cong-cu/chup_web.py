"""Chụp Cu Tí cầm vũ khí trên BẢN WEB (linh-khi-nhe.html, ảnh rời, qua HTTP) — không chơi thử, đặt bản lưu + T.room như gan_tu_moc_shots.py.
python3 chup_web.py <port> <tệp ra .png>
Ô: (1) kiếm vuông Lv 2 (gân Trắng); (2) kiếm vuông Lv 4 Lửa (ảnh hệ — luật vk-he-3-loai: hệ trước gân); (3) kiếm Lv 4 Lửa với ?vkhe=0 (gân Mầm);
   (4) phi tiêu Lv 9 Lửa ?vkhe=0 (gân Thành hình). Mỗi ô ghi SC.zed zed-vk-gan/he ready và request mạng."""
import os
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))  # <gốc repo>/game

import io, os, sys, json, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.join(GAME, 'tests'))
import au_phan_hoi_shots as AP

port = int(sys.argv[1]); OUT = sys.argv[2]
HERE = GAME
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
LIB2 = r"""
window.LK2 = {
  dung(t, L) {
    const xy = T.room({ melee: t === 'bow' ? 'sword' : t, bow: t === 'bow', shift: 0 });
    const P = T.P;
    for (const w of [P.weapons ? P.weapons[0] : null, P.weapons ? P.weapons[1] : null, ...(G.save.weapons || [])]) {
      if (!w) continue; w.luyen = L; if (L >= 3 && !w.branch) w.branch = 'fire'; G.luyen.dongBo(w);
    }
    T.run({}, 30);
    const W = G.getWorld();
    return [P.x - (W.cam || 0), P.y];
  },
  tt() {
    const SC = G.spriteCustom, o = {};
    for (const m of ['zed-vk-gan', 'zed-vk-he']) { const z = SC.zed[m], it = SC.roi.ds.get(m); o[m] = { ready: !!(z && z.ready), ve: !!(it && it.ve), can: it && it.can }; }
    const w = T.P.weapons[T.P.cur], V = SC.zed['zed-vk'], loai = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' }[w.type];
    const cap = G.luyen.hinhThai(G.luyen.cap(w)), r = V.tep.vk[loai][cap];
    o.lv = G.luyen.cap(w); o.cap = cap; o.gan = !!(G.vkGan(w, cap) && G.vkGanAnh(loai, cap, r)); o.he = !!(w.branch && G.vkHeAnh(loai, cap, w.branch, r));
    return o;
  },
};
"""


def mo(p, q):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1440, 'height': 810}, user_agent=UA)
    pg = ctx.new_page()
    reqs = []
    pg.on('request', lambda r: reqs.append(r.url.split('/anh/')[1]) if '/anh/zed-vk-' in r.url else None)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, q))
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    pg.wait_for_function("() => ['zed-moi', 'zed-vk'].every((m) => G.spriteCustom.zed[m] && G.spriteCustom.zed[m].ready)", timeout=60000)
    pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(HERE, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
    pg.evaluate(AP.LIB); pg.evaluate(LIB2)
    pg.evaluate('G.spriteCustom.taiVung(0)')  # như người chơi chọn vùng Rừng già: tải ảnh vùng rồi mới vào ải
    pg.wait_for_function('() => G.spriteCustom.vungTien(0, false).san', timeout=120000)
    return b, pg, reqs, errs


def canvas_box(pg):
    return pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480]; })()")


def chup(pg, t, L):
    x, y = pg.evaluate("LK2.dung('%s', %d)" % (t, L))
    # vũ khí cần gân / hệ → game gọi SC.canAnh; chờ tấm về rồi vẽ lại
    pg.wait_for_function("() => ['zed-vk-gan', 'zed-vk-he'].every((m) => G.spriteCustom.zed[m] && G.spriteCustom.zed[m].ready)", timeout=30000)
    pg.evaluate("T.run({}, 5)")
    bx = canvas_box(pg)
    hw, hh = 52, 40
    clip = {'x': bx[0] + (x - hw) * bx[2], 'y': bx[1] + (y - hh - 10) * bx[2], 'width': 2 * hw * bx[2], 'height': 2 * hh * bx[2]}
    return Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB'), pg.evaluate('LK2.tt()')


def main():
    F = ImageFont.truetype(AP.FONT, 15); F2 = ImageFont.truetype(AP.FONT, 12)
    cap, ghi, loi = [], [], []
    with sync_playwright() as p:
        b, pg, reqs, errs = mo(p, '')
        for t, L, nhan in (('sword', 2, 'Kiem Lv 2|gan Trang'), ('sword', 4, 'Kiem Lv 4 Lua|anh he (he > gan)')):
            im, tt = chup(pg, t, L); cap.append((im, nhan)); ghi.append((nhan, tt))
        ghi.append(('request anh/zed-vk-* (mac dinh)', reqs[:])); loi += errs
        b.close()
        b, pg, reqs, errs = mo(p, '&vkhe=0')
        for t, L, nhan in (('sword', 4, 'Kiem Lv 4 ?vkhe=0|gan Mam'), ('bow', 9, 'Phi tieu Lv 9 ?vkhe=0|gan Thanh hinh')):
            im, tt = chup(pg, t, L); cap.append((im, nhan)); ghi.append((nhan, tt))
        ghi.append(('request anh/zed-vk-* (?vkhe=0)', reqs[:])); loi += errs
        b.close()
    out = Image.new('RGB', (844, 390), '#140f10'); d = ImageDraw.Draw(out)
    d.text((10, 6), 'BAN WEB (linh-khi-nhe.html, anh roi, HTTP, UA iPhone Safari) - Cu Ti cam vu khi, 22/10', font=F, fill='#ffd27a')
    for k, (im, nhan) in enumerate(cap):
        im = im.resize((im.width * 296 // im.height, 296), Image.NEAREST)
        x0 = 10 + k * 209
        out.paste(im.crop((max(0, (im.width - 200) // 2), 0, max(0, (im.width - 200) // 2) + 200, 296)), (x0, 30))
        for j, dong in enumerate(nhan.split('|')): d.text((x0, 332 + j * 14), dong, font=F2, fill='#ffe9a8')
    d.text((10, 366), 'Tren: zed-vk-gan / zed-vk-he deu duoc tai (request 200, ready=true) va ap dung ngay khi vu khi can.', font=F2, fill='#d8c8a8')
    out.save(OUT); print('ghi', OUT)
    for g in ghi: print(json.dumps(g, ensure_ascii=False))
    print('lỗi JS:', loi[:5])


main()
