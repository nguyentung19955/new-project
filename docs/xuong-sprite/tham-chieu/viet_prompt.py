"""Viết lại docs/xuong-sprite/PROMPT-VE.md: mỗi hình một dòng prompt tiếng Anh đầy đủ, thêm đặc điểm đo được từ hình trong game.

Chạy sau tao_anh.py: python3 docs/xuong-sprite/tham-chieu/viet_prompt.py
- Giữ nguyên tên, mô tả tiếng Việt, hình dáng và nét phá cách (câu "Twist:") của từng hình trong PROMPT-VE.md.
- Thay phần phong cách bằng số đo thật (do-dac.json): góc nhìn, dáng hợp khung Xưởng Sprite, tỉ lệ, cỡ thật, màu chính, viền.
- Dưới mỗi dòng: khung cần chọn, ảnh tham chiếu, câu nhờ vẽ lại cho khớp.
Chạy lại nhiều lần vẫn ra cùng kết quả (đọc phần chủ thể từ chính tệp đang có).
"""
import colorsys
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.join(HERE, '..', 'PROMPT-VE.md')
DO = {o['ma']: o for o in json.load(open(os.path.join(HERE, 'do-dac.json'), encoding='utf-8'))}

# ---------- tên màu dễ hiểu ----------
def ten_mau(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    h *= 360
    if v < 0.16:
        return 'near-black'
    if s < 0.16:
        if v > 0.92 and r > b + 0.02:
            return 'off-white'
        return 'white' if v > 0.92 else 'light grey' if v > 0.7 else 'grey' if v > 0.42 else 'dark grey'
    if s < 0.3 and v > 0.8 and 20 <= h <= 70:
        return 'cream'
    if s < 0.32 and not (15 <= h < 50):
        fam = 'blue' if 180 <= h < 260 else 'green' if 70 <= h < 180 else 'purple' if 260 <= h < 330 else 'red'
        return ('dark ' if v < 0.45 else 'light ' if v > 0.78 else '') + 'grey-' + fam
    if 15 <= h < 48 and v < 0.66:
        return 'dark brown' if v < 0.4 else 'brown'
    if 20 <= h < 50 and s < 0.55 and v >= 0.66:
        return 'tan'
    bins = [(12, 'red'), (40, 'orange'), (65, 'yellow'), (90, 'yellow-green'), (150, 'green'), (185, 'teal'), (205, 'sky blue'),
            (245, 'blue'), (275, 'indigo'), (300, 'purple'), (335, 'magenta'), (360, 'red')]
    ten = next(n for lim, n in bins if h < lim)
    if ten == 'yellow' and v < 0.8:
        ten = 'golden'
    if v < 0.56:
        return 'dark ' + ten
    if s < 0.6 and v > 0.85:
        return 'light ' + ten
    return ten


def mau_chinh(o, n=4):
    ol = o.get('vien')
    out = []
    for hx, pc in o['mau_chinh']:
        if hx == ol:
            continue
        out.append('%s %s' % (ten_mau(hx), hx))
        if len(out) >= n:
            break
    return ', '.join(out)


def ti_le(o):
    r = o['rong'] / o['cao']
    if r > 1.15:
        return 'about %s times wider than tall' % ('%.1f' % r).rstrip('0').rstrip('.')
    if r < 0.87:
        return 'about %s times taller than wide' % ('%.1f' % (1 / r)).rstrip('0').rstrip('.')
    return 'about as wide as tall'


def so_mau(o, tran=20):
    return max(4, min(tran, o['so_mau']))


def vien(o, ten, sang='top left'):
    return ('one clean %s outline (%s) all around the shape, about 1/%d of the height thick (exactly one game pixel), '
            'flat solid colors, at most %d colors, simple 3-tone cel shading (dark, base, light) with light from the %s, no gradients, no glow, no blur, no anti-aliasing'
            % (ten, o['vien'] or '#1b1118', max(o['cao'], 6), so_mau(o), sang))


NEN = ('Single subject only, whole thing visible and centered with white margin around it, on a pure plain white background (#ffffff), '
       'nothing else: no ground, no shadow, no scenery, no text, no frame.')

# ---------- dáng theo khung của Xưởng Sprite (khớp với tools/xuong-sprite/nguon/khung.js) ----------
KHUNG = {
    'Người': 'Người (2 chân)', 'Bốn chân': 'Bốn chân', 'Cua/bọ': 'Cua, bọ (nhiều chân)', 'Cá/chim bay': 'Cá, chim bay',
    'Khối mềm': 'Khối mềm (slime, lửa, ma)', 'Rắn': 'Rắn (trườn)', 'Cây/đứng yên': 'Cây, đứng yên',
}
DANG = {
    'Người': ('standing on two legs, torso upright in the middle, both arms held a little away from the body with a clear white gap between each arm and the torso '
              '(hands at hip height, front arm toward the right, back arm toward the left), legs slightly apart with a white gap between them, both legs clearly visible in the bottom third of the height (any robe or cloak ends above the knees), both feet flat on the same bottom line'),
    'Bốn chân': ('body horizontal, head at the right end, tail sticking out from the upper left of the body, four legs going straight down under the body '
                 '(front pair under the head end, back pair under the tail end, a clear white gap between the front and back legs), all four feet on the same bottom line, legs about one third of the height'),
    'Cua/bọ': ('wide low body in the middle, the two big claws or horns raised up and out toward the upper left and upper right with white gaps from the body, '
               'short legs splayed outward to the lower left and lower right, all feet on the same bottom line'),
    'Cá/chim bay': ('flying, body horizontal in the middle, head at the right, tail at the left at the same height, wings or fins raised up above the back '
                    'with a clear white gap from the body, nothing touching the ground'),
    'Khối mềm': ('round soft body sitting on the bottom, the top part (cap, head or flame) on top, two short stubby arms, fins or tentacles '
                 'sticking out low to the left and to the right with a white gap from the body'),
    'Rắn': 'long body lying low in a gentle S-curve across the whole width, head raised at the right end, tail tapering to the left end',
    'Cây/đứng yên': ('rooted in place: wide roots or base at the bottom, an upright trunk or stem in the middle, two branch arms reaching out to the left and right '
                     'and a little up with white gaps between them, the big head or crown on top'),
}
GOC_NGANG = 'Side view facing RIGHT'
GOC_CHEO = '3/4 view turned to the RIGHT'
GOC_THANG = 'Front view facing the viewer (turned only slightly to the right)'

# Quái: (khung, góc nhìn như trong game, câu dáng riêng thay câu chung nếu cần)
QUAI = {
    'heoCon': ('Bốn chân', GOC_NGANG, None), 'ongVo': ('Cá/chim bay', GOC_NGANG, 'three bodies close together in a loose triangle, each head pointing right, each pair of wings raised up above its back with a white gap, stingers pointing left'),
    'boHung': ('Cua/bọ', GOC_NGANG, 'low wide body, the big horn raised up at the front right, the rounded shell rising at the back left, six short legs splayed down to the lower left and lower right with white gaps, all feet on the same bottom line'),
    'hoaBaoTu': ('Cây/đứng yên', GOC_NGANG, 'rooted in place: a bunch of big leaves at the bottom as the base, a thick stem rising in the middle, the huge open toothy mouth-head at the top pointing to the right, two leaf arms sticking out left and right with white gaps'),
    'chonBong': ('Bốn chân', GOC_NGANG, 'long low body stretched horizontally, head at the right end, long tail streaming out to the left, four short legs reaching down with white gaps between the front and back legs'),
    'namPhong': ('Khối mềm', GOC_THANG, None), 'socNo': ('Bốn chân', GOC_CHEO, 'crouching on its hind legs, head at the upper right, the huge fluffy tail curling up behind at the left with a white gap from the back, front paws holding the bomb in front at the right, feet on the same bottom line'),
    'nhimDoc': ('Bốn chân', GOC_NGANG, None), 'heoNanh': ('Bốn chân', GOC_NGANG, None), 'namPhongChua': ('Khối mềm', GOC_THANG, None),
    'namChua': ('Khối mềm', GOC_THANG, 'a huge wide cap on top, a thick stem body with the angry face below it, two short root-legs splayed out to the lower left and lower right with white gaps'),
    'mocTinh': ('Cây/đứng yên', GOC_THANG, None),
    'cua': ('Cua/bọ', GOC_THANG, None), 'caCon': ('Cá/chim bay', GOC_NGANG, 'three fish close together in a loose triangle, all heads pointing right, tails to the left, top fins raised up with a white gap'),
    'oc': ('Cua/bọ', GOC_NGANG, 'the round shell at the back left, the crab head and one big claw raised at the front right with a white gap, short legs splayed down to the lower left and lower right'),
    'haiQuy': ('Cây/đứng yên', GOC_THANG, 'sitting on a small rock base at the bottom, a fat column body with the angry face in the middle, a crown of thick tentacles on top, two tentacles reaching out left and right with white gaps'),
    'caChuon': ('Cá/chim bay', GOC_NGANG, None), 'caNoc': ('Khối mềm', GOC_THANG, 'a round puffed-up ball body with the angry face in the middle, short spikes all around, two small fins sticking out low to the left and right with a white gap'),
    'sua': ('Khối mềm', GOC_THANG, 'a big round bell on top with the angry face, tentacles hanging straight down below, the two outer tentacles curling out to the lower left and lower right with a white gap'),
    'nhim': ('Khối mềm', GOC_THANG, 'a round spiky ball body with the angry face in the middle, spines sticking out all around, two tiny feet at the bottom, two spines sticking out low to the left and right'),
    'cuaTuong': ('Cua/bọ', GOC_THANG, None), 'caNocChua': ('Khối mềm', GOC_THANG, 'a big round puffed-up ball body with the angry face, tall ice spikes rising on top like a crown, two fins sticking out low to the left and right with a white gap'),
    'cuaDa': ('Cua/bọ', GOC_CHEO, None), 'nguTinh': ('Rắn', GOC_NGANG, None),
    'linhMa': ('Người', GOC_NGANG, None), 'doiThan': ('Cá/chim bay', GOC_CHEO, 'three bats close together in a loose triangle, faces toward the right, every pair of wings spread up and out with white gaps between them'),
    'tuongDa': ('Người', GOC_CHEO, None), 'denLong': ('Khối mềm', GOC_THANG, 'the lantern body floating, face in the middle, the top cap on top, the long tongue and two paper tassels hanging out low to the left and right with a white gap'),
    'meoDen': ('Bốn chân', GOC_NGANG, None), 'huLua': ('Khối mềm', GOC_THANG, 'a fat round jar body with the angry face, fire bursting out of the top, two pipe arms sticking out low to the left and right with a white gap, two stubby feet at the bottom'),
    'tieuYeu': ('Người', GOC_CHEO, None), 'nhimThan': ('Khối mềm', GOC_THANG, 'a round spiky coal-ball body with the angry face in the middle, glowing spines all around, two tiny feet at the bottom, two spines sticking out low to the left and right'),
    'tuongMa': ('Người', GOC_CHEO, None), 'huChua': ('Khối mềm', GOC_THANG, 'a fat round urn body with the angry face, flames and a crown on top, two handle-arms sticking out to the left and right with a white gap, three short legs at the bottom'),
    'hoLua': ('Bốn chân', GOC_NGANG, None), 'hoTinh': ('Bốn chân', GOC_NGANG, 'crouching low, stalking, head at the right end, the nine tails fanning up and out to the upper left behind it with white gaps between them, four legs down with white gaps'),
}
LOAI_TEN = {'thuong': 'normal monster', 'tinhanh': 'elite monster', 'trumnho': 'mini-boss', 'trum': 'region boss'}
DU = 'Fierce, menacing chibi monster for a pixel-art action game inspired by Vietnamese folklore: angry glowing eyes with heavy frowning brows, bared sharp fangs, exaggerated claws, spikes and horns, threatening and dangerous but still readable'
TINH_ANH = '. Elite version: bigger, scarred, more armor and spikes than normal monsters'
TRUM = '. Huge, terrifying boss presence: towering, glowing eyes, scars and battle damage (but no aura cloud around it)'

EM_BE = {'Thợ Rèn': 'smith', 'Thợ Săn': 'hunter', 'Thầy Lang': 'healer', 'Đô Vật': 'wrestler'}
VK = {'Kiếm': 'sword', 'Cung': 'bow', 'Giáo': 'spear', 'Búa': 'hammer'}
VK_EN = {'sword': 'sword', 'bow': 'bow', 'spear': 'spear', 'hammer': 'hammer'}
O_TP = {'Mũ': 'hats', 'Áo': 'robes', 'Đồ đeo lưng': 'backs', 'Bùa và vật cầm tay': 'hands', 'Dấu mặt nạ': 'masks', 'Cánh': 'wings'}
VP = {'Vàng (xu)': 'gold', 'Bình máu': 'potion', 'Linh khí Lửa': 'linhkhi-fire', 'Linh khí Độc': 'linhkhi-poison', 'Linh khí Băng': 'linhkhi-ice',
      'Quặng': 'ore', 'Đá tôi': 'stone', 'Gỗ linh (Rừng già)': 'mat0', 'Vảy cá (Hang biển)': 'mat1', 'Đá lửa (Lâu đài cổ)': 'mat2',
      'Mảnh Mộc Tinh': 'shard0', 'Mảnh Ngư Tinh': 'shard1', 'Mảnh Hồ Tinh': 'shard2', 'Kinh nghiệm': 'xp'}
TEN_QUAI = {o['ten']: m for m, o in DO.items() if o['nhom'] == 'quai'}
TEN_NL = {o['ten']: m for m, o in DO.items() if o['nhom'] == 'nguoi-lang'}
TEN_TP = {(o['o'], o['ten']): m for m, o in DO.items() if o['nhom'] == 'trang-phuc'}

KHOP = "redraw this character in the same pose and proportions, keep colors"
KHOP_DO = "redraw this item in the same angle and proportions, keep colors"


def chu_the(p):
    """Phần chủ thể của prompt cũ: mô tả hình và câu Twist (bỏ phần phong cách phía sau)."""
    i = p.find('Twist:')
    m = re.search(r'\. (Side view|Weapon lying|Bow standing|Clothing item|A small face-paint mark shown|ONE single wing|Tiny (?:game )?icon|One single object|Front view|3/4 view|Back item|Small item)', p[i:])
    return p[:i + m.start() + 1].strip()


def co_that(o, chu='tall'):
    return 'It will be shown in the game at only %d pixels %s (%d x %d pixels), so use big simple chunky shapes that still read at that size, no small patterns or tiny details, and draw the twist detail BIG and obvious.' % (
        o['cao'] if chu == 'tall' else o['rong'], chu, o['rong'], o['cao'])


def prompt_quai(sub, ma):
    o = DO[ma]
    khung, goc, dang = QUAI[ma]
    dang = dang or DANG[khung]
    du = DU + (TINH_ANH if o['loai'] == 'tinhanh' else TRUM if o['loai'] in ('trumnho', 'trum') else '')
    return ('%s %s, %s, aggressive pose leaning a little toward the right. Proportions like the game sprite: the whole figure is %s. %s Main colors as in the game (the twist detail may add its own colors): %s. %s. Pixel-art game sprite: %s. %s'
            % (sub, goc, dang, ti_le(o), co_that(o), mau_chinh(o), du, vien(o, 'navy-black'), NEN)), khung


def prompt_em_be(sub, ma):
    o = DO[ma]
    return ('%s %s (the body faces right, the face looks a little toward the viewer), %s, empty hands with no weapon (the game adds the weapon). '
            'Chibi proportions: a big head with its hood taking the top two fifths of the total height, a short cloak ending at two thirds of the height, then two short legs, the whole figure is %s. %s '
            'Main colors as in the game (the twist detail may add its own colors): %s; the face is a round pale mask-like face (#f6f0e2) with simple calm closed eyes. Cute chibi child hero inspired by Vietnamese folklore. Pixel-art game sprite: %s. %s'
            % (sub, GOC_CHEO, DANG['Người'], ti_le(o), co_that(o), mau_chinh(o), vien(o, 'dark plum', 'top right'), NEN))


def prompt_nl(sub, ma):
    o = DO[ma]
    return ('%s %s, %s, one hand free to wave. Chibi proportions like the game sprite: a big head about two fifths of the total height, the whole figure is %s. %s '
            'Main colors as in the game (the twist detail may add its own colors): %s; the face is a round white spirit mask (#f4eee0) with small dark dot eyes and pink cheeks. Cute chibi villager inspired by Vietnamese folklore and Dong Son bronze drum patterns. Pixel-art game sprite: %s. %s'
            % (sub, GOC_THANG, DANG['Người'], ti_le(o), co_that(o), mau_chinh(o), vien(o, 'dark purple', 'top'), NEN))


def prompt_vk(sub, ma, loai):
    o = DO[ma]
    if loai == 'bow':
        dat = ('Bow standing upright in flat side view: the bow string is one straight vertical line on the LEFT, the curved body of the bow bulges out to the RIGHT, both tips at the top and bottom, no arrow, a pair of small cute eyes in the middle of the bow (it is a living weapon). '
               'Proportions like the game: %s, shown in the game at only %d pixels tall' % (ti_le(o), o['cao']))
    else:
        dat = ('Weapon lying perfectly horizontal in flat side view: handle on the LEFT, the tip or head pointing to the RIGHT, the blade or head edge facing up, a pair of small cute eyes on the blade or head (it is a living weapon). '
               'Proportions like the game: %s, shown in the game at only %d pixels long and %d pixels thick' % (ti_le(o), o['rong'], o['cao']))
    return ('%s %s, so use big simple chunky shapes, no small patterns or tiny details, and draw the twist detail BIG and obvious. Main colors as in the game (the twist detail may add its own colors): %s. '
            'One single object only, nobody holding it. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: %s. %s'
            % (sub, dat, mau_chinh(o), vien(o, 'dark plum', 'top'), NEN))


DAT_TP = {
    'hats': 'Clothing item shown alone, not worn, nobody inside it, %s (the same angle it has on the chibi child in the game), the opening at the bottom as if it sat on a big round head' % GOC_CHEO,
    'robes': 'Clothing item shown alone, not worn, nobody inside it, %s (the same angle it has on the chibi child in the game), a short wide little tunic with short separate sleeves, as if hung on an invisible small body' % GOC_CHEO,
    'backs': 'Back item shown alone, nobody wearing it, %s, standing upright as it would hang on a small child\'s back' % GOC_CHEO,
    'hands': 'Small item shown alone, nobody holding it, standing upright in flat side view, hanging point at the top',
    'masks': 'A small face-paint mark shown alone and flat, front view, no face and no person around it',
    'wings': 'ONE single wing only, the wing root at the bottom right corner, the wing spreading up and to the left',
}


def prompt_tp(sub, ma, o_):
    o = DO[ma]
    return ('%s %s. Proportions like the game: %s. %s Main colors as in the game (the twist detail may add its own colors): %s. One single object only. Game item sprite for a pixel-art action game inspired by Vietnamese folklore and Dong Son bronze drum patterns: %s. %s'
            % (sub, DAT_TP[o_], ti_le(o), co_that(o), mau_chinh(o, 3), vien(o, 'dark plum', 'top right'), NEN))


def prompt_vp(sub, ma):
    o = DO[ma]
    return ('%s Tiny game icon in flat front view: it is shown in the game at only %d x %d pixels (resource bar, bag, shop and loot on the floor), so draw ONE bold simple silhouette with 2 or 3 flat colors plus the outline, high contrast, no small details; the twist detail must still read at that size. '
            'Proportions like the game: %s. Main colors as in the game (the twist detail may add its own colors): %s. One single object only. Game icon for a pixel-art action game inspired by Vietnamese folklore: %s. %s'
            % (sub, o['rong'], o['cao'], ti_le(o), mau_chinh(o, 3), vien(o, 'dark', 'top'), NEN))


def link(ma):
    return '[tham-chieu/%s.png](tham-chieu/%s.png)' % (ma, ma)


DAU = """# Prompt vẽ cho Xưởng Sprite: quái, em bé, vũ khí, trang phục, đồ và tài nguyên, người làng

**Cách dùng (3 bước):**

1. **Chép MỘT dòng trong khung xám** của hình cần vẽ, dán vào công cụ vẽ AI (ChatGPT, Gemini...). Dòng đã đủ mọi thứ, không phải thêm sửa gì.
2. **Muốn hình khớp game hơn:** gửi kèm ảnh tham chiếu ghi bên dưới dòng đó (hình đang có trong game, phóng to) và nói thêm câu tiếng Anh ghi ở đó.
3. **Đưa hình vào Xưởng Sprite** (spiritblade.web.app/xuong-sprite.html), chọn đúng thẻ và **chọn khung** ghi bên dưới, rồi tải tệp `.sprite.json` về gửi Claude.

Mỗi dòng đã ghi sẵn những gì đo được từ hình trong game (xem [DAC-DIEM-HINH-GAME.md](DAC-DIEM-HINH-GAME.md)): góc nhìn và hướng quay giống game, tỉ lệ rộng cao, cỡ thật (bao nhiêu điểm ảnh), màu chính kèm mã màu, số màu tối đa, viền tối dày một điểm ảnh, dáng tách tay chân đuôi cánh hợp với khung của Xưởng, nền trắng trơn, một hình duy nhất. Quái vẫn **hung dữ** (tinh anh và trùm đáng sợ hơn), em bé vẫn dễ thương, và nét phá cách dân gian Việt (câu `Twist:`) vẫn giữ nguyên.

Nếu hình ra chưa ưng, nhắn lại cho công cụ vẽ: `again, simpler bigger shapes, same angle, keep the arms and legs separated from the body`. Muốn dữ hơn: `make it scarier and more aggressive`.
"""

PHAN2 = """# Phần 2: vũ khí, trang phục, đồ và tài nguyên, người làng

Cách dùng y như phần trên: **chép đúng MỘT dòng trong khung xám** gửi cho công cụ vẽ AI. Vẽ xong, trong Xưởng Sprite mở nhóm ghi sau dấu `·` (ví dụ **Vũ khí › Kiếm, dòng 1**), chọn đúng thẻ, đưa hình vào.

- **Kiếm, giáo, búa** được vẽ nằm ngang, chuôi bên trái, mũi bên phải (đúng cách Xưởng tự đặt điểm cầm). **Cung** dựng đứng, dây bên trái, bụng cung bên phải.
- Trong Xưởng: vũ khí chỉ cần **chạm vào chỗ chuôi** để đặt điểm cầm tay (game tự xoay tám hướng, tự thêm ánh hệ và vệt chém); trang phục **kéo đặt lên em bé mẫu**; đồ và tài nguyên chỉ cần đưa hình.
- Muốn vũ khí riêng từng hệ (Lửa, Độc, Băng): dùng cùng dòng, thêm `glowing orange fire version` / `glowing green poison version` / `icy pale blue version` rồi chọn hệ ở bước 3.
"""


def main():
    lines = open(DOC, encoding='utf-8').read().split('\n')
    out = [DAU.rstrip('\n'), '']
    i = 0
    # bỏ phần đầu cũ (tới đường kẻ đầu tiên)
    while lines[i].strip() != '---':
        i += 1
    nhom = None
    dem = 0
    while i < len(lines):
        L = lines[i]
        if L.startswith('# Phần 2'):
            out.append(PHAN2.rstrip('\n'))
            out.append('')
            i += 1
            while lines[i].strip() != '---':  # bỏ đoạn giới thiệu cũ và "Phong cách chung"
                i += 1
            continue
        if L.startswith('## '):
            nhom = L[3:]
            out.append(L)
            i += 1
            continue
        if L.startswith('### '):
            tieu = L[4:]
            mota = []
            i += 1
            while lines[i] != '```':
                mota.append(lines[i])
                i += 1
            sub = chu_the(lines[i + 1])
            i += 3  # ``` prompt ```
            while i < len(lines) and (lines[i].startswith('- ') or not lines[i].strip()):  # ghi chú cũ dưới dòng prompt
                if not lines[i].strip() and i + 1 < len(lines) and not lines[i + 1].startswith('- '):
                    break
                i += 1
            ten = tieu.split(' · ')[0]
            ghi = None
            if nhom.startswith('Em bé'):
                ma = 'em-be-' + EM_BE[ten]
                p = prompt_em_be(sub, ma)
                ghi = 'Khung trong Xưởng: **Người (2 chân)**'
            elif nhom.startswith('Vũ khí'):
                loai = VK[nhom.split('· ')[1]]
                dong = int(re.search(r'dòng (\d+)', tieu).group(1)) - 1
                ma = 'vk-%s-%d' % (loai, dong)
                p = prompt_vk(sub, ma, loai)
                ghi = 'Không cần khung: chạm vào chỗ chuôi để đặt điểm cầm'
            elif nhom.startswith('Trang phục'):
                o_ = O_TP[nhom.split('· ')[1]]
                ma = TEN_TP[(o_, ten)]
                p = prompt_tp(sub, ma, o_)
                ghi = 'Không cần khung: kéo đặt lên em bé mẫu'
            elif nhom.startswith('Đồ và tài nguyên'):
                ma = 'vp-' + VP[ten]
                p = prompt_vp(sub, ma)
                ghi = 'Không cần khung: chỉ đưa hình vào'
            elif nhom.startswith('Người làng'):
                ma = TEN_NL[ten]
                p = prompt_nl(sub, ma)
                ghi = 'Khung trong Xưởng: **Người (2 chân)**'
            else:
                ten0 = re.sub(r' \(.*\)$', '', ten)
                ma = TEN_QUAI[ten0]
                p, khung = prompt_quai(sub, ma)
                tieu = re.sub(r'khung: .*$', 'khung: ' + khung, tieu)
                ghi = 'Khung trong Xưởng: **%s**' % KHUNG[khung]
            o = DO[ma]
            out.append('### ' + tieu)
            out.extend(m for m in mota if m.strip())
            out += ['', '```', p, '```', '']
            laNguoi = not (nhom.startswith('Vũ khí') or nhom.startswith('Trang phục') or nhom.startswith('Đồ'))
            out.append('- %s · Cỡ trong game: %d × %d điểm ảnh · Ảnh tham chiếu: %s' % (ghi, o['rong'], o['cao'], link(ma)))
            out.append("- Nếu muốn khớp hơn: đính kèm ảnh tham chiếu và nói `%s`" % (KHOP if laNguoi else KHOP_DO))
            out.append('')
            dem += 1
            continue
        out.append(L)
        i += 1
    txt = re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).rstrip('\n') + '\n'
    open(DOC, 'w', encoding='utf-8').write(txt)
    print('Đã viết', dem, 'dòng prompt')


if __name__ == '__main__':
    main()
