'use strict';
/* ---------- planning (10 x 8.5, desks 20% closer) ---------- */
const kanbanTex = makeTex(1024, 512, () => {});
{
  rug(-11, -6.2, 8.4, 4.6, MAT.carpet2);
  [[-14.4, 'p1'], [-11, 'p2'], [-7.6, 'p3']].forEach(([x, id]) => { desk(x, -8.2, id, 'plan', { w: 2.3, screens: [['doc', 0.85, 0.5]], papers: true }); chair(x, -6.9, 0, MAT.fabric2); });
  const k = panel(-11, 1.55, -10.28, 4.8, 2.1, kanbanTex, 0, { stand: true });
  const drawWB = (g, w, h) => {
    g.fillStyle = '#fdfdfb'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.035)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); // faint board sheen
    g.fillStyle = '#2b2a27'; g.font = '700 46px "DM Mono",monospace'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('Project Manager', 30, 64);
    g.fillStyle = '#3f7d5a'; g.fillRect(30, 80, 120, 6);
    // timeline with milestones
    g.strokeStyle = '#9aa09c'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 150); g.lineTo(w - 40, 150); g.stroke();
    [['#3f7d5a', 1], ['#3f7d5a', 1], ['#d9902f', 1], ['#fdfdfb', 0], ['#fdfdfb', 0]].forEach(([c, f], i) => { const x = 70 + i * 150; g.beginPath(); g.arc(x, 150, 15, 0, 6.3); g.fillStyle = c; g.fill(); g.lineWidth = 4; g.strokeStyle = f ? c : '#9aa09c'; g.stroke(); });
    // three kanban lanes with sticky notes
    const lanes = [['#f2d45c', '#f29a7a'], ['#8bc4e8', '#a6d9a0'], ['#d9c2f0']];
    lanes.forEach((cols, i) => { const x = 30 + i * 240; g.strokeStyle = '#cfd3cf'; g.lineWidth = 3; rr(g, x, 196, 220, 280, 14); g.stroke(); g.fillStyle = '#e6e9e5'; g.fillRect(x + 16, 214, 90, 10);
      cols.forEach((c, j) => { const nx = x + 18 + j * 6, ny = 240 + j * 108; g.save(); g.translate(nx, ny); g.rotate((j ? 0.03 : -0.035)); g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 8; g.shadowOffsetY = 3; g.fillStyle = c; g.fillRect(0, 0, 184, 92); g.restore();
        g.fillStyle = 'rgba(43,42,39,.35)'; g.fillRect(nx + 16, ny + 28, 120, 6); g.fillRect(nx + 16, ny + 46, 90, 6); }); });
    g.strokeStyle = '#c9694f'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(w - 150, 64); g.bezierCurveTo(w - 120, 30, w - 80, 90, w - 40, 50); g.stroke();
  };
  const wb = makeTex(768, 502, drawWB);
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('700 46px "DM Mono"'), document.fonts.load('500 20px "Noto Sans TC"')]).then(() => { drawWB(wb._g, 768, 502); wb.needsUpdate = true; }).catch(() => {});
  panel(-15.5, 1.4, -3.9, 2.6, 1.7, wb, Math.PI / 2, { back: true, stand: true, frame: MAT.oak });
  plant(-15.2, -2.7, 1.1); plant(-6.7, -9.9, 1.0); plant(-15.2, -9.9, 1.1); floorLamp(-9.2, -4.4, 'plan'); floorLamp(-13, -9.9, 'plan');
}

