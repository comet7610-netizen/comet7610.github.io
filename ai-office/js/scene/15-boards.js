'use strict';
/* ---------- boards drawn on canvas ---------- */
const FONT = '"Noto Sans TC",sans-serif';
function drawDash() {
  const g = dashTex._g, w = 1024, h = 460; g.fillStyle = '#1c2427'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e9e6dd'; g.font = '700 34px ' + FONT; g.textAlign = 'left'; g.fillText('AI OFFICE', 28, 52);
  g.textAlign = 'right'; g.font = '500 34px "DM Mono",monospace'; g.fillStyle = '#e8a84a'; g.fillText($('#clk').textContent, w - 28, 52); g.textAlign = 'left';
  let y = 100; g.font = '700 20px ' + FONT; g.fillStyle = '#9aa5a8'; g.fillText('員工狀態', 28, y);
  Object.values(STAFF).forEach((s, i) => { const col = i % 4, row = Math.floor(i / 4), x = 28 + col * 242, yy = 122 + row * 78; rr(g, x, yy, 228, 64, 12); g.fillStyle = '#263135'; g.fill();
    g.fillStyle = (s.act === 'rest' || s.act === 'idle') ? '#7b8a8d' : '#6bbf93'; g.beginPath(); g.arc(x + 22, yy + 32, 7, 0, 6.3); g.fill();
    g.fillStyle = '#e9e6dd'; g.font = '500 22px ' + FONT; g.fillText(s.name, x + 40, yy + 29); g.fillStyle = '#9aa5a8'; g.font = '17px ' + FONT; g.fillText(ACT_LABEL[s.act] + ' · ' + DEPT_NAME[s.dept], x + 40, yy + 52); });
  dashTex.needsUpdate = true;
}
function drawKanban() {
  const g = kanbanTex._g, w = 1024, h = 512; g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h);
  const cols = [['待辦', 3], ['進行中', 2], ['完成', 3]], note = ['#f2d57a', '#9fd0b3', '#a9c8e6', '#f0b3a6'];
  cols.forEach(([name, n], i) => { const x = 16 + i * 330; g.fillStyle = '#e3dccb'; rr(g, x, 16, 316, 480, 14); g.fill(); g.fillStyle = '#2b2a27'; g.font = '700 28px ' + FONT; g.fillText(name, x + 18, 54);
    for (let j = 0; j < n; j++) { const y = 74 + j * 138; g.fillStyle = note[(i + j) % 4]; rr(g, x + 14, y, 288, 120, 8); g.fill(); g.fillStyle = 'rgba(43,42,39,.28)'; [28, 56, 84].forEach((o, k) => rr(g, x + 30, y + o, k === 2 ? 140 : 240, 9, 4) || g.fill()); } });
  kanbanTex.needsUpdate = true;
}
