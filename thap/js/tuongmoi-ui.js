// TURRET MERGE — phần GIAO DIỆN của ụng mới (skills3.js / skills4.js): hiển thị hỗ trợ khi chạm, ký hiệu buff, luật bộ bài §5.1
'use strict';

// ụ hỗ trợ mới: chạm = hiện vùng tác dụng (buff.js veHoTro dùng SKILLS[id].huong → Resonance Grid hiện 4 ô CHÉO)
SUP.luoicheo = { icon: 'sup_khuech', mau: '#45e0c8', link: 'sup_link', ke: true, chu: (T) => '+' + pct(SKILLS.luoicheo.them(T)) + '% DAMAGE (DIAGONAL)' };
SUP_LOAI.luoicheo = 'dmg';
SUP_GIA.luoicheo = (T) => SKILLS.luoicheo.them(T);

// luật bộ bài: tối đa 1 Đỏ (có sẵn) · tối đa 2 ụ "thao túng sao" · nhắc nếu < 2 ụ Tấn công
const _chonUGoc = UI.chonU;
UI.chonU = function (id) {
  if (SKILLS[id] && !this.chon.includes(id) && THAO_TUNG_SAO.has(id) && this.chon.filter(x => THAO_TUNG_SAO.has(x)).length >= 2) return this.nhac(TEXT.ui.max2Star);
  const r = _chonUGoc.call(this, id);
  if (this.chon.length === 5 && this.chon.filter(x => SKILLS[x] && SKILLS[x].vai === 'tc').length < 2) this.nhac(TEXT.ui.need2Atk);
  return r;
};

// Focus Lens: loại buff mới "sát thương chí mạng" (sao 4 cánh trong vòng tròn)
BUFF.cdmg = { ten: 'Crit damage', mau: '#6fd0ff' };
BUFF_THU_TU.splice(BUFF_THU_TU.indexOf('crit') + 1, 0, 'cdmg');
// ký hiệu cdmg = icon ChatGPT ic_crit (chưa có ảnh riêng ic_cdmg — HINH-VE-CODE-AUDIT.md Pass 4 — ui); không vẽ vòng bằng code
const _veKyHieuGoc = veKyHieu;
veKyHieu = function (x, k, r, mau) {
  if (k !== 'cdmg') return _veKyHieuGoc(x, k, r, mau);
  const ic = REN.img('ic_crit'); if (ic) x.drawImage(ic, -r, -r, r * 2, r * 2);
};
(() => {
  const kh = REN.kyHieu, khu = REN.kyHieuURL;
  REN.kyHieu = function (k, px, rong) { return kh.call(this, k === 'cdmg' ? 'crit' : k, px, rong); };
  REN.kyHieuURL = function (k) { return khu.call(this, k === 'cdmg' ? 'crit' : k); };
})();
SUP.thaukinh = { icon: 'sup_chimang', mau: '#6fd0ff', link: 'sup_link', ke: true, chu: (T) => '+' + pct(SKILLS.thaukinh.k(T) * heSoHT(T)) + '% CRIT DMG · PIERCE' };
SUP_LOAI.thaukinh = 'cdmg';
SUP_GIA.thaukinh = (T) => SKILLS.thaukinh.k(T);
