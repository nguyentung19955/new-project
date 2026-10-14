# Báo cáo bước 1 — làm chắc nền (14/10)

Làm theo `YEU-CAU.md` cùng thư mục, đủ 7 mục, mỗi mục một commit trên nhánh `khoi-tao-du-an`.

Theo yêu cầu, **không test game**: không Playwright, không mở game. Những gì đã chạy:

- xử lý ảnh bằng Pillow, một ảnh soát tĩnh (`xem-bao-truoc.png`);
- bot cân bằng (mục 5). Bot chạy trong **Node, không trình duyệt**, xem mục 5;
- `node --check` cho mọi tệp JS (đều qua);
- `python3 game/build.py` và `python3 game/build.py --hai-tep`.

Không chạy `cloud_save_regression` vì yêu cầu không cho chạy bài kiểm. Workflow đăng web vẫn tự chạy bài này.

Đăng nhập Google, lưu mây, `?cloud=0` và `apiKey` không bị đụng tới. Bản lưu chỉ **thêm** một trường `sv.banQuang` (mục 4). Bản lưu cũ không có trường này thì game tự tạo.

Có một phiên khác đang sửa song song (kỹ năng riêng của quái vùng, chết trùm pha 3). Lúc rebase, tôi giữ thay đổi của cả hai bên:

- `ngon_ngu_en.js` bị xung đột: đã gộp tay, giữ đủ hai phần;
- `game/dist` được build lại.

## Commit và cách quay lui

| Mục | Commit | Quay lui | Cờ tắt (không cần quay lui) |
| --- | --- | --- | --- |
| 1. Dung lượng + tải theo vùng | `ce55a7b2` | `git revert ce55a7b2` | `?taivung=0` |
| 2. Lực chiến tính skill bộ | `ae2a99fe` | `git revert ae2a99fe` | `?smbo=0` |
| 3. Skill bộ lên trùm | `a54b241f` | `git revert a54b241f` | `?skillbotrum=0` |
| 4. Bà Hàng Xén bán quặng | `ea05baa8` | `git revert ea05baa8` | `?banquang=0` |
| 5. Cân bằng bằng bot | `dc30ea5e` | `git revert dc30ea5e` | — (số cũ ghi trong chú thích `data.js`) |
| 6. Chữ cũ | `ba09551b` | `git revert ba09551b` | — |
| 7. Báo trước hoạt ảnh | `c245f2e6` | `git revert c245f2e6` | `?btcu=1` (hoặc `?baoanh=0`) |

Lưu ý: sau mỗi lần revert phải chạy lại `python3 game/build.py`.

---

## 1. Dung lượng ảnh và tải theo vùng

**Thước đo** (`game/build.py`)

- Thước đo chính nay là **"người chơi tải"**. Con số này là trang chính (đã nén) cộng với từng ảnh mà máy người chơi thực sự tải: bản WebP nếu trình duyệt đọc được, không thì bản PNG.
- Trần cho số này là **20 MB**, theo quyết định Q5.
- Tổng dung lượng trên máy chủ (PNG + WebP) nay chỉ in ra để biết. Quá 60 MB thì có dòng cảnh báo.
- Mỗi lần build in thêm một bảng dung lượng theo nhóm tải.

**Tải theo vùng** (`game/build.py`, `js/sprite_custom.js`, `js/village.js`, `js/luu_luot.js`)

- Ảnh chỉ dùng ở một vùng được đánh dấu riêng (trường `_u[4]`): quái, trùm và dáng pha, sàn và tường `gd-nen-*`, cửa `gd-cua-*`, vật trang trí `gd-tt-*` của Rừng già, Hang biển, Lâu đài cổ.
- Màn chào không tải các ảnh này nữa.
- Khi chọn một ải trên bản đồ, game bắt đầu tải ảnh của vùng đó.
  - Thẻ ải hiện nút **"Đang tải…"** kèm thanh tiến độ.
  - Bấm vào lúc chưa tải xong thì sang màn chờ "Đang tải ảnh <vùng>" (có nút Về làng). Đủ ảnh thì game tự vào ải.
  - Màn chờ này cũng áp dụng cho nút "Ải tiếp theo", ải ngày và "Chơi tiếp ải".
