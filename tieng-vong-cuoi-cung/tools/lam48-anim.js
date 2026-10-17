/* =====================================================================
   lam48-anim.js — 26 animation của Lam 48×48 (tên, số khung, hold, cờ hit/comboWindow giữ y như
   Sprite Lab cũ / art/sprite/atlas.json). Mỗi khung: tt = tư thế "mềm" (xem lam48-rig.js).
   Tọa độ đích tay/chân theo khung 48×48 ở tư thế chuẩn: vai trước (29,23), vai sau (19,23),
   cổ chân trước (27,43), sau (19,43), mặt đất y = 46. Kiếm: góc tuyệt đối (0 = phải, 90 = lên).
   ===================================================================== */
(function (root) {
'use strict';
function F(name, hold, tt, hit, combo) { return { name: name, hold: hold || 1, hit: !!hit, comboWindow: !!combo, tt: tt || {} }; }
function X(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
// chân co trên không
var CO = { chanTu: true, duiT: 45, ongT: -75, duiS: 28, ongS: -68, giayT: -20, giayS: -30 };
var DUOI = { chanTu: true, duiT: 15, ongT: -25, duiS: -5, ongS: -20, giayT: -22, giayS: -28 };
var THU = { y: 1, than: -3, tayT: [31, 30], kiem: 30, tayS: [20, 31], chanT: [30, 43], chanS: [17, 43] };   // thủ thế
var BUOC = { chanT: [30, 43], chanS: [17, 43] };

var A = {};
A.idle = { loop: true, label: 'Idle', frames: [
  F('đứng thẳng', 1, {}),
  F('thở ra', 1, { gio: -3, kiem: 23 }),
  F('hạ người – thấp nhất', 1, { y: 1, gio: -6, kiem: 21 }),
  F('vạt áo phất', 1, { y: 1, gio: -10, kiem: 21 }),
  F('hít vào', 1, { gio: -5, kiem: 23 }),
  F('ưỡn ngực – cao nhất', 1, { gio: -2, kiem: 25 })
]};
var R = { than: -8, dau: 3, hong: 4, vx: 1.5, gio: 2 };
A.run = { loop: true, label: 'Run', frames: [
  F('chân trước chạm đất', 1, X(R, { y: 1, chanT: [28, 43], chanS: [18, 41], giayT: 8, giayS: -35, tayT: [27, 31], kiem: -26, tayS: [25, 29] })),
  F('nhún – dồn lực', 1, X(R, { y: 2, chanT: [24, 43], chanS: [18, 38], giayS: -45, tayT: [28, 32], kiem: -22, tayS: [24, 30] })),
  F('chân lướt qua', 1, X(R, { y: 1, chanT: [20, 43], chanS: [24, 38], giayT: -5, giayS: -20, tayT: [30, 32], kiem: -16, tayS: [21, 31] })),
  F('đạp đất – bay', 1, X(R, { y: -1, chanT: [17, 41], chanS: [28, 40], giayT: -40, giayS: 0, tayT: [31, 31], kiem: -10, tayS: [17, 30] })),
  F('chân kia chạm đất', 1, X(R, { y: 1, chanS: [28, 43], chanT: [18, 41], giayS: 8, giayT: -35, tayT: [32, 30], kiem: -6, tayS: [15, 30] })),
  F('nhún – dồn lực (2)', 1, X(R, { y: 2, chanS: [24, 43], chanT: [18, 38], giayT: -45, tayT: [31, 31], kiem: -10, tayS: [17, 31] })),
  F('chân lướt qua (2)', 1, X(R, { y: 1, chanS: [20, 43], chanT: [24, 38], giayS: -5, giayT: -20, tayT: [30, 32], kiem: -16, tayS: [21, 31] })),
  F('đạp đất – bay (2)', 1, X(R, { y: -1, chanS: [17, 41], chanT: [28, 40], giayS: -40, giayT: 0, tayT: [28, 31], kiem: -22, tayS: [25, 29] }))
]};
A.jump = { loop: false, label: 'Jump', frames: [
  F('lấy đà', 1, { y: 3, than: -6, tayT: [27, 33], kiem: -20, tayS: [17, 33] }),
  F('bật lên', 1, X(DUOI, { y: -1, than: -3, duiT: 5, ongT: -5, duiS: -12, ongS: -12, tayT: [32, 23], kiem: 45, tayS: [23, 18], vy: -4 })),
  F('lên 1', 1, X(DUOI, { y: -1, than: -4, duiT: 30, ongT: -45, duiS: 5, ongS: -35, tayT: [31, 26], kiem: 32, tayS: [21, 24], vy: -3 })),
  F('lên 2', 1, X(CO, { y: -1, than: -4, duiT: 40, ongT: -65, duiS: 18, ongS: -55, tayT: [31, 27], kiem: 25, tayS: [19, 25], vy: -1 })),
  F('đỉnh nhảy', 1, X(CO, { y: -1, tayT: [31, 26], kiem: 15, tayS: [16, 26], gio: -8 })),
  F('chuyển sang rơi', 1, X(DUOI, { y: -1, duiT: 25, ongT: -40, duiS: 5, ongS: -28, tayT: [31, 26], kiem: 10, tayS: [15, 25], vy: 2 }))
]};
A.fall = { loop: true, label: 'Fall', frames: [
  F('rơi – áo bay lên', 1, X(DUOI, { y: -1, tayT: [31, 26], kiem: 5, tayS: [15, 24], vy: 2.5, gio: -8 })),
  F('rơi – vạt áo quất', 1, X(DUOI, { y: -1, duiT: 18, ongT: -30, tayT: [31, 25], kiem: 8, tayS: [14, 23], vy: 2.5, gio: -20 })),
  F('rơi – dang tay giữ thăng bằng', 1, X(DUOI, { y: -1, duiS: -8, ongS: -15, tayT: [31, 27], kiem: 3, tayS: [14, 25], vy: 2.5, gio: -12 }))
]};
A.attack = { loop: false, label: 'Attack 1', frames: [
  F('thủ thế', 1, THU),
  F('kéo kiếm ra sau ngang ngực', 1, X(BUOC, { y: 1, than: 4, tayT: [23, 26], kiem: 165, tayS: [24, 30], gio: -4 })),
  F('dồn trọng tâm – kiếm ngang sau lưng', 2, X(BUOC, { y: 2, than: 8, tayT: [20, 26], kiem: 172, tayS: [26, 29], gio: -6 })),
  F('vung ngang – kiếm lướt qua ngực', 1, X(BUOC, { y: 1, than: -2, tayT: [27, 24], kiem: 95, tayS: [20, 30], hieuUng: { vet: 172, det: 0.55 } })),
  F('chém thẳng ngang ngực – HIT', 2, { y: 2, than: -10, dau: 4, tayT: [31, 28], kiem: 0, tayS: [16, 30], chanT: [31, 43], chanS: [17, 43], hieuUng: { vet: 165, det: 0.5, day: 1 } }, true),
  F('theo đà – kiếm vượt qua', 1, { y: 2, than: -12, dau: 4, tayT: [31, 31], kiem: -35, tayS: [16, 31], chanT: [31, 43], chanS: [17, 43], hieuUng: { vet: 30, det: 0.5 } }, false, true),
  F('hạ kiếm – sẵn sàng nối', 1, X(BUOC, { y: 2, than: -8, tayT: [30, 33], kiem: -45, tayS: [18, 31] }), false, true),
  F('thu kiếm – kiếm thấp phía trước', 1, X(BUOC, { y: 1, than: -4, tayT: [30, 33], kiem: -30, tayS: [19, 31] })),
  F('kiếm thấp phía trước (nối nhát 2)', 1, X(BUOC, { y: 1, than: -3, tayT: [30, 34], kiem: -25, tayS: [20, 31] }))
]};
A.dodge = { loop: false, label: 'Dodge', frames: [
  F('nhún thấp', 1, { y: 3, than: -12, tayT: [27, 33], kiem: -20, tayS: [18, 32] }),
  F('phóng người', 1, { y: 2, x: 1, than: -22, hong: 3, chanT: [28, 41], chanS: [15, 42], giayS: -40, tayT: [27, 31], kiem: -150, tayS: [15, 30], vx: 4, kiemSau: true, gio: -30 }),
  F('lướt thấp', 1, { y: 4, x: 2, than: -28, hong: 3, chanT: [30, 42], chanS: [15, 43], giayS: -30, tayT: [26, 32], kiem: -160, tayS: [14, 31], vx: 5, kiemSau: true, gio: -40, hieuUng: { bui: [16, 3] } }),
  F('trượt chân', 1, { y: 3, x: 2, than: -18, chanT: [31, 43], chanS: [17, 43], tayT: [27, 32], kiem: -150, tayS: [15, 31], vx: 3, kiemSau: true, gio: -20, hieuUng: { bui: [30, 4] } }),
  F('phanh lại', 1, { y: 2, x: 1, than: 6, chanT: [31, 43], chanS: [18, 43], tayT: [31, 31], kiem: 10, tayS: [14, 29], vx: 1 }),
  F('đứng vững', 1, {})
]};
A.hit = { loop: false, label: 'Hit', frames: [
  F('trúng đòn', 1, { x: -1, than: 12, dau: 6, tayT: [32, 26], kiem: 60, tayS: [14, 27], matTat: true, vx: -3, lacChuong: 30 }),
  F('bật ngửa', 2, { x: -2, y: 1, than: 16, dau: 8, tayT: [33, 24], kiem: 75, tayS: [13, 25], matTat: true, vx: -2 }),
  F('loạng choạng', 1, { x: -1, y: 2, than: 4, tayT: [31, 30], kiem: 30, tayS: [17, 31] }),
  F('hồi lại', 1, { y: 1, than: -2, kiem: 24 })
]};
var NAM = { chanTu: true, duiT: 0, ongT: 0, duiS: 0, ongS: 0, giayT: -90, giayS: -90, matTat: true };
A.death = { loop: false, label: 'Death', frames: [
  F('trúng đòn chí mạng', 1, { x: -1, than: 14, dau: 8, matTat: true, tayT: [33, 25], kiem: 70, tayS: [13, 26], vx: -3, lacChuong: 35 }),
  F('khuỵu gối', 1, { y: 5, than: -6, dau: -6, tayT: [31, 34], kiem: -40, tayS: [19, 35] }),
  F('gục đầu', 1, { y: 7, than: -12, dau: -18, tayT: [31, 37], kiem: -70, tayS: [20, 37], matTat: true }),
  F('chúi người', 1, X(NAM, { y: 8, goc: -25, duiT: 55, ongT: -85, duiS: 45, ongS: -80, giayT: -20, giayS: -25, tayT: [33, 38], kiem: -60, tayS: [24, 38] })),
  F('đổ xuống', 1, X(NAM, { x: -4, y: 8, goc: -50, duiT: 35, ongT: -50, duiS: 30, ongS: -45, giayT: -50, giayS: -55, tayT: [37, 38], kiem: -40, tayS: [30, 40] })),
  F('sắp chạm đất', 1, X(NAM, { x: -8, y: 6, goc: -72, duiT: 15, ongT: -20, duiS: 12, ongS: -18, tayT: [40, 40], kiem: -20, tayS: [34, 41] })),
  F('đập xuống – nảy', 1, X(NAM, { x: -10, y: 4, goc: -88, dau: 6, duiT: 8, ongT: -12, tayT: [42, 41], kiem: -8, tayS: [36, 42] })),
  F('nằm im', 3, X(NAM, { x: -10, y: 5, goc: -90, duiT: 6, ongT: -10, tayT: [42, 42], kiem: -4, tayS: [36, 43] }))
]};
A.land = { loop: false, label: 'Land', frames: [
  F('chạm đất – nén người mạnh', 1, { y: 4, than: -10, tayT: [31, 31], kiem: -10, tayS: [15, 29], vy: 3, hieuUng: { bui: [23, 4] } }),
  F('nén thấp nhất – hấp lực', 1, { y: 5, than: -12, dau: 2, tayT: [30, 34], kiem: -15, tayS: [16, 32], hieuUng: { bui: [23, 6] } }),
  F('đứng dậy', 1, { y: 1, than: -3, kiem: 15 })
]};
A.crouch = { loop: false, label: 'Crouch', frames: [
  F('hạ người xuống', 1, { y: 4, than: -5, tayT: [30, 34], kiem: 10, tayS: [19, 34] }),
  F('ngồi xổm – kiếm thủ trước', 1, { y: 6, than: -8, dau: 3, chanT: [30, 43], chanS: [18, 43], tayT: [31, 35], kiem: 15, tayS: [21, 37] })
]};
A.slide = { loop: false, label: 'Slide', frames: [
  F('lao người – bắt đầu trượt', 1, { y: 4, than: 10, chanT: [32, 43], chanS: [18, 43], tayT: [27, 31], kiem: -160, tayS: [16, 33], kiemSau: true, vx: 5, gio: -30 }),
  F('trượt thấp sát đất', 1, { y: 8, than: 22, chanT: [36, 44], chanS: [21, 44], giayS: -20, tayS: [13, 39], tayT: [25, 34], kiem: -170, vx: 6, kiemSau: true, gio: -50, hieuUng: { bui: [36, 4] } }),
  F('trượt dài – áo kéo phía sau', 1, { y: 8, than: 24, chanT: [36, 44], chanS: [21, 44], giayS: -20, tayS: [13, 40], tayT: [25, 34], kiem: -172, vx: 6, kiemSau: true, gio: -65, hieuUng: { bui: [34, 5] } }),
  F('giảm tốc – chống dậy', 1, { y: 5, than: 8, chanT: [31, 43], chanS: [19, 43], tayS: [15, 40], tayT: [28, 33], kiem: -150, vx: 2, kiemSau: true, gio: -15 })
]};
var TUONG = { kiemLung: true, tayTruoc: true, than: -4, dau: 6, tayS: [31, 27], chanT: [30, 41], chanS: [23, 43], giayT: 20, vy: 3 };
A.wallSlide = { loop: true, label: 'Wall Slide', frames: [
  F('áp tường – trượt xuống', 1, X(TUONG, { y: 2, tayT: [34, 21], gio: -5 })),
  F('trượt – tay miết tường', 1, X(TUONG, { y: 2, tayT: [34, 23], gio: -9 })),
  F('trượt – áo choàng phần phật', 1, X(TUONG, { y: 3, tayT: [34, 22], gio: -14 }))
]};
A.wallJump = { loop: false, label: 'Wall Jump', frames: [
  F('co người – hai chân dồn vào tường', 1, { y: 4, than: -10, hong: 2, chanT: [21, 43], chanS: [16, 42], giayS: -20, tayT: [27, 33], kiem: -150, tayS: [21, 31], kiemSau: true }),
  F('đạp tường – bật ra sau', 1, X(DUOI, { y: -1, goc: -15, than: -10, duiT: -25, ongT: -5, duiS: -40, ongS: -5, giayT: -40, giayS: -50, tayT: [33, 25], kiem: 25, tayS: [27, 21], vx: 4, vy: -3 })),
  F('bay ngược – co chân', 1, X(CO, { y: -2, than: -6, tayT: [31, 28], kiem: 10, tayS: [18, 26], vy: -2 })),
  F('xoay người – cuộn tròn trên không', 1, X(CO, { y: -2, x: 1, goc: -35, duiT: 70, ongT: -100, duiS: 55, ongS: -95, tayT: [30, 31], kiem: -30, tayS: [22, 30], vy: 0 }))
]};
var LEO = { kiemLung: true, tayTruoc: true, hong: 3, than: 0, dau: 4 };
A.wallClimb = { loop: true, label: 'Wall Climb', frames: [
  F('tay xa vươn lên – chân gần đạp', 1, X(LEO, { y: 0, tayS: [31, 15], tayT: [34, 26], chanT: [29, 40], chanS: [24, 43], giayT: 15 })),
  F('tay xa bám – kéo người lên', 1, X(LEO, { y: -1, tayS: [31, 17], tayT: [34, 27], chanT: [28, 41], chanS: [26, 41], giayT: 10 })),
  F('chân xa đẩy – đổi bên', 1, X(LEO, { y: -2, tayS: [31, 19], tayT: [34, 22], chanS: [29, 40], chanT: [25, 43], giayS: 15 })),
  F('tay gần vươn lên – chân xa đạp', 1, X(LEO, { y: 0, tayT: [34, 15], tayS: [31, 24], chanS: [29, 40], chanT: [24, 43], giayS: 15 })),
  F('tay gần bám – kéo người lên', 1, X(LEO, { y: -1, tayT: [34, 17], tayS: [31, 25], chanS: [28, 41], chanT: [26, 41], giayS: 10 })),
  F('chân gần đẩy – đổi bên', 1, X(LEO, { y: -2, tayT: [34, 19], tayS: [31, 21], chanT: [29, 40], chanS: [25, 43], giayT: 15 }))
]};
var THANG = { kiemLung: true, tayTruoc: true, hong: 2, than: 0, dau: 2 };
A.ladderClimb = { loop: true, label: 'Ladder', frames: [
  F('tay xa nắm bậc trên – chân gần bước', 1, X(THANG, { y: 0, tayS: [30, 16], tayT: [33, 27], chanT: [28, 39], chanS: [22, 43] })),
  F('kéo lên – chân xa trụ', 1, X(THANG, { y: -1, tayS: [30, 18], tayT: [33, 25], chanT: [27, 40], chanS: [23, 42] })),
  F('đổi tay – thân thẳng', 1, X(THANG, { y: -2, tayS: [30, 21], tayT: [33, 21], chanT: [26, 42], chanS: [24, 41] })),
  F('tay gần nắm bậc trên – chân xa bước', 1, X(THANG, { y: 0, tayT: [33, 16], tayS: [30, 27], chanS: [27, 39], chanT: [23, 43] })),
  F('kéo lên – chân gần trụ', 1, X(THANG, { y: -1, tayT: [33, 18], tayS: [30, 25], chanS: [26, 40], chanT: [24, 42] })),
  F('đổi tay – thân thẳng (2)', 1, X(THANG, { y: -2, tayT: [33, 21], tayS: [30, 21], chanS: [25, 42], chanT: [25, 41] }))
]};
A.ledgeGrab = { loop: false, label: 'Ledge', frames: [
  F('chộp mép tường', 1, X(DUOI, { kiemLung: true, y: 1, duiT: 8, ongT: -12, duiS: -4, ongS: -10, tayT: [34, 15], tayS: [33, 17], tayTruoc: true, vy: 3, dau: 6 })),
  F('treo người – đung đưa', 1, X(DUOI, { kiemLung: true, y: 1, duiT: 18, ongT: -10, duiS: 8, ongS: -12, tayT: [34, 16], tayS: [33, 18], tayTruoc: true, gio: -8, dau: 6 })),
  F('kéo người lên – chân đạp tường', 1, { kiemLung: true, y: 0, than: -8, tayT: [34, 21], tayS: [32, 22], tayTruoc: true, chanT: [31, 40], chanS: [24, 42], giayT: 25, dau: 4 }),
  F('chống tay – đẩy ngực qua mép', 1, { kiemLung: true, y: 0, than: -20, tayT: [32, 28], tayS: [28, 28], chanT: [29, 41], chanS: [22, 43], dau: 8 }),
  F('leo qua – co gối lên mép', 1, { kiemLung: true, y: 1, than: -15, tayT: [32, 31], tayS: [27, 31], chanT: [31, 37], chanS: [22, 43], giayT: 0, dau: 6 }),
  F('đứng dậy trên mép', 1, { y: 0, than: -3, kiem: 20 })
]};
A.dash = { loop: false, label: 'Dash', frames: [
  F('lấy đà – cúi người', 1, { y: 2, than: -14, tayT: [26, 33], kiem: -150, tayS: [17, 31], vx: 2, kiemSau: true }),
  F('lướt nhanh – thu gọn thân', 1, { y: 1, than: -24, hong: 3, chanT: [21, 41], chanS: [15, 40], giayT: -30, giayS: -40, tayT: [23, 31], kiem: -170, tayS: [15, 30], vx: 6, kiemSau: true, gio: -45 }),
  F('lướt – áo choàng bay thẳng', 1, { y: 1, than: -24, hong: 3, chanT: [20, 41], chanS: [14, 41], giayT: -30, giayS: -40, tayT: [23, 31], kiem: -172, tayS: [14, 30], vx: 6, kiemSau: true, gio: -62 }),
  F('phanh – hạ chân xuống', 1, { y: 3, than: 5, chanT: [31, 43], chanS: [18, 43], tayT: [27, 32], kiem: -150, tayS: [15, 30], vx: 1, kiemSau: true, hieuUng: { bui: [31, 3] } })
]};
A.attack2 = { loop: false, label: 'Attack 2', frames: [
  F('kiếm thấp phía trước (từ nhát 1)', 1, X(BUOC, { y: 1, than: -3, tayT: [30, 34], kiem: -25, tayS: [20, 31] })),
  F('hạ kiếm xuống dưới chéo ra sau', 1, X(BUOC, { y: 2, than: -6, tayT: [23, 35], kiem: -150, tayS: [24, 31] })),
  F('dồn lực – kiếm chéo sát đất', 2, X(BUOC, { y: 3, than: -12, tayT: [20, 36], kiem: -164, tayS: [26, 31] })),
  F('vung chéo lên – kiếm quét qua trước', 1, X(BUOC, { y: 2, than: -6, tayT: [27, 32], kiem: -70, tayS: [20, 31], hieuUng: { vet: -164 } })),
  F('chém chéo lên – HIT', 2, X(BUOC, { y: 0, than: 3, dau: 2, tayT: [31, 24], kiem: 45, tayS: [16, 30], hieuUng: { vet: -150, day: 1 } }), true),
  F('theo đà – kiếm vút lên cao', 1, X(BUOC, { y: 0, than: 5, tayT: [30, 19], kiem: 85, tayS: [16, 31], hieuUng: { vet: 20 } }), false, true),
  F('kiếm trên cao (nối nhát 3)', 1, X(BUOC, { y: 0, than: 6, tayT: [28, 17], kiem: 110, tayS: [18, 31] }), false, true)
]};
A.attack3 = { loop: false, label: 'Attack 3', frames: [
  F('kiếm trên cao (từ nhát 2)', 1, X(BUOC, { y: 0, than: 6, tayT: [28, 17], kiem: 110, tayS: [18, 31] })),
  F('giơ kiếm qua đầu – ngả ra sau', 1, X(BUOC, { y: 0, than: 10, tayT: [24, 16], kiem: 150, tayS: [27, 28] })),
  F('vươn kiếm ra sau – nén lực tối đa', 3, X(BUOC, { y: 1, than: 14, tayT: [21, 17], kiem: 172, tayS: [30, 27], gio: -6, kiemSau: true })),
  F('bổ xuống – kiếm qua đỉnh đầu', 1, X(BUOC, { y: 0, than: 0, tayT: [30, 15], kiem: 75, tayS: [24, 30], hieuUng: { vet: 172 } })),
  F('bổ thẳng xuống trước mặt – HIT', 3, { y: 3, than: -16, dau: 4, tayT: [33, 30], kiem: -50, tayS: [17, 32], chanT: [32, 43], chanS: [17, 43], hieuUng: { vet: 168, day: 1, bui: [38, 3] } }, true),
  F('đè nặng – kiếm ghim sát đất', 1, { y: 4, than: -18, dau: 4, tayT: [33, 33], kiem: -72, tayS: [17, 33], chanT: [32, 43], chanS: [17, 43] }, false, true),
  F('rút kiếm lên – thở dốc', 1, X(BUOC, { y: 2, than: -9, tayT: [31, 32], kiem: -45, tayS: [18, 32] })),
  F('đứng dậy – thu kiếm', 1, X(BUOC, { y: 1, than: -3, tayT: [31, 31], kiem: 0, tayS: [20, 31] })),
  F('thủ thế', 1, THU)
]};
A.airAttack = { loop: false, label: 'Air Attack', frames: [
  F('lơ lửng – co chân, kéo kiếm ra sau', 1, X(CO, { y: -2, than: 5, tayT: [22, 24], kiem: 160, tayS: [24, 28] })),
  F('giơ kiếm qua đầu trên không', 1, X(CO, { y: -2, than: 8, tayT: [26, 15], kiem: 120, tayS: [22, 29] })),
  F('chém vòng xuống trước – HIT', 2, X(CO, { y: -2, than: -12, tayT: [33, 27], kiem: -20, tayS: [16, 28], hieuUng: { vet: 125, day: 1 } }), true),
  F('theo đà – kiếm chĩa xuống trước', 1, X(CO, { y: -2, than: -10, tayT: [32, 31], kiem: -45, tayS: [16, 29], hieuUng: { vet: 10 } })),
  F('thu kiếm – vẫn co chân', 1, X(CO, { y: -2, than: -5, tayT: [30, 30], kiem: -20, tayS: [17, 28] })),
  F('duỗi chân – chuyển sang rơi', 1, X(DUOI, { y: -2, tayT: [31, 28], kiem: 10, tayS: [16, 26], vy: 2 }))
]};
A.downStrike = { loop: false, label: 'Down Strike', frames: [
  F('co người trên không – xoay mũi kiếm xuống', 1, X(CO, { y: -2, than: -5, tayT: [29, 30], kiem: -60, tayS: [18, 27] })),
  F('đâm thẳng xuống dưới chân – HIT', 2, X(CO, { y: -2, than: -4, tayT: [27, 31], kiem: -90, tayS: [17, 26], hieuUng: { vet: -50, r: 15 } }), true),
  F('mũi kiếm chạm – nảy bật lên', 1, X(CO, { y: -2, than: -2, tayT: [27, 30], kiem: -90, tayS: [16, 25], hieuUng: { tia: [27, 45, 3] } })),
  F('bật lên – rút kiếm ngang', 1, X(DUOI, { y: -2, than: 2, tayT: [31, 27], kiem: 0, tayS: [16, 24], vy: -3 })),
  F('duỗi người – chuẩn bị rơi', 1, X(DUOI, { y: -2, tayT: [32, 27], kiem: 15, tayS: [15, 25], vy: 1 }))
]};
A.upSlash = { loop: false, label: 'Up Slash', frames: [
  F('hạ thấp – kiếm chéo sau sát đất', 1, X(BUOC, { y: 2, than: -8, tayT: [22, 35], kiem: -150, kiemSau: true, tayS: [25, 31] })),
  F('nhún gối – dồn lực hất', 2, X(BUOC, { y: 4, than: -12, tayT: [21, 37], kiem: -162, kiemSau: true, tayS: [26, 33] })),
  F('hất kiếm lên – kiếm quét qua trước', 1, X(BUOC, { y: 1, than: -2, tayT: [29, 30], kiem: -40, tayS: [21, 31], hieuUng: { vet: -162 } })),
  F('hất thẳng lên cao – HIT', 2, { y: -1, than: 6, tayT: [29, 15], kiem: 92, tayS: [17, 30], chanT: [28, 43], chanS: [19, 43], giayT: -10, hieuUng: { vet: -110, day: 1 } }, true),
  F('theo đà – kiếm trên đầu', 1, X(BUOC, { y: 0, than: 5, tayT: [27, 16], kiem: 115, tayS: [18, 31] })),
  F('hạ kiếm – thủ thế', 1, THU)
]};
A.parry = { loop: false, label: 'Ngân (Parry)', frames: [
  F('nâng kiếm lên chắn', 1, X(BUOC, { y: 1, than: 2, tayT: [31, 27], kiem: 100, tayS: [21, 31] })),
  F('đỡ thành công – kiếm chéo trước mặt, chuông ngân', 2, X(BUOC, { y: 2, than: 5, tayT: [31, 25], kiem: 115, tayS: [20, 31], lacChuong: 45, hieuUng: { tia: [28, 17, 4] } })),
  F('dư chấn – chuông lắc ngược', 1, X(BUOC, { y: 1, than: 3, tayT: [31, 26], kiem: 108, tayS: [20, 31], lacChuong: -40 })),
  F('chuông lắc nhẹ – hạ kiếm', 1, X(BUOC, { y: 1, tayT: [31, 29], kiem: 60, tayS: [20, 31], lacChuong: 18 })),
  F('về thủ thế', 1, THU)
]};
var TU = { y: 3, than: 8, tayT: [20, 31], kiem: -168, tayS: [27, 31], kiemSau: true, chanT: [30, 43], chanS: [17, 43] };
A.chargeAttack = { loop: false, label: 'Charge', frames: [
  F('kéo kiếm ra sau – bắt đầu tụ lực', 1, X(TU, { y: 2, than: 6, tayT: [21, 30], kiem: -165 })),
  F('tụ lực – rung 1', 2, X(TU, { hieuUng: { tuLuc: 0 } })),
  F('tụ lực – rung 2', 2, X(TU, { x: 1, hieuUng: { tuLuc: 1 } })),
  F('tụ lực – rung 3, giữ hơi', 3, X(TU, { y: 4, hieuUng: { tuLuc: 2 } })),
  F('bung lực – lao tới', 1, { x: 2, y: 1, than: -14, tayT: [30, 28], kiem: 10, tayS: [15, 30], chanT: [32, 43], chanS: [17, 43], vx: 4, hieuUng: { vet: -160, det: 0.5 } }),
  F('bung chém – HIT', 2, { x: 2, y: 2, than: -16, dau: 4, tayT: [31, 29], kiem: 0, tayS: [14, 30], chanT: [33, 43], chanS: [18, 43], vx: 3, hieuUng: { vet: -170, det: 0.45, day: 1, bui: [34, 4] } }, true),
  F('theo đà – trượt chân', 1, { x: 2, y: 2, than: -10, tayT: [31, 32], kiem: -30, tayS: [15, 31], chanT: [33, 43], chanS: [19, 43], vx: 1, hieuUng: { bui: [36, 3] } }),
  F('thu kiếm – thủ thế', 1, X(THU, { x: 1 }))
]};
var NGAN = { chuongTay: true, tayTruoc: true, tayT: [30, 33], kiem: 15 };
A.echoCast = { loop: false, label: 'Echo Cast', frames: [
  F('giơ tay xa lên cao', 1, X(NGAN, { y: 1, than: 3, tayS: [26, 22] })),
  F('gõ nhẹ chuông – ghi tiếng vọng', 2, X(NGAN, { y: 0, than: 4, dau: 4, tayS: [29, 17], hieuUng: { sang: true, song: [6] } })),
  F('tiếng vọng lan ra', 2, X(NGAN, { y: 0, than: 4, dau: 4, tayS: [29, 17], hieuUng: { sang: true, song: [11, 7] } })),
  F('hạ tay – về thủ thế', 1, X(NGAN, { y: 1, tayS: [23, 28], tayTruoc: false }))
]};
var QUY = { y: 7, than: -6, chanT: [30, 43], chanS: [12, 44], giayS: -70, tayT: [31, 31], kiem: -88 };
A.heal = { loop: false, label: 'Heal', frames: [
  F('lùi chân – hạ người', 1, { y: 2, than: -5, chanT: [29, 43], chanS: [16, 43], tayT: [30, 32], kiem: -30, tayS: [19, 33] }),
  F('quỳ một gối – chống kiếm', 1, X(QUY, { tayS: [22, 37] })),
  F('ôm chuông – hồi máu', 3, X(QUY, { chuongTay: true, tayTruoc: true, tayS: [25, 31], dau: -4, hieuUng: { sang: true, hoi: 0 } })),
  F('ôm chuông – ánh sáng lan', 2, X(QUY, { chuongTay: true, tayTruoc: true, tayS: [25, 31], dau: -4, hieuUng: { sang: true, hoi: 0.5, song: [7] } })),
  F('chống kiếm đứng dậy', 1, { y: 4, than: -4, chanT: [30, 43], chanS: [16, 43], tayT: [31, 31], kiem: -86, tayS: [20, 34] }),
  F('đứng thẳng – hồi phục', 1, { kiem: 24 })
]};

var THU_TU = ['idle', 'run', 'jump', 'fall', 'attack', 'dodge', 'hit', 'death', 'land', 'crouch', 'slide', 'wallSlide', 'wallJump',
  'wallClimb', 'ladderClimb', 'ledgeGrab', 'dash', 'attack2', 'attack3', 'airAttack', 'downStrike', 'upSlash', 'parry', 'chargeAttack', 'echoCast', 'heal'];
var out = { thuTu: THU_TU, anims: A, combo: ['attack', 'attack2', 'attack3'], fps: 12 };
if (typeof module !== 'undefined' && module.exports) module.exports = out;
root.TV = root.TV || {}; root.TV.L48_ANIM = out;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
