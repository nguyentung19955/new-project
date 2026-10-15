# Báo cáo — Nhảy dập của Nấm Phồng Chúa hay mất 1 ô độc (15/10)

Yêu cầu: `YEU-CAU.md` cùng thư mục. Nhánh `khoi-tao-du-an`, commit `14987d77`.
**Không test game bằng trình duyệt**. Chỉ chạy: mô phỏng luật game trong Node (`mo_phong.py`, `ve_xem.py`, bot cân bằng `--node`), ảnh soát tĩnh, `node --check`, `build.py`.

## 1. Nguyên nhân (nói dễ hiểu)

**Nguyên nhân chính: hai ô đè lên nhau, không phải ô bị mất.** Mỗi cú nhảy, tinh anh nhắm thẳng chỗ em bé và nhảy xa tối đa 60. Tinh anh chỉ tung chiêu khi em bé cách dưới 170, nên thường 1–2 cú là đã tới chỗ em bé. Cú còn lại cũng nhảy "tới em bé" nên đáp **đúng chỗ cũ**, ô thứ 3 đè khít lên ô thứ 2 và nhìn chỉ còn 2 ô. Khi em bé đứng sát tường thì hàm kẹp trong sàn còn dồn các ô về một chỗ.
Mô phỏng (40 lượt mỗi kịch bản): em bé đứng yên → **40/40 lượt** có ô chồng lên nhau. Em bé chạy → 31/40.

**Nguyên nhân phụ: bị đánh choáng / đông băng giữa chiêu.** Mỗi lượt (vòng báo, cú nhảy) có một hẹn giờ riêng (`G.later`). Đến giờ, hẹn giờ hỏi `song()` ("còn đang ra chiêu, không choáng?"):
- Lượt nào rơi đúng lúc đang choáng thì bị **bỏ lặng lẽ**, còn lượt sau vẫn chạy tiếp, nên mất đúng 1 ô.
- Choáng trước mốc ra đòn thì `js/mobs.js` (`cancelZones`) **xoá vòng đầu đang báo**, tức là vòng đỏ hiện ra rồi biến mất, không nổ.
- Búa có "stagger" nên mỗi nhát trúng đều làm tinh anh choáng ngắn. Vì vậy khi bị đánh, gần như lượt nào cũng thiếu ô.

**Đã loại trừ:**
- **Nổi giận ×1,3.** Báo trước có sàn 0,6 s nên vòng đầu báo lúc T + 0,2 − 0,6 ≥ 0,2 s > 0. `o.end` không bị chia tốc (≥ T + 1,15 s, sau cú nhảy 3). Mô phỏng có / không nổi giận cho kết quả giống nhau.
- **`cancel: true`.** Cờ này chỉ huỷ vùng khi tinh anh **chết** (combat.js), không phải khi choáng.
- **Ảnh `hu-no-doc`.** Chỉ là hình. Mọi vùng đều nổ đúng giờ trong luật.

## 2. Sửa (`game/js/chieu_trum.js`)

1. **Chỗ đáp luôn tách rời.** Mỗi chỗ đáp cách **mọi** chỗ đáp trước ít nhất `tach` = 44. Khoảng cách đo trên sàn, trục dọc chia G.ZK. Vòng có r 24 nên các ô chỉ chạm mép, không chồng lên nhau.
   - Em bé gần quá thì tinh anh nhảy **vượt qua** em bé cho đủ 44.
   - Bị tường kẹp mà trùng chỗ thì xoay hướng (±30°, ±60°, ±90°, ±130°, quay lại) cho tới khi tìm được chỗ đủ xa.
   - Số mới nằm trong bảng `SO.namPhongNhay.tach`.
2. **Bị choáng / đông giữa chiêu: chọn cách DỪNG HẲN và báo rõ.**
   - Có bộ canh chiêu mới `canhChieu`: một vật tự quản, được hỏi **mỗi khung**, kể cả lúc tinh anh đang choáng. Toàn bộ lịch vòng báo và cú nhảy chạy trong bộ này.
   - Khi bị choáng: không tạo ô mới, không nhảy cú mới. Trên đầu tinh anh hiện chữ **"Ngắt chiêu!"** (dùng lại chuỗi đã có bản dịch "Interrupted!") kèm chớp vàng và tiếng "hit". Chiêu kết thúc ngay khi hết choáng.
   - Vòng nào **đã hiện vẫn nổ đúng giờ** (`knGiu`: không tắt theo choáng), nên không còn vòng đỏ báo mà không nổ.
   - Đã báo đủ 3 ô và cú nhảy 3 đã bắt đầu thì không còn gì để ngắt: thân bay nốt, không hiện chữ.
   - Tinh anh chết: các vòng chưa nổ bị huỷ như mọi vùng báo khác (luật chung `cancel: true`).

## 3. Các chiêu cùng kiểu

| Chiêu | Cùng lỗi? | Xử lý |
|---|---|---|
| Phồng lăn (Cá Nóc Chúa) | **Có**, nguyên nhân 2. Vạch báo hẹn đúng lúc choáng bị bỏ. Hết choáng, thân lăn **trễ** vào đoạn chưa từng có vạch báo, hoặc vạch đã tắt từ lâu. Mô phỏng khi bị đánh: 19–37/40 lượt "lăn không báo". | Sửa: dùng chung `canhChieu`. Bị choáng thì dừng hẳn, xoá các vạch báo còn lại (đường đó không lăn nữa), hiện "Ngắt chiêu!". Sau sửa: 0 lượt lăn không báo. |
| Đổ dầu châm lửa (Hũ Chúa) | Không. Hai vệt dầu tạo cùng lúc ở mốc ra đòn, không có lượt hẹn giờ. Bị choáng trước mốc thì cả chiêu huỷ trước khi có gì hiện ra. | Giữ nguyên. Mô phỏng: lượt nào có chiêu cũng đủ 2 vệt. |
| Trùm vùng / trùm nhỏ (Nấm mẹ, Tường tinh thể…) | Không. Lịch `b.seq` vẫn chạy khi choáng, không hỏi `song()`. | Giữ nguyên. |
| Húc zíc zắc (Heo Nanh, chiêu cũ) | Không cùng nguyên nhân: không hỏi choáng nên vẫn tạo vạch khi đang choáng, không mất lượt. | Không đổi (ghi lại ở mục 6). |

