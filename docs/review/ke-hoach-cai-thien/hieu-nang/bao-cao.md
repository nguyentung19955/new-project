# Báo cáo: dọn tệp không dùng + kiểm và tối ưu hiệu năng

Theo `YEU-CAU.md` cùng thư mục. Nhánh `khoi-tao-du-an`, commit chính **`0acb265`** (đã gộp sau `ea45a49` "Ngu Tinh pha 2, 3"; xung đột chỉ ở `game/dist`, đã lấy bản trên nhánh rồi chạy lại `python3 game/build.py`).
Đã đọc `don-code/bao-cao.md`. Chưa có `he-thong-moi/bao-cao-5.md`, nên phiên này **không đụng `data.js`** và không đụng bài kiểm cân bằng (dps, campaign, cay, balance, bot.js, setup.js, cay_luu.json).

## Tóm tắt

- **Vào game nhanh hơn rõ.** Bản web (hai tệp), mạng 4G giả lập, CPU chậm 4 lần: khung hình đầu từ **4,0 s xuống 2,0 s** khi không tải được phông Google (chơi ngoại tuyến, mạng chặn), và từ **2,4 s xuống 2,0 s** khi tải được phông.
- **Trong trận dùng ít bộ nhớ hơn.** Bộ nhớ JS lúc cao nhất giảm gần một nửa (trận đông: 56 → 29 MB). Rác tạo ra mỗi giây giảm 2,5 lần.
- **Ải thường: mỗi khung tốn ít thời gian JS hơn.** Trung bình 14,4 → 11,5 ms. Số khung chậm hơn 50 ms giảm 55 → 36.
- **FPS trận đông gần như không đổi** (11,6 → 11,8). Chỗ tốn nhất là phần xoá vùng báo đỏ chỗ nhân vật đứng (mục 4.1). Muốn giảm nó thì phải đổi cách vẽ, nên tôi chưa sửa và để chủ dự án quyết.
- **Dọn tệp mới làm được một phần nhỏ.** Đã xoá 29 tệp (0,84 MB) trong `game/tests` và `tools`. Phần lớn là **224 MB trong `docs/anh-goc`** (181 tệp: `debug.png`, GIF xem thử, ảnh gốc nhân vật cũ). Hệ thống chặn quyền xoá trong `docs/`, nên phần này **chưa xoá**. Danh sách đầy đủ ở `de-xuat-xoa-anh-goc.txt`. Xem mục 1.3.

## 1. Dọn tệp

### 1.1 Đã xoá (29 tệp, 841 084 byte)

| Nhóm | Tệp | Vì sao |
|---|---|---|
| `game/tests` (17 bài + 4 kết quả, 239 KB) | `ban_do.py`, `trang_phuc.py`, `trang_phuc_bang.py`, `trang_phuc_shots.py`, `trangphuc_shots.py`, `ghep.py`, `ghep_shots.py`, `ghep2_shots.py`, `co_vk_shots.py`, `don_vk_shots.py`, `shots.py`, `ui_shots.py`, `lang_shots.py`, `cay_shots.py`, `au_noi_dung.py`, `xuong_sprite_shots.py`, `xuong_sprite_them_shots.py`, `diff2.sh`, `au_he_ketqua.json`, `au_spam_ketqua.json`, `au_trum_ketqua.json`, `au_vu_khi_ketqua.json` | Thử các hệ đã bỏ ở đợt 2: `js/ban_do.js`, `js/outfit.js` (`G.outfit`), `G.TIER_UP`, `G.GEAR`, `G.DON_VK`, `sv.owned`, ảnh `vk-*`/`tp-*`/`em-be-*-don`. Không còn chạy được (lỗi hoặc treo chờ ảnh đã xoá). Các tệp `*_ketqua.json` là kết quả cũ ngày 10/10; bài `au_*` tự ghi lại khi chạy, và không ai đọc chúng. |
| `tools/tach-ghep-lop/` (451 KB) | 3 tệp | Ghép lớp Zed: `js/ghep_lop.js` đã xoá ở đợt 2 |
| `tools/tach-ghep/` (115 KB) | 1 tệp | Ra tệp `doi_tuong: "ghep"`, nhưng `build.py` nay từ chối loại này |
| `tools/vk-cap-he/` (25 KB) | 2 tệp | Mẫu vũ khí cũ, chờ ảnh `vk-sword-0` đã xoá (treo) |
| `tools/bot-mau-vu-khi.py` (11 KB) | 1 tệp | Chỉnh màu cho `vk-*.sprite.json`, mà cả 160 tệp đã xoá |

