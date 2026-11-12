#!/usr/bin/env python3
# TURRET MERGE — sinh BẢNG NẠP SẴN thap/js/nong-meta.js từ "ảnh thực dùng" của các trận bot (KE-HOACH.md mục 15).
#
#   1) gom  : gom kết quả các trận bot (tools/thap-kt-nap-truoc.js MODE=gt, mỗi trận 1 tệp JSON) thành
#             docs/demo-hop-tuong/tuvan/webgl/ANH-THUC-DUNG-TRAN.json (dữ liệu thô theo từng trận — đủ để sinh lại bảng, không cần chạy lại bot)
#               python3 tools/thap-nong-meta.py gom <thư mục chứa *.json>
#   2) sinh : ANH-THUC-DUNG-TRAN.json + THONG-KE-HIEU-UNG.json (quét tĩnh, KHÔNG sửa tay) + tools/thap-nong-ngoai-le.json (ngoại lệ ghi rõ lý do)
#             → ANH-THUC-DUNG.json (theo ụ / trùm / chỉ huy / dùng chung, máy đọc) + ANH-THUC-DUNG.md (đối chiếu với quét tĩnh) + thap/js/nong-meta.js
#               python3 tools/thap-nong-meta.py sinh
#
# Trận bot xếp theo LƯỚI: 98 ụ xếp bảng 10 × 10 → 10 trận "hàng" (h0–h9) + 10 trận "cột" (c0–c9), mỗi trận 2 bộ bài × 5 ụ → mỗi ụ có mặt ở ĐÚNG 2 trận (ụ bù chỗ trống: 3)
#   với 2 nhóm bạn khác nhau. Ảnh được VẼ (GLR ghi tầng nét nhất _lvThay) ở cả 2 trận của 1 ụ và mọi trận có nó đều giải thích được bằng ≤ 4 ụ như vậy → ảnh của (các) ụ đó.
#   Ảnh có ở ≥ 75 % số trận lưới → 'dau' (dùng chung, nạp ở màn mở đầu) · ≥ 25 % → 'nen' (nạp nền giữa trận) · còn lại: gán cho ụ mà quét tĩnh ghi là chủ (tĩnh ∩ thực) hoặc để 'hiem' (không nạp trước).
#   Trận t_<trùm> (12 trận, cùng 1 cặp bộ bài, ép trùm bằng ?trum=): ảnh chỉ có ở ≤ 2 trận trùm → của trùm đó.
import json, sys, os, re, glob, datetime

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WG = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/webgl')
F_TRAN = os.path.join(WG, 'ANH-THUC-DUNG-TRAN.json')
F_TINH = os.path.join(WG, 'THONG-KE-HIEU-UNG.json')
F_NL = os.path.join(GOC, 'tools/thap-nong-ngoai-le.json')
F_KQ = os.path.join(WG, 'ANH-THUC-DUNG.json')
F_MD = os.path.join(WG, 'ANH-THUC-DUNG.md')
F_JS = os.path.join(GOC, 'thap/js/nong-meta.js')
LA_QUAI = re.compile(r'^quai_')
LA_TRUM = re.compile(r'^(fx_)?trum_')


