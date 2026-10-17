"""Soát máy cho phiên "Tư vấn 17/10 — dễ đọc" (không chơi tay; bot dựng cảnh bằng mã).
Chạy từ gốc repo:
  python3 docs/review/ke-hoach-cai-thien/tu-van-17-10-de-doc/soat.py <trang mới .html> [<trang TRƯỚC .html>] [--chi-loi]
  (trang có thể là địa chỉ http://…, vd bản web hai tệp: python3 -m http.server 8765 -d game/dist rồi http://127.0.0.1:8765/linh-khi-nhe.html)
1. Lỗi JS: dựng 5 cảnh (phòng quái có mẹo, ải hướng dẫn, phòng trùm có cảnh báo, trùm Sông sâu, HUD + chạm bản đồ) ở mặc định,
   khi tắt TỪNG cờ, tắt hết, và ?manrong=1 — 844×390 và 1280×720.
2. Tắt hết cờ = như cũ: vẽ lớp giao diện (canvas #ui) với đồng hồ G.time cố định, so với trang TRƯỚC → số điểm ảnh khác.
3. Nút: cỡ (px CSS) từng nút; vùng chạm (bán kính vẽ + phần nới) giữa mọi cặp nút có chồng nhau không; mọi điểm trong hình nút nào
   thì G.stageUi.nutTai trả đúng nút đó (Đánh không "ăn" chạm của nút khác) — 3 cỡ nút (Nhỏ / Vừa / To), 2 cỡ màn.
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ARG = [a for a in sys.argv[1:] if not a.startswith('--')]
URLF = lambda a: a if a.startswith('http') else 'file://' + os.path.abspath(a)  # bản web (hai tệp) cần chạy qua máy chủ http
MOI = URLF(ARG[0])
CU = URLF(ARG[1]) if len(ARG) > 1 else None
CHI_LOI = '--chi-loi' in sys.argv  # chỉ soát lỗi JS (dùng cho bản web)
GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'game')
SIZES = {
    '844x390': dict(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=2),
    '1280x720': dict(viewport={'width': 1280, 'height': 720}, device_scale_factor=1),
}
CO = {'mac-dinh': '', 'meogon=0': '&meogon=0', 'baotrum=0': '&baotrum=0', 'binhto=0': '&binhto=0', 'hudgon=0': '&hudgon=0',
      'ansucmanh=0': '&ansucmanh=0', 'tat-het': '&meogon=0&baotrum=0&binhto=0&hudgon=0&ansucmanh=0', 'manrong=1': '&manrong=1'}
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed, lvl) { T.thaw(); T.rng(seed * 13 + 5); G.testSave({ lvl: lvl || 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2, branch: 'fire', marks: 140 });
    G.save.potions = 2; G.startStage(r, i, 0, { kind: 'A', seed }); const S = G.getRun(); S.fade = 0; return S; },
  // vẽ riêng lớp giao diện với đồng hồ cố định (so TRƯỚC / tắt hết cờ)
  ve(t) { const c = G.ux, cv = c.canvas; G.time = t; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(G.uiScale, 0, 0, G.uiScale, G.ox * G.dpr, G.oy * G.dpr); G.scene.draw(); return cv.toDataURL('image/png'); },
};
"""
CANH = [
    ("meo", """() => { const S = T.start(0, 1, 3); S.tut = null; S.hint = null; const W = S.W; for (let k = 0; k < 300 && W.ents.length < 3; k++) G.sim(1); G.sim(20);
        W.banner = { s: G.MOVE_TIPS.sword, col: '#ffd27a', t: 5, tip: true }; T.freeze(); }"""),
    ("huong-dan", """() => { T.thaw(); G.testSave({ lvl: 1 }); G.save.tut.done = false; G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); const S = G.getRun(); S.fade = 0; G.sim(90); T.freeze(); }"""),
    ("trum", """() => { const S = T.start(0, 4, 5); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(200); const W = S.W, b = W.boss;
        if (b) { b.hp = b.maxhp * 0.55; b.exposed = 3; } W.banner = { s: G.t('{0} nổi giận!', b.name), col: '#ff6a5a', t: 3 }; G.sim(1); T.freeze(); }"""),
    ("trum-song", """() => { const S = T.start(3, 4, 5, 40); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(260); const W = S.W, b = W.boss;
        if (b) { b.hp = b.maxhp * 0.7; b.exposed = 3; } const el = b && b.el && G.WEAK[b.el] ? b.el : 'fire';
        W.banner = { s: G.t('Hệ {0}: đánh bằng {1}!', G.EL[el].name, G.EL[G.WEAK[el]].name), col: G.EL[el].col, t: 3.2, icon: 'gd-he-' + G.WEAK[el] }; G.sim(1); T.freeze(); }"""),
    ("hud", """() => { const S = T.start(1, 1, 3); S.tut = null; S.hint = null; const W = S.W; for (let k = 0; k < 300 && W.ents.length < 3; k++) G.sim(1); G.sim(30);
        W.banner = null; T.freeze(); if (G.hudGon && G.hudGon.moBanDo) G.hudGon.moBanDo(); }"""),
]
NUT = r"""
() => {
  const U = G.stageUi, out = {}, md0 = G.moDan;
  G.moDan = null; // đủ 5 nút (mở dần coi như đã mở hết)
  for (const co of ['nho', 'vua', 'to']) {
    if (co === 'vua') delete G.save.coNut; else G.save.coNut = co;
    U.xoaBoCuc(); const B = U.boCuc(), mo = (f) => !G.moDan || G.moDan.co(f), r = {};
    const ten = ['atk', 'dodge', 'special', 'skill', 'potion'].filter((k) => (k !== 'special' || mo('dacBiet')) && (k !== 'skill' || mo('chuong'))); // nút chưa mở thì không có
    for (const k of ten) r[k] = { px: Math.round((B[k][2] + 1) * 2 * G.scale * 10) / 10, x: B[k][0], y: B[k][1] };
    // khe hẹp nhất giữa hai vùng chạm (âm = chồng nhau), đơn vị px CSS
    let khe = 1e9, cap = null;
    for (let i = 0; i < ten.length; i++) for (let j = i + 1; j < ten.length; j++) {
      const a = B[ten[i]], b = B[ten[j]], d = Math.hypot(a[0] - b[0], a[1] - b[1]) - (a[2] + 1 + B.dem[ten[i]]) - (b[2] + 1 + B.dem[ten[j]]);
      if (d < khe) { khe = d; cap = ten[i] + '-' + ten[j]; }
    }
    // mọi điểm trong hình nút → đúng nút đó
    let sai = 0, tong = 0;
    for (const k of ten) { const b = B[k], R = b[2] + 1;
      for (let dx = -R; dx <= R; dx += 1) for (let dy = -R; dy <= R; dy += 1) { if (dx * dx + dy * dy > R * R) continue; tong++; const h = U.nutTai({ x: b[0] + dx, y: b[1] + dy }); if (h !== k) sai++; } }
    out[co] = { nut: r, kheNhoNhatPx: Math.round(khe * G.scale * 10) / 10, cap, diemSai: sai, diemThu: tong };
  }
  delete G.save.coNut; G.moDan = md0; U.xoaBoCuc();
  return out;
}
"""


