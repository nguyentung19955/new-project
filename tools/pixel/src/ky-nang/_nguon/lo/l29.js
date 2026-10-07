const cv = require('../cv'), M = require('../mau'), H = require('../hinh');
const I = [];
const add = (ma, el, y, mota, g, o = {}) => I.push({ ma, el, y, mota, g: Array.isArray(g) ? g : g.rows(), ...o });
const swapRows = (rows, map) => rows.map((r) => [...r].map((ch) => map[ch] || ch).join(''));

// ---- Ông Táo (Hỏa)
{ const c = cv();
  c.line(2,17,13,5,'m',2); c.line(6,17,14,6,'m',2);
  c.rect(1,15,3,2,'e'); c.rect(5,15,3,2,'e');
  c.disc(13,4,3.3,'f'); c.disc(12.5,3.5,1.6,'F'); c.p(12,3,'4');
  c.p(9,1,'3').p(16,9,'3').p(17,2,'+');
  add('ongtao_q', 'hoa', 'kẹp sắt dài gắp cục than hồng rực', 'Kẹp than x2.2, đốt mục tiêu', c); }
{ const c = cv();
  M.lua(c, 9, 12, 10, 7);
  c.ell(9,6,2.6,1.6,'e');
  c.ell(3.5,13,3.2,3.5,'e'); c.ell(14.5,13,3.2,3.5,'e'); c.ell(9,15,3.2,2.8,'e');
  c.p(2,11,"'").p(13,11,"'").p(8,13,"'");
  add('ongtao_w', 'hoa', 'ba ông đầu rau (ba hòn đất kê bếp) quây quanh ngọn lửa', '+sát thương', c); }
{ const c = cv();
  c.rect(3,5,12,9,'c');
  c.rect(1,4,3,11,'e'); c.rect(14,4,3,11,'e'); c.p(2,3,'<').p(2,15,'<').p(15,3,'<').p(15,15,'<');
  [6,8,10].forEach((y) => c.rect(5, y, 6, 1, '1')); c.rect(5,12,4,1,'1');
  c.rect(10,11,3,2,'$'); c.p(11,11,'8');
  c.stamp(['..4..','.444.','4.4.4','..4..'], 7, 0);
  c.stamp(['..2.','.2..'], 0, 15).stamp(['.2.','2.2'], 15, 15);
  add('ongtao_e', 'hoa', 'tờ sớ giấy dó hai trục gỗ, ấn son, mũi tên ánh sáng bay lên trời', 'Giáng đòn lên quái nhiều máu nhất x4', c); }
{ const c = cv().stamp(swapRows(H.dauRong, { j: 'r', 7: 'g', 3: '4', '^': '3' }));
  c.stamp(['FFFFF6','fFFFF3','.ffff3'], 12, 5); c.rect(16,5,2,1,'3').rect(17,5,1,3,'3');
  c.stamp([
'....ggggg.........',
'....g4ggggg.......',
'.....ggg,ggg......',
'......gggg,gg.....',
'.......ggggggg....',
'.........gggggg...',
'..........,gg,gg..',
'.........ff..f.ff.',
'........ff......f.'], 0, 9);
  add('ongtao_r', 'hoa', 'cá chép vàng hoá đầu rồng đỏ phun lửa', 'Rồng lửa phun một dải x5', c); }

// ---- Lạc Hầu (Thổ)
{ const c = cv();
  c.ell(9, 10, 6.5, 2.8, 'b'); c.rect(3,10,13,5,'b'); c.ell(9,15,6.5,1.4,'b');
  c.ell(9, 9, 6, 2.2, 'g'); c.ell(9,9,1.5,0.8,'*');
  c.rect(4,12,11,1,','); c.rect(3,15,2,2,'b'); c.rect(14,15,2,2,'b');
  c.arc(9,10,8,140,220,'4'); c.arc(9,10,8,320,40,'4'); c.arc(9,10,9.6,145,215,'?'); c.arc(9,10,9.6,325,35,'?');
  c.stamp(['..&..','.&.&.'], 7, 2);
  add('lachau_q', 'tho', 'trống đồng trận với vòng âm hiệu triệu hai bên', 'Tướng trong 180 +26% tốc đánh', c); }
{ const c = cv();
  c.poly([[3,4],[7,3],[9,5],[11,3],[15,4],[16,9],[14,16],[9,17],[4,16],[2,9]], 'e');
  c.line(9,6,9,16,'<'); c.rect(5,9,9,1,'<'); c.rect(5,13,9,1,'<');
  [[2,6],[1,10],[2,14],[16,6],[17,10],[16,14],[5,2],[13,2],[9,4]].forEach(([x,y]) => c.p(x,y,'7'));
  [[6,7],[12,7],[6,11],[12,11],[7,15],[11,15]].forEach(([x,y]) => c.p(x,y,'?'));
  add('lachau_w', 'tho', 'giáp da tê giác nâu với gai xương nhọn quanh viền', 'Bị đánh phản 32% sát thương', c); }
{ const c = cv();
  c.disc(11,9,6.5,'s'); c.arc(11,9,4,200,260,'>'); c.line(9,7,12,8,'1').line(13,11,14,13,'1');
  c.rect(0,16,18,2,'e');
  c.rect(0,5,3,1,'?').rect(1,8,3,1,'?').rect(0,11,3,1,'?');
  c.disc(3,15,1.5,'a').disc(5,14,1.2,'a').disc(16,15,1,'a');
  add('lachau_e', 'tho', 'tảng đá tròn lăn tung bụi, vệt gió phía sau', 'Lăn đá đè quái, đẩy lùi', c); }
{ const c = cv();
  c.disc(9,7,6,'g'); for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4 + 0.39; c.line(9,7,9 + Math.cos(t) * 8.5, 7 + Math.sin(t) * 8.5,'*'); }
  c.disc(9,7,3.5,'1'); c.disc(9,7,1.5,'4');
  H.troi(c, 2, 6, 9); H.troi(c, 7, 3, 12); H.troi(c, 12, 6, 9);
  add('lachau_r', 'tho', 'ba nắm tay giơ cao trước ngôi sao mặt trời trống đồng', 'Toàn quân giảm 30% sát thương nhận, hồi máu', c); }

