"""Bước 6 (v2): đo đạc chu kỳ chạy → ../so-lieu.json + ../chay/bieu-do-*.png + ../chay/van-toc-ung.csv

1. VẬN TỐC NGANG của điểm vật chất đang chạm đất (ủng chịu lực) so với tốc độ đất trôi: phải bằng nhau
   (không trượt, không khựng). Đo bằng ma trận rig thật (world_mats), không dùng lại công thức đã tính.
2. Vận tốc DỌC điểm chạm (phải ≈ 0: không lún, không nảy) và khe hở ủng ↔ đất.
3. Chỗ vào/rời đất: vận tốc pivot ủng bên trái/phải mốc (nhảy vận tốc = giật).
4. Vòng nối khung cuối → đầu: vị trí & vận tốc mọi nút ở φ = 1⁻ và 0⁺; gia tốc rời rạc ở chỗ nối so với
   các khung khác.
5. Vượt biên (overshoot) từng kênh nội suy.
6. Tay sau còn thấy bao nhiêu % ở 112 px (v1 ↔ v2); dao chồng ủng; khe hở hai ủng khi bay.
Đơn vị in ra: px logic (Lam cao 112) / giây, trừ khi ghi 'px ảnh ngang'."""
import os
import csv
import json
import importlib.util
import numpy as np
from PIL import Image
from chung import RIG, CHAY, SO_LIEU, V1_DIR, load_json, save_json
from rig import world_mats, piece_matrix, tiep_dat, render
import chu_ky
from chu_ky import make_pose, KENH, DUTY, V_DAT, CHU_KY_S, SO_KHUNG, PHA_TU_THE, chuan_bi_ung

UNG = ('ung-gan', 'ung-xa')
PHA_UNG = {'ung-gan': 0.0, 'ung-xa': 0.5}
MAU = {'ung-gan': '#2a78d6', 'ung-xa': '#eb6834'}
TEN = {'ung-gan': 'ủng gần', 'ung-xa': 'ủng xa'}


def the_gioi(rig, pose, ten, p_rel):
    """điểm p_rel (so với pivot, toạ độ mảnh) của nút ten → thế giới, qua ma trận rig thật."""
    nd_ = rig['nut'][ten]
    W = piece_matrix(nd_, world_mats(rig, pose)[ten])
    q = W @ np.array([nd_['pivot'][0] + p_rel[0], nd_['pivot'][1] + p_rel[1], 1.0])
    return q[:2]


