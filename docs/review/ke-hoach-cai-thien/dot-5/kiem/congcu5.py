"""Đợt 5: thử trang Ghép đồ (tools/tach-ghep). Cần `python3 -m http.server 8803` ở gốc repo. python3 congcu5.py <thư mục ra>
 1. Chọn Cu Tí, thân AI, vũ khí kiếm, động tác Đánh, khung 0 → ô "nằm trong bàn tay" đã bật (số nạp sẵn); nhích 1 điểm ảnh "chỉ khung này";
    tải tệp ghép → kiểm tra số đã ghi, các trường cũ còn nguyên, game đọc được.
 2. Thẻ b, mũ sừng: chạm đặt lại dinh_dau; tải tệp mũ → ảnh (trường anh) và mọi trường cũ giống hệt tệp gốc."""
from chung import *
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_context(viewport={'width': 430, 'height': 900}, device_scale_factor=2, accept_downloads=True).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8803/tools/tach-ghep/index.html'); pg.wait_for_function("() => window.__ghep && window.__ghep.GAME.moi && Object.keys(window.__ghep.THAN).length >= 4 && window.__ghep.GHEP.hunter", timeout=60000)
    pg.wait_for_timeout(1500)
    ev = pg.evaluate
    print('tệp ghép nạp sẵn:', ev("() => Object.keys(__ghep.GHEP)"), '· API game:', ev("() => __ghep.coAPI()"))
    ev("() => { document.querySelectorAll('#dsNhanVat button')[0].click(); document.getElementById('nutThanAI').click(); }")
    ev("() => { __ghep.S.vk = 'sword'; __ghep.chonDT('atk0'); document.getElementById('nutChay').click(); }")
    ev("() => { const b = [...document.querySelectorAll('#dsCheDo button')].find((x) => /^c\\./.test(x.textContent)); b.click(); const s = document.getElementById('chonMonC'); s.value = 'vk-sword'; s.onchange({ target: s }); }")
    pg.wait_for_timeout(600)
    ev("() => { __ghep.S.chay = false; __ghep.S.khung = 0; document.getElementById('thanhKhung').value = 0; document.getElementById('thanhKhung').dispatchEvent(new Event('input')); }")
    pg.wait_for_timeout(400)
    t1 = ev("() => ({ mon: __ghep.S.monC, than: __ghep.S.than, dt: __ghep.S.dt, khung: __ghep.S.khung, bam: document.getElementById('chkBam').checked, hien: !document.getElementById('khoiVk').classList.contains('an'), chu: document.getElementById('ttCap').textContent, ds: [...document.getElementById('chonMonC').options].map((o) => o.value).filter((v) => /^vk-/.test(v)) })")
    print('1.', t1)
    ev("() => { document.querySelector('input[name=phamViC][value=khung]').click(); document.querySelector('[data-nhich=\"1,0\"]').click(); document.querySelector('[data-xoay=\"5\"]').click(); }")
    pg.wait_for_timeout(700)
    print('   sau khi nhích:', ev("() => JSON.stringify(__ghep.GHEP.smith.cap['vk-sword'].theo['atk:0'])"), '·', ev("() => document.getElementById('ttCap').textContent")[:150])
    pg.locator('#cvXem').scroll_into_view_if_needed(); pg.wait_for_timeout(500); pg.screenshot(path=OUT + '/tach-ghep-vu-khi.png')
    with pg.expect_download() as d: pg.click('#nutTaiGhep')
    f = OUT + '/thu-ghep-smith.sprite.json'; d.value.save_as(f)
    g = json.load(open(f)); goc = json.load(open(REPO + '/game/art/custom/ghep-smith.sprite.json'))
    e = g['cap']['vk-sword']['theo']['atk:0']
    print('   tệp tải về:', d.value.suggested_filename, '· atk:0 =', e, '· điểm cũ còn nguyên:', g['diem'] == goc['diem'] and g['diem_theo'] == goc['diem_theo'], '· các khung khác còn nguyên:', all(g['cap'][k]['theo'][q] == goc['cap'][k]['theo'][q] for k in goc['cap'] for q in goc['cap'][k]['theo'] if (k, q) != ('vk-sword', 'atk:0')))
    assert e == {'bam': 'tay_truoc', 'dx': 1, 'dy': 0, 'xoay': 5}, e
    # tắt bám ở khung này rồi bật lại
    ev("() => { const c = document.getElementById('chkBam'); c.checked = false; c.onchange({ target: c }); }"); pg.wait_for_timeout(300)
    print('   tắt bám:', ev("() => JSON.stringify(__ghep.GHEP.smith.cap['vk-sword'].theo['atk:0'])"))
    ev("() => { const c = document.getElementById('chkBam'); c.checked = true; c.onchange({ target: c }); }"); pg.wait_for_timeout(300)
    print('   bật lại:', ev("() => JSON.stringify(__ghep.GHEP.smith.cap['vk-sword'].theo['atk:0'])"))
    # 2. mũ
    ev("() => { const b = [...document.querySelectorAll('#dsCheDo button')].find((x) => /^b\\./.test(x.textContent)); b.click(); const s = document.getElementById('chonMonB'); s.value = 'tp-hats-mu_sung'; s.onchange({ target: s }); }")
    pg.wait_for_timeout(600)
    truoc = ev("() => JSON.stringify(__ghep.MON['tp-hats-mu_sung'].tep.trang_phuc.diem)")
    bb = pg.locator('#cvMon').bounding_box(); kt = ev("() => { const c = document.getElementById('cvMon'); return [c.width, c.height]; }")
    pg.locator('#cvMon').scroll_into_view_if_needed(); bb = pg.locator('#cvMon').bounding_box()
    z = kt[0] / (17 + 6)  # ảnh mũ 17 rộng + lề 3 mỗi bên
    px, py = bb['x'] + (3 + 9.5) * z * bb['width'] / kt[0], bb['y'] + (3 + 7) * z * bb['height'] / kt[1]
    pg.mouse.move(px, py); pg.mouse.down(); pg.mouse.up(); pg.wait_for_timeout(500)
    sau = ev("() => JSON.stringify(__ghep.MON['tp-hats-mu_sung'].tep.trang_phuc.diem)")
    print('2. dinh_dau mũ sừng trước khi chạm:', truoc, '· sau khi chạm vào (9,5; 7):', sau)
    pg.screenshot(path=OUT + '/tach-ghep-mu.png')
    with pg.expect_download() as d: pg.click('#nutTaiMon')
    f2 = OUT + '/thu-tp-hats-mu_sung.sprite.json'; d.value.save_as(f2)
    a = json.load(open(REPO + '/game/art/custom/tp-hats-mu_sung.sprite.json')); c = json.load(open(f2))
    cu = all(c[k] == a[k] for k in a if k != 'trang_phuc') and all(c['trang_phuc'][k] == v for k, v in a['trang_phuc'].items() if k != 'diem')
    print('   tệp mũ tải về:', d.value.suggested_filename, '· ảnh giống hệt từng byte:', c['anh'].encode() == a['anh'].encode(), '· mọi trường cũ giữ nguyên:', cu, '· điểm mới:', c['trang_phuc']['diem'], c['trang_phuc'].get('co_chuan'))
    raw_a = open(REPO + '/game/art/custom/tp-hats-mu_sung.sprite.json', 'rb').read(); raw_c = open(f2, 'rb').read()
    print('   chỉ khác đúng con số điểm neo:', raw_c.replace(b'"dinh_dau":[9.5,7]', b'"dinh_dau":[8.5,6]') == raw_a)
    b.close()
print('lỗi trang:', errs[:5])
