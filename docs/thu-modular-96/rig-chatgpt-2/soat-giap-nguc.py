#!/usr/bin/env python3
"""Đo % giáp ngực Gen ngoài alpha thân trước/sau sửa khớp, xoay liên tục + 8 hướng.
Chạy sau tao-rig.py: python3 rig/soat-giap-nguc.py
Phép đo dùng cùng anchorStart, boneFrac, stretch clamp, angle 8 hướng và pixel-nearest như Canvas.
"""
import json, math
from pathlib import Path
from PIL import Image
R = Path(__file__).resolve().parent
ROOT = R.parent
D = json.loads((ROOT/'data.json').read_text())
C = json.loads((R/'khop-chinh/chay.json').read_text())
G = json.loads((R/'giap-gen/gen.json').read_text())['pieces']['giap-nguc']
P = json.loads((R/'rig.json').read_text())['armorSets']['gen']['pieces']
P = next(p for p in P if p['id']=='nguc')
N = D['frameCount']; W=H=96
silhouette_paths = ['sheets/rearArm.png', 'sheets/body.png', 'sheets/do-goc/torsoOutfit.png', 'sheets/frontArm.png']
silhouette_layers = [Image.open(ROOT/p).convert('RGBA') for p in silhouette_paths]
armor = Image.open(R/'giap-gen/giap-nguc.png').convert('RGBA')
alpha = []
for f in range(N):
    mask = set()
    for y in range(H):
        for x in range(W):
            if any(im.getpixel((f*W+x,y))[3] for im in silhouette_layers): mask.add((x,y))
    alpha.append(mask)
source = armor.getchannel('A')
asx,asy = P['anchorStart']; aex,aey=P['anchorEnd']; ref=math.hypot(aex-asx,aey-asy)
fix = C['offsetFix']
frames=[]
for i,f in enumerate(D['frames']):
    j={k:[v[0]+fix[0],v[1]+fix[1]] for k,v in f['joints'].items()}
    j.update(C['frames'][i]['joints'])
    frames.append(j)
old_neck={x['frame']-1:x['before'] for x in C.get('bodyJointReview',{}).get('corrections',[]) if x['joint']=='neck'}
old_joints=[]
for i,j in enumerate(frames):
    q=dict(j); q['neck']=old_neck.get(i,j['neck']); old_joints.append(q)
def angle(a,b): return math.atan2(b[1]-a[1], b[0]-a[0])
def circ_smooth(vals,i):
    n=len(vals); v=vals[i]
    if i in (0,n-1): # cyclic run data, no edge
        pass
    prev=vals[(i-1)%n]; nex=vals[(i+1)%n]
    return math.atan2(.5*math.sin(v)+.25*math.sin(prev)+.25*math.sin(nex), .5*math.cos(v)+.25*math.cos(prev)+.25*math.cos(nex))
def torso_angles(js):
    raw=[]
    for j in js:
        raw.append(angle(j['neck'], j['hipCenter']))
    return [circ_smooth(raw,i) for i in range(len(raw))]
def draw_mask(j, theta, mode):
    A=j['neck']; H0=j['hipCenter']; frac=P.get('boneFrac',1)
    L=math.hypot(H0[0]-A[0],H0[1]-A[1])*frac
    if mode: theta=round(theta/(math.pi/4))*(math.pi/4)
    raw=L/ref; sx=min(P['stretch']['max'],max(P['stretch']['min'],raw)); thick=P['thicknessScale']
    c=math.cos(theta); s=math.sin(theta)
    out=set()
    # Canvas nearest-neighbor: inverse-transform destination pixel centers into source image.
    for y in range(H):
        for x in range(W):
            dx=x+.5-A[0]; dy=y+.5-A[1]
            rx=c*dx+s*dy; ry=-s*dx+c*dy
            u=asx+rx/sx; v=asy+ry/thick
            ix,iy=math.floor(u),math.floor(v)
            if 0<=iy<source.height and 0<=ix<source.width and source.getpixel((ix,iy)): out.add((x,y))
    return out
