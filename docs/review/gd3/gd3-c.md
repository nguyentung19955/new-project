# Phiên gd3-c — Giai đoạn 3, Nhóm 3C (Né chuẩn, hệ mẫu Băng, Khai huyệt, truyền linh khí)

Nhánh: `gd3-c` (tách từ `khoi-tao-du-an` sau GĐ2). Phiên này **chỉ sửa code, KHÔNG chạy bài kiểm tra nào** (đúng yêu cầu);
chỉ chạy `node --check` cho các tệp js đã sửa. Người điều phối cần chạy các bài kiểm tra ở cuối tệp này khi gộp.

Quyết định đã duyệt dùng ở đây: Q6 (làm Né chuẩn), Q7 (Khai huyệt + hoàn điểm), Q11 (truyền linh khí), Q13 (giữ bất tử né 0,32 s — không đổi).
Không đổi: hình nhân vật/quái, tự ngắm vào quái gần nhất, số Lửa/Độc/Băng, Nhát lướt ×1,4 (D2).

## Đã sửa gì

| Việc | Tệp / hàm | Sửa gì (số cũ → số mới) |
|---|---|---|
| **D1 Né chuẩn** (Q6) | `combat.js` — hàm mới `G.neChuan`, `G.NE_CHUAN = { mana: 5 }`; `G.hurtPlayer(amt, el, src, melee, don)` thêm tham số thứ 5 `don` | Đang lộn (`P.dodgeT > 0`) mà một **đòn có nguồn** chạm người (bị bất tử chặn) → **+5 mana** (không vượt mana tối đa), **tối đa 1 lần mỗi cú lộn** (`P.dodgeN` đếm cú lộn, `P.neN` cú đã thưởng). Ghi `W.stats.neChuan` (đếm cả ải). Tiếng `mark` một lần. Thứ tự kiểm tra trong `G.hurtPlayer` đổi nhưng kết quả như cũ: gục / đã thắng / `W.safe` thoát trước (không thưởng), rồi mới xét bất tử. |
| D1 — chỗ có cờ `don` | `combat.js` `updateWorld`, `strike`, cú lao `nimble` | **Có tính**: (1) vùng báo trước **nổ đúng khung** `z.t` về 0 (gồm đòn cận chiến của quái mới ở `mobs.js` vì chúng là vùng `melee`, vùng/vệt/đường nứt của trùm, bom); (2) đạn quái `W.projs`; (3) đòn chém và cú lao của quái kiểu cũ. **Không tính** (không gắn cờ): vũng `z.pool` (gồm vũng đọng lại sau nổ `z.then`), cháy/độc theo nhịp, chạm thân quái, gai phản đòn, sóng `z.wave` và tường nước `G.mobWall` (ở `mobs.js`, không thuộc phiên này). Lưu ý: "vệt Địa Chấn" trong yêu cầu là chiêu của **búa người chơi**; đòn nứt đất của trùm là vùng báo trước nên đã nằm trong (1). |
| D1 — hình | `fx.js` (chỉ thêm khối cuối tệp) `G.fx.neChuan(P, got)` | Vòng ngọc lục 2 lớp + vài đốm ngọc + một tia vàng đồng, chữ **"NÉ CHUẨN!"** ngọc lục 0,32 s; có hồi mana thì thêm "+5" xanh nhỏ (mana đầy thì không có số). Không rung, không khựng hình, không màu đỏ. |
| D1 — chữ hướng dẫn | `data.js` `G.HINTS` (thêm câu **cuối**, không đổi thứ tự câu cũ) | "Lộn né đúng lúc một đòn của quái … là Né chuẩn: hồi 5 mana, mỗi cú lộn một lần." |
| **M4** "Bắt bài lăn né" | `boss.js` `G.computeLayers` | Trước: `dodges > 15`. Nay: **né rỗng** = `dodges − neChuan` **> 30**. |
| **D2** Nhát lướt | — | Giữ ×1,4 (không sửa). Bất tử/huỷ của Nhát lướt đã làm ở GĐ1 (V33). |
| **V86 / D7 hệ mẫu Băng** | `fx.js` dòng vẽ số tầng Băng trên đầu quái (sửa 1 dòng) | Đủ **4/5 tầng** (và quái không đang "miễn đóng băng") thì số tầng **chớp trắng có viền trắng** (8 lần/giây): đánh thêm một nhát là đóng băng. |
| V86 | `combat.js` `G.applyStatus` (chỗ đủ 5 tầng) | Đếm vào sổ ải `W.stats.ice = { freeze, cancel }`: `freeze` = số lần đóng băng/choáng băng (mọi nguồn, cả chưởng), `cancel` = quái thường **đang lấy đà** (`e.act` chưa ra đòn, hoặc `e.wind > 0`) bị đóng băng → `mobs.js` huỷ đòn. Khi huỷ được thì hiện chữ **"Huỷ đòn!"** trắng xanh trên đầu quái. Không đổi số nào của Băng. |
| V86 — chữ | `data.js` `G.HINTS[4]` (trang "Ba hệ") | Câu Băng: "…đủ 5 tầng thì đóng băng (số tầng chớp trắng ở 4: thêm một nhát), huỷ luôn đòn quái đang lấy đà." |
| V46 búa Băng | — | Đã có từ GĐ2 (`chance *= cd/0,36`), không sửa thêm. |
| **V37** (phần hình/đẩy lùi) | `moves.js` `push`, Quét vòng của giáo | Tinh anh bị đẩy/hất **40%** quãng của quái thường (trước 100%). |
| V37 | `combat.js` `playerHit` + `fx.js` `G.fx.blockSpark(e, P)` | Đánh vào mặt khiên / giáp (`G.mobArmor(e) > 0`, không phải trùm) → thêm 4 tia trắng xám bật ngược về phía bé. |
| V37 / M7 | `moves.js` `G.MOVE_TIPS.hammer` | Thêm "mỗi nhát làm quái khựng, cắt đòn nó đang lấy đà" (búa không đẩy lùi). |
| **D6 Khai huyệt** (Q7) | `data.js` `G.SKILLS.atk.nodes[3]`, `G.KHAI_HUYET = { mult: 1.12, power: 0.04 }` | Nút Công 4: "Sát thương +8%" → **"Khai huyệt: đòn nặng trúng quái đang lấy đà/vừa ra đòn +12% (không cộng chí mạng)"**. Giữ vị trí nút (bản lưu cũ đọc được). |
| D6 | `combat.js` `G.buildPlayer` | `dmgMult`: trước `1 + 0,08 (Công 1) + 0,08 (Công 4)` → nay `1 + 0,08 (Công 1)`; thêm `P.khaiHuyet = sk.atk >= 4`. |
| D6 | `combat.js` `playerHit`, hàm mới `G.khaiOpen(e)` | Đòn có cờ `o.kh` và bé có Khai huyệt, **không chí mạng**, quái đang "hở" → sát thương ×1,12 + chấm sáng vàng (`G.fx.khaiHuyet`). "Hở": quái mới có `e.act` (từ lúc báo trước tới hết động tác); quái cũ `e.wind > 0`; trùm `wind > 0` / `tired > 0` / `exposed > 0` / `busy > 0` khi không bất tử. |
| D6 — đòn nặng (`kh`) | `moves.js` `M.hit` (chém), Quét vòng, `hammerSlam`; `combat.js` tên bay, `doHit` cũ | Kiếm **nhát kết** (nhát 3), giáo **Quét vòng**, búa **Nện đất mạnh** (nấc lấy đà cao nhất), cung **tên nạp đầy** (`charged >= 1`). Không gồm đòn Đặc biệt, Mưa Tên, Xốc tới. |
| D6 — Sức mạnh | `combat.js` `G.powerParts` | Khai huyệt cộng **ước tính +4%** phần đòn (`G.KHAI_HUYET.power`, **chưa đo**). Kết quả: người có Công 4 thấy Sức mạnh giảm nhẹ (từ +8% xuống +4%). |
| D6 — hoàn điểm | `upgrade.js` `G.upg.khaiHuyetFix`, bọc `G.newSave` và `G.fixSave` | Bản lưu **cũ** (chưa có cờ `khaiHuyet`) có em bé đã học Công ≥ 4 → nhánh Công lùi về **3**, điểm Công 4 (và Công 5, vì phải học theo thứ tự) thành điểm chưa dùng. Làm một lần cho cả bản lưu (cờ `sv.khaiHuyet = 1`; `sv.khaiHoan` = số điểm đã hoàn). Bản lưu mới có sẵn cờ nên không bị hoàn nhầm. Chạy lúc đọc bản lưu trên máy **và** bản kéo từ mây (`cloud.js` gọi `G.fixSave`). Trường mới thiếu → mặc định đúng; bản lưu hỏng vẫn đi đường cũ của `fixSave`. |
| **V18 bước 2** (Q11) | `upgrade.js` `G.upg.lkEl`, `G.upg.lkInfo(sv, w)`, `G.upg.lkTruyen(sv, fromId, toId)` | Món nguồn giữ đúng **300** linh khí của hệ nó (vẫn Thức tỉnh), phần **vượt 300** chuyển nguyên (không hao, không tốn) sang món **cùng loại**, khác món, chưa khoá hệ hoặc khoá đúng hệ đó. Món đích đủ 30 thì khoá nhánh hệ như `G.addMarks`. Trả `{ ok, n, el, msg }` với câu tiếng Việt. **Không** tự `G.persist()` (người gọi làm). |
| Bài kiểm tra (chỉ sửa, chưa chạy) | `tests/rules.py`, `tests/anim_smoke.py`, hàm bọc `G.hurtPlayer` trong `au_lib.js`, `setup.js`, `dps.py`, `au_he.py`, `au_ne_thuong.py`, `au_vu_khi.py`, `au_spam.py` | rules: ngưỡng mới (31 né → có lớp, 30 → không) + ca "Né chuẩn không tính là né rỗng". anim_smoke: `dodges = 30 → 45` để vẫn gặp lớp. Hàm bọc chuyển cả tham số thứ 5 (trước chỉ 4 → Né chuẩn không bao giờ chạy trong các bài đo đó). |

