"""Đo hộp thân thật (điểm ảnh) của mọi quái / tinh anh / trùm nhỏ / trùm vùng theo từng pha và hai mặt → game/js/dinh_quai_bang.js
(bảng neo dùng cho js/dinh_quai.js). Chạy lại khi thay ảnh quái:  python3 docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu/tao_bang.py"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dq_common import *

JS = r"""
() => {
  const out = {};
  for (const q of DQ.roster()) {
    const e0 = DQ.spawn(q); if (!e0) continue;
    const key = e0.isBoss && e0.kind !== 'mini' ? 'trum:' + e0.kind : e0.art;
    if (!key) continue;
    const nPha = e0.isBoss ? (e0.kind === 'mini' ? 2 : 3) : 1, phas = [];
    for (let p = 0; p < nPha; p++) {
      const mat = [];
      for (const f of [-1, 1]) {
        const e = DQ.spawn(q, { face: f }); e.face = f; e.dirA = f > 0 ? 0 : Math.PI;
        if (e.isBoss) { e.phase = p; if (e.an) { e.an = { n: 'idle', t: 0, spd: 1 }; } }
        const b = DQ.bbox(DQ.body(e));
        mat.push(b ? [b.x0 - e.x, b.x1 - e.x, b.y0 - e.y, b.y1 - e.y].map((v) => Math.round(v * 2) / 2) : null);
      }
      phas.push(mat);
    }
    out[key] = phas;
  }
  return out;
}
"""
if '--thuong-moi' in sys.argv:
    # thuong-luong-that 17/10: chỉ đo lại Thuồng Luồng ẢNH THẬT (bản web linh-khi-nhe.html — bản một tệp không chứa ảnh này) → khoá "trum:thuongMoi";
    # mọi khoá khác (kể cả "trum:thuong" của hình tạm, dùng khi ?tlmoi=0 / ảnh chưa tải) giữ y nguyên trong bảng hiện có.
    import re as _re
    cu = json.loads(_re.search(r'G\.DINH_QUAI_BANG = (\{.*\}); \}\)\(\);', open(os.path.join(GAME, 'js', 'dinh_quai_bang.js')).read()).group(1))
    with sync_playwright() as pw:
        b, pg, errs = open_game(pw, tep='dist/linh-khi-nhe.html')
        moi = pg.evaluate(JS)
        b.close()
        b, pg, errs0 = open_game(pw, extra='&tlmoi=0', tep='dist/linh-khi-nhe.html')
        cu0 = pg.evaluate(JS)
        b.close()
    print('hình tạm (?tlmoi=0) đo lại:', cu0.get('trum:thuong'), '| trong bảng:', cu.get('trum:thuong'))
    cu.pop('trum:thuongMoi', None)
    bang = dict(cu); bang['trum:thuongMoi'] = moi['trum:thuong']
    errs = errs + errs0
else:
  with sync_playwright() as pw:
    b, pg, errs = open_game(pw)
    bang = pg.evaluate(JS)
    b.close()
L = ['// TỆP TẠO TỰ ĐỘNG bằng docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu/tao_bang.py — đừng sửa tay.',
     '// Bảng neo thân quái (hieu-ung-dinh-quai phần B): hộp điểm ảnh thật của thân lúc đứng thở, tính từ điểm chân (e.x, e.y), điểm game.',
     '// mã → [pha][mặt: 0 = quay trái, 1 = quay phải] = [x0, x1, y0, y1]. Trùm vùng: "trum:<kind>" (3 pha); trùm nhỏ: 2 pha.',
     '// "trum:thuongMoi": Thuồng Luồng ảnh thật (thuong-luong-that, đo bằng tao_bang.py --thuong-moi trên bản web); "trum:thuong": hình tạm (?tlmoi=0).',
     '(function () { const G = window.G; if (!G) return; G.DINH_QUAI_BANG = ' + json.dumps(bang, separators=(',', ':')) + '; })();', '']
open(os.path.join(GAME, 'js', 'dinh_quai_bang.js'), 'w').write('\n'.join(L))
print(len(bang), 'mã;', 'lỗi JS', len(errs))
for k, v in bang.items(): print(k, v)
