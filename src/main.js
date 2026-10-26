import {STAGES,QUESTS,stageFor,radiusFor,createState,populate,step,absorb,saveData,validateSave} from './engine.js';
const $=id=>document.getElementById(id),canvas=$('space'),ctx=canvas.getContext('2d'),panel=$('panel');
const KEY='solar-web-reconstruction-v1';let state=createState(),loaded=false;
try{const data=localStorage.getItem(KEY);if(data){state=validateSave(JSON.parse(data));loaded=true;}}catch{}
populate(state);
let w=innerWidth,h=innerHeight,dpr=1,zoom=.9,targetZoom=.9,paused=true,sound=false,toastTimer,saveTimer=0,uiTimer=0,t=0,flash=0;
let drag=null,keys=new Set(),effects=[];
const music=new Audio('./audio/music.ogg');music.loop=true;music.volume=.25;
function sfx(name){if(sound){const a=new Audio(`./audio/${name}.wav`);a.volume=.35;a.play().catch(()=>{});}}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3400);}
function save(quiet=false){try{localStorage.setItem(KEY,JSON.stringify(saveData(state)));if(!quiet)toast('Đã lưu tiến trình trên thiết bị.');return true;}catch{if(!quiet)toast('Không lưu được trên thiết bị. Hãy dùng Xuất save.');return false;}}
function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
addEventListener('resize',resize);resize();
function pause(value){paused=value;$('pause').textContent=value?'Tiếp tục':'Tạm dừng';keys.clear();drag=null;$('stick').style.display='none';if(paused)music.pause();else if(sound)music.play().catch(()=>{});}
$('pause').onclick=()=>{if(!panel.open)pause(!paused);};
$('menu').onclick=()=>{pause(true);$('play').textContent='Tiếp tục khám phá →';panel.showModal();};
panel.addEventListener('close',()=>pause(false));
$('play').onclick=()=>panel.close();
$('save').onclick=()=>save();
$('restart').onclick=()=>{if(confirm('Bắt đầu lại và thay thế tiến trình hiện tại?')){state=createState();populate(state);effects=[];save(true);panel.close();toast('Một vũ trụ mới đang chờ bạn.');}};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent='Âm thanh: '+(sound?'bật':'tắt');if(sound&&!paused)music.play().catch(()=>toast('Chưa phát được nhạc.'));else music.pause();};
$('zoomIn').onclick=()=>targetZoom=Math.min(1.6,targetZoom*1.2);$('zoomOut').onclick=()=>targetZoom=Math.max(.35,targetZoom/1.2);
canvas.addEventListener('wheel',e=>{e.preventDefault();targetZoom=Math.max(.35,Math.min(1.6,targetZoom*Math.exp(-e.deltaY*.001)));},{passive:false});
function absorbAction(){if(!paused){const events=absorb(state);if(!events.length)toast('Đến gần vật thể nhỏ hơn để bắt vào quỹ đạo.');handle(events);}}
$('absorb').onclick=absorbAction;
$('export').onclick=()=>{const blob=new Blob([JSON.stringify(saveData(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='solar-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onclick=()=>$('savefile').click();
$('savefile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>100000)throw Error('Save quá lớn.');const next=validateSave(JSON.parse(await f.text()));populate(next);state=next;save(true);panel.close();toast('Đã nhập tiến trình.');}catch(err){toast(err.message||'Không đọc được save.');}e.target.value='';};
canvas.addEventListener('pointerdown',e=>{if(paused)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};canvas.setPointerCapture(e.pointerId);$('stick').style.display='block';$('stick').style.left=e.clientX+'px';$('stick').style.top=e.clientY+'px';});
canvas.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId){drag.dx=e.clientX-drag.x;drag.dy=e.clientY-drag.y;const l=Math.max(1,Math.hypot(drag.dx,drag.dy)/40);$('stick').firstElementChild.style.transform=`translate(${drag.dx/l}px,${drag.dy/l}px)`;}});
function release(){drag=null;$('stick').style.display='none';}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
addEventListener('keydown',e=>{if(panel.open)return;const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys.add(k);if(k===' '&&!e.repeat)absorbAction();if(k==='p'||k==='escape')pause(!paused);});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{save(true);pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){save(true);pause(true);}});addEventListener('pagehide',()=>save(true));
function handle(events){for(const e of events){
 if(e.type==='capture'){effects.push({x:state.player.x,y:state.player.y,age:0,color:'#80d9d4',r:radiusFor(state.player.mass)+60});}
 if(e.type==='absorb'){sfx('absorb');toast(`Hấp thụ +${Math.round(e.gain)} khối lượng`);}
 if(e.type==='evolve'){sfx('evolve');flash=.6;toast(`Tiến hóa: ${STAGES[e.stage].name}`);targetZoom=Math.max(.4,targetZoom*.88);}
 if(e.type==='impact'){sfx('impact');toast(`Va chạm! Mất ${Math.round(e.loss)} khối lượng.`);}
 if(e.type==='bigbang'){flash=1.5;sfx('evolve');toast('BIG BANG — Một vũ trụ mới ra đời!');save(true);}
}}
const stars=Array.from({length:500},()=>({x:Math.random()*3000,y:Math.random()*2400,r:Math.random()<.04?1.5:.35+Math.random()*.7,a:.2+Math.random()*.65}));
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function body(x,y,m,seed=1,spin=0,player=false){
 const r=radiusFor(m)*zoom,st=stageFor(m),color=STAGES[st].color;
 if(st>=2){const glow=ctx.createRadialGradient(x,y,r*.5,x,y,r*3);glow.addColorStop(0,st===4?'#d0a4ff55':st===3?'#9bcfff55':'#ffbb6b55');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(x-r*3,y-r*3,r*6,r*6);}
 if(st===4){ctx.save();ctx.translate(x,y);ctx.rotate(-.35);ctx.strokeStyle='#e7bcff';ctx.lineWidth=3*zoom;ctx.beginPath();ctx.ellipse(0,0,r*1.65,r*.4,0,0,Math.PI*2);ctx.stroke();circle(0,0,r,'#02020c');ctx.strokeStyle='#e9d8ff';ctx.lineWidth=1.7*zoom;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.restore();}
 else{
  const g=ctx.createRadialGradient(x-r*.38,y-r*.4,r*.06,x+r*.22,y+r*.22,r*1.15);
  g.addColorStop(0,st===0?'#ded3bd':st===1?'#97e5e3':st===2?'#fff9d3':'#ffffff');g.addColorStop(.5,color);g.addColorStop(1,st===0?'#3b383c':st===1?'#0e284b':st===2?'#e37b44':'#3b78b9');circle(x,y,r,g);
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
  if(st===0){for(let i=0;i<6;i++){const a=i*2.4+seed;circle(x+Math.cos(a)*r*.62,y+Math.sin(a*1.3)*r*.55,r*(.1+(i%3)*.05),'#35303c50');}}
  if(st===1){ctx.fillStyle='#3e896cbb';for(let i=0;i<5;i++){const a=i*1.7+seed+spin;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*r*.65,y+Math.sin(a*1.4)*r*.65,r*.37,r*.18,a,0,6.29);ctx.fill();}ctx.strokeStyle='#eaffff66';ctx.lineWidth=r*.12;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x-r*.3,y+(i-1)*r*.55,r*1.1,r*.14,-.2,0,3);ctx.stroke();}}
  ctx.restore();
  if(st===3){ctx.save();ctx.translate(x,y);ctx.rotate(t*.4);ctx.fillStyle='#a5cfff35';ctx.beginPath();ctx.moveTo(-r*.15,0);ctx.lineTo(0,-r*4);ctx.lineTo(r*.15,0);ctx.lineTo(0,r*4);ctx.fill();ctx.restore();}
 }
 if(player){ctx.strokeStyle='#b5eee677';ctx.lineWidth=1;ctx.setLineDash([2,6]);ctx.beginPath();ctx.arc(x,y,r+10,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
}
function render(dt){
 t+=dt;zoom+=(targetZoom-zoom)*Math.min(1,dt*4);const cx=w*.52,cy=h*.52,p=state.player;
 ctx.fillStyle='#070b16';ctx.fillRect(0,0,w,h);
 const n=ctx.createRadialGradient(w*.65,h*.4,0,w*.65,h*.4,w*.7);n.addColorStop(0,'#17324755');n.addColorStop(.5,'#231b3d33');n.addColorStop(1,'transparent');ctx.fillStyle=n;ctx.fillRect(0,0,w,h);
 for(const star of stars){const sx=((star.x-p.x*.05)%(w+30)+(w+30))%(w+30)-15,sy=((star.y-p.y*.05)%(h+30)+(h+30))%(h+30)-15;ctx.globalAlpha=star.a;circle(sx,sy,star.r,'#c6daff');}ctx.globalAlpha=1;
 for(const b of state.bodies){const x=cx+(b.x-p.x)*zoom,y=cy+(b.y-p.y)*zoom,r=radiusFor(b.mass)*zoom;if(x>-r*3&&x<w+r*3&&y>-r*3&&y<h+r*3)body(x,y,b.mass,b.seed,b.spin);}
 for(const o of state.orbits){const r=o.radius*zoom;ctx.strokeStyle='#94bcd21c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();body(cx+Math.cos(o.angle)*r,cy+Math.sin(o.angle)*r,o.mass,o.radius,t*.04);}
 if(state.invulnerable<=0||Math.floor(t*10)%2)body(cx,cy,p.mass,4,t*.04,true);
 ctx.textAlign='center';ctx.fillStyle='#a5d6d0';ctx.font='9px Arial';ctx.fillText('BẠN',cx,cy-radiusFor(p.mass)*zoom-20);
 if(state.life>10){const count=Math.floor(state.life/12);for(let i=0;i<count;i++){const a=t*.25+i*6.28/count,r=(radiusFor(p.mass)+18)*zoom;circle(cx+Math.cos(a)*r,cy+Math.sin(a)*r,1.5,'#9fffda');}}
 for(const e of effects){e.age+=dt;ctx.globalAlpha=Math.max(0,1-e.age);ctx.strokeStyle=e.color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx+(e.x-p.x)*zoom,cy+(e.y-p.y)*zoom,(e.r+e.age*55)*zoom,0,6.29);ctx.stroke();}ctx.globalAlpha=1;effects=effects.filter(e=>e.age<1);
 // A small radar shows nearby bodies beyond the visible play area.
 if(w>700){const rx=w-88,ry=150,rr=48;circle(rx,ry,rr,'#0a152bcc');ctx.strokeStyle='#38536966';ctx.beginPath();ctx.arc(rx,ry,rr,0,6.29);ctx.stroke();for(const b of state.bodies){const dx=(b.x-p.x)/35,dy=(b.y-p.y)/35;if(Math.hypot(dx,dy)<rr)circle(rx+dx,ry+dy,b.mass>p.mass?1.5:1,b.mass>p.mass?'#c78d79':'#8edacb');}circle(rx,ry,2,'#fff');}
 if(flash>0){ctx.fillStyle=`rgba(209,238,255,${Math.min(.85,flash)})`;ctx.fillRect(0,0,w,h);flash=Math.max(0,flash-dt);}
 if(paused&&!panel.open){ctx.fillStyle='#050b1844';ctx.fillRect(0,0,w,h);ctx.textAlign='center';ctx.fillStyle='#e6f1ff';ctx.font='16px Arial';ctx.fillText('ĐÃ TẠM DỪNG',cx,cy+radiusFor(p.mass)*zoom+60);}
}
function ui(){const p=state.player,st=STAGES[stageFor(p.mass)];$('stage').textContent=st.name;$('mass').textContent=Math.floor(p.mass).toLocaleString('vi-VN');$('progress').style.width=Math.max(0,Math.min(100,(p.mass-st.min)/(st.max-st.min)*100))+'%';$('next').textContent=`${Math.round(st.max-p.mass)} khối lượng đến ${stageFor(p.mass)===4?'Big Bang':STAGES[stageFor(p.mass)+1].name}`;$('orbits').textContent=`◌ ${state.orbits.length} quỹ đạo`;$('life').textContent=`✧ Sự sống ${Math.floor(state.life)}%`;
 let q=QUESTS[state.quest];if(q.value(state)>=q.goal&&state.quest<QUESTS.length-1){state.quest++;toast('Đã hoàn thành: '+q.title);q=QUESTS[state.quest];}
 $('quest').textContent=q.title;$('questProgress').textContent=q.desc+' · '+Math.floor(Math.min(q.value(state),q.goal))+'/'+q.goal;
}
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!paused){let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),y=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);if(drag){x=drag.dx/40;y=drag.dy/40;}handle(step(state,dt,{x,y}));saveTimer+=dt;if(saveTimer>10){save(true);saveTimer=0;}}render(dt);uiTimer+=dt;if(uiTimer>.15){ui();uiTimer=0;}requestAnimationFrame(frame);}
ui();if(loaded)$('play').textContent='Tiếp tục hành trình →';panel.showModal();requestAnimationFrame(frame);
