"""AUDIT (phiên au-vong-lap) — kiểm tra sinh phòng và vòng phòng, CHỈ ĐO, không sửa game.
Đo ba thứ:
  1. Bản đồ: nhiều hạt giống mỗi kiểu A/B/C — lỗi M.check, số bản đồ khác nhau, phân bố phòng phụ, bộ loại phòng mỗi ải.
  2. Trong game (bot chơi thật nhiều ải): mỗi lần quái mọc thì ghi khoảng cách tới em bé, có mọc trên lối cửa / ngoài sàn / đè vật
     mang hệ không; ải nào bot không xong (kẹt cửa, hết giờ) thì ghi lại; thời gian từng loại phòng.
  3. Trạng thái chìa / cửa Trùm khi gục, bỏ ải, tải lại trang: lượt chơi có bị lưu dở không.
Chạy: python3 tests/au_mapgen.py [số hạt mỗi kiểu, mặc định 3000] [số ải bot chơi, mặc định 30]
In ra JSON tóm tắt (để chép vào docs/review/AUDIT-VONG-LAP.md)."""
import sys, json, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MAPS = r"""
(n) => {
  const M = G.mapgen, out = {};
  for (const kind of M.KINDS) {
    const sigs = new Set(), sides = {}, comp = new Set(), errs = {};
    let bad = 0, steps = 0, stepsG = 0, deadEnds = 0, loops = 0;
    for (let seed = 1; seed <= n; seed++) {
      const map = M.make(kind, seed);
      const e = M.check(map);
      if (e.length) { bad++; for (const x of e) errs[x] = (errs[x] || 0) + 1; }
      sigs.add(M.sig(map));
      const s = map.rooms.find((r) => M.SIDE.includes(r.type));
      sides[s.type] = (sides[s.type] || 0) + 1;
      comp.add(map.rooms.map((r) => r.type).slice().sort().join(','));
      steps += M.walk(map, false).steps; stepsG += M.walk(map, true).steps;
      const nd = map.rooms.map((r) => M.DKEYS.filter((d) => r.doors[d] != null).length);
      deadEnds += nd.filter((k) => k === 1).length;
      const edges = nd.reduce((a, b) => a + b, 0) / 2; loops += edges - (map.rooms.length - 1);
    }
    out[kind] = { bad, errs, distinct: sigs.size, sides, roomSets: [...comp], stepsAll: +(steps / n).toFixed(1), stepsGreedy: +(stepsG / n).toFixed(1),
      deadEnds: +(deadEnds / n).toFixed(2), loops: +(loops / n).toFixed(2) };
  }
  return out;
}
"""

# Bot chơi n ải ngẫu nhiên (đủ ba vùng, có độ khó 2) với bản lưu mạnh vừa phải; ghi mọi lần quái mọc.
PLAY = r"""
([n]) => {
  const res = { runs: [], spawn: { n: 0, nearP: 0, minD: 1e9, door: 0, out: 0, onProp: 0, nearP_list: [] }, roomT: {}, stuck: [] };
  const orig = G.spawnEnemy;
  G.spawnEnemy = function (role, x, y, o) {
    const e = orig(role, x, y, o);
    const S = G.getRun(), W = S && S.W;
    if (W && W.geo && !(o && (o.add || o.sumBy)) && !e.isBoss && S.mode === 'play') {
      const P = W.P || S.P, sp = res.spawn;
      sp.n++;
      const d = Math.hypot(x - P.x, y - P.y);
      sp.minD = Math.min(sp.minD, d);
      if (d < 30) { sp.nearP++; if (sp.nearP_list.length < 8) sp.nearP_list.push([W.type, role, Math.round(d)]); }
      for (const dr of W.doors) { const q = G.roomArt.doorPos(W.geo, dr.dir); if (Math.hypot(x - q.x, y - q.y) < 22) { sp.door++; break; } }
      if (x < W.x0 - 1 || x > W.x1 + 1 || y < W.y0 - 1 || y > W.y1 + 1) sp.out++;
      if (W.props.some((p) => p.env && Math.hypot(p.x - x, p.y - y) < 10)) sp.onProp++;
    }
    return e;
  };
  try {
    for (let k = 0; k < n; k++) {
      const r = k % 3, i = (k * 7) % 5, diff = k % 5 === 4 ? 1 : 0;
      // bản lưu mạnh hơn khuyên dùng của ải một chút, để đo bản đồ chứ không đo cân bằng
      G.testSave({ lvl: [12, 24, 34][r], tier: [1, 2, 3][r], sharpen: [4, 8, 12][r], forge: 4, branch: G.ELS[k % 3], marks: 150 });
      G.save.sound = false;
      G.startStage(r, i, diff);
      const S = G.getRun(), kind = S.map.kind;
      const out = G.probeRun(900);
      const rec = { st: (r + 1) + '-' + (i + 1) + (diff ? '*' : ''), kind, win: !!out.win, t: out.t, rooms: out.rooms, stuck: !('win' in out) };
      res.runs.push(rec);
      if (rec.stuck) res.stuck.push(rec);
      for (const [type, t] of out.rooms || []) { const o = (res.roomT[type] = res.roomT[type] || { n: 0, t: 0, max: 0 }); o.n++; o.t += t; o.max = Math.max(o.max, t); }
    }
  } finally { G.spawnEnemy = orig; }
  for (const k in res.roomT) res.roomT[k].avg = +(res.roomT[k].t / res.roomT[k].n).toFixed(1);
  return res;
}
"""

