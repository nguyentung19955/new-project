"""Kiểm tra bộ sinh bản đồ ải: mỗi kiểu A, B, C thử nhiều hạt giống.
Mỗi bản đồ phải đủ 8 phòng, mọi phòng tới được, Suối hồi ngay trước Trùm, không có lối tắt bỏ qua điều kiện mở cửa Trùm.
Chạy: python3 tests/mapgen.py [số hạt giống mỗi kiểu, mặc định 1000]"""
import sys
from playwright.sync_api import sync_playwright

JS = r"""
(n) => {
  const M = G.mapgen, out = { kinds: {}, fails: [] };
  for (const kind of M.KINDS) {
    const sigs = new Set(), sides = {}, shapes = new Set();
    let bad = 0, steps = 0;
    for (let seed = 1; seed <= n; seed++) {
      let map;
      try { map = M.make(kind, seed); } catch (e) { bad++; if (out.fails.length < 10) out.fails.push(kind + ' hạt ' + seed + ': ' + e.message); continue; }
      const errs = M.check(map);
      if (errs.length) { bad++; if (out.fails.length < 10) out.fails.push(kind + ' hạt ' + seed + ': ' + errs.join('; ')); }
      if (M.sig(M.make(kind, seed)) !== M.sig(map)) { bad++; if (out.fails.length < 10) out.fails.push(kind + ' hạt ' + seed + ': sinh lại ra bản đồ khác'); }
      if (map.kind !== kind || map.seed !== seed) { bad++; out.fails.push(kind + ' hạt ' + seed + ': sai nhãn'); }
      sigs.add(M.sig(map));
      shapes.add(map.rooms.map((r) => r.x + ',' + r.y).sort().join(' '));
      const s = map.rooms.find((r) => M.SIDE.includes(r.type));
      sides[s.type] = (sides[s.type] || 0) + 1;
      steps += M.walk(map, false).steps;
    }
    out.kinds[kind] = { bad, distinct: sigs.size, shapes: shapes.size, sides, steps: +(steps / n).toFixed(1) };
  }
  // chọn kiểu: ải cuối vùng luôn C, ải khác không lặp kiểu vừa chơi
  let pk = 0;
  const rnd = G.srand(99);
  for (let k = 0; k < 600; k++) {
    const last = M.KINDS[k % 3];
    if (M.pickKind(4, last, rnd) !== 'C') pk++;
    for (const i of [0, 1, 2, 3]) { const c = M.pickKind(i, last, rnd); if (c === last || !M.KINDS.includes(c)) pk++; }
  }
  const seen = new Set(); for (let k = 0; k < 200; k++) seen.add(M.pickKind(1, null, rnd));
  if (seen.size !== 3) pk++;
  out.pick = pk;
  // bản đồ hỏng phải bị bắt: thêm cửa tắt từ Bắt đầu thẳng tới Trùm
  const m = M.make('B', 5); m.rooms[0].doors.up = 7; out.catch1 = M.check(m).length > 0;
  const m2 = M.make('A', 5); m2.rooms.pop(); out.catch2 = M.check(m2).length > 0;
  const m3 = M.make('C', 5); m3.gate = null; out.catch3 = M.check(m3).length > 0;
  return out;
}
"""

def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    errs, bad = [], 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file:///home/claude/new-project/game/index.html')
        pg.wait_for_function('window.G && G.mapgen')
        out = pg.evaluate(JS, n)
        b.close()
    for kind, v in out['kinds'].items():
        ok = v['bad'] == 0 and v['distinct'] >= (20 if kind != 'C' else 12) and len(v['sides']) == 3
        bad += 0 if ok else 1
        print(f"Kiểu {kind}: {n} hạt giống, {v['bad']} lỗi, {v['distinct']} bản đồ khác nhau, {v['shapes']} hình dạng, phòng phụ {v['sides']}, trung bình {v['steps']} lần qua cửa nếu đi hết" + ('' if ok else '  <-- HỎNG'))
    for f in out['fails']:
        print('  HỎNG:', f)
    for name, cond in (('chọn kiểu đúng luật', out['pick'] == 0), ('bắt được lối tắt tới Trùm', out['catch1']), ('bắt được bản đồ thiếu phòng', out['catch2']), ('bắt được bản đồ thiếu điều kiện cửa', out['catch3'])):
        print(('đạt ' if cond else 'HỎNG ') + name)
        bad += 0 if cond else 1
    if errs:
        print('LỖI TRANG:', errs[:3]); bad += 1
    print('mapgen:', 'đạt' if not bad else f'{bad} mục hỏng')
    sys.exit(1 if bad else 0)

main()
