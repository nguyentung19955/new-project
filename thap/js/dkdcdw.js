// TURRET MERGE — MÀN XÂY BỘ BÀI theo bố cục DCDW (người dùng gửi dcdw_man_deck.png: "trông màn chọn deck như này… làm như vậy theo phong cách hiện tại").
//  Trên → dưới: đầu màn · HÀNG BỘ MẪU số 1…N (chạm = nạp bộ mẫu) · BĂNG CHỈ HUY gọn (ô tối giản + tên + 1 dòng kỹ năng + nút CHANGE)
//  · đếm 3/5 + RANDOM · 5 ô bộ bài tối giản · HÀNG XẾP/LỌC (ô tìm + RARITY/FAMILY/NAME + nút lọc) · nhãn "TURRETS n/m" · lưới 5 cột · nút PLAY dính đáy.
//  Băng chỉ huy THAY ô chỉ huy thứ 6 (bo2hang) — người dùng chê hàng chỉ huy to + dải ụ nổi bật; băng gọn kiểu DCDW là cái họ muốn.
//  Không có băng quảng cáo/booster. Chữ = code; tấm/nút = PNG có sẵn (h2_tam_mong/h2_tam_xanh qua .hm-chip, p7_tam, o_vien_*) — QUY-TAC-HINH.md.
//  Không có cấp/thanh tiến độ thẻ (game chưa có cấp lưu theo ụ) → ô bộ bài không thêm LV/thanh giả.
'use strict';
const DKD = {
  el: (s) => document.querySelector(s),
  dung(a) { return UI.chon.length === 5 && a.deck.every(id => UI.chon.includes(id)) && UI.mv === a.mv; },
  // dựng khung 1 lần
  dung1() {
    const dk = this.el('#dk'); if (!dk || dk._dkd) return; dk._dkd = 1;
    document.documentElement.classList.add('co-dkd');
    const dau = dk.querySelector('.dk-dau'), cd = dk.querySelector('.chon-dau');
    const pre = document.createElement('div'); pre.className = 'dkd-pre'; pre.id = 'dkd-pre';
    dau.after(pre);
    const cmd = document.createElement('button'); cmd.className = 'dkd-cmd'; cmd.id = 'dkd-cmd'; cmd.dataset.act = 'hm-mv6'; cmd.dataset.slot = 'mv'; // hợp đồng kéo-thả (QUY-TAC-HINH 10): thả ụ lên đây = từ chối
    cd.prepend(cmd);
    // hàng xếp: chip trong .dk-tim, trước nút lọc
    const tim = dk.querySelector('.dk-tim'), loc = this.el('#dk-loc');
    const xep = document.createElement('div'); xep.className = 'dkd-xep'; xep.id = 'dkd-xep';
    tim.insertBefore(xep, loc);
    const nh = document.createElement('div'); nh.className = 'dkd-nhan'; nh.id = 'dkd-nhan';
    tim.after(nh);
  },
  ve() {
    this.dung1();
    if (typeof BOBAI === 'undefined' || typeof UI === 'undefined') return;
    // bộ mẫu số
    const ds = BOBAI.DS.filter(a => BOBAI.hopLe(a)).slice(0, 8);
    const pre = this.el('#dkd-pre');
    if (pre) pre.innerHTML = '<span class="dkd-pre-t">PRESET</span>' + ds.map((a, i) => '<button class="hm-chip dkd-so' + (this.dung(a) ? ' on' : '') + '" data-act="hm-pre-chon" data-bb="' + a.id + '" aria-label="Load preset ' + (i + 1) + ': ' + HM.esc(a.ten) + '">' + (i + 1) + '</button>').join('');
    // băng chỉ huy
    const d = MAVUONG[UI.mv] || MAVUONG.hero, c = this.el('#dkd-cmd');
    if (c && c.dataset.mv !== UI.mv) {
      c.dataset.mv = UI.mv; c.setAttribute('aria-label', 'Commander: ' + d.ten + ' (tap to change)');
      c.innerHTML = '<i class="ot-mini ot-mv dkd-cmd-po" data-mv="' + UI.mv + '"><img class="po" ' + (typeof srcTai === 'function' ? srcTai() : 'src') + '="' + (typeof anhUrl === 'function' ? anhUrl(d.anh) : 'assets/' + d.anh + '.png') + '" alt="" draggable="false"></i>' +
        '<span class="dkd-cmd-chu"><small>COMMANDER</small><b>' + HM.esc(d.ten) + '</b><em>' + HM.esc(d.mo || '') + '</em></span><span class="dkd-cmd-doi">CHANGE</span>';
    }
    // hàng xếp
    const ti = this.el('#dk-o input'); if (ti && ti.placeholder !== 'Search') ti.placeholder = 'Search'; // ô tìm co lại cạnh 3 chip xếp
    const x = this.el('#dkd-xep');
    if (x) x.innerHTML = [['bac', 'RARITY'], ['ho', 'FAMILY'], ['ten', 'NAME']].map(([k, t]) => '<button class="hm-chip dkd-x' + (UI.xep === k ? ' on' : '') + '" data-act="hm-loc-xep" data-k="' + k + '">' + t + '</button>').join('');
    this.dem();
    if (typeof OT !== 'undefined') OT.quet();
  },
  // nhãn "TURRETS n/m" (thấy được / chơi được)
  dem() {
    const l = this.el('#chon-luoi'), nh = this.el('#dkd-nhan'); if (!l || !nh) return;
    let tong = 0; for (const r of G.roster || []) if (SKILLS[r.id]) tong++;
    const n = [...l.querySelectorAll('.c[data-id]')].filter(c => !c.hidden && c.style.display !== 'none' && !c.classList.contains('khoa')).length;
    nh.innerHTML = '<b>TURRETS</b> <span>' + n + '/' + tong + '</span>';
  },
};
(() => {
  if (typeof HM === 'undefined') return;
  // ô chỉ huy thứ 6 → bỏ (băng chỉ huy thay)
  HM.veMV6 = function () { const o = document.querySelector('#chon-bo > .o-mv'); if (o) o.remove(); };
  const goc = HM.veDeck;
  HM.veDeck = function () { const r = goc.apply(this, arguments); try { DKD.ve(); } catch (e) { console.error(e); } return r; };
  const vc = UI.veChon;
  UI.veChon = function () { const r = vc.apply(this, arguments); try { DKD.ve(); } catch (e) { } return r; };
  const vb = UI.veBoChon;
  UI.veBoChon = function () { const r = vb.apply(this, arguments); try { DKD.ve(); } catch (e) { } return r; };
  // lọc/tìm đổi lưới → đếm lại
  const lam = () => { try { DKD.ve(); HM.veMV6(); } catch (e) { } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lam); else lam();
  document.addEventListener('input', (e) => { if (e.target.closest && e.target.closest('#dk-o')) requestAnimationFrame(() => DKD.dem()); });
})();
