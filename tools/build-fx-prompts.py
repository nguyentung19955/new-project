#!/usr/bin/env python3
"""Sinh docs/PROMPT-HIEU-UNG.txt: prompt gen lại MỌI hiệu ứng game đang có, chia 4 phần:
  A. 32 ảnh hạt Kenney (assets/fx/, trắng xám, game tự tô màu)      → cắt: tools/cat-fx.py hat
  B. 17 dải khung hiệu ứng vẽ tay (assets/vfx/, game đã có chỗ nhận) → cắt: tools/cat-fx.py dai
  C. 6 ảnh triệu hồi / vật thể (assets/, game đã có chỗ nhận)          → cắt: tools/cat-fx.py don
  D. hiệu ứng / đạn bay hiện vẽ bằng code (cần thêm vài dòng code mới dùng được ảnh)
Danh sách lấy theo js/vfx.js (ảnh Kenney), VFX_FILE trong js/render.js, drawEffects / drawProjectile trong js/main.js.
  python3 tools/build-fx-prompts.py"""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'docs', 'PROMPT-HIEU-UNG.txt')
LINE, BAR = '-' * 60, '=' * 60

GREY = ('STYLE: game VFX particle texture in the style of the free Kenney Particle Pack: ONLY pure white and light-grey shapes '
        'on a perfectly flat pure BLACK #000000 background, soft glowing edges, bright core, NO color at all (the game tints it), '
        'no outline, no shading other than brightness, no text, no numbers, no labels, no grid lines, no borders, no watermark. '
        'Each shape centered in its own cell with at least 8% empty black margin; nothing touches or crosses into another cell.')
COLOR_BLACK = ('BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). '
               'Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. '
               'The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.')
COLOR_MAGENTA = ('BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. '
                 'No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. '
                 'Centered in every cell with at least 6% empty margin; nothing crosses into another cell.')
CHIBI = ('STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, '
         'flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.')
DRUM = 'Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.'

