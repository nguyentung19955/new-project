"""Đối chiếu tốc độ chạy của rig với code di chuyển của game (KHÔNG sửa game).

Đọc tieng-vong-cuoi-cung/game/demo.html (nếu có, đường dẫn tương đối từ rig-v3) để lấy:
  P.runSpeed (px logic / bước logic), DT = 1000/60 (bước logic cố định 60/giây), W×H logic;
  anim/lam-chibi.json → chiều cao Lam cũ (moc idle/1 'dinh') và nhịp clip 'run' cũ.
Không tìm thấy file → dùng số đã ghi lúc làm v3 (GHI_SAN) và ghi rõ nguồn."""
import os
import re
import json
from chung import RIG

GAME = os.path.normpath(os.path.join(RIG, '..', '..', '..', '..', 'game'))
GHI_SAN = {'runSpeed': 4.4, 'buoc_logic_moi_s': 60.0, 'W': 960, 'H': 540, 'accelFrames': 6, 'decelFrames': 5,
           'lam_cu_cao_px_logic': 161.7, 'run_cu_so_khung': 8, 'run_cu_ms_moi_khung': 83}


def doc_game():
    p = os.path.join(GAME, 'demo.html')
    if not os.path.isfile(p):
        return dict(GHI_SAN, nguon='GHI SẴN lúc làm v3 (không tìm thấy game/demo.html)')
    s = open(p, encoding='utf-8').read()
    out = {'nguon': 'đọc trực tiếp game/demo.html + game/anim/lam-chibi.json'}
    out['runSpeed'] = float(re.search(r'runSpeed\s*:\s*([\d.]+)', s).group(1))
    out['accelFrames'] = int(re.search(r'accelFrames\s*:\s*(\d+)', s).group(1))
    out['decelFrames'] = int(re.search(r'decelFrames\s*:\s*(\d+)', s).group(1))
    m = re.search(r'const DT\s*=\s*1000\s*/\s*(\d+)', s)
    out['buoc_logic_moi_s'] = float(m.group(1))
    m = re.search(r'const W\s*=\s*(\d+)\s*,\s*H\s*=\s*(\d+)', s)
    out['W'], out['H'] = int(m.group(1)), int(m.group(2))
    out['dong_code'] = {
        'runSpeed': 'const P = { runSpeed:%g, ... }' % out['runSpeed'],
        'van_toc': 'updatePlayer(): target = dir*P.runSpeed; pl.vx = approach(pl.vx, target, runSpeed/accelFrames); '
                   'moveX(pl, pl.vx) – mỗi bước logic',
        'vong_lap': 'const DT=1000/60 … while(accT>=DT) step() – 60 bước logic/giây, độc lập tần số màn hình',
        'anim_cu': "lamChibi(): ten='run' khi |vx|>0,6; khung = animK(A.run, CH.t) – theo SỐ BƯỚC, không theo vx",
    }
    pj = os.path.join(GAME, 'anim', 'lam-chibi.json')
    if os.path.isfile(pj):
        a = json.load(open(pj, encoding='utf-8'))
        out['lam_cu_cao_px_logic'] = round(-float(a['moc']['idle/1']['dinh']), 1)
        run = a['anims']['run']['buoc']
        out['run_cu_so_khung'] = len(run)
        out['run_cu_ms_moi_khung'] = run[0]['ms']
    else:
        for k in ('lam_cu_cao_px_logic', 'run_cu_so_khung', 'run_cu_ms_moi_khung'):
            out[k] = GHI_SAN[k]
    return out


def doi_chieu(v_rig, chu_ky_s, so_khung, cao=112):
    g = doc_game()
    v_game = g['runSpeed'] * g['buoc_logic_moi_s']
    quang = v_rig * chu_ky_s
    ck_game = quang / v_game
    return {
        'game': g,
        'don_vi': 'px logic (canvas logic %d×%d) / giây' % (g['W'], g['H']),
        'van_toc_chay_game_px_logic_s': round(v_game, 2),
        'cong_thuc_game': '%g px/bước × %g bước/s' % (g['runSpeed'], g['buoc_logic_moi_s']),
        'van_toc_chuan_rig_px_logic_s': round(v_rig, 2),
        'chu_ky_chuan_s': chu_ky_s,
        'quang_duong_moi_chu_ky_px_logic': round(quang, 2),
        'khop': abs(v_game - v_rig) / v_rig < 0.02,
        'lech_px_logic_s': round(v_game - v_rig, 2),
        'ty_le_game_chia_rig': round(v_game / v_rig, 4),
        'neu_phat_chu_ky_chuan_o_toc_do_game': {
            'chan_truot_px_logic_s': round(v_game - v_rig, 2),
            'chan_truot_px_logic_moi_buoc_chan': round((v_game - v_rig) * chu_ky_s / 2, 1)},
        'neu_phat_theo_quang_duong_o_toc_do_game': {
            'chu_ky_s': round(ck_game, 4), 'ms_moi_khung': round(ck_game * 1000 / so_khung, 2),
            'buoc_chan_moi_s': round(2 / ck_game, 2), 'khung_sheet_moi_buoc_logic': round(so_khung / (ck_game * g['buoc_logic_moi_s']), 2)},
        'theo_chieu_cao': {
            'game_chieu_cao_moi_s_lam_moi_112': round(v_game / cao, 2),
            'game_chieu_cao_moi_s_lam_cu': round(v_game / g['lam_cu_cao_px_logic'], 2),
            'rig_chuan_chieu_cao_moi_s': round(v_rig / cao, 2),
            'clip_run_cu': '%d khung × %d ms = %.3f s/chu kỳ, phát theo số bước (không theo vx)' % (
                g['run_cu_so_khung'], g['run_cu_ms_moi_khung'], g['run_cu_so_khung'] * g['run_cu_ms_moi_khung'] / 1000)},
        'ghi_chu': 'Hiển thị Lam mới cao 112 px logic (Lam cũ ~%g) nhưng tốc độ chạy là tốc độ thế giới, không đổi theo '
                   'cỡ nhân vật → so thẳng px logic/s. Chưa sửa demo.html.' % g['lam_cu_cao_px_logic'],
    }


if __name__ == '__main__':
    print(json.dumps(doi_chieu(130.72, 0.64, 32), ensure_ascii=False, indent=1))
