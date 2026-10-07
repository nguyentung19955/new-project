const cv = require('../cv'), M = require('../mau');
const I = [];
const add = (ma, el, y, mota, g, o = {}) => I.push({ ma, el, y, mota, g: Array.isArray(g) ? g : g.rows(), ...o });

// ---- Lý Ngư Tướng Quân (Thủy)
add('lyngu_q', 'thuy', 'đinh ba bạc cán vàng đâm vọt lên từ sóng Vũ Môn', 'Đâm quái nhiều máu nhất x4', [
'..77....77....77..',
'..MM....MM....MM..',
'..MM...MMMM...MM..',
'..MM...MMMM...MM..',
'..MMM...MM...MMM..',
'...MMMMMMMMMMMM...',
'....MMMMMMMMMM....',
'.......gggg.......',
'........gg........',
'........gg........',
'........gg........',
'........gg........',
'........gg........',
'..5.....gg.....5..',
'.WWW....gg....WWW.',
'WWwwW..WggW..Wwwww',
'wwwwwwwwwwwwwwwwww',
'wwwwwwwwwwwwwwwwww',
]);
{ const c = cv();
  const S = [[5,3],[11,3],[2,7],[8,7],[14,7],[5,11],[11,11],[8,14]];
  S.forEach(([x,y]) => c.disc(x, y, 3.4, 'g'));
  S.forEach(([x,y]) => { c.arc(x, y, 3.4, 15, 165, ','); c.p(x - 1, y - 1, '4'); c.p(x, y - 1, '4'); });
  c.rect(0,0,18,1,'.'); c.stamp(['.8.','838','.8.'], 14, 0);
  add('lyngu_w', 'thuy', 'mảng vảy cá chép vàng xếp lớp + tia chí mạng đỏ', '+chí mạng, +sát thương chí mạng', c); }
{ const c = cv();
  c.poly([[9,13],[1,2],[5,2],[9,7],[13,2],[17,2]], 'g');
  c.line(9,12,3,3,',').line(9,12,15,3,',').line(9,12,9,8,',');
  c.ell(9,15,3,2.5,'g');
  c.rect(0,15,18,3,'w'); c.stamp(['W....5....5....W..','WWW..WW..WW...WWW.'],0,14);
  c.p(1,8,'5').p(16,7,'5').p(2,11,'5').p(15,11,'5').p(0,6,'6').p(17,5,'6');
  add('lyngu_e', 'thuy', 'đuôi cá chép vàng quẫy tung bọt nước', 'Quẫy nước làm chậm quái', c); }
add('lyngu_r', 'thuy', 'cá chép mình vàng hoá đầu rồng ngọc phun dải nước', 'Hoá rồng phun nước một dải x5', [
'..77..............',
'...7jj............',
'...jjjjj..........',
'..jjjjjjjj........',
'.jjj3jjjjjjj......',
'.jjjjjjjjjjjj55...',
'..jjjjjjjjjjWWWWW6',
'..jjj^jjjj..WWWWW6',
'...jjjjjj.....5555',
'....ggggg.........',
'....g4ggggg.......',
'.....ggg,ggg......',
'......gggg,gg.....',
'.......ggggggg....',
'.........gggggg...',
'..........,gg,gg..',
'.........gg..g.gg.',
'........gg......g.',
]);

