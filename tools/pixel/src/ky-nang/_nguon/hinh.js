// hình vẽ tay dùng lại nhiều nơi
const cv = require('./cv');
const H = {
  dauRong: [ // đầu rồng nhìn phải (vật liệu j), miệng mở ra cột 12+
'..77..............',
'...7jj............',
'...jjjjj..........',
'..jjjjjjjj........',
'.jjj3jjjjjjj......',
'.jjjjjjjjjjjj.....',
'..jjjjjjjjjj......',
'..jjj^jjjj........',
'...jjjjjj.........',
  ],
  dauHo: [
'..................',
'..ff..........ff..',
'.fcff........ffcf.',
'.fcfff1ffff1fffcf.',
'..ffff11ff11ffff..',
'.1ffffffffffffff1.',
'.f1f*0ffffff0*f1f.',
'.ff1ffffccffff1ff.',
'.1fffccc11cccfff1.',
'.ffccccc11cccccff.',
'.ffcc1cccccc1ccff.',
'..fc1$$$$$$$$1cf..',
'..fc1c$$$$$$c1cf..',
'...fc1$$$$$$1cf...',
'....fc111111cf....',
'.....ffccccff.....',
'......ffffff......',
'..................',
  ],
  // tay nắm đấm giơ lên (3 rộng), cao n
  troi(c, x, y, n, mat = 'n') { c.rect(x, y, 3, 3, mat).p(x, y + 1, '-').p(x + 1, y + 1, '-'); c.rect(x + 0.5 | 0, y + 3, 2, n, mat); return c; },
};
module.exports = H;
