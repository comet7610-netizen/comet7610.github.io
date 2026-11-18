'use strict';
/* ---------- rooms, furniture ---------- */
const ROOMS = {
  reception: { name: '入口接待', x1: -9, x2: 9, z1: 8, z2: 14 },
  hub: { name: '中央交誼區／AI 總控', x1: -9, x2: 9, z1: -2, z2: 8 },
  plan: { name: '企劃部', x1: -16, x2: -6, z1: -10.5, z2: -2 },
  design: { name: '設計部', x1: -6, x2: 6, z1: -10.5, z2: -2 },
  research: { name: '研究部', x1: 6, x2: 16, z1: -10.5, z2: -2 },
  show: { name: '作品展示室', x1: 9, x2: 17, z1: -2, z2: 9 },
  lounge: { name: '公共休息室', x1: -20, x2: -9, z1: -2, z2: 14 },
};
for (const k in ROOMS) { const r = ROOMS[k]; r.id = k; r.cx = (r.x1 + r.x2) / 2; r.cz = (r.z1 + r.z2) / 2; }
const LIGHT_LABEL = { reception: '入口', hub: '交誼', plan: '企劃', design: '設計', research: '研究', show: '展示', lounge: '休息' };

function makeTex(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); fn(g, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.needsUpdate = true; t._c = c; t._g = g; return t;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function tag(obj, data) { obj.userData = Object.assign(obj.userData || {}, data); obj.traverse((c) => { c.userData.pickRoot = obj; }); return obj; }

/* room lights */
Object.values(ROOMS).forEach((r) => {
  const pl = new THREE.PointLight(0xffcf9a, 0, 20, 1.6); pl.position.set(r.cx, 3.2, r.cz); scene.add(pl);
  const L = roomLights[r.id] = { on: true, lvl: 0, pl, lamps: [], apply(d, c = 0) {
    // overcast / rainy daylight is dim, so the indoor lights come on
    const tgt = L.on ? lerp(1, 0.18, d * Math.max(0, 1 - 1.25 * c)) : 0; L.lvl += (tgt - L.lvl) * 0.12;
    pl.intensity = L.lvl * 0.93; L.lamps.forEach((m) => { m.emissiveIntensity = L.lvl * 1.6; });
  } };
});
function lampMat(room) {
  const m = new THREE.MeshStandardMaterial({ color: 0xfff1dd, emissive: 0xffc27a, emissiveIntensity: 0, roughness: 0.6 });
  roomLights[room].lamps.push(m); return m;
}
function floorLamp(x, z, room) { // sturdy brass pole, weighted base and a wide emissive shade so it never reads as floating
  cyl(0.24, 0.27, 0.06, MAT.black, x, 0.03, z, null, 20); cyl(0.04, 0.04, 1.55, new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.35, metalness: 0.7 }), x, 0.83, z, null, 10);
  cyl(0.07, 0.07, 0.08, MAT.black, x, 1.6, z, null, 10);
  const s = cyl(0.26, 0.38, 0.44, lampMat(room), x, 1.82, z, null, 24); s.castShadow = false; cyl(0.27, 0.27, 0.03, MAT.black, x, 2.05, z, null, 24);
}
function deskLamp(x, y, z, room, g) {
  cyl(0.08, 0.1, 0.03, MAT.black, x, y + 0.015, z, g); cyl(0.012, 0.012, 0.4, MAT.black, x, y + 0.2, z, g);
  const s = cyl(0.07, 0.12, 0.12, lampMat(room), x, y + 0.42, z, g); s.castShadow = false;
}
function plant(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  cyl(0.28 * s, 0.22 * s, 0.5 * s, MAT.pot, 0, 0.25 * s, 0, g);
  const n = 6; for (let i = 0; i < n; i++) {
    const a = i / n * 6.283, c = new THREE.Mesh(new THREE.ConeGeometry(0.13 * s, 0.95 * s, 6), i % 2 ? MAT.leaf : MAT.leaf2);
    c.position.set(Math.cos(a) * 0.14 * s, 0.9 * s, Math.sin(a) * 0.14 * s); c.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); c.castShadow = true; g.add(c);
  }
  sph(0.28 * s, MAT.leaf, 0, 0.78 * s, 0, g); return g;
}
function chair(x, z, yaw = 0, mat = MAT.fabric2) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; scene.add(g);
  box(0.6, 0.08, 0.6, mat, 0, 0.5, 0, g); box(0.6, 0.7, 0.07, mat, 0, 0.9, 0.3, g);
  cyl(0.04, 0.04, 0.45, MAT.black, 0, 0.25, 0, g); cyl(0.3, 0.3, 0.04, MAT.black, 0, 0.03, 0, g, 5); return g;
}
function monitor(x, y, z, w, h, tex, parent) {
  const g = new THREE.Group(); g.position.set(x, y, z); (parent || scene).add(g);
  box(w + 0.06, h + 0.06, 0.04, MAT.black, 0, h / 2 + 0.12, 0, g); box(0.1, 0.12, 0.08, MAT.black, 0, 0.06, 0, g); box(0.4, 0.02, 0.22, MAT.black, 0, 0.01, 0, g);
  const sm = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sm); s.position.set(0, h / 2 + 0.12, 0.025); g.add(s);
  return sm;
}
const screenTex = {
  code: makeTex(256, 160, (g, w, h) => { g.fillStyle = '#16202b'; g.fillRect(0, 0, w, h); for (let i = 0; i < 12; i++) { g.fillStyle = ['#6bbf93', '#e8a84a', '#8ab4f8', '#c9c6bf'][i % 4]; g.fillRect(14 + (i % 3) * 10, 12 + i * 11, 40 + (i * 37) % 120, 5); } }),
  doc: makeTex(256, 160, (g, w, h) => { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#3f7d5a'; g.fillRect(12, 12, 90, 10); g.fillStyle = '#bdb8aa'; for (let i = 0; i < 8; i++) g.fillRect(12, 34 + i * 13, 180 - (i % 3) * 30, 6); g.fillStyle = '#d9902f'; g.fillRect(190, 40, 54, 54); }),
  art: makeTex(256, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2b97a'); gr.addColorStop(1, '#6a9fb5'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(90, 80, 44, 0, 6.3); g.fill(); g.fillStyle = '#2b2a27'; g.fillRect(150, 40, 70, 70); }),
  chart: makeTex(256, 160, (g, w, h) => { g.fillStyle = '#18222a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6bbf93'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 10; i++) { const y = 110 - Math.sin(i * 0.9) * 28 - i * 5; i ? g.lineTo(14 + i * 25, y) : g.moveTo(14, y); } g.stroke(); g.fillStyle = '#e8a84a'; for (let i = 0; i < 7; i++) g.fillRect(16 + i * 34, 140 - (i * 17) % 50 - 12, 18, (i * 17) % 50 + 12); }),
};
const DESKS = {}; // staffId -> {mats:[], x,z}
function desk(x, z, staffId, room, o = {}) {
  const w = o.w || 2.5, g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  box(w, 0.06, 1.1, MAT.oak, 0, 0.75, 0, g);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.06, 0.72, 0.06, MAT.black, a * (w / 2 - 0.08), 0.36, b * 0.46, g));
  box(w - 0.2, 0.22, 0.04, MAT.oakDark, 0, 0.62, -0.5, g);
  const mats = [];
  (o.screens || [['code', 0.9, 0.52]]).forEach((s, i, arr) => { const off = arr.length === 1 ? 0 : (i - (arr.length - 1) / 2) * (s[1] + 0.1);
    mats.push(monitor(off, 0.78, -0.25, s[1], s[2], screenTex[s[0]], g)); });
  box(0.5, 0.015, 0.16, MAT.white, 0.1, 0.78, 0.2, g, false);
  if (o.tablet) { const t = box(0.5, 0.02, 0.32, MAT.black, -0.7, 0.79, 0.15, g); t.rotation.y = 0.2; }
  if (o.papers) { box(0.35, 0.01, 0.25, MAT.white, -0.9, 0.78, 0.1, g, false); box(0.3, 0.01, 0.22, MAT.white, -0.88, 0.79, 0.12, g, false).rotation.y = 0.3; }
  deskLamp(w / 2 - 0.2, 0.78, -0.3, room, g);
  DESKS[staffId] = { mats, x, z }; return g;
}
function shelf(x, z, w, yaw, h = 2.2) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; scene.add(g);
  box(w, h, 0.04, MAT.oakDark, 0, h / 2, -0.17, g); box(0.05, h, 0.4, MAT.oak, -w / 2, h / 2, 0, g); box(0.05, h, 0.4, MAT.oak, w / 2, h / 2, 0, g);
  const rows = 4; for (let i = 0; i <= rows; i++) box(w, 0.04, 0.4, MAT.oak, 0, 0.05 + i * (h - 0.1) / rows, 0, g);
  const cols = [0xc9694f, 0x4f7a9a, 0xe3b04b, 0x5d8a6a, 0xefe8da, 0x8a6aa0];
  for (let r = 0; r < rows; r++) for (let i = 0; i < Math.floor(w / 0.2); i++) if ((i * 7 + r * 3) % 5 !== 0)
    box(0.12, 0.34 + (i * 13 % 4) * 0.02, 0.26, new THREE.MeshStandardMaterial({ color: cols[(i + r * 2) % cols.length], roughness: .8 }), -w / 2 + 0.2 + i * 0.19, 0.25 + r * (h - 0.1) / rows + 0.12, 0, g, false);
  return g;
}
function cbox(w, h, d, b, mat, parent, x = 0, y = 0, z = 0) { // chubby box: every edge rounded with radius b
  const rw = w - 2 * b, rd = d - 2 * b, r = Math.min(rw, rd) * 0.3, sh = new THREE.Shape();
  sh.moveTo(-rw / 2 + r, -rd / 2); sh.lineTo(rw / 2 - r, -rd / 2); sh.quadraticCurveTo(rw / 2, -rd / 2, rw / 2, -rd / 2 + r); sh.lineTo(rw / 2, rd / 2 - r); sh.quadraticCurveTo(rw / 2, rd / 2, rw / 2 - r, rd / 2);
  sh.lineTo(-rw / 2 + r, rd / 2); sh.quadraticCurveTo(-rw / 2, rd / 2, -rw / 2, rd / 2 - r); sh.lineTo(-rw / 2, -rd / 2 + r); sh.quadraticCurveTo(-rw / 2, -rd / 2, -rw / 2 + r, -rd / 2);
  const dep = Math.max(0.001, h - 2 * b), g = new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 8 });
  g.translate(0, 0, -dep / 2); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (parent || scene).add(m); return m;
}
function sofa(x, z, yaw, w = 2.6, mat = MAT.fabric2) { // plump, soft-cornered sofa
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; scene.add(g);
  cbox(w, 0.32, 1.0, 0.11, mat, g, 0, 0.26, 0);
  cbox(w - 0.56, 0.2, 0.82, 0.1, mat, g, 0, 0.47, -0.06);
  cbox(w, 0.78, 0.32, 0.14, mat, g, 0, 0.69, 0.4);
  [-1, 1].forEach((sx) => cbox(0.32, 0.62, 1.0, 0.14, mat, g, sx * (w / 2 - 0.16), 0.41, 0));
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => cyl(0.05, 0.04, 0.08, MAT.black, sx * (w / 2 - 0.2), 0.04, sz * 0.38, g, 10)));
  return g;
}
function rug(x, z, w, d, mat) { const m = box(w, 0.03, d, mat, x, 0.02, z, null, false); m.castShadow = false; return m; }
function table(x, z, w, d, h = 0.75) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  box(w, 0.07, d, MAT.oak, 0, h, 0, g); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.07, h, 0.07, MAT.black, a * (w / 2 - 0.1), h / 2, b * (d / 2 - 0.1), g)); return g; }
function panel(x, y, z, w, h, tex, yaw = 0, o = {}) { // framed picture/board, facing +z by default, double-sided optional
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; scene.add(g);
  box(w + 0.12, h + 0.12, 0.06, o.frame || MAT.black, 0, 0, 0, g);
  const m = new THREE.MeshBasicMaterial({ map: tex }); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.z = 0.035; g.add(p);
  if (o.back) { const p2 = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p2.position.z = -0.035; p2.rotation.y = Math.PI; g.add(p2); }
  if (o.stand) { [-1, 1].forEach((s) => box(0.08, y - h / 2, 0.08, MAT.black, s * (w / 2 - 0.3), -y / 2 - h / 4, -0.12, g)); }
  return g;
}
