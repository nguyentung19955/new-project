// TURRET MERGE — BỘ ÂM THANH CYBER / ROBOT / HIỆN ĐẠI, tổng hợp 100% bằng Web Audio (không file mẫu, không bản quyền).
// Kỹ thuật: FM/AM, ring-mod, ồn lọc, bit-crush (WaveShaper bậc thang), cộng hưởng kim loại, servo, glitch, sub-bass,
// sidechain (nhạc "thở" theo trống kick + né khi có tiếng nổ lớn), stereo, đường bao ngắn (luôn có ramp → không lách tách).
// Trộn: bus SFX + bus NHẠC → limiter (DynamicsCompressor) → loa. Mỗi âm có giới hạn tần suất + số giọng đồng thời,
// có trần giọng toàn cục; mọi node tự ngắt kết nối khi âm kết thúc (onended) → không rò node.
// Nhạc nền: bộ tuần tự synthwave/electro (bass, arp, trống, pad) 3 mức cường độ: 0 menu · 1 trận · 2 wave TRÙM.
// Bật/tắt NHẠC và SFX riêng, lưu localStorage. Mở khoá âm thanh trên điện thoại ở lần chạm đầu.
// v2 (11/2026): KHO VŨ KHÍ theo HỌ (đạn, tỉa, pháo, phóng, laser, năng lượng, băng, độc, sét, cận chiến, triệu hồi) chọn theo G.dangBan.id;
//   EQ tổng (cắt < 80 Hz, nhấn 2.8 kHz) + soft-clip; bus vũ khí bị né dưới sự kiện lớn. Trang thử: index.html?sfxlab
// v3 (11/2026): NHẠC chuyển sang nhac.js (darksynth thích ứng: menu / trận theo cường độ / trùm + stinger); SFX lớn (ghép, lên sao,
//   triệu hồi, chỉ huy, wave, trùm) thêm "va chạm điện ảnh" (sub bão hoà) + riser + hợp âm supersaw anh hùng + vang (convolver);
//   âm lượng NHẠC / SFX riêng (thanh trượt trong bảng TẠM DỪNG + ?sfxlab), lưu localStorage.
// v4 (11/2026): MẪU ÂM anime / hào hùng (assets/sfx/*.mp3, 25 sự kiện) phát trước, synth cũ làm dự phòng khi mẫu chưa nạp;
//   luật trộn: trần 24 giọng + 4 mức ưu tiên (cướp giọng p3), giới hạn tần suất/giọng từng sự kiện + cả nhóm bắn, né nhạc lấy mức
//   sâu nhất (không cộng dồn), lệch cao độ ±1,5–5 %; bỏ giọng "WAVE", 1 BRAAM khi trùm ra; chuỗi tổng bỏ nhấn 2.8 kHz + limiter gắt/tanh.
'use strict';
const SND = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const docLS = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v === '1'; } catch (e) { return d; } };
  const ghiLS = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) { } };
  let ac = null, bus = null, offline = false, lech = 0; // lech: dời thời điểm (chỉ dùng khi xuất demo)
  let batSfx = docLS('turret_sfx', true), batNhac = docLS('turret_nhac', true);
  const docSo = (k, d) => { try { const v = parseFloat(localStorage.getItem(k)); return isFinite(v) ? Math.max(0, Math.min(1, v)) : d; } catch (e) { return d; } };
  const ghiSo = (k, v) => { try { localStorage.setItem(k, String(v)); } catch (e) { } };
  const VOL = { master: 0.92, sfx: 0.6, nhac: 0.32 };
  const UV = { sfx: docSo('turret_vsfx', 1), nhac: docSo('turret_vnhac', 0.8) }; // âm lượng người chơi chọn (0..1)
  const gSfx = () => VOL.sfx * UV.sfx, gNhac = () => VOL.nhac * UV.nhac;
  const TK = { node: 0, giong: 0, tao: 0, bo: 0, nodeMax: 0, giongMax: 0 }; // thống kê (kiểm thử)
  const R = Math.random;
  const vr = (x, p) => x * (1 + (R() * 2 - 1) * p);   // biến thiên cao độ / âm lượng
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- bus của một context (thật hoặc Offline để xuất file demo) ----------
  function taoBus(c, day) {
    const B = { c };
    B.out = c.createGain(); B.out.gain.value = VOL.master; B.out.connect(c.destination);
    // v4 (11/2026, tư vấn âm thanh): bỏ limiter gắt −9 dB 14:1 + soft-clip tanh → nén nhẹ 3,5:1 rồi limiter trần ≈ −1 dB
    B.lim = c.createDynamicsCompressor();
    B.lim.threshold.value = -12; B.lim.knee.value = 6; B.lim.ratio.value = 3.5; B.lim.attack.value = 0.004; B.lim.release.value = 0.2;
    B.tran = c.createDynamicsCompressor();
    B.tran.threshold.value = -2; B.tran.knee.value = 0; B.tran.ratio.value = 20; B.tran.attack.value = 0.001; B.tran.release.value = 0.1;
    B.bu = c.createGain(); B.bu.gain.value = 1.3; // bù +2,3 dB (chuỗi cũ nén mạnh làm to hơn) → nhạc / sự kiện lớn giữ độ to cũ; limiter chặn đỉnh
    B.lim.connect(B.bu); B.bu.connect(B.tran); B.tran.connect(B.out);
    // EQ tổng (loa điện thoại): cắt sub < 80 Hz (loa không phát được, chỉ ăn headroom → đục); bỏ nhấn +2.5 dB @2.8 kHz (dải 2–4 kHz đã chật)
    B.hp = c.createBiquadFilter(); B.hp.type = 'highpass'; B.hp.frequency.value = 80; B.hp.Q.value = 0.7;
    B.hp.connect(B.lim);
    B.sfx = c.createGain(); B.sfx.gain.value = day ? VOL.sfx : batSfx ? gSfx() : 0; B.sfx.connect(B.hp);
    B.wpn = c.createGain(); B.wpn.connect(B.sfx); // bus vũ khí: bị né dưới tiếng lớn
    B.nhac = c.createGain(); B.nhac.gain.value = day ? VOL.nhac : batNhac ? gNhac() : 0;
    B.duck = c.createGain(); B.nhac.connect(B.duck); B.duck.connect(B.hp);
    // bit-crush dùng chung: WaveShaper bậc thang (≈4 bit) → hạt "số" thô
    B.crush = c.createWaveShaper(); const n = 1024, cv = new Float32Array(n), buc = 7;
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.round(x * buc) / buc; }
    B.crush.curve = cv; const cg = c.createGain(); cg.gain.value = 0.7; B.crush.connect(cg); cg.connect(B.sfx);
    B.dly = taoDelay(c, B.sfx, 0.19, 0.29, 0.34);           // vang ping-pong cho SFX
    B.noise = c.createBuffer(1, c.sampleRate, c.sampleRate); // 1 s ồn trắng dùng chung
    const d = B.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1;
    B.pan = !!c.createStereoPanner;
    // méo bão hoà dùng chung cho cú va chạm (sub 40–60 Hz → hoạ âm 120–300 Hz nghe được trên loa điện thoại)
    B.dist = c.createWaveShaper(); { const n = 1024, cv = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.tanh(x * 3.2) / Math.tanh(3.2); } B.dist.curve = cv; }
    B.dist.connect(B.sfx);
    // vang (convolver 1.5 s, lọc bớt trầm) cho SFX lớn
    B.vang = c.createGain(); { const cv = c.createConvolver(), hp = c.createBiquadFilter(), w = c.createGain(), sr = c.sampleRate, n = Math.ceil(1.5 * sr), ir = c.createBuffer(2, n, sr);
      for (let k = 0; k < 2; k++) { const d = ir.getChannelData(k); let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr; lp += (R() * 2 - 1 - lp) * (0.7 * Math.exp(-t * 2.2) + 0.06); d[i] = (t < 0.01 ? 0 : lp) * Math.exp(-t * 3.6) * 0.7; } }
      cv.buffer = ir; hp.type = 'highpass'; hp.frequency.value = 300; w.gain.value = 0.6; B.vang.connect(hp); hp.connect(cv); cv.connect(w); w.connect(B.sfx); }
    return B;
  }
  function taoDelay(c, dich, tL, tR, fb) {
    const vao = c.createGain(), L = c.createDelay(1), Rr = c.createDelay(1), g = c.createGain(), lp = c.createBiquadFilter(), m = c.createChannelMerger(2), wet = c.createGain();
    L.delayTime.value = tL; Rr.delayTime.value = tR; g.gain.value = fb; lp.type = 'lowpass'; lp.frequency.value = 3200; wet.gain.value = 0.55;
    vao.connect(L); L.connect(Rr); Rr.connect(lp); lp.connect(g); g.connect(L);
    L.connect(m, 0, 0); Rr.connect(m, 0, 1); m.connect(wet); wet.connect(dich);
    return vao;
  }

  // ---------- GIỌNG (voice): giới hạn tần suất + số giọng, tự dọn node ----------
  // [khoảng cách tối thiểu ms, số giọng đồng thời tối đa]
  const LIM = {
    nut: [35, 2], trieu: [70, 2], dat: [45, 3], ghep: [60, 3], nang: [80, 2], thucTinh: [400, 1],
    phao: [85, 3], lien: [52, 3], tia: [80, 3], rail: [140, 2], set: [85, 3], bang: [100, 3], doc: [110, 2], nap: [110, 2],
    no: [65, 4], mana: [180, 2], hoTro: [120, 1], sam: [300, 1], hoden: [500, 1], mv: [300, 1],
    trung: [160, 2], crit: [85, 2], chet: [45, 3], chetTrum: [500, 1], canhBao: [1200, 1], bao: [400, 2], chieuTrum: [300, 2],
    lot: [250, 1], wave: [800, 1], ketThuc: [1500, 1], _: [40, 3],
    wDan: [42, 4], wTia: [75, 3], wPhao: [80, 3], wPhong: [95, 2], wLaser: [70, 3], wNl: [80, 3], wBang: [90, 3], wDoc: [100, 2], wSet: [80, 3], wCan: [70, 3], wTrieu: [110, 2],
  };
  // hệ số âm lượng từng âm (cân bằng theo đo đỉnh khi xuất demo)
  const VO = { nut: 6, trieu: 4.5, dat: 0.9, nang: 3, thucTinh: 1.1, phao: 1.6, lien: 2.2, tia: 0.65, rail: 0.65, set: 1.5, bang: 4.5, doc: 2.5, nap: 4,
    no: 1.1, mana: 5,
    wDan: 1.7, wTia: 1.75, wPhao: 1.2, wPhong: 1.3, wLaser: 2.35, wNl: 0.9, wBang: 2.3, wDoc: 1.5, wSet: 2.45, wCan: 0.9, wTrieu: 2.65, /* vũ khí: đo RMS 50 ms */
    hoTro: 3.2, mv: 0.7, trung: 6.5, crit: 5.5, chet: 3, chetTrum: 2.4, canhBao: 1.35, bao: 1.8, chieuTrum: 2, lot: 0.4, ketThuc: 1.1 };
  const lan = {}, dang = {};
  function V(k, pri) {
    if (!bus) return null;
    if (!offline) {
      if (!batSfx || ac.state !== 'running') return null;
      const L = LIM[k] || LIM._, n = performance.now();
      if (lan[k] && n - lan[k] < L[0]) return null;
      if ((dang[k] || 0) >= L[1] || TK.giong >= TRAN || (TK.giong >= TRAN - 6 && (pri || 1) < 2)) { TK.bo++; return null; }
      lan[k] = n;
    }
    return moV(k, k.charCodeAt(0) === 119 && k.length > 1 && k[1] < 'a' ? bus.wpn : bus.sfx, true, 0.32); // 'wXxx' = vũ khí
  }
  function moV(k, dich, dem, panRong) {
    const c = bus.c, v = { c, k, t: c.currentTime + 0.005 + lech, ds: [], src: [], het: 0, xong: false, dem: dem && !offline };
    v.out = nd(v, c.createGain()); v.out.gain.value = VO[k] || 1;
    if (panRong && bus.pan) { const p = nd(v, c.createStereoPanner()); p.pan.value = (R() * 2 - 1) * panRong; v.out.connect(p); p.connect(dich); }
    else v.out.connect(dich);
    if (v.dem) { dang[k] = (dang[k] || 0) + 1; TK.giong++; if (TK.giong > TK.giongMax) TK.giongMax = TK.giong; }
    return v;
  }
  function nd(v, x) { v.ds.push(x); if (!offline) { TK.node++; TK.tao++; if (TK.node > TK.nodeMax) TK.nodeMax = TK.node; } return x; }
  function fin(v) {
    if (!v.src.length) { don(v); return; }
    let s = v.src[0]; for (const x of v.src) if (x._het > s._het) s = x;
    s.onended = () => don(v);
    if (!offline) setTimeout(() => don(v), Math.max(0, v.het - v.c.currentTime) * 1000 + 3000); // dự phòng
  }
  function don(v) {
    if (v.xong) return; v.xong = true;
    for (const x of v.ds) { try { x.disconnect(); } catch (e) { } }
    if (!offline) TK.node -= v.ds.length;
    if (v.dem) { dang[v.k]--; TK.giong--; }
    v.ds = v.src = null;
  }

  // ---------- khối dựng âm ----------
  const ch = (...a) => { for (let i = 0; i < a.length - 1; i++) a[i].connect(a[i + 1]); return a[a.length - 1]; };
  function gn(v, x) { const g = nd(v, v.c.createGain()); g.gain.value = x == null ? 0 : x; return g; }
  function loc(v, type, f, q) { const b = nd(v, v.c.createBiquadFilter()); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; }
  function osc(v, type, f, t0, t1) {
    const o = nd(v, v.c.createOscillator()); o.type = type; o.frequency.setValueAtTime(f, t0);
    o.start(t0); o.stop(t1); o._het = t1; v.src.push(o); if (t1 > v.het) v.het = t1; return o;
  }
  function on(v, t0, t1) {
    const s = nd(v, v.c.createBufferSource()); s.buffer = bus.noise; s.loop = true;
    s.start(t0, R() * 0.9); s.stop(t1); s._het = t1; v.src.push(s); if (t1 > v.het) v.het = t1; return s;
  }
  // đường bao: 0 → đỉnh (attack a) → tắt dần mũ tới t+a+d  (không lách tách)
  function env(p, t, a, dinh, d) {
    p.setValueAtTime(0, t); p.linearRampToValueAtTime(dinh, t + a);
    p.exponentialRampToValueAtTime(0.0001, t + a + d); p.setValueAtTime(0, t + a + d + 0.005);
  }
  // 1 nốt dao động: lướt cao độ f0→f1, đường bao, nối vào dich
  function tone(v, type, f0, f1, t, d, dinh, dich, a) {
    a = a || 0.003;
    const o = osc(v, type, f0, t, t + a + d + 0.03), g = gn(v);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + a + d);
    env(g.gain, t, a, dinh, d); ch(o, g, dich || v.out); return o;
  }
  // 1 cụm ồn qua bộ lọc (tần số lọc có thể quét f→f1)
  function burst(v, t, d, dinh, ftype, f, q, dich, f1, a) {
    a = a || 0.002;
    const s = on(v, t, t + a + d + 0.03), b = loc(v, ftype, f, q), g = gn(v);
    if (f1) { b.frequency.setValueAtTime(f, t); b.frequency.exponentialRampToValueAtTime(f1, t + a + d); }
    env(g.gain, t, a, dinh, d); ch(s, b, g, dich || v.out); return b;
  }
  // FM 2 toán tử: sóng mang fc (lướt tới fc1) điều chế bởi sin fc×rat; chỉ số i0→i1 (âm kim loại / robot / zap)
  function fm(v, fc, rat, i0, i1, t, d, dinh, dich, fc1) {
    const t1 = t + d + 0.04, c = osc(v, 'sine', fc, t, t1), m = osc(v, 'sine', fc * rat, t, t1), mg = gn(v, fc * i0), g = gn(v);
    if (fc1) { c.frequency.exponentialRampToValueAtTime(Math.max(20, fc1), t + d); m.frequency.exponentialRampToValueAtTime(Math.max(20, fc1 * rat), t + d); }
    mg.gain.setValueAtTime(fc * i0, t); mg.gain.exponentialRampToValueAtTime(Math.max(1, (fc1 || fc) * rat * i1), t + d);
    ch(m, mg, c.frequency); env(g.gain, t, 0.002, dinh, d); ch(c, g, dich || v.out); return c;
  }
  function gui(v, x) { const g = gn(v, x); v.out.connect(g); g.connect(bus.dly); }
  function vang(v, x) { const g = gn(v, x); v.out.connect(g); g.connect(bus.vang); }
  // VA CHẠM điện ảnh: sub lướt xuống qua méo bão hoà (hoạ âm nghe được trên loa nhỏ) + đấm tầm trung + crack + thân ồn trầm
  function boom(v, t, m, f0) {
    m = m == null ? 1 : m; f0 = vr(f0 || 150, 0.04);
    const dg = gn(v, 0.9); dg.connect(bus.dist);
    tone(v, 'sine', f0, 36, t, 0.3 + m * 0.45, 0.35 + m * 0.3, dg, 0.002);
    tone(v, 'triangle', f0 * 2, 75, t, 0.1 + m * 0.08, 0.25 * m);
    burst(v, t, 0.014, 0.35 * m, 'highpass', 2600, 0.7);
    burst(v, t, 0.2 + m * 0.55, 0.3 * m, 'lowpass', 1500, 0.8, null, 110);
  }
  // RISER: ồn dải quét lên + răng cưa đôi lướt 2 quãng tám, to dần tới t+d rồi ngắt
  function riser(v, t, d, vol) {
    burst(v, t, d * 0.12, vol, 'bandpass', 350, 2.5, null, 7500, d * 0.88);
    const lp = loc(v, 'lowpass', 400, 6); lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(6500, t + d); lp.connect(v.out);
    tone(v, 'sawtooth', 110, 440, t, 0.03, vol * 0.45, lp, d); tone(v, 'sawtooth', 111.3, 445, t, 0.03, vol * 0.45, lp, d);
  }
  // HỢP ÂM SUPERSAW "kèn đồng" anh hùng: răng cưa đôi lệch, lọc mở bwah rồi đóng
  function stab(v, t, notes, d, vol, sang) {
    const lp = loc(v, 'lowpass', 500, 2.5); lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(sang || 4500, t + 0.035); lp.frequency.setTargetAtTime(800, t + 0.045, d * 0.35 + 0.02); lp.connect(v.out);
    for (const m of notes) { const f = hz(m); tone(v, 'sawtooth', f * 0.994, 0, t, d, vol, lp, 0.008); tone(v, 'sawtooth', f * 1.006, 0, t, d, vol, lp, 0.008); }
  }
  function vaoCrush(v, x) { const g = gn(v, x); v.out.connect(g); g.connect(bus.crush); }
  // ring-mod: tín hiệu nhân với sóng sin tần số f (âm kim loại / robot)
  function ring(v, f, t0, t1) { const g = gn(v, 0), m = osc(v, 'sine', f, t0, t1); m.connect(g.gain); return g; }
  // né nhạc dưới tiếng lớn (sidechain kiểu ducking)
  // luật trộn v4: nhiều lệnh né chồng nhau → lấy mức SÂU NHẤT đang hiệu lực, không cộng dồn / không giật lên rồi xuống ("bơm")
  const DK = { sau: 0, het: 0 };
  function duck(sau, dai) {
    if (!bus) return;
    if (!offline) { const n = performance.now(); if (n < DK.het && sau <= DK.sau) return; DK.sau = sau; DK.het = n + (0.025 + dai) * 1000; }
    const p = bus.duck.gain, t = bus.c.currentTime;
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); }
    p.linearRampToValueAtTime(Math.max(0.12, 1 - sau), t + 0.025); p.linearRampToValueAtTime(1, t + 0.025 + dai);
    if (sau >= 0.3) { // né tiếng súng dưới sự kiện lớn (wave / trùm / ghép / nổ to) — nhẹ hơn nhạc
      const w = bus.wpn.gain;
      if (w.cancelAndHoldAtTime) w.cancelAndHoldAtTime(t); else { w.cancelScheduledValues(t); w.setValueAtTime(w.value, t); }
      w.linearRampToValueAtTime(Math.max(0.35, 1 - sau * 0.6), t + 0.02); w.linearRampToValueAtTime(1, t + 0.02 + dai * 0.8);
    }
  }

  // =====================================================================================================
  //  MẪU ÂM v4 (11/2026): bộ SFX anime / hào hùng (file MP3 mono 96 kbps ở assets/sfx/, chọn ở
  //  docs/demo-hop-tuong/tuvan/am-thanh-anime/CHON.md). Nạp bằng Web Audio (fetch sớm → decodeAudioData khi đã có
  //  AudioContext, tức sau lần chạm đầu — iOS). Mẫu nào chưa nạp / lỗi → giữ âm tổng hợp cũ (dự phòng).
  //  Đi qua cùng bus SFX (vũ khí: bus wpn) → theo nút SFX + thanh âm lượng SFX, tắt tiếng là im.
  //  Tắt hẳn mẫu để so: ?nomau
  // =====================================================================================================
  // ưu tiên p: 0 cao nhất (cảnh báo trùm) … 3 thấp nhất (bắn / trúng / chết / nổ thường) — đông thì cướp giọng p3 trước.
  // [gain, p, cách tối thiểu ms, số giọng, lệch cao độ ±, né nhạc dB (0 = không né), nhóm]
  // gain: đưa RMS về đích theo nhóm (tư vấn: bắn −29, trúng/chết −31, crit −26, UI −25, ghép −18, ghép cao −16, sự kiện lớn −15 dBFS)
  const MAU = {
    'ban-sung': [0.32, 3, 70, 3, 0.04, 0, 'ban'], 'ban-nang-luong': [0.25, 3, 70, 3, 0.04, 0, 'ban'], 'ban-bang': [0.21, 3, 80, 2, 0.04, 0, 'ban'],
    'ban-lua': [0.29, 3, 80, 2, 0.04, 0, 'ban'], 'ban-doc': [0.33, 3, 90, 2, 0.05, 0, 'ban'], 'ban-set': [0.27, 3, 80, 2, 0.04, 0, 'ban'],
    'can-chien': [0.28, 3, 80, 2, 0.04, 0, 'ban'],
    'ha-quai': [0.2, 3, 220, 2, 0.04, 0], 'chi-mang': [0.23, 3, 180, 2, 0.02, 0], 'no': [0.36, 3, 120, 3, 0.03, 0],
    'ui-cham': [0.76, 2, 40, 2, 0.015, 0], 'ui-quay-lai': [0.79, 2, 40, 1, 0.015, 0],
    'summon': [0.42, 2, 110, 2, 0.02, 0], 'merge': [0.6, 2, 90, 2, 0.02, 2], 'ho-tro': [0.48, 2, 250, 1, 0.02, 0],
    'bat-dau-dot': [0.47, 2, 1500, 1, 0, 3], 'xong-dot': [0.54, 2, 1500, 1, 0, 2],
    'merge-sao-cao': [0.75, 1, 300, 1, 0, 4], 'dot-pha': [0.83, 1, 800, 1, 0, 5], 'jackpot': [0.84, 1, 600, 1, 0, 5],
    'boss-ky-nang': [0.52, 1, 400, 1, 0, 3], 'boss-guc-nga': [1.38, 1, 1000, 1, 0, 7], 'thang': [0.84, 1, 3000, 1, 0, 9], 'thua': [0.84, 1, 3000, 1, 0, 9],
    'boss-xuat-hien': [0.84, 0, 2000, 1, 0, 7],
  };
  const NHOM = { ban: [60, 6] };           // cả nhóm bắn: ≤ ~16 phát/s, ≤ 6 giọng (wave đông 40–80 yêu cầu/s)
  const TRAN = 24;                         // trần giọng toàn cục (tổng hợp + mẫu)
  const MB = {}, PF = {}, MS = [], MT = { nap: 0, loi: 0, phat: 0, chan: 0, cuop: 0, max: 0, dem: {}, maxK: {} };
  const laNoMau = /[?&]nomau\b/.test(location.search);
  let mauTat = false; // tắt mẫu lúc chạy (kiểm thử A/B cùng 1 trận)
  const layAB = (k) => PF[k] || (PF[k] = fetch('assets/sfx/' + k + '.mp3').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); }));
  function giaiMa(ab) { // Safari cũ chỉ có dạng callback; mới thì trả Promise — nhận cả hai, chỉ xong 1 lần
    return new Promise((ok, ko) => { let x = 0; const a = (b) => { if (!x++) ok(b); }, e = (er) => { if (!x++) ko(er || new Error('decode')); };
      try { const p = ac.decodeAudioData(ab, a, e); if (p && p.then) p.then(a, e); } catch (er) { e(er); } });
  }
  let napBat = false;
  function napMau() { // gọi khi đã có AudioContext (mo)
    if (napBat || laNoMau || !ac) return; napBat = true;
    for (const k in MAU) layAB(k).then(giaiMa).then(b => { MB[k] = b; MT.nap++; }, () => { MT.loi++; });
  }
  // tải trước dữ liệu (chưa giải mã) lúc trang rảnh → lần chạm đầu giải mã ngay, không chờ mạng
  if (!laNoMau && typeof fetch === 'function') {
    const truoc = () => setTimeout(() => { for (const k in MAU) layAB(k).catch(() => { }); }, 1200);
    if (document.readyState === 'complete') truoc(); else window.addEventListener('load', truoc, { once: true });
  }
  const lanM = {}, dangM = {};
  // phát mẫu k. Trả true = sự kiện đã do mẫu lo (đã phát HOẶC bị luật trộn chặn) → không phát âm tổng hợp; false = chưa có mẫu → dùng synth
  function phatMau(k, o) {
    if (offline || mauTat || !bus || !MB[k]) return false;
    if (!batSfx || ac.state !== 'running') return true;
    const M = MAU[k], n = performance.now(), nh = M[6] && NHOM[M[6]];
    if (lanM[k] && n - lanM[k] < M[2]) { MT.chan++; return true; }
    if (nh && lanM[M[6]] && n - lanM[M[6]] < nh[0]) { MT.chan++; return true; }
    if ((dangM[k] || 0) >= M[3] || (nh && (dangM[M[6]] || 0) >= nh[1])) { MT.chan++; TK.bo++; return true; }
    if (TK.giong >= TRAN - 6 && M[1] >= 3) { MT.chan++; TK.bo++; return true; }
    if (TK.giong >= TRAN) { // đầy: âm quan trọng (p ≤ 1) cướp giọng mẫu p3 cũ nhất; còn lại bỏ
      const cu = M[1] <= 1 && MS.find(v => v.p >= 3 && !v.dung);
      if (!cu) { MT.chan++; TK.bo++; return true; }
      dungM(cu); MT.cuop++;
    }
    lanM[k] = n; if (M[6]) lanM[M[6]] = n;
    const c = ac, t = c.currentTime + 0.005, s = c.createBufferSource(), g = c.createGain();
    s.buffer = MB[k];
    s.playbackRate.value = ((o && o.r) || 1) * (M[4] ? 1 + (R() * 2 - 1) * M[4] : 1);  // lệch cao độ cho âm lặp (họ vũ khí: dời giọng riêng)
    g.gain.value = M[0] * ((o && o.k) || 1);
    s.connect(g); g.connect(M[6] === 'ban' ? bus.wpn : bus.sfx);
    const v = { k, p: M[1], s, g, nh: M[6], dung: false };
    MS.push(v); dangM[k] = (dangM[k] || 0) + 1; if (v.nh) dangM[v.nh] = (dangM[v.nh] || 0) + 1;
    TK.giong++; if (TK.giong > TK.giongMax) TK.giongMax = TK.giong; MT.phat++; if (MS.length > MT.max) MT.max = MS.length;
    MT.dem[k] = (MT.dem[k] || 0) + 1; for (const x of [k, v.nh]) if (x && dangM[x] > (MT.maxK[x] || 0)) MT.maxK[x] = dangM[x];
    s.onended = () => xongM(v);
    s.start(t);
    setTimeout(() => xongM(v), (s.buffer.duration / s.playbackRate.value) * 1000 + 1500); // dự phòng onended không tới
    if (M[5]) { const sau = 1 - Math.pow(10, -M[5] / 20); duck(sau, Math.min(2.2, s.buffer.duration * 0.8)); }
    return true;
  }
  function dungM(v) { if (v.dung) return; v.dung = true; try { const t = ac.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + 0.03); v.s.stop(t + 0.035); } catch (e) { xongM(v); } }
  function xongM(v) {
    if (v.xong) return; v.xong = true;
    try { v.s.disconnect(); v.g.disconnect(); } catch (e) { }
    const i = MS.indexOf(v); if (i >= 0) MS.splice(i, 1);
    dangM[v.k]--; if (v.nh) dangM[v.nh]--; TK.giong--;
  }

  // ---------- GIỌNG ROBOT (tổng hợp formant, kiểu vocoder) ----------
  // seg: [thời lượng, F1, F2, F3, âm lượng, ồn]  — nguồn răng cưa đơn điệu + quãng tám dưới, 3 bộ lọc dải formant
  function noiRobot(v, t, segs, f0, vol) {
    const tong = segs.reduce((s, x) => s + x[0], 0), t1 = t + tong + 0.08;
    const src = osc(v, 'sawtooth', f0, t, t1); src.frequency.linearRampToValueAtTime(f0 * 0.9, t + tong);
    const sub = osc(v, 'square', f0 / 2, t, t1); sub.frequency.linearRampToValueAtTime(f0 * 0.45, t + tong);
    const mix = gn(v, 1), sg = gn(v, 0.4); src.connect(mix); ch(sub, sg, mix);
    const ns = on(v, t, t1), nf = loc(v, 'highpass', 2800), ng = gn(v, 0); ch(ns, nf, ng);
    const amp = gn(v, 0), F = [];
    [[9, 3.2], [12, 2.6], [14, 1.6]].forEach(([q, k], i) => { const b = loc(v, 'bandpass', segs[0][1 + i], q), g = gn(v, k); ch(mix, b, g, amp); F.push(b); });
    ng.connect(amp);
    const rm = ring(v, 52, t, t1); amp.connect(rm); // ring-mod nhẹ → chất "máy"
    const kho = gn(v, 0.55), uot = gn(v, 0.6); amp.connect(kho); rm.connect(uot); kho.connect(v.out); uot.connect(v.out);
    amp.gain.setValueAtTime(0, t); ng.gain.setValueAtTime(0, t); F.forEach((b, i) => b.frequency.setValueAtTime(segs[0][1 + i], t));
    let tt = t;
    for (const [d, f1, f2, f3, a, nn] of segs) {
      const r = Math.min(0.035, d * 0.5);
      [f1, f2, f3].forEach((f, i) => F[i].frequency.linearRampToValueAtTime(f, tt + r));
      amp.gain.linearRampToValueAtTime(a * vol, tt + r); ng.gain.linearRampToValueAtTime((nn || 0) * vol * 0.5, tt + r);
      tt += d;
    }
    amp.gain.linearRampToValueAtTime(0, tt + 0.05); ng.gain.linearRampToValueAtTime(0, tt + 0.03);
  }
  const TU = {
    wave: [[0.06, 300, 620, 2200, 0.45, 0], [0.09, 620, 1700, 2600, 1, 0], [0.1, 420, 2200, 2800, 0.95, 0], [0.09, 260, 1400, 2400, 0.4, 0.5]],
    warning: [[0.05, 300, 620, 2200, 0.45, 0], [0.12, 650, 1000, 2500, 1, 0], [0.07, 460, 1250, 1650, 0.8, 0], [0.06, 280, 1700, 2600, 0.45, 0],
      [0.08, 400, 1950, 2550, 0.95, 0], [0.1, 280, 2300, 2750, 0.5, 0]],
  };

  // ---------- LASER: 1 tia âm duy trì dùng chung (nhiều ụ laser không chồng tiếng) ----------
  let LZ = null;
  function taoLaser(t) {
    const v = moV('laser', bus.wpn, !offline, 0), c = v.c, mo = 30;
    const a = osc(v, 'sawtooth', 220, t, t + mo), b = osc(v, 'sawtooth', 221.7, t, t + mo), s = osc(v, 'square', 440, t, t + mo), hi = osc(v, 'sine', 1760, t, t + mo);
    [[a, 220], [b, 221.7], [s, 440], [hi, 1760]].forEach(([o, f]) => o.frequency.setTargetAtTime(f * 1.14, t + 0.01, 1.6)); // giữ lâu → cao dần = "mạnh dần"
    const f = loc(v, 'lowpass', 1300, 7), lfo = osc(v, 'sine', 7, t, t + mo), lg = gn(v, 420); ch(lfo, lg, f.frequency);
    const sg = gn(v, 0.5), hg = gn(v, 0.2); ch(s, sg, f); a.connect(f); b.connect(f);
    const g = gn(v, 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.06); ch(f, g, v.out); ch(hi, hg, g);
    const cg = gn(v, 0.3); g.connect(cg); cg.connect(bus.crush); // hạt số
    return { v, g, hg };
  }
  function tatLaser(L, t) { L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(0, t, 0.07); for (const o of L.v.src) { o.stop(t + 0.45); o._het = t + 0.45; } L.v.het = t + 0.45; fin(L.v); }
  let lzTimer = 0;
  function laser() {
    if (!bus || offline || !batSfx || ac.state !== 'running') return;
    const n = performance.now();
    if (!LZ) { LZ = taoLaser(ac.currentTime + 0.005); LZ.bd = n; }
    LZ.cuoi = n;
    if (n - LZ.bd > 25000) { tatLaser(LZ, ac.currentTime); LZ = null; return; } // an toàn: tối đa 25 s/tia
    if (!lzTimer) lzTimer = setInterval(() => {
      if (LZ && performance.now() - LZ.cuoi > 170) { tatLaser(LZ, ac.currentTime); LZ = null; }
      if (!LZ) { clearInterval(lzTimer); lzTimer = 0; }
    }, 60);
  }

  // =====================================================================================================
  //  KHO VŨ KHÍ v2 (ARSENAL) — mỗi HỌ vũ khí 1 chữ ký âm riêng, cùng "ngôn ngữ" cyber/robot:
  //  FM kim loại + sóng vuông lướt nhanh + bit-crush + click ồn lọc + cú đấm tầm trung (nghe rõ trên loa điện thoại).
  //  Mỗi họ: 3 biến thể xoay vòng + lệch cao độ/thời gian nhỏ → bắn liên tục không mỏi tai; giới hạn giọng riêng (LIM).
  //  Đi qua bus.wpn (bị "né" dưới tiếng lớn: nổ to, wave, trùm, ghép…).
  // =====================================================================================================
  const rrN = {};
  const rr = (k) => (rrN[k] = ((rrN[k] || 0) + 1) % 3);
  const W = {
    // ĐẠN / LIÊN THANH: "tk" số — click HP + sóng vuông rơi qua bandpass cộng hưởng + tick FM kim loại
    dan() { if (phatMau('ban-sung')) return; const v = V('wDan', 0); if (!v) return; const t = v.t + R() * 0.004, i = rr('dan'), f = vr([1900, 1650, 2150][i], 0.05);
      burst(v, t, 0.012, 0.42, 'highpass', 4200, 0.8);
      const bp = loc(v, 'bandpass', f * 1.1, 5); bp.connect(v.out); tone(v, 'square', f, f * 0.42, t, 0.032, 0.42, bp, 0.001);
      fm(v, f * 1.5, 1.414, 2.5, 0.1, t, 0.026, 0.1);
      tone(v, 'triangle', vr(260, 0.06), 120, t, 0.028, 0.32);
      vaoCrush(v, 0.42); fin(v); },
    // BẮN TỈA / ĐẠN NẶNG / RAIL ngắn: "k-PSSHEW" — crack + zap FM tụt cao độ + rít cộng hưởng + ping kim loại
    tia() { if (phatMau('ban-sung', { r: 1.1 })) return; const v = V('wTia', 1); if (!v) return; const t = v.t, i = rr('tia'), p = vr([1, 0.94, 1.06][i], 0.03);
      burst(v, t, 0.028, 0.55, 'highpass', 2200, 0.8);
      fm(v, 3400 * p, 0.5, 6, 0.4, t, 0.11, 0.2, null, 240 * p);
      const lp = loc(v, 'lowpass', 6000, 11); lp.frequency.setValueAtTime(6000, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.12); lp.connect(v.out);
      tone(v, 'sawtooth', 1900 * p, 150, t, 0.12, 0.16, lp);
      const rm = ring(v, 1310, t, t + 0.12); rm.connect(v.out); tone(v, 'triangle', 2500 * p, 0, t + 0.005, 0.08, 0.16, rm);
      tone(v, 'triangle', 210, 85, t, 0.06, 0.4);
      vaoCrush(v, 0.18); gui(v, 0.16); fin(v); },
    // PHÁO / NỔ: "DMM-k-tchk" — đấm tầm trung (nghe được trên loa nhỏ) + crack + crunch số + servo nạp đạn
    phao() { if (phatMau('ban-sung', { r: 0.86 })) return; const v = V('wPhao', 1); if (!v) return; const t = v.t, i = rr('phao'), p = vr([1, 0.92, 1.07][i], 0.03);
      tone(v, 'triangle', 330 * p, 105, t, 0.1, 0.5); tone(v, 'sine', 150 * p, 55, t, 0.18, 0.4);
      burst(v, t, 0.07, 0.55, 'bandpass', 1700 * p, 0.9, null, 450);
      burst(v, t, 0.05, 0.3, 'lowpass', 3000, 0.7, bus.crush);
      fm(v, 420 * p, 2.71, 4, 0.2, t, 0.06, 0.12);
      const t2 = t + 0.11 + R() * 0.02, bp = loc(v, 'bandpass', 1300, 5); bp.connect(v.out);
      tone(v, 'square', 420, 980, t2, 0.06, 0.1, bp, 0.004); burst(v, t2 + 0.065, 0.012, 0.3, 'bandpass', 3600, 8);
      fin(v); },
    // PHÓNG (tên lửa / drone / mìn / bom): bíp khoá mục tiêu + vút FM đi lên + xì ồn quét
    phong() { if (phatMau('ban-sung', { r: 0.95 })) return; const v = V('wPhong', 1); if (!v) return; const t = v.t, p = vr(1, 0.05);
      tone(v, 'square', 1760 * p, 0, t, 0.022, 0.05); tone(v, 'square', 2349 * p, 0, t + 0.045, 0.022, 0.05);
      burst(v, t + 0.03, 0.2, 0.3, 'bandpass', 500, 2.2, null, 4200, 0.03);
      fm(v, 380 * p, 2, 4, 1, t + 0.03, 0.18, 0.12, null, 2300 * p);
      tone(v, 'triangle', 270, 120, t + 0.03, 0.05, 0.32);
      vaoCrush(v, 0.2); fin(v); },
    // LASER (phát bắn rời): "PEWW" — răng cưa tụt qua lọc cộng hưởng quét + sin lệch + ring-mod
    laser() { if (phatMau('ban-nang-luong', { r: 1.08 })) return; const v = V('wLaser', 1); if (!v) return; const t = v.t, i = rr('laser'), p = vr([1, 1.12, 0.9][i], 0.03);
      const lp = loc(v, 'lowpass', 9000, 14); lp.frequency.setValueAtTime(9000, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.13); lp.connect(v.out);
      tone(v, 'sawtooth', 2400 * p, 260 * p, t, 0.13, 0.22, lp, 0.002);
      tone(v, 'sine', 4800 * p, 520 * p, t, 0.08, 0.12);
      const rm = ring(v, 880, t, t + 0.12); rm.connect(v.out); tone(v, 'square', 1200 * p, 300, t, 0.1, 0.05, rm);
      burst(v, t, 0.008, 0.2, 'highpass', 7000, 0.7);
      gui(v, 0.22); fin(v); },
    // NĂNG LƯỢNG / CẦU PLASMA: nạp vút ngắn → "vwOMP" FM rung + bandpass cộng hưởng tụt
    nl() { if (phatMau('ban-nang-luong', { r: 0.92 })) return; const v = V('wNl', 1); if (!v) return; const t = v.t, i = rr('nl'), p = vr([1, 1.19, 0.89][i], 0.03);
      tone(v, 'sine', 300 * p, 1150 * p, t, 0.045, 0.14, null, 0.02);
      const t2 = t + 0.05; fm(v, 950 * p, 1.5, 5, 0.6, t2, 0.15, 0.2, null, 420 * p);
      const bp = loc(v, 'bandpass', 1800, 7); bp.frequency.setValueAtTime(1800, t2); bp.frequency.exponentialRampToValueAtTime(500, t2 + 0.15); bp.connect(v.out);
      tone(v, 'sawtooth', 220 * p, 180 * p, t2, 0.15, 0.3, bp, 0.004);
      burst(v, t2, 0.01, 0.18, 'highpass', 5500, 0.7); tone(v, 'triangle', 240, 110, t2, 0.05, 0.25);
      gui(v, 0.28); fin(v); },
    // BĂNG / CRYO: chuông pha lê FM (bội không hoà âm) + xì khí lạnh quét xuống + tick kính
    bang() { if (phatMau('ban-bang')) return; const v = V('wBang', 1); if (!v) return; const t = v.t, i = rr('bang'), f = vr([2400, 2850, 2100][i], 0.04);
      fm(v, f, 3.5, 2.2, 0, t, 0.22, 0.13); fm(v, f * 2.76, 1.41, 1, 0, t, 0.1, 0.05);
      burst(v, t, 0.13, 0.22, 'highpass', 7500, 0.9, null, 2400, 0.004);
      tone(v, 'triangle', f * 2.2, 0, t, 0.014, 0.12);
      tone(v, 'triangle', 300, 140, t, 0.035, 0.18);
      vaoCrush(v, 0.12); gui(v, 0.3); fin(v); },
    // ĐỘC / AXIT SINH HỌC: "blorp" răng cưa qua lọc cộng hưởng bị LFO vuông + bong bóng số + xì phun
    doc() { if (phatMau('ban-doc')) return; const v = V('wDoc', 1); if (!v) return; const t = v.t, p = vr(1, 0.08), d = 0.17;
      const lp = loc(v, 'lowpass', 1300, 15), lfo = osc(v, 'square', vr(24, 0.2), t, t + d + 0.04), lg = gn(v, 800); ch(lfo, lg, lp.frequency); lp.connect(v.out);
      tone(v, 'sawtooth', 170 * p, 120 * p, t, d, 0.3, lp, 0.005);
      [0, 0.045, 0.09].forEach(o => tone(v, 'square', vr(520, 0.25), vr(1500, 0.2), t + o + R() * 0.01, 0.03, 0.08, bus.crush, 0.002));
      burst(v, t, 0.09, 0.15, 'bandpass', 2600, 2.2, null, 1200);
      fin(v); },
    // SÉT / TESLA: crack + hồ quang (ồn dải quét xuống, AM sóng vuông) + rè răng cưa crush + zap cao
    set() { if (phatMau('ban-set')) return; const v = V('wSet', 1); if (!v) return; const t = v.t, d = 0.1 + R() * 0.05;
      burst(v, t, 0.01, 0.45, 'highpass', 5000, 0.7);
      const ns = on(v, t, t + d + 0.03), bp = loc(v, 'bandpass', vr(5000, 0.2), 2.2), am = gn(v, 0), lfo = osc(v, 'square', vr(110, 0.25), t, t + d + 0.03), g = gn(v);
      bp.frequency.setValueAtTime(bp.frequency.value, t); bp.frequency.exponentialRampToValueAtTime(1700, t + d);
      lfo.connect(am.gain); env(g.gain, t, 0.002, 0.42, d); ch(ns, bp, am, g, v.out);
      const bz = loc(v, 'bandpass', 900, 2); bz.connect(bus.crush); tone(v, 'sawtooth', vr(120, 0.1), vr(95, 0.1), t, d, 0.22, bz);
      fm(v, vr(6000, 0.1), 0.53, 3, 0, t, 0.035, 0.08, null, 1500);
      for (let k = 0; k < 2; k++) burst(v, t + 0.02 + R() * d, 0.006, 0.28, 'highpass', 6500, 0.7);
      fin(v); },
    // CẬN CHIẾN / VUỐT / BÚA: servo rít → va đập kim loại (ring-mod) + đấm tầm trung + crunch
    can() { if (phatMau('can-chien')) return; const v = V('wCan', 1); if (!v) return; const t = v.t, i = rr('can'), p = vr([1, 1.1, 0.92][i], 0.04);
      const bp = loc(v, 'bandpass', 900, 4); bp.connect(v.out); tone(v, 'square', 280 * p, 680 * p, t, 0.035, 0.08, bp, 0.003);
      const t2 = t + 0.035;
      burst(v, t2, 0.05, 0.5, 'bandpass', 2600 * p, 3, null, 1100);
      const rm = ring(v, 730 * p, t2, t2 + 0.12); rm.connect(v.out); tone(v, 'triangle', 1450 * p, 0, t2, 0.09, 0.22, rm);
      tone(v, 'triangle', 280 * p, 90, t2, 0.07, 0.48);
      vaoCrush(v, 0.3); fin(v); },
    // ỤNG TRIỆU HỒI (bầy drone / con rối / bầy ong): 2 blip FM đi lên + rung cánh quạt (ồn AM)
    trieu() { const v = V('wTrieu', 1); if (!v) return; const t = v.t, p = vr(1, 0.06);
      fm(v, 1200 * p, 2, 2, 0.2, t, 0.04, 0.12); fm(v, 1800 * p, 2, 2, 0.2, t + 0.05, 0.05, 0.12);
      const ns = on(v, t, t + 0.16), b = loc(v, 'bandpass', 1500, 3), am = gn(v, 0), lfo = osc(v, 'square', 60, t, t + 0.16), g = gn(v);
      lfo.connect(am.gain); env(g.gain, t, 0.01, 0.14, 0.13); ch(ns, b, am, g, v.out);
      vaoCrush(v, 0.25); gui(v, 0.2); fin(v); },
  };
  // LỬA (họ mới v4, chỉ có mẫu ban-lua; chưa nạp → tiếng lửa tổng hợp gLua)
  W.lua = () => S.gLua(1);
  // ụ (id) → họ vũ khí khi ụ đó gọi âm <nguồn>; không có trong bảng → họ mặc định của chính âm đó
  const DOI = {
    'aten:tia': 'laser', 'dongbo:tia': 'laser', 'haoquang:tia': 'laser', 'ngaithoigian:tia': 'laser', 'nhatthuc:tia': 'laser',
    'hasao:tia': 'tia', 'nemesis:tia': 'tia', 'sungluc:tia': 'tia',
    'phagiap:set': 'nl', 'nangluong:set': 'nl', 'ngoisao:set': 'nl', 'anhsang:mana': 'nl', 'cauvong:mana': 'nl', 'cuuvi:lien': 'nl',
    'maychem:lien': 'can', 'bua:phao': 'can', 'nam:dat': 'can', 'soi:dat': 'can', 'loren:dat': 'can',
    'docton:tia': 'doc', 'chuato:tia': 'trieu', 'marionette:mana': 'trieu',
  };
  // họ cho bảng ?sfxlab (ụ tiêu biểu)
  const HO = {
    dan: 'Đạn / liên thanh — Liên Thanh, Phun Loạn, Cuồng Nộ, Vệ Tinh, Combo, Hydra',
    tia: 'Bắn tỉa / đạn nặng — Bắn Tỉa, Súng Lục, Railgun, Nỏ Năm Nhịp, Hạ Sao, Nemesis',
    phao: 'Pháo / nổ — Pháo Nổ, Súng Cối, May Rủi',
    phong: 'Phóng — Bom Hẹn Giờ, Drone, Rải Mìn, Dựng Tường',
    laser: 'Laser (phát rời) — Aten, Đồng Bộ, Hào Quang, Ngai Thời Gian, Nhật Thực',
    nl: 'Năng lượng / plasma — Pháo Năng Lượng, Phá Giáp, Ngôi Sao, Ánh Sáng, Cầu Vồng, Cửu Vĩ',
    bang: 'Băng — Băng, Kiếm Băng, Bão Tuyết, Lò Phản Ứng',
    doc: 'Độc — Độc, Vũng Độc, Độc Tôn, Leviathan',
    set: 'Sét — Tesla, Súng Bão, Chuỗi Liên Kết, Nhiều Sóng',
    can: 'Cận chiến — Nắm Đấm Sắt, Sói Máy, Máy Chém, Búa Đẩy, Loren',
    trieu: 'Triệu hồi — Chúa Tổ (bầy), Marionette',
    lua: 'Lửa (mẫu v4) — dạng lửa Grow-up (gLua)',
  };
  function hoCua(src) { const T = typeof G !== 'undefined' && G && G.dangBan; return (T && T.id && DOI[T.id + ':' + src]) || null; }
  const ban = (macDinh, src) => { W[hoCua(src) || macDinh](); };

  // =====================================================================================================
  //  BẢNG ÂM SFX
  // =====================================================================================================
  const S = {
    // UI: chạm gọn, sạch
    nut() { if (phatMau(laLui() ? 'ui-quay-lai' : 'ui-cham')) return; const v = V('nut', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', vr(1900, 0.03), 1250, t, 0.05, 0.16); tone(v, 'square', vr(3800, 0.03), 0, t, 0.012, 0.035);
      burst(v, t, 0.008, 0.05, 'highpass', 6000, 0.7); fin(v); },
    // TRIỆU HỒI: vật chất hoá số — quét lên + lấp lánh (tiếng khoá servo phát lúc ụ đáp xuống: dat)
    trieu() { if (phatMau('summon')) return; const v = V('trieu', 2); if (!v) return; const t = v.t;
      const bp = loc(v, 'bandpass', 300, 6); bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3800, t + 0.22); bp.connect(v.out);
      tone(v, 'sawtooth', 180, 900, t, 0.22, 0.3, bp, 0.02); tone(v, 'square', 360, 1800, t, 0.22, 0.08, bp, 0.02);
      burst(v, t, 0.2, 0.08, 'highpass', 3000, 0.8, null, 9000, 0.12);
      // vật chất hoá: hợp âm supersaw ngắn + cú đấm nhỏ
      const t2 = t + 0.2, r = [64, 66, 62][rr('sm')];
      stab(v, t2, [r - 12, r - 5, r, r + 7], 0.16, 0.035, 5000); boom(v, t2, 0.32, 170);
      tone(v, 'sine', 1760, 1760, t + 0.17, 0.12, 0.06); tone(v, 'sine', 2637, 2637, t + 0.21, 0.1, 0.04);
      vaoCrush(v, 0.22); gui(v, 0.2); vang(v, 0.25); duck(0.2, 0.25); fin(v); },
    // khoá servo: whir ngắn + "cạch" + ping kim loại
    dat() { const h = hoCua('dat'); if (h) return W[h](); const v = V('dat', 1); if (!v) return; const t = v.t;
      const lp = loc(v, 'lowpass', 900); lp.connect(v.out);
      tone(v, 'square', vr(95, 0.08), 150, t, 0.06, 0.12, lp, 0.01);
      const t2 = t + 0.055;
      tone(v, 'sine', vr(130, 0.06), 48, t2, 0.08, 0.5); burst(v, t2, 0.025, 0.3, 'bandpass', vr(2200, 0.1), 2);
      const rm = ring(v, 1170, t2, t2 + 0.12); rm.connect(v.out); tone(v, 'triangle', vr(2350, 0.05), 0, t2, 0.06, 0.12, rm); fin(v); },
    // GHÉP: 2 tông hội tụ → hợp âm stab sáng + khoá cơ khí (sao càng cao càng lên giọng)
    ghep(sao, xa) { if (phatMau((sao || 2) >= 4 ? 'merge-sao-cao' : 'merge', { k: xa ? 0.45 : 1 })) return; const v = V('ghep', 2); if (!v) return; const t = v.t, k = xa ? 0.45 : 1, sv = Math.min(8, sao || 2);
      const st = [0, 0, 2, 3, 5, 7, 8, 10, 12][sv], r = 220 * Math.pow(2, st / 12), m0 = 57 + st;
      tone(v, 'triangle', r * 0.75, r * 2, t, 0.11, 0.12 * k, null, 0.01); tone(v, 'triangle', r * 3, r * 2, t, 0.11, 0.1 * k, null, 0.01);
      burst(v, t, 0.02, 0.06 * k, 'bandpass', 900, 2, null, 4000, 0.09);
      const t2 = t + 0.11;
      // khoá: cú đấm + hợp âm supersaw anh hùng (sao càng cao càng lên giọng, càng dày)
      boom(v, t2, (0.35 + sv * 0.07) * k, 160);
      stab(v, t2, sv >= 5 ? [m0 - 12, m0, m0 + 4, m0 + 7, m0 + 12, m0 + 16] : [m0 - 12, m0, m0 + 7, m0 + 12], 0.34, 0.032 * k, 4000 + sv * 300);
      burst(v, t2, 0.02, 0.3 * k, 'highpass', 3000, 0.8); tone(v, 'square', 1250, 0, t2 + 0.01, 0.03, 0.03 * k);
      if (sv >= 4) [1, 1.5, 2, 3].forEach((m, i) => tone(v, 'sine', r * 4 * m, 0, t2 + 0.06 + i * 0.045, 0.12, 0.04 * k));
      gui(v, 0.22); vang(v, 0.3 * k); if (!xa) duck(0.38, 0.4); fin(v); },
    // NÂNG CẤP (skill-up): arpeggio đi lên + vút năng lượng
    nang(lv) { const v = V('nang', 2); if (!v) return; const t = v.t, L = lv || 2, r = 330 * Math.pow(2, (L - 2) * 2 / 12), m0 = 64 + (L - 2) * 2;
      const f = loc(v, 'lowpass', 3800, 2); f.connect(v.out);
      [0, 3, 7, 12, 15].forEach((s, i) => tone(v, 'square', r * Math.pow(2, s / 12), 0, t + i * 0.045, 0.09, 0.06, f));
      burst(v, t, 0.06, 0.16, 'bandpass', 600, 3, null, 6000, 0.2);
      // đỉnh: hợp âm trưởng supersaw + đấm + lấp lánh
      const t2 = t + 0.22; stab(v, t2, [m0 - 12, m0, m0 + 4, m0 + 7, m0 + 12], 0.3, 0.03, 5000); boom(v, t2, 0.3 + L * 0.05, 180);
      tone(v, 'sawtooth', r * 4, r * 4.05, t2, 0.2, 0.035, f); [1, 1.5, 2].forEach((m, i) => tone(v, 'sine', r * 4 * m, 0, t2 + 0.04 + i * 0.04, 0.14, 0.03));
      gui(v, 0.3); vang(v, 0.3); duck(0.3, 0.4); fin(v); },
    // THỨC TỈNH: như nâng cấp nhưng nặng hơn — sub bùm + arp răng cưa + hợp âm ring-mod
    thucTinh() { if (phatMau('dot-pha')) return; const v = V('thucTinh', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 75, 30, t, 0.6, 0.7);
      const f = loc(v, 'lowpass', 900, 4); f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(7000, t + 0.4); f.connect(v.out);
      [0, 3, 7, 10, 12, 15, 19].forEach((s, i) => tone(v, 'sawtooth', 220 * Math.pow(2, s / 12), 0, t + i * 0.05, 0.12, 0.06, f));
      burst(v, t, 0.5, 0.2, 'bandpass', 400, 2, null, 7000, 0.35);
      const t2 = t + 0.38, rm = ring(v, 37, t2, t2 + 0.7); rm.connect(v.out);
      for (const m of [1, 1.2, 1.5, 2]) tone(v, 'sawtooth', 440 * m, 0, t2, 0.6, 0.06, rm, 0.01);
      boom(v, t2, 1, 140); stab(v, t2, [45, 57, 64, 69, 73, 76], 0.6, 0.03, 4200); gui(v, 0.3); vang(v, 0.35); duck(0.6, 0.8); fin(v); },

    // ---------- VŨ KHÍ: mọi lời gọi bắn đi qua KHO VŨ KHÍ v2 (W) theo họ của ụ đang bắn ----------
    phao() { ban('phao', 'phao'); },
    lien() { ban('dan', 'lien'); },
    tia() { ban('tia', 'tia'); },
    set() { ban('set', 'set'); },
    bang() { ban('bang', 'bang'); },
    doc() { ban('doc', 'doc'); },
    nap() { ban('phong', 'nap'); },
    // RAILGUN / OVERLORD nạp: tích điện FM rít + bíp số → crack + zap răng cưa + crunch
    rail() { const v = V('rail', 2); if (!v) return; const t = v.t;
      const w = tone(v, 'sine', 500, 4200, t, 0.03, 0.07, null, 0.2); const m = osc(v, 'sine', 30, t, t + 0.3), mg = gn(v, 60); ch(m, mg, w.frequency);
      [0, 0.07, 0.14].forEach((o, i) => tone(v, 'square', 1760 * Math.pow(2, i * 4 / 12), 0, t + o, 0.02, 0.035));
      const t2 = t + 0.22; burst(v, t2, 0.06, 0.55, 'highpass', 1800, 0.7);
      fm(v, 4200, 0.5, 6, 0.3, t2, 0.2, 0.2, null, 160);
      const lp = loc(v, 'lowpass', 7000, 9); lp.frequency.setValueAtTime(7000, t2); lp.frequency.exponentialRampToValueAtTime(400, t2 + 0.28); lp.connect(v.out);
      tone(v, 'sawtooth', 3400, 90, t2, 0.28, 0.16, lp);
      tone(v, 'triangle', 220, 80, t2, 0.12, 0.45); vaoCrush(v, 0.25); gui(v, 0.3); duck(0.25, 0.3); fin(v); },
    // NỔ: đấm tầm trung + crack quét + thân ồn + vụn số crush (nổ lớn: glitch lặp + mảnh kim loại FM + rền)
    no(m) { m = m == null ? 0.4 : m; if (phatMau('no', { k: 0.6 + Math.min(1, m) * 0.5 })) return; const v = V('no', m > 0.8 ? 2 : 1); if (!v) return; const t = v.t, d = 0.18 + m * 0.4;
      tone(v, 'triangle', vr(300 + m * 60, 0.06), 80, t, d * 0.45, 0.45 + m * 0.2);
      tone(v, 'sine', vr(130, 0.05), 45, t, d * 0.6, 0.3 + m * 0.25);
      burst(v, t, d * 0.35, 0.5 + m * 0.3, 'bandpass', 2200 + m * 800, 0.9, null, 380);
      burst(v, t, d, 0.3 + m * 0.3, 'lowpass', 2400 + m * 1500, 0.7, null, 260);
      burst(v, t, d * 0.6, 0.18 + m * 0.15, 'bandpass', 1500, 0.8, bus.crush, 500);
      if (m > 0.5) for (let i = 0; i < 3; i++) tone(v, 'square', vr(900 - i * 180, 0.2), 0, t + 0.03 + i * 0.028, 0.02, 0.06, bus.crush, 0.001);
      if (m > 0.8) { tone(v, 'sine', 70, 34, t + 0.04, d * 1.3, 0.35, null, 0.04); for (let i = 0; i < 4; i++) fm(v, vr(2300, 0.3), 1.41, 3, 0, t + 0.06 + i * 0.06 + R() * 0.03, 0.08, 0.05); }
      if (m > 0.8) duck(0.2 + m * 0.3, 0.25 + m * 0.45); fin(v); }, // v4: nổ thường không né nhạc (chỉ nổ rất lớn)
    // MANA: blip toàn ảnh nhẹ
    mana() { const h = hoCua('mana'); if (h) return W[h](); const v = V('mana', 1); if (!v) return; const t = v.t;
      tone(v, 'sine', 1320, 1760, t, 0.09, 0.09); tone(v, 'triangle', 1980, 2640, t + 0.03, 0.07, 0.04); gui(v, 0.3); fin(v); },
    // CHẠM Ụ HỖ TRỢ: blip hologram mềm (rung FM nhẹ)
    hoTro() { if (phatMau('ho-tro')) return; const v = V('hoTro', 1); if (!v) return; const t = v.t;
      const a = tone(v, 'sine', 1046, 0, t, 0.14, 0.08, null, 0.01), m = osc(v, 'sine', 18, t, t + 0.2), mg = gn(v, 25); ch(m, mg, a.frequency);
      tone(v, 'sine', 1568, 0, t + 0.05, 0.14, 0.06, null, 0.01); burst(v, t, 0.02, 0.03, 'highpass', 7000, 0.7); gui(v, 0.35); fin(v); },
    // OVERLORD: siêu sấm — hồ quang dài + bùm sub
    sam() { const v = V('sam', 2); if (!v) return; const t = v.t;
      const ns = on(v, t, t + 0.55), bp = loc(v, 'bandpass', 2500, 1.2), am = gn(v, 0), lfo = osc(v, 'square', 45, t, t + 0.55), g = gn(v);
      lfo.connect(am.gain); env(g.gain, t, 0.01, 0.4, 0.5); ch(ns, bp, am, g, v.out);
      tone(v, 'sine', 72, 28, t, 0.9, 0.8); burst(v, t, 0.9, 0.55, 'lowpass', 1800, 0.7, null, 200);
      for (let i = 0; i < 8; i++) burst(v, t + R() * 0.5, 0.01, 0.3, 'highpass', 5000, 0.7);
      vaoCrush(v, 0.25); duck(0.7, 0.8); fin(v); },
    // HỐ ĐEN: drone FM rơi sâu + ồn hút phồng lên
    hoden() { const v = V('hoden', 2); if (!v) return; const t = v.t, d = 1.25;
      const c = tone(v, 'sine', 180, 38, t, d, 0.45, null, 0.2), m = osc(v, 'sine', 254, t, t + d + 0.3), mg = gn(v, 50);
      m.frequency.exponentialRampToValueAtTime(54, t + d); mg.gain.setValueAtTime(50, t); mg.gain.linearRampToValueAtTime(400, t + d); ch(m, mg, c.frequency);
      burst(v, t, 0.5, 0.25, 'lowpass', 400, 2, null, 1500, 0.7); duck(0.5, 1.2); fin(v); },
    // KỸ NĂNG MA VƯƠNG: hợp âm lướt lên + vút → va chạm
    mv() { const v = V('mv', 2); if (!v) return; const t = v.t;
      riser(v, t, 0.38, 0.36);
      const f = loc(v, 'lowpass', 600, 3); f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(5000, t + 0.36); f.connect(v.out);
      for (const m of [1, 1.5, 2]) tone(v, 'sawtooth', 110 * m, 440 * m, t, 0.02, 0.06, f, 0.36);
      // ĐÒN: va chạm lớn + hợp âm Em anh hùng + quét ồn trầm
      const t2 = t + 0.38; boom(v, t2, 1.25, 130); stab(v, t2, [40, 52, 59, 64, 67, 71, 76], 0.55, 0.03, 5200);
      burst(v, t2, 0.35, 0.3, 'lowpass', 2500, 0.7, null, 250);
      const f2 = loc(v, 'lowpass', 5000, 2); f2.frequency.setValueAtTime(5000, t2); f2.frequency.exponentialRampToValueAtTime(700, t2 + 0.4); f2.connect(v.out);
      for (const m of [1, 1.26, 1.5, 2]) tone(v, 'sawtooth', 440 * m, 0, t2, 0.4, 0.035, f2);
      vaoCrush(v, 0.15); gui(v, 0.25); vang(v, 0.4); duck(0.7, 0.9); fin(v); },

    // ---------- TRÚNG ĐÒN / QUÁI ----------
    // trúng: tick FM kim loại siêu ngắn (đạn) / tick zap (năng lượng) — rất nhẹ vì phát dày
    trung() { const v = V('trung', 0); if (!v) return; const t = v.t, h = hoCua('lien') || (typeof G !== 'undefined' && G && G.dangBan && G.dangBan.id) || '';
      if (/laser|nl|set|aten|dongbo|haoquang|nangluong|phagiap|bao|lienket|nhieusong/.test(h)) fm(v, vr(3600, 0.12), 0.5, 2, 0, t, 0.025, 0.05, null, 1800);
      else fm(v, vr(2700, 0.15), 1.73, 2, 0, t, 0.02, 0.045);
      burst(v, t, 0.008, 0.05, 'highpass', 5000, 0.7); fin(v); },
    // CHÍ MẠNG: ping kim loại sáng, vút lên + bíp số
    crit() { if (phatMau('chi-mang')) return; const v = V('crit', 1); if (!v) return; const t = v.t, f = vr(3200, 0.05);
      fm(v, f, 1.5, 2, 0.2, t, 0.1, 0.07, null, f * 1.3); tone(v, 'sine', f * 1.5, f * 1.75, t + 0.02, 0.07, 0.04); tone(v, 'square', f * 0.5, 0, t, 0.025, 0.03, bus.crush);
      burst(v, t, 0.015, 0.08, 'highpass', 6000, 0.7); gui(v, 0.2); fin(v); },
    // QUÁI CHẾT: pop/glitch số (bậc cao độ ngẫu nhiên qua crush)
    chet(trum) { if (trum) return S.chetTrum(); if (phatMau('ha-quai')) return; const v = V('chet', 0); if (!v) return; const t = v.t;
      for (let i = 0; i < 3; i++) tone(v, 'square', 400 + R() * 1200, 0, t + i * 0.018, 0.016, 0.07, bus.crush, 0.001);
      burst(v, t, 0.03, 0.18, 'bandpass', 1500, 1); tone(v, 'sine', 300, 80, t, 0.06, 0.18); fin(v); },
    chetTrum() { if (phatMau('boss-guc-nga')) return; const v = V('chetTrum', 2); if (!v) return; const t = v.t;
      const f = loc(v, 'lowpass', 3000); f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.9); f.connect(v.out);
      tone(v, 'sawtooth', 900, 35, t, 0.9, 0.2, f); tone(v, 'square', 450, 18, t, 0.9, 0.08, f);
      for (let i = 0; i < 10; i++) tone(v, 'square', (1600 - i * 130) * vr(1, 0.3), 0, t + i * 0.03, 0.025, 0.08, bus.crush, 0.001);
      boom(v, t, 0.9, 120); boom(v, t + 0.32, 0.8, 100); burst(v, t + 0.32, 1.1, 0.12, 'highpass', 5000, 0.7, null, 2500); // nổ kép + mảnh vụn
      stab(v, t + 0.32, [40, 47, 52, 56, 59, 64], 0.7, 0.025, 4200); vang(v, 0.4); duck(0.75, 1.3); fin(v); },

    // ---------- TRÙM ----------
    // cảnh báo trùm xuất hiện: còi robot 2 tông + giọng formant "WARNING"
    canhBao() { if (phatMau('boss-xuat-hien')) return; const v = V('canhBao', 2); if (!v) return; const t = v.t;
      const o = osc(v, 'square', 880, t, t + 0.62), lp = loc(v, 'lowpass', 3000), g = gn(v), am = gn(v, 0.6), tr = osc(v, 'sine', 30, t, t + 0.62), tg = gn(v, 0.4);
      for (let i = 0; i < 4; i++) { o.frequency.setValueAtTime(i % 2 ? 622 : 880, t + i * 0.14); }
      ch(tr, tg, am.gain); env(g.gain, t, 0.01, 0.1, 0.56); ch(o, lp, am, g, v.out);
      tone(v, 'sine', 55, 45, t, 0.6, 0.25);
      const bl = loc(v, 'lowpass', 200, 3); bl.frequency.setValueAtTime(200, t); bl.frequency.exponentialRampToValueAtTime(1600, t + 0.3); bl.frequency.exponentialRampToValueAtTime(300, t + 1.3); bl.connect(v.out);
      for (const [m, k] of [[28, 1], [40, 0.993], [40, 1.007], [47, 1], [52, 1.004]]) tone(v, 'sawtooth', hz(m) * k, 0, t, 1.2, 0.05, bl, 0.03); // BRAAM
      boom(v, t, 0.8, 110);
      noiRobot(v, t + 0.62, TU.warning, 82, 0.5); vaoCrush(v, 0.15); gui(v, 0.25); duck(0.5, 1.4); fin(v); },
    // trùm báo trước chiêu: bíp bíp đi lên + tích năng lượng
    bao() { const v = V('bao', 2); if (!v) return; const t = v.t;
      [1200, 1400, 1600].forEach((f, i) => tone(v, 'square', f, 0, t + i * 0.12, 0.07, 0.035));
      const bp = loc(v, 'bandpass', 200, 5); bp.frequency.setValueAtTime(200, t); bp.frequency.exponentialRampToValueAtTime(1400, t + 0.9); bp.connect(v.out);
      tone(v, 'sawtooth', 200, 1400, t, 0.15, 0.25, bp, 0.8); fin(v); },
    // trùm tung chiêu: va chạm nặng + màu riêng từng trùm
    chieuTrum(id) { if (phatMau('boss-ky-nang')) return; const v = V('chieuTrum', 2); if (!v) return; const t = v.t;
      boom(v, t, 0.75, 110); burst(v, t, 0.25, 0.35, 'lowpass', 2200, 0.7, null, 300); burst(v, t, 0.12, 0.12, 'bandpass', 1300, 1, bus.crush);
      if (id === 'mad_crown') for (let i = 0; i < 6; i++) tone(v, 'square', 300 + R() * 1500, 0, t + i * 0.03, 0.025, 0.07, bus.crush, 0.001);
      else if (id === 'freezer') [[1, 0.1, 0.6], [2.76, 0.06, 0.35], [5.4, 0.03, 0.2]].forEach(([m, a, d]) => tone(v, 'sine', 900 * m, 0, t, d, a));
      else if (id === 'janus') { burst(v, t, 0.4, 0.4, 'bandpass', 300, 1); tone(v, 'sine', 55, 30, t, 0.5, 0.5); }
      else if (id === 'joker_king') { const o = tone(v, 'sine', 300, 0, t, 0.3, 0.12, null, 0.01); o.frequency.linearRampToValueAtTime(900, t + 0.12); o.frequency.linearRampToValueAtTime(300, t + 0.3); }
      else if (id === 'nightmare') tone(v, 'sawtooth', 1800, 60, t, 0.35, 0.12);
      else if (id === 'octopus') burst(v, t, 0.5, 0.3, 'bandpass', 900, 0.8, null, 400, 0.05);
      gui(v, 0.2); duck(0.4, 0.5); fin(v); },
    // LỌT QUÁI / MẤT MẠNG: rè lỗi trầm 2 nhịp
    lot() { const v = V('lot', 2); if (!v) return; const t = v.t;
      const lp = loc(v, 'lowpass', 1100), g = gn(v); ch(lp, g, v.out);
      osc(v, 'square', 98, t, t + 0.45).connect(lp); osc(v, 'square', 103.5, t, t + 0.45).connect(lp);
      const p = g.gain; p.setValueAtTime(0, t); p.linearRampToValueAtTime(0.25, t + 0.01); p.setValueAtTime(0.25, t + 0.14); p.linearRampToValueAtTime(0, t + 0.16);
      p.linearRampToValueAtTime(0.25, t + 0.21); p.setValueAtTime(0.25, t + 0.37); p.linearRampToValueAtTime(0, t + 0.4);
      tone(v, 'sine', 55, 50, t, 0.4, 0.3); vaoCrush(v, 0.35); duck(0.5, 0.5); fin(v); },
    // BẮT ĐẦU WAVE: riser → stab hợp âm + kick
    wave(n, trum) { if (phatMau('bat-dau-dot')) return; const v = V('wave', 2); if (!v) return; const t = v.t, t2 = t + 0.35;
      riser(v, t, 0.35, trum ? 0.34 : 0.28);
      // DROP: va chạm sub + hợp âm (thường: Em9 sáng / trùm: tam cung tối)
      boom(v, t2, trum ? 1.3 : 0.85, trum ? 120 : 150); if (trum) boom(v, t2 + 0.3, 0.7, 90);
      stab(v, t2, trum ? [40, 52, 58, 64, 67, 70] : [52, 59, 64, 66, 71, 76], trum ? 0.6 : 0.4, 0.028, trum ? 3600 : 5000);
      gui(v, 0.25); vang(v, 0.35); duck(0.55, 1); fin(v); }, // v4: bỏ giọng robot "WAVE" mỗi wave (mỏi tai sau 30 wave)
    // KẾT THÚC: thắng = arp trưởng đi lên + hợp âm ngân; thua = "tape-stop" tụt giọng + rè
    ketThuc(thang) { if (phatMau(thang ? 'thang' : 'thua')) return; const nh = stinger(thang ? 'thang' : 'thua'); const v = V('ketThuc', 2); if (!v) return; const t = v.t;
      if (nh) { boom(v, t, thang ? 0.8 : 1, thang ? 150 : 100); vang(v, 0.4); fin(v); return; } // nhạc đang bật → fanfare / sting ở bus nhạc
      if (thang) {
        const f = loc(v, 'lowpass', 4000, 2); f.connect(v.out);
        [1, 1.26, 1.5, 2, 2.52, 3].forEach((m, i) => tone(v, 'square', 220 * m, 0, t + i * 0.08, 0.25, 0.05, f));
        const t2 = t + 0.5, f2 = loc(v, 'lowpass', 600, 3); f2.frequency.setValueAtTime(600, t2); f2.frequency.exponentialRampToValueAtTime(5000, t2 + 0.6); f2.connect(v.out);
        for (const m of [1, 1.26, 1.5, 2]) { tone(v, 'sawtooth', 440 * m * 0.997, 0, t2, 1.2, 0.04, f2, 0.08); tone(v, 'sawtooth', 440 * m * 1.003, 0, t2, 1.2, 0.04, f2, 0.08); }
        tone(v, 'sine', 3520, 0, t2 + 0.1, 0.6, 0.03); tone(v, 'sine', 110, 40, t2, 0.4, 0.5);
      } else {
        v.out.gain.value *= 2.6;
        const f = loc(v, 'lowpass', 3000, 2); f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(150, t + 1.1); f.connect(v.out);
        for (const m of [1, 1.189, 1.5]) tone(v, 'sawtooth', 220 * m, 55 * m, t, 1.1, 0.07, f, 0.01);
        for (let i = 0; i < 5; i++) tone(v, 'square', 200 + R() * 600, 0, t + 0.9 + i * 0.03, 0.025, 0.06, bus.crush, 0.001);
        const lp = loc(v, 'lowpass', 700); lp.connect(v.out); tone(v, 'square', 55, 50, t + 1.05, 0.5, 0.15, lp, 0.01);
      }
      gui(v, 0.4); duck(0.85, 2.2); fin(v); },
    // JACKPOT (v4): mẫu riêng; chưa nạp → mượn thức tỉnh như cũ
    jackpot() { if (phatMau('jackpot')) return; S.thucTinh(); },
    // HẾT WAVE (v4, sân sạch quái): mẫu; dự phòng = 3 nốt Mi–Si–Sol ngắn
    xongDot() { if (phatMau('xong-dot')) return; const v = V('wave', 2); if (!v) return; const t = v.t;
      [64, 71, 67].forEach((m, i) => tone(v, 'triangle', hz(m + 12), 0, t + i * 0.09, 0.22, 0.07)); gui(v, 0.3); duck(0.2, 0.5); fin(v); },
    // ---- ỤNG MỚI (skills3.js) ----
    // tích-tắc đồng hồ (Chrono Lock khoá / Chrono Throne)
    tich() { const v = V('tich', 1); if (!v) return; const t = v.t;
      burst(v, t, 0.012, 0.22, 'bandpass', 3200, 6); tone(v, 'sine', 2400, 0, t, 0.02, 0.06);
      burst(v, t + 0.16, 0.012, 0.16, 'bandpass', 2300, 6); tone(v, 'sine', 1800, 0, t + 0.16, 0.02, 0.05); gui(v, 0.2); fin(v); },
    // kính thời gian vỡ: chùm leng keng cao + ồn vỡ
    kinhVo() { const v = V('kinhVo', 1); if (!v) return; const t = v.t;
      burst(v, t, 0.12, 0.3, 'highpass', 4000, 0.8, null, 9000);
      for (let i = 0; i < 5; i++) tone(v, 'sine', vr(2600 + i * 700, 0.08), 0, t + i * 0.018, 0.12, 0.05);
      tone(v, 'sine', 160, 50, t, 0.12, 0.35); gui(v, 0.3); fin(v); },
    // đạn nảy: "ping" cao dần theo số lần nảy
    nay(k) { const v = V('nay', 0); if (!v) return; const t = v.t, f = 900 * Math.pow(2, Math.min(8, k || 0) * 2 / 12);
      tone(v, 'triangle', f, f * 1.6, t, 0.07, 0.11); tone(v, 'sine', f * 2, 0, t, 0.05, 0.04); fin(v); },
    // COMBO ×N: "ting" tăng cao độ theo combo
    combo(n) { const v = V('combo', 2); if (!v) return; const t = v.t, r = 523 * Math.pow(2, Math.min(24, n || 1) / 12 * 0.5);
      [0, 4, 7].forEach((s, i) => tone(v, 'square', r * Math.pow(2, s / 12), 0, t + i * 0.035, 0.09, 0.06));
      tone(v, 'sine', r * 4, 0, t + 0.1, 0.25, 0.05); gui(v, 0.35); fin(v); },
    // máy quay thưởng (Pandora): tick-tick nhanh rồi chậm
    quay() { const v = V('quay', 2); if (!v) return; const t = v.t;
      let tt = t; for (let i = 0; i < 12; i++) { burst(v, tt, 0.01, 0.14, 'bandpass', 2600 - i * 60, 5); tone(v, 'square', 1300 - i * 30, 0, tt, 0.012, 0.03); tt += 0.035 + i * i * 0.0012; }
      fin(v); },
    // ---- LUCKY SLOT 3 ô (jackpot.js): cuộn tích-tích đều trong d giây · "cạch" mỗi ô dừng (cao dần trái → phải) · chuông cặp · "hụt" khác hết ----
    cbCuon(d) { const v = V('cbCuon', 1); if (!v) return; const t = v.t, n = Math.max(4, Math.round((d || 1.2) / 0.055));
      for (let i = 0; i < n; i++) { const tt = t + i * 0.055; burst(v, tt, 0.008, 0.09, 'bandpass', 2800 + (i % 3) * 300, 6); tone(v, 'square', 1500 + (i % 3) * 120, 0, tt, 0.01, 0.018); }
      fin(v); },
    cbDung(j) { const v = V('cbDung', 2); if (!v) return; const t = v.t, f = [180, 200, 225][j | 0] || 180;
      tone(v, 'sine', f, f * 0.5, t, 0.09, 0.32); burst(v, t, 0.03, 0.22, 'bandpass', 1400 + (j | 0) * 250, 3); tone(v, 'square', f * 6, 0, t, 0.02, 0.05); gui(v, 0.15); fin(v); },
    cbCap(f) { const v = V('cbCap', 2); if (!v) return; const t = v.t, r = [659, 587, 784][f | 0] || 659;
      [0, 4, 7, 12].forEach((s, i) => tone(v, 'triangle', r * Math.pow(2, s / 12), 0, t + i * 0.06, 0.22, 0.07)); tone(v, 'sine', r * 4, 0, t + 0.22, 0.4, 0.04); gui(v, 0.35); fin(v); },
    cbHut() { const v = V('cbHut', 1); if (!v) return; const t = v.t;
      tone(v, 'square', 330, 220, t, 0.16, 0.05); tone(v, 'square', 262, 175, t + 0.15, 0.22, 0.05); fin(v); },
    // tua băng ngược (REWIND): quét cao độ giảm + rè + chuông lớn
    tua() { const v = V('tua', 2); if (!v) return; const t = v.t;
      const f = loc(v, 'bandpass', 3000, 2); f.frequency.setValueAtTime(3500, t); f.frequency.exponentialRampToValueAtTime(400, t + 0.6); f.connect(v.out);
      tone(v, 'sawtooth', 1400, 180, t, 0.6, 0.12, f); burst(v, t, 0.6, 0.12, 'bandpass', 2500, 1, null, 300);
      vaoCrush(v, 0.3);
      const t2 = t + 0.62; for (const m of [1, 2.76, 5.4]) tone(v, 'sine', 220 * m, 0, t2, 1.1 / m, 0.18 / m);
      tone(v, 'sine', 70, 35, t2, 0.4, 0.5); gui(v, 0.4); duck(0.6, 1); fin(v); },
    // đuôi cáo / cầu lửa hồ ly: "vụt" + chuông đền
    hoLy() { const v = V('hoLy', 2); if (!v) return; const t = v.t;
      burst(v, t, 0.25, 0.2, 'bandpass', 600, 2, null, 4000);
      for (const m of [1, 1.5, 2.01]) tone(v, 'sine', 660 * m, 0, t + 0.12, 0.9, 0.07 / m); gui(v, 0.4); fin(v); },
    // ---- GROW-UP / WAKE-UP (growfx.js): biến hình + đòn đánh riêng từng dạng ----
    // nạp biến hình (0–220 ms): quét cao dần + rít ồn
    gNap() { const v = V('gNap', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 260, 1300, t, 0.22, 0.12); tone(v, 'triangle', 520, 2600, t + 0.02, 0.2, 0.04); burst(v, t, 0.22, 0.08, 'bandpass', 800, 3, null, 5000); fin(v); },
    // khoá dạng mới (220 ms): cú "thịch" nặng + chuông ánh kim (lon = thức tỉnh dạng 3)
    gKhoa(lon) { const v = V('gKhoa', 2); if (!v) return; const t = v.t;
      tone(v, 'sine', 150, 40, t, 0.22, 0.5); burst(v, t, 0.09, 0.3, 'lowpass', 900, 1);
      const cs = lon ? [1, 1.26, 1.5, 2] : [1, 1.5]; cs.forEach((m, i) => tone(v, 'sine', 880 * m, 0, t + 0.03 + i * 0.03, lon ? 0.7 : 0.35, 0.06));
      if (lon) { vaoCrush(v, 0.15); duck(0.4, 0.5); } gui(v, 0.35); fin(v); },
    // vuốt cào: 1 = 1 nhát · 2 = 2 nhát chéo · 3 = 2 nhát chí mạng + tiếng kim loại
    gVuot(n) { const v = V('gVuot', 1); if (!v) return; const t = v.t, k = n || 1;
      for (let i = 0; i < Math.min(2, k); i++) burst(v, t + i * 0.06, 0.07, 0.22, 'bandpass', 2400 + 800 * k, 2, null, 900);
      if (k >= 3) { tone(v, 'square', 2600, 1800, t, 0.05, 0.04); tone(v, 'sine', 3800, 0, t + 0.06, 0.12, 0.05); } fin(v); },
    gArc() { const v = V('gArc', 0); if (!v) return; const t = v.t; burst(v, t, 0.05, 0.16, 'highpass', 3000, 1); tone(v, 'sawtooth', 1800, 400, t, 0.05, 0.04); fin(v); },
    // cột sét từ trời (Overlord dạng 3): sấm trầm + rè
    gCot() { const v = V('gCot', 2); if (!v) return; const t = v.t;
      burst(v, t, 0.5, 0.4, 'lowpass', 1600, 1, null, 120); tone(v, 'sine', 90, 30, t, 0.5, 0.6); burst(v, t, 0.18, 0.2, 'highpass', 5000, 1); vaoCrush(v, 0.25); duck(0.6, 0.6); fin(v); },
    // giáo trời (Vệ Tinh bắn phá): "bíp" ngắm + rít rơi + nổ đục
    gTam() { const v = V('gTam', 0); if (!v) return; const t = v.t; tone(v, 'square', 1760, 0, t, 0.04, 0.03); tone(v, 'square', 1760, 0, t + 0.07, 0.04, 0.03); fin(v); },
    gLance() { const v = V('gLance', 1); if (!v) return; const t = v.t;
      tone(v, 'sawtooth', 2400, 300, t, 0.14, 0.05); burst(v, t + 0.12, 0.16, 0.3, 'lowpass', 700, 1); tone(v, 'sine', 120, 45, t + 0.12, 0.16, 0.3); fin(v); },
    // sao: 1 lấp lánh · 2 đôi · 3 sao chổi (vụt + chuông)
    gSao(k) { const v = V('gSao', 1); if (!v) return; const t = v.t;
      if ((k || 1) >= 3) { burst(v, t, 0.2, 0.14, 'bandpass', 1200, 2, null, 6000); [1, 1.5, 2].forEach((m, i) => tone(v, 'sine', 1320 * m, 0, t + 0.05 + i * 0.04, 0.4, 0.05)); }
      else { tone(v, 'triangle', 2093, 2637, t, 0.06, 0.06); if (k === 2) tone(v, 'triangle', 2637, 3136, t + 0.05, 0.06, 0.05); } gui(v, 0.25); fin(v); },
    gXich() { const v = V('gXich', 1); if (!v) return; const t = v.t; for (let i = 0; i < 3; i++) { burst(v, t + i * 0.025, 0.02, 0.18, 'bandpass', 4200 - i * 500, 8); tone(v, 'sine', 2900 + i * 300, 0, t + i * 0.025, 0.05, 0.03); } fin(v); },
    gVang() { const v = V('gVang', 1); if (!v) return; const t = v.t; tone(v, 'sine', 1568, 0, t, 0.18, 0.08); tone(v, 'square', 784, 0, t, 0.06, 0.03); tone(v, 'sine', 2352, 0, t + 0.02, 0.2, 0.04); gui(v, 0.3); fin(v); },
    gKim() { const v = V('gKim', 1); if (!v) return; const t = v.t; burst(v, t, 0.012, 0.22, 'bandpass', 3400, 7); tone(v, 'triangle', 3000, 1200, t + 0.01, 0.08, 0.05); fin(v); },
    gEcho() { const v = V('gEcho', 1); if (!v) return; const t = v.t; tone(v, 'sine', 600, 1400, t, 0.18, 0.06); burst(v, t, 0.2, 0.06, 'bandpass', 2000, 4, null, 600); gui(v, 0.5); fin(v); },
    // lửa: 1 cam · 2 lam (gắt hơn) · 3 trắng (rít cao)
    gLua(m) { if (phatMau('ban-lua', { k: 0.7 + 0.15 * Math.min(2, (m || 1) - 1) })) return; const v = V('gLua', 0); if (!v) return; const t = v.t, k = m || 1;
      burst(v, t, 0.16, 0.12, 'lowpass', 700 + 500 * k, 0.7); burst(v, t, 0.1, 0.05 * k, 'bandpass', 2500 + 1200 * k, 1.5); fin(v); },
    gBang() { const v = V('gBang', 1); if (!v) return; const t = v.t; for (let i = 0; i < 3; i++) tone(v, 'sine', vr(3200 + i * 600, 0.05), 0, t + i * 0.03, 0.08, 0.04); burst(v, t, 0.05, 0.08, 'highpass', 6000, 1); fin(v); },
    gThe() { const v = V('gThe', 0); if (!v) return; const t = v.t; burst(v, t, 0.03, 0.14, 'bandpass', 3000, 3); tone(v, 'square', 660, 990, t, 0.04, 0.03); fin(v); },
    gNung() { const v = V('gNung', 1); if (!v) return; const t = v.t; burst(v, t, 0.12, 0.2, 'lowpass', 900, 1); tone(v, 'sine', 220, 90, t, 0.12, 0.2); fin(v); },
    gHo() { const v = V('gHo', 0); if (!v) return; const t = v.t; burst(v, t, 0.14, 0.12, 'bandpass', 900, 2, null, 2600); tone(v, 'sine', 880, 0, t + 0.04, 0.15, 0.03); fin(v); },
    // ---- 4 ụ Đỏ đợt 3 (skills5.js) ----
    gOng() { const v = V('gOng', 0); if (!v) return; const t = v.t; tone(v, 'sawtooth', 190, 210, t, 0.25, 0.05); tone(v, 'square', 95, 105, t, 0.25, 0.02); burst(v, t, 0.2, 0.03, 'bandpass', 1500, 2); fin(v); },
    gSwarm() { const v = V('gSwarm', 2); if (!v) return; const t = v.t; for (let i = 0; i < 5; i++) tone(v, 'sawtooth', vr(180 + i * 40, 0.1), 700 + i * 90, t + i * 0.04, 0.4, 0.04); burst(v, t, 0.5, 0.1, 'bandpass', 1200, 2, null, 3500); gui(v, 0.3); fin(v); },
    gNuot() { const v = V('gNuot', 1); if (!v) return; const t = v.t; burst(v, t, 0.4, 0.16, 'lowpass', 1800, 2, null, 200); tone(v, 'sine', 300, 60, t + 0.3, 0.2, 0.4); fin(v); },
    gSongTho() { const v = V('gSongTho', 2); if (!v) return; const t = v.t; burst(v, t, 1.4, 0.3, 'lowpass', 600, 1, null, 2400); tone(v, 'sine', 70, 50, t, 1.2, 0.4); burst(v, t + 0.2, 1.1, 0.08, 'highpass', 4000, 1); duck(0.5, 1.4); fin(v); },
    gHop(lon) { const v = V('gHop', 2); if (!v) return; const t = v.t; const cs = lon ? [523, 659, 784, 1047] : [659, 988]; cs.forEach((f, i) => { tone(v, 'triangle', f, 0, t + i * 0.05, 0.8, 0.05); tone(v, 'sine', f * 2, 0, t + i * 0.05, 0.6, 0.02); }); gui(v, 0.5); fin(v); },
    gRong() { const v = V('gRong', 2); if (!v) return; const t = v.t; tone(v, 'sawtooth', 160, 60, t, 0.9, 0.18); burst(v, t, 0.9, 0.3, 'lowpass', 1400, 1, null, 300); vaoCrush(v, 0.3); duck(0.6, 1); fin(v); },
  };

  // =====================================================================================================
  //  NHẠC NỀN: máy nhạc darksynth thích ứng ở nhac.js (NHAC.tao). Ở đây: nối vào bus nhạc + lịch + cảnh (0 menu · 1 trận · 2 trùm)
  // =====================================================================================================
  const NH = { canh: 0, chay: false, timer: 0, ep: null };
  function may() { if (!bus || typeof NHAC === 'undefined') return null; if (!bus.may) bus.may = NHAC.tao(bus.c, bus.nhac, { offline }); return bus.may; }
  function lich() {
    const m = bus && bus.may; if (!m || !ac || ac.state !== 'running') return;
    m.lich();
    if (!NH.chay && !m.pha.length) { clearInterval(NH.timer); NH.timer = 0; m.huy(); bus.may = null; } // nhạc tắt: giải phóng hẳn
  }
  function chayNhac() {
    if (!ac || !batNhac) return; const m = may(); if (!m) return;
    if (!NH.chay) { NH.chay = true; m.ep = NH.ep; m.datCanh(NH.canh); }
    if (!NH.timer) NH.timer = setInterval(lich, 50);
    lich();
  }
  function dungNhac() { NH.chay = false; if (bus && bus.may) bus.may.dungHet(); }
  function stinger(kieu) { if (!batNhac || !NH.chay || offline) return 0; const m = may(); return m ? m.sting(kieu) : 0; }

  // ---------- mở khoá âm thanh (điện thoại) + tab ẩn ----------
  function mo() {
    if (!AC) return;
    if (!ac) {
      try { ac = new AC({ latencyHint: 'interactive' }); } catch (e) { try { ac = new AC(); } catch (e2) { return; } }
      bus = taoBus(ac);
      napMau(); // mẫu SFX v4: giải mã khi đã có context (dữ liệu đã tải trước)
      try { const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); } catch (e) { } // iOS cũ
    }
    if (ac.state !== 'running' && !document.hidden) { try { const p = ac.resume(); if (p && p.then) p.then(() => { if (batNhac) chayNhac(); }, () => { }); } catch (e) { } }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { } // iOS 17+: phát cả khi gạt im lặng
    if (batNhac) chayNhac();
  }
  // chỉ mở khoá ở sự kiện CÓ cấp quyền phát (user activation): chạm = touchend / pointerup (pointerdown cảm ứng thì chưa → tạo/resume
  // ở đó bị chặn + cảnh báo "AudioContext was not allowed to start"), chuột = mousedown/pointerdown, phím (trừ phím bổ trợ)
  const moKhoa = (e) => {
    if (e.type === 'pointerdown' && e.pointerType && e.pointerType !== 'mouse') return; // chạm / bút: chờ pointerup / touchend
    if (e.type === 'pointerup' && e.pointerType === 'mouse') return;                   // chuột: đã mở ở pointerdown / mousedown
    if (e.type === 'keydown' && /^(Shift|Control|Alt|Meta|CapsLock|Fn)$/.test(e.key)) return;
    mo();
  };
  ['pointerdown', 'pointerup', 'touchend', 'mousedown', 'keydown'].forEach(e => document.addEventListener(e, moKhoa, { capture: true, passive: true }));
  // nút "quay lại / đóng" → mẫu ui-quay-lai thay ui-cham: nhớ phần tử vừa chạm (SND.nut không nhận tham số)
  let chamCuoi = null, chamLuc = 0;
  document.addEventListener('pointerdown', (e) => { chamCuoi = e.target; chamLuc = performance.now(); }, { capture: true, passive: true });
  function laLui() {
    if (!chamCuoi || performance.now() - chamLuc > 1500 || !chamCuoi.closest) return false;
    const b = chamCuoi.closest('[data-act],button'); if (!b) return false;
    const a = (b.dataset && b.dataset.act) || '', l = (b.getAttribute('aria-label') || '') + ' ' + b.className;
    return /(^|-)(dong|ve|back|thoat|huy|close|tiep)$/.test(a) || /\b(close|back|dong|hm-dong)\b/i.test(l);
  }
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    try { if (document.hidden) ac.suspend(); else ac.resume(); } catch (e) { }
  });
  function nutNhan() {
    const T = (typeof TEXT !== 'undefined' && TEXT.ui) || {};
    document.querySelectorAll('[data-act="amthanh"]').forEach(e => { e.dataset.t = batSfx ? 'sfxOn' : 'sfxOff'; e.textContent = T[e.dataset.t] || (batSfx ? 'SFX: ON' : 'SFX: OFF'); });
    document.querySelectorAll('[data-act="nhac"]').forEach(e => { e.dataset.t = batNhac ? 'musicOn' : 'musicOff'; e.textContent = T[e.dataset.t] || (batNhac ? 'MUSIC: ON' : 'MUSIC: OFF'); });
  }
  nutNhan();
  function datGain(p, x) { if (!ac) return; const t = ac.currentTime; p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(x, t + 0.08); }

  // ---------- xuất file demo (OfflineAudioContext) ----------
  async function ghi(ten, args, dai, sr) {
    sr = sr || 22050;
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OC(2, Math.ceil(dai * sr), sr), luu = bus, luuOff = offline;
    bus = taoBus(oc, true); offline = true;
    try {
      if (ten === 'nhac') { // args: [kịch bản [[giây, cường độ|null, cảnh|null, stinger|null], ...]]  (xuất file nghe thử)
        const m = NHAC.tao(oc, bus.nhac, { offline: true });
        for (const [t, ep, canh, st] of args[0]) { m.lich(t); if (ep != null) { m.ep = ep; m.I = ep; } if (st) m.sting(st, t); if (canh != null) m.datCanh(canh); }
        m.lich(dai - 0.2); }
      else if (ten === 'chuoi') { for (const [t, k, a] of args) { lech = t; S[k].apply(null, a || []); } } // chuỗi SFX (xuất demo)
      else if (ten === 'laser') { const L = taoLaser(0.01); tatLaser(L, dai - 0.5); }
      else if (ten === 'gatling3x') { for (let i = 0; i < Math.floor((dai - 0.3) / 0.052); i++) { lech = i * 0.052; S.lien(); } }
      else if (ten.slice(0, 2) === 'w:') W[ten.slice(2)]();
      else S[ten].apply(null, args || []);
    } finally { bus = luu; offline = luuOff; lech = 0; }
    return oc.startRendering();
  }

  const API = {
    mo, laser, ghi,
    // bật/tắt SFX (giữ tên cũ batTat) và NHẠC, lưu lại
    batTat() { batSfx = !batSfx; ghiLS('turret_sfx', batSfx); if (bus) datGain(bus.sfx.gain, batSfx ? gSfx() : 0); if (!batSfx && LZ) { tatLaser(LZ, ac.currentTime); LZ = null; } nutNhan(); return batSfx; },
    batTatNhac() { batNhac = !batNhac; ghiLS('turret_nhac', batNhac); if (bus) datGain(bus.nhac.gain, batNhac ? gNhac() : 0); if (batNhac) mo(); else setTimeout(() => { if (!batNhac) dungNhac(); }, 150); nutNhan(); return batNhac; },
    sfxBat: () => batSfx, nhacBat: () => batNhac, nutNhan,
    // âm lượng riêng 0..1 (lưu lại)
    amLuong(loai, x) { if (x == null) return UV[loai]; UV[loai] = Math.max(0, Math.min(1, +x || 0)); ghiSo(loai === 'nhac' ? 'turret_vnhac' : 'turret_vsfx', UV[loai]);
      if (bus) { if (loai === 'nhac' && batNhac) datGain(bus.nhac.gain, gNhac()); if (loai === 'sfx' && batSfx) datGain(bus.sfx.gain, gSfx()); } return UV[loai]; },
    // cảnh nhạc: 0 menu · 1 trận · 2 trùm (vào trùm → stinger BRAAM)
    nhac(muc) { muc = Math.max(0, Math.min(2, muc | 0)); const cu = NH.canh; NH.canh = muc;
      if (muc === 2 && cu !== 2 && !MB['boss-xuat-hien']) stinger('trum'); // v4: chỉ MỘT BRAAM — có mẫu trùm xuất hiện thì bỏ stinger nhạc
      if (NH.chay && bus && bus.may) bus.may.datCanh(muc); },
    // ép cường độ trận (0..1, null = tự động theo wave + số quái) — dùng cho ?sfxlab
    cuongDo(x) { NH.ep = x == null ? null : Math.max(0, Math.min(1, +x)); if (bus && bus.may) bus.may.ep = NH.ep; },
    stinger,
    // mẫu SFX v4 (kiểm thử): danh sách sự kiện, đã nạp, đang phát
    mau: () => ({ ds: Object.keys(MAU), nap: Object.keys(MB), dang: MS.length, tk: JSON.parse(JSON.stringify(MT)), tat: laNoMau, cfg: MAU, nhom: NHOM, tran: TRAN }),
    thongKe: () => Object.assign({ ctx: ac ? ac.state : 'none', nhac: NH.chay, canh: NH.canh, I: bus && bus.may ? +bus.may.I.toFixed(2) : 0, songNhac: bus && bus.may ? bus.may.tk.song : 0, songNhacMax: bus && bus.may ? bus.may.tk.max : 0, laser: !!LZ }, TK),
    danhSach: Object.keys(S), W, HO, DOI,
    phatMau: (k, o) => phatMau(k, o),
    mauTat: (x) => { if (x != null) mauTat = !!x; return mauTat; }, // true = mẫu đã lo (phát / bị luật trộn chặn); false = chưa có mẫu
  };
  for (const k of Object.keys(S)) API[k] = S[k];
  return API;
})();
// móc âm thanh cho hiệu ứng triệu hồi/ghép/biến hình (hieuung.js) — dùng lại các giọng sẵn có, tắt chung bằng nút SFX
SND.lo = (bac) => SND.nang(2 + Math.min(3, bac || 0));       // lộ kết quả ghép (cao dần theo bậc)
SND.bien = () => SND.gNap();                                  // nạp + khoá khi biến hình
SND.sao = () => { if (!SND.phatMau('merge-sao-cao')) SND.nang(5); };  // đạt mốc sao SKILL UP / BINGO (v4: mẫu ghép sao cao)
SND.hu = () => SND.thucTinh();                                // tiếng hú Sói thức tỉnh
SND.xich = () => SND.hoTro();                                 // xích liên kết hình thành

