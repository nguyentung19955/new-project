// TURRET MERGE — phần GIAO DIỆN của ụng mới (skills3.js / skills4.js): hiển thị hỗ trợ khi chạm, ký hiệu buff, luật bộ bài §5.1
'use strict';

// ụ hỗ trợ mới: chạm = hiện vùng tác dụng (buff.js veHoTro dùng SKILLS[id].huong → Resonance Grid hiện 4 ô CHÉO)
SUP.luoicheo = { icon: 'sup_khuech', mau: '#45e0c8', link: 'sup_link', ke: true, chu: (T) => '+' + pct(Math.min(SKILLS.luoicheo.them(T), SKILLS.luoicheo.tranR(T))) + '% DAMAGE (DIAGONAL)' };
SUP_LOAI.luoicheo = 'dmg';
SUP_GIA.luoicheo = (T) => SKILLS.luoicheo.them(T);

// luật bộ bài: tối đa 1 Đỏ (có sẵn) · nhắc nếu < 2 ụ Tấn công (đã BỎ luật "tối đa 2 ụ thao túng sao" — người dùng không yêu cầu)
const _chonUGoc = UI.chonU;
UI.chonU = function (id) {
  const r = _chonUGoc.call(this, id);
  if (this.chon.length === 5 && this.chon.filter(x => SKILLS[x] && SKILLS[x].vai === 'tc').length < 2) this.nhac(TEXT.ui.need2Atk);
  return r;
};

// Focus Lens: loại buff mới "sát thương chí mạng" (sao 4 cánh trong vòng tròn)
BUFF.cdmg = { ten: 'Crit damage', mau: '#6fd0ff' };
BUFF_THU_TU.splice(BUFF_THU_TU.indexOf('crit') + 1, 0, 'cdmg');
// ký hiệu cdmg = icon ChatGPT assets/ic_cdmg.png (raw_p4_ui_1) — buff.js veKyHieu/kyHieu/kyHieuURL tự dùng ic_<k>
SUP.thaukinh = { icon: 'sup_chimang', mau: '#6fd0ff', link: 'sup_link', ke: true, chu: (T) => '+' + pct(HOTRO.hd(T, 'cdmg', SKILLS.thaukinh.k(T) * heSoHT(T))) + '% CRIT DMG · PIERCE' };
SUP_LOAI.thaukinh = 'cdmg';
SUP_GIA.thaukinh = (T) => SKILLS.thaukinh.k(T);