Sửa kèm:
- `game/README.md`: bỏ 9 dòng chạy bài đã xoá.
- `game/tests/moves.py`: bỏ câu "xem thêm tests/ghep.py".
- 7 trang `tools/tach-*/index.html`: bỏ link "Ghép đồ" trên thanh điều hướng. Workflow tự chép mọi `tools/tach-*/index.html`, nên không phải sửa workflow.

### 1.2 Giữ lại (có kiểm)

| Giữ | Lý do |
|---|---|
| Cả 405 tệp `game/art/custom/*.sprite.json` | Mỗi mã đều được game gọi tới, trực tiếp hoặc theo tiền tố ghép chuỗi: `'hu-'+…+'-'+hệ`, `gd-cua-<vùng>-…`, `gd-tt-…`, `nl-`, `vp-`, `em-be-`, `zed-*` theo `G.ZED_BO`, quái theo `G.MOB_ART`, `-p2`/`-p3` theo `PHA_MA` |
| `vp-potion`, `vp-stone` | Có lẽ không còn rơi ra nữa, nhưng mã vẫn có đường tới (`resIcon`, chữ "đá tôi" ở `upgrade.js`). Chưa chắc chắn nên giữ. |
| `game/art/du-tru/ho-lua-tu-hoTinh-cu.sprite.json` | Game không nạp tệp này, nhưng được giữ có chủ ý làm dự trữ cho vùng Núi lửa (commit `34069d2`, bao-cao-2) |
| `game/dist/*` (4 tệp) | Đều do `build.py` ghi ra và được dùng. `artifact.html` không được đăng nhưng bài `ui_build.py` vẫn dùng. |
| `tools/tach-do`, `tools/tach-anh-hung` | Một phần đã chết (lô vk/tp, em-be-smith), nhưng lô `vp-*`, người làng và 3 em bé NPC vẫn dùng |
| Bài kiểm còn hỏng một chỗ nhỏ (doors, fuzz, fx_check, rules, linhkhi, hanh_trang, ui_input, xuong_sprite, au_bang) | Hệ được thử vẫn còn. Chỉ một đoạn hỏng: `testSave` với `armor`/`helm` gọi `sv.owned` (lỗi chung ở `tests/setup.js` dòng 30–32), hoặc `G.LK_PHU`. Phiên này không được sửa bài kiểm, nên tôi để phiên sau sửa. |

### 1.3 CHƯA xoá: bị hệ thống từ chối quyền (chủ dự án quyết)

Tôi đã thử `git rm` những tệp mà `YEU-CAU.md` cho phép xoá trong `docs/anh-goc`. Bộ phân loại an toàn của phiên chạy tự động **từ chối mọi lệnh xoá trong `docs/`** (lý do: "xoá cục bộ không hoàn tác được"), kể cả với tệp đã nằm trong lịch sử git. Tôi không tìm cách lách. Danh sách từng tệp kèm số byte ở **`de-xuat-xoa-anh-goc.txt`**:

| Nhóm | Số tệp | Dung lượng | Bằng chứng không còn dùng |
|---|---|---|---|
| `debug.png` trong `zed/moi/*-gif/`, `zed/trang-phuc/bo-*/…-cat/`, `trum-moi/ho-tinh/*-cat/` | 130 | 188,9 MB | `cat-diem-anh.py` chỉ ghi ra, không công cụ nào đọc. **Thư mục `*-gif/` thì PHẢI GIỮ**: khung `khung-NN.png` + `bao-cao.json` là đầu vào của `dung-zed-game.py`, `cam-vk.py`, `tim-tay.py`. |
| GIF xem thử (`03-chay-v3-gif/*.gif`, `03-chay-v4-gif/*.gif`, `vk-kiem-4cap.gif`, `mau-tu-the/mau-chay-v4*.gif`) | 7 | 1,45 MB | Không tệp nào tham chiếu |
| Ảnh gốc nhân vật / trang phục cũ trong `2026-10-12/`: 4 tấm `em-be-*-don`, 3 tấm `chem-kiem-*`, `chay-smith`, `ve-lai-mu-9`, `ve-lai-do-lung-3`, thư mục `than-bo/` | 44 | 33,8 MB | Nguồn của tệp đòn `-don`, thân theo bộ, `tp-*` và Cu Tí, mà đợt 2 đã xoá. **Giữ** nguồn của 3 NPC (`chay-hunter/healer/wrestler`, `em-be-healer-than`) và `nl-do-cu-do`. |
| **Cộng** | **181** | **224,1 MB** | |

Không có bản `-PHUC-HOI` nào trong `docs/anh-goc`. Trong `docs/review`, không có GIF nào trong `kiem-thu/` lớn hơn 1 MB. Năm GIF trên 1 MB đều nằm ở `dang-chay/` và `chem-kiem-muot/`, và báo cáo vẫn trỏ tới chúng, nên giữ.

Thấy thêm (không thuộc danh mục được phép xoá, chỉ ghi lại):
- `docs/LINH_KHI_AI_ART_HANDOFF.zip` (12 MB): gần như trùng với thư mục cùng tên.
- `godot/linh-khi-godot` (31,9 MB): bản mẫu Godot 10/10, không gì trong game, công cụ hay workflow dùng tới.

Muốn xoá thì chạy tay `git rm` theo `de-xuat-xoa-anh-goc.txt`, hoặc cho phép phiên sau xoá trong `docs/`.

### 1.4 Dung lượng trước / sau

| | Trước (`ea45a49`) | Sau (`0acb265`) |
|---|---|---|
| Tệp trong git (cây làm việc) | 4 707 tệp, 1 403,24 MB | 4 684 tệp, **1 402,48 MB** (−0,76 MB) |
| `game/tests` + `tools` | 188 tệp, 5,01 MB | 159 tệp, 4,17 MB |
| `du -sh` thư mục làm việc (không tính `.git`) | 1,2 G (đo lúc bắt đầu, trước khi nhánh nhận thêm ảnh Ngu Tinh / ép đồ) | 1,4 G |
| `git count-objects -vH` size-pack | 1,52 GiB | 1,57 GiB |

Git giữ nguyên lịch sử, nên xoá tệp không làm `.git` nhỏ đi. `.git` lớn lên do các commit ảnh mới của phiên khác. Xoá 224 MB ở mục 1.3 sẽ làm cây làm việc nhỏ đi 16%.

## 2. Cách đo