def tai_v1():
    spec = importlib.util.spec_from_file_location('rig_v1', os.path.join(V1_DIR, 'rig_v1.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m, json.load(open(os.path.join(V1_DIR, 'lam-moi.json'), encoding='utf-8'))


def ty_le_thay(alpha_all_khac, alpha_tay):
    a = alpha_tay.astype(float) / 255
    o = alpha_all_khac.astype(float) / 255
    return float((a * (1 - o)).sum() / max(a.sum(), 1e-6))


def main(doc=None, K=None):
    from khung import khung_co_dinh
    os.makedirs(CHAY, exist_ok=True)
    doc = doc or load_json()
    rig = doc['rig']
    chuan_bi_ung(rig)
    K = K or khung_co_dinh(doc)
    k = K['k112']
    g = rig['mat_dat_y']
    T = CHU_KY_S
    v_dat = V_DAT / T * k                                   # px logic / s
    eps = 2e-4
    N = 640
    phis = np.arange(N) / N
    sl = {'don_vi': 'px logic (Lam cao 112) / giây, trừ khi ghi khác', 'he_so_112': round(k, 5),
          'cao_nghi_px_anh_ngang': round(K['cao_nghi'], 1), 'chu_ky_s': T, 'so_khung': SO_KHUNG,
          'toc_do_dat_px_logic_s': round(v_dat, 2),
          'toc_do_dat_px_logic_moi_khung': round(v_dat * T / SO_KHUNG, 3)}

    # ---------------- 1–2. điểm chạm
    rows = []
    bang = {}
    for ten in UNG:
        trot, doc_v, kh = [], [], []
        for phi in phis:
            pha = (phi + PHA_UNG[ten]) % 1
            pose, tt = make_pose(rig, phi)
            th = tt[ten]['goc']
            h, c = tiep_dat(rig, ten, th)
            pc = the_gioi(rig, pose, ten, c)                    # điểm thấp nhất (thế giới)
            khe = (g - pc[1]) * k
            p1, _ = make_pose(rig, phi + eps)
            p0, _ = make_pose(rig, phi - eps)
            v = (the_gioi(rig, p1, ten, c) - the_gioi(rig, p0, ten, c)) / (2 * eps * T) * k
            piv1 = the_gioi(rig, p1, ten, (0, 0))
            piv0 = the_gioi(rig, p0, ten, (0, 0))
            vp = (piv1 - piv0) / (2 * eps * T) * k
            cl = tt[ten]['chiu_luc']
            rows.append({'ung': ten, 'pha_chu_ky': round(phi, 5), 'pha_ung': round(pha, 5), 'chiu_luc': cl,
                         'vx_diem_cham': round(v[0], 3), 'vy_diem_cham': round(v[1], 3),
                         'vx_pivot': round(vp[0], 3), 'vy_pivot': round(vp[1], 3), 'khe_ho_dat': round(khe, 4),
                         'goc': round(th, 3)})
            if cl:
                trot.append(v[0] + v_dat)
                doc_v.append(v[1])
                kh.append(khe)
        trot, doc_v, kh = map(np.array, (trot, doc_v, kh))
        # trượt tích luỹ suốt pha chịu lực (px logic) = ∫ (v_chạm − v_đất) dt
        dt = T / N
        bang[ten] = {'so_mau_chiu_luc': int(len(trot)),
                     'vx_diem_cham_tb': round(float(np.mean(trot - v_dat)), 3),
                     'lech_vx_lon_nhat': round(float(np.max(np.abs(trot))), 3),
                     'lech_vx_lon_nhat_phan_tram': round(float(np.max(np.abs(trot)) / v_dat * 100), 2),
                     'truot_tich_luy_px_logic': round(float(np.sum(trot) * dt), 4),
                     'vy_diem_cham_lon_nhat': round(float(np.max(np.abs(doc_v))), 3),
                     'khe_ho_lon_nhat_khi_chiu_luc_px_logic': round(float(np.max(np.abs(kh))), 4)}
    sl['ung_chiu_luc'] = bang
    with open(os.path.join(CHAY, 'van-toc-ung.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # theo khung (32): dịch chuyển điểm chạm mỗi khung so với vạch đất
    theo_khung = []
    dphi = 1 / SO_KHUNG
    for i in range(SO_KHUNG):
        phi = i * dphi
        pose, tt = make_pose(rig, phi)
        pn, _ = make_pose(rig, phi + dphi)
        r = {'khung': i, 'ms': round(phi * T * 1000, 1)}
        for ten in UNG:
            if tt[ten]['chiu_luc'] and ((phi + dphi + PHA_UNG[ten]) % 1) <= DUTY + 1e-9:
                _, c = tiep_dat(rig, ten, tt[ten]['goc'])
                dx = (the_gioi(rig, pn, ten, c)[0] - the_gioi(rig, pose, ten, c)[0]) * k
                r[ten] = round(dx, 3)
        theo_khung.append(r)
    sl['dich_diem_cham_moi_khung_px_logic'] = {'dat_troi': round(-v_dat * T / SO_KHUNG, 3), 'khung': theo_khung}

    # ---------------- 3. vào / rời đất
    def v_piv(phi, ten, side):
        a, b = (phi - 1e-4, phi) if side < 0 else (phi, phi + 1e-4)
        pa, _ = make_pose(rig, a)
        pb, _ = make_pose(rig, b)
        return (the_gioi(rig, pb, ten, (0, 0)) - the_gioi(rig, pa, ten, (0, 0))) / (1e-4 * T) * k
    vao = {}
    for ten in UNG:
        for ten_moc, pha_moc in (('cham_dat', 0.0), ('roi_dat', DUTY)):
            phi = (pha_moc - PHA_UNG[ten]) % 1
            l, r = v_piv(phi, ten, -1), v_piv(phi, ten, +1)
            vao[f'{ten}_{ten_moc}'] = {'v_truoc': [round(x, 2) for x in l], 'v_sau': [round(x, 2) for x in r],
                                       'nhay_van_toc': round(float(np.hypot(*(l - r))), 3)}
    sl['vao_roi_dat'] = vao

    # ---------------- 4. vòng nối
    nodes = [n for n in rig['nut']]

    def vitri(phi):
        p, _ = make_pose(rig, phi)
        m = world_mats(rig, p)
        return np.array([[m[n][0, 2], m[n][1, 2], np.degrees(np.arctan2(m[n][1, 0], m[n][0, 0]))] for n in nodes])
    a1, a0 = vitri(1 - 1e-6), vitri(0.0)
    vl = (vitri(1 - 1e-6) - vitri(1 - 1e-4)) / (1e-4 - 1e-6)
    vr = (vitri(1e-4) - vitri(0.0)) / 1e-4
    F = np.array([vitri(i / SO_KHUNG) for i in range(SO_KHUNG)])
    acc = np.array([F[(i + 1) % SO_KHUNG] - 2 * F[i] + F[i - 1] for i in range(SO_KHUNG)])   # gia tốc rời rạc
    acc_xy = np.hypot(acc[..., 0], acc[..., 1])
    sl['vong_noi'] = {
        'nhay_vi_tri_lon_nhat_px_anh_ngang': round(float(np.max(np.abs(a1[:, :2] - a0[:, :2]))), 5),
        'nhay_goc_lon_nhat_do': round(float(np.max(np.abs(a1[:, 2] - a0[:, 2]))), 5),
        'nhay_van_toc_lon_nhat_px_logic_s': round(float(np.max(np.abs(vl[:, :2] - vr[:, :2])) / T * k), 4),
        'gia_toc_roi_rac_tai_khung_0_px_logic': round(float(acc_xy[0].max() * k), 4),
        'gia_toc_roi_rac_lon_nhat_ca_chu_ky_px_logic': round(float(acc_xy.max() * k), 4),
        'khung_co_gia_toc_lon_nhat': int(np.argmax(acc_xy.max(1))),
        'ghi_chu': 'gia tốc rời rạc = |p(k+1) − 2p(k) + p(k−1)| của gốc từng nút; khung 0 dùng khung 31 và 1 '
                   '→ nếu vòng nối giật thì khung 0 sẽ nổi bật'}

    # ---------------- 5. vượt biên
    sl['vuot_bien_noi_suy_px_hoac_do'] = {kk: round(v.kiem_vuot(), 6) for kk, v in KENH.items()}

    # ---------------- 6. tay sau / dao–ủng / bay (đo ở 112 px)
    s112 = k
    box = K['khung']
    vis, dao_ung, bay = {}, {}, {}
    for i, p in enumerate(doc['chu_ky']['khung']):
        tay = np.array(render(rig, p, box, s112, only=['tay-sau']))[..., 3]
        khac = np.array(render(rig, p, box, s112, an=('tay-sau',)))[..., 3]
        vis[i] = round(ty_le_thay(khac, tay) * 100, 1)
        dao = np.array(render(rig, p, box, 1.0, only=['tay-truoc-dao']))[..., 3] > 128
        ung = np.array(render(rig, p, box, 1.0, only=list(UNG)))[..., 3] > 128
        dao_ung[i] = int((dao & ung).sum())
        if not any(p['_ung'][t]['chiu_luc'] for t in UNG):
            kh = []
            for t in UNG:
                h, c = tiep_dat(rig, t, p['_ung'][t]['goc'])
                kh.append(round(float((g - the_gioi(rig, p, t, c)[1]) * k), 2))
            bay[i] = kh
    sl['tay_sau_thay_phan_tram_112px'] = {'theo_khung': vis, 'nho_nhat': min(vis.values()),
                                          'tu_the': {n: vis[int(round(v * SO_KHUNG))] for n, v in PHA_TU_THE.items()}}
    sl['dao_chong_ung_px_anh_ngang'] = {'lon_nhat': max(dao_ung.values()), 'theo_khung': dao_ung}
    sl['khe_ho_khi_bay_px_logic'] = {'theo_khung_[gan,xa]': bay,
                                     'nho_nhat': min(min(v) for v in bay.values()) if bay else None}
    # v1 cùng phép đo (4 tư thế)
    try:
        r1, d1 = tai_v1()
        v1 = {}
        for n in PHA_TU_THE:
            tay = np.array(r1.render(d1['rig'], d1['tu_the'][n], box, s112, rig_dir=V1_DIR, only=['tay-sau'])[0])[..., 3]
            khac_names = [x for x in d1['rig']['thu_tu_ve'] if x != 'tay-sau']
            khac = np.array(r1.render(d1['rig'], d1['tu_the'][n], box, s112, rig_dir=V1_DIR, only=khac_names)[0])[..., 3]
            v1[n] = round(ty_le_thay(khac, tay) * 100, 1)
        sl['tay_sau_thay_phan_tram_112px']['v1_tu_the'] = v1
    except Exception as e:                                  # noqa: BLE001
        sl['tay_sau_thay_phan_tram_112px']['v1_loi'] = str(e)

    # biên độ giữ như v1
    p_all = doc['chu_ky']['khung']
    than_dy = [p['than']['dich'][1] for p in p_all]
    sl['bien_do'] = {
        'than_nhun_thap_nhat_px_logic': round(max(than_dy) * k, 2),
        'than_cao_nhat_px_logic': round(-min(than_dy) * k, 2),
        'tay_dao_vung_do': [round(min(p['vai-truoc']['goc'] for p in p_all), 2),
                            round(max(p['vai-truoc']['goc'] for p in p_all), 2)],
        'sai_diem_cham_px_anh_ngang': 'xem chu_ky.kenh.ung_x_*',
        'chop_mu_do': [round(min(p['chop-mu']['goc'] for p in p_all), 2),
                       round(max(p['chop-mu']['goc'] for p in p_all), 2)]}
    ux = KENH['ung_x_ung-gan']
    sl['bien_do']['pivot_ung_khi_chiu_luc_px_anh_ngang'] = [round(float(ux.xs[0]), 1), round(float(ux.xs[-1]), 1)]
    save_json(sl, SO_LIEU)
    ve_bieu_do(rows, sl, v_dat, k)
    print(json.dumps({kk: sl[kk] for kk in ('ung_chiu_luc', 'vao_roi_dat', 'vong_noi', 'bien_do')},
                     ensure_ascii=False, indent=1))
    print('tay sau thấy (%):', sl['tay_sau_thay_phan_tram_112px']['tu_the'],
          'v1:', sl['tay_sau_thay_phan_tram_112px'].get('v1_tu_the'), 'min', sl['tay_sau_thay_phan_tram_112px']['nho_nhat'])
    print('khe hở bay min', sl['khe_ho_khi_bay_px_logic']['nho_nhat'], 'dao–ủng max', sl['dao_chong_ung_px_anh_ngang']['lon_nhat'])
    return sl


def ve_bieu_do(rows, sl, v_dat, k):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.edgecolor': '#b0afaa',
                         'axes.labelcolor': '#52514e', 'xtick.color': '#52514e', 'ytick.color': '#52514e',
                         'axes.spines.top': False, 'axes.spines.right': False, 'figure.facecolor': '#fcfcfb',
                         'axes.facecolor': '#fcfcfb', 'axes.grid': True, 'grid.color': '#e6e5e0', 'grid.linewidth': 0.8})
    T = CHU_KY_S
    fig, axs = plt.subplots(3, 1, figsize=(12, 11), sharex=True)
    for ten in UNG:
        R_ = [r for r in rows if r['ung'] == ten]
        t = np.array([r['pha_chu_ky'] for r in R_]) * T * 1000
        cl = np.array([r['chiu_luc'] for r in R_])
        vx = np.array([r['vx_diem_cham'] for r in R_])
        vxp = np.array([r['vx_pivot'] for r in R_])
        kh = np.array([r['khe_ho_dat'] for r in R_])
        # vùng chịu lực
        on = np.nonzero(cl)[0]
        if len(on):
            for seg in np.split(on, np.nonzero(np.diff(on) > 1)[0] + 1):
                for ax in axs:
                    ax.axvspan(t[seg[0]], t[seg[-1]], color=MAU[ten], alpha=0.08, lw=0)
        axs[0].plot(t, np.where(cl, vx, np.nan), color=MAU[ten], lw=2, label=f'{TEN[ten]} – điểm chạm (chịu lực)')
        axs[1].plot(t, vxp, color=MAU[ten], lw=2, label=f'{TEN[ten]} – giữa đế')
        axs[2].plot(t, kh, color=MAU[ten], lw=2, label=TEN[ten])
    for ax in axs[:2]:
        ax.axhline(-v_dat, color='#52514e', lw=1.2, ls='--')
    axs[0].text(5, -v_dat + 4, f'tốc độ đất trôi = −{v_dat:.1f} px logic/s', color='#52514e', fontsize=10)
    lo = -v_dat
    axs[0].set_ylim(lo - 25, lo + 25)
    axs[0].set_ylabel('vx điểm chạm\n(px logic / s)')
    axs[0].set_title('Ủng chịu lực: vận tốc ngang điểm đang chạm đất phải nằm trên vạch đứt (không trượt/khựng)',
                     loc='left', fontsize=12, color='#0b0b0b')
    axs[1].set_ylabel('vx giữa đế\n(px logic / s)')
    axs[1].set_title('Vận tốc ngang giữa đế cả chu kỳ (liên tục khi vào/rời đất – không nhảy vận tốc)', loc='left',
                     fontsize=12, color='#0b0b0b')
    axs[2].set_ylabel('khe hở ↔ đất\n(px logic)')
    axs[2].set_title('Điểm thấp nhất của ủng cách đất (0 = chạm). Vùng tô màu = ủng đó đang chịu lực', loc='left',
                     fontsize=12, color='#0b0b0b')
    axs[2].set_xlabel('thời gian trong chu kỳ (ms) – 0,64 s')
    for ax in axs:
        ax.legend(loc='upper right', frameon=False, fontsize=10)
        ax.set_xlim(0, T * 1000)
    fig.tight_layout()
    fig.savefig(os.path.join(CHAY, 'bieu-do-van-toc-ung.png'), dpi=110)
    plt.close(fig)

    # vòng nối: 2 chu kỳ liền, đánh dấu chỗ nối
    doc = load_json()
    rig = doc['rig']
    ph = np.linspace(-0.3, 1.3, 801)
    keys = [('ung-gan', 'x'), ('ung-gan', 'y'), ('ung-xa', 'x'), ('ung-xa', 'y'), ('than', 'y'), ('tay-truoc-dao', 'x'),
            ('tay-sau', 'x')]
    data = {kk: [] for kk in keys}
    for p_ in ph:
        pose, _ = make_pose(rig, p_)
        m = world_mats(rig, pose)
        for n, ax_ in keys:
            data[(n, ax_)].append(m[n][0 if ax_ == 'x' else 1, 2] * k)
    fig, axs = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
    cols = {'ung-gan': '#2a78d6', 'ung-xa': '#eb6834', 'than': '#1baf7a', 'tay-truoc-dao': '#6250d6', 'tay-sau': '#e87ba4'}
    nm = {'ung-gan': 'ủng gần', 'ung-xa': 'ủng xa', 'than': 'thân', 'tay-truoc-dao': 'tay dao', 'tay-sau': 'tay sau'}
    for (n, ax_), v in data.items():
        v = np.array(v)
        a = axs[0] if ax_ == 'x' else axs[1]
        a.plot(ph * T * 1000, v - v.mean(), color=cols[n], lw=2, label=nm[n])
        kf = np.arange(-9, 42) / SO_KHUNG
        kf = kf[(kf >= ph[0]) & (kf <= ph[-1])]
        a.plot(kf * T * 1000, np.interp(kf, ph, v - v.mean()), 'o', ms=4, color=cols[n])
    for a, lab in ((axs[0], 'x (px logic, trừ trung bình)'), (axs[1], 'y (px logic, trừ trung bình; + = xuống)')):
        for x in (0, T * 1000):
            a.axvline(x, color='#e34948', lw=1.2, ls='--')
        a.set_ylabel(lab)
        a.legend(loc='upper right', frameon=False, fontsize=10, ncol=5)
    vn = sl['vong_noi']
    axs[0].set_title(f'Vòng nối cuối → đầu (vạch đỏ = chỗ nối 640 ms ↔ 0 ms). Nhảy vị trí '
                     f'{vn["nhay_vi_tri_lon_nhat_px_anh_ngang"]:.4f} px, nhảy vận tốc '
                     f'{vn["nhay_van_toc_lon_nhat_px_logic_s"]:.3f} px logic/s; chấm = 32 khung GIF',
                     loc='left', fontsize=12, color='#0b0b0b')
    axs[1].set_xlabel('thời gian (ms), hơn một chu kỳ')
    fig.tight_layout()
    fig.savefig(os.path.join(CHAY, 'bieu-do-vong-noi.png'), dpi=110)
    plt.close(fig)


if __name__ == '__main__':
    main()
