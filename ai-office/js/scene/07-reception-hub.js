'use strict';
/* ---------- central rectangular planter with a monstera (replaces the fountain) ---------- */
function rrShape(hx, hz, r) {
  const s = new THREE.Shape(); r = Math.min(r, hx, hz);
  s.moveTo(-hx + r, -hz); s.lineTo(hx - r, -hz); s.quadraticCurveTo(hx, -hz, hx, -hz + r); s.lineTo(hx, hz - r); s.quadraticCurveTo(hx, hz, hx - r, hz);
  s.lineTo(-hx + r, hz); s.quadraticCurveTo(-hx, hz, -hx, hz - r); s.lineTo(-hx, -hz + r); s.quadraticCurveTo(-hx, -hz, -hx + r, -hz); return s;
}
function rrHole(hx, hz, r) { const p = new THREE.Path(), s = rrShape(hx, hz, r); p.setFromPoints(s.getPoints(8).reverse()); return p; }

function monsteraLeafGeo() {
  const s = 0.03, pts = [];
  for (let i = 0; i < 64; i++) { const t = i / 64 * Math.PI * 2; pts.push(new THREE.Vector2(16 * Math.pow(Math.sin(t), 3) * s, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s)); }
  const sh = new THREE.Shape(pts);
  const slit = (cx, cy, rx, ry, rot) => { const p = new THREE.Path(); p.absellipse(cx * s, cy * s, rx * s, ry * s, 0, Math.PI * 2, false, rot); sh.holes.push(p); };
  [1, -1].forEach((sg) => { slit(sg * 8.5, 3.5, 3.2, 0.9, sg * 0.3); slit(sg * 8.5, -2, 3.4, 0.9, -sg * 0.15); slit(sg * 7, -7.5, 2.8, 0.8, -sg * 0.5); }); // the cut-outs a monstera leaf is known for
  const geo = new THREE.ShapeGeometry(sh, 14); geo.translate(0, -5 * s, 0); // leaf hangs from its cleft
  const P = geo.attributes.position, UV = geo.attributes.uv; let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  for (let i = 0; i < P.count; i++) { mnx = Math.min(mnx, P.getX(i)); mxx = Math.max(mxx, P.getX(i)); mny = Math.min(mny, P.getY(i)); mxy = Math.max(mxy, P.getY(i)); }
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); UV.setXY(i, (x - mnx) / (mxx - mnx), (y - mny) / (mxy - mny)); P.setZ(i, -0.4 * x * x - 0.15 * y * y); }
  geo.computeVertexNormals(); return geo;
}
function buildMonstera(x, z, y0, S = 1, N = 13, sd = 7) {
  const g = new THREE.Group(); g.position.set(x, y0, z); scene.add(g);
  const leafTex = canvasTex(256, 256, (c, w, h) => {
    const gr = c.createRadialGradient(128, 110, 10, 128, 130, 150); gr.addColorStop(0, '#3f8a49'); gr.addColorStop(1, '#245a30'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(200,235,170,.55)'; c.lineWidth = 5; c.beginPath(); c.moveTo(128, 0); c.lineTo(128, 232); c.stroke();
    c.lineWidth = 2; c.strokeStyle = 'rgba(200,235,170,.3)'; for (let i = 0; i < 9; i++) { const y = 18 + i * 24; c.beginPath(); c.moveTo(128, y); c.quadraticCurveTo(170, y + 6, 215, y + 40); c.moveTo(128, y); c.quadraticCurveTo(86, y + 6, 41, y + 40); c.stroke(); }
  });
  leafTex.wrapS = leafTex.wrapT = THREE.ClampToEdgeWrapping; leafTex.repeat.set(1, 1);
  const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, side: THREE.DoubleSide, roughness: 0.42, metalness: 0.02 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x55823f, roughness: 0.7 });
  const lg = monsteraLeafGeo(); let seed = sd; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < N; i++) {
    const a = i * 2.399, rad = (0.28 + (i % 5) * 0.2 + rnd() * 0.12) * S, h = (0.85 + (i % 4) * 0.3 + rnd() * 0.25) * S, ca = Math.cos(a), sa = Math.sin(a);
    const base = new THREE.Vector3(ca * 0.1 * S, 0, sa * 0.1 * S), tip = new THREE.Vector3(ca * rad, h, sa * rad);
    const curve = new THREE.CatmullRomCurve3([base, new THREE.Vector3(ca * rad * 0.25, h * 0.55, sa * rad * 0.25), new THREE.Vector3(ca * rad * 0.7, h * 0.95, sa * rad * 0.7), tip]);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.02, 6, false), stemMat); stem.castShadow = true; g.add(stem);
    const pivot = new THREE.Group(); pivot.position.copy(tip); pivot.rotation.y = Math.atan2(ca, sa) + (rnd() - 0.5) * 0.5; g.add(pivot);
    const tilt = new THREE.Group(); tilt.rotation.x = 0.12 + rnd() * 0.5; pivot.add(tilt);
    const leaf = new THREE.Mesh(lg, leafMat); leaf.rotation.x = -Math.PI / 2; leaf.scale.setScalar((0.75 + rnd() * 0.55) * S); leaf.castShadow = leaf.receiveShadow = true; tilt.add(leaf);
  }
  mergeStatic(g); return g;
}