- **Công cụ:** `do.py` cùng thư mục. Chỉ đo, không có bài kiểm chức năng nào.
- **Trình duyệt:** Chromium có sẵn ở `/opt/pw-browsers` (không chạy `playwright install`). Trang mở với `?cloud=0`.
- **Giả lập điện thoại:** 844×390, dpr 3, chạm, CPU chậm 4 lần (CDP). Máy kiểm tra có 2 lõi và **không có GPU**: canvas vẽ bằng phần mềm. Vì vậy phần dán hình / ghép lớp cũng chậm hơn điện thoại thật, và số đo chỉ để so trước/sau.
- **Máy chủ tĩnh:** tự viết, nén gzip HTML/JSON như Firebase Hosting, không lưu đệm.
- **Hai kiểu mạng:** "4G" (10 Mbit/s, trễ 70 ms) và không giới hạn.
- **Phông Google:** mặc định bị chặn, giống mạng chặn Google hoặc chơi ngoại tuyến. Có thêm lượt `LK_PHONG=co`: tệp CSS phông trả về ngay, giống mạng tải được phông.
- **Đo xen kẽ:** `do.py so-sanh <dist bản trước> 3` đo 3 vòng, xen kẽ bản trước (`dist` dựng từ `73ae835`) và bản sau, rồi lấy trung bình. Cách này chia đều nhiễu của máy cho hai bên. Mỗi cảnh FPS đo 15 giây, sau 3 giây làm nóng.
- **Bốn cảnh FPS:**
  - **Màn chào.**
  - **Làng:** Zed đi qua lại liên tục, để làng vẽ đủ khung.
  - **Ải thường vùng 1:** ải 1-2, bot tự chơi.
  - **Trận đông:** vùng 3 Lâu đài, ải 3-3, 18 quái liên tục (máu ×6 nên vẫn chết, có hiệu ứng quái chết). Vũ khí Thức tỉnh hệ Lửa. Bot chạy chém, cứ ~1,2 giây ra đòn Đặc biệt (kiếm: Trảm Nguyệt; phi tiêu: mưa phi tiêu), ~3 giây đổi vũ khí.
- **Cách tính các số:**
  - "JS/khung": thời gian chạy hàm `frame` của engine.
  - "Khoảng cách": thời gian giữa hai khung, gồm cả phần dán hình của trình duyệt.
  - Bộ nhớ: lấy `performance.memory` mỗi 0,25 giây.
  - Hồ sơ CPU: CDP Profiler (lấy mẫu mỗi 200 µs). Lệnh vẽ của trình duyệt (`drawImage`…) được tính cho hàm JS đã gọi nó.

## 3. Bảng hiệu năng trước / sau

### 3.1 Tải trang (trung vị / trung bình 3 lần)

Cột trái là **trước**, cột phải là **sau**.

| Bản, mạng, phông | Trang về xong | **Khung hình đầu (chơi được)** | Ảnh màn chào/làng xong | Mọi ảnh xong | Byte tải | Ảnh tải sau |
|---|---|---|---|---|---|---|
| Hai tệp (web), 4G, phông bị chặn | 0,94 / 0,92 s | **4,01 / 2,02 s** | 7,40 / 7,32 s | 14,4 / 14,0 s | 8,49 MB (trang 0,87 MB + ảnh 7,63 MB) | 405 |
| Hai tệp, không giới hạn, phông bị chặn | 0,10 / 0,12 s | **3,29 / 1,53 s** | 5,09 / 6,19 s | 8,8 / 10,1 s | 8,49 MB | 405 |
| Hai tệp, 4G, phông tải được | 0,89 / 0,89 s | **2,44 / 1,98 s** | 7,77 / 7,20 s | 14,3 / 14,3 s | 8,49 MB | 405 |
| Hai tệp, không giới hạn, phông tải được | 0,09 / 0,12 s | **1,88 / 1,63 s** | 6,14 / 6,32 s | 9,5 / 10,2 s | 8,49 MB | 405 |
| Một tệp, 4G, phông bị chặn | 16,9 / 17,0 s | 23,6 / 23,3 s | (nhúng sẵn) | — | 17,76 MB | 0 |
| Một tệp, không giới hạn, phông bị chặn | 2,77 / 2,75 s | 9,86 / 9,19 s | (nhúng sẵn) | — | 17,76 MB | 0 |

Ghi chú:
- **Khung hình đầu** là lúc màn hình tải biến mất và màn chào đã vẽ, bấm được.
- **Mạng không giới hạn:** ảnh làng / mọi ảnh xong muộn hơn ~1 s. Lý do: màn chào nay chạy sớm hơn 1,8 s và tranh CPU với việc giải mã ảnh. Trước đây máy ngồi chờ phông 1,2 s, nên giải mã ảnh có CPU rảnh. Người chơi vẫn thấy màn chào sớm hơn nhiều. Ảnh chưa về thì game vẽ bằng code, như trước.
- **Bản một tệp** (chỉ dùng cho trang công cụ / GitHub Pages) nặng 17,8 MB sau nén, nên thời gian tải gần như toàn là thời gian mạng. Đã có bản hai tệp cho người chơi, nên tôi không tách thêm.