// ---- Thần Săn Ba Vì (Mộc)
{ const c = cv();
  c.poly([[2,2],[9,5],[11,7],[9,9],[5,8]], 'M'); c.line(3,3,9,7,'7');
  c.line(10,8,15,13,'e',2); c.rect(14,13,3,3,'e'); c.p(15,14,'<');
  c.p(10,10,'L').p(10,11,'L').p(10,12,'9').p(7,10,'L').p(7,11,'9').p(4,9,'L').p(4,10,'L').p(4,12,'9');
  c.p(6,14,'L').p(6,15,'9').p(9,15,'9');
  add('thansan_q', 'moc', 'mũi phi đao sắt nhỏ giọt độc xanh', 'Phi đao vào quái xa nhất, độc + chậm', c); }
{ const c = cv();
  c.poly([[4,2],[11,2],[13,6],[12,11],[9,16],[8,11],[6,6]], 'c');
  c.line(5,3,8,10,'2');
  c.arc(8,2,6,180,360,'e'); c.rect(1,1,3,2,'e').rect(14,1,3,2,'e');
  c.p(10,16,'.').p(9,17,'.');
  add('thansan_w', 'moc', 'chiếc nanh hổ trắng ngà cong nhọn đeo dây', '+chí mạng, +tốc đánh', c); }
add('thansan_e', 'moc', 'đầu hổ Ba Vì gầm, nanh trắng, vằn đen', 'Hổ thần vồ 3 quái yếu máu nhất', H.dauHo);
{ const c = cv();
  c.line(2,16,15,3,'e',2); c.line(15,16,2,3,'e',2); c.poly([[14,1],[17,0],[16,4]], 'M'); c.poly([[3,1],[0,0],[1,4]], 'M');
  c.ell(9,10,5,3,'c'); c.poly([[4,10],[1,8],[1,13]], 'c'); c.ell(13,8,2,3,'c');
  c.rect(6,8,1,5,','); c.rect(10,8,1,5,',');
  c.disc(13,7,1,'1');
  add('thansan_r', 'moc', 'tù và sừng trâu trên hai ngọn giáo bắt chéo', 'Đánh dấu mọi quái, +25% sát thương', c); }

