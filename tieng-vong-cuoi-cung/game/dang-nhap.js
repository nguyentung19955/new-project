'use strict';
/* dang-nhap.js – Ô TÀI KHOẢN dùng chung cho mọi trang có luu-may.js (phiên "dangnhap", docs/dang-nhap/BAO-CAO.md).
   Hiện ai đang đăng nhập + nút "Sign in with Google" / "Sign out"; thông báo ngắn khi phiên Google hết hạn sau 7 ngày.
   Dùng: <script src="../firebase/cau-hinh.js"></script><script src="../luu-may.js"></script><script src="../dang-nhap.js"></script>
         DangNhap.gan(phanTuCha, {xungDot:true|false, khung:true|false, sauDangNhap:fn})
   LUẬT HÌNH: không vẽ viền/khung bằng CSS. Nút + khung là ẢNH:
     - có ảnh ChatGPT (docs/yeu-cau-anh/dangnhap/001) ở art/giao-dien/dang-nhap/ → dùng ảnh đó;
     - chưa có → tạm dùng khung_bang.png (art/giao-dien/khung, ChatGPT vẽ) co giãn 9 mảnh. Chữ do game viết. */
(function(W){
  const LM = () => W.LuuMay;
  const goc = (() => { try { return new URL('../', document.currentScript.src).href; } catch (e){ return '../'; } })();   // .../tieng-vong-cuoi-cung/
  const KHUNG = goc + 'art/giao-dien/khung/khung_bang.png';
  // ảnh nút riêng (chờ phiên chính vẽ): tấm đồng/gỗ 9 mảnh, lề góc CAT px (đo lại khi cắt ảnh)
  const ANH = {vao:goc + 'art/giao-dien/dang-nhap/nut_dang_nhap.png', ra:goc + 'art/giao-dien/dang-nhap/nut_dang_xuat.png', CAT:'22 46 22 46'};
  const CSS = `
.dn{margin:6px auto 0;max-width:100%}
.dn [hidden]{display:none!important}
.dn.khung{display:inline-block;border:solid transparent;border-width:24px 30px 22px 31px;padding:0 4px;
  border-image:url(${KHUNG}) 96 118 88 123 fill / 24px 30px 22px 31px stretch}
.dn-dong{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.dn-ai{margin:0;font-size:13px;color:#c9d0d8;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dn-loi{margin:2px 0 0;font-size:12px;color:#ffbe50}
.dn button.dn-nut{box-sizing:border-box;height:44px;min-height:44px;min-width:120px;padding:0 8px;margin:0;border-radius:0;
  border:solid transparent;border-width:9px 12px 8px 12px;border-image:url(${KHUNG}) 96 118 88 123 fill / 9px 12px 8px 12px stretch;background:none;
  color:#ffe08a;font:800 14px "Alegreya Sans",system-ui,-apple-system,sans-serif;line-height:1;text-shadow:0 1px 2px #000;cursor:pointer;touch-action:manipulation}
.dn button.dn-nut.phu{color:#F3E6C8}
.dn button.dn-nut:active{transform:scale(.95)}
.dn button.dn-nut:disabled{opacity:.5}
#dn-bao{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);z-index:60;box-sizing:border-box;
  width:max-content;max-width:min(560px,calc(100vw - 32px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)));
  border:solid transparent;border-width:24px 30px 22px 31px;border-image:url(${KHUNG}) 96 118 88 123 fill / 24px 30px 22px 31px stretch;
  color:#F3E6C8;font:600 14px/1.35 "Alegreya Sans",system-ui,sans-serif;text-align:center;text-shadow:0 1px 2px #000;cursor:pointer;display:none}
#dn-bao.mo{display:block}
#dn-bao small{display:block;opacity:.6;font-size:11px}`;
  let daCss = false;
  function themCss(){
    if (daCss) return; daCss = true;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    // ảnh nút ChatGPT có rồi thì dùng (không có thì giữ khung_bang tạm)
    for (const [k, lop] of [['vao', 'vao'], ['ra', 'ra']]){
      const i = new Image();
      i.onload = () => { const s2 = document.createElement('style');
        s2.textContent = `.dn button.dn-nut.${lop}{border-image:url(${ANH[k]}) ${ANH.CAT} fill / 12px 25px 12px 25px stretch}`; document.head.appendChild(s2); };
      i.src = ANH[k];
    }
  }
  const tao = (tag, thuoc, chu) => { const e = document.createElement(tag); Object.assign(e, thuoc || {}); if (chu) e.textContent = chu; return e; };

  /* Thông báo nổi (vd hết phiên 7 ngày) – hiện cả khi đang chơi, chạm để đóng, tự ẩn sau 10 giây. */
  let bao = null, henAn = null;
  function hienThongBao(m){
    if (!bao){ bao = tao('div', {id:'dn-bao'}); bao.setAttribute('role', 'status'); bao.onclick = () => { bao.classList.remove('mo'); if (LM()) LM().boThongBao(); }; document.body.appendChild(bao); }
    if (!m.thongBao){ bao.classList.remove('mo'); return; }
    if (bao.dataset.chu === m.thongBao && bao.classList.contains('mo')) return;
    bao.dataset.chu = m.thongBao; bao.textContent = m.thongBao; bao.appendChild(tao('small', {}, 'Tap to close'));
    bao.classList.add('mo');
    clearTimeout(henAn); henAn = setTimeout(() => { bao.classList.remove('mo'); }, 10000);
  }

  function gan(cha, o){
    o = o || {};
    const L = LM();
    if (!L || !cha) return null;
    themCss();
    if (!L.coMay()){ return null; }   // chưa cấu hình / chặn mạng: chỉ lưu máy, không có tài khoản
    const hop = tao('div', {className:'dn' + (o.khung ? ' khung' : '')});
    const dong = tao('div', {className:'dn-dong'});
    const ai = tao('p', {className:'dn-ai', id:'dn-ai'});
    const vao = tao('button', {type:'button', className:'dn-nut vao', id:'b-dn-vao'}, 'Sign in with Google');
    const ra = tao('button', {type:'button', className:'dn-nut phu ra', id:'b-dn-ra'}, 'Sign out');
    const loi = tao('p', {className:'dn-loi', id:'dn-loi', hidden:true});
    dong.append(ai, vao, ra); hop.append(dong, loi);
    let xd = null;
    if (o.xungDot){
      xd = tao('div', {className:'dn-dong', id:'dn-xd', hidden:true});
      const a = tao('button', {type:'button', className:'dn-nut', id:'b-dn-xd-may'}, 'Use cloud save');
      const b = tao('button', {type:'button', className:'dn-nut phu', id:'b-dn-xd-tb'}, "Keep this device's save");
      a.onclick = () => L.chonTatCa('may-chu').then(() => o.sauChon && o.sauChon());
      b.onclick = () => { if (confirm("Replace the cloud save with this device's save? (The cloud copy is kept as a backup.)")) L.chonTatCa('thiet-bi').then(() => o.sauChon && o.sauChon()); };
      xd.append(a, b); hop.appendChild(xd);
    }
    cha.appendChild(hop);
    let ban = false;
    function ve(m){
      const gg = m.trangThai === 'google';
      ai.textContent = gg ? 'Signed in: ' + m.tenNgan() : 'Playing as guest';
      vao.hidden = gg; ra.hidden = !gg;
      vao.disabled = ban || m.trangThai === 'dang-ket-noi'; ra.disabled = ban;
      if (!ban) vao.textContent = 'Sign in with Google';
      if (xd) xd.hidden = m.dongBo !== 'xung-dot';
      hienThongBao(m);
    }
    // gọi đăng nhập NGAY trong sự kiện chạm (popup trên iPhone Safari cần vậy)
    vao.onclick = () => {
      loi.hidden = true;
      const p = L.dangNhapGoogle();
      ban = true; vao.textContent = 'Signing in…'; ve(L);
      p.then(ok => {
        ban = false; ve(L);
        if (!ok && L.loi){ loi.textContent = L.loi === 'offline' ? 'No internet · Sign in later. Your game still saves on this device.' : (/^This Google account/.test(L.loi) ? L.loi : 'Sign-in did not finish. Please try again.'); loi.hidden = false; }
        if (ok && o.sauDangNhap) o.sauDangNhap();
      });
    };
    ra.onclick = () => {
      ban = true; ve(L); loi.hidden = true;
      L.dangXuat().then(() => { ban = false; ve(L); if (o.sauDangXuat) o.sauDangXuat(); });
    };
    L.nghe(ve);
    return hop;
  }
  // trang không có ô tài khoản vẫn hiện thông báo hết phiên
  function chiThongBao(){ const L = LM(); if (!L) return; themCss(); L.nghe(hienThongBao); }
  W.DangNhap = {gan, chiThongBao};
})(window);
