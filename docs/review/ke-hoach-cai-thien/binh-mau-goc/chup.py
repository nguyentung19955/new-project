"""Chụp ảnh TRƯỚC / SAU cho phiên "Nút Bình máu lên góc" (binh-mau-goc). KHÔNG chơi thử: dựng cảnh bằng mã rồi chụp headless.
Chạy từ gốc repo:
  python3 docs/review/ke-hoach-cai-thien/binh-mau-goc/chup.py <trang .html đã build> <thư mục ra> <tiền tố> [cờ url] [vị trí lưu: trai|phai|cu]
  TRƯỚC: trang build ở commit trước phiên (git show 605fdc5d:game/dist/linh-khi.html > truoc.html).
In ra số đo (cỡ nút px, chỗ nút, chồng vùng chạm) dạng JSON và lỗi JS (nếu có). Trả mã 1 nếu có lỗi JS.
Màn: 844×390 (dpr 3), 667×375, 1280×720, cầm dọc 390×844 (game tự xoay), và các màn có tai thỏ / bo góc giả lập
bằng biến CSS --sa-* (index.html đọc env(safe-area-inset-*) qua các biến này).
"""
import json, os, sys
from playwright.sync_api import sync_playwright

TRANG = os.path.abspath(sys.argv[1])
GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'game')
OUT = os.path.abspath(sys.argv[2])
PRE = sys.argv[3]
CO = sys.argv[4] if len(sys.argv) > 4 else ''
VT = sys.argv[5] if len(sys.argv) > 5 else ''
CHI = sys.argv[6].split(',') if len(sys.argv) > 6 else None  # chỉ chụp các màn này
URL = 'file://' + TRANG + '?cloud=0' + CO
DT = dict(is_mobile=True, has_touch=True)
SIZES = {
    '844x390': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, **DT),
    '667x375': dict(viewport={'width': 667, 'height': 375}, device_scale_factor=2, **DT),
    '1280x720': dict(viewport={'width': 1280, 'height': 720}, device_scale_factor=1),
    'doc-390x844': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, **DT),  # cầm dọc: game tự xoay
    'taitho-844x390': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, **DT),  # ngang, tai thỏ bên trái
    'taitho-phai-844x390': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, **DT),  # ngang chiều kia, tai thỏ bên phải
    'taitho-doc-390x844': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, **DT),  # dọc + tai thỏ trên, thanh Home dưới
}
SA = {  # vùng an toàn iPhone 12–15 (pt): ngang 47 mỗi bên tai thỏ + 21 đáy; dọc 47 trên + 34 dưới
    'taitho-844x390': {'--sa-l': '47px', '--sa-r': '47px', '--sa-b': '21px'},
    'taitho-phai-844x390': {'--sa-l': '0px', '--sa-r': '47px', '--sa-b': '21px'},
    'taitho-doc-390x844': {'--sa-t': '47px', '--sa-b': '34px'},
}
HELP = r"""
window.T = {
  sc: null,
  freeze() { if (!T.sc) { const sc = G.scene; T.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (T.sc) { G.scene = T.sc; T.sc = null; } },
  rng(seed) { const r = G.srand(seed); Math.random = r; G.rnd = r; },
  start(r, i, seed, lvl) {
    T.thaw(); T.rng(seed * 13 + 5);
    G.testSave({ lvl: lvl || 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2, branch: 'fire', marks: 140 });
    G.save.potions = 2; G.save.stars = Object.assign(G.save.stars || {}, { '0-0': 1, '0-1': 1, '0-2': 1, '0-4': 1 }); // đã mở Đặc biệt, Chưởng, đổi vũ khí
    G.startStage(r, i, 0, { kind: 'A', seed });
    const S = G.getRun(); S.fade = 0; return S;
  },
  bay(S) {
    const W = S.W, g = W.geo, P = S.P;
    P.x = g.fx0 + (g.fx1 - g.fx0) * 0.38; P.y = g.fy1 - 34; P.face = 1;
    const es = W.ents.filter((e) => e && !e.dead && !e.isBoss);
    es.forEach((e, k) => { e.x = g.fx0 + (g.fx1 - g.fx0) * (0.55 + 0.12 * (k % 3)); e.y = g.fy1 - 30 - 26 * Math.floor(k / 3) - (k % 2) * 14; });
  },
  // số đo: nút (px CSS), Bình máu nằm trong khung vẽ (vùng an toàn) không, vùng chạm có bị nút / ô khác "ăn" không
  doRa() {
    const S = G.getRun(), U = G.stageUi, o = { scale: +G.scale.toFixed(3), rot: !!G.rot };
    if (!(U && U.boCuc && U.nutMoi && U.nutMoi())) return o;
    const B = U.boCuc(), px = (v) => Math.round(v * G.scale * 10) / 10;
    for (const k of ['atk', 'dodge', 'special', 'skill', 'potion']) if (B[k]) o[k] = px((B[k][2] + 1) * 2);
    const p = U.btnPos('potion'), r = p[2] + 1;
    o.vt = G.binhGoc ? G.binhGoc.vt() : 'truoc';
    o.binh = [Math.round(p[0] - r), Math.round(p[1] - r), Math.round(p[0] + r), Math.round(p[1] + r)]; // đơn vị khung 480×270
    // khung vẽ lớp giao diện (đã trừ vùng an toàn) theo đơn vị game: -mx .. 480+mx
    o.trongKhung = p[0] - r >= -G.mx && p[0] + r <= 480 + G.mx && p[1] - r >= -G.my && p[1] + r <= 270 + G.my;
    // thử mọi điểm trong hình nút Bình máu: phải ra 'potion' (không bị Tạm dừng / bản đồ / ô vũ khí / nút khác ăn)
    const PAU = U.PAU, OVK = G.hudGon && G.hudGon.OVK_GON, OBD = G.hudGon && G.hudGon.OBD_GON, mm = G.minimap.rect(S);
    const vao = (q, b, n) => q.x >= b[0] - n && q.x <= b[0] + b[2] + n && q.y >= b[1] - n && q.y <= b[1] + b[3] + n;
    let sai = 0, tong = 0, anTD = 0;
    for (let y = -r; y <= r; y += 1) for (let x = -r; x <= r; x += 1) {
      if (x * x + y * y > r * r) continue;
      const q = { x: p[0] + x, y: p[1] + y }; tong++;
      if (U.nutTai(q) !== 'potion') sai++;
      if (vao(q, PAU, 4) || (OVK && vao(q, OVK, 0)) || (OBD && vao(q, OBD, 0)) || vao(q, [mm[0] - 2, mm[1] - 4, mm[2] + 4, mm[3] + 7], 0)) anTD++;
    }
    o.diemThu = tong; o.diemSai = sai; o.chongOKhac = anTD;
    // vùng chạm Bình máu (bán kính + nới) có chạm vùng chạm nút Tạm dừng không
    const dem = B.dem.potion, R2 = r + dem, pa = [PAU[0] - 4, PAU[1] - 4, PAU[2] + 8, PAU[3] + 9];
    const gx = Math.max(pa[0], Math.min(p[0], pa[0] + pa[2])), gy = Math.max(pa[1], Math.min(p[1], pa[1] + pa[3]));
    o.kheTamDung = +(Math.hypot(p[0] - gx, p[1] - gy) - R2).toFixed(1);
    o.mm = mm;
    return o;
  },
};
"""
SAN = """() => { const z = G.spriteCustom && G.spriteCustom.zed; if (!z) return true; for (const k of ['zed-moi','zed-vk']) { const q = z[k]; if (q && !q.ready && G.spriteCustom.canAnh) G.spriteCustom.canAnh(k); if (q && !q.ready) return false; } return true; }"""


