"""Đo góc kiếm, điểm nắm, lớp trước/sau thân theo TỪNG KHUNG HÌNH 60 fps cho 4 em bé × 3 nhát chém (+ chạy chém, quay trái).
Chạy: python3 do_goc.py <url> <tệp json ra>
url ví dụ http://127.0.0.1:8770/linh-khi-nhe.html?cloud=0   (thêm &kiemmuot=0 để đo bản cũ)
In bảng tóm tắt: số lần góc nhảy > 25°/khung ngoài pha chém, số lần đổi lớp, độ lệch chuôi–nắm tay lớn nhất."""
import json, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
JS = r"""() => {
  const SC = G.spriteCustom, TL = G.tinhLinh, KEYS = ['smith','hunter','wrestler','healer'], DUR = [0.3, 0.3, 0.46], kq = {};
  const W = { type: 'sword', family: 0, rarity: 0 }, OF = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null };
  const C = document.createElement('canvas'); C.width = 120; C.height = 120; const cx = C.getContext('2d');
  const mot = (k, o) => {
    cx.setTransform(1, 0, 0, 1, 60, 90); G.art.hero(cx, Object.assign({}, o, { x: 0, y: 0 })); // vẽ thật (ghi góc khung đòn cuối như trong game)
    const sp = SC.cuaEmBe(k, o), s = SC.chonEmBe(sp, o), fr = TL.frame(o, 1), vg = TL.vkGhep(o), w = vg.wp;
    const lh = w.lh != null ? w.lh : -5, r = w.ang * Math.PI / 180;
    const nam = [w.x + Math.cos(r) * lh + (o.neoTay ? o.neoTay[0] : 0), w.y + Math.sin(r) * lh + (o.neoTay ? o.neoTay[1] : 0)];
    return { s: s.ten + ':' + s.i, code: fr.anim + ':' + fr.f, goc0: fr.weapon ? fr.weapon.ang : null, goc: w.ang, truoc: !!w.front, P: vg.P || null, nam, x: w.x, y: w.y };
  };
  // canh: danh sách [atk, comboI, move, extra] từng khung 60 fps, dùng CHUNG một đối tượng người chơi p (như trong game)
  const chay = (k, canh, face) => { const p = { comboI: 0, mv: {}, st: {} }, a = [];
    canh.forEach((q, i) => { p.comboI = q[1]; Object.assign(p, q[3] || {}, q[4] || {}); const o = { x: 0, y: 0, face: face || 1, key: k, t: 1 + i / 60, tc: 1 + i / 60, move: !!q[2], weapon: W, atk: q[0], dodge: -1, p, outfit: OF };
      a.push(Object.assign({ atk: +q[0].toFixed(3) }, mot(k, o))); }); return a; };
  let ID = 0; const nhat = (cb, mv) => { const n = Math.round(DUR[cb] * 60), r = [], id = ++ID; for (let i = 0; i < n; i++) r.push([i / n, cb, mv, { lastAtk: id }]); return r; };
  const nghi = (n, cb, mv) => Array.from({ length: n }, () => [-1, cb, mv]);
  for (const k of KEYS) {
    kq[k] = {};
    for (let cb = 0; cb < 3; cb++) kq[k]['nhat' + (cb + 1)] = chay(k, nghi(3, 0).concat(nhat(cb), nghi(12, cb)));
    kq[k].combo = chay(k, nghi(3, 0).concat(nhat(0), nghi(2, 0), nhat(1), nghi(2, 1), nhat(2), nghi(12, 2)));
    kq[k].chay = chay(k, nghi(3, 0, true).concat(nhat(0, true), nhat(1, true), nhat(2, true), nghi(10, 2, true)));
    kq[k].trai = chay(k, nghi(3, 0).concat(nhat(0), nhat(1), nhat(2), nghi(10, 2)), -1);
    kq[k].len = chay(k, nghi(3, 0).concat(nhat(0).map((q) => q.concat([{ aimRel: -45 }])), nghi(10, 0).map((q) => q.concat([{ aimRel: null }]))));
    kq[k].xuong = chay(k, nghi(3, 0).concat(nhat(2).map((q) => q.concat([{ aimRel: 45 }])), nghi(10, 2).map((q) => q.concat([{ aimRel: null }]))));
    { const r = []; for (let i = 0; i < 21; i++) r.push([-1, 0, false, { specT: Math.max(0, 0.35 - i / 60), aimRel: null }]); kq[k].chieu = chay(k, nghi(2, 0).concat(r, nghi(10, 0).map((q) => q.concat([{ specT: 0 }])))); }
    { const r = []; for (let i = 0; i < 8; i++) r.push([0.0, 0, false, { dashT: Math.max(0, 0.12 - i / 60), specT: 0 }]); kq[k].luot = chay(k, nghi(2, 0).concat(r, nghi(8, 0, false).map((q) => q.concat([{ dashT: 0 }])))); }
  }
  return kq;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); g = b.new_page(viewport={'width': 900, 'height': 600}); loi = []
    g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=240000)
    g.wait_for_timeout(1500)
    r = g.evaluate(JS)
    b.close()
json.dump(r, open(OUT, 'w'), ensure_ascii=False)


def tom(a):
    """đoạn quay một chiều: [(độ, số khung)], đổi lớp, lệch chuôi"""
    seg, cur, n = [], 0, 0
    for i in range(1, len(a)):
        d = ((a[i]['goc'] - a[i - 1]['goc'] + 180) % 360) - 180
        if d == 0: continue
        if cur and (d > 0) != (cur > 0): seg.append((cur, n)); cur, n = 0, 0
        cur += int(round(d)); n += 1
    if cur: seg.append((cur, n))
    lop = sum(1 for i in range(1, len(a)) if a[i]['truoc'] != a[i - 1]['truoc'])
    lech = max([((q['nam'][0] - q['P'][0]) ** 2 + (q['nam'][1] - q['P'][1]) ** 2) ** 0.5 for q in a if q['P']] or [0])
    mx = max(abs(((a[i]['goc'] - a[i - 1]['goc'] + 180) % 360) - 180) for i in range(1, len(a)))
    return seg, lop, lech, mx


if __name__ == '__main__':
    for k, v in r.items():
        for ten, a in v.items():
            seg, lop, lech, mx = tom(a)
            print(f'{k:9s} {ten:6s} góc: {" ".join(str(round(q["goc"])) + ("" if q["truoc"] else "s") for q in a)}')
            print(f'{"":16s} đoạn quay {" ".join(f"{d:+d}/{n}" for d, n in seg)} | Δmax {mx}° | đổi lớp {lop} | chuôi lệch {lech:.1f}')
    print('pageerror:', loi or 'không có')
