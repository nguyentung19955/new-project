// TURRET MERGE — GLR: lớp vẽ WebGL của màn trận (đợt 1: quái + thanh máu + đạn + tia laser). Tài liệu: docs/demo-hop-tuong/tuvan/webgl/KE-HOACH.md
//  · CHỈ HÌNH: không đụng luật / mô phỏng / Math.random. Tắt: ?gl=0 · ép bật: ?gl=1 (kể cả GPU phần mềm) · ?glv=1 ép WebGL1.
//  · Mặc định BẬT khi tạo được ngữ cảnh WebGL có GPU thật (failIfMajorPerformanceCaveat) và tự kiểm đạt; không thì REN vẽ 2D như cũ.
//  · Mất ngữ cảnh (webglcontextlost) → ngay khung sau REN vẽ 2D như cũ; có lại (webglcontextrestored) → dựng lại, vẽ GL tiếp.
//  · Không dùng localStorage. Không thư viện ngoài. WebGL1 là đủ (WebGL2 có thì dùng, cùng shader GLSL ES 1.0).
// CÁCH DÙNG: GLR.x là "ngữ cảnh giả" có cùng tập lệnh canvas 2D mà phần vẽ ảnh của game dùng (save/restore/translate/rotate/scale/
//   setTransform/getTransform/globalAlpha/globalCompositeOperation 'source-over'|'lighter'/drawImage 3-5-9 tham số/clip hình chữ nhật)
//   → hàm vẽ cũ (REN.veQuai, REN.veDan, PX.ve, REN.anhGiua…) nhận GLR.x thay cho ctx là chạy, toán học giữ nguyên.
//   Lệnh vector (fill/stroke/arc/chữ/gradient/bóng/filter) KHÔNG có: gọi vào thì bỏ qua + đếm ở GLR.thieu (để rà lúc chuyển đợt sau).
//   GLR.sprite(img, x, y, w, h, goc, alpha) = vẽ ảnh tâm (x, y) — tiện cho code mới.
// GOM LÔ: mọi ảnh tĩnh ≤ 512² điểm nhét vào atlas 2048² (≤ 3 trang, dựng dần lúc ảnh được vẽ lần đầu); ảnh lớn = texture riêng;
//   canvas vẽ lại mỗi khung (đánh dấu c._glD = 1, hoặc canvas nháp REN.nhap) = texture riêng tải lại mỗi lần vẽ.
//   1 lệnh vẽ GL = 1 dãy ảnh liền nhau cùng texture + cùng kiểu hoà màu.
'use strict';
const GLR = (() => {
  const TS = (() => { try { return new URLSearchParams(location.search); } catch (e) { return { get: () => null }; } })();
  const MAC_DINH = true; // mặc định bật (khi có GPU thật + tự kiểm đạt)
  const ATLAS = 2048, TRANG_MAX = 3, LE = 1, DINH_MAX = 16384, W9 = 13; // 13 từ 4 byte / đỉnh: x y · u v · u0 v0 u1 v1 (giới hạn lấy mẫu) · lx ly lw lh (toạ độ trong ô, điểm ảnh thiết bị → khử răng cưa mép) · màu
  const VS = 'attribute vec2 a_p;attribute vec2 a_uv;attribute vec4 a_gh;attribute vec4 a_c;attribute vec4 a_m;uniform vec2 u_kt;varying vec2 v_uv;varying vec4 v_gh;varying vec4 v_c;varying vec4 v_m;' +
    'void main(){v_uv=a_uv;v_gh=a_gh;v_c=a_c;v_m=a_m;gl_Position=vec4(a_p.x*u_kt.x-1.0,1.0-a_p.y*u_kt.y,0.0,1.0);}';
  // highp: UV trên atlas 2048 cần > 10 bit (mediump của GPU iPhone = float 16 bit → lệch điểm ảnh)
  const FS = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n' +
    // mép ô: độ phủ điểm ảnh như canvas 2D (ô nới 0,5 điểm ảnh mỗi phía, ngoài ô nguồn lấy màu mép) → thanh máu / ảnh sát khung không nhảy từng điểm ảnh
    'uniform sampler2D u_t;varying vec2 v_uv;varying vec4 v_gh;varying vec4 v_c;varying vec4 v_m;void main(){' +
    'vec2 p=clamp(min(v_c.xy+0.5,v_c.zw)-max(v_c.xy-0.5,vec2(0.0)),0.0,1.0);gl_FragColor=texture2D(u_t,clamp(v_uv,v_gh.xy,v_gh.zw))*(v_m*(p.x*p.y));}';
  const huu = Number.isFinite;

  // ---------- ngữ cảnh giả kiểu canvas 2D ----------
  class Gx {
    constructor(R) {
      this.R = R; this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; this.al = 1; this.op = 0; this.cat = null; this._st = []; this._r = null;
      // thuộc tính canvas khác: gán được, không có tác dụng (code cũ gán fillStyle/font… không lỗi)
      this.fillStyle = '#000'; this.strokeStyle = '#000'; this.lineWidth = 1; this.lineCap = 'butt'; this.lineJoin = 'miter'; this.font = ''; this.textAlign = 'start'; this.textBaseline = 'alphabetic';
      this.filter = 'none'; this.shadowBlur = 0; this.shadowColor = ''; this.shadowOffsetX = 0; this.shadowOffsetY = 0; this.imageSmoothingEnabled = true; this.imageSmoothingQuality = 'low';
      this.canvas = null; this.laGL = true;
    }
    get globalAlpha() { return this.al; }
    set globalAlpha(v) { v = +v; if (v >= 0 && v <= 1) this.al = v; } // như canvas: ngoài [0, 1] / NaN → bỏ qua
    get globalCompositeOperation() { return this.op ? 'lighter' : 'source-over'; }
    set globalCompositeOperation(v) { if (v === 'source-over') this.op = 0; else if (v === 'lighter') this.op = 1; else this.R.ghiThieu('gco:' + v); }
    save() { this._st.push(this.a, this.b, this.c, this.d, this.e, this.f, this.al, this.op, this.cat); }
    restore() { const s = this._st, n = s.length; if (n < 9) return; this.cat = s[n - 1]; this.op = s[n - 2]; this.al = s[n - 3]; this.f = s[n - 4]; this.e = s[n - 5]; this.d = s[n - 6]; this.c = s[n - 7]; this.b = s[n - 8]; this.a = s[n - 9]; s.length = n - 9; }
    translate(x, y) { if (huu(x) && huu(y)) { this.e += this.a * x + this.c * y; this.f += this.b * x + this.d * y; } }
    scale(x, y) { if (huu(x) && huu(y)) { this.a *= x; this.b *= x; this.c *= y; this.d *= y; } }
    rotate(g) { if (!huu(g)) return; const cs = Math.cos(g), sn = Math.sin(g), a = this.a, b = this.b, c = this.c, d = this.d; this.a = a * cs + c * sn; this.b = b * cs + d * sn; this.c = c * cs - a * sn; this.d = d * cs - b * sn; }
    transform(a, b, c, d, e, f) {
      if (!(huu(a) && huu(b) && huu(c) && huu(d) && huu(e) && huu(f))) return;
      const A = this.a, B = this.b, C = this.c, D = this.d; this.a = A * a + C * b; this.b = B * a + D * b; this.c = A * c + C * d; this.d = B * c + D * d; this.e += A * e + C * f; this.f += B * e + D * f;
    }
    setTransform(a, b, c, d, e, f) {
      if (arguments.length >= 6) { if (huu(a) && huu(b) && huu(c) && huu(d) && huu(e) && huu(f)) { this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f; } return; }
      if (a && typeof a === 'object') {
        const q = [a.a !== undefined ? a.a : a.m11 !== undefined ? a.m11 : 1, a.b !== undefined ? a.b : a.m12 !== undefined ? a.m12 : 0, a.c !== undefined ? a.c : a.m21 !== undefined ? a.m21 : 0,
          a.d !== undefined ? a.d : a.m22 !== undefined ? a.m22 : 1, a.e !== undefined ? a.e : a.m41 !== undefined ? a.m41 : 0, a.f !== undefined ? a.f : a.m42 !== undefined ? a.m42 : 0];
        if (q.every(huu)) { this.a = q[0]; this.b = q[1]; this.c = q[2]; this.d = q[3]; this.e = q[4]; this.f = q[5]; }
        return;
      }
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
    resetTransform() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
    getTransform() { return typeof DOMMatrix !== 'undefined' ? new DOMMatrix([this.a, this.b, this.c, this.d, this.e, this.f]) : { a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f }; }
    drawImage(im, a1, a2, a3, a4, a5, a6, a7, a8) {
      if (!im) return; const n = arguments.length, w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
      if (n >= 9) this.R.ve(this, im, a1, a2, a3, a4, a5, a6, a7, a8);
      else if (n >= 5) this.R.ve(this, im, 0, 0, w, h, a1, a2, a3, a4);
      else this.R.ve(this, im, 0, 0, w, h, a1, a2, w, h);
    }
    // cắt: chỉ hình chữ nhật (beginPath → rect → clip), theo phép biến đổi lúc gọi rect
    beginPath() { this._r = null; this._duong = 0; const t = this.R.dangVe && this.R.xTren; if (t) t.beginPath(); }
    rect(x, y, w, h) { const t = this.R.dangVe && this.R.xTren; if (t) { t.save(); t.setTransform(this.a, this.b, this.c, this.d, this.e, this.f); t.rect(x, y, w, h); t.restore(); } this._r = [Math.min(x, x + w), Math.min(y, y + h), Math.max(x, x + w), Math.max(y, y + h), this.a, this.b, this.c, this.d, this.e, this.f]; }
    clip() {
      const r = this._r; if (!r || this._duong) { this.R.ghiThieu('clip'); return; } // cắt theo đường bất kỳ: chưa có (đếm)
      const dt = r[4] * r[7] - r[5] * r[6]; if (!dt) return;
      // nghịch đảo: điểm thiết bị → toạ độ lúc gọi rect
      const k = { x0: r[0], y0: r[1], x1: r[2], y1: r[3], a: r[7] / dt, b: -r[5] / dt, c: -r[6] / dt, d: r[4] / dt, e: (r[6] * r[9] - r[7] * r[8]) / dt, f: (r[5] * r[8] - r[4] * r[9]) / dt };
      this.cat = this.cat ? this.cat.concat([k]) : [k];
    }
    dat(k, rx, ry) { this.a = k; this.b = 0; this.c = 0; this.d = k; this.e = rx; this.f = ry; this.al = 1; this.op = 0; this.cat = null; this._st.length = 0; this._r = null; }
  }
  // LỆNH KHÔNG PHẢI ẢNH (đường nét, tô, chữ, gradient…): GL không vẽ → CHUYỂN TIẾP sang canvas 2D phủ ngay trên lớp GL (#cv-tren) với đúng
  //   ma trận + kiểu vẽ hiện hành (hình đúng chỗ, nhưng nằm TRÊN mọi ảnh GL của khung — thứ tự lớp có thể lệch) và ĐẾM theo nhóm ở GLR.thieu
  //   (đợt sau rà: nhóm nào còn lệnh vector thì chuyển tay). Ngoài khung vẽ (không có #cv-tren) → bỏ qua, vẫn đếm.
  const KIEU = ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'font', 'textAlign', 'textBaseline', 'filter', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'];
  const chuyen = (X, f, args, ve) => {
    const R = X.R, t = R.dangVe && R.xTren; R.ghiThieu(f); if (!t) return null;
    t.save(); t.setTransform(X.a, X.b, X.c, X.d, X.e, X.f);
    if (ve) { for (const k of KIEU) { const v = X[k]; if (t[k] !== v) t[k] = v; } t.globalAlpha = X.al; t.globalCompositeOperation = X.op ? 'lighter' : 'source-over'; }
    let r = null; try { r = t[f].apply(t, args); } catch (e) { }
    t.restore(); return r;
  };
  for (const f of ['moveTo', 'lineTo', 'arc', 'arcTo', 'closePath', 'ellipse', 'quadraticCurveTo', 'bezierCurveTo', 'roundRect']) Gx.prototype[f] = function () { this._duong = 1; return chuyen(this, f, arguments, false); };
  for (const f of ['fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText']) Gx.prototype[f] = function () { return chuyen(this, f, arguments, true); };
  for (const f of ['measureText', 'createLinearGradient', 'createRadialGradient', 'createPattern', 'setLineDash']) Gx.prototype[f] = function () { const t = this.R.xTren || (this.R._xDo || (this.R._xDo = document.createElement('canvas').getContext('2d'))); if (f === 'measureText' && t.font !== this.font) t.font = this.font; return t[f].apply(t, arguments); };
  for (const f of ['clearRect', 'putImageData', 'getImageData']) Gx.prototype[f] = function () { this.R.ghiThieu(f); return null; }; // không có nghĩa trên lớp gom lô: bỏ qua + đếm

  const R = {
    bat: false, lyDo: '', phien: 0, gl: null, cv: null, x: null, cvTren: null, xTren: null, mat: false, dangVe: false, hien: false,
    thieu: {}, dem: { lenh: 0, o: 0, tai: 0, px: 0 }, demPx: false, f: 0,
    _kt: null, _vung: null,
    nhom: 'khac', // REN đặt trước mỗi nhóm vẽ (quai / dan / thanh…) → GLR.thieu[nhóm][lệnh] = số lần lệnh không-ảnh được gọi
    ghiThieu(k) { const t = this.thieu[this.nhom] || (this.thieu[this.nhom] = {}); t[k] = (t[k] || 0) + 1; },

    // ---------- khởi tạo ----------
    quyetDinh() {
      const q = TS.get('gl');
      if (q === '0') { this.lyDo = '?gl=0'; return false; }
      if (q === '1') { this.ep = true; return true; }
      if (!MAC_DINH) { this.lyDo = 'mặc định tắt'; return false; }
      return true;
    },
    taoNguCanh(cv) {
      const o = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: !this.ep };
      let gl = null;
      if (TS.get('glv') !== '1') { try { gl = cv.getContext('webgl2', o); } catch (e) { } if (gl) this.phien = 2; }
      if (!gl) { try { gl = cv.getContext('webgl', o) || cv.getContext('experimental-webgl', o); } catch (e) { } if (gl) this.phien = 1; }
      return gl;
    },
    khoiTao(REN) {
      this._thu = true;
      try {
        const goc = REN.cv, cv = document.createElement('canvas'); cv.id = 'cv-gl'; cv.setAttribute('aria-hidden', 'true'); cv.width = goc.width || 2; cv.height = goc.height || 2;
        const gl = this.taoNguCanh(cv);
        if (!gl) { this.lyDo = 'không tạo được ngữ cảnh WebGL'; return this.tat(); }
        this.cv = cv; this.gl = gl; this.x = new Gx(this);
        if (!this.dung()) { this.lyDo = 'không dựng được shader'; return this.tat(); }
        if (!this.tuKiem()) { this.lyDo = 'tự kiểm vẽ sai'; return this.tat(); }
        const css = 'position:absolute;inset:0;display:block;pointer-events:none;visibility:hidden';
        cv.style.cssText = css;
        const tr = document.createElement('canvas'); tr.id = 'cv-tren'; tr.setAttribute('aria-hidden', 'true'); tr.width = tr.height = 2; tr.style.cssText = css;
        this.cvTren = tr; this.xTren = tr.getContext('2d');
        goc.parentNode.insertBefore(cv, goc.nextSibling); goc.parentNode.insertBefore(tr, cv.nextSibling); // #cv-nen < #cv < #cv-gl < #cv-tren < HUD (DOM)
        cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.mat = true; this.soMat = (this.soMat || 0) + 1; this.an(); }, false);
        cv.addEventListener('webglcontextrestored', () => { try { if (this.dung()) this.mat = false; else this.tat(); } catch (e) { this.tat(); } }, false);
        document.documentElement.setAttribute('data-gl', String(this.phien));
        return true;
      } catch (e) { this.lyDo = 'lỗi khởi tạo: ' + (e && e.message || e); return this.tat(); }
    },
    tat() { this.bat = false; this.an(); try { document.documentElement.setAttribute('data-gl', '0'); } catch (e) { } return false; },
    an() { if (!this.hien) return; this.hien = false; if (this.cv) this.cv.style.visibility = 'hidden'; if (this.cvTren) this.cvTren.style.visibility = 'hidden'; },
    // dựng (lại) chương trình + bộ đệm + kho texture — gọi lúc khởi tạo và khi ngữ cảnh có lại
    dung() {
      const gl = this.gl, mk = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
      const v = mk(gl.VERTEX_SHADER, VS), f = mk(gl.FRAGMENT_SHADER, FS); if (!v || !f) return false;
      const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f);
      gl.bindAttribLocation(p, 0, 'a_p'); gl.bindAttribLocation(p, 1, 'a_uv'); gl.bindAttribLocation(p, 2, 'a_gh'); gl.bindAttribLocation(p, 3, 'a_c'); gl.bindAttribLocation(p, 4, 'a_m');
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
      gl.useProgram(p); this._kt = gl.getUniformLocation(p, 'u_kt'); gl.uniform1i(gl.getUniformLocation(p, 'u_t'), 0);
      if (!this._buf) { this._buf = new ArrayBuffer(DINH_MAX * W9 * 4); this._f = new Float32Array(this._buf); this._u = new Uint32Array(this._buf); this._i = new Uint16Array(DINH_MAX * 3); }
      this._vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this._vb); gl.bufferData(gl.ARRAY_BUFFER, this._buf.byteLength, gl.DYNAMIC_DRAW);
      this._ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._i.byteLength, gl.DYNAMIC_DRAW);
      for (let i = 0; i < 5; i++) gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 52, 0); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 52, 8); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 52, 16); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 52, 32); gl.vertexAttribPointer(4, 4, gl.UNSIGNED_BYTE, true, 52, 48);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); this._op = 0;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.activeTexture(gl.TEXTURE0); gl.clearColor(0, 0, 0, 0);
      const mx = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 1024; this.atlasCo = Math.min(ATLAS, mx); this.texMax = mx;
      this.the = (this.the || 0) + 1; // thế hệ ngữ cảnh: mọi texture cũ vô hiệu
      this.map = new WeakMap(); this.trang = []; this.rieng = []; this.atlasThe = 0; this._day = false; this._tDat = -1e9;
      this.nv = 0; this.ni = 0; this.bTex = null; this.bOp = 0;
      return true;
    },
    // tự kiểm: vẽ 1 ô đỏ + 1 ô xanh cộng màu qua đúng đường vẽ thật rồi đọc lại điểm ảnh
    tuKiem() {
      const gl = this.gl, cv = this.cv, w0 = cv.width, h0 = cv.height;
      try {
        cv.width = 8; cv.height = 8; gl.viewport(0, 0, 8, 8); gl.uniform2f(this._kt, 2 / 8, 2 / 8); gl.clear(gl.COLOR_BUFFER_BIT);
        const mk = (m) => { const c = document.createElement('canvas'); c.width = c.height = 4; const x = c.getContext('2d'); x.fillStyle = m; x.fillRect(0, 0, 4, 4); return c; };
        const x = this.x; x.dat(1, 0, 0); this.dangVe = true;
        x.drawImage(mk('#ff0000'), 0, 0, 4, 8); x.globalAlpha = 0.5; x.drawImage(mk('#0000ff'), 4, 0, 4, 8);
        x.globalAlpha = 1; x.globalCompositeOperation = 'lighter'; x.drawImage(mk('#00ff00'), 0, 0, 4, 8);
        this.xa(); this.dangVe = false; x.dat(1, 0, 0);
        const p = new Uint8Array(8); gl.readPixels(1, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); gl.readPixels(6, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p.subarray(4));
        gl.clear(gl.COLOR_BUFFER_BIT); cv.width = w0; cv.height = h0;
        const gan = (a, b) => Math.abs(a - b) <= 3;
        this.kiem = Array.from(p).join(',');
        return gan(p[0], 255) && gan(p[1], 255) && gan(p[2], 0) && gan(p[3], 255) && gan(p[4], 0) && gan(p[5], 0) && gan(p[6], 128) && gan(p[7], 128) && !gl.getError();
      } catch (e) { this.dangVe = false; return false; }
    },

    // ---------- khung hình ----------
    // gọi đầu REN.ve0: true = khung này vẽ quái/đạn/thanh máu bằng GL (GLR.x) + lớp trên 2D (GLR.xTren); false = REN vẽ 2D như cũ
    khung(REN, k, rx, ry) {
      if (!this.bat) return false;
      if (!this.gl) { if (this._thu || !this.khoiTao(REN)) return false; }
      if (this.mat || this.gl.isContextLost() || typeof G === 'undefined' || !G.ban.length) { this.an(); return false; }
      const gl = this.gl, cv = this.cv, goc = REN.cv, tr = this.cvTren, xt = this.xTren;
      if (cv.width !== goc.width || cv.height !== goc.height || cv.style.width !== goc.style.width || cv.style.height !== goc.style.height) {
        cv.width = goc.width; cv.height = goc.height; cv.style.width = goc.style.width; cv.style.height = goc.style.height;
        tr.width = goc.width; tr.height = goc.height; tr.style.width = goc.style.width; tr.style.height = goc.style.height;
        REN.minVe(xt); xt.lineCap = 'round'; xt.lineJoin = 'round';
      }
      if (!this.hien) { this.hien = true; cv.style.visibility = ''; tr.style.visibility = ''; }
      this.f++;
      if (this._day && this.f - this._tDat > 600) this.datLaiAtlas(); // atlas đầy: dọn giữa 2 khung (không dọn quá 1 lần / 600 khung)
      if (this.f % 300 === 0) this.donRieng();
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(this._kt, 2 / cv.width, 2 / cv.height); gl.clear(gl.COLOR_BUFFER_BIT);
      this.x.dat(k, rx, ry); this.nv = 0; this.ni = 0; this.bTex = null; this.dangVe = true; this._vung = null;
      const d = this.dem; d.lenh = 0; d.o = 0; d.tai = 0; d.px = 0;
      xt.setTransform(1, 0, 0, 1, 0, 0); xt.clearRect(0, 0, tr.width, tr.height); xt.setTransform(k, 0, 0, k, rx, ry);
      return true;
    },
    xong() { if (!this.dangVe) return; this.xa(); this.dangVe = false; },
    // chép trạng thái "dính" của ngữ cảnh 2D (phông, canh chữ, màu, nét…) a → b: 2 canvas 2D nối nhau như 1 ngữ cảnh liền mạch
    chep(a, b) {
      for (const k of ['font', 'textAlign', 'textBaseline', 'fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'globalAlpha', 'globalCompositeOperation', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'filter', 'lineDashOffset']) {
        const v = a[k]; if (b[k] !== v) b[k] = v;
      }
    },
    // ghi khung bao (điểm ảnh thiết bị) mọi ảnh vẽ qua GLR.x kể từ lúc gọi — dùng để khoét lớp hiệu ứng 2D dưới thanh máu (thanh máu luôn đọc được)
    ghiVung(bat) { const v = this._vung; this._vung = bat ? [] : null; return v; },

    // ---------- kho texture ----------
    taoTex(w, h) {
      const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); this._gan = t;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    },
    gan(t) { if (this._gan !== t) { this.gl.bindTexture(this.gl.TEXTURE_2D, t); this._gan = t; } },
    datLaiAtlas() {
      const gl = this.gl; this.xa(); for (const p of this.trang) gl.deleteTexture(p.tex);
      this.trang = []; this.atlasThe++; this._day = false; this._tDat = this.f; this._gan = null; this.bTex = null;
    },
    donRieng() { // texture riêng không dùng > 600 khung → trả bộ nhớ GPU
      const gl = this.gl, ds = this.rieng; let j = 0;
      for (let i = 0; i < ds.length; i++) { const E = ds[i]; if (this.f - E.dung > 600) { if (E.tex) gl.deleteTexture(E.tex); E.tex = null; } else ds[j++] = E; }
      ds.length = j; this._gan = null;
    },
    // xếp kệ: tìm chỗ w×h (đã cộng lề) trong các trang atlas; hết chỗ → null
    xep(w, h) {
      const S = this.atlasCo;
      for (let lan = 0; lan < 2; lan++) {
        for (const p of this.trang) {
          for (const k of p.ke) if (k.h >= h && k.h <= h * 1.35 + 4 && S - k.x >= w) { const x = k.x; k.x += w; return { p, x, y: k.y }; }
          if (S - p.y >= h) { const k = { y: p.y, h, x: w }; p.ke.push(k); p.y += h; return { p, x: 0, y: k.y }; }
        }
        if (this.trang.length >= TRANG_MAX) return null;
        this.trang.push({ tex: this.taoTex(S, S), ke: [], y: 0 });
      }
      return null;
    },
    // ảnh/canvas → mục texture { tex, x, y (góc ảnh trong texture), W, H (cỡ texture) }; null = chưa vẽ được
    tra(im, w, h) {
      const gl = this.gl; let E = this.map.get(im);
      if (im._glD || im._nhap) { // canvas vẽ lại mỗi khung: texture riêng, tải lại ở MỖI lần vẽ (xả lô trước để các ô vẽ trước đó giữ hình cũ)
        this.xa();
        if (!E || E.the !== this.the || !E.tex) { E = { tex: this.taoTex(0, 0), x: 0, y: 0, W: 0, H: 0, w: 0, h: 0, the: this.the, dung: this.f, rieng: 1 }; this.map.set(im, E); this.rieng.push(E); }
        this.gan(E.tex);
        try { if (E.W !== w || E.H !== h) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); E.W = E.w = w; E.H = E.h = h; } else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, im); } catch (e) { return null; }
        this.dem.tai++; E.dung = this.f; return E;
      }
      if (E && E.w === w && E.h === h && E.the === this.the && (E.rieng ? E.tex : E.at === this.atlasThe)) {
        E.dung = this.f;
        if (E.v !== (im._glV | 0)) { // GLR.ban(canvas): nội dung đã đổi → tải lại đúng chỗ cũ
          this.xa(); this.gan(E.tex); try { gl.texSubImage2D(gl.TEXTURE_2D, 0, E.x, E.y, gl.RGBA, gl.UNSIGNED_BYTE, im); } catch (e) { return null; } E.v = im._glV | 0; this.dem.tai++;
        }
        return E;
      }
      if (im._glLoi === this.the) return null;
      if (im.tagName === 'IMG' && !(im.complete && im.naturalWidth)) return null;
      const nho = w <= 1024 && h <= 1024 && w * h <= 262144 && w + 2 * LE <= this.atlasCo && h + 2 * LE <= this.atlasCo;
      const cho = nho && !this._day ? this.xep(w + 2 * LE, h + 2 * LE) : null;
      try {
        if (cho) {
          this.gan(cho.p.tex); gl.texSubImage2D(gl.TEXTURE_2D, 0, cho.x + LE, cho.y + LE, gl.RGBA, gl.UNSIGNED_BYTE, im);
          E = { tex: cho.p.tex, x: cho.x + LE, y: cho.y + LE, W: this.atlasCo, H: this.atlasCo, w, h, the: this.the, at: this.atlasThe, dung: this.f, rieng: 0 };
        } else {
          if (nho) this._day = true; // atlas đầy: khung này dùng texture riêng, dọn atlas ở đầu khung sau
          if (w > this.texMax || h > this.texMax) { im._glLoi = this.the; return null; }
          const t = this.taoTex(0, 0); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          E = { tex: t, x: 0, y: 0, W: w, H: h, w, h, the: this.the, dung: this.f, rieng: 1 }; this.rieng.push(E);
        }
      } catch (e) { im._glLoi = this.the; this.ghiThieu('tai-loi'); return null; }
      E.v = im._glV | 0; this.dem.tai++; this.map.set(im, E); return E;
    },

    // ---------- gom lô ----------
    xa() {
      const n = this.ni; if (!n) { this.nv = 0; return; }
      const gl = this.gl;
      if (this._op !== this.bOp) { this._op = this.bOp; if (this.bOp) gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
      this.gan(this.bTex);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._f.subarray(0, this.nv * W9)); gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this._i.subarray(0, n));
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
      this.dem.lenh++; this.nv = 0; this.ni = 0;
    },
    // lõi: như ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh) với trạng thái X (ma trận, alpha, hoà màu, cắt)
    ve(X, im, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (!this.dangVe) return;
      const al = X.al; if (!(al > 0)) return;
      const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height; if (!w || !h) return;
      if (!(huu(sx) && huu(sy) && huu(sw) && huu(sh) && huu(dx) && huu(dy) && huu(dw) && huu(dh)) || !sw || !sh) return;
      // nguồn âm → chuẩn hoá; nguồn lòi ra ngoài ảnh → cắt cả nguồn lẫn đích theo tỉ lệ (như canvas)
      if (sw < 0) { sx += sw; sw = -sw; } if (sh < 0) { sy += sh; sh = -sh; }
      if (sx < 0 || sy < 0 || sx + sw > w || sy + sh > h) {
        const x0 = Math.max(0, sx), y0 = Math.max(0, sy), x1 = Math.min(w, sx + sw), y1 = Math.min(h, sy + sh); if (!(x1 > x0 && y1 > y0)) return;
        const kx = dw / sw, ky = dh / sh; dx += (x0 - sx) * kx; dy += (y0 - sy) * ky; dw = (x1 - x0) * kx; dh = (y1 - y0) * ky; sx = x0; sy = y0; sw = x1 - x0; sh = y1 - y0;
      }
      const E = this.tra(im, w, h); if (!E) return;
      if (E.tex !== this.bTex || X.op !== this.bOp || this.nv + 12 > DINH_MAX) { this.xa(); this.bTex = E.tex; this.bOp = X.op; }
      const a = X.a, b = X.b, c = X.c, d = X.d, e = X.e, f = X.f;
      const iw = 1 / E.W, ih = 1 / E.H, u0 = (E.x + sx) * iw, v0 = (E.y + sy) * ih, u1 = (E.x + sx + sw) * iw, v1 = (E.y + sy + sh) * ih;
      // giới hạn lấy mẫu = trong ô nguồn (như canvas: không lem điểm ảnh khung/ảnh bên cạnh)
      let g0 = u0 + 0.5 * iw, g2 = u1 - 0.5 * iw, g1 = v0 + 0.5 * ih, g3 = v1 - 0.5 * ih;
      if (g0 > g2) g0 = g2 = (u0 + u1) / 2; if (g1 > g3) g1 = g3 = (v0 + v1) / 2;
      // 'lighter' = đúng nghĩa canvas (cộng cả màu lẫn alpha, hoà màu ONE/ONE; đổi kiểu hoà màu = ngắt lô). Lưu ý xếp lớp: ảnh cộng sáng nằm ĐÈ lên hình của
      //   canvas 2D bên dưới (#cv: ụ) thì hoà kiểu alpha thường với lớp dưới chứ không cộng thật (chỉ lệch ở chớp đầu nòng ngay trên thân ụ) — hết khi ụ sang GL (đợt 2)
      const A = Math.round(al * 255), mau = (A | (A << 8) | (A << 16) | (A << 24)) >>> 0; // màu nhân sẵn alpha (tô màu: để dành đợt sau)
      const F = this._f, U = this._u, I = this._i;
      // 4 góc ô đích (điểm ảnh thiết bị) nới 0,5 điểm ảnh mỗi phía dọc 2 cạnh; UV + toạ độ trong ô (lx, ly) nới theo
      const wx = a * dw, wy = b * dw, hx = c * dh, hy = d * dh; let lw = Math.hypot(wx, wy), lh = Math.hypot(hx, hy); if (!(lw > 0 && lh > 0)) return;
      // như Chrome: ô thẳng trục (không xoay/xiên) và ≥ 1 điểm ảnh KHÔNG khử răng cưa mép (mép bám tâm điểm ảnh); ô xoay/xiên hoặc rất nhỏ thì có
      const kk = (b || c || lw < 1 || lh < 1) ? 0.5 : 0;
      const ox = wx / lw * kk, oy = wy / lw * kk, px = hx / lh * kk, py = hy / lh * kk, du = (u1 - u0) / lw * kk, dv = (v1 - v0) / lh * kk;
      if (this.demPx) this.dem.px += lw * lh;
      const bx = a * dx + c * dy + e, by = b * dx + d * dy + f;
      const X0 = bx - ox - px, Y0 = by - oy - py, X1 = bx + wx + ox - px, Y1 = by + wy + oy - py, X2 = bx + wx + hx + ox + px, Y2 = by + wy + hy + oy + py, X3 = bx + hx - ox + px, Y3 = by + hy - oy + py;
      const ua = u0 - du, ub = u1 + du, va = v0 - dv, vb = v1 + dv; let la = -0.5, lb = lw + 0.5, ma = -0.5, mb = lh + 0.5;
      if (!kk) { la = lb = ma = mb = 1e4; lw = lh = 2e4; } // độ phủ = 1 mọi điểm
      if (this._vung) this._vung.push(Math.min(X0, X1, X2, X3), Math.min(Y0, Y1, Y2, Y3), Math.max(X0, X1, X2, X3), Math.max(Y0, Y1, Y2, Y3));
      if (X.cat) { this.veCat(X.cat, [X0, Y0, ua, va, la, ma, X1, Y1, ub, va, lb, ma, X2, Y2, ub, vb, lb, mb, X3, Y3, ua, vb, la, mb], g0, g1, g2, g3, lw, lh, mau); return; }
      let o = this.nv * W9; const v = this.nv;
      F[o] = X0; F[o + 1] = Y0; F[o + 2] = ua; F[o + 3] = va; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = la; F[o + 9] = ma; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; o += W9;
      F[o] = X1; F[o + 1] = Y1; F[o + 2] = ub; F[o + 3] = va; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = lb; F[o + 9] = ma; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; o += W9;
      F[o] = X2; F[o + 1] = Y2; F[o + 2] = ub; F[o + 3] = vb; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = lb; F[o + 9] = mb; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; o += W9;
      F[o] = X3; F[o + 1] = Y3; F[o + 2] = ua; F[o + 3] = vb; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = la; F[o + 9] = mb; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau;
      const i = this.ni; I[i] = v; I[i + 1] = v + 1; I[i + 2] = v + 2; I[i + 3] = v; I[i + 4] = v + 2; I[i + 5] = v + 3;
      this.nv = v + 4; this.ni = i + 6; this.dem.o++;
    },
    // ô bị cắt bởi (các) hình chữ nhật clip: cắt đa giác lồi (Sutherland–Hodgman) trong toạ độ của clip, nội suy cả UV → quạt tam giác
    veCat(cat, P, g0, g1, g2, g3, lw, lh, mau) {
      const K = 6; // x y u v lx ly
      for (const k of cat) {
        for (let m = 0; m < 4 && P.length >= 3 * K; m++) {
          const Q = [], n = P.length / K, gh = m === 0 ? k.x0 : m === 1 ? k.x1 : m === 2 ? k.y0 : k.y1;
          const kc = (i) => { const x = P[i * K], y = P[i * K + 1], t = m < 2 ? k.a * x + k.c * y + k.e : k.b * x + k.d * y + k.f; return (m & 1) ? gh - t : t - gh; }; // ≥ 0 = bên trong
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n, di = kc(i), dj = kc(j);
            if (di >= 0) for (let q = 0; q < K; q++) Q.push(P[i * K + q]);
            if ((di >= 0) !== (dj >= 0)) { const t = di / (di - dj); for (let q = 0; q < K; q++) Q.push(P[i * K + q] + (P[j * K + q] - P[i * K + q]) * t); }
          }
          P = Q;
        }
        if (P.length < 3 * K) return;
      }
      const n = P.length / K, F = this._f, U = this._u, I = this._i, v = this.nv; let o = v * W9;
      for (let i = 0; i < n; i++, o += W9) { F[o] = P[i * K]; F[o + 1] = P[i * K + 1]; F[o + 2] = P[i * K + 2]; F[o + 3] = P[i * K + 3]; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = P[i * K + 4]; F[o + 9] = P[i * K + 5]; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; }
      let i = this.ni; for (let q = 1; q < n - 1; q++) { I[i++] = v; I[i++] = v + q; I[i++] = v + q + 1; }
      this.nv = v + n; this.ni = i; this.dem.o++;
    },
    // canvas đệm vừa được vẽ lại (không phải mỗi khung): báo bẩn → lần vẽ kế tải lại texture. Canvas vẽ lại MỖI khung: đặt c._glD = 1 một lần lúc tạo.
    ban(c) { if (c) c._glV = (c._glV | 0) + 1; },
    // tiện ích cho code mới: ảnh tâm (x, y), cỡ w×h (đơn vị logic của trận), xoay goc, alpha
    sprite(im, x, y, w, h, goc, alpha) {
      const X = this.x, al0 = X.al; if (alpha != null) X.globalAlpha = alpha;
      if (goc) { X.save(); X.translate(x, y); X.rotate(goc); X.drawImage(im, -w / 2, -h / 2, w, h); X.restore(); } else X.drawImage(im, x - w / 2, y - h / 2, w, h);
      X.al = al0;
    },
    thongTin() { return { bat: this.bat, phien: this.phien, mat: this.mat, lyDo: this.lyDo, kiem: this.kiem, trang: this.trang ? this.trang.length : 0, rieng: this.rieng ? this.rieng.length : 0, thieu: this.thieu, dem: this.dem }; },
  };
  R.bat = R.quyetDinh();
  return R;
})();
