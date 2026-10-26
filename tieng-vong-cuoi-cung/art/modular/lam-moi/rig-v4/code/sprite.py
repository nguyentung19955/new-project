"""Bước 7 (MỚI ở v3): xuất SPRITE SHEET RGBA cho clip chạy → ../sprite/
  lam-chay-2x.png    v4: 30 khung (8 cột × 4 hàng, 2 ô cuối trống – giữ đúng cỡ sheet v3), mỗi ô CÙNG cỡ, CÙNG điểm neo (đất, giữa chân); không crop riêng khung;
                     không nền/chữ/đường đất. Độ phân giải 2x: Lam cao 224 px nguồn ở dáng nghỉ (game vẽ ½ → 112 px logic).
                     Tối 10 % tay sau + ủng xa đã nướng sẵn.
  lam-chay-2x.json   toạ độ từng khung, thời lượng, điểm neo, cỡ khung, scale, tốc độ chuẩn, cách giữ pha khi đổi tốc độ.
  kiem-sheet-ghep.gif            ghép lại từ CHÍNH sheet (cắt ô theo JSON, dán theo điểm neo lên nền + đường đất cố định)
  kiem-sheet-ghep-112px-x4.gif   như trên nhưng thu ½ (đúng 112 px logic) rồi phóng ×4
  kiem-sheet-luoi.png            sheet trên nền ô vuông + khung ô + dấu neo (ảnh kiểm, KHÔNG dùng trong game)
Nguồn chỉnh sửa vẫn là rig (lam-moi-v3.json); sheet chỉ là đầu ra."""
import os
import json
import numpy as np
from PIL import Image, ImageDraw
from chung import SPRITE, CAO_LOGIC, font, load_json, save_json, LAM_TOI
from rig import render
from khung import khung_co_dinh, thu_nho, NEN, DAT, GOC_MAU
from chay import luu_gif

TY_LE = 2                  # px nguồn / px logic
COT, HANG = 8, 4
KHE = 2                    # khe trong suốt giữa các ô (tránh lem khi vẽ có lọc)
LE = 6                     # lề (px sheet) quanh hộp bao mọi tư thế
O_V3 = (123, 234, 266, 241)  # neo x, neo y, rộng, cao ô của sheet rig-v3


