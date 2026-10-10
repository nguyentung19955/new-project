"""AUDIT giao diện điện thoại (phiên au-van-hanh-ui). CHỈ ĐO VÀ CHỤP, không sửa game.
Đo kích thước thật (CSS px) của nút, cần gạt, chữ, khoảng cách tới mép màn hình ở nhiều cỡ máy; thử vài thao tác chạm khó;
chụp ảnh HUD, màn đăng nhập ở cỡ thật và thu nhỏ 50%.
Chạy từ thư mục game:  python3 tests/au_ui.py [thư mục ảnh]   (mặc định ../docs/review/anh)
In bảng số đo dạng Markdown và ghi au_ui_so_do.json vào thư mục ảnh."""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import ROOT, URL
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh')
os.makedirs(OUT, exist_ok=True)
T = dict(has_touch=True, is_mobile=True)
# (tên, cấu hình trình duyệt, vùng an toàn giả trái/phải/dưới/trên theo CSS px — chỉ giả bằng biến CSS, không phải máy thật)
VPS = [
    ('iphone-ngang', dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, **T), None),
    ('iphone-ngang-taitho', dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, **T), (47, 47, 21, 0)),
    ('iphone-doc', dict(viewport={'width': 390, 'height': 844}, device_scale_factor=3, **T), None),
    ('iphone-se', dict(viewport={'width': 667, 'height': 375}, device_scale_factor=2, **T), None),
    ('android-nho', dict(viewport={'width': 800, 'height': 360}, device_scale_factor=3, **T), None),
    ('android-lon', dict(viewport={'width': 915, 'height': 412}, device_scale_factor=2.625, **T), None),
    ('ipad', dict(viewport={'width': 1024, 'height': 768}, device_scale_factor=2, **T), None),
    ('may-tinh', dict(viewport={'width': 960, 'height': 540}, device_scale_factor=1), None),
]
HELP = r"""
window.AU = {
  sc: null,
  freeze() { if (!AU.sc) { const sc = G.scene; AU.sc = sc; G.scene = { update() {}, draw() { sc.draw(); }, hide() {} }; } },
  thaw() { if (AU.sc) { G.scene = AU.sc; AU.sc = null; } },
  start(r, i, seed) {
    AU.thaw(); const rnd = G.srand(seed * 13 + 5); Math.random = rnd; G.rnd = rnd;
    G.testSave({ lvl: 6 + r * 7 + i, tier: Math.min(2, r), sharpen: 2, branch: 'fire', marks: 140 });
    G.startStage(r, i, 0, { kind: 'A', seed }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; return S;
  },
  // Đổi một điểm trong khung game (480x270) ra toạ độ màn hình (CSS px), hiểu cả khi khung xoay 90 độ.
  scr(x, y) {
    const st = document.getElementById('stage'), fit = document.getElementById('fit'), sh = document.getElementById('shell');
    if (G.rot) { const s = sh.getBoundingClientRect(); const lx = fit.offsetLeft + st.offsetLeft + x * G.scale, ly = fit.offsetTop + st.offsetTop + y * G.scale; return [s.right - ly, s.top + lx]; }
    const r = st.getBoundingClientRect(); return [r.left + x * G.scale, r.top + y * G.scale];
  },
  measure(sa) {
    const s = G.scale, U = G.stageUi, vw = innerWidth, vh = innerHeight;
    sa = sa || [0, 0, 0, 0]; // trái, phải, dưới, trên (CSS px)
    // mép "an toàn" theo hướng nhìn của người chơi (khi khung xoay thì vẫn là khung chữ nhật của màn hình)
    const edge = (cx, cy, r) => { const a = AU.scr(cx, cy); const rr = r * s; return Math.min(a[0] - rr - sa[0], vw - sa[1] - (a[0] + rr), a[1] - rr - sa[3], vh - sa[2] - (a[1] + rr)); };
    const btn = {};
    for (const n of ['atk', 'dodge', 'special', 'skill']) { const b = U.btnPos(n); btn[n] = { x: b[0], y: b[1], d: +(2 * b[2] * s).toFixed(1), hit: +(2 * (b[2] + 6) * s).toFixed(1), edge: +edge(b[0], b[1], b[2]).toFixed(1) }; }
    const pairs = [['atk', 'dodge'], ['atk', 'special'], ['atk', 'skill'], ['dodge', 'special'], ['special', 'skill']];
    const gap = {}; for (const [a, b] of pairs) gap[a + '-' + b] = +(Math.hypot(btn[a].x - btn[b].x, btn[a].y - btn[b].y) * s).toFixed(1);
    const st = U.stickPos();
    const rect = (b) => ({ w: +(b[2] * s).toFixed(1), h: +(b[3] * s).toFixed(1), hitH: +((b[3] + 9) * s).toFixed(1) });
    const pot = rect(U.POT), pau = rect(U.PAU);
    // mép trái/trên của ô Bình máu so với mép màn hình (tai thỏ ở bên trái khi cầm ngang)
    const potA = AU.scr(U.POT[0], U.POT[1]);
    const ws = document.getElementById('world').getBoundingClientRect();
    const devPx = s * (G.dpr || 1);
    return {
      vw, vh, dpr: G.dpr, rot: G.rot, scale: +s.toFixed(3), world: [Math.round(G.rot ? ws.height : ws.width), Math.round(G.rot ? ws.width : ws.height)],
      devPxPerPixel: +devPx.toFixed(3), integerScale: Math.abs(devPx - Math.round(devPx)) < 0.02,
      cx: +G.cx.toFixed(1), cy: +G.cy.toFixed(1), btn, gap,
      stick: { d: +(2 * st[2] * s).toFixed(1), zoneW: +((240 + G.mx) * s).toFixed(0), zoneH: +((270 - 48 + G.my) * s).toFixed(0), edge: +edge(st[0], st[1], st[2]).toFixed(1) },
      pot, pau, potEdge: +Math.min(potA[0] - sa[0], potA[1] - sa[3]).toFixed(1),
      text: { min: +(6.5 * s).toFixed(1), hud7: +(7 * s).toFixed(1), hp: +(7.5 * s).toFixed(1), title11: +(11 * s).toFixed(1) },
      imgRender: getComputedStyle(document.getElementById('world')).imageRendering,
    };
  },
};
"""
SAFE_JS = """(sa) => { const d = document.documentElement.style; d.setProperty('--sa-l', sa[0] + 'px'); d.setProperty('--sa-r', sa[1] + 'px'); d.setProperty('--sa-b', sa[2] + 'px'); d.setProperty('--sa-t', sa[3] + 'px'); window.dispatchEvent(new Event('resize')); }"""