- Ải 1–4 không chờ ảnh trùm vùng. Ải trùm thì chờ đủ cả ảnh trùm.
- Tải hỏng thì màn chờ có nút **Thử lại**. Game không vẽ hình code thay cho ảnh, đúng luật `vu-khi-cu-con-sot`.
- Tải xong vùng đang chọn mà máy rảnh thì game tải trước vùng kế tiếp (ở mức ưu tiên thấp).
- Ảnh lõi (Zed, giao diện, làng, hiệu ứng chung) vẫn tải như cũ.
- Chỗ nào ở làng cần vẽ một ảnh vùng ngay (ví dụ quái ở trang Ông Từ) thì ảnh đó vẫn được tải ngay.

**Bảng dung lượng** (đo bằng `build.py --hai-tep`)

| Nhóm | Trước | Sau |
| --- | --- | --- |
| Tải ngay ở màn chào | 1,21 MB ảnh | 0,99 MB ảnh |
| Tải sau màn chào, chưa vào ải | toàn bộ phần còn lại (10,6 MB) | chỉ phần lõi còn lại: lõi tổng 3,82 MB (323 ảnh) |
| Vùng Rừng già | tải nền cùng lúc | 2,68 MB (46 ảnh), khi chọn vùng |
| Vùng Hang biển | tải nền cùng lúc | 2,39 MB (46 ảnh) |
| Vùng Lâu đài cổ | tải nền cùng lúc | 2,97 MB (46 ảnh) |
| **Người chơi tải** (trang nén + ảnh, WebP) | 12,72 MB (lúc đó chưa đo) | **12,75 MB / trần 20 MB** |
| Trình duyệt không đọc được WebP | 14,69 MB | 14,72 MB |
| Tải trước khi vào vùng đầu | 12,72 MB | **4,72 MB** |
| Tổng trên máy chủ (chỉ để biết) | 25,67 / trần 26 MB (chặn oan) | 25,66 MB, cảnh báo khi quá 60 MB |

Còn khoảng 7,2 MB tới trần 20 MB cho các đợt quái mới.

---

## 2. Sức mạnh và Lực chiến tính skill bộ đồ

- Thêm hàm `G.boSk.quyDoi(P)` (`js/bo_skill.js`): mỗi skill bộ **đã mở** của bộ **đang mặc** được quy thành một hệ số nhân vào phần đòn hoặc phần máu hữu hiệu.
- Hệ số tính thẳng từ số trong `G.SKILL_BO`, nên đổi số skill thì quy đổi tự đổi theo.
- Hai chỗ dùng chung hệ số này: `G.powerParts` (`js/combat.js`) và `G.lucChienParts` (`js/luc_chien.js`).
- Sức mạnh bằng 3·√(đòn × máu), nên Sức mạnh tăng đúng √(hệ số).
- `G.STAGE_REC` (sức mạnh khuyên dùng) không đổi vì phần này.

Cách quy đổi:

| Skill | Quy ra | Công thức (số hiện tại) |
| --- | --- | --- |
| Bóng lướt | đòn | 1 + 0,1 × thêm (×1,03) |
| Phân thân | máu | 1 + 0,25 × giây/hồi (×1,094) |
| Ám sát | đòn | 1 + 0,2 / hồi (×1,05) |
| Nhựa rừng | máu | 1 + 4 × hồi (×1,04) |
| Gai độc | đòn | 1 + 0,04 × sát thương (×1,02) |
| Bẫy dây leo | máu | 1 + 0,025 × giây (×1,0375) |
| Khiên nước | máu | 1 + 3 × tối đa × 10/hồi (×1,20; bot đợt 5 đo khiên ăn ~25–30% sát thương) |
| Sóng dội | máu | 1 + bán kính/1000 (×1,04) |
| Thuỷ triều | máu | 1 + (1 − chậm) × giây × 0,03 (×1,03) |
| Giáp bạc | máu | 1 / (1 − giảm) (×1,111) |
| Phản đòn | đòn | 1 + phản × cửa sổ × 0,2 (×1,02) |
| Khí thế | đòn | 1 + thêm × 0,25 (×1,0625) |

