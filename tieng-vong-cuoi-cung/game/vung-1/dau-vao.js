'use strict';
/* dau-vao.js – bàn phím + nút cảm ứng (đa chạm). Cần trang có #dpad #knob và các nút [data-k]. */
(() => {
  const V1 = window.V1, E = DongCoMN;
  const KEYMAP = {ArrowLeft:'l', KeyA:'l', ArrowRight:'r', KeyD:'r', ArrowUp:'u', KeyW:'u', ArrowDown:'d', KeyS:'d',
    KeyZ:'j', Space:'j', KeyK:'j', KeyX:'a', KeyJ:'a', KeyC:'s', KeyL:'s', ShiftLeft:'s', ShiftRight:'s', KeyV:'h', KeyE:'h', KeyF:'h',
    KeyM:'m', Tab:'m', Enter:'ok', Escape:'thoat'};
  const KEYS = ['l', 'r', 'u', 'd', 'j', 'a', 's', 'h', 'm', 'ok', 'thoat'], kb = {}, tc = {}, I = {}, prevI = {}, latch = {}, ep = {};
  let stickY = 0, dpadId = null;
  V1.KEYS = KEYS; V1.ep = ep; V1.I = I;
  V1.bam = k => !!(I[k] && !prevI[k]);
  addEventListener('keydown', e => {
    const k = KEYMAP[e.code]; if (!k) return;
    if (!kb[k]) latch[k] = 1; kb[k] = 1; setMode(false);
    if (!(e.target && e.target.tagName === 'BUTTON' && (k === 'ok' || k === 'j'))) e.preventDefault();
  });
  addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k){ kb[k] = 0; e.preventDefault(); } });
  const xoa = () => { KEYS.forEach(k => { kb[k] = tc[k] = latch[k] = 0; }); stickY = 0; };
  addEventListener('blur', xoa);
  document.addEventListener('visibilitychange', () => { if (document.hidden) xoa(); });

  V1.docVao = function(){
    for (const k of KEYS){ prevI[k] = I[k]; I[k] = !!(kb[k] || tc[k] || latch[k] || ep[k]); latch[k] = 0; }
    const IN = E.IN, bam = V1.bam;
    IN.l = I.l; IN.r = I.r; IN.j = I.j; IN.a = I.a; IN.s = I.s; IN.h = I.h;
    IN.bamJ = bam('j'); IN.bamA = bam('a'); IN.bamS = bam('s'); IN.bamH = bam('h');
    IN.dPhim = !!(kb.d || ep.d); IN.uPhim = !!(kb.u || ep.u); IN.coCan = dpadId !== null; IN.stickY = stickY;
    I.u = I.u || (dpadId !== null && stickY < -0.7);
    I.d = I.d || (dpadId !== null && stickY > 0.7);
  };
  V1.xoaVao = xoa;

  // ----- cảm ứng: cần trái (← → ↑ ↓) + nút phải (Chém, Nhảy, Lướt, Hồi) – nhiều ngón cùng lúc -----
  const dpad = document.getElementById('dpad'), knob = document.getElementById('knob');
  const geo = {cx:0, cy:0, R:66, btn:[...document.querySelectorAll('#acts [data-k]')].map(b => ({k:b.dataset.k, el:b, x:0, y:0, r:30}))};
  function measure(){
    const rc = dpad.getBoundingClientRect(); geo.cx = rc.left + rc.width / 2; geo.cy = rc.top + rc.height / 2; geo.R = rc.width / 2 || 66;
    for (const b of geo.btn){ const r = b.el.getBoundingClientRect(); b.x = r.left + r.width / 2; b.y = r.top + r.height / 2; b.r = r.width / 2 || 30; }
  }
  V1.measure = measure;
  const prevTc = {}, clampN = (v, a, b) => v < a ? a : v > b ? b : v;
  function onTouch(e){
    if (e.type === 'touchstart') setMode(true);
    if (e.target.closest && e.target.closest('.ui')) return;   // nút giao diện (bản đồ, menu…) tự xử lý bằng click
    e.preventDefault(); if (e.type === 'touchstart') measure();
    for (const k of ['l', 'r', 'u', 'd', 'j', 'a', 's', 'h']){ prevTc[k] = tc[k]; tc[k] = 0; }
    let dT = null;
    for (const t of e.touches){
      if (t.identifier === dpadId){ dT = t; continue; }
      if (dpadId === null && Math.hypot(t.clientX - geo.cx, t.clientY - geo.cy) < geo.R * 1.25 && e.type === 'touchstart'){ dpadId = t.identifier; dT = t; continue; }
      let best = null, bd = 1e9;
      for (const b of geo.btn){ const d = Math.hypot(t.clientX - b.x, t.clientY - b.y); if (d < b.r * 1.25 && d < bd){ bd = d; best = b; } }
      if (best) tc[best.k] = 1;
    }
    let kx = 0, ky = 0; if (!dT){ dpadId = null; stickY = 0; }
    dpad.classList.toggle('act', dpadId !== null);
    if (dT){
      const dx = dT.clientX - geo.cx, dy = dT.clientY - geo.cy, d = Math.hypot(dx, dy);
      if (d > geo.R * 0.2){ tc.r = dx > d * 0.38 ? 1 : 0; tc.l = dx < -d * 0.38 ? 1 : 0; }
      stickY = clampN(dy / (geo.R * 0.55), -1, 1);
      tc.u = stickY < -0.7 ? 1 : 0; tc.d = stickY > 0.7 ? 1 : 0;
      const m = Math.min(d, geo.R * 0.55) / (d || 1); kx = dx * m; ky = dy * m;
    }
    for (const k of ['l', 'r', 'u', 'd', 'j', 'a', 's', 'h']) if (tc[k] && !prevTc[k]) latch[k] = 1;
    knob.style.transform = 'translate3d(' + kx + 'px,' + ky + 'px,0)';
    for (const b of geo.btn) b.el.classList.toggle('on', !!tc[b.k]);
  }
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(t => document.addEventListener(t, onTouch, {passive:false}));
  let touchMode = null;
  function setMode(t){
    if (touchMode === t) return; touchMode = t; document.body.classList.toggle('touch', t);
    const m = Math.min(innerWidth, innerHeight); document.documentElement.style.setProperty('--k', clampN(m / 380, 0.78, 1.22).toFixed(3));
    if (t) requestAnimationFrame(measure);
  }
  V1.camUng = () => touchMode;
  setMode(matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
  addEventListener('resize', () => { if (touchMode) requestAnimationFrame(measure); });
})();
