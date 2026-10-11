"""Đợt 2 (tồn đọng): soát bố cục ô chỉ dẫn / dòng mẹo ở phòng thường sàn 300, trên nhiều bản đồ, mọi loại phòng, cửa khoá và cửa mở.
Chạy từ thư mục gốc repo:  python3 docs/review/ke-hoach-cai-thien/dot-2/kiem_bo_cuc.py [số hạt giống, mặc định 40]
Với mỗi cỡ màn (844×390, 1280×720, 390×844) × hạt giống × phòng × (cửa khoá, cửa mở): vẽ một khung hình rồi đo ô chữ (S.hintBox) có đè lên:
cửa (khung cửa + mũi tên chỉ lối), vùng đứng được của sàn, nút tạm dừng, ô vũ khí, bản đồ nhỏ, nút tròn, cần điều khiển, chữ "Rương đồ",
thanh máu tinh anh, chữ "Chạm để đổi vũ khí"; và ô chữ có nằm trọn trong khung game không (không bị cắt).
Trả mã 1 nếu có vi phạm.
  python3 docs/review/ke-hoach-cai-thien/dot-2/kiem_bo_cuc.py anh   chụp ảnh từng tình huống vào anh-ton-dong/ (3 cỡ màn)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kiem
from playwright.sync_api import sync_playwright

JS = r"""
([nSeed]) => {
  const TIP = 'Kiếm: bấm Đánh ra chuỗi 3 nhát, Né xong đánh ngay để lướt chém. Đặc biệt: Trảm Nguyệt phóng vệt chém xuyên quái.';
  const ov = (a, b) => { const w = Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]), h = Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]); return w > 0 && h > 0 ? [Math.round(w), Math.round(h)] : null; };
  const out = { n: 0, vung: { 1: 0, 2: 0, 3: 0, 4: 0 }, loi: {}, vd: {}, nhom: {}, sanMax: 0, khongHien: 0 };
  const bad = (k, info) => { out.loi[k] = (out.loi[k] || 0) + 1; if (!out.vd[k]) out.vd[k] = info; const nh = info.tag.split(' hạt ')[0].replace(/ [ABC]$/, '') + ' | ' + info.loai + ' | cửa ' + info.cua.replace(/:(mở|khoá)/g, ''); out.nhom[nh] = (out.nhom[nh] || 0) + 1; };
  const draw = () => { G.scene.draw(); };
  const check = (tag) => {
    const S = G.getRun(), W = S.W, g = W.geo, hb = S.hintBox;
    out.n++;
    if (!hb) { out.khongHien++; return; }
    const box = hb.slice(0, 4), info = { tag, box: hb, cua: W.doors.map((d) => d.dir + (d.open ? ':mở' : ':khoá')).join(' '), loai: W.type };
    out.vung[hb[4]]++;
    if (box[0] < 0 || box[1] < 0 || box[0] + box[2] > 480 || box[1] + box[3] > 270) bad('bị cắt ngoài khung game', info);
    for (const d of W.doors) {
      const r = d.dir === 'up' ? [g.cx - 24, g.fy0 - 44, 48, 60] : d.dir === 'down' ? [g.cx - 24, g.fy1 - 16, 48, 34] : d.dir === 'left' ? [g.fx0 - 16, g.cy - 24, 32, 48] : [g.fx1 - 16, g.cy - 24, 32, 48];
      if (ov(box, r)) bad('đè cửa ' + d.dir + (d.open ? ' (mở)' : ' (khoá)'), info);
    }
    if (ov(box, [W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0])) bad('đè vùng đứng được của sàn', Object.assign({ de: ov(box, [W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0]) }, info));
    const fl = ov(box, [g.fx0, g.fy0, g.fx1 - g.fx0, g.fy1 - g.fy0]);
    if (fl) { out.sanMax = Math.max(out.sanMax, fl[1]); if (fl[1] > 4) bad('lấn mép sàn hơn 4 px', Object.assign({ de: fl }, info)); }
    const U = G.stageUi;
    if (ov(box, [U.PAU[0] - 4, U.PAU[1] - 4, U.PAU[2] + 8, U.PAU[3] + 9])) bad('đè nút tạm dừng', info);
    if (ov(box, [U.POT[0] - 4, U.POT[1] - 4, U.POT[2] + 8, U.POT[3] + 9])) bad('đè ô bình máu', info);
    if (ov(box, [4, 2, 121, 23])) bad('đè thanh máu / mana', info);
    if (ov(box, [3, 68, 62, 38])) bad('đè chữ tên phòng / sức mạnh', info);
    if (ov(box, [366, 0, 114, 56])) bad('đè ô vũ khí / vạch linh khí', info);
    if (ov(box, G.minimap.rect(S))) bad('đè bản đồ nhỏ', info);
    for (const n of ['atk', 'dodge', 'special', 'skill']) { const b = U.btnPos(n); if (ov(box, [b[0] - b[2], b[1] - b[2], b[2] * 2, b[2] * 2])) bad('đè nút ' + n, info); }
    const st = U.stickPos(); if (ov(box, [st[0] - st[2], st[1] - st[2], st[2] * 2, st[2] * 2])) bad('đè cần điều khiển', info);
    for (const p of W.props) if (p.act === 'stash') { G.ui.font(7, true); const tw = G.ux.measureText(G.tv('Rương đồ')).width; if (ov(box, [p.x - tw / 2, p.y - 28 - 7, tw, 9])) bad('đè chữ Rương đồ', info); }
    if (S.tut && W.type === 'elite' && !W.cleared && S.P.weapons.length > 1) { G.ui.font(7, true); const tw0 = Math.ceil(G.ux.measureText(G.tv('Chạm để đổi vũ khí →')).width) + 8; for (const y0 of [14, 26]) if (ov(box, [362 - tw0, y0, tw0, 12])) { bad('đè chữ Chạm để đổi vũ khí', info); break; } }
    if (W.ents.some((e) => e.role === 'elite' && !e.dead) && ov(box, [128, 2, 224, 22])) bad('đè thanh máu tinh anh', info);
    if (S.challenge && ov(box, [150, 12, 180, 12])) bad('đè đồng hồ thử thách', info);
  };
  const eachRoom = (tut, kind, seed) => {
    T.start(0, tut ? 0 : 2, seed, tut); // T.start dùng kind 'A'
    if (kind !== 'A') { G.testSave({ lvl: 5 }); G.startStage(0, 2, 0, { kind, seed }); }
    const S = G.getRun();
    for (const R of S.map.rooms) {
      if (R.type === 'boss') continue;
      G.gotoRoom(R.id);
      const W = S.W;
      S.mode = 'play'; S.trans = null;
      if (!tut) W.banner = { s: TIP, col: '#ffd27a', t: 5, tip: true };
      for (const st of ['khoá', 'mở']) {
        if (st === 'mở') { W.cleared = true; for (const d of W.doors) d.open = true; W.ents.length = 0; W.spawns = []; }
        else for (const d of W.doors) d.open = false;
        draw(); check((tut ? 'ải hướng dẫn' : 'mẹo') + ' ' + kind + ' hạt ' + seed + ' phòng ' + R.id + ' ' + R.type + ' cửa ' + st);
        if (st === 'khoá' && R.type === 'elite') {
          // tinh anh đang sống: thanh máu tinh anh hiện ở trên cùng; thử cả lời chỉ dẫn lẫn dòng mẹo dài (đổi sang cung thì mẹo cung hiện ngay trong phòng này)
          const e = G.spawnEnemy('elite', W.geo.cx, W.geo.cy, {}); e.inside = true;
          draw(); check('tinh anh sống, ' + (tut ? 'chỉ dẫn' : 'mẹo') + ' ' + kind + ' hạt ' + seed + ' phòng ' + R.id);
          const b0 = W.banner; W.banner = { s: TIP, col: '#ffd27a', t: 5, tip: true };
          draw(); check('tinh anh sống, mẹo dài ' + kind + ' hạt ' + seed + ' phòng ' + R.id);
          W.banner = b0; e.dead = true; W.ents.length = 0;
        }
      }
    }
  };
  for (let sd = 1; sd <= nSeed; sd++) { eachRoom(true, 'A', sd); for (const k of ['A', 'B', 'C']) eachRoom(false, k, sd); }
  return out;
}
"""


# Chụp ảnh từng tình huống: tự dò hạt giống ải hướng dẫn có phòng đúng kiểu cửa, rồi chụp (cửa khoá / cửa mở / đang chuyển phòng).
FIND = r"""
([loai, cua, khong]) => {
  for (let sd = 1; sd <= 300; sd++) {
    T.thaw(); T.start(0, 0, sd, true);
    const S = G.getRun();
    for (const R of S.map.rooms) {
      if (R.type !== loai) continue;
      const ds = Object.keys(R.doors).filter((d) => R.doors[d] != null);
      if (cua.every((d) => ds.includes(d)) && khong.every((d) => !ds.includes(d))) { G.gotoRoom(R.id); S.mode = 'play'; return [sd, R.id, ds.join(' ')]; }
    }
  }
  return null;
}
"""
CASES = [
    # tên ảnh, loại phòng, cửa phải có, cửa không được có, trạng thái
    ('1-day-khong-cua-duoi', 'fight', ['up'], ['down'], 'khoa'),
    ('2-tuong-sau-cua-duoi-khoa', 'fight', ['down'], ['up'], 'khoa'),
    ('2-tuong-sau-cua-duoi-mo', 'fight', ['down'], ['up'], 'mo'),
    ('3-canh-cua-tren-khoa', 'fight', ['up', 'down'], [], 'khoa'),
    ('3-canh-cua-tren-mo', 'fight', ['up', 'down'], [], 'mo'),
    ('3-tinh-anh-song-hai-cua', 'elite', ['up', 'down'], [], 'tinhanh'),
    ('2-tinh-anh-song-cua-duoi', 'elite', ['down'], ['up'], 'tinhanh'),
    ('4-cot-trai-tinh-anh-meo-dai', 'elite', ['up', 'down'], ['left'], 'tinhanh-meo'),
    ('suoi-cua-duoi', 'fountain', ['down'], ['up'], 'mo'),
    ('suoi-hai-cua', 'fountain', ['up', 'down'], [], 'mo'),
    ('suoi-khong-cua-duoi', 'fountain', [], ['down'], 'mo'),
    ('chuyen-phong', 'fight', ['down', 'right'], ['up'], 'chuyen'),
    ('nut-dac-biet-cua-phai', 'fight', ['right'], [], 'mo'),
]
STATE = {
    'khoa': "() => { const W = G.getRun().W; G.botInput0 = G.botInput; G.botInput = null; G.getRun().P.inv = 999; G.sim(100); G.botInput = G.botInput0; }",
    'mo': "() => { const S = G.getRun(), W = S.W; S.P.inv = 999; for (let k = 0; k < 9000 && !W.cleared; k++) G.sim(1); G.botInput0 = G.botInput; G.botInput = null; G.sim(330); G.botInput = G.botInput0; }",
    'tinhanh': "() => { const S = G.getRun(), W = S.W; S.P.inv = 999; G.botInput0 = G.botInput; G.botInput = null; W.waves = []; W.spawns = []; const e = G.spawnEnemy('elite', W.geo.cx + 60, W.geo.cy, {}); e.inside = true; G.sim(20); G.botInput = G.botInput0; }",
    'tinhanh-meo': "() => { const S = G.getRun(), W = S.W; S.P.inv = 999; G.botInput0 = G.botInput; G.botInput = null; W.waves = []; W.spawns = []; const e = G.spawnEnemy('elite', W.geo.cx + 60, W.geo.cy, {}); e.inside = true; G.sim(20); W.banner = { s: G.MOVE_TIPS.bow, col: '#ffd27a', t: 5, tip: true }; G.botInput = G.botInput0; }",
    'chuyen': "() => { const S = G.getRun(), W = S.W; S.P.inv = 999; for (let k = 0; k < 9000 && !W.cleared; k++) G.sim(1); G.sim(330); for (let k = 0; k < 3000 && !S.trans; k++) G.sim(1); G.sim(8); }",
}


def anh():
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'anh-ton-dong')
    os.makedirs(out, exist_ok=True)
    only = sys.argv[2:]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for sz in kiem.SIZES:
            pg, errs = kiem.page(b, sz)
            for name, loai, cua, khong, st in CASES:
                if only and name not in only: continue
                f = pg.evaluate(FIND, [loai, cua, khong])
                if not f: print(sz, name, 'KHÔNG TÌM ĐƯỢC PHÒNG'); continue
                pg.evaluate(STATE[st]); pg.evaluate("() => T.freeze()")
                pg.wait_for_timeout(300)
                pg.screenshot(path=os.path.join(out, '%s-%s.png' % (sz, name)))
                print(sz, name, 'hạt', f[0], 'phòng', f[1], 'cửa', f[2], '· ô chữ', pg.evaluate("() => { const S = G.getRun(); return [S.hintBox, !!S.trans, S.W.cleared, S.hint ? S.hint.slice(0, 20) : null]; }"))
            print(sz, 'lỗi JS:', errs)
        b.close()


def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'anh': return anh()
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 40
    bad = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        for sz in kiem.SIZES:
            pg, errs = kiem.page(b, sz)
            pg.evaluate("() => { T.freeze(); }")
            o = pg.evaluate(JS, [n])
            print('==', sz, '· số ca:', o['n'], '· ô chữ ở 1 đáy / 2 giữa tường sau / 3 cạnh cửa trên / 4 cột trái:', o['vung'], '· không hiện:', o['khongHien'], '· lấn mép sàn nhiều nhất:', o['sanMax'], 'px')
            for k, v in sorted(o['loi'].items()):
                print('   VI PHẠM', v, 'ca:', k, '| ví dụ:', json.dumps(o['vd'][k], ensure_ascii=False))
                bad += v
            if not o['loi']: print('   không vi phạm')
            for k, v in sorted(o['nhom'].items()): print('      nhóm:', v, k)
            print('   lỗi JS:', errs)
            bad += len(errs)
        b.close()
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
