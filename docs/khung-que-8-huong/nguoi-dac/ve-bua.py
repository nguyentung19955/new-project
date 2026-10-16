# Khung người đặc: búa nện 2 tay, 8 khung, nhìn ngang sang phải. Dùng hàm ve() của ve-tu-the.py.
import os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ve-tu-the.py')).read().split('G=[30,10]')[0]
exec(src)
def F(lean,lp,lt,ap,blade,dx=0,hit=0,lo=(-6,-6)):
    return dict(lean=lean,lp=lp,lt=lt,ap=ap,at=(ap[0]+lo[0],ap[1]+lo[1]),blade=blade,dx=dx,hit=hit)
G=[30,10];B=[-25,5]
BUA=[F(4,(28,24),(-25,14),(-40,175),150),            # 1 lấy đà: búa lên vai sau
     F(-8,G,B,(178,172),105,lo=(-4,-8)),                # 2 búa giơ cao quá đầu
     F(16,(38,32),(-30,14),(80,70),-15,dx=3,hit=1),      # 3 ★ nện xuống
     F(24,(42,50),(-34,24),(30,18),-68,dx=4),            # 4 đầu búa chạm đất
     F(22,(42,47),(-34,22),(32,20),-64,dx=4),            # 5 giữ (rung)
     F(15,(38,35),(-30,15),(50,75),-15,dx=3),            # 6 nhấc búa
     F(8,(32,18),(-27,8),(25,105),35,dx=1),              # 7 hồi
     F(5,G,B,(20,125),75)]                               # 8 thủ
ve(BUA,os.path.join(os.path.dirname(os.path.abspath(__file__)),'bua-e.png'))