// ---------- thanh âm lượng NHẠC / SFX trong bảng TẠM DỪNG (chèn từ đây, không sửa HTML) ----------
(() => {
  function chen() {
    const bang = document.querySelector('#dung .bang'); if (!bang || bang.querySelector('.am-luong')) return;
    const d = document.createElement('div'); d.className = 'am-luong';
    d.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin:10px 18px 4px;font-weight:800;font-size:12px;line-height:1.2;letter-spacing:.06em;color:#9fe9ff';
    d.innerHTML = ['nhac:MUSIC', 'sfx:SFX'].map(x => { const [k, n] = x.split(':'); return '<label style="display:flex;align-items:center;gap:10px"><span style="width:50px;flex:0 0 50px">' + n + '</span><input type="range" min="0" max="100" data-am="' + k + '" style="flex:1;accent-color:#38e8ff;height:28px"></label>'; }).join('');
    bang.appendChild(d);
    d.querySelectorAll('input').forEach(r => { r.value = Math.round(SND.amLuong(r.dataset.am) * 100); r.addEventListener('input', () => { SND.amLuong(r.dataset.am, r.value / 100); }); r.addEventListener('change', () => { if (r.dataset.am === 'sfx') SND.nut(); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chen); else chen();
})();

// ---------- ?sfxlab: trang ẩn thử toàn bộ âm (mở index.html?sfxlab) ----------
if (/[?&]sfxlab\b/.test(location.search)) (() => {
  const NHOM = [
    ['Vũ khí — theo họ (mỗi lần chạm khác nhẹ: 3 biến thể xoay vòng + lệch cao độ)', Object.keys(SND.HO).map(k => [SND.HO[k], () => SND.W[k](), k])],
    ['Vũ khí — đặc biệt', [['Laser tia liên tục (giữ 2 s)', () => { const t0 = performance.now(), id = setInterval(() => { SND.laser(); if (performance.now() - t0 > 2000) clearInterval(id); }, 50); }],
      ['Railgun / Overlord nạp', () => SND.rail()], ['Overlord siêu sấm', () => SND.sam()], ['Hố đen', () => SND.hoden()],
      ['Nổ nhỏ', () => SND.no(0.3)], ['Nổ vừa', () => SND.no(0.6)], ['Nổ lớn', () => SND.no(1)]]],
    ['Trúng đòn / quái', [['Trúng', () => SND.trung()], ['Chí mạng', () => SND.crit()], ['Quái chết', () => SND.chet()], ['Trùm chết', () => SND.chetTrum()], ['Đạn nảy', () => SND.nay(3)]]],
    ['Giao diện / triệu hồi / ghép', [['Nút', () => SND.nut()], ['Triệu hồi', () => SND.trieu()], ['Ụ đáp xuống', () => SND.dat()], ['Ghép 2★', () => SND.ghep(2)], ['Ghép 6★', () => SND.ghep(6)],
      ['Lên sao / skill up', () => SND.nang(3)], ['Mốc sao (BINGO)', () => SND.sao()], ['Thức tỉnh', () => SND.thucTinh()], ['Biến hình (nạp)', () => SND.gNap()], ['Biến hình (khoá)', () => SND.gKhoa(true)],
      ['Mana', () => SND.mana()], ['Chạm ụ hỗ trợ', () => SND.hoTro()], ['Combo', () => SND.combo(6)]]],
    ['Chỉ huy / wave / trùm / lõi / kết thúc', [['Kỹ năng chỉ huy', () => SND.mv()], ['Bắt đầu wave', () => SND.wave(3, false)], ['Wave TRÙM', () => SND.wave(10, true)],
      ['Cảnh báo trùm', () => SND.canhBao()], ['Trùm báo chiêu', () => SND.bao()], ['Trùm tung chiêu', () => SND.chieuTrum('janus')], ['Lọt quái / mất mạng', () => SND.lot()],
      ['Thắng', () => SND.ketThuc(true)], ['Thua', () => SND.ketThuc(false)], ['Hết wave', () => SND.xongDot()], ['Jackpot', () => SND.jackpot()]]],
  ];
  const RATE = { dan: 55, tia: 300, phao: 600, phong: 700, laser: 280, nl: 350, bang: 450, doc: 500, set: 320, can: 260, trieu: 600 };
  function dung() {
    const css = '#sfxlab{position:fixed;inset:0;z-index:2147483000;overflow:auto;background:#0b0e14;color:#e8f1ff;font:15px/1.4 system-ui,sans-serif;padding:16px;-webkit-overflow-scrolling:touch}' +
      '#sfxlab h1{font-size:20px;margin:0 0 4px;color:#38e8ff}#sfxlab h2{font-size:14px;margin:18px 0 8px;color:#8aa0bf;font-weight:600}#sfxlab p{color:#8aa0bf;margin:0 0 10px;font-size:13px}' +
      '#sfxlab .l{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}#sfxlab button{background:#172031;color:#e8f1ff;border:1px solid #38e8ff44;border-radius:10px;padding:10px 8px;font:600 13px system-ui;text-align:left;min-height:44px;touch-action:manipulation}' +
      '#sfxlab button:active{background:#22406a}#sfxlab .r{display:flex;gap:6px;margin-top:4px}#sfxlab .r button{flex:1;text-align:center;font-size:12px;padding:6px;min-height:34px}#sfxlab .o{background:#0f1520;border:1px solid #263044;border-radius:10px;padding:8px}' +
      '#sfxlab .top{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}#sfxlab .top button{flex:1 1 120px;text-align:center}#sfxlab #tk{font:12px ui-monospace,monospace;color:#7fe0a0;white-space:pre-wrap;margin-top:8px}' +
      '#sfxlab .vol{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0;align-items:center}#sfxlab .vol label{flex:1 1 140px;font-size:13px;color:#8aa0bf}#sfxlab input[type=range]{width:100%;accent-color:#38e8ff}';
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const d = document.createElement('div'); d.id = 'sfxlab';
    d.innerHTML = '<h1>TURRET MERGE · SFX LAB</h1><p>Chạm để nghe (âm được máy tạo trực tiếp bằng Web Audio). Bật tiếng máy / tắt chế độ im lặng. <a style="color:#38e8ff" href="./">← Về game</a></p>' +
      '<div class="top"><button data-x="sfx"></button><button data-x="nhac"></button><button data-x="tran">▶ Trận giả lập 10 s</button></div>' +
      '<div class="vol"><label>Âm lượng NHẠC <input type="range" min="0" max="100" data-v="nhac"></label><label>Âm lượng SFX <input type="range" min="0" max="100" data-v="sfx"></label></div>' +
      '<h2>🎵 NHẠC — máy phát (darksynth cyberpunk thích ứng, tạo trực tiếp)</h2><div class="l">' +
      '<button data-m="0">▶ Chủ đề MENU (120 BPM, Rê thứ)</button><button data-m="1">▶ TRẬN (128 BPM, Mi thứ)</button><button data-m="2">▶ TRÙM (kèn đồng + hợp xướng)</button><button data-m="dung">■ Dừng nhạc</button></div>' +
      '<div class="vol"><label style="flex:1 1 100%">Cường độ trận: <b id="cdo">TỰ ĐỘNG</b><input type="range" min="0" max="100" value="50" data-c="1" style="width:100%"></label>' +
      '<button data-c="tu" style="flex:0 0 auto">Tự động (theo wave)</button></div>' +
      '<p>0–20: êm (pad + bass + arp lọc) · 20+: kick 4/4 + bass 8 · 42+: snare cổng + hat 16 + arp 16 · 70+: giai điệu chính + open hat + crash. Đổi lớp ở đầu ô nhịp.</p>' +
      '<div class="l"><button data-s="trum">▶ Stinger: TRÙM xuất hiện</button><button data-s="thang">▶ Fanfare THẮNG</button><button data-s="thua">▶ Sting THUA</button></div>' +
      '<div id="tk"></div>';
    const fns = [];
    for (const [ten, ds] of NHOM) {
      const h = document.createElement('h2'); h.textContent = ten; d.appendChild(h);
      const l = document.createElement('div'); l.className = 'l'; d.appendChild(l);
      for (const [nhan, fn, ho] of ds) {
        const i = fns.push(fn) - 1;
        if (ho) { const o = document.createElement('div'); o.className = 'o'; const [h1, h2] = nhan.split(' — '); o.innerHTML = '<b style="font-size:14px">' + h1 + '</b><div style="font-size:11px;color:#8aa0bf;min-height:30px">' + (h2 || '') + '</div><div class="r"><button data-i="' + i + '">▶ 1 phát</button><button data-ho="' + ho + '">▶▶ bắn liên tục</button></div>'; l.appendChild(o); }
        else { const b = document.createElement('button'); b.dataset.i = i; b.textContent = '▶ ' + nhan; l.appendChild(b); }
      }
    }
    document.body.appendChild(d);
    d.querySelectorAll('[data-v]').forEach(r => { r.value = Math.round(SND.amLuong(r.dataset.v) * 100); r.addEventListener('input', () => SND.amLuong(r.dataset.v, r.value / 100)); });
    const cr = d.querySelector('[data-c="1"]'), cdo = d.querySelector('#cdo');
    cr.addEventListener('input', () => { SND.mo(); if (!SND.nhacBat()) { SND.batTatNhac(); nhan(); } SND.cuongDo(cr.value / 100); cdo.textContent = cr.value; if (SND.thongKe().canh === 0) SND.nhac(1); });
    const nhan = () => { d.querySelector('[data-x=sfx]').textContent = 'SFX: ' + (SND.sfxBat() ? 'BẬT' : 'TẮT'); d.querySelector('[data-x=nhac]').textContent = 'NHẠC: ' + (SND.nhacBat() ? 'BẬT' : 'TẮT'); };
    nhan();
    const lap = (fn, ms, dai) => { const t0 = performance.now(), id = setInterval(() => { fn(); if (performance.now() - t0 > dai) clearInterval(id); }, ms); fn(); };
    d.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return; SND.mo();
      if (b.dataset.m) { if (b.dataset.m === 'dung') { if (SND.nhacBat()) SND.batTatNhac(); nhan(); return; } if (!SND.nhacBat()) { SND.batTatNhac(); nhan(); } SND.nhac(+b.dataset.m); return; }
      if (b.dataset.s) { if (!SND.nhacBat()) { SND.batTatNhac(); nhan(); } if (b.dataset.s === 'trum') { if (SND.thongKe().canh !== 1) SND.nhac(1); SND.stinger('trum'); } else { SND.stinger(b.dataset.s); SND.nhac(0); } return; }
      if (b.dataset.c === 'tu') { SND.cuongDo(null); cdo.textContent = 'TỰ ĐỘNG'; return; }
      if (b.dataset.i) fns[+b.dataset.i]();
      else if (b.dataset.ho) lap(() => SND.W[b.dataset.ho](), RATE[b.dataset.ho] || 300, 1500);
      else if (b.dataset.x === 'sfx') { SND.batTat(); nhan(); }
      else if (b.dataset.x === 'nhac') { SND.batTatNhac(); nhan(); }
      else if (b.dataset.x === 'tran') { SND.nhac(1); const ks = Object.keys(SND.HO); lap(() => { const k = ks[(Math.random() * ks.length) | 0]; SND.W[k](); SND.W.dan(); if (Math.random() < 0.5) SND.trung(); if (Math.random() < 0.08) SND.no(Math.random()); if (Math.random() < 0.1) SND.chet(); }, 45, 10000); }
    });
    setInterval(() => { const k = SND.thongKe(); d.querySelector('#tk').textContent = 'ctx ' + k.ctx + ' · node ' + k.node + ' (max ' + k.nodeMax + ') · giọng ' + k.giong + ' (max ' + k.giongMax + ') · bỏ ' + k.bo +
      '\nnhạc: ' + (k.nhac ? ['menu', 'trận', 'trùm'][k.canh] : 'tắt') + ' · cường độ ' + k.I + ' · nốt nhạc đang sống ' + k.songNhac + ' (max ' + k.songNhacMax + ')'; }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dung); else dung();
})();
