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
