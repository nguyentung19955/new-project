// node chup-ghep.js <url> <thư mục ảnh>
const { chromium } = require('playwright');
const fs = require('fs');
const [url, out] = process.argv.slice(2);
const DO = JSON.parse(fs.readFileSync(__dirname + '/do-thu.json', 'utf8'));
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const loi = [];
  pg.on('pageerror', (e) => loi.push(String(e)));
  pg.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') loi.push(m.text()); });
  await pg.goto(url, { waitUntil: 'load' });
  await pg.waitForFunction(() => window.G && G.tinhLinh && G.spriteCustom && G.art && G.art.hero, null, { timeout: 30000 });
  await pg.waitForTimeout(1200);
  const kq = await pg.evaluate(async ({ DO }) => {
    const SC = G.spriteCustom, TL = G.tinhLinh;
    const cho = (f) => new Promise((r) => { const k = () => (f() ? r() : setTimeout(k, 20)); k(); });
    const napDo = async (coDiem) => {
      for (const t of DO) { const t2 = JSON.parse(JSON.stringify(t)); if (!coDiem) delete t2.trang_phuc.diem; SC.add(t2); }
      await cho(() => DO.every((t) => SC.do[t.ma] && SC.do[t.ma].ready));
    };
    // thân AI tạm (dựng từ em bé code Đô Vật, không đồ)
    const fw = 48, fh = 48, gx = 24, gy = 42;
    const DT = [['idle', 'idle', 4, 2], ['move', 'run', 4, 2], ['tele', 'idle', 2, 1], ['atk', 'cast', 4, 2], ['hit', 'hurt', 1, 1], ['die', 'die', 4, 2], ['ne', 'dodge', 4, 2]];
    const sheet = document.createElement('canvas'); sheet.width = fw * 4; sheet.height = fh * DT.length;
    const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
    const dong = {};
    DT.forEach((d, r) => {
      dong[d[0]] = { hang: r, so: d[2], giay: 0.6, lap: d[0] === 'idle' || d[0] === 'move' };
      for (let i = 0; i < d[2]; i++) { sg.save(); sg.translate(i * fw + gx, r * fh + gy); G.art.hero(sg, { key: 'wrestler', x: 0, y: 0, face: 1, anim: d[1], f: i * d[3], v: 2, noShadow: true, outfit: { hat: null, robe: null, back: null, hand: null, mask: null } }); sg.restore(); }
    });
    const tamAI = sheet.toDataURL();
    const EMBE = { loai: 'linh-khi-sprite', ma: 'em-be-smith', doi_tuong: 'em-be', tam: tamAI, khung_rong: fw, khung_cao: fh, goc: [gx, gy], dong_tac: dong };
    // điểm thật của thân AI tạm = điểm khung xương Đô Vật ở đúng khung đã dùng để dựng (đo bằng chính API, thân code)
    const dv = (an, f) => SC.diemNhanVat({ key: 'wrestler', dong_tac: an, khung: f, vu_khi: null }).diem;
    const GHEP = { loai: 'linh-khi-sprite', doi_tuong: 'ghep', ma: 'ghep-smith', nhan_vat: 'smith', diem: dv('idle', 0), diem_theo: {},
      cap: {
        'tp-robes-thu': { da_chinh: true },
        'tp-hats-thu': { dy: 0, theo: { die: { an: true } }, da_chinh: true },
        'tp-hands-thu': { lop: 'truoc_tay' },
        'vk-sword': { dx: 1, dy: 1, xoay: 0 },
      } };
    for (let i = 1; i < 4; i++) GHEP.diem_theo['move:' + i] = dv('run', i * 2);
    for (let i = 0; i < 4; i++) GHEP.diem_theo['atk:' + i] = dv('cast', i * 2);
    const OF = { hat: 'non_la', robe: 'ao_vai', back: 'ong_ten', hand: 'bua_lua', mask: 'lua', wing: { kind: 'la', level: 2 } };
    const W = { type: 'sword', family: 3 };
    // cảnh: [tên, o]
    const CANH = [['đứng', { t: 0.05 }], ['đứng 2', { t: 0.35 }], ['chạy', { move: true, t: 0.2 }], ['chạy 2', { move: true, t: 0.5 }], ['chém 1', { atk: 0.2 }], ['chém 2', { atk: 0.45 }], ['chém 3', { atk: 0.7 }],
      ['lăn 1', { dodge: 0.2 }], ['lăn 2', { dodge: 0.45 }], ['lăn 3', { dodge: 0.7 }], ['ngã', { p: { dead: true, deadT: 0.55, st: {} } }]];
    const S = 3, CW = 66, CH = 56, nC = CANH.length;
    const hang = [];
    const veHang = (ten, cham) => {
      const cv = document.createElement('canvas'); cv.width = nC * CW * S; cv.height = CH * S;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      CANH.forEach((c, k) => {
        g.save(); g.fillStyle = k % 2 ? '#3a4458' : '#323b4d'; g.fillRect(k * CW * S, 0, CW * S, CH * S);
        g.setTransform(S, 0, 0, S, k * CW * S, 0);
        const o = Object.assign({ key: 'smith', x: CW / 2 - 4, y: CH - 8, face: 1, t: 0.5, weapon: W, outfit: OF }, c[1]);
        G.art.hero(g, o);
        if (cham) { // điểm neo thân của khung này (API), chấm vàng
          const d = SC.diemNhanVat(o); g.fillStyle = '#ffe14a';
          for (const n in d.diem) { const p = d.diem[n]; g.fillRect(Math.round(o.x + p[0]), Math.round(o.y + p[1]), 1, 1); }
        }
        g.restore();
      });
      hang.push([ten, cv]);
    };
    // 1. Cũ: món không có điểm, không tệp ghép
    await napDo(false);
    veHang('Thân code – cũ (không điểm neo)');
    SC.add(EMBE); await cho(() => SC.get('em-be-smith'));
    veHang('Thân AI – cũ (không điểm neo)');
    const chuaChinhCu = SC.chuaChinh('smith', { outfit: OF });
    SC.remove('em-be-smith'); TL.clearCache();
    // 2. Mới: món có điểm neo + tệp ghep-smith
    await napDo(true);
    SC.add(GHEP);
    veHang('Thân code – mới (điểm neo + ghep-smith)');
    veHang('Thân code – mới, chấm vàng = điểm neo thân', true);
    const apiCode = { diem_dung: SC.diemNhanVat('smith', 'idle', 0), dat_ao_dung: SC.datDo('smith', 'tp-robes-thu', 'idle', 0), dat_canh_lan: SC.datDo('smith', 'tp-wings-thu', 'dodge', 3), dat_mu_chay: SC.datDo('smith', 'tp-hats-thu', 'run', 2) };
    SC.add(EMBE); await cho(() => SC.get('em-be-smith'));
    veHang('Thân AI – mới (điểm neo + ghep-smith)');
    veHang('Thân AI – mới, chấm vàng = điểm neo thân', true);
    const apiAI = { diem_chay2: SC.diemNhanVat('smith', 'move', 2), diem_lan2: SC.diemNhanVat('smith', 'ne', 2), dat_ao_chem: SC.datDo('smith', 'tp-robes-thu', 'atk', 2), dat_mu_nga: SC.datDo('smith', 'tp-hats-thu', 'die', 3), chua_chinh: SC.chuaChinh('smith', { outfit: OF }), cap_vk: SC.capVuKhi('smith', W, 'sword', 'idle', 0), kieu_cong_cu: SC.diemNhanVat('smith', { key: 'smith', dong_tac: 'move', khung: 2 }) };
    // ghép tất cả thành một ảnh có nhãn
    const nhan = 16, all = document.createElement('canvas'); all.width = nC * CW * S; all.height = hang.length * (CH * S + nhan) + nhan;
    const ga = all.getContext('2d'); ga.fillStyle = '#1d2230'; ga.fillRect(0, 0, all.width, all.height); ga.font = '12px sans-serif';
    CANH.forEach((c, k) => { ga.fillStyle = '#cfd6e6'; ga.fillText(c[0], k * CW * S + 6, 12); });
    hang.forEach((h, i) => { const y = nhan + i * (CH * S + nhan); ga.fillStyle = '#ffd27a'; ga.fillText(h[0], 6, y + 12); ga.drawImage(h[1], 0, y + nhan); });
    return { png: all.toDataURL(), apiCode, apiAI, chuaChinhCu, loi: SC.loi.slice() };
  }, { DO });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(out + '/so-cu-moi.png', Buffer.from(kq.png.split(',')[1], 'base64'));
  fs.writeFileSync(out + '/api-mau.json', JSON.stringify({ apiCode: kq.apiCode, apiAI: kq.apiAI, chuaChinhCu: kq.chuaChinhCu }, null, 1));
  console.log('lỗi SC:', kq.loi, 'lỗi trang:', loi);
  console.log(JSON.stringify(kq.apiAI.chua_chinh), JSON.stringify(kq.apiCode.dat_ao_dung), JSON.stringify(kq.apiCode.dat_canh_lan));
  await b.close();
})();
