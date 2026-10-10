"""Tạo GAME_ASSET_MANIFEST.json từ số đo thật (anh/do_dac.json) + dòng code tìm bằng grep.
Chạy: python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/tao_manifest.py  (sau chup_tham_chieu.py)"""
import json, os, re

PKG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(os.path.dirname(PKG))
JS = os.path.join(REPO, 'game', 'js')
M = json.load(open(os.path.join(PKG, 'anh', 'do_dac.json')))


def line_of(fname, pat):
    for i, l in enumerate(open(os.path.join(JS, fname), encoding='utf-8'), 1):
        if re.search(pat, l):
            return i
    return None


def src(fname, pat, label):
    n = line_of(fname, pat)
    return f'game/js/{fname}:{n} ({label})' if n else f'game/js/{fname} ({label}) — CHƯA TÌM THẤY DÒNG'


NOT_FILE = 'Không có file ảnh: vẽ bằng code Canvas 2D lúc chạy.'
VERI = 'đã xác minh bằng đọc code + vẽ thử hàm thật trong Chromium và đo điểm ảnh (anh/do_dac.json)'
VERI_CODE = 'đã xác minh bằng đọc code (chưa đo điểm ảnh)'
CON = ['Lớp thế giới 480×270, 1 điểm ảnh sprite = 1 điểm ảnh thế giới, imageSmoothingEnabled=false, CSS pixelated.',
       'Phóng lên màn hình theo hệ số KHÔNG nguyên (engine.js resize: s=min(W/480,H/270)) nên điểm ảnh có thể to nhỏ không đều.',
       'Không đổi kích thước, hitbox, thời gian đòn (luật dự án).']

assets = []


def add(**k):
    base = dict(asset_id=None, display_name=None, category=None, priority=None, source_file=None, source_dimensions=None,
                frame_dimensions=None, rows=None, columns=None, frame_order=None, animation_states=None, in_game_display_size=None,
                transparency=None, rendering_constraints=CON, visual_problems=None, generation_target=None, integration_notes=None,
                verification_status=None, reference_images=None)
    base.update(k)
    assets.append(base)