Sức mạnh tăng theo cấp bộ:

| Bộ | Cấp 1 | Cấp 2 | Cấp 3 |
| --- | --- | --- | --- |
| Ninja | ×1,015 | ×1,061 | ×1,088 |
| Rừng | ×1,020 | ×1,030 | ×1,049 |
| Biển | ×1,095 | ×1,117 | ×1,134 |
| Lâu đài | ×1,054 | ×1,065 | ×1,097 |

---

## 3. Skill bộ đồ tác dụng lên trùm

Sửa ở `js/boss.js`, `js/bo_skill.js`, và số mới trong `G.SKILL_BO` (`data.js`).

- **Thuỷ triều**: trùm nhỏ và trùm vùng nay cũng chậm lại, nhưng chỉ 50% hiệu lực (số `trum: 0.5`).
  - Hệ số = 1 − 0,5 × (1 − 0,5) = **0,75**.
  - Áp vào cả tốc đi lẫn nhịp hồi giữa hai chiêu. Quái thường vẫn chậm còn 0,5.
- **Phân thân**: mỗi lần trùm **chọn chiêu mới** mà đang có bóng, có **30%** (số `trum: 0.3`) chiêu đó nhắm vào bóng.
  - Chiêu đang ra không bị đổi.

Kiểm lại các skill bộ khác:

| Skill | Lên trùm | Ghi chú |
| --- | --- | --- |
| Bóng lướt, Ám sát, Khí thế | có | `K.danh` không loại trùm (trùm có hướng mặt) |
| Gai độc, Phản đòn | có | nguồn đòn là trùm vẫn tính |
| Bẫy dây leo | có, 40% thời gian | đã có số `trum: 0.4` từ trước |
| Sóng dội | **không** | giữ: đẩy thân trùm làm lệch vùng chiêu đã báo, có lý do |
| Thuỷ triều, Phân thân | nay có | như trên |
| Nhựa rừng, Khiên nước, Giáp bạc | không liên quan | chỉ tác dụng lên Zed |

---

## 4. Bà Hàng Xén bán quặng

Sửa ở `js/data.js` (`G.BAN_QUANG`), `js/upgrade.js` (`U.bqCon`, `U.bqDuoc`, `U.bqMua`), `js/village.js`.

- Thêm thẻ **"Quặng"** cạnh thẻ Nguyên liệu, cùng kiểu bảng: dòng giải thích, ô "Quặng · Đang có N", nút **Mua 1 (40)** và **Mua 5 (200)**.
- Giá **40 vàng một quặng**. Thương nhân trong ải bán 3 quặng 100 vàng, tức khoảng 33 vàng một quặng, nên giá này cao hơn một chút.
  - Bảng `G.DOI_NL` (150 vàng) là giá một nguyên liệu vùng, không phải quặng.
- Mỗi ngày mua tối đa **15 quặng**, tính theo ngày trên máy, đổi ngày lúc 0 giờ. Một ải thắng cho 4–12 quặng, nên mua không thay được việc cày.
- Chỉnh lùi giờ máy không làm hồi lượt mua (cách chống giống ải ngày).
- Bản lưu thêm trường `sv.banQuang = { cuoi, n }`.
- Bản tiếng Anh: thêm 9 dòng vào `ngon_ngu_en.js` và `tools/ngon-ngu/tu-dien/lang.json`.

---

## 5. Cân bằng chưa đo

### Bot chạy không cần trình duyệt

Mới thêm `game/tests/node_trang.js`:

- Nạp mã game theo đúng thứ tự trong `index.html` vào một máy ảo của Node, với DOM và canvas giả: lệnh vẽ nào cũng bỏ qua, không mạng, chạy như `?cloud=0`.
- Sau đó nạp `bot.js`, `setup.js`, `bot_nang.js` y như trang thật.
- `cd_lib.py` có lớp `NodePage` gọi giống trang Playwright. Thêm cờ `--node` cho `cay.py`, `campaign.py`, `balance.py`, nên luật bot không phải viết lại.
- Một lượt chiến dịch 15 ải chạy khoảng 15 giây.

