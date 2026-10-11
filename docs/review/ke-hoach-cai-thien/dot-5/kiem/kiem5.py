"""Đợt 5: các phép so bản MỚI (cổng 8801) với bản TRƯỚC Đợt 5 (cổng 8802). python3 kiem5.py <thư mục ra> [a] [b] [c]
 (a) Không có tệp ghep-* → hình y hệt bản trước: 4 em bé × (6 kiểu mặc + 13 mũ) × 7 hàng × mọi khung, thân AI và thân vẽ code, so từng điểm ảnh.
 (b) 13 mũ trên Cu Tí (có tệp ghép): chỗ đặt mũ bản mới so với bản trước ở từng khung của 7 hàng.
 (c) Số liệu: chỉ số người chơi; nhật ký sát thương của bot chơi ải 1 (cùng hạt giống ngẫu nhiên) phải trùng từng dòng; bot thắng."""
from chung import *
import hashlib
OUT = sys.argv[1]; LAM = sys.argv[2:] or ['a', 'b', 'c']
MU = ['khan_lua', 'khan_xep', 'mu_da_ca', 'mu_rom', 'mu_sung', 'mu_tai_cao', 'mu_vay_ca', 'non_la', 'trum_khan', 'trum_la', 'trum_nhon', 'trum_sung', 'vong_la']
CFG = {
    'khong-do': [], 'mu+lung (rung)': [['mu_sung', 2], ['gui_tre', 2]],
    'du-bo-rung-5-mon': [['mu_sung', 2], ['ao_vo_cay', 2], ['gui_tre', 2], ['bua_nanh', 2], ['canh_la', 2, 2]],
    'chi-ao-bien': [['ao_vay', 3]], 'do-le': [['mu_rom', 1], ['ao_vai', 0], ['ho_lo', 1], ['bua_hut', 1]],
    '3-mon-rung-khong-ao': [['mu_sung', 2], ['gui_tre', 2], ['bua_nanh', 2]],
}
for m in MU: CFG['mu:' + m] = {'hat': m}
QUEN = {'smith': 'sword', 'hunter': 'bow', 'healer': 'spear', 'wrestler': 'hammer'}
JS_A = r"""
(a) => {
  const SC = G.spriteCustom, out = {};
  for (const k of a.keys) SC.remove('ghep-' + k);
  if (a.code) for (const k of a.keys) SC.remove('em-be-' + k);
  for (const key of a.keys) for (const cf in a.cfg) {
    const D = K.dung(key, a.quen[key], a.cfg[cf]), cells = [];
    if (a.code) { // thân vẽ code: đi qua các trạng thái thật của game
      const sp = { dt: { idle: { so: 8, giay: 1.23 }, move: { so: 8, giay: 0.62 }, tele: { so: 5 }, atk: { so: 10 }, hit: { so: 1 }, die: { so: 8, giay: 0.6 }, ne: { so: 8 } } };
      for (const ten of a.rows) for (let i = 0; i < sp.dt[ten].so; i++) for (const cb of ten === 'atk' ? [0, 1, 2] : [0]) {
        const o = K.args(ten, i, sp.dt[ten].so, sp, D.look, D.weapon, key); if (ten === 'atk') o.p.comboI = cb;
        cells.push(K.png(K.cell(o, 72, 60, 32, 50, 2, null)));
      }
    } else for (const ten of a.rows) for (let i = 0; i < D.sp.dt[ten].so; i++) cells.push(K.ve5(D, ten, i, {}, { W: 72, H: 60, FX: 32, FY: 50, Z: 2 }));
    out[key + '|' + cf] = cells;
  }
  return out;
}
"""
JS_B = r"""
(a) => {
  const out = {};
  for (const m of a.mu) {
    const D = K.dung('smith', 'sword', { hat: m }), r = {};
    for (const ten of a.rows) for (let i = 0; i < D.sp.dt[ten].so; i++) {
      const o = K.o5(D, ten, i, { khongVk: 1 }); K.lop = null; const png = K.png(K.cell(o, 72, 60, 32, 50, 2, null));
      r[ten + ':' + i] = { hop: K.lop ? K.hopLop(K.lop.r.truoc) || K.hopLop(K.lop.r.sau) : null, png };
    }
    out[m] = r;
  }
  return out;
}
"""
JS_C1 = r"""
(a) => {
  const out = {};
  for (const key of a.keys) for (const vk of a.vk) {
    K.dung(key, vk, a.mac); const P = G.buildPlayer(), so = {};
    for (const k in P) { const v = P[k]; if (typeof v === 'number' || typeof v === 'boolean' || v === null) so[k] = v; else if (k === 'resist' || k === 'elBonus' || k === 'st') so[k] = JSON.stringify(v); }
    out[key + '|' + vk] = so;
  }
  return out;
}
"""
JS_C2 = r"""
(a) => {
  // ngẫu nhiên có hạt giống: hai bản chạy cùng một chuỗi số
  let s = a.seed >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; G.rnd = Math.random;
  G.time = 1000; // cùng mốc giờ game ở hai bản
  G.testSave({ hero: a.key, lvl: 6, tier: 1, melee: a.vk === 'bow' ? 'sword' : a.vk });
  Object.assign(G.botCfg, { prefer: a.vk });
  G.startStage(0, 0, 0, { kind: 'A', seed: 1 });
  const log = [], d0 = G.damage;
  G.damage = function (t, amt, o) { const S = G.getRun(), P = S && S.P; log.push([Math.round((G.time || 0) * 1000), Math.round(amt * 100) / 100, t && (t.role || t.kind || (t.isBoss ? 'trum' : '?')), P && t ? Math.round(Math.hypot(t.x - P.x, t.y - P.y) * 10) / 10 : null]); return d0.apply(this, arguments); };
  let res; try { res = G.probeRun(900); } finally { G.damage = d0; }
  return { res, n: log.length, log };
}
"""
os.makedirs(OUT, exist_ok=True); kq = {}
with sync_playwright() as p:
    b = p.chromium.launch(); e1 = []; e2 = []
    if 'a' in LAM:
        for code in (False, True):
            moi = page(b, 8801, e1); cu = page(b, 8802, e2)
            arg = {'keys': KEYS, 'cfg': CFG, 'rows': ROWS, 'quen': QUEN, 'code': code}
            A = cu.evaluate(JS_A, arg); B = moi.evaluate(JS_A, arg); tong = khac = 0; ds = []
            for k in A:
                for i, (x, y) in enumerate(zip(A[k], B[k])):
                    tong += 1
                    if x != y: khac += 1; ds.append((k, i))
                assert len(A[k]) == len(B[k])
            kq['a_than_code' if code else 'a_than_ai'] = {'so_o': tong, 'o_khac': khac, 'vi_du': ds[:12]}
            print('(a)', 'thân vẽ code' if code else 'thân AI', '· ô so:', tong, '· ô khác:', khac, ds[:6])
            moi.close(); cu.close()
    if 'b' in LAM:
        moi = page(b, 8801, e1); cu = page(b, 8802, e2)
        A = cu.evaluate(JS_B, {'mu': MU, 'rows': ROWS}); B = moi.evaluate(JS_B, {'mu': MU, 'rows': ROWS}); R = {}
        for m in MU:
            lech = 0; n = px = 0; dung0 = A[m]['idle:0']['png'] == B[m]['idle:0']['png']
            for f in A[m]:
                ha, hb = A[m][f]['hop'], B[m][f]['hop']; n += 1; px += A[m][f]['png'] != B[m][f]['png']
                if (ha is None) != (hb is None): lech = 99
                elif ha: lech = max(lech, max(abs(x - y) for x, y in zip(ha, hb)))
            R[m] = {'idle0_giong_het': dung0, 'lech_lon_nhat': lech, 'so_khung': n, 'khung_khac_diem_anh': px}
            print('(b)', m, R[m])
        kq['b_mu'] = R; moi.close(); cu.close()
    if 'c' in LAM:
        moi = page(b, 8801, e1); cu = page(b, 8802, e2)
        arg = {'keys': KEYS, 'vk': VK, 'mac': [['mu_sung', 2], ['gui_tre', 2]]}
        A = cu.evaluate(JS_C1, arg); B = moi.evaluate(JS_C1, arg)
        kq['c_chi_so'] = {'so_cau_hinh': len(A), 'khac': [k for k in A if A[k] != B[k]]}
        print('(c) chỉ số người chơi: cấu hình', len(A), '· khác:', kq['c_chi_so']['khac'])
        kq['c_bot'] = {}
        for pg in (cu, moi):  # dừng vòng lặp vẽ thật, trả lại bước mô phỏng: game chỉ chạy khi script gọi G.sim → hai bản chạy y hệt nhau
            pg.add_script_tag(path=REPO + '/game/tests/bot.js')
            pg.evaluate("() => { window.requestAnimationFrame = () => 0; G.tick = K.realTick; }"); pg.wait_for_timeout(300)
        for key in KEYS:
            arg = {'key': key, 'vk': QUEN[key], 'seed': 20261011}
            ra = cu.evaluate(JS_C2, arg); rb = moi.evaluate(JS_C2, arg)
            if os.environ.get('DOI_CHUNG'): rb = cu.evaluate(JS_C2, arg)  # đối chứng: bản trước chạy hai lần
            ha = hashlib.sha1(json.dumps(ra['log']).encode()).hexdigest()[:12]; hb = hashlib.sha1(json.dumps(rb['log']).encode()).hexdigest()[:12]
            giong = ra['log'] == rb['log']; dau = next((i for i, (x, y) in enumerate(zip(ra['log'], rb['log'])) if x != y), None)
            kq['c_bot'][key] = {'vu_khi': QUEN[key], 'truoc': {'thang': ra['res'].get('win'), 'giay': ra['res']['t'], 'so_don': ra['n'], 'ma': ha},
                                'moi': {'thang': rb['res'].get('win'), 'giay': rb['res']['t'], 'so_don': rb['n'], 'ma': hb}, 'nhat_ky_trung': giong, 'dong_khac_dau': dau, 'loi_so': rb['res'].get('bad')}
            print('(c) bot ải 1', key, QUEN[key], kq['c_bot'][key])
        moi.close(); cu.close()
    b.close()
print('lỗi trang:', e1[:3], e2[:3])
cu_kq = json.load(open(OUT + '/ket-qua.json')) if os.path.exists(OUT + '/ket-qua.json') else {}
cu_kq.update(kq); json.dump(cu_kq, open(OUT + '/ket-qua.json', 'w'), ensure_ascii=False, indent=1)
