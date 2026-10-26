#!/usr/bin/env python3
"""Tạo game/thu-quai-boss/thu-quai-boss.html từ game/demo.html (KHÔNG sửa demo.html).

Mỗi chỗ thay là một cặp (cũ → mới) phải khớp ĐÚNG 1 lần – nếu demo.html đã đổi khác thì dừng và báo chỗ nào.
Danh sách thay dưới đây chính là "phần cần ghép" khi đưa quái/boss vẽ từ mảnh vào demo.html (xem GHI-CHU.md).
Phần THỬ (bot, kịch bản kiểm đòn, API quay video) nằm trong khối /* === THỬ === */ ở cuối – KHÔNG ghép vào demo.

Chạy: python3 game/thu-quai-boss/cong-cu/tao-tu-demo.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..'))
src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
THU = open(os.path.join(HERE, 'khoi-thu.js'), encoding='utf-8').read()
VE = open(os.path.join(HERE, 'khoi-ve-quai-boss.js'), encoding='utf-8').read()

R = []  # (mô tả, cũ, mới, ghép-vào-demo?)
def thay(mo_ta, cu, moi, ghep=True):
    R.append((mo_ta, cu, moi, ghep))

thay('tiêu đề', '<title>Tiếng Vọng – Demo Làng Chuông</title>',
     '<title>Tiếng Vọng – Thử quái + boss (vẽ từ mảnh)</title>', False)
thay('nút hitbox (CSS)', 'body.touch #keys,body.bossfight #keys{display:none}',
     'body.touch #keys,body.bossfight #keys,body.hb #keys{display:none}\n#top button.on{border-color:#ff4a4a;color:#ff9a9a}', False)
thay('nút hitbox (HTML)', '<button id="btn-mute" type="button" aria-label="Tắt tiếng">🔊</button>',
     '<button id="btn-mute" type="button" aria-label="Tắt tiếng">🔊</button>\n    <button id="btn-hb" type="button" aria-label="Bật/tắt hitbox (phím H)">▣</button>', False)
thay('nạp runtime quái/boss', "<script>\n'use strict';",
     "<script src=\"../runtime/quai-boss-runtime.js\"></script>\n<script>\n'use strict';")
thay('đường dẫn tài nguyên (thư mục thu-quai-boss/ sâu hơn 1 cấp)',
     """const SRC = {
  lam:  '../art/modular/lam-moi/rig-v3/sprite/lam-chay-2x.json',
  nghi: 'anim/lam-nghi-2x.png',
  qb:   'anim/quai-boss.json',
  tg:   'anim/the-gioi.json'
};""",
     """const SRC = {
  lam:  '../../art/modular/lam-moi/rig-v3/sprite/lam-chay-2x.json',
  nghi: '../anim/lam-nghi-2x.png',
  tg:   '../anim/the-gioi.json',
  qbr:  '../runtime/quai-boss/'     // GÓI RUNTIME quái + boss: quai-boss-rig.json + 14 mảnh PNG (game/runtime/quai-boss/)
};""", False)
thay('ảnh sheet thế giới theo thư mục của JSON', "json=await r.json(); src='anim/'+json.image; }",
     "json=await r.json(); src=new URL(json.image,new URL(SRC[ten],location.href)).href; }", False)
thay('quái: chọn khung sheet → ánh xạ trạng thái gameplay sang clip rig',
     """  if(q.st==='walk'){ q.c2='quai-di'; q.k2=animK(QB.anims['quai-di'],q.at); }
  else if(q.st==='wind'){ q.c2='quai-tan-cong'; q.k2=0; }
  else if(q.st==='strike'){ q.c2='quai-tan-cong'; q.k2=q.t<5?1:2; }
  else if(q.st==='rec'){ q.c2='quai-tan-cong'; q.k2=3; }
  else if(q.st==='hit'){ q.c2='quai-trung'; q.k2=0; }
  else if(q.st==='die'){ q.c2='quai-chet'; q.k2=q.t<7?0:q.t<16?1:q.t<26?2:3; }
  else { q.c2='quai-di'; q.k2=0; }""",
     """  QBR.capNhatQuai(q,S.frame);   // trạng thái gameplay → clip rig (game/runtime/quai-boss-runtime.js)""")
