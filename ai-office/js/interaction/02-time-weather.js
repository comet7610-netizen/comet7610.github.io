'use strict';
/* ---------- day / night + weather (Tainan) ---------- */
const TIME = { h: 21, hh: 21, d: 0, mode: 'tw' };
const WX = { kind: 'clear', c: 0, rain: 0 };
const WX_TARGET = { clear: [0, 0], cloud: [0.65, 0], rain: [1, 1] };
const roomLights = {};
const SKY = {
  day: [new THREE.Color(0x58a4e0), new THREE.Color(0xcfe6f5)],
  dusk: [new THREE.Color(0x35487f), new THREE.Color(0xf0a070)],
  night: [new THREE.Color(0x050918), new THREE.Color(0x16213f)],
  grey: [new THREE.Color(0x8d98a1), new THREE.Color(0xbfc5c9)],
  storm: [new THREE.Color(0x626c75), new THREE.Color(0x8b949a)],
};
const tmpA = new THREE.Color(), tmpB = new THREE.Color(), tmpC = new THREE.Color();
scene.fog = new THREE.Fog(0xcfe6f5, 90, 400);
function dayFactor(h) { return sstep(5.8, 8.2, h) * (1 - sstep(16.8, 19.2, h)); }
function hourNow() { const n = new Date(); return ((n.getUTCHours() + n.getUTCMinutes() / 60 + n.getUTCSeconds() / 3600) + 8) % 24; }

