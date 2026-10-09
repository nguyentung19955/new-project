"""Kiểm tra thêm cho sửa vỡ hình và Tự đoán (Xưởng Sprite), gọi từ xuong_sprite.py (phần 9, bổ sung phần 8).

- Vỡ hình: dựng mọi khung của mọi động tác (cả người cử động, trường hợp nặng nhất), đếm
  lỗ kín mới (điểm trong suốt lọt vào bên trong hình, không phải lỗ có sẵn trong ảnh gốc),
  khe ở khớp (điểm trống kẹp giữa bộ phận con và bộ phận nó gắn vào), điểm rời khỏi thân. Cả ba phải bằng 0,
  ở mọi mẫu khung. Trong game (tấm sprite đã nhúng) cũng đếm lỗ và mảnh rời.
- Tự đoán: với ảnh kiểu AI vẽ (em bé nhìn chính diện, quái bốn chân, cá bay, khối mềm) và ảnh vẽ tay,
  đầu ở trên, tay hai bên, chân dưới, đuôi phía sau, cánh trên lưng; không cắt áo vào chân.
- Tô tay: bút to nhỏ, phóng to, hoàn tác, cục tẩy, chạm trên điện thoại, lời nhắc "Tô thêm cho đúng".
"""
import json
import os

from xuong_sprite_ve import ve_em_be_ao_do, ve_bon_chan
from xuong_sprite_ve_ai import ve_ai_em_be, ve_ai_bon_chan, ve_ai_ca_bay, ve_ai_khoi_mem

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, 'xuong_sprite_vo.js'), encoding='utf-8') as _f:
    DO_VO_FN = _f.read().strip()
DO_VO = '(' + DO_VO_FN + ')'

# Tâm (x, y) và số điểm của từng bộ phận sau Tự đoán, cùng khung bao hình.
TAM_BO = """() => { const S = XS_S, R = S.R, M = XS.MAU[S.kh.mau], o = {}, bb = XS.khungHinh(R);
  M.bo.forEach((b, k) => { let x = 0, y = 0, n = 0; for (let i = 0; i < R.w * R.h; i++) if (R.px[i] && S.kh.bo[i] === k) { x += i % R.w + 0.5; y += ((i / R.w) | 0) + 0.5; n++; }
    o[b.id] = n ? [x / n, y / n, n] : null; });
  return { bo: o, bb: [bb.x0, bb.y0, bb.w, bb.h], thieu: (S.doan || {}).thieu || [], cach: (S.doan || {}).cach }; }"""

# Lỗ kín (điểm trống không loang ra được mép) của một mảng 0/1.
LO_JS = """((px, W, H) => { const ng = new Uint8Array(W * H), q = []; const v = (i) => { if (!px[i] && !ng[i]) { ng[i] = 1; q.push(i); } };
  for (let x = 0; x < W; x++) { v(x); v((H - 1) * W + x); } for (let y = 0; y < H; y++) { v(y * W); v(y * W + W - 1); }
  while (q.length) { const i = q.pop(), x = i % W; if (x > 0) v(i - 1); if (x < W - 1) v(i + 1); if (i >= W) v(i - W); if (i < W * (H - 1)) v(i + W); }
  let n = 0; for (let i = 0; i < W * H; i++) if (!px[i] && !ng[i]) n++; return n; })"""

# Trong game: đếm trên từng khung của tấm sprite đã nhúng (lỗ kín so với khung đứng yên đầu, mảnh rời).
VO_GAME = """(ds) => { const o = {}, LO = LO_JS;
  for (const ma of ds) { const sp = G.spriteCustom.get(ma), cv = document.createElement('canvas'); cv.width = sp.img.width; cv.height = sp.img.height;
    const c = cv.getContext('2d'); c.drawImage(sp.img, 0, 0); const d = c.getImageData(0, 0, cv.width, cv.height).data;
    const khung = (hang, i) => { const px = new Uint8Array(sp.fw * sp.fh); for (let y = 0; y < sp.fh; y++) for (let x = 0; x < sp.fw; x++) { const k = ((hang * sp.fh + y) * cv.width + i * sp.fw + x) * 4; if (d[k + 3] > 20) px[y * sp.fw + x] = 1; } return px; };
    const roi = (px, W, H) => { const da = new Uint8Array(W * H), co = []; for (let s = 0; s < W * H; s++) { if (!px[s] || da[s]) continue; let n = 0; const q = [s]; da[s] = 1;
      while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; n++; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (px[j] && !da[j]) { da[j] = 1; q.push(j); } } }
      co.push(n); } return co.reduce((a, v) => a + v, 0) - Math.max(0, ...co); };
    const lo0 = LO(khung(sp.dt.idle.hang, 0), sp.fw, sp.fh);
    let lo = 0, rr = 0, n = 0;
    for (const ten in sp.dt) { const a = sp.dt[ten]; for (let i = 0; i < a.so; i++) { const p = khung(a.hang, i); lo = Math.max(lo, LO(p, sp.fw, sp.fh) - lo0); rr = Math.max(rr, roi(p, sp.fw, sp.fh)); n++; } }
    o[ma] = { lo, roi: rr, khung: n }; }
  return o; }""".replace('LO_JS', LO_JS)

