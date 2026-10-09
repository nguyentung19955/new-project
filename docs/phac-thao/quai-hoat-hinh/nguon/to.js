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
function toVung(vung, ten, mauNen) { const o = ids(vung, ['thuong', 'tinhanh']).map(id => ({ id, to: M._defs[id].loai === 'tinhanh' }));
  return { tieuDe: ten, cols: 4, cw: 104, ch: 92, colsTo: 2, chTo: 136, s: 3, day: 30, lech: 10, beX: 13, mauNen, o, doan: doanQuai([{ ten: 'Chiêu riêng của tinh anh (hai con cuối)', anims: ['chieu1'], dir: PI * .8, nghi: .5 }]) }; }
GIFS['quai-bien'] = () => toVung('bien', 'Hang biển: quái thường và tinh anh', '#18222e');
GIFS['quai-rung'] = () => toVung('rung', 'Rừng già: quái thường và tinh anh', '#172218');
GIFS['quai-lau-dai'] = () => toVung('laudai', 'Lâu đài cổ: quái thường và tinh anh', '#241a1a');
GIFS['trum-nho'] = () => ({ tieuDe: 'Ba trùm nhỏ', cols: 3, cw: 200, ch: 160, s: 3, day: 44, lech: 22, beX: 14, mauNen: '#1c1a24', nhanO: true, o: ids('bien', ['trumnho']).concat(ids('rung', ['trumnho']), ids('laudai', ['trumnho'])).map(id => ({ id })),
  doan: doanQuai([{ ten: 'Chiêu 1', anims: ['chieu1'], dir: PI * .85, nghi: .5 }, { ten: 'Chiêu 2', anims: ['chieu2'], dir: PI * 1.1, nghi: .5 }]) });
BANGS['trum-nho'] = () => XEM.bangQuai(['cuaDa', 'namChua', 'hoLua'], 'Ba trùm nhỏ: mỗi cử động ba khung hình', { cw: 150, ch: 120, s: 2, day: 30, k: 3 });
// Tờ trùm vùng: ba ô cạnh nhau là pha 1, pha 2, pha 3 cùng làm một cử động. Đòn hướng về bé (bên trái, chếch xuống).
function toTrum(id, ten, cw, ch, day, mauNen, phan) { const d = M._defs[id], hu = i => i % 2 ? PI * .85 : PI * 1.12, D = [{ ten: 'Ra mắt', anims: ['intro'], nghi: .5 }, { ten: 'Pha 1 · Đứng thở', anims: ['idle'], giay: 2.4, nghi: 0 }, { ten: 'Pha 1 · Di chuyển', anims: ['move'], giay: 2.2, nghi: 0 }];
  for (let i = 1; i <= 5; i++) D.push({ ten: 'Pha 1 · ' + d.anims['c' + i].nhan, anims: ['c' + i], dir: hu(i), nghi: .35 });
  D.push({ ten: 'Trúng đòn', anims: ['hit', 'hit'], nghi: .3 }, { ten: d.anims.phase2.nhan, anims: ['phase2'], nghi: .4, phase: 1 }, { ten: 'Pha 2 · Đứng thở', anims: ['idle'], giay: 1.6, nghi: 0, phase: 2 });
  for (const i of [1, 3, 5]) D.push({ ten: 'Pha 2 · ' + d.anims['c' + i].nhan, anims: ['c' + i], dir: hu(i), nghi: .3, phase: 2 });
  D.push({ ten: d.anims.phase3.nhan, anims: ['phase3'], nghi: .4, phase: 2 }, { ten: 'Pha 3 · Đứng thở', anims: ['idle'], giay: 1.6, nghi: 0, phase: 3 });
  for (const i of [2, 4]) D.push({ ten: 'Pha 3 · ' + d.anims['c' + i].nhan, anims: ['c' + i], dir: hu(i), nghi: .3, phase: 3 });
  D.push({ ten: 'Pha 3 · Choáng', anims: ['stun'], giay: 1.8, nghi: 0, phase: 3 }, { ten: 'Chết hoành tráng', anims: ['die'], nghi: .6, phase: 3 });
  // phan = 1: chỉ pha 1 (ra mắt, thở, đi, 5 chiêu, trúng đòn, chết); phan = 2: chuyển pha, pha 2, pha 3, choáng.
  let DD = D; if (phan === 1) DD = D.filter(x => !x.phase || x.ten === 'Chết hoành tráng'); if (phan === 2) DD = D.filter(x => x.phase && x.ten !== 'Chết hoành tráng');
  return { tieuDe: ten + (phan === 1 ? ' · pha 1' : phan === 2 ? ' · chuyển pha, pha 2, pha 3' : ''), cols: 1, cw, ch, s: 2, day, beX: 12, mauNen, nhanO: false, coChu: 15, o: [{ id, nhan: 'Mỗi chiêu: báo trước (vùng đỏ) → ra đòn → dư âm', x: Math.round(cw * .62) }], doan: DD }; }