// ---- Trương Chi (Thủy)
{ const c = cv();
  c.line(3,16,15,4,'a',2); c.line(3,16,15,4,'?');
  [[6,13],[9,10],[12,7]].forEach(([x,y]) => c.p(x,y,'1'));
  [[5,14],[11,8]].forEach(([x,y]) => c.p(x,y,'<'));
  c.stamp(['..@@','..@.','..@.','@@@.','@@..'], 2, 1);
  c.stamp(['.@@@','.@.@','.@.@','@@@@','@.@@'], 12, 11);
  add('truongchi_q', 'thuy', 'ống sáo trúc chéo, nốt nhạc trắng bay ra', 'Tiếng sáo làm quái đứng mê', c); }
{ const c = cv();
  c.stamp(['....@@@@@@@','....@@@@@@@','....@.....@','....@.....@','....@.....@','..@@@...@@@','.@@@@..@@@@','.@@@...@@@.'], 2, 1);
  c.rect(0,12,18,6,'w'); c.stamp(['WW....WWW....WW...','..WWWW...WWWW..WWW'], 0, 11);
  c.stamp(['.5.','5.5'], 13, 9).stamp(['5'], 3, 10);
  add('truongchi_w', 'thuy', 'cặp nốt nhạc ngân trên mặt sông gợn sóng', '+sức mạnh kỹ năng', c); }
{ const c = cv();
  c.rect(0,13,18,5,'w');
  [[1,2,9],[5,5,11],[2,8,12],[6,11,9]].forEach(([x,y,w]) => c.rect(x, y, w, 2, 'c'));
  c.stamp(['..6....6...','.6.6..6.6..'], 3, 13);
  c.p(14,2,'W').p(15,3,'W').p(14,4,'W').p(13,3,'W').p(14,3,'6');
  add('truongchi_e', 'thuy', 'dải sương lạnh trắng trôi trên mặt sông + tinh thể băng', 'Sương lạnh làm chậm, đóng băng', c); }
{ const c = cv();
  c.disc(9,9,8.6,'h'); c.arc(9,9,7.5,200,60,'W'); c.arc(9,9,5.5,20,240,'w'); c.arc(9,9,3.5,200,60,'5');
  c.stamp(['...@@','...@.','...@.','.@@@.','@@@@.','.@@..'], 6, 6);
  add('truongchi_r', 'thuy', 'nốt nhạc giữa xoáy nước cuốn ngược', 'Tiếng hát cuốn ngược quái, chậm 50%', c); }

// ---- Vua Lửa Pơtao Apui (Hỏa)
add('potaoapui_q', 'hoa', 'thanh gươm thần sắt chuôi đồng bốc lửa, chém chéo', 'Chém quái nhiều máu nhất x4', [
'..............3+..',
'.............3MM+.',
'............3MM7+.',
'...........3MM7+..',
'..........3MM7+...',
'.........3MM7+....',
'........3MM7+.....',
'.......3MM7+......',
'......3MM7+.......',
'..bb.3MM7+........',
'..bbbMM7+.........',
'...bbbb+..........',
'....bbb...........',
'...bbbbb..........',
'..gg..bbb.........',
'.gg....bb.........',
'.g................',
'..................',
]);
{ const c = cv();
  c.poly([[4,17],[5,8],[7,6],[11,6],[13,8],[14,17]], 's');
  M.lua(c, 9, 7, 7, 5);
  c.stamp(['..8..','.8.8.','8.$.8','.8.8.','..8..'], 7, 9);
  c.rect(2,16,14,2,'e');
  add('potaoapui_w', 'hoa', 'bia đá thề khắc dấu son, lửa núi cháy trên đỉnh', '+sát thương, +máu', c); }
{ const c = null;
}
{ const c = cv();
  c.ring(9, 9, 7.5, 'f', 3); c.ring(9, 9, 6, 'F', 1);
  for (let a = 0; a < 12; a++) { const t = a * Math.PI / 6; c.p(9 + Math.cos(t) * 8.5, 9 + Math.sin(t) * 8.5, '3'); }
  c.disc(9, 9, 2, '8'); c.p(9,9,'3');
  add('potaoapui_e', 'hoa', 'vòng lửa tròn bùng quanh tâm', 'Vòng lửa quanh mình x4, đốt', c); }
{ const c = cv();
  c.poly([[0,18],[5,9],[8,8],[10,8],[13,9],[18,18]], 'e');
  c.rect(7,8,4,1,'f'); c.poly([[6,8],[7,4],[9,2],[11,4],[12,8]], 'f'); c.poly([[8,8],[9,4],[10,8]], 'F');
  c.line(8,10,6,17,'+').line(10,10,12,17,'+').line(9,10,9,14,'3');
  c.disc(3,3,1.5,'f').p(3,3,'3').disc(15,2,1.5,'f').p(15,2,'3').disc(14,6,1,'f');
  add('potaoapui_r', 'hoa', 'núi lửa phun, dung nham chảy, đá lửa văng', 'Đá lửa rơi x5', c); }