// ---- Thánh Gióng (Hỏa)
{ const c = cv();
  c.line(3,16,14,3,'a',3);
  [[5,13],[8,10],[11,6]].forEach(([x,y]) => { c.p(x-1,y,'<').p(x,y,'<').p(x+1,y,'<').p(x-1,y-1,'4').p(x,y-1,'4'); });
  c.poly([[13,3],[16,0],[17,1],[15,4]], 'L'); c.p(16,1,'9');
  c.arc(5,16,11,280,350,'3'); c.p(16,9,'3').p(17,11,'3');
  add('giong_q', 'hoa', 'gậy tre ngà vàng có đốt, quật thành vòng cung', 'Quật lan mọi quái, choáng', c); }
{ const c = cv();
  c.poly([[3,2],[7,4],[11,4],[15,2],[16,9],[14,16],[4,16],[2,9]], 'm');
  c.rect(4,7,10,1,'1'); c.rect(4,11,10,1,'1'); c.line(9,4,9,16,'1');
  [[5,5],[12,5],[5,9],[12,9],[5,13],[12,13]].forEach(([x,y]) => c.p(x,y,'7'));
  c.rect(7,2,4,2,'r'); c.p(8,2,'8');
  add('giong_w', 'hoa', 'tấm giáp ngực sắt đinh tán, cổ áo son', 'Giảm 23% sát thương nhận', c); }
{ const c = cv([
'.......m..........',
'......mmm.m.......',
'.....ffmmmmm......',
'....ffmmmmmmm.....',
'...ffmmmm3mmmm....',
'...ffmmmmmmmmmm...',
'..ffmmmmmmmmmmmm..',
'..ffmmmmmmmmmm1m..',
'..ffmmmmm..mmmmm..',
'.ffmmmmm.....mm...',
'.ffmmmmm..........',
'.ffmmmmmm.........',
'ffmmmmmmmm........',
'ffmmmmmmmmm.......',
'fmmmmmmmmmmm......',
'fmmmmmmmmmmmm.....',
'fmmmmmmmmmmmmm....',
'fmmmmmmmmmmmmmm...',
]);
  c.poly([[15,8],[18,9],[18,17],[14,17],[13,12]], 'f'); c.poly([[15,10],[17,11],[17,16],[15,15],[14,12]], 'F');
  c.line(4,14,12,14,'7'); c.p(9,4,'3').p(10,4,'8');
  add('giong_e', 'hoa', 'đầu ngựa sắt bờm lửa, miệng phun lửa', 'Vệt lửa dọc đường quái đi', c); }
{ const c = cv();
  c.rect(7,0,5,18,'4'); c.rect(8,0,3,18,'2');
  c.poly([[4,13],[7,9],[11,8],[14,5],[15,7],[13,10],[13,13],[10,13],[8,15],[5,15]], 'm');
  c.poly([[9,8],[10,4],[11,4],[12,8]], 'm'); c.p(10,3,'m');
  c.poly([[9,6],[5,5],[3,8],[8,8]], 'r');
  c.rect(0,15,6,3,'c'); c.rect(12,15,6,3,'c'); c.disc(3,15,2,'c'); c.disc(15,15,2,'c');
  add('giong_r', 'hoa', 'Gióng cưỡi ngựa sắt bay vút theo cột sáng lên trời, áo choàng đỏ, mây dưới chân', 'Bay dọc sông đánh mọi quái x4', c); }

// ---- Lạc Long Quân (Thủy)
{ const c = cv();
  [[0,0],[3,3],[6,6]].forEach(([dx,dy]) => { c.line(2+dx,9+dy,9+dx,1+dy,'5'); c.line(3+dx,9+dy,9+dx,2+dy,'W'); c.p(9+dx,1+dy,'6'); });
  c.rect(0,13,6,5,'.');
  c.stamp(['.jj.....','jjjj....','jjjjj...','.jjjjj..'], 0, 14);
  c.p(1,13,'7').p(3,12,'7').p(5,13,'7');
  add('llq_q', 'thuy', 'ba vệt vuốt nước chéo từ móng rồng ngọc', 'Cào hai đường vuốt nước', c); }
{ const c = cv();
  c.poly([[2,2],[16,2],[16,9],[9,17],[2,9]], 'j');
  const S = [[5,3],[9,3],[13,3],[3,7],[7,7],[11,7],[15,7],[5,11],[9,11],[13,11],[9,14]];
  S.forEach(([x,y]) => c.arc(x, y, 2.4, 20, 160, ';'));
  S.forEach(([x,y]) => c.p(x - 1, y, '^'));
  c.poly([[0,0],[18,0],[18,1],[0,1]], '.');
  add('llq_w', 'thuy', 'tấm khiên vảy rồng ngọc bích xếp lớp', 'Giảm 17% sát thương nhận, hồi máu', c); }
{ const c = cv();
  c.poly([[0,17],[0,10],[3,5],[7,2],[12,1],[16,3],[17,7],[15,9],[13,6],[10,6],[8,9],[9,12],[12,13],[18,14],[18,17]], 'w');
  c.arc(12,7,3.5,180,360,'W'); c.arc(12,7,4.5,190,300,'6');
  c.line(2,11,6,5,'W').line(1,15,4,10,'5');
  c.p(16,10,'6').p(17,12,'6').p(15,11,'5');
  add('llq_e', 'thuy', 'con sóng lớn cuộn đầu bọt trắng', 'Sóng lớn đẩy lùi quái', c); }
{ const c = cv().stamp(H.dauRong, 0, 1);
  c.rect(12,6,6,3,'W'); c.rect(12,7,6,1,'6');
  M.set(c, [[13,7],[15,5],[16,8],[17,6]], '4');
  c.stamp(['.....;;;;','...;;;...'], 0, 12).stamp(['..;;;;;..','.;;...;;;'], 9, 14);
  add('llq_r', 'thuy', 'đầu rồng ngọc phun dải nước có sét', 'Phun nước kèm sét một đường x5, choáng', c); }

module.exports = { lo: 'Lô 29', icons: I };