### 3.2 FPS và bộ nhớ (trung bình 3 vòng xen kẽ, CPU chậm 4 lần)

Cột trái là **trước**, cột phải là **sau**. Thời gian tính bằng ms.

| Cảnh | FPS | Khoảng cách TB | JS/khung TB | JS/khung p95 | Khung > 50 ms (trong 15 s) | Đỉnh heap JS | Rác MB/giây |
|---|---|---|---|---|---|---|---|
| Màn chào | 26,5 / 26,1 | 38,0 / 38,3 | 2,20 / 2,22 | 6,2 / 6,1 | 41 / 37 | 25,5 / **21,2** MB | 0,99 / 0,93 |
| Làng (đi lại) | 38,0 / **40,2** | 26,4 / 25,0 | 5,76 / 5,47 | 13,8 / 13,0 | 11 / 8 | 26,2 / **21,8** MB | 2,06 / 2,03 |
| Ải thường vùng 1 (bot) | 27,7 / **29,6** | 36,1 / 33,8 | 14,4 / **11,5** | 38,0 / **26,7** | 55 / **36** | 40,6 / **24,5** MB | 3,47 / **1,65** |
| Trận đông vùng 3 | 11,6 / 11,8 | 86,5 / 84,6 | 61,7 / 59,2 | 110 / 100 | 151 / 161 | 56,0 / **28,8** MB | 5,65 / **2,11** |

Cách đọc bảng:
- **Màn chào và làng:** JS chỉ tốn 2–6 ms mỗi khung. Phần còn lại là trình duyệt dán hai lớp canvas (thế giới 960×540, chữ 1624×780) bằng CPU, vì máy kiểm tra không có GPU. Điện thoại thật có GPU làm phần này. Muốn tiết kiệm ở đây thì phải vẽ thưa hơn, tức là đổi hình, nên tôi không làm.
- **Trận đông:** số khung > 50 ms tăng 151 → 161, chênh trong mức nhiễu. FPS và JS gần như không đổi. Chỗ tốn nhất (vùng báo đỏ) chưa sửa được, xem mục 4.1.

### 3.3 Hồ sơ CPU trận đông: 10 mục tốn nhất (ms mỗi khung, CPU chậm 4×, gồm lệnh vẽ mà hàm đó gọi)

| # | Trước | ms | Sau | ms |
|---|---|---|---|---|
| 1 | (program): dán hình, việc ngoài JS | 29,1 | (program) | 23,0 |
| 2 | `maskOut` bao_truoc.js:325 | 24,3 | `maskOut` bao_truoc.js:325 | 22,1 |
| 3 | `BT.snap` bao_truoc.js:271 | 6,7 | `BT.snap` | 4,4 |
| 4 | `vienBe` fx.js:2267 | 4,9 | `vienBe` | 4,3 |
| 5 | `khungThan` sprite_custom.js:265 | 3,0 | `khungThan` | 2,2 |
| 6 | `drawParts` fx.js:265 | 1,5 | `drawParts` | 1,3 |
| 7 | `BT.draw` bao_truoc.js | 1,5 | `BT.draw` | 1,1 |
| 8 | (dọn rác) | 1,1 | (dọn rác) | 1,0 |
| 9 | **`toCanvas` hero_tinhlinh.js:147** (dựng hình em bé code cho vệt chém) | 1,1 | `veLop` zed_moi.js:468 | 0,8 |
| 10 | (idle) | 1,1 | `MA.draw` monster_art.js | 0,7 |
| | **Tổng mỗi khung** | 116 | | 85 |

Mỗi bên chỉ đo một lượt hồ sơ, nên tổng dao động nhiều. Bảng 3.2 (3 vòng) đáng tin hơn.

Tạo / đọc ảnh mỗi khung trong trận đông (lượt đếm riêng):

