# Viết mục "Cách nhanh" vào các tệp PROMPT.md từ lo.json (prompt chép nguyên văn từ trang công cụ). Chạy lại được nhiều lần.
import json, re, sys
RA, GOC = sys.argv[1], sys.argv[2]
LO = {L['id']: L for L in json.load(open(RA + '/lo.json', encoding='utf-8'))}
NEN = {'hong': 'hồng tím `#FF00FF`', 'duong': 'xanh dương `#0000FF`', 'xanh': 'xanh lá `#00FF00`'}
A, B = '<!-- dot-11: bắt đầu phần Cách nhanh (chép từ trang công cụ) -->', '<!-- dot-11: hết phần Cách nhanh -->'
TRANG = 'https://spiritblade.web.app/tach-hieu-ung.html'
def kho(L): return re.sub(r' \(tỉ lệ (.*)\)', r' \1', L['kho']).replace('khổ ', '')
def khoi_lo(n, L, ghi=''):
    t = f"### Tấm {n}: lô \"{L['ten']}\"\n\n"
    t += f"Trên trang chọn: **{L['ten']} · {len(L['hang'])} hàng × {L['so']} khung · nền {NEN[L['nen']].split(' `')[0]}**. Lưới {L['so']} cột × {len(L['hang'])} hàng, ảnh {kho(L)}, nền {NEN[L['nen']]}.{(' ' + ghi) if ghi else ''}\n\n"
    t += "| Hàng | Hiệu ứng | Mã tệp tải ra | Cỡ khung trong game | Số khung |\n|---|---|---|---|---|\n"
    for i, h in enumerate(L['hang']): t += f"| {i + 1} | {h['ten']} | `{h['ma']}` | {h['fw']}×{h['fh']} | {h['so']} |\n"
    return t + "\nPrompt (chép cả đoạn):\n\n```\n" + L['prompt'] + "\n```\n\n"
def buoc(them=''):
    return ("Làm 4 bước cho mỗi tấm:\n\n"
        "1. **Gen:** chép cả đoạn prompt của tấm đó, dán vào ChatGPT, lưu tấm ảnh về máy.\n"
        f"2. **Mở trang** {TRANG}\n"
        "3. **Chọn lô:** ở ô chọn của bước 1 trên trang, chọn đúng tên lô trong nhóm \"Lô gộp\" (nằm đầu danh sách), rồi đưa ảnh vào bước 2 của trang. Mỗi hàng của ảnh hiện thành một thẻ có chữ ĐẠT hoặc CÓ LỖI; bấm vào thẻ để xem hàng đó chạy thử.\n"
        "4. **Tải tất cả:** bấm nút **Tải tất cả (.zip)**, gửi tệp zip đó cho Claude. Tên tệp bên trong giữ nguyên mã cũ.\n\n"
        "Hàng nào báo CÓ LỖI thì trang tự bỏ hàng đó ra khỏi zip, các hàng khác vẫn tải được. Hiệu ứng bị lỗi thì gen lại riêng bằng prompt lẻ ở phần \"Dự phòng\" bên dưới (trên trang: nhóm \"Từng hiệu ứng\" trong cùng ô chọn).\n\n" + them)
def bang_tam(ds):
    t = "| Tấm | Lô trên trang | Lưới (cột × hàng) | Khổ ảnh | Nền | Các hàng từ trên xuống |\n|---|---|---|---|---|---|\n"
    for n, L, _ in ds: t += f"| {n} | {L['ten']} | {L['so']} × {len(L['hang'])} | {kho(L)} | {NEN[L['nen']].split(' `')[0]} | " + '; '.join(h['ten'] for h in L['hang']) + " |\n"
    return t + "\n"
