"""Ảnh trước/sau cho phần sửa vỡ hình và Tự đoán của Xưởng Sprite (ảnh thử kiểu ảnh AI vẽ, xuong_sprite_ai.py).

  docs/xuong-sprite/sua-vo-truoc-sau.gif : em bé áo trùm đỏ (chính diện, tay áp sát thân) và quái bốn chân đi, chuẩn bị đánh,
                                           đánh, trúng đòn. Bên trái: cách cũ (chia theo tỉ lệ khung, không vá). Bên phải: bây giờ.
  docs/xuong-sprite/tu-doan-truoc-sau.png: năm ảnh thử, mỗi ảnh ba hình: hình pixel, Tự đoán cũ, Tự đoán mới (màu = bộ phận).
Chạy: python3 tests/xuong_sprite_sua_vo_shots.py
"""
import base64
import io
import os
import sys
import tempfile

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from xuong_sprite_ai import ANH_AI, MAU_AI  # noqa: E402

REPO = os.path.dirname(os.path.dirname(HERE))
TOOL = 'file://' + os.path.join(REPO, 'tools', 'xuong-sprite', 'index.html')
DOCS = os.path.join(REPO, 'docs', 'xuong-sprite')
TEN = {'em-be-ao-do': 'Em bé áo đỏ', 'em-be-ao-xanh': 'Em bé áo xanh', 'quai-bon-chan': 'Quái bốn chân', 'ca-bay': 'Cá bay', 'khoi-mem': 'Khối mềm'}
CAO = {'nguoi': 28, 'bonChan': 32, 'bay': 30, 'mem': 30}

JS = r"""window.SH = {
  async nap(src, cao) { const img = await XS.tuDataUrl(src), A = XS.tuAnh(img), m = XS.tachNen(A, { nguong: 40, kieu: 'mep', boDom: true }); return XS.pixelHoa(A, m, { cao, soMau: 20, kieuThu: 'net' }); },
  cu(R, mau) { const khop = XS.datKhop(R, mau); return { mau, khop, bo: XS.tuDoan(R, mau, khop) }; },
  moi(R, mau) { const d = XS.tuDoanHinh(R, mau); return { mau, khop: d.khop, bo: d.bo, thieu: d.thieu }; },
  // Một khung GIF: hai hàng (mỗi hình một hàng), hai cột (trước, sau). Trả về dataURL.
  khung(ds, ten, u, z) {
    const W = 2 * 70 * z + 30, H = ds.length * 62 * z + 70, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.fillStyle = '#12292a'; c.fillRect(0, 0, W, H); c.imageSmoothingEnabled = false;
    c.font = '700 22px "Be Vietnam Pro", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#ffb4a0'; c.fillText('Trước (vỡ hình)', 15 + 35 * z, 30);
    c.fillStyle = '#9be05a'; c.fillText('Bây giờ', 15 + 105 * z + 15, 30);
    c.font = '500 16px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a9c2b4'; c.fillText(XS.DONG_TAC[ten].ten, W / 2, H - 14);
    ds.forEach((d, j) => [d.cu, d.moi].forEach((kh, k) => {
      const f = XS.dungKhung(d.R, kh, XS.tuThe(kh.mau, ten, u, 1), { le: 30, vien: 0xff1e1418, khongVa: k === 0 });
      const x0 = 15 + k * (70 * z + 15), y0 = 44 + j * 62 * z;
      c.fillStyle = '#7fb8a8'; c.fillRect(x0, y0, 70 * z, 58 * z);
      const t = XS.raCanvas(f.w, f.h, f.px); c.drawImage(t, f.ox - 35, f.oy - 50, 70, 58, x0, y0, 70 * z, 58 * z);
    }));
    return cv.toDataURL();
  },
  // Ảnh so tự đoán: mỗi ảnh một hàng: hình pixel | tự đoán cũ | tự đoán mới.
  tuDoan(ds, z) {
    const cot = 54 * z, hang = 44 * z, W = 3 * cot + 4 * 16 + 120, H = ds.length * (hang + 16) + 60, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.fillStyle = '#12292a'; c.fillRect(0, 0, W, H); c.imageSmoothingEnabled = false;
    c.font = '700 18px "Be Vietnam Pro", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#f6dc92';
    ['Hình pixel', 'Tự đoán cũ (theo tỉ lệ)', 'Tự đoán mới (hình dáng, màu)'].forEach((t, k) => c.fillText(t, 120 + 16 + k * (cot + 16) + cot / 2, 30));
    const mau = XS.MAU_BO.map((hx) => XS.hex(hx));
    ds.forEach((d, j) => {
      const y0 = 48 + j * (hang + 16), R = d.R;
      c.font = '500 15px "Be Vietnam Pro", sans-serif'; c.textAlign = 'left'; c.fillStyle = '#f1e6c6'; c.fillText(d.ten, 10, y0 + hang / 2);
      [null, d.cu, d.moi].forEach((kh, k) => {
        const px = new Uint32Array(R.w * R.h);
        for (let i = 0; i < px.length; i++) if (R.px[i]) px[i] = !kh ? R.px[i] : kh.bo[i] === 255 ? 0xff888888 : mau[kh.bo[i] % 8];
        const kz = Math.max(1, Math.floor(Math.min(cot / R.w, hang / R.h))), x0 = 120 + 16 + k * (cot + 16);
        c.fillStyle = '#1d3436'; c.fillRect(x0, y0, cot, hang);
        c.drawImage(XS.raCanvas(R.w, R.h, px), x0 + (cot - R.w * kz) / 2, y0 + (hang - R.h * kz) / 2, R.w * kz, R.h * kz);
        if (kh && kh.thieu && kh.thieu.length) { c.font = '500 12px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#ffd27a'; c.textAlign = 'center';
          const M = XS.MAU[kh.mau]; c.fillText('Tô thêm: ' + M.bo.filter((b) => kh.thieu.includes(b.id)).map((b) => b.ten.toLowerCase()).join(', '), x0 + cot / 2, y0 + hang + 12); }
      });
    });
    return cv.toDataURL();
  },
};"""


