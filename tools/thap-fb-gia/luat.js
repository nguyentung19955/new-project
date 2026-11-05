// TURRET MERGE — bộ thi hành LUẬT Realtime Database (bản rút gọn, đủ cho turret-merge) cho máy chủ Firebase giả (server.js).
// Đọc đúng file luật JSON (vd. docs/demo-hop-tuong/turretmerge-database.rules.json hoặc luat-dang-chay.json) và áp như RTDB:
//  · .read / .write: xếp tầng — bất kỳ luật nào từ gốc tới vị trí đó cho phép là được (luật sâu hơn KHÔNG cấp quyền cho vị trí nông hơn)
//  · update nhiều đường dẫn: mỗi đường dẫn con xét riêng (như SDK thật), cả khối chỉ ghi khi tất cả qua
//  · .validate: mọi nút có dữ liệu mới (khác null) ở vị trí ghi, tổ tiên của nó và toàn bộ con cháu; $biến + $other
//  · biểu thức: auth, now, root, data, newData, $biến; snapshot: val/exists/child/parent/hasChild/hasChildren/isString/isNumber/isBoolean
'use strict';
/* eslint no-new-func: 0 */
if (!String.prototype.matches) Object.defineProperty(String.prototype, 'matches', { value: function (re) { return re.test(String(this)); } });
const tach = (p) => (p || '').split('/').filter(Boolean);
function lay(goc, ks) { let o = goc; for (const k of ks) { if (o == null || typeof o !== 'object') return null; o = o[k]; } return o === undefined ? null : o; }
function Snap(goc, ks) {
  const v = lay(goc, ks);
  return {
    val: () => v, exists: () => v != null,
    child: (p) => Snap(goc, ks.concat(tach(String(p)))),
    parent: () => Snap(goc, ks.slice(0, -1)),
    hasChild: (k) => lay(goc, ks.concat(tach(k))) != null,
    hasChildren: (a) => v != null && typeof v === 'object' && (a ? a.every(k => v[k] != null) : Object.keys(v).length > 0),
    isString: () => typeof v === 'string', isNumber: () => typeof v === 'number', isBoolean: () => typeof v === 'boolean',
  };
}
const _ham = new Map();
function bieuThuc(s) {
  if (s === true || s === false) return () => s;
  if (!_ham.has(s)) _ham.set(s, new Function('auth', 'now', 'root', 'data', 'newData', '$', 'with ($) { return (' + s + '); }'));
  return _ham.get(s);
}
function chay(s, ctx, bien) { try { return !!bieuThuc(s)(ctx.auth, ctx.now, ctx.root, ctx.data, ctx.newData, bien); } catch (e) { return false; } }

// các nút luật dọc đường dẫn ks: [{ r, ks (đường dẫn tới nút), bien }]
function docDuong(luat, ks) {
  const ra = []; let r = luat.rules, bien = {}; ra.push({ r, ks: [], bien });
  for (let i = 0; i < ks.length && r; i++) {
    const k = ks[i];
    let con = r[k];
    if (!con) { const w = Object.keys(r).find(x => x[0] === '$'); if (w) { con = r[w]; bien = Object.assign({}, bien, { [w]: k }); } }
    r = con; if (r) ra.push({ r, ks: ks.slice(0, i + 1), bien });
  }
  return ra;
}
function tao(luat) {
  const ctx0 = (uid, cu, moi) => ({ auth: uid ? { uid, token: {} } : null, now: Date.now(), root: Snap(cu, []), cuGoc: cu, moiGoc: moi });
  function doc(uid, cu, p) {
    const ks = tach(p), c = ctx0(uid, cu, cu);
    for (const n of docDuong(luat, ks)) if (n.r['.read'] !== undefined && chay(n.r['.read'], Object.assign({}, c, { data: Snap(cu, n.ks), newData: Snap(cu, n.ks) }), n.bien)) return true;
    return false;
  }
  function ghiDuoc(uid, cu, moi, ks) {
    const c = ctx0(uid, cu, moi);
    for (const n of docDuong(luat, ks)) if (n.r['.write'] !== undefined && chay(n.r['.write'], Object.assign({}, c, { data: Snap(cu, n.ks), newData: Snap(moi, n.ks) }), n.bien)) return true;
    return false;
  }
  function hopLe(uid, cu, moi, ks, loi) {
    const c = ctx0(uid, cu, moi);
    const xet = (r, dks, bien) => {
      if (!r || lay(moi, dks) == null) return true;
      if (r['.validate'] !== undefined && !chay(r['.validate'], Object.assign({}, c, { data: Snap(cu, dks), newData: Snap(moi, dks) }), bien)) { loi.push(dks.join('/')); return false; }
      return true;
    };
    const duong = docDuong(luat, ks);
    for (const n of duong) if (!xet(n.r, n.ks, n.bien)) return false; // tổ tiên + chính nó
    // con cháu của vị trí ghi
    const cuoi = duong.length === ks.length + 1 ? duong[duong.length - 1] : null;
    const xuong = (r, dks, bien) => {
      const v = lay(moi, dks); if (v == null || typeof v !== 'object') return true;
      for (const k of Object.keys(v)) {
        let con = r[k], b = bien;
        if (!con) { const w = Object.keys(r).find(x => x[0] === '$'); if (w) { con = r[w]; b = Object.assign({}, bien, { [w]: k }); } }
        if (!con) continue;
        if (!xet(con, dks.concat(k), b) || !xuong(con, dks.concat(k), b)) return false;
      }
      return true;
    };
    return cuoi ? xuong(cuoi.r, cuoi.ks, cuoi.bien) : true;
  }
  // ghi: dsKs = danh sách đường dẫn đã ghi (set = 1, update = mỗi khoá 1). Trả null | 'PERMISSION_DENIED'
  function ghi(uid, cu, moi, dsKs) {
    for (const ks of dsKs) {
      if (!ghiDuoc(uid, cu, moi, ks)) return { loi: 'PERMISSION_DENIED', o: 'write ' + ks.join('/') };
      const l = []; if (!hopLe(uid, cu, moi, ks, l)) return { loi: 'PERMISSION_DENIED', o: 'validate ' + l.join(',') };
    }
    return null;
  }
  return { doc, ghi, tach };
}
module.exports = { tao };
