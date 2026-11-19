'use strict';
/* ---------- printing 模數 calculator (opens from the paper-size chart) ---------- */
let MOLD = { mw: 92, mh: 56, pw: 180, ph: 240, bl: 3 }; try { const sv = JSON.parse(localStorage.getItem('aio-mold') || 'null'); if (sv) MOLD = Object.assign(MOLD, sv); } catch (e) { /* ignore */ }
function moldBest(W, H) {
  const c = (x) => Math.max(1, Math.ceil(x - 1e-4)), a = { cols: c(W / MOLD.mw), rows: c(H / MOLD.mh), w: MOLD.mw, h: MOLD.mh, name: '模橫放' }, b = { cols: c(W / MOLD.mh), rows: c(H / MOLD.mw), w: MOLD.mh, h: MOLD.mw, name: '模直放' };
  a.n = a.cols * a.rows; b.n = b.cols * b.rows; return b.n < a.n ? { win: b, other: a } : { win: a, other: b };
}
function moldSvg(W, H, o) {
  const tw = o.cols * o.w, th = o.rows * o.h, p = Math.max(tw, th) * 0.02; let r = '';
  for (let j = 0; j < o.rows; j++) for (let i = 0; i < o.cols; i++) r += '<rect x="' + (i * o.w) + '" y="' + (j * o.h) + '" width="' + o.w + '" height="' + o.h + '" fill="rgba(11,136,166,.18)" stroke="#0b88a6" stroke-width="1.2" vector-effect="non-scaling-stroke"/>';
  r += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="rgba(200,35,107,.14)" stroke="#c8236b" stroke-width="2" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>';
  return '<svg viewBox="' + (-p) + ' ' + (-p) + ' ' + (tw + 2 * p) + ' ' + (th + 2 * p) + '" style="width:100%;max-height:150px;display:block">' + r + '</svg>';
}
function openMold() {
  const m = $('#modal'); m.hidden = false; m.replaceChildren();
  const box = h('div', { class: 'box', style: 'width:min(560px,100%);max-height:92vh;overflow:auto' }); m.append(box);
  const fld = (id, lab) => '<label style="flex:1;min-width:0;font-size:11px;color:var(--muted)">' + lab + '<input id="mo_' + id + '" type="number" min="0" step="any" inputmode="decimal" value="' + MOLD[id] + '" style="width:100%;margin-top:2px;font:500 15px var(--mono);color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px"></label>';
  box.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between"><b style="font-size:16px">印刷模數計算機</b><button id="mo_x" aria-label="關閉">✕</button></div>' +
    '<div style="color:var(--muted);font-size:12px">單位 mm。算成品要用幾個 1 模拼成，不足一模也算一整模。</div>' +
    '<div style="display:flex;gap:8px;align-items:flex-end">' + fld('mw', '1 模寬') + '<span>×</span>' + fld('mh', '1 模高') + '</div>' +
    '<div style="display:flex;gap:8px;align-items:flex-end">' + fld('pw', '成品寬（不含出血）') + '<span>×</span>' + fld('ph', '成品高') + '</div>' +
    '<div style="display:flex;gap:8px">' + fld('bl', '出血（每邊）') + '</div><div id="mo_out" style="display:flex;flex-direction:column;gap:10px"></div>';
  const out = $('#mo_out');
  const draw = () => {
    const ok = MOLD.mw > 0 && MOLD.mh > 0 && MOLD.pw > 0 && MOLD.ph > 0 && MOLD.bl >= 0; if (!ok) { out.textContent = '請輸入大於 0 的尺寸。'; return; }
    const f = (v) => String(Math.round(v * 100) / 100);
    out.innerHTML = [['不含出血', MOLD.pw, MOLD.ph, 'var(--fg)'], ['含出血', MOLD.pw + 2 * MOLD.bl, MOLD.ph + 2 * MOLD.bl, 'var(--danger)']].map((r) => {
      const res = moldBest(r[1], r[2]), w = res.win;
      return '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,130px);gap:12px;align-items:center;border-top:1px solid var(--line);padding-top:10px"><div><div style="font-size:12px;color:var(--muted)">' + r[0] + '・' + f(r[1]) + ' × ' + f(r[2]) + ' mm</div>' +
        '<div style="font-size:40px;font-weight:700;line-height:1.1;color:' + r[3] + '">' + w.n + '<span style="font-size:16px;font-weight:500;color:var(--muted);margin-left:3px">模</span></div>' +
        '<div style="font:12px/1.7 var(--mono);color:var(--muted)">' + w.name + '：⌈' + f(r[1]) + '÷' + f(w.w) + '⌉ × ⌈' + f(r[2]) + '÷' + f(w.h) + '⌉ = ' + w.cols + ' × ' + w.rows + '<br>另一種（' + res.other.name + '）：' + res.other.n + ' 模</div></div><div>' + moldSvg(r[1], r[2], w) + '</div></div>';
    }).join('');
  };
  ['mw', 'mh', 'pw', 'ph', 'bl'].forEach((id) => $('#mo_' + id).addEventListener('input', (e) => { const v = parseFloat(e.target.value); MOLD[id] = isNaN(v) ? 0 : v; try { localStorage.setItem('aio-mold', JSON.stringify(MOLD)); } catch (er) { /* ignore */ } draw(); }));
  $('#mo_x').addEventListener('click', () => { m.hidden = true; }); draw();
}