/* window raindrops */
const glassExt = MAT.glass.clone();
const RAINU = { uT: { value: 0 }, uRain: { value: 0 } }; // procedural raindrops that slide down the exterior glass
glassExt.onBeforeCompile = (sh) => {
  sh.uniforms.uT = RAINU.uT; sh.uniforms.uRain = RAINU.uRain;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP; uniform float uT; uniform float uRain;
float hh21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// a lens-like bead: x = body, y = dark rim, z = specular glint
vec3 bead(vec2 d, float R) {
  float l = length(d); float body = smoothstep(R, R * 0.88, l);
  float rim = smoothstep(R * 0.5, R * 0.95, l) * body;
  float gl = smoothstep(R * 0.42, 0.0, length(d - vec2(-0.32 * R, 0.38 * R))) * body;
  float gl2 = smoothstep(R * 0.2, 0.0, length(d - vec2(0.36 * R, -0.4 * R))) * body * 0.5;
  return vec3(body, rim, max(gl, gl2));
}
vec3 slideDrops(vec2 p, float t, float cu, float cv, float dens, float spd, float R) {
  vec2 q = vec2(p.x * cu, p.y * cv); vec2 id = floor(q); vec2 f = fract(q);
  float r = hh21(id); if (r > dens) return vec3(0.0);
  float ph = fract(t * (spd + spd * hh21(id + 3.0)) + r * 7.0);
  ph += 0.03 * sin(ph * 25.0 + r * 9.0);
  float dy = 1.0 - clamp(ph, 0.0, 1.0);
  float dx = 0.5 + (hh21(id + 9.0) - 0.5) * 0.5 + 0.03 * sin(dy * 14.0 + r * 6.0);
  vec2 d = vec2((f.x - dx) / cu, (f.y - dy) / cv);
  vec3 head = bead(vec2(d.x, d.y * 0.8), R * (0.8 + 0.4 * r));
  float above = f.y - dy;
  float tw = R * 0.22 * (0.6 + 0.4 * smoothstep(0.38, 0.0, above));
  float trail = smoothstep(tw, tw * 0.3, abs(d.x)) * step(0.0, above) * smoothstep(0.42, 0.0, above) * 0.45;
  float tgl = smoothstep(tw * 0.5, 0.0, abs(d.x + tw * 0.3)) * step(0.0, above) * smoothstep(0.3, 0.0, above) * 0.12;
  // leftover beads along the path
  float lb = 0.0; float sy = fract(above * 3.0); if (above > 0.0 && above < 0.7) lb = smoothstep(R * 0.4, R * 0.2, length(vec2(d.x * 1.0, (sy - 0.5) / cv / 3.0))) * step(0.92, hh21(id + floor(above * 3.0)));
  return vec3(max(max(head.x, trail), lb * 0.8), head.y, max(head.z, max(tgl, lb * 0.5)));
}
vec3 beads(vec2 p, float sc, float dens, float R) {
  vec2 q = p * sc; vec2 id = floor(q); vec2 f = fract(q) - 0.5; float r = hh21(id);
  if (r > dens) return vec3(0.0); vec2 o = (vec2(hh21(id + 1.0), hh21(id + 2.0)) - 0.5) * 0.45;
  return bead((f - o) / sc, R * (0.55 + 0.7 * r));
}
vec3 rainMask(vec2 wp) {
  vec3 a = slideDrops(wp, uT, 1.8, 0.4, 0.42, 0.04, 0.042);
  vec3 b = slideDrops(wp + vec2(0.37, 0.9), uT, 2.8, 0.5, 0.28, 0.06, 0.032);
  vec3 d = beads(wp, 6.0, 0.1, 0.042);
  return max(max(a, b), d);
}`).replace('#include <dithering_fragment>', `#include <dithering_fragment>
{
  vec3 m = rainMask(vec2(vWP.x + vWP.z, vWP.y)) * uRain;
  vec3 body = mix(gl_FragColor.rgb, vec3(0.70, 0.84, 0.95), m.x * 0.55);
  body *= 1.0 - m.y * 0.22;
  body += vec3(1.0) * m.z * 0.8;
  gl_FragColor.rgb = body;
  gl_FragColor.a = max(gl_FragColor.a, m.x * 0.55 + m.z * 0.4);
}`);
};
glassExt.customProgramCacheKey = () => 'glassExtRain';
let dropsOn = false;
/* rain streaks */
const RAIN_N = 1300, rainPos = new Float32Array(RAIN_N * 6), rainV = new Float32Array(RAIN_N);
function inFoot(x, z) { return x > -20.5 && x < 17.5 && z > -11 && z < 14.5; }
for (let i = 0; i < RAIN_N; i++) { const x = (Math.random() - 0.5) * 90 - 1.5, z = (Math.random() - 0.5) * 70 + 2, y = Math.random() * 40; rainPos.set([x, y, z, x, y + 0.9, z], i * 6); rainV[i] = 26 + Math.random() * 10; }
const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.LineBasicMaterial({ color: 0xcfe0ee, transparent: true, opacity: 0 });
const rainLines = new THREE.LineSegments(rainGeo, rainMat); rainLines.frustumCulled = false; scene.add(rainLines);
function updateRain(dt) {
  rainLines.visible = WX.rain > 0.02; if (!rainLines.visible) return;
  rainMat.opacity = 0.5 * WX.rain * (TIME.d > 0.3 ? 1 : 0.7);
  for (let i = 0; i < RAIN_N; i++) { const k = i * 6; let y = rainPos[k + 1] - rainV[i] * dt; const floor = inFoot(rainPos[k], rainPos[k + 2]) ? 5.4 : 0;
    if (y < floor) { y = 38 + Math.random() * 4; rainPos[k] = rainPos[k + 3] = (Math.random() - 0.5) * 90 - 1.5; rainPos[k + 2] = rainPos[k + 5] = (Math.random() - 0.5) * 70 + 2; }
    rainPos[k + 1] = y; rainPos[k + 4] = y + 0.9; }
  rainGeo.attributes.position.needsUpdate = true;
}

function applyTime(h) {
  h = ((h % 24) + 24) % 24; const hReal = h; // golden hour fixed at Taiwan time 16:00-18:00 (only when following Taiwan time); 3-minute fades: 15:57-16:00 in, 18:00-18:03 out into night
  let gs = 0;
  if (TIME.mode === 'tw' && WX.kind === 'clear') { // overcast / rain: no golden hour at all, and switching weather applies it instantly
    const fin = sstep(15.95, 16, hReal), fout = sstep(18, 18.05, hReal); gs = fin * (1 - fout);
    h = lerp(lerp(hReal, 17.3, fin), Math.max(hReal, 21), fout); // after 18:03 it is night until the natural evening catches up (21:00)
  }
  const c = WX.c, r = WX.rain, d = dayFactor(h);
  const glow = Math.max(gs, clamp(Math.exp(-Math.pow((h - 18.3) / 1.1, 2)) + Math.exp(-Math.pow((h - 6.4) / 1.0, 2)), 0, 1) * (1 - c * 0.7));
  tmpA.copy(SKY.night[0]).lerp(SKY.day[0], d).lerp(SKY.dusk[0], glow * 0.8);
  tmpB.copy(SKY.night[1]).lerp(SKY.day[1], d).lerp(SKY.dusk[1], glow * 0.9);
  tmpC.copy(SKY.grey[0]).lerp(SKY.storm[0], r).multiplyScalar(lerp(0.12, 1, d)); tmpA.lerp(tmpC, c * 0.9);
  tmpC.copy(SKY.grey[1]).lerp(SKY.storm[1], r).multiplyScalar(lerp(0.15, 1, d)); tmpB.lerp(tmpC, c * 0.9);
  skyU.top.value.copy(tmpA); skyU.hor.value.copy(tmpB); scene.background.copy(tmpB); scene.fog.color.copy(tmpB);
  scene.fog.far = lerp(420, 190, c); scene.fog.near = lerp(90, 55, c);
  stars.material.opacity = clamp(1 - d * 1.6, 0, 1) * 0.9 * (1 - c);
  city.material.opacity = clamp(1 - d * 1.4, 0, 1) * (1 - 0.5 * c);
  cloudMat.opacity = 0.15 + 0.55 * d + 0.3 * c * Math.max(d, 0.4); const cg = lerp(1, lerp(0.62, 0.45, r), c);
  cloudMat.color.setRGB(lerp(0.35, 1, Math.max(d, glow * 0.8)) * cg, lerp(0.38, 1, Math.max(d, glow * 0.6)) * cg, lerp(0.5, 1, d) * cg);
  groundM.material.color.setRGB(lerp(0.05, 0.5, d) * (1 - 0.25 * c), lerp(0.07, 0.6, d) * (1 - 0.2 * c), lerp(0.1, 0.5, d) * (1 - 0.2 * c));
  MAT.paving.color.setRGB(lerp(0.5, 0.72, d) * (1 - 0.2 * r), lerp(0.51, 0.71, d) * (1 - 0.2 * r), lerp(0.58, 0.68, d) * (1 - 0.15 * r));
  const a = clamp((h - 6) / 12, -0.15, 1.15) * Math.PI;
  sun.position.set(Math.cos(a) * 70, Math.max(Math.sin(a), 0.14) * 70, 28);
  sun.color.setRGB(1, lerp(0.62, 0.9, d * (1 - glow * 0.5)), lerp(0.4, 0.78, d * (1 - glow * 0.6)));
  sun.intensity = 0.6 * d * (1 - 0.62 * c) * (1 + 0.5 * gs); // strong but not glaring
  if (gs > 0) { sun.color.r = 1; sun.color.g = lerp(sun.color.g, 0.74, gs * (1 - c)); sun.color.b = lerp(sun.color.b, 0.4, gs * (1 - c)); } sun.castShadow = sun.intensity > 0.05;
  const ma = ((h + 6) % 24) / 12 * Math.PI; moon.position.set(Math.cos(ma) * 60, 40 + Math.sin(ma) * 20, -20); moon.intensity = 0.34 * (1 - d) * (1 - 0.6 * c);
  hemi.intensity = lerp(0.75, 0.51, d) * (1 - 0.1 * c);
  hemi.color.setRGB(lerp(0.45, 0.85, d), lerp(0.55, 0.9, d), lerp(0.85, 0.98, d)); hemi.groundColor.setRGB(lerp(0.12, 0.5, d), lerp(0.12, 0.48, d), lerp(0.15, 0.44, d));
  if (gs > 0) hemi.color.lerp(tmpC.setRGB(1, 0.82, 0.62), gs * 0.35);
  [MAT.glass, glassExt].forEach((m) => { m.opacity = lerp(0.42, 0.2, d); m.color.setRGB(lerp(0.35, 0.75, d), lerp(0.45, 0.88, d), lerp(0.6, 0.93, d)); });
  RAINU.uRain.value = Math.min(1, r * 1.6); dropsOn = r > 0.3;
  if (dropsOn) glassExt.opacity = 0.3;
  TIME.d = d; TIME.hh = hReal;
  for (const id in roomLights) roomLights[id].apply(d, c);
  $('#clk').textContent = String(Math.floor(hReal)).padStart(2, '0') + ':' + String(Math.floor((hReal % 1) * 60)).padStart(2, '0');
  $('#phase').textContent = gs > 0.5 ? '黃金夕陽 · 台灣時間' : (hReal >= 8 && hReal < 18 ? '白天' : '夜晚') + (TIME.mode === 'tw' ? ' · 台灣時間' : '');
}
function setMode(m) { TIME.mode = m; if (m === 'day') TIME.h = 11; else if (m === 'night') TIME.h = 21; else TIME.h = hourNow(); applyTime(TIME.h); syncTimeButtons(); }
function syncTimeButtons() { $('#bDay').classList.toggle('on', TIME.mode === 'day'); $('#bNight').classList.toggle('on', TIME.mode === 'night'); $('#bTw').classList.toggle('on', TIME.mode === 'tw'); }
function setWeather(k) { if (!WX_TARGET[k]) k = 'clear'; WX.kind = k; ['clear', 'cloud', 'rain'].forEach((x) => $('#w' + x[0].toUpperCase() + x.slice(1)).classList.toggle('on', x === k)); try { localStorage.setItem('aio-wx', k); } catch (e) { /* ignore */ } }
function stepTime(dt) {
  const [tc, tr] = WX_TARGET[WX.kind]; WX.c += (tc - WX.c) * Math.min(1, dt * 1.2); WX.rain += (tr - WX.rain) * Math.min(1, dt * 1.2);
  if (TIME.mode === 'tw') TIME.h = hourNow();
  applyTime(TIME.h); updateRain(dt); RAINU.uT.value += dt;
}
