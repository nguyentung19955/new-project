#!/usr/bin/env python3
"""MÔ PHỎNG CHIÊU NHIỀU LƯỢT CỦA TINH ANH (luật game chạy trong Node — game/tests/node_trang.js, KHÔNG trình duyệt).

Mỗi lượt: vào ải 1-1 bằng bản lưu bot (tests/cay_luu.json), dọn quái, đặt MỘT tinh anh (mặc định Nấm Phồng Chúa) cách em bé một
khoảng ngẫu nhiên, ép nó tung chiêu riêng, rồi chạy luật từng khung (1/60 s) tới hết chiêu + 1 giây. Ghi lại:
  - mỗi vùng đỏ báo trước của chiêu (lúc tạo, tâm, có nổ không), mỗi cú nhảy (đích), chỗ đứng của tinh anh khi đáp.
Kịch bản: em bé đứng yên (ghim chỗ) / chạy vòng; tinh anh nổi giận (≤ 35% máu) hay không; bị đánh choáng ngẫu nhiên (như búa
"stagger": choáng 0,2–0,5 s, lần đầu 0,3–0,9 s sau lúc tung chiêu — "muon": lần đầu 0,5–1,4 s — rồi cứ 0,3–0,9 s một lần) hay không.

  python3 mo_phong.py [số lượt mỗi kịch bản=40] [tinh anh=namPhongChua|caNocChua|huChua|all] [--json tệp] (số liệu thô từng lượt)
Dùng GAME=<thư mục game> để chạy bản game khác (vd bản trước khi sửa, lấy bằng git worktree).
"""
import json, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.environ.get('GAME') or os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
sys.path.insert(0, os.path.join(GAME, 'tests'))
import cd_lib  # noqa: E402

JS = r"""
([sv, art, kb, seed, n]) => {
  G.save = G.fixSave(JSON.parse(sv)); G.save.sound = false;
  G.startStage(0, 0, 0);
  let S = G.getRun();
  for (let i = 0; i < 400 && S.mode !== 'play'; i++) { G.botRun(1); S = G.getRun(); }
  const out = [];
  let s0 = seed;
  const rnd = () => { s0 = (s0 * 1103515245 + 12345) % 2147483648; return s0 / 2147483648; };
  for (let lan = 0; lan < n; lan++) {
    const W = G.getWorld(), P = W.P;
    W.ents.length = 0; W.zones.length = 0; W.projs.length = 0; W.timers = []; W.spawns = [];
    const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
    // em bé: giữa sàn hoặc sát tường (1/3 lượt)
    const satTuong = rnd() < 0.33;
    P.x = satTuong ? W.x0 + 10 + rnd() * 20 : cx + (rnd() - 0.5) * 80; P.y = cy + (rnd() - 0.5) * 40;
    P.dead = false; P.maxhp = 1e9; P.hp = 1e9;
    const d = 30 + rnd() * 130, g = rnd() * Math.PI * 2;
    const e = G.spawnEnemy('elite', Math.max(W.x0 + 8, Math.min(W.x1 - 8, P.x + Math.cos(g) * d)), Math.max(W.y0 + 4, Math.min(W.y1 - 4, P.y + Math.sin(g) * d * 0.6)), { art });
    const e0 = [Math.round(e.x), Math.round(e.y)];
    e.spawnT = 0; e.cd = 99; e.skCd = 0; e.trait = null;
    if (kb.gian) { e.hp = e.maxhp * 0.3; } // nổi giận ở ≤ 35% máu (js/noi_gian.js)
    const px0 = P.x, py0 = P.y;
    const rec = { zones: [], jumps: [], stun: [], gian: false, d0: Math.round(Math.hypot(e.x - P.x, e.y - P.y)) };
    const mz = G.mobZone;
    G.mobZone = function (shape, geo, t, dmg, el, o) {
      const z = mz.apply(this, arguments);
      if (o && o.src === e && z) { const r = { px: Math.round(P.x), py: Math.round(P.y), t: +tt.toFixed(3), x: Math.round(z.x), y: Math.round(z.y), shape, bao: +t.toFixed(2), no: false, bao2: !!o.ctBao, huy: false }; rec.zones.push(r); z.__r = r; }
      return z;
    };
    const ng0 = (G.chieuTrum && G.chieuTrum.soNgat) || 0;
    let tt = 0, nh = null, chieu = false, xong = 0, stunT = kb.tre ? 0.5 + rnd() * 0.9 : 0.3 + rnd() * 0.6;
    for (let f = 0; f < 60 * 6; f++) {
      if (kb.chay) { const a = tt * 2.2; P.x = px0 + Math.cos(a) * 40 - 40; P.y = py0 + Math.sin(a) * 20; } else { P.x = px0; P.y = py0; } // đứng yên: ghim chỗ (bỏ lực đẩy lùi khi trúng)
      P.x = Math.max(W.x0, Math.min(W.x1, P.x)); P.y = Math.max(W.y0, Math.min(W.y1, P.y));
      P.hp = 1e9;
      if (kb.danh && chieu && !e.dead) { stunT -= 1 / 60; if (stunT <= 0) { const s = 0.2 + rnd() * 0.3; e.st.stun = Math.max(e.st.stun, s); rec.stun.push(+tt.toFixed(2)); stunT = 0.3 + rnd() * 0.6 + s; } }
      const z0 = W.zones.filter((z) => z.__r && !z.dead && z.t > 0);
      G.sim(1); tt += 1 / 60;
      for (const z of z0) if (z.t <= 0 || z.dead) { if (z.t <= 0 && !z.__r.no && !z.__r.huy) z.__r.no = true; else if (z.t > 0 && !e.dead) z.__r.huy = true; }
      if (e.act && e.act.k === 'sk') chieu = true;
      if (e.ngGian) rec.gian = true;
      if (e.ct && e.ct.doan != null && e.ct.doan + 1 > (rec.doan || 0)) { rec.doan = e.ct.doan + 1; (rec.doanT || (rec.doanT = [])).push(+tt.toFixed(3)); }
      if (e.ctNhay && e.ctNhay !== nh) { nh = e.ctNhay; rec.jumps.push({ t: +tt.toFixed(2), x: Math.round(nh.x1), y: Math.round(nh.y1) }); }
      if (chieu && !e.act) { xong += 1 / 60; if (xong > 1) break; }
      if (e.dead) break;
      e.skCd = 99; // chỉ một lần chiêu mỗi lượt
    }
    G.mobZone = mz;
    rec.ngat = ((G.chieuTrum && G.chieuTrum.soNgat) || 0) - ng0;
    rec.P = [Math.round(px0), Math.round(py0)]; rec.E0 = e0;
    rec.tuong = satTuong; rec.san = [W.x0, W.y0, W.x1, W.y1]; rec.E0 = e0;
    out.push(rec);
  }
  return out;
}
"""