| Mỗi khung | Trước | Sau |
|---|---|---|
| canvas mới | 6,7 | 6,3 |
| getImageData | 3,6 | 4,4 |
| putImageData | 5,2 | 5,9 |
| `ctx.filter` | 1,0 | 1,0 |

- **canvas mới:** chủ yếu là `khungThan`: quái đang cháy, mỗi khung hình × mức nhuộm là một tấm mới. Tấm được nhớ lại, nên đây là lần đầu dựng, không phải dựng lặp vô ích. Đo A/B: tắt hẳn nó cũng không đổi FPS.
- **getImageData, putImageData:** đều của `khungThan`, chênh theo lượng quái đang cháy.
- **`ctx.filter`:** bộ lọc SVG của mặt nạ vùng báo.
- **Đã hết hẳn** việc dựng hình em bé code mỗi khung: 0,9 canvas/khung, ~25 KB rác/khung (`Spr` ở hero_tinhlinh.js:34).

## 4. Đã tối ưu gì (đều không đổi hình, không đổi luật)

| # | Sửa | Đo thấy | Vì sao kết quả y hệt |
|---|---|---|---|
| 1 | `index.html` + `js/main.js`: link phông Google ghi `data-loi` khi lỗi. Nếu tệp CSS phông đã **lỗi trước khi** mã game chạy, vào màn chào ngay. | Trước đây sự kiện `error` đã qua trước khi `main.js` gắn bộ nghe (trang nặng 2,7 MB mã, chạy ~1,5 s), nên game luôn chờ đủ 1,2 s. Khung hình đầu: −1,2…−2,0 s khi phông bị chặn. | Phông không có thì sau 1,2 s game vẫn dùng phông dự phòng. Nay dùng ngay phông dự phòng đó. Khi phông tải được, đường chạy giữ như cũ. |
| 2 | `js/village_scene.js` `sprite()`: dò khung bao vật trong làng theo hàng trên / dưới rồi mép trái / phải, thay vì xét cả 720×270 điểm cho mỗi vật | Hàm `sprite` ~0,2 s (CPU 4×) trước khung hình đầu. Cùng mục 3 cho −0,25…−0,45 s ở lượt phông tải được. | Cùng khung bao: đã so 20 000 ảnh ngẫu nhiên, kết quả trùng hết |
| 3 | `js/monster_art.js` (và nguồn `docs/phac-thao/quai-hoat-hinh/nguon/may.js`): `w`, `h` trong `MA.list` tính lười (getter, lần đầu có ai đọc) | Trước đây lúc nạp trang dựng hình gốc của cả 36 quái (~0,15 s ở CPU 4×), dù quái đã có ảnh AI. Heap giảm ~4 MB ở mọi cảnh. | Cùng hàm `goc(d, 1)`, cùng số. Đã so cả 36 cặp `w`/`h` giữa hai bản: trùng hết. Lỗi vẫn ghi vào `MA.loi`, chỉ là lúc tính chứ không phải lúc nạp. |
| 4 | `js/hero_tinhlinh.js`: `G.tinhLinh.tip` (vệt chém) gọi `frame(o, _, nhe)`. Khung đã dựng thì dùng luôn, chưa có thì **chỉ tính tư thế** (cùng `pick`/`pose`/`finishPose`), không dựng hình em bé bằng code. | Vệt chém lấy mẫu nhiều thời điểm mỗi khung. Mỗi mẫu trước đây dựng một hình em bé code (canvas + ~25 KB mảng) rồi bỏ, vì Zed vẽ bằng ảnh AI. Kết quả: heap trận giảm một nửa, rác −50…−60%, JS ải thường −20%. | `tip` chỉ đọc `anim`, `f`, `v`, `weapon` (và `vkGhep` chỉ đọc `weapon`, `anim`, `f`). Đã so 164 lần gọi `tip` (4 vũ khí × 41 trạng thái) giữa hai bản: trùng hết. |
| 5 | `js/bao_truoc.js` `pxDraw`: dùng lại một vùng nhớ cho `ImageData` của vùng báo kiểu điểm ảnh, thay vì cấp mới mỗi khung (khung bao đổi cỡ gần như mỗi khung) | Bớt W×H×4 byte rác mỗi khung khi có vùng báo | ImageData là khung nhìn đúng cỡ W×H, xoá về 0 như tấm mới. Bước sải vẫn là W (bài `bt_khop.py` đọc `BT._px` như cũ). |