## Đề nghị cho người điều phối (phần nằm ở tệp phiên khác)

1. **Lò rèn — truyền linh khí** (`village.js`, phiên gd3-b): trong thẻ của một vũ khí, nếu `G.upg.lkInfo(G.save, w).du > 0` thì hiện nút
   "Truyền N linh khí" → chọn một món trong `info.dich` → gọi `G.upg.lkTruyen(G.save, w.id, dich.id)`, nói `kq.msg`, rồi `G.persist()`.
   Gợi ý câu của Thợ Rèn: "Món này đã quá 300 linh khí. Lão chuyển phần dư sang một món cùng loại cho con nhé."
   Lưu ý: món đích lên thẳng Thức tỉnh nhờ truyền thì **chưa được đặt tên** như khi tích dần (`nameWeapon` trong `combat.js` chỉ chạy qua `G.addMarks`); nếu cần, phiên làng gọi lại tên sau khi truyền.
2. **Báo hoàn điểm** (`village.js`, Cụ Đồ): nếu `G.save.khaiHoan > 0` thì nói một câu "Nút Công 4 đổi thành Khai huyệt, lão trả lại con N điểm để học lại." rồi đặt `khaiHoan = 0` và `G.persist()`. Chưa làm thì người chơi vẫn thấy "Còn N điểm".
3. **Dòng Băng ở màn kết quả / bảng thua** (`stage.js`): đọc `S.stats.ice` (`{ freeze, cancel }`, có thể chưa có → coi là 0); nếu `freeze > 0` thì một dòng "Băng: X lần đóng băng, Y đòn quái bị huỷ". Có thể thêm "Né chuẩn: N lần" từ `S.stats.neChuan`.
4. `G.HINTS` thêm 1 câu ở cuối; nếu có chỗ hiện mẹo theo số thứ tự cố định thì không ảnh hưởng.

