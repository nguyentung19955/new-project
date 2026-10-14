"""Phần chung của bot chiến dịch (đợt 5, hệ thống mới): mở trang game, cho bot chơi chiến dịch 15 ải trên bản lưu mới và ghi số liệu
từng ải. Dùng bởi tests/cay.py (nhiều lượt chiến dịch, bảng mục tiêu, đo Sức mạnh khuyên dùng) và tests/campaign.py (một lượt, in chi tiết).
Game chạy với ?cloud=0 (không đụng đăng nhập Google / lưu mây). Nâng cấp ở làng: tests/bot_nang.js (G.botNang)."""
import os, sys, json

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOT = {'react': 0.3, 'missProj': 0.33}  # bot hơi vụng như người mới (phản xạ chậm hơn, bỏ sót nhiều đạn hơn bot mặc định)
CAY = ['hoa', 'doc', 'bang']  # cây chưởng bot dùng, lần lượt theo lượt chiến dịch (js/chuong.js)
NGUONG = 1.0   # kiểu khuyen: đợi Sức mạnh đủ khuyên dùng mới vào ải mới
MAX_CAY = 8    # cày tối đa bấy nhiêu lượt liền rồi thử luôn


class NodePage:
    """14/10 (bước 1 làm chắc, mục 5): "trang" chạy luật game trong Node (tests/node_trang.js), KHÔNG trình duyệt, không Playwright,
    không vẽ. Cùng cách gọi pg.evaluate(mã, tham_số) như trang Playwright nên cay.py / campaign.py / balance.py dùng lại nguyên luật bot."""

    def __init__(self, errs, pre=None):
        import subprocess
        self.errs = errs
        self.p = subprocess.Popen(['node', os.path.join(HERE, 'tests', 'node_trang.js')], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL, text=True, encoding='utf-8', bufsize=1)
        if pre:
            self.evaluate(pre)

    def evaluate(self, code, arg=None):
        code = code.strip()
        self.p.stdin.write(json.dumps({'code': code, 'arg': arg}, ensure_ascii=False) + '\n')
        self.p.stdin.flush()
        line = self.p.stdout.readline()
        if not line:
            raise RuntimeError('node_trang.js đã dừng')
        r = json.loads(line)
        if not r.get('ok'):
            self.errs.append(r.get('loi', '?')[:400])
            raise RuntimeError(r.get('loi', '?')[:400])
        return r.get('v')

    def close(self):
        try:
            self.p.stdin.close(); self.p.wait(5)
        except Exception:
            self.p.kill()


def node_mode():
    return '--node' in sys.argv or os.environ.get('LK_NODE') == '1'


class _KhongTrinhDuyet:
    """Thay cho sync_playwright() khi chạy --node: không mở trình duyệt; open_page trả về NodePage."""
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    class chromium:
        @staticmethod
        def launch(*a, **k):
            return None


def trinh_duyet():
    """with cd_lib.trinh_duyet() as p: b = p.chromium.launch() — Playwright như cũ, hoặc không gì cả khi --node / LK_NODE=1."""
    if node_mode():
        return _KhongTrinhDuyet()
    from playwright.sync_api import sync_playwright
    return sync_playwright()


def dong(b, pg=None):
    if pg is not None and hasattr(pg, 'close') and isinstance(pg, NodePage):
        pg.close()
    if b is not None:
        b.close()


def open_page(b, errs, pre=None):
    if b is None or node_mode():
        return NodePage(errs, pre)
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + HERE + '/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    pg.wait_for_timeout(300)
    for f in ('bot.js', 'setup.js', 'bot_nang.js'):
        pg.add_script_tag(path=os.path.join(HERE, 'tests', f))
    if pre:
        pg.evaluate(pre)
    return pg


