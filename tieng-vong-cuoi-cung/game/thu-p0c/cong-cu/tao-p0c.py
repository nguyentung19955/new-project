#!/usr/bin/env python3
"""Tạo game/thu-p0c/index.html (trang thử P0-C: tinh anh Chuông Gỗ Gác Lớn → Ấn Rèn I → đe rèn → Âm Đao cấp 3 / Dư Âm).

Nguồn (CHỈ ĐỌC, không ghi lại):
  - game/thu-p0a/am-dao.html                       Âm Đao (bản đã sửa theo PH8) – NỀN của trang
  - game/thu-phong-b/cong-cu/tao-tu-p0a.py         CHỈ lấy danh sách chỗ thay (bộ đất mới A → F, phòng D/E/F, Bọ) – đọc bằng ast, không chạy
  - game/thu-huong-moi/cong-cu/khoi-huong-moi.js   màu HM (phần trên "bản đồ bản thử")
  - game/thu-bo-vo-moc/cong-cu/khoi-bo.js          Bọ Vỏ Mộc phòng D (chỉnh trên BẢN CHÉP như thu-p0b / thu-phong-b)
  - game/thu-phong-b/cong-cu/khoi-phong-b.js       số đặt phòng A–F + đe rèn + gợi ý ngắn (chỉnh trên BẢN CHÉP: mặc định vào phòng A)
  + cong-cu/khoi-p0c.js (khối riêng P0-C)
  + cong-cu/nen-giua-lien.js (28/10 camera kiểu Dead Cells: nền giữa một dải liên tục, chèn vào bản chép khối phòng B; ?cam=phong = bộ cũ)
Mỗi chỗ thay phải khớp ĐÚNG số lần – lệch thì dừng và báo (nguồn đã đổi → sửa script).
Vọng: cấu hình tạm A (ghi chủ động, đúng code trang Âm Đao) + sửa lỗi replay bỏ mẫu cuối của PH9 mục 1.3 (giống tao-p0b.py), bóng nghỉ hạ độ nổi.
Âm Đao luôn bắt đầu CẤP 1 (bỏ ?cap=); lên cấp 3 chỉ qua đe rèn khi có Ấn Rèn I.
Chạy: python3 game/thu-p0c/cong-cu/tao-p0c.py   (sau khi trang Âm Đao / phòng B đã sinh)"""
import ast, datetime, hashlib, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(THU, '..'))
P = lambda *a: os.path.join(GAME, *a)
NGUON = {
    'am_dao': P('thu-p0a', 'am-dao.html'),
    'pb_tao': P('thu-phong-b', 'cong-cu', 'tao-tu-p0a.py'),
    'hm': P('thu-huong-moi', 'cong-cu', 'khoi-huong-moi.js'),
    'bo': P('thu-bo-vo-moc', 'cong-cu', 'khoi-bo.js'),
    'pb': P('thu-phong-b', 'cong-cu', 'khoi-phong-b.js'),
    'p0c': os.path.join(HERE, 'khoi-p0c.js'),
    'nen_lien': os.path.join(HERE, 'nen-giua-lien.js'),   # 28/10 camera Dead Cells: nền giữa liên tục
}
doc = lambda k: open(NGUON[k], encoding='utf-8').read()
src, HM_FULL, BO, PB, KHOI = doc('am_dao'), doc('hm'), doc('bo'), doc('pb'), doc('p0c')
h = hashlib.sha1()
for k in sorted(NGUON): h.update(open(NGUON[k], 'rb').read())
h.update(open(os.path.abspath(__file__), 'rb').read())
PHIEN = 'p0c-' + datetime.date.today().strftime('%d%m') + '-' + h.hexdigest()[:8]
KHOI = KHOI.replace("'__PHIEN__'", "'" + PHIEN + "'")
loi = []


def doi(text, ds, ten):
    for mo_ta, cu, moi, lan in ds:
        n = text.count(cu)
        if n != lan:
            loi.append('%s – %s: khớp %d lần (cần %d)' % (ten, mo_ta, n, lan)); continue
        text = text.replace(cu, moi)
    return text


