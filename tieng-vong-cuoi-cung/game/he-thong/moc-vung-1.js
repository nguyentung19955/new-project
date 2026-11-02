'use strict';
/* moc-vung-1.js – móc nối nhỏ Hệ thống đồ/điểm/mở khoá vào Vùng 1 (phiên "do").
   MẶC ĐỊNH TẮT: chỉ bật khi du-lieu.json có "bat_mac_dinh": true hoặc mở trang với ?hethong=1 (chơi thử).
   Tắt → không làm gì cả, Vùng 1 y hệt cũ. Không sửa bản lưu Vùng 1 (lưu riêng khoá 'tvcc-he-thong').
   Thứ cần hình (Âm Phù rơi ra, nhát thứ 5, dáng đứng mới, vệt kiếm mới) chỉ hoạt động khi ảnh ChatGPT/PixelLab đã có. */
(function(){
  const V1 = window.V1, E = typeof DongCoMN !== 'undefined' ? DongCoMN : null;
  if (!V1 || !E || !window.HeThong) return;
  const Q = new URLSearchParams(location.search);
  const GOC = '../../';                 // gốc thư mục tieng-vong-cuoi-cung tính từ game/vung-1/
  const M = window.MocHeThong = {bat:false, ht:null, anh:{}, loi:[]};

  function docLuu(){ try { const s = localStorage.getItem(HeThong.KHOA_LUU); return s ? JSON.parse(s) : null; } catch (e){ return null; } }
  function ghi(){ try { localStorage.setItem(HeThong.KHOA_LUU, JSON.stringify(M.ht.luu())); } catch (e){} }
  const thuAnh = p => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = GOC + p; });

  async function khoiDong(){
    let D;
    try { const r = await fetch('../he-thong/du-lieu.json', {cache:'no-store'}); D = await r.json(); } catch (e){ M.loi.push('du-lieu.json: ' + e); return; }
    if (!(D.bat_mac_dinh || Q.get('hethong') === '1')) return;
    if (Q.get('hethong_moi') === '1'){ try { localStorage.removeItem(HeThong.KHOA_LUU); } catch (e){} }
    // dò ảnh cần cho từng tính năng – thiếu ảnh thì tính năng đó tự tắt
    const ds = new Set();
    for (const n of D.cay) for (const p of (n.can_anh || [])) ds.add(p);
    for (const m of D.am_phu) ds.add(m.anh);
    for (const h of D.do_hiem) ds.add(h.khung);
    await Promise.all([...ds].map(async p => { const i = await thuAnh(p); if (i) M.anh[p] = i; }));
    M.coDo = D.am_phu.every(m => M.anh[m.anh]) && D.do_hiem.every(h => M.anh[h.khung]);   // đủ biểu tượng + khung mới cho rơi đồ
    M.ht = HeThong.tao(D, docLuu(), {coAnh:p => !!M.anh[p]});
    for (let i = 0; i < 600 && !(window.TV && TV.xong); i++) await new Promise(ok => setTimeout(ok, 50));   // chờ Vùng 1 nạp xong nhân vật
    M.bat = true;
    await apDung();
    moc();
    taoGiaoDien();
  }

  /* ---- áp chỉ số vào nhân vật (chỉ đổi DỮ LIỆU, không sửa engine) ---- */
  const CLIP_GOC = {};
  async function apDung(){
    const c = M.ht.chiSo(), base = V1.CAP[Math.min(c.cap_kiem, V1.CAP.length - 1)] || V1.CAP[0];
    if (base){
      const cap = Object.assign({}, base, {sat_thuong:Math.round(base.sat_thuong * (1 + c.sat_thuong / 100))});
      E.NV.cap = cap; E.NV.capClip = cap.clip;
      E.NV.chuoi = (cap.chuoi || V1.NVJ.chuoi || ['don1', 'don2', 'don3']).slice();
    }
    // nhát combo thêm (vd don5) – nút trong cây có "clip" + ảnh đã có
    for (const ten of c.them_nhat){
      const n = M.ht.D.cay.find(n => n.hieu_ung && n.hieu_ung.them_nhat === ten);
      if (!n || !n.clip) continue;
      if (!E.NV.capClip[ten]) E.NV.capClip[ten] = await SpriteMN.napClip(V1.NVJ.goc, n.clip, ten);
      if (E.NV.capClip[ten].ok && !E.NV.chuoi.includes(ten)) E.NV.chuoi.push(ten);
    }
    // dáng đứng mới
    if (c.clip_dung){
      const n = M.ht.D.cay.find(n => n.hieu_ung && n.hieu_ung.clip_dung === c.clip_dung);
      if (n && n.clip){
        if (!CLIP_GOC.dung) CLIP_GOC.dung = E.NV.clip.dung;
        const cl = await SpriteMN.napClip(V1.NVJ.goc, n.clip, 'dung');
        if (cl.ok) E.NV.clip.dung = cl;
      }
    }
    M.chiSo = c;
  }

  /* ---- móc sự kiện: điểm khi hạ quái, Mảnh Âm thêm, bất tử thêm, rơi đồ ---- */
  function moc(){
    const goc = V1.suKienTheGioi;
    V1.suKienTheGioi = function(){
      const giet = [];
      for (const e of E.SUKIEN){
        if (e.k === 'quai-chet' && e.q) giet.push(e.q);
        if (e.k === 'bi-danh' && !e.chet && M.chiSo.khang > 0) E.pl.iframes += M.chiSo.khang;
      }
      goc.apply(this, arguments);
      for (const q of giet){
        const loai = (q === V1.G.trum || (q.def && q.def.ai)) ? 'trum' : q.laTinhAnh ? 'tinh_anh' : 'quai_thuong';
        const r = M.ht.congDiem(loai);
        if (r.lenCap > 0) V1.thongBao('Level ' + M.ht.cap() + ' · +' + r.lenCap + ' ' + M.ht.D.diem.ten_not + ' (spend at a Rest Bell)');
        if (M.chiSo.manh_am > 0){
          const so = q.laTinhAnh ? 60 : Math.round(((q.def && q.def.mau) || 30) / 6) + 3, them = Math.round(so * M.chiSo.manh_am / 100);
          if (them > 0) V1.roiManh(q.x + q.w / 2, q.y + q.h / 2, them);
        }
        if (M.coDo){
          const mon = M.ht.roiDo(loai, {sauTrum:!!V1.G.luu.trumHa});
          if (mon) V1.thongBao('Sigil found: ' + (M.ht.D.do_hiem.find(h => h.id === mon.hiem) || {}).ten + ': ' + (M.ht.D.am_phu.find(m => m.id === mon.mau) || {}).ten);
        }
        ghi();
      }
    };
    const moChuong = V1.moChuong;
    V1.moChuong = function(){ moChuong.apply(this, arguments); capNhatNut(); };
  }

  /* ---- giao diện: nút "Dây Ngân" trong bảng Chuông Lưu + bảng cây kỹ năng (to, dễ bấm trên iPhone ngang) ---- */
  const $ = id => document.getElementById(id);
  function taoGiaoDien(){
    const st = document.createElement('style');
    st.textContent = '#l-hethong .hop{max-width:min(860px,96vw);max-height:92vh;overflow:auto;-webkit-overflow-scrolling:touch}' +
      '#ht-cay{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;text-align:left}' +
      '#ht-cay h3{margin:0 0 6px;font-size:15px;color:var(--bell)}' +
      '#ht-cay button{display:block;width:100%;height:auto;min-height:58px;margin:0 0 8px;padding:6px 10px;text-align:left;font-size:14px;line-height:1.25}' +
      '#ht-cay button small{display:block;margin:2px 0 0;font-size:12px;color:#a9b3bf;font-weight:600}' +
      '#ht-cay button.da{border-color:#9be7a0;color:#9be7a0}#ht-cay button.duoc{border-color:var(--bell);color:#ffe08a}' +
      '@media (max-width:640px){#ht-cay{grid-template-columns:1fr}}';
    document.head.appendChild(st);
    const b = document.createElement('button'); b.id = 'b-hethong'; b.type = 'button'; b.onclick = moBang;
    const hang = $('b-mua') && $('b-mua').parentNode; if (hang) hang.insertBefore(b, $('b-di'));
    const lop = document.createElement('div'); lop.id = 'l-hethong'; lop.className = 'lop ui';
    lop.innerHTML = '<div class="hop"><h1>Silver Strings</h1><p id="ht-tt"></p><div id="ht-cay"></div>' +
      '<div class="hang"><button id="b-ht-dong" class="chinh" type="button">Back to Rest Bell</button></div>' +
      '<small>Defeat enemies for Tone Points → level up for Silver Notes → unlock nodes. Nodes marked "Art pending" unlock once their new art is done.</small></div>';
    $('game').appendChild(lop);
    $('b-ht-dong').onclick = () => { lop.classList.remove('mo'); capNhatNut(); };
    capNhatNut();
  }
  function capNhatNut(){ const b = $('b-hethong'); if (b && M.ht) b.textContent = 'Silver Strings · ' + M.ht.notCon() + ' Notes'; }
  const CHU = {da_mo:'Unlocked', mo_duoc:'Available', thieu_not:'Need Notes', thieu_nut_truoc:'Unlock previous first', cho_anh:'Art pending'};
  function moBang(){
    const ht = M.ht, sau = ht.diemCapSau();
    $('ht-tt').innerHTML = 'Level <b style="color:#78e6e6">' + ht.cap() + '</b> · Tone Points ' + ht.S.diem + (sau ? ' / ' + sau : ' (max)') +
      ' · Silver Notes left: <b style="color:#ffe08a">' + ht.notCon() + '</b>';
    const nhanh = {}; for (const n of ht.D.cay) (nhanh[n.nhanh] || (nhanh[n.nhanh] = [])).push(n);
    const cay = $('ht-cay'); cay.innerHTML = '';
    for (const [ten, ds] of Object.entries(nhanh)){
      const cot = document.createElement('div'); cot.innerHTML = '<h3>' + ten + '</h3>';
      for (const n of ds){
        const t = ht.trangThaiNut(n.id), b = document.createElement('button'); b.type = 'button';
        b.className = t === 'da_mo' ? 'da' : t === 'mo_duoc' ? 'duoc' : '';
        b.disabled = t !== 'mo_duoc';
        b.innerHTML = n.ten + ' · ' + n.gia + ' Notes<small>' + n.mo_ta + ' – ' + CHU[t] + '</small>';
        b.onclick = async () => { const r = ht.moNut(n.id); if (r.ok){ ghi(); await apDung(); V1.thongBao('Unlocked: ' + n.ten); } moBang(); };
        cot.appendChild(b);
      }
      cay.appendChild(cot);
    }
    $('l-hethong').classList.add('mo');
  }
  M.moBang = moBang; M.apDung = apDung; M.ghi = ghi;
  M.san = khoiDong();
})();