## Cần kiểm tra khi test

1. **Né chuẩn** (`au_ne.py`, thêm ca):
   - Lộn qua vùng báo trước của quái/trùm đúng lúc nổ → mana +5 đúng một lần, có vòng ngọc lục + "NÉ CHUẨN!".
   - Đứng/lộn trong vũng độc/lửa/băng (`z.pool`) → **+0**. Đang cháy/độc theo nhịp → +0. Lộn xuyên thân quái đang đi → +0.
   - Mưa đạn: nhiều viên trong một cú lộn → **+5 một lần**. Lộn tiếp cú mới → được thưởng lại.
   - Mana đầy → vẫn có chữ "NÉ CHUẨN!", không có "+5".
   - Sau khi hạ trùm (`W.safe`), đã gục, `W.over` → không thưởng.
   - Đếm `S.stats.neChuan` tăng đúng số lần.
2. **M4**: `au_trum_hoc.py` — người né nhiều nhưng né đúng đòn hiếm gặp "Bắt bài lăn né"; bot né bừa > 30 lần rỗng vẫn gặp. `tests/rules.py` (ca đã sửa). `anim_smoke.py` vẫn thấy lớp này.
3. **`au_ne_thuong.py`**: có/không né — chênh lệch nay gồm cả mana Né chuẩn (đòn Đặc biệt nhiều hơn).
4. **Khai huyệt**: `tests/cay.py` (cây kỹ năng, bot `G.upg.auto` học nút 4 khi `gain` > 0 — nay gain ~+4% thay vì +8%), `tests/dps.py` (đổi `dmgMult` khi `sk.atk >= 4`: bài nào giả định ×1,16 sẽ lệch), `tests/chuong.py`. Thử tay: kiếm nhát 3 vào quái đang có vòng báo → số to hơn ~12%, chấm vàng; đòn chí mạng thì không có chấm vàng. `tests/hanh_trang.py` / `ui_shots.py`: chữ nút Công 4 dài hơn — xem cột "Cây kỹ năng" trong Hành trang và hàng "Tiếp:" ở Cụ Đồ không tràn khung.
5. **Hoàn điểm** (`au_luu_hong.py`, `tests/ui_input.py`): bản lưu cũ có `sk.atk = 4` (hoặc 5), không có `khaiHuyet` → sau khi đọc: `sk.atk = 3`, `khaiHuyet = 1`, `khaiHoan = 1` (hoặc 2), số điểm chưa dùng tăng đúng. Đọc lại lần hai (đã lưu) → không hoàn nữa. Bản lưu mới (`G.resetSave`) có `khaiHuyet = 1`; `G.testSave({ sk: { atk: 5 } })` giữ nguyên 5. Bài nào so bản lưu sau `fixSave` y hệt bản đưa vào sẽ thấy thêm trường `khaiHuyet`.
6. **Băng** (`au_he.py`): số st/giây, khống chế, tốc độ quái **không đổi**. Ảnh `vfx_tg_shots.py`: số tầng chớp trắng ở 4 tầng, không chớp khi đang miễn đóng băng; chữ "Huỷ đòn!" không che vùng báo quá lâu (dùng chữ nổi sẵn có 0,75 s).
7. **V37**: `tests/quai.py`, `tests/smoke.py`; tinh anh bị đẩy ít hơn rõ; đánh khiên có tia xám (`au_phan_hoi_shots.py`).
8. **Truyền linh khí** (`tests/linhkhi.py`, thêm ca bằng tay trong console):
   `w.marks.ice = 412; w.branch = 'ice'` → `G.upg.lkInfo(G.save, w)` cho `du = 112`, `dich` chỉ gồm món cùng loại chưa khoá hệ/khoá Băng →
   `G.upg.lkTruyen(G.save, w.id, x.id)` → nguồn còn 300, đích +112, đích khoá Băng nếu đủ 30. Truyền sang khác loại / đã khoá hệ khác → `ok: false`, không đổi gì.
9. Hiệu năng: `G.fx.neChuan` tối đa 1 lần/cú lộn; `blockSpark` mỗi đòn trúng khiên 4 tia — xem `au_hieunang.py` với bầy quái khiên.
10. Không lỗi console khi chạy không vẽ (`G.noRender`): các hàm hình đều qua `api` (bỏ qua khi không vẽ).
