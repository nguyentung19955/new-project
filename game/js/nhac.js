// Nhạc nền tạo bằng code (WebAudio), KHÔNG dùng tệp âm thanh. Nạp sau js/engine.js (dùng G.amThanh: bộ âm thanh chung, âm lượng).
//
//   Làng          điệu Bắc (ngũ cung Rê), chậm 70 nhịp/phút: sáo trúc và đàn bầu thay nhau hát, đàn tranh rải nhẹ, phách thưa.
//   Rừng già      điệu Bắc (La), 96 nhịp: trống đất, trống con, đàn tranh trầm, sáo / đàn bầu, tiếng côn trùng lách tách.
//   Hang biển     điệu Oán (Rê), 84 nhịp: đàn tranh rải đều như sóng, đàn bầu hát, trống thưa, tiếng sóng dâng rút.
//   Lâu đài cổ    điệu Oán (Mi), 108 nhịp: trống chầu, phách, chiêng mở mỗi vòng, sáo / đàn bầu.
//   Trùm          trống dồn 128 nhịp (mỗi pha nhanh thêm 7%), chiêng, đàn tranh dồn bè trầm; giọng theo vùng.
// Đổi cảnh thì bài cũ nhỏ dần, bài mới to dần (khoảng 1 giây). Chỉ phát sau lần chạm đầu tiên (luật iOS, G.audioStart ở js/engine.js).
// Lên lịch nốt trước 0,35 giây bằng một bộ đếm 120 ms (không chạy theo khung hình): rất nhẹ máy. Ẩn trang / tắt âm thanh / nhạc 0 thì dừng.
// Tắt hẳn: ?nhac=0 (hoặc G.nhac.tat = true).
(function () {
  'use strict';
  const G = window.G;
  let tatQS = false;
  try { tatQS = /[?&]nhac=0(&|$)/.test(location.search || ''); } catch (e) { tatQS = false; }
  const N = (G.nhac = { tat: tatQS, ten: null });

  let ac = null, bus = null, noise = null;
  const BAC = [0, 2, 5, 7, 9], OAN = [0, 3, 5, 7, 10];
  function hz(root, scale, deg) { const n = scale.length, o = Math.floor(deg / n), i = ((deg % n) + n) % n; return root * Math.pow(2, (scale[i] + 12 * o) / 12); }

  // ---------- nhạc cụ (mỗi nốt vài nút WebAudio, tự dừng) ----------
  function osc(type, f, t) { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; }
  function gain(v, out) { const g = ac.createGain(); g.gain.value = v; if (out) g.connect(out); return g; }
  function noiseBuf() {
    if (noise && noise.sampleRate === ac.sampleRate) return noise;
    const n = Math.floor(ac.sampleRate * 1.5), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    let s = 12345; for (let i = 0; i < n; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = s / 2147483648 - 1; }
    return (noise = b);
  }
  // Tiếng gió / tiếng gõ: nhiễu qua bộ lọc dải
  function nhieu(out, t, dur, v, f, q, kieu) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf();
    const bf = ac.createBiquadFilter(); bf.type = kieu || 'bandpass'; bf.frequency.value = f; bf.Q.value = q || 1;
    const g = gain(0, out);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bf); bf.connect(g);
    s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  // Sáo trúc: tiếng tròn, luyến nhẹ lúc vào nốt, rung hơi ở nốt dài, có chút tiếng hơi thổi
  function sao(out, t, f, dur, v) {
    const o = osc('sine', f * 0.97, t), o2 = osc('triangle', f * 0.97, t), g = gain(0, out), g2 = gain(0.2, g);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.07); o2.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    if (dur > 0.55) {
      const l = osc('sine', 5.2, t), lg = gain(0); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.009, t + 0.45);
      l.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency); l.start(t); l.stop(t + dur + 0.2);
    }
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.05); g.gain.linearRampToValueAtTime(v * 0.72, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.16);
    o.connect(g); o2.connect(g2);
    o.start(t); o2.start(t); o.stop(t + dur + 0.2); o2.stop(t + dur + 0.2);
    nhieu(out, t, 0.09, v * 0.18, f * 2, 3);
  }
  // Đàn bầu: một dây, tiếng trong, nhấn cần đàn làm cao giọng rồi buông về ở nốt dài, rung sâu
  function bau(out, t, f, dur, v) {
    const o = osc('sine', f, t), o2 = osc('sine', f * 2, t), g = gain(0, out), g2 = gain(0.14, g);
    for (const x of [o, o2]) {
      const k = x === o ? 1 : 2;
      if (dur > 0.6) { x.frequency.setValueAtTime(f * k, t + dur * 0.5); x.frequency.linearRampToValueAtTime(f * k * 1.055, t + dur * 0.72); x.frequency.linearRampToValueAtTime(f * k, t + dur * 0.95); }
    }
    if (dur > 0.4) {
      const l = osc('sine', 4.6, t), lg = gain(0); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.014, t + 0.35);
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.3);
    }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.015); g.gain.exponentialRampToValueAtTime(v * 0.45, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    o.connect(g); o2.connect(g2);
    o.start(t); o2.start(t); o.stop(t + dur + 0.3); o2.stop(t + dur + 0.3);
  }
  // Đàn tranh: gảy dây, tắt dần tự nhiên (độ dài nốt không quan trọng)
  function tranh(out, t, f, dur, v) {
    const d = Math.min(1.5, 0.5 + dur * 1.6);
    const o = osc('triangle', f * 1.004, t), o2 = osc('sine', f * 2, t), g = gain(0, out), g2 = gain(0.3, g);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); o2.connect(g2);
    o.start(t); o2.start(t); o.stop(t + d + 0.02); o2.stop(t + d + 0.02);
  }
  // Trống: tiếng "thùng" trầm, cao độ tụt nhanh. chau: trống chầu (to, trầm, ngân lâu hơn)
  function trong(out, t, v, chau) {
    const f0 = chau ? 118 : 150, f1 = chau ? 44 : 52, d = chau ? 0.55 : 0.3;
    const o = osc('sine', f0, t), g = gain(0, out);
    o.frequency.exponentialRampToValueAtTime(f1, t + 0.16);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); o.start(t); o.stop(t + d + 0.02);
    nhieu(out, t, 0.03, v * 0.25, 900, 0.8);
  }
  // Trống con (gõ mặt nhỏ)
  function trongCon(out, t, v) {
    const o = osc('sine', 320, t), g = gain(0, out);
    o.frequency.exponentialRampToValueAtTime(190, t + 0.07);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g); o.start(t); o.stop(t + 0.12);
    nhieu(out, t, 0.06, v * 0.6, 1400, 1.2);
  }
  // Phách (thanh tre gõ vào nhau)
  function phach(out, t, v) { nhieu(out, t, 0.04, v, 2600, 7); }
  // Chiêng: tiếng ấm, nhiều bồi âm không đều, ngân dài; dai: hệ số độ ngân
  function chieng(out, t, f, v, dai) {
    dai = dai || 1;
    const P = [[1, 1, 2.4], [2.02, 0.38, 1.5], [2.78, 0.16, 0.9], [5.4, 0.05, 0.45]];
    const g = gain(1, out);
    for (const q of P) {
      const o = osc('sine', f * q[0] * (q[0] === 1 ? 1.015 : 1), t), gg = gain(0, g), d = q[2] * dai;
      if (q[0] === 1) o.frequency.exponentialRampToValueAtTime(f, t + 0.35);
      gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(v * q[1], t + 0.008); gg.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(gg); o.start(t); o.stop(t + d + 0.02);
    }
    const th = osc('sine', f * 0.5, t), tg = gain(0, g);
    tg.gain.setValueAtTime(0.0001, t); tg.gain.exponentialRampToValueAtTime(v * 0.4, t + 0.01); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 * dai);
    th.connect(tg); th.start(t); th.stop(t + 0.4 * dai);
  }
  // Sóng biển: tiếng xào xạc dâng lên rồi rút (hai ô nhịp)
  function song(out, t, dur, v) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
    const bf = ac.createBiquadFilter(); bf.type = 'lowpass'; bf.frequency.setValueAtTime(380, t); bf.frequency.linearRampToValueAtTime(900, t + dur * 0.45); bf.frequency.linearRampToValueAtTime(300, t + dur);
    const g = gain(0, out);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.45); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    s.connect(bf); bf.connect(g); s.start(t); s.stop(t + dur + 0.05);
  }
  // Côn trùng rừng: ba tiếng lách tách cao rất nhỏ
  function contrung(out, t, v) {
    const o = osc('square', 3800 + Math.random() * 900, t), g = gain(0, out);
    for (let i = 0; i < 3; i++) { const a = t + i * 0.06; g.gain.setValueAtTime(v, a); g.gain.setValueAtTime(0, a + 0.018); }
    o.connect(g); o.start(t); o.stop(t + 0.2);
  }
  const NC = { sao, bau, tranh };
  N.chieng = function (out, t, f, v, dai) { const a0 = ac; ac = out.context; try { chieng(out, t, f, v, dai); } finally { ac = a0; } }; // js/engine.js: tiếng "gong" của trận thành tiếng chiêng

  // ---------- bài nhạc: mỗi bè là một dòng chữ, mỗi ô là một nốt móc đơn ----------
  // Bè giai điệu: số = bậc trong thang 5 âm (0 = gốc, 5 = gốc cao hơn một quãng tám, -1 = bậc dưới gốc), "-" ngân tiếp, "." nghỉ.
  // Bè trống: x gõ, X gõ mạnh, r dồn hai tiếng (móc kép), g chiêng, w sóng, c côn trùng.
  function docBe(s) { return s.replace(/\|/g, ' ').trim().split(/\s+/); }
  function ghiBe(be) {
    const tok = docBe(be.p), ev = [];
    for (let i = 0; i < tok.length; i++) {
      const k = tok[i];
      if (k === '-' || k === '.') continue;
      if (/^-?\d+$/.test(k)) { let n = 1; while (tok[i + n] === '-') n++; ev.push({ s: i, deg: +k, len: n }); }
      else ev.push({ s: i, go: k });
    }
    return { be, ev, len: tok.length };
  }
  function bai(o) {
    o.vong = o.vong.map((v) => { const bs = v.map(ghiBe), len = Math.max(...bs.map((b) => b.len)); const theoO = []; for (let i = 0; i < len; i++) theoO.push([]); for (const b of bs) for (const e of b.ev) theoO[e.s].push([b.be, e]); return { len, theoO }; });
    return o;
  }
  const SAO = 0.1, BAU = 0.12, TRANH = 0.07, TRONG = 0.24, CON = 0.07, PHACH = 0.06;
  const B = {};
  B.lang = bai({ bpm: 70, root: 293.66, thang: BAC, vong: [
    [
      { n: 'sao', v: SAO, p: '3 - - 5 4 - 3 2 | 3 - - - - - 2 3 | 5 - 4 3 2 - 1 2 | 3 - - - - - . . | 2 - 3 5 3 - 2 1 | 0 - - 1 2 - - - | 1 - 2 3 2 - 1 0 | 0 - - - - - . .' },
      { n: 'tranh', v: TRANH * 0.8, o: -1, p: '0 . 2 . 4 . 2 . | 0 . 2 . 4 . 5 . | 2 . 4 . 5 . 4 . | 0 . 2 . 4 . 2 . | 2 . 4 . 6 . 4 . | 0 . 2 . 3 . 2 . | 1 . 3 . 4 . 3 . | 0 . 2 . 4 . 5 .' },
      { n: 'phach', v: PHACH * 0.6, p: 'x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . . .' },
    ], [
      { n: 'bau', v: BAU, p: '5 - - - 4 - 3 - | 4 - - - - - . . | 3 - 4 - 5 - 4 3 | 2 - - - - - . . | 3 - - 2 1 - 2 - | 3 - - - 5 - - - | 4 - 3 - 2 - 1 - | 0 - - - - - . .' },
      { n: 'tranh', v: TRANH * 0.8, o: -1, p: '0 . 2 . 4 . 2 . | 0 . 2 . 4 . 5 . | 2 . 4 . 5 . 4 . | 0 . 2 . 4 . 2 . | 2 . 4 . 6 . 4 . | 0 . 2 . 3 . 2 . | 1 . 3 . 4 . 3 . | 0 . 2 . 4 . 5 .' },
      { n: 'phach', v: PHACH * 0.6, p: 'x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . . . | x . . . . . . . | . . . . . . . .' },
    ],
  ] });
  const RUNG_TRONG = { n: 'trong', v: TRONG, p: 'x . . x . . x . | x . . x . . x . | x . . x . . x . | x . . x . x x .' };
  const RUNG_CON = { n: 'con', v: CON, p: '. . x . . . x . | . . x . . . x x | . . x . . . x . | . . x . . x . x' };
  const RUNG_BASS = { n: 'tranh', v: TRANH, o: -1, p: '0 . 0 2 . 0 3 . | 0 . 0 2 . 0 4 . | 2 . 2 4 . 2 5 . | 0 . 0 2 . 3 2 .' };
  const RUNG_SAU = { n: 'kk', v: 0.012, p: '. . . c . . . . | . . . . . . c . | . c . . . . . . | . . . . . c . .' };
  B.vung0 = bai({ bpm: 96, root: 220, thang: BAC, vong: [
    [RUNG_TRONG, RUNG_CON, RUNG_BASS, RUNG_SAU, { n: 'sao', v: SAO * 0.9, p: '5 - 7 - 8 7 5 . | 7 - - - . . . . | 8 - 9 8 7 - 5 7 | 5 - - - . . . .' }],
    [RUNG_TRONG, RUNG_CON, RUNG_BASS, RUNG_SAU, { n: 'bau', v: BAU, p: '9 - - 8 7 - - . | 8 - 7 5 7 - - . | 5 - 7 8 9 - 8 7 | 5 - - - - - . .' }],
  ] });
  const BIEN_ARP = { n: 'tranh', v: TRANH * 0.85, o: -1, p: '0 2 4 5 7 5 4 2 | -2 0 2 4 5 4 2 0 | -1 1 3 4 6 4 3 1 | 0 2 4 5 7 5 4 2' };
  const BIEN_TRONG = { n: 'trong', v: TRONG * 0.6, p: 'x . . . . . . . | x . . . . . . . | x . . . . . . . | x . . . x . . .' };
  const BIEN_SONG = { n: 'kk', v: 0.05, p: 'w . . . . . . . | . . . . . . . . | w . . . . . . . | . . . . . . . .' };
  B.vung1 = bai({ bpm: 84, root: 293.66, thang: OAN, vong: [
    [BIEN_ARP, BIEN_TRONG, BIEN_SONG, { n: 'bau', v: BAU, p: '5 - - - 4 - 3 - | 2 - - - - - . . | 3 - 4 - 5 - 7 - | 5 - - - - - . .' }],
    [BIEN_ARP, BIEN_TRONG, BIEN_SONG, { n: 'bau', v: BAU, p: '7 - - 6 5 - 4 - | 5 - - - 3 - - . | 4 - 3 - 2 - 1 - | 0 - - - - - . .' }],
  ] });
  const LD_TRONG = { n: 'chau', v: TRONG, p: 'X . . . x . x . | X . . . x . x . | X . . . x . x . | X . x . x x x .' };
  const LD_PHACH = { n: 'phach', v: PHACH, p: '. . x . . . x . | . . x . . . x . | . . x . . . x . | . x . x . x . x' };
  const LD_CHIENG = { n: 'kk', v: 0.07, p: 'g . . . . . . . | . . . . . . . . | . . . . . . . . | . . . . . . . .' };
  const LD_BASS = { n: 'tranh', v: TRANH, p: '0 . 0 . 1 . 0 . | 0 . 0 . 2 . 1 . | 0 . 0 . 1 . 0 . | 3 . 2 . 1 . -1 .' };
  B.vung2 = bai({ bpm: 108, root: 164.81, thang: OAN, vong: [
    [LD_TRONG, LD_PHACH, LD_CHIENG, LD_BASS, { n: 'sao', v: SAO * 0.9, p: '5 - 6 - 7 - 6 5 | 4 - - - 3 - 4 - | 5 - 7 - 8 - 7 6 | 5 - - - - - . .' }],
    [LD_TRONG, LD_PHACH, LD_CHIENG, LD_BASS, { n: 'bau', v: BAU, p: '7 - - - 8 - 7 6 | 5 - - - - - . . | 6 - 5 - 4 - 3 - | 5 - - - - - . .' }],
  ] });
  // Nhạc trùm: trống dồn. Giọng (gốc, thang) theo vùng; quãng tám bè trầm chọn cho vừa loa điện thoại.
  function trum(root, thang, ob) {
    const T1 = { n: 'trong', v: TRONG, p: 'X . x . X . x x | X . x . X x r r' };
    const T2 = { n: 'con', v: CON * 1.2, p: '. x . x . x . x | . x . x r r r r' };
    const CH = { n: 'kk', v: 0.08, p: 'g . . . . . . . | . . . . . . . .' };
    const BS = { n: 'tranh', v: TRANH * 1.1, o: ob, p: '0 0 3 0 2 0 3 4 | 0 0 3 0 2 3 4 5' };
    return bai({ bpm: 128, root, thang, trum: true, vong: [
      [T1, T2, CH, BS, { n: 'bau', v: BAU * 0.9, p: '5 . 4 . 5 . 7 . | 5 . 4 . 3 . 2 .' }],
      [T1, T2, CH, BS, { n: 'bau', v: BAU * 0.9, p: '7 . 8 . 7 . 5 . | 4 . 5 . 3 . 2 .' }],
    ] });
  }
  B.trum0 = trum(220, BAC, 0); B.trum1 = trum(293.66, OAN, -1); B.trum2 = trum(164.81, OAN, 0);
  N.BAI = B;

  // ---------- phát ----------
  let cur = null; // { ten, d: bài, g: nút âm lượng riêng, vi: vòng, o: ô, t: giờ của ô kế tiếp }
  function phatO(st, o, t, dO) {
    const d = st.d, R = d.root, th = d.thang, out = st.g, ds = d.vong[st.vi].theoO[o];
    for (const q of ds) {
      const be = q[0], e = q[1], v = be.v;
      if (e.go) {
        const k = e.go;
        if (be.n === 'trong' || be.n === 'chau') { if (k === 'r') { trong(out, t, v * 0.7, be.n === 'chau'); trong(out, t + dO / 2, v * 0.8, be.n === 'chau'); } else trong(out, t, k === 'X' ? v : v * 0.75, be.n === 'chau'); }
        else if (be.n === 'con') { if (k === 'r') { trongCon(out, t, v); trongCon(out, t + dO / 2, v * 0.85); } else trongCon(out, t, v); }
        else if (be.n === 'phach') phach(out, t, v);
        else if (k === 'g') chieng(out, t, R / 2, v, 1.1);
        else if (k === 'w') song(out, t, dO * 16, v);
        else if (k === 'c') contrung(out, t, v);
        continue;
      }
      const f = hz(R, th, e.deg + 5 * (be.o || 0)), lech = be.n === 'tranh' ? 0 : (Math.random() - 0.5) * 0.012;
      NC[be.n](out, t + Math.max(0, lech), f, e.len * dO * 0.96, v);
    }
  }
  function nhipNhanh(st) { // trùm sang pha mới thì trống dồn nhanh hơn
    if (!st.d.trum || !G.getRun) return 1;
    try { const S = G.getRun(), b = S && S.W && S.W.boss; return 1 + 0.07 * Math.min(2, (b && b.phase) | 0); } catch (e) { return 1; }
  }
  function lenLich(st, toi) {
    const now = ac.currentTime;
    if (st.t < now + 0.02) st.t = now + 0.06; // vừa ẩn trang / máy khựng: bỏ phần lỡ, không phát dồn
    let n = 0;
    while (st.t < toi && n++ < 24) {
      const dO = 60 / (st.d.bpm * nhipNhanh(st)) / 2;
      phatO(st, st.o, st.t, dO);
      st.t += dO; st.o++;
      if (st.o >= st.d.vong[st.vi].len) { st.o = 0; st.vi = (st.vi + 1) % st.d.vong.length; }
    }
  }
  function tat(st, nhanh) {
    if (!st) return;
    const now = ac.currentTime;
    try { st.g.gain.cancelScheduledValues(now); st.g.gain.setValueAtTime(st.g.gain.value, now); st.g.gain.setTargetAtTime(0, now, nhanh ? 0.08 : 0.35); } catch (e) { /* bỏ qua */ }
    const g = st.g; setTimeout(() => { try { g.disconnect(); } catch (e) { /* bỏ qua */ } }, 3500);
  }
  function batBai(ten) {
    if (cur) tat(cur);
    cur = null; N.ten = ten;
    if (!ten || !B[ten]) return;
    const g = gain(0, bus), now = ac.currentTime;
    g.gain.setValueAtTime(0, now); g.gain.setTargetAtTime(1, now + 0.15, 0.4);
    cur = { ten, d: B[ten], g, vi: 0, o: 0, t: now + 0.2 };
  }
  // Bài hợp với cảnh đang chơi
  function chonBai() {
    const sc = G.scene;
    if (!sc) return null;
    if (G.truyen && G.truyen.dang) return 'lang';
    if (sc === G.StageScene && G.getRun) {
      const S = G.getRun();
      if (!S) return 'lang';
      if (S.mode === 'dead') return null;
      // vùng 4 chưa có bài riêng (phiên 2C thêm B.vung3 / trum3): dùng bài của vùng mượn hình (G.vungVe), nếu không thì vùng 3
      const r0 = S.r | 0, r = r0 > 2 && !(B['vung' + r0]) ? G.clamp(G.vungVe ? G.vungVe(r0) : 2, 0, 2) : G.clamp(r0, 0, 3);
      if (W && W.type === 'boss' && W.boss && !W.boss.dead && !S.won && !(S.loot && S.loot.bossDown)) return 'trum' + r;
      return 'vung' + r;
    }
    return 'lang';
  }
  N.chonBai = chonBai;
  function vol() { return G.amThanh ? G.amThanh.vol('nhac') : 0; }
  N.capNhat = function () { if (bus && ac) { try { bus.gain.setTargetAtTime(vol() * 0.9, ac.currentTime, 0.05); } catch (e) { /* bỏ qua */ } } };
  function nhip() {
    try {
      const a = G.amThanh && G.amThanh.ac();
      if (!a) return;
      if (a !== ac) { ac = a; bus = gain(0, ac.destination); cur = null; N.ten = null; }
      if (ac.state !== 'running' || document.hidden) return;
      const want = N.tat || vol() <= 0 || G.noRender ? null : chonBai();
      if (want !== N.ten) { batBai(want); N.capNhat(); }
      if (Math.abs(bus.gain.value - vol() * 0.9) > 0.02) N.capNhat();
      if (cur) lenLich(cur, ac.currentTime + 0.35);
    } catch (e) { /* nhạc hỏng thì thôi, không làm đứng game */ }
  }
  N.nhip = nhip;
  setInterval(nhip, 120);
  // Ẩn trang (chuyển ứng dụng, khoá máy): dừng hẳn bộ âm thanh cho đỡ pin; hiện lại thì chạy tiếp (iOS có thể cần chạm một lần nữa).
  document.addEventListener('visibilitychange', () => {
    const a = G.amThanh && G.amThanh.ac();
    if (!a) return;
    try {
      if (document.hidden) { if (cur) tat(cur, true); cur = null; N.ten = null; if (a.state === 'running') a.suspend().catch(() => {}); }
      else if (G.save && G.save.sound) a.resume().catch(() => {});
    } catch (e) { /* bỏ qua */ }
  });
  // Cho kiểm thử: tạo sẵn các nốt của một bài vào một AudioContext bất kỳ (OfflineAudioContext để đo độ to, không phát ra loa)
  N.thuBai = function (a, ten, giay) {
    const ac0 = ac, bus0 = bus, noise0 = noise;
    ac = a; noise = null;
    try {
      bus = gain(1, a.destination);
      const st = { ten, d: B[ten], g: gain(1, bus), vi: 0, o: 0, t: 0.05 };
      while (st.t < giay) {
        const dO = 60 / st.d.bpm / 2;
        phatO(st, st.o, st.t, dO); st.t += dO; st.o++;
        if (st.o >= st.d.vong[st.vi].len) { st.o = 0; st.vi = (st.vi + 1) % st.d.vong.length; }
      }
    } finally { ac = ac0; bus = bus0; noise = noise0; }
  };
  N.thuChieng = function (a, f, v) { const ac0 = ac; ac = a; try { chieng(a.destination, 0.05, f, v, 0.8); } finally { ac = ac0; } };
})();
