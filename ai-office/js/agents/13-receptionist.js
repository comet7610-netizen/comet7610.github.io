'use strict';
/* ---------- receptionist ---------- */
const RECEP = { id: 'rc', name: '接待員', role: '接待員' };
{
  const ch = makeChar({ skin: 0xf0c9a6, hair: 0x4a3326, style: 'bob', top: 0x3f7d5a, bottom: 0x2b2a27 }); Object.assign(RECEP, ch);
  RECEP.root.position.set(4.5, 0, 12.45); RECEP.root.rotation.y = Math.PI; RECEP.label = labelSprite(''); RECEP.root.add(RECEP.label); RECEP.lastLabel = '';
  tag(RECEP.root, { type: 'recep', id: 'rc' });
}
function animateRecep(time) {
  const r = RECEP, wave = (time % 11) > 8.6 ? 1 : 0;
  r.body.position.y = Math.sin(time * 1.6) * 0.006; r.torso.rotation.x = 0.03 * Math.sin(time * 1.3);
  r.head.rotation.y = Math.sin(time * 0.5) * 0.35;
  r.armL.rotation.x = -0.15; r.armL.rotation.z = -0.1;
  r.armR.rotation.x = wave ? -0.3 : -0.15; r.armR.rotation.z = wave ? 2.5 + Math.sin(time * 9) * 0.25 : 0.1;
  const key = r.name + '|'; if (key !== r.lastLabel) { r.label.userData.draw(r.name, '歡迎光臨', false); r.lastLabel = key; }
}
