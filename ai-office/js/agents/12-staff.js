'use strict';
/* ---------- AI staff ---------- */
const STAFF_DEF = [
  { id: 'p1', name: '', dept: 'plan', role: '企劃主責（企劃與內容整合）', skin: 0xf0c9a6, hair: 0x2e2420, style: 'bun', top: 0x7e9a8a, bottom: 0x4b4f57, seat: [-14.4, -6.95] },
  { id: 'p2', name: '', dept: 'plan', role: '內容企劃', skin: 0xe6b894, hair: 0x6b4a32, style: 'long', top: 0xd9a066, bottom: 0x3d4350, seat: [-11, -6.95] },
  { id: 'p3', name: '', dept: 'plan', role: '專案統籌', skin: 0xf3d2b3, hair: 0x1f1f22, style: 'short', top: 0x6a8fb5, bottom: 0x5b5a56, seat: [-7.6, -6.95] },
  { id: 'd1', name: '', dept: 'design', role: '視覺設計師兼美術總監', skin: 0xf0c9a6, hair: 0x8a3b3b, style: 'bob', top: 0xc9694f, bottom: 0x2b2a27, seat: [-2.8, -6.95] },
  { id: 'd2', name: '', dept: 'design', role: '攝影師兼 Mockup 製作', skin: 0xd9a77f, hair: 0x2a2a2a, style: 'short', top: 0x3d4350, bottom: 0xb8956a, seat: [2.8, -6.95] },
  { id: 'r1', name: '', dept: 'research', role: '市場研究', skin: 0xe6b894, hair: 0x3a2d28, style: 'short', top: 0xe8d9b5, bottom: 0x4f6a5a, seat: [10, -6.95] },
  { id: 'r2', name: '', dept: 'research', role: '資料分析', skin: 0xf3d2b3, hair: 0x20262e, style: 'long', top: 0x8ab4c2, bottom: 0x3d4350, seat: [14, -6.95] },
];
const DEPT_NAME = { plan: '企劃部', design: '設計部', research: '研究部' };
const ACT_LABEL = { work: '工作中', think: '思考中', talk: '討論中', rest: '休息中', idle: '待命' };