# ---------------- EM BÉ ----------------
HERO_NOTE = {
    'smith': 'Thợ Rèn — đỏ (#8c1c1f/#d2362e/#f47a62), mũ trùm sừng, búa con, mặt nạ "lửa"',
    'hunter': 'Thợ Săn — xanh lá (#255a2c/#479544/#8fd070), mũ nhọn, ống tên sau lưng, mặt nạ "lá"',
    'healer': 'Thầy Lang — xanh dương (#27407f/#4468c0/#86a8f0), mũ lá, hồ lô sau lưng, mặt nạ "xoáy"',
    'wrestler': 'Đô Vật — cam (#9a4a16/#dd7c2a/#f8b25c), khăn, găng đồng, mặt nạ "dữ"',
}
eo = M['em_be']['o_ve']
for k in ['smith', 'hunter', 'healer', 'wrestler']:
    e = M['em_be'][k]; bb = e['hop_bao_idle_khung0']
    add(asset_id=f'hero_{k}', display_name=f"Em bé {e['ten']}", category='nhan_vat_em_be', priority='P1 (bóng dáng: P0)',
        source_file=[src('hero_tinhlinh.js', r'^\s*' + k + ':', 'bảng HERO'), src('hero_tinhlinh.js', r'function drawKid', 'drawKid: thứ tự lớp'),
                     src('hero_tinhlinh.js', r'function pose\(', 'pose: tư thế thủ tục'), src('hero_tinhlinh.js', r'function pick\(', 'pick: chọn động tác/khung'),
                     src('hero_tinhlinh.js', r'function hero\(c, o\)', 'hero: vẽ bóng, lật mặt, vũ khí'),
                     'game/js/hero_art.js (hình CŨ, chỉ dùng khi hero_tinhlinh lỗi)'],
        source_dimensions={'note': NOT_FILE + ' Bộ đệm vẽ Spr(120,112) gốc (60,74), cắt theo điểm ảnh dùng thật.',
                           'idle_khung_0_rong_x_cao': [bb['w'], bb['h']]},
        frame_dimensions={'goc_neo': 'giữa hai bàn chân = (0,0); x sang phải, y âm là lên; vẽ mặt quay PHẢI',
                          'hop_bao_moi_hang_tu_chan': {r['nhan']: r['hop_bao_tu_chan'] for r in e['hang']},
                          'o_tham_chieu_trong_anh': [eo['rong'], eo['cao']], 'goc_chan_trong_o': [eo['goc_chan_x'], eo['goc_chan_y']]},
        rows=len(e['hang']), columns=e['so_cot'],
        frame_order='Ảnh tham chiếu: mỗi hàng một động tác, khung 0→n trái sang phải (thứ tự hàng: ' + ' | '.join(r['nhan'] for r in e['hang']) + ')',
        animation_states={'idle': '8 khung, khung=floor(t*6.5)%8 (~0.154 s/khung), chớp mắt khi t%3.7<0.14',
                          'run': '8 khung, floor(t*13)%8 (~0.077 s/khung)',
                          'atk': 'ATKN sword 10 / hammer 14 / spear 10 / bow 12; tiến độ = 1-atkT/atkDur; kiếm 0.30/0.30/0.46 s, giáo 0.38/0.34/0.34, búa 0.8, cung 0.38 (đứng)/0.45 (đi); đòn trúng ở u≈0.45; 3 biến thể combo',
                          'spec': '7 khung / 0.35 s', 'cast': '8 khung / 0.4 s', 'dodge': '8 khung / 0.27 s, 5 hướng', 'dash': '2 khung, t*30',
                          'hurt': '1 khung khi hurtT 0.2 s (tô trắng #ffffff 0.6)', 'die': '8 khung, floor(deadT/0.075) tối đa 7', 'gong': '4 khung t*7', 'hold': '5 mức tụ lực', 'sweep': '10 khung (giáo quét)'},
        in_game_display_size='Đứng yên khoảng ' + f"{bb['w']}×{bb['h']}" + ' px thế giới (kể cả viền); khi đánh kèm vũ khí tới ~87×71 (kiếm combo 3)',
        transparency='Nền trong suốt; viền ngoài 1 px #1b1118; bóng đổ vẽ RIÊNG bằng code (3 hàng rgba(0,0,0,.3) rộng 2·7 px, hoặc elip trong phòng nhìn từ trên)',
        visual_problems=['H1: 4 em bé chung một bóng dáng, chỉ khác màu áo (XIN-Y-KIEN-HINH-ANH.md §3)', 'Đầu ~2/5 chiều cao; chi tiết nhỏ dưới 2 px khó đọc ở cỡ thật'],
        generation_target='Concept/reference sheet trước (4 bé cạnh nhau, cùng cỡ, nhìn nghiêng 3/4 quay phải). Sau khi duyệt mới làm sprite sheet theo khung trong frame_dimensions. ' + HERO_NOTE[k],
        integration_notes=('CÓ đường nạp: tệp game/art/custom/em-be-' + k + '.sprite.json (loai "linh-khi-sprite", doi_tuong "em-be") — game/js/sprite_custom.js noiEmBe. '
                           'Chỉ THÂN được thay; bóng, vũ khí (điểm cầm lấy từ tư thế code!), hào quang vẫn do code vẽ, nên tay trong ảnh AI phải khớp điểm cầm REST sword (12,-9), spear (11,-15), hammer (12,-10), bow trục (3,-16). '
                           'Động tác hỗ trợ: idle, move, tele, atk, hit, die, ne (KHÔNG có hàng riêng cho từng loại vũ khí, spec/cast dùng atk). Tệp chỉ vào game khi chạy game/build.py (nhúng vào bản đóng gói), index.html chạy trực tiếp KHÔNG đọc. Trang phục (mũ/áo/lưng) có định dạng riêng tp-<ô>-<kiểu>.'),
        verification_status=VERI,
        reference_images=[f'anh/em_be/{k}_sheet.png', f'anh/em_be/{k}_sheet_x4.png', f'anh/contact/em_be_{k}.png'])

