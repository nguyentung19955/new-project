"""Chụp ảnh tham chiếu cho gói bàn giao ảnh AI (docs/LINH_KHI_AI_ART_HANDOFF).
CHỈ ĐỌC game: không sửa code, không lưu gì vào game. Dùng Chromium có sẵn (không cần 'playwright install').
Chạy từ thư mục gốc repo:  python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/chup_tham_chieu.py
Kết quả: docs/LINH_KHI_AI_ART_HANDOFF/anh/... và anh/do_dac.json (số đo thật, đo bằng điểm ảnh khác trong suốt)."""
import base64, io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(PKG))
sys.path.insert(0, os.path.join(REPO, 'game', 'tests'))
from quai_lib import sync_playwright, open_page  # noqa: E402
from PIL import Image  # noqa: E402

OUT = os.path.join(PKG, 'anh')


def save(url_or_img, rel, scales=(1,)):
    """Lưu ảnh gốc 1x và bản phóng to bằng 'láng giềng gần nhất' (không làm mịn)."""
    im = url_or_img
    if isinstance(im, str):
        im = Image.open(io.BytesIO(base64.b64decode(im.split(',')[1]))).convert('RGBA')
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = []
    for s in scales:
        p = path if s == 1 else path.replace('.png', f'_x{s}.png')
        (im if s == 1 else im.resize((im.width * s, im.height * s), Image.NEAREST)).save(p)
        out.append(os.path.relpath(p, PKG))
    return out


# ---------- JS: vẽ từng sprite lên canvas TRONG SUỐT, đo hộp bao ----------
JS_COMMON = r"""() => {
window.__bbox = (cv) => { const x = cv.getContext('2d'), d = x.getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < cv.height; y++) for (let i = 0; i < cv.width; i++) if (d[(y * cv.width + i) * 4 + 3] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }; };
window.__cell = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; draw(c); return cv; };
window.__colors = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, m = new Map();
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { const k = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(q => q[0]); };
}"""

JS_HERO = r"""([key, CW, CH, OX, OY]) => {
  const W = (t) => t ? { type: t, family: 0, rarity: 0, id: 'tham-chieu-' + t } : null;
  const N = G.tinhLinh.ATKN;
  const rows = [
    ['dung_yen (idle, tay không)', 'idle', null, 8, 0],
    ['chay (run, tay không)', 'run', null, 8, 0],
    ['dung_yen cầm kiếm', 'idle', 'sword', 8, 0],
    ['danh kiếm combo 1', 'atk', 'sword', N.sword, 0],
    ['danh kiếm combo 3', 'atk', 'sword', N.sword, 2],
    ['danh giáo', 'atk', 'spear', N.spear, 0],
    ['danh búa', 'atk', 'hammer', N.hammer, 0],
    ['bắn cung (ngắm ngang)', 'atk', 'bow', N.bow, 6],
    ['lộn né (dodge, ngang)', 'dodge', 'sword', 8, 2],
    ['trúng đòn (hurt)', 'hurt', 'sword', 1, 0],
    ['ngã (die)', 'die', null, 8, 0],
  ];
  const cols = Math.max(...rows.map(r => r[3]));
  const sheet = document.createElement('canvas'); sheet.width = cols * CW; sheet.height = rows.length * CH;
  const sc = sheet.getContext('2d'); sc.imageSmoothingEnabled = false;
  const meta = [];
  rows.forEach((r, ri) => {
    let bb = null;
    for (let f = 0; f < r[3]; f++) {
      const cv = __cell(CW, CH, (c) => G.art.hero(c, { x: OX, y: OY, face: 1, key, t: 0, anim: r[1], f, v: r[4], weapon: W(r[2]), atk: -1, dodge: -1, noShadow: true }));
      const b = __bbox(cv); if (b) bb = bb ? { x0: Math.min(bb.x0, b.x0), y0: Math.min(bb.y0, b.y0), x1: Math.max(bb.x1, b.x1), y1: Math.max(bb.y1, b.y1) } : b;
      sc.drawImage(cv, f * CW, ri * CH);
    }
    meta.push({ hang: ri, nhan: r[0], anim: r[1], vu_khi: r[2], so_khung: r[3], bien_the: r[4],
      hop_bao_tu_chan: bb ? { trai: bb.x0 - OX, tren: bb.y0 - OY, phai: bb.x1 - OX, duoi: bb.y1 - OY, rong: bb.x1 - bb.x0 + 1, cao: bb.y1 - bb.y0 + 1 } : null });
  });
  const idle = __cell(CW, CH, (c) => G.art.hero(c, { x: OX, y: OY, face: 1, key, t: 0, anim: 'idle', f: 0, v: 0, weapon: null, atk: -1, dodge: -1, noShadow: true }));
  return { url: sheet.toDataURL('image/png'), meta, cols, idle_bbox: __bbox(idle), colors: __colors(idle), ten: G.tinhLinh.HERO[key] && (G.tinhLinh.HERO[key].name || G.tinhLinh.HERO[key].ten) };
}"""

