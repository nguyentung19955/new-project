"""Phiên 3 — kiểm ĐÒN THEO VŨ KHÍ của thân em bé AI (tệp em-be-<key>-don, js/sprite_custom.js ghepDon / chonEmBe / tayAI).
Chạy từ thư mục gốc repo:
    python3 -m http.server 8783 &                       (bản đang sửa)
    (tuỳ chọn) bản gốc để so điểm ảnh: một thư mục khác chứa repo ở commit trước, đã chạy build, phục vụ ở cổng 8784
    python3 game/tests/don_vk_shots.py <thư mục ảnh ra> [http://localhost:8784/game/dist/linh-khi.html?cloud=0]
Tệp đòn GIẢ được dựng ngay trong trang từ hàng "atk" của thân hiện có (dời / xoay / phủ màu từng hàng), KHÔNG ghi vào game/art/custom.
Kiểm:
  1. Không có tệp đòn: mọi tư thế (4 em bé × 4 vũ khí × đứng, chạy, đánh 3 nhát, giữ lấy đà, chiêu, chưởng, trúng đòn, lộn; có và không mặc đồ)
     giống HỆT bản gốc từng điểm ảnh (khi có URL bản gốc).
  2. Có tệp giả nhưng tắt cờ (G.DON_VK = false): giống hệt bản gốc.
  3. Có tệp giả của thân gốc, đang mặc áo bộ Rừng (thân em-be-<key>-rung, không có tệp -rung-don): giống hệt bản gốc (không mượn đòn thân gốc).
  4. Có tệp giả: ảnh từng em bé × vũ khí × khung đòn (thân đổi hàng, vũ khí trong tay, đồ bám), chấm đỏ = bàn tay tự đo.
  5. Không có lỗi trang (pageerror)."""
import os, sys, json, base64, hashlib
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
GOC = sys.argv[2] if len(sys.argv) > 2 else None
os.makedirs(OUT, exist_ok=True)
URL = 'http://localhost:8783/game/dist/linh-khi.html?cloud=0'
CHO = ("window.G && G.scene && G.spriteCustom && G.spriteCustom.ds && ['smith','hunter','healer','wrestler'].every(k => G.spriteCustom.get('em-be-' + k) && G.spriteCustom.get('em-be-' + k + '-rung'))"
       " && G.spriteCustom.do && G.spriteCustom.do['vk-sword-3'] && G.spriteCustom.do['vk-sword-3'].ready && G.spriteCustom.ghep && G.spriteCustom.ghep.smith")

# Danh sách tư thế dùng chung cho so điểm ảnh: [tên, đối tượng thêm vào o]
TU_THE = r"""
window.__TT = function () {
  const ds = [['dung', {}], ['chay', { move: true }], ['trung', { p: { hurtT: 0.1, st: {} } }], ['lon', { dodge: 0.4 }],
    ['chieu', { p: { specT: 0.2, st: {} } }], ['chuong', { p: { castT: 0.2, st: {} } }],
    ['giu0', { p: { mv: { holding: true, charge: 0.1 }, st: {} } }], ['giu1', { p: { mv: { holding: true, charge: 1 }, st: {} } }]];
  for (const c of [0, 1, 2]) for (const u of [0.1, 0.3, 0.45, 0.6, 0.9]) ds.push(['danh' + c + '-' + u, { atk: u, p: { comboI: c, mv: {}, st: {} } }]);
  return ds;
};
window.__DO = [null, { hat: 'non_la', robe: 'ao_vai', back: 'ho_lo', hand: 'bua_lua', mask: 'lua' }];
// Vẽ một tư thế lên canvas nhỏ, trả về băm điểm ảnh (chuỗi).
window.__VE = function (key, wt, tt, of, W, H) {
  const cv = window.__cv || (window.__cv = document.createElement('canvas')); cv.width = W || 80; cv.height = H || 70;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.imageSmoothingEnabled = false;
  G.time = 1.234;
  const o = Object.assign({ x: 36, y: (H || 70) - 10, face: 1, key, move: false, t: 1.234, atk: -1, dodge: -1, weapon: wt ? { type: wt, family: 3, tier: 0, rarity: 0, stage: 0 } : null, helm: null, armor: null, roundShadow: true }, tt);
  if (of) o.outfit = of;
  G.art.hero(c, o);
  return cv;
};
window.__BAM = function (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h1 = 2166136261 >>> 0, h2 = 0; for (let i = 0; i < d.length; i++) { h1 = Math.imul(h1 ^ d[i], 16777619) >>> 0; h2 = (h2 * 31 + d[i]) >>> 0; } return h1.toString(16) + h2.toString(16); };
// Mọi băm: em bé × vũ khí × tư thế × bộ đồ (bo: mặc áo bộ Rừng -> thân em-be-<key>-rung)
window.__TATCA = function (bo) {
  const kq = {};
  for (const key of ['smith', 'hunter', 'healer', 'wrestler']) for (const wt of ['sword', 'bow', 'spear', 'hammer', null]) for (const [ten, tt] of window.__TT()) {
    const dsDo = bo ? [{ hat: null, robe: 'ao_vo_cay', back: null, hand: null, mask: null, fx: { bo_than: 'rung', an_bo: [] } }] : window.__DO;
    dsDo.forEach((of, j) => { kq[[key, wt, ten, j].join('|')] = window.__BAM(window.__VE(key, wt, JSON.parse(JSON.stringify(tt)), of)); });
  }
  return kq;
};
"""

