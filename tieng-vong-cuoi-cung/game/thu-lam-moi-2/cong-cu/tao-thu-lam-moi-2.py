#!/usr/bin/env python3
"""Tạo game/thu-lam-moi-2/index.html – trang thử Lam mới (thử 2): CHẠY 8 tư thế + CHÉM 1 (A/B/C/D) trên NỀN MỚI, vào phòng A.

Nguồn (CHỈ ĐỌC, không ghi lại):
  - game/thu-p0a/am-dao.html                       Âm Đao – nền của trang (gameplay, ATK, hộp, tốc độ giữ nguyên)
  - game/thu-phong-b/cong-cu/tao-tu-p0a.py         CHỈ lấy danh sách chỗ thay (bộ đất / nền mới A → F, phòng D/E/F, Bọ) – đọc AST, không chạy
  - game/thu-huong-moi/cong-cu/khoi-huong-moi.js   màu HM (phần trên "bản đồ bản thử")
  - game/thu-bo-vo-moc/cong-cu/khoi-bo.js          Bọ Vỏ Mộc phòng D (chỉnh trên BẢN CHÉP như P0-B / P0-C)
  - game/thu-phong-b/cong-cu/khoi-phong-b.js       số đặt phòng A–F (BẢN CHÉP: mặc định vào phòng A, camera Dead Cells như P0-C)
  - game/thu-p0c/cong-cu/nen-giua-lien.js          nền giữa liền (camera Dead Cells) – như P0-C
  + cong-cu/khoi-lam-moi-2.js (khối riêng: vẽ Lam mới, cờ ?lam=cu ?vfx=0 ?bong=1 ?cham=4, nút trong ⚙)
Cách làm giống game/thu-p0c/cong-cu/tao-p0c.py (bỏ phần riêng P0-C: tinh anh, Ấn Rèn, sửa Vọng PH9/PH10).
Mỗi chỗ thay phải khớp ĐÚNG số lần – lệch thì dừng và báo.
Chạy: python3 game/thu-lam-moi-2/cong-cu/tao-thu-lam-moi-2.py"""
import ast, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(THU, '..'))
P = lambda *a: os.path.join(GAME, *a)
doc = lambda p: open(p, encoding='utf-8').read()
src = doc(P('thu-p0a', 'am-dao.html'))
HM_FULL, BO, PB = doc(P('thu-huong-moi', 'cong-cu', 'khoi-huong-moi.js')), doc(P('thu-bo-vo-moc', 'cong-cu', 'khoi-bo.js')), doc(P('thu-phong-b', 'cong-cu', 'khoi-phong-b.js'))
KHOI = doc(os.path.join(HERE, 'khoi-lam-moi-2.js'))
NEN_LIEN = doc(P('thu-p0c', 'cong-cu', 'nen-giua-lien.js'))
loi = []


def doi(text, ds, ten):
    for mo_ta, cu, moi, lan in ds:
        n = text.count(cu)
        if n != lan:
            loi.append('%s – %s: khớp %d lần (cần %d)' % (ten, mo_ta, n, lan)); continue
        text = text.replace(cu, moi)
    return text


# ---------- 1. Bộ đất / nền mới A → F + phòng D/E/F + Bọ: danh sách chỗ thay của thu-phong-b (đọc AST) ----------
R_PB = []
for nut in ast.walk(ast.parse(doc(P('thu-phong-b', 'cong-cu', 'tao-tu-p0a.py')))):
    if isinstance(nut, ast.Call) and getattr(nut.func, 'id', '') == 'thay':
        a = [ast.literal_eval(x) for x in nut.args]
        kw = {k.arg: ast.literal_eval(k.value) for k in nut.keywords}
        if a[0] == 'tiêu đề': continue
        R_PB.append((a[0], a[1], a[2], kw.get('lan', a[4] if len(a) > 4 else 1)))
if len(R_PB) < 15: loi.append('tao-tu-p0a.py: chỉ đọc được %d chỗ thay (cần ≥ 15)' % len(R_PB))

