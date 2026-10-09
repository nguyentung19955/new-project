"""Kiểm tra đồ rơi dễ nhìn và quái chi tiết hơn (docs/do-roi-va-quai-chi-tiet).
Chạy: python3 tests/do_roi.py
 A. Quái: 36 con vẫn đủ, không lỗi, cỡ khung (dùng tính cỡ va chạm) giữ nguyên như đã duyệt; các con đã sửa có bộ phận cử động
    mới và mọi cử động (xuất hiện, thở, đi, báo đòn, ra đòn, trúng đòn, chết, chiêu riêng) vẽ hết các khung không lỗi.
 B. Đồ rơi: đủ loại vẽ được (có viền, có bóng), đồ có bậc có cột sáng, lại gần hiện tên, vàng và nguyên liệu hút xa hơn vũ khí,
    chạm thì nhặt; tinh anh rơi vũ khí và quái rơi trang phục thì nằm trên sàn; thả đồ không đụng tới số ngẫu nhiên của luật chơi."""
import sys
from quai_lib import sync_playwright, open_page

# Cỡ khung của 36 con trước khi sửa (id, rộng, cao): phải giữ nguyên.
CO = [["cua", 48, 36], ["caCon", 36, 31], ["oc", 52, 41], ["haiQuy", 45, 40], ["caChuon", 53, 34], ["caNoc", 32, 26], ["sua", 39, 37], ["nhim", 29, 24], ["cuaTuong", 84, 63], ["caNocChua", 66, 61], ["cuaDa", 116, 70], ["nguTinh", 150, 102], ["heoCon", 56, 32], ["ongVo", 44, 39], ["boHung", 54, 34], ["hoaBaoTu", 53, 36], ["chonBong", 63, 28], ["namPhong", 32, 27], ["socNo", 49, 37], ["nhimDoc", 44, 28], ["heoNanh", 90, 44], ["namPhongChua", 83, 44], ["namChua", 97, 64], ["mocTinh", 140, 126], ["linhMa", 50, 31], ["doiThan", 46, 31], ["tuongDa", 50, 32], ["denLong", 44, 34], ["meoDen", 58, 32], ["huLua", 30, 30], ["tieuYeu", 44, 32], ["nhimThan", 30, 27], ["tuongMa", 64, 44], ["huChua", 68, 42], ["hoLua", 109, 65], ["hoTinh", 174, 115]]
# Bộ phận cử động mới phải có (con: tên bộ phận)
PHAN = {'caNoc': ['vay', 'duoi', 'gai'], 'sua': ['tuaT', 'tuaP', 'bom'], 'caChuon': ['canh', 'duoi', 'vay'], 'nhim': ['gaiTren', 'gaiT', 'gaiP'],
        'namPhong': ['reT', 'reP'], 'nhimDoc': ['gai', 'chanT', 'chanS'], 'huLua': ['taiT', 'taiP', 'chanT'], 'denLong': ['quai'],
        'nhimThan': ['gaiTren', 'gaiT', 'gaiP', 'chanT']}

QUAI = r"""([CO, PHAN]) => {
  const MA = G.monsterArt, out = { loi: MA.loi.slice(), sai: [], khung: 0, sua: (MA.chiTiet && MA.chiTiet.sua) || [] };
  if (MA.list.length !== 36) out.sai.push('số quái ' + MA.list.length);
  for (const [id, w, h] of CO) { const q = MA.list.find((z) => z.id === id); if (!q) { out.sai.push('thiếu ' + id); continue; } if (q.w !== w || q.h !== h) out.sai.push(id + ' đổi cỡ ' + q.w + 'x' + q.h + ' (cũ ' + w + 'x' + h + ')'); }
  for (const id of Object.keys(PHAN)) { const B = MA._goc(id, 1); for (const n of PHAN[id]) { const p = B.parts.find((x) => x.n === n); let so = 0; if (p) for (let i = 0; i < B.owner.length; i++) if (B.owner[i] === p.idx) so++; if (!p || so < 3) out.sai.push(id + ': bộ phận ' + n + (p ? ' quá ít điểm (' + so + ')' : ' không có')); } }
  const cv = document.createElement('canvas'); cv.width = 400; cv.height = 300; const c = cv.getContext('2d');
  for (const q of MA.list) { if (q.loai === 'trum') continue; for (const a of q.anims) { const n = Math.max(1, Math.round(a.d * MA.fps)); for (let i = 0; i < n; i++) { try { MA.draw(c, q.id, 200, 200, { anim: a.id, t: i / MA.fps, face: i % 2 ? 1 : -1, dir: i * 0.7 }); out.khung++; } catch (e) { out.sai.push(q.id + ' ' + a.id + ': ' + e.message); break; } } } }
  return out;
}"""

