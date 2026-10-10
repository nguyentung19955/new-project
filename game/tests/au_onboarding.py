"""AUDIT onboarding (phiên au-kien-truc-tiep-can): chơi như NGƯỜI MỚI từ bản lưu trống, cỡ 844x390 cảm ứng.
  cd game && python3 tests/au_onboarding.py
Màn chào -> làng -> Chú Lái Đò -> ải 1 (ải hướng dẫn) -> trùm đầu -> bảng kết quả -> về làng -> ải 2.
- Phần "đứng nhìn" và các bước bấm dùng cảm ứng thật (Playwright touchscreen) như người chơi.
- Phần đánh trong ải để bot (tests/bot.js) tự chơi bằng G.sim cho nhanh; mỗi lần sang phòng thì dừng lại vẽ và chụp.
- Ghi lại: lời chỉ dẫn (S.hint), dòng báo (W.banner), chữ trên nút, số dòng lời chỉ dẫn và lời chỉ dẫn có bị bỏ không vẽ vì quá dài,
  các tiếng G.sfx được gọi (chỉ đếm tên, không nghe).
Ảnh: docs/review/anh/onboarding/*.png   Số liệu: docs/review/anh/onboarding/onboarding.json
KHÔNG sửa game: chỉ đọc trạng thái và bấm như người chơi."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
OUT = os.path.join(REPO, 'docs', 'review', 'anh', 'onboarding')
URL = 'file://' + ROOT + '/index.html'
BOT = open(os.path.join(ROOT, 'tests', 'bot.js'), encoding='utf-8').read()

# Ghi tiếng: bọc G.sfx để đếm (trước khi kiểm tra có âm thanh hay không, nên đếm cả lúc máy không phát).
SPY = r"""
window.__sfx = []; window.__sfxOn = true;
const t0 = setInterval(() => { if (window.G && G.sfx && !G.__spy) { const f = G.sfx; G.__spy = 1;
  G.sfx = function (n, p) { if (window.__sfxOn) window.__sfx.push([n, +(G.time || 0).toFixed(2), G.scene === G.StageScene && G.getRun() ? G.getRun().idx : -1]); return f(n, p); }; clearInterval(t0); } }, 5);
