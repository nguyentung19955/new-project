/* ======================= HUD + NÚT CẢM ỨNG HƯỚNG MỚI (28/10/2026) – module GDHM =======================
   Tư vấn 3, mục 5: sửa NGAY bằng code, không gen. Chỉ đổi HÌNH, KHÔNG đổi vùng chạm:
   - các phần tử #dpad, .ab giữ nguyên vị trí / cỡ CSS (= vùng chạm); hình nút vẽ bằng ::before nhỏ hơn vùng chạm (lõm 16–18 %).
   - nút: nền than trong, viền đồng mảnh, ký hiệu màu ngà (SVG nội tuyến). Teal CHỈ ở nút Vọng và trạng thái Vọng; không phát sáng
     liên tục mạnh (bỏ nhấp nháy viền teal toàn màn khi ghi, bỏ quầng teal quanh nút Vọng).
   - HUD vẽ canvas: chuông đơn giản (hình code, không texture), thanh Vọng đọc được bằng màu + độ dài, Cộng hưởng ×n.
   - nút "Nói chuyện" gọn, không nhấp nháy; game ẩn khi rời vùng NPC (móc ở trang).
   API: GDHM.ap()  ·  GDHM.veHUD(ctx, s)  s = {hp, maxHp, vong:'san'|'ghi'|'phat'|'giu', day (0..1), ch (số Cộng hưởng), chPulse (0..1), frame} */
