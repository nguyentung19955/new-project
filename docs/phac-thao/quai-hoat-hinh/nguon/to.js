// Các tờ ảnh động để duyệt. GIFS[tên]() trả về mô tả tờ; BANGS[tên]() trả về bảng khung hình tĩnh.
const GIFS = {}, BANGS = {};
(function () {
const PI = Math.PI, M = G.monsterArt;
const ids = (vung, loai) => M.list.filter(l => l.vung === vung && loai.indexOf(l.loai) >= 0).map(l => l.id);
// Các đoạn chuẩn của một tờ quái thường + tinh anh.
function doanQuai(them) { const D = [
  { ten: 'Xuất hiện', anims: ['spawn'], nghi: .6 }, { ten: 'Đứng thở', anims: ['idle'], giay: 2.4, nghi: 0 }, { ten: 'Di chuyển', anims: ['move'], giay: 2.4, nghi: 0 },
  { ten: 'Báo trước rồi ra đòn: hướng trái', anims: ['tele', 'atk'], dir: PI, nghi: .4 }, { ten: 'Báo trước rồi ra đòn: chéo xuống phải', anims: ['tele', 'atk'], dir: PI / 4, nghi: .4 }, { ten: 'Báo trước rồi ra đòn: hướng lên', anims: ['tele', 'atk'], dir: -PI / 2, face: -1, nghi: .4 },
  { ten: 'Trúng đòn', anims: ['hit', 'hit'], nghi: .3 }];
  for (const t of (them || [])) D.push(t); D.push({ ten: 'Chết', anims: ['die'], nghi: .5 }); return D; }
function toVung(vung, ten, mauNen) { const o = ids(vung, ['thuong', 'tinhanh']).map(id => ({ id }));
  return { tieuDe: ten, cols: 5, cw: 104, ch: 92, s: 3, day: 30, lech: 10, beX: 13, mauNen, o, doan: doanQuai([{ ten: 'Chiêu riêng của tinh anh (hai con cuối)', anims: ['chieu1'], dir: PI * .8, nghi: .5 }]) }; }
GIFS['quai-bien'] = () => toVung('bien', 'Hang biển: quái thường và tinh anh', '#18222e');
GIFS['quai-rung'] = () => toVung('rung', 'Rừng già: quái thường và tinh anh', '#172218');
GIFS['quai-lau-dai'] = () => toVung('laudai', 'Lâu đài cổ: quái thường và tinh anh', '#241a1a');
const bangVung = (vung, ten) => () => XEM.bangQuai(ids(vung, ['thuong', 'tinhanh']), ten + ': mỗi cử động ba khung hình', { cw: 78, ch: 70, s: 2, day: 20 });
BANGS['quai-bien'] = bangVung('bien', 'Hang biển'); BANGS['quai-rung'] = bangVung('rung', 'Rừng già'); BANGS['quai-lau-dai'] = bangVung('laudai', 'Lâu đài cổ');
})();
