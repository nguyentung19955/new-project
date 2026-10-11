# Chèn khối bảng màu + các móc vào 7 trang tools/tach-* (chạy một lần). Mọi chỗ chèn là DÒNG MỚI, trừ BAN_MAU/cauMau của Tách Hiệu Ứng.
import sys, io
R = '../../../../../tools/'
KHOI = open('khoi.js', encoding='utf-8').read()
VIEN_RIENG = "'viền (nếu có) giữ đúng như đã ghi ở trên'"

def chen(s, neo, moi, truoc=False, ten=''):
    """Chèn dòng `moi` sau (hoặc trước) DÒNG duy nhất bắt đầu bằng `neo` (bỏ khoảng trắng đầu)."""
    ds = s.split('\n'); idx = [i for i, d in enumerate(ds) if d.lstrip().startswith(neo)]
    assert len(idx) == 1, (ten, neo, len(idx))
    i = idx[0]; thut = ds[i][:len(ds[i]) - len(ds[i].lstrip())]
    moi_ds = [(thut + m if m else m) for m in moi.split('\n')]
    ds[i + (0 if truoc else 1):i + (0 if truoc else 1)] = moi_ds
    return '\n'.join(ds)

def nhan(lop): return f'<label{lop}>Giảm màu <select id="kieuGiam"{" style=\"min-width:0\"" if lop else ""}><option value="tu-do">Tự do (như cũ)</option><option value="bang">Theo bảng màu Linh Khí</option></select></label>'

GHI = "// Đợt 4 (Q6): mọi prompt của trang có thêm đoạn BẢNG MÀU, chỉ gồm các nhóm màu liên quan. Lô mới muốn nhóm khác thì khai thêm bm: ['go', 'da_stone', …] (tên nhóm trong BM.nhom)."
T = {}
# ---- 4 trang theo lô (lamMon từng hình) ----
T['tach-phong'] = dict(khoi='// ===================== PROMPT', nhan='', sau_giam="giamMau(o, Math.max(2, +$('soMau').value));", out='K.out = {',
    muc="muc.push(['Tự nhìn: đúng hình, đúng thứ tự', true, 1]);", muc_moi="bmMuc(muc, KQ.map((K, i) => K && !chinhCua(i).bo && K.out.bm), 1);",
    noi="['doNet', 'soMau', 'heNet'].forEach(", noi_moi="$('kieuGiam').onchange = () => ANH && chay(false);", hien='function hienLo() {',
    boc="taoPrompt = (L) => bmChen(taoPromptGoc(L), bmDoan(L.bm || (L.id === 'vat' ? ['go', 'da_stone', 'kim_loai', 'lua', 'bong'] : ['go', 'da_stone', 'kim_loai', 'bong'])));")
T['tach-lang'] = dict(T['tach-phong'], boc="taoPrompt = (L) => bmChen(taoPromptGoc(L), bmDoan(L.bm || ['go', 'da_stone', 'co_cay', 'kim_loai', 'bong']));")
T['tach-giao-dien'] = dict(T['tach-phong'], boc="taoPrompt = (L) => bmChen(taoPromptGoc(L), bmDoan(L.bm || (L.id === 'phong' ? ['kim_loai'] : ['kim_loai', 'go', 'bong']), { vien: " + VIEN_RIENG + ", rieng: true })); // giao diện có mã viền và mã màu riêng (nâu tối, vàng kem), không ép theo sprite")
T['tach-do'] = dict(T['tach-phong'], sau_giam="giamMau(o, Math.max(2, +$('soMau').value - (vien ? 1 : 0)));",
    muc="muc.push([L.doi === 'vu-khi' ? (laCung() ? 'Tự nhìn:", muc_moi="bmMuc(muc, KQ.map((K, i) => K && !(CHINH[i] && CHINH[i].bo) && K.out.bm), 1);",
    noi="['latNgang', 'doNet', 'soMau', 'heNet'].forEach(", hien='// Dáng món theo cỡ trong game',
    boc="taoPrompt = (L) => bmChen(taoPromptGoc(L), bmDoan(L.bm || (L.doi === 'trang-phuc' ? ['vai', 'kim_loai', 'go'] : ['go', 'kim_loai']), { vien: " + VIEN_RIENG + ", rieng: true })); // đồ có viền riêng #1b1118 (game đổi màu viền này theo bậc) và màu chính riêng từng món")
# ---- 3 trang một tấm (tam) ----
C = dict(nhan=' class="hang" style="gap:6px"', sau_giam="giamMau(tam, +$('soMau').value - 1);", out=None,
    muc="loi.forEach(t => muc.push([t, false]));", muc_moi="bmMuc(muc, [bmKq]);", noi_moi="$('kieuGiam').onchange = () => ANH && chay();")
T['tach-quai'] = dict(C, khoi='function taoPrompt(q) {', noi="$('soMau').onchange = () => ANH && chay();", hien='function hienQuai() {',
    boc="taoPrompt = (q) => bmChen(taoPromptGoc(q), bmDoan(q.bm || ({ rung: ['co_cay', 'go', 'toc'], bien: ['nuoc', 'da_stone', 'kim_loai'], laudai: ['da_stone', 'kim_loai', 'lua'] }[q.vung] || ['toc', 'da_stone']).concat('quai')));")