### Bot biết thêm những gì (`bot_nang.js`, `cd_lib.py`, `cay.py`)

- **Ép đồ**: ép món chính trước, món phụ đi sau và thấp hơn 1 bậc. Bậc có thể tụt (từ Vàng trở lên) chỉ ép khi có bùa giữ bậc hoặc dư đá gấp đôi giá. Bot ép trước khi mài.
- **Ải ngày**: dùng ngày giả, cứ 8 lượt ải thường là sang một ngày. Mỗi ngày bot chơi mọi ải ngày đang mở, ở mức cao nhất đã mở, cho tới khi hết lượt.
- **Chọn món chính**: `--vk=thuong` hoặc `--vk=bua`; món phụ luôn là phi tiêu.
- **Độ khó 2**: `--kho2` chơi tiếp 15 ải độ khó 2. Đi kèm `--kd` thì đo luôn khuyên dùng độ khó 2.
- **Bản lưu cho balance.py**: `--luu=tệp` ghi bản lưu dùng cho `balance.py`.
- Trong `cay.py`, luật "trần trước Hồ Tinh" nay tính cả hai món bậc ép Vàng: 657 ≥ 1,15 × 520.
- `cay.py` bỏ các kết quả hồi quy vọt ra ngoài khoảng đo, ghi là "> X".

### Số đo khuyên dùng độ khó 1

Lệnh: `cay.py 6 khuyen --kd=4 --node`. Chạy sau khi đã gộp kỹ năng riêng của quái vùng của phiên kia.

| Ải | 2-2 | 2-3 | 2-4 | 2-5 | 3-1 | 3-2 | 3-3 | 3-4 | 3-5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sức mạnh bot thắng 75% | 217 | 262 | 275 | 306 | 350* | 360 | 414 | > 418 | 524 |
| Khuyên dùng cũ | 185 | 220 | 240 | 275 | 285 | 315 | 355 | 400 | 435 |
| Lệch | +17% | +19% | +15% | +11% | (+23%) | +14% | +17% | > +5% | +20% |
| **Khuyên dùng mới** | **215** | **260** | **275** | **305** | **310** | **330** | **410** | **420** | **520** |

- Ải 1-x và 2-1 lệch dưới 15% nên giữ nguyên.
- (*) Ở 3-1 bot thường thắng ngay lần đầu, nên chỉ nâng vừa đủ để dãy số vẫn tăng dần.
- Các ải lệch dưới 15% (2-4, 2-5, 3-1, 3-2, 3-4) chỉ được nâng để dãy khuyên dùng vẫn tăng dần.

### Độ khó 2

Lệnh: `--kho2 --kd=4`. Để thấy được chỗ thắng và chỗ thua, bot lấy cả bản lưu ở mọi mốc có Sức mạnh gần khuyên dùng độ khó 2.

- Vùng 1: khớp. Số đo 208–283, khuyên dùng 215–270.
- Vùng 2 và 3: cần khoảng 1,5 và 1,33 lần Sức mạnh của ải thường cùng chỗ, trong khi công thức cũ cho 1,30 và 1,12. Lệch hơn 15%.
- Đã thêm `G.DIFF2_REC = [null, 1.5, 1.33]`: hệ số riêng chỉ cho **con số khuyên dùng** độ khó 2. Quái độ khó 2 (`G.DIFF2`) giữ nguyên.

### Chiến dịch (3 lượt mỗi loại, bản đã chỉnh số)

| Món chính | Lần chơi để đi hết 15 ải | Thời gian | Ải nặng nhất |
| --- | --- | --- | --- |
| Kiếm | 47 | 3,5 giờ | 2-5 Ngư Tinh: 11 lần ✗ (thua 3,7 lần dù Sức mạnh 349 > 305) |
| Thương | 40 | 3,0 giờ | 1-5: 6,3 lần |
| Búa | 39 | 2,9 giờ | 2-5: 5,3 lần |