JS_WEAPON = r"""([CW, CH, GX, GY]) => {
  const WA = G.weaponArt, types = ['sword', 'bow', 'spear', 'hammer'];
  const sheet = document.createElement('canvas'); sheet.width = 10 * CW; sheet.height = 4 * CH; const sc = sheet.getContext('2d'); sc.imageSmoothingEnabled = false;
  const meta = [];
  types.forEach((t, ri) => { for (let f = 0; f < 10; f++) {
    const o = { type: t, family: f, branch: null, stage: 0, rarity: 0 };
    const cv = __cell(CW, CH, (c) => WA.draw(c, o, GX, GY, 0, 0));
    sc.drawImage(cv, f * CW, ri * CH);
    const s = WA.size(o);
    meta.push({ loai: t, dong: f, ten: WA.familyName(t, f), co_dung_nghi: { rong: s.w, cao: s.h, dai_than: s.len }, mui_cach_diem_cam: WA.tipLen(o), hop_bao_ngang: __bbox(cv) });
  } });
  // Hàng thêm: Kiếm Rèn qua 3 nhánh mốc 3, và 4 bậc hiếm
  const ex = [];
  for (const br of (WA.BRANCHES || ['fire', 'poison', 'ice'])) ex.push({ type: 'sword', family: 0, branch: br, stage: 3, rarity: 0 });
  for (let r = 0; r < 4; r++) ex.push({ type: 'sword', family: 0, branch: null, stage: 0, rarity: r });
  const s2 = document.createElement('canvas'); s2.width = ex.length * CW; s2.height = CH; const c2 = s2.getContext('2d');
  ex.forEach((o, i) => c2.drawImage(__cell(CW, CH, (c) => WA.draw(c, o, GX, GY, 0, 0)), i * CW, 0));
  return { url: sheet.toDataURL('image/png'), url2: s2.toDataURL('image/png'), meta, ex: ex.map(o => WA.fullName(o)) };
}"""

JS_MOB = r"""([ids, cols]) => {
  const MA = G.monsterArt, info = (id) => MA.list.find(q => q.id === id);
  const sample = (id, a, u) => { const d = MA.dur(id, a) || MA.dur(id, 'idle'); return { anim: MA.dur(id, a) ? a : 'idle', t: u * d }; };
  const rowsH = ids.map(id => info(id).h + 34), CW = Math.max(...ids.map(id => info(id).w)) + 30;
  const sheet = document.createElement('canvas'); sheet.width = cols.length * CW; sheet.height = rowsH.reduce((a, b) => a + b, 0);
  const sc = sheet.getContext('2d'); sc.imageSmoothingEnabled = false;
  let y = 0; const meta = [];
  ids.forEach((id, ri) => { const q = info(id), H = rowsH[ri]; const anims = {};
    for (const k of Object.keys(q.anims || {})) anims[k] = MA.dur(id, k);
    let bb0 = null, colors = null;
    cols.forEach((cl, ci) => { const s = sample(id, cl[0], cl[1]);
      const cv = __cell(CW, H, (c) => MA.draw(c, id, CW / 2, H - 8, { anim: s.anim, t: s.t, face: -1, bao: false }));
      if (ci === 0) { bb0 = __bbox(cv); colors = __colors(cv); }
      sc.drawImage(cv, ci * CW, y); });
    meta.push({ id, ten: q.ten, vung: q.vung, loai: q.loai, bay: !!q.bay, pha: q.pha || 1, khung_luoi: { rong: q.w, cao: q.h }, cao_ve: MA.cao(id),
      hop_bao_idle_t0: bb0 ? { rong: bb0.w, cao: bb0.h } : null, mau_chinh: colors, dong_tac_giay: anims, hang_y: y, hang_cao: H });
    y += H; });
  return { url: sheet.toDataURL('image/png'), meta, CW };
}"""

