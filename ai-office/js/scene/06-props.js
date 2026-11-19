'use strict';
/* ---------- detailed props: product photo set + tripod camera ---------- */
function rbox(w, h, d, r, mat, parent, x = 0, y = 0, z = 0) { // rounded, softly bevelled box centred on its origin
  const b = Math.min(0.012, h / 4, w / 6), rw = w - 2 * b, rd = d - 2 * b, rr2 = Math.min(r, rw / 2.2, rd / 2.2), s = new THREE.Shape();
  s.moveTo(-rw / 2 + rr2, -rd / 2); s.lineTo(rw / 2 - rr2, -rd / 2); s.quadraticCurveTo(rw / 2, -rd / 2, rw / 2, -rd / 2 + rr2);
  s.lineTo(rw / 2, rd / 2 - rr2); s.quadraticCurveTo(rw / 2, rd / 2, rw / 2 - rr2, rd / 2); s.lineTo(-rw / 2 + rr2, rd / 2); s.quadraticCurveTo(-rw / 2, rd / 2, -rw / 2, rd / 2 - rr2);
  s.lineTo(-rw / 2, -rd / 2 + rr2); s.quadraticCurveTo(-rw / 2, -rd / 2, -rw / 2 + rr2, -rd / 2);
  const dep = Math.max(0.001, h - 2 * b), g = new THREE.ExtrudeGeometry(s, { depth: dep, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -dep / 2); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (parent || scene).add(m); return m;
}
function limb(a, b, ra, rb, mat, parent) { // tapered rod from point a (radius ra) to point b (radius rb)
  const dir = b.clone().sub(a), len = dir.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, 10), mat);
  dir.normalize(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); m.position.copy(a).add(b).multiplyScalar(0.5);
  m.castShadow = true; (parent || scene).add(m); return m;
}


/* merge many small static meshes into one mesh per material (fewer draw calls) */
function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), buckets = new Map(), dead = [];
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry || Array.isArray(o.material) || (o.material.userData && o.material.userData.keep)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    if (!g.attributes.position || !g.attributes.normal) { g.dispose(); return; }
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    if (!buckets.has(o.material)) buckets.set(o.material, []);
    buckets.get(o.material).push(g); dead.push(o);
  });
  dead.forEach((o) => { o.parent.remove(o); o.geometry.dispose(); });
  buckets.forEach((list, mat) => {
    let n = 0; list.forEach((g) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o3 = 0, o2 = 0;
    list.forEach((g) => { const c = g.attributes.position.count; P.set(g.attributes.position.array, o3); N.set(g.attributes.normal.array, o3); U.set(g.attributes.uv.array, o2); o3 += c * 3; o2 += c * 2; g.dispose(); });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; root.add(m);
  });
}

