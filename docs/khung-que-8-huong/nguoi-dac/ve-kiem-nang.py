# Khung người đặc: KIẾM NẶNG combo, nhìn ngang sang phải. Lê kiếm → chém lên → 2 tay chém xuống → kéo sau chém ngang.
import os
D=os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(D,'ve-tu-the.py')).read().split('G=[30,10]')[0])
def F(lean,lp,lt,ap,blade,dx=0,hit=0,lo=(-6,-6),at=None):
    return dict(lean=lean,lp=lp,lt=lt,ap=ap,at=at if at else (ap[0]+lo[0],ap[1]+lo[1]),blade=blade,dx=dx,hit=hit)
G=[30,10];B=[-25,5]
K=[F(8,G,B,(-38,-40),212,at=(25,70)),                     # 1 thủ thế: 1 tay xách kiếm, mũi lê đất sau lưng
   F(14,(36,28),(-30,12),(-48,-52),205,dx=2,at=(35,85)),   # 2 lê kiếm: nhích tới, kiếm cào đất phía sau
   F(10,(36,30),(-30,14),(15,40),-25,dx=2),                # 3 hai tay nắm, kiếm quét sát đất ra trước
   F(-6,(32,18),(-28,8),(130,150),70,dx=2,hit=1),          # 4 ★ chém hất lên
   F(-12,G,B,(178,-172),140,dx=1,lo=(-4,-8)),              # 5 cao nhất: kiếm trên đầu
   F(18,(40,34),(-32,14),(82,72),-15,dx=3,hit=1),          # 6 ★ 2 tay chém bổ xuống
   F(24,(42,48),(-34,22),(32,22),-60,dx=4),                # 7 mũi kiếm sát đất trước mặt
   F(4,(30,22),(-34,20),(-55,-85),180,dx=2),               # 8 kéo kiếm ra sau, ngang hông
   F(16,(40,32),(-34,12),(88,90),0,dx=4,hit=1),            # 9 ★ chém ngang
   F(12,(38,30),(-32,12),(70,125),165,dx=4)]               # 10 theo đà: kiếm vòng ra sau vai
ve(K,os.path.join(D,'kiem-nang-e.png'))