# ---------- 1. Bộ đất mới A → F + phòng D/E/F + Bọ: LẤY ĐÚNG danh sách chỗ thay của thu-phong-b (đọc AST, không chạy script đó) ----------
cay = ast.parse(doc('pb_tao'))
R_PB = []
for nut in ast.walk(cay):
    if isinstance(nut, ast.Call) and getattr(nut.func, 'id', '') == 'thay':
        a = [ast.literal_eval(x) for x in nut.args]
        kw = {k.arg: ast.literal_eval(k.value) for k in nut.keywords}
        mo_ta, cu, moi = a[0], a[1], a[2]
        lan = kw.get('lan', a[4] if len(a) > 4 else 1)
        if mo_ta == 'tiêu đề': continue   # tiêu đề riêng P0-C bên dưới
        R_PB.append((mo_ta, cu, moi, lan))
if len(R_PB) < 15: loi.append('tao-tu-p0a.py: chỉ đọc được %d chỗ thay (cần ≥ 15) – script phòng B đã đổi cấu trúc' % len(R_PB))

# ---------- 2. Chỗ thay riêng P0-C trên trang Âm Đao ----------
R = []
def thay(mo_ta, cu, moi, lan=1): R.append((mo_ta, cu, moi, lan))

thay('tiêu đề', '<title>Tiếng Vọng – Thử Âm Đao cấp 1–4 (trên P0-A)</title>', '<title>Tiếng Vọng – Thử P0-C (tinh anh · Ấn Rèn · đe rèn)</title>')
thay('màn bắt đầu', '<p class="big">Thử Âm Đao cấp 1–4 · đánh thường + âm nhận, giữ Chém = Dư Âm (cấp 3+)</p>',
     '<p class="big">Thử P0-C · tinh anh Chuông Gỗ Gác Lớn → Ấn Rèn I → đe rèn → Âm Đao cấp 3 (Dư Âm)</p>')
thay('ảnh Âm Đao ở thư mục thu-p0a', "'am-dao/", "'../thu-p0a/am-dao/", 5)
thay('Âm Đao luôn bắt đầu cấp 1', "const CAP0 = Math.max(1, Math.min(4, +(AD_Q.get('cap') || 1) || 1));",
     "const CAP0 = 1;   // P0-C: luôn bắt đầu cấp 1; cấp 3 chỉ mở ở đe rèn khi có Ấn Rèn I")
# PH9 mục 1.3 + 1.4 (giống tao-p0b.py): mẫu cuối của đoạn A được xử lý ĐỦ (hình + hộp + hit) rồi bước SAU mới kết thúc → tư thế nghỉ, không hộp
thay('PH9: updateEcho xử lý đủ mẫu cuối rồi mới kết thúc',
     "  if(echo.i<echo.n){ echo.cur=REC[echo.i++]; if(echo.i>=echo.n) echo.done=true;\n",
     "  if(echo.i<echo.n){ echo.cur=REC[echo.i++];   // P0-C (sửa PH9 như P0-B): mẫu cuối CHƯA kết thúc ở bước này – hộp + hit của nó xử lý như mọi mẫu\n")
thay('PH9: kết thúc phát ở bước sau mẫu cuối → tư thế nghỉ',
     "  echo.warn=false;\n  if(!echo.done){\n",
     "  else if(!echo.done){ echo.done=true; P0C.bongNghi(); }   // P0-C (PH9): hết đoạn → nghỉ theo hướng cuối, không hộp\n  echo.warn=false;\n  if(!echo.done){\n")
