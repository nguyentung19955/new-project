'use strict';
/* ve-chieu-quai.js – vẽ chiêu quái DÙNG CHUNG cho phòng demo và Vùng 1 (luồng H).
   Phân biệt đạn bằng HÌNH + MÀU + QUỸ ĐẠO (không cyan – cyan chỉ cho nhân vật):
     Kèn Câm   (ve:'dan')        đạn TRÒN đồng/hổ phách, bay thẳng, vệt đuôi ngắn   → ken_tron.png
     Khuyết Cẩu (ve:'nang_luong') cầu năng lượng tím than/đỏ gạch TO, tụ năng lượng rõ → cau_tim.png
     Hồn Vải   (ve:'song')       vòng sóng âm nhạt dạng cung đồng tâm, xuyên tường, mờ dần → vai_nhat.png
     Vọng Tàn  (chan_dong)       báo trước: chuông rung + loé đỏ gạch, dải vạch nứt đỏ gạch đúng tầm sóng (tam), mờ→đậm
   Hình: art/hieu-ung/chieu-quai/<ten>.png – 6 ô 96×96, hướng TRÁI.
   Dùng: const VC = VeChieuQuai({ctx, E, anh:ten => Image|null, boQua:q => bool}); VC.ve(cam); VC.rung(q) → độ lệch x khi vẽ thân quái. */