## 4. Mô phỏng Node (`mo_phong.py`, 40 lượt mỗi kịch bản, trước → sau)

Cách chạy: ải 1-1, dọn quái, đặt một tinh anh cách em bé 30–160, 1/3 số lượt em bé sát tường, ép tinh anh tung chiêu rồi chạy luật từng khung.
- "Đánh" = choáng 0,2–0,5 s, lặp lại mỗi 0,3–0,9 s (giống búa stagger).
- "muộn" = lần choáng đầu đến muộn hơn, rơi vào giữa chiêu.
- Số liệu đầy đủ: `truoc.txt`, `sau.txt`.

Nấm Phồng Chúa. "Đủ" = 3 ô nổ, tâm các ô cách nhau ≥ 36 trên sàn.

| Kịch bản | Đủ 3 ô tách rời | Lượt có ô chồng | Lượt có vòng báo không nổ | Lượt báo "Ngắt chiêu!" |
|---|---|---|---|---|
| Đứng yên | 0 → **40** | 40 → 0 | 0 → 0 | 0 → 0 |
| Đứng yên, nổi giận | 0 → **40** | 40 → 0 | 0 → 0 | 0 → 0 |
| Chạy | 8 → **40** | 32 → 0 | 0 → 0 | 0 → 0 |
| Chạy, nổi giận | 9 → **40** | 31 → 0 | 0 → 0 | 0 → 0 |
| Đứng yên, bị đánh | 0 → 0 | 13 → 0 | **26 → 0** | 0 → 40 |
| Đứng yên, bị đánh muộn | 0 → 14 | 26 → 0 | 8 → 0 | 0 → 38 |
| Chạy, nổi giận, bị đánh muộn | 6 → 13 | 28 → 0 | 1 → 0 | 0 → 36 |

Sau sửa, kiểm tra trên cả 400 lượt:
- Lượt nào cũng có **đủ 3 ô, hoặc** có báo "Ngắt chiêu!".
- Không lượt nào có vùng báo bị huỷ.
- Mọi cú nhảy đáp đúng tâm một ô.
- Hai ô gần nhất cách nhau 43 (≥ 44 theo phép làm tròn toạ độ).

Cá Nóc Chúa khi bị đánh: lăn không báo 19 / 28 / 29 / 37 lượt → **0**. Không bị đánh: đủ 40/40, như trước. Cột "báo không nổ" của Cá Nóc sau sửa là các vạch bị **xoá có chủ ý** khi chiêu bị ngắt.

**Bot cân bằng** (`balance.py 40 - 0..4 --node`, ải 1-1…1-5 là vùng có Nấm Phồng Chúa): thắng 188/200 → 189/200. Mất máu mỗi ải 78% → 70% (em bé đứng yên giờ không còn ăn 2–3 ô chồng một chỗ). Lệch nằm trong nhiễu (`bal_cu.txt`, `bal_moi.txt`).

## 5. Ảnh soát tĩnh `xem-nam-nhay.png`

- 3 cặp hàng TRƯỚC / SAU: em bé đứng yên; chạy + nổi giận; bị đánh choáng giữa chiêu.
- Mỗi hàng 6 lượt. Cột trước / sau cùng hạt ngẫu nhiên nên là cùng một lượt.
- Ký hiệu: vòng đỏ đánh số = ô đã nổ; vòng xám đứt = báo mà không nổ; đường vàng = cú nhảy.
- Kết quả: hàng TRƯỚC có ô chồng nhau ("tách 0/1") và vòng xám; hàng SAU luôn "nổ 3 · tách 3", trừ các lượt có "NGẮT".
- Vẽ lại: `python3 ve_xem.py <thư mục game trước khi sửa>`. Thư mục này lấy bằng `git worktree add <tạm> 49885557`.

## 6. Đã chạy / lưu ý

- `node --check` mọi `game/js/*.js`: đạt. `python3 game/build.py`: đạt (dist cập nhật).
- Không mở trình duyệt, không chạy bài test game.
- Không đụng master. Không force push, không PR.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`: không sửa cloud.js, cloud_ui.js, firebase-config.js; mô phỏng chạy `?cloud=0`.
- Cờ `?chieucu=1` vẫn dùng chiêu cũ (Mưa bào tử…), không đổi.
- Lựa chọn khi bị ngắt: vòng đã hiện vẫn nổ dù tinh anh chưa nhảy tới, coi như bào tử rơi. Nếu muốn ngược lại (ngắt thì xoá cả vòng đang báo), sửa ở `namPhongNhay`: bỏ `knGiu: true` và thêm hàm dọn `kq` cho `canhChieu`.
- Húc zíc zắc của Heo Nanh (chiêu cũ, `js/mobs.js`) vẫn tạo vạch húc cả khi đang choáng. Lỗi này khác kiểu, chưa sửa.
- Tệp: sửa `game/js/chieu_trum.js` và `game/dist/*` (build). Thêm vào thư mục này: `mo_phong.py`, `ve_xem.py`, `xem-nam-nhay.png`, `xem-nam-nhay.json`, `truoc.txt`, `sau.txt`, `bal_cu.txt`, `bal_moi.txt`, `bao-cao.md`.
