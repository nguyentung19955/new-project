from lap import *
def rest(cv, dbg=False):
    Mt=place((236,335),0,(88,86),B)
    L=[]
    # tay xa
    armB,_=chain(['tay-tren-xa','cang-tay-xa','gang-xa'],app(Mt,(45,55)),[120,150,180])
    legB,_=chain(['dui-xa','cang-chan-xa','ung-xa'],app(Mt,(50,100)),[100,95,90])
    legA,_=chain(['dui-gan','cang-chan-gan','ung-gan'],app(Mt,(125,100)),[80,85,90])
    armA,_=chain(['tay-tren-gan','cang-tay-gan','gang-gan'],app(Mt,(130,55)),[85,30,10])
    L+= [(P['capelet-sau'],place((165,285),0,(86,69),B))]
    L+= armB+legB+legA
    L+= [(P['than'],Mt),(P['bao-dao'],place((160,352),0,(57,72),B)),(P['vat-sau'],place((175,372),0,(63,62),B)),
         (P['vat-truoc'],place((250,372),0,(54,66),B)),(P['dai'],place((236,338),0,(94,30),B))]
    Mh=place((205,245),0,(200,250),1.0)
    L+= [(P['mu'],Mh),(P['mat'],Mh@T_(244,198)@S_(0.46)@T_(-25,-46)),(P['mat'],Mh@T_(283,193)@S_(0.5)@T_(-25,-46))]
    gl=armA[-1][1]
    L+= armA[:2]+[(P['dao'],gl@T_(58,52)@R_(-12)@T_(-32,-58))]+armA[2:]
    L+= [(P['capelet-truoc'],place((250,282),0,(80,59),B)),(P['chuong'],place((245,290),0,(34,44),B))]
    for img,M in L: put(cv,img,M)
    return cv
if __name__=='__main__':
    m=Image.open('master-s.png').convert('RGBA')
    cv=Image.new('RGBA',(520,520),(0,0,0,0)); rest(cv)
    a=Image.new('RGBA',(520,520),(255,255,255,255)); a.alpha_composite(m,(0,0)); 
    b=Image.new('RGBA',(520,520),(255,255,255,255)); b.alpha_composite(cv)
    ov=Image.blend(a,b,0.5)
    o=Image.new('RGB',(1560,520),'white'); o.paste(a.convert('RGB'),(0,0)); o.paste(b.convert('RGB'),(520,0)); o.paste(ov.convert('RGB'),(1040,0)); o.save('rest.png')
