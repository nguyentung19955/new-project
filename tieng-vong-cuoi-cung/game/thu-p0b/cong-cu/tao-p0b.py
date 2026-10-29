#!/usr/bin/env python3
"""Tạo game/thu-p0b/index.html (trang thử P0-B: Vọng A ghi chủ động / B Vọng Chiến) từ game/thu-p0a/am-dao.html (Âm Đao, KHÔNG sửa file đó)
+ khối Bọ Vỏ Mộc game/thu-bo-vo-moc/cong-cu/khoi-bo.js (CHỈ ĐỌC, chỉnh trên bản chép: phòng thử RD → phòng D mới, bỏ phần bot/quay của trang Bọ)
+ khối cong-cu/khoi-p0b.js (Vọng A / B / B2 + log nền). Mỗi chỗ thay phải khớp đúng số lần – lệch thì dừng.
PH9: sửa replay mẫu cuối + bóng nghỉ (chung A/B) bằng các chỗ thay updateEcho bên dưới; bỏ bản vá lỗi `sx` của Bọ (đã sửa tại nguồn).
Khi am-dao.html đổi (vd. Âm Đao PH8 sửa hitbox) → chạy lại script này để A/B dùng chung bản mới.
Chạy (sau khi trang Âm Đao đã sinh): python3 game/thu-p0b/cong-cu/tao-p0b.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
THU = os.path.normpath(os.path.join(HERE, '..'))
GAME = os.path.normpath(os.path.join(THU, '..'))
src = open(os.path.join(GAME, 'thu-p0a', 'am-dao.html'), encoding='utf-8').read()
KHOI = open(os.path.join(HERE, 'khoi-p0b.js'), encoding='utf-8').read()
import hashlib, datetime
def _bam(*ps): h = hashlib.sha1(); [h.update(open(x, 'rb').read()) for x in ps]; return h.hexdigest()[:8]
# PH14 mục 7: bản đóng băng phải gồm cả RUNTIME DÙNG CHUNG + ảnh / JSON nó nạp – không chỉ index.html. Mã phiên băm thêm mọi file
# ../runtime/*.js mà trang nạp + dữ liệu cổng / đất mà runtime đọc → runtime đổi thì phiên đổi (không còn "giữ nguyên chỉ vì index.html giống cũ").
# Danh sách ĐẦY ĐỦ mọi file trang tải (kèm sha1) ghi bằng cong-cu/ghi-dong-bang.py → thu-p0b/dong-bang/<phiên>.json.
import re as _re
RUNTIME = sorted(set(os.path.normpath(os.path.join(GAME, 'thu-p0b', m)) for m in _re.findall(r'<script src="(\.\./runtime/[^"]+\.js)"', src)))
DU_LIEU_RT = [os.path.join(GAME, '..', 'art', 'the-gioi-moi', 'dia-hinh-v4', f) for f in ('cong-doc.json', 'cong-doc-3x.png', 'dia-hinh-v4.json', 'man-re.json', 'man-re-3x.png')]   # lần 8: màn rễ rủ PH15
# 29/10 (lần 7): thêm JSON làng hoàn thiện + 2 tranh màn bắt đầu / kết mà runtime lang-hoan-thien.js nạp → đổi tranh thì phiên đổi
import json as _js
_LHT = os.path.join(GAME, '..', 'art', 'lang-hoan-thien'); DU_LIEU_RT += [os.path.join(_LHT, 'lang-hoan-thien.json')] + \
    [os.path.join(_LHT, t['tep']) for t in _js.load(open(os.path.join(_LHT, 'lang-hoan-thien.json'), encoding='utf-8'))['tranh'].values()]
PHIEN = 'p0b-' + datetime.date.today().strftime('%d%m') + '-' + _bam(os.path.join(GAME, 'thu-p0a', 'am-dao.html'), os.path.join(HERE, 'khoi-p0b.js'),
                                                                 os.path.join(GAME, 'thu-bo-vo-moc', 'cong-cu', 'khoi-bo.js'), os.path.abspath(__file__),
                                                                 *RUNTIME, *[x for x in DU_LIEU_RT if os.path.exists(x)])
KHOI = KHOI.replace("'__PHIEN__'", "'" + PHIEN + "'")
BO = open(os.path.join(GAME, 'thu-bo-vo-moc', 'cong-cu', 'khoi-bo.js'), encoding='utf-8').read()

loi = []
def doi(text, R, ten):
    for mo_ta, cu, moi, lan in R:
        n = text.count(cu)
        if n != lan:
            loi.append('%s – %s: khớp %d lần (cần %d)' % (ten, mo_ta, n, lan)); continue
        text = text.replace(cu, moi)
    return text

# ---------- khối Bọ: chép rồi chỉnh (KHÔNG ghi lại file gốc) ----------
MOC_THU = '/* ======================= THỬ (không ghép vào demo.html): bot + API quay / chụp'
if BO.count(MOC_THU) != 1: loi.append('khoi-bo.js: không thấy mốc phần THỬ')
BO = BO.split(MOC_THU)[0]
BO = doi(BO, [
    ('chú thích phòng thử', '/* ---------- PHÒNG THỬ: phòng "Điểm lưu" (RD, 30 ô = đúng 1 màn) làm phẳng, chặn hai đầu ---------- */',
     '/* ---------- PHÒNG D (P0-B): phòng Bọ mới nối sau hành lang gác ---------- */', 1),
    ('phòng thử RD → phòng D (P0-B)',
     "RD.name = 'Phòng thử Bọ Vỏ Mộc';\nfill(RD, 0, 0, RD.w - 1, 13, '.');                 // bỏ 2 bệ một chiều\n"
     "fill(RD, 0, 0, 0, 13, 'S'); fill(RD, RD.w - 1, 0, RD.w - 1, 13, 'S');   // tường hai đầu (không sang phòng câu đố / boss)\n"
     "BELLS[2].x = (RD.x0 + 3) * T + 16;                  // chuông lưu dời về đầu phòng (hồi sinh ở đây)\n",
     "// P0-B: phòng D (PD, 30 ô) tạo trong tao-p0b.py – trần 8 ô như hành lang C, vào từ trái (mở tường phải phòng C), tường phải\n", 1),
    ('datLai: không đặt Lam / chuông (P0-B vào từ phòng A)',
     "    S.cp = BELLS[2]; BELLS[0].on = false; BELLS[2].on = true;\n    placePlayer((RD.x0 + 3) * T + 6, FLOOR - pl.h); pl.drawT = 0; pl.face = 1;\n", "", 1),
    ('vị trí Bọ theo phòng D', '(RD.x0 + ', '(PD.x0 + ', 3),
    ('gợi ý phòng D', 'ROOMS[S.room] === RD', 'ROOMS[S.room] === PD', 1),
], 'khoi-bo.js')
# PH9 mục 2H: lỗi `sx is not defined` (chú thích nuốt khai báo trong veThanh) ĐÃ SỬA TẠI NGUỒN khoi-bo.js (commit 0836a73) → bỏ bản vá trên bản chép.
if 'PH7: chỉ ở ?debug / ?hitbox=1 const a' in BO: loi.append('khoi-bo.js: lỗi chú thích nuốt khai báo sx còn ở nguồn – sửa tại nguồn, không vá bản chép')
if 'RD' in BO.replace('RDS', ''):
    import re
    con = [m.start() for m in re.finditer(r'\bRD\b', BO)]
    if con: loi.append('khoi-bo.js: còn %d chỗ RD' % len(con))

R = []
def thay(mo_ta, cu, moi, lan=1): R.append((mo_ta, cu, moi, lan))

thay('tiêu đề', '<title>Tiếng Vọng – Thử Âm Đao cấp 1–4 (trên P0-A)</title>', '<title>Tiếng Vọng – Thử P0-B (Vọng A / B)</title>')
thay('màn bắt đầu', '<p class="big">Thử Âm Đao cấp 1–4 · đánh thường + âm nhận, giữ Chém = Dư Âm (cấp 3+)</p>',
     '<p class="big">Thử P0-B · hai cách gọi bóng: A ghi chủ động / B Vọng Chiến · Âm Đao cấp 1</p>')
thay('ảnh Âm Đao ở thư mục thu-p0a', "'am-dao/", "'../thu-p0a/am-dao/", 5)
thay('khoá Âm Đao cấp 1 (không Dư Âm)', "const CAP0 = Math.max(1, Math.min(4, +(AD_Q.get('cap') || 1) || 1));", "const CAP0 = 1;   // P0-B: luôn cấp 1, không Dư Âm (PH7 mục 4)")
# phòng D sau hành lang gác
thay('thêm phòng D', "PC=room('Hành lang gác',32);", "PC=room('Hành lang gác',32), PD=room('Phòng Bọ',30);")
thay('mở tường phải phòng C, dựng phòng D', "fill(PC,PC.w-1,6,PC.w-1,13,'S');",
     "fill(PD,0,0,PD.w-1,5,'S'); fill(PD,PD.w-1,6,PD.w-1,13,'S');   // P0-B: tường phải C bỏ → sang phòng D (trần 8 ô như C)")
# nút V: một nghĩa theo cấu hình
thay('nút V theo cấu hình A / B', "if(pressed('v') && !pl.dead && !S.won && pl.drawT<=0){ if(rec) stopRec(); else startRec(); }",
     "VB.truocKhung();\n  if(pressed('v') && !pl.dead && !S.won && pl.drawT<=0) VB.bamV();   // P0-B: A = bật/tắt ghi; B = phát lại 1,5 s vừa qua")
thay('A tự dừng 180 tick + B vòng đệm luôn ghi', "  if(rec){ recordFrame(hb); if(rec.n>=P.echoFrames) stopRec(); }\n  updateEcho();",
     "  if(rec){ recordFrame(hb); if(rec.n>=P.echoFrames) VB.tuDung(); }\n  VB.buoc(hb);   // P0-B: B ghi vòng đệm 90 tick (sau hitstop – dừng trong khựng)\n  updateEcho();")
thay('đo bóng sau khi thu hộp', "  if(echo && !echo.done && echo.cur.hb) P0.thuThapBong(echo.cur);   // D bóng tra theo maGoc của lần phát này\n",
     "  if(echo && !echo.done && echo.cur.hb) P0.thuThapBong(echo.cur);   // D bóng tra theo maGoc của lần phát này\n  VB.sauBong();\n")
thay('thu hộp: thêm Bọ (D bền, mã đòn = sw)', "    return co;\n  }\n  function tenQ(q)",
     "    if (VB_trungBo(hb, D, face, n)) co = true;   // P0-B: Bọ ở phòng D (mai / bụng)\n    return co;\n  }\n  function tenQ(q)")
thay('log sát thương bóng (Q)', "        h.m = m; h.chan = chan; sumM += m; if (nhanThe(e)) sumT += t;",
     "        h.m = m; h.chan = chan; sumM += m; if (nhanThe(e)) sumT += t;\n        if (bong) VB.bongTrung(tenQ(e), m, nhanThe(e) ? t : 0, chan);")
# Bọ: nạp, đặt lại, cập nhật, vẽ, hitbox, chém nảy
thay('nạp gói mảnh Bọ', "    const hdL=await thu(napHD,",
     "    await thu(()=>BO.nap(p=>setLoad(0.795+0.004*p)),'Nạp + giải mã mảnh Bọ Vỏ Mộc',0.795);\n"
     "    if(loi.length){ baoLoi('Không nạp được hình. Bấm \"Thử lại\"; nếu vẫn lỗi, tải lại trang.',loi); return; }\n    const hdL=await thu(napHD,")
thay('ván mới: đặt lại Bọ', "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n  P0.vanMoi();\n}",
     "  for(const q of Q) q.H=null; boss.H=null;   // tư thế rig làm lại từ đầu\n  BO.datLai();\n  P0.vanMoi();\n}")
thay('lưu vị trí Bọ (nội suy)', "  boss.px=boss.x; boss.py=boss.y;\n", "  boss.px=boss.x; boss.py=boss.y;\n  BO.luuTruoc();\n")
thay('cập nhật Bọ', "  for(const q of Q) updateQuai(q);\n", "  for(const q of Q) updateQuai(q);\n  BO.capNhat();\n")
thay('vẽ Bọ (xác trước, sống + dấu báo sau)', "  for(const q of Q) drawQuai(q,al);\n", "  BO.veXac(al);\n  for(const q of Q) drawQuai(q,al);\n  BO.ve(al);\n")
thay('hitbox Bọ', "  for(const w of WAVES) if(w.on) hbRect(", "  BO.veHitbox(al);\n  for(const w of WAVES) if(w.on) hbRect(")
thay('chém nảy trên Bọ', "  if(boss.hittable && !boss.dead && overlap(PR,boss)) return true;", "  if(boss.hittable && !boss.dead && overlap(PR,boss)) return true;\n  if(BO.pogo(PR)) return true;")
# ---------- PH9 mục 1.3 + 1.4: SỬA REPLAY MẪU CUỐI (cả A và B dùng chung updateEcho) ----------
# Cũ: lấy mẫu cuối và đặt echo.done CÙNG bước → `if(echo && !echo.done && echo.cur.hb)` bỏ qua hộp mẫu cuối (mất một hành động).
# Mới: bước lấy mẫu cuối xử lý ĐỦ hình + hộp + hit của tick đó (thuThapBong → giaiQuyet); bước SAU mới kết thúc phát → tư thế NGHỈ (VB.nghi:
# hướng cuối, không hộp, mờ) hoặc tan (?tan=1). Không phát lặp tick nào: mỗi mẫu đúng một bước có hộp.
thay('PH9: updateEcho xử lý đủ mẫu cuối rồi mới kết thúc',
     "  if(echo.i<echo.n){ echo.cur=REC[echo.i++]; if(echo.i>=echo.n) echo.done=true;\n",
     "  if(echo.i<echo.n){ echo.cur=REC[echo.i++];   // P0-B (PH9): mẫu cuối CHƯA kết thúc ở bước này – hộp + hit của nó xử lý như mọi mẫu\n")
thay('PH9: kết thúc phát ở bước sau mẫu cuối → tư thế nghỉ',
     "  echo.warn=false;\n  if(!echo.done){\n",
     "  else if(!echo.done){ echo.done=true; VB.nghi(); }   // P0-B (PH9): hết đoạn → nghỉ theo hướng cuối, không hộp (hoặc tan ?tan=1)\n  echo.warn=false;\n  if(!echo.done){\n")
thay('PH9: bóng nghỉ mờ hơn, không nhịp sáng (hạ độ nổi); ?tan=1 mờ dần',
     "      const pz=0.5+0.5*Math.sin(S.frame*0.09);\n      ctx.globalAlpha=0.16+0.16*pz; ctx.fillStyle='#CEF0D6'; ctx.beginPath(); ctx.ellipse(ex+10-ox,ey+30-oy,26,5,0,0,7); ctx.fill();\n      ctx.globalAlpha=0.36+0.14*pz; drawLam(LAM.E,c,ex,ey);\n",
     "      const kn=VB.doNoi();   // P0-B (PH9): bóng nghỉ – không nhịp sáng, mờ hơn (trước: 0,36–0,50 nhấp nháy); ?tan=1 → mờ dần rồi mất\n      ctx.globalAlpha=0.08*kn; ctx.fillStyle='#CEF0D6'; ctx.beginPath(); ctx.ellipse(ex+10-ox,ey+30-oy,22,4,0,0,7); ctx.fill();\n      ctx.globalAlpha=0.24*kn; drawLam(LAM.E,c,ex,ey);\n")
thay('PH9: thanh Vọng không nhấp nháy khi bóng đã nghỉ (2 HUD)',
     "  else if(echo && echo.done){ col=(S.frame>>4)%2?'#CEF0D6':'#83CC93'; }",
     "  else if(echo && echo.done){ col='#5f7f6a'; }   // P0-B (PH9): bóng nghỉ – không nhấp nháy như còn nhiệm vụ", 2)
thay('khối Bọ + P0-B, rồi khởi động', "\nboot();\n</script>", "\n" + BO + "\n" + KHOI + "\nboot();\n</script>")

out = doi(src, R, 'am-dao.html')
if loi:
    sys.exit('LỖI – nguồn đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(THU, 'index.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte · phiên', PHIEN, '· runtime băm kèm:', [os.path.basename(x) for x in RUNTIME])
