"""CÂN BẰNG PHẢI CÀY (hệ thống mới, đợt 5): bot chơi chiến dịch 15 ải từ bản lưu mới như một người chơi bình thường, nhiều lượt,
và in bảng từng ải. Luật chơi của bot: tests/cd_lib.py (chọn ải, cày) + tests/bot_nang.js (nâng cấp ở làng).

Cách bot chơi (mỗi lượt):
  - Cây chưởng: lượt chiến dịch 1, 4, 7... dùng Hỏa chưởng; 2, 5, 8... Độc chưởng; 3, 6, 9... Băng chưởng. Học hết điểm chưởng mỗi lần về làng.
  - Ở làng: 4 vũ khí cố định, bot dùng Kiếm (chính) + Phi tiêu (phụ); nâng bằng linh khí, lên Mầm chọn hệ hợp vùng; nâng bộ trang phục
    (linh khí + vàng + mảnh trùm); học kỹ năng, mài, nâng lò (G.upg.auto). Không rơi đồ, không quần áo cũ.
  - Kiểu "khuyen" (mặc định): Sức mạnh chưa đủ "khuyên dùng" của ải kế thì chơi lại ải mới nhất đã qua để cày (tối đa 8 lượt liền;
    cày 3 lượt mà Sức mạnh không tăng thì thử luôn), đủ thì vào ải mới. Thua thì chơi lại ải cũ một lượt rồi mới thử lại.
  - Kiểu "lieu": không nhìn lời khuyên, cứ vào ải mới; thua thì chơi lại ải cũ một lượt rồi thử lại.
Số lần chơi của một ải = mọi lượt (kể cả chơi lại ải cũ và lượt thua) từ lúc qua ải trước cho tới lúc qua ải đó.

Chạy: python3 tests/cay.py [số lượt chiến dịch, mặc định 12] [khuyen|lieu] [-v: in từng lượt] [--nhanh: chỉ vùng 1]
      [--node: chạy luật game trong Node (tests/node_trang.js), không trình duyệt / Playwright]
      [--vk=kiem|thuong|bua: món chính của bot (phụ luôn là phi tiêu)] [--ngay=K: K lượt ải thường mỗi ngày giả, rồi chơi ải ngày; 0 tắt]
      [--kho2: qua 15 ải rồi chơi tiếp 15 ải độ khó 2; với --kd đo cả Sức mạnh khuyên dùng độ khó 2 (G.stageRec(r, i, 1), G.DIFF2)]
      [--kd=R: đo lại Sức mạnh khuyên dùng — mỗi bản lưu lúc vừa tới một ải (của kiểu khuyen và kiểu lieu) chơi lại ải đó R lần,
       tìm Sức mạnh mà bot thắng 75%] [--json=tệp: ghi số liệu thô] [--pre=<mã JS>: chạy trước khi đo, thử số trong bộ nhớ]
      [--viec: mỗi lần về làng bot bấm Nhận hết Việc hôm nay / Sổ yêu quái / Thành tựu (Bước 2), in thu nhập mỗi ngày giả]
Thoát mã 1 nếu: có luật hỏng, có lượt chiến dịch bị kẹt, có ải trung bình phải chơi quá 9 lần (8 lượt cày + 1 lượt thử), có lỗi trang."""
import sys, json, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cd_lib
# sua-mat-bac-ep (bao-cao-B mục 7, đề xuất 1b): bản lưu (tests/cay_luu.json, bản tạm --luu) không có cờ canLai → G.fixSave chạy VM.canLai.
# Mọi chỗ nạp bản lưu dưới đây đặt cờ trước G.fixSave để nạp đúng bản bot đã chơi (bản đã theo luật hiện hành, không cần cân lại).
from cd_lib import ten

# Mục tiêu tham khảo (số lần chơi trung bình mỗi ải) từ các phiên cân bằng trước; đợt 5 chỉ BẮT BUỘC "không ải nào quá ~8 lượt cày".
def muc_tieu(k):
    r, i = divmod(k, 5)
    if r == 0:
        return (1, 2.5) if i < 4 else (3, 9)
    if i == 4:
        return (3, 9)
    return (1, 5.5)

