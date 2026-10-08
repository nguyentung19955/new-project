#!/usr/bin/env node
'use strict';
// Sinh tools/pixel/spec/ky-nang.json — bảng thiết kế icon kỹ năng: MỖI chiêu một hình riêng (claude/icon-ky-nang-rieng).
//   node tools/build-ky-nang-spec.js            → ghi spec (tên chiêu lấy từ js/data.js)
// Rồi: node tools/kiem-ky-nang.js (so trùng + ảnh tổng theo tướng) → node tools/ve-pixel.js --spec … --nap --ghi-de
//
// Cú pháp mỗi ô (tách bằng dấu cách):
//   <vat>[:<mauVat>]   hình chính (thư viện tools/ve-pixel-ky-nang.js HINH; "-" = không có)
//   +<hieu>[:<mau>]    hiệu ứng (tối đa 2; màu của hiệu ứng đầu có màu)
//   @<vat2>/<vi2>[:<mau>]  hình phụ nhỏ + chỗ rải (giua tren trenphai trentrai duoiphai duoitrai mua mua2 nhieu quanh ba doi)
//   ^<vi>  dời hình chính (tren duoi trai phai…) · ~ lật ngang · %<mauPhuVat> · #<mauNen> (mặc định theo hành)
// 10 tướng có bản vẽ tay (claude/pixel-ky-nang-2) giữ nguyên hình, chỉ tô lại khung theo phím W / E / R (ve_tay).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');

