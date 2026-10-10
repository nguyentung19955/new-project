"""AUDIT hiệu năng chạy thật (phiên au-van-hanh-ui, mục 7.3). CHỈ ĐO, không sửa game.
Khác tests/perf.py (đo thời gian tính một khung, không vẽ ra màn hình): bài này để game chạy bằng vòng lặp thật
(requestAnimationFrame) ở cỡ iPhone ngang 844x390, mật độ điểm ảnh 3, trong phòng đông quái (14 quái không chết + bot tự đánh),
và đo:
  - khoảng cách giữa các khung (ms), số khung chậm > 20 ms và > 33 ms;
  - bộ nhớ JS (heap) lấy mẫu mỗi 0,5 giây: tăng dần theo thời gian (rò rỉ?) và lượng rác tạo ra mỗi giây (tổng phần tăng giữa hai lần dọn rác).
Chạy ba chế độ (+ một lượt dài đo bộ nhớ): máy nhanh (CPU thật của máy kiểm tra) và giả máy yếu (CDP làm chậm CPU 4 lần — chỉ là ước lượng, KHÔNG thay cho điện thoại thật; máy kiểm tra không có GPU nên phần dán hình cũng bị làm chậm),
và CPU chậm 4 lần với mật độ điểm ảnh 1 (so ảnh hưởng của lớp chữ #ui nét cao).
Chạy từ thư mục game:  python3 tests/au_hieunang.py [giây đo mỗi chế độ, mặc định 20] [giây đo bộ nhớ dài, mặc định 180]"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import ROOT, URL
from playwright.sync_api import sync_playwright

SEC = int(sys.argv[1]) if len(sys.argv) > 1 else 20
LONG = int(sys.argv[2]) if len(sys.argv) > 2 else 180
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh')
SETUP = r"""
() => {
  G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, tier: 1, sharpen: 3, branch: 'fire', marks: 300 });
  G.startStage(1, 2, 0, { kind: 'A', seed: 4242 });
  const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null;
  G.testGoto('fight');
  const W = S.W, P = S.P;
  W.waves = []; W.spawns = [];
  Object.assign(G.botCfg, { explore: false, props: false });
  const roles = ['rusher', 'swarm', 'shield', 'kami', 'nimble', 'bomber', 'archer', 'spiky', 'elite'];
  window.__fill = () => {
    const S = G.getRun(); if (!S || G.scene !== G.StageScene) return;
    const W = S.W, P = S.P; if (S.mode !== 'play') S.mode = 'play';
    const rw = W.x1 - W.x0 - 20, rh = W.y1 - W.y0 - 30;
    let n = W.ents.length;
    for (let i = n; i < 14; i++) { const e = G.spawnEnemy(roles[i % roles.length], W.x0 + 10 + (i * 53) % rw, W.y0 + 20 + (i * 37) % rh, { hpMult: 1e5 }); e.inside = true; }
    P.hp = P.maxhp; P.mana = Math.max(P.mana, 30); W.over = null;
  };
  setInterval(window.__fill, 250);
  // ghi khoảng cách giữa các khung bằng chính vòng rAF (đặt thêm một vòng đo song song)
  window.__ft = []; let last = 0;
  const loop = (t) => { if (last) window.__ft.push(t - last); last = t; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  window.__heap = [];
  setInterval(() => { if (performance.memory) window.__heap.push([performance.now(), performance.memory.usedJSHeapSize]); }, 500);
  return true;
}
"""


def stats(ft):
    ft = sorted(ft)
    n = len(ft)
    if not n:
        return {}
    pct = lambda q: round(ft[min(n - 1, int(q * n))], 1)
    return {'khung': n, 'tb_ms': round(sum(ft) / n, 2), 'fps_tb': round(1000 * n / sum(ft), 1), 'p50': pct(0.5), 'p95': pct(0.95), 'p99': pct(0.99), 'max': round(ft[-1], 1),
            'cham20': sum(1 for x in ft if x > 20), 'cham33': sum(1 for x in ft if x > 33.4)}


def heap_stats(h):
    if len(h) < 4:
        return {}
    up = sum(max(0, h[i][1] - h[i - 1][1]) for i in range(1, len(h)))
    gcs = sum(1 for i in range(1, len(h)) if h[i][1] < h[i - 1][1] - 200_000)
    dur = (h[-1][0] - h[0][0]) / 1000
    third = max(1, len(h) // 3)
    lo_first = min(x[1] for x in h[:third]); lo_last = min(x[1] for x in h[-third:])
    return {'giay': round(dur), 'rac_MB_moi_giay': round(up / dur / 1e6, 2), 'lan_don_rac_thay_duoc': gcs,
            'day_heap_dau_MB': round(lo_first / 1e6, 1), 'day_heap_cuoi_MB': round(lo_last / 1e6, 1), 'max_MB': round(max(x[1] for x in h) / 1e6, 1)}


def run(p, throttle, sec, dpr=3):
    b = p.chromium.launch(args=['--enable-precise-memory-info', '--js-flags=--expose-gc'])
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=dpr, is_mobile=True, has_touch=True)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_function('window.G && G.scene')
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
    pg.wait_for_timeout(300)
    cdp = pg.context.new_cdp_session(pg)
    if throttle > 1:
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': throttle})
    pg.evaluate(SETUP)
    pg.wait_for_timeout(2000)
    pg.evaluate("() => { window.__ft = []; window.__heap = []; }")
    pg.wait_for_timeout(sec * 1000)
    ft = pg.evaluate("window.__ft"); heap = pg.evaluate("window.__heap")
    extra = pg.evaluate("() => ({ parts: G.fx.stats ? G.fx.stats() : null, ents: G.getWorld().ents.length, ui: [document.getElementById('ui').width, document.getElementById('ui').height], mode: G.getRun() && G.getRun().mode })")
    b.close()
    return {'khung': stats(ft), 'bo_nho': heap_stats(heap), 'luc_cuoi': extra, 'loi': errs[:3]}


def main():
    res = {}
    with sync_playwright() as p:
        res['may_nhanh'] = run(p, 1, SEC); print('máy nhanh:', json.dumps(res['may_nhanh'], ensure_ascii=False))
        res['cpu_cham_4x'] = run(p, 4, SEC); print('CPU chậm 4x:', json.dumps(res['cpu_cham_4x'], ensure_ascii=False))
        # cùng CPU chậm 4x nhưng mật độ điểm ảnh 1: lớp chữ #ui nhỏ hơn 9 lần → xem phần vẽ lớp chữ nặng cỡ nào
        res['cpu_cham_4x_dpr1'] = run(p, 4, SEC, 1); print('CPU chậm 4x, dpr 1:', json.dumps(res['cpu_cham_4x_dpr1'], ensure_ascii=False))
        if LONG:
            res['bo_nho_dai'] = run(p, 1, LONG); print(f'bộ nhớ {LONG} giây:', json.dumps(res['bo_nho_dai'], ensure_ascii=False))
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'au_hieunang.json'), 'w', encoding='utf-8') as fo:
        json.dump(res, fo, ensure_ascii=False, indent=1)
    return 1 if any(v['loi'] for v in res.values()) else 0


if __name__ == '__main__':
    sys.exit(main())