function buildPlanter(F) {
  const stoneTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d9d1c1'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(' + (150 + Math.random() * 60 | 0) + ',' + (140 + Math.random() * 50 | 0) + ',' + (120 + Math.random() * 50 | 0) + ',' + (0.05 + Math.random() * 0.1) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); }
    g.strokeStyle = 'rgba(120,105,85,.13)'; g.lineWidth = 1.2; for (let i = 0; i < 26; i++) { g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + Math.random() * 14 - 7, w * 0.6, y + Math.random() * 14 - 7, w, y + Math.random() * 10 - 5); g.stroke(); }
  }, [0.45, 0.45]);
  const stone = new THREE.MeshStandardMaterial({ map: stoneTex, bumpMap: stoneTex, bumpScale: 0.6, roughness: 0.85 });
  const TOP = 0.75, LIFT = TOP - 0.42, W = 0.8, ix = F.hx - W, iz = F.hz - W;
  const n0 = scene.children.length; // everything planted below was authored for a 0.42 m planter; it is lifted onto the table top at the end
  // soil bed and a few rocks
  const soilTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#3b2a20'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(' + (40 + Math.random() * 50 | 0) + ',' + (28 + Math.random() * 30 | 0) + ',' + (20 + Math.random() * 20 | 0) + ',.7)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [3, 2]);
  const chips = new THREE.Group(); scene.add(chips); // a few rocks only
  [[-1.5, -0.3, 0.17], [1.6, 0.35, 0.2], [0.9, -0.5, 0.13], [-0.8, 0.5, 0.15]].forEach(([dx, dz, r]) => { const rk = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), stone); rk.scale.set(1.2, 0.7, 1); rk.position.set(F.x + dx, 0.43 + r * 0.3, F.z + dz); rk.rotation.y = dx; chips.add(rk); });
  mergeStatic(chips);
  buildMonstera(F.x, F.z, 0.42);
  buildMonstera(F.x - 1.55, F.z - 0.05, 0.42, 0.5, 7, 21); buildMonstera(F.x + 1.55, F.z - 0.05, 0.42, 0.5, 7, 33); // two 1-unit companions
  buildSmallPlants(F);
  const lift = new THREE.Group(); lift.position.y = LIFT; scene.add(lift);
  scene.children.slice(n0).forEach((o) => { if (o !== lift) lift.add(o); });
  // table: same rounded-rectangle top, scattered black steel legs, planting strip down the middle
  const topS = rrShape(F.hx, F.hz, 0.14);
  const slab = new THREE.Mesh(new THREE.ExtrudeGeometry(topS, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 6 }), MAT.oak);
  slab.rotation.x = -Math.PI / 2; slab.position.set(F.x, TOP - 0.07, F.z); slab.castShadow = slab.receiveShadow = true; scene.add(slab);
  box(ix * 2 - 0.02, 0.1, iz * 2 - 0.02, new THREE.MeshStandardMaterial({ map: soilTex, roughness: 1 }), F.x, TOP + 0.05, F.z, null, false);
  [[0, iz + 0.02, ix * 2 + 0.1, 0.05], [0, -iz - 0.02, ix * 2 + 0.1, 0.05]].forEach(([dx, dz, w2, d2]) => box(w2, 0.14, d2, MAT.black, F.x + dx, TOP + 0.07, F.z + dz, null, false));
  [-1, 1].forEach((sx) => box(0.05, 0.14, iz * 2 + 0.1, MAT.black, F.x + sx * (ix + 0.02), TOP + 0.07, F.z, null, false));
  [[-2.9, -0.95], [-2.9, 0.95], [-1.0, -0.95], [-1.0, 0.95], [1.0, -0.95], [1.0, 0.95], [2.9, -0.95], [2.9, 0.95]].forEach(([dx, dz]) => box(0.06, TOP - 0.07, 0.06, MAT.black, F.x + dx, (TOP - 0.07) / 2, F.z + dz, null, false));
  [-0.95, 0.95].forEach((dz) => box(5.9, 0.04, 0.04, MAT.black, F.x, 0.55, F.z + dz, null, false)); [-2.9, 2.9].forEach((dx) => box(0.04, 0.04, 1.94, MAT.black, F.x + dx, 0.55, F.z, null, false));
}