# ---------- 2. Chỗ thay riêng trang này ----------
R = []
def thay(mo_ta, cu, moi, lan=1): R.append((mo_ta, cu, moi, lan))

thay('tiêu đề', '<title>Tiếng Vọng – Thử Âm Đao cấp 1–4 (trên P0-A)</title>', '<title>Tiếng Vọng – Thử Lam mới (bộ tư thế 3 + 4)</title>')
thay('màn bắt đầu', '<p class="big">Thử Âm Đao cấp 1–4 · đánh thường + âm nhận, giữ Chém = Dư Âm (cấp 3+)</p>',
     '<p class="big">Thử Lam mới · bộ tư thế 3 + 4: đứng, chạy, chém 1→2→3, hất, chém trên không, nhảy/rơi/tiếp đất, pogo, lướt, bị đánh, '
     'trượt tường LƯNG áp vách (?tuong=mat = kiểu cũ). Vệt chém 2/3/hất/trên không là VỆT MẪU chờ duyệt. Chém vang, chết, rút dao còn hình TẠM. '
     '⚙ để tắt vệt chém / bóng đen / chậm ×4 / Lam cũ</p>')
thay('ảnh Âm Đao ở thư mục thu-p0a', "'am-dao/", "'../thu-p0a/am-dao/", 5)
# móc vẽ: Lam mới thay phần thân của drawLam (bóng Vọng / vệt lướt cũng đi qua đây); ?lam=cu → LM2.ve trả false → vẽ Lam cũ
thay('drawLam: Lam mới', "function drawLam(bo,s,x,y){\n  if(!LAM || !s.a2) return;\n",
     "function drawLam(bo,s,x,y){\n  if(LM2.ve(bo,s,x,y)) return;   // Lam mới 2 (khoi-lam-moi-2.js)\n  if(!LAM || !s.a2) return;\n")
# ?cham=4: chậm cả mô phỏng (bước logic) – không đổi số tick, chỉ đổi tốc độ phát
thay('vòng lặp: chậm ×N', "accT+=dt*(DBG.on?DBG.speed:1); let n=0;", "accT+=dt*(DBG.on?DBG.speed:1)/LM2.ST.cham; let n=0;")

