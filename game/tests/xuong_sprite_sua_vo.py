"""Xưởng Sprite: cử động không vỡ hình và Tự đoán bộ phận với ảnh kiểu "ảnh AI vẽ" (góp ý dùng thử đợt 4).

Gọi từ xuong_sprite.py (kiem_sua_vo). Kiểm:
  1. Tự đoán: với từng ảnh thử (em bé áo trùm đỏ nhìn chính diện, em bé áo xanh, quái bốn chân, cá bay, khối mềm và
     hai ảnh vẽ tay cũ) đầu ở trên, tay hai bên, chân ở dưới, đuôi ở sau, cánh ở trên...; chỗ không chắc thì để dính thân
     và có chữ "Tô thêm cho đúng".
  2. Không vỡ hình: mọi động tác (thở, đi, chuẩn bị đánh, đánh, trúng đòn, chết, né), mọi mẫu khung, cả khi bộ phận
     bị chia sai (chia theo khớp mẫu kiểu cũ): không có điểm trong suốt lọt vào bên trong hình, không có mảnh rời khỏi thân.
  3. Tô tay trên điện thoại: bút to nhỏ, cục tẩy (về thân), phóng to, hoàn tác.
  4. Trong game: em bé và quái làm từ ảnh AI vẽ đúng khung, không lỗ, không mảnh rời ở mọi trạng thái.
"""
import json
import os

from xuong_sprite_ai import ANH_AI, MAU_AI
from xuong_sprite_ve import ve_bon_chan, ve_nguoi

# Đo một khung hình {w, h, px}: lo = điểm trong suốt bị hình bao kín, roi = số điểm không thuộc mảng lớn nhất (nối 8 hướng).
DO_VO_JS = """window.__doVo = (f) => { const W = f.w, H = f.h, p = f.px, N = W * H, ngoai = new Uint8Array(N), st = [];
  const vao = (i) => { if (!p[i] && !ngoai[i]) { ngoai[i] = 1; st.push(i); } };
  for (let x = 0; x < W; x++) { vao(x); vao((H - 1) * W + x); } for (let y = 0; y < H; y++) { vao(y * W); vao(y * W + W - 1); }
  while (st.length) { const i = st.pop(), x = i % W, y = (i / W) | 0; if (x > 0) vao(i - 1); if (x < W - 1) vao(i + 1); if (y > 0) vao(i - W); if (y < H - 1) vao(i + W); }
  let lo = 0; for (let i = 0; i < N; i++) if (!p[i] && !ngoai[i]) lo++;
  const nh = new Int32Array(N).fill(-1); let lon = 0, tong = 0;
  for (let s = 0; s < N; s++) { if (!p[s] || nh[s] >= 0) continue; let n = 0; const q = [s]; nh[s] = 1;
    while (q.length) { const i = q.pop(); n++; const x = i % W, y = (i / W) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (p[j] && nh[j] < 0) { nh[j] = 1; q.push(j); } } }
    tong += n; lon = Math.max(lon, n); }
  return { lo, roi: tong - lon }; };"""

# Dựng mọi khung của mọi động tác cho hình đang làm với một bản đồ bộ phận (bo: 'doan' | 'khop' | 'hien tai') và một mẫu.
VO_JS = """([mau, cachChia, tuy]) => { const S = XS_S, R = S.R, khop0 = XS.datKhop(R, mau);
  let bo, khop;
  if (cachChia === 'doan') { bo = XS.tuDoan(R, mau); khop = bo.khop; } else if (cachChia === 'khop') { khop = khop0; bo = XS.chiaTheoKhop(R, mau, khop0); } else { bo = S.kh.bo; khop = S.kh.khop; }
  const vien = XS.hex('#1b1118'), cfg = { mau, khop, bo, vien, doi: S.muc.doi, dong_tac: {} };
  const t = tuy === 'md' ? XS.chuyenMacDinh(mau) : null;
  const goc = __doVo(XS.dungKhung(R, cfg, XS.tuThe(mau, 'idle', 0, 0, null), { vien }));
  let lo = 0, roi = 0, so = 0; const xau = [];
  for (const ten of XS.dsDongTac(S.muc.doi === 'em-be' ? 'em-be' : 'quai')) for (let i = 0; i < 10; i++) {
    const u = XS.DONG_TAC[ten].lap ? i / 10 : i / 9;
    for (const A of [1, 1.6]) { const d = __doVo(XS.dungKhung(R, cfg, XS.tuThe(mau, ten, u, A, t), { vien })); so++;
      const l = Math.max(0, d.lo - goc.lo), r = Math.max(0, d.roi - goc.roi); lo += l; roi += r; if ((l || r) && xau.length < 4) xau.push(ten + ' ' + i + ' x' + A + ': lỗ ' + l + ', rời ' + r); }
  }
  return { lo, roi, so, xau }; }"""

