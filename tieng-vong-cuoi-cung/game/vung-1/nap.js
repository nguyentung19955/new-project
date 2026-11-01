'use strict';
/* nap.js – Vùng 1: nạp nhân vật (nhan-vat.json), quái (quai.json), trùm (trum.json) + ảnh nền phòng demo.
   Thiếu hình KHÔNG làm hỏng trang: clip.ok = false → vẽ khối màu / hình tạm. */
const V1 = window.V1 || (window.V1 = {});
V1.IMG = {}; V1.LOI = []; V1.CAP = []; V1.NVJ = null; V1.QJ = null; V1.TRUMJ = null;

V1.napAnh = (k, src) => new Promise(ok => { const i = new Image(); i.onload = () => { V1.IMG[k] = i; ok(); }; i.onerror = () => { V1.LOI.push(src); ok(); }; i.src = src; });

V1.nap = async function(){
  const E = DongCoMN;
  const A = '../../art/phong-demo/';
  await Promise.all([['bg', 'bg_far'], ['mid', 'bg_mid'], ['hon', 'fx_hon'], ['vm1', 'v_mid1'], ['vm2', 'v_mid2']].map(([k, f]) => V1.napAnh(k, A + f + '.png')));
  // hiệu ứng chiêu quái (ChatGPT vẽ): 6 ô 96×96, hướng TRÁI
  await Promise.all(['ken', 'cau', 'vai', 'tan', 'bui_tuong', 'tang'].map(n => V1.napAnh('fx_' + n, '../../art/hieu-ung/chieu-quai/' + n + '.png')));
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
  // quái
  try { V1.QJ = await SpriteMN.napJson('../thu-mat-na/quai.json'); }
  catch (e){ V1.LOI.push('quai.json: ' + e); V1.QJ = {loai:{}}; }
  const gQ = V1.QJ.goc || '../../art/quai-moi/';
  await Promise.all(Object.entries(V1.QJ.loai || {}).map(async ([id, d]) => {
    d.id = id; d.than = d.than || [30, 50]; d.chan = d.chan || null; d._clip = {};
    const HH = d.hinh || {};
    await Promise.all(['dung', 'di', 'danh', 'trung', 'chet'].map(async st => {
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
  const gT = V1.TRUMJ.goc || '../../art/trum-vung-1/';
  await Promise.all(Object.entries(V1.TRUMJ.hinh || {}).map(async ([id, def]) => {
    V1.TRUM_CLIP[id] = await SpriteMN.napClip(gT, def && def.thu_muc ? def : null, 'trum/' + id);
  }));
};

/* Ảnh phòng nướng sẵn (tools/vung-1/ve-phong.py): art/vung-1/<ID>-canh.png, -truoc.png, -manh.png, -canh.json.
   Thiếu ảnh → V1.CANH[id] = null → ve.js vẽ ô bằng code (dự phòng). */
V1.CANH = {};
V1.napCanhPhong = async function(id){
  if (id in V1.CANH) return V1.CANH[id];
  const A = '../../art/vung-1/' + id, im = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  let meta = null;
  try { const r = await fetch(A + '-canh.json'); if (r.ok) meta = await r.json(); } catch (e){}
  const [canh, truoc, manh] = await Promise.all([im(A + '-canh.png'), im(A + '-truoc.png'), meta && meta.manh && meta.manh.length ? im(A + '-manh.png') : null]);
  V1.CANH[id] = canh && meta ? {canh, truoc, manh, meta} : null;
  if (!V1.CANH[id]) V1.LOI.push('ảnh phòng ' + id);
  return V1.CANH[id];
};