# Dựng tệp đòn giả cho một em bé từ hàng atk của thân (net 2, 48×48): 5 hàng × 6 khung.
GIA = r"""
async (key) => {
  const SC = G.spriteCustom, sp = SC.get('em-be-' + key), N = sp.net || 1, cw = sp.fw * N, ch = sp.fh * N, a = sp.dt.atk;
  const img = sp.img0 || sp.img, cv = document.createElement('canvas'); cv.width = 8 * cw; cv.height = 5 * ch;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const MAU = ['#ff3030', '#30d0ff', '#40ff60', '#ffb020', '#d040ff'];
  // biến đổi từng hàng: [dời x, dời y, xoay độ] theo khung
  const BD = [
    (i) => [0, 0, [-14, 8, -6, 10, -16, 12][i]],   // kiếm: chém ngang, chém ngược, bổ xuống
    (i) => [-1, 0, [0, -4, -6, -6, 2, 0][i]],       // cung
    (i) => [[-2, -3, 3, 4, 1, 0][i], 0, 0],          // giáo: thu về, đâm, rút
    (i) => [0, 0, [-12, -18, -6, 10, 14, 4][i]],     // búa: giơ cao, nện, rung
    (i) => [[0, -1, -2, 3, 4, 1][i], 0, [0, -4, -6, 6, 6, 0][i]], // chưởng
  ];
  for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) {
    const t = document.createElement('canvas'); t.width = cw; t.height = ch; const x = t.getContext('2d'); x.imageSmoothingEnabled = false;
    const [dx, dy, rot] = BD[r](i), f = Math.min(a.so - 1, i);
    x.translate(sp.ax * N + dx * N, sp.ay * N + dy * N); x.rotate(rot * Math.PI / 180); x.translate(-sp.ax * N, -sp.ay * N);
    x.drawImage(img, f * cw, a.hang * ch, cw, ch, 0, 0, cw, ch);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.28; x.fillStyle = MAU[r]; x.fillRect(0, 0, cw, ch);
    c.drawImage(t, i * cw, r * ch);
  }
  const dt = {}; ['atk_sword', 'atk_bow', 'atk_spear', 'atk_hammer', 'cast'].forEach((k, r) => dt[k] = { hang: r, so: 6, giay: 0.4 });
  return { loai: 'linh-khi-sprite', doi_tuong: 'em-be', ma: 'em-be-' + key + '-don', ten: 'GIẢ', tam: cv.toDataURL('image/png'), net: N, khung_rong: sp.fw, khung_cao: sp.fh, goc: [sp.ax, sp.ay], rong: sp.rong, cao: sp.cao, dong_tac: dt };
}
"""