KB = [('dung', {}), ('dung+gian', {'gian': 1}), ('dung+danh', {'danh': 1}), ('dung+gian+danh', {'gian': 1, 'danh': 1}),
      ('chay', {'chay': 1}), ('chay+gian', {'chay': 1, 'gian': 1}), ('chay+danh', {'chay': 1, 'danh': 1}), ('chay+gian+danh', {'chay': 1, 'gian': 1, 'danh': 1}),
      ('dung+danh muon', {'danh': 1, 'tre': 1}), ('chay+gian+danh muon', {'chay': 1, 'gian': 1, 'danh': 1, 'tre': 1})]


def tom(rs, art, R=36):
    """Tóm một kịch bản (chỉ tính lượt tinh anh đã tung chiêu).
    Nấm Phồng Chúa: đủ = 3 ô độc nổ ở 3 chỗ đáp; trùng = có 2 ô nổ cách nhau < R (khoảng cách trên sàn, trục dọc chia G.ZK 0,85 —
    vòng r 24 nên < 36 là hai ô chồng gần hết, nhìn như một).
    Cá Nóc Chúa: đủ = 3 đoạn lăn, đoạn nào cũng có vạch báo; "lăn không báo" = lăn sang đoạn chưa có vạch báo.
    Hũ Chúa: đủ = 2 vệt dầu (chữ thập) châm lửa.
    Mọi tinh anh: "báo không nổ" = vùng báo hiện ra rồi biến mất trước khi nổ / trước khi thân lăn tới (khi tinh anh còn sống)."""
    n = du = it = trung = huy = lkb = ngat = 0
    for r in rs:
        z = r['zones']
        if not z and not r.get('ngat'):
            continue
        n += 1
        if r.get('ngat'): ngat += 1
        no = [q for q in z if q['no']]
        if art == 'namPhongChua':
            ok = len(no) >= 3
            for i in range(len(no)):
                if any(((no[i]['x'] - no[j]['x']) ** 2 + ((no[i]['y'] - no[j]['y']) / 0.85) ** 2) ** 0.5 < R for j in range(i + 1, len(no))):
                    trung += 1; ok = False; break
        elif art == 'caNocChua':
            ok = len(z) == 3 and (r.get('doan') or 0) == 3
            dT = r.get('doanT') or []
            if len(dT) > len(z) or any(i < len(z) and dT[i] > z[i]['t'] + z[i]['bao'] + 0.15 for i in range(len(dT))): lkb += 1; ok = False
        else:
            ok = len(no) == 2
        if ok: du += 1
        else: it += 1
        if any(q['huy'] for q in z): huy += 1
    return {'n': n, 'du': du, 'thieu': it, 'trung': trung, 'baoKhongNo': huy, 'lanKhongBao': lkb, 'ngat': ngat}


def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    n = int(a[0]) if a else 40
    arts = ['namPhongChua', 'caNocChua', 'huChua'] if (len(a) > 1 and a[1] == 'all') else [a[1] if len(a) > 1 else 'namPhongChua']
    jf = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    sv = json.load(open(os.path.join(GAME, 'tests', 'cay_luu.json')))[0]
    errs = []
    pg = cd_lib.NodePage(errs)
    allr = {}
    try:
        for art in arts:
            for ten, kb in KB:
                rs = pg.evaluate(JS, [sv, art, kb, 12345 + len(ten) * 7, n])
                allr[art + ' ' + ten] = rs
                t = tom(rs, art)
                print(f"{art:13s} {ten:16s} có chiêu {t['n']:3d} · đủ {t['du']:3d} · thiếu/trùng {t['thieu']:3d} (ô trùng chỗ {t['trung']:3d}) · báo không nổ {t['baoKhongNo']:3d} · lăn không báo {t['lanKhongBao']:3d} · báo ngắt {t['ngat']:3d}")
                allr[art + ' ' + ten + ' #tom'] = t
    finally:
        pg.close()
    if jf:
        json.dump(allr, open(jf, 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