# ---------- A. ảnh hạt Kenney: 8 tấm × 4 ô (mỗi ô 256), tên file giữ nguyên để thay thẳng
HAT = [
    ('Vòng tròn', [
        ('circle_02', 'a thick glowing ring (donut): bright soft white band, empty black hole in the middle, ring fills about 80% of the cell'),
        ('circle_03', 'a double ring: a thin bright outer rim and a slightly darker grey inner band, empty black center, fills about 85% of the cell'),
        ('circle_05', 'a small soft blurry glowing dot, round, brightest in the middle and fading smoothly to black, about 40% of the cell'),
        ('light_03', 'a big soft hazy light disc with faint engraved concentric rings like the face of a bronze drum, low contrast, fills about 85% of the cell'),
    ]),
    ('Vòng phép', [
        ('magic_01', 'a magic seal: five small hollow circles placed on a pentagon, joined by thin straight lines, thin and delicate, fills about 75% of the cell'),
        ('magic_02', 'a magic ring: seven small hollow circle-dot medallions evenly spaced on an invisible circle (like the circle-dot band of a bronze drum), fills about 75% of the cell'),
        ('magic_03', 'a bronze-drum sun-star seal: a thin bright ring with four long sharp pointed rays sticking out up, down, left and right like a compass star, fills about 90% of the cell'),
        ('magic_05', 'a soft four-pointed sparkle: a blurry bright core with four short soft rays, glowing, about 60% of the cell'),
    ]),
    ('Lửa', [
        ('fire_01', 'a ragged burst of flame fragments seen from above: bright patchy cloud with torn edges and small sparks around it, about 70% of the cell'),
        ('fire_02', 'a darker, denser ragged fire blotch with swirling smoky texture, grey with bright highlights, about 65% of the cell'),
        ('flame_05', 'one single tall flame tongue rising straight UP, wide rounded base at the bottom, tip at the top, about 70% of the cell height'),
        ('flame_06', 'one thin wavy flame flickering UP with a curled tip, narrow, about 70% of the cell height'),
    ]),
    ('Nổ / cháy / đất', [
        ('muzzle_02', 'a teardrop-shaped flame burst pointing UP: bright round bottom, tapered tip on top, very bright core, about 60% of the cell'),
        ('scorch_01', 'a small explosion splat: bright jagged core with short spiky rays and sparks all around, about 60% of the cell'),
        ('scorch_02', 'a bigger rough explosion splat with irregular blobby core and spiky edges, about 65% of the cell'),
        ('dirt_01', 'a splash of scattered small stones, pebbles and dirt clumps flying out from the center, grey and white chunks, about 75% of the cell'),
    ]),
    ('Khói / lóa', [
        ('smoke_03', 'a small cluster of puffy smoke blobs, soft grey with lighter tops, about 50% of the cell'),
        ('smoke_07', 'a big fluffy smoke cloud, soft grey, cauliflower edges, about 85% of the cell'),
        ('smoke_09', 'a ring of puffy smoke (donut cloud) with a darker hole in the middle, about 85% of the cell'),
        ('flare_01', 'a tiny very bright dot with one thin horizontal lens-flare line through it, mostly black cell'),
    ]),
    ('Vệt chém', [
        ('slash_01', 'a crescent slash arc curving like a smile (open upward), thick bright middle tapering to sharp thin ends, in the lower half of the cell'),
        ('slash_03', 'a tall thin crescent slash arc on the right side of the cell, curving like ")", thick bright middle tapering to sharp ends, nearly full cell height'),
        ('scratch_01', 'three parallel claw scratch streaks going diagonally from bottom-left to top-right, bright sharp lines with tapered ends'),
        ('trace_05', 'a thin vertical light streak (motion trail), brightest in the middle, fading at the top and bottom ends, about 70% of the cell height'),
    ]),
    ('Sét / xoáy', [
        ('spark_01', 'small crackling electric sparks: a short jagged horizontal lightning crack with tiny branches and dots, about 70% of the cell width'),
        ('spark_06', 'one tall jagged lightning bolt going straight down from the TOP edge area to the BOTTOM edge area of the cell, thin side branches, full cell height minus margin'),
        ('twirl_01', 'a thick swirling wind arc like a big "C" (a whirl / spin trail), bright leading edge fading toward the tail, about 85% of the cell'),
        ('twirl_02', 'two thin concentric swirl arcs with motion blur, like a fast spin trail, about 85% of the cell'),
    ]),
    ('Ngôi sao', [
        ('star_04', 'a small soft four-point twinkle star, faint rays, about 40% of the cell'),
        ('star_06', 'a bright four-point star with long thin horizontal and vertical rays, small hot core, rays reach about 90% of the cell'),
        ('star_08', 'a thin X-shaped star: four long thin diagonal rays crossing, plus a small ring around the bright center'),
        ('star_09', 'a big bright starburst with many rays of different lengths and a large glowing core (like the sun-star in the middle of a bronze drum), about 80% of the cell'),
    ]),
]

