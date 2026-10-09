"""Ảnh cho tài liệu Xưởng Sprite: thu nhỏ giữ nét (trước, sau) và em bé chỉ cử động tay chân.
Ghi vào docs/xuong-sprite/: giu-net-truoc-sau.png, chi-tay-chan.gif, buoc-2-so-sanh.png, buoc-4-dung-yen.png.
Chạy: python3 tests/xuong_sprite_giu_net_shots.py
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
from xuong_sprite_ve import ve_em_be_ao_do  # noqa: E402

REPO = os.path.dirname(os.path.dirname(HERE))
DOCS = os.path.join(REPO, 'docs', 'xuong-sprite')
TOOL = 'file://' + os.path.join(REPO, 'tools', 'xuong-sprite', 'index.html')

# Ảnh so sánh: ảnh vẽ | Mềm (kiểu cũ) phóng to | Giữ nét phóng to | cỡ thật trong phòng (×3) cả hai.
SO_SANH = """async (src) => {
  const S = XS_S, W = 1200, H = 560, cv = XS.taoCanvas(W, H), c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#12292a'; c.fillRect(0, 0, W, H);
  c.font = '700 22px "Be Vietnam Pro", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#f6dc92';
  const img = await XS.tuDataUrl(src), k = 440 / img.height; c.imageSmoothingEnabled = true; c.drawImage(img, 20, 70, img.width * k, 440); c.imageSmoothingEnabled = false;
  c.fillText('Ảnh vẽ', 20 + img.width * k / 2, 40);
  const ve = (kieu, so, x0, ten) => {
    const R = XS.pixelHoa(S.nguon, S.mat, { cao: 28, soMau: so, kieuThu: kieu }), P = XS.noi(R.px, R.w, R.h, 1), px = XS.themVien(P.px, P.w, P.h, XS.hex('#1b1118'));
    const z = 14; c.drawImage(XS.raCanvas(P.w, P.h, px), x0, 70, P.w * z, P.h * z);
    c.fillStyle = '#f6dc92'; c.fillText(ten, x0 + P.w * z / 2, 40);
    return { P, px };
  };
  const a = ve('mem', 12, 380, 'Trước: kiểu Mềm (nhòe)'), b = ve('net', 20, 680, 'Sau: Giữ nét');
  // cỡ thật ×3 trên nền phòng
  const x3 = 1000, w3 = 60, h3 = 150, s3 = 3, nen = XS.taoCanvas(w3, h3), g = nen.getContext('2d');
  g.fillStyle = '#3a3b2c'; g.fillRect(0, 0, w3, h3);
  g.drawImage(XS.raCanvas(a.P.w, a.P.h, a.px), 10, 40); g.drawImage(XS.raCanvas(b.P.w, b.P.h, b.px), 32, 40);
  g.drawImage(XS.raCanvas(a.P.w, a.P.h, a.px), 10, 100); g.drawImage(XS.raCanvas(b.P.w, b.P.h, b.px), 32, 100);
  c.drawImage(nen, x3, 70, w3 * s3, h3 * s3);
  c.fillStyle = '#f6dc92'; c.fillText('Cỡ thật ×3', x3 + w3 * s3 / 2, 40);
  c.font = '500 16px "Be Vietnam Pro", sans-serif'; c.fillStyle = '#a9c2b4';
  c.fillText('trái: trước · phải: sau', x3 + w3 * s3 / 2, 540);
  c.fillText('Em bé cao 28 điểm ảnh như trong game. Giữ nét: giữ màu đã vẽ, viền liền, còn mắt, miệng, má hồng, chuông.', 600, 540 - 0);
  return cv.toDataURL();
}"""
# Khung hình đứng thở và đi: trái cả người cử động (kiểu cũ), phải chỉ tay chân (mặc định mới).
KHUNG = """(tuy) => { const S = XS_S, cfg = { mau: S.kh.mau, khop: S.kh.khop, bo: S.kh.bo, vien: XS.hex('#1b1118'), doi: 'em-be', dong_tac: {} };
  if (tuy) { cfg.dung_yen = tuy.dung_yen; cfg.nhun = tuy.nhun; }
  const T = XS.dungTam(S.R, cfg, null), out = [];
  for (const ten of ['idle', 'move']) { const a = T.dong_tac[ten]; for (let i = 0; i < a.so; i++) { const cv = XS.taoCanvas(T.fw, T.fh); cv.getContext('2d').drawImage(XS.raCanvas(T.w, T.h, T.px), i * T.fw, a.hang * T.fh, T.fw, T.fh, 0, 0, T.fw, T.fh); out.push({ ten, giay: a.giay / a.so, url: cv.toDataURL() }); } }
  return out; }"""


def anh(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGBA')


def main():
    tmp = tempfile.mkdtemp(prefix='giu_net_')
    src = ve_em_be_ao_do(os.path.join(tmp, 'em-be-ao-do.png'))
    with open(src, 'rb') as f:
        src_url = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={'width': 1280, 'height': 760})
        pg.goto(TOOL); pg.wait_for_function('window.XS_UI')
        pg.click('.the[data-ma="em-be"]'); pg.set_input_files('#chonAnh', src); pg.wait_for_function('XS_S.R')
        pg.wait_for_timeout(4000)  # chờ thông báo tắt
        pg.screenshot(path=os.path.join(DOCS, 'buoc-2-so-sanh.png'))
        anh(pg.evaluate(SO_SANH, src_url)).save(os.path.join(DOCS, 'giu-net-truoc-sau.png'))
        pg.evaluate('XS_UI.denBuoc(4)'); pg.wait_for_timeout(400)
        pg.click('#dsDongTac [data-dt="move"]'); pg.wait_for_timeout(300)
        pg.locator('#khoiYen').scroll_into_view_if_needed(); pg.wait_for_timeout(3500)
        pg.screenshot(path=os.path.join(DOCS, 'buoc-4-dung-yen.png'))
        cu = pg.evaluate(KHUNG, None)
        moi = pg.evaluate(KHUNG, pg.evaluate('XS_S.chuyen'))
        b.close()
    # GIF: hai em bé cạnh nhau, nền phòng tối, phóng ×5
    z, n = 5, len(moi)
    fw = max(anh(x['url']).size[0] for x in cu + moi)
    fh = max(anh(x['url']).size[1] for x in cu + moi)
    frames, durs = [], []
    for i in range(n):
        im = Image.new('RGBA', (fw * 2 * z + 30, fh * z + 10), (40, 52, 44, 255))
        for k, ds in enumerate((cu, moi)):
            a = anh(ds[i]['url'])
            a = a.resize((a.size[0] * z, a.size[1] * z), Image.NEAREST)
            im.alpha_composite(a, (10 + k * (fw * z + 10) + (fw * z - a.size[0]) // 2, 5 + fh * z - a.size[1]))
        frames.append(im.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=64))
        durs.append(max(60, int(moi[i]['giay'] * 1000)))
    frames = frames * 2
    durs = durs * 2
    frames[0].save(os.path.join(DOCS, 'chi-tay-chan.gif'), save_all=True, append_images=frames[1:], duration=durs, loop=0, disposal=2)
    print('Đã ghi giu-net-truoc-sau.png, chi-tay-chan.gif, buoc-2-so-sanh.png, buoc-4-dung-yen.png')


if __name__ == '__main__':
    main()