LUAT = r"""
() => {
  const out = [];
  const ok = (c, m) => out.push([!!c, m]);
  const VM = G.vkMoi;
  G.resetSave(); G.save.sound = false;
  ok(G.power() >= 95 && G.power() <= 105, 'Zed mới (cấp 1, 4 vũ khí Trắng +0) có Sức mạnh khoảng 100: ' + G.power());
  ok(G.save.weapons.length === 4 && G.save.carry.length === 4 && G.save.weapons.every((w) => G.wStage(w) === 0 && w.rarity === 0), 'bản lưu mới: đúng 4 vũ khí Trắng, không bậc màu');
  let mono = true; for (let k = 1; k < 15; k++) if (G.STAGE_REC[k] <= G.STAGE_REC[k - 1]) mono = false;
  ok(mono, 'Sức mạnh khuyên dùng tăng dần qua 15 ải: ' + G.STAGE_REC.join(' '));
  ok(G.stageRec(2, 4, 1) > G.stageRec(2, 4, 0), 'độ khó thứ hai cần Sức mạnh cao hơn');
  ok(G.grindMult(100, 100) === 1 && G.grindMult(130, 100) === 1 && G.grindMult(160, 100) < 1 && G.grindMult(400, 100) === 0.4, 'thưởng khi cày: đủ khi chưa quá 130%, giảm dần, thấp nhất 40%');
  // Sức mạnh tăng theo cấp, mài, cấp vũ khí (linh khí)
  // 16/10 Luyện vũ khí (js/luyen.js, mặc định bật; ?luyen=0 luật cũ): Sức mạnh tăng theo cấp, Luyện 2, Luyện 3 (Mầm, chọn hệ)
  const LY = !!(G.luyen && G.luyen.bat());
  const p0 = G.power(); G.save.heroes.smith.lvl = 10; const p1 = G.power();
  const w = G.weaponById(G.save.carry[0]);
  if (LY) {
    const sv0 = G.save; sv0.gold = 250; sv0.linhKhi = 90; sv0.nlr = 15; sv0.mats = [4, 0, 0];
    G.luyen.nang(sv0, w); const p2 = G.power(); G.luyen.nang(sv0, w, 'fire'); const p3 = G.power();
    ok(p1 > p0 && p2 > p1 && p3 > p2 && sv0.gold === 0 && sv0.linhKhi === 0 && sv0.nlr === 0 && sv0.mats[0] === 0 && G.luyen.cap(w) === 3 && G.wStage(w) === 1 && w.branch === 'fire', 'Sức mạnh tăng theo cấp, Luyện 2, Luyện 3 (Mầm, hệ Lửa) đúng giá bảng G.LUYEN: ' + [p0, p1, p2, p3].join(' < '));
  } else {
  w.sharpen = 3; const p2 = G.power();
  G.save.linhKhi = 100; VM.nang(G.save, w, 'fire'); const p3 = G.power();
  ok(p1 > p0 && p2 > p1 && p3 > p2 && G.save.linhKhi === 0 && G.wStage(w) === 1 && w.branch === 'fire', 'Sức mạnh tăng theo cấp, mài, nâng Mầm bằng 100 linh khí: ' + [p0, p1, p2, p3].join(' < '));
  }
  // không còn "Quyết tâm"
  G.resetSave(); G.save.sound = false; G.save.tut.done = true;
  const P0 = G.buildPlayer(), pw0 = G.power();
  for (let k = 0; k < 4; k++) { G.startStage(0, 1, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120); }
  G.startStage(0, 1, 0); const S = G.getRun();
  ok(G.save.grit === undefined && S.P.maxhp === P0.maxhp && S.power === pw0, 'thua 4 lần liền: không quyết tâm, máu ' + S.P.maxhp + ', Sức mạnh ' + S.power + ' như cũ');
  S.quit = true; G.finishStage(false);
  ok(G.save.weapons.length === 4, 'sau các lượt thua vẫn đúng 4 vũ khí (không rơi đồ)');
  // trần: cấp 40, mài +15 (lò 4)
  ok(G.MAX_LEVEL === 40 && G.MAX_SHARPEN === 15 && G.FORGE_CAP[G.FORGE_CAP.length - 1] === 15, 'trần: cấp 40, mài +15 với lò cấp 4');
  // trần cuối game (chỉ đồ cày được) vẫn vượt khuyên dùng Hồ Tinh
  G.resetSave(); G.save.tut.done = true;
  const sv = G.save, hs = sv.heroes.smith;
  hs.lvl = 40; hs.sk = { atk: 5, def: 5, elem: 3 }; sv.forge = 4;
  if (G.chuong) G.chuong.autoLearn(hs, 'smith');
  for (const t of ['sword', 'bow']) { const x = sv.weapons.find((q) => q.type === t); x.sharpen = 15; VM.datCap(x, 3, t === 'sword' ? 'fire' : 'ice'); if (LY) { x.luyen = 12; G.luyen.dongBo(x); } }
  const top0 = G.power();
  // 14/10 (bước 1, mục 5): trần tính cả ép đồ (đá nâng bậc rơi từ trùm + Ải Đá Bậc): hai món bậc Vàng (bot qua 3-5 thường đã có Vàng / Tím)
  if (G.epDo && !LY) for (const t of ['sword', 'bow']) { const x = sv.weapons.find((q) => q.type === t); x.ep = { b: 4, d: [], may: {} }; }
  if (LY) for (const t of ['sword', 'bow']) { const x = sv.weapons.find((q) => q.type === t); x.luyen = 13; } // Luyện: trần sau Hồ Tinh (G.LUYEN.tran[3]) ≈ Thức tỉnh +15 bậc Vàng
  const top = G.power(), need = G.STAGE_REC[14];
  ok(top >= need * 1.15, LY ? 'trần trước Hồ Tinh (cấp 40, kiếm + phi tiêu Luyện 13, cây chưởng đầy): Sức mạnh ' + top + ' (Luyện 12: ' + top0 + ') >= 1,15 x khuyên dùng Hồ Tinh ' + need : 'trần trước Hồ Tinh (cấp 40, kiếm + phi tiêu Thức tỉnh +15 bậc ép Vàng, cây chưởng đầy): Sức mạnh ' + top + ' (chưa ép ' + top0 + ') >= 1,15 x khuyên dùng Hồ Tinh ' + need);
  // cây chưởng đã đầy: không gợi ý / không "học" mãi điểm thừa (G.upg.auto vẫn làm việc khác)
  ok(!G.upg.list(sv).some((q) => q.kind === 'chuong'), 'cây chưởng đã học hết nút: không còn mục "điểm chưởng chưa học" (cấp 40 > tổng bậc của cây)');
  sv.gold = 5000; sv.ore = 200; sv.nlr = 200; sv.linhKhi = 1000; sv.mats = [50, 50, 50]; sv.shards = sv.shards.map(() => 5); const xw = sv.weapons.find((q) => q.type === 'sword'); xw.sharpen = 10;
  if (LY) { xw.luyen = 9; for (let r = 0; r < 3; r++) sv.stars[r + '-4'] = 3; }
  const d0 = G.upg.auto(sv);
  ok(LY ? G.luyen.cap(xw) > 9 : xw.sharpen > 10, LY ? 'cây chưởng đầy mà G.upg.auto vẫn luyện tiếp: ' + d0.slice(0, 3).join('; ') : 'cây chưởng đầy mà G.upg.auto vẫn mài tiếp: ' + d0.slice(0, 3).join('; '));
  // GỢI Ý Ở BẢNG THUA
  G.resetSave(); G.save.tut.done = true;
  const s2 = G.save; s2.heroes.smith.lvl = 7; s2.gold = 120; s2.ore = 3; s2.mats = [2, 0, 0]; s2.stars = { '0-0': 3, '0-1': 2, '0-2': 2, '0-3': 1 };
  G.startStage(0, 4, 0); G.getRun().P.hp = 0; G.getRun().W.over = 'dead'; G.sim(120);
  const T = G.getRun().result.tips;
  ok(T && T.tips.length >= 2 && T.tips.length <= 3, 'bảng thua có 2-3 gợi ý: ' + (T ? T.tips.map((t) => t.text + ' (' + t.sub + ')').join(' | ') : 'không có'));
  ok(T && T.tips[0].kind === 'skill', 'còn điểm kỹ năng thì gợi ý học trước tiên');
  ok(T && T.tips.every((t) => (t.gain > 0 || t.kind === 'skill' || t.kind === 'chuong') && t.go && (t.go.who || t.go.weapon != null)), 'gợi ý nào cũng tăng Sức mạnh (hoặc là điểm chưa học) và có chỗ để đi tới');
  G.villageApi && G.setScene(G.Village); G.villageApi && G.villageApi.goHub && G.villageApi.goHub();
  // bot nâng cấp tự động chỉ tiêu tài nguyên đang có, không bao giờ âm; nâng bằng linh khí chọn hệ của G.upg.heMam
  G.resetSave(); const s5 = G.save; s5.heroes.smith.lvl = 9; s5.gold = 2000; s5.ore = 40; s5.nlr = 40; s5.mats = [30, 10, 0]; s5.linhKhi = 150;
  const pb = G.power(), did = G.upg.auto(s5), pa = G.power();
  ok(pa > pb && s5.gold >= 0 && s5.ore >= 0 && (s5.nlr | 0) >= 0 && s5.mats.every((x) => x >= 0) && VM.lk(s5) >= 0 && s5.weapons.some((x) => G.wStage(x) === 1), 'nâng cấp tự động: Sức mạnh ' + pb + ' -> ' + pa + ' sau ' + did.length + ' việc, có nâng Mầm, không tiêu quá số có');
  // nâng bộ: cấp 2 cần mảnh trùm
  G.resetSave(); const s6 = G.save; s6.linhKhi = 1000; s6.gold = 5000;
  const b1 = VM.nangBo(s6, 'ninja'), b2why = VM.boDuoc(s6, 'ninja'); s6.shards[0] = 3; const b2 = VM.nangBo(s6, 'ninja');
  ok(b1 && b2why === 'Thiếu mảnh trùm' && b2 && VM.boCap(s6, 'ninja') === 2 && s6.shards[0] === 0, 'nâng bộ Ninja: cấp 1 không cần mảnh, cấp 2 cần 3 mảnh Mộc Tinh');
  G.resetSave();
  return out;
}
"""


