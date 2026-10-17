/* =====================================================================
   lam3d-core.js — Lam (thợ giữ chuông) dựng 3D mượt rồi GIẢM XUỐNG PIXEL (kiểu Dead Cells).
   Chạy với Three.js r128 (biến toàn cục THREE, cdnjs) — dùng chung cho:
     tools/studio-3d.html (xem/chỉnh trên iPhone) và tools/in-lam3d.py (in sẵn atlas bằng Chromium headless).
   Thành phần:
     • Mô hình: mũ trùm (Extrude bo tròn) + viền xanh (Tube) + mặt tối + 2 mắt sáng, áo choàng VẢI MÔ PHỎNG
       (verlet, gắn vai, va chạm thân, đuôi rách răng cưa), vạt áo xanh trước (vải), tay chân capsule thuôn,
       khớp cầu chồng lên nhau, ủng, kiếm, chuông vàng con lắc sau mũ.
     • Xương: phân cấp Object3D (hông → lưng → ngực → cổ → đầu; vai → khuỷu → cổ tay; háng → gối → cổ chân),
       IK 2 xương cho chân (và tay khi bám tường/thang), keyframe nội suy Catmull-Rom (đường cong bậc 3),
       thân/đầu trễ sau hông (overlap), squash/stretch.
     • Render pixel: camera trực giao nhìn ngang, shader toon 3 bậc khóa palette, render thẳng 64×64
       (hoặc ×2 rồi gộp màu đa số), hậu kỳ: viền ngoài 1px, viền trong theo bộ phận, dọn pixel lẻ, mắt,
       vệt chém (smear), hiệu ứng chuông.
   API: LAM3D.tao(THREE, tuyChon) → đối tượng lam  ·  lam.chayAnim(ten) → khung pixel  ·  LAM3D.ANIMS (lam3d-anim.js)
   ===================================================================== */
