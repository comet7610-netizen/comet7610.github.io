'use strict';
/* ---------- core: renderer, scene, sky, sun, camera ---------- */
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9cc7ea);
const camera = new THREE.PerspectiveCamera(26, 1, 1, 600);
const raycaster = new THREE.Raycaster();

const hemi = new THREE.HemisphereLight(0xdfeeff, 0x8a8576, 0.8); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 1); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 24, bottom: -24, near: 1, far: 200 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const moon = new THREE.DirectionalLight(0x8ea6ff, 0); scene.add(moon);

/* materials */
const MAT = {
  wall: new THREE.MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.9 }),
  oak: new THREE.MeshStandardMaterial({ color: 0xd7b98e, roughness: 0.7 }),
  oakDark: new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.7 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xd2d0cb, roughness: 0.85 }),
  black: new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.5, metalness: 0.4 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xbfe0ee, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.22, depthWrite: false }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x4f8a50, roughness: 0.8 }),
  leaf2: new THREE.MeshStandardMaterial({ color: 0x6aa35e, roughness: 0.8 }),
  pot: new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.6 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0xb9b2a4, roughness: 1 }),
  fabric2: new THREE.MeshStandardMaterial({ color: 0x7e9a8a, roughness: 1 }),
  carpet: new THREE.MeshStandardMaterial({ color: 0xe4dccb, roughness: 1 }),
  carpet2: new THREE.MeshStandardMaterial({ color: 0xc9c6bf, roughness: 1 }),
  white: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x9a9da3, roughness: 0.4, metalness: 0.6 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x8fa58a, roughness: 1 }),
  paving: new THREE.MeshStandardMaterial({ color: 0xc9c6bd, roughness: 1 }),
};

function box(w, h, d, mat, x, y, z, parent, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true;
  (parent || scene).add(m); return m;
}
function cyl(rt, rb, h, mat, x, y, z, parent, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  (parent || scene).add(m); return m;
}
function sph(r, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
  m.position.set(x, y, z); m.castShadow = true; (parent || scene).add(m); return m;
}
function glassBox(w, h, d, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat);
  m.position.set(x, y, z); (parent || scene).add(m); return m;
}
const glassMat = MAT.glass;

/* sky dome, stars, clouds, city lights */
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(320, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: skyU,
  vertexShader: 'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform vec3 top;uniform vec3 hor;varying vec3 p;void main(){float h=clamp(normalize(p).y,0.,1.);gl_FragColor=vec4(mix(hor,top,pow(h,.55)),1.);}'
}));
scene.add(sky);
const starGeo = new THREE.BufferGeometry(); {
  const a = []; for (let i = 0; i < 700; i++) { const u = Math.random() * 6.283, v = Math.random() * 1.3 + 0.1; const r = 300;
    a.push(Math.cos(u) * Math.cos(v) * r, Math.sin(v) * r, Math.sin(u) * Math.cos(v) * r); }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
}
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
scene.add(stars);
const clouds = new THREE.Group(); scene.add(clouds);
const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, fog: false });
for (let i = 0; i < 9; i++) {
  const g = new THREE.Group(); const a = Math.random() * 6.283, r = 90 + Math.random() * 90;
  g.position.set(Math.cos(a) * r, 38 + Math.random() * 25, Math.sin(a) * r);
  for (let j = 0; j < 4; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(5 + Math.random() * 5, 10, 8), cloudMat); s.scale.set(1.6, 0.55, 1); s.position.set(j * 7 - 10, Math.random() * 2, Math.random() * 4); g.add(s); }
  g.userData.sp = 0.4 + Math.random() * 0.5; clouds.add(g);
}
const cityGeo = new THREE.BufferGeometry(); {
  const a = [], c = []; for (let i = 0; i < 420; i++) { const ang = Math.random() * 6.283, r = 44 + Math.random() * 90;
    a.push(Math.cos(ang) * r, 0.6 + Math.random() * 6, Math.sin(ang) * r);
    const w = Math.random(); c.push(1, 0.78 + w * 0.15, 0.45 + w * 0.3); }
  cityGeo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
  cityGeo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
}
const city = new THREE.Points(cityGeo, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false }));
scene.add(city);

/* ground */
const groundM = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), MAT.ground);
groundM.rotation.x = -Math.PI / 2; groundM.position.y = -0.5; groundM.receiveShadow = true; scene.add(groundM);
box(54, 0.2, 38, MAT.paving, -1.5, -0.35, 2);
box(38, 0.5, 16.6, MAT.oakDark, -1.5, -0.25, 6, null, false); box(33, 0.5, 9.1, MAT.oakDark, 0, -0.25, -6.25, null, false);
const floorM = new THREE.Mesh(new THREE.PlaneGeometry(37, 16), MAT.floor);
floorM.rotation.x = -Math.PI / 2; floorM.receiveShadow = true; floorM.position.set(-1.5, 0.001, 6); floorM.userData = { type: 'floor' }; scene.add(floorM);
const floorM2 = new THREE.Mesh(new THREE.PlaneGeometry(32, 8.5), MAT.floor);
floorM2.rotation.x = -Math.PI / 2; floorM2.receiveShadow = true; floorM2.position.set(0, 0.001, -6.25); floorM2.userData = { type: 'floor' }; scene.add(floorM2);