# ---------- 3. Khối chèn: màu HM + Bọ (bản chép) + phòng A–F (bản chép) + Lam mới 2 ----------
MOC = '/* ---------- bản đồ bản thử'
if HM_FULL.count(MOC) != 1: loi.append('khoi-huong-moi.js: không thấy "%s"' % MOC)
HM = HM_FULL[:HM_FULL.index(MOC)] if MOC in HM_FULL else ''
MOC_THU = '/* ======================= THỬ (không ghép vào demo.html): bot + API quay / chụp'
if BO.count(MOC_THU) != 1: loi.append('khoi-bo.js: không thấy mốc phần THỬ')
BO = BO.split(MOC_THU)[0]
BO = doi(BO, [
    ('chú thích phòng thử', '/* ---------- PHÒNG THỬ: phòng "Điểm lưu" (RD, 30 ô = đúng 1 màn) làm phẳng, chặn hai đầu ---------- */',
     '/* ---------- PHÒNG D (trang Lam mới 2, như thu-phong-b bước 3): 2 Bọ ở phòng D sau hành lang gác ---------- */', 1),
    ('phòng thử RD → phòng D',
     "RD.name = 'Phòng thử Bọ Vỏ Mộc';\nfill(RD, 0, 0, RD.w - 1, 13, '.');                 // bỏ 2 bệ một chiều\n"
     "fill(RD, 0, 0, 0, 13, 'S'); fill(RD, RD.w - 1, 0, RD.w - 1, 13, 'S');   // tường hai đầu (không sang phòng câu đố / boss)\n"
     "BELLS[2].x = (RD.x0 + 3) * T + 16;                  // chuông lưu dời về đầu phòng (hồi sinh ở đây)\n",
     "// phòng D (PD, 30 ô) tạo bằng chỗ thay của thu-phong-b – sàn thoáng, ván 4 ô, không trần\n", 1),
    ('datLai: không đặt Lam / chuông',
     "    S.cp = BELLS[2]; BELLS[0].on = false; BELLS[2].on = true;\n    placePlayer((RD.x0 + 3) * T + 6, FLOOR - pl.h); pl.drawT = 0; pl.face = 1;\n", "", 1),
    ('vị trí Bọ theo phòng D', '(RD.x0 + ', '(PD.x0 + ', 3),
    ('gợi ý phòng D', 'ROOMS[S.room] === RD', 'ROOMS[S.room] === PD', 1),
], 'khoi-bo.js')
if re.search(r'\bRD\b', BO): loi.append('khoi-bo.js: còn chỗ RD')
PB = doi(PB, [
    ('mặc định vào phòng A', "vaoA: q.get('vao') === 'a' || q.get('vao') === 'lang',",
     "vaoA: !q.get('vao') || q.get('vao') === 'a' || q.get('vao') === 'lang',   // Lam mới 2: mặc định vào phòng A (nền mới)", 1),
    ('camera DC: bỏ ghi đè camera F', "  if (ROOMS[S.room] === PF) { const tx = camF();", "  if (CAM.phong && ROOMS[S.room] === PF) { const tx = camF();", 1),
    ('camera DC: bỏ ghi đè đặt camera F', "placePlayer = function (x, y) { _pbPlace(x, y); if (ROOMS[S.room] === PF)",
     "placePlayer = function (x, y) { _pbPlace(x, y); if (CAM.phong && ROOMS[S.room] === PF)", 1),
    ('camera DC: datCam trục nền theo khu',
     "const r = ROOMS[roomAt(x + W / 2)], rc = r.x0 * T + r.w * T / 2 - W / 2; S.rc = S.prc = rc;",
     "const r = ROOMS[roomAt(x + W / 2)], rc = CAM.phong ? r.x0 * T + r.w * T / 2 - W / 2 : camKhuCua(x + W / 2).rc; S.rc = S.prc = rc;", 1),
    ('camera DC: nền giữa liên tục',
     "for (const [r, so] of PHONG_SO) for (const p of so.nen.giua) NEN_ABC.giua.push(Object.assign({}, p, {phong: r, rc: r.x0 * T + r.w * T / 2 - W / 2, w: 0}));\n",
     "for (const [r, so] of PHONG_SO) for (const p of so.nen.giua) NEN_ABC.giua.push(Object.assign({}, p, {phong: r, rc: r.x0 * T + r.w * T / 2 - W / 2, w: 0}));\n"
     + NEN_LIEN.rstrip() + "\n", 1),
    ('camera DC: nền giữa không hoà theo phòng', "function nenTrongSo(ox) {\n",
     "function nenTrongSo(ox) {\n  if (!CAM.phong) { for (const p of NEN_ABC.giua) p.w = 1; return; }\n", 1),
], 'khoi-phong-b.js (bản chép)')

R += R_PB
out = doi(src, R, 'am-dao.html')
# nạp sheet Lam mới cùng lúc dựng nền mới (màn "Đang rèn chuông…" chờ xong mới cho bắt đầu)
out = doi(out, [('nạp Lam mới 2 sau nền mới', "    await PBK.chuanBi();    // DHM",
                 "    await LM2.nap();        // Lam mới 2: 2 sheet + bản tô bóng\n    await PBK.chuanBi();    // DHM", 1)], 'sau chỗ thay phòng B')
TAIL = "\nboot();\n</script>"
if out.count(TAIL) != 1: loi.append('khởi động: khớp %d lần (cần 1)' % out.count(TAIL))
else: out = out.replace(TAIL, "\n" + HM + "\n" + BO + "\n" + PB + "\n" + KHOI + TAIL)
if loi:
    sys.exit('LỖI – nguồn đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(THU, 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte · chỗ thay phòng B:', len(R_PB))