thay('PH9: bóng nghỉ mờ hơn, không nhịp sáng',
     "      const pz=0.5+0.5*Math.sin(S.frame*0.09);\n      ctx.globalAlpha=0.16+0.16*pz; ctx.fillStyle='#CEF0D6'; ctx.beginPath(); ctx.ellipse(ex+10-ox,ey+30-oy,26,5,0,0,7); ctx.fill();\n      ctx.globalAlpha=0.36+0.14*pz; drawLam(LAM.E,c,ex,ey);\n",
     "      ctx.globalAlpha=0.08; ctx.fillStyle='#CEF0D6'; ctx.beginPath(); ctx.ellipse(ex+10-ox,ey+30-oy,22,4,0,0,7); ctx.fill();   // P0-C (PH9): bóng nghỉ – không nhịp sáng, mờ\n      ctx.globalAlpha=0.24; drawLam(LAM.E,c,ex,ey);\n")
thay('PH9: thanh Vọng không nhấp nháy khi bóng đã nghỉ (2 HUD)',
     "  else if(echo && echo.done){ col=(S.frame>>4)%2?'#CEF0D6':'#83CC93'; }",
     "  else if(echo && echo.done){ col='#5f7f6a'; }   // P0-C (PH9): bóng nghỉ – không nhấp nháy", 2)

# PH10 mục 4: tinh anh không nhận đòn khi Lam ở ngoài E (q.khongDanh – chỉ tinh anh có; quái khác không đổi)
thay('PH10: P0.thuThap bỏ qua mục tiêu khongDanh()',
     "      if (q.dead || q.gone || q.st === 'die' || !overlap(hb, q)) continue;\n",
     "      if (q.dead || q.gone || q.st === 'die' || !overlap(hb, q) || (q.khongDanh && q.khongDanh())) continue;   // P0-C (PH10): tinh anh khi Lam ngoài E\n")

# ---------- 3. Khối chèn: màu HM + Bọ (bản chép) + phòng B (bản chép) + P0-C ----------
MOC = '/* ---------- bản đồ bản thử'
if HM_FULL.count(MOC) != 1: loi.append('khoi-huong-moi.js: không thấy "%s"' % MOC)
HM = HM_FULL[:HM_FULL.index(MOC)] if MOC in HM_FULL else ''

MOC_THU = '/* ======================= THỬ (không ghép vào demo.html): bot + API quay / chụp'
if BO.count(MOC_THU) != 1: loi.append('khoi-bo.js: không thấy mốc phần THỬ')
BO = BO.split(MOC_THU)[0]
BO = doi(BO, [
    ('chú thích phòng thử', '/* ---------- PHÒNG THỬ: phòng "Điểm lưu" (RD, 30 ô = đúng 1 màn) làm phẳng, chặn hai đầu ---------- */',
     '/* ---------- PHÒNG D (trang P0-C, như thu-phong-b bước 3): 2 Bọ ở phòng D sau hành lang gác ---------- */', 1),
    ('phòng thử RD → phòng D',
     "RD.name = 'Phòng thử Bọ Vỏ Mộc';\nfill(RD, 0, 0, RD.w - 1, 13, '.');                 // bỏ 2 bệ một chiều\n"
     "fill(RD, 0, 0, 0, 13, 'S'); fill(RD, RD.w - 1, 0, RD.w - 1, 13, 'S');   // tường hai đầu (không sang phòng câu đố / boss)\n"
     "BELLS[2].x = (RD.x0 + 3) * T + 16;                  // chuông lưu dời về đầu phòng (hồi sinh ở đây)\n",
     "// phòng D (PD, 30 ô) tạo trong tao-p0c.py (chỗ thay của thu-phong-b) – sàn thoáng, ván 4 ô, không trần\n", 1),
    ('datLai: không đặt Lam / chuông',
     "    S.cp = BELLS[2]; BELLS[0].on = false; BELLS[2].on = true;\n    placePlayer((RD.x0 + 3) * T + 6, FLOOR - pl.h); pl.drawT = 0; pl.face = 1;\n", "", 1),
    ('vị trí Bọ theo phòng D', '(RD.x0 + ', '(PD.x0 + ', 3),
    ('gợi ý phòng D', 'ROOMS[S.room] === RD', 'ROOMS[S.room] === PD', 1),
], 'khoi-bo.js')
if re.search(r'\bRD\b', BO): loi.append('khoi-bo.js: còn chỗ RD')

