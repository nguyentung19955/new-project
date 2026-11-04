// TURRET MERGE — hiệu ứng: hạt, số sát thương, rung màn, chớp sáng (dùng lại đối tượng, có giới hạn)
'use strict';

const FX = {
  hat: [],        // hạt (tia lửa, bụi, khói…)
  chu: [],        // chữ nổi (sát thương, +mana, +1★)
  anim: [],       // hoạt ảnh dải khung (nổ, băng vỡ, điện…) vẽ 'lighter'
  vong: [],       // vòng sóng (đáp đất, ping radar, nâng cấp)
  rung: 0, rungX: 0, rungY: 0,
  chop: 0, chopMau: '#fff',
  MAX_HAT: 520, MAX_CHU: 70, MAX_ANIM: 90,
  _kho: [], // kho tái dùng hạt

  reset() { this.hat.length = 0; this.chu.length = 0; this.anim.length = 0; this.vong.length = 0; this.rung = 0; this.chop = 0; },

  // hạt: k = 'lua' (tia lửa ảnh tia_lua, cộng sáng), 'bui' (bụi xám), 'khoi' (khói ảnh khoi_*), 'than' (than hồng), 'chamsang'
  hat1(k, x, y, vx, vy, song, co, mau) {
    if (this.hat.length >= this.MAX_HAT) return null;
    const p = this._kho.pop() || {};
    p.k = k; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t = 0; p.song = song; p.co = co; p.mau = mau || '#fff';
    p.g = k === 'bui' ? -20 : (k === 'khoi' ? -26 : (k === 'than' ? -30 : 0)); p.xoay = Math.random() * 6.28; p.vxoay = (Math.random() - 0.5) * 4;
    this.hat.push(p); return p;
  },
  tiaLua(x, y, n, mau, tocDo, co) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random() * 0.8) * (tocDo || 140);
      this.hat1('lua', x, y, Math.cos(a) * v, Math.sin(a) * v, 0.25 + Math.random() * 0.25, (co || 10) * (0.6 + Math.random() * 0.6), mau);
    }
  },
  bui(x, y, n, r) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.3, v = 40 + Math.random() * 50;
      this.hat1('bui', x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, Math.cos(a) * v, Math.sin(a) * v * 0.5, 0.45 + Math.random() * 0.25, 9 + Math.random() * 7);
    }
  },
  khoi(x, y, co, vx, vy) { this.hat1('khoi', x, y, vx || (Math.random() - 0.5) * 10, vy || -12, 0.55, co || 18); },

  chu1(x, y, s, mau, co, kieu) {
    if (this.chu.length >= this.MAX_CHU) this.chu.shift();
    this.chu.push({ x, y, s, mau: mau || '#fff', co: co || 13, t: 0, song: kieu === 'to' ? 1.1 : 0.8, kieu: kieu || '' });
  },
  // dải khung 'fx_<ten>' (6 khung), co = đường kính vẽ (px), goc = xoay
  no(ten, x, y, co, song, goc, bam) {
    if (this.anim.length >= this.MAX_ANIM) this.anim.shift();
    this.anim.push({ ten, x, y, co, t: 0, song: song || 0.42, goc: goc || 0, bam: bam || null });
  },
  vong1(x, y, r0, r1, mau, song, day) { this.vong.push({ x, y, r0, r1, mau, t: 0, song: song || 0.45, day: day || 3 }); },
  lac(m) { this.rung = Math.min(14, Math.max(this.rung, m)); },
  sang(m, mau) { this.chop = Math.max(this.chop, m); this.chopMau = mau || '#fff'; },

  capNhat(dt) {
    for (let i = this.hat.length - 1; i >= 0; i--) {
      const p = this.hat[i]; p.t += dt;
      if (p.t >= p.song) { this._kho.push(p); this.hat[i] = this.hat[this.hat.length - 1]; this.hat.pop(); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt * (p.k === 'lua' ? 0 : 1);
      if (p.k === 'lua') { p.vx *= 1 - dt * 4; p.vy *= 1 - dt * 4; }
      else { p.vx *= 1 - dt * 2.5; }
      p.xoay += p.vxoay * dt;
    }
    for (let i = this.chu.length - 1; i >= 0; i--) { const c = this.chu[i]; c.t += dt; if (c.t >= c.song) this.chu.splice(i, 1); }
    for (let i = this.anim.length - 1; i >= 0; i--) {
      const a = this.anim[i]; a.t += dt;
      if (a.bam && !a.bam.chet) { a.x = a.bam.x; a.y = a.bam.y; }
      if (a.t >= a.song) this.anim.splice(i, 1);
    }
    for (let i = this.vong.length - 1; i >= 0; i--) { const v = this.vong[i]; v.t += dt; if (v.t >= v.song) this.vong.splice(i, 1); }
    this.rung = Math.max(0, this.rung - dt * 38);
    const a = Math.random() * 6.28;
    this.rungX = Math.cos(a) * this.rung * 0.5; this.rungY = Math.sin(a) * this.rung * 0.5;
    this.chop = Math.max(0, this.chop - dt * 2.6);
  },
};
