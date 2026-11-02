'use strict';
/* nap.js – Vùng 2 "Rotting Roots" (chép khung Vùng 1): nạp nhân vật (nhan-vat.json), quái Vùng 2 (vung-2/quai.json), trùm (vung-2/trum.json),
   nền + địa hình + đạo cụ Vùng 2 (ChatGPT vẽ, art/vung-2/).
   Thiếu hình KHÔNG làm hỏng trang: clip.ok = false → vẽ khối màu / hình tạm. */
const V1 = window.V1 || (window.V1 = {});
V1.IMG = {}; V1.LOI = []; V1.CAP = []; V1.NVJ = null; V1.QJ = null; V1.TRUMJ = null;

V1.napAnh = (k, src) => new Promise(ok => { const i = new Image(); i.onload = () => { V1.IMG[k] = i; ok(); }; i.onerror = () => { V1.LOI.push(src); ok(); }; i.src = src; });

V1.nap = async function(){
  const E = DongCoMN;
  const A = '../../art/phong-demo/', N2 = '../../art/vung-2/nen/';
  await Promise.all([['hon', A + 'fx_hon'], ['vm1', '../../art/vung-2/chat-lieu/re-treo-3'], ['vm2', '../../art/vung-2/chat-lieu/re-treo-2'],
    ['bg_hang', N2 + 'xa-hang-re'], ['bg_vuon', N2 + 'xa-vuon-uom'], ['mid_vom', N2 + 'giua-vom-re'], ['mid_ho', N2 + 'giua-ho-bao-tu'], ['bg_trum', N2 + 'trum-tim-moc'],
    ['suong1', N2 + 'suong-1'], ['suong2', N2 + 'suong-2']].map(([k, f]) => V1.napAnh(k, f + '.png')));
  if (V1.napDiaHinh) await V1.napDiaHinh();   // địa hình động Vùng 2 (dia-hinh.js)
  // hiệu ứng chiêu quái (ChatGPT vẽ): 6 ô 96×96, hướng TRÁI
  await Promise.all(['ken', 'cau', 'vai', 'tan', 'bui_tuong', 'tang', 'ken_tron', 'cau_tim', 'vai_nhat', 'ken_tu'].map(n => V1.napAnh('fx_' + n, '../../art/hieu-ung/chieu-quai/' + n + '.png')));
  await Promise.all(['mau_day', 'mau_rong', 'binh_day', 'binh_rong', 'i_hat_vong', 'i_the_ten', 'i_loi_vong_tan', 'chuong_khoa', 'khung_hud', 'vach', 'nut_ban_do'].map(n => V1.napAnh('hud_' + n, '../../art/giao-dien/hud/' + n + '.png')));   // giao diện (ChatGPT vẽ)
  await Promise.all(['bao_quet', 'vet_quet', 'dich_mat_na', 'cot_song', 'mat_na_roi', 'day_vai'].map(n => V1.napAnh('tr_' + n, '../../art/hieu-ung/trum/' + n + '.png')));   // hiệu ứng trùm + dây Màn Tang (ChatGPT vẽ)
  await Promise.all([['khung_bang', 'khung_bang'], ['khung_mat', 'khung_mat']].map(([k, n]) => V1.napAnh(k, '../../art/giao-dien/khung/' + n + '.png')));   // khung bảng thông báo (ChatGPT vẽ)
  try { await Promise.race([Promise.all(['700 16px "Alegreya Sans"', '700 20px "Cormorant Garamond"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}   // phông chữ (ChatGPT chọn)
  await Promise.all(['nen', 'o_da', 'o_hien', 'o_chua', 'chuong_luu', 'mat_na', 'trum', 'chuong_vo', 'noi_ngang', 'noi_doc'].map(n => V1.napAnh('bd_' + n, '../../art/giao-dien/ban-do/' + n + '.png')));   // bản đồ (ChatGPT vẽ)
  await V1.napAnh('fx_hoi_mau', '../../art/hieu-ung/hoi-mau/hoi_mau.png');   // hiệu ứng hồi máu (ChatGPT vẽ)
  await Promise.all(['ngang', 'cung', 'cheo', 'no'].map(n => V1.napAnh('fx_c_' + n, '../../art/hieu-ung/chem-moi/' + n + '.png')));   // hiệu ứng trúng đòn (ChatGPT vẽ)
  await Promise.all(['nut_dat', 'song_dat', 're_troi', 'khung_mau', 'ruot_mau', 'i_manh_am', 'i_chuong_vo', 'i_mat_na'].map(n => V1.napAnh('fx_' + n, '../../art/hieu-ung/chieu-moi/' + n + '.png')));   // hình ChatGPT thay hình vẽ bằng code
  // dấu dẫn hướng + dấu báo đòn (ChatGPT vẽ): art/vung-1/dao-cu/dan-duong/
  await Promise.all(['bia', 'chuong_nho', 'coc_chuong', 'nut_bi_mat', 'canh_bao'].map(n => V1.napAnh('dd_' + n, '../../art/vung-1/dao-cu/dan-duong/' + n + '.png')));
  // đạo cụ + trùm (ChatGPT vẽ, PNG trong suốt; luồng E). Thiếu ảnh → ve.js vẽ hình tạm như cũ.
  const DC = '../../art/vung-1/dao-cu/', TRM = '../../art/vung-1/trum/';
  await Promise.all([['chuong_tat', DC + 'chuong-luu-gon-tat'], ['chuong_sang', DC + 'chuong-luu-gon-sang'], ['cong_re', DC + 'cong-re'],
    ['trum_nghi', TRM + 'nghi'], ['trum_gio', TRM + 'gio-chuong'], ['trum_vo', TRM + 'vo-mat-na']].map(([k, f]) => V1.napAnh(k, f + '.png')));
  // nhân vật (như phòng demo)
  const NVJ = V1.NVJ = await SpriteMN.napJson('../thu-mat-na/nhan-vat.json');
  const gNV = NVJ.goc; E.datTL(NVJ.ti_le || 2); E.datCo((NVJ.co || 1) * 0.85); E.pl.h = 78;
  await Promise.all(Object.entries(NVJ.clip).map(async ([ten, def]) => { E.NV.clip[ten] = await SpriteMN.napClip(gNV, def, ten); }));
  for (const c of (NVJ.cap || [])){
    const o = {ten:c.ten, sat_thuong:c.sat_thuong, clip:{}, chuoi:c.chuoi || null, bien_the:c.bien_the || null};
    await Promise.all(Object.entries(c.clip || {}).map(async ([ten, def]) => { o.clip[ten] = await SpriteMN.napClip(gNV, def, ten); }));
    V1.CAP.push(o);
  }
  for (const ten of ['dung', 'troi', 'nhay', 'nhaydoi', 'roi', 'tiepdat', 'luot', 'bamtuong', 'dapdat', 'luon', 'trungdon', 'hoimau', 'chet', 'don1', 'don2', 'don3', 'chemkhong'])
    if (!E.NV.clip[ten] && !(V1.CAP[0] && V1.CAP[0].clip[ten])) E.NV.clip[ten] = await SpriteMN.napClip(gNV, null, ten);
  const c = V1.CAP[0];
  E.NV.capClip = c ? c.clip : {}; E.NV.cap = c || null;
  E.NV.chuoi = (c && c.chuoi) || NVJ.chuoi || null; E.NV.bien_the = (c && c.bien_the) || NVJ.bien_the || null;
  if (window.LopTrangBi) await LopTrangBi.nap('../thu-mat-na/trang-bi.json', V1.CAP.flatMap(c => Object.values(c.clip)));   // lớp trang bị/sức mạnh trên người (chưa có ảnh → không đổi gì)
  // quái
  try { V1.QJ = await SpriteMN.napJson('quai.json'); }   // quái RIÊNG Vùng 2
  catch (e){ V1.LOI.push('quai.json: ' + e); V1.QJ = {loai:{}}; }
  const gQ = V1.QJ.goc || '../../art/quai-vung-2/';
  await Promise.all(Object.entries(V1.QJ.loai || {}).map(async ([id, d]) => {
    d.id = id; d.than = d.than || [30, 50]; d.chan = d.chan || null; d._clip = {};
    const HH = d.hinh || {};
    await Promise.all([...new Set(['dung', 'di', 'danh', 'trung', 'chet', ...Object.keys(HH)])].map(async st => {   // + động tác riêng (lac, nhay, chem, dam, ra_lenh, choang)
      const def = HH[st] ? Object.assign({chan:d.chan}, HH[st]) : null;
      if (def && !def.chan) delete def.chan;
      d._clip[st] = await SpriteMN.napClip(gQ, def, id + '/' + st);
      if (!d._clip[st].ok) V1.LOI.push(id + '/' + st);
    }));
    if (d.fx_danh){
      const f = d.fx_danh, lech = f.lech || [0, 0], chan = d.chan || d._clip.danh.chan || [0, 0];
      const def = Object.assign({ms:(HH.danh || {}).ms, lap:false}, f, {chan:f.chan || [lech[0] + chan[0], lech[1] + chan[1]]});
      d._clip.fx = await SpriteMN.napClip(gQ, def, id + '/fx-danh');
    }
  }));
  // trùm: hình thật (nếu đã có) theo ID clip trong trum.json; chưa có → hình tạm vẽ bằng canvas
  try { V1.TRUMJ = await SpriteMN.napJson('trum.json'); } catch (e){ V1.TRUMJ = {hinh:{}}; }
  V1.TRUM_CLIP = {};
  const gT = V1.TRUMJ.goc || '../../art/trum-vung-2/';
  await Promise.all(Object.entries(V1.TRUMJ.hinh || {}).map(async ([id, def]) => {
    V1.TRUM_CLIP[id] = await SpriteMN.napClip(gT, def && def.thu_muc ? def : null, 'trum/' + id);
  }));
  // hiệu ứng quái + trùm Vùng 2 (ChatGPT vẽ): V1.FXQ / V1.FXT[ten] = clip
  V1.FXQ = {}; V1.FXT = {};
  const fq = V1.QJ.fx || {}, ft = V1.TRUMJ.fx || {};
  await Promise.all(Object.entries(fq).filter(([k]) => k !== 'goc').map(async ([k, def]) => { V1.FXQ[k] = await SpriteMN.napClip(fq.goc || gQ, def, 'fx/' + k); }));
  await Promise.all(Object.entries(ft).map(async ([k, def]) => { V1.FXT[k] = await SpriteMN.napClip(gT, def, 'trum-fx/' + k); }));
};

/* Ảnh phòng nướng sẵn (tools/vung-2/ve-phong.py): art/vung-2/<ID>-canh.png, -truoc.png, -manh.png, -canh.json.
   Thiếu ảnh → V1.CANH[id] = null → ve.js vẽ ô bằng code (dự phòng). */
V1.CANH = {};
V1.napCanhPhong = async function(id){
  if (id in V1.CANH) return V1.CANH[id];
  const A = '../../art/vung-2/' + id, im = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  let meta = null;
  try { const r = await fetch(A + '-canh.json'); if (r.ok) meta = await r.json(); } catch (e){}
  const [canh, truoc, manh] = await Promise.all([im(A + '-canh.png'), im(A + '-truoc.png'), meta && meta.manh && meta.manh.length ? im(A + '-manh.png') : null]);
  V1.CANH[id] = canh && meta ? {canh, truoc, manh, meta} : null;
  if (!V1.CANH[id]) V1.LOI.push('room image ' + id);
  return V1.CANH[id];
};
