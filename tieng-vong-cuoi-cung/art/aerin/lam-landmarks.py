import json,os
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
P=json.load(open(D+'master/sua-se-params.json'))
s,(OX,OY),S,CX=P['scale'],P['offset'],P['squash_far_half'],P['cx']
def t(x,y):
    if x>CX: x=CX+(x-CX)*S
    return [round(x*s)+OX, round(y*s)+OY]
src={'head_center':(32,17),'neck':(32,28),'shoulder_near':(22,31),'shoulder_far':(44,31),'elbow_near':(19,38),'elbow_far':(46,37),
 'hand_free_near':(19,44),'hand_sword_far':(45,43),'hip':(32,42),'knee_near':(25,52),'knee_far':(40,52),'foot_near':(24,60),'foot_far':(42,57)}
m=Image.open(D+'aerin_master_se.png'); bb=m.getbbox()
cy=[(x,y) for y in range(96) for x in range(96) if (lambda p:p[3] and p[2]>200 and p[1]>200 and p[0]<120)(m.getpixel((x,y)))]
tip=max(cy,key=lambda q:q[1])
L={'canvas':[96,96],'ground_baseline_y':88,'bbox_all':list(bb),'height_px_body':88-bb[1],
 'landmarks':{k:t(*v) for k,v in src.items()},
 'sword':{'holding_hand':'anatomical LEFT = far hand (screen-right) when facing SE','hilt_pivot':t(44,44),'blade_tip':[tip[0],tip[1]+3],'blade_dir':'diagonal down, crossing in front of the near leg'},
 'source':'PixelLab 9ea1ed77 rotations/south-east.png -> sua-se.py (far half squashed x%.2f, scarf tail moved behind, nearest scale x%.3f, blade tip redrawn)'%(S,s),
 'accuracy':'+-1 px (hand-estimated on 8x grid, then transformed)'}
json.dump(L,open(D+'aerin_landmarks_se.json','w'),indent=1)
cols={}
for y in range(96):
    for x in range(96):
        p=m.getpixel((x,y))
        if p[3]: cols[p[:3]]=cols.get(p[:3],0)+1
hx=lambda c:'#%02X%02X%02X'%c
json.dump({'locked':{'Navy':'#172A46','Blue':'#3479C8','Ice':'#A8D8FF','White':'#F5F8FF','Silver':'#AABCCF','Cyan':'#44E6F4'},
 'note':'Art Director: keep the 6 hue groups, allow ~24-32 shades; normalize after shape is final',
 'unique_colors':len(cols),'colors_by_use':[{'hex':hx(c),'count':n} for c,n in sorted(cols.items(),key=lambda kv:-kv[1])]},open(D+'aerin_palette.json','w'),indent=1)
print(L['height_px_body'],len(cols),L['landmarks']['hand_sword_far'])