# ---------------- QUÁI + TRÙM NHỎ ----------------
VUNG = {'rung': 'Rừng già (hệ Độc)', 'bien': 'Hang biển (hệ Băng)', 'laudai': 'Lâu đài cổ (hệ Lửa)'}
for v, q in M['quai'].items():
    if v in ('cot',):
        continue
    for c in q['con']:
        mini = c['loai'] == 'trumnho'
        add(asset_id=f"mob_{c['id']}", display_name=c['ten'], category='quai_trum_nho' if mini else ('quai_tinh_anh' if c['loai'] == 'tinhanh' else 'quai_thuong'),
            priority='P1', source_file=[src('monster_art.js', r"^def\('" + c['id'] + "'", 'def: dữ liệu, cử động, màu'), 'game/js/monster_art.js MA.draw (vẽ, 12 khung/giây, lật mặt)', 'game/js/mobs.js (vai, hitbox, thời gian đòn)'],
            source_dimensions={'note': NOT_FILE + ' Lưới điểm ảnh S(w,h) dựng trong code, viền #14182e.', 'luoi_rong_x_cao': [c['khung_luoi']['rong'], c['khung_luoi']['cao']],
                               'hop_bao_idle_t0': c['hop_bao_idle_t0'], 'cao_ve_MA_cao': c['cao_ve']},
            frame_dimensions={'goc_neo': 'giữa chân (đáy hình) tại (x,y) truyền vào MA.draw; hình gốc quay TRÁI, face>0 lật', 'goi_y_o_khung': [c['khung_luoi']['rong'] + 8, c['khung_luoi']['cao'] + 8]},
            rows=None, columns=None,
            frame_order='Code: số khung = round(thời_lượng × 12). Ảnh tham chiếu: cột ' + ', '.join(f'{a}@{u}' for a, u in M['quai']['cot']),
            animation_states={k: f'{d} s ≈ {round(d * 12)} khung' for k, d in c['dong_tac_giay'].items()},
            in_game_display_size=f"≈{c['hop_bao_idle_t0']['rong']}×{c['hop_bao_idle_t0']['cao']} px thế giới khi đứng (1:1){', bay cao thêm' if c['bay'] else ''}",
            transparency='Nền trong suốt; bóng elip đen alpha .28 do code vẽ; chớp trắng/nhuộm hệ do code chồng lên',
            visual_problems=(['H2: ở Lâu đài cổ quái và sàn chênh sáng chỉ 38–59'] if v == 'laudai' else []) + ['H8: chủ dự án chê quái/trùm "xấu"', 'Hình idle có kèm hiệu ứng trong sprite (tia, vòng nổ) ở cử động tele/atk/die — phần đó KHÔNG phải ảnh để AI vẽ lại'],
            generation_target=f'{VUNG[v]}. Concept sheet trước (idle quay trái + 1 tư thế đánh), giữ bóng dáng & màu chủ đạo {", ".join(c["mau_chinh"][:4])}. Sau đó sprite sheet: mỗi hàng 1 động tác idle/move/tele/atk/hit/die, khung bằng nhau.',
            integration_notes=f"CÓ đường nạp: game/art/custom/{c['id']}.sprite.json (doi_tuong 'quai', ma = '{c['id']}'). sprite_custom.js noiQuai thay THÂN, giữ bóng + hiệu ứng code. Ánh xạ: intro/idle→idle, tele/phase2/phase3→tele, c1..c5/chieu→40% tele + 60% atk, stun→hit lắc. Chỉ vào game qua game/build.py.",
            verification_status=VERI, reference_images=[f'anh/quai/{v}_sheet.png', f'anh/quai/{v}_sheet_x3.png', f'anh/contact/quai_{v}.png'])