# Bảng ảnh: mỗi em bé một tấm, hàng = vũ khí (+ chưởng), cột = khung đòn.
BANG = r"""
(key) => {
  const SC = G.spriteCustom, S = 3, CW = 64, CH = 64;
  const cot = [];
  const hang = [
    ['kiếm', 'sword', [['n1 lấy đà', { atk: 0.2, p: { comboI: 0, mv: {}, st: {} } }], ['n1 chém', { atk: 0.5, p: { comboI: 0, mv: {}, st: {} } }], ['n2 lấy đà', { atk: 0.2, p: { comboI: 1, mv: {}, st: {} } }], ['n2 chém', { atk: 0.5, p: { comboI: 1, mv: {}, st: {} } }], ['n3 lấy đà', { atk: 0.2, p: { comboI: 2, mv: {}, st: {} } }], ['n3 bổ', { atk: 0.5, p: { comboI: 2, mv: {}, st: {} } }], ['giữ', { p: { mv: { holding: true, charge: 1 }, st: {} } }]]],
    ['cung', 'bow', [['k0', { atk: 0.05 }], ['k1', { atk: 0.2 }], ['k2', { atk: 0.35 }], ['k3 buông', { atk: 0.5 }], ['k4', { atk: 0.7 }], ['k5', { atk: 0.9 }], ['giữ căng', { p: { mv: { holding: true, charge: 1 }, st: {} } }]]],
    ['giáo', 'spear', [['k0', { atk: 0.05 }], ['k1', { atk: 0.3 }], ['k2 đâm', { atk: 0.47 }], ['k3', { atk: 0.6 }], ['k4', { atk: 0.75 }], ['k5', { atk: 0.9 }], ['giữ', { p: { mv: { holding: true, charge: 1 }, st: {} } }]]],
    ['búa', 'hammer', [['k0', { atk: 0.05 }], ['k1', { atk: 0.25 }], ['k2', { atk: 0.4 }], ['k3 nện', { atk: 0.5 }], ['k4', { atk: 0.65 }], ['k5', { atk: 0.9 }], ['giữ', { p: { mv: { holding: true, charge: 1 }, st: {} } }]]],
    ['chưởng', 'sword', [['k0', { p: { castT: 0.39, st: {} } }], ['k1', { p: { castT: 0.33, st: {} } }], ['k2', { p: { castT: 0.27, st: {} } }], ['k3', { p: { castT: 0.2, st: {} } }], ['k4', { p: { castT: 0.12, st: {} } }], ['k5', { p: { castT: 0.04, st: {} } }], ['chiêu', { p: { specT: 0.15, st: {} } }]]],
  ];
  const of = { hat: 'non_la', robe: 'ao_vai', back: 'ho_lo', hand: 'bua_lua', mask: 'lua' };
  const W = (CW * 7 + 40) * S, H = (CH * 2 * hang.length + 16) * S, out = document.createElement('canvas'); out.width = W; out.height = H;
  const c = out.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#3d5a33'; c.fillRect(0, 0, W, H);
  c.font = (6 * S) + 'px sans-serif';
  const sp = SC.cuaEmBe(key, {});
  hang.forEach(([ten, wt, ds], r) => {
    for (let lop = 0; lop < 2; lop++) {
      const y0 = (16 + (r * 2 + lop) * CH) * S;
      c.fillStyle = '#fff'; c.fillText(ten + (lop ? ' +đồ' : ''), 2 * S, y0 + 30 * S);
      ds.forEach(([nh, tt], j) => {
        const o = JSON.parse(JSON.stringify(tt));
        const cv = window.__VE(key, wt, o, lop ? of : null, CW, CH);
        const x0 = (40 + j * CW) * S;
        c.fillStyle = (r + lop + j) % 2 ? '#4a6b3c' : '#56704a'; c.fillRect(x0, y0, CW * S, CH * S);
        c.drawImage(cv, x0, y0, CW * S, CH * S);
        // chấm đỏ: bàn tay trước tự đo của khung đang vẽ
        const oo = Object.assign({ key, t: 1.234, atk: -1, dodge: -1, weapon: { type: wt } }, JSON.parse(JSON.stringify(tt)));
        const s = SC.chonEmBe(sp, oo), tay = SC.laHangDon(s.ten) ? SC.tayAI(sp, s.ten, s.i) : null;
        if (tay) { c.fillStyle = '#ff0000'; c.fillRect(x0 + (36 + tay[0]) * S - 2, y0 + (CH - 10 + tay[1]) * S - 2, 4, 4); }
        if (r === 0 && lop === 0) { c.fillStyle = '#fff'; c.fillText(nh, x0 + 2 * S, 8 * S); }
        c.fillStyle = '#ffe'; c.fillText(s.ten + ':' + s.i, x0 + 2 * S, y0 + 7 * S);
      });
    }
  });
  return out.toDataURL('image/png');
}
"""


def luu(d, ten):
    open(os.path.join(OUT, ten), 'wb').write(base64.b64decode(d.split(',')[1]))


def mo(b, url, errs):
    pg = b.new_page(viewport={'width': 960, 'height': 540})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(url)
    pg.wait_for_function(CHO, timeout=90000)
    pg.wait_for_timeout(800)
    pg.evaluate("() => { G.tick = function () {}; }")  # dừng vòng lặp: trang đứng yên, chỉ vẽ khi gọi
    pg.add_script_tag(content=TU_THE)
    return pg