thay('boss: chọn khung sheet → ánh xạ trạng thái gameplay',
     """function bossAnim(){   // TẠM: boss chỉ có 6 khung thở; nhịp nhanh hơn khi đi / lấy đà
  const b=boss, sp=b.st==='sleep'?0.5:(b.st==='walk'?1.4:(b.st==='slamPrep'||b.st==='sweepPrep')?2.2:1);
  b.ph=(b.ph||0)+sp; b.k2=animK(QB.anims['boss-tho'],b.ph|0);
}""",
     """const BOSS_G={FLOOR};
function bossAnim(){ QBR.capNhatBoss(boss,S.frame,BOSS_G); }   // trạng thái gameplay → clip / tư thế rig""")
i0 = src.index('function drawQuai(q,al){')
i1 = src.index('function render(al){')
thay('vẽ quái + boss từ mảnh (thay drawQuai / chain / drawBoss)', src[i0:i1], VE)
thay('nạp: bỏ sheet quái/boss cũ, nạp + decode gói mảnh',
     """const lam=await thu(napLam,'Nạp Lam',0.3), qb=await thu(()=>napSheet('qb'),'Nạp Quái Chuông Gỗ và Chuông Gác Làng',0.55), tg=await thu(()=>napSheet('tg'),'Lát rễ cây làng',0.75);""",
     """const lam=await thu(napLam,'Nạp Lam',0.2), qbr=await thu(()=>QBR.nap(SRC.qbr,p=>setLoad(0.3+0.45*p)),'Nạp + giải mã mảnh Quái Chuông Gỗ và Chuông Gác Làng',0.3), tg=await thu(()=>napSheet('tg'),'Lát rễ cây làng',0.75);""")
thay('nạp: bỏ tô màu sheet cũ',
     """    setLoad(0.85,'Tô màu quái'); await wait(10);
    QB=qb; QB.w=tint(qb.img,'#ffffff',0.85); QB.g=tint(qb.img,'#E1B85A',0.7);   // nháy trắng khi trúng đòn, lóe vàng khi lấy đà
    const hd=qb.anims['quai-tan-cong'].buoc[2].box; if(hd){ QHB.dx=hd[0]; QHB.dy=hd[1]; QHB.w=hd[2]; QHB.h=hd[3]; }
""",
     """    QB=qbr;   // số đo nạp mảnh (QBR.so); hộp đấm quái QHB giữ nguyên số gameplay {-90,-81,66,37}
""")
thay('debug: chữ trạng thái quái', "ctx.fillText(q.c2+' #'+(q.k2+1)+' '+q.st,qx-ox,qy-oy-128); }",
     "ctx.fillText(q.H?q.H.info:q.st,qx-ox,qy-oy-128); }")
thay('vẽ hitbox overlay + đo thời gian vẽ', "  if(DBG.on) drawDebug(al);\n  updRecUI();",
     "  if(DBG.on) drawDebug(al);\n  if(THU.hb) drawHitbox(al);\n  updRecUI();", False)
thay('khoá thời gian hoạt hoạ khi dừng / hitstop', "function render(al){\n  ctx.setTransform(BK,0,0,BK,0,0); DBG.n=0;",
     "function render(al){\n  ctx.setTransform(BK,0,0,BK,0,0); DBG.n=0;\n  ANIM_AL=(S.paused||S.hitstop>0)?1:al;   // dừng / khựng đòn: giữ đúng tư thế của bước hiện tại (không nhích qua lại trong 1 bước)\n  const T0=performance.now(); QBR.soLanVe=0;")
thay('đo thời gian vẽ khung', "  if(DBG.on) drawDebug(al);\n  if(THU.hb)", "  DO.ve(performance.now()-T0);\n  if(DBG.on) drawDebug(al);\n  if(THU.hb)", False)
thay('bất tử khi quay thử', "  pl.hp--; pl.iframes=P.hurtIFrames;", "  pl.hp--; if(THU.batTu && pl.hp<1) pl.hp=1; DO.trung(); pl.iframes=P.hurtIFrames;", False)
thay('vào nhanh pha 2', "function bossStart(){ boss.st='intro';", "function bossStart(){ if(THU.vao==='boss2') boss.hp=9; boss.st='intro';", False)
thay('khối THỬ + khởi động', "\nboot();\n</script>", "\n" + THU + "\nboot();\n</script>", False)

out = src
loi = []
for mo_ta, cu, moi, ghep in R:
    n = out.count(cu)
    if n != 1:
        loi.append('%s: khớp %d lần (cần 1)' % (mo_ta, n))
        continue
    out = out.replace(cu, moi)
if loi:
    sys.exit('LỖI – demo.html đã đổi, sửa script:\n  ' + '\n  '.join(loi))
dst = os.path.join(GAME, 'thu-quai-boss', 'thu-quai-boss.html')
open(dst, 'w', encoding='utf-8').write(out)
print('ghi', dst, len(out.encode('utf-8')), 'byte')
print('Phần GHÉP vào demo.html:', '; '.join(m for m, _, _, g in R if g))
