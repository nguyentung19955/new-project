/* =====================================================================
   lam3d-anim.js — 26 hoạt cảnh của Lam 3D (dùng với lam3d-core.js).
   Mỗi khung là một TƯ THẾ CHÍNH (key pose); giữa các khung nội suy Catmull-Rom (bậc 3), thân/đầu trễ sau hông.
   Kênh (độ / đơn vị, Lam cao 1.6; nhân vật nhìn sang PHẢI = +x; mặt đất y = 0):
     hx,hy  vị trí hông            p,s,c,n  nghiêng hông/lưng/ngực/đầu (+ = cúi tới)   tw  vặn thân   rr  lăn cả người
     aN,aF  tay gần (cầm kiếm)/tay xa: [vai (0 = buông, 90 = đưa ngang trước), khuỷu (+ gập tới), dang ngang]
     ky     vung ngang tay kiếm quanh trục đứng (chém ngang)    k  góc lưỡi kiếm tuyệt đối (0 = trước, 90 = lên)
     kb,kw  1 = dùng góc cổ tay kw thay k (lưỡi nối dài cánh tay khi vung ngang)
     fN,fF  bàn chân gần/xa (IK): [x, y cổ chân, ngón (+ = hếch)]     hN,hF  tay bám (IK): [x, y]
     sq     squash/stretch (1 = thường)     v  vận tốc nhân vật [vx, vy] (đ/s) → gió thổi áo choàng, chuông
   Cờ khung: H = hit, C = comboWindow (giữ y như bản cũ). sm = phần vệt chém, fx = hiệu ứng pixel.
   ===================================================================== */