def ten(k):
    return '%d-%d' % (k // 5 + 1, k % 5 + 1)


SNAP = "() => ({ lk: G.vkMoi.lk(G.save), gold: G.save.gold, xp: G.save.heroes.smith.xp, lvl: G.save.heroes.smith.lvl })"
VK = {'kiem': 'sword', 'thuong': 'spear', 'bua': 'hammer', 'phitieu': 'bow'}
NGAY = 8  # 14/10 (bước 1, mục 5): số lượt ải thường mỗi "ngày" của bot (≈ 30-40 phút chơi); hết ngày thì chơi ải ngày đang mở rồi sang ngày mới


def campaign(pg, mode='khuyen', upto=15, cay='hoa', saves=None, guard_max=220, chinh='sword', ngay=None, kho2=False, saves2=None):
    """mode: khuyen (cày tới khi đủ Sức mạnh khuyên dùng), lieu (cứ vào ải mới; thua thì chơi lại ải cũ một lượt).
    saves: dict k -> [bản lưu lúc thử ải k lần đầu] (để đo khuyên dùng).
    14/10 (bước 1, mục 5): chinh = món chính của bot (sword / spear / hammer, phụ là phi tiêu); ngay = số lượt mỗi ngày giả (0: không ải ngày);
    kho2 = qua 15 ải rồi chơi tiếp 15 ải độ khó 2 (cùng luật cày theo G.stageRec(r, i, 1)); saves2: như saves cho độ khó 2."""
    ngay = NGAY if ngay is None else ngay
    pg.evaluate("(c) => { G.resetSave(); G.save.sound = false; Object.assign(G.botCfg, c); G.botMoc = {}; }", BOT)
    pg.evaluate("(v) => G.botDatVk(v)", chinh)
    pg.evaluate("(c) => { if (G.chuong) { const hs = G.save.heroes.smith; G.chuong.use(hs, c, 'smith'); hs.ch.cay = c; } }", cay)
    nst = 30 if kho2 else 15
    st = [{'plays': 0, 'tries': 0, 'fails': 0, 'grind': 0, 't': 0, 'lvl': 0, 'pw': 0, 'rec': 0, 'hp': None, 'bossHit': 0,
           'tWin': 0, 'lk': 0, 'gold': 0, 'att': []} for _ in range(nst)]
    tot = {'t': 0, 'luot': 0, 'ngay': 0}
    an = {'n': 0, 'win': 0, 't': 0, 'gold': 0, 'ore': 0, 'da': 0, 'lk': 0, 'loai': {}}
    hurt = {}
    log = []

    def choi_ngay():
        if not ngay:
            return
        tot['luot'] += 1
        if tot['luot'] % ngay:
            return
        ds = pg.evaluate("() => G.botAiNgay()")
        tot['ngay'] += 1
        pg.evaluate("() => G.botSangNgay()")
        for x in ds:
            an['n'] += 1; an['win'] += 1 if x['win'] else 0; an['t'] += x['t']
            for kk in ('gold', 'ore', 'da', 'lk'):
                an[kk] += x[kk]
            q = an['loai'].setdefault(x['loai'], [0, 0])
            q[0] += 1; q[1] += 1 if x['win'] else 0
            tot['t'] += x['t']
        if ds:
            log.append(f"  ngày {tot['ngay']}: ải ngày " + ', '.join(f"{x['loai']}{x['muc']+1} {'thắng' if x['win'] else 'thua'}" for x in ds))

    def pha(diff, base, upto, saves):
        cleared = -1
        grind_run = 0
        must_grind = False
        pw_run = 0
        seen = set()
        guard = 0
        rec_of = lambda kk: pg.evaluate("([r, i, d]) => G.stageRec(r, i, d)", list(divmod(kk, 5)) + [diff])
        while cleared < upto - 1 and guard < guard_max:
            guard += 1
            nxt = cleared + 1
            v = pg.evaluate("(a) => G.botNang(a)", ('K2 ' if diff else '') + ten(nxt))
            rec = rec_of(nxt)
            stall = grind_run >= 3 and v['power'] <= pw_run * 1.01
            grind = cleared >= 0 and (must_grind or (mode == 'khuyen' and v['power'] < rec * NGUONG and grind_run < MAX_CAY and not stall))
            k = cleared if grind else nxt
            if grind and cleared % 5 == 4 and v['power'] < 1.15 * rec_of(cleared):
                k = cleared - 1  # vừa qua trùm vùng mà chưa dư sức: cày ải 4 của vùng đó (dễ thắng hơn đánh lại trùm)
            wh = v.get('where')
            if not diff and grind and wh is not None and wh <= cleared and (wh % 5 < 4 or v['power'] >= 1.15 * rec_of(wh)):
                k = wh  # cày đúng chỗ bảng gợi ý chỉ (thiếu nguyên liệu vùng nào thì chơi lại vùng đó)
            r, i = divmod(k, 5)
            if not grind and saves is not None and nxt not in seen:
                seen.add(nxt)
                saves.setdefault(nxt, []).append(pg.evaluate("JSON.stringify(G.save)"))
            a = pg.evaluate(SNAP)
            pg.evaluate("([r, i, d]) => G.startStage(r, i, d)", [r, i, diff])
            res = pg.evaluate("G.probeRun(900)")
            b = pg.evaluate(SNAP)
            if res.get('bad'):
                return None, 'LỖI số liệu ' + str(res['bad'][:3])
            t = res.get('t') or 0
            tot['t'] += t
            s = st[base + nxt]
            s['plays'] += 1; s['t'] += t
            s['lk'] += b['lk'] - a['lk']; s['gold'] += b['gold'] - a['gold']
            for kk, x in (res.get('hurt') or {}).items():
                kk = kk.split(':')[1]; hurt[kk] = hurt.get(kk, 0) + x
            win = bool(res.get('win'))
            log.append(f"{'cày ' if grind else 'thử '}{'K2 ' if diff else ''}{ten(k)} {'thắng' if win else 'THUA '} {t:>3}s cấp {v['lvl']:>2} SM {v['power']:>4}/{rec:<4} máu {res.get('hp')}/{res.get('maxhp')} "
                       f"chính {v['chinh']} | phụ {v['phu']} | bộ {v['bo']} | lò {v['forge']} LK {v['lk']} vàng {v['gold']} quặng {v['ore']} nl {v['mats']} mảnh {v['shards']} đá {v.get('da')} bùa {v.get('bua')} "
                       f"| +{b['lk']-a['lk']:.0f} LK +{b['gold']-a['gold']} vàng | đòn trùm {res.get('bossHit')} | {'; '.join(v['did'][:6])}")
            choi_ngay()
            if grind:
                if grind_run == 0 or grind_run % 3 == 0: pw_run = v['power']
                grind_run += 1
                s['grind'] += 1
                must_grind = False
                continue
            s['tries'] += 1
            s['att'].append([v['power'], win])
            s['bossHit'] = max(s['bossHit'], res.get('bossHit') or 0)
            grind_run = 0
            if win:
                s['lvl'] = v['lvl']; s['pw'] = v['power']; s['rec'] = rec
                s['hp'] = (res.get('hp') or 0) / (res.get('maxhp') or 1)
                s['tWin'] = t
                cleared = nxt
            else:
                s['fails'] += 1
                must_grind = True
        return cleared, None

    def ket(cleared, why=None):
        moc = pg.evaluate("G.botMoc")
        cuoi = pg.evaluate("() => ({ vang: Math.floor(G.save.gold), lk: Math.floor(G.vkMoi.lk(G.save)), quang: G.save.ore, nl: G.save.mats.slice(), manh: G.save.shards.slice(), cap: G.save.heroes.smith.lvl, sm: G.power(), da: G.epDo ? G.epDo.da(G.save) : 0 })")
        return {'st': st, 't': tot['t'], 'hurt': hurt, 'log': log, 'moc': moc, 'cuoi': cuoi, 'aiNgay': an, 'ngay': tot['ngay'], 'chinh': chinh}

    cleared, why = pha(0, 0, upto, saves)
    if why:
        return None, why
    if cleared < upto - 1:
        campaign.last = ket(cleared)
        return None, 'kẹt ở ải ' + ten(cleared + 1)
    if kho2 and upto == 15:
        c2, why = pha(1, 15, 15, saves2)
        if why:
            return None, why
        if c2 < 14:
            campaign.last = ket(c2)
            return None, 'kẹt ở ải độ khó 2 ' + ten(c2 + 1)
    return ket(cleared), None
