'use strict';
/* ---------- showroom (8 x 11, seating 20% closer) ---------- */
const posters = [];
{
  rug(13, 3.8, 5.4, 4.2, MAT.carpet);
  const pcols = [['#f2b97a', '#c9694f'], ['#6a9fb5', '#2b2a27'], ['#a6d9a0', '#3f7d5a']];
  [10.1, 12.2, 14.3].forEach((x, i) => {
    const tex = makeTex(300, 400, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, pcols[i][0]); gr.addColorStop(1, pcols[i][1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(w * (0.35 + i * 0.15), h * 0.4, 70, 0, 6.3); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(40, h - 90, w - 80, 14); g.fillRect(40, h - 60, (w - 80) * 0.6, 14); });
    const p = panel(x, 1.75, -1.82, 1.7, 2.25, tex, 0, { frame: MAT.black }); p.userData.tex = tex; posters.push(p);
  });
  const ptex = makeTex(256, 400, (g, w, h) => { g.fillStyle = '#1d1d1f'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffe3b3'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#2b2a27'; g.font = '700 54px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.fillText('作品集', w / 2, 190); g.fillStyle = '#3f7d5a'; g.font = '700 70px sans-serif'; g.fillText('→', w / 2, 290); });
  tag(panel(16, 1.2, -1.82, 1.4, 2.4, ptex, 0, { frame: MAT.black }), { type: 'portal' });
  shelf(9.5, 6.9, 3, Math.PI / 2, 2.2);
  table(13, 5.9, 2.2, 0.7, 0.45); sofa(13, 7.5, 0, 2.6, MAT.fabric);
  plant(16.3, -0.6, 1.3); plant(16.3, 8.2, 1.2); plant(9.8, 8.3, 1.0); plant(9.8, -0.8, 1.0);
  floorLamp(15.8, 4.2, 'show'); floorLamp(10.2, 1, 'show');
  const y0 = 3.8, y1 = 5.2, th = Math.atan((y1 - y0) / 11), yz = (z) => y1 - (z + 2) / 11 * (y1 - y0);
  const roof = new THREE.Group(); scene.add(roof);
  const cw = 8 / 3, L = 5.5 / Math.cos(th);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const zc = 0.75 + j * 5.5, p = new THREE.Mesh(new THREE.PlaneGeometry(cw - 0.12, L - 0.12), glassExt);
    p.rotation.x = -Math.PI / 2 + th; p.position.set(9 + cw * (i + 0.5), yz(zc), zc); roof.add(p);
  }
  for (let i = 0; i <= 3; i++) { const b = box(0.14, 0.14, 11 / Math.cos(th), MAT.black, 9 + cw * i, yz(3.5), 3.5, roof); b.rotation.x = th; }
  [-2, 3.5, 9].forEach((z) => box(8, 0.14, 0.14, MAT.black, 13, yz(z), z, roof));
  [9, 17].forEach((x) => { const sh = new THREE.Shape(); sh.moveTo(2, y0); sh.lineTo(-9, y0); sh.lineTo(2, y1); sh.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), glassExt); m.rotation.y = Math.PI / 2; m.position.x = x; scene.add(m); glassExt.side = THREE.DoubleSide;
    const e = box(0.12, 0.12, 11.2, MAT.black, x, (y0 + y1) / 2, 3.5); e.rotation.x = th; });
}

/* ---------- patio (outside corner) ---------- */
{
  box(8, 0.04, 5, MAT.oakDark, 13, 0.02, 11.5, null, false);
  plant(10, 13.2, 1.3); plant(16.2, 13.2, 1.3); plant(16.4, 9.6, 1.0);
  [11.4, 14.6].forEach((bx, bi) => { const g = new THREE.Group(); g.position.set(bx, 0, 10.3); scene.add(g); // park bench, back to the wall, facing the water curtain / street
    for (let i = 0; i < 4; i++) box(1.6, 0.03, 0.1, MAT.oak, 0, 0.45, -0.18 + i * 0.12, g); for (let i = 0; i < 3; i++) { const sl = box(1.6, 0.08, 0.03, MAT.oak, 0, 0.62 + i * 0.12, -0.24, g); sl.rotation.x = -0.15; }
    [-0.78, 0.78].forEach((sx) => { box(0.05, 0.45, 0.5, MAT.black, sx, 0.22, 0, g); box(0.05, 0.05, 0.5, MAT.black, sx, 0.58, 0.0, g); box(0.05, 0.55, 0.05, MAT.black, sx, 0.5, -0.24, g); }); tag(g, { type: 'sofa', spots: bi ? [13, 14] : [11, 12] }); });
}