/* ---------- design ---------- */
{
  const art = makeTex(768, 300, (g, w, h) => { g.fillStyle = '#f1ebdf'; g.fillRect(0, 0, w, h); const c = ['#e8a84a', '#6a9fb5', '#c9694f', '#7e9a8a', '#2b2a27', '#e9d7b8'];
    for (let i = 0; i < 6; i++) { const x = 20 + i * 122; g.fillStyle = c[i]; g.fillRect(x, 24, 104, 140); g.fillStyle = c[(i + 2) % 6]; g.beginPath(); g.arc(x + 52, 94, 30, 0, 6.3); g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, 182, 104, 8); g.fillRect(x, 200, 70, 8); } });
  panel(0, 1.65, -10.28, 6.0, 2.3, art, 0, { stand: true, frame: MAT.oak });
  rug(0, -6, 9, 4.8, MAT.carpet);
  desk(-2.8, -8.2, 'd1', 'design', { w: 2.7, screens: [['art', 1.3, 0.78]], tablet: true });
  desk(2.8, -8.2, 'd2', 'design', { w: 2.7, screens: [['art', 1.0, 0.6]], papers: true });
  chair(-2.8, -6.9, 0, MAT.fabric); chair(2.8, -6.9, 0, MAT.fabric);
  buildPhotoSet(5.1, -3.4, 3.3, -3.4); buildTripodCam(3.3, -3.4, 5.1, -3.4); // against the east wall, clear of the door
  plant(-5.3, -9.9, 1.1); plant(5.4, -9.9, 1.2); plant(-5.3, -2.8, 1.0); floorLamp(0, -9.9, 'design');
  { // low cabinet against the west wall with a paper-size chart above it
    const SER = [
      { L: 'A', W: 1189, H: 841, z: [594, 841, 420, 594, 297, 420, 210, 297, 148, 210, 105, 148, 74, 105], n: 7 },
      { L: 'B', W: 1414, H: 1000, z: [707, 1000, 500, 707, 353, 500, 250, 353, 176, 250, 125, 176], n: 5 },
    ];
    const chart = makeTex(2080, 900, (g, w, h) => {
      g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2a27'; g.fillRect(0, 0, w, 88);
      g.fillStyle = '#fbfaf7'; g.textBaseline = 'middle'; g.font = '700 46px "Noto Sans TC",sans-serif'; g.fillText('印刷尺寸對照　A 系列 ・ B 系列', 40, 46);
      g.textAlign = 'right'; g.font = '500 26px "DM Mono",monospace'; g.fillText('1 模 = 92 × 56 mm　出血每邊 3 mm', w - 40, 46); g.textAlign = 'left';
      SER.forEach((S, si) => {
        const ox = 50 + si * 1010, oy = 130, DW = 940, sc = DW / S.W, DH = S.H * sc;
        let x = 0, y = 0, rw = S.W, rh = S.H; g.lineWidth = 3; g.strokeStyle = '#1d1d1f'; g.textAlign = 'center';
        for (let k = 1; k <= S.n; k++) {
          let px, py, pw, ph;
          if (k % 2 === 1) { pw = rw / 2; ph = rh; px = x + pw; py = y; rw = pw; } else { ph = rh / 2; pw = rw; px = x; py = y + ph; rh = ph; }
          const X = ox + px * sc, Y = oy + py * sc, PW = pw * sc, PH = ph * sc, big = Math.min(PW * 0.5, PH * 0.34, 120), sm = Math.max(11, Math.min(big * 0.3, 30));
          g.fillStyle = '#1d1d1f'; g.strokeRect(X, Y, PW, PH);
          g.font = '500 ' + big + 'px "Noto Sans TC",sans-serif'; g.fillText(S.L + k, X + PW / 2, Y + PH / 2 - sm * 0.6);
          { const t = S.z[(k - 1) * 2] + '×' + S.z[(k - 1) * 2 + 1] + (PW > 200 ? ' mm' : ''), f = Math.min(sm, PW * 0.92 / (t.length * 0.62)); g.font = '500 ' + f + 'px "DM Mono",monospace'; g.fillText(t, X + PW / 2, Y + PH / 2 + big * 0.5); }
        }
        if (S.L === 'B') { const X = ox + x * sc, Y = oy + y * sc, PW = rw * sc, PH = rh * sc, big = Math.min(PW * 0.5, PH * 0.34, 120), sm = Math.max(11, Math.min(big * 0.3, 30)); g.strokeRect(X, Y, PW, PH); g.fillStyle = '#1d1d1f'; g.font = '500 ' + big + 'px "Noto Sans TC",sans-serif'; g.fillText('B6', X + PW / 2, Y + PH / 2 - sm * 0.6); g.font = '500 ' + Math.min(sm, PW * 0.92 / 7) + 'px "DM Mono",monospace'; g.fillText('125×176', X + PW / 2, Y + PH / 2 + big * 0.5); }
        g.lineWidth = 6; g.strokeRect(ox, oy, DW, DH);
        g.fillStyle = '#1d1d1f'; g.font = '700 54px "Noto Sans TC",sans-serif'; g.textAlign = 'left'; g.fillText(S.L + '0', ox + DW - 90, oy + DH + 42); g.font = '500 26px "DM Mono",monospace'; g.textAlign = 'right'; g.fillText(S.H + ' × ' + S.W + ' mm', ox + DW - 110, oy + DH + 42); g.textAlign = 'left';
      });
    });
    tag(panel(-5.96, 1.72, -4.7, 2.6, 1.125, chart, Math.PI / 2, { frame: MAT.black }), { type: 'sizechart', id: 0 });
    const sign = makeTex(900, 153, (g, w, h) => { // name plate above the chart (also clickable)
      g.fillStyle = '#2b2a27'; g.fillRect(0, 0, w, h); g.fillStyle = '#e9b44c'; g.fillRect(0, 0, 14, h);
      g.strokeStyle = '#fbfaf7'; g.lineWidth = 5; rr(g, 46, 30, 70, 90, 10); g.stroke(); g.fillStyle = '#fbfaf7'; g.fillRect(58, 42, 46, 18);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.fillRect(60 + c * 17, 72 + r * 15, 10, 8);
      g.textBaseline = 'middle'; g.font = '700 62px "Noto Sans TC",sans-serif'; g.fillText('印刷模數計算機', 148, 62); g.font = '500 28px "Noto Sans TC",sans-serif'; g.fillStyle = '#e9b44c'; g.fillText('點一下開啟', 150, 114);
    });
    tag(panel(-5.96, 2.62, -4.7, 2.0, 0.34, sign, Math.PI / 2, { frame: MAT.black }), { type: 'sizechart', id: 0 });
    const cab = new THREE.Group(); cab.position.set(-5.68, 0, -4.7); cab.rotation.y = Math.PI / 2; scene.add(cab);
    const cw = 2.6;
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => cyl(0.035, 0.028, 0.14, MAT.black, sx * (cw / 2 - 0.12), 0.07, sz * 0.17, cab, 10)));
    box(cw, 0.56, 0.46, MAT.oak, 0, 0.42, 0, cab); box(cw + 0.06, 0.05, 0.5, MAT.oakDark, 0, 0.725, 0, cab);
    [-1, 1].forEach((sx) => { box(cw / 2 - 0.06, 0.46, 0.02, MAT.oakDark, sx * (cw / 4), 0.42, 0.235, cab); box(0.025, 0.16, 0.03, MAT.black, sx * 0.09, 0.42, 0.26, cab); });
    const ream = new THREE.MeshStandardMaterial({ color: 0xfaf8f2, roughness: 0.9 });
    box(0.3, 0.1, 0.42, ream, -0.85, 0.8, 0, cab); box(0.31, 0.02, 0.43, MAT.black, -0.85, 0.755, 0, cab);
    [[0.5, 0.8, -0.05, 0xe9b44c], [0.62, 0.8, 0.08, 0x6aa5c0]].forEach((r) => { const t = cyl(0.045, 0.045, 0.7, new THREE.MeshStandardMaterial({ color: r[3], roughness: 0.7 }), r[0], r[1], r[2], cab, 14); t.rotation.z = Math.PI / 2; });
  }
}

