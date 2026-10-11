"""Phần dùng chung cho các script kiểm Đợt 5."""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/claude/new-project'
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font = lambda n: ImageFont.truetype(FONT, n)
img = lambda data: Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGBA')
KEYS = ['smith', 'hunter', 'healer', 'wrestler']
TEN_BE = {'smith': 'Cu Tí', 'hunter': 'Cu Tèo', 'healer': 'Cái Bống', 'wrestler': 'Cu Lì'}
VK = ['sword', 'bow', 'spear', 'hammer']
TEN_VK = {'sword': 'kiếm', 'bow': 'cung', 'spear': 'giáo', 'hammer': 'búa'}
ROWS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne']
TEN_HANG = {'idle': 'idle · đứng', 'move': 'move · chạy', 'tele': 'tele · lấy đà', 'atk': 'atk · đánh', 'hit': 'hit · trúng đòn', 'die': 'die · ngã', 'ne': 'ne · lăn'}
W, H, FX, FY = 64, 56, 28, 48


def page(b, port, errs=None):
    pg = b.new_context(viewport={'width': 960, 'height': 540}).new_page()
    if errs is not None:
        pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:%d/linh-khi.html?cloud=0' % port); pg.wait_for_timeout(1500)
    pg.add_script_tag(path=REPO + '/game/tests/setup.js')
    pg.evaluate(open(HERE + '/lib.js', encoding='utf-8').read())
    pg.evaluate(open(HERE + '/lib5.js', encoding='utf-8').read())
    return pg