GIFS['ngu-tinh'] = () => toTrum('nguTinh', 'Ngư Tinh', 330, 250, 70, '#18222e');
GIFS['moc-tinh'] = () => toTrum('mocTinh', 'Mộc Tinh', 330, 270, 60, '#172218');
GIFS['ho-tinh'] = () => toTrum('hoTinh', 'Hồ Tinh', 380, 270, 54, '#241a1a', 1);
GIFS['ho-tinh-pha'] = () => toTrum('hoTinh', 'Hồ Tinh', 380, 270, 54, '#241a1a', 2);
const bangTrum = (id, ten) => () => XEM.bang({ tieuDe: ten + ': mỗi cử động bốn khung hình (pha 1; hai hàng cuối là pha 2 và pha 3)', s: 2, cw: 340, ch: 280, day: 62, le: 200, rows: ['intro', 'idle', 'move', 'c1', 'c2', 'c3', 'c4', 'c5', 'phase2', 'phase3', 'stun', 'die'].map(a => { const an = M._defs[id].anims[a]; return { ten: an.nhan, o: [0, 1, 2, 3].map(i => ({ id, anim: a, t: an.d * (an.lap ? i / 4 : (i + .5) / 4), dir: PI * .85, phase: 1 })) }; }).concat([2, 3].map(p => ({ ten: 'Pha ' + p + ': thở, chiêu 1, 3, 5', o: [['idle', .3], ['c1', .55], ['c3', .55], ['c5', .6]].map(([a, f]) => ({ id, anim: a, t: M._defs[id].anims[a].d * f, dir: PI * .85, phase: p })) }))) });
BANGS['ngu-tinh'] = bangTrum('nguTinh', 'Ngư Tinh'); BANGS['moc-tinh'] = bangTrum('mocTinh', 'Mộc Tinh'); BANGS['ho-tinh'] = bangTrum('hoTinh', 'Hồ Tinh');
// Tờ tám hướng: cùng một đòn đánh theo 8 hướng (kể cả chéo). Hình quái chỉ lật trái/phải; vùng báo trước, vệt chém, đạn, lửa xoay theo góc.
GIFS['tam-huong'] = () => { const TEN = ['phải', 'chéo xuống phải', 'xuống', 'chéo xuống trái', 'trái', 'chéo lên trái', 'lên', 'chéo lên phải'], o = [];
  for (const id of ['cua', 'hoaBaoTu', 'chonBong']) for (let k = 0; k < 8; k++) o.push({ id, dir: k * PI / 4, nhan: M._defs[id].ten + ' · ' + TEN[k], x: 60, y: 62 });
  for (let k = 0; k < 8; k++) o.push({ id: 'hoLua', to: true, dir: k * PI / 4, nhan: 'Hổ Lửa phun lửa · ' + TEN[k], x: 120, y: 112 });
  return { tieuDe: 'Tám hướng: quái chỉ lật trái/phải, còn đòn đánh xoay theo góc bất kỳ', cols: 8, cw: 120, ch: 116, colsTo: 4, chTo: 210, s: 2, be: false, coChu: 12, mauNen: '#1c1a24', o,
    doan: [{ ten: 'Báo trước rồi ra đòn (Hổ Lửa: gầm phun lửa)', anims: ['tele', 'atk'], rieng: { hoLua: ['chieu2'] }, nghi: .5 }, { ten: 'Lặp lại', anims: ['tele', 'atk'], rieng: { hoLua: ['chieu2'] }, nghi: .5 }] }; };
BANGS['tam-huong'] = () => XEM.bang({ tieuDe: 'Tám hướng: giữa lúc ra đòn (trái sang phải: phải, chéo xuống phải, xuống, chéo xuống trái, trái, chéo lên trái, lên, chéo lên phải)', s: 2, cw: 130, ch: 130, day: 62, le: 160,
  rows: [['cua', 'atk', .3], ['caChuon', 'atk', .35], ['hoaBaoTu', 'atk', .45], ['socNo', 'atk', .4], ['meoDen', 'atk', .3], ['cuaTuong', 'chieu1', .62], ['hoLua', 'chieu2', .7]].map(([id, a, f]) => ({ ten: M._defs[id].ten, cw: id === 'hoLua' ? 250 : 130, ch: id === 'hoLua' ? 230 : 130, day: id === 'hoLua' ? 112 : 62, o: [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({ id, anim: a, t: M._defs[id].anims[a].d * f, dir: k * PI / 4 })) })) });
const bangVung = (vung, ten) => () => XEM.bangQuai(ids(vung, ['thuong', 'tinhanh']), ten + ': mỗi cử động ba khung hình', { cw: 78, ch: 70, s: 2, day: 20 });
BANGS['quai-bien'] = bangVung('bien', 'Hang biển'); BANGS['quai-rung'] = bangVung('rung', 'Rừng già'); BANGS['quai-lau-dai'] = bangVung('laudai', 'Lâu đài cổ');
})();