def chen(tep, khoi, tieu_de_du_phong, loi_du_phong):
    s = open(tep, encoding='utf-8').read()
    if A in s:  # chạy lại: gỡ phần cũ
        s = s[:s.index(A)] + s[s.index(B) + len(B):].lstrip('\n')
        s = s.replace(tieu_de_du_phong + '\n\n' + loi_du_phong + '\n\n', '', 1)
    dau, _, than = s.partition('\n\n')
    assert dau.startswith('# ')
    open(tep, 'w', encoding='utf-8').write(dau + '\n\n' + A + '\n' + khoi.rstrip('\n') + '\n\n' + B + '\n\n' + tieu_de_du_phong + '\n\n' + loi_du_phong + '\n\n' + than)
DP = '## Dự phòng: gen lẻ từng dải (cách cũ)'
DPL = 'Phần dưới đây giữ nguyên như trước Đợt 11. Chỉ dùng khi một hàng của tấm gộp bị vẽ hỏng, hoặc khi muốn vẽ lại riêng một hiệu ứng. Trên trang, các mục lẻ nằm ở nhóm "Từng hiệu ứng (gen lẻ, mỗi tấm một hàng khung)" của ô chọn.'

# ---------- B1 ----------
ds = [(1, LO['b1-tron-hong'], ''), (2, LO['b1-dai-hong'], ''), (3, LO['b1-duong'], 'Lô này xếp chung hình tròn, hình cao và hình dài; mỗi hình vẫn được vẽ to hơn 11 lần cỡ trong game nên không mất nét.')]
k = ("## Cách nhanh: 3 tấm thay 14 (Đợt 11)\n\n"
     "Trước đây phải gen 14 tấm, mỗi tấm một dải 4 khung. Nay gộp thành **3 tấm**: mỗi tấm là một lưới, mỗi HÀNG là một hiệu ứng, 4 cột là 4 khung. Xếp chung theo màu nền vẽ (hồng tím hoặc xanh dương). Tệp tải ra giống hệt cách cũ, mã tệp không đổi.\n\n"
     + buoc() + bang_tam(ds) + ''.join(khoi_lo(n, L, g) for n, L, g in ds))
chen(GOC + '/hieu-ung-b1/PROMPT.md', k, DP, DPL)

# ---------- B2 ----------
ds = [(1, LO['b2-4-khung'], ''), (2, LO['b2-5-khung'], 'Hàng 3 là bản Lửa của Ra chưởng (bản theo hệ, vẽ luôn vì cùng nền xanh dương).'), (3, LO['b2-6-khung'], ''),
      (4, LO['b23-8-khung'], 'Tấm này dùng chung với phiên B3: hàng 2 là Vòng phép trên sàn của B3 (cùng 8 khung, cùng nền). Gen ở đây rồi thì bên B3 không phải gen Vòng phép nữa.'),
      (5, LO['b2-chuong-he'], 'Không bắt buộc: chỉ cần khi muốn chưởng Độc và chưởng Băng có màu riêng. Hai bản này vẽ trên nền hồng tím nên không xếp chung được với tấm 2.')]
k = ("## Cách nhanh: 5 tấm thay 11 (Đợt 11)\n\n"
     "Trước đây phải gen 8 dải bản Chung và 3 dải Ra chưởng theo hệ, tổng 11 tấm. Nay gộp thành **5 tấm** (4 tấm bắt buộc + 1 tấm bản theo hệ không bắt buộc). Hiệu ứng xếp chung một tấm khi cùng số khung và cùng màu nền vẽ; mỗi HÀNG là một hiệu ứng. Tệp tải ra giống hệt cách cũ, mã tệp không đổi.\n\n"
     + buoc("Bản theo hệ của 7 mục còn lại (không bắt buộc) vẫn lấy như cũ: chọn mục lẻ, chọn \"Bản màu\", bấm \"Sao chép prompt vẽ\".\n\n")
     + bang_tam(ds) + ''.join(khoi_lo(n, L, g) for n, L, g in ds))
chen(GOC + '/hieu-ung-b2/PROMPT.md', k, DP, DPL)

