"""17/10 (nut-danh-to): NÚT ĐÁNH TO LẠI + chống bấm nhầm (js/stage.js boCucTo / nutTai), cỡ nút Nhỏ / Vừa / To (G.save.coNut).
Không chơi thử: đặt bản lưu, dựng cảnh, chạm giả bằng CDP rồi đọc vai trò ngón chạm / trạng thái nhân vật.
Chạy từ thư mục game: python3 tests/nut_danh_shots.py [thư mục ảnh]  (mặc định docs/review/ke-hoach-cai-thien/nut-danh-to/anh)
Ảnh soát HUD ở 844×390, 667×375, 1280×720 (người mới và đủ nút), có vẽ vùng chạm: tô màu từng điểm theo nút mà nutTai trả về,
vòng liền = hình nút. Thoát mã 1 nếu có lỗi trang hoặc điều kiện sai."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import ui_lib
from ui_lib import Game, ROOT

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'ke-hoach-cai-thien', 'nut-danh-to', 'anh')
os.makedirs(OUT, exist_ok=True)
TRANG = ROOT + '/dist/linh-khi.html' if os.path.exists(ROOT + '/dist/linh-khi.html') else ROOT + '/index.html'
loi, dung = [], []

def ok(cond, msg):
    (dung if cond else loi).append(msg)
    print(('ĐẠT ' if cond else 'SAI ') + msg)

NGUOI_MOI = """(() => { G.resetSave(); const s = G.save; s.sound = false; s.truyen = { mo: 1, v: 3, n: {} }; G.persist(); return true; })()"""
BAN_CU = """(() => { G.resetSave(); const s = JSON.parse(JSON.stringify(G.save)); delete s.moDan; s.sound = false; s.truyen = { mo: 1, v: 3, n: {} }; s.tut.done = true;
  s.stars = { '0-0': 3, '0-1': 3, '0-2': 3 }; s.heroes[s.hero].lvl = 6; localStorage.setItem(G.SAVE_KEY, JSON.stringify(s)); return true; })()"""

# Số đo bố cục theo điểm ảnh CSS: đường kính từng nút (bán kính vẽ = b[2] + 1), khoảng cách mép tới mép nhỏ nhất, chồng lên ô HUD
DO = """() => { const U = G.stageUi, sc = G.scale, S = G.getRun(), out = { sc, d: {}, gap: 1e9, cap: '', dung: [] };
  const ten = ['atk', 'dodge', 'potion'].concat(G.moDan.co('dacBiet') ? ['special'] : [], G.moDan.co('chuong') ? ['skill'] : []);
  const B = {}; for (const n of ten) { B[n] = U.btnPos(n); out.d[n] = Math.round(2 * (B[n][2] + 1) * sc * 10) / 10; }
  for (let i = 0; i < ten.length; i++) for (let j = i + 1; j < ten.length; j++) { const a = B[ten[i]], b = B[ten[j]];
    const g = (Math.hypot(a[0] - b[0], a[1] - b[1]) - a[2] - b[2] - 2) * sc; if (g < out.gap) { out.gap = Math.round(g * 10) / 10; out.cap = ten[i] + '-' + ten[j]; } }
  const mm = G.minimap.rect(S), o = U.OVK, cham = (b, x, y, w, h) => b[0] + b[2] + 1 > x && b[0] - b[2] - 1 < x + w && b[1] + b[2] + 1 > y && b[1] - b[2] - 1 < y + h;
  for (const n of ten) { if (cham(B[n], mm[0], mm[1], mm[2], mm[3])) out.dung.push(n + ' đè bản đồ'); if (cham(B[n], o[0], o[1], o[2], o[3] + 14)) out.dung.push(n + ' đè ô vũ khí / linh khí');
    if (cham(B[n], 0, 0, 130, 24)) out.dung.push(n + ' đè thanh máu'); /* binh-mau-goc: thanh máu + mana cao tới y = 23; Bình máu góc trái nằm ngay dưới (y ≥ 26) */ if (B[n][1] + B[n][2] + 1 > 270 + (G.cy || 0)) out.dung.push(n + ' tràn đáy'); }
  const xa = (n) => Math.hypot(B[n][0] - B.atk[0], B[n][1] - B.atk[1]);
  out.lonNhat = ten.every((n) => n === 'atk' || B[n][2] < B.atk[2]);
  out.binhXaNhat = ten.every((n) => n === 'potion' || n === 'atk' || xa(n) < xa('potion'));
  out.atkGoc = B.atk[0] > B.dodge[0] && B.atk[1] >= Math.max(...ten.filter((n) => n !== 'atk' && n !== 'dodge').map((n) => B[n][1]));
  return out; }"""

# Lớp vẽ vùng chạm (DOM, phủ lên khung game): mỗi điểm cách 2 đơn vị tô theo nút nutTai trả về, vòng liền là hình nút
VE_VUNG = """() => { const old = document.getElementById('vungCham'); if (old) old.remove();
  const st = document.getElementById('stage').getBoundingClientRect(), sc = G.scale, U = G.stageUi;
  const cv = document.createElement('canvas'); cv.id = 'vungCham'; cv.width = innerWidth; cv.height = innerHeight;
  Object.assign(cv.style, { position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 99 }); document.body.appendChild(cv);
  const c = cv.getContext('2d'), mau = { atk: 'rgba(255,60,40,0.42)', dodge: 'rgba(60,160,255,0.42)', special: 'rgba(250,210,40,0.45)', skill: 'rgba(200,90,255,0.45)', potion: 'rgba(60,230,110,0.45)' };
  const x0 = 300, x1 = 480 + (G.cx || 0) + 40, y1 = 270 + (G.cy || 0) + 30;
  for (let y = 100; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const n = U.nutTai({ x, y }); if (!n) continue;
    const px = st.left + x * sc, py = st.top + y * sc; if (px > innerWidth || py > innerHeight) continue; c.fillStyle = mau[n]; c.fillRect(px - sc, py - sc, 2 * sc, 2 * sc); }
  c.lineWidth = 2;
  for (const n of ['atk', 'dodge', 'special', 'skill', 'potion']) { if ((n === 'special' && !G.moDan.co('dacBiet')) || (n === 'skill' && !G.moDan.co('chuong'))) continue;
    const b = U.btnPos(n); c.strokeStyle = '#fff'; c.beginPath(); c.arc(st.left + b[0] * sc, st.top + b[1] * sc, (b[2] + 1) * sc, 0, 7); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(8, innerHeight - 30, 520, 24); c.fillStyle = '#fff'; c.font = '13px sans-serif';
  c.fillText('Vùng chạm: đỏ Đánh, xanh Né, vàng Đặc biệt, tím Chưởng, lục Bình máu; vòng trắng = hình nút', 14, innerHeight - 13);
  return true; }"""
BO_VUNG = "() => { const v = document.getElementById('vungCham'); if (v) v.remove(); }"

def chup(g, ten, vung=False):
    g.wait(300)
    g.pg.screenshot(path=os.path.join(OUT, ten))
    if vung:
        g.ev(VE_VUNG); g.wait(80)
        g.pg.screenshot(path=os.path.join(OUT, ten.replace('.png', '-vung-cham.png')))
        g.ev(BO_VUNG)

def vao_ai(g, nguoi_moi):
    ev = g.ev
    if nguoi_moi:
        ev(NGUOI_MOI); ev("() => G.startStage(0, 0, 0)")
    else:
        ev(BAN_CU); g.pg.reload(); g.pg.wait_for_function('window.G && G.scene'); g.wait(500)
        ev("() => G.startStage(0, 2, 0)")
    g.wait(1500)
    ev("() => { const S = G.getRun(); S.W.ents.length = 0; S.W.waves = []; S.W.banner = null; }")  # dọn quái cho ảnh dễ nhìn, không ai đánh
    g.wait(300)

def tro(g):  # ngón đang giữ trong game: [(vai trò, x, y)]
    return g.ev("() => [...G.pointers.values()].map((p) => [p.role, Math.round(p.x), Math.round(p.y)])")

def cham_thu(g, x, y):
    """chạm xuống tại (x, y) toạ độ game, chờ một khung, đọc vai trò rồi nhấc"""
    g.down(x, y); g.wait(70)
    r = tro(g); g.up(); g.wait(120)
    return r[0][0] if r else None

def main():
    with sync_playwright() as p:
        for size, nhan in (('phone', '844x390'), ('p169', '667x375'), ('desk', '1280x720')):
            for nguoi_moi in (True, False):
                g = Game(p, size, url='file://' + TRANG + '?cloud=0', fresh=False)
                g.wait(500)
                vao_ai(g, nguoi_moi)
                kieu = 'nguoi-moi' if nguoi_moi else 'du-nut'
                d = g.ev(DO)
                ten = nhan + ' ' + kieu
                print('  ' + ten + ': ' + json.dumps(d, ensure_ascii=False))
                ok(not d['dung'], ten + ': nút không đè thanh máu / ô vũ khí / bản đồ (' + ', '.join(d['dung']) + ')')
                ok(d['lonNhat'] and d['atkGoc'], ten + ': Đánh là nút lớn nhất, ở góc dưới phải')
                ok(d['binhXaNhat'], ten + ': Bình máu xa Đánh nhất')
                if size != 'desk':
                    ok(72 <= d['d']['atk'] <= 84 and 58 <= d['d']['dodge'] <= 66, ten + ': Đánh %.0f px, Né %.0f px, Bình máu %.0f px' % (d['d']['atk'], d['d']['dodge'], d['d']['potion']))
                    if 'special' in d['d']:
                        ok(44 <= d['d']['special'] <= 52 and 44 <= d['d']['skill'] <= 52, ten + ': Đặc biệt %.0f px, Chưởng %.0f px' % (d['d']['special'], d['d']['skill']))
                    ok(d['gap'] >= 14, ten + ': mép tới mép ≥ 14 px (nhỏ nhất %.1f px, %s)' % (d['gap'], d['cap']))
                    ok(g.ev("() => G.stageUi.btnPos('atk')[2]") >= 28, ten + ': bán kính Đánh ≥ 28 đơn vị như nút cũ')
                chup(g, '%s-%s.png' % (nhan, kieu), vung=True)
                if not nguoi_moi and size != 'desk':
                    sc = d['sc']
                    a = g.ev("() => G.stageUi.btnPos('atk')"); n = g.ev("() => G.stageUi.btnPos('dodge')")
                    k = g.ev("() => G.stageUi.btnPos('skill')"); s = g.ev("() => G.stageUi.btnPos('special')")
                    ra, rn = a[2] + 1, n[2] + 1
                    # trượt khỏi nút Đánh 8 px (phía trên, phía trên-trái) vẫn ra Đánh; chạm sát mép phải / đáy màn hình cạnh nút Đánh ra Đánh
                    ok(cham_thu(g, a[0], a[1] - ra - 8 / sc) == 'atk', ten + ': chạm trượt 8 px phía trên nút Đánh vẫn ra Đánh')
                    ok(cham_thu(g, a[0] - (ra + 8 / sc) * 0.94, a[1] - (ra + 8 / sc) * 0.34) == 'atk', ten + ': chạm trượt 8 px phía trên-trái nút Đánh vẫn ra Đánh')
                    me = g.ev("() => { const st = document.getElementById('stage').getBoundingClientRect(); const f = document.getElementById('fit').getBoundingClientRect(); return [(f.right - st.left) / G.scale, (f.bottom - st.top) / G.scale]; }")
                    ok(cham_thu(g, me[0] - 1, a[1]) == 'atk', ten + ': chạm sát mép phải vùng chơi ngang nút Đánh ra Đánh (cách hình nút %.0f px)' % ((me[0] - 1 - a[0] - ra) * sc))
                    ok(cham_thu(g, me[0] - 1, me[1] - 1) == 'atk', ten + ': chạm góc dưới phải vùng chơi ra Đánh')
                    ok(cham_thu(g, a[0] + ra * 0.6, a[1] + ra + 6 / sc) == 'atk', ten + ': chạm dưới nút Đánh (sát mép đáy) ra Đánh')
                    # giữa Đánh và Né: điểm giữa khe → Đánh (ưu tiên chỗ chồng lấn); 75% khe về phía Né → Né
                    ux, uy = n[0] - a[0], n[1] - a[1]; L = (ux * ux + uy * uy) ** 0.5; ux, uy = ux / L, uy / L
                    khe = L - ra - rn
                    def diem(t): return a[0] + ux * (ra + khe * t), a[1] + uy * (ra + khe * t)
                    ok(cham_thu(g, *diem(0.5)) == 'atk', ten + ': chạm giữa khe Đánh–Né ra Đánh (ưu tiên Đánh)')
                    ok(cham_thu(g, *diem(0.85)) == 'dodge', ten + ': chạm sát Né (85% khe) ra Né (nút gần hơn)')
                    # giữa Đặc biệt và Chưởng: hơi lệch về mỗi bên → đúng nút gần hơn
                    for t, mong in ((0.35, 'special'), (0.65, 'skill')):
                        x = s[0] + (k[0] - s[0]) * t; y = s[1] + (k[1] - s[1]) * t
                        r = cham_thu(g, x, y)
                        ok(r == mong, ten + ': chạm giữa Đặc biệt–Chưởng lệch %d%% ra %s (%s)' % (int(t * 100), mong, r))
                    # kéo ngón từ Đánh sang Né rồi sang Chưởng: vẫn là Đánh, Né không bật
                    g.ev("() => { const P = G.getRun().P; P.dodgeCd = 0; P.dodgeT = 0; P.mana = 0; }")
                    g.down(a[0], a[1]); g.wait(60)
                    for i in range(1, 7):
                        g.move(a[0] + (n[0] - a[0]) * i / 6, a[1] + (n[1] - a[1]) * i / 6); g.wait(25)
                    g.wait(80)
                    r1 = tro(g); g.move(k[0], k[1]); g.wait(80); r2 = tro(g)
                    ne = g.ev("() => { const P = G.getRun().P; return P.dodgeT > 0 || P.dodgeCd > 0; }")
                    g.up(); g.wait(150)
                    ok(r1 and r1[0][0] == 'atk' and r2 and r2[0][0] == 'atk' and not ne, ten + ': kéo ngón từ Đánh sang Né / Chưởng không bật nút kia (%s, %s, né=%s)' % (r1, r2, ne))
                    # cỡ nút Nhỏ / To
                    for co, lo, hi in (('nho', 62, 72), ('to', 86, 98)):
                        g.ev("(c) => { G.save.coNut = c; }", co); g.wait(150)
                        dd = g.ev(DO)
                        ok(lo <= dd['d']['atk'] <= hi and dd['gap'] >= 14 and not dd['dung'] and dd['lonNhat'] and dd['binhXaNhat'],
                           ten + ': cỡ %s: Đánh %.0f px, Né %.0f, khe nhỏ nhất %.1f px, %s' % (co, dd['d']['atk'], dd['d']['dodge'], dd['gap'], dd['dung'] or 'không đè'))
                        if size == 'phone': chup(g, '%s-%s-co-%s.png' % (nhan, kieu, co), vung=True)
                    g.ev("() => { delete G.save.coNut; }")
                ok(not g.errs, ten + ': không lỗi trang ' + str(g.errs[:2]))
                g.close()

        # Cài đặt: Anh Mõ → Âm thanh, điều khiển → Cỡ nút; bấm "To" thì lưu vào bản lưu; tiếng Anh có chữ
        g = Game(p, 'phone', url='file://' + TRANG + '?cloud=0', fresh=False)
        g.wait(500); g.ev(BAN_CU); g.pg.reload(); g.pg.wait_for_function('window.G && G.scene'); g.wait(500)
        g.ev("() => { G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo'); G.villageApi.V.tab = 'settings'; G.villageApi.V.cd2 = true; }")
        g.wait(400)
        chup(g, 'cai-dat-co-nut.png')
        o = g.ev("() => G.villageApi.V.coNutO || [216, 78]")  # binh-mau-goc: hàng cỡ nút thu hẹp để có chỗ nút Bình máu
        g.tap(o[0] + 2 * (o[1] + 4) + o[1] / 2, 226 + 16); g.wait(200)
        luu = g.ev("() => [G.save.coNut, JSON.parse(localStorage.getItem(G.SAVE_KEY)).coNut]")
        ok(luu == ['to', 'to'], 'Cài đặt: bấm "To" → G.save.coNut = to, có trong bản lưu (' + str(luu) + ')')
        g.tap(o[0] + (o[1] + 4) + o[1] / 2, 226 + 16); g.wait(200)
        ok(g.ev("() => G.save.coNut === undefined"), 'Cài đặt: bấm "Vừa" → về mặc định (xoá trường)')
        g.ev("() => G.ngonNgu.doi()"); g.wait(600)
        en = g.ev("() => [G.LANG, G.tv('Cỡ nút'), G.tv('Nhỏ'), G.tv('Vừa'), G.tv('To')].join('|')")
        ok(en.startswith('en|Button size|Small|') and en.endswith('|Large') and 'Vừa' not in en, 'Cài đặt: có bản tiếng Anh (' + en + ')')
        chup(g, 'cai-dat-co-nut-en.png')
        g.ev("() => G.ngonNgu.doi()")
        g.close()

        # Cờ quay lui
        for co, mong in (('nutcu=1', 28), ('nuttv1=1', None)):
            g = Game(p, 'phone', url='file://' + TRANG + '?cloud=0&' + co, fresh=False)
            g.wait(400); vao_ai(g, False)
            sc = g.ev("() => G.scale"); r = g.ev("() => G.stageUi.btnPos('atk')[2]"); rn = g.ev("() => G.stageUi.btnPos('dodge')[2]")
            if mong:
                ok(r == mong, '?' + co + ': nút Đánh về cỡ cũ (bán kính %s)' % r)
            else:
                ok(abs(r - rn) < 0.01 and 56 <= 2 * r * sc <= 64.5, '?' + co + ': bố cục Tư vấn 1 (Đánh = Né = %.0f px)' % (2 * r * sc))
            chup(g, 'co-' + co.replace('=1', '') + '.png')
            g.close()
    print('\nĐạt %d, sai %d' % (len(dung), len(loi)))
    sys.exit(1 if loi else 0)

if __name__ == '__main__':
    main()
