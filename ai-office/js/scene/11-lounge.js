'use strict';
/* ---------- lounge ---------- */
const loungeCeil = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 16), MAT.wall); loungeCeil.position.set(-14.5, 3.3, 6); loungeCeil.visible = false; loungeCeil.castShadow = true; scene.add(loungeCeil);
const BEANBAGS = [];
function beanbag(x, z, color, idx) { return beanbagDetailed(x, z, color, idx); }
function guitar(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.z = -0.12; scene.add(g);
  const wood = new THREE.MeshStandardMaterial({ color: 0xc98a4f, roughness: 0.5 }), dark = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.6 });
  const part = (r, y, h) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), wood); m.rotation.z = Math.PI / 2; m.position.y = y; m.castShadow = true; g.add(m); return m; };
  part(0.22, 0.32, 0.1); part(0.16, 0.66, 0.1);
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), dark); hole.rotation.z = Math.PI / 2; hole.position.set(0.055, 0.42, 0); g.add(hole);
  box(0.04, 0.9, 0.06, dark, 0, 1.2, 0, g); box(0.05, 0.22, 0.09, dark, 0, 1.76, 0, g);
  return g;
}
{
  rug(-14.2, 5.2, 6.6, 4.4, MAT.carpet);
  tag(sofa(-14.3, 6.6, 0, 3, MAT.fabric2), { type: 'sofa', spots: [0, 1] }); tag(sofa(-18.5, 4.9, -Math.PI / 2, 2.6, MAT.fabric), { type: 'sofa', spots: [2] });
  tag(sofa(-10.6, 4.9, Math.PI / 2, 1.4, MAT.fabric), { type: 'sofa', spots: [3] }); table(-14.3, 4.9, 1.6, 0.9, 0.4);
  shelf(-19.55, 1.6, 3.6, Math.PI / 2, 2.2);
  [[-18.2, 10.5, 0xc9694f], [-16.4, 10.5, 0x7e9a8a]].forEach(([x, z, c]) => box(0.7, 0.03, 1.8, new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }), x, 0.03, z, null, false));
  sph(0.38, new THREE.MeshStandardMaterial({ color: 0x6a9fb5, roughness: 0.5 }), -14.2, 0.38, 11.2);
  const rack = new THREE.Group(); rack.position.set(-9.5, 0, 0.2); rack.rotation.y = Math.PI / 2; scene.add(rack); box(2, 0.05, 0.5, MAT.black, 0, 0.5, 0, rack); box(2, 0.05, 0.5, MAT.black, 0, 0.9, 0, rack); [-0.9, 0.9].forEach((x) => box(0.05, 0.9, 0.5, MAT.black, x, 0.45, 0, rack));
  for (let i = 0; i < 5; i++) [0.65, 1.05].forEach((y) => { const d = cyl(0.06 + (i % 3) * 0.02, 0.06 + (i % 3) * 0.02, 0.28, MAT.metal, -0.7 + i * 0.35, y, 0, rack); d.rotation.z = Math.PI / 2; });
  beanbag(-18.5, 13.1, 0xffe08a, 0); beanbag(-16.9, 13.1, 0xffb8d0, 1); beanbag(-15.3, 13.1, 0xd9d4ec, 2); // macaron lemon / strawberry / lavender-grey

  box(1.0, 0.03, 2.0, new THREE.MeshStandardMaterial({ color: 0x7f93a3, roughness: 0.9 }), -10.25, 0.03, 0.2, null, false); // grey-blue mat in front of the dumbbell rack, same footprint
  { // gym machines against the south wall (z=-2): seated chest press + leg press
    const pad = new THREE.MeshStandardMaterial({ color: 0xd9644f, roughness: 0.7 }), grey = new THREE.MeshStandardMaterial({ color: 0x4a4e57, roughness: 0.5, metalness: 0.3 });
    const cp = new THREE.Group(); cp.position.set(-15.6, 0, -1.35); cp.rotation.y = 0; scene.add(cp); // local -z = toward the wall
    box(0.7, 0.08, 1.3, MAT.black, 0, 0.04, 0.1, cp); box(0.5, 0.12, 0.5, pad, 0, 0.45, -0.05, cp); box(0.5, 0.95, 0.12, pad, 0, 1.0, -0.45, cp).rotation.x = -0.08;
    [-0.3, 0.3].forEach((sx) => { box(0.07, 1.5, 0.07, MAT.black, sx, 0.75, -0.5, cp); box(0.06, 0.06, 0.6, MAT.metal, sx * 1.05, 1.1, -0.1, cp); cyl(0.03, 0.03, 0.16, MAT.black, sx * 1.05, 1.1, 0.25, cp).rotation.z = Math.PI / 2; });
    box(0.32, 1.2, 0.32, grey, 0.55, 0.6, -0.38, cp); box(0.34, 0.1, 0.34, pad, 0.55, 1.25, -0.38, cp);
    const sb = new THREE.Group(); sb.position.set(-13.8, 0, -1.2); scene.add(sb); const red = new THREE.MeshStandardMaterial({ color: 0xc9453a, roughness: 0.5, metalness: 0.2 }); // spin bike: rider faces the room (+z)
    box(0.5, 0.05, 1.1, MAT.black, 0, 0.03, 0.1, sb); cyl(0.3, 0.3, 0.08, grey, 0, 0.4, 0.4, sb).rotation.z = Math.PI / 2; box(0.06, 0.62, 0.06, red, 0, 0.7, 0.4, sb);
    box(0.05, 0.05, 0.75, red, 0, 0.7, 0.05, sb).rotation.x = 0.28; box(0.05, 0.62, 0.05, MAT.metal, 0, 0.82, -0.2, sb); box(0.24, 0.07, 0.32, MAT.black, 0, 1.15, -0.22, sb);
    box(0.05, 0.3, 0.05, MAT.metal, 0, 1.0, 0.55, sb); box(0.5, 0.04, 0.05, MAT.black, 0, 1.17, 0.58, sb); [-0.24, 0.24].forEach((sx) => cyl(0.04, 0.04, 0.12, MAT.black, sx, 0.2, 0.4, sb).rotation.z = Math.PI / 2);
    const lp = new THREE.Group(); lp.position.set(-17.2, 0, -1.3); lp.rotation.y = 0; scene.add(lp);
    [-0.35, 0.35].forEach((sx) => { box(0.08, 0.08, 2.1, MAT.black, sx, 0.06, 0.55, lp); const r = box(0.06, 0.06, 1.35, MAT.metal, sx * 0.86, 0.55, 1.1, lp); r.rotation.x = -0.6; });
    box(0.5, 0.1, 1.0, pad, 0, 0.62, -0.05, lp).rotation.x = 0.7; box(0.5, 0.1, 0.4, pad, 0, 0.3, 0.42, lp);
    const fp = box(0.7, 0.7, 0.06, MAT.metal, 0, 0.92, 1.64, lp); fp.rotation.x = -0.6;
    [-0.42, 0.42].forEach((sx) => { cyl(0.2, 0.2, 0.05, grey, sx, 0.92, 1.64, lp).rotation.z = Math.PI / 2; });
  }
  guitar(-19.6, 10.3);
  { // string lights on the wall above the beanbags (ride on the wall's upper group so they follow its cut-away)
    const wl = WALLS.find((w) => !w.door && w.cz === 14 && w.cx > -20 && w.cx < -9);
    if (wl) {
      const gl = wl.g, zf = 13.8, x0 = -19.7, x1 = -15.95, n = 3, wire = new THREE.MeshStandardMaterial({ color: 0x2b2a27, roughness: 0.8 }), cols = [0xffd9a0, 0xffc4d0, 0xfff1c9];
      const pts = [];
      for (let i = 0; i <= n; i++) { const xa = x0 + (x1 - x0) * i / n; pts.push(new THREE.Vector3(xa, 2.35 - LOW, zf)); if (i < n) { const xm = xa + (x1 - x0) / n / 2; pts.push(new THREE.Vector3(xm, 2.0 - LOW, zf - 0.02)); } }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5); gl.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.008, 5, false), wire));
      [x0, x1].forEach((hx) => { const hk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), MAT.black); hk.rotation.x = Math.PI / 2; hk.position.set(hx, 2.35 - LOW, 13.88); gl.add(hk); });
      const nb = 16; for (let i = 1; i < nb; i++) { const p = curve.getPoint(i / nb), bm = lampMat('lounge'); bm.color.setHex(cols[i % 3]);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), bm); bulb.scale.y = 1.25; bulb.position.set(p.x, p.y - 0.06, p.z); bulb.castShadow = false; gl.add(bulb);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6), wire); cap.position.set(p.x, p.y - 0.01, p.z); gl.add(cap); }
    }
  }
  plant(-9.8, 13.2, 1.1); plant(-9.8, -0.8, 1.0); floorLamp(-19.3, 7.9, 'lounge'); floorLamp(-10, 7.2, 'lounge');
}
applyTime(TIME.h);
const WALK = { fast: false };