Kiểm sau khi sửa:
- `node --check` toàn bộ `game/js` và `tools/xuong-sprite/nguon` sạch.
- `python3 game/build.py` chạy hết (trang chính nén 0,83 MB, dưới trần).
- Mọi lượt đo không có lỗi trang (`pageerror`).
- Để chứng minh "y hệt", tôi có chạy game thêm để so số giữa hai bản: cỡ quái và 164 lần gọi `tip`. Đây là phần nằm ngoài "chỉ đo hiệu năng", nên tôi ghi rõ ở đây. Không thêm bài kiểm nào vào repo.
- Không đụng `firebase-config.js` hay `cloud.js`: đăng nhập Google, lưu mây, `?cloud=0` và đường đọc save cũ giữ nguyên.

## 5. Phát hiện chưa sửa (cần chủ dự án quyết)

### 5.1 Vùng báo đỏ "nằm dưới chân" là việc tốn nhất trong trận đông

**Cách làm hiện nay** (`bao_truoc.js`):
1. `BT.snap` chụp lớp thế giới trước khi vẽ nhân vật.
2. `maskOut` đọc lại lớp thế giới sau khi vẽ xong, so khác biệt, lọc SVG ra mặt nạ, rồi khoét vùng đỏ chỗ có nhân vật.

**Vì sao tốn:** mỗi lần **đọc lại canvas thế giới giữa khung** bắt trình duyệt vẽ xong mọi lệnh vẽ đang chờ ngay lúc đó. Đo A/B:
- Chỉ đọc 1×1 điểm ảnh vẫn tốn như cũ, nên phần tốn là việc đọc lại chứ không phải bộ lọc.
- Tắt mặt nạ (dùng cách xoá gần đúng hình bầu dục `bodies` có sẵn): JS mỗi khung trận đông giảm 55–64 → 21–26 ms, FPS 12–14 → 16–18.

**Vì sao chưa sửa:** không có cách nào giữ đúng từng điểm ảnh mà bớt được hai lần đọc lại. Cách bầu dục thì đổi hình.

**Gợi ý:**
- Bật cách gần đúng chỉ trên máy yếu (đo được thời gian khung cao), hoặc thêm lựa chọn trong cài đặt.
- Hoặc chấp nhận như hiện nay. Trên điện thoại có GPU (iPhone, phần lớn Android), đọc canvas → canvas rẻ hơn nhiều so với máy kiểm tra không GPU.

### 5.2 Viền sáng em bé tốn ~4,3 ms/khung (CPU 4×)

`vienBe` (độ đọc trận 12/10) vẽ lại Zed vào canvas phụ, rồi chồng 13 lần dời hình để làm viền.

Có thể gộp lại nếu ảnh chỉ có độ trong 0/255. Nhưng làm vậy thì không chắc kết quả đúng từng điểm ảnh, nên tôi không sửa.

### 5.3 Màn chào và làng: tốn ở phần dán hình của trình duyệt, không phải mã game

Bản một tệp 17,8 MB nén chỉ còn dùng cho trang công cụ.

## 6. Tệp trong thư mục này

| Tệp | Nội dung |
|---|---|
| `do.py` | Công cụ đo |
| `so-do-truoc.json`, `so-do-sau.json` | Số đo xen kẽ 3 vòng + hồ sơ CPU + đếm mỗi khung |
| `so-do-phong-truoc.json`, `so-do-phong-sau.json` | Tải trang khi phông tải được |
| `de-xuat-xoa-anh-goc.txt` | 181 tệp đề xuất xoá ở mục 1.3 |

Mã commit: dọn + tối ưu + công cụ đo **`0acb265`**. Báo cáo này nằm ở commit kế tiếp.
