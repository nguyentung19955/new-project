#!/usr/bin/env python3
"""Sinh prompt v3 cho Zed v2 (tóc trắng, hai sừng — docs/anh-goc/zed/zed-v2-canonical.png, chốt 12/10 20:4x)
từ bộ gốc ninja/ (Zed ninja tóc đen — docs/anh-goc/zed/zed-canonical.png). Bố cục ô, số khung, mốc chạm GIỐNG HỆT nhau;
chỉ khác câu nhận diện + bộ đồ mặc định + chỗ chừa sừng ở mũ. Sửa prompt: sửa ninja/ (hoặc SUA bên dưới) rồi chạy lại tệp này.
"""
import glob, os
DAY = os.path.dirname(os.path.abspath(__file__))
THAY = [
    ('zed-canonical.png', 'zed-v2-canonical.png'),
    ('cùng mặt, tóc đen buộc cao dây đỏ, tỉ lệ đầu/thân, độ to điểm ảnh, viền tối, cách tô bóng. Quay mặt sang phải. KHÔNG sừng.',
     'cùng mặt, tóc trắng bù xù, HAI SỪNG cong đỏ sẫm, tai nhọn, mắt đỏ, tỉ lệ đầu/thân, độ to điểm ảnh, viền tối, cách tô bóng. Quay mặt sang phải.'),
    ('cả người Zed (đầu, tóc, da, đồ lót) tô #00FF00', 'cả người Zed (đầu, tóc, sừng, da, quần bó) tô #00FF00'),
    ('Chỗ tay hoặc tóc che món đồ', 'Chỗ tay, tóc hoặc sừng che món đồ'),
]
# Nhận diện v2: cởi trần → thân trơn giữ da thân; đồ mặc định = khăn + quấn tay (lớp "ao") và quần rộng + dép (lớp "quan")
SUA = {
    '01-than-tron': {
        'Thay toàn bộ quần áo bằng ĐỒ LÓT BÓ màu xám than (#2b2a33): áo bó tay dài tới cổ tay, quần bó dài tới mắt cá, bàn chân bọc tất đen mỏng.':
        'GIỮ cởi trần (da thân, cơ bụng như cũ). Thay quần đen rộng bằng QUẦN BÓ màu xám than (#2b2a33) dài tới mắt cá; chân trần.',
        'BỎ khăn đỏ, bỏ đai, bỏ giày, bỏ tay áo trắng. GIỮ đầu, mặt, tóc, dây buộc tóc đỏ, bàn tay da y nguyên.':
        'BỎ khăn đỏ, bỏ quấn tay đen đỏ, bỏ dây thắt đỏ, bỏ dép. GIỮ đầu, mặt, tóc trắng, hai sừng, tai nhọn, bàn tay da y nguyên.',
        'Hàng 3 (chạy): đặt người lùi vào giữa ô để tóc mái không chạm mép phải ô, đuôi tóc không chạm mép trái.':
        'Hai sừng và chỏm tóc không chạm mép trên ô; tay vung khi chạy không chạm mép phải.',
    },
    '02-ao-mac-dinh': {
        'Vẽ CHỈ phần áo mặc định của Zed như canonical: áo ngắn tay tối màu, tay áo trắng xắn tới khuỷu, khăn đỏ quấn cổ + 2 đuôi khăn bay phía sau, đai vải đỏ trắng buộc hông, bao cổ tay nâu.':
        'Vẽ CHỈ phần đồ thân trên mặc định của Zed như canonical: khăn quàng đỏ quấn cổ + đuôi khăn bay phía sau, và đôi quấn tay / găng hở ngón đen viền đỏ hoa văn vàng ở hai cẳng tay. Zed cởi trần: KHÔNG vẽ áo.',
        'Áo phủ xuống quá cạp quần 1–2 điểm ảnh (để không hở khi ghép với quần).':
        'Quấn tay ôm khít cẳng tay, không lệch khỏi tay khi vung.',
    },
    '10-ao-mac-dinh-kiem': {
        'Vẽ CHỈ phần áo mặc định (áo tối, tay áo trắng, khăn đỏ quấn cổ + đuôi khăn, đai đỏ trắng, bao cổ tay nâu) khớp từng ô của ảnh 09.':
        'Vẽ CHỈ phần đồ thân trên mặc định (khăn quàng đỏ + đuôi khăn, quấn tay đen viền đỏ hoa văn vàng; KHÔNG áo) khớp từng ô của ảnh 09.',
        'Áo phủ quá cạp quần 1–2 điểm ảnh. Ô trống của ảnh 09 cũng để trống.': 'Ô trống của ảnh 09 cũng để trống.',
    },
    '03-quan-giay-mac-dinh': {
        'Vẽ CHỈ quần rộng tối màu bó ống ở bắp chân và đôi giày vải nâu buộc dây như canonical.':
        'Vẽ CHỈ quần đen rộng có vệt đỏ, dây thắt đỏ buộc nơ ở hông, ống bó ở cổ chân, và đôi dép xỏ ngón đế trắng quai đen như canonical.',
        'Ống quần phồng phủ lên cổ giày 1–2 điểm ảnh; cạp quần dừng ở hông (áo sẽ phủ lên).':
        'Ống quần phủ cổ chân 1–2 điểm ảnh; cạp quần + dây thắt đỏ nằm ở hông.',
    },
    '11-quan-giay-mac-dinh-kiem': {
        'Vẽ CHỈ quần rộng tối và giày vải nâu, khớp đúng chân từng ô ảnh 09 (bước lùi, nhón, ngồi thấp ở nhát 3).':
        'Vẽ CHỈ quần đen rộng vệt đỏ, dây thắt đỏ và dép xỏ ngón, khớp đúng chân từng ô ảnh 09 (bước lùi, nhón, ngồi thấp ở nhát 3).',
        'Ống quần phủ cổ giày 1–2 điểm ảnh.': 'Ống quần phủ cổ chân 1–2 điểm ảnh.',
    },
    '05-non-la': {
        'Chỉ có chiếc nón, KHÔNG có đầu, tóc hay người.': 'Khoét HAI LỖ trên mặt nón cho hai sừng của Zed nhô qua (vị trí sừng như canonical). Chỉ có chiếc nón, KHÔNG có đầu, tóc, sừng hay người.',
    },
    '31-mu-giap': {
        'Đuôi tóc buộc của Zed sẽ bị mũ che (mũ trùm kín).': 'Mũ che kín tóc nhưng có HAI LỖ viền đồng cho hai sừng nhô qua (vị trí như canonical).',
        'Chỉ có chiếc mũ, không đầu, không tóc, không người.': 'Chỉ có chiếc mũ, không đầu, không tóc, không sừng, không người.',
    },
    '24-giap-vai-do': {}, '04-giap-tre': {
        'Giáp RỘNG hơn thân trơn 1–2 điểm ảnh mỗi bên, phủ xuống quá cạp quần;': 'Giáp RỘNG hơn thân trơn 1–2 điểm ảnh mỗi bên, phủ xuống quá cạp quần (che da thân);',
    },
}
n = 0
for p in sorted(glob.glob(os.path.join(DAY, 'ninja', '*.txt'))):
    ten = os.path.splitext(os.path.basename(p))[0]
    s = open(p, encoding='utf-8').read()
    for a, b in SUA.get(ten, {}).items():
        assert a in s, (ten, a[:40])
        s = s.replace(a, b)
    for a, b in THAY:
        s = s.replace(a, b)
    open(os.path.join(DAY, ten + '.txt'), 'w', encoding='utf-8', newline='\n').write(s)
    n += 1
print('Đã sinh %d prompt bản v2 (tóc trắng, sừng) vào prompt-v3/' % n)