def so(a, b, ten):
    khac = [k for k in a if a[k] != b.get(k)]
    print('%s: %d tư thế, %d khác%s' % (ten, len(a), len(khac), (' (ví dụ ' + ', '.join(khac[:5]) + ')') if khac else ''))
    return len(khac)


def main():
    errs, loi = [], 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = mo(b, URL, errs)
        moi0 = pg.evaluate("() => window.__TATCA(false)")
        moi0b = pg.evaluate("() => window.__TATCA(true)")
        if GOC:
            pg0 = mo(b, GOC, errs)
            goc = pg0.evaluate("() => window.__TATCA(false)")
            gocb = pg0.evaluate("() => window.__TATCA(true)")
            pg0.close()
            loi += so(moi0, goc, '1. Không có tệp đòn, so bản gốc')
            loi += so(moi0b, gocb, '1b. Không có tệp đòn, mặc áo bộ Rừng, so bản gốc')
        else:
            goc, gocb = moi0, moi0b
        # nạp tệp đòn giả cho cả 4 em bé
        for key in ['smith', 'hunter', 'healer', 'wrestler']:
            tep = pg.evaluate(GIA, key)
            if key in ('smith', 'hunter'):
                open(os.path.join(OUT, 'gia-em-be-%s-don.sprite.json' % key), 'w').write(json.dumps(tep))
            pg.evaluate("(t) => G.spriteCustom.add(t)", tep)
        pg.wait_for_function("['smith','hunter','healer','wrestler'].every(k => G.spriteCustom.get('em-be-' + k).dt.atk_sword)", timeout=20000)
        print('Hàng thân smith sau khi ghép:', pg.evaluate("() => Object.entries(G.spriteCustom.get('em-be-smith').dt).map(([k, a]) => k + '@' + a.hang + 'x' + a.so).join(' ')"))
        tat = pg.evaluate("() => { G.DON_VK = false; const k = window.__TATCA(false); G.DON_VK = true; return k; }")
        loi += so(tat, goc, '2. Có tệp giả nhưng tắt cờ G.DON_VK, so bản gốc')
        bo = pg.evaluate("() => window.__TATCA(true)")
        loi += so(bo, gocb, '3. Có tệp giả thân gốc, đang mặc áo bộ Rừng (không có tệp -rung-don), so bản gốc')
        bat = pg.evaluate("() => window.__TATCA(false)")
        doi = sum(1 for k in bat if bat[k] != goc[k])
        print('4. Có tệp giả, bật cờ: %d/%d tư thế đổi hình (mong đợi: chỉ đánh / giữ / chiêu / chưởng có vũ khí, và chiêu / chưởng tay không)' % (doi, len(bat)))
        sai = [k for k in bat if bat[k] != goc[k] and k.split('|')[2] in ('dung', 'chay', 'trung', 'lon')]
        print('   tư thế không phải đòn mà đổi hình: %d%s' % (len(sai), (' ' + ', '.join(sai[:5])) if sai else ''))
        loi += len(sai)
        for key in ['smith', 'hunter', 'healer', 'wrestler']:
            luu(pg.evaluate(BANG, key), 'don-%s.png' % key)
        # so bàn tay tự đo với điểm tay_truoc chỉnh tay trong tệp ghép (hàng atk hiện có) để biết cách đo đáng tin tới đâu
        r = pg.evaluate("""() => { const out = {}; for (const k of ['smith','hunter','healer','wrestler']) { const sp = G.spriteCustom.get('em-be-' + k), g = G.spriteCustom.ghep[k]; const ds = [];
            for (let i = 0; i < sp.dt.atk.so; i++) { const t = G.spriteCustom.tayAI(sp, 'atk', i), q = g && g.theo['atk:' + i] && g.theo['atk:' + i].tay_truoc; if (t && q) ds.push(Math.hypot(t[0] - q[0], t[1] - q[1]).toFixed(1)); }
            out[k] = ds.join(' '); } return out; }""")
        print('Lệch (điểm ảnh) giữa bàn tay tự đo và tay_truoc chỉnh tay ở hàng atk:', json.dumps(r, ensure_ascii=False))
        pg.close()
        b.close()
    print('pageerror:', errs[:5] if errs else 'không có')
    loi += len(errs)
    print('KẾT QUẢ:', 'ĐẠT' if not loi else 'CÓ %d LỖI' % loi)
    sys.exit(1 if loi else 0)


main()