# So với khung đứng yên CÓ VIỀN (hình người chơi thấy): mảnh rời mới (điểm không dính mảng lớn nhất) và khe 1 điểm mới
# (trống mà hai bên trái phải hoặc trên dưới đều có hình). Bắt lỗi bộ phận vốn chỉ dính thân nhờ nét viền (đuôi, tai bị
# thu nhỏ tách 1, 2 điểm) mà cử động là bay rời.
VO_VIEN = """() => { const S = XS_S, R = S.R, kh = S.kh, bb = XS.khungHinh(R);
  const cfg = { mau: kh.mau, khop: kh.khop, bo: kh.bo, vien: XS.hex('#1b1118'), doi: S.muc.doi, dong_tac: {} }, tt = { dung_yen: [], nhun: 100 };
  const doKhung = (px, w, h) => { const ng = new Uint8Array(w * h), q = []; const v = (i) => { if (!px[i] && !ng[i]) { ng[i] = 1; q.push(i); } };
    for (let x = 0; x < w; x++) { v(x); v((h - 1) * w + x); } for (let y = 0; y < h; y++) { v(y * w); v(y * w + w - 1); }
    while (q.length) { const i = q.pop(), x = i % w; if (x > 0) v(i - 1); if (x < w - 1) v(i + 1); if (i >= w) v(i - w); if (i < w * (h - 1)) v(i + w); }
    let khe = 0, n = 0; for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (px[i]) continue; if (ng[i] && ((px[i - 1] && px[i + 1]) || (px[i - w] && px[i + w]))) khe++; }
    const da = new Uint8Array(w * h); let lon = 0; for (let s = 0; s < w * h; s++) { if (!px[s]) continue; n++; if (da[s]) continue; let c = 0; const st = [s]; da[s] = 1;
      while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; c++; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = yy * w + xx; if (px[j] && !da[j]) { da[j] = 1; st.push(j); } } }
      lon = Math.max(lon, c); }
    return { khe, manh: n - lon }; };
  const g = XS.dungKhung(R, cfg, XS.tuThe(kh.mau, 'idle', 0, 0), { vien: cfg.vien, bb }), g0 = doKhung(g.px, g.w, g.h), xau = { khe: 0, manh: 0 };
  for (const ten of XS.dsDongTac(S.muc.doi)) for (let i = 0; i < 10; i++) {
    const u = XS.DONG_TAC[ten].lap ? i / 10 : i / 9, f = XS.dungKhung(R, cfg, XS.tuThe(kh.mau, ten, u, 1, tt), { vien: cfg.vien, bb }), m = doKhung(f.px, f.w, f.h);
    xau.khe = Math.max(xau.khe, m.khe - g0.khe); xau.manh = Math.max(xau.manh, m.manh - g0.manh); }
  return xau; }"""


def mo_anh(pg, ma, anh):
    pg.evaluate('ma => { XS_UI.denBuoc(1); if (XS_UI.moNhom) XS_UI.moNhom(XS_UI.nhomCuaMa(ma)); }', ma)  # trang chọn chia nhóm
    pg.click('.the[data-ma="' + ma + '"]')
    pg.set_input_files('#chonAnh', anh)
    pg.wait_for_function('XS_S.R && XS_S.muc.ma === "' + ma + '"')
    pg.evaluate('XS_UI.denBuoc(3)')
    pg.wait_for_timeout(150)


def vo_sach(d):
    """Mọi động tác: không lỗ mới, không khe ở khớp, không mảnh rời."""
    return all(not any(v.values()) for k, v in d.items() if k != '_nghi')