const VeChieuQuai = function(o){
  const E = o.E, anh = o.anh, boQua = o.boQua || (() => false);
  const ctx = () => o.ctx();
  const FX_CUA = {dan:'ken_tron', nang_luong:'cau_tim', song:'vai_nhat', chan:'tan'};
  const DO_GACH = '#B84C43', DO_SANG = '#F08B73', DO_TOI = '#5E2420';
  function veFx(ten, k0, x, y, phai, k, a){
    const im = anh(ten); if (!im) return; const c = ctx();
    const S = 96, w = S * (k || 1); c.save(); c.globalAlpha = Math.max(0, Math.min(1, a ?? 1)); c.translate(Math.round(x), Math.round(y)); if (phai) c.scale(-1, 1);
    c.imageSmoothingEnabled = false; c.drawImage(im, k0 * S, 0, S, S, -w / 2, -w / 2, w, w); c.restore();
  }
  // dải 4 khung (art/hieu-ung/chieu-moi/<ten>.png, ChatGPT vẽ, nhìn NGANG): khung k, neo ĐÁY-GIỮA tại (x, y), hướng gốc = PHẢI
  function veDai(ten, k, x, y, trai, s, a){
    const im = anh(ten); if (!im) return false; const c = ctx(), cw = im.width / 4, ch = im.height, w = Math.round(cw * s), h = Math.round(ch * s);
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, a ?? 1)); c.imageSmoothingEnabled = false; c.translate(Math.round(x), Math.round(y)); if (trai) c.scale(-1, 1);
    c.drawImage(im, Math.max(0, Math.min(3, k | 0)) * cw, 0, cw, ch, -w / 2, -h, w, h); c.restore(); return true;
  }
  // dải nứt đất (ChatGPT) trải dọc mặt sàn 2 phía tới đúng tầm (tam), dừng ở mép vực
  function daiNut(cx, y, tam, k, a, cam){
    const im = anh('nut_dat'); if (!im) return false; const s = 2, w = im.width / 4 * s * 0.8;
    for (const sd of [-1, 1]) for (let d = w / 2; d <= tam; d += w){ const x = cx + sd * d; if (!coSan(x, y)) break; veDai('nut_dat', k, x - cam, y + 4, sd < 0, s, a); }
    return true;
  }
  function o4(x, y, mau, a, s){ const c = ctx(), st = s || 4; c.globalAlpha = a; c.fillStyle = mau; c.fillRect(Math.round(x / st) * st, Math.round(y / st) * st, st, st); }
  function nong(q){ const n = q.def.chieu.nong || [0, -40]; return [q.x + q.w / 2 + n[0] * E.TL * -q.face, q.y + q.h + n[1] * E.TL]; }
  // số khung (60 Hz) từ đầu đòn tới khung k – gồm cả phần giữ thêm của khung báo trước (bao_truoc_them_ms)
  function tTruoc(q, k){
    const d = q.def, C = d._clip && d._clip.danh; if (!C || !C.buoc) return 40;
    let t = C.buoc.slice(0, k).reduce((a, v) => a + v, 0);
    if ((d.khung_bao_truoc || 0) <= k) t += (d.bao_truoc_them_ms || 0) * 0.06;
    return Math.max(1, t);
  }
  const laChuong = q => q.def && q.def.chieu && q.def.chieu.chan_dong;
  function tienDoChuong(q){   // 0..1 trong lúc báo trước đập chuông, -1 nếu không
    if (q.dead || q.st !== 'danh' || !laChuong(q) || boQua(q)) return -1;
    const k = q.kDanh ?? 0; if (k >= q.def.chieu.chan_dong) return -1;
    return Math.min(1, q.t / tTruoc(q, q.def.chieu.chan_dong));
  }
  // thân quái lệch khi chuông rung (gọi trong veQuai / veQuaiNoi)
  function rung(q){
    const p = tienDoChuong(q); if (p < 0.3) return 0;
    return ((E.S.frame >> 1) & 1 ? 1 : -1) * (p > 0.7 ? 2 : 1) * E.TL;
  }
  // sàn dưới điểm x (mặt đất cùng tầng với quái)
  const coSan = (x, y) => E.solidPt(x, y + 6) && !E.solidPt(x, y - 6);
  function vachNut(cx, y, tam, a, nhay, cam){
    const c = ctx(), BUOC = 8;
    for (let s = -1; s <= 1; s += 2){
      let xa = cx;
      for (let d = 8; d <= tam; d += BUOC){
        const x = cx + s * d; if (!coSan(x, y)) break; xa = x;
        const h = (Math.floor(x / BUOC) * 7919) % 13, xm = x - cam;
        // nét nứt zigzag: mép tối + lõi đỏ gạch (loé sáng khi sắp đập), rẽ nhánh lên/xuống
        const lech = h % 3 === 0 ? -4 : h % 3 === 1 ? 0 : 4;
        o4(xm, y - 8 + lech, DO_TOI, a);
        o4(xm + 4, y - 8 + lech, DO_TOI, a);
        o4(xm, y - 4 + lech, nhay ? DO_SANG : DO_GACH, a);
        o4(xm + 4, y - 4 + (h % 2 ? lech : 0), nhay ? DO_SANG : DO_GACH, a);
        if (h % 4 === 0){ o4(xm + s * 4, y - 12 + lech, DO_GACH, a * 0.9); o4(xm + s * 8, y - 16 + lech, DO_GACH, a * 0.7); }
        if (h % 5 === 0) o4(xm, y + 4, DO_GACH, a * 0.8);
      }
      // dải hắt sáng đỏ gạch mờ ngay trên mặt đất, dọc phạm vi
      c.globalAlpha = 0.22 * a; c.fillStyle = DO_GACH;
      const x0 = Math.min(cx, xa) - cam, w = Math.abs(xa - cx); c.fillRect(Math.round(x0), Math.round(y - 20), Math.round(w), 16);
      // vạch mốc cuối tầm (đúng tam): cột vạch đứng
      const xe = cx + s * tam; if (coSan(xe, y)) for (let i = 0; i < 7; i++){ o4(xe - cam, y - 4 - i * 4, i >= 5 ? DO_SANG : DO_GACH, a); o4(xe - cam - s * 4, y - 4 - i * 4, DO_TOI, a * 0.8); }
    }
    c.globalAlpha = 1;
  }
  function veBaoChuong(q, cam){
    const p = tienDoChuong(q); if (p < 0) return;
    const ch = q.def.chieu, cx = q.x + q.w / 2, y = q.y + q.h, f = E.S.frame, nhay = p > 0.55 && (f >> 2) % 2 === 0;
    // 1) dải nứt đất đỏ gạch (ChatGPT vẽ, nhìn ngang, bốc lên từ mặt đất) dọc phạm vi sóng, lớn + đậm dần
    if (!daiNut(cx, y, ch.tam || 260, Math.min(3, Math.floor(p * 4)), Math.min(1, 0.35 + 0.8 * p) * (nhay ? 1 : 0.85), cam))
      vachNut(cx, y, ch.tam || 260, Math.min(1, 0.2 + 0.95 * p), nhay, cam);
    if (anh('nut_dat')){ ctx().globalAlpha = 1; return; }   // đã có hình ChatGPT: bỏ các vòng/chấm vẽ bằng code quanh quả chuông
    // 2) quầng loé đỏ gạch quanh quả chuông (sau lưng quái, cao ~55 điểm ảnh gốc)
    const bx = cx + 19 * E.TL * -q.face - cam + rung(q), by = y - 52 * E.TL, r = 30 + 8 * p + (nhay ? 6 : 0);
    for (let yy = -r; yy <= r; yy += 6) for (let xx = -r; xx <= r; xx += 6){ const d = Math.hypot(xx, yy * 1.2) / r; if (d < 1) o4(bx + xx, by + yy, DO_GACH, (1 - d) * (0.15 + 0.35 * p) * (nhay ? 1.5 : 1), 6); }
    for (let g = 0; g < 360; g += 12){ const t = g * Math.PI / 180; o4(bx + Math.cos(t) * r, by + Math.sin(t) * r * 0.85, nhay ? DO_SANG : DO_GACH, 0.35 + 0.6 * p); }
    if (p > 0.4) for (let i = 0; i < 8; i++){ const t = (i / 8) * Math.PI * 2 + f * 0.12; o4(bx + Math.cos(t) * (r + 10), by + Math.sin(t) * (r + 10) * 0.85, DO_SANG, 0.9 * p); }
    ctx().globalAlpha = 1;
  }
  // viền thân khi báo trước đập chuông: đỏ gạch, đậm dần, nhấp nháy sáng gần lúc đập
  function vien(q){
    const p = tienDoChuong(q); if (p < 0) return null;
    const nhay = p > 0.55 && (E.S.frame >> 2) % 2 === 0;
    return {mau:nhay ? DO_SANG : DO_GACH, a:0.5 + 0.5 * p};
  }
  function veTuNang(q, cam){   // giai đoạn tụ năng lượng trước khi bắn
    const ch = q.def.chieu, ten = FX_CUA[ch.ve] || 'ken_tron', f = E.S.frame;
    const [x0, y] = nong(q), x = x0 - cam, p = Math.min(1, q.t / tTruoc(q, ch.khung_ban));
    if (ten === 'cau_tim'){
      // hạt tím than / đỏ gạch hút về miệng + cầu xoáy lớn dần + vòng co lại
      for (let i = 0; i < 10; i++){ const t = i * 0.628 + f * 0.09, rr = 60 * (1 - ((f * 1.5 + i * 13) % 60) / 60) + 10;
        o4(x + Math.cos(t) * rr, y + Math.sin(t) * rr, i % 2 ? '#6E2C5C' : DO_GACH, 0.45 + 0.5 * p); }
      const rv = 52 - 34 * p; for (let g = 0; g < 360; g += 20){ const t = g * Math.PI / 180; o4(x + Math.cos(t) * rv, y + Math.sin(t) * rv, '#D9705C', 0.3 + 0.5 * p); }
      veFx('cau_tim', (f >> 3) & 1, x, y, q.face > 0, 0.6 + p * 0.9, 0.6 + p * 0.4);
    } else if (ten === 'vai_nhat') veFx('vai_nhat', 0, x, y, q.face > 0, 0.6 + p * 0.5, 0.4 + p * 0.5);
    else if (anh('ken_tu')) veFx('ken_tu', Math.min(4, Math.floor(p * 5)), x, y, q.face < 0, 0.75 + p * 0.35, 0.75 + p * 0.25);   // tụ lực (ChatGPT vẽ, hướng PHẢI, đủ khung không bị cắt)
    else veFx('ken_tron', (f >> 3) & 1, x, y, q.face > 0, 0.8 + p * 0.3, 0.6 + p * 0.4);
    ctx().globalAlpha = 1;
  }
  function veDan(b, cam){
    const ten = FX_CUA[b.ch.ve] || 'ken_tron', phai = b.vx > 0, f = E.S.frame, x = b.x - cam;
    if (ten === 'vai_nhat'){   // cung đồng tâm lớn dần, mờ dần theo tuổi; trong tường mờ hơn
      const con = Math.max(0, 1 - b.t / b.song), a = (0.35 + 0.6 * con) * (b.trongTuong ? 0.5 : 1);
      veFx('vai_nhat', 1 + Math.min(2, (b.t / 12) | 0), x, b.y + Math.sin(b.t * 0.2) * 3, phai, 1.1 + 0.4 * (1 - con), a);
    } else if (ten === 'cau_tim') veFx('cau_tim', 2 + ((f >> 2) & 1), x, b.y + Math.sin(b.t * 0.25) * 2, phai, 1.45);
    else veFx('ken_tron', 2 + ((f >> 2) & 1), x, b.y, phai, 1.25);
  }
  function ve(cam){
    cam = cam || 0;
    for (const q of E.QUAI){
      if (q.dead || boQua(q) || !q.def || !q.def.chieu || q.st !== 'danh') continue;
      const ch = q.def.chieu;
      if (ch.chan_dong) veBaoChuong(q, cam);
      else if (ch.khung_ban && (q.kDanh ?? 0) < ch.khung_ban) veTuNang(q, cam);
    }
    for (const b of E.DAN) veDan(b, cam);
    for (const n of E.NO){
      const ch = n.ch || {}, ten = FX_CUA[ch.ve] || 'ken_tron';
      if (n.dat && ch.toc_song){   // sóng chấn động chạy 2 phía mặt đất, tới đúng tam
        const song = n.song || 46, r = Math.min(ch.tam || 260, n.t * ch.toc_song), k0 = Math.min(5, (n.t / 8) | 0), a = Math.max(0, 1 - n.t / song);
        if (anh('song_dat')){   // sóng chấn động (ChatGPT vẽ): làn bụi đá + năng lượng đỏ gạch dựng cao, chạy 2 phía
          daiNut(n.x, n.y, ch.tam || 260, 3, 0.45 * a, cam);
          const kk = Math.min(3, (n.t / 6) | 0) % 4;
          if (r < (ch.tam || 260)){ veDai('song_dat', kk, n.x - r - cam, n.y + 4, true, 1.6, 0.5 + 0.5 * a); veDai('song_dat', kk, n.x + r - cam, n.y + 4, false, 1.6, 0.5 + 0.5 * a); }
        } else {
          vachNut(n.x, n.y, ch.tam || 260, 0.5 * a, false, cam);
          if (r < (ch.tam || 260)){ veFx('tan', k0, n.x - r - cam, n.y - 34, false, 1.4, 0.4 + 0.6 * a); veFx('tan', k0, n.x + r - cam, n.y - 34, true, 1.4, 0.4 + 0.6 * a); }
        }
      } else if (ten === 'vai_nhat') veFx('vai_nhat', 4 + Math.min(1, (n.t / 12) | 0), n.x - cam, n.y, false, 1.2, Math.max(0, 0.8 - n.t / 26));
      else veFx(ten, 4 + Math.min(1, (n.t / 12) | 0), n.x - cam, n.y, false, ten === 'cau_tim' ? 1.4 : 1.0, Math.max(0, 1 - n.t / 26));
    }
    ctx().globalAlpha = 1;
  }
  return {ve, rung, vien, veFx, veDai, tienDoChuong, FX_CUA};
};
window.VeChieuQuai = VeChieuQuai;
