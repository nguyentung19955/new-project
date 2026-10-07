// Rig tay cầm vũ khí cho ảnh đơn (tự cử động, js/tu-cu-dong.js) — chỉnh / xuất bằng tools/rig-tay.html.
// Mã → { hip: y đường hông, pivot: [x, y] vai, tip: [x, y] đầu vũ khí, poly: [[x, y], …] vùng tay (ảnh có hình trong đa giác), noArm: true }
// Toạ độ 0..1 theo ẢNH GỐC (assets/<mã>.png hoặc packs/<mã>/idle.png). Thiếu trường nào thì tự đoán trường đó từ ảnh.
const RIGS = {
  // mẫu docs/mau-vung-tay/mau-nv.png (theo docs/mau-vung-tay/chem.py)
  'mau-nv': { pivot: [0.6581, 0.4783], tip: [0.9861, 0.5704], poly: [[0.6549, 0.4427], [0.6967, 0.4427], [0.6967, 0.4337], [1, 0.4337], [1, 0.6952], [0.7181, 0.6952], [0.7181, 0.6298], [0.6549, 0.6298]] },
};
