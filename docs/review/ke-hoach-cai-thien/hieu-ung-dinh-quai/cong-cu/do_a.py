"""PHẦN A — đo hiệu ứng có dính vào quái không (chỉ đọc + bot headless). Chạy từ thư mục gốc repo:
  python3 docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu/do_a.py [nhãn] [thêm-tham-số-url] [phần]
nhãn: tên tệp kết quả so-lieu/<nhãn>.json (mặc định 'truoc'); tham số url ví dụ '&netcao=4' hoặc '&dinhquai=0'.
phần: chuỗi chữ cái — t (trạng thái), d (đòn Cu Tí), q (đòn quái), m (mép phòng), p (phúc lành + hệ). Mặc định 'tdqmp'."""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dq_common import *

NHAN = sys.argv[1] if len(sys.argv) > 1 else 'truoc'
EXTRA = sys.argv[2] if len(sys.argv) > 2 else ''
PHAN = sys.argv[3] if len(sys.argv) > 3 else 'tdqmp'
GON = '--gon' in sys.argv  # bản gọn: một mặt, ít đòn (dùng cho NET 3/4)
os.makedirs(os.path.join(OUT, 'so-lieu'), exist_ok=True)
DEST = os.path.join(OUT, 'so-lieu', NHAN + '.json')


