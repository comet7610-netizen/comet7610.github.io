'use strict';
/* ---------- boot ---------- */
Object.values(STAFF).forEach((s) => { s.atDeskTarget = true; });
slog(STAFF.p1, '開始今天的工作'); slog(STAFF.d1, '開始今天的工作');
document.fonts && document.fonts.ready.then(() => { Object.values(STAFF).forEach((s) => { s.lastLabel = ''; }); drawKanban(); });
let last = performance.now(), accU = 0, accB = 0, clock = 0;
function frame(nowMs) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (nowMs - last) / 1000); last = nowMs; const sdt = dt * 0.7; clock += sdt; // staff move 30% slower
  stepTime(dt); updateCamera(); updateWalls();
  tickStaff(sdt);
  Object.values(STAFF).forEach((s) => animateStaff(s, sdt, clock)); animateRecep(clock); if (photoFx) photoFx.update(clock); curtainFx.update(clock, sdt); busFx.update(sdt);
  clouds.children.forEach((c) => { c.position.x += c.userData.sp * dt; if (c.position.x > 190) c.position.x = -190; });
  accB += dt; if (accB > 0.6) { accB = 0; drawDash(); }
  accU += dt; if (accU > 1) { accU = 0; if (sel && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('#inspect'))) renderInspect(); }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
setViewBtn('vIso'); setMode('tw'); try { setWeather(localStorage.getItem('aio-wx') || 'clear'); } catch (e) { setWeather('clear'); }

let toastT = 0;
function toast(msg) { const t = $('#hint'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => { t.textContent = '拖曳旋轉 · 滾輪縮放 · 點選房間飛行至該空間'; t.style.display = ''; }, 2600); }
function sitOnSofa(spots) {
  const nm = spots[0] >= 11 && spots[0] <= 14 ? '公園椅' : '沙發';
  const free = spots.filter((k) => !Object.values(STAFF).some((o) => o.spot === k)); if (!free.length) { toast('這張' + nm + '已經坐滿了'); return; }
  const spotIdx = free[0], sp = LOUNGE_SPOTS[spotIdx], now = performance.now();
  let s = sel && sel.type === 'staff' ? STAFF[sel.id] : null;
  if (!s) { const ppl = Object.values(STAFF); s = ppl.find((o) => o.act === 'idle') || ppl.find((o) => o.act !== 'work') || ppl[0]; }
  s.spot = spotIdx; s.holdUntil = s.restUntil = now + 30000; s.atDeskTarget = false; s.talkMode = false; s.talkUntil = 0; s.partner = null; s.heading = '前往' + nm;
  routeTo(s, sp.x, sp.z, sp.yaw, sp.pose, false); slog(s, '坐上' + nm); toast(s.name + ' 去坐' + nm);
}
function sitOn(idx) {
  const spotIdx = 6 + idx, sp = LOUNGE_SPOTS[spotIdx], now = performance.now();
  const taken = Object.values(STAFF).find((o) => o.spot === spotIdx);
  if (taken) { toast(taken.name + ' 已經坐在這個懶骨頭上了'); return; }
  let s = sel && sel.type === 'staff' ? STAFF[sel.id] : null;
  if (!s) { const ppl = Object.values(STAFF); s = ppl.find((o) => o.act === 'idle') || ppl.find((o) => o.act !== 'work') || ppl[0]; }
  s.spot = spotIdx; s.holdUntil = s.restUntil = now + 30000; s.atDeskTarget = false; s.talkMode = false; s.talkUntil = 0; s.partner = null; s.heading = '前往懶骨頭';
  routeTo(s, sp.x, sp.z, sp.yaw, sp.pose, false); slog(s, '坐上' + ['黃色', '粉紅色', '淺灰色'][idx] + '懶骨頭');
  toast(s.name + ' 去坐' + ['黃色', '粉紅色', '淺灰色'][idx] + '懶骨頭');
}
/* layout: keep side panels clear of the top and bottom bars at any width */
{
  const root = document.documentElement, topEl = $('#top');
  const fit = () => { root.style.setProperty('--topH', topEl.offsetHeight + 'px'); root.style.setProperty('--botH', '0px'); };
  fit(); addEventListener('resize', fit); if (window.ResizeObserver) { const ro = new ResizeObserver(fit); ro.observe(topEl); }
  const B = document.body, sync = () => { $('#leftToggle').setAttribute('aria-expanded', B.classList.contains('leftOpen')); $('#rightToggle').setAttribute('aria-expanded', B.classList.contains('rightOpen')); };
  $('#leftToggle').onclick = () => { B.classList.remove('rightOpen'); B.classList.toggle('leftOpen'); sync(); };
  $('#rightToggle').onclick = () => { B.classList.remove('leftOpen'); B.classList.toggle('rightOpen'); sync(); };
  document.querySelectorAll('.sheetClose').forEach((b) => { b.onclick = () => { B.classList.remove('leftOpen', 'rightOpen'); sync(); }; });
  el.addEventListener('pointerdown', () => { B.classList.remove('leftOpen', 'rightOpen'); sync(); });
}
