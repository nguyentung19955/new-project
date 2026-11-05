// TURRET MERGE — NHẠC NỀN CYBERPUNK THÍCH ỨNG (darksynth / synthwave hào hùng), tổng hợp 100% Web Audio, không file mẫu.
// Bộ tuần tự 16 bước/ô nhịp, lên lịch trước 0.3 s; mỗi "bản" (menu / trận) là 1 người chơi riêng có lớp (layer) riêng →
// đổi màn = crossfade 1 ô nhịp; trong trận các lớp vào/ra theo CƯỜNG ĐỘ (wave + số quái trên sân):
//   êm (pad + bass dài + arp lọc) → + kick 4/4 + bass 8 → + snare cổng (gated reverb) + hat 16 + arp 16 → + giai điệu chính + open hat + crash
//   TRÙM: hợp âm Phrygian, kèn đồng synth (brass stab), dàn hợp xướng (formant), hat 16 + cuộn 32, trống tom.
// Stinger: trùm xuất hiện (BRAAM + va chạm), thắng (fanfare trưởng), thua (hợp âm tụt + "tape stop").
// Trộn: lớp giai điệu → sidechain (bơm theo kick) → bus vòng lặp; trống → bus vòng lặp; vang (convolver) + delay ping-pong;
//   → compressor "keo" → bão hoà tanh (thêm hoạ âm cho loa điện thoại) → lọc tạm dừng → đích (bus nhạc của sound.js).
// Mọi node theo nốt tự ngắt khi nốt hết (onended) → đồ thị âm thanh không phình theo thời gian.
'use strict';
const NHAC = (() => {
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const R = Math.random;

  // ======================= MẪU TRỐNG (tổng hợp thẳng vào AudioBuffer, đồng bộ) =======================
  function taoMau(c) {
    const sr = c.sampleRate, M = {};
    const buf = (dai, kenh, fn) => { const n = Math.ceil(dai * sr), b = c.createBuffer(kenh, n, sr); for (let k = 0; k < kenh; k++) fn(b.getChannelData(k), n, k); return b; };
    const kim = [205.3, 304.4, 369.6, 522.7, 540, 800].map(f => f * 1.62); // hoạ âm kim loại kiểu 808 → hat / crash
    // KICK: sin lướt 190→46 Hz + click, bão hoà tanh → hoạ âm 140/230 Hz nghe được trên loa nhỏ
    M.kick = buf(0.5, 1, (d, n) => { let ph = 0; for (let i = 0; i < n; i++) { const t = i / sr, f = 46 + 150 * Math.exp(-t * 26) + 60 * Math.exp(-t * 170);
      ph += 2 * Math.PI * f / sr; const a = Math.exp(-t * 7) * Math.min(1, t / 0.0015); d[i] = Math.tanh(Math.sin(ph) * a * 2.8) * 0.85 + (R() * 2 - 1) * Math.exp(-t * 700) * 0.45; } });
    // SNARE "cổng" thập niên 80: thân 190 Hz + ồn + đuôi vang dày bị CẮT gọn (gated reverb), stereo
    M.snare = buf(0.42, 2, (d, n) => { let ph = 0, lp = 0, lp2 = 0; for (let i = 0; i < n; i++) { const t = i / sr;
      ph += 2 * Math.PI * 185 * (1 + 0.6 * Math.exp(-t * 45)) / sr; const x = R() * 2 - 1; lp += (x - lp) * 0.5; lp2 += (lp - lp2) * 0.08; const hp = lp - lp2;
      const cong = t < 0.012 ? t / 0.012 : t < 0.24 ? 1 - (t - 0.012) * 1.6 : t < 0.26 ? (1 - 0.228 * 1.6) * (0.26 - t) / 0.02 : 0;
      d[i] = Math.tanh((Math.sin(ph) * Math.exp(-t * 26) * 0.75 + x * Math.exp(-t * 20) * 0.55 + hp * cong * 0.75) * 1.5) * 0.9; } });
    // CLAP: 3 nhát ồn dải giữa + đuôi
    M.clap = buf(0.35, 2, (d, n) => { let lp = 0, lp2 = 0; for (let i = 0; i < n; i++) { const t = i / sr, x = R() * 2 - 1; lp += (x - lp) * 0.35; lp2 += (lp - lp2) * 0.06; const bp = lp - lp2;
      const tt = t < 0.03 ? t % 0.01 : t - 0.03; const a = t < 0.03 ? Math.exp(-tt * 300) : Math.exp(-tt * 14); d[i] = bp * a * 1.6; } });
    const hatf = (dai, tat) => buf(dai, 1, (d, n) => { let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr; let m = 0; for (const f of kim) m += Math.sin(2 * Math.PI * f * 4 * t) > 0 ? 1 : -1;
      const x = m / 6 * 0.6 + (R() * 2 - 1) * 0.6; lp += (x - lp) * 0.45; d[i] = (x - lp) * Math.exp(-t * tat) * Math.min(1, t / 0.0008) * 0.9; } });
    M.hat = hatf(0.09, 55); M.ohat = hatf(0.45, 7.5);
    // CRASH: ồn + kim loại, tắt 1.8 s, stereo
    M.crash = buf(2.2, 2, (d, n) => { let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr; let m = 0; for (const f of kim) m += Math.sin(2 * Math.PI * f * 3.1 * t + f) > 0 ? 1 : -1;
      const x = m / 6 * 0.35 + (R() * 2 - 1) * 0.8; lp += (x - lp) * 0.3; d[i] = (x - lp) * Math.exp(-t * 2.1) * Math.min(1, t / 0.002) * 0.7; } });
    // TOM: sin lướt 130→85 + ồn ngắn (đổi cao độ bằng playbackRate)
    M.tom = buf(0.5, 1, (d, n) => { let ph = 0; for (let i = 0; i < n; i++) { const t = i / sr; ph += 2 * Math.PI * (85 + 60 * Math.exp(-t * 18)) / sr;
      d[i] = Math.tanh(Math.sin(ph) * Math.exp(-t * 7) * 2) * 0.8 + (R() * 2 - 1) * Math.exp(-t * 60) * 0.2; } });
    // VA CHẠM điện ảnh (stinger): sub rơi 70→28 bão hoà + ồn trầm dài + crack
    M.impact = buf(3, 2, (d, n, k) => { let ph = 0, lp = 0; for (let i = 0; i < n; i++) { const t = i / sr; ph += 2 * Math.PI * (28 + 50 * Math.exp(-t * 5)) / sr; const x = R() * 2 - 1;
      lp += (x - lp) * (0.02 + 0.3 * Math.exp(-t * 6)); d[i] = Math.tanh(Math.sin(ph) * Math.exp(-t * 1.6) * 3) * 0.7 + lp * Math.exp(-t * 1.4) * 2.2 + x * Math.exp(-t * 90) * 0.5; } });
    // RISER: ồn sáng dần + to dần 2 ô nhịp (đuôi ngắt gọn)
    M.riser = buf(3.6, 2, (d, n) => { let lp = 0; for (let i = 0; i < n; i++) { const p = i / n, x = R() * 2 - 1; lp += (x - lp) * (0.02 + 0.6 * p * p); d[i] = (x - lp * 0.3) * p * p * 0.5 * (p > 0.985 ? (1 - p) / 0.015 : 1); } });
    // XUNG VANG (impulse response) 2.2 s: ồn stereo tắt mũ, tối dần theo thời gian
    M.ir = buf(2.2, 2, (d, n) => { let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr, x = R() * 2 - 1; lp += (x - lp) * (0.85 * Math.exp(-t * 1.6) + 0.05);
      d[i] = (t < 0.012 ? 0 : lp) * Math.exp(-t * 2.4) * 0.6; } });
    return M;
  }

  // ======================= BẢN NHẠC (dữ liệu) =======================
  // hợp âm: r = nốt gốc bass (MIDI), v = thế bấm pad
  const H = {
    Dm: { r: 38, v: [57, 62, 65, 69] }, Bb: { r: 34, v: [58, 62, 65, 70] }, F: { r: 41, v: [57, 60, 65, 69] }, C: { r: 36, v: [55, 60, 64, 67] },
    Gm: { r: 43, v: [55, 58, 62, 67] }, A: { r: 33, v: [57, 61, 64, 69] },
    Em: { r: 40, v: [59, 64, 67, 71] }, Cb: { r: 36, v: [60, 64, 67, 72] }, G: { r: 43, v: [59, 62, 67, 71] }, D: { r: 38, v: [57, 62, 66, 69] },
    Am: { r: 45, v: [57, 60, 64, 69] }, B: { r: 35, v: [59, 63, 66, 71] }, Fb: { r: 41, v: [60, 65, 69, 72] },
  };
  // giai điệu: mỗi ô nhịp [[bước, MIDI, độ dài bước], ...]
  const BAN = {
    menu: { bpm: 120, hop: ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'],
      giai: [[[0, 74, 6], [6, 69, 2], [8, 74, 4], [12, 76, 4]], [[0, 77, 8], [8, 79, 4], [12, 77, 4]], [[0, 81, 6], [6, 79, 2], [8, 77, 4], [12, 72, 4]], [[0, 76, 8], [8, 74, 4], [12, 72, 4]],
        [[0, 74, 6], [6, 69, 2], [8, 74, 4], [12, 77, 4]], [[0, 82, 8], [8, 81, 4], [12, 79, 4]], [[0, 79, 4], [4, 82, 4], [8, 86, 8]], [[0, 85, 6], [6, 81, 2], [8, 81, 8]]] },
    tran: { bpm: 128, hop: ['Em', 'Cb', 'G', 'D', 'Em', 'Cb', 'Am', 'B'],
      giai: [[[0, 76, 3], [3, 76, 3], [6, 79, 2], [8, 83, 6], [14, 81, 2]], [[0, 79, 6], [6, 76, 2], [8, 84, 8]], [[0, 83, 6], [6, 81, 2], [8, 79, 4], [12, 74, 4]], [[0, 78, 12], [12, 81, 4]],
        [[0, 76, 3], [3, 76, 3], [6, 79, 2], [8, 83, 6], [14, 81, 2]], [[0, 79, 4], [4, 84, 4], [8, 88, 8]], [[0, 88, 4], [4, 86, 4], [8, 84, 4], [12, 81, 4]], [[0, 87, 6], [6, 83, 2], [8, 83, 8]]] },
    trum: { hop: ['Em', 'Fb', 'Em', 'D', 'Cb', 'Fb', 'B', 'B'],
      giai: [[[0, 76, 6], [6, 71, 2], [8, 76, 2], [10, 77, 2], [12, 79, 4]], [[0, 81, 8], [8, 79, 4], [12, 77, 4]], [[0, 76, 12], [12, 71, 4]], [[0, 74, 6], [6, 76, 2], [8, 78, 8]],
        [[0, 79, 6], [6, 76, 2], [8, 79, 4], [12, 84, 4]], [[0, 84, 6], [6, 81, 2], [8, 77, 8]], [[0, 78, 4], [4, 83, 4], [8, 87, 8]], [[0, 83, 16]]] },
  };
  const ARP = [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 4, 3, 1];
  const BRASS = { 0: 3, 3: 2, 6: 2, 10: 2, 12: 3 }; // nhịp kèn đồng trùm: bước → độ dài

  // ======================= MÁY NHẠC (1 máy / 1 AudioContext) =======================
  function tao(c, dich, opt) {
    opt = opt || {};
    const offline = !!opt.offline, E = { c, M: taoMau(c), pha: [], canh: -1, giu: 0, I: 0.15, ep: null, tk: { song: 0, max: 0, tao: 0 } };
    const pan = !!c.createStereoPanner;
    // ---- chuỗi tổng ----
    E.lp = c.createBiquadFilter(); E.lp.type = 'lowpass'; E.lp.frequency.value = 18000; E.lp.Q.value = 0.5; E.lp.connect(dich);
    E.sat = c.createWaveShaper(); { const n = 2048, cv = new Float32Array(n), k = 1.7; for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.tanh(x * k) / Math.tanh(k); } E.sat.curve = cv; E.sat.oversample = '2x'; }
    E.sat.connect(E.lp);
    E.glue = c.createDynamicsCompressor(); E.glue.threshold.value = -16; E.glue.knee.value = 8; E.glue.ratio.value = 3.5; E.glue.attack.value = 0.012; E.glue.release.value = 0.22;
    E.trim = c.createGain(); E.trim.gain.value = 0.55; E.glue.connect(E.trim); E.trim.connect(E.sat);
    E.loop = c.createGain(); E.loop.connect(E.glue);              // vòng lặp (bị hạ khi có stinger)
    E.sc = c.createGain(); E.sc.connect(E.loop);                  // lớp giai điệu: sidechain theo kick
    E.dr = c.createGain(); E.dr.connect(E.loop);                  // trống
    E.st = c.createGain(); E.st.gain.value = 0.9; E.st.connect(E.glue); // stinger
    // vang + delay (dùng chung)
    E.rev = c.createConvolver(); E.rev.buffer = E.M.ir; E.revIn = c.createGain(); E.revOut = c.createGain(); E.revOut.gain.value = 0.5;
    const revHp = c.createBiquadFilter(); revHp.type = 'highpass'; revHp.frequency.value = 220;
    E.revIn.connect(revHp); revHp.connect(E.rev); E.rev.connect(E.revOut); E.revOut.connect(E.glue);
    E.stRev = c.createGain(); E.stRev.gain.value = 0.45; E.st.connect(E.stRev); E.stRev.connect(E.revIn);
    E.dlyIn = c.createGain(); {
      const L = c.createDelay(2), Rr = c.createDelay(2), fb = c.createGain(), lp = c.createBiquadFilter(), m = c.createChannelMerger(2), w = c.createGain();
      fb.gain.value = 0.38; lp.type = 'lowpass'; lp.frequency.value = 3800; w.gain.value = 0.5; E.dL = L; E.dR = Rr;
      E.dlyIn.connect(L); L.connect(Rr); Rr.connect(lp); lp.connect(fb); fb.connect(L); L.connect(m, 0, 0); Rr.connect(m, 0, 1); m.connect(w); w.connect(E.glue); w.connect(E.revIn);
    }
    // rung (vibrato) dùng chung cho lead / hợp xướng — nối vào osc.detune, gỡ khi nốt xong
    E.vib = c.createOscillator(); E.vib.frequency.value = 5.2; E.vibG = c.createGain(); E.vibG.gain.value = 14; E.vib.connect(E.vibG); E.vib.start();

    // ---- giọng theo nốt: tự dọn ----
    function vo() { return { ds: [], src: [], het: 0, pv: [] }; }
    function nd(v, x) { v.ds.push(x); return x; }
    function g(v, x) { const n = nd(v, c.createGain()); n.gain.value = x == null ? 0 : x; return n; }
    function f(v, type, fr, q) { const b = nd(v, c.createBiquadFilter()); b.type = type; b.frequency.value = fr; if (q != null) b.Q.value = q; return b; }
    function o(v, type, fr, t0, t1, cent) { const x = nd(v, c.createOscillator()); x.type = type; x.frequency.setValueAtTime(fr, t0); if (cent) x.detune.value = cent; x.start(t0); x.stop(t1); x._h = t1; v.src.push(x); if (t1 > v.het) v.het = t1; return x; }
    function bs(v, b, t, rate) { const x = nd(v, c.createBufferSource()); x.buffer = b; if (rate) x.playbackRate.value = rate; x.start(t); const t1 = t + b.duration / (rate || 1); x._h = t1; v.src.push(x); if (t1 > v.het) v.het = t1; return x; }
    function xong(v) {
      if (!v.src.length) { don(v); return; }
      let s = v.src[0]; for (const x of v.src) if (x._h > s._h) s = x;
      s.onended = () => don(v);
      if (!offline) { E.tk.song++; E.tk.tao++; if (E.tk.song > E.tk.max) E.tk.max = E.tk.song; v.dem = true; setTimeout(() => don(v), Math.max(0, v.het - c.currentTime) * 1000 + 4000); }
    }
    function don(v) {
      if (v.xong) return; v.xong = true;
      for (const p of v.pv) { try { E.vibG.disconnect(p); } catch (e) { } }
      for (const x of v.ds) { try { x.disconnect(); } catch (e) { } }
      if (v.dem) E.tk.song--; v.ds = v.src = v.pv = null;
    }
    // đường bao ADSR an toàn (luôn ramp, không lách tách)
    function adsr(p, t, a, dinh, giu, d, nha) {
      p.setValueAtTime(0, t); p.linearRampToValueAtTime(dinh, t + a);
      if (giu > a) { p.setTargetAtTime(dinh * 0.7, t + a, (giu - a) * 0.5 + 0.01); p.setValueAtTime(dinh * 0.7, t + giu); }
      p.linearRampToValueAtTime(0, t + Math.max(giu, a) + (nha || d || 0.05));
    }

    // ---- nhạc cụ ----
    function trong(dich2, buf, t, vol, rate) { const v = vo(), s = bs(v, buf, t, rate), gg = g(v, vol); s.connect(gg); gg.connect(dich2); xong(v); }
    // pad supersaw: 3 răng cưa lệch ±13 cent mỗi nốt, trái/giữa/phải
    function pad(P, ch, t, d, vol) {
      const v = vo(), gL = g(v), gC = g(v), gR = g(v), t1 = t + d + 0.45;
      for (const m of ch.v) { o(v, 'sawtooth', hz(m), t, t1, -13).connect(gL); o(v, 'sawtooth', hz(m), t, t1, 0).connect(gC); o(v, 'sawtooth', hz(m), t, t1, 13).connect(gR); }
      for (const x of [gL, gC, gR]) adsr(x.gain, t, 0.06, vol, d, 0, 0.4);
      gL.connect(P.pL); gR.connect(P.pR); gC.connect(P.padF); xong(v);
    }
    function bass(P, m, t, d, sang, vol) {
      const v = vo(), lp = f(v, 'lowpass', sang, 7), gg = g(v), t1 = t + d + 0.05;
      lp.frequency.setValueAtTime(sang, t); lp.frequency.exponentialRampToValueAtTime(Math.max(160, sang * 0.18), t + Math.max(0.08, d * 0.85));
      o(v, 'sawtooth', hz(m), t, t1).connect(lp); o(v, 'sawtooth', hz(m), t, t1, 9).connect(lp);
      const sq = o(v, 'square', hz(m - 12), t, t1), sg = g(v, 0.35); sq.connect(sg); sg.connect(lp);
      lp.connect(gg); adsr(gg.gain, t, 0.004, vol, d * 0.85, 0, 0.04); gg.connect(P.L.bass); xong(v);
    }
    function arp(P, m, t, sang, vol, saw) {
      const v = vo(), lp = f(v, 'lowpass', sang, 5), gg = g(v);
      lp.frequency.setValueAtTime(sang * 1.6, t); lp.frequency.exponentialRampToValueAtTime(sang * 0.4, t + 0.13);
      o(v, saw ? 'sawtooth' : 'square', hz(m), t, t + 0.2).connect(lp); if (saw) o(v, 'sawtooth', hz(m), t, t + 0.2, 11).connect(lp);
      lp.connect(gg); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(vol, t + 0.003); gg.gain.exponentialRampToValueAtTime(0.0008, t + 0.17); gg.gain.linearRampToValueAtTime(0, t + 0.18);
      gg.connect(P.L.arp); xong(v);
    }
    // lead anh hùng: 2 răng cưa + vuông quãng tám dưới, lướt (portamento) từ nốt trước, rung trễ
    function lead(P, m, t, d, vol, lop) {
      const v = vo(), fr = hz(m), tu = P.leadF ? Math.min(P.leadF, fr * 2) : fr, lp = f(v, 'lowpass', 2600, 2), gg = g(v), t1 = t + d + 0.25;
      const oo = [o(v, 'sawtooth', tu, t, t1, -7), o(v, 'sawtooth', tu, t, t1, 7), o(v, 'square', tu / 2, t, t1)];
      for (const x of oo) { x.frequency.setValueAtTime(x === oo[2] ? tu / 2 : tu, t); x.frequency.exponentialRampToValueAtTime(x === oo[2] ? fr / 2 : fr, t + 0.045); }
      const sg = g(v, 0.4); oo[2].connect(sg); sg.connect(lp); oo[0].connect(lp); oo[1].connect(lp);
      if (d > 0.3) for (const x of oo) { E.vibG.connect(x.detune); v.pv.push(x.detune); }
      lp.frequency.setValueAtTime(1200, t); lp.frequency.linearRampToValueAtTime(lop || 3400, t + 0.06); lp.frequency.setTargetAtTime(2200, t + 0.08, 0.3);
      lp.connect(gg); adsr(gg.gain, t, 0.012, vol, d, 0, 0.18); gg.connect(P.L.lead); P.leadF = fr; xong(v);
    }
    // kèn đồng synth (brass stab): chồng răng cưa, lọc mở "bwah" rồi đóng
    function brass(dich2, ch, t, d, vol, cao) {
      const v = vo(), lp = f(v, 'lowpass', 500, 3), gg = g(v), t1 = t + d + 0.3;
      for (const m of ch) { o(v, 'sawtooth', hz(m), t, t1, -6).connect(lp); o(v, 'sawtooth', hz(m), t, t1, 6).connect(lp); }
      lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(cao || 3200, t + 0.05); lp.frequency.setTargetAtTime(900, t + 0.06, d * 0.4 + 0.03);
      lp.connect(gg); adsr(gg.gain, t, 0.015, vol, d, 0, 0.12); gg.connect(dich2); xong(v);
    }
    // hợp xướng: răng cưa qua 3 formant "aah", tấn công chậm, rung
    function choir(dich2, ch, t, d, vol) {
      const v = vo(), mix = g(v, 1), gg = g(v), t1 = t + d + 0.8;
      for (const m of ch) for (const cent of [-9, 9]) { const x = o(v, 'sawtooth', hz(m), t, t1, cent); x.connect(mix); E.vibG.connect(x.detune); v.pv.push(x.detune); }
      for (const [fr, q, k] of [[730, 7, 1], [1150, 8, 0.6], [2700, 10, 0.25]]) { const b = f(v, 'bandpass', fr, q), kg = g(v, k); mix.connect(b); b.connect(kg); kg.connect(gg); }
      gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(vol, t + Math.min(0.5, d * 0.4)); gg.gain.setValueAtTime(vol, t + d); gg.gain.linearRampToValueAtTime(0, t + d + 0.7);
      gg.connect(dich2); xong(v);
    }
    // BRAAM: chồng răng cưa trầm + quãng 5, lọc mở chậm (stinger trùm)
    function braam(dich2, t, d, vol) {
      const v = vo(), lp = f(v, 'lowpass', 200, 4), gg = g(v), t1 = t + d + 0.5;
      for (const [m, cent] of [[28, 0], [40, -10], [40, 10], [47, -8], [47, 8], [52, 0]]) o(v, 'sawtooth', hz(m), t, t1, cent).connect(lp);
      lp.frequency.setValueAtTime(180, t); lp.frequency.exponentialRampToValueAtTime(1800, t + 0.35); lp.frequency.exponentialRampToValueAtTime(300, t + d);
      lp.connect(gg); adsr(gg.gain, t, 0.03, vol, d, 0, 0.5); gg.connect(dich2); xong(v);
    }

    // ---- người chơi (1 bản đang phát) ----
    function taoPha(canh, t0) {
      const ban = canh === 0 ? BAN.menu : BAN.tran, sd = 60 / ban.bpm / 4;
      const P = { canh, ban, sd, bar: sd * 16, buoc: 0, tiep: t0, L: {}, ds: [], on: {}, het: {}, tDung: Infinity, trum: false, trumMoi: false, leadF: 0, vong: 0, I: E.I };
      const nut = (x) => { P.ds.push(x); return x; };
      P.vao = nut(c.createGain()); P.vao.gain.setValueAtTime(0, t0); P.vao.gain.linearRampToValueAtTime(1, t0 + P.bar * 0.75);
      P.vaoD = nut(c.createGain()); P.vaoD.gain.setValueAtTime(0, t0); P.vaoD.gain.linearRampToValueAtTime(1, t0 + P.bar * 0.75);
      P.vao.connect(E.sc); P.vaoD.connect(E.dr);
      const lop = (ten, trongTrong, rev, dly) => { const x = nut(c.createGain()); x.gain.value = 0; x.connect(trongTrong ? P.vaoD : P.vao);
        if (rev) { const s = nut(c.createGain()); s.gain.value = rev; x.connect(s); s.connect(E.revIn); }
        if (dly) { const s = nut(c.createGain()); s.gain.value = dly; x.connect(s); s.connect(E.dlyIn); }
        P.L[ten] = x; return x; };
      lop('pad', 0, 0.35); lop('bass', 0); lop('arp', 0, 0.2, 0.3); lop('lead', 0, 0.3, 0.32); lop('brass', 0, 0.3); lop('choir', 0, 0.5);
      lop('kick', 1); lop('snare', 1, 0.18); lop('hat', 1, 0.05); lop('perc', 1, 0.25);
      if (pan) { const hp = nut(c.createStereoPanner()); hp.pan.value = 0.25; P.L.hat.disconnect(); P.L.hat.connect(hp); hp.connect(P.vaoD); const s = nut(c.createGain()); s.gain.value = 0.05; P.L.hat.connect(s); s.connect(E.revIn); }
      P.padF = nut(c.createBiquadFilter()); P.padF.type = 'lowpass'; P.padF.Q.value = 1.2; P.padF.frequency.value = 1500; P.padF.connect(P.L.pad);
      P.pL = nut(pan ? c.createStereoPanner() : c.createGain()); P.pR = nut(pan ? c.createStereoPanner() : c.createGain());
      if (pan) { P.pL.pan.value = -0.7; P.pR.pan.value = 0.7; } P.pL.connect(P.padF); P.pR.connect(P.padF);
      return P;
    }
    function bat(P, ten, on, t, muc) {
      muc = muc == null ? 1 : muc;
      if (on) { if (!P.on[ten] || P.on[ten] !== muc) { P.L[ten].gain.setTargetAtTime(muc, t, P.on[ten] ? 0.3 : 0.5); P.on[ten] = muc; P.het[ten] = Infinity; } }
      else if (P.on[ten]) { P.L[ten].gain.setTargetAtTime(0, t, 0.35); P.on[ten] = 0; P.het[ten] = t + P.bar * 1.2; }
    }
    const co = (P, ten, t) => P.on[ten] || t < (P.het[ten] || 0);
    function bom(t, sau) { const p = E.sc.gain; p.setValueAtTime(1, t); p.linearRampToValueAtTime(1 - sau, t + 0.008); p.linearRampToValueAtTime(1, t + 0.2); }

    // ---- đầu ô nhịp: quyết định lớp theo cường độ ----
    function dauBar(P, t) {
      const b = P.buoc >> 4, ob = b & 7;
      if (P.canh === 0) {
        // MENU 16 ô: lần đầu 4 ô intro (pad + bass + arp lọc, riser), rồi trống; ô 8–15 có giai điệu chính
        const intro = P.vong === 0 && b < 4, B2 = (b & 15) >= 8;
        bat(P, 'pad', 1, t); bat(P, 'bass', 1, t); bat(P, 'arp', 1, t, intro ? 0.6 : 1);
        bat(P, 'kick', !intro, t); bat(P, 'snare', !intro, t); bat(P, 'hat', !intro, t); bat(P, 'perc', 1, t); bat(P, 'lead', B2 && !intro, t);
        P.padF.frequency.setTargetAtTime(intro ? 900 + b * 300 : B2 ? 3200 : 2300, t, 0.6);
        P.f = { intro, kick: !intro, sn: !intro, h16: B2, oh: false, arp16: true, saw: B2, lead: B2 && !intro, bass: intro ? 1 : 2, fill: !intro && (ob === 7), crash: !intro && (b & 7) === 0 && b > 0 || (P.vong === 0 && b === 4) };
        if (P.vong === 0 && b === 2) trong(P.L.perc, E.M.riser, t, 0.55, 3.6 / (P.bar * 2));
        return;
      }
      // TRẬN / TRÙM
      if (P.trumMoi !== P.trum && (ob === 0 || P.trumMoi)) { P.trum = P.trumMoi; P.buoc = 0; P.leadF = 0; } // vào trùm: ngay ô sau, từ đầu vòng hợp âm; ra: hết vòng 8 ô
      const I = P.trum ? 1 : (E.ep != null ? E.ep : E.I), T = P.trum;
      const kick = T || I >= 0.2, sn = T || I >= 0.42, h16 = T || I >= 0.42, ld = T || (I >= 0.7 && (P.vong & 1) === 0 || I >= 0.85);
      bat(P, 'pad', 1, t, T ? 0.8 : 1); bat(P, 'bass', 1, t); bat(P, 'arp', I >= 0.3 || T, t, T ? 0.7 : 1); bat(P, 'kick', kick, t); bat(P, 'snare', sn, t); bat(P, 'hat', I >= 0.08 || T, t);
      bat(P, 'lead', ld, t, T ? 0.85 : 1); bat(P, 'brass', T, t); bat(P, 'choir', T, t); bat(P, 'perc', 1, t);
      P.padF.frequency.setTargetAtTime(T ? 2600 : 900 + 2600 * I, t, 0.8);
      P.f = { kick, sn, h16, oh: !T && I >= 0.7, arp16: I >= 0.45 || T, saw: I >= 0.6 || T, lead: ld, bass: T ? 4 : I >= 0.42 ? 3 : I >= 0.2 ? 2 : 1, fill: sn && ob === 7, crash: (I >= 0.7 || T) && ob === 0, tom: T && (b & 3) === 3, I };
    }

    function buoc(P) {
      const t = P.tiep, s = P.buoc & 15;
      if (s === 0) { if (P.buoc > 0 && ((P.buoc >> 4) & 7) === 0) P.vong++; dauBar(P, t); }
      const b = P.buoc >> 4, ob = b & 7, ban = P.trum ? BAN.trum : P.ban;
      const F = P.f, ch = H[ban.hop[ob]], menu = P.canh === 0;
      // pad: 1 hợp âm / ô nhịp
      if (s === 0 && co(P, 'pad', t)) pad(P, ch, t, P.bar, menu ? 0.03 : 0.026);
      // kick 4/4 + sidechain
      if (F.kick && s % 4 === 0) { trong(P.L.kick, E.M.kick, t, 1); bom(t, menu ? 0.5 : 0.6); }
      else if (!F.kick && s === 0 && !menu) bom(t, 0.25);
      // snare cổng 2 & 4 (+ clap khi mạnh) + cuộn lấp (fill) ô cuối
      if (F.sn) {
        if (s === 4 || s === 12) { trong(P.L.snare, E.M.snare, t, 0.9); if (!menu && F.I >= 0.55 || P.trum) trong(P.L.snare, E.M.clap, t + 0.004, 0.5); }
        else if (F.fill && s >= 13) trong(P.L.snare, E.M.snare, t, 0.3 + (s - 12) * 0.12, 1.05);
        else if (F.fill && s === 10 && P.trum) trong(P.L.snare, E.M.snare, t, 0.35);
      }
      if (F.crash && s === 0) trong(P.L.perc, E.M.crash, t, 0.5);
      if (F.tom && s >= 12) trong(P.L.perc, E.M.tom, t, 0.75, [1.5, 1.25, 1.05, 0.85][s - 12]);
      // hat
      if (co(P, 'hat', t)) {
        if (s % 4 === 2) trong(P.L.hat, F.oh && (s === 6 || s === 14) ? E.M.ohat : E.M.hat, t, F.oh && (s === 6 || s === 14) ? 0.32 : 0.5);
        else if (F.h16) trong(P.L.hat, E.M.hat, t, s % 2 ? 0.26 : 0.18, 1.1);
        if (P.trum && (b & 1) && s >= 14) trong(P.L.hat, E.M.hat, t + P.sd / 2, 0.22, 1.2); // cuộn 32
      }
      // bass
      if (co(P, 'bass', t)) {
        const r = ch.r, ac = s % 4 === 0;
        if (F.bass === 1) { if (s === 0 || s === 8) bass(P, r, t, P.sd * 7.5, 700, 0.22); }
        else if (F.bass === 2) { if (s % 2 === 0) bass(P, r + (s % 8 === 6 ? 12 : 0), t, P.sd * 1.7, ac ? 1500 : 1000, 0.24); }
        else if (F.bass === 3) { if (s % 4) bass(P, r + (s % 4 === 2 ? 12 : 0), t, P.sd * 0.9, s % 4 === 1 ? 1900 : 1300, 0.24); }
        else { bass(P, r + (s % 4 === 2 ? 12 : 0), t, P.sd * 0.85, ac ? 2600 : 1500, 0.22); }
      }
      // arp
      if (co(P, 'arp', t) && (F.arp16 || s % 2 === 0)) {
        const ext = ch.v.concat(ch.v.map(x => x + 12));
        arp(P, ext[ARP[s]] + (menu ? 12 : 12), t, F.saw ? 3000 : menu && F.intro ? 1200 + b * 400 : 2000, F.saw ? 0.05 : 0.06, F.saw);
      }
      // giai điệu chính
      if (co(P, 'lead', t) && F.lead) for (const [st, m, d] of ban.giai[ob]) if (st === s) lead(P, m, t, d * P.sd, P.trum ? 0.065 : 0.07);
      // trùm: kèn đồng + hợp xướng
      if (P.trum) {
        if (BRASS[s] != null && co(P, 'brass', t)) brass(P.L.brass, [ch.r + 12, ch.v[0], ch.v[1], ch.v[2], ch.v[3]], t, BRASS[s] * P.sd, 0.05, s === 0 ? 3600 : 2600);
        if (s === 0 && co(P, 'choir', t)) choir(P.L.choir, ch.v.slice(1).map(x => x + 12), t, P.bar, 0.07);
      }
      P.tiep += P.sd; P.buoc++;
    }

    // ---- lịch (gọi định kỳ; offline: gọi 1 lần với 'den' = hết bản) ----
    const bayGio = () => offline ? (E.tAo || 0) : c.currentTime; // offline: "bây giờ" = mốc lịch đã tới
    E.lich = function (den) {
      const now = bayGio(), toi = den != null ? den : now + 0.3;
      // tạm dừng game: nhạc mờ (lọc thấp + nhỏ lại)
      if (!offline) { const dung = typeof G !== 'undefined' && G && G.dung && E.canh > 0; if (dung !== E.mo) { E.mo = dung; E.lp.frequency.setTargetAtTime(dung ? 650 : 18000, now, 0.12); E.trim.gain.setTargetAtTime(dung ? 0.35 : 0.55, now, 0.12); } }
      if (!offline && E.canh >= 1 && !(now - (E.tI || 0) < 1)) { E.tI = now; E.capNhatI(); }
      if (E.canhCho != null && now >= E.giu) { const k = E.canhCho; E.canhCho = null; doiCanh(k, now); }
      for (const P of E.pha) {
        if (!offline && P.tiep < now - 0.05) { const lo = Math.ceil((now + 0.05 - P.tiep) / P.sd); P.tiep += lo * P.sd; P.buoc += lo; } // trễ (tab ẩn / máy đứng): bỏ nốt lỡ
        while (P.tiep < toi && P.tiep < P.tDung) buoc(P);
      }
      if (offline) E.tAo = toi;
      for (let i = E.pha.length - 1; i >= 0; i--) { const P = E.pha[i]; if (P.tiep >= P.tDung && now > P.tDung + 3) { for (const x of P.ds) { try { x.disconnect(); } catch (e) { } } E.pha.splice(i, 1); } }
    };
    function hienTai() { return E.pha.find(P => P.tDung === Infinity); }
    function doiCanh(canh, now) {
      const cu = hienTai(), laTran = (k) => k >= 1;
      if (cu && laTran(cu.canh) && laTran(canh)) { cu.trumMoi = canh === 2; return; } // trận ↔ trùm: cùng bản, đổi ở đầu ô nhịp
      if (laTran(canh) && !(cu && laTran(cu.canh))) E.I = 0.15; // trận mới: bắt đầu êm
      let t0 = now + 0.08;
      if (cu) { const conLai = (16 - (cu.buoc & 15)) % 16; t0 = cu.tiep + conLai * cu.sd; if (conLai === 0) t0 = cu.tiep; if (t0 - now > cu.bar * 0.55) t0 = cu.tiep + ((4 - (cu.buoc & 3)) % 4) * cu.sd; // tới phách gần
        cu.vao.gain.setTargetAtTime(0, t0, cu.bar * 0.22); cu.vaoD.gain.setTargetAtTime(0, t0, cu.bar * 0.15); cu.tDung = t0 + cu.bar; }
      if (E.loop.gain.value < 0.99 || E.giu) { E.loop.gain.cancelScheduledValues(now); E.loop.gain.setValueAtTime(E.loop.gain.value, now); E.loop.gain.linearRampToValueAtTime(1, Math.max(t0, now + 0.05)); E.giu = 0; }
      const P = taoPha(canh, Math.max(t0, now + 0.05)); P.trum = P.trumMoi = canh === 2; E.pha.push(P);
    }
    E.datCanh = function (canh) {
      if (canh === E.canh && E.canhCho == null) return; E.canh = canh;
      const now = bayGio();
      if (now < E.giu) { E.canhCho = canh; return; }
      doiCanh(canh, now);
    };
    E.dungHet = function () { const now = bayGio(); for (const P of E.pha) if (P.tDung > now) { P.vao.gain.setTargetAtTime(0, now, 0.1); P.vaoD.gain.setTargetAtTime(0, now, 0.1); P.tDung = now + 0.3; } E.canh = -1; E.canhCho = null; };
    // cường độ trận (0..1): từ wave + số quái trên sân; lên nhanh, xuống chậm. ep = ép tay (sfxlab / xuất file)
    E.capNhatI = function () {
      if (typeof G === 'undefined' || !G) return;
      const w = G.wave || 1, q = (G.quai || []).filter(e => !e.chet).length;
      const muc = Math.min(1, 0.12 + 0.68 * Math.min(1, (w - 1) / 30) + 0.22 * Math.min(1, q / 22));
      E.I = muc > E.I ? Math.min(muc, E.I + 0.18) : Math.max(muc, E.I - 0.04);
    };
    // ---- STINGER ----
    E.sting = function (kieu, t) {
      t = t == null ? bayGio() + 0.02 : t;
      const st = E.st, lp = E.loop.gain;
      const tatVong = () => { for (const P of E.pha) if (P.tDung > t) { P.vao.gain.setTargetAtTime(0, t, 0.05); P.vaoD.gain.setTargetAtTime(0, t, 0.05); P.tDung = t + 0.3; } };
      const ha = (sau, dai) => { lp.cancelScheduledValues(t); lp.setValueAtTime(lp.value, t); lp.linearRampToValueAtTime(sau, t + 0.04); if (dai) lp.setTargetAtTime(1, t + dai, dai * 0.25); };
      if (kieu === 'trum') {
        ha(0.25, 2.2);
        trong(st, E.M.impact, t, 1.1); trong(st, E.M.crash, t, 0.55, 0.8); braam(st, t, 2.2, 0.16);
        brass(st, [40, 52, 59, 64, 67, 71], t, 0.5, 0.075, 4200); brass(st, [41, 53, 60, 65, 69, 72], t + 0.6, 0.35, 0.06, 3600); brass(st, [40, 52, 59, 64, 67, 71], t + 1.0, 1.2, 0.075, 4200);
        choir(st, [64, 67, 71, 76], t + 0.1, 2.2, 0.11);
        return 3.2;
      }
      if (kieu === 'thang') {
        tatVong(); E.giu = t + 5.2;
        const b = 60 / 128, tr = b / 3; // E trưởng: kèn kèn kèn – NGÂN
        const nt = [[0, 71, tr * 0.9], [tr, 71, tr * 0.9], [tr * 2, 71, tr * 0.9], [b, 76, b * 1.4], [b * 2.5, 80, b * 0.45], [b * 3, 83, b * 3]];
        for (const [o2, m, d] of nt) { brass(st, [m, m - 12, m - 5], t + o2, d, 0.07, 4000); }
        trong(st, E.M.kick, t, 0.9); trong(st, E.M.kick, t + b, 0.9); trong(st, E.M.impact, t + b * 3, 0.6); trong(st, E.M.crash, t + b * 3, 0.6);
        for (let i = 0; i < 4; i++) trong(st, E.M.tom, t + b * 2 + i * tr * 0.75, 0.7, [1.6, 1.35, 1.15, 0.95][i]);
        brass(st, [40, 52, 59, 64, 68, 71, 76], t + b * 3, b * 5, 0.055, 3000);
        choir(st, [64, 68, 71, 76], t + b * 3, b * 5, 0.12); pad({ pL: st, pR: st, padF: st }, { v: [64, 68, 71, 76, 80] }, t + b * 3, b * 5, 0.022);
        for (let i = 0; i < 8; i++) arp({ L: { arp: st } }, [76, 80, 83, 88][i & 3] + (i > 3 ? 12 : 0), t + b * 3 + i * b / 4, 3500, 0.04, true);
        return 5.2;
      }
      if (kieu === 'thua') {
        tatVong(); E.giu = t + 4.2;
        const b = 60 / 128;
        trong(st, E.M.impact, t, 0.7);
        [[[40, 52, 59, 64, 67], 0], [[36, 48, 55, 60, 64], b * 1.5], [[33, 45, 52, 57, 60, 64], b * 3]].forEach(([cc, o2], i) => brass(st, cc, t + o2, i < 2 ? b * 1.4 : b * 4, 0.06, i < 2 ? 2400 : 1600));
        choir(st, [57, 60, 64], t + b * 3, b * 4, 0.1);
        // "tape stop": hạ cao độ cả hợp âm cuối
        const v = vo(), lp2 = f(v, 'lowpass', 1800, 2), gg = g(v), t2 = t + b * 3;
        for (const m of [45, 52, 57, 60]) { const x = o(v, 'sawtooth', hz(m), t2, t2 + b * 4 + 0.2, 0); x.frequency.setValueAtTime(hz(m), t2 + b * 2.4); x.frequency.exponentialRampToValueAtTime(hz(m) * 0.25, t2 + b * 4); x.connect(lp2); }
        lp2.frequency.setValueAtTime(1800, t2 + b * 2.4); lp2.frequency.exponentialRampToValueAtTime(200, t2 + b * 4);
        lp2.connect(gg); adsr(gg.gain, t2, 0.05, 0.05, b * 4, 0, 0.1); gg.connect(st); xong(v);
        return 4.2;
      }
      return 0;
    };
    // huỷ hẳn máy (nhạc tắt): ngắt khỏi đích → trình duyệt thôi xử lý vang/delay khi im
    E.huy = function () { E.dungHet(); try { E.vib.stop(); } catch (e) { } for (const x of [E.lp, E.sat, E.trim, E.glue, E.loop, E.sc, E.dr, E.st, E.stRev, E.revIn, E.rev, E.revOut, E.dlyIn, E.dL, E.dR, E.vibG]) { try { x.disconnect(); } catch (e) { } } };
    return E;
  }
  return { tao, BAN, H };
})();