// hành → màu nền (kim sat · moc la · thuy cham · hoa son · tho dat)
const BANG = {
  lactuong: ['kim', 'riu +no', 'loc @riu_nho/giua', 'nam_dam +sang:lua', 'set_nui +mua'],
  lucsi: ['tho', 'da_tang +toc', 'nui ^duoi +len', 'khoi @soi_nho/nhieu', 'dong_da +dat'],
  xathu: ['kim', 'muiten @khien_nho/giua +toc', 'muiten3', 'dau_ten +doc', 'muiten_mua'],
  thosan: ['moc', 'dau_chan:lama +toc +la', 'cung +la', 'bia +no', 'dao_san +muctieu'],
  thaymo: ['hoa', 'cot_lua', 'duoc:troi +vong', 'lua +dat', 'nui_lua @da_lua/mua'],
  thansuong: ['thuy', 'tuyet +vong', 'mui_bang +toc', 'nui_tuyet +gio', 'suong +tuyet'],
  kimquy: ['kim', 'mai_rua', 'mong +chem', 'dat_nut:vang +am', 'thanh +khien:vang'],
  thachsanh: ['moc', 'riu_go', 'cung:vang +sang', 'dan +nhac', 'sung +chem'],
  caolo: ['kim', 'ten_no3 +toc', 'lay +lap', 'dau_mong:dong +toc', 'no +vong'],
  antiem: ['moc', 'dua_hau +toc', 'hat_mam +sang', 'chim @hat/duoiphai', 'dua_tron ^duoi @dua_hau_nho/mua'],
  auco: ['tho', 'hoa +thap', 'long_vu +sang', 'nui:lama +tim', 'boc_trung +lap'],
  cdt: ['thuy', 'gay_than +thap', 'non_la +lap', 'song:son', 'thanh:dat +trang'],
  tiendung: ['hoa', 'quat +lap', 'ngoc +sang', 'sen +lap', 'hoa:vang @canh_hoa/mua'],
  langlieu: ['tho', 'banh_chung +lap', 'banh_giay +thap', 'ruong', 'mam +sang'],
  giaodong: ['kim', 'giao +no', 'dau_giao +lap', 'giao_cheo +muctieu', 'loc:bac @giao_nho/giua'],
  chuongdong: ['kim', 'chuong_tay +sao', 'song_am @chuong_nho/trentrai', 'bua_giay', 'chuong:vang +am'],
  nghedong: ['kim', 'dau_nghe +toc', 'khien_dong', 'chan_nghe +chem', 'mai_dinh +am'],
  mychau: ['kim', 'ngong +hoa:trang', 'ao_long', 'gieng +thap', 'dau_mong +vong'],
  kylan: ['kim', 'sung:vang +no', 'vay', 'may_lanh +len', 'dau_kylan +lua'],
  thienloi: ['kim', 'set +no', 'luoi_set +sang:troi', 'bua @set_nho/trenphai', 'may_set +no'],
  tre: ['moc', 'gay_tre +no', 'than_tre +len', 'luy_tre +thap', 'choi +xoay'],
  ongthoi: ['moc', 'ong_thoi +toc', 'bau +doc', 'mat', 'may:sat ^tren @kim/mua2'],
  sodua: ['moc', 'dua +no', 'sao_truc +nhac', 'dua_nut +thap', '- @dua_nho/nhieu +mua'],
  cuoi: ['moc', 'don_ganh +chem', 'la_da +thap', 'cay_da:lama +gio +trang', 'trang +gio'],
  melua: ['moc', 'bong_lua:lama +dat', 'bat_com +khoi:trang', 'rom', 'liem:vang @thoc/mua'],
  dapde: ['tho', 'cuoc +no', 'khien:cat +len', 'de +song', 'de_vo'],
  chantrau: ['tho', 'soi +nay', 'gay_trau +sao', 'trau +nhac', 'na @soi_nho/quanh'],
  ongdung: ['tho', 'ganh_da', 'khong_lo +len', 'ao_chan', 'nui_cao:cat +len'],
  thocong: ['tho', 'ban_tay +sang', 'nhang', 'vom +khien:vang', 'mieu +lap'],
  tanvien: ['tho', 'nui +toc', 'nui3 +may', 'nui_da +song', 'nui_cao +song +len'],
  maudia: ['tho', 'khe_nut', 'suoi +thap', 're:vang +lap', 'nui3:la +sang'],
  chodo: ['thuy', 'cheo +no', 'cheo_doi +xoay', 'giot +len', 'thuyen +song'],
  haisen: ['thuy', 'bup_sen +thap', 'hat_sen', 'sen:trang +khoi:hong', 'la_sen +mua'],
  halong: ['thuy', 'song_ngang:ngoc +toc', 'vay:ngoc', 'dao @ngoc_nho/trenphai', 'rong +song'],
  longnu: ['thuy', 'long_chau +sang', 'giot:troi +vong', 'rong:troi +tuyet', 'cung_dien +song'],
  dotnuong: ['hoa', 'dao_phat +no', 'ruong:cat %dat +lua', 'khoi ^tren +dat', 'cay +lua'],
  denroi: ['hoa', 'den_troi +no', 'ngon_nen +sang', 'sao @den_nho/duoitrai', '- @den_nho/nam +trang'],
  kinhduong: ['hoa', 'dao_kiem:vang +chem', 'bong_lua:vang +vong:vang', 'co', 'rong:lua +lua'],
  viemde: ['hoa', 'duoc +lap', 'bo_thuoc', 'cay_cay +lua', 'thien_thach +toc'],
  thoren: ['hoa', 'bua:lua +no', 'lo_ren', 'giap +lap', 'de_ren +lua +sang'],
  nguphu: ['thuy', 'luoi', 'xien +toc', 'ca +song', 'thung +song +toc'],
  thogom: ['tho', 'binh_gom:dong +no', 'gach', 'dia_gom', 'lo_gom +khoi'],
  thaylang: ['moc', 'coi +thap', 'la:tim +doc', 'bui +khoi:lama', 'bo_thuoc:lama +vong +thap'],
  caong: ['thuy', 'ca_voi +phun', 'thuyen:cat %son +khien', 'giap:cham +len', 'song:troi +no'],
  matroi: ['hoa', 'cot_nang', 'mat_troi', 'qua', 'nhat_thuc'],
  mauthoai: ['thuy', 'song:bac +lap', 'binh +thap', 'ngoc:troi +tuyet', 'cong +song'],
  trutroi: ['tho', 'ban_chan +dat', 'cot_da', 'khong_lo:sat +khien', 'tay_do +may'],
  ongho: ['moc', 'vuot:lua +toc', 'dau_ho +am', 'dau_chan_ho +la', 'tu_va +sang'],
  adv: ['kim', 'muiten:dong +nay', 'thanh_oc', 'luy @ten_nho/ba', 'no:vang +sang @mong_nho/trenphai'],
  mau: ['moc', 'day_leo', 're +dat', 'cay_da:reu +sang:vang', 'cay_mat +la'],
};
// tướng có 4 icon vẽ tay (giữ hình, chỉ tô khung theo phím)
const VE_TAY = ['baahoa', 'giong', 'lachau', 'llq', 'lyngu', 'ongtao', 'potaoapui', 'thansan', 'trongdong', 'truongchi'];

