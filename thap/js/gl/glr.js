// TURRET MERGE — GLR: lớp vẽ WebGL của màn trận. Tài liệu: docs/demo-hop-tuong/tuvan/webgl/KE-HOACH.md
//  · Đợt 1: quái + thanh máu + đạn + tia laser. Đợt 2+3: Ụ, nhãn bàn, cổng/lõi, dòng chảy, huy hiệu, kéo ghép, vùng phủ dưới quái, lớp hiệu ứng
//    (bộ đệm khung riêng + khoét 'destination-out' + đổ alpha), VX.veDs, chữ số, chớp màn → MỌI thứ của khung vẽ vào 1 canvas GL (#cv-gl), đúng thứ tự bản 2D.
//  · CHỈ HÌNH: không đụng luật / mô phỏng / Math.random. Tắt: ?gl=0 · ép bật: ?gl=1 (kể cả GPU phần mềm) · ?glv=1 ép WebGL1.
//  · MAC_DINH = false: mặc định TẮT (REN vẽ 2D như cũ, không tạo canvas nào). Bật mặc định = có GPU thật (failIfMajorPerformanceCaveat) + tự kiểm đạt.
//  · Mất ngữ cảnh (webglcontextlost) → ngay khung sau REN vẽ 2D như cũ; có lại (webglcontextrestored) → dựng lại, vẽ GL tiếp.
//  · Không dùng localStorage. Không thư viện ngoài. WebGL1 là đủ (WebGL2 có thì dùng, cùng shader GLSL ES 1.0).
// CÁCH DÙNG: GLR.x là "ngữ cảnh giả" cùng tập lệnh canvas 2D → hàm vẽ cũ nhận GLR.x thay cho ctx là chạy, toán học giữ nguyên:
//   · ẢNH (drawImage 3-5-9 tham số, save/restore, biến đổi, globalAlpha, cắt chữ nhật) → ô ảnh gom lô. Hoà màu: source-over, lighter, destination-out,
//     source-atop, source-in, screen (đúng nghĩa canvas trên nền alpha nhân sẵn).
//   · CHỮ (fillText/strokeText không xoay) → dựng 1 lần thành ảnh nhỏ (kho chữ), các khung sau là 1 ô ảnh.
//   · VECTOR (fill/stroke/fillRect/… + chữ xoay): vẽ vào canvas 2D nháp (#cv — bản GL không vẽ gì khác lên đó) rồi chép đúng vùng vừa vẽ thành 1 ô ảnh
//     chèn ĐÚNG THỨ TỰ vào lô → không còn canvas phủ #cv-tren, thứ tự lớp y bản 2D. Hiếm (khiên Prism, ?debug): 1 lần tải texture nhỏ / cụm lệnh.
//   · GLR.thieu[nhóm][lệnh] đếm mọi lệnh không-ảnh; tiền tố 'bo:' = lệnh BỎ QUA (clip theo đường cong, filter/bóng, kiểu hoà màu lạ, clearRect…).
//   GLR.sprite(img, x, y, w, h, goc, alpha) = vẽ ảnh tâm (x, y) — tiện cho code mới. GLR.x.trang = 0..1: vẽ bản TRẮNG của ảnh (chớp trúng đòn) không cần canvas tạm.
// ĐÍCH VẼ PHỤ (bộ đệm khung): GLR.lopMo() … GLR.lopGop(alpha) = lớp hiệu ứng (vẽ vào lớp → khoét → đổ xuống với alpha);
//   GLR.tam(khoá, w, h) + GLR.vao(t) … GLR.ra() = "canvas tạm" trên GPU (thân trùm xoay + phủ bóng…) dùng làm nguồn drawImage — không tải texture mỗi khung.
// GOM LÔ: ảnh tĩnh ≤ 512² điểm nhét vào atlas 2048² (≤ TRANG_MAX trang, dựng dần lúc ảnh được vẽ lần đầu); ảnh lớn = texture riêng;
//   canvas vẽ lại mỗi khung (c._glD = 1, canvas nháp REN.nhap) = texture riêng tải lại mỗi lần vẽ; canvas thỉnh thoảng vẽ lại → GLR.ban(c).
//   Cả khung dồn vào 1 bộ đệm đỉnh, tải 1 lần rồi phát từng dãy (1 dãy = ảnh liền nhau cùng texture + cùng kiểu hoà màu) → ít lệnh GL.
'use strict';
const GLR = (() => {
  const TS = (() => { try { return new URLSearchParams(location.search); } catch (e) { return { get: () => null }; } })();
  const MAC_DINH = false; // mặc định bật (khi có GPU thật + tự kiểm đạt)
  const ATLAS = 2048, TRANG_MAX = 4, RIENG_MAX = 64 << 20, NT = 8, LE = 1, DINH_MAX = 32768, W9 = 14; // 14 từ 4 byte / đỉnh: x y · u v · u0 v0 u1 v1 (giới hạn lấy mẫu) · lx ly lw lh (toạ độ trong ô, điểm ảnh thiết bị → khử răng cưa mép) · màu · trắng
  const VS = 'attribute vec2 a_p;attribute vec2 a_uv;attribute vec4 a_gh;attribute vec4 a_c;attribute vec4 a_m;attribute float a_w;uniform vec3 u_kt;varying vec2 v_uv;varying vec4 v_gh;varying vec4 v_c;varying vec4 v_m;varying float v_w;' +
    // u_kt.z = 1: vẽ ra canvas (y lật) · −1: vẽ vào bộ đệm khung (hàng 0 của texture = mép trên ảnh → dùng lại làm nguồn như ảnh thường)
    'void main(){v_uv=a_uv;v_gh=a_gh;v_c=a_c;v_m=a_m;v_w=a_w;gl_Position=vec4(a_p.x*u_kt.x-1.0,(1.0-a_p.y*u_kt.y)*u_kt.z,0.0,1.0);}';
  // highp: UV trên atlas 2048 cần > 10 bit (mediump của GPU iPhone = float 16 bit → lệch điểm ảnh)
  const FS = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n' +
    // mép ô: độ phủ điểm ảnh như canvas 2D (ô nới 0,5 điểm ảnh mỗi phía, ngoài ô nguồn lấy màu mép) → thanh máu / ảnh sát khung không nhảy từng điểm ảnh
    // NT = 8 texture / 1 lệnh vẽ (WebGL bảo đảm ≥ 8 đơn vị texture ở fragment): v_w = 2 × (số thứ tự texture) + độ "trắng" → ô ảnh khác texture (các trang atlas,
    //   dải khung ụ, bộ đệm khung…) vẫn chung 1 lệnh vẽ; chỉ ngắt lô khi đổi kiểu hoà màu hoặc quá 8 texture
    'uniform sampler2D u_t0;uniform sampler2D u_t1;uniform sampler2D u_t2;uniform sampler2D u_t3;uniform sampler2D u_t4;uniform sampler2D u_t5;uniform sampler2D u_t6;uniform sampler2D u_t7;' +
    'varying vec2 v_uv;varying vec4 v_gh;varying vec4 v_c;varying vec4 v_m;varying float v_w;void main(){' +
    'vec2 p=clamp(min(v_c.xy+0.5,v_c.zw)-max(v_c.xy-0.5,vec2(0.0)),0.0,1.0);vec2 uv=clamp(v_uv,v_gh.xy,v_gh.zw);float i=floor(v_w*0.5+0.01);float w=clamp(v_w-2.0*i,0.0,1.0);vec4 t;' +
    'if(i<0.5)t=texture2D(u_t0,uv);else if(i<1.5)t=texture2D(u_t1,uv);else if(i<2.5)t=texture2D(u_t2,uv);else if(i<3.5)t=texture2D(u_t3,uv);' +
    'else if(i<4.5)t=texture2D(u_t4,uv);else if(i<5.5)t=texture2D(u_t5,uv);else if(i<6.5)t=texture2D(u_t6,uv);else t=texture2D(u_t7,uv);' +
    'gl_FragColor=mix(t,vec4(t.a),w)*(v_m*(p.x*p.y));}';
  const huu = Number.isFinite;

  // ---------- ngữ cảnh giả kiểu canvas 2D ----------
  // kiểu vẽ (màu, nét, phông…): 1 đối tượng chép-khi-ghi → save/restore chỉ đẩy/lấy 1 tham chiếu (như canvas thật: restore trả lại cả kiểu vẽ)
  const KIEU = ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'lineDashOffset', 'font', 'textAlign', 'textBaseline', 'filter', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'];
  const KIEU0 = () => ({ fillStyle: '#000000', strokeStyle: '#000000', lineWidth: 1, lineCap: 'butt', lineJoin: 'miter', miterLimit: 10, lineDashOffset: 0, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic',
    filter: 'none', shadowBlur: 0, shadowColor: 'rgba(0, 0, 0, 0)', shadowOffsetX: 0, shadowOffsetY: 0, dash: null });
  const OP = { 'source-over': 0, lighter: 1, 'destination-out': 2, 'source-atop': 3, 'source-in': 4, screen: 5 }, OP_TEN = ['source-over', 'lighter', 'destination-out', 'source-atop', 'source-in', 'screen'];
  class Gx {
    constructor(R) {
      this.R = R; this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; this.al = 1; this.op = 0; this.cat = null; this.trang = 0; this._st = []; this._r = null; this._duong = 0;
      this._s = KIEU0(); this._sC = false; this._sv = 0; this._pb = [Infinity, Infinity, -Infinity, -Infinity];
      this.imageSmoothingEnabled = true; this.imageSmoothingQuality = 'low';
      this.canvas = null; this.laGL = true;
    }
    get globalAlpha() { return this.al; }
    set globalAlpha(v) { v = +v; if (v >= 0 && v <= 1) this.al = v; } // như canvas: ngoài [0, 1] / NaN → bỏ qua
    get globalCompositeOperation() { return OP_TEN[this.op]; }
    set globalCompositeOperation(v) { const o = OP[v]; if (o !== undefined) this.op = o; else this.R.ghiThieu('bo:gco:' + v); }
    _ghi(k, v) { if (this._s[k] === v) return; if (this._sC) { this._s = Object.assign({}, this._s); this._sC = false; } this._s[k] = v; this._sv++; }
    setLineDash(d) { this._ghi('dash', d && d.length ? Array.from(d) : null); }
    getLineDash() { return this._s.dash ? this._s.dash.slice() : []; }
    save() { this._st.push(this.a, this.b, this.c, this.d, this.e, this.f, this.al, this.op, this.cat, this.trang, this._s); this._sC = true; }
    restore() {
      const s = this._st, n = s.length; if (n < 11) return;
      const k = s[n - 1]; if (k !== this._s) { this._s = k; this._sv++; } this._sC = true;
      this.trang = s[n - 2]; this.cat = s[n - 3]; this.op = s[n - 4]; this.al = s[n - 5]; this.f = s[n - 6]; this.e = s[n - 7]; this.d = s[n - 8]; this.c = s[n - 9]; this.b = s[n - 10]; this.a = s[n - 11]; s.length = n - 11;
    }
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
      if (!im) return; const n = arguments.length, w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, s = this._s;
      if (s.shadowBlur > 0 || s.filter !== 'none') this.R.ghiThieu('bo:filter/bong'); // ảnh kèm filter / bóng đổ: GL vẽ ảnh trơn (đếm để rà)
      if (n >= 9) this.R.ve(this, im, a1, a2, a3, a4, a5, a6, a7, a8);
      else if (n >= 5) this.R.ve(this, im, 0, 0, w, h, a1, a2, a3, a4);
      else this.R.ve(this, im, 0, 0, w, h, a1, a2, w, h);
    }
    // cắt ẢNH: chỉ hình chữ nhật (beginPath → rect → clip), theo phép biến đổi lúc gọi rect
    beginPath() { this._r = null; this._duong = 0; const p = this._pb; p[0] = p[1] = Infinity; p[2] = p[3] = -Infinity; const t = this.R.dangVe && this.R.xVe; if (t) t.beginPath(); }
    rect(x, y, w, h) {
      hop(this, x, y, x + w, y + h);
      const t = this.R.dangVe && this.R.xVe; if (t) { t.setTransform(this.a, this.b, this.c, this.d, this.e, this.f); t.rect(x, y, w, h); }
      this._r = [Math.min(x, x + w), Math.min(y, y + h), Math.max(x, x + w), Math.max(y, y + h), this.a, this.b, this.c, this.d, this.e, this.f];
    }
    clip() {
      const r = this._r; if (!r || this._duong) { this.R.ghiThieu('bo:clip'); return; } // cắt theo đường bất kỳ: không có (đếm)
      const dt = r[4] * r[7] - r[5] * r[6]; if (!dt) return;
      // nghịch đảo: điểm thiết bị → toạ độ lúc gọi rect
      const k = { x0: r[0], y0: r[1], x1: r[2], y1: r[3], a: r[7] / dt, b: -r[5] / dt, c: -r[6] / dt, d: r[4] / dt, e: (r[6] * r[9] - r[7] * r[8]) / dt, f: (r[5] * r[8] - r[4] * r[9]) / dt, m: r.slice(4) };
      this.cat = this.cat ? this.cat.concat([k]) : [k];
    }
    // đầu khung: ma trận gốc, bỏ cắt + ngăn xếp. globalAlpha / kiểu hoà màu / kiểu vẽ KHÔNG đặt lại — "dính" qua các khung y như ngữ cảnh 2D thật
    //   (code vẽ cũ có chỗ dựa vào trạng thái khung trước để lại) → hình GL = hình 2D cả ở những chỗ đó.
    dat(k, rx, ry) { this.a = k; this.b = 0; this.c = 0; this.d = k; this.e = rx; this.f = ry; this.cat = null; this.trang = 0; this._st.length = 0; this._r = null; this._duong = 0; }
  }
  for (const k of KIEU) Object.defineProperty(Gx.prototype, k, { get() { return this._s[k]; }, set(v) { this._ghi(k, v); }, enumerable: true, configurable: true });
  // LỆNH KHÔNG PHẢI ẢNH. Đường nét (moveTo/lineTo/arc…) chuyển sang canvas 2D nháp (GLR.xVe = #cv) với đúng ma trận hiện hành + ghi khung bao của đường;
  //   lệnh tô (fill/stroke/fillRect/strokeRect, chữ xoay) vẽ vào canvas nháp rồi GLR.vecXa chép vùng vừa vẽ thành 1 ô ảnh chèn đúng thứ tự vào lô;
  //   chữ không xoay → kho ảnh chữ (GLR.veChu). Ngoài khung vẽ (không có canvas nháp) → bỏ qua. Mọi lệnh đều đếm ở GLR.thieu[nhóm].
  const diem = (X, x, y) => { const u = X.a * x + X.c * y + X.e, v = X.b * x + X.d * y + X.f, p = X._pb; if (!(u > -1e7 && u < 1e7 && v > -1e7 && v < 1e7)) { p[0] = p[1] = -1e7; p[2] = p[3] = 1e7; return; } if (u < p[0]) p[0] = u; if (u > p[2]) p[2] = u; if (v < p[1]) p[1] = v; if (v > p[3]) p[3] = v; };
  const hop = (X, x0, y0, x1, y1) => { diem(X, x0, y0); diem(X, x1, y0); diem(X, x0, y1); diem(X, x1, y1); };
  const BAO = {
    moveTo(X, a) { diem(X, a[0], a[1]); }, lineTo(X, a) { diem(X, a[0], a[1]); }, closePath() { },
    arc(X, a) { hop(X, a[0] - a[2], a[1] - a[2], a[0] + a[2], a[1] + a[2]); }, arcTo(X, a) { diem(X, a[0], a[1]); diem(X, a[2], a[3]); },
    ellipse(X, a) { const r = Math.max(a[2], a[3]); hop(X, a[0] - r, a[1] - r, a[0] + r, a[1] + r); },
    quadraticCurveTo(X, a) { diem(X, a[0], a[1]); diem(X, a[2], a[3]); }, bezierCurveTo(X, a) { diem(X, a[0], a[1]); diem(X, a[2], a[3]); diem(X, a[4], a[5]); },
    roundRect(X, a) { hop(X, a[0], a[1], a[0] + a[2], a[1] + a[3]); },
  };
  for (const f of Object.keys(BAO)) Gx.prototype[f] = function () { this._duong = 1; BAO[f](this, arguments); const t = this.R.dangVe && this.R.xVe; if (t) { t.setTransform(this.a, this.b, this.c, this.d, this.e, this.f); try { t[f].apply(t, arguments); } catch (e) { } } };
  for (const f of ['fill', 'stroke', 'fillRect', 'strokeRect']) Gx.prototype[f] = function () { return this.R.veVec(this, f, arguments); };
  for (const f of ['fillText', 'strokeText']) Gx.prototype[f] = function () { return this.R.veChu(this, f, arguments); };
  Gx.prototype.measureText = function (s) { const t = this.R.xDo(); if (t.font !== this._s.font) t.font = this._s.font; return t.measureText(s); };
  for (const f of ['createLinearGradient', 'createRadialGradient', 'createConicGradient', 'createPattern']) Gx.prototype[f] = function () { const t = this.R.xDo(); return t[f].apply(t, arguments); };
  for (const f of ['clearRect', 'putImageData', 'getImageData']) Gx.prototype[f] = function () { this.R.ghiThieu('bo:' + f); return null; }; // không có nghĩa trên lớp gom lô: bỏ qua + đếm

  const R = {
    bat: false, lyDo: '', phien: 0, gl: null, cv: null, x: null, cvVe: null, xVe: null, mat: false, dangVe: false, hien: false,
    thieu: {}, dem: { lenh: 0, o: 0, tai: 0, px: 0, vec: 0, chu: 0 }, demPx: false, f: 0, soat: null,
    _kt: null, _dich: null, _bb: null, _vCo: false, _vOp: 0, _vb: [Infinity, Infinity, -Infinity, -Infinity], _svVe: -1, _chuMoi: 0, _ngan: [], _lopTT: null,
    _xi: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, al: 1, op: 0, cat: null, trang: 0 }, // "ngữ cảnh" đơn vị: vẽ ô theo điểm ảnh thiết bị (đổ lớp, ô vector, ô chữ)
    khoChu: new Map(),
    nhom: 'khac', // REN đặt trước mỗi nhóm vẽ (quai / u / hieuung…) → GLR.thieu[nhóm][lệnh] = số lần lệnh không-ảnh được gọi ('bo:…' = lệnh bị bỏ qua)
    ghiThieu(k) { const t = this.thieu[this.nhom] || (this.thieu[this.nhom] = {}); t[k] = (t[k] || 0) + 1; },
    xDo() { return this._xDo || (this._xDo = document.createElement('canvas').getContext('2d')); }, // ngữ cảnh 2D 1×1 chỉ để đo chữ / tạo gradient

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
        this.cv = cv; this.gl = gl; this.x = new Gx(this); this.x.canvas = cv;
        if (!this.dung()) { this.lyDo = 'không dựng được shader'; return this.tat(); }
        if (!this.tuKiem()) { this.lyDo = 'tự kiểm vẽ sai'; return this.tat(); }
        cv.style.cssText = 'position:absolute;inset:0;display:block;pointer-events:none;visibility:hidden';
        goc.parentNode.insertBefore(cv, goc.nextSibling); // #cv-nen < #cv (trống khi GL vẽ; canvas nháp cho lệnh vector) < #cv-gl < HUD (DOM)
        cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.mat = true; this.soMat = (this.soMat || 0) + 1; this.dangVe = false; this.an(); }, false);
        cv.addEventListener('webglcontextrestored', () => { try { if (this.dung()) this.mat = false; else this.tat(); } catch (e) { this.tat(); } }, false);
        try { if (document.fonts) document.fonts.addEventListener('loadingdone', () => this.khoChu.clear()); } catch (e) { } // phông về muộn: dựng lại ảnh chữ
        document.documentElement.setAttribute('data-gl', String(this.phien));
        return true;
      } catch (e) { this.lyDo = 'lỗi khởi tạo: ' + (e && e.message || e); return this.tat(); }
    },
    tat() { this.bat = false; this.dangVe = false; this.an(); try { document.documentElement.setAttribute('data-gl', '0'); } catch (e) { } return false; },
    an() { if (!this.hien) return; this.hien = false; if (this.cv) this.cv.style.visibility = 'hidden'; },
    // dựng (lại) chương trình + bộ đệm + kho texture — gọi lúc khởi tạo và khi ngữ cảnh có lại
    dung() {
      const gl = this.gl, mk = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
      const v = mk(gl.VERTEX_SHADER, VS), f = mk(gl.FRAGMENT_SHADER, FS); if (!v || !f) return false;
      const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f);
      gl.bindAttribLocation(p, 0, 'a_p'); gl.bindAttribLocation(p, 1, 'a_uv'); gl.bindAttribLocation(p, 2, 'a_gh'); gl.bindAttribLocation(p, 3, 'a_c'); gl.bindAttribLocation(p, 4, 'a_m'); gl.bindAttribLocation(p, 5, 'a_w');
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
      gl.useProgram(p); this._kt = gl.getUniformLocation(p, 'u_kt'); for (let i = 0; i < NT; i++) gl.uniform1i(gl.getUniformLocation(p, 'u_t' + i), i);
      if (!this._buf) { this._buf = new ArrayBuffer(DINH_MAX * W9 * 4); this._f = new Float32Array(this._buf); this._u = new Uint32Array(this._buf); this._i = new Uint16Array(DINH_MAX * 3); }
      this._vb0 = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this._vb0); gl.bufferData(gl.ARRAY_BUFFER, this._buf.byteLength, gl.DYNAMIC_DRAW);
      this._ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._i.byteLength, gl.DYNAMIC_DRAW);
      for (let i = 0; i < 6; i++) gl.enableVertexAttribArray(i);
      const B = W9 * 4;
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, B, 0); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, B, 8); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, B, 16); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, B, 32);
      gl.vertexAttribPointer(4, 4, gl.UNSIGNED_BYTE, true, B, 48); gl.vertexAttribPointer(5, 1, gl.FLOAT, false, B, 52);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); this._op = 0;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.activeTexture(gl.TEXTURE0); gl.clearColor(0, 0, 0, 0);
      const mx = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 1024; this.atlasCo = Math.min(ATLAS, mx); this.texMax = mx;
      this.the = (this.the || 0) + 1; // thế hệ ngữ cảnh: mọi texture / bộ đệm khung cũ vô hiệu
      this.map = new WeakMap(); this.trang = []; this.rieng = []; this._riengB = 0; this._tDon = 0; this.atlasThe = 0; this._day = false; this._tDat = -1e9;
      this.nv = 0; this.ni = 0; this.bI0 = 0; this.bT = []; this.bOp = 0; this._g = new Array(NT).fill(null); this._loT = []; this._loO = []; this._loI = []; this._loN = [];
      this._dich = null; this._lop = null; this._tam = {}; this._ngan.length = 0; this._bb = null; this._vCo = false;
      return true;
    },
    // tự kiểm: vẽ 1 ô đỏ + 1 ô xanh cộng màu qua đúng đường vẽ thật rồi đọc lại điểm ảnh
    tuKiem() {
      const gl = this.gl, cv = this.cv, w0 = cv.width, h0 = cv.height;
      try {
        cv.width = 8; cv.height = 8; gl.viewport(0, 0, 8, 8); gl.uniform3f(this._kt, 2 / 8, 2 / 8, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        const mk = (m) => { const c = document.createElement('canvas'); c.width = c.height = 4; const x = c.getContext('2d'); x.fillStyle = m; x.fillRect(0, 0, 4, 4); return c; };
        const x = this.x; x.dat(1, 0, 0); x.al = 1; x.op = 0; this.dangVe = true;
        x.drawImage(mk('#ff0000'), 0, 0, 4, 8); x.globalAlpha = 0.5; x.drawImage(mk('#0000ff'), 4, 0, 4, 8);
        x.globalAlpha = 1; x.globalCompositeOperation = 'lighter'; x.drawImage(mk('#00ff00'), 0, 0, 4, 8);
        this.xa(); this.dangVe = false; x.dat(1, 0, 0); x.al = 1; x.op = 0;
        const p = new Uint8Array(8); gl.readPixels(1, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); gl.readPixels(6, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p.subarray(4));
        gl.clear(gl.COLOR_BUFFER_BIT); cv.width = w0; cv.height = h0;
        const gan = (a, b) => Math.abs(a - b) <= 3;
        this.kiem = Array.from(p).join(',');
        return gan(p[0], 255) && gan(p[1], 255) && gan(p[2], 0) && gan(p[3], 255) && gan(p[4], 0) && gan(p[5], 0) && gan(p[6], 128) && gan(p[7], 128) && !gl.getError();
      } catch (e) { this.dangVe = false; this.x.al = 1; this.x.op = 0; return false; }
    },

    // ---------- khung hình ----------
    // gọi đầu REN.ve0: true = khung này vẽ TẤT CẢ bằng GL qua GLR.x (#cv để trống, chỉ làm canvas nháp cho lệnh vector); false = REN vẽ 2D như cũ
    khung(REN, k, rx, ry) {
      if (!this.bat) return false;
      if (!this.gl) { if (this._thu || !this.khoiTao(REN)) return false; }
      if (this.mat || this.gl.isContextLost() || typeof G === 'undefined' || !G.ban.length) { this.dangVe = false; this.an(); return false; }
      const gl = this.gl, cv = this.cv, goc = REN.cv, X = this.x;
      if (cv.width !== goc.width || cv.height !== goc.height || cv.style.width !== goc.style.width || cv.style.height !== goc.style.height) {
        cv.width = goc.width; cv.height = goc.height; cv.style.width = goc.style.width; cv.style.height = goc.style.height;
      }
      if (!this.hien) { this.hien = true; cv.style.visibility = ''; }
      this.f++;
      this.nv = 0; this.ni = 0; this.bI0 = 0; this.bT = []; this._loT.length = 0; this._loO.length = 0; this._loI.length = 0; this._loN.length = 0; // khung trước dở dang (lỗi giữa chừng): bỏ
      if (this._day && this.f - this._tDat > 600) this.datLaiAtlas(); // atlas đầy: dọn giữa 2 khung (không dọn quá 1 lần / 600 khung)
      if (this.f % 300 === 0 || (this._riengB > RIENG_MAX && this.f - this._tDon > 60)) this.donRieng();
      this._dich = null; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform3f(this._kt, 2 / cv.width, 2 / cv.height, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      if (this._lopTT) { const q = this._lopTT; this._lopTT = null; X.al = q[0]; X.op = q[1]; X._s = q[3]; X._st = q[4]; X._sC = true; X._sv++; } // khung trước dừng giữa lớp hiệu ứng
      X.dat(k, rx, ry); this.dangVe = true; this._bb = null; this._ngan.length = 0;
      this.cvVe = goc; this.xVe = REN.ctx; this._svVe = -1; this._vCo = false; const vb = this._vb; vb[0] = vb[1] = Infinity; vb[2] = vb[3] = -Infinity; this._chuMoi = 0;
      const d = this.dem; d.lenh = 0; d.o = 0; d.tai = 0; d.px = 0; d.vec = 0; d.chu = 0;
      return true;
    },
    xong() { if (!this.dangVe) return; this.xa(); if (this._dich) this.datDich(null); this.dangVe = false; },
    // chép trạng thái "dính" (alpha, kiểu hoà màu, phông, canh chữ, màu, nét…) a → b (ngữ cảnh 2D thật ↔ GLR.x) ở khung đổi chế độ vẽ: nối nhau như 1 ngữ cảnh liền mạch
    chep(a, b) {
      for (const k of ['globalAlpha', 'globalCompositeOperation', 'font', 'textAlign', 'textBaseline', 'fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'filter', 'lineDashOffset']) {
        const v = a[k]; if (b[k] !== v) b[k] = v;
      }
    },

    // ---------- kho texture ----------
    taoTex(w, h) {
      const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); this._g[0] = t;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return t;
    },
    gan(t) { if (this._g[0] !== t) { this.gl.bindTexture(this.gl.TEXTURE_2D, t); this._g[0] = t; } }, // đơn vị texture 0 (luôn là đơn vị đang chọn ngoài lúc phát lô): tải ảnh
    quenGan() { const gl = this.gl, g = this._g; for (let j = NT - 1; j >= 0; j--) if (g[j]) { gl.activeTexture(gl.TEXTURE0 + j); gl.bindTexture(gl.TEXTURE_2D, null); g[j] = null; } gl.activeTexture(gl.TEXTURE0); this.bT = []; }, // sau khi xoá texture: gỡ mọi đơn vị texture (sổ ghi "đang gắn" luôn đúng thật) + bỏ danh sách texture của dãy đang gom (gọi sau xa())
    datLaiAtlas() {
      const gl = this.gl; this.xa(); for (const p of this.trang) gl.deleteTexture(p.tex);
      this.trang = []; this.atlasThe++; this._day = false; this._tDat = this.f; this.quenGan();
    },
    donRieng() { // texture riêng / canvas tạm GPU không dùng > 600 khung → trả bộ nhớ GPU
      const gl = this.gl, ds = this.rieng; let j = 0;
      for (let i = 0; i < ds.length; i++) { const E = ds[i]; if (this.f - E.dung > 600) { if (E.tex) gl.deleteTexture(E.tex); E.tex = null; } else ds[j++] = E; }
      ds.length = j; this.quenGan(); this._tDon = this.f;
      // NGÂN SÁCH texture riêng (ảnh > 512², dải khung ụ / hiệu ứng): quá RIENG_MAX → bỏ dần ảnh lâu không dùng nhất (không bỏ ảnh vừa vẽ trong 2 khung gần đây; cần lại thì tải lại)
      let tong = 0; for (const E of ds) tong += E.W * E.H * 4;
      if (tong > RIENG_MAX) {
        ds.sort((a, b) => a.dung - b.dung); let i = 0;
        for (; i < ds.length && tong > RIENG_MAX && this.f - ds[i].dung > 2; i++) { const E = ds[i]; tong -= E.W * E.H * 4; if (E.tex) gl.deleteTexture(E.tex); E.tex = null; }
        ds.splice(0, i);
      }
      this._riengB = tong;
      for (const k in this._tam) { const D = this._tam[k]; if (this.f - D.dung > 600) { this.huyDich(D); delete this._tam[k]; } }
    },
    // bộ nhớ GPU đang giữ (byte, ước lượng RGBA 4 byte/điểm): atlas + texture riêng + bộ đệm khung (lớp hiệu ứng, canvas tạm) + bộ đệm vẽ của canvas GL
    boNho() {
      if (!this.gl || !this.trang) return null;
      let rieng = 0, n = 0, tam = 0; for (const E of this.rieng) if (E.tex) { rieng += E.W * E.H * 4; n++; }
      for (const k in this._tam) tam += this._tam[k].width * this._tam[k].height * 4;
      const atlas = this.trang.length * this.atlasCo * this.atlasCo * 4, lop = this._lop ? this._lop.width * this._lop.height * 4 : 0, cv = this.cv.width * this.cv.height * 4 * 2;
      const day = this.trang.reduce((s, p) => s + p.y, 0) / Math.max(1, this.trang.length * this.atlasCo);
      return { atlasTrang: this.trang.length, atlas, atlasDay: +day.toFixed(2), riengN: n, rieng, lop, tam, canvasGL: cv, chu: this.khoChu.size, tong: atlas + rieng + lop + tam + cv };
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
      const gl = this.gl; let E;
      if (im._dich) return im.the === this.the && im !== this._dich ? im.E : null; // bộ đệm khung (lớp hiệu ứng / canvas tạm GPU): dùng thẳng texture của nó
      E = this.map.get(im);
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
          if (this.soat) this.soat(im, E, 1);
        } else if (this.soat) this.soat(im, E, 0);
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
          E = { tex: t, x: 0, y: 0, W: w, H: h, w, h, the: this.the, dung: this.f, rieng: 1 }; this.rieng.push(E); this._riengB += w * h * 4;
        }
      } catch (e) { im._glLoi = this.the; this.ghiThieu('bo:tai-loi'); return null; }
      E.v = im._glV | 0; this.dem.tai++; this.map.set(im, E); if (this.soat) this.soat(im, E, 1); return E;
    },

    // ---------- đích vẽ phụ (bộ đệm khung) ----------
    taoDich(w, h) {
      const gl = this.gl, D = { _dich: 1, width: w, height: h, tex: this.taoTex(w, h), fb: gl.createFramebuffer(), the: this.the, dung: this.f };
      gl.bindFramebuffer(gl.FRAMEBUFFER, D.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, D.tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._dich ? this._dich.fb : null);
      D.E = { tex: D.tex, x: 0, y: 0, W: w, H: h, w, h };
      return D;
    },
    huyDich(D) { if (!D || D.the !== this.the) return; this.xa(); const gl = this.gl; gl.deleteFramebuffer(D.fb); gl.deleteTexture(D.tex); D.the = -1; this.quenGan(); },
    datDich(D) { // D = null: canvas GL
      this.xa(); const gl = this.gl; this._dich = D; gl.bindFramebuffer(gl.FRAMEBUFFER, D ? D.fb : null);
      // đổi đích vẽ: dãy mới bắt đầu danh sách texture mới; texture của chính đích mới không được còn gắn ở đơn vị nào (WebGL cấm vừa vẽ vào vừa lấy mẫu)
      this.bT = [];
      if (D) { const g = this._g; for (let j = 0; j < NT; j++) if (g[j] === D.tex) { gl.activeTexture(gl.TEXTURE0 + j); gl.bindTexture(gl.TEXTURE_2D, null); g[j] = null; } gl.activeTexture(gl.TEXTURE0); }
      const w = D ? D.width : this.cv.width, h = D ? D.height : this.cv.height; gl.viewport(0, 0, w, h); gl.uniform3f(this._kt, 2 / w, 2 / h, D ? -1 : 1);
    },
    // LỚP HIỆU ỨNG: lopMo() → mọi lệnh GLR.x vẽ vào bộ đệm khung cỡ canvas (ma trận giữ nguyên; alpha 1, source-over, kiểu vẽ riêng của lớp như ngữ cảnh 2D riêng)
    //   → REN khoét ('destination-out') → lopGop(al, cao) đổ vùng có hình xuống canvas với alpha al (chỉ tới hàng `cao`, như lớp 2D chỉ cao tới hết đường).
    lopMo(cao) { // cao (điểm ảnh thiết bị): lớp chỉ cao tới hết đường + lề như lớp 2D (phần thẻ bài phía dưới không bao giờ có hiệu ứng) → bớt bộ nhớ GPU + điểm ảnh xoá
      const cv = this.cv, X = this.x, lh = Math.max(2, Math.min(cv.height, cao || cv.height)); let L = this._lop;
      if (!L || L.the !== this.the || L.width !== cv.width || L.height !== lh) { this.huyDich(L); L = this._lop = this.taoDich(cv.width, lh); }
      this.datDich(L); this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this._lopTT = [X.al, X.op, X.cat, X._s, X._st];
      X.al = 1; X.op = 0; X.cat = null; X._st = this._lopSt || (this._lopSt = []); X._st.length = 0;
      X._s = this._lopS || (this._lopS = Object.assign(KIEU0(), { lineCap: 'round', lineJoin: 'round' })); X._sC = true; X._sv++;
      this._bb = [Infinity, Infinity, -Infinity, -Infinity];
      return X;
    },
    // khung bao (điểm ảnh thiết bị) hình đã vẽ vào lớp: [x0, y0, x1, y1] kẹp trong canvas, null = lớp rỗng
    lopBao(cao) {
      const b = this._bb; if (!b) return null; if (this._vCo) this.vecXa();
      const x0 = Math.max(0, Math.floor(b[0]) - 1), y0 = Math.max(0, Math.floor(b[1]) - 1), x1 = Math.min(this.cv.width, Math.ceil(b[2]) + 1), y1 = Math.min(this.cv.height, cao || 1e9, this._lop ? this._lop.height : 1e9, Math.ceil(b[3]) + 1);
      return x1 > x0 && y1 > y0 ? [x0, y0, x1, y1] : null;
    },
    lopGop(al, cao) {
      const X = this.x, q = this._lopTT, r = this.lopBao(cao), L = this._lop; if (!q) return;
      this._lopTT = null; this._bb = null; this.datDich(null);
      this._lopS = X._s; X.al = q[0]; X.op = q[1]; X.cat = q[2]; X._s = q[3]; X._st = q[4]; X._sC = true; X._sv++;
      if (!r) return;
      const I = this._xi; I.al = al; I.op = 0; I.cat = null; I.trang = 0;
      this.ve(I, L, r[0], r[1], r[2] - r[0], r[3] - r[1], r[0], r[1], r[2] - r[0], r[3] - r[1]);
    },
    // CANVAS TẠM TRÊN GPU: t = GLR.tam(khoá, w, h) (bộ đệm khung giữ lại giữa các khung) · x = GLR.vao(t) (xoá trong, GLR.x về ma trận đơn vị, vẽ vào t)
    //   · GLR.ra() (trở về đích cũ + trạng thái cũ) · ctx.drawImage(t, …) dùng t như 1 ảnh. Thay cho canvas 2D tạm + tải texture mỗi khung.
    tam(khoa, w, h) {
      let D = this._tam[khoa];
      if (!D || D.the !== this.the || D.width !== w || D.height !== h) { this.huyDich(D); D = this._tam[khoa] = this.taoDich(w, h); }
      D.dung = this.f; return D;
    },
    vao(D) {
      const X = this.x; this._ngan.push([this._dich, X.a, X.b, X.c, X.d, X.e, X.f, X.al, X.op, X.cat, X.trang, this._bb]);
      this.datDich(D); this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      X.a = 1; X.b = 0; X.c = 0; X.d = 1; X.e = 0; X.f = 0; X.al = 1; X.op = 0; X.cat = null; X.trang = 0; this._bb = null;
      return X;
    },
    ra() {
      const q = this._ngan.pop(), X = this.x; if (!q) return;
      this.datDich(q[0]); X.a = q[1]; X.b = q[2]; X.c = q[3]; X.d = q[4]; X.e = q[5]; X.f = q[6]; X.al = q[7]; X.op = q[8]; X.cat = q[9]; X.trang = q[10]; this._bb = q[11];
    },

    // ---------- lệnh vector + chữ ----------
    apKieu(t, X) {
      if (this._svVe === X._sv) return; this._svVe = X._sv; const s = X._s;
      for (const k of KIEU) { const v = s[k]; if (t[k] !== v) t[k] = v; }
      t.setLineDash(s.dash || []);
    },
    // fill / stroke / fillRect / strokeRect / chữ xoay: vẽ vào canvas nháp 2D + nới khung bao của cụm; cụm được chép thành ô ảnh ở lần vẽ ảnh kế / lúc xả lô
    veVec(X, f, args) {
      this.ghiThieu(f);
      const t = this.dangVe && this.xVe; if (!t) return;
      const s = X._s; let op = X.op; if (op > 1) { this.ghiThieu('bo:gco-vec:' + OP_TEN[op]); op = 0; }
      if (this._vCo && this._vOp !== op) this.vecXa();
      this._vOp = op;
      t.setTransform(X.a, X.b, X.c, X.d, X.e, X.f); this.apKieu(t, X);
      t.globalAlpha = X.al; t.globalCompositeOperation = op ? 'lighter' : 'source-over';
      const vb = this._vb, tl = Math.max(Math.hypot(X.a, X.b), Math.hypot(X.c, X.d));
      let x0, y0, x1, y1, le = 2, ca = s.shadowBlur > 0 || s.filter !== 'none';
      if (!ca) {
        if (f === 'fill' || f === 'stroke') { const p = X._pb; x0 = p[0]; y0 = p[1]; x1 = p[2]; y1 = p[3]; }
        else {
          let u0, v0, u1, v1;
          if (f === 'fillRect' || f === 'strokeRect') { u0 = Math.min(args[0], args[0] + args[2]); v0 = Math.min(args[1], args[1] + args[3]); u1 = Math.max(args[0], args[0] + args[2]); v1 = Math.max(args[1], args[1] + args[3]); }
          else { const m = t.measureText(String(args[0])); u0 = args[1] - m.actualBoundingBoxLeft; u1 = args[1] + m.actualBoundingBoxRight; v0 = args[2] - m.actualBoundingBoxAscent; v1 = args[2] + m.actualBoundingBoxDescent; }
          x0 = y0 = Infinity; x1 = y1 = -Infinity;
          for (let i = 0; i < 4; i++) { const u = i & 1 ? u1 : u0, v = i & 2 ? v1 : v0, px = X.a * u + X.c * v + X.e, py = X.b * u + X.d * v + X.f; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
        }
        if (f !== 'fill' && f !== 'fillRect' && f !== 'fillText') le += s.lineWidth * tl * (s.lineJoin === 'miter' ? 3 : 0.75);
        if (!(x0 > -1e6 && x1 < 1e6 && y0 > -1e6 && y1 < 1e6)) ca = true;
      }
      if (ca) { vb[0] = vb[1] = 0; vb[2] = this.cvVe.width; vb[3] = this.cvVe.height; }
      else { if (x0 - le < vb[0]) vb[0] = x0 - le; if (y0 - le < vb[1]) vb[1] = y0 - le; if (x1 + le > vb[2]) vb[2] = x1 + le; if (y1 + le > vb[3]) vb[3] = y1 + le; }
      this._vCo = true;
      const cat = X.cat;
      if (cat) { // cắt chữ nhật đang hiệu lực (ô kính Lucky Slot…): áp lên canvas nháp bằng Path2D (không đụng đường đang dựng), trả lại sau lệnh
        t.save();
        for (const k of cat) { const q = new Path2D(); q.rect(k.x0, k.y0, k.x1 - k.x0, k.y1 - k.y0); t.setTransform(k.m[0], k.m[1], k.m[2], k.m[3], k.m[4], k.m[5]); t.clip(q); }
        t.setTransform(X.a, X.b, X.c, X.d, X.e, X.f);
      }
      try { t[f].apply(t, args); } catch (e) { }
      if (cat) t.restore();
    },
    // chép cụm vector vừa vẽ ở canvas nháp thành 1 ô ảnh (texture riêng, tải 1 lần) chèn vào lô đúng thứ tự, rồi xoá vùng đó ở canvas nháp
    vecXa() {
      if (!this._vCo) return; this._vCo = false;
      const vb = this._vb, cv = this.cvVe, t = this.xVe;
      const x0 = Math.max(0, Math.floor(vb[0])), y0 = Math.max(0, Math.floor(vb[1])), x1 = Math.min(cv.width, Math.ceil(vb[2])), y1 = Math.min(cv.height, Math.ceil(vb[3]));
      vb[0] = vb[1] = Infinity; vb[2] = vb[3] = -Infinity;
      if (!(x1 > x0 && y1 > y0)) return;
      const w = x1 - x0, h = y1 - y0;
      let B = this._vB; if (!B) { B = this._vB = document.createElement('canvas'); B._glD = 1; this._vBx = B.getContext('2d'); }
      B.width = w; B.height = h; this._vBx.drawImage(cv, x0, y0, w, h, 0, 0, w, h);
      t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(x0, y0, w, h);
      const I = this._xi; I.al = 1; I.op = this._vOp; I.cat = null; I.trang = 0; this.dem.vec++;
      this.ve(I, B, 0, 0, w, h, x0, y0, w, h);
    },
    // fillText / strokeText không xoay, màu đặc: ảnh chữ dựng 1 lần (kho ≤ 400 mục, khoá = chữ + phông + màu + canh + tỉ lệ) → mỗi khung 1 ô ảnh bám điểm ảnh thiết bị.
    //   Chữ xoay / gradient / bóng / quá 12 chữ MỚI trong 1 khung (số nhảy liên tục) → đường vector (không giữ texture).
    veChu(X, f, args) {
      const s = X._s, k = X.a, st = f === 'fillText' ? s.fillStyle : s.strokeStyle;
      if (args.length > 3 || X.b || X.c || !(k > 0) || Math.abs(X.d - k) > 1e-6 * k || typeof st !== 'string' || s.shadowBlur > 0 || s.filter !== 'none' || X.op > 1) return this.veVec(X, f, args);
      const chu = String(args[0]), net = f === 'strokeText';
      const key = f + '\n' + chu + '\n' + s.font + '\n' + st + '\n' + s.textAlign + s.textBaseline + Math.round(k * 1000) + (net ? '\n' + s.lineWidth + s.lineJoin + s.miterLimit + (s.dash || '') : '');
      let E = this.khoChu.get(key);
      if (!E) {
        if (this._chuMoi > 12) return this.veVec(X, f, args);
        const m = this.xDo(); m.font = s.font; m.textAlign = s.textAlign; m.textBaseline = s.textBaseline;
        const d = m.measureText(chu), l = d.actualBoundingBoxLeft, r = d.actualBoundingBoxRight, as = d.actualBoundingBoxAscent, de = d.actualBoundingBoxDescent;
        const le = (net ? s.lineWidth * (s.lineJoin === 'miter' ? 3 : 0.75) : 0) + 2 / k;
        const w = Math.ceil((l + r + 2 * le) * k) + 1, h = Math.ceil((as + de + 2 * le) * k) + 1;
        if (!(l + r > 0 && as + de > 0 && w > 0 && h > 0)) E = { c: null };
        else if (w * h > 1048576 || w > this.texMax || h > this.texMax) return this.veVec(X, f, args);
        else {
          const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), ox = Math.round((le + l) * k), oy = Math.round((le + as) * k);
          x.setTransform(k, 0, 0, k, ox, oy); for (const q of KIEU) x[q] = s[q]; if (s.dash) x.setLineDash(s.dash);
          x[f](chu, 0, 0); E = { c, ox, oy };
        }
        if (this.khoChu.size >= 400) this.khoChu.clear();
        this.khoChu.set(key, E); this._chuMoi++;
      }
      this.ghiThieu(f); this.dem.chu++;
      if (!E.c || !this.dangVe) return;
      if (this._vCo) this.vecXa();
      const I = this._xi, c = E.c; I.al = X.al; I.op = X.op; I.cat = X.cat; I.trang = 0;
      this.ve(I, c, 0, 0, c.width, c.height, Math.round(k * args[1] + X.e) - E.ox, Math.round(k * args[2] + X.f) - E.oy, c.width, c.height);
    },

    // ---------- gom lô ----------
    datOp(op) {
      if (this._op === op) return; this._op = op; const gl = this.gl;
      if (op === 1) gl.blendFunc(gl.ONE, gl.ONE); // lighter: cộng cả màu lẫn alpha (đúng nghĩa canvas)
      else if (op === 2) gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA); // destination-out
      else if (op === 3) gl.blendFunc(gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // source-atop
      else if (op === 4) gl.blendFunc(gl.DST_ALPHA, gl.ZERO); // source-in (chỉ trong ô vẽ)
      else if (op === 5) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR); // screen
      else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // source-over (alpha nhân sẵn)
    },
    // khép dãy đang gom (cùng texture + kiểu hoà màu) thành 1 lệnh vẽ chờ phát
    ngat() { const n = this.ni - this.bI0; if (n > 0) { this._loT.push(this.bT); this._loO.push(this.bOp); this._loI.push(this.bI0); this._loN.push(n); this.bI0 = this.ni; } },
    // phát mọi thứ đang chờ: 1 lần tải đỉnh + chỉ số, rồi mỗi dãy 1 drawElements
    xa() {
      if (this._vCo) this.vecXa();
      this.ngat(); const T = this._loT, nb = T.length;
      if (nb) {
        const gl = this.gl, O = this._loO, I = this._loI, N = this._loN;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._f.subarray(0, this.nv * W9)); gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this._i.subarray(0, this.ni));
        const g = this._g; let dv = 0;
        for (let i = 0; i < nb; i++) {
          this.datOp(O[i]); const L = T[i];
          for (let j = 0; j < L.length; j++) if (g[j] !== L[j]) { if (dv !== j) { gl.activeTexture(gl.TEXTURE0 + j); dv = j; } gl.bindTexture(gl.TEXTURE_2D, L[j]); g[j] = L[j]; }
          gl.drawElements(gl.TRIANGLES, N[i], gl.UNSIGNED_SHORT, I[i] * 2);
        }
        if (dv) gl.activeTexture(gl.TEXTURE0);
        this.dem.lenh += nb; T.length = 0; O.length = 0; I.length = 0; N.length = 0;
      }
      this.nv = 0; this.ni = 0; this.bI0 = 0;
    },
    // lõi: như ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh) với trạng thái X (ma trận, alpha, hoà màu, cắt, trắng)
    ve(X, im, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (!this.dangVe) return;
      const al = X.al; if (!(al > 0)) return;
      const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height; if (!w || !h) return;
      if (!(huu(sx) && huu(sy) && huu(sw) && huu(sh) && huu(dx) && huu(dy) && huu(dw) && huu(dh)) || !sw || !sh) return;
      if (this._vCo && X !== this._xi) this.vecXa(); // cụm vector vẽ trước ảnh này: chèn vào lô trước
      // nguồn âm → chuẩn hoá; nguồn lòi ra ngoài ảnh → cắt cả nguồn lẫn đích theo tỉ lệ (như canvas)
      if (sw < 0) { sx += sw; sw = -sw; } if (sh < 0) { sy += sh; sh = -sh; }
      if (sx < 0 || sy < 0 || sx + sw > w || sy + sh > h) {
        const x0 = Math.max(0, sx), y0 = Math.max(0, sy), x1 = Math.min(w, sx + sw), y1 = Math.min(h, sy + sh); if (!(x1 > x0 && y1 > y0)) return;
        const kx = dw / sw, ky = dh / sh; dx += (x0 - sx) * kx; dy += (y0 - sy) * ky; dw = (x1 - x0) * kx; dh = (y1 - y0) * ky; sx = x0; sy = y0; sw = x1 - x0; sh = y1 - y0;
      }
      const E = this.tra(im, w, h); if (!E) return;
      const op = X.op;
      if (op !== this.bOp) { this.ngat(); this.bOp = op; }
      let bT = this.bT, ti = bT.indexOf(E.tex);
      if (ti < 0) { if (bT.length >= NT) { this.ngat(); bT = this.bT = []; } ti = bT.length; bT.push(E.tex); } // danh sách chỉ nối thêm (dãy đã khép giữ tham chiếu), đầy thì mở danh sách mới
      if (this.nv + 16 > DINH_MAX) this.xa();
      const a = X.a, b = X.b, c = X.c, d = X.d, e = X.e, f = X.f;
      const iw = 1 / E.W, ih = 1 / E.H, u0 = (E.x + sx) * iw, v0 = (E.y + sy) * ih, u1 = (E.x + sx + sw) * iw, v1 = (E.y + sy + sh) * ih;
      // giới hạn lấy mẫu = trong ô nguồn (như canvas: không lem điểm ảnh khung/ảnh bên cạnh)
      let g0 = u0 + 0.5 * iw, g2 = u1 - 0.5 * iw, g1 = v0 + 0.5 * ih, g3 = v1 - 0.5 * ih;
      if (g0 > g2) g0 = g2 = (u0 + u1) / 2; if (g1 > g3) g1 = g3 = (v0 + v1) / 2;
      const A = Math.round(al * 255), mau = (A | (A << 8) | (A << 16) | (A << 24)) >>> 0, tr = (X.trang || 0) + 2 * ti; // màu nhân sẵn alpha
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
      const bb = this._bb;
      if (bb && op !== 2) { // lớp hiệu ứng: khung bao hình đã vẽ (khoét chỉ xoá → không nới)
        const m0 = Math.min(X0, X1, X2, X3), m1 = Math.min(Y0, Y1, Y2, Y3), m2 = Math.max(X0, X1, X2, X3), m3 = Math.max(Y0, Y1, Y2, Y3);
        if (m0 < bb[0]) bb[0] = m0; if (m1 < bb[1]) bb[1] = m1; if (m2 > bb[2]) bb[2] = m2; if (m3 > bb[3]) bb[3] = m3;
      }
      if (X.cat) { this.veCat(X.cat, [X0, Y0, ua, va, la, ma, X1, Y1, ub, va, lb, ma, X2, Y2, ub, vb, lb, mb, X3, Y3, ua, vb, la, mb], g0, g1, g2, g3, lw, lh, mau, tr); return; }
      let o = this.nv * W9; const v = this.nv;
      F[o] = X0; F[o + 1] = Y0; F[o + 2] = ua; F[o + 3] = va; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = la; F[o + 9] = ma; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; F[o + 13] = tr; o += W9;
      F[o] = X1; F[o + 1] = Y1; F[o + 2] = ub; F[o + 3] = va; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = lb; F[o + 9] = ma; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; F[o + 13] = tr; o += W9;
      F[o] = X2; F[o + 1] = Y2; F[o + 2] = ub; F[o + 3] = vb; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = lb; F[o + 9] = mb; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; F[o + 13] = tr; o += W9;
      F[o] = X3; F[o + 1] = Y3; F[o + 2] = ua; F[o + 3] = vb; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = la; F[o + 9] = mb; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; F[o + 13] = tr;
      const i = this.ni; I[i] = v; I[i + 1] = v + 1; I[i + 2] = v + 2; I[i + 3] = v; I[i + 4] = v + 2; I[i + 5] = v + 3;
      this.nv = v + 4; this.ni = i + 6; this.dem.o++;
    },
    // ô bị cắt bởi (các) hình chữ nhật clip: cắt đa giác lồi (Sutherland–Hodgman) trong toạ độ của clip, nội suy cả UV → quạt tam giác
    veCat(cat, P, g0, g1, g2, g3, lw, lh, mau, tr) {
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
      const n = P.length / K; if (this.nv + n > DINH_MAX) this.xa();
      const F = this._f, U = this._u, I = this._i, v = this.nv; let o = v * W9;
      for (let i = 0; i < n; i++, o += W9) { F[o] = P[i * K]; F[o + 1] = P[i * K + 1]; F[o + 2] = P[i * K + 2]; F[o + 3] = P[i * K + 3]; F[o + 4] = g0; F[o + 5] = g1; F[o + 6] = g2; F[o + 7] = g3; F[o + 8] = P[i * K + 4]; F[o + 9] = P[i * K + 5]; F[o + 10] = lw; F[o + 11] = lh; U[o + 12] = mau; F[o + 13] = tr; }
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
    thongTin() { return { bat: this.bat, phien: this.phien, mat: this.mat, lyDo: this.lyDo, kiem: this.kiem, trang: this.trang ? this.trang.length : 0, rieng: this.rieng ? this.rieng.length : 0, thieu: this.thieu, dem: this.dem, boNho: this.boNho() }; },
  };
  R.bat = R.quyetDinh();
  return R;
})();
