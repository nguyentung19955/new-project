"""Kiểm tra luật cửa và bản đồ ngay trong game: cửa khóa khi còn quái, mở khi hết quái, phòng đã dọn không sinh quái mới,
bước qua cửa thì hiện ở cửa đối diện, điều kiện mở cửa Trùm của Kiểu B và C, và bot đi hết ải ở cả ba kiểu.
Chạy: python3 tests/doors.py   (thoát mã 1 nếu có mục sai)"""
import sys
from playwright.sync_api import sync_playwright

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const sec = (s) => G.sim(Math.round(s * 60));
  const M = G.mapgen;
  let S, W, P;
  const grab = () => { S = G.getRun(); W = S.W; P = S.P; };
  function start(r, i, kind, seed) { G.testSave({ lvl: 20, tier: 2, sharpen: 6 }); G.startStage(r, i, 0, { kind, seed }); grab(); }
  // Hạ hết quái của phòng hiện tại (kể cả các đợt chưa ra) theo đúng đường của game.
  function clear() {
    for (let k = 0; k < 4000 && !S.W.cleared; k++) { for (const e of S.W.ents) G.damage(e, 1e9, {}); S.P.hp = S.P.maxhp; G.sim(2); }
    grab();
  }
  // Đi qua cửa theo hướng dir bằng cách đứng vào chỗ cửa rồi đẩy cần về phía cửa.
  function walk(dir, secs) {
    const q = G.roomArt.doorPos(S.W.geo, dir), v = M.DIRS[dir];
    S.P.x = q.x - v[0] * 4; S.P.y = q.y - v[1] * 4;
    const keep = G.botInput;
    G.botInput = () => ({ mx: v[0], my: v[1], atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false });
    const from = S.idx;
    // dừng ngay khi đã sang phòng mới và chuyển cảnh xong
    try { for (let k = 0; k < (secs || 1.5) * 60; k++) { G.sim(1); if (G.getRun().idx !== from && !G.getRun().trans) break; } } finally { G.botInput = keep; }
    grab();
  }
  const idle = () => ({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false });
  const keepBot = G.botInput;
  G.botInput = idle;

  // ----- cửa khóa khi còn quái, mở cùng lúc khi hết quái -----
  start(0, 2, 'B', 1);
  ok('Vào ải: đứng ở phòng Bắt đầu, số 0', S.idx === 0 && W.type === 'start');
  ok('Phòng Bắt đầu có cửa ở đúng các phía có phòng kề', W.doors.length === M.DKEYS.filter((d) => S.map.rooms[0].doors[d] != null).length && W.doors.length >= 1, W.doors.length);
  sec(2); grab(); // vòng báo chỗ mọc gần một giây rồi quái mới hiện ra
  ok('Phòng có quái: quái hiện ra trong phòng', W.ents.length > 0, W.ents.length);
  ok('Quái hiện ra nằm trong sàn', W.ents.every((e) => e.x >= W.x0 && e.x <= W.x1 && e.y >= W.y0 && e.y <= W.y1));
  ok('Còn quái: mọi cửa khóa', W.doors.every((d) => !d.open));
  const d0 = W.doors[0];
  G.botInput = keepBot; walk(d0.dir, 0.8); G.botInput = idle;
  ok('Còn quái: đẩy vào cửa cũng không qua được', S.idx === 0 && !S.trans);
  clear();
  ok('Hết quái: phòng tính là đã dọn', W.cleared && S.cleared[0]);
  ok('Hết quái: mọi cửa thường mở cùng lúc', W.doors.filter((d) => !d.gate).every((d) => d.open));
  // ----- bước qua cửa -----
  const to = d0.to, back = M.OPP[d0.dir];
  walk(d0.dir);
  ok('Bước vào cửa mở thì sang phòng kề', S.idx === to, S.idx + ' / ' + to);
  const q = G.roomArt.doorPos(W.geo, back);
  ok('Xuất hiện ở cửa đối diện của phòng mới', Math.hypot(P.x - q.x, P.y - q.y) < 30, Math.round(P.x) + ',' + Math.round(P.y));
  ok('Chuyển cảnh đã xong', !S.trans);
  ok('Bản đồ ghi nhận phòng mới đã qua và phòng kề đã biết', S.seen[to] && W.doors.every((d) => S.known[d.to]));
  clear();
  walk(back);
  ok('Quay lại phòng cũ được', S.idx === 0);
  sec(4); grab();
  ok('Phòng đã dọn: không sinh quái mới', W.ents.length === 0 && W.spawns.length === 0 && W.cleared);
  ok('Phòng đã dọn: cửa vẫn mở', W.doors.filter((d) => !d.gate).every((d) => d.open));
  ok('Không dựng lại phòng khi quay lại (số lần vào phòng mới không tăng)', S.visits === 2, S.visits);

  // ----- phòng không quái: cửa luôn mở -----
  for (const t of ['chest', 'merchant', 'curse', 'fountain']) {
    start(1, 1, 'A', 4); G.testGoto(t); grab(); sec(0.5); grab();
    ok('Phòng ' + t + ': không có quái, cửa mở sẵn', W.cleared && W.ents.length === 0 && W.doors.filter((d) => !d.gate).every((d) => d.open));
  }
  start(1, 1, 'A', 4); G.testGoto('challenge'); grab(); sec(1.5); grab();
  ok('Phòng thử thách: có quái và có đồng hồ', W.ents.length + W.spawns.length > 0 && S.challenge && S.challenge.t > 0);
  ok('Phòng thử thách: cửa khóa tới khi xong', W.doors.every((d) => !d.open));
  clear();
  ok('Phòng thử thách: xong thì cửa mở, có thưởng hoặc báo hết giờ', W.doors.some((d) => d.open) && !S.challenge);

  // ----- Kiểu B: cửa Trùm trong phòng Suối hồi -----
  start(0, 1, 'B', 2);
  const fights = S.map.gate.ids.slice();
  G.gotoRoom(6); grab();
  const gd = W.doors.find((d) => d.to === 7);
  ok('Kiểu B: phòng Suối hồi có cửa dẫn tới Trùm', !!gd && gd.gate && gd.boss);
  ok('Kiểu B: chưa dọn phòng quái thì cửa Trùm khóa', gd && !gd.open);
  ok('Kiểu B: các cửa khác của Suối hồi vẫn mở', W.doors.filter((d) => !d.gate).every((d) => d.open));
  G.botInput = keepBot; walk(gd.dir, 0.8); G.botInput = idle;
  ok('Kiểu B: đẩy vào cửa Trùm đang khóa không qua được', S.idx === 6);
  for (let k = 0; k < 2; k++) { G.gotoRoom(fights[k]); grab(); clear(); }
  G.gotoRoom(6); grab();
  ok('Kiểu B: dọn 2/3 phòng quái thì cửa Trùm vẫn khóa', !W.doors.find((d) => d.to === 7).open, M.gateCount(S.map, S.cleared));
  G.gotoRoom(fights[2]); grab(); clear();
  ok('Kiểu B: dọn đủ 3 phòng thì có dòng báo cửa Trùm mở', W.banner && /Cửa Trùm/.test(W.banner.s), W.banner && W.banner.s);
  G.gotoRoom(6); grab();
  ok('Kiểu B: dọn đủ 3 phòng quái thì cửa Trùm mở', W.doors.find((d) => d.to === 7).open);
  G.botInput = keepBot; walk(W.doors.find((d) => d.to === 7).dir); G.botInput = idle;
  ok('Kiểu B: qua cửa thì vào phòng Trùm', S.idx === 7 && W.type === 'boss' && !!W.boss);
  ok('Phòng Trùm: rộng hơn phòng thường, cửa khóa trong lúc đánh', W.geo.big && W.doors.every((d) => !d.open));
  ok('Phòng Trùm: người chơi và trùm đều nằm trong sàn', P.x >= W.x0 && P.x <= W.x1 && W.boss.x >= W.x0 - 1 && W.boss.x <= W.x1 + 1, Math.round(P.x) + ' ' + Math.round(W.boss.x));

  // ----- Kiểu C: sảnh trung tâm và ba mảnh chìa -----
  start(2, 4, 'C', 3);
  ok('Kiểu C: sảnh là phòng Bắt đầu, có cửa trên dẫn tới Suối hồi', W.doors.some((d) => d.dir === 'up' && d.to === 6 && d.gate));
  clear();
  ok('Kiểu C: dọn sảnh xong, cửa ba cánh mở, cửa trên vẫn khóa', W.doors.filter((d) => !d.gate).length === 3 && W.doors.filter((d) => !d.gate).every((d) => d.open) && !W.doors.find((d) => d.gate).open);
  for (let k = 1; k <= 3; k++) {
    const dir = M.dirTo(S.map, 0, k);
    G.botInput = keepBot; walk(dir); G.botInput = idle;
    ok('Kiểu C: vào cánh ' + k, S.idx === k);
    clear();
    ok('Kiểu C: dọn phòng chìa thứ ' + k + ' thì có ' + k + ' mảnh', M.gateCount(S.map, S.cleared) === k);
    G.botInput = keepBot; walk(M.OPP[dir]); G.botInput = idle;
    ok('Kiểu C: quay về sảnh', S.idx === 0);
    ok('Kiểu C: ' + k + ' mảnh chìa thì cửa trên ' + (k < 3 ? 'còn khóa' : 'mở'), W.doors.find((d) => d.gate).open === (k === 3));
  }
  G.botInput = keepBot; walk('up'); G.botInput = idle;
  ok('Kiểu C: qua cửa trên là Suối hồi', S.idx === 6 && W.type === 'fountain');
  ok('Suối hồi cho biết trùm đã học gì', Array.isArray(S.preview));
  G.botInput = keepBot; walk('up'); G.botInput = idle;
  ok('Kiểu C: sau Suối hồi là Trùm vùng', S.idx === 7 && W.boss && W.boss.kind === 'ho', W.boss && W.boss.kind);

  // ----- chọn kiểu bố cục -----
  G.testSave({});
  let allC = true, rep = 0, kinds = {};
  for (let k = 0; k < 40; k++) {
    if (k % 5 === 4) { G.startStage(k % 3, 4, 0); if (G.getRun().map.kind !== 'C') allC = false; }
    const last = G.save.lastKind;
    G.startStage(k % 3, k % 4, 0); const kd = G.getRun().map.kind; kinds[kd] = 1;
    if (kd === last) rep++;
  }
  ok('Ải cuối mỗi vùng luôn dùng Kiểu C', allC);
  ok('Ải khác không lặp lại kiểu của lần chơi ngay trước', rep === 0, rep);
  ok('Ải khác dùng được cả ba kiểu', Object.keys(kinds).length === 3, Object.keys(kinds));
  const a = (G.startStage(0, 1, 0, { kind: 'A', seed: 77 }), M.sig(G.getRun().map)), b = (G.startStage(0, 1, 0, { kind: 'A', seed: 77 }), M.sig(G.getRun().map));
  ok('Cùng hạt giống thì ra cùng bản đồ', a === b);
  ok('Mỗi bản đồ trong game đều qua được hàm kiểm tra', M.check(G.getRun().map).length === 0);

  // ----- dấu ấn và bình máu cộng dồn qua các phòng -----
  start(0, 2, 'A', 5);
  W.marksGained = 7; W.usedPotion = true; clear();
  G.botInput = keepBot; walk(W.doors[0].dir); G.botInput = idle;
  ok('Dấu ấn và việc dùng bình máu được giữ khi sang phòng khác', S.marks === 7 && S.usedPotion === true, S.marks);

  // ----- đạn không bay ra ngoài phòng -----
  start(0, 2, 'A', 5); clear();
  W.projs.push({ team: 'enemy', kind: 'fruit', x: W.geo.cx, y: W.geo.cy - 40, vx: 300, vy: 0, t: 5, dmg: 1, el: null });
  sec(1.5); grab();
  ok('Đạn dừng ở tường, không bay ra lề màn hình', W.projs.length === 0);
  G.botInput = keepBot;
  return out;
}
"""

BOT = r"""
([r, i, kind, seed, side]) => {
  // Bài này thử luật cửa, không đo độ khó: bản lưu đủ "Sức mạnh khuyên dùng" của ải (cân bằng phải cày làm quái mạnh hơn trước).
  G.testSave({ lvl: Math.min(30, 8 + r * 10 + i * 2), tier: Math.min(3, r + 1), sharpen: Math.min(10, 3 + r * 3 + i), armor: ['a_r1', 'a_ngu', 'a_ho'][r], helm: ['h_r1', 'h_r2', 'h_r3'][r] });
  G.botCfg.side = side;
  G.rnd = G.srand(seed * 101 + r * 7 + i); // có hạt giống: chạy lại ra đúng kết quả cũ (tỉ lệ thắng thật thì đo bằng balance.py)
  G.startStage(r, i, 0, { kind, seed });
  const res = G.probeRun(900), S = G.getRun();
  G.rnd = Math.random;
  return { win: res.win, t: res.t, rooms: res.rooms.length, seen: Object.keys(S.seen).length, bad: res.bad, kind: S.map.kind, last: res.rooms.length ? res.rooms[res.rooms.length - 1][0] : null,
    prev: res.rooms.length > 1 ? res.rooms[res.rooms.length - 2][0] : null, fights: S.map.rooms.filter((o) => (o.type === 'fight' || o.type === 'elite') && S.cleared[o.id]).length };
}
"""

def main():
    errs, bad = [], 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))) + '/index.html')
        pg.wait_for_timeout(1200)
        pg.add_script_tag(path='tests/bot.js')
        pg.add_script_tag(path='tests/setup.js')
        res = pg.evaluate(JS)
        for name, ok, detail in res:
            if not ok:
                bad += 1
                print('  HỎNG:', name, ('(' + detail + ')') if detail else '')
        print(f'{len(res) - bad}/{len(res)} luật cửa và bản đồ đạt')
        # bot đi hết ải ở cả ba kiểu, có ghé và không ghé phòng phụ
        n = 0
        for kind in ('A', 'B', 'C'):
            for r, i, seed, side in ((0, 1, 11, True), (1, 2, 12, False), (2, 3, 13, True)):
                n += 1
                o = pg.evaluate(BOT, [r, i, kind, seed, side])
                want = 8 if side else 6
                good = o['win'] and not o['bad'] and o['last'] == 'boss' and o['prev'] == 'fountain' and o['fights'] == 3 and o['seen'] >= want
                bad += 0 if good else 1
                print(('đạt ' if good else 'HỎNG ') + f"bot Kiểu {kind} ải {r+1}-{i+1} {'ghé' if side else 'bỏ'} phòng phụ: {'thắng' if o['win'] else 'không thắng'} sau {o['t']} giây, qua {o['seen']}/8 phòng, {o['rooms']} lần vào phòng, dọn {o['fights']}/3 phòng quái" + (' ' + str(o['bad']) if o['bad'] else ''))
                sys.stdout.flush()
        pg.evaluate("G.botCfg.side = true")
        b.close()
    if errs:
        print('LỖI TRANG:', errs[:3]); bad += 1
    print('doors:', 'đạt' if not bad else f'{bad} mục hỏng')
    sys.exit(1 if bad else 0)

main()
