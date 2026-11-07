// TURRET MERGE — KIỂM MẪU ÂM SFX v4 (assets/sfx/*.mp3 + luật trộn trong js/sound.js). TRƯỢT khi:
//   1) mẫu không nạp đủ (fetch + decodeAudioData) sau lần chạm đầu;
//   2) một sự kiện (25) không phát đúng mẫu khi gọi lời SND.* tương ứng (bảng BANG dưới đây);
//   3) bắn dồn dập vượt giới hạn: số giọng từng mẫu / cả nhóm bắn / trần toàn cục;
//   4) tắt SFX mà vẫn phát; ?nomau không rơi về âm tổng hợp;
//   5) trận 60 s (390×844, 15 ụ, quái đông): lỗi trang/console, trần giọng bị vượt, thời gian khung (CPU) tệ hơn bản tổng hợp > 15 %.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-am-thanh.js
//   DAI=60 (giây mỗi lượt trận; 0 = bỏ phần trận) · BASE=http://localhost:8765/thap/
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const DAI = +(process.env.DAI == null ? 60 : process.env.DAI);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let loi = 0;
const ok = (dk, msg) => { console.log((dk ? '  ✓ ' : '  ✗ ') + msg); if (!dk) loi++; };
// lời gọi SND → mẫu mong đợi
const BANG = [
  ['SND.W.dan()', 'ban-sung'], ['SND.W.laser()', 'ban-nang-luong'], ['SND.W.bang()', 'ban-bang'], ['SND.W.lua()', 'ban-lua'],
  ['SND.W.doc()', 'ban-doc'], ['SND.W.set()', 'ban-set'], ['SND.W.can()', 'can-chien'], ['SND.chet()', 'ha-quai'], ['SND.crit()', 'chi-mang'],
  ['SND.no(0.5)', 'no'], ['SND.nut()', 'ui-cham'], ['LUI', 'ui-quay-lai'], ['SND.trieu()', 'summon'], ['SND.ghep(2)', 'merge'],
  ['SND.hoTro()', 'ho-tro'], ['SND.wave(3,false)', 'bat-dau-dot'], ['SND.xongDot()', 'xong-dot'], ['SND.ghep(5)', 'merge-sao-cao'],
  ['SND.thucTinh()', 'dot-pha'], ['SND.jackpot()', 'jackpot'], ['SND.chieuTrum("janus")', 'boss-ky-nang'], ['SND.chet(true)', 'boss-guc-nga'],
  ['SND.ketThuc(true)', 'thang'], ['SND.ketThuc(false)', 'thua'], ['SND.canhBao()', 'boss-xuat-hien'],
];
async function moTrang(b, q, nhat) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(), err = [];
  p.on('pageerror', e => err.push('pageerror: ' + e.message));
  // "AudioContext was not allowed to start": Chromium headless in cả khi đã có cử chỉ (bản gốc cũng vậy) → không tính, nhưng kiểm ctx = running
  p.on('console', m => { const t = m.text(); if (/was not allowed to start/.test(t)) return; if (m.type() === 'error' || /AudioContext|autoplay/i.test(t)) err.push(m.type() + ': ' + t); });
  p.on('requestfailed', r => { if (/assets\/sfx\//.test(r.url())) err.push('requestfailed: ' + r.url()); });
  await p.goto(BASE + q, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof SND !== 'undefined' && typeof G !== 'undefined', null, { timeout: 60000 });
  if (nhat) { await sleep(300); await p.touchscreen.tap(2, 2); } // chạm đầu tiên (touchend) → mở khoá AudioContext như iOS
  return { p, err, ctx };
}
(async () => {
  const b = await chromium.launch();
  // ---------- 1–4: nạp, ánh xạ, giới hạn, tắt tiếng ----------
  console.log('· mẫu + ánh xạ + giới hạn (390×844)');
  {
    const { p, err, ctx } = await moTrang(b, '?mode=solo', true);
    const t0 = Date.now();
    await p.waitForFunction(() => SND.mau().nap.length + SND.mau().tk.loi >= SND.mau().ds.length, null, { timeout: 30000 }).catch(() => { });
    const m = await p.evaluate(() => Object.assign(SND.mau(), { st: SND.thongKe().ctx }));
    ok(m.st === 'running', 'AudioContext chạy sau cử chỉ đầu (' + m.st + ')');
    ok(m.ds.length === 25 && m.nap.length === 25 && m.tk.loi === 0, 'nạp ' + m.nap.length + '/' + m.ds.length + ' mẫu, lỗi ' + m.tk.loi + ' (' + (Date.now() - t0) + ' ms)');
    // ánh xạ: mỗi lời gọi phát đúng mẫu
    const thieu = [];
    for (const [goi, k] of BANG) {
      const truoc = await p.evaluate((k) => SND.mau().tk.dem[k] || 0, k);
      if (goi === 'LUI') await p.evaluate(() => { const x = document.createElement('button'); x.dataset.act = 'hm-dong'; document.body.appendChild(x); x.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); SND.nut(); x.remove(); });
      else await p.evaluate(goi);
      const sau = await p.evaluate((k) => SND.mau().tk.dem[k] || 0, k);
      if (sau <= truoc) thieu.push(goi + ' → ' + k);
      await sleep(130);
    }
    ok(!thieu.length, 'ánh xạ đủ ' + BANG.length + ' sự kiện' + (thieu.length ? ': thiếu ' + thieu.join(', ') : ''));
    await sleep(4000); // chờ âm dài tắt
    // dồn dập 1,5 s: 7 loại âm mỗi 5 ms (≈ 1400 yêu cầu/s)
    const r = await p.evaluate(() => new Promise(xong => {
      const M = SND.mau(), base = JSON.parse(JSON.stringify(M.tk.maxK)); let gMax = 0, n = 0; const t0 = performance.now();
      for (const k in M.tk.maxK) M.tk.maxK[k] = 0;
      const id = setInterval(() => {
        SND.W.dan(); SND.W.laser(); SND.W.bang(); SND.chet(); SND.crit(); SND.no(0.4); SND.trung(); n += 7;
        gMax = Math.max(gMax, SND.thongKe().giong);
        if (performance.now() - t0 > 1500) { clearInterval(id); const m = SND.mau(); xong({ gMax, n, tk: m.tk, cfg: m.cfg, nhom: m.nhom, tran: m.tran, base }); }
      }, 5);
    }));
    const vuot = [];
    for (const k in r.cfg) { const mx = r.tk.maxK[k] || 0; if (mx > r.cfg[k][3]) vuot.push(k + ' ' + mx + '>' + r.cfg[k][3]); }
    const banMax = r.tk.maxK.ban || 0;
    ok(!vuot.length, 'giới hạn giọng từng mẫu' + (vuot.length ? ': vượt ' + vuot.join(', ') : ''));
    ok(banMax <= r.nhom.ban[1], 'nhóm bắn ≤ ' + r.nhom.ban[1] + ' giọng (đo ' + banMax + ')');
    ok(r.gMax <= r.tran + 1, 'trần toàn cục ≤ ' + r.tran + ' (đo ' + r.gMax + ', ' + r.n + ' yêu cầu, chặn ' + r.tk.chan + ')');
    // tắt SFX → im
    const im = await p.evaluate(async () => { SND.batTat(); const a = SND.mau().tk.phat; await new Promise(r => setTimeout(r, 300)); SND.W.dan(); SND.ghep(5); const b2 = SND.mau().tk.phat; SND.batTat(); return [a, b2, SND.sfxBat()]; });
    ok(im[0] === im[1] && im[2], 'tắt SFX → không phát mẫu; bật lại được');
    ok(!err.length, 'không lỗi trang / console' + (err.length ? ': ' + err.slice(0, 4).join(' | ') : ''));
    await ctx.close();
  }
  {
    const { p, err, ctx } = await moTrang(b, '?mode=solo&nomau', true);
    await sleep(800);
    const r = await p.evaluate(() => { const a = SND.thongKe().tao; SND.trieu(); SND.W.dan(); return { nap: SND.mau().nap.length, tat: SND.mau().tat, tao: SND.thongKe().tao - a }; });
    ok(r.tat && r.nap === 0 && r.tao > 0, '?nomau: không nạp mẫu, âm tổng hợp dự phòng vẫn phát (' + r.tao + ' node)');
    ok(!err.length, '?nomau không lỗi' + (err.length ? ': ' + err.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  // ---------- 5: trận DAI s (390×844, 15 ụ): xen kẽ 10 s MẪU / 10 s TỔNG HỢP (SND.mauTat) trong CÙNG 1 trận → so công bằng ----------
  if (DAI > 0) {
    console.log('· trận ' + DAI + ' s — xen kẽ mẫu / tổng hợp mỗi 10 s');
    const { p, err, ctx } = await moTrang(b, '?mode=solo&deck=lien,canon,bang,tia,set&auto=1&mana=99999&wave=16', true);
    await p.waitForFunction(() => SND.mau().nap.length >= 25, null, { timeout: 30000 }).catch(() => { });
    await p.waitForFunction(() => !G.dung && G.t > 0.5, null, { timeout: 60000 });
    await p.evaluate(() => {
      // bàn đông: 15 ụ bắn nhiều họ, tim vô hạn để trận không kết thúc sớm
      const ids = ['lien', 'canon', 'bang', 'tia', 'set', 'doc', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'railgun', 'nangluong', 'maychem'];
      const B = G.ban[0]; B.tim = 1e9;
      ids.forEach((id, o) => { try { B.lv[id] = 1; B.t[o] = sinhU(taoU(B, id, 4, o)); } catch (e) { } });
      // CPU luồng chính trong mọi lời gọi SND.* (độ sâu 0 → không tính trùng lời gọi lồng)
      window._sndMs = 0; let sau = 0;
      const boc = (o) => { for (const k of Object.keys(o)) { const f = o[k]; if (typeof f !== 'function' || /^(thongKe|mau|mauTat)$/.test(k)) continue;
        o[k] = function () { if (sau++) { try { return f.apply(this, arguments); } finally { sau--; } } const t = performance.now(); try { return f.apply(this, arguments); } finally { sau--; window._sndMs += performance.now() - t; } }; } };
      boc(SND); boc(SND.W);
    });
    const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
    const met = async () => { const r = await cdp.send('Performance.getMetrics'); const o = {}; for (const x of r.metrics) o[x.name] = x.value; return o; };
    const kq = { mau: { khung: 0, cpu: 0, snd: 0, ms: 0, gMax: 0, gs: [], nodeMax: 0 }, tong: { khung: 0, cpu: 0, snd: 0, ms: 0, gMax: 0, gs: [], nodeMax: 0 } };
    const n = Math.max(2, Math.round(DAI / 10));
    await sleep(5000); // làm nóng (JIT, ảnh, bộ đệm) trước khi đo
    const THU = ['mau', 'tong', 'tong', 'mau', 'mau', 'tong']; // ABBA… cân bằng thứ tự (máy chia sẻ, CPU dao động)
    for (let i = 0; i < n; i++) {
      const che = THU[i % THU.length], K = kq[che];
      await p.evaluate((x) => { SND.mauTat(x); }, che === 'tong');
      await sleep(400); // để giọng của chế độ trước tắt hẳn
      const m0 = await met();
      const r = await p.evaluate((ms) => new Promise(xong => {
        let fr = 0, gMax = 0, nMax = 0; const gs = [], s0 = window._sndMs, t0 = performance.now();
        const f = (t) => { fr++; if (t - t0 < ms) requestAnimationFrame(f); }; requestAnimationFrame(f);
        const id = setInterval(() => { const k = SND.thongKe(); gs.push(k.giong); gMax = Math.max(gMax, k.giong); nMax = Math.max(nMax, k.node); }, 50);
        setTimeout(() => { clearInterval(id); xong({ fr, gMax, nMax, gs, snd: window._sndMs - s0, ms: performance.now() - t0 }); }, ms);
      }), 10000 * DAI / (n * 10));
      const m1 = await met();
      console.log('      ' + (i + 1) + '. ' + che + ' · ' + r.fr + ' khung · CPU ' + ((m1.TaskDuration - m0.TaskDuration) * 1000 / r.fr).toFixed(1) + ' ms/khung · giọng max ' + r.gMax);
      K.khung += r.fr; K.cpu += (m1.TaskDuration - m0.TaskDuration) * 1000; K.snd += r.snd; K.ms += r.ms; K.gMax = Math.max(K.gMax, r.gMax); K.gs.push(...r.gs); K.nodeMax = Math.max(K.nodeMax, r.nMax);
    }
    const tk = await p.evaluate(() => ({ m: SND.mau().tk, t: SND.thongKe(), wave: G.wave, quai: G.quai.filter(e => !e.chet).length }));
    await ctx.close();
    for (const che of ['mau', 'tong']) { const K = kq[che]; K.gs.sort((a, b) => a - b); K.g95 = K.gs[Math.floor(K.gs.length * 0.95)] || 0; K.cpuKhung = K.cpu / K.khung; K.sndGiay = K.snd / (K.ms / 1000);
      console.log('    ' + (che === 'mau' ? 'MẪU     ' : 'TỔNG HỢP') + ' · ' + K.khung + ' khung · CPU ' + K.cpuKhung.toFixed(1) + ' ms/khung · SND ' + K.sndGiay.toFixed(2) + ' ms/s · giọng max ' + K.gMax + ' p95 ' + K.g95 + ' · node max ' + K.nodeMax); }
    console.log('    wave ' + tk.wave + ' · quái ' + tk.quai + ' · mẫu phát ' + tk.m.phat + ' chặn ' + tk.m.chan + ' cướp ' + tk.m.cuop + ' · synth bỏ ' + tk.t.bo + ' · giọng max cả trận ' + tk.t.giongMax);
    const a = kq.mau, s2 = kq.tong;
    ok(!err.length, 'trận: không lỗi' + (err.length ? ': ' + err.slice(0, 4).join(' | ') : ''));
    ok(tk.t.giongMax <= 25, 'trận: giọng đồng thời max ' + tk.t.giongMax + ' ≤ 25 (p95 mẫu ' + a.g95 + ')');
    ok(tk.m.phat > 50, 'trận: mẫu thực sự được phát (' + tk.m.phat + ')');
    ok(a.cpuKhung <= s2.cpuKhung * 1.15 + 0.5, 'CPU/khung (luồng chính) mẫu ' + a.cpuKhung.toFixed(1) + ' ms ≤ tổng hợp ' + s2.cpuKhung.toFixed(1) + ' ms (+15 %, máy chia sẻ dao động)');
    ok(a.sndGiay <= s2.sndGiay * 1.15 + 0.2, 'CPU trong SND.* mẫu ' + a.sndGiay.toFixed(2) + ' ms/s ≤ tổng hợp ' + s2.sndGiay.toFixed(2) + ' ms/s');
  }
  await b.close();
  console.log(loi ? '✗ thap-kt-am-thanh: ' + loi + ' lỗi' : '✓ thap-kt-am-thanh: đạt');
  process.exit(loi ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
