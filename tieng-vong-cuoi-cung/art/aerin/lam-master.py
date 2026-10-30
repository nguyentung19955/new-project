# AERIN Phase 1 – xuất bộ giao nộp từ PixelLab (Create from Reference, nhân vật 9ea1ed77) hướng SE
import json,os
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__))+'/'
se=Image.open(D+'attempt3/pixellab_original_se_64.png').convert('RGBA')
FEET=61; BASE=88; OX=16; OY=BASE-FEET
m=Image.new('RGBA',(96,96)); m.alpha_composite(se,(OX,OY)); m.save(D+'aerin_master_se.png')
b=Image.new('RGBA',(96,96),(58,63,68,255)); b.alpha_composite(m); b.resize((576,576),Image.NEAREST).save(D+'aerin_master_se_x6.png')
o=lambda x,y:[x+OX,y+OY]
L={'canvas':[96,96],'source':'PixelLab character 9ea1ed77-594b-46d6-af61-e9939888c251 rotations/south-east.png (64x64, unchanged copy in attempt3/), pasted at offset [%d,%d]'%(OX,OY),
 'ground_baseline_y':BASE,'bbox_body':[o(5,0)[0],o(5,0)[1],o(58,61)[0],o(58,61)[1]],'height_px_body':62,
 'landmarks':{'head_center':o(32,17),'neck':o(32,28),'shoulder_near':o(22,31),'shoulder_far':o(44,31),'elbow_near':o(19,38),'elbow_far':o(46,37),
  'hand_free_near':o(19,44),'hand_sword_far':o(45,43),'hip':o(32,42),'knee_near':o(25,52),'knee_far':o(40,52),'foot_near':o(24,60),'foot_far':o(42,57)},
 'sword':{'holding_hand':'anatomical LEFT (far hand when facing screen-right)','hilt_pivot':o(44,44),'blade_tip':o(31,64),'blade_tip_clipped':True,'angle_deg_from_hand':-115},
 'method':'eyeballed on an 8x grid; +-1 px'}
json.dump(L,open(D+'aerin_landmarks_se.json','w'),indent=1)
cols={}
for y in range(64):
    for x in range(64):
        p=se.getpixel((x,y))
        if p[3]: cols[p[:3]]=cols.get(p[:3],0)+1
hx=lambda c:'#%02X%02X%02X'%c
json.dump({'locked':{'Navy':'#172A46','Blue':'#3479C8','Ice':'#A8D8FF','White':'#F5F8FF','Silver':'#AABCCF','Cyan':'#44E6F4'},
 'generated_unique_colors':len(cols),'generated_colors_by_use':[{'hex':hx(c),'count':n} for c,n in sorted(cols.items(),key=lambda kv:-kv[1])]},open(D+'aerin_palette.json','w'),indent=1)
print(len(cols))