# ---------------- TRÙM ----------------
for bid, reg in [('mocTinh', 'rung'), ('nguTinh', 'bien'), ('hoTinh', 'laudai')]:
    t = M['trum'][bid]
    sizes = {f"pha{m['pha']}_{m['anim']}@{m['u']}": m['hop_bao'] for m in t['mau']}
    add(asset_id=f'boss_{bid}', display_name=t['ten'], category='trum', priority='P1',
        source_file=[src('monster_art.js', r"^def\('" + bid + "'", 'def'), src('monster_art.js', r'^Q[A-Z0-9]+\.' + bid + r' = ', 'lưới hình theo pha'), src('boss.js', r'A\.boss = function', 'A.boss: chọn cử động, Hồ Tinh pha 3 thu 0.72')],
        source_dimensions={'note': NOT_FILE, 'luoi': [t['khung_luoi']['rong'], t['khung_luoi']['cao']], 'hop_bao_do_duoc': sizes},
        frame_dimensions={'goc_neo': 'giữa chân, quay trái; 3 pha (đổi ở 66% và 33% máu)', 'ghi_chu': 'Hồ Tinh pha 3: lưới 281×174 vẽ thu 0.72 (boss.js) — tỉ lệ không nguyên' if bid == 'hoTinh' else None},
        rows=3, columns=len(M['trum']['cot']), frame_order='Ảnh tham chiếu: hàng = pha 1/2/3; cột ' + ', '.join(f'{a}@{u}' for a, u in M['trum']['cot']),
        animation_states={k: f'{d} s' for k, d in t['dong_tac_giay'].items()},
        in_game_display_size='≈' + str(t['khung_luoi']['rong']) + '×' + str(t['khung_luoi']['cao']) + ' px (1:1) trong phòng trùm 300×198',
        transparency='Nền trong suốt; bóng + chớp trắng 0.7 do code',
        visual_problems=['H8: trùm "xấu"/rối', 'Mộc Tinh: nên 3–5 khối tán; Ngư Tinh: dải rộng thay vảy nhỏ; Hồ Tinh: chỉ 2–3/9 đuôi sáng (THIET-KE-HINH-ANH-GPT.md)'],
        generation_target='Concept/key art 3 pha cạnh nhau ở cỡ gốc ×2, giữ bóng dáng lớn và hướng quay trái. KHÔNG làm sprite sheet trước khi duyệt concept.',
        integration_notes=f"Đường nạp quái dùng được cho trùm (ma='{bid}') NHƯNG: định dạng chỉ có 1 tấm cho mọi pha (không đổi hình theo pha), chiêu c1..c5 bị gộp thành tele+atk, hiệu ứng chiêu vẫn do code. Muốn trùm đổi hình theo pha / chiêu riêng → CẦN THÊM CODE nạp ảnh.",
        verification_status=VERI, reference_images=[f'anh/trum/{bid}_sheet.png', f'anh/trum/{bid}_sheet_x2.png', f'anh/contact/trum_{bid}.png', f'anh/canh/{reg}_phong_trum_480x270_x3.png'])