// ---- Bà Hỏa (Hỏa)
{ const c = cv(); M.lua(c, 9, 16, 13, 9); c.p(9,14,'2').p(9,13,'4');
  add('baahoa_q', 'hoa', 'một ngọn lửa đơn cao vút', 'Cột lửa thiêu quái x1.8', c); }
{ const c = cv(); M.lua(c, 4, 16, 8, 5); M.lua(c, 9, 16, 11, 6); M.lua(c, 14, 16, 7, 5);
  c.rect(0,16,18,2,'e'); c.p(2,17,'+').p(8,17,'+').p(15,17,'+');
  c.p(16,4,'3').p(2,5,'3').p(13,2,'+');
  add('baahoa_w', 'hoa', 'lửa bén lan thành ba ngọn trên đất + tàn lửa', 'Quái trúng nổ bị đốt', c); }
{ const c = cv();
  c.disc(6,10,4.5,'x').disc(11,7,5,'x').disc(13,12,4,'x').disc(8,13,4,'x');
  c.p(4,8,'>').p(9,4,'>').p(10,5,'>').p(5,9,'>');
  c.stamp(['..+.','.+3+','..+.'], 1, 14);
  add('baahoa_e', 'hoa', 'đám khói đen cuồn cuộn, đốm lửa le lói', 'Khói làm chậm, câm lặng', c); }
{ const c = cv();
  for (let i = 0; i < 4; i++) M.lua(c, 2 + i * 4.6, 13, 9 + (i % 2) * 3, 5);
  M.lua(c, 4.5, 16, 7, 4); M.lua(c, 13.5, 16, 7, 4); M.lua(c, 9, 17, 6, 4);
  c.rect(0,16,18,2,'f');
  add('baahoa_r', 'hoa', 'biển lửa: hàng lửa dày phủ kín ô', 'Biển lửa trong tầm, thiêu 4s', c); }

// ---- Thần Trống Đồng (Kim)
{ const c = cv();
  c.ell(9, 13, 8, 3.5, 'b'); c.rect(1,13,17,4,'b'); c.ell(9,17,8,1.2,'b');
  c.ell(9, 12, 7.5, 2.8, 'g'); c.ell(9,12,2,1,'*'); c.p(9,12,'4');
  c.line(14,1,10,9,'e',2); c.ell(9.5,10,1.8,1.2,'e');
  c.stamp(['6.....6','.6...6.'], 2, 7);
  c.rect(2,15,14,1,',');
  add('trongdong_q', 'kim', 'dùi gỗ gõ xuống mặt trống đồng, tiếng vang', 'Tướng quanh +26% tốc đánh', c); }
{ const c = cv();
  c.ring(9,9,8,'7'); c.ring(9,9,5.5,'>'); c.ring(9,9,3,'7');
  c.disc(9,9,1.2,'g');
  c.rect(0,8,1,3,'.').rect(17,8,1,3,'.');
  add('trongdong_w', 'kim', 'các vòng âm vang lan toả từ tâm đồng', '5% choáng mỗi đòn', c, { vien: false }); }
{ const c = cv(); c.disc(9,9,8.5,'b'); c.ring(9,9,7,','); c.ring(9,9,5,',');
  for (let a = 0; a < 16; a++) { const t = a * Math.PI / 8; c.p(9 + Math.cos(t) * 6, 9 + Math.sin(t) * 6, '&'); }
  c.disc(9,9,3.6,'1');
  for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; c.line(9, 9, 9 + Math.cos(t) * 3.6, 9 + Math.sin(t) * 3.6, '4'); }
  c.p(9,9,'2');
  add('trongdong_e', 'kim', 'mặt trống đồng Đông Sơn: ngôi sao mặt trời nhiều cánh giữa các vành hoa văn', 'Chém lan 32%', c); }
{ const c = cv();
  c.ell(9, 13, 8, 3.5, 'b'); c.rect(1,13,17,4,'b'); c.ell(9,17,8,1.2,'b');
  c.ell(9, 12, 7.5, 2.8, 'g'); c.ell(9,12,2,1,'*');
  c.rect(2,15,14,1,',');
  M.set(c, [[11,0],[7,4],[11,5],[8,10]], '4', 1); M.set(c, [[12,0],[8,4],[12,5],[9,10]], '2', 1);
  c.p(3,6,'7').p(15,6,'7').p(2,8,'>').p(16,8,'>');
  add('trongdong_r', 'kim', 'tia sét giáng xuống trống đồng, chấn động', 'Trống sấm choáng mọi quái quanh', c); }

module.exports = { lo: 'Lô 28', icons: I };
