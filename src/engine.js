export const STAGES=[
 {name:'Tiểu hành tinh',min:0,max:100,color:'#c1b5a8'},
 {name:'Hành tinh',min:100,max:420,color:'#68b9db'},
 {name:'Ngôi sao',min:420,max:1300,color:'#ffd08a'},
 {name:'Sao neutron',min:1300,max:2600,color:'#b1e3ff'},
 {name:'Hố đen',min:2600,max:5000,color:'#d5a6ff'}
];
export const stageFor=m=>m>=2600?4:m>=1300?3:m>=420?2:m>=100?1:0;
export const radiusFor=m=>Math.min(78,5+Math.sqrt(m)*1.23);
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function createState(){return {version:1,player:{x:0,y:0,vx:0,vy:0,mass:24},orbits:[],bodies:[],absorbed:0,life:0,cycles:0,time:0,quest:0,invulnerable:0};}
export function validateSave(s){
 if(!s||s.version!==1||!s.player||!Array.isArray(s.orbits)||s.orbits.length>12)throw Error('Save không đúng định dạng.');
 for(const k of ['x','y','vx','vy','mass'])if(!Number.isFinite(s.player[k])||Math.abs(s.player[k])>1e9)throw Error('Dữ liệu thiên thể không hợp lệ.');
 if(s.player.mass<1||s.player.mass>=5000)throw Error('Khối lượng không hợp lệ.');
 for(const o of s.orbits)if(!o||!['mass','angle','radius','speed'].every(k=>Number.isFinite(o[k]))||o.mass<=0||o.mass>=s.player.mass||o.radius<1||o.radius>2000||Math.abs(o.speed)>20)throw Error('Quỹ đạo không hợp lệ.');
 for(const k of ['absorbed','life','cycles','time','quest'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1e9)throw Error('Thống kê không hợp lệ.');
 if(!Number.isInteger(s.quest)||s.quest>5)throw Error('Nhiệm vụ không hợp lệ.');
 return {...createState(),player:{...s.player},orbits:s.orbits.map(o=>({...o})),absorbed:s.absorbed,life:Math.min(100,s.life),cycles:s.cycles,time:s.time,quest:s.quest};
}
export function saveData(s){return {version:1,player:s.player,orbits:s.orbits,absorbed:s.absorbed,life:s.life,cycles:s.cycles,time:s.time,quest:s.quest};}
export function spawnBody(s,random=Math.random,near=false){
 const p=s.player,stage=stageFor(p.mass),a=random()*Math.PI*2,d=near?150+random()*700:900+random()*1000;
 let mass;
 const r=random();
 if(stage<2) mass=r<.86?3+random()*17:r<.96?110+random()*160:450+random()*300;
 else if(stage===2)mass=r<.45?8+random()*20:r<.91?100+random()*200:600+random()*1100;
 else mass=r<.2?20+random()*40:r<.72?120+random()*220:450+random()*1300;
 return {x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,vx:(random()-.5)*16,vy:(random()-.5)*16,mass,seed:random()*100,spin:random()*6.28};
}
export function populate(s){while(s.bodies.length<135)s.bodies.push(spawnBody(s,Math.random,true));}
export function absorb(s){
 if(!s.orbits.length)return [];
 const old=stageFor(s.player.mass),taken=old<2?s.orbits.splice(0):s.orbits.splice(0,1);
 let gain=0;for(const b of taken)gain+=b.mass;
 s.player.mass+=gain;s.absorbed+=taken.length;
 const events=[{type:'absorb',count:taken.length,gain}];
 evolve(s,old,events);return events;
}
function evolve(s,old,events){
 if(s.player.mass>=5000){s.cycles++;s.player.mass=24;s.orbits=[];s.bodies=[];s.life=0;populate(s);events.push({type:'bigbang'});}
 else if(stageFor(s.player.mass)!==old)events.push({type:'evolve',stage:stageFor(s.player.mass)});
}
export function step(s,dt,input={x:0,y:0}){
 dt=Math.max(0,Math.min(dt,.05));s.time+=dt;s.invulnerable=Math.max(0,s.invulnerable-dt);
 const p=s.player,stage=stageFor(p.mass),events=[];
 const len=Math.max(1,Math.hypot(input.x,input.y)),accel=stage===4?100:200;
 p.vx=(p.vx+input.x/len*accel*dt)*Math.exp(-1.1*dt);p.vy=(p.vy+input.y/len*accel*dt)*Math.exp(-1.1*dt);
 p.x+=p.vx*dt;p.y+=p.vy*dt;
 if(stage===1||s.orbits.some(o=>o.mass>=100&&o.mass<420))s.life=Math.min(100,s.life+dt*.65);else s.life=Math.max(0,s.life-dt*3);
 for(const o of s.orbits)o.angle+=dt*o.speed;
 for(let i=s.bodies.length-1;i>=0;i--){
  const b=s.bodies[i];let d=distance(p,b);const pr=radiusFor(p.mass),br=radiusFor(b.mass);
  if(d>2500){s.bodies.splice(i,1);continue;}
  if(b.mass<p.mass*.8&&d<pr+br+170){
   const force=Math.min(75,p.mass*.9/Math.max(20,d));b.vx+=(p.x-b.x)/Math.max(d,1)*force*dt;b.vy+=(p.y-b.y)/Math.max(d,1)*force*dt;
   if(stage===4&&d<pr+br+30){p.mass+=b.mass;s.absorbed++;s.bodies.splice(i,1);evolve(s,stage,events);if(events.some(e=>e.type==='bigbang'))break;continue;}
   const allowed=stage===0?b.mass<p.mass*.8:stage===1?b.mass<80:stage===2?b.mass<420:b.mass<1300;
   if(allowed&&d<pr+br+65&&s.orbits.length<12){
    const radius=pr+br+28+s.orbits.length*15;
    s.orbits.push({mass:b.mass,angle:Math.atan2(b.y-p.y,b.x-p.x),radius,speed:Math.sqrt(p.mass/radius)*.35});
    s.bodies.splice(i,1);events.push({type:'capture'});continue;
   }
  }
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.spin+=dt*.05;
  d=distance(p,b);
  if(d<pr+br&&b.mass>p.mass*.85&&s.invulnerable<=0){
   const hit=Math.min(p.mass*.25,b.mass*.12);p.mass=Math.max(8,p.mass-hit);s.invulnerable=2;
   const a=Math.atan2(p.y-b.y,p.x-b.x);p.x=b.x+Math.cos(a)*(pr+br+8);p.y=b.y+Math.sin(a)*(pr+br+8);p.vx=Math.cos(a)*170;p.vy=Math.sin(a)*170;
   s.orbits=s.orbits.filter(o=>o.mass<p.mass*.8);events.push({type:'impact',loss:hit});
  }
 }
 while(s.bodies.length<135)s.bodies.push(spawnBody(s));return events;
}
export const QUESTS=[
 {title:'Gom những mảnh bụi đầu tiên',desc:'Hấp thụ 8 thiên thể',goal:8,value:s=>s.absorbed},
 {title:'Một thế giới được sinh ra',desc:'Đạt khối lượng 100',goal:100,value:s=>s.player.mass},
 {title:'Thắp sáng vũ trụ',desc:'Đạt khối lượng 420',goal:420,value:s=>s.player.mass},
 {title:'Vượt qua giới hạn ngôi sao',desc:'Đạt khối lượng 1.300',goal:1300,value:s=>s.player.mass},
 {title:'Chạm tới chân trời sự kiện',desc:'Đạt khối lượng 2.600',goal:2600,value:s=>s.player.mass},
 {title:'Kết thúc cũng là khởi đầu',desc:'Hố đen đạt 5.000 → Big Bang',goal:1,value:s=>s.cycles}
];
