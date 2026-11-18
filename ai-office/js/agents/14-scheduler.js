'use strict';
/* ---------- staff scheduler ---------- */
const nowStr = () => String(Math.floor(TIME.hh ?? 8)).padStart(2, '0') + ':' + String(Math.floor(((TIME.hh ?? 0) % 1) * 60)).padStart(2, '0');
let chatT = 14;
function tickStaff(dt) {
  const now = performance.now();
  chatT -= dt;
  if (chatT <= 0) {
    chatT = 18 + Math.random() * 14;
    const ppl = Object.values(STAFF).filter((s) => s.atDesk && !s.path.length && s.talkUntil < now);
    if (ppl.length >= 2) { const i = Math.floor(Math.random() * ppl.length); const a = ppl[i]; const b = ppl[(i + 1 + Math.floor(Math.random() * (ppl.length - 1))) % ppl.length]; goChat(a, b); a.heading = '前往討論'; }
  }
  for (const id in STAFF) {
    const s = STAFF[id];
    if (s.talkUntil && now > s.talkUntil) { s.talkUntil = 0; s.talkMode = false; if (s.partner) { s.partner = null; goDesk(s); s.heading = '返回座位'; } }
    const inLounge = s.spot != null && !s.path.length;
    let act = s.atDesk ? ((s.thinkUntil || 0) > now ? 'think' : 'work') : 'idle';
    if (s.talkMode && s.talkUntil) act = 'talk';
    else if (inLounge) act = 'rest';
    if (!s.path.length && !s.talkMode) {
      if (inLounge) { if (now > s.restUntil) { goDesk(s); s.heading = '返回座位'; } }
      else if (s.atDesk) {
        if (act !== 'think' && Math.random() < dt * 0.04) s.thinkUntil = now + 4000 + Math.random() * 4000;
        s.idleFor -= dt * (TIME.d < 0.3 ? 2.5 : 1);
        if (s.idleFor < 0) { s.idleFor = 35 + Math.random() * 35; s.restUntil = now + 14000 + Math.random() * 10000; goLounge(s); s.heading = '前往休息室'; }
      } else if (!s.atDesk && !inLounge && !s.moving) goDesk(s);
    }
    s.act = act;
    s.partnerName = s.partner ? STAFF[s.partner].name : null;
  }
}