const GDHM = (() => {
  const MAU = {than: 'rgba(16,20,22,', dong: '#A78046', dongSang: '#D6B27A', nga: '#F3E6C8', teal: '#648D88', tealSang: '#9CC8C0'};
  const svg = (d, mau, w) => 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + mau +
    '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>') + '")';
  const KY = {
    'b-j': svg('<path d="M5 15l7-7 7 7"/><path d="M8 19.5l4-4 4 4" opacity=".6"/>', MAU.nga),
    'b-a': svg('<path d="M5 19C11 17 16 12 19 5"/><path d="M6.5 14.5l3 3" stroke-width="1.8"/>', MAU.nga),
    'b-s': svg('<path d="M5 7l5 5-5 5"/><path d="M12 7l5 5-5 5"/>', MAU.nga),
    'b-v': svg('<circle cx="12" cy="12" r="2" fill="' + MAU.tealSang + '" stroke="none"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6"/><path d="M5.4 5.4a9.3 9.3 0 0 0 0 13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2" opacity=".55"/>', MAU.tealSang, 1.9)
  };
  const CSS = `
body.gd-hm .ab,body.gd-hm.lht-nut .ab{background:transparent!important;border:0!important;color:transparent!important;font-size:0!important;opacity:1!important;box-shadow:none!important;animation:none!important}
body.gd-hm .ab::before{content:'';position:absolute;inset:17%;border-radius:50%;box-sizing:border-box;background:${MAU.than}.44);border:1.5px solid rgba(167,128,70,.72);transition:background .08s,border-color .08s}
body.gd-hm .ab::after{content:'';position:absolute;inset:33%;background:var(--ky) center/contain no-repeat;opacity:.82}
body.gd-hm #b-j::before{inset:18%}
body.gd-hm .ab.on::before{background:rgba(167,128,70,.42);border-color:${MAU.dongSang}}
body.gd-hm .ab.on::after{opacity:1}
body.gd-hm .ab.pulse::before{border-color:${MAU.dongSang};border-width:2px}
body.gd-hm #b-v::before{border-color:rgba(100,141,136,.85)}
body.gd-hm #b-v.on::before{background:rgba(100,141,136,.45);border-color:${MAU.tealSang}}
body.gd-hm #b-v.rec::before{background:rgba(100,141,136,.55);border-color:${MAU.tealSang}}
body.gd-hm #dpad,body.gd-hm.lht-nut #dpad{background:transparent!important;border:0!important;opacity:1!important;animation:none!important;box-shadow:none!important}
body.gd-hm #dpad::before{content:'';position:absolute;inset:13%;border-radius:50%;box-sizing:border-box;background:${MAU.than}.26);border:1.5px solid rgba(167,128,70,.55)}
body.gd-hm #dpad.act::before{background:${MAU.than}.4);border-color:rgba(214,178,122,.8)}
body.gd-hm #knob,body.gd-hm.lht-nut #knob{background:${MAU.than}.62)!important;border:1.5px solid rgba(214,178,122,.85)!important;width:calc(36px*var(--k))!important;height:calc(36px*var(--k))!important;
  left:calc(48px*var(--k))!important;top:calc(48px*var(--k))!important;box-sizing:border-box}
body.gd-hm #dpad i{border-width:6px;opacity:.45}
body.gd-hm #dpad i.on{opacity:.95}
body.gd-hm #dpad .u{border-bottom:8px solid ${MAU.nga};left:calc(66px*var(--k) - 6px);top:calc(20px*var(--k))}
body.gd-hm #dpad .d{border-top:8px solid ${MAU.nga};left:calc(66px*var(--k) - 6px);bottom:calc(20px*var(--k))}
body.gd-hm #dpad .l{border-right:8px solid ${MAU.nga};top:calc(66px*var(--k) - 6px);left:calc(20px*var(--k))}
body.gd-hm #dpad .r{border-left:8px solid ${MAU.nga};top:calc(66px*var(--k) - 6px);right:calc(20px*var(--k))}
body.gd-hm #hint{max-width:min(50vw,500px);font-size:14px;line-height:24px;background:rgba(16,20,22,.7)}   /* chừa chỗ HUD góc trái */
body.gd-hm #recfx{border:2px solid rgba(100,141,136,.45);box-shadow:none;animation:none}
body.gd-hm #recbar{border-color:rgba(100,141,136,.7);color:${MAU.tealSang};background:${MAU.than}.8)}
body.gd-hm #recfill{background:${MAU.tealSang}}
body.gd-hm #btn-noi{height:34px;padding:0 14px;border-radius:17px;border:1.5px solid rgba(167,128,70,.8);background:${MAU.than}.8);color:${MAU.nga};font-size:14px;animation:none;
  bottom:calc(env(safe-area-inset-bottom,0px) + 62px)}
`;
  function ap() {
    if (document.getElementById('gd-hm-css')) return;
    const st = document.createElement('style'); st.id = 'gd-hm-css'; st.textContent = CSS; document.head.appendChild(st);
    for (const [id, u] of Object.entries(KY)) { const el = document.getElementById(id); if (el) el.style.setProperty('--ky', u); }
    document.body.classList.add('gd-hm');
  }

  /* chuông HUD: (x, y) = giữa đỉnh; cao ≈ 17 logic */
  function chuong(ctx, x, y, day) {
    ctx.beginPath();
    ctx.moveTo(x - 2.2, y + 2.5); ctx.quadraticCurveTo(x - 7, y + 3.2, x - 7.2, y + 9.5); ctx.lineTo(x - 8.8, y + 13.6);
    ctx.quadraticCurveTo(x, y + 15.2, x + 8.8, y + 13.6); ctx.lineTo(x + 7.2, y + 9.5); ctx.quadraticCurveTo(x + 7, y + 3.2, x + 2.2, y + 2.5); ctx.closePath();
    if (day) { ctx.fillStyle = MAU.dong; ctx.fill(); ctx.strokeStyle = '#2b2119'; ctx.lineWidth = 1; ctx.stroke();
      ctx.strokeStyle = 'rgba(243,230,200,.75)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x - 4.3, y + 10); ctx.quadraticCurveTo(x - 4.4, y + 5.4, x - 1.6, y + 4.6); ctx.stroke();
      ctx.fillStyle = '#2b2119'; ctx.beginPath(); ctx.arc(x, y + 15.6, 1.8, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(12,15,17,.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(167,128,70,.75)'; ctx.lineWidth = 1.2; ctx.stroke(); }
    ctx.strokeStyle = day ? MAU.dong : 'rgba(167,128,70,.75)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y + 1.3, 1.6, Math.PI, 0); ctx.stroke();
  }
  function hop(ctx, x, y, w, h, r) {
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    ctx.fillStyle = MAU.than + '.58)'; ctx.fill(); ctx.strokeStyle = 'rgba(167,128,70,.45)'; ctx.lineWidth = 1; ctx.stroke();
  }
  function veHUD(ctx, s) {
    ctx.save(); ctx.globalAlpha = 1; ctx.setLineDash([]);
    const w = s.maxHp * 22 + 18; hop(ctx, 8.5, 8.5, w, 44, 8);
    for (let i = 0; i < s.maxHp; i++) chuong(ctx, 26 + i * 22, 13, i < s.hp);
    // thanh Vọng: ký hiệu sóng nhỏ + thanh 5 px. Sẵn sàng = teal đầy; đang ghi = ngà, ngắn dần; bóng đang lặp = teal chạy; bóng giữ = teal mờ + chấm
    const bx = 32, by = 38, bw = w - 30;
    const mau = s.vong === 'ghi' ? MAU.nga : s.vong === 'giu' ? 'rgba(156,200,192,.55)' : s.vong === 'phat' ? MAU.tealSang : MAU.teal;
    ctx.strokeStyle = s.vong === 'san' ? MAU.teal : MAU.tealSang; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(19, by + 2.5, 2.6, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke(); ctx.beginPath(); ctx.arc(19, by + 2.5, 2.6, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();
    ctx.fillStyle = s.vong === 'san' ? MAU.teal : MAU.tealSang; ctx.beginPath(); ctx.arc(19, by + 2.5, 1, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(8,10,11,.85)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 7);
    ctx.fillStyle = mau; ctx.fillRect(bx, by, Math.max(0, Math.round(bw * Math.max(0, Math.min(1, s.day)))), 5);
    if (s.vong === 'giu') { ctx.fillStyle = MAU.tealSang; ctx.fillRect(bx + bw - 3, by, 3, 5); }
    if (s.ch > 0) {   // Cộng hưởng ×n: vòng ngà nhỏ + số
      const x = 8.5 + w + 8; hop(ctx, x, 8.5, 54, 26, 8);
      ctx.strokeStyle = MAU.tealSang; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 14, 21.5, 5 + 2 * (s.chPulse || 0), 0, 7); ctx.stroke();
      ctx.font = '700 14px "Be Vietnam Pro", system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = MAU.nga; ctx.fillText('×' + s.ch, x + 24, 22);
      ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();
  }
  return {ap, veHUD, MAU};
})();
