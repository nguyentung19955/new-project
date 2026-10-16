/* =====================================================================
   rig-lam.js — rig Thợ Săn Chuông (Lam) + 26 animation, tách từ tools/sprite-lab.html.
   Nạp bằng thẻ <script> sau Three.js r128 (bản UMD có global THREE).
   API:  TV.taoAtlasLam(THREE) → {
           canvas, w:24, h:24, cols, rows, pivot:{x,y}, fps,
           anims: { ten: { row, loop, frames:[{x,y,hold,hit,comboWindow,name}] } },
           kiemTra: [ { anim, frame, loi } ]   // khung chạm mép ô / lún đất (đo đỉnh mesh)
         }
   Ảnh atlas: mỗi hàng một animation, mỗi ô 24×24, nền trong suốt.
   ===================================================================== */
(function (root) {
'use strict';
var TV = root.TV = root.TV || {};

TV.taoAtlasLam = function (THREE) {
  const CELL = 24;              // kích thước ô sprite xuất ra
  const SS = 4;                 // hệ số render nội bộ
  const RENDER = CELL * SS;     // 96×96
  const VIEW = { left: -10.5, right: 13.5, top: 22, bottom: -2 }; // khung camera (đơn vị pixel)
  const PIVOT_PX = { x: -VIEW.left, y: VIEW.top };                 // pivot trong ô: (10.5, 22)

  // Bảng màu theo hình nhân vật đã chốt
  const PAL = {
    ink:       0x0C0F14, // viền, mảng tối nhất, găng tay, lòng mũ
    cloak:     0x212835, // mũ, áo choàng
    dark:      0x1A212B, // bóng, tay chân phía xa
    greenDark: 0x21413A, // xanh tối
    green:     0x32804F, // xanh lá chính (áo trong)
    mint:      0x83CC93, // viền sáng xanh, lưỡi kiếm
    light:     0xCEF0D6, // điểm sáng, mắt, cạnh kiếm
    slate:     0x4A5A6E, // xám kim loại: quai đeo
    gold:      0xE1B85A, // điểm nhấn ấm: chuông, chắn kiếm
    goldDark:  0x9C6B30, // bóng của vàng đồng
    cream:     0xF3E6C8  // ánh sáng trên chuông
  };
  const PAL_RGB = Object.values(PAL).map(h => [(h >> 16) & 255, (h >> 8) & 255, h & 255]);

  /* =====================================================================
     RENDERER + CAMERA + ÁNH SÁNG
     Camera orthographic cố định, nhìn ngang dọc trục -Z.
     Ánh sáng là một hướng cố định trong không gian thế giới (uniform shader).
     ===================================================================== */
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
  if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.LinearEncoding;
  renderer.setPixelRatio(1);
  renderer.setSize(RENDER, RENDER, false);
  renderer.setClearColor(0x000000, 0);   // nền trong suốt, không có bóng đổ nền

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(VIEW.left, VIEW.right, VIEW.top, VIEW.bottom, 0.1, 200);
  camera.position.set(0, 0, 60);
  camera.lookAt(0, 0, 0);

  const LIGHT_DIR = new THREE.Vector3(0.45, 0.75, 0.5).normalize();

  // Shader 2 tông: mặt hướng sáng = màu gốc, mặt khuất = màu bóng.
  // Xuất thẳng giá trị sRGB nên màu trên ảnh đúng mã màu trong bảng.
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
  function mat(base, shade = base) {
    const key = base + '_' + shade;
    if (!matCache.has(key)) {
      matCache.set(key, new THREE.ShaderMaterial({
        uniforms: { uBase: { value: hexVec(base) }, uShade: { value: hexVec(shade) }, uLight: { value: LIGHT_DIR } },
        vertexShader: VS, fragmentShader: FS
      }));
    }
    return matCache.get(key);
  }

  /* =====================================================================
     MODEL: dựng nhân vật từ khối đơn giản trên một hệ khớp duy nhất.
     Mọi animation chỉ xoay / dịch các khớp này.
     Quy ước góc xoay Z: dương = đầu chi đang buông xuống vung về phía trước (+X);
     với thân / đầu, dương = ngả ra sau.
     ===================================================================== */
  function joint(parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function box(parent, w, h, d, base, shade, x, y, z, rotZ = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(base, shade));
    m.position.set(x, y, z);
    m.rotation.z = rotZ;
    parent.add(m);
    return m;
  }

  const rig = {};
  rig.root = joint(scene, 0, 0, 0);          // PIVOT GỐC: giữa hai bàn chân, trên mặt đất. Không bao giờ di chuyển.
  rig.body = joint(rig.root, 0, 0, 0);       // dùng để nghiêng / ngã cả người (death)
  rig.hips = joint(rig.body, 0, 5.7, 0);     // hông

  // --- Chân: đùi 3, cẳng 2.5, bàn chân 0.5 → hông cao 6 khi đứng thẳng
  function makeLeg(near) {
    const z = near ? 0.8 : -0.8;
    const col = near ? PAL.cloak : PAL.dark;           // chân xa tối hơn để tách lớp
    const hip = joint(rig.hips, near ? 0.3 : -0.3, 0, z);
    box(hip, 1.7, 3.3, 1.2, col, PAL.dark, 0, -1.5, 0);  // đùi
    const knee = joint(hip, 0, -3, 0);
    box(knee, 1.5, 2.7, 1.1, col, PAL.dark, 0, -1.2, 0);  // cẳng chân
    const ankle = joint(knee, 0, -2.5, 0);
    box(ankle, 2.5, 0.9, 1.25, PAL.ink, PAL.ink, 0.45, -0.05, 0); // giày, đáy ở -0.5
    return { hip, knee, ankle, hx: near ? 0.3 : -0.3 };
  }
  rig.legF = makeLeg(false);
  rig.legN = makeLeg(true);

  // --- Thân + áo choàng ngắn
  rig.torso = joint(rig.hips, 0, 0, 0);
  box(rig.torso, 4.4, 6.8, 3.0, PAL.cloak, PAL.dark, -0.1, 3.3, 0);     // thân áo choàng
  box(rig.torso, 1.45, 4.2, 3.1, PAL.green, PAL.greenDark, 1.45, 3.7, 0);       // áo trong đỏ gạch lộ phía trước
  box(rig.torso, 4.5, 0.8, 3.15, PAL.ink, PAL.ink, -0.1, 1.0, 0);     // thắt lưng
  box(rig.torso, 0.9, 5.0, 0.2, PAL.slate, PAL.slate, -0.3, 4.3, 1.62, -0.71); // quai đeo chuông chéo ngực

  // Vạt áo choàng sau lưng: 2 đoạn, khớp ở lưng trên
  rig.capeA = joint(rig.torso, -1.9, 6.4, 0);
  box(rig.capeA, 1.3, 3.7, 3.4, PAL.cloak, PAL.dark, -0.1, -1.8, 0);
  rig.capeB = joint(rig.capeA, -0.1, -3.5, 0);
  box(rig.capeB, 1.2, 3.1, 3.3, PAL.cloak, PAL.dark, 0, -1.5, 0);
  box(rig.capeB, 1.3, 0.6, 3.35, PAL.green, PAL.green, 0, -2.85, 0); // mép vạt áo xanh

  // Chuông: treo cố định sau vai trái bằng quai, chỉ được lắc nhẹ quanh điểm treo
  rig.bell = joint(rig.torso, -2.6, 6.0, -1.3);
  {
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.5, 2.6, 10), mat(PAL.gold, PAL.goldDark));
    bell.position.set(-0.9, -1.5, 0);
    rig.bell.add(bell);
    box(rig.bell, 0.8, 0.7, 0.8, PAL.dark, PAL.dark, -0.9, 0.0, 0);   // móc treo
    box(rig.bell, 0.7, 0.7, 0.7, PAL.goldDark, PAL.goldDark, -0.9, -3.0, 0); // quả lắc
    box(rig.bell, 0.5, 1.6, 0.3, PAL.cream, PAL.cream, -1.6, -1.7, 1.45); // vệt sáng
  }

  // Đầu + mũ trùm nhọn. Mặt không chi tiết, chỉ 1 pixel sáng làm mắt.
  rig.head = joint(rig.torso, 0.3, 6.6, 0);
  box(rig.head, 2.8, 3.0, 2.4, PAL.ink, PAL.ink, 1.0, 2.0, 0);        // mặt (chỉ lộ phần trước)
  box(rig.head, 3.9, 4.6, 3.6, PAL.cloak, PAL.dark, -0.65, 2.5, 0);     // mũ trùm
  box(rig.head, 1.6, 1.0, 3.7, PAL.cloak, PAL.dark, 1.4, 4.3, 0);       // vành mũ chìa ra trước
  box(rig.head, 0.9, 0.9, 0.2, PAL.light, PAL.light, 1.9, 2.3, 1.3);    // mắt
  {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.4, 8), mat(PAL.cloak, PAL.dark));
    tip.position.set(-2.0, 4.4, 0);
    tip.rotation.z = 1.05;                                              // chóp mũ chĩa ra sau-lên
    rig.head.add(tip);
  }

  // Tay xa (tay trái): nằm sau thân, màu tối
  rig.fSh = joint(rig.torso, -0.2, 5.6, -1.9);
  box(rig.fSh, 1.3, 2.7, 1.1, PAL.dark, PAL.dark, 0, -1.2, 0);
  rig.fEl = joint(rig.fSh, 0, -2.4, 0);
  box(rig.fEl, 1.2, 2.0, 1.0, PAL.dark, PAL.dark, 0, -0.9, 0);
  box(rig.fEl, 1.2, 0.9, 1.0, PAL.ink, PAL.ink, 0, -2.2, 0);

  // Tay gần (tay phải cầm kiếm): khớp vai → khuỷu → cổ tay → kiếm
  rig.nSh = joint(rig.torso, 0.6, 5.6, 1.9);
  box(rig.nSh, 1.4, 2.9, 1.2, PAL.cloak, PAL.dark, 0, -1.2, 0);
  rig.nEl = joint(rig.nSh, 0, -2.6, 0);
  box(rig.nEl, 1.3, 2.0, 1.1, PAL.cloak, PAL.dark, 0, -0.9, 0);
  box(rig.nEl, 1.3, 1.0, 1.1, PAL.ink, PAL.ink, 0, -2.3, 0);          // bàn tay
  rig.wrist = joint(rig.nEl, 0, -2.3, 0.5);
  // Kiếm dài ~7: gắn cứng vào cổ tay, lưỡi chĩa theo hướng -Y của bàn tay
  box(rig.wrist, 0.8, 0.8, 0.5, PAL.gold, PAL.gold, 0, 1.0, 0);       // núm chuôi
  box(rig.wrist, 0.7, 1.5, 0.5, PAL.ink, PAL.ink, 0, 0.1, 0);         // chuôi
  box(rig.wrist, 2.1, 0.6, 0.6, PAL.gold, PAL.goldDark, 0, -0.9, 0);        // chắn tay
  box(rig.wrist, 1.0, 5.0, 0.4, PAL.mint, PAL.green, 0, -3.7, 0);        // lưỡi
  box(rig.wrist, 0.35, 4.4, 0.45, PAL.light, PAL.light, 0.32, -3.6, 0); // lưỡi sắc sáng

  // Vệt chém (smear): cung tròn quanh vai, chỉ hiện ở khung ra đòn
  rig.smear = new THREE.Mesh(new THREE.BufferGeometry(), mat(PAL.light, PAL.light));
  rig.smear.position.set(0.6, 5.6, 2.1);
  rig.smear.visible = false;
  rig.torso.add(rig.smear);

  /* =====================================================================
     IK 2 xương cho chân: đặt vị trí bàn chân, tự tính góc đùi / gối.
     Giữ bàn chân bám đất trong khi pivot gốc đứng yên.
     ===================================================================== */
  const L1 = 3, L2 = 2.5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function solveLeg(leg, hipX, hipY, foot, footAng) {
    const hx = hipX + leg.hx, hy = hipY;
    const dx = foot[0] - hx, dy = foot[1] - hy;
    const d = clamp(Math.hypot(dx, dy), 0.6, L1 + L2 - 0.001);
    const phi = Math.atan2(dx, -dy);                                       // góc từ phương thẳng đứng xuống
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const b = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    const thigh = phi + a;                 // gối gập về phía trước
    const knee = -(Math.PI - b);
    leg.hip.rotation.z = thigh;
    leg.knee.rotation.z = knee;
    leg.ankle.rotation.z = -(thigh + knee) + footAng; // giữ bàn chân song song mặt đất
  }

  /* =====================================================================
     ANIMATION: mỗi khung là một tư thế (pose) của cùng một rig.
     footN / footF = vị trí cổ chân gần / xa (đơn vị pixel, so với pivot).
     smear = [độ bắt đầu, độ kết thúc, bán kính trong, bán kính ngoài] quanh vai.
     hold = số nhịp giữ khung khi xem (ảnh xuất vẫn 1 ô / khung).
     ===================================================================== */
  const BASE = {
    bodyRot: 0, bodyX: 0, bodyY: 0,
    hipX: 0, hipY: 5.7, torso: -0.05, head: 0.05,
    capeA: -0.12, capeB: -0.06, bell: 0,
    footN: [1.2, 0.5], footF: [-1.0, 0.5], footAngN: 0, footAngF: 0,
    nSh: 0.5, nEl: 0.9, wrist: -0.3, fSh: -0.15, fEl: 0.4,
    name: '', smear: null, hit: false, hold: 1, comboWindow: false,
    handN: null, handF: null, swordAng: null, ledge: null, sm: null, smearPos: null
  };

  // Tư thế "thủ thế" dùng ở đầu và cuối đòn chém
  const ATTACK_READY = { hipY: 4.9, torso: -0.15, head: 0.14, footN: [1.9, 0.5], footF: [-1.6, 0.5],
    nSh: 0.6, nEl: 1.0, wrist: -0.45, fSh: 0.35, fEl: 0.6, capeA: -0.22, capeB: -0.1 };

  // ĐỢT 3 – điểm nối combo: khung cuối nhát trước = khung đầu nhát sau
  const A1_END = { hipY: 4.7, hipX: 0.2, torso: -0.2, head: 0.15, footN: [2.4, 0.5], footF: [-1.8, 0.5],
    handN: [3.4, 6.1], swordAng: 0.9, handF: [-1.0, 7.0], capeA: -0.45, capeB: -0.1, bell: 0.1 };   // kiếm thấp phía trước
  const A2_END = { hipY: 5.3, hipX: 0.2, torso: 0.1, head: -0.04, footN: [2.3, 0.5], footF: [-1.6, 0.5],
    handN: [1.8, 14.0], swordAng: 2.95, handF: [-1.8, 9.0], capeA: -0.5, capeB: -0.3, bell: -0.2 }; // kiếm trên cao

  // Tư thế nằm gục cuối animation chết
  const DEATH_LIE = { bodyRot: -1.57, bodyX: -6.6, bodyY: 2.4, hipY: 5.4, torso: 0, head: 0.25,
    footN: [0.8, 0.5], footF: [-0.8, 0.5], footAngN: 0.6, nSh: 0.1, nEl: 0, wrist: -0.1,
    fSh: 0.2, fEl: 0.3, capeA: 0.5, capeB: 0.3 };

  // Chạy: 8 pha cho mỗi chân, chân xa lệch 4 pha so với chân gần
  const RUN_FOOT = [
    { p: [2.5, 0.5], a: 0.15 },  // chạm đất phía trước
    { p: [1.1, 0.5], a: 0 },     // dồn lực
    { p: [-0.3, 0.5], a: 0 },    // chân trụ dưới hông
    { p: [-1.9, 1.15], a: -0.45 }, // đạp đất
    { p: [-2.6, 2.6], a: -0.6 }, // nhấc ra sau
    { p: [-0.8, 3.5], a: -0.3 }, // co cao
    { p: [1.3, 3.1], a: 0 },     // đưa ra trước
    { p: [2.6, 1.6], a: 0.2 }    // vươn tới
  ];
  const RUN_NAMES = ['chân trước chạm đất', 'nhún – dồn lực', 'chân lướt qua', 'đạp đất – bay',
    'chân kia chạm đất', 'nhún – dồn lực (2)', 'chân lướt qua (2)', 'đạp đất – bay (2)'];
  const RUN_HIP = [5.1, 4.5, 5.3, 6.0];
  const RUN_CAPE_A = [-0.8, -0.55, -0.95, -1.25], RUN_CAPE_B = [-0.3, -0.55, -0.35, -0.1];
  const RUN_BELL = [-0.15, 0.12, 0.22, 0];
  const RUN_FRAMES = RUN_NAMES.map((name, k) => {
    const n = RUN_FOOT[k], f = RUN_FOOT[(k + 4) % 8], c = Math.cos(k * Math.PI / 4), h = k % 4;
    return { name, hipY: RUN_HIP[h], torso: -0.36 + (h === 1 ? -0.06 : 0), head: 0.24,
      footN: n.p, footAngN: n.a, footF: f.p, footAngF: f.a,
      nSh: 0.45 - 0.75 * c, nEl: 1.35 + 0.35 * c, wrist: -0.2 + 0.15 * c, fSh: 0.1 + 0.85 * c, fEl: 1.0,
      capeA: RUN_CAPE_A[h], capeB: RUN_CAPE_B[h], bell: RUN_BELL[h] };
  });

  const ANIMS = [
    { key: 'idle', label: 'Idle', loop: true, frames: [
      { name: 'đứng thẳng', hipY: 5.7, capeA: -0.14 },
      { name: 'thở ra', hipY: 5.3, torso: -0.1, head: 0.12, capeA: -0.4, capeB: 0.06, bell: 0.1,
        nSh: 0.68, nEl: 1.0, wrist: -0.5, fSh: -0.04 },
      { name: 'hạ người – thấp nhất', hipY: 4.8, torso: -0.18, head: 0.2, capeA: -0.6, capeB: 0.18, bell: 0.2,
        nSh: 0.84, nEl: 1.1, wrist: -0.7, fSh: 0.08, fEl: 0.5 },
      { name: 'vạt áo phất', hipY: 5.0, torso: -0.12, head: 0.14, capeA: -0.62, capeB: -0.3, bell: 0.08,
        nSh: 0.66, nEl: 1.0, wrist: -0.35, fSh: 0.0 },
      { name: 'hít vào', hipY: 5.4, torso: -0.02, head: 0.04, capeA: -0.32, capeB: -0.32, bell: -0.06,
        nSh: 0.48, nEl: 0.9, wrist: -0.18, fSh: -0.22 },
      { name: 'ưỡn ngực – cao nhất', hipY: 5.8, torso: 0.06, head: -0.04, capeA: 0.06, capeB: -0.32, bell: -0.12,
        nSh: 0.34, nEl: 0.84, wrist: 0.05, fSh: -0.3 }
    ]},
    { key: 'run', label: 'Run', loop: true, frames: RUN_FRAMES },
    { key: 'jump', label: 'Jump', loop: false, frames: [
      { name: 'lấy đà', hipY: 3.9, hipX: -0.2, torso: -0.62, head: 0.42, footN: [1.5, 0.5], footF: [-1.2, 0.5],
        nSh: -1.0, nEl: 1.3, wrist: -0.1, fSh: -1.3, fEl: 0.5, capeA: -0.15, capeB: 0.1, bell: 0.1 },
      { name: 'bật lên', bodyY: 0.6, hipY: 6.0, torso: -0.04, head: 0.0, footN: [0.6, 0.9], footAngN: -0.7,
        footF: [-0.6, 1.0], footAngF: -0.6, nSh: 2.3, nEl: 0.3, wrist: -0.6, fSh: 2.7, fEl: 0.2,
        capeA: -0.25, capeB: 0.2, bell: 0.3 },
      { name: 'lên 1', bodyY: 2.0, hipY: 5.8, torso: -0.14, head: 0.1, footN: [1.3, 2.8], footAngN: 0.1,
        footF: [-0.5, 2.2], footAngF: -0.3, nSh: 1.7, nEl: 0.6, wrist: -0.5, fSh: 1.9, fEl: 0.3,
        capeA: 0.05, capeB: 0.15, bell: 0.2 },
      { name: 'lên 2', bodyY: 3.0, hipY: 5.6, torso: -0.24, head: 0.18, footN: [1.7, 3.7], footAngN: 0.2,
        footF: [0.2, 3.1], nSh: 1.15, nEl: 0.8, wrist: -0.4, fSh: 1.3, fEl: 0.4,
        capeA: -0.4, capeB: -0.1, bell: 0 },
      { name: 'đỉnh nhảy', bodyY: 3.2, hipY: 5.5, torso: -0.34, head: 0.28, footN: [1.6, 4.1], footAngN: 0.25,
        footF: [-0.1, 3.7], footAngF: 0.1, nSh: 0.75, nEl: 1.0, wrist: -0.3, fSh: 1.7, fEl: 0.5,
        capeA: -1.4, capeB: -0.6, bell: -0.4 },
      { name: 'chuyển sang rơi', bodyY: 2.7, hipY: 5.8, torso: -0.1, head: 0.28, footN: [1.2, 2.1],
        footF: [-0.9, 1.6], nSh: 1.8, nEl: 0.5, wrist: -0.2, fSh: 2.2, fEl: 0.3,
        capeA: -2.2, capeB: -0.6, bell: -0.6 }
    ]},
    { key: 'fall', label: 'Fall', loop: true, frames: [
      { name: 'rơi – áo bay lên', bodyY: 1.8, hipY: 5.8, torso: -0.15, head: 0.3, footN: [1.1, 1.5], footAngN: 0.2,
        footF: [-0.9, 1.0], nSh: 1.55, nEl: 0.5, wrist: -0.2, fSh: 2.1, fEl: 0.3, capeA: -2.35, capeB: -0.45, bell: -0.55 },
      { name: 'rơi – vạt áo quất', bodyY: 1.6, hipY: 5.8, torso: -0.2, head: 0.36, footN: [1.4, 0.9], footAngN: 0.1,
        footF: [-1.2, 1.4], footAngF: -0.2, nSh: 1.95, nEl: 0.4, wrist: -0.1, fSh: 2.55, fEl: 0.2,
        capeA: -2.7, capeB: -1.05, bell: -0.85 },
      { name: 'rơi – dang tay giữ thăng bằng', bodyY: 1.7, hipY: 5.8, torso: -0.1, head: 0.24, footN: [0.9, 1.2],
        footF: [-0.7, 0.8], nSh: 1.3, nEl: 0.7, wrist: -0.3, fSh: 1.7, fEl: 0.5,
        capeA: -2.0, capeB: -0.15, bell: -0.4 }
    ]},
    /* ===================== ĐỢT 3: CHIẾN ĐẤU =====================
       sm = vệt chém, tọa độ theo thân (cùng hệ với handN): a = [độ đầu, độ cuối] theo trục ngang,
       c = tâm cung (mặc định = vai gần), r = [bán kính trong, ngoài] (bỏ trống = tự theo mũi kiếm),
       z = độ sâu (âm = nằm sau người, dùng cho vòng tiếng vọng / ánh sáng).
       comboWindow = khung người chơi bấm tiếp để nối nhát sau. */
    { key: 'attack', label: 'Attack 1', loop: false, frames: [
      { name: 'thủ thế', ...ATTACK_READY },
      { name: 'kéo kiếm ra sau ngang ngực', hipY: 4.7, hipX: -0.3, torso: 0.08, head: 0.08, footN: [1.9, 0.5], footF: [-1.8, 0.5],
        handN: [-1.4, 9.4], swordAng: -1.7, handF: [1.8, 8.6], capeA: -0.1, capeB: 0.05, bell: 0.15 },
      { name: 'dồn trọng tâm – kiếm ngang sau lưng', hipY: 4.5, hipX: -0.45, torso: 0.16, head: 0.0, footN: [2.0, 0.5], footF: [-2.1, 0.5],
        handN: [-1.9, 9.6], swordAng: -1.62, handF: [2.0, 8.4], capeA: 0.0, capeB: 0.1, bell: 0.28, hold: 2 },
      { name: 'vung ngang – kiếm lướt qua ngực', hipY: 4.5, hipX: 0, torso: -0.1, head: 0.1, footN: [2.4, 0.5], footF: [-2.0, 0.5],
        handN: [2.2, 9.5], swordAng: 1.5, handF: [0.2, 8.2], capeA: -0.45, capeB: -0.15, bell: -0.1,
        sm: { c: [1.0, 21.5], a: [-118, -72], r: [11.0, 12.6] } },
      { name: 'chém thẳng ngang ngực – HIT', hipY: 4.4, hipX: 0.4, torso: -0.3, head: 0.26, footN: [2.7, 0.5], footF: [-2.0, 0.5],
        handN: [5.2, 9.0], swordAng: 1.57, handF: [-2.2, 8.0], capeA: -0.95, capeB: -0.45, bell: -0.35,
        sm: { c: [4.5, 21.4], a: [-122, -60], r: [11.2, 13.0] }, hit: true, hold: 2 },
      { name: 'theo đà – kiếm vượt qua', comboWindow: true, hipY: 4.3, hipX: 0.5, torso: -0.42, head: 0.32, footN: [2.7, 0.5], footF: [-2.0, 0.5],
        handN: [4.6, 7.8], swordAng: 1.25, handF: [-2.4, 7.4], capeA: -1.15, capeB: -0.55, bell: -0.4,
        sm: { c: [7.0, 20.5], a: [-104, -78], r: [11.4, 12.4] } },
      { name: 'hạ kiếm – sẵn sàng nối', comboWindow: true, hipY: 4.5, hipX: 0.35, torso: -0.3, head: 0.22, footN: [2.6, 0.5], footF: [-1.9, 0.5],
        handN: [4.0, 6.8], swordAng: 1.05, handF: [-1.8, 7.2], capeA: -0.8, capeB: -0.5, bell: 0.2 },
      { name: 'thu kiếm – kiếm thấp phía trước', hipY: 4.6, hipX: 0.25, torso: -0.24, head: 0.18, footN: [2.5, 0.5], footF: [-1.8, 0.5],
        handN: [3.6, 6.3], swordAng: 0.95, handF: [-1.3, 7.1], capeA: -0.6, capeB: -0.2, bell: 0.15 },
      { name: 'kiếm thấp phía trước (nối nhát 2)', ...A1_END }
    ]},
    { key: 'dodge', label: 'Dodge', loop: false, frames: [
      { name: 'nhún thấp', hipY: 4.0, torso: -0.6, head: 0.4, footN: [1.6, 0.5], footF: [-1.6, 0.5],
        nSh: 0.5, nEl: 1.4, wrist: 0.1, fSh: -0.6, fEl: 0.5, capeA: -0.3, capeB: -0.05 },
      { name: 'phóng người', hipY: 3.8, hipX: 1.2, bodyY: 0.5, torso: -1.1, head: 0.7, footN: [2.6, 1.4],
        footF: [-1.0, 2.0], footAngF: -0.4, nSh: -0.8, nEl: 1.4, wrist: -0.4, fSh: -1.4, fEl: 0.4,
        capeA: -1.4, capeB: -0.6, bell: -0.5 },
      { name: 'lướt thấp', hipY: 3.3, hipX: 1.4, bodyY: 0.3, torso: -1.35, head: 0.9, footN: [2.8, 1.0],
        footF: [-1.8, 1.4], footAngF: -0.3, nSh: -1.2, nEl: 1.3, wrist: -0.3, fSh: -1.6, fEl: 0.3,
        capeA: -1.9, capeB: -0.8, bell: -0.6 },
      { name: 'trượt chân', hipY: 3.9, hipX: 1.3, torso: -1.0, head: 0.6, footN: [3.0, 0.5],
        footF: [-2.6, 0.9], footAngF: -0.4, nSh: -0.7, nEl: 1.2, wrist: -0.9, fSh: -1.0, fEl: 0.4,
        capeA: -1.6, capeB: -0.9, bell: -0.3 },
      { name: 'phanh lại', hipY: 4.4, hipX: 0.8, torso: -0.4, head: 0.3, footN: [2.6, 0.5], footF: [-1.8, 0.5],
        nSh: 0.3, nEl: 1.1, wrist: -0.2, fSh: 0.4, fEl: 0.5, capeA: -0.6, capeB: 0.4, bell: 0.4 },
      { name: 'đứng vững', hipY: 5.2, hipX: 0.4, torso: -0.05, head: 0.05, footN: [2.0, 0.5], footF: [-1.2, 0.5],
        nSh: 0.5, nEl: 0.9, wrist: -0.3, fSh: 0.1, capeA: -0.1, capeB: 0.15, bell: 0.2 }
    ]},
    { key: 'hit', label: 'Hit', loop: false, frames: [
      { name: 'trúng đòn', hipX: -0.55, hipY: 5.2, torso: 0.42, head: 0.45, footN: [1.5, 0.5], footF: [-1.4, 0.5],
        nSh: 0.0, nEl: 1.5, wrist: -0.4, fSh: 0.7, capeA: 0.35, capeB: 0.25, bell: 0.5 },
      { name: 'bật ngửa', hipX: -0.45, hipY: 4.9, torso: 0.52, head: 0.4, footN: [1.8, 1.0], footAngN: 0.4,
        footF: [-1.6, 0.5], nSh: 1.7, nEl: 0.3, wrist: 0.4, fSh: -1.5, fEl: 0.2, capeA: 0.55, capeB: 0.3, bell: 0.7, hold: 2 },
      { name: 'loạng choạng', hipX: -0.5, hipY: 4.8, torso: 0.2, head: 0.0, footN: [1.6, 0.5], footF: [-1.8, 0.5],
        nSh: 0.9, nEl: 0.8, wrist: 0.0, fSh: -0.4, fEl: 0.5, capeA: 0.0, capeB: 0.2, bell: 0.2 },
      { name: 'hồi lại', hipX: -0.1, hipY: 5.3, torso: -0.08, head: 0.1, footN: [1.4, 0.5], footF: [-1.2, 0.5],
        nSh: 0.55, nEl: 0.95, wrist: -0.3, fSh: -0.1, capeA: -0.25, capeB: -0.05, bell: -0.1 }
    ]},
    { key: 'death', label: 'Death', loop: false, frames: [
      { name: 'trúng đòn chí mạng', hipX: -0.6, hipY: 5.0, torso: 0.45, head: 0.5, footN: [1.5, 0.5], footF: [-1.4, 0.5],
        nSh: 1.2, nEl: 0.4, wrist: 0.3, fSh: -0.9, fEl: 0.3, capeA: 0.3, capeB: 0.2, bell: 0.5 },
      { name: 'khuỵu gối', hipY: 3.6, torso: -0.35, head: -0.35, footN: [1.8, 0.5], footF: [-2.6, 0.6],
        nSh: 0.2, nEl: 0.4, wrist: 0.9, fSh: 0.1, fEl: 0.3, capeA: 0, capeB: 0, bell: 0.1 },
      { name: 'gục đầu', hipY: 3.7, torso: -0.7, head: -0.6, footN: [1.8, 0.5], footF: [-2.6, 0.6],
        nSh: 0.0, nEl: 0.3, wrist: 1.7, fSh: -0.2, fEl: 0.3, capeA: 0.15, capeB: 0.1, bell: 0.25 },
      { name: 'chúi người', bodyRot: -0.25, bodyX: -0.5, bodyY: 0.85, hipY: 3.9, torso: -0.35, head: 0.1,
        footN: [1.6, 0.5], footF: [-2.3, 0.8], nSh: 0.9, nEl: 0.4, wrist: 0.4, fSh: 1.4, capeA: -0.3, bell: -0.3 },
      { name: 'đổ xuống', bodyRot: -0.8, bodyX: -2.8, bodyY: 2.0, hipY: 4.6, torso: -0.25, head: 0.15,
        footN: [1.0, 0.5], footF: [-1.4, 0.9], nSh: -0.1, nEl: 0, wrist: -0.2, fSh: 1.9, capeA: -0.6, bell: -0.5 },
      { name: 'sắp chạm đất', bodyRot: -1.3, bodyX: -5.4, bodyY: 2.5, hipY: 5.2, torso: -0.1, head: 0.2,
        footN: [0.9, 0.5], footF: [-1.0, 0.7], nSh: -0.2, nEl: 0, wrist: 0.03, fSh: 0.6, capeA: -0.3, bell: 0.2 },
      { name: 'đập xuống – nảy', ...DEATH_LIE, bodyY: 2.75, head: 0.32, capeA: 0.62, capeB: 0.32, bell: 1.0, nSh: -0.3, wrist: -0.3, fSh: -0.35, fEl: 0.6 },
      { name: 'nằm im', ...DEATH_LIE, bell: 0.85, hold: 3 }
    ]},

    /* ===================== ĐỢT 2: DI CHUYỂN =====================
       Tường luôn ở bên phải (phía trước mặt) tại x = WALL_X.
       handN / handF = vị trí tâm bàn tay gần / xa (IK 2 xương cho tay, chỉ để tính góc vai – khuỷu).
       swordAng = góc tuyệt đối của kiếm (0 = chĩa thẳng xuống, + = chĩa ra trước, − = chĩa ra sau).
       ledge = góc mép tường [x, y] để vẽ mờ trong bản xem trước. */
    { key: 'land', label: 'Land', loop: false, frames: [
      { name: 'chạm đất – nén người mạnh', hipY: 3.4, hipX: -0.1, torso: -0.55, head: 0.42,
        footN: [1.8, 0.5], footF: [-1.5, 0.5], handN: [3.0, 5.2], swordAng: 1.25, handF: [-2.2, 5.6],
        capeA: -1.7, capeB: -0.7, bell: -0.6 },
      { name: 'nén thấp nhất – hấp lực', hipY: 3.5, hipX: 0, torso: -0.68, head: 0.5,
        footN: [1.8, 0.5], footF: [-1.7, 0.5], handN: [3.2, 4.4], swordAng: 1.35, handF: [-1.4, 4.5],
        capeA: -0.85, capeB: -0.45, bell: 0.35 },
      { name: 'đứng dậy', hipY: 5.1, hipX: 0.1, torso: -0.14, head: 0.12,
        footN: [1.5, 0.5], footF: [-1.2, 0.5], nSh: 0.6, nEl: 1.0, wrist: -0.4, fSh: 0.0, fEl: 0.5,
        capeA: -0.3, capeB: 0.12, bell: 0.15 }
    ]},
    { key: 'crouch', label: 'Crouch', loop: false, frames: [
      { name: 'hạ người xuống', hipY: 4.1, torso: -0.28, head: 0.22,
        footN: [1.6, 0.5], footF: [-1.3, 0.5], handN: [2.4, 6.0], swordAng: 1.0, handF: [-0.6, 5.4],
        capeA: -0.45, capeB: 0.0, bell: 0.15 },
      { name: 'ngồi xổm – kiếm thủ trước', hipY: 3.5, torso: -0.42, head: 0.34,
        footN: [1.8, 0.5], footF: [-1.7, 0.5], handN: [3.1, 4.9], swordAng: 1.4, handF: [0.6, 4.0],
        capeA: -0.6, capeB: 0.25, bell: 0.3 }
    ]},
    { key: 'slide', label: 'Slide', loop: false, frames: [
      { name: 'lao người – bắt đầu trượt', hipY: 3.2, hipX: 0.2, torso: 0.05, head: 0.0,
        footN: [3.6, 0.5], footAngN: 0.25, footF: [-0.6, 0.6], handN: [-1.6, 4.6], swordAng: -1.45, handF: [3.0, 6.6],
        capeA: -1.15, capeB: -0.35, bell: -0.5 },
      { name: 'trượt thấp sát đất', hipY: 2.3, hipX: 0.7, torso: 0.32, head: -0.12,
        footN: [5.0, 0.5], footAngN: 0.3, footF: [0.9, 0.5], handN: [-1.9, 3.2], swordAng: -1.5, handF: [3.3, 6.2],
        capeA: -1.45, capeB: -0.12, bell: -0.8 },
      { name: 'trượt dài – áo kéo phía sau', hipY: 2.2, hipX: 0.9, torso: 0.36, head: -0.14,
        footN: [5.3, 0.5], footAngN: 0.3, footF: [1.2, 0.5], handN: [-1.8, 3.0], swordAng: -1.52, handF: [3.4, 6.0],
        capeA: -1.55, capeB: 0.02, bell: -0.9 },
      { name: 'giảm tốc – chống dậy', hipY: 3.4, hipX: 0.3, torso: -0.05, head: 0.08,
        footN: [3.0, 0.5], footF: [-0.4, 0.5], handN: [-1.0, 4.4], swordAng: -1.25, handF: [2.4, 5.6],
        capeA: -1.0, capeB: -0.4, bell: -0.3 }
    ]},
    { key: 'wallSlide', label: 'Wall Slide', loop: true, wall: true, frames: [
      { name: 'áp tường – trượt xuống', bodyY: 3.0, hipX: 3.2, hipY: 5.5, torso: -0.06, head: 0.05,
        footN: [4.75, 3.2], footAngN: 0.9, footF: [2.6, 0.7], footAngF: -0.3,
        handF: [5.85, 13.6], handN: [2.2, 8.4], swordAng: -0.35,
        capeA: -2.1, capeB: -0.5, bell: -0.5 },
      { name: 'trượt – tay miết tường', bodyY: 2.8, hipX: 3.2, hipY: 5.4, torso: -0.08, head: 0.06,
        footN: [4.75, 3.0], footAngN: 0.9, footF: [2.5, 0.6], footAngF: -0.35,
        handF: [5.85, 13.1], handN: [2.3, 8.2], swordAng: -0.42,
        capeA: -2.35, capeB: -0.75, bell: -0.65 },
      { name: 'trượt – áo choàng phần phật', bodyY: 2.9, hipX: 3.2, hipY: 5.45, torso: -0.07, head: 0.04,
        footN: [4.75, 3.1], footAngN: 0.9, footF: [2.7, 0.8], footAngF: -0.25,
        handF: [5.85, 13.35], handN: [2.25, 8.3], swordAng: -0.38,
        capeA: -2.0, capeB: -0.25, bell: -0.4 }
    ]},
    { key: 'wallJump', label: 'Wall Jump', loop: false, wall: true, frames: [
      { name: 'co người – hai chân dồn vào tường', bodyY: 3.0, hipX: 1.4, hipY: 5.0, torso: -0.35, head: 0.28,
        footN: [4.7, 3.2], footAngN: 1.2, footF: [4.5, 1.6], footAngF: 1.1,
        handF: [5.85, 12.4], handN: [1.2, 8.0], swordAng: -0.6,
        capeA: -1.6, capeB: -0.4, bell: -0.4 },
      { name: 'đạp tường – bật ra sau', bodyY: 3.4, hipX: 0.9, hipY: 5.3, torso: 0.55, head: -0.2,
        footN: [4.7, 2.6], footAngN: 1.2, footF: [3.6, 1.5], footAngF: 0.9,
        handN: [-2.8, 9.4], swordAng: -1.9, handF: [-1.6, 12.6],
        capeA: 0.6, capeB: 0.3, bell: 0.6 },
      { name: 'bay ngược – co chân', bodyY: 3.8, hipX: -0.6, hipY: 5.4, torso: 0.4, head: -0.1,
        footN: [1.6, 3.4], footAngN: 0.3, footF: [0.4, 2.8], footAngF: 0.1,
        handN: [-3.2, 10.6], swordAng: -2.1, handF: [-2.0, 13.0],
        capeA: 0.9, capeB: 0.5, bell: 0.8 },
      { name: 'xoay người – cuộn tròn trên không', bodyRot: 0.75, bodyX: 2.6, bodyY: 3.0, hipX: -0.4, hipY: 5.4, torso: -0.5, head: 0.4,
        footN: [1.8, 3.4], footAngN: 0.2, footF: [0.8, 3.0],
        handN: [1.6, 6.2], swordAng: -1.0, handF: [1.0, 6.6],
        capeA: -0.4, capeB: -0.6, bell: 0.4 }
    ]},
    { key: 'wallClimb', label: 'Wall Climb', loop: true, wall: true, frames: [
      { name: 'tay xa vươn lên – chân gần đạp', bodyY: 2.6, hipX: 3.3, hipY: 5.4, torso: -0.1, head: 0.1,
        footN: [4.75, 1.6], footAngN: 0.9, footF: [4.5, 4.4], footAngF: 0.9,
        handF: [5.85, 13.8], handN: [4.9, 9.2], swordAng: -0.25,
        capeA: -0.35, capeB: -0.1, bell: 0.1 },
      { name: 'tay xa bám – kéo người lên', bodyY: 3.2, hipX: 3.3, hipY: 5.6, torso: -0.08, head: 0.08,
        footN: [4.75, 1.2], footAngN: 0.9, footF: [4.5, 3.6], footAngF: 0.9,
        handF: [5.85, 13.0], handN: [4.9, 8.4], swordAng: -0.3,
        capeA: -0.25, capeB: -0.05, bell: 0.05 },
      { name: 'chân xa đẩy – đổi bên', bodyY: 3.6, hipX: 3.3, hipY: 5.7, torso: -0.06, head: 0.06,
        footN: [4.6, 2.8], footAngN: 0.9, footF: [4.6, 2.6], footAngF: 0.9,
        handF: [5.85, 12.4], handN: [5.0, 10.6], swordAng: -0.2,
        capeA: -0.15, capeB: 0.0, bell: -0.05 },
      { name: 'tay gần vươn lên – chân xa đạp', bodyY: 2.6, hipX: 3.3, hipY: 5.4, torso: -0.1, head: 0.1,
        footN: [4.75, 4.4], footAngN: 0.9, footF: [4.5, 1.6], footAngF: 0.9,
        handN: [5.85, 13.8], handF: [4.9, 9.2], swordAng: 0.05,
        capeA: -0.35, capeB: -0.1, bell: 0.1 },
      { name: 'tay gần bám – kéo người lên', bodyY: 3.2, hipX: 3.3, hipY: 5.6, torso: -0.08, head: 0.08,
        footN: [4.75, 3.6], footAngN: 0.9, footF: [4.5, 1.2], footAngF: 0.9,
        handN: [5.85, 13.0], handF: [4.9, 8.4], swordAng: 0.0,
        capeA: -0.25, capeB: -0.05, bell: 0.05 },
      { name: 'chân gần đẩy – đổi bên', bodyY: 3.6, hipX: 3.3, hipY: 5.7, torso: -0.06, head: 0.06,
        footN: [4.6, 2.6], footAngN: 0.9, footF: [4.6, 2.8], footAngF: 0.9,
        handN: [5.85, 12.4], handF: [5.0, 10.6], swordAng: -0.05,
        capeA: -0.15, capeB: 0.0, bell: -0.05 }
    ]},
    { key: 'ladderClimb', label: 'Ladder', loop: true, wall: true, frames: [
      { name: 'tay xa nắm bậc trên – chân gần bước', bodyY: 2.0, hipX: 2.6, hipY: 5.6, torso: 0.0, head: 0.0,
        footN: [4.4, 0.6], footF: [4.3, 3.6], footAngF: 0.2,
        handF: [5.85, 13.6], handN: [5.0, 9.6], swordAng: -0.08,
        capeA: -0.1, capeB: -0.02, bell: 0.0 },
      { name: 'kéo lên – chân xa trụ', bodyY: 2.6, hipX: 2.6, hipY: 5.7, torso: 0.0, head: 0.0,
        footN: [4.4, 1.6], footAngN: 0.1, footF: [4.3, 3.0], footAngF: 0.1,
        handF: [5.85, 13.0], handN: [5.0, 9.0], swordAng: -0.08,
        capeA: -0.08, capeB: 0.0, bell: -0.04 },
      { name: 'đổi tay – thân thẳng', bodyY: 3.0, hipX: 2.6, hipY: 5.75, torso: 0.0, head: 0.0,
        footN: [4.4, 2.4], footAngN: 0.1, footF: [4.3, 2.4], footAngF: 0.1,
        handF: [5.85, 12.4], handN: [5.0, 11.4], swordAng: -0.08,
        capeA: -0.06, capeB: 0.02, bell: -0.06 },
      { name: 'tay gần nắm bậc trên – chân xa bước', bodyY: 2.0, hipX: 2.6, hipY: 5.6, torso: 0.0, head: 0.0,
        footN: [4.4, 3.6], footAngN: 0.2, footF: [4.3, 0.6],
        handN: [5.85, 13.6], handF: [5.0, 9.6], swordAng: -0.08,
        capeA: -0.1, capeB: -0.02, bell: 0.0 },
      { name: 'kéo lên – chân gần trụ', bodyY: 2.6, hipX: 2.6, hipY: 5.7, torso: 0.0, head: 0.0,
        footN: [4.4, 3.0], footAngN: 0.1, footF: [4.3, 1.6], footAngF: 0.1,
        handN: [5.85, 13.0], handF: [5.0, 9.0], swordAng: -0.08,
        capeA: -0.08, capeB: 0.0, bell: -0.04 },
      { name: 'đổi tay – thân thẳng (2)', bodyY: 3.0, hipX: 2.6, hipY: 5.75, torso: 0.0, head: 0.0,
        footN: [4.4, 2.4], footAngN: 0.1, footF: [4.3, 2.4], footAngF: 0.1,
        handN: [5.85, 12.4], handF: [5.0, 11.4], swordAng: -0.08,
        capeA: -0.06, capeB: 0.02, bell: -0.06 }
    ]},
    { key: 'ledgeGrab', label: 'Ledge', loop: false, wall: true, frames: [
      { name: 'chộp mép tường', ledge: [6.5, 15.0], bodyY: 0.6, hipX: 3.0, hipY: 5.6, torso: -0.05, head: 0.12,
        footN: [3.9, 0.9], footAngN: 0.4, footF: [2.4, 0.3], footAngF: -0.3,
        handF: [5.9, 14.6], handN: [5.6, 14.5], swordAng: -0.2,
        capeA: -0.9, capeB: -0.3, bell: -0.3 },
      { name: 'treo người – đung đưa', ledge: [6.5, 15.0], bodyY: 0.5, hipX: 2.6, hipY: 5.6, torso: 0.05, head: 0.18,
        footN: [3.0, 0.4], footAngN: 0.2, footF: [1.6, 0.2], footAngF: -0.2,
        handF: [5.9, 14.7], handN: [5.6, 14.6], swordAng: -0.3,
        capeA: 0.15, capeB: 0.1, bell: 0.25 },
      { name: 'kéo người lên – chân đạp tường', ledge: [6.5, 15.0], bodyY: 2.6, hipX: 3.3, hipY: 5.4, torso: -0.2, head: 0.2,
        footN: [4.75, 1.4], footAngN: 1.0, footF: [3.6, 0.4], footAngF: 0.3,
        handF: [5.9, 12.6], handN: [5.6, 12.5], swordAng: -0.5,
        capeA: -0.3, capeB: -0.1, bell: -0.1 },
      { name: 'chống tay – đẩy ngực qua mép', ledge: [6.5, 15.0], bodyY: 6.5, hipX: 3.3, hipY: 5.2, torso: -1.0, head: 0.75,
        footN: [4.4, 0.4], footAngN: 0.9, footF: [3.2, -0.6], footAngF: 0.4,
        handF: [8.0, 8.9], handN: [8.6, 9.0], swordAng: -1.5,
        capeA: -0.8, capeB: -0.4, bell: -0.6 },
      { name: 'leo qua – co gối lên mép', ledge: [-3.2, 0.0], hipY: 3.75, hipX: -0.2, torso: -0.7, head: 0.5,
        footN: [1.6, 0.5], footF: [-2.6, 0.6], handN: [3.4, 3.6], swordAng: 1.45, handF: [2.6, 0.9],
        capeA: -1.0, capeB: -0.3, bell: 0.2 },
      { name: 'đứng dậy trên mép', ledge: [-3.2, 0.0], hipY: 5.4, hipX: 0.1, torso: -0.1, head: 0.08,
        footN: [1.4, 0.5], footF: [-1.1, 0.5], nSh: 0.6, nEl: 1.0, wrist: -0.4, fSh: -0.05, fEl: 0.45,
        capeA: -0.35, capeB: 0.1, bell: 0.15 }
    ]},
    { key: 'dash', label: 'Dash', loop: false, frames: [
      { name: 'lấy đà – cúi người', hipY: 4.2, hipX: -0.2, torso: -0.75, head: 0.55,
        footN: [1.9, 0.5], footF: [-1.7, 0.5], handN: [-1.6, 6.8], swordAng: -1.5, handF: [-1.8, 7.4],
        capeA: -1.2, capeB: -0.3, bell: -0.4 },
      { name: 'lướt nhanh – thu gọn thân', bodyY: 0.6, hipY: 4.6, hipX: 0.4, torso: -1.15, head: 0.85,
        footN: [1.4, 2.0], footAngN: -0.2, footF: [-1.8, 2.6], footAngF: -0.5, handN: [-1.0, 6.6], swordAng: -1.57, handF: [-0.6, 6.3],
        capeA: -1.57, capeB: 0.0, bell: -1.0 },
      { name: 'lướt – áo choàng bay thẳng', bodyY: 0.6, hipY: 4.6, hipX: 0.4, torso: -1.15, head: 0.85,
        footN: [1.2, 2.2], footAngN: -0.2, footF: [-2.0, 2.4], footAngF: -0.5, handN: [-1.1, 6.5], swordAng: -1.57, handF: [-0.7, 6.2],
        capeA: -1.62, capeB: 0.04, bell: -1.1 },
      { name: 'phanh – hạ chân xuống', hipY: 4.3, hipX: 0.5, torso: -0.5, head: 0.35,
        footN: [2.6, 0.5], footAngN: 0.1, footF: [-1.6, 0.5], handN: [-0.6, 6.4], swordAng: -1.2, handF: [0.6, 6.0],
        capeA: -1.0, capeB: 0.35, bell: 0.4 }
    ]},

    /* ===================== ĐỢT 3: COMBO NHÁT 2, NHÁT 3 + CÁC ĐÒN KHÁC ===================== */
    { key: 'attack2', label: 'Attack 2', loop: false, frames: [
      { name: 'kiếm thấp phía trước (từ nhát 1)', ...A1_END },
      { name: 'hạ kiếm xuống dưới chéo ra sau', hipY: 4.3, hipX: 0.0, torso: -0.35, head: 0.3, footN: [2.4, 0.5], footF: [-1.9, 0.5],
        handN: [1.0, 5.2], swordAng: -0.75, handF: [1.2, 7.6], capeA: -0.5, capeB: -0.1, bell: 0.2 },
      { name: 'dồn lực – kiếm chéo sát đất', hipY: 4.1, hipX: -0.1, torso: -0.42, head: 0.36, footN: [2.5, 0.5], footF: [-2.0, 0.5],
        handN: [1.5, 5.0], swordAng: -0.95, handF: [1.8, 7.2], capeA: -0.6, capeB: -0.15, bell: 0.3, hold: 2 },
      { name: 'vung chéo lên – kiếm quét qua trước', hipY: 4.6, hipX: 0.2, torso: -0.25, head: 0.2, footN: [2.6, 0.5], footF: [-1.8, 0.5],
        handN: [3.8, 7.0], swordAng: 1.3, handF: [-0.8, 7.4], capeA: -0.8, capeB: -0.3, bell: -0.1,
        sm: { a: [-85, -31] } },
      { name: 'chém chéo lên – HIT', hipY: 5.2, hipX: 0.4, torso: 0.05, head: -0.05, footN: [2.6, 0.5], footF: [-1.7, 0.5],
        handN: [3.8, 12.2], swordAng: 2.4, handF: [-2.0, 8.0], capeA: -1.2, capeB: -0.5, bell: -0.4,
        sm: { a: [-30, 39], w: 2.0 }, hit: true, hold: 2 },
      { name: 'theo đà – kiếm vút lên cao', comboWindow: true, hipY: 5.4, hipX: 0.3, torso: 0.15, head: -0.08, footN: [2.5, 0.5], footF: [-1.7, 0.5],
        handN: [2.4, 13.6], swordAng: 2.8, handF: [-2.2, 8.6], capeA: -0.9, capeB: -0.6, bell: -0.5,
        sm: { a: [38, 62], w: 1.4 } },
      { name: 'kiếm trên cao (nối nhát 3)', comboWindow: true, ...A2_END }
    ]},
    { key: 'attack3', label: 'Attack 3', loop: false, frames: [
      { name: 'kiếm trên cao (từ nhát 2)', ...A2_END },
      { name: 'giơ kiếm qua đầu – ngả ra sau', hipY: 5.5, hipX: -0.3, torso: 0.28, head: -0.1, footN: [2.2, 0.5], footF: [-1.8, 0.5],
        handN: [-0.6, 15.0], swordAng: -2.3, handF: [0.0, 14.2], capeA: 0.05, capeB: 0.1, bell: 0.25 },
      { name: 'vươn kiếm ra sau – nén lực tối đa', hipY: 5.2, hipX: -0.45, torso: 0.4, head: -0.15, footN: [2.2, 0.5], footF: [-2.2, 0.5],
        handN: [-1.6, 14.6], swordAng: -1.9, handF: [-1.4, 14.2], capeA: 0.2, capeB: 0.15, bell: 0.35, hold: 3 },
      { name: 'bổ xuống – kiếm qua đỉnh đầu', hipY: 4.9, hipX: 0.0, torso: 0.0, head: 0.05, footN: [2.5, 0.5], footF: [-2.1, 0.5],
        handN: [2.2, 14.0], swordAng: 2.7, handF: [1.9, 13.6], capeA: -0.5, capeB: -0.2, bell: 0.0,
        sm: { a: [70, 155], w: 2.0 } },
      { name: 'bổ thẳng xuống trước mặt – HIT', hipY: 3.6, hipX: 0.5, torso: -0.55, head: 0.4, footN: [2.8, 0.5], footF: [-2.3, 0.5],
        handN: [4.8, 5.4], swordAng: 1.15, handF: [3.6, 5.8], capeA: -1.6, capeB: -0.6, bell: -0.7,
        sm: { a: [-38, 70], w: 2.4 }, hit: true, hold: 3 },
      { name: 'đè nặng – kiếm ghim sát đất', comboWindow: true, hipY: 3.6, hipX: 0.5, torso: -0.6, head: 0.45, footN: [2.8, 0.5], footF: [-2.3, 0.5],
        handN: [4.8, 4.4], swordAng: 1.0, handF: [3.6, 5.0], capeA: -0.7, capeB: -0.4, bell: 0.5 },
      { name: 'rút kiếm lên – thở dốc', hipY: 4.0, hipX: 0.4, torso: -0.42, head: 0.3, footN: [2.7, 0.5], footF: [-2.1, 0.5],
        handN: [4.0, 5.4], swordAng: 1.1, handF: [1.0, 6.4], capeA: -0.5, capeB: 0.1, bell: 0.3 },
      { name: 'đứng dậy – thu kiếm', hipY: 4.6, hipX: 0.2, torso: -0.22, head: 0.18, footN: [2.3, 0.5], footF: [-1.8, 0.5],
        handN: [2.8, 6.4], swordAng: 0.95, handF: [-0.4, 7.0], capeA: -0.35, capeB: 0.1, bell: 0.15 },
      { name: 'thủ thế', ...ATTACK_READY }
    ]},
    { key: 'airAttack', label: 'Air Attack', loop: false, frames: [
      { name: 'lơ lửng – co chân, kéo kiếm ra sau', bodyY: 2.4, hipY: 5.6, torso: 0.12, head: 0.0,
        footN: [1.8, 3.2], footAngN: 0.2, footF: [-0.4, 2.8], footAngF: -0.2,
        handN: [-1.4, 10.4], swordAng: -1.9, handF: [1.6, 9.0], capeA: -1.6, capeB: -0.5, bell: -0.3 },
      { name: 'giơ kiếm qua đầu trên không', bodyY: 2.2, hipY: 5.6, torso: 0.18, head: -0.05,
        footN: [1.9, 3.4], footAngN: 0.2, footF: [-0.2, 3.0], footAngF: -0.2,
        handN: [0.0, 12.2], swordAng: -2.8, handF: [1.4, 10.4], capeA: -1.9, capeB: -0.6, bell: -0.4 },
      { name: 'chém vòng xuống trước – HIT', bodyY: 2.4, hipY: 5.5, torso: -0.3, head: 0.25,
        footN: [2.2, 3.0], footAngN: 0.3, footF: [0.0, 2.6], footAngF: -0.1,
        handN: [4.6, 8.6], swordAng: 1.55, handF: [-2.0, 8.6], capeA: -2.2, capeB: -0.7, bell: -0.6,
        sm: { a: [-2, 55], w: 2.0 }, hit: true, hold: 2 },
      { name: 'theo đà – kiếm chĩa xuống trước', bodyY: 2.4, hipY: 5.5, torso: -0.38, head: 0.3,
        footN: [2.0, 3.0], footAngN: 0.2, footF: [-0.2, 2.6],
        handN: [4.0, 6.6], swordAng: 0.85, handF: [-2.2, 8.0], capeA: -2.0, capeB: -0.5, bell: -0.4,
        sm: { a: [-40, -5], w: 1.4 } },
      { name: 'thu kiếm – vẫn co chân', bodyY: 2.2, hipY: 5.6, torso: -0.2, head: 0.2,
        footN: [1.8, 2.8], footAngN: 0.1, footF: [-0.4, 2.4],
        handN: [2.8, 7.2], swordAng: 0.7, handF: [-1.0, 8.2], capeA: -1.8, capeB: -0.4, bell: -0.2 },
      { name: 'duỗi chân – chuyển sang rơi', bodyY: 1.8, hipY: 5.8, torso: -0.12, head: 0.2,
        footN: [1.2, 1.8], footF: [-0.8, 1.4],
        handN: [2.4, 7.6], swordAng: 0.9, handF: [-1.4, 9.0], capeA: -2.2, capeB: -0.5, bell: -0.5 }
    ]},
    { key: 'downStrike', label: 'Down Strike', loop: false, frames: [
      { name: 'co người trên không – xoay mũi kiếm xuống', bodyY: 3.2, hipY: 5.4, torso: -0.2, head: 0.2,
        footN: [2.0, 3.4], footAngN: 0.2, footF: [-0.4, 3.0], footAngF: -0.2,
        handN: [1.8, 8.8], swordAng: 0.3, handF: [-0.4, 9.0], capeA: -2.0, capeB: -0.5, bell: -0.4 },
      { name: 'đâm thẳng xuống dưới chân – HIT', bodyY: 3.2, hipY: 5.4, torso: -0.28, head: 0.3,
        footN: [1.9, 3.8], footAngN: 0.3, footF: [-0.6, 3.5], footAngF: -0.1,
        handN: [1.2, 6.4], swordAng: 0.0, handF: [0.6, 7.4], capeA: -1.9, capeB: -0.7, bell: -0.6,
        sm: { c: [13.2, 3.0], a: [158, 196], r: [11.6, 12.6] }, hit: true, hold: 2 },
      { name: 'mũi kiếm chạm – nảy bật lên', bodyY: 3.6, hipY: 5.4, torso: -0.22, head: 0.24,
        footN: [1.9, 3.6], footAngN: 0.2, footF: [-0.5, 3.3],
        handN: [1.3, 6.8], swordAng: 0.05, handF: [0.4, 7.8], capeA: -1.2, capeB: -0.3, bell: 0.3 },
      { name: 'bật lên – rút kiếm ngang', bodyY: 3.4, hipY: 5.5, torso: -0.1, head: 0.1,
        footN: [1.6, 2.8], footF: [-0.6, 2.4],
        handN: [2.2, 8.4], swordAng: 0.7, handF: [-0.8, 9.0], capeA: -0.6, capeB: -0.1, bell: 0.5 },
      { name: 'duỗi người – chuẩn bị rơi', bodyY: 2.8, hipY: 5.7, torso: -0.08, head: 0.15,
        footN: [1.3, 1.8], footF: [-0.8, 1.4],
        handN: [2.4, 8.0], swordAng: 1.0, handF: [-1.4, 9.2], capeA: -1.8, capeB: -0.4, bell: -0.3 }
    ]},
    { key: 'upSlash', label: 'Up Slash', loop: false, frames: [
      { name: 'hạ thấp – kiếm chéo sau sát đất', hipY: 4.2, hipX: -0.1, torso: -0.4, head: 0.35, footN: [2.2, 0.5], footF: [-1.9, 0.5],
        handN: [0.4, 5.4], swordAng: -0.9, handF: [1.6, 7.4], capeA: -0.5, capeB: -0.1, bell: 0.2 },
      { name: 'nhún gối – dồn lực hất', hipY: 3.8, hipX: -0.1, torso: -0.5, head: 0.4, footN: [2.3, 0.5], footF: [-2.0, 0.5],
        handN: [0.8, 5.0], swordAng: -1.0, handF: [1.8, 6.8], capeA: -0.6, capeB: -0.15, bell: 0.3, hold: 2 },
      { name: 'hất kiếm lên – kiếm quét qua trước', hipY: 4.8, hipX: 0.2, torso: -0.2, head: 0.15, footN: [2.3, 0.5], footF: [-1.8, 0.5],
        handN: [3.4, 7.6], swordAng: 1.7, handF: [-0.6, 7.6], capeA: -0.9, capeB: -0.3, bell: -0.2,
        sm: { a: [-80, -14] } },
      { name: 'hất thẳng lên cao – HIT', hipY: 5.6, hipX: 0.1, torso: 0.1, head: -0.12, footN: [2.0, 0.5], footF: [-1.6, 0.5],
        handN: [2.2, 13.8], swordAng: 3.0, handF: [-2.0, 8.4], capeA: -1.3, capeB: -0.6, bell: -0.5,
        sm: { a: [-14, 71], w: 2.0 }, hit: true, hold: 2 },
      { name: 'theo đà – kiếm trên đầu', hipY: 5.5, hipX: 0.0, torso: 0.14, head: -0.08, footN: [1.9, 0.5], footF: [-1.6, 0.5],
        handN: [1.0, 14.0], swordAng: -2.95, handF: [-1.8, 9.0], capeA: -0.7, capeB: -0.5, bell: -0.3 },
      { name: 'hạ kiếm – thủ thế', ...ATTACK_READY }
    ]},
    { key: 'parry', label: 'Ngân (Parry)', loop: false, frames: [
      { name: 'nâng kiếm lên chắn', hipY: 4.8, hipX: 0, torso: -0.1, head: 0.1, footN: [2.1, 0.5], footF: [-1.7, 0.5],
        handN: [2.8, 7.8], swordAng: 2.1, handF: [1.6, 8.0], capeA: -0.3, capeB: -0.05, bell: 0.15 },
      { name: 'đỡ thành công – kiếm chéo trước mặt, chuông ngân', hipY: 4.6, hipX: -0.3, torso: 0.08, head: 0.02, footN: [2.0, 0.5], footF: [-2.0, 0.5],
        handN: [3.0, 8.6], swordAng: 2.55, handF: [2.0, 8.4], capeA: 0.2, capeB: 0.15, bell: 0.95,
        sm: { c: [5.6, 12.0], a: [0, 360], r: [1.0, 1.7] }, hold: 2 },
      { name: 'dư chấn – chuông lắc ngược', hipY: 4.7, hipX: -0.4, torso: 0.12, head: 0.0, footN: [2.0, 0.5], footF: [-2.0, 0.5],
        handN: [2.8, 8.4], swordAng: 2.45, handF: [1.8, 8.2], capeA: 0.1, capeB: 0.2, bell: -0.8 },
      { name: 'chuông lắc nhẹ – hạ kiếm', hipY: 4.8, hipX: -0.2, torso: -0.05, head: 0.08, footN: [2.0, 0.5], footF: [-1.8, 0.5],
        handN: [3.2, 7.2], swordAng: 1.6, handF: [0.8, 7.6], capeA: -0.15, capeB: 0.0, bell: 0.45 },
      { name: 'về thủ thế', ...ATTACK_READY, bell: -0.2 }
    ]},
    { key: 'chargeAttack', label: 'Charge', loop: false, frames: [
      { name: 'kéo kiếm ra sau – bắt đầu tụ lực', hipY: 4.4, hipX: -0.3, torso: 0.1, head: 0.1, footN: [2.2, 0.5], footF: [-2.0, 0.5],
        handN: [-1.4, 7.6], swordAng: -1.35, handF: [1.8, 7.8], capeA: -0.2, capeB: 0.0, bell: 0.1 },
      { name: 'tụ lực – rung 1', hipY: 4.1, hipX: -0.55, torso: 0.14, head: 0.06, footN: [2.2, 0.5], footF: [-2.2, 0.5],
        handN: [-1.9, 7.3], swordAng: -1.42, handF: [1.6, 7.6], capeA: -0.35, capeB: 0.05, bell: 0.2, hold: 2 },
      { name: 'tụ lực – rung 2', hipY: 4.2, hipX: -0.1, torso: 0.1, head: 0.12, footN: [2.2, 0.5], footF: [-2.2, 0.5],
        handN: [-1.5, 7.5], swordAng: -1.38, handF: [1.9, 7.8], capeA: -0.15, capeB: -0.1, bell: -0.15, hold: 2 },
      { name: 'tụ lực – rung 3, giữ hơi', hipY: 4.0, hipX: -0.6, torso: 0.15, head: 0.05, footN: [2.2, 0.5], footF: [-2.3, 0.5],
        handN: [-2.0, 7.2], swordAng: -1.44, handF: [1.6, 7.5], capeA: -0.3, capeB: 0.1, bell: 0.25, hold: 3 },
      { name: 'bung lực – lao tới', hipY: 4.3, hipX: 0.6, torso: -0.35, head: 0.28, footN: [3.0, 0.5], footF: [-2.0, 0.5],
        handN: [4.0, 8.4], swordAng: 1.5, handF: [-1.6, 8.0], capeA: -1.3, capeB: -0.5, bell: -0.5,
        sm: { c: [-0.5, 24.5], a: [-112, -72], r: [14.6, 16.4] } },
      { name: 'bung chém – HIT', hipY: 4.0, hipX: 0.8, torso: -0.45, head: 0.36, footN: [3.2, 0.5], footF: [-2.1, 0.5],
        handN: [5.6, 8.0], swordAng: 1.55, handF: [-2.4, 7.4], capeA: -1.6, capeB: -0.6, bell: -0.6,
        sm: { c: [3.5, 24.5], a: [-121, -60], r: [15.0, 17.2] }, hit: true, hold: 2 },
      { name: 'theo đà – trượt chân', hipY: 4.2, hipX: 0.7, torso: -0.4, head: 0.3, footN: [3.1, 0.5], footF: [-2.0, 0.5],
        handN: [4.6, 6.6], swordAng: 1.15, handF: [-2.0, 7.2], capeA: -1.1, capeB: -0.3, bell: -0.2 },
      { name: 'thu kiếm – thủ thế', ...ATTACK_READY }
    ]},
    { key: 'echoCast', label: 'Echo Cast', loop: false, frames: [
      { name: 'giơ tay xa lên cao', hipY: 5.4, torso: 0.04, head: -0.06, footN: [1.8, 0.5], footF: [-1.4, 0.5],
        handF: [-0.4, 15.0], handN: [2.6, 7.0], swordAng: 1.0, capeA: -0.2, capeB: -0.05, bell: 0.0 },
      { name: 'gõ nhẹ chuông – ghi tiếng vọng', hipY: 5.3, torso: 0.06, head: 0.05, footN: [1.8, 0.5], footF: [-1.4, 0.5],
        handF: [-2.9, 10.6], handN: [2.6, 7.0], swordAng: 1.0, capeA: -0.25, capeB: -0.05, bell: 0.45,
        sm: { c: [-3.8, 9.6], a: [0, 360], r: [2.4, 2.9], z: -3.5 }, hold: 2 },
      { name: 'tiếng vọng lan ra', hipY: 5.35, torso: 0.04, head: 0.08, footN: [1.8, 0.5], footF: [-1.4, 0.5],
        handF: [-2.0, 11.6], handN: [2.6, 7.0], swordAng: 1.0, capeA: -0.15, capeB: -0.1, bell: -0.35,
        sm: { c: [-3.8, 9.6], a: [0, 360], r: [4.2, 4.7], z: -3.5 }, hold: 2 },
      { name: 'hạ tay – về thủ thế', hipY: 5.2, torso: -0.05, head: 0.08, footN: [1.8, 0.5], footF: [-1.4, 0.5],
        handF: [-0.6, 7.0], handN: [2.6, 7.0], swordAng: 1.0, capeA: -0.2, capeB: 0.0, bell: 0.15 }
    ]},
    { key: 'heal', label: 'Heal', loop: false, frames: [
      { name: 'lùi chân – hạ người', hipY: 4.4, hipX: -0.2, torso: -0.15, head: 0.1, footN: [1.8, 0.5], footF: [-2.3, 0.5],
        handN: [2.6, 6.2], swordAng: 0.4, handF: [-0.6, 7.4], capeA: -0.3, capeB: 0.0, bell: 0.1 },
      { name: 'quỳ một gối – chống kiếm', hipY: 3.6, hipX: -0.3, torso: -0.2, head: -0.2, footN: [1.8, 0.5], footF: [-2.9, 0.9],
        handN: [3.0, 6.6], swordAng: 0.15, handF: [-2.2, 8.4], capeA: -0.2, capeB: 0.1, bell: 0.15 },
      { name: 'ôm chuông – hồi máu', hipY: 3.5, hipX: -0.3, torso: -0.28, head: -0.35, footN: [1.8, 0.5], footF: [-2.9, 0.9],
        handN: [3.0, 6.5], swordAng: 0.15, handF: [-2.0, 8.6], capeA: -0.1, capeB: 0.15, bell: 0.2,
        sm: { c: [-2.4, 8.8], a: [0, 360], r: [2.3, 2.8], z: -3.5 }, hold: 3 },
      { name: 'ôm chuông – ánh sáng lan', hipY: 3.55, hipX: -0.3, torso: -0.25, head: -0.3, footN: [1.8, 0.5], footF: [-2.9, 0.9],
        handN: [3.0, 6.55], swordAng: 0.15, handF: [-2.0, 8.7], capeA: -0.15, capeB: 0.1, bell: 0.1,
        sm: { c: [-2.4, 8.8], a: [0, 360], r: [3.6, 4.1], z: -3.5 }, hold: 2 },
      { name: 'chống kiếm đứng dậy', hipY: 4.3, hipX: -0.1, torso: -0.2, head: 0.1, footN: [1.8, 0.5], footF: [-2.0, 0.5],
        handN: [3.0, 6.6], swordAng: 0.4, handF: [-1.0, 7.2], capeA: -0.3, capeB: 0.05, bell: 0.1 },
      { name: 'đứng thẳng – hồi phục', hipY: 5.5, hipX: 0, torso: -0.05, head: 0.04, footN: [1.4, 0.5], footF: [-1.1, 0.5],
        nSh: 0.55, nEl: 0.9, wrist: -0.3, fSh: -0.1, fEl: 0.4, capeA: -0.15, capeB: -0.05, bell: 0.0 }
    ]}
  ];

  const WALL_X = 6.5;   // đường tường tưởng tượng (đơn vị pixel so với pivot), chỉ vẽ trong bản xem trước

  // IK 2 xương cho tay: đặt tâm bàn tay vào điểm đích, tính góc vai / khuỷu (khuỷu gập xuống – ra sau)
  function solveArm(p, which) {
    const near = which === 'N';
    const target = near ? p.handN : p.handF;
    if (!target) return;
    const sx = near ? 0.6 : -0.2, sy = 5.6;
    const l1 = near ? 2.6 : 2.4, l2 = near ? 2.3 : 2.2;
    const c = Math.cos(p.torso), s = Math.sin(p.torso);
    const shx = p.hipX + sx * c - sy * s, shy = p.hipY + sx * s + sy * c;
    const dx = target[0] - shx, dy = target[1] - shy;
    const d = clamp(Math.hypot(dx, dy), 0.5, l1 + l2 - 0.001);
    const phi = Math.atan2(dx, -dy);
    const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const b = Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
    // tay vươn lên cao hơn vai: khuỷu gập xuống – ra sau (không đâm vào tường)
    const up = dy > 0;
    const sh = (up ? phi + a : phi - a) - p.torso, el = up ? -(Math.PI - b) : Math.PI - b;
    if (near) { p.nSh = sh; p.nEl = el; } else { p.fSh = sh; p.fEl = el; }
  }
  function resolvePose(p) {
    solveArm(p, 'N');
    solveArm(p, 'F');
    if (p.swordAng !== null && p.swordAng !== undefined) p.wrist = p.swordAng - (p.torso + p.nSh + p.nEl);
    // Vệt chém kiểu mới (sm): khai báo theo hệ thân, đổi sang hệ torso để gắn vào rig.smear
    if (p.sm) {
      const c = Math.cos(p.torso), s = Math.sin(p.torso);
      const shx = p.hipX + 0.6 * c - 5.6 * s, shy = p.hipY + 0.6 * s + 5.6 * c;   // vai gần
      const cen = p.sm.c || [shx, shy];
      let r = p.sm.r;
      if (!r) {
        const th = p.swordAng, h = p.handN;
        const d = Math.hypot(h[0] + 6.0 * Math.sin(th) - cen[0], h[1] - 6.0 * Math.cos(th) - cen[1]);
        r = [d + 0.5 - (p.sm.w || 1.8), d + 0.5];
      }
      const vx = cen[0] - p.hipX, vy = cen[1] - p.hipY;
      p.smearPos = [vx * c + vy * s, -vx * s + vy * c, p.sm.z ?? 2.1];
      const td = p.torso * 180 / Math.PI;
      p.smear = [p.sm.a[0] - td, p.sm.a[1] - td, r[0], r[1]];
    }
    return p;
  }

  ANIMS.forEach(a => { a.frames = a.frames.map(f => resolvePose({ ...BASE, ...f })); });

  // Áp một tư thế lên rig
  function applyPose(p) {
    rig.body.rotation.z = p.bodyRot;
    rig.body.position.set(p.bodyX, p.bodyY, 0);
    rig.hips.position.set(p.hipX, p.hipY, 0);
    rig.torso.rotation.z = p.torso;
    rig.head.rotation.z = p.head;
    rig.capeA.rotation.z = p.capeA;
    rig.capeB.rotation.z = p.capeB;
    rig.bell.rotation.z = p.bell;
    rig.nSh.rotation.z = p.nSh;
    rig.nEl.rotation.z = p.nEl;
    rig.wrist.rotation.z = p.wrist;
    rig.fSh.rotation.z = p.fSh;
    rig.fEl.rotation.z = p.fEl;
    solveLeg(rig.legN, p.hipX, p.hipY, p.footN, p.footAngN);
    solveLeg(rig.legF, p.hipX, p.hipY, p.footF, p.footAngF);

    if (p.smear) {
      const [a0, a1, rIn, rOut] = p.smear;
      const t0 = THREE.MathUtils.degToRad(a0), t1 = THREE.MathUtils.degToRad(a1);
      rig.smear.geometry.dispose();
      rig.smear.geometry = new THREE.RingGeometry(rIn, rOut, 20, 1, t0, t1 - t0);
      const sp = p.smearPos || [0.6, 5.6, 2.1];
      rig.smear.position.set(sp[0], sp[1], sp[2]);
      rig.smear.visible = true;
    } else {
      rig.smear.visible = false;
    }
  }

  /* =====================================================================
     PIXEL RENDER: render 96×96 → lấy mẫu nearest xuống 24×24,
     khóa bảng màu + viền ngoài 1px (như Sprite Lab, luôn bật).
     ===================================================================== */
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
      const i = ((y * SS + off) * RENDER + (x * SS + off)) * 4;
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

  /* =====================================================================
     KIỂM TRA MÉP Ô + MẶT ĐẤT: đo tọa độ thế giới mọi đỉnh mesh đang hiện.
     Cách mép ≥ 1 px (chừa chỗ viền), không lún dưới mặt đất (y = 0) quá 0,3 px.
     ===================================================================== */
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
    if (b.x0 < VIEW.left + 1) loi.push('sát mép trái');
    if (b.x1 > VIEW.right - 1) loi.push('sát mép phải');
    if (b.y1 > VIEW.top - 1) loi.push('sát mép trên');
    if (b.y0 < -0.3) loi.push('lún đất ' + (-b.y0).toFixed(2) + ' px');
    return loi;
  }

  /* =====================================================================
     DỰNG ATLAS
     ===================================================================== */
  const cols = Math.max(...ANIMS.map(a => a.frames.length));
  const canvas = document.createElement('canvas');
  canvas.width = cols * CELL; canvas.height = ANIMS.length * CELL;
  const ctx = canvas.getContext('2d');
  const anims = {}, kiemTra = [];
  ANIMS.forEach((a, r) => {
    anims[a.key] = { row: r, loop: a.loop, label: a.label, frames: a.frames.map((f, i) => {
      ctx.putImageData(captureFrame(f), i * CELL, r * CELL);
      const loi = measure();
      if (loi.length) kiemTra.push({ anim: a.key, frame: i, loi });
      const fr = { x: i * CELL, y: r * CELL, hold: f.hold, hit: !!f.hit, comboWindow: !!f.comboWindow, name: f.name };
      if (f.ledge) fr.ledge = { x: +(f.ledge[0] - VIEW.left).toFixed(2), y: +(VIEW.top - f.ledge[1]).toFixed(2) };
      return fr;
    }) };
  });

  // Giải phóng WebGL (iPhone giới hạn số context)
  scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  matCache.forEach(m => m.dispose());
  renderer.dispose();
  if (renderer.forceContextLoss) renderer.forceContextLoss();

  return {
    canvas, w: CELL, h: CELL, cols, rows: ANIMS.length, fps: 12,
    pivot: { x: PIVOT_PX.x, y: PIVOT_PX.y },
    combo: ['attack', 'attack2', 'attack3'],
    anims, kiemTra
  };
};
})(typeof window !== 'undefined' ? window : this);