/* ---------- research (10 x 8.5, one bookcase) ---------- */
{
  rug(11, -6.2, 8.4, 4.6, MAT.carpet2);
  desk(10, -8.2, 'r1', 'research', { w: 2.6, screens: [['chart', 0.8, 0.5], ['code', 0.8, 0.5]], papers: true });
  desk(14, -8.2, 'r2', 'research', { w: 2.6, screens: [['chart', 0.8, 0.5], ['chart', 0.8, 0.5]] });
  chair(10, -6.9, 0, MAT.fabric); chair(14, -6.9, 0, MAT.fabric);
  shelf(7.5, -10.3, 2.2, 0, 2.4);
  const rb = makeTex(768, 330, (g, w, h) => { g.fillStyle = '#e9d7b8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = ['#fbfbf8', '#f2d45c', '#a6d9a0', '#8bc4e8'][i % 4]; g.save(); g.translate(40 + (i % 5) * 140, 40 + Math.floor(i / 5) * 150); g.rotate((i % 3 - 1) * 0.05); g.fillRect(0, 0, 110, 120); g.fillStyle = '#76736a'; for (let k = 0; k < 5; k++) g.fillRect(10, 14 + k * 18, 90 - (k % 2) * 30, 5); g.restore(); }
    g.strokeStyle = '#c9694f'; g.lineWidth = 3; g.beginPath(); g.moveTo(100, 100); g.lineTo(240, 220); g.lineTo(380, 100); g.lineTo(520, 220); g.stroke(); });
  panel(12.6, 1.5, -10.28, 3.8, 1.9, rb, 0, { stand: true });
  plant(15.2, -2.7, 1.2); plant(15.3, -9.9, 1.1); plant(9.7, -2.8, 1.0); floorLamp(11.8, -9.9, 'research'); floorLamp(11.2, -3, 'research');
}

const lampFx = (() => { const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gg = gc.getContext('2d'), gr = gg.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,214,150,1)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
  const o = { lvl: 0, mat: new THREE.MeshStandardMaterial({ color: 0x8e8a82, emissive: 0xffc27a, emissiveIntensity: 0, roughness: 0.5 }),
    coneM: new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    poolM: new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    ledM: new THREE.MeshStandardMaterial({ color: 0x9a978f, emissive: 0xfff3d6, emissiveIntensity: 0, roughness: 0.4 }),
    update(dt) { const k = Math.min(1, Math.max(0, (TIME.d - 0.15) / 0.45)), tgt = 1 - k * k * (3 - 2 * k); this.lvl += (tgt - this.lvl) * 0.12; this.mat.emissiveIntensity = this.lvl * 2; this.coneM.opacity = this.lvl * 0.1; this.poolM.opacity = this.lvl * 0.5; this.ledM.emissiveIntensity = this.lvl * 2.6; } }; return o; })();
const busFx = { tex: null, update(dt) { if (this.tex) this.tex.offset.x = (this.tex.offset.x + dt * 0.08) % 1; } };
