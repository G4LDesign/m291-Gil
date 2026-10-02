import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const mode=document.body.dataset.concept;
const container=document.querySelector('.stage');
const status=document.querySelector('.load-state');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let renderer,model,scene,camera;
const bg={redline:0x111113,alpine:0xe8edef,lab:0xf2f3f4}[mode];
try{
renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(container.clientWidth,container.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
container.appendChild(renderer.domElement);
scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,container.clientWidth/container.clientHeight,.01,100);
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xffffff,0x394457,1.1));const light=new THREE.DirectionalLight(0xffffff,2.2);light.position.set(3,5,4);scene.add(light);const rim=new THREE.DirectionalLight(mode==='redline'?0xff7777:0xffffff,1.5);rim.position.set(-3,2,-4);scene.add(rim);
const binary=atob(window.CBR_MODEL);window.CBR_MODEL=null;const buf=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)buf[i]=binary.charCodeAt(i);
new GLTFLoader().parse(buf.buffer,'',g=>{
const raw=g.scene;let box=new THREE.Box3().setFromObject(raw),size=box.getSize(new THREE.Vector3());
if(size.z>size.x)raw.rotation.y+=Math.PI/2;
box.setFromObject(raw);size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());raw.position.sub(center);const holder=new THREE.Group();holder.add(raw);holder.scale.setScalar(2.8/Math.max(size.x,size.y,size.z));model=holder;scene.add(model);
raw.traverse(n=>{if(n.isMesh){const mats=Array.isArray(n.material)?n.material:[n.material];mats.forEach(m=>{const name=m.name.toLowerCase();
if(name==='material.006'){m.map=null;m.color.set('#c41424');m.metalness=.28;m.roughness=.27;}else if(name.includes('[primary]')){m.color.set('#2a2c30');m.metalness=.6;m.roughness=.35;}
else if(name==='redhonda1'||name.startsWith('cb650fait2')){m.color.set('#c01727');m.metalness=.18;m.roughness=.32;}
else if(name.includes('tire')||name.includes('sidewall')){m.color.set('#101114');m.metalness=0;m.roughness=.92;}
else if(name.includes('bakablack')||name.includes('handc')||name==='sock1'||name==='abs1'||name==='plsru2'){m.color.set('#202126');m.metalness=.15;m.roughness=.55;}
else if(name.includes('[wheel]')){m.color.set('#25272b');m.metalness=.75;m.roughness=.3;}
else if(['cm1','eng11','in_d','2ex','ex1','ru0007','r1','shok2','vehicle_generic_smallspecmap','vehicle_generic_smallspecmap.001'].includes(name)){m.color.set('#5d6065');m.metalness=.7;m.roughness=.4;}
else if(name==='windows1'){m.color.set('#717780');m.transparent=true;m.opacity=.28;m.roughness=.15;}
if(m.transparent && m.opacity===0)m.opacity=.4;});}});
status.hidden=true;document.body.classList.add('ready');resize();requestAnimationFrame(tick);
},e=>{status.textContent='Le modèle n’a pas pu être chargé. Recharge cette page.';console.error(e)});
}catch(e){status.textContent='La 3D nécessite un navigateur avec WebGL activé.';console.error(e)}
const states={
redline:[{yaw:.75,pitch:.12,d:5.9,tx:-.55,ty:.05},{yaw:1.5,pitch:.08,d:4.7,tx:.1,ty:.0},{yaw:2.6,pitch:.2,d:2.9,tx:.65,ty:.22},{yaw:4.0,pitch:.12,d:3.4,tx:-.6,ty:-.12},{yaw:6.6,pitch:.16,d:5.7,tx:0,ty:0}],
alpine:[{yaw:-.7,pitch:.16,d:6.4,tx:0,ty:.18},{yaw:.2,pitch:.1,d:4.8,tx:-.5,ty:0},{yaw:1.8,pitch:.4,d:2.8,tx:.35,ty:.25},{yaw:3.0,pitch:.05,d:3.5,tx:-.5,ty:-.15},{yaw:5.5,pitch:.15,d:6.3,tx:0,ty:0}],
lab:[{yaw:.65,pitch:.14,d:5.7,tx:0,ty:0},{yaw:1.5,pitch:.04,d:3.4,tx:.65,ty:.22},{yaw:2.4,pitch:.65,d:2.7,tx:.2,ty:.38},{yaw:3.7,pitch:.08,d:2.9,tx:-.25,ty:-.15},{yaw:6.3,pitch:.16,d:5.7,tx:0,ty:0}]};
let progress=0,current=0,needs=true;
function update(){progress=Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));document.querySelector('.progress-fill').style.height=progress*100+'%';document.querySelectorAll('.chapter-nav a').forEach((a,i)=>{a.classList.toggle('active',Math.round(progress*4)===i)});needs=true;}
function resize(){if(!renderer)return;const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();needs=true;}
addEventListener('scroll',update,{passive:true});addEventListener('resize',resize);update();
function tick(){requestAnimationFrame(tick);if(!model)return;current=reduce?progress:current+(progress-current)*.075;if(!needs&&Math.abs(current-progress)<.0001)return;const t=(reduce?0:current)*4,idx=Math.min(3,Math.floor(t)),f=t-idx,s=states[mode],mix=k=>THREE.MathUtils.lerp(s[idx][k],s[idx+1][k],f);model.rotation.y=mix('yaw');let d=mix('d');if(innerWidth<700)d*=1.35;camera.position.set(0,Math.sin(mix('pitch'))*d,Math.cos(mix('pitch'))*d);camera.lookAt(mix('tx'),mix('ty'),0);renderer.render(scene,camera);needs=false;}
const toggle=document.querySelector('.menu-toggle');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));document.querySelector('.top-links').classList.toggle('open',open)});
document.querySelectorAll('.top-links a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');document.querySelector('.top-links').classList.remove('open')}));