def tao_anh(tmp):
    return {
        'ai-em-be': ve_ai_em_be(os.path.join(tmp, 'ai-em-be.png')),
        'ai-bon-chan': ve_ai_bon_chan(os.path.join(tmp, 'ai-bon-chan.png')),
        'ai-ca-bay': ve_ai_ca_bay(os.path.join(tmp, 'ai-ca-bay.png')),
        'ai-khoi-mem': ve_ai_khoi_mem(os.path.join(tmp, 'ai-khoi-mem.png')),
        'em-be-ao-do': ve_em_be_ao_do(os.path.join(tmp, 'em-be-ao-do-2.png')),
        'bon-chan': ve_bon_chan(os.path.join(tmp, 'bon-chan-2.png')),
    }


def kiem_vo_khop_dien_thoai(pw, tmp, ok, mo, TOOL, GAME_DIST, CUSTOM, build, don_custom):
    anh = tao_anh(tmp)
    b, ctx, pg, errs = mo(pw, TOOL)
    pg.wait_for_function('window.XS_UI')

    # ---------- Tự đoán ----------
    mo_anh(pg, 'em-be', anh['ai-em-be'])
    t = pg.evaluate(TAM_BO)
    B, bb = t['bo'], t['bb']
    print('     em bé AI:', json.dumps(t))
    ok('Phần 9: Tự đoán em bé AI (chính diện): đủ đầu, thân, hai tay, hai chân', all(B[k] for k in ('dau', 'than', 'tayT', 'tayS', 'chanT', 'chanS')) and not t['thieu'], t['thieu'])
    ok('Tự đoán em bé AI: đầu ở trên thân, đầu nằm trong nửa trên hình', B['dau'][1] < B['than'][1] and B['dau'][1] < bb[1] + bb[3] * 0.5)
    ok('Tự đoán em bé AI: tay trước bên phải, tay sau bên trái, ngang thân', B['tayT'][0] > B['than'][0] > B['tayS'][0] and abs(B['tayT'][1] - B['than'][1]) < bb[3] * 0.3)
    ok('Tự đoán em bé AI: chân ở dưới cùng, không cắt vào áo', min(B['chanT'][1], B['chanS'][1]) > bb[1] + bb[3] * 0.75 and B['chanT'][2] + B['chanS'][2] < B['than'][2] * 0.5)
    ok('Tự đoán em bé AI: đặt khớp theo kết quả (vai ở hai bên, cổ dưới đầu, hông chân ở dưới)', pg.evaluate("""() => { const k = XS_S.kh.khop, R = XS_S.R;
        return k.co[1] > 2 && k.co[1] < R.h * 0.7 && k.vaiT[0] > R.w / 2 && k.vaiS[0] < R.w / 2 && k.hongT[1] > R.h * 0.7; }"""))
    mo_anh(pg, 'em-be-smith', anh['em-be-ao-do'])
    t = pg.evaluate(TAM_BO)
    B = t['bo']
    ok('Tự đoán em bé vẽ tay (nhìn ngang): đầu trên, tay hai bên, chân dưới', bool(B['dau'] and B['tayT'] and B['tayS'] and B['chanT']) and B['dau'][1] < B['than'][1] < B['chanT'][1] and B['tayT'][0] > B['tayS'][0], t)
    mo_anh(pg, 'heoCon', anh['ai-bon-chan'])
    t = pg.evaluate(TAM_BO)
    B = t['bo']
    print('     bốn chân AI:', json.dumps(t))
    chan4 = [B[k] for k in ('chanTN', 'chanTX', 'chanSN', 'chanSX')]
    ok('Tự đoán quái bốn chân AI: đủ bốn chân, đầu, đuôi', all(chan4) and bool(B['dau'] and B['duoi']), t['thieu'])
    ok('Tự đoán bốn chân AI: chân dưới thân, chân trước ở phía trước, đầu phía trước, đuôi phía sau',
       all(chan4) and all(c[1] > B['than'][1] for c in chan4) and B['chanTN'][0] > B['chanSN'][0] and B['dau'][0] > B['than'][0] > B['duoi'][0])
    mo_anh(pg, 'heoNanh', anh['bon-chan'])
    t = pg.evaluate(TAM_BO)
    ok('Tự đoán bốn chân vẽ tay: đủ 7 bộ phận', all(t['bo'].values()), t['thieu'])
    mo_anh(pg, 'caChuon', anh['ai-ca-bay'])
    t = pg.evaluate(TAM_BO)
    B = t['bo']
    print('     cá bay AI:', json.dumps(t))
    ok('Tự đoán cá bay AI: cánh trên lưng, đuôi phía sau', bool(B['canhN'] and B['duoi']) and B['canhN'][1] < B['than'][1] and B['duoi'][0] < B['than'][0])
    ghi = pg.inner_text('#ghiDoan')
    ok('Chỗ chưa đoán chắc thì để dính thân và hiện "Tô thêm cho đúng"', (not t['thieu']) or ('Tô thêm cho đúng' in ghi and all(not B[k] for k in t['thieu'])), (t['thieu'], ghi))
    mo_anh(pg, 'sua', anh['ai-khoi-mem'])
    t = pg.evaluate(TAM_BO)
    B = t['bo']
    ok('Tự đoán khối mềm AI: tua trái phải, phần trên ở trên', bool(B['tuaT'] and B['tuaS'] and B['dinh']) and B['tuaT'][0] > B['than'][0] > B['tuaS'][0] and B['dinh'][1] < B['than'][1])

    # ---------- vỡ hình ----------
    tat = True
    for ma, k in (('em-be', 'ai-em-be'), ('heoCon', 'ai-bon-chan'), ('caChuon', 'ai-ca-bay'), ('sua', 'ai-khoi-mem'), ('em-be-smith', 'em-be-ao-do'), ('heoNanh', 'bon-chan')):
        mo_anh(pg, ma, anh[k])
        d = pg.evaluate(DO_VO)
        if not vo_sach(d):
            tat = False
            print('     ', ma, d)
    ok('Không vỡ hình: mọi động tác của 6 ảnh thử không có lỗ, khe ở khớp, mảnh rời', tat)
    tat = {}
    for ma, k in (('heoNanh', 'bon-chan'), ('em-be', 'ai-em-be'), ('heoCon', 'ai-bon-chan'), ('caChuon', 'ai-ca-bay'), ('sua', 'ai-khoi-mem'), ('em-be-smith', 'em-be-ao-do')):
        mo_anh(pg, ma, anh[k])
        tat[ma] = pg.evaluate(VO_VIEN)
        if ma == 'heoNanh':
            cau = pg.evaluate('() => { const c = XS.cauNoi(XS_S.R, XS_S.kh); if (!c) return 0; let n = 0; for (let i = 0; i < c.R.px.length; i++) if (c.R.px[i] && !XS_S.R.px[i]) n++; return n; }')
    ok('Có viền: bộ phận chỉ dính thân nhờ nét viền (đuôi mèo vẽ tay) không bay rời; không có khe 1 điểm mới', all(v['manh'] <= 0 and v['khe'] <= 0 for v in tat.values()), tat)
    ok('Cầu nối: đuôi mèo vẽ tay (tách thân vài điểm ảnh khi thu nhỏ) được nối bằng vài điểm nét', 0 < cau <= 12, cau)
    mo_anh(pg, 'em-be', anh['ai-em-be'])
    tat = True
    for mau in ('nguoi', 'bonChan', 'cua', 'bay', 'mem', 'ran', 'cay'):
        pg.evaluate('XS_UI.chonMau("' + mau + '")')
        d = pg.evaluate(DO_VO)
        if not vo_sach(d):
            tat = False
            print('     ', mau, d)
    ok('Không vỡ hình ở cả 7 mẫu khung (em bé AI)', tat)
    pg.evaluate('XS_UI.chonMau("nguoi")')
    ok('Không vỡ hình cả khi chia theo khớp (cách cũ)', vo_sach(pg.evaluate('() => { XS_S.kh.bo = XS.tuDoan(XS_S.R, XS_S.kh.mau, XS_S.kh.khop); return ' + DO_VO + '(); }')))
    g = pg.evaluate("""() => { const va = XS.chuanBiVa(XS_S.R, XS_S.kh), M = XS.MAU[XS_S.kh.mau], o = {}; M.bo.forEach((b, k) => { o[b.id] = va.gioiHan[k]; }); return o; }""")
    ok('Bộ phận dính sát thân xoay ít hơn (giới hạn góc theo mép cắt)', min(g.values()) < 60, g)
    pg.evaluate('XS_UI.chonMau("nguoi")')
    d = pg.evaluate('() => { const S = XS_S; S.chuyen = XS.chuyenMacDinh("nguoi"); S.tamCu = true; const T = XS_UI.lamTam(true); return [T.dong_tac.idle.so, T.w, T.h]; }')
    ok('Tấm sprite dựng được với Tự đoán mới', d[0] >= 4 and d[1] > 0, d)

    # ---------- tô tay ----------
    mo_anh(pg, 'em-be', anh['ai-em-be'])
    ok('Có bút to nhỏ (1 đến 10), phóng to, hoàn tác, cục tẩy, kéo hình', pg.get_attribute('#coTo', 'max') == '10' and pg.is_visible('[data-phong="3"]') and pg.is_visible('#nutHoanTac3') and pg.is_visible('[data-che="tay"]') and pg.is_visible('[data-che="keo"]'))
    pg.click('[data-che="to"]')
    pg.click('#dsBoPhan [data-bo="2"]')
    pg.click('[data-phong="3"]')
    pg.fill('#coTo', '6')
    pg.dispatch_event('#coTo', 'input')
    n0 = pg.evaluate('XS_S.kh.bo.filter((v) => v === 2).length')
    box = pg.locator('#cv3').bounding_box()
    pg.mouse.move(box['x'] + box['width'] * 0.5, box['y'] + box['height'] * 0.5)
    pg.mouse.down()
    pg.mouse.move(box['x'] + box['width'] * 0.55, box['y'] + box['height'] * 0.5, steps=4)
    pg.mouse.up()
    n1 = pg.evaluate('XS_S.kh.bo.filter((v) => v === 2).length')
    ok('Bút to (cỡ 6, phóng ×3) tô được nhiều điểm', n1 - n0 >= 10, (n0, n1))
    pg.click('#nutHoanTac3')
    ok('Hoàn tác trả lại nét tô', pg.evaluate('XS_S.kh.bo.filter((v) => v === 2).length') == n0)
    nt = pg.evaluate('XS_S.kh.bo.filter((v) => v === 0).length')
    pg.click('[data-che="tay"]')
    pg.mouse.move(box['x'] + box['width'] * 0.5, box['y'] + box['height'] * 0.75)
    pg.mouse.down()
    pg.mouse.move(box['x'] + box['width'] * 0.52, box['y'] + box['height'] * 0.78, steps=3)
    pg.mouse.up()
    ok('Cục tẩy trả chỗ tô về thân', pg.evaluate('XS_S.kh.bo.filter((v) => v === 0).length') > nt)
    ok('Không có lỗi trang khi Tự đoán, tô tay, đo vỡ hình', not errs, errs[:3])
    b.close()
    # điện thoại cầm ngang: chạm để tô
    b, ctx, pg, errs = mo(pw, TOOL, 844, 390, has_touch=True, is_mobile=True)
    pg.wait_for_function('window.XS_UI')
    mo_anh(pg, 'em-be', anh['ai-em-be'])
    pg.tap('[data-che="to"]')
    pg.tap('#dsBoPhan [data-bo="3"]')
    pg.tap('[data-phong="2"]')
    n0 = pg.evaluate('XS_S.kh.bo.filter((v) => v === 3).length')
    box = pg.locator('#cv3').bounding_box()
    pg.touchscreen.tap(box['x'] + box['width'] * 0.5, box['y'] + box['height'] * 0.55)
    ok('Điện thoại: chạm để tô bộ phận', pg.evaluate('XS_S.kh.bo.filter((v) => v === 3).length') > n0)
    hh = pg.evaluate("() => Math.min(...[...document.querySelectorAll('#b3 .chip')].filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect().height))")
    ok('Điện thoại: nút ở bước Khung đủ to để chạm (cao từ 36 điểm)', hh >= 36, hh)
    # ---------- xuất tệp cho game ----------
    teps = []
    for ma, k in (('em-be', 'ai-em-be'), ('sua', 'ai-khoi-mem')):
        mo_anh(pg, ma, anh[k])
        pg.evaluate('XS_UI.denBuoc(5)')
        pg.wait_for_timeout(200)
        teps.append(pg.evaluate('XS_UI.tepChoGame()'))
    ok('Không có lỗi trang trên điện thoại', not errs, errs[:3])
    b.close()
    # ---------- trong game ----------
    for t in teps:
        with open(os.path.join(CUSTOM, t['ma'] + '.sprite.json'), 'w', encoding='utf-8') as f:
            json.dump(t, f)
    good, out = build()
    ok('Đóng gói nhúng em bé và khối mềm làm từ ảnh AI', good and 'em-be' in out and 'sua' in out, out[-200:])
    b, ctx, pg, errs = mo(pw, GAME_DIST, 960, 540)
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_function("['em-be', 'sua'].every((m) => G.spriteCustom.get(m) && G.spriteCustom.get(m).ready)")
    r = pg.evaluate(VO_GAME, ['em-be', 'sua'])
    ok('Trong game: mọi khung của em bé và khối mềm không có lỗ mới, không mảnh rời', all(v['lo'] <= 0 and v['roi'] == 0 and v['khung'] > 20 for v in r.values()), r)
    ok('Không có lỗi trang trong game', not errs, errs[:3])
    b.close()
    don_custom()