def png(s):
    return np.array(Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))).convert('RGBA'))


def mo(b, sz, url, errs, nhan):
    pg = b.new_page(**SIZES[sz])
    pg.on('pageerror', lambda e: errs.append(nhan + ': ' + str(e)))
    pg.on('console', lambda m: errs.append(nhan + ': ' + m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
    pg.goto(url)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(500)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate(HELP)
    pg.evaluate("() => { G.TAI_VUNG = false; }")  # bản web: vào ải ngay, không chờ màn tải ảnh vùng (soát lỗi JS)
    pg.wait_for_timeout(1500)
    return pg


def main():
    kq = {'loi': {}, 'so_ui': {}, 'nut': {}}
    with sync_playwright() as p:
        b = p.chromium.launch()
        # 1. lỗi JS
        for ten, co in CO.items():
            for sz in SIZES:
                errs = []
                pg = mo(b, sz, MOI + '?cloud=0' + co, errs, ten + ' ' + sz)
                for nm, js in CANH:
                    pg.evaluate(js); pg.wait_for_timeout(250)
                    # chạy tiếp 2 giây có chạm giả (hộp mẹo ẩn, bản đồ, vũ khí) để soát nhánh vẽ / chạm
                    pg.evaluate("() => { T.thaw(); const S = G.getRun(); if (S && S.mode === 'play') { const o = G.hudGon ? G.hudGon.OBD_GON : [450, 5, 30, 30]; G.downs.push({ id: 99, x: o[0] + 5, y: o[1] + 5, sx: o[0] + 5, sy: o[1] + 5, role: null }); } }")
                    pg.wait_for_timeout(1200)
                    pg.evaluate("() => { G.downs.length = 0; }")
                kq['loi'][ten + ' ' + sz] = len(errs)
                if errs: kq['loi'][ten + ' ' + sz + ' (mẫu)'] = errs[:3]
                pg.close()
        if CHI_LOI:
            b.close(); print(json.dumps(kq, ensure_ascii=False, indent=1)); return
        # 2. tắt hết = TRƯỚC (lớp giao diện, đồng hồ cố định)
        if CU:
            for sz in SIZES:
                e1, e2 = [], []
                p1 = mo(b, sz, CU + '?cloud=0', e1, 'truoc')
                p2 = mo(b, sz, MOI + '?cloud=0' + CO['tat-het'], e2, 'tat-het')
                for nm, js in CANH:
                    p1.evaluate(js); p2.evaluate(js)
                    # hai trang cùng hạt giống, cùng số nhịp → cùng cảnh; vẽ lớp UI với G.time = 123,456
                    for t in (123.456, 123.456, 124.9):  # vẽ 2 lần cùng giờ: lần đầu thanh máu "tụt dần" (đồng hồ máy) còn khởi động
                        a, c = png(p1.evaluate('(t) => T.ve(t)', t)), png(p2.evaluate('(t) => T.ve(t)', t))
                        kq['so_ui'][sz + ' ' + nm + ' t=' + str(t)] = int((np.abs(a.astype(int) - c.astype(int)).max(axis=2) > 0).sum()) if a.shape == c.shape else 'khác cỡ'
                p1.close(); p2.close()
        # 3. nút
        for co in ('mac-dinh', 'binhto=0'):
            for sz in SIZES:
                errs = []
                pg = mo(b, sz, MOI + '?cloud=0' + CO[co], errs, 'nut')
                pg.evaluate(CANH[4][1])
                kq['nut'][co + ' ' + sz] = pg.evaluate(NUT)
                pg.close()
        b.close()
    print(json.dumps(kq, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