def main():
    kq = {'nhan': NHAN, 'url': EXTRA, 'tt': [], 'don': [], 'quai': [], 'mep': [], 'pl': [], 'than': [], 'chet': [], 'motlan': []}
    t0 = time.time()
    with sync_playwright() as pw:
        b, pg, errs = open_game(pw, EXTRA)
        kq['net'] = pg.evaluate('G.NET')
        ro = pg.evaluate('DQ.roster()')
        kq['roster'] = ro
        mats = [-1] if GON else [-1, 1]
        if 't' in PHAN:
            for q in ro:
                for f in mats:
                    r = pg.evaluate("""([q, f]) => { const out = []; for (const t of DQ.TT) { const e = DQ.spawn(q, { face: f }); if (!e) return null; e.face = f; out.push(DQ.trangThai(e, t)); } return out; }""", [q, f])
                    for x in r or []: x.update(id=q['id'], r=q['r'], loai=q['loai'], mat=f); kq['tt'].append(x)
                th = pg.evaluate("""([q]) => { const e = DQ.spawn(q, { face: -1 }); if (!e) return null; return { than: DQ.thanHat(e), b: DQ.bbox(DQ.body(e)) && (({ x0, x1, y0, y1 }) => ({ x0: x0 - e.x, x1: x1 - e.x, y0: y0 - e.y, y1: y1 - e.y }))(DQ.bbox(DQ.body(e))), h: e.h, scale: e.scale || 1, r: e.r, art: e.art || null, kind: e.kind || null, bay: !!(e.art && G.monsterArt._defs[e.art] && G.monsterArt._defs[e.art].bay), anh: !!(e.art && G.spriteCustom.get(e.art)) }; }""", [q])
                if th: th.update(id=q['id'], r=q['r'], loai=q['loai']); kq['than'].append(th)
                ml = pg.evaluate("""([q]) => { const out = []; for (const [a, el] of [['freeze', null], ['status', 'fire'], ['status', 'poison'], ['status', 'ice']]) { const e = DQ.spawn(q, { face: -1 }); out.push(DQ.motLan(e, a, el)); } return out; }""", [q])
                for x in ml: x.update(id=q['id'], r=q['r'], loai=q['loai']); kq['motlan'].append(x)
                ch = pg.evaluate("([q]) => DQ.chetKhiDinh(q)", [q])
                if ch: ch.update(id=q['id'], r=q['r'], loai=q['loai']); kq['chet'].append(ch)
                print('tt', q['id'], '%.0fs' % (time.time() - t0), flush=True)
            json.dump(kq, open(DEST, 'w'), ensure_ascii=False)
        if 'd' in PHAN:
            dons = ['kiem', 'phitieu'] if GON else pg.evaluate('DQ.DON')
            for q in ro:
                for ten in dons:
                    for ben in mats:
                        try:
                            r = pg.evaluate("([q, t, b]) => DQ.danh(q, t, b)", [q, ten, ben])
                        except Exception as ex:
                            print('LỖI', q['id'], ten, str(ex)[:200], flush=True); continue
                        if not r: continue
                        for i, x in enumerate(r['list']):
                            x.update(id=q['id'], r=q['r'], loai=q['loai'], don=ten, ben=ben, thu=i); kq['don'].append(x)
                print('don', q['id'], '%.0fs' % (time.time() - t0), flush=True)
            json.dump(kq, open(DEST, 'w'), ensure_ascii=False)
        if 'm' in PHAN and not GON:
            for q in ro:
                for ben in [-1, 1]:
                    for ten in ['kiem', 'phitieu', 'chuong_bang']:
                        try: r = pg.evaluate("([q, t, b]) => DQ.danh(q, t, b, { mep: true })", [q, ten, ben])
                        except Exception as ex: print('LỖI mép', q['id'], str(ex)[:200], flush=True); continue
                        if not r: continue
                        for i, x in enumerate(r['list']): x.update(id=q['id'], r=q['r'], loai=q['loai'], don=ten, ben=ben, thu=i, mep=True); kq['mep'].append(x)
            print('mep xong %.0fs' % (time.time() - t0), flush=True)
            json.dump(kq, open(DEST, 'w'), ensure_ascii=False)
        if 'p' in PHAN and not GON:
            dai = [q for q in ro if q['id'] in ('heoCon', 'ongVo', 'cuaTuong', 'namChua', 'moc', 'hoTinh', 'thuong', 'caChuon')]
            for q in dai:
                for ten, o in [('kiem', {'pl': 'guom'}), ('bua', {'pl': 'riu'}), ('kiem', {'pl': 'than'}), ('thuong', {'pl': 'tre'}), ('kiem', {'he': 'fire'}), ('kiem', {'he': 'poison'}), ('kiem', {'he': 'ice'}), ('thuong', {'he': 'ice'}), ('bua', {'he': 'fire'})]:
                    try: r = pg.evaluate("([q, t, o]) => DQ.danh(q, t, -1, o)", [q, ten, o])
                    except Exception as ex: print('LỖI pl', q['id'], str(ex)[:200], flush=True); continue
                    if not r: continue
                    for i, x in enumerate(r['list']): x.update(id=q['id'], r=q['r'], loai=q['loai'], don=ten, ben=-1, thu=i, them=o); kq['pl'].append(x)
            print('pl xong %.0fs' % (time.time() - t0), flush=True)
            json.dump(kq, open(DEST, 'w'), ensure_ascii=False)
        if 'q' in PHAN and not GON:
            for q in ro:
                phas = [None, 1, 2] if q['loai'] == 'trum' else [None, 1] if q['loai'] == 'trumnho' else [None]
                for ben in [-1, 1]:
                    for pha in phas:
                        try: r = pg.evaluate("([q, b, p]) => DQ.quaiDanh(q, b, { f: p == null && q.loai === 'thuong' ? 420 : 700, pha: p })", [q, ben, pha])
                        except Exception as ex: print('LỖI quái', q['id'], str(ex)[:200], flush=True); continue
                        if not r: continue
                        r.update(id=q['id'], r=q['r'], loai=q['loai'], ben=ben, pha=pha); kq['quai'].append(r)
                print('quai', q['id'], '%.0fs' % (time.time() - t0), flush=True)
        kq['loi_js'] = errs
        b.close()
    kq['giay'] = round(time.time() - t0)
    json.dump(kq, open(DEST, 'w'), ensure_ascii=False)
    print('XONG', DEST, kq['giay'], 's, lỗi JS:', len(kq['loi_js']), flush=True)


if __name__ == '__main__':
    main()