const STAFF = {};
const LOUNGE_SPOTS = [
  { x: -15.1, z: 6.35, yaw: Math.PI, pose: 'sit' }, { x: -13.5, z: 6.35, yaw: Math.PI, pose: 'sit' },
  { x: -18.2, z: 4.9, yaw: Math.PI / 2, pose: 'sit' }, { x: -10.75, z: 4.9, yaw: -Math.PI / 2, pose: 'sit' },
  { x: -18.2, z: 11.35, yaw: Math.PI, pose: 'stretch' }, { x: -16.4, z: 11.35, yaw: Math.PI, pose: 'stretch' },
  { x: -18.5, z: 13.0, yaw: Math.PI, pose: 'sit', bean: 0 }, { x: -16.9, z: 13.0, yaw: Math.PI, pose: 'sit', bean: 1 }, { x: -15.3, z: 13.0, yaw: Math.PI, pose: 'sit', bean: 2 },
  { x: -10.1, z: -0.2, yaw: Math.PI / 2, pose: 'lift' }, { x: -10.1, z: 0.9, yaw: Math.PI / 2, pose: 'lift' },
  { x: 11.0, z: 10.3, yaw: 0, pose: 'sit', patio: true }, { x: 11.8, z: 10.3, yaw: 0, pose: 'sit', patio: true }, { x: 14.2, z: 10.3, yaw: 0, pose: 'sit', patio: true }, { x: 15.0, z: 10.3, yaw: 0, pose: 'sit', patio: true },
  { x: -7.1, z: 11.95, yaw: Math.PI, pose: 'sit' }, { x: -5.9, z: 11.95, yaw: Math.PI, pose: 'sit' },
];
function seatH(x, z) { // seat-top height under a sitting spot
  if (x > 9 && z > 9 && z < 11.5) return 0.47;           // park benches
  if (x > -8 && x < -5 && z > 11 && z < 13) return 0.57; // reception sofa
  if (x < -14 && z > 12) return 0.42;                  // beanbags
  if (x < -9 && x > -20 && z > 4 && z < 7.5) return 0.57; // lounge sofas
  return 0.54;                                         // desk chairs
}
const NODES = { // exit route from a room to the hub (ordered inside -> hub)
  plan: [[-7.5, -4.4], [-7.5, 0.4]], design: [[0, -4.4], [0, 0.4]], research: [[7.5, -4.4], [7.5, 0.4]],
  lounge: [[-12, 3], [-7.4, 3], [-6.6, 0.4]], hub: [], patio: [[10.4, 11.5], [7.2, 11.5], [7.2, 0.4]], show: [[12, 3], [7.4, 3], [6.6, 0.4]], reception: [],
};
function roomAt(x, z) {
  if (x > 9.2 && z > 9) return 'patio';
  for (const k of ['plan', 'design', 'research', 'lounge', 'show']) { const r = ROOMS[k]; if (x > r.x1 && x < r.x2 && z > r.z1 && z < r.z2) return k; }
  return 'hub';
}
function makeChar(d) {
  const root = new THREE.Group(); scene.add(root);
  const mS = new THREE.MeshStandardMaterial({ color: d.skin, roughness: 0.8 }), mT = new THREE.MeshStandardMaterial({ color: d.top, roughness: 0.85 }),
    mB = new THREE.MeshStandardMaterial({ color: d.bottom, roughness: 0.85 }), mH = new THREE.MeshStandardMaterial({ color: d.hair, roughness: 0.7 }),
    mShoe = new THREE.MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.7 });
  const body = new THREE.Group(); body.position.y = 0; root.add(body);
  const add = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; };
  const HIP = 1.085; // hip height: thigh 0.50 + shin/shoe 0.585, so a seated body can really sit with feet on the floor
  const mkLeg = (sx) => { const hip = new THREE.Group(); hip.position.set(sx * 0.11, HIP, 0); body.add(hip);
    add(new THREE.SphereGeometry(0.092, 12, 10), mB, 0, 0, 0, hip); add(new THREE.CapsuleGeometry(0.088, 0.324, 4, 10), mB, 0, -0.25, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -0.5; hip.add(knee); hip.userData.knee = knee; add(new THREE.SphereGeometry(0.083, 12, 10), mB, 0, 0, 0, knee);
    add(new THREE.CapsuleGeometry(0.076, 0.348, 4, 10), mB, 0, -0.25, 0, knee);
    const shoe = add(new THREE.SphereGeometry(0.08, 14, 10), mShoe, 0, -0.537, 0.06, knee); shoe.scale.set(1, 0.6, 1.85); return hip; };
  const legL = mkLeg(-1), legR = mkLeg(1);
  const torso = new THREE.Group(); torso.position.y = HIP; body.add(torso);
  add(new THREE.CapsuleGeometry(0.19, 0.34, 4, 10), mT, 0, 0.32, 0, torso);
  const mkArm = (sx) => { const sh = new THREE.Group(); sh.position.set(sx * 0.27, 0.58, 0); torso.add(sh);
    add(new THREE.CapsuleGeometry(0.06, 0.4, 4, 8), mT, 0, -0.26, 0, sh); add(new THREE.SphereGeometry(0.065, 10, 8), mS, 0, -0.56, 0, sh);
    const db = new THREE.Group(); db.position.set(0, -0.58, 0); db.visible = false; sh.add(db); const mD = new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: 0.4, metalness: 0.5 });
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), mD, 0, 0, 0, db).rotation.z = Math.PI / 2; [-0.1, 0.1].forEach((dx) => add(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), mD, dx, 0, 0, db).rotation.z = Math.PI / 2); sh.userData.db = db; return sh; };
  const armL = mkArm(-1), armR = mkArm(1);
  const head = new THREE.Group(); head.position.y = 0.88; torso.add(head);
  add(new THREE.SphereGeometry(0.2, 18, 14), mS, 0, 0.12, 0, head);
  add(new THREE.SphereGeometry(0.205, 18, 10, 0, 6.283, 0, 1.45), mH, 0, 0.14, -0.01, head);
  if (d.style === 'long') add(new THREE.SphereGeometry(0.22, 18, 14), mH, 0, -0.02, -0.1, head).scale.set(0.96, 1.4, 0.72);
  if (d.style === 'bob') add(new THREE.SphereGeometry(0.225, 18, 14), mH, 0, 0.06, -0.04, head).scale.set(1.03, 0.86, 0.95);
  if (d.style === 'short') add(new THREE.SphereGeometry(0.1, 12, 10), mH, 0, 0.3, 0.12, head).scale.set(1.5, 0.55, 0.8);
  if (d.style === 'bun') add(new THREE.SphereGeometry(0.1, 10, 8), mH, 0, 0.36, -0.1, head);
  const eye = new THREE.MeshBasicMaterial({ color: 0x1d1d1f });
  add(new THREE.SphereGeometry(0.022, 6, 6), eye, -0.07, 0.12, 0.18, head); add(new THREE.SphereGeometry(0.022, 6, 6), eye, 0.07, 0.12, 0.18, head);
  return { root, body, legL, legR, torso, armL, armR, head };
}
function labelSprite(name) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const t = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); sp.scale.set(1.6, 0.6, 1); sp.renderOrder = 10; sp.position.y = 2.65;
  sp.userData.draw = (nm, label, hot) => { const g = c.getContext('2d'); g.clearRect(0, 0, 256, 96);
    rr(g, 8, 8, 240, 80, 22); g.fillStyle = 'rgba(30,31,33,.82)'; g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center'; let fz = 30; g.font = '700 ' + fz + 'px "Noto Sans TC",sans-serif'; while (g.measureText(nm).width > 218 && fz > 14) { fz -= 2; g.font = '700 ' + fz + 'px "Noto Sans TC",sans-serif'; } g.fillText(nm, 128, 44);
    g.fillStyle = hot ? '#e8a84a' : '#9ad8b6'; g.font = '500 24px "Noto Sans TC",sans-serif'; g.fillText(label, 128, 76); t.needsUpdate = true; };
  return sp;
}

