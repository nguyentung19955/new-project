// Hướng 3: Linh khí làm chủ. Vũ khí sống, to quá khổ, mới là ngôi sao; hero là đứa trẻ tinh linh đeo mặt nạ.
(function () {
  // ---------- bốn đứa trẻ tinh linh (cao 18 điểm ảnh) ----------
  const EM_REN = [
    '......xx......',
    '....xxXXxx....',
    '...xXXXXXXx...',
    '..xXrrrrrrrx..',
    '..xWWWWWWWWW..',
    '..xWWWkWWWkW..',
    '..xWWWkWWWkW..',
    '..xWiWWWWWWi..',
    '...WWWWkkWW...',
    '....wWWWWw....',
    '...uttttttu...',
    '..utTTtttttu..',
    '..utTtttttttsS',
    '..urrrrrrrrusS',
    '...utTtttu....',
    '...uttuttu....',
    '...dd..dd.....',
    '..xxx.xxx.....',
  ];
  const EM_SAN = [
    '......LL......',
    '....jLLLLj....',
    '..jjlLLLLLljj.',
    '.jjjjjjjjjjjj.',
    '..xWWWWWWWWW..',
    '..xWWWkWWWkW..',
    '..xWWWkWWWkW..',
    '..xWgWWWWWWg..',
    '...WWWWkkWW...',
    '....wWWWWw....',
    '...hgggggh....',
    '..hgGGggggh...',
    '..hgGggggggsS.',
    '..hgGggggghsS.',
    '...hgGgggh....',
    '...hgghggh....',
    '...tt..tt.....',
    '..uuu.uuu.....',
  ];
  const EM_LANG = [
    '....dddddd....',
    '...dbBBBBbd...',
    '..dbBBBBBBbd..',
    '..dbWWWWWWWd..',
    '..dbWvvWWvvW..',
    '..dbWkWWWkWW..',
    '..dbWWWWWWWW..',
    '..dbwWWrrWWw..',
    '...dbwWWWWw...',
    '...dbbwWWw....',
    '...dbBbwwbd...',
    '..dbBBbbbbbd..',
    '..dbBbbbbbsS..',
    '..dbBbbbbbbd..',
    '..dbBbbbbbbd..',
    '..dbBbbbbbbd..',
    '.dbBBbbbbbbbd.',
    '.ddddddddddd..',
  ];
  const EM_DO = [
    '.....xxxxxx.....',
    '...mrrrrrrrrm...',
    'rrmRRRRRRRRRRm..',
    'r.xOOkOOOOkOOO..',
    '..xOWWkOOWWkOO..',
    '..xOWWkOOWWkOO..',
    '..xOkOOOOOOkOO..',
    '..xOOWWWWWWWO...',
    '...oOWkWkWkWo...',
    '....ooOOOOoo....',
    '..zsSSSSSSSSsz..',
    '.zsSSSSSSSSSSsz.',
    '.zSSzsSSSSszSSz.',
    '.zsszsSSSSszssz.',
    '...mrrrrrrrrm...',
    '...zsrRRRRrsz...',
    '...zss.rr.ssz...',
    '..xxxx....xxxx..',
  ];

  // ---------- Thợ Rèn: thanh kiếm sống khổng lồ, mắt dữ, miệng răng cưa ----------
  const KIEM_SONG = [
    '........W........',
    '.......WWv.......',
    '.......WWv.......',
    '......WWwvv......',
    '......WWwwv......',
    '.....WWwwwvv.....',
    '.....WWwwwwv.....',
    '....WWwwwwwvv....',
    '....WWwwwwwwv....',
    '...WWwwwwwwwvv...',
    '...WWwwwfwwwwv...',
    '...WWwwwfwwwwv...',
    '...WWwwwfwwwwv...',
    '...WWwwwfwwwwv...',
    '...WWwwwfwwwwv...',
    '...WWwwwwwwwwv...',
    '...Wkkkwwwwwwv...',
    '...WWwkkkkwwwv...',
    '...WWwwwkkkkkv...',
    '...WWkkYYYYkwv...',
    '...WkYYYkkYYkv...',
    '...WkYYYkkYYkv...',
    '...WWkYYkkYkwv...',
    '...WWwkkkkkwwv...',
    '...WWwwwwwwwwv...',
    '...WWwwwwwwwwv...',
    '...kkWkWkWkWkk...',
    '...kmmmmmmmmmk...',
    '...kkWkWkWkWkv...',
    '...WWwwwwwwwwv...',
    '...WWwwwwwwwwv...',
    'nyyyyyyYYyyyyyyyn',
    '.nnyyyyyYyyyyynn.',
    '..nn...tTu...nn..',
    '.......tTu.......',
    '.......tTu.......',
    '.......tTu.......',
    '.......tTu.......',
    '.......tTu.......',
    '......nyYyn......',
    '.......nnn.......',
  ];
  const REN = { ten: 'Thợ Rèn', moTa: 'Thanh kiếm sống tự bay, to gấp đôi em bé tinh linh đi theo nó. Mắt dữ, răng cưa.', bong: 12, ax: 15, rows: ghep(34, 46, [
    [KIEM_SONG, 16, 0], [EM_REN, 0, 28],
    [['2.2.2'], 14, 40], [['.2.', '2.2', '.2.'], 23, 42], [['2'], 13, 12], [['2'], 33, 6],
  ]) };

  // ---------- Thợ Săn: cây cung là một con rắn rồng, đầu ngậm dây ----------
  const CUNG_RONG = [
    '.......hh....y........',
    '......hGGhhhyn........',
    '.....hGGGGGGhhh.......',
    '.....hGGYkGGGGGh......',
    '.....hgGYkGGGGGGh.r...',
    '.....hggGGGGWkWkhrr...',
    '.....9hggggGhhhh..r...',
    '.....9.hgGyh..........',
    '.....9..hgGyh.........',
    '.....9...hGgyh........',
    '.....9....hgGyh.......',
    '.....9.....hgGyh......',
    '.....9......hGgyh.....',
    '.....9.......hgGyh....',
    '.....9.......hgGyh....',
    '.....9........hGgyh...',
    '.....9........hgGyh...',
    '.....9.........hgGyh..',
    '.....9.........hGgyh..',
    '.....9.........hgGyh..',
    '.....9.........hgGyh..',
    '.....9.........hGgyh..',
    '.....9.........hgGyh..',
    '.....9.........hgGyh..',
    '.....9.........hGgyh..',
    '.....9.........hgGyh..',
    '.....9.........hgGyh..',
    '.....9.........nyyyn..',
    '.....9.........nyYyn..',
    '.....9.........hGgyh..',
    '.....9........hgGyh...',
    '.....9........hgGyh...',
    '.....9.......hGgyh....',
    '.....9......hgGyh.....',
    '.....9.....hgGyh......',
    '.....9....hGgyh.......',
    '.....9...hgGyh........',
    '.....9.hhgGyh.........',
    '....hhhgGGyh..........',
    '...hgGGGyhh...........',
    '....hhhhh.............',
  ];
  const SAN = { ten: 'Thợ Săn', moTa: 'Em bé đội nón lá đứng lọt trong cây cung rắn rồng, cung tự ngậm lấy dây.', bong: 9, ax: 10, rows: ghep(24, 41, [
    [CUNG_RONG, 2, 0], [EM_SAN, 1, 23],
  ]) };

  // ---------- Thầy Lang: bầu hồ lô khổng lồ có mặt ông cụ ngủ gật ----------
  const BAU_SONG = [
    '............Gg..............',
    '...........tGGg...6.........',
    '...........tt......5........',
    '..........utTtu.............',
    '..........utTTu.....5.......',
    '.........noOOOon............',
    '........noOOOOOon...........',
    '.......noOYOOOOOon..........',
    '.......noOYOOOOOon..........',
    '.......noOOOOOOOon..........',
    '........noOOOOOon...........',
    '.........rrrrrrr............',
    '........mrRRRRRrm...........',
    '.......noOOOOOOOon..........',
    '.....nnoOOOOOOOOOonn........',
    '...nnoOOYOOOOOOOOOOonn......',
    '..noOOOYYOOOOOOOOOOOOon.....',
    '.noOOOYYOOOOOOOOOOOOOOon....',
    '.noOOOYOOOOOOOOOOOOOOOon....',
    'noOOOOOOOOOOOOOOOOOOOOOon...',
    'noOOOOkkkkOOOOOOkkkkOOOon...',
    'noOOOkOOOOkOOOOkOOOOkOOon...',
    'noOOOOOOOOOOiiOOOOOOOOOon...',
    'noOOOOWWWWWWiiWWWWWWOOOon...',
    'noOOOWWWWOOOrrOOOWWWWOOon...',
    'noOOOWWOOOOOOOOOOOOWWOOon...',
    'noOOOOWOOOOOOOOOOOOWOOOon...',
    '.noOOOOOOOOOOOOOOOOOOOon....',
    '.noOOOOOOOOOOOOOOOOOOOon....',
    '..noOOOOOOOOOOOOOOOOOon.....',
    '...nnoOOOOOOOOOOOOOonn......',
    '.....nnnoooooooooonnn.......',
  ];
  const LANG = { ten: 'Thầy Lang', moTa: 'Em bé áo lam dắt theo bầu thuốc khổng lồ, mặt ông cụ ngủ gật, sủi bọt độc.', bong: 16, ax: 19, rows: ghep(40, 38, [
    [BAU_SONG, 0, 6], [EM_LANG, 25, 20],
  ]) };

  // ---------- Đô Vật: đôi nắm đấm bằng đồng to như chiêng, núm chiêng là con mắt ----------
  const NAM_DAM = [
    '......nnnnnnnnnnn...',
    '....nnyYYYYYYYyyynn.',
    '...nyYYYYyyyyyyyyyyn',
    'mrrnyYYyyyyyyyyyyyyn',
    'mRrnyYynnnnnyyynnnn.',
    'mRrnyynuuuuunyyyyyyn',
    'mRrnyynuWWkunyyyyyyn',
    'mRrnyynuWkkunynnnnn.',
    'mRrnyynuuuuunyyyyyyn',
    'mRrnyyynnnnnyyyyyyyn',
    'mrrnyyyyyyyyyynnnnn.',
    '...nyyynnnnnnnnyyyyn',
    '...nyyynyyYYyynyyyyn',
    '....nyynyyyyyyynnnn.',
    '.....nnnnnnnnnn.....',
  ];
  const DO = { ten: 'Đô Vật', moTa: 'Em bé mặt nạ hổ điều khiển đôi nắm đấm đồng to như chiêng, bay hai bên.', bong: 16, ax: 25, rows: ghep(52, 38, [
    [NAM_DAM, 0, 1], [NAM_DAM, 32, 15], [EM_DO, 16, 20],
    [['2..', '.2.', '..2'], 14, 17], [['2'], 31, 31],
  ]) };


  // ---------- kiếm sống ở bốn mức tiến hoá: đổi màu từ cùng một hình, thêm chi tiết và đổi ánh mắt ----------
  const K_THUONG = { ten: 'Thường', rows: KIEM_SONG };
  const K_LUA = { ten: 'Lửa', rows: ghep(21, 43, [
    [doiMau(KIEM_SONG, { W: 'Y', w: 'O', v: 'r', f: 'R', Y: 'W', y: 'r', n: 'm', t: 'm', T: 'r', u: 'm' }), 2, 2],
    [['...3...', '..323..', '.32Y23.', '..3Y3..'], 7, 0], // ngọn lửa trên mũi
    [['3', '.', '2'], 3, 9], [['2', '3', '3'], 17, 14], [['3', '3', '.', '2'], 3, 22], [['3', '2'], 17, 27], [['3'], 1, 16], [['2'], 19, 7], [['3'], 19, 21],
    [['2.....', '32....', '.3....'], 0, 30], [['....2', '...23', '...3.'], 16, 30], // sừng lửa ở chắn tay
  ]) };
  const K_DOC = { ten: 'Độc', rows: ghep(21, 43, [
    [doiMau(KIEM_SONG, { W: 'G', w: 'g', v: 'h', f: 'h', Y: 'P', y: 'p', n: 'h', m: 'p' }), 2, 2],
    [['hh.', '.hG'], 2, 12], [['.hh', 'Gh.'], 16, 14], [['hh.', '.hG'], 2, 24], [['.hh', 'gh.'], 16, 8], // gai
    [['kkkkkkk', 'kkkkkkk'], 7, 21], // mí mắt sụp xuống: ánh nhìn lờ đờ, hiểm
    [['5', '.', '6'], 4, 33], [['5', '6', '.', '5'], 18, 31], [['5'], 1, 20], [['6', '5'], 10, 36],
  ]) };
  const K_BANG = { ten: 'Băng', rows: ghep(21, 43, [
    [doiMau(KIEM_SONG, { w: 'C', v: 'c', f: 'B', Y: 'B', y: 'b', n: 'd', m: 'd', t: 'd', T: 'b', u: 'd' }), 2, 2],
    [['cC.', '.cC', '..c'], 2, 10], [['.Cc', 'Cc.', 'c..'], 16, 13], [['cC.', '.cC'], 2, 23], [['.Cc', 'Cc.'], 16, 26], // tinh thể chìa ra
    [['c', 'C', 'c'], 3, 35], [['c', 'C', 'C', 'c'], 16, 35], [['c', 'c'], 8, 35], // nhũ băng dưới chắn tay
    [['7'], 0, 6], [['7'], 20, 4], [['7'], 19, 20], [['7'], 1, 28],
  ]) };
  // ---------- đang đánh: thanh kiếm tự lao tới, em bé bám chuôi bay theo ----------
  const EM_REN_BAY = [
    '............xx......',
    '..........xxXXxx....',
    '.........xXXXXXXx...',
    '........xXrrrrrrrx..',
    '........xWWWWWWWWW..',
    '........xWWkkWWkkW..',
    '........xWWkkWWkkW..',
    '........xWiWWWWWWi..',
    '.........WWWkkkWW...',
    '..........wWkkkw....',
    '.......uutttttttttsS',
    '......uttTTtttuuuusS',
    '.....uttTtttu.......',
    '....urrrrrru........',
    '...utTtttu..........',
    '..uttuttu...........',
    '.dd..dd.............',
    'xxx.xxx.............',
  ];
  // Thân kiếm nằm ngang: xoay hình gốc (đã bỏ mặt), rồi vẽ lại mặt cho đúng chiều: mắt trợn, miệng há.
  const KIEM_TRON = KIEM_SONG.map((r, j) => (j >= 16 && j <= 28) ? '...WWwwwwwwwwv...' : r);
  const MAT_LAO = [
    'kkk..........',
    '..kkkkk......',
    '..kYYYYkkk...',
    '.kYYYkkYYk...',
    '.kYYYkkYYk...',
    '..kYYYYYk....',
    '...kkkkk.....',
    'kWkWkWkWkWkWk',
    'kmmmmmmmmmmmk',
  ];
  const REN_DANH = { ten: 'Kiếm sống lao tới', bong: 15, ax: 30, rows: ghep(66, 46, [
    [vetVung(66, 46, 26, 32, 30, 39, -62, -4), 0, 0],
    [['99999999....', '....0000000.', '999999......'], 0, 27], [['0000000', '.99999.'], 0, 38],
    [xoay(KIEM_TRON), 24, 24], [MAT_LAO, 36, 27], [EM_REN_BAY, 10, 22],
    [['2'], 62, 18], [['2'], 54, 44], [['.2.', '2.2'], 46, 16],
  ]) };
  window.HUONG.push({ so: 3, ten: 'Hướng 3: Linh khí làm chủ', ngan: 'vũ khí sống là ngôi sao',
    gioiThieu: 'Vũ khí to quá khổ, có mắt, có tính nết riêng. Hero chỉ là em bé tinh linh đeo mặt nạ đi theo nó.',
    mau: {},
    hero: [REN, SAN, LANG, DO], danh: REN_DANH, kVuKhi: 5, vuKhi: [K_THUONG, K_LUA, K_DOC, K_BANG] });
})();
