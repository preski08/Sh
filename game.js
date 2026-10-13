(() => {
'use strict';
const root=document.getElementById('game');
const loading=document.getElementById('loading');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x8ed7f2); scene.fog=new THREE.Fog(0x8ed7f2,24,65);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=false; renderer.outputColorSpace=THREE.SRGBColorSpace; root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd9f4ff,0x66814d,2.0));
const sun=new THREE.DirectionalLight(0xfff1cf,2.0); sun.position.set(-10,20,8); scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness,flatShading:true});
const materials={grass:mat(0x5ea84e),dirt:mat(0x8a5a38),stone:mat(0x87949a),wood:mat(0x9c6338),leaf:mat(0x2e8047),sand:mat(0xd9c17b),crystal:mat(0x51f1e5,.3),water:mat(0x3198d1,.4),skin:mat(0xffc28a),shirt:mat(0x2865c7),pants:mat(0x303b52),dark:mat(0x18212c),gold:mat(0xffc83d)};
const geo=new THREE.BoxGeometry(1,1,1);
const world=new Map(), obstacles=[], pickups=[]; let blocks=12,gems=0,hp=100;
const key=(x,y,z)=>`${x},${y},${z}`;
function addBlock(x,y,z,type='grass',save=true){const k=key(x,y,z);if(world.has(k))return;const mesh=new THREE.Mesh(geo,materials[type]||materials.grass);mesh.position.set(x,y,z);mesh.userData={x,y,z,type};scene.add(mesh);world.set(k,mesh);if(y>=0)obstacles.push(mesh);if(save){} }
function removeBlock(x,y,z){const k=key(x,y,z),m=world.get(k);if(!m)return false;scene.remove(m);world.delete(k);const i=obstacles.indexOf(m);if(i>=0)obstacles.splice(i,1);return true}
function groundHeight(x,z){return 0}
function makeTree(x,z){addBlock(x,1,z,'wood');addBlock(x,2,z,'wood');for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(let y=2;y<=4;y++){if(Math.abs(dx)+Math.abs(dz)<3)addBlock(x+dx,y,z+dz,'leaf')} }
function createWorld(){
 for(let x=-18;x<=18;x++)for(let z=-18;z<=18;z++){let d=Math.sqrt(x*x+z*z);let type=(Math.sin(x*.55)+Math.cos(z*.48)>.6)?'grass':'grass';addBlock(x,-1,z,type);if(d>8&&Math.random()<.13) addBlock(x,0,z,'stone');}
 for(let i=0;i<32;i++){let x=Math.round((Math.random()-.5)*32),z=Math.round((Math.random()-.5)*32);if(Math.hypot(x,z)>5)makeTree(x,z)}
 // Small river and sand banks
 for(let z=-17;z<=17;z++)for(let x=-2;x<=1;x++){removeBlock(x,-1,z);addBlock(x,-1,z,'water');}
 for(let i=0;i<14;i++){let x=Math.round((Math.random()-.5)*25),z=Math.round((Math.random()-.5)*25);if(Math.hypot(x,z)>5){let c=new THREE.Mesh(new THREE.OctahedronGeometry(.38,0),materials.crystal);c.position.set(x,.5,z);c.userData.pickup=true;scene.add(c);pickups.push(c)}}
 // distant blocky hills
 for(let i=0;i<18;i++){let x=Math.round((Math.random()-.5)*52),z=Math.round((Math.random()-.5)*52);if(Math.hypot(x,z)>22){for(let y=0;y<2+Math.random()*4;y++)addBlock(x,y,z,'stone')}}
}
createWorld();
// Player made from simple blocky parts
const player=new THREE.Group();scene.add(player);
function part(w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);player.add(m);return m}
part(.65,.8,.38,materials.shirt,0,1.25,0);
part(.5,.5,.5,materials.skin,0,1.92,0);
part(.16,.13,.08,materials.dark,-.12,1.98,.255);part(.16,.13,.08,materials.dark,.12,1.98,.255);
const leftLeg=part(.23,.55,.27,materials.pants,-.17,.57,0),rightLeg=part(.23,.55,.27,materials.pants,.17,.57,0);
const leftArm=part(.2,.62,.24,materials.skin,-.45,1.28,0),rightArm=part(.2,.62,.24,materials.skin,.45,1.28,0);
player.position.set(0,0,5);
let yaw=0,pitch=.28,velY=0,onGround=true,moveX=0,moveY=0,joyActive=false,joyCenter=null,lookActive=false,lastLook=null,paused=false,attackCooldown=0;
const raycaster=new THREE.Raycaster();
function showMessage(t){const e=document.getElementById('message');e.textContent=t;e.classList.add('show');clearTimeout(showMessage.timer);showMessage.timer=setTimeout(()=>e.classList.remove('show'),1600)}
function updateHUD(){document.getElementById('hp').textContent=hp;document.getElementById('blocks').textContent=blocks;document.getElementById('gems').textContent=gems}
function saveGame(){const data={player:[player.position.x,player.position.y,player.position.z],yaw,pitch,blocks,gems,hp,removed:[...Array.from({length:0})],placed:[]};localStorage.setItem('pixelAdventureSave',JSON.stringify(data));showMessage('Progres tersimpan!')}
function loadGame(){try{const d=JSON.parse(localStorage.getItem('pixelAdventureSave')||'null');if(d){player.position.set(...d.player);yaw=d.yaw||0;pitch=d.pitch||.28;blocks=d.blocks??12;gems=d.gems??0;hp=d.hp??100;updateHUD();}}catch(e){}}
loadGame();
function cameraUpdate(){const target=new THREE.Vector3(player.position.x,player.position.y+1.35,player.position.z);const dist=5.5;const horiz=Math.cos(pitch)*dist;camera.position.set(target.x+Math.sin(yaw)*horiz,target.y+Math.sin(pitch)*dist+1.0,target.z+Math.cos(yaw)*horiz);camera.lookAt(target)}
function collides(x,z){for(const m of obstacles){const p=m.position;if(Math.abs(p.x-x)<.75&&Math.abs(p.z-z)<.75&&p.y>=0&&p.y<2.1)return true}return false}
function movePlayer(dt){let mx=moveX,my=moveY;const len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len}const speed=4.6;const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw),rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);const dx=(rightX*mx+forwardX*(-my))*speed*dt,dz=(rightZ*mx+forwardZ*(-my))*speed*dt;const nx=player.position.x+dx,nz=player.position.z+dz;if(!collides(nx,player.position.z))player.position.x=nx;if(!collides(player.position.x,nz))player.position.z=nz;player.rotation.y=yaw;velY-=15*dt;player.position.y+=velY*dt;if(player.position.y<=0){player.position.y=0;velY=0;onGround=true}leftLeg.rotation.x=Math.sin(performance.now()*.012)*Math.min(1,len)*.6;rightLeg.rotation.x=-leftLeg.rotation.x;leftArm.rotation.x=-leftLeg.rotation.x*.6;rightArm.rotation.x=-rightLeg.rotation.x*.6;
 for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.rotation.y+=dt*1.5;p.position.y=.55+Math.sin(performance.now()*.003+i)*.12;if(p.position.distanceTo(new THREE.Vector3(player.position.x,player.position.y+1,player.position.z))<1.15){scene.remove(p);pickups.splice(i,1);gems++;blocks+=1;updateHUD();showMessage('Kristal ditemukan! +1 blok');saveQuiet()}}
}
function saveQuiet(){localStorage.setItem('pixelAdventureSave',JSON.stringify({player:[player.position.x,player.position.y,player.position.z],yaw,pitch,blocks,gems,hp}))}
function targetBlock(){raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const list=[...world.values()];return raycaster.intersectObjects(list,false)[0]||null}
function mineBlock(){const hit=targetBlock();if(!hit){showMessage('Arahkan bidikan ke blok');return}const m=hit.object;if(m.position.y<0){showMessage('Tanah dasar tidak bisa diambil');return}removeBlock(m.position.x,m.position.y,m.position.z);blocks++;updateHUD();showMessage('Blok diambil +1');saveQuiet()}
function buildBlock(){if(blocks<=0){showMessage('Blok habis! Cari kristal');return}const hit=targetBlock();if(!hit){showMessage('Bidik permukaan untuk membangun');return}const n=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);const p=hit.object.position.clone().add(n);const x=Math.round(p.x),y=Math.round(p.y),z=Math.round(p.z);if(y<0||y>9||Math.hypot(x-player.position.x,z-player.position.z)<1.5||world.has(key(x,y,z))){showMessage('Tidak bisa memasang di sini');return}addBlock(x,y,z,'grass');blocks--;updateHUD();saveQuiet()}
function jump(){if(onGround){velY=7.2;onGround=false}}
function attack(){if(attackCooldown>0)return;attackCooldown=.45;let found=false;for(let i=0;i<pickups.length;i++){if(pickups[i].position.distanceTo(player.position)<2.5){scene.remove(pickups[i]);pickups.splice(i,1);gems++;found=true;break}}if(found){updateHUD();showMessage('Kristal didapat!')}else showMessage('Tebasan! Tidak ada target dekat')}
const joy=document.getElementById('joystick'),knob=document.getElementById('joy-knob');
function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,lim=39,l=Math.hypot(dx,dy);if(l>lim){dx=dx/l*lim;dy=dy/l*lim}knob.style.transform=`translate(${dx}px,${dy}px)`;moveX=dx/lim;moveY=dy/lim}
joy.addEventListener('pointerdown',e=>{joyActive=true;joy.setPointerCapture(e.pointerId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(joyActive)joyMove(e)});function joyEnd(){joyActive=false;moveX=moveY=0;knob.style.transform='translate(0,0)'}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
const look=document.getElementById('lookzone');look.addEventListener('pointerdown',e=>{lookActive=true;lastLook={x:e.clientX,y:e.clientY};look.setPointerCapture(e.pointerId)});look.addEventListener('pointermove',e=>{if(!lookActive||!lastLook)return;const dx=e.clientX-lastLook.x,dy=e.clientY-lastLook.y;yaw-=dx*.008;pitch=Math.max(-.15,Math.min(.75,pitch+dy*.005));lastLook={x:e.clientX,y:e.clientY}});function lookEnd(){lookActive=false;lastLook=null}look.addEventListener('pointerup',lookEnd);look.addEventListener('pointercancel',lookEnd);
document.getElementById('jump').addEventListener('pointerdown',e=>{e.preventDefault();jump()});document.getElementById('mine').addEventListener('pointerdown',e=>{e.preventDefault();mineBlock()});document.getElementById('build').addEventListener('pointerdown',e=>{e.preventDefault();buildBlock()});document.getElementById('attack').addEventListener('pointerdown',e=>{e.preventDefault();attack()});
document.getElementById('pause').onclick=()=>{paused=true;document.getElementById('pausemenu').classList.remove('hidden')};document.getElementById('resume').onclick=()=>{paused=false;document.getElementById('pausemenu').classList.add('hidden')};document.getElementById('save').onclick=saveGame;document.getElementById('reset').onclick=()=>{if(confirm('Hapus progres dan mulai dunia baru?')){localStorage.removeItem('pixelAdventureSave');location.reload()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveQuiet()});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}
let last=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.04);last=now;if(!paused){movePlayer(dt);cameraUpdate();if(attackCooldown>0)attackCooldown-=dt;renderer.render(scene,camera)}}requestAnimationFrame(loop);
loading.style.display='none';
})();