Kiếm mà không ải ngày (lượt đo trước): 43 lần, 3,2 giờ.

- Ải ngày, tính trung bình mỗi lượt chiến dịch: khoảng 20 lượt, thắng 100%, được khoảng 4.400 vàng, 100 quặng, 14–28 đá nâng bậc.
- `balance.py 4 --node` với `cay_luu.json` mới: thắng **40/60 (67%)**, đạt ngưỡng 60%. Vùng 2 ở Sức mạnh sát khuyên dùng chỉ thắng 1–2/4.

### Cập nhật khác

- `tests/cay_luu.json` dựng lại từ bot mới.
- `tools/can-bang/tinh.js` nay tính cả ép đồ (đá rơi từ trùm, giá kỳ vọng), ải ngày, mua quặng và skill bộ trong Sức mạnh.
- Mô hình mới có dòng "So luật cũ" để so: luật mới cần 31 lượt cho 15 ải, luật cũ 40 lượt.

---

## 6. Chữ cũ

**`G.HINTS`**

- Bỏ các câu: "nhận dấu ấn", "đủ 60 dấu ấn khóa nhánh", "dấu ấn thừa đổi nguyên liệu".
- Thay bằng: linh khí vào túi chung; 4 vũ khí; Trắng → Mầm → Thành hình → Thức tỉnh; bộ đồ có skill bộ; mua quặng.
- Nội tại của Cu Tí đổi thành "Nhận linh khí nhanh hơn 20%".

**Cụ Đồ (trang hướng dẫn)**

- Trang "Dấu ấn" đổi thành "Linh khí".
- Bỏ trang vẽ hình "dấu ấn hệ của vũ khí". Mã `LK.guide` vẫn còn trong tệp nhưng không trang nào dùng.
- Trang "Đặc trưng hệ theo cấp" viết theo luật mới.

**Thẻ Tài nguyên**: dòng vàng và quặng thêm ép đồ, mua quặng, Ải Vàng và Ải Đá Mài.

**Ngoài danh sách nhưng cùng loại câu cũ**, cũng đã sửa:

- màn Xem vũ khí (dòng "Trắng");
- mẹo ở ải đầu;
- bàn thờ lời nguyền: "dấu ấn" đổi thành "linh khí".

**README** (gốc và `game/README.md`)

- Bỏ: bốn bậc màu, đồ rơi vũ khí và quần áo, trang phục 5 ô, rương vũ khí, "hai vũ khí", cung và giáo.
- Viết thêm: Linh khí, Thưởng trên sàn, Bộ đồ của Zed, Ép đồ 7 bậc và Ải ngày.
- Sửa bảng người làng và bảng tệp, thêm lệnh chạy bot `--node`.

**Tiếng Anh**: sửa ở cả `ngon_ngu_en.js` lẫn `tools/ngon-ngu/tu-dien/` (`du-lieu`, `lang`, `ai`, `tui`). Không chạy lại `gop.py` vì hai nơi vốn đã lệch nhau từ trước.

---

## 7. Báo trước bằng hoạt ảnh

- Mới thêm `cong-cu/do_hinh_bt.py` và `cong-cu/dung-bt-dong.py`. Chúng dựng lại `game/art/custom/gd-bt-{tron,vanh,quat,dai}.sprite.json` từ ảnh gốc `docs/anh-goc/bao-truoc`. YEU-CAU cho phép thay ảnh; bản cũ còn trong git.

**Cắt theo hình**

- Công cụ đo tâm vòng, đỉnh quạt và tâm dải **thật** của từng khung.
- Bản cũ coi tâm khung nằm đều 271,5 điểm ảnh một khung. Vì vậy vành khuyên lệch tới **13,7 điểm ảnh gốc** (khoảng 7 điểm ảnh ra), quạt lệch đỉnh tới 11,5.
- Mỗi điểm ảnh được tính cho khung có tâm gần nhất, không lấn sang khung bên.

