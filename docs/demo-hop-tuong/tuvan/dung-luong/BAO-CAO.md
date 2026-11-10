# Dung lượng bản xuất bản `thap/` (Firebase Hosting turret-merge) — đo + đề xuất (10/11)

Bối cảnh: mỗi lần đăng ~350 MB, gói Spark chỉ có 10 GB lưu trữ → kho đầy (lỗi 429), mọi lần đăng sau đó đều hỏng.

## 1. Đo bản live (`claude/mobile-tower-defense-game-k5oxzo` @ 4f3cb5278, `du thap/` = 376 MB)

| Loại | MB | Số tệp | Ghi chú |
|---|---:|---:|---|
| .png | 260,7 | 2274 | **249,8 MB là PNG đã có bản .webp đi kèm** (1775 cặp) |
| .webp | 69,7 | 1796 | 64,2 MB do `thap-ver.py` sinh lúc xuất bản + 5,4 MB có sẵn ở nhánh nguồn (hero/*_af_*) |
| .jpg | 31,5 | 101 | hero/hero_<id>.jpg 1170×1020 |
| .js / .css | 3,8 / 0,5 | 118 / 51 | |
| .mp3 / .woff2 | 0,4 / 0,1 | 25 / 11 | |

- Thư mục raw/docs lạc vào `thap/`: **không có** (chỉ `QUY-TAC-HINH.md` 8 KB, `nghe-am-thanh.html` 8 KB).
- Nhánh nguồn `claude/demo-hop-tuong`: `thap/` ≈ 299 MB (chưa có webp); bản live = nguồn + ~64 MB webp + chuỗi `?v=`.
- Nhóm lớn nhất (live, png+webp): `fx_*` 83,7 MB (987 tệp) · `trum_*` 37,9 MB · `pilot_*` 37,0 MB · `hero/` 36,4 MB · `p3_*` 16,7 · `p2_*` 15,6 · `pn/` 15,1 · `nho/` 11,1 · `af_*` 8,3 · `shop_*` 7,2 MB.
- Tệp lớn nhất: `fx_hopca_sk` 3,2 MB, `fx_luutru_sk` 3,0, `fx_xuonganh_sk` 2,9, `fx_lualien_sk` 2,5, `p2_blackhole` 2,2, `khay` 1,7 MB.

## 2. PNG không bao giờ tải khi đã có .webp / tệp rác

**Cơ chế:** `anhUrl()` (taitai.js) → `.webp?v=` nếu có `ANH_W`; `REN.taiAnh`, màn tải, `portraitOf/thumbOf/iconOf`, khung thẻ đều qua đây.
`thap-ver.py` còn viết lại chuỗi tĩnh `'assets/x.png'` trong js/css/html → `.webp?v=`. **Vẫn tải .png** khi:
1. đường dẫn **dựng động** không qua `anhUrl`: `unitpage.js` (`'assets/' + anhTen(id+'_nong…') + '.png'`), `vaotran.js` `sprite()`,
   `trum.js:248` `url(assets/trum_<id>_portrait.png)`, `chedo-c.js` chân dung trùm, `ui.js:107` ngọc, `ui.js:167` `h2_tam_do`, `tvb.js:143` `tv_hang*`…
   (donet.js chỉ dán `?v=` cho .png, không đổi sang .webp);
2. `onerror` dự phòng / máy không giải mã được webp (`TAI_WEBP=false`, iOS < 14).

Đo thật (Playwright 390×844, 17 màn: HOME, ?ucu=1, 4 tab cửa hàng, trang ụ canon/overlord/ronglua?ucu=1/chỉ huy, solo, trùm w10/w20, pvp, bộ bài):
1226 yêu cầu ảnh, chỉ **11 PNG có-webp** bị tải (`h2_tam_do` + 10 `trum_*_portrait`) → mọi PNG khác trong 1775 cặp chỉ là **dự phòng**.

**Rác thật (không còn chỗ nào tham chiếu, đã soát js/css/html/json đã bỏ chú thích + mẫu ghép tên + tools/docs):**
| Tệp | KB | Kết luận |
|---|---:|---|
| `kho_chong.png` | 20 | không code/tool nào dùng (thừa từ nhóm A 08/11) → **ĐÃ XOÁ** |
| `v2_overlord_nong_s2/s3.png` | 121 | không dùng, nhưng do người dùng tải lên ("Add files via upload") → **hỏi người dùng** |
| `cb_no_ic.png` | 37 | không dùng, nhưng `tools/thap-cat-co-bac.py` sinh lại → để nguyên (hoặc bỏ dòng sinh trong tool) |
| `fx_soi_song.png`, `hydra_than_tt.png` | 118 | "dự trữ" (ra-soat-anime-u/BANG.md) → giữ |
| `ha_vien_xanh.png` | 25 | ảnh trung gian `tools/thap-cat-ui4.py` đọc lại → giữ |
| `icon/icon-1024.png`, `icon/favicon-48.png` | 1170 | game không dùng; icon-1024 là icon cửa hàng (doi-ten/DOI-TEN.md) → có thể chuyển ra `docs/` (cần duyệt) |

→ **Rác chỉ ≈ 0,3–1,5 MB — không phải nguyên nhân.** Mọi họ tên khác (`*_nong_s*`, `*_v1` cho ?ucu=1, `pn/pilot_*`, `hero/*.jpg`, `canon_de_1..15`, `trum_*_m_*`, `fx_<id>_sk`…) đều được dựng động trong code.

**Nén lại không mất chất lượng** (oxipng mức 2, kiểm từng ảnh điểm-ảnh trùng khớp): 2274 PNG 260,7 → 253,8 MB (−2,6 %); không tệp nào lợi ≥ 15 %.
→ **Không làm**: đổi ~2000 blob (repo phình ~250 MB lịch sử) + đổi băm `?v=` mọi ảnh → người chơi tải lại hết, chỉ để được 7 MB. Nén có mất mát (pngquant) bị loại vì phải giữ chất lượng.

## 3. Đề xuất (cần duyệt) — theo thứ tự hiệu quả

**A. Giới hạn số bản lưu trên Firebase (gốc của lỗi 429, không đụng mã/cấu hình repo).** Console → Hosting → turret-merge →
Release history → ⋮ → *Release storage settings* → giữ 3–5 bản. Các bản cũ quá giới hạn được xoá dần (cũ nhất trước). Đây là việc của người dùng
trên console. 10 GB / 350 MB ≈ 28 bản: đăng nhiều lần/ngày thì vài ngày là đầy lại, dù có giảm dung lượng hay không.

**B. Bỏ .png trùng trong BẢN XUẤT BẢN (376 → ~154 MB/bản, −222 MB, −59 %).** Gồm 2 phần, phải đi cùng nhau:
1. `thap/js/donet.js` (nhánh nguồn; ở nhánh làm việc không có `ANH_V` nên không đổi gì): đường dẫn `assets/X.png` dựng động
   → `assets/X.webp?v=` khi có `ANH_W[X]`; móc thêm `style.setProperty` / `style.backgroundImage…` (VT.sprite, tvb.js).
2. `tools/thap-ver.py`: sau khi sinh webp → xoá `X.png` có trong `ANH_W`, **trừ** tên còn bị trỏ thẳng `.png` ở chỗ không qua anhUrl/donet
   (tự quét: 66 mẫu, giữ 81 PNG: icon/, h2_*, ha_*, ic_*, ngoc_*, trum_*, tv_hang*…). Chạy lại lần 2 vẫn đúng (lấy băm cũ từ ver-anh.js). Tắt: `THAP_BO_PNG=0`.

   Đã thử trên bản copy live (/dev/shm): bỏ 1689 PNG (218,5 MB), chạy 2 lần → `ANH_V`/`ANH_W` không đổi; 17 màn ở trên: **0 lỗi 404/HTTP, 0 lỗi JS**, ảnh không mất.
   Rủi ro còn lại: máy không đọc webp (iOS < 14, Android cũ) sẽ thiếu các ảnh này; đường dẫn .png mới thêm sau này phải đi qua anhUrl/donet
   (thap-ver tự giữ PNG nếu thấy chuỗi `.png` tĩnh/ghép một phần). Trước khi bật: tester soát đủ màn bằng hồ sơ đã qua hướng dẫn (lần đo này hồ sơ mới
   nên nhiều màn rơi vào trận hướng dẫn; tab cửa hàng/khung thẻ chưa được xem trọn).

**C. (tuỳ chọn)** Chỉ làm B.1 (donet) → bớt tải PNG 2 lần, giữ dự phòng cho máy cũ, nhưng không giảm lưu trữ.
Thêm mẫu `"ignore"` vào `firebase-thap.json` (vd bỏ `**/*.png` có .webp) **không cần**: Firebase không biết PNG nào còn dùng — B xử lý trong thư mục xuất bản, không đụng cấu hình Firebase/workflow.

### Diff đề xuất — `thap/js/donet.js`
```diff
--- a/thap/js/donet.js
+++ b/thap/js/donet.js
@@ -17,7 +17,9 @@
 (() => {
   if (typeof ANH_V === 'undefined') return;
   const RE = /(assets\/([\w\/-]+)\.(png|jpg))(?![?\w])/g;
-  const V = (s) => typeof s === 'string' && s.indexOf('assets/') >= 0 ? s.replace(RE, (m, u, n, e) => ANH_V[n] ? u + '?v=' + ANH_V[n] : m) : s;
+  // bản xuất bản bỏ .png khi đã có .webp (tools/thap-ver.py, ANH_W) → đường dẫn .png dựng động cũng đổi sang .webp?v= (máy không đọc webp: TAI_WEBP=false → giữ .png)
+  const W = (n, e) => e === 'png' && typeof ANH_W !== 'undefined' && ANH_W[n] && (typeof TAI_WEBP === 'undefined' || TAI_WEBP);
+  const V = (s) => typeof s === 'string' && s.indexOf('assets/') >= 0 ? s.replace(RE, (m, u, n, e) => W(n, e) ? 'assets/' + n + '.webp?v=' + ANH_W[n] : ANH_V[n] ? u + '?v=' + ANH_V[n] : m) : s;
   window.anhV = V;
   const EP = Element.prototype, d = Object.getOwnPropertyDescriptor(EP, 'innerHTML');
   if (d && d.set) Object.defineProperty(EP, 'innerHTML', { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, V(v)); } });
@@ -25,4 +27,10 @@
   const sa = EP.setAttribute; EP.setAttribute = function (k, v) { return sa.call(this, k, (k === 'src' || k === 'style') ? V(v) : v); };
   const IP = HTMLImageElement.prototype, ds = Object.getOwnPropertyDescriptor(IP, 'src');
   if (ds && ds.set) Object.defineProperty(IP, 'src', { configurable: true, enumerable: ds.enumerable, get: ds.get, set(v) { ds.set.call(this, V(v)); } });
+  // el.style.backgroundImage = 'url(assets/x.png)' / style.setProperty('--hang', 'url(../assets/x.png)') (VT.sprite, tvb.js)
+  const SP = CSSStyleDeclaration.prototype, sp = SP.setProperty; SP.setProperty = function (k, v, u) { return sp.call(this, k, V(v), u); };
+  for (let P = Object.getPrototypeOf(document.documentElement.style); P && P !== Object.prototype; P = Object.getPrototypeOf(P))
+    for (const k of ['backgroundImage', 'background', 'borderImage', 'borderImageSource', 'maskImage', 'webkitMaskImage', 'listStyleImage', 'content', 'cssText']) {
+      const d2 = Object.getOwnPropertyDescriptor(P, k); if (d2 && d2.set && d2.configurable) Object.defineProperty(P, k, { configurable: true, enumerable: d2.enumerable, get: d2.get, set(v) { d2.set.call(this, V(v)); } });
+    }
 })();
