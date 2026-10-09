"""Viết docs/xuong-sprite/DAC-DIEM-HINH-GAME.md từ số đo (do-dac.json, do tao_anh.py ghi ra).
Chạy: python3 docs/xuong-sprite/tham-chieu/viet_dac_diem.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from viet_prompt import DO, QUAI, KHUNG, GOC_NGANG, GOC_CHEO, ti_le  # noqa: E402

OUT = os.path.join(HERE, '..', 'DAC-DIEM-HINH-GAME.md')
GOC_VN = {GOC_NGANG: 'nhìn ngang, quay phải', GOC_CHEO: 'chéo 3/4, quay phải', 'Front view facing the viewer (turned only slightly to the right)': 'chính diện (hơi chếch phải)'}
LOAI = {'thuong': 'thường', 'tinhanh': 'tinh anh', 'trumnho': 'trùm nhỏ', 'trum': 'trùm vùng'}
NHOM = [('em-be', 'Em bé'), ('quai', 'Quái'), ('vu-khi', 'Vũ khí'), ('trang-phuc', 'Trang phục'), ('do', 'Đồ và tài nguyên'), ('nguoi-lang', 'Người làng')]


def mau(o, n=4):
    return ' '.join(['`%s`' % h for h, _ in o['mau_chinh'] if h != o['vien']][:n])


def tl(o):
    r = o['rong'] / o['cao']
    return ('%.1f' % r).replace('.', ',')


def khoang(ds, k):
    v = [o[k] for o in ds]
    return '%d–%d' % (min(v), max(v)) if min(v) != max(v) else str(v[0])


def main():
    ds = list(DO.values())
    g = {k: [o for o in ds if o['nhom'] == k] for k, _ in NHOM}
    L = []
    w = L.append
    w('# Đặc điểm hình đang có trong game (đo bằng máy)')
    w('')
    w('Mọi hình trong game hiện vẽ bằng code (`game/js/monster_art.js`, `hero_tinhlinh.js`/`hero_art.js`, `weapon_art.js`, `ui_theme.js` và `do_roi.js` cho đồ, `village_scene.js` cho người làng). '
      'Tệp `tham-chieu/tao_anh.py` mở Xưởng Sprite trong Chromium, vẽ lại từng thứ ở **cỡ thật, quay mặt sang phải**, cắt sát, bỏ bóng đổ dưới chân, rồi đo. '
      'Ảnh phóng to 8 lần (nền trắng, giữ nguyên điểm ảnh) nằm ở `tham-chieu/<mã>.png`; số đo đầy đủ ở `tham-chieu/do-dac.json`. '
      'Các số này đã được đưa vào từng dòng prompt trong [PROMPT-VE.md](PROMPT-VE.md).')
    w('')
    w('## 1. Đặc điểm chung theo nhóm')
    w('')
    w('| Nhóm | Số hình | Cỡ thật (rộng × cao, điểm ảnh) | Góc nhìn, hướng | Viền | Số màu thật | Tỉ lệ, dáng |')
    w('|---|---|---|---|---|---|---|')
    w('| Em bé | 4 | %s × %s | chéo 3/4 quay phải, mặt hơi nhìn ra | 1 điểm ảnh, `#1b1118` (tím than) | %s | đầu cả mũ trùm ≈ 1/2 chiều cao, thân nhỏ, chân ngắn; tay sát thân, không cầm vũ khí (game vẽ vũ khí riêng) |'
      % (khoang(g['em-be'], 'rong'), khoang(g['em-be'], 'cao'), khoang(g['em-be'], 'so_mau')))
    w('| Quái thường | %d | %s × %s | phần lớn nhìn ngang quay phải; cua, nấm, sứa, hũ, đèn lồng nhìn chính diện | 1 điểm ảnh, `#14182e` (xanh than) | %s | đầu to, mắt giận, nanh |'
      % tuple([sum(1 for o in g['quai'] if o['loai'] == 'thuong')] + [khoang([o for o in g['quai'] if o['loai'] == 'thuong'], k) for k in ('rong', 'cao', 'so_mau')]))
    q2 = [o for o in g['quai'] if o['loai'] == 'tinhanh']
    w('| Quái tinh anh | %d | %s × %s | như quái thường | 1 điểm ảnh, `#14182e` | %s | to gấp rưỡi, thêm giáp, gai, sẹo |' % (len(q2), khoang(q2, 'rong'), khoang(q2, 'cao'), khoang(q2, 'so_mau')))
    q3 = [o for o in g['quai'] if o['loai'] in ('trumnho', 'trum')]
    w('| Trùm nhỏ, trùm vùng | %d | %s × %s | như quái thường | 1 điểm ảnh, `#14182e` | %s | khổng lồ, nhiều chi tiết lớn |' % (len(q3), khoang(q3, 'rong'), khoang(q3, 'cao'), khoang(q3, 'so_mau')))
    w('| Vũ khí | 40 | %s × %s (nằm ngang) | nhìn ngang, nằm ngang chuôi trái mũi phải; cung dựng đứng dây trái | 1 điểm ảnh, `#1b1118` | %s | có đôi mắt nhỏ (vũ khí sống) |'
      % (khoang(g['vu-khi'], 'rong'), khoang(g['vu-khi'], 'cao'), khoang(g['vu-khi'], 'so_mau')))
    w('| Trang phục | %d | %s × %s | chéo 3/4 quay phải (như trên người em bé) | 1 điểm ảnh, `#1b1118` | %s | mũ 17–26 rộng; áo chỉ 11–15; bùa 5 × 13; dấu mặt nạ 4–11; cánh một bên 17–18 |'
      % (len(g['trang-phuc']), khoang(g['trang-phuc'], 'rong'), khoang(g['trang-phuc'], 'cao'), khoang(g['trang-phuc'], 'so_mau')))
    w('| Đồ và tài nguyên | 14 | %s × %s | chính diện, biểu tượng | viền tối cùng tông màu món đồ | %s | biểu tượng ở dải tài nguyên chỉ 7 × 7 |'
      % (khoang(g['do'], 'rong'), khoang(g['do'], 'cao'), khoang(g['do'], 'so_mau')))
    w('| Người làng | 7 | %s × %s | chính diện, hơi chếch | 1 điểm ảnh, `#1a1420` | %s | đầu ≈ 2/5 chiều cao, mặt nạ tinh linh trắng `#f4eee0`, mắt chấm, má hồng |'
      % (khoang(g['nguoi-lang'], 'rong'), khoang(g['nguoi-lang'], 'cao'), khoang(g['nguoi-lang'], 'so_mau')))
    w('')
    w('**Đổ bóng:** mỗi chất liệu chỉ có bộ ba sắc độ **tối, vừa, sáng**, tô mảng phẳng, không chuyển màu mượt, không nhoè. Quái sáng từ trên bên trái (quả cầu có đốm sáng góc trên trái); em bé và trang phục sáng từ trên bên phải (mép trên sáng, mép dưới và mép trái tối). '
      'Không có bóng mềm; dưới chân quái game tự vẽ một bóng bầu dục mờ riêng (không thuộc hình), nên ảnh AI **không được** có bóng đổ.')
    w('')
    w('**Viền:** luôn đúng **1 điểm ảnh** quanh mép ngoài, màu gần đen ngả xanh hoặc tím. Khi đưa ảnh vào, Xưởng thu nhỏ rồi **tự thêm viền 1 điểm ảnh** đúng màu đó, nên nét viền AI vẽ chỉ cần dày khoảng 1/(chiều cao game) của hình: dày hơn sẽ ăn mất màu bên trong.')
    w('')
    w('**Vì sao AI hay vẽ lệch:** AI quen vẽ nhân vật chính diện, cân đối như người thật, tay sát thân, nhiều hoa văn nhỏ. Hình game thì phần lớn quay ngang sang phải, đầu rất to, hình khối to; và một chi tiết nhỏ hơn 1 điểm ảnh game (ví dụ nhỏ hơn 1/30 chiều cao với quái 30 điểm ảnh) sẽ biến mất khi thu nhỏ.')
    w('')
    w('## 2. Xưởng Sprite cần hình như thế nào')
    w('')
    w('Đọc từ `tools/xuong-sprite/nguon/` (`xu-ly-anh.js`, `khung.js`, `do.js`):')
    w('')
    w('- **Tách nền**: lấy màu hay gặp nhất ở mép ảnh làm nền rồi loang từ mép vào. Nền trắng trơn đều là tốt nhất; khoảng trắng kẹp giữa hai chân vẫn được tách nếu thông ra mép.')
    w('- **Bỏ đốm lẻ**: mảng rời nhỏ hơn khoảng 1,2% mảng lớn nhất bị xoá (tia lửa, hạt bụi, bào tử bay rời). Chi tiết muốn giữ phải **dính vào thân**.')
    w('- **Thu nhỏ**: theo chiều cao game (vũ khí theo chiều dài). Ô nào hình phủ dưới 40% thì bỏ, nên **nét mảnh hơn 1 điểm ảnh game sẽ mất**. Giữ tối đa 20 màu, ô có nét tối được ưu tiên giữ tối.')
    w('- **Tự đoán bộ phận**: đặt khớp của khung theo **tỉ lệ khung bao hình**, rồi mỗi điểm ảnh thuộc về xương gần nhất. Vì vậy tay, chân, đuôi, cánh phải nằm **đúng chỗ khung chờ** và **có khe trắng tách khỏi thân**, nếu không sẽ bị tính là thân (cử động bị vỡ, tay dính thân).')
    w('- **Hướng**: mọi động tác làm cho hình **quay mặt sang phải**; game tự lật khi quái quay trái.')
    w('')
    w('Chỗ đặt khớp mặc định của từng khung (tính theo khung bao: 0 là trái hoặc trên, 1 là phải hoặc dưới):')
    w('')
    w('| Khung | Bộ phận cử động | Dáng cần vẽ để Tự đoán đúng |')
    w('|---|---|---|')
    w('| **Người (2 chân)** | thân, đầu, tay trước, tay sau, chân trước, chân sau | Cổ ở 36% chiều cao (đầu chiếm phần trên), vai ở 42%; tay trước thả xuống chéo ra phải tới (80%, 62%), tay sau chéo ra trái tới (24%, 62%): **tay tách thân, bàn tay ngang hông**. Hông ở 60%, hai bàn chân ở đáy tại 38% và 62% bề ngang: **hai chân dang, có khe giữa**. Em bé mặc định chỉ tay và chân cử động. |')
    w('| **Bốn chân** | thân, đầu, 4 chân, đuôi | Thân ngang từ 30% tới 68% bề ngang; cổ ở (74%, 42%), mũi ở mép phải hơi cao (100%, 32%): **đầu bên phải**. Bốn chân thẳng xuống từ 62% tới đáy: chân trước ở 63–73%, chân sau ở 22–32% bề ngang: **có khe giữa chân trước và chân sau**. Đuôi từ (16%, 42%) chĩa lên trái tới (0%, 22%). |')
    w('| **Cua, bọ (nhiều chân)** | thân/mai, càng trước, càng sau, chân phải, chân trái | Thân ngang giữa ở 55% chiều cao; **hai càng giơ lên hai góc trên** (100%, 15%) và (0%, 15%); chân xoè xuống hai góc dưới (84%, 100%) và (16%, 100%). |')
    w('| **Cá, chim bay** | thân, đầu, cánh gần, cánh xa, đuôi | Thân ngang ở 55% chiều cao, **đầu phải** (mũi 100%, 52%), **đuôi trái** (0%, 50%); **hai cánh giơ lên trên lưng** tới đỉnh hình (42%, 0%) và (70%, 4%). Kiểu đi: bay nhấp nhô. |')
    w('| **Khối mềm (slime, lửa, ma)** | thân dưới, phần trên, tua phải, tua trái | Thân tròn ngồi ở đáy, phần trên tới đỉnh; **hai tua thò ra thấp hai bên** tới (100%, 85%) và (0%, 85%). Kiểu đi: nhún nhảy. |')
    w('| **Rắn (trườn)** | thân giữa, cổ, đầu, đuôi gần, chóp đuôi | Thân dài nằm thấp (62–70% chiều cao) chạy hết bề ngang, **đầu ngẩng ở phải** (100%, 36%), **đuôi thon về trái** (0%, 66%). |')
    w('| **Cây, đứng yên** | gốc rễ, thân, tán/đầu, cành phải, cành trái | Rễ ở đáy, thân đứng giữa (78% lên 42%), tán hoặc đầu trên cùng; **hai cành chĩa ra hai bên và hơi lên** tới (100%, 32%) và (0%, 32%). Gốc cắm đất, chỉ nhún. |')
    w('')
    w('**Chỗ lệch giữa game và khung Người:** em bé trong game có đầu cả mũ chiếm khoảng 1/2 chiều cao, chân chỉ khoảng 1/6; khung Người lại chờ cổ ở 36% và hông ở 60%. Thử thật (xem [PROMPT-THU.md](PROMPT-THU.md)) cho thấy đầu 1/2 làm phần áo bị chia nhầm sang tay chân. Vì vậy prompt em bé xin **đầu khoảng 2/5, áo choàng ngắn tới 2/3 chiều cao, hai chân lộ rõ**: vẫn rất chibi mà Tự đoán đúng hơn nhiều.')
    w('')
    w('Đồ vật (không có khung, đứng yên):')
    w('')
    w('- **Kiếm, giáo, búa**: nếu hình rộng hơn 1,25 lần chiều cao thì Xưởng coi là **nằm ngang**: điểm cầm ở 14% từ trái, mũi ở mép phải. Ngược lại coi là **dựng đứng**: điểm cầm ở 86% từ trên, mũi ở đỉnh. Thanh trượt cỡ là chiều dài.')
    w('- **Cung**: dựng đứng; điểm cầm ở 45% bề ngang giữa chiều cao, mũi ở mép phải, hai đầu dây ở 20% từ trái (trên và dưới). Game tự vẽ dây và mũi tên khi giương, nên **không vẽ mũi tên**.')
    w('- **Trang phục**: kéo đặt lên em bé mẫu (quay phải). Mũ đặt trên đầu, áo ở thân, đồ lưng sau lưng, bùa bên hông. **Cánh: một bên cánh, gốc ở góc dưới bên phải**; game tự vẽ cánh xa và cho vỗ.')
    w('- **Đồ và tài nguyên**: chỉ đưa hình; một hình dùng ở mọi chỗ (dải tài nguyên 7 × 7, Hành trang, giá bán, đồ rơi ≈ 18 điểm ảnh).')
    w('')
    w('## 3. Từng hình')
    w('')
    w('Màu chính: các màu chiếm nhiều chỗ nhất (đã bỏ màu viền), theo thứ tự nhiều tới ít. Tỉ lệ: rộng chia cao.')
    w('')
    w('### Em bé (khung Người)')
    w('')
    w('| Mã | Tên | Cỡ | Tỉ lệ | Số màu | Màu chính | Ảnh |')
    w('|---|---|---|---|---|---|---|')
    for o in g['em-be']:
        w('| %s | %s | %d × %d | %s | %d | %s | [ảnh](tham-chieu/%s.png) |' % (o['ma'], o['ten'], o['rong'], o['cao'], tl(o), o['so_mau'], mau(o), o['ma']))
    w('')
    w('### Quái')
    w('')
    w('Cột "Bộ phận cử động" là tên các phần (`parts`) mà `monster_art.js` cho xoay riêng; phần còn lại đi theo thân.')
    w('')
    w('| Mã | Tên | Loại | Cỡ | Tỉ lệ | Góc nhìn | Khung nên chọn | Bộ phận cử động | Màu chính | Ảnh |')
    w('|---|---|---|---|---|---|---|---|---|---|')
    for o in g['quai']:
        k, goc, _ = QUAI[o['ma']]
        w('| %s | %s | %s | %d × %d | %s | %s | %s | %s | %s | [ảnh](tham-chieu/%s.png) |' % (o['ma'], o['ten'], LOAI[o['loai']], o['rong'], o['cao'], tl(o), GOC_VN[goc], KHUNG[k], ', '.join(o['parts']) or 'cả hình', mau(o), o['ma']))
    w('')
    w('### Vũ khí (vẽ nằm ngang, góc 0)')
    w('')
    w('| Mã | Tên | Cỡ | Tỉ lệ | Màu chính | Ảnh |')
    w('|---|---|---|---|---|---|')
    for o in g['vu-khi']:
        w('| %s | %s | %d × %d | %s | %s | [ảnh](tham-chieu/%s.png) |' % (o['ma'], o['ten'], o['rong'], o['cao'], tl(o), mau(o), o['ma']))
    w('')
    w('### Trang phục (một lớp trên em bé Thợ Rèn đứng yên)')
    w('')
    w('| Mã | Tên | Cỡ | Màu chính | Ảnh |')
    w('|---|---|---|---|---|')
    for o in g['trang-phuc']:
        w('| %s | %s | %d × %d | %s | [ảnh](tham-chieu/%s.png) |' % (o['ma'], o['ten'], o['rong'], o['cao'], mau(o), o['ma']))
    w('')
    w('### Đồ và tài nguyên')
    w('')
    w('| Mã | Tên | Cỡ | Màu chính | Ảnh |')
    w('|---|---|---|---|---|')
    for o in g['do']:
        w('| %s | %s | %d × %d | %s | [ảnh](tham-chieu/%s.png) |' % (o['ma'], o['ten'], o['rong'], o['cao'], mau(o), o['ma']))
    w('')
    w('### Người làng (khung Người; đứng thở và nói chuyện, vẫy tay)')
    w('')
    w('| Mã | Tên | Cỡ | Tỉ lệ | Số màu | Màu chính | Ảnh |')
    w('|---|---|---|---|---|---|---|')
    for o in g['nguoi-lang']:
        w('| %s | %s | %d × %d | %s | %d | %s | [ảnh](tham-chieu/%s.png) |' % (o['ma'], o['ten'], o['rong'], o['cao'], tl(o), o['so_mau'], mau(o), o['ma']))
    w('')
    w('## 4. Làm lại số đo')
    w('')
    w('Khi hình trong game đổi: `python3 docs/xuong-sprite/tham-chieu/tao_anh.py` (vẽ lại ảnh tham chiếu và số đo), rồi `viet_dac_diem.py` (tệp này) và `viet_prompt.py` (cập nhật PROMPT-VE.md). Không cần chạy bài kiểm tra game.')
    open(OUT, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    print('Đã viết', OUT)


if __name__ == '__main__':
    main()