# ---------- B. dải khung vẽ tay (js/render.js VFX_FILE): ngang N ô vuông, game chọn khung theo tiến độ 0→1
# (tên file, loại hiệu ứng game, mô tả Việt, nền, mô tả từng khung tiếng Anh)
N_FRAMES = 6
DAI = [
    ('fire-pillar', 'pillar', 'Cột lửa phun từ đất (chiêu lửa)', 'black',
     'a pillar of fire erupting from the ground: [1] small glowing crack and sparks at the bottom [2] flames shoot up half height [3] full tall roaring fire pillar, orange-red with yellow core [4] pillar at full height, flames twisting [5] pillar breaking into embers [6] few embers and thin smoke fading'),
    ('fire-burst', 'explosion', 'Vụ nổ lửa', 'black',
     'a round fire explosion: [1] tiny bright yellow flash in the center [2] expanding orange fireball [3] biggest fireball with spiky edges and flying sparks [4] fire turning into dark-orange smoke ring [5] smoke ring wider, embers [6] faint smoke fading'),
    ('ice-ring', 'nova', 'Vòng băng toả ra', 'black',
     'an ice shockwave ring seen at a slight top-down angle (flattened ellipse): [1] small icy-blue flash in center [2] ring of ice shards expanding [3] wide ring with sharp crystals pointing outward [4] ring at full size, shards glinting white [5] shards breaking into snow sparkles [6] faint sparkles fading'),
    ('freeze', 'snow', 'Đóng băng / tuyết phủ', 'black',
     'a freezing frost effect: [1] a few snowflakes falling [2] more snowflakes, frosty mist [3] ice crystals forming in a cluster [4] full icy block of crystals with white highlights [5] crystals cracking [6] snow dust fading'),
    ('water-wave', 'wave', 'Sóng nước cuộn', 'black',
     'a curling river wave rushing to the RIGHT: [1] small rising water bump [2] wave growing, white foam on top [3] big curling blue wave with foam crest (Thuy Tinh water style) [4] wave crashing forward, splashes [5] splashes and droplets [6] droplets fading'),
    ('lightning', 'bolt', 'Sét đánh xuống', 'black',
     'a lightning strike from the sky: [1] small spark at the top of the cell [2] thin jagged bolt halfway down [3] full bright bolt from top to ground, white core with violet-blue glow, small flash at the bottom [4] bolt flickering, branches [5] bolt fading, electric sparks on the ground [6] faint sparks'),
    ('slash-gold', 'slash / xslash / claw', 'Vệt chém vàng', 'black',
     'a golden sword slash: [1] thin bright line starting at the upper left [2] crescent slash arc half drawn [3] full wide golden crescent slash with white core [4] second crossing slash forming an X [5] slashes thinning with sparks [6] faint golden sparks'),
    ('heal', 'heal', 'Hồi máu (lá xanh, ánh sáng xanh bay lên)', 'black',
     'a healing effect: [1] a soft green glow circle on the ground [2] small green leaves and light dots rising [3] more leaves and a plus-shaped sparkle rising [4] gentle green light column with rising leaves [5] leaves floating higher, fading [6] few sparkles'),
    ('shield-gold', 'dome', 'Khiên vòm vàng (trống đồng)', 'black',
     'a protective golden dome: [1] a thin golden ring on the ground [2] dome rising half, engraved with bronze-drum zigzag bands [3] full translucent golden dome with a sun-star on top [4] dome glowing brighter, small Lac birds circling [5] dome cracking into light shards [6] fading golden dust'),
    ('rocks', 'rockfall / cracks', 'Đá rơi / đất nứt', 'magenta',
     'falling rocks and cracking ground: [1] a few small rocks in the air [2] rocks falling, dust [3] rocks hitting the ground, ground cracks [4] big dust cloud and cracked earth [5] dust settling, rubble [6] small rubble and thin dust'),
    ('coins', 'drop', 'Đồng xu rơi (quái chết rơi vàng)', 'magenta',
     'bronze coins with a square hole popping out: [1] one coin jumping up [2] three coins flying up and outward [3] coins at the top, spinning, glinting [4] coins falling down [5] coins bouncing on the ground [6] coins shining then fading'),
    ('music-notes', 'notes', 'Nốt nhạc (đàn thần)', 'black',
     'magic music notes from a lute: [1] one small golden note appears [2] three notes floating up in a wave [3] many golden and cyan notes swirling, sparkles [4] notes spreading outward [5] notes fading [6] faint sparkles'),
    ('spawn-ring', 'summon', 'Vòng triệu hồi', 'black',
     'a summoning circle (flattened ellipse on the ground): [1] small green-gold ring appears [2] ring expands with circle-dot bronze-drum pattern [3] light column rising from the ring [4] bright flash with a sun-star in the middle [5] column fading [6] ring fading'),
    ('dust', 'die', 'Quái chết tan thành bụi', 'black',
     'a monster vanishing into dust: [1] small puff of pale smoke [2] bigger puff with light-blue sparkles [3] round cloud of dust and spirit sparkles [4] cloud breaking up, sparkles rising [5] thin wisps [6] almost gone'),
    ('hit-spark', 'bash', 'Đập trúng (tia lửa va chạm)', 'black',
     'a heavy hit impact: [1] small white flash [2] star-shaped impact burst, yellow-white [3] biggest burst with radiating sparks and a ground shock ring [4] sparks flying outward [5] sparks thinning [6] faint sparks'),
    ('flood-rise', 'floodrise', 'Nước dâng (Thủy Tinh)', 'black',
     'flood water rising: [1] water ripples on the ground [2] water level rising, small waves [3] high blue water wall with foam crest [4] wave peak, splashing [5] water falling back [6] ripples fading'),
    ('mountain-rise', 'raise', 'Núi đá trồi lên (Sơn Tinh)', 'magenta',
     'a rocky green mountain pushing up from the ground: [1] ground cracking, pebbles [2] rocky peak breaking through [3] mountain half up, dust [4] full small green-topped stone mountain, dust clouds [5] mountain standing, dust settling [6] mountain with small rubble around'),
]

