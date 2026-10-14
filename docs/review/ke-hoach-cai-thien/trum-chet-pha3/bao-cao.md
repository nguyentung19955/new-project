# Báo cáo — trùm vùng: hiệu ứng chết vẽ tay, hiệu ứng giật, chiêu tròn pha 3 lệch (14/10)

Mọi thay đổi chỉ là **hình và vị trí cho đối xứng**: không đổi sát thương, thời gian chiêu, máu, số cân bằng.
Cờ tắt chung: **`?trumcu=1`** (hoặc `G.TRUM_MOI = false`, khai ở `js/data.js`) → mọi chỗ dưới đây về y hệt kiểu cũ.
Không chạy game, không test: chỉ xử lý ảnh, ảnh soát tĩnh, `node --check`, `build.py`.

Ảnh soát: `xem-vong-pha3.png` (chiêu tròn pha 3 trước/sau), `xem-khung-hieu-ung.png` (chồng khung trước/sau căn tâm + dòng thời gian khung cũ/mới).
Công cụ: `cong-cu/can-tam.py` (đo và ghi `can_tam`), `cong-cu/ve-soat.py` (vẽ hai ảnh soát), `cong-cu/anh_trum.py` (hàm chung).

## 1. Hiệu ứng chết còn vẽ tay

**Nguyên nhân.** Trùm vùng gục chạy ba lớp hình cùng lúc:
- cử động `die` của `js/monster_art.js` (`TRUM.chetLon`): nổ lốp bốp, tia toả, vòng sóng, chớp trắng, hạt; Mộc Tinh thêm lá rơi, Ngư Tinh thêm cột nước — **toàn vẽ tay**, vẫn chồng lên thân ảnh AI;
- `js/fx.js` `death`: chớp trắng cả màn hình + rung mạnh; `stepDying`: ảnh `hu-no-nho` nhưng vẫn kèm mảnh văng, khói và chớp trắng thân mỗi lần nổ; `bossEnd`: ảnh `hu-trum-no` nhưng vẫn kèm 9 tia, 22 mảnh, 8 khói, 12 đốm vàng, chớp cả màn hình;
- thân: hàng `die` của tấm pha 1 kéo giãn 6 khung trong 3,2–3,4 giây (~1,8 khung/giây). Ở pha 2, 3 tấm dáng pha **không có hàng `die`** nên game mượn hàng trúng đòn.

**Đã sửa** (chỉ khi trùm vùng đã có ảnh AI thân; trùm nhỏ, quái thường không đổi):
- `js/boss.js`: lúc gục truyền `o.fx = false` → bỏ hẳn mọi hiệu ứng vẽ tay của `TRUM.chetLon`, lá rơi, cột nước; bóng chân đứng yên (`o.bongGoc`).
- `js/fx.js`: bỏ chớp cả màn hình và chớp trắng thân; rung giảm (1 → 0,5, nổ cuối 0,6), khựng hình giữ; nổ nhỏ chỉ còn ảnh `hu-no-nho` (0,42 giây, mờ vào/ra); nổ cuối chỉ còn ảnh `hu-trum-no` (mờ ra ở khung cuối). Thiếu ảnh nổ thì tối thiểu một chớp / một vòng.
- `js/sprite_custom.js`: thân gục theo hàng `die` **của tấm pha đang ở** (`SC.phaTrum` đã nhận hàng `die`): quằn quại hàng trúng đòn 10 khung/giây, rồi hàng gục 10 khung/giây kết thúc đúng lúc bắt đầu mờ.
- Cổng ra (`hu-cong`) đã là ảnh — giữ nguyên. Rung `W.shake = 0.6` lúc hạ trùm (`js/combat.js`) là rung máy quay, không phải hình vẽ — giữ.

**Còn thiếu ảnh** (đã viết prompt trong `PROMPT-ANH.md`, mỗi prompt một khối kèm tên ảnh mẫu): hàng **gục** cho 6 tấm dáng pha `mocTinh-p2`, `mocTinh-p3`, `nguTinh-p2`, `nguTinh-p3`, `hoTinh-p2`, `hoTinh-p3`. Trong lúc chờ: thân pha 2/3 quằn quại bằng hàng trúng đòn của chính tấm pha rồi mờ — không vẽ gì bằng code. Có ảnh thì tách thành hàng `die` của tệp pha, game dùng ngay không sửa code.

## 2. Hiệu ứng trùm bị giật