function buildTripodCam(x, z, towardX, towardZ) {
  const blk = new THREE.MeshStandardMaterial({ color: 0x26282c, roughness: 0.55, metalness: 0.35 });
  const alu = new THREE.MeshStandardMaterial({ color: 0xb9bcc2, roughness: 0.35, metalness: 0.8 });
  const rub = new THREE.MeshStandardMaterial({ color: 0x151618, roughness: 0.9 });
  const acc = new THREE.MeshStandardMaterial({ color: 0xd9902f, roughness: 0.5, metalness: 0.4 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x1d3550, roughness: 0.04, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const head = new THREE.Vector3(0, 1.32, 0);
  for (let i = 0; i < 3; i++) { // three tapered, splayed legs with leg locks and rubber feet
    const a = i / 3 * Math.PI * 2 + 0.5, foot = new THREE.Vector3(Math.cos(a) * 0.52, 0.02, Math.sin(a) * 0.52), mid = head.clone().lerp(foot, 0.5);
    limb(head, mid, 0.026, 0.021, blk, g); limb(mid, foot, 0.019, 0.013, alu, g);
    const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), acc); lock.position.copy(mid); lock.castShadow = true; g.add(lock);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), rub); f.position.copy(foot); f.scale.y = 0.7; g.add(f);
  }
  cyl(0.05, 0.05, 0.1, blk, 0, 1.3, 0, g, 14); cyl(0.022, 0.022, 0.12, alu, 0, 1.4, 0, g, 12); cyl(0.05, 0.05, 0.03, acc, 0, 1.465, 0, g, 14);
  const handle = limb(new THREE.Vector3(0.04, 1.36, 0), new THREE.Vector3(0.3, 1.2, 0.05), 0.014, 0.012, blk, g); cyl(0.022, 0.022, 0.07, rub, 0.3, 1.2, 0.05, g, 10).rotation.z = Math.PI / 2 - 0.5;
  // camera on top, lens pointing at the product table
  const cam = new THREE.Group(); cam.position.set(0, 1.62, 0); g.add(cam);
  rbox(0.1, 0.02, 0.12, 0.01, alu, cam, 0, -0.12, 0);
  rbox(0.32, 0.2, 0.15, 0.03, blk, cam, 0, 0, 0); rbox(0.075, 0.2, 0.11, 0.025, rub, cam, 0.135, -0.005, 0.02); // body + hand grip
  rbox(0.11, 0.075, 0.1, 0.02, blk, cam, 0, 0.135, 0); // prism hump
  cyl(0.03, 0.03, 0.025, alu, -0.1, 0.113, 0, cam, 14); cyl(0.018, 0.018, 0.02, acc, 0.08, 0.108, 0.02, cam, 12); cyl(0.012, 0.012, 0.012, new THREE.MeshStandardMaterial({ color: 0xc9453a, roughness: 0.4 }), 0.13, 0.108, 0.04, cam, 10);
  const barrel = (r, len, zc, mat) => { const m = cyl(r, r, len, mat, 0, 0, zc, cam, 24); m.rotation.x = Math.PI / 2; return m; };
  barrel(0.075, 0.03, 0.09, alu); barrel(0.064, 0.14, 0.17, blk); barrel(0.068, 0.03, 0.15, rub); barrel(0.068, 0.03, 0.2, rub); barrel(0.07, 0.012, 0.245, acc);
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.07, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.8, side: THREE.DoubleSide })); hood.rotation.x = Math.PI / 2; hood.position.z = 0.28; cam.add(hood);
  const front = new THREE.Mesh(new THREE.CircleGeometry(0.058, 24), glass); front.position.z = 0.252; cam.add(front);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(0.014, 12), new THREE.MeshBasicMaterial({ color: 0xcfe6ff })); glint.position.set(-0.02, 0.022, 0.253); cam.add(glint);
  cam.rotation.y = Math.atan2(towardX - x, towardZ - z); cam.rotation.x = 0.04;
  mergeStatic(g);
  return g;
}

