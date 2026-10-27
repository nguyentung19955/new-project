/* ======================= LÀNG HOÀN THIỆN (27/10/2026) – module LHT =======================
   Ảnh gen mới đã tách nền (art/lang-hoan-thien/, code/tach.py): điểm lưu, đèn lồng, rễ trần, chuông lớn, đồ làng, HUD, nút cảm ứng,
   NPC (mảnh rời + rig), chân dung, tranh màn bắt đầu / kết. Atlas 2x: px ảnh = logic × 2.
     await LHT.nap(srcJson, nhung, onTien)   nạp JSON + mọi atlas KHÔNG thuộc họ "-kho" + 2 tranh, DECODE SẴN (ở màn nạp); trả số đo
     LHT.ve(ctx, ten, x, y, {lat, k, al, xoay, tx, ty})   vẽ mảnh tại NEO (toạ độ màn logic); xoay quanh neo (rad)
     LHT.url(ten)        data URL của 1 mảnh (cho nút DOM / chân dung) – null nếu không cắt được (ảnh "bẩn" khi mở file:// không build)
     LHT.tranh[ten]      src tranh (dùng làm nền CSS)
     LHT.rig[nv]         rig NPC: {cao, manh:[{o, x, y, w, h}]} – x, y = góc trái-trên mảnh so với CHÂN (logic), nhìn phải
   Lỗi nạp → LHT.bat = false: game tự quay về hình / nút cũ. Không đổi gameplay. */
const LHT = (() => {
  const O = {}, SO = {}, tranh = {}, rig = {};
  let bat = true, META = null;

  function giaiMa(src, ten) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = async () => { try { if (im.decode) await im.decode(); } catch (e) {} res(im); };
      im.onerror = () => rej(new Error('không tải được ảnh ' + ten));
      im.src = src;
    });
  }

  async function nap(srcJson, nhung, onTien) {
    const t0 = performance.now();
    let goc = '';
    if (nhung) META = nhung.json;
    else { const r = await fetch(srcJson, {cache: 'no-cache'}); if (!r.ok) throw new Error('lỗi mạng ' + r.status + ' khi tải ' + srcJson); META = await r.json(); goc = srcJson.replace(/[^/]*$/, ''); }
    const B = META.boi || 2, ho = Object.entries(META.anh).filter(([, a]) => !a.kho);
    const IMG = {}; let px = 0, i = 0;
    const tong = ho.length + Object.keys(META.tranh).length;
    await Promise.all(ho.map(async ([, a]) => {
      const im = await giaiMa(nhung ? nhung.anh[a.tep] : goc + a.tep, a.tep);
      if (im.naturalWidth !== a.co_anh[0] || im.naturalHeight !== a.co_anh[1]) throw new Error('ảnh ' + a.tep + ' cỡ ' + im.naturalWidth + '×' + im.naturalHeight + ' ≠ ' + a.co_anh.join('×'));
      IMG[a.tep] = im; px += im.naturalWidth * im.naturalHeight; if (onTien) onTien(++i / tong);
    }));
    await Promise.all(Object.entries(META.tranh).map(async ([ten, t]) => {
      const src = nhung ? nhung.tranh[t.tep] : goc + t.tep;
      const im = await giaiMa(src, t.tep); tranh[ten] = src; tranh[ten + '_img'] = im;
      px += im.naturalWidth * im.naturalHeight; if (onTien) onTien(++i / tong);
    }));
    for (const [ten, v] of Object.entries(META.o)) {
      const img = IMG[v.anh]; if (!img) continue;
      const [sx, sy, sw, sh] = v.khung;
      O[ten] = {img, sx, sy, sw, sh, w: sw / B, h: sh / B, ax: v.neo[0] / B, ay: v.neo[1] / B, treo: v.treo || null, rong: v.rong || null};
    }
    Object.assign(rig, META.npc_rig || {});
    Object.assign(SO, {ms: Math.round(performance.now() - t0), so_anh: ho.length + Object.keys(META.tranh).length, mb_anh: +(px * 4 / 1048576).toFixed(2), o: Object.keys(O).length});
    return SO;
  }

  /* vẽ mảnh tại neo (x, y) màn logic. o.k: phóng; o.lat: lật ngang quanh neo; o.xoay: rad quanh neo; o.al: alpha */
  function ve(ctx, ten, x, y, o) {
    const p = O[ten]; if (!p) return false;
    const k = (o && o.k) || 1, lat = o && o.lat, xoay = (o && o.xoay) || 0, al = o && o.al;
    const sx = (o && o.sx) || 1, sy = (o && o.sy) || 1;
    if (al !== undefined) { if (al <= 0) return true; ctx.globalAlpha = al; }
    if (lat || xoay || k !== 1 || sx !== 1 || sy !== 1) {
      ctx.save(); ctx.translate(x, y); if (xoay) ctx.rotate(xoay); ctx.scale((lat ? -k : k) * sx, k * sy);
      ctx.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, -p.ax, -p.ay, p.w, p.h); ctx.restore();
    } else ctx.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, x - p.ax, y - p.ay, p.w, p.h);
    if (al !== undefined) ctx.globalAlpha = 1;
    return true;
  }

  const URL_ = {};
  function url(ten) {
    if (ten in URL_) return URL_[ten];
    const p = O[ten]; if (!p) return (URL_[ten] = null);
    try { const c = document.createElement('canvas'); c.width = p.sw; c.height = p.sh;
      c.getContext('2d').drawImage(p.img, p.sx, p.sy, p.sw, p.sh, 0, 0, p.sw, p.sh); URL_[ten] = c.toDataURL('image/png'); }
    catch (e) { URL_[ten] = null; }   // ảnh "bẩn" (file:// không build) → giữ nút vẽ bằng code
    return URL_[ten];
  }

  return {nap, ve, url, O, SO, tranh, rig, get bat() { return bat; }, set bat(v) { bat = v; }};
})();
