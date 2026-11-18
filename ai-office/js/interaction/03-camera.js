'use strict';
/* ---------- orbit camera ---------- */
const CAM = { tx: -1.5, ty: 0.5, tz: 1.8, az: 0.62, pol: 0.82, dist: 52 };
let panoOn = false;
const CAMT = { ...CAM };
let tourOn = false;
function updateCamera() {
  if (panoOn) CAMT.az += 0.0016;
  for (const k of ['tx', 'ty', 'tz', 'az', 'pol', 'dist']) CAM[k] += (CAMT[k] - CAM[k]) * 0.12;
  const sp = Math.sin(CAM.pol), cp = Math.cos(CAM.pol);
  camera.position.set(CAM.tx + Math.sin(CAM.az) * sp * CAM.dist, CAM.ty + cp * CAM.dist, CAM.tz + Math.cos(CAM.az) * sp * CAM.dist);
  camera.lookAt(CAM.tx, CAM.ty, CAM.tz);
  sun.target.position.set(CAM.tx * 0.3, 0, CAM.tz * 0.3);
}
function flyTo(o) { Object.assign(CAMT, o); }
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

let drag = null, pinch = null, pc = null, moved = 0;
function panBy(dx, dy) { const k = CAMT.dist * 0.0016; CAMT.tx -= (Math.cos(CAMT.az) * dx + Math.sin(CAMT.az) * dy) * k; CAMT.tz += (Math.sin(CAMT.az) * dx - Math.cos(CAMT.az) * dy) * k; CAMT.tx = clamp(CAMT.tx, -30, 30); CAMT.tz = clamp(CAMT.tz, -22, 22); }
const el = renderer.domElement;
el.addEventListener('contextmenu', (e) => e.preventDefault());
const ptrs = new Map();
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }; moved = 0; }
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); pc = [(a.x + b.x) / 2, (a.y + b.y) / 2]; }
  tourOn = false; tourBtnSync(); if (panoOn) { panoOn = false; setViewBtn(null); }
});
el.addEventListener('pointermove', (e) => {
  if (!ptrs.has(e.pointerId)) { hoverCheck(e); return; }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2 && pinch) {
    const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
    CAMT.dist = clamp(CAMT.dist * pinch / d, 8, 110); pinch = d; moved = 99;
    const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; if (pc) panBy(cx - pc[0], cy - pc[1]); pc = [cx, cy]; return; // two fingers: pinch zooms, moving both together pans
  }
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
  if (drag.pan) {
    const k = CAMT.dist * 0.0016;
    CAMT.tx -= (Math.cos(CAMT.az) * dx + Math.sin(CAMT.az) * dy) * k; CAMT.tz += (Math.sin(CAMT.az) * dx - Math.cos(CAMT.az) * dy) * k;
    CAMT.tx = clamp(CAMT.tx, -30, 30); CAMT.tz = clamp(CAMT.tz, -22, 22);
  } else { CAMT.az -= dx * 0.006; CAMT.pol = clamp(CAMT.pol - dy * 0.005, 0.03, 1.38); setViewBtn(null); }
});
el.addEventListener('pointerup', (e) => {
  const wasClick = moved < 6 && ptrs.size === 1;
  ptrs.delete(e.pointerId); if (ptrs.size < 2) { pinch = null; pc = null; } if (ptrs.size === 1 && drag) { const r = [...ptrs.values()][0]; drag.x = r.x; drag.y = r.y; } if (ptrs.size === 0) drag = null;
  if (wasClick) onPick(e);
});
el.addEventListener('pointercancel', (e) => { ptrs.delete(e.pointerId); drag = null; pinch = null; pc = null; });
el.addEventListener('wheel', (e) => { e.preventDefault(); CAMT.dist = clamp(CAMT.dist * Math.exp(e.deltaY * 0.0011), 8, 110); }, { passive: false });