**Nguyên nhân tìm được:**
1. **Ảnh kéo giãn theo thời gian chiêu** (`SC.chonQuai`): chiêu 2,2–2,6 giây → 40% đầu phát cả hàng báo trước, 60% sau phát hàng đánh 4–5 khung → ~3 khung/giây, một khung đứng 0,3–0,5 giây rồi nhảy. Chuyển pha: 8 khung trong 2,4 giây. Gục: 6 khung trong 3,4 giây.
2. **Điểm neo nhảy giữa các khung** (ảnh AI cắt không căn tâm): đo tâm thân trên sàn từng khung, độ dao động khi chồng idle + tele + atk: Hồ Tinh 25, Hồ Tinh p2 26, **Hồ Tinh p3 25** (đứng thở lệch neo +15, báo trước −6 → đổi hàng là thân nhảy ~22 điểm ảnh), Mộc Tinh p2 23, Ngư Tinh p2 17.
3. **Ảnh hiệu ứng đổi khung sai nhịp**: `hu-doi-pha` (chuyển pha) 3 khung trong ~1,1 giây + 4 khung trong ~1 giây; gai băng chuyển pha 3 của Ngư Tinh đứng khung 2 suốt ~0,8 giây; `hu-no-nho` 0,22 giây (~23 khung/giây, nháy); `hu-qua-doc-roi` ~7 khung/giây; `hu-xoay-nuoc`, `hu-gai-re`, `hu-cau-lua-ma` tính khung 10/giây trên đồng hồ đã làm tròn 12/giây → nhịp 2-1-1-1-1 khựng.
4. **Tắt phụt**: xoáy nước Ngư Tinh biến mất ngay ở mốc bung sóng; ảnh nổ hiện/tắt không mờ.
5. **Bóng chân rung** theo `P.x` của dáng vẽ code (rung lắc lúc gồng) trong khi thân ảnh AI đứng yên.
6. **Ảnh dáng pha tải trễ**: chỉ gọi tải lúc đã sang pha → vài khung đầu cảnh chuyển pha còn hình cũ rồi nhảy.
7. Không có khung lặp đầu–cuối trùng nhau (đã đo độ khác nhau từng cặp khung, không cặp nào gần 0).

**Đã sửa:**
- `can_tam` (mới, trong 9 tệp `.sprite.json`, đo từ ảnh bằng `cong-cu/can-tam.py`, ảnh giữ nguyên từng byte): độ dời ngang từng khung để tâm thân trên sàn trùng điểm neo. Hàng lặp (idle, move) căn từng khung; hàng một lần (tele, atk, hit, die) bỏ độ lệch cả hàng và một nửa độ nhảy từng khung (giữ một phần dáng nhoài). Sau căn: dao động còn 4–13 điểm ảnh (xem `xem-khung-hieu-ung.png`). `build.py` giữ mục `can_tam` (RUNTIME_KEYS).
- `SC.chonTrum` (mới): trùm vùng chạy ~12 khung/giây theo đồng hồ cử động — báo trước một lượt rồi đưa đi đưa lại 3 khung cuối, khung cuối rơi đúng mốc ra đòn `moc[0]`; hàng đánh một lượt rồi qua lại tới hết phần ra đòn `moc[1]`; sau đó về đứng thở. Chuyển pha: hàng báo trước một lượt rồi qua lại. Gục: như mục 1. Đo trên dòng thời gian: c4 Hồ Tinh 5,9 → 12,8 khung/giây, c5 Mộc Tinh 5,9 → 13,0, gục 1,8 → 10,3.
- `hu-doi-pha`: tụ khí 1-2-3-2 qua lại 10 khung/giây (mờ vào 0,1 giây), chớp, toả 4 khung 10 khung/giây, giữ khung cuối 0,15 giây mờ dần.
- Gai băng chuyển pha 3 Ngư Tinh: mỗi gai 5 khung 10 khung/giây, nổ lệch nhau, mờ ở khung cuối.
- `hu-no-nho` 0,42 giây (~12 khung/giây); `hu-qua-doc-roi` 0,45 giây (~11 khung/giây), lúc chạm đất vẫn trùng lúc vùng nổ (lead 0,14 → 0,09).
- Ảnh trong cử động dùng đồng hồ thật (`P.tr`) → đổi khung đều; xoáy nước mờ dần 0,15 giây thay vì tắt phụt; ảnh chiêu đặt theo vùng (`anhVung`) và ảnh nổ có mờ vào 0,05 / mờ ra 0,08 giây.
- Bóng chân đứng yên dưới thân ảnh AI (`o.bongGoc`). Tải sẵn ảnh dáng pha 2, 3 ngay khi trùm ra.
- Báo trước (`gd-bt-tron`, `gd-bt-vanh`): đo tâm ảnh lệch ≤ 1 điểm ảnh, không sửa. Khung lấp của vùng báo trước là thanh tiến độ (7 mức) gắn với mốc nổ, không phải hoạt ảnh nhịp — giữ nguyên (đã thử nội suy hai khung nhưng viền mờ chồng hai lần sẽ nháy, nên bỏ).