/* rooms list + lights */
const ROOM_ORDER = ['reception', 'hub', 'plan', 'design', 'research', 'show', 'lounge'];
ROOM_ORDER.forEach((id) => { $('#roomList').append(h('div', { class: 'r' }, h('button', { class: 'go', onclick: () => focusRoom(id) }, ROOMS[id].name.replace('／AI 總控', '')))); });
const LGROUP = { A: ['reception', 'hub'], B: ['plan', 'design', 'research', 'show', 'lounge'] };
function toggleGroup(k, btn, label) { const on = !roomLights[LGROUP[k][0]].on; LGROUP[k].forEach((id) => { roomLights[id].on = on; }); btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on); btn.title = label + (on ? ' 亮' : ' 滅'); }
$('#lA').onclick = () => toggleGroup('A', $('#lA'), '大廳'); $('#lB').onclick = () => toggleGroup('B', $('#lB'), '辦公室');
function focusRoom(id) { const r = ROOMS[id]; panoOn = false; sel = { type: 'room', id }; renderInspect(); flyTo({ tx: r.cx, ty: 0.5, tz: r.cz, dist: Math.max(r.x2 - r.x1, r.z2 - r.z1) * 1.45 + 6, pol: 0.78 }); setViewBtn(null); }
function setViewBtn(v) { ['vIso', 'vTop', 'vPano'].forEach((k) => $('#' + k).classList.toggle('on', k === v)); }
$('#vIso').onclick = () => { panoOn = false; flyTo({ tx: -1.5, ty: 0.5, tz: 1.8, az: 0.62, pol: 0.82, dist: 52 }); setViewBtn('vIso'); };
$('#vPano').onclick = () => { panoOn = !panoOn; if (panoOn) flyTo({ tx: -1.5, ty: 0.5, tz: 1.8, pol: 0.98, dist: 78 }); setViewBtn(panoOn ? 'vPano' : null); };
$('#vTop').onclick = () => { panoOn = false; flyTo({ tx: -1.5, ty: 0, tz: 1.8, az: 0, pol: 0.03, dist: 56 }); setViewBtn('vTop'); };
$('#kSlow').onclick = () => { WALK.fast = false; $('#kSlow').classList.add('on'); $('#kFast').classList.remove('on'); };
$('#kFast').onclick = () => { WALK.fast = true; $('#kFast').classList.add('on'); $('#kSlow').classList.remove('on'); };
$('#bRoof').onclick = () => { loungeCeil.visible = !loungeCeil.visible; $('#bRoof').textContent = '天花板：' + (loungeCeil.visible ? '顯示' : '隱藏'); };
$('#bDay').onclick = () => setMode('day'); $('#bNight').onclick = () => setMode('night'); $('#bTw').onclick = () => setMode('tw');
$('#wClear').onclick = () => setWeather('clear'); $('#wCloud').onclick = () => setWeather('cloud'); $('#wRain').onclick = () => setWeather('rain');

/* picking */
function pickAt(e) {
  const r = el.getBoundingClientRect(); raycaster.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  for (const hit of hits) { if (hit.object.userData && hit.object.userData.type === 'floor') return { type: 'floor', point: hit.point }; let o = hit.object; const root = o.userData.pickRoot; if (root && root.userData.type) return { type: root.userData.type, id: root.userData.id, spots: root.userData.spots, point: hit.point }; }
  return null;
}
function onPick(e) {
  const p = pickAt(e); if (!p) return; panoOn = false;
  if (p.type === 'floor') { focusRoom(roomAt(p.point.x, p.point.z) === 'hub' && p.point.z > 8 ? 'reception' : roomAt(p.point.x, p.point.z)); return; }
  if (p.type === 'portal') { openPortal(); return; }
  if (p.type === 'sizechart') { openMold(); return; }
  if (p.type === 'beanbag') { sitOn(p.id); return; }
  if (p.type === 'sofa') { sitOnSofa(p.spots); return; }
  sel = { type: p.type, id: p.id }; renderInspect(true);
  if (matchMedia('(max-width:820px)').matches) { document.body.classList.remove('leftOpen'); document.body.classList.add('rightOpen'); $('#rightToggle').setAttribute('aria-expanded', 'true'); }
}
let hoverT = 0;
function hoverCheck(e) { const n = performance.now(); if (n - hoverT < 90) return; hoverT = n; const p = pickAt(e); el.style.cursor = p ? 'pointer' : 'grab'; }