/* small companion plants around the monstera */
function bladeGeo(len, wid, bend) {
  const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(wid / 2, len * 0.3), new THREE.Vector2(wid * 0.36, len * 0.72), new THREE.Vector2(0, len), new THREE.Vector2(-wid * 0.36, len * 0.72), new THREE.Vector2(-wid / 2, len * 0.3)]);
  const g = new THREE.ShapeGeometry(sh, 4), P = g.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i); P.setZ(i, bend * y * y); }
  g.computeVertexNormals(); return g;
}
function buildSmallPlants(F) {
  const g = new THREE.Group(); scene.add(g); const Y = 0.42; let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const mat = (c, r = 0.7) => new THREE.MeshStandardMaterial({ color: c, roughness: r, side: THREE.DoubleSide });
  const fernA = mat(0x5fa046), fernB = mat(0x7bb85a), snakeA = mat(0x2d6a3c, 0.45), snakeB = mat(0x4b8a45, 0.45), sucA = mat(0x9ccaa0, 0.6), sucB = mat(0xd6a1ae, 0.6), boxM = mat(0x3d7a43, 0.9), vineM = mat(0x4f8a3e), pothos = mat(0x76b650, 0.5);
  const blade = (geo, m, x, z, yaw, lean) => { const b = new THREE.Mesh(geo, m); b.position.set(F.x + x, Y, F.z + z); b.rotation.set(lean, 0, 0); const p = new THREE.Group(); p.position.set(F.x + x, Y, F.z + z); b.position.set(0, 0, 0); p.rotation.y = yaw; p.add(b); g.add(p); };
  const fern = (x, z, s) => { const gg = bladeGeo(0.5 * s, 0.1 * s, 0.9); for (let i = 0; i < 11; i++) blade(gg, i % 2 ? fernA : fernB, x, z, i / 11 * 6.283 + rnd(), 0.55 + rnd() * 0.5); };
  const snake = (x, z, s) => { for (let i = 0; i < 7; i++) { const gg = bladeGeo((0.5 + rnd() * 0.45) * s, 0.12 * s, 0.1); blade(gg, i % 2 ? snakeA : snakeB, x, z, i * 0.9 + rnd(), 0.04 + rnd() * 0.22); } };
  const succ = (x, z) => { const gg = bladeGeo(0.13, 0.065, 0.5); for (let r = 0; r < 3; r++) for (let i = 0; i < 6 + r * 2; i++) blade(gg, (i + r) % 2 ? sucA : sucB, x, z, i / (6 + r * 2) * 6.283 + r, 1.35 - r * 0.45); };
  const ball = (x, z, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), boxM); m.scale.y = 0.85; m.position.set(F.x + x, Y + r * 0.8, F.z + z); g.add(m); };
  snake(-2.05, -0.25, 1); snake(2.1, 0.25, 0.85); fern(-1.35, 0.5, 1); fern(1.3, -0.5, 0.95); succ(-2.2, 0.5); succ(2.15, -0.5); succ(0.15, 0.62); ball(-0.85, -0.55, 0.17); ball(0.9, 0.55, 0.15); ball(-0.5, 0.6, 0.12);
  // trailing pothos over the front edge
  const vp = [[2.1, 0.46, 0.45], [2.2, 0.55, 0.8], [2.28, 0.56, 1.2], [2.32, 0.54, 1.62], [2.34, 0.3, 1.67], [2.3, 0.1, 1.67]].map((p) => new THREE.Vector3(F.x + p[0], p[1], F.z + p[2]));
  const vc = new THREE.CatmullRomCurve3(vp); g.add(new THREE.Mesh(new THREE.TubeGeometry(vc, 24, 0.012, 5, false), vineM));
  for (let i = 1; i < 14; i++) { const p = vc.getPoint(i / 14), l = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), pothos); l.scale.set(1.2, 0.35, 1); l.position.set(p.x + (i % 2 ? 0.05 : -0.05), p.y, p.z); l.rotation.set(0.3, i, 0.3); g.add(l); }
  mergeStatic(g);
}