JS_BOSS = r"""([id, cols, phases, scale]) => {
  const MA = G.monsterArt, q = MA.list.find(x => x.id === id);
  const CW = Math.round(q.w * (phases.length > 2 && id === 'hoTinh' ? 1.7 : 1.15)) + 20, H = Math.round(q.h * (id === 'hoTinh' ? 1.55 : 1.25)) + 30;
  const sheet = document.createElement('canvas'); sheet.width = cols.length * CW; sheet.height = phases.length * H;
  const sc = sheet.getContext('2d'); sc.imageSmoothingEnabled = false; const meta = [];
  phases.forEach((ph, ri) => cols.forEach((cl, ci) => { const d = MA.dur(id, cl[0]) || MA.dur(id, 'idle');
    const cv = __cell(CW, H, (c) => MA.draw(c, id, CW / 2, H - 10, { anim: MA.dur(id, cl[0]) ? cl[0] : 'idle', t: cl[1] * d, face: -1, phase: ph, bao: false }));
    const b = __bbox(cv); meta.push({ pha: ph, anim: cl[0], u: cl[1], hop_bao: b ? { rong: b.w, cao: b.h } : null });
    sc.drawImage(cv, ci * CW, ri * H); }));
  const anims = {}; for (const k of Object.keys(q.anims || {})) anims[k] = MA.dur(id, k);
  return { url: sheet.toDataURL('image/png'), meta, CW, H, ten: q.ten, khung_luoi: { rong: q.w, cao: q.h }, dong_tac_giay: anims };
}"""

MOB_COLS = [('idle', 0), ('idle', 0.5), ('move', 0), ('move', 0.5), ('tele', 0.6), ('atk', 0.2), ('atk', 0.45), ('hit', 0.1), ('die', 0.35), ('die', 0.75)]
BOSS_COLS = [('idle', 0), ('move', 0.5), ('c1', 0.5), ('c2', 0.5), ('c3', 0.5), ('hit', 0.2), ('stun', 0.3), ('die', 0.5)]
REGION_IDS = {
    'rung': ['heoCon', 'ongVo', 'boHung', 'hoaBaoTu', 'chonBong', 'namPhong', 'socNo', 'nhimDoc', 'heoNanh', 'namPhongChua', 'namChua'],
    'bien': ['cua', 'caCon', 'oc', 'haiQuy', 'caChuon', 'caNoc', 'sua', 'nhim', 'cuaTuong', 'caNocChua', 'cuaDa'],
    'laudai': ['linhMa', 'doiThan', 'tuongDa', 'denLong', 'meoDen', 'huLua', 'tieuYeu', 'nhimThan', 'tuongMa', 'huChua', 'hoLua'],
}
BOSSES = ['mocTinh', 'nguTinh', 'hoTinh']

# ---------- JS: cảnh trong game 480x270 ----------
JS_SCENE_SPAWN = r"""([r, mode]) => {
  const ROLES = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky'];
  const { S, W, P } = T.room(r, 2, { seed: 7 });
  const g = W.geo || { x0: 136, x1: 344, y0: 56, y1: 252 };
  if (mode === 'quai') {
    ROLES.forEach((ro, i) => G.spawnEnemy(ro, 160 + (i % 4) * 50, 120 + Math.floor(i / 4) * 60, { art: G.MOB_ART[ro][r] }));
    G.spawnEnemy('elite', 300, 210, { art: G.MOB_ART.elite[r][0] });
  }
  if (mode === 'dong') {
    for (let k = 0; k < 12; k++) { const ro = ROLES[k % 8]; G.spawnEnemy(ro, 160 + (k % 6) * 30, 100 + Math.floor(k / 6) * 70, { art: G.MOB_ART[ro][r], hpMult: 50 }); }
  }
  return { geo: W.geo || null, region: G.REGIONS[r].name };
}"""


def world(pg):
    return pg.evaluate("G.wx.canvas.toDataURL('image/png')")


def full(pg):
    el = pg.query_selector('#stage') or pg.query_selector('#world')
    return Image.open(io.BytesIO(el.screenshot())).convert('RGBA')