# ---------------- VŨ KHÍ ----------------
TN = {'sword': 'Kiếm', 'bow': 'Cung', 'spear': 'Giáo', 'hammer': 'Búa'}
for w in M['vu_khi']['dong']:
    add(asset_id=f"weapon_{w['loai']}_{w['dong']}", display_name=f"{TN[w['loai']]}: {w['ten']}", category='vu_khi', priority='P2',
        source_file=[src('weapon_art.js', r'function draw\(c, opts', 'draw: xoay theo góc, nấc 5°'), 'game/js/weapon_art.js bảng FAM (dòng ' + str(w['dong']) + ')'],
        source_dimensions={'note': NOT_FILE, 'dung_nghi_rong_cao': [w['co_dung_nghi']['rong'], w['co_dung_nghi']['cao']], 'dai_than': w['co_dung_nghi']['dai_than'], 'mui_cach_diem_cam': w['mui_cach_diem_cam']},
        frame_dimensions={'goc_neo': 'điểm cầm = (0,0); trục t từ cán tới mũi; góc 0 = chĩa ra trước', 'nam_ngang_hop_bao': w['hop_bao_ngang']},
        rows=1, columns=1, frame_order='1 hình tĩnh; game tự xoay theo góc (nấc 5°) và đặt vào tay em bé',
        animation_states={'mat': 'mắt/miệng vẽ lại mỗi khung theo tâm trạng idle/attack/hurt', 'cung': 'dây + mũi tên vẽ động theo độ giương', 'bac_vang': 'lấp lánh'},
        in_game_display_size=f"≈{w['co_dung_nghi']['rong']}×{w['co_dung_nghi']['cao']} px khi đứng nghỉ (dựng đứng); mốc tiến hoá ×1/1.03/1.08/1.14",
        transparency='Nền trong suốt; viền #1b1118 đổi màu theo bậc hiếm (#1f4fa8/#5a2499/#a86a08)',
        visual_problems=['H6: 40 dòng chỉ khác hình và tên, khó nhớ', 'Thêm 3 nhánh (lửa/độc/băng) × 3 mốc + 4 bậc hiếm do code biến đổi'],
        generation_target='Concept 1 tấm cho cả 10 dòng của loại này nằm ngang cùng tỉ lệ; sau đó từng hình tĩnh nằm ngang, điểm cầm và mũi đánh dấu.',
        integration_notes=f"CÓ đường nạp: tệp vk-{w['loai']}-{w['dong']}[-<nhánh>[-<mốc>]].sprite.json, doi_tuong 'vu-khi', trường anh (PNG base64), vu_khi.cam (điểm cầm), vu_khi.mui (mũi), cung thêm vu_khi.day (2 đầu dây). Game xoay từng điểm ảnh quanh cam, nhớ theo nấc 5°. Mắt/miệng vũ khí code vẽ chồng lên — có thể lệch hình AI.",
        verification_status=VERI, reference_images=['anh/vu_khi/vu_khi_40_dong_sheet.png', 'anh/vu_khi/vu_khi_40_dong_sheet_x4.png', 'anh/contact/vu_khi_40_dong.png'])