DO = r"""() => {
  const out = { sai: [], ghi: [] }; const ok = (b, s) => { (b ? out.ghi : out.sai).push(s); };
  const { S, W, P } = T.room(1, 2, { seed: 7 }); T.frame(30); W.ents.length = 0;
  const sv = G.save, ws = [0, 1, 2, 3].map((k) => G.newWeapon(sv, 'sword', k));
  const ds = [{ kind: 'weapon', w: ws[0] }, { kind: 'weapon', w: ws[1] }, { kind: 'weapon', w: ws[2] }, { kind: 'weapon', w: ws[3] }, { kind: 'outfit', o: { k: 'ao_vay', r: 3, lv: 1 } },
    { kind: 'gold', s: '+50 vàng' }, { kind: 'ore', s: '+2 quặng' }, { kind: 'stone', s: '+1 đá tôi' }, { kind: 'mat0' }, { kind: 'mat1' }, { kind: 'mat2' }, { kind: 'shard0' }, { kind: 'shard1' }, { kind: 'shard2' }, { kind: 'xp' }, { kind: 'potion', s: 'Bình máu' }];
  ok(!!G.doRoi, 'có js/do_roi.js');
  // vẽ từng món lên nền trống, đếm điểm ảnh tối (viền) và điểm ảnh màu bậc phía trên (cột sáng)
  const cv = document.createElement('canvas'); cv.width = 60; cv.height = 70; const c = cv.getContext('2d');
  for (const d of ds) {
    c.clearRect(0, 0, 60, 70); const o = Object.assign({ type: 'loot', x: 30, y: 60, born: G.time - 3 }, d);
    try { G.doRoi.ve(c, o); } catch (e) { ok(false, d.kind + ' vẽ lỗi ' + e.message); continue; }
    const px = c.getImageData(0, 0, 60, 70).data; let toi = 0, cot = 0, bong = 0;
    for (let i = 0; i < px.length; i += 4) { const y = (i / 4 / 60) | 0, a = px[i + 3]; if (!a) continue; if (a > 200 && px[i] < 40 && px[i + 1] < 40 && px[i + 2] < 40) toi++; if (y < 36) cot++; if (y >= 58 && y <= 62) bong++; }
    const bac = G.doRoi.bac(o);
    ok(toi >= 8, d.kind + (d.w ? ' bậc ' + bac : '') + ': có viền tối (' + toi + ' điểm)');
    ok(bong > 10, d.kind + ': có bóng dưới chân');
    if (d.kind === 'weapon') ok(bac >= 1 ? cot > 15 : cot < 6, 'vũ khí bậc ' + bac + (bac >= 1 ? ': có cột sáng' : ': chỉ ánh nhẹ, không cột sáng') + ' (' + cot + ')');
  }
  // hút về: đặt vàng và vũ khí cách em bé 36 điểm ảnh; sau 1 giây vàng đã nhặt, vũ khí chưa
  W.props = W.props.filter((p) => p.type !== 'loot'); P.pickR = 0;
  const g = Object.assign({ type: 'loot', x: P.x + 36, y: P.y - 4, born: G.time - 2 }, ds[5]), w = Object.assign({ type: 'loot', x: P.x - 36, y: P.y - 4, born: G.time - 2 }, ds[2]);
  W.props.push(g, w); T.inp = {};
  for (let i = 0; i < 60; i++) T.frame(1);
  ok(g.got || !W.props.includes(g), 'vàng ở xa 36 điểm ảnh tự hút về và được nhặt');
  ok(!w.got && W.props.includes(w), 'vũ khí ở xa 36 điểm ảnh chưa bị hút (vũ khí chỉ hút khi rất gần)');
  w.x = P.x - 18; for (let i = 0; i < 60; i++) T.frame(1);
  ok(w.got || !W.props.includes(w), 'vũ khí lại rất gần thì hút về và được nhặt');
  // tên khi lại gần: vẽ một khung và tìm chữ trên lớp giao diện
  const t = Object.assign({ type: 'loot', x: P.x + 30, y: P.y, born: G.time - 2 }, ds[3]); W.props.push(t);
  let chu = []; const old = G.ui.text; G.ui.text = function (s) { chu.push(s); return old.apply(this, arguments); };
  T.frame(1); G.ui.text = old;
  ok(chu.includes(G.doRoi.ten(t)), 'lại gần thì hiện tên ngắn: ' + G.doRoi.ten(t));
  // tinh anh rơi vũ khí: nằm trên sàn chỗ tinh anh gục; thả đồ không dùng số ngẫu nhiên của luật chơi
  W.props = W.props.filter((p) => p.type !== 'loot');
  const e = G.spawnEnemy('elite', P.x + 80, P.y, {}); const DR = G.DROP.elite; G.DROP.elite = 1;
  const dem = (co) => { const DRx = G.doRoi; if (!co) G.doRoi = null; G.rnd = G.srand(77); let goi = 0; const R = G.rnd; G.rnd = function () { goi++; return R.apply(this, arguments); };
    try { G.onEliteDown(e); } finally { G.rnd = R; G.doRoi = DRx; } return goi; };
  const goiCu = dem(false), goiTinhAnh = dem(true); G.DROP.elite = DR;
  ok(W.props.some((p) => p.type === 'loot' && p.kind === 'weapon'), 'tinh anh rơi vũ khí: nằm trên sàn');
  ok(goiTinhAnh === goiCu, 'thả đồ không lấy thêm số ngẫu nhiên của luật chơi (' + goiTinhAnh + ' lần, như khi chưa có đồ rơi trên sàn: ' + goiCu + ')');
  return out;
}"""

if __name__ == '__main__':
    with sync_playwright() as pw:
        b, pg, errs = open_page(pw)
        q = pg.evaluate(QUAI, [CO, PHAN])
        d = pg.evaluate(DO)
        b.close()
    sai = q['loi'] + q['sai'] + d['sai'] + [e for e in errs if 'willReadFrequently' not in e]
    print('A. Quái: đã sửa', len(q['sua']), 'con:', ', '.join(q['sua']))
    print('   vẽ thử', q['khung'], 'khung cử động của 30 con thường, tinh anh, trùm nhỏ')
    for s in d['ghi']: print('   đạt', s)
    for s in sai: print('SAI', s)
    n = 2 + len(d['ghi'])
    print('%d/%d mục đạt' % (n, n + len(sai)))
    sys.exit(1 if sai else 0)
