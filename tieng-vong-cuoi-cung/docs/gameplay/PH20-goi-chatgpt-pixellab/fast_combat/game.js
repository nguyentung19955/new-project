'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=128,H=128,GROUND=445;
// Each sprite sheet is one horizontal row of 128x128 frames, transparent PNG.
const specs={idle:[6,8,true],run:[8,14,true],jump:[3,12,false],fall:[2,8,true],attack1:[5,18,false],attack2:[6,20,false],attack3:[7,18,false],dash:[4,20,false],hurt:[3,12,false],death:[8,12,false]};
const clips={};for(const [name,[frames,fps,loop]] of Object.entries(specs)){const image=new Image();clips[name]={image,frames,fps,loop,ready:false};image.onload=()=>{clips[name].ready=image.naturalWidth>=frames*W&&image.naturalHeight>=H;};image.src=`assets/${name}.png`;}
const keys=new Set();let attackBuffer=0,dashRequest=false,jumpRequest=false,hitstop=0,shake=0;
const p={x:130,y:GROUND-96,w:46,h:96,vx:0,vy:0,facing:1,grounded:true,state:'idle',t:0,attackNum:0,hitRegistered:false,dashCooldown:0};
const enemy={x:680,y:GROUND-85,w:58,h:85,hp:100,flash:0};
const ATTACKS={attack1:{duration:5/18,active:[.055,.17],reach:82,damage:13},attack2:{duration:6/20,active:[.06,.19],reach:88,damage:15},attack3:{duration:7/18,active:[.10,.25],reach:105,damage:25}};
function setState(s){if(p.state!==s){p.state=s;p.t=0;p.hitRegistered=false;}}
function startAttack(n){p.attackNum=n;attackBuffer=0;setState('attack'+n);p.vx=0;}
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyJ'){if(p.state.startsWith('attack'))attackBuffer=.42;else if(p.state!=='dash')startAttack(1);}if(e.code==='KeyK'||e.code.startsWith('Shift'))dashRequest=true;if(['Space','KeyW','ArrowUp'].includes(e.code))jumpRequest=true;if(e.code==='KeyR')enemy.hp=100;});
addEventListener('keyup',e=>keys.delete(e.code));
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function update(dt){enemy.flash=Math.max(0,enemy.flash-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);attackBuffer=Math.max(0,attackBuffer-dt);
 const direction=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 if(direction&&!p.state.startsWith('attack')&&p.state!=='dash')p.facing=direction;
 if(dashRequest&&p.dashCooldown<=0){setState('dash');p.dashCooldown=.65;p.vy=0;}dashRequest=false;
 if(jumpRequest&&p.grounded&&p.state!=='dash'&&!p.state.startsWith('attack')){p.vy=-590;p.grounded=false;setState('jump');}jumpRequest=false;
 const attacking=p.state.startsWith('attack'),dashing=p.state==='dash';
 if(dashing){p.vx=p.facing*670;p.vy=0;}else if(attacking){p.vx=p.facing*55;}else p.vx=direction*295;
 if(!dashing)p.vy+=1650*dt;
 p.x=Math.max(0,Math.min(canvas.width-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;
 if(p.y+p.h>=GROUND){p.y=GROUND-p.h;p.vy=0;p.grounded=true;}else p.grounded=false;
 p.t+=dt;
 if(attacking){const a=ATTACKS[p.state];if(!p.hitRegistered&&p.t>=a.active[0]&&p.t<a.active[1]){const hit={x:p.facing===1?p.x+p.w:p.x-a.reach,y:p.y+17,w:a.reach,h:65};if(enemy.hp>0&&overlap(hit,enemy)){enemy.hp=Math.max(0,enemy.hp-a.damage);enemy.flash=.11;hitstop=.045;shake=5;p.hitRegistered=true;}}
 if(p.t>=a.duration){if(attackBuffer>0&&p.attackNum<3)startAttack(p.attackNum+1);else{attackBuffer=0;setState(p.grounded?(direction?'run':'idle'):(p.vy<0?'jump':'fall'));}}}
 else if(dashing){if(p.t>=.20)setState(p.grounded?(direction?'run':'idle'):(p.vy<0?'jump':'fall'));}
 else setState(p.grounded?(direction?'run':'idle'):(p.vy<0?'jump':'fall'));
}
function render(){ctx.save();ctx.fillStyle='#202332';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#333749';ctx.fillRect(0,GROUND,canvas.width,canvas.height-GROUND);ctx.fillStyle='#838092';ctx.fillRect(0,GROUND,canvas.width,3);
 if(shake>0){ctx.translate(Math.round((Math.random()-.5)*shake),Math.round((Math.random()-.5)*shake));shake*=.75;if(shake<.3)shake=0;}
 // Enemy placeholder.
 if(enemy.hp>0){ctx.fillStyle=enemy.flash?'#fff1bc':'#9c5260';ctx.fillRect(enemy.x,enemy.y,enemy.w,enemy.h);ctx.fillStyle='#5c263a';ctx.fillRect(enemy.x,enemy.y-15,enemy.w,7);ctx.fillStyle='#e25b65';ctx.fillRect(enemy.x,enemy.y-15,enemy.w*enemy.hp/100,7);}
 const a=clips[p.state],frame=a.loop?Math.floor(p.t*a.fps)%a.frames:Math.min(a.frames-1,Math.floor(p.t*a.fps));
 const center=p.x+p.w/2,drawX=Math.round(center-W/2),drawY=Math.round(p.y+p.h-H+12);
 if(a.ready){ctx.save();if(p.facing===-1){ctx.translate(Math.round(center)*2,0);ctx.scale(-1,1);}ctx.drawImage(a.image,frame*W,0,W,H,drawX,drawY,W,H);ctx.restore();}
 else{ctx.fillStyle='#778a9f';ctx.fillRect(p.x+9,p.y+23,28,54);ctx.fillStyle='#d2c3ae';ctx.fillRect(p.x+13,p.y+2,20,23);ctx.fillStyle='#b8bcc5';ctx.fillRect(p.x+7,p.y+77,13,19);ctx.fillRect(p.x+27,p.y+77,13,19);ctx.fillStyle='#f0b36e';if(p.state.startsWith('attack'))ctx.fillRect(p.facing===1?p.x+45:p.x-65,p.y+37,65,8);}
 if(p.state.startsWith('attack')){const atk=ATTACKS[p.state];if(p.t>=atk.active[0]&&p.t<atk.active[1]){ctx.strokeStyle='#f8a954';ctx.strokeRect(p.facing===1?p.x+p.w:p.x-atk.reach,p.y+17,atk.reach,65);}}
 ctx.restore();ctx.fillStyle='#eee';ctx.font='16px monospace';ctx.fillText(`State: ${p.state}  Frame: ${frame}  Enemy HP: ${enemy.hp}`,16,30);ctx.fillText('A/D Move | Space Jump | J Combo | K Dash | R Reset',16,55);
}
let last=performance.now();function loop(now){const dt=Math.min((now-last)/1000,.033);last=now;if(hitstop>0)hitstop=Math.max(0,hitstop-dt);else update(dt);render();requestAnimationFrame(loop);}requestAnimationFrame(loop);