"""

STATE = r"""() => {
  const S = G.getRun && G.getRun();
  const sc = G.scene === G.Title ? 'title' : G.scene === G.Village ? 'village' : G.scene === G.StageScene ? 'stage' : '?';
  const o = { scene: sc, t: +G.time.toFixed(1) };
  if (sc === 'village') { const V = G.villageApi.V, VS = G.villageScene.state; o.tab = V.tab; o.near = VS.near && VS.near.id; o.news = Object.keys(VS.news || {}).filter(k => VS.news[k]); o.hintT = +(VS.hintT || 0).toFixed(1); o.msg = VS.msgT > 0 ? VS.msg : null; }
  if (sc === 'stage' && S) {
    const W = S.W, P = S.P;
    o.mode = S.mode; o.room = S.idx; o.type = W.type; o.tut = !!S.tut; o.hint = S.hint; o.banner = W.banner ? W.banner.s : null;
    o.cleared = !!W.cleared; o.hp = Math.round(P.hp); o.maxhp = P.maxhp; o.mana = Math.round(P.mana); o.potions = P.potions;
    o.ents = W.ents.filter(e => !e.dead).length; o.roles = [...new Set(W.ents.filter(e => !e.dead).map(e => e.role))];
    // lời chỉ dẫn có vẽ được hết không (theo đúng phép đo trong stage.js drawHud: rộng hw-9, cỡ 7, đáy 186)
    if (S.hint) { const hw = W.geo.big ? 64 : 118, hy = W.geo.big ? 100 : 93; const L = G.ui.wrap(S.hint, hw - 9, 7); o.hintLines = L.length; o.hintBottom = Math.round(hy + L.length * 9.5 + 7); o.hintDrawn = o.hintBottom <= 186; }
  }
  return o;
}"""

def main():
    os.makedirs(OUT, exist_ok=True)
    log = {'steps': [], 'errs': []}
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: log['errs'].append(str(e)))
        pg.add_init_script(SPY)
        pg.goto(URL)
        pg.evaluate('localStorage.clear()')  # bản lưu trống như người mới
        pg.reload()
        pg.wait_for_function('window.G && G.scene && G.__spy')
        pg.wait_for_timeout(600)

        def xy(x, y):
            r = pg.evaluate("(() => { const r = document.getElementById('stage').getBoundingClientRect(); return [r.left, r.top, G.scale]; })()")
            return r[0] + x * r[2], r[1] + y * r[2]

        def tap(x, y, ms=200):
            cx, cy = xy(x, y)
            pg.touchscreen.tap(cx, cy)
            pg.wait_for_timeout(ms)

        def step(name, note=''):
            st = pg.evaluate(STATE)
            st['name'] = name; st['note'] = note
            path = os.path.join(OUT, name + '.png')
            pg.screenshot(path=path)
            log['steps'].append(st)
            print(name, json.dumps(st, ensure_ascii=False)[:300])
            return st

        # 1. Màn chào (mở tệp trên máy: không có mây => "Chạm để bắt đầu")
        step('01-man-chao', 'mở lần đầu, không có mây')
        tap(240, 200, 600)
        step('02-lang-vua-vao', 'chạm màn chào -> làng')
        pg.wait_for_timeout(3500)
        step('03-lang-sau-4-giay', 'đứng yên 4 giây')
        pg.wait_for_timeout(6000)
        step('04-lang-sau-10-giay', 'đứng yên 10 giây: gợi ý 9 giây đầu tắt, gợi ý bến đò hiện')
        # 2. Chạm khuôn mặt Chú Lái Đò ở dải lối tắt (ô đầu tiên, x = 240 - 3*31 = 147)
        tap(147, 28, 300)
        step('05-cham-lai-do', 'chạm lần 1: em bé chạy tới')
        pg.wait_for_timeout(2500)
        if pg.evaluate('G.villageApi.V.tab') != 'map':
            tap(147, 28, 400)
        step('06-ban-do-chon-ai', 'bản đồ chọn ải')
        # 3. Lên đò
        tap(436, 236, 800)
        step('07-ai1-phong-dau', 'vào ải 1 (ải hướng dẫn), chưa bấm gì')
        pg.wait_for_timeout(4000)
        step('08-ai1-dung-yen-4s', 'người mới đứng yên 4 giây: quái tới đánh')
        # 4. Bot chơi tiếp; mỗi lần sang phòng hoặc đổi chế độ thì chụp
        pg.add_script_tag(content=BOT)
        pg.evaluate("G.botCfg.explore = true")
        seen = set(); last_mode = None; k = 9
        for it in range(900):
            info = pg.evaluate("(() => { const S = G.getRun(); if (!S || G.scene !== G.StageScene) return null; G.sim(20); const W = S.W; return [S.idx, W.type, S.mode, !!W.cleared, !!W.boss, S.roomT]; })()")
            if info is None:
                break
            idx, typ, mode, cleared, boss, roomT = info
            key = (idx, cleared)
            if mode in ('chest', 'swap', 'merchant', 'curse') and mode != last_mode:
                pg.wait_for_timeout(150); step('%02d-bang-%s' % (k, mode), 'bảng ' + mode); k += 1
                pg.evaluate("(() => { const S = G.getRun(); G.click = {x: S.mode === 'chest' ? 126 : S.mode==='swap' ? 97 : S.mode==='merchant' ? 127 : 318, y: S.mode==='chest' ? 134 : S.mode==='swap' ? 218 : S.mode==='merchant' ? 194 : 182}; G.ui.begin(); G.scene.draw(); G.click = null; })()")
            if mode in ('result', 'dead'):
                pg.wait_for_timeout(700); step('%02d-ket-qua' % k, 'bảng kết quả'); k += 1
                break
            last_mode = mode
            if key not in seen and mode == 'play':
                seen.add(key)
                pg.wait_for_timeout(150)
                step('%02d-phong%d-%s%s' % (k, idx, typ, '-xong' if cleared else ''), 'vào phòng' if not cleared else 'vừa dọn xong'); k += 1
                if boss and not cleared:
                    pg.evaluate('G.sim(150)'); pg.wait_for_timeout(150)
                    step('%02d-trum-giua-tran' % k, 'trùm, sau 2,5 giây'); k += 1
        # 5. Bước vào cổng / kết quả -> về làng
        st = pg.evaluate("(() => { const S = G.getRun(); return S ? S.mode : null; })()")
        if st == 'play':
            pg.evaluate("G.usePortal && G.usePortal()"); pg.wait_for_timeout(800)
            step('%02d-ket-qua' % k, 'bảng kết quả'); k += 1
        log['result'] = pg.evaluate("(() => { const S = G.getRun(); return S && S.result ? { win: S.result.win, lines: S.result.lines.map(l => l.s || l), stars: S.result.stars, up: S.result.up } : null; })()")
        # nút Về làng: tìm theo chữ trên bảng không được (canvas) -> dùng lối đi của trò chơi: G.setScene(G.Village) sau khi đọc bảng
        pg.evaluate("G.setScene(G.Village)"); pg.wait_for_timeout(1500)
        step('%02d-lang-sau-ai1' % k, 'về làng sau ải 1'); k += 1
        pg.wait_for_timeout(9000)
        step('%02d-lang-sau-ai1-10s' % k, 'đứng 10 giây ở làng sau ải 1'); k += 1
        # 6. Các bảng người mới sẽ mở sau ải 1 (theo dấu chấm đỏ): Kỹ năng (Cụ Đồ), Lò rèn, Hành trang
        for nm, x in (('cu-do', 271), ('lo-ren', 178), ('hang-xen', 209), ('tho-may', 240)):
            tap(x, 28, 300); pg.wait_for_timeout(2500)
            if pg.evaluate('G.villageApi.V.tab') == 'hub':
                tap(x, 28, 500)
            pg.wait_for_timeout(400)
            step('%02d-bang-%s' % (k, nm), 'mở bảng ' + nm + ' lần đầu'); k += 1
            tap(436, 57, 500)
        hub = pg.evaluate('G.hanhTrang && G.hanhTrang.HUB')
        if hub:
            tap(hub[0] + hub[2] / 2, hub[1] + hub[3] / 2, 600)
            step('%02d-hanh-trang' % k, 'mở Hành trang lần đầu'); k += 1
            pg.evaluate("G.keyP.Escape = true"); pg.wait_for_timeout(300)
            pg.evaluate("G.villageApi.goHub()"); pg.wait_for_timeout(300)
        # 7. Ải 2: mẹo nút Chưởng lần đầu
        tap(147, 28, 300); pg.wait_for_timeout(2500)
        if pg.evaluate('G.villageApi.V.tab') != 'map':
            tap(147, 28, 400)
        step('%02d-ban-do-ai2' % k, 'bản đồ, chọn sẵn ải 2'); k += 1
        tap(436, 236, 800)
        pg.wait_for_timeout(2500)
        step('%02d-ai2-vao' % k, 'ải 2, 2,5 giây đầu: không còn chữ trên nút'); k += 1
        pg.wait_for_timeout(2500)
        step('%02d-ai2-5s' % k, 'ải 2, 5 giây'); k += 1
        log['sfx'] = pg.evaluate('window.__sfx')
        log['save_after'] = pg.evaluate("({ lvl: G.save.heroes.smith.lvl, gold: G.save.gold, ore: G.save.ore, stars: G.save.stars, tut: G.save.tut, weapons: G.save.weapons.length })")
        b.close()
    cnt = {}
    for n, _, _r in log['sfx']:
        cnt[n] = cnt.get(n, 0) + 1
    log['sfx_count'] = cnt
    del log['sfx']
    with open(os.path.join(OUT, 'onboarding.json'), 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=1)
    print('sfx:', cnt)
    print('lỗi trang:', log['errs'][:3])
    print('ảnh:', OUT)


if __name__ == '__main__':
    main()