# ---------- C. ảnh rời game đã có chỗ nhận (js/main.js) — vẽ kiểu chibi như tướng, nền hồng tím
DON = [
    ('trieu-hoi_ho-ba-vi', 'Hổ Ba Vì (vồ tới mục tiêu, cao ~34 px trên màn)', 'a fierce but cute orange tiger of Ba Vi mountain leaping forward to pounce, front paws stretched out, mouth open, black stripes, small bronze collar, side view facing RIGHT, whole body'),
    ('trieu-hoi_chim-lac', 'Chim Lạc (bay mổ quái, cao ~22 px)', 'a Lac bird from the Dong Son bronze drum flying RIGHT, long beak, long crest feathers and long tail, wings spread, bronze-gold with teal patina accents, side view'),
    ('trieu-hoi_chim-than', 'Chim thần (bay mổ quái, cao ~22 px)', 'a small white-and-gold divine bird flying RIGHT, wings spread, glowing tail feathers, side view'),
    ('trieu-hoi_cay-da-than', 'Cây đa thần (mọc lên hồi máu, cao ~110 px)', 'a magical banyan tree growing from the ground: thick twisted trunk, hanging aerial roots, round dense green crown with small golden glowing leaves, roots spread at the base, full tree standing on its base'),
    ('hieu-ung_da-lan', 'Tảng đá lăn (Lạc Hầu, game tự xoay, vẽ ~44 px)', 'a round rolling boulder seen from the side: grey-brown stone ball with cracks, a little moss, a carved bronze-drum sun-star on its face, perfectly round outline'),
    ('trieu-hoi_lac-tu', 'Lạc tử (lính triệu hồi — đã có ảnh, vẽ lại nếu muốn)', 'a small Lac child warrior: little boy in a bronze-drum patterned loincloth, feather headband, holding a short bronze spear and a small round shield, standing, facing RIGHT, whole body'),
]

