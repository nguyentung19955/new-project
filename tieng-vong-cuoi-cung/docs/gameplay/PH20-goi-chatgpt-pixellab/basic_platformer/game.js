const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const GROUND = 440, FRAME_W = 128, FRAME_H = 128;
const animations = {
  idle:   {src:'assets/idle.png',   frames:6, fps:8, loop:true},
  run:    {src:'assets/run.png',    frames:8, fps:12,loop:true},
  jump:   {src:'assets/jump.png',   frames:4, fps:10,loop:false},
  fall:   {src:'assets/fall.png',   frames:2, fps:8, loop:true},
  attack: {src:'assets/attack.png', frames:8, fps:12,loop:false}
};
for (const a of Object.values(animations)) {
  a.image = new Image(); a.ready = false;
  a.image.onload = () => { a.ready = true; };
  a.image.onerror = () => { a.ready = false; };
  a.image.src = a.src;
}
const keys = new Set();
const player = {x:150,y:GROUND-100,w:52,h:100,vx:0,vy:0,grounded:true,facing:1,state:'idle',stateTime:0,hitboxActive:false};
const prevent = new Set(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
addEventListener('keydown',e=>{if(prevent.has(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat && (e.code==='KeyJ') && player.state!=='attack') setState('attack');});
addEventListener('keyup',e=>keys.delete(e.code));
function setState(next){if(player.state!==next){player.state=next;player.stateTime=0;}}
function update(dt){
  const left=keys.has('KeyA')||keys.has('ArrowLeft');
  const right=keys.has('KeyD')||keys.has('ArrowRight');
  const jump=keys.has('Space')||keys.has('KeyW')||keys.has('ArrowUp');
  const moving=(right?1:0)-(left?1:0);
  if(moving)player.facing=moving;
  const attacking=player.state==='attack';
  const attackDuration=animations.attack.frames/animations.attack.fps;
  const attackLocked=attacking && player.stateTime<attackDuration;
  player.vx=attackLocked?0:moving*240;
  if(jump&&player.grounded&&!attackLocked){player.vy=-560;player.grounded=false;}
  player.vy+=1500*dt;
  player.x=Math.max(0,Math.min(canvas.width-player.w,player.x+player.vx*dt));
  player.y+=player.vy*dt;
  if(player.y+player.h>=GROUND){player.y=GROUND-player.h;player.vy=0;player.grounded=true;}else player.grounded=false;
  player.stateTime+=dt;
  if(!attackLocked){
    if(!player.grounded)setState(player.vy<0?'jump':'fall');
    else setState(moving?'run':'idle');
  }
  player.hitboxActive=player.state==='attack'&&player.stateTime>=0.20&&player.stateTime<0.38;
}
function draw(){
  ctx.fillStyle='#242331';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#4c4757';ctx.fillRect(0,GROUND,canvas.width,canvas.height-GROUND);
  ctx.fillStyle='#8a7480';ctx.fillRect(0,GROUND,canvas.width,4);
  const a=animations[player.state];
  const frame=Math.min(a.frames-1,Math.floor(player.stateTime*a.fps)%(a.loop?a.frames:Infinity));
  const drawX=Math.round(player.x+player.w/2-FRAME_W/2);
  const drawY=Math.round(player.y+player.h-FRAME_H+12);
  if(a.ready&&a.image.naturalWidth>=FRAME_W*a.frames){
    ctx.save();
    if(player.facing===-1){ctx.translate(Math.round(player.x+player.w/2)*2,0);ctx.scale(-1,1);}
    ctx.drawImage(a.image,frame*FRAME_W,0,FRAME_W,FRAME_H,drawX,drawY,FRAME_W,FRAME_H);
    ctx.restore();
  } else {
    // Placeholder lets the demo run before you export any PixelLab sprites.
    ctx.fillStyle='#8e9bab';ctx.fillRect(Math.round(player.x+12),Math.round(player.y+20),28,58);
    ctx.fillStyle='#c2b8a8';ctx.fillRect(Math.round(player.x+16),Math.round(player.y),20,23);
    ctx.fillStyle='#6e7e92';ctx.fillRect(Math.round(player.x+8),Math.round(player.y+78),14,22);
    ctx.fillRect(Math.round(player.x+30),Math.round(player.y+78),14,22);
    ctx.fillStyle='#eee';ctx.font='12px monospace';ctx.fillText('Missing '+player.state+'.png',10,22);
  }
  if(player.hitboxActive){ctx.strokeStyle='#f2aa65';ctx.strokeRect(player.facing===1?player.x+player.w:player.x-70,player.y+25,70,45);}
  ctx.fillStyle='#eee';ctx.font='16px monospace';ctx.fillText('State: '+player.state+' | frame: '+frame,15,50);
}
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,0.033);last=now;update(dt);draw();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
