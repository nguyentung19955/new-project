// Trang thử TỰ CỬ ĐỘNG (claude/tu-cu-dong): index.html?xem-cu-dong (mở từ tools/xem-cu-dong.html).
// Vẽ lưới mọi tướng / quái / boss bằng ẢNH ĐƠN (khung idle / walk1 hiện có làm ảnh đơn) chạy đủ trạng thái:
// thở · đánh · tung chiêu · trúng đòn · chết (tướng) — đi · đánh · trúng đòn · nổi giận · chết (quái / boss).
// Tham số: &ma=lactuong,cao,… (chỉ vẽ các mã này) · &tt=attack (giữ một trạng thái) · &nhieu=1 (bộ nhiều khung cũ để so).
// Test điều khiển bằng XEM.pause / XEM.draw(t) để chụp đúng khoảnh khắc.
(function () {
  const q = new URLSearchParams(location.search);
  const HERO_ST = ['idle', 'attack', 'cast', 'hurt', 'die'];
  const ENEMY_ST = ['walk', 'attack', 'hurt', 'die'];
  const ST_NAME = { idle: 'thở', walk: 'đi', attack: 'đánh', cast: 'tung chiêu', hurt: 'trúng đòn', die: 'chết', rage: 'nổi giận' };
  const KIND_NAME = { slash: 'kiếm', chop: 'rìu', thrust: 'giáo', shot: 'cung/nỏ', orb: 'gậy phép', punch: 'tay không' };
  const DUR = 1.6;
  const only = (q.get('ma') || '').split(',').filter(Boolean);
  const pick = (k) => !only.length || only.includes(k);
  const cells = [];
  let id = 1;
  for (const k of Object.keys(HEROES)) {
    if (!pick(k) || !(hasAsset(`packs/${k}/idle.png`) || hasAsset(`${k}.png`))) continue;
    cells.push({ kind: 'hero', type: k, name: HEROES[k].name, h: { type: k, id: id++, tier: 1, equip: {}, level: 1 } });
  }
  for (const k of Object.keys(ENEMIES)) {
    if (!pick(k) || !(hasAsset(`packs/${k}/walk1.png`) || hasAsset(`packs/${k}/idle.png`) || hasAsset(`${k}.png`))) continue;
    const d = ENEMIES[k];
    cells.push({ kind: d.boss ? 'boss' : 'enemy', type: k, name: d.name, e: { type: k, id: id++, def: d, x: 0, y: 0, dir: 1, hp: d.hp, maxHp: d.hp, el: d.el || null } });
  }
  if (q.get('nhieu') === '1') CD.force = false;
  const fixed = q.get('tt');

  const wrap = document.createElement('div');
  wrap.id = 'xem-cu-dong';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#1f2a1c;overflow:auto;font:13px "Alegreya Sans",sans-serif;color:#F2E6C8';
  const bar = document.createElement('div');
  bar.style.cssText = 'position:sticky;top:0;z-index:2;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 12px;background:rgba(13,11,8,.92);border-bottom:1px solid #6b5426';
  bar.innerHTML = `<b style="color:#FFD66B">Tự cử động · ${CD.force ? 'ẢNH ĐƠN' : 'bộ nhiều khung'}</b><span id="xcd-n">${cells.length} nhân vật</span>
    <label>Trạng thái <select id="xcd-st"><option value="">tự đổi</option>${['idle', 'walk', 'attack', 'cast', 'hurt', 'die', 'rage'].map((s) => `<option value="${s}"${s === fixed ? ' selected' : ''}>${ST_NAME[s]}</option>`).join('')}</select></label>
    <span id="xcd-fps">FPS …</span><span style="opacity:.7">mỗi ô đổi trạng thái sau ${DUR} giây (lệch pha giữa các ô)</span>`;
  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block';
  wrap.append(bar, cv);
  document.body.appendChild(wrap);
  const sel = bar.querySelector('#xcd-st');

  let W = 0, CW = 0, CH = 0, cols = 1, dpr = 1;
  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = wrap.clientWidth;
    CW = Math.max(120, Math.min(300, Math.floor(W / Math.max(3, Math.round(W / 240)))));
    cols = Math.max(1, Math.floor(W / CW)); CW = Math.floor(W / cols); CH = Math.round(CW * 1.2);
    const rows = Math.ceil(cells.length / cols);
    cv.width = W * dpr; cv.height = rows * CH * dpr;
    cv.style.width = W + 'px'; cv.style.height = rows * CH + 'px';
  }
  layout();
  addEventListener('resize', layout);

  // trạng thái của ô i lúc t (lệch pha theo ô) → tham số vẽ
  function stateOf(c, i, t) {
    const list = c.kind === 'hero' ? HERO_ST : c.kind === 'boss' ? [...ENEMY_ST.slice(0, 3), 'rage', 'die'] : ENEMY_ST;
    const f = sel.value;
    const tt = t + i * 0.37;
    const st = f ? (c.kind === 'hero' && (f === 'walk' || f === 'rage') ? 'idle' : c.kind !== 'hero' && (f === 'idle' || f === 'cast') ? 'walk' : f)
      : list[Math.floor(tt / DUR) % list.length];
    return { st, tau: f ? tt % DUR : tt % DUR };
  }
  function drawCell(ctx, c, i, t) {
    const x0 = (i % cols) * CW, y0 = Math.floor(i / cols) * CH;
    const { st, tau } = stateOf(c, i, t);
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, CW, CH); ctx.clip();
    ctx.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#2a3a24' : '#26341f'; ctx.fillRect(x0, y0, CW, CH);
    const fx = x0 + CW * 0.45, fy = y0 + CH * 0.88;
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(x0 + 8, fy); ctx.lineTo(x0 + CW - 8, fy); ctx.stroke();
    if (c.kind === 'hero') {
      const h = c.h;
      const o = { t, dir: 1, scale: CH * 0.6 / 236, px: dpr, smooth: false };
      if (st === 'attack') o.swing = Math.max(0, 1 - (tau % 0.8) / 0.55);
      if (st === 'cast') o.castT = Math.max(0, 0.6 - tau * 0.6) * (tau < 1 ? 1 : 0);
      if (st === 'hurt') o.hurt = Math.max(0, 0.2 - (tau % 0.55));
      if (st === 'die') o.fall = Math.max(0.0001, 0.6 - tau * 0.5);
      if (st === 'cast') o.castColor = ELEMENTS[HEROES[h.type].el].color;
      drawHeroSprite(ctx, h, fx, fy, o);
    } else {
      const e = c.e;
      const box = enemyBox(e);
      const z = Math.min(CH * 0.6 / box.h, CW * 0.7 / box.w);
      e.atkT = st === 'attack' ? Math.max(0, 0.45 - (tau % 0.8)) : 0;
      e.hitT = st === 'hurt' ? Math.max(0, 0.12 - (tau % 0.5)) : 0;
      e.kbT = st === 'hurt' ? Math.max(0, 0.14 - (tau % 0.5)) : 0; e.kbDir = 1;
      e.enraged = st === 'rage';
      ctx.save(); ctx.translate(fx, fy); ctx.scale(z, z);
      if (st === 'die') {
        // như hiệu ứng xác quái trong trận (js/main.js 'corpse'): ngã nghiêng, co lại, chìm, mờ dần
        const qd = Math.min(1, tau / 0.9), ease = qd * qd * (3 - 2 * qd);
        ctx.globalAlpha = Math.max(0, 1 - ease * 1.05);
        ctx.translate(0, ease * 10); ctx.rotate(0.9 * ease); ctx.scale(1 - 0.35 * ease, 1 - 0.5 * ease);
        drawEnemy(ctx, { ...e, x: 0, y: 0, hitT: qd < 0.25 ? 0.12 * (1 - qd / 0.25) : 0 }, t, { icon: true, px: dpr * z });
      } else {
        e.x = 0; e.y = 0;
        drawEnemy(ctx, e, t, { px: dpr * z });
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = '#F2E6C8'; ctx.font = '700 12px "Alegreya Sans",sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(c.name, x0 + 6, y0 + 15);
    ctx.font = '11px "Alegreya Sans",sans-serif'; ctx.fillStyle = '#C8B48A';
    const wk = KIND_NAME[cdWeapon(c.type, c.kind === 'hero' ? HEROES[c.type].attack : c.e.def.ranged ? 'arrow' : 'melee')];
    ctx.fillText(`${c.type} · ${wk}`, x0 + 6, y0 + 29);
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFD66B';
    ctx.fillText(ST_NAME[st], x0 + CW - 6, y0 + 15);
  }
  const XEM = window.XEM = { pause: false, frames: 0, fps: 0, cells, t: 0 };
  XEM.draw = function (t) {
    XEM.t = t;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1f2a1c'; ctx.fillRect(0, 0, W, cv.height / dpr);
    // chỉ vẽ ô đang thấy (cuộn)
    const top = wrap.scrollTop, bot = top + wrap.clientHeight;
    cells.forEach((c, i) => { const y0 = Math.floor(i / cols) * CH; if (y0 + CH >= top - CH && y0 <= bot) drawCell(ctx, c, i, t); });
  };
  let last = performance.now(), acc = 0, n = 0;
  function loop(now) {
    if (!XEM.pause) XEM.draw(now / 1000);
    n++; acc += now - last; last = now;
    if (acc > 1000) { XEM.fps = Math.round(n * 1000 / acc); bar.querySelector('#xcd-fps').textContent = 'FPS ' + XEM.fps; n = 0; acc = 0; }
    XEM.frames++;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
