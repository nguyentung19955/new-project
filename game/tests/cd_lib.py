"""Phần chung của bot chiến dịch (đợt 5, hệ thống mới): mở trang game, cho bot chơi chiến dịch 15 ải trên bản lưu mới và ghi số liệu
từng ải. Dùng bởi tests/cay.py (nhiều lượt chiến dịch, bảng mục tiêu, đo Sức mạnh khuyên dùng) và tests/campaign.py (một lượt, in chi tiết).
Game chạy với ?cloud=0 (không đụng đăng nhập Google / lưu mây). Nâng cấp ở làng: tests/bot_nang.js (G.botNang)."""
import os, sys, json

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOT = {'react': 0.3, 'missProj': 0.33}  # bot hơi vụng như người mới (phản xạ chậm hơn, bỏ sót nhiều đạn hơn bot mặc định)
CAY = ['hoa', 'doc', 'bang']  # cây chưởng bot dùng, lần lượt theo lượt chiến dịch (js/chuong.js)
NGUONG = 1.0   # kiểu khuyen: đợi Sức mạnh đủ khuyên dùng mới vào ải mới
MAX_CAY = 8    # cày tối đa bấy nhiêu lượt liền rồi thử luôn


def open_page(b, errs, pre=None):
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


def campaign(pg, mode='khuyen', upto=15, cay='hoa', saves=None, guard_max=220):
    """mode: khuyen (cày tới khi đủ Sức mạnh khuyên dùng), lieu (cứ vào ải mới; thua thì chơi lại ải cũ một lượt).
    saves: dict k -> [bản lưu lúc thử ải k lần đầu] (để đo khuyên dùng)."""
    pg.evaluate("(c) => { G.resetSave(); G.save.sound = false; Object.assign(G.botCfg, c); G.botMoc = {}; }", BOT)
    pg.evaluate("(c) => { if (G.chuong) { const hs = G.save.heroes.smith; G.chuong.use(hs, c, 'smith'); hs.ch.cay = c; } }", cay)
    cleared = -1
    st = [{'plays': 0, 'tries': 0, 'fails': 0, 'grind': 0, 't': 0, 'lvl': 0, 'pw': 0, 'rec': 0, 'hp': None, 'bossHit': 0,
           'tWin': 0, 'lk': 0, 'gold': 0, 'att': []} for _ in range(15)]
    tot_t = 0
    grind_run = 0
    must_grind = False
    pw_run = 0
    hurt = {}
    log = []
    seen = set()
    guard = 0
    while cleared < upto - 1 and guard < guard_max:
        guard += 1
        nxt = cleared + 1
        v = pg.evaluate("(a) => G.botNang(a)", ten(nxt))
        rec = pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(nxt, 5)))
        stall = grind_run >= 3 and v['power'] <= pw_run * 1.01
        grind = cleared >= 0 and (must_grind or (mode == 'khuyen' and v['power'] < rec * NGUONG and grind_run < MAX_CAY and not stall))
        k = cleared if grind else nxt
        if grind and cleared % 5 == 4 and v['power'] < 1.15 * pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(cleared, 5))):
            k = cleared - 1  # vừa qua trùm vùng mà chưa dư sức: cày ải 4 của vùng đó (dễ thắng hơn đánh lại trùm)
        wh = v.get('where')
        if grind and wh is not None and wh <= cleared and (wh % 5 < 4 or v['power'] >= 1.15 * pg.evaluate("([r, i]) => G.stageRec(r, i, 0)", list(divmod(wh, 5)))):
            k = wh  # cày đúng chỗ bảng gợi ý chỉ (thiếu nguyên liệu vùng nào thì chơi lại vùng đó)
        r, i = divmod(k, 5)
        if not grind and saves is not None and nxt not in seen:
            seen.add(nxt)
            saves.setdefault(nxt, []).append(pg.evaluate("JSON.stringify(G.save)"))
        a = pg.evaluate(SNAP)
        pg.evaluate("([r, i]) => G.startStage(r, i, 0)", [r, i])
        res = pg.evaluate("G.probeRun(900)")
        b = pg.evaluate(SNAP)
        if res.get('bad'):
            return None, 'LỖI số liệu ' + str(res['bad'][:3])
        t = res.get('t') or 0
        tot_t += t
        s = st[nxt]
        s['plays'] += 1; s['t'] += t
        s['lk'] += b['lk'] - a['lk']; s['gold'] += b['gold'] - a['gold']
        for kk, x in (res.get('hurt') or {}).items():
            kk = kk.split(':')[1]; hurt[kk] = hurt.get(kk, 0) + x
        win = bool(res.get('win'))
        log.append(f"{'cày ' if grind else 'thử '}{ten(k)} {'thắng' if win else 'THUA '} {t:>3}s cấp {v['lvl']:>2} SM {v['power']:>4}/{rec:<4} máu {res.get('hp')}/{res.get('maxhp')} "
                   f"kiếm {v['chinh']} | phi tiêu {v['phu']} | bộ {v['bo']} | lò {v['forge']} LK {v['lk']} vàng {v['gold']} quặng {v['ore']} nl {v['mats']} mảnh {v['shards']} "
                   f"| +{b['lk']-a['lk']:.0f} LK +{b['gold']-a['gold']} vàng | đòn trùm {res.get('bossHit')} | {'; '.join(v['did'][:6])}")
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
    moc = pg.evaluate("G.botMoc")
    cuoi = pg.evaluate("() => ({ vang: Math.floor(G.save.gold), lk: Math.floor(G.vkMoi.lk(G.save)), quang: G.save.ore, nl: G.save.mats.slice(), manh: G.save.shards.slice(), cap: G.save.heroes.smith.lvl, sm: G.power() })")
    if cleared < upto - 1:
        campaign.last = {'st': st, 't': tot_t, 'hurt': hurt, 'log': log, 'moc': moc, 'cuoi': cuoi}
        return None, 'kẹt ở ải ' + ten(cleared + 1)
    return {'st': st, 't': tot_t, 'hurt': hurt, 'log': log, 'moc': moc, 'cuoi': cuoi}, None