**Căn tâm từng khung** (cách của trum-chet-pha3)

- Dời từng khung cho tâm hoặc đỉnh nằm đúng điểm neo.
- Co từng khung cho viền ngoài đúng bán kính vùng, nên 8 khung cùng một mép và vòng không phình theo quầng sáng.
- Khung 8 có gai và tia sáng làm lệch phép đo, nên dùng tâm và tỉ lệ của khung 7.

**Thời gian và cách vẽ** (`js/bao_truoc.js`)

- Khung 1–7 chia đều toàn bộ thời gian báo trước. Khung 8 (chớp nổ) bắt đầu đúng lúc đòn nổ rồi mờ dần.
- Vùng nào không có `t0` vẫn kéo giãn theo thời gian còn lại.
- Ảnh co giãn và xoay theo vùng thật như trước: tròn dẹt `G.ZK`, vành dời bán kính cho vừa r0..r1, quạt chia lát theo góc mở, dải theo dài và rộng. Màu nhuộm theo hệ.
- **Không còn hình vẽ bằng code khi đã có ảnh.** Tường nước (Sóng thần) và đường ngắm trước đây vẫn vẽ code, nay cũng vẽ bằng ảnh dải.
- Thiếu ảnh thì mới vẽ kiểu cũ để không mất báo trước.
- Cờ `?btcu=1` xem lại kiểu cũ.

**Ảnh soát `xem-bao-truoc.png`**

- 4 hình × 8 khung, có chữ thập xanh ở điểm neo và vòng xanh ở bán kính R.
- 4 ví dụ chồng lên vùng thật (vẽ to ×3): tròn r 40, vành 24–40, quạt 88° xoay 30°, dải 120 × 24 xoay −20°. Đường xanh là mép vùng sát thương.

---

## Rủi ro còn lại, việc chưa làm

- **Chưa xem trong game thật** vì không được mở game. Nên xem bằng mắt:
  - thẻ ải lúc "Đang tải…" và màn chờ tải vùng (nhất là trên iPhone mạng chậm);
  - thẻ Quặng của Bà Hàng Xén;
  - vòng báo trước mới, nhất là Sóng thần và đường ngắm bằng ảnh dải;
  - trùm chậm khi Khiên nước vỡ (Thuỷ triều).
- **Màn chờ tải vùng**: nếu mạng hỏng hẳn thì phải bấm Thử lại. Không có lối "vào luôn bằng hình code", vì luật cấm vẽ hình code thay ảnh.
- **Ngư Tinh (2-5) với Kiếm**: bot vẫn phải chơi khoảng 11 lần, kể cả khi Sức mạnh cao hơn khuyên dùng. Đây là độ khó của chính trận trùm (`G.STAGE_K.boss[9]`), nâng khuyên dùng không gỡ được. Tôi chưa đổi số trùm, xem câu hỏi bên dưới.
- **Khuyên dùng vừa đo xong khi phiên kia mới gộp kỹ năng quái vùng.** Nếu phiên đó chỉnh lại sức quái thì nên chạy lại: `python3 game/tests/cay.py 6 khuyen --kd=4 --node`.
- `cloud_save_regression` không chạy ở phiên này. Bản lưu chỉ thêm trường mới và không đổi trường cũ.

## Quyết định mới cần chủ dự án duyệt

1. Khuyên dùng mới cho vùng 2–3 và hệ số `G.DIFF2_REC` (mục 5). Có thể giữ, hoặc quay về số cũ ghi trong chú thích.
2. Độ khó 2 **dễ so với tiến trình**: người chơi vừa xong 15 ải đã có khoảng 550 Sức mạnh, nên qua mọi ải độ khó 2 ngay lần đầu. Chỉ K2 3-5 thì thua 1 lần. Có muốn tăng `G.DIFF2` (máu, sát thương quái độ khó 2) không?
3. Có muốn làm Ngư Tinh dễ hơn một chút cho người dùng Kiếm không?
4. Giá quặng 40 vàng và 15 quặng mỗi ngày có hợp ý không?
