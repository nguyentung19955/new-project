"""Ảnh trước / sau của phiên kiểm trang phục (12/10/2026) ở bảng thật: Cô Thợ May (như ảnh tester 11-tho-may.png: nón lá, áo vải
thô, bùa sương bậc Lam) và Ông Từ chọn em bé. "Trước" = tắt 5 cờ của phiên (G.AO_THAN_AI, G.TUYET_CHAM, G.NON_LA_GON, G.THE_EM_BE_CAT, G.spriteCustom.TP_CHINH).
Chạy từ thư mục gốc repo:  python3 -m http.server 8782 &   rồi   python3 game/tests/trang_phuc_bang.py <thư mục ra>"""
import os, sys
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(OUT, exist_ok=True)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'http://localhost:8782/game/dist/linh-khi.html?cloud=0'
CO = """(on) => { const SC = G.spriteCustom; if (!window.__tpc) window.__tpc = SC.TP_CHINH; G.AO_THAN_AI = on; G.TUYET_CHAM = on; G.NON_LA_GON = on; G.THE_EM_BE_CAT = on;
  SC.TP_CHINH = on ? window.__tpc : null; G.tinhLinh.clearCache(); }"""
CANH = {
    'tho-may': """([hero, ds]) => { G.testSave({ hero, lvl: 14 }); const sv = G.save, O = G.outfit; sv.gold = 3200; sv.stars = { '0-0': 3, '0-1': 3 };
        for (const q of ds) O.wear(sv, O.add(sv, q[0], q[1], { lv: q[2] || 1 }));
        G.setScene(G.Village); G.villageScene.goNpc('may', true); const V = G.villageApi.V; V.otab = 'wear'; V.pv = 'dung'; }""",
    'ong-tu': """([hero, ds]) => { G.testSave({ hero, lvl: 14 }); const sv = G.save, O = G.outfit;
        for (const q of ds) O.wear(sv, O.add(sv, q[0], q[1], { lv: q[2] || 1 }));
        G.setScene(G.Village); G.villageScene.goNpc('tu', true); }""",
}

def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function("window.G && G.scene && G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds['em-be-smith'] && G.spriteCustom.do['tp-robes-ao_vai'] && G.spriteCustom.do['tp-robes-ao_vai'].ready", timeout=90000)
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.wait_for_timeout(500)
        ca = [('tho-may', 'smith', [['non_la', 0], ['ao_vai', 0], ['bua_suong', 1]]),
              ('tho-may-2', 'healer', [['khan_xep', 1], ['giap_da', 2], ['ho_lo', 0], ['bua_hut', 1], ['canh_chuon', 0, 2]]),
              ('ong-tu', 'smith', [['non_la', 0], ['ao_the', 0], ['bua_suong', 1]])]
        for ten, hero, ds in ca:
            for nm, on in (('truoc', False), ('sau', True)):
                pg.evaluate(CO, on)
                pg.evaluate(CANH[ten.split('-2')[0]], [hero, ds])
                pg.wait_for_timeout(900)
                pg.screenshot(path=os.path.join(OUT, '%s-%s.png' % (ten, nm)))
        b.close()
    print('pageerror:', errs[:5] if errs else 'không có')

main()