function buildPhotoSet(x, z, camX, camZ) {
  const oak = MAT.oak, oakD = MAT.oakDark, wht = new THREE.MeshStandardMaterial({ color: 0xfbf9f4, roughness: 0.95, side: THREE.DoubleSide });
  const blk = new THREE.MeshStandardMaterial({ color: 0x26282c, roughness: 0.55, metalness: 0.35 }), alu = new THREE.MeshStandardMaterial({ color: 0xb9bcc2, roughness: 0.35, metalness: 0.8 });
  const set = new THREE.Group(); set.position.set(x, 0, z); set.rotation.y = Math.atan2(camX - x, camZ - z); scene.add(set); // local +z faces the camera
  const TOP = 0.78;
  // table: rounded top, apron, tapered legs with brass feet, lower shelf with a gear case
  rbox(1.5, 0.06, 0.95, 0.05, oak, set, 0, 0.75, 0); rbox(1.3, 0.08, 0.76, 0.03, oakD, set, 0, 0.68, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { limb(new THREE.Vector3(a * 0.62, 0.02, b * 0.37), new THREE.Vector3(a * 0.62, 0.7, b * 0.37), 0.02, 0.034, oakD, set); const f = sph(0.024, new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 0.7, roughness: 0.4 }), a * 0.62, 0.02, b * 0.37, set); f.scale.y = 0.6; });
  rbox(1.22, 0.025, 0.7, 0.03, oak, set, 0, 0.24, 0); rbox(0.42, 0.17, 0.28, 0.03, blk, set, -0.3, 0.335, 0.02); rbox(0.43, 0.012, 0.29, 0.02, alu, set, -0.3, 0.425, 0.02);
  rbox(0.26, 0.05, 0.2, 0.01, new THREE.MeshStandardMaterial({ color: 0x7e9a8a, roughness: 0.9 }), set, 0.35, 0.28, 0.0);
  // seamless paper sweep, hung from a crossbar between two stands
  const T = 0.62 + Math.PI * 0.28 / 2 + 0.85, SW = 1.25, geo = new THREE.PlaneGeometry(SW, T, 1, 26), P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const s = P.getY(i) + T / 2, lf = 0.62, r = 0.28, arc = Math.PI * r / 2; let zz, yy;
    if (s < lf) { zz = 0.46 - s; yy = 0; } else if (s < lf + arc) { const t = (s - lf) / r; zz = 0.46 - lf - r * Math.sin(t); yy = r * (1 - Math.cos(t)); } else { zz = 0.46 - lf - r; yy = r + (s - lf - arc); }
    P.setXYZ(i, P.getX(i), yy, zz);
  }
  geo.computeVertexNormals();
  // own material, lifted 3 mm off the tabletop and pulled forward in depth so the two coplanar surfaces no longer fight (that was the flicker)
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xfbf9f4, roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); paperMat.userData.keep = true;
  const paper = new THREE.Mesh(geo, paperMat); paper.position.y = TOP + 0.003; paper.receiveShadow = true; paper.castShadow = false; set.add(paper);
  [-0.72, 0.72].forEach((sx) => { limb(new THREE.Vector3(sx, 0.02, -0.5), new THREE.Vector3(sx, 1.98, -0.5), 0.03, 0.022, blk, set); cyl(0.12, 0.14, 0.03, blk, sx, 0.02, -0.5, set, 12); });
  const bar = cyl(0.016, 0.016, 1.5, alu, 0, 1.97, -0.5, set, 10); bar.rotation.z = Math.PI / 2;
  // styled product: pedestal, gift box with ribbon, amber bottle, tiny vase
  cyl(0.19, 0.2, 0.1, wht, 0, TOP + 0.05, 0.08, set, 28);
  const cor = new THREE.MeshStandardMaterial({ color: 0xc9694f, roughness: 0.6 }), rib = new THREE.MeshStandardMaterial({ color: 0xf1e6cf, roughness: 0.6 });
  rbox(0.26, 0.19, 0.2, 0.02, cor, set, 0, TOP + 0.1 + 0.095, 0.08); rbox(0.275, 0.05, 0.215, 0.02, cor, set, 0, TOP + 0.1 + 0.2, 0.08);
  rbox(0.05, 0.195, 0.205, 0.005, rib, set, 0, TOP + 0.1 + 0.095, 0.08); rbox(0.265, 0.195, 0.045, 0.005, rib, set, 0, TOP + 0.1 + 0.095, 0.08);
  const bow = (sx) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 8, 16), rib); m.position.set(sx * 0.04, TOP + 0.1 + 0.265, 0.08); m.rotation.set(0, 0, sx * 0.9); m.castShadow = true; set.add(m); }; bow(-1); bow(1);
  const amber = new THREE.MeshPhysicalMaterial({ color: 0xc9852e, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.85 });
  cyl(0.065, 0.07, 0.17, amber, 0.34, TOP + 0.085, 0.2, set, 20); cyl(0.022, 0.03, 0.05, amber, 0.34, TOP + 0.195, 0.2, set, 14); cyl(0.032, 0.032, 0.05, new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 0.8, roughness: 0.3 }), 0.34, TOP + 0.245, 0.2, set, 14);
  cyl(0.04, 0.03, 0.09, MAT.pot, -0.4, TOP + 0.045, 0.22, set, 16); for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.2, 6), i % 2 ? MAT.leaf : MAT.leaf2); l.position.set(-0.4 + (i - 1.5) * 0.02, TOP + 0.19, 0.22); l.rotation.z = (i - 1.5) * 0.28; l.castShadow = true; set.add(l); }
  // octagonal softbox on a stand (front glows with the room light), and a round reflector opposite
  const wl = new THREE.Vector3(-1.1, 0, 0.55), stand = (px, pz, h) => { for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 1; limb(new THREE.Vector3(px, h * 0.55, pz), new THREE.Vector3(px + Math.cos(a) * 0.4, 0.02, pz + Math.sin(a) * 0.4), 0.028, 0.02, blk, set); } limb(new THREE.Vector3(px, 0.1, pz), new THREE.Vector3(px, h, pz), 0.036, 0.026, alu, set); };
  stand(wl.x, wl.z, 1.55);
  const sb = new THREE.Group(); sb.position.set(wl.x, 1.62, wl.z); set.add(sb);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.15, 0.42, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.8, side: THREE.DoubleSide })); body.rotation.x = Math.PI / 2; body.position.z = 0.02; body.castShadow = true; sb.add(body);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.4, 8), lampMat('design')); face.position.z = 0.23; sb.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 6, 8), alu); rim.position.z = 0.23; rim.rotation.z = Math.PI / 8; sb.add(rim);
  cyl(0.05, 0.05, 0.08, blk, 0, -0.04, -0.15, sb, 10).rotation.x = Math.PI / 2;
  set.updateMatrixWorld(true); const tw = new THREE.Vector3(0, TOP + 0.3, 0.1); set.localToWorld(tw); sb.lookAt(tw);
  stand(0.8, 0.3, 1.2);
  const rf = new THREE.Group(); rf.position.set(0.8, 1.2, 0.3); set.add(rf);
  const reflTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(110, 100, 10, 128, 128, 140); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(0.55, '#f6e7c4'); gr.addColorStop(1, '#d9b86f'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.globalAlpha = 0.14; for (let i = 0; i < 36; i++) { g.strokeStyle = i % 2 ? '#fff' : '#b8964a'; g.lineWidth = 3 + Math.random() * 7; g.beginPath(); const x0 = Math.random() * 256, y0 = Math.random() * 256; g.moveTo(x0, y0); g.lineTo(x0 + (Math.random() - 0.5) * 140, y0 + (Math.random() - 0.5) * 140); g.stroke(); }
    g.globalAlpha = 0.35; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(95, 80, 55, 28, -0.6, 0, 6.3); g.fill(); // soft specular sheen
    return new THREE.CanvasTexture(c); })();
  const faceMat = new THREE.MeshStandardMaterial({ map: reflTex, emissive: 0xfff0d0, emissiveMap: reflTex, emissiveIntensity: 0.2, metalness: 0.45, roughness: 0.28 }); faceMat.userData.keep = true;
  const front = new THREE.Mesh(new THREE.CircleGeometry(0.3, 40), faceMat); front.position.z = 0.008; rf.add(front);
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.3, 40), new THREE.MeshStandardMaterial({ color: 0x2b2d31, roughness: 0.8, side: THREE.DoubleSide })); back.position.z = -0.008; back.rotation.y = Math.PI; back.castShadow = true; rf.add(back);
  rf.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 36), blk)); cyl(0.03, 0.03, 0.06, blk, 0, -0.3, -0.04, rf, 10);
  // soft glow halo + a bounce light that lands on the product
  const hc = document.createElement('canvas'); hc.width = hc.height = 128; const hg = hc.getContext('2d'); const hr = hg.createRadialGradient(64, 64, 4, 64, 64, 62); hr.addColorStop(0, 'rgba(255,236,190,.9)'); hr.addColorStop(1, 'rgba(255,236,190,0)'); hg.fillStyle = hr; hg.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(1.15, 1.15, 1); halo.position.z = 0.05; rf.add(halo);
  rf.lookAt(tw);
  const bounce = new THREE.PointLight(0xffe2b8, 0, 2.6, 2); bounce.position.set(0.6, 1.15, 0.25); set.add(bounce);
  photoFx = { update(t) { const lvl = roomLights.design ? roomLights.design.lvl : 0, k = 0.18 + 0.82 * lvl, sh = 1 + Math.sin(t * 1.7) * 0.04;
    faceMat.emissiveIntensity = (0.1 + 0.75 * k) * sh; halo.material.opacity = 0.05 + 0.4 * k; bounce.intensity = 0.9 * k * sh; } };
  mergeStatic(set);
  return set;
}
