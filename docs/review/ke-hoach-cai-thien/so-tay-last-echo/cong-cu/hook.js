(() => {
  Error.stackTraceLimit = 12;
  const P = CanvasRenderingContext2D.prototype;
  const NAMES = ['fillRect', 'strokeRect', 'arc', 'ellipse', 'lineTo', 'fill', 'stroke', 'rect', 'roundRect', 'quadraticCurveTo', 'bezierCurveTo', 'clearRect'];
  const A = window.__AUD = { scene: 'boot', t0: 0, on: true, sites: {}, img: {}, nimg: 0 };
  const re = /\/(?:js\/)?([\w.-]+\.(?:js|html)):(\d+):\d+/;
  function frames() {
    const st = new Error().stack.split('\n');
    const out = [];
    for (let i = 3; i < st.length && out.length < 6; i++) { const m = re.exec(st[i]); if (m) out.push(m[1] + ':' + m[2]); }
    return out;
  }
  for (const n of NAMES) {
    const o = P[n]; if (!o) continue;
    P[n] = function (...a) {
      if (A.on) {
        const f = frames();
        if (f.length) {
          const k = f[0];
          let s = A.sites[k]; if (!s) s = A.sites[k] = { k, t: {}, ops: {}, scenes: {}, callers: {}, main: 0, off: 0, grad: 0, lighter: 0, alpha: 0, styles: {}, area: 0 };
          s.ops[n] = (s.ops[n] || 0) + 1; { const now = performance.now(); const tt = s.t[A.scene] || (s.t[A.scene] = [now - A.t0, 0]); tt[1] = now - A.t0; }
          s.scenes[A.scene] = (s.scenes[A.scene] || 0) + 1;
          if (f[1]) { const ck = f.slice(1).join(' < '); s.callers[ck] = (s.callers[ck] || 0) + 1; }
          const cv = this.canvas; if (cv && (cv.id === 'world' || cv.id === 'ui')) s.main++; else s.off++;
          const fs = (n === 'stroke' || n === 'strokeRect') ? this.strokeStyle : this.fillStyle;
          if (typeof fs !== 'string') s.grad++; else if (Object.keys(s.styles).length < 6) s.styles[fs] = 1;
          if (this.globalCompositeOperation !== 'source-over') s.lighter++;
          if (this.globalAlpha < 0.6) s.alpha++;
          if (n === 'fillRect' || n === 'strokeRect') s.area += Math.abs(a[2] * a[3]);
        }
      }
      return o.apply(this, a);
    };
  }
  const di = P.drawImage;
  P.drawImage = function (...a) { if (A.on) { A.nimg++; A.img[A.scene] = (A.img[A.scene] || 0) + 1; } return di.apply(this, a); };
})();