```

### Diff đề xuất — `tools/thap-ver.py` (= /home/claude/pubtools/thap-ver.py)
```diff
--- a/tools/thap-ver.py
+++ b/tools/thap-ver.py
@@ -32,6 +32,14 @@
 
 A = os.path.join(D, 'assets')
 anh = {}
+# chạy lại sau khi đã BỎ .png trùng (bên dưới): ảnh chỉ còn .webp → lấy lại băm cũ từ js/ver-anh.js lần trước
+CU_V, CU_W = {}, {}
+try:
+    _t = open(os.path.join(D, 'js/ver-anh.js'), encoding='utf-8').read()
+    CU_V = json.loads(re.search(r'var ANH_V = (\{.*?\});', _t).group(1)); CU_W = json.loads(re.search(r'var ANH_W = (\{.*?\});', _t).group(1))
+except Exception: pass
+for t, h in CU_W.items():
+    if not os.path.isfile(os.path.join(A, t + '.png')) and os.path.isfile(os.path.join(A, t + '.webp')) and t in CU_V: anh[t] = CU_V[t]
 for goc, _, ds in os.walk(A):
     for f in ds:
         if f.endswith(('.png', '.jpg')):
@@ -53,6 +61,8 @@
             if kq:
                 open(os.path.join(A, t + '.webp'), 'wb').write(kq)
                 W[t] = hashlib.sha1(kq).hexdigest()[:8]