# Vị trí trung bình từng bộ phận sau Tự đoán (theo tỉ lệ khung hình 0..1) và bộ phận chắc chắn.
DOAN_JS = """(mau) => { const R = XS_S.R, bo = XS.tuDoan(R, mau), M = XS.MAU[mau], bb = XS.khungHinh(R), s = {};
  for (let i = 0; i < bo.length; i++) { if (!R.px[i] || bo[i] === 255) continue; const id = M.bo[bo[i]].id, x = i % R.w, y = (i / R.w) | 0; const a = s[id] || (s[id] = [0, 0, 0]); a[0] += (x - bb.x0 + 0.5) / bb.w; a[1] += (y - bb.y0 + 0.5) / bb.h; a[2]++; }
  const tong = Object.values(s).reduce((a, v) => a + v[2], 0); const out = {};
  for (const id in s) out[id] = { x: +(s[id][0] / s[id][2]).toFixed(3), y: +(s[id][1] / s[id][2]).toFixed(3), n: +(s[id][2] / tong).toFixed(3) };
  let thieu = 0; for (let i = 0; i < bo.length; i++) if (R.px[i] && bo[i] === 255) thieu++;
  return { bo: out, chac: bo.chac, goiY: bo.goiY.map((g) => g.id), thieu }; }"""


def dua_anh(pg, ma, duong):
    pg.evaluate('ma => { if (XS_S.buoc !== 1) XS_UI.denBuoc(1); XS_UI.moNhom(XS_UI.nhomCuaMa(ma)); }', ma)
    pg.click('.the[data-ma="%s"]' % ma)
    pg.set_input_files('#chonAnh', duong)
    pg.wait_for_function('XS_S.R && XS_S.muc.ma === "%s"' % ma)
    pg.wait_for_timeout(150)