/* thought bubbles: now and then a staff member thinks about the office, design work, or a hobby */
const THOUGHTS = {
  office: ['這間辦公室採光真好', '窗邊看雨好療癒', '龜背芋今天又長高了', '懶骨頭太舒服會睡著', '咖啡香飄過來了', '座位區安靜好專心', '夜晚的燈光好有氣氛', '中央花台是我的充電站', '黃昏的光灑進來最美', '大廳的綠意讓人放鬆'],
  design: ['字距再調 0.5 就完美', '配色再柔一點吧', '出血別忘了留 3 mm', '先算好幾模再報價', '留白也是設計的一部分', '客戶說要「有質感」…', '校色前先看色票', '版面網格對齊了嗎？', 'Mockup 光線再自然點', '這張圖可以再放大一點'],
  dept: { plan: ['企劃案只講三個重點', '時程表要留緩衝', '會議紀錄記得整理'], design: ['這盞光再軟一點', '封面主視覺還差一點', '想試試新的字體'], research: ['樣本數夠不夠？', '這份數據很有趣！', '圖表再簡單一點'] },
  hobby: { p1: ['週末想逛獨立書店', '手帳貼紙又買太多', '最近迷上手沖咖啡'], p2: ['追的劇今晚更新！', '想學烘焙做瑪德蓮', '下班去上瑜伽課'], p3: ['週末要去爬郊山', '想組一台機械鍵盤', '露營裝備又加購了'], d1: ['水彩暈染好療癒', '想去看藝術展', '黑膠唱片又多一張'], d2: ['週末去掃街拍底片', '新鏡頭好想入手', '想去海邊拍日出'], r1: ['週末約球友打羽球', '桌遊之夜要開團', '今天晚餐吃什麼？'], r2: ['跑步配速進步了', '想自學 Python 爬蟲', '貓咪今天有乖嗎'] },
  gym: ['再舉十下！', '今天手感不錯', '啞鈴比想像中重'],
  fest: { m1112: ['聖誕節要交換禮物嗎', '辦公室想擺一棵聖誕樹', '冬至要吃湯圓喔', '跨年去哪裡看煙火', '尾牙抽獎好期待', '聖誕大餐訂位了嗎', '想逛聖誕市集', '跨年夜要倒數嗎'],
    m12: ['尾牙抽到大獎了嗎', '春節紅包包多少好', '年菜要訂哪一家', '過年回家要買伴手禮', '元宵節去看花燈', '大掃除要開始了', '想貼春聯換新年氣氛', '情人節巧克力買了嗎'],
    m34: ['清明連假要出去玩嗎', '兒童節想吃糖果', '連假去賞櫻花', '想去音樂節'], m56: ['端午節吃鹹粽還甜粽', '母親節要訂蛋糕', '龍舟比賽加油！', '想逛夏日市集'],
    m79: ['中元節要拜拜', '七夕要不要約會', '中秋烤肉要準備什麼', '月餅選哪個口味', '想看煙火節'], m10: ['萬聖節要不要變裝', '雙十連假去哪玩', '想參加萬聖節派對', '雙十一購物清單列好了'],
    any: ['公司想辦個團康活動', '週年慶要慶祝一下', '同事生日要訂蛋糕'] },
};
function festPool() { const m = new Date(Date.now() + 8 * 3600e3).getUTCMonth() + 1, F = THOUGHTS.fest; return F.any.concat(m >= 11 ? F.m1112 : m <= 2 ? F.m12 : m <= 4 ? F.m34 : m <= 6 ? F.m56 : m <= 9 ? F.m79 : F.m10); }
function makeBubble() {
  const c = document.createElement('canvas'); c.width = 384; c.height = 128; const t = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, opacity: 0 })); sp.scale.set(2.7, 0.9, 1); sp.renderOrder = 11; sp.position.y = 3.5; sp.raycast = function () {}; sp.visible = false;
  const b = { sp, c, t, text: '', until: 0, next: 3 + Math.random() * 10 };
  b.draw = (txt) => { const g = c.getContext('2d'); g.clearRect(0, 0, 384, 128); g.textAlign = 'center'; g.font = '500 28px "Noto Sans TC",sans-serif';
    const L = txt.length > 9 ? [txt.slice(0, Math.ceil(txt.length / 2)), txt.slice(Math.ceil(txt.length / 2))] : [txt];
    rr(g, 10, 8, 364, 90, 28); g.fillStyle = 'rgba(255,255,255,.95)'; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(60,64,72,.35)'; g.stroke();
    g.beginPath(); g.moveTo(176, 96); g.lineTo(192, 120); g.lineTo(208, 96); g.closePath(); g.fillStyle = 'rgba(255,255,255,.95)'; g.fill();
    g.fillStyle = '#2a2d33'; L.forEach((ln, i) => g.fillText(ln, 192, (L.length === 1 ? 62 : 46) + i * 34)); t.needsUpdate = true; };
  return b;
}
function pickThought(s) {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  if (s.pose === 'lift' && Math.random() < 0.7) return pick(THOUGHTS.gym);
  const r = Math.random();
  if (r < 0.24) return pick(THOUGHTS.office);
  if (r < 0.46) return pick(THOUGHTS.design.concat(THOUGHTS.dept[s.dept]));
  if (r < 0.62) return pick(festPool());
  return pick(THOUGHTS.hobby[s.id]);
}
function updateBubble(s, time, dt) {
  const b = s.bub; if (!b) return;
  if (time > b.next && time > b.until) { b.text = pickThought(s); b.draw(b.text); b.until = time + 4.5 + b.text.length * 0.12; b.next = b.until + 7 + Math.random() * 12; }
  const on = time < b.until, tgt = on ? 1 : 0, m = b.sp.material; m.opacity += (tgt - m.opacity) * Math.min(1, dt * 8); b.sp.visible = m.opacity > 0.02;
  b.sp.position.y = 3.5 + Math.sin(time * 1.5 + s.walkT) * 0.03;
}
STAFF_DEF.forEach((d) => {
  const ch = makeChar(d), s = Object.assign({}, d, ch);
  s.pos = new THREE.Vector3(d.seat[0], 0, d.seat[1]); s.yaw = Math.PI; s.path = []; s.pose = 'sit'; s.act = 'idle'; s.target = null; s.atDesk = true;
  s.walkT = Math.random() * 6; s.idleFor = 4 + Math.random() * 10; s.restUntil = 0; s.talkUntil = 0; s.label = labelSprite(d.name); s.root.add(s.label); s.bub = makeBubble(); s.root.add(s.bub.sp);
  s.lastLabel = ''; s.cur = { sit: 1, armsF: 0, think: 0, talk: 0, cheer: 0, stretch: 0, lift: 0, dog: 0 }; s.log = []; s.partner = null;
  STAFF[d.id] = s;
  s.root.position.copy(s.pos); s.root.rotation.y = s.yaw;
});
function slog(s, text) { const t = String(Math.floor(TIME.hh ?? 8)).padStart(2, '0') + ':' + String(Math.floor(((TIME.hh ?? 0) % 1) * 60)).padStart(2, '0'); s.log.unshift({ t, text }); if (s.log.length > 30) s.log.pop(); }