def open_page(b, cfg):
    pg = b.new_page(**cfg)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.evaluate(HELP)
    pg.wait_for_timeout(300)
    return pg, errs


def half(path):
    im = Image.open(path)
    im.resize((im.width // 2, im.height // 2), Image.NEAREST).save(path.replace('.png', '-50.png'))


def touch(cdp, kind, pts):
    cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i, 'radiusX': 4, 'radiusY': 4, 'force': 1} for i, (x, y) in pts.items()]})


def main():
    res, errs_all = {}, []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, cfg, sa in VPS:
            pg, errs = open_page(b, cfg)
            if sa:
                pg.evaluate(SAFE_JS, list(sa)); pg.wait_for_timeout(200)
            pg.evaluate("() => { const S = AU.start(0, 1, 3); const W = S.W; G.testGoto('fight'); for (let k = 0; k < 300 && W.ents.length < 3; k++) G.sim(1); G.sim(30); S.P.hp = Math.round(S.P.maxhp * 0.62); AU.freeze(); }")
            pg.wait_for_timeout(300)
            m = pg.evaluate("(sa) => AU.measure(sa)", list(sa) if sa else None)
            res[name] = m
            path = os.path.join(OUT, f'ui-{name}.png')
            pg.screenshot(path=path, scale='css')
            if name in ('iphone-ngang', 'iphone-doc'):
                half(path)
            # phòng trùm (phòng rộng: nút thu nhỏ khi thiếu lề)
            pg.evaluate("() => { const S = AU.start(0, 4, 5); G.testGoto('boss'); G.sim(200); AU.freeze(); }")
            pg.wait_for_timeout(300)
            mb = pg.evaluate("(sa) => AU.measure(sa)", list(sa) if sa else None)
            res[name]['boss'] = {'atk': mb['btn']['atk']['d'], 'dodge': mb['btn']['dodge']['d'], 'atkEdge': mb['btn']['atk']['edge'], 'stickEdge': mb['stick']['edge']}
            if name in ('iphone-ngang', 'iphone-se', 'iphone-ngang-taitho'):
                pg.screenshot(path=os.path.join(OUT, f'ui-{name}-trum.png'), scale='css')
            # màn đăng nhập (giả "cần đăng nhập Google")
            if name in ('iphone-ngang', 'iphone-doc', 'iphone-ngang-taitho'):
                pg.evaluate("""() => { AU.thaw(); G.resetSave(); G.save.sound = false; G.setScene(G.Title);
                  G.cloud = Object.assign(Object.create(G.cloud), { why: '', status: 'ok', online: () => true, isGuest: () => true, who: () => 'Khách', isAdmin: () => false, label: () => 'Đã kết nối mây', gMsg: '' }); }""")
                pg.wait_for_timeout(700)
                pg.screenshot(path=os.path.join(OUT, f'dang-nhap-{name}.png'), scale='css')
                res[name]['title'] = pg.evaluate("() => { const s = G.scale, L = G.titleLayout; return { main: [+(L.main[2] * s).toFixed(0), +(L.main[3] * s).toFixed(0)], row: [+(L.row[0][2] * s).toFixed(0), +(L.row[0][3] * s).toFixed(0)], guest: [+(L.guest[2] * s).toFixed(0), +(L.guest[3] * s).toFixed(0)], info: +(7 * s).toFixed(1) }; }")
            errs_all += [name + ': ' + e for e in errs]
            pg.close()

        # ---- vài thao tác chạm khó (iPhone ngang) — bổ sung cho tests/ui_input.py
        pg, errs = open_page(b, VPS[0][1])
        cdp = pg.context.new_cdp_session(pg)
        pg.evaluate("() => { G.botInput = null; const S = AU.start(0, 1, 4); G.sim(30); S.P.inv = 999; S.P.mana = S.P.maxmana; }")
        pg.wait_for_timeout(200)
        sxy = lambda x, y: pg.evaluate("([x, y]) => AU.scr(x, y)", [x, y])
        U = pg.evaluate("() => ({ atk: G.stageUi.btnPos('atk'), dodge: G.stageUi.btnPos('dodge'), skill: G.stageUi.btnPos('skill'), st: G.stageUi.stickPos() })")
        st, atk, dod = U['st'], U['atk'], U['dodge']
        tests = {}
        # 1) ba ngón cùng lúc: giữ cần + giữ Đánh + chạm Né
        f = {0: sxy(st[0], st[1]), 1: sxy(atk[0], atk[1])}
        touch(cdp, 'touchStart', f); pg.wait_for_timeout(60)
        f[0] = sxy(st[0] + 22, st[1]); touch(cdp, 'touchMove', f); pg.wait_for_timeout(60)
        f[2] = sxy(dod[0], dod[1]); touch(cdp, 'touchStart', f); pg.wait_for_timeout(80)
        roles = pg.evaluate("() => [...G.pointers.values()].map((p) => p.role).sort().join(',')")
        dodge = pg.evaluate("() => { const P = G.getRun().P; return P.dodgeCd > 0 || P.dodgeT > 0; }")
        tests['ba_ngon'] = {'roles': roles, 'dodge': dodge, 'ok': roles == 'atk,dodge,joy' and dodge}
        touch(cdp, 'touchEnd', {2: f.pop(2)}); pg.wait_for_timeout(40)
        # 2) ngón giữ Đánh trượt ra ngoài khung game (vào lề an toàn ngoài #fit) rồi mới nhấc
        f[1] = (pg.evaluate("innerWidth") - 3, f[1][1]); touch(cdp, 'touchMove', f); pg.wait_for_timeout(60)
        held = pg.evaluate("() => [...G.pointers.values()].some((p) => p.role === 'atk')")
        touch(cdp, 'touchEnd', {1: f.pop(1)}); pg.wait_for_timeout(60)
        tests['truot_ra_ngoai'] = {'van_giu_khi_ra_ngoai': held, 'con_lai': pg.evaluate("G.pointers.size"), 'ok': pg.evaluate("G.pointers.size") == 1}
        touch(cdp, 'touchEnd', {}); pg.wait_for_timeout(60)
        # 3) cần gạt bắt đầu ở nửa phải màn hình (ngón cái phải lỡ chạm chỗ trống) → không đi
        x0 = pg.evaluate("G.getRun().P.x")
        f = {5: sxy(300, 150)}; touch(cdp, 'touchStart', f); f[5] = sxy(270, 150); touch(cdp, 'touchMove', f); pg.wait_for_timeout(300)
        tests['nua_phai_khong_di'] = {'role': pg.evaluate("() => [...G.pointers.values()].map((p) => p.role).join(',')"), 'dx': round(pg.evaluate("G.getRun().P.x") - x0, 1)}
        touch(cdp, 'touchEnd', {}); pg.wait_for_timeout(60)
        # 4) mép trên (y<48 đơn vị) không nhận cần gạt: ngón cái trái đặt cao
        f = {6: sxy(60, 40)}; touch(cdp, 'touchStart', f); f[6] = sxy(90, 40); touch(cdp, 'touchMove', f); pg.wait_for_timeout(200)
        tests['mep_tren_khong_nhan_can'] = {'role': pg.evaluate("() => [...G.pointers.values()].map((p) => p.role).join(',')")}
        touch(cdp, 'touchEnd', {}); pg.wait_for_timeout(60)
        # 5) đổi kích thước (thanh địa chỉ hiện/ẩn) khi đang giữ cần: ngón có bị bỏ không
        f = {7: sxy(st[0], st[1])}; touch(cdp, 'touchStart', f); f[7] = sxy(st[0] + 20, st[1]); touch(cdp, 'touchMove', f); pg.wait_for_timeout(60)
        pg.set_viewport_size({'width': 844, 'height': 340}); pg.wait_for_timeout(250)
        tests['doi_co_khi_giu'] = {'con_ngon': pg.evaluate("G.pointers.size"), 'scale_moi': round(pg.evaluate("G.scale"), 3)}
        touch(cdp, 'touchEnd', {}); pg.set_viewport_size({'width': 844, 'height': 390}); pg.wait_for_timeout(150)
        res['cham'] = tests
        errs_all += ['cham: ' + e for e in errs]
        pg.close()
        b.close()

    with open(os.path.join(OUT, 'au_ui_so_do.json'), 'w', encoding='utf-8') as fo:
        json.dump(res, fo, ensure_ascii=False, indent=1)
    # ---- bảng Markdown
    print('| Máy (CSS px) | 1 đơn vị game = px | px máy / điểm ảnh | Nút Đánh Ø (vùng chạm) | Né Ø | Chưởng/Kỹ năng Ø | Cần gạt Ø hình / vùng | Tâm nút gần nhất | Mép nút Đánh→mép an toàn | Bình máu (cao/vùng chạm) | Chữ nhỏ nhất / chữ HUD |')
    print('|---|---|---|---|---|---|---|---|---|---|---|')
    for name, _, _ in VPS:
        m = res[name]; B = m['btn']
        print(f"| {name} {m['vw']}×{m['vh']} | {m['scale']} | {m['devPxPerPixel']}{'' if m['integerScale'] else ' (lẻ)'} | {B['atk']['d']} ({B['atk']['hit']}) | {B['dodge']['d']} | {B['special']['d']}/{B['skill']['d']} | {m['stick']['d']} / {m['stick']['zoneW']}×{m['stick']['zoneH']} | {min(m['gap'].values())} | {B['atk']['edge']} | {m['pot']['h']}/{m['pot']['hitH']} | {m['text']['min']} / {m['text']['hud7']} |")
    print('chạm:', json.dumps(res['cham'], ensure_ascii=False))
    print('lỗi JS:', errs_all or 'không có')
    return 1 if errs_all else 0


if __name__ == '__main__':
    sys.exit(main())