def main():
    os.makedirs(OUT, exist_ok=True)
    errs, so = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for sz, opt in SIZES.items():
            if CHI and sz not in CHI:
                continue
            ctx = b.new_context(**opt)
            init = ''
            if VT:
                init += "try { localStorage.setItem('linhkhi.binhViTri', %s); } catch (e) {}\n" % json.dumps(VT)
            else:
                init += "try { localStorage.removeItem('linhkhi.binhViTri'); } catch (e) {}\n"
            if sz in SA:
                init += "document.addEventListener('DOMContentLoaded', () => { const s = document.documentElement.style; %s });\n" % ' '.join(
                    "s.setProperty('%s', '%s');" % kv for kv in SA[sz].items())
            ctx.add_init_script(init)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e, sz=sz: errs.append(sz + ': ' + str(e)))
            pg.on('console', lambda m, sz=sz: errs.append(sz + ': ' + m.text) if m.type == 'error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
            pg.goto(URL)
            pg.wait_for_function('window.G && G.scene')
            pg.wait_for_timeout(600)
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.evaluate(HELP)
            try:
                pg.wait_for_function(SAN, timeout=60000)
            except Exception:
                pass
            pg.wait_for_timeout(1200)

            def shot(name, wait=350):
                pg.wait_for_timeout(wait)
                pg.screenshot(path=os.path.join(OUT, PRE + '-' + sz + '-' + name + '.png'))
                so[sz + '-' + name] = pg.evaluate('() => T.doRa()')

            # 1. Hang biển 1, phòng quái (giống ảnh chủ game): Cu Tí đánh cua, còn 2 bình
            pg.evaluate("""() => { const S = T.start(1, 0, 3); S.tut = null; S.hint = null; G.testGoto && G.testGoto('fight'); const W = S.W;
                for (let k = 0; k < 300 && W.ents.length < 2; k++) G.sim(1); G.sim(30); T.bay(S); W.banner = null;
                S.P.hp = Math.round(S.P.maxhp * 0.75); S.P.mana = S.P.maxmana * 0.62; G.sim(1); T.freeze(); }""")
            shot('phong-quai')
            # 2. máu thấp: mẹo bình máu (hộp mẹo cạnh trái) + Cu Tí đang cháy (hàng dấu trạng thái dưới thanh máu)
            pg.evaluate("""() => { T.thaw(); const S = G.getRun(), W = S.W, P = S.P; P.hp = Math.round(P.maxhp * 0.3); P.st.fire = 3;
                W.banner = { s: G.binhGoc && G.binhGoc.cau ? G.binhGoc.cau() : 'Máu thấp! Chạm ô Bình máu (góc trên bên trái) để hồi 30% máu.', col: '#ffb0a0', t: 5, tip: true, urgent: true }; G.sim(1); T.freeze(); }""")
            shot('mau-thap')
            # 3. mở bản đồ nhỏ (chạm "Bản đồ")
            pg.evaluate("""() => { T.thaw(); const S = G.getRun(); S.W.banner = null; if (S.meoG) S.meoG.an = true; S.P.st.fire = 0; if (G.hudGon && G.hudGon.moBanDo) G.hudGon.moBanDo(); G.sim(1); T.freeze(); }""")
            shot('ban-do')
            # 4. phòng trùm Hang biển (phòng rộng)
            pg.evaluate("""() => { const S = T.start(1, 4, 5); S.tut = null; S.hint = null; G.testGoto('boss'); G.sim(200); const W = S.W;
                T.bay(S); W.banner = null; S.P.hp = Math.round(S.P.maxhp * 0.6); G.sim(1); T.freeze(); }""")
            shot('trum')
            ctx.close()
        b.close()
    print(json.dumps(so, ensure_ascii=False))
    print('lỗi JS:', errs or 'không có')
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