old_angles=[angle(j['neck'],j['hipCenter']) for j in old_joints]
new_neck_angles=[angle(j['neck'],j['hipCenter']) for j in frames]
stable=torso_angles(frames)
rows=[]
for i in range(N):
    row={'frame':i+1,'neckBefore':old_joints[i]['neck'],'neckAfter':frames[i]['neck'],
         'bodyBeforeDeg':round(math.degrees(old_angles[i]),1),
         'neckHipAfterDeg':round(math.degrees(new_neck_angles[i]),1),
         'mountAfterDeg':round(math.degrees(stable[i]),1),'outsideBeforePct':[],'outsideAfterPct':[]}
    for mode in (0,1):
        before=draw_mask(old_joints[i],old_angles[i],mode)
        after=draw_mask(frames[i],stable[i],mode)
        for dest,key in ((before,'outsideBeforePct'),(after,'outsideAfterPct')):
            total=len(dest); outside=sum((x,y) not in alpha[i] for x,y in dest)
            row[key].append(round(100*outside/total,1) if total else 0.0)
    rows.append(row)
rig = json.loads((R/'rig.json').read_text())
report={'method':'Pillow nearest-neighbor inverse affine; alpha silhouette = rearArm ∪ body ∪ torsoOutfit ∪ frontArm; mode indices: continuous, 8-way. Pixels outside = raw armor alpha pixels where upper-body silhouette alpha is empty, measured before render clipping.','thresholdPct':rig.get('chestOutsideThresholdPct',25),'rows':rows}
(R/'bao-giap-nguc.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('| Khung | Góc cũ cổ→hông | Góc sau cổ→hông | Góc neo ổn định | Ngoài thân cũ liên tục / 8 hướng | Sau liên tục / 8 hướng |')
print('|---:|---:|---:|---:|---:|---:|')
for r in rows:
    b='/'.join(f"{v:.1f}%" for v in r['outsideBeforePct']); a='/'.join(f"{v:.1f}%" for v in r['outsideAfterPct'])
    print(f"| {r['frame']} | {r['bodyBeforeDeg']}° | {r['neckHipAfterDeg']}° | {r['mountAfterDeg']}° | {b} | {a} |")
threshold = report['thresholdPct']
warning_frames = [r['frame'] for r in rows if max(r['outsideAfterPct']) > threshold]
print(f'threshold frames >{threshold}% (after):', warning_frames)
lines = [
    '# Báo cáo giáp ngực Gen — hàng chạy', '',
    'Góc quy ước: 0° sang phải, 90° xuống dưới. Pixel ngoài thân đo trên giáp thô trước clipping; ngưỡng đỏ = %d%%. Hai cột ngoài thân ghi liên tục / 8 hướng.' % threshold, '',
    '| Khung | Góc cũ cổ→hông | Góc sau sửa cổ→hông | Góc neo mượt | Ngoài thân trước | Ngoài thân sau |',
    '|---:|---:|---:|---:|---:|---:|'
]
for r in rows:
    b = '/'.join('%.1f%%' % v for v in r['outsideBeforePct'])
    a = '/'.join('%.1f%%' % v for v in r['outsideAfterPct'])
    lines.append('| %d | %.1f° | %.1f° | %.1f° | %s | %s |' % (r['frame'], r['bodyBeforeDeg'], r['neckHipAfterDeg'], r['mountAfterDeg'], b, a))
lines += ['', 'Sau khi vẽ, pixel ngoài alpha hợp của `rearArm + body + torsoOutfit + frontArm` bị clip; số đo trên bảng cố ý dùng alpha giáp trước clipping để phép kiểm vẫn phát hiện lệch neo/asset.',
          'Khung vượt ngưỡng ở ít nhất một chế độ sau sửa: %s.' % (', '.join(map(str, warning_frames)) if warning_frames else 'không có')]
(R/'bao-giap-nguc.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')