def main(doc=None, K=None):
    os.makedirs(SPRITE, exist_ok=True)
    doc = doc or load_json()
    K = K or khung_co_dinh(doc)
    rig = doc['rig']
    ck = doc['chu_ky']
    S = TY_LE * K['k112']                                     # px sheet / px ảnh ngang
    g = rig['mat_dat_y']
    gx = rig['goc_the_gioi'][0]
    # hộp bao (thế giới) mọi khung chạy + dáng nghỉ, đo ở 1:1
    big = (-300.0, -200.0, 1600.0, 1400.0)
    bx = [1e9, 1e9, -1e9, -1e9]
    for p in ck['khung'] + [doc['tu_the_nghi']]:
        a = np.array(render(rig, p, big, 1.0, toi={}))[..., 3]
        ys, xs = np.nonzero(a > 2)
        bx = [min(bx[0], xs.min() + big[0]), min(bx[1], ys.min() + big[1]),
              max(bx[2], xs.max() + 1 + big[0]), max(bx[3], ys.max() + 1 + big[1])]
    # neo: x = gốc (giữa hai chân ở dáng nghỉ), y = mặt đất; cả hai rơi đúng ranh giới điểm ảnh của ô
    ax = int(np.ceil((gx - bx[0]) * S)) + LE
    ay = int(np.ceil((g - bx[1]) * S)) + LE
    fw = ax + int(np.ceil((bx[2] - gx) * S)) + LE
    fh = ay + max(int(np.ceil((bx[3] - g) * S)), 0) + LE
    # v4: giữ ĐÚNG ô + neo của sheet v3 (266×241, neo (123, 234)) nếu mọi tư thế vẫn vừa với lề ≥ 2 px → game thay clip
    # không đổi gì khác, dùng chung dáng nghỉ TẠM. Không vừa thì dùng ô tự tính (ghi rõ trong JSON).
    can = (int(np.ceil((gx - bx[0]) * S)), int(np.ceil((g - bx[1]) * S)), int(np.ceil((bx[2] - gx) * S)),
           max(int(np.ceil((bx[3] - g) * S)), 0))
    vx3, vy3, w3, h3 = O_V3
    if can[0] + 2 <= vx3 and can[1] + 2 <= vy3 and can[2] + 2 <= w3 - vx3 and can[3] + 2 <= h3 - vy3:
        ax, ay, fw, fh = vx3, vy3, w3, h3
        print('sprite: dùng ô + neo của v3', O_V3, '(cần', can, ')')
    else:
        print('sprite: KHÔNG vừa ô v3', O_V3, 'cần', can, '→ ô tự tính', (ax, ay, fw, fh))
    hop = (gx - ax / S, g - ay / S, gx + (fw - ax) / S, g + (fh - ay) / S)      # hộp thế giới của một ô
    W, H = COT * fw + (COT - 1) * KHE, HANG * fh + (HANG - 1) * KHE
    sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    frames = []
    for i, p in enumerate(ck['khung']):
        im = thu_nho(render(rig, p, hop, 1.0), (fw, fh))
        a = np.array(im)
        a[a[..., 3] == 0] = 0
        r, c = divmod(i, COT)
        x, y = c * (fw + KHE), r * (fh + KHE)
        sheet.paste(Image.fromarray(a, 'RGBA'), (x, y))
        frames.append({'i': i, 'x': x, 'y': y, 'w': fw, 'h': fh, 'ms': round(ck['ms_moi_khung'], 3),
                       'pha': round(p['_pha'], 5), 't_ms': round(p['_thoi_gian_s'] * 1000, 1),
                       'chiu_luc': {'ung-gan': p['_ung']['ung-gan']['chiu_luc'], 'ung-xa': p['_ung']['ung-xa']['chiu_luc']}})
    sheet.save(os.path.join(SPRITE, 'lam-chay-2x.png'), optimize=True)
    # chiều cao dáng nghỉ ở 2x (cùng cách vẽ)
    nghi = np.array(thu_nho(render(rig, doc['tu_the_nghi'], hop, 1.0), (fw, fh)))[..., 3]
    ys = np.nonzero((nghi > 128).any(1))[0]
    cao_nghi = int(ay - ys.min())
    v_logic = ck['van_toc_dat_px_moi_s'] * K['k112']
    quang = v_logic * ck['thoi_gian_s']
    from toc_do_game import doi_chieu
    dc = doi_chieu(v_logic, ck['thoi_gian_s'], ck['so_khung'])
    meta = {
        'ten': 'Lam – chạy nhanh (rig-v4, sải dài cho 264 px logic/s), sprite sheet 2x', 'phien_ban_clip': 'v4',
        'anh': 'lam-chay-2x.png', 'dinh_dang': 'PNG RGBA, alpha thẳng (không nhân trước); điểm trong suốt RGB = 0',
        'co_sheet': [W, H], 'luoi': {'cot': COT, 'hang': HANG, 'khe_px': KHE},
        'co_khung': [fw, fh],
        'diem_neo': {'x': ax, 'y': ay,
                     'y_nghia': 'toạ độ trong MỖI khung (tính từ góc trái-trên ô): x = giữa hai chân (gốc rig, cố định), '
                                'y = mặt đất (ranh giới điểm ảnh: hàng ay−1 là hàng thấp nhất của đế khi chạm đất). '
                                'Mọi khung cùng một điểm neo; không crop riêng khung.'},
        'ty_le': {'px_nguon_moi_px_logic': TY_LE, 've_trong_game': 'vẽ ở ½ cỡ nguồn',
                  'cao_dang_nghi_px_nguon': cao_nghi, 'cao_dang_nghi_px_logic': cao_nghi / TY_LE,
                  'he_so_px_anh_ngang_sang_px_nguon': round(S, 6),
                  'ghi_chu': 'một scale cố định cho mọi tư thế; dáng nghỉ cao %d px nguồn = %g px logic' % (cao_nghi, cao_nghi / TY_LE)},
        'hop_the_gioi_px_anh_ngang': [round(v, 6) for v in hop],
        'huong': 'Lam quay mặt sang PHẢI. Quay trái: lật ngang quanh điểm neo x (ctx.scale(-1,1) tại chân).',
        'lam_toi': dict(LAM_TOI, ghi_chu='tay sau + ủng xa đã tối 10 % sẵn trong sheet'),
        'frames': frames,
        'so_khung': len(frames),
        'thoi_luong': {'ms_moi_khung_o_toc_do_chuan': round(ck['ms_moi_khung'], 3), 'chu_ky_s': ck['thoi_gian_s'],
                       'lap': True, 'noi_vong': 'khung 31 → khung 0 liên tục (đo trong so-lieu.json → vong_noi)'},
        'toc_do_chuan': {'px_logic_moi_s': round(v_logic, 2), 'chu_ky_s': ck['thoi_gian_s'],
                         'quang_duong_moi_chu_ky_px_logic': round(quang, 3),
                         'buoc_chan_moi_chu_ky': 2, 'ty_le_cham_dat_moi_chan': ck['ty_le_cham_dat'],
                         'ghi_chu': 'ở tốc độ này chân chịu lực đứng yên so với đất (không trượt). v4 = tốc độ chạy game 264 px logic/s → ở đúng tốc độ game mỗi khung sheet 16,67 ms = 1 bước logic (4,4 px), chu kỳ 0,50 s, 4 bước chân/giây. Clip cũ rig-v3: 83,66 px/chu kỳ, 32 khung.'},
        'giu_pha_khi_doi_toc_do': {
            'cach': 'Phát theo QUÃNG ĐƯỜNG, không theo thời gian: giữ một biến pha ∈ [0,1) sống qua mọi khung. Mỗi bước '
                    'logic: pha = (pha + |vx| / QUANG) mod 1, với vx = px logic/bước, QUANG = quang_duong_moi_chu_ky_px_logic. '
                    'Khung = floor(pha × so_khung) (v4: 30). Đổi tốc độ (tăng/giảm tốc, va tường) chỉ đổi lượng cộng → pha liên tục, '
                    'không nhảy khung, chân không trượt ở MỌI tốc độ.',
            'ma_gia': 'lam.pha = (lam.pha + Math.abs(pl.vx) / %.3f) %% 1;  const k = Math.floor(lam.pha * %d);' % (quang, len(frames)),
            'tuong_duong_theo_thoi_gian': 'ms_moi_khung = %.3f × %.2f / |v (px logic/s)|' % (ck['ms_moi_khung'], v_logic),
            'vao_chay': 'từ đứng yên: đặt pha = 0 (khung 0 = ủng gần chạm đất) hoặc giữ pha cũ nếu vừa chạy',
            'luu_y': 'chọn khung trong bước logic 60 Hz (như game hiện tại), không theo số lần vẽ',
        },
        'hitbox': 'Hitbox / va chạm / vùng ăn đòn lấy từ GAMEPLAY (hộp cố định của nhân vật trong game, ví dụ pl.w×pl.h '
                  'hiện tại), KHÔNG theo bóng hình sprite đang nhún/vung tay. Sheet chỉ để vẽ.',
        'doi_chieu_toc_do_game': {k: dc[k] for k in ('van_toc_chay_game_px_logic_s', 'van_toc_chuan_rig_px_logic_s', 'khop',
                                                     'lech_px_logic_s', 'ty_le_game_chia_rig',
                                                     'neu_phat_theo_quang_duong_o_toc_do_game')},
        'nguon': 'sinh từ rig lam-moi-v4.json bằng code/sprite.py (vẽ 1:1 ảnh ngang rồi thu nhỏ một lần, LANCZOS '
                 'nhân alpha trước). Muốn sửa: sửa rig/bảng mốc rồi chạy lại – không sửa tay sheet.',
        'hieu_nang': 'chưa thử trên iPhone/Safari – không khẳng định hiệu năng',
    }
    save_json(meta, os.path.join(SPRITE, 'lam-chay-2x.json'))
    kiem(meta, doc, K)
    print('sprite:', W, 'x', H, 'ô', fw, 'x', fh, 'neo', ax, ay, 'cao nghỉ', cao_nghi)
    return meta