def anh(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGB')


def main():
    tmp = tempfile.mkdtemp(prefix='sua_vo_')
    du = lambda p: 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()  # noqa: E731
    src = {k: du(f(os.path.join(tmp, k + '.png'))) for k, f in ANH_AI.items()}
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 800})
        pg.goto(TOOL); pg.wait_for_function('window.XS_UI'); pg.add_script_tag(content=JS); pg.wait_for_timeout(500)
        pg.evaluate("""async (ds) => { window.DS = []; for (const [ten, src, mau, cao] of ds) { const R = await SH.nap(src, cao); DS.push({ ten, R, cu: SH.cu(R, mau), moi: SH.moi(R, mau) }); } }""",
                    [[TEN.get(k, k), src[k], MAU_AI[k][0], CAO[MAU_AI[k][0]]] for k in ANH_AI])
        # GIF trước/sau: em bé áo đỏ và quái bốn chân
        hinh = []
        for ten, n in (('move', 8), ('tele', 6), ('atk', 8), ('hit', 5)):
            for i in range(n):
                u = i / n if ten == 'move' else i / (n - 1)
                hinh.append(anh(pg.evaluate('([ten, u]) => SH.khung([DS[0], DS[2]], ten, u, 4)', [ten, u])))
        hinh[0].save(os.path.join(DOCS, 'sua-vo-truoc-sau.gif'), save_all=True, append_images=hinh[1:], duration=110, loop=0)
        anh(pg.evaluate('() => SH.tuDoan(DS, 5)')).save(os.path.join(DOCS, 'tu-doan-truoc-sau.png'))
        b.close()
    print('Đã ghi docs/xuong-sprite/sua-vo-truoc-sau.gif và tu-doan-truoc-sau.png')


if __name__ == '__main__':
    main()