(function (root) {
'use strict';
var L3 = root.LAM3D = root.LAM3D || {};
var META = {
  idle: { loop: true, label: "Idle", f: [["đứng thẳng",2],["thở ra",2],["hạ người – thấp nhất",3],["vạt áo phất",2],["hít vào",2],["ưỡn ngực – cao nhất",3]] },
  run: { loop: true, label: "Run", f: [["chân trước chạm đất",1],["nhún – dồn lực",1],["chân lướt qua",1],["đạp đất – bay",1],["chân kia chạm đất",1],["nhún – dồn lực (2)",1],["chân lướt qua (2)",1],["đạp đất – bay (2)",1]] },
  jump: { loop: false, label: "Jump", f: [["lấy đà – nén sâu",2],["bật lên – duỗi người",1],["lên 1",1],["lên 2",1],["đỉnh nhảy – lơ lửng",2],["chuyển sang rơi",1]] },
  fall: { loop: true, label: "Fall", f: [["rơi – áo bay lên",1],["rơi – vạt áo quất",1],["rơi – dang tay giữ thăng bằng",1]] },
  attack: { loop: false, label: "Attack 1", f: [["thủ thế",1],["kéo kiếm ra sau – vặn vai",1],["nén người – kiếm sau lưng (lấy đà)",3],["vung – kiếm lướt qua ngực",1],["chém duỗi hết tầm – HIT",3,"H"],["theo đà – thân xoay theo kiếm",1,"C"],["hạ kiếm – sẵn sàng nối",2,"C"],["thu kiếm – kiếm thấp phía trước",1],["kiếm thấp phía trước (nối nhát 2)",1]] },
  dodge: { loop: false, label: "Dodge", f: [["nhún thấp",2],["phóng người",1],["lướt thấp",1],["trượt chân",1],["phanh lại",1],["đứng vững",1]] },
  hit: { loop: false, label: "Hit", f: [["trúng đòn",2],["bật ngửa",2],["loạng choạng",1],["hồi lại",1]] },
  death: { loop: false, label: "Death", f: [["trúng đòn chí mạng",2],["khuỵu gối",1],["gục đầu",1],["chúi người",1],["đổ xuống",1],["sắp chạm đất",1],["đập xuống – nảy",2],["nằm im",4]] },
  land: { loop: false, label: "Land", f: [["chạm đất – nén người mạnh",1],["nén thấp nhất – hấp lực",2],["bật lên – vươn người",1],["đứng vững",1]] },
  crouch: { loop: false, label: "Crouch", f: [["hạ người xuống",1],["ngồi xổm – kiếm thủ trước",2]] },
  slide: { loop: false, label: "Slide", f: [["lao người – bắt đầu trượt",1],["trượt thấp sát đất",1],["trượt dài – áo kéo phía sau",2],["giảm tốc – chống dậy",1]] },
  wallSlide: { loop: true, label: "Wall Slide", f: [["áp tường – trượt xuống",1],["trượt – tay miết tường",1],["trượt – áo choàng phần phật",1]] },
  wallJump: { loop: false, label: "Wall Jump", f: [["co người – hai chân dồn vào tường",2],["đạp tường – bật ra sau",1],["bay ngược – co chân",1],["xoay người – cuộn tròn trên không",1]] },
  wallClimb: { loop: true, label: "Wall Climb", f: [["tay xa vươn lên – chân gần đạp",1],["tay xa bám – kéo người lên",1],["chân xa đẩy – đổi bên",1],["tay gần vươn lên – chân xa đạp",1],["tay gần bám – kéo người lên",1],["chân gần đẩy – đổi bên",1]] },
  ladderClimb: { loop: true, label: "Ladder", f: [["tay xa nắm bậc trên – chân gần bước",1],["kéo lên – chân xa trụ",1],["đổi tay – thân thẳng",1],["tay gần nắm bậc trên – chân xa bước",1],["kéo lên – chân gần trụ",1],["đổi tay – thân thẳng (2)",1]] },
  ledgeGrab: { loop: false, label: "Ledge", f: [["chộp mép tường",1],["treo người – đung đưa",2],["kéo người lên – chân đạp tường",1],["chống tay – đẩy ngực qua mép",1],["leo qua – co gối lên mép",1],["đứng dậy trên mép",1]] },
  dash: { loop: false, label: "Dash", f: [["lấy đà – cúi người",2],["lướt nhanh – thu gọn thân",1],["lướt – áo choàng bay thẳng",1],["phanh – hạ chân xuống",1]] },
  attack2: { loop: false, label: "Attack 2", f: [["kiếm thấp phía trước (từ nhát 1)",1],["hạ kiếm xuống dưới chéo ra sau",1],["nén thấp – kiếm chéo sát đất (lấy đà)",3],["vung chéo lên – kiếm quét qua trước",1],["chém chéo lên, nhón chân – HIT",3,"H"],["theo đà – kiếm vút lên cao",1,"C"],["kiếm trên cao (nối nhát 3)",2,"C"]] },
  attack3: { loop: false, label: "Attack 3", f: [["kiếm trên cao (từ nhát 2)",1],["giơ kiếm qua đầu – ngả ra sau",1],["vươn kiếm ra sau – nén lực tối đa",3],["bổ xuống – kiếm qua đỉnh đầu",1],["bổ xuống – kiếm ngang trước mặt",1],["bổ thẳng xuống trước mặt – HIT",3,"H"],["đè nặng – kiếm ghim sát đất",2,"C"],["rút kiếm lên – thở dốc",1],["đứng dậy – thu kiếm",1],["thủ thế",1]] },
  airAttack: { loop: false, label: "Air Attack", f: [["lơ lửng – co chân, kéo kiếm ra sau",1],["giơ kiếm qua đầu trên không",2],["chém vòng xuống trước – HIT",3,"H"],["theo đà – kiếm chĩa xuống trước",1],["thu kiếm – vẫn co chân",1],["duỗi chân – chuyển sang rơi",1]] },
  downStrike: { loop: false, label: "Down Strike", f: [["co người trên không – xoay mũi kiếm xuống",2],["đâm thẳng xuống dưới chân – HIT",3,"H"],["mũi kiếm chạm – nảy bật lên",1],["bật lên – rút kiếm ngang",1],["duỗi người – chuẩn bị rơi",1]] },
  upSlash: { loop: false, label: "Up Slash", f: [["hạ thấp – kiếm chéo sau sát đất",1],["nhún gối – dồn lực hất",3],["hất kiếm lên – kiếm quét qua trước",1],["hất thẳng lên cao – HIT",3,"H"],["theo đà – kiếm trên đầu",1],["hạ kiếm – thủ thế",1]] },
  parry: { loop: false, label: "Ngân (Parry)", f: [["nâng kiếm lên chắn",1],["đỡ thành công – kiếm chéo trước mặt, chuông ngân",3],["dư chấn – chuông lắc ngược",1],["chuông lắc nhẹ – hạ kiếm",1],["về thủ thế",1]] },
  chargeAttack: { loop: false, label: "Charge", f: [["kéo kiếm ra sau – bắt đầu tụ lực",1],["tụ lực – rung 1",2],["tụ lực – rung 2",2],["tụ lực – rung 3, giữ hơi",4],["bung lực – lao tới",1],["bung chém – HIT",3,"H"],["theo đà – trượt chân",1],["thu kiếm – thủ thế",1]] },
  echoCast: { loop: false, label: "Echo Cast", f: [["giơ tay xa lên cao",2],["gõ nhẹ chuông – ghi tiếng vọng",3],["tiếng vọng lan ra",2],["hạ tay – về thủ thế",1]] },
  heal: { loop: false, label: "Heal", f: [["lùi chân – hạ người",1],["quỳ một gối – chống kiếm",1],["ôm chuông – hồi máu",3],["ôm chuông – ánh sáng lan",2],["chống kiếm đứng dậy",1],["đứng thẳng – hồi phục",1]] },
};
L3.THU_TU = Object.keys(META);
L3.COMBO = ['attack', 'attack2', 'attack3'];

/* ---------------- TƯ THẾ CHÍNH ---------------- */
var G = 0.07;   // cổ chân khi chạm đất
var K = {};
K.idle = { keys: [
  { hy: 0.485, p: 8, c: 2, n: -4, aN: [24, 52], aF: [-12, 24, 6], k: 24, sq: 1.0 },
  { hy: 0.475, p: 9, c: 0, n: -2, aN: [22, 50], aF: [-10, 22, 6], k: 21, sq: 0.99 },
  { hy: 0.462, p: 11, c: -2, n: 1, aN: [19, 47], aF: [-7, 19, 7], k: 18, sq: 0.975 },
  { hy: 0.47, p: 10, c: 0, n: -1, aN: [21, 49], aF: [-9, 21, 6], k: 20, sq: 0.985 },
  { hy: 0.488, p: 8, c: 3, n: -5, aN: [25, 53], aF: [-13, 25, 6], k: 25, sq: 1.005 },
  { hy: 0.498, p: 6, c: 5, n: -7, aN: [27, 55], aF: [-15, 27, 6], k: 28, sq: 1.02 }
] };
K.run = { v: [3.4, 0], keys: [
  { hx: 0.02, hy: 0.46, p: 18, s: 7, c: 4, n: -12, tw: -10, fN: [0.27, G, 14], fF: [-0.24, 0.17, -45], aN: [-38, 72], aF: [62, 78, 4], k: -18, sq: 0.98 },
  { hx: 0.0, hy: 0.395, p: 23, s: 9, tw: -5, fN: [0.08, G, 0], fF: [-0.18, 0.31, -65], aN: [-16, 66], aF: [34, 72, 4], k: -6, sq: 0.93 },
  { hx: 0.0, hy: 0.47, p: 19, tw: 2, fN: [-0.08, G, -8], fF: [0.05, 0.25, -25], aN: [12, 60], aF: [0, 60, 4], k: 8, sq: 1.0 },
  { hx: 0.02, hy: 0.545, p: 15, tw: 7, fN: [-0.27, 0.16, -50], fF: [0.22, 0.18, 0], aN: [46, 60], aF: [-32, 64, 4], k: 26, sq: 1.05 },
  { hx: 0.02, hy: 0.46, p: 18, tw: 10, fF: [0.27, G, 14], fN: [-0.24, 0.17, -45], aN: [60, 62], aF: [-38, 68, 4], k: 34, sq: 0.98 },
  { hx: 0.0, hy: 0.395, p: 23, tw: 5, fF: [0.08, G, 0], fN: [-0.18, 0.31, -65], aN: [34, 62], aF: [-16, 66, 4], k: 20, sq: 0.93 },
  { hx: 0.0, hy: 0.47, p: 19, tw: -2, fF: [-0.08, G, -8], fN: [0.05, 0.25, -25], aN: [6, 64], aF: [12, 62, 4], k: 2, sq: 1.0 },
  { hx: 0.02, hy: 0.545, p: 15, tw: -7, fF: [-0.27, 0.16, -50], fN: [0.22, 0.18, 0], aN: [-26, 70], aF: [46, 72, 4], k: -12, sq: 1.05 }
] };
K.jump = { keys: [
  { hy: 0.34, p: 28, s: 12, c: 6, n: 0, fN: [0.11, G, 0], fF: [-0.11, G, -10], aN: [-45, 45], aF: [-60, 30, 8], k: 150, sq: 0.88, v: [0, 0] },
  { hy: 0.585, p: 0, s: -5, c: -5, n: -16, fN: [0.03, 0.12, -50], fF: [-0.09, 0.15, -55], aN: [-35, 20], aF: [150, 18, 12], k: -120, sq: 1.06, v: [0, 6], de: 3 },
  { hy: 0.58, p: 6, s: 0, c: 0, n: -10, fN: [0.13, 0.30, -10], fF: [-0.03, 0.24, -35], aN: [10, 40], aF: [96, 45, 12], k: -40, sq: 1.04, v: [0, 4] },
  { hy: 0.58, p: 10, n: -6, fN: [0.15, 0.37, -5], fF: [0.0, 0.33, -25], aN: [35, 45], aF: [70, 45, 14], k: -12, sq: 1.0, v: [0, 2] },
  { hy: 0.58, p: 11, n: -3, fN: [0.11, 0.35, 0], fF: [-0.03, 0.31, -20], aN: [45, 40, 10], aF: [64, 40, 18], k: -4, sq: 0.98, v: [0, 0.2] },
  { hy: 0.56, p: 6, n: -2, fN: [0.07, 0.22, -15], fF: [-0.10, 0.20, -30], aN: [62, 30, 22], aF: [88, 25, 26], k: 8, sq: 1.02, v: [0, -2.5] }
] };
K.fall = { v: [0, -5.5], keys: [
  { hy: 0.56, p: 4, s: -2, n: -2, fN: [0.08, 0.15, -20], fF: [-0.11, 0.19, -35], aN: [75, 25, 25], aF: [105, 20, 30], k: 35 },
  { hy: 0.555, p: 6, n: 0, fN: [0.06, 0.13, -25], fF: [-0.09, 0.21, -30], aN: [80, 20, 30], aF: [112, 15, 34], k: 30 },
  { hy: 0.56, p: 5, n: -3, fN: [0.09, 0.16, -18], fF: [-0.12, 0.17, -38], aN: [72, 28, 28], aF: [100, 22, 32], k: 38 }
] };
K.land = { keys: [
  { hy: 0.35, p: 26, s: 12, c: 6, n: 2, fN: [0.13, G, 0], fF: [-0.13, G, -10], aN: [50, 30, 15], aF: [36, 20, 20], k: 12, sq: 0.88, v: [0, -1] },
  { hy: 0.30, p: 32, s: 15, c: 8, n: 8, aN: [36, 35, 10], aF: [20, 25, 15], k: 4, sq: 0.86, v: [0, 0] },
  { hy: 0.505, p: 4, s: 0, c: -2, n: -10, aN: [30, 46], aF: [-16, 26, 8], k: 30, sq: 1.05, fN: [0.10, G, 0], fF: [-0.09, G, 0] },
  { hy: 0.48, p: 9, s: 4, c: 2, n: -4, aN: [25, 52], aF: [-12, 24, 6], k: 24, sq: 1.0 }
] };
K.attack = { keys: [
  { hy: 0.48, p: 10, aN: [30, 55], k: 25, fN: [0.10, G, 0], fF: [-0.10, G, 0] },
  { hy: 0.46, p: 8, tw: -16, aN: [-24, 66], k: 125, aF: [32, 30, 10], fN: [0.12, G, 0], fF: [-0.13, G, 0], n: -6, sq: 0.98 },
  { hx: -0.04, hy: 0.42, p: 6, s: 2, tw: -30, aN: [-66, 30], k: 180, aF: [50, 35, 14], n: -9, fN: [0.15, G, 0], fF: [-0.16, G, -5], sq: 0.94 },
  { hx: 0.02, hy: 0.45, p: 12, tw: -4, aN: [92, 14], ky: -15, kb: 1, kw: -70, aF: [-12, 35, 12], n: -5, fN: [0.20, G, 0], fF: [-0.14, G, -10], sm: 0.9, de: 3 },
  { hx: 0.08, hy: 0.44, p: 20, s: 7, tw: 16, aN: [96, 0], ky: 38, kb: 1, kw: -90, aF: [-55, 30, 16], n: -9, fN: [0.28, G, 0], fF: [-0.16, 0.08, -30], sq: 1.03, de: 2, sm: 1.7 },
  { hx: 0.08, hy: 0.44, p: 22, tw: 22, aN: [88, 8], ky: 95, kb: 1, kw: -84, aF: [-58, 35, 16], n: -6 },
  { hx: 0.05, hy: 0.45, p: 16, tw: 9, aN: [55, 30], ky: 45, kb: 0.3, k: -25, aF: [-30, 30, 12] },
  { hx: 0.02, hy: 0.47, p: 12, tw: 2, aN: [38, 42], ky: 10, kb: 0, k: -25, aF: [-18, 26, 8], fN: [0.16, G, 0], fF: [-0.12, G, 0] },
  { hx: 0.0, hy: 0.48, p: 10, tw: 0, aN: [35, 35], k: -28, aF: [-14, 25, 6] }
] };
K.attack2 = { keys: [
  { hy: 0.48, p: 10, aN: [35, 35], k: 332, fN: [0.14, G, 0], fF: [-0.11, G, 0] },
  { hy: 0.43, p: 19, tw: -14, aN: [-30, 18], k: 238, aF: [20, 30, 10], fN: [0.15, G, 0], fF: [-0.12, G, -5], sq: 0.97 },
  { hx: -0.03, hy: 0.36, p: 30, s: 11, tw: -28, aN: [-58, 8], k: 212, aF: [44, 30, 14], n: 5, sq: 0.92, fN: [0.18, G, 0], fF: [-0.14, G, -15] },
  { hx: 0.02, hy: 0.45, p: 14, s: 4, tw: -4, aN: [35, 8], k: 302, aF: [-10, 30, 12], n: -4, sq: 1.0, sm: 0.7, de: 2 },
  { hx: 0.06, hy: 0.55, p: -2, s: -8, c: -7, tw: 14, aN: [128, 4], k: 402, aF: [-50, 25, 18], n: -16, sq: 1.08, fN: [0.21, 0.09, -20], fF: [-0.13, 0.12, -40], de: 2 },
  { hx: 0.05, hy: 0.54, p: -4, s: -9, tw: 18, aN: [166, 20], k: 450, aF: [-44, 30, 16], n: -18, sq: 1.04 },
  { hx: 0.03, hy: 0.50, p: 2, s: -4, tw: 6, aN: [160, 32], k: 462, aF: [-25, 30, 12], n: -10, sq: 1.0, fN: [0.20, G, 0], fF: [-0.12, G, -10] }
] };
K.attack3 = { keys: [
  { hy: 0.50, p: 2, s: -4, aN: [160, 32], k: 100, aF: [-25, 30, 12], n: -10, fN: [0.14, G, 0], fF: [-0.12, G, 0] },
  { hx: -0.02, hy: 0.51, p: -8, s: -8, c: -6, aN: [176, 60], k: 150, aF: [150, 40, 14], n: -16, sq: 1.03, fN: [0.13, G, 0], fF: [-0.14, G, -10] },
  { hx: -0.05, hy: 0.50, p: -16, s: -11, c: -8, aN: [188, 92], k: 208, aF: [168, 72, 14], n: -19, sq: 1.06, fN: [0.12, G, 10], fF: [-0.17, G, -15] },
  { hx: 0.0, hy: 0.48, p: 8, s: 4, c: 2, aN: [150, 18], k: 100, aF: [110, 40, 12], n: -6, sq: 1.0, sm: 0.6, de: 3 },
  { hx: 0.04, hy: 0.42, p: 18, s: 6, c: 3, aN: [92, 4], k: 22, aF: [50, 35, 14], n: -6, sq: 0.97, fN: [0.22, G, 0], fF: [-0.18, G, -15], sm: 0.8, de: 2 },
  { hx: 0.07, hy: 0.35, p: 26, s: 9, c: 5, aN: [38, 0], k: -52, aF: [8, 30, 14], n: -4, sq: 0.88, fN: [0.28, G, 0], fF: [-0.21, G, -25], de: 3 },
  { hx: 0.07, hy: 0.32, p: 29, s: 10, c: 5, aN: [28, 4], k: -68, aF: [0, 35, 14], n: 1, sq: 0.92 },
  { hx: 0.04, hy: 0.40, p: 20, s: 8, c: 4, aN: [25, 30], k: -40, aF: [-10, 30, 10], n: -2, sq: 0.97 },
  { hx: 0.02, hy: 0.45, p: 14, s: 6, c: 3, aN: [36, 44], k: -18, aF: [-5, 26, 8], n: -2, sq: 1.0, fN: [0.14, G, 0], fF: [-0.12, G, 0] },
  { hx: 0.0, hy: 0.48, p: 10, s: 4, c: 2, aN: [28, 52], k: 22, aF: [-12, 24, 6], n: -4, fN: [0.10, G, 0], fF: [-0.09, G, 0] }
] };
K.airAttack = { v: [0, 0.5], keys: [
  { hy: 0.58, p: 10, aN: [-20, 60], k: 165, aF: [40, 40, 14], fN: [0.11, 0.32, -10], fF: [-0.02, 0.28, -25], n: -4 },
  { hy: 0.58, p: -4, s: -6, aN: [172, 50], k: 140, aF: [80, 40, 14], fN: [0.10, 0.34, -10], fF: [-0.04, 0.30, -25], n: -12, sq: 1.03 },
  { hy: 0.57, p: 22, s: 10, aN: [82, 0], k: -30, aF: [-30, 30, 16], fN: [0.13, 0.30, 0], fF: [0.0, 0.26, -20], n: 0, sq: 0.97, de: 3 },
  { hy: 0.57, p: 26, s: 12, aN: [55, 10], k: -62, aF: [-40, 32, 16], n: 4, sq: 1.0 },
  { hy: 0.57, p: 14, s: 6, aN: [42, 42], k: -20, aF: [-10, 30, 12], n: -2, fN: [0.11, 0.30, -10], fF: [-0.02, 0.27, -25] },
  { hy: 0.56, p: 6, s: 2, aN: [55, 40, 15], k: 20, aF: [70, 25, 22], n: -2, fN: [0.07, 0.20, -18], fF: [-0.10, 0.18, -30], v: [0, -2] }
] };
K.downStrike = { keys: [
  { hy: 0.60, p: 8, s: 4, aN: [12, 105], k: -90, aF: [30, 90, 10], fN: [0.12, 0.36, -10], fF: [-0.03, 0.31, -25], n: 2, v: [0, 1] },
  { hy: 0.62, p: 0, s: 0, c: 0, aN: [6, 12], k: -90, aF: [10, 60, 18], fN: [0.04, 0.22, -55], fF: [-0.08, 0.25, -55], n: 6, sq: 1.07, v: [0, -7], de: 3 },
  { hy: 0.57, p: 6, s: 2, aN: [12, 40], k: -78, aF: [50, 40, 22], fN: [0.10, 0.30, -10], fF: [-0.04, 0.27, -25], n: 0, sq: 0.92, v: [0, 3] },
  { hy: 0.58, p: 8, aN: [62, 40], k: 8, aF: [90, 30, 22], fN: [0.12, 0.34, -5], fF: [-0.02, 0.30, -22], n: -6, sq: 1.03, v: [0, 2] },
  { hy: 0.56, p: 6, aN: [60, 35, 18], k: 25, aF: [85, 25, 26], fN: [0.07, 0.20, -18], fF: [-0.10, 0.18, -30], n: -3, sq: 1.0, v: [0, -1] }
] };
K.upSlash = { keys: [
  { hy: 0.40, p: 24, s: 8, tw: -14, aN: [-48, 10], k: 222, aF: [30, 30, 12], fN: [0.15, G, 0], fF: [-0.13, G, -10], n: 2 },
  { hx: -0.01, hy: 0.35, p: 30, s: 12, tw: -20, aN: [-60, 6], k: 226, aF: [45, 30, 14], sq: 0.92, n: 6 },
  { hx: 0.02, hy: 0.46, p: 12, s: 2, tw: -2, aN: [55, 8], k: 330, aF: [-10, 30, 14], sq: 1.0, n: -6, sm: 0.7, de: 2 },
  { hx: 0.03, hy: 0.58, p: -4, s: -8, c: -6, tw: 14, aN: [172, 0], k: 450, aF: [-40, 25, 18], sq: 1.07, n: -18, fN: [0.10, 0.11, -35], fF: [-0.10, 0.13, -40], de: 3 },
  { hx: 0.02, hy: 0.54, p: -2, s: -6, tw: 10, aN: [182, 38], k: 478, aF: [-30, 30, 16], sq: 1.02, n: -14, fN: [0.10, G, 0], fF: [-0.10, G, -10] },
  { hx: 0.0, hy: 0.48, p: 10, s: 4, c: 2, tw: 0, aN: [30, 50], k: 385, aF: [-12, 24, 6], sq: 1.0, n: -4 }
] };
K.parry = { keys: [
  { hy: 0.47, p: 4, aN: [72, 82], k: 98, aF: [20, 70, 10], n: -6, fN: [0.13, G, 0], fF: [-0.14, G, -5] },
  { hx: -0.03, hy: 0.45, p: -8, s: -4, aN: [76, 88], k: 116, aF: [30, 80, 12], n: -10, sq: 0.97, fN: [0.12, G, 0], fF: [-0.17, G, 0], fx: 'do' },
  { hx: -0.02, hy: 0.46, p: -3, s: -2, aN: [74, 84], k: 106, aF: [25, 75, 10], n: -8, sq: 1.0 },
  { hx: -0.01, hy: 0.47, p: 4, aN: [50, 62], k: 66, aF: [5, 40, 8], n: -5 },
  { hx: 0.0, hy: 0.48, p: 8, aN: [28, 52], k: 26, aF: [-12, 24, 6], n: -4, fN: [0.10, G, 0], fF: [-0.10, G, 0] }
] };
K.chargeAttack = { keys: [
  { hx: -0.02, hy: 0.44, p: 12, tw: -14, aN: [-50, 40], k: 170, aF: [30, 30, 12], fN: [0.20, G, 0], fF: [-0.16, G, -5], n: -4 },
  { hx: -0.03, hy: 0.40, p: 16, s: 6, tw: -22, aN: [-64, 25], k: 182, aF: [45, 35, 14], sq: 0.96, fx: 'tu1' },
  { hx: -0.035, hy: 0.39, p: 17, tw: -24, aN: [-66, 24], k: 184, sq: 0.95, fx: 'tu2' },
  { hx: -0.04, hy: 0.38, p: 18, tw: -26, aN: [-68, 22], k: 186, sq: 0.94, fx: 'tu3' },
  { hx: 0.06, hy: 0.45, p: 20, s: 8, tw: -2, aN: [105, 10], ky: -85, kb: 1, kw: -92, aF: [-45, 25, 16], sq: 1.03, fN: [0.24, G, 0], fF: [-0.14, 0.10, -30], sm: 0.8, de: 3, v: [4, 0] },
  { hx: 0.10, hy: 0.42, p: 26, s: 10, tw: 10, aN: [95, 0], ky: 45, kw: -90, aF: [-55, 25, 18], sq: 0.97, fN: [0.30, G, 0], fF: [-0.16, 0.08, -30], de: 2, v: [3, 0] },
  { hx: 0.10, hy: 0.41, p: 26, tw: 14, aN: [85, 8], ky: 105, kw: -85, aF: [-50, 30, 18], fN: [0.31, G, 5], fF: [-0.12, G, -20], v: [1.5, 0] },
  { hx: 0.04, hy: 0.46, p: 14, tw: 8, aN: [40, 40], ky: -10, kb: 0, k: -22, aF: [-15, 26, 8], fN: [0.18, G, 0], fF: [-0.12, G, 0], v: [0, 0] }
] };
K.echoCast = { keys: [
  { hy: 0.49, p: 4, n: -8, aF: [165, 25, 18], aN: [28, 52], k: 24 },
  { hy: 0.49, p: 2, n: -10, aF: [196, 70, 26], fx: 'vong1' },
  { hy: 0.495, p: 4, n: -12, aF: [160, 40, 22], fx: 'vong2', sq: 1.01 },
  { hy: 0.49, p: 8, n: -4, aF: [-8, 24, 6] }
] };
K.heal = { keys: [
  { hy: 0.43, p: 14, s: 6, fN: [0.12, G, 0], fF: [-0.18, G, -10], aN: [40, 50], k: 0, n: 2 },
  { hx: 0.0, hy: 0.29, p: 12, s: 8, c: 4, fN: [0.17, G, 0], fF: [-0.17, 0.07, -55], aN: [58, 25], k: -88, aF: [30, 80, 10], n: 10 },
  { hy: 0.29, p: 18, s: 10, c: 8, aN: [56, 26], aF: [60, 125, 6], n: 22, fx: 'hoi1' },
  { hy: 0.295, p: 14, s: 8, c: 4, aF: [65, 120, 6], n: 12, fx: 'hoi2', sq: 1.01 },
  { hy: 0.40, p: 18, s: 6, c: 2, aN: [50, 30], k: -70, aF: [10, 40, 8], n: 0, fN: [0.14, G, 0], fF: [-0.13, G, -10], sq: 1.0 },
  { hy: 0.49, p: 7, s: 3, c: 3, aN: [26, 52], k: 24, aF: [-12, 24, 6], n: -6, fN: [0.08, G, 0], fF: [-0.09, G, 0] }
] };
K.dodge = { keys: [
  { hy: 0.37, p: 32, s: 10, aN: [-20, 40], k: 170, aF: [-35, 35, 12], fN: [0.10, G, 0], fF: [-0.12, G, -15], sq: 0.92 },
  { hx: 0.04, hy: 0.42, p: 50, s: 10, rr: 14, aN: [60, 30], k: 15, aF: [70, 20, 14], fN: [-0.05, 0.12, -40], fF: [-0.30, 0.16, -60], sq: 1.05, v: [6, 0] },
  { hx: 0.04, hy: 0.36, p: 50, s: 12, rr: 18, aN: [40, 30], k: -5, aF: [40, 25, 14], fN: [0.02, 0.10, -30], fF: [-0.32, 0.10, -50], sq: 0.97, v: [6.5, 0] },
  { hx: 0.02, hy: 0.30, p: 34, s: 10, rr: 8, aN: [30, 40], k: 0, aF: [10, 35, 12], fN: [0.24, G, 10], fF: [-0.18, G, -25], v: [3, 0] },
  { hx: -0.02, hy: 0.38, p: 14, s: 4, rr: 0, aN: [35, 45], k: 15, aF: [-5, 30, 10], fN: [0.20, G, 0], fF: [-0.14, G, -5], v: [1, 0] },
  { hx: 0.0, hy: 0.48, p: 9, aN: [26, 52], k: 24, aF: [-12, 24, 6], fN: [0.09, G, 0], fF: [-0.09, G, 0], v: [0, 0] }
] };
K.hit = { keys: [
  { hx: -0.03, hy: 0.47, p: -16, s: -8, c: -8, n: -22, aN: [62, 40, 18], aF: [72, 30, 26], k: 70, sq: 0.95, fN: [0.10, G, 0], fF: [-0.12, G, 0] },
  { hx: -0.06, hy: 0.46, p: -26, s: -12, c: -10, n: -26, aN: [75, 30, 22], aF: [85, 25, 30], k: 95, sq: 1.02, fN: [0.17, 0.12, 25] },
  { hx: -0.03, hy: 0.44, p: -4, s: -2, c: 0, n: -6, aN: [45, 45, 10], aF: [30, 30, 14], k: 40, sq: 0.97, fN: [0.13, G, 0], fF: [-0.14, G, -5] },
  { hx: 0.0, hy: 0.48, p: 8, s: 4, c: 2, n: -4, aN: [26, 52], aF: [-12, 24, 6], k: 24, sq: 1.0, fN: [0.08, G, 0], fF: [-0.09, G, 0] }
] };
K.death = { keys: [
  { hx: -0.03, hy: 0.47, p: -20, s: -10, c: -10, n: -26, aN: [65, 35, 18], aF: [75, 30, 26], k: 80, sq: 0.96, fN: [0.10, G, 0], fF: [-0.12, G, 0] },
  { hx: -0.02, hy: 0.33, p: 8, s: 8, c: 4, n: 16, aN: [30, 30, 10], aF: [15, 20, 12], k: 10, fN: [0.15, G, 0], fF: [-0.12, 0.07, -60] },
  { hx: 0.0, hy: 0.32, p: 20, s: 14, c: 10, n: 34, aN: [6, 15, 6], aF: [-4, 12, 8], k: -70, sq: 0.97 },
  { hx: 0.0, hy: 0.32, p: 26, s: 14, c: 8, n: 30, rr: 22, aN: [40, 20, 8], aF: [30, 15, 10], k: -40, fN: [0.10, G, -20], fF: [-0.18, 0.08, -60] },
  { hx: -0.12, hy: 0.35, p: 18, s: 10, c: 6, n: 18, rr: 52, aN: [100, 20, 10], aF: [95, 15, 14], k: -10, fN: [-0.10, 0.10, -50], fF: [-0.30, 0.10, -60] },
  { hx: -0.20, hy: 0.35, p: 10, s: 6, c: 4, n: 10, rr: 72, aN: [140, 15, 10], aF: [130, 10, 16], k: 0, fN: [-0.30, 0.10, -70], fF: [-0.44, 0.10, -75], v: [0, -2] },
  { hx: -0.24, hy: 0.34, p: 4, s: 2, c: 2, n: 4, rr: 86, aN: [160, 10, 10], aF: [150, 6, 16], k: 6, fN: [-0.42, 0.07, -85], fF: [-0.55, 0.08, -85], sq: 0.94, v: [0, 0] },
  { hx: -0.24, hy: 0.35, p: 2, s: 0, c: 0, n: 2, rr: 88, aN: [165, 6, 10], aF: [155, 4, 16], k: 4, fN: [-0.43, 0.07, -88], fF: [-0.56, 0.07, -88], sq: 1.0 }
] };
K.crouch = { keys: [
  { hy: 0.40, p: 16, s: 6, aN: [45, 45], k: 25, fN: [0.13, G, 0], fF: [-0.12, G, -5], sq: 0.97, n: -2 },
  { hy: 0.31, p: 22, s: 10, c: 4, aN: [68, 45], k: 32, aF: [20, 40, 10], fN: [0.16, G, 0], fF: [-0.11, G, -25], sq: 0.97, n: -6 }
] };
K.slide = { keys: [
  { hx: -0.04, hy: 0.33, p: -2, s: 0, aN: [40, 50], k: 10, aF: [-30, 20, 14], fN: [0.30, G, 15], fF: [0.04, G, -5], v: [5, 0], n: -4 },
  { hx: -0.12, hy: 0.21, p: -24, s: -8, c: -4, rr: -8, aN: [55, 40], k: 15, aF: [-50, 10, 16], hF: [-0.36, 0.08], fN: [0.38, 0.065, 30], fF: [0.16, 0.06, 15], v: [6, 0], n: 8 },
  { hx: -0.13, hy: 0.20, p: -26, s: -8, rr: -9, aN: [60, 38], k: 18, hF: [-0.37, 0.08], fN: [0.40, 0.065, 32], fF: [0.18, 0.06, 18], v: [5, 0], n: 10 },
  { hx: -0.05, hy: 0.32, p: 14, s: 6, rr: 0, aN: [45, 45], k: 20, aF: [-20, 30, 12], fN: [0.26, G, 5], fF: [-0.02, G, -10], v: [1.5, 0], n: -2 }
] };
/* tường ở phía SAU lưng (x = -0.30): lưng/áo choàng áp tường, tay xa miết tường */
K.wallSlide = { v: [0, -2.6], keys: [
  { hx: -0.02, hy: 0.55, p: -8, s: -4, n: 2, hF: [-0.31, 0.80], aN: [70, 40, 10], k: 20, fN: [0.17, 0.33, 0], fF: [-0.22, 0.24, -75] },
  { hx: -0.025, hy: 0.545, p: -7, n: 4, hF: [-0.31, 0.84], aN: [72, 38, 10], k: 24, fN: [0.18, 0.31, 0], fF: [-0.22, 0.22, -75] },
  { hx: -0.02, hy: 0.55, p: -9, n: 1, hF: [-0.31, 0.77], aN: [68, 42, 10], k: 18, fN: [0.16, 0.34, 0], fF: [-0.22, 0.25, -75] }
] };
K.wallJump = { keys: [
  { hx: -0.06, hy: 0.45, p: 28, s: 8, n: 4, hF: [-0.30, 0.82], aN: [20, 70], k: 140, fN: [-0.22, 0.26, -70], fF: [-0.25, 0.16, -70], sq: 0.93, v: [0, -1] },
  { hx: 0.02, hy: 0.56, p: 30, s: 6, rr: 16, aN: [105, 25], k: 60, aF: [120, 20, 14], fN: [-0.28, 0.16, -50], fF: [-0.33, 0.22, -55], sq: 1.06, v: [4, 4], de: 3 },
  { hx: 0.02, hy: 0.58, p: 18, rr: 10, aN: [70, 60], k: 40, aF: [80, 50, 16], fN: [0.08, 0.33, -10], fF: [-0.04, 0.28, -25], sq: 1.0, v: [3, 2] },
  { hx: 0.02, hy: 0.62, p: 30, s: 14, c: 10, rr: 38, n: 18, aN: [40, 110], k: -60, aF: [30, 120, 10], fN: [0.12, 0.40, -5], fF: [0.04, 0.36, -15], sq: 0.94, v: [3, 0] }
] };
/* leo tường: tường ở PHÍA TRƯỚC (x = +0.27), tay chân bám luân phiên */
var TW = 0.30;
K.wallClimb = { keys: [
  { hy: 0.50, p: 14, s: 6, n: -10, hF: [TW, 0.98], hN: [TW - 0.03, 0.74], aN: [0, 0, 30], aF: [0, 0, 12], k: -100, fN: [TW - 0.08, 0.30, 55], fF: [TW - 0.12, 0.10, 35] },
  { hy: 0.56, p: 12, s: 5, n: -8, hF: [TW, 0.93], hN: [TW - 0.03, 0.70], k: -100, fN: [TW - 0.08, 0.25, 50], fF: [TW - 0.12, 0.06, 30], sq: 1.02 },
  { hy: 0.58, p: 13, s: 6, n: -6, hF: [TW, 0.88], hN: [TW - 0.03, 0.69], k: -95, fN: [TW - 0.12, 0.12, 30], fF: [TW - 0.08, 0.28, 55] },
  { hy: 0.50, p: 14, s: 6, n: -10, hN: [TW - 0.03, 0.98], hF: [TW, 0.74], k: -70, fF: [TW - 0.08, 0.30, 55], fN: [TW - 0.12, 0.10, 35] },
  { hy: 0.56, p: 12, s: 5, n: -8, hN: [TW - 0.03, 0.93], hF: [TW, 0.70], k: -70, fF: [TW - 0.08, 0.25, 50], fN: [TW - 0.12, 0.06, 30], sq: 1.02 },
  { hy: 0.58, p: 13, s: 6, n: -6, hN: [TW - 0.03, 0.88], hF: [TW, 0.69], k: -80, fF: [TW - 0.12, 0.12, 30], fN: [TW - 0.08, 0.28, 55] }
] };
/* leo thang: thân thẳng đứng, hai tay dang ra trước mặt nắm thanh, tay chân luân phiên */
var TL = 0.20, YL = 15;
K.ladderClimb = { keys: [
  { yaw: YL, hy: 0.52, p: 0, s: 0, n: -8, hF: [TL, 1.10], hN: [TL, 0.78], aN: [0, 0, 32], aF: [0, 0, 20], k: -100, fN: [TL - 0.06, 0.30, 0], fF: [TL - 0.10, 0.10, 0] },
  { yaw: YL, hy: 0.58, p: -2, n: -6, hF: [TL, 1.04], hN: [TL, 0.76], k: -100, fN: [TL - 0.07, 0.25, 0], fF: [TL - 0.11, 0.12, -20], sq: 1.02 },
  { yaw: YL, hy: 0.56, p: 0, n: -8, hF: [TL, 0.94], hN: [TL, 0.94], k: -90, fN: [TL - 0.08, 0.18, 0], fF: [TL - 0.08, 0.18, 0] },
  { yaw: YL, hy: 0.52, p: 0, n: -8, hN: [TL, 1.10], hF: [TL, 0.78], k: -80, fF: [TL - 0.06, 0.30, 0], fN: [TL - 0.10, 0.10, 0] },
  { yaw: YL, hy: 0.58, p: -2, n: -6, hN: [TL, 1.04], hF: [TL, 0.76], k: -80, fF: [TL - 0.07, 0.25, 0], fN: [TL - 0.11, 0.12, -20], sq: 1.02 },
  { yaw: YL, hy: 0.56, p: 0, n: -8, hN: [TL, 0.94], hF: [TL, 0.94], k: -90, fF: [TL - 0.08, 0.18, 0], fN: [TL - 0.08, 0.18, 0] }
] };
/* bám mép: mép tường ở trước mặt; khung cuối hạ dần để vừa ô (game tự nâng nhân vật) */
K.ledgeGrab = { keys: [
  { hx: -0.02, hy: 0.42, p: -2, n: -18, hN: [0.20, 1.17], hF: [0.24, 1.18], k: -100, fN: [0.10, 0.06, -30], fF: [0.0, 0.05, -40], sq: 1.04, v: [0, -1] },
  { hx: -0.07, hy: 0.41, p: -8, n: -16, hN: [0.20, 1.17], hF: [0.24, 1.18], k: -100, fN: [-0.04, 0.05, -40], fF: [-0.12, 0.06, -45], v: [0, 0] },
  { hx: -0.02, hy: 0.56, p: 10, n: -12, hN: [0.20, 1.17], hF: [0.24, 1.18], k: -100, fN: [0.20, 0.36, 55], fF: [0.05, 0.12, -20] },
  { hx: 0.02, hy: 0.62, p: 42, s: 16, n: 8, hN: [0.24, 0.92], hF: [0.28, 0.92], k: 30, fN: [0.14, 0.40, 40], fF: [-0.04, 0.18, -30] },
  { hx: 0.06, hy: 0.46, p: 30, s: 12, n: 4, hN: [0.30, 0.50], hF: [0.32, 0.50], k: 20, fN: [0.20, 0.30, 0], fF: [-0.06, 0.22, -40] },
  { hx: 0.02, hy: 0.42, p: 16, s: 6, n: -4, aN: [30, 50], aF: [-8, 25, 8], k: 22, fN: [0.12, G, 0], fF: [-0.10, G, -10] }
] };
K.dash = { keys: [
  { hy: 0.40, p: 30, s: 10, aN: [-30, 40], k: 175, aF: [-40, 35, 12], fN: [0.14, G, 0], fF: [-0.13, G, -15], sq: 0.92, v: [1, 0] },
  { hx: 0.04, hy: 0.45, p: 44, s: 12, rr: 8, aN: [-55, 15], k: 190, aF: [-60, 15, 14], fN: [0.06, 0.20, -35], fF: [-0.26, 0.18, -55], sq: 1.04, v: [9, 0], de: 3 },
  { hx: 0.04, hy: 0.45, p: 46, s: 12, rr: 9, aN: [-58, 12], k: 192, aF: [-62, 12, 14], fN: [0.04, 0.21, -38], fF: [-0.28, 0.19, -58], sq: 1.05, v: [9.5, 0] },
  { hx: 0.0, hy: 0.40, p: 14, s: 4, rr: 0, aN: [30, 45], k: 20, aF: [10, 35, 12], fN: [0.22, G, 10], fF: [-0.17, G, -10], sq: 0.95, v: [1.5, 0] }
] };

/* ---------------- ghép thành ANIMS ---------------- */
var ANIMS = {};
L3.THU_TU.forEach(function (ten) {
  var m = META[ten], k = K[ten] || { keys: [] }, keys = [];
  var frames = m.f.map(function (f, i) {
    var o = k.keys[i] || {}, kk = {};
    for (var c in o) if (c !== 'sm' && c !== 'fx' && c !== 'de') kk[c] = o[c];
    if (o.de) kk.de = o.de;
    if (i === 0 && k.v && !kk.v) kk.v = k.v;
    keys.push(kk);
    return { name: f[0], hold: f[1], hit: (f[2] || '').indexOf('H') >= 0, comboWindow: (f[2] || '').indexOf('C') >= 0,
      sm: o.sm, fx: o.fx };
  });
  ANIMS[ten] = { loop: m.loop, label: m.label, frames: frames, keys: keys };
});
/* sự kiện: gõ chuông (xung vận tốc cho con lắc) */
['death', 'dodge', 'dash', 'wallJump', 'slide'].forEach(function (t) { ANIMS[t].tayTuongDoi = true; });   // tay theo thân khi lăn/lướt
ANIMS.fall.canVai = 0.94; ANIMS.wallClimb.canVai = 0.97;
ANIMS.wallSlide.tuong = -0.31; ANIMS.wallJump.tuong = -0.31;   // áo choàng áp vào tường sau lưng
ANIMS.parry.su = [{ khung: 1, chuong: [-2.2, 0.6] }];
ANIMS.echoCast.su = [{ khung: 1, chuong: [1.6, 0.8] }];
ANIMS.hit.su = [{ khung: 0, chuong: [-2.5, 1.2] }];
ANIMS.death.su = [{ khung: 0, chuong: [-2.5, 1.2] }, { khung: 6, chuong: [0, 2.0] }];
ANIMS.land.su = [{ khung: 0, chuong: [0.6, -2.0] }];
ANIMS.attack3.su = [{ khung: 5, chuong: [1.4, -1.2] }];
/* chuông lắc SAU khi dừng/chém (biên độ vừa: con lắc có cản + giới hạn góc trong lam3d-core.js) */
ANIMS.attack.su = [{ khung: 4, chuong: [-1.6, 0.4] }];
ANIMS.attack2.su = [{ khung: 4, chuong: [-1.0, -1.2] }];
ANIMS.jump.su = [{ khung: 1, chuong: [0, -1.4] }];
L3.ANIMS = ANIMS;

/* ---------------- hiệu ứng pixel (vẽ lên chỗ trống quanh nhân vật) ---------------- */
function vong(ve, cx, cy, r, mau, cham) {
  var n = Math.ceil(2 * Math.PI * r * 1.5);
  for (var i = 0; i < n; i++) {
    if (cham && (i % 3) === 2) continue;
    var a = i / n * Math.PI * 2; ve(cx + Math.cos(a) * r, cy + Math.sin(a) * r, mau);
  }
}
function tamChuong(lam) { return lam.chieu(lam.CH.p.clone().add(new lam.THREE.Vector3(0, -0.10, 0))); }
L3.FX = {
  vong1: function (ve, ra, idr, n, lam) { var c = tamChuong(lam); vong(ve, c[0], c[1], 6, 'k', false); vong(ve, c[0], c[1], 7, 'x2', true); },
  vong2: function (ve, ra, idr, n, lam) { var c = tamChuong(lam); vong(ve, c[0], c[1], 11, 'k', true); vong(ve, c[0], c[1], 16, 'x2', true); },
  do: function (ve, ra, idr, n, lam) {
    var c = lam.chieu(lam.diemKiem(0.55));
    for (var i = -4; i <= 4; i++) { ve(c[0] + i, c[1], Math.abs(i) < 2 ? 'v2' : 'k', true); ve(c[0], c[1] + i, Math.abs(i) < 2 ? 'v2' : 'k', true); }
    ve(c[0] - 2, c[1] - 2, 'k'); ve(c[0] + 2, c[1] - 2, 'k'); ve(c[0] - 2, c[1] + 2, 'k'); ve(c[0] + 2, c[1] + 2, 'k');
  },
  hoi1: function (ve, ra, idr, n, lam) { hat(ve, lam, 0); },
  hoi2: function (ve, ra, idr, n, lam) { hat(ve, lam, 1); },
  tu1: function (ve, ra, idr, n, lam) { hao(ve, lam, 1); },
  tu2: function (ve, ra, idr, n, lam) { hao(ve, lam, 2); },
  tu3: function (ve, ra, idr, n, lam) { hao(ve, lam, 3); }
};
function hat(ve, lam, b) {   // đốm sáng hồi máu bay lên quanh người
  var c = lam.chieu(new lam.THREE.Vector3(0, 0.55, 0));
  var DS = [[-12, -6], [11, -10], [-8, -18], [14, 2], [-15, 4], [6, -22], [-3, -27], [16, -16]];
  DS.forEach(function (d, i) {
    var x = c[0] + d[0], y = c[1] + d[1] - b * 5 - (i % 3);
    if ((i + b) % 2) { ve(x, y, 'k'); ve(x + 1, y, 'x2'); ve(x - 1, y, 'x2'); ve(x, y + 1, 'x2'); ve(x, y - 1, 'x2'); }
    else ve(x, y, b ? 'k' : 'x2');
  });
}
function hao(ve, lam, b) {   // kiếm tụ lực: quầng sáng quanh lưỡi + tia
  for (var i = 0; i <= 14; i++) {
    var p = lam.chieu(lam.diemKiem(0.15 + i / 14 * 0.95));
    var r = b >= 2 ? 2 : 1;
    for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) if (Math.abs(dx) + Math.abs(dy) <= r) ve(p[0] + dx, p[1] + dy, (Math.abs(dx) + Math.abs(dy) < r || b === 3) ? 'k' : 'x2');
  }
  if (b >= 2) {
    var t = lam.chieu(lam.diemKiem(1.0));
    var T = b === 3 ? 6 : 3;
    for (var j = 2; j <= T; j++) { ve(t[0] + j, t[1] - j, 'v2'); ve(t[0] - j, t[1] - j, 'k'); }
  }
}
})(typeof window !== 'undefined' ? window : this);