def kiem_tu_doan(ok, ten, mau, r):
    b, c = r['bo'], r['chac']
    t = b.get('than')
    ok('Tự đoán %s: mọi điểm ảnh có bộ phận' % ten, r['thieu'] == 0 and t, r['thieu'])
    if mau == 'nguoi':
        d = b.get('dau')
        ok('Tự đoán %s: đầu ở trên thân, chiếm phần trên hình' % ten, d and d['y'] < t['y'] - 0.15 and d['y'] < 0.4, (d, t))
        hai = c.get('tayT') and c.get('tayS')
        for id_, ben in (('tayT', 1), ('tayS', -1)):
            if c.get(id_):
                a = b[id_]
                if hai:
                    ok('Tự đoán %s: %s ở %s thân' % (ten, 'tay trước' if ben > 0 else 'tay sau', 'bên phải' if ben > 0 else 'bên trái'), (a['x'] - t['x']) * ben > 0.12 and 0.3 < a['y'] < 0.95 and a['n'] < 0.2, (a, t))
                else:  # chỉ chắc một tay: nó làm tay trước, ở một bên thân
                    ok('Tự đoán %s: tay tìm được ở một bên thân' % ten, abs(a['x'] - t['x']) > 0.12 and 0.3 < a['y'] < 0.95 and a['n'] < 0.2, (a, t))
        for id_ in ('chanT', 'chanS'):
            if c.get(id_):
                a = b[id_]
                ok('Tự đoán %s: %s ở dưới cùng' % (ten, 'chân trước' if id_ == 'chanT' else 'chân sau'), a['y'] > 0.75 and a['y'] > t['y'], (a, t))
        if c.get('chanT') and c.get('chanS'):
            ok('Tự đoán %s: chân trước bên phải chân sau' % ten, b['chanT']['x'] > b['chanS']['x'])
    elif mau == 'bonChan':
        d = b.get('dau')
        ok('Tự đoán %s: đầu ở phía trước (phải)' % ten, c.get('dau') and d['x'] > t['x'] + 0.15, (d, t))
        if c.get('duoi'):
            ok('Tự đoán %s: đuôi ở phía sau (trái)' % ten, b['duoi']['x'] < t['x'] - 0.2, b['duoi'])
        chan = [k for k in ('chanTN', 'chanTX', 'chanSN', 'chanSX') if c.get(k)]
        ok('Tự đoán %s: có ít nhất 3 chân, chân ở dưới thân' % ten, len(chan) >= 3 and all(b[k]['y'] > t['y'] + 0.15 for k in chan), chan)
        ok('Tự đoán %s: chân trước ở phía trước chân sau' % ten, all(b[k]['x'] > b[s]['x'] for k in ('chanTN', 'chanTX') if c.get(k) for s in ('chanSN', 'chanSX') if c.get(s)))
    elif mau == 'bay':
        ok('Tự đoán %s: đuôi ở sau, đầu ở trước' % ten, c.get('duoi') and c.get('dau') and b['duoi']['x'] < t['x'] < b['dau']['x'], b)
        ok('Tự đoán %s: cánh gần (vây lưng) nhô lên trên thân' % ten, c.get('canhN') and b['canhN']['y'] < t['y'] - 0.15, b.get('canhN'))
    elif mau == 'mem':
        ok('Tự đoán %s: phần trên ở trên phần dưới' % ten, b.get('dinh') and b['dinh']['y'] < t['y'], b)
    khong = [k for k, v in c.items() if not v]
    ok('Tự đoán %s: bộ phận không chắc thì không cắt và có gợi ý tô (%s)' % (ten, ', '.join(khong) or 'không có'),
       sorted(khong) == sorted(r['goiY']) and all(k not in b for k in khong), (khong, r['goiY'], list(b)))


