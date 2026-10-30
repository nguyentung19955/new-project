from rig import *
from PIL import Image
def save(name,frames,durs,S=4):
    import os; os.makedirs(name,exist_ok=True)
    for i,f in enumerate(frames): f.save(f'{name}/{i}.png')
    strip=Image.new('RGBA',(64*len(frames),64),(110,170,60,255))
    for i,f in enumerate(frames): strip.alpha_composite(f,(64*i,0))
    strip.save(f'{name}/strip_1x.png'); strip.resize((strip.width*S,64*S),Image.NEAREST).save(f'{name}/strip_{S}x.png')
    for sc in (1,3):
        g=[]
        for f in frames:
            bg=Image.new('RGBA',(64,64),(110,170,60,255)); bg.alpha_composite(f)
            g.append(bg.resize((64*sc,64*sc),Image.NEAREST).convert('P'))
        g[0].save(f'{name}/{name}_{sc}x.gif',save_all=True,append_images=g[1:],duration=durs,loop=0,disposal=2)

# IDLE 4f: breathing bob like the reference idle
idle=[char({}),char({'hy':1}),char({'hy':1,'sq':1}),char({'hy':1})]
save('idle',idle,[300,150,300,150])

# ATTACK 1
sl=lambda c: None
def A4pre(c): speedline(c,36,41,14,135,-50); speedline(c,36,41,12,100,-30)
def A5pre(c): speedline(c,36,41,14,30,-45)
def A3mid(c): smear(c,36,41,7,14,135,-55)
atk=[
 char({}),
 char({'bx':-1,'by':1,'hx':-2,'hy':2,'ff':(0,0),'fb':(0,0),'hand':(26,50),'ang':150,'sback':1,'sh':(29,45)}),
 char({'bx':-2,'by':2,'hx':-3,'hy':3,'sq':1,'ff':(0,0),'fb':(-1,0),'hand':(24,50),'ang':160,'sback':1,'sh':(28,46)}),
 char({'bx':3,'by':1,'hx':4,'hy':1,'ff':(5,0),'fb':(-1,0),'sword':False,'hand':(42,40),'mid':A3mid}),
 char({'bx':3,'by':1,'hx':4,'hy':0,'ff':(5,0),'fb':(-1,0),'hand':(41,41),'ang':-55,'pre':A4pre}),
 char({'bx':2,'by':1,'hx':3,'hy':1,'ff':(4,0),'fb':(0,0),'hand':(40,44),'ang':-20,'pre':A5pre}),
 char({'bx':1,'by':1,'hx':1,'hy':2,'ff':(2,0),'fb':(0,0),'hand':(38,48),'ang':25}),
 char({}),
]
save('attack1',atk,[80,70,120,60,80,90,110,150])