def fit75(pts):
    """pts: [(Sức mạnh, số thắng, số lần)]. Hồi quy logistic thắng ~ Sức mạnh (thang log); trả về Sức mạnh thắng 75% (None nếu không tìm được)."""
    if not pts:
        return None, None
    xs = [math.log(p) for p, _, _ in pts]
    mx = sum(xs) / len(xs)
    best = None
    for a10 in range(-60, 61):
        a = a10 / 10.0
        for b in [x * 0.5 for x in range(1, 121)]:
            ll = 0
            for (p, wn, n), x in zip(pts, xs):
                z = a + b * (x - mx)
                q = 1 / (1 + math.exp(-max(-30, min(30, z))))
                q = min(1 - 1e-6, max(1e-6, q))
                ll += wn * math.log(q) + (n - wn) * math.log(1 - q)
            if best is None or ll > best[0]:
                best = (ll, a, b)
    _, a, b = best
    x75 = mx + (math.log(3) - a) / b
    return math.exp(x75), b


VIEC_JS = r"""
  G.botB2 = { vang: 0, quang: 0, lk: 0, da: 0, bua: 0, viecVang: 0, soVang: 0, ttVang: 0, ruong: 0, tuan: 0 };
  G.botThu = { da: 0, bua: 0 };
  if (G.epDo && !G.epDo._botDem) {
    const d0 = G.epDo.themDa, b0 = G.epDo.themBua;
    G.epDo.themDa = function (sv, n) { if (n > 0) G.botThu.da += Math.round(n); return d0.apply(this, arguments); };
    G.epDo.themBua = function (sv, n) { if (n > 0) G.botThu.bua += Math.round(n); return b0.apply(this, arguments); };
    G.epDo._botDem = 1;
  }
  if (!G.botNang._viec) {
    const goc = G.botNang;
    let quenCu = null;
    const chup = (sv) => ({ vang: +sv.gold || 0, quang: +sv.ore || 0, lk: G.vkMoi.lk(sv), da: G.epDo ? G.epDo.da(sv) : 0, bua: G.epDo ? G.epDo.bua(sv) : 0 });
    const cong = (a, b, k) => { const B = G.botB2; for (const x of ['vang', 'quang', 'lk', 'da', 'bua']) B[x] += b[x] - a[x]; if (k) B[k] += b.vang - a.vang; };
    G.botNang = function () {
      const sv = G.save;
      try {
        const VN = G.viecNgay, Y = G.soYQ, TT = G.thanhTuu;
        if (VN && VN.mo && VN.mo(sv)) {
          const o = VN.capNhat(sv);
          if (o && o.quen && o.quen !== quenCu) { quenCu = o.quen; const q = o.quen, B = G.botB2; B.vang += q.v | 0; B.viecVang += q.v | 0; B.quang += q.q | 0; B.lk += q.lk | 0; B.da += q.da | 0; B.bua += q.bua | 0; }
          const a = chup(sv);
          for (let i = 0; i < 3; i++) VN.nhan(i, sv);
          if (VN.moRuong(sv)) G.botB2.ruong++;
          if (VN.moTuan(sv)) G.botB2.tuan++;
          cong(a, chup(sv), 'viecVang');
        }
        if (Y && Y.bat && Y.bat()) { const a = chup(sv); Y.nhanHet(sv); cong(a, chup(sv), 'soVang'); }
        if (TT && TT.bat && TT.bat()) { const a = chup(sv); TT.kiem(sv); for (const m of TT.choNhan(sv)) TT.nhan(m, sv); cong(a, chup(sv), 'ttVang'); }
      } catch (e) { G.botB2.loi = String(e); }
      return goc.apply(this, arguments);
    };
    G.botNang._viec = 1;
  }
"""


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    n = int(args[0]) if args else 12
    mode = args[1] if len(args) > 1 else 'khuyen'
    upto = 5 if '--nhanh' in sys.argv else 15
    kd = [int(a.split('=', 1)[1]) for a in sys.argv if a.startswith('--kd=')]
    jout = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--json=')]
    vk = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--vk=')]
    chinh = cd_lib.VK.get(vk[0], vk[0]) if vk else 'sword'
    ng = [int(a.split('=', 1)[1]) for a in sys.argv if a.startswith('--ngay=')]
    ngay = ng[0] if ng else cd_lib.NGAY
    kho2 = '--kho2' in sys.argv
    saves2 = {} if kd and kho2 else None
    # 14/10 (bước 1, mục 5): --luu=tệp → ghi bản lưu thật mỗi ải (lần thử đầu, Sức mạnh gần khuyên dùng nhất) cho tests/balance.py (cay_luu.json)
    luu = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--luu=')]
    errs = []
    runs = []
    saves = {} if kd else None
    if luu and saves is None:
        saves = {}
    bad = 0
    with cd_lib.trinh_duyet() as p:
        b = p.chromium.launch()
        pre = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--pre=')]  # 15/10 kiem-can-bang C: --pre=<mã JS> thử số trong bộ nhớ (không sửa game)
        # 15/10 Bước 2 Phiên E: --viec → mỗi lần về làng (trước G.botNang) bot bấm Nhận hết Việc hôm nay (việc, rương ngày, rương tuần),
        # Sổ yêu quái (G.soYQ.nhanHet) và Thành tựu; G.botB2 cộng phần thưởng ba hệ (kể cả "quên nhận → hôm sau tự cộng"), G.botThu đếm mọi đá / bùa.
        if '--viec' in sys.argv:
            pre = [(pre[0] + '; ' if pre else '') + VIEC_JS]
        pg = cd_lib.open_page(b, errs, '() => { ' + pre[0] + '; return 1; }' if pre else None)
        bad_luat = 0
        for good, msg in pg.evaluate(LUAT):
            print(('đạt ' if good else 'HỎNG ') + msg)
            bad_luat += 0 if good else 1
        if bad_luat:
            print('SAI: %d luật hỏng' % bad_luat); bad = 1
        modes = [mode] * n
        if kd and mode == 'khuyen':
            modes += ['lieu'] * n  # thêm bản lưu ở Sức mạnh thấp hơn để đo đường thắng/thua
        for k, md in enumerate(modes):
            pg.evaluate("() => { if (G.botB2) for (const x in G.botB2) G.botB2[x] = 0; if (G.botThu) G.botThu.da = G.botThu.bua = 0; return 1; }")
            out, why = cd_lib.campaign(pg, md, upto, cd_lib.CAY[k % 3], saves, chinh=chinh, ngay=ngay, kho2=kho2 and md == mode, saves2=saves2,
                                       guard_max=440 if kho2 else 220)
            if out:
                out['b2'] = pg.evaluate("() => G.botB2 ? Object.assign({}, G.botB2) : null")
                out['thu'] = pg.evaluate("() => G.botThu ? Object.assign({}, G.botThu) : null")
            if md != mode:
                print(f'(lượt {k+1}, kiểu {md}: chỉ lấy bản lưu để đo khuyên dùng){" — " + why if why else ""}')
                continue
            if not out:
                print('Lượt', k + 1, 'không xong:', why)
                if '-v' in sys.argv: print('\n'.join(cd_lib.campaign.last['log']))
                runs.append(None); continue
            runs.append(out)
            if '-v' in sys.argv:
                print('\n'.join(out['log']))
            print(f"lượt {k+1} ({cd_lib.CAY[k % 3]}): {out['t']/60:.0f} phút, {sum(s['plays'] for s in out['st'])} lần chơi | " + ' '.join(str(s['plays']) for s in out['st'][:upto]))
            sys.stdout.flush()
        if luu:
            ds = []
            for k in range(15):
                rec = pg.evaluate('(k) => G.STAGE_REC[k]', k)
                cand = [(abs(pg.evaluate("(s) => { const o = JSON.parse(s); o.canLai = G.SAVE_CAN_LAI || 1; G.save = G.fixSave(o); return G.power(); }", x) - rec), x) for x in (saves or {}).get(k, [])]
                ds.append(min(cand, key=lambda q: q[0])[1] if cand else None)
            json.dump(ds, open(luu[0], 'w'), ensure_ascii=False)
            print('Đã ghi bản lưu cho balance.py:', luu[0], sum(1 for x in ds if x), 'ải')
        kd_res = {}
        for diff, sv_ds in ((0, saves), (1, saves2)):
          if not kd or sv_ds is None:
            continue
          R = kd[0]
          print(f'\nĐo khuyên dùng{" ĐỘ KHÓ 2" if diff else ""}: mỗi bản lưu lúc vừa tới ải chơi lại ải đó {R} lần (không nâng cấp thêm)')
          pool = None
          if diff:
              # 14/10: bot tới độ khó 2 đã dư sức (vừa xong 15 ải thường), nên lấy thêm bản lưu ở MỌI mốc của lượt chiến dịch (cả ải thường)
              # và chọn 8 bản có Sức mạnh gần khuyên dùng độ khó 2 nhất (4 dưới, 4 trên nếu có) để thấy được đường thắng / thua.
              allsv = [x for d in (saves or {}, saves2 or {}) for ds in d.values() for x in ds]
              pool = sorted(((pg.evaluate("(s) => { const o = JSON.parse(s); o.canLai = G.SAVE_CAN_LAI || 1; G.save = G.fixSave(o); G.save.sound = false; return G.power(); }", x), x) for x in allsv), key=lambda q: q[0])
          for k in sorted(sv_ds):
                ds_k = sv_ds[k]
                if pool:
                    rec2 = pg.evaluate('([r, i, d]) => G.stageRec(r, i, d)', list(divmod(k, 5)) + [1])
                    duoi = [x for pw0, x in pool if pw0 < rec2][-4:]
                    tren = [x for pw0, x in pool if pw0 >= rec2][:4]
                    ds_k = duoi + tren + list(sv_ds[k][:2])
                pts = []
                for sj in ds_k:
                    pw = pg.evaluate("(s) => { const o = JSON.parse(s); o.canLai = G.SAVE_CAN_LAI || 1; G.save = G.fixSave(o); G.save.sound = false; return G.power(); }", sj)
                    wn = 0
                    for _ in range(R):
                        pg.evaluate("(s) => { const o = JSON.parse(s); o.canLai = G.SAVE_CAN_LAI || 1; G.save = G.fixSave(o); G.save.sound = false; }", sj)
                        pg.evaluate("([r, i, d]) => G.startStage(r, i, d)", list(divmod(k, 5)) + [diff])
                        res = pg.evaluate("G.probeRun(900)")
                        wn += 1 if res.get('win') else 0
                    pts.append((pw, wn, R))
                p75, slope = fit75(pts)
                lo = sorted(pts)
                if sum(w for _, w, _ in pts) >= 0.95 * sum(nn for _, _, nn in pts):
                    p75 = None  # thắng gần hết: chỉ biết Sức mạnh 75% thấp hơn bản lưu thấp nhất
                elif p75 is not None and (p75 > lo[-1][0] * 1.25 or p75 < lo[0][0] * 0.75):
                    p75 = -1  # 14/10: đường hồi quy vọt ra ngoài khoảng đo (thua gần hết hoặc dốc phẳng): chỉ biết là cao hơn bản lưu cao nhất
                kd_res[('K2 ' if diff else '') + ten(k)] = {'pts': lo, 'p75': p75}
                print(f"{'K2 ' if diff else ''}{ten(k)}: Sức mạnh 75% ≈ {'<= %d' % lo[0][0] if p75 is None else ('> %d (ngoài khoảng đo)' % lo[-1][0]) if p75 == -1 else '%.0f' % p75} (khuyên dùng hiện {pg.evaluate('([r, i, d]) => G.stageRec(r, i, d)', list(divmod(k, 5)) + [diff])}) | " + ' '.join(f'{p}:{w}/{nn}' for p, w, nn in lo))
                sys.stdout.flush()
        cd_lib.dong(b, pg)
    ok = [r for r in runs if r]
    if len(ok) < n:
        print('SAI: có lượt chiến dịch bị kẹt'); bad = 1
    if jout:
        json.dump({'runs': ok, 'kd': kd_res}, open(jout[0], 'w'), ensure_ascii=False)
    if not ok:
        sys.exit(1)
    m = len(ok)
    med = lambda xs: (sorted(xs)[len(xs) // 2] if len(xs) % 2 else sum(sorted(xs)[len(xs) // 2 - 1:len(xs) // 2 + 1]) / 2)
    print(f"\nKiểu bot: {mode}, {m} lượt chiến dịch. Số lần chơi = mọi lượt (cả chơi lại ải cũ và lượt thua) để qua ải đó.")
    print('| Ải | Lần chơi TB (trung vị) | Lượt cày | Lần thử | Thua | Phút (cả cày) | Giây lượt thắng | Cấp khi qua | Sức mạnh khi qua / khuyên dùng | Máu còn khi thắng | Đòn trùm mạnh nhất (% máu) | Linh khí / lượt | Vàng / lượt | Tham khảo |')
    print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
    for k in range(upto + (15 if kho2 and upto == 15 else 0)):
        avg = lambda key: sum(r['st'][k][key] for r in ok) / m
        lo, hi = muc_tieu(k % 15)
        pl = avg('plays')
        flag = ' ✗' if pl > 9 else ''
        if flag and mode == 'khuyen': bad = 1
        plays = sum(r['st'][k]['plays'] for r in ok)
        hp = [r['st'][k]['hp'] for r in ok if r['st'][k]['hp'] is not None]
        bh = [r['st'][k]['bossHit'] for r in ok if r['st'][k]['bossHit']]
        print(f"| {('K2 ' + ten(k - 15)) if k >= 15 else ten(k)} | {pl:.1f}{flag} ({med([r['st'][k]['plays'] for r in ok]):g}) | {avg('grind'):.1f} | {avg('tries'):.1f} | {avg('fails'):.1f} | {avg('t')/60:.0f} | {avg('tWin'):.0f} | {avg('lvl'):.0f} | {avg('pw'):.0f} / {avg('rec'):.0f} | "
              f"{(sum(hp)/len(hp)*100 if hp else 0):.0f}% | {(max(bh)*100 if bh else 0):.0f}% (TB {(sum(bh)/len(bh)*100 if bh else 0):.0f}%) | "
              f"{sum(r['st'][k]['lk'] for r in ok)/max(1,plays):.0f} | {sum(r['st'][k]['gold'] for r in ok)/max(1,plays):.0f} | {lo:g}-{hi:g} |")
    tt = sum(r['t'] for r in ok) / m / 60
    ts = sorted(r['t'] / 60 for r in ok)
    print(f"Tổng thời gian đi hết {upto} ải lần đầu: trung bình {tt:.0f} phút ({tt/60:.1f} giờ), trung vị {ts[m//2]:.0f}, nhanh nhất {ts[0]:.0f}, lâu nhất {ts[-1]:.0f}; "
          f"{sum(sum(s['plays'] for s in r['st']) for r in ok)/m:.0f} lần chơi")
    an = [r['aiNgay'] for r in ok if r.get('aiNgay')]
    if an and any(a['n'] for a in an):
        nn = sum(a['n'] for a in an)
        print(f"Ải ngày (mỗi {ngay} lượt ải thường = 1 ngày; trung bình mỗi lượt chiến dịch): {sum(r['ngay'] for r in ok)/m:.0f} ngày, {nn/m:.0f} lượt ải ngày, thắng {sum(a['win'] for a in an)*100/max(1,nn):.0f}%, "
              f"+{sum(a['gold'] for a in an)/m:.0f} vàng, +{sum(a['ore'] for a in an)/m:.0f} quặng, +{sum(a['da'] for a in an)/m:.0f} đá nâng bậc, +{sum(a['lk'] for a in an)/m:.0f} linh khí; "
              + ', '.join(f"{kk} {sum(a['loai'].get(kk, [0, 0])[1] for a in an)}/{sum(a['loai'].get(kk, [0, 0])[0] for a in an)}" for kk in ('da', 'mai', 'vang')))
    # 15/10 Bước 2 Phiên E: thu nhập mỗi ngày giả (vàng / linh khí cộng lượt ải thường + ải ngày + ba hệ Bước 2; đá, bùa: mọi nguồn)
    nday = sum(r['ngay'] for r in ok) / m
    if nday:
        g_st = sum(sum(s['gold'] for s in r['st']) for r in ok) / m
        lk_st = sum(sum(s['lk'] for s in r['st']) for r in ok) / m
        g_an = sum(r['aiNgay']['gold'] for r in ok if r.get('aiNgay')) / m
        lk_an = sum(r['aiNgay']['lk'] for r in ok if r.get('aiNgay')) / m
        b2 = [r['b2'] for r in ok if r.get('b2')]
        B = {x: (sum(q.get(x, 0) for q in b2) / m) for x in ('vang', 'quang', 'lk', 'da', 'bua', 'viecVang', 'soVang', 'ttVang', 'ruong', 'tuan')}
        th = [r['thu'] for r in ok if r.get('thu')]
        da_all = sum(q['da'] for q in th) / m if th else 0
        bua_all = sum(q['bua'] for q in th) / m if th else 0
        print(f"Mỗi ngày giả ({nday:.1f} ngày / lượt chiến dịch): vàng {(g_st + g_an + B['vang']) / nday:.0f} (ải {g_st / nday:.0f} + ải ngày {g_an / nday:.0f} + Bước 2 {B['vang'] / nday:.0f}), "
              f"linh khí {(lk_st + lk_an + B['lk']) / nday:.0f} (Bước 2 {B['lk'] / nday:.0f}), đá nâng bậc {da_all / nday:.1f} (Bước 2 {B['da'] / nday:.1f}), bùa {bua_all / nday:.2f} (Bước 2 {B['bua'] / nday:.2f}), "
              f"quặng Bước 2 {B['quang'] / nday:.1f}")
        if b2:
            print(f"Bước 2 cả chiến dịch (TB): {B['vang']:.0f} vàng (việc {B['viecVang']:.0f}, sổ {B['soVang']:.0f}, thành tựu {B['ttVang']:.0f}), {B['quang']:.0f} quặng, {B['lk']:.0f} linh khí, "
                  f"{B['da']:.1f} đá, {B['bua']:.2f} bùa; rương ngày {B['ruong']:.1f}, rương tuần {B['tuan']:.1f}" + (' — LỖI: ' + str([q.get('loi') for q in b2 if q.get('loi')][:1]) if any(q.get('loi') for q in b2) else ''))
    cu = [r['cuoi'] for r in ok if r.get('cuoi')]
    if cu:
        print(f"Lúc qua 3-5 (trung bình): cấp {sum(c['cap'] for c in cu)/len(cu):.0f}, Sức mạnh {sum(c['sm'] for c in cu)/len(cu):.0f}, vàng còn {sum(c['vang'] for c in cu)/len(cu):.0f}, "
              f"linh khí còn {sum(c['lk'] for c in cu)/len(cu):.0f}, quặng {sum(c['quang'] for c in cu)/len(cu):.0f}, nguyên liệu {'/'.join('%.0f' % (sum(c['nl'][i] for c in cu)/len(cu)) for i in range(3))}, "
              f"mảnh {'/'.join('%.1f' % (sum(c['manh'][i] for c in cu)/len(cu)) for i in range(3))}")
    # mốc nâng cấp: ải đang tới lúc đạt (trung vị qua các lượt có đạt)
    keys = []
    for r in ok:
        for kk in r['moc']:
            if kk not in keys: keys.append(kk)
    so = lambda lab: (15 if lab.startswith('K2 ') else 0) + (int(lab[-3]) - 1) * 5 + int(lab[-1]) - 1  # '2-3' → 7, 'K2 1-2' → 16
    ten2 = lambda x: ('K2 ' + ten(x - 15)) if x >= 15 else ten(x)
    order = lambda kk: med([so(r['moc'][kk]) for r in ok if kk in r['moc']])
    print('\nMốc nâng cấp (ải đang tới lúc đủ để nâng; trung vị, số lượt chiến dịch có đạt):')
    for kk in sorted(keys, key=order):
        xs = [so(r['moc'][kk]) for r in ok if kk in r['moc']]
        mm = med(xs)
        print(f"  {kk}: {ten2(int(mm))}{'' if mm == int(mm) else '/' + ten2(int(mm) + 1)} (sớm nhất {ten2(min(xs))}, muộn nhất {ten2(max(xs))}; {len(xs)}/{m} lượt)")
    hurt = {}
    for r in ok:
        for kk, x in r['hurt'].items(): hurt[kk] = hurt.get(kk, 0) + x
    tot = sum(hurt.values()) or 1
    print('Nguồn mất máu:', ', '.join(f"{kk} {x*100/tot:.0f}%" for kk, x in sorted(hurt.items(), key=lambda kv: -kv[1])))
    if errs:
        print('LỖI TRANG:', errs[:3]); bad = 1
    sys.exit(bad)


main()
