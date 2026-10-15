"""Ảnh soát tĩnh Bước 2 Phiên B "Việc hôm nay" (không chơi thử): chụp thẻ Việc hôm nay ở Anh Mõ và bảng xem trong Tạm dừng, tiếng Việt + tiếng Anh,
ghép thành docs/ke-hoach/buoc-2/xem-viec.png (khung game 480x270, mỗi ô phóng 2 lần).
Chạy từ thư mục game: python3 tests/viec_ngay_shots.py (cần Playwright + Chromium + Pillow). Thoát mã 1 nếu trang có lỗi.
Phiên D (ảnh): mặc định mở bản đóng gói dist/linh-khi.html (có ảnh nhúng: chạy python3 game/build.py trước); --nguon: mở index.html (không ảnh);
--q khunganh=0: thêm tham số vào địa chỉ (tắt ảnh khung Bước 2)."""
import os, sys, io
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
import ui_lib
from ui_lib import Game, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'ke-hoach', 'buoc-2', 'xem-viec.png')
ui_lib.SIZES['soat'] = dict(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
# bản lưu giữa vùng hai (mức thưởng 2): việc 1 xong chưa nhận, việc 2 làm dở, việc 3 chưa làm; dải tuần đã đóng dấu T2, T4
SAVE = """(() => { G.resetSave(); const s = G.save; s.sound = false; s.heroes[s.hero].lvl = 18; s.truyen = { mo: 1, v: 3, n: {} }; s.tut.done = true;
  s.stars = { '0-0': 3, '0-1': 3, '0-2': 2, '0-3': 3, '0-4': 3, '1-0': 2, '1-1': 1 };
  G.suKien.suaBanLuu(s); s.nv.cuoi = ''; s.nv.hat = 4242; G.viecNgay.capNhat(s);
  const n = s.nv; n.ds = [{ m: 'haQuai', x: null, can: 30, d: 30, nhan: 0, o: 0 }, { m: 'heKet', x: 'fire', can: 15, d: 9, nhan: 0, o: 1 }, { m: 'baSao', x: null, can: 1, d: 0, nhan: 0, o: 2 }];
  n.tuan.ngay = [0, 2]; n.doi = 0; G.persist(); return n.cuoi; })()"""

def main():
    errs, anh = [], []
    with sync_playwright() as p:
        trang = ROOT + '/index.html' if '--nguon' in sys.argv or not os.path.exists(ROOT + '/dist/linh-khi.html') else ROOT + '/dist/linh-khi.html'
        q = sys.argv[sys.argv.index('--q') + 1] if '--q' in sys.argv else ''
        g = Game(p, 'soat', url='file://' + trang + ('?cloud=0&' + q if q else ('?cloud=0' if trang.endswith('linh-khi.html') else '')))
        g.touch = False
        g.pg.on('pageerror', lambda e: errs.append(str(e)))
        ev = g.ev
        def chup():
            g.wait(500)
            anh.append(Image.open(io.BytesIO(g.pg.locator('#stage').screenshot())).convert('RGB'))
        g.wait(600); g.tap(240, 150); g.wait(1500)
        print('ngày việc:', ev(SAVE))
        for lang in ('vi', 'en'):
            ev("(l) => { G.ngonNgu.dat(l); if (G.truyen) G.truyen.dang = null; G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo'); }", lang)
            chup()
            ev("() => { G.startStage(0, 2, 0); G.getRun().mode = 'paused'; G.viecNgay.xemTrongAi(); }")
            chup()
            ev("() => { G.setScene(G.Village); }")
        # soát chữ: mọi mẫu việc (cả tham số dài nhất) đặt vào thẻ, đếm chỗ phải cắt "…" (T.chuDo.cat) ở cả hai ngôn ngữ
        for lang in ('vi', 'en'):
            cat = ev("""(l) => { G.ngonNgu.dat(l); G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo');
              const D = G.theme.chuDo, c0 = D.cat, sai = [], n = G.save.nv, X = { haLoai: 'namPhongChua', veVung: 2, heKet: 'poison', vuKhi: 'hammer' };
              for (const t of G.VIEC_NGAY.mau) { n.ds = [0, 1, 2].map((o) => ({ m: t.m, x: X[t.m] == null ? null : X[t.m], can: t.can, d: o ? t.can : 0, nhan: o === 2 ? 1 : 0, o }));
                const a = D.cat; G.Village.draw(); if (D.cat > a) sai.push(t.m); }
              return { cat: D.cat - c0, sai }; }""", lang)
            print('soát chữ', lang, cat)
            if cat['cat']:
                errs.append('chữ bị cắt (' + lang + '): ' + ','.join(cat['sai']))
        ev("() => G.ngonNgu.dat('vi')")
        g.close()
    w, h = 960, 540
    out = Image.new('RGB', (w * 2 + 12, h * 2 + 12), (20, 16, 14))
    for i, im in enumerate(anh):
        im = im.resize((w, h))
        out.paste(im, ((i % 2) * (w + 12), (i // 2) * (h + 12)))
    out.save(OUT)
    print('đã ghi', OUT, len(anh), 'ảnh')
    if errs:
        print('LỖI TRANG:', errs[:3]); sys.exit(1)

main()