def main():
    os.makedirs(OUT, exist_ok=True)
    meas = {'ghi_chu': 'Số đo bằng cách vẽ hàm thật của game lên canvas trong suốt và đếm điểm ảnh có alpha>8. Đơn vị: điểm ảnh thế giới (1 px = 1 px của lớp 480x270).'}
    files = []
    with sync_playwright() as pw:
        b, pg, errs = open_page(pw, 992, 540)
        pg.evaluate(JS_COMMON)
        pg.evaluate("G.wx.imageSmoothingEnabled = false")
        # 1) Em bé
        CW, CH, OX, OY = 96, 80, 44, 66
        meas['em_be'] = {'o_ve': {'rong': CW, 'cao': CH, 'goc_chan_x': OX, 'goc_chan_y': OY}}
        for key in ['smith', 'hunter', 'healer', 'wrestler']:
            r = pg.evaluate(JS_HERO, [key, CW, CH, OX, OY])
            files += save(r['url'], f'em_be/{key}_sheet.png', (1, 4))
            meas['em_be'][key] = {'ten': r['ten'], 'hop_bao_idle_khung0': r['idle_bbox'], 'mau_chinh_idle': r['colors'], 'hang': r['meta'], 'so_cot': r['cols']}
        # 2) Vũ khí
        r = pg.evaluate(JS_WEAPON, [96, 56, 24, 28])
        files += save(r['url'], 'vu_khi/vu_khi_40_dong_sheet.png', (1, 4))
        files += save(r['url2'], 'vu_khi/kiem_ren_nhanh_va_bac.png', (1, 4))
        meas['vu_khi'] = {'o_ve': {'rong': 96, 'cao': 56, 'diem_cam': [24, 28], 'goc': 0}, 'dong': r['meta'], 'hang_them': r['ex']}
        # 3) Quái theo vùng
        meas['quai'] = {'cot': MOB_COLS}
        for vung, ids in REGION_IDS.items():
            r = pg.evaluate(JS_MOB, [ids, MOB_COLS])
            files += save(r['url'], f'quai/{vung}_sheet.png', (1, 3))
            meas['quai'][vung] = {'o_rong': r['CW'], 'con': r['meta']}
        # 4) Trùm
        meas['trum'] = {'cot': BOSS_COLS}
        for bid in BOSSES:
            r = pg.evaluate(JS_BOSS, [bid, BOSS_COLS, [1, 2, 3], 1])
            files += save(r['url'], f'trum/{bid}_sheet.png', (1, 2))
            meas['trum'][bid] = {'ten': r['ten'], 'khung_luoi': r['khung_luoi'], 'o': [r['CW'], r['H']], 'dong_tac_giay': r['dong_tac_giay'], 'mau': r['meta']}
        # 5) Cảnh trong game (đúng 480x270)
        meas['canh'] = []
        for ri, vung in enumerate(['rung', 'bien', 'laudai']):
            info = pg.evaluate(JS_SCENE_SPAWN, [ri, 'trong'])
            pg.evaluate("T.frame(20)")
            files += save(world(pg), f'canh/{vung}_phong_trong_480x270.png', (1, 3))
            pg.evaluate(JS_SCENE_SPAWN, [ri, 'quai'])
            pg.evaluate("T.frame(40)")
            files += save(world(pg), f'canh/{vung}_phong_co_quai_480x270.png', (1, 3))
            files += save(full(pg), f'canh/{vung}_phong_co_quai_kem_giao_dien.png')
            pg.evaluate(f"T.boss({ri}, true); T.sim(200, true); T.frame(30)")
            files += save(world(pg), f'canh/{vung}_phong_trum_480x270.png', (1, 3))
            files += save(full(pg), f'canh/{vung}_phong_trum_kem_giao_dien.png')
            meas['canh'].append({'vung': vung, 'ten': info['region'], 'geo': info['geo']})
        # 6) Cảnh đông, nhiều hiệu ứng (P0): Lâu đài cổ, 12 quái, bot tự đánh
        pg.evaluate(JS_SCENE_SPAWN, [2, 'dong'])
        pg.evaluate("T.useBot(true); (()=>{const S=G.getRun(); if(S&&S.P){S.P.hp=S.P.maxhp;}})()")
        for i, n in enumerate([60, 45, 45]):
            pg.evaluate(f"(()=>{{for(let k=0;k<{n};k++){{T.frame(1); const S=G.getRun(); if(S&&S.P){{S.P.hp=S.P.maxhp; S.P.dead=false; if(S.W) S.W.over=null;}}}}}})()")
            files += save(world(pg), f'canh/hieu_ung_dong_{i + 1}_480x270.png', (1, 3))
            files += save(full(pg), f'canh/hieu_ung_dong_{i + 1}_kem_giao_dien.png')
        pg.evaluate("T.useBot(false)")
        b.close()
        meas['loi_trang'] = errs[:20]
    json.dump(meas, open(os.path.join(OUT, 'do_dac.json'), 'w'), ensure_ascii=False, indent=1)
    print('\n'.join(files))
    print('lỗi:', errs[:10])


if __name__ == '__main__':
    main()