**Chưa xử lý:** Vồ mồi (Hồ Tinh c2) kéo dài báo trước bằng cách làm chậm đồng hồ cử động (`aspd`), nên đoạn báo trước của chiêu này chạy ~7 khung/giây thực — muốn đều phải truyền thêm thời gian thật vào `SC.chonTrum`.

## 3. Chiêu tròn lệch khi hoá cuồng pha 3

**Nguyên nhân lệch tìm được:**
1. **Thân pha 3 lệch điểm neo** (lý do chính trông "không đối xứng"): tâm thân Hồ Tinh p3 lúc đứng thở nằm lệch neo **15 điểm ảnh**, lúc báo trước lệch ngược −6; Mộc Tinh p3 lệch ~6. Vòng chiêu nổ đúng tâm chân `b.x, b.y` nhưng thân vẽ lệch, và **lật mặt (`face` theo hướng `a`) thì lệch sang phía kia** → vòng như lệch theo hướng mặt.
2. **Hồ Tinh c4 Vòng lửa ma**: cột đặt trên vòng tròn chưa dẹt (vòng trên sàn khác mọi vành/vùng tròn đều dẹt `G.ZK = 0,85`), sàn chỉ cao 86 điểm ảnh nên cột trên/dưới bị bỏ (`continue` khi quá mép ±8) → vùng thật hụt một bên khi trùm không ở giữa; trong khi hình vẽ code vẫn vẽ đủ 20 cột → hình và vùng sát thương lệch nhau.
3. **Hồ Tinh c5 Bão hồ hoả**: đạn xuất phát trên elip 14 × 10 nên đường bay không qua tâm (vòng méo); tia báo trước đợt 2, 3 lệch `(j % 3)·π/10` so với đạn thật `(j·0,5)/10 vòng` → **sai 12°, 24°**; thêm một vòng đạn giả vẽ code bay từ giữa thân (cao hơn chân ~31) → hai vòng khác tâm.
4. Hồ Tinh pha 3 có **7 ngọn lửa vẽ code** bám thân vẽ code, lệch hẳn một phía (`hh − 0,3`), chồng lên ảnh pha 3 vốn đã có lửa.
5. Ngư Tinh c5: vòng sóng bung vẽ tròn (`MA.det = 1`) trong khi vành nước thật dẹt 0,85.
6. Hồ Tinh pha 3 khi chưa có ảnh AI: cả hình (kể cả vòng hiệu ứng) bị co 0,72 → vòng hình nhỏ hơn vòng thật.

**Đã sửa:**
- Căn tâm từng khung (`can_tam`, mục 2) → tâm thân trùng tâm vòng ở cả hai hướng mặt.
- c4: cột chia đều 360° trên vòng **dẹt `G.ZK`** quanh tâm trùm; cột còn chạm sàn (≤ bán kính cột 12 ngoài mép) giữ, cột hẳn ngoài phòng bỏ — vòng không xê dịch, chỉ bị cắt phần ngoài phòng. Hình vẽ đúng danh sách cột thật (`b.an.vongLua`), có bù hệ số co.
- c5: đạn xuất phát trên vòng tròn r 14 (mọi đường bay qua tâm); tia báo trước chĩa đúng hướng 3 đợt đạn thật; bỏ vòng đạn giả trong trận. Hướng, tốc độ, sát thương giữ.
- Bỏ 7 ngọn lửa code của pha 3 khi thân là ảnh AI. Vòng sóng Ngư Tinh c5 dẹt `G.ZK` trong trận.
- Mộc Tinh c5 Rừng gai: vành khăn vốn đúng tâm, dẹt `G.ZK`, khe chia đều 90° — chỉ cần căn tâm thân.
- Ảnh hiệu ứng: đã đo tâm từng khung `hu-trum-no`, `hu-no-nho`, `hu-doi-pha`, `hu-xoay-nuoc`, `hu-gai-re`, `hu-cau-lua-ma`, `hu-cot-lua` (cột lửa lúc vùng `fxKind:'nova'` nổ) — đều đúng neo (lệch ≤ 2 điểm ảnh). `fxKind:'nova'` hiện không nơi nào đọc; vùng lửa nổ vẽ cột `hu-cot-lua` neo ở chân đúng tâm vùng.

## Tệp đã đổi

`game/js/data.js` (cờ), `game/js/boss.js`, `game/js/fx.js`, `game/js/monster_art.js`, `game/js/sprite_custom.js`, `game/build.py` (giữ `can_tam`),
9 tệp `game/art/custom/{mocTinh,nguTinh,hoTinh}{,-p2,-p3}.sprite.json` (thêm `can_tam`, ảnh giữ nguyên), `game/dist/*` + `tools/xuong-sprite/index.html` (build lại).

Kiểm: `node --check` 5 tệp JS đã sửa — đạt. `build.py` — đạt; bản hai tệp: ảnh trên máy chủ 25,67 / 26 MB (không đổi), một tệp 21,23 / 30 MB.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey.