T['tach-anh-hung'] = dict(C, khoi='function taoPrompt(q) {', noi="['latNgang', 'cachTach', 'doNet', 'locDom', 'soMau'].forEach(", hien='function hienNV() {',
    boc="taoPrompt = (q) => bmChen(taoPromptGoc(q), bmDoan(q.bm || (q.bo ? ['da', 'toc', 'vai', 'kim_loai'] : ['da', 'toc', 'vai'])));")
T['tach-hieu-ung'] = dict(C, khoi='// Bản màu theo hệ cho mục có "phe"', noi="['latNgang', 'doNet', 'locDom', 'soMau', 'kieuMep', 'coThem', 'vienToi'].forEach(", hien='function hienHu() {',
    boc="""// Mục có "phe" đã có câu MÀU riêng (cauMau, cùng nguồn BM) nên không thêm đoạn này. Mục khác: chỉ hệ của hiệu ứng đó (đoán theo mã tệp); không thuộc hệ nào thì thép + cả ba hệ.
const bmNhomHu = (q) => { const m = /(lua|fire)|(doc|poison|bao-tu)|(bang|ice)/.exec(q.ma); return m ? [m[1] ? 'he_lua' : m[2] ? 'he_doc' : 'he_bang'] : ['kim_loai', 'he_lua', 'he_doc', 'he_bang']; };
taoPrompt = (q) => (q.phe ? taoPromptGoc(q) : bmChen(taoPromptGoc(q), bmDoan(q.bm || bmNhomHu(q), { vien: `viền (nếu có) một nét ${BM.vien}`, them: `Chỉ dùng hệ khớp với nội dung hiệu ứng. Hiệu ứng của NGƯỜI CHƠI: lõi sáng nhất là trắng ngà ${bmMa('he_doc', 3)} hoặc lõi sáng của hệ; đạn và đòn của QUÁI: dùng nấc đậm của hệ, không lõi trắng to. ` })));""")

for ten, t in T.items():
    p = R + ten + '/index.html'; s = open(p, encoding='utf-8').read()
    assert 'kieuGiam' not in s, ten
    s = chen(s, f'<label{t["nhan"]}>Số màu <select id="soMau"', nhan(t['nhan']), ten=ten)
    s = chen(s, t['khoi'], KHOI.rstrip('\n') + '\n', truoc=True, ten=ten)
    if t['out']:
        s = chen(s, t['sau_giam'], 'const bmKq = bmGiam(o); // null khi "Giảm màu: Tự do"', ten=ten)
        s = chen(s, t['out'], 'K.out.bm = bmKq;', ten=ten)
    else:
        s = chen(s, t['sau_giam'], 'const bmKq = bmGiam(tam); // null khi "Giảm màu: Tự do"', ten=ten)
    s = chen(s, t['muc'], t['muc_moi'], truoc=True, ten=ten)
    s = chen(s, t['noi'], t['noi_moi'], ten=ten)
    s = chen(s, t['hien'], GHI + '\nconst taoPromptGoc = taoPrompt;\n' + t['boc'], truoc=True, ten=ten)
    if ten == 'tach-hieu-ung':
        doi = [
          ("ta: 'bạc sáng #cecdda, bóng mép thép tối #5c5b73', quai: 'nâu đỏ than hồng #a03409' }", "ta: `bạc sáng ${bmMa('kim_loai', 1)}, bóng mép thép tối ${bmMa('kim_loai', 0)}`, quai: `nâu đỏ than hồng ${bmMa('lua', 0)}` }"),
          ("ta: 'vàng #ffc90e chuyển ra cam #fe7d04', quai: 'đỏ cam sẫm #c9270c' }", "ta: `vàng ${bmMa('he_lua', 0)} chuyển ra cam ${bmMa('he_lua', 1)}`, quai: `đỏ cam sẫm ${bmMa('he_lua', 2)}` }"),
          ("ta: 'vàng chanh #c8f90b chuyển ra xanh lá #5aca02', quai: 'xanh lá sẫm #277600' }", "ta: `vàng chanh ${bmMa('he_doc', 0)} chuyển ra xanh lá ${bmMa('he_doc', 1)}`, quai: `xanh lá sẫm ${bmMa('he_doc', 2)}` }"),
          ("ta: 'xanh băng nhạt #9cfefa chuyển ra xanh lam #32b0e9', quai: 'xanh lam sẫm #217bc3' }", "ta: `xanh băng nhạt ${bmMa('he_bang', 0)} chuyển ra xanh lam ${bmMa('he_bang', 1)}`, quai: `xanh lam sẫm ${bmMa('he_bang', 2)}` }"),
          ("viền ngoài cùng một nét mực xanh đen #14182e. `;", "viền ngoài cùng một nét mực xanh đen ${BM.vien}. `;"),
          ("phải là trắng ngà #fbfed0; màu khác", "phải là trắng ngà ${bmMa('he_doc', 3)}; màu khác"),
          ('// Bản màu theo hệ cho mục có "phe" (phiên hieu-ung-b2). Mã màu lấy mẫu từ ảnh gốc của game (docs/review/ra-soat-my-thuat/bao-cao.md mục 6).', '// Bản màu theo hệ cho mục có "phe" (phiên hieu-ung-b2). Mã màu lấy từ khối BM ở trên (cùng một nguồn với mọi trang tach-*), không ghi mã riêng ở đây.'),
        ]
        for a, b in doi:
            assert s.count(a) == 1, a; s = s.replace(a, b)
    open(p, 'w', encoding='utf-8').write(s)
    print('ok', ten)