def gom(thu_muc):
    tran = {}
    for f in sorted(glob.glob(os.path.join(thu_muc, '*.json'))):
        try:
            d = json.load(open(f, encoding='utf8'))
        except Exception as e:
            print('bỏ', f, e); continue
        if 'anh' not in d: continue
        n = d.get('nhan') or os.path.basename(f)[:-5]
        tran[n] = {
            'd1': d['d1'].split(','), 'd2': d['d2'].split(','), 'mv': d.get('mv'), 'k': d.get('k'), 'wave': d.get('tong', {}).get('wave'), 'giay': d.get('tong', {}).get('giay'),
            'trum': d.get('trumRa') or [], 'anh': d['anh'], 'co': d.get('co') or {}, 'yeuCau': sorted(d.get('yeuCau') or []), 'taiGiua': sorted(d.get('taiGiua') or []),
            'chuGhi': d.get('chuGhi'), 'ketQua': {k: (d.get('ketQua') or {}).get(k) for k in ('cv', 'anh', 'yc')} if isinstance(d.get('ketQua'), dict) else None,
            'loi': d.get('loi') or '', 'errs': d.get('errs') or [],
        }
    co = {}
    for t in tran.values():
        co.update(t.pop('co'))
    json.dump({'ghi_chu': 'Dữ liệu thô các trận bot (tools/thap-kt-nap-truoc.js MODE=gt). anh = { tên ảnh: tầng nét nhất đã VẼ bằng lớp GL }; co = cỡ ảnh gốc.',
               'sinh_luc': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%MZ'), 'tran': tran, 'co': co}, open(F_TRAN, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    print('gom', len(tran), 'trận →', F_TRAN, os.path.getsize(F_TRAN) // 1024, 'KB')


def chuoi(ds, id=None):
    # {tên: tầng} → 'tên:tầng,tên' ('~' = id của mục)
    r = []
    for t in sorted(ds):
        L = ds[t]
        n = t.replace(id, '~') if id and '~' not in t else t
        r.append(n + (':%d' % L if L else ''))
    return ','.join(r)


def sinh():
    T = json.load(open(F_TRAN, encoding='utf8'))
    tinh = json.load(open(F_TINH, encoding='utf8'))
    nl = json.load(open(F_NL, encoding='utf8')) if os.path.exists(F_NL) else {}
    tran, co = T['tran'], T['co']
    luoi = {n: t for n, t in tran.items() if re.match(r'^[hc]\d+$', n)}
    trumT = {n[2:]: t for n, t in tran.items() if n.startswith('t_')}
    N = len(luoi)
    ks = sorted({t['k'] for t in luoi.values() if t.get('k')})
    k0 = ks[0] if ks else None
    cua_u = {}   # id → tập trận lưới có nó
    for n, t in luoi.items():
        for id in t['d1'] + t['d2']:
            cua_u.setdefault(id, set()).add(n)
    cua_mv = {}
    for n, t in luoi.items():
        for m in (t.get('mv') or [])[:1]:   # chỉ huy bàn mình (AF); bàn AI chọn ngẫu nhiên — không dùng để gán
            if m: cua_mv.setdefault(m, set()).add(n)
    # ảnh → {trận: tầng}
    ve = {}
    for n, t in luoi.items():
        for a, L in t['anh'].items():
            ve.setdefault(a, {})[n] = L
    yc = {}
    for n, t in luoi.items():
        for a in t['yeuCau']:
            yc.setdefault(a, set()).add(n)
    chu_tinh = {}  # tên → các id mà quét tĩnh ghi là chủ
    for id, ds in tinh['u'].items():
        for a in ds:
            chu_tinh.setdefault(a, set()).add(id)

    u = {id: {} for id in sorted(tinh['u'])}
    mv = {}
    dau, nen, hiem, quai = {}, {}, {}, {}
    cach = {}
    for a, m in ve.items():
        Mt = set(m); L = min(m.values()); f = len(Mt) / N
        if LA_QUAI.match(a): quai[a] = L; cach[a] = 'quai'; continue
        if LA_TRUM.match(a): cach[a] = 'trum'; continue
        C = [id for id, ms in cua_u.items() if ms <= Mt]
        phu = set().union(*[cua_u[id] for id in C]) if C else set()
        if C and Mt <= phu and len(C) <= 4:
            for id in C: u[id][a] = L
            cach[a] = 'u'; continue
        if re.match(r'^(cmd_|cf_)', a):
            Cm = [c for c, ms in cua_mv.items() if ms <= Mt]
            if Cm and len(Cm) <= 3:
                for c in Cm: mv.setdefault(c, {})[a] = L
                cach[a] = 'mv'; continue
        if f >= 0.75: dau[a] = L; cach[a] = 'dau'; continue
        chu = [id for id in chu_tinh.get(a, ()) if cua_u.get(id, set()) & Mt]
        if f >= 0.25:
            nen[a] = (L, len(Mt)); cach[a] = 'nen'
            for id in chu: u[id][a] = L   # ảnh dùng chung nhưng quét tĩnh ghi có chủ → cũng nạp ở màn mở đầu khi chủ có trong bộ bài
            continue
        for id in set(chu) | set(C):
            u[id][a] = L
        if chu or C: cach[a] = 'u1'
        else: hiem[a] = (L, sorted(Mt)); cach[a] = 'hiem'

    # trùm: ảnh chỉ thấy ở ≤ 2 trận trùm (cùng cặp bộ bài) → của trùm đó; + ảnh trum_<id>* / fx_trum_<id> vẽ ở bất kỳ trận nào
    trum = {id: {} for id in sorted(tinh['trum'])}
    dem_t = {}
    for id, t in trumT.items():
        for a in t['anh']: dem_t[a] = dem_t.get(a, 0) + 1
    for id, t in trumT.items():
        for a, L in t['anh'].items():
            if LA_QUAI.match(a): continue
            rieng = dem_t[a] <= 2 and len(ve.get(a, ())) / N < 0.3 and cach.get(a) not in ('u', 'u1', 'dau')
            if rieng or re.match(r'^(fx_)?trum_' + re.escape(id) + r'(_|$)', a) or a in tinh['trum'].get(id, ()):
                if id in trum: trum[id][a] = min(L, trum[id].get(a, 99))
    for n, t in tran.items():   # trùm ra trong trận lưới: dải của nó (tầng nét nhất)
        for a, L in t['anh'].items():
            mm = re.match(r'^(?:fx_)?trum_(.+)$', a)
            if not mm: continue
            for id in trum:
                if mm.group(1) == id or mm.group(1).startswith(id + '_'):
                    trum[id][a] = min(L, trum[id].get(a, 99))

    # ngoại lệ ghi tay (có lý do): them / bo theo ụ, trùm, dau, nen
    for khoa, bang in (('u', u), ('trum', trum), ('mv', mv)):
        for id, ds in (nl.get('them', {}).get(khoa) or {}).items():
            for a, L in ds.items(): bang.setdefault(id, {})[a] = L
        for id, ds in (nl.get('bo', {}).get(khoa) or {}).items():
            for a in ds: bang.get(id, {}).pop(a, None)
    for a, L in (nl.get('them', {}).get('dau') or {}).items(): dau[a] = L; nen.pop(a, None)
    for a in (nl.get('bo', {}).get('dau') or []): dau.pop(a, None)
    for a in (nl.get('bo', {}).get('nen') or []): nen.pop(a, None)
    bo_mau = [re.compile(p) for p in (nl.get('bo_mau') or [])]   # mẫu tên không bao giờ nạp trước (vd ảnh nền bàn: đã lên GPU từ khung đầu)
    loc = lambda ds: {a: v for a, v in ds.items() if not any(p.search(a) for p in bo_mau)}
    u = {id: loc(ds) for id, ds in u.items()}; trum = {id: loc(ds) for id, ds in trum.items()}; mv = {id: loc(ds) for id, ds in mv.items()}
    dau, nen = loc(dau), loc(nen)
    # ảnh đã ở 'dau' thì không lặp lại theo ụ
    for id in u:
        for a in list(u[id]):
            if a in dau: del u[id][a]
    # 'nen' xếp ưu tiên: trạng thái fx_st_* → ghép → chỉ huy cf_* → theo số trận thấy
    def uu(a):
        return (0 if a.startswith('fx_st_') else 1 if re.search(r'merge|ghep', a) else 2 if a.startswith('cf_') or a.startswith('cmd_') else 3, -nen[a][1], a)
    nen_ds = sorted(nen, key=uu)

    # tờ ký tự: mục ghi ở ≥ 2 trận có ghi (hoặc mọi mục nếu chỉ có 1 trận)
    chu_dem, n_chu = {}, 0
    for t in tran.values():
        if t.get('chuGhi'):
            n_chu += 1
            for e in t['chuGhi']: chu_dem[json.dumps(e, ensure_ascii=False)] = chu_dem.get(json.dumps(e, ensure_ascii=False), 0) + 1
    chu = [json.loads(s) for s, c in sorted(chu_dem.items(), key=lambda x: (-x[1], x[0])) if c >= min(2, n_chu)][:int(nl.get('chu_max', 40))]

    # ---------- đối chiếu với quét tĩnh ----------
    om_khac, om_yc, om_khong = {}, {}, {}   # ôm nhầm: vẽ nhưng chỉ ở trận KHÔNG có ụ đó / chỉ được tải (không vẽ bằng GL) / không hề được xin
    sot = {}
    for id, ds in tinh['u'].items():
        ms = cua_u.get(id, set())
        for a in ds:
            if a in u.get(id, {}) or a in dau: continue
            if ve.get(a) and not (set(ve[a]) & ms): om_khac.setdefault(id, []).append(a)
            elif ve.get(a): pass   # vẽ ở trận có ụ nhưng gán là dùng chung / ụ khác
            elif yc.get(a, set()) & ms: om_yc.setdefault(id, []).append(a)
            else: om_khong.setdefault(id, []).append(a)
        for a in u.get(id, {}):
            if a not in ds: sot.setdefault(id, []).append(a)
    om_trum, sot_trum = {}, {}
    for id, ds in tinh['trum'].items():
        for a in ds:
            if a not in trum.get(id, {}): om_trum.setdefault(id, []).append(a)
        for a in trum.get(id, {}):
            if a not in ds: sot_trum.setdefault(id, []).append(a)
    dc = set(tinh.get('dung_chung', {}))
    chung_thuc = set(dau) | set(nen) | set(hiem)
    dc_khong_ve = sorted(a for a in dc if a not in ve and not any(a in t['anh'] for t in trumT.values()))
    chung_sot = sorted(a for a in chung_thuc if a not in dc and a not in chu_tinh)

    px = lambda a, L: ((co.get(a, [0, 0])[0] >> L) * (co.get(a, [0, 0])[1] >> L) * 4) / 1048576
    mb = lambda ds: round(sum(px(a, (v[0] if isinstance(v, tuple) else v)) for a, v in ds.items()), 1)
    kq = {
        'ghi_chu': 'Ảnh THỰC được vẽ bằng lớp GL trong các trận bot (tools/thap-kt-nap-truoc.js MODE=gt → tools/thap-nong-meta.py). { tên: tầng nét nhất (0 = nguyên cỡ) ở k = REN.s × REN.dpr = k }. Không sửa tay — sinh lại bằng tools/thap-nong-meta.py sinh.',
        'sinh_luc': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%MZ'), 'k': k0, 'so_tran_luoi': N, 'so_tran_trum': len(trumT),
        'u': u, 'trum': trum, 'chihuy': mv, 'dung_chung_dau': dau, 'dung_chung_nen': {a: nen[a][0] for a in nen_ds}, 'dung_chung_hiem': {a: {'tang': v[0], 'tran': v[1]} for a, v in sorted(hiem.items())},
        'quai': quai, 'chu': chu,
        'doi_chieu_tinh': {'om_nham_ve_o_tran_khac': om_khac, 'om_nham_chi_tai_khong_ve': om_yc, 'om_nham_khong_xin': om_khong, 'sot': sot, 'trum_om_nham': om_trum, 'trum_sot': sot_trum,
                           'dung_chung_tinh_khong_ve': dc_khong_ve, 'dung_chung_thuc_khong_co_trong_tinh': chung_sot},
    }
    json.dump(kq, open(F_KQ, 'w', encoding='utf8'), ensure_ascii=False, indent=0, sort_keys=True)

    # ---------- bảng cho game ----------
    js = {'k': k0, 'u': {id: chuoi(ds, id) for id, ds in u.items() if ds}, 'mv': {id: chuoi(ds, id) for id, ds in sorted(mv.items()) if ds},
          'trum': {id: chuoi(ds, id) for id, ds in trum.items() if ds}, 'dau': chuoi(dau), 'nen': ','.join(a + (':%d' % nen[a][0] if nen[a][0] else '') for a in nen_ds), 'kq': '', 'chu': chu}
    than = json.dumps(js, ensure_ascii=False, separators=(',', ':'))
    open(F_JS, 'w', encoding='utf8').write(
        '// TURRET MERGE — BẢNG NẠP SẴN texture (napsan.js). SINH TỰ ĐỘNG bằng tools/thap-nong-meta.py từ docs/demo-hop-tuong/tuvan/webgl/ANH-THUC-DUNG-TRAN.json — KHÔNG SỬA TAY.\n'
        "// k = REN.s × REN.dpr lúc đo · 'tên:tầng,…' ('~' = id của mục; không ghi tầng = 0) · u = theo ụ · mv = chỉ huy · trum = trùm · dau = chung (màn mở đầu) · nen = chung (nạp nền) · chu = tờ ký tự\n"
        'const NONG_META = ' + than + ';\n')

    # ---------- báo cáo ----------
    dem = lambda d: sum(len(v) for v in d.values())
    so_u = sorted(((len(ds), id) for id, ds in u.items()))
    L = []
    L.append('# ẢNH THỰC DÙNG (trận bot) ↔ QUÉT TĨNH `THONG-KE-HIEU-UNG.json`\n')
    L.append('> Sinh tự động: `python3 tools/thap-nong-meta.py sinh` (%s). Dữ liệu thô: `ANH-THUC-DUNG-TRAN.json` · máy đọc: `ANH-THUC-DUNG.json` · bảng game: `thap/js/nong-meta.js` (%d KB).\n' % (kq['sinh_luc'], len(than) // 1024 + 1))
    L.append('- Trận: %d trận lưới (mỗi ụ ở ≥ 2 trận, 2 bộ × 5 ụ, co-op, wave 20 → ~%s, đặt thẳng 7★ / 5★ + bot triệu hồi – ghép, chỉ huy dùng mỗi ~12 s) + %d trận ép trùm. k = %s.' % (N, max((t.get('wave') or 0) for t in luoi.values()) if luoi else '?', len(trumT), k0))
    L.append('- Ảnh khác nhau được vẽ bằng lớp GL: **%d** (không kể dải quái / trùm: %d).' % (len(ve), len([a for a in ve if not LA_QUAI.match(a) and not LA_TRUM.match(a)])))
    L.append('- Gán: theo ụ **%d** lượt (%d ụ có ảnh; ít nhất %s, nhiều nhất %s) · chỉ huy %d · trùm %d · dùng chung đầu trận `dau` **%d** (%.1f MB ở tầng đo) · nạp nền `nen` **%d** (%.1f MB) · hiếm (không nạp trước) %d.' % (
        dem(u), len([1 for ds in u.values() if ds]), so_u[0] if so_u else '', so_u[-1] if so_u else '', dem(mv), dem(trum), len(dau), mb(dau), len(nen), mb(nen), len(hiem)))
    mbu = sorted((mb(ds), id) for id, ds in u.items())
    if mbu: L.append('- MB texture / ụ ở tầng đo (k = %s): trung vị %.1f · lớn nhất %s.' % (k0, mbu[len(mbu) // 2][0], ', '.join('%s %.1f' % (i, m) for m, i in mbu[-5:][::-1])))
    L.append('\n## Quét tĩnh ÔM NHẦM / THỪA (có trong `u[id]` tĩnh, không vào bảng của ụ đó)\n')
    L.append('| loại | số lượt | ví dụ |\n|---|---|---|')
    vd = lambda d, n=10: ', '.join('`%s`→%s' % (a, id) for id, ds in sorted(d.items()) for a in ds[:2])[:900]
    L.append('| được vẽ, nhưng CHỈ ở trận không có ụ đó (ôm nhầm tên) | %d | %s |' % (dem(om_khac), vd(om_khac)))
    L.append('| chỉ được TẢI ở trận có ụ, không vẽ bằng lớp GL (DOM / thẻ / ghép vào canvas khác / chưa tới trạng thái) | %d | %s |' % (dem(om_yc), vd(om_yc)))
    L.append('| không hề được xin trong trận có ụ | %d | %s |' % (dem(om_khong), vd(om_khong)))
    L.append('\n## Quét tĩnh SÓT (được vẽ, gán cho ụ, không có trong `u[id]` tĩnh): %d lượt\n' % dem(sot))
    for id, ds in sorted(sot.items()): L.append('- `%s`: %s' % (id, ', '.join('`%s`' % a for a in sorted(ds))))
    L.append('\n## Trùm\n')
    L.append('- Ôm nhầm / không vẽ (%d): %s' % (dem(om_trum), '; '.join('%s: %s' % (id, ', '.join(ds)) for id, ds in sorted(om_trum.items()))))
    L.append('- Sót (%d): %s' % (dem(sot_trum), '; '.join('%s: %s' % (id, ', '.join(sorted(ds))) for id, ds in sorted(sot_trum.items()))))
    L.append('\n## Dùng chung\n')
    L.append('- `dung_chung` tĩnh %d ảnh — không được vẽ ở trận nào: %d (%s…)' % (len(dc), len(dc_khong_ve), ', '.join(dc_khong_ve[:25])))
    L.append('- Vẽ thật, dùng chung, quét tĩnh không ghi (không ở `dung_chung` lẫn `u`): %d (%s)' % (len(chung_sot), ', '.join(chung_sot[:60])))
    L.append('- `dau` (màn mở đầu): %s' % ', '.join(sorted(dau)))
    L.append('- `nen` (nạp nền, theo thứ tự): %s' % ', '.join(nen_ds))
    L.append('- hiếm, không nạp trước: %s' % ', '.join('%s (%s)' % (a, '/'.join(v[1])) for a, v in sorted(hiem.items())))
    L.append('\n## Ngoại lệ ghi tay (`tools/thap-nong-ngoai-le.json`)\n')
    L.append('```json\n' + json.dumps(nl, ensure_ascii=False, indent=1) + '\n```')
    L.append('\n## Giới hạn\n')
    L.append('- Mỗi ụ chỉ có 2 trận × 60 s (wave 20 → ~32): hiệu ứng rất hiếm (tỉ lệ thấp, cần tổ hợp ụ đặc biệt, wave > 35) có thể chưa xuất hiện → vẫn tải ở lần dùng đầu như trước (napsan.js không chặn gì).')
    L.append('- Gán theo lưới: ảnh do TƯƠNG TÁC 2 ụ cùng trận sinh ra được gán cho ụ có mặt ở cả 2 trận thấy nó; ảnh chỉ thấy 1 trận mà quét tĩnh không ghi chủ → `hiem`.')
    L.append('- Tầng đo ở k = %s (DPR 1); máy thật k lớn hơn → napsan.js hạ tầng theo log2(k / k đo) (nạp nét hơn, không bao giờ thô hơn cần).' % k0)
    open(F_MD, 'w', encoding='utf8').write('\n'.join(L) + '\n')
    print('sinh: u %d lượt · trùm %d · mv %d · dau %d (%.1f MB) · nen %d (%.1f MB) · hiếm %d · chu %d · nong-meta.js %d B' % (dem(u), dem(trum), dem(mv), len(dau), mb(dau), len(nen), mb(nen), len(hiem), len(chu), len(than)))
    print('ôm nhầm: trận khác %d · chỉ tải %d · không xin %d · sót %d · trùm ôm %d sót %d' % (dem(om_khac), dem(om_yc), dem(om_khong), dem(sot), dem(om_trum), dem(sot_trum)))


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == 'gom': gom(sys.argv[2])
    elif len(sys.argv) >= 2 and sys.argv[1] == 'sinh': sinh()
    else: print(__doc__ or 'dùng: gom <thư mục> | sinh')