# ---------------- HIỆU ỨNG ----------------
NO_PATH = 'CHƯA có đường nạp ảnh — hiệu ứng vẽ thủ tục bằng fillRect, CẦN THÊM CODE nếu muốn dùng ảnh. Khuyên: dùng ảnh AI làm tham chiếu để vẽ lại bằng code (đúng cách nhánh gd5-c đang làm).'
FX = [
    ('fx_vet_chem', 'Vệt chém theo mũi vũ khí', 'P2', src('fx.js', r'function trailStep', 'trailStep/trailDraw'), 'vòng 12 điểm, sống 0.085/0.115/0.12 s × (0.5+0.5·vet); màu trắng→hi→c2→c→d, đuôi ô cờ', 'Trùng màu giữa các hệ khi đông; nét 2–3 px', 'Ảnh 4 vệt (kiếm/búa/giáo/đặc biệt) × 4 hệ (thường/lửa/độc/băng) trên nền trong suốt, mỗi vệt là 1 dải cung 3–5 khung'),
    ('fx_trung_don', 'Tia trúng đòn 3 bậc + chí mạng', 'P0', src('fx.js', r"api\('hit'", "api('hit')"), 'sao chớp r4–9 sống 0.08–0.10 s; lưỡi 5/8 tia, cùn 5/7 mảnh, đâm 4/6; chí mạng r12 0.14 s + vòng 20/28 + 6 tia vàng; khựng 45–115 ms', 'H4: bậc đòn khó phân biệt; thiếu hiệu ứng vỡ khiên', 'Bảng 4 bậc (thường/nặng/chí mạng/vỡ giáp) mỗi bậc 3–4 khung, đường kính 8–28 px'),
    ('fx_hat', 'Hạt (12 kiểu) và bảng dải màu RAMP', 'P0', src('fx.js', r'const RAMP', 'RAMP 19 dải màu'), 'MAXP 400 hạt, MAXE 72 hình, MAXN 28 số; fillRect toạ độ nguyên, không cộng sáng', 'H3: cảnh đông 12 quái + búa + Địa Chấn + chưởng không đọc được', 'KHÔNG tạo ảnh từng hạt; tạo bảng màu/ngân sách: mục tiêu 90–120 hạt'),
    ('fx_bao_truoc', 'Vùng báo trước (telegraph)', 'P0', src('bao_truoc.js', r'TINT', 'màu báo trước'), 'vẽ MƯỢT trên lớp UI (không phải pixel art); nền rgb(255,40,28) α .28–.40, viền rgb(255,150,128); xuất hiện 0.15 s, loé 0.22 s', 'H5: 5–6 vùng cùng màu, không biết cái nào nổ trước', 'Mockup quy tắc thị giác (thứ tự nổ, độ đậm) — để vẽ lại bằng code; KHÔNG phải sprite'),
    ('fx_dan_quai', 'Đạn quái/trùm (10 kiểu)', 'P2', src('fx_dan.js', r'function lookOf|lookOf', 'lookOf'), '17×17 xoay 16 hướng, trùm vùng 34×34; viền #1a0a0c, quầng đỏ #ff2a1a r7/r10, chấm đỏ nhấp nháy', 'Đạn đè hiệu ứng khác khi đông', 'Sheet 10 kiểu đạn × 1 hướng (quay phải), 17×17 và 34×34, nền trong suốt'),
    ('fx_mui_ten', 'Mũi tên người chơi', 'P2', src('fx_dan.js', r'EL_GLOW', 'EL_GLOW'), 'vệt 18/34 px; quầng ô cờ α .32/.18/.10', None, 'Mũi tên 4 hệ, 17×17'),
    ('fx_chuong', 'Chưởng (cầu lửa/độc/gai băng)', 'P2', 'game/js/fx_chuong.js', 'cầu lửa r=5+3·big', 'Chưởng tụ lực nhiều hạt', '3 hệ × (bay 4 khung + nổ 5 khung)'),
    ('fx_ky_nang', 'Ấn kỹ năng (rune) + Trảm Nguyệt / Phi Thương / Địa Chấn', 'P2', src('fx_ky_nang.js', r'function drawRune', 'drawRune'), 'rune lớn dần 0–0.16, giữ 0.16–0.4, tan; 6 ký tự xoay 2.2 rad/s', 'Tối đa 2 rune khi tụ lực', 'Concept rune Đông Sơn tròn đường kính 40–70 px, 1 tấm/hệ'),
    ('fx_linh_khi', 'Viên linh khí bay về thanh', 'P2', src('fx.js', r'markOrbs', 'markOrbs'), 'dấu cộng 3–5 px lõi trắng, bay 1.4 s tới (368,39); biểu tượng hệ 8×8', None, 'Biểu tượng hệ 8×8 và viên 5×5, 3 hệ'),
    ('fx_so_sat_thuong', 'Số sát thương', 'P2', src('fx.js', r'function drawNums|drawNums', 'drawNums'), 'chữ vector Be Vietnam Pro trên lớp UI, cỡ 6.5–13, sống 0.75–1 s', 'Chồng số khi đông', 'Không cần ảnh AI (chữ); nếu muốn chữ số pixel → bảng 10 chữ số 5×7'),
    ('fx_chet_quai', 'Hiệu ứng chết/tan quái', 'P2', src('monster_art.js', r'tanRa', 'tanRa'), '10 kiểu tan, chết 0.42 s (quái) 1.25 s (trùm), xác tối đa 16', None, 'Tham chiếu chung; nằm trong hàng die của từng quái'),
]
for aid, name, pr, s, numbers, prob, target in FX:
    add(asset_id=aid, display_name=name, category='hieu_ung', priority=pr, source_file=s, source_dimensions={'note': NOT_FILE, 'so_lieu': numbers},
        frame_dimensions=None, rows=None, columns=None, frame_order='Thủ tục theo thời gian sống (không có dãy khung cố định)', animation_states=None,
        in_game_display_size=None, transparency='Vẽ chồng source-over, màu đặc/rgba; KHÔNG cộng sáng trong chiến đấu',
        visual_problems=[prob] if prob else None, generation_target=target, integration_notes=NO_PATH,
        verification_status=VERI_CODE + ('; ảnh thực tế: anh/canh/hieu_ung_dong_*' if pr == 'P0' else ''),
        reference_images=['anh/canh/hieu_ung_dong_1_480x270_x3.png', 'anh/canh/hieu_ung_dong_2_480x270_x3.png', 'anh/canh/hieu_ung_dong_3_480x270_x3.png'])