# Chìa và cửa khi gục / bỏ ải / tải lại: lượt chơi chỉ sống trong bộ nhớ (S), không lưu dở.
KEYS = r"""
() => {
  const out = [];
  G.testSave({ lvl: 20, tier: 2, sharpen: 6 });
  G.startStage(0, 4, 0, { kind: 'C', seed: 7 });
  let S = G.getRun();
  const keyRoom = S.map.gate.ids[0];
  G.gotoRoom(keyRoom); S.W.ents = []; S.W.spawns = []; S.W.waveI = S.W.waves.length - 1; S.W.waveT = 0;
  const bi = G.botInput; G.botInput = () => ({ mx: 0, my: 0 }); G.sim(120); G.botInput = bi;
  out.push(['dọn 1 phòng chìa: số chìa', G.mapgen.gateCount(S.map, S.cleared)]);
  G.persist(); const saved = JSON.parse(localStorage.getItem('linhkhi_save_v1') || 'null');
  out.push(['bản lưu có trường lượt chơi dở (map/cleared/keys)?', saved ? ['run', 'map', 'cleared', 'keys', 'S'].filter((k) => k in saved) : 'không đọc được']);
  // gục
  S.P.hp = 0; S.W.over = 'dead'; G.sim(120);
  out.push(['gục: chế độ', S.mode]);
  G.startStage(0, 4, 0, { kind: 'C', seed: 7 }); S = G.getRun();
  out.push(['vào lại cùng ải sau khi gục: số chìa', G.mapgen.gateCount(S.map, S.cleared)]);
  return out;
}
"""

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    n = int(args[0]) if args else 3000
    runs = int(args[1]) if len(args) > 1 else 30
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + HERE + '/index.html')
        pg.wait_for_timeout(1200)
        pg.add_script_tag(path=HERE + '/tests/bot.js')
        pg.add_script_tag(path=HERE + '/tests/setup.js')
        maps = pg.evaluate(MAPS, n)
        print('== BẢN ĐỒ (%d hạt mỗi kiểu) ==' % n)
        for k, v in maps.items():
            print(k, json.dumps(v, ensure_ascii=False))
        keys = pg.evaluate(KEYS)
        print('== CHÌA / CỬA KHI GỤC ==')
        for a, v in keys:
            print(' ', a, ':', v)
        # tải lại trang giữa ải
        pg.evaluate("() => { G.testSave({ lvl: 20, tier: 2, sharpen: 6 }); G.persist(); G.startStage(1, 4, 0, { kind: 'C', seed: 9 }); }")
        pg.reload(); pg.wait_for_timeout(1200)
        print('  tải lại trang giữa ải: còn lượt chơi dở?', pg.evaluate("() => !!(G.getRun && G.getRun())"), '| cảnh hiện tại:', pg.evaluate("() => G.scene === G.StageScene ? 'trong ải' : 'không phải ải'"))
        pg.add_script_tag(path=HERE + '/tests/bot.js')
        pg.add_script_tag(path=HERE + '/tests/setup.js')
        play = pg.evaluate(PLAY, [runs])
        b.close()
    print('== BOT CHƠI %d ẢI ==' % runs)
    sp = play['spawn']
    print('quái mọc:', sp['n'], '| gần em bé (<30 điểm ảnh):', sp['nearP'], sp['nearP_list'], '| gần nhất:', round(sp['minD']), '| trên lối cửa (<22):', sp['door'], '| ngoài sàn:', sp['out'], '| đè vật mang hệ (<10):', sp['onProp'])
    print('thời gian từng loại phòng (giây trò chơi):', json.dumps(play['roomT'], ensure_ascii=False))
    print('không xong (kẹt/hết giờ):', len(play['stuck']), json.dumps(play['stuck'][:3], ensure_ascii=False))
    wins = sum(1 for r in play['runs'] if r['win'])
    print('thắng', wins, '/', len(play['runs']))
    tr = sum(t for r in play['runs'] for a, t in r['rooms'] if t <= 5 and a in ('start', 'fight', 'elite', 'challenge'))
    tot = sum(r['t'] for r in play['runs'])
    print('thời gian đi lại qua phòng đã dọn (ước tính, lượt <=5 giây ở phòng quái):', tr, 's /', tot, 's =', round(tr * 100 / max(1, tot)), '%')
    for r in play['runs']:
        print('  ', r['st'], r['kind'], 'thắng' if r['win'] else 'THUA', r['t'], 's', ' '.join(f"{a}:{b}" for a, b in r['rooms']))
    if errs:
        print('LỖI TRANG:', errs[:3])

main()