/* ---------- detailed fountain + beanbags ---------- */
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t;
}
function ellipseShape(rx, rz) { const s = new THREE.Shape(); s.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0); return s; }
function ellipseHole(rx, rz) { const p = new THREE.Path(); p.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0); return p; }

/* beanbag: slumped, sculpted body with a seat dent, raised back, seams, piping handle and woven bump */
function bagPoint(dx, dy, dz) {
  const R = 0.66; let x = dx * R, y = dy * R * 0.52, z = dz * R;
  if (y < -0.2) y = -0.2 + (y + 0.2) * 0.12;
  y += 0.34 * sstep(-0.1, 0.9, dz) * Math.max(0, 1 - Math.pow(Math.abs(dx) * 1.15, 2)) * (dy > -0.2 ? 1 : 0.15);
  if (dy > 0) y -= Math.exp(-((x * x) + (z + 0.12) * (z + 0.12)) / 0.16) * 0.13;
  const w = 1 + 0.035 * Math.sin(5 * x + 2) * Math.sin(4.5 * z + 1) + 0.02 * Math.sin(9 * y);
  return new THREE.Vector3(x * w, y + 0.2, z * w);
}
function beanbagDetailed(x, z, color, idx) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const col = new THREE.Color(color);
  const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.82 }); mat.userData.keep = true; // soft matte pastel, no bump / sheen
  const geo = new THREE.SphereGeometry(1, 28, 18); geo.rotateY(Math.PI / 2); // keep the texture seam on the hidden back
  const P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) { const v = bagPoint(P.getX(i), P.getY(i), P.getZ(i)); P.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, mat); body.castShadow = body.receiveShadow = true; g.add(body);
  const seamMat = new THREE.MeshStandardMaterial({ color: col.clone().multiplyScalar(0.88), roughness: 0.9 });
  const seam = (fn) => { const pts = []; for (let i = 0; i < 36; i++) { const t = i / 36 * Math.PI * 2, d = fn(t), p = bagPoint(d[0], d[1], d[2]); pts.push(p.multiplyScalar(1.01).add(new THREE.Vector3(0, 0.002, 0))); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 0.014, 4, true), seamMat); m.castShadow = true; g.add(m); };
  const nrm = (a, b, c) => { const l = Math.hypot(a, b, c); return [a / l, b / l, c / l]; };
  seam((t) => nrm(Math.cos(t), 0.12, Math.sin(t)));
  const hp = bagPoint(0, 0.62, 0.78), handle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 6, 12), seamMat); handle.position.set(hp.x, hp.y + 0.03, hp.z + 0.02); handle.rotation.x = -0.35; handle.castShadow = true; g.add(handle);
  mergeStatic(g);
  tag(g, { type: 'beanbag', id: idx }); BEANBAGS.push(g); return g;
}
/* ---------- walls ---------- */
// exterior
wall('x', -10.5, -16, 16, { type: 'glass', ext: true, n: [0, 1] });
wall('z', -16, -10.5, -2, { type: 'glass', ext: true, n: [1, 0] });
wall('z', -20, -2, 14, { type: 'solid', wins: [2, 8, 12], ext: true, n: [1, 0] });
wall('z', 16, -10.5, -2, { type: 'glass', ext: true, n: [-1, 0] });
wall('z', 17, -2, 9, { type: 'solid', wins: [2, 6.5], h: 3.8, ext: true, n: [-1, 0] });
wall('x', 14, -20, -9, { type: 'solid', wins: [-14.5], ext: true, n: [0, -1] });
wall('x', 14, -9, 9, { type: 'glass', doors: [0], doorW: 3, leaf: true, ext: true, n: [0, -1] });
wall('x', 9, 9, 17, { type: 'solid', wins: [13], h: 3.8, ext: true, n: [0, -1] });
wall('z', 9, 9, 14, { type: 'glass', doors: [11.5], doorW: 1.5, leaf: true, ext: true, n: [-1, 0] });
// interior
wall('x', -2, -20, -9, { type: 'solid', n: [0, 1] });
wall('x', -2, -9, 9, { type: 'glass', doors: [-7.5, 0, 7.5], doorW: 2.2, n: [0, 1] });
wall('x', -2, 9, 17, { type: 'solid', h: 5.2, n: [0, 1] });
wall('z', -6, -10.5, -2, { type: 'glass', n: [1, 0] });
wall('z', 6, -10.5, -2, { type: 'glass', n: [-1, 0] });
wall('z', -9, -2, 14, { type: 'glass', doors: [3], doorW: 2.4, leaf: true, n: [1, 0] });
wall('z', 9, -2, 9, { type: 'glass', doors: [3], doorW: 2.4, leaf: true, h: 3.8, n: [-1, 0] });

