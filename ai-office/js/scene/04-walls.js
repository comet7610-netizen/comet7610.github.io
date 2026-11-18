'use strict';
/* ---------- walls with cutaway ---------- */
const WALLS = [];
const WT = 0.25, LOW = 1.1;
function wallSeg(axis, fixed, a, b, o) {
  // axis 'x': runs along x at z=fixed ; axis 'z': runs along z at x=fixed
  const GM = o.ext ? glassExt : glassMat; const h = o.h || 3.2, len = b - a, mid = (a + b) / 2;
  const up = new THREE.Group(); up.position.y = LOW; scene.add(up);
  const P = (l, y, w, hh, mat, th = WT, par = up) => {
    const m = axis === 'x' ? box(w, hh, th, mat, l, y, fixed, par, mat !== GM) : box(th, hh, w, mat, fixed, y, l, par, mat !== GM);
    if (mat === GM) m.castShadow = false; return m;
  };
  const lowBox = axis === 'x' ? box(len, LOW, WT, MAT.wall, mid, LOW / 2, fixed) : box(WT, LOW, len, MAT.wall, fixed, LOW / 2, mid);
  const uh = h - LOW;
  if (o.type === 'solid') {
    const ws = (o.wins || []).slice().sort((p, q) => p - q), ww = 2.6, wh = 1.5; let cur = a; // openings start at the sill (y = LOW)
    ws.forEach((w) => {
      const w0 = w - ww / 2, w1 = w + ww / 2;
      if (w0 > cur) P((cur + w0) / 2, uh / 2, w0 - cur, uh, MAT.wall);
      P(w, wh + (uh - wh) / 2, ww, uh - wh, MAT.wall); // lintel
      P(w, wh / 2, ww, wh, GM, 0.05); // real glass: light passes through
      const T = WT + 0.08;
      P(w, 0.02, ww + 0.1, 0.08, MAT.black, T); P(w, wh, ww + 0.1, 0.08, MAT.black, T);
      P(w - ww / 2, wh / 2, 0.08, wh, MAT.black, T); P(w + ww / 2, wh / 2, 0.08, wh, MAT.black, T); P(w, wh / 2, 0.05, wh, MAT.black, T);
      cur = w1;
    });
    if (b > cur) P((cur + b) / 2, uh / 2, b - cur, uh, MAT.wall);
  } else {
    P(mid, uh / 2, len, uh, GM, 0.06);
    const n = Math.max(1, Math.round(len / 3.6));
    for (let i = 0; i <= n; i++) P(a + len * i / n, uh / 2, 0.09, uh, MAT.black, 0.12);
    P(mid, uh - 0.05, len, 0.1, MAT.black, 0.16);
  }
  const w = { g: up, cx: axis === 'x' ? mid : fixed, cz: axis === 'x' ? fixed : mid, n: o.n || null, cur: 1, lowBox };
  WALLS.push(w); return w;
}
function wall(axis, fixed, a, b, o = {}) {
  const GM = o.ext ? glassExt : glassMat; const doors = (o.doors || []).slice().sort((p, q) => p - q), dw = o.doorW || 2.4, h = o.h || 3.2;
  let s = a;
  doors.forEach((d) => {
    if (d - dw / 2 > s) wallSeg(axis, fixed, s, d - dw / 2, o);
    // door frame header + posts (in a fade group)
    const up = new THREE.Group(); up.position.y = LOW; scene.add(up);
    const B = (l, y, w2, hh, th = 0.2) => axis === 'x' ? box(w2, hh, th, MAT.black, l, y, fixed, up) : box(th, hh, w2, MAT.black, fixed, y, l, up);
    B(d, 2.3 - LOW, dw + 0.1, 0.12); // lintel at world y 2.3
    B(d - dw / 2, 1.15 - LOW, 0.1, 2.3); B(d + dw / 2, 1.15 - LOW, 0.1, 2.3);
    const hdr = axis === 'x' ? box(dw, h - 2.35, WT, o.type === 'solid' ? MAT.wall : GM, d, (2.35 + h) / 2, fixed, scene, false) : box(WT, h - 2.35, dw, o.type === 'solid' ? MAT.wall : GM, fixed, (2.35 + h) / 2, d, scene, false);
    hdr.parent.remove(hdr); up.add(hdr); hdr.position.y -= LOW;
    WALLS.push({ g: up, cx: axis === 'x' ? d : fixed, cz: axis === 'x' ? fixed : d, n: o.n || null, cur: 1, door: true });
    // glass door leaf, ajar (cosmetic)
    if (o.leaf) {
      const pivot = new THREE.Group(); pivot.position.set(axis === 'x' ? d - dw / 2 : fixed, 0, axis === 'x' ? fixed : d - dw / 2); scene.add(pivot);
      const lf = new THREE.Mesh(new THREE.BoxGeometry(axis === 'x' ? dw - 0.2 : 0.05, 2.2, axis === 'x' ? 0.05 : dw - 0.2), GM); lf.position.set(axis === 'x' ? (dw - 0.2) / 2 : 0, 1.1, axis === 'x' ? 0 : (dw - 0.2) / 2); pivot.add(lf);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(axis === 'x' ? dw - 0.2 : 0.07, 0.07, axis === 'x' ? 0.07 : dw - 0.2), MAT.black); fr.position.set(lf.position.x, 2.2, lf.position.z); pivot.add(fr);
      pivot.rotation.y = axis === 'x' ? -1.2 : 1.2;
    }
    s = d + dw / 2;
  });
  if (b > s) wallSeg(axis, fixed, s, b, o);
}
function updateWalls() {
  const dx = Math.sin(CAM.az), dz = Math.cos(CAM.az);
  const topDown = CAM.pol < 0.2;
  for (const w of WALLS) {
    let near;
    const vx = camera.position.x - w.cx, vz = camera.position.z - w.cz;
    if (w.n) near = (vx * w.n[0] + vz * w.n[1]) < 0;
    else { const ix = -w.cx, iz = -w.cz; const l = Math.hypot(ix, iz) || 1; near = (vx * ix + vz * iz) / l < 0; }
    const tgt = (near || topDown) ? 0.02 : 1;
    w.cur += (tgt - w.cur) * 0.14; w.g.scale.y = Math.max(w.cur, 0.001); w.g.visible = w.cur > 0.03;
  }
}
let photoFx = null; // per-frame hook: reflector bounce light follows the studio lamp (set in buildPhotoSet)