(function (root) {
'use strict';
var L3 = root.LAM3D = root.LAM3D || {};

/* ---------------- Palette khóa ---------------- */
var HEX = {
  vien: '#0C0F14', a0: '#1A212B', a1: '#212835', a2: '#2C3546', a3: '#4A5A6E',
  x0: '#21413A', x1: '#32804F', x2: '#83CC93', v0: '#9C6B30', v1: '#E1B85A', v2: '#F3E6C8', k: '#CEF0D6'
};
L3.HEX = HEX;
var PAL = [];   // [r,g,b] theo thứ tự
var PAL_TEN = [];
for (var kk in HEX) { PAL_TEN.push(kk); PAL.push(hexRgb(HEX[kk])); }
L3.PAL = PAL; L3.PAL_TEN = PAL_TEN;
function hexRgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
function palIdx(r, g, b) {
  var best = 0, bd = 1e9;
  for (var i = 0; i < PAL.length; i++) {
    var p = PAL[i], d = (p[0] - r) * (p[0] - r) + (p[1] - g) * (p[1] - g) + (p[2] - b) * (p[2] - b);
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}
var IV = PAL_TEN.indexOf('vien');
function PI_(t) { return PAL_TEN.indexOf(t); }

/* Họ màu (tối → sáng). Vật liệu lấy 3 bậc liên tiếp từ vị trí b; tay/chân phía sau lùi 1 bậc */
var HO = {
  toi:  ['vien', 'a0', 'a1', 'a2', 'a3'],
  xanh: ['a0', 'x0', 'x1', 'x2', 'k'],
  vang: ['v0', 'v0', 'v1', 'v2', 'v2'],
  kiem: ['x1', 'x2', 'k', 'v2', 'v2'],
  den:  ['vien', 'vien', 'vien', 'vien', 'vien']
};

/* ---------------- Mã bộ phận (pass ID) & nhóm để vẽ viền trong ---------------- */
var ID = { mu: 1, mat: 2, vienMu: 3, khoac: 4, than: 5, vat: 6, ao: 7, tayG: 8, tayX: 9, chanG: 10, chanX: 11,
           ungG: 12, ungX: 13, luoi: 14, chuoi: 15, chuong: 16, tram: 17, mat2: 18, chem: 19, fx: 20 };
L3.ID = ID;
var NHOM = {};
[[ID.mu, 'dau'], [ID.mat, 'dau'], [ID.vienMu, 'dau'], [ID.mat2, 'dau'],
 [ID.khoac, 'than'], [ID.than, 'than'], [ID.vat, 'than'], [ID.tram, 'than'],
 [ID.ao, 'ao'], [ID.tayG, 'tayG'], [ID.tayX, 'tayX'], [ID.chanG, 'chanG'], [ID.ungG, 'chanG'],
 [ID.chanX, 'chanX'], [ID.ungX, 'chanX'], [ID.luoi, 'kiem'], [ID.chuoi, 'kiem'], [ID.chuong, 'chuong']
].forEach(function (a) { NHOM[a[0]] = a[1]; });

/* ---------------- Kích thước (đơn vị; Lam cao ~1.6) ---------------- */
var K = {
  hongY: 0.50, hang: [0.0, -0.04, 0.085], dui: 0.20, cang: 0.21, coChan: 0.07,
  lung: [0, 0.08], nguc: [0, 0.17], co: [0.01, 0.235], dau: [0, 0.03],
  vai: [-0.01, 0.16, 0.165], canhTay: 0.16, cangTay: 0.15
};
L3.K = K;
var D2R = Math.PI / 180;

function tao(THREE, tuy) {
  tuy = tuy || {};
  var V3 = THREE.Vector3;
  var lam = { THREE: THREE, mats: [], meshes: [] };
  var U = lam.uni = {
    uL: { value: new V3(0.5, 0.75, 0.45).normalize() },
    t1: { value: 0.40 }, t2: { value: 0.70 }
  };
  lam.anhSang = { cao: 50, ngang: 35 };   // độ: cao (trên-trước), xoay ngang về phía camera

  /* ----- vật liệu toon 3 bậc ----- */
  var VS = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var FS = 'precision highp float; uniform vec3 c0,c1,c2,b0,b1,b2; uniform vec3 uL; uniform float t1,t2,bias; varying vec3 vN;' +
    'void main(){ vec3 n=normalize(vN); bool bk=!gl_FrontFacing; if(bk) n=-n;' +
    ' float d=dot(n,uL)*0.5+0.5+bias; vec3 a;' +
    ' if(bk) a = d>t2?b2:(d>t1?b1:b0); else a = d>t2?c2:(d>t1?c1:c0);' +
    ' gl_FragColor=vec4(a,1.0); }';
  var VSV = 'attribute float aVien; varying float vH; varying vec3 vN; void main(){ vH=aVien; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var FSV = 'precision highp float; uniform vec3 c0,c1,c2,b0,b1,b2,h0,h1,h2; uniform vec3 uL; uniform float t1,t2,bias; varying vec3 vN; varying float vH;' +
    'void main(){ vec3 n=normalize(vN); bool bk=!gl_FrontFacing; if(bk) n=-n;' +
    ' float d=dot(n,uL)*0.5+0.5+bias; vec3 a;' +
    ' if(vH>0.5) a = d>t2?h2:(d>t1?h1:h0); else if(bk) a = d>t2?b2:(d>t1?b1:b0); else a = d>t2?c2:(d>t1?c1:c0);' +
    ' gl_FragColor=vec4(a,1.0); }';
  var VSI = 'void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var FSI = 'precision highp float; uniform float uId; void main(){ float z=clamp(gl_FragCoord.z,0.0,1.0)*255.0;' +
    ' gl_FragColor=vec4(uId/255.0, floor(z)/255.0, fract(z), 1.0); }';
  function bac(ho, b) {
    var h = HO[ho], o = [];
    for (var i = 0; i < 3; i++) o.push(new THREE.Color(HEX[h[Math.max(0, Math.min(h.length - 1, b + i))]]));
    return o;
  }
  function vatLieu(spec, id, sau) {
    // spec: {ho, b, bias, hoSau, bSau, hai}
    var b = spec.b - (sau ? 1 : 0);
    var c = bac(spec.ho, b), bb = bac(spec.hoSau || spec.ho, (spec.bSau != null ? spec.bSau : spec.b) - (sau ? 1 : 0));
    var m = new THREE.ShaderMaterial({
      uniforms: { c0: { value: c[0] }, c1: { value: c[1] }, c2: { value: c[2] }, b0: { value: bb[0] }, b1: { value: bb[1] }, b2: { value: bb[2] },
        uL: U.uL, t1: U.t1, t2: U.t2, bias: { value: spec.bias || 0 } },
      vertexShader: spec.vien ? VSV : VS, fragmentShader: spec.vien ? FSV : FS, side: spec.hai ? THREE.DoubleSide : THREE.FrontSide
    });
    if (spec.vien) { var hh = bac(spec.vien[0], spec.vien[1] - (sau ? 1 : 0)); m.uniforms.h0 = { value: hh[0] }; m.uniforms.h1 = { value: hh[1] }; m.uniforms.h2 = { value: hh[2] }; }
    var mi = new THREE.ShaderMaterial({ uniforms: { uId: { value: id } }, vertexShader: VSI, fragmentShader: FSI,
      side: spec.hai ? THREE.DoubleSide : THREE.FrontSide });
    lam.mats.push(m);
    return { m: m, mi: mi };
  }
  function luoi(geo, spec, id, cha, sau) {
    var v = vatLieu(spec, id, sau);
    var me = new THREE.Mesh(geo, v.m);
    me.userData.m = v.m; me.userData.mi = v.mi; me.userData.id = id;
    me.frustumCulled = false;
    if (cha) cha.add(me);
    lam.meshes.push(me);
    return me;
  }

  /* ----- hình học ----- */
  // capsule thuôn dọc trục -Y: đầu trên (0,0) bán kính r1, đầu dưới (0,-len) bán kính r2
  function capsule(r1, r2, len, seg) {
    seg = seg || 14;
    var pts = [], n = 6, i, a;
    for (i = 0; i <= n; i++) { a = -Math.PI / 2 + (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r2 + 1e-4, -len + Math.sin(a) * r2)); }
    for (i = 0; i <= n; i++) { a = (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r1 + 1e-4, Math.sin(a) * r1)); }
    return new THREE.LatheGeometry(pts, seg);
  }
  function cau(r, sx, sy, sz) {
    var g = new THREE.SphereGeometry(r, 16, 12);
    if (sx) g.scale(sx, sy, sz);
    return g;
  }
  // đường cong mượt qua các điểm 2D; nhon = chỉ số điểm giữ góc nhọn
  function muot(pts, nhon, n) {
    var out = [], N = pts.length;
    for (var i = 0; i < N; i++) {
      var p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      if (nhon.indexOf(i) >= 0) p0 = [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
      if (nhon.indexOf((i + 1) % N) >= 0) p3 = [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
      for (var s = 0; s < n; s++) {
        var t = s / n, t2 = t * t, t3 = t2 * t;
        out.push(new THREE.Vector2(
          0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)));
      }
    }
    return out;
  }
  function epHinh(pts2, nhon, sau, vat, n) {
    var sh = new THREE.Shape(muot(pts2, nhon, n || 6));
    var g = new THREE.ExtrudeGeometry(sh, { depth: sau, bevelEnabled: true, bevelThickness: vat, bevelSize: vat * 0.9,
      bevelSegments: 3, curveSegments: 8 });
    g.translate(0, 0, -sau / 2);
    g.computeVertexNormals();
    return g;
  }

  /* ----- xương ----- */
  function xuong(ten, cha, x, y, z) { var o = new THREE.Object3D(); o.name = ten; o.position.set(x || 0, y || 0, z || 0); if (cha) cha.add(o); return o; }
  var top = lam.top = xuong('top');           // xoay ngang (yaw) – đặt ở pivot (giữa chân, mặt đất)
  var S = lam.S = xuong('squash', top);        // squash/stretch quanh mặt đất
  var R = lam.R = xuong('goc', S, 0, K.hongY, 0);
  var B = lam.B = {};
  B.hong = xuong('hong', R);
  B.lung = xuong('lung', B.hong, K.lung[0], K.lung[1]);
  B.nguc = xuong('nguc', B.lung, K.nguc[0], K.nguc[1]);
  B.co = xuong('co', B.nguc, K.co[0], K.co[1]);
  B.dau = xuong('dau', B.co, K.dau[0], K.dau[1]);
  B.dau.scale.setScalar(0.88);   // mũ trùm to kiểu chibi (~1/3.5 chiều cao) nhưng không lấn thân
  ['G', 'X'].forEach(function (s) {
    var z = s === 'G' ? 1 : -1, sau = s === 'X';
    B['vai' + s] = xuong('vai' + s, B.nguc, K.vai[0], K.vai[1], K.vai[2] * z);
    B['khuyu' + s] = xuong('khuyu' + s, B['vai' + s], 0, -K.canhTay, 0);
    B['tay' + s] = xuong('tay' + s, B['khuyu' + s], 0, -K.cangTay, 0);
    B['hang' + s] = xuong('hang' + s, B.hong, K.hang[0], K.hang[1], K.hang[2] * z);
    B['goi' + s] = xuong('goi' + s, B['hang' + s], 0, -K.dui, 0);
    B['coChan' + s] = xuong('coChan' + s, B['goi' + s], 0, -K.cang, 0);
    var idT = sau ? ID.tayX : ID.tayG, idC = sau ? ID.chanX : ID.chanG, idU = sau ? ID.ungX : ID.ungG;
    // tay: ống tay áo thuôn + khớp cầu + găng + cổ tay xanh
    var toi = { ho: 'toi', b: 1 }, toi2 = { ho: 'toi', b: 2 };
    luoi(capsule(0.056, 0.047, K.canhTay), toi, idT, B['vai' + s], sau);
    luoi(cau(0.05), toi, idT, B['khuyu' + s], sau);
    luoi(capsule(0.047, 0.043, K.cangTay), toi, idT, B['khuyu' + s], sau);
    var gang = luoi(cau(0.055, 1, 1.1, 1), toi2, idT, B['tay' + s], sau); gang.position.set(0, -0.045, 0);
    var cuff = luoi(new THREE.TorusGeometry(0.047, 0.02, 8, 16), { ho: 'xanh', b: 1, bias: 0.12 }, idT, B['tay' + s], sau);
    cuff.rotation.x = Math.PI / 2; cuff.position.y = 0.0;
    // chân: đùi + khớp gối + cẳng + ủng
    luoi(capsule(0.075, 0.064, K.dui), { ho: 'toi', b: 2, bias: -0.05 }, idC, B['hang' + s], sau);
    luoi(cau(0.064), { ho: 'toi', b: 2, bias: -0.05 }, idC, B['goi' + s], sau);
    luoi(capsule(0.062, 0.052, K.cang), { ho: 'toi', b: 2, bias: -0.05 }, idC, B['goi' + s], sau);
    var bang = luoi(new THREE.TorusGeometry(0.062, 0.02, 8, 16), { ho: 'xanh', b: 1, bias: 0.12 }, idC, B['goi' + s], sau);
    bang.rotation.x = Math.PI / 2; bang.position.y = -0.03;
    var ung = luoi(epHinh([[-0.065, 0.11], [0.055, 0.11], [0.06, 0.02], [0.10, -0.02], [0.15, -0.045], [0.155, -0.07],
      [-0.06, -0.07], [-0.075, -0.02]], [4, 5, 6], 0.075, 0.022, 5), { ho: 'toi', b: 2 }, idU, B['coChan' + s], sau);
    var vu = luoi(new THREE.TorusGeometry(0.066, 0.024, 8, 18), { ho: 'xanh', b: 1, bias: 0.12 }, idU, B['coChan' + s], sau);
    vu.rotation.x = Math.PI / 2; vu.position.set(-0.005, 0.10, 0); vu.scale.set(1.08, 1, 0.9);
    var mui = luoi(cau(0.03, 1.4, 0.9, 1.3), { ho: 'xanh', b: 1, bias: 0.1 }, idU, B['coChan' + s], sau);
    mui.position.set(0.12, -0.035, 0);
  });

  /* thân: hông + bụng + ngực (khối cầu chồng nhau) */
  var toiThan = { ho: 'toi', b: 1 };
  luoi(cau(0.15, 1, 0.8, 0.9), toiThan, ID.than, B.hong).position.set(0, -0.02, 0);
  luoi(capsule(0.15, 0.145, 0.16), toiThan, ID.than, B.nguc).position.set(0, 0.03, 0);
  luoi(cau(0.16, 1, 1.05, 1.05), toiThan, ID.than, B.nguc).position.set(0, 0.07, 0);
  // vạt khoác vai (phần dưới mũ trùm phủ vai)
  var khoacPts = [];
  [[0.10, 0.27], [0.17, 0.22], [0.225, 0.14], [0.25, 0.07], [0.245, 0.03], [0.225, 0.02]].forEach(function (p) { khoacPts.push(new THREE.Vector2(p[0], p[1])); });
  var khoac = luoi(new THREE.LatheGeometry(khoacPts, 22), { ho: 'toi', b: 1, hai: true, hoSau: 'toi', bSau: 0 }, ID.khoac, B.nguc);
  khoac.scale.set(1.0, 1, 0.95); khoac.position.set(-0.03, 0, 0);
  // dây đeo chéo + trâm tròn trước ngực
  var dayCurve = new THREE.CatmullRomCurve3([new V3(0.02, 0.24, 0.17), new V3(0.15, 0.13, 0.08), new V3(0.17, 0.0, -0.02), new V3(0.12, -0.14, -0.12)]);
  luoi(new THREE.TubeGeometry(dayCurve, 16, 0.022, 6, false), { ho: 'toi', b: 2 }, ID.tram, B.nguc);
  var tram = luoi(new THREE.TorusGeometry(0.036, 0.016, 8, 16), { ho: 'kiem', b: 0, bias: 0.15 }, ID.tram, B.nguc);
  tram.position.set(0.20, 0.10, 0.07); tram.rotation.y = Math.PI / 2 - 0.5;
  var tramTam = luoi(cau(0.026, 0.5, 1, 1), { ho: 'xanh', b: 0 }, ID.tram, B.nguc); tramTam.position.set(0.205, 0.10, 0.07);

  /* mũ trùm: ép đùn hồ sơ bên bo tròn, mỏ mũ nhọn chĩa trước-trên */
  var MU = [[-0.16, -0.02], [-0.29, 0.08], [-0.345, 0.23], [-0.32, 0.39], [-0.23, 0.51], [-0.08, 0.585], [0.07, 0.60],
            [0.19, 0.565], [0.285, 0.475], [0.235, 0.425], [0.16, 0.355], [0.10, 0.27], [0.085, 0.15], [0.12, 0.04], [0.16, -0.02],
            [0.05, -0.06]];
  var mu = luoi(epHinh(MU, [8, 14], 0.36, 0.07, 7), { ho: 'toi', b: 2, bias: 0.11 }, ID.mu, B.dau);
  // khoảng tối trong mũ
  var mat = luoi(cau(1, 0.085, 0.15, 0.17), { ho: 'den', b: 0 }, ID.mat, B.dau); mat.position.set(0.135, 0.19, 0);
  // viền xanh mép trước mũ: dải ôm theo đường viền từ đỉnh → mỏ nhọn → miệng mũ → cằm (phủ cả mép bo)
  (function () {
    var SM = muot(MU, [8, 14], 7), n = SM.length, area = 0, i;
    for (i = 0; i < n; i++) { var p0 = SM[i], p1 = SM[(i + 1) % n]; area += p0.x * p1.y - p1.x * p0.y; }
    var sg = area > 0 ? 1 : -1, ngoai = [], trong = [], bocNgoai = [];
    for (i = 6 * 7 + 3; i <= 14 * 7; i++) {
      var pa = SM[(i - 1 + n) % n], pb = SM[(i + 1) % n], dx = pb.x - pa.x, dy = pb.y - pa.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = sg * dy / L, ny = -sg * dx / L;   // pháp tuyến hướng ra ngoài
      ngoai.push(new THREE.Vector2(SM[i].x + nx * 0.066, SM[i].y + ny * 0.066)); bocNgoai.push(new THREE.Vector2(SM[i].x + nx * 0.074, SM[i].y + ny * 0.074));
      trong.push(new THREE.Vector2(SM[i].x - nx * 0.022, SM[i].y - ny * 0.022));
    }
    // dải: mặt gần (trong→ngoài) + mép trước (gần→xa) + mặt xa
    var zf = 0.256, pos = [], idx = [], m = ngoai.length;
    function v(p, z) { pos.push(p.x, p.y, z); return pos.length / 3 - 1; }
    for (i = 0; i < m - 1; i++) {
      [[trong, zf, ngoai, zf], [ngoai, zf, bocNgoai, zf - 0.075]].forEach(function (st) {
        var a0 = v(st[0][i], st[1]), a1 = v(st[2][i], st[3]), b0 = v(st[0][i + 1], st[1]), b1 = v(st[2][i + 1], st[3]);
        idx.push(a0, a1, b0, b0, a1, b1);
      });
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    luoi(g, { ho: 'xanh', b: 1, bias: 0.16, hai: true }, ID.vienMu, B.dau);
  })();
  // hai mắt (khối nhỏ để xem 3D; bản pixel vẽ chắc ở hậu kỳ)
  lam.mat = [];
  [1, -1].forEach(function (s) {
    var e = luoi(cau(0.024, 1, 1.4, 1), { ho: 'kiem', b: 2 }, ID.mat2, B.dau);
    e.position.set(0.205, 0.19, 0.072 * s); lam.mat.push(e);
  });

  /* kiếm: cán tối, chuôi vàng, lưỡi sáng (lưỡi dọc +X trong hệ kiếm) */
  var kiem = lam.kiem = xuong('kiem', B.tayG, 0, -0.045, 0.0);
  var cg = new THREE.CylinderGeometry(0.02, 0.02, 0.10, 8); cg.rotateZ(Math.PI / 2);
  luoi(cg, { ho: 'toi', b: 1 }, ID.chuoi, kiem).position.set(-0.01, 0, 0);
  luoi(cau(0.03), { ho: 'vang', b: 1 }, ID.chuoi, kiem).position.set(-0.07, 0, 0);
  var gd = capsule(0.022, 0.022, 0.15, 8); gd.translate(0, 0.075, 0);
  luoi(gd, { ho: 'vang', b: 1 }, ID.chuoi, kiem).position.set(0.05, 0, 0);
  var LUOI = 0.56;
  lam.luoiDai = LUOI;
  luoi(epHinh([[0.06, 0.04], [0.06 + LUOI * 0.8, 0.036], [0.06 + LUOI, 0.0], [0.06 + LUOI * 0.8, -0.036], [0.06, -0.04]], [0, 2, 4], 0.008, 0.012, 3),
       { ho: 'kiem', b: 0, bias: 0.12 }, ID.luoi, kiem);

  /* chuông vàng treo sau mũ (con lắc) */
  var chuong = lam.chuong = xuong('chuong', top);
  var cpts = [];
  [[0.001, 0.0], [0.03, -0.002], [0.045, -0.025], [0.05, -0.06], [0.056, -0.10], [0.075, -0.135], [0.092, -0.155], [0.088, -0.165], [0.06, -0.162], [0.001, -0.15]]
    .reverse().forEach(function (p) { cpts.push(new THREE.Vector2(p[0], p[1])); });
  var cgeo = new THREE.LatheGeometry(cpts, 18); cgeo.translate(0, -0.035, 0); cgeo.scale(1.45, 1.4, 1.45);
  luoi(cgeo, { ho: 'vang', b: 1, bias: 0.05 }, ID.chuong, chuong);
  luoi(new THREE.TorusGeometry(0.022, 0.009, 6, 12), { ho: 'vang', b: 1 }, ID.chuong, chuong).position.set(0, -0.018, 0);
  luoi(cau(0.03), { ho: 'vang', b: 0 }, ID.chuong, chuong).position.set(0, -0.27, 0);
  lam.chuongNeo = new V3(-0.38, 0.22, 0.27);   // trên mũ (hệ đầu)
  lam.chuongDai = 0.07;

  /* ----- vải: áo choàng (vai) + vạt áo xanh (eo) ----- */
  lam.vai = [];
  function taoVai(o) {
    // o: {cot, hang, neo(i) → [bone, V3 local], xuong: hướng rủ, dai(i,j), them(i) độ dài thêm hàng cuối, spec, id, va}
    var C = o.cot, Rr = o.hang, N = C * Rr;
    var p = new Float32Array(N * 3), q = new Float32Array(N * 3), ghim = [], cs = [];
    var vt = { o: o, C: C, R: Rr, p: p, q: q, ghim: ghim, cs: cs, rest: [] };
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(N * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var idx = [];
    for (var j = 0; j < Rr - 1; j++) for (var i = 0; i < C - 1; i++) {
      var a = j * C + i, b = a + 1, c = a + C, d = c + 1;
      if (j === Rr - 2 && o.rang && o.rang(i)) { idx.push(a, c, b, b, c, d); }   // răng cưa xử lý qua độ dài cột
      else idx.push(a, c, b, b, c, d);
    }
    geo.setIndex(idx);
    var vien = new Float32Array(N);
    if (o.vien) for (var jj = 0; jj < Rr; jj++) for (var ii = 0; ii < C; ii++) vien[jj * C + ii] = o.vien(ii, jj) ? 1 : 0;
    geo.setAttribute('aVien', new THREE.BufferAttribute(vien, 1));
    vt.mesh = luoi(geo, o.spec, o.id, top);
    vt.geo = geo;
    lam.vai.push(vt);
    return vt;
  }
  // áo choàng: neo cung sau lưng (từ vai gần → sau lưng → vai xa)
  var AO_C = 9, AO_R = 9;
  var aoDai = [0.0, 0.10, 0.03, 0.14, 0.05, 0.16, 0.02, 0.12, 0.0];   // độ dài thêm hàng cuối (đuôi rách)
  lam.ao = taoVai({
    cot: AO_C, hang: AO_R, id: ID.ao, spec: { ho: 'toi', b: 1, hai: true, hoSau: 'xanh', bSau: 1, vien: ['xanh', 1] },
    vien: function (i, j) { return j === AO_R - 1 || (j >= AO_R - 3 && (i === 0 || i === AO_C - 1)); },
    neo: function (i) {
      var u = i / (AO_C - 1), a = (-0.5 + u) * Math.PI * 0.85;   // ±77° quanh lưng
      return [B.nguc, new V3(-0.06 - Math.cos(a) * 0.17, 0.17, Math.sin(a) * 0.19)];
    },
    hang0: function (i, j) {   // vị trí nghỉ (hệ top) so với điểm neo
      var u = i / (AO_C - 1), a = (-0.5 + u) * Math.PI * 0.85, t = j / (AO_R - 1);
      var lo = 0.09 * j + (j === AO_R - 1 ? aoDai[i] : 0);
      return new V3(-Math.cos(a) * 0.13 * t - 0.22 * t, -lo, Math.sin(a) * 0.17 * t);
    },
    va: 'ao'
  });
  // vạt áo xanh trước (từ eo rủ xuống gối, mép dưới răng cưa)
  var VT_C = 6, VT_R = 5;
  var vtDai = [0.02, 0.07, 0.0, 0.08, 0.01, 0.05];
  lam.vat = taoVai({
    cot: VT_C, hang: VT_R, id: ID.vat, spec: { ho: 'xanh', b: 1, hai: true, hoSau: 'xanh', bSau: 0, bias: 0.12 },
    neo: function (i) {
      var u = i / (VT_C - 1), a = (-0.5 + u) * Math.PI * 0.8;
      return [B.hong, new V3(0.02 + Math.cos(a) * 0.15, 0.03, Math.sin(a) * 0.15)];
    },
    hang0: function (i, j) {
      var u = i / (VT_C - 1), a = (-0.5 + u) * Math.PI * 0.8, t = j / (VT_R - 1);
      var lo = 0.052 * j + (j === VT_R - 1 ? vtDai[i] * 0.8 : 0);
      return new V3(Math.cos(a) * 0.05 * t, -lo, Math.sin(a) * 0.04 * t);
    },
    va: 'vat'
  });

  /* ---------- tư thế ---------- */
  var MD = L3.MAC_DINH = {
    hx: 0, hy: K.hongY, p: 8, s: 4, c: 2, n: -4, tw: 0, rr: 0, sq: 1, yaw: 0,
    aN: [25, 50, 0], aF: [-12, 25, 6], k: 25, ky: 0, kb: 0, kw: -90,
    fN: [0.07, 0.07, 0], fF: [-0.08, 0.07, 0],
    hN: null, hF: null
  };
  lam.yaw = 35;   // độ – xoay mô hình 3/4 về phía camera
  var tmpV = new V3(), tmpV2 = new V3();

  function ikGoc(gocCha, goc0, x0, y0, tx, ty, L1, L2, chieu) {
    // trả về [góc tuyệt đối khúc 1, góc tuyệt đối khúc 2] (từ hướng -Y, CCW +); chieu=+1: khớp giữa gập về trước
    var dx = tx - x0, dy = ty - y0, d = Math.sqrt(dx * dx + dy * dy);
    d = Math.max(1e-4, Math.min(d, L1 + L2 - 1e-4));
    var th = Math.atan2(dx, -dy);
    var c1 = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d); c1 = Math.max(-1, Math.min(1, c1));
    var a1 = th + chieu * Math.acos(c1);
    var kx = x0 + L1 * Math.sin(a1), ky = y0 - L1 * Math.cos(a1);
    var a2 = Math.atan2(tx - kx, -(ty - ky));
    return [a1, a2];
  }
  function viTriS(o) {   // vị trí khớp trong hệ S (trước squash)
    o.getWorldPosition(tmpV); return S.worldToLocal(tmpV.clone());
  }
  function goc2(v) { return Math.atan2(v.x, -v.y); }

  lam.datTuThe = function (P) {
    top.rotation.set(0, -(lam.yaw + (P.yaw || 0)) * D2R, 0);
    var sq = P.sq || 1;
    S.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    R.position.set(P.hx, P.hy, 0);
    R.rotation.set(0, 0, -P.rr * D2R);
    B.hong.rotation.set(0, -P.tw * 0.35 * D2R, -P.p * D2R);
    B.lung.rotation.set(0, -P.tw * 0.25 * D2R, -P.s * D2R);
    B.nguc.rotation.set(0, -P.tw * 0.4 * D2R, -P.c * D2R);
    B.co.rotation.set(0, 0, -P.n * 0.4 * D2R);
    B.dau.rotation.set(0, 0, -P.n * 0.6 * D2R);
    // tay FK
    var tay = [['G', P.aN, 1], ['X', P.aF, -1]];
    // góc vai tính theo phương thẳng đứng của thế giới (không theo độ nghiêng ngực) — trừ khi P.tdTay = 0
    var chaZ = P.tdTay === 0 ? 0 : (R.rotation.z + B.hong.rotation.z + B.lung.rotation.z + B.nguc.rotation.z);
    tay.forEach(function (t) {
      var s = t[0], a = t[1], z = t[2];
      B['vai' + s].rotation.set(-z * (a[2] || 0) * D2R, s === 'G' ? (P.ky || 0) * D2R : 0, a[0] * D2R - chaZ, 'YZX');
      B['khuyu' + s].rotation.set(0, 0, a[1] * D2R);
      B['tay' + s].rotation.set(0, 0, 0);
    });
    top.updateMatrixWorld(true);
    // tay IK (bám tường/thang): hN/hF = [x, y, trọng số]
    [['G', P.hN], ['X', P.hF]].forEach(function (t) {
      var h = t[1], s = t[0];
      if (!h || !(h[2] > 0)) return;
      var vai = B['vai' + s], v0 = viTriS(vai);
      var cha = R.rotation.z + B.hong.rotation.z + B.lung.rotation.z + B.nguc.rotation.z;
      var ik = ikGoc(cha, 0, v0.x, v0.y, h[0], h[1], K.canhTay, K.cangTay, -1);
      var w = Math.min(1, h[2]);
      var fk0 = vai.rotation.z, fk1 = B['khuyu' + s].rotation.z;
      vai.rotation.z = fk0 + w * ((ik[0] - cha) - fk0);
      B['khuyu' + s].rotation.z = fk1 + w * ((ik[1] - ik[0]) - fk1);
    });
    top.updateMatrixWorld(true);
    // kiếm: góc tuyệt đối k (độ, từ phía trước +X, ngược kim đồng hồ = lên)
    var cang = viTriS(B.tayG), khuyu = viTriS(B.khuyuG);
    var gf = goc2(cang.clone().sub(khuyu));
    var kb = Math.max(0, Math.min(1, P.kb || 0));
    lam.kiem.rotation.set(0, 0, (1 - kb) * (P.k * D2R - gf) + kb * (P.kw == null ? -90 : P.kw) * D2R);
    // chân IK
    var gh = R.rotation.z + B.hong.rotation.z;
    [['G', P.fN, 1], ['X', P.fF, -1]].forEach(function (t) {
      var s = t[0], f = t[1];
      var h0 = viTriS(B['hang' + s]);
      var ik = ikGoc(gh, 0, h0.x, h0.y, f[0], f[1], K.dui, K.cang, 1);
      B['hang' + s].rotation.set(0, 0, ik[0] - gh);
      B['goi' + s].rotation.set(0, 0, ik[1] - ik[0]);
      B['coChan' + s].rotation.set(0, 0, (f[2] || 0) * D2R - ik[1]);
    });
    top.updateMatrixWorld(true);
  };

  /* ---------- mô phỏng vải + chuông ---------- */
  var VA = [];   // capsule va chạm (hệ top): {a,b,r}
  function capVa() {
    VA.length = 0;
    function p(o, x, y, z) { tmpV.set(x, y, z); o.localToWorld(tmpV); return top.worldToLocal(tmpV.clone()); }
    VA.push({ a: p(B.hong, 0, -0.04, 0), b: p(B.nguc, 0, 0.16, 0), r: 0.175, ten: 'than' });
    VA.push({ a: p(B.dau, -0.07, 0.15, 0), b: p(B.dau, -0.04, 0.38, 0), r: 0.27, ten: 'mu' });
    ['G', 'X'].forEach(function (s) {
      VA.push({ a: p(B['hang' + s], 0, 0, 0), b: p(B['goi' + s], 0, 0, 0), r: 0.085, ten: 'dui' });
      VA.push({ a: p(B['goi' + s], 0, 0, 0), b: p(B['coChan' + s], 0, 0, 0), r: 0.075, ten: 'cang' });
    });
  }
  function dayRa(x, y, z, c) {
    var ax = c.a.x, ay = c.a.y, az = c.a.z, bx = c.b.x - ax, by = c.b.y - ay, bz = c.b.z - az;
    var L = bx * bx + by * by + bz * bz, t = L > 0 ? ((x - ax) * bx + (y - ay) * by + (z - az) * bz) / L : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var cx = ax + bx * t, cy = ay + by * t, cz = az + bz * t, dx = x - cx, dy = y - cy, dz = z - cz;
    var d2 = dx * dx + dy * dy + dz * dz;
    if (d2 >= c.r * c.r) return null;
    var d = Math.sqrt(d2) || 1e-5, k = c.r / d;
    return [cx + dx * k, cy + dy * k, cz + dz * k];
  }
  function neoVt(vt, i) {
    var n = vt.o.neo(i); tmpV.copy(n[1]); n[0].localToWorld(tmpV); return top.worldToLocal(tmpV.clone());
  }
  lam.datLaiVai = function () {
    top.updateMatrixWorld(true);
    lam.vai.forEach(function (vt) {
      var C = vt.C;
      vt.cs.length = 0;
      for (var i = 0; i < C; i++) {
        var a = neoVt(vt, i);
        for (var j = 0; j < vt.R; j++) {
          var r = vt.o.hang0(i, j), k = (j * C + i) * 3;
          vt.p[k] = a.x + r.x; vt.p[k + 1] = a.y + r.y; vt.p[k + 2] = a.z + r.z;
          vt.q[k] = vt.p[k]; vt.q[k + 1] = vt.p[k + 1]; vt.q[k + 2] = vt.p[k + 2];
        }
      }
      function rang(a, b, cung) {
        var dx = vt.p[a * 3] - vt.p[b * 3], dy = vt.p[a * 3 + 1] - vt.p[b * 3 + 1], dz = vt.p[a * 3 + 2] - vt.p[b * 3 + 2];
        vt.cs.push([a, b, Math.sqrt(dx * dx + dy * dy + dz * dz), cung]);
      }
      for (var j2 = 0; j2 < vt.R; j2++) for (var i2 = 0; i2 < C; i2++) {
        var a2 = j2 * C + i2;
        if (i2 < C - 1) rang(a2, a2 + 1, 1);
        if (j2 < vt.R - 1) rang(a2, a2 + C, 1);
        if (i2 < C - 1 && j2 < vt.R - 1) { rang(a2, a2 + C + 1, 0.5); rang(a2 + 1, a2 + C, 0.5); }
        if (j2 < vt.R - 2) rang(a2, a2 + 2 * C, 0.35);
        if (i2 < C - 2) rang(a2, a2 + 2, 0.25);
      }
    });
    lam.datLaiChuong();
    lam.capNhatLuoi();
  };
  lam.gio = new V3(0, 0, 0);     // vận tốc nhân vật trong thế giới (gió tương đối = -v)
  lam.gioThem = new V3(0, 0, 0); // gió môi trường
  lam.buoc = function (dt, tg) {
    top.updateMatrixWorld(true);
    capVa();
    var n = 2, h = dt / n, g = -9.8;
    for (var s = 0; s < n; s++) {
      lam.vai.forEach(function (vt) {
        var C = vt.C, N = C * vt.R, p = vt.p, q = vt.q;
        var keo = vt.o.va === 'ao' ? 3.2 : 2.2;   // lực cản không khí
        var wx = -lam.gio.x + lam.gioThem.x, wy = -lam.gio.y + lam.gioThem.y, wz = lam.gioThem.z;
        for (var i = C; i < N; i++) {
          var k = i * 3, j = (i / C) | 0, f = j / (vt.R - 1);
          var vx = (p[k] - q[k]) / h, vy = (p[k + 1] - q[k + 1]) / h, vz = (p[k + 2] - q[k + 2]) / h;
          var ax = keo * f * (wx - vx), ay = g + keo * f * (wy - vy), az = keo * f * (wz - vz);
          // gió nhẹ có nhịp (sống động khi đứng yên)
          if (vt.o.va === 'ao' && tg != null) {
            var nh = Math.sin(tg * 2.3 + (i % C) * 0.7) * 0.5 + Math.sin(tg * 3.7 + j) * 0.3;
            ax += -3.2 * f * (1 + nh); az += 0.4 * nh * f;
          }
          var damp = 0.992;
          var nx = p[k] + (p[k] - q[k]) * damp + ax * h * h;
          var ny = p[k + 1] + (p[k + 1] - q[k + 1]) * damp + ay * h * h;
          var nz = p[k + 2] + (p[k + 2] - q[k + 2]) * damp + az * h * h;
          q[k] = p[k]; q[k + 1] = p[k + 1]; q[k + 2] = p[k + 2];
          p[k] = nx; p[k + 1] = ny; p[k + 2] = nz;
        }
        var neo = [];
        for (var i0 = 0; i0 < C; i0++) neo.push(neoVt(vt, i0));
        for (var it = 0; it < 10; it++) {
          for (var a0 = 0; a0 < C; a0++) { var kk = a0 * 3; p[kk] = neo[a0].x; p[kk + 1] = neo[a0].y; p[kk + 2] = neo[a0].z; q[kk] = p[kk]; q[kk + 1] = p[kk + 1]; q[kk + 2] = p[kk + 2]; }
          for (var c = 0; c < vt.cs.length; c++) {
            var cs = vt.cs[c], ia = cs[0] * 3, ib = cs[1] * 3;
            var dx = p[ib] - p[ia], dy = p[ib + 1] - p[ia + 1], dz = p[ib + 2] - p[ia + 2];
            var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6, diff = (d - cs[2]) / d * cs[3];
            var wa = cs[0] < C ? 0 : 1, wb = cs[1] < C ? 0 : 1, ws = wa + wb; if (!ws) continue;
            // chỉ co lại mạnh, giãn nén mềm hơn cho dây uốn
            if (cs[3] < 0.5 && d < cs[2]) diff *= 0.3;
            var ka = diff * wa / ws, kb = diff * wb / ws;
            p[ia] += dx * ka; p[ia + 1] += dy * ka; p[ia + 2] += dz * ka;
            p[ib] -= dx * kb; p[ib + 1] -= dy * kb; p[ib + 2] -= dz * kb;
          }
          for (var i3 = C; i3 < N; i3++) {
            var k3 = i3 * 3;
            for (var v = 0; v < VA.length; v++) {
              if (vt.o.va === 'vat' && (VA[v].ten === 'mu')) continue;
              var r = dayRa(p[k3], p[k3 + 1], p[k3 + 2], VA[v]);
              if (r) { p[k3] = r[0]; p[k3 + 1] = r[1]; p[k3 + 2] = r[2]; }
            }
            if (lam.tuong != null && p[k3] < lam.tuong) { p[k3] = lam.tuong; q[k3] = p[k3]; }
            if (p[k3 + 1] < 0.012) { p[k3 + 1] = 0.012; q[k3] = p[k3] - (p[k3] - q[k3]) * 0.6; }
          }
        }
      });
      buocChuong(h);
    }
    lam.capNhatLuoi();
  };
  /* chuông: hạt verlet trên dây ngắn từ điểm neo sau mũ, va chạm khối mũ */
  var CH = lam.CH = { p: new V3(), q: new V3() };
  function neoChuong() { tmpV2.copy(lam.chuongNeo); B.dau.localToWorld(tmpV2); return top.worldToLocal(tmpV2.clone()); }
  lam.datLaiChuong = function () { var a = neoChuong(); CH.p.set(a.x - 0.01, a.y - lam.chuongDai, a.z); CH.q.copy(CH.p); };
  lam.goChuong = function (vx, vy) { CH.q.x -= vx / 120; CH.q.y -= vy / 120; };
  function buocChuong(h) {
    var a = neoChuong();
    var vx = (CH.p.x - CH.q.x) * 0.975, vy = (CH.p.y - CH.q.y) * 0.975;
    CH.q.copy(CH.p);
    var keo = 1.2;
    CH.p.x += vx + keo * (-lam.gio.x - vx / h) * h * h;
    CH.p.y += vy + (-9.8 + keo * (-lam.gio.y - vy / h)) * h * h;
    CH.p.z = a.z;
    for (var it = 0; it < 4; it++) {
      // dây bán cứng: chuông treo cách neo ~chuongDai
      CH.p.z = a.z;
      tmpV.subVectors(CH.p, a); var d = tmpV.length() || 1e-6;
      CH.p.copy(a).addScaledVector(tmpV, lam.chuongDai / d);
    }
  }
  lam.capNhatLuoi = function () {
    lam.vai.forEach(function (vt) {
      var pos = vt.geo.attributes.position.array; pos.set(vt.p);
      vt.geo.attributes.position.needsUpdate = true; vt.geo.computeVertexNormals();
    });
    var a = neoChuong();
    chuong.position.copy(a);
    tmpV.subVectors(CH.p, a).normalize();
    chuong.quaternion.setFromUnitVectors(new V3(0, -1, 0), tmpV);
    top.updateMatrixWorld(true);
  };

  /* ---------- nội suy hoạt cảnh ---------- */
  var KENH = ['hx', 'hy', 'p', 's', 'c', 'n', 'tw', 'rr', 'sq', 'yaw', 'k', 'ky', 'kb', 'kw',
              'aN0', 'aN1', 'aN2', 'aF0', 'aF1', 'aF2', 'fN0', 'fN1', 'fN2', 'fF0', 'fF1', 'fF2',
              'hN0', 'hN1', 'hN2', 'hF0', 'hF1', 'hF2', 'vx', 'vy'];
  var TRE = { c: 0.035, n: 0.07, aF0: 0.03, aF1: 0.05, s: 0.015 };   // độ trễ (giây) – đầu, thân trễ sau hông
  function phang(P) {
    var o = { hx: P.hx, hy: P.hy, p: P.p, s: P.s, c: P.c, n: P.n, tw: P.tw, rr: P.rr, sq: P.sq, yaw: P.yaw || 0, k: P.k,
      ky: P.ky || 0, kb: P.kb || 0, kw: P.kw == null ? -90 : P.kw,
      vx: (P.v || [0, 0])[0], vy: (P.v || [0, 0])[1] };
    ['aN', 'aF', 'fN', 'fF'].forEach(function (c) { for (var i = 0; i < 3; i++) o[c + i] = P[c][i] || 0; });
    ['hN', 'hF'].forEach(function (c) {
      var h = P[c];
      o[c + '0'] = h ? h[0] : NaN; o[c + '1'] = h ? h[1] : NaN; o[c + '2'] = h ? (h[2] == null ? 1 : h[2]) : 0;
    });
    return o;
  }
  lam.chuanBi = function (A) {
    // A: {loop, frames:[{hold,...}], keys:[{...pose overrides}]} → dữ liệu nội suy
    if (A._cb) return A._cb;
    var keys = [], cur = JSON.parse(JSON.stringify(MD)), T = [], t = 0;
    if (A.goc) for (var g in A.goc) cur[g] = JSON.parse(JSON.stringify(A.goc[g]));
    for (var i = 0; i < A.frames.length; i++) {
      var kf = A.keys[i] || {};
      for (var c in kf) cur[c] = JSON.parse(JSON.stringify(kf[c]));
      if (!('hN' in kf) && !A.giuTay) cur.hN = kf.hN || null;
      if (!('hF' in kf) && !A.giuTay) cur.hF = kf.hF || null;
      var f = phang(cur);
      // điền NaN cho mục tiêu tay rỗng bằng giá trị gần nhất
      keys.push(f); T.push(t); t += (A.frames[i].hold || 1) / L3.FPS;
    }
    ['hN', 'hF'].forEach(function (c) {
      for (var a = 0; a < 2; a++) {
        var ten = c + a, last = NaN;
        for (var i2 = 0; i2 < keys.length; i2++) { if (!isNaN(keys[i2][ten])) last = keys[i2][ten]; else keys[i2][ten] = last; }
        last = NaN;
        for (var i3 = keys.length - 1; i3 >= 0; i3--) { if (!isNaN(keys[i3][ten])) last = keys[i3][ten]; else keys[i3][ten] = isNaN(last) ? 0 : last; }
      }
    });
    A._cb = { keys: keys, T: T, dai: t, loop: !!A.loop };
    return A._cb;
  };
  function cr(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  lam.mau = function (A, t) {
    // lấy tư thế tại thời điểm t (giây); kênh trễ lấy mẫu ở t - trễ
    var cb = lam.chuanBi(A), keys = cb.keys, T = cb.T, n = keys.length, out = {};
    for (var ci = 0; ci < KENH.length; ci++) {
      var ten = KENH[ci], tt = t - (TRE[ten] || 0) * (A.tre == null ? 1 : A.tre);
      var ten0 = ten;
      if (ten === 'c' || ten === 'n' || ten === 's') ten0 = ten;
      var i, u, v0, v1, v2, v3;
      if (cb.loop) {
        tt = ((tt % cb.dai) + cb.dai) % cb.dai;
        for (i = n - 1; i > 0 && T[i] > tt; i--);
        var tN = i + 1 < n ? T[i + 1] : cb.dai;
        u = (tt - T[i]) / (tN - T[i]);
        v0 = keys[(i - 1 + n) % n][ten0]; v1 = keys[i][ten0]; v2 = keys[(i + 1) % n][ten0]; v3 = keys[(i + 2) % n][ten0];
      } else {
        if (tt <= 0) { out[ten] = keys[0][ten0]; continue; }
        if (tt >= T[n - 1]) { out[ten] = keys[n - 1][ten0]; continue; }
        for (i = n - 1; i > 0 && T[i] > tt; i--);
        u = (tt - T[i]) / (T[i + 1] - T[i]);
        v0 = keys[Math.max(0, i - 1)][ten0]; v1 = keys[i][ten0]; v2 = keys[Math.min(n - 1, i + 1)][ten0]; v3 = keys[Math.min(n - 1, i + 2)][ten0];
        var kd = keys[i + 1] && A.keys[i + 1] && A.keys[i + 1].de;   // "de": vào khung sau nhanh (ease-out mạnh)
        if (kd) u = 1 - Math.pow(1 - u, kd);
      }
      out[ten] = cr(v0, v1, v2, v3, u);
    }
    return { hx: out.hx, hy: out.hy, p: out.p, s: out.s, c: out.c, n: out.n, tw: out.tw, rr: out.rr, sq: out.sq, yaw: out.yaw, k: out.k,
      ky: out.ky, kb: out.kb, kw: out.kw,
      aN: [out.aN0, out.aN1, out.aN2], aF: [out.aF0, out.aF1, out.aF2], fN: [out.fN0, out.fN1, out.fN2], fF: [out.fF0, out.fF1, out.fF2],
      hN: out.hN2 > 0.001 ? [out.hN0, out.hN1, out.hN2] : null, hF: out.hF2 > 0.001 ? [out.hF0, out.hF1, out.hF2] : null,
      v: [out.vx, out.vy] };
  };
  lam.datThoiGian = function (A, t) { var P = lam.mau(A, t); if (A.tayTuongDoi) P.tdTay = 0; lam.datTuThe(P); lam.gio.set(P.v[0], P.v[1], 0); return P; };

  /* ---------- camera trực giao & render pixel ---------- */
  var O = lam.O = { o: tuy.o || 64, px: 32, py: 59, ppu: (tuy.ppu || 46 / 1.6), camCao: 8, ss: tuy.ss || 2 };
  lam.camPx = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 30);
  lam.datCam = function () {
    var c = lam.camPx, e = O.camCao * D2R, ppu = O.ppu;
    c.left = -O.px / ppu; c.right = (O.o - O.px) / ppu; c.top = O.py / ppu; c.bottom = -(O.o - O.py) / ppu;
    c.position.set(0, 12 * Math.sin(e), 12 * Math.cos(e)); c.up.set(0, 1, 0); c.lookAt(0, 0, 0);
    c.updateProjectionMatrix(); c.updateMatrixWorld(true);
  };
  lam.datCam();
  lam.capNhatAnhSang = function (cam) {
    var a = lam.anhSang, e = a.cao * D2R, h = a.ngang * D2R;
    // hướng tới nguồn sáng (hệ thế giới): phía trước nhân vật (+X), lên trên, lệch về camera
    var w = new V3(Math.cos(e) * Math.cos(h), Math.sin(e), Math.cos(e) * Math.sin(h)).normalize();
    cam.updateMatrixWorld(true);
    U.uL.value.copy(w).transformDirection(cam.matrixWorldInverse);
  };
  lam.scene = new THREE.Scene();
  lam.scene.add(top);

  var rt = null, buf = null, rtSize = 0;
  function damBaoRT(n) {
    if (rt && rtSize === n) return;
    if (rt) rt.dispose();
    rt = new THREE.WebGLRenderTarget(n, n, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType, depthBuffer: true, stencilBuffer: false });
    buf = new Uint8Array(n * n * 4); rtSize = n;
  }
  function doiVatLieu(id) { lam.meshes.forEach(function (m) { m.material = id ? m.userData.mi : m.userData.m; }); }
  function chup(renderer, id) {
    doiVatLieu(id);
    var cc = new THREE.Color(); renderer.getClearColor(cc); var ca = renderer.getClearAlpha();
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true);
    renderer.render(lam.scene, lam.camPx);
    renderer.readRenderTargetPixels(rt, 0, 0, rtSize, rtSize, buf);
    renderer.setRenderTarget(null); renderer.setClearColor(cc, ca);
    doiVatLieu(false);
    return buf.slice(0);
  }

  /* chiếu điểm (hệ top) → tọa độ pixel ô */
  lam.chieu = function (v) {
    var w = v.clone(); top.localToWorld(w); w.project(lam.camPx);
    return [(w.x + 1) / 2 * O.o, (1 - (w.y + 1) / 2) * O.o];
  };
  /* chiếu cho vệt chém: phóng đại chiều sâu thành độ lệch dọc (nhát vung ngang thành cung elip thấy rõ) */
  lam.chieuChem = function (v) {
    var w = v.clone(); top.localToWorld(w);
    var vai = new V3(); B.vaiG.getWorldPosition(vai);
    var p = lam.chieu(v);
    return [p[0], p[1] + (w.z - vai.z) * O.ppu * 1.2];
  };
  lam.diemKiem = function (u) {   // u: 0 = chuôi, 1 = mũi kiếm → hệ top
    var v = new V3(0.06 + lam.luoiDai * u, 0, 0); lam.kiem.localToWorld(v); return top.worldToLocal(v);
  };

  /* Render 1 khung pixel: trả về {px: Uint8ClampedArray RGBA o×o, id: Uint8Array, ci: chỉ số palette} */
  lam.renderPixel = function (renderer, fx) {
    var n = O.o, ss = O.ss, N = n * ss;
    damBaoRT(N);
    lam.capNhatAnhSang(lam.camPx);
    var col = chup(renderer, false), idb = chup(renderer, true);
    var ci = new Int16Array(n * n).fill(-1), id = new Uint8Array(n * n), dep = new Float32Array(n * n);
    // gộp (ss=1: lấy thẳng; ss=2: màu đa số, ưu tiên nét mảnh)
    var MANH = {}; MANH[ID.luoi] = 3; MANH[ID.vienMu] = 2; MANH[ID.mat2] = 3; MANH[ID.chuoi] = 2;
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var dem = {}, nOpaque = 0, best = 0, bestScore = -1;
      var mau = [];
      for (var sy = 0; sy < ss; sy++) for (var sx = 0; sx < ss; sx++) {
        var X = x * ss + sx, Y = (N - 1 - (y * ss + sy)), k = (Y * N + X) * 4;
        var pid = idb[k];
        if (!pid) continue;
        nOpaque++;
        var d = (idb[k + 1] + idb[k + 2] / 255) / 255;
        var c = palIdx(col[k], col[k + 1], col[k + 2]);
        mau.push([pid, c, d]);
        dem[pid] = (dem[pid] || 0) + 1;
      }
      if (!nOpaque) continue;
      if (ss > 1 && nOpaque * 2 < ss * ss) {
        // ít hơn nửa ô có vật: chỉ giữ nếu là nét mảnh quan trọng
        var giu = mau.filter(function (m) { return MANH[m[0]] >= 2; });
        if (!giu.length) continue;
        mau = giu; dem = {}; giu.forEach(function (m) { dem[m[0]] = (dem[m[0]] || 0) + 1; });
      }
      for (var pid2 in dem) {
        var sc = dem[pid2] + (MANH[pid2] ? MANH[pid2] : 0) * (ss > 1 ? 1 : 0);
        var dmin = 9; mau.forEach(function (m) { if (m[0] == pid2 && m[2] < dmin) dmin = m[2]; });
        sc -= dmin * 0.01;
        if (sc > bestScore) { bestScore = sc; best = +pid2; }
      }
      var cdem = {}, cb = -1, cbn = 0, dm = 9;
      mau.forEach(function (m) { if (m[0] === best) { cdem[m[1]] = (cdem[m[1]] || 0) + 1; if (m[2] < dm) dm = m[2]; } });
      for (var cc in cdem) if (cdem[cc] > cbn || (cdem[cc] === cbn && +cc > cb)) { cbn = cdem[cc]; cb = +cc; }
      var o = y * n + x; ci[o] = cb; id[o] = best; dep[o] = dm;
    }
    return lam.hauKy(ci, id, dep, fx);
  };

  /* ---------- hậu kỳ pixel ---------- */
  lam.hauKy = function (ci, id, dep, fx) {
    var n = O.o, x, y, o, i;
    fx = fx || {};
    function a(x, y) { return x >= 0 && y >= 0 && x < n && y < n && id[y * n + x] > 0; }
    var N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    // 1) bỏ pixel đơn lẻ không dính gì (trừ lưỡi kiếm)
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      o = y * n + x; if (!id[o] || id[o] === ID.luoi) continue;
      var c8 = 0; for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) if ((dx || dy) && a(x + dx, y + dy)) c8++;
      if (c8 === 0) { id[o] = 0; ci[o] = -1; }
    }
    // 2) dọn đốm màu lẻ trong cùng bộ phận
    var ci2 = Int16Array.from(ci);
    for (y = 1; y < n - 1; y++) for (x = 1; x < n - 1; x++) {
      o = y * n + x; if (!id[o]) continue;
      var c0 = -2, ok = true;
      for (i = 0; i < 4; i++) {
        var q = (y + N4[i][1]) * n + x + N4[i][0];
        if (!id[q] || NHOM[id[q]] !== NHOM[id[o]]) { ok = false; break; }
        if (c0 === -2) c0 = ci[q]; else if (ci[q] !== c0) { ok = false; break; }
      }
      if (ok && c0 !== ci[o] && id[o] !== ID.mat2) ci2[o] = c0;
    }
    ci = ci2;
    // 3) viền trong theo bộ phận: pixel phía SAU giáp bộ phận phía trước → màu viền
    var TRUOC = { tayG: 1, kiem: 1, chanG: 1, dau: 1 };
    var SAU = { tayX: 1, chanX: 1, chuong: 1 };
    var EPS = 0.04 / 30;   // ~0.04 đơn vị chiều sâu
    var vt = new Uint8Array(n * n);
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      o = y * n + x; if (!id[o]) continue;
      var gp = NHOM[id[o]];
      if (!gp) continue;
      for (i = 0; i < 4; i++) {
        var xx = x + N4[i][0], yy = y + N4[i][1];
        if (!a(xx, yy)) continue;
        var q2 = yy * n + xx, gq = NHOM[id[q2]];
        if (!gq || gq === gp) continue;
        if ((gp === 'kiem' && gq === 'tayG') || (gp === 'tayG' && gq === 'kiem')) continue;
        if (dep[o] <= dep[q2] + EPS) continue;
        if (TRUOC[gq] || SAU[gp] || (gq === 'than' && gp === 'ao')) { vt[o] = 1; break; }
      }
    }
    // không cho viền trong ăn hết bộ phận mảnh: bỏ điểm viền đơn độc
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      o = y * n + x; if (!vt[o]) continue;
      var lien = 0;
      for (var dy2 = -1; dy2 <= 1; dy2++) for (var dx2 = -1; dx2 <= 1; dx2++) {
        if (!dx2 && !dy2) continue;
        var X2 = x + dx2, Y2 = y + dy2;
        if (!a(X2, Y2) || vt[Y2 * n + X2] || ci[Y2 * n + X2] === IV) lien++;
      }
      if (!lien) vt[o] = 0;
    }
    for (o = 0; o < n * n; o++) if (vt[o]) ci[o] = IV;
    // 4) mắt: chiếu 2 điểm mắt, vẽ nếu thấy khoảng tối trong mũ
    var mats = lam.mat.map(function (e) { var v = new V3(); e.getWorldPosition(v); top.worldToLocal(v); return lam.chieu(v); });
    // mắt gần (index 0) & mắt xa (index 1): mỗi mắt 1 pixel #CEF0D6, cách nhau ≥ 1 pixel, chỉ vẽ trong khoảng tối của mũ
    function laMat(x, y) { if (!a(x, y)) return false; var ii = id[y * n + x]; return ii === ID.mat || ii === ID.mat2; }
    var m0 = [Math.floor(mats[0][0]), Math.floor(mats[0][1])], m1 = [Math.floor(mats[1][0]), Math.floor(mats[1][1])];
    var ve0 = null;
    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { if (laMat(m0[0] + d[0], m0[1] + d[1])) { ve0 = [m0[0] + d[0], m0[1] + d[1]]; return true; } return false; });
    if (ve0) {
      var cands = [[m1[0], m1[1]], [ve0[0] + 2, ve0[1]], [ve0[0] - 2, ve0[1]], [m1[0] - 1, m1[1]], [m1[0] + 1, m1[1]]];
      var ve1 = null;
      cands.some(function (c) { if (Math.abs(c[0] - ve0[0]) >= 2 && Math.abs(c[1] - ve0[1]) <= 1 && laMat(c[0], c[1])) { ve1 = c; return true; } return false; });
      [ve0, ve1].forEach(function (m) { if (!m) return; ci[m[1] * n + m[0]] = PI_('k'); id[m[1] * n + m[0]] = ID.mat2; });
      // bỏ pixel mắt thừa do khối cầu mắt render ra (giữ đúng 2 điểm sáng rõ)
      for (var qq = 0; qq < n * n; qq++) if (id[qq] === ID.mat2 && !((qq === ve0[1] * n + ve0[0]) || (ve1 && qq === ve1[1] * n + ve1[0]))) { id[qq] = ID.mat; ci[qq] = IV; }
    }
    // 5) viền ngoài 1px
    var ra = new Int16Array(n * n); ra.set(ci);
    var idr = Uint8Array.from(id);
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      o = y * n + x; if (id[o]) continue;
      for (i = 0; i < 4; i++) if (a(x + N4[i][0], y + N4[i][1])) { ra[o] = IV; idr[o] = 255; break; }
    }
    // 6) vệt chém + hiệu ứng (chỉ vẽ lên chỗ trống / viền ngoài, không đè thân)
    var ve = function (x, y, ten, deViens) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= n || y >= n) return;
      var oo = y * n + x;
      if (idr[oo] && idr[oo] !== 255 && idr[oo] !== ID.chem && idr[oo] !== ID.fx && !deViens) return;
      ra[oo] = PI_(ten); idr[oo] = ten === 'fx' ? ID.fx : ID.chem;
    };
    if (fx.chem) veChem(fx.chem, ve, ra, idr, n);
    if (fx.ve) fx.ve.forEach(function (f) { f(ve, ra, idr, n, lam); });
    // ra RGBA
    var px = new Uint8ClampedArray(n * n * 4);
    for (o = 0; o < n * n; o++) {
      if (ra[o] < 0) continue;
      var c = PAL[ra[o]]; px[o * 4] = c[0]; px[o * 4 + 1] = c[1]; px[o * 4 + 2] = c[2]; px[o * 4 + 3] = 255;
    }
    return { px: px, id: idr, ci: ra, n: n };
  };
  /* vệt chém: dải quét giữa các vị trí lưỡi kiếm (danh sách đoạn [chuôi, mũi] theo thời gian, cũ → mới) */
  function veChem(ds, ve, ra, idr, n) {
    var m = ds.length;
    if (m < 2) return;
    var mask = new Int16Array(n * n).fill(-1);
    for (var s = 0; s < m - 1; s++) {
      var A0 = ds[s][0], A1 = ds[s][1], B0 = ds[s + 1][0], B1 = ds[s + 1][1];
      var tuoi = (s + 1) / (m - 1);   // 0 cũ → 1 mới
      // tô tứ giác A0 A1 B1 B0 theo dải từ chuôi (u=0) tới mũi (u=1)
      var poly = [A0, A1, B1, B0];
      var minx = Math.floor(Math.min(A0[0], A1[0], B0[0], B1[0])), maxx = Math.ceil(Math.max(A0[0], A1[0], B0[0], B1[0]));
      var miny = Math.floor(Math.min(A0[1], A1[1], B0[1], B1[1])), maxy = Math.ceil(Math.max(A0[1], A1[1], B0[1], B1[1]));
      for (var y = Math.max(0, miny); y <= Math.min(n - 1, maxy); y++) for (var x = Math.max(0, minx); x <= Math.min(n - 1, maxx); x++) {
        if (!trongDa(poly, x + 0.5, y + 0.5)) continue;
        // u: khoảng cách tương đối tới mũi (lớp ngoài sáng hơn)
        var u = viTriU(A0, A1, B0, B1, x + 0.5, y + 0.5);
        if (u < 0.38) continue;   // chỉ giữ dải ngoài → hình lưỡi liềm
        var cap = u > 0.84 ? 3 : u > 0.6 ? 2 : 1;
        if (tuoi < 0.34) cap = Math.min(cap, 1); else if (tuoi < 0.67) cap = Math.min(cap, 2);
        var o = y * n + x; if (cap > mask[o]) mask[o] = cap;
      }
    }
    var TEN = [null, 'x2', 'k', 'v2'];
    for (var o2 = 0; o2 < n * n; o2++) if (mask[o2] > 0) ve(o2 % n, (o2 / n) | 0, TEN[mask[o2]]);
  }
  function trongDa(p, x, y) {
    var c = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      if (((p[i][1] > y) !== (p[j][1] > y)) && (x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c;
    }
    return c;
  }
  function viTriU(A0, A1, B0, B1, x, y) {
    // ước lượng u theo khoảng cách tới đường chuôi so với đường mũi
    var c0 = [(A0[0] + B0[0]) / 2, (A0[1] + B0[1]) / 2], c1 = [(A1[0] + B1[0]) / 2, (A1[1] + B1[1]) / 2];
    var dx = c1[0] - c0[0], dy = c1[1] - c0[1], L = dx * dx + dy * dy || 1;
    return Math.max(0, Math.min(1, ((x - c0[0]) * dx + (y - c0[1]) * dy) / L));
  }

  /* ---------- chạy 1 hoạt cảnh → các khung pixel ---------- */
  lam.chayAnim = function (renderer, ten, tuyChon) {
    tuyChon = tuyChon || {};
    var A = L3.ANIMS[ten], cb = lam.chuanBi(A), dt = 1 / 60, out = [];
    lam.datCam();
    // khởi động: đặt tư thế đầu, vải rủ tự nhiên, chạy trước 2 vòng (lặp) hoặc giữ tư thế đầu 0.7s
    lam.tuong = A.tuong == null ? null : A.tuong;
    var t0 = cb.loop ? -2 * cb.dai : -0.7;
    lam.datThoiGian(A, cb.loop ? t0 : 0);
    lam.datLaiVai();
    var t = t0, tg = 0;
    for (var i = 0; i < A.frames.length; i++) {
      var tK = cb.T[i];
      while (t < tK - 1e-6) {
        var h = Math.min(dt, tK - t);
        t += h; tg += h;
        lam.datThoiGian(A, cb.loop ? t : Math.max(0, t));
        suKien(A, cb, t - h, t);
        lam.buoc(h, tg);
      }
      var fr = A.frames[i];
      // vệt chém: lấy mẫu vị trí lưỡi giữa khung trước và khung này
      var fx = { ve: [] };
      var sm = fr.sm != null ? fr.sm : (fr.hit ? 1 : 0);
      if (sm > 0 && i > 0) {
        var ta = cb.T[i] - (cb.T[i] - cb.T[i - 1]) * sm, ds = [], M = 16;
        for (var s = 0; s <= M; s++) {
          var ts = ta + (tK - ta) * s / M;
          var Ps = lam.mau(A, ts); if (A.tayTuongDoi) Ps.tdTay = 0; lam.datTuThe(Ps);
          ds.push([lam.chieuChem(lam.diemKiem(-0.25)), lam.chieuChem(lam.diemKiem(1.08))]);
        }
        fx.chem = ds;
      }
      lam.datThoiGian(A, tK);
      lam.capNhatLuoi();
      if (fr.fx && L3.FX) fr.fx.split(' ').forEach(function (f) { if (L3.FX[f]) fx.ve.push(L3.FX[f]); });
      var r = lam.renderPixel(renderer, fx);
      r.ten = fr.name; r.hold = fr.hold || 1; r.hit = !!fr.hit; r.comboWindow = !!fr.comboWindow;
      out.push(r);
    }
    return out;
  };
  function suKien(A, cb, ta, tb) {
    if (!A.su) return;
    A.su.forEach(function (e) {
      var te = cb.T[e.khung] + (e.dt || 0);
      if (te > ta && te <= tb && e.chuong) lam.goChuong(e.chuong[0], e.chuong[1]);
    });
  }
  lam.datTuThe(MD);
  lam.datLaiVai();
  return lam;
}
L3.tao = tao;
L3.FPS = 12;
})(typeof window !== 'undefined' ? window : this);
