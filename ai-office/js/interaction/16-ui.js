'use strict';
/* ---------- UI ---------- */
function h(tag, attrs, ...kids) { const e = document.createElement(tag); for (const k in (attrs || {})) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); }
  kids.flat().forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(c))); return e; }
let sel = null; // {type, id}
function renderInspect(force) {
  const box = $('#inspect'); if (!sel) return; box.replaceChildren();
  if (sel.type === 'recep') {
    box.append(h('h3', null, '接待員'), h('div', { class: 'card' },
      h('b', { style: 'font-size:15px' }, '歡迎來到 AI OFFICE'),
      h('div', { style: 'line-height:1.65' }, '這是一間 AI 創意設計公司。入口接待連著中央花台交誼區，從這裡可以走到每個部門。'),
      h('h3', { style: 'margin-top:2px' }, '帶我參觀'),
      h('div', { class: 'row' }, ['hub', 'plan', 'design', 'research', 'show', 'lounge'].map((id) => h('button', { class: 'ghost', onclick: () => focusRoom(id) }, ROOMS[id].name.replace('／AI 總控', ''))))));
  } else if (sel.type === 'room') {
    const r = ROOMS[sel.id], ppl = Object.values(STAFF).filter((s) => roomAt(s.pos.x, s.pos.z) === sel.id);
    box.append(h('h3', null, '房間'), h('div', { class: 'card' }, h('b', { style: 'font-size:15px' }, r.name), h('div', { style: 'color:var(--muted)' }, '目前在此：' + (ppl.length ? ppl.map((s) => s.name).join('、') : '無人'))));
  }
}
function openPortal() { // the "作品集" sign in the showroom links straight to the owner's portfolio
  const m = $('#modal'); m.hidden = false; m.replaceChildren(); const url = 'https://cometonair.tumblr.com';
  m.append(h('div', { class: 'box' }, h('b', { style: 'font-size:16px' }, '個人作品集'), h('div', { style: 'color:var(--muted);line-height:1.6' }, '作品集會在新視窗開啟。'),
    h('div', { style: 'font:12px var(--mono);color:var(--muted);word-break:break-all' }, url),
    h('div', { class: 'row' }, h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', style: 'text-decoration:none;display:inline-block;padding:7px 12px;border-radius:8px;background:var(--accent);color:var(--accent-fg);font-weight:700' }, '開啟作品集 ↗'), h('button', { class: 'ghost', onclick: () => { m.hidden = true; } }, '關閉'))));
}
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') e.target.hidden = true; });
