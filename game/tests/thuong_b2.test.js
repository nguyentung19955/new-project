#!/usr/bin/env node
// Bước 2 Phiên E: số thưởng đã chỉnh của ba hệ (khối "PHIÊN E" cuối js/data.js) và cờ quay lui ?thuongb2=goc.
// Chạy hai bản game trong Node qua tests/node_trang.js: bản thường (số đã chỉnh) và bản ?thuongb2=goc (số gốc Phiên A / B / C).
// Chạy: node tests/thuong_b2.test.js
'use strict';
const path = require('path'), { spawn } = require('child_process');
const TRANG = path.join(__dirname, 'node_trang.js');

function moTrang(q) {
  const env = Object.assign({}, process.env);
  if (q) env.LK_Q = q; else delete env.LK_Q;
  const p = spawn(process.execPath, [TRANG], { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '', loi = '';
  const cho = [];
  p.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); const f = cho.shift(); if (f) f(l); }
  });
  p.stderr.on('data', (d) => { loi += d; });
  const goi = (code, arg) => new Promise((res, rej) => {
    cho.push((l) => { const o = JSON.parse(l); if (o.ok) res(o.v); else rej(new Error(o.loi)); });
    p.stdin.write(JSON.stringify({ code: typeof code === 'function' ? '(' + code.toString() + ')' : code, arg }) + '\n');
  });
  return { goi, dong: () => p.kill(), loi: () => loi };
}

let soDat = 0;
function dat(ok, m) { if (!ok) throw new Error('SAI: ' + m); soDat++; console.log('  ✓ ' + m); }

const TONG = () => {
  const V = G.VIEC_NGAY, Y = G.SO_YQ, T = G.THANH_TUU;
  let soV = 0, soLk = 0, soDa = 0;
  for (const t of Y.trang) { soV += Y.vang[t[2]][t[1]]; soLk += Y.lk[t[2]]; soDa += Y.da[t[2]]; }
  soDa += Y.vungDa.reduce((a, x) => a + x, 0);
  const tt = { vang: 0, lk: 0, da: 0, bua: 0, quang: 0 };
  for (const a of T.DS) for (const k in tt) tt[k] += a.th[k] | 0;
  const ngay = [0, 1, 2].map((m) => ({ v: V.thuong.reduce((a, r) => a + r[m].v, 0), q: V.thuong.reduce((a, r) => a + r[m].q, 0), da: V.ruongNgay[m].da, lk: V.ruongNgay[m].lk }));
  // nhận thật: bản lưu mới qua ải hướng dẫn → thành tựu "Bước đầu"
  G.resetSave(); G.save.sound = false; G.save.stars['0-0'] = 1; G.save.tut.done = true;
  const g0 = G.save.gold; G.thanhTuu.kiem(G.save); const ok = G.thanhTuu.nhan('buocDau', G.save);
  return { goc: G.THUONG_B2_GOC, so: { v: soV, lk: soLk, da: soDa }, tt, ngay, tuan: V.ruongTuan.map((r) => r.da + '+' + r.bua), buocDau: ok ? G.save.gold - g0 : null };
};

(async () => {
  const A = moTrang(''), B = moTrang('thuongb2=goc');
  try {
    const a = await A.goi(TONG), b = await B.goi(TONG);
    console.log('Số đã chỉnh:', JSON.stringify(a));
    console.log('Số gốc:     ', JSON.stringify(b));
    dat(a.goc === false && b.goc === true, 'cờ G.THUONG_B2_GOC: bản thường false, ?thuongb2=goc true');
    dat(b.so.v === 2640 && b.so.lk === 198 && b.so.da === 46, '?thuongb2=goc: Sổ cả game 2.640 V · 198 LK · 46 Đ (như Phiên A)');
    dat(b.tt.vang === 1800 && b.tt.lk === 130 && b.tt.da === 19 && b.tt.bua === 6 && b.tt.quang === 10, '?thuongb2=goc: Thành tựu 1.800 V · 130 LK · 19 Đ · 6 bùa · 10 quặng (như Phiên C)');
    dat(b.ngay[0].v === 270 && b.ngay[2].v === 900 && b.ngay[0].da === 2 && b.buocDau === 100, '?thuongb2=goc: Việc mức 1 270 V/ngày, mức 3 900 V/ngày, rương ngày 2 đá; "Bước đầu" +100 vàng');
    dat(a.so.v === 1320 && a.so.lk === 198 && a.so.da === 31, 'đã chỉnh: Sổ cả game 1.320 V · 198 LK · 31 Đ');
    dat(a.tt.vang === 900 && a.tt.lk === 130 && a.tt.da === 12 && a.tt.bua === 6 && a.tt.quang === 10, 'đã chỉnh: Thành tựu 900 V · 130 LK · 12 Đ · 6 bùa · 10 quặng');
    dat(a.ngay.map((x) => x.v).join() === '135,225,360' && a.ngay.map((x) => x.q).join() === '5,7,9' && a.ngay.map((x) => x.da).join() === '1,1,2' && a.ngay.map((x) => x.lk).join() === '8,12,16',
      'đã chỉnh: Việc mỗi ngày 135 / 225 / 360 vàng, 5 / 7 / 9 quặng; rương ngày 1 / 1 / 2 đá + 8 / 12 / 16 linh khí');
    dat(a.tuan.join() === b.tuan.join(), 'rương tuần giữ nguyên: ' + a.tuan.join(' · '));
    dat(a.buocDau === 50, 'nhận thật "Bước đầu" (đã chỉnh): +50 vàng');
    console.log(`\nPASS — ${soDat} điều kiện`);
  } catch (e) {
    console.error('\n' + (e && e.stack || e));
    console.error('stderr A:', A.loi().slice(-1500));
    process.exitCode = 1;
  } finally { A.dong(); B.dong(); }
})();