# ---------------- MÔI TRƯỜNG ----------------
for v, ten, pal in [('rung', 'Rừng già', 'trời #16261c/#1f3a28/#2c5234, đất #3d5a2a, sàn 9 bậc, ánh #e4f0a0'),
                    ('bien', 'Hang biển', 'trời #0d1826/#132a40/#1c3f5c, đất #48586a, sàn #1b222b…#4a5560, pha lê #58c8ea/#d8f6ff/#2a7fae'),
                    ('laudai', 'Lâu đài cổ', 'gạch #4b3f3f, gỗ #4a3020/#2e1c12/#6a4830, sắt #55555e/#8a8a96, sàn #4f4745, ô sàn 16 px, ánh #ffc878')]:
    add(asset_id=f'env_room_{v}', display_name=f'Phòng {ten} (nền + tường + đạo cụ)', category='moi_truong', priority='P3 (Lâu đài: tương phản P0)',
        source_file=[src('room_art.js', r'RA\.geo = |function geo|geo\(', 'RA.geo'), src('room_art.js', r'function buildShell', 'buildShell'), src('room_art.js', r'function lightPass', 'lightPass'), 'game/js/env_art.js (đạo cụ: rương, đài nước, bàn thờ…)'],
        source_dimensions={'note': NOT_FILE + ' Phòng vẽ sẵn 1 lần vào canvas 480×270 rồi dán.', 'phong_thuong_san': 'x136–344, y56–252 (208×196)', 'phong_trum_san': 'x80–380, y56–254 (300×198)', 'tuong': 'cao 42, mép 7, tường bên 14, tường trước 12'},
        frame_dimensions={'canh': [480, 270]}, rows=1, columns=1, frame_order='1 nền tĩnh + đốm sáng bay (6–12) + 2 cụm tiền cảnh mờ 35% khi che nhân vật',
        animation_states={'moi_truong': 'đuốc, bụi, đom đóm bằng code'}, in_game_display_size='480×270 toàn lớp thế giới, KHÔNG cuộn, KHÔNG parallax',
        transparency='Nền đặc (không trong suốt); tiền cảnh cần trong suốt', visual_problems=['H7: nền tối, xỉn (sàn giảm bão hoà ×0.84–0.88)'] + (['H2: Lâu đài: quái–sàn chênh sáng 38–59'] if v == 'laudai' else []),
        generation_target=f'Bảng màu: {pal}. Concept phòng 480×270 nhìn từ trên chếch, chừa đúng vùng sàn; KHÔNG vẽ nhân vật/UI trong ảnh.',
        integration_notes='CHƯA có đường nạp ảnh nền — CẦN THÊM CODE (thay A.bg/room_art bằng drawImage, giữ RA.geo). Khuyên: dùng ảnh AI làm tham chiếu bảng màu để chỉnh room_art.js.',
        verification_status=VERI_CODE + '; ảnh thực tế đã chụp', reference_images=[f'anh/canh/{v}_phong_trong_480x270.png', f'anh/canh/{v}_phong_trong_480x270_x3.png', f'anh/canh/{v}_phong_co_quai_480x270_x3.png'])

