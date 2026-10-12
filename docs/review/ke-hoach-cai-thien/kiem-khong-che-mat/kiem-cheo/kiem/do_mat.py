"""Đo KIẾM ĐÈ MẶT bằng điểm ảnh, từng khung hình 60 fps, mọi trạng thái cầm kiếm.
Mỗi khung vẽ em bé 2 lần bằng G.art.hero (y như trong game, dùng chung một người chơi p suốt kịch bản):
  lần 1 tắt vẽ vũ khí (G.weaponArt.draw rỗng), lần 2 vẽ đủ -> điểm ảnh khác nhau = phần vũ khí NHÌN THẤY (vẽ sau thân thì bị thân che).
Vùng mặt = SC.matKhung của đúng khung ảnh AI đang vẽ (đĩa mắt-mũi-miệng, x về trước mặt). Đếm điểm ảnh vũ khí trong đĩa
nằm ĐÈ lên điểm ảnh của thân (de: che mặt thật) và mọi điểm ảnh vũ khí trong đĩa kể cả chỗ trống quanh mép mặt (dd).
Chạy: python3 do_mat.py <url> <tệp json ra> [loai=sword] [ho=0]
  url ví dụ http://127.0.0.1:8770/linh-khi-nhe.html?cloud=0   (thêm &kiemsau=0 để đo bản cũ)
In bảng: trạng thái × em bé × thân × hướng: số khung có đè mặt / tổng khung, điểm ảnh lớn nhất, % đĩa mặt lớn nhất."""
import json, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
LOAI = sys.argv[3] if len(sys.argv) > 3 else 'sword'
HO = int(sys.argv[4]) if len(sys.argv) > 4 else 0
JS = r"""([LOAI, HO, CHI]) => {
  const SC = G.spriteCustom, KEYS = ['smith','hunter','wrestler','healer'], BO = [null, 'rung', 'bien', 'lau'], DUR = [0.3, 0.3, 0.46], K = 3;
  const W = { type: LOAI, family: HO, rarity: 0 };
  const C = document.createElement('canvas'); C.width = 120 * K; C.height = 110 * K; const cx = C.getContext('2d', { willReadFrequently: true });
  const X0 = 60 * K, Y0 = 80 * K, WA = G.weaponArt, ve0 = WA.draw;
  const of = (bo) => bo ? { hat: null, robe: null, back: null, hand: null, mask: null, wing: null, fx: { bo_than: bo } } : { hat: null, robe: null, back: null, hand: null, mask: null, wing: null };
  const veMot = (o, coVk) => {
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, C.width, C.height);
    cx.setTransform(K, 0, 0, K, X0, Y0); cx.imageSmoothingEnabled = false;
    if (!coVk) WA.draw = () => {};
    try { G.art.hero(cx, Object.assign({}, o, { x: 0, y: 0 })); } finally { WA.draw = ve0; }
    return cx.getImageData(0, 0, C.width, C.height).data;
  };
  const doKhung = (k, o) => {
    const a = veMot(o, false), b = veMot(o, true);
    const sp = SC.cuaEmBe(k, o), s = SC.chonEmBe(sp, o);
    let m = SC.matKhung(sp, s.ten, s.i), uoc = false;
    if (!m) { // máy không đo được đĩa đầu (mũ trùm): ước từ điểm đỉnh đầu của khung (như js/hero_tinhlinh.js vkGhep), đánh dấu 'uoc'
      const gv = SC.khungVk(o), d0 = gv && gv.diem && gv.diem.dinh_dau; if (d0) { m = { x: d0[0] + 2.5, y: d0[1] + 14.5, r: 4.6 }; uoc = true; } }
    let vk = 0, de = 0, dd = 0, dt = 0;
    const f = o.face || 1;
    const mx = m ? X0 + f * m.x * K : 0, my = m ? Y0 + m.y * K : 0, mr = m ? m.r * K : 0;
    for (let y = 0; y < C.height; y++) for (let x = 0; x < C.width; x++) {
      const j = (y * C.width + x) * 4;
      const khac = Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]) + Math.abs(a[j + 3] - b[j + 3]) > 24;
      const trong = m && (x + 0.5 - mx) ** 2 + (y + 0.5 - my) ** 2 <= mr * mr;
      if (trong) dt++;
      if (khac) { vk++; if (trong) { dd++; if (a[j + 3] > 40) de++; } } // de: vũ khí đè lên điểm ảnh MẶT (thân có ở đó); dd: cả chỗ trống trong đĩa
    }
    let h = 0; for (let j = 0; j < b.length; j += 1) h = (h * 31 + b[j]) | 0; // dấu vân tay ảnh vẽ đủ (so bản ?kiemsau=0 với bản trước)
    let goc = null, truoc = null; try { const w = G.tinhLinh.vkGhep(o).wp; goc = w ? w.ang : null; truoc = w ? !!w.front : null; } catch (e) { /* bỏ qua */ }
    return { s: s.ten + ':' + s.i, uoc, h, goc, truoc, vk, de, dd, dt, m: m ? [+m.x.toFixed(1), +m.y.toFixed(1), +m.r.toFixed(1)] : null };
  };
  let ID = 0;
  const nhat = (cb, mv) => { const n = Math.round(DUR[cb] * 60), r = [], id = ++ID; for (let i = 0; i < n; i++) r.push([i / n, cb, mv, { lastAtk: id }]); return r; };
  const nghi = (n, cb, mv, x) => Array.from({ length: n }, () => [-1, cb, mv, x || {}]);
  const CANH = {
    dung: () => nghi(48, 0),
    chay: () => nghi(48, 0, true),
    dung_chay: () => nghi(12, 0).concat(nghi(24, 0, true), nghi(18, 0)),
    lon: () => { const r = []; for (let i = 0; i < 24; i++) r.push([-1, 0, false, { _dodge: i / 24, ddx: 1, ddy: 0 }]); return nghi(4, 0).concat(r, nghi(8, 0)); },
    trung: () => nghi(4, 0).concat(nghi(18, 0, false, { hurtT: 0.3 }), nghi(10, 0, false, { hurtT: 0 })),
    chem3: () => nghi(6, 0).concat(nhat(0), nghi(2, 0), nhat(1), nghi(2, 1), nhat(2)),
    sau_don: () => nhat(2).concat(nghi(24, 2)),
    chay_chem: () => nghi(6, 0, true).concat(nhat(0, true), nhat(1, true), nhat(2, true), nghi(16, 2, true)),
    giu: () => { const r = []; for (let i = 0; i < 40; i++) r.push([-1, 0, false, { mv: { holding: true, charge: Math.min(1, i / 30) } }]); return nghi(4, 0).concat(r, nghi(10, 0, false, { mv: {} })); },
    chieu: () => { const r = []; for (let i = 0; i < 21; i++) r.push([-1, 0, false, { specT: Math.max(0.001, 0.35 - i / 60) }]); return nghi(4, 0).concat(r, nghi(16, 0, false, { specT: 0 })); },
    luot: () => { const r = []; for (let i = 0; i < 8; i++) r.push([0, 0, false, { dashT: Math.max(0.001, 0.12 - i / 60) }]); return nghi(4, 0).concat(r, nghi(16, 0, false, { dashT: 0 })); },
  };
  const kq = {};
  for (const ten of Object.keys(CANH)) {
    if (CHI && CHI.indexOf(ten) < 0) continue;
    kq[ten] = {};
    for (const k of KEYS) for (const bo of BO) for (const face of [1, -1]) {
      const p = { comboI: 0, mv: {}, st: {} }, a = [];
      CANH[ten]().forEach((q, i) => {
        p.comboI = q[1]; const x = Object.assign({}, q[3] || {}); const dg = x._dodge; delete x._dodge; Object.assign(p, x);
        const o = { x: 0, y: 0, face, key: k, t: 1 + i / 60, tc: 1 + i / 60, move: !!q[2], weapon: W, atk: q[0], dodge: dg != null ? dg : -1, p, outfit: of(bo) };
        a.push(doKhung(k, o));
      });
      kq[ten][k + '|' + (bo || 'goc') + '|' + face] = a;
    }
  }
  return kq;
}"""


