"""AUDIT (phiên au-vu-khi-he): đọc chiêu của sáu trùm (3 trùm vùng, 3 trùm nhỏ) và đo CỬA SỔ PHẢN CÔNG.
Chỉ đọc số, không đổi luật chơi. Chạy (từ thư mục game):  python3 tests/au_trum.py [giây mỗi pha]
- Phần 1 (trên giấy): mỗi chiêu, theo từng pha: thời gian báo trước (từ lúc trùm bắt đầu chiêu tới lúc vùng đỏ đầu tiên nổ),
  độ dài cả chiêu, thời gian nghỉ sau chiêu (b.cd), có "mệt" (choáng + nhận thêm 50% sát thương) không.
- Phần 2 (mô phỏng): em bé đứng yên, bất tử, không đánh (chỉ để trùm ra chiêu). Mỗi khung ghi: trùm đang ra chiêu không,
  trên sân có vùng đỏ đang báo / tường nước / đạn của trùm không. CỬA SỔ AN TOÀN = khoảng liên tục không có thứ gì
  đang đe doạ (vũng nằm lại trên sàn không tính vì đứng chỗ khác được). In trung bình, trung vị, ngắn nhất, và tỉ lệ thời gian.
  Đồng thời ghi thứ tự chiêu để xem có lặp lại theo mẫu không.
"""
import os, sys, json, statistics
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECS = int(sys.argv[1]) if len(sys.argv) > 1 else 90

JS = r"""
([r, i, ph, secs, seed]) => {
  G.testSave({ hero: 'smith', lvl: 30, tier: 2, sharpen: 6 });
  G.rnd = G.srand(seed);
  G.startStage(r, i, 0, { kind: 'A', seed: 3 });
  const S = G.getRun();
  G.gotoRoom(S.map.boss);
  const W = G.getWorld(), P = S.P, b = W.boss;
  // không có lớp thích nghi (bản lưu mới), để đo chiêu gốc
  b.layers = []; b.weak = [];
  let idle = true;
  const inp0 = G.botInput;
  G.botInput = () => ({ mx: 0, my: 0 });
  // đặt pha: máu ngay dưới ngưỡng
  const frac = [1, 0.6, 0.3][ph];
  b.hp = b.maxhp * frac;
  const log = [], wins = [], thinks = [];
  let t = 0, run = 0, safeT = 0, last = null, tiredT = 0, exposedT = 0, busyT = 0, moveT = 0;
  const N = secs * 60, dt = 1 / 60;
  // chờ ra mắt / chuyển pha xong
  for (let f = 0; f < 600 && (b.invuln > 0 || b.busy > 0); f++) { P.inv = 9; P.hp = P.maxhp; G.sim(1); }
  b.cd = 0.5;
  for (let f = 0; f < N; f++) {
    P.inv = 9; P.hp = P.maxhp; b.hp = Math.min(b.hp, b.maxhp * frac);
    // em bé đứng cách trùm khoảng 80 điểm ảnh (giữa tầm gần và tầm xa)
    const k0 = b.last;
    const busy0 = b.busy;
    G.sim(1);
    if (b.busy > busy0 + 0.05) thinks.push({ t: +(t).toFixed(2), k: b.last });
    const threat = W.zones.some((z) => z.team !== 'player' && z.team !== 'fx' && (z.wall || z.wave || (z.t > 0 && !(z.wait > 0)) )) || W.projs.some((o) => o.team === 'enemy') || !!b.lunge;
    if (b.tired > 0) tiredT += dt;
    if (b.exposed > 0) exposedT += dt;
    if (b.busy > 0) busyT += dt; else if (b.moving) moveT += dt;
    if (!threat) { run += dt; safeT += dt; } else if (run > 0) { wins.push(run); run = 0; }
    t += dt;
  }
  if (run > 0) wins.push(run);
  G.botInput = inp0;
  return { name: b.name, kind: b.kind, wins, safeT, total: t, thinks, tiredT, exposedT, busyT, moveT };
}
"""

STATIC = r"""
([r, i]) => {
  G.testSave({ hero: 'smith', lvl: 30, tier: 2 });
  G.startStage(r, i, 0, { kind: 'A', seed: 3 });
  const S = G.getRun();
  G.gotoRoom(S.map.boss);
  const b = G.getWorld().boss, MA = G.monsterArt, L = MA.list.find((x) => x.id === b.art);
  const out = { name: b.name, kind: b.kind, art: b.art, hp: Math.round(b.maxhp), dmg: Math.round(b.dmg), anims: {} };
  for (const a of L.anims) out.anims[a.id] = { d: +MA.dur(b.art, a.id).toFixed(3), moc: a.moc };
  return out;
}
"""

BOSSES = [(0, 4, 'Mộc Tinh'), (1, 4, 'Ngư Tinh'), (2, 4, 'Hồ Tinh'), (0, 2, 'Nấm Chúa (trùm nhỏ)'), (1, 2, 'Cua Đá (trùm nhỏ)'), (2, 2, 'Hổ Lửa (trùm nhỏ)')]


def main():
    errs = []
    res = {'static': [], 'sim': []}
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        print('== PHẦN 1: chiêu trên giấy (giây, ở pha 1; pha 2 nhanh x1,1, pha 3 x1,2 với trùm vùng; trùm nhỏ x1,08 / x1,16)')
        for r, i, nm in BOSSES:
            st = pg.evaluate(STATIC, [r, i])
            res['static'].append(st)
            print('--', nm, '| máu', st['hp'], '| sát thương gốc', st['dmg'], '| hình', st['art'])
            for k, a in st['anims'].items():
                if a['moc'] or k.startswith('c') or k.startswith('chieu') or k in ('atk', 'tele'):
                    T = a['d'] * a['moc'][0] if a['moc'] else None
                    print('   %-8s dài %.2f  báo trước tới %s' % (k, a['d'], ('%.2f' % T) if T is not None else '-'))
        print('\n== PHẦN 2: cửa sổ an toàn (không vùng đỏ đang báo, không đạn, trùm không lao) — em bé bất tử đứng yên, %d giây mỗi pha' % SECS)
        print('%-22s %4s %6s %6s %6s %6s %7s %7s %7s  %s' % ('trùm', 'pha', 'số', 'tb', 'trung', 'dài', '%an', '%mệt', '%đi', 'chiêu (12 đầu)'))
        for r, i, nm in BOSSES:
            for ph in range(3):
                out = pg.evaluate(JS, [r, i, ph, SECS, 11 + ph])
                w = [x for x in out['wins'] if x >= 0.05]
                res['sim'].append(dict(out, ph=ph, nm=nm))
                seq = ' '.join(x['k'] or '?' for x in out['thinks'][:12])
                print('%-22s %4d %6d %6.2f %6.2f %6.2f %6.0f%% %6.0f%% %6.0f%%  %s' % (nm[:22], ph + 1, len(w), statistics.mean(w) if w else 0, statistics.median(w) if w else 0, max(w) if w else 0,
                      100 * out['safeT'] / out['total'], 100 * out['tiredT'] / out['total'], 100 * out['moveT'] / out['total'], seq))
                sys.stdout.flush()
        br.close()
    out = os.path.join(ROOT, 'tests', 'au_trum_ketqua.json')
    with open(out, 'w') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    print('đã ghi', out)
    if errs:
        print('LỖI JS:', errs[:5]); sys.exit(1)


main()