/* ---------- reception ---------- */
{
  const g = table(4.5, 11.3, 4.6, 1.0, 1.05); g.children[0].material = MAT.oak; box(4.6, 0.07, 1.0, MAT.white, 0, 1.12, 0, g);
  box(4.4, 1.05, 0.06, MAT.oakDark, 0, 0.53, 0.47, g);
  const logo = makeTex(1024, 380, (g, w, h) => { g.fillStyle = '#f1ebdf'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2a27'; g.font = '700 130px "DM Mono",monospace'; g.textAlign = 'center'; g.fillText('AI OFFICE', w / 2, 200); g.fillStyle = '#3f7d5a'; g.fillRect(w / 2 - 70, 250, 140, 10); g.fillStyle = '#76736a'; g.font = '500 40px sans-serif'; g.fillText('CREATIVE DESIGN STUDIO', w / 2, 330); });
  panel(5, 1.5, 13.4, 4.6, 1.7, logo, 0, { back: true, stand: true });
  monitor(3.6, 1.12, 11.3, 0.6, 0.35, screenTex.doc, null);
  tag(sofa(-6.5, 12.2, 0, 2.4, MAT.fabric), { type: 'sofa', spots: [15, 16] }); table(-6.5, 10.4, 1.2, 0.6, 0.4);
  plant(-8.2, 13.2, 1.2); plant(8.2, 13.2, 1.2); plant(-1.8, 9, 1); floorLamp(2, 8.6, 'reception'); floorLamp(-3, 13, 'reception');
  rug(0, 10.5, 3, 3.5, MAT.carpet2);
}

/* ---------- hub: oval fountain ---------- */
const dashTex = makeTex(1024, 460, () => {});
const FOUNT = { x: 0, z: 3, hx: 3.4, hz: 1.6 }; // central rectangular planter
{
  buildPlanter(FOUNT);
  for (let k = 0; k < 5; k++) chair(-2.4 + k * 1.2, 1.1, Math.PI, MAT.fabric2); chair(-3.75, 3, -Math.PI / 2, MAT.fabric2); chair(3.75, 3, Math.PI / 2, MAT.fabric2); // 5 on the south side + one at each end; // meeting chairs on the south side; people face the task board
  const mat = new THREE.MeshBasicMaterial({ map: dashTex });
  const g = new THREE.Group(); g.position.set(0, 0, 6.9); scene.add(g);
  box(7.4, 3.2, 0.16, MAT.black, 0, 2.1, 0, g); [-3, 3].forEach((s) => box(0.12, 0.6, 0.5, MAT.black, s, 0.3, 0, g));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 2.95), mat); f.position.set(0, 2.1, -0.085); f.rotation.y = Math.PI; g.add(f);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 2.95), mat); b.position.set(0, 2.1, 0.085); g.add(b);
  rug(0, 3, 11, 6.2, MAT.carpet2);
  plant(-8.2, -1, 1.2); plant(8.2, -1, 1.2); plant(-8.2, 7.2, 1.1); plant(8.2, 7.2, 1.1); floorLamp(-5.5, 6.4, 'hub'); floorLamp(5.5, 6.4, 'hub');
}