+    for t in anh:  # .png đã bỏ ở lần chạy trước → giữ bản .webp đang có
+        if t not in W and t in CU_W and not os.path.isfile(os.path.join(A, t + '.png')) and os.path.isfile(os.path.join(A, t + '.webp')): W[t] = CU_W[t]
 # số byte từng ảnh (thanh % theo byte của màn tải)
 B = {}
 for goc, _, ds in os.walk(A):
@@ -136,4 +146,33 @@
 if os.path.isfile(sp):
     t = open(sp, encoding='utf-8').read(); t2 = re.sub(r"const V = '[^']*';", "const V = '%s';" % V, t, count=1)
     if t2 != t: open(sp, 'w', encoding='utf-8').write(t2)
+# ---- BỎ .png TRÙNG (bản xuất bản ~350 → ~150 MB; gói Spark 10 GB): ảnh có .webp → xoá .png. Tắt: THAP_BO_PNG=0.
+# Cần js/donet.js đổi đường dẫn .png dựng động sang .webp (ANH_W). Máy không đọc được webp (iOS < 14) sẽ thiếu các ảnh này.
+def bo_png_trung(D, A, W):
+    """Bản xuất bản: ảnh đã có .webp (W) → xoá .png (nhánh nguồn giữ PNG). GIỮ .png còn bị trỏ thẳng ở chỗ không qua
+    anhUrl / donet.js (chuỗi .png tĩnh còn sót sau doiW, mẫu ghép 'assets/trum_' + id + '_portrait.png' → trum_*_portrait).
+    Mẫu ghép toàn phần ('assets/' + n + '.png') không giữ: đi qua donet.js (innerHTML/src/setAttribute/style) → .webp."""
+    mau = set()
+    for goc, _, ds in os.walk(D):
+        if os.sep + 'assets' in goc[len(D):]: continue
+        for f in ds:
+            if not f.endswith(('.js', '.css', '.html', '.json', '.webmanifest')) or f == 'ver-anh.js': continue
+            s = open(os.path.join(goc, f), encoding='utf-8', errors='ignore').read()
+            s = re.sub(r'/\*.*?\*/|<!--.*?-->', '', s, flags=re.S); s = re.sub(r'(^|[\s;{}(),])//[^\n]*', r'\1', s)  # bỏ chú thích
+            for m in re.finditer(r"assets/([^\n]{0,200}?)\.png", s):
+                dong = s[s.rfind('\n', 0, m.start()) + 1:m.start()]
+                if re.search(r"typeof anhUrl === 'function' \?[^:]*:\s*['\"]?$|typeof anhUrl === 'function' \? anhUrl\([^)]*\) : '?$", dong[-160:]): continue  # nhánh dự phòng khi thiếu anhUrl: không bao giờ chạy
+                g = re.sub(r"""['"`]\s*\+.*?\+\s*['"`]""", '*', m.group(1))  # ' + biểu thức + ' → *
+                if re.fullmatch(r'[\w\-/*]+', g) and g.strip('*/'): mau.add(g)
+    rx = [re.compile('^' + re.escape(g).replace(r'\*', r'[\w\-/]*') + '$') for g in mau]
+    bo = giu = 0; nb = 0
+    for t in W:
+        p = os.path.join(A, t + '.png')
+        if not os.path.isfile(p): continue
+        if any(r.match(t) for r in rx): giu += 1; continue
+        nb += os.path.getsize(p); os.remove(p); bo += 1
+    return bo, giu, nb, sorted(mau)
+BO = (0, 0, 0, [])
+if W and os.environ.get('THAP_BO_PNG', '1') != '0': BO = bo_png_trung(D, A, W)
+print('thap-ver: bỏ %d .png trùng (%.1f MB), giữ %d' % (BO[0], BO[2] / 1048576, BO[1]))
 print('thap-ver:', V, '·', len(anh), 'ảnh ·', len(W), 'webp ·', len(re.findall(r'\?v=', h)), 'tệp js/css')
```

## 4. Đã làm trên `claude/demo-hop-tuong`
- Xoá `thap/assets/kho_chong.png` (20 KB, rác đã chứng minh). Không nén ảnh (lý do ở mục 2).
- Kiểm: `tools/thap-kt-tu-kich.js` 29 đạt/0 lỗi · `tools/thap-kt-hinh-ui.js 390 844` errs [] (fps 60) · `tools/thap-kt-vetay-ui.js` errors 0 ·
  bò 17 màn (HOME, ?ucu=1, cửa hàng, trang ụ, trận, trùm) trên nhánh nguồn: 0 lỗi 404. Đã xem ảnh: menu, trận trùm w10, cửa hàng (hồ sơ mới → trận hướng dẫn).
- Ước lượng sau: nhánh nguồn −0,02 MB (không đáng kể); **chỉ đề xuất B mới giảm thật: ~376 → ~154 MB/bản**.