# ---------- D. đang vẽ bằng code (chưa có chỗ nhận ảnh — cần thêm code)
DAN = [
    ('dan_fireball', 'fireball', 'a small flaming fireball flying RIGHT with a short fire tail'),
    ('dan_frostbolt', 'frostbolt', 'an ice shard bolt flying RIGHT, pale blue crystal with frosty trail'),
    ('dan_arrow', 'arrow', 'a wooden arrow with a bronze head and white feather fletching pointing RIGHT'),
    ('dan_bolt', 'bolt', 'a short crossbow bolt (no) pointing RIGHT, bronze tip, golden glint'),
    ('dan_orb', 'orb', 'a glowing water orb, light-blue sphere with a white swirl inside'),
    ('dan_feather', 'feather', 'a single glowing white-pink goose feather flying RIGHT'),
    ('dan_petal', 'petal', 'a pink lotus petal spinning, soft glow'),
    ('dan_melon', 'melon', 'a small green watermelon (Mai An Tiem) with dark stripes'),
    ('dan_rice', 'rice', 'a small bundle of golden rice grains flying RIGHT'),
    ('dan_evil', 'evil', 'a dark-blue evil water spirit ball with a grumpy face and a wispy tail, flying RIGHT'),
]
CODE_DAI = [
    ('vortex', 'Xoáy cát / gió quanh tướng', 'black', 'a spinning sand-and-wind vortex: [1] small swirl [2] swirl growing with sand grains [3] full tornado swirl, tan and white [4] spinning faster [5] breaking apart [6] fading grains'),
    ('sweep', 'Gậy tre quét vòng cung', 'black', 'a sweeping arc of a bamboo staff: [1] start of a green-ivory arc on the left [2] half arc [3] full wide arc with leaf bits [4] arc trail thinning [5] few bamboo leaves [6] fading'),
    ('meteor', 'Thiên thạch / đá lửa rơi', 'black', 'a flaming rock falling diagonally from upper right to lower left: [1] small fiery dot top-right [2] rock with fire tail [3] closer, bigger tail [4] about to hit [5] impact flash [6] smoke'),
    ('revive', 'Hồi sinh (cột sáng vàng)', 'black', 'a golden revive light column: [1] gold dot on ground [2] thin column rising [3] full column with a sun-star at the top and rising sparkles [4] column glowing [5] column thinning [6] sparkles fading'),
    ('volley', 'Bắn loạt tên', 'black', 'a fan of five light arrows shooting RIGHT: [1] arrows appear at the left [2] spread forming a fan [3] full fan with streaks [4] streaks stretching [5] thinning [6] faint streaks'),
    ('rain', 'Mưa tên / mưa đá trúng vùng', 'black', 'many arrows raining down onto an area (slightly top-down): [1] few arrows at the top [2] more arrows falling [3] arrows hitting, dust puffs [4] full rain hitting [5] fewer [6] dust fading'),
    ('ring', 'Vòng sóng toả (đánh lan, lên cấp)', 'black', 'a thin expanding shockwave ring (flattened ellipse): [1] small ring [2] bigger [3] bigger and brighter [4] biggest [5] thin [6] gone'),
    ('streak', 'Tia nước / tia sáng bắn thẳng', 'black', 'a straight water beam going from LEFT to RIGHT across the cell: [1] short beam start [2] half length [3] full length bright beam with white core [4] beam pulsing with droplets [5] thinning [6] droplets'),
    ('mark', 'Dấu đánh dấu mục tiêu (săn)', 'black', 'a red-orange target mark above an enemy: [1] small circle [2] circle with four inward arrows [3] full crosshair seal with bronze-drum dots, bright [4] pulsing [5] shrinking [6] fading'),
    ('warn', 'Vùng cảnh báo sắp trúng chiêu', 'black', 'a warning area on the ground (flattened ellipse): [1] faint ring [2] ring with dashed inner circle [3] bright pulsing red ring [4] dimmer [5] bright again [6] fading'),
    ('afterimage', 'Bóng mờ lướt tới (lướt chém)', 'black', 'a green dash trail of speed lines from LEFT to RIGHT: [1] short streaks [2] longer [3] full ghostly speed trail [4] trail breaking [5] thin [6] faint'),
    ('hook', 'Dây móc kéo quái', 'black', 'a vine rope with a hook shooting RIGHT then pulling back: [1] short vine [2] half [3] full vine with hook [4] hook caught, vine tight [5] pulling back [6] short vine'),
    ('lob', 'Vật ném vòng cung (hũ, đá)', 'magenta', 'a clay jar thrown in an arc, tumbling: [1] jar upright [2] tilted 60 degrees [3] sideways [4] upside down [5] tilted [6] almost upright'),
]
CODE_DON = [
    ('trieu-hoi_ngua-sat', 'Ngựa sắt Thánh Gióng phun lửa (phi dọc sông)', 'the iron horse of Saint Giong galloping RIGHT, black iron armor plates, flaming red-orange mane and tail, breathing a small fire jet from its mouth, side view, whole body'),
    ('trieu-hoi_giong-bay', 'Thánh Gióng cưỡi ngựa bay dọc sông (skyride)', 'young giant hero Saint Giong riding the flying iron horse to the RIGHT, swinging an uprooted bamboo cane, flame trail behind, side view'),
]


def block(title, meta, text):
    return f'\n{title}\n{meta}\n{LINE}\n{text}\n{LINE}\n'