# ---------- B3 ----------
ds = [(1, LO['b3-5-khung'], ''), (2, LO['b3-6-hong'], 'Lô này xếp chung hình vuông, hình ngang và hình đứng; mỗi hình vẫn được vẽ to ít nhất 4 lần cỡ trong game.'), (3, LO['b3-6-duong'], 'Lô này xếp chung hình vuông, hình ngang và hình đứng; mỗi hình vẫn được vẽ to ít nhất 4 lần cỡ trong game.'),
      (4, LO['b3-no'], ''), (5, LO['b3-tien-hoa'], 'Hàng 2 là bản Lửa của Tiến hoá (bản theo hệ, vẽ luôn vì cùng nền xanh dương).'),
      (6, LO['b3-tien-hoa-he'], 'Không bắt buộc: chỉ cần khi muốn Tiến hoá hệ Độc và hệ Băng có màu riêng. Hai bản này vẽ trên nền hồng tím nên không xếp chung được với tấm 5.')]
k = ("## Cách nhanh: 7 tấm thay 18 (Đợt 11)\n\n"
     "Trước đây phải gen 15 dải bản Chung và 3 dải Tiến hoá theo hệ, tổng 18 tấm. Nay còn **7 tấm**: 6 tấm gộp dưới đây (tấm 6 không bắt buộc) và 1 tấm lẻ **Trùm nổ cuối**. Hiệu ứng xếp chung một tấm khi cùng số khung và cùng màu nền vẽ; mỗi HÀNG là một hiệu ứng. Tệp tải ra giống hệt cách cũ, mã tệp không đổi.\n\n"
     "Hai chỗ cần nhớ:\n\n"
     "- **Vòng phép trên sàn** nằm chung tấm với Giáo quét vòng của phiên B2 (lô \"B2 + B3 · Giáo quét vòng, Vòng phép\", prompt ở `../hieu-ung-b2/PROMPT.md`, tấm 4). Tấm đó tính bên B2.\n"
     "- **Trùm nổ cuối** (`hu-trum-no`, khung 192×160) vẫn gen lẻ một tấm riêng bằng prompt ở mục 12 bên dưới, vì hình rất to: xếp chung thì bị vẽ nhỏ đi.\n\n"
     + buoc() + bang_tam(ds) + ''.join(khoi_lo(n, L, g) for n, L, g in ds))
chen(GOC + '/hieu-ung-b3/PROMPT.md', k, DP, DPL)

# ---------- A2 ----------
p = open(RA + '/prompt-cua-gop.txt', encoding='utf-8').read().strip()
VUNG = [('rung', 'Rừng già'), ('bien', 'Hang biển'), ('lau', 'Lâu đài cổ')]
DANG = [('tren', 'Cửa trên', '40×40'), ('duoi', 'Cửa dưới', '46×28'), ('ben', 'Cửa bên', '16×48')]
bang = "| Ô | Hàng (vùng) | Hình | Cỡ lớn nhất trong game | Mã tệp |\n|---|---|---|---|---|\n"; o = 0
for r, (kv, tv) in enumerate(VUNG):
    for kh, tk in (('', 'mở'), ('-khoa', 'khoá')):
        for d, td, co in DANG: o += 1; bang += f"| {o} | {r + 1} · {tv} | {td} · {tk} | {co} | `gd-cua-{kv}-{d}{kh}` |\n"