def chay(url, loai='sword', ho=0, chi=None):
    with sync_playwright() as p:
        b = p.chromium.launch()
        g = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=3); loi = []
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto(url)
        g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && G.weaponArt && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=300000)
        # nạp sẵn ảnh thân bộ (SC.get bắt đầu tải)
        g.evaluate("""() => { for (const k of ['smith','hunter','wrestler','healer']) for (const b of ['rung','bien','lau']) G.spriteCustom.get('em-be-'+k+'-'+b); }""")
        g.wait_for_function("""() => ['smith','hunter','wrestler','healer'].every(k => ['rung','bien','lau'].every(b => { const s = G.spriteCustom.get('em-be-'+k+'-'+b); return !s || s.img; })) && (() => { const s = G.spriteCustom.get('em-be-smith-rung'); return s && s.donMa; })()""", timeout=300000)
        # nạp sẵn ảnh vũ khí AI đang đo (ảnh tải lười: chưa có thì game vẽ hình tạm, số đo sẽ lệch giữa các lần chạy)
        g.wait_for_function("([l, h]) => { const sp = G.spriteCustom.timVuKhi(G.weaponArt.fromWeapon({ type: l, family: h, rarity: 0 })); return !!(sp && sp.ready); }", arg=[loai, ho], timeout=120000)
        g.wait_for_timeout(1500)
        r = g.evaluate(JS, [loai, ho, chi])
        b.close()
    return r, loi


def tom(r):
    dong = []
    for ten, v in r.items():
        for kk, a in v.items():
            n = sum(1 for q in a if q['de'] > 0)
            mx = max((q['de'] for q in a), default=0)
            pc = max((100.0 * q['de'] / q['dt'] for q in a if q['dt']), default=0)
            kd = sum(1 for q in a if q['m'] is None or q.get('uoc'))
            nd = sum(1 for q in a if q.get('dd', 0) > 0)
            dong.append((ten, kk, n, len(a), mx, pc, kd, nd))
    return dong


if __name__ == '__main__':
    chi = sys.argv[5].split(',') if len(sys.argv) > 5 else None
    r, loi = chay(URL, LOAI, HO, chi)
    json.dump(r, open(OUT, 'w'), ensure_ascii=False)
    for ten, kk, n, tong, mx, pc, kd, nd in tom(r):
        print(f'{ten:10s} {kk:22s} đè mặt {n:3d}/{tong:3d} khung | lớn nhất {mx:4d} điểm ảnh ({pc:4.1f}% đĩa mặt) | có vũ khí trong đĩa (kể cả chỗ trống) {nd:3d}{"" if not kd else f" | {kd} khung máy không đo được đĩa mặt (ước từ đỉnh đầu)"}')
    print('pageerror:', loi or 'không có')
