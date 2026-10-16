/* =====================================================================
   rig-quai-chuong.js — Quái Chuông Gỗ: đầu là quả chuông đồng xỉn gỉ xanh có vết nứt,
   thân và chân là rễ cây nâu phủ rêu. Dựng bằng khối Three.js trên hệ khớp (như rig Lam),
   ô 32×32, QUAY MẶT SANG TRÁI.
   Nạp bằng thẻ <script> sau Three.js r128 (bản UMD có global THREE).
   API:  TV.taoAtlasQuaiChuong(THREE) → {
           canvas, w:32, h:32, cols, rows, pivot:{x,y}, fps,
           anims: { ten: { row, loop, frames:[{x,y,hold,hit,comboWindow,name,baoTruoc}] } },
           kiemTra: [ { anim, frame, loi } ]
         }
   anims.attack còn có: vungBaoTruoc / hitbox = {x,y,w,h} (px trong ô) — vùng chuông đập xuống,
   game vẽ cảnh báo ở các khung baoTruoc, bật hitbox ở khung hit.
   ===================================================================== */
(function (root) {
'use strict';
var TV = root.TV = root.TV || {};

TV.taoAtlasQuaiChuong = function (THREE) {
  /* ---------- CẤU HÌNH ----------
     Dựng mô hình quay mặt sang PHẢI (+X = phía trước) cho dễ tính,
     lúc lấy mẫu xuống ô 32×32 thì lật ngang → nhân vật quay mặt sang TRÁI.
     1 đơn vị = 1 px. Gốc (0,0) = giữa hai chân, trên mặt đất. */
  const CELL = 32, SS = 4, RENDER = CELL * SS;
  const VIEW = { left: -13, right: 19, top: 29, bottom: -3 };      // theo hệ dựng (mặt sang phải)
  const PIVOT_PX = { x: VIEW.right, y: VIEW.top };                  // sau khi lật: (19, 29)
  const toCellX = x => VIEW.right - x;                              // x dựng → x trong ô (đã lật)
  const toCellY = y => VIEW.top - y;

  const PAL = {
    ink:    0x0C0F14,  // viền, lòng chuông, vết nứt
    bronze: 0x6B5A3A,  // đồng xỉn
    verd:   0x4E5A44,  // gỉ xanh
    rootD:  0x3B2A1E,  // rễ tối
    root:   0x5A3F2B,  // rễ nâu
    mossD:  0x21413A,  // rêu tối
    moss:   0x32804F,  // rêu
    glow:   0xE1B85A   // vết nứt rực lên khi báo trước đòn, sóng chấn
  };
  const PAL_RGB = Object.values(PAL).map(h => [(h >> 16) & 255, (h >> 8) & 255, h & 255]);

  /* ---------- RENDERER + CAMERA + SHADER 2 TÔNG (giống rig Lam) ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
  if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.LinearEncoding;
  renderer.setPixelRatio(1);
  renderer.setSize(RENDER, RENDER, false);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(VIEW.left, VIEW.right, VIEW.top, VIEW.bottom, 0.1, 200);
  camera.position.set(0, 0, 60);
  camera.lookAt(0, 0, 0);
  const LIGHT_DIR = new THREE.Vector3(0.45, 0.75, 0.5).normalize();   // sau khi lật: sáng từ trên-trái
  const VS = `
    varying vec3 vN;
    void main(){
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const FS = `
    uniform vec3 uBase;
    uniform vec3 uShade;
    uniform vec3 uLight;
    varying vec3 vN;
    void main(){
      float d = dot(normalize(vN), uLight);
      gl_FragColor = vec4(d > 0.15 ? uBase : uShade, 1.0);
    }`;
  const hexVec = h => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
  const matCache = new Map();
  function mat(base, shade) {
    if (shade === undefined) shade = base;
    const key = base + '_' + shade;
    if (!matCache.has(key)) {
      matCache.set(key, new THREE.ShaderMaterial({
        uniforms: { uBase: { value: hexVec(base) }, uShade: { value: hexVec(shade) }, uLight: { value: LIGHT_DIR } },
        vertexShader: VS, fragmentShader: FS
      }));
    }
    return matCache.get(key);
  }
  function joint(parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function box(parent, w, h, d, base, shade, x, y, z, rotZ) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(base, shade));
    m.position.set(x, y, z);
    m.rotation.z = rotZ || 0;
    parent.add(m);
    return m;
  }

  /* =====================================================================
     MODEL
     Quy ước góc Z (như Lam): thân / cổ dương = ngả ra sau; tay rễ dương = vung ra trước.
     ===================================================================== */
  const rig = {};
  rig.root = joint(scene, 0, 0, 0);
  rig.body = joint(rig.root, 0, 0, 0);
  rig.hips = joint(rig.body, 0, 8.3, 0);

  // --- Chân rễ: đùi 4.5, cẳng 4, bàn chân là búi rễ tỏa ra trước – sau
  const L1 = 4.5, L2 = 4.0;
  function makeLeg(near) {
    const z = near ? 1.2 : -1.2;
    const c = near ? PAL.root : PAL.rootD;
    const hip = joint(rig.hips, near ? 0.6 : -0.6, 0, z);
    box(hip, 1.7, 4.8, 1.4, c, PAL.rootD, 0, -2.25, 0);                       // đùi
    box(hip, 0.7, 2.2, 1.5, PAL.moss, PAL.mossD, 0.35, -1.4, 0);              // rêu bám đùi
    const knee = joint(hip, 0, -L1, 0);
    box(knee, 1.3, 4.2, 1.3, c, PAL.rootD, 0, -2.0, 0);                       // cẳng
    const ankle = joint(knee, 0, -L2, 0);
    box(ankle, 3.0, 0.9, 1.4, c, PAL.rootD, 0.6, -0.05, 0);                   // rễ trước (đáy ở -0.5)
    box(ankle, 1.6, 0.6, 1.2, PAL.rootD, PAL.rootD, -1.2, -0.2, 0);           // rễ sau
    box(ankle, 0.9, 0.5, 1.5, PAL.moss, PAL.mossD, 1.4, 0.3, 0);              // rêu ở chân
    return { hip, knee, ankle, hx: near ? 0.6 : -0.6 };
  }
  rig.legF = makeLeg(false);
  rig.legN = makeLeg(true);

  // --- Thân: bó rễ xoắn
  rig.torso = joint(rig.hips, 0, 0, 0);
  box(rig.torso, 4.2, 9.0, 3.0, PAL.root, PAL.rootD, 0, 4.3, 0);              // lõi thân
  box(rig.torso, 1.2, 8.0, 3.2, PAL.rootD, PAL.rootD, 1.4, 4.6, 0, -0.18);    // sợi rễ xoắn trước
  box(rig.torso, 1.0, 7.0, 3.2, PAL.root, PAL.rootD, -1.6, 3.8, 0, 0.2);      // sợi rễ xoắn sau
  box(rig.torso, 1.4, 3.2, 3.3, PAL.moss, PAL.mossD, 0.9, 6.8, 0);            // mảng rêu ngực
  box(rig.torso, 1.1, 2.4, 3.3, PAL.mossD, PAL.mossD, -1.0, 2.6, 0);          // rêu tối bụng
  box(rig.torso, 0.6, 1.8, 3.35, PAL.moss, PAL.mossD, 1.9, 3.4, 0);           // rêu nhỏ

  // Tua rễ sau lưng (cong lên – ra sau như ảnh tham chiếu)
  rig.tendril = joint(rig.torso, -1.8, 8.2, -0.6);
  rig.tendrilBase = 0.5;
  box(rig.tendril, 0.9, 2.8, 0.9, PAL.rootD, PAL.rootD, 0, 1.3, 0);
  rig.tendril2 = joint(rig.tendril, 0, 2.6, 0);
  rig.tendril2.rotation.z = 0.7;
  box(rig.tendril2, 0.7, 2.2, 0.8, PAL.root, PAL.rootD, 0, 1.0, 0);
  box(rig.tendril2, 0.6, 1.6, 0.9, PAL.moss, PAL.mossD, 0.4, 0.4, 0);

  // Tay rễ: vai → khuỷu → búi móng rễ
  function makeArm(near) {
    const c = near ? PAL.root : PAL.rootD;
    const sh = joint(rig.torso, -0.4, 8.0, near ? 1.9 : -1.9);
    box(sh, 1.3, 3.8, 1.1, c, PAL.rootD, 0, -1.7, 0);
    box(sh, 0.7, 2.0, 1.2, PAL.moss, PAL.mossD, 0.3, -1.0, 0);                 // rêu rủ
    const el = joint(sh, 0, -3.6, 0);
    box(el, 1.1, 3.6, 1.0, c, PAL.rootD, 0, -1.6, 0);
    const hand = joint(el, 0, -3.4, 0);
    box(hand, 0.6, 1.6, 0.8, c, PAL.rootD, 0.35, -0.6, 0, 0.5);               // móng rễ
    box(hand, 0.6, 1.6, 0.8, c, PAL.rootD, 0, -0.7, 0);
    box(hand, 0.6, 1.4, 0.8, PAL.rootD, PAL.rootD, -0.35, -0.5, 0, -0.5);
    return { sh, el };
  }
  rig.armF = makeArm(false);
  rig.armN = makeArm(true);

  // --- Cổ rễ + chuông
  rig.neck = joint(rig.torso, 0.6, 8.6, 0);
  box(rig.neck, 2.2, 2.4, 2.6, PAL.root, PAL.rootD, 0.4, 0.6, 0);             // gốc cổ
  box(rig.neck, 0.8, 2.4, 2.9, PAL.moss, PAL.mossD, 1.2, -0.5, 0);            // râu rêu dưới chuông
  box(rig.neck, 0.7, 1.8, 2.9, PAL.mossD, PAL.mossD, -0.2, -0.3, 0);

  // Nhóm chuông: trục Y của nhóm = trục chuông (đỉnh +Y, miệng −Y). Xoay Z rồi Y (thứ tự Euler XYZ ⇒ Z áp trước).
  const BELL_ON_NECK = { x: 2.0, y: 2.8, rot: 1.0 };
  const BELL_YAW = -0.6;                                                       // xoay miệng chuông hé về phía camera
  rig.bell = new THREE.Group();
  rig.bell.rotation.y = BELL_YAW;
  rig.neck.add(rig.bell);
  {
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 3.6, 6.0, 12), mat(PAL.bronze, PAL.verd));
    rig.bell.add(shell);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(3.75, 3.75, 0.7, 12), mat(PAL.bronze, PAL.ink));
    rim.position.y = -3.0;
    rig.bell.add(rim);
    const mouth = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.3, 12), mat(PAL.ink));
    mouth.position.y = -3.25;
    rig.bell.add(mouth);                                                       // lòng chuông tối
    const clap = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 8), mat(PAL.bronze, PAL.verd));
    clap.position.set(0.6, -2.8, 0.8);
    rig.bell.add(clap);                                                        // quả lắc
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.9, 0.6, 12), mat(PAL.bronze, PAL.verd));
    crown.position.y = 3.2;
    rig.bell.add(crown);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.35, 6, 12), mat(PAL.bronze, PAL.ink));
    loop.position.y = 4.4;
    rig.bell.add(loop);                                                        // quai treo
    // Mảng gỉ xanh trên mặt chuông (mặt +Z hướng camera)
    box(rig.bell, 1.4, 1.6, 0.3, PAL.verd, PAL.verd, -0.7, 1.4, 2.25);
    box(rig.bell, 1.2, 1.2, 0.3, PAL.verd, PAL.verd, 1.4, -1.6, 3.1);
  }
  // Vết nứt: đổi màu ink ↔ glow theo pose
  rig.cracks = [];
  rig.cracksBig = [];
  function crack(list, w, h, x, y, z, r) { list.push(box(rig.bell, w, h, 0.3, PAL.ink, PAL.ink, x, y, z, r)); }
  crack(rig.cracks, 0.8, 1.8, 0.3, 1.2, 2.55, 0.45);
  crack(rig.cracks, 0.8, 1.7, 0.0, -0.4, 2.95, -0.5);
  crack(rig.cracks, 0.8, 1.3, 0.5, -1.8, 3.35, 0.35);
  crack(rig.cracksBig, 1.0, 2.2, -1.0, 0.4, 2.85, 1.1);
  crack(rig.cracksBig, 1.0, 1.8, -1.6, -1.5, 3.2, -0.3);
  crack(rig.cracksBig, 1.0, 2.0, 1.4, 0.2, 2.85, -0.9);

  // Mảnh chuông vỡ (chỉ hiện trong death)
  rig.shards = [];
  for (let i = 0; i < 3; i++) {
    const s = box(rig.root, 1.2, 0.6, 1.0, PAL.bronze, PAL.verd, 0, 0, 2.0);
    s.visible = false;
    rig.shards.push(s);
  }

  // Vệt / sóng chấn (cung tròn), gắn ở gốc, tọa độ thế giới dựng
  rig.smear = new THREE.Mesh(new THREE.BufferGeometry(), mat(PAL.glow));
  rig.smear.visible = false;
  rig.root.add(rig.smear);

  /* ---------- IK 2 xương cho chân (như Lam) ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function solveLeg(leg, hipX, hipY, foot, footAng) {
    const hx = hipX + leg.hx, hy = hipY;
    const dx = foot[0] - hx, dy = foot[1] - hy;
    const d = clamp(Math.hypot(dx, dy), 0.6, L1 + L2 - 0.001);
    const phi = Math.atan2(dx, -dy);
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const b = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    const thigh = phi + a, knee = -(Math.PI - b);
    leg.hip.rotation.z = thigh;
    leg.knee.rotation.z = knee;
    leg.ankle.rotation.z = -(thigh + knee) + footAng;
  }

  /* =====================================================================
     ANIMATION (tọa độ theo hệ dựng: +X = phía trước mặt quái)
     bellFree = [x, y, gócZ] khi chuông rời khỏi cổ (death).
     sm = { c:[x,y], a:[độ đầu, độ cuối], r:[trong, ngoài], z } — cung vệt / sóng chấn.
     glow = vết nứt rực sáng (báo trước). baoTruoc = khung cảnh báo đòn.
     ===================================================================== */
  const BASE = {
    bodyRot: 0, bodyX: 0, bodyY: 0, hipX: 0, hipY: 8.3, torso: -0.12, neck: -0.1,
    footN: [1.8, 0.5], footF: [-1.6, 0.5], footAngN: 0, footAngF: 0,
    nSh: 0.25, nEl: 0.3, fSh: -0.2, fEl: 0.35, tendril: 0,
    glow: false, crackBig: false, bellFree: null, shards: null, sm: null,
    name: '', hit: false, hold: 1, comboWindow: false, baoTruoc: false
  };

  // Đi: 6 pha mỗi chân, chân xa lệch 3 pha
  const WALK_FOOT = [
    { p: [2.6, 0.5], a: 0 },        // đặt rễ xuống phía trước
    { p: [1.0, 0.5], a: 0 },        // dồn trọng tâm
    { p: [-0.8, 0.5], a: 0 },       // rễ trụ dưới thân
    { p: [-2.2, 1.1], a: -0.3 },    // nhổ rễ khỏi đất
    { p: [-0.6, 2.4], a: -0.2 },    // kéo rễ lên
    { p: [1.8, 1.8], a: 0.15 }      // vươn rễ ra trước
  ];
  const WALK_NAMES = ['rễ gần đặt xuống', 'dồn trọng tâm', 'rễ xa nhổ lên', 'rễ xa đặt xuống', 'dồn trọng tâm (2)', 'rễ gần nhổ lên'];
  const WALK_HIP = [7.9, 8.2, 8.0, 7.9, 8.2, 8.0];
  const WALK = WALK_NAMES.map((name, k) => {
    const n = WALK_FOOT[k], f = WALK_FOOT[(k + 3) % 6];
    const s = Math.sin(k * Math.PI / 3), c = Math.cos(k * Math.PI / 3);
    return { name, hipY: WALK_HIP[k], hipX: 0.1, torso: -0.16 + 0.04 * c, neck: -0.06 + 0.18 * s,
      footN: n.p, footAngN: n.a, footF: f.p, footAngF: f.a,
      nSh: 0.25 - 0.35 * c, nEl: 0.35, fSh: -0.1 + 0.35 * c, fEl: 0.35, tendril: 0.1 + 0.25 * s };
  });

  const ANIMS = [
    { key: 'idle', label: 'Idle', loop: true, frames: [
      { name: 'đứng – chuông treo', hipY: 8.3, torso: -0.12, neck: -0.1, nSh: 0.25, fSh: -0.2, tendril: 0 },
      { name: 'rễ chùng xuống', hipY: 8.0, torso: -0.16, neck: -0.04, nSh: 0.32, nEl: 0.4, fSh: -0.12, tendril: 0.15 },
      { name: 'thấp nhất – chuông nghiêng', hipY: 7.8, torso: -0.2, neck: 0.03, nSh: 0.38, nEl: 0.45, fSh: -0.08, tendril: 0.25 },
      { name: 'rễ căng lên – chuông lắc lại', hipY: 8.0, torso: -0.15, neck: -0.16, nSh: 0.3, fSh: -0.16, tendril: 0.1 }
    ]},
    { key: 'walk', label: 'Walk', loop: true, frames: WALK },
    { key: 'attack', label: 'Attack', loop: false,
      // vùng chuông đập xuống (hệ dựng) — đổi sang px trong ô ở dưới
      zone: { x0: 7.5, x1: 17.5, y0: 0, y1: 8 },
      frames: [
      { name: 'gồng – rễ bám đất', hipY: 7.6, torso: -0.05, neck: 0.15, footN: [2.6, 0.5], footF: [-2.4, 0.5],
        nSh: 0.1, nEl: 0.4, fSh: -0.35, fEl: 0.4, tendril: 0.2 },
      { name: 'ngả ra sau – chuông giơ cao (báo trước)', hipX: -0.6, hipY: 8.0, torso: 0.35, neck: 0.45,
        footN: [2.4, 0.5], footF: [-2.6, 0.5], nSh: -0.5, nEl: 0.6, fSh: -0.8, fEl: 0.5, tendril: 0.5,
        glow: true, baoTruoc: true, hold: 2 },
      { name: 'giữ đà – vết nứt rực (báo trước)', hipX: -0.8, hipY: 8.1, torso: 0.45, neck: 0.55,
        footN: [2.4, 0.5], footF: [-2.6, 0.5], nSh: -0.6, nEl: 0.7, fSh: -0.9, fEl: 0.6, tendril: 0.6,
        glow: true, baoTruoc: true, hold: 2 },
      { name: 'lao tới – chuông bổ xuống', hipX: 0.8, hipY: 7.0, torso: -0.75, neck: -0.2,
        footN: [3.6, 0.5], footF: [-2.2, 0.5], nSh: 1.3, nEl: 0.1, fSh: 1.0, fEl: 0.2, tendril: -0.3,
        glow: true, sm: { c: [0, 8], a: [25, 75], r: [10.6, 12.2], z: -2.5 } },
      { name: 'đập chuông xuống đất – HIT', hipX: 1.2, hipY: 5.8, torso: -1.45, neck: 0.35,
        footN: [3.4, 0.5], footF: [-2.4, 0.5], nSh: 2.45, nEl: -0.2, fSh: 2.2, fEl: 0, tendril: -0.6,
        sm: { c: [12.9, 0.5], a: [0, 180], r: [4.0, 4.8], z: -3.5 }, hit: true, hold: 3 },
      { name: 'kẹt chuông – giằng ra', hipX: 1.0, hipY: 6.4, torso: -1.2, neck: 0.2,
        footN: [3.4, 0.5], footF: [-2.2, 0.5], nSh: 2.0, nEl: 0, fSh: 1.8, fEl: 0, tendril: -0.3, hold: 2 },
      { name: 'thu về', hipX: 0.3, hipY: 8.0, torso: -0.2, neck: -0.1,
        footN: [2.2, 0.5], footF: [-1.8, 0.5], nSh: 0.4, nEl: 0.4, fSh: 0, fEl: 0.35, tendril: 0.1 }
    ]},
    { key: 'hit', label: 'Hit', loop: false, frames: [
      { name: 'trúng đòn – chuông kêu', hipX: -0.7, hipY: 8.0, torso: 0.3, neck: 0.5,
        nSh: -0.5, nEl: 0.6, fSh: -0.7, fEl: 0.5, tendril: 0.5 },
      { name: 'chuông rung lắc', hipX: -0.5, hipY: 7.7, torso: 0.12, neck: -0.3,
        nSh: 0.6, nEl: 0.3, fSh: 0.2, tendril: -0.2, hold: 2 },
      { name: 'hồi lại', hipX: -0.2, hipY: 8.1, torso: -0.1, neck: -0.05 }
    ]},
    { key: 'death', label: 'Death', loop: false, frames: [
      { name: 'trúng đòn chí mạng', hipX: -0.8, hipY: 8.0, torso: 0.4, neck: 0.6,
        nSh: -0.6, nEl: 0.5, fSh: -0.8, fEl: 0.5, tendril: 0.6 },
      { name: 'chuông nứt toác', hipX: -0.6, hipY: 7.4, torso: 0.2, neck: 0.9, crackBig: true,
        nSh: 0.2, fSh: -0.3, tendril: 0.8, hold: 2 },
      { name: 'chuông tuột khỏi cổ', hipY: 6.6, torso: -0.35, neck: -0.5, crackBig: true,
        bellFree: [7.0, 10.0, -0.6], nSh: 0.6, fSh: 0.4, tendril: -0.2 },
      { name: 'chuông đập xuống đất', hipY: 5.6, hipX: 0.2, torso: -0.8, neck: -0.6, crackBig: true,
        bellFree: [11.0, 3.4, 0], footN: [2.2, 0.5], footF: [-2.0, 0.5], nSh: 1.3, nEl: 0.2, fSh: 1.1, fEl: 0.2, tendril: -0.4 },
      { name: 'chuông vỡ – rễ sụp', hipY: 4.6, hipX: 0.3, torso: -1.05, neck: -0.4, crackBig: true,
        bellFree: [12.5, 4.45, -0.35], shards: [[16.4, 0.5, 0.3], [8.4, 0.5, -0.4], [15.0, 0.5, 0.1]],
        footN: [3.2, 0.5], footF: [-1.4, 0.5], nSh: 2.2, nEl: 0.2, fSh: 2.0, fEl: 0.2, tendril: -0.6, hold: 2 },
      { name: 'rễ khô nằm im', hipY: 4.3, hipX: 0.3, torso: -1.15, neck: -0.5, crackBig: true,
        bellFree: [12.5, 4.45, -0.35], shards: [[16.4, 0.5, 0.3], [8.4, 0.5, -0.4], [15.0, 0.5, 0.1]],
        footN: [3.0, 0.5], footF: [-1.4, 0.5], nSh: 2.1, nEl: 0.2, fSh: 1.9, fEl: 0.2, tendril: -0.8, hold: 3 }
    ]}
  ];
  ANIMS.forEach(a => { a.frames = a.frames.map(f => Object.assign({}, BASE, f)); });

  /* ---------- Áp pose lên rig ---------- */
  function applyPose(p) {
    rig.body.rotation.z = p.bodyRot;
    rig.body.position.set(p.bodyX, p.bodyY, 0);
    rig.hips.position.set(p.hipX, p.hipY, 0);
    rig.torso.rotation.z = p.torso;
    rig.neck.rotation.z = p.neck;
    rig.tendril.rotation.z = rig.tendrilBase + p.tendril;
    rig.armN.sh.rotation.z = p.nSh; rig.armN.el.rotation.z = p.nEl;
    rig.armF.sh.rotation.z = p.fSh; rig.armF.el.rotation.z = p.fEl;
    solveLeg(rig.legN, p.hipX, p.hipY, p.footN, p.footAngN);
    solveLeg(rig.legF, p.hipX, p.hipY, p.footF, p.footAngF);

    // Chuông: gắn cổ hoặc rơi tự do
    if (p.bellFree) {
      if (rig.bell.parent !== rig.root) rig.root.add(rig.bell);
      rig.bell.position.set(p.bellFree[0], p.bellFree[1], 0);
      rig.bell.rotation.set(0, BELL_YAW, p.bellFree[2]);
    } else {
      if (rig.bell.parent !== rig.neck) rig.neck.add(rig.bell);
      rig.bell.position.set(BELL_ON_NECK.x, BELL_ON_NECK.y, 0);
      rig.bell.rotation.set(0, BELL_YAW, BELL_ON_NECK.rot);
    }
    const cm = p.glow ? mat(PAL.glow) : mat(PAL.ink);
    rig.cracks.forEach(m => { m.material = cm; });
    rig.cracksBig.forEach(m => { m.visible = !!p.crackBig; });

    rig.shards.forEach((s, i) => {
      const d = p.shards && p.shards[i];
      s.visible = !!d;
      if (d) { s.position.set(d[0], d[1], 2.0); s.rotation.z = d[2]; }
    });

    if (p.sm) {
      const t0 = THREE.MathUtils.degToRad(p.sm.a[0]), t1 = THREE.MathUtils.degToRad(p.sm.a[1]);
      rig.smear.geometry.dispose();
      rig.smear.geometry = new THREE.RingGeometry(p.sm.r[0], p.sm.r[1], 24, 1, t0, t1 - t0);
      rig.smear.position.set(p.sm.c[0], p.sm.c[1], p.sm.z === undefined ? 2.5 : p.sm.z);
      rig.smear.visible = true;
    } else {
      rig.smear.visible = false;
    }
  }

  /* ---------- Render 128×128 → lấy mẫu nearest 32×32 (LẬT NGANG) → khóa màu + viền ---------- */
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = rawCanvas.height = RENDER;
  const rawCtx = rawCanvas.getContext('2d', { willReadFrequently: true });

  function captureFrame(pose) {
    applyPose(pose);
    renderer.render(scene, camera);
    rawCtx.clearRect(0, 0, RENDER, RENDER);
    rawCtx.drawImage(renderer.domElement, 0, 0);
    const raw = rawCtx.getImageData(0, 0, RENDER, RENDER);
    const px = rawCtx.createImageData(CELL, CELL);
    const off = SS >> 1;
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
      const sx = CELL - 1 - x;                                   // lật ngang: quay mặt sang trái
      const i = ((y * SS + off) * RENDER + (sx * SS + off)) * 4;
      const o = (y * CELL + x) * 4;
      if (raw.data[i + 3] >= 128) {
        px.data[o] = raw.data[i]; px.data[o + 1] = raw.data[i + 1]; px.data[o + 2] = raw.data[i + 2]; px.data[o + 3] = 255;
      }
    }
    return postProcess(px);
  }
  function postProcess(src) {
    const out = rawCtx.createImageData(CELL, CELL);
    out.data.set(src.data);
    const d = out.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      let best = 0, bd = Infinity;
      PAL_RGB.forEach((c, k) => {
        const dist = (d[i] - c[0]) ** 2 + (d[i + 1] - c[1]) ** 2 + (d[i + 2] - c[2]) ** 2;
        if (dist < bd) { bd = dist; best = k; }
      });
      d[i] = PAL_RGB[best][0]; d[i + 1] = PAL_RGB[best][1]; d[i + 2] = PAL_RGB[best][2];
    }
    const solid = (x, y) => x >= 0 && y >= 0 && x < CELL && y < CELL && src.data[(y * CELL + x) * 4 + 3] > 0;
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) {
        const o = (y * CELL + x) * 4;
        d[o] = 0x0C; d[o + 1] = 0x0F; d[o + 2] = 0x14; d[o + 3] = 255;
      }
    }
    return out;
  }

  /* ---------- Kiểm tra mép ô + mặt đất (đo đỉnh mesh, hệ dựng) ---------- */
  const _v = new THREE.Vector3();
  function isShown(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }
  function measure() {
    scene.updateMatrixWorld(true);
    const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    scene.traverse(o => {
      if (!o.isMesh || !isShown(o)) return;
      const pos = o.geometry.attributes.position;
      if (!pos) return;
      for (let i = 0; i < pos.count; i++) {
        _v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (_v.x < b.x0) b.x0 = _v.x; if (_v.x > b.x1) b.x1 = _v.x;
        if (_v.y < b.y0) b.y0 = _v.y; if (_v.y > b.y1) b.y1 = _v.y;
      }
    });
    const loi = [];
    if (b.x1 > VIEW.right - 1) loi.push('sát mép trái');      // phía trước mặt = bên trái ô
    if (b.x0 < VIEW.left + 1) loi.push('sát mép phải');
    if (b.y1 > VIEW.top - 1) loi.push('sát mép trên');
    if (b.y0 < -0.3) loi.push('lún đất ' + (-b.y0).toFixed(2) + ' px');
    return loi;
  }

  /* ---------- Dựng atlas ---------- */
  const cols = Math.max(...ANIMS.map(a => a.frames.length));
  const canvas = document.createElement('canvas');
  canvas.width = cols * CELL; canvas.height = ANIMS.length * CELL;
  const ctx = canvas.getContext('2d');
  const anims = {}, kiemTra = [];
  ANIMS.forEach((a, r) => {
    const entry = { row: r, loop: a.loop, label: a.label, frames: a.frames.map((f, i) => {
      ctx.putImageData(captureFrame(f), i * CELL, r * CELL);
      const loi = measure();
      if (loi.length) kiemTra.push({ anim: a.key, frame: i, loi });
      return { x: i * CELL, y: r * CELL, hold: f.hold, hit: !!f.hit, comboWindow: !!f.comboWindow, name: f.name, baoTruoc: !!f.baoTruoc };
    }) };
    if (a.zone) {
      const z = a.zone;
      const rect = { x: toCellX(z.x1), y: toCellY(z.y1), w: z.x1 - z.x0, h: z.y1 - z.y0 };
      entry.vungBaoTruoc = rect;
      entry.hitbox = Object.assign({}, rect);
    }
    anims[a.key] = entry;
  });

  rig.root.add(rig.bell);
  scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  matCache.forEach(m => m.dispose());
  renderer.dispose();
  if (renderer.forceContextLoss) renderer.forceContextLoss();

  return {
    canvas, w: CELL, h: CELL, cols, rows: ANIMS.length, fps: 10,
    pivot: { x: PIVOT_PX.x, y: PIVOT_PX.y },
    huong: 'trai',
    anims, kiemTra
  };
};
})(typeof window !== 'undefined' ? window : this);
