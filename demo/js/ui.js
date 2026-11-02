// DEMO "Thủ thành ghép tướng" — khung cố định, vòng lặp, điều khiển (chạm/kéo), các màn
'use strict';
(function () {
  const C = CAU_HINH, G = GAME, R = RENDER;
  const $ = (s) => document.querySelector(s);
  const wrap = $('#wrap'), cv = $('#cv'), ctx = cv.getContext('2d');
  let S = null, A = null, tocDo = 1, dung = false, tua = 1, keo = null, chon = [], boCu = null, thang = false;
  const KY_LUC = 'neon-grid.best';

  // ---- khung cố định 390×844 (dọc): scale = min(rộng/390, cao/844), hộp đen hai bên, trừ vùng an toàn (tai thỏ) ----
  const doSafe = document.createElement('div'); doSafe.id = 'do-safe'; document.body.appendChild(doSafe);
  let FR = { cx: C.W / 2, cy: C.H / 2, s: 1 }, K = 1;
  const toFrame = (x, y) => [(x - FR.cx) / FR.s + C.W / 2, (y - FR.cy) / FR.s + C.H / 2];
  const fromFrame = (x, y) => [FR.cx + (x - C.W / 2) * FR.s, FR.cy + (y - C.H / 2) * FR.s];
  function resize() {
    const vv = window.visualViewport;
    const vw = innerWidth, vh = innerHeight;
    const cs = getComputedStyle(doSafe);
    const st = parseFloat(cs.paddingTop) || 0, sr = parseFloat(cs.paddingRight) || 0, sb = parseFloat(cs.paddingBottom) || 0, sl = parseFloat(cs.paddingLeft) || 0;
    const aw = vw - sl - sr, ah = vh - st - sb;
    const s = Math.max(0.2, Math.min(aw / C.W, ah / C.H));
    const cx = sl + aw / 2, cy = st + ah / 2;
    wrap.style.left = Math.round(cx - C.W / 2) + 'px';
    wrap.style.top = Math.round(cy - C.H / 2) + 'px';
    wrap.style.transform = `scale(${s})`;
    FR = { cx, cy, s };
    K = Math.min(4, (window.devicePixelRatio || 1) * s);
    cv.width = Math.round(C.W * K); cv.height = Math.round(C.H * K);
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
    if (vv && Math.abs((vv.scale || 1) - 1) > 0.02) return;
  }
  let rt = [];
  const reflow = () => { resize(); rt.forEach(clearTimeout); rt = [120, 400].map((ms) => setTimeout(resize, ms)); };
  addEventListener('resize', reflow); addEventListener('orientationchange', reflow);
  if (window.visualViewport) visualViewport.addEventListener('resize', reflow);
  addEventListener('scroll', () => { if (scrollX || scrollY) scrollTo(0, 0); }, { passive: true });
  // chặn phóng to / cuộn như game chính
  for (const t of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(t, (e) => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || !e.target.closest('.cuon')) e.preventDefault(); }, { passive: false });
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTouch < 320) e.preventDefault(); lastTouch = n; }, { passive: false });
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  resize();

  // ---- ảnh nhỏ (chân dung) cho thẻ ----
  const veChanDung = R.veChanDung;
  const mauHanh = (el, h) => { el.style.setProperty('--h', h.mau); el.style.setProperty('--hg', h.mau + '55'); };

  // ---- màn chọn bộ ----
  function dungChon() {
    const l = $('#chon-luoi'); l.innerHTML = '';
    for (const id of TUONG_IDS) {
      const t = TUONG[id], h = HANH[t.hanh];
      const b = document.createElement('button');
      b.className = 'ct'; b.dataset.id = id;
      mauHanh(b, h);
      const dmg = Math.min(1, t.dmg / 20), toc = Math.min(1, (1 / t.cd) / 1.25);
      b.innerHTML = `<div class="ct-khung"><div class="ct-trong">
          <canvas class="ct-anh"></canvas>
          <div class="ct-dau"><span class="ct-he"><i></i>${h.ten}</span></div>
          <span class="ct-so"><b></b></span>
          <div class="ct-than">
            <div class="ct-ten">${t.ten}</div>
            <div class="ct-chuc">${t.chuc}</div>
            <div class="ct-cs"><span>DMG</span><i><u style="width:${Math.round(dmg * 100)}%"></u></i></div>
            <div class="ct-cs"><span>RATE</span><i><u style="width:${Math.round(toc * 100)}%"></u></i></div>
            <div class="ct-k"><span class="chip">${t.kieu.toUpperCase()}</span></div>
            <div class="ct-mo">${t.mo}</div>
          </div>
        </div></div>`;
      R.veThe(b.querySelector('canvas'), id, 88, 132);
      b.onclick = () => { const k = chon.indexOf(id); if (k >= 0) chon.splice(k, 1); else if (chon.length < 5) chon.push(id); capChon(); };
      l.appendChild(b);
    }
    capChon();
  }
  function capChon() {
    document.querySelectorAll('.ct').forEach((b) => { const k = chon.indexOf(b.dataset.id); b.classList.toggle('chon', k >= 0); b.querySelector('.ct-so b').textContent = k >= 0 ? k + 1 : ''; });
    $('#chon-dem').textContent = chon.length + '/5';
    $('#nut-vao').disabled = chon.length !== 5;
  }

  // ---- trận ----
  function batDau(deck) {
    boCu = deck.slice();
    S = G.moi(deck); A = G.moi(BO_AI, true, S); dung = false; keo = null; thang = false;
    $('#chon').hidden = true; $('#ketqua').hidden = true; $('#dung').hidden = true;
    $('#top').hidden = false; $('#duoi').hidden = false;
    // 6 ô đội AI trên TOP HUD (5 tướng + leader)
    const ai = $('#tb-ai'); ai.innerHTML = '';
    for (const id of BO_AI) { const o = document.createElement('div'); o.className = 'ai-o'; mauHanh(o, HANH[TUONG[id].hanh]); o.innerHTML = '<canvas></canvas>'; R.veChanDung(o.querySelector('canvas'), id, 26); ai.appendChild(o); }
    { const o = document.createElement('div'); o.className = 'ai-o ld'; o.textContent = 'LEAD'; ai.appendChild(o); }
    const bo = $('#bo-bac'); bo.innerHTML = '';
    deck.forEach((id, n) => {
      const t = TUONG[id], h = HANH[t.hanh];
      const b = document.createElement('button');
      b.className = 'the'; b.dataset.act = 'bac'; b.dataset.id = id; b.title = `${t.ten} — power up`;
      mauHanh(b, h);
      b.style.left = (8 + n * 60) + 'px';
      b.innerHTML = `<canvas></canvas><span class="bac"></span><span class="ten">${t.ten}</span><span class="gia"></span>`;
      R.veThe(b.querySelector('canvas'), id, 49, 60);
      bo.appendChild(b);
    });
    capNhat(true);
  }
  let cu = {};
  function capNhat(ep) {
    if (!S) return;
    const set = (k, v, f) => { if (ep || cu[k] !== v) { cu[k] = v; f(v); } };
    set('dot', S.dot, (v) => ($('#tb-dot').textContent = Math.max(1, v)));
    const den = Math.ceil(Math.max(1, S.dot + (S.dot % 10 === 0 && S.boss ? 0 : 0.0001)) / 10) * 10;
    set('boss', S.boss ? 'dang' : den - S.dot, (v) => { const e = $('#tb-boss'); e.textContent = v === 'dang' ? '⚠ BOSS LIVE' : v <= 0 ? 'BOSS THIS WAVE' : `BOSS IN ${v} WAVE${v > 1 ? 'S' : ''}`; e.classList.toggle('dang', v === 'dang'); });
    set('quai', S.quai.length + S.conSinh, (v) => ($('#tb-quai b').textContent = v));
    const lk = Math.floor(S.lk);
    set('lk', lk, (v) => { $('#lk').textContent = v; $('#lk-hop b').classList.toggle('dai', v >= 10000); });
    const g = G.giaTrieu(S), full = !G.trong(S).length;
    set('trieu', g + '|' + (lk >= g) + full, () => { $('#gia-trieu').textContent = full ? 'GRID FULL' : g; $('#nut-trieu .tr-gia .ic-e').hidden = full; $('#nut-trieu').classList.toggle('thieu', lk < g || full); });
    document.querySelectorAll('.the').forEach((b) => {
      const id = b.dataset.id, bac = S.bac[id], gb = G.giaBac(S, id), mx = bac >= C.BAC_MAX;
      set('b' + id, bac + '|' + (lk >= gb), () => {
        b.querySelector('.bac').textContent = 'LV ' + (bac + 1);
        b.querySelector('.gia').textContent = mx ? 'MAX' : gb;
        b.classList.toggle('thieu', !mx && lk < gb); b.classList.toggle('max', mx);
      });
    });
  }
  function ketThuc() {
    const dot = S.dot;
    const ten = $('#kq-ten'), bang = $('#ketqua .bang');
    ten.textContent = thang ? 'VICTORY' : 'CORE DESTROYED'; ten.dataset.t = ten.textContent;
    bang.classList.toggle('do', !thang); bang.classList.toggle('thang', thang);
    let kl = 0; try { kl = +localStorage.getItem(KY_LUC) || 0; if (dot > kl) localStorage.setItem(KY_LUC, dot); } catch (e) { /* không lưu được */ }
    $('#kq-dot').textContent = 'WAVE ' + dot;
    $('#kq-phu').textContent = `${thang ? 'AI MIRROR core destroyed first · ' : ''}${S.giet} hostiles destroyed · Best: wave ${Math.max(kl, dot)}${dot > kl && kl ? ' — NEW RECORD' : ''}`;
    $('#ketqua').hidden = false;
  }
  function datDung(v) {
    dung = v; $('#dung').hidden = !v;
    if (v && S) $('#dung-bo').innerHTML = S.deck.map((id) => `${TUONG[id].ten} <b>LV ${S.bac[id] + 1}</b>`).join(' · ');
  }

  // ---- nút ----
  wrap.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'vao') batDau(chon);
    else if (a === 'ngaunhien') { chon = TUONG_IDS.slice().sort(() => Math.random() - 0.5).slice(0, 5); capChon(); }
    else if (a === 'trieu' && S && !dung) { G.trieuHoi(S); capNhat(); }
    else if (a === 'bac' && S && !dung) { if (G.lenBac(S, b.dataset.id)) { b.classList.remove('len'); void b.offsetWidth; b.classList.add('len'); } capNhat(); }
    else if (a === 'tocdo') { tocDo = tocDo === 1 ? 2 : 1; b.textContent = tocDo + 'x'; b.classList.toggle('bat', tocDo === 2); }
    else if (a === 'dung' && S && !S.het) datDung(true);
    else if (a === 'tiep') datDung(false);
    else if (a === 'bo') { datDung(false); S.het = true; ketThuc(); }
    else if (a === 'choilai') batDau(boCu);
    else if (a === 'doibo') { S = null; A = null; $('#ketqua').hidden = true; $('#top').hidden = true; $('#duoi').hidden = true; $('#chon').hidden = false; chon = boCu.slice(); capChon(); }
  });

  // ---- kéo tướng để gộp ----
  // hitbox ô theo toạ độ logic của bàn người chơi (ô 46×45, nới 1px vào khe)
  const oTai = (x, y) => { for (let i = 0; i < C.COT * C.HANG; i++) { const [ox, oy] = G.oXY(S, i); if (x >= ox - 1 && x < ox + C.O + 1 && y >= oy - 1.5 && y < oy + C.OH + 1.5) return i; } return -1; };
  cv.addEventListener('pointerdown', (e) => {
    if (!S || S.het || dung) return;
    const [x, y] = toFrame(e.clientX, e.clientY), i = oTai(x, y);
    if (i < 0 || !S.o[i] || S.o[i].da) return;
    keo = { i, x, y, id: e.pointerId };
    try { cv.setPointerCapture(e.pointerId); } catch (er) { /* bỏ qua */ }
  });
  cv.addEventListener('pointermove', (e) => { if (!keo || e.pointerId !== keo.id) return; [keo.x, keo.y] = toFrame(e.clientX, e.clientY); });
  const tha = (e) => {
    if (!keo || e.pointerId !== keo.id) return;
    const [x, y] = toFrame(e.clientX, e.clientY), j = oTai(x, y);
    if (S && j >= 0 && S.o[keo.i] === S.o[keo.i]) G.tha(S, keo.i, j);
    keo = null; capNhat();
  };
  cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', () => (keo = null));

  // ---- vòng lặp ----
  let last = performance.now(), dem = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    R.doFps(now - last);
    let dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S && !S.het && !dung) {
      let t = dt * tocDo * tua;
      while (t > 0) {
        const b = Math.min(1 / 60, t); G.buoc(S, b); G.buoc(A, b); G.botAI(A, b); t -= b;
        if (A.het && !S.het) { thang = true; S.het = true; }   // AI hết mạng trước → thắng
        if (S.het) break;
      }
      if (keo && !S.o[keo.i]) keo = null;   // tướng bị boss cuốn đi khi đang kéo
      if (S.het) ketThuc();
    }
    if (++dem % 3 === 0 || !S) capNhat();
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    R.ve(ctx, S, now / 1000, K, keo, A);
  }
  dungChon();
  requestAnimationFrame(loop);

  // móc cho test
  window.DEMO = {
    get S() { return S; }, get A() { return A; }, G, batDau, fromFrame, toFrame,
    oClient: (i) => { const [x, y] = G.oTam(S, i); return fromFrame(x, y); },
    tua: (n) => (tua = n), get dung() { return dung; }, get thang() { return thang; },
  };
})();