def kiem_sua_vo(pw, tmp, ok, mo, TOOL):
    anh = {k: f(os.path.join(tmp, 'ai-' + k + '.png')) for k, f in ANH_AI.items()}
    anh['ve-nguoi'] = ve_nguoi(os.path.join(tmp, 've-nguoi.png'))
    anh['ve-bon-chan'] = ve_bon_chan(os.path.join(tmp, 've-bon-chan.png'))
    mau_ai = dict(MAU_AI)
    mau_ai['ve-nguoi'] = ('nguoi', 'em-be')
    mau_ai['ve-bon-chan'] = ('bonChan', 'heoCon')
    b, ctx, pg, errs = mo(pw, TOOL)
    pg.wait_for_function('window.XS_UI')
    pg.evaluate('() => { ' + DO_VO_JS + ' }')
    # ---- 1. Tự đoán ----
    for k, duong in anh.items():
        mau, ma = mau_ai[k]
        dua_anh(pg, ma, duong)
        kiem_tu_doan(ok, k, mau, pg.evaluate(DOAN_JS, mau))
    # em bé áo đỏ (giống ảnh thật): phải tìm ra đủ đầu, hai tay áp sát thân, hai chân sát nhau
    dua_anh(pg, 'em-be', anh['em-be-ao-do'])
    r = pg.evaluate(DOAN_JS, 'nguoi')
    ok('Em bé áo đỏ nhìn chính diện: tìm đủ đầu, hai tay áp sát thân, hai chân', all(r['chac'].get(x) for x in ('dau', 'tayT', 'tayS', 'chanT', 'chanS')), r['chac'])
    # ---- 2. không vỡ hình ----
    tot, chi = True, []
    for k, duong in anh.items():
        mau, ma = mau_ai[k]
        dua_anh(pg, ma, duong)
        for cach in ('doan', 'khop'):
            for tuy in (None, 'md'):
                v = pg.evaluate(VO_JS, [mau, cach, tuy])
                if v['lo'] or v['roi']:
                    tot = False; chi.append((k, cach, tuy, v['xau']))
    ok('Không vỡ hình: mọi ảnh thử, mọi động tác, cả khi bộ phận chia sai: không lỗ, không mảnh rời', tot, chi[:4])
    dua_anh(pg, 'em-be', anh['em-be-ao-do'])
    tot, chi, so = True, [], 0
    for mau in pg.evaluate('XS.MAU_THU_TU'):
        for cach in ('doan', 'khop'):
            v = pg.evaluate(VO_JS, [mau, cach, None]); so += v['so']
            if v['lo'] or v['roi']:
                tot = False; chi.append((mau, cach, v['xau']))
    ok('Không vỡ hình: em bé áo đỏ với cả 7 mẫu khung (%d khung hình)' % so, tot, chi[:4])
    # lớp vá: tay xoay ra thì chỗ cũ của tay được lấp bằng màu thân, không lộ nền
    v = pg.evaluate("""() => { const R = XS_S.R, bo = XS.tuDoan(R, 'nguoi'), CB = XS.chuanBiCuDong(R, { mau: 'nguoi', khop: bo.khop, bo });
      const k = XS.MAU.nguoi.bo.findIndex((b) => b.id === 'tayT'); return { va: CB.vas.filter((v) => v.k === k).reduce((a, v) => a + v.ds.length / 2, 0), heSo: CB.heSo[k] }; }""")
    ok('Tay áp sát thân: có lớp vá màu thân dưới tay, góc xoay giảm bớt', v['va'] >= 3 and v['heSo'] < 1, v)
    # ---- 3. tô tay ----
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(200)
    pg.click('[data-mau="nguoi"]'); pg.wait_for_timeout(200)
    ok('Chọn mẫu Người thì tự đoán và đặt khớp theo hình (vai ở chỗ tay thật)', pg.evaluate("XS_S.kh.khop.vaiT[0] > XS_S.kh.khop.co[0] + 2 && XS_S.kh.khop.vaiS[0] < XS_S.kh.khop.co[0] - 2"), pg.evaluate('XS_S.kh.khop'))
    pg.click('[data-che="to"]'); pg.wait_for_timeout(100)
    ok('Tô bộ phận: có cỡ bút Nhỏ, Vừa, To, cục tẩy, phóng to, hoàn tác', all(pg.is_visible(s) for s in ('[data-co="1"]', '[data-co="2"]', '[data-co="4"]', '#nutTayBo', '#nutPhong3', '#nutThu3', '#nutHoanTac3')))
    pg.click('[data-co="4"]')
    ok('Bút To: cỡ bút 4', pg.evaluate('XS_S.xem.coTo') == 4)
    bo0 = pg.evaluate('Array.from(XS_S.kh.bo)')
    pg.click('#dsBoPhan [data-bo="2"]')  # tay trước
    box = pg.locator('#cv3').bounding_box()
    cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
    pg.mouse.move(cx, cy); pg.mouse.down(); pg.mouse.move(cx + 10, cy + 5, steps=3); pg.mouse.up()
    bo1 = pg.evaluate('Array.from(XS_S.kh.bo)')
    ok('Bút to tô được nhiều điểm một lần', sum(1 for a, c in zip(bo0, bo1) if a != c) >= 8)
    pg.click('#nutHoanTac3'); pg.wait_for_timeout(100)
    ok('Hoàn tác trả lại chỗ vừa tô', pg.evaluate('Array.from(XS_S.kh.bo)') == bo0)
    pg.click('#nutTayBo')
    ok('Cục tẩy: tô về thân (bộ phận đứng chung với cả người)', pg.evaluate("XS_S.xem.boChon === XS.MAU.nguoi.bo.findIndex((b) => b.id === 'than')"))
    z0 = pg.evaluate('XS_S.xem.zoom3 || 1')
    pg.click('#nutPhong3'); pg.click('#nutPhong3')
    ok('Phóng to hình khi tô', pg.evaluate('XS_S.xem.zoom3') > z0)
    pg.click('#nutThu3'); pg.click('#nutThu3')
    ok('Thu nhỏ lại', pg.evaluate('XS_S.xem.zoom3') == z0)
    # chỗ không chắc: hiện chữ gợi ý (ảnh khối mềm không có tua)
    dua_anh(pg, 'sua', anh['khoi-mem'])
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(200)
    pg.click('[data-mau="mem"]'); pg.wait_for_timeout(200)
    ok('Bộ phận không chắc: hiện chữ "Tô thêm cho đúng"', 'Tô thêm cho đúng' in pg.inner_text('#b3'), pg.inner_text('#ghiDoan'))
    ok('Không có lỗi trang khi tự đoán, tô, dựng khung', not errs, errs[:3])
    # tấm sprite em bé áo đỏ để đưa vào game
    dua_anh(pg, 'em-be', anh['em-be-ao-do'])
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(150)
    pg.click('[data-mau="nguoi"]'); pg.wait_for_timeout(150)
    pg.evaluate('XS_UI.denBuoc(5)'); pg.wait_for_timeout(300)
    em_be = pg.evaluate('XS_UI.taoTep(true, true)')
    dua_anh(pg, 'heoCon', anh['quai-bon-chan'])
    pg.evaluate('XS_UI.denBuoc(3)'); pg.wait_for_timeout(150)
    pg.click('[data-mau="bonChan"]'); pg.wait_for_timeout(150)
    pg.evaluate('XS_UI.denBuoc(5)'); pg.wait_for_timeout(300)
    heo = pg.evaluate('XS_UI.taoTep(true, true)')
    b.close()
    return em_be, heo