const APP = 0.6; // stand this far in front of the seat before sitting down
// furniture and colleague footprints (x1, x2, z1, z2, lounge-only): staff walk around them instead of through them
const LOUNGE_OBST = [[-15.85, -12.75, 6.05, 7.15], [-19.05, -17.95, 3.55, 6.25], [-11.15, -10.05, 4.15, 5.65], [-15.15, -13.45, 4.4, 5.4], [-20, -19, -0.3, 3.5], [-9.8, -9.2, -0.85, 1.25], [-18.1, -13, -2, 0.45], [-14.6, -13.8, 10.8, 11.6], [-19.9, -19.3, 10, 10.6]].map(([a, b, c, d]) => [a - 0.32, b + 0.32, c - 0.32, d + 0.32, true]);
function inLounge(p) { return p[0] <= -9.3 && p[0] >= -20 && p[1] >= -2 && p[1] <= 14; }
function segHitsRect(a, b, r) { // does the segment a-b cross the interior of rect r? (Liang-Barsky on a slightly shrunk rect)
  const e = 0.005, x1 = r[0] + e, x2 = r[1] - e, z1 = r[2] + e, z2 = r[3] - e, dx = b[0] - a[0], dz = b[1] - a[1]; let t0 = 0, t1 = 1;
  for (const [p, q] of [[-dx, a[0] - x1], [dx, x2 - a[0]], [-dz, a[1] - z1], [dz, z2 - a[1]]]) { if (p === 0) { if (q < 0) return false; } else { const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } } }
  return t0 < t1;
}
function inRect(p, r) { return p[0] > r[0] && p[0] < r[1] && p[1] > r[2] && p[1] < r[3]; }
function detour(a, b, all) { // shortest way from a to b around the footprints (visibility graph over the padded corners)
  const rects = all.filter((r) => !inRect(a, r) && !inRect(b, r));
  const clear = (p, q) => !rects.some((r) => segHitsRect(p, q, r)); if (clear(a, b)) return [b];
  const nodes = [a, b]; rects.forEach((r) => [[r[0], r[2]], [r[0], r[3]], [r[1], r[2]], [r[1], r[3]]].forEach((c) => { if ((!r[4] || inLounge(c)) && !rects.some((o) => inRect(c, o))) nodes.push(c); }));
  const dist = nodes.map(() => Infinity), prev = nodes.map(() => -1), done = nodes.map(() => false); dist[0] = 0;
  for (;;) { let u = -1; for (let i = 0; i < nodes.length; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i; if (u < 0 || dist[u] === Infinity || u === 1) break; done[u] = true;
    for (let v = 0; v < nodes.length; v++) if (!done[v] && clear(nodes[u], nodes[v])) { const d = dist[u] + Math.hypot(nodes[u][0] - nodes[v][0], nodes[u][1] - nodes[v][1]); if (d < dist[v]) { dist[v] = d; prev[v] = u; } } }
  if (prev[1] < 0) return [b]; const out = []; for (let i = 1; i >= 0 && i !== 0; i = prev[i]) out.unshift(nodes[i]); return out;
}
function avoidFurniture(s, pts) { // every leg also steers around the colleagues standing or sitting in the way
  const bodies = Object.values(STAFF).filter((o) => o !== s && o.pos).map((o) => [o.pos.x - 0.5, o.pos.x + 0.5, o.pos.z - 0.5, o.pos.z + 0.5, false]);
  const out = []; let cur = [s.pos.x, s.pos.z]; for (const p of pts) { const all = (inLounge(cur) && inLounge(p) ? LOUNGE_OBST : []).concat(bodies); detour(cur, p, all).forEach((q) => out.push(q)); cur = p; } return out;
}
function routeTo(s, x, z, yaw, pose, finalSeat) {
  const from = roomAt(s.pos.x, s.pos.z), to = roomAt(x, z), pts = []; s.pendingSit = null;
  if (s.pose === 'sit' || s.pose === 'stretch') { if (s.atDesk || s.exitBack) pts.push([s.pos.x - Math.sin(s.yaw) * APP, s.pos.z - Math.cos(s.yaw) * APP]); else if (s.pose === 'sit') pts.push([s.pos.x + Math.sin(s.yaw) * APP, s.pos.z + Math.cos(s.yaw) * APP]); } // stand up and step out
  if (from !== to) { (NODES[from] || []).forEach((p) => pts.push(p)); (NODES[to] || []).slice().reverse().forEach((p) => pts.push(p)); }
  if (pose === 'sit') pts.push(finalSeat ? [x - Math.sin(yaw) * APP, z - Math.cos(yaw) * APP] : [x + Math.sin(yaw) * APP, z + Math.cos(yaw) * APP]); // walk up to 60 cm from the seat, then sit down
  else pts.push([x, z]);
  s.path = avoidFurniture(s, pts); s.target = { x, z, yaw, pose, back: !!finalSeat }; s.atDesk = false; s.moving = true;
}
function goDesk(s) { if (s.atDeskTarget) return; s.atDeskTarget = true; routeTo(s, s.seat[0], s.seat[1], Math.PI, 'sit', true); }
function goLounge(s) {
  const used = new Set(Object.values(STAFF).map((o) => o.spot).filter((x) => x != null));
  const free = LOUNGE_SPOTS.map((_, k) => k).filter((k) => !used.has(k) && !(LOUNGE_SPOTS[k].patio && WX.rain > 0.3)); let i = free.length ? free[Math.floor(Math.random() * free.length)] : 0;
  const gym = free.filter((k) => LOUNGE_SPOTS[k].pose === 'lift'); if (gym.length && Math.random() < 0.3) i = gym[Math.floor(Math.random() * gym.length)];
  s.spot = i; const sp = LOUNGE_SPOTS[i]; s.atDeskTarget = false; routeTo(s, sp.x, sp.z, sp.yaw, sp.pose, !!sp.back);
  slog(s, sp.pose === 'lift' ? '前往健身區舉啞鈴' : sp.patio ? '前往戶外休息區' : '前往公共休息室');
}
function goChat(s, partner) { // stand on the side of the partner facing us, so we never walk through whoever sits in between
  const side = Math.sign(s.pos.x - partner.seat[0]) || 1;
  s.atDeskTarget = false; s.partner = partner.id; routeTo(s, partner.seat[0] + side * 1.25, partner.seat[1] - 0.2, side > 0 ? -Math.PI / 2 : Math.PI / 2, 'stand', false);
}

const ARM_WORK = -1.15;
function lerpPose(c, t, k) { for (const key in t) c[key] += (t[key] - c[key]) * k; }
function arriveAt(s) { s.moving = false; s.pose = s.target.pose; s.yaw = s.target.yaw; s.sitH = seatH(s.target.x, s.target.z); s.atDesk = s.target.pose === 'sit' && s.atDeskTarget; s.exitBack = !!s.target.back; onArrive(s); }
function animateStaff(s, dt, time) {
  if (!s.path.length && s.pendingSit != null) { // standing 60 cm in front of the seat: turn to it, then sit down
    let dy = s.target.yaw - s.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); s.yaw += dy * Math.min(1, dt * 10); s.pendingSit -= dt;
    if (s.pendingSit <= 0) { s.pendingSit = null; s.pos.x = s.target.x; s.pos.z = s.target.z; arriveAt(s); }
  }
  // movement
  if (s.path.length) {
    const p = s.path[0], dx = p[0] - s.pos.x, dz = p[1] - s.pos.z, dist = Math.hypot(dx, dz);
    const wk = WALK.fast ? 1 / 0.7 : 1, sp = 2.3 * dt * wk;
    if (dist <= sp) { s.pos.x = p[0]; s.pos.z = p[1]; s.path.shift(); if (!s.path.length) { if (s.target.pose === 'sit') { s.pos.x = s.target.x; s.pos.z = s.target.z; } arriveAt(s); } }
    else { s.pos.x += dx / dist * sp; s.pos.z += dz / dist * sp; const ty = Math.atan2(dx, dz); let dy = ty - s.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); s.yaw += dy * Math.min(1, dt * 10); }
    s.walkT += dt * 8 * wk; if (s.path.length && (s.pose === 'sit' || s.pose === 'stretch' || s.pose === 'lift')) s.pose = 'stand'; // only while still walking, so the arrival frame keeps its pose
  }
  const walking = s.path.length > 0;
  const sitting = !walking && s.pose === 'sit';
  const act = s.act;
  if (!walking && s.pose === 'stretch') { if (s.yT0 == null) s.yT0 = time; } else s.yT0 = null;
  const dogNow = !walking && s.pose === 'stretch' && s.yT0 != null && Math.floor((time - s.yT0) / 3.5) % 2 === 1; // yoga mat: alternate standing stretch and downward dog every 5 s (staff clock runs at 0.7x)
  const tg = { sit: sitting ? 1 : 0, think: !walking && act === 'think' ? 1 : 0, talk: !walking && act === 'talk' ? 1 : 0, cheer: 0, stretch: !walking && s.pose === 'stretch' && !dogNow ? 1 : 0, dog: dogNow ? 1 : 0, lift: !walking && s.pose === 'lift' ? 1 : 0, armsF: !walking && (act === 'work') && sitting ? 1 : 0 };
  lerpPose(s.cur, tg, Math.min(1, dt * 7)); s.cur.sit = tg.sit; // sitting down / standing up switches instantly, no blend
  const c = s.cur, w = walking ? 1 : 0, sw = Math.sin(s.walkT) * 0.7 * w;
  const SH = s.sitH || 0.54, HS = SH + 0.06, TH = Math.PI / 2 + Math.asin(Math.max(-1, Math.min(1, (0.585 - HS) / 0.5))); // thigh angle so the sole lands on the floor
  s.body.position.y = (HS - 1.085) * c.sit + Math.abs(Math.sin(s.walkT)) * 0.03 * w + Math.sin(time * 1.6 + s.walkT) * 0.006;
  s.legL.rotation.x = sw * (1 - c.sit) - TH * c.sit; s.legR.rotation.x = -sw * (1 - c.sit) - TH * c.sit;
  s.legL.userData.knee.rotation.x = Math.max(0, -sw) * 0.9 * (1 - c.sit) + TH * c.sit; s.legR.userData.knee.rotation.x = Math.max(0, sw) * 0.9 * (1 - c.sit) + TH * c.sit;
  const typing = Math.sin(time * 14 + s.walkT) * 0.05;
  const talkGest = Math.sin(time * 5 + s.walkT) * 0.25;
  s.armL.rotation.x = -sw * 0.9 * (1 - c.sit) + ARM_WORK * c.armsF + typing * c.armsF - 1.4 * c.cheer - 0.7 * c.think + (-0.5 + talkGest) * c.talk - 1.0 * c.stretch + ARM_WORK * 0.45 * (c.sit - c.armsF);
  s.armR.rotation.x = sw * 0.9 * (1 - c.sit) + ARM_WORK * c.armsF - typing * c.armsF - 1.4 * c.cheer - 2.0 * c.think * 0 + (-0.9 + Math.sin(time * 4) * 0.2) * c.talk - 1.0 * c.stretch + ARM_WORK * 0.45 * (c.sit - c.armsF) - 1.15 * c.think;
  s.armL.rotation.z = -0.08 - 0.5 * c.cheer - 0.9 * c.stretch; s.armR.rotation.z = 0.08 + 0.5 * c.cheer + 0.9 * c.stretch;
  if (c.lift > 0.01) { const ph = time * 3 + s.walkT; s.armL.rotation.x += -c.lift * (0.35 + 1.0 * (0.5 + 0.5 * Math.sin(ph))); s.armR.rotation.x += -c.lift * (0.35 + 1.0 * (0.5 + 0.5 * Math.sin(ph + Math.PI))); s.armL.rotation.z += -0.12 * c.lift; s.armR.rotation.z += 0.12 * c.lift; s.torso.rotation.x -= 0.04 * c.lift; }
  s.armL.userData.db.visible = s.armR.userData.db.visible = c.lift > 0.3;
  s.torso.rotation.x = 0.12 * c.armsF + 0.2 * c.think + 0.05 * Math.sin(time * 1.4) - 0.45 * c.stretch * (0.5 + 0.5 * Math.sin(time * 1.2));
  s.head.rotation.x = 0.18 * c.think + (c.armsF ? Math.sin(time * 0.7 + s.walkT) * 0.05 : 0);
  s.head.rotation.y = c.think * Math.sin(time * 0.8) * 0.5 + c.talk * Math.sin(time * 2.2) * 0.25;
  if (c.dog > 0.01) { // downward dog: legs swept back, torso and straight arms form the other side of the inverted V
    const k = c.dog, mx = (a, b) => a + (b - a) * k, br = Math.sin(time * 1.4) * 0.03;
    s.legL.rotation.x = mx(s.legL.rotation.x, 0.66); s.legR.rotation.x = mx(s.legR.rotation.x, 0.66); s.legL.userData.knee.rotation.x = mx(s.legL.userData.knee.rotation.x, 0); s.legR.userData.knee.rotation.x = mx(s.legR.userData.knee.rotation.x, 0);
    s.torso.rotation.x = mx(s.torso.rotation.x, 2.47 + br); s.armL.rotation.x = mx(s.armL.rotation.x, 3.14); s.armR.rotation.x = mx(s.armR.rotation.x, 3.14);
    s.armL.rotation.z = mx(s.armL.rotation.z, 0); s.armR.rotation.z = mx(s.armR.rotation.z, 0); s.head.rotation.x = mx(s.head.rotation.x, -0.15); s.body.position.y = mx(s.body.position.y, -0.085);
  }
  s.head.position.y = 0.88 - 0.25 * c.dog;
  const dogOff = 0.6 * c.dog; // step forward onto the mat so hands and feet both land on it
  s.root.position.set(s.pos.x + Math.sin(s.yaw) * dogOff, c.cheer * Math.abs(Math.sin(time * 6)) * 0.12, s.pos.z + Math.cos(s.yaw) * dogOff); s.root.rotation.y = s.yaw;
  const lab = walking ? (s.heading || ACT_LABEL[act]) : (s.pose === 'lift' && act === 'rest' ? '健身中' : ACT_LABEL[act]);
  updateBubble(s, time, dt);
  const key = s.name + lab; if (key !== s.lastLabel) { s.label.userData.draw(s.name, lab, false); s.lastLabel = key; }
  // desk monitor glow
  const dk = DESKS[s.id]; if (dk) dk.mats.forEach((m) => { m.emissiveIntensity += (((s.atDesk && (act === 'work' || act === 'think')) ? 0.95 : 0.3) - m.emissiveIntensity) * 0.05; });
}
function onArrive(s) {
  if (s.atDesk) { s.atDeskTarget = true; s.spot = null; if (s.talkWith) { /* arrived back */ } }
  if (s.partner && !s.atDesk && s.target.pose === 'stand') { // reached partner: talk
    const o = STAFF[s.partner]; s.talkUntil = performance.now() + 6500; o.talkUntil = s.talkUntil; o.talkMode = true; s.talkMode = true;
    slog(s, '與 ' + o.name + ' 討論'); slog(o, '與 ' + s.name + ' 討論');
    const [ox, oz] = o.seat; s.yaw = Math.atan2(ox - s.pos.x, oz - s.pos.z);
  }
}

Object.values(STAFF).forEach((s) => { s.name = String(s.role).split(/[（(]/)[0].split('兼')[0].trim(); });