def main():
    o = []
    o.append('PROMPT TẠO HIỆU ỨNG — THẦN THOẠI VIỆT\n' + BAR + '\n'
             'Mọi hiệu ứng game đang có, chia 4 phần. Mỗi khối là MỘT ảnh: chép phần giữa hai đường kẻ ---- dán vào AI tạo ảnh,\n'
             'tải ảnh về, lưu đúng "Tên file", gửi lại để cắt vào game (lệnh cắt ghi trên mỗi khối).\n\n'
             'KHÁC VỚI TƯỚNG / QUÁI:\n'
             '- Hiệu ứng KHÔNG cần ảnh mẫu nhân vật. Nếu AI cho đính kèm, gửi kèm ảnh mau-hieu-ung-kenney.png (32 ảnh hạt hiện tại) làm mẫu kiểu dáng.\n'
             '- Phần A: chỉ trắng / xám trên nền ĐEN. Game tự tô màu theo chiêu (lửa đỏ, băng xanh, phép vàng…), nên tuyệt đối không cho AI tô màu.\n'
             '- Phần B và D (dải khung): có màu, nền ĐEN cho hiệu ứng phát sáng (lửa, băng, sét, phép) và nền hồng tím #FF00FF cho vật đặc (đá, xu, núi).\n'
             '  Mỗi dải = 6 ô vuông nằm ngang một hàng (ảnh 1536x256), đọc trái → phải từ lúc bắt đầu tới lúc tắt.\n'
             '- Phần C và D (ảnh rời): vẽ kiểu chibi giống tướng, nền hồng tím, quay mặt sang PHẢI.\n\n'
             'NHỊP TRONG GAME: hiệu ứng rất nhanh, 0,2–0,9 giây. Game tự chọn khung theo tiến độ (khung 1 = lúc bắt đầu, khung 6 = lúc tắt),\n'
             'tự phóng to / thu nhỏ theo bán kính chiêu (tối thiểu 60 px) và đặt tâm dải hơi cao hơn điểm trúng.\n\n'
             'CẮT (chạy trong thư mục dự án):\n'
             '  A: python3 tools/cat-fx.py hat <ảnh> <tên1> <tên2> <tên3> <tên4>   → assets/fx/<tên>.png (thay thẳng ảnh Kenney)\n'
             '  B: python3 tools/cat-fx.py dai <ảnh> <tên>                         → assets/vfx/<tên>.png (game tự dùng ngay)\n'
             '  C: python3 tools/cat-fx.py don <ảnh> <tên>                         → assets/<tên>.png (game tự dùng ngay)\n'
             '  D: cắt như B / C, nhưng cần thêm vài dòng code để game dùng (nhờ Claude: "nối hiệu ứng <tên> vào game").\n'
             'Lưu ý phần B: khi đã có ảnh, ảnh dải THAY hẳn phần vẽ bằng code của hiệu ứng đó (hạt Kenney đi kèm vẫn chạy).\n'
             'Sau khi cắt: tăng phiên bản game theo CLAUDE.md.\n')
    o.append(f'\n\nPHẦN A — 32 ẢNH HẠT (KENNEY), 8 TẤM × 4 Ô\n{BAR}\n'
             'Đang dùng cho: vết chém / vuốt khi đánh, vòng sóng đất, vòng phép dưới chân khi tung chiêu, nổ, khói, lửa, sét, sao lấp lánh, đuôi đạn.\n'
             'Tên file giữ nguyên tên Kenney để thay thẳng. Giữ đúng HƯỚNG hình (vd flame_05 hướng lên, spark_06 dọc, slash_03 cong bên phải).\n')
    for i, (name, cells) in enumerate(HAT, 1):
        names = [c[0] for c in cells]
        text = (f'Create ONE image: a 1024x256 row of four equal 256x256 square cells, one visual-effect texture per cell, left to right.\n'
                + '\n'.join(f'[{j}] {d}.' for j, (_, d) in enumerate(cells, 1))
                + f'\n{GREY}\n{DRUM}')
        o.append(block(f'A{i}. {name}: {", ".join(names)}', f'Tên file: hat-{i}.png  ->  Cắt: python3 tools/cat-fx.py hat hat-{i}.png {" ".join(names)}', text))
    o.append(f'\n\nPHẦN B — 17 DẢI KHUNG HIỆU ỨNG CHIÊU (game đã có chỗ nhận)\n{BAR}\n'
             'Mỗi dải 6 ô vuông 256x256 một hàng (ảnh 1536x256). Thứ tự khung = thời gian: 1 bắt đầu → 3–4 mạnh nhất → 6 tắt dần.\n')
    for i, (f, typ, vi, bg, frames) in enumerate(DAI, 1):
        text = (f'Create ONE image: a 1536x256 horizontal animation strip of {N_FRAMES} equal 256x256 square frames in ONE row, read left to right, '
                f'for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.\n'
                f'EFFECT: {frames}.\n'
                f'STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), {DRUM}\n'
                + (COLOR_BLACK if bg == 'black' else COLOR_MAGENTA))
        o.append(block(f'B{i}. {vi}  (hiệu ứng game: {typ})', f'Tên file: {f}.png  ->  Cắt: python3 tools/cat-fx.py dai {f}.png {f}', text))
    o.append(f'\n\nPHẦN C — ẢNH TRIỆU HỒI / VẬT THỂ (game đã có chỗ nhận)\n{BAR}\n'
             'Mỗi ảnh một vật, quay sang PHẢI, kiểu chibi giống tướng. Ảnh hiển thị nhỏ trên màn nên hình phải đậm, rõ bóng.\n')
    for i, (f, vi, desc) in enumerate(DON, 1):
        text = (f'Create ONE image: a 512x512 single game sprite, one object centered, filling about 85% of the image.\n'
                f'SUBJECT: {desc}. Readable at 30 px.\n{CHIBI}\n{COLOR_MAGENTA}')
        o.append(block(f'C{i}. {vi}', f'Tên file: {f}.png  ->  Cắt: python3 tools/cat-fx.py don {f}.png {f}', text))
    o.append(f'\n\nPHẦN D — ĐANG VẼ BẰNG CODE (cần thêm code mới dùng được ảnh)\n{BAR}\n'
             'Gen trước cũng được; khi có ảnh nhờ Claude "nối hiệu ứng / đạn <tên> vào game". Hiệu ứng chỉ là chữ / làm tối màn (banner, text, dim, flash, dive) không cần ảnh.\n')
    for k in range(2):
        part = DAN[k * 5:(k + 1) * 5]
        text = (f'Create ONE image: a 640x128 row of five equal 128x128 square cells, one small flying projectile per cell, left to right, all pointing RIGHT where they have a direction:\n'
                + '\n'.join(f'[{j}] {d}.' for j, (_, _, d) in enumerate(part, 1))
                + f'\nEach projectile centered, about 60% of the cell, bold and readable at 16 px.\n{CHIBI}\n{COLOR_MAGENTA}')
        o.append(block(f'D{k + 1}. Đạn bay: {", ".join(p[1] for p in part)}', f'Tên file: dan-{k + 1}.png  ->  Cắt: python3 tools/cat-fx.py hat dan-{k + 1}.png {" ".join(p[0] for p in part)}  (thêm --mau để giữ màu)', text))
    for i, (f, vi, bg, frames) in enumerate(CODE_DAI, 3):
        text = (f'Create ONE image: a 1536x256 horizontal animation strip of {N_FRAMES} equal 256x256 square frames in ONE row, read left to right, '
                f'for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.\n'
                f'EFFECT: {frames}.\n'
                f'STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, {DRUM}\n'
                + (COLOR_BLACK if bg == 'black' else COLOR_MAGENTA))
        o.append(block(f'D{i}. {vi}  (hiệu ứng game: {f})', f'Tên file: {f}.png  ->  Cắt: python3 tools/cat-fx.py dai {f}.png {f}', text))
    for i, (f, vi, desc) in enumerate(CODE_DON, 3 + len(CODE_DAI)):
        text = (f'Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.\n'
                f'SUBJECT: {desc}. Readable at 40 px.\n{CHIBI}\n{COLOR_MAGENTA}')
        o.append(block(f'D{i}. {vi}', f'Tên file: {f}.png  ->  Cắt: python3 tools/cat-fx.py don {f}.png {f}', text))
    open(OUT, 'w', encoding='utf8').write(''.join(o))
    n = len(HAT) + len(DAI) + len(DON) + 2 + len(CODE_DAI) + len(CODE_DON)
    print('PROMPT-HIEU-UNG.txt:', n, 'ảnh (A', len(HAT), '· B', len(DAI), '· C', len(DON), '· D', 2 + len(CODE_DAI) + len(CODE_DON), ')')


if __name__ == '__main__':
    main()