# Trong game: vẽ em bé, quái ở mọi trạng thái, đo lỗ và mảnh rời trên canvas.
GAME_VO_JS = """() => { const do_ = (c, W, H) => { const d = c.getImageData(0, 0, W, H).data, px = new Uint32Array(W * H); for (let i = 0; i < W * H; i++) px[i] = d[i * 4 + 3] > 20 ? 1 : 0; return __doVo({ w: W, h: H, px }); };
  const W = 160, H = 130, kq = { lo: 0, roi: 0, so: 0, xau: [] }, them = (ten, c) => { const r = do_(c, W, H); kq.so++; kq.lo += r.lo; kq.roi += r.roi; if ((r.lo || r.roi) && kq.xau.length < 4) kq.xau.push(ten + ': ' + JSON.stringify(r)); };
  const moi = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv.getContext('2d'); };
  for (let k = 0; k < 16; k++) for (const st of [{}, { move: true }, { atk: 0.2 + k * 0.04 }, { dodge: k / 16 }]) {
    const c = moi(); G.art.hero(c, Object.assign({ x: 80, y: 100, face: 1, key: 'smith', t: k * 0.083, atk: -1, dodge: -1, noShadow: true }, st)); them('em bé ' + JSON.stringify(st) + ' ' + k, c); }
  const sp = G.spriteCustom.get('heoCon');
  for (const ten in sp.dt) { const d = sp.dt[ten]; for (let i = 0; i < d.so; i++) { const c = moi(); c.translate(80, 100); G.spriteCustom.veKhung(c, sp, ten, i, 1, {}); them('heo ' + ten + ' ' + i, c); } }
  return kq; }"""


def kiem_game_vo(pw, ok, mo, GAME_DIST, CUSTOM, build, don_custom, em_be, heo):
    for t in (em_be, heo):
        t = dict(t); t.pop('cong_cu', None)
        with open(os.path.join(CUSTOM, t['ma'] + '.sprite.json'), 'w', encoding='utf-8') as f:
            json.dump(t, f)
    good, out = build()
    ok('Đóng gói nhúng em bé và heo làm từ ảnh AI vẽ', good and 'em-be' in out and 'heoCon' in out, out[-200:])
    b, ctx, pg, errs = mo(pw, GAME_DIST, 960, 540)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_function("G.spriteCustom.get('em-be') && G.spriteCustom.get('heoCon') && G.spriteCustom.get('heoCon').img && G.spriteCustom.get('heoCon').img.complete")
    pg.evaluate('() => { ' + DO_VO_JS + ' }')
    r = pg.evaluate(GAME_VO_JS)
    ok('Trong game: em bé và heo tự vẽ không lỗ, không mảnh rời ở mọi trạng thái (%d hình)' % r['so'], r['lo'] == 0 and r['roi'] == 0 and r['so'] > 60, r)
    ok('Không có lỗi trang trong game', not errs, errs[:3])
    b.close()
    don_custom()