add(asset_id='env_lang', display_name='Làng (cảnh cuộn 720×270)', category='moi_truong', priority='P3', source_file='game/js/village_scene.js',
    source_dimensions={'note': NOT_FILE, 'rong_cao': [720, 270]}, frame_dimensions=None, rows=None, columns=None, frame_order=None,
    animation_states={'dem': 'multiply #b6b0dc + đèn cộng sáng (lighter)'}, in_game_display_size='720×270 cuộn ngang', transparency='nền đặc',
    visual_problems=None, generation_target='Chỉ concept tham chiếu', integration_notes='CHƯA có đường nạp ảnh — CẦN THÊM CODE. Người làng có định dạng nguoi-lang trong sprite_custom.js.',
    verification_status='CHƯA chụp ảnh làng trong gói này (chưa xác minh bằng ảnh)', reference_images=None)

# ---------------- UI ----------------
add(asset_id='ui_hud_nut', display_name='HUD, nút bấm, khung (chủ đề trống đồng Đông Sơn)', category='giao_dien', priority='P3',
    source_file=['game/js/ui_theme.js', 'game/js/btn_art.js', 'game/js/stage.js (drawHud)'],
    source_dimensions={'note': NOT_FILE + ' Lớp UI riêng #ui độ phân giải màn hình (dpr ≤3), toạ độ logic 480×270.', 'thanh_mau': '(4,3) 120×11', 'o_vu_khi': 'x368+56i, 54×35'},
    frame_dimensions=None, rows=None, columns=None, frame_order=None, animation_states=None, in_game_display_size='toạ độ 480×270, nút pixel phóng theo round(scale)',
    transparency='trong suốt', visual_problems=None, generation_target='Không ưu tiên. Chữ dùng font vector Be Vietnam Pro (không phải pixel font).',
    integration_notes='Chỉ biểu tượng vật phẩm có đường nạp (vp-<loại>, doi_tuong vat-pham). Nút/khung/HUD: CHƯA có — CẦN THÊM CODE.',
    verification_status=VERI_CODE, reference_images=['anh/canh/laudai_phong_co_quai_kem_giao_dien.png'])

out = {
    'ten_goi': 'LINH KHÍ — AI ART HANDOFF', 'phien_ban_du_lieu': 'nhánh khoi-tao-du-an tại lúc tạo gói',
    'SU_THAT_QUAN_TRONG': 'Game KHÔNG dùng file ảnh. Mọi nhân vật, quái, trùm, vũ khí, hiệu ứng, nền đều VẼ BẰNG CODE (Canvas 2D). source_file = tệp .js + hàm vẽ. Đường duy nhất đưa ảnh vào game: tệp .sprite.json (loai "linh-khi-sprite") trong game/art/custom/, do game/js/sprite_custom.js đọc, chỉ cho em bé (thân), quái/trùm (thân), vũ khí (hình tĩnh), trang phục, biểu tượng vật phẩm; hiện thư mục này TRỐNG.',
    'quy_uoc': {'don_vi': 'điểm ảnh thế giới (lớp 480×270)', 'null': 'không áp dụng', 'verification_status': 'ghi rõ nguồn xác minh hoặc CHƯA xác minh'},
    'so_asset': len(assets), 'assets': assets,
}
json.dump(out, open(os.path.join(PKG, 'GAME_ASSET_MANIFEST.json'), 'w'), ensure_ascii=False, indent=1)
print('manifest:', len(assets), 'asset')
miss = [a['asset_id'] for a in assets for s in ([a['source_file']] if isinstance(a['source_file'], str) else a['source_file']) if 'CHƯA TÌM THẤY' in s]
print('thiếu dòng:', miss)