function docO(s) {
  const bp = {}, hieu = [];
  s.split(/\s+/).filter(Boolean).forEach((t, i) => {
    if (i === 0 && t !== '-') { const [v, m] = t.split(':'); bp.vat = v; if (m) bp.mauVat = m; }
    else if (t[0] === '+') { const [h, m] = t.slice(1).split(':'); hieu.push(h); if (m && !bp.mauHieu) bp.mauHieu = m; }
    else if (t[0] === '@') { const [v, r] = t.slice(1).split('/'); const [vi2, m] = (r || 'trenphai').split(':'); bp.vat2 = v; bp.vi2 = vi2; if (m) bp.mauVat2 = m; }
    else if (t[0] === '^') bp.vi = t.slice(1);
    else if (t === '~') bp.lat = 'co';
    else if (t[0] === '%') bp.mauPhuVat = t.slice(1);
    else if (t[0] === '#') bp.mauNen = t.slice(1);
  });
  if (hieu[0]) bp.hieu = hieu[0];
  if (hieu[1]) bp.hieu2 = hieu[1];
  return bp;
}
function heroes() {
  const ctx = { console, window: {}, document: {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + ';this.HEROES = HEROES;', ctx);
  return ctx.HEROES;
}
function taoSpec() {
  const KN = require('./ve-pixel-ky-nang.js')(), H = heroes(), PH = 'qwer', out = [];
  // khung vẽ tay → tô lại theo phím: G sáng · F gốc · E tối · H khấc · S ngọc son ở góc (R)
  const khungVeTay = (k) => {
    const pk = KN.PHIM[k];
    const rows = KN.KHUNG.map((r, y) => [...r].map((c, x) => (pk.goc && (x === 1 || x === 22) && (y === 1 || y === 22) ? 'S' : { g: 'G', f: 'F', e: 'E', h: 'H' }[c] || '.')).join(''));
    return { mau: { G: pk.mau[0], F: pk.mau[1], E: pk.mau[2], H: pk.mau[3], S: 'son-sang' }, khung: { 'main.0': rows } };
  };
  const loi = [];
  for (const h of Object.keys(H)) {
    const hero = H[h];
    if (VE_TAY.includes(h)) {
      PH.split('').forEach((k) => { const sp = { ma: `ky-nang/${h}_${k}`, mau: `ky-nang/${h}-${k}` }; if (k !== 'q') sp.ve_tay = khungVeTay(k); out.push(sp); });
      continue;
    }
    const row = BANG[h];
    if (!row) { loi.push(`thiếu thiết kế cho tướng "${h}" (${hero.name})`); continue; }
    PH.split('').forEach((k, i) => {
      const bp = docO(row[i + 1]), sk = hero.skills[i];
      const hinh = bp.vat ? KN.HINH[bp.vat] : null, nho = bp.vat2 ? KN.NHO[bp.vat2] : null;
      if (bp.vat && !hinh) loi.push(`${h}_${k}: không có hình "${bp.vat}"`);
      if (bp.vat2 && !nho) loi.push(`${h}_${k}: không có hình phụ "${bp.vat2}"`);
      for (const x of [bp.hieu, bp.hieu2]) if (x && !KN.HIEU[x]) loi.push(`${h}_${k}: không có hiệu ứng "${x}"`);
      const mo = [hinh && hinh[0], nho && nho[0], ...[bp.hieu, bp.hieu2].filter(Boolean).map((x) => KN.HIEU[x] && KN.HIEU[x][0])].filter(Boolean).join(' + ');
      out.push({ ma: `ky-nang/${h}_${k}`, ten: `${hero.name} · ${k.toUpperCase()} «${sk.name}»`, mo, hanh: row[0], bo_phan: bp });
    });
  }
  const thua = Object.keys(BANG).filter((h) => !H[h]);
  if (thua.length) loi.push(`bảng có tướng không còn trong game: ${thua.join(', ')}`);
  return { loi, out, txt: '{ "ma": [\n' + out.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n] }\n' };
}
function main() {
  const { loi, out, txt } = taoSpec();
  if (loi.length) { console.error(loi.join('\n')); process.exit(1); }
  fs.writeFileSync(path.join(ROOT, 'tools/pixel/spec/ky-nang.json'), txt);
  console.log(`build-ky-nang-spec: ${out.length} mã (${out.filter((x) => x.mau).length} vẽ tay) → tools/pixel/spec/ky-nang.json`);
}
if (require.main === module) main();
module.exports = { BANG, VE_TAY, docO, taoSpec };