PB = doi(PB, [
    ('P0-C: mặc định vào phòng A (điểm lưu) – ?vao=c|d|e|f vẫn vào thẳng',
     "vaoA: q.get('vao') === 'a' || q.get('vao') === 'lang',",
     "vaoA: !q.get('vao') || q.get('vao') === 'a' || q.get('vao') === 'lang',   // P0-C: mặc định vào phòng A", 1),
    ('P0-C: phòng E đã có tinh anh', "(r === PE ? 'chưa có tinh anh' : '')", "(r === PE ? 'tinh anh · Chuông Gỗ Gác Lớn' : '')", 1),
    # 28/10 camera kiểu Dead Cells (camera-dead-cells.js trong am-dao.html): F hết cần ghi đè dính mép riêng – kẹp mép thế giới là đủ.
    # ?cam=phong: giữ nguyên hành vi cũ (ghi đè F + trục nền theo phòng + nền giữa hoà theo phòng).
    ('camera DC: bỏ ghi đè camera F (chỉ còn ở ?cam=phong)', "  if (ROOMS[S.room] === PF) { const tx = camF();",
     "  if (CAM.phong && ROOMS[S.room] === PF) { const tx = camF();", 1),
    ('camera DC: bỏ ghi đè đặt camera F (chỉ còn ở ?cam=phong)', "placePlayer = function (x, y) { _pbPlace(x, y); if (ROOMS[S.room] === PF)",
     "placePlayer = function (x, y) { _pbPlace(x, y); if (CAM.phong && ROOMS[S.room] === PF)", 1),
    ('camera DC: datCam (quay cuộn) dùng trục nền cố định của khu',
     "const r = ROOMS[roomAt(x + W / 2)], rc = r.x0 * T + r.w * T / 2 - W / 2; S.rc = S.prc = rc;",
     "const r = ROOMS[roomAt(x + W / 2)], rc = CAM.phong ? r.x0 * T + r.w * T / 2 - W / 2 : camKhuCua(x + W / 2).rc; S.rc = S.prc = rc;", 1),
    ('camera DC: nền giữa LIÊN TỤC (đặt theo toạ độ parallax, không hoà theo phòng)',
     "for (const [r, so] of PHONG_SO) for (const p of so.nen.giua) NEN_ABC.giua.push(Object.assign({}, p, {phong: r, rc: r.x0 * T + r.w * T / 2 - W / 2, w: 0}));\n",
     "for (const [r, so] of PHONG_SO) for (const p of so.nen.giua) NEN_ABC.giua.push(Object.assign({}, p, {phong: r, rc: r.x0 * T + r.w * T / 2 - W / 2, w: 0}));\n"
     + open(os.path.join(HERE, 'nen-giua-lien.js'), encoding='utf-8').read().rstrip() + "\n", 1),
    ('camera DC: nền giữa không hoà theo phòng', "function nenTrongSo(ox) {\n",
     "function nenTrongSo(ox) {\n  if (!CAM.phong) { for (const p of NEN_ABC.giua) p.w = 1; return; }   // camera Dead Cells: mảnh nền giữa luôn hiện đủ (đặt thưa, không chồng)\n", 1),
], 'khoi-phong-b.js (bản chép)')

R += [(m, c, n, l) for (m, c, n, l) in R_PB]
TAIL = "\nboot();\n</script>"
out = doi(src, R, 'am-dao.html')
if out.count(TAIL) != 1: loi.append('khởi động: khớp %d lần (cần 1)' % out.count(TAIL))
else: out = out.replace(TAIL, "\n" + HM + "\n" + BO + "\n" + PB + "\n" + KHOI + TAIL)
if loi:
    sys.exit('LỖI – nguồn đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(THU, 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte · phiên', PHIEN, '· chỗ thay phòng B:', len(R_PB))