k = ("## Cách nhanh: 2 tấm thay 4 (Đợt 11)\n\n"
     "Trước đây phải gen 4 tấm (3 tấm cửa của ba vùng + 1 tấm ổ khoá và đầu lâu). Nay còn **2 tấm**:\n\n"
     "- **Tấm 1 (mới):** lô \"Cửa · GỘP cả 3 vùng · 18 hình (một tấm thay 3 tấm)\", nằm CUỐI danh sách lô trên trang. Lưới 6 cột × 3 hàng: mỗi HÀNG là một vùng; trong mỗi hàng, cột 1, 2, 3 là cửa trên, cửa dưới, cửa bên đang MỞ, cột 4, 5, 6 là đúng ba cửa đó khi KHOÁ.\n"
     "- **Tấm 2 (như cũ):** lô \"Cửa · ổ khoá và đầu lâu · 2 hình\", prompt ở mục \"Lô 4\" bên dưới.\n\n"
     "Làm 4 bước cho tấm 1:\n\n"
     "1. **Gen:** chép cả đoạn prompt dưới đây, dán vào ChatGPT, lưu tấm ảnh về máy.\n"
     "2. **Mở trang** https://spiritblade.web.app/tach-phong.html\n"
     "3. **Chọn lô** \"Cửa · GỘP cả 3 vùng · 18 hình (một tấm thay 3 tấm)\" ở bước 1 của trang, rồi đưa ảnh vào bước 2.\n"
     "4. **Tải tất cả:** bấm **Tải tất cả (.zip, 18 hình)**, gửi tệp zip cho Claude. Tệp bên trong giống hệt tệp của ba lô lẻ, mã không đổi.\n\n"
     "Nếu cửa của một vùng bị vẽ hỏng: trên trang chạm vào các hình hỏng để bỏ, tải phần còn lại, rồi gen lại riêng vùng đó bằng lô lẻ ở phần \"Dự phòng\" bên dưới.\n\n"
     "Thứ tự ô (đọc từ trái sang phải, hết hàng trên mới xuống hàng dưới) và mã tệp:\n\n" + bang
     + "\nPrompt tấm 1 (chép cả đoạn):\n\n```\n" + p + "\n```\n")
chen(GOC + '/phong-a2/PROMPT.md', k, '## Dự phòng: gen lẻ từng vùng (cách cũ)', 'Phần dưới đây giữ nguyên như trước Đợt 11. Lô 1, 2, 3 chỉ dùng khi muốn vẽ lại riêng cửa của một vùng. **Lô 4 (ổ khoá và đầu lâu) vẫn phải gen**, đó là tấm 2 của cách nhanh.')

# ---------- D2: chưa gộp, ghi rõ ----------
k = ("## Đợt 11: đã xét gộp, CHƯA gộp (vẫn 3 tấm)\n\n"
     "Đợt 11 có xét gộp lô Khung cửi và lô Lửa lò rèn thành một tấm 2 hàng × 3 cột, nhưng **chưa làm**. Phiên D2 vẫn gen **3 tấm** như hướng dẫn bên dưới. Lý do ngắn gọn:\n\n"
     "- Hai lô vẽ trên hai màu nền khác nhau (khung cửi nền hồng tím, lửa lò nền xanh dương) và hình dáng khác hẳn nhau (khung cửi 28×22 bè ngang, lửa 12×15 đứng).\n"
     "- Trang Tách Làng làm mỗi lô dải khung ra đúng MỘT tệp. Muốn một tấm ra hai tệp thì phải sửa cả phần ghép dải, xem thử và tải về của trang, vượt quá phạm vi được giao (chỉ thêm định nghĩa lô).\n"
     "- Lợi ích chỉ là bớt 1 tấm.\n\n"
     "Chi tiết và các lựa chọn chờ duyệt: `docs/review/ke-hoach-cai-thien/dot-11/bao-cao.md`, mục 3 và mục 9.\n")
s = open(GOC + '/lang-d2/PROMPT.md', encoding='utf-8').read()
if A in s: s = s[:s.index(A)] + s[s.index(B) + len(B):].lstrip('\n')
dau, _, than = s.partition('\n\n')
open(GOC + '/lang-d2/PROMPT.md', 'w', encoding='utf-8').write(dau + '\n\n' + A.replace('phần Cách nhanh (chép từ trang công cụ)', 'ghi chú Đợt 11') + '\n' + k + '\n' + B.replace('phần Cách nhanh', 'ghi chú Đợt 11') + '\n\n' + than)
print('xong')