/* ---------- digital water curtain on the street side of the patio: falling water forms the word "Comet" ---------- */
const curtainFx = (() => {
  const CW = 4.6, CH = 2.6, PX = 768, PY = 434, STEP = 6, COLS = PX / STEP;
  const c = document.createElement('canvas'); c.width = PX; c.height = PY; const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  const mask = new Uint8Array(COLS * PY); // per column: is this pixel row part of the lettering
  const buildMask = () => { const m = document.createElement('canvas'); m.width = PX; m.height = PY; const mg = m.getContext('2d'); mg.fillStyle = '#000'; mg.fillRect(0, 0, PX, PY);
    mg.fillStyle = '#fff'; mg.font = '700 230px "DM Mono","Noto Sans TC",monospace'; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText('Comet', PX / 2, PY * 0.46);
    const d = mg.getImageData(0, 0, PX, PY).data; for (let i = 0; i < COLS; i++) for (let y = 0; y < PY; y++) mask[i * PY + y] = d[(y * PX + i * STEP + STEP / 2) * 4] > 128 ? 1 : 0; };
  buildMask(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildMask);
  const grp = new THREE.Group(); grp.position.set(13.1, 0, 13.75); scene.add(grp);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); plane.position.y = 0.3 + CH / 2; plane.renderOrder = 4; grp.add(plane);
  [-1, 1].forEach((sx) => box(0.12, 3.1, 0.12, MAT.black, sx * (CW / 2 + 0.1), 1.55, 0, grp)); box(CW + 0.5, 0.14, 0.24, MAT.black, 0, 3.0, 0, grp); box(CW + 0.5, 0.2, 0.5, MAT.black, 0, 0.1, 0, grp);
  const wc = document.createElement('canvas'); wc.width = 512; wc.height = 64; const wg = wc.getContext('2d'), wtex = new THREE.CanvasTexture(wc); // reflections of the bulbs on the water surface
  const water = new THREE.Mesh(new THREE.PlaneGeometry(CW, 0.34), new THREE.MeshStandardMaterial({ color: 0x4aa3d8, transparent: true, opacity: 0.85, roughness: 0.15, emissive: 0xffffff, emissiveMap: wtex, emissiveIntensity: 1 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.205; grp.add(water);
  // row of lights along the nozzle beam
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xfff1c9 }); const bulbs = new THREE.Group(); grp.add(bulbs); const NB = 24;
  for (let i = 0; i < NB; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), bulbM); b.position.set(-CW / 2 - 0.15 + (CW + 0.3) * i / (NB - 1), 2.9, 0.1); bulbs.add(b); }
  // direct spot-light beams: translucent additive cones from every third bulb down onto the water
  const beamM = new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, side: THREE.DoubleSide });
  const beamGeo = new THREE.ConeGeometry(0.3, 2.6, 20, 1, true), bp = beamGeo.attributes.position, bc = new Float32Array(bp.count * 3);
  for (let k = 0; k < bp.count; k++) { const tt = (bp.getY(k) + 1.3) / 2.6, v = Math.pow(tt, 1.4); bc[k * 3] = bc[k * 3 + 1] = bc[k * 3 + 2] = v; } beamGeo.setAttribute('color', new THREE.BufferAttribute(bc, 3));
  for (let i = 0; i < NB; i += 3) { const bm = new THREE.Mesh(beamGeo, beamM); bm.position.set(bulbs.children[i].position.x, 2.9 - 1.3, 0.1); bm.renderOrder = 3; bm.raycast = function () {}; grp.add(bm); }
  const sd = []; for (let i = 0; i < COLS; i++) sd.push({ sp: 160 + Math.random() * 120, ph: Math.random() * PY, len: 30 + Math.random() * 60, w: 1.6 + Math.random() * 0.9, j: (Math.random() - 0.5) * 0.5 });
  let acc = 0;
  return { update(t, dt) {
    beamM.opacity = 0.07 + 0.2 * (1 - TIME.d); acc += dt; if (acc < 0.05) return; acc = 0; g.clearRect(0, 0, PX, PY); g.lineCap = 'round'; const LV = [[], [], [], [], [], [], [], []];
    for (let i = 0; i < COLS; i++) { const x = i * STEP + STEP / 2 + Math.sin(t * 1.3 + i) * 0.4, o = sd[i];
      g.strokeStyle = 'rgba(200,232,255,0.16)'; g.lineWidth = o.w * 0.8; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, PY); g.stroke(); // the thin continuous stream
      const y = (t * o.sp + o.ph) % (PY + o.len) - o.len;
      g.strokeStyle = 'rgba(235,248,255,0.45)'; g.lineWidth = o.w; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + o.len); g.stroke(); // a faster droplet streak
      for (let yy = 0; yy < PY; yy += 3) if (mask[i * PY + yy]) { const a = 0.5 + 0.5 * Math.sin(t * 7 - yy * 0.045 + o.j); const lv = Math.max(0, Math.min(7, (a * 8) | 0)); LV[lv].push(x, yy); } } // lettering: continuous vertical streams, brightness sweeping from top to bottom
    for (let lv = 0; lv < 8; lv++) { const L = LV[lv]; if (!L.length) continue; g.fillStyle = 'rgba(240,250,255,' + (0.35 + lv * 0.09).toFixed(2) + ')'; g.beginPath(); for (let k = 0; k < L.length; k += 2) g.rect(L[k] - 1.4, L[k + 1], 2.8, 3.2); g.fill(); }
    wg.clearRect(0, 0, 512, 64); wg.fillStyle = '#000'; wg.fillRect(0, 0, 512, 64);
    for (let i = 0; i < NB; i++) { const ux = (i / (NB - 1) * (CW + 0.3) - 0.15) / CW * 512, w = 9 + Math.sin(t * 2.2 + i * 1.7) * 3, a = 0.55 + 0.25 * Math.sin(t * 3.1 + i * 2.3);
      const gr = wg.createRadialGradient(ux, 32, 0, ux, 32, 30); gr.addColorStop(0, 'rgba(255,244,210,' + a.toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,244,210,0)'); wg.save(); wg.translate(ux, 32); wg.scale(w / 30, 1); wg.translate(-ux, -32); wg.fillStyle = gr; wg.fillRect(ux - 30, 0, 60, 64); wg.restore(); }
    wg.strokeStyle = 'rgba(200,235,255,0.35)'; wg.lineWidth = 1.5; for (let k = 0; k < 6; k++) { const yy = ((t * 14 + k * 11) % 64); wg.beginPath(); wg.moveTo(0, yy); wg.lineTo(512, yy); wg.stroke(); } // ripples running across
    wtex.needsUpdate = true; tex.needsUpdate = true; } };
})();