def kiem(meta, doc=None, K=None):
    """Ghép lại GIF từ chính sheet theo JSON (chứng minh cùng neo) + ảnh lưới."""
    sh = Image.open(os.path.join(SPRITE, meta['anh']))
    fw, fh = meta['co_khung']
    ax, ay = meta['diem_neo']['x'], meta['diem_neo']['y']
    # nền cố định: đường đất đỏ ở y = ay, tam giác gốc ở x = ax; vạch đất trôi đúng tốc độ (px nguồn/khung)
    v_khung = meta['toc_do_chuan']['px_logic_moi_s'] * TY_LE * meta['thoi_luong']['ms_moi_khung_o_toc_do_chuan'] / 1000
    buoc = meta['toc_do_chuan']['quang_duong_moi_chu_ky_px_logic'] * TY_LE / 4
    M = 20
    out, out112 = [], []
    for f in meta['frames']:
        o = sh.crop((f['x'], f['y'], f['x'] + fw, f['y'] + fh))
        bg = Image.new('RGBA', (fw + 2 * M, fh + 2 * M + 10), NEN + (255,))
        d = ImageDraw.Draw(bg)
        d.rectangle([0, M + ay, bg.width, M + ay + 1], fill=DAT)
        off = (-v_khung * f['i']) % buoc
        X = off - buoc
        while X < bg.width:
            d.rectangle([X, M + ay + 2, X + 3, M + ay + 7], fill=(90, 96, 110))
            X += buoc
        d.polygon([(M + ax, M + ay + 9), (M + ax - 4, M + ay + 15), (M + ax + 4, M + ay + 15)], fill=GOC_MAU)
        bg.alpha_composite(o, (M, M))
        bg = bg.convert('RGB')
        out.append(bg)
        s = bg.resize((bg.width // 2, bg.height // 2), Image.LANCZOS)
        out112.append(s.resize((s.width * 4, s.height * 4), Image.NEAREST))
    ms = max(20, int(round(meta['thoi_luong']['ms_moi_khung_o_toc_do_chuan'] / 10)) * 10)   # GIF: bội 10 ms, ≥ 20
    luu_gif(out, os.path.join(SPRITE, 'kiem-sheet-ghep.gif'), ms)
    luu_gif(out112, os.path.join(SPRITE, 'kiem-sheet-ghep-112px-x4.gif'), ms)
    # ảnh lưới
    T = 120
    C = Image.new('RGBA', (sh.width + 20, sh.height + 20 + T), (255, 255, 255, 255))
    o = 10
    for yy in range(0, sh.height, 16):
        for xx in range(0, sh.width, 16):
            if (xx // 16 + yy // 16) % 2:
                ImageDraw.Draw(C).rectangle([o + xx, T + yy, o + xx + 15, T + yy + 15], fill=(228, 230, 234, 255))
    C.alpha_composite(sh, (o, T))
    d = ImageDraw.Draw(C)
    d.text((10, 10), f'Kiểm sheet {meta["anh"]}: {sh.width}×{sh.height}, ô {fw}×{fh}, neo ({ax}, {ay}), '
                     f'dáng nghỉ cao {meta["ty_le"]["cao_dang_nghi_px_nguon"]} px nguồn', fill='black', font=font(20, True))
    d.text((10, 44), 'Ô vuông xám = trong suốt (chỉ ở ảnh kiểm). Khung xanh = ô; chữ thập đỏ = điểm neo (đất, giữa chân). '
                     'Số = chỉ số khung; G/X = ủng gần/xa chạm đất.', fill=(60, 60, 60), font=font(15))
    for f in meta['frames']:
        x, y = o + f['x'], T + f['y']
        d.rectangle([x, y, x + fw - 1, y + fh - 1], outline=(60, 130, 220, 255))
        d.line([x + ax - 8, y + ay, x + ax + 8, y + ay], fill=(220, 40, 40, 255), width=1)
        d.line([x + ax, y + ay - 8, x + ax, y + ay + 8], fill=(220, 40, 40, 255), width=1)
        cl = ''.join(t for t, k in (('G', 'ung-gan'), ('X', 'ung-xa')) if f['chiu_luc'][k])
        d.text((x + 4, y + 2), f'{f["i"]:02d} {cl}', fill=(40, 40, 40, 255), font=font(14, True))
    C.convert('RGB').save(os.path.join(SPRITE, 'kiem-sheet-luoi.png'))


if __name__ == '__main__':
    main()
