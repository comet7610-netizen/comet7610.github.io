'use strict';
/* ---------- outdoor: grey-brick sidewalk, street trees, outer flower beds ---------- */
{
  const brick = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#9a9890'; g.fillRect(0, 0, w, h); const bw = 64, bh = 32;
    for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) { const x = c * bw + (r % 2 ? bw / 2 : 0), y = r * bh, v = Math.random() * 28 | 0;
      g.fillStyle = 'rgb(' + (205 + v) + ',' + (205 + v) + ',' + (200 + v) + ')'; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
    for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(40,40,40,' + (Math.random() * 0.12) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  }, [54 / 1.6, 38 / 1.6]);
  MAT.paving.map = brick; MAT.paving.needsUpdate = true;
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 1 }), leafA = new THREE.MeshStandardMaterial({ color: 0x4f8f4a, roughness: 0.9 }), leafB = new THREE.MeshStandardMaterial({ color: 0x6aa85a, roughness: 0.9 }), pit = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 1 });
  const trees = new THREE.Group(); scene.add(trees);
  const tree = (x, z, s) => { box(0.9, 0.04, 0.9, pit, x, -0.22, z, trees, false); const t = cyl(0.1 * s, 0.15 * s, 2.3 * s, trunkM, x, 1.15 * s - 0.2, z, trees, 8);
    [[0, 3.0, 0, 1.0, leafA], [0.55, 2.55, 0.2, 0.7, leafB], [-0.5, 2.6, -0.25, 0.75, leafB], [0.1, 3.6, 0.15, 0.7, leafA]].forEach(([dx, y, dz, r2, mt]) => { const m = sph(r2 * 0.95 * s, mt, x + dx * s, y * s - 0.2, z + dz * s, trees); m.scale.y = 0.9; }); };
  const P = [];
  for (let x = -26; x <= 23; x += 6) { P.push([x, 18.6]); P.push([x, -14.6]); }
  for (let z = -8.5; z <= 15.5; z += 6) { P.push([-25.8, z]); P.push([22.8, z]); }
  const T = P.filter(([x, z]) => !(z > 17 && Math.abs(x) < 3.5) && !(x === 22.8 && z === 3.5)); // no tree (and so no bed beside it) where the bus shelter stands
   T.forEach(([x, z], i) => tree(x, z, 0.9 + (i % 3) * 0.1));
  mergeStatic(trees);
  // rectangular flower beds between neighbouring trees (low mixed planting, not round shrubs)
  const beds = new THREE.Group(); scene.add(beds); const curb = new THREE.MeshStandardMaterial({ color: 0xb9b5ab, roughness: 0.9 }), turf = new THREE.MeshStandardMaterial({ color: 0x5d9a4a, roughness: 1 });
  const grassM = [0x4f8f3f, 0x6bae52].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })), bloom = [0xe58fb0, 0xf5f1e6, 0xf2c14e, 0xb59ad8, 0xe8734a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
  let sd = 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const bed = (cx, cz, along, len) => { const w = along ? len : 0.9, d = along ? 0.9 : len;
    box(w, 0.28, d, curb, cx, -0.11, cz, beds, false); box(w - 0.16, 0.06, d - 0.16, turf, cx, 0.04, cz, beds, false);
    const n = Math.round(len * 14); for (let i = 0; i < n; i++) { const u = (rnd() - 0.5) * (len - 0.3), v = (rnd() - 0.5) * 0.6, px = cx + (along ? u : v), pz = cz + (along ? v : u);
      if (rnd() < 0.55) { const f = sph(0.045 + rnd() * 0.02, bloom[(rnd() * 5) | 0], px, 0.16 + rnd() * 0.1, pz, beds); f.castShadow = false; }
      else { const b = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2 + rnd() * 0.1, 4), grassM[(rnd() * 2) | 0]); b.position.set(px, 0.17, pz); beds.add(b); } } };
  const sameLine = (a, b2) => (Math.abs(a[1] - b2[1]) < 0.01 || Math.abs(a[0] - b2[0]) < 0.01);
  for (let i = 0; i < T.length; i++) for (let k = i + 1; k < T.length; k++) { const a = T[i], b2 = T[k]; if (!sameLine(a, b2)) continue;
    const along = Math.abs(a[1] - b2[1]) < 0.01, dist = along ? Math.abs(a[0] - b2[0]) : Math.abs(a[1] - b2[1]);
    if (dist > 6.5 || dist < 3) continue; bed((a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, along, dist - 2.2); }
  mergeStatic(beds);
  // bus shelter on the east sidewalk (cream roof, bench, timetable board, side marquee, arrival light box) + YouBike dock to its south
  const bus = new THREE.Group(); bus.position.set(23.2, -0.25, 0.6); scene.add(bus);
  const BK = new THREE.MeshStandardMaterial({ color: 0x2b2e34, roughness: 0.5, metalness: 0.3 }), CREAM = new THREE.MeshStandardMaterial({ color: 0xefe6d2, roughness: 0.8 }), BW = new THREE.MeshStandardMaterial({ color: 0xb98b5a, roughness: 0.8 });
  [[-0.8, -1.8], [-0.8, 1.8], [0.8, -1.8], [0.8, 1.8]].forEach(([px, pz]) => box(0.08, 2.4, 0.08, BK, px, 1.2, pz, bus, false));
  box(1.9, 0.1, 4.0, CREAM, 0, 2.42, 0, bus, false); box(1.94, 0.04, 4.04, CREAM, 0, 2.49, 0, bus, false);
  box(0.5, 0.05, 2.4, BW, -0.45, 0.5, 0, bus, false); [-1.0, 1.0].forEach((dz) => box(0.05, 0.5, 0.4, BK, -0.45, 0.25, dz, bus, false)); box(0.05, 0.5, 2.4, BW, -0.7, 0.78, 0, bus, false).rotation.z = 0.12;
  box(1.6, 0.03, 3.4, new THREE.MeshBasicMaterial({ color: 0xfff3d6 }), 0, 2.35, 0, bus, false); // service lights under the roof
  const cv2 = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d')); return c; };
  // arrival light box on the roof, facing the street
  const lb = cv2(256, 160, (g) => { g.fillStyle = '#16181c'; g.fillRect(0, 0, 256, 160); g.textBaseline = 'middle';
    [['102', 0], ['15', 1], ['107', 2]].forEach(([n, i]) => { const y = 28 + i * 50; g.fillStyle = '#ffb21a'; g.beginPath(); g.arc(46, y - 3, 11, Math.PI, 0); g.lineTo(58, y + 9); g.lineTo(34, y + 9); g.closePath(); g.fill(); g.beginPath(); g.arc(46, y + 13, 3.5, 0, 6.3); g.fill(); g.font = '700 38px "DM Mono",monospace'; g.fillText(n, 100, y + 2); }); });
  // arrival light box hung under the roof at the south end, readable by buses approaching along the street
  box(1.15, 0.78, 0.1, BK, 0, 2.91, 1.88, bus, false); [-0.4, 0.4].forEach((dx) => box(0.05, 0.06, 0.05, BK, dx, 2.54, 1.88, bus, false));
  [[1.935, 0], [1.825, Math.PI]].forEach(([pz, ry]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.66), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lb) })); m.rotation.y = ry; m.position.set(0, 2.91, pz + (ry ? -0.005 : 0.005)); bus.add(m); });
  // side marquee for people on the bench: scrolling amber text on the south end
  const mq = cv2(1024, 96, (g) => { g.fillStyle = '#101114'; g.fillRect(0, 0, 1024, 96); g.fillStyle = '#ffb21a'; g.font = '700 54px "Noto Sans TC",sans-serif'; g.textBaseline = 'middle'; g.fillText('102 往安平  3 分　15 往圖書館  8 分　107 往地方法院  進站中　', 10, 50); });
  const mtex = new THREE.CanvasTexture(mq); mtex.wrapS = THREE.RepeatWrapping; mtex.repeat.x = 0.5; busFx.tex = mtex;
  box(1.5, 0.42, 0.1, BK, 0, 2.05, -1.8, bus, false); [-0.62, 0.62].forEach((dx) => box(0.05, 0.3, 0.05, BK, dx, 2.3, -1.8, bus, false));
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.3), new THREE.MeshBasicMaterial({ map: mtex })); m.position.set(0, 2.05, -1.745); bus.add(m); }
  // timetable board on a pole that stops under it
  box(0.05, 1.9, 0.05, BK, 1.15, 0.95, -2.4, bus, false);
  const bc = cv2(340, 420, (g3) => { g3.fillStyle = '#fff'; g3.fillRect(0, 0, 340, 420); g3.fillStyle = '#1f5fa8'; g3.fillRect(0, 0, 340, 70); g3.fillStyle = '#fff'; g3.textAlign = 'center'; g3.font = '700 40px "Noto Sans TC",sans-serif'; g3.fillText('公車時刻表', 170, 50); g3.textAlign = 'left';
    [['102', '往安平', '07:10 08:30 12:20 18:05'], ['15', '往圖書館', '07:40 09:00 13:10 18:40'], ['107', '往地方法院', '08:05 10:15 15:20 19:10']].forEach(([r, d, t], i) => { const y = 112 + i * 100; g3.fillStyle = '#1f5fa8'; g3.font = '700 36px "DM Mono",monospace'; g3.fillText(r, 18, y); g3.fillStyle = '#222'; g3.font = '700 26px "Noto Sans TC",sans-serif'; g3.fillText(d, 96, y); g3.font = '500 21px "DM Mono",monospace'; g3.fillText(t, 18, y + 38); g3.fillStyle = '#ddd'; g3.fillRect(16, y + 54, 308, 2); });
    g3.fillStyle = '#888'; g3.font = '500 18px "Noto Sans TC",sans-serif'; g3.fillText('示意時刻，非真實班次', 20, 404); });
  const bsign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.99), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), side: THREE.DoubleSide })); bsign.rotation.y = Math.PI / 2; bsign.position.set(1.18, 2.4, -2.4); bus.add(bsign);
  mergeStatic(bus);
  // YouBike dock south of the shelter: white bikes with orange fenders, wicker baskets, white dock posts
  const yb = new THREE.Group(); yb.position.set(0, -0.25, 4.9); scene.add(yb);
  const WH = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.45 }), OR = new THREE.MeshStandardMaterial({ color: 0xf08a1c, roughness: 0.5 }), TR = new THREE.MeshStandardMaterial({ color: 0x1d1f23, roughness: 0.8 }), BR = new THREE.MeshStandardMaterial({ color: 0x7a4e3a, roughness: 0.9 });
  const tube = (y1, z1, y2, z2, r, m, g) => { const L = Math.hypot(y2 - y1, z2 - z1), t = cyl(r, r, L, m, 0, (y1 + y2) / 2, (z1 + z2) / 2, g, 10); t.rotation.x = Math.atan2(z2 - z1, y2 - y1); return t; };
  const bike = (bx, bz) => { const b = new THREE.Group(); b.position.set(bx, 0, bz); b.rotation.y = Math.PI / 2; yb.add(b); // front wheel points east, into the dock
    [-0.6, 0.55].forEach((wz) => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 10, 28), TR); w.rotation.y = Math.PI / 2; w.position.set(0, 0.345, wz); b.add(w); const hub = cyl(0.05, 0.05, 0.1, WH, 0, 0.345, wz, b, 12); hub.rotation.z = Math.PI / 2; });
    tube(0.36, -0.6, 0.36, 0.1, 0.028, WH, b); tube(0.36, 0.1, 0.68, -0.4, 0.028, WH, b); tube(0.68, -0.4, 0.36, -0.6, 0.028, WH, b); tube(0.36, 0.1, 0.36, 0.55, 0.026, WH, b);
    tube(0.36, -0.6, 1.0, -0.5, 0.026, WH, b); sph(0.05, WH, 0, 1.02, -0.5, b);
    sph(0.09, BR, 0, 1.08, -0.5, b).scale.set(0.8, 0.45, 1.5);
    tube(0.4, 0.1, 1.0, 0.5, 0.026, WH, b); cyl(0.02, 0.02, 0.5, TR, 0, 1.02, 0.5, b, 8).rotation.z = Math.PI / 2;
    const bk = cyl(0.16, 0.13, 0.2, BR, 0, 0.82, 0.68, b, 16); bk.scale.set(1, 1, 1);
    [-0.6, 0.55].forEach((wz) => { const f = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 24, Math.PI), OR); f.rotation.y = Math.PI / 2; f.position.set(0, 0.345, wz); b.add(f); }); };
  const BZ = [-1.0, -0.2, 0.6, 1.4, 2.2];
  const DK2 = new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.6 });
  // wedge-shaped dock post (side view): wide at the foot, narrow at the head, leaning toward the bike
  const wedge = () => { const g = new THREE.BoxGeometry(1, 1, 0.15), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = p.getY(i) + 0.5, w = 0.5 - 0.24 * t, cx = -0.1 * t; p.setX(i, cx + p.getX(i) * w); } g.computeVertexNormals(); return g; };
  const WG = wedge();
  BZ.forEach((z) => { bike(23.1, z);
    const post = new THREE.Mesh(WG, WH); post.position.set(24.2, 0.55, z); post.castShadow = true; yb.add(post);
    box(0.62, 0.05, 0.3, WH, 24.15, 0.05, z, yb, false); // foot plate
    box(0.02, 0.44, 0.11, OR, 23.955, 0.45, z, yb, false); box(0.02, 0.12, 0.1, DK2, 23.965, 0.86, z, yb, false); box(0.012, 0.07, 0.06, new THREE.MeshBasicMaterial({ color: 0x57e08a }), 23.955, 0.86, z, yb, false);
    // wheel cradle at the foot of the post: lock catch plus two cheeks the front tyre rolls between
    box(0.07, 0.16, 0.09, DK2, 23.975, 0.33, z, yb, false);
    [-1, 1].forEach((d) => { box(0.2, 0.3, 0.03, WH, 23.85, 0.2, z + d * 0.075, yb, false); const rp = box(0.34, 0.03, 0.03, WH, 23.72, 0.2, z + d * 0.075, yb, false); rp.rotation.z = -0.45; rp.position.set(23.76, 0.26, z + d * 0.075); }); });
  box(0.9, 0.05, 4.1, WH, 23.75, 0.025, 0.6, yb, false); box(0.34, 0.05, 4.1, WH, 24.2, 0.025, 0.6, yb, false);
  mergeStatic(yb);
}
